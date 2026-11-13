# Generates the HTML sources of the one-page factsheets into the directory given as argument.
# Called by src/build.py --pdf; render-pdf.js turns them into PDFs.
import os, shutil, sys
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


def kb(t): return f'<span class="key">{t}</span>'
SHEETS["classpad"] = dict(title="ClassPad: Bedienung", eyebrow="Taschenrechner · Spickzettel · Klasse 8 bis 12", accent="#1f5f9e",
  extra="body { font-size: 8.6pt; } .page { gap: 2.4mm; padding-top: 9mm; } .cols { gap: 2.4mm 4.5mm; } .box { padding: 2mm 3mm; gap: 1mm; } th, td { padding: 0.7mm 1.3mm; } .kern { font-size: 10.5pt; padding: 2mm 3mm; } header h1 { font-size: 22pt; } .key { font-family: var(--font-mono); font-size: 0.86em; border: 1px solid #9aa6b2; border-bottom-width: 2px; border-radius: 1.2mm; padding: 0 1.2mm; background: #f4f6f8; white-space: nowrap; } td:first-child { white-space: nowrap; font-weight: 700; }",
  body=f"""
  <div class="kern">Für normale Rechnungen nutzt du die Anwendung <strong>Main</strong>, für Funktionen <strong>Graph&amp;Tabelle</strong>, für Daten <strong>Statistik</strong>. Gewechselt wird über {kb("▦ Menü")}. Schreibweise unten: Menü ▸ Untermenü ▸ Befehl.</div>
  <div class="cols">
    <div class="box">
      <h2>Wichtige Tasten</h2>
      <table>
        <tr><td>{kb("EXE")}</td><td>Rechnung ausführen, Eingabe bestätigen</td></tr>
        <tr><td>{kb("Keyboard")}</td><td>Bildschirm-Tastatur ein/aus (Math1, Math2, Trig, abc)</td></tr>
        <tr><td>{kb("⌫")}</td><td>ein Zeichen links vom Cursor löschen</td></tr>
        <tr><td>{kb("Clear")}</td><td>ganze Eingabezeile löschen, Analyse beenden</td></tr>
        <tr><td>{kb("◀")} {kb("▶")}</td><td>Cursor bewegen; im Graphen zur nächsten Lösung</td></tr>
        <tr><td>{kb("▲")}</td><td>frühere Eingabe zurückholen</td></tr>
        <tr><td>{kb("(−)")} / {kb("−")}</td><td>Vorzeichen / Minus-Rechenzeichen</td></tr>
        <tr><td>{kb("ans")}</td><td>letztes Ergebnis weiterverwenden</td></tr>
      </table>
    </div>
    <div class="box">
      <h2>Statusleiste (unten) antippen</h2>
      <table>
        <tr><td>Standard / Dezimal</td><td>exakte Ergebnisse (19/12, 2√2) oder Dezimalzahlen</td></tr>
        <tr><td>Deg / Rad</td><td>Grad oder Bogenmaß. <strong>Vor jeder Trigonometrie-Aufgabe prüfen!</strong></td></tr>
      </table>
      <p class="small">{kb("⇔")} in der Symbolleiste von Main wandelt nur das letzte Ergebnis um (exakt ↔ dezimal).</p>
      <h2 style="margin-top:1.5mm">Bildschirm-Tastatur</h2>
      <table>
        <tr><td>Math1</td><td>□/□ (Bruch), √□, x², π, eˣ, ln, log, |x|, solve(</td></tr>
        <tr><td>Math2</td><td>diff(, ∫(, expand(, factor(, simplify(</td></tr>
        <tr><td>Trig</td><td>sin, cos, tan, sin⁻¹, cos⁻¹, tan⁻¹</td></tr>
      </table>
      <p class="small">Bruch: Zähler tippen, mit {kb("▶")} in den Nenner, mit {kb("▶")} wieder heraus.</p>
    </div>
    <div class="box full">
      <h2>Main: typische Aufgaben</h2>
      <table>
        <tr><th>Aufgabe</th><th>Eingabe</th><th>Ergebnis</th><th>auch über</th></tr>
        <tr><td>Klammern auflösen</td><td>{m("expand((x+3)^2)")}</td><td>{m("<i>x</i><sup>2</sup>+6<i>x</i>+9")}</td><td>Aktion ▸ Umformung ▸ expand</td></tr>
        <tr><td>Faktorisieren</td><td>{m("factor(x^2−9)")}</td><td>{m("(<i>x</i>−3)(<i>x</i>+3)")}</td><td>Aktion ▸ Umformung ▸ factor</td></tr>
        <tr><td>Gleichung lösen</td><td>{m("solve(x^2−5x+6=0, x)")}</td><td>{m("{<i>x</i>=2, <i>x</i>=3}")}</td><td>Aktion ▸ Gleichung/Ungl. ▸ solve</td></tr>
        <tr><td>Ableiten</td><td>{m("diff(x^3−2x, x)")}</td><td>{m("3<i>x</i><sup>2</sup>−2")}</td><td>Aktion ▸ Berechnung ▸ diff</td></tr>
        <tr><td>Stammfunktion</td><td>{m("∫(x^2, x)")}</td><td>{m(fr(1,3) + "<i>x</i><sup>3</sup>")}</td><td>Aktion ▸ Berechnung ▸ ∫</td></tr>
        <tr><td>Bestimmtes Integral</td><td>{m("∫(x^2, x, 0, 3)")}</td><td>{m("9")}</td><td>Grenzen: untere, dann obere</td></tr>
      </table>
    </div>
    <div class="box">
      <h2>Graph&amp;Tabelle</h2>
      <ol>
        <li>{kb("▦ Menü")} ▸ Graph&amp;Tabelle, in <strong>y1</strong> tippen, Term eingeben, {kb("EXE")} (Häkchen = wird gezeichnet).</li>
        <li>Symbol <strong>Zeichnen</strong>. Ausschnitt: <strong>Fenster</strong> (View-Window) oder Zoom.</li>
        <li>Analyse ▸ Grafische Lösung (G-Solve) ▸ <strong>Nullstelle</strong> (Root), <strong>Max</strong>, <strong>Min</strong> oder <strong>Schnittpunkt</strong> (Intersect, braucht y1 und y2).</li>
        <li>Mit {kb("▶")} zur nächsten Lösung, mit {kb("Clear")} beenden.</li>
        <li>Wertetabelle: Symbol <strong>Tabelle</strong>, Start/Ende/Schritt unter <strong>Tab.-Einst.</strong></li>
      </ol>
    </div>
    <div class="box">
      <h2>Statistik</h2>
      <ol>
        <li>{kb("▦ Menü")} ▸ Statistik. Werte in <strong>list1</strong> (und list2), nach jeder Zahl {kb("EXE")}.</li>
        <li>Kalk ▸ <strong>Statistik 1 Var.</strong> (One-Variable): <span class="math" style="text-decoration: overline">x</span> Mittelwert, Med Median, Q₁/Q₃ Quartile, σx bzw. sx Standardabweichung, n Anzahl.</li>
        <li>Kalk ▸ <strong>Lineare Regression</strong>: Ausgleichsgerade {m("<i>y</i> = <i>a</i>·<i>x</i> + <i>b</i>")}, r nahe ±1 heißt: Punkte liegen fast auf einer Geraden.</li>
      </ol>
    </div>
    <div class="box warn full">
      <h2>Typische Fehler</h2>
      <ul>
        <li><strong>Falscher Winkelmodus:</strong> sin(30) ergibt nur im Modus Deg ½. Für Ableitungen und Integrale mit sin/cos auf Rad stellen.</li>
        <li><strong>Vorzeichen:</strong> Für negative Zahlen {kb("(−)")} verwenden, für Rechnungen {kb("−")}.</li>
        <li><strong>solve ohne Variable:</strong> immer „, x“ angeben: {m("solve(2x+1=7, x)")}.</li>
        <li><strong>Klammern vergessen:</strong> {m("1÷2x")} ist etwas anderes als {m("1÷(2x)")}. Im Zweifel klammern.</li>
      </ul>
      <p class="small">Unabhängiger Spickzettel, nicht von CASIO. Menünamen hängen von der Spracheinstellung und Softwareversion des Geräts ab (englische Namen in Klammern).</p>
    </div>
  </div>""")

# ---------------- grade 8 mathematics (LearnKit topics) ----------------
M8 = "#1f6e8c"
PH = "#b4531f"
def sub(s): return f"<sub>{s}</sub>"

SHEETS["ausmultiplizieren-faktorisieren"] = dict(title="Ausmultiplizieren und Faktorisieren", eyebrow="Mathematik · Klasse 8 · Terme", accent=M8, body=f'''
  <div class="kern"><strong>Ausmultiplizieren</strong>: Klammer auflösen, aus einem Produkt wird eine Summe. <strong>Faktorisieren</strong> (Ausklammern): der Rückweg, aus einer Summe wird ein Produkt. {m(f"3·({X} + 4) ⇄ 3{X} + 12")}</div>
  <div class="cols">
    <div class="box">
      <h2>Zahl mal Klammer (Distributivgesetz)</h2>
      <p class="big">{m("<i>a</i>·(<i>b</i> + <i>c</i>) = <i>ab</i> + <i>ac</i>")}</p>
      <p>Der Faktor vor der Klammer wird mit <strong>jedem</strong> Summanden malgenommen.</p>
      <p>{m(f"4·(2{X} − 3) = 8{X} − 12")}</p>
    </div>
    <div class="box">
      <h2>Minus vor der Klammer</h2>
      <p>Alle Vorzeichen in der Klammer drehen sich um.</p>
      <p>{m(f"−({X} − 5) = −{X} + 5")}</p>
      <p>{m(f"−2·(3{X} − 4) = −6{X} + 8")}</p>
      <p class="small">Minus mal Minus ergibt Plus.</p>
    </div>
    <div class="box">
      <h2>Klammer mal Klammer</h2>
      <p class="big">{m("(<i>a</i> + <i>b</i>)(<i>c</i> + <i>d</i>) = <i>ac</i> + <i>ad</i> + <i>bc</i> + <i>bd</i>")}</p>
      <p><strong>Jeder mit jedem</strong>, danach zusammenfassen:</p>
      <p>{m(f"({X} + 2)({X} + 5) = {X}<sup>2</sup> + 5{X} + 2{X} + 10 = {X}<sup>2</sup> + 7{X} + 10")}</p>
    </div>
    <div class="box">
      <h2>Ausklammern in 4 Schritten</h2>
      <ol>
        <li>Größten gemeinsamen Faktor suchen (Zahl und Variablen).</li>
        <li>Ihn vor die Klammer schreiben.</li>
        <li>Jeden Summanden durch ihn teilen, das kommt in die Klammer.</li>
        <li>Probe: wieder ausmultiplizieren.</li>
      </ol>
      <p>{m(f"6{X} + 9 = 3(2{X} + 3)")} &nbsp; {m(f"4{X}<sup>2</sup> − 6{X} = 2{X}(2{X} − 3)")}</p>
    </div>
    <div class="box full">
      <h2>Flächenmodell</h2>
      <p>Ein Rechteck mit den Seiten <i>a</i> und (<i>b</i> + <i>c</i>) besteht aus zwei Teilrechtecken mit den Flächen <i>ab</i> und <i>ac</i>. Bei (<i>a</i> + <i>b</i>)(<i>c</i> + <i>d</i>) sind es vier Teilrechtecke. Deshalb „jeder mit jedem“.</p>
    </div>
    <div class="box warn full">
      <h2>Typische Fehler</h2>
      <ul>
        <li>{m(f"3({X} + 4) = 3{X} + 4")} <span class="no">falsch</span>: auch die 4 malnehmen, also {m(f"3{X} + 12")}.</li>
        <li>{m(f"−({X} − 5) = −{X} − 5")} <span class="no">falsch</span>: richtig ist {m(f"−{X} + 5")}.</li>
        <li>{m(f"({X} + 2)({X} + 5) = {X}<sup>2</sup> + 10")} <span class="no">falsch</span>: die gemischten Produkte fehlen.</li>
        <li>Beim Ausklammern die 1 vergessen: {m(f"3{X} + 3 = 3({X} + 1)")}.</li>
      </ul>
    </div>
  </div>''')

SHEETS["terme-vereinfachen"] = dict(title="Terme vereinfachen", eyebrow="Mathematik · Klasse 8 · Terme", accent=M8, body=f'''
  <div class="kern">Nur <strong>gleichartige Terme</strong> darf man addieren und subtrahieren. Beim <strong>Multiplizieren</strong> dürfen alle Faktoren zusammengefasst werden. Bild dazu: Äpfel und Birnen zählt man getrennt.</div>
  <div class="cols">
    <div class="box">
      <h2>Gleichartige Terme</h2>
      <p>Gleiche Variablen mit gleichen Hochzahlen, nur die Zahl davor (Koeffizient) ist verschieden.</p>
      <table>
        <tr><th>gleichartig</th><th>nicht gleichartig</th></tr>
        <tr><td>{m("3<i>a</i> und −5<i>a</i>")}</td><td>{m("<i>a</i> und <i>b</i>")}</td></tr>
        <tr><td>{m("2<i>ab</i> und 7<i>ba</i>")}</td><td>{m(f"{X} und {X}<sup>2</sup>")}</td></tr>
        <tr><td>{m(f"4{X}<sup>2</sup> und {X}<sup>2</sup>")}</td><td>{m("<i>ab</i> und <i>a</i>")}</td></tr>
      </table>
    </div>
    <div class="box">
      <h2>Zusammenfassen (Plus und Minus)</h2>
      <p>Koeffizienten addieren, Variablen bleiben:</p>
      <p>{m(f"5{X} + 3<i>y</i> − 2{X} + <i>y</i> = 3{X} + 4<i>y</i>")}</p>
      <p>{m("4<i>ab</i> − <i>a</i> + 2<i>ab</i> = 6<i>ab</i> − <i>a</i>")}</p>
      <p class="small">Tipp: gleichartige Terme farbig markieren. Das Vorzeichen gehört zum Term dahinter.</p>
    </div>
    <div class="box">
      <h2>Produkte vereinfachen</h2>
      <p>Zahlen mal Zahlen, Variablen mal Variablen. Gleiche Variablen werden zur Potenz.</p>
      <p>{m("3<i>a</i> · 4<i>b</i> = 12<i>ab</i>")}</p>
      <p>{m(f"2{X} · 5{X} = 10{X}<sup>2</sup>")}</p>
      <p>{m("(−2<i>a</i>) · 3<i>ab</i> = −6<i>a</i><sup>2</sup><i>b</i>")}</p>
    </div>
    <div class="box">
      <h2>Ordentlich schreiben</h2>
      <ul>
        <li>Zahl zuerst, dann Variablen alphabetisch: {m("12<i>ab</i>")}.</li>
        <li>{m("1<i>a</i>")} schreibt man {m("<i>a</i>")}, {m("−1<i>a</i>")} als {m("−<i>a</i>")}.</li>
        <li>Höhere Potenzen zuerst: {m(f"3{X}<sup>2</sup> + 2{X} − 5")}.</li>
      </ul>
      <h2 style="margin-top:2mm">Mit Klammern</h2>
      <p>Erst Klammer auflösen, dann zusammenfassen: {m("2(<i>a</i> + 3<i>b</i>) − <i>a</i> = <i>a</i> + 6<i>b</i>")}</p>
    </div>
    <div class="box warn full">
      <h2>Typische Fehler</h2>
      <ul>
        <li>{m("3<i>a</i> + 2<i>b</i> = 5<i>ab</i>")} <span class="no">falsch</span>: nicht gleichartig, es bleibt {m("3<i>a</i> + 2<i>b</i>")}.</li>
        <li>{m(f"{X} + {X} = {X}<sup>2</sup>")} <span class="no">falsch</span>: richtig ist {m(f"2{X}")}. Erst {m(f"{X} · {X} = {X}<sup>2</sup>")}.</li>
        <li>{m("3<i>a</i> − <i>a</i> = 3")} <span class="no">falsch</span>: vor <i>a</i> steht unsichtbar eine 1, also {m("2<i>a</i>")}.</li>
        <li>Vorzeichen verloren: In {m(f"5{X} − 2<i>y</i> + 3{X}")} gehört das Minus zu 2<i>y</i>.</li>
      </ul>
    </div>
  </div>''')

SHEETS["gleichungen"] = dict(title="Gleichungen lösen", eyebrow="Mathematik · Klasse 8 · Gleichungen", accent=M8, body=f'''
  <div class="kern">Eine Gleichung ist wie eine <strong>Waage im Gleichgewicht</strong>: Was du auf einer Seite tust, musst du auch auf der anderen tun. Ziel: {X} steht allein, zum Beispiel {m(f"{X} = 5")}.</div>
  <div class="cols">
    <div class="box">
      <h2>Erlaubte Umformungen</h2>
      <ul>
        <li>Auf <strong>beiden</strong> Seiten dasselbe addieren oder subtrahieren.</li>
        <li>Beide Seiten mit derselben Zahl multiplizieren oder durch sie dividieren, <strong>nie mit 0</strong>.</li>
        <li>Nie durch {X} teilen ({X} könnte 0 sein).</li>
      </ul>
      <p class="small">Die Umformung schreibt man hinter einen senkrechten Strich: | −5, | :3.</p>
    </div>
    <div class="box">
      <h2>Fahrplan</h2>
      <ol>
        <li>Klammern auflösen, jede Seite zusammenfassen.</li>
        <li>{X}-Terme auf eine Seite bringen.</li>
        <li>Zahlen auf die andere Seite bringen.</li>
        <li>Durch die Zahl vor {X} teilen.</li>
        <li><strong>Probe</strong>: Lösung in die Ausgangsgleichung einsetzen.</li>
      </ol>
    </div>
    <div class="box">
      <h2>Beispiel 1</h2>
      <table>
        <tr><td>{m(f"3{X} + 5 = 20")}</td><td>| −5</td></tr>
        <tr><td>{m(f"3{X} = 15")}</td><td>| :3</td></tr>
        <tr><td>{m(f"{X} = 5")}</td><td></td></tr>
      </table>
      <p class="small">Probe: 3 · 5 + 5 = 20 ✓</p>
    </div>
    <div class="box">
      <h2>Beispiel 2 (mit Klammer)</h2>
      <table>
        <tr><td>{m(f"2({X} + 3) = {X} − 1")}</td><td>Klammer auflösen</td></tr>
        <tr><td>{m(f"2{X} + 6 = {X} − 1")}</td><td>| −{X}</td></tr>
        <tr><td>{m(f"{X} + 6 = −1")}</td><td>| −6</td></tr>
        <tr><td>{m(f"{X} = −7")}</td><td></td></tr>
      </table>
      <p class="small">Probe: 2(−7 + 3) = −8 und −7 − 1 = −8 ✓</p>
    </div>
    <div class="box">
      <h2>Sonderfälle</h2>
      <ul>
        <li>{X} verschwindet und es bleibt eine falsche Aussage wie {m("0 = 5")}: <strong>keine Lösung</strong>, L = {{ }}.</li>
        <li>Es bleibt eine wahre Aussage wie {m("0 = 0")}: <strong>jede Zahl</strong> ist Lösung, L = ℚ.</li>
        <li>Lösungen dürfen Brüche sein: {m(f"2{X} = 3 ⇒ {X} = " + fr(3, 2))}.</li>
      </ul>
    </div>
    <div class="box warn">
      <h2>Typische Fehler</h2>
      <ul>
        <li>Nur <strong>eine</strong> Seite umgeformt.</li>
        <li>Vorzeichenfehler beim Subtrahieren: aus {m(f"{X} + 6 = −1")} wird {m(f"{X} = −7")}, nicht 5.</li>
        <li>Durch {X} geteilt oder mit 0 multipliziert.</li>
        <li>Probe vergessen. Sie zeigt sofort, ob die Lösung stimmt.</li>
      </ul>
    </div>
  </div>''')

