(function () {
  "use strict";
  // Optional sounds, off by default: a soft click on taps, a chime for right answers,
  // a low tone for wrong ones. Generated with the Web Audio API, so no audio files are needed.
  var KEY = "learningdesk.sound";
  var AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return;
  var on = false;
  try { on = localStorage.getItem(KEY) === "on"; } catch (e) { /* storage unavailable */ }
  var ctx = null;

  function audio() {
    if (!ctx) {
      // iPhone: play even when the ring/silent switch is set to silent (Safari 16.4+)
      try { if (navigator.audioSession) navigator.audioSession.type = "playback"; } catch (e) { /* ignored */ }
      ctx = new AC();
    }
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  }
  // one short sine tone; start offset t (s), duration d (s)
  function tone(freq, t, d, vol) {
    var c = audio(), o = c.createOscillator(), g = c.createGain(), s = c.currentTime + t;
    o.type = "sine"; o.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, s);
    g.gain.exponentialRampToValueAtTime(vol, s + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, s + d);
    o.connect(g); g.connect(c.destination);
    o.start(s); o.stop(s + d + 0.02);
  }
  var SOUNDS = {
    tap: function () { tone(880, 0, 0.05, 0.05); },
    right: function () { tone(660, 0, 0.12, 0.12); tone(990, 0.1, 0.22, 0.12); },
    wrong: function () { tone(220, 0, 0.25, 0.12); }
  };
  function play(name) { if (on) { try { SOUNDS[name](); } catch (e) { /* audio unavailable */ } } }
  window.LDSound = { play: play };

  // taps on interactive elements
  var SEL = "a, button, summary, [role='tab'], select";
  document.addEventListener("click", function (ev) {
    var el = ev.target.closest && ev.target.closest(SEL);
    if (el && !el.disabled && !el.classList.contains("sound-toggle")) play("tap");
  }, true);

  // feedback that marks an answer right or wrong (trainers and quizzes)
  var last = 0;
  new MutationObserver(function (list) {
    for (var i = 0; i < list.length; i++) {
      var n = list[i].target;
      if (!(n instanceof Element)) continue;
      var r = n.classList.contains("right") || n.querySelector("b.ok"), w = n.classList.contains("wrong") || n.querySelector("b.no");
      if ((r || w) && Date.now() - last > 300) { last = Date.now(); setTimeout(function () { play(w ? "wrong" : "right"); }, 60); return; }
    }
  }).observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ["class"] });

  // on/off button next to the theme toggle
  var header = document.querySelector("header");
  if (!header) return;
  var btn = document.createElement("button");
  btn.type = "button"; btn.className = "theme-toggle sound-toggle";
  function paint() {
    var label = on ? "Töne ausschalten" : "Töne einschalten";
    btn.textContent = on ? "🔊" : "🔇";
    btn.setAttribute("aria-label", label); btn.title = label;
    btn.setAttribute("aria-pressed", String(on));
  }
  btn.addEventListener("click", function () {
    on = !on;
    try { localStorage.setItem(KEY, on ? "on" : "off"); } catch (e) { /* storage unavailable */ }
    paint();
    if (on) play("right");
  });
  header.classList.add("has-sound-toggle");
  header.appendChild(btn);
  paint();
})();
