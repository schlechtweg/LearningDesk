(function () {
  "use strict";
  const { $, $$, pick, fmt, numText, check } = LK;
  const P0 = 1013.25;
  // international standard atmosphere, valid in the troposphere (up to 11 km)
  const pressure = (h) => P0 * Math.pow(1 - 0.0065 * h / 288.15, 5.255);
  // boiling point of water from the Clausius-Clapeyron relation
  const boiling = (p) => 1 / (1 / 373.15 - (8.314 / 40650) * Math.log(p / P0)) - 273.15;
  const PLACES = [["Meer", 0], ["Brocken", 1141], ["Zugspitze", 2962], ["Mont Blanc", 4806], ["Mount Everest", 8849], ["Flugzeug", 10500]];

  // ---------- altitude journey ----------
  $("#aPresets").innerHTML = PLACES.map(([n, h]) => `<button type="button" data-h="${h}">${n}</button>`).join("");
  $$("#aPresets button").forEach((b) => b.addEventListener("click", () => { $("#aH").value = b.dataset.h; draw(); }));
  function draw() {
    const h = +$("#aH").value, p = pressure(h), tb = boiling(p), rel = p / P0 * 100;
    $("#aHOut").textContent = `${fmt(h, 0)} m`;
    const X0 = 50, X1 = 300, Y0 = 310, Y1 = 30, Y = (v) => Y0 - (v / 11000) * (Y0 - Y1);
    let s = `<rect class="sky" x="${X0}" y="${Y1}" width="${X1 - X0}" height="${Y0 - Y1}"/>`;
    s += `<path class="mountain" d="M${X0} ${Y0} L95 ${Y(2962)} L130 ${Y(1500)} L185 ${Y(8849)} L230 ${Y(3000)} L265 ${Y(4806)} L${X1} ${Y0} Z"/>`;
    for (let k = 0; k <= 11000; k += 2000) s += `<line x1="${X0 - 6}" y1="${Y(k)}" x2="${X0}" y2="${Y(k)}" stroke="var(--ink)"/><text x="${X0 - 9}" y="${Y(k) + 4}" text-anchor="end">${fmt(k / 1000, 0)} km</text>`;
    s += `<line class="marker" x1="${X0}" y1="${Y(h)}" x2="${X1 + 40}" y2="${Y(h)}"/><circle class="dot" cx="${X1 + 40}" cy="${Y(h)}" r="5"/>`;
    // barometer dial: 200 to 1050 hPa
    const cx = 375, cy = 110, r = 46, ang = Math.PI * (1.15 - 1.3 * (p - 200) / 850);
    s += `<circle class="dial" cx="${cx}" cy="${cy}" r="${r}"/><line class="needle" x1="${cx}" y1="${cy}" x2="${cx + (r - 8) * Math.cos(ang)}" y2="${cy - (r - 8) * Math.sin(ang)}"/>`;
    s += `<text x="${cx}" y="${cy + r + 18}" text-anchor="middle" style="fill: var(--ink)">${fmt(p, 0)} hPa</text><text x="${cx}" y="${cy + 26}" text-anchor="middle">Barometer</text>`;
    $("#aSvg").innerHTML = s;
    $("#aRo").innerHTML = `<dt>Luftdruck</dt><dd class="big">${fmt(p, 0)} hPa</dd><dt>im Vergleich zum Meer</dt><dd>${fmt(rel, 0)} %</dd><dt>Abnahme seit Meereshöhe</dt><dd>${fmt(P0 - p, 0)} hPa</dd><dt>Wasser siedet bei</dt><dd class="big">${fmt(tb, 1)} °C</dd><dt>Sauerstoff pro Atemzug</dt><dd>${fmt(rel, 0)} %</dd>`;
    const place = PLACES.find(([, ph]) => ph === h);
    $("#aStatus").innerHTML = h === 0 ? "Auf Meereshöhe: Normaldruck 1 013 hPa, Wasser siedet bei 100 °C."
      : `${place ? `<strong>${place[0]}</strong>: ` : ""}Der Luftdruck ist um ${fmt(100 - rel, 0)} % gesunken. Wasser kocht schon bei ${fmt(tb, 0)} °C, Nudeln brauchen deshalb länger.${h > 7000 ? " Ohne zusätzlichen Sauerstoff ist der Aufenthalt hier lebensgefährlich." : h > 2500 ? " Viele Menschen spüren hier schon Kopfschmerzen oder Atemnot (Höhenkrankheit)." : ""}${h > 10000 ? " Flugzeugkabinen werden deshalb auf etwa 750 hPa „aufgepumpt“." : ""}`;
  }
  $("#aH").addEventListener("input", draw);

  // ---------- trainer ----------
  function genForce() {
    const items = [["eine Tischplatte", 1.2, "m²"], ["eine Tür", 1.8, "m²"], ["ein Fenster", 0.75, "m²"], ["deine Handfläche", 150, "cm²"], ["ein Heft", 600, "cm²"], ["einen Saugnapf", 20, "cm²"]];
    const [what, A, u] = pick(items), p = pick([980, 1000, 1013, 1020]);
    const Am2 = u === "m²" ? A : A / 10000, F = p * 100 * Am2;
    return { html: `Der Luftdruck beträgt <b>${fmt(p, 0)} hPa</b>. Mit welcher Kraft drückt die Luft auf ${what} mit <b>A = ${fmt(A, 2)} ${u}</b>?`,
      label: "<i>F</i> =", placeholder: "in N", answer: numText(F, 1), check: check.num(F), hint: "Einheit: N. 1 hPa = 100 Pa, 1 m² = 10 000 cm².",
      solution: `<span class="math">${fmt(p, 0)} hPa = ${fmt(p * 100, 0)} Pa</span>${u === "cm²" ? `, <span class="math">${fmt(A, 0)} cm² = ${fmt(Am2, 4)} m²</span>` : ""}. <span class="math"><i>F</i> = <i>p</i> · <i>A</i> = ${fmt(p * 100, 0)} Pa · ${fmt(Am2, 4)} m² = ${fmt(F, 1)} N</span>` };
  }
  function genRule() {
    const p0 = pick([1013, 1010, 1020, 1005]), h = pick([80, 160, 240, 320, 400, 480, 560, 800]);
    const p = p0 - h / 8;
    return { html: `Unten am Turm zeigt das Barometer <b>${fmt(p0, 0)} hPa</b>. Welcher Luftdruck herrscht <b>${h} m</b> höher? Nutze die Faustregel „1 hPa pro 8 m“.`,
      label: "<i>p</i> =", placeholder: "in hPa", answer: numText(p, 1), check: check.num(p, { abs: 0.6 }), hint: "Einheit: hPa",
      solution: `Abnahme: <span class="math">${h} m : 8 m = ${fmt(h / 8, 1)} hPa</span>. <span class="math"><i>p</i> = ${fmt(p0, 0)} − ${fmt(h / 8, 1)} = ${fmt(p, 1)} hPa</span>` };
  }
  function genHeight() {
    const dp = pick([5, 10, 15, 20, 25, 30, 40, 50]);
    const h = dp * 8;
    return { html: `Auf dem Weg vom Tal auf einen Hügel sinkt der Luftdruck um <b>${dp} hPa</b>. Wie viele Meter bist du ungefähr hinaufgestiegen? (Faustregel: 1 hPa pro 8 m)`,
      label: "<i>h</i> =", placeholder: "in m", answer: String(h), check: check.num(h), hint: "Einheit: m",
      solution: `<span class="math"><i>h</i> = ${dp} · 8 m = ${h} m</span>` };
  }
  function genConvert() {
    const kinds = [
      () => { const v = pick([1013, 990, 1025, 850, 500]); return { q: `${fmt(v, 0)} hPa in Pa`, a: v * 100, u: "Pa", s: `1 hPa = 100 Pa: ${fmt(v * 100, 0)} Pa` }; },
      () => { const v = pick([1013, 990, 1025, 700]); return { q: `${fmt(v, 0)} hPa in bar`, a: v / 1000, u: "bar", s: `1 000 hPa = 1 bar: ${fmt(v / 1000, 3)} bar` }; },
      () => { const v = pick([101300, 95000, 70000, 30000]); return { q: `${fmt(v, 0)} Pa in hPa`, a: v / 100, u: "hPa", s: `100 Pa = 1 hPa: ${fmt(v / 100, 0)} hPa` }; },
      () => { const v = pick([760, 750, 740, 380]); const a = v / 760 * 1013.25; return { q: `${v} mm Quecksilbersäule in hPa (760 mm ≙ 1 013,25 hPa)`, a, u: "hPa", s: `<span class="math">${v} : 760 · 1 013,25 = ${fmt(a, 1)} hPa</span>` }; }
    ];
    const k = pick(kinds)();
    return { html: `Rechne um: <b>${k.q}</b>`, label: "=", placeholder: `in ${k.u}`, answer: numText(k.a, 3), check: check.num(k.a), hint: `Einheit: ${k.u}`, solution: k.s };
  }
  LK.trainer({ el: "#trainer", modes: [
    { id: "kraft", label: "Kraft durch Luftdruck", gen: genForce },
    { id: "regel", label: "Druck in der Höhe", gen: genRule },
    { id: "hoehe", label: "Höhe aus Druckänderung", gen: genHeight },
    { id: "u", label: "Einheiten umrechnen", gen: genConvert }
  ] });

  LK.quiz({ box: "#quizBox", bar: "#qBar", progress: "#qProgress", key: "luftdruck.best", n: 10, questions: [
    { q: "Wie groß ist der mittlere Luftdruck auf Meereshöhe?", o: ["1 013 Pa", "1 013 hPa", "10 bar", "100 hPa"], a: 1, e: "1 013 hPa ≈ 1 bar." },
    { q: "Wie verändert sich der Luftdruck, wenn man auf einen Berg steigt?", o: ["Er steigt", "Er sinkt", "Er bleibt gleich", "Er wird null"], a: 1, e: "Über einem ist weniger Luft." },
    { q: "Was zeigt der Versuch mit den Magdeburger Halbkugeln?", o: ["Luft ist leicht", "Der äußere Luftdruck kann enorme Kräfte ausüben", "Pferde sind schwach", "Metall ist magnetisch"], a: 1, e: "Ohne Luft innen drückt nur noch die äußere Luft, mit großer Kraft." },
    { q: "Warum funktioniert ein Trinkhalm?", o: ["Der Mund saugt das Getränk", "Der äußere Luftdruck drückt das Getränk hoch", "Das Getränk ist leichter als Luft", "Wegen der Schwerkraft"], a: 1, e: "Im Mund ist der Druck kleiner, der Luftdruck außen drückt nach." },
    { q: "Faustregel: Um wie viel sinkt der Luftdruck nahe am Boden pro 8 m Höhe?", o: ["1 Pa", "1 hPa", "1 bar", "10 hPa"], a: 1, e: "Etwa 1 hPa pro 8 m." },
    { q: "Bei welcher Temperatur kocht Wasser auf einem hohen Berg?", o: ["über 100 °C", "genau bei 100 °C", "unter 100 °C", "gar nicht"], a: 2, e: "Bei geringerem Luftdruck siedet Wasser früher, auf der Zugspitze bei etwa 90 °C." },
    { q: "Womit misst man den Luftdruck?", o: ["Thermometer", "Barometer", "Tachometer", "Hygrometer"], a: 1, e: "Zum Beispiel mit einem Dosenbarometer." },
    { q: "Was bedeutet ein „H“ auf der Wetterkarte?", o: ["Hitze", "Hochdruckgebiet, meist schönes Wetter", "Hagel", "Hurrikan"], a: 1, e: "Hoher Luftdruck bringt meist trockenes Wetter." },
    { q: "Warum werden wir vom Luftdruck nicht zerdrückt?", o: ["Weil er sehr klein ist", "Weil er von allen Seiten wirkt und innen derselbe Druck herrscht", "Weil wir schwer sind", "Weil Luft nichts wiegt"], a: 1, e: "Die Kräfte heben sich auf." },
    { q: "Mit welcher Kraft drückt die Luft auf 1 m²?", o: ["etwa 100 N", "etwa 1 000 N", "etwa 100 000 N", "etwa 1 N"], a: 2, e: "101 300 Pa · 1 m² ≈ 101 300 N, die Gewichtskraft von über 10 t." },
    { q: "Wie viel Pa sind 1 013 hPa?", o: ["10,13 Pa", "1 013 Pa", "101 300 Pa", "1,013 Pa"], a: 2, e: "1 hPa = 100 Pa." },
    { q: "Eine verschlossene Chipstüte nimmt man mit auf einen Berg. Was passiert?", o: ["Sie wird flach", "Sie bläht sich auf", "Nichts", "Sie platzt sofort"], a: 1, e: "Außen ist der Druck kleiner, die Luft in der Tüte dehnt sich aus." }
  ] });

  LK.views(["verstehen", "hoehe", "ueben", "quiz"], { hoehe: draw });
})();
