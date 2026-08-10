#!/usr/bin/env bash
#
# docs-consistency.sh
#
# Verifies that the master-only path list documented in README.md matches the
# MASTER_ONLY_PATHS used by .github/workflows/merge-master-to-main.yml, so the
# documentation can never drift from what CI actually enforces.
#
# Usage: bash .github/scripts/docs-consistency.sh   (run from the repo root)
#
set -euo pipefail

# Normalize CRLF -> LF so the script behaves identically on Windows and Linux.
l() { tr -d '\r' < "$1"; }

# 1) Source of truth: the MASTER_ONLY_PATHS folded scalar in the merge workflow.
wf_paths=$(
  l .github/workflows/merge-master-to-main.yml \
    | awk '/MASTER_ONLY_PATHS: >-/{f=1; next}
           f && /^        [^ ]/{sub(/^        /, ""); print; next}
           f{exit}'
)

# 2) README .gitattributes block (the "<path> merge=ours" lines).
ga_paths=$(
  l README.md | grep ' merge=ours$' | awk '{print $1}'
)

# 3) README "Master-only paths" table (Path column; multi-value cells split on
#    '·' and ','). Header row is excluded (cells are backticked, header is not).
tbl_paths=$(
  l README.md \
    | awk '/^### Master-only paths/{f=1; next} f && /^### /{exit} f{print}' \
    | grep '^| `' \
    | sed -E 's/^\| `//; s/` \|.*$//; s/·/ /g; s/,/ /g; s/`//g' \
    | tr ' ' '\n' \
    | grep -v '^$'
)

norm() { printf '%s\n' "$1" | sed 's/[[:space:]]*$//' | sort -u; }

w=$(norm "$wf_paths")
g=$(norm "$ga_paths")
t=$(norm "$tbl_paths")

fail=0
[ "$w" = "$g" ] || { echo "::error::README .gitattributes block != workflow MASTER_ONLY_PATHS"; fail=1; }
[ "$w" = "$t" ] || { echo "::error::README master-only paths table != workflow MASTER_ONLY_PATHS"; fail=1; }

if [ "$fail" -ne 0 ]; then
  echo '--- workflow MASTER_ONLY_PATHS ---'; echo "$w"
  echo '--- README .gitattributes block ---'; echo "$g"
  echo '--- README table ---'; echo "$t"
  exit 1
fi

count=$(echo "$w" | wc -l | tr -d ' ')
echo "PASS: README documents match the workflow MASTER_ONLY_PATHS ($count paths)."
