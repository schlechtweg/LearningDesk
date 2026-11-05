(function () {
  "use strict";
  const { $, pick, fmt, numText, check } = LK;

  // ---------- hydraulic lift ----------
  function draw() {
    const F1 = +$("#hF1").value, A1 = +$("#hA1").value, A2 = +$("#hA2").value, s1 = +$("#hS1").value;
    $("#hF1Out").textContent = `${F1} N`; $("#hA1Out").textContent = `${A1} cm²`; $("#hA2Out").textContent = `${A2} cm²`; $("#hS1Out").textContent = `${s1} cm`;
    const p = F1 / A1, F2 = p * A2, s2 = s1 * A1 / A2;
    // widths scale with sqrt of the area (round pistons seen from the side)
    const w1 = 10 + Math.sqrt(A1) * 6, w2 = 30 + Math.sqrt(A2) * 7.5;
    const x1 = 110, x2 = 290, base = 250, top = 60, scale = 3;
    const y1 = 120 + s1 * scale, y2 = 120 - Math.min(60, s2 * scale);
    let s = `<path class="oil" d="M${x1 - w1 / 2} ${y1} H${x1 + w1 / 2} V${base - 30} H${x2 - w2 / 2} V${y2} H${x2 + w2 / 2} V${base} H${x1 - w1 / 2} Z"/>`;
    s += `<path class="wall" d="M${x1 - w1 / 2} ${top} V${base} H${x2 + w2 / 2} V${top} M${x1 + w1 / 2} ${top} V${base - 30} H${x2 - w2 / 2} V${top}"/>`;
    s += `<rect class="piston" x="${x1 - w1 / 2 + 2}" y="${y1 - 10}" width="${w1 - 4}" height="10"/><rect class="piston" x="${x2 - w2 / 2 + 2}" y="${y2 - 10}" width="${w2 - 4}" height="10"/>`;
    s += `<rect class="load" x="${x2 - 40}" y="${y2 - 46}" width="80" height="36" rx="6"/><text x="${x2}" y="${y2 - 23}" text-anchor="middle" fill="#fff" style="fill:#fff">Last</text>`;
    s += `<path class="arrow a1" d="M${x1} ${y1 - 52} V${y1 - 14} M${x1 - 7} ${y1 - 23} L${x1} ${y1 - 14} L${x1 + 7} ${y1 - 23}"/><text x="${x1}" y="${top - 12}" text-anchor="middle">F₁ = ${fmt(F1, 0)} N</text>`;
    // the oil pushes the large piston up: arrow below the piston, label above the load
    s += `<path class="arrow a2" d="M${x2} ${y2 + 50} V${y2 + 4} M${x2 - 7} ${y2 + 13} L${x2} ${y2 + 4} L${x2 + 7} ${y2 + 13}"/><text x="${x2}" y="${y2 - 56}" text-anchor="middle">F₂ = ${fmt(F2, 0)} N</text>`;
    s += `<line class="dim" x1="${x1 - w1 / 2 - 30}" y1="120" x2="${x1 - w1 / 2 - 4}" y2="120"/><text x="${x1 - w1 / 2 - 34}" y="124" text-anchor="end">Start</text>`;
    s += `<text x="${(x1 + x2) / 2}" y="${base + 30}" text-anchor="middle">Druck im Öl überall: ${fmt(p, 1)} N/cm² = ${fmt(p / 10, 2)} bar</text>`;
    $("#hSvg").innerHTML = s;
    $("#hRo").innerHTML = `<dt>Druck im Öl</dt><dd>${fmt(p, 2)} N/cm²</dd><dt>Kraft am großen Kolben F₂</dt><dd class="big">${fmt(F2, 0)} N</dd><dt>Kraftverstärkung</dt><dd>${fmt(A2 / A1, 1)}-fach</dd><dt>Weg des großen Kolbens s₂</dt><dd class="big">${fmt(s2, 2)} cm</dd><dt>F₁ · s₁ und F₂ · s₂</dt><dd>${fmt(F1 * s1, 0)} = ${fmt(F2 * s2, 0)} N·cm</dd>`;
    $("#hText").innerHTML = `Die große Fläche ist <strong>${fmt(A2 / A1, 1)}-mal</strong> so groß wie die kleine. Darum ist die Kraft am großen Kolben ${fmt(A2 / A1, 1)}-mal so groß (${fmt(F2, 0)} N, das entspricht etwa ${fmt(F2 / 9.81, 0)} kg). Dafür bewegt er sich nur ${fmt(s2, 2)} cm statt ${s1} cm. Das Produkt aus Kraft und Weg bleibt gleich: Goldene Regel der Mechanik.`;
  }
  ["hF1", "hA1", "hA2", "hS1"].forEach((id) => $("#" + id).addEventListener("input", draw));

  // ---------- trainer ----------
  function genF2() {
    const A1 = pick([2, 4, 5, 8, 10]), k = pick([5, 10, 20, 25, 40, 50]), A2 = A1 * k, F1 = pick([20, 50, 80, 100, 150, 200]);
    const F2 = F1 * A2 / A1;
    return { html: `Kleiner Kolben: <b>A₁ = ${A1} cm²</b>, Kraft <b>F₁ = ${F1} N</b>. Großer Kolben: <b>A₂ = ${A2} cm²</b>. Welche Kraft wirkt auf den großen Kolben?`,
      label: "<i>F</i><sub>2</sub> =", placeholder: "in N", answer: numText(F2, 2), check: check.num(F2), hint: "Einheit: N",
      solution: `<span class="math"><i>F</i><sub>2</sub> = <i>F</i><sub>1</sub> · <i>A</i><sub>2</sub> : <i>A</i><sub>1</sub> = ${F1} N · ${A2} cm² : ${A1} cm² = ${fmt(F2, 2)} N</span>` };
  }
  function genA2() {
    const A1 = pick([2, 3, 4, 5]), F1 = pick([100, 150, 200, 250]), F2 = pick([5000, 8000, 10000, 12000, 15000, 20000]);
    const A2 = F2 * A1 / F1;
    return { html: `Mit <b>F₁ = ${F1} N</b> am kleinen Kolben (<b>A₁ = ${A1} cm²</b>) soll ein Auto mit der Gewichtskraft <b>F₂ = ${fmt(F2, 0)} N</b> gehoben werden. Wie groß muss die Fläche A₂ sein?`,
      label: "<i>A</i><sub>2</sub> =", placeholder: "in cm²", answer: numText(A2, 2), check: check.num(A2), hint: "Einheit: cm²",
      solution: `Gleicher Druck: <span class="math"><i>p</i> = ${F1} N : ${A1} cm² = ${fmt(F1 / A1, 2)} N/cm²</span>. <span class="math"><i>A</i><sub>2</sub> = <i>F</i><sub>2</sub> : <i>p</i> = ${fmt(F2, 0)} N : ${fmt(F1 / A1, 2)} N/cm² = ${fmt(A2, 2)} cm²</span>` };
  }
  function genS2() {
    const A1 = pick([2, 4, 5, 10]), k = pick([10, 20, 25, 50]), A2 = A1 * k, s1 = pick([10, 20, 25, 30, 40, 50]);
    const s2 = s1 * A1 / A2;
    return { html: `Der kleine Kolben (<b>A₁ = ${A1} cm²</b>) wird um <b>s₁ = ${s1} cm</b> hineingedrückt. Um wie viel hebt sich der große Kolben (<b>A₂ = ${A2} cm²</b>)?`,
      label: "<i>s</i><sub>2</sub> =", placeholder: "in cm", answer: numText(s2, 3), check: check.num(s2), hint: "Einheit: cm",
      solution: `Verdrängtes Öl: <span class="math"><i>A</i><sub>1</sub> · <i>s</i><sub>1</sub> = ${A1} cm² · ${s1} cm = ${A1 * s1} cm³</span>. <span class="math"><i>s</i><sub>2</sub> = ${A1 * s1} cm³ : ${A2} cm² = ${fmt(s2, 3)} cm</span>` };
  }
  function genP() {
    const A1 = pick([2, 4, 5, 8]), F1 = pick([40, 60, 100, 160, 200]);
    const pBar = F1 / A1 / 10;
    return { html: `Auf den kleinen Kolben (<b>A₁ = ${A1} cm²</b>) wirkt <b>F₁ = ${F1} N</b>. Wie groß ist der Druck im Öl in bar?`,
      label: "<i>p</i> =", placeholder: "in bar", answer: numText(pBar, 3), check: check.num(pBar), hint: "Einheit: bar (1 N/cm² = 0,1 bar)",
      solution: `<span class="math"><i>p</i> = ${F1} N : ${A1} cm² = ${fmt(F1 / A1, 2)} N/cm² = ${fmt(pBar, 3)} bar</span>` };
  }
  LK.trainer({ el: "#trainer", modes: [
    { id: "F2", label: "Kraft am großen Kolben", gen: genF2 },
    { id: "A2", label: "Kolbenfläche", gen: genA2 },
    { id: "s2", label: "Weg", gen: genS2 },
    { id: "p", label: "Druck im Öl", gen: genP }
  ] });

  LK.quiz({ box: "#quizBox", bar: "#qBar", progress: "#qProgress", key: "hydraulik.best", n: 10, questions: [
    { q: "Was ist in einer hydraulischen Anlage an beiden Kolben gleich?", o: ["Die Kraft", "Der Druck", "Der Weg", "Die Fläche"], a: 1, e: "Der Druck im Öl ist überall gleich." },
    { q: "Die große Fläche ist 30-mal so groß wie die kleine. Wie groß ist die Kraft am großen Kolben?", o: ["30-mal so groß", "30-mal so klein", "gleich groß", "900-mal so groß"], a: 0, e: "F₂ = F₁ · A₂/A₁." },
    { q: "Was gilt für den Weg des großen Kolbens?", o: ["Er ist länger", "Er ist kürzer", "Er ist gleich", "Er ist null"], a: 1, e: "Das verdrängte Volumen ist gleich: A₁·s₁ = A₂·s₂." },
    { q: "F₁ = 50 N, A₁ = 5 cm², A₂ = 100 cm². F₂ = ?", o: ["250 N", "1 000 N", "500 N", "10 000 N"], a: 1, e: "Faktor 100 : 5 = 20, also 50 N · 20 = 1 000 N." },
    { q: "Warum benutzt man Öl statt Luft?", o: ["Öl ist billiger", "Öl lässt sich kaum zusammendrücken", "Luft ist zu schwer", "Öl ist leichter"], a: 1, e: "Luft würde federn, Öl gibt den Druck direkt weiter." },
    { q: "Was besagt die Goldene Regel der Mechanik?", o: ["Kraft und Weg werden beide größer", "Was man an Kraft spart, muss man an Weg zusetzen", "Energie entsteht aus dem Nichts", "Der Weg ist immer gleich"], a: 1, e: "F₁ · s₁ = F₂ · s₂." },
    { q: "Welches Gerät arbeitet hydraulisch?", o: ["Fahrradklingel", "Autobremse", "Taschenlampe", "Kompass"], a: 1, e: "Bremsflüssigkeit überträgt den Druck vom Pedal zu den Rädern." },
    { q: "A₁ = 4 cm², s₁ = 20 cm, A₂ = 80 cm². s₂ = ?", o: ["1 cm", "4 cm", "400 cm", "0,25 cm"], a: 0, e: "4 · 20 = 80 cm³, 80 cm³ : 80 cm² = 1 cm." },
    { q: "Was passiert, wenn Luft in die Bremsleitung gelangt?", o: ["Die Bremse wird stärker", "Die Bremse wird schwammig", "Nichts", "Die Bremse wird heiß"], a: 1, e: "Die Luft lässt sich zusammendrücken, ein Teil des Pedalwegs geht verloren." },
    { q: "Wie hängt die Kraftverstärkung von den Flächen ab?", o: ["Sie ist A₂ : A₁", "Sie ist A₁ : A₂", "Sie ist A₁ + A₂", "Sie hängt nicht von den Flächen ab"], a: 0, e: "F₂ : F₁ = A₂ : A₁." },
    { q: "Ein Wagenheber hebt ein Auto. Was muss man dafür tun?", o: ["Einmal kurz drücken", "Oft pumpen, weil der Weg am kleinen Kolben groß ist", "Gar nichts", "Am großen Kolben ziehen"], a: 1, e: "Viele kleine Pumpstöße ergeben zusammen den langen Weg s₁." },
    { q: "F₁ = 100 N auf A₁ = 2 cm². Wie groß ist der Druck?", o: ["200 N/cm²", "50 N/cm²", "0,02 N/cm²", "102 N/cm²"], a: 1, e: "100 N : 2 cm² = 50 N/cm² = 5 bar." }
  ] });

  LK.views(["verstehen", "modell", "ueben", "quiz"], { modell: draw });
})();
