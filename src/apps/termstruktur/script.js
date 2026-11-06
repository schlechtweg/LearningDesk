(function () {
  "use strict";
  const { $, pick, rnd, nz, fmt } = LK;

  // ---------- small parser that keeps the structure (AST) ----------
  // node: {t:"num", v} | {t:"var", v} | {t:"neg", a} | {t:"op", op:"+-*/^", a, b, implicit}
  function parseTree(src) {
    const s = String(src).replace(/\s+/g, "").replace(/[−–]/g, "-").replace(/[·⋅×]/g, "*").replace(/[:÷]/g, "/").replace(/²/g, "^2").replace(/³/g, "^3").replace(/(\d),(\d)/g, "$1.$2");
    if (!s) throw new Error("leer");
    const toks = [];
    for (let i = 0; i < s.length;) {
      const c = s[i];
      if (/[0-9.]/.test(c)) { let j = i; while (j < s.length && /[0-9.]/.test(s[j])) j++; toks.push({ t: "num", v: parseFloat(s.slice(i, j)) }); i = j; continue; }
      if ("+-*/^()".includes(c)) { toks.push({ t: c }); i++; continue; }
      if (/[a-zA-Z]/.test(c)) { toks.push({ t: "var", v: c.toLowerCase() }); i++; continue; }
      throw new Error("Zeichen");
    }
    let p = 0;
    const peek = () => toks[p];
    const starts = (tk) => tk && (tk.t === "num" || tk.t === "var" || tk.t === "(");
    function expr() { let a = term(); while (peek() && (peek().t === "+" || peek().t === "-")) { const op = toks[p++].t; a = { t: "op", op, a, b: term() }; } return a; }
    function term() {
      let a = unary();
      for (;;) {
        const tk = peek();
        if (tk && (tk.t === "*" || tk.t === "/")) { p++; a = { t: "op", op: tk.t, a, b: unary() }; }
        else if (starts(tk)) a = { t: "op", op: "*", a, b: power(), implicit: true };
        else break;
      }
      return a;
    }
    function unary() { if (peek() && peek().t === "-") { p++; return { t: "neg", a: unary() }; } return power(); }
    function power() { const b = primary(); if (peek() && peek().t === "^") { p++; return { t: "op", op: "^", a: b, b: primary() }; } return b; }
    function primary() {
      const tk = toks[p++];
      if (!tk) throw new Error("unvollständig");
      if (tk.t === "num") return { t: "num", v: tk.v };
      if (tk.t === "var") return { t: "var", v: tk.v };
      if (tk.t === "(") { const a = expr(); if (!peek() || peek().t !== ")") throw new Error("Klammer"); p++; return { ...a, paren: true }; }
      throw new Error("Syntax");
    }
    const tree = expr();
    if (p < toks.length) throw new Error("Syntax");
    return tree;
  }
  const SYM = { "+": "+", "-": "−", "*": "·", "/": ":", "^": "^" };
  const NAME = { "+": "Summe", "-": "Differenz", "*": "Produkt", "/": "Quotient", "^": "Potenz", neg: "Gegenzahl (Produkt mit −1)" };
  const VERB = { "+": "addiert", "-": "subtrahiert", "*": "multipliziert", "/": "dividiert", "^": "potenziert" };
  function show(n, top = true) {
    let s;
    if (n.t === "num") s = fmt(n.v, 4);
    else if (n.t === "var") s = `<i>${n.v}</i>`;
    else if (n.t === "neg") s = "−" + show(n.a, false);
    else if (n.op === "^") s = `${show(n.a, false)}<sup>${show(n.b, false)}</sup>`;
    else s = `${show(n.a, false)}${n.implicit ? "" : ` ${SYM[n.op]} `}${show(n.b, false)}`;
    return n.paren && !top ? `(${s})` : s;
  }
  function evalT(n, env) {
    if (n.t === "num") return n.v;
    if (n.t === "var") return n.v in env ? env[n.v] : NaN;
    if (n.t === "neg") return -evalT(n.a, env);
    const a = evalT(n.a, env), b = evalT(n.b, env);
    return n.op === "+" ? a + b : n.op === "-" ? a - b : n.op === "*" ? a * b : n.op === "/" ? a / b : Math.pow(a, b);
  }
  const ART = { Summe: "eine", Differenz: "eine", Produkt: "ein", Quotient: "ein", Potenz: "eine" };
  const num = (v, wrap = false) => { const t = isFinite(v) ? fmt(v, 3).replace("-", "−") : "?"; return wrap && v < 0 ? `(${t})` : t; };
  const typeOf = (n) => (n.t === "op" ? NAME[n.op] : n.t === "neg" ? NAME.neg : n.t === "var" ? "Variable" : "Zahl");

  // ---------- term tree ----------
  const PRESETS = ["3x + 5", "3(x + 5)", "(x - 2)^2", "2x^2 - 4", "(x + 1)(x - 3)", "(4x + 2) : 2", "5 - 2(x + y)", "x^2 + y^2", "-x^2 + 3x"];
  $("#tSel").innerHTML = PRESETS.map((t, i) => `<option value="${i}">${t.replace(/-/g, "−").replace(/\^2/g, "²")}</option>`).join("");
  function layout(n, depth, x0, out) {
    // returns the subtree width in leaves; places the node centred over its children
    const kids = n.t === "op" ? [n.a, n.b] : n.t === "neg" ? [n.a] : [];
    if (!kids.length) { out.push({ n, depth, x: x0 + 0.5, kids: [] }); return 1; }
    let w = 0; const ks = [];
    for (const k of kids) { const before = out.length; w += layout(k, depth + 1, x0 + w, out); ks.push(out.length - 1); void before; }
    const xs = ks.map((i) => out[i].x);
    out.push({ n, depth, x: (Math.min(...xs) + Math.max(...xs)) / 2, kids: ks });
    return w;
  }
  function drawTree() {
    const own = $("#tIn").value.trim();
    let tree;
    try { tree = parseTree(own || PRESETS[+$("#tSel").value]); $("#tMsg").textContent = ""; }
    catch (e) { $("#tMsg").textContent = "Diesen Term kann ich nicht lesen. Beispiel: 3(x-2)^2+1"; return; }
    const env = { x: +$("#tX").value, y: +$("#tY").value };
    $("#tXOut").textContent = env.x; $("#tYOut").textContent = env.y;
    const nodes = []; const W = layout(tree, 0, 0, nodes);
    const D = Math.max(...nodes.map((o) => o.depth)) + 1;
    const X = (x) => 20 + (x / W) * 420, Y = (d) => 40 + d * (230 / Math.max(1, D - 1 || 1));
    let s = "";
    nodes.forEach((o) => o.kids.forEach((k) => { s += `<line class="edge" x1="${X(o.x)}" y1="${Y(o.depth)}" x2="${X(nodes[k].x)}" y2="${Y(nodes[k].depth)}"/>`; }));
    nodes.forEach((o) => {
      const n = o.n, v = evalT(n, env), isOp = n.t === "op" || n.t === "neg";
      const label = n.t === "num" ? fmt(n.v, 4) : n.t === "var" ? n.v : n.t === "neg" ? "−" : SYM[n.op];
      s += isOp ? `<circle class="op${o.depth === 0 ? " top" : ""}" cx="${X(o.x)}" cy="${Y(o.depth)}" r="15"/>` : `<rect class="leaf" x="${X(o.x) - 18}" y="${Y(o.depth) - 13}" width="36" height="26" rx="6"/>`;
      s += `<text x="${X(o.x)}" y="${Y(o.depth)}"${n.t === "var" ? ' font-style="italic"' : ""}>${label}</text>`;
      if (n.t !== "num") s += `<text class="val" x="${X(o.x)}" y="${Y(o.depth) + (isOp ? 26 : 22)}">= ${num(v)}</text>`;
    });
    $("#tSvg").innerHTML = s;
    const v = evalT(tree, env);
    $("#tType").textContent = typeOf(tree);
    // evaluation steps: inner operations first (post-order)
    const steps = [];
    (function walk(n) { if (n.t === "op") { walk(n.a); walk(n.b); steps.push(`<span class="math">${show(n.a, false)} ${SYM[n.op] === "^" ? "hoch" : SYM[n.op]} ${show(n.b, false)}</span> → ${num(evalT(n.a, env), n.op === "^")} ${SYM[n.op] === "^" ? "hoch" : SYM[n.op]} ${num(evalT(n.b, env), true)} = <b>${num(evalT(n, env))}</b>`); } else if (n.t === "neg") { walk(n.a); steps.push(`Gegenzahl von ${num(evalT(n.a, env), true)} = <b>${num(-evalT(n.a, env))}</b>`); } })(tree);
    $("#tSteps").innerHTML = (tree.t === "op" ? `Der Term <span class="math">${show(tree)}</span> ist ${ART[typeOf(tree)]} <strong>${typeOf(tree)}</strong>, weil zuletzt ${VERB[tree.op]} wird. ` : "")
      + `Für <span class="math"><i>x</i> = ${env.x}</span>${/y/.test(own || PRESETS[+$("#tSel").value]) ? `, <span class="math"><i>y</i> = ${env.y}</span>` : ""}: ` + (steps.length ? `<br>${steps.map((t, i) => `${i + 1}. ${t}`).join("<br>")}` : "") + `<br>Termwert: <strong>${isFinite(v) ? num(v) : "nicht definiert (Division durch 0)"}</strong>`;
  }
  ["tSel", "tX", "tY"].forEach((id) => $("#" + id).addEventListener("input", drawTree));
  $("#tSel").addEventListener("change", () => { $("#tIn").value = ""; drawTree(); });
  $("#tIn").addEventListener("input", drawTree);

  // ---------- trainer ----------
  const sgn = (k) => (k < 0 ? `(${String(k).replace("-", "−")})` : String(k));
  function genType() {
    const a = rnd(2, 9), b = rnd(2, 9), c = rnd(2, 6);
    const T = pick([
      [`${a}<i>x</i> + ${b}`, "Summe"], [`${a} · (<i>x</i> + ${b})`, "Produkt"], [`(<i>x</i> − ${b})<sup>2</sup>`, "Potenz"],
      [`(${a}<i>x</i> + ${b}) : ${c}`, "Quotient"], [`${a}<i>x</i><sup>2</sup> − ${b}`, "Differenz"], [`${a} + ${b} · <i>x</i>`, "Summe"],
      [`(<i>x</i> + ${a}) · (<i>x</i> − ${b})`, "Produkt"], [`${a}<i>x</i> − (<i>x</i> + ${b})`, "Differenz"], [`<i>x</i> : ${c} + ${a}`, "Summe"],
      [`(${a} + <i>x</i>)<sup>3</sup>`, "Potenz"], [`${a} − ${b} · <i>x</i><sup>2</sup>`, "Differenz"], [`${a}<i>x</i> : (<i>x</i> + ${b})`, "Quotient"]
    ]);
    return { html: `Welche Termart ist <span class="math">${T[0]}</span>?`, label: "Termart:", placeholder: "Summe, Differenz, Produkt, Quotient oder Potenz", answer: T[1],
      check: (raw) => { const t = raw.trim().toLowerCase(); const v = ["summe", "differenz", "produkt", "quotient", "potenz"].find((w) => t.startsWith(w.slice(0, 4)));
        if (!v) return { ok: false, msg: "Antworte mit Summe, Differenz, Produkt, Quotient oder Potenz." };
        return v === T[1].toLowerCase() ? { ok: true } : { ok: false, msg: "Welche Rechnung führst du ganz zum Schluss aus?" }; },
      solution: `Zuletzt wird ${{ Summe: "addiert", Differenz: "subtrahiert", Produkt: "multipliziert", Quotient: "dividiert", Potenz: "potenziert" }[T[1]]}: <b>${T[1]}</b>.` };
  }
  function genValue() {
    const x = nz(-6, 6), a = nz(-5, 6), b = rnd(-9, 9), c = rnd(2, 5);
    const T = pick([
      [`${a}<i>x</i> + ${b}`.replace("+ -", "− "), (v) => a * v + b, (v) => `${a} · ${sgn(v)} + ${b}`],
      [`<i>x</i><sup>2</sup> − ${c}<i>x</i>`, (v) => v * v - c * v, (v) => `${sgn(v)}<sup>2</sup> − ${c} · ${sgn(v)}`],
      [`${c} · (<i>x</i> − 2)<sup>2</sup>`, (v) => c * (v - 2) ** 2, (v) => `${c} · (${sgn(v)} − 2)<sup>2</sup>`],
      [`(<i>x</i> + ${c}) · (<i>x</i> − 1)`, (v) => (v + c) * (v - 1), (v) => `(${sgn(v)} + ${c}) · (${sgn(v)} − 1)`],
      [`−<i>x</i><sup>2</sup> + ${c}`, (v) => -(v * v) + c, (v) => `−${sgn(v)}<sup>2</sup> + ${c}`]
    ]);
    const val = T[1](x);
    return { html: `Berechne den Termwert von <span class="math">${T[0].replace(/ -(\d)/, " − $1")}</span> für <span class="math"><i>x</i> = ${String(x).replace("-", "−")}</span>.`,
      label: "Wert:", placeholder: "Zahl", answer: String(val).replace("-", "−"), check: LK.check.num(val, { abs: 1e-9 }),
      hint: "Negative Zahlen beim Einsetzen in Klammern setzen.", solution: `<span class="math">${T[2](x).replace(/\(-/g, "(−")} = <b>${String(val).replace("-", "−")}</b></span>` };
  }
  function genBuild() {
    const k = rnd(2, 9), m = rnd(2, 9);
    const T = pick([
      [`das ${["", "", "Doppelte", "Dreifache", "Vierfache", "Fünffache", "Sechsfache", "Siebenfache", "Achtfache", "Neunfache"][k]} einer Zahl <i>x</i>, vermindert um ${m}`, `${k}x-${m}`],
      [`die Summe aus einer Zahl <i>x</i> und ${m}, multipliziert mit ${k}`, `${k}(x+${m})`],
      [`das Quadrat einer Zahl <i>x</i>, vermehrt um ${m}`, `x^2+${m}`],
      [`die Differenz aus ${m} und dem ${k}-fachen einer Zahl <i>x</i>`, `${m}-${k}x`],
      [`der Quotient aus einer Zahl <i>x</i> und ${k}, vermehrt um ${m}`, `x/${k}+${m}`],
      [`das Quadrat der Summe aus einer Zahl <i>x</i> und ${m}`, `(x+${m})^2`]
    ]);
    const f = LK.parse(T[1]);
    return { html: `Schreibe als Term: ${T[0]}.`, label: "Term:", placeholder: "z. B. 3x-5", answer: T[1].replace(/\*/g, "·"),
      check: LK.check.expr(f, { vars: "x" }), solution: `<span class="math">${T[1].replace(/\^2/g, "²").replace(/-/g, " − ").replace(/\+/g, " + ").replace(/\//g, " : ")}</span>` };
  }
  function genTable() {
    const a = nz(-4, 5), b = rnd(-6, 6), x = rnd(-3, 4);
    const val = a * x * x + b;
    return { html: `Ergänze die Wertetabelle von <span class="math">${a}<i>x</i><sup>2</sup> ${b < 0 ? "−" : "+"} ${Math.abs(b)}</span> für <span class="math"><i>x</i> = ${String(x).replace("-", "−")}</span>.`.replace(/>-/g, ">−"),
      label: "Wert:", placeholder: "Zahl", answer: String(val).replace("-", "−"), check: LK.check.num(val, { abs: 1e-9 }),
      solution: `<span class="math">${a} · ${sgn(x)}<sup>2</sup> ${b < 0 ? "−" : "+"} ${Math.abs(b)} = ${a} · ${x * x} ${b < 0 ? "−" : "+"} ${Math.abs(b)} = <b>${String(val).replace("-", "−")}</b></span>`.replace(/\(-/g, "(−") };
  }
  LK.trainer({ el: "#trainer", modes: [
    { id: "art", label: "Termart bestimmen", gen: genType },
    { id: "wert", label: "Termwert berechnen", gen: genValue },
    { id: "tabelle", label: "Wertetabelle", gen: genTable },
    { id: "aufstellen", label: "Term aufstellen", gen: genBuild }
  ] });

  // ---------- quiz ----------
  LK.quiz({ box: "#quizBox", bar: "#qBar", progress: "#qProgress", key: "termstruktur.best", n: 10, questions: [
    { q: "Welche Termart ist 3 · (x + 4)?", o: ["Summe", "Produkt", "Potenz", "Quotient"], a: 1, e: "Zuletzt wird multipliziert." },
    { q: "Welche Termart ist 3x + 4?", o: ["Summe", "Produkt", "Differenz", "Potenz"], a: 0, e: "Erst 3 · x, zuletzt + 4." },
    { q: "Was ergibt 2 + 3 · 4?", o: ["20", "14", "24", "9"], a: 1, e: "Punkt vor Strich: 2 + 12." },
    { q: "Was ergibt (−3)²?", o: ["−9", "9", "−6", "6"], a: 1, e: "(−3) · (−3) = 9." },
    { q: "Was ergibt −3²?", o: ["9", "−9", "6", "−6"], a: 1, e: "Erst 3² = 9, dann das Minus: −9." },
    { q: "Welchen Wert hat 2x² für x = −3?", o: ["−18", "18", "36", "−36"], a: 1, e: "2 · (−3)² = 2 · 9 = 18." },
    { q: "Wonach richtet sich die Termart?", o: ["Nach der ersten Rechnung", "Nach der letzten Rechnung", "Nach der Anzahl der Variablen", "Nach dem größten Zahlenwert"], a: 1, e: "Die zuletzt ausgeführte Rechenoperation bestimmt die Termart." },
    { q: "Welche Reihenfolge ist richtig?", o: ["Punkt, Klammer, Potenz, Strich", "Klammer, Potenz, Punkt, Strich", "Strich, Punkt, Potenz, Klammer", "Potenz, Klammer, Strich, Punkt"], a: 1, e: "KlaPoPS." },
    { q: "Welcher Term passt zu „das Doppelte einer Zahl, vermehrt um 7“?", o: ["2(x + 7)", "2x + 7", "x² + 7", "7x + 2"], a: 1, e: "Erst verdoppeln, dann 7 addieren." },
    { q: "Wann sind zwei Terme gleichwertig?", o: ["Wenn sie für eine Zahl gleich sind", "Wenn sie für jede Einsetzung denselben Wert haben", "Wenn sie gleich lang sind", "Wenn sie dieselben Zahlen enthalten"], a: 1, e: "Ein einziges Gegenbeispiel genügt, um Gleichwertigkeit zu widerlegen." },
    { q: "Welche Termart ist (x − 1)²?", o: ["Differenz", "Potenz", "Produkt", "Summe"], a: 1, e: "Zuletzt wird quadriert." },
    { q: "Welchen Wert hat (12 − x) : 3 für x = 3?", o: ["11", "3", "9", "4"], a: 1, e: "(12 − 3) : 3 = 9 : 3 = 3." }
  ] });

  LK.views(["verstehen", "baum", "ueben", "alltag", "quiz"], { baum: drawTree });
})();
