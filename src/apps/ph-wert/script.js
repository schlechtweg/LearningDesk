(function () {
  "use strict";
  const { $, pick, fmt, rnd } = LK;
  const SUP = (n) => String(n).replace(/-/g, "⁻").replace(/\d/g, (c) => "⁰¹²³⁴⁵⁶⁷⁸⁹"[c]);
  const sci = (v) => { if (v === 0) return "0"; const e = Math.floor(Math.log10(v) + 1e-12); const m = v / 10 ** e; return Math.abs(m - 1) < 1e-9 ? `10${SUP(e)}` : `${fmt(m, 2)} · 10${SUP(e)}`; };
  // universal indicator colours for pH 0..14
  const COL = ["#c0262d", "#e2412c", "#ef6a2a", "#f39a2c", "#f6c72f", "#e8df31", "#b9d636", "#79c043", "#3fa54d", "#2c8f7a", "#2a6fb0", "#3150a8", "#47399c", "#5a2f8f", "#6a2780"];
  const EX = [[1, "Magensaft"], [2.5, "Zitronensaft"], [3, "Cola"], [5.5, "Haut"], [7, "Wasser"], [7.4, "Blut"], [8.3, "Meerwasser"], [10, "Seife"], [12, "Ammoniak-lösung"], [13.5, "Abfluss-reiniger"]];
  function drawS() {
    const pH = +$("#sR").value, X = (p) => 20 + p * 30;
    let g = COL.map((c, i) => `<rect x="${X(i) - 15}" y="20" width="30" height="26" fill="${c}"/><text x="${X(i)}" y="60">${i}</text>`).join("");
    g += EX.map(([p, n], i) => `<line x1="${X(p)}" y1="64" x2="${X(p)}" y2="${74 + (i % 3) * 16}" stroke="currentColor" stroke-width=".6"/><text class="ex" x="${X(p)}" y="${86 + (i % 3) * 16}"${i === EX.length - 1 ? ' style="text-anchor:end"' : ""}>${n.replace("-", "")}</text>`).join("");
    g += `<path class="mk" d="M${X(pH)} 18 l-7 -12 h14 Z"/>`;
    $("#sSvg").innerHTML = g;
    $("#sV").textContent = fmt(pH, 1);
    const h = 10 ** -pH, oh = 10 ** (pH - 14);
    const w = (c) => Math.max(1, ((Math.log10(c) + 14) / 14) * 100);
    $("#sBars").innerHTML = `<div><span>H₃O⁺</span><i style="width:${w(h)}%;background:#c62828"></i></div><div><span>OH⁻</span><i style="width:${w(oh)}%;background:#2b6fb8"></i></div>`;
    $("#sText").innerHTML = `c(H₃O⁺) = <b>${sci(h)}</b> mol/L, c(OH⁻) = <b>${sci(oh)}</b> mol/L, pOH = ${fmt(14 - pH, 1)}. Produkt: ${sci(h * oh)} = K<sub>W</sub>. ${pH < 7 ? "Die Lösung ist <b>sauer</b>." : pH > 7 ? "Die Lösung ist <b>basisch</b>." : "Die Lösung ist <b>neutral</b>."} (Balkenlänge logarithmisch)`;
  }
  $("#sR").addEventListener("input", drawS); drawS();

  // calculator
  const ST = [["Salzsäure HCl", "S", 1], ["Salpetersäure HNO₃", "S", 1], ["Schwefelsäure H₂SO₄ (vereinfacht vollständig)", "S", 2], ["Natronlauge NaOH", "B", 1], ["Kalilauge KOH", "B", 1], ["Bariumhydroxid Ba(OH)₂", "B", 2]];
  $("#cS").innerHTML = ST.map((s, i) => `<option value="${i}">${s[0]}</option>`).join("");
  function drawC() {
    const [n, t, z] = ST[+$("#cS").value], c0 = Math.max(0, +$("#cC").value || 0), v = Math.max(1, +$("#cV").value || 1), c = (c0 / v) * z;
    if (c <= 0) { $("#cOut").textContent = "–"; $("#cSteps").innerHTML = ""; return; }
    let pH, steps = [];
    if (v > 1) steps.push(`Verdünnung 1 : ${v}: c = ${sci(c0)} : ${v} = ${sci(c0 / v)} mol/L`);
    if (t === "S") { pH = -Math.log10(c); steps.push(`Vollständige Protolyse${z > 1 ? `, ${z} Protonen pro Molekül` : ""}: c(H₃O⁺) = ${sci(c)} mol/L`, `pH = −lg ${sci(c)} = <b>${fmt(pH, 2)}</b>`); }
    else { const pOH = -Math.log10(c); pH = 14 - pOH; steps.push(`c(OH⁻) = ${z > 1 ? `${z} · ` : ""}c = ${sci(c)} mol/L`, `pOH = −lg ${sci(c)} = ${fmt(pOH, 2)}`, `pH = 14 − ${fmt(pOH, 2)} = <b>${fmt(pH, 2)}</b>`); }
    if ((t === "S" && pH > 6) || (t === "B" && pH < 8)) steps.push("Achtung: So verdünnt bestimmt die Autoprotolyse des Wassers mit. Der pH-Wert nähert sich 7, überschreitet ihn aber nie.");
    $("#cOut").textContent = `pH = ${fmt(t === "S" ? Math.min(pH, 7) : Math.max(pH, 7), 2)}`;
    $("#cSteps").innerHTML = steps.map((s) => `<li>${s}</li>`).join("");
  }
  ["#cS", "#cC", "#cV"].forEach((id) => $(id).addEventListener("input", drawC)); drawC();

  // ---------- trainer ----------
  const parse = (raw) => { const t = String(raw).replace(/\s/g, "").replace(",", ".").replace(/·10\^?/, "e"); const v = Number(t); return isFinite(v) ? v : NaN; };
  const relCheck = (want) => (raw) => { const v = parse(raw); if (isNaN(v)) return { ok: false, msg: "Zahl eingeben, z. B. <code>1e-3</code>." }; return Math.abs(v - want) / want < 0.03 ? { ok: true } : { ok: false, msg: "c = 10^(−pH)." }; };
  function genPH() { const e = rnd(1, 13), m = pick([1, 1, 2, 3, 5]); const c = m * 10 ** -e; const pH = -Math.log10(c);
    return { html: `c(H₃O⁺) = <b>${sci(c)} mol/L</b>. Berechne den pH-Wert.`, label: "pH:", answer: fmt(pH, 2), check: LK.check.num(pH, { abs: 0.015 }), solution: `pH = −lg(${sci(c)}) = <b>${fmt(pH, 2)}</b>` }; }
  function genC() { const pH = pick([1, 2, 3, 4, 5, 9, 11, 12, 2.5, 3.7, 8.2]); const c = 10 ** -pH;
    return { html: `Eine Lösung hat pH = <b>${fmt(pH, 1)}</b>. Wie groß ist c(H₃O⁺)?`, label: "c in mol/L:", placeholder: "z. B. 1e-3", answer: c.toExponential(2), check: relCheck(c), solution: `c = 10<sup>−${fmt(pH, 1)}</sup> = <b>${sci(c)} mol/L</b>` }; }
  function genBase() { const e = rnd(1, 4), m = pick([1, 2, 5]), z = pick([1, 1, 2]); const c = m * 10 ** -e; const pOH = -Math.log10(c * z), pH = 14 - pOH;
    return { html: `Berechne den pH einer ${z === 2 ? "Bariumhydroxid-Lösung Ba(OH)₂" : "Natronlauge"} mit c = <b>${sci(c)} mol/L</b>.`, label: "pH:", answer: fmt(pH, 2), check: LK.check.num(pH, { abs: 0.015 }), solution: `c(OH⁻) = ${z === 2 ? "2 · " : ""}${sci(c)} = ${sci(c * z)}; pOH = ${fmt(pOH, 2)}; pH = 14 − ${fmt(pOH, 2)} = <b>${fmt(pH, 2)}</b>` }; }
  function genDil() { const pH0 = pick([1, 2, 3]), f = pick([10, 100, 1000]); const pH = pH0 + Math.log10(f);
    return { html: `Eine Salzsäure mit pH ${pH0} wird 1 : ${f} verdünnt. Neuer pH?`, label: "pH:", answer: fmt(pH, 0), check: LK.check.num(pH, { abs: 0.05 }), solution: `c(H₃O⁺) : ${f} ⇒ pH + ${Math.log10(f)} = <b>${fmt(pH, 0)}</b>` }; }
  function genPOH() { const pH = pick([2, 3.5, 5, 8, 9.3, 11, 12.7]); return { html: `pH = ${fmt(pH, 1)}. Wie groß sind pOH und c(OH⁻)?`, label: "pOH:", answer: fmt(14 - pH, 1), check: LK.check.num(14 - pH, { abs: 0.02 }), solution: `pOH = 14 − ${fmt(pH, 1)} = <b>${fmt(14 - pH, 1)}</b>; c(OH⁻) = ${sci(10 ** -(14 - pH))} mol/L` }; }
  LK.trainer({ el: "#trainer", modes: [
    { id: "ph", label: "pH aus c", gen: genPH },
    { id: "c", label: "c aus pH", gen: genC },
    { id: "base", label: "Starke Basen", gen: genBase },
    { id: "poh", label: "pOH", gen: genPOH },
    { id: "dil", label: "Verdünnen", gen: genDil }
  ] });

  LK.quiz({ box: "#quizBox", bar: "#qBar", progress: "#qProgress", key: "ph.best", n: 8, questions: [
    { q: "Wie lautet das Ionenprodukt des Wassers bei 25 °C?", o: ["10⁻⁷ mol²/L²", "10⁻¹⁴ mol²/L²", "14", "1"], a: 1, e: "c(H₃O⁺) · c(OH⁻)." },
    { q: "pH von 0,001 mol/L Salzsäure?", o: ["1", "2", "3", "11"], a: 2, e: "−lg 10⁻³ = 3." },
    { q: "pH von 0,01 mol/L Natronlauge?", o: ["2", "12", "10", "7"], a: 1, e: "pOH 2, pH 12." },
    { q: "Wie viel saurer ist pH 3 als pH 5?", o: ["2-mal", "20-mal", "100-mal", "1000-mal"], a: 2, e: "Zwei Stufen: 10²." },
    { q: "Was gilt immer in wässrigen Lösungen (25 °C)?", o: ["pH + pOH = 14", "pH = pOH", "pH · pOH = 14", "pH − pOH = 7"], a: 0, e: "Aus K_W." },
    { q: "Wie ändert sich der pH einer starken Säure bei Verdünnung 1 : 10?", o: ["−1", "+1", "+10", "bleibt"], a: 1, e: "c(H₃O⁺) wird zehnmal kleiner." },
    { q: "Welchen pH hat Blut?", o: ["5,5", "7,0", "7,4", "8,3"], a: 2, e: "Schwach basisch." },
    { q: "Kann eine Säure durch Verdünnen basisch werden?", o: ["Ja, bei starker Verdünnung", "Nein, der pH nähert sich höchstens 7", "Nur bei Schwefelsäure", "Ja, über pH 8"], a: 1, e: "Die Autoprotolyse liefert immer 10⁻⁷ mol/L." }
  ] });

  LK.views(["verstehen", "skala", "rechner", "ueben", "alltag", "quiz"], {});
})();
