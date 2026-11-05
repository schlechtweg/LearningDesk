#!/usr/bin/env bash
# Build standalone HTML documents (doctype, charset, viewport) for every app in the repo root.
# The apps are written without document skeleton for Claude artifacts;
# the files in docs/ can be opened directly in any browser or served via GitHub Pages.
# Format of each entry: <app file name without .html>:<grade page in docs/>
set -euo pipefail
cd "$(dirname "$0")/.."
APPS=(
  "osmose:klasse-11.html"
  "ableiten:klasse-11.html"
  "natrium-kalium-pumpe:klasse-11.html"
  "binomische-formeln:klasse-8.html"
  "bruchterme:klasse-8.html"
  "classpad:index.html"
)
# the calculator simulator needs its maths library next to the page
mkdir -p docs/vendor
cp vendor/algebrite.js vendor/algebrite-LICENSE.txt docs/vendor/
for entry in "${APPS[@]}"; do
  app="${entry%%:*}"; back="${entry##*:}"
  {
    printf '<!doctype html>\n<html lang="de">\n<head>\n<meta charset="utf-8">\n'
    printf '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'
    printf '<style>body{margin:0}img{max-width:100%%}[hidden]{display:none!important}</style>\n'
    printf '</head>\n<body>\n'
    cat "$app.html"
    printf '\n<p style="text-align:center;margin-top:32px"><a href="%s" style="color:inherit">← Zurück zur Themenübersicht</a></p>\n' "$back"
    printf '</body>\n</html>\n'
  } > "docs/$app.html"
  echo "Wrote docs/$app.html"
done
