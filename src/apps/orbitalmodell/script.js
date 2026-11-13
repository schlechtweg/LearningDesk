(function () {
  "use strict";
  const { $, $$, pick } = LK;
  const SYM = ["", "H", "He", "Li", "Be", "B", "C", "N", "O", "F", "Ne", "Na", "Mg", "Al", "Si", "P", "S", "Cl", "Ar", "K", "Ca", "Sc", "Ti", "V", "Cr", "Mn", "Fe", "Co", "Ni", "Cu", "Zn", "Ga", "Ge", "As", "Se", "Br", "Kr"];
  const NAME = ["", "Wasserstoff", "Helium", "Lithium", "Beryllium", "Bor", "Kohlenstoff", "Stickstoff", "Sauerstoff", "Fluor", "Neon", "Natrium", "Magnesium", "Aluminium", "Silicium", "Phosphor", "Schwefel", "Chlor", "Argon", "Kalium", "Calcium", "Scandium", "Titan", "Vanadium", "Chrom", "Mangan", "Eisen", "Cobalt", "Nickel", "Kupfer", "Zink", "Gallium", "Germanium", "Arsen", "Selen", "Brom", "Krypton"];
  // sublevels in filling order: [label, number of orbitals, energy rank for drawing]
  const ORDER = [["1s", 1], ["2s", 1], ["2p", 3], ["3s", 1], ["3p", 3], ["4s", 1], ["3d", 5], ["4p", 3]];
  const SUP = (n) => String(n).split("").map((d) => "⁰¹²³⁴⁵⁶⁷⁸⁹"[d]).join("");
  // electrons per sublevel, with the exceptions Cr and Cu
  function fill(z) {
    const res = {}; let left = z;
    ORDER.forEach(([l, o]) => { const n = Math.min(left, 2 * o); res[l] = n; left -= n; });
    if (z === 24) { res["4s"] = 1; res["3d"] = 5; }
    if (z === 29) { res["4s"] = 1; res["3d"] = 10; }
    return res;
  }
  // written order: by shell (3d before 4s), as usual in textbooks
  const WRITE = ["1s", "2s", "2p", "3s", "3p", "3d", "4s", "4p"];
  function conf(z) { const f = fill(z); return WRITE.filter((l) => f[l]).map((l) => l + SUP(f[l])).join(" "); }
  function short(z) {
    const core = z > 18 ? 18 : z > 10 ? 10 : z > 2 ? 2 : 0;
    if (!core) return conf(z);
    const f = fill(z), fc = fill(core);
    const rest = WRITE.filter((l) => f[l] && f[l] !== fc[l]).map((l) => l + SUP(f[l])).join(" ");
    return `[${SYM[core]}] ${rest}`;
  }
  function unpaired(z) { const f = fill(z); return ORDER.reduce((s, [l, o]) => { const n = f[l]; return s + (n <= o ? n : 2 * o - n); }, 0); }
  function block(z) { if (z === 2) return "s"; const f = fill(z); const last = [...ORDER].reverse().find(([l]) => f[l] > 0 && !(z === 24 || z === 29 ? l === "4s" : false)); return z === 24 || z === 29 ? "d" : last[0][1]; }

  // ---------- interactive diagram ----------
  let Z = 8;
  $("#oGrid").innerHTML = SYM.slice(1).map((s, i) => `<button type="button" data-z="${i + 1}" aria-pressed="false"><b>${s}</b><small>${i + 1}</small></button>`).join("");
  // energy positions (y) for each sublevel
  const Y = { "1s": 300, "2s": 250, "2p": 222, "3s": 180, "3p": 152, "4s": 112, "3d": 88, "4p": 50 };
  function draw() {
    const f = fill(Z); let g = `<line class="ax" x1="30" y1="320" x2="30" y2="20"/><text class="en" x="36" y="22">Energie</text>`;
    ORDER.forEach(([l, o]) => {
      const n = f[l], y = Y[l], x0 = l[1] === "s" ? 70 : 140; g += `<text class="lab" x="${l[1] === "s" ? 44 : x0 + o * 46 + 4}" y="${y + 5}">${l}</text>`;
      // per orbital: first single electrons (Hund), then pairs (Pauli)
      for (let k = 0; k < o; k++) {
        const x = x0 + k * 46; g += `<rect class="box" x="${x}" y="${y - 15}" width="40" height="30" rx="3"/>`;
        const e = n >= o + k + 1 ? 2 : n >= k + 1 ? 1 : 0;
        if (e >= 1) g += `<path class="up" d="M${x + 13} ${y + 10} V${y - 10} M${x + 9} ${y - 5} L${x + 13} ${y - 10} L${x + 17} ${y - 5}"/>`;
        if (e === 2) g += `<path class="dn" d="M${x + 27} ${y - 10} V${y + 10} M${x + 23} ${y + 5} L${x + 27} ${y + 10} L${x + 31} ${y + 5}"/>`;
      }
    });
    $("#oSvg").innerHTML = g;
    $$("#oGrid button").forEach((b) => b.setAttribute("aria-pressed", String(+b.dataset.z === Z)));
    $("#oName").textContent = `${NAME[Z]} (${SYM[Z]}), Z = ${Z}`;
    $("#oConf").textContent = conf(Z); $("#oShort").textContent = short(Z);
    const ex = Z === 24 || Z === 29 ? `<p><b>Ausnahme:</b> Ein 4s-Elektron wechselt ins 3d-Niveau, weil ein ${Z === 24 ? "halb" : "ganz"} gefülltes d-Niveau besonders stabil ist.</p>` : "";
    $("#oInfo").innerHTML = `<p><b>${unpaired(Z)}</b> ungepaarte Elektronen · <b>${block(Z)}-Block</b>${Z >= 21 && Z <= 30 ? " (Nebengruppenelement)" : ""}</p>${ex}${Z === 19 ? "<p>Kalium: 4s liegt energetisch tiefer als 3d. Deshalb kommt das 19. Elektron in 4s.</p>" : ""}`;
    $("#oMinus").disabled = Z <= 1; $("#oPlus").disabled = Z >= 36;
  }
  $$("#oGrid button").forEach((b) => b.addEventListener("click", () => { Z = +b.dataset.z; draw(); }));
  $("#oMinus").addEventListener("click", () => { Z--; draw(); }); $("#oPlus").addEventListener("click", () => { Z++; draw(); });
  draw();

  // ---------- trainer ----------
  // normalise "1s2 2s2 2p3" or "[He] 2s2 2p3" to a full list of sublevel counts
  function parseConf(raw) {
    let t = String(raw).replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹]/g, (c) => "⁰¹²³⁴⁵⁶⁷⁸⁹".indexOf(c)).replace(/\s+/g, " ").trim();
    const res = {}; WRITE.forEach((l) => (res[l] = 0));
    const m = t.match(/^\[(He|Ne|Ar)\]\s*/i);
    if (m) { const core = { he: 2, ne: 10, ar: 18 }[m[1].toLowerCase()]; Object.assign(res, fill(core)); t = t.slice(m[0].length); }
    const parts = t.match(/([1-4])([spd])\s*(\d+)/gi) || [];
    if (!parts.length && !m) return null;
    parts.forEach((p) => { const q = p.match(/([1-4])([spd])\s*(\d+)/i); res[q[1] + q[2].toLowerCase()] = +q[3]; });
    return res;
  }
  const same = (a, b) => WRITE.every((l) => (a[l] || 0) === (b[l] || 0));
  const confCheck = (z) => (raw) => { const p = parseConf(raw); if (!p) return { ok: false, msg: "Schreibe z. B. <code>1s2 2s2 2p3</code>." }; return same(p, fill(z)) ? { ok: true } : { ok: false, msg: "Reihenfolge 1s, 2s, 2p, 3s, 3p, 4s, 3d, 4p. In s passen 2, in p 6, in d 10 Elektronen." }; };
  const pool = Array.from({ length: 36 }, (_, i) => i + 1);
  function genConf() { const z = pick(pool.filter((x) => x <= 20 || Math.random() < 0.4)); return { html: `Elektronenkonfiguration von <b>${NAME[z]}</b> (Z = ${z})?`, label: "Konfiguration:", placeholder: "z. B. 1s2 2s2 2p3", answer: conf(z), check: confCheck(z), solution: `<b>${conf(z)}</b> = ${short(z)}` }; }
  function genUnp() { const z = pick(pool); const u = unpaired(z); return { html: `Wie viele <b>ungepaarte</b> Elektronen hat ein ${NAME[z]}-Atom (${conf(z)})?`, label: "Anzahl:", answer: String(u), check: LK.check.num(u, { abs: 0 }), solution: `Hund'sche Regel: <b>${u}</b>` }; }
  function genEl() { const z = pick(pool.filter((x) => x > 2)); return { html: `Welches Element hat die Konfiguration <b>${short(z)}</b>?`, label: "Symbol:", answer: SYM[z], check: (raw) => (raw.trim().toLowerCase() === SYM[z].toLowerCase() || raw.trim().toLowerCase() === NAME[z].toLowerCase() ? { ok: true } : { ok: false, msg: "Zähle alle Elektronen zusammen: Das ist die Ordnungszahl." }), solution: `${z} Elektronen: <b>${NAME[z]} (${SYM[z]})</b>` }; }
  function genBlock() { const z = pick(pool); const b = block(z); return { html: `In welchem Block des Periodensystems steht <b>${NAME[z]}</b> (${short(z)})?`, label: "Block:", placeholder: "s, p oder d", answer: b, check: (raw) => { const t = raw.trim().toLowerCase().replace("-block", "").replace("block", "").trim(); return t === b ? { ok: true } : { ok: false, msg: "Welches Unterniveau wird zuletzt aufgefüllt?" }; }, solution: `<b>${b}-Block</b>` }; }
  LK.trainer({ el: "#trainer", modes: [
    { id: "konf", label: "Konfiguration", gen: genConf },
    { id: "unp", label: "Ungepaarte Elektronen", gen: genUnp },
    { id: "el", label: "Element erkennen", gen: genEl },
    { id: "block", label: "Block im PSE", gen: genBlock }
  ] });

  LK.quiz({ box: "#quizBox", bar: "#qBar", progress: "#qProgress", key: "orbital.best", n: 8, questions: [
    { q: "Was ist ein Orbital?", o: ["Eine feste Kreisbahn", "Ein Raum, in dem sich ein Elektron mit hoher Wahrscheinlichkeit aufhält", "Ein Teil des Kerns", "Ein Proton"], a: 1, e: "Aufenthaltswahrscheinlichkeit, meist 90 %." },
    { q: "Wie viele Elektronen passen höchstens in ein Orbital?", o: ["1", "2", "6", "8"], a: 1, e: "Pauli-Prinzip, mit entgegengesetztem Spin." },
    { q: "Welches Unterniveau wird nach 3p besetzt?", o: ["3d", "4s", "4p", "4d"], a: 1, e: "4s liegt energetisch tiefer als 3d." },
    { q: "Konfiguration von Sauerstoff (Z = 8)?", o: ["1s² 2s² 2p⁴", "1s² 2s⁶", "1s² 2p⁶", "2s² 2p⁶"], a: 0, e: "2 + 2 + 4 = 8." },
    { q: "Was sagt die Hund'sche Regel?", o: ["Orbitale werden erst einfach, dann doppelt besetzt", "4s vor 3d", "Höchstens 2 Elektronen pro Orbital", "Elektronen kreisen"], a: 0, e: "Gleichwertige Orbitale zuerst einzeln." },
    { q: "Wie viele p-Orbitale gibt es pro Schale (ab n = 2)?", o: ["1", "3", "5", "7"], a: 1, e: "pₓ, p_y, p_z." },
    { q: "In welchem Block stehen die Nebengruppenelemente?", o: ["s-Block", "p-Block", "d-Block", "f-Block"], a: 2, e: "Es wird das 3d-Niveau aufgefüllt." },
    { q: "Welche Konfiguration hat Kupfer?", o: ["[Ar] 3d⁹ 4s²", "[Ar] 3d¹⁰ 4s¹", "[Ar] 4s² 4p⁹", "[Kr] 4s¹"], a: 1, e: "Ausnahme: volles d-Niveau ist stabiler." }
  ] });

  LK.views(["verstehen", "orbitale", "besetzen", "ueben", "alltag", "quiz"], {});
})();