SHEETS["ungleichungen"] = dict(title="Ungleichungen lösen", eyebrow="Mathematik · Klasse 8 · Gleichungen", accent=M8, body=f'''
  <div class="kern">Eine Ungleichung hat meist <strong>unendlich viele</strong> Lösungen. Man formt um wie bei Gleichungen, mit einer Ausnahme: Beim <strong>Multiplizieren oder Dividieren mit einer negativen Zahl</strong> wird das Zeichen umgedreht.</div>
  <div class="cols">
    <div class="box">
      <h2>Die Zeichen</h2>
      <table>
        <tr><td>{m("&lt;")}</td><td>kleiner als</td><td>Grenze gehört <strong>nicht</strong> dazu</td></tr>
        <tr><td>{m("≤")}</td><td>kleiner oder gleich</td><td>Grenze gehört dazu</td></tr>
        <tr><td>{m("&gt;")}</td><td>größer als</td><td>Grenze gehört <strong>nicht</strong> dazu</td></tr>
        <tr><td>{m("≥")}</td><td>größer oder gleich</td><td>Grenze gehört dazu</td></tr>
      </table>
      <p class="small">Die Spitze zeigt auf die kleinere Seite.</p>
    </div>
    <div class="box">
      <h2>Lösungsmenge und Zahlenstrahl</h2>
      <p>{m(f"L = {{{X} | {X} &lt; 3}}")}: alle Zahlen kleiner als 3.</p>
      <p>Am Zahlenstrahl: <strong>leerer Kreis</strong> bei &lt; und &gt; (Grenze nicht dabei), <strong>voller Punkt</strong> bei ≤ und ≥ (Grenze dabei).</p>
      <svg viewBox="0 0 300 40" width="70mm" height="9mm"><line x1="10" y1="20" x2="290" y2="20" stroke="#1b2228" stroke-width="2"/><line x1="12" y1="20" x2="190" y2="20" stroke="{M8}" stroke-width="6" stroke-linecap="round"/><circle cx="190" cy="20" r="6" fill="#fff" stroke="{M8}" stroke-width="2.5"/><text x="190" y="38" font-size="10" text-anchor="middle">3</text></svg>
    </div>
    <div class="box">
      <h2>Beispiel mit Zeichen-Umdrehen</h2>
      <table>
        <tr><td>{m(f"−2{X} + 1 &lt; 7")}</td><td>| −1</td></tr>
        <tr><td>{m(f"−2{X} &lt; 6")}</td><td>| :(−2) <span class="no">umdrehen!</span></td></tr>
        <tr><td>{m(f"{X} &gt; −3")}</td><td></td></tr>
      </table>
      <p class="small">Probe mit {m(f"{X} = 0")}: −2 · 0 + 1 = 1 &lt; 7 ✓</p>
    </div>
    <div class="box">
      <h2>Warum umdrehen?</h2>
      <p>{m("2 &lt; 5")}, aber nach Multiplikation mit (−1): {m("−2 &gt; −5")}. Durch das Minus kehrt sich die Reihenfolge auf dem Zahlenstrahl um.</p>
      <p class="small"><strong>Nicht</strong> umdrehen beim Addieren und Subtrahieren, auch wenn negative Zahlen vorkommen!</p>
    </div>
    <div class="box warn full">
      <h2>Typische Fehler</h2>
      <ul>
        <li>Beim Teilen durch eine negative Zahl das Zeichen nicht umgedreht.</li>
        <li>Das Zeichen umgedreht, obwohl nur eine negative Zahl abgezogen wurde.</li>
        <li>&lt; und ≤ verwechselt: Gehört die Grenze dazu?</li>
        <li>Nur eine einzelne Zahl als Lösung angegeben statt der Lösungsmenge.</li>
      </ul>
    </div>
  </div>''')

# ---------------- grade 8 physics ----------------
SHEETS["druck"] = dict(title="Druck in Flüssigkeiten und Gasen", eyebrow="Physik · Klasse 8 · Druck", accent=PH, body=f'''
  <div class="kern"><strong>Druck</strong> gibt an, wie stark eine Kraft auf eine Fläche drückt. Gleiche Kraft auf kleiner Fläche ergibt großen Druck (Reißzwecke), auf großer Fläche kleinen Druck (Schneeschuh).</div>
  <div class="cols">
    <div class="box">
      <h2>Formel</h2>
      <p class="big">{m("<i>p</i> = " + fr("<i>F</i>", "<i>A</i>"))} &nbsp; {m("<i>F</i> = <i>p</i> · <i>A</i>")} &nbsp; {m("<i>A</i> = <i>F</i> : <i>p</i>")}</p>
      <table>
        <tr><td>{m("<i>p</i>")}</td><td>Druck</td><td>Pascal (Pa)</td></tr>
        <tr><td>{m("<i>F</i>")}</td><td>Kraft</td><td>Newton (N)</td></tr>
        <tr><td>{m("<i>A</i>")}</td><td>Fläche</td><td>m² (oder cm²)</td></tr>
      </table>
    </div>
    <div class="box">
      <h2>Einheiten</h2>
      <table>
        <tr><td>1 Pa</td><td>= 1 N/m²</td></tr>
        <tr><td>1 hPa</td><td>= 100 Pa</td></tr>
        <tr><td>1 bar</td><td>= 1 000 hPa = 100 000 Pa</td></tr>
        <tr><td>1 N/cm²</td><td>= 10 000 Pa = 0,1 bar</td></tr>
        <tr><td>1 m²</td><td>= 10 000 cm²</td></tr>
      </table>
    </div>
    <div class="box">
      <h2>Kolbendruck</h2>
      <p>In einer <strong>eingeschlossenen</strong> Flüssigkeit oder einem eingeschlossenen Gas breitet sich der Druck <strong>in alle Richtungen gleichmäßig</strong> aus. Versuch: Bei der Spritzkugel spritzt das Wasser aus allen Löchern gleich weit.</p>
    </div>
    <div class="box">
      <h2>Gase und Flüssigkeiten</h2>
      <table>
        <tr><th></th><th>Gas</th><th>Flüssigkeit</th></tr>
        <tr><td>zusammendrückbar</td><td>ja</td><td>fast nicht</td></tr>
        <tr><td>Teilchen</td><td>weit auseinander</td><td>dicht</td></tr>
      </table>
      <p class="small">Für Profis (Boyle-Mariotte): {m("<i>p</i> · <i>V</i> = konstant")}, doppelter Druck heißt halbes Volumen.</p>
    </div>
    <div class="box">
      <h2>Beispiel</h2>
      <p>F = 200 N auf A = 10 cm²:</p>
      <p>{m("<i>p</i> = 200 N : 10 cm² = 20 N/cm² = 2 bar")}</p>
      <p class="small">Typische Werte: Luftdruck ≈ 1 bar, Fahrradreifen 2 bis 6 bar, Autoreifen ≈ 2,5 bar.</p>
    </div>
    <div class="box warn">
      <h2>Typische Fehler</h2>
      <ul>
        <li>Fläche in cm² eingesetzt, Ergebnis aber in Pa angegeben.</li>
        <li>{m("1 m² = 100 cm²")} <span class="no">falsch</span>: richtig sind 10 000 cm².</li>
        <li>Kraft und Druck verwechselt. Es kommt auf die Fläche an.</li>
      </ul>
    </div>
  </div>''')

SHEETS["hydraulik"] = dict(title="Hydraulische Anlagen", eyebrow="Physik · Klasse 8 · Druck", accent=PH, body=f'''
  <div class="kern">Zwei Kolben sind durch Öl verbunden. Im Öl herrscht überall <strong>derselbe Druck</strong>. Am großen Kolben wirkt deshalb eine große Kraft, er bewegt sich aber nur ein kleines Stück.</div>
  <div class="cols">
    <div class="box">
      <h2>Kräfte</h2>
      <p class="big">{m(fr("<i>F</i>" + sub(1), "<i>A</i>" + sub(1)) + " = " + fr("<i>F</i>" + sub(2), "<i>A</i>" + sub(2)) + " = <i>p</i>")}</p>
      <p>{m("<i>F</i>" + sub(2) + " = <i>F</i>" + sub(1) + " · " + fr("<i>A</i>" + sub(2), "<i>A</i>" + sub(1)))}</p>
      <p class="small">Große Fläche 20-mal so groß bedeutet Kraft 20-mal so groß.</p>
    </div>
    <div class="box">
      <h2>Wege</h2>
      <p class="big">{m("<i>A</i>" + sub(1) + " · <i>s</i>" + sub(1) + " = <i>A</i>" + sub(2) + " · <i>s</i>" + sub(2))}</p>
      <p>Das verdrängte Ölvolumen ist auf beiden Seiten gleich. Der große Kolben bewegt sich nur einen Bruchteil des Weges.</p>
    </div>
    <div class="box full">
      <h2>Goldene Regel der Mechanik</h2>
      <p>Was man an Kraft spart, muss man an Weg zusetzen: {m("<i>F</i>" + sub(1) + " · <i>s</i>" + sub(1) + " = <i>F</i>" + sub(2) + " · <i>s</i>" + sub(2))}. Hydraulik verstärkt die Kraft, erzeugt aber keine Energie.</p>
    </div>
    <div class="box">
      <h2>Beispiel</h2>
      <p>A₁ = 5 cm², F₁ = 100 N, A₂ = 200 cm², s₁ = 20 cm:</p>
      <ul>
        <li>{m("<i>p</i> = 100 N : 5 cm² = 20 N/cm² = 2 bar")}</li>
        <li>{m("<i>F</i>" + sub(2) + " = 20 N/cm² · 200 cm² = 4 000 N")}</li>
        <li>{m("<i>s</i>" + sub(2) + " = 5 · 20 : 200 = 0,5 cm")}</li>
      </ul>
    </div>
    <div class="box">
      <h2>Anwendungen</h2>
      <ul>
        <li>Hebebühne und Wagenheber</li>
        <li>Autobremse</li>
        <li>Bagger, Kran, Presse</li>
        <li>Friseur- und Zahnarztstuhl</li>
      </ul>
      <p class="small">Man nimmt Öl, weil es sich kaum zusammendrücken lässt. Luftblasen machen eine Bremse schwammig.</p>
    </div>
    <div class="box warn full">
      <h2>Typische Fehler</h2>
      <ul>
        <li>Gedacht, Hydraulik erzeuge Energie: Die Kraft wird größer, der Weg kleiner.</li>
        <li>Flächen in verschiedenen Einheiten eingesetzt.</li>
        <li>Verhältnis vertauscht: Der <strong>große</strong> Kolben hat die <strong>große</strong> Kraft und den <strong>kleinen</strong> Weg.</li>
      </ul>
    </div>
  </div>''')

SHEETS["schweredruck"] = dict(title="Schweredruck in Flüssigkeiten", eyebrow="Physik · Klasse 8 · Druck", accent=PH, body=f'''
  <div class="kern">Die Flüssigkeit über einem Körper hat Gewicht und drückt auf alles darunter. Je tiefer, desto größer der <strong>Schweredruck</strong>. Faustregel für Wasser: <strong>pro 10 m Tiefe etwa 1 bar mehr</strong>.</div>
  <div class="cols">
    <div class="box">
      <h2>Formel</h2>
      <p class="big">{m("<i>p</i> = <i>ρ</i> · <i>g</i> · <i>h</i>")}</p>
      <table>
        <tr><td>{m("<i>ρ</i>")}</td><td>Dichte der Flüssigkeit</td><td>kg/m³ (Wasser 1 000)</td></tr>
        <tr><td>{m("<i>g</i>")}</td><td>Ortsfaktor</td><td>9,81 N/kg</td></tr>
        <tr><td>{m("<i>h</i>")}</td><td>Tiefe</td><td>m</td></tr>
      </table>
      <p class="small">Ergebnis in Pa. 100 Pa = 1 hPa, 100 000 Pa = 1 bar.</p>
    </div>
    <div class="box">
      <h2>Eigenschaften</h2>
      <ul>
        <li>wächst mit der <strong>Tiefe</strong> und der <strong>Dichte</strong>.</li>
        <li>hängt <strong>nicht</strong> von Form und Größe des Gefäßes ab (hydrostatisches Paradoxon).</li>
        <li>wirkt in einer Tiefe <strong>in alle Richtungen</strong> gleich.</li>
      </ul>
    </div>
    <div class="box">
      <h2>Beispiel</h2>
      <p>Wasser, 10 m Tiefe:</p>
      <p>{m("<i>p</i> = 1 000 · 9,81 · 10 = 98 100 Pa ≈ 981 hPa ≈ 1 bar")}</p>
      <p>Gesamtdruck mit Luftdruck: {m("1 013 hPa + 981 hPa ≈ 2 bar")}</p>
    </div>
    <div class="box">
      <h2>Im Alltag</h2>
      <ul>
        <li><strong>Staudamm</strong> unten dicker als oben.</li>
        <li><strong>Taucher</strong>: Druckausgleich in den Ohren.</li>
        <li><strong>U-Boot</strong>: dicke Wände für große Tiefen.</li>
        <li><strong>Wasserturm</strong>: erzeugt den Druck in der Leitung.</li>
        <li><strong>Quecksilber</strong> (13 600 kg/m³): 76 cm drücken so stark wie die Luft.</li>
      </ul>
    </div>
    <div class="box warn full">
      <h2>Typische Fehler</h2>
      <ul>
        <li>Tiefe in cm eingesetzt: erst in m umrechnen (50 cm = 0,5 m).</li>
        <li>Gedacht, in einem breiten See sei der Druck größer als in einem schmalen Rohr gleicher Tiefe. Es zählt nur die Tiefe.</li>
        <li>Pa, hPa und bar verwechselt.</li>
      </ul>
    </div>
  </div>''')

SHEETS["auftrieb"] = dict(title="Auftrieb", eyebrow="Physik · Klasse 8 · Druck", accent=PH, body=f'''
  <div class="kern">Eine Flüssigkeit drückt jeden eingetauchten Körper nach oben: die <strong>Auftriebskraft</strong>. Ob er schwimmt oder sinkt, entscheidet der Vergleich von <strong>Gewichtskraft</strong> und Auftrieb, also der Vergleich der <strong>Dichten</strong>.</div>
  <div class="cols">
    <div class="box full">
      <h2>Gesetz des Archimedes</h2>
      <p>Die Auftriebskraft ist so groß wie die Gewichtskraft der verdrängten Flüssigkeit: {m("<i>F</i>" + sub("A") + " = <i>ρ</i>" + sub("Fl") + " · <i>g</i> · <i>V</i>" + sub("verdrängt"))}. Ursache: Der Schweredruck ist an der Unterseite größer als an der Oberseite.</p>
    </div>
    <div class="box">
      <h2>Sinken, schweben, schwimmen</h2>
      <table>
        <tr><th>Kräfte</th><th>Dichten</th><th>Ergebnis</th></tr>
        <tr><td>F<sub>G</sub> &gt; F<sub>A</sub></td><td>ρ<sub>K</sub> &gt; ρ<sub>Fl</sub></td><td>sinkt</td></tr>
        <tr><td>F<sub>G</sub> = F<sub>A</sub></td><td>ρ<sub>K</sub> = ρ<sub>Fl</sub></td><td>schwebt</td></tr>
        <tr><td>F<sub>G</sub> &lt; F<sub>A</sub></td><td>ρ<sub>K</sub> &lt; ρ<sub>Fl</sub></td><td>steigt, schwimmt</td></tr>
      </table>
      <p class="small">Schwimmend taucht ein Körper zum Anteil ρ<sub>K</sub> : ρ<sub>Fl</sub> ein.</p>
    </div>
    <div class="box">
      <h2>Dichten (kg/m³)</h2>
      <table>
        <tr><td>Kork</td><td>≈ 240</td><td>Spiritus</td><td>790</td></tr>
        <tr><td>Holz (Fichte)</td><td>≈ 470</td><td>Öl</td><td>920</td></tr>
        <tr><td>Eis</td><td>920</td><td>Wasser</td><td>1 000</td></tr>
        <tr><td>Aluminium</td><td>2 700</td><td>Meerwasser</td><td>1 025</td></tr>
        <tr><td>Eisen</td><td>7 870</td><td>Quecksilber</td><td>13 600</td></tr>
      </table>
    </div>
    <div class="box">
      <h2>Beispiel</h2>
      <p>V = 200 cm³ = 0,0002 m³ ganz in Wasser:</p>
      <p>{m("<i>F</i>" + sub("A") + " = 1 000 · 9,81 · 0,0002 ≈ 1,96 N")}</p>
      <p class="small">Kraftmesser im Wasser zeigt: Gewichtskraft minus Auftrieb.</p>
    </div>
    <div class="box">
      <h2>Beispiele</h2>
      <ul>
        <li>Stahlschiff schwimmt: Hohlraum, mittlere Dichte kleiner als Wasser.</li>
        <li>Eisberg: rund 90 % unter Wasser.</li>
        <li>U-Boot: Tanks fluten zum Abtauchen.</li>
        <li>Fisch: Schwimmblase zum Schweben.</li>
      </ul>
    </div>
    <div class="box warn full">
      <h2>Typische Fehler</h2>
      <ul>
        <li>„Schwere Dinge sinken.“ Es entscheidet die <strong>Dichte</strong>, nicht das Gewicht.</li>
        <li>In die Auftriebsformel die Dichte des <strong>Körpers</strong> eingesetzt statt die der <strong>Flüssigkeit</strong>.</li>
        <li>cm³ nicht in m³ umgerechnet: 1 cm³ = 0,000001 m³, 1 Liter = 0,001 m³.</li>
      </ul>
    </div>
  </div>''')

SHEETS["luftdruck"] = dict(title="Luftdruck", eyebrow="Physik · Klasse 8 · Druck", accent=PH, body=f'''
  <div class="kern">Wir leben am Boden eines Luftmeeres. Die Luft über uns hat Gewicht und drückt: der <strong>Luftdruck</strong>. Auf Meereshöhe im Mittel <strong>1 013 hPa ≈ 1 bar</strong>. Mit der Höhe nimmt er ab.</div>
  <div class="cols">
    <div class="box">
      <h2>Wie stark?</h2>
      <p>{m("<i>F</i> = <i>p</i> · <i>A</i> = 101 300 Pa · 1 m² = 101 300 N")}</p>
      <p>Das entspricht der Gewichtskraft von über 10 t. Wir werden nicht zerdrückt, weil der Druck <strong>von allen Seiten</strong> wirkt und im Körper derselbe Druck herrscht.</p>
    </div>
    <div class="box">
      <h2>Messen</h2>
      <ul>
        <li><strong>Dosenbarometer</strong>: luftleere Metalldose wird eingedrückt, ein Zeiger zeigt den Druck.</li>
        <li><strong>Quecksilberbarometer</strong> (Torricelli): etwa 760 mm Quecksilbersäule ≙ 1 013 hPa.</li>
      </ul>
    </div>
    <div class="box">
      <h2>Versuche</h2>
      <ul>
        <li><strong>Magdeburger Halbkugeln</strong>: Pferde konnten die luftleeren Kugeln nicht trennen.</li>
        <li><strong>Glas mit Postkarte</strong>: Luftdruck hält das Wasser im umgedrehten Glas.</li>
        <li><strong>Trinkhalm, Saugnapf</strong>: Die Luft „saugt“ nicht, der äußere Luftdruck <strong>drückt</strong>.</li>
      </ul>
    </div>
    <div class="box">
      <h2>Luftdruck und Höhe</h2>
      <table>
        <tr><td>Meer (0 m)</td><td>1 013 hPa</td><td>Wasser siedet bei 100 °C</td></tr>
        <tr><td>Zugspitze (2 962 m)</td><td>≈ 705 hPa</td><td>≈ 90 °C</td></tr>
        <tr><td>5 500 m</td><td>≈ 505 hPa (halb)</td><td>≈ 81 °C</td></tr>
        <tr><td>Mount Everest (8 849 m)</td><td>≈ 314 hPa</td><td>≈ 69 °C</td></tr>
      </table>
      <p class="small">Faustregel nahe am Boden: etwa 1 hPa weniger pro 8 m Höhe.</p>
    </div>
    <div class="box">
      <h2>Wetter</h2>
      <ul>
        <li><strong>Hoch (H)</strong>: über 1 013 hPa, meist schönes Wetter.</li>
        <li><strong>Tief (T)</strong>: unter 1 013 hPa, oft Wolken und Regen.</li>
        <li><strong>Wind</strong>: Luft strömt vom Hoch zum Tief.</li>
      </ul>
    </div>
    <div class="box warn">
      <h2>Typische Fehler</h2>
      <ul>
        <li>„Der Strohhalm saugt.“ Der äußere Luftdruck drückt das Getränk hoch.</li>
        <li>„Luftdruck wirkt nur von oben.“ Er wirkt in alle Richtungen.</li>
        <li>hPa und Pa verwechselt: 1 013 hPa = 101 300 Pa.</li>
      </ul>
    </div>
  </div>''')

