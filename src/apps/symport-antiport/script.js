(function () {
  "use strict";
  const { $, pick } = LK;

  // ---------- transporter simulation ----------
  // Species: label and colour (fixed colours, white text works in both themes)
  const SP = {
    na: ["Na⁺", "#d0782a"], k: ["K⁺", "#7b4bb0"], glc: ["Glc", "#2f7fb8"], ca: ["Ca²⁺", "#2e8a57"],
    h: ["H⁺", "#c0392b"], sac: ["Sac", "#9a6b1f"], cl: ["Cl⁻", "#3f8f8f"], hco: ["HCO₃⁻", "#5a6b7d"]
  };
  // dir: +1 = into the cell, -1 = out of the cell
  // drive: "self" = passive, needs a gradient of the first species; "atp" = primary active;
  // "grad" = secondary active, needs a gradient of species `by` (outside > inside)
  const T = [
    { name: "GLUT: Glucose-Transporter", type: "Uniport", energy: "passiv (erleichterte Diffusion)", drive: "self",
      start: { glc: [10, 3] }, parts: [["glc", 1, 1]],
      text: "GLUT lässt Glucose nur <strong>mit ihrem Gefälle</strong> in die Zelle. Sind innen und außen gleich viele Glucose-Teilchen, kommt netto nichts mehr hinein. Energie braucht der Carrier nicht." },
    { name: "SGLT1: Na⁺-Glucose-Symporter (Darm)", type: "Symport", energy: "sekundär aktiv (Na⁺-Gefälle)", drive: "grad", by: "na",
      start: { na: [16, 2], glc: [6, 4] }, parts: [["na", 2, 1], ["glc", 1, 1]], regen: { sp: "na", n: 3, label: "Na⁺/K⁺-Pumpe: 3 Na⁺ hinaus (1 ATP)" },
      text: "Je <strong>2 Na⁺</strong> strömen mit ihrem Gefälle hinein und nehmen <strong>1 Glucose</strong> mit, sogar <strong>gegen</strong> deren Gefälle. Der Symporter verbraucht kein ATP. Wird das Na⁺-Gefälle aufgebraucht, stoppt er. Dann muss die Na⁺/K⁺-Pumpe Na⁺ wieder hinausschaffen." },
    { name: "Na⁺/K⁺-Pumpe", type: "Antiport", energy: "primär aktiv (ATP)", drive: "atp",
      start: { na: [10, 6], k: [5, 10] }, parts: [["na", 3, -1], ["k", 2, 1]],
      text: "Pro Runde <strong>3 Na⁺ hinaus</strong> und <strong>2 K⁺ hinein</strong>, beide <strong>gegen</strong> ihr Gefälle. Die Energie kommt direkt aus der Spaltung von <strong>1 ATP</strong>." },
    { name: "NCX: Na⁺/Ca²⁺-Austauscher (Herz)", type: "Antiport", energy: "sekundär aktiv (Na⁺-Gefälle)", drive: "grad", by: "na",
      start: { na: [14, 3], ca: [6, 5] }, parts: [["na", 3, 1], ["ca", 1, -1]], regen: { sp: "na", n: 3, label: "Na⁺/K⁺-Pumpe: 3 Na⁺ hinaus (1 ATP)" },
      text: "<strong>3 Na⁺</strong> strömen hinein, dafür wird <strong>1 Ca²⁺</strong> hinausbefördert, gegen sein Gefälle. So sinkt nach jedem Herzschlag das Ca²⁺ in der Muskelzelle, und der Muskel entspannt sich." },
    { name: "H⁺-Saccharose-Symporter (Pflanze)", type: "Symport", energy: "sekundär aktiv (H⁺-Gefälle)", drive: "grad", by: "h",
      start: { h: [12, 3], sac: [3, 7] }, parts: [["h", 1, 1], ["sac", 1, 1]], regen: { sp: "h", n: 1, label: "Protonenpumpe: 1 H⁺ hinaus (1 ATP)" },
      text: "Pflanzen nutzen statt Na⁺ meist <strong>H⁺</strong>. Eine Protonenpumpe schafft H⁺ mit ATP hinaus. Strömt ein H⁺ zurück, nimmt es ein Saccharose-Molekül mit. So wird Zucker in die Leitbahnen geladen." },
    { name: "Cl⁻/HCO₃⁻-Austauscher (rote Blutzelle)", type: "Antiport", energy: "passiv", drive: "self",
      start: { hco: [3, 10], cl: [10, 3] }, parts: [["hco", 1, -1], ["cl", 1, 1]],
      text: "Ein <strong>passiver</strong> Antiport: HCO₃⁻ verlässt die Zelle mit seinem Gefälle, im Tausch kommt Cl⁻ herein. Ohne ATP. So transportiert das Blut CO₂ als HCO₃⁻ zur Lunge." }
  ];
  $("#tSel").innerHTML = T.map((t, i) => `<option value="${i}">${t.name}</option>`).join("");

  const OUT = [30, 400, 30, 112], IN = [30, 400, 196, 300], CX = 215, CY = 154;
  let cur, parts = [], atp = 0, rounds = 0, busy = false, flash = 0;
  // random free spot in a compartment: keeps a column around the carrier clear and avoids overlaps
  const rndIn = ([x0, x1, y0, y1]) => {
    let best = null, bestD = -1;
    for (let k = 0; k < 60; k++) {
      const x = x0 + Math.random() * (x1 - x0), y = y0 + Math.random() * (y1 - y0);
      if (Math.abs(x - CX) < 46) continue;
      const d = parts.reduce((m, p) => Math.min(m, Math.hypot(p.x - x, p.y - y)), 1e9);
      if (d > 34) return [x, y];
      if (d > bestD) { bestD = d; best = [x, y]; }
    }
    return best || [x0, y0];
  };
  function count(sp, side) { return parts.filter((p) => p.sp === sp && p.side === side).length; }
  function reset() {
    cur = T[+$("#tSel").value]; parts = []; atp = 0; rounds = 0; busy = false;
    Object.entries(cur.start).forEach(([sp, [o, i]]) => {
      for (let n = 0; n < o; n++) { const [x, y] = rndIn(OUT); parts.push({ sp, side: "out", x, y }); }
      for (let n = 0; n < i; n++) { const [x, y] = rndIn(IN); parts.push({ sp, side: "in", x, y }); }
    });
    $("#tType").textContent = `${cur.type} · ${cur.energy}`;
    $("#tText").innerHTML = cur.text;
    $("#tMsg").textContent = "";
    const rb = $("#tRegen"); rb.hidden = !cur.regen; if (cur.regen) rb.textContent = cur.regen.label;
    draw();
  }
  function draw() {
    let s = `<rect x="0" y="0" width="420" height="124" fill="var(--accent-soft)" opacity="0.5"/>`;
    s += `<text class="side" x="10" y="20">außen</text><text class="side" x="10" y="318">innen (Cytoplasma)</text>`;
    s += `<rect class="lipid" x="0" y="130" width="420" height="48"/>`;
    for (let x = 6; x < 420; x += 12) s += `<circle class="head" cx="${x}" cy="132" r="5"/><circle class="head" cx="${x}" cy="176" r="5"/>`;
    s += `<rect class="carrier" x="${CX - 34}" y="118" width="68" height="72" rx="18"/>`;
    if (flash > 0) s += `<text class="atp" x="${CX + 42}" y="${CY + 50}">ATP → ADP + P</text>`;
    parts.forEach((p) => {
      const [lab, col] = SP[p.sp], r = lab.length > 3 ? 15 : 12;
      s += `<g class="pt"><circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="${r}" fill="${col}"/><text x="${p.x.toFixed(1)}" y="${p.y.toFixed(1)}">${lab}</text></g>`;
    });
    $("#tSvg").innerHTML = s;
    const sps = Object.keys(cur.start);
    $("#tRo").innerHTML = sps.map((sp) => `<dt>${SP[sp][0]} außen / innen</dt><dd class="big">${count(sp, "out")} / ${count(sp, "in")}</dd>`).join("")
      + `<dt>Transportrunden</dt><dd>${rounds}</dd><dt>ATP verbraucht</dt><dd>${atp}</dd>`;
  }
  // animate a set of particles along paths [from, carrier, to]
  function animate(moves, done) {
    busy = true;
    const t0 = performance.now(), D = 1100;
    moves.forEach((m) => { m.from = [m.p.x, m.p.y]; m.to = rndIn(m.toSide === "out" ? OUT : IN); });
    function step(now) {
      const t = Math.min(1, (now - t0) / D);
      moves.forEach((m, i) => {
        const mid = [CX - 14 + (i % 3) * 14, CY + (m.toSide === "in" ? -8 : 8) + Math.floor(i / 3) * 16 * (m.toSide === "in" ? 1 : -1)];
        const [a, b, u] = t < 0.5 ? [m.from, mid, t * 2] : [mid, m.to, (t - 0.5) * 2];
        const e = u * u * (3 - 2 * u);
        m.p.x = a[0] + (b[0] - a[0]) * e; m.p.y = a[1] + (b[1] - a[1]) * e;
      });
      if (flash > 0) flash = t < 1 ? 1 : 0;
      draw();
      if (t < 1) requestAnimationFrame(step);
      else { moves.forEach((m) => { m.p.side = m.toSide; }); busy = false; draw(); done && done(); }
    }
    requestAnimationFrame(step);
  }
  function msg(t) { $("#tMsg").innerHTML = t; }
  $("#tGo").addEventListener("click", () => {
    if (busy) return;
    // enough particles on the source side?
    for (const [sp, n, dir] of cur.parts) {
      const src = dir > 0 ? "out" : "in";
      if (count(sp, src) < n) { msg(`<strong>Stopp:</strong> Auf der ${src === "out" ? "Außenseite" : "Innenseite"} ist nicht mehr genug ${SP[sp][0]} zum Binden.`); return; }
    }
    if (cur.drive === "self") {
      const [sp, , dir] = cur.parts[0];
      const src = dir > 0 ? "out" : "in", dst = dir > 0 ? "in" : "out";
      if (count(sp, src) <= count(sp, dst)) { msg(`<strong>Stopp:</strong> Für ${SP[sp][0]} gibt es kein Gefälle mehr. Ein passiver Transporter befördert netto nichts mehr.`); return; }
    }
    if (cur.drive === "grad" && count(cur.by, "out") <= count(cur.by, "in")) {
      msg(`<strong>Stopp:</strong> Das ${SP[cur.by][0]}-Gefälle ist aufgebraucht. Ohne Antrieb arbeitet der Transporter nicht. Lass die Pumpe laufen.`); return;
    }
    const moves = [];
    cur.parts.forEach(([sp, n, dir]) => {
      const src = dir > 0 ? "out" : "in";
      const cand = parts.filter((p) => p.sp === sp && p.side === src).sort((a, b) => Math.abs(a.x - CX) - Math.abs(b.x - CX)).slice(0, n);
      cand.forEach((p) => moves.push({ p, toSide: dir > 0 ? "in" : "out" }));
    });
    if (cur.drive === "atp") { atp++; flash = 1; }
    rounds++;
    msg(cur.drive === "grad" && count(cur.by, "out") - count(cur.by, "in") <= 4 ? `Das ${SP[cur.by][0]}-Gefälle wird kleiner.` : "");
    animate(moves);
  });
  $("#tRegen").addEventListener("click", () => {
    if (busy || !cur.regen) return;
    const { sp, n } = cur.regen;
    const cand = parts.filter((p) => p.sp === sp && p.side === "in").slice(0, n);
    if (cand.length < n) { msg(`Innen ist kein ${SP[sp][0]} mehr, das hinausgepumpt werden könnte.`); return; }
    atp++; flash = 1; msg("Die Pumpe baut das Gefälle mit ATP wieder auf.");
    animate(cand.map((p) => ({ p, toSide: "out" })));
  });
  $("#tReset").addEventListener("click", () => { if (!busy) reset(); });
  $("#tSel").addEventListener("change", () => { if (!busy) reset(); });
  reset();

  // ---------- classification cards ----------
  LK.cards({ el: "#cards", key: "symport.cards", items: [
    { ctx: "Darm", title: "Na⁺ und Glucose", text: "Ein Carrier befördert 2 Na⁺ und 1 Glucose gemeinsam in die Darmzelle.", o: ["Uniport", "Symport", "Antiport"], a: 1, e: "Zwei Stoffe, gleiche Richtung: Symport." },
    { ctx: "Nervenzelle", title: "Na⁺/K⁺-Pumpe", text: "3 Na⁺ werden hinaus-, 2 K⁺ hineinbefördert.", o: ["Uniport", "Symport", "Antiport"], a: 2, e: "Entgegengesetzte Richtungen: Antiport (primär aktiv, ATP)." },
    { ctx: "Fettgewebe", title: "GLUT4", text: "Ein Carrier lässt nur Glucose mit ihrem Gefälle in die Zelle.", o: ["Uniport", "Symport", "Antiport"], a: 0, e: "Eine Teilchensorte, eine Richtung: Uniport, passiv." },
    { ctx: "Herz", title: "Na⁺/Ca²⁺-Austauscher", text: "3 Na⁺ strömen hinein, 1 Ca²⁺ wird dafür hinausbefördert.", o: ["Symport", "Antiport", "Kanal"], a: 1, e: "Ein Austausch in Gegenrichtung ist ein Antiport, angetrieben vom Na⁺-Gefälle." },
    { ctx: "Energie", title: "Woher die Energie?", text: "Der Na⁺-Glucose-Symporter transportiert Glucose gegen ihr Gefälle. Woher stammt die Energie?", o: ["Direkt aus ATP", "Aus dem Na⁺-Gefälle", "Aus der Wärme"], a: 1, e: "Sekundär aktiv: Das Na⁺-Gefälle baut die Na⁺/K⁺-Pumpe mit ATP auf." },
    { ctx: "Blut", title: "Cl⁻ gegen HCO₃⁻", text: "Rote Blutzellen tauschen HCO₃⁻ gegen Cl⁻, beide mit ihrem Gefälle. Welche Transportart?", o: ["passiver Antiport", "primär aktiver Antiport", "Symport"], a: 0, e: "Antiport muss nicht aktiv sein. Hier laufen beide Stoffe bergab." },
    { ctx: "Pflanze", title: "Zucker in die Leitbahn", text: "H⁺ strömt in die Zelle und nimmt Saccharose mit.", o: ["Uniport", "Symport", "Antiport"], a: 1, e: "Gleiche Richtung: H⁺-Saccharose-Symport, sekundär aktiv." },
    { ctx: "Magen", title: "Protonenpumpe", text: "H⁺ werden mit ATP in den Magen gepumpt, dafür kommt K⁺ in die Zelle.", o: ["Symport, sekundär aktiv", "Antiport, primär aktiv", "Uniport, passiv"], a: 1, e: "Entgegengesetzte Richtungen und ATP direkt: primär aktiver Antiport." }
  ] });

  // ---------- trainer ----------
  // Each scenario: description, transport type, energy type
  const SC = [
    ["Ein Carrier bringt 2 Na⁺ und 1 Glucose zusammen in die Zelle.", "Symport", "sekundär aktiv"],
    ["Ein Carrier befördert 3 Na⁺ hinaus und 2 K⁺ hinein und spaltet dabei ATP.", "Antiport", "primär aktiv"],
    ["Glucose gelangt über einen Carrier mit ihrem Gefälle in eine Muskelzelle.", "Uniport", "passiv"],
    ["3 Na⁺ strömen hinein, gleichzeitig wird 1 Ca²⁺ hinausbefördert.", "Antiport", "sekundär aktiv"],
    ["Ein Na⁺ strömt in die Zelle, im Austausch wird ein H⁺ hinausbefördert.", "Antiport", "sekundär aktiv"],
    ["H⁺ und Saccharose gelangen gemeinsam in eine Pflanzenzelle.", "Symport", "sekundär aktiv"],
    ["Eine Pumpe befördert nur H⁺ mit ATP aus der Pflanzenzelle hinaus.", "Uniport", "primär aktiv"],
    ["HCO₃⁻ verlässt die Blutzelle mit seinem Gefälle, Cl⁻ kommt im Tausch herein.", "Antiport", "passiv"],
    ["Na⁺ und Aminosäuren werden gemeinsam in eine Darmzelle aufgenommen.", "Symport", "sekundär aktiv"],
    ["Fructose gelangt über einen Carrier ohne Energie und mit ihrem Gefälle in die Darmzelle.", "Uniport", "passiv"],
    ["Die Magenzelle pumpt H⁺ mit ATP hinaus und nimmt dafür K⁺ auf.", "Antiport", "primär aktiv"],
    ["Na⁺, K⁺ und 2 Cl⁻ werden zusammen in eine Nierenzelle befördert.", "Symport", "sekundär aktiv"]
  ];
  const norm = (s) => s.trim().toLowerCase().replace(/[-\s]+/g, " ");
  function typeOf(raw) { const t = norm(raw); return /^sym/.test(t) ? "Symport" : /^anti/.test(t) ? "Antiport" : /^uni/.test(t) ? "Uniport" : null; }
  function energyOf(raw) { const t = norm(raw); return /prim/.test(t) ? "primär aktiv" : /sek|sec/.test(t) ? "sekundär aktiv" : /pass/.test(t) ? "passiv" : null; }
  function genType() {
    const [d, ty] = pick(SC);
    return { html: d, label: "Typ:", placeholder: "Uniport, Symport oder Antiport", answer: ty,
      check: (raw) => { const v = typeOf(raw); if (!v) return { ok: false, msg: "Antworte mit <code>Uniport</code>, <code>Symport</code> oder <code>Antiport</code>." };
        return v === ty ? { ok: true } : { ok: false, msg: "Zähle die Teilchensorten und vergleiche ihre Richtungen." }; },
      solution: `<b>${ty}</b>: ${ty === "Uniport" ? "eine Teilchensorte" : ty === "Symport" ? "zwei Sorten, gleiche Richtung" : "zwei Sorten, entgegengesetzte Richtungen"}.` };
  }
  function genEnergy() {
    const [d, ty, en] = pick(SC);
    return { html: d, label: "Energie:", placeholder: "passiv, primär aktiv oder sekundär aktiv", answer: en,
      check: (raw) => { const v = energyOf(raw); if (!v) return { ok: false, msg: "Antworte mit <code>passiv</code>, <code>primär aktiv</code> oder <code>sekundär aktiv</code>." };
        return v === en ? { ok: true } : { ok: false, msg: "Wird ATP direkt gespalten? Oder treibt das Gefälle eines anderen Stoffs den Transport an?" }; },
      solution: `<b>${ty}, ${en}</b>. ${en === "passiv" ? "Alles läuft mit dem Gefälle, ohne Energie." : en === "primär aktiv" ? "Die Energie kommt direkt aus ATP." : "Die Energie kommt aus dem Gefälle von Na⁺ oder H⁺."}` };
  }
  const RATIOS = [
    { name: "Na⁺-Glucose-Symporter", a: "Na⁺", na: 2, b: "Glucose", nb: 1 },
    { name: "Na⁺/Ca²⁺-Austauscher", a: "Na⁺", na: 3, b: "Ca²⁺", nb: 1 },
    { name: "Na⁺/K⁺-Pumpe", a: "Na⁺", na: 3, b: "K⁺", nb: 2 }
  ];
  function genCount() {
    const r = pick(RATIOS), rounds = pick([20, 50, 100, 150, 200, 300, 500, 1000]);
    const askA = Math.random() < 0.5, val = askA ? r.na * rounds : r.nb * rounds;
    const given = askA ? `${r.nb * rounds} ${r.b}` : `${r.na * rounds} ${r.a}`;
    const asked = askA ? r.a : r.b;
    const sol = `Verhältnis ${r.na} ${r.a} : ${r.nb} ${r.b}. ${given} bedeutet ${rounds} Runden, also ${rounds} · ${askA ? r.na : r.nb} = <b>${val} ${asked}</b>.`;
    return { html: `Der <b>${r.name}</b> befördert pro Runde ${r.na} ${r.a} und ${r.nb} ${r.b}. Er hat gerade <b>${given}</b> befördert. Wie viele ${asked} waren es?`,
      label: `${asked}:`, placeholder: "Anzahl", answer: String(val), check: LK.check.num(val, { abs: 0.5 }), solution: sol + (r.name === "Na⁺/K⁺-Pumpe" ? ` Dabei wurden ${rounds} ATP verbraucht.` : "") };
  }
  LK.trainer({ el: "#trainer", modes: [
    { id: "typ", label: "Uni, Sym oder Anti?", gen: genType },
    { id: "energie", label: "Woher kommt die Energie?", gen: genEnergy },
    { id: "zaehlen", label: "Teilchen zählen", gen: genCount }
  ] });

  // ---------- quiz ----------
  LK.quiz({ box: "#quizBox", bar: "#qBar", progress: "#qProgress", key: "symport.best", n: 10, questions: [
    { q: "Was ist ein Symport?", o: ["Zwei Stoffe in dieselbe Richtung", "Zwei Stoffe in entgegengesetzte Richtungen", "Ein Stoff in eine Richtung", "Transport durch einen offenen Kanal"], a: 0, e: "syn = zusammen." },
    { q: "Was ist ein Antiport?", o: ["Zwei Stoffe in dieselbe Richtung", "Zwei Stoffe in entgegengesetzte Richtungen", "Transport ohne Protein", "Ein Stoff ohne Energie"], a: 1, e: "anti = gegen." },
    { q: "Welcher Transporter ist ein Uniport?", o: ["Na⁺/K⁺-Pumpe", "GLUT (Glucose-Transporter)", "Na⁺-Glucose-Symporter", "Na⁺/Ca²⁺-Austauscher"], a: 1, e: "GLUT befördert nur Glucose, mit dem Gefälle." },
    { q: "Woher bekommt der Na⁺-Glucose-Symporter seine Energie?", o: ["Direkt aus ATP", "Aus dem Na⁺-Gefälle", "Aus Licht", "Er braucht keine, Glucose fließt immer bergab"], a: 1, e: "Sekundär aktiver Transport." },
    { q: "Was bedeutet „primär aktiv“?", o: ["Energie direkt aus ATP", "Energie aus einem Ionengefälle", "Transport mit dem Gefälle", "Transport durch Kanäle"], a: 0, e: "Zum Beispiel die Na⁺/K⁺-Pumpe." },
    { q: "Welche Aussage stimmt?", o: ["Antiport ist immer aktiv", "Symport ist immer passiv", "Die Begriffe sagen nur etwas über die Richtung aus", "Uniport braucht immer ATP"], a: 2, e: "Ob Energie nötig ist, ist eine eigene Frage." },
    { q: "Was passiert mit dem Na⁺-Glucose-Symporter, wenn die Na⁺/K⁺-Pumpe ausfällt?", o: ["Er arbeitet schneller", "Er kommt allmählich zum Stillstand", "Er verbraucht dann selbst ATP", "Nichts"], a: 1, e: "Ohne Pumpe zerfällt das Na⁺-Gefälle, der Antrieb fehlt." },
    { q: "Wie viele Na⁺ nimmt der Darm-Symporter (SGLT1) pro Glucose mit?", o: ["1", "2", "3", "keine"], a: 1, e: "2 Na⁺ : 1 Glucose." },
    { q: "Der Na⁺/Ca²⁺-Austauscher im Herzen …", o: ["pumpt Ca²⁺ mit ATP hinein", "befördert 3 Na⁺ hinein und 1 Ca²⁺ hinaus", "ist ein Symport", "ist ein Kanal"], a: 1, e: "Ein sekundär aktiver Antiport." },
    { q: "Worin unterscheidet sich ein Carrier von einem Kanal?", o: ["Der Carrier ist immer nur zu einer Seite offen und ändert seine Form", "Der Carrier ist schneller", "Kanäle transportieren gegen das Gefälle", "Es gibt keinen Unterschied"], a: 0, e: "Kanäle sind durchgehend offen und sehr schnell." },
    { q: "Was nutzen Pflanzen meist statt Na⁺ als Antrieb für sekundär aktiven Transport?", o: ["K⁺", "H⁺ (Protonen)", "Cl⁻", "Glucose"], a: 1, e: "Eine Protonenpumpe baut das H⁺-Gefälle mit ATP auf." },
    { q: "Warum enthält eine Trinklösung gegen Durchfall Salz und Zucker?", o: ["Für den Geschmack", "Na⁺ und Glucose werden gemeinsam aufgenommen, Wasser folgt", "Zucker tötet Bakterien", "Salz verhindert Erbrechen"], a: 1, e: "Der Na⁺-Glucose-Symporter nimmt beides auf, das Wasser folgt osmotisch." }
  ] });

  LK.views(["verstehen", "transporter", "zuordnen", "ueben", "alltag", "quiz"], { transporter: draw });
})();
