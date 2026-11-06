(function () {
  "use strict";
  const { $, pick, rnd, nz, fmt, gcd } = LK;
  const X0 = 230, Y0 = 170, U = 26, XM = 8, YM = 6;
  const sx = (x) => X0 + x * U, sy = (y) => Y0 - y * U;
  const n = (v) => fmt(Math.abs(v) < 1e-12 ? 0 : v, 3).replace("-", "−");
  const fracT = (p, q) => { if (q < 0) { p = -p; q = -q; } const g = gcd(p, q) || 1; p /= g; q /= g; return q === 1 ? n(p) : `${p < 0 ? "−" : ""}${Math.abs(p)}/${q}`; };
  const term = (m, b) => `${m === 0 ? "" : m === 1 ? "x" : m === -1 ? "−x" : n(m) + "x"}${b === 0 ? (m === 0 ? "0" : "") : (m === 0 ? n(b) : b > 0 ? " + " + n(b) : " − " + n(-b))}`;
  let P = null, Q = null;
  function grid() {
    let s = "";
    for (let i = -XM; i <= XM; i++) s += `<line class="gl" x1="${sx(i)}" y1="${sy(YM)}" x2="${sx(i)}" y2="${sy(-YM)}"/>`;
    for (let j = -YM; j <= YM; j++) s += `<line class="gl" x1="${sx(-XM)}" y1="${sy(j)}" x2="${sx(XM)}" y2="${sy(j)}"/>`;
    s += `<line class="ax" x1="${sx(-XM)}" y1="${Y0}" x2="${sx(XM)}" y2="${Y0}"/><line class="ax" x1="${X0}" y1="${sy(YM)}" x2="${X0}" y2="${sy(-YM)}"/>`;
    for (let i = -XM; i <= XM; i += 2) if (i) s += `<text x="${sx(i)}" y="${Y0 + 13}" text-anchor="middle">${n(i)}</text>`;
    for (let j = -YM; j <= YM; j += 2) if (j) s += `<text x="${X0 - 5}" y="${sy(j) + 4}" text-anchor="end">${n(j)}</text>`;
    return s;
  }
  function draw() {
    let s = `<defs><clipPath id="clipP"><rect x="${sx(-XM)}" y="${sy(YM)}" width="${2 * XM * U}" height="${2 * YM * U}"/></clipPath></defs>` + grid();
    let ro = "", txt = "";
    if (P && Q && P[0] !== Q[0]) {
      const dy = Q[1] - P[1], dx = Q[0] - P[0], m = dy / dx, b = P[1] - m * P[0];
      s += `<g clip-path="url(#clipP)"><line class="g1" x1="${sx(-XM)}" y1="${sy(m * -XM + b)}" x2="${sx(XM)}" y2="${sy(m * XM + b)}"/></g>`;
      s += `<path class="tri" d="M${sx(P[0])} ${sy(P[1])} H${sx(Q[0])} V${sy(Q[1])}"/><text class="tl" x="${(sx(P[0]) + sx(Q[0])) / 2}" y="${sy(P[1]) + (dy >= 0 ? 15 : -6)}" text-anchor="middle">${n(dx)}</text><text class="tl" x="${sx(Q[0]) + 6}" y="${(sy(P[1]) + sy(Q[1])) / 2 + 4}">${n(dy)}</text>`;
      const mt = fracT(dy, dx), bNum = P[1] * dx - dy * P[0], bt = fracT(bNum, dx);
      ro = `<dt>Steigung <i>m</i></dt><dd class="big">${mt}</dd><dt><i>y</i>-Achsenabschnitt <i>b</i></dt><dd class="big">${bt}</dd><dt>Gleichung</dt><dd class="math"><i>f</i>(<i>x</i>) = ${term(m, b)}</dd>`;
      txt = `1. Steigung: <span class="math"><i>m</i> = (${n(Q[1])} − ${P[1] < 0 ? "(" + n(P[1]) + ")" : n(P[1])}) : (${n(Q[0])} − ${P[0] < 0 ? "(" + n(P[0]) + ")" : n(P[0])}) = ${n(dy)} : ${n(dx)} = ${mt}</span>.<br>2. P einsetzen: <span class="math">${n(P[1])} = ${mt} · ${P[0] < 0 ? "(" + n(P[0]) + ")" : n(P[0])} + <i>b</i> ⇒ <i>b</i> = ${bt}</span>.<br>3. Ergebnis: <strong><span class="math"><i>f</i>(<i>x</i>) = ${term(m, b)}</span></strong>. Probe mit Q: <span class="math"><i>f</i>(${n(Q[0])}) = ${n(m * Q[0] + b)}</span> ✓`;
    } else if (P && Q) { ro = `<dt>Hinweis</dt><dd>senkrechte Linie</dd>`; txt = "P und Q liegen senkrecht übereinander. Eine senkrechte Gerade ist kein Graph einer Funktion. Setze Q neu."; }
    else txt = P ? "Tippe jetzt den zweiten Punkt Q an." : "Tippe den ersten Punkt P an.";
    [[P, "P"], [Q, "Q"]].forEach(([pt, name]) => { if (pt) s += `<circle class="pq" cx="${sx(pt[0])}" cy="${sy(pt[1])}" r="6"/><text class="pl" x="${sx(pt[0]) + 8}" y="${sy(pt[1]) - 8}">${name}(${n(pt[0])} | ${n(pt[1])})</text>`; });
    $("#pSvg").innerHTML = s; $("#pRo").innerHTML = ro; $("#pText").innerHTML = txt;
  }
  $("#pSvg").addEventListener("click", (e) => {
    const r = $("#pSvg").getBoundingClientRect(), vx = (e.clientX - r.left) / r.width * 460, vy = (e.clientY - r.top) / r.height * 340;
    const x = Math.max(-XM, Math.min(XM, Math.round((vx - X0) / U))), y = Math.max(-YM, Math.min(YM, Math.round((Y0 - vy) / U)));
    if (!P || (P && Q)) { P = [x, y]; Q = null; } else Q = [x, y];
    draw();
  });
  $("#pReset").addEventListener("click", () => { P = [1, 2]; Q = [4, 8]; draw(); });
  P = [1, 2]; Q = [4, 8];

  // ---------- trainer ----------
  const eqCheck = (m, b) => (raw) => {
    const t = String(raw).replace(/^\s*(y|f\(x\))\s*=\s*/i, "");
    let g; try { g = LK.parse(t); } catch (e) { return { ok: false, msg: "Schreibe die Gleichung z. B. als <code>2x-1</code>." }; }
    return LK.sameFn(g, (env) => m * env.x + b, "x") ? { ok: true } : { ok: false, msg: "Bestimme erst m, dann b durch Einsetzen eines Punktes." };
  };
  function genMP() {
    const m = nz(-4, 4), x = rnd(-4, 4), b = rnd(-6, 6), y = m * x + b;
    return { html: `Eine Gerade hat die Steigung <i>m</i> = ${n(m)} und geht durch P(${n(x)} | ${n(y)}). Gleichung?`, label: "<i>f</i>(<i>x</i>) =", placeholder: "z. B. 2x-1", answer: term(m, b), check: eqCheck(m, b),
      solution: `<span class="math">${n(y)} = ${n(m)} · ${x < 0 ? "(" + n(x) + ")" : n(x)} + <i>b</i> ⇒ <i>b</i> = ${n(b)}</span>: <b><i>f</i>(<i>x</i>) = ${term(m, b)}</b>` };
  }
  function genPQ() {
    const m = nz(-3, 3), b = rnd(-5, 5), x1 = rnd(-4, 2), x2 = x1 + rnd(1, 4);
    return { html: `Bestimme die Gleichung der Geraden durch P(${n(x1)} | ${n(m * x1 + b)}) und Q(${n(x2)} | ${n(m * x2 + b)}).`, label: "<i>f</i>(<i>x</i>) =", placeholder: "z. B. 2x-1", answer: term(m, b), check: eqCheck(m, b),
      solution: `<i>m</i> = ${n(m * (x2 - x1))} : ${n(x2 - x1)} = ${n(m)}; <i>b</i> = ${n(b)}: <b><i>f</i>(<i>x</i>) = ${term(m, b)}</b>` };
  }
  function genText() {
    const T = pick([() => { const g = pick([3, 3.5, 4, 4.5]), k = pick([1.8, 2, 2.2, 2.5]); return [`Ein Taxi kostet ${n(g)} € Grundgebühr und ${n(k)} € pro km. Preis <i>f</i>(<i>x</i>) für <i>x</i> km?`, k, g]; },
      () => { const h = pick([20, 24, 30]), v = pick([1.5, 2, 3]); return [`Eine Kerze ist ${h} cm lang und brennt ${n(v)} cm pro Stunde ab. Höhe nach <i>x</i> Stunden?`, -v, h]; },
      () => { const s0 = pick([20, 50, 80]), w = pick([5, 10, 15]); return [`Im Sparschwein sind ${s0} €, jede Woche kommen ${w} € dazu. Betrag nach <i>x</i> Wochen?`, w, s0]; }])();
    return { html: T[0], label: "<i>f</i>(<i>x</i>) =", placeholder: "Gleichung", answer: term(T[1], T[2]), check: eqCheck(T[1], T[2]), solution: `<b><i>f</i>(<i>x</i>) = ${term(T[1], T[2])}</b>` };
  }
  LK.trainer({ el: "#trainer", modes: [
    { id: "mp", label: "Steigung und Punkt", gen: genMP },
    { id: "pq", label: "Zwei Punkte", gen: genPQ },
    { id: "text", label: "Aus einem Text", gen: genText }
  ] });

  LK.quiz({ box: "#quizBox", bar: "#qBar", progress: "#qProgress", key: "fgl.best", n: 10, questions: [
    { q: "m = 3, P(1 | 5). Wie groß ist b?", o: ["2", "5", "8", "−2"], a: 0, e: "5 = 3 · 1 + b ⇒ b = 2." },
    { q: "Gerade durch P(0 | 4) und Q(2 | 8). Gleichung?", o: ["y = 2x + 4", "y = 4x + 2", "y = 2x + 8", "y = x + 4"], a: 0, e: "m = 4 : 2 = 2, b = 4." },
    { q: "Steigung durch P(2 | 7) und Q(5 | 1)?", o: ["2", "−2", "−3", "6"], a: 1, e: "(1 − 7) : (5 − 2) = −2." },
    { q: "Was setzt man ein, um b zu bestimmen?", o: ["Nur m", "Einen Punkt der Geraden und m", "Die Nullstelle", "Nichts"], a: 1, e: "y = mx + b mit bekannten x, y, m." },
    { q: "Taxi: 4 € Grundpreis, 2 € pro km. Gleichung?", o: ["f(x) = 4x + 2", "f(x) = 2x + 4", "f(x) = 6x", "f(x) = 2x − 4"], a: 1, e: "Grundpreis = b, Preis pro km = m." },
    { q: "Wie prüft man das Ergebnis?", o: ["Gar nicht", "Den zweiten Punkt einsetzen", "Die Steigung verdoppeln", "x = 0 setzen"], a: 1, e: "Er muss die Gleichung erfüllen." },
    { q: "Eine Gerade geht durch (0 | −3) und hat m = 0,5. Gleichung?", o: ["y = −3x + 0,5", "y = 0,5x − 3", "y = 0,5x + 3", "y = −0,5x − 3"], a: 1, e: "b ist der y-Wert bei x = 0." },
    { q: "Warum gibt es durch P(2 | 1) und Q(2 | 5) keine lineare Funktion?", o: ["Weil die Punkte zu weit auseinander liegen", "Weil die Gerade senkrecht wäre", "Weil 1 < 5", "Es gibt sie doch"], a: 1, e: "Zu x = 2 gehörten zwei y-Werte." }
  ] });

  LK.views(["verstehen", "punkte", "ueben", "alltag", "quiz"], { punkte: draw });
})();
