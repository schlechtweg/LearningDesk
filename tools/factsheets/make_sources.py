# Generates the HTML sources for the one-page factsheets (rendered to PDF by build-factsheets.js).
HEAD = '''<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<title>Factsheet {title}</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:ital,wght@0,400;0,700;1,400&family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,700;12..96,800&family=JetBrains+Mono:wght@400;600&family=STIX+Two+Text:ital,wght@0,400;0,600;1,400&display=swap">
<link rel="stylesheet" href="factsheet.css">
<style>:root {{ --accent: {accent}; }} {extra}</style>
</head>
<body>
<div class="page">
  <header>
    <div>
      <div class="eyebrow">{eyebrow}</div>
      <h1>{title}</h1>
    </div>
    <span class="tag">Factsheet</span>
  </header>
'''
FOOT = '''  <footer><span>LearningDesk · Factsheet</span><span>Interaktiv üben: schlechtweg.github.io/LearningDesk/{app}.html</span></footer>
</div>
</body>
</html>
'''
X = "<i>x</i>"
def fr(n, d): return f'<span class="frac"><span>{n}</span><span>{d}</span></span>'
def m(s): return f'<span class="math">{s}</span>'

SHEETS = {}

SHEETS["osmose"] = dict(extra="body { font-size: 9pt; } .page { gap: 2.6mm; } .cols { gap: 2.6mm 5mm; }", title="Osmose", eyebrow="Biologie · Klasse 11 · Stofftransport", accent="#0d6f74", body=f'''
  <div class="kern">Osmose: <strong>Wasser</strong> wandert durch eine halbdurchlässige Membran zu der Seite mit <strong>mehr gelösten Teilchen</strong> (z.&nbsp;B. Salz, Zucker). Merksatz: <em>Das Wasser folgt dem Salz.</em></div>
  <div class="cols">
    <div class="box">
      <h2>Was braucht man für Osmose?</h2>
      <ol>
        <li>Zwei Lösungen mit <strong>unterschiedlich vielen gelösten Teilchen</strong>.</li>
        <li>Eine <strong>selektiv permeable</strong> (halbdurchlässige) Membran: lässt Wasser durch, gelöste Teilchen nicht.</li>
        <li>Teilchen bewegen sich von selbst (Brownsche Bewegung), also <strong>passiv</strong>, ohne Energie (kein ATP).</li>
      </ol>
      <p class="small">Wasser wandert in <strong>beide</strong> Richtungen. Zur konzentrierteren Seite wandert aber mehr, das ist der <strong>Nettostrom</strong>. Wasser geht vor allem durch Wasserkanäle (Aquaporine).</p>
    </div>
    <div class="box">
      <h2>Diffusion und Osmose</h2>
      <table>
        <tr><th></th><th>Diffusion</th><th>Osmose</th></tr>
        <tr><td>Was wandert?</td><td>alle Teilchen</td><td>nur Wasser</td></tr>
        <tr><td>Membran?</td><td>nicht nötig</td><td>halbdurchlässig</td></tr>
        <tr><td>Wohin?</td><td>von viel nach wenig</td><td>zur Seite mit mehr gelösten Teilchen</td></tr>
        <tr><td>Energie?</td><td colspan="2">nein, beides passiv</td></tr>
      </table>
    </div>
    <div class="box full">
      <h2>Hypotonisch · isotonisch · hypertonisch (Außenlösung im Vergleich zum Zellinneren)</h2>
      <table>
        <tr><th></th><th>hypotonisch (hypo = weniger)</th><th>isotonisch (iso = gleich)</th><th>hypertonisch (hyper = mehr)</th></tr>
        <tr><td>gelöste Teilchen außen</td><td>weniger als innen</td><td>gleich viele</td><td>mehr als innen</td></tr>
        <tr><td>Wasser strömt …</td><td>in die Zelle hinein</td><td>gleich viel rein wie raus</td><td>aus der Zelle heraus</td></tr>
        <tr><td>rote Blutzelle</td><td>schwillt an, platzt (<strong>Hämolyse</strong>)</td><td>normale Scheibenform</td><td>schrumpft, wird zackig (Stechapfelform)</td></tr>
        <tr><td>Pflanzenzelle</td><td>prall, hoher <strong>Turgor</strong>, platzt nicht (Zellwand)</td><td>Grenzplasmolyse</td><td>Zellinneres löst sich von der Wand (<strong>Plasmolyse</strong>)</td></tr>
        <tr><td>Beispiel</td><td>destilliertes Wasser, Regen</td><td>0,9 % Kochsalzlösung (Blut)</td><td>Salzwasser, Zuckerlösung</td></tr>
      </table>
    </div>
    <div class="box">
      <h2>Wichtige Begriffe</h2>
      <ul>
        <li><strong>Turgor</strong>: Druck des Zellinneren gegen die Zellwand, macht Pflanzen straff.</li>
        <li><strong>Plasmolyse / Deplasmolyse</strong>: Zelle verliert Wasser und löst sich von der Wand / nimmt wieder Wasser auf.</li>
        <li><strong>Vakuole</strong>: Wasserspeicher der Pflanzenzelle.</li>
        <li><strong>Osmotischer Druck</strong>: „Sog“ der konzentrierteren Lösung, umso größer, je größer der Unterschied.</li>
        <li><strong>Pulsierende Vakuole</strong>: Pumpblase von Einzellern im Süßwasser, pumpt eingeströmtes Wasser unter Energieaufwand hinaus.</li>
      </ul>
    </div>
    <div class="box">
      <h2>Osmose im Alltag</h2>
      <ul>
        <li>Gurkensalat salzen: Wasser tritt aus den Zellen aus, Gurken werden weich.</li>
        <li>Welker Salat in Wasser: Zellen nehmen Wasser auf, wieder knackig.</li>
        <li>Kirschen platzen im Regen: Zuckerreicher Zellsaft zieht Wasser an.</li>
        <li>Infusion mit 0,9 % NaCl: isotonisch, Blutzellen bleiben heil.</li>
        <li>Streusalz: Wurzeln können kein Wasser mehr aufnehmen.</li>
        <li>Marmelade, Honig, Salzhering: Bakterien wird Wasser entzogen, sie wachsen nicht.</li>
      </ul>
    </div>
    <div class="box warn full">
      <h2>Typische Fehler</h2>
      <ul>
        <li>„Das Salz wandert in die Zelle.“ <span class="no">Falsch</span>: Bei Osmose wandert nur das <strong>Wasser</strong>.</li>
        <li>„Isotonisch: kein Wasser bewegt sich.“ <span class="no">Falsch</span>: gleich viel in beide Richtungen, kein <em>Netto</em>strom.</li>
        <li>„hypertonisch“ immer mit Vergleich nennen, z.&nbsp;B. „hypertonisch <em>zum Zellinneren</em>“.</li>
        <li>Es zählt die <strong>Anzahl</strong> der Teilchen: NaCl zerfällt in Na⁺ und Cl⁻ und wirkt deshalb etwa doppelt so stark wie gleich viel Zucker.</li>
      </ul>
    </div>
  </div>''')

