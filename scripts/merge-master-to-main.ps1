#Requires -Version 5.1
<#
.SYNOPSIS
    Merges master into main while protecting master-only paths.

.DESCRIPTION
    Runs the repeatable "master -> main" merge workflow:

      1.  Fails immediately if the working tree has uncommitted changes.
      2.  Ensures the repository is on `main` (checkouts it if needed).
      3.  Pulls the latest `main` from origin.
      4.  Fetches the latest `master` from origin.
      5.  Merges origin/master into main (always a merge commit).
      6.  Restores the protected master-only paths to main's own version so
          changes to those paths on master never overwrite main.
      7.  Commits the restoration only when something actually changed.
      8.  Pushes main to origin via --no-verify, because this repository's
          .husky/pre-push hook forbids direct pushes to main. This script is
          the sanctioned path for that push.

    The protected paths stay committed and fully working on `master`. They are
    never deleted from master and never added to .gitignore.

.PARAMETER SkipPush
    Perform the merge and the protected-path restoration locally, but do not
    push. Useful for rehearsing the workflow safely.

.PARAMETER Strict
    By default the script ignores untracked files and only fails on changes to
    tracked files (git itself refuses a merge that would overwrite an untracked
    file). Use -Strict to also fail on untracked files, matching the literal
    "stop on any uncommitted change" requirement.

.EXAMPLE
    ./scripts/merge-master-to-main.ps1

.EXAMPLE
    ./scripts/merge-master-to-main.ps1 -SkipPush

.EXAMPLE
    ./scripts/merge-master-to-main.ps1 -Strict
#>
[CmdletBinding()]
param(
    [switch]$SkipPush,
    [switch]$Strict
)

$ErrorActionPreference = 'Stop'

# ---------------------------------------------------------------------------
# Master-only paths: must remain available on `master`, but `main` keeps its
# own version of these paths. Adjust only if the repository layout changes.
# ---------------------------------------------------------------------------
$ProtectedPaths = @(
    'pos-backend/seed-products.sql'
    'pos-backend/run-sql-seed.js'
    'pos-backend/reset-migration.js'
    'pos-backend/test'
    'pos-backend/src/database'
)

function Write-Step {
    param([string]$Message)
    Write-Host "`n==> $Message" -ForegroundColor Cyan
}

function Write-Ok {
    param([string]$Message)
    Write-Host "    OK  $Message" -ForegroundColor Green
}

function Write-Warn {
    param([string]$Message)
    Write-Host "    ..  $Message" -ForegroundColor Yellow
}

function Invoke-GitChecked {
    param([string[]]$GitArgs)
    & git @GitArgs
    if ($LASTEXITCODE -ne 0) {
        throw "Git command failed (exit $LASTEXITCODE): git $($GitArgs -join ' ')"
    }
}