SHEETS["symport-antiport"] = dict(title="Symport und Antiport", eyebrow="Biologie · Klasse 11 · Stofftransport", accent="#2f7d5b", body=f'''
  <div class="kern">Carrier sind Transportproteine in der Zellmembran. Sie binden Teilchen, ändern ihre Form und geben sie auf der anderen Seite ab. <strong>Uniport</strong>: ein Stoff. <strong>Symport</strong>: zwei Stoffe in <strong>dieselbe</strong> Richtung. <strong>Antiport</strong>: zwei Stoffe in <strong>entgegengesetzte</strong> Richtungen.</div>
  <div class="cols">
    <div class="box">
      <h2>Drei Transportrichtungen</h2>
      <table>
        <tr><th>Art</th><th>Stoffe</th><th>Beispiel</th></tr>
        <tr><td><strong>Uniport</strong></td><td>1 Stoff, 1 Richtung</td><td>GLUT (Glucose)</td></tr>
        <tr><td><strong>Symport</strong></td><td>2 Stoffe, gleiche Richtung</td><td>Na⁺-Glucose-Symporter: 2 Na⁺ + 1 Glucose hinein</td></tr>
        <tr><td><strong>Antiport</strong></td><td>2 Stoffe, Gegenrichtung</td><td>Na⁺/K⁺-Pumpe: 3 Na⁺ hinaus, 2 K⁺ hinein</td></tr>
      </table>
      <p class="small">Merkhilfe: <em>syn</em> = zusammen, <em>anti</em> = gegen.</p>
    </div>
    <div class="box">
      <h2>Woher kommt die Energie?</h2>
      <table>
        <tr><th>Art</th><th>Antrieb</th></tr>
        <tr><td><strong>passiv</strong></td><td>mit dem Gefälle, keine Energie (GLUT, Cl⁻/HCO₃⁻-Austauscher)</td></tr>
        <tr><td><strong>primär aktiv</strong></td><td>direkt <strong>ATP</strong> (Na⁺/K⁺-Pumpe, Protonenpumpe)</td></tr>
        <tr><td><strong>sekundär aktiv</strong></td><td><strong>Gefälle eines anderen Stoffs</strong>, meist Na⁺ oder H⁺ (Na⁺-Glucose-Symporter, Na⁺/Ca²⁺-Austauscher)</td></tr>
      </table>
      <p class="small">Uni-, Sym- und Antiport beschreiben nur die <strong>Richtung</strong>. Die Energiefrage ist eine eigene Frage.</p>
    </div>
    <div class="box full">
      <h2>Sekundär aktiver Transport am Beispiel Darm</h2>
      <table>
        <tr><th>1</th><td>Die <strong>Na⁺/K⁺-Pumpe</strong> verbraucht ATP und hält Na⁺ in der Zelle niedrig. Außen ist viel Na⁺: ein <strong>Na⁺-Gefälle</strong> nach innen.</td></tr>
        <tr><th>2</th><td>Der <strong>Na⁺-Glucose-Symporter</strong> lässt 2 Na⁺ mit ihrem Gefälle hinein, aber nur zusammen mit 1 Glucose.</td></tr>
        <tr><th>3</th><td>So gelangt Glucose auch <strong>gegen ihr Gefälle</strong> in die Zelle. Der Symporter selbst braucht kein ATP.</td></tr>
        <tr><th>4</th><td>Fällt die Pumpe aus, zerfällt das Na⁺-Gefälle langsam, und der Symporter stoppt.</td></tr>
      </table>
    </div>
    <div class="box">
      <h2>Wichtige Transporter</h2>
      <ul>
        <li><strong>Na⁺/Ca²⁺-Austauscher</strong> (Herz): 3 Na⁺ hinein, 1 Ca²⁺ hinaus; sekundär aktiver Antiport.</li>
        <li><strong>H⁺/K⁺-Pumpe</strong> (Magen): H⁺ hinaus, K⁺ hinein; primär aktiver Antiport, bildet Magensäure.</li>
        <li><strong>H⁺-Saccharose-Symporter</strong> (Pflanze): lädt Zucker in die Leitbahnen; sekundär aktiv.</li>
        <li><strong>Cl⁻/HCO₃⁻-Austauscher</strong> (rote Blutzellen): passiver Antiport.</li>
      </ul>
    </div>
    <div class="box">
      <h2>Carrier oder Kanal?</h2>
      <ul>
        <li><strong>Kanal</strong>: offener Tunnel, sehr schnell, nur mit dem Gefälle.</li>
        <li><strong>Carrier</strong>: immer nur zu einer Seite offen, ändert seine Form, langsamer. Kann Stoffe koppeln und gegen das Gefälle befördern.</li>
        <li>Carrier sind <strong>spezifisch</strong> und haben eine <strong>Sättigung</strong>.</li>
      </ul>
    </div>
    <div class="box">
      <h2>Im Alltag</h2>
      <ul>
        <li><strong>Trinklösung bei Durchfall</strong>: Salz + Zucker, damit der Na⁺-Glucose-Symporter Wasser mitzieht.</li>
        <li><strong>Säureblocker</strong> hemmen die Protonenpumpe im Magen.</li>
        <li><strong>Digitalis</strong> (Herzmittel) hemmt die Na⁺/K⁺-Pumpe: Herz schlägt kräftiger.</li>
      </ul>
    </div>
    <div class="box warn">
      <h2>Typische Fehler</h2>
      <ul>
        <li>„Antiport ist immer aktiv.“ <span class="no">Falsch</span>: Es gibt passive Antiporter.</li>
        <li>„Der Na⁺-Glucose-Symporter spaltet ATP.“ <span class="no">Falsch</span>: Er nutzt das Na⁺-Gefälle.</li>
        <li>Beim Symport fließt oft nur <strong>ein</strong> Stoff bergab und zieht den anderen bergauf.</li>
      </ul>
    </div>
  </div>''')

SHEETS["endocytose-exocytose"] = dict(title="Endocytose und Exocytose", eyebrow="Biologie · Klasse 11 · Stofftransport", accent="#7a3f8f", body=f'''
  <div class="kern">Große Teilchen transportiert die Zelle in <strong>Membranbläschen (Vesikeln)</strong>. <strong>Endocytose</strong>: Die Membran stülpt sich ein und schnürt ein Bläschen nach <strong>innen</strong> ab. <strong>Exocytose</strong>: Ein Bläschen verschmilzt mit der Membran und gibt seinen Inhalt nach <strong>außen</strong> ab. Beides braucht Energie (<strong>ATP</strong>).</div>
  <div class="cols">
    <div class="box full">
      <h2>Drei Arten der Endocytose</h2>
      <table>
        <tr><th>Art</th><th>Was?</th><th>Ablauf und Besonderheit</th></tr>
        <tr><td><strong>Phagocytose</strong> („Zellfressen“)</td><td>große Teilchen: Bakterien, Zelltrümmer</td><td>Zelle umfließt das Teilchen mit Scheinfüßchen → <strong>Phagosom</strong> → verschmilzt mit <strong>Lysosom</strong> (Phagolysosom) → Enzyme verdauen den Inhalt. Beispiel: Fresszellen, Amöbe.</td></tr>
        <tr><td><strong>Pinocytose</strong> („Zelltrinken“)</td><td>Flüssigkeit mit Gelöstem</td><td>Kleine Bläschen, <strong>nicht wählerisch</strong>.</td></tr>
        <tr><td><strong>rezeptorvermittelt</strong></td><td>bestimmte Stoffe: LDL (Cholesterin), Eisen</td><td>Stoff bindet an <strong>Rezeptoren</strong> → <strong>Clathrin</strong>-Mulde → umhülltes Vesikel → Hülle löst sich → Rezeptoren kehren zur Membran zurück. Sehr <strong>gezielt</strong>.</td></tr>
      </table>
    </div>
    <div class="box">
      <h2>Exocytose in 4 Schritten</h2>
      <table>
        <tr><th>1</th><td>Vesikel schnürt sich am <strong>Golgi-Apparat</strong> ab.</td></tr>
        <tr><th>2</th><td>Transport entlang des <strong>Cytoskeletts</strong> zur Membran (ATP).</td></tr>
        <tr><th>3</th><td>Vesikel <strong>verschmilzt</strong> mit der Zellmembran, oft erst auf ein Signal (Ca²⁺-Einstrom).</td></tr>
        <tr><th>4</th><td>Inhalt ist draußen, die Vesikelmembran ist Teil der Zellmembran.</td></tr>
      </table>
    </div>
    <div class="box">
      <h2>Wichtige Begriffe</h2>
      <ul>
        <li><strong>Vesikel</strong>: kleines Membranbläschen.</li>
        <li><strong>Lysosom</strong>: Bläschen mit Verdauungsenzymen.</li>
        <li><strong>Membranfluss</strong>: Membran wandert ständig: ER → Golgi → Vesikel → Zellmembran und zurück. Endocytose verkleinert, Exocytose vergrößert die Zellmembran.</li>
        <li><strong>Transcytose</strong>: auf einer Seite aufnehmen, auf der anderen abgeben.</li>
      </ul>
    </div>
    <div class="box">
      <h2>Ständig oder auf Signal</h2>
      <ul>
        <li><strong>Ständig</strong>: Membranbausteine, Schleim.</li>
        <li><strong>Auf ein Signal</strong> (Ca²⁺): Botenstoffe an der Synapse, Insulin, Verdauungsenzyme.</li>
      </ul>
    </div>
    <div class="box">
      <h2>Im Alltag</h2>
      <ul>
        <li><strong>Eiter</strong>: tote Fresszellen nach Phagocytose von Bakterien.</li>
        <li><strong>Botox</strong> blockiert die Exocytose von Botenstoff: Muskeln erschlaffen.</li>
        <li><strong>Viren</strong> lassen sich per Endocytose in Zellen aufnehmen.</li>
        <li><strong>Muttermilch</strong>: Antikörper per Transcytose.</li>
      </ul>
    </div>
    <div class="box warn full">
      <h2>Typische Fehler</h2>
      <ul>
        <li>„Endocytose ist passiv.“ <span class="no">Falsch</span>: Membranbewegung und Vesikeltransport kosten ATP.</li>
        <li>„Der Stoff wandert durch die Membran.“ <span class="no">Falsch</span>: Er bleibt immer in einem Bläschen, von Membran umgeben.</li>
        <li>Endo und Exo verwechselt. Merkhilfe: <strong>En</strong>ter = hinein, <strong>Ex</strong>it = hinaus.</li>
      </ul>
    </div>
  </div>''')

SHEETS["auge"] = dict(extra="body { font-size: 9pt; } .page { gap: 2.6mm; } .cols { gap: 2.6mm 5mm; }", title="Das Auge", eyebrow="Biologie · Klasse 8 · Sinnesorgane", accent="#4a7a1e", body='''
  <div class="kern">Licht fällt durch Hornhaut und <strong>Pupille</strong>, die <strong>Linse</strong> bündelt es, und auf der <strong>Netzhaut</strong> entsteht ein Bild. Lichtsinneszellen wandeln das Licht in Signale um, der <strong>Sehnerv</strong> leitet sie zum <strong>Gehirn</strong>.</div>
  <div class="cols">
    <div class="box full">
      <h2>Teile des Auges und ihre Aufgaben</h2>
      <table>
        <tr><th>Teil</th><th>Aufgabe</th><th>Teil</th><th>Aufgabe</th></tr>
        <tr><td><strong>Hornhaut</strong></td><td>durchsichtiges Fenster, bricht das Licht am stärksten</td><td><strong>Glaskörper</strong></td><td>gallertartig, hält den Augapfel in Form</td></tr>
        <tr><td><strong>Iris</strong></td><td>Blende, gibt die Augenfarbe; regelt die Pupillengröße</td><td><strong>Netzhaut</strong></td><td>Lichtsinneszellen: Stäbchen und Zapfen</td></tr>
        <tr><td><strong>Pupille</strong></td><td>Sehloch, durch das Licht ins Auge fällt</td><td><strong>Gelber Fleck</strong></td><td>Stelle des schärfsten Sehens, viele Zapfen</td></tr>
        <tr><td><strong>Linse</strong></td><td>elastisch, stellt auf nah und fern scharf</td><td><strong>Blinder Fleck</strong></td><td>Austritt des Sehnervs, keine Sinneszellen</td></tr>
        <tr><td><strong>Ziliarmuskel</strong></td><td>ringförmiger Muskel, verändert die Linsenform</td><td><strong>Sehnerv</strong></td><td>leitet Signale zum Gehirn</td></tr>
        <tr><td><strong>Linsenbänder</strong></td><td>halten die Linse</td><td><strong>Ader- / Lederhaut</strong></td><td>Versorgung mit Blut / Schutz und Form</td></tr>
      </table>
      <p class="small">Weg des Lichts: <strong>Hornhaut → Kammerwasser → Pupille → Linse → Glaskörper → Netzhaut</strong>. Das Bild ist verkleinert, steht auf dem Kopf und ist seitenverkehrt. Das Gehirn dreht es um.</p>
    </div>
    <div class="box">
      <h2>Nahsicht und Fernsicht (Akkommodation)</h2>
      <table>
        <tr><th></th><th>Nahsicht</th><th>Fernsicht</th></tr>
        <tr><td>Ziliarmuskel</td><td>angespannt</td><td>entspannt</td></tr>
        <tr><td>Linsenbänder (Zonulafasern)</td><td>locker</td><td>gespannt</td></tr>
        <tr><td>Linse</td><td><strong>stark gewölbt</strong> (Eigenelastizität)</td><td><strong>flach</strong></td></tr>
        <tr><td>Brechkraft</td><td>groß</td><td>klein</td></tr>
      </table>
      <p class="small"><strong>Akkommodation</strong>: Anpassung der Linse an die Entfernung. <strong>Brechkraft</strong> in Dioptrien (dpt). <strong>Nahpunkt</strong>: kleinste Entfernung, die scharf gesehen wird (mit 20 J. ≈ 10 cm, mit 60 J. ≈ 1 m). <strong>Fernpunkt</strong>: größte (normal: unendlich).</p>
    </div>
    <div class="box">
      <h2>Pupillenreflex</h2>
      <ul>
        <li><strong>hell</strong>: Pupille eng, schützt die Netzhaut</li>
        <li><strong>dunkel</strong>: Pupille weit, mehr Licht</li>
        <li>läuft automatisch ab: ein <strong>Reflex</strong></li>
      </ul>
      <h2>Stäbchen und Zapfen</h2>
      <ul>
        <li><strong>Stäbchen</strong> (≈ 120 Mio.): hell/dunkel, Dämmerung</li>
        <li><strong>Zapfen</strong> (≈ 6 Mio.): Farben, viel Licht</li>
      </ul>
      <p class="small"><strong>Schutz</strong>: Augenhöhle, Brauen, Wimpern, Lidschlag, Tränen.</p>
    </div>
    <div class="box">
      <h2>Fehlsichtigkeiten</h2>
      <table>
        <tr><th></th><th>kurzsichtig</th><th>weitsichtig</th></tr>
        <tr><td>Augapfel</td><td>zu lang</td><td>zu kurz</td></tr>
        <tr><td>Bild</td><td>vor der Netzhaut</td><td>hinter der Netzhaut</td></tr>
        <tr><td>unscharf</td><td>fern</td><td>nah</td></tr>
        <tr><td>Brille</td><td>Zerstreuungslinse (−)</td><td>Sammellinse (+)</td></tr>
      </table>
      <p class="small"><strong>Alterssichtigkeit</strong>: Die Linse wird unelastisch, Nahes wird unscharf. Hilfe: Lesebrille (+).</p>
    </div>
    <div class="box warn">
      <h2>Typische Fehler</h2>
      <ul>
        <li>„Die Linse bricht am stärksten.“ <span class="no">Falsch</span>: Das ist die <strong>Hornhaut</strong>.</li>
        <li>„Für die Ferne spannt sich der Ziliarmuskel an.“ <span class="no">Falsch</span>: Er ist dann <strong>entspannt</strong>, die Linse flach.</li>
        <li>„Kurzsichtige sehen nah schlecht.“ <span class="no">Falsch</span>: Sie sehen <strong>fern</strong> unscharf.</li>
      </ul>
    </div>
  </div>''')