SHEETS["natrium-kalium-pumpe"] = dict(title="Natrium-Kalium-Pumpe", eyebrow="Biologie · Klasse 11 · Stofftransport & Nerven", accent="#8e2c5c", body=f'''
  <div class="kern">Die Na⁺/K⁺-Pumpe ist ein Protein in der Zellmembran. Pro Runde befördert sie <span class="na">3 Na⁺ hinaus</span> und <span class="k">2 K⁺ hinein</span> und verbraucht dabei <span class="atp">1 ATP</span>. Eselsbrücke: <em>Drei Natrium raus, zwei Kalium rein.</em></div>
  <div class="cols">
    <div class="box">
      <h2>Wo ist wie viel? (mmol/L, Nervenzelle)</h2>
      <table>
        <tr><th>Ion</th><th>innen</th><th>außen</th></tr>
        <tr><td><span class="na">Natrium Na⁺</span></td><td>wenig (≈ 12)</td><td>viel (≈ 145)</td></tr>
        <tr><td><span class="k">Kalium K⁺</span></td><td>viel (≈ 140)</td><td>wenig (≈ 4)</td></tr>
      </table>
      <p class="small">Merke: <strong>Natrium draußen, Kalium drinnen.</strong> Die Pumpe arbeitet <strong>gegen</strong> das Gefälle, also von „wenig“ nach „viel“. Das geht nur mit Energie.</p>
    </div>
    <div class="box">
      <h2>Steckbrief</h2>
      <ul>
        <li><strong>Aktiver Transport</strong> (primär aktiv): Energie direkt aus ATP, die Pumpe ist eine ATPase.</li>
        <li><strong>Antiport</strong>: zwei Ionensorten in entgegengesetzte Richtungen.</li>
        <li><strong>Elektrogen</strong>: netto +1 Ladung pro Runde nach außen.</li>
        <li><strong>Carrier, kein Kanal</strong>: immer nur zu einer Seite offen, ändert ihre Form.</li>
        <li>Läuft <strong>ständig</strong> in fast allen tierischen Zellen.</li>
      </ul>
    </div>
    <div class="box full">
      <h2>Der Pumpzyklus in 6 Schritten</h2>
      <table>
        <tr><th>1</th><td>Pumpe ist <strong>nach innen offen</strong> (E1): <span class="na">3 Na⁺</span> aus der Zelle binden.</td><th>4</th><td>Nach außen offen hält sie K⁺ gut fest: <span class="k">2 K⁺</span> binden von außen.</td></tr>
        <tr><th>2</th><td><span class="atp">ATP</span> wird gespalten, ein Phosphat wird an die Pumpe gehängt (<strong>Phosphorylierung</strong>), ADP wird frei.</td><th>5</th><td>Das Phosphat fällt ab (<strong>Dephosphorylierung</strong>).</td></tr>
        <tr><th>3</th><td>Pumpe klappt um, ist <strong>nach außen offen</strong> (E2) und gibt die Na⁺ nach außen ab.</td><th>6</th><td>Pumpe klappt zurück, ist nach innen offen und gibt die K⁺ ins Zellinnere ab.</td></tr>
      </table>
      <p class="small">Mit der Form ändert sich die <strong>Affinität</strong> (wie fest ein Ion gebunden wird): E1 bindet Na⁺ fest, E2 bindet K⁺ fest.</p>
    </div>
    <div class="box">
      <h2>Passiver und aktiver Transport</h2>
      <table>
        <tr><th></th><th>passiv</th><th>aktiv</th></tr>
        <tr><td>Richtung</td><td>von viel nach wenig</td><td>von wenig nach viel</td></tr>
        <tr><td>Energie</td><td>nein</td><td>ja, ATP</td></tr>
        <tr><td>Beispiel</td><td>Diffusion, Osmose, Ionenkanäle</td><td>Na⁺/K⁺-Pumpe</td></tr>
      </table>
      <p class="small"><strong>Sekundär aktiv</strong>: Andere Transporter nutzen den Na⁺-Gradienten als Antrieb, z.&nbsp;B. der Na⁺-Glucose-Symporter im Darm.</p>
    </div>
    <div class="box">
      <h2>Wozu braucht die Zelle die Pumpe?</h2>
      <ul>
        <li><strong>Ruhepotential</strong> (≈ −70 mV) und <strong>Nervensignale</strong>: Sie brauchen die Ionengradienten.</li>
        <li><strong>Zellvolumen</strong>: 3 Teilchen raus, 2 rein. Ohne Pumpe würde Wasser osmotisch einströmen und die Zelle anschwellen.</li>
        <li><strong>Nährstoffaufnahme</strong>: Antrieb für die Zuckeraufnahme im Darm.</li>
        <li><strong>Energiefresser</strong>: etwa ¼ bis ⅓ des ATP in Ruhe, im Gehirn mehr.</li>
        <li><strong>Hemmstoffe</strong>: Ouabain, Digitalis (Herzmedikament).</li>
      </ul>
    </div>
    <div class="box warn full">
      <h2>Typische Fehler</h2>
      <ul>
        <li>„1 Na⁺ gegen 1 K⁺.“ <span class="no">Falsch</span>: Es sind <strong>3 Na⁺ gegen 2 K⁺</strong>.</li>
        <li>„Die Pumpe sorgt für die Repolarisation beim Aktionspotential.“ <span class="no">Falsch</span>: Das machen <strong>spannungsgesteuerte K⁺-Kanäle</strong>. Die Pumpe stellt nur langfristig die Gradienten wieder her.</li>
        <li>„Die Pumpe erzeugt das Ruhepotential direkt.“ Nur zu einem kleinen Teil. Es entsteht vor allem durch K⁺, das durch offene Kanäle ausströmt.</li>
        <li>„Fällt die Pumpe aus, ist das Potential sofort weg.“ <span class="no">Falsch</span>: Die Gradienten zerfallen <strong>langsam</strong>.</li>
      </ul>
    </div>
  </div>''')

