(function () {
  "use strict";
  const { $, $$, rnd, pick, nz, R, linHtml, fmt, parseNum, REL_FLIP } = LK;
  const RELS = ["<", "≤", ">", "≥"];
  const holds = (v, rel, b) => ({ "<": v < b, "≤": v <= b, ">": v > b, "≥": v >= b })[rel];
  const relHtml = (r) => ({ "<": "&lt;", ">": "&gt;", "≤": "≤", "≥": "≥" })[r];
  const relText = (r) => ({ "<": "<", ">": ">", "≤": "<=", "≥": ">=" })[r];

  // ---------- number line ----------
  let nlRel = "<";
  function drawLine() {
    const b = +$("#nlBound").value;
    $("#nlBoundOut").textContent = fmt(b, 1);
    const X = (v) => 30 + ((v + 10) / 20) * 580, y = 60;
    let s = `<line class="axis" x1="20" y1="${y}" x2="625" y2="${y}"/><polygon points="625,${y - 6} 636,${y} 625,${y + 6}" fill="var(--ink)"/>`;
    for (let v = -10; v <= 10; v++) s += `<line class="tick" x1="${X(v)}" y1="${y - 6}" x2="${X(v)}" y2="${y + 6}"/>${v % 2 === 0 ? `<text x="${X(v)}" y="${y + 24}" text-anchor="middle">${String(v).replace("-", "−")}</text>` : ""}`;
    const left = nlRel === "<" || nlRel === "≤";
    s += `<line class="ray" x1="${X(b)}" y1="${y}" x2="${left ? X(-10) - 5 : X(10) + 5}" y2="${y}"/>`;
    s += `<circle class="dot" cx="${X(b)}" cy="${y}" r="8" fill="${nlRel === "≤" || nlRel === "≥" ? "var(--accent)" : "var(--surface)"}"/>`;
    if (lastProbe !== null && lastProbe >= -10 && lastProbe <= 10) s += `<circle class="${holds(lastProbe, nlRel, b) ? "probe-in" : "probe-out"}" cx="${X(lastProbe)}" cy="${y - 22}" r="6"/><text x="${X(lastProbe)}" y="${y - 32}" text-anchor="middle">${fmt(lastProbe, 2)}</text>`;
    $("#nlSvg").innerHTML = s;
    $("#nlSet").innerHTML = `L = {<i>x</i> | <i>x</i> ${relHtml(nlRel)} ${fmt(b, 1)}}`;
  }
  let lastProbe = null;
  $$("[data-rel]").forEach((btn) => btn.addEventListener("click", () => { nlRel = btn.dataset.rel; $$("[data-rel]").forEach((x) => x.setAttribute("aria-pressed", String(x === btn))); drawLine(); }));
  $("#nlBound").addEventListener("input", drawLine);
  $("#nlForm").addEventListener("submit", (ev) => {
    ev.preventDefault();
    const v = parseNum($("#nlTest").value), b = +$("#nlBound").value;
    if (isNaN(v)) { $("#nlResult").textContent = "Bitte gib eine Zahl ein."; return; }
    lastProbe = v; drawLine();
    const inside = holds(v, nlRel, b);
    $("#nlResult").innerHTML = `${inside ? '<b class="ok">Gehört dazu.</b>' : '<b class="no">Gehört nicht dazu.</b>'} <span class="math">${fmt(v, 2)} ${relHtml(nlRel)} ${fmt(b, 1)}</span> ist ${inside ? "wahr" : "falsch"}.${Math.abs(v - b) < 1e-9 ? (inside ? " Die Grenze selbst gehört bei ≤ und ≥ dazu." : " Die Grenze selbst gehört bei &lt; und &gt; nicht dazu.") : ""}`;
  });

  // ---------- step-by-step solution ----------
  const ineq = (L, r, Rt) => `${linHtml(L.x, L.c)} ${relHtml(r)} ${linHtml(Rt.x, Rt.c)}`;
  function solve(L, Rt, rel) {
    const rows = []; let l = { ...L }, r = { ...Rt }, rr = rel;
    const kHtml = (k, x = false) => (x && k.abs().eq(1) ? "" : k.abs().html()) + (x ? "<i>x</i>" : "");
    if (!r.x.isZero()) { rows.push({ eq: ineq(l, rr, r), op: `| ${r.x.sign() < 0 ? "+" : "−"}${kHtml(r.x, true)}` }); l = { x: l.x.sub(r.x), c: l.c }; r = { x: R.of(0), c: r.c }; }
    if (!l.c.isZero()) { rows.push({ eq: ineq(l, rr, r), op: `| ${l.c.sign() < 0 ? "+" : "−"}${kHtml(l.c)}` }); r = { x: r.x, c: r.c.sub(l.c) }; l = { x: l.x, c: R.of(0) }; }
    if (!l.x.eq(1)) {
      const flip = l.x.sign() < 0;
      rows.push({ eq: ineq(l, rr, r), op: `| :${flip ? "(−" + l.x.abs().html() + ")" : l.x.html()}${flip ? " Zeichen umdrehen!" : ""}`, flip });
      r = { x: r.x, c: r.c.div(l.x) }; l = { x: R.of(1), c: R.of(0) }; if (flip) rr = REL_FLIP[rr];
    }
    rows.push({ eq: ineq(l, rr, r), op: "" });
    return { rows, rel: rr, bound: r.c };
  }
  const table = (rows) => `<table class="data steps-table">${rows.map((x) => `<tr class="${x.flip ? "flip" : ""}"><td class="math">${x.eq}</td><td>${x.op}</td></tr>`).join("")}</table>`;
  function parseAnswer(raw) {
    const s = String(raw).replace(/\s+/g, "").replace(/[−–]/g, "-").replace(/=</g, "<=").replace(/=>/g, ">=").replace(/≤/g, "<=").replace(/≥/g, ">=").toLowerCase();
    let m = s.match(/^x(<=|>=|<|>)(.+)$/);
    if (m) return { rel: { "<=": "≤", ">=": "≥", "<": "<", ">": ">" }[m[1]], v: parseNum(m[2]) };
    m = s.match(/^(.+?)(<=|>=|<|>)x$/);
    if (m) return { rel: REL_FLIP[{ "<=": "≤", ">=": "≥", "<": "<", ">": ">" }[m[2]]], v: parseNum(m[1]) };
    return null;
  }
  function task(L, Rt, rel) {
    const sol = solve(L, Rt, rel);
    const b = sol.bound, probe = Math.round(b.val()) + ((sol.rel === "<" || sol.rel === "≤") ? -1 : 1);
    const lv = L.x.mul(probe).add(L.c), rv = Rt.x.mul(probe).add(Rt.c);
    return {
      meta: { L, Rt, rel, sol },
      html: `<span class="math">${ineq(L, rel, Rt)}</span>`, label: "Lösung:", placeholder: "z. B. x < 3 oder x >= -2",
      answer: `x ${relText(sol.rel)} ${b.text()}`,
      check: (raw) => {
        const a = parseAnswer(raw);
        if (!a || isNaN(a.v)) return { ok: false, msg: "Schreibe die Lösung als Ungleichung, z. B. <code>x &lt; 3</code> oder <code>x &gt;= -2</code>." };
        const vOk = Math.abs(a.v - b.val()) < 1e-9;
        if (vOk && a.rel === sol.rel) return { ok: true };
        if (vOk && a.rel === REL_FLIP[sol.rel]) return { ok: false, msg: "Die Grenze stimmt, aber das Zeichen zeigt in die falsche Richtung. Hast du durch eine negative Zahl geteilt? Dann musst du es umdrehen." };
        if (vOk) return { ok: false, msg: "Die Grenze stimmt. Prüfe, ob sie selbst dazugehört (&lt; oder ≤?)." };
        return { ok: false, msg: "Die Grenze stimmt noch nicht. Rechne wie bei einer Gleichung und mach eine Probe." };
      },
      solution: table(sol.rows) + `<p class="small"><span class="math">L = {<i>x</i> | <i>x</i> ${relHtml(sol.rel)} ${b.html()}}</span>. Probe mit <span class="math"><i>x</i> = ${String(probe).replace("-", "−")}</span>: <span class="math">${lv.html()} ${relHtml(rel)} ${rv.html()}</span> ✓</p>`
    };
  }
  function genEasy() { const a = rnd(2, 9), b = nz(-9, 9), x0 = nz(-8, 8); return task({ x: R.of(a), c: R.of(b) }, { x: R.of(0), c: R.of(a * x0 + b) }, pick(RELS)); }
  function genNeg() { const a = -rnd(1, 7), b = nz(-9, 9), x0 = nz(-8, 8); return task({ x: R.of(a), c: R.of(b) }, { x: R.of(0), c: R.of(a * x0 + b) }, pick(RELS)); }
  function genBoth() { const g = LK.genLinear({ rel: pick(RELS) }); return task(g.L, g.R, g.rel); }
  LK.trainer({ el: "#trainer", modes: [
    { id: "einfach", label: "Einfach", gen: genEasy, instr: "Löse die Ungleichung." },
    { id: "negativ", label: "Mit Zeichen-Umdrehen", gen: genNeg, instr: "Löse die Ungleichung. Achtung beim Teilen durch eine negative Zahl!" },
    { id: "beidseitig", label: "x auf beiden Seiten", gen: genBoth, instr: "Löse die Ungleichung." }
  ] });

  LK.equationLab({ el: "#lab", inequality: true, gen: () => { const g = LK.genLinear({ rel: pick(RELS) }); if (g.L.x.val() - g.R.x.val() > 0 && Math.random() < 0.6) { [g.L, g.R] = [g.R, g.L]; g.rel = REL_FLIP[g.rel]; } return g; } });

  LK.quiz({ box: "#quizBox", bar: "#qBar", progress: "#qProgress", key: "ungleichungen.best", n: 10, questions: [
    { q: "Welche Zahl erfüllt x < 4?", o: ["4", "5", "3,9", "10"], a: 2, e: "3,9 ist kleiner als 4. Die 4 selbst gehört bei < nicht dazu." },
    { q: "Welche Zahl erfüllt x ≥ −2?", o: ["−3", "−2", "−2,5", "−10"], a: 1, e: "Bei ≥ gehört die Grenze −2 dazu." },
    { q: "Lösung von x + 5 > 8?", o: ["x > 3", "x < 3", "x > 13", "x = 3"], a: 0, e: "| −5: x > 3. Beim Subtrahieren bleibt das Zeichen." },
    { q: "Lösung von 3x ≤ 12?", o: ["x ≥ 4", "x ≤ 4", "x ≤ 36", "x < 4"], a: 1, e: "| :3 (positiv): x ≤ 4." },
    { q: "Lösung von −2x < 10?", o: ["x < −5", "x > −5", "x > 5", "x < 5"], a: 1, e: "| :(−2) und Zeichen umdrehen: x > −5." },
    { q: "Wann muss man das Ungleichheitszeichen umdrehen?", o: ["Beim Subtrahieren einer negativen Zahl", "Beim Multiplizieren oder Dividieren mit einer negativen Zahl", "Immer, wenn ein Minus vorkommt", "Nie"], a: 1, e: "Nur Mal und Geteilt mit negativen Zahlen kehren die Reihenfolge um." },
    { q: "Lösung von −x ≥ 3?", o: ["x ≥ 3", "x ≤ −3", "x ≥ −3", "x ≤ 3"], a: 1, e: "| ·(−1) und umdrehen: x ≤ −3." },
    { q: "Was bedeutet ein leerer Kreis auf dem Zahlenstrahl?", o: ["Die Grenze gehört dazu", "Die Grenze gehört nicht dazu", "Es gibt keine Lösung", "Die Zahl ist 0"], a: 1, e: "Leerer Kreis bei < und >, voller Punkt bei ≤ und ≥." },
    { q: "Lösung von 2x + 1 > x + 4?", o: ["x > 3", "x < 3", "x > 5", "x > 1"], a: 0, e: "| −x: x + 1 > 4, | −1: x > 3." },
    { q: "Wie schreibt man „alle Zahlen kleiner als 5“?", o: ["L = {5}", "L = {x | x < 5}", "L = {x | x ≤ 5}", "L = {x | x > 5}"], a: 1, e: "In Mengenschreibweise: L = {x | x < 5}." },
    { q: "Es gilt 3 < 7. Was gilt nach Multiplikation mit −1?", o: ["−3 < −7", "−3 > −7", "3 > 7", "−3 = −7"], a: 1, e: "−3 liegt rechts von −7 auf dem Zahlenstrahl, ist also größer." },
    { q: "Lösung von 4 − x < 1?", o: ["x < 3", "x > 3", "x > −3", "x < 5"], a: 1, e: "| −4: −x < −3, | ·(−1) umdrehen: x > 3." }
  ] });

  LK.views(["verstehen", "zahlenstrahl", "werkstatt", "ueben", "quiz"], { zahlenstrahl: drawLine });
})();
