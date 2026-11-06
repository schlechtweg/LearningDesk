(function () {
  "use strict";
  const { $, pick, rnd, nz, fmt } = LK;
  const F = [
    { name: "f(x) = 2x − 3", f: (x) => 2 * x - 3, sym: "keine Symmetrie" },
    { name: "f(x) = x² − 4", f: (x) => x * x - 4, sym: "achsensymmetrisch zur y-Achse" },
    { name: "f(x) = −(x − 1)² + 4", f: (x) => -((x - 1) ** 2) + 4, sym: "keine Symmetrie zum Koordinatensystem (symmetrisch zur Geraden x = 1)" },
    { name: "f(x) = 0,25x³ − 2x", f: (x) => 0.25 * x ** 3 - 2 * x, sym: "punktsymmetrisch zum Ursprung" },
    { name: "f(x) = 0,5x", f: (x) => 0.5 * x, sym: "punktsymmetrisch zum Ursprung" },
    { name: "f(x) = |x| − 2", f: (x) => Math.abs(x) - 2, sym: "achsensymmetrisch zur y-Achse" },
    { name: "f(x) = −x + 2", f: (x) => -x + 2, sym: "keine Symmetrie" }
  ];
  $("#eSel").innerHTML = F.map((f, i) => `<option value="${i}">${f.name}</option>`).join("");
  const X0 = 230, Y0 = 160, U = 28, XMIN = -7, XMAX = 7;
  const sx = (x) => X0 + x * U, sy = (y) => Y0 - y * U;
  const fmtN = (v) => fmt(Math.abs(v) < 1e-9 ? 0 : v, 2).replace("-", "−");
  function analyse(f) {
    const h = 0.01, zeros = [], ext = [], segs = [];
    let prevY = f(XMIN), prevD = Math.sign(f(XMIN + h) - f(XMIN)), segStart = XMIN;
    for (let x = XMIN + h; x <= XMAX + 1e-9; x += h) {
      const y = f(x);
      if (prevY === 0 || prevY * y < 0) { const z = Math.abs(prevY) < Math.abs(y) ? x - h : x; zeros.push(Math.round(z * 100) / 100); }
      const d = Math.sign(f(x + h) - y);
      if (d !== prevD && d !== 0 && prevD !== 0) { ext.push({ x: Math.round(x * 100) / 100, y: f(Math.round(x * 100) / 100), type: prevD > 0 ? "Hochpunkt" : "Tiefpunkt" }); segs.push([segStart, x, prevD]); segStart = x; }
      if (d !== 0) prevD = d;
      prevY = y;
    }
    segs.push([segStart, XMAX, prevD]);
    return { zeros: zeros.filter((z, i, a) => i === 0 || Math.abs(z - a[i - 1]) > 0.05), ext, segs };
  }
  function draw() {
    const fn = F[+$("#eSel").value], A = analyse(fn.f);
    let s = "";
    for (let i = XMIN; i <= XMAX; i++) s += `<line class="gl" x1="${sx(i)}" y1="10" x2="${sx(i)}" y2="300"/>`;
    for (let j = -5; j <= 5; j++) s += `<line class="gl" x1="${sx(XMIN)}" y1="${sy(j)}" x2="${sx(XMAX)}" y2="${sy(j)}"/>`;
    s += `<line class="ax" x1="${sx(XMIN)}" y1="${Y0}" x2="${sx(XMAX)}" y2="${Y0}"/><line class="ax" x1="${X0}" y1="10" x2="${X0}" y2="300"/>`;
    for (let i = XMIN; i <= XMAX; i++) if (i) s += `<text x="${sx(i)}" y="${Y0 + 13}" text-anchor="middle">${String(i).replace("-", "−")}</text>`;
    for (let j = -5; j <= 5; j++) if (j) s += `<text x="${X0 - 5}" y="${sy(j) + 4}" text-anchor="end">${String(j).replace("-", "−")}</text>`;
    let d = "", pen = false;
    for (let x = XMIN; x <= XMAX; x += 0.05) { const y = fn.f(x); if (Math.abs(y) > 5.6) { pen = false; continue; } d += `${pen ? "L" : "M"}${sx(x).toFixed(1)} ${sy(y).toFixed(1)} `; pen = true; }
    s += `<path class="gr" d="${d}"/>`;
    if ($("#eM").checked) A.segs.forEach(([a, b, dir]) => { s += `<rect class="${dir > 0 ? "up" : "down"}" x="${sx(a)}" y="312" width="${Math.max(0, sx(b) - sx(a))}" height="10"/>`; });
    if ($("#eM").checked) s += `<text class="lab" x="${sx(XMIN)}" y="336">steigt (grün) / fällt (orange)</text>`;
    if ($("#eN").checked) A.zeros.forEach((z) => { s += `<circle class="zero" cx="${sx(z)}" cy="${Y0}" r="5.5"/>`; });
    const y0 = fn.f(0);
    if ($("#eY").checked && Math.abs(y0) < 5.6) s += `<circle class="yint" cx="${X0}" cy="${sy(y0)}" r="5.5"/>`;
    if ($("#eE").checked) A.ext.forEach((e) => { if (Math.abs(e.y) < 5.6) s += `<circle class="ext" cx="${sx(e.x)}" cy="${sy(e.y)}" r="8"/><text class="lab" x="${sx(e.x) + 10}" y="${sy(e.y) + (e.type === "Hochpunkt" ? -8 : 16)}">${e.type === "Hochpunkt" ? "H" : "T"}(${fmtN(e.x)} | ${fmtN(e.y)})</text>`; });
    $("#eSvg").innerHTML = s;
    const mono = A.segs.map(([a, b, dir]) => (a <= XMIN + 0.01 && b >= XMAX - 0.01) ? `${dir > 0 ? "steigend" : "fallend"} für alle x` : `${dir > 0 ? "steigend" : "fallend"} für ${a <= XMIN + 0.01 ? "x" : fmtN(a) + " ≤ x"}${b >= XMAX - 0.01 ? "" : " ≤ " + fmtN(b)}`).join("; ");
    $("#eRo").innerHTML = `<dt>Nullstellen</dt><dd>${A.zeros.length ? A.zeros.map(fmtN).join("; ") : "keine"}</dd><dt>Schnittpunkt <i>y</i>-Achse</dt><dd>(0 | ${fmtN(y0)})</dd><dt>Steigen/Fallen</dt><dd style="text-align:right">${mono}</dd><dt>Hoch-/Tiefpunkte</dt><dd>${A.ext.length ? A.ext.map((e) => `${e.type[0]}(${fmtN(e.x)} | ${fmtN(e.y)})`).join("; ") : "keine"}</dd><dt>Symmetrie</dt><dd style="text-align:right">${fn.sym}</dd>`;
  }
  ["eSel", "eN", "eY", "eM", "eE"].forEach((id) => $("#" + id).addEventListener("change", draw));

  // ---------- trainer ----------
  const neg = (v) => fmt(v, 3).replace("-", "−");
  const lin = (m, b) => `${m === 1 ? "" : m === -1 ? "−" : neg(m)}<i>x</i>${b ? (b > 0 ? " + " + b : " − " + -b) : ""}`;
  function genZero() {
    const m = nz(-5, 5), x0 = rnd(-6, 6), b = -m * x0;
    return { html: `Bestimme die Nullstelle von <i>f</i>(<i>x</i>) = ${lin(m, b)}.`, label: "<i>x</i> =", placeholder: "Zahl", answer: neg(x0), check: LK.check.num(x0, { abs: 1e-6 }), solution: `<span class="math">${lin(m, b)} = 0 ⇒ <b><i>x</i> = ${neg(x0)}</b></span>` };
  }
  function genY() {
    const T = pick([() => { const m = nz(-5, 5), b = rnd(-8, 8); return [lin(m, b), b]; }, () => { const a = nz(-3, 3), c = rnd(-6, 6); return [`${a === 1 ? "" : a === -1 ? "−" : neg(a)}<i>x</i><sup>2</sup>${c ? (c > 0 ? " + " + c : " − " + -c) : ""}`, c]; }, () => { const p = rnd(-3, 3), q = rnd(-4, 4); return [`(<i>x</i> ${p < 0 ? "+ " + -p : "− " + p})<sup>2</sup>${q ? (q > 0 ? " + " + q : " − " + -q) : ""}`, p * p + q]; }])();
    return { html: `In welchem Punkt schneidet der Graph von <i>f</i>(<i>x</i>) = ${T[0]} die <i>y</i>-Achse? Gib den <i>y</i>-Wert an.`, label: "<i>y</i> =", placeholder: "Zahl", answer: neg(T[1]), check: LK.check.num(T[1], { abs: 1e-6 }), solution: `<i>f</i>(0) = <b>${neg(T[1])}</b>: Punkt (0 | ${neg(T[1])})` };
  }
  function genMono() {
    const m = nz(-5, 5), b = rnd(-6, 6), ans = m > 0 ? "steigend" : "fallend";
    return { html: `Ist <i>f</i>(<i>x</i>) = ${lin(m, b)} steigend oder fallend?`, label: "Antwort:", placeholder: "steigend oder fallend", answer: ans,
      check: (raw) => { const t = raw.trim().toLowerCase(); const v = /^stei/.test(t) ? "steigend" : /^fall/.test(t) ? "fallend" : null; if (!v) return { ok: false, msg: "Antworte mit <code>steigend</code> oder <code>fallend</code>." }; return v === ans ? { ok: true } : { ok: false, msg: "Was passiert mit f(x), wenn x größer wird?" }; },
      solution: `Der Faktor vor <i>x</i> ist ${m > 0 ? "positiv" : "negativ"}: <b>${ans}</b>` };
  }
  function genSym() {
    const T = pick([["<i>x</i><sup>2</sup>", "achse"], ["<i>x</i><sup>2</sup> + 3", "achse"], ["−2<i>x</i><sup>2</sup>", "achse"], ["<i>x</i><sup>3</sup>", "punkt"], ["3<i>x</i>", "punkt"], ["<i>x</i><sup>3</sup> − <i>x</i>", "punkt"], ["<i>x</i> + 1", "keine"], ["(<i>x</i> − 2)<sup>2</sup>", "keine"], ["<i>x</i><sup>4</sup> − <i>x</i><sup>2</sup>", "achse"]]);
    const word = { achse: "achsensymmetrisch", punkt: "punktsymmetrisch", keine: "keine Symmetrie" };
    return { html: `Welche Symmetrie hat der Graph von <i>f</i>(<i>x</i>) = ${T[0]}?`, label: "Antwort:", placeholder: "achsensymmetrisch, punktsymmetrisch oder keine", answer: word[T[1]],
      check: (raw) => { const t = raw.trim().toLowerCase(); const v = /achs/.test(t) ? "achse" : /punkt/.test(t) ? "punkt" : /kein|kein/.test(t) ? "keine" : null; if (!v) return { ok: false, msg: "Antworte mit achsensymmetrisch, punktsymmetrisch oder keine." }; return v === T[1] ? { ok: true } : { ok: false, msg: "Vergleiche f(−x) mit f(x) und mit −f(x)." }; },
      solution: `<b>${word[T[1]]}</b>${T[1] === "achse" ? " zur y-Achse: f(−x) = f(x)" : T[1] === "punkt" ? " zum Ursprung: f(−x) = −f(x)" : ""}` };
  }
  LK.trainer({ el: "#trainer", modes: [
    { id: "null", label: "Nullstelle", gen: genZero },
    { id: "yachse", label: "y-Achsenabschnitt", gen: genY },
    { id: "mono", label: "Steigend oder fallend?", gen: genMono },
    { id: "sym", label: "Symmetrie", gen: genSym }
  ] });

  LK.quiz({ box: "#quizBox", bar: "#qBar", progress: "#qProgress", key: "eigensch.best", n: 10, questions: [
    { q: "Was ist eine Nullstelle?", o: ["Eine Stelle x mit f(x) = 0", "Der Punkt (0 | 0)", "f(0)", "Der tiefste Punkt"], a: 0, e: "Dort schneidet der Graph die x-Achse." },
    { q: "Wo schneidet f(x) = 3x − 5 die y-Achse?", o: ["(0 | 3)", "(0 | −5)", "(5/3 | 0)", "(−5 | 0)"], a: 1, e: "f(0) = −5." },
    { q: "Nullstelle von f(x) = 2x − 8?", o: ["−8", "8", "4", "−4"], a: 2, e: "2x − 8 = 0 ⇒ x = 4." },
    { q: "f(x) = −3x + 1 ist …", o: ["steigend", "fallend", "konstant", "symmetrisch"], a: 1, e: "Negativer Faktor vor x." },
    { q: "Welche Funktion ist achsensymmetrisch zur y-Achse?", o: ["x³", "2x + 1", "x²", "x − 4"], a: 2, e: "f(−x) = f(x)." },
    { q: "Welche Funktion ist punktsymmetrisch zum Ursprung?", o: ["x²", "x³", "x² + 1", "|x|"], a: 1, e: "f(−x) = −f(x)." },
    { q: "Was passiert am Tiefpunkt?", o: ["Der Graph wechselt von steigend zu fallend", "Der Graph wechselt von fallend zu steigend", "f(x) = 0", "x = 0"], a: 1, e: "Davor fällt, danach steigt er." },
    { q: "Wie viele Nullstellen hat f(x) = x² + 1?", o: ["0", "1", "2", "unendlich viele"], a: 0, e: "x² + 1 ist immer mindestens 1." },
    { q: "In welche Richtung liest man „steigend/fallend“?", o: ["Von rechts nach links", "Von links nach rechts", "Von oben nach unten", "Egal"], a: 1, e: "Mit wachsendem x." },
    { q: "Wo liegt der Tiefpunkt von f(x) = x² − 4?", o: ["(2 | 0)", "(0 | −4)", "(−4 | 0)", "(0 | 4)"], a: 1, e: "Der Scheitel der Normalparabel, um 4 nach unten verschoben." }
  ] });

  LK.views(["verstehen", "entdecken", "ueben", "alltag", "quiz"], { entdecken: draw });
})();
