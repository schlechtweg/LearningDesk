"""Generates the HTML sources of the worksheets: one PDF per topic.

Usage: python3 src/worksheets/sources.py <outDir>
Pages 1-3: tasks of one level each (easy, medium, hard), pages 4-6: the solutions
of the same levels. The task pools come from tasks.py, the graphic task from
figures.py (on the page of its difficulty). An inline script removes tasks from a
level until its task page and its solution page fit on one A4 page each.
"""
import os
import shutil
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import extra_tasks  # noqa: E402
import figures  # noqa: E402
import tasks  # noqa: E402

LEVELS = [(1, "★☆☆", "Leicht", "Grundwissen"), (2, "★★☆", "Mittel", "Anwenden"), (3, "★★★", "Schwer", "Knobeln und Transfer")]
FONTS = ("https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:ital,wght@0,400;0,700;1,400"
         "&family=Bricolage+Grotesque:opsz,wght@12..96,700;12..96,800&family=JetBrains+Mono:wght@400;600"
         "&family=STIX+Two+Text:ital,wght@0,400;0,600;1,400&display=swap")

FIT = """<script>
// Every level has a task page and a solution page. Remove the last task of a level
// until both of its pages fit on A4; report the tasks per level and how full the task pages are.
window.__fit = function () {
  const over = (el) => el.scrollHeight > el.clientHeight + 0.5;
  const res = [];
  for (const lvl of [1, 2, 3]) {
    const pages = Array.from(document.querySelectorAll('.page[data-lvl="' + lvl + '"]'));
    const tooBig = () => pages.some((p) => over(p) || over(p.querySelector('.content')));
    for (let guard = 0; guard < 500 && tooBig(); guard++) {
      const items = document.querySelectorAll('.tasks li[data-lvl="' + lvl + '"]');
      if (items.length <= 1) break;
      const id = items[items.length - 1].dataset.id;
      document.querySelectorAll('li[data-id="' + id + '"]').forEach((e) => e.remove());
    }
    const fill = (p) => { const c = p.querySelector('.content'); return Math.round(100 * (Array.from(c.children).reduce((h, e) => h + e.getBoundingClientRect().height, 0) + 8 * (c.children.length - 1)) / c.clientHeight); };
    res.push(document.querySelectorAll('.tasks li[data-lvl="' + lvl + '"]').length + ' (' + fill(pages[0]) + '%, Lösung ' + fill(pages[1]) + '%)');
  }
  return res.join(' / ');
};
</script>"""


def fig_section(fig, is_sol):
    pic, html = fig["sol" if is_sol else "task"]
    return (f'<section class="lvl fig"><h2>Grafik<span class="hint">{fig["title"]}</span></h2>'
            f'<div class="figwrap"><div class="figpic">{pic}</div><div class="figtext">{html}</div></div></section>')


def page(meta, lvl, is_sol, pool, fig, start):
    _, stars, name, hint = LEVELS[lvl - 1]
    cols = meta["sol_cols" if is_sol else "cols"]
    cols = cols[lvl - 1] if isinstance(cols, (list, tuple)) else cols
    items = "".join(f'<li data-lvl="{lvl}" data-id="{lvl}-{i}">{sol if is_sol else task}</li>' for i, (task, sol) in enumerate(pool))
    # one-column levels hold written tasks: larger type and more room between the tasks
    secs = [f'<section class="lvl{" roomy" if cols == 1 else ""}"><h2><span class="stars">{stars}</span>{name}<span class="hint">{hint}</span></h2>'
            f'<ol class="items" style="--cols:{cols}">{items}</ol></section>']
    if fig and fig["stars"].count("★") == lvl:
        secs.append(fig_section(fig, is_sol))
    pno = lvl + 3 if is_sol else lvl
    if is_sol:
        intro = f'<p class="intro"><span>Lösungen zu Seite {lvl} ({name}). Vergleiche mit deinen Ergebnissen.</span></p>'
    else:
        intro = ('<p class="intro"><span>Löse die Aufgaben in deinem Heft. Die Lösungen stehen auf Seite ' + str(lvl + 3) + '.</span>'
                 '<span class="name">Name: ____________________ Datum: __________</span></p>')
    title = "Lösungen" if is_sol else "Übungsaufgaben"
    return f'''<div class="page" data-lvl="{lvl}" style="counter-reset: task {start}">
  <header><div><div class="eyebrow">{meta["eyebrow"]}</div><h1>{title}: {meta["title"]}</h1></div><span class="tag"><span class="stars">{stars}</span> {name} · Seite {pno} von 6</span></header>
  {intro}
  <div class="content {"sols" if is_sol else "tasks"}">{"".join(secs)}</div>
  <footer><span>LearningDesk · Übungsblatt</span><span>Interaktiv üben: schlechtweg.github.io/LearningDesk/{meta["slug"]}.html</span></footer>
</div>'''


def build(out):
    os.makedirs(out, exist_ok=True)
    shutil.copyfile(os.path.join(os.path.dirname(os.path.abspath(__file__)), "worksheet.css"), os.path.join(out, "worksheet.css"))
    for slug, (meta, gen) in tasks.TOPICS.items():
        pools = gen()
        for lvl, more in extra_tasks.EXTRA.get(slug, {}).items():
            pools[lvl] = pools[lvl] + more
        # drop duplicate tasks (random pools can repeat values)
        seen = set()
        for lvl in pools:
            unique = []
            for pair in pools[lvl]:
                if pair[0] not in seen:
                    seen.add(pair[0]); unique.append(pair)
            pools[lvl] = unique
        meta = {"slug": slug, "cols": 2, "sol_cols": 2, **meta}
        fig = figures.FIGS[slug]() if slug in figures.FIGS else None
        # each level starts its numbering at 1
        task_pages = [page(meta, l, False, pools[l], fig, 0) for l in (1, 2, 3)]
        sol_pages = [page(meta, l, True, pools[l], fig, 0) for l in (1, 2, 3)]
        html = f'''<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="pages" content="6">
<title>Übungsaufgaben {meta["title"]}</title>
<link rel="stylesheet" href="{FONTS}">
<link rel="stylesheet" href="worksheet.css">
<style>:root {{ --accent: {meta["accent"]}; }}</style>
</head>
<body>
{"".join(task_pages)}
{"".join(sol_pages)}
{FIT}
</body>
</html>
'''
        with open(os.path.join(out, f"{slug}.html"), "w", encoding="utf-8") as f:
            f.write(html)
    print("worksheet sources:", ", ".join(tasks.TOPICS))


if __name__ == "__main__":
    build(sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.dirname(__file__), "_build"))