SHEETS["ableiten"] = dict(title="Ableiten", eyebrow="Mathematik · Klasse 11 · Differentialrechnung", accent="#24539c", body=f'''
  <div class="kern">Die Ableitung {m(f"<i>f</i>′(<i>x</i><sub>0</sub>)")} gibt an, <strong>wie steil</strong> der Graph an der Stelle {m(f"<i>x</i><sub>0</sub>")} ist. Sie ist die <strong>Steigung der Tangente</strong> in diesem Punkt. Positiv heißt bergauf, negativ bergab, 0 heißt waagerecht.</div>
  <div class="cols">
    <div class="box">
      <h2>Von der Sekante zur Tangente</h2>
      <p>Differenzenquotient (Sekantensteigung, mittlere Änderungsrate):</p>
      <p class="big">{m(f"<i>m</i><sub>s</sub> = " + fr("<i>f</i>(<i>x</i><sub>0</sub>+<i>h</i>) − <i>f</i>(<i>x</i><sub>0</sub>)", "<i>h</i>"))}</p>
      <p>Differentialquotient (Tangentensteigung, momentane Änderungsrate):</p>
      <p class="big">{m(f"<i>f</i>′(<i>x</i><sub>0</sub>) = lim<sub><i>h</i>→0</sub> " + fr("<i>f</i>(<i>x</i><sub>0</sub>+<i>h</i>) − <i>f</i>(<i>x</i><sub>0</sub>)", "<i>h</i>"))}</p>
    </div>
    <div class="box">
      <h2>Ableitungsregeln</h2>
      <table>
        <tr><th>Regel</th><th>allgemein</th><th>Beispiel</th></tr>
        <tr><td>Konstante</td><td>{m("<i>c</i> → 0")}</td><td>{m("7 → 0")}</td></tr>
        <tr><td>Potenz</td><td>{m(f"{X}<sup><i>n</i></sup> → <i>n</i>·{X}<sup><i>n</i>−1</sup>")}</td><td>{m(f"{X}<sup>5</sup> → 5{X}<sup>4</sup>")}</td></tr>
        <tr><td>Faktor</td><td>{m("<i>c</i>·<i>g</i> → <i>c</i>·<i>g</i>′")}</td><td>{m(f"3{X}<sup>4</sup> → 12{X}<sup>3</sup>")}</td></tr>
        <tr><td>Summe</td><td>{m("<i>g</i> + <i>h</i> → <i>g</i>′ + <i>h</i>′")}</td><td>{m(f"{X}<sup>2</sup> + 4{X} → 2{X} + 4")}</td></tr>
        <tr><td>Bruch</td><td>{m(fr(1, X) + f" = {X}<sup>−1</sup>")}</td><td>{m("→ −" + fr(1, f"{X}<sup>2</sup>"))}</td></tr>
        <tr><td>Wurzel</td><td>{m(f"√{X} = {X}<sup>1/2</sup>")}</td><td>{m("→ " + fr(1, f"2√{X}"))}</td></tr>
        <tr><td>sin, cos</td><td>{m("sin′ = cos")}</td><td>{m("cos′ = −sin")}</td></tr>
      </table>
      <p class="small">Kochrezept Potenzregel: Hochzahl nach vorne malnehmen, dann Hochzahl um 1 verringern.</p>
    </div>
    <div class="box">
      <h2>Grafisch ableiten</h2>
      <table>
        <tr><th>am Graphen von <i>f</i></th><th>beim Graphen von <i>f</i>′</th></tr>
        <tr><td><i>f</i> steigt</td><td><i>f</i>′ über der x-Achse</td></tr>
        <tr><td><i>f</i> fällt</td><td><i>f</i>′ unter der x-Achse</td></tr>
        <tr><td>Hoch-/Tiefpunkt</td><td>Nullstelle mit Vorzeichenwechsel</td></tr>
        <tr><td>Sattelpunkt</td><td>Nullstelle ohne Vorzeichenwechsel</td></tr>
        <tr><td>Wendepunkt (am steilsten)</td><td>Hoch- oder Tiefpunkt</td></tr>
        <tr><td>Gerade</td><td>waagerechte Linie</td></tr>
        <tr><td>Grad <i>n</i></td><td>Grad <i>n</i> − 1</td></tr>
      </table>
    </div>
    <div class="box">
      <h2>Tangentengleichung</h2>
      <p class="big">{m("<i>t</i>(<i>x</i>) = <i>f</i>′(<i>x</i><sub>0</sub>)·(<i>x</i> − <i>x</i><sub>0</sub>) + <i>f</i>(<i>x</i><sub>0</sub>)")}</p>
      <ol>
        <li>Punkt berechnen: {m("<i>f</i>(<i>x</i><sub>0</sub>)")}</li>
        <li>Ableitung bilden: {m("<i>f</i>′(<i>x</i>)")}</li>
        <li>Steigung: {m("<i>m</i> = <i>f</i>′(<i>x</i><sub>0</sub>)")}</li>
        <li>Einsetzen und vereinfachen zu {m("<i>t</i>(<i>x</i>) = <i>mx</i> + <i>b</i>")}</li>
      </ol>
      <p class="small">Beispiel: {m(f"<i>f</i>({X}) = {X}<sup>2</sup>")}, {m("<i>x</i><sub>0</sub> = 1")}: {m("<i>f</i>(1) = 1")}, {m(f"<i>f</i>′({X}) = 2{X}")}, {m("<i>m</i> = 2")}, also {m("1 = 2·1 + <i>b</i> ⇒ <i>b</i> = −1")} und {m(f"<i>t</i>({X}) = 2{X} − 1")}.</p>
    </div>
    <div class="box warn full">
      <h2>Typische Fehler</h2>
      <ul>
        <li>{m(f"({X}<sup>3</sup>)′ = 3{X}<sup>3</sup>")} <span class="no">falsch</span>: Die Hochzahl wird kleiner, {m(f"3{X}<sup>2</sup>")}.</li>
        <li>Konstante nicht vergessen wegzulassen: {m(f"({X}<sup>2</sup> + 5)′ = 2{X}")}. Und {m(f"(5{X})′ = 5")}.</li>
        <li>{m(fr(1, f"{X}<sup>2</sup>"))} erst als {m(f"{X}<sup>−2</sup>")} schreiben. Bei negativen Hochzahlen wird sie noch kleiner: −2 − 1 = −3.</li>
        <li>{m(f"<i>f</i>′ &lt; 0")} heißt „<i>f</i> fällt“, nicht „<i>f</i> ist negativ“.</li>
      </ul>
    </div>
  </div>''')

