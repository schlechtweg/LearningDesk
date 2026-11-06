(function () {
  "use strict";
  const { $, $$, pick, rnd, fmt } = LK;

  // ---------- probability input: 0,25 | 1/4 | 25 % ----------
  function parseP(raw) {
    const t = String(raw).trim().replace(/\s+/g, "");
    if (/%$/.test(t)) { const v = LK.parseNum(t.slice(0, -1)); return isNaN(v) ? NaN : v / 100; }
    return LK.parseNum(t);
  }
  const checkP = (p, tol = 0.006) => (raw) => { const v = parseP(raw); if (isNaN(v)) return { ok: false, msg: "Gib eine Zahl ein, z. B. <code>0,25</code>, <code>1/4</code> oder <code>25 %</code>." }; return Math.abs(v - p) <= tol ? { ok: true } : { ok: false, msg: "Noch nicht. Rechne Anzahl : Gesamtzahl." }; };
  const pc = (v, d = 1) => fmt(v * 100, d) + " %";

  // ---------- simulation ----------
  const EXP = [
    { name: "Münze", out: [["Kopf", 1 / 2], ["Zahl", 1 / 2]] },
    { name: "Würfel", out: [1, 2, 3, 4, 5, 6].map((k) => [String(k), 1 / 6]) },
    { name: "Glücksrad (rot ½, blau ⅓, gelb ⅙)", out: [["rot", 1 / 2], ["blau", 1 / 3], ["gelb", 1 / 6]] },
    { name: "Reißzwecke (geheim)", hidden: true, make: () => { const p = 0.55 + Math.random() * 0.15; return [["Kopf", p], ["Seite", 1 - p]]; } },
    { name: "Kronkorken (geheim)", hidden: true, make: () => { const p = 0.3 + Math.random() * 0.15; return [["Zacken oben", p], ["Zacken unten", 1 - p]]; } }
  ];
  $("#eSel").innerHTML = EXP.map((e, i) => `<option value="${i}">${e.name}</option>`).join("");
  let cur, outs, counts, n, hist, revealed, last;
  function reset() {
    cur = EXP[+$("#eSel").value];
    outs = cur.make ? cur.make() : cur.out;
    counts = outs.map(() => 0); n = 0; hist = []; revealed = !cur.hidden; last = [];
    $("#oSel").innerHTML = outs.map((o, i) => `<option value="${i}">${o[0]}</option>`).join("");
    $("#eReveal").hidden = !cur.hidden;
    draw();
  }
  function once() {
    let u = Math.random(), i = 0;
    while (i < outs.length - 1 && u >= outs[i][1]) { u -= outs[i][1]; i++; }
    counts[i]++; n++;
    last.push(outs[i][0]); if (last.length > 12) last.shift();
    hist.push(counts.map((c) => c / n));
  }
  function draw() {
    const o = +$("#oSel").value || 0;
    const X0 = 46, X1 = 445, Y0 = 245, Y1 = 20;
    const N = Math.max(10, n);
    const X = (i) => X0 + (i / N) * (X1 - X0), Y = (v) => Y0 - v * (Y0 - Y1);
    let s = "";
    for (let v = 0; v <= 1.0001; v += 0.25) s += `<line class="gl" x1="${X0}" y1="${Y(v)}" x2="${X1}" y2="${Y(v)}"/><text x="${X0 - 6}" y="${Y(v) + 4}" text-anchor="end">${fmt(v, 2)}</text>`;
    s += `<line class="ax" x1="${X0}" y1="${Y0}" x2="${X1}" y2="${Y0}"/><line class="ax" x1="${X0}" y1="${Y0}" x2="${X0}" y2="${Y1}"/>`;
    s += `<text x="${X1}" y="${Y0 + 18}" text-anchor="end">Anzahl der Versuche n = ${n}</text><text class="lab" x="${X0 + 6}" y="${Y1 - 4}">relative Häufigkeit von „${outs[o][0]}“</text>`;
    if (revealed) s += `<line class="pl" x1="${X0}" y1="${Y(outs[o][1])}" x2="${X1}" y2="${Y(outs[o][1])}"/><text x="${X1}" y="${Y(outs[o][1]) - 5}" text-anchor="end" style="fill: var(--bad)">P = ${fmt(outs[o][1], 3)}</text>`;
    if (n) {
      const step = Math.max(1, Math.floor(n / 400)), pts = [];
      for (let i = 0; i < n; i += step) pts.push(`${X(i + 1).toFixed(1)},${Y(hist[i][o]).toFixed(1)}`);
      pts.push(`${X(n).toFixed(1)},${Y(hist[n - 1][o]).toFixed(1)}`);
      s += `<polyline class="ln" points="${pts.join(" ")}"/>`;
    }
    $("#cSvg").innerHTML = s;
    const h = n ? counts[o] / n : 0;
    $("#eRo").innerHTML = `<dt>Versuche n</dt><dd>${n}</dd><dt>absolute Häufigkeit k</dt><dd>${counts[o]}</dd><dt>relative Häufigkeit</dt><dd class="big">${n ? fmt(h, 3) : "–"}</dd>` + (revealed ? `<dt>Wahrscheinlichkeit P</dt><dd>${fmt(outs[o][1], 3)}</dd>` : `<dt>Schätzwert für P</dt><dd>${n >= 500 ? "≈ " + fmt(h, 2) : "mehr Versuche!"}</dd>`);
    $("#eTab").innerHTML = `<table class="data"><tr><th>Ergebnis</th>${outs.map((x) => `<th>${x[0]}</th>`).join("")}</tr><tr><td>absolut</td>${counts.map((c) => `<td class="num">${c}</td>`).join("")}</tr><tr><td>relativ</td>${counts.map((c) => `<td class="num">${n ? fmt(c / n, 3) : "–"}</td>`).join("")}</tr>${revealed ? `<tr><td>Wahrscheinlichkeit</td>${outs.map((x) => `<td class="num">${fmt(x[1], 3)}</td>`).join("")}</tr>` : ""}</table>`;
    $("#eLast").textContent = last.length ? "Letzte Ergebnisse: " + last.join(", ") : "";
  }
  $$("[data-n]").forEach((b) => b.addEventListener("click", () => { for (let k = 0; k < +b.dataset.n; k++) once(); draw(); }));
  $("#eReset").addEventListener("click", reset);
  $("#eReveal").addEventListener("click", () => { revealed = true; draw(); });
  $("#eSel").addEventListener("change", reset);
  $("#oSel").addEventListener("change", draw);
  reset();

  // ---------- trainer ----------
  const THINGS = [["Würfel", "eine 6"], ["Münze", "Kopf"], ["Reißzwecke", "Kopflage"], ["Glücksrad", "Rot"], ["Basketballwurf", "einen Treffer"], ["Kronkorken", "„Zacken oben“"]];
  function genRel() {
    const [th, ev] = pick(THINGS), n = pick([20, 25, 40, 50, 80, 100, 200, 250, 400, 500]), k = rnd(1, n - 1);
    return { html: `Bei <b>${n}</b> Versuchen mit ${th === "Basketballwurf" ? "Basketballwürfen" : `einem ${th}`} gab es <b>${k}</b>-mal ${ev}. Wie groß ist die relative Häufigkeit?`,
      label: "<i>h</i> =", placeholder: "z. B. 0,25 oder 25 %", answer: fmt(k / n, 4), check: checkP(k / n, 0.0006),
      solution: `<span class="math"><i>h</i> = ${k} : ${n} = <b>${fmt(k / n, 4)}</b> = ${pc(k / n, 2)}</span>` };
  }
  function genAbs() {
    const n = pick([50, 100, 200, 400, 500, 800, 1000]), hp = pick([5, 10, 12, 15, 20, 24, 25, 30, 35, 40, 45, 60, 65, 75]);
    const k = n * hp / 100;
    if (!Number.isInteger(k)) return genAbs();
    return { html: `Bei <b>${n}</b> Würfen einer Reißzwecke lag sie in <b>${hp} %</b> der Fälle auf der Seite. Wie oft war das?`, label: "<i>k</i> =", placeholder: "Anzahl", answer: String(k), check: LK.check.num(k, { abs: 0.5 }),
      solution: `<span class="math"><i>k</i> = ${n} · ${fmt(hp / 100, 2)} = <b>${k}</b></span>` };
  }
  function genExp() {
    const T = pick([["einem Würfel eine 6", 1 / 6, [300, 600, 1200, 900]], ["einer Münze Kopf", 1 / 2, [100, 300, 500, 1000]], ["einem Würfel eine gerade Zahl", 1 / 2, [200, 400, 700]],
      ["einer Reißzwecke Kopf (Schätzwert 0,6)", 0.6, [50, 200, 500]], ["einem Glücksrad Gelb (P = ⅙)", 1 / 6, [60, 120, 600]], ["einem Würfel eine Zahl kleiner 3", 1 / 3, [150, 300, 900]]]);
    const n = pick(T[2]), e = n * T[1];
    return { html: `Wie oft erwartest du bei <b>${n}</b> Versuchen mit ${T[0]}?`, label: "etwa", placeholder: "Anzahl", answer: fmt(e, 0), check: LK.check.num(e, { abs: 0.5 }),
      solution: `<span class="math">${n} · ${T[1] === 0.6 ? "0,6" : fmt(T[1], 4)} ≈ <b>${fmt(e, 0)}</b></span>-mal (ungefähr, nicht genau)` };
  }
  function genEvent() {
    const T = pick([["Augenzahl größer als 4", 2], ["gerade Augenzahl", 3], ["Augenzahl ist eine Primzahl", 3], ["Augenzahl höchstens 2", 2], ["Augenzahl mindestens 3", 4], ["Augenzahl durch 3 teilbar", 2], ["Augenzahl ist 7", 0], ["Augenzahl kleiner als 7", 6]]);
    const sets = { "Augenzahl größer als 4": "{5; 6}", "gerade Augenzahl": "{2; 4; 6}", "Augenzahl ist eine Primzahl": "{2; 3; 5}", "Augenzahl höchstens 2": "{1; 2}", "Augenzahl mindestens 3": "{3; 4; 5; 6}", "Augenzahl durch 3 teilbar": "{3; 6}", "Augenzahl ist 7": "{ } (unmögliches Ereignis)", "Augenzahl kleiner als 7": "{1; 2; 3; 4; 5; 6} (sicheres Ereignis)" };
    return { html: `Würfelwurf: Aus wie vielen Ergebnissen besteht das Ereignis „${T[0]}“?`, label: "Anzahl:", placeholder: "Zahl", answer: String(T[1]), check: LK.check.num(T[1], { abs: 0.1 }), solution: `<span class="math">${sets[T[0]]}</span>: <b>${T[1]}</b> Ergebnis${T[1] === 1 ? "" : "se"}` };
  }
  LK.trainer({ el: "#trainer", modes: [
    { id: "relativ", label: "Relative Häufigkeit", gen: genRel },
    { id: "absolut", label: "Absolute Häufigkeit", gen: genAbs },
    { id: "erwartung", label: "Wie oft etwa?", gen: genExp },
    { id: "ereignis", label: "Ereignisse", gen: genEvent }
  ] });

  // ---------- quiz ----------
  LK.quiz({ box: "#quizBox", bar: "#qBar", progress: "#qProgress", key: "zufall.best", n: 10, questions: [
    { q: "Was ist ein Zufallsexperiment?", o: ["Ein Versuch mit vorher bekanntem Ausgang", "Ein Versuch mit bekannten möglichen Ergebnissen, aber unvorhersehbarem Ausgang", "Jedes Experiment im Physikunterricht", "Ein Spiel mit Gewinn"], a: 1, e: "Man kennt die möglichen Ergebnisse, nicht aber das nächste." },
    { q: "Bei 50 Würfen kam 12-mal die 6. Relative Häufigkeit?", o: ["12", "0,12", "0,24", "0,6"], a: 2, e: "12 : 50 = 0,24." },
    { q: "Was besagt das Gesetz der großen Zahlen?", o: ["Große Zahlen kommen häufiger", "Bei vielen Versuchen stabilisiert sich die relative Häufigkeit", "Nach vielen Würfen kommt jede Zahl gleich oft", "Wahrscheinlichkeiten sind immer groß"], a: 1, e: "Der stabile Wert ist ein guter Schätzwert für die Wahrscheinlichkeit." },
    { q: "Eine Münze zeigte fünfmal hintereinander Kopf. Wie groß ist die Wahrscheinlichkeit für Kopf beim nächsten Wurf?", o: ["kleiner als ½", "½", "größer als ½", "0"], a: 1, e: "Die Münze hat kein Gedächtnis." },
    { q: "Welche Zahl kann keine Wahrscheinlichkeit sein?", o: ["0", "0,5", "1", "1,2"], a: 3, e: "Wahrscheinlichkeiten liegen zwischen 0 und 1." },
    { q: "Ergebnismenge beim Würfeln?", o: ["{6}", "{1; 2; 3; 4; 5; 6}", "{gerade; ungerade}", "{1; 6}"], a: 1, e: "Alle möglichen Ergebnisse." },
    { q: "Was ist das Ereignis „gerade Zahl“ beim Würfeln?", o: ["{2; 4; 6}", "{1; 3; 5}", "{2; 4}", "{6}"], a: 0, e: "Alle geraden Augenzahlen." },
    { q: "Wie oft erwartest du bei 600 Würfen ungefähr eine 6?", o: ["6-mal", "60-mal", "100-mal", "300-mal"], a: 2, e: "600 · ⅙ = 100." },
    { q: "Wie bestimmt man die Wahrscheinlichkeit, dass eine Reißzwecke auf dem Kopf landet?", o: ["Man rechnet ½", "Durch eine lange Versuchsreihe", "Das geht gar nicht", "Man fragt den Hersteller"], a: 1, e: "Die relative Häufigkeit nach vielen Würfen ist ein Schätzwert." },
    { q: "Ein Ereignis, das nie eintreten kann, heißt …", o: ["sicheres Ereignis", "unmögliches Ereignis", "Gegenereignis", "Ergebnis"], a: 1, e: "Seine Wahrscheinlichkeit ist 0." },
    { q: "Relative Häufigkeit 0,35 bei 200 Versuchen. Absolute Häufigkeit?", o: ["35", "70", "135", "0,7"], a: 1, e: "200 · 0,35 = 70." },
    { q: "Was ergeben die Wahrscheinlichkeiten aller Ergebnisse zusammen?", o: ["0", "1", "100", "Das hängt vom Experiment ab"], a: 1, e: "Eines der Ergebnisse tritt sicher ein." }
  ] });

  LK.views(["verstehen", "versuch", "ueben", "alltag", "quiz"], { versuch: draw });
})();
