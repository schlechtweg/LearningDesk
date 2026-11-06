(function () {
  "use strict";
  const { $, $$, pick, rnd, fmt, gcd, frac } = LK;
  const fr = (a, b) => { const g = gcd(a, b) || 1; return [a / g, b / g]; };
  const fh = (a, b) => { const [p, q] = fr(a, b); return q === 1 ? String(p) : frac(p, q); };
  const ft = (a, b) => { const [p, q] = fr(a, b); return q === 1 ? String(p) : `${p}/${q}`; };
  function parseP(raw) { const t = String(raw).trim().replace(/\s+/g, ""); if (/%$/.test(t)) { const v = LK.parseNum(t.slice(0, -1)); return isNaN(v) ? NaN : v / 100; } return LK.parseNum(t); }
  const checkP = (p) => (raw) => { const v = parseP(raw); if (isNaN(v)) return { ok: false, msg: "Gib z. B. <code>3/10</code>, <code>0,3</code> oder <code>30 %</code> ein." }; return Math.abs(v - p) < 0.0006 ? { ok: true } : { ok: false, msg: "Multipliziere entlang der Pfade und addiere die passenden Pfade." }; };

  // ---------- interactive tree ----------
  let rep = false, stages = 2;
  const EVENTS = {
    2: [["zweimal rot", (p) => p === "rr"], ["genau einmal rot", (p) => (p.match(/r/g) || []).length === 1], ["mindestens einmal rot", (p) => p.includes("r")], ["gleiche Farbe", (p) => p[0] === p[1]], ["keinmal rot", (p) => !p.includes("r")]],
    3: [["dreimal rot", (p) => p === "rrr"], ["genau zweimal rot", (p) => (p.match(/r/g) || []).length === 2], ["mindestens einmal blau", (p) => p.includes("b")], ["alle gleich", (p) => /^(r+|b+)$/.test(p)], ["genau einmal rot", (p) => (p.match(/r/g) || []).length === 1]]
  };
  function fillEvents() { $("#bEv").innerHTML = EVENTS[stages].map((e, i) => `<option value="${i}">${e[0]}</option>`).join(""); }
  function draw() {
    const R = +$("#bR").value, B = +$("#bB").value;
    $("#bROut").textContent = R; $("#bBOut").textContent = B;
    const ev = EVENTS[stages][+$("#bEv").value || 0];
    // enumerate paths: each step gives [numerator, denominator]
    const paths = [];
    (function rec(path, r, b, steps) {
      if (path.length === stages) { paths.push({ path, steps }); return; }
      const n = r + b;
      if (r > 0) rec(path + "r", rep ? r : r - 1, b, [...steps, [r, n]]);
      else rec(path + "r", r, b, [...steps, [0, n]]);
      if (b > 0) rec(path + "b", r, rep ? b : b - 1, [...steps, [b, n]]);
      else rec(path + "b", r, b, [...steps, [0, n]]);
    })("", R, B, []);
    const W = 460, H = 330, colX = (lev) => 24 + lev * ((W - 170) / stages), leafs = paths.length;
    const yOf = (prefix) => { // average of the leaf positions below a prefix
      const idx = paths.map((p, i) => [p, i]).filter(([p]) => p.path.startsWith(prefix)).map(([, i]) => 18 + (i + 0.5) * ((H - 30) / leafs));
      return idx.reduce((a, b) => a + b, 0) / idx.length;
    };
    let s = "";
    const sel = new Set(paths.filter((p) => ev[1](p.path)).map((p) => p.path));
    const hiPrefix = (pre) => [...sel].some((p) => p.startsWith(pre));
    paths.forEach((p) => {
      for (let lev = 0; lev < stages; lev++) {
        const pre = p.path.slice(0, lev), cur = p.path.slice(0, lev + 1);
        if (paths.findIndex((q) => q.path.startsWith(cur)) !== paths.indexOf(p)) continue; // draw each branch once
        const x1 = colX(lev), y1 = yOf(pre), x2 = colX(lev + 1), y2 = yOf(cur);
        const [a, n] = p.steps[lev];
        s += `<line class="${hiPrefix(cur) ? "hi" : ""}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>`;
        s += `<text x="${(x1 + x2) / 2}" y="${(y1 + y2) / 2 - 5}" text-anchor="middle">${a}/${n}</text>`;
        s += `<circle class="${cur.slice(-1)}" cx="${x2}" cy="${y2}" r="${stages === 3 ? 6 : 8}"/>`;
      }
    });
    s += `<circle class="root" cx="${colX(0)}" cy="${yOf("")}" r="5"/>`;
    let total = [0, 1];
    paths.forEach((p, i) => {
      const num = p.steps.reduce((a, s_) => a * s_[0], 1), den = p.steps.reduce((a, s_) => a * s_[1], 1);
      const y = 18 + (i + 0.5) * ((H - 30) / leafs), on = sel.has(p.path);
      if (on) { total = [total[0] * den + num * total[1], total[1] * den]; s += `<rect class="hi" x="${colX(stages) + 12}" y="${y - 10}" width="140" height="20" rx="4"/>`; }
      s += `<text class="pp${on ? " hi" : ""}" x="${colX(stages) + 16}" y="${y + 4}">${p.path.toUpperCase().split("").join("")}: ${ft(num, den)}</text>`;
      p.num = num; p.den = den;
    });
    $("#bSvg").innerHTML = s;
    const chosen = paths.filter((p) => sel.has(p.path));
    const tot = fr(total[0], total[1]);
    $("#bRo").innerHTML = `<dt>Pfade im Ereignis</dt><dd>${chosen.length}</dd><dt><i>P</i>(${ev[0]})</dt><dd class="big math">${fh(tot[0], tot[1])}</dd><dt>≈</dt><dd>${fmt(100 * tot[0] / tot[1], 1)} %</dd>`;
    $("#bText").innerHTML = `Urne mit ${R} roten und ${B} blauen Kugeln, ${rep ? "mit" : "ohne"} Zurücklegen. ` +
      (chosen.length ? `Pfadwahrscheinlichkeiten (1. Pfadregel): ${chosen.map((p) => `<span class="math">${p.steps.map((x) => `${x[0]}/${x[1]}`).join(" · ")}</span>`).join("; ")}. ` + (chosen.length > 1 ? `Summe (2. Pfadregel): <strong>${ft(tot[0], tot[1])}</strong>.` : `<strong>${ft(tot[0], tot[1])}</strong>.`) : "Kein Pfad gehört zu diesem Ereignis.")
      + (rep ? "" : " Beachte: Auf jeder Stufe ist eine Kugel weniger in der Urne.");
  }
  ["bR", "bB"].forEach((id) => $("#" + id).addEventListener("input", draw));
  $("#bEv").addEventListener("change", draw);
  $$("[data-rep]").forEach((b) => b.addEventListener("click", () => { rep = b.dataset.rep === "1"; $$("[data-rep]").forEach((x) => x.setAttribute("aria-pressed", String(x === b))); draw(); }));
  $$("[data-st]").forEach((b) => b.addEventListener("click", () => { stages = +b.dataset.st; $$("[data-st]").forEach((x) => x.setAttribute("aria-pressed", String(x === b))); fillEvents(); draw(); }));
  fillEvents();

  // ---------- trainer ----------
  function urn() { const r = rnd(2, 7), b = rnd(2, 7); return [r, b, r + b]; }
  function genTwoRed() {
    const [r, b, n] = urn(), w = Math.random() < 0.5;
    const p = w ? (r / n) * (r / n) : (r / n) * ((r - 1) / (n - 1));
    const sol = w ? `${r}/${n} · ${r}/${n} = ${ft(r * r, n * n)}` : `${r}/${n} · ${r - 1}/${n - 1} = ${ft(r * (r - 1), n * (n - 1))}`;
    return { html: `Urne: ${r} rote, ${b} blaue Kugeln. Zwei Kugeln <b>${w ? "mit" : "ohne"}</b> Zurücklegen. P(zweimal rot)?`, label: "<i>P</i> =", placeholder: "Bruch", answer: sol.split(" = ").pop(), check: checkP(p), solution: `<span class="math">${sol}</span>` };
  }
  function genOnce() {
    const [r, b, n] = urn(), w = Math.random() < 0.5;
    const p = w ? 2 * (r / n) * (b / n) : 2 * (r / n) * (b / (n - 1));
    const a = w ? `${r}/${n} · ${b}/${n} + ${b}/${n} · ${r}/${n}` : `${r}/${n} · ${b}/${n - 1} + ${b}/${n} · ${r}/${n - 1}`;
    const res = w ? ft(2 * r * b, n * n) : ft(2 * r * b, n * (n - 1));
    return { html: `Urne: ${r} rote, ${b} blaue Kugeln. Zwei Kugeln <b>${w ? "mit" : "ohne"}</b> Zurücklegen. P(genau eine rote)?`, label: "<i>P</i> =", placeholder: "Bruch", answer: res, check: checkP(p), solution: `Zwei Pfade: <span class="math">${a} = ${res}</span>` };
  }
  function genAtLeast() {
    const T = pick([["einer 6 bei zwei Würfen", 5, 6, 2], ["einer 6 bei drei Würfen", 5, 6, 3], ["einmal Kopf bei drei Münzwürfen", 1, 2, 3], ["einem Treffer bei zwei Freiwürfen (Trefferquote 70 %)", 3, 10, 2], ["einem Treffer bei drei Würfen (Trefferquote 60 %)", 2, 5, 3]]);
    const q = Math.pow(T[1] / T[2], T[3]), p = 1 - q;
    return { html: `Wie groß ist die Wahrscheinlichkeit für mindestens ${T[0]}?`, label: "<i>P</i> =", placeholder: "Bruch oder Dezimalzahl", answer: fmt(p, 4), check: checkP(p),
      solution: `Gegenereignis „keinmal“: <span class="math">(${T[1]}/${T[2]})<sup>${T[3]}</sup> = ${ft(Math.pow(T[1], T[3]), Math.pow(T[2], T[3]))}</span>; <span class="math">P = 1 − ${ft(Math.pow(T[1], T[3]), Math.pow(T[2], T[3]))} = ${ft(Math.pow(T[2], T[3]) - Math.pow(T[1], T[3]), Math.pow(T[2], T[3]))}</span>` };
  }
  function genIndep() {
    const p1 = pick([0.3, 0.4, 0.5, 0.6, 0.8]), p2 = pick([0.2, 0.25, 0.5, 0.7, 0.9]);
    const T = pick([["beide grün", p1 * p2, `${fmt(p1, 2)} · ${fmt(p2, 2)}`], ["beide rot", (1 - p1) * (1 - p2), `${fmt(1 - p1, 2)} · ${fmt(1 - p2, 2)}`], ["genau eine grün", p1 * (1 - p2) + (1 - p1) * p2, `${fmt(p1, 2)} · ${fmt(1 - p2, 2)} + ${fmt(1 - p1, 2)} · ${fmt(p2, 2)}`]]);
    return { html: `Auf dem Schulweg: Ampel 1 ist mit ${fmt(p1 * 100, 0)} %, Ampel 2 mit ${fmt(p2 * 100, 0)} % grün. P(${T[0]})?`, label: "<i>P</i> =", placeholder: "Dezimalzahl", answer: fmt(T[1], 4), check: checkP(T[1]), solution: `<span class="math">${T[2]} = ${fmt(T[1], 4)}</span>` };
  }
  LK.trainer({ el: "#trainer", modes: [
    { id: "pfad", label: "1. Pfadregel", gen: genTwoRed },
    { id: "summe", label: "2. Pfadregel", gen: genOnce },
    { id: "mindestens", label: "Mindestens einmal", gen: genAtLeast },
    { id: "alltag", label: "Ampeln", gen: genIndep }
  ] });

  LK.quiz({ box: "#quizBox", bar: "#qBar", progress: "#qProgress", key: "baum.best", n: 10, questions: [
    { q: "Was besagt die 1. Pfadregel?", o: ["Pfadwahrscheinlichkeiten addieren", "Entlang eines Pfades multiplizieren", "Alle Äste ergeben 2", "Man zählt die Pfade"], a: 1, e: "Produkt der Astwahrscheinlichkeiten." },
    { q: "Was besagt die 2. Pfadregel?", o: ["Die Wahrscheinlichkeiten passender Pfade addieren", "Pfade multiplizieren", "Gegenereignis bilden", "Nur ein Pfad zählt"], a: 0, e: "Ein Ereignis aus mehreren Pfaden: Summe." },
    { q: "Urne 3 rot, 2 blau, mit Zurücklegen: P(zweimal rot)?", o: ["6/10", "9/25", "3/10", "6/25"], a: 1, e: "3/5 · 3/5." },
    { q: "Dieselbe Urne ohne Zurücklegen: P(zweimal rot)?", o: ["9/25", "3/10", "6/25", "1/2"], a: 1, e: "3/5 · 2/4 = 6/20." },
    { q: "Wie viele Pfade gehören zu „genau einmal rot“ bei zwei Zügen?", o: ["1", "2", "3", "4"], a: 1, e: "rot–blau und blau–rot." },
    { q: "Was ergeben die Äste, die von einem Punkt ausgehen, zusammen?", o: ["0", "1", "2", "Das hängt vom Baum ab"], a: 1, e: "Eines der Ergebnisse tritt sicher ein." },
    { q: "Was ändert sich beim Ziehen ohne Zurücklegen?", o: ["Nichts", "Die Wahrscheinlichkeiten der zweiten Stufe", "Die Zahl der Stufen", "Die Farben"], a: 1, e: "Eine Kugel weniger in der Urne." },
    { q: "P(mindestens eine 6 bei zwei Würfen)?", o: ["2/6", "11/36", "1/36", "25/36"], a: 1, e: "1 − 25/36." },
    { q: "Warum rechnet man „mindestens einmal“ oft über das Gegenereignis?", o: ["Weil es verboten ist, anders zu rechnen", "Weil „keinmal“ nur einen Pfad hat", "Weil es immer 1/2 ist", "Weil es genauer ist"], a: 1, e: "Ein Pfad statt vieler." },
    { q: "Freiwurf-Quote 0,8. P(beide Würfe treffen)?", o: ["1,6", "0,64", "0,8", "0,16"], a: 1, e: "0,8 · 0,8." },
    { q: "Zwei Münzwürfe: P(zweimal Kopf)?", o: ["1/2", "1/4", "1/3", "2/4"], a: 1, e: "½ · ½." },
    { q: "Was ergeben alle Pfadwahrscheinlichkeiten eines Baums zusammen?", o: ["1", "Die Anzahl der Pfade", "0", "½"], a: 0, e: "Gute Kontrolle beim Rechnen." }
  ] });

  LK.views(["verstehen", "baum", "ueben", "alltag", "quiz"], { baum: draw });
})();
