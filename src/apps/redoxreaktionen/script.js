(function () {
  "use strict";
  const { $, $$, pick, shuffle } = LK;
  const SUBD = (s) => String(s).replace(/\d/g, (d) => "₀₁₂₃₄₅₆₇₈₉"[d]);
  const SUPD = (s) => String(s).replace(/[\d+\-−]/g, (d) => ({ "+": "⁺", "-": "⁻", "−": "⁻" }[d] || "⁰¹²³⁴⁵⁶⁷⁸⁹"[d]));
  const ROM = (n) => (n === 0 ? "0" : (n > 0 ? "+" : "−") + ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII"][Math.abs(n)]);
  const chargeStr = (q) => (q === 0 ? "" : SUPD((Math.abs(q) === 1 ? "" : Math.abs(q)) + (q > 0 ? "+" : "-")));
  // species: name, atoms [symbol, count, oxidation number], charge, note on the rule used
  const SP = [
    ["Wasser", [["H", 2, 1], ["O", 1, -2]], 0], ["Wasserstoffperoxid", [["H", 2, 1], ["O", 2, -1]], 0, "Peroxid: O hat hier −I."],
    ["Kohlenstoffdioxid", [["C", 1, 4], ["O", 2, -2]], 0], ["Kohlenstoffmonooxid", [["C", 1, 2], ["O", 1, -2]], 0], ["Methan", [["C", 1, -4], ["H", 4, 1]], 0],
    ["Ammoniak", [["N", 1, -3], ["H", 3, 1]], 0], ["Ammonium-Ion", [["N", 1, -3], ["H", 4, 1]], 1], ["Salpetersäure", [["H", 1, 1], ["N", 1, 5], ["O", 3, -2]], 0], ["Nitrat-Ion", [["N", 1, 5], ["O", 3, -2]], -1], ["Stickstoffdioxid", [["N", 1, 4], ["O", 2, -2]], 0],
    ["Schwefeldioxid", [["S", 1, 4], ["O", 2, -2]], 0], ["Sulfat-Ion", [["S", 1, 6], ["O", 4, -2]], -2], ["Schwefelwasserstoff", [["H", 2, 1], ["S", 1, -2]], 0], ["Schwefelsäure", [["H", 2, 1], ["S", 1, 6], ["O", 4, -2]], 0],
    ["Permanganat-Ion", [["Mn", 1, 7], ["O", 4, -2]], -1], ["Mangandioxid (Braunstein)", [["Mn", 1, 4], ["O", 2, -2]], 0], ["Dichromat-Ion", [["Cr", 2, 6], ["O", 7, -2]], -2], ["Chromat-Ion", [["Cr", 1, 6], ["O", 4, -2]], -2],
    ["Eisen(III)-oxid", [["Fe", 2, 3], ["O", 3, -2]], 0], ["Eisen(II)-chlorid", [["Fe", 1, 2], ["Cl", 2, -1]], 0], ["Kupfer(I)-oxid", [["Cu", 2, 1], ["O", 1, -2]], 0], ["Aluminiumoxid", [["Al", 2, 3], ["O", 3, -2]], 0],
    ["Chlorwasserstoff", [["H", 1, 1], ["Cl", 1, -1]], 0], ["Hypochlorige Säure", [["H", 1, 1], ["Cl", 1, 1], ["O", 1, -2]], 0], ["Chlorat-Ion", [["Cl", 1, 5], ["O", 3, -2]], -1], ["Perchlorat-Ion", [["Cl", 1, 7], ["O", 4, -2]], -1],
    ["Natriumhydrid", [["Na", 1, 1], ["H", 1, -1]], 0, "Metallhydrid: H hat hier −I."], ["Phosphorsäure", [["H", 3, 1], ["P", 1, 5], ["O", 4, -2]], 0], ["Methanol", [["C", 1, -2], ["H", 4, 1], ["O", 1, -2]], 0], ["Glucose", [["C", 6, 0], ["H", 12, 1], ["O", 6, -2]], 0]
  ].map(([n, at, q, note]) => ({ n, at, q, note }));
  const formula = (s) => s.at.map(([e, c]) => e + (c > 1 ? SUBD(c) : "")).join("") + chargeStr(s.q);
  // the atom whose OZ is computed from the others: the one that is neither H nor O (or the peroxide/hydride special case)
  function unknownIdx(s) { if (s.note) return s.at.findIndex(([e]) => (s.note.includes("O hat") ? e === "O" : e === "H")); const i = s.at.findIndex(([e]) => e !== "H" && e !== "O" && e !== "F"); return i < 0 ? 0 : i; }
  function ozSteps(s) {
    const u = unknownIdx(s), st = [];
    s.at.forEach(([e, c, oz], i) => { if (i !== u) st.push([`${e}: ${ROM(oz)}`, e === "O" ? "Sauerstoff meist −II." : e === "H" ? "Wasserstoff meist +I." : e === "Cl" && oz === -1 ? "Halogenid-Ion bzw. elektronegativerer Partner: −I." : `${e} als Metall-Ion: Ladung ${ROM(oz)}.`]); });
    const [ue, uc, uoz] = s.at[u];
    const known = s.at.filter((_, i) => i !== u).map(([e, c, oz]) => `${c}·(${oz > 0 ? "+" : ""}${oz})`).join(" + ");
    st.push([`Summe = Ladung ${s.q > 0 ? "+" : ""}${s.q}: ${uc}·x + ${known} = ${s.q}`, s.note || "Die Summe aller Oxidationszahlen ergibt die Ladung des Teilchens."]);
    st.push([`⇒ x = <b>${ROM(uoz)}</b> für ${ue}`, ""]);
    return st;
  }
  let cur = SP[11];
  $("#ozChips").innerHTML = SP.map((s, i) => `<button type="button" data-i="${i}" aria-pressed="false" title="${s.n}">${formula(s)}</button>`).join("");
  function drawOZ() {
    $$("#ozChips button").forEach((b) => b.setAttribute("aria-pressed", String(SP[+b.dataset.i] === cur)));
    $("#ozF").innerHTML = cur.at.map(([e, c, oz]) => `<span class="at"><span class="oz">${ROM(oz)}</span><span>${e}${c > 1 ? `<sub>${c}</sub>` : ""}</span></span>`).join("") + `<span style="font-size:1.2rem;align-self:flex-start">${chargeStr(cur.q)}</span><span style="font-size:1rem;font-weight:400;margin-left:12px;align-self:center">${cur.n}</span>`;
    $("#ozSteps").innerHTML = ozSteps(cur).map(([t, w]) => `<li>${t}${w ? `<span class="why">${w}</span>` : ""}</li>`).join("");
  }
  $$("#ozChips button").forEach((b) => b.addEventListener("click", () => { cur = SP[+b.dataset.i]; drawOZ(); }));
  drawOZ();

  // ---------- equations workshop ----------
  const RX = [
    { k: "Zn + Cu²⁺", task: "Zink reagiert mit Kupfer(II)-Ionen.", ox: "Zn", red: "Cu²⁺", steps: [
      ["OZ: Zn 0 → +II, Cu +II → 0", "Zn wird oxidiert, Cu²⁺ wird reduziert."], ["<span class='ox'>Ox: Zn → Zn²⁺ + 2 e⁻</span>", ""], ["<span class='red'>Red: Cu²⁺ + 2 e⁻ → Cu</span>", ""], ["Elektronen sind schon gleich (2 = 2).", ""], ["<b>Zn + Cu²⁺ → Zn²⁺ + Cu</b>", "Probe: Ladung links +2, rechts +2."]] },
    { k: "Cu + Ag⁺", task: "Ein Kupferdraht in Silbernitratlösung.", ox: "Cu", red: "Ag⁺", steps: [
      ["OZ: Cu 0 → +II, Ag +I → 0", ""], ["<span class='ox'>Ox: Cu → Cu²⁺ + 2 e⁻</span>", ""], ["<span class='red'>Red: Ag⁺ + e⁻ → Ag</span>", ""], ["Red · 2: 2 Ag⁺ + 2 e⁻ → 2 Ag", "kgV der Elektronen ist 2."], ["<b>Cu + 2 Ag⁺ → Cu²⁺ + 2 Ag</b>", "Ladung: +2 = +2."]] },
    { k: "Mg + O₂", task: "Magnesium verbrennt an der Luft.", ox: "Mg", red: "O2", steps: [
      ["OZ: Mg 0 → +II, O 0 → −II", ""], ["<span class='ox'>Ox: Mg → Mg²⁺ + 2 e⁻</span>", ""], ["<span class='red'>Red: O₂ + 4 e⁻ → 2 O²⁻</span>", "Ein O₂-Molekül braucht 2 · 2 Elektronen."], ["Ox · 2: 2 Mg → 2 Mg²⁺ + 4 e⁻", ""], ["<b>2 Mg + O₂ → 2 MgO</b>", ""]] },
    { k: "Fe₂O₃ + CO", task: "Im Hochofen reduziert Kohlenstoffmonooxid Eisenoxid.", ox: "CO", red: "Fe2O3", steps: [
      ["OZ: Fe +III → 0, C +II → +IV", "CO ist das Reduktionsmittel."], ["<span class='ox'>Ox: C(+II) → C(+IV) + 2 e⁻</span>", "pro CO-Molekül 2 Elektronen"], ["<span class='red'>Red: Fe(+III) + 3 e⁻ → Fe(0)</span>", "pro Fe-Atom 3 Elektronen, pro Fe₂O₃ also 6"], ["6 Elektronen: 3 CO geben sie ab, 1 Fe₂O₃ nimmt sie auf.", ""], ["<b>Fe₂O₃ + 3 CO → 2 Fe + 3 CO₂</b>", ""]] },
    { k: "MnO₄⁻ + Fe²⁺", task: "Permanganat oxidiert Eisen(II)-Ionen in saurer Lösung.", ox: "Fe²⁺", red: "MnO₄⁻", steps: [
      ["OZ: Mn +VII → +II, Fe +II → +III", ""], ["<span class='ox'>Ox: Fe²⁺ → Fe³⁺ + e⁻</span>", ""], ["<span class='red'>Red: MnO₄⁻ + 5 e⁻ → Mn²⁺</span>", "Mn nimmt 5 Elektronen auf."], ["Ladungsausgleich mit H⁺: links −1 −5 = −6, rechts +2 ⇒ 8 H⁺ links. Sauerstoff mit Wasser: MnO₄⁻ + 8 H⁺ + 5 e⁻ → Mn²⁺ + 4 H₂O", "saure Lösung: H⁺ und H₂O verwenden"], ["Ox · 5: 5 Fe²⁺ → 5 Fe³⁺ + 5 e⁻", ""], ["<b>MnO₄⁻ + 5 Fe²⁺ + 8 H⁺ → Mn²⁺ + 5 Fe³⁺ + 4 H₂O</b>", "Probe: Ladung links +17, rechts +17."]] },
    { k: "Cr₂O₇²⁻ + I⁻", task: "Dichromat oxidiert Iodid in saurer Lösung.", ox: "I⁻", red: "Cr₂O₇²⁻", steps: [
      ["OZ: Cr +VI → +III, I −I → 0", ""], ["<span class='ox'>Ox: 2 I⁻ → I₂ + 2 e⁻</span>", ""], ["<span class='red'>Red: Cr₂O₇²⁻ + 6 e⁻ → 2 Cr³⁺</span>", "2 Cr-Atome nehmen je 3 Elektronen auf."], ["Ladung: links −2 −6 = −8, rechts +6 ⇒ 14 H⁺; O mit Wasser: Cr₂O₇²⁻ + 14 H⁺ + 6 e⁻ → 2 Cr³⁺ + 7 H₂O", ""], ["Ox · 3: 6 I⁻ → 3 I₂ + 6 e⁻", ""], ["<b>Cr₂O₇²⁻ + 6 I⁻ + 14 H⁺ → 2 Cr³⁺ + 3 I₂ + 7 H₂O</b>", "Probe: Ladung +6 = +6."]] }
  ];
  let rx = RX[0], shown = 0;
  $("#rChips").innerHTML = RX.map((r, i) => `<button type="button" data-i="${i}" aria-pressed="false">${r.k}</button>`).join("");
  function drawRx() {
    $$("#rChips button").forEach((b) => b.setAttribute("aria-pressed", String(RX[+b.dataset.i] === rx)));
    $("#rTask").textContent = rx.task;
    $("#rSteps").innerHTML = rx.steps.slice(0, shown).map(([t, w]) => `<li><span class="eq">${t}</span>${w ? `<span class="why">${w}</span>` : ""}</li>`).join("");
    $("#rNext").disabled = shown >= rx.steps.length;
  }
  $$("#rChips button").forEach((b) => b.addEventListener("click", () => { rx = RX[+b.dataset.i]; shown = 0; drawRx(); }));
  $("#rNext").addEventListener("click", () => { shown++; drawRx(); });
  $("#rAll").addEventListener("click", () => { shown = rx.steps.length; drawRx(); });
  drawRx();

  // ---------- trainer ----------
  const numCheck = (v) => (raw) => { const t = String(raw).replace(/\s/g, "").replace(/[−–]/g, "-"); const rom = { i: 1, ii: 2, iii: 3, iv: 4, v: 5, vi: 6, vii: 7, viii: 8 }; const m = t.match(/^([+-]?)([ivx]+|\d+)$/i); if (!m && t !== "0") return { ok: false, msg: "Schreibe z. B. <code>+4</code> oder <code>-2</code>." }; const n = t === "0" ? 0 : (m[1] === "-" ? -1 : 1) * (rom[m[2].toLowerCase()] || +m[2]); return n === v ? { ok: true } : { ok: false, msg: "O meist −II, H meist +I, Summe = Ladung." }; };
  function genOZ() { const s = pick(SP); const u = unknownIdx(s); const [e, , oz] = s.at[u]; return { html: `Oxidationszahl von <b>${e}</b> in <b>${formula(s)}</b> (${s.n})?`, label: "OZ:", placeholder: "z. B. +4", answer: (oz > 0 ? "+" : "") + oz, check: numCheck(oz), solution: ozSteps(s).map(([t]) => t).join("; ") }; }
  const norm = (t) => String(t).replace(/\s/g, "").replace(/[₀-₉]/g, (c) => "₀₁₂₃₄₅₆₇₈₉".indexOf(c)).replace(/[⁺]/g, "+").replace(/[⁻−]/g, "-").replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹]/g, (c) => "⁰¹²³⁴⁵⁶⁷⁸⁹".indexOf(c)).toLowerCase();
  const eqT = (a, b) => { const x = norm(a), y = norm(b); return x === y || x.replace(/(\d)([+-])$/, "$2$1") === y || x === y.replace(/(\d)([+-])$/, "$2$1"); };
  function genWho() { const r = pick(RX), which = pick(["ox", "red"]), want = r[which];
    return { html: `${r.task} (<span class="eq">${r.steps[r.steps.length - 1][0].replace(/<[^>]+>/g, "")}</span>) Welches Teilchen wird <b>${which === "ox" ? "oxidiert" : "reduziert"}</b>?`, label: "Teilchen:", placeholder: "z. B. Zn", answer: want,
      check: (raw) => (eqT(raw, want) ? { ok: true } : eqT(raw, r[which === "ox" ? "red" : "ox"]) ? { ok: false, msg: "Umgekehrt: Oxidiert wird, wessen Oxidationszahl steigt." } : { ok: false, msg: "Vergleiche die Oxidationszahlen vorher und nachher." }),
      solution: `${r.steps[0][0]}: <b>${want}</b> wird ${which === "ox" ? "oxidiert (Reduktionsmittel)" : "reduziert (Oxidationsmittel)"}` }; }
  const HALF = [["Fe²⁺ → Fe³⁺", 1], ["Zn → Zn²⁺", 2], ["Al → Al³⁺", 3], ["Cl₂ → 2 Cl⁻", 2], ["O₂ → 2 O²⁻", 4], ["MnO₄⁻ → Mn²⁺", 5], ["Cr₂O₇²⁻ → 2 Cr³⁺", 6], ["2 I⁻ → I₂", 2], ["Ag⁺ → Ag", 1], ["SO₃²⁻ → SO₄²⁻", 2], ["NO₃⁻ → NO", 3], ["H₂O₂ → 2 H₂O", 2], ["Cu → Cu²⁺", 2], ["2 Br⁻ → Br₂", 2]];
  function genE() { const [h, n] = pick(HALF); return { html: `Wie viele Elektronen werden in der Teilreaktion <span class="eq">${h}</span> übertragen?`, label: "Elektronen:", answer: String(n), check: LK.check.num(n, { abs: 0 }), solution: `Änderung der Oxidationszahlen insgesamt: <b>${n} e⁻</b>` }; }
  const SER = ["K", "Ca", "Na", "Mg", "Al", "Zn", "Fe", "Ni", "Sn", "Pb", "Cu", "Ag", "Au"];
  const ION = { K: "K⁺", Ca: "Ca²⁺", Na: "Na⁺", Mg: "Mg²⁺", Al: "Al³⁺", Zn: "Zn²⁺", Fe: "Fe²⁺", Ni: "Ni²⁺", Sn: "Sn²⁺", Pb: "Pb²⁺", Cu: "Cu²⁺", Ag: "Ag⁺", Au: "Au³⁺" };
  function genReihe() { const pool = SER.slice(3); const [a, b] = shuffle(pool.slice()).slice(0, 2); const yes = SER.indexOf(a) < SER.indexOf(b);
    return { html: `Ein Stück <b>${a}</b> wird in eine Lösung mit <b>${ION[b]}</b>-Ionen gestellt. Läuft eine Reaktion ab?`, label: "ja oder nein:", answer: yes ? "ja" : "nein", check: (raw) => { const t = raw.trim().toLowerCase(); if (!/^(ja|nein)$/.test(t)) return { ok: false, msg: "Antworte mit <code>ja</code> oder <code>nein</code>." }; return (t === "ja") === yes ? { ok: true } : { ok: false, msg: "Ein unedleres Metall reduziert die Ionen eines edleren." }; },
      solution: yes ? `<b>ja</b>: ${a} ist unedler als ${b} und gibt Elektronen an ${ION[b]} ab.` : `<b>nein</b>: ${a} ist edler als ${b}.` }; }
  LK.trainer({ el: "#trainer", modes: [
    { id: "oz", label: "Oxidationszahlen", gen: genOZ },
    { id: "wer", label: "Oxidiert oder reduziert?", gen: genWho },
    { id: "elektronen", label: "Elektronenzahl", gen: genE },
    { id: "reihe", label: "Redoxreihe", gen: genReihe }
  ] });

  LK.quiz({ box: "#quizBox", bar: "#qBar", progress: "#qProgress", key: "redox.best", n: 8, questions: [
    { q: "Was ist eine Oxidation?", o: ["Elektronenaufnahme", "Elektronenabgabe", "Protonenabgabe", "Reaktion mit Wasser"], a: 1, e: "OIL: Oxidation Is Loss." },
    { q: "Was ist ein Oxidationsmittel?", o: ["Ein Teilchen, das Elektronen abgibt", "Ein Teilchen, das Elektronen aufnimmt und dabei reduziert wird", "Immer Sauerstoff", "Ein Katalysator"], a: 1, e: "Elektronenakzeptor." },
    { q: "Oxidationszahl von S in SO₄²⁻?", o: ["+IV", "+VI", "−II", "+II"], a: 1, e: "x + 4·(−2) = −2." },
    { q: "Oxidationszahl von Mn in MnO₄⁻?", o: ["+VII", "+II", "+IV", "−I"], a: 0, e: "x − 8 = −1." },
    { q: "Welche OZ hat ein Atom im Elementarstoff, z. B. in Cl₂?", o: ["−I", "0", "+I", "+VII"], a: 1, e: "Gleiche Atome, keine Verschiebung." },
    { q: "Was passiert, wenn man Eisen in Kupfersulfatlösung taucht?", o: ["Nichts", "Eisen überzieht sich mit Kupfer", "Kupfer löst sich", "Es bildet sich Sauerstoff"], a: 1, e: "Fe ist unedler als Cu." },
    { q: "Warum muss man die Elektronenzahlen der Teilgleichungen ausgleichen?", o: ["Aus Gewohnheit", "Weil so viele Elektronen aufgenommen werden müssen, wie abgegeben werden", "Wegen der Masse", "Wegen der Temperatur"], a: 1, e: "Elektronen bleiben nicht übrig." },
    { q: "Womit gleicht man Ladungen in saurer Lösung aus?", o: ["Mit OH⁻", "Mit H⁺", "Mit Elektronen", "Mit Na⁺"], a: 1, e: "Danach Sauerstoff mit H₂O." }
  ] });

  LK.views(["verstehen", "oz", "gleichungen", "ueben", "alltag", "quiz"], {});
})();
