(function () {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  function shuffle(a) { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; }
  const store = {
    get(k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* storage unavailable */ } }
  };

  // ---------- Hash routing ----------
  const VIEWS = ["formeln", "warum", "ueben", "tricks", "alltag", "quiz"];
  function showView() {
    const name = location.hash.replace("#", "");
    const v = VIEWS.includes(name) ? name : "formeln";
    VIEWS.forEach((n) => { $("#view-" + n).hidden = n !== v; });
    $$("nav.tabs a").forEach((a) => { if (a.dataset.view === v) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current"); });
    window.scrollTo({ top: 0 });
  }
  window.addEventListener("hashchange", showView);

  // =====================================================================
  // Expression parser with several variables (a, b, x, y, z, m, n).
  // Supports implicit multiplication, ^, ², ³, decimal comma, unicode minus.
  // =====================================================================
  const VARS = "abxyzmn";
  function parseExpr(src) {
    const s = src.toLowerCase().replace(/\s+/g, "").replace(/[−–]/g, "-").replace(/[·⋅×]/g, "*")
      .replace(/²/g, "^2").replace(/³/g, "^3").replace(/(\d),(\d)/g, "$1.$2");
    if (!s) throw new Error("leer");
    const toks = [];
    for (let i = 0; i < s.length;) {
      const ch = s[i];
      if (/[0-9.]/.test(ch)) { let j = i; while (j < s.length && /[0-9.]/.test(s[j])) j++; const n = parseFloat(s.slice(i, j)); if (isNaN(n)) throw new Error("Zahl"); toks.push({ t: "num", v: n }); i = j; continue; }
      if ("+-*/^()".includes(ch)) { toks.push({ t: ch }); i++; continue; }
      if (VARS.includes(ch)) { toks.push({ t: "var", v: ch }); i++; continue; }
      throw new Error("Unbekanntes Zeichen „" + ch + "“");
    }
    let p = 0;
    const peek = () => toks[p];
    const starts = (tk) => tk && (tk.t === "num" || tk.t === "var" || tk.t === "(");
    function expr() { let a = term(); while (peek() && (peek().t === "+" || peek().t === "-")) { const op = toks[p++].t, b = term(), l = a; a = op === "+" ? (e) => l(e) + b(e) : (e) => l(e) - b(e); } return a; }
    function term() {
      let a = unary();
      for (;;) {
        const tk = peek();
        if (tk && (tk.t === "*" || tk.t === "/")) { p++; const b = unary(), l = a; a = tk.t === "*" ? (e) => l(e) * b(e) : (e) => l(e) / b(e); }
        else if (starts(tk)) { const b = power(), l = a; a = (e) => l(e) * b(e); }
        else break;
      }
      return a;
    }
    function unary() { const tk = peek(); if (tk && tk.t === "-") { p++; const a = unary(); return (e) => -a(e); } if (tk && tk.t === "+") { p++; return unary(); } return power(); }
    function power() { const b = primary(); if (peek() && peek().t === "^") { p++; const ex = unary(); return (e) => Math.pow(b(e), ex(e)); } return b; }
    function primary() {
      const tk = toks[p++];
      if (!tk) throw new Error("Term unvollständig");
      if (tk.t === "num") { const v = tk.v; return () => v; }
      if (tk.t === "var") { const v = tk.v; return (e) => e[v]; }
      if (tk.t === "(") { const a = expr(); if (!peek() || peek().t !== ")") throw new Error("Klammer fehlt"); p++; return a; }
      throw new Error("Unerwartetes Zeichen");
    }
    const f = expr();
    if (p < toks.length) throw new Error("Unerwartetes Zeichen am Ende");
    return f;
  }
  const SAMPLES = [
    { a: 1.3, b: -0.7, x: 2.1, y: -1.4, z: 0.6, m: 1.7, n: -2.2 },
    { a: -2.4, b: 1.9, x: -0.8, y: 2.6, z: -1.1, m: 0.4, n: 3.1 },
    { a: 0.55, b: 2.35, x: 3.3, y: 0.45, z: 2.7, m: -1.3, n: 0.9 },
    { a: 4.1, b: -3.2, x: -2.9, y: -0.35, z: -3.4, m: 2.8, n: -0.6 }
  ];
  function same(f, g) {
    return SAMPLES.every((e) => { const u = f(e), v = g(e); return isFinite(u) && isFinite(v) && Math.abs(u - v) <= 1e-7 * Math.max(1, Math.abs(v)); });
  }

  // =====================================================================
  // 2 Area model
  // =====================================================================
  (function () {
    const svg = $("#areaSvg");
    function draw() {
      const a = +$("#aSl").value, b = +$("#bSl").value;
      $("#aOut").textContent = a; $("#bOut").textContent = b;
      const S = 380, u = S / (a + b), o = 40;     // the square always fills the drawing
      const A = a * u, B = b * u;
      const lab = (x, y, t, c, size = 18) => `<text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="middle" font-family="var(--font-math)" font-style="italic" font-size="${size}" fill="${c}">${t}</text>`;
      svg.innerHTML = `
        <rect x="${o}" y="${o}" width="${A}" height="${A}" fill="var(--a-soft)" stroke="var(--a)" stroke-width="2"></rect>
        <rect x="${o + A}" y="${o}" width="${B}" height="${A}" fill="var(--ab-soft)" stroke="var(--ab)" stroke-width="2"></rect>
        <rect x="${o}" y="${o + A}" width="${A}" height="${B}" fill="var(--ab-soft)" stroke="var(--ab)" stroke-width="2"></rect>
        <rect x="${o + A}" y="${o + A}" width="${B}" height="${B}" fill="var(--b-soft)" stroke="var(--b)" stroke-width="2"></rect>
        ${lab(o + A / 2, o - 16, "a", "var(--a)")}${lab(o + A + B / 2, o - 16, "b", "var(--b)")}
        ${lab(o - 16, o + A / 2, "a", "var(--a)")}${lab(o - 16, o + A + B / 2, "b", "var(--b)")}
        ${lab(o + A / 2, o + A / 2, "a²", "var(--a)", 26)}
        ${B > 40 ? lab(o + A + B / 2, o + A / 2, "ab", "var(--ab)", 20) : ""}
        ${B > 40 ? lab(o + A / 2, o + A + B / 2, "ab", "var(--ab)", 20) : ""}
        ${B > 40 ? lab(o + A + B / 2, o + A + B / 2, "b²", "var(--b)", 18) : ""}`;
      $("#areaRo").innerHTML = `
        <dt>(a + b)² = ${a + b}²</dt><dd>${(a + b) ** 2}</dd>
        <dt><span class="ca">a²</span> = ${a}²</dt><dd>${a * a}</dd>
        <dt><span class="cab">2ab</span> = 2·${a}·${b}</dt><dd>${2 * a * b}</dd>
        <dt><span class="cb">b²</span> = ${b}²</dt><dd>${b * b}</dd>
        <dt><strong>Summe</strong></dt><dd><strong>${a * a + 2 * a * b + b * b}</strong></dd>
        <dt class="muted">nur a² + b² (falsch)</dt><dd class="muted">${a * a + b * b}</dd>`;
    }
    $("#aSl").addEventListener("input", draw);
    $("#bSl").addEventListener("input", draw);
    draw();
  })();

  // =====================================================================
  // 3 Trainer
  // A monomial is {c, v} meaning c·v (v is "" or one variable letter).
  // =====================================================================
  const I = (v) => `<i>${v}</i>`;
  function monoHtml(c, vars) {
    // vars: object {letter: exponent}
    const keys = Object.keys(vars).filter((k) => vars[k] > 0).sort();
    const vs = keys.map((k) => I(k) + (vars[k] > 1 ? `<sup>${vars[k]}</sup>` : "")).join("");
    if (!vs) return String(c);
    return (c === 1 ? "" : String(c)) + vs;
  }
  function monoText(c, vars) { // plain text for solutions in inputs
    const keys = Object.keys(vars).filter((k) => vars[k] > 0).sort();
    const vs = keys.map((k) => k + (vars[k] > 1 ? "^" + vars[k] : "")).join("");
    return vs ? (c === 1 ? "" : String(c)) + vs : String(c);
  }
  (function () {
    let mode = "luecke", level = 1, task = null, score = { right: 0, total: 0 };
    function gen() {
      const t = pick([1, 2, 3]);
      const v1 = pick(["x", "a", "y"]);
      const c1 = level === 1 ? pick([1, 1, 1, 2, 3]) : pick([1, 2, 3, 4, 5]);
      let c2, v2 = "";
      if (level === 1) c2 = rnd(1, 9);
      else if (Math.random() < 0.5) c2 = rnd(2, 9);
      else { c2 = pick([1, 2, 3, 4]); v2 = { x: "y", a: "b", y: "x" }[v1]; }
      const pv = { [v1]: 1 }, qv = v2 ? { [v2]: 1 } : {};
      const sq = (c, vars) => ({ c: c * c, v: Object.fromEntries(Object.entries(vars).map(([k, e]) => [k, e * 2])) });
      const prodV = Object.assign({}, pv); if (v2) prodV[v2] = (prodV[v2] || 0) + 1;
      const P = { c: c1, v: pv }, Q = { c: c2, v: qv };
      const A = sq(c1, pv), B = { c: 2 * c1 * c2, v: prodV }, C = sq(c2, qv);
      const val = (m) => (e) => m.c * Object.entries(m.v).reduce((s, [k, ex]) => s * Math.pow(e[k], ex), 1);
      const pF = val(P), qF = val(Q);
      const target = t === 1 ? (e) => (pF(e) + qF(e)) ** 2 : t === 2 ? (e) => (pF(e) - qF(e)) ** 2 : (e) => pF(e) ** 2 - qF(e) ** 2;
      const h = (m) => monoHtml(m.c, m.v);
      const factHtml = t === 1 ? `(${h(P)} + ${h(Q)})<sup>2</sup>` : t === 2 ? `(${h(P)} − ${h(Q)})<sup>2</sup>` : `(${h(P)} + ${h(Q)})(${h(P)} − ${h(Q)})`;
      const parts = t === 3 ? [["A", A], ["−"], ["C", C]] : [["A", A], [t === 1 ? "+" : "−"], ["B", B], ["+"], ["C", C]];
      return { t, P, Q, A, B, C, val, target, factHtml, parts, h };
    }
    function expandedHtml(T, blank) {
      return T.parts.map(([k, m]) => (m ? (k === blank ? `<input type="text" id="gap" aria-label="Lücke" spellcheck="false">` : T.h(m)) : ` ${k} `)).join("");
    }
    function newTask() {
      task = gen(); task.attempted = false;
      const fb = $("#trFb"); fb.hidden = true;
      const T = task;
      $("#trInput").value = "";
      if (mode === "luecke") {
        const options = T.t === 3 ? ["A", "C"] : ["Q", "A", "B", "C", "B"];
        T.blank = pick(options);
        const fact = T.blank === "Q"
          ? (T.t === 1 ? `(${T.h(T.P)} + <input type="text" id="gap" aria-label="Lücke" spellcheck="false">)<sup>2</sup>` : T.t === 2 ? `(${T.h(T.P)} − <input type="text" id="gap" aria-label="Lücke" spellcheck="false">)<sup>2</sup>` : `(${T.h(T.P)} + <input type="text" id="gap" aria-label="Lücke" spellcheck="false">)(${T.h(T.P)} − ${T.h(T.Q)})`)
          : T.factHtml;
        $("#trTask").innerHTML = `${fact} = ${expandedHtml(T, T.blank === "Q" ? null : T.blank)}`;
        $("#trFree").hidden = true;
        $("#trInstr").textContent = "Fülle die Lücke aus. Gib nur den Teil ein, der fehlt (ohne Vorzeichen davor).";
      } else if (mode === "aus") {
        $("#trTask").innerHTML = `${T.factHtml} =`;
        $("#trFree").hidden = false;
        $("#trInput").placeholder = "z. B. x^2 + 6x + 9";
        $("#trInstr").textContent = "Löse die Klammer mit einer binomischen Formel auf. Schreibe das Ergebnis ohne Klammern.";
      } else {
        $("#trTask").innerHTML = `${expandedHtml(T, null)} =`;
        $("#trFree").hidden = false;
        $("#trInput").placeholder = "z. B. (x + 3)^2";
        $("#trInstr").textContent = "Schreibe den Term als Klammer, also rückwärts mit einer binomischen Formel.";
      }
    }
    function steps() {
      const T = task, h = T.h;
      const names = { 1: "1. binomische Formel", 2: "2. binomische Formel", 3: "3. binomische Formel" };
      const exp = T.parts.map(([k, m]) => (m ? h(m) : ` ${k} `)).join("");
      // brackets only where needed, e.g. (3x)² but x² and 9²
      const sqr = (m) => (m.c !== 1 && Object.keys(m.v).length ? `(${h(m)})` : h(m)) + "<sup>2</sup>";
      const lines = [`Das ist die <strong>${names[T.t]}</strong> mit <span class="math"><i class="ca">a</i> = ${h(T.P)}</span> und <span class="math"><i class="cb">b</i> = ${h(T.Q)}</span>.`,
        `<span class="math"><i class="ca">a</i><sup>2</sup> = ${sqr(T.P)} = ${h(T.A)}</span>`];
      if (T.t !== 3) lines.push(`<span class="math"><span class="cab">2<i>ab</i></span> = 2 · ${h(T.P)} · ${h(T.Q)} = ${h(T.B)}</span>`);
      lines.push(`<span class="math"><i class="cb">b</i><sup>2</sup> = ${sqr(T.Q)} = ${h(T.C)}</span>`);
      return `<ol>${lines.map((l) => `<li>${l}</li>`).join("")}</ol><span>Ergebnis: <span class="math">${T.factHtml} = ${exp}</span></span>`;
    }
    function updateScore() { $("#trScore").textContent = `${score.right} von ${score.total} Aufgaben auf Anhieb richtig`; }
    $("#trForm").addEventListener("submit", (ev) => {
      ev.preventDefault();
      const T = task, fb = $("#trFb");
      fb.hidden = false;
      const raw = mode === "luecke" ? ($("#gap") ? $("#gap").value : "") : $("#trInput").value;
      let g;
      try { g = parseExpr(raw); } catch (e) { fb.innerHTML = `<span><b class="no">Das kann ich nicht lesen.</b> Prüfe deine Eingabe. Beispiel: <code>6x</code> oder <code>x^2 + 6x + 9</code></span>`; return; }
      let ok = false, hint = "";
      if (mode === "luecke") {
        const m = T.blank === "Q" ? T.Q : T[T.blank];
        ok = same(g, T.val(m));
        if (!ok) {
          if (T.blank === "B" && same(g, T.val({ c: m.c / 2, v: m.v }))) hint = "Fast! Beim Mittelglied fehlt der Faktor 2: Es heißt 2 · a · b.";
          else if (same(g, (e) => -T.val(m)(e))) hint = "Das Vorzeichen steht schon vor der Lücke. Gib den Teil ohne Minus ein.";
          else if ((T.blank === "A" || T.blank === "C") && Object.keys(m.v).length && same(g, T.val({ c: Math.sqrt(m.c), v: m.v }))) hint = "Denk daran, auch die Zahl zu quadrieren, zum Beispiel (3x)² = 9x².";
          else hint = "Schau dir das Merkschema an: a², 2ab, b².";
        }
      } else if (mode === "aus") {
        const hasParen = /[()]/.test(raw);
        ok = same(g, T.target) && !hasParen;
        if (!ok) {
          if (same(g, T.target)) hint = "Das stimmt zwar, aber du sollst die Klammer auflösen. Schreibe das Ergebnis ohne Klammern.";
          else if (T.t !== 3 && same(g, (e) => T.val(T.A)(e) + T.val(T.C)(e))) hint = "Das Mittelglied 2ab fehlt! Das ist der häufigste Fehler.";
          else if (T.t === 2 && same(g, (e) => T.val(T.A)(e) - T.val(T.B)(e) - T.val(T.C)(e))) hint = "Am Ende muss + b² stehen, denn Minus mal Minus ergibt Plus.";
          else hint = "Erkenne zuerst, welche Formel passt, und bestimme dann a und b.";
        }
      } else {
        const looksFactored = /\)\s*(\^|²|\()/.test(raw.replace(/\s+/g, ""));
        ok = same(g, T.target) && looksFactored;
        if (!ok) hint = same(g, T.target) ? "Der Wert stimmt, aber schreibe den Term als Klammer, z. B. (x + 3)^2 oder (x + 4)(x − 4)." : "Suche zuerst a² und b², dann prüfe mit dem Mittelglied 2ab, welche Formel passt.";
      }
      if (!T.attempted) { T.attempted = true; score.total++; if (ok) score.right++; updateScore(); }
      fb.innerHTML = ok ? `<span><b class="ok">Richtig!</b></span>${steps()}` : `<span><b class="no">Noch nicht richtig.</b> ${hint}</span>`;
    });
    $("#trShow").addEventListener("click", () => {
      if (!task.attempted) { task.attempted = true; score.total++; updateScore(); }
      const fb = $("#trFb"); fb.hidden = false; fb.innerHTML = steps();
    });
    $("#trNext").addEventListener("click", newTask);
    $$("[data-mode]").forEach((b) => b.addEventListener("click", () => { mode = b.dataset.mode; $$("[data-mode]").forEach((x) => x.setAttribute("aria-pressed", String(x === b))); newTask(); }));
    $$("[data-level]").forEach((b) => b.addEventListener("click", () => { level = +b.dataset.level; $$("[data-level]").forEach((x) => x.setAttribute("aria-pressed", String(x === b))); newTask(); }));
    newTask();
    window.__binom = { parseExpr, same };
  })();

  // =====================================================================
  // 4 Mental arithmetic tricks
  // =====================================================================
  (function () {
    let task = null, score = { right: 0, total: 0 };
    function newTask() {
      const kind = pick(["plus", "minus", "third"]);
      const base = rnd(2, 9) * 10, d = kind === "third" ? rnd(1, 5) : rnd(1, 3);
      if (kind === "plus") task = { html: `${base + d}<sup>2</sup>`, ans: (base + d) ** 2, sol: `(${base} + ${d})<sup>2</sup> = ${base * base} + ${2 * base * d} + ${d * d} = ${(base + d) ** 2}` };
      else if (kind === "minus") task = { html: `${base - d}<sup>2</sup>`, ans: (base - d) ** 2, sol: `(${base} − ${d})<sup>2</sup> = ${base * base} − ${2 * base * d} + ${d * d} = ${(base - d) ** 2}` };
      else task = { html: `${base + d} · ${base - d}`, ans: base * base - d * d, sol: `(${base} + ${d})(${base} − ${d}) = ${base * base} − ${d * d} = ${base * base - d * d}` };
      task.attempted = false;
      $("#kTask").innerHTML = task.html; $("#kInput").value = ""; $("#kFb").hidden = true;
    }
    $("#kForm").addEventListener("submit", (ev) => {
      ev.preventDefault();
      const v = parseInt($("#kInput").value.replace(/[.\s]/g, ""), 10);
      const fb = $("#kFb"); fb.hidden = false;
      if (isNaN(v)) { fb.innerHTML = "<span>Bitte gib eine Zahl ein.</span>"; return; }
      const ok = v === task.ans;
      if (!task.attempted) { task.attempted = true; score.total++; if (ok) score.right++; $("#kScore").textContent = `${score.right} von ${score.total} richtig`; }
      fb.innerHTML = (ok ? '<span><b class="ok">Richtig!</b></span>' : '<span><b class="no">Noch nicht.</b> Zerlege die Zahl in eine Zehnerzahl und einen kleinen Rest.</span>') + (ok ? `<span class="math">${task.sol}</span>` : "");
    });
    $("#kShow").addEventListener("click", () => { if (!task.attempted) { task.attempted = true; score.total++; $("#kScore").textContent = `${score.right} von ${score.total} richtig`; } const fb = $("#kFb"); fb.hidden = false; fb.innerHTML = `<span class="math">${task.sol}</span>`; });
    $("#kNext").addEventListener("click", newTask);
    newTask();
  })();

  // =====================================================================
  // 5 Quiz
  // =====================================================================
  const QUESTIONS = [
    { q: "(x + 3)² = ?", o: ["x² + 9", "x² + 6x + 9", "x² + 3x + 9", "2x + 6"], a: 1, e: "1. Formel: a² + 2ab + b² = x² + 2·x·3 + 9 = x² + 6x + 9." },
    { q: "(x − 4)² = ?", o: ["x² − 16", "x² − 8x − 16", "x² − 8x + 16", "x² + 16"], a: 2, e: "2. Formel: a² − 2ab + b². Am Ende steht immer + b², hier + 16." },
    { q: "(x + 5)(x − 5) = ?", o: ["x² − 25", "x² + 25", "x² − 10x + 25", "x² − 10"], a: 0, e: "3. Formel: a² − b². Die Mittelglieder +5x und −5x heben sich auf." },
    { q: "(3x)² = ?", o: ["3x²", "9x", "9x²", "6x²"], a: 2, e: "Die Zahl wird mitquadriert: 3² · x² = 9x²." },
    { q: "Welcher Fehler ist der häufigste bei (a + b)²?", o: ["Man vergisst b²", "Man vergisst das Mittelglied 2ab", "Man schreibt a³", "Man vergisst die Klammer"], a: 1, e: "(a + b)² ist NICHT a² + b². Das Mittelglied 2ab gehört dazu, wie die grünen Rechtecke im Flächenbild." },
    { q: "(2x + 1)² = ?", o: ["4x² + 4x + 1", "2x² + 4x + 1", "4x² + 2x + 1", "4x² + 1"], a: 0, e: "a = 2x, b = 1: (2x)² = 4x², 2·2x·1 = 4x, 1² = 1." },
    { q: "Welche binomische Formel passt zu x² − 10x + 25?", o: ["(x + 5)²", "(x − 5)²", "(x + 5)(x − 5)", "(x − 25)²"], a: 1, e: "Minus vor dem Mittelglied, Plus am Ende: Das ist die 2. Formel mit a = x und b = 5." },
    { q: "x² − 49 als Produkt geschrieben:", o: ["(x − 7)²", "(x + 7)²", "(x + 7)(x − 7)", "(x − 49)(x + 1)"], a: 2, e: "a² − b² = (a + b)(a − b) mit b = 7." },
    { q: "Was ist das Mittelglied von (x + 6)²?", o: ["6x", "12x", "36", "x²"], a: 1, e: "Mittelglied = 2 · a · b = 2 · x · 6 = 12x." },
    { q: "Wie rechnest du 31² am schnellsten im Kopf?", o: ["(30 + 1)² = 900 + 60 + 1 = 961", "30² + 1² = 901", "31 · 30 = 930", "(30 + 1)² = 900 + 1 = 901"], a: 0, e: "1. Formel mit a = 30 und b = 1. Das Mittelglied 2 · 30 · 1 = 60 nicht vergessen." },
    { q: "48 · 52 = ?", o: ["2496", "2500", "2504", "2400"], a: 0, e: "(50 − 2)(50 + 2) = 2500 − 4 = 2496 (3. Formel)." },
    { q: "(a − b)² und (b − a)² sind …", o: ["gleich", "verschieden", "nur gleich, wenn a = 0 ist", "immer negativ"], a: 0, e: "Ein Quadrat ist nie negativ, und (a − b) und (b − a) unterscheiden sich nur im Vorzeichen. Beide ergeben a² − 2ab + b²." },
    { q: "Was ist ein Binom?", o: ["Eine Zahl mit zwei Stellen", "Ein Term aus zwei Teilen, die mit + oder − verbunden sind, z. B. (x + 3)", "Ein Quadrat", "Eine Gleichung"], a: 1, e: "„Bi“ heißt zwei: ein Term aus zwei Gliedern." },
    { q: "(x + y)² = ?", o: ["x² + y²", "x² + xy + y²", "x² + 2xy + y²", "2x + 2y"], a: 2, e: "Auch mit zwei Variablen: a² + 2ab + b² = x² + 2xy + y²." }
  ];
  (function () {
    const N = 10;
    let order = [], idx = 0, score = 0, answered = false;
    function start() {
      order = shuffle(QUESTIONS).slice(0, N).map((q) => { const perm = shuffle(q.o.map((_, i) => i)); return { q: q.q, o: perm.map((i) => q.o[i]), a: perm.indexOf(q.a), e: q.e }; });
      idx = 0; score = 0; render();
    }
    function render() {
      const box = $("#quizBox");
      $("#qBar").style.width = (idx / N) * 100 + "%";
      if (idx >= N) {
        const best = Math.max(score, store.get("binom.best") || 0); store.set("binom.best", best);
        const msg = score >= 9 ? "Super! Du beherrschst die binomischen Formeln." : score >= 6 ? "Gut gemacht! Übe noch ein paar Aufgaben im Trainer." : "Schau dir die Formeln und das Flächenbild noch einmal an und versuche es dann erneut.";
        $("#qProgress").textContent = `fertig · Bestwert ${best} / ${N}`;
        box.innerHTML = `<span class="eyebrow">Ergebnis</span><div class="score-big">${score} / ${N}</div><p>${msg}</p><div class="row"><button type="button" class="primary" id="qAgain">Neue Runde</button></div>`;
        $("#qAgain").addEventListener("click", start);
        return;
      }
      const q = order[idx]; answered = false;
      $("#qProgress").textContent = `Frage ${idx + 1} von ${N} · ${score} richtig`;
      box.innerHTML = `<div class="qtext math"></div><div class="opts"></div><div class="feedback" hidden></div><div class="row"><button type="button" class="primary" id="qNext" hidden>${idx + 1 < N ? "Nächste Frage" : "Ergebnis anzeigen"}</button></div>`;
      $(".qtext", box).textContent = q.q;
      q.o.forEach((t, i) => {
        const b = document.createElement("button"); b.type = "button";
        b.innerHTML = `<span class="k">${"ABCD"[i]}</span><span class="math"></span>`; b.lastChild.textContent = t;
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
