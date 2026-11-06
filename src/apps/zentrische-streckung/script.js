(function () {
  "use strict";
  const { $, $$, pick, rnd, fmt } = LK;
  const d = (v, p = 2) => fmt(v, p).replace(".", ",").replace("-", "−");

  // ---------- simulation ----------
  const W = 460, H = 340;
  const tri = [[11, 9], [14, 10], [12, 7]];
  let Z = [7, 8.5], k = 1.5;
  const svg = $("#zSvg");
  // view window in units; grows so that original, image and Z always fit
  let V = { x0: 0, y0: 0, U: 20 }, drag = false;
  function fit(pts) {
    let x0 = 0, x1 = 23, y0 = 0, y1 = 17;
    pts.forEach((p) => { x0 = Math.min(x0, p[0] - 1.5); x1 = Math.max(x1, p[0] + 1.5); y0 = Math.min(y0, p[1] - 1.5); y1 = Math.max(y1, p[1] + 1.5); });
    const U = Math.min(W / (x1 - x0), H / (y1 - y0));
    V = { x0: x0 - (W / U - (x1 - x0)) / 2, y0: y0 - (H / U - (y1 - y0)) / 2, U };
  }
  const px = (p) => [(p[0] - V.x0) * V.U, H - (p[1] - V.y0) * V.U];
  const img = (p) => [Z[0] + k * (p[0] - Z[0]), Z[1] + k * (p[1] - Z[1])];
  const len = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
  const area = (t) => Math.abs((t[1][0] - t[0][0]) * (t[2][1] - t[0][1]) - (t[2][0] - t[0][0]) * (t[1][1] - t[0][1])) / 2;
  function draw() {
    const T = tri.map(img);
    if (!drag) fit([Z, ...tri, ...T]);
    let g = "";
    for (let x = Math.ceil(V.x0); x <= V.x0 + W / V.U; x++) { const q = px([x, 0])[0]; g += `<line class="gl" x1="${q}" y1="0" x2="${q}" y2="${H}"/>`; }
    for (let y = Math.ceil(V.y0); y <= V.y0 + H / V.U; y++) { const q = px([0, y])[1]; g += `<line class="gl" x1="0" y1="${q}" x2="${W}" y2="${q}"/>`; }
    const zp = px(Z);
    tri.forEach((p, i) => { const a = px(Z), far = px(Math.abs(k) > 1 || k < 0 ? T[i] : p); g += `<line class="ray" x1="${a[0]}" y1="${a[1]}" x2="${far[0]}" y2="${far[1]}"/>`; if (k < 0) { const e = px(p); g += `<line class="ray" x1="${a[0]}" y1="${a[1]}" x2="${e[0]}" y2="${e[1]}"/>`; } });
    const poly = (t, c) => `<polygon class="${c}" points="${t.map((p) => px(p).join(",")).join(" ")}"/>`;
    g += poly(tri, "orig") + poly(T, "img");
    "ABC".split("").forEach((n, i) => { const p = px(tri[i]), q = px(T[i]); g += `<text class="pl" x="${p[0] + 6}" y="${p[1] - 6}">${n}</text><text class="pl" x="${q[0] + 6}" y="${q[1] - 6}">${n}′</text>`; });
    g += `<circle class="z" id="zDot" cx="${zp[0]}" cy="${zp[1]}" r="8"/><text class="pl" x="${zp[0] - 18}" y="${zp[1] - 10}">Z</text>`;
    svg.innerHTML = g;
    $("#kVal").innerHTML = `<i>k</i> = ${d(k)}`;
    const ab = len(tri[0], tri[1]), ab2 = len(T[0], T[1]), za = len(Z, tri[0]), za2 = len(Z, T[0]);
    $("#zFacts").innerHTML = `<tr><td>|ZA|</td><td>${d(za)} LE</td></tr><tr><td>|ZA′|</td><td>${d(za2)} LE</td></tr><tr><td>|AB|</td><td>${d(ab)} LE</td></tr><tr><td>|A′B′|</td><td>${d(ab2)} LE</td></tr><tr><td>|A′B′| : |AB|</td><td>${d(ab ? ab2 / ab : 0)}</td></tr><tr><td>Fläche A′B′C′ : ABC</td><td>${d(area(T) / area(tri))}</td></tr>`;
    const a = Math.abs(k);
    $("#zText").innerHTML = k === 0 ? "Bei <i>k</i> = 0 fällt alles auf <i>Z</i>: keine echte Streckung." :
      `${a > 1 ? "Vergrößerung" : a < 1 ? "Verkleinerung" : "Gleich groß (kongruent)"}${k < 0 ? ", das Bild liegt auf der anderen Seite von <i>Z</i> und steht auf dem Kopf" : ""}. Alle Längen ×${d(a)}, die Fläche ×${d(k * k)} (= ${d(a)}²).`;
  }
  $("#kR").addEventListener("input", (e) => { k = +e.target.value; draw(); });
  $$("[data-k]").forEach((b) => b.addEventListener("click", () => { k = +b.dataset.k; $("#kR").value = k; draw(); }));
  const toUnits = (ev) => { const r = svg.getBoundingClientRect(); const x = (ev.clientX - r.left) / r.width * W, y = (ev.clientY - r.top) / r.height * H; return [Math.round((x / V.U + V.x0) * 2) / 2, Math.round(((H - y) / V.U + V.y0) * 2) / 2]; };
  svg.addEventListener("pointerdown", (e) => { if (e.target.id === "zDot") { drag = true; svg.setPointerCapture(e.pointerId); } });
  svg.addEventListener("pointermove", (e) => { if (!drag) return; const p = toUnits(e); Z = [Math.min(22, Math.max(1, p[0])), Math.min(16, Math.max(1, p[1]))]; draw(); });
  svg.addEventListener("pointerup", () => { drag = false; draw(); });
  draw();

  // ---------- trainer ----------
  const ks = [0.5, 1.5, 2, 2.5, 3, 0.25, 0.75, 4, 1.25];
  function genK() { const kk = pick(ks), a = pick([2, 3, 4, 5, 6, 8]); return { html: `|ZP| = ${d(a)} cm, |ZP′| = ${d(a * kk)} cm. Bestimme den Streckfaktor <i>k</i> (positiv).`, label: "<i>k</i> =", placeholder: "z. B. 1,5", answer: d(kk), check: LK.check.num(kk, { abs: 1e-6 }), solution: `<i>k</i> = ${d(a * kk)} : ${d(a)} = <b>${d(kk)}</b>`, hint: "Bildlänge geteilt durch Originallänge." }; }
  function genBild() { const kk = pick(ks.concat([-1, -2, -0.5])), a = pick([2, 3, 4, 6, 8, 10]); return { html: `Eine Strecke ist ${d(a)} cm lang. Wie lang ist ihre Bildstrecke bei <i>k</i> = ${d(kk)}?`, label: "Länge in cm:", placeholder: "", answer: d(Math.abs(kk) * a), check: LK.check.num(Math.abs(kk) * a, { abs: 1e-6 }), solution: `|${d(kk)}| · ${d(a)} cm = <b>${d(Math.abs(kk) * a)} cm</b>`, hint: "Längen werden mit |k| multipliziert, sie sind nie negativ." }; }
  function genOrig() { const kk = pick(ks), a = pick([2, 3, 4, 6, 8]); return { html: `Nach einer Streckung mit <i>k</i> = ${d(kk)} ist die Bildstrecke ${d(a * kk)} cm lang. Wie lang war das Original?`, label: "Länge in cm:", placeholder: "", answer: d(a), check: LK.check.num(a, { abs: 1e-6 }), solution: `${d(a * kk)} : ${d(kk)} = <b>${d(a)} cm</b>` }; }
  function genAehnlich() {
    const a = rnd(2, 8), b = rnd(2, 8), sim = Math.random() < 0.5, kk = pick([1.5, 2, 3, 0.5, 2.5]);
    const a2 = a * kk, b2 = sim ? b * kk : b * kk + pick([1, -1, 2]);
    return { html: `Rechteck 1: ${d(a)} cm × ${d(b)} cm, Rechteck 2: ${d(a2)} cm × ${d(b2)} cm. Sind die Rechtecke ähnlich?`, label: "ja oder nein:", placeholder: "ja / nein", answer: sim ? "ja" : "nein",
      check: (raw) => { const t = raw.trim().toLowerCase(); if (!/^(ja|nein)$/.test(t)) return { ok: false, msg: "Antworte mit <code>ja</code> oder <code>nein</code>." }; return (t === "ja") === sim ? { ok: true } : { ok: false, msg: "Vergleiche die Verhältnisse beider Seiten." }; },
      solution: `${d(a2)} : ${d(a)} = ${d(kk)}, ${d(b2)} : ${d(b)} = ${d(b2 / b)}: <b>${sim ? "ja" : "nein"}</b>` };
  }
  LK.trainer({ el: "#trainer", modes: [
    { id: "k", label: "k bestimmen", gen: genK },
    { id: "bild", label: "Bildlänge", gen: genBild },
    { id: "orig", label: "Originallänge", gen: genOrig },
    { id: "aehnlich", label: "Ähnlich?", gen: genAehnlich }
  ] });

  LK.quiz({ box: "#quizBox", bar: "#qBar", progress: "#qProgress", key: "zstr.best", n: 8, questions: [
    { q: "Was bleibt bei ähnlichen Figuren gleich?", o: ["Die Seitenlängen", "Die Winkel", "Der Umfang", "Die Fläche"], a: 1, e: "Längen ändern sich mit k, Winkel bleiben." },
    { q: "|ZP| = 4 cm, |ZP′| = 10 cm. Wie groß ist k?", o: ["6", "2,5", "0,4", "40"], a: 1, e: "10 : 4 = 2,5." },
    { q: "Was bedeutet k = 0,5?", o: ["Vergrößerung", "Verkleinerung auf die Hälfte", "Spiegelung", "Keine Änderung"], a: 1, e: "Alle Längen halbieren sich." },
    { q: "Wo liegt P′ bei k = −1?", o: ["auf P", "auf Z", "gegenüber von P, gleich weit von Z entfernt", "doppelt so weit weg"], a: 2, e: "Punktspiegelung an Z." },
    { q: "Welche Figuren sind immer ähnlich?", o: ["Alle Rechtecke", "Alle Dreiecke", "Alle Quadrate", "Alle Trapeze"], a: 2, e: "Quadrate haben gleiche Winkel und gleiche Seitenverhältnisse." },
    { q: "Eine Strecke wird mit k = 3 gestreckt. Die Fläche einer Figur wird …", o: ["3-mal so groß", "6-mal so groß", "9-mal so groß", "gleich"], a: 2, e: "Flächen mit k² = 9." },
    { q: "Wie liegen Bildstrecke und Originalstrecke zueinander?", o: ["senkrecht", "parallel", "beliebig", "gleich lang"], a: 1, e: "Zentrische Streckung erhält Richtungen." },
    { q: "Fotos 10 × 15 und 20 × 30: ähnlich?", o: ["ja, k = 2", "nein", "nur die Breite", "ja, k = 10"], a: 0, e: "Beide Seiten verdoppelt." }
  ] });

  LK.views(["verstehen", "strecken", "ueben", "alltag", "quiz"], {});
})();
