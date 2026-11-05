#!/usr/bin/env python3
"""Static site generator for LearningDesk.

Usage:
  python3 src/build.py          build docs/ (GitHub Pages) and artifacts/ (single files for Claude)
  python3 src/build.py --pdf    additionally render the factsheet PDFs (needs Node.js + Playwright)

Sources:
  src/config.py            topics, grades, subjects (menus and breadcrumbs come from here)
  src/apps/<slug>/         style.css, body.html, script.js of each app
  src/shared/              components used by every page (breadcrumbs, light/dark switch, menu styles)
  src/templates/           Jinja2 templates
  src/factsheets/          factsheet sources and PDF renderer
"""
import argparse
import re
import shutil
import subprocess
import sys
from pathlib import Path

from jinja2 import Environment, FileSystemLoader, StrictUndefined

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "src"
DOCS = ROOT / "docs"
ARTIFACTS = ROOT / "artifacts"
sys.path.insert(0, str(SRC))
sys.path.insert(0, str(SRC / "worksheets"))
import config  # noqa: E402
import tasks as worksheet_tasks  # noqa: E402

MENU_FONTS = "https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:wght@400;700&family=Bricolage+Grotesque:opsz,wght@12..96,700;12..96,800&family=JetBrains+Mono&display=swap"

env = Environment(loader=FileSystemLoader(str(SRC / "templates")), undefined=StrictUndefined,
                  autoescape=False, keep_trailing_newline=True)


def read(path):
    return (SRC / path).read_text(encoding="utf-8")


def version():
    """Version and date of the newest CHANGELOG.md entry, e.g. ("1.0.0", "05.11.2026")."""
    text = (ROOT / "CHANGELOG.md").read_text(encoding="utf-8")
    m = re.search(r"^## \[(\d+\.\d+\.\d+)\] – (\d{4})-(\d{2})-(\d{2})", text, re.M)
    if not m:
        raise SystemExit("CHANGELOG.md: no entry of the form '## [x.y.z] – YYYY-MM-DD' found")
    return m.group(1), f"{m.group(4)}.{m.group(3)}.{m.group(2)}"


def shared():
    crumbs_css = read("shared/crumbs.css")
    ver, date = version()
    return {
        "version": ver,
        "version_line": f'<footer class="ld-version">{config.SITE_NAME} · Version {ver} · Stand {date}</footer>',
        "version_css": read("shared/version.css"),
        "theme_early": read("shared/theme-early.js").strip(),
        "crumbs_css": crumbs_css,
        # menu pages have no accent colour; their breadcrumb links use the text colour
        "crumbs_css_menu": crumbs_css.replace("var(--accent)", "var(--ink)"),
        "toggle_css": read("shared/theme-toggle.css"),
        "toggle_js": read("shared/theme-toggle.js"),
        "crumbs_js": read("shared/crumbs.js"),
        "menu_css": read("shared/menu.css"),
        "learnkit_css": read("shared/learnkit.css"),
        "learnkit_js": read("shared/learnkit.js"),
    }


def grade(gid):
    return next(g for g in config.GRADES if g["id"] == gid)


def subject(sid):
    return next(s for s in config.SUBJECTS if s["id"] == sid)


def crumbs_html(items, section=False):
    """items: list of (label, href or None). href None marks the current page."""
    lis = []
    for label, href in items:
        if href is None:
            lis.append(f'<li><span aria-current="page">{label}</span></li>')
        else:
            lis.append(f'<li><a href="{href}">{label}</a></li>')
    if section:
        lis.append('<li data-crumb-section hidden><span aria-current="location"></span></li>')
    return '<nav class="crumbs" aria-label="Brotkrümelnavigation"><ol>' + "".join(lis) + "</ol></nav>"


def topic_crumbs(t, base):
    items = [(config.SITE_NAME, base + "index.html")]
    if t.get("tool"):
        items.append((config.TOOLS_TITLE, base + "index.html#werkzeuge"))
    else:
        g, s = grade(t["grade"]), subject(t["subject"])
        items += [(g["crumb"], base + g["page"]), (s["title"], f'{base}{g["page"]}#{s["id"]}')]
    items.append((t["title"], "#" + t["first_view"]))
    return crumbs_html(items, section=True)


def render_app(t, base, sh, footer=True):
    app = {name: read(f"apps/{t['slug']}/{file}") for name, file in
           [("css", "style.css"), ("body", "body.html"), ("js", "script.js")]}
    t = {"scripts": [], "kit": False, "worksheet": t["slug"] in worksheet_tasks.TOPICS, **t}
    return env.get_template("app.html").render(
        t=t, app=app, shared=sh, base=base, footer=footer, fonts=config.FONTS[t["fonts"]], crumbs=topic_crumbs(t, base))


def topics_of(gid):
    return [t for t in config.TOPICS if t.get("grade") == gid]


