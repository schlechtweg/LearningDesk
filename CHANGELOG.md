# Änderungen

Die Versionsnummer steht unten auf der Startseite. Sie wird beim Bauen aus dem obersten Eintrag dieser Datei gelesen.

Schema **MAJOR.MINOR.PATCH**:
- **MINOR** (1.**1**.0): neue Themen oder neue Funktionen.
- **PATCH** (1.0.**1**): Korrekturen an Texten, Aufgaben oder Darstellung.
- **MAJOR** (**2**.0.0): grundlegender Umbau.

Neue Version: oben einen Eintrag `## [x.y.z] – JJJJ-MM-TT` ergänzen und `python3 src/build.py` ausführen.

## [1.9.0] – 2026-11-06

- Mathematik Klasse 8, Kapitel IV „Lineare Gleichungssysteme“ komplett:
  - Gleichungen mit zwei Variablen und LGS (grafisch lösen, Anzahl der Lösungen)
  - Gleichsetzungs- und Einsetzungsverfahren (Rechenweg Schritt für Schritt)
  - Additionsverfahren (Faktoren finden, welches Verfahren wann)
  - Anwendungen (Textaufgaben, passendes Gleichungssystem wählen)
- Zu jedem Thema Factsheet und sechsseitiges Übungs-PDF mit Grafik-Aufgabe.

## [1.8.0] – 2026-11-06
- Kapitel III Funktionen (Klasse 8): Funktionsbegriff und Darstellungen, Eigenschaften von Funktionen, Lineare Funktionen, Funktionsgleichungen bestimmen; jeweils mit App, Factsheet und Übungs-PDF.
- Lange Überschriften brechen auf dem Handy um.

## [1.7.0] – 2026-11-06
- Kapitel II Zufallsversuche (Klasse 8): Zufallsexperimente und Häufigkeiten, Laplace-Experimente und Anzahlen, Baumdiagramme und Pfadregeln, Unabhängige Ereignisse; jeweils mit App, Factsheet und Übungs-PDF.

## [1.6.0] – 2026-11-06
- Klasse 8 Mathematik ist nach den Kapiteln des Schulbuchs gegliedert (I Terme und Gleichungen bis V Ähnlichkeit).
- Neues Thema I.1 Termstruktur und Termwerte (Rechenbaum zum Ausprobieren, Trainer, Quiz, Factsheet, Übungs-PDF).

## [1.5.0] – 2026-11-06
- Übungsaufgaben wieder in **einem PDF pro Thema** (6 Seiten): Seite 1 leicht, Seite 2 mittel, Seite 3 schwer, Seite 4 bis 6 die Lösungen dazu. Die Einzelblätter pro Stufe entfallen.
- Jede Aufgabenseite ist gefüllt: größere Aufgabenvorräte für Mathe und Physik, über 200 neue Aufgaben für Biologie und schwere Physikaufgaben (`src/worksheets/extra_tasks.py`).

## [1.4.0] – 2026-11-05
- Zu jedem Thema gibt es zusätzlich drei Übungsblätter mit nur einer Schwierigkeitsstufe (leicht, mittel, schwer). Sie haben Schreiblinien unter jeder Aufgabe und füllen die A4-Seite automatisch. Seite 2 enthält die Lösungen. Download-Knöpfe auf jeder Themenseite.

## [1.3.1] – 2026-11-05
- Die Versionsnummer wird nur noch auf der Startseite angezeigt.

## [1.3.0] – 2026-11-05
- Jedes Übungsblatt enthält jetzt eine Grafik-Aufgabe: beschriften (z. B. Auge, Nervenzelle, Pflanzenzelle, Hebebühne), einzeichnen (Ableitungsgraph, Lösungsmengen, Kraftpfeile, Wasserstrahlen) oder ausfüllen (Flächenmodelle, Waage). Die Lösungsseite zeigt die fertige Grafik.

## [1.2.0] – 2026-11-05
- Neues Thema Klasse 8 Biologie: Das Nervensystem (Nervenzelle und Gehirn zum Antippen, Signalweg und Reflexbogen, Reaktionstest, Trainer, Quiz, Factsheet, Übungsblatt).
- Das Auge: neuer Abschnitt Fernsicht und Nahsicht mit Fachbegriffen (Akkommodation, Zonulafasern, Eigenelastizität, Brechkraft, Dioptrie, Nahpunkt, Fernpunkt); Simulation zeigt Nah-/Fernakkommodation, Nahpunkt und Fernpunkt; neuer Trainer-Modus.

## [1.1.0] – 2026-11-05
- Neues Thema Klasse 8 Biologie: Das Auge (Aufbau zum Antippen, Scharf sehen mit Brillen-Simulation, Trainer, Quiz, Factsheet, Übungsblatt).

## [1.0.0] – 2026-11-05
- Versionsnummer und Datum werden schlicht unten auf jeder Seite angezeigt.
- Diese Änderungsliste eingeführt; frühere Stände sind unten nachgetragen.

## [0.12.0] – 2026-11-05
- Neue Themen Klasse 11 Biologie: Symport und Antiport, Endocytose und Exocytose.

## [0.11.0] – 2026-11-05
- Alltagsbeispiele für alle Themen, jeweils im eigenen Menüpunkt „Im Alltag“ vor dem Quiz.

## [0.10.0] – 2026-11-05
- Zweiseitige Übungsblätter als PDF (Aufgaben und Lösungen, drei Schwierigkeitsstufen).

## [0.9.0] – 2026-11-05
- Neun neue Themen Klasse 8: vier in Mathematik, fünf in Physik.

## [0.8.0] – 2026-11-05
- Umbau zu einem Python-Seitengenerator (`src/build.py`).

## [0.7.0] – 2026-11-05
- Hell/Dunkel-Schalter und verlinkte Breadcrumbs auf allen Seiten.

## [0.6.0] – 2026-11-05
- ClassPad-Simulator mit Lektionen und Spickzettel als PDF.

## [0.5.0] – 2026-11-04
- Einseitige Factsheets als PDF für alle Themen.

## [0.4.0] – 2026-11-04
- Menüs für Klassenstufe 8 und 11, Themen Binomische Formeln und Bruchterme. Einfachere Erklärungen.

## [0.3.0] – 2026-11-04
- Thema Natrium-Kalium-Pumpe.

## [0.2.0] – 2026-11-04
- Thema Ableiten und Startseite.

## [0.1.0] – 2026-11-04
- Erste Lern-App: Osmose.
