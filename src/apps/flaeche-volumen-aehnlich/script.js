(function () {
  "use strict";
  const { $, pick, fmt } = LK;
  const d = (v, p = 3) => fmt(v, p).replace("-", "−");

  // ---------- discover ----------
  function draw() {
    const k = +$("#kR").value;
    let g = "";
    // square grid on the left
    const S = 170 / k, x0 = 20, y0 = 75;
    for (let i = 0; i < k; i++) for (let j = 0; j < k; j++) g += `<rect class="${i === 0 && j === k - 1 ? "sq0" : "sq"}" x="${x0 + i * S}" y="${y0 + j * S}" width="${S}" height="${S}"/>`;
    g += `<text x="${x0}" y="30">Fläche: ${k * k} Quadrate</text>`;
    // isometric cube on the right
    const ox = 330, oy = 170, L = 115, u = L / k;
    const ex = [Math.cos(Math.PI / 6), Math.sin(Math.PI / 6)], ey = [-Math.cos(Math.PI / 6), Math.sin(Math.PI / 6)];
    const P = (x, y, z) => [ox + (x * ex[0] + y * ey[0]) * u, oy - z * u - (-(x * ex[1] + y * ey[1])) * u - k * u * 0];
    const pt = (p) => p.map((v) => v.toFixed(1)).join(",");
    // faces: top z=k, left y=k? use x-face (x=k) and y-face (y=k)
    const face = (a, b, c, e, cls) => `<polygon class="${cls}" points="${[a, b, c, e].map(pt).join(" ")}"/>`;
    g += face(P(0, 0, k), P(k, 0, k), P(k, k, k), P(0, k, k), "top") + face(P(k, 0, 0), P(k, k, 0), P(k, k, k), P(k, 0, k), "right") + face(P(0, k, 0), P(k, k, 0), P(k, k, k), P(0, k, k), "left");
    const ln = (a, b, c = "cl") => `<line class="${c}" x1="${a[0].toFixed(1)}" y1="${a[1].toFixed(1)}" x2="${b[0].toFixed(1)}" y2="${b[1].toFixed(1)}"/>`;
    for (let i = 0; i <= k; i++) {
      g += ln(P(i, 0, k), P(i, k, k)) + ln(P(0, i, k), P(k, i, k)); // top
      g += ln(P(k, i, 0), P(k, i, k)) + ln(P(k, 0, i), P(k, k, i)); // right
      g += ln(P(i, k, 0), P(i, k, k)) + ln(P(0, k, i), P(k, k, i)); // left
    }
    g += ln(P(0, 0, k), P(k, 0, k), "co") + ln(P(0, 0, k), P(0, k, k), "co") + ln(P(k, 0, 0), P(k, 0, k), "co") + ln(P(0, k, 0), P(0, k, k), "co") + ln(P(k, 0, 0), P(k, k, 0), "co") + ln(P(0, k, 0), P(k, k, 0), "co") + ln(P(k, k, 0), P(k, k, k), "co");
    g += `<text x="${ox - 80}" y="30">Volumen: ${k ** 3} Würfel</text>`;
    $("#fSvg").innerHTML = g;
    $("#kVal").innerHTML = `<i>k</i> = ${k}`;
    $("#fFacts").innerHTML = `<tr><td>Kantenlänge</td><td>· ${k}</td></tr><tr><td>Fläche (<i>k</i>²)</td><td>· ${k * k}</td></tr><tr><td>Oberfläche Würfel</td><td>${6 * k * k} statt 6</td></tr><tr><td>Volumen (<i>k</i>³)</td><td>· ${k ** 3}</td></tr><tr><td>Oberfläche : Volumen</td><td>${d(6 / k)} statt 6</td></tr>`;
    $("#fText").innerHTML = k === 1 ? "Das Original: ein Einheitsquadrat und ein Einheitswürfel." : `Jede Kante ist ${k}-mal so lang. Ins große Quadrat passen ${k} · ${k} = ${k * k} kleine, in den großen Würfel ${k} · ${k} · ${k} = ${k ** 3} kleine.`;
  }
  $("#kR").addEventListener("input", draw);
  draw();

  // ---------- trainer ----------
  const ks = [2, 3, 4, 5, 0.5, 1.5, 2.5, 10];
  function genA() { const k = pick(ks), A = pick([4, 6, 8, 10, 12, 20, 24]); return { html: `Eine Figur mit ${d(A)} cm² wird mit <i>k</i> = ${d(k)} gestreckt. Neuer Flächeninhalt?`, label: "Fläche in cm²:", answer: d(A * k * k), check: LK.check.num(A * k * k, { abs: 1e-6 }), solution: `${d(A)} · ${d(k)}² = ${d(A)} · ${d(k * k)} = <b>${d(A * k * k)} cm²</b>`, hint: "Flächen mit k² multiplizieren." }; }
  function genV() { const k = pick(ks), V = pick([2, 5, 8, 10, 12, 20]); return { html: `Ein Körper mit ${d(V)} cm³ wird mit <i>k</i> = ${d(k)} gestreckt. Neues Volumen?`, label: "Volumen in cm³:", answer: d(V * k ** 3), check: LK.check.num(V * k ** 3, { abs: 1e-6 }), solution: `${d(V)} · ${d(k)}³ = ${d(V)} · ${d(k ** 3)} = <b>${d(V * k ** 3)} cm³</b>`, hint: "Volumen mit k³ multiplizieren." }; }
  function genKA() { const k = pick([2, 3, 4, 5, 1.5, 0.5]); return { html: `Die Fläche einer ähnlichen Figur ist ${d(k * k)}-mal so groß. Wie groß ist <i>k</i>?`, label: "<i>k</i> =", answer: d(k), check: LK.check.num(k, { abs: 1e-6 }), solution: `<i>k</i> = √${d(k * k)} = <b>${d(k)}</b>` }; }
  function genKV() { const k = pick([2, 3, 4, 5, 0.5, 10]); return { html: `Das Volumen eines ähnlichen Körpers ist ${d(k ** 3)}-mal so groß. Wie groß ist <i>k</i>?`, label: "<i>k</i> =", answer: d(k), check: LK.check.num(k, { abs: 1e-6 }), solution: `<i>k</i> = ∛${d(k ** 3)} = <b>${d(k)}</b>` }; }
  LK.trainer({ el: "#trainer", modes: [
    { id: "flaeche", label: "Fläche", gen: genA },
    { id: "volumen", label: "Volumen", gen: genV },
    { id: "ka", label: "k aus Fläche", gen: genKA },
    { id: "kv", label: "k aus Volumen", gen: genKV }
  ] });

  LK.quiz({ box: "#quizBox", bar: "#qBar", progress: "#qProgress", key: "flvol.best", n: 8, questions: [
    { q: "Alle Längen werden verdoppelt. Die Fläche wird …", o: ["verdoppelt", "vervierfacht", "verachtfacht", "halbiert"], a: 1, e: "2² = 4." },
    { q: "Alle Längen werden verdreifacht. Das Volumen wird …", o: ["· 3", "· 6", "· 9", "· 27"], a: 3, e: "3³ = 27." },
    { q: "Die Fläche ist 25-mal so groß. k = ?", o: ["5", "12,5", "25", "625"], a: 0, e: "√25 = 5." },
    { q: "Modell 1 : 10. Wie viel Lack braucht das Modell im Vergleich?", o: ["1/10", "1/100", "1/1000", "gleich viel"], a: 1, e: "Fläche: (1/10)² = 1/100." },
    { q: "Pizza mit doppeltem Durchmesser hat …", o: ["doppelt so viel Fläche", "4-mal so viel Fläche", "8-mal so viel Fläche", "gleich viel"], a: 1, e: "k = 2, Fläche · 4." },
    { q: "Ein Würfel mit k = 0,5 hat welches Volumen im Vergleich?", o: ["1/2", "1/4", "1/8", "2"], a: 2, e: "0,5³ = 0,125." },
    { q: "Volumen · 64. Wie ändert sich die Oberfläche?", o: ["· 4", "· 16", "· 64", "· 8"], a: 1, e: "k = ∛64 = 4, Oberfläche · 16." },
    { q: "Warum frieren kleine Tiere leichter?", o: ["Weniger Fell", "Viel Oberfläche im Verhältnis zum Volumen", "Kälteres Blut", "Gar nicht"], a: 1, e: "Oberfläche wächst mit k², Volumen mit k³." }
  ] });

  LK.views(["verstehen", "entdecken", "ueben", "alltag", "quiz"], {});
})();