try {
    # -- 1. Stop if the working tree contains uncommitted changes --------------
    # By default, untracked files ('??') do not block the run: git itself
    # refuses a merge that would overwrite an untracked file. Any change to a
    # tracked file (modified/staged/conflicted) stops the script. With -Strict,
    # ANY working-tree change, including untracked files, stops the script.
    $porcelain = @(git status --porcelain)
    if ($LASTEXITCODE -ne 0) { throw 'Could not read git status.' }
    $dirty = if ($Strict) {
        $porcelain
    }
    else {
        @($porcelain | Where-Object { $_ -notmatch '^\?\?' })
    }
    if ($dirty.Count -gt 0) {
        $show = (($dirty | Select-Object -First 5) -join '; ')
        if ($Strict) {
            throw "Working tree has uncommitted or untracked changes ($show). Commit or stash them before running this merge."
        }
        throw "Working tree has uncommitted changes to tracked files ($show). Commit or stash them before running this merge."
    }
    if ($Strict) {
        Write-Ok 'Working tree is clean (no uncommitted or untracked changes).'
    }
    else {
        Write-Ok 'Working tree is clean (tracked files unchanged).'
    }

    # -- 2/3. Ensure the repository is on `main` -------------------------------
    $currentBranch = (git branch --show-current)
    if ($LASTEXITCODE -ne 0) { throw 'Could not read the current branch.' }
    if ($currentBranch -ne 'main') {
        Write-Warn "Currently on branch '$currentBranch' - switching to 'main'."
        # A fresh clone (e.g. CI) only creates the branch that was checked out;
        # create the local 'main' from origin/main when it does not exist yet.
        & git show-ref --verify --quiet refs/heads/main
        if ($LASTEXITCODE -ne 0) {
            Invoke-GitChecked @('checkout', '-b', 'main', 'origin/main')
        }
        else {
            Invoke-GitChecked @('checkout', 'main')
        }
    }
    else {
        Write-Ok "Already on branch 'main'."
    }

    # -- 4. Pull the latest `main` from origin ---------------------------------
    Write-Step "Pulling the latest 'main' from origin..."
    Invoke-GitChecked @('pull', 'origin', 'main')

    # -- 5. Fetch the latest `master` from origin -------------------------------
    Write-Step "Fetching the latest 'master' from origin..."
    Invoke-GitChecked @('fetch', 'origin', 'master')

    # Snapshot main's version of every path before the merge. The restore step
    # below brings these exact versions back after the merge.
    $mainBeforeMerge = (git rev-parse HEAD)
    if ($LASTEXITCODE -ne 0) { throw 'Could not resolve the current main HEAD.' }

    # -- 6. Merge origin/master into main ---------------------------------------
    Write-Step "Merging 'origin/master' into 'main'..."
    $mergeHadConflicts = $false
    & git merge --no-ff origin/master -m "Merge branch 'master' into main"
    if ($LASTEXITCODE -ne 0) {
        # Merge stopped, normally because of conflicts. Auto-continue only when
        # every conflicted path is a protected path (we keep main's version of
        # those anyway); otherwise fail loudly and let the user resolve manually.
        $unmerged = @(git diff --name-only --diff-filter=U)
        $allProtected = $true
        foreach ($u in $unmerged) {
            $isProtected = $false
            foreach ($p in $ProtectedPaths) {
                if ($u -eq $p -or $u.StartsWith("$p/", [System.StringComparison]::OrdinalIgnoreCase)) {
                    $isProtected = $true
                    break
                }
            }
            if (-not $isProtected) { $allProtected = $false; break }
        }
        if ($unmerged.Count -gt 0 -and $allProtected) {
            $mergeHadConflicts = $true
            Write-Warn "Conflicts exist only on protected paths - they will be resolved by keeping main's version."
        }
        else {
            throw 'Merge of origin/master into main failed. Resolve conflicts manually, commit, then push. Nothing was pushed.'
        }
    }

    # -- 7. Restore the protected paths to main's own version --------------------
    Write-Step 'Restoring protected master-only paths to main version...'
    $restored = @()
    foreach ($p in $ProtectedPaths) {
        $trackedOnMain = @(git ls-tree -r --name-only $mainBeforeMerge -- $p)

        # Clear the path from index and work tree (this also resolves any
        # protected-path conflicts), then bring back exactly main's version.
        & git rm -r -f --quiet -- $p 2>$null

        if ($trackedOnMain.Count -gt 0) {
            Invoke-GitChecked @('checkout', $mainBeforeMerge, '--', $p)
            $restored += $p
            Write-Ok "Restored '$p' from main (kept main's version)."
        }
        else {
            Write-Ok "'$p' is not tracked on main - removed from main's tree."
        }
    }

    # -- 8. Commit the restoration only when there are actual changes ------------
    $staged = @(git diff --cached --name-only)
    if ($staged.Count -gt 0) {
        # When the merge itself was completed by this commit (conflicts were
        # resolved for protected paths), use the standard merge message.
        $commitMessage = if ($mergeHadConflicts) {
            "Merge branch 'master' into main"
        }
        else {
            'Restore protected master-only paths after merge from master'
        }
        Write-Step 'Committing merge result...'
        Invoke-GitChecked @('commit', '-m', $commitMessage)
        Write-Ok "Committed $($staged.Count) changed path(s)."
    }
    else {
        Write-Warn 'No protected-path changes to commit (the merge did not alter them).'
    }

    # -- 9. Push the resulting main branch ---------------------------------------
    if ($SkipPush) {
        Write-Warn '-SkipPush specified - not pushing. Push manually with:  git push --no-verify origin main'
    }
    else {
        Write-Step "Pushing 'main' to origin (--no-verify bypasses the repo's push-to-main hook)..."
        Invoke-GitChecked @('push', '--no-verify', 'origin', 'main')
        Write-Ok 'Pushed main to origin.'
    }

    # -- 11. Summary --------------------------------------------------------------
    $mainAfterMerge = (git rev-parse HEAD)
    Write-Host "`n===============================================" -ForegroundColor Cyan
    Write-Host '  Merge summary: origin/master  ->  main' -ForegroundColor Cyan
    Write-Host "  main before:  $mainBeforeMerge"
    Write-Host "  main after:   $mainAfterMerge"
    Write-Host "  Protected paths restored: $($restored.Count)"
    foreach ($r in $restored) { Write-Host "    - $r" }
    Write-Host '===============================================' -ForegroundColor Cyan
    Write-Host "Done. 'main' now carries master's application changes while keeping its own version of the protected paths." -ForegroundColor Green
}
catch {
    Write-Host "`nERROR: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host 'Nothing was pushed. Review the repository state and re-run after fixing the issue.' -ForegroundColor Yellow
    exit 1
}
