(function () {
  "use strict";
  const { $, $$, pick, fmt, numText, check } = LK;
  const K = 8.99e9, E0 = 1.602e-19, ME = 9.109e-31;

  // number in scientific notation for the readouts, e.g. 1,23 · 10⁵
  const SUP = { "-": "⁻", 0: "⁰", 1: "¹", 2: "²", 3: "³", 4: "⁴", 5: "⁵", 6: "⁶", 7: "⁷", 8: "⁸", 9: "⁹" };
  function sci(v, d = 2) {
    if (v === 0 || !isFinite(v)) return fmt(v, d);
    const ex = Math.floor(Math.log10(Math.abs(v)));
    if (ex >= -2 && ex <= 4) return fmt(v, ex < 0 ? d + 1 : d);
    const m = v / 10 ** ex;
    return `${fmt(m, d)} · 10${String(ex).split("").map((c) => SUP[c]).join("")}`;
  }

  // =====================================================================
  // Field lines: charges in SVG coordinates, 1 px = 1 mm, charge unit 1 nC
  // =====================================================================
  const W = 420, H = 320;
  const PRESETS = {
    plus: [{ x: 210, y: 160, q: 1 }],
    minus: [{ x: 210, y: 160, q: -1 }],
    dipol: [{ x: 140, y: 160, q: 1 }, { x: 280, y: 160, q: -1 }],
    gleich: [{ x: 140, y: 160, q: 1 }, { x: 280, y: 160, q: 1 }],
    ungleich: [{ x: 150, y: 160, q: 2 }, { x: 290, y: 160, q: -1 }]
  };
  let charges = PRESETS.plus.map((c) => ({ ...c })), preset = "plus", probe = { x: 330, y: 90 }, drag = null;

  // field in arbitrary units (only direction and relative size matter for drawing)
  function field(x, y) {
    let ex = 0, ey = 0;
    for (const c of charges) {
      const dx = x - c.x, dy = y - c.y, r2 = dx * dx + dy * dy, r3 = r2 * Math.sqrt(r2);
      if (r3 < 1e-6) continue;
      ex += c.q * dx / r3; ey += c.q * dy / r3;
    }
    return [ex, ey];
  }
  // field strength in N/C at a point (px = mm, q in nC)
  function fieldSI(x, y) { const [ex, ey] = field(x, y); return [ex * K * 1e-9 * 1e6, ey * K * 1e-9 * 1e6]; }

  // trace one line; dir = +1 along the field, -1 against it
  function trace(x, y, dir) {
    const pts = [[x, y]];
    for (let i = 0; i < 900; i++) {
      const [ex, ey] = field(x, y), n = Math.hypot(ex, ey);
      if (n < 1e-12) break;
      x += dir * 2.5 * ex / n; y += dir * 2.5 * ey / n;
      pts.push([x, y]);
      if (x < -40 || x > W + 40 || y < -40 || y > H + 40) break;
      if (charges.some((c) => Math.sign(c.q) === -dir && Math.hypot(x - c.x, y - c.y) < 8)) break;
    }
    return pts;
  }
  function arrowAt(pts, dir) {
    if (pts.length < 20) return "";
    const i = Math.min(pts.length - 2, 28 + Math.floor(pts.length * 0.15));
    let [x1, y1] = pts[i], [x2, y2] = pts[i + 1];
    if (dir < 0) [x1, y1, x2, y2] = [x2, y2, x1, y1];
    const a = Math.atan2(y2 - y1, x2 - x1), s = 6;
    const p = (ang) => `${x2 - s * Math.cos(a + ang)},${y2 - s * Math.sin(a + ang)}`;
    return `<polygon class="fl-arrow" points="${x2},${y2} ${p(0.45)} ${p(-0.45)}"/>`;
  }

  function drawField() {
    const n = +$("#fN").value;
    $("#fNOut").textContent = n;
    let s = "";
    // start lines at the positive charges; only negative charges: start there and trace backwards
    const pos = charges.filter((c) => c.q > 0), sources = pos.length ? pos : charges, dir = pos.length ? 1 : -1;
    for (const c of sources) {
      const m = Math.round(n * Math.abs(c.q));
      for (let k = 0; k < m; k++) {
        const a = (2 * Math.PI * (k + 0.5)) / m;
        const pts = trace(c.x + 9 * Math.cos(a), c.y + 9 * Math.sin(a), dir);
        s += `<polyline class="fl" points="${pts.map((p) => p.map((v) => v.toFixed(1)).join(",")).join(" ")}"/>` + arrowAt(pts, dir);
      }
    }
    // probe charge with field vector
    const [ex, ey] = fieldSI(probe.x, probe.y), En = Math.hypot(ex, ey);
    if (En > 0) {
      const L = Math.min(70, 12 + 12 * Math.log10(1 + En / 50)), ux = ex / En, uy = ey / En;
      const x2 = probe.x + L * ux, y2 = probe.y + L * uy;
      s += `<line class="probe-vec" x1="${probe.x}" y1="${probe.y}" x2="${x2}" y2="${y2}"/>`;
      const a = Math.atan2(uy, ux), p = (ang) => `${x2 - 9 * Math.cos(a + ang)},${y2 - 9 * Math.sin(a + ang)}`;
      s += `<polygon class="probe-head" points="${x2},${y2} ${p(0.45)} ${p(-0.45)}"/>`;
    }
    s += `<circle class="probe" cx="${probe.x}" cy="${probe.y}" r="5"/><text class="lab" x="${probe.x + 8}" y="${probe.y - 8}">q</text>`;
    for (const [i, c] of charges.entries()) {
      s += `<g class="charge ${c.q > 0 ? "pos" : "neg"}" data-i="${i}"><circle cx="${c.x}" cy="${c.y}" r="${11 + 2 * Math.abs(c.q)}"/><text x="${c.x}" y="${c.y + 5}" text-anchor="middle">${c.q > 0 ? "+" : "−"}${Math.abs(c.q) > 1 ? Math.abs(c.q) : ""}</text></g>`;
    }
    $("#fSvg").innerHTML = s;
    const near = Math.min(...charges.map((c) => Math.hypot(probe.x - c.x, probe.y - c.y)));
    $("#fRo").innerHTML = `<dt>Feldstärke an der Probeladung</dt><dd class="big">${sci(En)} N/C</dd><dt>Abstand zur nächsten Ladung</dt><dd>${fmt(near / 10, 1)} cm</dd><dt>Kraft auf q = 1 nC</dt><dd>${sci(En * 1e-9 * 1e3)} mN</dd>`;
    const st = {
      plus: "Radialfeld: Die Linien zeigen strahlenförmig nach außen. Verdopple den Abstand der Probeladung: Die Feldstärke sinkt auf ein Viertel.",
      minus: "Radialfeld einer negativen Ladung: Die Linien zeigen nach innen. Eine positive Probeladung wird angezogen.",
      dipol: "Dipol: Die Linien laufen von + nach −. Zwischen den Ladungen liegen sie dicht, dort ist das Feld besonders stark.",
      gleich: "Zwei gleiche Ladungen stoßen sich ab. Genau in der Mitte heben sich die Felder auf: Dort ist E = 0.",
      ungleich: "Die Ladung +2 hat doppelt so viele Linien. Nur die Hälfte endet an −1, der Rest läuft ins Unendliche."
    };
    $("#fStatus").textContent = st[preset];
  }
  function svgPoint(ev) {
    const svg = $("#fSvg"), pt = svg.createSVGPoint();
    pt.x = ev.clientX; pt.y = ev.clientY;
    const p = pt.matrixTransform(svg.getScreenCTM().inverse());
    return { x: Math.max(10, Math.min(W - 10, p.x)), y: Math.max(10, Math.min(H - 10, p.y)) };
  }
  $("#fSvg").addEventListener("pointerdown", (ev) => {
    const g = ev.target.closest(".charge"), p = svgPoint(ev);
    if (g) { drag = +g.dataset.i; $("#fSvg").setPointerCapture(ev.pointerId); }
    else { probe = p; drawField(); }
  });
  $("#fSvg").addEventListener("pointermove", (ev) => {
    if (drag === null) return;
    const p = svgPoint(ev); charges[drag].x = p.x; charges[drag].y = p.y; drawField();
  });
  const stop = () => { drag = null; };
  $("#fSvg").addEventListener("pointerup", stop); $("#fSvg").addEventListener("pointercancel", stop);
  $$("[data-preset]").forEach((b) => b.addEventListener("click", () => {
    preset = b.dataset.preset; charges = PRESETS[preset].map((c) => ({ ...c }));
    $$("[data-preset]").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
    drawField();
  }));
  $("#fN").addEventListener("input", drawField);

  // =====================================================================
  // Parallel-plate capacitor
  // =====================================================================
  function drawCap() {
    const U = +$("#kU").value, dcm = +$("#kD").value, d = dcm / 100;
    $("#kUOut").textContent = `${fmt(U, 0)} V`; $("#kDOut").textContent = `${fmt(dcm, 1)} cm`;
    const E = U / d, F = E0 * E, a = F / ME, Wj = E0 * U, v = Math.sqrt(2 * E0 * U / ME);
    const half = dcm * 15, xl = 210 - half, xr = 210 + half, top = 50, bot = 250;
    let s = `<rect class="plate pos" x="${xl - 10}" y="${top}" width="10" height="${bot - top}"/><rect class="plate neg" x="${xr}" y="${top}" width="10" height="${bot - top}"/>`;
    s += `<text class="lab" x="${xl - 5}" y="${top - 10}" text-anchor="middle">+</text><text class="lab" x="${xr + 5}" y="${top - 10}" text-anchor="middle">−</text>`;
    // equipotential lines (dashed) and field lines; line density grows with E
    for (let k = 1; k < 4; k++) { const x = xl + (xr - xl) * k / 4; s += `<line class="equi" x1="${x}" y1="${top}" x2="${x}" y2="${bot}"/>`; }
    const nLines = Math.max(3, Math.min(14, Math.round(2 + Math.log10(E) * 2)));
    for (let k = 0; k < nLines; k++) {
      const y = top + (bot - top) * (k + 0.5) / nLines, xm = (xl + xr) / 2;
      s += `<line class="fl" x1="${xl}" y1="${y}" x2="${xr}" y2="${y}"/><polygon class="fl-arrow" points="${xm + 5},${y} ${xm - 4},${y - 4} ${xm - 4},${y + 4}"/>`;
    }
    // electron near the negative plate, force arrow towards +
    const ey = top + (bot - top) * 0.5 / nLines + (bot - top) / nLines * Math.floor(nLines / 2) - 18;
    s += `<line class="probe-vec" x1="${xr - 14}" y1="${ey}" x2="${Math.max(xl + 14, xr - 60)}" y2="${ey}"/><circle class="electron" cx="${xr - 14}" cy="${ey}" r="6"/><text class="lab small" x="${xr - 14}" y="${ey - 10}" text-anchor="middle">e⁻</text>`;
    s += `<text class="lab small" x="210" y="${bot + 30}" text-anchor="middle">d = ${fmt(dcm, 1)} cm</text><line class="dim" x1="${xl}" y1="${bot + 14}" x2="${xr}" y2="${bot + 14}"/>`;
    $("#kSvg").innerHTML = s;
    $("#kRo").innerHTML = `<dt>Feldstärke E = U/d</dt><dd class="big">${sci(E)} V/m</dd><dt>Kraft auf ein Elektron</dt><dd>${sci(F)} N</dd><dt>Beschleunigung</dt><dd>${sci(a)} m/s²</dd><dt>Energie nach Durchlaufen (e·U)</dt><dd>${fmt(U, 0)} eV = ${sci(Wj)} J</dd><dt>Endgeschwindigkeit</dt><dd>${sci(v)} m/s</dd>`;
    $("#kStatus").innerHTML = `Verdopple den Abstand bei gleicher Spannung: <i>E</i> halbiert sich. Die <strong>Energie</strong> e·U am Ende hängt aber nur von der Spannung ab, nicht vom Abstand.${v > 3e7 ? " Bei so hohen Geschwindigkeiten (über 10 % der Lichtgeschwindigkeit) müsste man eigentlich relativistisch rechnen." : ""}`;
  }
  $("#kU").addEventListener("input", drawCap); $("#kD").addEventListener("input", drawCap);

  // =====================================================================
  // Trainer
  // =====================================================================
  const T = (ans) => check.num(ans, { tol: 0.02 });
  // pick the unit that gives a value between 1 and 1000; returns [value, unit]
  function scaled(vSI, units) {
    for (const [f, u] of units) { const v = vSI / f; if (Math.abs(v) >= 1 && Math.abs(v) < 1000) return [v, u]; }
    const [f, u] = units[units.length - 1]; return [vSI / f, u];
  }
  const dec = (v) => (Math.abs(v) >= 100 ? 1 : Math.abs(v) >= 10 ? 2 : 3);
  function genEFq() {
    const kind = pick(["E", "F", "q"]);
    const F = pick([0.2, 0.5, 0.8, 1.2, 1.5, 2, 3, 4.5, 6]), q = pick([2, 4, 5, 8, 10, 20, 25, 50]);
    const E = F / q * 1e3; // kN/C: (F mN · 1e-3) / (q nC · 1e-9) / 1e3
    if (kind === "E") return { html: `Auf eine Probeladung <b>q = ${q} nC</b> wirkt im Feld die Kraft <b>F = ${fmt(F, 1)} mN</b>. Berechne die Feldstärke.`,
      label: "<i>E</i> =", placeholder: "in kN/C", answer: numText(E, dec(E)), check: T(E), hint: "Einheit: kN/C. Erst in N und C umrechnen.",
      solution: `<span class="math"><i>E</i> = <i>F</i> / <i>q</i> = ${fmt(F, 1)} · 10⁻³ N / (${q} · 10⁻⁹ C) = ${sci(E * 1e3)} N/C = ${fmt(E, 2)} kN/C</span>` };
    if (kind === "F") return { html: `In einem Feld der Stärke <b>E = ${fmt(E, 2)} kN/C</b> befindet sich die Ladung <b>q = ${q} nC</b>. Welche Kraft wirkt auf sie?`,
      label: "<i>F</i> =", placeholder: "in mN", answer: numText(F, dec(F)), check: T(F), hint: "Einheit: mN. F = E · q",
      solution: `<span class="math"><i>F</i> = <i>E</i> · <i>q</i> = ${sci(E * 1e3)} N/C · ${q} · 10⁻⁹ C = ${sci(F * 1e-3)} N = ${fmt(F, 2)} mN</span>` };
    return { html: `Im Feld <b>E = ${fmt(E, 2)} kN/C</b> wirkt auf eine Ladung die Kraft <b>F = ${fmt(F, 1)} mN</b>. Wie groß ist die Ladung?`,
      label: "<i>q</i> =", placeholder: "in nC", answer: numText(q, 2), check: T(q), hint: "Einheit: nC. q = F / E",
      solution: `<span class="math"><i>q</i> = <i>F</i> / <i>E</i> = ${sci(F * 1e-3)} N / ${sci(E * 1e3)} N/C = ${sci(q * 1e-9)} C = ${q} nC</span>` };
  }
  function genUd() {
    const kind = pick(["E", "E", "U", "d"]);
    const U = pick([100, 200, 230, 500, 1000, 1500, 2000, 3000, 5000]), dcm = pick([0.5, 1, 2, 2.5, 4, 5, 8, 10]);
    const E = U / (dcm / 100) / 1e3; // kV/m
    if (kind === "E") return { html: `Ein Plattenkondensator hat den Abstand <b>d = ${fmt(dcm, 1)} cm</b> und liegt an <b>U = ${fmt(U, 0)} V</b>. Berechne die Feldstärke.`,
      label: "<i>E</i> =", placeholder: "in kV/m", answer: numText(E, 2), check: T(E), hint: "Einheit: kV/m. d in Meter umrechnen!",
      solution: `<span class="math">${fmt(dcm, 1)} cm = ${fmt(dcm / 100, 3)} m; <i>E</i> = <i>U</i> / <i>d</i> = ${fmt(U, 0)} V / ${fmt(dcm / 100, 3)} m = ${fmt(E * 1e3, 0)} V/m = ${fmt(E, 2)} kV/m</span>` };
    if (kind === "U") return { html: `Zwischen zwei Platten im Abstand <b>d = ${fmt(dcm, 1)} cm</b> herrscht die Feldstärke <b>E = ${fmt(E, 2)} kV/m</b>. Welche Spannung liegt an?`,
      label: "<i>U</i> =", placeholder: "in V", answer: numText(U, 1), check: T(U), hint: "Einheit: V. U = E · d",
      solution: `<span class="math"><i>U</i> = <i>E</i> · <i>d</i> = ${fmt(E * 1e3, 0)} V/m · ${fmt(dcm / 100, 3)} m = ${fmt(U, 0)} V</span>` };
    return { html: `Bei <b>U = ${fmt(U, 0)} V</b> soll zwischen zwei Platten die Feldstärke <b>E = ${fmt(E, 2)} kV/m</b> entstehen. Wie groß muss der Abstand sein?`,
      label: "<i>d</i> =", placeholder: "in cm", answer: numText(dcm, 2), check: T(dcm), hint: "Einheit: cm. d = U / E, Ergebnis in m, dann in cm.",
      solution: `<span class="math"><i>d</i> = <i>U</i> / <i>E</i> = ${fmt(U, 0)} V / ${fmt(E * 1e3, 0)} V/m = ${fmt(dcm / 100, 3)} m = ${fmt(dcm, 1)} cm</span>` };
  }
  function genCoulomb() {
    const q1 = pick([5, 10, 20, 30, 50, 80]), q2 = pick([5, 10, 20, 40, 50]), rcm = pick([2, 3, 4, 5, 6, 10, 15, 20]);
    const FSI = K * q1 * 1e-9 * q2 * 1e-9 / (rcm / 100) ** 2, [F, u] = scaled(FSI, [[1, "N"], [1e-3, "mN"], [1e-6, "µN"]]);
    return { html: `Zwei kleine Kugeln tragen <b>q₁ = ${q1} nC</b> und <b>q₂ = ${q2} nC</b>. Ihr Abstand ist <b>r = ${rcm} cm</b>. Berechne die Coulomb-Kraft.`,
      label: "<i>F</i> =", placeholder: `in ${u}`, answer: numText(F, dec(F)), check: T(F), hint: `Einheit: ${u}. k = 8,99 · 10⁹ N·m²/C², r in m!`,
      solution: `<span class="math"><i>F</i> = <i>k</i> · <i>q</i>₁<i>q</i>₂ / <i>r</i>² = 8,99 · 10⁹ · ${q1} · 10⁻⁹ · ${q2} · 10⁻⁹ / (${fmt(rcm / 100, 2)})² N = ${sci(FSI)} N = ${fmt(F, dec(F))} ${u}</span>` };
  }
  function genPoint() {
    const Q = pick([1, 2, 5, 10, 20, 50]), rcm = pick([5, 10, 20, 25, 30, 50]);
    const ESI = K * Q * 1e-9 / (rcm / 100) ** 2, [E, u] = scaled(ESI, [[1e3, "kN/C"], [1, "N/C"]]);
    return { html: `Eine Kugel trägt die Ladung <b>Q = ${Q} nC</b>. Wie groß ist die Feldstärke im Abstand <b>r = ${rcm} cm</b> vom Kugelmittelpunkt?`,
      label: "<i>E</i> =", placeholder: `in ${u}`, answer: numText(E, dec(E)), check: T(E), hint: `Einheit: ${u}. E = k · Q / r²`,
      solution: `<span class="math"><i>E</i> = <i>k</i> · <i>Q</i> / <i>r</i>² = 8,99 · 10⁹ · ${Q} · 10⁻⁹ / (${fmt(rcm / 100, 2)})² N/C = ${sci(ESI)} N/C${u === "kN/C" ? ` = ${fmt(E, dec(E))} kN/C` : ""}</span>` };
  }
  function genEnergy() {
    if (Math.random() < 0.5) {
      const U = pick([50, 100, 200, 500, 1000, 2000, 5000]), v = Math.sqrt(2 * E0 * U / ME) / 1e6;
      return { html: `Ein Elektron wird aus der Ruhe durch die Spannung <b>U = ${fmt(U, 0)} V</b> beschleunigt. Wie schnell ist es danach? (e = 1,602 · 10⁻¹⁹ C, m = 9,109 · 10⁻³¹ kg)`,
        label: "<i>v</i> =", placeholder: "in 10⁶ m/s", answer: numText(v, 2), check: T(v), hint: "Einheit: 10⁶ m/s. e·U = ½ m v²",
        solution: `<span class="math"><i>e</i><i>U</i> = ½<i>m</i><i>v</i>² ⇒ <i>v</i> = √(2<i>e</i><i>U</i>/<i>m</i>) = √(2 · 1,602 · 10⁻¹⁹ · ${fmt(U, 0)} / 9,109 · 10⁻³¹) m/s = ${sci(v * 1e6)} m/s</span>` };
    }
    const q = pick([2, 5, 10, 20, 50]), U = pick([100, 230, 500, 1000, 2000]), Wj = q * U / 1e3; // µJ
    return { html: `Eine Ladung <b>q = ${q} nC</b> wird im Feld durch die Spannung <b>U = ${fmt(U, 0)} V</b> bewegt. Welche Arbeit verrichtet das Feld?`,
      label: "<i>W</i> =", placeholder: "in µJ", answer: numText(Wj, dec(Wj)), check: T(Wj), hint: "Einheit: µJ. W = q · U",
      solution: `<span class="math"><i>W</i> = <i>q</i> · <i>U</i> = ${q} · 10⁻⁹ C · ${fmt(U, 0)} V = ${sci(Wj * 1e-6)} J = ${fmt(Wj, 3)} µJ</span>` };
  }
  LK.trainer({ el: "#trainer", modes: [
    { id: "efq", label: "E = F / q", gen: genEFq },
    { id: "ud", label: "Homogenes Feld E = U / d", gen: genUd },
    { id: "coul", label: "Coulomb-Gesetz", gen: genCoulomb },
    { id: "punkt", label: "Feld einer Punktladung", gen: genPoint },
    { id: "energie", label: "Arbeit und Geschwindigkeit", gen: genEnergy }
  ] });

  LK.quiz({ box: "#quizBox", bar: "#qBar", progress: "#qProgress", key: "efeld.best", n: 10, questions: [
    { q: "Wie ist die elektrische Feldstärke definiert?", o: ["E = q / F", "E = F / q", "E = F · q", "E = U · d"], a: 1, e: "Kraft auf eine Probeladung geteilt durch deren Ladung." },
    { q: "Wo beginnen elektrische Feldlinien?", o: ["An negativen Ladungen", "An positiven Ladungen", "In der Mitte zwischen zwei Ladungen", "An ungeladenen Körpern"], a: 1, e: "Sie beginnen an + und enden an −." },
    { q: "Was bedeutet es, wenn Feldlinien dicht beieinander liegen?", o: ["Das Feld ist schwach", "Das Feld ist stark", "Dort ist keine Ladung", "Die Spannung ist null"], a: 1, e: "Die Liniendichte zeigt die Feldstärke." },
    { q: "Wie sieht das Feld im Inneren eines Plattenkondensators aus?", o: ["Radial", "Homogen: parallele, gleich dichte Linien", "Es gibt dort kein Feld", "Kreisförmig"], a: 1, e: "Zwischen den Platten ist E überall gleich: E = U/d." },
    { q: "U = 1 000 V, d = 2 cm. Wie groß ist E?", o: ["500 V/m", "50 000 V/m", "20 V/m", "2 000 V/m"], a: 1, e: "E = 1 000 V / 0,02 m = 50 000 V/m." },
    { q: "Der Abstand zweier Ladungen wird verdoppelt. Wie ändert sich die Coulomb-Kraft?", o: ["Halbiert", "Bleibt gleich", "Ein Viertel", "Verdoppelt"], a: 2, e: "F ~ 1/r²: doppelter Abstand, ein Viertel der Kraft." },
    { q: "In welche Richtung wirkt die Kraft auf ein Elektron im Feld?", o: ["In Feldlinienrichtung", "Entgegen der Feldlinienrichtung", "Senkrecht zu den Feldlinien", "Gar nicht"], a: 1, e: "Feldlinien zeigen die Kraftrichtung auf positive Ladungen; Elektronen sind negativ." },
    { q: "Welche Einheit hat die elektrische Feldstärke?", o: ["V · m", "N/C (= V/m)", "C/N", "J"], a: 1, e: "1 N/C = 1 V/m." },
    { q: "Warum ist man im Auto bei Gewitter relativ sicher?", o: ["Wegen der Gummireifen", "Die Metallkarosserie wirkt als Faraday-Käfig", "Weil Autos nicht geladen sind", "Wegen der Scheiben"], a: 1, e: "Im Inneren eines Metallkäfigs ist das Feld null." },
    { q: "Können sich Feldlinien schneiden?", o: ["Ja, immer", "Nur bei zwei gleichen Ladungen", "Nein, nie", "Nur im homogenen Feld"], a: 2, e: "An jedem Punkt hat das Feld nur eine Richtung." },
    { q: "Ein Elektron durchläuft U = 100 V. Welche Energie gewinnt es?", o: ["100 J", "100 eV", "1 eV", "0,01 eV"], a: 1, e: "W = e · U = 100 eV ≈ 1,6 · 10⁻¹⁷ J." },
    { q: "Wie groß ist die Elementarladung?", o: ["1 C", "1,602 · 10⁻¹⁹ C", "9,109 · 10⁻³¹ C", "8,99 · 10⁹ C"], a: 1, e: "e = 1,602 · 10⁻¹⁹ C, die kleinste freie Ladung." },
    { q: "Zwei gleiche positive Ladungen: Wo ist das Feld genau null?", o: ["Direkt an den Ladungen", "In der Mitte zwischen ihnen", "Nirgends", "Weit draußen hinter einer Ladung"], a: 1, e: "In der Mitte heben sich die beiden Felder genau auf." }
  ] });

  LK.views(["verstehen", "feldlinien", "kondensator", "ueben", "alltag", "quiz"], { feldlinien: drawField, kondensator: drawCap });
})();
