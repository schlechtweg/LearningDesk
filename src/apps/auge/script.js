(function () {
  "use strict";
  const { $, $$, pick, fmt } = LK;

  // ---------- eye cross-section ----------
  const CX = 250, CY = 160;
  const pt = (r, deg) => [CX + r * Math.cos(deg * Math.PI / 180), CY + r * Math.sin(deg * Math.PI / 180)];
  const arc = (r, a) => { const [x1, y1] = pt(r, -a), [x2, y2] = pt(r, a); return `M${x1.toFixed(1)} ${y1.toFixed(1)} A${r} ${r} 0 1 1 ${x2.toFixed(1)} ${y2.toFixed(1)}`; };
  let pupil = 13;
  // id, name, info, svg(shape), label [x, y, anchor, leader x, leader y]
  const PARTS = [
    { id: "glaskoerper", name: "Glaskörper", info: "Eine durchsichtige, gallertartige Masse. Sie füllt den Augapfel aus und hält ihn in Form.",
      svg: () => `<circle class="shape fillsel" cx="268" cy="160" r="84" fill="rgba(170,210,235,0.35)" stroke="none"/>`, lab: [262, 150, "middle"] },
    { id: "lederhaut", name: "Lederhaut", info: "Die feste, weiße Außenhaut des Auges. Sie schützt das Auge und gibt ihm seine Form. Vorne geht sie in die Hornhaut über.",
      svg: () => `<path class="shape" d="${arc(118, 148)}" fill="none" stroke="#d6d0c4" stroke-width="8"/><path class="hit" d="${arc(118, 148)}"/>`, lab: [370, 300, "start", 334, 244] },
    { id: "aderhaut", name: "Aderhaut", info: "Eine Schicht voller Blutgefäße. Sie versorgt die Netzhaut mit Nährstoffen und Sauerstoff.",
      svg: () => `<path class="shape" d="${arc(110, 146)}" fill="none" stroke="#9b4d5e" stroke-width="5"/><path class="hit" d="${arc(110, 146)}"/>`, lab: [372, 58, "start", 327, 85] },
    { id: "netzhaut", name: "Netzhaut", info: "Hier sitzen die Lichtsinneszellen: Stäbchen für hell und dunkel, Zapfen für Farben. Sie wandeln Licht in elektrische Signale um.",
      svg: () => `<path class="shape" d="${arc(103, 144)}" fill="none" stroke="#e07a5f" stroke-width="5"/><path class="hit" d="${arc(103, 144)}"/>`, lab: [388, 92, "start", 334, 102] },
    { id: "gelber", name: "Gelber Fleck", info: "Die Stelle des schärfsten Sehens. Hier liegen besonders viele Zapfen dicht beieinander. Wenn du etwas genau anschaust, fällt sein Bild hierhin.",
      svg: () => `<circle class="shape" cx="352" cy="151" r="5.5" fill="#f1c40f" stroke="#a37f00" stroke-width="1.5"/><circle class="hitfill" cx="352" cy="151" r="11"/>`, lab: [380, 132, "start", 357, 149] },
    { id: "blinder", name: "Blinder Fleck", info: "Hier verlässt der Sehnerv das Auge. An dieser Stelle gibt es keine Lichtsinneszellen, deshalb sieht man dort nichts.",
      svg: () => `<circle class="shape" cx="351" cy="186" r="6" fill="#f6dfa0" stroke="#b8962e" stroke-width="1.5"/><circle class="hitfill" cx="351" cy="186" r="11"/>`, lab: [418, 252, "middle", 354, 191] },
    { id: "sehnerv", name: "Sehnerv", info: "Er leitet die elektrischen Signale der Netzhaut zum Gehirn. Erst dort entsteht das Bild, das wir wahrnehmen.",
      svg: () => `<path class="shape" d="M356 176 Q395 178 456 182 L456 210 Q395 206 354 198 Z" fill="#f2d27a" stroke="#b8962e" stroke-width="1.5"/>`, lab: [420, 168, "middle"] },
    { id: "hornhaut", name: "Hornhaut", info: "Das durchsichtige „Fenster“ vorne am Auge. Sie bricht das Licht am stärksten, noch stärker als die Linse.",
      svg: () => `<path class="shape" d="M150 98 A81 81 0 0 0 150 222" fill="none" stroke="#7fb3d5" stroke-width="5"/><path class="hit" d="M150 98 A81 81 0 0 0 150 222"/>`, lab: [24, 52, "start", 124, 122] },
    { id: "kammer", name: "Vordere Augenkammer", info: "Der Raum zwischen Hornhaut und Iris. Er ist mit Kammerwasser gefüllt, das Hornhaut und Linse ernährt.",
      svg: () => `<path class="shape fillsel" d="M148 102 A78 78 0 0 0 148 218 Z" fill="rgba(170,210,235,0.45)" stroke="none"/>`, lab: [14, 286, "start", 136, 196] },
    { id: "iris", name: "Iris (Regenbogenhaut)", info: "Ein ringförmiger Muskel mit Farbstoff: Sie gibt dem Auge seine Farbe. Wie eine Blende macht sie die Pupille enger oder weiter.",
      svg: () => `<rect class="shape" x="154" y="102" width="9" height="${(58 - pupil).toFixed(1)}" fill="#7a5a2e" stroke="#4a3518" stroke-width="1"/><rect class="shape" x="154" y="${(160 + pupil).toFixed(1)}" width="9" height="${(58 - pupil).toFixed(1)}" fill="#7a5a2e" stroke="#4a3518" stroke-width="1"/>`, lab: [110, 26, "middle", 158, 108] },
    { id: "pupille", name: "Pupille", info: "Das Sehloch in der Mitte der Iris. Durch sie fällt Licht ins Auge. Sie ist kein eigenes Bauteil, sondern eine Öffnung. Darum sieht sie schwarz aus.",
      svg: () => `<rect class="shape" x="153" y="${(160 - pupil).toFixed(1)}" width="11" height="${(2 * pupil).toFixed(1)}" fill="rgba(0,0,0,0.04)" stroke="var(--muted)" stroke-width="1" stroke-dasharray="3 2"/>`, lab: [20, 166, "start", 150, 160] },
    { id: "linse", name: "Linse", info: "Durchsichtig und elastisch. Sie bündelt das Licht und stellt das Bild scharf. Für die Nähe wird sie stärker gewölbt, für die Ferne flacher.",
      svg: () => `<ellipse class="shape" cx="182" cy="160" rx="13" ry="33" fill="rgba(200,225,245,0.95)" stroke="#2f7fb8" stroke-width="1.5"/>`, lab: [196, 26, "middle", 184, 128] },
    { id: "ziliar", name: "Ziliarmuskel", info: "Ein ringförmiger Muskel um die Linse. Spannt er sich an, werden die Linsenbänder locker, und die Linse wölbt sich: Blick in die Nähe.",
      svg: () => `<ellipse class="shape" cx="168" cy="102" rx="7" ry="10" fill="#b5554d" stroke="#7a2f29" stroke-width="1"/><ellipse class="shape" cx="168" cy="218" rx="7" ry="10" fill="#b5554d" stroke="#7a2f29" stroke-width="1"/>`, lab: [262, 20, "start", 172, 96] },
    { id: "baender", name: "Linsenbänder", info: "Feine Fasern, an denen die Linse aufgehängt ist. Sie verbinden die Linse mit dem Ziliarmuskel.",
      svg: () => `<path class="shape" d="M171 111 L180 128 M174 110 L186 128 M171 209 L180 192 M174 210 L186 192" stroke="#8a8a8a" stroke-width="1.6" fill="none"/><path class="hit" d="M172 110 L183 128 M172 210 L183 192"/>`, lab: [110, 312, "middle", 176, 204] }
  ];
  let sel = null, mode = "explore", target = null, qScore = [0, 0], wrong = null;
  function drawEye() {
    let s = `<path class="light" d="M0 150 L150 152 M0 170 L150 168"/>`;
    PARTS.forEach((p) => { s += `<g class="part${sel === p.id ? " sel" : ""}${wrong === p.id ? " wrong" : ""}" data-part="${p.id}">${p.svg()}</g>`; });
    if (mode === "explore") PARTS.forEach((p) => {
      const [x, y, a, lx, ly] = p.lab;
      if (lx !== undefined) s += `<line class="lead" x1="${x + (a === "start" ? -2 : 0)}" y1="${y + (ly > y ? 4 : -12)}" x2="${lx}" y2="${ly}"/>`;
      s += `<text class="lab" x="${x}" y="${y}" text-anchor="${a}"${sel === p.id ? ' style="fill: var(--accent)"' : ""}>${p.name.replace(/ \(.*\)/, "")}</text>`;
    });
    $("#eyeSvg").innerHTML = s;
    $$("#eyeSvg .part").forEach((g) => g.addEventListener("click", () => clickPart(g.dataset.part)));
  }
  function info() {
    if (mode === "explore") {
      const p = PARTS.find((q) => q.id === sel);
      $("#aInfo").innerHTML = p ? `<span class="eyebrow">Ausgewählt</span><h3>${p.name}</h3><p class="small">${p.info}</p>` : `<span class="eyebrow">Erkunden</span><p class="small">Tippe auf einen Teil des Auges, um mehr darüber zu erfahren.</p>`;
    } else {
      const t = PARTS.find((q) => q.id === target);
      $("#aInfo").innerHTML = `<span class="eyebrow">Abfragen · ${qScore[0]} von ${qScore[1]} richtig</span><h3>Wo ist: ${t.name}?</h3><p class="small" id="aMsg">Tippe auf den Teil im Bild.</p>`;
    }
  }
  function newTarget() { let t; do { t = pick(PARTS).id; } while (t === target); target = t; sel = null; wrong = null; drawEye(); info(); }
  function clickPart(id) {
    if (mode === "explore") { sel = id; drawEye(); info(); return; }
    if (sel === target) return; // already solved, waiting for the next question
    const p = PARTS.find((q) => q.id === id);
    qScore[1]++;
    if (id === target) { qScore[0]++; sel = id; wrong = null; drawEye(); info(); $("#aMsg").innerHTML = '<b class="ok">Richtig!</b>'; setTimeout(newTarget, 1100); }
    else { wrong = id; drawEye(); info(); $("#aMsg").innerHTML = `<b class="no">Nicht ganz.</b> Das ist: ${p.name}. Versuch es noch einmal.`; }
  }
  function setMode(m) {
    mode = m; $("#aExplore").setAttribute("aria-pressed", String(m === "explore")); $("#aQuiz").setAttribute("aria-pressed", String(m === "quiz"));
    sel = null; wrong = null; if (m === "quiz") { qScore = [0, 0]; newTarget(); } else { drawEye(); info(); }
  }
  $("#aExplore").addEventListener("click", () => setMode("explore"));
  $("#aQuiz").addEventListener("click", () => setMode("quiz"));
  function light() {
    const v = +$("#aLight").value;
    pupil = 6 + (1 - v / 100) * 14;
    $("#aLightOut").textContent = v < 25 ? "dunkel" : v > 75 ? "sehr hell" : "mittel";
    $("#aPupil").textContent = v < 25 ? "Im Dunkeln ist die Pupille weit: Es soll möglichst viel Licht ins Auge fallen." : v > 75 ? "Bei grellem Licht ist die Pupille eng: Die Netzhaut wird vor zu viel Licht geschützt." : "Bewege den Regler und beobachte die Pupille (Pupillenreflex).";
    drawEye();
  }
  $("#aLight").addEventListener("input", light);
  light(); info();

  // ---------- sharp vision (simplified thin-lens model in dioptres) ----------
  // R: power needed for an image on the retina; P0: power of the relaxed eye; Amax: accommodation range; G: matching glasses
  const EYES = {
    normal: { R: 60, Amax: 4, G: 0, name: "normalsichtig" },
    kurz: { R: 58, Amax: 4, G: -2, name: "kurzsichtig" },
    weit: { R: 62, Amax: 4, G: 2, name: "weitsichtig" },
    alt: { R: 60, Amax: 1, G: 2, name: "alterssichtig" }
  };
  const P0 = 60, LX = 190, AY = 130;
  const vpx = (P) => 200 + (60 - P) * 15; // exaggerated mapping: lens to image distance in px
  function distOf(s) { return s >= 100 ? Infinity : 0.1 * Math.pow(200, s / 99); }
  function distText(d) { return d === Infinity ? "sehr weit" : d < 1 ? `${fmt(d * 100, 0)} cm` : `${fmt(d, d < 10 ? 1 : 0)} m`; }
  function drawRays() {
    const E = EYES[$("#rType").value], gl = $("#rGlasses").checked && E.G !== 0 ? E.G : 0;
    $("#rGlasses").disabled = E.G === 0; if (E.G === 0) $("#rGlasses").checked = false;
    const d = distOf(+$("#rDist").value), inv = d === Infinity ? 0 : 1 / d;
    $("#rDistOut").textContent = distText(d);
    const need = E.R - P0 - gl + inv, A = Math.min(Math.max(need, 0), E.Amax), P = P0 + A + gl - inv;
    const R = vpx(E.R), V = vpx(P), sharp = Math.abs(P - E.R) < 0.12;
    let s = `<line class="axis" x1="0" y1="${AY}" x2="460" y2="${AY}"/>`;
    s += `<ellipse class="ball" cx="${(LX - 26 + LX + R) / 2}" cy="${AY}" rx="${(R + 26) / 2}" ry="92"/>`;
    s += `<path class="retina" d="M${LX + R - 4} ${AY - 70} Q${LX + R + 6} ${AY} ${LX + R - 4} ${AY + 70}"/>`;
    // object
    const xs = d === Infinity ? null : 12 + 108 * (1 - Math.log10(d / 0.1) / Math.log10(200));
    const hs = [-22, -11, 11, 22];
    const cls = sharp ? "ray ok" : "ray";
    hs.forEach((h) => {
      const startX = xs === null ? 0 : xs, startY = xs === null ? AY + h : AY;
      s += `<path class="${cls}" d="M${startX} ${startY} L${LX} ${AY + h} L${LX + R} ${(AY + h * (1 - R / V)).toFixed(1)}"/>`;
    });
    if (xs !== null) s += `<circle cx="${xs}" cy="${AY}" r="4" fill="var(--ink)"/><text x="${xs}" y="${AY - 12}" text-anchor="middle">Gegenstand</text>`;
    else s += `<text x="8" y="${AY - 34}">Licht von weit weg</text>`;
    if (gl) {
      const gx = LX - 62, sh = gl > 0 ? `M${gx} ${AY - 40} Q${gx - 9} ${AY} ${gx} ${AY + 40} Q${gx + 9} ${AY} ${gx} ${AY - 40}Z` : `M${gx - 6} ${AY - 40} Q${gx + 1} ${AY} ${gx - 6} ${AY + 40} L${gx + 6} ${AY + 40} Q${gx - 1} ${AY} ${gx + 6} ${AY - 40}Z`;
      s += `<path class="glass" d="${sh}"/><text x="${gx}" y="${AY + 58}" text-anchor="middle">Brille ${gl > 0 ? "+" : "−"}${fmt(Math.abs(gl), 1)}</text>`;
    }
    const rx = 7 + A * 3;
    s += `<ellipse class="lensE" cx="${LX}" cy="${AY}" rx="${rx}" ry="34"/>`;
    if (!sharp) {
      const spot = Math.abs(22 * (1 - R / V));
      s += `<rect class="spot" x="${LX + R - 3}" y="${AY - spot}" width="6" height="${2 * spot}" rx="3"/>`;
    }
    s += `<text x="${LX + R}" y="${AY + 90}" text-anchor="middle">Netzhaut</text><text x="${LX}" y="${AY + 52}" text-anchor="middle">Linse</text>`;
    $("#rSvg").innerHTML = s;
    const where = sharp ? "auf der Netzhaut" : V < R ? "vor der Netzhaut" : "hinter der Netzhaut";
    $("#rState").textContent = sharp ? "scharf" : "unscharf";
    $("#rState").className = "state " + (sharp ? "ok" : "no");
    const lensWord = A < 0.3 ? "flach" : A < E.Amax * 0.6 ? "etwas gewölbt" : "stark gewölbt";
    $("#rRo").innerHTML = `<dt>Ziliarmuskel</dt><dd>${A < 0.3 ? "entspannt" : "angespannt"}</dd><dt>Linse</dt><dd>${lensWord}</dd><dt>Bild entsteht</dt><dd>${where}</dd>`;
    let t;
    if (sharp) t = gl ? "Mit der passenden Brille entsteht das Bild genau auf der Netzhaut." : A < 0.3 ? "Der Gegenstand ist weit genug weg: Die Linse bleibt flach, der Ziliarmuskel ist entspannt. Das Bild ist scharf." : "Der Ziliarmuskel spannt sich an, die Linse wölbt sich stärker. So entsteht das Bild auf der Netzhaut.";
    else if (V < R) t = gl ? "Die Lesebrille ist nur für die Nähe gedacht. Für weiter entfernte Dinge bricht sie das Licht zu stark: Dann muss sie abgesetzt werden." : $("#rType").value === "kurz" ? "Kurzsichtig: Der Augapfel ist zu lang. Selbst mit flacher Linse entsteht das Bild <strong>vor</strong> der Netzhaut. Eine <strong>Zerstreuungslinse</strong> (−) hilft." : "Das Bild entsteht vor der Netzhaut.";
    else t = need > E.Amax && $("#rType").value === "alt" && !gl ? "Alterssichtig: Die Linse ist nicht mehr elastisch und kann sich kaum wölben. Für die Nähe hilft eine <strong>Lesebrille</strong> mit Sammellinsen (+)." : $("#rType").value === "weit" && !gl ? "Weitsichtig: Der Augapfel ist zu kurz. Für nahe Dinge reicht die Wölbung der Linse nicht, das Bild entsteht <strong>hinter</strong> der Netzhaut. Eine <strong>Sammellinse</strong> (+) hilft." : "Der Gegenstand ist zu nah. Auch mit stark gewölbter Linse entsteht das Bild hinter der Netzhaut. Halte ihn etwas weiter weg.";
    $("#rText").innerHTML = t;
  }
  ["rType", "rGlasses"].forEach((id) => $("#" + id).addEventListener("change", drawRays));
  $("#rDist").addEventListener("input", drawRays);

  // ---------- trainer ----------
  const T_PARTS = [
    ["Wo sitzen die Lichtsinneszellen?", "Netzhaut", /netzhaut|retina/],
    ["Welcher Teil gibt dem Auge seine Farbe?", "Iris (Regenbogenhaut)", /iris|regenbogen/],
    ["Wie heißt das Sehloch, durch das Licht ins Auge fällt?", "Pupille", /pupill/],
    ["Welcher Teil stellt das Bild auf nah oder fern scharf?", "Linse", /linse(?!nb)/],
    ["Welcher Muskel verändert die Wölbung der Linse?", "Ziliarmuskel", /ziliar|ciliar/],
    ["Welcher Teil leitet die Signale zum Gehirn?", "Sehnerv", /sehnerv/],
    ["Wo ist die Stelle des schärfsten Sehens?", "Gelber Fleck", /gelb/],
    ["An welcher Stelle der Netzhaut gibt es keine Lichtsinneszellen?", "Blinder Fleck", /blind/],
    ["Welche feste, weiße Haut schützt das Auge außen?", "Lederhaut", /lederhaut/],
    ["Welche Schicht versorgt die Netzhaut mit Blut?", "Aderhaut", /aderhaut/],
    ["Welcher durchsichtige Teil vorne bricht das Licht am stärksten?", "Hornhaut", /hornhaut/],
    ["Welche gallertartige Masse füllt den Augapfel aus?", "Glaskörper", /glask/],
    ["Welche Sinneszellen sind für das Farbensehen zuständig?", "Zapfen", /zapfen/],
    ["Welche Sinneszellen arbeiten in der Dämmerung?", "Stäbchen", /st(ä|ae|a)bchen/],
    ["Woran ist die Linse aufgehängt?", "Linsenbänder", /linsenb/],
    ["Welche Flüssigkeit hält die Hornhaut feucht?", "Tränenflüssigkeit", /tr(ä|ae|a)nen/]
  ];
  function genPart() {
    const [q, a, re] = pick(T_PARTS);
    return { html: q, label: "Antwort:", placeholder: "Fachbegriff", answer: a,
      check: (raw) => re.test(raw.trim().toLowerCase()) ? { ok: true } : { ok: false, msg: "Das ist noch nicht der gesuchte Teil. Schau im Bereich „Aufbau“ nach." }, solution: `<b>${a}</b>` };
  }
  const SAMMEL = "Sammellinse (+)", ZERSTR = "Zerstreuungslinse (−)";
  const T_GLASS = [
    ["Lena sieht die Tafel unscharf, ihr Heft aber scharf.", ZERSTR, "Sie ist kurzsichtig."],
    ["Bei Tom ist der Augapfel etwas zu kurz.", SAMMEL, "Er ist weitsichtig, das Bild entsteht hinter der Netzhaut."],
    ["Bei Mia ist der Augapfel etwas zu lang.", ZERSTR, "Sie ist kurzsichtig, das Bild entsteht vor der Netzhaut."],
    ["Opa kann die Zeitung nur noch mit ausgestrecktem Arm lesen.", SAMMEL, "Er ist alterssichtig: Lesebrille."],
    ["Bei Ben entsteht das Bild ferner Dinge vor der Netzhaut.", ZERSTR, "Er ist kurzsichtig."],
    ["Bei Ayla entsteht das Bild naher Dinge hinter der Netzhaut.", SAMMEL, "Sie ist weitsichtig."],
    ["Auf dem Brillenpass steht: −1,5 Dioptrien.", ZERSTR, "Minus-Werte bedeuten Zerstreuungslinsen gegen Kurzsichtigkeit."],
    ["Auf dem Brillenpass steht: +2,0 Dioptrien.", SAMMEL, "Plus-Werte bedeuten Sammellinsen gegen Weit- oder Alterssichtigkeit."]
  ];
  function genGlass() {
    const [q, a, why] = pick(T_GLASS);
    const isS = a === SAMMEL;
    return { html: `${q} Welche Brillengläser helfen?`, label: "Linse:", placeholder: "Sammellinse oder Zerstreuungslinse", answer: a,
      check: (raw) => { const t = raw.trim().toLowerCase(); const s = /samm|konvex|plus|^\+/.test(t), z = /zerstr|konkav|minus|^[-−]/.test(t);
        if (!s && !z) return { ok: false, msg: "Antworte mit <code>Sammellinse</code> oder <code>Zerstreuungslinse</code>." };
        return s === isS && z !== isS ? { ok: true } : { ok: false, msg: "Wo entsteht das Bild: vor oder hinter der Netzhaut? Sammellinsen verkürzen den Weg, Zerstreuungslinsen verlängern ihn." }; },
      solution: `<b>${a}</b>. ${why}` };
  }
  const T_NF = [
    ["Die Linse ist stark gewölbt.", "nah"], ["Die Linse ist flach.", "fern"], ["Der Ziliarmuskel ist angespannt.", "nah"],
    ["Der Ziliarmuskel ist entspannt.", "fern"], ["Die Linsenbänder sind gespannt.", "fern"], ["Die Linsenbänder sind locker.", "nah"],
    ["Du liest eine Nachricht auf dem Handy.", "nah"], ["Du schaust einem Flugzeug am Himmel nach.", "fern"]
  ];
  function genNF() {
    const [q, a] = pick(T_NF);
    return { html: `${q} Ist das Auge auf <b>nah</b> oder <b>fern</b> eingestellt?`, label: "Einstellung:", placeholder: "nah oder fern", answer: a,
      check: (raw) => { const t = raw.trim().toLowerCase(); const v = /^nah|n(ä|ae)he/.test(t) ? "nah" : /^fern|ferne|weit/.test(t) ? "fern" : null;
        if (!v) return { ok: false, msg: "Antworte mit <code>nah</code> oder <code>fern</code>." };
        return v === a ? { ok: true } : { ok: false, msg: "Für die Nähe: Muskel angespannt, Bänder locker, Linse gewölbt." }; },
      solution: a === "nah" ? "<b>nah</b>: Ziliarmuskel angespannt, Linsenbänder locker, Linse stark gewölbt." : "<b>fern</b>: Ziliarmuskel entspannt, Linsenbänder gespannt, Linse flach." };
  }
  LK.trainer({ el: "#trainer", modes: [
    { id: "teile", label: "Teile des Auges", gen: genPart },
    { id: "brille", label: "Welche Brille?", gen: genGlass },
    { id: "nahfern", label: "Nah oder fern?", gen: genNF }
  ] });

  // ---------- quiz ----------
  LK.quiz({ box: "#quizBox", bar: "#qBar", progress: "#qProgress", key: "auge.best", n: 10, questions: [
    { q: "Wo entsteht das Bild im Auge?", o: ["Auf der Netzhaut", "Auf der Linse", "Im Glaskörper", "Auf der Hornhaut"], a: 0, e: "Dort sitzen die Lichtsinneszellen." },
    { q: "Was passiert mit der Pupille bei grellem Licht?", o: ["Sie wird weit", "Sie wird eng", "Sie bleibt gleich", "Sie verschwindet"], a: 1, e: "Weniger Licht gelangt ins Auge: Pupillenreflex." },
    { q: "Wie ist die Linse beim Blick in die Nähe?", o: ["flach", "stark gewölbt", "ganz entfernt", "gefärbt"], a: 1, e: "Der Ziliarmuskel ist angespannt, die Linsenbänder sind locker." },
    { q: "Welche Sinneszellen sind für das Farbensehen zuständig?", o: ["Stäbchen", "Zapfen", "Nervenzellen", "Muskelzellen"], a: 1, e: "Stäbchen unterscheiden nur hell und dunkel." },
    { q: "Warum sieht man am blinden Fleck nichts?", o: ["Er ist mit Blut gefüllt", "Dort gibt es keine Lichtsinneszellen", "Die Linse verdeckt ihn", "Er ist zu dunkel"], a: 1, e: "Hier verlässt der Sehnerv das Auge." },
    { q: "Ein kurzsichtiger Mensch sieht …", o: ["nahe Dinge unscharf", "ferne Dinge unscharf", "keine Farben", "alles doppelt"], a: 1, e: "Das Bild ferner Dinge entsteht vor der Netzhaut." },
    { q: "Welche Brillengläser helfen bei Kurzsichtigkeit?", o: ["Sammellinsen (+)", "Zerstreuungslinsen (−)", "Sonnenbrillengläser", "Keine"], a: 1, e: "Sie verlagern das Bild nach hinten auf die Netzhaut." },
    { q: "Wie steht das Bild auf der Netzhaut?", o: ["Aufrecht und vergrößert", "Auf dem Kopf und verkleinert", "Aufrecht und verkleinert", "Es gibt kein Bild"], a: 1, e: "Das Gehirn dreht es wieder um." },
    { q: "Welcher Teil bricht das Licht am stärksten?", o: ["Hornhaut", "Linse", "Glaskörper", "Pupille"], a: 0, e: "Die Linse ist für das Feinstellen auf nah und fern zuständig." },
    { q: "Was ist die Pupille?", o: ["Ein Muskel", "Eine Öffnung in der Iris", "Ein Teil der Netzhaut", "Eine Flüssigkeit"], a: 1, e: "Durch das Sehloch fällt Licht ins Auge." },
    { q: "Warum sieht man in der Dämmerung kaum Farben?", o: ["Weil es dann keine Farben gibt", "Weil nur noch die Stäbchen arbeiten", "Weil die Pupille eng ist", "Weil die Linse flach ist"], a: 1, e: "Zapfen brauchen viel Licht." },
    { q: "Warum brauchen ältere Menschen oft eine Lesebrille?", o: ["Der Augapfel wird länger", "Die Linse wird weniger elastisch", "Die Netzhaut wird dicker", "Die Pupille wird größer"], a: 1, e: "Die Linse kann sich nicht mehr stark wölben: Alterssichtigkeit." }
  ] });

  LK.views(["verstehen", "aufbau", "scharf", "ueben", "alltag", "quiz"], { aufbau: drawEye, scharf: drawRays });
})();
