/* LearnKit: shared building blocks for LearningDesk topic apps.
   Exposes window.LK with: DOM helpers, number/expression parsing, rationals,
   views (tab routing), quiz, trainer (task generators + checkers),
   prediction cards and the equation lab for equations and inequalities. */
(function () {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const store = {
    get(k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* storage unavailable */ } }
  };
  const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  const nz = (a, b) => { let v = 0; while (v === 0) v = rnd(a, b); return v; };
  function shuffle(a) { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; }
  const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a; };
  const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const minus = (s) => String(s).replace(/-/g, "−");
  const frac = (n, d) => `<span class="frac"><span>${n}</span><span>${d}</span></span>`;

  // ---------- numbers ----------
  // German formatting with at most d decimals
  function fmt(v, d = 2) {
    if (!isFinite(v)) return "–";
    const r = Math.round(v * 10 ** d) / 10 ** d || 0;
    return minus(r.toLocaleString("de-DE", { maximumFractionDigits: d }));
  }
  // accepts "3,5", "-2", "7/2", "x = 4", "1.013,25"
  function parseNum(raw) {
    let s = String(raw).trim().replace(/\s+/g, "").replace(/[−–]/g, "-").replace(/^[a-zA-Z]+=/, "");
    if (s.includes(",") && s.includes(".")) s = s.replace(/\./g, "");
    else if (/^-?\d{1,3}(\.\d{3})+$/.test(s)) s = s.replace(/\./g, ""); // German thousands separator: 1.013
    s = s.replace(",", ".");
    const m = s.match(/^(-?\d+(?:\.\d+)?)\/(-?\d+(?:\.\d+)?)$/);
    if (m) return Number(m[1]) / Number(m[2]);
    if (!/^-?(\d+\.?\d*|\.\d+)(e-?\d+)?$/i.test(s)) return NaN;
    return Number(s);
  }

  // ---------- rationals ----------
  class R {
    constructor(n, d = 1) {
      if (d === 0) throw new Error("Division durch 0");
      if (d < 0) { n = -n; d = -d; }
      const g = gcd(n, d) || 1; this.n = n / g; this.d = d / g;
    }
    static of(x) { if (x instanceof R) return x; if (Number.isInteger(x)) return new R(x); const k = 1e6; return new R(Math.round(x * k), k); }
    add(o) { o = R.of(o); return new R(this.n * o.d + o.n * this.d, this.d * o.d); }
    sub(o) { o = R.of(o); return new R(this.n * o.d - o.n * this.d, this.d * o.d); }
    mul(o) { o = R.of(o); return new R(this.n * o.n, this.d * o.d); }
    div(o) { o = R.of(o); return new R(this.n * o.d, this.d * o.n); }
    neg() { return new R(-this.n, this.d); }
    isZero() { return this.n === 0; }
    eq(o) { o = R.of(o); return this.n === o.n && this.d === o.d; }
    val() { return this.n / this.d; }
    sign() { return Math.sign(this.n); }
    abs() { return new R(Math.abs(this.n), this.d); }
    text() { return this.d === 1 ? String(this.n) : `${this.n}/${this.d}`; }
    html() { const a = Math.abs(this.n); const body = this.d === 1 ? String(a) : frac(a, this.d); return (this.n < 0 ? "−" : "") + body; }
  }
  // a·x + b as HTML, e.g. "3x − 2", "−x", "5"
  function linHtml(x, c, v = "x") {
    x = R.of(x); c = R.of(c);
    const vx = `<i>${v}</i>`;
    let s = "";
    if (!x.isZero()) {
      const a = x.abs();
      s = (x.sign() < 0 ? "−" : "") + (a.eq(1) ? "" : a.html()) + vx;
    }
    if (!c.isZero() || !s) {
      if (!s) s = c.html();
      else s += (c.sign() < 0 ? " − " : " + ") + c.abs().html();
    }
    return s;
  }

  // ---------- polynomials: terms are {c: coefficient, v: {x: 2, y: 1}} ----------
  function monoParts(v) {
    const keys = Object.keys(v || {}).filter((k) => v[k] > 0).sort();
    return { vh: keys.map((k) => `<i>${k}</i>` + (v[k] > 1 ? `<sup>${v[k]}</sup>` : "")).join(""), vt: keys.map((k) => k + (v[k] > 1 ? "^" + v[k] : "")).join("") };
  }
  function poly(terms) {
    let h = "", t = "";
    terms.filter((m) => m.c !== 0).forEach((m, i) => {
      const { vh, vt } = monoParts(m.v), a = Math.abs(m.c);
      const ch = a === 1 && vh ? "" : fmt(a, 4), ct = a === 1 && vt ? "" : String(a);
      if (i === 0) { h += (m.c < 0 ? "−" : "") + ch + vh; t += (m.c < 0 ? "-" : "") + ct + vt; }
      else { h += (m.c < 0 ? " − " : " + ") + ch + vh; t += (m.c < 0 ? "-" : "+") + ct + vt; }
    });
    return h ? { html: h, text: t } : { html: "0", text: "0" };
  }
  const polyFn = (terms) => (e) => terms.reduce((s, m) => s + m.c * Object.entries(m.v || {}).reduce((p, [k, ex]) => p * Math.pow(e[k], ex), 1), 0);
  // collect like terms: returns new term list sorted by degree
  function collect(terms) {
    const map = new Map();
    terms.forEach((m) => { const key = monoParts(m.v).vt; const cur = map.get(key); if (cur) cur.c += m.c; else map.set(key, { c: m.c, v: { ...(m.v || {}) } }); });
    const deg = (m) => Object.values(m.v).reduce((a, b) => a + b, 0);
    return [...map.values()].filter((m) => m.c !== 0).sort((a, b) => deg(b) - deg(a) || monoParts(a.v).vt.localeCompare(monoParts(b.v).vt));
  }

  // ---------- expressions ----------
  // single-letter variables, implicit multiplication, ^, ², ³, ·, ×, :, ÷, decimal comma
  function parse(src) {
    const s = String(src).toLowerCase().replace(/\s+/g, "").replace(/[−–]/g, "-").replace(/[·⋅×]/g, "*").replace(/[:÷]/g, "/")
      .replace(/²/g, "^2").replace(/³/g, "^3").replace(/(\d),(\d)/g, "$1.$2");
    if (!s) throw new Error("leer");
    const toks = [];
    for (let i = 0; i < s.length;) {
      const ch = s[i];
      if (/[0-9.]/.test(ch)) { let j = i; while (j < s.length && /[0-9.]/.test(s[j])) j++; const n = parseFloat(s.slice(i, j)); if (isNaN(n)) throw new Error("Zahl"); toks.push({ t: "num", v: n }); i = j; continue; }
      if ("+-*/^()".includes(ch)) { toks.push({ t: ch }); i++; continue; }
      if (/[a-z]/.test(ch)) { toks.push({ t: "var", v: ch }); i++; continue; }
      throw new Error("Zeichen");
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
      if (!tk) throw new Error("unvollständig");
      if (tk.t === "num") { const v = tk.v; return () => v; }
      if (tk.t === "var") { const v = tk.v; return (e) => (v in e ? e[v] : NaN); }
      if (tk.t === "(") { const a = expr(); if (!peek() || peek().t !== ")") throw new Error("Klammer"); p++; return a; }
      throw new Error("Syntax");
    }
    const f = expr();
    if (p < toks.length) throw new Error("Syntax");
    return f;
  }
  const SAMPLE = [1.37, -2.11, 0.73, 3.29, -0.58, 2.47, -1.63];
  function sameFn(f, g, vars = "abcxyz") {
    for (let k = 0; k < 6; k++) {
      const env = {}; [...vars].forEach((v, i) => { env[v] = SAMPLE[(k + 2 * i) % SAMPLE.length] + 0.1 * i; });
      const u = f(env), w = g(env);
      if (!isFinite(u) || !isFinite(w) || Math.abs(u - w) > 1e-7 * Math.max(1, Math.abs(w))) return false;
    }
    return true;
  }
  // number of top-level summands of an input, e.g. "3a+2b-(a+b)" -> 3
  function countSummands(raw) {
    const s = String(raw).replace(/\s+/g, "").replace(/[−–]/g, "-");
    let depth = 0, n = 1;
    for (let i = 0; i < s.length; i++) {
      const c = s[i];
      if (c === "(") depth++; else if (c === ")") depth--;
      else if ((c === "+" || c === "-") && depth === 0 && i > 0 && !"*/^(:·×÷+-".includes(s[i - 1])) n++;
    }
    return n;
  }

  // ---------- checkers for the trainer ----------
  const check = {
    // numeric answer with relative tolerance (default 1 %)
    num(value, { tol = 0.01, abs = null, unit = "" } = {}) {
      return (raw) => {
        const v = parseNum(String(raw).replace(new RegExp(unit.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "$"), ""));
        if (isNaN(v)) return { ok: false, msg: "Bitte gib eine Zahl ein, z. B. <code>12,5</code>." };
        const lim = abs !== null ? abs : Math.max(Math.abs(value) * tol, 1e-9);
        return Math.abs(v - value) <= lim ? { ok: true } : { ok: false, msg: "Der Wert stimmt noch nicht. Prüfe Formel, Einheiten und Rechnung." };
      };
    },
    // algebraic expression, equivalent to f; optional form check and hints for typical mistakes
    expr(f, { vars = "abcxyz", form = null, hints = [], fallback = "Der Term ist noch nicht gleichwertig. Rechne Schritt für Schritt nach." } = {}) {
      return (raw) => {
        let g;
        try { g = parse(raw); } catch (e) { return { ok: false, msg: "Das kann ich nicht lesen. Prüfe Klammern und Zeichen, z. B. <code>3a+2b</code> oder <code>2x(x-3)</code>." }; }
        const eq = sameFn(g, f, vars);
        if (eq && form) { const m = form(raw); if (m) return { ok: false, msg: m }; }
        if (eq) return { ok: true };
        for (const h of hints) if (h.f && sameFn(g, h.f, vars)) return { ok: false, msg: h.msg };
        return { ok: false, msg: fallback };
      };
    }
  };

  // ---------- views (tab routing) ----------
  function views(names, onShow = {}) {
    function show() {
      const h = location.hash.slice(1);
      const v = names.includes(h) ? h : names[0];
      names.forEach((n) => { const el = $("#view-" + n); if (el) el.hidden = n !== v; });
      $$("nav.tabs a").forEach((a) => { if (a.dataset.view === v) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current"); });
      window.scrollTo({ top: 0 });
      if (onShow[v]) requestAnimationFrame(onShow[v]);
    }
    window.addEventListener("hashchange", show);
    show();
    return show;
  }

  // ---------- quiz ----------
  function quiz({ box, bar, progress, questions, n = 10, key, mathOptions = false }) {
    const B = $(box), BAR = $(bar), P = $(progress);
    const N = Math.min(n, questions.length);
    let order = [], idx = 0, score = 0, answered = false;
    function start() {
      order = shuffle(questions).slice(0, N).map((q) => { const perm = shuffle(q.o.map((_, i) => i)); return { q: q.q, o: perm.map((i) => q.o[i]), a: perm.indexOf(q.a), e: q.e }; });
      idx = 0; score = 0; render();
    }
    function render() {
      BAR.style.width = (idx / N) * 100 + "%";
      if (idx >= N) {
        const best = Math.max(score, store.get(key) || 0); store.set(key, best);
        const msg = score >= N - 1 ? "Super! Du hast das Thema sicher drauf." : score >= Math.ceil(N * 0.6) ? "Gut gemacht! Schau dir die Erklärungen zu deinen Fehlern noch einmal an." : "Wiederhole die Erklärungen und übe im Trainer. Dann klappt es beim nächsten Mal besser.";
        P.textContent = `fertig · Bestwert ${best} / ${N}`;
        B.innerHTML = `<span class="eyebrow">Ergebnis</span><div class="score-big">${score} / ${N}</div><p>${msg}</p><div class="row"><button type="button" class="primary lk-again">Neue Runde</button></div>`;
        $(".lk-again", B).addEventListener("click", start);
        return;
      }
      const q = order[idx]; answered = false;
      P.textContent = `Frage ${idx + 1} von ${N} · ${score} richtig`;
      B.innerHTML = `<div class="qtext"></div><div class="opts"></div><div class="feedback" hidden></div><div class="row"><button type="button" class="primary lk-next" hidden>${idx + 1 < N ? "Nächste Frage" : "Ergebnis anzeigen"}</button></div>`;
      $(".qtext", B).textContent = q.q;
      q.o.forEach((t, i) => {
        const b = document.createElement("button"); b.type = "button";
        b.innerHTML = `<span class="k">${"ABCD"[i]}</span><span${mathOptions ? ' class="math"' : ""}></span>`; b.lastChild.textContent = t;
        b.addEventListener("click", () => choose(i));
        $(".opts", B).appendChild(b);
      });
      $(".lk-next", B).addEventListener("click", () => { idx++; render(); });
    }
    function choose(i) {
      if (answered) return; answered = true;
      const q = order[idx];
      $$(".opts button", B).forEach((b, j) => { b.disabled = true; if (j === q.a) b.classList.add("right"); else if (j === i) b.classList.add("wrong"); });
      const ok = i === q.a; if (ok) score++;
      const fb = $(".feedback", B); fb.hidden = false;
      fb.innerHTML = ok ? '<span><b class="ok">Richtig!</b> </span>' : '<span><b class="no">Leider falsch.</b> </span>';
      fb.firstChild.appendChild(document.createTextNode(q.e));
      const nb = $(".lk-next", B); nb.hidden = false; nb.focus();
      P.textContent = `Frage ${idx + 1} von ${N} · ${score} richtig`;
    }
    start();
  }

  // ---------- trainer ----------
  const trainers = [];
  function trainer({ el, modes, id = "tr" }) {
    const root = $(el);
    root.innerHTML = `
      ${modes.length > 1 ? `<div class="modes" role="group" aria-label="Übungsart">${modes.map((m, i) => `<button type="button" data-mode="${m.id}" aria-pressed="${i === 0}">${m.label}</button>`).join("")}</div>` : ""}
      <div class="panel stack">
        <p class="small muted lk-instr"></p>
        <form class="stack lk-form" autocomplete="off">
          <div class="task lk-task"></div>
          <div class="answer-row"><label class="math lk-label" for="${id}-in"></label><input type="text" id="${id}-in" class="lk-in" spellcheck="false"></div>
          <div class="row"><button type="submit" class="primary">Prüfen</button><button type="button" class="lk-show">Lösung zeigen</button><button type="button" class="lk-new">Neue Aufgabe</button></div>
        </form>
        <p class="hint lk-hint"></p>
        <div class="feedback lk-fb" hidden aria-live="polite"></div>
        <span class="score-line lk-score"></span>
      </div>`;
    let mode = modes[0], task = null;
    const score = { right: 0, total: 0 };
    const fb = $(".lk-fb", root), input = $(".lk-in", root);
    function updateScore() { $(".lk-score", root).textContent = `${score.right} von ${score.total} Aufgaben auf Anhieb richtig`; }
    function next() {
      task = mode.gen(); task.attempted = false;
      $(".lk-instr", root).innerHTML = task.instr || mode.instr || "";
      $(".lk-task", root).innerHTML = task.html;
      $(".lk-label", root).innerHTML = task.label || "";
      input.placeholder = task.placeholder || "";
      $(".lk-hint", root).innerHTML = task.hint || mode.hint || "";
      input.value = ""; fb.hidden = true;
      return task;
    }
    function solutionHtml() { return task.solution ? `<div>${task.solution}</div>` : ""; }
    function submit(raw) {
      const r = task.check(raw);
      if (!task.attempted) { task.attempted = true; score.total++; if (r.ok) score.right++; updateScore(); }
      fb.hidden = false;
      fb.innerHTML = r.ok ? `<span><b class="ok">Richtig!</b></span>${solutionHtml()}` : `<span><b class="no">Noch nicht richtig.</b> ${r.msg || ""}</span>`;
      return r;
    }
    $(".lk-form", root).addEventListener("submit", (ev) => { ev.preventDefault(); submit(input.value); });
    $(".lk-show", root).addEventListener("click", () => {
      if (!task.attempted) { task.attempted = true; score.total++; updateScore(); }
      fb.hidden = false; fb.innerHTML = `<span>Eine mögliche Lösung: <code>${esc(task.answer)}</code></span>${solutionHtml()}`;
    });
    $(".lk-new", root).addEventListener("click", () => { next(); input.focus(); });
    $$("[data-mode]", root).forEach((b) => b.addEventListener("click", () => {
      mode = modes.find((m) => m.id === b.dataset.mode);
      $$("[data-mode]", root).forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
      next();
    }));
    next();
    const api = { modes, next, submit, get task() { return task; }, setMode(i) { mode = modes[i]; return next(); } };
    trainers.push(api);
    return api;
  }

  // ---------- prediction cards ----------
  function cards({ el, items, key }) {
    const root = $(el);
    let answers = store.get(key) || {};
    function renderAll() {
      root.innerHTML = "";
      items.forEach((c, idx) => {
        const card = document.createElement("article");
        card.className = "panel card";
        card.innerHTML = `<span class="ctx"></span><h3></h3><p class="small"></p><div class="opts"></div><div class="answer" hidden></div>`;
        $(".ctx", card).textContent = c.ctx; $("h3", card).textContent = c.title; $("p", card).textContent = c.text;
        const opts = $(".opts", card), ans = $(".answer", card);
        c.o.forEach((t, i) => {
          const b = document.createElement("button"); b.type = "button"; b.textContent = t;
          b.addEventListener("click", () => { answers[idx] = i; store.set(key, answers); paint(); });
          opts.appendChild(b);
        });
        function paint() {
          const ch = answers[idx];
          $$("button", opts).forEach((b, i) => { b.classList.remove("right", "wrong"); b.disabled = ch !== undefined; if (ch !== undefined) { if (i === c.a) b.classList.add("right"); else if (i === ch) b.classList.add("wrong"); } });
          if (ch !== undefined) { ans.hidden = false; ans.innerHTML = ch === c.a ? '<b class="ok">Richtig.</b> ' : '<b class="no">Nicht ganz.</b> '; ans.appendChild(document.createTextNode(c.e)); }
          else ans.hidden = true;
        }
        root.appendChild(card); paint();
      });
    }
    renderAll();
    return { reset() { answers = {}; store.set(key, answers); renderAll(); } };
  }

  // ---------- equation lab (equations and inequalities) ----------
  const REL_FLIP = { "<": ">", ">": "<", "≤": "≥", "≥": "≤", "=": "=" };
  function equationLab({ el, gen, inequality = false }) {
    const root = $(el);
    root.innerHTML = `
      <div class="panel stack">
        <div class="lab-eq lk-eq" aria-live="polite"></div>
        <ol class="lab-log lk-log"></ol>
        <form class="answer-row lk-form" autocomplete="off">
          <label for="${el.slice(1)}-op" class="small"><strong>Umformung für beide Seiten:</strong></label>
          <input type="text" id="${el.slice(1)}-op" class="lk-op" placeholder="z. B. −3 oder −2x oder :4" spellcheck="false">
          <button type="submit" class="primary">Ausführen</button>
        </form>
        <p class="hint">Schreibweise: <code>-3</code>, <code>+5</code>, <code>-2x</code>, <code>+x</code>, <code>:4</code>, <code>*2</code>, <code>:(-3)</code>. Brüche als <code>1/2</code>.</p>
        <p class="lab-msg lk-msg" aria-live="polite"></p>
        <div class="row"><button type="button" class="lk-undo">Rückgängig</button><button type="button" class="lk-new">Neue ${inequality ? "Ungleichung" : "Gleichung"}</button></div>
      </div>`;
    let hist = [], st = null;
    const eqHtml = (s) => `${linHtml(s.L.x, s.L.c)} ${s.rel} ${linHtml(s.R.x, s.R.c)}`;
    function setMsg(t, cls = "") { const m = $(".lk-msg", root); m.className = "lab-msg lk-msg " + cls; m.innerHTML = t; }
    function render() {
      $(".lk-eq", root).innerHTML = eqHtml(st);
      // the operation is written next to the line it is applied to (school notation)
      $(".lk-log", root).innerHTML = hist.map((h, i) => { const nx = hist[i + 1]; return `<li class="${nx && nx.flip ? "flip" : ""}"><span>${eqHtml(h.s)}</span><span class="op">${nx ? "| " + esc(nx.op) : ""}</span></li>`; }).join("");
      const s = st, xL = !s.L.x.isZero(), xR = !s.R.x.isZero();
      if (!xL && !xR) {
        const l = s.L.c.val(), r = s.R.c.val();
        const truth = { "=": l === r, "<": l < r, ">": l > r, "≤": l <= r, "≥": l >= r }[s.rel];
        setMsg(truth ? "Die Variable ist verschwunden und die Aussage ist immer wahr: Jede Zahl ist eine Lösung (L = ℚ)." : "Die Variable ist verschwunden und die Aussage ist falsch: Es gibt keine Lösung (L = { }).", "ok");
        return;
      }
      const solvedL = s.L.x.eq(1) && s.L.c.isZero() && !xR, solvedR = s.R.x.eq(1) && s.R.c.isZero() && !xL;
      if (solvedL || solvedR) {
        const v = solvedL ? s.R.c : s.L.c, rel = solvedL ? s.rel : REL_FLIP[s.rel];
        setMsg(inequality && rel !== "=" ? `Gelöst! Alle Zahlen mit <span class="math"><i>x</i> ${rel} ${v.html()}</span> erfüllen die Ungleichung: <span class="math">L = {<i>x</i> | <i>x</i> ${rel} ${v.html()}}</span>` : `Gelöst! <span class="math"><i>x</i> = ${v.html()}</span>, also <span class="math">L = {${v.html()}}</span>. Mach zur Sicherheit die Probe.`, "ok");
      } else setMsg("Forme weiter um, bis <i>x</i> allein auf einer Seite steht.");
    }
    function start(s) { st = s || gen(); hist = [{ s: st, op: "" }]; render(); }
    function apply(raw) {
      let s = String(raw).replace(/\s+/g, "").replace(/[−–]/g, "-").replace(/[·⋅×]/g, "*").replace(/[÷/]/g, (m, i) => (i === 0 ? ":" : m)).replace(/^\//, ":");
      const m = s.match(/^([+\-*:])\(?(-?)(\d*(?:[.,]\d+)?(?:\/\d+)?)(x?)\)?$/);
      if (!m || (m[3] === "" && m[4] === "")) { setMsg("Das verstehe ich nicht. Beginne mit + − * oder :, z. B. <code>-3</code> oder <code>:2</code>.", "no"); return false; }
      const [, op, sg, numTxt, hasX] = m;
      let k; try { k = R.of(numTxt === "" ? 1 : parseNum(numTxt)); if (numTxt.includes("/")) { const [a, b] = numTxt.split("/").map(Number); k = new R(a, b); } } catch (e) { setMsg("Ungültige Zahl.", "no"); return false; }
      if (sg) k = k.neg();
      const next = { L: { ...st.L }, R: { ...st.R }, rel: st.rel };
      let flip = false;
      const label = `${op === "*" ? "·" : op === ":" ? ":" : op === "-" ? "−" : "+"}${op === "*" || op === ":" ? (k.sign() < 0 ? `(${k.text().replace("-", "−")})` : k.text()) : (k.sign() < 0 ? `(${k.text().replace("-", "−")})` : k.text())}${hasX ? "x" : ""}`.replace(/^([+−])1x$/, "$1x");
      if (op === "+" || op === "-") {
        const kk = op === "-" ? k.neg() : k;
        for (const side of ["L", "R"]) { if (hasX) next[side].x = next[side].x.add(kk); else next[side].c = next[side].c.add(kk); }
      } else {
        if (hasX) { setMsg("Mit <i>x</i> malnehmen oder durch <i>x</i> teilen ist keine erlaubte Umformung, weil <i>x</i> null sein könnte.", "no"); return false; }
        if (k.isZero()) { setMsg(op === ":" ? "Durch 0 darf man nicht teilen." : "Mal 0 macht beide Seiten zu 0. Dabei geht die Information verloren, das ist keine Äquivalenzumformung.", "no"); return false; }
        for (const side of ["L", "R"]) {
          next[side].x = op === "*" ? next[side].x.mul(k) : next[side].x.div(k);
          next[side].c = op === "*" ? next[side].c.mul(k) : next[side].c.div(k);
        }
        if (inequality && k.sign() < 0 && next.rel !== "=") { next.rel = REL_FLIP[next.rel]; flip = true; }
      }
      st = next; hist.push({ s: st, op: label + (flip ? "  Zeichen umdrehen!" : ""), flip }); render();
      if (flip) setMsg("Achtung: Du hast mit einer negativen Zahl multipliziert oder durch sie geteilt. Deshalb dreht sich das Ungleichheitszeichen um! " + $(".lk-msg", root).innerHTML, "no");
      return true;
    }
    $(".lk-form", root).addEventListener("submit", (ev) => { ev.preventDefault(); const i = $(".lk-op", root); if (apply(i.value)) i.value = ""; i.focus(); });
    $(".lk-undo", root).addEventListener("click", () => { if (hist.length > 1) { hist.pop(); st = hist[hist.length - 1].s; render(); } });
    $(".lk-new", root).addEventListener("click", () => start());
    start();
    return { apply, start, get state() { return st; } };
  }
  // random linear equation a x + b (rel) c x + d with a "nice" solution
  function genLinear({ rel = "=", fractions = false } = {}) {
    let a, c; do { a = nz(-6, 7); c = rnd(-4, 4); } while (a === c);
    const x0 = fractions ? new R(nz(-9, 9), pick([1, 2, 3])) : new R(nz(-6, 6));
    const b = R.of(rnd(-9, 9)), d = x0.mul(a - c).add(b);
    return { L: { x: R.of(a), c: b }, R: { x: R.of(c), c: d }, rel, x0 };
  }

  // number as plain answer text with decimal comma, e.g. 1013,25
  const numText = (v, d = 2) => String(Math.round(v * 10 ** d) / 10 ** d || 0).replace(".", ",");

  window.LK = { $, $$, store, rnd, pick, nz, shuffle, gcd, esc, minus, frac, fmt, parseNum, numText, R, linHtml, poly, polyFn, collect, monoParts, parse, sameFn, countSummands, check, views, quiz, trainer, trainers, cards, equationLab, genLinear, REL_FLIP };
})();
