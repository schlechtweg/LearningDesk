(function () {
  "use strict";
  const { $, $$, pick, rnd, nz, fmt } = LK;
  const n = (v) => fmt(Math.abs(v) < 1e-12 ? 0 : v, 3).replace("-", "−");
  const br = (v) => (v < 0 ? `(${n(v)})` : n(v));
  const lin = (m, b, v = "x") => `${m === 0 ? "" : m === 1 ? `<i>${v}</i>` : m === -1 ? `−<i>${v}</i>` : n(m) + `<i>${v}</i>`}${b === 0 ? (m === 0 ? "0" : "") : (m === 0 ? n(b) : b > 0 ? " + " + n(b) : " − " + n(-b))}`;
  const eq2 = (a, b, c) => { const t = (k, v, first) => k === 0 ? "" : `${first ? (k < 0 ? "−" : "") : k < 0 ? " − " : " + "}${Math.abs(k) === 1 ? "" : Math.abs(k)}<i>${v}</i>`; return `${t(a, "x", true) + t(b, "y", a === 0) || "0"} = ${n(c)}`; };

  // ---------- step-by-step ----------
  let method = "gleich", steps = [], shown = 0;
  function makeGleich() {
    const x = rnd(-4, 5), y = rnd(-5, 6), m1 = nz(-3, 4); let m2 = nz(-3, 3); if (m2 === m1) m2 = -m1 || 1;
    const b1 = y - m1 * x, b2 = y - m2 * x;
    const sys = `I: <i>y</i> = ${lin(m1, b1)}<br>II: <i>y</i> = ${lin(m2, b2)}`;
    const st = [
      [`Gleichsetzen: <span class="math">${lin(m1, b1)} = ${lin(m2, b2)}</span>`, "Beide Terme sind gleich y, also sind sie gleich."],
      [`Alle <i>x</i> nach links, Zahlen nach rechts: <span class="math">${lin(m1 - m2, 0)} = ${n(b2 - b1)}</span>`, `${m2 >= 0 ? "−" : "+"} ${Math.abs(m2) === 1 ? "" : Math.abs(m2)}x und ${b1 >= 0 ? "−" : "+"} ${Math.abs(b1)} auf beiden Seiten.`],
      [`Durch ${br(m1 - m2)} teilen: <span class="math"><b><i>x</i> = ${n(x)}</b></span>`, ""],
      [`In I einsetzen: <span class="math"><i>y</i> = ${n(m1)} · ${br(x)} ${b1 < 0 ? "−" : "+"} ${n(Math.abs(b1))} = <b>${n(y)}</b></span>`, ""],
      [`Probe in II: <span class="math">${n(m2)} · ${br(x)} ${b2 < 0 ? "−" : "+"} ${n(Math.abs(b2))} = ${n(y)}</span> ✓`, "Die Lösung muss auch die andere Gleichung erfüllen."],
      [`Lösung: <span class="math"><b>(${n(x)} | ${n(y)})</b></span>`, ""]
    ];
    return { sys, st };
  }
  function makeEin() {
    const x = rnd(-4, 5), y = rnd(-5, 6), m1 = nz(-3, 4), a = nz(-3, 4), bb = pick([1, 2, 3, -1, -2]);
    if (a + bb * m1 === 0) return makeEin();
    const b1 = y - m1 * x, c = a * x + bb * y;
    const sys = `I: <i>y</i> = ${lin(m1, b1)}<br>II: ${eq2(a, bb, c)}`;
    const k = a + bb * m1, r = c - bb * b1;
    const st = [
      [`I in II einsetzen (mit Klammer!): <span class="math">${n(a)}<i>x</i> ${bb < 0 ? "−" : "+"} ${Math.abs(bb) === 1 ? "" : Math.abs(bb) + " · "}(${lin(m1, b1)}) = ${n(c)}</span>`, "Für y steht jetzt der Term aus I."],
      [`Klammer auflösen und zusammenfassen: <span class="math">${lin(k, bb * b1)} = ${n(c)}</span>`, ""],
      [`Zahl auf die andere Seite: <span class="math">${lin(k, 0)} = ${n(r)}</span>`, ""],
      [`Durch ${br(k)} teilen: <span class="math"><b><i>x</i> = ${n(x)}</b></span>`, ""],
      [`In I einsetzen: <span class="math"><i>y</i> = ${n(m1)} · ${br(x)} ${b1 < 0 ? "−" : "+"} ${n(Math.abs(b1))} = <b>${n(y)}</b></span>`, ""],
      [`Probe in II: <span class="math">${n(a)} · ${br(x)} ${bb < 0 ? "−" : "+"} ${Math.abs(bb)} · ${br(y)} = ${n(c)}</span> ✓`, ""],
      [`Lösung: <span class="math"><b>(${n(x)} | ${n(y)})</b></span>`, ""]
    ];
    return { sys, st };
  }
  function newSys() { const S = method === "gleich" ? makeGleich() : makeEin(); $("#sSys").innerHTML = S.sys; steps = S.st; shown = 0; paint(); }
  function paint() { $("#sSteps").innerHTML = steps.slice(0, shown).map(([t, w]) => `<li>${t}${w ? `<span class="why">${w}</span>` : ""}</li>`).join(""); $("#sNext").disabled = shown >= steps.length; }
  $("#sNext").addEventListener("click", () => { if (shown < steps.length) { shown++; paint(); } });
  $("#sAll").addEventListener("click", () => { shown = steps.length; paint(); });
  $("#sNew").addEventListener("click", newSys);
  $$("[data-m]").forEach((b) => b.addEventListener("click", () => { method = b.dataset.m; $$("[data-m]").forEach((x) => x.setAttribute("aria-pressed", String(x === b))); newSys(); }));
  newSys();

  // ---------- trainer ----------
  const pairCheck = (x0, y0) => (raw) => { const p = String(raw).replace(/[()\s]/g, "").replace(/[−–]/g, "-").split(/[|;]/); if (p.length !== 2) return { ok: false, msg: "Schreibe die Lösung als <code>(2|5)</code>." }; const a = LK.parseNum(p[0]), b = LK.parseNum(p[1]); return Math.abs(a - x0) < 1e-6 && Math.abs(b - y0) < 1e-6 ? { ok: true } : { ok: false, msg: "Prüfe dein Ergebnis durch Einsetzen in beide Gleichungen." }; };
  function genG() { const x = rnd(-4, 5), y = rnd(-5, 6), m1 = nz(-3, 4); let m2 = nz(-3, 3); if (m2 === m1) m2 = -m1 || 1; return { html: `Gleichsetzungsverfahren: I: <i>y</i> = ${lin(m1, y - m1 * x)}, II: <i>y</i> = ${lin(m2, y - m2 * x)}`, label: "Lösung:", placeholder: "(x|y)", answer: `(${n(x)}|${n(y)})`, check: pairCheck(x, y), solution: `<b>(${n(x)} | ${n(y)})</b>` }; }
  function genE() { const x = rnd(-4, 5), y = rnd(-5, 6), m1 = nz(-3, 3), a = nz(-3, 4), bb = pick([1, 2, -1, 3]); if (a + bb * m1 === 0) return genE(); return { html: `Einsetzungsverfahren: I: <i>y</i> = ${lin(m1, y - m1 * x)}, II: ${eq2(a, bb, a * x + bb * y)}`, label: "Lösung:", placeholder: "(x|y)", answer: `(${n(x)}|${n(y)})`, check: pairCheck(x, y), solution: `<b>(${n(x)} | ${n(y)})</b>` }; }
  function genSpecial() {
    const m = nz(-3, 3), b = rnd(-5, 5), same = Math.random() < 0.5, b2 = same ? b : b + pick([1, 2, -3]);
    const ans = same ? "unendlich" : "keine";
    return { html: `I: <i>y</i> = ${lin(m, b)}, II: <i>y</i> = ${lin(m, b2)}. Lösung?`, label: "Lösung:", placeholder: "keine oder unendlich", answer: ans,
      check: (raw) => { const t = raw.trim().toLowerCase(); const v = /unend|viele|∞/.test(t) ? "unendlich" : /kein/.test(t) ? "keine" : null; if (!v) return { ok: false, msg: "Antworte mit <code>keine</code> oder <code>unendlich</code>." }; return v === ans ? { ok: true } : { ok: false, msg: "Setze gleich: Was bleibt übrig?" }; },
      solution: `Gleichsetzen ergibt <span class="math">${n(b)} = ${n(b2)}</span>: ${same ? "wahr ⇒ <b>unendlich viele</b>" : "falsch ⇒ <b>keine</b>"} Lösungen.` };
  }
  LK.trainer({ el: "#trainer", modes: [
    { id: "gleich", label: "Gleichsetzen", gen: genG },
    { id: "ein", label: "Einsetzen", gen: genE },
    { id: "sonder", label: "Sonderfälle", gen: genSpecial }
  ] });

  LK.quiz({ box: "#quizBox", bar: "#qBar", progress: "#qProgress", key: "gleichs.best", n: 8, questions: [
    { q: "Wann eignet sich das Gleichsetzungsverfahren besonders?", o: ["Wenn beide Gleichungen nach derselben Variablen aufgelöst sind", "Wenn keine Gleichung aufgelöst ist", "Bei Brüchen", "Nie"], a: 0, e: "Dann setzt man die Terme direkt gleich." },
    { q: "I: y = 2x, II: y = x + 3. Lösung?", o: ["(3 | 6)", "(6 | 3)", "(2 | 4)", "(1 | 4)"], a: 0, e: "2x = x + 3 ⇒ x = 3, y = 6." },
    { q: "Was muss man beim Einsetzen eines Terms beachten?", o: ["Nichts", "Den Term in Klammern setzen", "Alle Vorzeichen umdrehen", "Durch 2 teilen"], a: 1, e: "Sonst gehen Vorzeichen verloren." },
    { q: "Beim Gleichsetzen entsteht 0 = 4. Was bedeutet das?", o: ["x = 4", "Keine Lösung", "Unendlich viele Lösungen", "y = 0"], a: 1, e: "Falsche Aussage: Die Geraden sind parallel." },
    { q: "Beim Rechnen entsteht 0 = 0. Was bedeutet das?", o: ["Keine Lösung", "Unendlich viele Lösungen", "x = 0", "Rechenfehler"], a: 1, e: "Beide Gleichungen beschreiben dieselbe Gerade." },
    { q: "I: y = x + 1, II: 2x + y = 10. Erster Schritt beim Einsetzen?", o: ["2x + (x + 1) = 10", "2x + x + 1 = 10 + y", "y = 10 − 2x + 1", "x + 1 = 10"], a: 0, e: "y aus I in II einsetzen." },
    { q: "Was gehört zu einer vollständigen Lösung?", o: ["Nur x", "Nur y", "Das Zahlenpaar (x | y)", "Die Steigung"], a: 2, e: "Beide Variablen." },
    { q: "Wie prüft man die Lösung?", o: ["Gar nicht", "In beide Gleichungen einsetzen", "Nur in die erste einsetzen", "Mit dem Taschenrechner"], a: 1, e: "Beide müssen stimmen." }
  ] });

  LK.views(["verstehen", "schritte", "ueben", "alltag", "quiz"], {});
})();
