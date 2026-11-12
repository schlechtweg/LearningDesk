(function () {
  "use strict";
  const { $, $$, pick } = LK;
  const C = window.CHEM;
  const first20 = C.els.filter((e) => e.z <= 20);
  const byZ = Object.fromEntries(C.els.map((e) => [e.z, e]));

  // ---------- atom kit ----------
  const S = { p: 6, n: 6, e: 6 };
  function drawKit() {
    $("#cP").textContent = S.p; $("#cN").textContent = S.n; $("#cE").textContent = S.e;
    const el = byZ[S.p], q = S.p - S.e, A = S.p + S.n;
    const kind = q === 0 ? "neutrales Atom" : q > 0 ? `Kation (${q} Elektron${q > 1 ? "en" : ""} zu wenig)` : `Anion (${-q} Elektron${q < -1 ? "en" : ""} zu viel)`;
    const shellsE = S.e > 0 ? C.shells(S.e) : [];
    $("#bBohr").innerHTML = el ? C.bohr(el, { shells: shellsE, coreLabel: `${S.p}p⁺ ${S.n}n` }) : "";
    $("#bNuc").innerHTML = el ? `<span class="nums"><span>${A}</span><span>${S.p}</span></span><span>${el.sym}</span><span class="q">${C.charge(q)}</span>` : "";
    const common = el && A === el.A;
    $("#bInfo").innerHTML = el ? `<span class="badge">${el.name}</span> ${kind}<br>Massenzahl A = ${A}, Ladung ${q > 0 ? "+" : ""}${q === 0 ? "0" : q}<br>Schalen: ${shellsE.join(", ") || "–"}` : "";
    const hints = [];
    if (common) hints.push(`Das ist das häufigste Isotop von ${el.name}.`);
    else if (el) hints.push(`Das häufigste Isotop von ${el.name} hat ${el.A - el.z} Neutronen. Mit ${S.n} Neutronen ist es ein anderes Isotop.`);
    if (el && q !== 0 && C.ionCharge(el) === q) hints.push(`${el.sym}${C.charge(q)} ist das typische Ion von ${el.name}: Es hat Edelgaskonfiguration.`);
    $("#bText").innerHTML = hints.join(" ") + " Ändere die Protonenzahl: Dann entsteht ein anderes Element.";
    $$("[data-d]").forEach((b) => { const [k, d] = b.dataset.d.split(","); const v = S[k] + +d; b.disabled = k === "p" ? v < 1 || v > 20 : v < 0 || v > 24; });
  }
  $$("[data-d]").forEach((b) => b.addEventListener("click", () => { const [k, d] = b.dataset.d.split(","); S[k] += +d; drawKit(); }));
  drawKit();

  // ---------- shell model ----------
  // Lewis symbol: up to 4 single dots on the four sides, then pairs become bars
  function lewis(e) {
    const v = e.z === 2 ? 2 : e.group, sides = [0, 0, 0, 0];
    if (e.z === 2) sides[0] = 2; else for (let i = 0; i < v; i++) sides[i % 4]++;
    let g = `<svg class="lewis" viewBox="0 0 120 120" aria-label="Lewis-Schreibweise ${e.sym}"><text x="60" y="72">${e.sym}</text>`;
    const pos = [[60, 26, "h"], [98, 60, "v"], [60, 96, "h"], [22, 60, "v"]];
    sides.forEach((n, i) => { const [x, y, o] = pos[i]; if (n === 1) g += `<circle class="d" cx="${x}" cy="${y}" r="4.5"/>`; if (n === 2) g += o === "h" ? `<line class="b" x1="${x - 13}" y1="${y}" x2="${x + 13}" y2="${y}"/>` : `<line class="b" x1="${x}" y1="${y - 13}" x2="${x}" y2="${y + 13}"/>`; });
    return g + "</svg>";
  }
  let cur = C.bySym.Na;
  $("#sGrid").innerHTML = C.els.map((e) => `<button type="button" data-z="${e.z}" aria-pressed="false"><b>${e.sym}</b><small>${e.z}</small></button>`).join("");
  function drawShell() {
    const e = cur;
    $$("#sGrid button").forEach((b) => b.setAttribute("aria-pressed", String(+b.dataset.z === e.z)));
    $("#sBohr").innerHTML = C.bohr(e);
    $("#sName").textContent = `${e.name} (${e.sym}), Z = ${e.z}`;
    const names = ["K", "L", "M", "N", "O"];
    $("#sTab").innerHTML = `<tr><th>Schale</th>${e.shells.map((_, i) => `<th>${names[i]} (n=${i + 1})</th>`).join("")}</tr><tr><td>Elektronen</td>${e.shells.map((s) => `<td><b>${s}</b></td>`).join("")}</tr><tr><td>maximal 2n²</td>${e.shells.map((_, i) => `<td>${2 * (i + 1) ** 2}</td>`).join("")}</tr>`;
    $("#sLewis").innerHTML = lewis(e);
    const q = C.ionCharge(e);
    const v = e.z === 2 ? 2 : e.group;
    $("#sFacts").innerHTML = `<p><strong>${v}</strong> Valenzelektronen, <strong>${e.shells.length}</strong> besetzte Schalen → ${e.group}. Hauptgruppe, ${e.period}. Periode.</p>` +
      (e.cls === "e" ? "<p>Edelgaskonfiguration: Edelgase gehen kaum Reaktionen ein.</p>" :
        q === null ? "<p>Elemente der 4. Hauptgruppe bilden meist Elektronenpaarbindungen statt Ionen.</p>" :
          `<p>Typisches Ion: <strong>${e.sym}${C.charge(q)}</strong> (${q > 0 ? `gibt ${q} e⁻ ab` : `nimmt ${-q} e⁻ auf`}) und erreicht so Edelgaskonfiguration.</p>`);
  }
  $$("#sGrid button").forEach((b) => b.addEventListener("click", () => { cur = byZ[+b.dataset.z]; drawShell(); }));
  drawShell();

  // ---------- trainer ----------
  const nucl = (e, A, q = 0) => `<sup>${A}</sup><sub>${e.z}</sub>${e.sym}${q ? C.charge(q) : ""}`;
  const listCheck = (want) => (raw) => { const got = String(raw).split(/[^0-9]+/).filter(Boolean).map(Number); if (!got.length) return { ok: false, msg: "Gib die Elektronen je Schale an, z. B. <code>2,8,1</code>." }; return got.join(",") === want.join(",") ? { ok: true } : { ok: false, msg: "Von innen nach außen: K höchstens 2, L höchstens 8, M (bis Z = 20) höchstens 8." }; };
  function genTeilchen() {
    const e = pick(first20), A = e.A + pick([0, 0, 1, 2, -1].filter((d) => e.A + d > e.z)), ask = pick(["Protonen", "Neutronen", "Elektronen"]);
    const ans = ask === "Protonen" ? e.z : ask === "Neutronen" ? A - e.z : e.z;
    return { html: `Wie viele <strong>${ask}</strong> hat das Atom ${nucl(e, A)}?`, label: `${ask}:`, answer: String(ans), check: LK.check.num(ans, { abs: 0 }),
      solution: `Z = ${e.z}, A = ${A}: ${e.z} Protonen, ${A - e.z} Neutronen, ${e.z} Elektronen. Gesucht: <b>${ans}</b>`, hint: "Neutronen = Massenzahl − Ordnungszahl." };
  }
  function genSchalen() { const e = pick(first20); return { html: `Gib die Schalenbesetzung von <strong>${e.name}</strong> (Z = ${e.z}) an.`, label: "Schalen:", placeholder: "z. B. 2,8,1", answer: e.shells.join(","), check: listCheck(e.shells), solution: `<b>${e.shells.join(", ")}</b>` }; }
  function genValenz() { const e = pick(C.els.filter((x) => x.z !== 2)); return { html: `Wie viele Valenzelektronen hat ein <strong>${e.name}</strong>-Atom (${e.group}. Hauptgruppe)?`, label: "Valenzelektronen:", answer: String(e.group), check: LK.check.num(e.group, { abs: 0 }), solution: `Hauptgruppennummer = Valenzelektronen: <b>${e.group}</b>` }; }
  function genIon() {
    const e = pick(first20.filter((x) => C.ionCharge(x) !== null && x.z > 2)), q = C.ionCharge(e), ne = e.z - q;
    if (Math.random() < 0.5) return { html: `Wie viele Elektronen hat das Ion <strong>${e.sym}${C.charge(q)}</strong>?`, label: "Elektronen:", answer: String(ne), check: LK.check.num(ne, { abs: 0 }), solution: `${e.z} Protonen, Ladung ${q > 0 ? "+" : "−"}${Math.abs(q)} ⇒ ${e.z} ${q > 0 ? "−" : "+"} ${Math.abs(q)} = <b>${ne} Elektronen</b>` };
    return { html: `Schalenbesetzung des Ions <strong>${e.sym}${C.charge(q)}</strong>?`, label: "Schalen:", placeholder: "z. B. 2,8", answer: C.shells(ne).join(","), check: listCheck(C.shells(ne)), solution: `${ne} Elektronen: <b>${C.shells(ne).join(", ")}</b> (Edelgaskonfiguration)` };
  }
  LK.trainer({ el: "#trainer", modes: [
    { id: "teilchen", label: "Teilchen zählen", gen: genTeilchen },
    { id: "schalen", label: "Schalenbesetzung", gen: genSchalen },
    { id: "valenz", label: "Valenzelektronen", gen: genValenz },
    { id: "ionen", label: "Ionen", gen: genIon }
  ] });

  LK.quiz({ box: "#quizBox", bar: "#qBar", progress: "#qProgress", key: "atombau.best", n: 8, questions: [
    { q: "Was legt fest, um welches Element es sich handelt?", o: ["Die Neutronenzahl", "Die Protonenzahl", "Die Elektronenzahl", "Die Massenzahl"], a: 1, e: "Ordnungszahl = Protonenzahl." },
    { q: "Wie viele Neutronen hat ³⁷₁₇Cl?", o: ["17", "20", "37", "54"], a: 1, e: "37 − 17 = 20." },
    { q: "Was unterscheidet Isotope eines Elements?", o: ["Protonenzahl", "Elektronenzahl", "Neutronenzahl", "Ladung"], a: 2, e: "Gleiche Protonen, verschiedene Neutronen." },
    { q: "Wie viele Elektronen passen höchstens auf die L-Schale (n = 2)?", o: ["2", "8", "18", "32"], a: 1, e: "2n² = 8." },
    { q: "Schalenbesetzung von Schwefel (Z = 16)?", o: ["2, 8, 6", "2, 6, 8", "8, 8", "2, 14"], a: 0, e: "Von innen nach außen." },
    { q: "Was ist ein Kation?", o: ["Ein negatives Ion", "Ein positives Ion", "Ein Neutron", "Ein Edelgas"], a: 1, e: "Es hat Elektronen abgegeben." },
    { q: "Wie viele Elektronen hat O²⁻?", o: ["6", "8", "10", "16"], a: 2, e: "8 + 2 = 10, wie Neon." },
    { q: "Welche Aussage über das Bohr-Modell stimmt?", o: ["Es ist völlig exakt", "Elektronen kreisen auf festen Schalen mit bestimmter Energie", "Der Kern besteht aus Elektronen", "Es gibt nur eine Schale"], a: 1, e: "Heute ergänzt durch das Orbitalmodell." }
  ] });

  LK.views(["verstehen", "baukasten", "schalen", "ueben", "alltag", "quiz"], {});
})();
