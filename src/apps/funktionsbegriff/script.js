(function () {
  "use strict";
  const { $, pick, rnd, nz, fmt } = LK;
  const F = [
    { name: "f(x) = 2x + 1", f: (x) => 2 * x + 1, word: "Verdopple die Zahl und addiere 1.", W: "alle Zahlen" },
    { name: "f(x) = x²", f: (x) => x * x, word: "Quadriere die Zahl.", W: "alle Zahlen ≥ 0" },
    { name: "f(x) = −0,5x + 3", f: (x) => -0.5 * x + 3, word: "Halbiere die Zahl, nimm das Negative und addiere 3.", W: "alle Zahlen" },
    { name: "f(x) = 6 : x", f: (x) => 6 / x, word: "Teile 6 durch die Zahl (x ≠ 0).", W: "alle Zahlen außer 0", D: "alle Zahlen außer 0" },
    { name: "f(x) = 1,5x", f: (x) => 1.5 * x, word: "Multipliziere mit 1,5 (proportional).", W: "alle Zahlen" },
    { name: "f(x) = x² − 4", f: (x) => x * x - 4, word: "Quadriere die Zahl und subtrahiere 4.", W: "alle Zahlen ≥ −4" }
  ];
  $("#fSel").innerHTML = F.map((f, i) => `<option value="${i}">${f.name}</option>`).join("");
  const X0 = 230, Y0 = 165, U = 28;
  const sx = (x) => X0 + x * U, sy = (y) => Y0 - y * U;
  function draw() {
    const fn = F[+$("#fSel").value], x = +$("#fX").value;
    $("#fXOut").textContent = fmt(x, 1);
    let s = "";
    for (let i = -7; i <= 7; i++) s += `<line class="gl" x1="${sx(i)}" y1="10" x2="${sx(i)}" y2="320"/>`;
    for (let j = -5; j <= 5; j++) s += `<line class="gl" x1="20" y1="${sy(j)}" x2="440" y2="${sy(j)}"/>`;
    s += `<line class="ax" x1="20" y1="${Y0}" x2="440" y2="${Y0}"/><line class="ax" x1="${X0}" y1="10" x2="${X0}" y2="320"/>`;
    for (let i = -7; i <= 7; i++) if (i) s += `<text x="${sx(i)}" y="${Y0 + 13}" text-anchor="middle">${i}</text>`;
    for (let j = -5; j <= 5; j++) if (j) s += `<text x="${X0 - 5}" y="${sy(j) + 4}" text-anchor="end">${j}</text>`;
    let d = "", pen = false;
    for (let k = -7.5; k <= 7.5; k += 0.05) {
      const y = fn.f(k);
      if (!isFinite(y) || Math.abs(y) > 6.5 || Math.abs(k) < 0.04 && fn.D) { pen = false; continue; }
      d += `${pen ? "L" : "M"}${sx(k).toFixed(1)} ${sy(y).toFixed(1)} `; pen = true;
    }
    s += `<path class="gr" d="${d}"/>`;
    const y = fn.f(x), ok = isFinite(y) && !(fn.D && x === 0);
    if (ok && Math.abs(y) < 6.5) s += `<line class="hl" x1="${sx(x)}" y1="${Y0}" x2="${sx(x)}" y2="${sy(y)}"/><line class="hl" x1="${X0}" y1="${sy(y)}" x2="${sx(x)}" y2="${sy(y)}"/><circle class="pt" cx="${sx(x)}" cy="${sy(y)}" r="5"/><text class="lab" x="${sx(x) + 8}" y="${sy(y) - 8}">(${fmt(x, 1)} | ${fmt(y, 2)})</text>`;
    $("#pSvg").innerHTML = s;
    $("#fRo").innerHTML = `<dt>Funktionsgleichung</dt><dd class="math">${fn.name.replace("x²", "x<sup>2</sup>")}</dd><dt>Funktionswert</dt><dd class="big">${ok ? `f(${fmt(x, 1)}) = ${fmt(y, 2)}` : "nicht definiert"}</dd><dt>Definitionsmenge</dt><dd>${fn.D || "alle Zahlen"}</dd><dt>Wertemenge</dt><dd>${fn.W}</dd>`;
    $("#fWord").innerHTML = `<strong>Wortvorschrift:</strong> ${fn.word}`;
    const xs = [-3, -2, -1, 0, 1, 2, 3];
    $("#fTab").innerHTML = `<table class="data"><tr><th><i>x</i></th>${xs.map((v) => `<td class="num">${String(v).replace("-", "−")}</td>`).join("")}</tr><tr><th><i>f</i>(<i>x</i>)</th>${xs.map((v) => `<td class="num">${fn.D && v === 0 ? "–" : fmt(fn.f(v), 2)}</td>`).join("")}</tr></table>`;
  }
  $("#fSel").addEventListener("change", draw);
  $("#fX").addEventListener("input", draw);

  LK.cards({ el: "#cards", key: "funktion.cards", items: [
    { ctx: "Einkauf", title: "Gewicht ↦ Preis", text: "Jedem Gewicht Äpfel wird sein Preis zugeordnet.", o: ["Funktion", "keine Funktion"], a: 0, e: "Zu jedem Gewicht gehört genau ein Preis." },
    { ctx: "Schule", title: "Klasse ↦ Schüler", text: "Jeder Klasse werden die Namen ihrer Schüler zugeordnet.", o: ["Funktion", "keine Funktion"], a: 1, e: "Eine Klasse hat viele Schüler: mehrere Ausgaben." },
    { ctx: "Mensch", title: "Person ↦ Geburtstag", text: "Jeder Person wird ihr Geburtsdatum zugeordnet.", o: ["Funktion", "keine Funktion"], a: 0, e: "Jede Person hat genau einen Geburtstag. Dass mehrere Personen am selben Tag Geburtstag haben, ist erlaubt." },
    { ctx: "Mathe", title: "Zahl ↦ Quadrat", text: "Jeder Zahl wird ihr Quadrat zugeordnet.", o: ["Funktion", "keine Funktion"], a: 0, e: "Genau ein Quadrat pro Zahl, auch wenn −2 und 2 beide 4 ergeben." },
    { ctx: "Mathe", title: "Zahl ↦ Wurzel (±)", text: "Jeder positiven Zahl werden die Zahlen zugeordnet, deren Quadrat sie ist (bei 9: 3 und −3).", o: ["Funktion", "keine Funktion"], a: 1, e: "Zwei Ausgaben für eine Eingabe." },
    { ctx: "Graph", title: "Ein Kreis", text: "Ein Kreis um den Ursprung im Koordinatensystem.", o: ["Graph einer Funktion", "kein Graph einer Funktion"], a: 1, e: "Eine senkrechte Linie schneidet ihn zweimal." },
    { ctx: "Wetter", title: "Uhrzeit ↦ Temperatur", text: "Jeder Uhrzeit eines Tages wird die gemessene Temperatur zugeordnet.", o: ["Funktion", "keine Funktion"], a: 0, e: "Zu jedem Zeitpunkt gibt es genau eine Temperatur." },
    { ctx: "Wetter", title: "Temperatur ↦ Uhrzeit", text: "Jeder Temperatur wird die Uhrzeit zugeordnet, zu der sie gemessen wurde.", o: ["Funktion", "keine Funktion"], a: 1, e: "Dieselbe Temperatur kann zu mehreren Uhrzeiten auftreten." }
  ] });

  // ---------- trainer ----------
  const LINS = () => { const m = nz(-4, 4), b = rnd(-6, 6); return { m, b, f: (x) => m * x + b, t: `${m === 1 ? "" : m === -1 ? "−" : String(m).replace("-", "−")}<i>x</i>${b ? (b > 0 ? " + " + b : " − " + -b) : ""}` }; };
  const neg = (v) => String(v).replace("-", "−");
  function genValue() {
    const T = pick([LINS, () => { const c = rnd(-4, 4); return { f: (x) => x * x + c, t: `<i>x</i><sup>2</sup>${c ? (c > 0 ? " + " + c : " − " + -c) : ""}` }; }])();
    const x = rnd(-5, 5), y = T.f(x);
    return { html: `<i>f</i>(<i>x</i>) = ${T.t}. Berechne <i>f</i>(${neg(x)}).`, label: "<i>f</i>(" + neg(x) + ") =", placeholder: "Zahl", answer: neg(y), check: LK.check.num(y, { abs: 1e-9 }), solution: `<b>${neg(y)}</b>` };
  }
  function genPlace() {
    const L = LINS(), x = rnd(-5, 5), y = L.f(x);
    return { html: `<i>f</i>(<i>x</i>) = ${L.t}. Für welches <i>x</i> gilt <i>f</i>(<i>x</i>) = ${neg(y)}?`, label: "<i>x</i> =", placeholder: "Zahl", answer: neg(x), check: LK.check.num(x, { abs: 1e-9 }),
      solution: `<span class="math">${L.t} = ${neg(y)}</span> ⇒ <b><i>x</i> = ${neg(x)}</b>` };
  }
  function genPoint() {
    const L = LINS(), x = rnd(-4, 4), on = Math.random() < 0.5, y = on ? L.f(x) : L.f(x) + pick([-2, -1, 1, 2]);
    return { html: `<i>f</i>(<i>x</i>) = ${L.t}. Liegt der Punkt P(${neg(x)} | ${neg(y)}) auf dem Graphen?`, label: "Antwort:", placeholder: "ja oder nein", answer: on ? "ja" : "nein",
      check: (raw) => { const t = raw.trim().toLowerCase(); if (!/^(ja|nein)/.test(t)) return { ok: false, msg: "Antworte mit <code>ja</code> oder <code>nein</code>." }; return t.startsWith(on ? "ja" : "nein") ? { ok: true } : { ok: false, msg: "Setze x ein und vergleiche mit y." }; },
      solution: `<i>f</i>(${neg(x)}) = ${neg(L.f(x))} ${on ? "=" : "≠"} ${neg(y)}: <b>${on ? "ja" : "nein"}</b>` };
  }
  LK.trainer({ el: "#trainer", modes: [
    { id: "wert", label: "Funktionswert", gen: genValue },
    { id: "stelle", label: "Stelle gesucht", gen: genPlace },
    { id: "punkt", label: "Punkt auf dem Graphen?", gen: genPoint }
  ] });

  LK.quiz({ box: "#quizBox", bar: "#qBar", progress: "#qProgress", key: "funktion.best", n: 10, questions: [
    { q: "Was ist eine Funktion?", o: ["Jedem x werden beliebig viele y zugeordnet", "Jedem x wird genau ein y zugeordnet", "Jedem y genau ein x", "Eine Gerade"], a: 1, e: "Eindeutige Zuordnung." },
    { q: "f(x) = 3x − 2. Was ist f(4)?", o: ["10", "12", "14", "2"], a: 0, e: "3 · 4 − 2 = 10." },
    { q: "Ist ein Kreis der Graph einer Funktion?", o: ["Ja", "Nein", "Nur der Einheitskreis", "Nur ohne Mittelpunkt"], a: 1, e: "Senkrechte Linien schneiden ihn zweimal." },
    { q: "Dürfen zwei verschiedene x denselben Funktionswert haben?", o: ["Ja", "Nein", "Nur bei Geraden", "Nur bei x = 0"], a: 0, e: "Z. B. f(x) = x²: f(−2) = f(2)." },
    { q: "Was ist die Definitionsmenge?", o: ["Alle y-Werte", "Alle x-Werte, die man einsetzen darf", "Die Nullstellen", "Der Graph"], a: 1, e: "Die erlaubten Eingaben." },
    { q: "Welche Zahl darf man bei f(x) = 6 : x nicht einsetzen?", o: ["6", "1", "0", "−6"], a: 2, e: "Durch 0 kann man nicht teilen." },
    { q: "f(x) = 2x + 1 und f(x) = 9. Wie groß ist x?", o: ["19", "4", "5", "8"], a: 1, e: "2x + 1 = 9 ⇒ x = 4." },
    { q: "Liegt P(2 | 5) auf dem Graphen von f(x) = x² + 1?", o: ["Ja", "Nein"], a: 0, e: "f(2) = 5." },
    { q: "Wie liest man f(x)?", o: ["f mal x", "f von x", "f plus x", "f durch x"], a: 1, e: "Der Funktionswert an der Stelle x." },
    { q: "Was ist die Wertemenge von f(x) = x²?", o: ["Alle Zahlen", "Alle Zahlen ≥ 0", "Nur 0", "Alle Zahlen ≤ 0"], a: 1, e: "Quadrate sind nie negativ." },
    { q: "Welche Darstellung ist keine Darstellung einer Funktion?", o: ["Wertetabelle", "Graph", "Funktionsgleichung", "Taschenrechner"], a: 3, e: "Die vier Darstellungen: Wort, Gleichung, Tabelle, Graph." }
  ] });

  LK.views(["verstehen", "darstellungen", "test", "ueben", "alltag", "quiz"], { darstellungen: draw });
})();
