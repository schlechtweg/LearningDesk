(function () {
  "use strict";
  const { $, $$, pick, fmt, rnd } = LK;
  // three significant digits in German notation, without exponent notation
  const f3 = (v) => { if (!isFinite(v) || v === 0) return fmt(v, 3); const d = Math.max(0, 2 - Math.floor(Math.log10(Math.abs(v)))); return fmt(+v.toPrecision(3), Math.min(d, 8)); };
  // reactions: [equation, products [[species, coeff]], educts, note on omitted species]
  const RX = [
    ["N₂ + 3 H₂ ⇌ 2 NH₃", [["NH₃", 2]], [["N₂", 1], ["H₂", 3]], ""], ["H₂ + I₂ ⇌ 2 HI", [["HI", 2]], [["H₂", 1], ["I₂", 1]], ""], ["2 SO₂ + O₂ ⇌ 2 SO₃", [["SO₃", 2]], [["SO₂", 2], ["O₂", 1]], ""],
    ["N₂O₄ ⇌ 2 NO₂", [["NO₂", 2]], [["N₂O₄", 1]], ""], ["CH₃COOH + C₂H₅OH ⇌ CH₃COOC₂H₅ + H₂O", [["Ester", 1], ["H₂O", 1]], [["Säure", 1], ["Alkohol", 1]], "Hier ist Wasser Produkt, nicht Lösemittel, und wird eingesetzt."],
    ["CaCO₃(s) ⇌ CaO(s) + CO₂(g)", [["CO₂", 1]], [], "Feststoffe werden nicht eingesetzt: K = c(CO₂)."], ["PCl₅ ⇌ PCl₃ + Cl₂", [["PCl₃", 1], ["Cl₂", 1]], [["PCl₅", 1]], ""],
    ["Fe³⁺ + SCN⁻ ⇌ FeSCN²⁺", [["FeSCN²⁺", 1]], [["Fe³⁺", 1], ["SCN⁻", 1]], "Wasser ist Lösemittel und wird nicht eingesetzt."], ["2 NO + O₂ ⇌ 2 NO₂", [["NO₂", 2]], [["NO", 2], ["O₂", 1]], ""]
  ];
  const term = (arr) => (arr.length ? arr.map(([s, c]) => `c(${s})${c > 1 ? `<sup>${c}</sup>` : ""}`).join(" · ") : "1");
  function unit(r) { const e = r[1].reduce((s, [, c]) => s + c, 0) - r[2].reduce((s, [, c]) => s + c, 0); return e === 0 ? "ohne Einheit" : e > 0 ? `(mol/L)${e > 1 ? `<sup>${e}</sup>` : ""}` : `(L/mol)${-e > 1 ? `<sup>${-e}</sup>` : ""}`; }
  let cur = RX[0];
  $("#aChips").innerHTML = RX.map((r, i) => `<button type="button" data-i="${i}" aria-pressed="false">${r[0]}</button>`).join("");
  function drawA() {
    $$("#aChips button").forEach((b) => b.setAttribute("aria-pressed", String(RX[+b.dataset.i] === cur)));
    $("#aEq").textContent = cur[0];
    $("#aMwg").innerHTML = `<span>K<sub>c</sub> =</span>` + (cur[2].length ? `<span class="frac"><span>${term(cur[1])}</span><span>${term(cur[2])}</span></span>` : `<span>${term(cur[1])}</span>`);
    $("#aInfo").innerHTML = `Einheit: <b>${unit(cur)}</b>. ${cur[3]}`;
  }
  $$("#aChips button").forEach((b) => b.addEventListener("click", () => { cur = RX[+b.dataset.i]; drawA(); }));
  drawA();

  // ---------- ICE calculator for A + B <=> C + D ----------
  function solve(K, a, b, c, d) {
    // (1-K) x^2 + (c + d + K (a + b)) x + c d - K a b = 0, with -min(c,d) <= x <= min(a,b)
    const A2 = 1 - K, B2 = c + d + K * (a + b), C2 = c * d - K * a * b, lo = -Math.min(c, d), hi = Math.min(a, b);
    const ok = (x) => x >= lo - 1e-9 && x <= hi + 1e-9;
    if (Math.abs(A2) < 1e-12) { const x = -C2 / B2; return ok(x) ? x : null; }
    const D = B2 * B2 - 4 * A2 * C2; if (D < 0) return null;
    const r1 = (-B2 + Math.sqrt(D)) / (2 * A2), r2 = (-B2 - Math.sqrt(D)) / (2 * A2);
    return ok(r1) ? r1 : ok(r2) ? r2 : null;
  }
  function drawR() {
    const K = +$("#rK").value, v = ["#rA", "#rB", "#rC", "#rD"].map((id) => Math.max(0, +$(id).value || 0)), [a, b, c, d] = v;
    const x = K > 0 ? solve(K, a, b, c, d) : null;
    if (x === null) { $("#rTab").innerHTML = ""; $("#rSteps").textContent = "Mit diesen Werten gibt es keine sinnvolle Lösung."; return; }
    const eq = [a - x, b - x, c + x, d + x];
    $("#rTab").innerHTML = `<tr><th></th><th>A</th><th>B</th><th>C</th><th>D</th></tr><tr><th>Anfang</th>${v.map((n) => `<td>${fmt(n, 3)}</td>`).join("")}</tr><tr><th>Änderung</th><td>−x</td><td>−x</td><td>+x</td><td>+x</td></tr><tr><th>Gleichgewicht</th>${eq.map((n) => `<td><b>${fmt(n, 3)}</b></td>`).join("")}</tr>`;
    const Q = a * b > 0 ? (c * d) / (a * b) : Infinity;
    $("#rSteps").innerHTML = `<p>Ansatz: K = (${fmt(c, 2)} + x)(${fmt(d, 2)} + x) / ((${fmt(a, 2)} − x)(${fmt(b, 2)} − x)) = ${fmt(K, 2)}. Das Volumen kürzt sich heraus, weil links und rechts gleich viele Teilchen stehen.</p><p>Lösung der quadratischen Gleichung: <b>x = ${fmt(x, 3)} mol</b>. ${x >= 0 ? "Die Reaktion läuft nach rechts." : "x ist negativ: Die Reaktion läuft nach links."}</p><p>Anfangs-Q = ${Q === Infinity ? "∞" : fmt(Q, 3)} ${Q < K ? "< K" : Q > K ? "> K" : "= K"}. Ausbeute bezogen auf A: ${a > 0 ? fmt((x / a) * 100, 1) + " %" : "–"}.</p>`;
  }
  ["#rK", "#rA", "#rB", "#rC", "#rD"].forEach((id) => $(id).addEventListener("input", drawR));
  drawR();

  // ---------- trainer ----------
  function genK() {
    const t = pick(["hi", "nh3", "no2", "ester"]);
    if (t === "hi") { const h = rnd(1, 9) / 10, i = rnd(1, 9) / 100, hi = rnd(5, 30) / 100; const K = (hi * hi) / (h * i); return { html: `H₂ + I₂ ⇌ 2 HI. Im Gleichgewicht: c(H₂) = ${fmt(h, 2)}, c(I₂) = ${fmt(i, 2)}, c(HI) = ${fmt(hi, 2)} mol/L. Berechne K.`, label: "K:", answer: f3(K), check: LK.check.num(K, { tol: 0.01 }), solution: `K = c(HI)² / (c(H₂) · c(I₂)) = ${fmt(hi, 2)}² / (${fmt(h, 2)} · ${fmt(i, 2)}) = <b>${f3(K)}</b>` }; }
    if (t === "nh3") { const n = rnd(2, 8) / 10, h = rnd(5, 15) / 10, a = rnd(1, 8) / 10; const K = (a * a) / (n * h ** 3); return { html: `N₂ + 3 H₂ ⇌ 2 NH₃. Im Gleichgewicht: c(N₂) = ${fmt(n, 1)}, c(H₂) = ${fmt(h, 1)}, c(NH₃) = ${fmt(a, 1)} mol/L. Berechne K (in L²/mol²).`, label: "K:", answer: f3(K), check: LK.check.num(K, { tol: 0.01 }), solution: `K = c(NH₃)² / (c(N₂) · c(H₂)³) = ${fmt(a, 1)}² / (${fmt(n, 1)} · ${fmt(h, 1)}³) = <b>${f3(K)} L²/mol²</b>` }; }
    if (t === "no2") { const n2o4 = rnd(1, 9) / 100, no2 = rnd(1, 9) / 100; const K = (no2 * no2) / n2o4; return { html: `N₂O₄ ⇌ 2 NO₂. Im Gleichgewicht: c(N₂O₄) = ${fmt(n2o4, 2)}, c(NO₂) = ${fmt(no2, 2)} mol/L. Berechne K (in mol/L).`, label: "K:", answer: f3(K), check: LK.check.num(K, { tol: 0.01 }), solution: `K = c(NO₂)² / c(N₂O₄) = <b>${f3(K)} mol/L</b>` }; }
    const e = pick([0.5, 0.6, 0.67, 0.75, 0.8]), s = pick([1, 1.5, 2]); const K = (e * e) / ((1 - e) * (s - e)); return { html: `Veresterung, Start 1 mol Säure und ${fmt(s, 1)} mol Alkohol. Im Gleichgewicht liegen ${fmt(e, 2)} mol Ester vor. Berechne K.`, label: "K:", answer: f3(K), check: LK.check.num(K, { tol: 0.01 }), solution: `Ester = Wasser = ${fmt(e, 2)}; Säure ${fmt(1 - e, 2)}, Alkohol ${fmt(s - e, 2)} ⇒ K = ${fmt(e, 2)}² / (${fmt(1 - e, 2)} · ${fmt(s - e, 2)}) = <b>${f3(K)}</b>` };
  }
  function genX() { const K = pick([4, 4, 1, 9, 0.25]), a = pick([1, 1, 2]), b = pick([1, 2, 3]); const x = solve(K, a, b, 0, 0);
    return { html: `A + B ⇌ C + D mit K = ${fmt(K, 2)}. Start: ${a} mol A, ${b} mol B, keine Produkte. Wie viel mol C liegen im Gleichgewicht vor?`, label: "n(C) in mol:", answer: fmt(x, 3), check: LK.check.num(x, { abs: 0.005 }), solution: `x² / ((${a} − x)(${b} − x)) = ${fmt(K, 2)} ⇒ <b>x = ${fmt(x, 3)} mol</b>` }; }
  function genQ() { const K = pick([4, 10, 0.5, 50]), c = [rnd(1, 9) / 10, rnd(1, 9) / 10, rnd(1, 9) / 10, rnd(1, 9) / 10]; const Q = (c[2] * c[3]) / (c[0] * c[1]); if (Math.abs(Q - K) / K < 0.1) return genQ(); const a = Q < K ? "rechts" : "links";
    return { html: `A + B ⇌ C + D, K = ${fmt(K, 1)}. Momentan: c(A) = ${fmt(c[0], 1)}, c(B) = ${fmt(c[1], 1)}, c(C) = ${fmt(c[2], 1)}, c(D) = ${fmt(c[3], 1)} mol/L. In welche Richtung läuft die Reaktion?`, label: "Richtung:", placeholder: "rechts oder links", answer: a, check: (raw) => { const t = raw.trim().toLowerCase(); const v = /recht/.test(t) ? "rechts" : /link/.test(t) ? "links" : null; return v === a ? { ok: true } : { ok: false, msg: "Berechne Q und vergleiche mit K." }; }, solution: `Q = ${f3(Q)} ${Q < K ? "< K ⇒ <b>nach rechts</b>" : "> K ⇒ <b>nach links</b>"}` }; }
  function genExp() { const r = pick(RX.filter((x) => x[2].length)); const all = [...r[1], ...r[2]]; const [sp, c] = pick(all); const inZ = r[1].some(([s]) => s === sp);
    return { html: `Im MWG zu <b>${r[0]}</b>: Mit welcher Hochzahl steht c(${sp}) im ${inZ ? "Zähler" : "Nenner"}?`, label: "Hochzahl:", answer: String(c), check: LK.check.num(c, { abs: 0 }), solution: `Koeffizient = Hochzahl: <b>${c}</b>` }; }
  LK.trainer({ el: "#trainer", modes: [
    { id: "k", label: "K berechnen", gen: genK },
    { id: "x", label: "Gleichgewicht berechnen", gen: genX },
    { id: "q", label: "Q und K", gen: genQ },
    { id: "exp", label: "MWG aufstellen", gen: genExp }
  ] });

  LK.quiz({ box: "#quizBox", bar: "#qBar", progress: "#qProgress", key: "mwg.best", n: 8, questions: [
    { q: "Was steht im MWG im Zähler?", o: ["Edukte", "Produkte", "Katalysator", "Temperatur"], a: 1, e: "Produkte oben, Edukte unten." },
    { q: "Wovon hängt K ab?", o: ["Von den Startkonzentrationen", "Nur von der Temperatur (und der Reaktion)", "Vom Druck", "Vom Katalysator"], a: 1, e: "K ist temperaturabhängig." },
    { q: "K = 10⁸ bedeutet …", o: ["Gleichgewicht auf der Eduktseite", "fast vollständige Umsetzung zu Produkten", "keine Reaktion", "Reaktion ist schnell"], a: 1, e: "K ≫ 1." },
    { q: "MWG für N₂ + 3 H₂ ⇌ 2 NH₃?", o: ["c(NH₃)² / (c(N₂) · c(H₂)³)", "2 c(NH₃) / (c(N₂) + 3 c(H₂))", "c(N₂) · c(H₂)³ / c(NH₃)²", "c(NH₃) / c(N₂)"], a: 0, e: "Koeffizienten als Hochzahlen." },
    { q: "Q < K bedeutet …", o: ["Reaktion läuft nach links", "Reaktion läuft nach rechts", "Gleichgewicht", "Keine Aussage"], a: 1, e: "Es müssen noch Produkte entstehen." },
    { q: "Veresterung mit K = 4, Start je 1 mol. Wie viel Ester entsteht?", o: ["0,5 mol", "2/3 mol", "1 mol", "4 mol"], a: 1, e: "x²/(1−x)² = 4 ⇒ x = 2/3." },
    { q: "Was wird im MWG nicht eingesetzt?", o: ["Gase", "Gelöste Ionen", "Reine Feststoffe", "Produkte"], a: 2, e: "Ihre Konzentration ist konstant." },
    { q: "Wie ändert sich K einer exothermen Reaktion beim Erwärmen?", o: ["K steigt", "K sinkt", "K bleibt", "K wird 0"], a: 1, e: "Rückreaktion begünstigt." }
  ] });

  LK.views(["verstehen", "aufstellen", "rechner", "ueben", "alltag", "quiz"], {});
})();
