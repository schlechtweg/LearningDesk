(function () {
  "use strict";
  const { $, rnd, pick, nz, R, linHtml, check } = LK;
  const eq = (L, Rt) => `${linHtml(L.x, L.c)} = ${linHtml(Rt.x, Rt.c)}`;
  const opTxt = (sym, k, withX = false) => {
    const neg = k.sign() < 0, body = (withX && k.abs().eq(1) ? "" : k.abs().html()) + (withX ? "<i>x</i>" : "");
    if (sym === "+" || sym === "−") return `| ${neg ? (sym === "+" ? "−" : "+") : sym}${body}`;
    return `| ${sym}${neg ? "(−" + k.abs().html() + ")" : k.abs().html()}`;
  };
  // step-by-step solution of a x + b = c x + d (all R)
  function steps(L, Rt, pre = []) {
    const rows = [...pre];
    let l = { ...L }, r = { ...Rt };
    if (!r.x.isZero()) { rows.push([eq(l, r), opTxt("−", r.x, true)]); l = { x: l.x.sub(r.x), c: l.c }; r = { x: R.of(0), c: r.c }; }
    if (!l.c.isZero()) { rows.push([eq(l, r), opTxt("−", l.c)]); r = { x: r.x, c: r.c.sub(l.c) }; l = { x: l.x, c: R.of(0) }; }
    if (!l.x.eq(1)) { rows.push([eq(l, r), opTxt(":", l.x)]); r = { x: r.x, c: r.c.div(l.x) }; l = { x: R.of(1), c: R.of(0) }; }
    rows.push([eq(l, r), ""]);
    return { rows, x: r.c };
  }
  const table = (rows) => `<table class="data steps-table">${rows.map(([a, b]) => `<tr><td class="math">${a}</td><td>${b}</td></tr>`).join("")}</table>`;
  const val = (L, x) => L.x.mul(x).add(L.c);
  function task(html, L, Rt, x0, pre = [], probeFn = null) {
    const s = steps(L, Rt, pre);
    const lhs = probeFn ? probeFn.l(x0) : val(L, x0), rhs = probeFn ? probeFn.r(x0) : val(Rt, x0);
    return {
      meta: { lhs: probeFn ? probeFn.l : (x) => val(L, x), rhs: probeFn ? probeFn.r : (x) => val(Rt, x), x0 },
      html: `<span class="math">${html}</span>`, label: "<i>x</i> =", placeholder: "z. B. 4 oder 7/2", answer: x0.text(),
      check: (raw) => {
        const v = LK.parseNum(raw);
        if (isNaN(v)) return { ok: false, msg: "Gib eine Zahl ein, z. B. <code>4</code>, <code>-7</code> oder <code>7/2</code>." };
        if (Math.abs(v - x0.val()) < 1e-9) return { ok: true };
        if (Math.abs(v + x0.val()) < 1e-9) return { ok: false, msg: "Fast: Das Vorzeichen stimmt nicht. Mach die Probe!" };
        return { ok: false, msg: "Das ist nicht die Lösung. Setze deine Zahl zur Probe ein: Sind beide Seiten gleich?" };
      },
      solution: table(s.rows) + `<p class="small">Probe mit <span class="math"><i>x</i> = ${x0.html()}</span>: links <span class="math">${lhs.html()}</span>, rechts <span class="math">${rhs.html()}</span> ✓</p>`
    };
  }
  function genEasy() {
    const a = nz(-9, 9), b = nz(-12, 12), x0 = R.of(nz(-9, 9));
    const L = { x: R.of(a), c: R.of(b) }, Rt = { x: R.of(0), c: x0.mul(a).add(b) };
    return task(eq(L, Rt), L, Rt, x0);
  }
  function genBoth() {
    const g = LK.genLinear();
    return task(eq(g.L, g.R), g.L, g.R, g.x0);
  }
  function genBracket() {
    for (;;) {
      const k = nz(-5, 6), a = pick([1, 1, 2, 3]), b = nz(-6, 6), c = rnd(-4, 4), x0 = new R(nz(-8, 8), pick([1, 1, 1, 2]));
      if (k * a === c) continue;
      const lhsV = x0.mul(a).add(b).mul(k), d = lhsV.sub(x0.mul(c));
      if (d.d !== 1) continue;
      const L = { x: R.of(k * a), c: R.of(k * b) }, Rt = { x: R.of(c), c: d };
      const kTxt = k === 1 ? "" : k === -1 ? "−" : String(k).replace("-", "−");
      const html = `${kTxt}(${linHtml(a, b)}) = ${linHtml(Rt.x, Rt.c)}`;
      return task(html, L, Rt, x0, [[html, "Klammer auflösen"]], { l: (x) => x.mul(a).add(b).mul(k), r: (x) => val(Rt, x) });
    }
  }
  LK.trainer({ el: "#trainer", modes: [
    { id: "einfach", label: "Einfach", gen: genEasy, instr: "Löse die Gleichung." },
    { id: "beidseitig", label: "x auf beiden Seiten", gen: genBoth, instr: "Löse die Gleichung. Bringe zuerst alle x-Terme auf eine Seite." },
    { id: "klammern", label: "Mit Klammern", gen: genBracket, instr: "Löse die Gleichung. Löse zuerst die Klammer auf." }
  ] });

  LK.equationLab({ el: "#lab", gen: () => LK.genLinear() });

  LK.quiz({ box: "#quizBox", bar: "#qBar", progress: "#qProgress", key: "gleichungen.best", n: 10, questions: [
    { q: "Was ist die Lösung von x + 7 = 12?", o: ["19", "5", "−5", "7"], a: 1, e: "| −7: x = 5." },
    { q: "Was ist die Lösung von 4x = 28?", o: ["24", "32", "7", "112"], a: 2, e: "| :4: x = 7." },
    { q: "Welche Umformung ist NICHT erlaubt?", o: ["Auf beiden Seiten 3 abziehen", "Beide Seiten mal 0 nehmen", "Beide Seiten durch 5 teilen", "Auf beiden Seiten 2x addieren"], a: 1, e: "Mal 0 macht beide Seiten zu 0, dabei geht die Gleichung verloren." },
    { q: "Was ist die Lösung von 3x − 4 = 11?", o: ["5", "7/3", "15", "−5"], a: 0, e: "| +4: 3x = 15, | :3: x = 5." },
    { q: "Was ist der erste sinnvolle Schritt bei 5x + 2 = 3x + 10?", o: ["| :5", "| −3x", "| +2", "| ·3"], a: 1, e: "Erst alle x-Terme auf eine Seite bringen: 2x + 2 = 10." },
    { q: "Was ist die Lösung von 5x + 2 = 3x + 10?", o: ["4", "6", "2", "−4"], a: 0, e: "2x + 2 = 10, 2x = 8, x = 4." },
    { q: "Was ist die Lösung von 2(x − 1) = 10?", o: ["4", "5", "6", "11/2"], a: 2, e: "2x − 2 = 10, 2x = 12, x = 6." },
    { q: "Was ist die Lösung von −x = 8?", o: ["8", "−8", "1/8", "0"], a: 1, e: "| ·(−1): x = −8." },
    { q: "Was bedeutet es, wenn am Ende 0 = 4 herauskommt?", o: ["x = 4", "x = 0", "Es gibt keine Lösung", "Jede Zahl ist Lösung"], a: 2, e: "Die Aussage 0 = 4 ist immer falsch. L = { }." },
    { q: "Was bedeutet es, wenn am Ende 0 = 0 herauskommt?", o: ["x = 0", "Es gibt keine Lösung", "Jede Zahl ist Lösung", "Man hat sich verrechnet"], a: 2, e: "0 = 0 ist immer wahr. Jede Zahl erfüllt die Gleichung, L = ℚ." },
    { q: "Wie macht man die Probe?", o: ["Die Lösung in die Ausgangsgleichung einsetzen", "Die Gleichung noch einmal abschreiben", "Das Ergebnis mal 2 nehmen", "Beide Seiten addieren"], a: 0, e: "Sind beide Seiten dann gleich groß, stimmt die Lösung." },
    { q: "Was ist die Lösung von 2x + 3 = 6?", o: ["1,5", "4,5", "3", "9"], a: 0, e: "2x = 3, x = 3/2 = 1,5. Lösungen müssen nicht ganzzahlig sein." }
  ] });

  LK.views(["verstehen", "werkstatt", "ueben", "quiz"]);
})();
