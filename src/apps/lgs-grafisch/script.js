(function () {
  "use strict";
  const { $, $$, pick, rnd, nz, fmt } = LK;
  const X0 = 230, Y0 = 170, U = 24, XM = 9, YM = 6;
  const sx = (x) => X0 + x * U, sy = (y) => Y0 - y * U;
  const n = (v, d = 2) => fmt(Math.abs(v) < 1e-12 ? 0 : v, d).replace("-", "−");
  const eqHtml = (a, b, c) => { const t = (k, v, first) => k === 0 ? "" : `${first ? (k < 0 ? "−" : "") : k < 0 ? " − " : " + "}${Math.abs(k) === 1 ? "" : Math.abs(k)}<i>${v}</i>`; const l = t(a, "x", true) + t(b, "y", a === 0); return `${l || "0"} = ${n(c, 0)}`; };
  const S = [{ a: 1, b: 1, c: 5 }, { a: 1, b: -1, c: 1 }];
  $("#gCtl").innerHTML = S.map((_, k) => `<div class="stack"><p class="eqh" id="eq${k}"></p>${["a", "b", "c"].map((p) => `<div class="eqrow"><label for="s${k}${p}"><i>${p}</i>${k + 1}</label><input type="range" id="s${k}${p}" min="${p === "c" ? -10 : -4}" max="${p === "c" ? 10 : 4}" step="1" value="${S[k][p]}"></div>`).join("")}</div>`).join("<hr>") + `<p class="state" id="gState"></p><div class="row"><button type="button" data-pre="0">schneiden</button><button type="button" data-pre="1">parallel</button><button type="button" data-pre="2">identisch</button></div>`;
  const PRE = [[[1, 1, 5], [1, -1, 1]], [[2, -1, -2], [-4, 2, 6]], [[1, 2, 4], [2, 4, 8]]];
  $$("[data-pre]").forEach((b) => b.addEventListener("click", () => { PRE[+b.dataset.pre].forEach((e, k) => ["a", "b", "c"].forEach((p, i) => { $(`#s${k}${p}`).value = e[i]; })); draw(); }));
  function lineSvg(a, b, c, cls) {
    if (b !== 0) { const y = (x) => (c - a * x) / b; return `<line class="${cls}" x1="${sx(-XM)}" y1="${sy(y(-XM))}" x2="${sx(XM)}" y2="${sy(y(XM))}"/>`; }
    if (a !== 0) { const x = c / a; return `<line class="${cls}" x1="${sx(x)}" y1="${sy(YM)}" x2="${sx(x)}" y2="${sy(-YM)}"/>`; }
    return "";
  }
  function draw() {
    const E = [0, 1].map((k) => ({ a: +$(`#s${k}a`).value, b: +$(`#s${k}b`).value, c: +$(`#s${k}c`).value }));
    E.forEach((e, k) => { $(`#eq${k}`).innerHTML = `${k ? "II" : "I"}: ${eqHtml(e.a, e.b, e.c)}`; });
    let s = `<defs><clipPath id="clipL"><rect x="${sx(-XM)}" y="${sy(YM)}" width="${2 * XM * U}" height="${2 * YM * U}"/></clipPath></defs>`;
    for (let i = -XM; i <= XM; i++) s += `<line class="gl" x1="${sx(i)}" y1="${sy(YM)}" x2="${sx(i)}" y2="${sy(-YM)}"/>`;
    for (let j = -YM; j <= YM; j++) s += `<line class="gl" x1="${sx(-XM)}" y1="${sy(j)}" x2="${sx(XM)}" y2="${sy(j)}"/>`;
    s += `<line class="ax" x1="${sx(-XM)}" y1="${Y0}" x2="${sx(XM)}" y2="${Y0}"/><line class="ax" x1="${X0}" y1="${sy(YM)}" x2="${X0}" y2="${sy(-YM)}"/>`;
    for (let i = -8; i <= 8; i += 2) if (i) s += `<text x="${sx(i)}" y="${Y0 + 13}" text-anchor="middle">${n(i, 0)}</text>`;
    for (let j = -6; j <= 6; j += 2) if (j) s += `<text x="${X0 - 5}" y="${sy(j) + 4}" text-anchor="end">${n(j, 0)}</text>`;
    s += `<g clip-path="url(#clipL)">${lineSvg(E[0].a, E[0].b, E[0].c, "g1")}${lineSvg(E[1].a, E[1].b, E[1].c, "g2")}`;
    const det = E[0].a * E[1].b - E[1].a * E[0].b;
    let state, text;
    const degenerate = E.some((e) => e.a === 0 && e.b === 0);
    if (degenerate) { state = "–"; text = "Eine Gleichung enthält weder x noch y. Stelle a oder b ungleich 0 ein."; }
    else if (det !== 0) {
      const x = (E[0].c * E[1].b - E[1].c * E[0].b) / det, y = (E[0].a * E[1].c - E[1].a * E[0].c) / det;
      s += `<circle class="sp" cx="${sx(x)}" cy="${sy(y)}" r="6"/><text class="sl" x="${sx(x) + 9}" y="${sy(y) - 9}">(${n(x)} | ${n(y)})</text>`;
      state = "genau eine Lösung"; text = `Die Geraden schneiden sich im Punkt <strong>(${n(x)} | ${n(y)})</strong>. Probe: I: ${n(E[0].a * x + E[0].b * y)} = ${n(E[0].c, 0)} ✓, II: ${n(E[1].a * x + E[1].b * y)} = ${n(E[1].c, 0)} ✓`;
    } else {
      const same = E[0].a * E[1].c === E[1].a * E[0].c && E[0].b * E[1].c === E[1].b * E[0].c;
      state = same ? "unendlich viele Lösungen" : "keine Lösung";
      text = same ? "Beide Gleichungen beschreiben <strong>dieselbe Gerade</strong>: Jeder Punkt der Geraden ist eine Lösung." : "Die Geraden sind <strong>parallel</strong>: Sie haben keinen gemeinsamen Punkt, das Gleichungssystem hat keine Lösung.";
    }
    s += "</g>";
    $("#gSvg").innerHTML = s; $("#gState").textContent = state; $("#gText").innerHTML = text;
  }
  $$("#gCtl input").forEach((i) => i.addEventListener("input", draw));

  // ---------- trainer ----------
  const pairCheck = (x0, y0) => (raw) => { const p = String(raw).replace(/[()\s]/g, "").replace(/[−–]/g, "-").split(/[|;]/); if (p.length !== 2) return { ok: false, msg: "Schreibe das Paar als <code>(3|2)</code>." }; const a = LK.parseNum(p[0]), b = LK.parseNum(p[1]); return Math.abs(a - x0) < 1e-6 && Math.abs(b - y0) < 1e-6 ? { ok: true } : { ok: false, msg: "Das Paar erfüllt nicht beide Gleichungen." }; };
  function genIsSol() {
    const a = nz(-4, 4), b = nz(-4, 4), x = rnd(-4, 4), y = rnd(-4, 4), ok = Math.random() < 0.5, c = a * x + b * y + (ok ? 0 : pick([-2, -1, 1, 2]));
    return { html: `Ist (${n(x, 0)} | ${n(y, 0)}) eine Lösung von <span class="math">${eqHtml(a, b, c)}</span>?`, label: "Antwort:", placeholder: "ja oder nein", answer: ok ? "ja" : "nein",
      check: (raw) => { const t = raw.trim().toLowerCase(); if (!/^(ja|nein)/.test(t)) return { ok: false, msg: "Antworte mit <code>ja</code> oder <code>nein</code>." }; return t.startsWith(ok ? "ja" : "nein") ? { ok: true } : { ok: false, msg: "Setze x und y ein und vergleiche." }; },
      solution: `${n(a, 0)} · ${x < 0 ? "(" + n(x, 0) + ")" : n(x, 0)} + ${n(b, 0)} · ${y < 0 ? "(" + n(y, 0) + ")" : n(y, 0)} = ${n(a * x + b * y, 0)} ${ok ? "=" : "≠"} ${n(c, 0)}: <b>${ok ? "ja" : "nein"}</b>` };
  }
  function genY() {
    const a = nz(-4, 4), b = pick([1, -1, 2, -2]), c = rnd(-8, 8), x = rnd(-4, 4);
    const y = (c - a * x) / b;
    return { html: `<span class="math">${eqHtml(a, b, c)}</span>. Welchen Wert hat <i>y</i> für <i>x</i> = ${n(x, 0)}?`, label: "<i>y</i> =", placeholder: "Zahl", answer: n(y), check: LK.check.num(y, { abs: 1e-6 }), solution: `<b><i>y</i> = ${n(y)}</b>` };
  }
  function genCount() {
    const kind = pick([0, 1, 2]), a = nz(-3, 3), b = nz(-3, 3), c = rnd(-6, 6), k = pick([2, 3, -2]);
    let e2;
    if (kind === 0) { let a2 = nz(-3, 3), b2 = nz(-3, 3); if (a * b2 === a2 * b) b2 = b2 + 1 || 2; e2 = [a2, b2, rnd(-6, 6)]; }
    else if (kind === 1) e2 = [k * a, k * b, k * c + pick([1, 2, -1])];
    else e2 = [k * a, k * b, k * c];
    const ans = ["1", "0", "unendlich"][kind];
    return { html: `Wie viele Lösungen hat das System? I: <span class="math">${eqHtml(a, b, c)}</span>, II: <span class="math">${eqHtml(e2[0], e2[1], e2[2])}</span>`, label: "Anzahl:", placeholder: "0, 1 oder unendlich", answer: ans,
      check: (raw) => { const t = raw.trim().toLowerCase(); const v = /unend|∞|viele/.test(t) ? "unendlich" : /^(0|keine)/.test(t) ? "0" : /^(1|eine|genau)/.test(t) ? "1" : null; if (!v) return { ok: false, msg: "Antworte mit 0, 1 oder unendlich." }; return v === ans ? { ok: true } : { ok: false, msg: "Vergleiche die Steigungen: gleich (parallel oder identisch) oder verschieden?" }; },
      solution: kind === 0 ? "Verschiedene Steigungen: <b>genau eine</b> Lösung." : kind === 1 ? "II ist ein Vielfaches von I, aber mit anderem Wert rechts: parallel, <b>keine</b> Lösung." : "II ist ein Vielfaches von I: dieselbe Gerade, <b>unendlich viele</b> Lösungen." };
  }
  function genSolve() {
    const x = rnd(-4, 4), y = rnd(-4, 4), a1 = nz(-3, 3), b1 = nz(-3, 3); let a2 = nz(-3, 3), b2 = nz(-3, 3); if (a1 * b2 === a2 * b1) { a2 = -a1 || 1; b2 = b1; }
    return { html: `Löse (z. B. grafisch): I: <span class="math">${eqHtml(a1, b1, a1 * x + b1 * y)}</span>, II: <span class="math">${eqHtml(a2, b2, a2 * x + b2 * y)}</span>`, label: "Lösung:", placeholder: "(x|y)", answer: `(${n(x, 0)}|${n(y, 0)})`, check: pairCheck(x, y), solution: `<b>(${n(x, 0)} | ${n(y, 0)})</b>` };
  }
  LK.trainer({ el: "#trainer", modes: [
    { id: "pruefen", label: "Lösung prüfen", gen: genIsSol },
    { id: "y", label: "Zweite Zahl bestimmen", gen: genY },
    { id: "anzahl", label: "Anzahl der Lösungen", gen: genCount },
    { id: "loesen", label: "System lösen", gen: genSolve }
  ] });

  LK.quiz({ box: "#quizBox", bar: "#qBar", progress: "#qProgress", key: "lgs1.best", n: 10, questions: [
    { q: "Wie viele Lösungen hat x + y = 5?", o: ["Eine", "Zwei", "Unendlich viele", "Keine"], a: 2, e: "Jeder Punkt der Geraden ist eine Lösung." },
    { q: "Ist (2 | 3) Lösung von 2x + y = 7?", o: ["Ja", "Nein"], a: 0, e: "4 + 3 = 7." },
    { q: "Was ist die Lösung eines LGS grafisch?", o: ["Die Nullstelle", "Der Schnittpunkt der beiden Geraden", "Der y-Achsenabschnitt", "Die Steigung"], a: 1, e: "Er liegt auf beiden Geraden." },
    { q: "Die Geraden sind parallel. Wie viele Lösungen?", o: ["Keine", "Eine", "Zwei", "Unendlich viele"], a: 0, e: "Kein gemeinsamer Punkt." },
    { q: "Beide Gleichungen beschreiben dieselbe Gerade. Lösungen?", o: ["Keine", "Eine", "Unendlich viele", "Zwei"], a: 2, e: "Alle Punkte der Geraden." },
    { q: "2x + y = 6 nach y umgestellt?", o: ["y = 2x + 6", "y = −2x + 6", "y = 6 − x", "y = 3 − x"], a: 1, e: "2x auf die andere Seite: −2x." },
    { q: "Lösung von I: x + y = 5, II: x − y = 1?", o: ["(2 | 3)", "(3 | 2)", "(4 | 1)", "(1 | 4)"], a: 1, e: "3 + 2 = 5, 3 − 2 = 1." },
    { q: "Warum rechnet man LGS oft lieber, statt sie zu zeichnen?", o: ["Zeichnen ist verboten", "Ablesen ist oft ungenau", "Rechnen ist immer kürzer", "Graphen gibt es nicht"], a: 1, e: "Bei krummen Werten hilft nur Rechnen." }
  ] });

  LK.views(["verstehen", "grafisch", "ueben", "alltag", "quiz"], { grafisch: draw });
})();
