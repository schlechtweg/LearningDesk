(function () {
  "use strict";
  const { $, $$, pick, rnd, nz, fmt, gcd } = LK;
  const n = (v) => fmt(Math.abs(v) < 1e-12 ? 0 : v, 3).replace("-", "−");
  const br = (v) => (v < 0 ? `(${n(v)})` : n(v));
  const term = (k, v, first) => k === 0 ? "" : `${first ? (k < 0 ? "−" : "") : k < 0 ? " − " : " + "}${Math.abs(k) === 1 ? "" : Math.abs(k)}<i>${v}</i>`;
  const eq2 = (a, b, c) => `${term(a, "x", true) + term(b, "y", a === 0) || "0"} = ${n(c)}`;

  // random system with integer solution, unique and with no coefficient pair already opposite
  function sys(lo = -4, hi = 5) {
    for (;;) {
      const x = rnd(lo, hi), y = rnd(lo, hi), a1 = nz(-5, 5), b1 = nz(-5, 5), a2 = nz(-5, 5), b2 = nz(-5, 5);
      if (a1 * b2 - a2 * b1 === 0) continue;
      return { x, y, e1: [a1, b1, a1 * x + b1 * y], e2: [a2, b2, a2 * x + b2 * y] };
    }
  }
  // factors k1, k2 so that k1*p + k2*q = 0 with small numbers and k1 > 0
  function factors(p, q) { const g = gcd(Math.abs(p), Math.abs(q)); let k1 = Math.abs(q) / g, k2 = -Math.sign(p) * Math.sign(q) * Math.abs(p) / g; return [k1, k2]; }

  // ---------- step-by-step ----------
  let elim = "y", S = null, steps = [], shown = 0;
  function build() {
    const { x, y, e1, e2 } = S, i = elim === "y" ? 1 : 0, o = 1 - i;
    const [k1, k2] = factors(e1[i], e2[i]);
    const m1 = e1.map((v) => v * k1), m2 = e2.map((v) => v * k2);
    const sum = [m1[0] + m2[0], m1[1] + m2[1], m1[2] + m2[2]];
    const v = elim === "y" ? "x" : "y", w = elim, val = elim === "y" ? x : y, other = elim === "y" ? y : x;
    const st = [];
    st.push([`Ziel: Die Koeffizienten von <i>${w}</i> (${n(e1[i])} und ${n(e2[i])}) sollen entgegengesetzt werden.`, "Dann fällt die Variable beim Addieren weg."]);
    st.push([`Multiplizieren: I · ${br(k1)}, II · ${br(k2)}`, `${n(e1[i])} · ${br(k1)} = ${n(m1[i])} und ${n(e2[i])} · ${br(k2)} = ${n(m2[i])}`]);
    st.push([`<span class="math">I′: ${eq2(...m1)}</span><br><span class="math">II′: ${eq2(...m2)}</span>`, "Alle Zahlen multiplizieren, auch die rechte Seite."]);
    st.push([`Addieren: <span class="math">${eq2(...sum)}</span>`, `<i>${w}</i> fällt weg.`]);
    st.push([`Durch ${br(sum[o])} teilen: <span class="math"><b><i>${v}</i> = ${n(val)}</b></span>`, ""]);
    const rest = e1[2] - e1[o] * val;
    st.push([`In I einsetzen: <span class="math">${n(e1[o])} · ${br(val)} ${e1[i] < 0 ? "−" : "+"} ${Math.abs(e1[i]) === 1 ? "" : Math.abs(e1[i])}<i>${w}</i> = ${n(e1[2])}</span> ⇒ <span class="math"><b><i>${w}</i> = ${n(other)}</b></span>`, `${term(e1[i], w, true)} = ${n(rest)}`]);
    st.push([`Probe in II: <span class="math">${n(e2[0])} · ${br(x)} ${e2[1] < 0 ? "−" : "+"} ${Math.abs(e2[1])} · ${br(y)} = ${n(e2[2])}</span> ✓`, ""]);
    st.push([`Lösung: <span class="math"><b>(${n(x)} | ${n(y)})</b></span>`, ""]);
    return st;
  }
  function newSys() { S = sys(); redo(); }
  function redo() { $("#sSys").innerHTML = `I: ${eq2(...S.e1)}<br>II: ${eq2(...S.e2)}`; steps = build(); shown = 0; paint(); }
  function paint() { $("#sSteps").innerHTML = steps.slice(0, shown).map(([t, w]) => `<li>${t}${w ? `<span class="why">${w}</span>` : ""}</li>`).join(""); $("#sNext").disabled = shown >= steps.length; }
  $("#sNext").addEventListener("click", () => { if (shown < steps.length) { shown++; paint(); } });
  $("#sAll").addEventListener("click", () => { shown = steps.length; paint(); });
  $("#sNew").addEventListener("click", newSys);
  $$("[data-v]").forEach((b) => b.addEventListener("click", () => { elim = b.dataset.v; $$("[data-v]").forEach((x) => x.setAttribute("aria-pressed", String(x === b))); redo(); }));
  newSys();

  // ---------- trainer ----------
  const pairCheck = (x0, y0) => (raw) => { const p = String(raw).replace(/[()\s]/g, "").replace(/[−–]/g, "-").split(/[|;]/); if (p.length !== 2) return { ok: false, msg: "Schreibe die Lösung als <code>(2|5)</code>." }; const a = LK.parseNum(p[0]), b = LK.parseNum(p[1]); return Math.abs(a - x0) < 1e-6 && Math.abs(b - y0) < 1e-6 ? { ok: true } : { ok: false, msg: "Prüfe dein Ergebnis durch Einsetzen in beide Gleichungen." }; };
  function genDirect() {
    const x = rnd(-4, 5), y = rnd(-4, 5), a1 = nz(-5, 5), a2 = nz(-5, 5), b = nz(1, 5), s = pick([1, -1]);
    if (a1 + a2 === 0) return genDirect();
    return { html: `Addiere die Gleichungen: I: ${eq2(a1, s * b, a1 * x + s * b * y)}, II: ${eq2(a2, -s * b, a2 * x - s * b * y)}`, label: "Lösung:", placeholder: "(x|y)", answer: `(${n(x)}|${n(y)})`, check: pairCheck(x, y), solution: `I + II: ${eq2(a1 + a2, 0, (a1 + a2) * x)} ⇒ <i>x</i> = ${n(x)}, <i>y</i> = ${n(y)}: <b>(${n(x)} | ${n(y)})</b>` };
  }
  function genFactors() {
    const { e1, e2 } = sys(); const i = pick([0, 1]); const [k1, k2] = factors(e1[i], e2[i]); const v = i ? "y" : "x";
    return { html: `I: ${eq2(...e1)}, II: ${eq2(...e2)}. Mit welchen Zahlen multiplizierst du I und II, damit <i>${v}</i> beim Addieren wegfällt? (kleinste Zahlen, Faktor für I positiv)`, label: "Faktoren:", placeholder: "z. B. 2; -3", answer: `${k1}; ${k2}`,
      check: (raw) => { const p = String(raw).replace(/[−–]/g, "-").split(/[;|]/).map((t) => LK.parseNum(t.trim())); if (p.length !== 2 || p.some(isNaN)) return { ok: false, msg: "Zwei Zahlen, getrennt durch <code>;</code>." }; return p[0] * e1[i] + p[1] * e2[i] === 0 && p[0] !== 0 ? { ok: true, msg: p[0] === k1 && p[1] === k2 ? "" : "Das funktioniert, geht aber auch mit kleineren Zahlen." } : { ok: false, msg: `Die Koeffizienten von <i>${v}</i> müssen danach entgegengesetzt sein.` }; },
      solution: `I · ${br(k1)}, II · ${br(k2)}: ${n(e1[i] * k1)}<i>${v}</i> und ${n(e2[i] * k2)}<i>${v}</i>` };
  }
  function genSolve() { const { x, y, e1, e2 } = sys(); return { html: `Löse mit dem Additionsverfahren: I: ${eq2(...e1)}, II: ${eq2(...e2)}`, label: "Lösung:", placeholder: "(x|y)", answer: `(${n(x)}|${n(y)})`, check: pairCheck(x, y), solution: `<b>(${n(x)} | ${n(y)})</b>` }; }
  function genWhich() {
    const t = rnd(0, 2), x = rnd(-3, 4), y = rnd(-3, 4), m1 = nz(-3, 3), m2 = pick([-3, -2, -1, 1, 2, 3].filter((v) => v !== m1));
    const lin = (m, b) => `${m === 1 ? "" : m === -1 ? "−" : n(m)}<i>x</i>${b === 0 ? "" : b > 0 ? " + " + n(b) : " − " + n(-b)}`;
    let html, ans;
    if (t === 0) { html = `I: <i>y</i> = ${lin(m1, y - m1 * x)}, II: <i>y</i> = ${lin(m2, y - m2 * x)}`; ans = "gleichsetzen"; }
    else if (t === 1) { const a = nz(2, 5), b = nz(2, 4); html = `I: <i>y</i> = ${lin(m1, y - m1 * x)}, II: ${eq2(a, b, a * x + b * y)}`; ans = "einsetzen"; }
    else { const a1 = nz(2, 5), a2 = nz(2, 5), b = nz(2, 5); html = `I: ${eq2(a1, b, a1 * x + b * y)}, II: ${eq2(a2, -b, a2 * x - b * y)}`; ans = "addieren"; }
    return { html: `Welches Verfahren bietet sich an? ${html}`, label: "Verfahren:", placeholder: "gleichsetzen, einsetzen, addieren", answer: ans,
      check: (raw) => { const r = raw.trim().toLowerCase(); const v = /gleich/.test(r) ? "gleichsetzen" : /einsetz/.test(r) ? "einsetzen" : /add/.test(r) ? "addieren" : null; if (!v) return { ok: false, msg: "Antworte mit <code>gleichsetzen</code>, <code>einsetzen</code> oder <code>addieren</code>." }; return v === ans ? { ok: true } : { ok: false, msg: "Schau, in welcher Form die Gleichungen stehen." }; },
      solution: `<b>${ans}</b>` };
  }
  LK.trainer({ el: "#trainer", modes: [
    { id: "direkt", label: "Direkt addieren", gen: genDirect },
    { id: "faktor", label: "Faktoren finden", gen: genFactors },
    { id: "loesen", label: "Lösen", gen: genSolve },
    { id: "welches", label: "Welches Verfahren?", gen: genWhich }
  ] });

  LK.quiz({ box: "#quizBox", bar: "#qBar", progress: "#qProgress", key: "addv.best", n: 8, questions: [
    { q: "Was ist das Ziel beim Additionsverfahren?", o: ["Beide Variablen verdoppeln", "Eine Variable fällt beim Addieren weg", "Die Gleichungen nach y auflösen", "Die rechte Seite wird 0"], a: 1, e: "Dann bleibt eine Gleichung mit einer Variablen." },
    { q: "I: x + y = 10, II: x − y = 2. Was ergibt I + II?", o: ["2x = 12", "2y = 8", "x = 8", "0 = 12"], a: 0, e: "y − y = 0, also 2x = 12, x = 6, y = 4." },
    { q: "I: 2x + 3y = 7, II: x + y = 3. Womit multipliziert man II, damit x wegfällt?", o: ["2", "−2", "3", "−3"], a: 1, e: "2x + (−2x) = 0." },
    { q: "Beim Multiplizieren einer Gleichung …", o: ["nur die linke Seite", "nur die Variablen", "jede Zahl, auch rechts", "nur die rechte Seite"], a: 2, e: "Sonst ist die Gleichung nicht mehr gleichwertig." },
    { q: "I: 4x + 2y = 10, II: 4x − y = 7. Am schnellsten?", o: ["I − II", "I + II", "I · 4", "Gleichsetzen"], a: 0, e: "Subtrahieren: 3y = 3." },
    { q: "Nach dem Addieren entsteht 0 = 6. Bedeutung?", o: ["x = 6", "keine Lösung", "unendlich viele", "y = 6"], a: 1, e: "Falsche Aussage: parallele Geraden." },
    { q: "Welches Verfahren passt bei y = 2x + 1 und y = −x + 4 am besten?", o: ["Addieren", "Gleichsetzen", "Raten", "Keins"], a: 1, e: "Beide sind nach y aufgelöst." },
    { q: "I: 3x + 5y = 1, II: 2x + 3y = 1. Faktoren, damit x wegfällt?", o: ["I · 2, II · (−3)", "I · 3, II · 2", "I · 5, II · 3", "I · (−1), II · 1"], a: 0, e: "6x − 6x = 0." }
  ] });

  LK.views(["verstehen", "schritte", "ueben", "alltag", "quiz"], {});
})();