SHEETS["nervensystem"] = dict(extra="body { font-size: 9pt; } .page { gap: 2.6mm; } .cols { gap: 2.6mm 5mm; }", title="Das Nervensystem", eyebrow="Biologie · Klasse 8 · Nervensystem", accent="#4a7a1e", body='''
  <div class="kern">Das Nervensystem ist die Nachrichtenzentrale des Körpers: <strong>Reiz → Sinneszelle → sensorischer Nerv → Gehirn / Rückenmark → motorischer Nerv → Muskel → Reaktion</strong>.</div>
  <div class="cols">
    <div class="box">
      <h2>Aufbau</h2>
      <ul>
        <li><strong>ZNS</strong> (zentrales Nervensystem): Gehirn und Rückenmark, verarbeitet Informationen.</li>
        <li><strong>Peripheres Nervensystem</strong>: alle übrigen Nerven.</li>
        <li><strong>sensorische Nerven</strong>: von den Sinnesorganen <strong>zum</strong> ZNS.</li>
        <li><strong>motorische Nerven</strong>: <strong>vom</strong> ZNS zu den Muskeln.</li>
        <li><strong>willkürlich</strong>: bewusste Bewegungen. <strong>vegetativ</strong>: Herz, Atmung, Verdauung.</li>
        <li><strong>Sympathikus</strong>: Leistung, Gefahr (Herz schneller, Pupillen weit). <strong>Parasympathikus</strong>: Ruhe, Verdauung.</li>
      </ul>
    </div>
    <div class="box">
      <h2>Die Nervenzelle (Neuron)</h2>
      <table>
        <tr><td><strong>Dendriten</strong></td><td>empfangen Signale</td></tr>
        <tr><td><strong>Zellkörper</strong> mit Zellkern</td><td>verarbeitet, hält die Zelle am Leben</td></tr>
        <tr><td><strong>Axon</strong> (Nervenfaser)</td><td>leitet das Signal weiter, bis über 1 m lang</td></tr>
        <tr><td><strong>Myelinscheide</strong></td><td>isoliert, Signal springt von <strong>Schnürring</strong> zu Schnürring: schneller</td></tr>
        <tr><td><strong>Endknöpfchen</strong></td><td>übertragen das Signal an der <strong>Synapse</strong> mit Botenstoff</td></tr>
      </table>
      <p class="small">Tempo: mit Myelin bis 120 m/s, ohne etwa 1 m/s. Im Gehirn: etwa 86 Milliarden Nervenzellen.</p>
    </div>
    <div class="box full">
      <h2>Das Gehirn</h2>
      <table>
        <tr><th>Teil</th><th>Aufgaben</th><th>Teil</th><th>Aufgaben</th></tr>
        <tr><td><strong>Großhirn</strong></td><td>Denken, Lernen, Gedächtnis, Sprache, bewusste Wahrnehmung und Bewegung</td><td><strong>Zwischenhirn</strong></td><td>Körpertemperatur, Hunger, Durst, Schlaf; Weiterleitung zum Großhirn</td></tr>
        <tr><td><strong>Kleinhirn</strong></td><td>Gleichgewicht, fein abgestimmte Bewegungen</td><td><strong>Hirnstamm</strong> (Mittelhirn, Brücke, Nachhirn)</td><td>Atmung, Herzschlag, Schlucken, Husten</td></tr>
      </table>
    </div>
    <div class="box">
      <h2>Reflex und bewusste Reaktion</h2>
      <table>
        <tr><th></th><th>Reflex</th><th>bewusste Reaktion</th></tr>
        <tr><td>Umschaltung</td><td>oft im <strong>Rückenmark</strong></td><td>im <strong>Großhirn</strong></td></tr>
        <tr><td>Tempo</td><td>sehr schnell</td><td>ca. 0,2 bis 0,3 s</td></tr>
        <tr><td>Eigenschaften</td><td>angeboren, immer gleich, nicht bewusst</td><td>geplant, veränderbar</td></tr>
        <tr><td>Beispiel</td><td>Kniesehnen-, Lidschluss-, Rückziehreflex</td><td>Ball fangen, schreiben</td></tr>
      </table>
    </div>
    <div class="box">
      <h2>Reflexbogen: heiße Herdplatte</h2>
      <ol>
        <li>Sinneszellen der Haut melden Hitze.</li>
        <li><strong>Sensorischer Nerv</strong> → Rückenmark.</li>
        <li><strong>Umschaltung im Rückenmark</strong>.</li>
        <li><strong>Motorischer Nerv</strong> → Armmuskel: Hand zuckt zurück.</li>
        <li>Erst danach erreicht das Signal das Gehirn: Schmerz wird bewusst.</li>
      </ol>
    </div>
    <div class="box">
      <h2>Im Alltag</h2>
      <ul>
        <li><strong>Helm</strong> schützt Gehirn und Rückenmark (Gehirnerschütterung, Querschnittslähmung).</li>
        <li>Handy, Müdigkeit, Alkohol: <strong>längere Reaktionszeit</strong>.</li>
        <li>Prüfungsangst: Sympathikus, Herzklopfen.</li>
        <li>Schlaf festigt Gelerntes.</li>
      </ul>
    </div>
    <div class="box warn">
      <h2>Typische Fehler</h2>
      <ul>
        <li>„Das Rückenmark gehört nicht zum ZNS.“ <span class="no">Falsch</span>.</li>
        <li>„Bei Reflexen entscheidet das Gehirn.“ <span class="no">Falsch</span>: oft das Rückenmark.</li>
        <li>„Das Kleinhirn denkt.“ <span class="no">Falsch</span>: Denken = Großhirn.</li>
        <li><strong>s</strong>ensorisch = von den <strong>S</strong>innen, <strong>m</strong>otorisch = zu den <strong>M</strong>uskeln.</li>
      </ul>
    </div>
  </div>''')

SHEETS["termstruktur"] = dict(title="Termstruktur und Termwerte", eyebrow="Mathematik · Klasse 8 · Terme und Gleichungen", accent=M8, body=f'''
  <div class="kern">Ein <strong>Term</strong> ist ein Rechenausdruck aus Zahlen, Variablen, Rechenzeichen und Klammern. Die <strong>Termart</strong> richtet sich nach der Rechnung, die man <strong>zuletzt</strong> ausführt.</div>
  <div class="cols">
    <div class="box">
      <h2>Termarten</h2>
      <table>
        <tr><th>zuletzt …</th><th>Termart</th><th>Beispiel</th></tr>
        <tr><td>addiert</td><td><strong>Summe</strong></td><td>{m("2<i>x</i> + 7")}</td></tr>
        <tr><td>subtrahiert</td><td><strong>Differenz</strong></td><td>{m("<i>x</i><sup>2</sup> − 4")}</td></tr>
        <tr><td>multipliziert</td><td><strong>Produkt</strong></td><td>{m("3 · (<i>x</i> − 2)")}</td></tr>
        <tr><td>dividiert</td><td><strong>Quotient</strong></td><td>{m("(<i>a</i> + 5) : 2")}</td></tr>
        <tr><td>potenziert</td><td><strong>Potenz</strong></td><td>{m("(<i>x</i> + 1)<sup>2</sup>")}</td></tr>
      </table>
    </div>
    <div class="box">
      <h2>Rechenreihenfolge: KlaPoPS</h2>
      <ol>
        <li><strong>Kl</strong>ammern</li>
        <li><strong>Po</strong>tenzen</li>
        <li><strong>P</strong>unktrechnung (· und :)</li>
        <li><strong>S</strong>trichrechnung (+ und −)</li>
      </ol>
      <p class="small">Gleichrangiges von links nach rechts. Beispiel: {m("2 + 3 · 4<sup>2</sup> = 2 + 3 · 16 = 50")}</p>
    </div>
    <div class="box">
      <h2>Rechenbaum</h2>
      <p>Der Rechenbaum zeigt die Reihenfolge: unten die ersten Rechnungen, <strong>oben die letzte</strong>. Die Rechnung ganz oben bestimmt die Termart.</p>
      <p class="small">{m("2 · (<i>x</i> + 3)<sup>2</sup> − 5")}: erst +, dann Potenz, dann ·, zuletzt − ⇒ <strong>Differenz</strong>.</p>
    </div>
    <div class="box">
      <h2>Termwert berechnen</h2>
      <p>Variable durch die Zahl ersetzen, <strong>negative Zahlen einklammern</strong>, dann KlaPoPS.</p>
      <p class="small">{m("3<i>x</i><sup>2</sup> − 2<i>x</i>")} für {m("<i>x</i> = −2")}: {m("3 · (−2)<sup>2</sup> − 2 · (−2) = 12 + 4 = 16")}</p>
      <table><tr><th><i>x</i></th><td>−1</td><td>0</td><td>1</td><td>2</td></tr><tr><th>2<i>x</i> + 1</th><td>−1</td><td>1</td><td>3</td><td>5</td></tr></table>
    </div>
    <div class="box">
      <h2>Terme aufstellen</h2>
      <ul>
        <li>das Dreifache von <i>x</i>, vermindert um 5: {m("3<i>x</i> − 5")}</li>
        <li>die Summe aus <i>x</i> und 4, mal 2: {m("2(<i>x</i> + 4)")}</li>
        <li>das Quadrat der Summe aus <i>x</i> und 1: {m("(<i>x</i> + 1)<sup>2</sup>")}</li>
        <li>Handytarif: 5 € + 9 ct pro Minute: {m("5 + 0,09<i>m</i>")}</li>
      </ul>
    </div>
    <div class="box">
      <h2>Gleichwertige Terme</h2>
      <p>Gleichwertig heißt: für <strong>jede</strong> Einsetzung derselbe Wert, z. B. {m("2(<i>x</i> + 3)")} und {m("2<i>x</i> + 6")}.</p>
      <p class="small">Ein <strong>Gegenbeispiel</strong> genügt, um zu zeigen, dass zwei Terme nicht gleichwertig sind.</p>
    </div>
    <div class="box warn full">
      <h2>Typische Fehler</h2>
      <ul>
        <li>{m("−3<sup>2</sup> = −9")}, aber {m("(−3)<sup>2</sup> = 9")}: negative Zahlen beim Einsetzen <strong>einklammern</strong>.</li>
        <li>{m("2 + 3 · 4")} ist 14, nicht 20: <strong>Punkt vor Strich</strong>.</li>
        <li>{m("3<i>x</i>")} für {m("<i>x</i> = 5")} ist {m("3 · 5 = 15")}, nicht 35.</li>
        <li>Die Termart richtet sich nach der <strong>letzten</strong>, nicht nach der ersten Rechnung.</li>
      </ul>
    </div>
  </div>''')

SHEETS["zufallsexperimente"] = dict(title="Zufallsexperimente und Häufigkeiten", eyebrow="Mathematik · Klasse 8 · Zufallsversuche", accent=M8, body=f'''
  <div class="kern">Bei einem <strong>Zufallsexperiment</strong> kennt man alle möglichen Ergebnisse, aber nicht den nächsten Ausgang. Wiederholt man es oft, <strong>stabilisiert</strong> sich die relative Häufigkeit: Sie ist ein Schätzwert für die <strong>Wahrscheinlichkeit</strong>.</div>
  <div class="cols">
    <div class="box">
      <h2>Begriffe</h2>
      <table>
        <tr><td><strong>Ergebnis</strong></td><td>ein möglicher Ausgang, z. B. „4“</td></tr>
        <tr><td><strong>Ergebnismenge</strong> S</td><td>alle Ergebnisse: {m("S = {1; 2; 3; 4; 5; 6}")}</td></tr>
        <tr><td><strong>Ereignis</strong></td><td>Auswahl von Ergebnissen: „gerade“ = {m("{2; 4; 6}")}</td></tr>
        <tr><td><strong>sicheres</strong> Ereignis</td><td>tritt immer ein (P = 1)</td></tr>
        <tr><td><strong>unmögliches</strong> Ereignis</td><td>tritt nie ein (P = 0)</td></tr>
      </table>
    </div>
    <div class="box">
      <h2>Häufigkeiten</h2>
      <ul>
        <li><strong>absolute Häufigkeit</strong> <i>k</i>: wie oft ein Ergebnis eintritt.</li>
        <li><strong>relative Häufigkeit</strong>: {m("<i>h</i> = <i>k</i> : <i>n</i>")} (Anteil an allen <i>n</i> Versuchen).</li>
        <li>Beispiel: 17-mal „6“ bei 100 Würfen: {m("<i>h</i> = 0,17 = 17 %")}</li>
        <li>Alle relativen Häufigkeiten zusammen ergeben <strong>1</strong>.</li>
      </ul>
    </div>
    <div class="box full">
      <h2>Gesetz der großen Zahlen</h2>
      <p>Bei wenigen Versuchen schwankt die relative Häufigkeit stark. Bei <strong>vielen</strong> Versuchen pendelt sie sich um einen festen Wert ein. Diesen Wert nimmt man als <strong>Wahrscheinlichkeit</strong> <i>P</i>. Bei Reißzwecken oder Kronkorken kann man <i>P</i> nur so <strong>schätzen</strong>; bei Münze und Würfel kann man sie auch ausrechnen (½ bzw. ⅙).</p>
    </div>
    <div class="box">
      <h2>Wahrscheinlichkeiten</h2>
      <ul>
        <li>liegen zwischen <strong>0</strong> und <strong>1</strong> (0 % bis 100 %).</li>
        <li>Summe über alle Ergebnisse: <strong>1</strong>.</li>
        <li>Erwartete Anzahl bei <i>n</i> Versuchen: {m("≈ <i>n</i> · <i>P</i>")}</li>
        <li>600 Würfe: etwa {m("600 · ⅙ = 100")}-mal „6“.</li>
      </ul>
    </div>
    <div class="box">
      <h2>Im Alltag</h2>
      <ul>
        <li><strong>Regenwahrscheinlichkeit</strong> 70 %: an etwa 70 von 100 ähnlichen Tagen Regen.</li>
        <li><strong>Elfmeterquote</strong> 41 von 50: Schätzwert 0,82.</li>
        <li><strong>Qualitätskontrolle</strong>: 30 von 2 000 fehlerhaft = 1,5 %.</li>
      </ul>
    </div>
    <div class="box warn full">
      <h2>Typische Fehler</h2>
      <ul>
        <li>„Nach fünfmal Kopf kommt jetzt Zahl.“ <span class="no">Falsch</span>: Der Zufall hat kein Gedächtnis.</li>
        <li>Nach 10 Würfen ist die relative Häufigkeit noch <strong>kein</strong> guter Schätzwert.</li>
        <li>Relative Häufigkeit ist ein <strong>Anteil</strong> (z. B. 0,17), die absolute eine <strong>Anzahl</strong> (17).</li>
      </ul>
    </div>
  </div>''')

SHEETS["laplace"] = dict(title="Laplace-Experimente und Anzahlen", eyebrow="Mathematik · Klasse 8 · Zufallsversuche", accent=M8, body=f'''
  <div class="kern">Bei einem <strong>Laplace-Experiment</strong> sind alle Ergebnisse gleich wahrscheinlich. Dann gilt: {m("<i>P</i>(<i>E</i>) = günstige Ergebnisse : mögliche Ergebnisse")}.</div>
  <div class="cols">
    <div class="box">
      <h2>Laplace-Regel: Beispiele</h2>
      <table>
        <tr><th>Experiment</th><th>Ereignis</th><th><i>P</i></th></tr>
        <tr><td>Würfel</td><td>gerade Zahl</td><td>{m("3/6 = 1/2")}</td></tr>
        <tr><td>Urne 3 rot, 7 blau</td><td>rot</td><td>{m("3/10 = 30 %")}</td></tr>
        <tr><td>32 Skatkarten</td><td>Ass</td><td>{m("4/32 = 1/8")}</td></tr>
        <tr><td>zwei Würfel</td><td>Summe 7</td><td>{m("6/36 = 1/6")}</td></tr>
      </table>
      <p class="small">Nicht bei Reißzwecke oder ungleich großen Glücksradfeldern!</p>
    </div>
    <div class="box">
      <h2>Gegenereignis</h2>
      <p>Das Gegenereignis {m("Ē")} tritt ein, wenn <i>E</i> nicht eintritt: {m("<i>P</i>(Ē) = 1 − <i>P</i>(<i>E</i>)")}</p>
      <p class="small">Keine 6: {m("1 − 1/6 = 5/6")}. Mindestens eine 6 mit zwei Würfeln: {m("1 − 25/36 = 11/36")}</p>
    </div>
    <div class="box">
      <h2>Produktregel (Anzahlen)</h2>
      <p>Mehrere Entscheidungen nacheinander: Anzahlen <strong>multiplizieren</strong>.</p>
      <ul>
        <li>3 T-Shirts, 2 Hosen, 2 Paar Schuhe: {m("3 · 2 · 2 = 12")}</li>
        <li>Zahlenschloss, 3 Räder: {m("10 · 10 · 10 = 1 000")}</li>
        <li>Platz 1 und 2 bei 8 Läufern: {m("8 · 7 = 56")}</li>
      </ul>
    </div>
    <div class="box">
      <h2>Zwei Würfel</h2>
      <p>36 gleich wahrscheinliche Ergebnisse (1|1 bis 6|6). Die <strong>Augensummen</strong> sind <strong>nicht</strong> gleich wahrscheinlich:</p>
      <table><tr><th>Summe</th><td>2</td><td>3</td><td>4</td><td>5</td><td>6</td><td>7</td><td>8</td><td>9</td><td>10</td><td>11</td><td>12</td></tr><tr><th>Anzahl</th><td>1</td><td>2</td><td>3</td><td>4</td><td>5</td><td>6</td><td>5</td><td>4</td><td>3</td><td>2</td><td>1</td></tr></table>
    </div>
    <div class="box">
      <h2>Anzahl und Wahrscheinlichkeit</h2>
      <p>Bei <i>N</i> gleich wahrscheinlichen Möglichkeiten rät man mit {m("1/<i>N</i>")} richtig.</p>
      <p class="small">4-stellige PIN: 10 000 Möglichkeiten, {m("<i>P</i> = 0,01 %")}.</p>
    </div>
    <div class="box warn">
      <h2>Typische Fehler</h2>
      <ul>
        <li>Laplace-Regel bei <strong>ungleich wahrscheinlichen</strong> Ergebnissen.</li>
        <li>Bei zwei Würfeln mit 11 statt <strong>36</strong> Ergebnissen gerechnet.</li>
        <li>Bei der Produktregel <strong>addiert</strong> statt multipliziert.</li>
      </ul>
    </div>
  </div>''')

SHEETS["baumdiagramme"] = dict(title="Baumdiagramme und Pfadregeln", eyebrow="Mathematik · Klasse 8 · Zufallsversuche", accent=M8, body=f'''
  <div class="kern">Ein <strong>mehrstufiges</strong> Zufallsexperiment stellt man im <strong>Baumdiagramm</strong> dar. An jedem Ast steht eine Wahrscheinlichkeit, jeder Pfad ist ein Ergebnis.</div>
  <div class="cols">
    <div class="box">
      <h2>1. Pfadregel (Produktregel)</h2>
      <p>Wahrscheinlichkeit eines Pfades = <strong>Produkt</strong> der Astwahrscheinlichkeiten.</p>
      <p class="small">Zweimal rot (3 rot, 2 blau, mit Zurücklegen): {m("3/5 · 3/5 = 9/25")}</p>
    </div>
    <div class="box">
      <h2>2. Pfadregel (Summenregel)</h2>
      <p>Mehrere Pfade zu einem Ereignis: Wahrscheinlichkeiten <strong>addieren</strong>.</p>
      <p class="small">Genau eine rote: {m("3/5 · 2/5 + 2/5 · 3/5 = 12/25")}</p>
    </div>
    <div class="box">
      <h2>Mit Zurücklegen</h2>
      <p>Die Kugel kommt zurück: Wahrscheinlichkeiten bleiben auf jeder Stufe <strong>gleich</strong>.</p>
    </div>
    <div class="box">
      <h2>Ohne Zurücklegen</h2>
      <p>Eine Kugel weniger: Wahrscheinlichkeiten der nächsten Stufe <strong>ändern sich</strong>.</p>
      <p class="small">Zweimal rot: {m("3/5 · 2/4 = 3/10")}</p>
    </div>
    <div class="box">
      <h2>Kontrollen</h2>
      <ul>
        <li>Äste an einem Verzweigungspunkt: Summe <strong>1</strong>.</li>
        <li>Alle Pfadwahrscheinlichkeiten: Summe <strong>1</strong>.</li>
      </ul>
    </div>
    <div class="box">
      <h2>„Mindestens einmal“: Gegenereignis</h2>
      <p>{m("<i>P</i>(mindestens einmal) = 1 − <i>P</i>(keinmal)")}</p>
      <p class="small">Mindestens eine 6 bei 3 Würfen: {m("1 − (5/6)<sup>3</sup> ≈ 0,42")}</p>
    </div>
    <div class="box">
      <h2>Im Alltag</h2>
      <ul>
        <li>Zwei Ampeln (40 % und 50 % grün): beide grün {m("0,4 · 0,5 = 0,2")}.</li>
        <li>Zwei Freiwürfe (70 %): mindestens ein Treffer {m("1 − 0,3 · 0,3 = 0,91")}.</li>
      </ul>
    </div>
    <div class="box warn">
      <h2>Typische Fehler</h2>
      <ul>
        <li>Entlang eines Pfades <strong>addiert</strong> statt multipliziert.</li>
        <li>Ohne Zurücklegen die zweite Stufe nicht angepasst.</li>
        <li>„Genau einmal“ hat <strong>mehrere</strong> Pfade.</li>
      </ul>
    </div>
  </div>''')

