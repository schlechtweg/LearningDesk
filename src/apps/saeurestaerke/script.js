(function () {
  "use strict";
  const { $, pick, fmt, shuffle } = LK;
  // name, acid, base, pKs
  const T = [["Chlorwasserstoff", "HCl", "Cl⁻", -6], ["Schwefelsäure", "H₂SO₄", "HSO₄⁻", -3], ["Oxonium-Ion", "H₃O⁺", "H₂O", -1.74], ["Salpetersäure", "HNO₃", "NO₃⁻", -1.32], ["Hydrogensulfat", "HSO₄⁻", "SO₄²⁻", 1.92], ["Phosphorsäure", "H₃PO₄", "H₂PO₄⁻", 1.96], ["Flusssäure", "HF", "F⁻", 3.14], ["Methansäure", "HCOOH", "HCOO⁻", 3.75], ["Essigsäure", "CH₃COOH", "CH₃COO⁻", 4.75], ["Kohlensäure", "H₂CO₃", "HCO₃⁻", 6.35], ["Schwefelwasserstoff", "H₂S", "HS⁻", 6.92], ["Dihydrogenphosphat", "H₂PO₄⁻", "HPO₄²⁻", 7.2], ["Ammonium-Ion", "NH₄⁺", "NH₃", 9.25], ["Blausäure", "HCN", "CN⁻", 9.4], ["Hydrogencarbonat", "HCO₃⁻", "CO₃²⁻", 10.33], ["Hydrogenphosphat", "HPO₄²⁻", "PO₄³⁻", 12.36], ["Wasser", "H₂O", "OH⁻", 15.74]];
  $("#tTab").innerHTML = `<tr><th>Säure</th><th class="n">pK<sub>S</sub></th><th>korresp. Base</th><th class="n">pK<sub>B</sub></th><th>Stärke der Säure</th></tr>` + T.map(([n, a, b, p]) => `<tr><td>${a} <span class="muted">${n}</span></td><td class="n">${fmt(p, 2)}</td><td>${b}</td><td class="n">${fmt(14 - p, 2)}</td><td>${p < 0 ? "sehr stark" : p < 4 ? "mittelstark" : p < 10 ? "schwach" : "sehr schwach"}</td></tr>`).join("");

  // degree of protolysis, exact: x^2/(c-x) = Ks
  const alpha = (pKs, c) => { const K = 10 ** -pKs; if (pKs < 0) return 1; const x = (-K + Math.sqrt(K * K + 4 * K * c)) / 2; return x / c; };
  const weak = T.filter((t) => t[3] < 11 && t[1] !== "H₃O⁺");
  const opts = weak.map((t, i) => `<option value="${i}">${t[1]} (${t[0]})</option>`).join("");
  $("#vA").innerHTML = opts; $("#vB").innerHTML = opts; $("#vA").value = "0"; $("#vB").value = String(weak.findIndex((t) => t[1] === "CH₃COOH"));
  function beaker(svg, a) {
    const n = 50, k = Math.round(a * n); let g = `<path d="M10 10 V125 Q10 135 20 135 H180 Q190 135 190 125 V10" fill="none" stroke="currentColor" stroke-width="2"/>`;
    for (let i = 0; i < n; i++) { const x = 25 + (i % 10) * 16, y = 30 + Math.floor(i / 10) * 20; g += `<circle cx="${x}" cy="${y}" r="6" fill="${i < k ? "#c62828" : "#9aa4ad"}"/>`; }
    $(svg).innerHTML = g;
  }
  function drawV() {
    const c = 10 ** +$("#vC").value; $("#vCV").textContent = fmt(c, 4);
    [["#vA", "#vS1", "#vT1"], ["#vB", "#vS2", "#vT2"]].forEach(([sel, svg, txt]) => {
      const t = weak[+$(sel).value], a = alpha(t[3], c), h = a * c, pH = -Math.log10(h);
      beaker(svg, a);
      $(txt).innerHTML = `<b>${t[1]}</b>, pK<sub>S</sub> = ${fmt(t[3], 2)}<br>Protolysegrad <b>${fmt(a * 100, a < 0.01 ? 2 : 1)} %</b><br>c(H₃O⁺) = ${fmt(h, 6)} mol/L, <b>pH = ${fmt(pH, 2)}</b>` + (t[3] > 4 && a < 0.05 ? `<br><span class="muted">Näherung ½(pK<sub>S</sub> − lg c₀) = ${fmt(0.5 * (t[3] - Math.log10(c)), 2)}</span>` : "");
    });
  }
  ["#vA", "#vB", "#vC"].forEach((id) => $(id).addEventListener("input", drawV)); drawV();

  // ---------- trainer ----------
  const W = T.filter((t) => t[3] >= 3 && t[3] <= 10.5);
  function genPHs() { const t = pick(W), e = pick([-1, -2, -1.5, -0.5, 0]), c = 10 ** e; const pH = 0.5 * (t[3] - Math.log10(c));
    return { html: `Berechne näherungsweise den pH einer Lösung von <b>${t[1]}</b> (pK<sub>S</sub> = ${fmt(t[3], 2)}) mit c₀ = ${fmt(c, 4)} mol/L.`, label: "pH:", answer: fmt(pH, 2), check: LK.check.num(pH, { abs: 0.02 }), solution: `pH = ½ · (${fmt(t[3], 2)} − lg ${fmt(c, 4)}) = <b>${fmt(pH, 2)}</b>` }; }
  function genPHb() { const t = pick(W), e = pick([-1, -2, -0.5]), c = 10 ** e; const pKb = 14 - t[3], pOH = 0.5 * (pKb - Math.log10(c)), pH = 14 - pOH;
    return { html: `Berechne näherungsweise den pH einer Lösung der Base <b>${t[2]}</b> (pK<sub>S</sub> der korrespondierenden Säure ${t[1]} = ${fmt(t[3], 2)}) mit c₀ = ${fmt(c, 4)} mol/L.`, label: "pH:", answer: fmt(pH, 2), check: LK.check.num(pH, { abs: 0.02 }), solution: `pK<sub>B</sub> = 14 − ${fmt(t[3], 2)} = ${fmt(pKb, 2)}; pOH = ½ (${fmt(pKb, 2)} − lg ${fmt(c, 4)}) = ${fmt(pOH, 2)}; <b>pH = ${fmt(pH, 2)}</b>` }; }
  function genStr() { const [a, b] = shuffle(T.slice(0, 16)).slice(0, 2); const s = a[3] < b[3] ? a : b; const norm = (x) => x.replace(/\s/g, "").replace(/[₀-₉]/g, (c) => "₀₁₂₃₄₅₆₇₈₉".indexOf(c)).replace(/[⁺]/g, "+").replace(/[⁻]/g, "-").replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹]/g, (c) => "⁰¹²³⁴⁵⁶⁷⁸⁹".indexOf(c)).toLowerCase();
    return { html: `Welche Säure ist stärker: <b>${a[1]}</b> (pK<sub>S</sub> ${fmt(a[3], 2)}) oder <b>${b[1]}</b> (pK<sub>S</sub> ${fmt(b[3], 2)})?`, label: "Formel:", answer: s[1], check: (raw) => (norm(raw) === norm(s[1]) ? { ok: true } : { ok: false, msg: "Kleinerer pK<sub>S</sub> = stärkere Säure." }), solution: `<b>${s[1]}</b>: kleinerer pK<sub>S</sub>` }; }
  function genKs() { const t = pick(W); const K = 10 ** -t[3]; const toK = Math.random() < 0.5;
    return toK ? { html: `pK<sub>S</sub> von ${t[1]} = ${fmt(t[3], 2)}. Wie groß ist K<sub>S</sub>?`, label: "K<sub>S</sub> in mol/L:", placeholder: "z. B. 1.8e-5", answer: K.toExponential(2), check: (raw) => { const v = Number(String(raw).replace(",", ".").replace(/\s/g, "")); return isFinite(v) && Math.abs(v - K) / K < 0.03 ? { ok: true } : { ok: false, msg: "K<sub>S</sub> = 10<sup>−pK<sub>S</sub></sup>." }; }, solution: `K<sub>S</sub> = 10<sup>−${fmt(t[3], 2)}</sup> = <b>${K.toExponential(2).replace(".", ",")} mol/L</b>` }
      : { html: `Wie groß ist pK<sub>B</sub> der korrespondierenden Base ${t[2]} (pK<sub>S</sub>(${t[1]}) = ${fmt(t[3], 2)})?`, label: "pK<sub>B</sub>:", answer: fmt(14 - t[3], 2), check: LK.check.num(14 - t[3], { abs: 0.01 }), solution: `pK<sub>B</sub> = 14 − ${fmt(t[3], 2)} = <b>${fmt(14 - t[3], 2)}</b>` }; }
  const SALT = [["Natriumacetat", "basisch", "Acetat CH₃COO⁻ ist eine Base"], ["Ammoniumchlorid", "sauer", "NH₄⁺ ist eine Säure, Cl⁻ praktisch keine Base"], ["Natriumchlorid", "neutral", "weder Na⁺ noch Cl⁻ protolysieren merklich"], ["Natriumcarbonat", "basisch", "CO₃²⁻ ist eine Base"], ["Kaliumnitrat", "neutral", "K⁺ und NO₃⁻ protolysieren nicht"], ["Natriumhydrogensulfat", "sauer", "HSO₄⁻ ist eine Säure (pK<sub>S</sub> 1,92)"], ["Kaliumcyanid", "basisch", "CN⁻ ist eine Base"]];
  function genSalt() { const [n, a, w] = pick(SALT); return { html: `Reagiert eine Lösung von <b>${n}</b> sauer, neutral oder basisch?`, label: "Antwort:", answer: a, check: (raw) => { const t = raw.trim().toLowerCase(); const v = /sauer/.test(t) ? "sauer" : /neutral/.test(t) ? "neutral" : /basisch|alkal/.test(t) ? "basisch" : null; return v === a ? { ok: true } : { ok: false, msg: "Welches Ion des Salzes protolysiert?" }; }, solution: `<b>${a}</b>: ${w}` }; }
  LK.trainer({ el: "#trainer", modes: [
    { id: "phs", label: "pH schwacher Säuren", gen: genPHs },
    { id: "phb", label: "pH schwacher Basen", gen: genPHb },
    { id: "staerke", label: "Wer ist stärker?", gen: genStr },
    { id: "ks", label: "K_S, pK_S, pK_B", gen: genKs },
    { id: "salz", label: "Salzlösungen", gen: genSalt }
  ] });

  LK.quiz({ box: "#quizBox", bar: "#qBar", progress: "#qProgress", key: "staerke.best", n: 8, questions: [
    { q: "Je kleiner der pKs-Wert, desto …", o: ["schwächer die Säure", "stärker die Säure", "konzentrierter die Lösung", "größer der pH"], a: 1, e: "Kleiner pKs = großes Ks." },
    { q: "pH von 0,1 mol/L Essigsäure (pKs 4,75)?", o: ["1", "2,88", "4,75", "7"], a: 1, e: "½ (4,75 + 1)." },
    { q: "pKs + pKb eines korrespondierenden Paares ergibt …", o: ["7", "14", "0", "1"], a: 1, e: "Bei 25 °C." },
    { q: "Wie reagiert eine Natriumacetat-Lösung?", o: ["sauer", "neutral", "basisch", "gar nicht"], a: 2, e: "Acetat nimmt Protonen auf." },
    { q: "Was bedeutet „starke Säure“?", o: ["Sehr konzentriert", "Protolysiert praktisch vollständig", "Ist giftig", "Hat pH 0"], a: 1, e: "Stärke ≠ Konzentration." },
    { q: "Welche korrespondierende Base ist am schwächsten?", o: ["Cl⁻", "CH₃COO⁻", "NH₃", "CO₃²⁻"], a: 0, e: "HCl ist die stärkste Säure." },
    { q: "Läuft CH₃COOH + NH₃ → CH₃COO⁻ + NH₄⁺ weitgehend ab?", o: ["Ja, es entstehen schwächere Säure und Base", "Nein", "Nur beim Erhitzen", "Nur mit Katalysator"], a: 0, e: "pKs 4,75 < 9,25." },
    { q: "Wie ändert sich der Protolysegrad einer schwachen Säure beim Verdünnen?", o: ["Er sinkt", "Er steigt", "Er bleibt", "Er wird 0"], a: 1, e: "Ostwald'sches Verdünnungsgesetz." }
  ] });

  LK.views(["verstehen", "tabelle", "vergleich", "ueben", "alltag", "quiz"], {});
})();
