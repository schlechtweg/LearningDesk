(function () {
  "use strict";
  const { $, $$, rnd, pick, nz, gcd, poly, polyFn, collect, check, parse, sameFn } = LK;
  const X = (e) => ({ x: e });

  // ---------- area model ----------
  let model = 1;
  const vals = { a: 3, b: 5, c: 2, d: 4 };
  function controls() {
    const keys = model === 1 ? ["a", "b", "c"] : ["a", "b", "c", "d"];
    $("#areaControls").innerHTML = keys.map((k) => `<div><label class="lbl" for="sl-${k}"><span><i>${k}</i></span><span class="val" id="out-${k}">${vals[k]}</span></label><input type="range" id="sl-${k}" min="1" max="8" step="1" value="${vals[k]}"></div>`).join("") + '<dl class="readout" id="areaRo"></dl>';
    keys.forEach((k) => $("#sl-" + k).addEventListener("input", (e) => { vals[k] = +e.target.value; $("#out-" + k).textContent = vals[k]; draw(); }));
  }
  function draw() {
    const { a, b, c, d } = vals, svg = $("#areaSvg");
    const W = 360, H = 260, ox = 46, oy = 34;
    const lab = (x, y, t, cls = "area-label", size = 20) => `<text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="middle" class="${cls}" font-size="${size}">${t}</text>`;
    if (model === 1) {
      const u = Math.min(W / (b + c), H / a), w1 = b * u, w2 = c * u, h = a * u;
      svg.innerHTML = `<rect x="${ox}" y="${oy}" width="${w1}" height="${h}" class="area-b"/><rect x="${ox + w1}" y="${oy}" width="${w2}" height="${h}" class="area-c"/>
        ${lab(ox + w1 / 2, oy - 14, "b")}${lab(ox + w1 + w2 / 2, oy - 14, "c")}${lab(ox - 16, oy + h / 2, "a")}
        ${lab(ox + w1 / 2, oy + h / 2 - 10, "a·b")}${lab(ox + w1 / 2, oy + h / 2 + 14, `= ${a * b}`, "area-num")}
        ${w2 > 34 ? lab(ox + w1 + w2 / 2, oy + h / 2 - 10, "a·c") + lab(ox + w1 + w2 / 2, oy + h / 2 + 14, `= ${a * c}`, "area-num") : ""}`;
      $("#areaRo").innerHTML = `<dt>a · (b + c) = ${a} · ${b + c}</dt><dd class="big">${a * (b + c)}</dd><dt>a·b + a·c = ${a * b} + ${a * c}</dt><dd class="big">${a * b + a * c}</dd>`;
      $("#areaText").innerHTML = `Das ganze Rechteck hat die Fläche <span class="math">${a}·(${b} + ${c}) = ${a * (b + c)}</span>. Die beiden Teilrechtecke haben zusammen <span class="math">${a}·${b} + ${a}·${c} = ${a * b + a * c}</span>. Gleich groß! Deshalb gilt <span class="math"><i>a</i>(<i>b</i> + <i>c</i>) = <i>ab</i> + <i>ac</i></span>.`;
    } else {
      const u = Math.min(W / (c + d), H / (a + b)), wc = c * u, wd = d * u, ha = a * u, hb = b * u;
      const cell = (x, y, w, h, cls, t, v) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" class="${cls}"/>${w > 34 && h > 34 ? lab(x + w / 2, y + h / 2 - 9, t, "area-label", 17) + lab(x + w / 2, y + h / 2 + 12, `= ${v}`, "area-num") : ""}`;
      svg.innerHTML = cell(ox, oy, wc, ha, "area-a", "a·c", a * c) + cell(ox + wc, oy, wd, ha, "area-b", "a·d", a * d) + cell(ox, oy + ha, wc, hb, "area-c", "b·c", b * c) + cell(ox + wc, oy + ha, wd, hb, "area-d", "b·d", b * d)
        + lab(ox + wc / 2, oy - 14, "c") + lab(ox + wc + wd / 2, oy - 14, "d") + lab(ox - 16, oy + ha / 2, "a") + lab(ox - 16, oy + ha + hb / 2, "b");
      const sum = a * c + a * d + b * c + b * d;
      $("#areaRo").innerHTML = `<dt>(a + b)(c + d) = ${a + b} · ${c + d}</dt><dd class="big">${(a + b) * (c + d)}</dd><dt>ac + ad + bc + bd</dt><dd class="big">${sum}</dd>`;
      $("#areaText").innerHTML = `Vier Teilrechtecke: <span class="math">${a * c} + ${a * d} + ${b * c} + ${b * d} = ${sum}</span>. Das ist genau <span class="math">(${a} + ${b})·(${c} + ${d}) = ${(a + b) * (c + d)}</span>. Jeder Teil der einen Seite trifft auf jeden Teil der anderen Seite: „jeder mit jedem“.`;
    }
  }
  $$("[data-model]").forEach((btn) => btn.addEventListener("click", () => {
    model = +btn.dataset.model; $$("[data-model]").forEach((x) => x.setAttribute("aria-pressed", String(x === btn))); controls(); draw();
  }));

  // ---------- trainer ----------
  const lin = (a, b) => [{ c: a, v: { x: 1 } }, { c: b, v: {} }];
  const paren = (terms) => `(${poly(terms).html})`;
  const noParen = (raw) => (/[()]/.test(raw) ? "Das stimmt, aber löse die Klammern vollständig auf und fasse zusammen." : null);
  function genSimple() {
    const k = pick([nz(-9, 9), -1]), a = rnd(1, 6), b = nz(-9, 9);
    const res = [{ c: k * a, v: { x: 1 } }, { c: k * b, v: {} }];
    const kTxt = k === -1 ? "−" : k < 0 ? `(${k})`.replace("-", "−") + "·" : `${k}·`;
    return {
      html: `<span class="math">${kTxt}${paren(lin(a, b))}</span>`, label: "=", placeholder: "z. B. 8x - 12",
      answer: poly(res).text, check: check.expr(polyFn(res), { vars: "x", form: noParen, hints: [
        { f: polyFn([{ c: k * a, v: { x: 1 } }, { c: b, v: {} }]), msg: "Du hast nur den ersten Summanden malgenommen. Der Faktor vor der Klammer gilt für <strong>alle</strong> Summanden." },
        { f: polyFn([{ c: k * a, v: { x: 1 } }, { c: -k * b, v: {} }]), msg: "Achte auf das Vorzeichen beim zweiten Summanden: Minus mal Minus ergibt Plus." }] }),
      solution: `<span class="math">${k === -1 ? "−1" : k}·${poly([{ c: a, v: { x: 1 } }]).html} = ${poly([res[0]]).html}</span> und <span class="math">${k === -1 ? "−1" : k}·${b < 0 ? "(" + b + ")" : b} = ${poly([res[1]]).html}</span>, also <span class="math">${poly(res).html}</span>`.replace(/-/g, "−")
    };
  }
  function genDouble() {
    const a = pick([1, 1, 2, 3]), b = nz(-9, 9), c = pick([1, 1, 2]), d = nz(-9, 9);
    const res = collect([{ c: a * c, v: { x: 2 } }, { c: a * d, v: { x: 1 } }, { c: b * c, v: { x: 1 } }, { c: b * d, v: {} }]);
    const raw = [{ c: a * c, v: { x: 2 } }, { c: a * d, v: { x: 1 } }, { c: b * c, v: { x: 1 } }, { c: b * d, v: {} }];
    return {
      html: `<span class="math">${paren(lin(a, b))}${paren(lin(c, d))}</span>`, label: "=", placeholder: "z. B. x^2 + 7x + 10",
      answer: poly(res).text, check: check.expr(polyFn(res), { vars: "x", form: (r) => (/[()]/.test(r) ? "Das stimmt, aber löse die Klammern auf." : LK.countSummands(r) > res.length ? "Fast! Fasse noch die gleichartigen Terme zusammen." : null), hints: [
        { f: polyFn([{ c: a * c, v: { x: 2 } }, { c: b * d, v: {} }]), msg: "Es fehlen die gemischten Produkte. Rechne „jeder mit jedem“: vier Produkte." }] }),
      solution: `Jeder mit jedem: <span class="math">${poly(raw).html}</span>. Zusammenfassen: <span class="math">${poly(res).html}</span>`
    };
  }
  function genFactor() {
    const withX = Math.random() < 0.4;
    let p, q; do { p = rnd(1, 7); q = nz(-9, 9); } while (gcd(p, q) !== 1);
    const g = rnd(2, 8) * (withX ? pick([1, 1, 2]) : 1);
    const fac = withX ? [{ c: g, v: { x: 1 } }] : [{ c: g, v: {} }];
    const inner = withX ? [{ c: p, v: { x: 1 } }, { c: q, v: {} }] : [{ c: p, v: { x: 1 } }, { c: q, v: {} }];
    const sum = withX ? [{ c: g * p, v: { x: 2 } }, { c: g * q, v: { x: 1 } }] : [{ c: g * p, v: { x: 1 } }, { c: g * q, v: {} }];
    const facF = polyFn(fac);
    const form = (raw) => {
      const s = raw.replace(/\s+/g, "");
      const i = s.indexOf("(");
      if (i < 0) return "Das ist noch keine Klammer. Schreibe das Ergebnis als Produkt, z. B. <code>3(2x+3)</code>.";
      const pre = s.slice(0, i).replace(/[*·×]$/, "");
      if (!pre || pre === "+") return "Vor der Klammer muss der gemeinsame Faktor stehen.";
      let pf; try { pf = parse(pre === "-" ? "-1" : pre); } catch (e) { return "Schreibe den gemeinsamen Faktor vor die Klammer."; }
      if (sameFn(pf, facF, "x") || sameFn(pf, (e) => -facF(e), "x")) return null;
      return "Richtig umgeformt, aber du kannst noch mehr ausklammern. Suche den <strong>größten</strong> gemeinsamen Faktor.";
    };
    return {
      html: `<span class="math">${poly(sum).html}</span>`, label: "=", placeholder: withX ? "z. B. 2x(2x - 3)" : "z. B. 3(2x + 3)",
      instr: "Klammere den größten gemeinsamen Faktor aus.",
      answer: `${poly(fac).text}(${poly(inner).text})`, check: check.expr(polyFn(sum), { vars: "x", form }),
      solution: `Größter gemeinsamer Faktor: <span class="math">${poly(fac).html}</span>. Ergebnis: <span class="math">${poly(fac).html}·(${poly(inner).html})</span>. Probe: ausmultiplizieren ergibt wieder <span class="math">${poly(sum).html}</span>.`
    };
  }
  LK.trainer({ el: "#trainer", modes: [
    { id: "einfach", label: "Zahl mal Klammer", gen: genSimple, instr: "Multipliziere aus.", hint: "Schreibweise: <code>8x-12</code>, <code>x^2</code> für x²." },
    { id: "doppelt", label: "Klammer mal Klammer", gen: genDouble, instr: "Multipliziere aus und fasse zusammen.", hint: "Schreibweise: <code>x^2+7x+10</code>." },
    { id: "ausklammern", label: "Ausklammern", gen: genFactor, hint: "Schreibweise: <code>3(2x+3)</code> oder <code>2x(2x-3)</code>." }
  ] });

  // ---------- quiz ----------
  LK.quiz({ box: "#quizBox", bar: "#qBar", progress: "#qProgress", key: "ausmult.best", n: 10, questions: [
    { q: "5·(x + 3) = ?", o: ["5x + 3", "5x + 15", "x + 15", "5x + 8"], a: 1, e: "Die 5 wird mit beiden Summanden malgenommen: 5·x + 5·3." },
    { q: "−(x − 7) = ?", o: ["−x − 7", "−x + 7", "x + 7", "x − 7"], a: 1, e: "Minus vor der Klammer dreht alle Vorzeichen um." },
    { q: "−3·(2x − 4) = ?", o: ["−6x − 12", "−6x + 12", "6x − 12", "−6x − 4"], a: 1, e: "−3·2x = −6x und −3·(−4) = +12." },
    { q: "(x + 3)(x + 4) = ?", o: ["x² + 12", "x² + 7x + 12", "x² + 7x + 7", "2x + 7"], a: 1, e: "Jeder mit jedem: x² + 4x + 3x + 12 = x² + 7x + 12." },
    { q: "(x − 2)(x + 5) = ?", o: ["x² + 3x − 10", "x² − 3x − 10", "x² + 3x + 10", "x² − 10"], a: 0, e: "x² + 5x − 2x − 10 = x² + 3x − 10." },
    { q: "Wie viele Produkte entstehen bei (a + b)(c + d)?", o: ["2", "3", "4", "6"], a: 2, e: "Jeder der 2 Teile trifft auf jeden der 2 Teile: 2 · 2 = 4." },
    { q: "Klammere aus: 8x + 12", o: ["2(4x + 6)", "4(2x + 3)", "8(x + 12)", "4(2x + 12)"], a: 1, e: "Der größte gemeinsame Faktor von 8 und 12 ist 4." },
    { q: "Klammere aus: 5x² − 10x", o: ["5(x² − 10x)", "5x(x − 2)", "x(5x − 10)", "5x(x − 10)"], a: 1, e: "Gemeinsam sind 5 und x. 5x² : 5x = x und −10x : 5x = −2." },
    { q: "Klammere aus: 7x + 7", o: ["7(x + 7)", "7x", "7(x + 1)", "7(x + 0)"], a: 2, e: "7 : 7 = 1. Die 1 darf in der Klammer nicht fehlen." },
    { q: "Was ist die Probe beim Ausklammern?", o: ["Das Ergebnis wieder ausmultiplizieren", "Die Zahlen addieren", "Eine Zahl für x einsetzen geht nicht", "Es gibt keine Probe"], a: 0, e: "Ausmultiplizieren muss wieder den Ausgangsterm ergeben." },
    { q: "2x·(3x + 1) = ?", o: ["6x + 2x", "6x² + 2x", "6x² + 1", "5x² + 2x"], a: 1, e: "2x·3x = 6x² und 2x·1 = 2x." },
    { q: "Wie heißt das Gesetz a(b + c) = ab + ac?", o: ["Kommutativgesetz", "Assoziativgesetz", "Distributivgesetz", "Potenzgesetz"], a: 2, e: "Distributivgesetz: Der Faktor wird auf alle Summanden „verteilt“." }
  ] });

  LK.views(["verstehen", "modell", "ueben", "quiz"], { modell: () => { controls(); draw(); } });
})();