SHEETS["unabhaengige-ereignisse"] = dict(title="Unabhängige Ereignisse", eyebrow="Mathematik · Klasse 8 · Zufallsversuche", accent=M8, body=f'''
  <div class="kern">Zwei Ereignisse <i>A</i> und <i>B</i> sind <strong>unabhängig</strong>, wenn das Eintreten von <i>A</i> die Wahrscheinlichkeit von <i>B</i> nicht verändert. Rechnerisch: {m("<i>P</i>(<i>A</i> und <i>B</i>) = <i>P</i>(<i>A</i>) · <i>P</i>(<i>B</i>)")}.</div>
  <div class="cols">
    <div class="box">
      <h2>Unabhängig</h2>
      <ul>
        <li>Münze und Würfel: {m("<i>P</i>(Kopf und 6) = 1/2 · 1/6 = 1/12")}</li>
        <li>zweimal würfeln, Ziehen <strong>mit</strong> Zurücklegen</li>
        <li>zwei getrennte Rauchmelder</li>
      </ul>
    </div>
    <div class="box">
      <h2>Abhängig</h2>
      <ul>
        <li>Ziehen <strong>ohne</strong> Zurücklegen</li>
        <li>„Regen“ und „Schirm dabei“</li>
        <li>„viel geübt“ und „gute Note“</li>
      </ul>
    </div>
    <div class="box full">
      <h2>Vierfeldertafel</h2>
      <table>
        <tr><th></th><th>B</th><th>nicht B</th><th>Summe</th></tr>
        <tr><th>A</th><td>12</td><td>18</td><td>30</td></tr>
        <tr><th>nicht A</th><td>28</td><td>42</td><td>70</td></tr>
        <tr><th>Summe</th><td>40</td><td>60</td><td>100</td></tr>
      </table>
      <p class="small">Prüfen: {m("<i>P</i>(<i>A</i>) = 0,3")}, {m("<i>P</i>(<i>B</i>) = 0,4")}, {m("<i>P</i>(<i>A</i> und <i>B</i>) = 0,12 = 0,3 · 0,4")} ⇒ <strong>unabhängig</strong>. Anschaulich: Der Anteil von B ist unter A (12 von 30 = 40 %) genauso groß wie unter nicht A (28 von 70 = 40 %).</p>
    </div>
    <div class="box">
      <h2>So gehst du vor</h2>
      <ol>
        <li>Vierfeldertafel mit Summen ausfüllen.</li>
        <li>{m("<i>P</i>(<i>A</i>)")}, {m("<i>P</i>(<i>B</i>)")} und {m("<i>P</i>(<i>A</i> und <i>B</i>)")} als relative Häufigkeiten bestimmen.</li>
        <li>{m("<i>P</i>(<i>A</i>) · <i>P</i>(<i>B</i>)")} mit {m("<i>P</i>(<i>A</i> und <i>B</i>)")} vergleichen.</li>
      </ol>
    </div>
    <div class="box">
      <h2>Im Alltag</h2>
      <ul>
        <li>Zwei Rauchmelder (je 2 % Ausfall): beide aus {m("0,0004")}.</li>
        <li>Umfragen und Studien: Hängt ein Merkmal mit einem anderen zusammen?</li>
      </ul>
    </div>
    <div class="box warn full">
      <h2>Typische Fehler</h2>
      <ul>
        <li><strong>Unabhängig</strong> mit <strong>unvereinbar</strong> verwechselt: Unvereinbare Ereignisse (mit P > 0) sind abhängig.</li>
        <li>Bei echten Daten ist die Gleichung selten exakt erfüllt; kleine Abweichungen sind Zufall.</li>
        <li>Summen in der Vierfeldertafel vergessen.</li>
      </ul>
    </div>
  </div>''')

SHEETS["funktionsbegriff"] = dict(title="Funktionsbegriff und Darstellungen", eyebrow="Mathematik · Klasse 8 · Funktionen", accent=M8, body=f'''
  <div class="kern">Eine <strong>Funktion</strong> ordnet jeder Eingabe <i>x</i> <strong>genau eine</strong> Ausgabe <i>y</i> zu. Schreibweisen: {m("<i>f</i>: <i>x</i> ↦ 2<i>x</i> + 1")}, {m("<i>f</i>(<i>x</i>) = 2<i>x</i> + 1")}, {m("<i>y</i> = 2<i>x</i> + 1")}.</div>
  <div class="cols">
    <div class="box">
      <h2>Vier Darstellungen</h2>
      <table>
        <tr><td><strong>Wortvorschrift</strong></td><td>„Verdopple und addiere 1.“</td></tr>
        <tr><td><strong>Gleichung</strong></td><td>{m("<i>f</i>(<i>x</i>) = 2<i>x</i> + 1")}</td></tr>
        <tr><td><strong>Wertetabelle</strong></td><td>{m("<i>x</i>: 0, 1, 2 → <i>y</i>: 1, 3, 5")}</td></tr>
        <tr><td><strong>Graph</strong></td><td>alle Punkte {m("(<i>x</i> | <i>f</i>(<i>x</i>))")}</td></tr>
      </table>
    </div>
    <div class="box">
      <h2>Begriffe</h2>
      <ul>
        <li><strong>Funktionswert</strong> {m("<i>f</i>(3)")}: Ausgabe für {m("<i>x</i> = 3")}.</li>
        <li><strong>Definitionsmenge</strong> D: erlaubte <i>x</i> (bei {m("6 : <i>x</i>")} nicht 0).</li>
        <li><strong>Wertemenge</strong> W: mögliche <i>y</i> (bei {m("<i>x</i><sup>2</sup>")}: alle ≥ 0).</li>
      </ul>
    </div>
    <div class="box">
      <h2>Rechnen mit Funktionen</h2>
      <ul>
        <li>{m("<i>f</i>(4)")}: einsetzen: {m("2 · 4 + 1 = 9")}</li>
        <li>{m("<i>f</i>(<i>x</i>) = 9")}: Gleichung lösen: {m("<i>x</i> = 4")}</li>
        <li>Liegt {m("P(2 | 5)")} auf dem Graphen? Ja, wenn {m("<i>f</i>(2) = 5")}.</li>
      </ul>
    </div>
    <div class="box">
      <h2>Funktion oder nicht?</h2>
      <p><strong>Senkrechte-Linie-Test</strong>: Jede senkrechte Linie schneidet den Graphen höchstens einmal.</p>
      <p class="small">Ein Kreis ist <strong>kein</strong> Funktionsgraph. Gleiche <i>y</i> für verschiedene <i>x</i> sind erlaubt.</p>
    </div>
    <div class="box">
      <h2>Im Alltag</h2>
      <ul>
        <li>Gewicht ↦ Preis, Zeit ↦ Temperatur, Gewicht ↦ Porto (Treppenfunktion).</li>
        <li>Joggen mit 10 km/h: {m("<i>s</i>(<i>t</i>) = 10<i>t</i>")}.</li>
      </ul>
    </div>
    <div class="box warn">
      <h2>Typische Fehler</h2>
      <ul>
        <li>„Zwei <i>x</i> mit gleichem <i>y</i> sind verboten.“ <span class="no">Falsch</span>.</li>
        <li>Punkte: erst <i>x</i>, dann <i>y</i>.</li>
        <li>{m("<i>f</i>(<i>x</i>)")} heißt „<i>f</i> von <i>x</i>“, nicht „<i>f</i> mal <i>x</i>“.</li>
      </ul>
    </div>
  </div>''')

SHEETS["eigenschaften-funktionen"] = dict(title="Eigenschaften von Funktionen", eyebrow="Mathematik · Klasse 8 · Funktionen", accent=M8, body=f'''
  <div class="kern">Am Graphen kann man ablesen: wo er die <strong>Achsen</strong> schneidet, wo er <strong>steigt</strong> oder <strong>fällt</strong>, wo er <strong>Hoch-</strong> und <strong>Tiefpunkte</strong> hat und ob er <strong>symmetrisch</strong> ist.</div>
  <div class="cols">
    <div class="box">
      <h2>Achsenschnittpunkte</h2>
      <ul>
        <li><strong>Nullstelle</strong>: {m("<i>f</i>(<i>x</i>) = 0")} lösen. Schnittpunkt {m("(<i>x</i> | 0)")}.</li>
        <li><strong><i>y</i>-Achse</strong>: {m("(0 | <i>f</i>(0))")}.</li>
        <li>{m("<i>f</i>(<i>x</i>) = 2<i>x</i> − 6")}: Nullstelle 3, <i>y</i>-Achse bei −6.</li>
        <li>{m("<i>x</i><sup>2</sup> − 9")}: Nullstellen −3 und 3.</li>
      </ul>
    </div>
    <div class="box">
      <h2>Steigen und Fallen</h2>
      <ul>
        <li><strong>steigend</strong>: größeres <i>x</i> → größeres <i>f</i>(<i>x</i>).</li>
        <li><strong>fallend</strong>: größeres <i>x</i> → kleineres <i>f</i>(<i>x</i>).</li>
        <li>Lineare Funktion {m("<i>mx</i> + <i>b</i>")}: steigend für {m("<i>m</i> > 0")}, fallend für {m("<i>m</i> < 0")}.</li>
        <li>Immer von <strong>links nach rechts</strong> lesen.</li>
      </ul>
    </div>
    <div class="box">
      <h2>Hoch- und Tiefpunkte</h2>
      <p><strong>Tiefpunkt</strong>: von fallend zu steigend. <strong>Hochpunkt</strong>: von steigend zu fallend.</p>
      <p class="small">{m("(<i>x</i> − <i>d</i>)<sup>2</sup> + <i>e</i>")} hat den Tiefpunkt {m("T(<i>d</i> | <i>e</i>)")}, {m("−(<i>x</i> − <i>d</i>)<sup>2</sup> + <i>e</i>")} den Hochpunkt {m("H(<i>d</i> | <i>e</i>)")}.</p>
    </div>
    <div class="box">
      <h2>Symmetrie</h2>
      <ul>
        <li><strong>achsensymmetrisch zur <i>y</i>-Achse</strong>: {m("<i>f</i>(−<i>x</i>) = <i>f</i>(<i>x</i>)")}, z. B. {m("<i>x</i><sup>2</sup>")}, {m("<i>x</i><sup>4</sup> + 1")}.</li>
        <li><strong>punktsymmetrisch zum Ursprung</strong>: {m("<i>f</i>(−<i>x</i>) = −<i>f</i>(<i>x</i>)")}, z. B. {m("<i>x</i><sup>3</sup>")}, {m("2<i>x</i>")}.</li>
      </ul>
    </div>
    <div class="box">
      <h2>Im Alltag</h2>
      <ul>
        <li>Temperaturkurve: Tiefpunkt morgens, Hochpunkt nachmittags.</li>
        <li>Wurfparabel: Hochpunkt = höchster Punkt, Nullstelle = Landepunkt.</li>
        <li>Gewinn = Einnahmen − Kosten: Nullstelle = Gewinnschwelle.</li>
      </ul>
    </div>
    <div class="box warn">
      <h2>Typische Fehler</h2>
      <ul>
        <li>Nullstelle mit <i>y</i>-Achsenabschnitt verwechselt.</li>
        <li>Nullstelle ist eine <strong>Zahl</strong> (3), der Schnittpunkt ein <strong>Punkt</strong> (3 | 0).</li>
        <li>Steigen/Fallen von rechts nach links gelesen.</li>
      </ul>
    </div>
  </div>''')

SHEETS["lineare-funktionen"] = dict(title="Lineare Funktionen", eyebrow="Mathematik · Klasse 8 · Funktionen", accent=M8, body=f'''
  <div class="kern">Lineare Funktion: {m("<i>f</i>(<i>x</i>) = <i>m</i><i>x</i> + <i>b</i>")}. Der Graph ist eine <strong>Gerade</strong> mit der <strong>Steigung</strong> <i>m</i> und dem <strong><i>y</i>-Achsenabschnitt</strong> <i>b</i>.</div>
  <div class="cols">
    <div class="box">
      <h2>Steigung <i>m</i></h2>
      <ul>
        <li>{m("<i>m</i> > 0")}: steigend, {m("<i>m</i> < 0")}: fallend, {m("<i>m</i> = 0")}: waagerecht.</li>
        <li><strong>Steigungsdreieck</strong>: 1 nach rechts, <i>m</i> nach oben.</li>
        <li>Aus zwei Punkten: {m("<i>m</i> = (<i>y</i>₂ − <i>y</i>₁) : (<i>x</i>₂ − <i>x</i>₁)")}</li>
        <li>Straßenschild 12 %: {m("<i>m</i> = 0,12")}.</li>
      </ul>
    </div>
    <div class="box">
      <h2><i>y</i>-Achsenabschnitt <i>b</i></h2>
      <ul>
        <li>Schnittpunkt mit der <i>y</i>-Achse: {m("(0 | <i>b</i>)")}.</li>
        <li>{m("<i>b</i> = 0")}: Gerade durch den Ursprung, <strong>proportional</strong>.</li>
        <li>Vorsicht: In {m("3 − 2<i>x</i>")} ist {m("<i>m</i> = −2")}, {m("<i>b</i> = 3")}.</li>
      </ul>
    </div>
    <div class="box">
      <h2>Graph zeichnen</h2>
      <ol>
        <li>Punkt {m("(0 | <i>b</i>)")} eintragen.</li>
        <li>Steigungsdreieck anlegen ({m("<i>m</i> = 2/3")}: 3 nach rechts, 2 nach oben).</li>
        <li>Gerade durch beide Punkte ziehen.</li>
      </ol>
    </div>
    <div class="box">
      <h2>Nullstelle</h2>
      <p>{m("<i>m</i><i>x</i> + <i>b</i> = 0 ⇒ <i>x</i> = −<i>b</i> : <i>m</i>")}</p>
      <p class="small">{m("2<i>x</i> + 6 = 0 ⇒ <i>x</i> = −3")}</p>
    </div>
    <div class="box">
      <h2>Zwei Geraden</h2>
      <ul>
        <li><strong>parallel</strong>: gleiche Steigung, verschiedenes <i>b</i>.</li>
        <li><strong>Schnittpunkt</strong>: Terme gleichsetzen, <i>x</i> berechnen, <i>y</i> einsetzen.</li>
        <li>{m("<i>x</i> + 1 = −<i>x</i> + 5 ⇒ <i>x</i> = 2, <i>y</i> = 3")}: S(2 | 3)</li>
      </ul>
    </div>
    <div class="box">
      <h2>Im Alltag</h2>
      <ul>
        <li>Grundpreis + Preis pro Einheit: Taxi, Handytarif, Strom.</li>
        <li>Kerze: {m("<i>h</i>(<i>t</i>) = 20 − 2<i>t</i>")}, abgebrannt nach 10 h.</li>
        <li>Tarifvergleich: Schnittpunkt = Grenze, ab der sich der Tarif lohnt.</li>
      </ul>
    </div>
    <div class="box warn full">
      <h2>Typische Fehler</h2>
      <ul>
        <li><i>m</i> und <i>b</i> vertauscht, wenn der Term nicht in der Form {m("<i>m</i><i>x</i> + <i>b</i>")} steht.</li>
        <li>Steigungsdreieck nach links gezeichnet. Immer <strong>nach rechts</strong>.</li>
        <li>Beim Schnittpunkt nur <i>x</i> angegeben: Ein Punkt braucht auch <i>y</i>.</li>
      </ul>
    </div>
  </div>''')

SHEETS["funktionsgleichungen"] = dict(title="Funktionsgleichungen bestimmen", eyebrow="Mathematik · Klasse 8 · Funktionen", accent=M8, body=f'''
  <div class="kern">Ziel: die Gleichung {m("<i>f</i>(<i>x</i>) = <i>m</i><i>x</i> + <i>b</i>")} einer Geraden. Man bestimmt erst die <strong>Steigung</strong> <i>m</i>, dann durch Einsetzen eines Punktes den <strong><i>y</i>-Achsenabschnitt</strong> <i>b</i>.</div>
  <div class="cols">
    <div class="box">
      <h2>Steigung und Punkt</h2>
      <p>{m("<i>m</i> = 2")}, {m("P(3 | 5)")}:</p>
      <ol>
        <li>{m("5 = 2 · 3 + <i>b</i>")}</li>
        <li>{m("<i>b</i> = −1")}</li>
        <li>{m("<i>f</i>(<i>x</i>) = 2<i>x</i> − 1")}</li>
      </ol>
    </div>
    <div class="box">
      <h2>Zwei Punkte</h2>
      <p>{m("P(1 | 2)")}, {m("Q(4 | 8)")}:</p>
      <ol>
        <li>{m("<i>m</i> = (8 − 2) : (4 − 1) = 2")}</li>
        <li>P einsetzen: {m("2 = 2 · 1 + <i>b</i> ⇒ <i>b</i> = 0")}</li>
        <li>{m("<i>f</i>(<i>x</i>) = 2<i>x</i>")}; Probe mit Q: {m("2 · 4 = 8")} ✓</li>
      </ol>
    </div>
    <div class="box">
      <h2>Am Graphen ablesen</h2>
      <ul>
        <li><i>b</i>: Schnittpunkt mit der <i>y</i>-Achse.</li>
        <li><i>m</i>: Steigungsdreieck zwischen zwei Gitterpunkten, {m("Höhe : Breite")}.</li>
        <li>3 nach rechts, 2 nach oben: {m("<i>m</i> = 2/3")}.</li>
      </ul>
    </div>
    <div class="box">
      <h2>Aus einem Text</h2>
      <ul>
        <li>Startwert / Grundgebühr → <strong><i>b</i></strong></li>
        <li>Änderung pro Einheit → <strong><i>m</i></strong> (Abnahme: negativ)</li>
        <li>Taxi 3,50 € + 2 € pro km: {m("<i>f</i>(<i>x</i>) = 2<i>x</i> + 3,5")}</li>
        <li>Kerze 20 cm, 2 cm pro h: {m("<i>h</i>(<i>t</i>) = 20 − 2<i>t</i>")}</li>
      </ul>
    </div>
    <div class="box">
      <h2>Im Alltag</h2>
      <ul>
        <li>Strom: 1 000 kWh 420 €, 2 000 kWh 720 € ⇒ {m("<i>K</i>(<i>x</i>) = 0,3<i>x</i> + 120")}</li>
        <li>Celsius → Fahrenheit: {m("<i>F</i> = 1,8<i>C</i> + 32")}</li>
      </ul>
    </div>
    <div class="box warn">
      <h2>Typische Fehler</h2>
      <ul>
        <li>In der Steigungsformel die Punkte oben und unten in verschiedener Reihenfolge.</li>
        <li><i>x</i> und <i>y</i> beim Einsetzen vertauscht.</li>
        <li>Probe mit dem zweiten Punkt vergessen.</li>
      </ul>
    </div>
  </div>''')

SHEETS["lgs-grafisch"] = dict(title="Gleichungen mit zwei Variablen und LGS", eyebrow="Mathematik · Klasse 8 · Lineare Gleichungssysteme", accent=M8, body=f'''
  <div class="kern">Eine Gleichung {m("<i>a</i><i>x</i> + <i>b</i><i>y</i> = <i>c</i>")} hat unendlich viele Lösungen (Zahlenpaare); zusammen bilden sie eine <strong>Gerade</strong>. Ein <strong>lineares Gleichungssystem</strong> (LGS) verlangt, dass zwei Gleichungen <strong>gleichzeitig</strong> gelten: Die Lösung ist der <strong>Schnittpunkt</strong> der Geraden.</div>
  <div class="cols">
    <div class="box">
      <h2>Gleichung mit zwei Variablen</h2>
      <ul>
        <li>{m("2<i>x</i> + <i>y</i> = 6")}: Lösungen (0 | 6), (1 | 4), (3 | 0) …</li>
        <li>Prüfen: Paar einsetzen, Gleichung muss stimmen.</li>
        <li>Nach <i>y</i> umgestellt: {m("<i>y</i> = −2<i>x</i> + 6")}.</li>
      </ul>
    </div>
    <div class="box">
      <h2>Grafisch lösen</h2>
      <ol>
        <li>Beide Gleichungen nach <i>y</i> umstellen.</li>
        <li>Beide Geraden zeichnen.</li>
        <li>Schnittpunkt ablesen und in <strong>beide</strong> Gleichungen einsetzen (Probe).</li>
      </ol>
    </div>
    <div class="box full">
      <h2>Anzahl der Lösungen</h2>
      <table>
        <tr><th>Lage der Geraden</th><th>Lösungen</th><th>Beispiel</th></tr>
        <tr><td>schneiden sich</td><td><strong>genau eine</strong></td><td>{m("<i>x</i> + <i>y</i> = 5, <i>x</i> − <i>y</i> = 1")} ⇒ (3 | 2)</td></tr>
        <tr><td>parallel</td><td><strong>keine</strong></td><td>{m("<i>x</i> + <i>y</i> = 5, 2<i>x</i> + 2<i>y</i> = 7")}</td></tr>
        <tr><td>identisch</td><td><strong>unendlich viele</strong></td><td>{m("<i>x</i> + <i>y</i> = 5, 2<i>x</i> + 2<i>y</i> = 10")}</td></tr>
      </table>
    </div>
    <div class="box">
      <h2>Im Alltag</h2>
      <ul>
        <li>Kinokarten: Anzahl und Gesamtpreis.</li>
        <li>Köpfe und Beine im Tierpark.</li>
        <li>Tarifvergleich: Schnittpunkt der Kostengeraden.</li>
      </ul>
    </div>
    <div class="box warn">
      <h2>Typische Fehler</h2>
      <ul>
        <li>Nur eine Gleichung geprüft.</li>
        <li>Vorzeichenfehler beim Umstellen nach <i>y</i>.</li>
        <li>Ablesen ist ungenau: bei krummen Werten rechnen.</li>
      </ul>
    </div>
  </div>''')

