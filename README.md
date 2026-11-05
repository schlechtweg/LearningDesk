# LearningDesk

Interaktive Lern-Apps für die Schule, sortiert nach Klassenstufe. Alles läuft im Browser und wird über GitHub Pages veröffentlicht: **https://schlechtweg.github.io/LearningDesk/**

## Inhalte

| Bereich | Thema | Inhalt |
|---|---|---|
| Klasse 8 · Biologie | Das Auge | Aufbau zum Antippen und Abfragen, Pupillenreflex, Akkommodation, Fehlsichtigkeiten mit Brillen-Simulation, Trainer, Quiz |
| Klasse 8 · Mathematik | Binomische Formeln | Formeln, Flächenmodell, Trainer (Lücken, ausmultiplizieren, faktorisieren), Kopfrechen-Trick, Quiz |
| Klasse 8 · Mathematik | Bruchterme | Definitionsmenge, Kürzen und Erweitern, Rechenregeln, Trainer, Quiz |
| Klasse 8 · Mathematik | Ausmultiplizieren und Faktorisieren | Distributivgesetz, Klammer mal Klammer, Ausklammern, Flächenmodell, Trainer, Quiz |
| Klasse 8 · Mathematik | Terme vereinfachen | Gleichartige Terme, Produkte mit mehreren Variablen, Termsortierer, Trainer, Quiz |
| Klasse 8 · Mathematik | Gleichungen lösen | Äquivalenzumformungen, Umformungs-Werkstatt, Trainer mit Rechenweg und Probe, Quiz |
| Klasse 8 · Mathematik | Ungleichungen lösen | Zahlenstrahl, Zeichen umdrehen, Umformungs-Werkstatt, Trainer, Quiz |
| Klasse 8 · Physik | Druck in Flüssigkeiten und Gasen | p = F/A, Einheiten, Kolbendruck, Kolben-Versuch, Trainer, Quiz |
| Klasse 8 · Physik | Hydraulische Anlagen | Kraftübersetzung, Wege, Goldene Regel, Hebebühne, Trainer, Quiz |
| Klasse 8 · Physik | Schweredruck | p = ρ·g·h, hydrostatisches Paradoxon, Tauchbecken, Trainer, Quiz |
| Klasse 8 · Physik | Auftrieb | Archimedes, Dichtevergleich, Versuch, Vorhersagen, Trainer, Quiz |
| Klasse 8 · Physik | Luftdruck | Versuche, Barometer, Höhenreise mit Siedetemperatur, Wetter, Trainer, Quiz |
| Klasse 11 · Biologie | Osmose | Grundlagen, Osmometer-Simulation, Zellen in Lösungen, Alltagsbeispiele, Quiz |
| Klasse 11 · Biologie | Natrium-Kalium-Pumpe | Pumpzyklus, Simulation von Gradienten und Membranpotential, Fallbeispiele, Quiz |
| Klasse 11 · Biologie | Symport und Antiport | Uni-, Sym-, Antiport, primär/sekundär aktiv, Transporter-Simulation, Trainer, Quiz |
| Klasse 11 · Biologie | Endocytose und Exocytose | Phagocytose, Pinocytose, rezeptorvermittelte Endocytose, Exocytose Schritt für Schritt, Trainer, Quiz |
| Klasse 11 · Mathematik | Ableiten | Sekante/Tangente, grafisches Ableiten, Regeln mit Trainer, Tangentengleichung, Quiz |
| Werkzeuge | ClassPad-Simulator | Übungsrechner nach dem Vorbild des CASIO fx-CP400 mit 16 Lektionen (unabhängiges Lernprojekt) |

Zu jedem Thema gibt es ein einseitiges Factsheet als PDF und ein zweiseitiges Übungsblatt (Seite 1 Aufgaben, Seite 2 Lösungen, gestuft nach ★☆☆ einfach, ★★☆ mittel, ★★★ schwer). Jede Seite hat Breadcrumbs und einen Hell/Dunkel-Schalter.

## Version

