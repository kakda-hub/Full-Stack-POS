# Repository Safety Rules

## Active Branch Policy

- Always keep all current changes, code generations, and commits on the `master` branch (or a designated feature branch).
- Do **NOT** checkout `main`.
- Do **NOT** attempt to push code directly to `main`.
- Branch from `master`, push to your feature branch, and merge via Pull Request.

## Enforcement

- `.husky/pre-push` — rejects pushes made from or targeting `main` (installed via `core.hooksPath`).
- `.github/workflows/branch-check.yml` — fails any workflow run triggered by a push to `main`.
- `.kilo/config.json` — pins the Kilo default branch to `master` and marks `main` as protected.
