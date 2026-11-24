"""ClassPad (fx-CP400) hints shown in the first view of each app.

Each entry: (lesson id in the simulator or None, [(what, input, result), ...]).
Inputs use ClassPad syntax as typed in the Main application.
"""

A = "Aktion ▸ Umformungen ▸ "
S = "Aktion ▸ Gleichung/Ungleichung ▸ solve"
G = "App „Grafik & Tabelle“: "

TIPS = {
    # --- Mathematik Klasse 8 ---
    "termstruktur": ("start", [
        ("Termwert berechnen: Term eingeben, mit „|“ (Keyboard ▸ Math) den Wert einsetzen", "3x^2-2x+1|x=2", "9"),
        ("Rechenreihenfolge prüfen: einfach den Zahlenterm eingeben", "(4+2)·3^2", "54"),
    ]),
    "terme-vereinfachen": ("terme", [
        ("Zusammenfassen: " + A + "simplify", "simplify(3x+4y-x+2y)", "2x+6y"),
        ("Kontrolle: Ist mein Ergebnis gleich? Beide Terme abziehen", "simplify((3x+4y-x+2y)-(2x+6y))", "0 ⇒ richtig"),
    ]),
    "ausmultiplizieren-faktorisieren": ("terme", [
        ("Ausmultiplizieren: " + A + "expand", "expand(3x(2x-5))", "6x^2-15x"),
        ("Ausklammern: " + A + "factor", "factor(12a^2+8a)", "4a(3a+2)"),
    ]),
    "binomische-formeln": ("terme", [
        ("Binom auflösen: " + A + "expand", "expand((x+3)^2)", "x^2+6x+9"),
        ("3. Formel", "expand((2a-5)(2a+5))", "4a^2-25"),
    ]),
    "binomische-faktorisieren": ("terme", [
        ("In Faktoren zerlegen: " + A + "factor", "factor(x^2+6x+9)", "(x+3)^2"),
        ("3. Formel rückwärts", "factor(x^2-25)", "(x+5)(x-5)"),
        ("Probe: dein Ergebnis wieder ausmultiplizieren", "expand((x+3)^2)", "x^2+6x+9"),
    ]),
    "bruchterme": ("brueche", [
        ("Bruchterm kürzen/vereinfachen: Bruch-Vorlage (Keyboard ▸ Math), dann " + A + "simplify", "simplify((x^2-4)/(x+2))", "x-2"),
        ("Wert einsetzen", "(2x+1)/(x-3)|x=5", "11/2"),
        ("Definitionslücke finden: Nenner = 0 lösen", "solve(x-3=0,x)", "x=3"),
    ]),
    "gleichungen": ("solve", [
        ("Gleichung lösen: " + S, "solve(3x+5=2x-7,x)", "x=-12"),
        ("Probe: Lösung einsetzen", "3x+5|x=-12", "-31 (rechte Seite ebenso)"),
    ]),
    "ungleichungen": ("solve", [
        ("Ungleichung lösen: " + S + " (Zeichen < > über Keyboard ▸ Math)", "solve(2x-3<7,x)", "x<5"),
    ]),
    "zufallsexperimente": ("brueche", [
        ("Relative Häufigkeit als Bruch und Dezimalzahl (Standard/Dezimal umschalten)", "37/50", "0.74"),
    ]),
    "laplace": ("brueche", [
        ("Wahrscheinlichkeit als gekürzter Bruch", "4/52", "1/13"),
        ("In Prozent", "4/52·100", "7.69…"),
    ]),
    "baumdiagramme": ("brueche", [
        ("Pfadregel: entlang des Pfades multiplizieren", "3/5·2/4", "3/10"),
        ("Summenregel: Pfade addieren", "3/5·2/4+2/5·3/4", "3/5"),
    ]),
    "unabhaengige-ereignisse": ("brueche", [
        ("Unabhängigkeit prüfen: P(A)·P(B) mit P(A∩B) vergleichen", "1/2·1/3", "1/6"),
    ]),
    "funktionsbegriff": ("tabelle", [
        (G + "Funktion bei y1 eingeben, dann Wertetabelle anzeigen", "y1: 2x+1", "Tabelle mit x und y1"),
        ("Funktionswert in Main", "2x+1|x=4", "9"),
    ]),
    "eigenschaften-funktionen": ("nullstellen", [
        (G + "zeichnen, dann Analyse ▸ Grafische Lösung ▸ Nullstelle", "y1: 0.5x-2", "x=4"),
        ("Nullstelle in Main", "solve(0.5x-2=0,x)", "x=4"),
    ]),
    "lineare-funktionen": ("graph", [
        (G + "Gerade zeichnen und mit der Zeichnung vergleichen", "y1: -2x+3", "fallende Gerade durch (0|3)"),
        ("Steigung aus zwei Punkten", "(7-1)/(4-1)", "2"),
    ]),
    "funktionsgleichungen": ("solve", [
        ("Gerade durch zwei Punkte: m und n gleichzeitig lösen", "solve({1=m·1+n,7=m·4+n},{m,n})", "m=2, n=-1"),
    ]),
    "lgs-grafisch": ("schnitt", [
        (G + "beide Gleichungen nach y umformen, zeichnen, dann Analyse ▸ Grafische Lösung ▸ Schnittpunkt", "y1: x+1, y2: -x+5", "(2|3)"),
    ]),
    "gleichsetzungsverfahren": ("solve", [
        ("Ergebnis prüfen: Gleichungssystem mit solve (geschweifte Klammer über Keyboard ▸ Math)", "solve({y=2x-1,y=-x+5},{x,y})", "x=2, y=3"),
    ]),
    "additionsverfahren": ("solve", [
        ("Ergebnis prüfen", "solve({2x+3y=12,4x-3y=6},{x,y})", "x=3, y=2"),
    ]),
    "lgs-anwendungen": ("solve", [
        ("Textaufgabe als Gleichungssystem lösen", "solve({x+y=20,2x+4y=56},{x,y})", "x=12, y=8"),
    ]),
    "zentrische-streckung": ("start", [
        ("Streckfaktor aus Bild- und Originalstrecke", "7.5/3", "2.5"),
    ]),
    "aehnliche-dreiecke": ("solve", [
        ("Fehlende Seite über Verhältnisgleichung", "solve(x/6=4/3,x)", "x=8"),
    ]),
    "flaeche-volumen-aehnlich": ("potenzen", [
        ("Fläche wächst mit k², Volumen mit k³", "12·3^2", "108"),
        ("k aus dem Flächenverhältnis", "√(50/8)", "5/2"),
    ]),
    "strahlensaetze": ("solve", [
        ("Strahlensatz als Gleichung lösen", "solve(x/4=9/3,x)", "x=12"),
    ]),
    # --- Mathematik Klasse 11 ---
    "ableiten": ("ableiten", [
        ("Ableitung: Keyboard ▸ Math ▸ diff", "diff(x^3-2x,x)", "3x^2-2"),
        ("Steigung an einer Stelle", "diff(x^3-2x,x)|x=2", "10"),
    ]),
    # --- Physik Klasse 8 ---
    "druck": ("start", [
        ("p = F/A mit Einheiten in N und m²", "600/0.03", "20000 (Pa)"),
        ("Formel nach A umstellen lassen", "solve(p=F/A,A)", "A=F/p"),
    ]),
    "hydraulik": ("solve", [
        ("F₁/A₁ = F₂/A₂ nach F₂ lösen", "solve(200/5=F/100,F)", "F=4000"),
    ]),
    "schweredruck": ("start", [
        ("p = ρ·g·h", "1000·9.81·12", "117720 (Pa)"),
        ("Tiefe gesucht", "solve(200000=1000·9.81·h,h)", "h≈20.4"),
    ]),
    "auftrieb": ("start", [
        ("F_A = ρ_Fl·g·V", "1000·9.81·0.002", "19.62 (N)"),
    ]),
    "luftdruck": ("start", [
        ("Kraft der Luft auf eine Fläche: F = p·A", "101300·0.5", "50650 (N)"),
    ]),
    # --- Physik Klasse 11 ---
    "elektrisches-feld": ("potenzen", [
        ("Homogenes Feld E = U/d (d in m)", "1000/0.02", "50000 (V/m)"),
        ("Coulomb-Kraft, Zehnerpotenzen mit der EXP-Taste", "8.99E9·5E-9·20E-9/0.1^2", "8.99E-5 (N)"),
        ("Elektron nach U = 500 V", "√(2·1.602E-19·500/9.109E-31)", "1.33E7 (m/s)"),
    ]),
    "kondensator": ("potenzen", [
        ("Plattenkondensator C = ε₀·εr·A/d", "8.854E-12·3·0.01/0.001", "2.66E-10 (F)"),
        ("Energie W = ½·C·U²", "0.5·470E-6·12^2", "0.03384 (J)"),
        ("Laden: Spannung nach t = 2τ", "10(1-e^(-2))", "8.65 (V)"),
    ]),
    # --- Chemie Klasse 11 ---
    "reaktionsgeschwindigkeit": ("start", [
        ("Mittlere Geschwindigkeit v = Δc/Δt", "(0.8-0.5)/30", "0.01 (mol/(L·s))"),
    ]),
    "massenwirkungsgesetz": ("solve", [
        ("Kc ausrechnen", "0.4^2/(0.1·0.2)", "8"),
        ("Gleichgewicht mit x berechnen", "solve(x^2/((1-x)(1-x))=4,x)", "x=2/3 (sinnvolle Lösung)"),
    ]),
    "loeslichkeitsgleichgewichte": ("potenzen", [
        ("Löslichkeit aus KL (Salz AB)", "√(1.8E-10)", "1.34E-5 (mol/L), E über die EXP-Taste"),
    ]),
    "ph-wert": ("potenzen", [
        ("pH = −lg c(H₃O⁺), lg über Keyboard ▸ Math (log)", "-log(0.001)", "3"),
        ("Rückwärts: c = 10^(−pH)", "10^(-4.5)", "3.16E-5"),
    ]),
    "saeurestaerke": ("potenzen", [
        ("pKs aus Ks", "-log(1.8E-5)", "4.74"),
        ("pH schwacher Säure ≈ ½(pKs − lg c)", "0.5(4.74-log(0.1))", "2.87"),
    ]),
    "titration": ("solve", [
        ("Konzentration aus dem Äquivalenzpunkt: c₁·V₁ = c₂·V₂", "solve(c·20=0.1·12.5,c)", "c=0.0625"),
    ]),
    "puffersysteme": ("potenzen", [
        ("Henderson-Hasselbalch", "4.76+log(0.2/0.1)", "5.06"),
    ]),
}
