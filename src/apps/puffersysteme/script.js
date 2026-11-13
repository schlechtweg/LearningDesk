(function () {
  "use strict";
  const { $, $$, pick, fmt } = LK;
  const pos = (pH) => `calc(${Math.min(14, Math.max(0, pH)) / 14 * 100}% - 2px)`;
  // ---------- buffer vs water ----------
  let added = 0; // mmol strong acid (+) or base (-)
  function phWater(a) { const V = 0.1 + Math.abs(a) * 0.001; if (a === 0) return 7; const c = (Math.abs(a) / 1000) / V; const h = a > 0 ? (c + Math.sqrt(c * c + 4e-14)) / 2 : 1e-14 / ((c + Math.sqrt(c * c + 4e-14)) / 2); return -Math.log10(h); }
  function phBuf(n, a) {
    let ha = n + a, aa = n - a; const V = 0.1 + Math.abs(a) * 0.001;
    // one partner used up: only the weak acid (or base) remains, plus any excess strong acid (or base)
    if (aa <= 0) { const cw = (ha + aa) / 1000 / V, ex = -aa / 1000 / V; const hWeak = Math.sqrt(10 ** -4.75 * cw); return -Math.log10(ex + hWeak); }
    if (ha <= 0) { const cb = (aa + ha) / 1000 / V, ex = -ha / 1000 / V; const ohWeak = Math.sqrt(10 ** -9.25 * cb); return 14 + Math.log10(ex + ohWeak); }
    return 4.75 + Math.log10(aa / ha);
  }
  function drawV() {
    const n = +$("#vB").value; $("#vBV").textContent = n;
    const w = phWater(added), p = phBuf(n, added);
    $("#vW").textContent = `pH ${fmt(w, 2)}`; $("#vP").textContent = `pH ${fmt(p, 2)}`;
    $("#vWi").style.left = pos(w); $("#vPi").style.left = pos(p);
    const ml = Math.abs(added), what = added > 0 ? "Salzsäure" : "Natronlauge";
    $("#vText").innerHTML = added === 0 ? "Startzustand: Wasser pH 7, Puffer pH = pK<sub>S</sub> = 4,75 (gleiche Mengen)." :
      `Nach ${ml} mL ${what}: Das Wasser ändert seinen pH um <b>${fmt(Math.abs(w - 7), 2)}</b>, der Puffer nur um <b>${fmt(Math.abs(p - 4.75), 2)}</b>. ` + (Math.abs(added) >= n ? "<b>Die Pufferkapazität ist erschöpft</b>: Ein Partner ist aufgebraucht, der pH springt." : added > 0 ? "Acetat fängt die H₃O⁺-Ionen ab: CH₃COO⁻ + H₃O⁺ → CH₃COOH + H₂O." : "Essigsäure neutralisiert die OH⁻-Ionen: CH₃COOH + OH⁻ → CH₃COO⁻ + H₂O.");
  }
  $$("[data-a]").forEach((b) => b.addEventListener("click", () => { const a = +b.dataset.a; added = a === 0 ? 0 : added + a; drawV(); }));
  $("#vB").addEventListener("input", () => { added = 0; drawV(); });
  drawV();

  // ---------- blood ----------
  function drawB() {
    const co2 = +$("#bC").value, hco3 = +$("#bH").value, pH = 6.1 + Math.log10(hco3 / co2);
    $("#bCV").textContent = fmt(co2, 1); $("#bHV").textContent = hco3;
    $("#bOut").textContent = `Blut-pH ${fmt(pH, 2)}`; $("#bI").style.left = pos(pH);
    $("#bText").innerHTML = `Verhältnis HCO₃⁻ : CO₂ = ${fmt(hco3 / co2, 1)} : 1. ` + (pH < 7.35 ? `<b>Azidose</b>${co2 > 1.4 ? " (respiratorisch: zu viel CO₂, z. B. bei Atemnot)" : " (metabolisch: zu wenig Hydrogencarbonat)"}.` : pH > 7.45 ? `<b>Alkalose</b>${co2 < 1.0 ? " (respiratorisch: Hyperventilation)" : " (metabolisch)"}.` : "Normalbereich 7,35 bis 7,45.");
  }
  ["#bC", "#bH"].forEach((id) => $(id).addEventListener("input", drawB)); drawB();

  // ---------- trainer ----------
  const BUF = [["Essigsäure/Acetat", 4.75], ["Ammonium/Ammoniak", 9.25], ["Dihydrogenphosphat/Hydrogenphosphat", 7.2], ["Kohlensäure/Hydrogencarbonat", 6.35], ["Methansäure/Formiat", 3.75]];
  function genHH() { const [n, pk] = pick(BUF), a = pick([0.05, 0.1, 0.2, 0.5]), b = pick([0.05, 0.1, 0.2, 0.5]); const pH = pk + Math.log10(b / a);
    return { html: `${n}-Puffer (pK<sub>S</sub> ${fmt(pk, 2)}): c(Säure) = ${fmt(a, 2)} mol/L, c(Base) = ${fmt(b, 2)} mol/L. pH?`, label: "pH:", answer: fmt(pH, 2), check: LK.check.num(pH, { abs: 0.02 }), solution: `pH = ${fmt(pk, 2)} + lg(${fmt(b, 2)} / ${fmt(a, 2)}) = <b>${fmt(pH, 2)}</b>` }; }
  function genRatio() { const [n, pk] = pick(BUF), t = +(pk + pick([-1, -0.5, 0, 0.3, 0.5, 1])).toFixed(2); const r = 10 ** (t - pk);
    return { html: `Welches Verhältnis c(Base) : c(Säure) braucht ein ${n}-Puffer (pK<sub>S</sub> ${fmt(pk, 2)}) für pH ${fmt(t, 2)}?`, label: "Verhältnis:", answer: fmt(r, 2), check: LK.check.num(r, { tol: 0.03 }), solution: `lg(Base/Säure) = ${fmt(t - pk, 2)} ⇒ <b>${fmt(r, 2)} : 1</b>` }; }
  function genAdd() { const nb = pick([10, 20, 50]), x = pick([1, 2, 5]); const pH = 4.75 + Math.log10((nb - x) / (nb + x));
    return { html: `Ein Acetat-Puffer enthält je ${nb} mmol Essigsäure und Acetat. Es werden ${x} mmol HCl zugegeben. Neuer pH?`, label: "pH:", answer: fmt(pH, 2), check: LK.check.num(pH, { abs: 0.02 }), solution: `Acetat ${nb} − ${x} = ${nb - x}, Säure ${nb} + ${x} = ${nb + x} ⇒ pH = 4,75 + lg(${nb - x}/${nb + x}) = <b>${fmt(pH, 2)}</b>` }; }
  function genBlood() { const co2 = pick([0.9, 1.0, 1.2, 1.5, 1.8]), h = pick([18, 20, 24, 26, 30]); const pH = 6.1 + Math.log10(h / co2);
    return { html: `Blut: c(HCO₃⁻) = ${h} mmol/L, c(CO₂) = ${fmt(co2, 1)} mmol/L (pK<sub>S</sub> 6,1). pH?`, label: "pH:", answer: fmt(pH, 2), check: LK.check.num(pH, { abs: 0.02 }), solution: `pH = 6,1 + lg(${h}/${fmt(co2, 1)}) = <b>${fmt(pH, 2)}</b> ${pH < 7.35 ? "(Azidose)" : pH > 7.45 ? "(Alkalose)" : "(normal)"}` }; }
  LK.trainer({ el: "#trainer", modes: [
    { id: "hh", label: "Henderson-Hasselbalch", gen: genHH },
    { id: "ratio", label: "Puffer ansetzen", gen: genRatio },
    { id: "add", label: "Säure zugeben", gen: genAdd },
    { id: "blut", label: "Blut-pH", gen: genBlood }
  ] });

  LK.quiz({ box: "#quizBox", bar: "#qBar", progress: "#qProgress", key: "puffer.best", n: 8, questions: [
    { q: "Woraus besteht ein Puffer?", o: ["Starke Säure und Wasser", "Schwache Säure und ihre korrespondierende Base", "Nur einer schwachen Säure", "Salz und Wasser"], a: 1, e: "Beide Partner nötig." },
    { q: "pH eines Acetatpuffers mit gleichen Mengen Säure und Base?", o: ["7", "4,75", "9,25", "1"], a: 1, e: "pH = pKs." },
    { q: "Was fängt im Acetatpuffer zugegebene Salzsäure ab?", o: ["CH₃COOH", "CH₃COO⁻", "Na⁺", "H₂O"], a: 1, e: "Acetat nimmt H₃O⁺ auf." },
    { q: "In welchem Bereich puffert ein Puffer gut?", o: ["pKs ± 1", "pKs ± 5", "nur bei pH 7", "beliebig"], a: 0, e: "Pufferbereich." },
    { q: "Welcher Puffer ist im Blut am wichtigsten?", o: ["Acetat", "Kohlensäure/Hydrogencarbonat", "Ammonium", "Citrat"], a: 1, e: "Mit Lunge und Niere geregelt." },
    { q: "Was passiert bei Hyperventilation?", o: ["Azidose", "Alkalose", "Nichts", "Fieber"], a: 1, e: "CO₂ wird abgeatmet, pH steigt." },
    { q: "Wovon hängt die Pufferkapazität ab?", o: ["Von der Pufferkonzentration", "Nur vom pKs", "Von der Farbe", "Von der Temperatur allein"], a: 0, e: "Mehr Puffer, mehr Kapazität." },
    { q: "Henderson-Hasselbalch: pH = pKs + lg(…)?", o: ["c(HA)/c(A⁻)", "c(A⁻)/c(HA)", "c(H₃O⁺)", "c(OH⁻)"], a: 1, e: "Base im Zähler." }
  ] });

  LK.views(["verstehen", "versuch", "blut", "ueben", "alltag", "quiz"], {});
})();
