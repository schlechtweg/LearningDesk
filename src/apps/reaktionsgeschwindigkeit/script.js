(function () {
  "use strict";
  const { $, $$, pick, fmt, rnd } = LK;
  const reduce = () => typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---------- lab: first-order decay ----------
  const kOf = (T, cat) => 0.02 * Math.pow(2, (T - 20) / 10) * (cat ? 4 : 1); // 1/s
  function drawLab() {
    const c0 = +$("#lc").value, T = +$("#lT").value, cat = $("#lK").checked, k = kOf(T, cat), k0 = kOf(20, false);
    $("#lcV").textContent = fmt(c0, 1); $("#lTV").textContent = T;
    const X = (t) => 50 + (t / 120) * 390, Y = (c) => 260 - (c / 2) * 230;
    let g = "";
    for (let t = 0; t <= 120; t += 20) g += `<line class="gl" x1="${X(t)}" y1="30" x2="${X(t)}" y2="260"/><text x="${X(t)}" y="276" text-anchor="middle">${t}</text>`;
    for (let c = 0; c <= 2; c += 0.5) g += `<line class="gl" x1="50" y1="${Y(c)}" x2="440" y2="${Y(c)}"/><text x="44" y="${Y(c) + 4}" text-anchor="end">${fmt(c, 1)}</text>`;
    g += `<line class="ax" x1="50" y1="260" x2="445" y2="260"/><line class="ax" x1="50" y1="260" x2="50" y2="25"/><text x="440" y="292" text-anchor="end">t in s</text><text x="54" y="22">c(A) in mol/L</text>`;
    const path = (cc, kk) => "M" + Array.from({ length: 121 }, (_, t) => `${X(t).toFixed(1)} ${Y(cc * Math.exp(-kk * t)).toFixed(1)}`).join(" L");
    g += `<path class="ref" d="${path(1, k0)}"/><path class="c1" d="${path(c0, k)}"/>`;
    // tangent at t = 0
    const v0 = k * c0, t1 = Math.min(120, c0 / v0);
    g += `<line class="tan" x1="${X(0)}" y1="${Y(c0)}" x2="${X(t1)}" y2="${Y(c0 - v0 * t1)}"/>`;
    $("#lSvg").innerHTML = g;
    const th = Math.log(2) / k;
    $("#lOut").textContent = `v₀ = ${fmt(v0, 4)} mol/(L·s)`;
    $("#lText").innerHTML = `Halbwertszeit ${fmt(th, 1)} s. Gegenüber 20 °C ohne Katalysator ist die Reaktion <b>${fmt(k / k0, 1)}-mal</b> so schnell. Die rote Linie ist die Tangente am Start: ihre Steigung ist die Anfangsgeschwindigkeit. Doppelte Konzentration ergibt doppelte Anfangsgeschwindigkeit.`;
  }
  ["#lc", "#lT", "#lK"].forEach((id) => $(id).addEventListener("input", drawLab));
  drawLab();

  // ---------- particle collisions ----------
  let P = [], hits = 0, tries = 0, raf = null, flashes = [];
  function resetP() {
    const n = +$("#pn").value, T = +$("#pT").value; P = [];
    for (let i = 0; i < n; i++) { const a = Math.random() * 2 * Math.PI, s = (0.6 + Math.random()) * T; P.push({ x: 20 + Math.random() * 360, y: 20 + Math.random() * 220, vx: Math.cos(a) * s, vy: Math.sin(a) * s, t: i % 2, done: false }); }
    hits = 0; tries = 0; flashes = [];
    $("#pnV").textContent = n; $("#pTV").textContent = fmt(T, 1);
  }
  function stepP() {
    const T = +$("#pT").value, thr = ($("#pK").checked ? 1.6 : 3.0);
    P.forEach((p) => { p.x += p.vx; p.y += p.vy; if (p.x < 8 || p.x > 392) p.vx *= -1; if (p.y < 8 || p.y > 252) p.vy *= -1; });
    for (let i = 0; i < P.length; i++) for (let j = i + 1; j < P.length; j++) {
      const a = P[i], b = P[j]; if (a.done || b.done || a.t === b.t) continue;
      const dx = a.x - b.x, dy = a.y - b.y; if (dx * dx + dy * dy > 144) continue;
      tries++; const rel = Math.hypot(a.vx - b.vx, a.vy - b.vy);
      if (rel > thr) { a.done = b.done = true; hits++; flashes.push({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2, n: 12 }); }
      else { const tx = a.vx; a.vx = b.vx; b.vx = tx; const ty = a.vy; a.vy = b.vy; b.vy = ty; a.x += a.vx; b.x += b.vx; }
    }
    let g = P.map((p) => `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="6" fill="${p.done ? "#8a9aa6" : p.t ? "#e0a400" : "#4a78c8"}"/>`).join("");
    flashes = flashes.filter((f) => f.n-- > 0); g += flashes.map((f) => `<circle cx="${f.x}" cy="${f.y}" r="${14 - f.n / 2}" fill="none" stroke="#c62828" stroke-width="2"/>`).join("");
    $("#pSvg").innerHTML = g;
    const left = P.filter((p) => !p.done).length;
    $("#pOut").innerHTML = `Stöße A–B: ${tries}, davon wirksam: <b>${hits}</b>. Noch ${left} von ${P.length} Teilchen übrig. ${void T || ""}`;
    raf = $("#view-teilchen").hidden ? null : requestAnimationFrame(stepP);
  }
  ["#pn", "#pT"].forEach((id) => $(id).addEventListener("input", resetP));
  $("#pReset").addEventListener("click", resetP);
  resetP();

  // ---------- energy diagram ----------
  let ek = "exo";
  function drawE() {
    const cat = $("#eK").checked, exo = ek === "exo";
    const yR = 170, yP = exo ? 220 : 120, ea = 60, eaC = 115;
    const curve = (top) => `M40 ${yR} L120 ${yR} C175 ${yR} 190 ${top} 230 ${top} C270 ${top} 285 ${yP} 340 ${yP} L430 ${yP}`;
    let g = `<line class="ax" x1="30" y1="260" x2="440" y2="260"/><line class="ax" x1="30" y1="260" x2="30" y2="20"/><text x="36" y="22">Energie</text><text x="440" y="276" text-anchor="end">Reaktionsverlauf</text>`;
    g += `<path class="c1" d="${curve(ea)}"/>`;
    if (cat) g += `<path class="c2" d="${curve(eaC)}"/>`;
    g += `<text class="lb" x="60" y="${yR - 8}">Edukte</text><text class="lb" x="330" y="${yP + 20}">Produkte</text>`;
    g += `<line class="tan" x1="226" y1="${yR}" x2="226" y2="${ea}"/><text x="220" y="${(yR + ea) / 2 - 10}" text-anchor="end">Eₐ</text>`;
    if (cat) g += `<line class="tan" x1="236" y1="${yR}" x2="236" y2="${eaC}" style="stroke:#b8860b"/><text x="242" y="${(yR + eaC) / 2 + 4}" style="fill:#b8860b">Eₐ (Kat.)</text>`;
    g += `<line class="ref" x1="425" y1="${yR}" x2="425" y2="${yP}"/><line class="gl" x1="120" y1="${yR}" x2="430" y2="${yR}"/><text x="420" y="${(yR + yP) / 2 + 4}" text-anchor="end">ΔH ${exo ? "< 0" : "> 0"}</text>`;
    $("#eSvg").innerHTML = g;
    $("#eText").innerHTML = (exo ? "Exotherm: Die Produkte liegen energetisch tiefer, Energie wird frei." : "Endotherm: Die Produkte liegen höher, Energie wird aufgenommen.") + (cat ? " Der Katalysator (gelb) ermöglicht einen Weg über einen <b>niedrigeren Berg</b>. Anfangs- und Endniveau und damit ΔH bleiben gleich." : "");
  }
  $$("[data-e]").forEach((b) => b.addEventListener("click", () => { ek = b.dataset.e; $$("[data-e]").forEach((x) => x.setAttribute("aria-pressed", String(x === b))); drawE(); }));
  $("#eK").addEventListener("change", drawE);
  drawE();

  // ---------- trainer ----------
  function genMittel() { const c1 = rnd(5, 20) / 10, dc = rnd(1, Math.round(c1 * 10) - 1) / 10, t1 = rnd(0, 6) * 10, dt = pick([10, 20, 30, 40, 60]); const v = dc / dt;
    return { html: `Die Konzentration eines Ausgangsstoffs sinkt von <b>${fmt(c1, 1)} mol/L</b> (t = ${t1} s) auf <b>${fmt(c1 - dc, 1)} mol/L</b> (t = ${t1 + dt} s). Mittlere Reaktionsgeschwindigkeit?`, label: "v in mol/(L·s):", answer: fmt(v, 4), check: LK.check.num(v, { abs: 0.0006 }), solution: `v = −Δc/Δt = ${fmt(dc, 1)} : ${dt} = <b>${fmt(v, 4)} mol/(L·s)</b>` }; }
  function genRGT() { const dT = pick([10, 20, 30, 40, 50]), f = Math.pow(2, dT / 10); const up = Math.random() < 0.7;
    return { html: `Die Temperatur wird um ${dT} K ${up ? "erhöht" : "gesenkt"}. Um welchen Faktor ändert sich die Reaktionsgeschwindigkeit nach der RGT-Regel?`, label: "Faktor:", answer: up ? String(f) : fmt(1 / f, 4), check: LK.check.num(up ? f : 1 / f, { abs: 0.002 }), solution: `2<sup>${dT}/10</sup> = ${f}: ${up ? `<b>${f}-mal</b> so schnell` : `<b>1/${f} = ${fmt(1 / f, 4)}</b>`}` }; }
  function genGas() { const V = pick([12, 15, 20, 24, 30, 36, 45, 60]), t = pick([10, 15, 20, 30, 60]); const v = V / t;
    return { html: `Bei der Reaktion von Magnesium mit Salzsäure entstehen in ${t} s <b>${V} mL</b> Wasserstoff. Mittlere Bildungsgeschwindigkeit in mL/s?`, label: "mL/s:", answer: fmt(v, 2), check: LK.check.num(v, { abs: 0.01 }), solution: `${V} mL : ${t} s = <b>${fmt(v, 2)} mL/s</b>` }; }
  const F = [["Ein Stück Zink wird durch Zinkpulver ersetzt.", "schneller", "größere Oberfläche (Zerteilungsgrad)"], ["Die Salzsäure wird verdünnt.", "langsamer", "geringere Konzentration, weniger Stöße"], ["Die Lösung wird gekühlt.", "langsamer", "weniger Teilchen haben E ≥ Eₐ"], ["Es wird Braunstein zu H₂O₂ gegeben.", "schneller", "Katalysator senkt Eₐ"], ["Die Temperatur steigt um 20 K.", "schneller", "RGT-Regel: etwa 4-mal"], ["Es wird mehr Wasser zugegeben.", "langsamer", "Verdünnung"], ["Die Säure wird konzentrierter.", "schneller", "mehr Stöße"], ["Ein Enzym wird über 60 °C erhitzt.", "langsamer", "Enzym wird zerstört (denaturiert)"]];
  function genFaktor() { const [s, a, w] = pick(F); return { html: `${s} Wird die Reaktion schneller oder langsamer?`, label: "Antwort:", placeholder: "schneller oder langsamer", answer: a, check: (raw) => { const t = raw.trim().toLowerCase(); const v = /schnell/.test(t) ? "schneller" : /langsam/.test(t) ? "langsamer" : null; if (!v) return { ok: false, msg: "Antworte mit <code>schneller</code> oder <code>langsamer</code>." }; return v === a ? { ok: true } : { ok: false, msg: "Denke an die Stoßtheorie." }; }, solution: `<b>${a}</b>: ${w}` }; }
  LK.trainer({ el: "#trainer", modes: [
    { id: "mittel", label: "Mittlere Geschwindigkeit", gen: genMittel },
    { id: "gas", label: "Gasvolumen", gen: genGas },
    { id: "rgt", label: "RGT-Regel", gen: genRGT },
    { id: "faktor", label: "Einflussgrößen", gen: genFaktor }
  ] });

  LK.quiz({ box: "#quizBox", bar: "#qBar", progress: "#qProgress", key: "rg.best", n: 8, questions: [
    { q: "Wie ist die Reaktionsgeschwindigkeit definiert?", o: ["v = Δc/Δt", "v = Δt/Δc", "v = m/V", "v = c · t"], a: 0, e: "Konzentrationsänderung pro Zeit." },
    { q: "Was besagt die RGT-Regel?", o: ["+10 K ⇒ etwa doppelt so schnell", "+10 K ⇒ halb so schnell", "+1 K ⇒ doppelt so schnell", "Temperatur egal"], a: 0, e: "Reaktionsgeschwindigkeit-Temperatur-Regel." },
    { q: "Warum reagiert Pulver schneller als ein Stück?", o: ["Es ist leichter", "Größere Oberfläche, mehr Stöße", "Es ist wärmer", "Es enthält Katalysator"], a: 1, e: "Zerteilungsgrad." },
    { q: "Was macht ein Katalysator?", o: ["Er liefert Energie", "Er senkt die Aktivierungsenergie", "Er erhöht ΔH", "Er verschiebt das Gleichgewicht"], a: 1, e: "Neuer Reaktionsweg." },
    { q: "Welche Stöße führen zur Reaktion?", o: ["Alle", "Nur die mit genug Energie und passender Ausrichtung", "Nur langsame", "Keine"], a: 1, e: "Wirksame Stöße." },
    { q: "Wann ist die Reaktionsgeschwindigkeit meist am größten?", o: ["Am Anfang", "In der Mitte", "Am Ende", "Immer gleich"], a: 0, e: "Dann ist die Konzentration der Edukte am höchsten." },
    { q: "Wird ein Katalysator bei der Reaktion verbraucht?", o: ["Ja, vollständig", "Nein, er liegt danach unverändert vor", "Teilweise", "Er wird zum Produkt"], a: 1, e: "Er geht unverändert hervor." },
    { q: "Wie kann man die Geschwindigkeit von CaCO₃ + HCl messen?", o: ["Massenverlust durch CO₂", "Farbänderung", "Gar nicht", "Mit dem Thermometer allein"], a: 0, e: "Das CO₂ entweicht." }
  ] });

  LK.views(["verstehen", "labor", "teilchen", "katalysator", "ueben", "alltag", "quiz"], {
    teilchen: () => { if (!raf) { if (reduce()) { for (let i = 0; i < 200; i++) stepP(); cancelAnimationFrame(raf); raf = null; } else raf = requestAnimationFrame(stepP); } }
  });
})();
