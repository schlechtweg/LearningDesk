# LearningDesk

Interaktive Lern-Apps für die Schule, sortiert nach Klassenstufe. Alles läuft im Browser und wird über GitHub Pages veröffentlicht: **https://schlechtweg.github.io/LearningDesk/**

## Inhalte

| Bereich | Thema | Inhalt |
|---|---|---|
| Klasse 8 · Mathematik | Binomische Formeln | Formeln, Flächenmodell, Trainer (Lücken, ausmultiplizieren, faktorisieren), Kopfrechen-Trick, Quiz |
| Klasse 8 · Mathematik | Bruchterme | Definitionsmenge, Kürzen und Erweitern, Rechenregeln, Trainer, Quiz |
| Klasse 11 · Biologie | Osmose | Grundlagen, Osmometer-Simulation, Zellen in Lösungen, Alltagsbeispiele, Quiz |
| Klasse 11 · Biologie | Natrium-Kalium-Pumpe | Pumpzyklus, Simulation von Gradienten und Membranpotential, Fallbeispiele, Quiz |
| Klasse 11 · Mathematik | Ableiten | Sekante/Tangente, grafisches Ableiten, Regeln mit Trainer, Tangentengleichung, Quiz |
| Werkzeuge | ClassPad-Simulator | Übungsrechner nach dem Vorbild des CASIO fx-CP400 mit 16 Lektionen (unabhängiges Lernprojekt) |

Zu jedem Thema gibt es ein einseitiges Factsheet als PDF. Jede Seite hat Breadcrumbs und einen Hell/Dunkel-Schalter.

## Aufbau

```
src/
  config.py            Themenliste: Klassenstufen, Fächer, Themen (Menüs und Breadcrumbs entstehen daraus)
  build.py             Generator
  apps/<thema>/        style.css, body.html, script.js einer App
  shared/              Bausteine für alle Seiten: Breadcrumbs, Hell/Dunkel-Schalter, Menü-Stil
  templates/           Jinja2-Vorlagen (App, Seitenhülle, Menüseiten)
  factsheets/          Factsheet-Inhalte (sources.py), Stylesheet, PDF-Renderer
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

1. Ordner `src/apps/<thema>/` mit `style.css`, `body.html` (Tabs und Bereiche) und `script.js` anlegen. Vorlage: eine bestehende App kopieren.
2. Eintrag in `TOPICS` in `src/config.py` ergänzen (Klassenstufe, Fach, Titel, Einleitung, Kartentext, erster Bereich).
3. Factsheet in `src/factsheets/sources.py` ergänzen.
4. `python3 src/build.py --pdf` ausführen. Menüseite, Breadcrumbs, Factsheet-Link und Hell/Dunkel-Schalter entstehen automatisch.

Eine neue Klassenstufe oder ein neues Fach wird in `GRADES` bzw. `SUBJECTS` in `src/config.py` eingetragen.

## Technische Hinweise

- Die Links in `artifacts/` zeigen auf GitHub Pages (absolut), damit sie auch in Claude-Artefakten funktionieren; in `docs/` sind sie relativ und funktionieren auch offline.
- Der Hell/Dunkel-Schalter speichert die Wahl im Browser (`learningdesk.theme`) und gilt für alle Seiten.
- Der ClassPad-Simulator ist nicht mit CASIO verbunden. CASIO und ClassPad sind Marken der CASIO Computer Co., Ltd.
