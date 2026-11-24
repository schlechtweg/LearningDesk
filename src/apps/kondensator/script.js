(function () {
  "use strict";
  const { $, $$, pick, fmt, numText, check } = LK;
  const EPS0 = 8.854e-12;

  // value with a fitting SI prefix, e.g. 177 pF
  const PREF = [[1, ""], [1e-3, "m"], [1e-6, "µ"], [1e-9, "n"], [1e-12, "p"]];
  function si(v, unit, d = 2) {
    if (v === 0 || !isFinite(v)) return `0 ${unit}`;
    for (const [f, p] of PREF) if (Math.abs(v) >= f * 0.9999) return `${fmt(v / f, Math.abs(v / f) >= 100 ? 0 : d)} ${p}${unit}`;
    return `${fmt(v / 1e-12, 3)} p${unit}`;
  }

  // =====================================================================
  // Capacitance of a parallel-plate capacitor
  // =====================================================================
  function drawCap() {
    const Acm = +$("#cA").value, dmm = +$("#cD").value, U = +$("#cU").value, er = +$("#cEr").value;
    $("#cAOut").textContent = `${fmt(Acm, 0)} cm²`; $("#cDOut").textContent = `${fmt(dmm, 1)} mm`; $("#cUOut").textContent = `${fmt(U, 0)} V`;
    const A = Acm * 1e-4, d = dmm * 1e-3, C = EPS0 * er * A / d, Q = C * U, E = U / d, W = 0.5 * C * U * U;
    const h = 40 + Math.sqrt(Acm) * 6.5, gap = 12 + dmm * 16, cx = 210, top = 150 - h / 2;
    const xl = cx - gap / 2, xr = cx + gap / 2;
    let s = "";
    if (er > 1) s += `<rect class="diel e${er}" x="${xl}" y="${top}" width="${gap}" height="${h}"/>`;
    s += `<rect class="plate pos" x="${xl - 8}" y="${top}" width="8" height="${h}"/><rect class="plate neg" x="${xr}" y="${top}" width="8" height="${h}"/>`;
    // charge signs: more signs for more charge (log scale)
    const n = Math.max(2, Math.min(12, Math.round(2 + Math.log10(Q / 1e-11) * 2.2)));
    for (let k = 0; k < n; k++) {
      const y = top + h * (k + 0.5) / n;
      s += `<text class="sign pos" x="${xl - 18}" y="${y + 5}" text-anchor="middle">+</text><text class="sign neg" x="${xr + 18}" y="${y + 5}" text-anchor="middle">−</text>`;
      s += `<line class="fl" x1="${xl}" y1="${y}" x2="${xr}" y2="${y}"/>`;
    }
    s += `<path class="wire" d="M${xl - 8} ${top + h / 2} H60 V265 H175"/><path class="wire" d="M${xr + 8} ${top + h / 2} H360 V265 H245"/>`;
    s += `<line class="bat" x1="200" y1="250" x2="200" y2="280"/><line class="bat thin" x1="220" y1="256" x2="220" y2="274"/><text class="lab" x="210" y="244" text-anchor="middle">${fmt(U, 0)} V</text>`;
    s += `<text class="lab small" x="${cx}" y="${top - 10}" text-anchor="middle">d = ${fmt(dmm, 1)} mm</text>`;
    $("#cSvg").innerHTML = s;
    $("#cRo").innerHTML = `<dt>Kapazität C = ε₀·εr·A/d</dt><dd class="big">${si(C, "F")}</dd><dt>Ladung Q = C·U</dt><dd>${si(Q, "C")}</dd><dt>Feldstärke E = U/d</dt><dd>${fmt(E, 0)} V/m</dd><dt>Energie W = ½·C·U²</dt><dd>${si(W, "J")}</dd>`;
  }
  ["#cA", "#cD", "#cU"].forEach((id) => $(id).addEventListener("input", drawCap));
  $("#cEr").addEventListener("change", drawCap);

  // =====================================================================
  // Charging and discharging curve (U0 = 10 V)
  // =====================================================================
  let lmode = "laden";
  const U0 = 10;
  function drawCurve() {
    const R = +$("#lR").value * 1e3, C = +$("#lC").value * 1e-6, tau = R * C, t = +$("#lT").value / 100 * 5 * tau;
    $("#lROut").textContent = `${fmt(R / 1e3, 0)} kΩ`; $("#lCOut").textContent = `${fmt(C * 1e6, 0)} µF`;
    $("#lTOut").textContent = `${fmt(t / tau, 2)} τ`;
    const uc = (x) => (lmode === "laden" ? U0 * (1 - Math.exp(-x / tau)) : U0 * Math.exp(-x / tau));
    const X0 = 46, X1 = 400, Y0 = 250, Y1 = 30, sx = (x) => X0 + (X1 - X0) * x / (5 * tau), sy = (u) => Y0 - (Y0 - Y1) * u / U0;
    let s = `<line class="axis" x1="${X0}" y1="${Y0}" x2="${X1 + 8}" y2="${Y0}"/><line class="axis" x1="${X0}" y1="${Y0}" x2="${X0}" y2="${Y1 - 10}"/>`;
    for (let k = 1; k <= 5; k++) s += `<line class="grid" x1="${sx(k * tau)}" y1="${Y0}" x2="${sx(k * tau)}" y2="${Y1}"/><text class="tick" x="${sx(k * tau)}" y="${Y0 + 16}" text-anchor="middle">${k}τ</text>`;
    for (const u of [0, 2.5, 5, 7.5, 10]) s += `<text class="tick" x="${X0 - 6}" y="${sy(u) + 4}" text-anchor="end">${fmt(u, 1)}</text>`;
    s += `<text class="tick" x="${X0}" y="${Y1 - 16}">U in V</text><text class="tick" x="${X1}" y="${Y0 + 32}" text-anchor="end">Zeit t</text>`;
    // 63 % / 37 % marker
    const mark = lmode === "laden" ? 0.632 * U0 : 0.368 * U0;
    s += `<line class="mark" x1="${X0}" y1="${sy(mark)}" x2="${sx(tau)}" y2="${sy(mark)}"/><text class="tick" x="${sx(tau) + 4}" y="${sy(mark) - 4}">${lmode === "laden" ? "63 %" : "37 %"}</text>`;
    let pts = "";
    for (let i = 0; i <= 200; i++) { const x = 5 * tau * i / 200; pts += `${sx(x).toFixed(1)},${sy(uc(x)).toFixed(1)} `; }
    s += `<polyline class="curveline" points="${pts}"/><circle class="dot" cx="${sx(t)}" cy="${sy(uc(t))}" r="6"/>`;
    $("#lSvg").innerHTML = s;
    const u = uc(t), I = (lmode === "laden" ? (U0 - u) : u) / R;
    $("#lRo").innerHTML = `<dt>Zeitkonstante τ = R·C</dt><dd class="big">${tau >= 1 ? fmt(tau, 2) + " s" : fmt(tau * 1e3, 1) + " ms"}</dd><dt>Zeit t</dt><dd>${t >= 1 ? fmt(t, 2) + " s" : fmt(t * 1e3, 1) + " ms"}</dd><dt>Spannung am Kondensator</dt><dd>${fmt(u, 2)} V (${fmt(u / U0 * 100, 0)} %)</dd><dt>Strom</dt><dd>${si(I, "A")}</dd><dt>Ladung</dt><dd>${si(C * u, "C")}</dd>`;
    $("#lStatus").innerHTML = lmode === "laden"
      ? "Am Anfang fließt der größte Strom, die Spannung steigt schnell. Je voller der Kondensator, desto kleiner der Strom. Größeres <i>R</i> oder <i>C</i> ⇒ größeres τ ⇒ langsameres Laden."
      : "Beim Entladen fällt die Spannung in jeder Zeitkonstante auf 37 % ihres Wertes. Der Strom fließt jetzt in die andere Richtung.";
  }
  $$("[data-lmode]").forEach((b) => b.addEventListener("click", () => { lmode = b.dataset.lmode; $$("[data-lmode]").forEach((x) => x.setAttribute("aria-pressed", String(x === b))); drawCurve(); }));
  ["#lR", "#lC", "#lT"].forEach((id) => $(id).addEventListener("input", drawCurve));

  // =====================================================================
  // Series and parallel
  // =====================================================================
  function capSym(x, y) { return `<line class="cp" x1="${x - 4}" y1="${y - 14}" x2="${x - 4}" y2="${y + 14}"/><line class="cp" x1="${x + 4}" y1="${y - 14}" x2="${x + 4}" y2="${y + 14}"/>`; }
  function drawSeries() {
    const C1 = +$("#sC1").value, C2 = +$("#sC2").value, U = +$("#sU").value;
    $("#sC1Out").textContent = `${C1} µF`; $("#sC2Out").textContent = `${C2} µF`; $("#sUOut").textContent = `${U} V`;
    const Cp = C1 + C2, Cs = C1 * C2 / (C1 + C2), Qs = Cs * U;
    $("#sPar").innerHTML = `<path class="wire" d="M10 55 H50 M50 25 V85 M50 25 H96 M104 25 H150 M50 85 H96 M104 85 H150 M150 25 V85 M150 55 H190"/>${capSym(100, 25)}${capSym(100, 85)}<text class="lab small" x="100" y="10" text-anchor="middle">C₁</text><text class="lab small" x="100" y="108" text-anchor="middle">C₂</text>`;
    $("#sSer").innerHTML = `<path class="wire" d="M10 55 H66 M74 55 H126 M134 55 H190"/>${capSym(70, 55)}${capSym(130, 55)}<text class="lab small" x="70" y="34" text-anchor="middle">C₁</text><text class="lab small" x="130" y="34" text-anchor="middle">C₂</text>`;
    $("#sParRo").innerHTML = `<dt>C = C₁ + C₂</dt><dd class="big">${fmt(Cp, 2)} µF</dd><dt>U₁ = U₂</dt><dd>${U} V</dd><dt>Q₁ / Q₂</dt><dd>${fmt(C1 * U, 1)} / ${fmt(C2 * U, 1)} µC</dd><dt>Q gesamt</dt><dd>${fmt(Cp * U, 1)} µC</dd>`;
    $("#sSerRo").innerHTML = `<dt>C = C₁·C₂/(C₁+C₂)</dt><dd class="big">${fmt(Cs, 2)} µF</dd><dt>Q₁ = Q₂ = Q</dt><dd>${fmt(Qs, 1)} µC</dd><dt>U₁ / U₂</dt><dd>${fmt(Qs / C1, 2)} / ${fmt(Qs / C2, 2)} V</dd><dt>Merke</dt><dd>kleiner als ${Math.min(C1, C2)} µF</dd>`;
  }
  ["#sC1", "#sC2", "#sU"].forEach((id) => $(id).addEventListener("input", drawSeries));

  // =====================================================================
  // Trainer
  // =====================================================================
  const T = (ans) => check.num(ans, { tol: 0.02 });
  const dec = (v) => (Math.abs(v) >= 100 ? 1 : Math.abs(v) >= 10 ? 2 : 3);
  function genCQU() {
    const kind = pick(["C", "Q", "U"]), C = pick([1, 2.2, 4.7, 10, 22, 47, 100, 220, 470]), U = pick([3, 5, 6, 9, 12, 24, 50, 100, 230]), Q = C * U;
    if (kind === "C") return { html: `Ein Kondensator trägt bei <b>U = ${U} V</b> die Ladung <b>Q = ${fmt(Q, 1)} µC</b>. Berechne seine Kapazität.`,
      label: "<i>C</i> =", placeholder: "in µF", answer: numText(C, dec(C)), check: T(C), hint: "Einheit: µF. C = Q / U",
      solution: `<span class="math"><i>C</i> = <i>Q</i> / <i>U</i> = ${fmt(Q, 1)} µC / ${U} V = ${fmt(C, 2)} µF</span>` };
    if (kind === "Q") return { html: `Ein Kondensator mit <b>C = ${fmt(C, 1)} µF</b> wird an <b>U = ${U} V</b> geladen. Welche Ladung speichert er?`,
      label: "<i>Q</i> =", placeholder: "in µC", answer: numText(Q, dec(Q)), check: T(Q), hint: "Einheit: µC. Q = C · U",
      solution: `<span class="math"><i>Q</i> = <i>C</i> · <i>U</i> = ${fmt(C, 1)} µF · ${U} V = ${fmt(Q, 1)} µC</span>` };
    return { html: `Auf einem Kondensator mit <b>C = ${fmt(C, 1)} µF</b> sitzt die Ladung <b>Q = ${fmt(Q, 1)} µC</b>. Welche Spannung liegt an?`,
      label: "<i>U</i> =", placeholder: "in V", answer: numText(U, 2), check: T(U), hint: "Einheit: V. U = Q / C",
      solution: `<span class="math"><i>U</i> = <i>Q</i> / <i>C</i> = ${fmt(Q, 1)} µC / ${fmt(C, 1)} µF = ${U} V</span>` };
  }
  function genPlate() {
    const Acm = pick([25, 50, 100, 200, 400, 500, 1000]), dmm = pick([0.1, 0.2, 0.5, 1, 2, 5]), er = pick([1, 1, 2, 3, 5, 7]);
    const CpF = EPS0 * er * Acm * 1e-4 / (dmm * 1e-3) * 1e12;
    return { html: `Ein Plattenkondensator hat die Plattenfläche <b>A = ${Acm} cm²</b>, den Abstand <b>d = ${fmt(dmm, 1)} mm</b>${er > 1 ? ` und ein Dielektrikum mit <b>εr = ${er}</b>` : " und Luft dazwischen"}. Berechne die Kapazität.`,
      label: "<i>C</i> =", placeholder: "in pF", answer: numText(CpF, dec(CpF)), check: T(CpF), hint: "Einheit: pF. A in m², d in m, ε₀ = 8,854 · 10⁻¹² F/m",
      solution: `<span class="math"><i>C</i> = <i>ε</i>₀ · <i>ε</i>r · <i>A</i> / <i>d</i> = 8,854 · 10⁻¹² · ${er} · ${fmt(Acm * 1e-4, 4)} m² / ${fmt(dmm * 1e-3, 4)} m = ${fmt(CpF, 1)} pF</span>` };
  }
  function genEnergy() {
    if (Math.random() < 0.6) {
      const C = pick([10, 47, 100, 220, 470, 1000]), U = pick([5, 9, 12, 24, 50, 100]), WmJ = 0.5 * C * 1e-6 * U * U * 1e3;
      return { html: `Wie viel Energie speichert ein Kondensator mit <b>C = ${C} µF</b> bei <b>U = ${U} V</b>?`,
        label: "<i>W</i> =", placeholder: "in mJ", answer: numText(WmJ, dec(WmJ)), check: T(WmJ), hint: "Einheit: mJ. W = ½ · C · U²",
        solution: `<span class="math"><i>W</i> = ½ · ${C} · 10⁻⁶ F · (${U} V)² = ${fmt(WmJ / 1e3, 5)} J = ${fmt(WmJ, 2)} mJ</span>` };
    }
    const C = pick([100, 220, 470, 1000]), WmJ = pick([50, 100, 200, 500]), U = Math.sqrt(2 * WmJ * 1e-3 / (C * 1e-6));
    return { html: `Ein Kondensator mit <b>C = ${C} µF</b> soll <b>W = ${WmJ} mJ</b> speichern. Auf welche Spannung muss er geladen werden?`,
      label: "<i>U</i> =", placeholder: "in V", answer: numText(U, 2), check: T(U), hint: "Einheit: V. U = √(2W / C)",
      solution: `<span class="math"><i>U</i> = √(2<i>W</i> / <i>C</i>) = √(2 · ${fmt(WmJ / 1e3, 3)} J / ${C} · 10⁻⁶ F) = ${fmt(U, 2)} V</span>` };
  }
  function genCircuit() {
    const C1 = pick([2, 3, 4, 5, 6, 10, 12, 15, 20, 30]), C2 = pick([2, 3, 4, 6, 10, 15, 20, 60]), par = Math.random() < 0.5;
    const C = par ? C1 + C2 : C1 * C2 / (C1 + C2);
    return { html: `Zwei Kondensatoren <b>C₁ = ${C1} µF</b> und <b>C₂ = ${C2} µF</b> sind <b>${par ? "parallel" : "in Reihe"}</b> geschaltet. Berechne die Gesamtkapazität.`,
      label: "<i>C</i> =", placeholder: "in µF", answer: numText(C, dec(C)), check: T(C), hint: `Einheit: µF. ${par ? "Parallel: addieren" : "Reihe: 1/C = 1/C₁ + 1/C₂"}`,
      solution: par ? `<span class="math"><i>C</i> = <i>C</i>₁ + <i>C</i>₂ = ${C1} + ${C2} = ${C} µF</span>`
        : `<span class="math"><i>C</i> = <i>C</i>₁<i>C</i>₂ / (<i>C</i>₁ + <i>C</i>₂) = ${C1 * C2} / ${C1 + C2} = ${fmt(C, 2)} µF</span>` };
  }
  function genTau() {
    const R = pick([1, 2.2, 4.7, 10, 22, 47, 100]), C = pick([10, 22, 47, 100, 220, 470]);
    const tau = R * C; // kΩ · µF = ms
    if (Math.random() < 0.4) return { html: `Berechne die Zeitkonstante für <b>R = ${fmt(R, 1)} kΩ</b> und <b>C = ${C} µF</b>.`,
      label: "τ =", placeholder: "in ms", answer: numText(tau, dec(tau)), check: T(tau), hint: "Einheit: ms. τ = R · C (kΩ · µF = ms)",
      solution: `<span class="math">τ = <i>R</i> · <i>C</i> = ${fmt(R * 1e3, 0)} Ω · ${C} · 10⁻⁶ F = ${fmt(tau / 1e3, 4)} s = ${fmt(tau, 1)} ms</span>` };
    const n = pick([1, 2, 3]), U0 = pick([5, 9, 10, 12, 24]), load = Math.random() < 0.5;
    const u = load ? U0 * (1 - Math.exp(-n)) : U0 * Math.exp(-n);
    return { html: `Ein Kondensator (τ = ${fmt(tau, 1)} ms) wird ${load ? `an <b>${U0} V</b> geladen` : `von <b>${U0} V</b> aus entladen`}. Welche Spannung hat er nach <b>t = ${fmt(n * tau, 1)} ms</b>?`,
      label: "<i>U</i>_C =", placeholder: "in V", answer: numText(u, 2), check: T(u), hint: `Einheit: V. t ist ${n} τ. ${load ? "U = U₀ · (1 − e^(−t/τ))" : "U = U₀ · e^(−t/τ)"}`,
      solution: `<span class="math">t / τ = ${n}; <i>U</i> = ${U0} · ${load ? `(1 − e<sup>−${n}</sup>)` : `e<sup>−${n}</sup>`} = ${U0} · ${fmt(load ? 1 - Math.exp(-n) : Math.exp(-n), 3)} = ${fmt(u, 2)} V</span>` };
  }
  LK.trainer({ el: "#trainer", modes: [
    { id: "cqu", label: "C = Q / U", gen: genCQU },
    { id: "platte", label: "Plattenkondensator", gen: genPlate },
    { id: "energie", label: "Energie", gen: genEnergy },
    { id: "schaltung", label: "Reihe und parallel", gen: genCircuit },
    { id: "tau", label: "Laden und Entladen", gen: genTau }
  ] });

  LK.quiz({ box: "#quizBox", bar: "#qBar", progress: "#qProgress", key: "kondensator.best", n: 10, questions: [
    { q: "Was gibt die Kapazität eines Kondensators an?", o: ["Wie viel Strom er leitet", "Wie viel Ladung er pro Volt speichert", "Seinen Widerstand", "Seine Masse"], a: 1, e: "C = Q / U: Ladung pro Spannung." },
    { q: "In welcher Einheit misst man die Kapazität?", o: ["Coulomb", "Volt", "Farad", "Ohm"], a: 2, e: "1 F = 1 C/V." },
    { q: "Der Plattenabstand wird halbiert. Was passiert mit der Kapazität?", o: ["Sie halbiert sich", "Sie verdoppelt sich", "Sie bleibt gleich", "Sie vervierfacht sich"], a: 1, e: "C = ε₀εr·A/d: kleineres d, größeres C." },
    { q: "Was bewirkt ein Dielektrikum mit εr = 5?", o: ["Kapazität wird 5-mal so groß", "Kapazität wird ein Fünftel", "Spannung wird 5-mal so groß", "Nichts"], a: 0, e: "Die Kapazität wächst um den Faktor εr." },
    { q: "Die Spannung am Kondensator wird verdoppelt. Die gespeicherte Energie …", o: ["verdoppelt sich", "bleibt gleich", "vervierfacht sich", "halbiert sich"], a: 2, e: "W = ½CU²: U doppelt, W vierfach." },
    { q: "Zwei Kondensatoren mit je 10 µF parallel. Gesamtkapazität?", o: ["5 µF", "10 µF", "20 µF", "100 µF"], a: 2, e: "Parallel: Kapazitäten addieren." },
    { q: "Zwei Kondensatoren mit je 10 µF in Reihe. Gesamtkapazität?", o: ["5 µF", "10 µF", "20 µF", "0,1 µF"], a: 0, e: "Reihe: 1/C = 1/10 + 1/10 ⇒ C = 5 µF." },
    { q: "Wie groß ist die Zeitkonstante bei R = 10 kΩ und C = 100 µF?", o: ["0,1 s", "1 s", "1 000 s", "10 ms"], a: 1, e: "τ = 10 000 Ω · 0,0001 F = 1 s." },
    { q: "Wie viel Prozent der Endspannung erreicht ein Kondensator nach 1 τ beim Laden?", o: ["37 %", "50 %", "63 %", "100 %"], a: 2, e: "1 − e⁻¹ ≈ 0,63." },
    { q: "Wann fließt beim Laden der größte Strom?", o: ["Ganz am Anfang", "Nach 1 τ", "Am Ende", "Der Strom ist immer gleich"], a: 0, e: "Zu Beginn ist der Kondensator leer, die ganze Spannung liegt am Widerstand." },
    { q: "Wo ist die Energie eines geladenen Kondensators gespeichert?", o: ["In den Drähten", "Im elektrischen Feld zwischen den Platten", "Im Widerstand", "In der Batterie"], a: 1, e: "Die Energie steckt im Feld." },
    { q: "Ein Kondensator mit 100 µF liegt an 12 V. Welche Ladung trägt er?", o: ["1,2 mC", "8,3 µC", "1 200 C", "0,12 µC"], a: 0, e: "Q = C·U = 100 µF · 12 V = 1 200 µC = 1,2 mC." },
    { q: "Was trennt die beiden Platten eines Kondensators?", o: ["Ein Leiter", "Ein Isolator (Dielektrikum) oder Luft", "Ein Widerstand", "Eine Spule"], a: 1, e: "Die Platten dürfen sich nicht leitend berühren." }
  ] });

  LK.views(["verstehen", "kapazitaet", "laden", "schaltungen", "ueben", "alltag", "quiz"], { kapazitaet: drawCap, laden: drawCurve, schaltungen: drawSeries });
})();
