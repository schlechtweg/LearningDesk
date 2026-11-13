(function () {
  "use strict";
  const { $, $$, pick, fmt } = LK;
  const SUP = (s) => String(s).replace(/[-\d]/g, (c) => (c === "-" ? "⁻" : "⁰¹²³⁴⁵⁶⁷⁸⁹"[c]));
  const sci = (v) => { if (v === 0) return "0"; const e = Math.floor(Math.log10(Math.abs(v))); const m = v / 10 ** e; if (e >= -2 && e <= 3) return fmt(v, Math.max(0, 3 - e)); return `${fmt(m, 2)} · 10${SUP(e)}`; };
  // name, formula, KL, type, molar mass, cation, anion
  const S = [
    ["Silberchlorid", "AgCl", 1.8e-10, "AB", 143.32, "Ag⁺", "Cl⁻"], ["Silberbromid", "AgBr", 5.0e-13, "AB", 187.77, "Ag⁺", "Br⁻"], ["Silberiodid", "AgI", 8.3e-17, "AB", 234.77, "Ag⁺", "I⁻"],
    ["Bariumsulfat", "BaSO₄", 1.1e-10, "AB", 233.39, "Ba²⁺", "SO₄²⁻"], ["Calciumcarbonat", "CaCO₃", 4.8e-9, "AB", 100.09, "Ca²⁺", "CO₃²⁻"], ["Calciumsulfat", "CaSO₄", 2.5e-5, "AB", 136.14, "Ca²⁺", "SO₄²⁻"],
    ["Calciumfluorid", "CaF₂", 3.9e-11, "AB2", 78.07, "Ca²⁺", "F⁻"], ["Bleiiodid", "PbI₂", 7.1e-9, "AB2", 461.0, "Pb²⁺", "I⁻"], ["Magnesiumhydroxid", "Mg(OH)₂", 5.6e-12, "AB2", 58.32, "Mg²⁺", "OH⁻"],
    ["Calciumhydroxid", "Ca(OH)₂", 5.5e-6, "AB2", 74.09, "Ca²⁺", "OH⁻"], ["Silberchromat", "Ag₂CrO₄", 1.1e-12, "A2B", 331.73, "Ag⁺", "CrO₄²⁻"]
  ];
  const L = (s) => (s[3] === "AB" ? Math.sqrt(s[2]) : Math.cbrt(s[2] / 4));
  const kexpr = (s) => (s[3] === "AB" ? `c(${s[5]}) · c(${s[6]})` : s[3] === "AB2" ? `c(${s[5]}) · c(${s[6]})²` : `c(${s[5]})² · c(${s[6]})`);
  const opts = S.map((s, i) => `<option value="${i}">${s[0]} ${s[1]}</option>`).join("");
  $("#lSalt").innerHTML = opts; $("#fSalt").innerHTML = opts;
  function drawL() {
    const s = S[+$("#lSalt").value], l = L(s);
    $("#lOut").innerHTML = `L = ${sci(l)} mol/L = ${sci(l * s[4])} g/L`;
    $("#lSteps").innerHTML = s[3] === "AB" ? `<p>${s[1]}(s) ⇌ ${s[5]} + ${s[6]}; K<sub>L</sub> = ${kexpr(s)} = L² = ${sci(s[2])} ⇒ L = √K<sub>L</sub></p>` :
      `<p>${s[1]}(s) ⇌ ${s[3] === "A2B" ? "2 " : ""}${s[5]} + ${s[3] === "AB2" ? "2 " : ""}${s[6]}; K<sub>L</sub> = ${kexpr(s)} = 4L³ = ${sci(s[2])} ⇒ L = ∛(K<sub>L</sub>/4)</p>`;
    $("#lSteps").innerHTML += `<p>Masse: L · M = ${sci(l)} mol/L · ${fmt(s[4], 2)} g/mol = <b>${sci(l * s[4])} g/L</b>, das sind ${sci(l * s[4] * 1000)} mg pro Liter.</p>`;
    $("#lTab").innerHTML = "<tr><th>Salz</th><th>K<sub>L</sub></th><th>L in mol/L</th></tr>" + S.map((x) => `<tr${x === s ? ' style="font-weight:700"' : ""}><td>${x[1]}</td><td>${sci(x[2])}</td><td>${sci(L(x))}</td></tr>`).join("");
  }
  $("#lSalt").addEventListener("change", drawL); drawL();
  function drawF() {
    const s = S[+$("#fSalt").value], c1 = Math.max(0, +$("#fC1").value || 0), c2 = Math.max(0, +$("#fC2").value || 0);
    $("#fL1").textContent = `c(${s[5]}) in mol/L`; $("#fL2").textContent = `c(${s[6]}) in mol/L`;
    const Q = s[3] === "AB" ? c1 * c2 : s[3] === "AB2" ? c1 * c2 * c2 : c1 * c1 * c2;
    const fall = Q > s[2];
    $("#fOut").innerHTML = fall ? `Niederschlag von ${s[1]} fällt aus` : `Kein Niederschlag`;
    $("#fSteps").innerHTML = `<p>Q = ${kexpr(s)} = <b>${sci(Q)}</b>, K<sub>L</sub> = ${sci(s[2])}.</p><p>${fall ? `Q &gt; K<sub>L</sub>: Die Lösung ist übersättigt, es fällt so lange ${s[1]} aus, bis Q = K<sub>L</sub> ist.` : Q === s[2] ? "Q = K<sub>L</sub>: gesättigte Lösung." : "Q &lt; K<sub>L</sub>: Die Lösung ist ungesättigt, alles bleibt gelöst."}</p><p class="muted">Tipp: Mischt man gleiche Volumina zweier Lösungen, halbieren sich beide Konzentrationen.</p>`;
  }
  ["#fSalt", "#fC1", "#fC2"].forEach((id) => $(id).addEventListener("input", drawF)); drawF();

  // ---------- water analysis ----------
  const PROBE = { Leitungswasser: { Cl: 1, SO4: 1, Ca: 1, Fe: 0 }, Meerwasser: { Cl: 2, SO4: 2, Ca: 1, Fe: 0 }, Mineralwasser: { Cl: 1, SO4: 2, Ca: 2, Fe: 0 }, "destilliertes Wasser": { Cl: 0, SO4: 0, Ca: 0, Fe: 0 }, "Grundwasser (eisenhaltig)": { Cl: 1, SO4: 1, Ca: 1, Fe: 1 } };
  const REAG = { Cl: ["Silbernitrat (AgNO₃)", "Ag⁺ + Cl⁻ → AgCl↓ (weiß, wird am Licht dunkel)", "#ffffff"], SO4: ["Bariumchlorid (BaCl₂)", "Ba²⁺ + SO₄²⁻ → BaSO₄↓ (weiß)", "#ffffff"], Ca: ["Ammoniumoxalat", "Ca²⁺ + C₂O₄²⁻ → CaC₂O₄↓ (weiß)", "#ffffff"], Fe: ["Kaliumthiocyanat (KSCN)", "Fe³⁺ + SCN⁻ → [Fe(SCN)]²⁺ (blutrot, Komplex)", "#a01818"] };
  let pr = "Leitungswasser", re = "Cl";
  $("#wProbe").innerHTML = Object.keys(PROBE).map((p) => `<button type="button" data-p="${p}" aria-pressed="false">${p}</button>`).join("");
  $("#wReag").innerHTML = Object.entries(REAG).map(([k, v]) => `<button type="button" data-r="${k}" aria-pressed="false">${v[0]}</button>`).join("");
  function drawW() {
    $$("[data-p]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.p === pr))); $$("[data-r]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.r === re)));
    const lvl = PROBE[pr][re], [rn, eq, col] = REAG[re];
    const liquid = re === "Fe" && lvl ? `rgba(160,24,24,${0.4 + 0.3 * lvl})` : "rgba(170,205,235,0.55)";
    let g = `<path d="M70 20 V180 a30 30 0 0 0 60 0 V20" fill="none" stroke="#56626d" stroke-width="3"/><path d="M73 70 V180 a27 27 0 0 0 54 0 V70 Z" fill="${liquid}"/>`;
    if (lvl && re !== "Fe") for (let i = 0; i < 25 * lvl; i++) g += `<circle cx="${78 + ((i * 37) % 44)}" cy="${150 + ((i * 53) % 55)}" r="${2 + (i % 3)}" fill="#f4f4f4" stroke="#9aa4ad" stroke-width=".6"/>`;
    $("#wSvg").innerHTML = g;
    $("#wTitle").textContent = `${pr} + ${rn}`;
    $("#wObs").innerHTML = lvl ? (re === "Fe" ? `<b>Rotfärbung</b>: Eisen-Ionen nachgewiesen.` : `<b>${lvl > 1 ? "Starker" : "Leichter"} weißer Niederschlag</b>: ${{ Cl: "Chlorid", SO4: "Sulfat", Ca: "Calcium" }[re]}-Ionen nachgewiesen.`) : "<b>Keine Veränderung</b>: Das Ion ist nicht (oder nur in Spuren) enthalten.";
    $("#wEq").innerHTML = eq + ". Das Ionenprodukt überschreitet K<sub>L</sub> bzw. der farbige Komplex bildet sich.";
  }
  $$("[data-p]").forEach((b) => b.addEventListener("click", () => { pr = b.dataset.p; drawW(); }));
  $$("[data-r]").forEach((b) => b.addEventListener("click", () => { re = b.dataset.r; drawW(); }));
  drawW();

  // ---------- trainer ----------
  const parse = (raw) => { const t = String(raw).replace(/\s/g, "").replace(",", ".").replace(/·10\^?/, "e").replace(/x10\^?/, "e"); const v = Number(t); return isFinite(v) ? v : NaN; };
  const relCheck = (want) => (raw) => { const v = parse(raw); if (isNaN(v)) return { ok: false, msg: "Zahl eingeben, z. B. <code>1.3e-5</code>." }; return Math.abs(v - want) / want < 0.03 ? { ok: true } : { ok: false, msg: "Prüfe Salztyp (AB oder AB₂) und Wurzel." }; };
  function genL() { const s = pick(S); const l = L(s); return { html: `Berechne die Löslichkeit von <b>${s[0]} (${s[1]})</b> in mol/L. K<sub>L</sub> = ${sci(s[2])}.`, label: "L in mol/L:", placeholder: "z. B. 1.3e-5", answer: l.toExponential(2), check: relCheck(l), solution: `${s[3] === "AB" ? "L = √K<sub>L</sub>" : "L = ∛(K<sub>L</sub>/4)"} = <b>${sci(l)} mol/L</b>` }; }
  function genKL() { const s = pick(S); const l = L(s); const lr = +l.toPrecision(2); const K = s[3] === "AB" ? lr * lr : 4 * lr ** 3;
    return { html: `Eine gesättigte Lösung von <b>${s[1]}</b> enthält ${sci(lr)} mol/L gelöstes Salz. Berechne K<sub>L</sub>.`, label: "K<sub>L</sub>:", placeholder: "z. B. 1.8e-10", answer: K.toExponential(2), check: relCheck(K), solution: `${s[3] === "AB" ? "K<sub>L</sub> = L²" : "K<sub>L</sub> = 4L³"} = <b>${sci(K)}</b>` }; }
  function genF() { const s = pick(S.filter((x) => x[3] === "AB")); const e1 = pick([-2, -3, -4, -5, -6]), e2 = pick([-2, -3, -4, -5, -6]); const c1 = pick([1, 2, 5]) * 10 ** e1, c2 = pick([1, 2, 5]) * 10 ** e2; const Q = c1 * c2; if (Math.abs(Math.log10(Q / s[2])) < 0.3) return genF(); const a = Q > s[2] ? "ja" : "nein";
    return { html: `Nach dem Mischen: c(${s[5]}) = ${sci(c1)} mol/L, c(${s[6]}) = ${sci(c2)} mol/L. Fällt <b>${s[1]}</b> aus? (K<sub>L</sub> = ${sci(s[2])})`, label: "ja oder nein:", answer: a, check: (raw) => { const t = raw.trim().toLowerCase(); if (!/^(ja|nein)$/.test(t)) return { ok: false, msg: "Antworte mit <code>ja</code> oder <code>nein</code>." }; return t === a ? { ok: true } : { ok: false, msg: "Berechne Q und vergleiche mit K<sub>L</sub>." }; }, solution: `Q = ${sci(Q)} ${Q > s[2] ? "> K<sub>L</sub>: <b>ja</b>" : "< K<sub>L</sub>: <b>nein</b>"}` }; }
  const NW = [["Cl⁻", "Silbernitrat", "weißer Niederschlag AgCl"], ["SO₄²⁻", "Bariumchlorid", "weißer Niederschlag BaSO₄"], ["Ca²⁺", "Ammoniumoxalat", "weißer Niederschlag CaC₂O₄"], ["Fe³⁺", "Kaliumthiocyanat", "blutrote Färbung"], ["CO₃²⁻", "Salzsäure (dann Kalkwasser)", "Gasentwicklung, CO₂ trübt Kalkwasser"]];
  function genNW() { const [ion, reag, obs] = pick(NW); return { html: `Mit welchem Reagenz weist man <b>${ion}</b> nach?`, label: "Reagenz:", answer: reag, check: (raw) => (raw.trim().toLowerCase().slice(0, 5) === reag.toLowerCase().slice(0, 5) ? { ok: true } : { ok: false, msg: "Welches Ion bildet mit ihm ein schwerlösliches Salz oder einen farbigen Komplex?" }), solution: `<b>${reag}</b>: ${obs}` }; }
  LK.trainer({ el: "#trainer", modes: [
    { id: "l", label: "Löslichkeit", gen: genL },
    { id: "kl", label: "K_L berechnen", gen: genKL },
    { id: "f", label: "Fällung", gen: genF },
    { id: "nw", label: "Nachweise", gen: genNW }
  ] });

  LK.quiz({ box: "#quizBox", bar: "#qBar", progress: "#qProgress", key: "loesl.best", n: 8, questions: [
    { q: "Wie lautet K_L für AgCl?", o: ["c(Ag⁺) · c(Cl⁻)", "c(AgCl)", "c(Ag⁺) / c(Cl⁻)", "c(Ag⁺) + c(Cl⁻)"], a: 0, e: "Der Feststoff entfällt." },
    { q: "Q > K_L bedeutet …", o: ["ungesättigt", "gesättigt", "es fällt etwas aus", "es löst sich mehr"], a: 2, e: "Übersättigte Lösung." },
    { q: "Was bewirkt NaCl-Zugabe zu gesättigter AgCl-Lösung?", o: ["Mehr AgCl löst sich", "AgCl fällt aus", "Keine Wirkung", "AgCl wird oxidiert"], a: 1, e: "Gleichioniger Zusatz." },
    { q: "L für ein Salz AB₂ aus K_L?", o: ["√K_L", "∛(K_L/4)", "K_L/2", "K_L²"], a: 1, e: "K_L = L · (2L)² = 4L³." },
    { q: "Womit weist man Sulfat nach?", o: ["Silbernitrat", "Bariumchlorid", "Kalkwasser", "Lackmus"], a: 1, e: "Weißes BaSO₄." },
    { q: "Warum kann man BaSO₄ beim Röntgen trinken?", o: ["Ba²⁺ ist ungiftig", "BaSO₄ ist extrem schwer löslich", "Es wird sofort ausgeschieden", "Es ist ein Metall"], a: 1, e: "Kaum freie Ba²⁺-Ionen." },
    { q: "Welches Salz ist am schwersten löslich?", o: ["AgCl (1,8 · 10⁻¹⁰)", "AgBr (5 · 10⁻¹³)", "AgI (8,3 · 10⁻¹⁷)", "CaSO₄ (2,5 · 10⁻⁵)"], a: 2, e: "Gleicher Typ AB: kleinstes K_L." },
    { q: "Wovon hängt K_L ab?", o: ["Von der Temperatur", "Von der Menge Bodenkörper", "Vom Gefäß", "Vom Rühren"], a: 0, e: "Wie jede Gleichgewichtskonstante." }
  ] });

  LK.views(["verstehen", "loeslichkeit", "faellung", "wasser", "ueben", "alltag", "quiz"], {});
})();
