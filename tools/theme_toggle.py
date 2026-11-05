# Adds the shared light/dark switch to all LearningDesk pages (idempotent).
import re, sys
EARLY = '<script>try{var t=localStorage.getItem("learningdesk.theme");if(t==="dark"||t==="light")document.documentElement.setAttribute("data-theme",t)}catch(e){}</script>'
SNIPPET = '''<!-- theme-toggle -->
<style>
header.has-theme-toggle { position: relative; padding-right: 54px; }
.theme-toggle { position: absolute; top: 18px; right: 0; width: 40px; height: 40px; border-radius: 999px; border: 1px solid var(--line); background: var(--surface); color: var(--ink); font-size: 18px; line-height: 1; cursor: pointer; display: grid; place-items: center; padding: 0; }
header:not(.top) > .theme-toggle { top: 0; }
.theme-toggle:hover { border-color: var(--accent, currentColor); }
.theme-toggle:focus-visible { outline: 3px solid var(--accent, currentColor); outline-offset: 2px; }
</style>
<script>
(function () {
  "use strict";
  // Light/dark switch shared by all LearningDesk pages; the choice is remembered in this browser
  var KEY = "learningdesk.theme", root = document.documentElement;
  var header = document.querySelector("header");
  if (!header) return;
  function effective() {
    var t = root.getAttribute("data-theme");
    if (t === "dark" || t === "light") return t;
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  var btn = document.createElement("button");
  btn.type = "button"; btn.className = "theme-toggle";
  function paint() {
    var dark = effective() === "dark";
    var label = dark ? "Helles Design einschalten" : "Dunkles Design einschalten";
    btn.textContent = dark ? "\\u2600" : "\\u263E";
    btn.setAttribute("aria-label", label); btn.title = label;
  }
  btn.addEventListener("click", function () {
    var next = effective() === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    try { localStorage.setItem(KEY, next); } catch (e) { /* storage unavailable */ }
    paint();
    // canvases read the colour tokens when they draw, so ask them to redraw
    window.dispatchEvent(new Event("resize"));
  });
  header.classList.add("has-theme-toggle");
  header.appendChild(btn);
  paint();
  try { window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", paint); } catch (e) { /* old browsers */ }
})();
</script>
'''
def dark_css_for_menu(s):
    # menu pages: make the dark palette respond to data-theme as well
    m = re.search(r'@media \(prefers-color-scheme: dark\) \{ :root \{ (.*?) \} \}', s)
    if not m: return s
    inner = m.group(1)
    new = ('@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) { ' + inner + ' } }\n'
           ':root[data-theme="dark"] { ' + inner + ' }')
    return s.replace(m.group(0), new)
for path in sys.argv[1:]:
    s = open(path).read()
    if '<!-- theme-toggle -->' in s:
        print('skip', path); continue
    if path.startswith('docs/'):
        s = dark_css_for_menu(s)
        s = s.replace('</title>', '</title>\n' + EARLY, 1)
        s = s.replace('</body>', SNIPPET + '</body>', 1)
    else:
        s = s.replace('</title>', '</title>\n' + EARLY, 1)
        s = s.rstrip('\n') + '\n' + SNIPPET
    open(path, 'w').write(s); print('patched', path)