SHEETS["gleichsetzungsverfahren"] = dict(title="Gleichsetzungs- und Einsetzungsverfahren", eyebrow="Mathematik · Klasse 8 · Lineare Gleichungssysteme", accent=M8, body=f'''
  <div class="kern">Beide Verfahren machen aus zwei Gleichungen mit zwei Variablen <strong>eine</strong> Gleichung mit einer Variablen. Diese wird gelöst, dann wird die zweite Variable berechnet. Zum Schluss: <strong>Probe in beiden Gleichungen</strong>.</div>
  <div class="cols">
    <div class="box">
      <h2>Gleichsetzungsverfahren</h2>
      <p>Wenn beide Gleichungen nach derselben Variablen aufgelöst sind.</p>
      <ol>
        <li>I: {m("<i>y</i> = 2<i>x</i> + 1")}, II: {m("<i>y</i> = −<i>x</i> + 7")}</li>
        <li>Gleichsetzen: {m("2<i>x</i> + 1 = −<i>x</i> + 7")}</li>
        <li>{m("3<i>x</i> = 6 ⇒ <i>x</i> = 2")}</li>
        <li>In I: {m("<i>y</i> = 5")}, Lösung <strong>(2 | 5)</strong></li>
      </ol>
    </div>
    <div class="box">
      <h2>Einsetzungsverfahren</h2>
      <p>Wenn eine Gleichung nach einer Variablen aufgelöst ist.</p>
      <ol>
        <li>I: {m("<i>y</i> = 3<i>x</i> − 2")}, II: {m("2<i>x</i> + <i>y</i> = 13")}</li>
        <li>Einsetzen <strong>mit Klammer</strong>: {m("2<i>x</i> + (3<i>x</i> − 2) = 13")}</li>
        <li>{m("5<i>x</i> = 15 ⇒ <i>x</i> = 3")}</li>
        <li>In I: {m("<i>y</i> = 7")}, Lösung <strong>(3 | 7)</strong></li>
      </ol>
    </div>
    <div class="box full">
      <h2>Sonderfälle</h2>
      <table>
        <tr><th>Am Ende steht …</th><th>Bedeutung</th><th>Geraden</th></tr>
        <tr><td>{m("<i>x</i> = Zahl")}</td><td><strong>genau eine</strong> Lösung</td><td>schneiden sich</td></tr>
        <tr><td>falsche Aussage, z. B. {m("0 = 5")}</td><td><strong>keine</strong> Lösung</td><td>parallel</td></tr>
        <tr><td>wahre Aussage, z. B. {m("0 = 0")}</td><td><strong>unendlich viele</strong></td><td>identisch</td></tr>
      </table>
    </div>
    <div class="box">
      <h2>Im Alltag</h2>
      <ul>
        <li>Tarifvergleich: Wann kosten beide gleich viel?</li>
        <li>Überholen: Wann sind beide am selben Ort?</li>
        <li>Sparen: Wann haben beide gleich viel Geld?</li>
      </ul>
    </div>
    <div class="box warn">
      <h2>Typische Fehler</h2>
      <ul>
        <li>Klammer beim Einsetzen vergessen.</li>
        <li>Nur <i>x</i> angegeben, <i>y</i> fehlt.</li>
        <li>Probe nur in der Gleichung, mit der <i>y</i> berechnet wurde.</li>
      </ul>
    </div>
  </div>''')

SHEETS["additionsverfahren"] = dict(title="Additionsverfahren", eyebrow="Mathematik · Klasse 8 · Lineare Gleichungssysteme", accent=M8, body=f'''
  <div class="kern">Die Gleichungen werden so mit Zahlen multipliziert, dass eine Variable <strong>entgegengesetzte Koeffizienten</strong> hat. Beim <strong>Addieren</strong> fällt sie weg: Es bleibt eine Gleichung mit einer Variablen.</div>
  <div class="cols">
    <div class="box">
      <h2>Vorgehen</h2>
      <ol>
        <li>Beide Gleichungen in die Form {m("<i>ax</i> + <i>by</i> = <i>c</i>")} bringen.</li>
        <li>Faktoren wählen, sodass z. B. {m("+6<i>y</i>")} und {m("−6<i>y</i>")} entstehen.</li>
        <li>Gleichungen addieren, nach der verbliebenen Variablen lösen.</li>
        <li>In eine Ausgangsgleichung einsetzen, Probe in der anderen.</li>
      </ol>
    </div>
    <div class="box">
      <h2>Beispiel</h2>
      <p>I: {m("2<i>x</i> + 3<i>y</i> = 12")}, II: {m("3<i>x</i> − 2<i>y</i> = 5")}</p>
      <ul>
        <li>I · 2: {m("4<i>x</i> + 6<i>y</i> = 24")}</li>
        <li>II · 3: {m("9<i>x</i> − 6<i>y</i> = 15")}</li>
        <li>Addieren: {m("13<i>x</i> = 39 ⇒ <i>x</i> = 3")}</li>
        <li>In I: {m("6 + 3<i>y</i> = 12 ⇒ <i>y</i> = 2")}, Lösung <strong>(3 | 2)</strong></li>
      </ul>
    </div>
    <div class="box full">
      <h2>Welches Verfahren wann?</h2>
      <table>
        <tr><th>Form der Gleichungen</th><th>Verfahren</th><th>Beispiel</th></tr>
        <tr><td>beide nach derselben Variablen aufgelöst</td><td><strong>Gleichsetzen</strong></td><td>{m("<i>y</i> = 2<i>x</i> + 1, <i>y</i> = −<i>x</i> + 7")}</td></tr>
        <tr><td>eine nach einer Variablen aufgelöst</td><td><strong>Einsetzen</strong></td><td>{m("<i>y</i> = 3<i>x</i>, 2<i>x</i> + <i>y</i> = 10")}</td></tr>
        <tr><td>beide in der Form {m("<i>ax</i> + <i>by</i> = <i>c</i>")}</td><td><strong>Addieren</strong></td><td>{m("<i>x</i> + <i>y</i> = 10, <i>x</i> − <i>y</i> = 2")}</td></tr>
      </table>
    </div>
    <div class="box">
      <h2>Im Alltag</h2>
      <ul>
        <li>Zwei Einkäufe verraten die Einzelpreise.</li>
        <li>Boot mit und gegen die Strömung.</li>
        <li>Zweier und Dreier im Basketball.</li>
      </ul>
    </div>
    <div class="box warn">
      <h2>Typische Fehler</h2>
      <ul>
        <li>Rechte Seite nicht mitmultipliziert.</li>
        <li>Gleiche Koeffizienten addiert statt subtrahiert.</li>
        <li>Vorzeichenfehler bei negativen Faktoren.</li>
      </ul>
    </div>
  </div>''')

SHEETS["lgs-anwendungen"] = dict(title="Anwendungen linearer Gleichungssysteme", eyebrow="Mathematik · Klasse 8 · Lineare Gleichungssysteme", accent=M8, body=f'''
  <div class="kern">Zwei Unbekannte brauchen <strong>zwei Informationen</strong>. Jede Information aus dem Text wird zu einer Gleichung. Die Lösung des LGS wird am <strong>Text</strong> geprüft und in einem <strong>Antwortsatz</strong> notiert.</div>
  <div class="cols">
    <div class="box">
      <h2>Fünf Schritte</h2>
      <ol>
        <li>Variablen festlegen (mit Einheit).</li>
        <li>Zwei Gleichungen aufstellen.</li>
        <li>LGS lösen (Gleichsetzen, Einsetzen, Addieren).</li>
        <li>Am Text prüfen: sinnvoll?</li>
        <li>Antwortsatz schreiben.</li>
      </ol>
    </div>
    <div class="box">
      <h2>Vom Text zur Gleichung</h2>
      <ul>
        <li>„zusammen 12“: {m("<i>a</i> + <i>b</i> = 12")}</li>
        <li>„3 mehr als“: {m("<i>a</i> = <i>b</i> + 3")}</li>
        <li>„doppelt so viele“: {m("<i>a</i> = 2<i>b</i>")}</li>
        <li>„je 5 €“: {m("5<i>a</i>")}</li>
      </ul>
    </div>
    <div class="box full">
      <h2>Typische Aufgabenarten</h2>
      <table>
        <tr><th>Art</th><th>Gleichung I</th><th>Gleichung II</th></tr>
        <tr><td>Eintritt: 8 Personen, 52 €</td><td>{m("<i>e</i> + <i>k</i> = 8")}</td><td>{m("9<i>e</i> + 5<i>k</i> = 52")}</td></tr>
        <tr><td>Köpfe und Beine</td><td>{m("<i>h</i> + <i>z</i> = 20")}</td><td>{m("2<i>h</i> + 4<i>z</i> = 56")}</td></tr>
        <tr><td>Mischung: 10 l mit 40 %</td><td>{m("<i>x</i> + <i>y</i> = 10")}</td><td>{m("0,2<i>x</i> + 0,6<i>y</i> = 4")}</td></tr>
        <tr><td>Tarif / Gewinnschwelle</td><td>{m("<i>y</i> = 0,1<i>x</i> + 8")}</td><td>{m("<i>y</i> = 0,3<i>x</i>")}</td></tr>
      </table>
    </div>
    <div class="box">
      <h2>Im Alltag</h2>
      <ul>
        <li>Einzelpreise aus zwei Kassenbons.</li>
        <li>Welcher Handy- oder Stromtarif lohnt sich?</li>
        <li>Wann trägt sich ein Verkaufsstand?</li>
      </ul>
    </div>
    <div class="box warn">
      <h2>Typische Fehler</h2>
      <ul>
        <li>„3 mehr als“ falsch herum.</li>
        <li>Einheiten gemischt (€ und ct).</li>
        <li>Unsinnige Lösung (3,5 Personen) nicht bemerkt.</li>
      </ul>
    </div>
  </div>''')

SHEETS["zentrische-streckung"] = dict(title="Ähnliche Figuren und zentrische Streckung", eyebrow="Mathematik · Klasse 8 · Ähnlichkeit", accent=M8, body=f'''
  <div class="kern">Ähnliche Figuren haben <strong>gleiche Winkel</strong>, und alle Längen stehen im selben <strong>Verhältnis</strong> {m("<i>k</i>")}. Die <strong>zentrische Streckung</strong> mit Zentrum {m("<i>Z</i>")} und Faktor {m("<i>k</i>")} erzeugt ähnliche Figuren.</div>
  <div class="cols">
    <div class="box">
      <h2>Ähnlichkeit</h2>
      <ul>
        <li>Entsprechende Winkel gleich groß.</li>
        <li>{m("<i>a</i>′ : <i>a</i> = <i>b</i>′ : <i>b</i> = <i>c</i>′ : <i>c</i> = <i>k</i>")}</li>
        <li>{m("<i>k</i> > 1")} Vergrößerung, {m("0 < <i>k</i> < 1")} Verkleinerung, {m("<i>k</i> = 1")} kongruent.</li>
        <li>Immer ähnlich: alle Kreise, Quadrate, gleichseitigen Dreiecke.</li>
      </ul>
    </div>
    <div class="box">
      <h2>Zentrische Streckung</h2>
      <ul>
        <li>{m("<i>P</i>′")} liegt auf dem Strahl {m("<i>ZP</i>")}, {m("|<i>ZP</i>′| = |<i>k</i>| · |<i>ZP</i>|")}.</li>
        <li>{m("<i>k</i> < 0")}: Bild auf der anderen Seite von {m("<i>Z</i>")}.</li>
        <li>Bildstrecken sind parallel zu den Originalstrecken.</li>
        <li>Koordinaten: {m("<i>P</i>′ = <i>Z</i> + <i>k</i> · (<i>P</i> − <i>Z</i>)")}</li>
      </ul>
    </div>
    <div class="box full">
      <h2>Was ändert sich mit <i>k</i>?</h2>
      <table>
        <tr><th>Größe</th><th>Faktor</th><th>Beispiel <i>k</i> = 3</th></tr>
        <tr><td>Winkel</td><td>bleiben gleich</td><td>60° → 60°</td></tr>
        <tr><td>Längen, Umfang</td><td>{m("· |<i>k</i>|")}</td><td>4 cm → 12 cm</td></tr>
        <tr><td>Flächen</td><td>{m("· <i>k</i>²")}</td><td>5 cm² → 45 cm²</td></tr>
      </table>
    </div>
    <div class="box">
      <h2>Im Alltag</h2>
      <ul>
        <li>Beamer, Schatten: Lampe als Zentrum.</li>
        <li>Landkarten und Modelle: Maßstab.</li>
        <li>Fotoformate und DIN-Papier.</li>
      </ul>
    </div>
    <div class="box warn">
      <h2>Typische Fehler</h2>
      <ul>
        <li>{m("<i>k</i>")} als Differenz statt Quotient.</li>
        <li>Abstand nicht von {m("<i>Z</i>")} aus gemessen.</li>
        <li>Alle Rechtecke für ähnlich gehalten.</li>
      </ul>
    </div>
  </div>''')

SHEETS["aehnliche-dreiecke"] = dict(title="Ähnliche Dreiecke", eyebrow="Mathematik · Klasse 8 · Ähnlichkeit", accent=M8, body=f'''
  <div class="kern">Dreiecke sind ähnlich, wenn sie in den Winkeln übereinstimmen. Dann stehen <strong>entsprechende Seiten</strong> (gegenüber gleichen Winkeln) im selben Verhältnis {m("<i>k</i>")}.</div>
  <div class="cols">
    <div class="box">
      <h2>Ähnlichkeitssätze</h2>
      <ul>
        <li><strong>WW</strong>: zwei Winkel gleich.</li>
        <li><strong>SSS</strong>: {m("<i>a</i>′ : <i>a</i> = <i>b</i>′ : <i>b</i> = <i>c</i>′ : <i>c</i>")}</li>
        <li><strong>SWS</strong>: zwei Seitenverhältnisse gleich und der eingeschlossene Winkel gleich.</li>
      </ul>
    </div>
    <div class="box">
      <h2>Fehlende Seite</h2>
      <ol>
        <li>Seiten zuordnen (über Winkel oder Größe).</li>
        <li>{m("<i>k</i> = Bildseite : Originalseite")}</li>
        <li>{m("<i>x</i> = <i>k</i> · Originalseite")}</li>
      </ol>
      <p>3, 4, 5 cm und 6 cm, <i>x</i>, 10 cm: {m("<i>k</i> = 2, <i>x</i> = 8")} cm</p>
    </div>
    <div class="box full">
      <h2>Höhen messen</h2>
      <table>
        <tr><th>Methode</th><th>Ähnliche Dreiecke durch</th><th>Rechnung</th></tr>
        <tr><td>Schatten</td><td>parallele Sonnenstrahlen</td><td>{m("<i>H</i> : <i>S</i> = <i>h</i> : <i>s</i>")}</td></tr>
        <tr><td>Spiegel</td><td>Einfallswinkel = Ausfallswinkel</td><td>{m("<i>H</i> : <i>D</i> = <i>h</i> : <i>d</i>")}</td></tr>
        <tr><td>Daumensprung</td><td>Arm und Augenabstand</td><td>Entfernung ≈ 10 · Sprung</td></tr>
      </table>
    </div>
    <div class="box">
      <h2>Im Alltag</h2>
      <ul>
        <li>Baumhöhe über den Schatten.</li>
        <li>Entfernungen schätzen.</li>
        <li>Gleiche Dachneigung.</li>
      </ul>
    </div>
    <div class="box warn">
      <h2>Typische Fehler</h2>
      <ul>
        <li>Nicht entsprechende Seiten verglichen.</li>
        <li>Bei SSS nur zwei Verhältnisse geprüft.</li>
        <li>Bei SWS liegt der Winkel nicht zwischen den Seiten.</li>
      </ul>
    </div>
  </div>''')

SHEETS["flaeche-volumen-aehnlich"] = dict(title="Flächen und Volumen ähnlicher Figuren", eyebrow="Mathematik · Klasse 8 · Ähnlichkeit", accent=M8, body=f'''
  <div class="kern">Bei einer Vergrößerung mit dem Faktor {m("<i>k</i>")} gilt: Längen · {m("<i>k</i>")}, Flächen · {m("<i>k</i>²")}, Volumen · {m("<i>k</i>³")}. Rückwärts: {m("<i>k</i> = √Flächenfaktor = ∛Volumenfaktor")}.</div>
  <div class="cols">
    <div class="box">
      <h2>Begründung</h2>
      <ul>
        <li>Fläche: {m("(<i>k</i><i>a</i>) · (<i>k</i><i>b</i>) = <i>k</i>² · <i>a</i><i>b</i>")}</li>
        <li>Volumen: {m("(<i>k</i><i>a</i>)(<i>k</i><i>b</i>)(<i>k</i><i>c</i>) = <i>k</i>³ · <i>a</i><i>b</i><i>c</i>")}</li>
        <li>Würfel mit {m("<i>k</i> = 3")}: 9 Flächen-Quadrate, 27 Würfel.</li>
      </ul>
    </div>
    <div class="box">
      <h2>Maßstab</h2>
      <ul>
        <li>1 : 100 bei Längen: 1 cm → 1 m.</li>
        <li>Flächen: 1 cm² → 10 000 cm² = 1 m².</li>
        <li>Volumen: 1 cm³ → 1 000 000 cm³ = 1 m³.</li>
      </ul>
    </div>
    <div class="box full">
      <h2>Faktoren</h2>
      <table>
        <tr><th><i>k</i></th><th>Länge</th><th>Fläche</th><th>Volumen</th></tr>
        <tr><td>2</td><td>· 2</td><td>· 4</td><td>· 8</td></tr>
        <tr><td>3</td><td>· 3</td><td>· 9</td><td>· 27</td></tr>
        <tr><td>0,5</td><td>· 0,5</td><td>· 0,25</td><td>· 0,125</td></tr>
        <tr><td>10</td><td>· 10</td><td>· 100</td><td>· 1000</td></tr>
      </table>
    </div>
    <div class="box">
      <h2>Im Alltag</h2>
      <ul>
        <li>Pizza: Durchmesser ·2 ⇒ Fläche ·4.</li>
        <li>Modelle: Lack ·{m("<i>k</i>²")}, Gewicht ·{m("<i>k</i>³")}.</li>
        <li>Große Tiere kühlen langsamer aus.</li>
      </ul>
    </div>
    <div class="box warn">
      <h2>Typische Fehler</h2>
      <ul>
        <li>Fläche mit {m("<i>k</i>")} statt {m("<i>k</i>²")} multipliziert.</li>
        <li>Volumen bei {m("<i>k</i> = 2")} nur verdoppelt.</li>
        <li>Maßstab bei Flächen wie bei Längen angewendet.</li>
      </ul>
    </div>
  </div>''')

