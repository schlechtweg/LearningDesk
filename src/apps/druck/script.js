(function () {
  "use strict";
  const { $, $$, rnd, pick, fmt, numText, check } = LK;

  // ---------- piston experiment ----------
  let medium = "gas";
  const V0 = 100, P0 = 1; // 100 cm³ air at 1 bar before pushing
  function draw() {
    const F = +$("#pF").value, A = +$("#pA").value;
    $("#pFOut").textContent = `${F} N`; $("#pAOut").textContent = `${A} cm²`;
    const pNcm = F / A, pBar = pNcm / 10, pPa = pNcm * 10000;
    const V = medium === "gas" ? V0 * P0 / (P0 + pBar) : V0;
    const top = 40, bottom = 300, x0 = 120, w = 160;
    const fill = (bottom - top - 30) * (V / V0), pistonY = bottom - fill;
    let s = `<path class="wall" d="M${x0} ${top} V${bottom} H${x0 + w} V${top}"/>`;
    s += `<rect class="${medium === "gas" ? "gas" : "water"}" x="${x0 + 2}" y="${pistonY}" width="${w - 4}" height="${bottom - pistonY - 2}"/>`;
    // particles: gas spread through the volume, water densely packed
    const n = medium === "gas" ? 28 : 70;
    for (let i = 0; i < n; i++) {
      const fx = ((i * 37) % 97) / 97, fy = ((i * 61) % 89) / 89;
      s += `<circle class="particle" cx="${x0 + 10 + fx * (w - 20)}" cy="${pistonY + 8 + fy * (bottom - pistonY - 16)}" r="${medium === "gas" ? 3 : 2.6}"/>`;
    }
    s += `<rect class="head" x="${x0 + 3}" y="${pistonY - 12}" width="${w - 6}" height="12" rx="2"/><rect class="rod" x="${x0 + w / 2 - 5}" y="${pistonY - 60}" width="10" height="48"/>`;
    if (F > 0) s += `<path class="arrow" d="M${x0 + w / 2} ${pistonY - 100} V${pistonY - 66} M${x0 + w / 2 - 8} ${pistonY - 76} L${x0 + w / 2} ${pistonY - 66} L${x0 + w / 2 + 8} ${pistonY - 76}"/><text x="${x0 + w / 2 - 14}" y="${pistonY - 82}" text-anchor="end">F = ${F} N</text>`;
    // pressure arrows in all directions
    const cy = (pistonY + bottom) / 2, cx = x0 + w / 2, L = 6 + Math.min(26, pBar * 4);
    [[1, 0], [-1, 0], [0, 1], [0.7, 0.7], [-0.7, 0.7], [0.7, -0.7], [-0.7, -0.7]].forEach(([dx, dy]) => {
      const x1 = cx + dx * 14, y1 = cy + dy * 14, x2 = cx + dx * (14 + L), y2 = cy + dy * (14 + L);
      if (pBar > 0.05) s += `<path class="parrow" d="M${x1} ${y1} L${x2} ${y2}"/>`;
    });
    // gauges left, right, bottom show the same value
    const gauge = (gx, gy, lx, ly) => {
      const ang = Math.PI * (1 - Math.min(1, pBar / 6)), nx = gx + 18 * Math.cos(ang), ny = gy - 18 * Math.sin(ang);
      return `<line x1="${lx}" y1="${ly}" x2="${gx}" y2="${gy}" stroke="var(--ink)" stroke-width="3"/><circle class="gauge" cx="${gx}" cy="${gy}" r="24"/><line class="needle" x1="${gx}" y1="${gy}" x2="${nx}" y2="${ny}"/><text x="${gx}" y="${gy + 40}" text-anchor="middle">${fmt(pBar, 2)} bar</text>`;
    };
    s += gauge(50, Math.max(cy, top + 40), x0, Math.max(cy, top + 40)) + gauge(370, bottom - 40, x0 + w, bottom - 40);
    $("#pSvg").innerHTML = s;
    $("#pRo").innerHTML = `<dt>Druck durch den Kolben</dt><dd class="big">${fmt(pNcm, 2)} N/cm²</dd><dt>in Pascal</dt><dd>${fmt(pPa, 0)} Pa</dd><dt>in Hektopascal</dt><dd>${fmt(pPa / 100, 0)} hPa</dd><dt>in bar</dt><dd>${fmt(pBar, 2)} bar</dd><dt>Volumen</dt><dd>${fmt(V, 1)} cm³</dd>`;
    $("#pStatus").innerHTML = medium === "gas"
      ? `Luft lässt sich zusammendrücken: Das Volumen sinkt von 100 cm³ auf ${fmt(V, 1)} cm³. Die Luftteilchen rücken enger zusammen.`
      : "Wasser lässt sich praktisch nicht zusammendrücken: Das Volumen bleibt bei 100 cm³. Der Druck wird aber genauso an alle Stellen weitergegeben.";
  }
  $$("[data-medium]").forEach((b) => b.addEventListener("click", () => { medium = b.dataset.medium; $$("[data-medium]").forEach((x) => x.setAttribute("aria-pressed", String(x === b))); draw(); }));
  $("#pF").addEventListener("input", draw); $("#pA").addEventListener("input", draw);

  // ---------- trainer ----------
  const unit = (u) => `<span class="unit">${u}</span>`;
  function genP() {
    const F = pick([50, 80, 120, 150, 200, 240, 300, 360, 450, 600, 900, 1200]), A = pick([2, 3, 4, 5, 6, 8, 10, 12, 15, 20, 25, 30]);
    const asBar = Math.random() < 0.5, pNcm = F / A, ans = asBar ? pNcm / 10 : pNcm;
    return { html: `Auf einen Kolben mit der Fläche <b>A = ${A} cm²</b> wirkt die Kraft <b>F = ${F} N</b>. Wie groß ist der Druck${asBar ? " in bar" : ""}?`,
      label: `<i>p</i> =`, placeholder: asBar ? "in bar" : "in N/cm²", answer: numText(ans, 3), check: check.num(ans, { tol: 0.01 }),
      hint: `Einheit: ${asBar ? "bar (1 N/cm² = 0,1 bar)" : "N/cm²"}`,
      solution: `<span class="math"><i>p</i> = <i>F</i> : <i>A</i> = ${F} N : ${A} cm² = ${fmt(pNcm, 3)} N/cm²</span>${asBar ? ` = ${fmt(ans, 3)} bar` : ""}` };
  }
  function genF() {
    const pBar = pick([1.5, 2, 2.5, 3, 4, 5, 6, 8, 10]), A = pick([2, 4, 5, 8, 10, 12, 20, 25]);
    const F = pBar * 10 * A;
    return { html: `In einem Zylinder herrscht der Druck <b>p = ${fmt(pBar, 1)} bar</b>. Mit welcher Kraft drückt er auf einen Kolben mit <b>A = ${A} cm²</b>?`,
      label: "<i>F</i> =", placeholder: "in N", answer: numText(F, 1), check: check.num(F), hint: "Einheit: N. Tipp: 1 bar = 10 N/cm².",
      solution: `<span class="math">${fmt(pBar, 1)} bar = ${fmt(pBar * 10, 1)} N/cm²</span>, also <span class="math"><i>F</i> = <i>p</i> · <i>A</i> = ${fmt(pBar * 10, 1)} N/cm² · ${A} cm² = ${fmt(F, 1)} N</span>` };
  }
  function genA() {
    const F = pick([100, 200, 300, 400, 500, 600, 800, 1000]), pNcm = pick([5, 10, 20, 25, 40, 50]);
    const A = F / pNcm;
    return { html: `Eine Kraft von <b>F = ${F} N</b> soll den Druck <b>p = ${pNcm} N/cm²</b> erzeugen. Wie groß muss die Kolbenfläche sein?`,
      label: "<i>A</i> =", placeholder: "in cm²", answer: numText(A, 2), check: check.num(A), hint: "Einheit: cm²",
      solution: `<span class="math"><i>A</i> = <i>F</i> : <i>p</i> = ${F} N : ${pNcm} N/cm² = ${fmt(A, 2)} cm²</span>` };
  }
  function genConvert() {
    const kinds = [
      () => { const b = pick([0.5, 1, 1.5, 2, 2.5, 3.2, 4, 6]); return { q: `${fmt(b, 1)} bar in hPa`, a: b * 1000, u: "hPa", s: `1 bar = 1 000 hPa, also ${fmt(b, 1)} · 1 000 = ${fmt(b * 1000, 0)} hPa` }; },
      () => { const h = pick([980, 1013, 1020, 1500, 2500, 500]); return { q: `${fmt(h, 0)} hPa in bar`, a: h / 1000, u: "bar", s: `1 000 hPa = 1 bar, also ${fmt(h, 0)} : 1 000 = ${fmt(h / 1000, 3)} bar` }; },
      () => { const b = pick([1, 2, 2.5, 5, 0.8]); return { q: `${fmt(b, 1)} bar in Pa`, a: b * 100000, u: "Pa", s: `1 bar = 100 000 Pa, also ${fmt(b * 100000, 0)} Pa` }; },
      () => { const n = pick([2, 5, 12, 30, 45]); return { q: `${n} N/cm² in bar`, a: n / 10, u: "bar", s: `1 N/cm² = 0,1 bar, also ${n} · 0,1 = ${fmt(n / 10, 1)} bar` }; },
      () => { const c = pick([500, 2500, 10000, 35000, 150]); return { q: `${fmt(c, 0)} cm² in m²`, a: c / 10000, u: "m²", s: `1 m² = 10 000 cm², also ${fmt(c, 0)} : 10 000 = ${fmt(c / 10000, 4)} m²` }; }
    ];
    const k = pick(kinds)();
    return { html: `Rechne um: <b>${k.q}</b>`, label: "=", placeholder: `in ${k.u}`, answer: numText(k.a, 4), check: check.num(k.a), hint: `Einheit: ${k.u}`, solution: k.s };
  }
  LK.trainer({ el: "#trainer", modes: [
    { id: "p", label: "Druck berechnen", gen: genP },
    { id: "F", label: "Kraft berechnen", gen: genF },
    { id: "A", label: "Fläche berechnen", gen: genA },
    { id: "u", label: "Einheiten umrechnen", gen: genConvert }
  ] });

  LK.quiz({ box: "#quizBox", bar: "#qBar", progress: "#qProgress", key: "druck.best", n: 10, questions: [
    { q: "Wie lautet die Formel für den Druck?", o: ["p = F · A", "p = F : A", "p = A : F", "p = F + A"], a: 1, e: "Druck ist Kraft pro Fläche: p = F / A." },
    { q: "Wie viel Pascal sind 1 bar?", o: ["100 Pa", "1 000 Pa", "100 000 Pa", "10 Pa"], a: 2, e: "1 bar = 1 000 hPa = 100 000 Pa." },
    { q: "Warum sinkt man mit Schneeschuhen weniger ein?", o: ["Weil man leichter ist", "Weil die Kraft auf eine größere Fläche verteilt wird", "Weil Schnee härter wird", "Weil der Luftdruck steigt"], a: 1, e: "Gleiche Gewichtskraft, größere Fläche: kleinerer Druck." },
    { q: "Was zeigt die Spritzkugel?", o: ["Wasser spritzt nur nach unten", "Der Druck breitet sich in alle Richtungen gleich aus", "Wasser lässt sich zusammendrücken", "Der Druck ist oben am größten"], a: 1, e: "Aus allen Löchern spritzt das Wasser gleich weit: Kolbendruck wirkt überall gleich." },
    { q: "Was lässt sich gut zusammendrücken?", o: ["Wasser", "Öl", "Luft", "Quecksilber"], a: 2, e: "In Gasen haben die Teilchen große Abstände." },
    { q: "F = 200 N wirkt auf A = 4 cm². Wie groß ist der Druck?", o: ["800 N/cm²", "50 N/cm²", "0,02 N/cm²", "204 N/cm²"], a: 1, e: "200 N : 4 cm² = 50 N/cm² (= 5 bar)." },
    { q: "Wie viele cm² hat 1 m²?", o: ["100", "1 000", "10 000", "1 000 000"], a: 2, e: "100 cm · 100 cm = 10 000 cm²." },
    { q: "Eine Reißzwecke dringt leicht ins Holz, weil …", o: ["die Spitze eine sehr kleine Fläche hat", "der Daumen sehr stark ist", "Holz weich ist", "der Kopf groß ist"], a: 0, e: "Kleine Fläche an der Spitze bedeutet sehr großen Druck." },
    { q: "Wie groß ist der Luftdruck auf Meereshöhe ungefähr?", o: ["1 Pa", "1 bar", "100 bar", "0,1 bar"], a: 1, e: "Etwa 1 013 hPa, also rund 1 bar." },
    { q: "Man verdoppelt die Kraft auf einen Kolben. Was passiert mit dem Druck?", o: ["Er halbiert sich", "Er bleibt gleich", "Er verdoppelt sich", "Er vervierfacht sich"], a: 2, e: "p = F/A: doppelte Kraft, doppelter Druck." },
    { q: "Man verdoppelt die Kolbenfläche bei gleicher Kraft. Was passiert?", o: ["Der Druck halbiert sich", "Der Druck verdoppelt sich", "Nichts", "Die Kraft halbiert sich"], a: 0, e: "Größere Fläche, kleinerer Druck." },
    { q: "1 N/cm² sind …", o: ["1 Pa", "100 Pa", "10 000 Pa", "1 bar"], a: 2, e: "1 N auf 1 cm² = 10 000 N auf 1 m² = 10 000 Pa." }
  ] });

  LK.views(["verstehen", "versuch", "ueben", "alltag", "quiz"], { versuch: draw });
})();
