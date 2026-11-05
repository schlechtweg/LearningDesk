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
