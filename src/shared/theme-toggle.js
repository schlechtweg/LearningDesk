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
    btn.textContent = dark ? "\u2600" : "\u263E";
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
