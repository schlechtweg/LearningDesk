(function () {
  "use strict";
  const { $, $$, pick, fmt } = LK;
  // indicators: name, from pH, to pH, acid colour, base colour
  const IND = [["Methylorange", 3.1, 4.4, "#d7301f", "#f4c20d"], ["Methylrot", 4.4, 6.2, "#d7301f", "#f4c20d"], ["Bromthymolblau", 6.0, 7.6, "#e8c21a", "#2563c9", "#3f9a45"], ["Phenolphthalein", 8.2, 10.0, "rgba(255,255,255,0)", "#d0368a"], ["Thymolphthalein", 9.3, 10.5, "rgba(255,255,255,0)", "#2c58c7"]];
  const mix = (a, b, t) => { const p = (c) => (c.startsWith("#") ? [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16)).concat(1) : [255, 255, 255, 0]); const A = p(a), B = p(b); const m = A.map((v, i) => v + (B[i] - v) * t); return `rgba(${m[0] | 0},${m[1] | 0},${m[2] | 0},${m[3].toFixed(2)})`; };
  const indCol = (ind, pH) => { const t = Math.min(1, Math.max(0, (pH - ind[1]) / (ind[2] - ind[1]))); if (ind[5]) return t < 0.5 ? mix(ind[3], ind[5], t * 2) : mix(ind[5], ind[4], t * 2 - 1); return mix(ind[3], ind[4], t); };
  $("#iTab").innerHTML = "<tr><th>Indikator</th><th>Umschlagbereich</th><th>Säureform</th><th>Baseform</th></tr>" + IND.map((i) => `<tr><td>${i[0]}</td><td>pH ${fmt(i[1], 1)} bis ${fmt(i[2], 1)}</td><td><span style="display:inline-block;width:14px;height:14px;border-radius:3px;background:${i[3].startsWith("rgba") ? "#fff" : i[3]};border:1px solid var(--line)"></span> ${i[3].startsWith("rgba") ? "farblos" : i[0] === "Bromthymolblau" ? "gelb" : "rot"}</td><td><span style="display:inline-block;width:14px;height:14px;border-radius:3px;background:${i[4]}"></span> ${i[0] === "Phenolphthalein" ? "pink" : /blau|Thymolph/.test(i[0]) ? "blau" : "gelb"}</td></tr>`).join("");
  function drawI() { const pH = +$("#iR").value; $("#iV").textContent = fmt(pH, 1); $("#iSw").innerHTML = IND.slice(0, 4).map((i) => `<div class="panel stack" style="align-items:center"><div style="width:60px;height:60px;border-radius:50%;border:2px solid var(--line);background:${indCol(i, pH)}"></div><span class="small">${i[0]}</span></div>`).join(""); }
  $("#iR").addEventListener("input", drawI); drawI();

  // ---------- titration model ----------
  const VA = 20, CB = 0.1, KW = 1e-14;
  function pHof(acid, ca, vb) {
    const nA = (ca * VA) / 1000, nB = (CB * vb) / 1000, V = (VA + vb) / 1000;
    if (acid === "hcl") { // exact charge balance: h - Kw/h = (nA - nB)/V
      const d = (nA - nB) / V, h = (d + Math.sqrt(d * d + 4 * KW)) / 2; return -Math.log10(h);
    }
    const Ka = 10 ** -4.75, cT = nA / V, cNa = nB / V;
    // solve h + cNa = Kw/h + cT*Ka/(Ka+h) by bisection on log h
    let lo = -14, hi = 0;
    for (let i = 0; i < 80; i++) { const m = (lo + hi) / 2, h = 10 ** m, f = h + cNa - KW / h - (cT * Ka) / (Ka + h); if (f > 0) hi = m; else lo = m; }
    return -(lo + hi) / 2;
  }
  const cOf = { hcl: 0.1, hac: 0.1, hcl2: 0.05, hac2: 0.05 };
  $("#tI").innerHTML = IND.map((i, k) => `<option value="${k}"${k === 3 ? " selected" : ""}>${i[0]} (${fmt(i[1], 1)}–${fmt(i[2], 1)})</option>`).join("");
  function drawT() {
    const key = $("#tA").value, acid = key.startsWith("hcl") ? "hcl" : "hac", ca = cOf[key], vb = +$("#tV").value, ind = IND[+$("#tI").value];
    $("#tVV").textContent = fmt(vb, 1);
    const vEP = (ca * VA) / CB, X = (v) => 40 + (v / 40) * 405, Y = (p) => 270 - (p / 14) * 255;
    let g = "";
    for (let p = 0; p <= 14; p += 2) g += `<line class="gl" x1="40" x2="445" y1="${Y(p)}" y2="${Y(p)}"/><text x="34" y="${Y(p) + 4}" text-anchor="end">${p}</text>`;
    for (let v = 0; v <= 40; v += 5) g += `<text x="${X(v)}" y="286" text-anchor="middle">${v}</text>`;
    g += `<rect class="band" x="40" width="405" y="${Y(ind[2])}" height="${Y(ind[1]) - Y(ind[2])}" fill="${ind[4]}"/>`;
    g += `<line class="ax" x1="40" y1="270" x2="448" y2="270"/><line class="ax" x1="40" y1="270" x2="40" y2="10"/><text x="445" y="262" text-anchor="end">V(NaOH) in mL</text><text x="44" y="12">pH</text>`;
    const pts = (to) => { const a = []; for (let v = 0; v <= to + 1e-9; v += 0.1) a.push(`${X(v).toFixed(1)} ${Y(pHof(acid, ca, v)).toFixed(1)}`); return "M" + a.join(" L"); };
    g += `<path class="ghost" d="${pts(40)}"/>`;
    if (vb > 0) g += `<path class="cv" d="${pts(vb)}"/>`;
    g += `<line class="ep" x1="${X(vEP)}" x2="${X(vEP)}" y1="270" y2="10"/><text x="${X(vEP) + 4}" y="24" style="fill:#c62828">ÄP ${fmt(vEP, 1)} mL</text>`;
    if (acid === "hac") g += `<circle cx="${X(vEP / 2)}" cy="${Y(4.75)}" r="4" fill="#c62828"/><text x="${X(vEP / 2) + 6}" y="${Y(4.75) - 6}" style="fill:#c62828">pH = pKs</text>`;
    $("#tSvg").innerHTML = g;
    const pH = pHof(acid, ca, vb);
    $("#tF").innerHTML = `<path d="M45 10 V45 L15 100 Q12 110 25 110 H95 Q108 110 105 100 L75 45 V10" fill="none" stroke="currentColor" stroke-width="2"/><path d="M32 70 L88 70 L103 100 Q105 108 95 108 H25 Q15 108 17 100 Z" fill="${indCol(ind, pH)}" stroke="none"/><path d="M32 70 L88 70 L103 100 Q105 108 95 108 H25 Q15 108 17 100 Z" fill="none" stroke="var(--line)"/>`;
    $("#tOut").textContent = `pH = ${fmt(pH, 2)}`;
    const pheq = pHof(acid, ca, vEP);
    $("#tText").innerHTML = `Äquivalenzpunkt bei ${fmt(vEP, 1)} mL, pH dort ${fmt(pheq, 2)}. ${acid === "hac" ? "Der ÄP liegt im Basischen, weil Acetat eine Base ist. Bei der Hälfte (Halbäquivalenzpunkt) gilt pH = pK<sub>S</sub> = 4,75." : "Starke Säure: ÄP bei pH 7, großer Sprung."} ${ind[1] <= pheq + 1 && ind[2] >= pheq - 1.5 ? `<b>${ind[0]}</b> ist hier geeignet.` : `<b>${ind[0]}</b> schlägt nicht am ÄP um und ist hier ungeeignet.`}`;
  }
  ["#tA", "#tI", "#tV"].forEach((id) => $(id).addEventListener("input", drawT));
  $("#tP").addEventListener("click", () => { $("#tV").value = Math.min(40, +$("#tV").value + 1); drawT(); });
  $("#tM").addEventListener("click", () => { $("#tV").value = Math.max(0, +$("#tV").value - 1); drawT(); });
  $("#tD").addEventListener("click", () => { $("#tV").value = Math.min(40, +$("#tV").value + 0.1); drawT(); });
  drawT();

  // ---------- conductivity ----------
  const LAM = { H: 350, OH: 198, Na: 50, Cl: 76, Ac: 41 };
  function kappa(acid, vb) {
    const nA = (0.1 * VA) / 1000, nB = (CB * vb) / 1000, V = (VA + vb) / 1000;
    if (acid === "hcl") { const h = Math.max(nA - nB, 0) / V, oh = Math.max(nB - nA, 0) / V; return h * LAM.H + oh * LAM.OH + (nB / V) * LAM.Na + (nA / V) * LAM.Cl; }
    const pH = pHof("hac", 0.1, vb), h = 10 ** -pH, ac = Math.min(nA, nB) / V + (vb === 0 ? h : 0), oh = Math.max(nB - nA, 0) / V;
    return h * LAM.H + ac * LAM.Ac + (nB / V) * LAM.Na + oh * LAM.OH;
  }
  function drawL() {
    const acid = $("#lA").value, X = (v) => 40 + (v / 40) * 405; const vals = []; for (let v = 0; v <= 40; v += 0.25) vals.push([v, kappa(acid, v)]);
    const max = Math.max(...vals.map((x) => x[1])), Y = (k) => 240 - (k / max) * 220;
    let g = `<line class="ax" x1="40" y1="240" x2="448" y2="240"/><line class="ax" x1="40" y1="240" x2="40" y2="10"/><text x="445" y="232" text-anchor="end">V(NaOH) in mL</text><text x="44" y="12">Leitfähigkeit</text>`;
    for (let v = 0; v <= 40; v += 5) g += `<text x="${X(v)}" y="252" text-anchor="middle">${v}</text>`;
    g += `<path class="cv" d="M${vals.map(([v, k]) => `${X(v).toFixed(1)} ${Y(k).toFixed(1)}`).join(" L")}"/><line class="ep" x1="${X(20)}" x2="${X(20)}" y1="240" y2="10"/><text x="${X(20) + 4}" y="24" style="fill:#c62828">ÄP 20 mL</text>`;
    $("#lSvg").innerHTML = g;
    $("#lText").innerHTML = acid === "hcl" ? "Bis zum ÄP werden gut leitende H₃O⁺ durch schlechter leitende Na⁺ ersetzt: Die Leitfähigkeit <b>sinkt</b>. Danach kommen gut leitende OH⁻ hinzu: Sie <b>steigt</b> steil. Schnittpunkt der beiden Geraden = ÄP." : "Essigsäure ist kaum protolysiert und leitet anfangs schlecht. Bei Zugabe entstehen Na⁺ und Acetat-Ionen: Die Leitfähigkeit <b>steigt langsam</b>. Nach dem ÄP steigt sie durch OH⁻ <b>steiler</b>. Der Knick zeigt den ÄP.";
  }
  $("#lA").addEventListener("change", drawL); drawL();

  // ---------- trainer ----------
  function genC() { const vA = pick([10, 20, 25, 50]), cB = pick([0.1, 0.1, 0.05, 0.2]), z = pick([1, 1, 2]), vB = pick([8.4, 12.5, 15.0, 17.6, 20.0, 22.3, 9.8]); const c = (cB * vB) / (z * vA);
    return { html: `${vA} mL ${z === 2 ? "Schwefelsäure" : "Salzsäure"} werden mit Natronlauge (c = ${fmt(cB, 2)} mol/L) titriert. Verbrauch bis zum ÄP: ${fmt(vB, 1)} mL. Konzentration der Säure?`, label: "c in mol/L:", answer: fmt(c, 4), check: LK.check.num(c, { abs: 0.0006 }), solution: `c = c(NaOH) · V(NaOH) / (${z === 2 ? "2 · " : ""}V(Säure)) = ${fmt(cB, 2)} · ${fmt(vB, 1)} / (${z === 2 ? "2 · " : ""}${vA}) = <b>${fmt(c, 4)} mol/L</b>` }; }
  function genV() { const cA = pick([0.1, 0.05, 0.08, 0.12]), vA = pick([10, 20, 25]), cB = pick([0.1, 0.2]); const v = (cA * vA) / cB;
    return { html: `Wie viel mL Natronlauge (c = ${fmt(cB, 1)} mol/L) braucht man, um ${vA} mL Salzsäure (c = ${fmt(cA, 2)} mol/L) zu neutralisieren?`, label: "V in mL:", answer: fmt(v, 2), check: LK.check.num(v, { abs: 0.02 }), solution: `V = ${fmt(cA, 2)} · ${vA} / ${fmt(cB, 1)} = <b>${fmt(v, 2)} mL</b>` }; }
  const SCEN = [["Salzsäure mit Natronlauge (ÄP pH 7)", "Bromthymolblau"], ["Essigsäure mit Natronlauge (ÄP pH 8,7)", "Phenolphthalein"], ["Ammoniak mit Salzsäure (ÄP pH 5,3)", "Methylrot"], ["Natronlauge mit Salzsäure (ÄP pH 7)", "Bromthymolblau"]];
  function genInd() { const [s, i] = pick(SCEN); return { html: `Welcher Indikator eignet sich am besten für die Titration von ${s}? (Methylorange 3,1–4,4; Methylrot 4,4–6,2; Bromthymolblau 6,0–7,6; Phenolphthalein 8,2–10)`, label: "Indikator:", answer: i, check: (raw) => (raw.trim().toLowerCase().slice(0, 6) === i.toLowerCase().slice(0, 6) ? { ok: true } : { ok: false, msg: "Der Umschlagbereich muss den pH am ÄP enthalten." }), solution: `<b>${i}</b>` }; }
  function genHalf() { const t = pick([["Essigsäure", 4.75], ["Methansäure", 3.75], ["Ammonium-Ion", 9.25], ["Propansäure", 4.87], ["Benzoesäure", 4.2]]);
    return { html: `Bei der Titration von ${t[0]} beträgt der pH am Halbäquivalenzpunkt ${fmt(t[1], 2)}. Welchen pK<sub>S</sub> hat die Säure?`, label: "pK<sub>S</sub>:", answer: fmt(t[1], 2), check: LK.check.num(t[1], { abs: 0.01 }), solution: `Am Halbäquivalenzpunkt gilt c(HA) = c(A⁻) ⇒ <b>pK<sub>S</sub> = pH = ${fmt(t[1], 2)}</b>` }; }
  function genMass() { const v = pick([8.3, 10.6, 12.4, 14.1, 16.7]), c = 0.1; const n = (c * v) / 1000, m = n * 60.05;
    return { html: `Eine Essigprobe verbraucht ${fmt(v, 1)} mL Natronlauge (c = 0,1 mol/L). Wie viel mg Essigsäure (M = 60,05 g/mol) enthält sie?`, label: "m in mg:", answer: fmt(m * 1000, 1), check: LK.check.num(m * 1000, { abs: 0.6 }), solution: `n = 0,1 · ${fmt(v, 1)} mL = ${fmt(n * 1000, 3)} mmol; m = n · M = <b>${fmt(m * 1000, 1)} mg</b>` }; }
  LK.trainer({ el: "#trainer", modes: [
    { id: "c", label: "Konzentration", gen: genC },
    { id: "v", label: "Volumen", gen: genV },
    { id: "ind", label: "Indikator wählen", gen: genInd },
    { id: "half", label: "Halbäquivalenzpunkt", gen: genHalf },
    { id: "masse", label: "Masse in der Probe", gen: genMass }
  ] });

  LK.quiz({ box: "#quizBox", bar: "#qBar", progress: "#qProgress", key: "titr.best", n: 8, questions: [
    { q: "Was gilt am Äquivalenzpunkt?", o: ["pH = 7 immer", "n(Säure) · z = n(Base)", "Die Bürette ist leer", "pH = pKs"], a: 1, e: "Stoffmengen äquivalent." },
    { q: "Wo liegt der ÄP bei Essigsäure mit Natronlauge?", o: ["im Sauren", "bei pH 7", "im Basischen", "bei pH 14"], a: 2, e: "Acetat ist eine Base." },
    { q: "Was gilt am Halbäquivalenzpunkt einer schwachen Säure?", o: ["pH = 7", "pH = pKs", "pH = 14 − pKs", "pH = 0"], a: 1, e: "c(HA) = c(A⁻)." },
    { q: "Welcher Indikator passt zur Titration Essigsäure/Natronlauge?", o: ["Methylorange", "Methylrot", "Phenolphthalein", "keiner"], a: 2, e: "Umschlag 8,2–10." },
    { q: "Warum sinkt die Leitfähigkeit bei der Titration von HCl mit NaOH zuerst?", o: ["H₃O⁺ wird durch schlechter leitende Na⁺ ersetzt", "Wasser leitet nicht", "Cl⁻ verschwindet", "Die Temperatur sinkt"], a: 0, e: "H₃O⁺ hat die höchste Ionenbeweglichkeit." },
    { q: "20 mL HCl brauchen 10 mL NaOH (0,1 mol/L). c(HCl)?", o: ["0,05 mol/L", "0,1 mol/L", "0,2 mol/L", "0,5 mol/L"], a: 0, e: "0,1 · 10 / 20." },
    { q: "Woran erkennt man den ÄP in einer pH-Titrationskurve?", o: ["Am Maximum", "Am Wendepunkt (steilste Stelle)", "Am Anfang", "Bei pH 0"], a: 1, e: "Größte Steigung." },
    { q: "Was ist ein Indikator chemisch?", o: ["Ein Salz", "Eine schwache Säure mit verschieden gefärbter Säure- und Baseform", "Ein Metall", "Ein Katalysator"], a: 1, e: "HInd ⇌ H⁺ + Ind⁻." }
  ] });

  LK.views(["verstehen", "indikatoren", "titrieren", "leitfaehigkeit", "ueben", "alltag", "quiz"], {});
})();
