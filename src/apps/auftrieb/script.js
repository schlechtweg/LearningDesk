(function () {
  "use strict";
  const { $, pick, fmt, numText, check } = LK;
  const G = 9.81;
  const BODIES = [["Styropor", 25, "#f4f4f4"], ["Kork", 240, "#c9a074"], ["Fichtenholz", 470, "#d9b77c"], ["Kerzenwachs", 900, "#f3e6b0"], ["Eis", 920, "#dff2fb"], ["rohes Ei", 1050, "#f1e2c8"], ["Aluminium", 2700, "#c7ccd1"], ["Eisen", 7870, "#6f747a"], ["Gold", 19300, "#e2b53c"]];
  const LIQUIDS = [["Süßwasser", 1000, "rgba(47,127,184,0.30)"], ["Meerwasser", 1025, "rgba(30,110,150,0.40)"], ["Totes Meer", 1240, "rgba(60,140,140,0.40)"], ["Speiseöl", 920, "rgba(214,170,40,0.40)"], ["Spiritus", 790, "rgba(150,200,230,0.30)"], ["Quecksilber", 13600, "rgba(150,155,165,0.80)"]];
  $("#bBody").innerHTML = BODIES.map(([n, r], i) => `<option value="${i}"${n === "Fichtenholz" ? " selected" : ""}>${n} (${fmt(r, 0)} kg/m³)</option>`).join("");
  $("#bLiquid").innerHTML = LIQUIDS.map(([n, r], i) => `<option value="${i}">${n} (${fmt(r, 0)} kg/m³)</option>`).join("");

  // ---------- experiment ----------
  function draw() {
    const [bn, rb, bc] = BODIES[+$("#bBody").value], [ln, rl, lc] = LIQUIDS[+$("#bLiquid").value], Vcm = +$("#bV").value;
    $("#bVOut").textContent = `${Vcm} cm³`;
    const V = Vcm / 1e6, m = rb * V, FG = m * G, FAmax = rl * V * G;
    const ratio = rb / rl;
    let state, frac, FA;
    if (Math.abs(ratio - 1) < 0.005) { state = "schwebt"; frac = 1; FA = FAmax; }
    else if (ratio > 1) { state = "sinkt"; frac = 1; FA = FAmax; }
    else { state = "schwimmt"; frac = ratio; FA = FG; }
    const X = 60, W = 300, top = 40, bottom = 300, surf = 90;
    const side = 30 + Math.cbrt(Vcm) * 7.5;
    let y; // top edge of the body
    if (state === "sinkt") y = bottom - side - 2;
    else if (state === "schwebt") y = (surf + bottom) / 2 - side / 2;
    else y = surf - side * (1 - frac);
    const cx = X + W / 2;
    let s = `<rect x="${X}" y="${surf}" width="${W}" height="${bottom - surf}" fill="${lc}"/><path class="wall" d="M${X} ${top} V${bottom} H${X + W} V${top}"/>`;
    s += `<rect class="body" x="${cx - side / 2}" y="${y}" width="${side}" height="${side}" fill="${bc}"/>`;
    const maxF = Math.max(FG, FAmax), len = (f) => 12 + 70 * (f / maxF);
    const cy = y + side / 2;
    s += `<path class="fg" d="M${cx - 14} ${cy} V${cy + len(FG)} M${cx - 21} ${cy + len(FG) - 9} L${cx - 14} ${cy + len(FG)} L${cx - 7} ${cy + len(FG) - 9}"/>`;
    s += `<path class="fa" d="M${cx + 14} ${cy} V${cy - len(FA)} M${cx + 7} ${cy - len(FA) + 9} L${cx + 14} ${cy - len(FA)} L${cx + 21} ${cy - len(FA) + 9}"/>`;
    s += `<text x="${cx - 22}" y="${cy + len(FG) + 16}" text-anchor="end" style="fill: var(--bad)">F_G = ${fmt(FG, 2)} N</text><text x="${cx + 22}" y="${cy - len(FA) - 6}" style="fill: var(--good)">F_A = ${fmt(FA, 2)} N</text>`;
    $("#bSvg").innerHTML = s;
    $("#bState").textContent = `${bn} in ${ln}: ${state}`;
    $("#bRo").innerHTML = `<dt>Masse</dt><dd>${fmt(m * 1000, 1)} g</dd><dt>Gewichtskraft F_G</dt><dd class="big">${fmt(FG, 2)} N</dd><dt>Auftrieb, ganz eingetaucht</dt><dd class="big">${fmt(FAmax, 2)} N</dd>${state === "schwimmt" ? `<dt>eingetaucht</dt><dd>${fmt(frac * 100, 0)} %</dd>` : ""}`;
    $("#bText").innerHTML = state === "sinkt"
      ? `Die Dichte von ${bn} (${fmt(rb, 0)} kg/m³) ist größer als die von ${ln} (${fmt(rl, 0)} kg/m³). Selbst ganz eingetaucht ist der Auftrieb (${fmt(FAmax, 2)} N) kleiner als die Gewichtskraft (${fmt(FG, 2)} N). Der Körper sinkt.`
      : state === "schwimmt"
        ? `Die Dichte von ${bn} ist kleiner als die von ${ln}. Ganz untergetaucht wäre der Auftrieb größer als die Gewichtskraft, der Körper steigt auf. Er schwimmt und taucht nur zu <strong>${fmt(frac * 100, 0)} %</strong> ein (${fmt(rb, 0)} : ${fmt(rl, 0)}). Dann ist der Auftrieb genau so groß wie die Gewichtskraft.`
        : `Die Dichten sind praktisch gleich. Auftrieb und Gewichtskraft heben sich auf: Der Körper schwebt.`;
  }
  ["bBody", "bLiquid"].forEach((id) => $("#" + id).addEventListener("change", draw)); $("#bV").addEventListener("input", draw);

  // ---------- prediction cards ----------
  const C = LK.cards({ el: "#cards", key: "auftrieb.cards", items: [
    { ctx: "Versuch", title: "Eisennagel in Wasser", text: "Ein kleiner Eisennagel wird ins Wasser gelegt.", o: ["schwimmt", "sinkt", "schwebt"], a: 1, e: "Eisen (7 870 kg/m³) ist fast achtmal so dicht wie Wasser." },
    { ctx: "Technik", title: "Schiff aus Stahl", text: "Ein großes Containerschiff besteht fast nur aus Stahl. Was passiert im Hafen?", o: ["Es sinkt, Stahl ist zu dicht", "Es schwimmt, weil es innen hohl ist", "Es schwebt im Wasser"], a: 1, e: "Mit dem Luftraum im Rumpf ist die mittlere Dichte des Schiffs kleiner als die von Wasser. Es verdrängt so viel Wasser, wie es wiegt." },
    { ctx: "Natur", title: "Eisberg", text: "Wie viel eines Eisbergs liegt ungefähr unter der Wasseroberfläche des Meeres?", o: ["etwa 10 %", "etwa 50 %", "etwa 90 %"], a: 2, e: "920 : 1 025 ≈ 0,9. Darum sieht man nur die „Spitze des Eisbergs“." },
    { ctx: "Küche", title: "Ei in Salzwasser", text: "Ein rohes Ei sinkt in Leitungswasser. Man löst viel Salz im Wasser. Was passiert?", o: ["Es sinkt weiter", "Es steigt auf und schwimmt", "Es zerbricht"], a: 1, e: "Salz erhöht die Dichte des Wassers über die des Eis (≈ 1 050 kg/m³)." },
    { ctx: "Überraschung", title: "Eisenkugel in Quecksilber", text: "Eine Eisenkugel wird in eine Schale mit Quecksilber gelegt.", o: ["Sie sinkt", "Sie schwimmt", "Sie löst sich auf"], a: 1, e: "Quecksilber (13 600 kg/m³) ist dichter als Eisen (7 870 kg/m³)." },
    { ctx: "Versuch", title: "Eiswürfel in Spiritus", text: "Ein Eiswürfel wird in ein Glas mit Spiritus gegeben.", o: ["Er schwimmt oben", "Er sinkt", "Er schwebt"], a: 1, e: "Eis (920 kg/m³) ist dichter als Spiritus (790 kg/m³). In Wasser würde er schwimmen." },
    { ctx: "Technik", title: "U-Boot flutet die Tanks", text: "Ein U-Boot lässt Meerwasser in seine Tauchtanks laufen. Was passiert?", o: ["Es taucht ab", "Es taucht auf", "Nichts"], a: 0, e: "Das Volumen bleibt gleich, die Masse wird größer. Die Gewichtskraft übersteigt den Auftrieb." },
    { ctx: "Urlaub", title: "Baden im Toten Meer", text: "Im Toten Meer ist das Wasser sehr salzig. Was merkt man beim Baden?", o: ["Man geht leichter unter", "Man liegt fast von selbst auf dem Wasser", "Kein Unterschied"], a: 1, e: "Die hohe Dichte (≈ 1 240 kg/m³) sorgt für großen Auftrieb." }
  ] });

  // ---------- trainer ----------
  const LQ = [["Wasser", 1000], ["Meerwasser", 1025], ["Speiseöl", 920], ["Spiritus", 790]];
  function genFA() {
    const [ln, rl] = pick(LQ), V = pick([50, 100, 200, 250, 400, 500, 750, 1000, 1500, 2000]);
    const FA = rl * (V / 1e6) * G;
    return { html: `Ein Körper mit dem Volumen <b>V = ${fmt(V, 0)} cm³</b> ist ganz in <b>${ln}</b> (ρ = ${fmt(rl, 0)} kg/m³) eingetaucht. Wie groß ist die Auftriebskraft?`,
      label: "<i>F</i><sub>A</sub> =", placeholder: "in N", answer: numText(FA, 3), check: check.num(FA), hint: "Einheit: N. 1 cm³ = 0,000001 m³.",
      solution: `<span class="math">${fmt(V, 0)} cm³ = ${fmt(V / 1e6, 6)} m³</span>. <span class="math"><i>F</i><sub>A</sub> = ${fmt(rl, 0)} · 9,81 · ${fmt(V / 1e6, 6)} = ${fmt(FA, 3)} N</span>` };
  }
  function genWeigh() {
    const [bn, rb] = pick([["Aluminium", 2700], ["Eisen", 7870], ["Messing", 8500], ["Stein", 2600]]), V = pick([20, 50, 80, 100, 150, 200]);
    const FG = rb * V / 1e6 * G, FA = 1000 * V / 1e6 * G, Fs = FG - FA;
    return { html: `Ein Körper aus ${bn} (V = <b>${V} cm³</b>, ρ = ${fmt(rb, 0)} kg/m³) hängt an einem Kraftmesser und wird ganz in Wasser getaucht. Was zeigt der Kraftmesser an?`,
      label: "<i>F</i> =", placeholder: "in N", answer: numText(Fs, 3), check: check.num(Fs), hint: "Einheit: N. Kraftmesser zeigt Gewichtskraft minus Auftrieb.",
      solution: `<span class="math"><i>F</i><sub>G</sub> = ${fmt(rb, 0)} · ${fmt(V / 1e6, 6)} · 9,81 = ${fmt(FG, 3)} N</span>, <span class="math"><i>F</i><sub>A</sub> = 1 000 · ${fmt(V / 1e6, 6)} · 9,81 = ${fmt(FA, 3)} N</span>. Anzeige: <span class="math">${fmt(FG, 3)} − ${fmt(FA, 3)} = ${fmt(Fs, 3)} N</span>` };
  }
  function genDecide() {
    const m = pick([40, 60, 90, 120, 200, 300, 450]), V = pick([50, 80, 100, 150, 200, 300]);
    const [ln, rl] = pick([["Wasser", 1000], ["Spiritus", 790], ["Meerwasser", 1025]]);
    const rho = m / V * 1000;
    if (Math.abs(rho - rl) / rl < 0.02) return genDecide();
    const word = rho > rl ? "sinkt" : "schwimmt";
    return { html: `Ein Körper hat die Masse <b>${m} g</b> und das Volumen <b>${V} cm³</b>. Er wird in <b>${ln}</b> (ρ = ${fmt(rl, 0)} kg/m³) gelegt. Schwimmt er oder sinkt er?`,
      label: "Er …", placeholder: "sinkt oder schwimmt", answer: word,
      check: (raw) => { const t = raw.trim().toLowerCase(); const w = /sink|unter/.test(t) ? "sinkt" : /schwimm|steig|oben/.test(t) ? "schwimmt" : /schweb/.test(t) ? "schwebt" : null;
        if (!w) return { ok: false, msg: "Antworte mit <code>sinkt</code> oder <code>schwimmt</code>." }; return w === word ? { ok: true } : { ok: false, msg: "Vergleiche die Dichte des Körpers (Masse : Volumen) mit der Dichte der Flüssigkeit." }; },
      solution: `Dichte des Körpers: <span class="math">${m} g : ${V} cm³ = ${fmt(m / V, 3)} g/cm³ = ${fmt(rho, 0)} kg/m³</span>. Das ist ${rho > rl ? "mehr" : "weniger"} als ${fmt(rl, 0)} kg/m³, also <b>${word}</b> er.` };
  }
  function genFrac() {
    const [bn, rb] = pick([["Holz", 600], ["Holz", 500], ["Eis", 920], ["Kork", 240], ["Kunststoff", 800]]), [ln, rl] = pick([["Süßwasser", 1000], ["Meerwasser", 1025]]);
    const f = rb / rl * 100;
    return { html: `Ein Stück ${bn} (ρ = ${fmt(rb, 0)} kg/m³) schwimmt in <b>${ln}</b> (ρ = ${fmt(rl, 0)} kg/m³). Wie viel Prozent seines Volumens liegen unter Wasser?`,
      label: "Anteil =", placeholder: "in %", answer: numText(f, 1), check: check.num(f), hint: "Einheit: %",
      solution: `Ein schwimmender Körper taucht so weit ein, dass F_A = F_G: <span class="math">Anteil = ρ<sub>Körper</sub> : ρ<sub>Fl</sub> = ${fmt(rb, 0)} : ${fmt(rl, 0)} = ${fmt(f, 1)} %</span>` };
  }
  LK.trainer({ el: "#trainer", modes: [
    { id: "FA", label: "Auftriebskraft", gen: genFA },
    { id: "kraftmesser", label: "Kraftmesser im Wasser", gen: genWeigh },
    { id: "entscheiden", label: "Schwimmt oder sinkt?", gen: genDecide },
    { id: "anteil", label: "Eintauchanteil", gen: genFrac }
  ] });

  LK.quiz({ box: "#quizBox", bar: "#qBar", progress: "#qProgress", key: "auftrieb.best", n: 10, questions: [
    { q: "Wie groß ist die Auftriebskraft nach Archimedes?", o: ["So groß wie die Gewichtskraft des Körpers", "So groß wie die Gewichtskraft der verdrängten Flüssigkeit", "Immer 1 N", "So groß wie der Luftdruck"], a: 1, e: "F_A = ρ_Fl · g · V_verdrängt." },
    { q: "Ein Körper sinkt, wenn …", o: ["F_G < F_A", "F_G > F_A", "F_G = F_A", "er leicht ist"], a: 1, e: "Die Gewichtskraft überwiegt den Auftrieb." },
    { q: "Welche Dichte gehört in die Auftriebsformel?", o: ["die des Körpers", "die der Flüssigkeit", "die der Luft", "keine"], a: 1, e: "Es zählt die verdrängte Flüssigkeit." },
    { q: "Warum entsteht Auftrieb?", o: ["Weil Wasser nass ist", "Weil der Druck unten am Körper größer ist als oben", "Weil Körper leichter werden", "Weil Luft im Wasser ist"], a: 1, e: "Der Schweredruck wächst mit der Tiefe." },
    { q: "Ein Holzstück mit ρ = 500 kg/m³ schwimmt in Wasser. Wie viel ist eingetaucht?", o: ["25 %", "50 %", "75 %", "100 %"], a: 1, e: "500 : 1 000 = 0,5." },
    { q: "Ein Körper schwebt im Wasser. Was gilt?", o: ["Seine Dichte ist gleich der Dichte von Wasser", "Er ist hohl", "Er ist leichter als Wasser", "Er hat kein Volumen"], a: 0, e: "Dann sind F_G und F_A gleich groß." },
    { q: "Wie taucht ein U-Boot ab?", o: ["Es pumpt Luft in die Tanks", "Es flutet Tanks mit Wasser", "Es wird kleiner", "Es schaltet den Motor aus"], a: 1, e: "Mehr Masse bei gleichem Volumen: die mittlere Dichte steigt." },
    { q: "Wo erfährt ein Körper mehr Auftrieb (ganz eingetaucht)?", o: ["In Süßwasser", "In Meerwasser", "Überall gleich", "In Spiritus"], a: 1, e: "Meerwasser hat die größere Dichte." },
    { q: "V = 100 cm³ ganz in Wasser. F_A ≈ ?", o: ["0,98 N", "9,81 N", "98,1 N", "0,1 N"], a: 0, e: "1 000 · 9,81 · 0,0001 = 0,981 N." },
    { q: "Warum schwimmt ein Stahlschiff?", o: ["Stahl schwimmt immer", "Seine mittlere Dichte ist durch den Hohlraum kleiner als die von Wasser", "Wegen des Motors", "Weil Meerwasser salzig ist"], a: 1, e: "Es verdrängt sehr viel Wasser." },
    { q: "Was zeigt ein Kraftmesser, wenn ein Stein im Wasser hängt?", o: ["Mehr als an der Luft", "Weniger als an der Luft", "Genauso viel", "Null"], a: 1, e: "Gewichtskraft minus Auftrieb." },
    { q: "Was entscheidet, ob etwas schwimmt?", o: ["Nur das Gewicht", "Nur die Größe", "Die Dichte im Vergleich zur Flüssigkeit", "Die Farbe"], a: 2, e: "Kleinere Dichte als die Flüssigkeit: schwimmt." }
  ] });

  LK.views(["verstehen", "versuch", "vorhersagen", "ueben", "quiz"], { versuch: draw });
})();
