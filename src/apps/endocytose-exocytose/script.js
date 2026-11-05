(function () {
  "use strict";
  const { $, $$, pick } = LK;

  // ---------- step-by-step figure ----------
  // Membrane shapes (outside is above y = 100)
  const FLAT = "M0 100 H420";
  const dip = (d) => `M0 100 H150 C185 100 175 ${100 + d} 210 ${100 + d} C245 ${100 + d} 235 100 270 100 H420`;
  const OMEGA = "M0 100 H182 C198 100 196 112 188 122 C168 146 178 190 210 190 C242 190 252 146 232 122 C224 112 222 100 238 100 H420";
  const ARMS = "M0 100 H125 C148 100 142 52 162 34 C172 24 186 30 181 44 C174 64 176 92 210 92 C244 92 246 64 239 44 C234 30 248 24 258 34 C278 52 272 100 295 100 H420";
  const mem = (d) => `<path class="mem" d="${d}"/><path class="mem2" d="${d}"/>`;
  const ves = (x, y, r) => `<circle class="mem" cx="${x}" cy="${y}" r="${r}"/><circle class="mem2" cx="${x}" cy="${y}" r="${r}"/>`;
  const dots = (pts, cls, r) => pts.map(([x, y]) => `<circle class="${cls}" cx="${x}" cy="${y}" r="${r}"/>`).join("");
  const bact = (x, y) => `<rect class="bact" x="${x - 26}" y="${y - 13}" width="52" height="26" rx="13"/>`;
  const lyso = (x, y, r) => `<circle class="lyso" cx="${x}" cy="${y}" r="${r}"/>` + dots([[x - 6, y - 5], [x + 6, y - 3], [x, y + 7], [x - 8, y + 6], [x + 8, y + 7]].filter(([px, py]) => Math.hypot(px - x, py - y) < r - 4), "enz", 2.6);
  const arrow = (x1, y1, x2, y2) => { const a = Math.atan2(y2 - y1, x2 - x1), h = 8; return `<path class="arr" d="M${x1} ${y1} L${x2} ${y2} M${x2 - h * Math.cos(a - 0.5)} ${y2 - h * Math.sin(a - 0.5)} L${x2} ${y2} L${x2 - h * Math.cos(a + 0.5)} ${y2 - h * Math.sin(a + 0.5)}"/>`; };
  const label = (x, y, t, anchor = "start") => `<text x="${x}" y="${y}" text-anchor="${anchor}">${t}</text>`;
  const ring = (x, y, r, n) => Array.from({ length: n }, (_, i) => { const a = (i / n) * 2 * Math.PI; return `<line class="clath" x1="${x + r * Math.cos(a)}" y1="${y + r * Math.sin(a)}" x2="${x + (r + 7) * Math.cos(a)}" y2="${y + (r + 7) * Math.sin(a)}"/>`; }).join("");
  const rec = (x, y, up = true) => `<path class="rec" d="M${x} ${y} V${y + (up ? -10 : 10)} M${x - 5} ${y + (up ? -16 : 16)} L${x} ${y + (up ? -10 : 10)} L${x + 5} ${y + (up ? -16 : 16)}"/>`;
  const FLUID = [[60, 40], [110, 70], [170, 30], [250, 55], [300, 30], [360, 70], [390, 35], [30, 75]];
  const golgi = () => [0, 1, 2].map((i) => `<path class="golgi" d="M${40 + i * 4} ${268 - i * 13} Q 95 ${246 - i * 13} ${150 - i * 4} ${268 - i * 13}"/>`).join("") + label(30, 300, "Golgi-Apparat");

  const P = {
    phago: { label: "Phagocytose", steps: [
      { t: "Erkennen und Anheften", x: "Eine Fresszelle trifft auf ein Bakterium. Es haftet an der Zellmembran.", s: () => mem(FLAT) + bact(210, 74) + label(250, 62, "Bakterium") },
      { t: "Umfließen", x: "Die Zelle bildet Ausstülpungen (Scheinfüßchen) und umfließt das Bakterium. Dafür braucht sie Energie (ATP) und ihr Cytoskelett.", s: () => mem(ARMS) + bact(210, 62) },
      { t: "Phagosom abgeschnürt", x: "Die Ausstülpungen verschmelzen. Das Bakterium liegt jetzt in einem Membranbläschen, dem Phagosom. Ein Lysosom mit Verdauungsenzymen nähert sich.", s: () => mem(FLAT) + ves(200, 175, 38) + bact(200, 175) + lyso(330, 250, 20) + arrow(312, 238, 248, 205) + label(355, 285, "Lysosom", "middle") },
      { t: "Verdauung", x: "Phagosom und Lysosom verschmelzen. Die Enzyme zerlegen das Bakterium. Brauchbare Bausteine gelangen ins Cytoplasma.", s: () => mem(FLAT) + `<circle class="lyso" cx="215" cy="190" r="44"/>` + ves(215, 190, 44) + `<circle class="lyso" cx="215" cy="190" r="39" style="stroke:none"/>` + dots([[200, 180], [222, 172], [236, 196], [206, 205], [192, 196], [228, 210]], "bact", 6) + dots([[214, 160], [182, 186], [248, 184], [220, 222]], "enz", 3) + label(290, 250, "Phagolysosom") }
    ] },
    pino: { label: "Pinocytose", steps: [
      { t: "Flüssigkeit an der Membran", x: "Außen ist Flüssigkeit mit vielen gelösten Teilchen.", s: () => mem(FLAT) + dots(FLUID.concat([[200, 80], [222, 70]]), "drop", 5) },
      { t: "Einstülpen", x: "Die Membran stülpt sich ein. Was gerade in der Flüssigkeit gelöst ist, gerät in die Mulde. Die Zelle wählt nicht aus.", s: () => mem(dip(42)) + dots(FLUID, "drop", 5) + dots([[200, 118], [222, 112], [210, 96]], "drop", 5) },
      { t: "Tasche schließt sich", x: "Die Tasche wird tiefer, ihr Hals wird enger.", s: () => mem(OMEGA) + dots(FLUID, "drop", 5) + dots([[200, 160], [222, 150], [212, 176], [205, 132]], "drop", 5) },
      { t: "Vesikel im Zellinneren", x: "Das Bläschen schnürt sich ab und wandert ins Zellinnere. Die Zellmembran ist dabei ein kleines Stück kleiner geworden.", s: () => mem(FLAT) + dots(FLUID, "drop", 5) + ves(210, 205, 30) + dots([[200, 198], [222, 192], [212, 216], [203, 214]], "drop", 5) + arrow(210, 150, 210, 168) }
    ] },
    rezeptor: { label: "Rezeptorvermittelt", steps: [
      { t: "Binden an Rezeptoren", x: "Bestimmte Stoffe, hier LDL mit Cholesterin, binden an passende Rezeptoren in der Membran. Andere Stoffe binden nicht.", s: () => mem(FLAT) + [150, 185, 235, 270, 330].map((x) => rec(x, 94)).join("") + dots([[185, 74], [235, 74], [270, 74]], "ldl", 8) + dots([[80, 40], [330, 74]], "ldl", 8) + label(60, 22, "LDL") + label(290, 140, "Rezeptor") },
      { t: "Clathrin-Mulde", x: "Die beladenen Rezeptoren sammeln sich. Auf der Innenseite lagert sich das Protein Clathrin an und biegt die Membran zu einer Mulde.", s: () => mem(dip(44)) + dots([[188, 116], [210, 124], [232, 116]], "ldl", 8) + [[180, 128], [196, 141], [210, 146], [224, 141], [240, 128]].map(([x, y]) => `<line class="clath" x1="${x}" y1="${y + 6}" x2="${x}" y2="${y + 14}"/>`).join("") + dots([[80, 40]], "ldl", 8) + label(262, 168, "Clathrin") },
      { t: "Umhülltes Vesikel", x: "Das Bläschen schnürt sich ab. Es ist außen von einem Clathrin-Netz umhüllt.", s: () => mem(FLAT) + ves(210, 190, 30) + ring(210, 190, 36, 18) + dots([[200, 182], [220, 182], [210, 200]], "ldl", 8) + dots([[80, 40]], "ldl", 8) },
      { t: "Hülle ab, Rezeptoren zurück", x: "Die Clathrin-Hülle löst sich. Das LDL gelangt zum Lysosom und wird abgebaut. Die Rezeptoren kehren in kleinen Bläschen zur Membran zurück und werden wiederverwendet.", s: () => mem(FLAT) + ves(240, 225, 30) + dots([[230, 218], [250, 218], [240, 236]], "ldl", 8) + lyso(335, 270, 18) + arrow(272, 240, 314, 260) + ves(140, 160, 14) + rec(140, 160) + arrow(140, 140, 140, 114) + label(60, 196, "Rezeptoren zurück") }
    ] },
    exo: { label: "Exocytose", steps: [
      { t: "Vesikel vom Golgi-Apparat", x: "Am Golgi-Apparat schnürt sich ein Bläschen ab. Es enthält Stoffe, die die Zelle abgeben will, z. B. Proteine wie Insulin.", s: () => mem(FLAT) + golgi() + ves(180, 245, 26) + dots([[172, 240], [188, 236], [180, 254]], "prot", 5) },
      { t: "Transport zur Membran", x: "Das Bläschen wird entlang des Cytoskeletts zur Zellmembran gebracht. Das kostet Energie (ATP).", s: () => mem(FLAT) + golgi() + ves(210, 170, 28) + dots([[202, 164], [218, 160], [210, 180]], "prot", 5) + arrow(186, 232, 200, 205) },
      { t: "Verschmelzen", x: "Das Bläschen verschmilzt mit der Zellmembran. Bei vielen Zellen passiert das erst auf ein Signal hin, wenn Ca²⁺ einströmt.", s: () => mem(OMEGA) + golgi() + dots([[200, 165], [222, 155], [210, 120]], "prot", 5) + arrow(210, 110, 210, 70) },
      { t: "Inhalt draußen, Membran größer", x: "Der Inhalt ist nach außen abgegeben. Die Membran des Bläschens ist jetzt Teil der Zellmembran (grün markiert): Die Zelloberfläche ist gewachsen.", s: () => mem(FLAT) + `<path class="new" d="M168 100 H252"/>` + golgi() + dots([[150, 50], [215, 35], [285, 60]], "prot", 5) }
    ] }
  };
  let proc = "phago", step = 0, timer = null;
  $("#eModes").innerHTML = Object.entries(P).map(([k, p], i) => `<button type="button" data-p="${k}" aria-pressed="${i === 0}">${p.label}</button>`).join("");
  function drawE() {
    const p = P[proc], st = p.steps[step];
    $("#eSvg").innerHTML = `<rect class="out" x="0" y="0" width="420" height="100"/><text class="side" x="10" y="20">außen</text><text class="side" x="410" y="312" text-anchor="end">Zellinneres</text><g class="frame">${st.s()}</g>`;
    $("#eStep").textContent = `${p.label} · Schritt ${step + 1} von ${p.steps.length}`;
    $("#eTitle").textContent = st.t;
    $("#eText").textContent = st.x;
    $("#ePrev").disabled = step === 0;
    $("#eNext").disabled = step === p.steps.length - 1;
  }
  function stop() { if (timer) { clearInterval(timer); timer = null; $("#ePlay").textContent = "Abspielen"; } }
  $$("[data-p]").forEach((b) => b.addEventListener("click", () => {
    stop(); proc = b.dataset.p; step = 0;
    $$("[data-p]").forEach((x) => x.setAttribute("aria-pressed", String(x === b))); drawE();
  }));
  $("#ePrev").addEventListener("click", () => { stop(); if (step > 0) { step--; drawE(); } });
  $("#eNext").addEventListener("click", () => { stop(); if (step < P[proc].steps.length - 1) { step++; drawE(); } });
  $("#ePlay").addEventListener("click", () => {
    if (timer) { stop(); return; }
    step = 0; drawE(); $("#ePlay").textContent = "Stopp";
    timer = setInterval(() => { if (step < P[proc].steps.length - 1) { step++; drawE(); } else stop(); }, 2200);
  });
  drawE();

  // ---------- classification cards ----------
  LK.cards({ el: "#cards", key: "endoexo.cards", items: [
    { ctx: "Abwehr", title: "Fresszelle und Bakterium", text: "Eine Fresszelle umfließt ein Bakterium und schließt es in ein Bläschen ein.", o: ["Phagocytose", "Pinocytose", "Exocytose"], a: 0, e: "Große Teilchen „fressen“: Phagocytose." },
    { ctx: "Nervenzelle", title: "Botenstoff an der Synapse", text: "Bläschen mit Botenstoff verschmelzen mit der Membran, der Botenstoff gelangt nach außen.", o: ["Endocytose", "Exocytose", "Diffusion"], a: 1, e: "Inhalt nach außen: Exocytose, ausgelöst durch Ca²⁺." },
    { ctx: "Leber", title: "Cholesterin aufnehmen", text: "LDL bindet an Rezeptoren, eine Clathrin-Mulde entsteht, ein Bläschen schnürt sich ab.", o: ["Pinocytose", "Phagocytose", "rezeptorvermittelte Endocytose"], a: 2, e: "Rezeptoren und Clathrin sind die Kennzeichen." },
    { ctx: "Darm", title: "Tröpfchen schlucken", text: "Eine Zelle nimmt in kleinen Bläschen etwas Flüssigkeit mit allem darin Gelösten auf.", o: ["Pinocytose", "Phagocytose", "Exocytose"], a: 0, e: "„Zelltrinken“ ist nicht wählerisch." },
    { ctx: "Bauchspeicheldrüse", title: "Insulin ins Blut", text: "Nach dem Essen gibt die Zelle Insulin ab.", o: ["Endocytose", "Exocytose", "Osmose"], a: 1, e: "Insulin liegt in Vesikeln bereit und wird per Exocytose abgegeben." },
    { ctx: "Energie", title: "Braucht das Energie?", text: "Eine Zelle nimmt ein Bakterium per Phagocytose auf. Ist das ein aktiver oder passiver Vorgang?", o: ["passiv, ohne Energie", "aktiv, mit ATP", "hängt vom Bakterium ab"], a: 1, e: "Membranbewegung und Cytoskelett brauchen ATP." },
    { ctx: "Muttermilch", title: "Antikörper durch die Zelle", text: "Antikörper werden auf einer Seite der Zelle aufgenommen und auf der anderen abgegeben.", o: ["Transcytose", "Pinocytose", "Symport"], a: 0, e: "Endocytose auf der einen, Exocytose auf der anderen Seite." },
    { ctx: "Teich", title: "Amöbe auf Nahrungssuche", text: "Eine Amöbe bildet Scheinfüßchen und schließt eine Alge ein. In welchem Bläschen landet die Alge?", o: ["Lysosom", "Nahrungsvakuole (Phagosom)", "Golgi-Apparat"], a: 1, e: "Danach verschmilzt sie mit Lysosomen zur Verdauung." }
  ] });

  // ---------- trainer ----------
  // Answers are matched by keyword
  const KIND = [["Phagocytose", /phag/], ["Pinocytose", /pino/], ["rezeptorvermittelte Endocytose", /rezept|clathrin/], ["Exocytose", /exo/], ["Transcytose", /trans/]];
  const kindOf = (raw) => { const t = raw.trim().toLowerCase(); const k = KIND.find(([, re]) => re.test(t)); return k ? k[0] : null; };
  const SCN = [
    ["Ein Makrophage nimmt ein Bakterium auf.", "Phagocytose"],
    ["Eine Amöbe schließt eine Alge in eine Nahrungsvakuole ein.", "Phagocytose"],
    ["Eine Fresszelle beseitigt eine abgestorbene Blutzelle.", "Phagocytose"],
    ["Eine Zelle nimmt in kleinen Bläschen Flüssigkeit mit gelösten Stoffen auf, ohne Auswahl.", "Pinocytose"],
    ["Eine Zelle der Blutgefäßwand schluckt laufend winzige Tröpfchen Blutplasma.", "Pinocytose"],
    ["LDL bindet an Rezeptoren und wird in einem Clathrin-umhüllten Vesikel aufgenommen.", "rezeptorvermittelte Endocytose"],
    ["Eisen wird gebunden an ein Transportprotein über passende Rezeptoren gezielt aufgenommen.", "rezeptorvermittelte Endocytose"],
    ["Ein Grippevirus bindet an einen Rezeptor und wird gezielt in die Zelle aufgenommen.", "rezeptorvermittelte Endocytose"],
    ["Eine Nervenzelle setzt nach Ca²⁺-Einstrom Botenstoff in den synaptischen Spalt frei.", "Exocytose"],
    ["Eine Zelle der Bauchspeicheldrüse gibt Insulin ins Blut ab.", "Exocytose"],
    ["Becherzellen der Nasenschleimhaut geben Schleim ab.", "Exocytose"],
    ["Ein Stoff wird auf einer Seite der Zelle aufgenommen und auf der anderen Seite abgegeben.", "Transcytose"],
    ["Antikörper gelangen durch die Zellen der Milchdrüse in die Muttermilch.", "Transcytose"]
  ];
  function genKind() {
    const [d, k] = pick(SCN);
    return { html: d, label: "Vorgang:", placeholder: "z. B. Phagocytose", answer: k,
      check: (raw) => { const v = kindOf(raw); if (!v) return { ok: false, msg: "Nenne einen Vorgang: Phagocytose, Pinocytose, rezeptorvermittelte Endocytose, Exocytose oder Transcytose." };
        return v === k ? { ok: true } : { ok: false, msg: "Hinein oder hinaus? Groß oder Flüssigkeit? Gezielt über Rezeptoren?" }; },
      solution: `<b>${k}</b>` };
  }
  const TERMS = [
    ["Wie heißt ein kleines, von Membran umschlossenes Bläschen?", "Vesikel", /vesik/],
    ["Wie heißt das Bläschen, in dem ein „gefressenes“ Bakterium liegt?", "Phagosom", /phagosom/],
    ["Welches Zellorganell enthält Verdauungsenzyme und verschmilzt mit dem Phagosom?", "Lysosom", /lysosom/],
    ["Welches Protein bildet bei der rezeptorvermittelten Endocytose die Hülle unter der Membran?", "Clathrin", /clathrin|klathrin/],
    ["In welchem Zellorganell werden die Vesikel für die Exocytose verpackt?", "Golgi-Apparat", /golgi/],
    ["Wie heißen die Ausstülpungen, mit denen Fresszellen ihre Beute umfließen?", "Scheinfüßchen (Pseudopodien)", /schein|pseudopod/],
    ["Welcher Energieträger wird für Endo- und Exocytose gebraucht?", "ATP", /atp/],
    ["Welches Ion löst bei Nervenzellen die Exocytose des Botenstoffs aus?", "Ca²⁺ (Calcium)", /ca|calc|kalz/],
    ["Wie heißt das Bläschen, das entsteht, wenn Phagosom und Lysosom verschmelzen?", "Phagolysosom", /phagolys/],
    ["Wie nennt man die ständige Wanderung von Membranstücken zwischen ER, Golgi, Vesikeln und Zellmembran?", "Membranfluss", /membranfl/]
  ];
  function genTerm() {
    const [q, a, re] = pick(TERMS);
    return { html: q, label: "Begriff:", placeholder: "Fachbegriff", answer: a,
      check: (raw) => re.test(raw.trim().toLowerCase()) ? { ok: true } : { ok: false, msg: "Das ist noch nicht der gesuchte Begriff. Schau unter „Verstehen“ nach." },
      solution: `<b>${a}</b>` };
  }
  LK.trainer({ el: "#trainer", modes: [
    { id: "vorgang", label: "Welcher Vorgang?", gen: genKind },
    { id: "begriff", label: "Fachbegriffe", gen: genTerm }
  ] });

  // ---------- quiz ----------
  LK.quiz({ box: "#quizBox", bar: "#qBar", progress: "#qProgress", key: "endoexo.best", n: 10, questions: [
    { q: "Was ist Endocytose?", o: ["Aufnahme von Stoffen in Membranbläschen", "Abgabe von Stoffen in Membranbläschen", "Diffusion durch die Membran", "Transport durch Kanäle"], a: 0, e: "Die Membran stülpt sich ein und schnürt ein Vesikel nach innen ab." },
    { q: "Was ist Exocytose?", o: ["Ein Vesikel verschmilzt mit der Membran und gibt den Inhalt nach außen ab", "Die Zelle nimmt Flüssigkeit auf", "Ein Bakterium wird verdaut", "Wasser strömt aus der Zelle"], a: 0, e: "Ex wie Exit: hinaus." },
    { q: "Welche Form der Endocytose nutzen Fresszellen gegen Bakterien?", o: ["Pinocytose", "Phagocytose", "Exocytose", "Transcytose"], a: 1, e: "Phagocytose bedeutet „Zellfressen“." },
    { q: "Was kennzeichnet die rezeptorvermittelte Endocytose?", o: ["Sie nimmt alles Gelöste auf", "Stoffe binden zuerst an passende Rezeptoren, Clathrin formt das Vesikel", "Sie braucht keine Energie", "Sie gibt Stoffe ab"], a: 1, e: "Deshalb ist sie sehr gezielt." },
    { q: "Brauchen Endo- und Exocytose Energie?", o: ["Nein, sie sind passiv", "Ja, ATP", "Nur die Exocytose", "Nur bei Bakterien"], a: 1, e: "Membranbewegung und Vesikeltransport kosten ATP." },
    { q: "Womit verschmilzt ein Phagosom, damit der Inhalt verdaut wird?", o: ["Mit dem Zellkern", "Mit einem Lysosom", "Mit dem Golgi-Apparat", "Mit einem Mitochondrium"], a: 1, e: "Lysosomen enthalten Verdauungsenzyme." },
    { q: "Was passiert mit der Zellmembran bei einer Exocytose?", o: ["Sie wird kleiner", "Sie wird größer", "Sie bleibt genau gleich", "Sie löst sich auf"], a: 1, e: "Die Vesikelmembran wird Teil der Zellmembran." },
    { q: "Was löst an der Synapse die Exocytose der Botenstoffe aus?", o: ["Einstrom von Ca²⁺", "Austritt von K⁺", "ATP-Mangel", "Wasser"], a: 0, e: "Ca²⁺ ist das Signal zum Verschmelzen." },
    { q: "Was ist Pinocytose?", o: ["Gezielte Aufnahme über Rezeptoren", "„Zelltrinken“: Aufnahme von Flüssigkeit mit Gelöstem", "Abgabe von Schleim", "Aufnahme von Bakterien"], a: 1, e: "Kleine Bläschen, nicht wählerisch." },
    { q: "Wo werden Vesikel für die Exocytose gebildet?", o: ["Am Golgi-Apparat", "Im Zellkern", "In den Mitochondrien", "In der Zellwand"], a: 0, e: "Vom ER über den Golgi-Apparat zur Membran." },
    { q: "Botox verhindert die Exocytose von Botenstoffen an Nerv-Muskel-Verbindungen. Folge?", o: ["Muskeln verkrampfen", "Muskeln erschlaffen", "Mehr Schweiß", "Nichts"], a: 1, e: "Ohne Botenstoff bekommt der Muskel kein Signal." },
    { q: "Was ist Transcytose?", o: ["Aufnahme auf einer Seite der Zelle, Abgabe auf der anderen", "Transport durch Kanäle", "Ein anderer Name für Osmose", "Zellteilung"], a: 0, e: "Zum Beispiel Antikörper in die Muttermilch." }
  ] });

  LK.views(["verstehen", "ablauf", "zuordnen", "ueben", "alltag", "quiz"], { ablauf: drawE });
})();