SQ = '''<svg viewBox="0 0 120 120" width="30mm" height="30mm" style="float:right; margin-left:3mm">
  <rect x="2" y="2" width="76" height="76" fill="rgba(47,95,179,.18)" stroke="#2f5fb3"/>
  <rect x="78" y="2" width="40" height="76" fill="rgba(61,138,76,.18)" stroke="#3d8a4c"/>
  <rect x="2" y="78" width="76" height="40" fill="rgba(61,138,76,.18)" stroke="#3d8a4c"/>
  <rect x="78" y="78" width="40" height="40" fill="rgba(196,86,28,.2)" stroke="#c4561c"/>
  <g font-family="STIX Two Text, serif" font-style="italic" text-anchor="middle">
    <text x="40" y="45" font-size="18" fill="#2f5fb3">a²</text><text x="98" y="45" font-size="13" fill="#3d8a4c">ab</text>
    <text x="40" y="103" font-size="13" fill="#3d8a4c">ab</text><text x="98" y="103" font-size="13" fill="#c4561c">b²</text>
  </g></svg>'''
SHEETS["binomische-formeln"] = dict(title="Binomische Formeln", eyebrow="Mathematik · Klasse 8 · Terme", accent="#1f6e8c", body=f'''
  <div class="kern">Wenn man eine Klammer mit zwei Teilen (ein <strong>Binom</strong>) mit sich selbst malnimmt, entsteht immer dasselbe Muster. Mit den drei binomischen Formeln löst du solche Klammern blitzschnell auf, vorwärts und rückwärts.</div>
  <div class="cols">
    <div class="box full">
      <h2>Die drei Formeln</h2>
      <table>
        <tr><th>1. Formel (Plus)</th><th>2. Formel (Minus)</th><th>3. Formel (Plus-Minus)</th></tr>
        <tr><td class="big">{m('(<i class="ca">a</i> + <i class="cb">b</i>)<sup>2</sup> = <i>a</i><sup>2</sup> + <span class="cab">2<i>ab</i></span> + <i>b</i><sup>2</sup>')}</td>
            <td class="big">{m('(<i class="ca">a</i> − <i class="cb">b</i>)<sup>2</sup> = <i>a</i><sup>2</sup> − <span class="cab">2<i>ab</i></span> + <i>b</i><sup>2</sup>')}</td>
            <td class="big">{m('(<i class="ca">a</i> + <i class="cb">b</i>)(<i class="ca">a</i> − <i class="cb">b</i>) = <i>a</i><sup>2</sup> − <i>b</i><sup>2</sup>')}</td></tr>
        <tr><td>{m(f"({X} + 3)<sup>2</sup> = {X}<sup>2</sup> + 6{X} + 9")}</td><td>{m(f"({X} − 5)<sup>2</sup> = {X}<sup>2</sup> − 10{X} + 25")}</td><td>{m(f"({X} + 4)({X} − 4) = {X}<sup>2</sup> − 16")}</td></tr>
      </table>
    </div>
    <div class="box">
      <h2>Merkschema</h2>
      <ol>
        <li><strong>Erster Teil hoch 2</strong>: {m("<i>a</i><sup>2</sup>")}</li>
        <li><strong>2 · erster · zweiter</strong>: {m("2<i>ab</i>")} (Mittelglied, Vorzeichen wie in der Klammer)</li>
        <li><strong>Zweiter Teil hoch 2</strong>: {m("<i>b</i><sup>2</sup>")}, immer mit Plus</li>
      </ol>
      <p class="small">Bei der 3. Formel heben sich {m("+<i>ab</i>")} und {m("−<i>ab</i>")} auf.</p>
    </div>
    <div class="box">
      <h2>Warum? Das Flächenmodell</h2>
      <p>{SQ}Ein Quadrat mit Seite {m("<i>a</i> + <i>b</i>")} besteht aus {m("<i>a</i><sup>2</sup>")}, zwei Rechtecken {m("<i>ab</i>")} und {m("<i>b</i><sup>2</sup>")}. Darum ist {m("(<i>a</i> + <i>b</i>)<sup>2</sup> = <i>a</i><sup>2</sup> + 2<i>ab</i> + <i>b</i><sup>2</sup>")}.</p>
      <p class="small">Oder „jeder mit jedem“: {m("(<i>a</i>+<i>b</i>)(<i>a</i>+<i>b</i>) = <i>a</i><sup>2</sup> + <i>ab</i> + <i>ba</i> + <i>b</i><sup>2</sup>")}</p>
    </div>
    <div class="box">
      <h2>Beispiel Schritt für Schritt</h2>
      <p>{m(f"(2{X} + 5)<sup>2</sup>")} mit {m(f"<i>a</i> = 2{X}")}, {m("<i>b</i> = 5")}:</p>
      <ol>
        <li>{m(f"<i>a</i><sup>2</sup> = (2{X})<sup>2</sup> = 4{X}<sup>2</sup>")}</li>
        <li>{m(f"2<i>ab</i> = 2 · 2{X} · 5 = 20{X}")}</li>
        <li>{m("<i>b</i><sup>2</sup> = 25")}</li>
      </ol>
      <p>Ergebnis: {m(f"4{X}<sup>2</sup> + 20{X} + 25")}</p>
    </div>
    <div class="box">
      <h2>Rückwärts (faktorisieren)</h2>
      <ol>
        <li>Suche zwei Quadrate: {m(f"{X}<sup>2</sup>")} und {m("9")}, also {m(f"<i>a</i> = {X}")}, {m("<i>b</i> = 3")}.</li>
        <li>Prüfe das Mittelglied: {m(f"2 · {X} · 3 = 6{X}")}.</li>
        <li>Vorzeichen entscheidet: {m(f"{X}<sup>2</sup> − 6{X} + 9 = ({X} − 3)<sup>2</sup>")}</li>
        <li>Kein Mittelglied, Minus dazwischen: 3. Formel, {m(f"{X}<sup>2</sup> − 9 = ({X}+3)({X}−3)")}</li>
      </ol>
    </div>
    <div class="box">
      <h2>Kopfrechen-Trick</h2>
      <ul>
        <li>{m("21<sup>2</sup> = (20 + 1)<sup>2</sup> = 400 + 40 + 1 = 441")}</li>
        <li>{m("49<sup>2</sup> = (50 − 1)<sup>2</sup> = 2500 − 100 + 1 = 2401")}</li>
        <li>{m("32 · 28 = (30 + 2)(30 − 2) = 900 − 4 = 896")}</li>
      </ul>
    </div>
    <div class="box warn">
      <h2>Typische Fehler</h2>
      <ul>
        <li>{m(f"({X} + 3)<sup>2</sup> = {X}<sup>2</sup> + 9")} <span class="no">falsch</span>: Das Mittelglied {m(f"6{X}")} fehlt!</li>
        <li>{m(f"({X} − 5)<sup>2</sup> = … − 25")} <span class="no">falsch</span>: am Ende immer <strong>+</strong> 25.</li>
        <li>{m(f"(3{X})<sup>2</sup> = 3{X}<sup>2</sup>")} <span class="no">falsch</span>: richtig ist {m(f"9{X}<sup>2</sup>")}.</li>
        <li>Die <strong>2</strong> im Mittelglied vergessen.</li>
      </ul>
    </div>
  </div>''')

