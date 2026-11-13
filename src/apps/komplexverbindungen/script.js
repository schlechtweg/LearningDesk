(function () {
  "use strict";
  const { $, $$, pick } = LK;
  const SUB = (s) => String(s).replace(/\d/g, (d) => "₀₁₂₃₄₅₆₇₈₉"[d]);
  const ROM = ["0", "I", "II", "III", "IV", "V", "VI"];
  const chg = (q) => (q === 0 ? "" : ((Math.abs(q) === 1 ? "" : Math.abs(q)) + (q > 0 ? "+" : "-")).replace(/[\d+-]/g, (c) => ({ "+": "⁺", "-": "⁻" }[c] || "⁰¹²³⁴⁵⁶⁷⁸⁹"[c])));
  // central ions: symbol, charge, German name, -at name
  const MET = [["Cu", 2, "kupfer", "cuprat"], ["Cu", 1, "kupfer", "cuprat"], ["Fe", 2, "eisen", "ferrat"], ["Fe", 3, "eisen", "ferrat"], ["Ag", 1, "silber", "argentat"], ["Zn", 2, "zink", "zinkat"], ["Co", 2, "cobalt", "cobaltat"], ["Co", 3, "cobalt", "cobaltat"], ["Ni", 2, "nickel", "nickelat"], ["Al", 3, "aluminium", "aluminat"], ["Cr", 3, "chrom", "chromat"]];
  // ligands: formula, charge, name
  const LIG = [["H2O", 0, "aqua"], ["NH3", 0, "ammin"], ["Cl", -1, "chlorido"], ["CN", -1, "cyanido"], ["OH", -1, "hydroxido"], ["F", -1, "fluorido"], ["SCN", -1, "thiocyanato"], ["S2O3", -2, "thiosulfato"]];
  const NUM = { 1: "", 2: "di", 3: "tri", 4: "tetra", 5: "penta", 6: "hexa" };
  // known complexes with colour
  const KNOWN = { "Cu2|H2O|4": ["hellblau", "#7fb8e6"], "Cu2|H2O|6": ["hellblau", "#7fb8e6"], "Cu2|NH3|4": ["tiefblau (Nachweis für Cu²⁺)", "#2a3fbf"], "Cu2|Cl|4": ["gelbgrün", "#b9c94a"], "Ag1|NH3|2": ["farblos (löst AgCl)", "#f4f4f4"], "Ag1|S2O3|2": ["farblos (Fixierbad)", "#f4f4f4"], "Fe2|CN|6": ["gelb (gelbes Blutlaugensalz)", "#f0d24a"], "Fe3|CN|6": ["rot (rotes Blutlaugensalz)", "#d1462f"], "Fe3|SCN|6": ["blutrot (Nachweis für Fe³⁺)", "#9e1b1b"], "Fe3|H2O|6": ["blassviolett bzw. gelblich", "#e6d48a"], "Zn2|OH|4": ["farblos", "#f4f4f4"], "Al3|OH|4": ["farblos", "#f4f4f4"], "Co2|H2O|6": ["rosa", "#e7a3c4"], "Co2|Cl|4": ["blau (Feuchtigkeitsanzeiger)", "#2c4fd1"], "Ni2|NH3|6": ["blauviolett", "#7b6ad6"], "Ni2|H2O|6": ["grün", "#5aa864"], "Cr3|H2O|6": ["violett", "#8a4fb0"] };
  const lf = (f, n) => (n === 1 ? SUB(f) : f.length > 2 || /\d/.test(f) ? `(${SUB(f)})${SUB(n)}` : SUB(f) + SUB(n));
  function build(m, l, n) {
    const q = m[1] + n * l[1];
    const name = (NUM[n] + l[2] + (q < 0 ? m[3] : m[2])) + `(${ROM[m[1]]})`;
    return { q, formula: `[${m[0]}${lf(l[0], n)}]${chg(q)}`, name: name.charAt(0).toUpperCase() + name.slice(1) + (q === 0 ? "" : "-Ion"), geo: n === 2 ? "linear" : n === 4 ? (m[0] === "Cu" && m[1] === 2 || m[0] === "Ni" && l[0] === "CN" ? "quadratisch-planar" : "tetraedrisch") : "oktaedrisch" };
  }
  $("#kM").innerHTML = MET.map((m, i) => `<option value="${i}">${m[0]}${chg(m[1])}</option>`).join("");
  $("#kL").innerHTML = LIG.map((l, i) => `<option value="${i}">${SUB(l[0])}${chg(l[1])} (${l[2]})</option>`).join("");
  $("#kM").value = "0"; $("#kL").value = "1"; $("#kN").value = "4";
  function drawK() {
    const m = MET[+$("#kM").value], l = LIG[+$("#kL").value], n = +$("#kN").value, k = build(m, l, n);
    const known = KNOWN[`${m[0]}${m[1]}|${l[0]}|${n}`];
    const c = 110; let pts;
    if (n === 2) pts = [[30, 110], [190, 110]];
    else if (n === 4) pts = k.geo === "quadratisch-planar" ? [[40, 110], [180, 110], [110, 40], [110, 180]] : [[110, 30], [40, 150], [180, 150], [130, 120]];
    else pts = [[110, 25], [110, 195], [30, 110], [190, 110], [65, 70], [155, 150]];
    let g = pts.map(([x, y]) => `<line class="bond" x1="${c}" y1="${c}" x2="${x}" y2="${y}"/>`).join("");
    g += `<circle class="z" cx="${c}" cy="${c}" r="24" fill="${known ? known[1] : "var(--surface)"}"/><text x="${c}" y="${c}" style="fill:${known && /tief|rot|blau \(F|violett/.test(known[0]) ? "#fff" : "var(--ink)"}">${m[0]}${chg(m[1])}</text>`;
    g += pts.map(([x, y]) => `<circle class="lig" cx="${x}" cy="${y}" r="17"/><text x="${x}" y="${y}">${SUB(l[0])}${chg(l[1])}</text>`).join("");
    $("#kSvg").innerHTML = g;
    $("#kF").innerHTML = k.formula;
    $("#kName").innerHTML = `<b>${k.name}</b>`;
    $("#kInfo").innerHTML = `<p>Ladung: ${m[1] > 0 ? "+" : ""}${m[1]} + ${n} · (${l[1]}) = <b>${k.q > 0 ? "+" : ""}${k.q}</b>${k.q < 0 ? " → Anion, Endung „-at“" : k.q > 0 ? " → Kation" : " → neutraler Komplex"}</p><p>Koordinationszahl ${n}: <b>${k.geo}</b></p>` +
      (known ? `<p><span class="swatch" style="background:${known[1]}"></span>Bekannter Komplex: <b>${known[0]}</b></p>` : `<p class="muted">Nicht jede Kombination kommt real vor. Bekannte Komplexe werden farbig angezeigt.</p>`);
  }
  ["#kM", "#kL", "#kN"].forEach((id) => $(id).addEventListener("change", drawK));
  drawK();
  const EX = [[0, 1, 4], [2, 3, 6], [3, 3, 6], [4, 1, 2], [4, 7, 2], [5, 4, 4], [9, 4, 4], [6, 2, 4], [3, 6, 6], [10, 0, 6]];
  $("#nTab").innerHTML = "<tr><th>Formel</th><th>Name</th></tr>" + EX.map(([a, b, n]) => { const k = build(MET[a], LIG[b], n); return `<tr><td>${k.formula}</td><td>${k.name}</td></tr>`; }).join("");

  // ---------- trainer ----------
  const randK = () => { for (;;) { const m = pick(MET), l = pick(LIG), n = pick([2, 4, 6]); if (l[0] === "S2O3" && n > 2) continue; return [m, l, n, build(m, l, n)]; } };
  const qCheck = (q) => (raw) => { const t = String(raw).replace(/\s/g, "").replace(/[−–]/g, "-").replace("⁺", "+").replace("⁻", "-"); const m = t.match(/^([+-]?)(\d?)([+-]?)$/); if (!m || (!m[2] && !m[1] && !m[3])) return { ok: false, msg: "Schreibe z. B. <code>2+</code>, <code>3-</code> oder <code>0</code>." }; const sign = m[1] || m[3] || "+", v = (sign === "-" ? -1 : 1) * +(m[2] || 1); return (t === "0" ? 0 : v) === q ? { ok: true } : { ok: false, msg: "Ladung des Zentralions plus alle Ligandenladungen." }; };
  function genQ() { const [m, l, n, k] = randK(); return { html: `Welche Ladung hat der Komplex aus <b>${m[0]}${chg(m[1])}</b> und <b>${n} ${SUB(l[0])}${chg(l[1])}</b>?`, label: "Ladung:", placeholder: "z. B. 3-", answer: k.q === 0 ? "0" : `${Math.abs(k.q)}${k.q > 0 ? "+" : "-"}`, check: qCheck(k.q), solution: `${m[1]} + ${n} · (${l[1]}) = <b>${k.q}</b>: ${k.formula}` }; }
  function genOZ() { const [m, l, n, k] = randK(); return { html: `Welche Oxidationszahl hat das Zentralion in <b>${k.formula}</b>?`, label: "OZ:", placeholder: "z. B. +3", answer: "+" + m[1], check: (raw) => { const t = String(raw).replace(/\s/g, ""); const r = { i: 1, ii: 2, iii: 3 }; const v = r[t.replace(/^\+/, "").toLowerCase()] || +t.replace("+", ""); return v === m[1] ? { ok: true } : { ok: false, msg: "Komplexladung minus Ligandenladungen." }; }, solution: `${k.q} − ${n} · (${l[1]}) = <b>+${m[1]}</b>` }; }
  function genName() { const [m, l, n, k] = randK(); const norm = (s) => s.toLowerCase().replace(/[\s-]/g, "").replace("ion", "");
    return { html: `Benenne <b>${k.formula}</b>.`, label: "Name:", placeholder: "z. B. Tetraamminkupfer(II)-Ion", answer: k.name, check: (raw) => (norm(raw) === norm(k.name) ? { ok: true } : { ok: false, msg: "Zahlwort + Ligand + Zentralion (-at bei Anionen) + (OZ)." }), solution: `<b>${k.name}</b>` }; }
  function genKZ() { const [m, l, n, k] = randK(); return { html: `Koordinationszahl und Gestalt von <b>${k.formula}</b>?`, label: "KZ:", answer: String(n), check: LK.check.num(n, { abs: 0 }), solution: `KZ <b>${n}</b>, ${k.geo}` }; }
  LK.trainer({ el: "#trainer", modes: [
    { id: "ladung", label: "Ladung", gen: genQ },
    { id: "oz", label: "Oxidationszahl", gen: genOZ },
    { id: "name", label: "Benennen", gen: genName },
    { id: "kz", label: "Koordinationszahl", gen: genKZ }
  ] });

  LK.quiz({ box: "#quizBox", bar: "#qBar", progress: "#qProgress", key: "komplex.best", n: 8, questions: [
    { q: "Was zeichnet einen Liganden aus?", o: ["Er hat ein freies Elektronenpaar", "Er ist immer positiv", "Er ist ein Metall", "Er hat keine Elektronen"], a: 0, e: "Elektronenpaardonator." },
    { q: "Ladung von [Fe(CN)₆] mit Fe³⁺?", o: ["3+", "3−", "6−", "0"], a: 1, e: "3 + 6 · (−1) = −3." },
    { q: "Name von [Cu(NH₃)₄]²⁺?", o: ["Tetraamminkupfer(II)-Ion", "Tetraammincuprat(II)", "Kupferammoniak", "Diamminkupfer(IV)"], a: 0, e: "Kation: keine -at-Endung." },
    { q: "Welche Gestalt hat ein Komplex mit KZ 6?", o: ["linear", "tetraedrisch", "oktaedrisch", "trigonal"], a: 2, e: "Sechs Liganden an den Ecken eines Oktaeders." },
    { q: "Warum färbt Ammoniak Kupfersulfatlösung tiefblau?", o: ["Kupfer wird oxidiert", "Ligandenaustausch: [Cu(NH₃)₄]²⁺ entsteht", "Ammoniak ist blau", "Es bildet sich Kupfer"], a: 1, e: "Andere Liganden, andere Farbe." },
    { q: "Was bedeutet die Endung „-at“ im Komplexnamen?", o: ["Der Komplex ist ein Anion", "Der Komplex ist neutral", "Es ist ein Kation", "Es ist Wasser gebunden"], a: 0, e: "z. B. Hexacyanidoferrat(III)." },
    { q: "Wozu dient Thiosulfat in der Fotografie?", o: ["Zum Belichten", "Es löst unbelichtetes Silberbromid als Komplex", "Es färbt das Bild", "Zum Entwickeln"], a: 1, e: "[Ag(S₂O₃)₂]³⁻ ist löslich." },
    { q: "Welche Bindung liegt zwischen Ligand und Zentralion vor?", o: ["Ionenbindung", "Metallbindung", "Koordinative Bindung", "Wasserstoffbrücke"], a: 2, e: "Beide Bindungselektronen stammen vom Liganden." }
  ] });

  LK.views(["verstehen", "baukasten", "namen", "ueben", "alltag", "quiz"], {});
})();