SHEETS["strahlensaetze"] = dict(title="Strahlensätze", eyebrow="Mathematik · Klasse 8 · Ähnlichkeit", accent=M8, body=f'''
  <div class="kern">Zwei Strahlen mit Startpunkt {m("<i>Z</i>")} werden von zwei <strong>Parallelen</strong> geschnitten. Die entstehenden Dreiecke sind ähnlich, deshalb gelten feste Streckenverhältnisse. Das funktioniert in der V-Figur und in der X-Figur.</div>
  <div class="cols">
    <div class="box">
      <h2>1. Strahlensatz</h2>
      <p>Abschnitte auf den Strahlen:</p>
      <ul>
        <li>{m("|<i>ZA</i>| : |<i>ZA</i>′| = |<i>ZB</i>| : |<i>ZB</i>′|")}</li>
        <li>auch mit Teilstücken: {m("|<i>ZA</i>| : |<i>AA</i>′| = |<i>ZB</i>| : |<i>BB</i>′|")}</li>
      </ul>
    </div>
    <div class="box">
      <h2>2. Strahlensatz</h2>
      <p>Abschnitte auf den Parallelen:</p>
      <ul>
        <li>{m("|<i>AB</i>| : |<i>A</i>′<i>B</i>′| = |<i>ZA</i>| : |<i>ZA</i>′|")}</li>
        <li><strong>nur vom Zentrum aus</strong>, nie mit {m("|<i>AA</i>′|")}!</li>
      </ul>
    </div>
    <div class="box full">
      <h2>Beispiel (V-Figur)</h2>
      <table>
        <tr><th>gegeben</th><th>gesucht</th><th>Rechnung</th></tr>
        <tr><td>{m("|<i>ZA</i>| = 3, |<i>AA</i>′| = 2, |<i>AB</i>| = 2,4")}</td><td>{m("|<i>A</i>′<i>B</i>′|")}</td><td>{m("2,4 · 5 : 3 = 4")} (2. Satz)</td></tr>
        <tr><td>{m("|<i>ZB</i>| = 4,5")}</td><td>{m("|<i>BB</i>′|")}</td><td>{m("4,5 · 2 : 3 = 3")} (1. Satz)</td></tr>
        <tr><td colspan="3">Umkehrung: Stimmen die Verhältnisse auf den Strahlen, sind die Geraden parallel.</td></tr>
      </table>
    </div>
    <div class="box">
      <h2>Im Alltag</h2>
      <ul>
        <li>Flussbreite und Baumhöhe messen.</li>
        <li>Lochkamera (X-Figur).</li>
        <li>Strecke in gleiche Teile teilen.</li>
      </ul>
    </div>
    <div class="box warn">
      <h2>Typische Fehler</h2>
      <ul>
        <li>2. Strahlensatz mit Teilstück {m("|<i>AA</i>′|")}.</li>
        <li>Geraden nicht parallel.</li>
        <li>Verhältnisse vertauscht.</li>
      </ul>
    </div>
  </div>''')

CH11 = "#6a3fa0"
SHEETS["atombau"] = dict(title="Atombau und Schalenmodell", eyebrow="Chemie · Klasse 11 · Atome", accent=CH11, body=f'''
  <div class="kern">Atome bestehen aus einem winzigen <strong>Kern</strong> (Protonen p⁺ und Neutronen n) und einer <strong>Hülle</strong> aus Elektronen e⁻. Die <strong>Protonenzahl</strong> (Ordnungszahl Z) legt das Element fest. Nach <strong>Bohr</strong> befinden sich die Elektronen auf Schalen mit bestimmter Energie.</div>
  <div class="cols">
    <div class="box">
      <h2>Teilchen und Zahlen</h2>
      <table>
        <tr><th>Teilchen</th><th>Ladung</th><th>Masse</th></tr>
        <tr><td>Proton (Kern)</td><td>+1</td><td>≈ 1 u</td></tr>
        <tr><td>Neutron (Kern)</td><td>0</td><td>≈ 1 u</td></tr>
        <tr><td>Elektron (Hülle)</td><td>−1</td><td>≈ 1/1836 u</td></tr>
      </table>
      <p>Massenzahl A = p⁺ + n, Neutronen = A − Z. Beispiel <sup>35</sup><sub>17</sub>Cl: 17 p⁺, 18 n, 17 e⁻.</p>
    </div>
    <div class="box">
      <h2>Isotope und Ionen</h2>
      <ul>
        <li><strong>Isotope</strong>: gleiche Protonen-, andere Neutronenzahl (¹²C, ¹⁴C).</li>
        <li><strong>Kation</strong>: Elektronen abgegeben, positiv (Na⁺, Mg²⁺).</li>
        <li><strong>Anion</strong>: Elektronen aufgenommen, negativ (Cl⁻, O²⁻).</li>
        <li>Mittlere Atommasse: gewichteter Mittelwert der Isotope.</li>
      </ul>
    </div>
    <div class="box full">
      <h2>Schalenmodell nach Bohr</h2>
      <table>
        <tr><th>Schale</th><th>K (n = 1)</th><th>L (n = 2)</th><th>M (n = 3)</th><th>N (n = 4)</th></tr>
        <tr><td>maximal 2n²</td><td>2</td><td>8</td><td>18</td><td>32</td></tr>
        <tr><td>Beispiel Na (Z = 11)</td><td>2</td><td>8</td><td>1</td><td>–</td></tr>
        <tr><td>Beispiel Ca (Z = 20)</td><td>2</td><td>8</td><td>8</td><td>2</td></tr>
      </table>
      <p>Valenzelektronen = Elektronen der äußersten Schale = Hauptgruppennummer. Acht Valenzelektronen (He: zwei) = <strong>Edelgaskonfiguration</strong>, besonders stabil. Lewis-Schreibweise: Valenzelektronen als Punkte, Paare als Striche.</p>
    </div>
    <div class="box">
      <h2>Im Alltag</h2>
      <ul>
        <li>Flammenfärbung und Feuerwerk.</li>
        <li>C-14-Altersbestimmung.</li>
        <li>Radioaktives Iod in der Medizin.</li>
      </ul>
    </div>
    <div class="box warn">
      <h2>Typische Fehler</h2>
      <ul>
        <li>Massenzahl mit Neutronenzahl verwechselt.</li>
        <li>Bei Ionen die Protonenzahl geändert.</li>
        <li>Bohr-Bahnen als echte Kreisbahnen verstanden.</li>
      </ul>
    </div>
  </div>''')

SHEETS["periodensystem"] = dict(title="Periodensystem, Atombau und Eigenschaften", eyebrow="Chemie · Klasse 11 · PSE", accent=CH11, body=f'''
  <div class="kern">Die Stellung im Periodensystem verrät den Atombau: <strong>Hauptgruppe = Zahl der Valenzelektronen</strong>, <strong>Periode = Zahl der Schalen</strong>. Daraus folgen periodisch wiederkehrende Eigenschaften.</div>
  <div class="cols">
    <div class="box">
      <h2>Wichtige Gruppen</h2>
      <table>
        <tr><th>HG</th><th>Name</th><th>Ion</th></tr>
        <tr><td>I</td><td>Alkalimetalle</td><td>M⁺</td></tr>
        <tr><td>II</td><td>Erdalkalimetalle</td><td>M²⁺</td></tr>
        <tr><td>VI</td><td>Chalkogene</td><td>X²⁻</td></tr>
        <tr><td>VII</td><td>Halogene</td><td>X⁻</td></tr>
        <tr><td>VIII</td><td>Edelgase</td><td>–</td></tr>
      </table>
    </div>
    <div class="box">
      <h2>Begriffe</h2>
      <ul>
        <li><strong>Atomradius</strong>: Größe des Atoms (pm).</li>
        <li><strong>Ionisierungsenergie</strong>: Energie zum Entfernen des äußersten Elektrons.</li>
        <li><strong>Elektronegativität</strong> (EN): Fähigkeit, Bindungselektronen anzuziehen (F = 4,0 maximal).</li>
        <li><strong>Metallcharakter</strong>: Neigung, Elektronen abzugeben.</li>
      </ul>
    </div>
    <div class="box full">
      <h2>Trends</h2>
      <table>
        <tr><th></th><th>Periode nach rechts</th><th>Gruppe nach unten</th></tr>
        <tr><td>Ursache</td><td>Kernladung steigt, gleiche Schalenzahl</td><td>eine Schale mehr, Abschirmung</td></tr>
        <tr><td>Atomradius</td><td>sinkt</td><td>steigt</td></tr>
        <tr><td>Ionisierungsenergie</td><td>steigt</td><td>sinkt</td></tr>
        <tr><td>Elektronegativität</td><td>steigt</td><td>sinkt</td></tr>
        <tr><td>Metallcharakter</td><td>sinkt</td><td>steigt</td></tr>
      </table>
    </div>
    <div class="box">
      <h2>Im Alltag</h2>
      <ul>
        <li>Mendelejew sagte Ga und Ge voraus.</li>
        <li>Halbmetalle Si, Ge in Computerchips.</li>
        <li>Alkalimetalle unter Paraffinöl.</li>
      </ul>
    </div>
    <div class="box warn">
      <h2>Typische Fehler</h2>
      <ul>
        <li>Mehr Protonen gleich größeres Atom (nur in der Gruppe).</li>
        <li>Perioden und Gruppen vertauscht.</li>
        <li>Wasserstoff als Alkalimetall.</li>
      </ul>
    </div>
  </div>''')

SHEETS["stoffklassen"] = dict(title="Stoffklassen", eyebrow="Chemie · Klasse 11 · Stoffklassen", accent=CH11, body=f'''
  <div class="kern">Die Eigenschaften eines Stoffes folgen aus seinen <strong>Teilchen</strong> und den <strong>Kräften</strong> zwischen ihnen (Struktur-Eigenschafts-Beziehung). Faustregel ΔEN: unter 0,4 unpolare, 0,4 bis 1,7 polare Elektronenpaarbindung, über 1,7 Ionenbindung.</div>
  <div class="cols">
    <div class="box full">
      <h2>Drei Stoffklassen</h2>
      <table>
        <tr><th></th><th>Metalle</th><th>Ionensubstanzen</th><th>Molekülsubstanzen</th></tr>
        <tr><td>Elemente</td><td>Metall + Metall</td><td>Metall + Nichtmetall</td><td>Nichtmetall + Nichtmetall</td></tr>
        <tr><td>Teilchen</td><td>Atomrümpfe, Elektronengas</td><td>Kationen, Anionen (Ionengitter)</td><td>Moleküle</td></tr>
        <tr><td>Schmelztemperatur</td><td>meist hoch</td><td>hoch (Gitterenergie)</td><td>niedrig</td></tr>
        <tr><td>Leitfähigkeit</td><td>fest und flüssig</td><td>Schmelze, Lösung</td><td>keine</td></tr>
        <tr><td>Verformbarkeit</td><td>verformbar</td><td>spröde</td><td>weich, oft flüssig/gasförmig</td></tr>
      </table>
    </div>
    <div class="box">
      <h2>Ionensubstanzen</h2>
      <ul>
        <li>Verhältnisformel: Ladungssumme null, z. B. Al³⁺ + O²⁻ ⇒ Al₂O₃.</li>
        <li>Lösen: Wasser-Dipole bilden eine <strong>Hydrathülle</strong> (O zum Kation, H zum Anion).</li>
        <li>NaCl(s) → Na⁺(aq) + Cl⁻(aq)</li>
        <li>Gitterenergie nötig, Hydratationsenergie wird frei.</li>
      </ul>
    </div>
    <div class="box">
      <h2>Zwischenmolekulare Kräfte</h2>
      <ul>
        <li><strong>London-Kräfte</strong>: alle Moleküle, stärker bei großen Molekülen.</li>
        <li><strong>Dipol-Dipol</strong>: zwischen Dipolmolekülen (HCl).</li>
        <li><strong>Wasserstoffbrücken</strong>: H an N, O, F zu freiem Elektronenpaar (H₂O, NH₃).</li>
        <li>Dipol nur bei unsymmetrischem Bau: H₂O ja, CO₂ nein.</li>
      </ul>
    </div>
    <div class="box">
      <h2>Im Alltag</h2>
      <ul>
        <li>Salz- vs. Zuckerlösung: nur eine leitet.</li>
        <li>Kühlpack, Streusalz, Tenside.</li>
        <li>Wasser siedet dank H-Brücken bei 100 °C.</li>
      </ul>
    </div>
    <div class="box warn">
      <h2>Typische Fehler</h2>
      <ul>
        <li>Festes Salz „leitet, weil Ionen“.</li>
        <li>Polare Bindung = Dipolmolekül (Bau beachten!).</li>
        <li>Bindungen im Molekül mit Kräften zwischen Molekülen verwechselt.</li>
      </ul>
    </div>
  </div>''')

SHEETS["orbitalmodell"] = dict(title="Orbitalmodell und Elektronenkonfiguration", eyebrow="Chemie · Klasse 11 · Atommodelle", accent=CH11, body=f'''
  <div class="kern">Ein <strong>Orbital</strong> ist der Raum, in dem sich ein Elektron mit großer Wahrscheinlichkeit (90 %) aufhält. Schalen bestehen aus Unterniveaus s, p, d, f mit 1, 3, 5, 7 Orbitalen; jedes Orbital fasst <strong>höchstens 2 Elektronen</strong>.</div>
  <div class="cols">
    <div class="box">
      <h2>Drei Regeln</h2>
      <ol>
        <li><strong>Energieprinzip</strong>: 1s, 2s, 2p, 3s, 3p, <strong>4s, 3d</strong>, 4p …</li>
        <li><strong>Pauli-Prinzip</strong>: max. 2 Elektronen pro Orbital, entgegengesetzter Spin ↑↓.</li>
        <li><strong>Hund'sche Regel</strong>: gleichwertige Orbitale erst einzeln, dann doppelt.</li>
      </ol>
    </div>
    <div class="box">
      <h2>Orbitalformen</h2>
      <ul>
        <li>s: kugelförmig (1 pro Schale)</li>
        <li>p: hantelförmig (3, ab n = 2)</li>
        <li>d: meist vierblättrig (5, ab n = 3)</li>
        <li>Schale n fasst 2n² Elektronen.</li>
      </ul>
    </div>
    <div class="box full">
      <h2>Beispiele</h2>
      <table>
        <tr><th>Element</th><th>Konfiguration</th><th>kurz</th><th>ungepaart</th></tr>
        <tr><td>N (7)</td><td>1s² 2s² 2p³</td><td>[He] 2s² 2p³</td><td>3</td></tr>
        <tr><td>Na (11)</td><td>1s² 2s² 2p⁶ 3s¹</td><td>[Ne] 3s¹</td><td>1</td></tr>
        <tr><td>Fe (26)</td><td>… 3p⁶ 3d⁶ 4s²</td><td>[Ar] 3d⁶ 4s²</td><td>4</td></tr>
        <tr><td>Cu (29)</td><td>Ausnahme</td><td>[Ar] 3d¹⁰ 4s¹</td><td>1</td></tr>
      </table>
      <p>PSE: Gruppen I, II = s-Block; III bis VIII = p-Block; Nebengruppen = d-Block.</p>
    </div>
    <div class="box">
      <h2>Im Alltag</h2>
      <ul><li>Farbige Kupfer- und Eisensalze (d-Elektronen).</li><li>Magnetismus von Eisen.</li><li>Leuchtfarben im Feuerwerk.</li></ul>
    </div>
    <div class="box warn">
      <h2>Typische Fehler</h2>
      <ul><li>3d vor 4s besetzt.</li><li>p-Orbitale sofort doppelt besetzt.</li><li>Ausnahmen Cr und Cu vergessen.</li></ul>
    </div>
  </div>''')

SHEETS["redoxreaktionen"] = dict(title="Redoxreaktionen und Oxidationszahlen", eyebrow="Chemie · Klasse 11 · Redox", accent=CH11, body=f'''
  <div class="kern"><strong>Oxidation</strong> = Elektronenabgabe (OZ steigt), <strong>Reduktion</strong> = Elektronenaufnahme (OZ sinkt). Beide laufen immer gekoppelt ab. Das <strong>Reduktionsmittel</strong> gibt Elektronen ab, das <strong>Oxidationsmittel</strong> nimmt sie auf.</div>
  <div class="cols">
    <div class="box">
      <h2>Regeln für Oxidationszahlen</h2>
      <ul>
        <li>Element: 0; einatomiges Ion: Ladung</li>
        <li>F: −I; H: +I (Hydride −I); O: −II (Peroxide −I)</li>
        <li>Summe = Ladung des Teilchens</li>
        <li>PSE: max. OZ = Gruppe, min. = Gruppe − 8</li>
      </ul>
    </div>
    <div class="box">
      <h2>Gleichungen aufstellen</h2>
      <ol>
        <li>OZ bestimmen.</li>
        <li>Teilgleichungen mit e⁻.</li>
        <li>Ladung mit H⁺ / OH⁻, dann H₂O.</li>
        <li>Elektronen auf kgV bringen.</li>
        <li>Addieren, Probe.</li>
      </ol>
    </div>
    <div class="box full">
      <h2>Beispiel</h2>
      <table>
        <tr><th>Schritt</th><th>MnO₄⁻ + Fe²⁺ in saurer Lösung</th></tr>
        <tr><td>Reduktion</td><td>MnO₄⁻ + 8 H⁺ + 5 e⁻ → Mn²⁺ + 4 H₂O</td></tr>
        <tr><td>Oxidation (·5)</td><td>5 Fe²⁺ → 5 Fe³⁺ + 5 e⁻</td></tr>
        <tr><td>Gesamt</td><td>MnO₄⁻ + 5 Fe²⁺ + 8 H⁺ → Mn²⁺ + 5 Fe³⁺ + 4 H₂O</td></tr>
      </table>
      <p>Redoxreihe: K, Ca, Na, Mg, Al, Zn, Fe, Ni, Sn, Pb, (H₂), Cu, Ag, Au – ein Metall reduziert die Ionen der rechts stehenden Metalle.</p>
    </div>
    <div class="box">
      <h2>Im Alltag</h2>
      <ul><li>Rosten und Verzinken.</li><li>Batterien und Akkus.</li><li>Zellatmung, Bleichmittel.</li></ul>
    </div>
    <div class="box warn">
      <h2>Typische Fehler</h2>
      <ul><li>Oxidationsmittel wird selbst reduziert!</li><li>Elektronen nicht ausgeglichen.</li><li>Peroxide und Hydride übersehen.</li></ul>
    </div>
  </div>''')

SHEETS["gebrauchsmetalle"] = dict(title="Gebrauchsmetalle", eyebrow="Chemie · Klasse 11 · Redox", accent=CH11, body=f'''
  <div class="kern">Metalle liegen in <strong>Erzen</strong> als Kationen vor. Ihre Gewinnung ist eine <strong>Reduktion</strong>. Je unedler das Metall, desto stärker muss das Reduktionsmittel sein: edle Metalle gediegen, mittlere mit <strong>Kohlenstoff</strong>, unedle durch <strong>Elektrolyse</strong>.</div>
  <div class="cols">
    <div class="box">
      <h2>Hochofen (Eisen)</h2>
      <ul>
        <li>Beschickung: Erz, Koks, Kalk; unten Heißwind.</li>
        <li>C + O₂ → CO₂; CO₂ + C → 2 CO</li>
        <li><strong>Fe₂O₃ + 3 CO → 2 Fe + 3 CO₂</strong></li>
        <li>Kalk + Gangart → Schlacke</li>
        <li>Roheisen (4 % C) → Frischen → Stahl</li>
      </ul>
    </div>
    <div class="box">
      <h2>Elektrolyse</h2>
      <ul>
        <li>Al: Al₂O₃ in Kryolith, 950 °C</li>
        <li>Kathode (−): Al³⁺ + 3 e⁻ → Al</li>
        <li>Anode (+): 2 O²⁻ → O₂ + 4 e⁻</li>
        <li>Cu-Raffination: Rohkupfer (+) → Reinkupfer (−), Ag/Au im Anodenschlamm</li>
      </ul>
    </div>
    <div class="box full">
      <h2>Rechnen</h2>
      <table>
        <tr><th>Schritt</th><th>Beispiel: Eisen aus 1000 kg Fe₂O₃</th></tr>
        <tr><td>M(Erz)</td><td>2 · 55,85 + 3 · 16,00 = 159,7 g/mol</td></tr>
        <tr><td>n = m / M</td><td>1000 kg : 159,7 g/mol = 6,26 kmol</td></tr>
        <tr><td>Verhältnis</td><td>2 Fe pro Fe₂O₃ ⇒ 12,52 kmol Fe</td></tr>
        <tr><td>m = n · M</td><td>12,52 kmol · 55,85 g/mol = 699 kg</td></tr>
      </table>
    </div>
    <div class="box">
      <h2>Im Alltag</h2>
      <ul><li>Al-Recycling spart 95 % Energie.</li><li>Gold aus Althandys.</li><li>Grüner Stahl mit H₂.</li></ul>
    </div>
    <div class="box warn">
      <h2>Typische Fehler</h2>
      <ul><li>Eisen wird reduziert, nicht oxidiert.</li><li>Roheisen ≠ Stahl.</li><li>Al lässt sich nicht mit C gewinnen.</li></ul>
    </div>
  </div>''')

