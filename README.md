# LearningDesk

Interaktive Lern-Apps, sortiert nach Klassenstufe. Startseite: `docs/index.html` (Menü Klassenstufe 8 / 11).

# Werkzeuge

## ClassPad-Simulator (`classpad.html`)

Übungsrechner, der sich an der Bedienung des CASIO fx-CP400 (ClassPad II) orientiert. Unabhängiges Lernprojekt, kein Abbild der Original-Software.
- Anwendungen: Main (exakt/dezimal, Brüche, Wurzeln, expand, factor, solve, diff, ∫), Graph&Tabelle (Zeichnen, View-Window, Wertetabelle, Nullstelle, Max, Min, Schnittpunkt, Trace), Statistik (Listen, 1-Var-Statistik, lineare Regression)
- Lernmodus mit 16 Lektionen von Klasse 8 bis 12: Die nächste Taste wird markiert, „Zeig’s mir“ führt den Schritt vor
- Rechenkern: [Algebrite](https://github.com/davidedc/Algebrite) (MIT-Lizenz), liegt in `vendor/`

# Klassenstufe 8

## Binomische Formeln (`binomische-formeln.html`)

Die drei Formeln mit Merkschema und typischen Fehlern, Erklärung am Flächenmodell und durch Ausmultiplizieren, Trainer (Lücken füllen, ausmultiplizieren, faktorisieren) mit Prüfung der Eingabe, Kopfrechen-Trick, Quiz.

## Bruchterme (`bruchterme.html`)

Was ist ein Bruchterm, Definitionsmenge mit Wertetabelle, Kürzen und Erweitern („nur Faktoren kürzen“, Kürzen mit binomischen Formeln), die vier Grundrechenarten mit Hauptnenner, Trainer (Definitionsmenge, Kürzen, Rechnen) mit Prüfung der Eingabe, Quiz.

# Klassenstufe 11

## Osmose verstehen (`osmose.html`)

Interaktive Lernhilfe zum Thema Osmose für Biologie, Klasse 11. Einfach `osmose.html` im Browser öffnen, eine Installation ist nicht nötig.

Bereiche:
1. **Verstehen**: Definition, Bedingungen, hypo-/iso-/hypertonisch, Diffusion und Osmose im Vergleich, typische Klausurfehler, Begriffe
2. **Simulation**: Osmometer mit einstellbaren Konzentrationen und umschaltbarer Membran
3. **Zellen**: rote Blutzelle und Zwiebelzelle in verschiedenen Lösungen (Hämolyse, Plasmolyse, Turgor), dazu die pulsierende Vakuole
4. **Alltag**: 13 Alltagsbeispiele zum Vorhersagen und Erklären
5. **Quiz**: 12 zufällige Fragen aus 18, jeweils mit Erklärung

## Natrium-Kalium-Pumpe (`natrium-kalium-pumpe.html`)

Lernhilfe zur Na⁺/K⁺-ATPase für Biologie, Klasse 11:
1. **Grundlagen**: Stöchiometrie 3 Na⁺ / 2 K⁺ / 1 ATP, Ionenverteilung, Einordnung der Transportarten, typische Fehler
2. **Pumpzyklus**: animierter Zyklus in sechs Schritten (E1/E2, Phosphorylierung, Affinitätswechsel)
3. **Simulation**: Gradienten und Membranpotential mit Leckströmen. Pumpe hemmen, ATP entziehen, K⁺ außen ändern, Aktionspotentiale auslösen
4. **Bedeutung**: Ruhepotential, Zellvolumen, sekundär aktiver Transport, Energiebedarf, Hemmstoffe
5. **Was passiert, wenn …**: 8 Fallbeispiele zum Vorhersagen
6. **Quiz**: 12 zufällige Fragen aus 17

## Ableiten lernen (`ableiten.html`)

Lernhilfe zur Differentialrechnung für Mathematik, Klasse 11:
1. **Idee**: Wie aus der Sekante die Tangente wird (Differenzen- und Differentialquotient)
2. **Grafisch ableiten**: f′ entsteht Punkt für Punkt, dazu eine Übersicht der Zusammenhänge und die Übung „Welcher Graph ist f′?“
3. **Regeln**: Konstanten-, Potenz-, Faktor- und Summenregel, Brüche und Wurzeln, sin/cos, typische Fehler
4. **Trainer**: zufällige Funktionen in drei Stufen. Die Eingabe wird auf mathematische Gleichwertigkeit geprüft, mit Lösungsweg.
5. **Tangente**: Tangentengleichung Schritt für Schritt, dazu Übungsaufgaben
6. **Quiz**: 12 zufällige Fragen aus 19

## Factsheets (PDF)

Zu jedem Thema gibt es ein einseitiges A4-Factsheet in `docs/factsheets/`. Die Quellen liegen in `tools/factsheets/`: `make_sources.py` erzeugt die HTML-Dateien, `node tools/build-factsheets.js` rendert sie zu PDFs und prüft, dass jedes Blatt auf eine Seite passt.

## Ohne Claude öffnen

`docs/` enthält eigenständige Versionen aller Apps und eine Startseite (`docs/index.html`). Diese Dateien lassen sich direkt im Browser öffnen oder über GitHub Pages veröffentlichen (Quelle: Standard-Branch, Ordner `/docs`).
Nach Änderungen an einer App erzeugst du die Dateien mit `tools/build-standalone.sh` neu.
