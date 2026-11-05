(function () {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  const gcd = (a, b) => (b === 0 ? Math.abs(a) : gcd(b, a % b));
  function shuffle(a) { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; }
  const store = {
    get(k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* storage unavailable */ } }
  };
  const X = "<i>x</i>";
  const fr = (n, d) => `<span class="frac"><span>${n}</span><span>${d}</span></span>`;
  const neg = (s) => String(s).replace(/-/g, "−");
  // "x + c" / "x − c" with sign handling
  const lin = (c) => (c >= 0 ? `${X} + ${c}` : `${X} − ${-c}`);
  const linT = (c) => (c >= 0 ? `x+${c}` : `x-${-c}`);
  // coefficient times x^e as HTML (e = 0..3)
  function mono(c, e) {
    const xs = e === 0 ? "" : e === 1 ? X : `${X}<sup>${e}</sup>`;
    if (!xs) return neg(c);
    return (c === 1 ? "" : c === -1 ? "−" : neg(c)) + xs;
  }

  // ---------- Hash routing ----------
  const VIEWS = ["grundlagen", "kuerzen", "rechnen", "ueben", "quiz"];
  function showView() {
    const name = location.hash.replace("#", "");
    const v = VIEWS.includes(name) ? name : "grundlagen";
    VIEWS.forEach((n) => { $("#view-" + n).hidden = n !== v; });
    $$("nav.tabs a").forEach((a) => { if (a.dataset.view === v) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current"); });
    window.scrollTo({ top: 0 });
  }
  window.addEventListener("hashchange", showView);

  // =====================================================================
  // Expression parser (variable x, implicit multiplication, ^, ², :)
  // =====================================================================
  function parseExpr(src) {
    const s = src.toLowerCase().replace(/\s+/g, "").replace(/[−–]/g, "-").replace(/[·⋅×]/g, "*").replace(/[:÷]/g, "/")
      .replace(/²/g, "^2").replace(/³/g, "^3").replace(/(\d),(\d)/g, "$1.$2");
    if (!s) throw new Error("leer");
    const toks = [];
    for (let i = 0; i < s.length;) {
      const ch = s[i];
      if (/[0-9.]/.test(ch)) { let j = i; while (j < s.length && /[0-9.]/.test(s[j])) j++; const n = parseFloat(s.slice(i, j)); if (isNaN(n)) throw new Error("Zahl"); toks.push({ t: "num", v: n }); i = j; continue; }
      if ("+-*/^()".includes(ch)) { toks.push({ t: ch }); i++; continue; }
      if (ch === "x") { toks.push({ t: "x" }); i++; continue; }
      throw new Error("Unbekanntes Zeichen „" + ch + "“");
    }
    let p = 0;
    const peek = () => toks[p];
    const starts = (tk) => tk && (tk.t === "num" || tk.t === "x" || tk.t === "(");
    function expr() { let a = term(); while (peek() && (peek().t === "+" || peek().t === "-")) { const op = toks[p++].t, b = term(), l = a; a = op === "+" ? (x) => l(x) + b(x) : (x) => l(x) - b(x); } return a; }
    function term() {
      let a = unary();
      for (;;) {
        const tk = peek();
        if (tk && (tk.t === "*" || tk.t === "/")) { p++; const b = unary(), l = a; a = tk.t === "*" ? (x) => l(x) * b(x) : (x) => l(x) / b(x); }
        else if (starts(tk)) { const b = power(), l = a; a = (x) => l(x) * b(x); }
        else break;
      }
      return a;
    }
    function unary() { const tk = peek(); if (tk && tk.t === "-") { p++; const a = unary(); return (x) => -a(x); } if (tk && tk.t === "+") { p++; return unary(); } return power(); }
    function power() { const b = primary(); if (peek() && peek().t === "^") { p++; const e = unary(); return (x) => Math.pow(b(x), e(x)); } return b; }
    function primary() {
      const tk = toks[p++];
      if (!tk) throw new Error("Term unvollständig");
      if (tk.t === "num") { const v = tk.v; return () => v; }
      if (tk.t === "x") return (x) => x;
      if (tk.t === "(") { const a = expr(); if (!peek() || peek().t !== ")") throw new Error("Klammer fehlt"); p++; return a; }
      throw new Error("Unerwartetes Zeichen");
    }
    const f = expr();
    if (p < toks.length) throw new Error("Unerwartetes Zeichen am Ende");
    return f;
  }
  const XS = [0.37, 1.73, -2.41, 3.19, -0.83, 5.27];
  const same = (f, g) => XS.every((x) => { const a = f(x), b = g(x); return isFinite(a) && isFinite(b) && Math.abs(a - b) <= 1e-7 * Math.max(1, Math.abs(b)); });
  const tokenCount = (s) => (s.replace(/\s+/g, "").match(/\d+(?:[.,]\d+)?|x|[()+\-*/^:²]/g) || []).length;

  // =====================================================================
  // 1 Value table
  // =====================================================================
  (function () {
    const TERMS = [
      { html: fr("5", `${X} − 2`), f: (x) => 5 / (x - 2), d: "D = ℚ \\ {2}" },
      { html: fr(`${X} + 1`, `${X}`), f: (x) => (x + 1) / x, d: "D = ℚ \\ {0}" },
      { html: fr("6", `${X} + 3`), f: (x) => 6 / (x + 3), d: "D = ℚ \\ {−3}" },
      { html: fr("1", `${X}(${X} − 1)`), f: (x) => 1 / (x * (x - 1)), d: "D = ℚ \\ {0; 1}" },
      { html: fr(`${X}`, `${X}<sup>2</sup> − 4`), f: (x) => x / (x * x - 4), d: "D = ℚ \\ {−2; 2}" },
      { html: fr("8", `2${X} + 6`), f: (x) => 8 / (2 * x + 6), d: "D = ℚ \\ {−3}" },
      { html: fr(`${X}`, `${X}<sup>2</sup> + 1`), f: (x) => x / (x * x + 1), d: "D = ℚ (der Nenner ist nie 0, denn x² + 1 ist immer mindestens 1)" }
    ];
    const sel = $("#vtSel");
    TERMS.forEach((t, i) => { const o = document.createElement("option"); o.value = i; o.textContent = ["5/(x−2)", "(x+1)/x", "6/(x+3)", "1/(x(x−1))", "x/(x²−4)", "8/(2x+6)", "x/(x²+1)"][i]; sel.appendChild(o); });
    function fmt(v) { const r = Math.round(v * 100) / 100 || 0; /* avoid "-0" */ return neg(r.toLocaleString("de-DE", { maximumFractionDigits: 2 })); }
    function render() {
      const T = TERMS[+sel.value];
      $("#vtTerm").innerHTML = `<span class="math">${T.html}</span>`;
      const xs = [-4, -3, -2, -1, 0, 1, 2, 3, 4];
      $("#vtTable").innerHTML = `<tr><th><i>x</i></th>${xs.map((x) => `<th>${neg(x)}</th>`).join("")}</tr>
        <tr><th>Wert</th>${xs.map((x) => { const v = T.f(x); return isFinite(v) ? `<td>${fmt(v)}</td>` : `<td class="undef" title="Division durch 0">n. d.</td>`; }).join("")}</tr>`;
      $("#vtD").innerHTML = `<strong>${T.d}</strong> · „n. d.“ heißt „nicht definiert“: Dort würde man durch 0 teilen.`;
    }
    sel.addEventListener("change", render);
    render();
  })();

  // =====================================================================
  // 4 Trainer
  // =====================================================================
  (function () {
    let mode = "def", task = null, score = { right: 0, total: 0 };

    // ----- Definitionsmenge -----
    function genDef() {
      const a = rnd(1, 9) * pick([1, -1]);
      const k = rnd(2, 9);
      const kinds = [
        () => ({ html: fr(k, lin(-a)), ex: [a], step: `Nenner = 0: ${lin(-a)} = 0 &nbsp;→&nbsp; ${X} = ${neg(a)}` }),
        () => { const c = pick([2, 3, 4, 5]), b = rnd(1, 5) * pick([1, -1]); const d = c * b; return { html: fr(k, `${c}${X} ${d >= 0 ? "+" : "−"} ${Math.abs(d)}`), ex: [-b], step: `Nenner = 0: ${c}${X} ${d >= 0 ? "+" : "−"} ${Math.abs(d)} = 0 &nbsp;→&nbsp; ${c}${X} = ${neg(-d)} &nbsp;→&nbsp; ${X} = ${neg(-b)}` }; },
        () => ({ html: fr(`${X} + ${k}`, `${X}(${lin(-a)})`), ex: [0, a], step: `Ein Produkt ist 0, wenn ein Faktor 0 ist: ${X} = 0 oder ${lin(-a)} = 0, also ${X} = ${neg(a)}` }),
        () => { const b = rnd(1, 9); return { html: fr(k, `${X}<sup>2</sup> − ${b * b}`), ex: [b, -b], step: `3. binomische Formel: ${X}<sup>2</sup> − ${b * b} = (${X} + ${b})(${X} − ${b}). Null für ${X} = −${b} oder ${X} = ${b}` }; },
        () => ({ html: `${fr(k, X)} + ${fr(1, lin(-a))}`, ex: [0, a], step: `Beide Nenner prüfen: ${X} = 0 und ${lin(-a)} = 0 &nbsp;→&nbsp; ${X} = ${neg(a)}` })
      ];
      const t = pick(kinds)();
      t.ex = Array.from(new Set(t.ex)).sort((p, q) => p - q);
      return t;
    }
    // ----- Kürzen -----
    function genKuerzen() {
      const kinds = [
        () => { // monomials
          const g = pick([2, 3, 4, 5, 6]); let p = rnd(1, 5), q = rnd(1, 5); while (gcd(p, q) !== 1 || (p === 1 && q === 1)) { p = rnd(1, 5); q = rnd(1, 5); }
          const m = rnd(1, 3), n = rnd(1, 3);
          const e = m - n;
          const numH = e > 0 ? mono(p, e) : String(p), denH = e < 0 ? mono(q, -e) : String(q);
          const res = denH === "1" ? numH : fr(numH, denH);
          const resT = (e > 0 ? `${p}x^${e}` : `${p}`) + (q !== 1 || e < 0 ? `/(${e < 0 ? `${q}x^${-e}` : q})` : "");
          return { html: fr(mono(g * p, m), mono(g * q, n)), f: (x) => (p * x ** e) / q, ref: resT, res,
            step: `Gemeinsame Faktoren: ${g} und ${X}${Math.min(m, n) > 1 ? `<sup>${Math.min(m, n)}</sup>` : ""}. Kürze sie weg.` };
        },
        () => { // factor out a number
          const k = pick([2, 3, 4, 5]), c = rnd(1, 9) * pick([1, -1]);
          return { html: fr(`${k}${X} ${c >= 0 ? "+" : "−"} ${k * Math.abs(c)}`, k), f: (x) => x + c, ref: linT(c), res: lin(c),
            step: `Ausklammern: ${k}${X} ${c >= 0 ? "+" : "−"} ${k * Math.abs(c)} = ${k}·(${lin(c)}). Jetzt ist ${k} ein Faktor und kann gekürzt werden.` };
        },
        () => { // 3rd binomial formula
          const b = rnd(1, 9), s = pick([1, -1]);
          return { html: fr(`${X}<sup>2</sup> − ${b * b}`, lin(s * b)), f: (x) => x - s * b, ref: linT(-s * b), res: lin(-s * b),
            step: `3. binomische Formel: ${X}<sup>2</sup> − ${b * b} = (${X} + ${b})(${X} − ${b}). Kürze die Klammer (${lin(s * b)}).` };
        },
        () => { // 1st/2nd binomial formula
          const b = rnd(1, 6) * pick([1, -1]);
          return { html: fr(`${X}<sup>2</sup> ${b > 0 ? "+" : "−"} ${2 * Math.abs(b)}${X} + ${b * b}`, lin(b)), f: (x) => x + b, ref: linT(b), res: lin(b),
            step: `${b > 0 ? "1." : "2."} binomische Formel: ${X}<sup>2</sup> ${b > 0 ? "+" : "−"} ${2 * Math.abs(b)}${X} + ${b * b} = (${lin(b)})<sup>2</sup>. Eine Klammer (${lin(b)}) kürzt sich weg.` };
        },
        () => { // factor out x
          const k = rnd(2, 9), c = rnd(1, 9) * pick([1, -1]);
          return { html: fr(`${k}${X}<sup>2</sup> ${c >= 0 ? "+" : "−"} ${Math.abs(c)}${X}`, `${X}`), f: (x) => k * x + c, ref: `${k}x${c >= 0 ? "+" : "-"}${Math.abs(c)}`, res: `${k}${X} ${c >= 0 ? "+" : "−"} ${Math.abs(c)}`,
            step: `${X} ausklammern: ${X}·(${k}${X} ${c >= 0 ? "+" : "−"} ${Math.abs(c)}). Dann ${X} kürzen.` };
        }
      ];
      return pick(kinds)();
    }
    // ----- Rechnen -----
    function genRechnen() {
      const kinds = [
        () => { // same denominator, add/sub
          const a = rnd(1, 9), b = rnd(1, 9), c = rnd(1, 6) * pick([1, -1]), plus = Math.random() < 0.6;
          const r = plus ? a + b : a - b;
          return { html: `${fr(a, lin(c))} ${plus ? "+" : "−"} ${fr(b, lin(c))}`, f: (x) => r / (x + c), ref: `${r}/(${linT(c)})`, res: fr(neg(r), lin(c)),
            steps: [`Gleicher Nenner: Zähler ${plus ? "addieren" : "subtrahieren"}, Nenner bleibt.`, `${a} ${plus ? "+" : "−"} ${b} = ${neg(r)}`] };
        },
        () => { // a/x + b/(kx)
          const a = rnd(1, 9), b = rnd(1, 9), k = rnd(2, 5);
          return { html: `${fr(a, X)} + ${fr(b, `${k}${X}`)}`, f: (x) => (a * k + b) / (k * x), ref: `${a * k + b}/(${k}x)`, res: fr(a * k + b, `${k}${X}`),
            steps: [`Hauptnenner: ${k}${X}`, `Ersten Bruch mit ${k} erweitern: ${fr(a, X)} = ${fr(a * k, `${k}${X}`)}`, `Zähler addieren: ${a * k} + ${b} = ${a * k + b}`] };
        },
        () => { // a/x − b/x²
          const a = rnd(2, 9), b = rnd(1, 9);
          return { html: `${fr(a, X)} − ${fr(b, `${X}<sup>2</sup>`)}`, f: (x) => (a * x - b) / (x * x), ref: `(${a}x-${b})/x^2`, res: fr(`${a}${X} − ${b}`, `${X}<sup>2</sup>`),
            steps: [`Hauptnenner: ${X}<sup>2</sup>`, `Ersten Bruch mit ${X} erweitern: ${fr(a, X)} = ${fr(`${a}${X}`, `${X}<sup>2</sup>`)}`, `Zähler subtrahieren: ${a}${X} − ${b}`] };
        },
        () => { // multiply monomials
          const p = rnd(1, 6), q = rnd(2, 6), r = rnd(2, 9), s = rnd(2, 6);
          const n = p * r, d = q * s, g = gcd(n, d), N = n / g, D = d / g;
          return { html: `${fr(mono(p, 1), q)} · ${fr(r, mono(s, 2))}`, f: (x) => N / (D * x), ref: `${N}/(${D}x)`, res: fr(N, mono(D, 1)),
            steps: [`Zähler mal Zähler, Nenner mal Nenner: ${fr(`${mono(p, 1)} · ${r}`, `${q} · ${mono(s, 2)}`)} = ${fr(mono(n, 1), mono(d, 2))}`, `Kürzen durch ${g > 1 ? g + " und " : ""}${X}: ${fr(N, mono(D, 1))}`] };
        },
        () => { // divide
          const p = rnd(1, 9), q = rnd(1, 5), r = rnd(1, 9), s = rnd(1, 5);
          // (p/(q x)) : (r/(s x^2)) = p s x / (q r)
          const n = p * s, d = q * r, g = gcd(n, d), N = n / g, D = d / g;
          const res = D === 1 ? mono(N, 1) : fr(mono(N, 1), D);
          return { html: `${fr(p, mono(q, 1))} : ${fr(r, mono(s, 2))}`, f: (x) => (N * x) / D, ref: D === 1 ? `${N}x` : `${N}x/${D}`, res,
            steps: [`Mit dem Kehrwert malnehmen: ${fr(p, mono(q, 1))} · ${fr(mono(s, 2), r)}`, `= ${fr(mono(p * s, 2), mono(q * r, 1))}`, `Kürzen: ${res}`] };
        },
        () => { // 1/x + 1/(x+c)
          const c = rnd(1, 6) * pick([1, -1]);
          return { html: `${fr(1, X)} + ${fr(1, lin(c))}`, f: (x) => (2 * x + c) / (x * (x + c)), ref: `(2x${c >= 0 ? "+" : "-"}${Math.abs(c)})/(x(${linT(c)}))`, res: fr(`2${X} ${c >= 0 ? "+" : "−"} ${Math.abs(c)}`, `${X}(${lin(c)})`),
            steps: [`Die Nenner haben nichts gemeinsam. Hauptnenner: ${X}(${lin(c)})`, `Erweitern: ${fr(lin(c), `${X}(${lin(c)})`)} + ${fr(X, `${X}(${lin(c)})`)}`, `Zähler addieren: ${lin(c)} + ${X} = 2${X} ${c >= 0 ? "+" : "−"} ${Math.abs(c)}`] };
        }
      ];
      return pick(kinds)();
    }

    const TEXT = {
      def: { instr: "Welche Zahlen darf man für x nicht einsetzen? Gib sie durch Komma oder Semikolon getrennt ein. Wenn keine Zahl verboten ist, schreibe „keine“.", label: "verboten:", ph: "z. B. 2 oder -3; 3", hint: "Beispiel: <code>-3; 3</code> oder <code>0, 2</code>" },
      kuerzen: { instr: "Kürze so weit wie möglich. Du darfst das Ergebnis als Bruch schreiben, z. B. 2x/3.", label: "=", ph: "z. B. 2x/3 oder x - 3", hint: "Schreibweise: <code>2x/3</code>, <code>x^2</code>, <code>(x+1)/(x-2)</code>, <code>1/(2x)</code>" },
      rechnen: { instr: "Berechne und fasse zu einem einzigen Bruch zusammen. Kürze, wenn möglich.", label: "=", ph: "z. B. 7/(2x)", hint: "Schreibweise: <code>7/(2x)</code>, <code>(3x-2)/x^2</code>, <code>(2x+1)/(x(x+1))</code>. Nenner in Klammern setzen!" }
    };
    function newTask() {
      task = mode === "def" ? genDef() : mode === "kuerzen" ? genKuerzen() : genRechnen();
      task.attempted = false;
      const t = TEXT[mode];
      $("#trInstr").textContent = t.instr; $("#trLabel").textContent = t.label; $("#trInput").placeholder = t.ph; $("#trHint").innerHTML = t.hint;
      $("#trTask").innerHTML = task.html + (mode === "def" ? "" : " =");
      $("#trInput").value = ""; $("#trFb").hidden = true;
    }
    function solution() {
      if (mode === "def") {
        const set = task.ex.map(neg).join("; ");
        return `<ol><li><span class="math">${task.step}</span></li></ol><span>Ergebnis: <span class="math">D = ℚ \\ {${set}}</span></span>`;
      }
      if (mode === "kuerzen") return `<ol><li><span class="math">${task.step}</span></li></ol><span>Ergebnis: <span class="math">${task.html} = ${task.res}</span></span>`;
      return `<ol>${task.steps.map((s) => `<li><span class="math">${s}</span></li>`).join("")}</ol><span>Ergebnis: <span class="math">${task.html} = ${task.res}</span></span>`;
    }
    function updateScore() { $("#trScore").textContent = `${score.right} von ${score.total} Aufgaben auf Anhieb richtig`; }
    $("#trForm").addEventListener("submit", (ev) => {
      ev.preventDefault();
      const raw = $("#trInput").value.trim(), fb = $("#trFb");
      fb.hidden = false;
      let ok = false, hint = "";
      if (mode === "def") {
        let nums;
        if (/^(keine|keins|-|leer|∅)$/i.test(raw)) nums = [];
        else nums = raw.replace(/[−–]/g, "-").split(/[;,\s]+/).filter(Boolean).map(Number);
        if (nums.some(isNaN)) { fb.innerHTML = "<span>Bitte gib nur Zahlen ein, getrennt durch Komma oder Semikolon.</span>"; return; }
        const got = Array.from(new Set(nums)).sort((p, q) => p - q);
        ok = got.length === task.ex.length && got.every((v, i) => v === task.ex[i]);
        if (!ok) {
          if (got.length < task.ex.length && got.every((v) => task.ex.includes(v))) hint = "Da fehlt noch eine Zahl. Prüfe jeden Faktor im Nenner.";
          else if (got.some((v) => task.ex.includes(-v) && !task.ex.includes(v))) hint = "Achte auf das Vorzeichen: x − 3 = 0 ergibt x = 3, x + 3 = 0 ergibt x = −3.";
          else hint = "Setze den Nenner gleich 0 und löse nach x auf.";
        }
      } else {
        let g;
        try { g = parseExpr(raw); } catch (e) { fb.innerHTML = `<span><b class="no">Das kann ich nicht lesen.</b> Prüfe deine Eingabe. Nenner mit mehreren Teilen in Klammern setzen, z. B. <code>3/(x+2)</code>.</span>`; return; }
        const eq = same(g, task.f);
        const short = tokenCount(raw) <= tokenCount(task.ref) + 3;
        const oneFrac = (raw.match(/[/:]/g) || []).length <= 1;
        ok = eq && short && (mode !== "rechnen" || oneFrac);
        if (!ok) {
          if (eq && mode === "rechnen" && !oneFrac) hint = "Der Wert stimmt, aber fasse alles zu einem einzigen Bruch zusammen.";
          else if (eq) hint = "Der Wert stimmt, aber du kannst noch weiter kürzen.";
          else if (mode === "kuerzen") hint = "Zerlege Zähler und Nenner zuerst in Faktoren (ausklammern oder binomische Formel). Kürzen darfst du nur Faktoren.";
          else hint = "Prüfe Hauptnenner und Erweiterung. Hast du beim Teilen den Kehrwert genommen? Nenner mit mehreren Teilen in Klammern setzen.";
        }
      }
      if (!task.attempted) { task.attempted = true; score.total++; if (ok) score.right++; updateScore(); }
      fb.innerHTML = ok ? `<span><b class="ok">Richtig!</b></span>${solution()}` : `<span><b class="no">Noch nicht richtig.</b> ${hint}</span>`;
    });
    $("#trShow").addEventListener("click", () => {
      if (!task.attempted) { task.attempted = true; score.total++; updateScore(); }
      const fb = $("#trFb"); fb.hidden = false; fb.innerHTML = solution();
    });
    $("#trNext").addEventListener("click", newTask);
    $$("[data-mode]").forEach((b) => b.addEventListener("click", () => { mode = b.dataset.mode; $$("[data-mode]").forEach((x) => x.setAttribute("aria-pressed", String(x === b))); newTask(); }));
    newTask();
    window.__bruch = { parseExpr, same, genKuerzen, genRechnen, genDef };
  })();

  // =====================================================================
  // 5 Quiz
  // =====================================================================
  const QUESTIONS = [
    { q: "Welche Zahl darf man in 5/(x − 4) nicht einsetzen?", o: ["0", "4", "−4", "5"], a: 1, e: "Für x = 4 wird der Nenner 4 − 4 = 0. Durch 0 darf man nicht teilen." },
    { q: "Welche Zahl darf man in 3/(x + 2) nicht einsetzen?", o: ["2", "−2", "0", "3"], a: 1, e: "x + 2 = 0 ergibt x = −2. Achtung beim Vorzeichen!" },
    { q: "Was ist die Definitionsmenge von 1/(x(x − 5))?", o: ["D = ℚ \\ {5}", "D = ℚ \\ {0}", "D = ℚ \\ {0; 5}", "D = ℚ \\ {−5; 0}"], a: 2, e: "Ein Produkt ist 0, wenn ein Faktor 0 ist: x = 0 oder x = 5." },
    { q: "Was ist die Definitionsmenge von 2/(x² − 16)?", o: ["D = ℚ \\ {16}", "D = ℚ \\ {4}", "D = ℚ \\ {−4; 4}", "D = ℚ"], a: 2, e: "x² − 16 = (x + 4)(x − 4) ist 0 für x = −4 und x = 4." },
    { q: "Kürze 6x²/(9x).", o: ["2x/3", "6x/9", "2/3", "x/3"], a: 0, e: "Gemeinsame Faktoren 3 und x: 6x²/(9x) = 2x/3." },
    { q: "Darf man (x + 3)/x zu 3 kürzen?", o: ["Ja, x kürzt sich weg", "Nein, das x im Zähler ist kein Faktor, sondern ein Summand", "Ja, aber nur für x = 1", "Nein, weil 3 eine Primzahl ist"], a: 1, e: "Kürzen darf man nur Faktoren. „Aus Summen kürzen nur die Dummen.“" },
    { q: "Kürze (x² − 25)/(x + 5).", o: ["x − 5", "x + 5", "x² − 5", "−5"], a: 0, e: "x² − 25 = (x + 5)(x − 5). Die Klammer (x + 5) kürzt sich weg." },
    { q: "Kürze (4x + 8)/4.", o: ["x + 8", "x + 2", "4x + 2", "x + 4"], a: 1, e: "Ausklammern: 4(x + 2)/4 = x + 2. Die 4 muss bei beiden Summanden gekürzt werden." },
    { q: "3/x + 5/x = ?", o: ["8/(2x)", "8/x", "15/x", "8/x²"], a: 1, e: "Gleicher Nenner: Zähler addieren, Nenner bleibt." },
    { q: "2/x + 1/(3x) = ?", o: ["3/(4x)", "7/(3x)", "3/(3x)", "2/(3x²)"], a: 1, e: "Hauptnenner 3x: 6/(3x) + 1/(3x) = 7/(3x)." },
    { q: "(2/x) · (x²/4) = ?", o: ["x/2", "2x", "x²/2", "1/(2x)"], a: 0, e: "2x²/(4x) = x/2." },
    { q: "(3/x) : (6/x²) = ?", o: ["18/x³", "x/2", "2/x", "1/2"], a: 1, e: "Kehrwert: 3/x · x²/6 = 3x²/(6x) = x/2." },
    { q: "Was ist der Hauptnenner von 1/(2x) und 1/x²?", o: ["2x", "x²", "2x²", "2x³"], a: 2, e: "Faktoren 2 und x·x, jeweils so oft wie höchstens nötig: 2·x·x = 2x²." },
    { q: "Was ist beim Addieren von Bruchtermen falsch?", o: ["Auf den Hauptnenner erweitern", "Die Zähler addieren", "Die Nenner addieren", "Am Ende kürzen"], a: 2, e: "Nenner werden beim Addieren nie addiert. Erst gleichnamig machen, dann nur die Zähler addieren." },
    { q: "Welcher Bruchterm ist für alle Zahlen definiert?", o: ["1/x", "1/(x − 1)", "1/(x² + 1)", "1/(x² − 1)"], a: 2, e: "x² ist nie negativ, also ist x² + 1 immer mindestens 1 und nie 0." }
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
        const best = Math.max(score, store.get("bruch.best") || 0); store.set("bruch.best", best);
        const msg = score >= 9 ? "Super! Du kannst mit Bruchtermen umgehen." : score >= 6 ? "Gut gemacht! Übe noch ein paar Aufgaben im Trainer." : "Lies die Regeln zum Kürzen und Rechnen noch einmal und versuche es dann erneut.";
        $("#qProgress").textContent = `fertig · Bestwert ${best} / ${N}`;
        box.innerHTML = `<span class="eyebrow">Ergebnis</span><div class="score-big">${score} / ${N}</div><p>${msg}</p><div class="row"><button type="button" class="primary" id="qAgain">Neue Runde</button></div>`;
        $("#qAgain").addEventListener("click", start);
        return;
      }
      const q = order[idx]; answered = false;
      $("#qProgress").textContent = `Frage ${idx + 1} von ${N} · ${score} richtig`;
      box.innerHTML = `<div class="qtext"></div><div class="opts"></div><div class="feedback" hidden></div><div class="row"><button type="button" class="primary" id="qNext" hidden>${idx + 1 < N ? "Nächste Frage" : "Ergebnis anzeigen"}</button></div>`;
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
