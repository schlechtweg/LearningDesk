(function () {
  "use strict";
  const { $, $$, pick, rnd, fmt, shuffle } = LK;
  const d = (v, p = 2) => fmt(v, p).replace(".", ",").replace("-", "−");
  const rad = (g) => g * Math.PI / 180;

  // ---------- discover ----------
  function triangle(al, be, c) { // A at origin, B at (c, 0), C from angles
    const ga = 180 - al - be, b = c * Math.sin(rad(be)) / Math.sin(rad(ga)), a = c * Math.sin(rad(al)) / Math.sin(rad(ga));
    return { A: [0, 0], B: [c, 0], C: [b * Math.cos(rad(al)), b * Math.sin(rad(al))], a, b, c, ga };
  }
  function drawT() {
    let al = +$("#al").value, be = +$("#be").value; const k = +$("#kk").value;
    if (al + be > 160) { be = 160 - al; $("#be").value = be; }
    $("#alV").textContent = al + "°"; $("#beV").textContent = be + "°"; $("#kkV").textContent = d(k);
    const T1 = triangle(al, be, 4), T2 = triangle(al, be, 4 * k);
    const pts = [T1.A, T1.B, T1.C, ...[T2.A, T2.B, T2.C].map((p) => [p[0] + 6, p[1]])];
    const minY = Math.min(...pts.map((p) => p[1])), maxY = Math.max(...pts.map((p) => p[1])), minX = Math.min(...pts.map((p) => p[0])), maxX = Math.max(...pts.map((p) => p[0]));
    const s = Math.min(420 / (maxX - minX), 250 / (maxY - minY));
    const P = (p) => [20 + (p[0] - minX) * s, 280 - (p[1] - minY) * s];
    const poly = (ps, c) => `<polygon class="${c}" points="${ps.map((p) => P(p).join(",")).join(" ")}"/>`;
    const off = (p) => [p[0] + 6, p[1]];
    const lab = (p, t, dx, dy) => { const q = P(p); return `<text class="pl" x="${q[0] + dx}" y="${q[1] + dy}">${t}</text>`; };
    $("#tSvg").innerHTML = poly([T1.A, T1.B, T1.C], "t1") + poly([T2.A, T2.B, T2.C].map(off), "t2") +
      lab(T1.A, "A", -12, 14) + lab(T1.B, "B", 4, 14) + lab(T1.C, "C", -4, -6) + lab(off(T2.A), "A′", -14, 14) + lab(off(T2.B), "B′", 4, 14) + lab(off(T2.C), "C′", -4, -6);
    $("#tFacts").innerHTML = `<tr><td>γ = 180° − α − β</td><td>${180 - al - be}°</td></tr>` +
      [["a", T1.a, T2.a], ["b", T1.b, T2.b], ["c", T1.c, T2.c]].map(([n, x, y]) => `<tr><td>${n}′ : ${n} = ${d(y)} : ${d(x)}</td><td>${d(y / x)}</td></tr>`).join("");
  }
  ["#al", "#be", "#kk"].forEach((id) => $(id).addEventListener("input", drawT));
  drawT();

  // ---------- check cases ----------
  function makeCase() {
    const t = pick(["WW", "SSS", "SWS", "neinW", "neinS"]);
    const k = pick([1.5, 2, 2.5, 3, 0.5]);
    if (t === "WW" || t === "neinW") { const a = rnd(4, 14) * 5, b = rnd(4, 14) * 5; const g = 180 - a - b; const b2 = t === "WW" ? g : g + pick([5, 10, -5]);
      return { a: t === "WW" ? "WW" : "nein", html: `Dreieck 1: α = ${a}°, β = ${b}°.<br>Dreieck 2: α′ = ${a}°, γ′ = ${b2}°.`, why: t === "WW" ? `In Dreieck 1 ist γ = ${g}°, also stimmen zwei Winkel überein.` : `In Dreieck 1 ist γ = ${g}° ≠ ${b2}°; β′ = ${180 - a - b2}° ≠ ${b}°.` }; }
    if (t === "SSS" || t === "neinS") { const s = [rnd(3, 9), rnd(3, 9), rnd(3, 9)].sort((x, y) => x - y); if (s[0] + s[1] <= s[2]) return makeCase(); const s2 = s.map((v) => v * k); if (t === "neinS") s2[2] += pick([1, -1, 2]);
      return { a: t === "SSS" ? "SSS" : "nein", html: `Dreieck 1: ${s.map((v) => d(v) + " cm").join(", ")}.<br>Dreieck 2: ${shuffle(s2.slice()).map((v) => d(v) + " cm").join(", ")}.`, why: `Der Größe nach: ${s2.map((v, i) => `${d(v)} : ${d(s[i])} = ${d(v / s[i])}`).join(", ")}.` }; }
    const b = rnd(3, 8), c = rnd(3, 8), w = rnd(6, 24) * 5;
    return { a: "SWS", html: `Dreieck 1: b = ${b} cm, c = ${c} cm, α = ${w}°.<br>Dreieck 2: b′ = ${d(b * k)} cm, c′ = ${d(c * k)} cm, α′ = ${w}°.`, why: `b′ : b = c′ : c = ${d(k)} und der eingeschlossene Winkel stimmt.` };
  }
  let C = null, done = false, sc = 0, tot = 0;
  function nextCase() { C = makeCase(); done = false; $("#pCase").innerHTML = C.html; $("#pFb").textContent = ""; $$("#pOpts button").forEach((b) => b.classList.remove("right", "wrong")); }
  $$("#pOpts button").forEach((b) => b.addEventListener("click", () => {
    if (done) return; done = true; tot++; const ok = b.dataset.a === C.a; if (ok) sc++;
    b.classList.add(ok ? "right" : "wrong"); if (!ok) $(`#pOpts [data-a="${C.a}"]`).classList.add("right");
    $("#pFb").innerHTML = (ok ? "Richtig. " : "Nicht ganz. ") + C.why; $("#pScore").textContent = `${sc} von ${tot} richtig`;
  }));
  $("#pNext").addEventListener("click", nextCase);
  nextCase();

  // ---------- trainer ----------
  function genSeite() { const s = [rnd(2, 9), rnd(3, 9), rnd(4, 12)].sort((x, y) => x - y); if (s[0] + s[1] <= s[2]) return genSeite(); const k = pick([1.5, 2, 2.5, 3, 0.5]); const i = rnd(1, 2);
    return { html: `Ähnliche Dreiecke: ${s.map((v) => d(v) + " cm").join(", ")} und ${d(s[0] * k)} cm, <i>x</i>${i === 1 ? `, ${d(s[2] * k)} cm` : ""}${i === 2 ? `, ${d(s[1] * k)} cm` : ""} (der Größe nach). Berechne <i>x</i>.`, label: "<i>x</i> in cm:", answer: d(s[i] * k), check: LK.check.num(s[i] * k, { abs: 1e-6 }), solution: `<i>k</i> = ${d(s[0] * k)} : ${d(s[0])} = ${d(k)}, <i>x</i> = ${d(k)} · ${d(s[i])} = <b>${d(s[i] * k)} cm</b>` }; }
  function genWinkel() { const a = rnd(5, 14) * 5, b = rnd(5, 12) * 5; return { html: `Ähnliche Dreiecke: α = ${a}°, β = ${b}°. Wie groß ist γ′ im Bilddreieck?`, label: "γ′ in °:", answer: String(180 - a - b), check: LK.check.num(180 - a - b, { abs: 1e-6 }), solution: `Winkel bleiben gleich: γ′ = 180° − ${a}° − ${b}° = <b>${180 - a - b}°</b>` }; }
  function genSchatten() { const h = pick([1.5, 1.6, 1.8, 2]), s = pick([1, 1.2, 1.5, 2, 2.5]), S = pick([6, 8, 10, 12, 15, 20]); const H = h * S / s;
    return { html: `Ein ${d(h)} m großer Stab wirft ${d(s)} m Schatten, ein Turm zur selben Zeit ${d(S)} m. Wie hoch ist der Turm?`, label: "Höhe in m:", answer: d(H), check: LK.check.num(H, { abs: 0.01 }), solution: `${d(h)} : ${d(s)} = <i>H</i> : ${d(S)} ⇒ <i>H</i> = <b>${d(H)} m</b>` }; }
  function genK() { const s = rnd(2, 9), k = pick([1.5, 2, 2.5, 3, 4, 0.5]); return { html: `Entsprechende Seiten: ${d(s)} cm und ${d(s * k)} cm. Wie groß ist <i>k</i>?`, label: "<i>k</i> =", answer: d(k), check: LK.check.num(k, { abs: 1e-6 }), solution: `<i>k</i> = ${d(s * k)} : ${d(s)} = <b>${d(k)}</b>` }; }
  LK.trainer({ el: "#trainer", modes: [
    { id: "seite", label: "Fehlende Seite", gen: genSeite },
    { id: "k", label: "Faktor k", gen: genK },
    { id: "winkel", label: "Winkel", gen: genWinkel },
    { id: "schatten", label: "Schatten", gen: genSchatten }
  ] });

  LK.quiz({ box: "#quizBox", bar: "#qBar", progress: "#qProgress", key: "aedr.best", n: 8, questions: [
    { q: "Wie viele gleiche Winkel genügen für ähnliche Dreiecke?", o: ["einer", "zwei", "drei", "keiner"], a: 1, e: "Der dritte folgt aus der Winkelsumme." },
    { q: "Dreiecke 3, 4, 5 und 6, 8, 10 cm sind …", o: ["ähnlich (SSS)", "nicht ähnlich", "kongruent", "ähnlich (WW)"], a: 0, e: "Alle Verhältnisse 2." },
    { q: "Dreiecke 2, 3, 4 und 4, 6, 9 cm sind …", o: ["ähnlich", "nicht ähnlich", "kongruent", "rechtwinklig"], a: 1, e: "9 : 4 ≠ 2." },
    { q: "Was gehört zu SWS?", o: ["Zwei Seitenverhältnisse und der eingeschlossene Winkel", "Zwei Winkel", "Eine Seite und zwei Winkel", "Drei Winkel"], a: 0, e: "Der Winkel muss zwischen den Seiten liegen." },
    { q: "k = 2,5, Seite 4 cm. Entsprechende Seite?", o: ["6,5 cm", "10 cm", "1,6 cm", "8 cm"], a: 1, e: "2,5 · 4 = 10." },
    { q: "Stab 2 m, Schatten 1 m; Baum-Schatten 6 m. Baumhöhe?", o: ["3 m", "8 m", "12 m", "6 m"], a: 2, e: "Verhältnis 2 : 1." },
    { q: "Welche Seiten entsprechen sich?", o: ["Die gleich langen", "Die gegenüber gleichen Winkeln", "Die waagerechten", "Beliebige"], a: 1, e: "Zuordnung über die Winkel." },
    { q: "Sind alle gleichseitigen Dreiecke ähnlich?", o: ["Ja", "Nein", "Nur gleich große", "Nur rechtwinklige"], a: 0, e: "Alle Winkel 60°." }
  ] });

  LK.views(["verstehen", "entdecken", "pruefen", "ueben", "alltag", "quiz"], {});
})();
