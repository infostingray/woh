#!/usr/bin/env bash
# Builds every page with a version stamp, then commits and pushes. Run from repo root.
set -e
N=$(( $(git rev-list --count HEAD 2>/dev/null || echo 0) + 1 ))
export WOH_VERSION="v$N · $(date -u +%d.%m.%y)"
python3 tools/build_houses.py >/dev/null && python3 tools/build_pages.py >/dev/null && python3 tools/build_home.py >/dev/null
git add -A && git commit -qm "${1:-Update} ($WOH_VERSION)" && git push -q origin main
echo "Pushed $WOH_VERSION"
