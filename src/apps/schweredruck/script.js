(function () {
  "use strict";
  const { $, pick, fmt, numText, check } = LK;
  const G = 9.81, P_AIR = 1013;
  const COLORS = { 1000: "rgba(47,127,184,0.35)", 1025: "rgba(30,110,150,0.45)", 920: "rgba(214,170,40,0.45)", 790: "rgba(150,200,230,0.3)", 13600: "rgba(150,155,165,0.75)" };

  // ---------- tank ----------
  function draw() {
    const rho = +$("#tLiquid").value, h = +$("#tH").value;
    $("#tHOut").textContent = `${fmt(h, 1)} m`;
    const pPa = rho * G * h, pHpa = pPa / 100, total = P_AIR + pHpa;
    const top = 30, bottom = 330, X = 60, W = 300, y = top + (h / 50) * (bottom - top - 20);
    let s = `<rect class="liquid" x="${X}" y="${top}" width="${W}" height="${bottom - top}" fill="${COLORS[rho]}"/><path class="wall" d="M${X} ${top - 10} V${bottom} H${X + W} V${top - 10}"/>`;
    for (let d = 0; d <= 50; d += 10) { const yy = top + (d / 50) * (bottom - top - 20); s += `<line x1="${X - 8}" y1="${yy}" x2="${X}" y2="${yy}" stroke="var(--ink)"/><text x="${X - 12}" y="${yy + 4}" text-anchor="end">${d} m</text>`; }
    s += `<line class="depth" x1="${X}" y1="${y}" x2="${X + W}" y2="${y}"/>`;
    const cx = X + W / 2, L = 8 + Math.min(30, (pHpa / 1000) * 6);
    [[0, -1], [0, 1], [-1, 0], [1, 0], [0.7, 0.7], [-0.7, 0.7], [0.7, -0.7], [-0.7, -0.7]].forEach(([dx, dy]) => {
      const x1 = cx - dx * (16 + L), y1 = y - dy * (16 + L), x2 = cx - dx * 16, y2 = y - dy * 16;
      if (h > 0) s += `<path class="parrow" d="M${x1} ${y1} L${x2} ${y2}"/>`;
    });
    s += `<circle class="diver" cx="${cx}" cy="${y}" r="11"/><text x="${X + W - 8}" y="${y - 6}" text-anchor="end" style="fill: var(--ink)">${fmt(h, 1)} m</text>`;
    $("#tSvg").innerHTML = s;
    $("#tRo").innerHTML = `<dt>Schweredruck ρ·g·h</dt><dd class="big">${fmt(pHpa, 0)} hPa</dd><dt>in bar</dt><dd>${fmt(pHpa / 1000, 2)} bar</dd><dt>in Pascal</dt><dd>${fmt(pPa, 0)} Pa</dd><dt>+ Luftdruck</dt><dd>${fmt(P_AIR, 0)} hPa</dd><dt>Gesamtdruck</dt><dd class="big">${fmt(total / 1000, 2)} bar</dd>`;
    const per10 = rho * G * 10 / 100000;
    $("#tStatus").innerHTML = rho === 13600 ? `Quecksilber ist 13,6-mal so dicht wie Wasser. Schon <strong>76 cm</strong> Quecksilber drücken so stark wie die ganze Luftsäule über uns (≈ 1 013 hPa). So funktionieren alte Barometer.` : `In dieser Flüssigkeit steigt der Druck um etwa <strong>${fmt(per10, 2)} bar pro 10 m</strong> Tiefe.`;
  }
  $("#tLiquid").addEventListener("change", draw); $("#tH").addEventListener("input", draw);

  // ---------- trainer ----------
  const LIQ = [["Wasser", 1000], ["Meerwasser", 1025], ["Speiseöl", 920], ["Spiritus", 790]];
  function genP() {
    const [name, rho] = pick(LIQ), h = pick([0.5, 1, 2, 3, 5, 8, 10, 12, 20, 25, 40]);
    const p = rho * G * h, inHpa = Math.random() < 0.5, ans = inHpa ? p / 100 : p;
    return { html: `Wie groß ist der Schweredruck in <b>${fmt(h, 1)} m</b> Tiefe in <b>${name}</b> (ρ = ${fmt(rho, 0)} kg/m³)?`,
      label: "<i>p</i> =", placeholder: inHpa ? "in hPa" : "in Pa", answer: numText(ans, 1), check: check.num(ans), hint: `Einheit: ${inHpa ? "hPa (1 hPa = 100 Pa)" : "Pa"}`,
      solution: `<span class="math"><i>p</i> = <i>ρ</i>·<i>g</i>·<i>h</i> = ${fmt(rho, 0)} kg/m³ · 9,81 N/kg · ${fmt(h, 1)} m = ${fmt(p, 1)} Pa</span>${inHpa ? ` = ${fmt(p / 100, 1)} hPa` : ""}` };
  }
  function genCm() {
    const h = pick([20, 30, 50, 80, 150, 250]);
    const p = 1000 * G * h / 100;
    return { html: `Ein Aquarium ist <b>${h} cm</b> tief. Wie groß ist der Schweredruck am Boden (Wasser, 1 000 kg/m³)?`,
      label: "<i>p</i> =", placeholder: "in Pa", answer: numText(p, 1), check: check.num(p), hint: "Einheit: Pa. Erst cm in m umrechnen!",
      solution: `<span class="math">${h} cm = ${fmt(h / 100, 2)} m</span>. <span class="math"><i>p</i> = 1 000 · 9,81 · ${fmt(h / 100, 2)} = ${fmt(p, 1)} Pa</span>` };
  }
  function genH() {
    const pBar = pick([0.5, 1, 1.5, 2, 3, 4, 5]);
    const h = pBar * 100000 / (1000 * G);
    return { html: `In welcher Wassertiefe beträgt der Schweredruck <b>${fmt(pBar, 1)} bar</b>?`,
      label: "<i>h</i> =", placeholder: "in m", answer: numText(h, 2), check: check.num(h), hint: "Einheit: m. 1 bar = 100 000 Pa.",
      solution: `<span class="math"><i>h</i> = <i>p</i> : (<i>ρ</i>·<i>g</i>) = ${fmt(pBar * 100000, 0)} Pa : (1 000 · 9,81) = ${fmt(h, 2)} m</span>. Faustregel: etwa 10 m pro bar.` };
  }
  function genTotal() {
    const h = pick([5, 10, 15, 20, 30, 40]);
    const tot = (P_AIR + 1000 * G * h / 100) / 1000;
    return { html: `Ein Taucher ist <b>${h} m</b> tief im Süßwasser. Wie groß ist der Gesamtdruck einschließlich Luftdruck (1 013 hPa) in bar?`,
      label: "<i>p</i><sub>gesamt</sub> =", placeholder: "in bar", answer: numText(tot, 3), check: check.num(tot), hint: "Einheit: bar",
      solution: `Schweredruck: <span class="math">1 000 · 9,81 · ${h} = ${fmt(1000 * G * h, 0)} Pa = ${fmt(G * h * 10, 0)} hPa</span>. Gesamt: <span class="math">1 013 hPa + ${fmt(G * h * 10, 0)} hPa = ${fmt(tot * 1000, 0)} hPa = ${fmt(tot, 3)} bar</span>` };
  }
  LK.trainer({ el: "#trainer", modes: [
    { id: "p", label: "Druck berechnen", gen: genP },
    { id: "cm", label: "Mit cm-Angabe", gen: genCm },
    { id: "h", label: "Tiefe berechnen", gen: genH },
    { id: "ges", label: "Gesamtdruck", gen: genTotal }
  ] });

  LK.quiz({ box: "#quizBox", bar: "#qBar", progress: "#qProgress", key: "schweredruck.best", n: 10, questions: [
    { q: "Wie lautet die Formel für den Schweredruck?", o: ["p = F · A", "p = ρ · g · h", "p = m · g", "p = ρ : h"], a: 1, e: "Dichte mal Ortsfaktor mal Tiefe." },
    { q: "Um wie viel steigt der Druck im Wasser etwa pro 10 m Tiefe?", o: ["0,1 bar", "1 bar", "10 bar", "100 bar"], a: 1, e: "1 000 · 9,81 · 10 ≈ 98 000 Pa ≈ 1 bar." },
    { q: "Wovon hängt der Schweredruck NICHT ab?", o: ["von der Tiefe", "von der Dichte", "von der Form des Gefäßes", "vom Ortsfaktor"], a: 2, e: "Hydrostatisches Paradoxon: Nur die Füllhöhe zählt." },
    { q: "Warum ist ein Staudamm unten dicker als oben?", o: ["Damit er schöner aussieht", "Weil der Wasserdruck unten am größten ist", "Weil oben weniger Beton nötig ist", "Weil unten Fische wohnen"], a: 1, e: "Der Druck wächst mit der Tiefe." },
    { q: "In welcher Richtung wirkt der Schweredruck?", o: ["nur nach unten", "nur nach oben", "in alle Richtungen gleich", "nur zur Seite"], a: 2, e: "In einer Tiefe drückt die Flüssigkeit von allen Seiten gleich stark." },
    { q: "Wo ist der Druck in 5 m Tiefe größer?", o: ["im Meerwasser", "im Süßwasser", "gleich groß", "in Speiseöl"], a: 0, e: "Meerwasser hat die größere Dichte (≈ 1 025 kg/m³)." },
    { q: "Wie groß ist der Gesamtdruck in 10 m Wassertiefe ungefähr?", o: ["1 bar", "2 bar", "10 bar", "0,1 bar"], a: 1, e: "Luftdruck ≈ 1 bar plus Schweredruck ≈ 1 bar." },
    { q: "Ein Aquarium ist 50 cm tief. Welche Tiefe setzt man in die Formel ein?", o: ["50", "5", "0,5", "500"], a: 2, e: "In Metern: 50 cm = 0,5 m." },
    { q: "Zwei Gefäße haben dieselbe Füllhöhe, eines ist doppelt so breit. Am Boden ist der Druck …", o: ["im breiten doppelt so groß", "im schmalen größer", "gleich groß", "im breiten halb so groß"], a: 2, e: "Der Druck hängt nur von Höhe und Dichte ab." },
    { q: "Warum drückt es beim Tauchen in den Ohren?", o: ["Weil das Wasser kalt ist", "Weil der Wasserdruck mit der Tiefe steigt", "Weil man die Luft anhält", "Wegen des Chlors"], a: 1, e: "Außen wird der Druck größer als in der Luft im Ohr. Deshalb muss man ausgleichen." },
    { q: "Was ist g in der Formel?", o: ["die Gravitationszeit", "der Ortsfaktor, etwa 9,81 N/kg", "das Gewicht", "die Geschwindigkeit"], a: 1, e: "Auf der Erde gilt g ≈ 9,81 N/kg." },
    { q: "Wie hoch drückt eine Quecksilbersäule so stark wie die Luft?", o: ["etwa 10 m", "etwa 76 cm", "etwa 1 cm", "etwa 1 km"], a: 1, e: "Quecksilber ist 13,6-mal so dicht wie Wasser: 10,3 m : 13,6 ≈ 0,76 m." }
  ] });

  LK.views(["verstehen", "tauchen", "ueben", "alltag", "quiz"], { tauchen: draw });
})();
