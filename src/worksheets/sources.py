"""Generates the HTML sources of the two-page worksheets (tasks + solutions).

Usage: python3 src/worksheets/sources.py <outDir>
The task pools come from tasks.py. Each page fits itself: an inline script removes
tasks (and their solutions) until both pages fit on one A4 page each.
"""
import os
import shutil
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import tasks  # noqa: E402

LEVELS = [(1, "★☆☆", "Einfach", "Grundwissen"), (2, "★★☆", "Mittel", "Anwenden"), (3, "★★★", "Schwer", "Knobeln und Transfer")]
FONTS = ("https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:ital,wght@0,400;0,700;1,400"
         "&family=Bricolage+Grotesque:opsz,wght@12..96,700;12..96,800&family=JetBrains+Mono:wght@400;600"
         "&family=STIX+Two+Text:ital,wght@0,400;0,600;1,400&display=swap")

FIT = """<script>
// Remove tasks until the task page and the solution page both fit on A4.
// Always takes the last task of the level that currently has the most tasks.
window.__fit = function () {
  const pages = Array.from(document.querySelectorAll('.page .content'));
  const over = () => pages.some((c) => c.scrollHeight > c.clientHeight) || Array.from(document.querySelectorAll('.page')).some((p) => p.scrollHeight > p.clientHeight);
  for (let guard = 0; guard < 400 && over(); guard++) {
    const counts = [1, 2, 3].map((l) => document.querySelectorAll('.tasks li[data-lvl="' + l + '"]').length);
    let lvl = 3; for (let l = 3; l >= 1; l--) if (counts[l - 1] > counts[lvl - 1]) lvl = l;
    if (counts[lvl - 1] <= 1) break;
    const items = document.querySelectorAll('.tasks li[data-lvl="' + lvl + '"]');
    const id = items[items.length - 1].dataset.id;
    document.querySelectorAll('li[data-id="' + id + '"]').forEach((e) => e.remove());
  }
  return [1, 2, 3].map((l) => document.querySelectorAll('.tasks li[data-lvl="' + l + '"]').length).join('/');
};
</script>"""


def page(meta, kind, pools):
    is_sol = kind == "sol"
    title = "Lösungen" if is_sol else "Übungsaufgaben"
    secs = []
    for lvl, stars, name, hint in LEVELS:
        items = "".join(
            f'<li data-lvl="{lvl}" data-id="{lvl}-{i}">{sol if is_sol else task}</li>'
            for i, (task, sol) in enumerate(pools[lvl]))
        secs.append(f'<section class="lvl"><h2><span class="stars">{stars}</span>{name}<span class="hint">{hint}</span></h2>'
                    f'<ol class="items" style="--cols:{meta["sol_cols"] if is_sol else meta["cols"]}">{items}</ol></section>')
    intro = ('<p class="intro"><span>Vergleiche mit deinen Ergebnissen. Die Nummern entsprechen den Aufgaben auf Seite 1.</span></p>' if is_sol else
             '<p class="intro"><span>Löse die Aufgaben in deinem Heft. <span class="stars">★☆☆</span> einfach · <span class="stars">★★☆</span> mittel · <span class="stars">★★★</span> schwer. Die Lösungen stehen auf Seite 2.</span>'
             '<span class="name">Name: ____________________ Datum: __________</span></p>')
    return f'''<div class="page">
  <header><div><div class="eyebrow">{meta["eyebrow"]}</div><h1>{title}: {meta["title"]}</h1></div><span class="tag">{"Lösungen" if is_sol else "Aufgaben"} · Seite {2 if is_sol else 1}</span></header>
  {intro}
  <div class="content {"sols" if is_sol else "tasks"}">{"".join(secs)}</div>
  <footer><span>LearningDesk · Übungsblatt</span><span>Interaktiv üben: schlechtweg.github.io/LearningDesk/{meta["slug"]}.html</span></footer>
</div>'''


def build(out):
    os.makedirs(out, exist_ok=True)
    shutil.copyfile(os.path.join(os.path.dirname(os.path.abspath(__file__)), "worksheet.css"), os.path.join(out, "worksheet.css"))
    for slug, (meta, gen) in tasks.TOPICS.items():
        pools = gen()
        # drop duplicate tasks (random pools can repeat values)
        seen = set()
        for lvl in pools:
            unique = []
            for pair in pools[lvl]:
                if pair[0] not in seen:
                    seen.add(pair[0]); unique.append(pair)
            pools[lvl] = unique
        meta = {"slug": slug, "cols": 2, "sol_cols": 2, **meta}
        html = f'''<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="pages" content="2">
<title>Übungsaufgaben {meta["title"]}</title>
<link rel="stylesheet" href="{FONTS}">
<link rel="stylesheet" href="worksheet.css">
<style>:root {{ --accent: {meta["accent"]}; }}</style>
</head>
<body>
{page(meta, "task", pools)}
{page(meta, "sol", pools)}
{FIT}
</body>
</html>
'''
        with open(os.path.join(out, f"{slug}.html"), "w", encoding="utf-8") as f:
            f.write(html)
    print("worksheet sources:", ", ".join(tasks.TOPICS))


if __name__ == "__main__":
    build(sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.dirname(__file__), "_build"))
