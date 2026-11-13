(function () {
  "use strict";
  const { $, $$, pick, shuffle } = LK;
  const fh = (f) => f.replace(/(\d+)/g, (d) => d.split("").map((c) => "₀₁₂₃₄₅₆₇₈₉"[c]).join("")).replace(/\^(\d?)([+-])/g, (_, n, s) => (n ? "⁰¹²³⁴⁵⁶⁷⁸⁹"[n] : "") + (s === "+" ? "⁺" : "⁻"));
  // acid/base pairs written with ^ for charges, e.g. NH4^+
  // [acid1, base2, base1, acid2, arrow]
  const RX = [["HCl", "H2O", "Cl^-", "H3O^+", "→"], ["NH3", "H2O", "", "", ""], ["CH3COOH", "H2O", "CH3COO^-", "H3O^+", "⇌"], ["H2O", "NH3", "OH^-", "NH4^+", "⇌"], ["HNO3", "H2O", "NO3^-", "H3O^+", "→"], ["H2SO4", "H2O", "HSO4^-", "H3O^+", "→"], ["HSO4^-", "H2O", "SO4^2-", "H3O^+", "⇌"], ["H2O", "CO3^2-", "OH^-", "HCO3^-", "⇌"], ["HCl", "NH3", "Cl^-", "NH4^+", "→"], ["H3O^+", "OH^-", "H2O", "H2O", "→"], ["NH4^+", "H2O", "NH3", "H3O^+", "⇌"], ["H2O", "CH3COO^-", "OH^-", "CH3COOH", "⇌"], ["HCO3^-", "H2O", "CO3^2-", "H3O^+", "⇌"], ["H2O", "HCO3^-", "OH^-", "H2CO3", "⇌"]].filter((r) => r[2]);
  let cur = RX[0];
  $("#pChips").innerHTML = RX.map((r, i) => `<button type="button" data-i="${i}" aria-pressed="false">${fh(r[0])} + ${fh(r[1])}</button>`).join("");
  function drawP() {
    $$("#pChips button").forEach((b) => b.setAttribute("aria-pressed", String(RX[+b.dataset.i] === cur)));
    const [s1, b2, b1, s2, ar] = cur, X = [60, 170, 350, 460];
    let g = `<text x="${X[0]}" y="70" class="s">${fh(s1)}</text><text x="115" y="70">+</text><text x="${X[1]}" y="70" class="b">${fh(b2)}</text><text x="260" y="70">${ar}</text><text x="${X[2]}" y="70" class="b">${fh(b1)}</text><text x="405" y="70">+</text><text x="${X[3]}" y="70" class="s">${fh(s2)}</text>`;
    g += `<text class="small" x="${X[0]}" y="95">Säure 1</text><text class="small" x="${X[1]}" y="95">Base 2</text><text class="small" x="${X[2]}" y="95">Base 1</text><text class="small" x="${X[3]}" y="95">Säure 2</text>`;
    g += `<path class="arr" d="M${X[0]} 40 Q${(X[0] + X[1]) / 2} 0 ${X[1]} 38"/><circle class="hp" cx="${(X[0] + X[1]) / 2}" cy="20" r="11"/><text x="${(X[0] + X[1]) / 2}" y="25" style="font-size:11px">H⁺</text>`;
    g += `<path class="pair1" d="M${X[0]} 105 V130 H${X[2]} V105"/><text class="small" x="${(X[0] + X[2]) / 2}" y="146" style="fill:#c62828">Paar 1: ${fh(s1)} / ${fh(b1)}</text>`;
    g += `<path class="pair2" d="M${X[1]} 105 V118 H${X[3]} V105"/><text class="small" x="${(X[1] + X[3]) / 2 + 40}" y="164" style="fill:#2b6fb8">Paar 2: ${fh(s2)} / ${fh(b2)}</text>`;
    $("#pSvg").innerHTML = g;
    const amph = [s1, b2].filter((x) => ["H2O", "HSO4^-", "HCO3^-"].includes(x));
    $("#pText").innerHTML = `${fh(s1)} gibt ein Proton an ${fh(b2)} ab. ${ar === "→" ? "Die Reaktion läuft praktisch vollständig ab (starke Säure)." : "Es stellt sich ein Gleichgewicht ein: Auch die Rückreaktion findet statt."}${amph.length ? ` ${amph.map(fh).join(" und ")} ${amph.length > 1 ? "sind" : "ist ein"} <b>Ampholyt${amph.length > 1 ? "e" : ""}</b>.` : ""}`;
  }
  $$("#pChips button").forEach((b) => b.addEventListener("click", () => { cur = RX[+b.dataset.i]; drawP(); }));
  drawP();

  // ---------- trainer ----------
  const norm = (t) => String(t).replace(/\s/g, "").replace(/[₀-₉]/g, (c) => "₀₁₂₃₄₅₆₇₈₉".indexOf(c)).replace(/⁺/g, "+").replace(/[⁻−]/g, "-").replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹]/g, (c) => "⁰¹²³⁴⁵⁶⁷⁸⁹".indexOf(c)).replace(/\^/g, "");
  const same = (a, b) => { const x = norm(a), y = norm(b); return x === y || x.replace(/(\d)([+-])$/, "$2$1") === y || x === y.replace(/(\d)([+-])$/, "$2$1"); };
  const PAIRS = [["HCl", "Cl^-"], ["H2SO4", "HSO4^-"], ["HSO4^-", "SO4^2-"], ["HNO3", "NO3^-"], ["CH3COOH", "CH3COO^-"], ["H3O^+", "H2O"], ["H2O", "OH^-"], ["NH4^+", "NH3"], ["H2CO3", "HCO3^-"], ["HCO3^-", "CO3^2-"], ["H3PO4", "H2PO4^-"], ["H2PO4^-", "HPO4^2-"], ["HPO4^2-", "PO4^3-"], ["HF", "F^-"], ["H2S", "HS^-"]];
  function genKB() { const [a, b] = pick(PAIRS); const toBase = Math.random() < 0.5;
    return { html: toBase ? `Wie heißt die <b>korrespondierende Base</b> von ${fh(a)}?` : `Wie heißt die <b>korrespondierende Säure</b> von ${fh(b)}?`, label: "Formel:", placeholder: "z. B. NH4+", answer: norm(toBase ? b : a), check: (raw) => (same(raw, toBase ? b : a) ? { ok: true } : { ok: false, msg: toBase ? "Ein H⁺ weniger, Ladung um 1 kleiner." : "Ein H⁺ mehr, Ladung um 1 größer." }), solution: `<b>${fh(toBase ? b : a)}</b> (Paar ${fh(a)} / ${fh(b)})` }; }
  function genRole() { const r = pick(RX); const ask = pick([["Säure", r[0]], ["Base", r[1]]]); const others = [r[0], r[1]];
    return { html: `<span style="font-family:var(--font-mono)">${fh(r[0])} + ${fh(r[1])} ${r[4]} ${fh(r[2])} + ${fh(r[3])}</span>. Welches Teilchen links ist die <b>${ask[0]}</b>?`, label: "Formel:", answer: norm(ask[1]), check: (raw) => (same(raw, ask[1]) ? { ok: true } : others.some((o) => same(raw, o)) ? { ok: false, msg: "Umgekehrt: Wer gibt das Proton ab?" } : { ok: false, msg: "Wähle eines der beiden Teilchen links." }), solution: `<b>${fh(ask[1])}</b> ${ask[0] === "Säure" ? "gibt das Proton ab" : "nimmt das Proton auf"}` }; }
  const PROD = [["HCl", "H2O", "H3O^+ + Cl^-"], ["HNO3", "H2O", "H3O^+ + NO3^-"], ["NH3", "H2O", "NH4^+ + OH^-"], ["CH3COOH", "H2O", "H3O^+ + CH3COO^-"], ["HF", "H2O", "H3O^+ + F^-"], ["CO3^2-", "H2O", "HCO3^- + OH^-"], ["HCl", "NH3", "NH4^+ + Cl^-"], ["H2SO4", "H2O", "H3O^+ + HSO4^-"]];
  function genProd() { const [a, b, p] = pick(PROD); const want = p.split(" + ");
    return { html: `Ergänze die Produkte der Protolyse: <span style="font-family:var(--font-mono)">${fh(a)} + ${fh(b)} → ?</span>`, label: "Produkte:", placeholder: "z. B. H3O+ + Cl-", answer: p.replace(/\^/g, ""), check: (raw) => { const got = String(raw).split(/\s\+\s|,|;|und/).map((x) => x.trim()).filter(Boolean); return got.length === 2 && want.every((w) => got.some((g) => same(g, w))) ? { ok: true } : { ok: false, msg: "Ein Proton wandert von der Säure zur Base. Trenne die Produkte mit <code> + </code>." }; }, solution: `<b>${fh(p)}</b>` }; }
  const AMPH = [["H2O", true], ["HCO3^-", true], ["HSO4^-", true], ["H2PO4^-", true], ["HPO4^2-", true], ["HS^-", true], ["Cl^-", false], ["NH4^+", false], ["CO3^2-", false], ["HCl", false], ["SO4^2-", false], ["OH^-", true]];
  function genAmph() { const [f, a] = pick(AMPH.filter((x) => x[0] !== "OH^-"));
    return { html: `Ist <b>${fh(f)}</b> ein Ampholyt (kann es Protonen abgeben <i>und</i> aufnehmen)?`, label: "ja oder nein:", answer: a ? "ja" : "nein", check: (raw) => { const t = raw.trim().toLowerCase(); if (!/^(ja|nein)$/.test(t)) return { ok: false, msg: "Antworte mit <code>ja</code> oder <code>nein</code>." }; return (t === "ja") === a ? { ok: true } : { ok: false, msg: "Hat es ein abgebbares H und ein freies Elektronenpaar bzw. eine negative Ladung?" }; }, solution: a ? `<b>ja</b>: ${fh(f)} kann H⁺ abgeben und aufnehmen.` : `<b>nein</b>` }; }
  LK.trainer({ el: "#trainer", modes: [
    { id: "kb", label: "Säure-Base-Paare", gen: genKB },
    { id: "rolle", label: "Säure oder Base?", gen: genRole },
    { id: "prod", label: "Produkte ergänzen", gen: genProd },
    { id: "amph", label: "Ampholyte", gen: genAmph }
  ] });

  LK.quiz({ box: "#quizBox", bar: "#qBar", progress: "#qProgress", key: "sb.best", n: 8, questions: [
    { q: "Was ist eine Säure nach Brønsted?", o: ["Ein Protonendonator", "Ein Protonenakzeptor", "Ein Elektronendonator", "Ein Stoff mit OH⁻"], a: 0, e: "Sie gibt H⁺ ab." },
    { q: "Korrespondierende Base von H₂SO₄?", o: ["SO₄²⁻", "HSO₄⁻", "H₃SO₄⁺", "H₂O"], a: 1, e: "Genau ein Proton weniger." },
    { q: "Welches Teilchen macht eine Lösung sauer?", o: ["OH⁻", "H₃O⁺", "Na⁺", "Cl⁻"], a: 1, e: "Oxonium-Ionen." },
    { q: "Was ist Wasser in der Reaktion NH₃ + H₂O ⇌ NH₄⁺ + OH⁻?", o: ["Säure", "Base", "Katalysator", "Lösemittel ohne Rolle"], a: 0, e: "Es gibt H⁺ an NH₃ ab." },
    { q: "Was ist ein Ampholyt?", o: ["Ein Teilchen, das H⁺ abgeben und aufnehmen kann", "Ein Salz", "Eine starke Säure", "Ein Indikator"], a: 0, e: "z. B. H₂O, HCO₃⁻." },
    { q: "Warum versagte das Arrhenius-Modell bei Ammoniak?", o: ["NH₃ enthält kein OH⁻, ist aber basisch", "NH₃ ist sauer", "NH₃ löst sich nicht", "NH₃ ist ein Metall"], a: 0, e: "Brønsted erklärt das." },
    { q: "Was entsteht bei der Neutralisation von H₃O⁺ mit OH⁻?", o: ["H₂", "2 H₂O", "O₂", "H₂O₂"], a: 1, e: "H₃O⁺ + OH⁻ → 2 H₂O." },
    { q: "Wie viele Säure-Base-Paare enthält jede Protolyse?", o: ["eins", "zwei", "drei", "keins"], a: 1, e: "Säure 1/Base 1 und Säure 2/Base 2." }
  ] });

  LK.views(["verstehen", "protolyse", "geschichte", "ueben", "alltag", "quiz"], {});
})();
