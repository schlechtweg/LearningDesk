(function () {
  "use strict";
  const { $, $$, pick, rnd, fmt } = LK;
  function parseP(raw) { const t = String(raw).trim().replace(/\s+/g, ""); if (/%$/.test(t)) { const v = LK.parseNum(t.slice(0, -1)); return isNaN(v) ? NaN : v / 100; } return LK.parseNum(t); }
  const checkP = (p) => (raw) => { const v = parseP(raw); if (isNaN(v)) return { ok: false, msg: "Gib eine Zahl ein, z. B. <code>0,12</code> oder <code>12 %</code>." }; return Math.abs(v - p) < 0.0006 ? { ok: true } : { ok: false, msg: "Noch nicht richtig." }; };

  // ---------- two-way table ----------
  const EX = [
    { name: "Beispiel aus dem Merksatz", A: "A", B: "B", v: [12, 18, 28, 42] },
    { name: "Münze und Würfel (120 Würfe)", A: "Kopf", B: "Sechs", v: [10, 50, 11, 49] },
    { name: "Regen und Schirm (200 Personen)", A: "Regentag", B: "trägt Schirm", v: [54, 6, 14, 126] },
    { name: "Handy abends und schlechter Schlaf (250 Jugendliche)", A: "Handy > 1 h", B: "schlechter Schlaf", v: [48, 52, 27, 123] },
    { name: "Linkshänder und Note 1/2 in Mathe (400)", A: "Linkshänder", B: "Note 1 oder 2", v: [16, 24, 144, 216] }
  ];
  $("#vSel").innerHTML = EX.map((e, i) => `<option value="${i}">${e.name}</option>`).join("");
  let ex;
  function setup() {
    ex = EX[+$("#vSel").value];
    $("#vTab").innerHTML = `<tr><th></th><th>${ex.B}</th><th>nicht ${ex.B}</th><th>Summe</th></tr>
      <tr><th>${ex.A}</th><td><input type="number" min="0" id="c0" value="${ex.v[0]}"></td><td><input type="number" min="0" id="c1" value="${ex.v[1]}"></td><td class="sum" id="sA"></td></tr>
      <tr><th>nicht ${ex.A}</th><td><input type="number" min="0" id="c2" value="${ex.v[2]}"></td><td><input type="number" min="0" id="c3" value="${ex.v[3]}"></td><td class="sum" id="sNA"></td></tr>
      <tr><th>Summe</th><td class="sum" id="sB"></td><td class="sum" id="sNB"></td><td class="sum" id="sT"></td></tr>`;
    [0, 1, 2, 3].forEach((i) => $("#c" + i).addEventListener("input", calc));
    calc();
  }
  function calc() {
    const c = [0, 1, 2, 3].map((i) => Math.max(0, +$("#c" + i).value || 0));
    const nA = c[0] + c[1], nNA = c[2] + c[3], nB = c[0] + c[2], nNB = c[1] + c[3], N = nA + nNA;
    $("#sA").textContent = nA; $("#sNA").textContent = nNA; $("#sB").textContent = nB; $("#sNB").textContent = nNB; $("#sT").textContent = N;
    if (!N || !nA || !nNA) { $("#vRo").innerHTML = ""; $("#vState").textContent = ""; $("#vText").textContent = "Trage Anzahlen ein, in beiden Zeilen mindestens eine."; return; }
    const pA = nA / N, pB = nB / N, pAB = c[0] / N, prod = pA * pB;
    const shareA = c[0] / nA, shareNA = c[2] / nNA;
    const dev = Math.abs(shareA - shareNA);
    const indep = dev < 0.03;
    $("#vRo").innerHTML = `<dt><i>P</i>(${ex.A})</dt><dd>${fmt(pA, 3)}</dd><dt><i>P</i>(${ex.B})</dt><dd>${fmt(pB, 3)}</dd><dt><i>P</i>(${ex.A} und ${ex.B})</dt><dd class="big">${fmt(pAB, 3)}</dd><dt><i>P</i>(${ex.A}) · <i>P</i>(${ex.B})</dt><dd class="big">${fmt(prod, 3)}</dd>`;
    $("#vState").textContent = indep ? (dev < 1e-9 ? "unabhängig" : "praktisch unabhängig") : "abhängig";
    $("#vState").className = "state " + (indep ? "ok" : "no");
    $("#vLegend").textContent = `Wahrscheinlichkeiten hier als relative Häufigkeiten (Anzahl : ${N}).`;
    $("#vText").innerHTML = `Anteil „${ex.B}“ unter „${ex.A}“: <strong>${c[0]} von ${nA} = ${fmt(100 * shareA, 1)} %</strong>; unter „nicht ${ex.A}“: <strong>${c[2]} von ${nNA} = ${fmt(100 * shareNA, 1)} %</strong>. `
      + (indep ? "Die Anteile sind (fast) gleich: Das Merkmal A ändert nichts an B. Entsprechend ist P(A und B) ≈ P(A) · P(B)." : `Die Anteile unterscheiden sich deutlich: ${shareA > shareNA ? `Bei „${ex.A}“ tritt „${ex.B}“ häufiger auf.` : `Bei „${ex.A}“ tritt „${ex.B}“ seltener auf.`} P(A und B) weicht von P(A) · P(B) ab.`);
  }
  $("#vSel").addEventListener("change", setup);
  setup();

  // ---------- trainer ----------
  function genProd() {
    const T = pick([["Eine Münze zeigt Kopf, ein Würfel eine 6", 1 / 2, 1 / 6, "1/2 · 1/6 = 1/12"], ["Zwei Würfel zeigen jeweils eine 6", 1 / 6, 1 / 6, "1/6 · 1/6 = 1/36"],
      ["Rauchmelder 1 und 2 fallen aus (je 2 %)", 0.02, 0.02, "0,02 · 0,02 = 0,0004"], ["Ampel 1 (40 % grün) und Ampel 2 (70 % grün) sind beide grün", 0.4, 0.7, "0,4 · 0,7 = 0,28"],
      ["Zwei Freiwürfe (Quote 80 %) treffen beide", 0.8, 0.8, "0,8 · 0,8 = 0,64"], ["Eine Münze zeigt zweimal Zahl", 0.5, 0.5, "0,5 · 0,5 = 0,25"]]);
    return { html: `Die Ereignisse sind unabhängig. Berechne: ${T[0]}.`, label: "<i>P</i> =", placeholder: "Zahl", answer: T[3].split(" = ").pop(), check: checkP(T[1] * T[2]), solution: `<span class="math">${T[3]}</span>` };
  }
  function genCheck() {
    const pA = pick([0.2, 0.3, 0.4, 0.5, 0.6]), pB = pick([0.25, 0.4, 0.5, 0.6, 0.8]);
    const indep = Math.random() < 0.5;
    const pAB = indep ? pA * pB : Math.round((pA * pB + pick([-0.06, -0.04, 0.05, 0.08])) * 100) / 100;
    const ans = Math.abs(pAB - pA * pB) < 1e-9 ? "unabhängig" : "abhängig";
    return { html: `<i>P</i>(<i>A</i>) = ${fmt(pA, 2)}, <i>P</i>(<i>B</i>) = ${fmt(pB, 2)}, <i>P</i>(<i>A</i> und <i>B</i>) = ${fmt(pAB, 2)}. Sind <i>A</i> und <i>B</i> unabhängig?`, label: "Antwort:", placeholder: "abhängig oder unabhängig", answer: ans,
      check: (raw) => { const t = raw.trim().toLowerCase(); const v = /^unab|^ja/.test(t) ? "unabhängig" : /^ab|^nein/.test(t) ? "abhängig" : null; if (!v) return { ok: false, msg: "Antworte mit <code>abhängig</code> oder <code>unabhängig</code>." }; return v === ans ? { ok: true } : { ok: false, msg: "Vergleiche P(A und B) mit P(A) · P(B)." }; },
      solution: `<span class="math">${fmt(pA, 2)} · ${fmt(pB, 2)} = ${fmt(pA * pB, 4)}</span> ${ans === "unabhängig" ? "=" : "≠"} ${fmt(pAB, 2)}: <b>${ans}</b>` };
  }
  function genTable() {
    const N = pick([100, 200, 400]), pA = pick([0.2, 0.25, 0.3, 0.4, 0.5]), pB = pick([0.2, 0.4, 0.5, 0.6]);
    const a = N * pA * pB;
    if (!Number.isInteger(a)) return genTable();
    return { html: `Eine Vierfeldertafel mit ${N} Personen: ${fmt(N * pA, 0)} haben Merkmal A, ${fmt(N * pB, 0)} haben Merkmal B. Wie viele müssten beides haben, wenn A und B unabhängig sind?`, label: "Anzahl:", placeholder: "Zahl", answer: String(a), check: LK.check.num(a, { abs: 0.5 }),
      solution: `<span class="math">${N} · ${fmt(pA, 2)} · ${fmt(pB, 2)} = <b>${a}</b></span>` };
  }
  LK.trainer({ el: "#trainer", modes: [
    { id: "produkt", label: "P(A und B) berechnen", gen: genProd },
    { id: "pruefen", label: "Unabhängig prüfen", gen: genCheck },
    { id: "tafel", label: "Vierfeldertafel", gen: genTable }
  ] });

  LK.quiz({ box: "#quizBox", bar: "#qBar", progress: "#qProgress", key: "unabh.best", n: 10, questions: [
    { q: "Wann sind A und B unabhängig?", o: ["Wenn P(A und B) = P(A) + P(B)", "Wenn P(A und B) = P(A) · P(B)", "Wenn P(A) = P(B)", "Wenn sie nie zusammen eintreten"], a: 1, e: "Produktbedingung." },
    { q: "Sind zwei Würfe einer Münze unabhängig?", o: ["Ja", "Nein", "Nur beim ersten Mal", "Nur bei Kopf"], a: 0, e: "Die Münze hat kein Gedächtnis." },
    { q: "Ziehen ohne Zurücklegen: Sind die Züge unabhängig?", o: ["Ja", "Nein", "Immer", "Nur bei zwei Farben"], a: 1, e: "Der erste Zug verändert die Urne." },
    { q: "P(A) = 0,5, P(B) = 0,4, unabhängig. P(A und B)?", o: ["0,9", "0,2", "0,1", "0,45"], a: 1, e: "0,5 · 0,4." },
    { q: "P(A) = 0,3, P(B) = 0,5, P(A und B) = 0,25. Unabhängig?", o: ["Ja", "Nein", "Man kann es nicht sagen", "Nur ungefähr"], a: 1, e: "0,3 · 0,5 = 0,15 ≠ 0,25." },
    { q: "Was steht in den Randfeldern einer Vierfeldertafel?", o: ["Die Summen", "Die Wahrscheinlichkeiten", "Nichts", "Die Differenzen"], a: 0, e: "Zeilen- und Spaltensummen." },
    { q: "Woran erkennt man Unabhängigkeit in der Vierfeldertafel anschaulich?", o: ["Alle Felder sind gleich", "Der Anteil von B ist unter A genauso groß wie unter nicht A", "Die Gesamtzahl ist 100", "Die Diagonale ist leer"], a: 1, e: "A ändert dann nichts an B." },
    { q: "Zwei unabhängige Rauchmelder fallen je mit 1 % aus. P(beide fallen aus)?", o: ["2 %", "1 %", "0,01 %", "0,1 %"], a: 2, e: "0,01 · 0,01 = 0,0001." },
    { q: "„Regen“ und „Schirm tragen“ sind …", o: ["unabhängig", "abhängig", "unvereinbar", "sicher"], a: 1, e: "Bei Regen tragen mehr Menschen Schirme." },
    { q: "Sind unvereinbare Ereignisse (mit P > 0) unabhängig?", o: ["Ja, immer", "Nein", "Nur bei Würfeln", "Nur mit Zurücklegen"], a: 1, e: "P(A und B) = 0, aber P(A) · P(B) > 0." },
    { q: "100 Personen: 40 mit A, 50 mit B, A und B unabhängig. Wie viele haben beides?", o: ["90", "45", "20", "10"], a: 2, e: "100 · 0,4 · 0,5 = 20." }
  ] });

  LK.views(["verstehen", "tafel", "ueben", "alltag", "quiz"], {});
})();
