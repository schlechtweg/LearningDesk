(function () {
  "use strict";
  const { $, pick, rnd, nz, fmt, frac, gcd } = LK;
  const X0 = 230, Y0 = 170, U = 26, XM = 8, YM = 6;
  const sx = (x) => X0 + x * U, sy = (y) => Y0 - y * U;
  const n = (v, d = 2) => fmt(Math.abs(v) < 1e-12 ? 0 : v, d).replace("-", "−");
  const term = (m, b) => `${m === 0 ? "" : m === 1 ? "x" : m === -1 ? "−x" : n(m) + "x"}${b === 0 ? (m === 0 ? "0" : "") : (m === 0 ? n(b) : b > 0 ? " + " + n(b) : " − " + n(-b))}`;
  function line(m, b, cls) {
    const xa = -XM, xb = XM;
    return `<line class="${cls}" x1="${sx(xa)}" y1="${sy(m * xa + b)}" x2="${sx(xb)}" y2="${sy(m * xb + b)}"/>`;
  }
  function draw() {
    const m = +$("#gM").value, b = +$("#gB").value, two = $("#g2").checked, m2 = +$("#gM2").value, b2 = +$("#gB2").value;
    $("#gMOut").textContent = n(m); $("#gBOut").textContent = n(b); $("#gM2Out").textContent = n(m2); $("#gB2Out").textContent = n(b2);
    $("#g2c").hidden = !two;
    let s = `<defs><clipPath id="clip"><rect x="${sx(-XM)}" y="${sy(YM)}" width="${2 * XM * U}" height="${2 * YM * U}"/></clipPath></defs>`;
    for (let i = -XM; i <= XM; i++) s += `<line class="gl" x1="${sx(i)}" y1="${sy(YM)}" x2="${sx(i)}" y2="${sy(-YM)}"/>`;
    for (let j = -YM; j <= YM; j++) s += `<line class="gl" x1="${sx(-XM)}" y1="${sy(j)}" x2="${sx(XM)}" y2="${sy(j)}"/>`;
    s += `<line class="ax" x1="${sx(-XM)}" y1="${Y0}" x2="${sx(XM)}" y2="${Y0}"/><line class="ax" x1="${X0}" y1="${sy(YM)}" x2="${X0}" y2="${sy(-YM)}"/>`;
    for (let i = -XM; i <= XM; i += 2) if (i) s += `<text x="${sx(i)}" y="${Y0 + 13}" text-anchor="middle">${n(i, 0)}</text>`;
    for (let j = -YM; j <= YM; j += 2) if (j) s += `<text x="${X0 - 5}" y="${sy(j) + 4}" text-anchor="end">${n(j, 0)}</text>`;
    s += `<g clip-path="url(#clip)">${line(m, b, "g1")}${two ? line(m2, b2, "g2") : ""}`;
    if ($("#gTri").checked && m !== 0) s += `<path class="tri" d="M${sx(0)} ${sy(b)} H${sx(1)} V${sy(b + m)}"/><text class="tl" x="${(sx(0) + sx(1)) / 2}" y="${sy(b) + (m > 0 ? 14 : -6)}" text-anchor="middle">1</text><text class="tl" x="${sx(1) + 6}" y="${(sy(b) + sy(b + m)) / 2 + 4}">${n(m)}</text>`;
    s += `<circle class="pt" cx="${sx(0)}" cy="${sy(b)}" r="4.5"/>`;
    let rows = `<dt>Gleichung</dt><dd class="math"><i>f</i>(<i>x</i>) = ${term(m, b)}</dd><dt>Steigung</dt><dd>${n(m)} (${m > 0 ? "steigend" : m < 0 ? "fallend" : "waagerecht"})</dd><dt><i>y</i>-Achse</dt><dd>(0 | ${n(b)})</dd><dt>Nullstelle</dt><dd>${m !== 0 ? n(-b / m) : b === 0 ? "alle x" : "keine"}</dd><dt>proportional?</dt><dd>${b === 0 ? "ja (durch den Ursprung)" : "nein"}</dd>`;
    if (two) {
      rows += `<dt>Gerade <i>g</i></dt><dd class="math"><i>g</i>(<i>x</i>) = ${term(m2, b2)}</dd>`;
      if (m === m2) rows += `<dt>Lage</dt><dd>${b === b2 ? "identisch" : "parallel, kein Schnittpunkt"}</dd>`;
      else { const xs = (b2 - b) / (m - m2), ys = m * xs + b; rows += `<dt>Schnittpunkt</dt><dd class="big">S(${n(xs)} | ${n(ys)})</dd>`; s += `<circle class="sp" cx="${sx(xs)}" cy="${sy(ys)}" r="6"/>`; }
    }
    s += "</g>";
    $("#gSvg").innerHTML = s;
    $("#gRo").innerHTML = rows;
  }
  ["gM", "gB", "gM2", "gB2"].forEach((id) => $("#" + id).addEventListener("input", draw));
  ["gTri", "g2"].forEach((id) => $("#" + id).addEventListener("change", draw));

  // ---------- trainer ----------
  const fracT = (p, q) => { const g = gcd(p, q) || 1; let a = p / g, b = q / g; if (b < 0) { a = -a; b = -b; } return b === 1 ? n(a, 0) : `${a < 0 ? "−" : ""}${Math.abs(a)}/${b}`; };
  function genRead() {
    const m = nz(-6, 6), b = rnd(-9, 9), swap = Math.random() < 0.4, ask = pick(["m", "b"]);
    const t = swap && b ? `${n(b)} ${m < 0 ? "−" : "+"} ${Math.abs(m) === 1 ? "" : Math.abs(m)}<i>x</i>` : term(m, b).replace("x", "<i>x</i>");
    const v = ask === "m" ? m : b;
    return { html: `<i>f</i>(<i>x</i>) = ${t}. Wie groß ist ${ask === "m" ? "die Steigung <i>m</i>" : "der <i>y</i>-Achsenabschnitt <i>b</i>"}?`, label: `<i>${ask}</i> =`, placeholder: "Zahl", answer: n(v, 0), check: LK.check.num(v, { abs: 1e-9 }), solution: `<i>m</i> = ${n(m, 0)}, <i>b</i> = ${n(b, 0)}` };
  }
  function genZero() {
    const m = nz(-5, 5), b = nz(-9, 9), x0 = -b / m;
    return { html: `Berechne die Nullstelle von <i>f</i>(<i>x</i>) = ${term(m, b).replace("x", "<i>x</i>")}.`, label: "<i>x</i> =", placeholder: "Zahl oder Bruch", answer: fracT(-b, m), check: LK.check.num(x0, { abs: 1e-6 }), solution: `<span class="math">${term(m, b)} = 0 ⇒ <i>x</i> = ${fracT(-b, m)}</span>` };
  }
  function genSlope() {
    const x1 = rnd(-5, 3), x2 = x1 + rnd(1, 5), y1 = rnd(-6, 6), y2 = rnd(-6, 6), m = (y2 - y1) / (x2 - x1);
    return { html: `Eine Gerade geht durch P(${n(x1, 0)} | ${n(y1, 0)}) und Q(${n(x2, 0)} | ${n(y2, 0)}). Wie groß ist die Steigung?`, label: "<i>m</i> =", placeholder: "Zahl oder Bruch", answer: fracT(y2 - y1, x2 - x1), check: LK.check.num(m, { abs: 1e-6 }),
      solution: `<span class="math"><i>m</i> = (${n(y2, 0)} − ${n(y1, 0) < 0 ? "(" + n(y1, 0) + ")" : n(y1, 0)}) : (${n(x2, 0)} − ${x1 < 0 ? "(" + n(x1, 0) + ")" : n(x1, 0)}) = ${fracT(y2 - y1, x2 - x1)}</span>` };
  }
  function genCut() {
    const xs = rnd(-4, 4), m1 = nz(-3, 3); let m2 = nz(-3, 3); if (m2 === m1) m2 = m1 + 1 || 2;
    const ys = rnd(-5, 5), b1 = ys - m1 * xs, b2 = ys - m2 * xs;
    return { html: `Berechne den Schnittpunkt von <i>f</i>(<i>x</i>) = ${term(m1, b1).replace("x", "<i>x</i>")} und <i>g</i>(<i>x</i>) = ${term(m2, b2).replace("x", "<i>x</i>")}.`, label: "S =", placeholder: "(x|y)", answer: `(${n(xs, 0)}|${n(ys, 0)})`,
      check: (raw) => { const p = String(raw).replace(/[()\s]/g, "").replace(/[−–]/g, "-").split(/[|;]/); if (p.length !== 2) return { ok: false, msg: "Schreibe den Punkt als <code>(2|3)</code>." }; const a = LK.parseNum(p[0]), b = LK.parseNum(p[1]); return Math.abs(a - xs) < 1e-6 && Math.abs(b - ys) < 1e-6 ? { ok: true } : { ok: false, msg: "Setze die Terme gleich, löse nach x und berechne y." }; },
      solution: `<span class="math">${term(m1, b1)} = ${term(m2, b2)} ⇒ <i>x</i> = ${n(xs, 0)}</span>, <span class="math"><i>y</i> = ${n(ys, 0)}</span>: <b>S(${n(xs, 0)} | ${n(ys, 0)})</b>` };
  }
  LK.trainer({ el: "#trainer", modes: [
    { id: "ablesen", label: "m und b ablesen", gen: genRead },
    { id: "null", label: "Nullstelle", gen: genZero },
    { id: "steigung", label: "Steigung aus zwei Punkten", gen: genSlope },
    { id: "schnitt", label: "Schnittpunkt", gen: genCut }
  ] });

  LK.quiz({ box: "#quizBox", bar: "#qBar", progress: "#qProgress", key: "linear.best", n: 10, questions: [
    { q: "f(x) = 3x − 2. Steigung?", o: ["−2", "3", "2", "−3"], a: 1, e: "Der Faktor vor x." },
    { q: "f(x) = 4 − 2x. y-Achsenabschnitt?", o: ["4", "−2", "2", "0"], a: 0, e: "b = 4, m = −2." },
    { q: "Wann ist eine lineare Funktion proportional?", o: ["Wenn m = 0", "Wenn b = 0", "Wenn m = b", "Nie"], a: 1, e: "Dann geht die Gerade durch den Ursprung." },
    { q: "Wie verlaufen zwei Geraden mit gleicher Steigung und verschiedenem b?", o: ["Sie schneiden sich", "Sie sind parallel", "Sie sind senkrecht", "Sie sind gleich"], a: 1, e: "Gleiche Steigung: parallel." },
    { q: "Nullstelle von f(x) = 2x + 6?", o: ["6", "−3", "3", "−6"], a: 1, e: "2x + 6 = 0 ⇒ x = −3." },
    { q: "Steigung durch P(1 | 2) und Q(3 | 8)?", o: ["2", "3", "6", "4"], a: 1, e: "(8 − 2) : (3 − 1) = 3." },
    { q: "Was bedeutet m = −0,5?", o: ["Pro Schritt nach rechts 0,5 nach oben", "Pro Schritt nach rechts 0,5 nach unten", "Die Gerade ist waagerecht", "Die Gerade geht durch (0 | −0,5)"], a: 1, e: "Negative Steigung: fallend." },
    { q: "Schnittpunkt von f(x) = x + 1 und g(x) = −x + 5?", o: ["(2 | 3)", "(3 | 2)", "(1 | 2)", "(4 | 5)"], a: 0, e: "x + 1 = −x + 5 ⇒ x = 2, y = 3." },
    { q: "Welche Gerade ist am steilsten?", o: ["y = 0,5x", "y = −3x + 1", "y = 2x", "y = x − 4"], a: 1, e: "|−3| ist am größten." },
    { q: "Eine Kerze (20 cm) brennt 2 cm pro Stunde ab. Funktion?", o: ["h(t) = 2t + 20", "h(t) = 20 − 2t", "h(t) = 20t − 2", "h(t) = 2 − 20t"], a: 1, e: "Start 20, pro Stunde −2." }
  ] });

  LK.views(["verstehen", "gerade", "ueben", "alltag", "quiz"], { gerade: draw });
})();
