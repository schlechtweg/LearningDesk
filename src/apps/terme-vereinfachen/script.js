(function () {
  "use strict";
  const { $, $$, rnd, pick, nz, shuffle, poly, polyFn, collect, check, monoParts } = LK;
  const TYPES = [{ v: { a: 1 } }, { v: { b: 1 } }, { v: { a: 1, b: 1 } }, { v: { a: 2 } }, { v: {} }];
  const key = (v) => monoParts(v).vt;

  // ---------- term sorter ----------
  let sortTerms = [];
  function newSort() {
    const types = shuffle([0, 1, 2, 3, 4]).slice(0, 3);
    sortTerms = [];
    types.forEach((t) => { const n = rnd(2, 3); for (let i = 0; i < n; i++) sortTerms.push({ c: nz(-7, 9), v: TYPES[t].v, t }); });
    sortTerms = shuffle(sortTerms);
    renderSort(false);
    $("#sortResult").hidden = true; $("#sortSum").disabled = true; $("#sortLegend").hidden = true;
  }
  function renderSort(marked) {
    $("#sortTerm").innerHTML = sortTerms.map((m, i) => {
      const { html } = poly([m]);
      const shown = i === 0 ? html : (m.c < 0 ? "− " + html.replace(/^−/, "") : "+ " + html);
      return `<span class="chip${marked ? " t" + m.t : ""}">${shown}</span>`;
    }).join("");
  }
  $("#sortMark").addEventListener("click", () => {
    renderSort(true); $("#sortSum").disabled = false;
    const used = [...new Set(sortTerms.map((m) => m.t))];
    $("#sortLegend").hidden = false;
    $("#sortLegend").innerHTML = used.map((t) => `<span><span class="chip t${t}" style="font-size:1rem">${t === 4 ? "Zahl" : poly([{ c: 1, v: TYPES[t].v }]).html}</span> ${t === 4 ? "ohne Variable" : "-Terme"}</span>`).join("");
  });
  $("#sortSum").addEventListener("click", () => {
    const res = collect(sortTerms);
    const used = [...new Set(sortTerms.map((m) => m.t))];
    const parts = used.map((t) => {
      const same = sortTerms.filter((m) => m.t === t);
      const sum = same.reduce((s, m) => s + m.c, 0);
      return `<span class="chip t${t}" style="font-size:1.05rem">${same.map((m) => (m.c < 0 ? `(${m.c})` : m.c)).join(" + ").replace(/-/g, "−")} = ${sum}</span>`.replace(/\(−/g, "(−");
    });
    $("#sortResult").hidden = false;
    $("#sortResult").innerHTML = `<p class="small"><strong>Koeffizienten addieren:</strong></p><div class="chips" style="font-size:1rem">${parts.join("")}</div><p>Ergebnis: <span class="math" style="font-size:1.4rem">${poly(res).html}</span></p>`;
  });
  $("#sortNew").addEventListener("click", newSort);

  // ---------- trainer ----------
  const simplifiedSum = (n) => (raw) => (/[()]/.test(raw) ? "Das stimmt, aber löse die Klammern noch auf." : LK.countSummands(raw) > n ? "Das stimmt, aber du kannst noch gleichartige Terme zusammenfassen." : null);
  function genAdd() {
    const types = shuffle([0, 1, 2, 3, 4]).slice(0, pick([2, 2, 3]));
    let terms = [];
    types.forEach((t) => { const n = rnd(1, 3); for (let i = 0; i < n; i++) terms.push({ c: nz(-8, 9), v: TYPES[t].v }); });
    if (terms.length < 4) terms.push({ c: nz(-5, 6), v: TYPES[types[0]].v });
    terms = shuffle(terms);
    const res = collect(terms);
    if (!res.length) return genAdd();
    return { html: `<span class="math">${poly(terms).html}</span>`, label: "=", placeholder: "z. B. 4a + 7b", answer: poly(res).text,
      check: check.expr(polyFn(res), { vars: "ab", form: simplifiedSum(res.length), hints: [
        { f: polyFn(collect(terms.map((m) => ({ c: Math.abs(m.c), v: m.v })))), msg: "Achte auf die Vorzeichen: Ein Minus gehört zum Term dahinter." }] }),
      solution: `Gleichartige Terme sortieren und Koeffizienten addieren: <span class="math">${poly(res).html}</span>` };
  }
  const MV = ["a", "b", "x", "y"];
  function genMul() {
    const n = pick([2, 2, 3]);
    const factors = [];
    for (let i = 0; i < n; i++) { const v = {}; const k = rnd(1, 2); for (let j = 0; j < k; j++) { const name = pick(MV.slice(0, 3)); v[name] = (v[name] || 0) + 1; } factors.push({ c: nz(-6, 7), v }); }
    const prod = factors.reduce((acc, f) => { const v = { ...acc.v }; Object.entries(f.v).forEach(([k, e]) => { v[k] = (v[k] || 0) + e; }); return { c: acc.c * f.c, v }; }, { c: 1, v: {} });
    const html = factors.map((f) => (f.c < 0 ? `(${poly([f]).html})` : poly([f]).html)).join(" · ");
    const form = (raw) => (/[*·×()]/.test(raw) ? "Das stimmt, aber schreibe das Ergebnis ohne Malzeichen und Klammern, z. B. <code>-6a^2b</code>." : /([a-z])[^a-z]*\1/.test(raw.replace(/\^\d+/g, "")) ? "Das stimmt, aber gleiche Variablen schreibt man als Potenz, z. B. <code>a^2</code> statt <code>aa</code>." : null);
    return { html: `<span class="math">${html}</span>`, label: "=", placeholder: "z. B. 12ab", answer: poly([prod]).text,
      check: check.expr(polyFn([prod]), { vars: "abx", form, hints: [{ f: polyFn([{ c: -prod.c, v: prod.v }]), msg: "Prüfe das Vorzeichen: Minus mal Minus ergibt Plus, Minus mal Plus ergibt Minus." }] }),
      solution: `Zahlen: <span class="math">${factors.map((f) => f.c).join(" · ").replace(/-/g, "−")} = ${String(prod.c).replace("-", "−")}</span>, Variablen zusammen: <span class="math">${poly([{ c: 1, v: prod.v }]).html}</span>. Ergebnis: <span class="math">${poly([prod]).html}</span>` };
  }
  function genMix() {
    const k = nz(-4, 5), p = nz(-6, 7), q = nz(-6, 7), m = nz(-6, 7), r = nz(-6, 7);
    const vA = pick([{ a: 1 }, { x: 1 }]), vB = vA.a ? { b: 1 } : { y: 1 };
    const terms = [{ c: k * p, v: vA }, { c: k * q, v: vB }, { c: m, v: vA }, { c: r, v: vB }];
    const res = collect(terms);
    if (res.length < 1) return genMix();
    const inner = poly([{ c: p, v: vA }, { c: q, v: vB }]).html;
    const kTxt = k === 1 ? "" : k === -1 ? "−" : k < 0 ? `(${k})`.replace("-", "−") : String(k);
    const html = `${kTxt}(${inner}) ${poly([{ c: m, v: vA }, { c: r, v: vB }]).html.replace(/^(?!−)/, "+ ").replace(/^−/, "− ")}`;
    const vars = vA.a ? "ab" : "xy";
    return { html: `<span class="math">${html}</span>`, label: "=", placeholder: "z. B. 5a - 3b", answer: poly(res).text,
      check: check.expr(polyFn(res), { vars, form: simplifiedSum(res.length) }),
      solution: `Klammer auflösen: <span class="math">${poly([{ c: k * p, v: vA }, { c: k * q, v: vB }]).html}</span>, dann zusammenfassen: <span class="math">${poly(res).html}</span>` };
  }
  LK.trainer({ el: "#trainer", modes: [
    { id: "plus", label: "Zusammenfassen", gen: genAdd, instr: "Fasse gleichartige Terme zusammen.", hint: "Schreibweise: <code>4a+7b-2ab</code>, <code>a^2</code> für a²." },
    { id: "mal", label: "Produkte", gen: genMul, instr: "Vereinfache das Produkt.", hint: "Schreibweise: <code>-6a^2b</code>, ohne Malzeichen." },
    { id: "mix", label: "Klammer und Zusammenfassen", gen: genMix, instr: "Löse die Klammer auf und fasse zusammen.", hint: "Schreibweise: <code>5a-3b</code>." }
  ] });

  // ---------- quiz ----------
  LK.quiz({ box: "#quizBox", bar: "#qBar", progress: "#qProgress", key: "terme.best", n: 10, questions: [
    { q: "3a + 2b + 4a = ?", o: ["9ab", "7a + 2b", "9a", "7ab + 2"], a: 1, e: "Nur 3a und 4a sind gleichartig: 7a. 2b bleibt stehen." },
    { q: "Welche Terme sind gleichartig?", o: ["2x und 2x²", "3ab und 5ba", "a und b", "4 und 4a"], a: 1, e: "ab und ba sind dasselbe, weil man Faktoren vertauschen darf." },
    { q: "x + x = ?", o: ["x²", "2x", "2", "xx"], a: 1, e: "Ein x plus ein x sind zwei x. x² entsteht erst bei x · x." },
    { q: "x · x = ?", o: ["2x", "x²", "2x²", "x"], a: 1, e: "Gleiche Variable mal gleiche Variable ergibt die Potenz." },
    { q: "3a · 4b = ?", o: ["7ab", "12ab", "12a + b", "34ab"], a: 1, e: "3 · 4 = 12 und a · b = ab." },
    { q: "5x − 7x = ?", o: ["2x", "−2x", "−2", "12x"], a: 1, e: "5 − 7 = −2, also −2x." },
    { q: "4ab − ab = ?", o: ["4", "3ab", "4ab", "3"], a: 1, e: "Vor ab steht unsichtbar eine 1: 4ab − 1ab = 3ab." },
    { q: "(−2a) · (−3a) = ?", o: ["−6a²", "6a²", "6a", "−5a²"], a: 1, e: "Minus mal Minus ergibt Plus, a · a = a²." },
    { q: "2x² + 3x + x² − x = ?", o: ["3x² + 2x", "5x³", "3x² + 4x", "6x²"], a: 0, e: "x²-Terme: 2 + 1 = 3. x-Terme: 3 − 1 = 2." },
    { q: "Was heißt „Koeffizient“?", o: ["Die Hochzahl", "Die Zahl vor der Variablen", "Die Variable selbst", "Das Ergebnis"], a: 1, e: "In 7ab ist 7 der Koeffizient." },
    { q: "2(a + 3b) − a = ?", o: ["a + 6b", "a + 3b", "2a + 6b", "3a + 6b"], a: 0, e: "2a + 6b − a = a + 6b." },
    { q: "Welcher Term ist vollständig vereinfacht?", o: ["3a + 2a", "a·a·b", "5ab − 2a", "x + x"], a: 2, e: "5ab und 2a sind nicht gleichartig, da lässt sich nichts mehr zusammenfassen." }
  ] });

  newSort();
  LK.views(["verstehen", "sortieren", "ueben", "alltag", "quiz"]);
})();