SHEETS["bruchterme"] = dict(title="Bruchterme", eyebrow="Mathematik · Klasse 8 · Terme", accent="#2d6a4f", body=f'''
  <div class="kern">Ein <strong>Bruchterm</strong> hat eine Variable im <strong>Nenner</strong>, z.&nbsp;B. {m(fr(5, X))} oder {m(fr(f"{X} + 1", f"{X} − 2"))}. Man rechnet damit wie mit normalen Brüchen. Aber: <strong>Durch 0 darf man nicht teilen!</strong></div>
  <div class="cols">
    <div class="box">
      <h2>Definitionsmenge D</h2>
      <p>Alle Zahlen, die man einsetzen darf. Verboten sind die Zahlen, für die der <strong>Nenner 0</strong> wird.</p>
      <ol>
        <li>Nenner gleich 0 setzen.</li>
        <li>Nach {X} auflösen.</li>
        <li>Diese Zahlen ausschließen.</li>
      </ol>
      <p>{m(fr(5, f"{X} − 2"))}: {m(f"{X} − 2 = 0 ⇒ {X} = 2")}, also {m("D = ℚ \\ {2}")}</p>
      <p>{m(fr(1, f"{X}({X} + 3)"))}: {m("D = ℚ \\ {−3; 0}")} (ein Faktor = 0)</p>
      <p>{m(fr(1, f"{X}<sup>2</sup> − 9"))} = {m(fr(1, f"({X}+3)({X}−3)"))}: {m("D = ℚ \\ {−3; 3}")}</p>
    </div>
    <div class="box">
      <h2>Kürzen und Erweitern</h2>
      <p><strong>Kürzen</strong>: Zähler und Nenner durch dasselbe teilen. <strong>Erweitern</strong>: mit demselben malnehmen. Der Wert bleibt gleich.</p>
      <p><strong>Nur Faktoren kürzen</strong>, keine Summanden! <em>„Aus Summen kürzen nur die Dummen.“</em></p>
      <p>{m(fr(f"6{X}<sup>2</sup>", f"9{X}") + " = " + fr(f"2{X}", "3"))} &nbsp; {m(fr(f"3{X} + 6", "3") + " = " + fr(f"3({X} + 2)", "3") + f" = {X} + 2")}</p>
      <p>{m(fr(f"{X}<sup>2</sup> − 9", f"{X} + 3") + " = " + fr(f"({X}+3)({X}−3)", f"{X} + 3") + f" = {X} − 3")}</p>
      <p class="small">Tipp: Erst ausklammern oder mit binomischen Formeln zerlegen, dann kürzen.</p>
    </div>
    <div class="box full">
      <h2>Rechenregeln</h2>
      <table>
        <tr><th>Rechenart</th><th>Regel</th><th>Beispiel</th></tr>
        <tr><td>Multiplizieren</td><td>Zähler mal Zähler, Nenner mal Nenner, dann kürzen</td><td>{m(fr(f"2{X}", 3) + " · " + fr(9, f"4{X}<sup>2</sup>") + " = " + fr(f"18{X}", f"12{X}<sup>2</sup>") + " = " + fr(3, f"2{X}"))}</td></tr>
        <tr><td>Dividieren</td><td>mit dem <strong>Kehrwert</strong> des zweiten Bruchs malnehmen</td><td>{m(fr(3, X) + " : " + fr(6, f"{X}<sup>2</sup>") + " = " + fr(3, X) + " · " + fr(f"{X}<sup>2</sup>", 6) + " = " + fr(X, 2))}</td></tr>
        <tr><td>Addieren, gleicher Nenner</td><td>Zähler addieren, Nenner bleibt</td><td>{m(fr(3, f"{X} + 1") + " + " + fr(5, f"{X} + 1") + " = " + fr(8, f"{X} + 1"))}</td></tr>
        <tr><td>Addieren, verschiedene Nenner</td><td>erst auf den <strong>Hauptnenner</strong> erweitern, dann Zähler addieren</td><td>{m(fr(2, X) + " + " + fr(3, f"2{X}") + " = " + fr(4, f"2{X}") + " + " + fr(3, f"2{X}") + " = " + fr(7, f"2{X}"))}</td></tr>
      </table>
    </div>
    <div class="box">
      <h2>Hauptnenner finden</h2>
      <ol>
        <li>Alle Nenner in Faktoren zerlegen: {m(f"2{X} = 2·{X}")}, {m(f"{X}<sup>2</sup> = {X}·{X}")}</li>
        <li>Jeden Faktor so oft nehmen, wie er höchstens in einem Nenner vorkommt: {m(f"2·{X}·{X} = 2{X}<sup>2</sup>")}</li>
        <li>Nichts gemeinsam? Dann das Produkt: {m(fr(1, X) + " + " + fr(1, f"{X}+1") + " = " + fr(f"2{X}+1", f"{X}({X}+1)"))}</li>
      </ol>
    </div>
    <div class="box warn">
      <h2>Typische Fehler</h2>
      <ul>
        <li>{m(fr(f"{X} + 3", X) + " = 3")} <span class="no">falsch</span>: Das {X} oben ist ein Summand, kein Faktor.</li>
        <li>Nenner addieren: {m(fr(1, X) + " + " + fr(1, 2) + " ≠ " + fr(2, f"{X} + 2"))}</li>
        <li>Minus vor einem Bruch: Zähler in Klammern setzen, {m(fr(f"5 − (2 + {X})", X))}</li>
        <li>Beim Teilen den falschen Bruch umdrehen.</li>
        <li>Die Definitionsmenge vergessen.</li>
      </ul>
    </div>
  </div>''')

for name, s in SHEETS.items():
    html = HEAD.format(**{"extra": "", **s}) + s["body"] + "\n" + FOOT.format(eyebrow=s["eyebrow"], app=name)
    open(f"{name}.html", "w").write(html)
    print("wrote", name)
