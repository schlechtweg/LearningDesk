# Adds a linked breadcrumb trail to the header of every LearningDesk page (idempotent).
# Links point to the GitHub Pages site so they also work inside Claude artifacts;
# tools/build-standalone.sh turns them into relative links for docs/.
import re
BASE = "https://schlechtweg.github.io/LearningDesk/"
CSS = '''<!-- breadcrumbs -->
<style>
nav.crumbs ol { list-style: none; margin: 0; padding: 0; display: flex; flex-wrap: wrap; align-items: center; gap: 2px 6px; font-size: 0.85rem; line-height: 1.5; }
nav.crumbs li { display: inline-flex; align-items: center; gap: 6px; min-width: 0; }
nav.crumbs li + li::before { content: "›"; color: var(--muted); }
nav.crumbs a { color: var(--accent); text-decoration: none; font-weight: 700; }
nav.crumbs a:hover { text-decoration: underline; }
nav.crumbs [aria-current] { color: var(--muted); }
</style>
'''
SCRIPT = '''<script>
(function () {
  "use strict";
  // keep the last breadcrumb in sync with the active section tab
  var last = document.querySelector("nav.crumbs [data-crumb-section]");
  if (!last) return;
  function update() {
    var a = document.querySelector('nav.tabs a[aria-current="page"]');
    if (!a) { last.hidden = true; return; }
    var t = a.cloneNode(true); var n = t.querySelector(".n"); if (n) n.remove();
    last.querySelector("span").textContent = t.textContent.trim();
    last.hidden = false;
  }
  window.addEventListener("hashchange", function () { setTimeout(update, 0); });
  setTimeout(update, 0);
})();
</script>
'''
def crumbs(items, section_first=None):
    lis = []
    for label, href in items:
        lis.append(f'<li><a href="{href}">{label}</a></li>' if href else f'<li><span aria-current="page">{label}</span></li>')
    if section_first:
        lis.append('<li data-crumb-section hidden><span aria-current="location"></span></li>')
    return '<nav class="crumbs" aria-label="Brotkrümelnavigation"><ol>' + "".join(lis) + '</ol></nav>'

APPS = {
  "osmose.html": ("Biologie · Klasse 11 · Stofftransport", [("LearningDesk", "index.html"), ("Klasse 11", "klasse-11.html"), ("Biologie", "klasse-11.html#biologie"), ("Osmose verstehen", "#verstehen")]),
  "natrium-kalium-pumpe.html": ("Biologie · Klasse 11 · Stofftransport &amp; Nerven", [("LearningDesk", "index.html"), ("Klasse 11", "klasse-11.html"), ("Biologie", "klasse-11.html#biologie"), ("Natrium-Kalium-Pumpe", "#grundlagen")]),
  "ableiten.html": ("Mathematik · Klasse 11 · Differentialrechnung", [("LearningDesk", "index.html"), ("Klasse 11", "klasse-11.html"), ("Mathematik", "klasse-11.html#mathematik"), ("Ableiten lernen", "#idee")]),
  "binomische-formeln.html": ("Mathematik · Klasse 8 · Terme", [("LearningDesk", "index.html"), ("Klasse 8", "klasse-8.html"), ("Mathematik", "klasse-8.html#mathematik"), ("Binomische Formeln", "#formeln")]),
  "bruchterme.html": ("Mathematik · Klasse 8 · Terme", [("LearningDesk", "index.html"), ("Klasse 8", "klasse-8.html"), ("Mathematik", "klasse-8.html#mathematik"), ("Bruchterme", "#grundlagen")]),
  "classpad.html": ("Taschenrechner · Klasse 8 bis 12", [("LearningDesk", "index.html"), ("Werkzeuge", "index.html#werkzeuge"), ("ClassPad-Simulator", "#lernen")]),
}
def absolute(items):
    return [(l, h if (h is None or h.startswith("#")) else BASE + h) for l, h in items]

for path, (eyebrow, items) in APPS.items():
    s = open(path).read()
    if "<!-- breadcrumbs -->" in s: print("skip", path); continue
    old = f'<span class="eyebrow">{eyebrow}</span>'
    assert s.count(old) == 1, path
    s = s.replace(old, crumbs(absolute(items), section_first=True))
    s = s.replace("</title>", "</title>\n" + CSS, 1)
    s = s.rstrip("\n") + "\n" + SCRIPT
    open(path, "w").write(s); print("patched", path)

# menu pages (live only in docs/, so relative links)
MENU = {
  "docs/klasse-8.html": [("LearningDesk", "index.html"), ("Klasse 8", None)],
  "docs/klasse-11.html": [("LearningDesk", "index.html"), ("Klasse 11", None)],
}
for path, items in MENU.items():
    s = open(path).read()
    if "<!-- breadcrumbs -->" in s: print("skip", path); continue
    s = s.replace('<a class="back" href="index.html">← Alle Klassenstufen</a>', crumbs(items))
    s = s.replace('<div class="subject">\n    <h2>Biologie</h2>', '<div class="subject" id="biologie">\n    <h2>Biologie</h2>')
    s = s.replace('<div class="subject">\n    <h2>Mathematik</h2>', '<div class="subject" id="mathematik">\n    <h2>Mathematik</h2>')
    s = s.replace("</title>", "</title>\n" + CSS.replace("var(--accent)", "var(--ink)"), 1)
    open(path, "w").write(s); print("patched", path)
p = "docs/index.html"; s = open(p).read()
if 'id="werkzeuge"' not in s:
    s = s.replace('<h2 style="font-size:1.3rem">Werkzeuge</h2>', '<h2 style="font-size:1.3rem" id="werkzeuge">Werkzeuge</h2>')
    open(p, "w").write(s); print("patched", p)
