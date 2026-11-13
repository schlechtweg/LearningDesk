(function () {
  "use strict";
  const { $, $$, pick, fmt } = LK;
  // ---------- blast furnace ----------
  const Z = [
    { y: 30, h: 70, c: "#d9d2c3", t: "Gicht (oben, ca. 200 °C)", eq: "Erz, Koks, Kalk werden eingefüllt; Gichtgas (CO, CO₂, N₂) entweicht", x: "Die Beschickung rutscht langsam nach unten und wird vom aufsteigenden heißen Gas vorgewärmt und getrocknet." },
    { y: 100, h: 80, c: "#e8c39a", t: "Reduktionszone (400–900 °C)", eq: "3 Fe₂O₃ + CO → 2 Fe₃O₄ + CO₂\nFe₃O₄ + CO → 3 FeO + CO₂\nFeO + CO → Fe + CO₂", x: "Indirekte Reduktion: Kohlenstoffmonooxid reduziert das Eisenoxid stufenweise. Fe geht von +III über +II auf 0." },
    { y: 180, h: 80, c: "#f0a868", t: "Kohlungszone (900–1200 °C)", eq: "CO₂ + C → 2 CO (Boudouard-Gleichgewicht)\nFeO + C → Fe + CO", x: "Das entstandene CO₂ wird an glühendem Koks wieder zu CO. Das Eisen nimmt Kohlenstoff auf, dadurch sinkt seine Schmelztemperatur." },
    { y: 260, h: 70, c: "#e86f4a", t: "Schmelzzone (1200–2000 °C)", eq: "C + O₂ → CO₂ (stark exotherm)\nCaCO₃ → CaO + CO₂; CaO + SiO₂ → CaSiO₃ (Schlacke)", x: "Heiße Luft (Wind) verbrennt den Koks und liefert die Wärme. Der Kalk bindet Gestein (Gangart) zu Schlacke." },
    { y: 330, h: 60, c: "#b54a3c", t: "Gestell (Roheisen und Schlacke)", eq: "Abstich: flüssiges Roheisen (unten), Schlacke schwimmt darauf", x: "Roheisen enthält etwa 4 % C und ist spröde. Im Stahlwerk wird Sauerstoff eingeblasen (Frischen): C wird zu CO₂ oxidiert, es entsteht Stahl." }
  ];
  let cur = 1;
  function drawH() {
    let g = "";
    Z.forEach((z, i) => { const w1 = 70 + (i === 0 ? 0 : i < 3 ? i * 18 : (4 - i) * 20 + 30), w2 = 70 + (i < 2 ? (i + 1) * 18 : (3 - i) * 20 + 30); g += `<polygon class="zone${i === cur ? " on" : ""}" data-i="${i}" fill="${z.c}" points="${150 - w1},${z.y} ${150 + w1},${z.y} ${150 + w2},${z.y + z.h} ${150 - w2},${z.y + z.h}"/>`; g += `<text class="t" x="150" y="${z.y + z.h / 2 + 4}" text-anchor="middle">${z.t.split(" (")[0]}</text>`; });
    g += `<path class="arr" d="M150 6 V28 M144 22 L150 28 L156 22"/><text x="160" y="16">Erz, Koks, Kalk</text><path class="arr" d="M18 300 H58 M52 294 L58 300 L52 306"/><text x="10" y="290">Heißwind</text><path class="arr" d="M232 375 H292 M286 369 L292 375 L286 381"/><text x="190" y="405">Abstich: Roheisen, Schlacke</text>`;
    $("#hSvg").innerHTML = g;
    $$("#hSvg .zone").forEach((p) => p.addEventListener("click", () => { cur = +p.dataset.i; drawH(); }));
    const z = Z[cur]; $("#hTitle").textContent = z.t; $("#hEq").innerHTML = z.eq.replace(/\n/g, "<br>"); $("#hText").textContent = z.x;
  }
  drawH();

  // ---------- stoichiometry ----------
  const M = { Fe: 55.85, O: 16.0, Al: 26.98, Cu: 63.55, S: 32.06, Zn: 65.38, C: 12.01, Pb: 207.2 };
  const ORES = [
    { n: "Hämatit Fe₂O₃", met: "Fe", k: 2, parts: [["Fe", 2], ["O", 3]] }, { n: "Magnetit Fe₃O₄", met: "Fe", k: 3, parts: [["Fe", 3], ["O", 4]] },
    { n: "Aluminiumoxid Al₂O₃", met: "Al", k: 2, parts: [["Al", 2], ["O", 3]] }, { n: "Kupfer(I)-sulfid Cu₂S", met: "Cu", k: 2, parts: [["Cu", 2], ["S", 1]] },
    { n: "Zinkblende ZnS", met: "Zn", k: 1, parts: [["Zn", 1], ["S", 1]] }, { n: "Bleiglanz PbS", met: "Pb", k: 1, parts: [["Pb", 1], ["S", 1]] }
  ];
  const molar = (o) => o.parts.reduce((s, [e, c]) => s + M[e] * c, 0);
  $("#cOre").innerHTML = ORES.map((o, i) => `<option value="${i}">${o.n}</option>`).join("");
  function calc() {
    const o = ORES[+$("#cOre").value], m = Math.max(0, +$("#cMass").value || 0), Mo = molar(o), n = m / Mo, mm = n * o.k * M[o.met];
    $("#cOut").textContent = `${fmt(mm, 1)} kg ${o.met}`;
    $("#cSteps").innerHTML = `<li>M(Erz) = ${o.parts.map(([e, c]) => `${c} · ${fmt(M[e], 2)}`).join(" + ")} = ${fmt(Mo, 2)} g/mol</li><li>n(Erz) = ${fmt(m, 0)} kg : ${fmt(Mo, 2)} g/mol = ${fmt(n, 2)} kmol</li><li>Pro Formeleinheit ${o.k} ${o.met}-Atom${o.k > 1 ? "e" : ""}: n(${o.met}) = ${fmt(n * o.k, 2)} kmol</li><li>m(${o.met}) = ${fmt(n * o.k, 2)} kmol · ${fmt(M[o.met], 2)} g/mol = <b>${fmt(mm, 1)} kg</b> (Massenanteil ${fmt((mm / m) * 100 || 0, 1)} %)</li>`;
  }
  ["#cOre", "#cMass"].forEach((id) => $(id).addEventListener("input", calc));
  calc();

  // ---------- trainer ----------
  const METH = { Au: "gediegen", Ag: "gediegen", Cu: "Kohlenstoff", Fe: "Kohlenstoff", Zn: "Kohlenstoff", Pb: "Kohlenstoff", Sn: "Kohlenstoff", Al: "Elektrolyse", Mg: "Elektrolyse", Na: "Elektrolyse", K: "Elektrolyse", Ca: "Elektrolyse", Li: "Elektrolyse" };
  const MN = { Au: "Gold", Ag: "Silber", Cu: "Kupfer", Fe: "Eisen", Zn: "Zink", Pb: "Blei", Sn: "Zinn", Al: "Aluminium", Mg: "Magnesium", Na: "Natrium", K: "Kalium", Ca: "Calcium", Li: "Lithium" };
  function genMeth() { const m = pick(Object.keys(METH).filter((x) => METH[x] !== "gediegen")), want = METH[m];
    return { html: `Wie wird <b>${MN[m]}</b> technisch aus seinen Verbindungen gewonnen: durch Reduktion mit <b>Kohlenstoff</b> oder durch <b>Elektrolyse</b>?`, label: "Verfahren:", placeholder: "Kohlenstoff oder Elektrolyse", answer: want,
      check: (raw) => { const t = raw.trim().toLowerCase(); const v = /elek/.test(t) ? "Elektrolyse" : /kohl|koks|c\b|co\b/.test(t) ? "Kohlenstoff" : null; if (!v) return { ok: false, msg: "Antworte mit <code>Kohlenstoff</code> oder <code>Elektrolyse</code>." }; return v === want ? { ok: true } : { ok: false, msg: "Denke an die Stellung in der Redoxreihe." }; },
      solution: `<b>${want}</b>: ${want === "Elektrolyse" ? "sehr unedel, Kohlenstoff reduziert die Ionen nicht" : "mittlere Stellung, Kohlenstoff bzw. CO reicht aus"}` }; }
  function genMass() { const o = pick(ORES), m = pick([100, 160, 200, 500, 1000, 250]); const mm = (m / molar(o)) * o.k * M[o.met];
    return { html: `Wie viel ${o.met} lässt sich höchstens aus <b>${m} kg ${o.n}</b> gewinnen? (M: ${o.parts.map(([e]) => `${e} ${fmt(M[e], 2)}`).join(", ")} g/mol)`, label: "Masse in kg:", answer: fmt(mm, 1), check: LK.check.num(mm, { abs: Math.max(0.15, mm * 0.01) }),
      solution: `n = ${m} kg : ${fmt(molar(o), 2)} g/mol = ${fmt(m / molar(o), 3)} kmol; m(${o.met}) = ${o.k} · n · ${fmt(M[o.met], 2)} = <b>${fmt(mm, 1)} kg</b>` }; }
  function genZone() { const i = pick([1, 2, 3, 4]), z = Z[i]; const l = z.eq.split("\n")[0];
    return { html: `In welcher Zone des Hochofens läuft vor allem diese Reaktion ab? <span class="eq">${l}</span>`, label: "Zone:", placeholder: "Reduktion, Kohlung, Schmelz oder Gestell", answer: z.t.split(" ")[0],
      check: (raw) => { const t = raw.trim().toLowerCase(); const ok = [/redu/, /kohl/, /schmelz|verbrenn/, /gestell|abstich|roheisen/][i - 1].test(t); return ok ? { ok: true } : { ok: false, msg: "Oben Vorwärmen, dann Reduktion, Kohlung, Schmelzen, unten das Gestell." }; },
      solution: `<b>${z.t}</b>` }; }
  function genRed() { const x = pick([["Fe₂O₃ + 3 CO → 2 Fe + 3 CO₂", "CO", "Fe₂O₃"], ["2 Al₂O₃ → 4 Al + 3 O₂ (Elektrolyse)", "O²⁻", "Al³⁺"], ["Fe₂O₃ + 2 Al → 2 Fe + Al₂O₃", "Al", "Fe₂O₃"], ["2 ZnO + C → 2 Zn + CO₂", "C", "ZnO"], ["Fe₂O₃ + 3 H₂ → 2 Fe + 3 H₂O", "H₂", "Fe₂O₃"], ["2 Cu₂O + Cu₂S → 6 Cu + SO₂", "Cu₂S (S)", "Cu₂O"]]);
    const norm = (t) => t.replace(/\s/g, "").replace(/[₀-₉]/g, (c) => "₀₁₂₃₄₅₆₇₈₉".indexOf(c)).toLowerCase();
    return { html: `Welcher Stoff ist das <b>Reduktionsmittel</b>? <span class="eq">${x[0]}</span>`, label: "Stoff:", answer: x[1], check: (raw) => (norm(raw) && norm(x[1]).startsWith(norm(raw).replace(/[⁺⁻²³+-]/g, "").slice(0, 2)) ? { ok: true } : { ok: false, msg: "Das Reduktionsmittel gibt Elektronen ab und wird oxidiert." }), solution: `<b>${x[1]}</b> wird oxidiert, ${x[2]} wird reduziert.` }; }
  LK.trainer({ el: "#trainer", modes: [
    { id: "verfahren", label: "Verfahren", gen: genMeth },
    { id: "masse", label: "Metallmasse", gen: genMass },
    { id: "zone", label: "Hochofen-Zonen", gen: genZone },
    { id: "rm", label: "Reduktionsmittel", gen: genRed }
  ] });

  LK.quiz({ box: "#quizBox", bar: "#qBar", progress: "#qProgress", key: "metalle.best", n: 8, questions: [
    { q: "Was passiert mit den Metall-Ionen bei der Metallgewinnung?", o: ["Sie werden oxidiert", "Sie werden reduziert", "Sie bleiben gleich", "Sie verdampfen"], a: 1, e: "Sie nehmen Elektronen auf." },
    { q: "Welches Reduktionsmittel wirkt im Hochofen hauptsächlich?", o: ["Sauerstoff", "Kohlenstoffmonooxid", "Wasser", "Kalk"], a: 1, e: "Fe₂O₃ + 3 CO → 2 Fe + 3 CO₂." },
    { q: "Wozu dient der Kalk im Hochofen?", o: ["Als Brennstoff", "Er bindet Gangart zu Schlacke", "Er reduziert Eisen", "Er kühlt"], a: 1, e: "CaO + SiO₂ → CaSiO₃." },
    { q: "Warum gewinnt man Aluminium durch Elektrolyse?", o: ["Weil es billig ist", "Weil Al sehr unedel ist und C es nicht reduziert", "Weil Al gediegen vorkommt", "Wegen der Farbe"], a: 1, e: "Nur Strom erzwingt die Reduktion." },
    { q: "Wozu dient Kryolith bei der Aluminiumgewinnung?", o: ["Es senkt die Schmelztemperatur", "Es ist das Erz", "Es ist die Anode", "Es färbt"], a: 0, e: "Von 2050 °C auf etwa 950 °C." },
    { q: "Was unterscheidet Stahl von Roheisen?", o: ["Mehr Kohlenstoff", "Weniger Kohlenstoff", "Kein Eisen", "Mehr Schwefel"], a: 1, e: "Frischen verbrennt den Kohlenstoff." },
    { q: "Was sammelt sich bei der Kupferraffination als Anodenschlamm?", o: ["Zink und Eisen", "Silber und Gold", "Aluminium", "Wasserstoff"], a: 1, e: "Edlere Metalle werden nicht oxidiert." },
    { q: "Wie viel Energie spart Aluminium-Recycling etwa?", o: ["5 %", "50 %", "95 %", "0 %"], a: 2, e: "Einschmelzen braucht nur etwa 5 % der Energie." }
  ] });

  LK.views(["verstehen", "hochofen", "elektrolyse", "rechnen", "ueben", "alltag", "quiz"], {});
})();
