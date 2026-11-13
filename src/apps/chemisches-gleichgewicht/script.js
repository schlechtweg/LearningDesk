(function () {
  "use strict";
  const { $, $$, pick, fmt } = LK;
  const reduce = () => typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---------- dynamic equilibrium with particles ----------
  const N = 60;
  let parts = [], hist = [], tick = 0, dRaf = null;
  function startD(allA) { parts = Array.from({ length: N }, () => ({ x: 10 + Math.random() * 380, y: 10 + Math.random() * 180, b: !allA })); hist = []; tick = 0; drawD(); }
  function stepD() {
    const k1 = +$("#dk1").value / 100, k2 = +$("#dk2").value / 100;
    parts.forEach((p) => { if (p.b ? Math.random() < k2 : Math.random() < k1) p.b = !p.b; p.x = Math.min(392, Math.max(8, p.x + (Math.random() - 0.5) * 8)); p.y = Math.min(192, Math.max(8, p.y + (Math.random() - 0.5) * 8)); });
    hist.push(parts.filter((p) => p.b).length); if (hist.length > 200) hist.shift(); tick++;
  }
  function drawD() {
    $("#dk1V").textContent = $("#dk1").value; $("#dk2V").textContent = $("#dk2").value;
    $("#dSvg").innerHTML = parts.map((p) => `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="6" fill="${p.b ? "#e0a400" : "#4a78c8"}"/>`).join("");
    const X = (i) => 30 + i * 1.8, Y = (n) => 160 - (n / N) * 140;
    let g = `<line class="ax" x1="30" y1="160" x2="390" y2="160"/><line class="ax" x1="30" y1="160" x2="30" y2="15"/><text x="34" y="14">Anzahl</text><text x="390" y="176" text-anchor="end">Zeit</text>`;
    if (hist.length > 1) { g += `<path class="c2" style="stroke:#4a78c8" d="M${hist.map((b, i) => `${X(i).toFixed(1)} ${Y(N - b).toFixed(1)}`).join(" L")}"/><path class="c2" style="stroke:#e0a400" d="M${hist.map((b, i) => `${X(i).toFixed(1)} ${Y(b).toFixed(1)}`).join(" L")}"/>`; }
    const k1 = +$("#dk1").value, k2 = +$("#dk2").value, eqB = (N * k1) / (k1 + k2);
    g += `<line class="ev" x1="30" x2="390" y1="${Y(eqB)}" y2="${Y(eqB)}"/>`;
    $("#dPlot").innerHTML = g;
    const nb = parts.filter((p) => p.b).length;
    $("#dText").innerHTML = `A: <b>${N - nb}</b>, B: <b>${nb}</b>. Erwartet im Gleichgewicht: etwa ${fmt(eqB, 0)} B (gestrichelt), denn dann gilt k(hin) · Anzahl A = k(rück) · Anzahl B. Die Teilchen wandeln sich weiter um, nur die Anzahlen bleiben gleich.`;
  }
  function loopD() { for (let i = 0; i < 2; i++) stepD(); drawD(); dRaf = $("#view-dynamisch").hidden ? null : requestAnimationFrame(loopD); }
  $("#dStartA").addEventListener("click", () => startD(true));
  $("#dStartB").addEventListener("click", () => startD(false));
  ["#dk1", "#dk2"].forEach((id) => $(id).addEventListener("input", drawD));
  startD(true);

  // ---------- NO2 / N2O4 ----------
  const Kof = (T) => 164 * Math.exp((57000 / 8.314) * (1 / T - 1 / 298)); // L/mol for 2 NO2 <=> N2O4
  const yEq = (c0, K) => (-1 + Math.sqrt(1 + 8 * K * c0)) / (4 * K);
  let S, vh = [], vRaf = null, lastMsg = "";
  function resetV() { S = { c0: 0.03, T: 298, y: 0 }; S.y = yEq(S.c0, Kof(S.T)); vh = []; for (let i = 0; i < 20; i++) vh.push([S.y, (S.c0 - S.y) / 2]); lastMsg = "Gleichgewicht bei 25 °C."; drawV(); }
  function stepV() { const ye = yEq(S.c0, Kof(S.T)); S.y += (ye - S.y) * 0.06; vh.push([S.y, (S.c0 - S.y) / 2]); if (vh.length > 200) vh.shift(); }
  function drawV() {
    const x = (S.c0 - S.y) / 2, a = Math.min(1, S.y / 0.05);
    $("#vFlask").innerHTML = `<rect x="20" y="40" width="140" height="80" rx="10" fill="rgba(160,70,20,${(0.08 + 0.85 * a).toFixed(2)})" stroke="#56626d" stroke-width="2"/><rect x="${20 + 140 * Math.min(1, 0.03 / S.c0)}" y="44" width="10" height="72" fill="#8a8f96"/><rect x="${30 + 140 * Math.min(1, 0.03 / S.c0)}" y="74" width="${Math.max(10, 170 - (30 + 140 * Math.min(1, 0.03 / S.c0)))}" height="12" fill="#8a8f96"/><text x="90" y="145" text-anchor="middle" font-size="12" fill="currentColor">${fmt(S.T - 273, 0)} °C</text>`;
    const X = (i) => 40 + i * 1.75, Y = (c) => 175 - (c / 0.06) * 160;
    let g = `<line class="ax" x1="40" y1="175" x2="395" y2="175"/><line class="ax" x1="40" y1="175" x2="40" y2="10"/><text x="44" y="12">c in mol/L</text>`;
    for (const c of [0.02, 0.04, 0.06]) g += `<line class="gl" x1="40" x2="395" y1="${Y(c)}" y2="${Y(c)}"/><text x="36" y="${Y(c) + 4}" text-anchor="end">${fmt(c, 2)}</text>`;
    g += `<path class="c1" d="M${vh.map(([y], i) => `${X(i).toFixed(1)} ${Y(y).toFixed(1)}`).join(" L")}"/><path class="c2" d="M${vh.map(([, xx], i) => `${X(i).toFixed(1)} ${Y(xx).toFixed(1)}`).join(" L")}"/>`;
    g += `<text x="390" y="${Y(S.y) - 6}" text-anchor="end" style="fill:#b5532a">NO₂</text><text x="390" y="${Y(x) - 6}" text-anchor="end" style="fill:var(--accent)">N₂O₄</text>`;
    $("#vPlot").innerHTML = g;
    $("#vState").innerHTML = `c(NO₂) = <b>${fmt(S.y, 4)}</b> mol/L, c(N₂O₄) = <b>${fmt(x, 4)}</b> mol/L, Temperatur ${fmt(S.T - 273, 0)} °C`;
    $("#vText").innerHTML = lastMsg;
  }
  function loopV() { stepV(); drawV(); vRaf = $("#view-verschieben").hidden ? null : requestAnimationFrame(loopV); }
  const MSG = {
    "p+": "Druck erhöht (Volumen halbiert): Zuerst wird das Gas dunkler, weil alles konzentrierter ist. Dann verschiebt sich das Gleichgewicht zur Seite mit <b>weniger Gasteilchen</b> (1 N₂O₄ statt 2 NO₂): Die Farbe wird wieder etwas heller.",
    "p-": "Druck gesenkt: Das Gleichgewicht verschiebt sich zur Seite mit <b>mehr Gasteilchen</b>, also zu NO₂.",
    "t+": "Erwärmt: Das Gleichgewicht verschiebt sich in Richtung der <b>endothermen Rückreaktion</b>, also zu braunem NO₂.",
    "t-": "Abgekühlt: Die <b>exotherme Hinreaktion</b> wird begünstigt, es entsteht mehr farbloses N₂O₄. Die Farbe wird heller.",
    no2: "NO₂ zugegeben: Das Gleichgewicht verschiebt sich so, dass NO₂ <b>verbraucht</b> wird: Es entsteht mehr N₂O₄."
  };
  $$("[data-z]").forEach((b) => b.addEventListener("click", () => {
    const z = b.dataset.z;
    if (z === "reset") { resetV(); return; }
    if (z === "p+" && S.c0 < 0.1) { S.c0 *= 2; S.y *= 2; }
    if (z === "p-" && S.c0 > 0.008) { S.c0 /= 2; S.y /= 2; }
    if (z === "t+" && S.T < 380) S.T += 40;
    if (z === "t-" && S.T > 260) S.T -= 40;
    if (z === "no2" && S.c0 < 0.1) { S.c0 += 0.015; S.y += 0.015; }
    lastMsg = MSG[z];
    if (reduce()) { for (let i = 0; i < 120; i++) stepV(); }
    drawV();
  }));
  resetV();

  // ---------- ammonia table ----------
  const PR = [10, 100, 200, 300, 1000], TE = [200, 300, 400, 500, 600];
  const Y_ = [[50.7, 81.5, 85.8, 89.9, 98.3], [14.7, 52.5, 62.8, 71.0, 92.6], [3.9, 25.1, 36.3, 47.0, 79.8], [1.2, 10.6, 17.6, 26.4, 57.5], [0.5, 4.5, 8.3, 13.8, 31.4]];
  let sel = [3, 3];
  function drawA() {
    $("#aTab").innerHTML = `<tr><th>T \\ p</th>${PR.map((p) => `<th>${p} bar</th>`).join("")}</tr>` + TE.map((t, i) => `<tr><th>${t} °C</th>${Y_[i].map((v, j) => `<td class="${v > 40 ? "hi" : ""}${sel[0] === i && sel[1] === j ? " sel" : ""}" data-i="${i}" data-j="${j}" style="cursor:pointer">${fmt(v, 1)} %</td>`).join("")}</tr>`).join("");
    $$("#aTab td").forEach((td) => td.addEventListener("click", () => { sel = [+td.dataset.i, +td.dataset.j]; drawA(); }));
    const [i, j] = sel, v = Y_[i][j];
    const speed = TE[i] < 400 ? "sehr langsam, auch mit Katalysator" : TE[i] <= 500 ? "mit Eisen-Katalysator ausreichend schnell" : "schnell";
    $("#aText").innerHTML = `${TE[i]} °C, ${PR[j]} bar: <b>${fmt(v, 1)} % NH₃</b> im Gleichgewicht. Reaktion: ${speed}. ${PR[j] >= 1000 ? "So hohe Drücke sind technisch sehr teuer und gefährlich." : ""} ${i === 2 || i === 3 ? (j === 2 || j === 3 ? "Das entspricht etwa den technischen Bedingungen." : "") : ""}`;
  }
  drawA();

  // ---------- trainer ----------
  // [equation, dH sign (-1 exo, +1 endo, 0 ~none), gas left, gas right]
  const RX = [["N₂ + 3 H₂ ⇌ 2 NH₃", -1, 4, 2], ["2 SO₂ + O₂ ⇌ 2 SO₃", -1, 3, 2], ["N₂O₄ ⇌ 2 NO₂", 1, 1, 2], ["CO + H₂O(g) ⇌ CO₂ + H₂", -1, 2, 2], ["N₂ + O₂ ⇌ 2 NO", 1, 2, 2], ["CaCO₃(s) ⇌ CaO(s) + CO₂(g)", 1, 0, 1], ["C(s) + CO₂ ⇌ 2 CO", 1, 1, 2], ["PCl₅ ⇌ PCl₃ + Cl₂", 1, 1, 2], ["2 NO + O₂ ⇌ 2 NO₂", -1, 3, 2]];
  const DIST = ["T+", "T-", "p+", "p-", "addE", "remP", "addP", "kat"];
  const DTXT = { "T+": "Die Temperatur wird erhöht.", "T-": "Die Temperatur wird gesenkt.", "p+": "Der Druck wird erhöht.", "p-": "Der Druck wird gesenkt.", addE: "Es wird mehr Ausgangsstoff zugegeben.", remP: "Ein Produkt wird laufend entfernt.", addP: "Es wird zusätzliches Produkt zugegeben.", kat: "Es wird ein Katalysator zugegeben." };
  function answer([, dh, gl, gr], d) {
    if (d === "kat") return ["keine", "Ein Katalysator beschleunigt Hin- und Rückreaktion gleich, die Lage bleibt."];
    if (d === "addE" || d === "remP") return ["rechts", "Le Chatelier: Der Zwang wird verringert, indem Edukt verbraucht bzw. Produkt nachgebildet wird."];
    if (d === "addP") return ["links", "Das zugegebene Produkt wird teilweise wieder verbraucht."];
    if (d === "T+" || d === "T-") { const endoRight = dh > 0; const right = d === "T+" ? endoRight : !endoRight; return [right ? "rechts" : "links", `Die Hinreaktion ist ${dh < 0 ? "exotherm" : "endotherm"}. ${d === "T+" ? "Wärmezufuhr begünstigt die endotherme Richtung." : "Abkühlen begünstigt die exotherme Richtung."}`]; }
    if (gl === gr) return ["keine", `Links und rechts gleich viele Gasteilchen (${gl}).`];
    const right = d === "p+" ? gr < gl : gr > gl; return [right ? "rechts" : "links", `Gasteilchen links ${gl}, rechts ${gr}. ${d === "p+" ? "Druckerhöhung begünstigt die Seite mit weniger Gasteilchen." : "Drucksenkung begünstigt die Seite mit mehr Gasteilchen."}`];
  }
  function genLC() { const r = pick(RX), d = pick(DIST), [a, why] = answer(r, d);
    return { html: `<span style="font-family:var(--font-mono)">${r[0]}</span>, ΔH ${r[1] < 0 ? "< 0 (exotherm)" : "> 0 (endotherm)"}. ${DTXT[d]} In welche Richtung verschiebt sich das Gleichgewicht?`, label: "Richtung:", placeholder: "rechts, links oder keine", answer: a,
      check: (raw) => { const t = raw.trim().toLowerCase(); const v = /recht|produkt/.test(t) ? "rechts" : /link|edukt/.test(t) ? "links" : /kein|nicht|gleich/.test(t) ? "keine" : null; if (!v) return { ok: false, msg: "Antworte mit <code>rechts</code>, <code>links</code> oder <code>keine</code>." }; return v === a ? { ok: true } : { ok: false, msg: "Wie kann das System den Zwang verringern?" }; },
      solution: `<b>${a}</b>: ${why}` }; }
  function genGas() { const r = pick(RX.filter((x) => x[2] !== x[3])); const a = r[3] < r[2] ? "rechts" : "links";
    return { html: `Zu welcher Seite verschiebt hoher Druck das Gleichgewicht <span style="font-family:var(--font-mono)">${r[0]}</span>?`, label: "Seite:", placeholder: "rechts oder links", answer: a, check: (raw) => { const t = raw.trim().toLowerCase(); const v = /recht/.test(t) ? "rechts" : /link/.test(t) ? "links" : null; return v === a ? { ok: true } : { ok: false, msg: "Zähle nur die Gasteilchen auf beiden Seiten." }; }, solution: `Gasteilchen ${r[2]} → ${r[3]}: <b>${a}</b>` }; }
  const OPT = [["N₂ + 3 H₂ ⇌ 2 NH₃ (exotherm)", "hoch", "niedrig"], ["2 SO₂ + O₂ ⇌ 2 SO₃ (exotherm)", "hoch", "niedrig"], ["N₂O₄ ⇌ 2 NO₂ (endotherm)", "niedrig", "hoch"], ["C(s) + CO₂ ⇌ 2 CO (endotherm)", "niedrig", "hoch"], ["PCl₅ ⇌ PCl₃ + Cl₂ (endotherm)", "niedrig", "hoch"], ["2 NO + O₂ ⇌ 2 NO₂ (exotherm)", "hoch", "niedrig"]];
  function genOpt() { const [e, p, t] = pick(OPT); const which = pick(["Druck", "Temperatur"]); const a = which === "Druck" ? p : t;
    return { html: `Welcher <b>${which}</b> ergibt bei <span style="font-family:var(--font-mono)">${e}</span> eine hohe Produktausbeute im Gleichgewicht: hoch oder niedrig?`, label: `${which}:`, placeholder: "hoch oder niedrig", answer: a, check: (raw) => { const t2 = raw.trim().toLowerCase(); const v = /hoch/.test(t2) ? "hoch" : /niedrig|tief/.test(t2) ? "niedrig" : null; return v === a ? { ok: true } : { ok: false, msg: which === "Druck" ? "Seite mit weniger Gasteilchen bevorzugen." : "Exotherm: Kälte begünstigt die Produkte." }; }, solution: `<b>${a}</b>` }; }
  LK.trainer({ el: "#trainer", modes: [
    { id: "lc", label: "Le Chatelier", gen: genLC },
    { id: "druck", label: "Druck und Gasteilchen", gen: genGas },
    { id: "opt", label: "Optimale Bedingungen", gen: genOpt }
  ] });

  LK.quiz({ box: "#quizBox", bar: "#qBar", progress: "#qProgress", key: "gg.best", n: 8, questions: [
    { q: "Was gilt im chemischen Gleichgewicht?", o: ["Die Reaktion steht still", "Hin- und Rückreaktion laufen gleich schnell", "Alle Konzentrationen sind gleich", "Es gibt nur Produkte"], a: 1, e: "Dynamisches Gleichgewicht." },
    { q: "Was verschiebt das Gleichgewicht nicht?", o: ["Temperatur", "Druck", "Katalysator", "Konzentration"], a: 2, e: "Er beschleunigt nur die Einstellung." },
    { q: "N₂ + 3 H₂ ⇌ 2 NH₃: Druckerhöhung verschiebt …", o: ["nach rechts", "nach links", "gar nicht", "zufällig"], a: 0, e: "4 Gasteilchen → 2." },
    { q: "Exotherme Hinreaktion, Temperatur wird erhöht. Folge?", o: ["Mehr Produkte", "Mehr Edukte", "Keine Änderung", "Explosion"], a: 1, e: "Die endotherme Rückreaktion wird begünstigt." },
    { q: "Warum arbeitet das Haber-Bosch-Verfahren bei etwa 450 °C, obwohl niedrigere Temperaturen mehr NH₃ ergäben?", o: ["Weil es billiger ist", "Sonst wäre die Reaktion zu langsam", "Weil Eisen schmilzt", "Weil NH₃ sonst explodiert"], a: 1, e: "Kompromiss aus Ausbeute und Geschwindigkeit." },
    { q: "Was beobachtet man beim Abkühlen des NO₂/N₂O₄-Gemisches?", o: ["Es wird dunkler", "Es wird heller", "Keine Änderung", "Es wird grün"], a: 1, e: "Exotherme Bildung von farblosem N₂O₄." },
    { q: "Warum bilden sich Tropfsteine in Höhlen?", o: ["Wasser verdunstet nicht", "CO₂ entweicht, das Gleichgewicht verschiebt sich zum Kalk", "Kalk wird oxidiert", "Durch Druckerhöhung"], a: 1, e: "Weniger CO₂, Gleichgewicht nach links." },
    { q: "Woran erkennt man von außen, dass ein Gleichgewicht vorliegt?", o: ["Es blubbert", "Die Konzentrationen bleiben konstant", "Es wird warm", "Gar nicht"], a: 1, e: "Makroskopisch keine Änderung mehr." }
  ] });

  LK.views(["verstehen", "dynamisch", "verschieben", "ammoniak", "ueben", "alltag", "quiz"], {
    dynamisch: () => { if (!dRaf && !reduce()) dRaf = requestAnimationFrame(loopD); else if (reduce()) { for (let i = 0; i < 150; i++) stepD(); drawD(); } },
    verschieben: () => { if (!vRaf && !reduce()) vRaf = requestAnimationFrame(loopV); }
  });
})();