Unten auf jeder Seite steht die aktuelle Version mit Datum, z. B. „Version 1.0.0 · Stand 05.11.2026“. Sie wird beim Bauen aus dem obersten Eintrag in [`CHANGELOG.md`](CHANGELOG.md) gelesen. Für eine neue Version dort oben einen Eintrag `## [x.y.z] – JJJJ-MM-TT` ergänzen und `python3 src/build.py` ausführen. Neue Themen erhöhen die mittlere Zahl, Korrekturen die letzte.

## Aufbau

```
src/
  config.py            Themenliste: Klassenstufen, Fächer, Themen (Menüs und Breadcrumbs entstehen daraus)
  build.py             Generator
  apps/<thema>/        style.css, body.html, script.js einer App
  shared/              Bausteine für alle Seiten: Breadcrumbs, Hell/Dunkel-Schalter, Menü-Stil
                       learnkit.css/.js: Baukasten für neue Themen (Layout, Bereiche, Quiz, Trainer, Umformungs-Werkstatt)
  templates/           Jinja2-Vorlagen (App, Seitenhülle, Menüseiten)
  factsheets/          Factsheet-Inhalte (sources.py), Stylesheet, PDF-Renderer
  worksheets/          Übungsblätter: Aufgabenvorräte (tasks.py), Generator (sources.py), Stylesheet
vendor/                Algebrite (Rechenkern des ClassPad-Simulators, MIT-Lizenz)
docs/                  ERZEUGT: Website für GitHub Pages
artifacts/             ERZEUGT: Einzeldateien je App für Claude-Artefakte
```

Dateien in `docs/` und `artifacts/` nicht von Hand ändern, sie werden beim Build überschrieben.

## Bauen

```bash
pip install -r requirements.txt     # einmalig: Jinja2
python3 src/build.py                # docs/ und artifacts/ erzeugen
python3 src/build.py --pdf          # zusätzlich Factsheet-PDFs (braucht Node.js + Playwright)
```

Danach `docs/` committen und pushen; GitHub Pages veröffentlicht automatisch (Quelle: Standard-Branch, Ordner `/docs`).

## Neues Thema hinzufügen

1. Ordner `src/apps/<thema>/` mit `style.css`, `body.html` (Tabs und Bereiche) und `script.js` anlegen. Am einfachsten mit dem LearnKit-Baukasten: Vorlage ist eine der Klasse-8-Apps (z. B. `src/apps/druck/`), in `config.py` dann `"kit": True` und eine Akzentfarbe setzen. `script.js` nutzt `LK.views`, `LK.trainer`, `LK.quiz` usw.
2. Eintrag in `TOPICS` in `src/config.py` ergänzen (Klassenstufe, Fach, Titel, Einleitung, Kartentext, erster Bereich).
3. Factsheet in `src/factsheets/sources.py` ergänzen, Aufgabenvorrat in `src/worksheets/tasks.py` (Eintrag in `TOPICS`). Die Blätter starten mit einem großen Vorrat; beim Erzeugen der PDF werden so viele Aufgaben entfernt, bis Aufgaben- und Lösungsseite je auf eine A4-Seite passen.
4. `python3 src/build.py --pdf` ausführen. Menüseite, Breadcrumbs, Factsheet-Link und Hell/Dunkel-Schalter entstehen automatisch.

Eine neue Klassenstufe oder ein neues Fach wird in `GRADES` bzw. `SUBJECTS` in `src/config.py` eingetragen.

## Offene Punkte

Siehe [TODO.md](TODO.md).

## Technische Hinweise

- Die Links in `artifacts/` zeigen auf GitHub Pages (absolut), damit sie auch in Claude-Artefakten funktionieren; in `docs/` sind sie relativ und funktionieren auch offline.
- Der Hell/Dunkel-Schalter speichert die Wahl im Browser (`learningdesk.theme`) und gilt für alle Seiten.
- Der ClassPad-Simulator ist nicht mit CASIO verbunden. CASIO und ClassPad sind Marken der CASIO Computer Co., Ltd.