SHEETS["komplexverbindungen"] = dict(title="Komplexverbindungen", eyebrow="Chemie · Klasse 11 · Wahlpflicht", accent=CH11, body=f'''
  <div class="kern">Ein <strong>Komplex</strong> besteht aus einem <strong>Zentralion</strong> (Elektronenpaar-Akzeptor) und <strong>Liganden</strong> (Elektronenpaar-Donatoren), verbunden durch <strong>koordinative Bindungen</strong>. Die Zahl der Liganden ist die <strong>Koordinationszahl</strong>.</div>
  <div class="cols">
    <div class="box">
      <h2>Ladung und Bau</h2>
      <ul>
        <li>Ladung = Zentralion + Σ Liganden</li>
        <li>[Fe(CN)₆]: +3 + 6·(−1) = 3−</li>
        <li>KZ 2 linear, 4 tetraedrisch/quadratisch, 6 oktaedrisch</li>
      </ul>
    </div>
    <div class="box">
      <h2>Benennen</h2>
      <ol>
        <li>Zahlwort: di, tri, tetra, hexa</li>
        <li>Ligand: aqua, ammin, chlorido, cyanido, hydroxido</li>
        <li>Zentralion (OZ römisch)</li>
        <li>Anion: -at (Ferrat, Cuprat, Argentat)</li>
      </ol>
    </div>
    <div class="box full">
      <h2>Wichtige Komplexe</h2>
      <table>
        <tr><th>Formel</th><th>Name</th><th>Farbe / Nutzen</th></tr>
        <tr><td>[Cu(NH₃)₄]²⁺</td><td>Tetraamminkupfer(II)-Ion</td><td>tiefblau, Cu²⁺-Nachweis</td></tr>
        <tr><td>[Fe(SCN)(H₂O)₅]²⁺</td><td>Thiocyanatopentaaquaeisen(III)-Ion</td><td>blutrot, Fe³⁺-Nachweis</td></tr>
        <tr><td>[Fe(CN)₆]³⁻</td><td>Hexacyanidoferrat(III)-Ion</td><td>rotes Blutlaugensalz</td></tr>
        <tr><td>[Ag(S₂O₃)₂]³⁻</td><td>Dithiosulfatoargentat(I)-Ion</td><td>Fixieren in der Fotografie</td></tr>
      </table>
    </div>
    <div class="box">
      <h2>Im Alltag</h2>
      <ul><li>Hämoglobin (Fe), Chlorophyll (Mg).</li><li>Wasserenthärter in Waschmitteln.</li><li>Berliner Blau.</li></ul>
    </div>
    <div class="box warn">
      <h2>Typische Fehler</h2>
      <ul><li>Neutrale Liganden mit Ladung gerechnet.</li><li>-at bei Anionen vergessen.</li><li>OZ mit Komplexladung verwechselt.</li></ul>
    </div>
  </div>''')

SHEETS["reaktionsgeschwindigkeit"] = dict(title="Reaktionsgeschwindigkeit und Katalysatoren", eyebrow="Chemie · Klasse 11 · Chemische Gleichgewichte", accent=CH11, body=f'''
  <div class="kern">Die <strong>Reaktionsgeschwindigkeit</strong> ist die Konzentrationsänderung pro Zeit: <strong>v = Δc / Δt</strong> (für Edukte mit Minus). Nach der <strong>Stoßtheorie</strong> reagieren Teilchen nur bei Zusammenstößen mit ausreichender Energie (≥ Eₐ) und passender Ausrichtung.</div>
  <div class="cols">
    <div class="box">
      <h2>Messen</h2>
      <ul><li>Gasvolumen (Kolbenprober)</li><li>Massenverlust (Waage)</li><li>Farbe (Fotometer), Leitfähigkeit</li><li>Mittlere v: Sekante; momentane v: Tangente</li></ul>
    </div>
    <div class="box">
      <h2>Einflüsse</h2>
      <ul><li><strong>Konzentration</strong> ↑: mehr Stöße</li><li><strong>Temperatur</strong> ↑: RGT-Regel, +10 K ≈ ·2</li><li><strong>Oberfläche</strong> ↑: Pulver schneller</li><li><strong>Katalysator</strong>: Eₐ sinkt</li></ul>
    </div>
    <div class="box full">
      <h2>Katalysatoren</h2>
      <table>
        <tr><th>Merkmal</th><th>Erklärung</th></tr>
        <tr><td>Wirkung</td><td>neuer Reaktionsweg mit kleinerer Aktivierungsenergie</td></tr>
        <tr><td>bleibt unverändert</td><td>wird nicht verbraucht</td></tr>
        <tr><td>ändert nicht</td><td>ΔH und die Lage des Gleichgewichts</td></tr>
        <tr><td>Beispiele</td><td>Pt/Rh im Autokatalysator, Enzyme, MnO₂ bei H₂O₂, Fe bei NH₃</td></tr>
      </table>
    </div>
    <div class="box">
      <h2>Im Alltag</h2>
      <ul><li>Kühlschrank, Schnellkochtopf.</li><li>Mehlstaubexplosion.</li><li>Enzyme in Verdauung und Waschmittel.</li></ul>
    </div>
    <div class="box warn">
      <h2>Typische Fehler</h2>
      <ul><li>Schneller ≠ mehr Produkt.</li><li>Katalysator liefert keine Energie.</li><li>Vorzeichen bei Δc der Edukte.</li></ul>
    </div>
  </div>''')

SHEETS["chemisches-gleichgewicht"] = dict(title="Chemisches Gleichgewicht und Le Chatelier", eyebrow="Chemie · Klasse 11 · Chemische Gleichgewichte", accent=CH11, body=f'''
  <div class="kern">Im <strong>dynamischen Gleichgewicht</strong> (geschlossenes System) laufen Hin- und Rückreaktion <strong>gleich schnell</strong>; die Konzentrationen bleiben konstant, sind aber nicht gleich. <strong>Le Chatelier</strong>: Ein Zwang verschiebt das Gleichgewicht so, dass der Zwang verringert wird.</div>
  <div class="cols">
    <div class="box full">
      <h2>Zwänge</h2>
      <table>
        <tr><th>Zwang</th><th>Verschiebung</th><th>Beispiel N₂ + 3 H₂ ⇌ 2 NH₃ (exotherm)</th></tr>
        <tr><td>Edukt zugeben / Produkt entfernen</td><td>zu den Produkten</td><td>NH₃ herauskühlen ⇒ mehr NH₃</td></tr>
        <tr><td>Druck erhöhen</td><td>zur Seite mit weniger Gasteilchen</td><td>4 → 2: mehr NH₃</td></tr>
        <tr><td>Temperatur erhöhen</td><td>Richtung endotherm</td><td>weniger NH₃</td></tr>
        <tr><td>Katalysator</td><td>keine</td><td>nur schneller (Fe)</td></tr>
      </table>
    </div>
    <div class="box">
      <h2>Haber-Bosch</h2>
      <ul><li>200–300 bar, ca. 450 °C, Fe-Katalysator</li><li>Kompromiss: Ausbeute gegen Geschwindigkeit</li><li>NH₃ auskondensieren, Kreislauf</li></ul>
    </div>
    <div class="box">
      <h2>In der Natur</h2>
      <ul><li>Tropfsteine: CO₂ entweicht</li><li>Blut: Hb + O₂ ⇌ HbO₂</li><li>Sprudel, Ozeanversauerung</li></ul>
    </div>
    <div class="box">
      <h2>Versuch NO₂/N₂O₄</h2>
      <ul><li>2 NO₂ (braun) ⇌ N₂O₄ (farblos), exotherm</li><li>Kälte, Druck: heller</li><li>Wärme: dunkler</li></ul>
    </div>
    <div class="box warn">
      <h2>Typische Fehler</h2>
      <ul><li>Gleichgewicht ≠ Stillstand.</li><li>Konzentrationen nicht gleich.</li><li>Nur Gase beim Druck zählen.</li></ul>
    </div>
  </div>''')

SHEETS["massenwirkungsgesetz"] = dict(title="Gleichgewichtskonstante und Massenwirkungsgesetz", eyebrow="Chemie · Klasse 11 · Chemische Gleichgewichte", accent=CH11, body=f'''
  <div class="kern">Für a A + b B ⇌ c C + d D gilt im Gleichgewicht: <strong>K = c(C)<sup>c</sup> · c(D)<sup>d</sup> / (c(A)<sup>a</sup> · c(B)<sup>b</sup>)</strong>. K hängt nur von der Reaktion und der <strong>Temperatur</strong> ab.</div>
  <div class="cols">
    <div class="box">
      <h2>Regeln</h2>
      <ul><li>Produkte oben, Edukte unten</li><li>Koeffizienten = Hochzahlen</li><li>Feststoffe, Lösemittel entfallen</li><li>Einheit aus den Hochzahlen</li></ul>
    </div>
    <div class="box">
      <h2>Bedeutung</h2>
      <ul><li>K ≫ 1: Produktseite</li><li>K ≪ 1: Eduktseite</li><li>Q &lt; K: nach rechts; Q &gt; K: nach links</li><li>T ↑: K sinkt (exo), steigt (endo)</li></ul>
    </div>
    <div class="box full">
      <h2>Rechnen mit der Gleichgewichtstabelle</h2>
      <table>
        <tr><th></th><th>Säure</th><th>Alkohol</th><th>Ester</th><th>Wasser</th></tr>
        <tr><td>Anfang</td><td>1</td><td>1</td><td>0</td><td>0</td></tr>
        <tr><td>Änderung</td><td>−x</td><td>−x</td><td>+x</td><td>+x</td></tr>
        <tr><td>Gleichgewicht</td><td>1 − x</td><td>1 − x</td><td>x</td><td>x</td></tr>
      </table>
      <p>K = 4 = x² / (1 − x)² ⇒ x = 2/3 mol. Bei ungleichen Mengen quadratische Gleichung lösen.</p>
    </div>
    <div class="box">
      <h2>Beispiele</h2>
      <ul><li>N₂ + 3 H₂ ⇌ 2 NH₃: K = c(NH₃)² / (c(N₂) · c(H₂)³)</li><li>CaCO₃ ⇌ CaO + CO₂: K = c(CO₂)</li></ul>
    </div>
    <div class="box warn">
      <h2>Typische Fehler</h2>
      <ul><li>Koeffizienten als Faktoren.</li><li>Anfangs- statt Gleichgewichtswerte.</li><li>Zähler und Nenner vertauscht.</li></ul>
    </div>
  </div>''')

SHEETS["loeslichkeitsgleichgewichte"] = dict(title="Löslichkeitsgleichgewichte", eyebrow="Chemie · Klasse 11 · Wahlpflicht", accent=CH11, body=f'''
  <div class="kern">In einer <strong>gesättigten Lösung</strong> besteht ein Gleichgewicht zwischen Bodenkörper und Ionen, z. B. AgCl(s) ⇌ Ag⁺ + Cl⁻. Das <strong>Löslichkeitsprodukt</strong> K<sub>L</sub> = c(Ag⁺) · c(Cl⁻) ist bei gegebener Temperatur konstant.</div>
  <div class="cols">
    <div class="box">
      <h2>Löslichkeit L</h2>
      <ul><li>AB: K<sub>L</sub> = L² ⇒ L = √K<sub>L</sub></li><li>AB₂, A₂B: K<sub>L</sub> = 4L³ ⇒ L = ∛(K<sub>L</sub>/4)</li><li>Nur gleiche Salztypen über K<sub>L</sub> vergleichen.</li></ul>
    </div>
    <div class="box">
      <h2>Fällung</h2>
      <ul><li>Q &gt; K<sub>L</sub>: Niederschlag</li><li>Q = K<sub>L</sub>: gesättigt</li><li>Q &lt; K<sub>L</sub>: ungesättigt</li><li>Gleichioniger Zusatz senkt L</li></ul>
    </div>
    <div class="box full">
      <h2>Nachweise (Wasseruntersuchung)</h2>
      <table>
        <tr><th>Ion</th><th>Reagenz</th><th>Beobachtung</th></tr>
        <tr><td>Cl⁻</td><td>Silbernitrat</td><td>weißer Niederschlag AgCl</td></tr>
        <tr><td>SO₄²⁻</td><td>Bariumchlorid</td><td>weißer Niederschlag BaSO₄</td></tr>
        <tr><td>Ca²⁺</td><td>Ammoniumoxalat</td><td>weißer Niederschlag CaC₂O₄</td></tr>
        <tr><td>Fe³⁺</td><td>Kaliumthiocyanat</td><td>blutrote Färbung</td></tr>
      </table>
    </div>
    <div class="box">
      <h2>Im Alltag</h2>
      <ul><li>BaSO₄ beim Röntgen.</li><li>Fluorid und Zahnschmelz.</li><li>Kesselstein, Nierensteine.</li></ul>
    </div>
    <div class="box warn">
      <h2>Typische Fehler</h2>
      <ul><li>2L nicht quadriert.</li><li>Verdünnung beim Mischen vergessen.</li><li>Bodenkörper ins K<sub>L</sub> eingesetzt.</li></ul>
    </div>
  </div>''')

SHEETS["saeuren-basen"] = dict(title="Säuren und Basen nach Brønsted", eyebrow="Chemie · Klasse 11 · Säure-Base-Gleichgewichte", accent=CH11, body=f'''
  <div class="kern"><strong>Säure</strong> = Protonendonator, <strong>Base</strong> = Protonenakzeptor (Brønsted). Eine Säure-Base-Reaktion ist eine <strong>Protolyse</strong> mit zwei korrespondierenden Säure-Base-Paaren: Säure 1 + Base 2 ⇌ Base 1 + Säure 2.</div>
  <div class="cols">
    <div class="box">
      <h2>Beispiele</h2>
      <ul><li>HCl + H₂O → H₃O⁺ + Cl⁻</li><li>NH₃ + H₂O ⇌ NH₄⁺ + OH⁻</li><li>HCl + NH₃ → NH₄⁺ + Cl⁻</li><li>H₃O⁺ + OH⁻ → 2 H₂O</li></ul>
    </div>
    <div class="box">
      <h2>Begriffe</h2>
      <ul><li>H₃O⁺: Oxonium-Ion (sauer)</li><li>OH⁻: Hydroxid-Ion (basisch)</li><li>Ampholyt: H₂O, HCO₃⁻, HSO₄⁻</li><li>mehrprotonig: H₂SO₄, H₃PO₄</li></ul>
    </div>
    <div class="box full">
      <h2>Begriffe im Wandel</h2>
      <table>
        <tr><th>Zeit</th><th>Modell</th></tr>
        <tr><td>Boyle 1663</td><td>Indikatoren: Säure rot, Lauge blau</td></tr>
        <tr><td>Lavoisier 1777</td><td>Sauerstoff als Säurebildner (widerlegt)</td></tr>
        <tr><td>Arrhenius 1887</td><td>Säure bildet H⁺, Base OH⁻ in Wasser</td></tr>
        <tr><td>Brønsted 1923</td><td>Protonendonator/-akzeptor, auch ohne Wasser</td></tr>
        <tr><td>Lewis 1923</td><td>Elektronenpaar-Akzeptor/-Donator</td></tr>
      </table>
    </div>
    <div class="box">
      <h2>Im Alltag</h2>
      <ul><li>Abflussreiniger (NaOH), Zitronensaft.</li><li>Magensäure, Antazida.</li><li>Kalk gegen sauren Boden.</li></ul>
    </div>
    <div class="box warn">
      <h2>Typische Fehler</h2>
      <ul><li>Base braucht kein OH⁻ (NH₃!).</li><li>Paare unterscheiden sich um genau ein H⁺.</li><li>Keine freien H⁺ in Wasser.</li></ul>
    </div>
  </div>''')

SHEETS["ph-wert"] = dict(title="Autoprotolyse des Wassers und pH-Wert", eyebrow="Chemie · Klasse 11 · Säure-Base-Gleichgewichte", accent=CH11, body=f'''
  <div class="kern"><strong>Autoprotolyse</strong>: 2 H₂O ⇌ H₃O⁺ + OH⁻. <strong>Ionenprodukt</strong> K<sub>W</sub> = c(H₃O⁺) · c(OH⁻) = 10⁻¹⁴ mol²/L² (25 °C). <strong>pH = −lg c(H₃O⁺)</strong>, pOH = −lg c(OH⁻), pH + pOH = 14.</div>
  <div class="cols">
    <div class="box">
      <h2>Skala</h2>
      <ul><li>pH &lt; 7 sauer, 7 neutral, &gt; 7 basisch</li><li>1 pH-Stufe = Faktor 10</li><li>Verdünnung 1 : 10 einer starken Säure: pH + 1</li></ul>
    </div>
    <div class="box">
      <h2>Starke Säuren/Basen</h2>
      <ul><li>c(H₃O⁺) = c₀(Säure) ⇒ pH = −lg c₀</li><li>c(OH⁻) = c₀(Base) ⇒ pH = 14 + lg c₀</li><li>Ba(OH)₂: c(OH⁻) = 2 c₀</li></ul>
    </div>
    <div class="box full">
      <h2>Beispiele</h2>
      <table>
        <tr><th>Lösung</th><th>c</th><th>pH</th></tr>
        <tr><td>HCl</td><td>0,1 mol/L</td><td>1</td></tr>
        <tr><td>HCl</td><td>0,002 mol/L</td><td>2,70</td></tr>
        <tr><td>NaOH</td><td>0,01 mol/L</td><td>12</td></tr>
        <tr><td>reines Wasser</td><td>10⁻⁷ mol/L H₃O⁺</td><td>7</td></tr>
      </table>
    </div>
    <div class="box">
      <h2>Im Alltag</h2>
      <ul><li>Magen 1–2, Haut 5,5, Blut 7,4.</li><li>Saurer Regen, Schwimmbad.</li></ul>
    </div>
    <div class="box warn">
      <h2>Typische Fehler</h2>
      <ul><li>Bei Basen pOH statt pH angegeben.</li><li>Stufen linear gedacht.</li><li>Verdünnte Säure „basisch“.</li></ul>
    </div>
  </div>''')

OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.dirname(__file__), "_build")
os.makedirs(OUT, exist_ok=True)
shutil.copyfile(os.path.join(os.path.dirname(os.path.abspath(__file__)), "factsheet.css"), os.path.join(OUT, "factsheet.css"))
for name, s in SHEETS.items():
    html = HEAD.format(**{"extra": "", **s}) + s["body"] + "\n" + FOOT.format(eyebrow=s["eyebrow"], app=name)
    open(os.path.join(OUT, f"{name}.html"), "w").write(html)
print("factsheet sources:", ", ".join(SHEETS))
