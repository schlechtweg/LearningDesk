(function () {
  "use strict";
  const { $, $$, pick, rnd, fmt } = LK;
  const d = (v, p = 2) => fmt(v, p);

  // ---------- discover ----------
  let fig = "V";
  function draw() {
    const a = +$("#p1").value, b = +$("#p2").value, w = +$("#w").value * Math.PI / 180;
    $("#p1V").textContent = d(a); $("#p2V").textContent = d(b); $("#wV").textContent = $("#w").value + "°";
    const r2 = 1.3; // second ray is longer per unit (ratio ZB : ZA)
    const u1 = [1, 0], u2 = [Math.cos(w) * r2, -Math.sin(w) * r2];
    const s1 = a, s2 = fig === "V" ? b : -b; // X: second parallel on the other side
    const pts = [[0, 0], [s1 * u1[0], s1 * u1[1]], [s1 * u2[0], s1 * u2[1]], [s2 * u1[0], s2 * u1[1]], [s2 * u2[0], s2 * u2[1]]];
    const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
    const minX = Math.min(...xs) - 0.6, maxX = Math.max(...xs) + 0.8, minY = Math.min(...ys) - 0.6, maxY = Math.max(...ys) + 0.6;
    const sc = Math.min(440 / (maxX - minX), 280 / (maxY - minY));
    const P = (p) => [10 + (p[0] - minX) * sc, 10 + (p[1] - minY) * sc];
    const ln = (p, q, c) => { const A = P(p), B = P(q); return `<line class="${c}" x1="${A[0].toFixed(1)}" y1="${A[1].toFixed(1)}" x2="${B[0].toFixed(1)}" y2="${B[1].toFixed(1)}"/>`; };
    const tx = (p, t, dx, dy, c = "") => { const A = P(p); return `<text class="${c}" x="${(A[0] + dx).toFixed(1)}" y="${(A[1] + dy).toFixed(1)}">${t}</text>`; };
    const [Z, A, B, A2, B2] = pts;
    const ext = (u, s) => [u[0] * s, u[1] * s];
    let g = "";
    const lo = fig === "V" ? -0.3 : s2 * 1.12, hi = Math.max(s1, s2) * 1.12;
    g += ln(ext(u1, lo), ext(u1, hi), "ray") + ln(ext(u2, lo), ext(u2, hi), "ray");
    g += ln(Z, A, "seg1") + ln(Z, A2, "seg2");
    g += ln(A, B, "p1") + ln(A2, B2, "p2");
    g += `<circle class="z" cx="${P(Z)[0]}" cy="${P(Z)[1]}" r="4"/>` + tx(Z, "Z", -14, 4) + tx(A, "A", 4, 16) + tx(B, "B", 6, -4) + tx(A2, "A′", 4, 16) + tx(B2, "B′", 6, -4);
    $("#sSvg").innerHTML = g;
    const zb = s1 * r2, zb2 = b * r2, ab = Math.hypot(A[0] - B[0], A[1] - B[1]), ab2 = Math.hypot(A2[0] - B2[0], A2[1] - B2[1]);
    const row = (l, x, y) => `<tr><td>${l} = ${d(x)} : ${d(y)}</td><td>${d(x / y, 3)}</td></tr>`;
    $("#sFacts").innerHTML = row("|ZA| : |ZA′|", a, b) + row("|ZB| : |ZB′|", zb, zb2) + row("|AB| : |A′B′|", ab, ab2) +
      (fig === "V" ? `<tr><td>|AA′| : |AB| <span class="small">✗ kein Strahlensatz</span></td><td>${d(Math.abs(b - a) / ab, 3)}</td></tr>` : "");
  }
  ["#p1", "#p2", "#w"].forEach((id) => $(id).addEventListener("input", draw));
  $$("[data-f]").forEach((b) => b.addEventListener("click", () => { fig = b.dataset.f; $$("[data-f]").forEach((x) => x.setAttribute("aria-pressed", String(x === b))); draw(); }));
  draw();

  // ---------- trainer ----------
  const num = (v) => LK.check.num(v, { abs: 0.011 });
  function gen1() { const za = rnd(2, 8), k = pick([1.5, 2, 2.5, 3]), zb = rnd(2, 9); const zb2 = zb * k;
    return { html: `V-Figur: |<i>ZA</i>| = ${za} cm, |<i>ZA</i>′| = ${d(za * k)} cm, |<i>ZB</i>| = ${zb} cm. Berechne |<i>ZB</i>′|.`, label: "|<i>ZB</i>′| in cm:", answer: d(zb2), check: num(zb2), solution: `|<i>ZB</i>′| : ${zb} = ${d(za * k)} : ${za} ⇒ |<i>ZB</i>′| = <b>${d(zb2)} cm</b>`, hint: "1. Strahlensatz: Abschnitte auf beiden Strahlen im selben Verhältnis." }; }
  function gen2() { const za = rnd(2, 8), za2 = za + rnd(2, 8), ab = rnd(2, 7); const x = ab * za2 / za;
    return { html: `V-Figur: |<i>ZA</i>| = ${za} cm, |<i>AA</i>′| = ${za2 - za} cm, |<i>AB</i>| = ${ab} cm. Berechne |<i>A</i>′<i>B</i>′|.`, label: "|<i>A</i>′<i>B</i>′| in cm:", answer: d(x), check: num(x), solution: `|<i>ZA</i>′| = ${za} + ${za2 - za} = ${za2} cm; |<i>A</i>′<i>B</i>′| = ${ab} · ${za2} : ${za} = <b>${d(x)} cm</b>`, hint: "2. Strahlensatz: Erst die ganze Strecke vom Zentrum aus bestimmen." }; }
  function genX() { const za = rnd(2, 6), za2 = rnd(3, 9), ab = rnd(2, 6); const x = ab * za2 / za;
    return { html: `X-Figur: |<i>ZA</i>| = ${za} cm, |<i>ZA</i>′| = ${za2} cm (auf der anderen Seite), |<i>AB</i>| = ${ab} cm. Berechne |<i>A</i>′<i>B</i>′|.`, label: "|<i>A</i>′<i>B</i>′| in cm:", answer: d(x), check: num(x), solution: `|<i>A</i>′<i>B</i>′| : ${ab} = ${za2} : ${za} ⇒ <b>${d(x)} cm</b>` }; }
  function genFluss() { const a = pick([4, 5, 6, 8]), b = pick([10, 12, 15, 20]), c = pick([3, 4, 5, 6]); const x = c * b / a;
    return { html: `Flussbreite: Am Ufer sind |<i>ZA</i>| = ${a} m und |<i>AB</i>| = ${c} m (quer, parallel zur Peilstrecke über den Fluss). Bis zur Uferlinie gegenüber gilt |<i>ZA</i>′| = ${b} m. Wie lang ist |<i>A</i>′<i>B</i>′|?`, label: "Länge in m:", answer: d(x), check: num(x), solution: `${c} · ${b} : ${a} = <b>${d(x)} m</b>` }; }
  LK.trainer({ el: "#trainer", modes: [
    { id: "s1", label: "1. Strahlensatz", gen: gen1 },
    { id: "s2", label: "2. Strahlensatz", gen: gen2 },
    { id: "x", label: "X-Figur", gen: genX },
    { id: "anw", label: "Anwendung", gen: genFluss }
  ] });

  LK.quiz({ box: "#quizBox", bar: "#qBar", progress: "#qProgress", key: "strs.best", n: 8, questions: [
    { q: "Welche Voraussetzung braucht man für die Strahlensätze?", o: ["Rechte Winkel", "Parallele Geraden", "Gleich lange Strahlen", "Einen Kreis"], a: 1, e: "Nur bei Parallelen entstehen ähnliche Dreiecke." },
    { q: "|ZA| = 2, |ZA′| = 6, |ZB| = 3. |ZB′| = ?", o: ["7", "9", "4", "18"], a: 1, e: "Faktor 3." },
    { q: "Was ist beim 2. Strahlensatz falsch?", o: ["|AB| : |A′B′| = |ZA| : |ZA′|", "|AB| : |A′B′| = |ZA| : |AA′|", "|AB| : |A′B′| = |ZB| : |ZB′|", "Alle richtig"], a: 1, e: "Immer vom Zentrum aus messen." },
    { q: "Was ist eine X-Figur?", o: ["Z liegt zwischen den Parallelen", "Die Parallelen kreuzen sich", "Die Strahlen sind senkrecht", "Drei Strahlen"], a: 0, e: "Die Strahlen werden über Z hinaus verlängert." },
    { q: "|ZA| = 4, |AA′| = 2, |AB| = 6. |A′B′| = ?", o: ["9", "3", "8", "12"], a: 0, e: "|ZA′| = 6, Faktor 1,5." },
    { q: "Gelten die Strahlensätze in der X-Figur?", o: ["Ja", "Nein", "Nur der erste", "Nur der zweite"], a: 0, e: "Beide gelten." },
    { q: "Warum funktionieren die Strahlensätze?", o: ["Zufall", "Es entstehen ähnliche Dreiecke", "Wegen Pythagoras", "Weil Z in der Mitte liegt"], a: 1, e: "Gleiche Winkel durch Parallelen (Stufenwinkel)." },
    { q: "Lochkamera: Gegenstand 2 m hoch, 10 m entfernt; Bild 5 cm hinter dem Loch. Bildhöhe?", o: ["1 cm", "2 cm", "4 cm", "10 cm"], a: 0, e: "2 m · 0,05 : 10 = 0,01 m." }
  ] });

  LK.views(["verstehen", "entdecken", "ueben", "alltag", "quiz"], {});
})();
