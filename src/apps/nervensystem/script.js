(function () {
  "use strict";
  const { $, $$, pick, fmt, numText } = LK;

  // ---------- clickable figures ----------
  const NC = { soma: "#e6c6ee", line: "#8e5aa0", myelin: "#f3e2a8", myelinLine: "#b8962e" };
  const SEG = [140, 192, 244, 296, 348]; // myelin segments (width 44)
  const GAPS = [188, 240, 292, 344];
  const NEURON = [
    { id: "dendriten", name: "Dendriten", info: "Kurze, verzweigte Fortsätze. Sie empfangen Signale von Sinneszellen oder anderen Nervenzellen und leiten sie zum Zellkörper.",
      svg: () => { const d = "M52 132 L28 100 L12 92 M28 100 L22 78 M50 166 L24 196 L10 200 M24 196 L20 220 M70 122 L60 88 L46 70 M60 88 L70 66 M72 178 L62 214 L50 232 M62 214 L76 236"; return `<path class="shape" d="${d}" fill="none" stroke="${NC.line}" stroke-width="4" stroke-linecap="round"/><path class="hit" d="${d}"/>`; }, lab: [40, 40, "middle", 50, 68] },
    { id: "zellkoerper", name: "Zellkörper", info: "Hier laufen die Signale der Dendriten zusammen. Er enthält den Zellkern und hält die Zelle am Leben.",
      svg: () => `<ellipse class="shape" cx="80" cy="150" rx="34" ry="30" fill="${NC.soma}" stroke="${NC.line}" stroke-width="2"/>`, lab: [150, 96, "start", 104, 132] },
    { id: "zellkern", name: "Zellkern", info: "Er enthält die Erbinformation und steuert die Zelle.",
      svg: () => `<circle class="shape" cx="78" cy="148" r="12" fill="${NC.line}" stroke="#5c3470" stroke-width="1.5"/>`, lab: [86, 262, "middle", 78, 162] },
    { id: "axon", name: "Axon (Nervenfaser)", info: "Ein langer Fortsatz, der das Signal vom Zellkörper weiterleitet. Bei manchen Nervenzellen ist er über einen Meter lang, zum Beispiel vom Rückenmark bis in den Fuß.",
      svg: () => `<path class="shape" d="M112 150 H402" stroke="${NC.line}" stroke-width="5" fill="none"/><path class="hit" d="M112 150 H140"/>`, lab: [128, 222, "middle", 126, 153] },
    { id: "myelin", name: "Myelinscheide (Markscheide)", info: "Eine fetthaltige Hülle um das Axon. Sie isoliert es wie die Hülle eines Kabels. So springt das Signal von Schnürring zu Schnürring und ist viel schneller.",
      svg: () => SEG.map((x) => `<rect class="shape" x="${x}" y="139" width="44" height="22" rx="10" fill="${NC.myelin}" stroke="${NC.myelinLine}" stroke-width="1.5"/>`).join(""), lab: [318, 100, "middle", 318, 138] },
    { id: "schnuerring", name: "Schnürring", info: "Eine kleine Lücke zwischen zwei Abschnitten der Myelinscheide. Das Signal springt von einem Schnürring zum nächsten.",
      svg: () => GAPS.map((x) => `<circle class="shape" cx="${x}" cy="150" r="5" fill="none" stroke="${NC.line}" stroke-width="1.5"/><circle class="hitfill" cx="${x}" cy="150" r="9"/>`).join(""), lab: [300, 222, "middle", 292, 157] },
    { id: "endknoepfchen", name: "Endknöpfchen (Synapse)", info: "Die verdickten Enden des Axons. Hier wird das Signal an der Synapse mit einem Botenstoff auf die nächste Zelle übertragen, zum Beispiel auf eine Muskelzelle.",
      svg: () => { const d = "M402 150 L432 114 M402 150 L444 150 M402 150 L432 186"; return `<path class="shape" d="${d}" stroke="${NC.line}" stroke-width="4" fill="none"/>` + [[432, 114], [444, 150], [432, 186]].map(([x, y]) => `<circle class="shape" cx="${x}" cy="${y}" r="7" fill="${NC.soma}" stroke="${NC.line}" stroke-width="2"/>`).join(""); }, lab: [412, 70, "middle", 430, 104] }
  ];
  const stemL = (y) => 236 + ((y - 166) * 26) / 80, stemR = (y) => 262 + ((y - 166) * 22) / 80;
  const stemPart = (y1, y2, bulge = 0) => `M${stemL(y1)} ${y1} ${bulge ? `Q${stemL((y1 + y2) / 2) - bulge} ${(y1 + y2) / 2} ` : "L"}${stemL(y2)} ${y2} L${stemR(y2)} ${y2} L${stemR(y1)} ${y1} Z`;
  const BRAIN = [
    { id: "grosshirn", name: "Großhirn", info: "Der größte Teil des Gehirns mit der gefalteten Großhirnrinde. Hier entstehen Denken, Lernen, Gedächtnis, Sprache und bewusste Wahrnehmung. Es startet auch bewusste Bewegungen.",
      svg: () => `<path class="shape" d="M70 160 C60 90 120 40 210 38 C310 36 392 80 395 150 C397 182 372 196 335 192 C300 189 282 176 252 174 C204 172 152 198 110 195 C82 193 72 181 70 160 Z" fill="#f2b8b0" stroke="#b5554d" stroke-width="2"/>
        <path class="deco" d="M110 120 C130 100 150 130 170 105 C190 82 210 115 230 90 M150 160 C170 140 190 165 210 140 C230 118 255 150 275 125 C295 102 315 130 335 110 M260 70 C280 90 300 65 320 85 C340 105 355 90 372 112 M95 150 C110 135 125 150 140 135"/>`, lab: [120, 24, "middle", 150, 60] },
    { id: "zwischenhirn", name: "Zwischenhirn", info: "Liegt tief im Inneren. Es regelt Körpertemperatur, Hunger, Durst und Schlaf und leitet Sinneseindrücke an das Großhirn weiter.",
      svg: () => `<ellipse class="shape" cx="246" cy="150" rx="26" ry="15" fill="#f7d79a" stroke="#b8962e" stroke-width="1.8"/>`, lab: [95, 236, "middle", 224, 157] },
    { id: "kleinhirn", name: "Kleinhirn", info: "Sitzt hinten unter dem Großhirn. Es sorgt für das Gleichgewicht und dafür, dass Bewegungen fein abgestimmt und flüssig ablaufen.",
      svg: () => `<path class="shape" d="M285 205 C290 182 330 178 360 186 C388 194 392 222 372 236 C350 250 300 246 288 230 C283 223 283 213 285 205 Z" fill="#c9a0dc" stroke="#7b4bb0" stroke-width="2"/><path class="deco" d="M298 205 C320 196 350 198 378 210 M296 220 C320 212 352 214 380 224 M302 234 C324 228 348 230 368 238"/>`, lab: [420, 268, "middle", 372, 238] },
    { id: "mittelhirn", name: "Mittelhirn", info: "Teil des Hirnstamms. Es ist an Reflexen von Auge und Ohr beteiligt, zum Beispiel am Pupillenreflex.",
      svg: () => `<path class="shape" d="${stemPart(166, 192)}" fill="#e8b97a" stroke="#a0702c" stroke-width="1.5"/>`, lab: [225, 214, "end", 243, 184] },
    { id: "bruecke", name: "Brücke", info: "Teil des Hirnstamms. Sie verbindet Großhirn, Kleinhirn und Rückenmark und hilft bei der Steuerung der Atmung.",
      svg: () => `<path class="shape" d="${stemPart(192, 218, 9)}" fill="#ddb06e" stroke="#a0702c" stroke-width="1.5"/>`, lab: [220, 242, "end", 238, 206] },
    { id: "nachhirn", name: "Nachhirn (verlängertes Mark)", info: "Der unterste Teil des Hirnstamms. Hier werden lebenswichtige Vorgänge gesteuert: Atmung, Herzschlag, Blutdruck, Schlucken, Husten und Niesen.",
      svg: () => `<path class="shape" d="${stemPart(218, 246)}" fill="#e8c287" stroke="#a0702c" stroke-width="1.5"/>`, lab: [228, 272, "end", 256, 236] },
    { id: "rueckenmark", name: "Rückenmark", info: "Verbindet das Gehirn mit dem Körper. Es leitet Signale hinauf und hinab und schaltet viele Reflexe selbst um. Es liegt geschützt in der Wirbelsäule.",
      svg: () => `<path class="shape" d="M${stemL(246)} 246 L267 298 L281 298 L${stemR(246)} 246 Z" fill="#f2d27a" stroke="#b8962e" stroke-width="1.5"/>`, lab: [338, 292, "middle", 280, 286] }
  ];
  const FIGS = { neuron: { parts: NEURON, extra: '<path class="lead" d="M150 282 H330 M322 276 L330 282 L322 288"/><text x="240" y="276" text-anchor="middle" style="fill: var(--muted)">Richtung des Signals</text>' },
    brain: { parts: BRAIN, extra: '<text x="62" y="110" text-anchor="end" style="fill: var(--muted)">Stirn</text>' } };
  let fig = "neuron", mode = "explore", sel = null, wrong = null, target = null, score = [0, 0];
  function drawFig() {
    const F = FIGS[fig];
    let s = F.extra;
    F.parts.forEach((p) => { s += `<g class="part${sel === p.id ? " sel" : ""}${wrong === p.id ? " wrong" : ""}" data-part="${p.id}">${p.svg()}</g>`; });
    if (mode === "explore") F.parts.forEach((p) => {
      const [x, y, a, lx, ly] = p.lab;
      // end-anchored labels get their leader from the right end of the text
      const [x1, y1] = a === "end" ? [x + 3, y - 4] : [x, y + (ly > y ? 4 : -12)];
      s += `<line class="lead" x1="${x1}" y1="${y1}" x2="${lx}" y2="${ly}"/><text class="lab" x="${x}" y="${y}" text-anchor="${a}"${sel === p.id ? ' style="fill: var(--accent)"' : ""}>${p.name.replace(/ \(.*\)/, "")}</text>`;
    });
    $("#figSvg").innerHTML = s;
    $$("#figSvg .part").forEach((g) => g.addEventListener("click", () => clickPart(g.dataset.part)));
    figInfo();
  }
  function figInfo(msg = "") {
    const F = FIGS[fig];
    if (mode === "explore") {
      const p = F.parts.find((q) => q.id === sel);
      $("#figInfo").innerHTML = p ? `<span class="eyebrow">Ausgewählt</span><h3>${p.name}</h3><p class="small">${p.info}</p>` : `<span class="eyebrow">Erkunden</span><p class="small">Tippe auf einen Teil der ${fig === "neuron" ? "Nervenzelle" : "Abbildung"}, um mehr darüber zu erfahren.</p>`;
    } else {
      const t = F.parts.find((q) => q.id === target);
      $("#figInfo").innerHTML = `<span class="eyebrow">Abfragen · ${score[0]} von ${score[1]} richtig</span><h3>Wo ist: ${t.name}?</h3><p class="small">${msg || "Tippe auf den Teil im Bild."}</p>`;
    }
  }
  function newTarget() { const ps = FIGS[fig].parts; let t; do { t = pick(ps).id; } while (t === target); target = t; sel = null; wrong = null; drawFig(); }
  function clickPart(id) {
    if (mode === "explore") { sel = id; drawFig(); return; }
    if (sel === target) return;
    const p = FIGS[fig].parts.find((q) => q.id === id);
    score[1]++;
    if (id === target) { score[0]++; sel = id; wrong = null; drawFig(); figInfo('<b class="ok">Richtig!</b>'); setTimeout(newTarget, 1100); }
    else { wrong = id; drawFig(); figInfo(`<b class="no">Nicht ganz.</b> Das ist: ${p.name}. Versuch es noch einmal.`); }
  }
  function reset() { sel = null; wrong = null; target = null; if (mode === "quiz") { score = [0, 0]; newTarget(); } else drawFig(); }
  $$("[data-fig]").forEach((b) => b.addEventListener("click", () => { fig = b.dataset.fig; $$("[data-fig]").forEach((x) => x.setAttribute("aria-pressed", String(x === b))); reset(); }));
  $$("[data-mode]").forEach((b) => b.addEventListener("click", () => { mode = b.dataset.mode; $$("[data-mode]").forEach((x) => x.setAttribute("aria-pressed", String(x === b))); reset(); }));

  // ---------- signal path ----------
  const BOX = { gehirn: [230, 45, 150, 44, "Gehirn"], rm: [230, 160, 150, 40, "Rückenmark"], muskel: [390, 255, 120, 40, "Muskel"] };
  const NERVES = {
    sens: ["M70 235 V160 H155", "sensorischer Nerv", 78, 205],
    motor: ["M305 160 H390 V235", "motorischer Nerv", 330, 150],
    up: ["M212 140 V67", "zum Gehirn", 150, 108],
    down: ["M248 67 V140", "vom Gehirn", 256, 108],
    seh: ["M130 45 H155", "Sehnerv", 120, 15]
  };
  const SC = {
    herd: { label: "Heiße Herdplatte (Reflex)", rec: [70, 255, "Haut der Hand"], steps: [
      { t: "Reiz", x: "Die Hand berührt die heiße Herdplatte. Sinneszellen in der Haut melden Hitze und Schmerz.", on: ["rec"] },
      { t: "Sensorischer Nerv", x: "Ein sensorischer Nerv leitet das Signal zum Rückenmark.", on: ["rec", "sens"], move: "sens" },
      { t: "Umschaltung im Rückenmark", x: "Das Rückenmark schaltet das Signal direkt auf einen motorischen Nerv um. Das Gehirn wird nicht gefragt. Das spart Zeit: Reflexbogen.", on: ["rm"] },
      { t: "Motorischer Nerv", x: "Der motorische Nerv leitet den Befehl zum Armmuskel.", on: ["rm", "motor"], move: "motor" },
      { t: "Reaktion", x: "Der Muskel zieht sich zusammen, die Hand zuckt zurück, nach weniger als einer Zehntelsekunde.", on: ["muskel"] },
      { t: "Erst jetzt: Schmerz", x: "Gleichzeitig läuft ein Signal zum Gehirn. Erst dort wird der Schmerz bewusst. Da ist die Hand schon in Sicherheit.", on: ["rm", "up", "gehirn"], move: "up" }
    ] },
    knie: { label: "Kniesehnenreflex", rec: [70, 255, "Sinneszellen im Muskel"], steps: [
      { t: "Reiz", x: "Der Hammer trifft die Sehne unter der Kniescheibe. Der Oberschenkelmuskel wird kurz gedehnt. Sinneszellen im Muskel melden das.", on: ["rec"] },
      { t: "Sensorischer Nerv", x: "Das Signal läuft über einen sensorischen Nerv zum Rückenmark.", on: ["rec", "sens"], move: "sens" },
      { t: "Umschaltung im Rückenmark", x: "Im Rückenmark wird direkt auf den motorischen Nerv umgeschaltet. Das Gehirn ist nicht beteiligt.", on: ["rm"] },
      { t: "Motorischer Nerv", x: "Der motorische Nerv leitet den Befehl zum Oberschenkelmuskel zurück.", on: ["rm", "motor"], move: "motor" },
      { t: "Reaktion", x: "Der Muskel zieht sich zusammen, der Unterschenkel schnellt nach vorn. Du kannst das kaum verhindern.", on: ["muskel"] }
    ] },
    ball: { label: "Ball fangen (bewusst)", rec: [70, 45, "Auge"], steps: [
      { t: "Reiz", x: "Ein Ball fliegt auf dich zu. Die Lichtsinneszellen im Auge nehmen ihn wahr.", on: ["rec"] },
      { t: "Sehnerv", x: "Der Sehnerv leitet die Signale zum Gehirn.", on: ["rec", "seh"], move: "seh" },
      { t: "Verarbeitung im Großhirn", x: "Das Großhirn erkennt den Ball, schätzt Richtung und Tempo und plant die Bewegung. Das Kleinhirn stimmt sie fein ab. Das braucht Zeit.", on: ["gehirn"] },
      { t: "Durch das Rückenmark", x: "Der Befehl läuft vom Gehirn durch das Rückenmark nach unten.", on: ["gehirn", "down", "rm"], move: "down" },
      { t: "Motorischer Nerv", x: "Ein motorischer Nerv leitet den Befehl zu den Arm- und Handmuskeln.", on: ["rm", "motor"], move: "motor" },
      { t: "Reaktion", x: "Die Muskeln ziehen sich zusammen, du fängst den Ball. Eine bewusste Reaktion dauert etwa 0,2 bis 0,3 Sekunden.", on: ["muskel"] }
    ] }
  };
  let sc = "herd", step = 0, timer = null, anim = 0;
  $("#sModes").innerHTML = Object.entries(SC).map(([k, v], i) => `<button type="button" data-sc="${k}" aria-pressed="${i === 0}">${v.label}</button>`).join("");
  const boxSvg = ([x, y, w, h, t], on, cls = "") => `<rect class="box${on ? " on" : ""}" x="${x - w / 2}" y="${y - h / 2}" width="${w}" height="${h}" rx="10"/><text class="bold ${cls}" x="${x}" y="${y + 4}" text-anchor="middle">${t}</text>`;
  function drawPath() {
    const S = SC[sc], st = S.steps[step], on = new Set(st.on);
    const used = sc === "ball" ? ["seh", "down", "motor"] : ["sens", "motor", "up"];
    let s = "";
    used.forEach((k) => { const [d, lab, lx, ly] = NERVES[k]; s += `<path id="nv-${k}" class="nerve${on.has(k) ? " on" : ""}" d="${d}"/><text class="tag" x="${lx}" y="${ly}">${lab}</text>`; });
    s += boxSvg(BOX.gehirn, on.has("gehirn")) + boxSvg(BOX.rm, on.has("rm")) + boxSvg(BOX.muskel, on.has("muskel"));
    const [rx, ry, rl] = S.rec;
    const words = rl.split(" "), lines = rl.length > 16 ? [words.slice(0, Math.ceil(words.length / 2)).join(" "), words.slice(Math.ceil(words.length / 2)).join(" ")] : [rl];
    s += `<rect class="box${on.has("rec") ? " on" : ""}" x="${rx - 60}" y="${ry - 20 - (lines.length - 1) * 8}" width="120" height="${40 + (lines.length - 1) * 16}" rx="10"/>`;
    lines.forEach((l, i) => { s += `<text class="bold" x="${rx}" y="${ry + 4 - (lines.length - 1) * 8 + i * 16}" text-anchor="middle" style="font-size:${lines.length > 1 ? 11 : 12.5}px">${l}</text>`; });
    s += `<circle class="dot" id="sDot" r="7" cx="-20" cy="-20"/>`;
    $("#sSvg").innerHTML = s;
    $("#sStep").textContent = `${S.label} · Schritt ${step + 1} von ${S.steps.length}`;
    $("#sTitle").textContent = st.t; $("#sText").textContent = st.x;
    $("#sPrev").disabled = step === 0; $("#sNext").disabled = step === S.steps.length - 1;
    cancelAnimationFrame(anim);
    if (st.move) {
      const p = $("#nv-" + st.move), L = p.getTotalLength(), dot = $("#sDot"), t0 = performance.now();
      const reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
      const f = (now) => { const u = reduce ? 1 : Math.min(1, (now - t0) / 1200); const q = p.getPointAtLength(u * L); dot.setAttribute("cx", q.x); dot.setAttribute("cy", q.y); if (u < 1) anim = requestAnimationFrame(f); };
      anim = requestAnimationFrame(f);
    }
  }
  function stop() { if (timer) { clearInterval(timer); timer = null; $("#sPlay").textContent = "Abspielen"; } }
  $$("[data-sc]").forEach((b) => b.addEventListener("click", () => { stop(); sc = b.dataset.sc; step = 0; $$("[data-sc]").forEach((x) => x.setAttribute("aria-pressed", String(x === b))); drawPath(); }));
  $("#sPrev").addEventListener("click", () => { stop(); if (step > 0) { step--; drawPath(); } });
  $("#sNext").addEventListener("click", () => { stop(); if (step < SC[sc].steps.length - 1) { step++; drawPath(); } });
  $("#sPlay").addEventListener("click", () => {
    if (timer) { stop(); return; }
    step = 0; drawPath(); $("#sPlay").textContent = "Stopp";
    timer = setInterval(() => { if (step < SC[sc].steps.length - 1) { step++; drawPath(); } else stop(); }, 2400);
  });

  // ---------- reaction test ----------
  const box = $("#rtBox"); let rtState = "idle", rtTimer = null, t0 = 0, times = [];
  function setRt(state, text) { rtState = state; box.dataset.state = state; box.textContent = text; }
  function rtShow() {
    $("#rtList").innerHTML = times.map((t) => `<li>${t} ms</li>`).join("") || "<li>noch keine</li>";
    if (!times.length) { $("#rtAvg").textContent = ""; return; }
    const avg = Math.round(times.reduce((a, b) => a + b, 0) / times.length), best = Math.min(...times);
    const rate = avg < 250 ? "Sehr schnell!" : avg < 350 ? "Gut, das ist ein typischer Wert." : "Probier es noch ein paar Mal. Die ersten Versuche sind oft langsamer.";
    $("#rtAvg").innerHTML = `Durchschnitt: <strong>${avg} ms</strong> · Bestwert: <strong>${best} ms</strong>. ${rate}`;
  }
  function rtPress() {
    if (rtState === "idle" || rtState === "done" || rtState === "early") {
      setRt("wait", "Warte auf Grün …");
      rtTimer = setTimeout(() => { setRt("go", "Jetzt tippen!"); t0 = performance.now(); }, 1500 + Math.random() * 2500);
    } else if (rtState === "wait") {
      clearTimeout(rtTimer); setRt("early", "Zu früh! Tippe zum Neustart.");
    } else if (rtState === "go") {
      const t = Math.round(performance.now() - t0);
      times = [t, ...times].slice(0, 5); rtShow();
      setRt("done", `${t} ms · Tippe für den nächsten Versuch`);
    }
  }
  box.addEventListener("pointerdown", (e) => { e.preventDefault(); rtPress(); });
  box.addEventListener("keydown", (e) => { if (e.key === " " || e.key === "Enter") { e.preventDefault(); rtPress(); } });
  document.addEventListener("keydown", (e) => { if (e.key === " " && location.hash === "#reaktion" && document.activeElement !== box) { e.preventDefault(); rtPress(); } });
  $("#rtReset").addEventListener("click", () => { times = []; rtShow(); });
  rtShow();

  // ---------- trainer ----------
  const TERMS = [
    ["Fortsätze einer Nervenzelle, die Signale empfangen", "Dendriten", /dendrit/],
    ["Langer Fortsatz einer Nervenzelle, der das Signal weiterleitet", "Axon", /axon|nervenfaser|neurit/],
    ["Isolierende Hülle um das Axon, die die Leitung beschleunigt", "Myelinscheide", /myelin|markscheide/],
    ["Kontaktstelle, an der ein Signal mit Botenstoff auf die nächste Zelle übertragen wird", "Synapse", /synap/],
    ["Fachwort für Nervenzelle", "Neuron", /neuron/],
    ["Gehirn und Rückenmark zusammen", "Zentrales Nervensystem (ZNS)", /zns|zentral/],
    ["Schnelle, angeborene Reaktion, die nicht bewusst gesteuert wird", "Reflex", /reflex/],
    ["Nerven, die Signale von den Sinnesorganen zum ZNS leiten", "sensorische Nerven", /sensor|sensib|afferen/],
    ["Nerven, die Befehle vom ZNS zu den Muskeln leiten", "motorische Nerven", /motor|efferen/],
    ["Teil des vegetativen Nervensystems, der den Körper auf Leistung und Gefahr einstellt", "Sympathikus", /sympath/],
    ["Teil des vegetativen Nervensystems, der für Ruhe und Verdauung sorgt", "Parasympathikus", /parasymp/],
    ["Liegt in der Wirbelsäule und schaltet viele Reflexe um", "Rückenmark", /r(ü|ue|u)ckenmark/],
    ["Eine Veränderung in der Umwelt oder im Körper, die Sinneszellen wahrnehmen", "Reiz", /^reiz/],
    ["Lücke in der Myelinscheide, an der das Signal „springt“", "Schnürring", /schn(ü|ue|u)rring/]
  ];
  function genTerm() {
    const [d, a, re] = pick(TERMS);
    return { html: `Wie heißt das? <b>${d}</b>`, label: "Begriff:", placeholder: "Fachbegriff", answer: a,
      check: (raw) => { const t = raw.trim().toLowerCase(); if (a === "Sympathikus" && /parasymp/.test(t)) return { ok: false, msg: "Das ist das Gegenstück. Gesucht ist der Teil für Leistung und Gefahr." }; return re.test(t) ? { ok: true } : { ok: false, msg: "Noch nicht. Schau unter „Verstehen“ nach." }; },
      solution: `<b>${a}</b>` };
  }
  const BR = [
    ["Du lernst Vokabeln und erinnerst dich am nächsten Tag daran.", "Großhirn"], ["Du verstehst einen Satz und antwortest.", "Großhirn"],
    ["Du siehst bewusst eine rote Ampel.", "Großhirn"], ["Du entscheidest, die Hand zu heben.", "Großhirn"],
    ["Du balancierst auf einem Baumstamm.", "Kleinhirn"], ["Beim Radfahren hältst du das Gleichgewicht.", "Kleinhirn"],
    ["Eine geübte Bewegung, etwa Klavierspielen, läuft flüssig ab.", "Kleinhirn"],
    ["Dir ist kalt, der Körper beginnt zu zittern, um die Temperatur zu halten.", "Zwischenhirn"], ["Du bekommst Durst.", "Zwischenhirn"],
    ["Du atmest im Schlaf weiter, ohne daran zu denken.", "Hirnstamm"], ["Das Herz schlägt ohne dein Zutun.", "Hirnstamm"], ["Du musst husten, weil dir etwas in die Luftröhre geraten ist.", "Hirnstamm"]
  ];
  const brainOf = (raw) => { const t = raw.trim().toLowerCase(); return /gro(ß|ss)hirn|gro(ß|ss)hirnrinde/.test(t) ? "Großhirn" : /kleinhirn/.test(t) ? "Kleinhirn" : /zwischenhirn|hypothal/.test(t) ? "Zwischenhirn" : /stamm|nachhirn|verl(ä|ae)ngert|br(ü|ue)cke|mittelhirn/.test(t) ? "Hirnstamm" : null; };
  function genBrain() {
    const [d, a] = pick(BR);
    return { html: `${d} Welcher Teil des Gehirns ist vor allem beteiligt?`, label: "Hirnteil:", placeholder: "Großhirn, Kleinhirn, Zwischenhirn oder Hirnstamm", answer: a,
      check: (raw) => { const v = brainOf(raw); if (!v) return { ok: false, msg: "Antworte mit Großhirn, Kleinhirn, Zwischenhirn oder Hirnstamm." }; return v === a ? { ok: true } : { ok: false, msg: "Bewusst und gelernt: Großhirn. Gleichgewicht: Kleinhirn. Temperatur, Hunger, Durst: Zwischenhirn. Atmung, Herzschlag: Hirnstamm." }; },
      solution: `<b>${a}</b>${a === "Hirnstamm" ? " (Nachhirn / verlängertes Mark)" : ""}` };
  }
  const RX = [
    ["Du ziehst die Hand von einer heißen Tasse weg, bevor du nachdenkst.", "Reflex"], ["Ein Insekt fliegt auf dein Auge zu, du schließt das Lid.", "Reflex"],
    ["Der Arzt klopft unter die Kniescheibe, das Bein schnellt vor.", "Reflex"], ["Staub in der Nase: Du musst niesen.", "Reflex"],
    ["Helles Licht: Die Pupille wird eng.", "Reflex"], ["Du schreibst deinen Namen.", "willkürlich"], ["Du fängst einen Ball, der dir zugeworfen wird.", "willkürlich"],
    ["Du hebst die Hand, um dich zu melden.", "willkürlich"], ["Du drückst beim Videospiel eine Taste.", "willkürlich"]
  ];
  function genRx() {
    const [d, a] = pick(RX);
    return { html: `${d} Reflex oder willkürliche (bewusste) Handlung?`, label: "Antwort:", placeholder: "Reflex oder willkürlich", answer: a,
      check: (raw) => { const t = raw.trim().toLowerCase(); const v = /reflex|unwill/.test(t) ? "Reflex" : /will|bewusst/.test(t) ? "willkürlich" : null;
        if (!v) return { ok: false, msg: "Antworte mit <code>Reflex</code> oder <code>willkürlich</code>." }; return v === a ? { ok: true } : { ok: false, msg: "Reflexe sind angeboren, schnell, laufen immer gleich ab und werden nicht bewusst gesteuert." }; },
      solution: a === "Reflex" ? "<b>Reflex</b>: angeboren, schnell, nicht bewusst gesteuert." : "<b>willkürlich</b>: bewusst geplant, das Großhirn entscheidet." };
  }
  function genTime() {
    const s = pick([0.5, 0.8, 1, 1.2, 1.5, 2]), v = pick([1, 2, 10, 20, 50, 60, 100, 120]);
    if (Math.random() < 0.6) {
      const t = (s / v) * 1000;
      return { html: `Ein Nervensignal läuft <b>${fmt(s, 1)} m</b> weit mit <b>${v} m/s</b>. Wie lange braucht es?`, label: "<i>t</i> =", placeholder: "in ms", answer: numText(t, 1),
        check: LK.check.num(t), hint: "Einheit: ms (Millisekunden). 1 s = 1 000 ms.",
        solution: `<span class="math"><i>t</i> = <i>s</i> : <i>v</i> = ${fmt(s, 1)} m : ${v} m/s = ${fmt(s / v, 4)} s = ${fmt(t, 1)} ms</span>` };
    }
    const t = pick([5, 10, 20, 25, 50]), sv = (v * t) / 1000;
    return { html: `Ein Signal braucht <b>${t} ms</b> bei <b>${v} m/s</b>. Wie lang ist die Nervenstrecke?`, label: "<i>s</i> =", placeholder: "in m", answer: numText(sv, 3),
      check: LK.check.num(sv), hint: "Einheit: m. Rechne ms zuerst in s um.",
      solution: `<span class="math"><i>s</i> = <i>v</i> · <i>t</i> = ${v} m/s · ${fmt(t / 1000, 3)} s = ${fmt(sv, 3)} m</span>` };
  }
  LK.trainer({ el: "#trainer", modes: [
    { id: "begriffe", label: "Fachbegriffe", gen: genTerm },
    { id: "hirn", label: "Welcher Hirnteil?", gen: genBrain },
    { id: "reflex", label: "Reflex oder willkürlich?", gen: genRx },
    { id: "zeit", label: "Signalzeit rechnen", gen: genTime }
  ] });

  // ---------- quiz ----------
  LK.quiz({ box: "#quizBox", bar: "#qBar", progress: "#qProgress", key: "nerven.best", n: 10, questions: [
    { q: "Was gehört zum zentralen Nervensystem (ZNS)?", o: ["Gehirn und Rückenmark", "Nur das Gehirn", "Alle Nerven in Armen und Beinen", "Herz und Gehirn"], a: 0, e: "Alle übrigen Nerven bilden das periphere Nervensystem." },
    { q: "Welche Nerven leiten Signale von den Sinnesorganen zum ZNS?", o: ["motorische", "sensorische", "vegetative", "keine"], a: 1, e: "Sensorisch = von den Sinnen." },
    { q: "Welcher Teil der Nervenzelle empfängt Signale?", o: ["Axon", "Dendriten", "Endknöpfchen", "Myelinscheide"], a: 1, e: "Das Axon leitet weiter, die Endknöpfchen geben ab." },
    { q: "Wozu dient die Myelinscheide?", o: ["Sie ernährt die Zelle", "Sie isoliert das Axon und macht die Leitung schneller", "Sie bildet Botenstoffe", "Sie empfängt Reize"], a: 1, e: "Das Signal springt von Schnürring zu Schnürring." },
    { q: "Was passiert an einer Synapse?", o: ["Das Signal wird mit einem Botenstoff übertragen", "Die Zelle teilt sich", "Ein Reiz entsteht", "Blut wird gefiltert"], a: 0, e: "So gelangt das Signal zur nächsten Zelle." },
    { q: "Wo wird der Rückziehreflex an der heißen Herdplatte umgeschaltet?", o: ["Im Großhirn", "Im Rückenmark", "Im Kleinhirn", "In der Hand"], a: 1, e: "Darum ist er so schnell. Das Gehirn erfährt es erst danach." },
    { q: "Welcher Hirnteil sorgt für das Gleichgewicht?", o: ["Großhirn", "Kleinhirn", "Zwischenhirn", "Rückenmark"], a: 1, e: "Es stimmt Bewegungen fein ab." },
    { q: "Welcher Hirnteil steuert Atmung und Herzschlag?", o: ["Großhirn", "Kleinhirn", "Hirnstamm (Nachhirn)", "Zwischenhirn"], a: 2, e: "Lebenswichtige Vorgänge laufen dort ohne Nachdenken." },
    { q: "Wo entstehen Denken und Gedächtnis?", o: ["Im Großhirn", "Im Rückenmark", "Im Kleinhirn", "In den Nerven"], a: 0, e: "In der Großhirnrinde." },
    { q: "Was bewirkt der Sympathikus?", o: ["Ruhe und Verdauung", "Leistung: schneller Herzschlag, weite Pupillen", "Schlaf", "Er senkt den Blutdruck"], a: 1, e: "Der Parasympathikus ist das Gegenstück für Ruhe und Erholung." },
    { q: "Wie lange dauert eine bewusste Reaktion ungefähr?", o: ["0,002 Sekunden", "0,2 bis 0,3 Sekunden", "2 bis 3 Sekunden", "20 Sekunden"], a: 1, e: "Den größten Teil der Zeit braucht das Gehirn." },
    { q: "Welche Aussage über Reflexe stimmt?", o: ["Sie werden gelernt", "Sie sind angeboren, schnell und laufen immer gleich ab", "Sie laufen immer über das Großhirn", "Sie sind langsamer als bewusste Reaktionen"], a: 1, e: "Zum Beispiel Lidschluss, Niesen, Kniesehnenreflex." }
  ] });

  LK.views(["verstehen", "bauteile", "signalweg", "reaktion", "ueben", "alltag", "quiz"], { bauteile: drawFig, signalweg: drawPath });
})();
