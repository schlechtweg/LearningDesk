(function () {
  "use strict";
  const { $, $$, pick, fmt } = LK;
  const C = window.CHEM;
  const ROMAN = ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII"];
  const PROP = { r: { name: "Atomradius", unit: "pm", key: "r" }, en: { name: "Elektronegativität", unit: "", key: "en" }, ie: { name: "1. Ionisierungsenergie", unit: "kJ/mol", key: "ie" } };
  const CLS_COL = { m: "#b9d4f2", h: "#f2dc9b", n: "#bfe5c2", e: "#e5cdf2" };
  const fmtv = (k, v) => (v === null ? "–" : k === "en" ? fmt(v, 2) : fmt(v, 0));

  // ---------- interactive table ----------
  let mode = "cls", cur = C.bySym.Na;
  function color(e) {
    if (mode === "cls") return CLS_COL[e.cls];
    const vals = C.els.map((x) => x[mode]).filter((v) => v !== null), lo = Math.min(...vals), hi = Math.max(...vals);
    if (e[mode] === null) return "#e4e7ea";
    const t = (e[mode] - lo) / (hi - lo); // light yellow -> deep violet
    const mix = (a, b) => Math.round(a + (b - a) * t);
    return `rgb(${mix(255, 120)},${mix(244, 80)},${mix(200, 190)})`;
  }
  function drawGrid() {
    let h = `<span></span>${[1, 2, 3, 4, 5, 6, 7, 8].map((g) => `<span class="hd">${ROMAN[g]}</span>`).join("")}`;
    for (let p = 1; p <= 5; p++) {
      h += `<span class="pl">${p}</span>`;
      for (let g = 1; g <= 8; g++) {
        const e = C.els.find((x) => x.period === p && x.group === g);
        if (!e) { h += "<span></span>"; continue; }
        const v = mode === "cls" ? e.z : fmtv(mode, e[mode]);
        h += `<button type="button" data-s="${e.sym}" aria-pressed="${e === cur}" style="background:${color(e)}" title="${e.name}"><b>${e.sym}</b><small>${v}</small></button>`;
      }
    }
    $("#pGrid").innerHTML = h;
    $$("#pGrid button").forEach((b) => b.addEventListener("click", () => { cur = C.bySym[b.dataset.s]; drawGrid(); drawInfo(); }));
    $("#pLegend").innerHTML = mode === "cls" ? Object.entries(CLS_COL).map(([k, c]) => `<span><i style="background:${c}"></i>${C.className[k]}</span>`).join("") :
      `<span><i style="background:rgb(255,244,200)"></i>klein</span><span><i style="background:rgb(120,80,190)"></i>groß</span><span>${PROP[mode].name}${PROP[mode].unit ? " in " + PROP[mode].unit : ""} (Zahl im Kästchen)</span>`;
  }
  function drawInfo() {
    const e = cur, q = C.ionCharge(e);
    $("#pBohr").innerHTML = C.bohr(e);
    $("#pName").textContent = `${e.name} (${e.sym})`;
    $("#pInfo").innerHTML = `<p>Ordnungszahl <b>${e.z}</b>, mittlere Atommasse ${fmt(e.mass, 2)} u, <b>${C.className[e.cls]}</b></p>
      <p>Schalen: <b>${e.shells.join(", ")}</b> → <b>${e.period}. Periode</b> (${e.shells.length} Schalen), <b>${ROMAN[e.group]}. Hauptgruppe</b> (${e.z === 2 ? 2 : e.group} Valenzelektronen)${e.group && e.z !== 1 ? `, ${C.groupNames[e.group]}` : ""}</p>
      <p>Atomradius ${e.r} pm · EN ${fmtv("en", e.en)} · Ionisierungsenergie ${e.ie} kJ/mol</p>
      <p>${e.cls === "e" ? "Edelgaskonfiguration: kaum reaktiv." : q === null ? "Bildet vor allem Elektronenpaarbindungen." : `Typisches Ion: <b>${e.sym}${C.charge(q)}</b>`}</p>`;
  }
  $$("[data-c]").forEach((b) => b.addEventListener("click", () => { mode = b.dataset.c; $$("[data-c]").forEach((x) => x.setAttribute("aria-pressed", String(x === b))); drawGrid(); }));
  drawGrid(); drawInfo();

  // ---------- trends ----------
  let tProp = "r";
  const opts = [...[1, 2, 3, 4, 5].map((p) => [`p${p}`, `${p}. Periode`]), ...[1, 2, 6, 7, 8].map((g) => [`g${g}`, `${ROMAN[g]}. Hauptgruppe (${C.groupNames[g]})`])];
  $("#tSel").innerHTML = opts.map(([v, l]) => `<option value="${v}"${v === "p3" ? " selected" : ""}>${l}</option>`).join("");
  function drawBars() {
    const sel = $("#tSel").value, isP = sel[0] === "p", n = +sel.slice(1);
    let list = C.els.filter((e) => (isP ? e.period === n : e.group === n));
    if (isP) list.sort((a, b) => a.group - b.group); else list.sort((a, b) => a.period - b.period);
    const vals = list.map((e) => e[tProp]), max = Math.max(...vals.filter((v) => v !== null)) * 1.1;
    const w = 440 / list.length;
    let g = "";
    list.forEach((e, i) => { const v = e[tProp], h = v === null ? 0 : (v / max) * 170, x = 12 + i * w;
      g += `<rect x="${(x + w * 0.15).toFixed(1)}" y="${(195 - h).toFixed(1)}" width="${(w * 0.7).toFixed(1)}" height="${h.toFixed(1)}" rx="3"/><text x="${(x + w / 2).toFixed(1)}" y="${(190 - h).toFixed(1)}" text-anchor="middle">${fmtv(tProp, v)}</text><text class="lbl" x="${(x + w / 2).toFixed(1)}" y="214" text-anchor="middle">${e.sym}</text>`; });
    $("#tSvg").innerHTML = g;
    const dir = isP ? "nach rechts" : "nach unten";
    const up = isP ? tProp !== "r" : tProp === "r";
    $("#tText").innerHTML = `${PROP[tProp].name} ${dir}: <b>${up ? "steigt" : "sinkt"}</b> (bis auf kleine Ausnahmen). ` + (isP ? "Gleiche Schalenzahl, aber steigende Kernladung: Die Elektronen werden stärker angezogen." : "Jede Periode bringt eine neue Schale: Die Valenzelektronen sind weiter vom Kern entfernt und abgeschirmt.") + (tProp === "en" ? " Edelgase haben keinen EN-Wert." : "");
  }
  $$("[data-t]").forEach((b) => b.addEventListener("click", () => { tProp = b.dataset.t; $$("[data-t]").forEach((x) => x.setAttribute("aria-pressed", String(x === b))); drawBars(); }));
  $("#tSel").addEventListener("change", drawBars);
  drawBars();

  // two-element comparison with an explanation
  const elOpts = C.els.map((e) => `<option value="${e.sym}">${e.sym} – ${e.name}</option>`).join("");
  $("#c1").innerHTML = elOpts; $("#c2").innerHTML = elOpts; $("#c1").value = "Na"; $("#c2").value = "Cl";
  function why(a, b) {
    if (a.period === b.period) return `Beide in der ${a.period}. Periode: ${b.z > a.z ? b.name : a.name} hat mehr Protonen bei gleicher Schalenzahl.`;
    if (a.group === b.group) return `Beide in der ${ROMAN[a.group]}. Hauptgruppe: ${b.period > a.period ? b.name : a.name} hat mehr Schalen.`;
    return "Verschiedene Periode und Gruppe: Hier helfen nur die Tabellenwerte oder beide Trends zusammen (diagonal).";
  }
  function compare() {
    const a = C.bySym[$("#c1").value], b = C.bySym[$("#c2").value];
    if (a === b) { $("#cOut").textContent = "Wähle zwei verschiedene Elemente."; return; }
    const row = (k) => { const va = a[k], vb = b[k]; if (va === null || vb === null) return `<li>${PROP[k].name}: Edelgase ohne Wert</li>`; const big = va > vb ? a : b; return `<li>${PROP[k].name}: <span class="vs">${a.sym} ${fmtv(k, va)} | ${b.sym} ${fmtv(k, vb)}</span> → größer: <b>${big.sym}</b></li>`; };
    $("#cOut").innerHTML = `<ul class="list">${row("r")}${row("en")}${row("ie")}</ul><p>${why(a, b)}</p>`;
  }
  ["#c1", "#c2"].forEach((s) => $(s).addEventListener("change", compare));
  compare();

  // ---------- trainer ----------
  const pool = C.els.filter((e) => e.cls !== "e" && e.z !== 1);
  const symCheck = (want) => (raw) => { const t = String(raw).trim(); const e = C.bySym[t.charAt(0).toUpperCase() + t.slice(1).toLowerCase()] || C.els.find((x) => x.name.toLowerCase() === t.toLowerCase()); if (!e) return { ok: false, msg: "Gib ein Elementsymbol ein, z. B. <code>Na</code>." }; return e.sym === want ? { ok: true } : { ok: false, msg: "Denke an die Trends: Periode nach rechts, Gruppe nach unten." }; };
  // pairs in the same period or group with a clear difference
  function pair(k, minDiff) {
    for (;;) { const a = pick(pool), b = pick(pool); if (a === b || (a.period !== b.period && a.group !== b.group)) continue; if (Math.abs(a[k] - b[k]) < minDiff) continue; return [a, b]; }
  }
  function genPos() { const e = pick(C.els.filter((x) => x.z > 2)); return { html: `Ein Atom hat die Schalenbesetzung <b>${e.shells.join(", ")}</b>. In welcher Hauptgruppe und Periode steht es?`, label: "Gruppe; Periode:", placeholder: "z. B. 3;2", answer: `${e.group};${e.period}`,
    check: (raw) => { const p = String(raw).split(/[^0-9]+/).filter(Boolean).map(Number); if (p.length !== 2) return { ok: false, msg: "Zwei Zahlen: <code>Gruppe;Periode</code>." }; return p[0] === e.group && p[1] === e.period ? { ok: true } : { ok: false, msg: "Valenzelektronen = Gruppe, Zahl der Schalen = Periode." }; },
    solution: `${e.shells[e.shells.length - 1]} Valenzelektronen, ${e.shells.length} Schalen: <b>${ROMAN[e.group]}. Hauptgruppe, ${e.period}. Periode</b> (${e.name})` }; }
  const genCmp = (k, word, minDiff) => () => { const [a, b] = pair(k, minDiff), big = a[k] > b[k] ? a : b;
    return { html: `Welches Atom hat ${word}: <b>${a.name}</b> oder <b>${b.name}</b>?`, label: "Symbol:", placeholder: "z. B. Na", answer: big.sym, check: symCheck(big.sym), solution: `<b>${big.sym}</b> (${a.sym}: ${fmtv(k, a[k])}, ${b.sym}: ${fmtv(k, b[k])} ${PROP[k].unit}). ${why(a, b)}` }; };
  function genIon() { const e = pick(pool.filter((x) => C.ionCharge(x) !== null)), q = C.ionCharge(e), want = `${Math.abs(q)}${q > 0 ? "+" : "-"}`;
    return { html: `Welche Ladung hat das typische Ion von <b>${e.name}</b> (${ROMAN[e.group]}. Hauptgruppe)?`, label: "Ladung:", placeholder: "z. B. 2+", answer: want,
      check: (raw) => { const t = String(raw).replace(/\s/g, "").replace(/[−–]/g, "-"); const m = t.match(/^([+-]?)(\d?)([+-]?)$/); if (!m) return { ok: false, msg: "Schreibe z. B. <code>2+</code> oder <code>1-</code>." }; const sign = m[1] || m[3], n = +(m[2] || 1); const v = sign === "-" ? -n : n; return v === q ? { ok: true } : { ok: false, msg: "Gruppe I–III: Elektronen abgeben, Gruppe V–VII: aufnehmen bis zur Edelgaskonfiguration." }; },
      solution: `<b>${e.sym}${C.charge(q)}</b>: ${q > 0 ? `gibt ${q}` : `nimmt ${-q}`} Elektron${Math.abs(q) > 1 ? "en" : ""} ${q > 0 ? "ab" : "auf"}` }; }
  LK.trainer({ el: "#trainer", modes: [
    { id: "pos", label: "Position", gen: genPos },
    { id: "radius", label: "Atomradius", gen: genCmp("r", "den größeren Atomradius", 8) },
    { id: "en", label: "Elektronegativität", gen: genCmp("en", "die höhere Elektronegativität", 0.2) },
    { id: "ie", label: "Ionisierungsenergie", gen: genCmp("ie", "die höhere Ionisierungsenergie", 60) },
    { id: "ion", label: "Ionenladung", gen: genIon }
  ] });

  LK.quiz({ box: "#quizBox", bar: "#qBar", progress: "#qProgress", key: "pse.best", n: 8, questions: [
    { q: "Was gibt die Periodennummer an?", o: ["Die Zahl der Valenzelektronen", "Die Zahl der besetzten Schalen", "Die Neutronenzahl", "Die Ladung"], a: 1, e: "Periode = Schalenzahl." },
    { q: "Ein Atom hat die Schalen 2, 8, 6. Wo steht es?", o: ["VI. Gruppe, 3. Periode", "III. Gruppe, 6. Periode", "VIII. Gruppe, 2. Periode", "II. Gruppe, 3. Periode"], a: 0, e: "Schwefel." },
    { q: "Wie ändert sich der Atomradius in einer Periode nach rechts?", o: ["Er steigt", "Er sinkt", "Er bleibt gleich", "Er springt"], a: 1, e: "Mehr Kernladung bei gleicher Schalenzahl." },
    { q: "Welches Element hat die höchste Elektronegativität?", o: ["Sauerstoff", "Chlor", "Fluor", "Helium"], a: 2, e: "F: 3,98." },
    { q: "Warum reagiert Kalium heftiger mit Wasser als Natrium?", o: ["Es ist schwerer", "Sein Valenzelektron ist weiter vom Kern entfernt und leichter abzugeben", "Es hat mehr Valenzelektronen", "Es ist ein Nichtmetall"], a: 1, e: "Geringere Ionisierungsenergie." },
    { q: "Was haben Elemente einer Hauptgruppe gemeinsam?", o: ["Gleiche Masse", "Gleiche Schalenzahl", "Gleiche Zahl an Valenzelektronen", "Gleichen Atomradius"], a: 2, e: "Daher ähnliche Eigenschaften." },
    { q: "Wie heißen die Elemente der VII. Hauptgruppe?", o: ["Edelgase", "Chalkogene", "Halogene", "Alkalimetalle"], a: 2, e: "„Salzbildner“." },
    { q: "Wo stehen die Metalle im Periodensystem?", o: ["Rechts oben", "Links und unten", "Nur in Gruppe VIII", "Nur in Periode 1"], a: 1, e: "Der Metallcharakter nimmt nach links unten zu." }
  ] });

  LK.views(["verstehen", "pse", "trends", "ueben", "alltag", "quiz"], {});
})();