def build_menus(sh):
    menu = env.get_template("menu.html")
    # start page: grades and tools
    grade_cards = []
    for g in config.GRADES:
        parts = []
        for s in config.SUBJECTS:
            names = [t["short"] for t in topics_of(g["id"]) if t["subject"] == s["id"]]
            if names:
                parts.append(f'{s["title"]}: {", ".join(names)}')
        grade_cards.append({"href": g["page"], "color": g["color"], "big": g["id"], "title": g["title"],
                            "text": " · ".join(parts), "go": "Zu den Themen →"})
    tool_cards = [{"href": t["slug"] + ".html", "color": "--math", "big": t["icon"], "big_style": "font-size:2.2rem",
                   "title": t["card_title"], "text": t["card"], "go": "Öffnen →"} for t in config.TOPICS if t.get("tool")]
    blocks = [{"cards": grade_cards}]
    index = menu.render(title=config.SITE_NAME, intro=config.INDEX_INTRO, crumbs=None, shared=sh, fonts=MENU_FONTS, blocks=blocks)
    # the tools section follows the grade cards, above the version line
    index = index.replace(sh["version_line"], tools_block(tool_cards) + sh["version_line"], 1)
    (DOCS / "index.html").write_text(index, encoding="utf-8")
    # one page per grade
    for g in config.GRADES:
        blocks = []
        for s in config.SUBJECTS:
            ts = [t for t in topics_of(g["id"]) if t["subject"] == s["id"]]
            if ts:
                blocks.append({"heading": s["title"], "id": s["id"], "cards": [
                    {"href": t["slug"] + ".html", "color": s["color"], "tag": t["tag"], "title": t["title"],
                     "text": t["card"], "go": "Öffnen →"} for t in ts]})
        crumbs = crumbs_html([(config.SITE_NAME, "index.html"), (g["crumb"], None)])
        page = menu.render(title=g["title"], intro="Wähle ein Thema.", crumbs=crumbs, shared=sh, fonts=MENU_FONTS, blocks=blocks)
        (DOCS / g["page"]).write_text(page, encoding="utf-8")


def tools_block(cards):
    if not cards:
        return ""
    out = [f'  <h2 style="font-size:1.3rem" id="werkzeuge">{config.TOOLS_TITLE}</h2>\n', '  <div class="cards">\n']
    for c in cards:
        out.append(f'    <a class="card" href="{c["href"]}" style="--c: var({c["color"]})">\n'
                   f'      <span class="grade" style="{c["big_style"]}">{c["big"]}</span>\n'
                   f'      <h2>{c["title"]}</h2>\n      <span class="muted">{c["text"]}</span>\n'
                   f'      <span class="go">{c["go"]}</span>\n    </a>\n')
    out.append("  </div>\n")
    return "".join(out)


def build_pdfs():
    out = SRC / "factsheets" / "_build"
    subprocess.run([sys.executable, str(SRC / "factsheets" / "sources.py"), str(out)], check=True)
    subprocess.run(["node", str(SRC / "factsheets" / "render-pdf.js"), str(out), str(DOCS / "factsheets")], check=True)
    # worksheets: page 1 tasks, page 2 solutions
    wout = SRC / "worksheets" / "_build"
    subprocess.run([sys.executable, str(SRC / "worksheets" / "sources.py"), str(wout)], check=True)
    subprocess.run(["node", str(SRC / "factsheets" / "render-pdf.js"), str(wout), str(DOCS / "aufgaben")], check=True)


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--pdf", action="store_true", help="also render the factsheet PDFs")
    args = ap.parse_args()
    sh = shared()
    DOCS.mkdir(exist_ok=True)
    ARTIFACTS.mkdir(exist_ok=True)
    page = env.get_template("page.html")
    for t in config.TOPICS:
        # single file for Claude artifacts: absolute links to the GitHub Pages site
        (ARTIFACTS / f"{t['slug']}.html").write_text(render_app(t, config.BASE_URL, sh), encoding="utf-8")
        # standalone page for GitHub Pages: relative links
        back = "index.html" if t.get("tool") else grade(t["grade"])["page"]
        (DOCS / f"{t['slug']}.html").write_text(page.render(fragment=render_app(t, "", sh, footer=False), back=back, shared=sh), encoding="utf-8")
        for asset in t.get("assets", []):
            for target in (DOCS / asset, ARTIFACTS / asset):
                target.parent.mkdir(parents=True, exist_ok=True)
                shutil.copyfile(ROOT / asset, target)
    shutil.copyfile(ROOT / "vendor" / "algebrite-LICENSE.txt", DOCS / "vendor" / "algebrite-LICENSE.txt")
    build_menus(sh)
    if args.pdf:
        build_pdfs()
    missing = [t["slug"] for t in config.TOPICS if not (DOCS / "factsheets" / f"{t['slug']}.pdf").exists()]
    missing += [f"{s} (Aufgaben)" for s in worksheet_tasks.TOPICS if not (DOCS / "aufgaben" / f"{s}.pdf").exists()]
    print(f"Version {sh['version']}: built {len(config.TOPICS)} apps and {len(config.GRADES) + 1} menu pages.")
    if missing:
        print("Warning: factsheet PDF missing for", ", ".join(missing), "(run with --pdf)")


if __name__ == "__main__":
    main()
