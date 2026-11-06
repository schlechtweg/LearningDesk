(function () {
  "use strict";
  const { $, $$, pick, rnd, fmt, gcd, frac } = LK;
  const fracHtml = (a, b) => { const g = gcd(a, b) || 1; const p = a / g, q = b / g; return q === 1 ? String(p) : frac(p, q); };
  function parseP(raw) {
    const t = String(raw).trim().replace(/\s+/g, "");
    if (/%$/.test(t)) { const v = LK.parseNum(t.slice(0, -1)); return isNaN(v) ? NaN : v / 100; }
    return LK.parseNum(t);
  }
  const checkP = (p) => (raw) => { const v = parseP(raw); if (isNaN(v)) return { ok: false, msg: "Gib z. B. <code>3/8</code>, <code>0,375</code> oder <code>37,5 %</code> ein." }; return Math.abs(v - p) < 0.0006 ? { ok: true } : { ok: false, msg: "Zähle die günstigen und alle möglichen Ergebnisse." }; };

  // ---------- event lab ----------
  const COLORS = { rot: "#c0392b", blau: "#2f7fb8", grün: "#2e8a57" };
  const CARDS = [];
  ["♣", "♠", "♥", "♦"].forEach((f) => ["7", "8", "9", "10", "B", "D", "K", "A"].forEach((w) => CARDS.push({ f, w })));
  const EXP = [
    { name: "Würfel", cols: 6, items: [1, 2, 3, 4, 5, 6].map((k) => ({ label: String(k), k })),
      ev: [["gerade Augenzahl", (o) => o.k % 2 === 0], ["Augenzahl größer als 4", (o) => o.k > 4], ["Primzahl", (o) => [2, 3, 5].includes(o.k)], ["mindestens 2", (o) => o.k >= 2]] },
    { name: "Zwei Würfel (36 Ergebnisse)", cols: 6, items: (() => { const a = []; for (let i = 1; i <= 6; i++) for (let j = 1; j <= 6; j++) a.push({ label: `${i}|${j}`, i, j }); return a; })(),
      ev: [["Augensumme 7", (o) => o.i + o.j === 7], ["Pasch", (o) => o.i === o.j], ["mindestens eine 6", (o) => o.i === 6 || o.j === 6], ["Augensumme mindestens 10", (o) => o.i + o.j >= 10], ["Augensumme gerade", (o) => (o.i + o.j) % 2 === 0]] },
    { name: "Urne: 3 rote, 5 blaue, 2 grüne Kugeln", cols: 5, ball: true, items: [...Array(3).fill("rot"), ...Array(5).fill("blau"), ...Array(2).fill("grün")].map((c, i) => ({ label: "", c, i })),
      ev: [["rote Kugel", (o) => o.c === "rot"], ["nicht blau", (o) => o.c !== "blau"], ["grüne Kugel", (o) => o.c === "grün"]] },
    { name: "Skatkarten (32 Karten)", cols: 8, items: CARDS.map((c) => ({ label: c.f + c.w, ...c })),
      ev: [["Herz", (o) => o.f === "♥"], ["Ass", (o) => o.w === "A"], ["Bildkarte (B, D, K)", (o) => ["B", "D", "K"].includes(o.w)], ["rote Karte", (o) => o.f === "♥" || o.f === "♦"], ["Kreuz-Bube", (o) => o.f === "♣" && o.w === "B"]] },
    { name: "Glücksrad mit 8 gleichen Feldern", cols: 8, items: [1, 2, 3, 4, 5, 6, 7, 8].map((k) => ({ label: String(k), k })),
      ev: [["Zahl größer als 5", (o) => o.k > 5], ["ungerade Zahl", (o) => o.k % 2 === 1], ["durch 3 teilbar", (o) => o.k % 3 === 0]] }
  ];
  $("#lSel").innerHTML = EXP.map((e, i) => `<option value="${i}">${e.name}</option>`).join("");
  let ex, sel;
  function setupLab() {
    ex = EXP[+$("#lSel").value]; sel = new Set();
    $("#lEv").innerHTML = `<option value="-1">eigene Auswahl</option>` + ex.ev.map((e, i) => `<option value="${i}">${e[0]}</option>`).join("");
    const g = $("#lGrid"); g.style.gridTemplateColumns = `repeat(${ex.cols}, minmax(0, 1fr))`;
    g.innerHTML = ex.items.map((o, i) => `<button type="button" data-i="${i}"${ex.ball ? ` class="ball" style="background:${COLORS[o.c]};border-color:${COLORS[o.c]}"` : ""}${o.f && "♥♦".includes(o.f) ? ' style="color:#c0392b"' : ""}>${o.label}</button>`).join("");
    $$("#lGrid button").forEach((b) => b.addEventListener("click", () => { const i = +b.dataset.i; sel.has(i) ? sel.delete(i) : sel.add(i); $("#lEv").value = "-1"; paint(); }));
    paint();
  }
  function paint() {
    $$("#lGrid button").forEach((b) => { const on = sel.has(+b.dataset.i); b.classList.toggle("on", on); if (ex.ball) b.style.outline = on ? "4px solid var(--ink)" : "none"; });
    const k = sel.size, n = ex.items.length;
    $("#lRo").innerHTML = `<dt>günstige Ergebnisse</dt><dd>${k}</dd><dt>mögliche Ergebnisse</dt><dd>${n}</dd><dt><i>P</i>(<i>E</i>)</dt><dd class="big math">${fracHtml(k, n)}</dd><dt>als Dezimalzahl</dt><dd>${fmt(k / n, 4)}</dd><dt>in Prozent</dt><dd>${fmt(100 * k / n, 1)} %</dd><dt><i>P</i>(Gegenereignis)</dt><dd class="math">${fracHtml(n - k, n)}</dd>`;
  }
  $("#lSel").addEventListener("change", setupLab);
  $("#lEv").addEventListener("change", () => { const i = +$("#lEv").value; if (i < 0) return; sel = new Set(); ex.items.forEach((o, j) => { if (ex.ev[i][1](o)) sel.add(j); }); paint(); });
  $("#lClear").addEventListener("click", () => { sel = new Set(); $("#lEv").value = "-1"; paint(); });
  $("#lInv").addEventListener("click", () => { const s2 = new Set(); ex.items.forEach((_, j) => { if (!sel.has(j)) s2.add(j); }); sel = s2; $("#lEv").value = "-1"; paint(); });
  setupLab();

  // ---------- counting ----------
  const SIT = [
    { name: "Outfits", stages: [["T-Shirts", 3, 1, 6], ["Hosen", 2, 1, 5], ["Paar Schuhe", 2, 1, 4]], what: "Outfits" },
    { name: "Zahlenschloss", stages: [["Rad 1 (Ziffern)", 10, 2, 10], ["Rad 2", 10, 2, 10], ["Rad 3", 10, 2, 10]], what: "Codes" },
    { name: "Menü in der Kantine", stages: [["Vorspeisen", 3, 1, 5], ["Hauptgerichte", 4, 1, 6], ["Nachspeisen", 2, 1, 4]], what: "Menüs" },
    { name: "Eis mit zwei Kugeln (Reihenfolge zählt)", stages: [["Sorten für Kugel 1", 5, 1, 8], ["Sorten für Kugel 2", 5, 1, 8]], what: "Eisbecher" }
  ];
  $("#zSel").innerHTML = SIT.map((x, i) => `<option value="${i}">${x.name}</option>`).join("");
  let sit;
  function setupCount() {
    sit = SIT[+$("#zSel").value];
    $("#zCtl").innerHTML = sit.stages.map((st, i) => `<div><label class="lbl" for="z${i}"><span>${st[0]}</span><span class="val" id="z${i}o">${st[1]}</span></label><input type="range" id="z${i}" min="${st[2]}" max="${st[3]}" value="${st[1]}"></div>`).join("") + `<dl class="readout" id="zRo"></dl>`;
    sit.stages.forEach((_, i) => $("#z" + i).addEventListener("input", drawCount));
    drawCount();
  }
  function drawCount() {
    const ks = sit.stages.map((_, i) => +$("#z" + i).value);
    ks.forEach((k, i) => { $("#z" + i + "o").textContent = k; });
    const N = ks.reduce((a, b) => a * b, 1);
    let s = "";
    const levels = ks.length, leavesShown = ks.reduce((a, b) => a * b, 1);
    if (leavesShown <= 60) {
      // draw the full tree: one column per stage
      let prev = [{ x: 20, y: 130 }];
      ks.forEach((k, lev) => {
        const cnt = prev.length * k, next = [];
        const x = 20 + (lev + 1) * (420 / levels);
        prev.forEach((p, pi) => { for (let j = 0; j < k; j++) { const idx = pi * k + j, y = 12 + (idx + 0.5) * (236 / cnt); s += `<line x1="${p.x}" y1="${p.y}" x2="${x}" y2="${y}"/>`; next.push({ x, y }); } });
        prev = next;
      });
      prev.forEach((p) => { s += `<circle cx="${p.x}" cy="${p.y}" r="${N > 30 ? 2 : 3}"/>`; });
      s += `<circle cx="20" cy="130" r="4"/>`;
    } else s = `<text x="230" y="130" text-anchor="middle">Der Baum hätte ${N.toLocaleString("de-DE")} Enden – zu viele zum Zeichnen.</text>`;
    $("#zSvg").innerHTML = s;
    $("#zRo").innerHTML = `<dt>Rechnung</dt><dd class="math">${ks.join(" · ")}</dd><dt>Anzahl ${sit.what}</dt><dd class="big">${N.toLocaleString("de-DE")}</dd><dt>zufällig richtig raten</dt><dd class="math">1/${N.toLocaleString("de-DE")} ≈ ${fmt(100 / N, N > 1000 ? 3 : 2)} %</dd>`;
    $("#zText").innerHTML = `Für jede der ${ks[0]} Möglichkeiten der ersten Stufe gibt es ${ks.slice(1).join(" bzw. ")} Möglichkeiten in den nächsten Stufen. Darum <strong>multipliziert</strong> man: <span class="math">${ks.join(" · ")} = ${N.toLocaleString("de-DE")}</span>.`;
  }
  $("#zSel").addEventListener("change", setupCount);
  setupCount();

  // ---------- trainer ----------
  function genLaplace() {
    const T = pick([
      () => { const r_ = rnd(1, 6), b = rnd(1, 8), g = rnd(0, 5), c = pick(["rot", "blau"]); const k = c === "rot" ? r_ : b, n = r_ + b + g; return [`In einer Urne liegen ${r_} rote, ${b} blaue und ${g} grüne Kugeln. Wie groß ist die Wahrscheinlichkeit, eine <b>${c}e</b> Kugel zu ziehen?`, k, n]; },
      () => { const e = pick([["eine Zahl größer als 2", 4], ["eine ungerade Zahl", 3], ["eine 1 oder eine 6", 2], ["eine Zahl kleiner als 6", 5]]); return [`Würfel: Wahrscheinlichkeit für ${e[0]}?`, e[1], 6]; },
      () => { const e = pick([["ein Herz", 8], ["ein Ass", 4], ["eine Bildkarte (B, D, K)", 12], ["eine rote Karte", 16], ["der Kreuz-Bube", 1]]); return [`Aus 32 Skatkarten wird eine gezogen. Wahrscheinlichkeit für ${e[0]}?`, e[1], 32]; },
      () => { const n = pick([100, 200, 250, 500]), k = pick([5, 10, 20, 25, 40, 50]); return [`Bei einer Tombola gibt es ${n} Lose, davon ${k} Gewinne. Gewinnwahrscheinlichkeit beim ersten Los?`, k, n]; },
      () => { const e = pick([["Augensumme 7", 6], ["Augensumme 2", 1], ["einen Pasch", 6], ["Augensumme 10", 3], ["mindestens eine 6", 11]]); return [`Zwei Würfel: Wahrscheinlichkeit für ${e[0]}?`, e[1], 36]; }
    ])();
    const [q, k, n] = T;
    return { html: q, label: "<i>P</i> =", placeholder: "z. B. 3/8", answer: `${k}/${n}`, check: checkP(k / n), solution: `<span class="math"><i>P</i> = ${k}/${n} = ${fracHtml(k, n)} ≈ ${fmt(100 * k / n, 1)} %</span>` };
  }
  function genComp() {
    const k = rnd(1, 11), n = pick([12, 20, 25, 36, 50]);
    if (k >= n) return genComp();
    return { html: `<i>P</i>(<i>E</i>) = ${k}/${n}. Wie groß ist die Wahrscheinlichkeit des Gegenereignisses?`, label: "<i>P</i>(Ē) =", placeholder: "Bruch oder Dezimalzahl", answer: `${n - k}/${n}`, check: checkP((n - k) / n), solution: `<span class="math">1 − ${k}/${n} = ${fracHtml(n - k, n)}</span>` };
  }
  function genCount() {
    const T = pick([
      () => { const a = rnd(2, 6), b = rnd(2, 5), c = rnd(2, 4); return [`${a} T-Shirts, ${b} Hosen, ${c} Paar Schuhe. Wie viele Outfits?`, [a, b, c]]; },
      () => { const s_ = rnd(3, 5); return [`Ein Zahlenschloss hat ${s_} Räder mit den Ziffern 0 bis 9. Wie viele Codes gibt es?`, Array(s_).fill(10)]; },
      () => { const a = rnd(2, 5), b = rnd(2, 6), c = rnd(2, 4); return [`${a} Vorspeisen, ${b} Hauptgerichte, ${c} Nachspeisen. Wie viele Menüs?`, [a, b, c]]; },
      () => { const n = rnd(2, 4); return [`Ein Code besteht aus ${n} Buchstaben (A bis Z, 26 Buchstaben). Wie viele Codes gibt es?`, Array(n).fill(26)]; },
      () => { const a = rnd(3, 8); return [`Bei einem Lauf mit ${a} Teilnehmern: Wie viele Möglichkeiten gibt es für Platz 1 und Platz 2?`, [a, a - 1]]; }
    ])();
    const N = T[1].reduce((x, y) => x * y, 1);
    return { html: T[0], label: "Anzahl:", placeholder: "Zahl", answer: String(N), check: LK.check.num(N, { abs: 0.5 }), solution: `<span class="math">${T[1].join(" · ")} = <b>${N.toLocaleString("de-DE")}</b></span>` };
  }
  LK.trainer({ el: "#trainer", modes: [
    { id: "laplace", label: "Laplace-Wahrscheinlichkeit", gen: genLaplace },
    { id: "gegen", label: "Gegenereignis", gen: genComp },
    { id: "zaehlen", label: "Anzahlen (Produktregel)", gen: genCount }
  ] });

  // ---------- quiz ----------
  LK.quiz({ box: "#quizBox", bar: "#qBar", progress: "#qProgress", key: "laplace.best", n: 10, questions: [
    { q: "Wann ist ein Experiment ein Laplace-Experiment?", o: ["Wenn es zwei Ergebnisse hat", "Wenn alle Ergebnisse gleich wahrscheinlich sind", "Wenn man würfelt", "Immer"], a: 1, e: "Nur dann darf man günstig : möglich rechnen." },
    { q: "Wahrscheinlichkeit für „gerade Zahl“ beim Würfel?", o: ["1/6", "1/3", "1/2", "2/3"], a: 2, e: "3 von 6." },
    { q: "Urne: 2 rote, 8 blaue Kugeln. P(rot)?", o: ["2/8", "1/5", "2", "1/4"], a: 1, e: "2/10 = 1/5." },
    { q: "Wie viele Ergebnisse hat der Wurf mit zwei Würfeln?", o: ["11", "12", "36", "6"], a: 2, e: "6 · 6 = 36." },
    { q: "P(Augensumme 7) bei zwei Würfeln?", o: ["1/11", "1/6", "7/36", "1/12"], a: 1, e: "6 von 36 Ergebnissen." },
    { q: "P(E) = 0,3. P(Gegenereignis)?", o: ["0,3", "0,7", "1,3", "0"], a: 1, e: "1 − 0,3." },
    { q: "4 Hosen, 5 T-Shirts. Wie viele Kombinationen?", o: ["9", "20", "45", "4"], a: 1, e: "Produktregel: 4 · 5." },
    { q: "Wie viele 4-stellige PINs gibt es (Ziffern 0 bis 9)?", o: ["40", "1 000", "10 000", "9 999"], a: 2, e: "10⁴ = 10 000." },
    { q: "Ist ein Glücksrad mit unterschiedlich großen Feldern ein Laplace-Experiment?", o: ["Ja", "Nein", "Nur bei 4 Feldern", "Nur bei roten Feldern"], a: 1, e: "Die Ergebnisse sind nicht gleich wahrscheinlich." },
    { q: "Aus 32 Skatkarten: P(Ass)?", o: ["1/32", "1/8", "1/4", "4/8"], a: 1, e: "4/32 = 1/8." },
    { q: "Mit welcher Wahrscheinlichkeit errät man einen 3-stelligen Zahlenschloss-Code beim ersten Versuch?", o: ["1/3", "1/30", "1/1 000", "3/10"], a: 2, e: "1 000 Codes, einer ist richtig." },
    { q: "8 Läufer: Wie viele Möglichkeiten für Gold und Silber?", o: ["16", "56", "64", "15"], a: 1, e: "8 · 7 = 56." }
  ] });

  LK.views(["verstehen", "labor", "zaehlen", "ueben", "alltag", "quiz"], { labor: paint, zaehlen: drawCount });
})();
