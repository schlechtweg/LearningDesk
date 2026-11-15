(function () {
  "use strict";
  const { $, $$, pick, rnd, shuffle } = LK;
  const M = "−";
  // a term "c·v" as HTML / plain text, c > 0
  const mono = (c, v, sq) => (v ? `${c === 1 ? "" : c}${sq ? `${v}²` : v}` : `${sq ? c * c : c}`);
  // build a binomial problem: first part p·v, second part q·w (w may be "" for a number)
  function make(level, kind) {
    const vars = level === 1 ? [["x", ""], ["a", ""], ["y", ""]] : [["x", ""], ["a", "b"], ["x", "y"], ["a", ""]];
    const [v, w] = pick(vars);
    const p = level === 1 ? 1 : pick([1, 2, 3, 4, 5]), q = level === 1 ? rnd(1, 10) : pick([1, 2, 3, 4, 5, 6, 7]);
    if (LK.gcd(p, q) > 1) return make(level, kind); // otherwise the bracket could be factored further
    const k = level === 3 ? pick([2, 3, 4, 5]) : 1;
    kind = kind || pick([1, 2, 3]);
    const A = `${p === 1 ? "" : p}${v}`, B = w ? `${q === 1 ? "" : q}${w}` : String(q);
    const sqA = `${p * p === 1 ? "" : p * p}${v}²`, sqB = w ? `${q * q === 1 ? "" : q * q}${w}²` : String(q * q);
    const mid = `${2 * p * q}${v}${w}`;
    const kc = (t) => (k === 1 ? t : t.replace(/^(\d*)/, (m) => String(k * (m ? +m : 1))));
    const parts = kind === 3 ? [kc(sqA), `${M} ${k === 1 ? sqB : sqB.replace(/^(\d*)/, (m) => String(k * (m ? +m : 1)))}`] :
      [kc(sqA), `${kind === 1 ? "+" : M} ${k === 1 ? mid : mid.replace(/^(\d*)/, (m) => String(k * +m))}`, `+ ${k === 1 ? sqB : sqB.replace(/^(\d*)/, (m) => String(k * (m ? +m : 1)))}`];
    const term = parts.join(" ");
    const res = kind === 3 ? `(${A} + ${B})(${A} ${M} ${B})` : `(${A} ${kind === 1 ? "+" : M} ${B})²`;
    const ascii = (s) => s.replace(/²/g, "^2").replace(/−/g, "-").replace(/(\d)([a-z(])/g, "$1*$2").replace(/([a-z)])([a-z(])/g, "$1*$2").replace(/([a-z])([a-z])/g, "$1*$2");
    return { v, w, p, q, k, kind, A, B, sqA, sqB, mid, term, res: (k === 1 ? "" : k) + res, ascii: ascii((k === 1 ? "" : k + "*") + res.replace(")(", ")*(")), termAscii: ascii(term) };
  }
  function steps(t) {
    const st = [];
    if (t.k > 1) st.push([`Zuerst die gemeinsame Zahl nach vorne ziehen: ${t.term} = ${t.k} · (${t.kind === 3 ? `${t.sqA} ${M} ${t.sqB}` : `${t.sqA} ${t.kind === 1 ? "+" : M} ${t.mid} + ${t.sqB}`})`, `Alle Glieder sind durch ${t.k} teilbar.`]);
    st.push([`Was steht vorne und hinten im Quadrat? <span class="hl1">${t.sqA} = ${t.A} · ${t.A}</span> und <span class="hl2">${t.sqB} = ${t.B} · ${t.B}</span>`, `Also kommt vorne ${t.A} und hinten ${t.B} in die Klammer.`]);
    if (t.kind === 3) st.push(["Es gibt keine Mitte, nur ein Minus ⇒ zwei Klammern: einmal +, einmal −", "Das ist die 3. binomische Formel."]);
    else st.push([`Passt die Mitte? 2 · ${t.A} · ${t.B} = <span class="hl3">${t.mid}</span> ✓`, `In der Mitte steht ${t.kind === 1 ? "Plus ⇒ in die Klammer kommt + (1. Formel)" : "Minus ⇒ in die Klammer kommt − (2. Formel)"}.`]);
    st.push([`Ergebnis: <b>${t.term} = ${t.res}</b>`, "Probe: Ausmultiplizieren ergibt wieder den Ausgangsterm."]);
    return st;
  }
  let level = 1, cur, shown = 0;
  function newS() { cur = make(level); shown = 0; drawS(); }
  function drawS() { $("#sTask").innerHTML = cur.term; const st = steps(cur); $("#sSteps").innerHTML = st.slice(0, shown).map(([a, b]) => `<li>${a}${b ? `<span class="why">${b}</span>` : ""}</li>`).join(""); $("#sNext").disabled = shown >= st.length; }
  $$("[data-l]").forEach((b) => b.addEventListener("click", () => { level = +b.dataset.l; $$("[data-l]").forEach((x) => x.setAttribute("aria-pressed", String(x === b))); newS(); }));
  $("#sNew").addEventListener("click", newS);
  $("#sNext").addEventListener("click", () => { shown++; drawS(); });
  $("#sAll").addEventListener("click", () => { shown = 9; drawS(); });
  newS();

  // ---------- recognise ----------
  function fake() {
    const t = make(2, pick([1, 2])), r = pick(["mid", "sum", "sign"]);
    if (r === "mid") { const bad = 2 * t.p * t.q + pick([1, 2, -1, 3]) * (t.p === 1 ? 1 : t.p); return { term: `${t.sqA} + ${Math.max(1, bad)}${t.v}${t.w} + ${t.sqB}`, a: "0", why: `2 · ${t.A} · ${t.B} = ${t.mid}, nicht ${Math.max(1, bad)}${t.v}${t.w}: Das Mittelglied passt nicht.` }; }
    if (r === "sum") return { term: `${t.sqA} + ${t.sqB}`, a: "0", why: "Eine Summe zweier Quadrate lässt sich nicht mit einer binomischen Formel zerlegen." };
    return { term: `${t.sqA} + ${t.mid} ${M} ${t.sqB}`, a: "0", why: "Das zweite Quadrat steht mit Minus da: keine binomische Formel." };
  }
  let E = null, done = false, sc = 0, tot = 0;
  function nextE() { if (Math.random() < 0.3) E = fake(); else { const t = make(pick([1, 2])); E = { term: t.term, a: String(t.kind), why: `= ${t.res}` }; } done = false; $("#eTask").innerHTML = E.term; $("#eFb").textContent = ""; $$("#eOpts button").forEach((b) => b.classList.remove("right", "wrong")); }
  $$("#eOpts button").forEach((b) => b.addEventListener("click", () => { if (done) return; done = true; tot++; const ok = b.dataset.a === E.a; if (ok) sc++; b.classList.add(ok ? "right" : "wrong"); $(`#eOpts [data-a="${E.a}"]`).classList.add("right"); $("#eFb").innerHTML = (ok ? "Richtig. " : "Nicht ganz. ") + E.why; $("#eScore").textContent = `${sc} von ${tot} richtig`; }));
  $("#eNext").addEventListener("click", nextE); nextE();

  // ---------- trainer ----------
  // the answer must be equivalent and actually written as a product
  const factored = (raw) => { const s = String(raw).replace(/\s/g, ""); return /\)\s*\^?\s*2|\)²|\)\*?\(/.test(s) ? null : "Der Term stimmt, ist aber noch nicht in Faktoren zerlegt. Schreibe ihn als Produkt, z. B. <code>(x+3)^2</code>."; };
  const gen = (level, kind) => () => { const t = make(level, kind); const f = LK.parse(t.ascii);
    return { html: `Zerlege in Faktoren: <span class="math">${t.term}</span>`, label: "Produkt:", placeholder: "z. B. (x+3)^2", answer: t.ascii.replace(/\*/g, ""),
      check: LK.check.expr(f, { vars: "abxy", form: factored, fallback: "Prüfe die beiden Quadrate und das Mittelglied (2 · a · b)." }), solution: steps(t).map(([a]) => a).join("<br>") }; };
  function genGap() { const t = make(pick([1, 2]), pick([1, 2])); const which = pick(["mid", "b"]);
    if (which === "mid") { const f = LK.parse(t.mid.replace(/(\d)([a-z])/g, "$1*$2").replace(/([a-z])([a-z])/g, "$1*$2"));
      return { html: `Ergänze, sodass ein Binom entsteht: <span class="math">${t.sqA} ${t.kind === 1 ? "+" : M} ☐ + ${t.sqB} = ${t.res}</span>`, label: "☐ =", answer: t.mid, check: LK.check.expr(f, { vars: "abxy", fallback: "Das Mittelglied ist 2 · a · b." }), solution: `2 · ${t.A} · ${t.B} = <b>${t.mid}</b>` }; }
    const f = LK.parse(t.sqB.replace(/²/g, "^2").replace(/(\d)([a-z])/g, "$1*$2"));
    return { html: `Ergänze das fehlende Quadrat: <span class="math">${t.sqA} ${t.kind === 1 ? "+" : M} ${t.mid} + ☐ = (${t.A} ${t.kind === 1 ? "+" : M} ☐)²</span>. Welcher Term fehlt hinten?`, label: "☐ =", answer: t.sqB.replace("²", "^2"), check: LK.check.expr(f, { vars: "abxy", fallback: "b = Mittelglied : (2 · a), dann quadrieren." }), solution: `b = ${t.mid} : (2 · ${t.A}) = ${t.B} ⇒ b² = <b>${t.sqB}</b>` }; }
  // Product-sum trick: find m, n with m·n = c and m + n = b for x² + bx + c
  const sg = (n) => (n < 0 ? `${M} ${-n}` : `+ ${n}`);
  function genPair() {
    let m, n;
    // Favour perfect squares (m = n) and differences of squares (n = -m)
    m = pick([-1, 1]) * rnd(1, 9); n = Math.random() < 0.4 ? m : (Math.random() < 0.2 ? -m : pick([-1, 1]) * rnd(1, 9));
    const b = m + n, c = m * n;
    const term = `x² ${b === 0 ? "" : (b < 0 ? `${M} ` : "+ ") + (Math.abs(b) === 1 ? "" : Math.abs(b)) + "x "}${sg(c)}`;
    const res = m === n ? `(x ${sg(m)})²` : `(x ${sg(m)})(x ${sg(n)})`;
    const pairs = [];
    for (let i = 1; i <= Math.abs(c); i++) if (Math.abs(c) % i === 0) { const j = Math.abs(c) / i; if (i > j) break; for (const [u, v] of c > 0 ? [[i, j], [-i, -j]] : [[i, -j], [-i, j]]) pairs.push([u, v]); }
    const f = LK.parse(`(x+(${m}))*(x+(${n}))`);
    const row = ([u, v]) => `${u} · ${v} = ${c}, Summe ${u} + ${v} = ${u + v} ${u + v === b ? "✓" : "✗"}`.replace(/-/g, M);
    return { html: `Finde zwei Zahlen: <b>mal</b> genommen ${String(c).replace("-", M)}, <b>plus</b> gerechnet ${String(b).replace("-", M)}. Zerlege dann: <span class="math">${term}</span>`,
      label: "Produkt:", placeholder: "z. B. (x+2)(x+3)", answer: res.replace(/ /g, "").replace(/−/g, "-").replace("²", "^2"),
      check: LK.check.expr(f, { vars: "x", form: factored, fallback: "Schreibe alle Zahlenpaare auf, die mal genommen die hintere Zahl ergeben, und prüfe ihre Summe." }),
      solution: pairs.map(row).join("<br>") + `<br>⇒ <b>${term} = ${res}</b>` };
  }
  LK.trainer({ el: "#trainer", modes: [
    { id: "f1", label: "1. Formel", gen: gen(1, 1) },
    { id: "f2", label: "2. Formel", gen: gen(1, 2) },
    { id: "f3", label: "3. Formel", gen: gen(1, 3) },
    { id: "mix", label: "Gemischt mit Zahlen vor x", gen: () => gen(2)() },
    { id: "aus", label: "Mit Ausklammern", gen: () => gen(3)() },
    { id: "luecke", label: "Lücken füllen", gen: genGap },
    { id: "paar", label: "Zahlenpaar-Trick", gen: genPair }
  ] });

  LK.quiz({ box: "#quizBox", bar: "#qBar", progress: "#qProgress", key: "binomf.best", n: 8, questions: [
    { q: "x² + 8x + 16 = ?", o: ["(x + 4)²", "(x + 8)²", "(x + 16)²", "(x − 4)²"], a: 0, e: "a = x, b = 4, 2ab = 8x." },
    { q: "x² − 10x + 25 = ?", o: ["(x + 5)²", "(x − 5)²", "(x − 25)²", "(x + 5)(x − 5)"], a: 1, e: "Minus beim Mittelglied: 2. Formel." },
    { q: "a² − 49 = ?", o: ["(a − 7)²", "(a + 7)(a − 7)", "(a − 49)²", "nicht zerlegbar"], a: 1, e: "3. Formel." },
    { q: "Lässt sich x² + 9 mit einer binomischen Formel zerlegen?", o: ["ja, (x + 3)²", "ja, (x + 3)(x − 3)", "nein", "ja, (x − 3)²"], a: 2, e: "Summe von Quadraten." },
    { q: "Was muss man zuerst prüfen?", o: ["Das Mittelglied: ist es 2ab?", "Ob die Zahl gerade ist", "Ob x vorkommt", "Nichts"], a: 0, e: "Sonst ist es kein Binom." },
    { q: "4x² + 12x + 9 = ?", o: ["(4x + 3)²", "(2x + 3)²", "(2x + 9)²", "(4x + 9)²"], a: 1, e: "4x² = (2x)², 2 · 2x · 3 = 12x." },
    { q: "3x² − 27 = ?", o: ["3(x + 3)(x − 3)", "(3x − 9)²", "3(x − 3)²", "(x + 3)(x − 9)"], a: 0, e: "Erst 3 ausklammern." },
    { q: "Was fehlt? x² + 6x + ☐ = (x + 3)²", o: ["3", "6", "9", "36"], a: 2, e: "b² = 3² = 9." }
  ] });

  LK.views(["verstehen", "schritte", "erkennen", "ueben", "alltag", "quiz"], {});
})();
