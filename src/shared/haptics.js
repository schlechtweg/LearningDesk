(function () {
  "use strict";
  // Haptic feedback on taps (menu items, tabs, buttons).
  // Android: Vibration API. iPhone (iOS 18+): Safari plays a system haptic when an
  // <input type="checkbox" switch> is toggled, so a hidden switch is toggled on each tap.
  // Neither is available on desktops; the toggle button only appears on touch devices.
  var KEY = "learningdesk.haptics";
  var coarse = window.matchMedia && window.matchMedia("(pointer: coarse)").matches;
  var canVibrate = typeof navigator.vibrate === "function";
  var probe = document.createElement("input");
  var canSwitch = "switch" in probe;
  if (!coarse || !(canVibrate || canSwitch)) return;

  var on = true;
  try { on = localStorage.getItem(KEY) !== "off"; } catch (e) { /* storage unavailable */ }

  // hidden switch for iOS
  var label = null;
  if (!canVibrate && canSwitch) {
    label = document.createElement("label");
    label.setAttribute("aria-hidden", "true");
    label.style.cssText = "position:fixed;left:-9999px;top:0;width:1px;height:1px;overflow:hidden;opacity:0;pointer-events:none";
    var sw = document.createElement("input");
    sw.type = "checkbox"; sw.setAttribute("switch", ""); sw.tabIndex = -1;
    label.appendChild(sw);
    document.body.appendChild(label);
  }

  function tick(pattern) {
    if (!on) return;
    if (canVibrate) { try { navigator.vibrate(pattern || 10); } catch (e) { /* ignored */ } }
    else if (label) label.click();
  }
  window.LDHaptics = { tick: tick };

  // taps on interactive elements
  var SEL = "a, button, summary, [role='tab'], select, input[type='checkbox'], input[type='radio']";
  document.addEventListener("click", function (ev) {
    if (label && label.contains(ev.target)) return;           // our own hidden switch
    var el = ev.target.closest && ev.target.closest(SEL);
    if (el && !el.disabled) tick(10);
  }, true);

  // Android only: distinct patterns when feedback marks an answer right or wrong
  if (canVibrate) {
    new MutationObserver(function (list) {
      for (var i = 0; i < list.length; i++) {
        var n = list[i].target;
        if (!(n instanceof Element)) continue;
        if (n.querySelector("b.ok, .right") || n.classList.contains("right")) { tick([15, 60, 15]); return; }
        if (n.querySelector("b.no, .wrong") || n.classList.contains("wrong")) { tick([60]); return; }
      }
    }).observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ["class"] });
  }

  // on/off button next to the theme toggle
  var header = document.querySelector("header");
  if (!header) return;
  var btn = document.createElement("button");
  btn.type = "button"; btn.className = "theme-toggle haptic-toggle";
  function paint() {
    var label2 = on ? "Haptik ausschalten" : "Haptik einschalten";
    btn.textContent = on ? "〰" : "—";
    btn.setAttribute("aria-label", label2); btn.title = label2;
    btn.setAttribute("aria-pressed", String(on));
  }
  btn.addEventListener("click", function () {
    on = !on;
    try { localStorage.setItem(KEY, on ? "on" : "off"); } catch (e) { /* storage unavailable */ }
    paint();
    tick(20);
  });
  header.classList.add("has-haptic-toggle");
  header.appendChild(btn);
  paint();
})();
