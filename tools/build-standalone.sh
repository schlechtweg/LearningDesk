#!/usr/bin/env bash
# Build a standalone HTML document (doctype, charset, viewport) from osmose.html.
# osmose.html is written without document skeleton for the Claude artifact;
# docs/index.html can be opened directly in any browser or served via GitHub Pages.
set -euo pipefail
cd "$(dirname "$0")/.."
{
  printf '<!doctype html>\n<html lang="de">\n<head>\n<meta charset="utf-8">\n'
  printf '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'
  printf '<style>body{margin:0}img{max-width:100%%}[hidden]{display:none!important}</style>\n'
  printf '</head>\n<body>\n'
  cat osmose.html
  printf '\n</body>\n</html>\n'
} > docs/index.html
echo "Wrote docs/index.html"
