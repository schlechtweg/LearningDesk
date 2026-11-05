(function () {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const css = (n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
  const num = (v, d = 1) => (Math.round(v * 10 ** d) / 10 ** d).toLocaleString("de-DE", { minimumFractionDigits: d, maximumFractionDigits: d });
  const store = {
    get(k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* storage unavailable */ } }
  };
  function shuffle(a) { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; }
  const SVGNS = "http://www.w3.org/2000/svg";
  const el = (tag, attrs, parent) => { const e = document.createElementNS(SVGNS, tag); Object.entries(attrs || {}).forEach(([k, v]) => e.setAttribute(k, v)); if (parent) parent.appendChild(e); return e; };

  // ---------- Hash routing ----------
  const VIEWS = ["grundlagen", "zyklus", "simulation", "bedeutung", "faelle", "alltag", "quiz"];
  const onShow = {};
  function showView() {
    const name = location.hash.replace("#", "");
    const v = VIEWS.includes(name) ? name : "grundlagen";
    VIEWS.forEach((n) => { $("#view-" + n).hidden = n !== v; });
    $$("nav.tabs a").forEach((a) => { if (a.dataset.view === v) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current"); });
    window.scrollTo({ top: 0 });
    if (onShow[v]) requestAnimationFrame(onShow[v]);
  }
  window.addEventListener("hashchange", showView);

  // =====================================================================
  // Pump cycle: six steps, ions/ATP move between fixed positions
  // =====================================================================
  (function () {
    // lipid bilayer drawing (skip the pump region)
    const lip = $("#lipids");
    for (let x = 10; x < 600; x += 20) {
      if (x > 195 && x < 405) continue;
      el("line", { x1: x, y1: 132, x2: x - 3, y2: 178, stroke: "var(--lipid)", "stroke-width": 2 }, lip);
      el("line", { x1: x, y1: 228, x2: x + 3, y2: 184, stroke: "var(--lipid)", "stroke-width": 2 }, lip);
      el("circle", { cx: x, cy: 128, r: 8, fill: "var(--lipid)" }, lip);
      el("circle", { cx: x, cy: 232, r: 8, fill: "var(--lipid)" }, lip);
    }
    const P = {
      naIn: [[150, 300], [215, 325], [120, 335]],
      naBound: [[286, 166], [314, 166], [300, 198]],
      naOut: [[450, 40], [510, 70], [560, 35]],
      kOut: [[100, 55], [160, 80]],
      kBound: [[286, 188], [314, 188]],
      kIn: [[455, 300], [520, 330]],
      atpStart: [520, 315], atpBound: [372, 288], adpAway: [560, 345], pAway: [470, 350]
    };
    const ions = $("#ions");
    function mkIon(kind) {
      const g = el("g", { class: "ion" }, ions);
      el("circle", { r: kind === "na" ? 12 : 13, fill: kind === "na" ? "var(--na)" : "var(--k)" }, g);
      const t = el("text", { "text-anchor": "middle", dy: 4, "font-size": 10, "font-weight": 700, "font-family": "var(--font-mono)", fill: kind === "na" ? "var(--na-ink)" : "var(--k-ink)" }, g);
      t.textContent = kind === "na" ? "Na⁺" : "K⁺";
      return g;
    }
    const na = [mkIon("na"), mkIon("na"), mkIon("na")];
    const k = [mkIon("k"), mkIon("k")];
    const atp = $("#atpG"), adp = $("#adpG"), ph = $("#pG");
    const place = (g, pos, op = 1) => { g.style.transform = `translate(${pos[0]}px, ${pos[1]}px)`; g.setAttribute("opacity", op); };

    const STEPS = [
      { conf: "in", label: "E1", chip: "E1 · offen nach innen", title: "Ausgangszustand",
        text: "Die Pumpe ist zum Zellinneren hin offen. In dieser Stellung (E1) kann sie Natrium gut festhalten.",
        na: "naIn", k: "kOut", atp: "start", p: false },
      { conf: "in", label: "E1", chip: "E1 · 3 Na⁺ gebunden", title: "1 · Drei Na⁺ binden von innen",
        text: "Drei Natrium-Ionen aus dem Zellinneren setzen sich in die Pumpe.",
        na: "naBound", k: "kOut", atp: "start", p: false },
      { conf: "closed", label: "E1–P", chip: "E1–P · phosphoryliert", title: "2 · ATP phosphoryliert die Pumpe",
        text: "ATP gibt seine Energie ab. Dabei wird ein Stück vom ATP, das Phosphat (P), an die Pumpe gehängt. Fachbegriff: Phosphorylierung. Übrig bleibt ADP, die „leere Batterie“.",
        na: "naBound", k: "kOut", atp: "split", p: true },
      { conf: "out", label: "E2–P", chip: "E2–P · offen nach außen", title: "3 · Umklappen, Na⁺ wird außen frei",
        text: "Durch das angehängte Phosphat klappt die Pumpe um und ist jetzt nach außen offen (E2). In dieser Stellung kann sie Natrium nicht mehr festhalten. Die drei Natrium-Ionen werden nach draußen abgegeben.",
        na: "naOut", k: "kOut", atp: "split", p: true },
      { conf: "out", label: "E2–P", chip: "E2–P · 2 K⁺ gebunden", title: "4 · Zwei K⁺ binden von außen",
        text: "Nach außen offen kann die Pumpe Kalium gut festhalten. Zwei Kalium-Ionen von draußen setzen sich hinein.",
        na: "naOut", k: "kBound", atp: "split", p: true },
      { conf: "closed", label: "E2", chip: "E2 · dephosphoryliert", title: "5 · Phosphat wird abgespalten",
        text: "Sobald das Kalium sitzt, fällt das Phosphat wieder ab. Fachbegriff: Dephosphorylierung.",
        na: "naOut", k: "kBound", atp: "gone", p: false },
      { conf: "in", label: "E1", chip: "E1 · offen nach innen", title: "6 · Zurückklappen, K⁺ wird innen frei",
        text: "Ohne Phosphat klappt die Pumpe zurück und ist wieder nach innen offen. Jetzt kann sie Kalium nicht mehr festhalten. Die zwei Kalium-Ionen gelangen in die Zelle. Die nächste Runde kann beginnen.",
        na: "naOut", k: "kIn", atp: "gone", p: false }
    ];
    let step = 0, cycles = 0, timer = null;
    const dots = $("#stepDots");
    STEPS.forEach((s, i) => {
      const b = document.createElement("button");
      b.type = "button"; b.textContent = i; b.setAttribute("aria-label", "Schritt " + i);
      b.addEventListener("click", () => go(i));
      dots.appendChild(b);
    });
    function render() {
      const s = STEPS[step];
      $("#lobeIn").setAttribute("opacity", s.conf === "in" ? 1 : 0);
      $("#lobeClosed").setAttribute("opacity", s.conf === "closed" ? 1 : 0);
      $("#lobeOut").setAttribute("opacity", s.conf === "out" ? 1 : 0);
      $("#confLabel").textContent = s.label;
      na.forEach((g, i) => place(g, P[s.na][i], s.na === "naOut" && step === 6 ? 0.55 : 1));
      k.forEach((g, i) => place(g, P[s.k][i]));
      if (s.atp === "start") { place(atp, P.atpStart); place(adp, P.atpBound, 0); }
      else if (s.atp === "split") { place(atp, P.atpBound, 0); place(adp, P.adpAway, step === 2 ? 1 : 0.35); }
      else { place(atp, P.atpBound, 0); place(adp, P.adpAway, 0); }
      if (s.p) place(ph, P.atpBound, 1); else place(ph, step === 5 ? P.pAway : P.atpBound, step === 5 ? 0.8 : 0);
      $("#stepChip").textContent = s.chip;
      $("#stepTitle").textContent = s.title;
      $("#stepText").textContent = s.text;
      $$("button", dots).forEach((b, i) => { if (i === step) b.setAttribute("aria-current", "step"); else b.removeAttribute("aria-current"); });
      $("#stepPrev").disabled = step === 0;
      $("#stepNext").textContent = step === STEPS.length - 1 ? "Neuer Zyklus →" : "Weiter →";
      $("#cycleCount").textContent = `Zyklen: ${cycles} · transportiert: ${cycles * 3} Na⁺ hinaus, ${cycles * 2} K⁺ hinein, ${cycles} ATP verbraucht`;
    }
    function go(i) { step = i; render(); }
    function next() {
      if (step === STEPS.length - 1) {
        cycles++;
        // new ions appear without animation, then the cycle restarts
        [...na, ...k, atp, adp, ph].forEach((g) => { g.style.transition = "none"; });
        step = 0; render();
        void ions.getBoundingClientRect();
        [...na, ...k, atp, adp, ph].forEach((g) => { g.style.transition = ""; });
      } else { step++; render(); }
    }
    $("#stepNext").addEventListener("click", next);
    $("#stepPrev").addEventListener("click", () => { if (step > 0) go(step - 1); });
    $("#stepAuto").addEventListener("click", (e) => {
      const on = e.currentTarget.getAttribute("aria-pressed") !== "true";
      e.currentTarget.setAttribute("aria-pressed", String(on));
      clearInterval(timer);
      if (on) timer = setInterval(() => { if ($("#view-zyklus").hidden) return; next(); }, 2200);
    });
    render();
  })();

  // =====================================================================
  // Simulation: intracellular Na/K with leak currents and pump.
  // V from the Goldman equation (pK:pNa = 1:0.04). Linear leak fluxes,
  // pump rate saturates with Na_i (Hill n=3) and K_o (n=2), scaled by ATP.
  // Parameters are calibrated so that Na_i=12, K_i=140 is steady state.
  // =====================================================================
  (function () {
    const NA_O = 145, RT = 61.5, PNA = 0.04;
    const S = { nai: 12, ki: 140, ko: 4, atp: 1, pump: true, running: true, t: 0, hist: [] };
    const ENa = () => RT * Math.log10(NA_O / S.nai);
    const EK = () => RT * Math.log10(S.ko / S.ki);
    const V = () => RT * Math.log10((S.ko + PNA * NA_O) / (S.ki + PNA * S.nai));
    const KM_NA = 10, KM_K = 1.5;
    const sat = (c, km, n) => Math.pow(c / (c + km), n);
    const JMAX = 1 / (sat(12, KM_NA, 3) * sat(4, KM_K, 2));
    const pumpRate = () => (S.pump ? JMAX * sat(S.nai, KM_NA, 3) * sat(S.ko, KM_K, 2) * S.atp : 0);
    // leak conductances chosen for steady state at baseline
    const base = { nai: 12, ki: 140, ko: 4 };
    const v0 = RT * Math.log10((base.ko + PNA * NA_O) / (base.ki + PNA * base.nai));
    const G_NA = 3 / (RT * Math.log10(NA_O / base.nai) - v0);
    const G_K = 2 / (v0 - RT * Math.log10(base.ko / base.ki));
    function step(dt) {
      const v = V();
      const naIn = G_NA * (ENa() - v);   // passive Na influx
      const kOut = G_K * (v - EK());     // passive K efflux
      const j = pumpRate();
      S.nai = Math.max(0.5, S.nai + (naIn - 3 * j) * dt);
      S.ki = Math.max(1, S.ki + (-kOut + 2 * j) * dt);
      S.t += dt;
      S.flux = { naIn, kOut, j };
    }
    // ----- drawing -----
    const cv = $("#vTrace"), ctx = cv.getContext("2d");
    const VMIN = -110, VMAX = 30;
    function drawTrace() {
      const r = cv.getBoundingClientRect(); if (!r.width) return;
      const dpr = window.devicePixelRatio || 1;
      if (cv.width !== Math.round(r.width * dpr)) { cv.width = Math.round(r.width * dpr); cv.height = Math.round(r.height * dpr); }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const W = r.width, H = r.height, L = 44, B = 18;
      const Y = (v) => 6 + (H - 6 - B) * (VMAX - v) / (VMAX - VMIN);
      ctx.fillStyle = css("--surface"); ctx.fillRect(0, 0, W, H);
      ctx.font = "11px " + css("--font-mono"); ctx.fillStyle = css("--muted"); ctx.textAlign = "right"; ctx.textBaseline = "middle";
      ctx.strokeStyle = css("--grid"); ctx.lineWidth = 1;
      for (let v = -100; v <= 20; v += 20) { ctx.beginPath(); ctx.moveTo(L, Y(v)); ctx.lineTo(W - 4, Y(v)); ctx.stroke(); ctx.fillText((v + " mV").replace("-", "−"), L - 4, Y(v)); }
      ctx.textAlign = "left"; ctx.textBaseline = "alphabetic"; ctx.fillText("Zeit (gerafft) →", L + 4, H - 4);
      const span = 60, t1 = S.t, t0 = t1 - span;
      const X = (t) => L + (W - L - 6) * (t - t0) / span;
      const hist = S.hist.filter((h) => h.t >= t0);
      ctx.setLineDash([5, 4]); ctx.strokeStyle = css("--k"); ctx.lineWidth = 1.5; ctx.beginPath();
      hist.forEach((h, i) => { const x = X(h.t), y = Y(h.ek); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }); ctx.stroke(); ctx.setLineDash([]);
      ctx.strokeStyle = css("--accent"); ctx.lineWidth = 2.5; ctx.beginPath();
      hist.forEach((h, i) => { const x = X(h.t), y = Y(h.v); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }); ctx.stroke();
    }
    function bars() {
      const rows = [
        ["Na⁺ außen", NA_O, "--na"], ["Na⁺ innen", S.nai, "--na"],
        ["K⁺ innen", S.ki, "--k"], ["K⁺ außen", S.ko, "--k"]
      ];
      $("#bars").innerHTML = rows.map(([l, v, c]) => `<div class="barrow"><span>${l}</span><div class="track"><div class="fill" style="width:${Math.min(100, v / 1.5)}%;background:var(${c})"></div></div><span class="val">${num(v, 1)} mM</span></div>`).join("");
    }
    function arrowPath(x, y1, y2) {
      const d = Math.sign(y2 - y1);
      return `M${x} ${y1} L${x} ${y2} M${x - 8} ${y2 - d * 10} L${x} ${y2} L${x + 8} ${y2 - d * 10}`;
    }
    function flux() {
      const f = S.flux || { naIn: 3, kOut: 2, j: 1 };
      const w = (v) => (1.5 + Math.min(10, Math.abs(v) * 2.2)).toFixed(1);
      const svg = $("#fluxSvg");
      svg.innerHTML = `
        <rect x="0" y="0" width="600" height="72" fill="var(--outside)"></rect>
        <rect x="0" y="72" width="600" height="56" fill="var(--lipid-tail)"></rect>
        <rect x="0" y="128" width="600" height="72" fill="var(--inside)"></rect>
        <text x="10" y="18" font-size="12" font-family="var(--font-mono)" fill="var(--muted)">außen</text>
        <text x="10" y="192" font-size="12" font-family="var(--font-mono)" fill="var(--muted)">innen</text>
        <rect x="70" y="66" width="70" height="68" rx="10" fill="var(--pump)" opacity="${S.pump ? 1 : 0.35}"></rect>
        <text x="150" y="104" font-size="12" font-weight="700" fill="var(--ink)" font-family="var(--font-mono)">Pumpe</text>
        <path d="${arrowPath(90, 150, 30)}" stroke="var(--na)" stroke-width="${w(3 * f.j)}" fill="none" stroke-linecap="round" opacity="${f.j > 0.01 ? 1 : 0.15}"></path>
        <path d="${arrowPath(120, 30, 150)}" stroke="var(--k)" stroke-width="${w(2 * f.j)}" fill="none" stroke-linecap="round" opacity="${f.j > 0.01 ? 1 : 0.15}"></path>
        <text x="150" y="36" font-size="12" fill="var(--na)" font-family="var(--font-mono)">3 Na⁺ hinaus</text>
        <text x="150" y="168" font-size="12" fill="var(--k)" font-family="var(--font-mono)">2 K⁺ hinein</text>
        <rect x="330" y="72" width="34" height="56" fill="var(--surface-2)"></rect>
        <path d="${arrowPath(347, 30, 150)}" stroke="var(--na)" stroke-width="${w(f.naIn)}" fill="none" stroke-linecap="round"></path>
        <text x="372" y="36" font-size="12" fill="var(--na)" font-family="var(--font-mono)">Na⁺-Leckstrom hinein</text>
        <rect x="543" y="72" width="34" height="56" fill="var(--surface-2)"></rect>
        <path d="${arrowPath(560, 150, 30)}" stroke="var(--k)" stroke-width="${w(f.kOut)}" fill="none" stroke-linecap="round"></path>
        <text x="548" y="168" text-anchor="end" font-size="12" fill="var(--k)" font-family="var(--font-mono)">K⁺-Leckstrom hinaus</text>`;
    }
    function readouts() {
      const v = V();
      $("#roV").textContent = num(v, 1).replace("-", "−") + " mV";
      $("#roEK").textContent = num(EK(), 1).replace("-", "−") + " mV";
      $("#roENa").textContent = num(ENa(), 1).replace("-", "−") + " mV";
      $("#roPump").textContent = Math.round(pumpRate() * 100) + " %";
      let msg;
      if (!S.pump || S.atp === 0) msg = v > -40 ? "Die Gradienten sind weitgehend abgebaut. Die Zelle ist stark depolarisiert und nicht mehr erregbar. Gleichzeitig würde sie durch Osmose anschwellen." : "Die Pumpe steht still. Na⁺ strömt weiter ein, K⁺ weiter aus. Die Gradienten werden langsam kleiner, und das Potential wird weniger negativ.";
      else if (S.ko > 6) msg = "Mehr K⁺ außen verkleinert den K⁺-Gradienten. E_K und damit das Ruhepotential werden positiver (Depolarisation). Das ist bei Herzzellen gefährlich (Hyperkaliämie).";
      else if (S.nai > 13.5) msg = "Na⁺ innen ist erhöht. Die Pumpe arbeitet deshalb schneller als normal und baut den Überschuss nach und nach ab.";
      else if (S.atp < 1) msg = "Mit weniger ATP arbeitet die Pumpe langsamer. Es stellt sich ein neues Gleichgewicht mit kleineren Gradienten ein.";
      else msg = "Gleichgewicht: Die Pumpe transportiert genau so viele Ionen zurück, wie durch die Leckkanäle fließen. Die Konzentrationen bleiben konstant.";
      $("#simStatus").textContent = msg;
    }
    let last = 0, acc = 0;
    function loop(t) {
      const dt = Math.min(0.05, (t - last) / 1000 || 0.016); last = t;
      if (S.running && !$("#view-simulation").hidden) {
        for (let i = 0; i < 4; i++) step(dt);
        acc += dt;
        S.hist.push({ t: S.t, v: V(), ek: EK() });
        if (S.hist.length > 4000) S.hist.splice(0, 1000);
        drawTrace();
        if (acc > 0.1) { acc = 0; bars(); flux(); readouts(); }
      }
      requestAnimationFrame(loop);
    }
    function reset() {
      Object.assign(S, { nai: 12, ki: 140, ko: 4, atp: 1, pump: true, t: 0, hist: [], flux: null });
      $("#simAtp").value = 100; $("#simAtpOut").textContent = "100 %";
      $("#simKo").value = 4; $("#simKoOut").textContent = "4 mmol/L";
      $("#simPump").setAttribute("aria-pressed", "true"); $("#simPump").textContent = "Pumpe aktiv";
      S.hist.push({ t: 0, v: V(), ek: EK() });
      bars(); flux(); readouts(); drawTrace();
    }
    $("#simPump").addEventListener("click", (e) => {
      S.pump = !S.pump;
      e.currentTarget.setAttribute("aria-pressed", String(S.pump));
      e.currentTarget.textContent = S.pump ? "Pumpe aktiv" : "Pumpe gehemmt (Ouabain)";
    });
    $("#simRun").addEventListener("click", (e) => { S.running = !S.running; e.currentTarget.textContent = S.running ? "Pause" : "Weiter"; });
    $("#simAtp").addEventListener("input", (e) => { S.atp = +e.target.value / 100; $("#simAtpOut").textContent = e.target.value + " %"; });
    $("#simKo").addEventListener("input", (e) => { S.ko = +e.target.value; $("#simKoOut").textContent = num(S.ko, 1) + " mmol/L"; });
    $("#simAP").addEventListener("click", () => { S.nai += 4; S.ki -= 4; });
    $("#simReset").addEventListener("click", reset);
    window.addEventListener("resize", drawTrace);
    onShow.simulation = () => { drawTrace(); bars(); flux(); readouts(); };
    reset();
    requestAnimationFrame((t) => { last = t; loop(t); });
  })();

  // =====================================================================
  // Cases: predict consequences
  // =====================================================================
  const CASES = [
    { ctx: "Gift", title: "Ouabain blockiert die Pumpe", text: "Eine Nervenzelle wird mit Ouabain behandelt, das die Na⁺/K⁺-Pumpe vollständig hemmt. Was passiert in den nächsten Minuten?",
      o: ["Die Zelle depolarisiert sofort auf 0 mV", "Na⁺ innen steigt langsam, K⁺ innen sinkt, das Membranpotential wird allmählich weniger negativ", "Nichts, denn das Ruhepotential entsteht durch Leckkanäle"], a: 1,
      e: "Die Leckströme laufen weiter, aber niemand pumpt zurück. Die Gradienten zerfallen langsam, weil pro Sekunde nur wenige Ionen fließen. Deshalb sinkt das Potential nach und nach. Kurzfristig kann die Zelle sogar noch Aktionspotentiale bilden." },
    { ctx: "Schlaganfall", title: "Sauerstoffmangel im Gehirn", text: "Bei einem Schlaganfall werden Nervenzellen nicht mehr mit Sauerstoff versorgt. Warum schwellen sie an?",
      o: ["Ohne O₂ entsteht kaum ATP, die Pumpe fällt aus, Na⁺ strömt ein, Wasser folgt durch Osmose", "Sauerstoffmangel macht die Membran undurchlässig für Wasser", "Die Zellen bilden mehr Proteine"], a: 0,
      e: "Ohne Zellatmung fehlt ATP. Die Pumpe stoppt, Na⁺ (und Cl⁻) sammeln sich in der Zelle. Die Zelle wird hypertonisch zur Umgebung, Wasser strömt osmotisch ein, und es entsteht ein Hirnödem." },
    { ctx: "Nervenaktivität", title: "Viele Aktionspotentiale hintereinander", text: "Ein Neuron feuert sehr viele Aktionspotentiale kurz hintereinander. Wie reagiert die Pumpe?",
      o: ["Sie stellt die Arbeit ein, bis die Zelle wieder in Ruhe ist", "Sie arbeitet schneller, weil innen mehr Na⁺ zur Bindung bereitsteht", "Sie kehrt ihre Richtung um"], a: 1,
      e: "Die Na⁺-Bindungsstellen sind innen normalerweise nicht voll besetzt. Mehr Na⁺ innen heißt mehr Pumpzyklen pro Sekunde. Das ist eine automatische Rückkopplung." },
    { ctx: "Klausurklassiker", title: "Repolarisation", text: "Eine Mitschülerin sagt: „Nach dem Aktionspotential pumpt die Na⁺/K⁺-Pumpe das Na⁺ wieder hinaus. Dadurch wird die Membran repolarisiert.“ Stimmt das?",
      o: ["Ja, genau so", "Nein, die Repolarisation erfolgt durch den K⁺-Ausstrom durch spannungsgesteuerte K⁺-Kanäle", "Nein, die Repolarisation erfolgt durch Cl⁻-Einstrom über die Pumpe"], a: 1,
      e: "Die Repolarisation dauert nur etwa eine Millisekunde. Sie entsteht durch das Öffnen spannungsgesteuerter K⁺-Kanäle. Die Pumpe ist dafür viel zu langsam. Sie gleicht die geringen Ionenverschiebungen langfristig aus." },
    { ctx: "Medizin", title: "Zu viel Kalium im Blut", text: "Bei Nierenversagen steigt die K⁺-Konzentration im Blut (Hyperkaliämie). Was passiert mit dem Ruhepotential der Herzmuskelzellen?",
      o: ["Es wird negativer (Hyperpolarisation)", "Es wird positiver (Depolarisation), weil der K⁺-Gradient kleiner wird", "Es bleibt gleich, weil die Pumpe alles ausgleicht"], a: 1,
      e: "Das Ruhepotential hängt vor allem vom Kalium-Unterschied zwischen innen und außen ab. Ist außen mehr Kalium, wird der Unterschied kleiner und das Ruhepotential positiver. Das kann zu gefährlichen Herzrhythmusstörungen führen. Probiere es in der Simulation aus (Regler „K⁺ außen“)." },
    { ctx: "Durchfall", title: "Trinklösung mit Salz und Zucker", text: "Bei starkem Durchfall empfiehlt die WHO Trinklösungen, die Kochsalz und Glucose enthalten. Warum beides?",
      o: ["Glucose wird über den Na⁺-Glucose-Symporter zusammen mit Na⁺ aufgenommen. Der Na⁺-Gradient dafür stammt von der Pumpe, und Wasser folgt osmotisch.", "Zucker macht die Lösung nur süßer", "Salz tötet die Durchfallerreger ab"], a: 0,
      e: "Die Darmzellen nehmen Natrium und Zucker gemeinsam auf. Das funktioniert, weil die Pumpe innen wenig Natrium hält. Mit den aufgenommenen Teilchen strömt Wasser durch Osmose in den Körper." },
    { ctx: "Herzmedikament", title: "Digitalis aus dem Fingerhut", text: "Digitalis hemmt die Na⁺/K⁺-Pumpe im Herzmuskel teilweise. Was passiert zuerst in den Herzmuskelzellen?",
      o: ["Na⁺ innen steigt leicht an", "K⁺ innen steigt an", "ATP-Konzentration sinkt stark"], a: 0,
      e: "Arbeitet die Pumpe langsamer, bleibt etwas mehr Natrium in der Zelle. Über einen Umweg bleibt dadurch auch mehr Calcium in der Herzmuskelzelle, und Calcium lässt den Muskel kräftiger zusammenziehen. In zu hoher Dosis ist Digitalis giftig." },
    { ctx: "Rechnen", title: "300 Pumpzyklen", text: "Eine Pumpe durchläuft 300 Zyklen. Wie viele Ionen transportiert sie, und wie viele positive Ladungen gelangen netto nach außen?",
      o: ["300 Na⁺ hinaus, 300 K⁺ hinein, netto 0", "900 Na⁺ hinaus, 600 K⁺ hinein, netto 300 positive Ladungen nach außen", "600 Na⁺ hinaus, 900 K⁺ hinein, netto 300 nach innen"], a: 1,
      e: "Pro Zyklus: 3 Na⁺ hinaus, 2 K⁺ hinein, also netto +1 Ladung nach außen. Bei 300 Zyklen ergibt das 900, 600 und netto 300. Außerdem werden 300 ATP verbraucht." }
  ];
  (function () {
    let answers = store.get("nakpumpe.cases") || {};
    function renderAll() {
      const grid = $("#caseGrid"); grid.innerHTML = "";
      CASES.forEach((c, idx) => {
        const card = document.createElement("article");
        card.className = "panel case";
        card.innerHTML = `<span class="ctx"></span><h3></h3><p class="small"></p><div class="opts"></div><div class="answer" hidden></div>`;
        $(".ctx", card).textContent = c.ctx; $("h3", card).textContent = c.title; $("p", card).textContent = c.text;
        const opts = $(".opts", card), ans = $(".answer", card);
        c.o.forEach((t, i) => {
          const b = document.createElement("button"); b.type = "button"; b.textContent = t;
          b.addEventListener("click", () => { answers[idx] = i; store.set("nakpumpe.cases", answers); paint(); });
          opts.appendChild(b);
        });
        function paint() {
          const ch = answers[idx];
          $$("button", opts).forEach((b, i) => {
            b.classList.remove("right", "wrong"); b.disabled = ch !== undefined;
            if (ch !== undefined) { if (i === c.a) b.classList.add("right"); else if (i === ch) b.classList.add("wrong"); }
          });
          if (ch !== undefined) {
            ans.hidden = false;
            ans.innerHTML = ch === c.a ? '<b class="ok">Richtig.</b> ' : '<b class="no">Nicht ganz.</b> ';
            ans.appendChild(document.createTextNode(c.e));
          } else ans.hidden = true;
          progress();
        }
        grid.appendChild(card); paint();
      });
    }
    function progress() {
      const keys = Object.keys(answers);
      const right = keys.filter((i) => CASES[i] && answers[i] === CASES[i].a).length;
      $("#caseScore").textContent = `${keys.length} von ${CASES.length} beantwortet · ${right} richtig`;
      $("#caseBar").style.width = (keys.length / CASES.length) * 100 + "%";
    }
    $("#caseReset").addEventListener("click", () => { answers = {}; store.set("nakpumpe.cases", answers); renderAll(); });
    renderAll();
  })();

  // =====================================================================
  // Quiz
  // =====================================================================
  const QUESTIONS = [
    { q: "Wie viele Ionen transportiert die Na⁺/K⁺-Pumpe pro ATP?", o: ["2 Na⁺ hinaus, 3 K⁺ hinein", "3 Na⁺ hinaus, 2 K⁺ hinein", "1 Na⁺ hinaus, 1 K⁺ hinein", "3 Na⁺ hinein, 2 K⁺ hinaus"], a: 1, e: "Merke: drei Natrium raus, zwei Kalium rein." },
    { q: "Um welche Transportart handelt es sich?", o: ["Einfache Diffusion", "Erleichterte Diffusion", "Primär aktiver Transport", "Sekundär aktiver Transport"], a: 2, e: "Die Energie stammt direkt aus der ATP-Spaltung durch die Pumpe selbst." },
    { q: "Die Pumpe transportiert zwei Ionensorten in entgegengesetzte Richtungen. Das nennt man …", o: ["Uniport", "Symport", "Antiport", "Endocytose"], a: 2, e: "Antiport: entgegengesetzte Richtungen. Symport: gleiche Richtung." },
    { q: "Warum bezeichnet man die Pumpe als elektrogen?", o: ["Sie erzeugt Aktionspotentiale", "Pro Zyklus gelangt netto eine positive Ladung nach außen", "Sie wird durch Spannung geöffnet", "Sie leitet Strom wie ein Kabel"], a: 1, e: "3 positive Ladungen hinaus, 2 hinein: Netto entsteht ein kleiner Auswärtsstrom, der das Potential um wenige mV negativer macht." },
    { q: "Wo sind die Konzentrationen von Na⁺ und K⁺ jeweils hoch?", o: ["Na⁺ innen, K⁺ außen", "Na⁺ außen, K⁺ innen", "Beide innen", "Beide außen"], a: 1, e: "Na⁺ ≈ 145 mmol/L außen, K⁺ ≈ 140 mmol/L innen." },
    { q: "Was bewirkt die Phosphorylierung der Pumpe durch ATP?", o: ["Die Pumpe öffnet sich nach innen und bindet K⁺", "Eine Konformationsänderung: Die Pumpe öffnet sich nach außen, und die Affinität für Na⁺ sinkt", "Die Pumpe wird abgebaut", "Na⁺ wird chemisch verändert"], a: 1, e: "Phosphorylierung führt von E1 zu E2. Die Pumpe ist dann nach außen offen und gibt Na⁺ ab." },
    { q: "Was löst die Rückkehr der Pumpe in die nach innen offene Form aus?", o: ["Die Bindung von Na⁺", "Die Dephosphorylierung nach der Bindung von K⁺", "Ein Aktionspotential", "Die Bindung von ATP"], a: 1, e: "K⁺-Bindung führt zur Abspaltung des Phosphats. Ohne Phosphat klappt die Pumpe zurück in E1 und gibt K⁺ innen frei." },
    { q: "Was passiert mit einer Nervenzelle, wenn die Pumpe lange ausfällt?", o: ["Sie wird innen immer negativer", "Natrium und Kalium verteilen sich langsam gleichmäßig, die Zelle verliert ihr Ruhepotential und kann keine Signale mehr leiten", "Nichts, die Pumpe ist unwichtig", "Die Zelle bildet sofort eine neue Pumpe"], a: 1, e: "Ohne Pumpe sickern die Ionen durch die Lecks, bis der Unterschied zwischen innen und außen verschwunden ist. Dann funktioniert die Nervenzelle nicht mehr." },
    { q: "Wer ist für die Repolarisation beim Aktionspotential hauptsächlich verantwortlich?", o: ["Die Na⁺/K⁺-Pumpe", "Spannungsgesteuerte K⁺-Kanäle", "Ligandengesteuerte Na⁺-Kanäle", "Aquaporine"], a: 1, e: "K⁺ strömt durch spannungsgesteuerte K⁺-Kanäle aus. Die Pumpe ist zu langsam und stellt nur langfristig die Gradienten wieder her." },
    { q: "Was passiert, wenn man die Pumpe mit Ouabain hemmt?", o: ["Die Zelle hyperpolarisiert", "Die Gradienten werden langsam abgebaut, die Zelle depolarisiert allmählich und schwillt an", "Die Zelle verliert sofort alle Ionen", "Es passiert nichts"], a: 1, e: "Die Leckströme laufen weiter. Na⁺ sammelt sich innen, Wasser folgt osmotisch." },
    { q: "Der Na⁺-Glucose-Symporter (SGLT) transportiert Glucose gegen ihr Konzentrationsgefälle. Woher stammt die Energie?", o: ["Direkt aus ATP-Spaltung durch den Symporter", "Aus dem Na⁺-Gradienten, den die Na⁺/K⁺-Pumpe aufbaut", "Aus dem Licht", "Aus der Glucose selbst"], a: 1, e: "Das ist sekundär aktiver Transport. Indirekt bezahlt die Pumpe mit ATP." },
    { q: "Welchen Beitrag leistet die Pumpe zur Regulation des Zellvolumens?", o: ["Keinen", "Sie transportiert mehr Ionen hinaus als hinein und verhindert so, dass Wasser osmotisch einströmt und die Zelle platzt", "Sie pumpt direkt Wasser aus der Zelle", "Sie stabilisiert die Zellwand"], a: 1, e: "Tierzellen haben keine Zellwand. Ohne die Pumpe würden sie durch Osmose anschwellen." },
    { q: "Ein Neuron hat viele Aktionspotentiale gebildet. Wie verändert sich die Pumpaktivität?", o: ["Sie nimmt ab", "Sie nimmt zu, weil mehr Na⁺ innen vorliegt", "Sie bleibt immer gleich", "Die Pumpe läuft rückwärts"], a: 1, e: "Mehr Na⁺ innen heißt mehr besetzte Bindungsstellen und damit mehr Pumpzyklen pro Zeit." },
    { q: "Wie unterscheidet sich die Pumpe von einem Ionenkanal?", o: ["Kanäle verbrauchen ATP, die Pumpe nicht", "Die Pumpe transportiert gegen das Gefälle mit Konformationsänderungen und ist viel langsamer. Kanäle lassen Ionen schnell mit dem Gefälle passieren", "Es gibt keinen Unterschied", "Die Pumpe ist immer geöffnet"], a: 1, e: "Ein Kanal leitet bis zu Millionen Ionen pro Sekunde. Eine Pumpe schafft nur etwa einhundert Zyklen pro Sekunde." },
    { q: "Eine Pumpe durchläuft 100 Zyklen. Wie viel ATP wird verbraucht, und wie viele Na⁺ werden transportiert?", o: ["100 ATP, 300 Na⁺", "300 ATP, 100 Na⁺", "100 ATP, 200 Na⁺", "50 ATP, 300 Na⁺"], a: 0, e: "1 ATP pro Zyklus, 3 Na⁺ pro Zyklus." },
    { q: "In welcher Stellung schnappt sich die Pumpe das Natrium?", o: ["Wenn sie nach außen offen ist", "Wenn sie nach innen offen ist", "Wenn sie geschlossen ist", "Das Natrium kommt von allein hinein"], a: 1, e: "Nach innen offen (E1) hält die Pumpe Natrium gut fest. Nach dem Umklappen nach außen lässt sie es los." },
    { q: "Warum sind Nervenzellen besonders empfindlich gegenüber Sauerstoffmangel?", o: ["Sie haben keine Mitochondrien", "Sie verbrauchen sehr viel ATP, vor allem für die Na⁺/K⁺-Pumpe. Ohne ATP brechen Gradienten und Erregbarkeit zusammen", "Sauerstoff ist direkt für die Pumpe nötig", "Sie können nur Fett verwerten"], a: 1, e: "ATP stammt vor allem aus der Zellatmung, die O₂ braucht. Fällt die Pumpe aus, folgen Depolarisation und Zellschwellung." }
  ];
  (function () {
    const N = 12;
    let order = [], idx = 0, score = 0, answered = false;
    function start() {
      order = shuffle(QUESTIONS).slice(0, N).map((q) => { const perm = shuffle(q.o.map((_, i) => i)); return { q: q.q, o: perm.map((i) => q.o[i]), a: perm.indexOf(q.a), e: q.e }; });
      idx = 0; score = 0; render();
    }
    function render() {
      const box = $("#quizBox");
      $("#qBar").style.width = (idx / N) * 100 + "%";
      if (idx >= N) {
        const best = Math.max(score, store.get("nakpumpe.best") || 0);
        store.set("nakpumpe.best", best);
        const msg = score >= 11 ? "Hervorragend! Du hast die Pumpe verstanden." : score >= 8 ? "Gut gemacht! Lies die Erklärungen zu den Fehlern noch einmal." : "Geh den Pumpzyklus noch einmal Schritt für Schritt durch und versuche es dann erneut.";
        $("#qProgress").textContent = `fertig · Bestwert ${best} / ${N}`;
        box.innerHTML = `<span class="eyebrow">Ergebnis</span><div class="score-big mono">${score} / ${N}</div><p>${msg}</p><div class="row"><button type="button" class="primary" id="qAgain">Neue Runde (gemischt)</button></div>`;
        $("#qAgain").addEventListener("click", start);
        return;
      }
      const q = order[idx]; answered = false;
      $("#qProgress").textContent = `Frage ${idx + 1} von ${N} · ${score} richtig`;
      box.innerHTML = `<div class="qtext"></div><div class="opts"></div><div class="feedback" hidden></div><div class="row"><button type="button" class="primary" id="qNext" hidden>${idx + 1 < N ? "Nächste Frage" : "Ergebnis anzeigen"}</button></div>`;
      $(".qtext", box).textContent = q.q;
      q.o.forEach((t, i) => {
        const b = document.createElement("button"); b.type = "button";
        b.innerHTML = `<span class="key">${"ABCD"[i]}</span><span></span>`; b.lastChild.textContent = t;
        b.addEventListener("click", () => choose(i));
        $(".opts", box).appendChild(b);
      });
      $("#qNext").addEventListener("click", () => { idx++; render(); });
    }
    function choose(i) {
      if (answered) return; answered = true;
      const q = order[idx], box = $("#quizBox");
      $$(".opts button", box).forEach((b, j) => { b.disabled = true; if (j === q.a) b.classList.add("right"); else if (j === i) b.classList.add("wrong"); });
      const ok = i === q.a; if (ok) score++;
      const fb = $(".feedback", box); fb.hidden = false;
      fb.innerHTML = ok ? '<b class="ok">Richtig!</b> ' : '<b class="no">Leider falsch.</b> ';
      fb.appendChild(document.createTextNode(q.e));
      $("#qNext").hidden = false; $("#qNext").focus();
      $("#qProgress").textContent = `Frage ${idx + 1} von ${N} · ${score} richtig`;
    }
    start();
  })();

  showView();
})();
