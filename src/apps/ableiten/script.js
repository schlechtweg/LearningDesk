(function () {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const css = (n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
  const store = {
    get(k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* storage unavailable */ } }
  };
  const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  function shuffle(a) { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; }
  // German number formatting with up to `d` decimals
  function num(v, d = 2) {
    if (!isFinite(v)) return "–";
    const r = Math.round(v * 10 ** d) / 10 ** d;
    return (Object.is(r, -0) ? 0 : r).toLocaleString("de-DE", { maximumFractionDigits: d });
  }

  // =====================================================================
  // Plot helper: draws curves, lines and points on a canvas in math coords
  // =====================================================================
  function Plot(canvas, view) {
    const ctx = canvas.getContext("2d");
    let W = 0, H = 0;
    const v = Object.assign({ xmin: -5, xmax: 5, ymin: -5, ymax: 5, step: 1, labels: true }, view);
    const X = (x) => ((x - v.xmin) / (v.xmax - v.xmin)) * W;
    const Y = (y) => H - ((y - v.ymin) / (v.ymax - v.ymin)) * H;
    function size() {
      const r = canvas.getBoundingClientRect();
      if (!r.width) return false;
      const dpr = window.devicePixelRatio || 1;
      if (canvas.width !== Math.round(r.width * dpr) || canvas.height !== Math.round(r.height * dpr)) {
        canvas.width = Math.round(r.width * dpr); canvas.height = Math.round(r.height * dpr);
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      W = r.width; H = r.height;
      return true;
    }
    function curve(f, color, width = 2.5, dash = null) {
      ctx.strokeStyle = color; ctx.lineWidth = width; ctx.setLineDash(dash || []);
      ctx.beginPath();
      let pen = false, prevY = null;
      const N = Math.max(200, Math.round(W * 1.5));
      for (let i = 0; i <= N; i++) {
        const x = v.xmin + ((v.xmax - v.xmin) * i) / N;
        const y = f(x);
        const span = v.ymax - v.ymin;
        if (!isFinite(y) || y > v.ymax + 3 * span || y < v.ymin - 3 * span || (prevY !== null && Math.abs(y - prevY) > 2 * span)) { pen = false; prevY = isFinite(y) ? y : null; continue; }
        if (!pen) { ctx.moveTo(X(x), Y(y)); pen = true; } else ctx.lineTo(X(x), Y(y));
        prevY = y;
      }
      ctx.stroke(); ctx.setLineDash([]);
    }
    function draw(items = {}) {
      if (!size()) return;
      ctx.fillStyle = css("--surface"); ctx.fillRect(0, 0, W, H);
      // grid
      ctx.strokeStyle = css("--grid"); ctx.lineWidth = 1; ctx.beginPath();
      for (let x = Math.ceil(v.xmin); x <= v.xmax; x += 1) { ctx.moveTo(Math.round(X(x)) + 0.5, 0); ctx.lineTo(Math.round(X(x)) + 0.5, H); }
      for (let y = Math.ceil(v.ymin); y <= v.ymax; y += 1) { ctx.moveTo(0, Math.round(Y(y)) + 0.5); ctx.lineTo(W, Math.round(Y(y)) + 0.5); }
      ctx.stroke();
      // axes
      const axis = css("--axis");
      ctx.strokeStyle = axis; ctx.lineWidth = 1.5; ctx.beginPath();
      ctx.moveTo(0, Y(0)); ctx.lineTo(W, Y(0)); ctx.moveTo(X(0), 0); ctx.lineTo(X(0), H); ctx.stroke();
      if (v.labels) {
        ctx.fillStyle = css("--muted"); ctx.font = "11px " + css("--font-mono");
        ctx.textAlign = "center"; ctx.textBaseline = "top";
        for (let x = Math.ceil(v.xmin); x <= v.xmax; x += v.step) if (x !== 0 && X(x) > 10 && X(x) < W - 10) ctx.fillText(String(x).replace("-", "−"), X(x), Math.min(H - 14, Y(0) + 4));
        ctx.textAlign = "right"; ctx.textBaseline = "middle";
        for (let y = Math.ceil(v.ymin); y <= v.ymax; y += v.step) if (y !== 0 && Y(y) > 8 && Y(y) < H - 8) ctx.fillText(String(y).replace("-", "−"), Math.max(22, X(0) - 5), Y(y));
        ctx.textAlign = "right"; ctx.textBaseline = "bottom"; ctx.fillText("x", W - 4, Y(0) - 3);
      }
      (items.curves || []).forEach((c) => curve(c.f, c.color, c.width, c.dash));
      (items.dots || []).forEach((d) => { ctx.fillStyle = d.color; ctx.beginPath(); ctx.arc(X(d.x), Y(d.y), d.r || 2.5, 0, Math.PI * 2); ctx.fill(); });
      (items.points || []).forEach((d) => {
        ctx.fillStyle = css("--surface"); ctx.strokeStyle = d.color; ctx.lineWidth = 2.5;
        ctx.beginPath(); ctx.arc(X(d.x), Y(d.y), 5.5, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      });
      (items.vlines || []).forEach((l) => {
        ctx.strokeStyle = l.color; ctx.lineWidth = 1; ctx.setLineDash([4, 4]);
        ctx.beginPath(); ctx.moveTo(X(l.x), 0); ctx.lineTo(X(l.x), H); ctx.stroke(); ctx.setLineDash([]);
      });
    }
    return { draw, toMathX: (px) => v.xmin + (px / W) * (v.xmax - v.xmin), view: v };
  }

  // =====================================================================
  // Expression parser for student input (implicit multiplication, ^, sqrt,
  // sin, cos, decimal comma). Returns a function of x.
  // =====================================================================
  function parseExpr(src) {
    let s = src.toLowerCase()
      .replace(/\s+/g, "")
      .replace(/[−–]/g, "-").replace(/[·⋅×]/g, "*").replace(/÷/g, "/")
      .replace(/²/g, "^2").replace(/³/g, "^3").replace(/⁴/g, "^4")
      .replace(/(\d),(\d)/g, "$1.$2")
      .replace(/wurzel/g, "sqrt").replace(/√/g, "sqrt");
    if (!s) throw new Error("leer");
    const toks = [];
    let i = 0;
    while (i < s.length) {
      const ch = s[i];
      if (/[0-9.]/.test(ch)) { let j = i; while (j < s.length && /[0-9.]/.test(s[j])) j++; const n = parseFloat(s.slice(i, j)); if (isNaN(n)) throw new Error("Zahl"); toks.push({ t: "num", v: n }); i = j; continue; }
      if ("+-*/^()".includes(ch)) { toks.push({ t: ch }); i++; continue; }
      const fn = ["sqrt", "sin", "cos", "tan", "exp", "ln", "pi"].find((f) => s.startsWith(f, i));
      if (fn) { toks.push(fn === "pi" ? { t: "num", v: Math.PI } : { t: "fn", v: fn }); i += fn.length; continue; }
      if (ch === "x") { toks.push({ t: "x" }); i++; continue; }
      if (ch === "e") { toks.push({ t: "num", v: Math.E }); i++; continue; }
      throw new Error("Unbekanntes Zeichen „" + ch + "“");
    }
    let p = 0;
    const peek = () => toks[p], eat = (t) => { if (!toks[p] || toks[p].t !== t) throw new Error("Erwartet " + t); return toks[p++]; };
    const FN = { sqrt: Math.sqrt, sin: Math.sin, cos: Math.cos, tan: Math.tan, exp: Math.exp, ln: Math.log };
    function expr() {
      let a = term();
      while (peek() && (peek().t === "+" || peek().t === "-")) { const op = toks[p++].t; const b = term(); const l = a; a = op === "+" ? (x) => l(x) + b(x) : (x) => l(x) - b(x); }
      return a;
    }
    const startsPrimary = (tk) => tk && (tk.t === "num" || tk.t === "x" || tk.t === "fn" || tk.t === "(");
    function term() {
      let a = unary();
      for (;;) {
        const tk = peek();
        if (tk && (tk.t === "*" || tk.t === "/")) { p++; const b = unary(); const l = a; a = tk.t === "*" ? (x) => l(x) * b(x) : (x) => l(x) / b(x); }
        else if (startsPrimary(tk)) { const b = power(); const l = a; a = (x) => l(x) * b(x); }
        else break;
      }
      return a;
    }
    function unary() {
      const tk = peek();
      if (tk && tk.t === "-") { p++; const a = unary(); return (x) => -a(x); }
      if (tk && tk.t === "+") { p++; return unary(); }
      return power();
    }
    function power() {
      const base = primary();
      if (peek() && peek().t === "^") { p++; const e = unary(); return (x) => Math.pow(base(x), e(x)); }
      return base;
    }
    function primary() {
      const tk = toks[p++];
      if (!tk) throw new Error("Term unvollständig");
      if (tk.t === "num") { const v = tk.v; return () => v; }
      if (tk.t === "x") return (x) => x;
      if (tk.t === "(") { const a = expr(); eat(")"); return a; }
      if (tk.t === "fn") {
        const f = FN[tk.v];
        // allow "sin(x)" as well as "sinx" / "sqrt x"
        const arg = peek() && peek().t === "(" ? primary() : power();
        return (x) => f(arg(x));
      }
      throw new Error("Unerwartetes Zeichen");
    }
    const f = expr();
    if (p < toks.length) throw new Error("Unerwartetes Zeichen am Ende");
    return f;
  }
  // numeric equivalence test on several sample points
  function sameFunction(f, g) {
    const xs = [0.37, 0.81, 1.23, 1.9, 2.47, 3.1];
    for (const x of xs) {
      const a = f(x), b = g(x);
      if (!isFinite(a) || !isFinite(b)) return false;
      if (Math.abs(a - b) > 1e-6 * Math.max(1, Math.abs(b))) return false;
    }
    return true;
  }

  // =====================================================================
  // Term formatting: a term is {k:"pow", c, e} or {k:"sin"|"cos", c}
  // =====================================================================
  function toFrac(v) {
    for (let q = 1; q <= 12; q++) { const pnum = Math.round(v * q); if (Math.abs(pnum / q - v) < 1e-9) { return { p: pnum, q }; } }
    return { p: v, q: 1 };
  }
  const X_ = "<i>x</i>";
  function xPow(e) {
    if (e === 1) return X_;
    if (e === 0.5) return "√" + X_;
    if (Number.isInteger(e)) return X_ + "<sup>" + e + "</sup>";
    const f = toFrac(e); return X_ + "<sup>" + f.p + "/" + f.q + "</sup>";
  }
  function xPowRaw(e) { // exponent shown as written power (used in rewrite steps)
    if (e === 1) return X_;
    const f = toFrac(e);
    const ex = f.q === 1 ? String(f.p) : f.p + "/" + f.q;
    return X_ + "<sup>" + ex.replace("-", "−") + "</sup>";
  }
  const frac = (a, b) => `<span class="frac"><span>${a}</span><span>${b}</span></span>`;
  // HTML for |c|·x^e (sign handled by caller)
  function absTermHtml(t) {
    const c = Math.abs(t.c);
    if (t.k === "sin" || t.k === "cos") {
      const fr = toFrac(c);
      const coef = fr.q > 1 ? frac(fr.p, fr.q) : (c === 1 ? "" : String(c));
      return coef + (coef ? " " : "") + t.k + "(" + X_ + ")";
    }
    const e = t.e, fr = toFrac(c);
    if (e === 0) return fr.q > 1 ? frac(fr.p, fr.q) : String(fr.p);
    if (e < 0) {
      const den = (fr.q > 1 ? fr.q : "") + xPow(-e);
      return frac(fr.p, den);
    }
    const coef = fr.q > 1 ? frac(fr.p, fr.q) : (c === 1 ? "" : String(fr.p));
    return coef + xPow(e);
  }
  function polyHtml(terms) {
    const ts = terms.filter((t) => Math.abs(t.c) > 1e-12);
    if (!ts.length) return "0";
    return ts.map((t, i) => {
      const neg = t.c < 0;
      const body = absTermHtml(t);
      if (i === 0) return (neg ? "−" : "") + body;
      return (neg ? " − " : " + ") + body;
    }).join("");
  }
  function derivTerm(t) {
    if (t.k === "sin") return [{ k: "cos", c: t.c }];
    if (t.k === "cos") return [{ k: "sin", c: -t.c }];
    if (t.e === 0) return [];
    return [{ k: "pow", c: t.c * t.e, e: t.e - 1 }];
  }
  function evalTerms(terms) {
    return (x) => terms.reduce((s, t) => s + (t.k === "sin" ? t.c * Math.sin(x) : t.k === "cos" ? t.c * Math.cos(x) : t.c * Math.pow(x, t.e)), 0);
  }
  function termStep(t) {
    const d = derivTerm(t);
    const dh = d.length ? polyHtml(d) : "0";
    const show = polyHtml([t]);
    let rule, rewrite = "";
    if (t.k === "sin") rule = "sin′ = cos, Faktor bleibt";
    else if (t.k === "cos") rule = "cos′ = −sin, Faktor bleibt";
    else if (t.e === 0) rule = "Konstantenregel";
    else {
      rule = (t.c === 1 || t.c === -1) ? "Potenzregel" : "Potenzregel + Faktorregel";
      if (t.e < 0 || !Number.isInteger(t.e)) {
        const fr = toFrac(Math.abs(t.c));
        const coef = fr.q > 1 ? frac(fr.p, fr.q) + "·" : (Math.abs(t.c) === 1 ? "" : fr.p + "·");
        rewrite = ` &nbsp;(umschreiben: ${(t.c < 0 ? "−" : "") + coef + xPowRaw(t.e)})`;
      }
    }
    return `<span class="math">${show}</span>${rewrite} &nbsp;→&nbsp; <span class="math">${dh}</span> <span class="muted">· ${rule}</span>`;
  }

  // ---------- Hash routing ----------
  const VIEWS = ["idee", "grafisch", "regeln", "trainer", "tangente", "alltag", "quiz"];
  const onShow = {};
  function showView() {
    const name = location.hash.replace("#", "");
    const v = VIEWS.includes(name) ? name : "idee";
    VIEWS.forEach((n) => { $("#view-" + n).hidden = n !== v; });
    $$("nav.tabs a").forEach((a) => { if (a.dataset.view === v) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current"); });
    window.scrollTo({ top: 0 });
    if (onShow[v]) requestAnimationFrame(onShow[v]);
  }
  window.addEventListener("hashchange", showView);
  function redrawAll() { VIEWS.forEach((v) => { if (!$("#view-" + v).hidden && onShow[v]) onShow[v](); }); }
  window.addEventListener("resize", redrawAll);
  try { window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", redrawAll); } catch (e) { /* old browsers */ }

  // =====================================================================
  // 1 Idee: secant -> tangent
  // =====================================================================
  (function () {
    const FNS = [
      { f: (x) => 0.5 * x * x, df: (x) => x, view: { xmin: -4, xmax: 5, ymin: -2, ymax: 9 } },
      { f: (x) => 0.25 * x ** 3 - x, df: (x) => 0.75 * x * x - 1, view: { xmin: -4, xmax: 5, ymin: -5, ymax: 6 } },
      { f: (x) => (x >= 0 ? Math.sqrt(x) : NaN), df: (x) => 1 / (2 * Math.sqrt(x)), view: { xmin: -1, xmax: 7, ymin: -1, ymax: 3.5 }, xminAllowed: 0.5 }
    ];
    const HS = [2, 1.5, 1, 0.5, 0.25, 0.1, 0.05, 0.01, 0.001, 0.0001];
    let plot = null, fi = 0;
    function update() {
      const F = FNS[fi];
      if (!plot || plot.fi !== fi) { plot = Plot($("#pSec"), F.view); plot.fi = fi; }
      let x0 = parseFloat($("#secX0").value);
      if (F.xminAllowed !== undefined && x0 < F.xminAllowed) { x0 = F.xminAllowed; $("#secX0").value = x0; }
      const h = HS[+$("#secH").value];
      $("#secX0Out").textContent = num(x0, 1);
      $("#secHOut").textContent = num(h, 4);
      const y0 = F.f(x0), y1 = F.f(x0 + h);
      const ms = (y1 - y0) / h, mt = F.df(x0);
      $("#secMs").textContent = num(ms, 4);
      $("#secMt").textContent = num(mt, 4);
      $("#secDiff").textContent = num(Math.abs(ms - mt), 4);
      $("#secStatus").textContent = h >= 0.5
        ? "Die Sekante schneidet den Graphen in zwei deutlich getrennten Punkten. Ihre Steigung ist nur eine mittlere Steigung."
        : h > 0.005
          ? "Die Punkte rücken zusammen. Die Sekantensteigung nähert sich der Tangentensteigung."
          : "h ist fast 0. Sekante und Tangente sind kaum noch zu unterscheiden. Genau dieser Grenzwert ist f′(x₀).";
      plot.draw({
        curves: [
          { f: F.f, color: css("--f"), width: 3 },
          { f: (x) => mt * (x - x0) + y0, color: css("--tan"), width: 2, dash: [7, 5] },
          { f: (x) => ms * (x - x0) + y0, color: css("--sec"), width: 2 }
        ],
        points: [{ x: x0, y: y0, color: css("--tan") }, { x: x0 + h, y: y1, color: css("--sec") }]
      });
    }
    $("#secFn").addEventListener("change", (e) => { fi = +e.target.value; update(); });
    $("#secX0").addEventListener("input", update);
    $("#secH").addEventListener("input", update);
    onShow.idee = update;
  })();

  // =====================================================================
  // 2 Grafisch: build f' point by point + matching exercise
  // =====================================================================
  const GFNS = [
    { name: "f(x) = 0,25x³ − 3x", f: (x) => 0.25 * x ** 3 - 3 * x, df: (x) => 0.75 * x * x - 3 },
    { name: "f(x) = 0,5x² − 2", f: (x) => 0.5 * x * x - 2, df: (x) => x },
    { name: "f(x) = −0,125x⁴ + x²", f: (x) => -0.125 * x ** 4 + x * x, df: (x) => -0.5 * x ** 3 + 2 * x },
    { name: "f(x) = 0,2x³ (Sattelpunkt)", f: (x) => 0.2 * x ** 3, df: (x) => 0.6 * x * x },
    { name: "f(x) = 2·sin(x)", f: (x) => 2 * Math.sin(x), df: (x) => 2 * Math.cos(x) },
    { name: "f(x) = 0,5x + 1 (Gerade)", f: (x) => 0.5 * x + 1, df: () => 0.5 }
  ];
  (function () {
    const view = { xmin: -4.5, xmax: 4.5, ymin: -6, ymax: 6, step: 2 };
    const pf = Plot($("#pGf"), view), pd = Plot($("#pGdf"), view);
    let fi = 0, trace = [], full = false;
    const sel = $("#gFn");
    GFNS.forEach((g, i) => { const o = document.createElement("option"); o.value = i; o.textContent = g.name; sel.appendChild(o); });
    function describe(F, x0) {
      const m = F.df(x0), eps = 0.12;
      const near0 = Math.abs(m) < eps;
      if (near0) {
        const l = F.df(x0 - 0.3), r = F.df(x0 + 0.3);
        if (l > 0 && r < 0) return "Waagerechte Tangente, f hat hier einen Hochpunkt: f′ hat eine Nullstelle mit Wechsel von + nach −.";
        if (l < 0 && r > 0) return "Waagerechte Tangente, f hat hier einen Tiefpunkt: f′ hat eine Nullstelle mit Wechsel von − nach +.";
        return "Waagerechte Tangente ohne Vorzeichenwechsel: Sattelpunkt. f′ berührt die x-Achse nur.";
      }
      return m > 0
        ? `f steigt an dieser Stelle, deshalb ist f′(x₀) > 0. Der Punkt liegt unten oberhalb der x-Achse.`
        : `f fällt an dieser Stelle, deshalb ist f′(x₀) < 0. Der Punkt liegt unten unterhalb der x-Achse.`;
    }
    function update() {
      const F = GFNS[fi];
      const x0 = parseFloat($("#gX0").value);
      const y0 = F.f(x0), m = F.df(x0);
      trace.push(x0);
      $("#gX0Out").textContent = num(x0, 2);
      $("#gFx").textContent = num(y0, 2);
      $("#gDfx").textContent = num(m, 2);
      $("#gStatus").textContent = describe(F, x0);
      pf.draw({
        curves: [{ f: F.f, color: css("--f"), width: 3 }, { f: (x) => m * (x - x0) + y0, color: css("--tan"), width: 2 }],
        points: [{ x: x0, y: y0, color: css("--tan") }],
        vlines: [{ x: x0, color: css("--axis") }]
      });
      const dfc = css("--df");
      pd.draw({
        curves: full ? [{ f: F.df, color: dfc, width: 2.5 }] : [],
        dots: trace.map((x) => ({ x, y: F.df(x), color: dfc, r: 2.4 })),
        points: [{ x: x0, y: m, color: dfc }],
        vlines: [{ x: x0, color: css("--axis") }]
      });
    }
    sel.addEventListener("change", () => { fi = +sel.value; trace = []; update(); });
    $("#gX0").addEventListener("input", update);
    $("#gFull").addEventListener("click", (e) => { full = !full; e.target.setAttribute("aria-pressed", String(full)); update(); });
    $("#gClear").addEventListener("click", () => { trace = []; update(); });
    // pointer dragging over the upper plot
    const cv = $("#pGf");
    let dragging = false;
    function fromPointer(ev) {
      const r = cv.getBoundingClientRect();
      const x = Math.max(-4.5, Math.min(4.5, pf.toMathX(ev.clientX - r.left)));
      $("#gX0").value = x.toFixed(2); update();
    }
    cv.addEventListener("pointerdown", (ev) => { dragging = true; cv.setPointerCapture(ev.pointerId); fromPointer(ev); });
    cv.addEventListener("pointermove", (ev) => { if (dragging) fromPointer(ev); });
    cv.addEventListener("pointerup", () => { dragging = false; });
    cv.addEventListener("pointercancel", () => { dragging = false; });

    // ----- matching exercise -----
    const BANK = [
      { f: (x) => 0.25 * x ** 3 - 3 * x, df: (x) => 0.75 * x * x - 3 },
      { f: (x) => -0.5 * x * x + x + 2, df: (x) => -x + 1 },
      { f: (x) => -0.125 * x ** 4 + x * x, df: (x) => -0.5 * x ** 3 + 2 * x },
      { f: (x) => 0.2 * x ** 3, df: (x) => 0.6 * x * x },
      { f: (x) => 2 * Math.sin(x), df: (x) => 2 * Math.cos(x) },
      { f: (x) => 0.5 * (x - 1) ** 2 - 3, df: (x) => x - 1 },
      { f: (x) => -0.2 * x ** 3 + 1.5 * x, df: (x) => -0.6 * x * x + 1.5 },
      { f: (x) => 0.1 * x ** 4 - 0.8 * x * x, df: (x) => 0.4 * x ** 3 - 1.6 * x }
    ];
    const mview = { xmin: -4.5, xmax: 4.5, ymin: -6, ymax: 6, step: 2 };
    const pm = Plot($("#pMatch"), mview);
    let cur = null, answered = false, score = { right: 0, total: 0 };
    const choicePlots = [];
    function newTask() {
      const idx = rnd(0, BANK.length - 1);
      const T = BANK[idx];
      const others = BANK.filter((_, i) => i !== idx);
      const distractors = shuffle([
        { f: (x) => -T.df(x), why: "Das ist −f′: Die Vorzeichen sind vertauscht. Wo f steigt, liegt dieser Graph unter der x-Achse." },
        { f: T.f, why: "Das ist f selbst und nicht die Ableitung." },
        { f: (x) => T.df(x) + 2, why: "Dieser Graph ist um 2 nach oben verschoben. Seine Nullstellen liegen nicht bei den Extremstellen von f." },
        { f: pick(others).df, why: "Das ist die Ableitung einer anderen Funktion. Prüfe die Nullstellen an den Extremstellen von f." }
      ]).slice(0, 3);
      cur = { T, opts: shuffle([{ f: T.df, correct: true }].concat(distractors)) };
      answered = false;
      $("#matchFb").hidden = true;
      const box = $("#matchChoices");
      box.innerHTML = "";
      choicePlots.length = 0;
      cur.opts.forEach((o, i) => {
        const b = document.createElement("button");
        b.type = "button"; b.className = "choice";
        b.innerHTML = `<span>Graph ${"ABCD"[i]}</span><canvas class="plot small" aria-label="Möglicher Graph ${"ABCD"[i]}"></canvas>`;
        b.addEventListener("click", () => choose(i));
        box.appendChild(b);
        choicePlots.push(Plot($("canvas", b), Object.assign({}, mview, { labels: false })));
      });
      draw();
    }
    function draw() {
      if (!cur) return;
      pm.draw({ curves: [{ f: cur.T.f, color: css("--f"), width: 3 }] });
      cur.opts.forEach((o, i) => choicePlots[i].draw({ curves: [{ f: o.f, color: css("--df"), width: 2.5 }] }));
    }
    function choose(i) {
      if (answered) return;
      answered = true;
      const o = cur.opts[i];
      score.total++; if (o.correct) score.right++;
      $$(".choice", $("#matchChoices")).forEach((b, j) => {
        b.disabled = true;
        if (cur.opts[j].correct) b.classList.add("right"); else if (j === i) b.classList.add("wrong");
      });
      const fb = $("#matchFb");
      fb.hidden = false;
      fb.innerHTML = o.correct
        ? '<span><b class="ok">Richtig!</b> Die Nullstellen dieses Graphen liegen genau bei den Hoch- und Tiefpunkten von f. Wo f steigt, ist er positiv.</span>'
        : `<span><b class="no">Nicht ganz.</b> ${o.why} Richtig ist Graph ${"ABCD"[cur.opts.findIndex((q) => q.correct)]}.</span>`;
      $("#matchScore").textContent = `${score.right} von ${score.total} richtig`;
    }
    $("#matchNext").addEventListener("click", newTask);
    onShow.grafisch = () => { update(); if (!cur) newTask(); else draw(); };
    $("#gX0").value = -4;
  })();

  // =====================================================================
  // 4 Trainer: random functions, student types f'(x)
  // =====================================================================
  (function () {
    let level = 1, task = null, solved = false, score = { right: 0, total: 0 };
    const nz = (a, b) => { let v = 0; while (v === 0) v = rnd(a, b); return v; };
    function gen() {
      const terms = [];
      if (level === 1) {
        const exps = shuffle([5, 4, 3, 2, 1]).slice(0, rnd(2, 3)).sort((a, b) => b - a);
        exps.forEach((e) => terms.push({ k: "pow", c: nz(-6, 6), e }));
        if (Math.random() < 0.7) terms.push({ k: "pow", c: nz(-9, 9), e: 0 });
      } else if (level === 2) {
        const e1 = pick([3, 4, 2]);
        terms.push({ k: "pow", c: pick([0.5, -0.5, 1.5, 2, -3, 0.25]), e: e1 });
        const special = shuffle([{ e: -1 }, { e: -2 }, { e: 0.5 }]).slice(0, 2);
        special.forEach((s) => terms.push({ k: "pow", c: s.e === 0.5 ? pick([2, 4, -6, 1]) : pick([1, 2, 3, -4, 5]), e: s.e }));
        if (Math.random() < 0.5) terms.push({ k: "pow", c: nz(-5, 5), e: 1 });
      } else {
        terms.push({ k: "pow", c: nz(-4, 4), e: pick([2, 3]) });
        terms.push({ k: pick(["sin", "cos"]), c: pick([1, 2, -3, 0.5, -1]) });
        if (Math.random() < 0.6) terms.push({ k: "pow", c: pick([1, -2, 3]), e: pick([-1, 0.5, 1]) });
        if (Math.random() < 0.5) terms.push({ k: "pow", c: nz(-6, 6), e: 0 });
      }
      // sort by exponent, trig last
      terms.sort((a, b) => (b.k === "pow" ? b.e : -99) - (a.k === "pow" ? a.e : -99));
      const deriv = terms.flatMap(derivTerm);
      return { terms, deriv };
    }
    function newTask() {
      task = gen(); solved = false;
      $("#trTask").innerHTML = `<span class="math"><i>f</i>(<i>x</i>) = ${polyHtml(task.terms)}</span>`;
      $("#trInput").value = ""; $("#trFb").hidden = true;
    }
    function solutionHtml() {
      return `<ol>${task.terms.map((t) => `<li>${termStep(t)}</li>`).join("")}</ol>
        <span>Ergebnis: <span class="math"><i>f</i>′(<i>x</i>) = ${polyHtml(task.deriv)}</span></span>`;
    }
    function check(ev) {
      ev.preventDefault();
      const fb = $("#trFb");
      fb.hidden = false;
      let g;
      try { g = parseExpr($("#trInput").value); }
      catch (e) { fb.innerHTML = `<span><b class="no">Das kann ich nicht lesen.</b> Prüfe deine Eingabe (${e.message}). Beispiel: <code>12x^3 - 2/x^2</code></span>`; return; }
      const ok = sameFunction(g, evalTerms(task.deriv));
      if (!task.attempted) { task.attempted = true; score.total++; if (ok) score.right++; }
      if (ok) {
        solved = true;
        fb.innerHTML = `<span><b class="ok">Richtig!</b></span>${solutionHtml()}`;
      } else {
        // check typical mistakes for a helpful hint
        let hint = "Leite jeden Summanden einzeln ab und prüfe die Exponenten.";
        if (sameFunction(g, evalTerms(task.terms))) hint = "Du hast f(x) abgeschrieben, aber nicht abgeleitet.";
        else {
          const wrongExp = task.terms.flatMap((t) => t.k === "pow" && t.e !== 0 ? [{ k: "pow", c: t.c * t.e, e: t.e }] : t.k === "pow" ? [] : derivTerm(t));
          if (sameFunction(g, evalTerms(wrongExp))) hint = "Den Exponenten nach vorne holen ist richtig, aber du musst ihn danach auch um 1 verringern.";
          const withConst = task.deriv.concat(task.terms.filter((t) => t.k === "pow" && t.e === 0));
          if (task.terms.some((t) => t.k === "pow" && t.e === 0) && sameFunction(g, evalTerms(withConst))) hint = "Fast! Die Konstante fällt beim Ableiten weg.";
        }
        fb.innerHTML = `<span><b class="no">Noch nicht richtig.</b> ${hint}</span>`;
        solved = false;
      }
      $("#trScore").textContent = `${score.right} von ${score.total} Aufgaben auf Anhieb richtig`;
    }
    $("#trForm").addEventListener("submit", check);
    $("#trShow").addEventListener("click", () => {
      if (!task.attempted) { task.attempted = true; score.total++; $("#trScore").textContent = `${score.right} von ${score.total} Aufgaben auf Anhieb richtig`; }
      const fb = $("#trFb"); fb.hidden = false; fb.innerHTML = solutionHtml(); solved = true;
    });
    $("#trNext").addEventListener("click", () => { newTask(); $("#trInput").focus(); });
    $$("[data-level]").forEach((b) => b.addEventListener("click", () => {
      level = +b.dataset.level;
      $$("[data-level]").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
      newTask();
    }));
    newTask();
    // expose for tests in console
    window.__ableiten = { parseExpr, sameFunction };
  })();

  // =====================================================================
  // 5 Tangente: explorer + practice
  // =====================================================================
  (function () {
    const FNS = [
      { terms: [{ k: "pow", c: 1, e: 2 }, { k: "pow", c: -2, e: 1 }], view: { xmin: -4, xmax: 5, ymin: -4, ymax: 8 } },
      { terms: [{ k: "pow", c: 0.5, e: 3 }, { k: "pow", c: -2, e: 1 }], view: { xmin: -4, xmax: 4, ymin: -7, ymax: 7, step: 2 } },
      { terms: [{ k: "pow", c: -1, e: 2 }, { k: "pow", c: 4, e: 0 }], view: { xmin: -4, xmax: 4, ymin: -6, ymax: 7, step: 2 } },
      { terms: [{ k: "pow", c: 1, e: -1 }], view: { xmin: -4, xmax: 4, ymin: -5, ymax: 5 } }
    ];
    let fi = 0, plot = null;
    const signNum = (v) => (v < 0 ? "− " + num(-v, 3) : "+ " + num(v, 3));
    const paren = (v) => (v < 0 ? "(" + num(v, 3).replace("-", "−") + ")" : num(v, 3));
    const nm = (v) => num(v, 3).replace("-", "−");
    function update() {
      const F = FNS[fi];
      if (!plot || plot.fi !== fi) { plot = Plot($("#pTan"), F.view); plot.fi = fi; }
      let x0 = parseFloat($("#tX0").value);
      if (fi === 3 && x0 === 0) { x0 = 0.5; $("#tX0").value = 0.5; }
      $("#tX0Out").textContent = num(x0, 1);
      const f = evalTerms(F.terms), dterms = F.terms.flatMap(derivTerm), df = evalTerms(dterms);
      const y0 = f(x0), m = df(x0), b = y0 - m * x0;
      plot.draw({
        curves: [{ f, color: css("--f"), width: 3 }, { f: (x) => m * x + b, color: css("--tan"), width: 2.5 }],
        points: [{ x: x0, y: y0, color: css("--tan") }]
      });
      const fx = `<span class="math"><i>f</i>(<i>x</i>) = ${polyHtml(F.terms)}</span>`;
      $("#tSteps").innerHTML = `
        <li><strong>Funktionswert berechnen:</strong> ${fx}<br><span class="math"><i>f</i>(${nm(x0)}) = ${nm(y0)}</span>, also <span class="math"><i>P</i>(${nm(x0)} | ${nm(y0)})</span></li>
        <li><strong>Ableitung bilden:</strong> <span class="math"><i>f</i>′(<i>x</i>) = ${polyHtml(dterms)}</span></li>
        <li><strong>Steigung an der Stelle:</strong> <span class="math"><i>m</i> = <i>f</i>′(${nm(x0)}) = ${nm(m)}</span></li>
        <li><strong>In die Formel einsetzen:</strong> <span class="math"><i>t</i>(<i>x</i>) = ${paren(m)} · (<i>x</i> ${signNum(-x0)}) ${signNum(y0)}</span></li>
        <li><strong>Vereinfachen:</strong> <span class="math c-tan"><i>t</i>(<i>x</i>) = ${Math.abs(m) < 1e-9 ? "" : nm(m) + "<i>x</i> "}${Math.abs(m) < 1e-9 ? nm(b) : signNum(b)}</span>
          ${Math.abs(m) < 1e-9 ? '<br><span class="muted small">Die Steigung ist 0: Die Tangente ist waagerecht. Hier liegt ein Hoch-, Tief- oder Sattelpunkt.</span>' : ""}</li>
        <li class="muted small">Alternative: <span class="math"><i>m</i></span> und <span class="math"><i>P</i></span> in <span class="math"><i>y</i> = <i>m</i><i>x</i> + <i>b</i></span> einsetzen und nach <i>b</i> auflösen: <span class="math">${nm(y0)} = ${paren(m)} · ${paren(x0)} + <i>b</i> ⇒ <i>b</i> = ${nm(b)}</span></li>`;
    }
    $("#tFn").addEventListener("change", (e) => { fi = +e.target.value; update(); });
    $("#tX0").addEventListener("input", update);
    onShow.tangente = update;

    // ----- practice -----
    let task = null, score = { right: 0, total: 0 }, done = false;
    function newTask() {
      const deg = pick([2, 2, 3]);
      const terms = [];
      if (deg === 3) terms.push({ k: "pow", c: pick([1, -1, 2]), e: 3 });
      terms.push({ k: "pow", c: pick([1, -1, 2, -2, 3]), e: 2 });
      if (Math.random() < 0.8) terms.push({ k: "pow", c: rnd(-4, 4) || 1, e: 1 });
      if (Math.random() < 0.7) terms.push({ k: "pow", c: rnd(-5, 5) || 2, e: 0 });
      const x0 = rnd(-2, 2) || 1;
      const f = evalTerms(terms), dterms = terms.flatMap(derivTerm), df = evalTerms(dterms);
      const y0 = f(x0), m = df(x0), b = y0 - m * x0;
      task = { terms, dterms, x0, y0, m, b };
      done = false;
      $("#tpTask").innerHTML = `Bestimme die Tangente an <span class="math"><i>f</i>(<i>x</i>) = ${polyHtml(terms)}</span> an der Stelle <span class="math"><i>x</i><sub>0</sub> = ${nm(x0)}</span>.`;
      $("#tpM").value = ""; $("#tpB").value = ""; $("#tpFb").hidden = true;
    }
    function steps() {
      const t = task;
      return `<ol>
        <li><span class="math"><i>f</i>(${nm(t.x0)}) = ${nm(t.y0)}</span></li>
        <li><span class="math"><i>f</i>′(<i>x</i>) = ${polyHtml(t.dterms)}</span></li>
        <li><span class="math"><i>m</i> = <i>f</i>′(${nm(t.x0)}) = ${nm(t.m)}</span></li>
        <li><span class="math"><i>b</i> = <i>f</i>(<i>x</i><sub>0</sub>) − <i>m</i>·<i>x</i><sub>0</sub> = ${nm(t.y0)} − ${paren(t.m)}·${paren(t.x0)} = ${nm(t.b)}</span></li>
      </ol><span>Ergebnis: <span class="math c-tan"><i>t</i>(<i>x</i>) = ${nm(t.m)}<i>x</i> ${signNum(t.b)}</span></span>`;
    }
    const readNum = (s) => { const v = parseFloat(String(s).replace(/\s/g, "").replace(",", ".").replace(/[−–]/g, "-")); return v; };
    $("#tpForm").addEventListener("submit", (ev) => {
      ev.preventDefault();
      const m = readNum($("#tpM").value), b = readNum($("#tpB").value);
      const fb = $("#tpFb"); fb.hidden = false;
      if (isNaN(m) || isNaN(b)) { fb.innerHTML = "<span>Bitte trage für <i>m</i> und <i>b</i> je eine Zahl ein.</span>"; return; }
      const okM = Math.abs(m - task.m) < 1e-6, okB = Math.abs(b - task.b) < 1e-6;
      if (!done) { score.total++; if (okM && okB) score.right++; }
      done = true;
      if (okM && okB) fb.innerHTML = `<span><b class="ok">Richtig!</b></span>${steps()}`;
      else if (okM) fb.innerHTML = `<span><b class="no">Die Steigung stimmt, b noch nicht.</b> Setze den Punkt <span class="math">(${nm(task.x0)} | ${nm(task.y0)})</span> in <span class="math"><i>y</i> = ${nm(task.m)}<i>x</i> + <i>b</i></span> ein.</span>`;
      else fb.innerHTML = `<span><b class="no">Die Steigung stimmt noch nicht.</b> Bilde zuerst <span class="math"><i>f</i>′(<i>x</i>)</span> und setze dann <span class="math"><i>x</i><sub>0</sub> = ${nm(task.x0)}</span> ein.</span>`;
      $("#tpScore").textContent = `${score.right} von ${score.total} Aufgaben auf Anhieb richtig`;
    });
    $("#tpShow").addEventListener("click", () => { done = true; const fb = $("#tpFb"); fb.hidden = false; fb.innerHTML = steps(); });
    $("#tpNext").addEventListener("click", newTask);
    newTask();
  })();

  // =====================================================================
  // 6 Quiz
  // =====================================================================
  const QUESTIONS = [
    { q: "Was gibt f′(x₀) geometrisch an?", o: ["Den Funktionswert an der Stelle x₀", "Die Steigung der Tangente an den Graphen im Punkt (x₀ | f(x₀))", "Den y-Achsenabschnitt der Tangente", "Die Fläche unter dem Graphen"], a: 1, e: "Die Ableitung an einer Stelle ist die Tangentensteigung, also die lokale Änderungsrate." },
    { q: "Was berechnet der Differenzenquotient (f(x₀+h) − f(x₀)) / h?", o: ["Die Steigung der Tangente", "Die Steigung der Sekante, also die mittlere Änderungsrate", "Die zweite Ableitung", "Die Nullstelle"], a: 1, e: "Erst der Grenzwert für h → 0 liefert die Tangentensteigung." },
    { q: "f(x) = x⁵. Was ist f′(x)?", o: ["5x⁵", "x⁴", "5x⁴", "4x⁵"], a: 2, e: "Potenzregel: Exponent nach vorne holen und um 1 verringern." },
    { q: "f(x) = 7. Was ist f′(x)?", o: ["7", "1", "0", "7x"], a: 2, e: "Konstanten haben die Ableitung 0. Der Graph ist waagerecht." },
    { q: "f(x) = 3x² − 2x + 5. Was ist f′(x)?", o: ["6x − 2", "6x − 2 + 5", "3x − 2", "6x² − 2x"], a: 0, e: "(3x²)′ = 6x, (−2x)′ = −2, (5)′ = 0." },
    { q: "f(x) = 1/x. Was ist f′(x)?", o: ["1", "ln(x)", "−1/x²", "1/x²"], a: 2, e: "1/x = x⁻¹, also f′(x) = −1·x⁻² = −1/x²." },
    { q: "f(x) = √x. Was ist f′(x)?", o: ["1/(2√x)", "2√x", "√x / 2", "1/√x"], a: 0, e: "√x = x^(1/2), also f′(x) = ½·x^(−1/2) = 1/(2√x)." },
    { q: "f(x) = sin(x). Was ist f′(x)?", o: ["−sin(x)", "cos(x)", "−cos(x)", "sin(x)"], a: 1, e: "sin′ = cos. Erst beim Ableiten von cos kommt ein Minus dazu." },
    { q: "Der Graph von f hat bei x = 2 einen Hochpunkt. Was gilt für f′?", o: ["f′(2) > 0", "f′(2) = 0 und f′ wechselt dort von + nach −", "f′(2) = 0 und f′ wechselt dort von − nach +", "f′ hat bei 2 einen Hochpunkt"], a: 1, e: "Vor dem Hochpunkt steigt f (f′ > 0), danach fällt f (f′ < 0)." },
    { q: "Wo f einen Wendepunkt hat, hat der Graph von f′ …", o: ["eine Nullstelle", "einen Hoch- oder Tiefpunkt", "eine Polstelle", "einen Sattelpunkt"], a: 1, e: "Am Wendepunkt ist die Steigung von f am größten bzw. am kleinsten. Also hat f′ dort ein Extremum." },
    { q: "In einem Intervall verläuft der Graph von f′ unterhalb der x-Achse. Dann gilt für f:", o: ["f ist dort negativ", "f fällt dort", "f steigt dort", "f hat dort eine Nullstelle"], a: 1, e: "f′ < 0 bedeutet negative Steigung, also fällt f. Ob f selbst positiv oder negativ ist, kann man daraus nicht ablesen." },
    { q: "f′ hat bei x = 0 eine Nullstelle ohne Vorzeichenwechsel. Was hat f dort?", o: ["einen Hochpunkt", "einen Tiefpunkt", "einen Sattelpunkt", "eine Nullstelle"], a: 2, e: "Waagerechte Tangente, aber f steigt (oder fällt) davor und danach weiter: ein Sattelpunkt, z. B. bei f(x) = x³." },
    { q: "Wie lautet die allgemeine Tangentengleichung an der Stelle x₀?", o: ["t(x) = f(x₀)·(x − x₀) + f′(x₀)", "t(x) = f′(x₀)·(x − x₀) + f(x₀)", "t(x) = f′(x)·x + f(x₀)", "t(x) = f′(x₀)·x"], a: 1, e: "Steigung f′(x₀), und die Gerade geht durch den Punkt (x₀ | f(x₀))." },
    { q: "Wie lautet die Tangente an f(x) = x² an der Stelle x₀ = 1?", o: ["t(x) = 2x − 1", "t(x) = 2x + 1", "t(x) = x + 1", "t(x) = 2x"], a: 0, e: "f(1) = 1, f′(x) = 2x, also m = 2. 1 = 2·1 + b ⇒ b = −1." },
    { q: "Ist f′(x₀) = 0, dann ist die Tangente an der Stelle x₀ …", o: ["senkrecht", "waagerecht", "die x-Achse", "nicht definiert"], a: 1, e: "Steigung 0 bedeutet eine waagerechte Gerade t(x) = f(x₀). Sie ist nur dann die x-Achse, wenn zusätzlich f(x₀) = 0 ist." },
    { q: "Welche Steigung hat der Graph von f(x) = x³ an der Stelle x = −1?", o: ["−3", "−1", "3", "1"], a: 2, e: "f′(x) = 3x², f′(−1) = 3·1 = 3. Das Quadrat macht das Vorzeichen positiv." },
    { q: "Ist f′(x) = 2 für alle x, dann ist der Graph von f …", o: ["eine Parabel", "eine Gerade mit Steigung 2", "die waagerechte Gerade y = 2", "eine Gerade durch den Ursprung, sicher"], a: 1, e: "Konstante Steigung bedeutet eine Gerade f(x) = 2x + c. Den y-Achsenabschnitt c kennt man nicht." },
    { q: "f(x) = (x + 1)². Wie bekommst du f′ ohne Kettenregel?", o: ["Einfach 2(x + 1)² schreiben", "Ausmultiplizieren: x² + 2x + 1, dann f′(x) = 2x + 2", "f′(x) = 2x + 1", "f′(x) = x + 1"], a: 1, e: "Nach dem Ausmultiplizieren reichen Potenz-, Faktor- und Summenregel." },
    { q: "Der Graph von f ist eine nach oben geöffnete Parabel. Wie sieht f′ aus?", o: ["Eine steigende Gerade", "Eine fallende Gerade", "Eine Parabel", "Eine waagerechte Gerade"], a: 0, e: "Grad 2 → Grad 1. Links vom Scheitel fällt f (f′ < 0), rechts steigt f (f′ > 0). Also ist f′ eine steigende Gerade." }
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
        const best = Math.max(score, store.get("ableiten.best") || 0);
        store.set("ableiten.best", best);
        const msg = score >= 11 ? "Hervorragend! Du kannst ableiten." : score >= 8 ? "Gut gemacht! Schau dir die Erklärungen zu den falschen Antworten noch einmal an." : "Übe noch mit dem grafischen Ableiten und dem Trainer und versuche es dann erneut.";
        $("#qProgress").textContent = `fertig · Bestwert ${best} / ${N}`;
        box.innerHTML = `<span class="eyebrow">Ergebnis</span><div class="score-big mono">${score} / ${N}</div><p>${msg}</p><div class="row"><button type="button" class="primary" id="qAgain">Neue Runde (gemischt)</button></div>`;
        $("#qAgain").addEventListener("click", start);
        return;
      }
      const q = order[idx];
      answered = false;
      $("#qProgress").textContent = `Frage ${idx + 1} von ${N} · ${score} richtig`;
      box.innerHTML = `<div class="qtext"></div><div class="opts"></div><div class="feedback" hidden></div><div class="row"><button type="button" class="primary" id="qNext" hidden>${idx + 1 < N ? "Nächste Frage" : "Ergebnis anzeigen"}</button></div>`;
      $(".qtext", box).textContent = q.q;
      q.o.forEach((text, i) => {
        const b = document.createElement("button");
        b.type = "button";
        b.innerHTML = `<span class="k">${"ABCD"[i]}</span><span class="math" style="white-space:normal"></span>`;
        b.lastChild.textContent = text;
        b.addEventListener("click", () => choose(i));
        $(".opts", box).appendChild(b);
      });
      $("#qNext").addEventListener("click", () => { idx++; render(); });
    }
    function choose(i) {
      if (answered) return;
      answered = true;
      const q = order[idx], box = $("#quizBox");
      $$(".opts button", box).forEach((b, j) => { b.disabled = true; if (j === q.a) b.classList.add("right"); else if (j === i) b.classList.add("wrong"); });
      const ok = i === q.a; if (ok) score++;
      const fb = $(".feedback", box); fb.hidden = false;
      fb.innerHTML = (ok ? '<span><b class="ok">Richtig!</b> ' : '<span><b class="no">Leider falsch.</b> ') + "</span>";
      fb.firstChild.appendChild(document.createTextNode(q.e));
      $("#qNext").hidden = false; $("#qNext").focus();
      $("#qProgress").textContent = `Frage ${idx + 1} von ${N} · ${score} richtig`;
    }
    start();
  })();

  showView();
})();
