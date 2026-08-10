#!/usr/bin/env bash
#
# merge-master-to-main.sh
#
# Merges master into main while keeping master-only paths off main.
# This is the local mirror of .github/workflows/merge-master-to-main.yml so the
# exact same result can be reproduced from the terminal.
#
# Master-only paths (never merged into main):
#   .github  .husky  .kilo  .vscode  docs  path/to
#   pos-backend/init.sql  pos-backend/reset-migration.js
#   pos-backend/run-sql-seed.js  pos-backend/seed-products.sql
#
# Usage:  ./scripts/merge-master-to-main.sh
#
set -euo pipefail

MASTER_ONLY_PATHS=(
  .github
  .husky
  .kilo
  .vscode
  docs
  path/to
  pos-backend/init.sql
  pos-backend/reset-migration.js
  pos-backend/run-sql-seed.js
  pos-backend/seed-products.sql
)

# Backing driver for the `merge=ours` attribute in .gitattributes
git config merge.ours.driver true

# 1. Refresh branches
git fetch origin main master

# 2. Switch to main and pull the latest
git checkout main
git pull origin main

# 3. Merge master in (always a merge commit). Protected paths that exist on
#    both branches keep main's version thanks to the merge=ours driver.
git merge --no-ff -m "Merge branch 'master' into main" origin/master

# 4. Drop master-only paths. merge=ours cannot drop files that were ADDED on
#    master (the merge just adds them), so remove the whole list explicitly.
git rm -r -f --ignore-unmatch "${MASTER_ONLY_PATHS[@]}"

# 5. Commit the cleanup only if something actually changed
if git diff --cached --quiet; then
  echo "No master-only paths present on main - nothing to clean up."
else
  git commit -m "Remove master-only paths from main"
fi

# 6. Push. --no-verify bypasses the .husky pre-push hook, which blocks ALL
#    direct pushes to main by design. This script is the sanctioned path.
git push --no-verify origin main

echo "Done: main now carries master's changes minus the master-only paths."
