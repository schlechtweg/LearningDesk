// Shared element data for the chemistry apps (main-group elements of periods 1-5).
// z, symbol, German name, group (1-8, main-group numbering), period, mass number of the most common isotope,
// average atomic mass (u), electronegativity (Pauling, null for noble gases), covalent radius (pm, Cordero 2008),
// first ionisation energy (kJ/mol), class: m = metal, h = semimetal, n = nonmetal, e = noble gas
window.CHEM = (function () {
  "use strict";
  const raw = [
    [1, "H", "Wasserstoff", 1, 1, 1, 1.008, 2.20, 31, 1312, "n"], [2, "He", "Helium", 8, 1, 4, 4.003, null, 28, 2372, "e"],
    [3, "Li", "Lithium", 1, 2, 7, 6.94, 0.98, 128, 520, "m"], [4, "Be", "Beryllium", 2, 2, 9, 9.012, 1.57, 96, 900, "m"],
    [5, "B", "Bor", 3, 2, 11, 10.81, 2.04, 84, 801, "h"], [6, "C", "Kohlenstoff", 4, 2, 12, 12.01, 2.55, 76, 1086, "n"],
    [7, "N", "Stickstoff", 5, 2, 14, 14.01, 3.04, 71, 1402, "n"], [8, "O", "Sauerstoff", 6, 2, 16, 16.00, 3.44, 66, 1314, "n"],
    [9, "F", "Fluor", 7, 2, 19, 19.00, 3.98, 57, 1681, "n"], [10, "Ne", "Neon", 8, 2, 20, 20.18, null, 58, 2081, "e"],
    [11, "Na", "Natrium", 1, 3, 23, 22.99, 0.93, 166, 496, "m"], [12, "Mg", "Magnesium", 2, 3, 24, 24.31, 1.31, 141, 738, "m"],
    [13, "Al", "Aluminium", 3, 3, 27, 26.98, 1.61, 121, 578, "m"], [14, "Si", "Silicium", 4, 3, 28, 28.09, 1.90, 111, 787, "h"],
    [15, "P", "Phosphor", 5, 3, 31, 30.97, 2.19, 107, 1012, "n"], [16, "S", "Schwefel", 6, 3, 32, 32.06, 2.58, 105, 1000, "n"],
    [17, "Cl", "Chlor", 7, 3, 35, 35.45, 3.16, 102, 1251, "n"], [18, "Ar", "Argon", 8, 3, 40, 39.95, null, 106, 1521, "e"],
    [19, "K", "Kalium", 1, 4, 39, 39.10, 0.82, 203, 419, "m"], [20, "Ca", "Calcium", 2, 4, 40, 40.08, 1.00, 176, 590, "m"],
    [31, "Ga", "Gallium", 3, 4, 69, 69.72, 1.81, 122, 579, "m"], [32, "Ge", "Germanium", 4, 4, 74, 72.63, 2.01, 120, 762, "h"],
    [33, "As", "Arsen", 5, 4, 75, 74.92, 2.18, 119, 947, "h"], [34, "Se", "Selen", 6, 4, 80, 78.97, 2.55, 120, 941, "n"],
    [35, "Br", "Brom", 7, 4, 79, 79.90, 2.96, 120, 1140, "n"], [36, "Kr", "Krypton", 8, 4, 84, 83.80, null, 116, 1351, "e"],
    [37, "Rb", "Rubidium", 1, 5, 85, 85.47, 0.82, 220, 403, "m"], [38, "Sr", "Strontium", 2, 5, 88, 87.62, 0.95, 195, 550, "m"],
    [49, "In", "Indium", 3, 5, 115, 114.82, 1.78, 142, 558, "m"], [50, "Sn", "Zinn", 4, 5, 120, 118.71, 1.96, 139, 709, "m"],
    [51, "Sb", "Antimon", 5, 5, 121, 121.76, 2.05, 139, 834, "h"], [52, "Te", "Tellur", 6, 5, 130, 127.60, 2.10, 138, 869, "h"],
    [53, "I", "Iod", 7, 5, 127, 126.90, 2.66, 139, 1008, "n"], [54, "Xe", "Xenon", 8, 5, 132, 131.29, null, 140, 1170, "e"]
  ];
  const groupNames = { 1: "Alkalimetalle", 2: "Erdalkalimetalle", 3: "Borgruppe (Erdmetalle)", 4: "Kohlenstoffgruppe", 5: "Stickstoffgruppe", 6: "Chalkogene", 7: "Halogene", 8: "Edelgase" };
  const className = { m: "Metall", h: "Halbmetall", n: "Nichtmetall", e: "Edelgas" };
  // electrons per shell (K, L, M, N, O) for the listed main-group elements
  function shells(z) {
    if (z <= 2) return [z];
    if (z <= 10) return [2, z - 2];
    if (z <= 18) return [2, 8, z - 10];
    if (z <= 20) return [2, 8, 8, z - 18];
    if (z <= 36) return [2, 8, 18, z - 28];
    if (z <= 38) return [2, 8, 18, 8, z - 36];
    return [2, 8, 18, 18, z - 46];
  }
  const els = raw.map(([z, sym, name, group, period, A, mass, en, r, ie, cls]) => ({ z, sym, name, group, period, A, mass, en, r, ie, cls, shells: shells(z), valence: z === 2 ? 2 : group }));
  const bySym = Object.fromEntries(els.map((e) => [e.sym, e]));
  const SUP = { "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴", "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹", "+": "⁺", "-": "⁻" };
  const SUB = { "0": "₀", "1": "₁", "2": "₂", "3": "₃", "4": "₄", "5": "₅", "6": "₆", "7": "₇", "8": "₈", "9": "₉" };
  const sup = (s) => String(s).split("").map((c) => SUP[c] || c).join("");
  const sub = (s) => String(s).split("").map((c) => SUB[c] || c).join("");
  // charge as superscript, e.g. 2+ -> ²⁺, 1- -> ⁻
  const charge = (q) => (q === 0 ? "" : sup((Math.abs(q) === 1 ? "" : Math.abs(q)) + (q > 0 ? "+" : "-")));
  // typical ion charge of a main-group element (null for noble gases and group 4)
  const ionCharge = (e) => (e.cls === "e" ? null : e.group <= 3 ? e.group : e.group >= 5 ? e.group - 8 : null);
  // Bohr shell model as SVG; electrons spread evenly on each shell
  function bohr(e, opt = {}) {
    const q = opt.charge || 0, size = opt.size || 220, c = size / 2;
    const sh = opt.shells || e.shells.slice();
    if (q > 0) { let left = q; for (let i = sh.length - 1; i >= 0 && left > 0; i--) { const t = Math.min(left, sh[i]); sh[i] -= t; left -= t; } while (sh.length > 1 && sh[sh.length - 1] === 0) sh.pop(); }
    if (q < 0) sh[sh.length - 1] -= q;
    const n = sh.length, rStep = (c - 14) / (n + 0.6);
    let g = `<svg class="bohr" viewBox="0 0 ${size} ${size}" role="img" aria-label="Schalenmodell ${e.name}">`;
    sh.forEach((cnt, i) => {
      const r = rStep * (i + 1.6);
      g += `<circle class="shell" cx="${c}" cy="${c}" r="${r.toFixed(1)}"/>`;
      for (let k = 0; k < cnt; k++) { const a = -Math.PI / 2 + (2 * Math.PI * k) / cnt + i * 0.35; g += `<circle class="el${i === n - 1 ? " val" : ""}" cx="${(c + r * Math.cos(a)).toFixed(1)}" cy="${(c + r * Math.sin(a)).toFixed(1)}" r="${Math.max(2.6, Math.min(5, size / 48)).toFixed(1)}"/>`; }
    });
    g += `<circle class="core" cx="${c}" cy="${c}" r="${(rStep * 0.95).toFixed(1)}"/><text class="coret" x="${c}" y="${c + 4}">${opt.coreLabel || e.z + "p⁺"}</text></svg>`;
    return g;
  }
  return { els, bySym, groupNames, className, shells, sup, sub, charge, ionCharge, bohr };
})();
