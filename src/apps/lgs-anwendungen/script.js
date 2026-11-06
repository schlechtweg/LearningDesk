(function () {
  "use strict";
  const { $, pick, rnd, shuffle, fmt } = LK;
  const eur = (c) => (c / 100).toFixed(2).replace(".", ",");
  const I = (v) => `<i>${v}</i>`;

  // Each story: text, right system, two plausible wrong systems, values and labels.
  const stories = [
    () => { const e = rnd(2, 9), k = rnd(2, 9), pe = pick([8, 9, 10, 12]), pk = pick([4, 5, 6]); const n = e + k, t = e * pe + k * pk;
      return { text: `${n} Personen zahlen im Kino zusammen ${t} €. Erwachsene zahlen ${pe} €, Kinder ${pk} €. Wie viele Erwachsene und wie viele Kinder?`,
        right: `${I("e")} + ${I("k")} = ${n}<br>${pe}${I("e")} + ${pk}${I("k")} = ${t}`,
        wrong: [`${I("e")} + ${I("k")} = ${t}<br>${pe}${I("e")} + ${pk}${I("k")} = ${n}`, `${I("e")} + ${I("k")} = ${n}<br>${pk}${I("e")} + ${pe}${I("k")} = ${t}`],
        vals: [e, k], ask: "Erwachsene; Kinder" }; },
    () => { const b = rnd(4, 30), d = rnd(2, 12), s = 2 * b + d;
      return { text: `Die Summe zweier Zahlen ist ${s}. Ihre Differenz ist ${d}. Wie heißen die Zahlen (größere zuerst)?`,
        right: `${I("a")} + ${I("b")} = ${s}<br>${I("a")} − ${I("b")} = ${d}`,
        wrong: [`${I("a")} + ${I("b")} = ${d}<br>${I("a")} − ${I("b")} = ${s}`, `${I("a")} · ${I("b")} = ${s}<br>${I("a")} − ${I("b")} = ${d}`],
        vals: [b + d, b], ask: "größere; kleinere" }; },
    () => { const k = rnd(6, 15), diff = rnd(24, 34), y = pick([3, 4, 5, 6, 10]); const m = k + diff;
      return { text: `Eine Mutter ist ${diff} Jahre älter als ihre Tochter. In ${y} Jahren sind beide zusammen ${m + k + 2 * y} Jahre alt. Wie alt sind beide heute?`,
        right: `${I("m")} = ${I("t")} + ${diff}<br>(${I("m")} + ${y}) + (${I("t")} + ${y}) = ${m + k + 2 * y}`,
        wrong: [`${I("t")} = ${I("m")} + ${diff}<br>(${I("m")} + ${y}) + (${I("t")} + ${y}) = ${m + k + 2 * y}`, `${I("m")} = ${I("t")} + ${diff}<br>${I("m")} + ${I("t")} = ${m + k + 2 * y}`],
        vals: [m, k], ask: "Mutter; Tochter" }; },
    () => { const a = pick([30, 40, 50, 60]), bb = pick([70, 80, 90, 120]), na = rnd(2, 5), nb = rnd(1, 4), ma = rnd(1, 4), mb = rnd(2, 5); if (na * mb === nb * ma) return stories[3]();
      return { text: `${na} Hefte und ${nb} Stifte kosten ${eur(na * a + nb * bb)} €, ${ma} Hefte und ${mb} Stifte kosten ${eur(ma * a + mb * bb)} €. Was kostet ein Heft, was ein Stift (in ct)?`,
        right: `${na}${I("h")} + ${nb}${I("s")} = ${na * a + nb * bb}<br>${ma}${I("h")} + ${mb}${I("s")} = ${ma * a + mb * bb}`,
        wrong: [`${na}${I("h")} + ${ma}${I("s")} = ${na * a + nb * bb}<br>${nb}${I("h")} + ${mb}${I("s")} = ${ma * a + mb * bb}`, `${I("h")} + ${I("s")} = ${na * a + nb * bb}<br>${ma}${I("h")} + ${mb}${I("s")} = ${ma * a + mb * bb}`],
        vals: [a, bb], ask: "Heft; Stift" }; },
    () => { const b = rnd(3, 14), d = rnd(2, 8); const u = 2 * (2 * b + d);
      return { text: `Ein Rechteck hat den Umfang ${u} cm. Die Länge ist um ${d} cm größer als die Breite. Wie lang sind die Seiten?`,
        right: `2${I("l")} + 2${I("b")} = ${u}<br>${I("l")} = ${I("b")} + ${d}`,
        wrong: [`${I("l")} + ${I("b")} = ${u}<br>${I("l")} = ${I("b")} + ${d}`, `2${I("l")} + 2${I("b")} = ${u}<br>${I("b")} = ${I("l")} + ${d}`],
        vals: [b + d, b], ask: "Länge; Breite" }; },
    () => { const h = rnd(4, 20), k = rnd(3, 15);
      return { text: `Auf einem Hof leben Hühner und Kaninchen, zusammen ${h + k} Tiere mit ${2 * h + 4 * k} Beinen. Wie viele Hühner und Kaninchen?`,
        right: `${I("h")} + ${I("k")} = ${h + k}<br>2${I("h")} + 4${I("k")} = ${2 * h + 4 * k}`,
        wrong: [`${I("h")} + ${I("k")} = ${2 * h + 4 * k}<br>2${I("h")} + 4${I("k")} = ${h + k}`, `${I("h")} + ${I("k")} = ${h + k}<br>4${I("h")} + 2${I("k")} = ${2 * h + 4 * k}`],
        vals: [h, k], ask: "Hühner; Kaninchen" }; },
    () => { const v = rnd(6, 18), s = rnd(1, 5);
      return { text: `Ein Boot fährt flussabwärts ${v + s} km/h, flussaufwärts ${v - s} km/h. Wie schnell ist das Boot im stehenden Wasser und wie schnell die Strömung?`,
        right: `${I("v")} + ${I("s")} = ${v + s}<br>${I("v")} − ${I("s")} = ${v - s}`,
        wrong: [`${I("v")} + ${I("s")} = ${v - s}<br>${I("v")} − ${I("s")} = ${v + s}`, `${I("v")} · ${I("s")} = ${v + s}<br>${I("v")} − ${I("s")} = ${v - s}`],
        vals: [v, s], ask: "Boot; Strömung" }; }
  ];

  // ---------- set-up exercise ----------
  let cur = null, score = 0, total = 0, answered = false;
  function nextStory() {
    cur = pick(stories)(); answered = false;
    $("#aText").textContent = ""; $("#aText").innerHTML = cur.text;
    const opts = shuffle([{ h: cur.right, ok: true }, ...cur.wrong.map((h) => ({ h, ok: false }))]);
    $("#aOpts").innerHTML = opts.map((o, i) => `<button type="button" data-i="${i}">${o.h}</button>`).join("");
    $("#aOpts").querySelectorAll("button").forEach((b) => b.addEventListener("click", () => {
      if (answered) return; answered = true; total++;
      const o = opts[+b.dataset.i];
      if (o.ok) score++;
      $("#aOpts").querySelectorAll("button").forEach((x) => x.classList.add(opts[+x.dataset.i].ok ? "right" : "wrong"));
      $("#aFb").innerHTML = o.ok ? `Richtig! Lösung: ${cur.ask.split("; ")[0]} ${cur.vals[0]}, ${cur.ask.split("; ")[1]} ${cur.vals[1]}.` : "Nicht ganz. Vergleiche jede Gleichung Wort für Wort mit dem Text.";
      $("#aScore").textContent = `${score} von ${total} richtig`;
    }));
    $("#aFb").textContent = "";
  }
  $("#aNext").addEventListener("click", nextStory);
  nextStory();

  // ---------- trainer ----------
  const pair = (st) => ({ html: st.text, label: `${st.ask}:`, placeholder: "z. B. 3; 5", answer: `${st.vals[0]}; ${st.vals[1]}`,
    check: (raw) => { const p = String(raw).replace(/[()]/g, "").split(/[;|]/).map((t) => LK.parseNum(t.trim())); if (p.length !== 2 || p.some(isNaN)) return { ok: false, msg: "Zwei Zahlen, getrennt durch <code>;</code>." }; if (p[0] === st.vals[1] && p[1] === st.vals[0] && st.vals[0] !== st.vals[1]) return { ok: false, msg: "Fast: Achte auf die Reihenfolge." }; return p[0] === st.vals[0] && p[1] === st.vals[1] ? { ok: true } : { ok: false, msg: "Stelle die beiden Gleichungen auf und prüfe am Text." }; },
    solution: `<span class="math">${st.right.replace("<br>", ", ")}</span> ⇒ <b>${st.vals[0]}; ${st.vals[1]}</b>` });
  LK.trainer({ el: "#trainer", modes: [
    { id: "anzahl", label: "Anzahlen", gen: () => pair(pick([stories[0], stories[5]])()) },
    { id: "preise", label: "Preise", gen: () => pair(stories[3]()) },
    { id: "zahlen", label: "Zahlen und Alter", gen: () => pair(pick([stories[1], stories[2]])()) },
    { id: "geo", label: "Geometrie und Bewegung", gen: () => pair(pick([stories[4], stories[6]])()) }
  ] });

  LK.quiz({ box: "#quizBox", bar: "#qBar", progress: "#qProgress", key: "lgsanw.best", n: 8, questions: [
    { q: "Wie viele Gleichungen braucht man für zwei Unbekannte?", o: ["eine", "zwei", "drei", "keine"], a: 1, e: "Zwei unabhängige Informationen." },
    { q: "„Anna ist 4 Jahre älter als Ben.“ Welche Gleichung passt?", o: ["b = a + 4", "a = b + 4", "a + b = 4", "a = 4b"], a: 1, e: "Annas Alter = Bens Alter + 4." },
    { q: "„Doppelt so viele Mädchen wie Jungen“:", o: ["j = 2m", "m = 2j", "m + j = 2", "m = j + 2"], a: 1, e: "Die Mädchenzahl ist das Doppelte der Jungenzahl." },
    { q: "Die Lösung ergibt 3,5 Kinder. Was tun?", o: ["Auf 4 runden", "Ansatz und Rechnung prüfen", "So stehen lassen", "Abrunden"], a: 1, e: "Halbe Personen sind nicht sinnvoll: Fehler suchen." },
    { q: "Preise in € und ct gemischt. Was tun?", o: ["Egal", "Auf eine Einheit umrechnen", "ct weglassen", "Mit 10 multiplizieren"], a: 1, e: "Alle Angaben in derselben Einheit." },
    { q: "Hühner (2 Beine) und Kühe (4 Beine), 10 Tiere, 28 Beine. Wie viele Kühe?", o: ["4", "6", "5", "3"], a: 0, e: "h + k = 10, 2h + 4k = 28 ⇒ k = 4." },
    { q: "Was gehört an den Schluss einer Textaufgabe?", o: ["Nur die Zahlen", "Ein Antwortsatz", "Eine Skizze", "Nichts"], a: 1, e: "Die Antwort auf die gestellte Frage." },
    { q: "Summe 20, Differenz 4. Die Zahlen?", o: ["12 und 8", "16 und 4", "10 und 10", "14 und 6"], a: 0, e: "a + b = 20, a − b = 4 ⇒ a = 12." }
  ] });

  LK.views(["verstehen", "aufstellen", "ueben", "alltag", "quiz"], {});
})();
