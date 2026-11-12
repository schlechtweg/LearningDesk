(function () {
  "use strict";
  const { $, $$, pick, fmt, gcd, shuffle } = LK;
  const C = window.CHEM;
  // "Al2O3" -> Al<sub>2</sub>O<sub>3</sub>
  const fh = (f) => f.replace(/([A-Za-z)])(\d+)/g, "$1<sub>$2</sub>");
  const reduce = (m) => (typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches);

  // ---------- metals: electron gas ----------
  const mCores = []; for (let r = 0; r < 4; r++) for (let c = 0; c < 6; c++) mCores.push({ r, c });
  const mE = Array.from({ length: 30 }, () => ({ x: 30 + Math.random() * 360, y: 30 + Math.random() * 200, vx: (Math.random() - 0.5) * 1.4, vy: (Math.random() - 0.5) * 1.4 }));
  let volt = false, shift = 0, mRaf = null;
  function drawMetal() {
    let g = `<rect class="bg" x="10" y="10" width="400" height="230" rx="10"/>`;
    mCores.forEach(({ r, c }) => { const x = 42 + c * 58 + (r === 0 ? shift : 0), y = 45 + r * 58; g += `<circle class="core" cx="${x}" cy="${y}" r="20"/><text class="lbl" x="${x}" y="${y}">+</text>`; });
    mE.forEach((e) => { g += `<circle class="eg" cx="${e.x.toFixed(1)}" cy="${e.y.toFixed(1)}" r="4"/>`; });
    if (volt) g += `<text class="cap" x="20" y="255">− Pol</text><text class="cap" x="360" y="255">+ Pol →</text>`;
    $("#mSvg").innerHTML = g;
  }
  function stepMetal() {
    mE.forEach((e) => {
      e.x += e.vx + (volt ? 1.6 : 0); e.y += e.vy;
      if (e.y < 18 || e.y > 232) e.vy *= -1;
      if (e.x > 402) e.x = volt ? 18 : 402, e.vx = volt ? e.vx : -Math.abs(e.vx);
      if (e.x < 18) e.vx = Math.abs(e.vx);
    });
    drawMetal();
    // stop the animation while the tab is hidden
    mRaf = $("#view-metalle").hidden ? null : requestAnimationFrame(stepMetal);
  }
  $("#mVolt").addEventListener("click", () => { volt = !volt; if (reduce()) { for (let i = 0; i < 40; i++) mE.forEach((e) => { e.x += volt ? 1.6 : 0; if (e.x > 402) e.x = 18; }); drawMetal(); } $("#mVolt").setAttribute("aria-pressed", String(volt)); $("#mVolt").textContent = volt ? "Spannung abschalten" : "Spannung anlegen"; $("#mText").innerHTML = volt ? "Die Elektronen driften zum Pluspol: <strong>elektrischer Strom</strong>. Die Atomrümpfe bleiben an ihren Plätzen." : "Die gelben Punkte sind die frei beweglichen Valenzelektronen."; });
  $("#mHit").addEventListener("click", () => { shift = shift ? 0 : 58; $("#mText").innerHTML = shift ? "Die oberste Schicht ist um eine Position verschoben. Das Elektronengas hält sie weiter fest: Das Metall <strong>verformt sich</strong>, statt zu brechen." : "Zurück in der Ausgangslage."; drawMetal(); });
  drawMetal();

  // ---------- ionic lattice and dissolving ----------
  // lattice 5 x 4; ion type by parity; positions in px
  const lat = []; for (let r = 0; r < 4; r++) for (let c = 0; c < 5; c++) lat.push({ r, c, cat: (r + c) % 2 === 0, x: 120 + c * 44, y: 70 + r * 44 });
  const freed = [lat[4], lat[15]]; // corner ions that get dissolved
  const goal = [[395, 60], [60, 225]];
  let step = 0, hit = false;
  function water(x, y, toward, ox, oy) {
    // toward: true = O points to (ox, oy), false = H atoms point to it
    const a = Math.atan2(oy - y, ox - x), d = toward ? a : a + Math.PI;
    const hx = (k) => x - Math.cos(d + k) * 9, hy = (k) => y - Math.sin(d + k) * 9;
    return `<circle class="hw" cx="${hx(0.9).toFixed(1)}" cy="${hy(0.9).toFixed(1)}" r="4"/><circle class="hw" cx="${hx(-0.9).toFixed(1)}" cy="${hy(-0.9).toFixed(1)}" r="4"/><circle class="ow" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="7"/>`;
  }
  function drawIon() {
    let g = `<rect class="bg" x="6" y="6" width="428" height="258" rx="10"/>`;
    const sh = hit ? 44 : 0;
    lat.forEach((p, k) => {
      let x = p.x + (hit && p.r === 0 ? sh : 0), y = p.y;
      const fi = freed.indexOf(p);
      if (fi >= 0 && step >= 3) { x = goal[fi][0]; y = goal[fi][1]; }
      else if (fi >= 0 && step === 2) { x += (goal[fi][0] - x) * 0.35; y += (goal[fi][1] - y) * 0.35; }
      g += `<circle class="${p.cat ? "cat" : "an"}" cx="${x}" cy="${y}" r="${p.cat ? 13 : 18}"/><text class="lbl" x="${x}" y="${y}">${p.cat ? "Na⁺" : "Cl⁻"}</text>`;
      if (fi >= 0 && step >= 2) { for (let w = 0; w < 6; w++) { const a = (w / 6) * 2 * Math.PI, rr = p.cat ? 30 : 36; g += water(x + rr * Math.cos(a), y + rr * Math.sin(a), p.cat, x, y); } }
      void k;
    });
    if (step === 1) lat.filter((p) => p.r === 0 || p.c === 4 || p.c === 0 || p.r === 3).forEach((p, i) => { if (i % 2) return; const dx = p.c === 0 ? -1 : p.c === 4 ? 1 : 0, dy = p.r === 0 ? -1 : p.r === 3 ? 1 : 0; const wx = p.x + dx * 36, wy = p.y + dy * 36; g += water(wx, wy, p.cat, p.x, p.y); });
    if (step === 0) for (let i = 0; i < 9; i++) { const x = 30 + ((i * 97) % 380), y = 22 + ((i * 53) % 230); if (x > 100 && x < 340 && y > 40 && y < 220) continue; g += water(x, y, true, x + 10, y + 3); }
    if (hit) { lat.filter((p) => p.r === 0).forEach((p) => { const x = p.x + 44; if (x > 300) return; g += `<path class="rep" d="M${x - 4} ${p.y + 18} L${x - 4} ${p.y + 26} M${x + 4} ${p.y + 18} L${x + 4} ${p.y + 26}"/>`; }); g += `<text class="cap" x="24" y="250">gleiche Ladungen nebeneinander: Abstoßung, der Kristall bricht</text>`; }
    $("#iSvg").innerHTML = g;
    $$("#iSteps li").forEach((li, i) => li.classList.toggle("on", i === step));
    $("#iNext").disabled = step >= 3;
  }
  $("#iNext").addEventListener("click", () => { hit = false; step = Math.min(3, step + 1); drawIon(); $("#iText").textContent = ""; });
  $("#iReset").addEventListener("click", () => { hit = false; step = 0; drawIon(); $("#iText").textContent = ""; });
  $("#iHit").addEventListener("click", () => { step = 0; hit = !hit; drawIon(); $("#iText").innerHTML = hit ? "Die oberste Ionenschicht wurde um einen Platz verschoben: Jetzt liegen Na⁺ über Na⁺ und Cl⁻ über Cl⁻. Die Abstoßung spaltet den Kristall: <strong>Ionensubstanzen sind spröde</strong>." : ""; });
  drawIon();

  // formula builder
  const CAT = [["Natrium", "Na", 1], ["Kalium", "K", 1], ["Lithium", "Li", 1], ["Ammonium", "NH4", 1], ["Magnesium", "Mg", 2], ["Calcium", "Ca", 2], ["Barium", "Ba", 2], ["Zink", "Zn", 2], ["Eisen(II)", "Fe", 2], ["Kupfer(II)", "Cu", 2], ["Aluminium", "Al", 3], ["Eisen(III)", "Fe", 3]];
  const AN = [["Fluorid", "F", -1], ["Chlorid", "Cl", -1], ["Bromid", "Br", -1], ["Iodid", "I", -1], ["Hydroxid", "OH", -1], ["Nitrat", "NO3", -1], ["Oxid", "O", -2], ["Sulfid", "S", -2], ["Sulfat", "SO4", -2], ["Carbonat", "CO3", -2], ["Nitrid", "N", -3], ["Phosphat", "PO4", -3]];
  const poly = (f) => /[A-Z].*[A-Z]|\d/.test(f);
  const part = (f, n) => (n === 1 ? f : poly(f) ? `(${f})${n}` : f + n);
  const ionStr = (f, q) => fh(f) + C.charge(q);
  // rough solubility rules for the ions used here (oxides, sulfides and nitrides react or are insoluble)
  function soluble(c, a) {
    const cs = c[1], an = a[1];
    if (["Cl", "Br", "I", "NO3"].includes(an)) return true;
    if (an === "SO4") return !["Ba", "Ca"].includes(cs);
    if (an === "OH") return ["Na", "K", "Li", "Ba"].includes(cs);
    if (["CO3", "PO4", "F"].includes(an)) return ["Na", "K", "NH4"].includes(cs);
    return false;
  }
  function salt(c, a) {
    const g = gcd(c[2], -a[2]), nc = -a[2] / g, na = c[2] / g;
    const name = c[0] + (c[0].endsWith(")") ? "-" : "") + (c[0].endsWith(")") ? a[0].toLowerCase() : a[0].toLowerCase());
    return { f: part(c[1], nc) + part(a[1], na), nc, na, name };
  }
  $("#fCat").innerHTML = CAT.map((c, i) => `<option value="${i}">${c[0]} ${c[1].replace(/\d/g, (d) => "₀₁₂₃₄₅₆₇₈₉"[d])}${C.charge(c[2])}</option>`).join("");
  $("#fAn").innerHTML = AN.map((a, i) => `<option value="${i}">${a[0]} ${a[1].replace(/\d/g, (d) => "₀₁₂₃₄₅₆₇₈₉"[d])}${C.charge(a[2])}</option>`).join("");
  $("#fCat").value = "10"; $("#fAn").value = "6";
  function drawSalt() {
    const c = CAT[+$("#fCat").value], a = AN[+$("#fAn").value], s = salt(c, a);
    $("#fOut").innerHTML = fh(s.f);
    $("#fText").innerHTML = `${s.name}: ${s.nc} · (+${c[2]}) + ${s.na} · (−${-a[2]}) = 0. Die Ladungen gleichen sich aus. ` + (soluble(c, a) ? `Lösen in Wasser: ${fh(s.f)}(s) → ${s.nc > 1 ? s.nc + " " : ""}${ionStr(c[1], c[2])}(aq) + ${s.na > 1 ? s.na + " " : ""}${ionStr(a[1], a[2])}(aq)` : "Dieser Stoff ist in Wasser schwer löslich oder reagiert mit Wasser, statt sich einfach zu lösen.");
  }
  ["#fCat", "#fAn"].forEach((id) => $(id).addEventListener("change", drawSalt));
  drawSalt();

  // ---------- molecules: EN difference ----------
  const enEls = C.els.filter((e) => e.en !== null);
  const enOpts = enEls.map((e) => `<option value="${e.sym}">${e.sym} – ${e.name} (EN ${fmt(e.en, 2)})</option>`).join("");
  $("#eA").innerHTML = enOpts; $("#eB").innerHTML = enOpts; $("#eA").value = "H"; $("#eB").value = "Cl";
  const bondType = (d) => (d < 0.4 ? "unpolar" : d <= 1.7 ? "polar" : "ionisch");
  function drawEN() {
    const a = C.bySym[$("#eA").value], b = C.bySym[$("#eB").value], d = Math.abs(a.en - b.en), t = bondType(d);
    $("#enMark").style.left = `calc(${Math.min(d, 3.3) / 3.3 * 100}% - 2px)`;
    const neg = a.en > b.en ? a : b, pos = neg === a ? b : a;
    const both = (x) => x.cls === "m";
    let txt = `ΔEN = |${fmt(a.en, 2)} − ${fmt(b.en, 2)}| = <b>${fmt(d, 2)}</b>: `;
    txt += t === "unpolar" ? "<b>unpolare Elektronenpaarbindung</b>, die Elektronen werden gleichmäßig geteilt." :
      t === "polar" ? `<b>polare Elektronenpaarbindung</b>. ${neg.sym} zieht das Elektronenpaar stärker an und trägt eine negative Teilladung δ⁻, ${pos.sym} ist δ⁺.` :
        `<b>Ionenbindung</b>: ${neg.sym} nimmt die Elektronen ganz auf und wird zum Anion, ${pos.sym} zum Kation.`;
    if (both(a) && both(b)) txt += " Achtung: Zwei Metalle bilden eine <b>Metallbindung</b>, die ΔEN-Regel gilt hier nicht.";
    else if (t === "ionisch" && !(both(a) || both(b))) txt += " (Grenzfall: Die Regel ist eine Faustregel.)";
    $("#enText").innerHTML = txt;
  }
  ["#eA", "#eB"].forEach((id) => $(id).addEventListener("change", drawEN));
  drawEN();

  // molecule cards: geometry and dipole
  const MOL = [
    { n: "Wasser H₂O", g: "gewinkelt (104,5°)", dip: true, svg: `<line x1="70" y1="40" x2="35" y2="80"/><line x1="70" y1="40" x2="105" y2="80"/><text x="70" y="45">O</text><text x="30" y="95">H</text><text x="110" y="95">H</text><text class="d" x="70" y="22">δ⁻</text><text class="d dp" x="30" y="115">δ⁺</text><text class="d dp" x="110" y="115">δ⁺</text>` },
    { n: "Kohlenstoffdioxid CO₂", g: "linear", dip: false, svg: `<line x1="40" y1="62" x2="62" y2="62"/><line x1="40" y1="68" x2="62" y2="68"/><line x1="78" y1="62" x2="100" y2="62"/><line x1="78" y1="68" x2="100" y2="68"/><text x="30" y="70">O</text><text x="70" y="70">C</text><text x="110" y="70">O</text><text class="d" x="30" y="45">δ⁻</text><text class="d dp" x="70" y="45">δ⁺</text><text class="d" x="110" y="45">δ⁻</text>` },
    { n: "Ammoniak NH₃", g: "pyramidal", dip: true, svg: `<line x1="70" y1="45" x2="30" y2="85"/><line x1="70" y1="45" x2="110" y2="85"/><line x1="70" y1="45" x2="70" y2="95"/><text x="70" y="45">N</text><text x="25" y="100">H</text><text x="115" y="100">H</text><text x="70" y="112">H</text><text class="d" x="70" y="22">δ⁻</text>` },
    { n: "Methan CH₄", g: "tetraedrisch", dip: false, svg: `<line x1="70" y1="65" x2="70" y2="28"/><line x1="70" y1="65" x2="32" y2="92"/><line x1="70" y1="65" x2="108" y2="92"/><line x1="70" y1="65" x2="85" y2="105"/><text x="70" y="70">C</text><text x="70" y="22">H</text><text x="26" y="104">H</text><text x="114" y="104">H</text><text x="90" y="120">H</text>` },
    { n: "Chlorwasserstoff HCl", g: "linear, zwei verschiedene Atome", dip: true, svg: `<line x1="48" y1="65" x2="88" y2="65"/><text x="38" y="70">H</text><text x="102" y="70">Cl</text><text class="d dp" x="38" y="45">δ⁺</text><text class="d" x="102" y="45">δ⁻</text>` }
  ];
  $("#molCards").innerHTML = MOL.map((m) => `<div class="panel stack"><svg viewBox="0 0 140 125" aria-hidden="true">${m.svg}</svg><strong>${m.n}</strong><span class="small">${m.g}: ${m.dip ? "<b>Dipolmolekül</b>, die Ladungsschwerpunkte fallen nicht zusammen." : "<b>kein Dipol</b>, die Teilladungen heben sich durch den symmetrischen Bau auf."}</span></div>`).join("");

  // ---------- intermolecular forces ----------
  // k: l = London only, d = additional dipole-dipole, h = hydrogen bonds; M = molar mass in g/mol; bp in °C
  const SUB = {
    H2: ["Wasserstoff", -253, "l", 2], N2: ["Stickstoff", -196, "l", 28], O2: ["Sauerstoff", -183, "l", 32], F2: ["Fluor", -188, "l", 38], Cl2: ["Chlor", -34, "l", 71], Br2: ["Brom", 59, "l", 160], I2: ["Iod", 184, "l", 254],
    CH4: ["Methan", -162, "l", 16], C2H6: ["Ethan", -89, "l", 30], C3H8: ["Propan", -42, "l", 44], C4H10: ["Butan", -1, "l", 58], C5H12: ["Pentan", 36, "l", 72], C6H14: ["Hexan", 69, "l", 86], C8H18: ["Octan", 126, "l", 114],
    HF: ["Fluorwasserstoff", 20, "h", 20], HCl: ["Chlorwasserstoff", -85, "d", 36.5], HBr: ["Bromwasserstoff", -67, "d", 81], HI: ["Iodwasserstoff", -35, "d", 128],
    H2O: ["Wasser", 100, "h", 18], H2S: ["Schwefelwasserstoff", -60, "d", 34], H2Se: ["Selenwasserstoff", -41, "d", 81], H2Te: ["Tellurwasserstoff", -2, "d", 130],
    SiH4: ["Silan", -112, "l", 32], GeH4: ["German", -88, "l", 77], SnH4: ["Stannan", -52, "l", 123], NH3: ["Ammoniak", -33, "h", 17],
    C2H5OH: ["Ethanol", 78, "h", 46], CH3OCH3: ["Dimethylether", -24, "d", 46], CH3OH: ["Methanol", 65, "h", 32], C3H6O: ["Aceton", 56, "d", 58]
  };
  const SER = {
    alk: [["CH4", "C2H6", "C3H8", "C4H10", "C5H12", "C6H14", "C8H18"], "Je länger die Kette, desto mehr Elektronen und desto größer die Oberfläche: Die London-Kräfte und damit die Siedetemperaturen steigen."],
    hal: [["F2", "Cl2", "Br2", "I2"], "Nur London-Kräfte. Mit der Größe der Moleküle steigen sie stark: F₂ und Cl₂ sind Gase, Br₂ flüssig, I₂ fest."],
    hx: [["HF", "HCl", "HBr", "HI"], "Von HCl zu HI steigt die Siedetemperatur durch zunehmende London-Kräfte. HF fällt aus der Reihe: Wasserstoffbrücken."],
    h6: [["CH4", "SiH4", "GeH4", "SnH4", "H2O", "H2S", "H2Se", "H2Te"], "IV. Hauptgruppe: regelmäßiger Anstieg (nur London). VI. Hauptgruppe: Wasser müsste nach dem Trend bei etwa −80 °C sieden, siedet aber dank Wasserstoffbrücken bei 100 °C."],
    iso: [["C2H5OH", "CH3OCH3", "C3H8"], "Alle drei haben fast die gleiche Masse (44 bis 46 g/mol). Ethanol bildet Wasserstoffbrücken (O–H), Dimethylether hat nur Dipol-Dipol-Kräfte, Propan nur London-Kräfte."]
  };
  let ser = "alk";
  function drawBars() {
    const [list, txt] = SER[ser], lo = -270, hi = 200, H = 200, top = 20, y0 = (v) => top + (hi - v) / (hi - lo) * H;
    const w = 410 / list.length;
    let g = `<line class="zero" x1="40" x2="450" y1="${y0(0)}" y2="${y0(0)}"/><text x="4" y="${y0(0) + 4}">0 °C</text>`;
    list.forEach((f, i) => { const [, bp, k] = SUB[f], x = 42 + i * w, ya = y0(Math.max(bp, 0)), yb = y0(Math.min(bp, 0));
      g += `<rect class="${k}" x="${(x + w * 0.18).toFixed(1)}" y="${ya.toFixed(1)}" width="${(w * 0.64).toFixed(1)}" height="${Math.max(2, yb - ya).toFixed(1)}" rx="3"/><text x="${(x + w / 2).toFixed(1)}" y="${(bp >= 0 ? ya - 5 : yb + 13).toFixed(1)}" text-anchor="middle">${String(bp).replace("-", "−")}</text><text class="lbl" x="${(x + w / 2).toFixed(1)}" y="250" text-anchor="middle">${fh(f).replace(/<sub>(\d+)<\/sub>/g, (_, d) => d.split("").map((c) => "₀₁₂₃₄₅₆₇₈₉"[c]).join(""))}</text>`; });
    $("#wSvg").innerHTML = g;
    $("#wText").innerHTML = txt + " Werte: Siedetemperatur in °C.";
  }
  $$("[data-s]").forEach((b) => b.addEventListener("click", () => { ser = b.dataset.s; $$("[data-s]").forEach((x) => x.setAttribute("aria-pressed", String(x === b))); drawBars(); }));
  drawBars();

  // ---------- structure-property detective ----------
  const DET = [
    { f: "NaCl", n: "Natriumchlorid (Kochsalz)", k: "i", mp: "801 °C", sol: "gut löslich in Wasser" },
    { f: "MgO", n: "Magnesiumoxid", k: "i", mp: "2852 °C", sol: "kaum löslich (sehr starke Gitterenergie)" },
    { f: "CaCl2", n: "Calciumchlorid", k: "i", mp: "772 °C", sol: "sehr gut löslich" },
    { f: "Cu", n: "Kupfer", k: "m", mp: "1085 °C", sol: "unlöslich" },
    { f: "Fe", n: "Eisen", k: "m", mp: "1538 °C", sol: "unlöslich" },
    { f: "Na", n: "Natrium", k: "m", mp: "98 °C", sol: "reagiert heftig mit Wasser" },
    { f: "Hg", n: "Quecksilber", k: "m", mp: "−39 °C (bei Raumtemperatur flüssig)", sol: "unlöslich" },
    { f: "H2O", n: "Wasser", k: "mol", mp: "0 °C", sol: "–", ww: "Wasserstoffbrücken" },
    { f: "I2", n: "Iod", k: "mol", mp: "114 °C", sol: "kaum in Wasser, gut in Benzin (unpolar)", ww: "London-Kräfte" },
    { f: "CH4", n: "Methan", k: "mol", mp: "−182 °C", sol: "kaum löslich in Wasser", ww: "London-Kräfte" },
    { f: "C2H5OH", n: "Ethanol", k: "mol", mp: "−114 °C", sol: "mischbar mit Wasser (Wasserstoffbrücken)", ww: "Wasserstoffbrücken" },
    { f: "C12H22O11", n: "Saccharose (Zucker)", k: "mol", mp: "≈ 186 °C (zersetzt sich)", sol: "gut löslich (viele O–H-Gruppen)", ww: "Wasserstoffbrücken" }
  ];
  const KN = { m: "Metall", i: "Ionensubstanz", mol: "Molekülsubstanz" };
  const PROPS = {
    m: (d) => [["Teilchen", "Atomrümpfe und Elektronengas"], ["Schmelztemperatur", d.mp], ["Leitfähigkeit", "fest und flüssig, freie Elektronen"], ["Verformbarkeit", "verformbar, Schichten gleiten im Elektronengas"], ["Wasser", d.sol]],
    i: (d) => [["Teilchen", "Kationen und Anionen im Ionengitter"], ["Schmelztemperatur", d.mp + ": starke Anziehung in alle Richtungen"], ["Leitfähigkeit", "fest nicht, als Schmelze und Lösung ja (bewegliche Ionen)"], ["Verformbarkeit", "spröde, gleich geladene Ionen stoßen sich ab"], ["Wasser", d.sol]],
    mol: (d) => [["Teilchen", "Moleküle"], ["Schmelztemperatur", d.mp + ": nur zwischenmolekulare Kräfte (" + d.ww + ") müssen überwunden werden"], ["Leitfähigkeit", "keine (keine freien Ladungsträger)"], ["Verformbarkeit", "Feststoff weich oder spröde, oft flüssig oder gasförmig"], ["Wasser", d.sol]]
  };
  let det = DET[0], guessed = false;
  $("#dChips").innerHTML = DET.map((d, i) => `<button type="button" data-i="${i}" aria-pressed="false">${fh(d.f)}</button>`).join("");
  function drawDet() {
    $$("#dChips button").forEach((b) => b.setAttribute("aria-pressed", String(DET[+b.dataset.i] === det)));
    $("#dName").innerHTML = `${det.n}, ${fh(det.f)}`;
    $$("#dOpts button").forEach((b) => b.classList.remove("right", "wrong"));
    $("#dOut").innerHTML = guessed ? "" : "Zu welcher Stoffklasse gehört der Stoff?";
  }
  function reveal(k) {
    $$("#dOpts button").forEach((b) => b.classList.toggle("right", b.dataset.k === det.k));
    if (k !== det.k) $(`#dOpts [data-k="${k}"]`).classList.add("wrong");
    $("#dOut").innerHTML = `<p>${k === det.k ? "Richtig" : "Nicht ganz"}: <b>${KN[det.k]}</b>.</p><table class="ptab">${PROPS[det.k](det).map(([a, b]) => `<tr><td>${a}</td><td>${b}</td></tr>`).join("")}</table>`;
  }
  $$("#dChips button").forEach((b) => b.addEventListener("click", () => { det = DET[+b.dataset.i]; drawDet(); }));
  $$("#dOpts button").forEach((b) => b.addEventListener("click", () => reveal(b.dataset.k)));
  drawDet();

  // ---------- trainer ----------
  const norm = (s) => String(s).replace(/\s/g, "").replace(/[₀-₉]/g, (c) => "₀₁₂₃₄₅₆₇₈₉".indexOf(c));
  const KL = [["Cu", "m"], ["Fe", "m"], ["Al", "m"], ["Mg", "m"], ["Zn", "m"], ["Ag", "m"], ["NaCl", "i"], ["KBr", "i"], ["MgO", "i"], ["CaCl2", "i"], ["Al2O3", "i"], ["Na2S", "i"], ["LiF", "i"], ["K2O", "i"], ["H2O", "mol"], ["CO2", "mol"], ["CH4", "mol"], ["NH3", "mol"], ["Cl2", "mol"], ["O2", "mol"], ["HCl", "mol"], ["C2H5OH", "mol"], ["I2", "mol"], ["SO2", "mol"]];
  function genKlasse() { const [f, k] = pick(KL);
    return { html: `Zu welcher Stoffklasse gehört <b>${fh(f)}</b>?`, label: "Stoffklasse:", placeholder: "Metall, Ionen- oder Molekülsubstanz", answer: KN[k],
      check: (raw) => { const t = raw.trim().toLowerCase(); const v = /metall/.test(t) ? "m" : /ion|salz/.test(t) ? "i" : /mol/.test(t) ? "mol" : null; if (!v) return { ok: false, msg: "Antworte mit <code>Metall</code>, <code>Ionensubstanz</code> oder <code>Molekülsubstanz</code>." }; return v === k ? { ok: true } : { ok: false, msg: "Schau, ob Metalle, Nichtmetalle oder beide beteiligt sind." }; },
      solution: `<b>${KN[k]}</b>: ${k === "m" ? "nur Metallatome" : k === "i" ? "Metall und Nichtmetall" : "nur Nichtmetalle"}` }; }
  function genFormel() { const c = pick(CAT), a = pick(AN), s = salt(c, a);
    return { html: `Verhältnisformel von <b>${s.name}</b> (${ionStr(c[1], c[2])} und ${ionStr(a[1], a[2])})?`, label: "Formel:", placeholder: "z. B. Al2O3", answer: s.f,
      check: (raw) => (norm(raw) === s.f ? { ok: true } : { ok: false, msg: "Die Summe der Ladungen muss null ergeben. Mehratomige Ionen in Klammern setzen." }),
      solution: `${s.nc} · (+${c[2]}) + ${s.na} · (−${-a[2]}) = 0: <b>${fh(s.f)}</b>` }; }
  function genLoesen() { let c, a; do { c = pick(CAT); a = pick(AN); } while (!soluble(c, a)); const s = salt(c, a), n = s.nc + s.na;
    return { html: `Wie viele Ionen entstehen aus einer Formeleinheit <b>${fh(s.f)}</b> beim Lösen in Wasser?`, label: "Anzahl Ionen:", answer: String(n), check: LK.check.num(n, { abs: 0 }),
      solution: `${fh(s.f)}(s) → ${s.nc > 1 ? s.nc + " " : ""}${ionStr(c[1], c[2])}(aq) + ${s.na > 1 ? s.na + " " : ""}${ionStr(a[1], a[2])}(aq): <b>${n} Ionen</b>` }; }
  function genBindung() {
    for (;;) { const a = pick(enEls), b = pick(enEls); const d = Math.abs(a.en - b.en); if ((a.cls === "m" || b.cls === "m") && !((a.cls === "m" && b.cls === "n" || a.cls === "n" && b.cls === "m") && d > 1.8)) continue; if (Math.abs(d - 0.4) < 0.08 || Math.abs(d - 1.7) < 0.1) continue; const t = bondType(d);
      return { html: `Welche Bindung liegt zwischen <b>${a.sym}</b> (EN ${fmt(a.en, 2)}) und <b>${b.sym}</b> (EN ${fmt(b.en, 2)}) vor?`, label: "Bindung:", placeholder: "unpolar, polar oder ionisch", answer: t,
        check: (raw) => { const r = raw.trim().toLowerCase(); const v = /unpol/.test(r) ? "unpolar" : /pol/.test(r) ? "polar" : /ion/.test(r) ? "ionisch" : null; if (!v) return { ok: false, msg: "Antworte mit <code>unpolar</code>, <code>polar</code> oder <code>ionisch</code>." }; return v === t ? { ok: true } : { ok: false, msg: "Berechne ΔEN: unter 0,4, bis 1,7, darüber." }; },
        solution: `ΔEN = ${fmt(d, 2)}: <b>${t === "unpolar" ? "unpolare Elektronenpaarbindung" : t === "polar" ? "polare Elektronenpaarbindung" : "Ionenbindung"}</b>` }; } }
  const WWN = { l: "nur London-Kräfte", d: "Dipol-Dipol-Kräfte", h: "Wasserstoffbrücken" };
  function genWW() { const f = pick(Object.keys(SUB)), [n, , k] = SUB[f];
    return { html: `Welche zwischenmolekularen Kräfte wirken in <b>${n}</b> (${fh(f)}) zusätzlich zu den London-Kräften?`, label: "Antwort:", placeholder: "keine, Dipol oder Wasserstoffbrücken", answer: k === "l" ? "keine" : k === "d" ? "Dipol-Dipol" : "Wasserstoffbrücken",
      check: (raw) => { const r = raw.trim().toLowerCase(); const v = /keine|nur|london/.test(r) ? "l" : /brück|brueck|h-br|wasserstoff/.test(r) ? "h" : /dipol/.test(r) ? "d" : null; if (!v) return { ok: false, msg: "Antworte mit <code>keine</code>, <code>Dipol</code> oder <code>Wasserstoffbrücken</code>." }; return v === k ? { ok: true } : { ok: false, msg: "Ist das Molekül ein Dipol? Hat es H an N, O oder F?" }; },
      solution: `<b>${WWN[k]}</b>${k === "h" ? " (H an N, O oder F)" : k === "d" ? " (Dipolmolekül)" : " (unpolares Molekül)"}` }; }
  const PAIRS = [["H2O", "H2S"], ["C2H5OH", "CH3OCH3"], ["HF", "HCl"], ["Cl2", "Br2"], ["CH4", "C4H10"], ["HCl", "F2"], ["NH3", "CH4"], ["C5H12", "C8H18"], ["Br2", "I2"], ["CH3OH", "C2H6"], ["H2Te", "H2Se"], ["SnH4", "SiH4"]];
  function genSiede() { const pr = shuffle(pick(PAIRS).slice()), [a, b] = pr, hi = SUB[a][1] > SUB[b][1] ? a : b, lo = hi === a ? b : a;
    const why = SUB[hi][2] === "h" && SUB[lo][2] !== "h" ? "Wasserstoffbrücken" : SUB[hi][2] === "d" && SUB[lo][2] === "l" ? "Dipol-Dipol-Kräfte" : "größere London-Kräfte (mehr Elektronen, größere Oberfläche)";
    return { html: `Welcher Stoff hat die höhere Siedetemperatur: <b>${fh(a)}</b> oder <b>${fh(b)}</b>?`, label: "Formel:", placeholder: "z. B. H2O", answer: hi,
      check: (raw) => (norm(raw) === hi ? { ok: true } : norm(raw) === lo ? { ok: false, msg: "Vergleiche die Art und Stärke der zwischenmolekularen Kräfte." } : { ok: false, msg: `Gib <code>${hi}</code> oder <code>${lo}</code> ein.` }),
      solution: `<b>${fh(hi)}</b> (${SUB[hi][1]} °C gegenüber ${SUB[lo][1]} °C): ${why}` }; }
  LK.trainer({ el: "#trainer", modes: [
    { id: "klasse", label: "Stoffklasse", gen: genKlasse },
    { id: "formel", label: "Verhältnisformel", gen: genFormel },
    { id: "loesen", label: "Lösen in Wasser", gen: genLoesen },
    { id: "bindung", label: "Bindungsart (ΔEN)", gen: genBindung },
    { id: "ww", label: "Wechselwirkungen", gen: genWW },
    { id: "siede", label: "Siedetemperaturen", gen: genSiede }
  ] });

  LK.quiz({ box: "#quizBox", bar: "#qBar", progress: "#qProgress", key: "stoffkl.best", n: 10, questions: [
    { q: "Warum leiten Metalle den elektrischen Strom?", o: ["Sie enthalten Ionen, die wandern", "Sie enthalten frei bewegliche Elektronen", "Sie sind hart", "Ihre Atomrümpfe sind negativ"], a: 1, e: "Elektronengasmodell." },
    { q: "Warum ist Kochsalz spröde?", o: ["Es ist ein Metall", "Beim Verschieben liegen gleich geladene Ionen nebeneinander und stoßen sich ab", "Es enthält Wasser", "Die Moleküle sind klein"], a: 1, e: "Abstoßung spaltet den Kristall." },
    { q: "Wann leitet Natriumchlorid den Strom?", o: ["Nie", "Nur als Feststoff", "Als Schmelze und in Lösung", "Immer"], a: 2, e: "Dann sind die Ionen beweglich." },
    { q: "Verhältnisformel von Aluminiumoxid?", o: ["AlO", "Al₃O₂", "Al₂O₃", "AlO₃"], a: 2, e: "2 · (+3) + 3 · (−2) = 0." },
    { q: "Was ist eine Hydrathülle?", o: ["Eine Eisschicht", "Wassermoleküle, die ein gelöstes Ion umgeben", "Eine Elektronenschale", "Ein Ionengitter"], a: 1, e: "Die Dipole richten sich zum Ion aus." },
    { q: "ΔEN zwischen H (2,20) und Cl (3,16) beträgt 0,96. Bindungsart?", o: ["unpolar", "polar", "Ionenbindung", "Metallbindung"], a: 1, e: "0,4 bis 1,7." },
    { q: "Warum ist CO₂ kein Dipolmolekül, obwohl die C=O-Bindungen polar sind?", o: ["Es ist linear gebaut, die Teilladungen heben sich auf", "Es enthält keine Elektronen", "C und O haben die gleiche EN", "Es ist ein Salz"], a: 0, e: "Symmetrischer Bau." },
    { q: "Welche Kräfte wirken zwischen allen Molekülen?", o: ["Wasserstoffbrücken", "Ionenbindungen", "London-Kräfte", "Metallbindungen"], a: 2, e: "Durch kurzzeitige Dipole." },
    { q: "Warum siedet Wasser viel höher als Schwefelwasserstoff?", o: ["Wasser ist schwerer", "Wasserstoffbrücken zwischen H₂O-Molekülen", "H₂S ist ein Salz", "Wasser ist unpolar"], a: 1, e: "O–H ist stark polar, freie Elektronenpaare am O." },
    { q: "Was löst sich gut in Benzin?", o: ["Kochsalz", "Zucker", "Iod", "Calciumchlorid"], a: 2, e: "Unpolar löst sich in unpolar." },
    { q: "Ethanol und Dimethylether haben die gleiche Masse. Wer siedet höher?", o: ["Dimethylether", "Ethanol", "Beide gleich", "Keiner siedet"], a: 1, e: "Ethanol bildet Wasserstoffbrücken (78 °C gegen −24 °C)." }
  ] });

  LK.views(["ueberblick", "metalle", "ionen", "molekuele", "ww", "struktur", "ueben", "alltag", "quiz"], {
    metalle: () => { if (!mRaf && !reduce()) mRaf = requestAnimationFrame(stepMetal); }
  });
})();
