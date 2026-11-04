#!/usr/bin/env bash
# Build standalone HTML documents (doctype, charset, viewport) for every app in the repo root.
# The apps are written without document skeleton for Claude artifacts;
# the files in docs/ can be opened directly in any browser or served via GitHub Pages.
set -euo pipefail
cd "$(dirname "$0")/.."
for app in osmose ableiten natrium-kalium-pumpe; do
  {
    printf '<!doctype html>\n<html lang="de">\n<head>\n<meta charset="utf-8">\n'
    printf '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'
    printf '<style>body{margin:0}img{max-width:100%%}[hidden]{display:none!important}</style>\n'
    printf '</head>\n<body>\n'
    cat "$app.html"
    printf '\n<p style="text-align:center;margin-top:32px"><a href="index.html" style="color:inherit">← Alle Lern-Apps</a></p>\n'
    printf '</body>\n</html>\n'
  } > "docs/$app.html"
  echo "Wrote docs/$app.html"
done
