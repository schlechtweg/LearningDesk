"""Central registry of the LearningDesk site.

Menus, breadcrumbs, factsheet links and the standalone pages are all generated
from this file. To add a topic: create src/apps/<slug>/ (style.css, body.html,
script.js), add an entry to TOPICS and run `python3 src/build.py`.
"""

SITE_NAME = "LearningDesk"
BASE_URL = "https://schlechtweg.github.io/LearningDesk/"
INDEX_INTRO = "Interaktive Lern-Apps zum Verstehen und Üben. Alles läuft direkt im Browser. Wähle deine Klassenstufe."

FONTS = {
    "base": "https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:ital,wght@0,400;0,700;1,400&family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,700;12..96,800&family=JetBrains+Mono:wght@400;600&display=swap",
    "math": "https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:ital,wght@0,400;0,700;1,400&family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,700;12..96,800&family=JetBrains+Mono:wght@400;600&family=STIX+Two+Text:ital,wght@0,400;0,600;1,400&display=swap",
}

# Grades in menu order. "color" is a CSS variable of the menu pages.
GRADES = [
    {"id": "8", "page": "klasse-8.html", "title": "Klassenstufe 8", "crumb": "Klasse 8", "color": "--g8"},
    {"id": "11", "page": "klasse-11.html", "title": "Klassenstufe 11", "crumb": "Klasse 11", "color": "--g11"},
]

# Subjects in menu order.
SUBJECTS = [
    {"id": "biologie", "title": "Biologie", "color": "--bio"},
    {"id": "mathematik", "title": "Mathematik", "color": "--math"},
    {"id": "physik", "title": "Physik", "color": "--phys"},
    {"id": "chemie", "title": "Chemie", "color": "--chem"},
]

# Accent colours of LearnKit apps: (light, dark, soft background)
ACCENT_MATH8 = ("#1f6e8c", "#5fb6d6", "rgba(31, 110, 140, 0.12)")
ACCENT_PHYS = ("#b4531f", "#f0995a", "rgba(180, 83, 31, 0.12)")
ACCENT_SYM = ("#2f7d5b", "#6cc79a", "rgba(47, 125, 91, 0.12)")
ACCENT_ENDO = ("#7a3f8f", "#c995de", "rgba(122, 63, 143, 0.12)")
ACCENT_BIO8 = ("#4a7a1e", "#9ccc65", "rgba(74, 122, 30, 0.12)")
ACCENT_CHEM = ("#6a3fa0", "#b79be0", "rgba(106, 63, 160, 0.12)")

# Chapters of a subject in a grade (book order). Topics name their chapter with "chapter".
CHAPTERS = {
    ("8", "mathematik"): [
        ("I", "Terme und Gleichungen"), ("II", "Zufallsversuche"), ("III", "Funktionen"),
        ("IV", "Lineare Gleichungssysteme"), ("V", "Ähnlichkeit"),
    ],
}

# Tools appear on the start page under "Werkzeuge" instead of a grade.
TOOLS_TITLE = "Werkzeuge"

TOPICS = [
    {
        "slug": "osmose", "grade": "11", "subject": "biologie",
        "title": "Osmose verstehen", "short": "Osmose", "tag": "Stofftransport",
        "card": "Grundlagen, Simulation, Zellen in Lösungen, Alltagsbeispiele, Quiz",
        "description": "Interaktive Lernhilfe zum Thema Osmose (Biologie, Klasse 11)",
        "intro": "Lies die Grundlagen, probiere die Simulation aus, beobachte Zellen in verschiedenen Lösungen, erkläre Alltagsbeispiele und teste dich am Ende im Quiz.",
        "fonts": "base", "first_view": "verstehen", "factsheet": "Factsheet als PDF ↓",
    },
    {
        "slug": "natrium-kalium-pumpe", "grade": "11", "subject": "biologie",
        "title": "Natrium-Kalium-Pumpe", "short": "Natrium-Kalium-Pumpe", "tag": "Stofftransport &amp; Nerven",
        "card": "Pumpzyklus Schritt für Schritt, Simulation, Fallbeispiele, Quiz",
        "description": "Interaktive Lernhilfe zur Natrium-Kalium-Pumpe (Biologie, Klasse 11)",
        "intro": "Wie eine winzige Pumpe in der Zellmembran geladene Teilchen hinein- und hinausbefördert und warum deine Nerven ohne sie nicht funktionieren würden.",
        "fonts": "base", "first_view": "grundlagen", "factsheet": "Factsheet als PDF ↓",
    },
    {
        "slug": "symport-antiport", "grade": "11", "subject": "biologie", "kit": True, "accent": ACCENT_SYM,
        "title": "Symport und Antiport", "short": "Symport und Antiport", "tag": "Stofftransport",
        "card": "Uniport, Symport, Antiport, primär und sekundär aktiv, Transporter-Simulation, Trainer, Quiz",
        "description": "Interaktive Lernhilfe zu Symport und Antiport (Biologie, Klasse 11)",
        "intro": "Wie Transportproteine zwei Stoffe gemeinsam oder im Tausch durch die Membran befördern und woher sie die Energie dafür nehmen.",
        "fonts": "base", "first_view": "verstehen", "factsheet": "Factsheet als PDF ↓",
    },
    {
        "slug": "endocytose-exocytose", "grade": "11", "subject": "biologie", "kit": True, "accent": ACCENT_ENDO,
        "title": "Endocytose und Exocytose", "short": "Endo- und Exocytose", "tag": "Stofftransport",
        "card": "Phagocytose, Pinocytose, rezeptorvermittelte Endocytose, Exocytose Schritt für Schritt, Trainer, Quiz",
        "description": "Interaktive Lernhilfe zu Endocytose und Exocytose (Biologie, Klasse 11)",
        "intro": "Wie Zellen große Teilchen in Membranbläschen aufnehmen und abgeben: vom Fressen eines Bakteriums bis zur Ausschüttung von Insulin.",
        "fonts": "base", "first_view": "verstehen", "factsheet": "Factsheet als PDF ↓",
    },
    {
        "slug": "ableiten", "grade": "11", "subject": "mathematik",
        "title": "Ableiten lernen", "short": "Ableiten", "tag": "Differentialrechnung",
        "card": "Sekante und Tangente, grafisches Ableiten, Ableitungsregeln mit Trainer, Tangentengleichung, Quiz",
        "description": "Interaktive Lernhilfe zum Ableiten: grafisches Ableiten, Ableitungsregeln, Tangentengleichung (Mathematik, Klasse 11)",
        "intro": "Von der Sekante zur Tangente, vom Graphen zum Ableitungsgraphen, von den Regeln zur Tangentengleichung. Mit Rechentrainer, der deine Lösungen prüft.",
        "fonts": "math", "first_view": "idee", "factsheet": "Factsheet als PDF ↓",
    },
    {
        "slug": "auge", "grade": "8", "subject": "biologie", "kit": True, "accent": ACCENT_BIO8,
        "title": "Das Auge", "short": "Das Auge", "tag": "Sinnesorgane",
        "card": "Aufbau zum Antippen, Weg des Lichts, Pupillenreflex, nah und fern sehen, Brillen-Simulation, Trainer, Quiz",
        "description": "Interaktive Lernhilfe zum menschlichen Auge (Biologie, Klasse 8)",
        "intro": "Wie das Auge aufgebaut ist, wie ein scharfes Bild entsteht und warum manche Menschen eine Brille brauchen.",
        "fonts": "base", "first_view": "verstehen", "factsheet": "Factsheet als PDF ↓",
    },
    {
        "slug": "nervensystem", "grade": "8", "subject": "biologie", "kit": True, "accent": ACCENT_BIO8,
        "title": "Das Nervensystem", "short": "Nervensystem", "tag": "Nervensystem",
        "card": "Nervenzelle und Gehirn zum Antippen, Signalweg und Reflexbogen, Reaktionstest, Trainer, Quiz",
        "description": "Interaktive Lernhilfe zum Nervensystem (Biologie, Klasse 8)",
        "intro": "Wie Reize zu Reaktionen werden: Nervenzellen, Gehirn und Rückenmark, Reflexe und ein Test, wie schnell du reagierst.",
        "fonts": "base", "first_view": "verstehen", "factsheet": "Factsheet als PDF ↓",
    },
    {
        "slug": "termstruktur", "grade": "8", "subject": "mathematik", "chapter": "I", "order": 1, "kit": True, "accent": ACCENT_MATH8,
        "title": "Termstruktur und Termwerte", "short": "Termstruktur", "tag": "Terme",
        "card": "Termarten, Rechenreihenfolge, Rechenbaum zum Ausprobieren, Termwerte und Wertetabellen, Terme aufstellen, Quiz",
        "description": "Interaktive Lernhilfe zu Termstruktur und Termwertberechnung (Mathematik, Klasse 8)",
        "intro": "Woran man erkennt, ob ein Term eine Summe, ein Produkt oder eine Potenz ist, und wie man Termwerte sicher berechnet.",
        "fonts": "math", "first_view": "verstehen", "factsheet": "Factsheet als PDF ↓",
    },
    {
        "slug": "zufallsexperimente", "grade": "8", "subject": "mathematik", "chapter": "II", "order": 1, "kit": True, "accent": ACCENT_MATH8,
        "title": "Zufallsexperimente und Häufigkeiten", "short": "Zufallsexperimente", "tag": "Wahrscheinlichkeit",
        "card": "Ergebnis, Ereignis, absolute und relative Häufigkeit, Gesetz der großen Zahlen, Simulation langer Versuchsreihen, Trainer, Quiz",
        "description": "Interaktive Lernhilfe zu Zufallsexperimenten und relativen Häufigkeiten (Mathematik, Klasse 8)",
        "intro": "Von der Versuchsreihe zur Wahrscheinlichkeit: Häufigkeiten bestimmen und beobachten, wie sich der Zufall bei vielen Versuchen beruhigt.",
        "fonts": "math", "first_view": "verstehen", "factsheet": "Factsheet als PDF ↓",
    },
    {
        "slug": "laplace", "grade": "8", "subject": "mathematik", "chapter": "II", "order": 2, "kit": True, "accent": ACCENT_MATH8,
        "title": "Laplace-Experimente und Anzahlen", "short": "Laplace", "tag": "Wahrscheinlichkeit",
        "card": "Laplace-Regel, Gegenereignis, Produktregel, Ereignis-Labor mit Würfeln, Urne und Karten, Möglichkeiten zählen, Trainer, Quiz",
        "description": "Interaktive Lernhilfe zu Laplace-Experimenten und Anzahlen (Mathematik, Klasse 8)",
        "intro": "Wenn alle Ergebnisse gleich wahrscheinlich sind, genügt Abzählen: günstige durch mögliche. Und mit der Produktregel zählst du Möglichkeiten blitzschnell.",
        "fonts": "math", "first_view": "verstehen", "factsheet": "Factsheet als PDF ↓",
    },
    {
        "slug": "baumdiagramme", "grade": "8", "subject": "mathematik", "chapter": "II", "order": 3, "kit": True, "accent": ACCENT_MATH8,
        "title": "Baumdiagramme und Pfadregeln", "short": "Baumdiagramme", "tag": "Wahrscheinlichkeit",
        "card": "Mehrstufige Zufallsexperimente, Pfadregeln, mit und ohne Zurücklegen, „mindestens einmal“, interaktiver Baum, Trainer, Quiz",
        "description": "Interaktive Lernhilfe zu Baumdiagrammen und Pfadregeln (Mathematik, Klasse 8)",
        "intro": "Mehrere Zufallsschritte nacheinander: Mit dem Baumdiagramm und zwei Pfadregeln behältst du den Überblick, auch beim Ziehen ohne Zurücklegen.",
        "fonts": "math", "first_view": "verstehen", "factsheet": "Factsheet als PDF ↓",
    },
    {
        "slug": "unabhaengige-ereignisse", "grade": "8", "subject": "mathematik", "chapter": "II", "order": 4, "kit": True, "accent": ACCENT_MATH8,
        "title": "Unabhängige Ereignisse", "short": "Unabhängige Ereignisse", "tag": "Wahrscheinlichkeit",
        "card": "Produktbedingung, Vierfeldertafel zum Ausfüllen und Prüfen, abhängig oder unabhängig, Trainer, Quiz",
        "description": "Interaktive Lernhilfe zu unabhängigen Ereignissen und Vierfeldertafeln (Mathematik, Klasse 8)",
        "intro": "Beeinflusst ein Ereignis das andere? Mit der Produktbedingung und der Vierfeldertafel findest du es heraus.",
        "fonts": "math", "first_view": "verstehen", "factsheet": "Factsheet als PDF ↓",
    },
    {
        "slug": "funktionsbegriff", "grade": "8", "subject": "mathematik", "chapter": "III", "order": 1, "kit": True, "accent": ACCENT_MATH8,
        "title": "Funktionsbegriff und Darstellungen", "short": "Funktionsbegriff", "tag": "Funktionen",
        "card": "Zuordnung und Funktion, Schreibweisen, Wertetabelle und Graph synchron, Funktion oder nicht?, Trainer, Quiz",
        "description": "Interaktive Lernhilfe zum Funktionsbegriff und den Darstellungen von Funktionen (Mathematik, Klasse 8)",
        "intro": "Was eine Funktion ist, wie man sie als Wortvorschrift, Gleichung, Tabelle und Graph darstellt und wie man erkennt, ob eine Zuordnung eine Funktion ist.",
        "fonts": "math", "first_view": "verstehen", "factsheet": "Factsheet als PDF ↓",
    },
    {
        "slug": "eigenschaften-funktionen", "grade": "8", "subject": "mathematik", "chapter": "III", "order": 2, "kit": True, "accent": ACCENT_MATH8,
        "title": "Eigenschaften von Funktionen", "short": "Eigenschaften", "tag": "Funktionen",
        "card": "Nullstellen, Schnittpunkt mit der y-Achse, steigend und fallend, Hoch- und Tiefpunkte, Symmetrie, interaktiver Graph, Trainer, Quiz",
        "description": "Interaktive Lernhilfe zu Eigenschaften von Funktionen (Mathematik, Klasse 8)",
        "intro": "Was man am Graphen ablesen kann: Achsenschnittpunkte, Steigen und Fallen, höchste und tiefste Punkte und Symmetrie.",
        "fonts": "math", "first_view": "verstehen", "factsheet": "Factsheet als PDF ↓",
    },
    {
        "slug": "lineare-funktionen", "grade": "8", "subject": "mathematik", "chapter": "III", "order": 3, "kit": True, "accent": ACCENT_MATH8,
        "title": "Lineare Funktionen", "short": "Lineare Funktionen", "tag": "Funktionen",
        "card": "f(x) = mx + b, Steigung und Steigungsdreieck, y-Achsenabschnitt, Nullstelle, parallele Geraden, Schnittpunkte, Geraden-Labor, Trainer, Quiz",
        "description": "Interaktive Lernhilfe zu linearen Funktionen (Mathematik, Klasse 8)",
        "intro": "Geraden verstehen: Was Steigung und Achsenabschnitt bedeuten, wie man Nullstellen und Schnittpunkte berechnet und wann Geraden parallel sind.",
        "fonts": "math", "first_view": "verstehen", "factsheet": "Factsheet als PDF ↓",
    },
    {
        "slug": "funktionsgleichungen", "grade": "8", "subject": "mathematik", "chapter": "III", "order": 4, "kit": True, "accent": ACCENT_MATH8,
        "title": "Funktionsgleichungen bestimmen", "short": "Funktionsgleichungen", "tag": "Funktionen",
        "card": "Gleichung aus Steigung und Punkt, aus zwei Punkten, aus dem Graphen und aus Texten, Punkte setzen mit Rechenweg, Trainer, Quiz",
        "description": "Interaktive Lernhilfe zum Bestimmen von Funktionsgleichungen linearer Funktionen (Mathematik, Klasse 8)",
        "intro": "Aus zwei Punkten, einer Steigung oder einem Text die Gleichung einer Geraden aufstellen, Schritt für Schritt mit Probe.",
        "fonts": "math", "first_view": "verstehen", "factsheet": "Factsheet als PDF ↓",
    },
    {
        "slug": "lgs-grafisch", "grade": "8", "subject": "mathematik", "chapter": "IV", "order": 1, "kit": True, "accent": ACCENT_MATH8,
        "title": "Gleichungen mit zwei Variablen und LGS", "short": "LGS grafisch", "tag": "Gleichungssysteme",
        "card": "Lösungen als Zahlenpaare, Gleichungen als Geraden, LGS grafisch lösen, eine, keine oder unendlich viele Lösungen, Trainer, Quiz",
        "description": "Interaktive Lernhilfe zu linearen Gleichungen mit zwei Variablen und linearen Gleichungssystemen (Mathematik, Klasse 8)",
        "intro": "Zwei Unbekannte, zwei Bedingungen: Wie Gleichungen mit zwei Variablen zu Geraden werden und wo sich die Lösung eines Gleichungssystems versteckt.",
        "fonts": "math", "first_view": "verstehen", "factsheet": "Factsheet als PDF ↓",
    },
    {
        "slug": "gleichsetzungsverfahren", "grade": "8", "subject": "mathematik", "chapter": "IV", "order": 2, "kit": True, "accent": ACCENT_MATH8,
        "title": "Gleichsetzungs- und Einsetzungsverfahren", "short": "Gleichsetzen und Einsetzen", "tag": "Gleichungssysteme",
        "card": "Gleichsetzen, Einsetzen, Sonderfälle ohne oder mit unendlich vielen Lösungen, Rechenweg Schritt für Schritt, Trainer, Quiz",
        "description": "Interaktive Lernhilfe zum Gleichsetzungs- und Einsetzungsverfahren (Mathematik, Klasse 8)",
        "intro": "Zwei rechnerische Verfahren, um lineare Gleichungssysteme exakt zu lösen, mit Rechenweg zum Mitdenken und Trainer.",
        "fonts": "math", "first_view": "verstehen", "factsheet": "Factsheet als PDF ↓",
    },
    {
        "slug": "additionsverfahren", "grade": "8", "subject": "mathematik", "chapter": "IV", "order": 3, "kit": True, "accent": ACCENT_MATH8,
        "title": "Additionsverfahren", "short": "Additionsverfahren", "tag": "Gleichungssysteme",
        "card": "Gleichungen geschickt multiplizieren und addieren, Rechenweg Schritt für Schritt, welches Verfahren wann, Trainer, Quiz",
        "description": "Interaktive Lernhilfe zum Additionsverfahren für lineare Gleichungssysteme (Mathematik, Klasse 8)",
        "intro": "Lineare Gleichungssysteme lösen, indem eine Variable durch geschicktes Addieren wegfällt, mit Rechenweg und Trainer.",
        "fonts": "math", "first_view": "verstehen", "factsheet": "Factsheet als PDF ↓",
    },
    {
        "slug": "lgs-anwendungen", "grade": "8", "subject": "mathematik", "chapter": "IV", "order": 4, "kit": True, "accent": ACCENT_MATH8,
        "title": "Anwendungen linearer Gleichungssysteme", "short": "LGS anwenden", "tag": "Gleichungssysteme",
        "card": "Textaufgaben in fünf Schritten, passendes Gleichungssystem wählen, Preise, Anzahlen, Alter, Geometrie, Trainer, Quiz",
        "description": "Interaktive Lernhilfe zu Textaufgaben mit linearen Gleichungssystemen (Mathematik, Klasse 8)",
        "intro": "Aus Texten Gleichungssysteme aufstellen, lösen und am Text prüfen.",
        "fonts": "math", "first_view": "verstehen", "factsheet": "Factsheet als PDF ↓",
    },
    {
        "slug": "zentrische-streckung", "grade": "8", "subject": "mathematik", "chapter": "V", "order": 1, "kit": True, "accent": ACCENT_MATH8,
        "title": "Ähnliche Figuren und zentrische Streckung", "short": "Zentrische Streckung", "tag": "Ähnlichkeit",
        "card": "Ähnlichkeit, Streckzentrum und Streckfaktor, Streckung zum Ziehen, negative Faktoren, Trainer, Quiz",
        "description": "Interaktive Lernhilfe zu ähnlichen Figuren und zur zentrischen Streckung (Mathematik, Klasse 8)",
        "intro": "Was ähnliche Figuren gemeinsam haben und wie die zentrische Streckung vergrößert und verkleinert.",
        "fonts": "math", "first_view": "verstehen", "factsheet": "Factsheet als PDF ↓",
    },
    {
        "slug": "aehnliche-dreiecke", "grade": "8", "subject": "mathematik", "chapter": "V", "order": 2, "kit": True, "accent": ACCENT_MATH8,
        "title": "Ähnliche Dreiecke", "short": "Ähnliche Dreiecke", "tag": "Ähnlichkeit",
        "card": "Ähnlichkeitssätze WW, SSS, SWS, fehlende Seiten, Höhen über Schatten, Prüfen, Trainer, Quiz",
        "description": "Interaktive Lernhilfe zu ähnlichen Dreiecken und den Ähnlichkeitssätzen (Mathematik, Klasse 8)",
        "intro": "Wann Dreiecke ähnlich sind und wie man damit unbekannte Längen berechnet.",
        "fonts": "math", "first_view": "verstehen", "factsheet": "Factsheet als PDF ↓",
    },
    {
        "slug": "flaeche-volumen-aehnlich", "grade": "8", "subject": "mathematik", "chapter": "V", "order": 3, "kit": True, "accent": ACCENT_MATH8,
        "title": "Flächen und Volumen ähnlicher Figuren", "short": "Flächen und Volumen", "tag": "Ähnlichkeit",
        "card": "Längen mit k, Flächen mit k², Volumen mit k³, Quadrate und Würfel zählen, Maßstäbe, Trainer, Quiz",
        "description": "Interaktive Lernhilfe zu Flächeninhalt und Volumen ähnlicher Figuren und Körper (Mathematik, Klasse 8)",
        "intro": "Wie sich Flächen und Volumen ändern, wenn man Figuren und Körper vergrößert oder verkleinert.",
        "fonts": "math", "first_view": "verstehen", "factsheet": "Factsheet als PDF ↓",
    },
    {
        "slug": "strahlensaetze", "grade": "8", "subject": "mathematik", "chapter": "V", "order": 4, "kit": True, "accent": ACCENT_MATH8,
        "title": "Strahlensätze", "short": "Strahlensätze", "tag": "Ähnlichkeit",
        "card": "1. und 2. Strahlensatz, V-Figur und X-Figur zum Verschieben, Flussbreite und Lochkamera, Trainer, Quiz",
        "description": "Interaktive Lernhilfe zu den Strahlensätzen (Mathematik, Klasse 8)",
        "intro": "Mit parallelen Geraden unerreichbare Längen berechnen: die beiden Strahlensätze in V- und X-Figur.",
        "fonts": "math", "first_view": "verstehen", "factsheet": "Factsheet als PDF ↓",
    },
    {
        "slug": "atombau", "grade": "11", "subject": "chemie", "kit": True, "accent": ACCENT_CHEM, "prelude": ["chemdata.js"],
        "title": "Atombau und Schalenmodell", "short": "Atombau", "tag": "Atome",
        "card": "Protonen, Neutronen, Elektronen, Isotope und Ionen, Atom-Baukasten, Schalenmodell nach Bohr, Lewis-Schreibweise, Trainer, Quiz",
        "description": "Interaktive Lernhilfe zum Atombau und zum Schalenmodell nach Bohr (Chemie, Klasse 11)",
        "intro": "Woraus Atome bestehen, wie sich Isotope und Ionen unterscheiden und wie die Elektronen nach Bohr auf Schalen verteilt sind.",
        "fonts": "base", "first_view": "verstehen", "factsheet": "Factsheet als PDF ↓",
    },
    {
        "slug": "periodensystem", "grade": "11", "subject": "chemie", "kit": True, "accent": ACCENT_CHEM, "prelude": ["chemdata.js"],
        "title": "Periodensystem, Atombau und Eigenschaften", "short": "Periodensystem", "tag": "PSE",
        "card": "Perioden und Hauptgruppen aus dem Atombau, interaktives Periodensystem, Trends bei Atomradius, Elektronegativität und Ionisierungsenergie, Trainer, Quiz",
        "description": "Interaktive Lernhilfe zum Zusammenhang von Periodensystem, Atombau und Eigenschaften (Chemie, Klasse 11)",
        "intro": "Warum die Stellung im Periodensystem den Atombau verrät und sich daraus Eigenschaften wie Atomradius und Elektronegativität vorhersagen lassen.",
        "fonts": "base", "first_view": "verstehen", "factsheet": "Factsheet als PDF ↓",
    },
    {
        "slug": "stoffklassen", "grade": "11", "subject": "chemie", "kit": True, "accent": ACCENT_CHEM, "prelude": ["chemdata.js"],
        "title": "Stoffklassen", "short": "Stoffklassen", "tag": "Stoffklassen",
        "card": "Metalle, Ionensubstanzen und ihr Lösen in Wasser, Molekülsubstanzen, zwischenmolekulare Wechselwirkungen, Struktur-Eigenschafts-Beziehungen, Simulationen, Trainer, Quiz",
        "description": "Interaktive Lernhilfe zu Metallen, Ionen- und Molekülsubstanzen und ihren Eigenschaften (Chemie, Klasse 11)",
        "intro": "Wie Teilchen und Bindungen die Eigenschaften von Metallen, Salzen und Molekülsubstanzen bestimmen.",
        "fonts": "base", "first_view": "ueberblick", "factsheet": "Factsheet als PDF ↓",
    },
    {
        "slug": "binomische-formeln", "grade": "8", "subject": "mathematik", "chapter": "I", "order": 4,
        "title": "Binomische Formeln", "short": "Binomische Formeln", "tag": "Terme",
        "card": "Die drei Formeln, Erklärung mit Flächen, Trainer mit Lückenaufgaben, Kopfrechen-Trick, Quiz",
        "description": "Interaktive Lernhilfe zu den binomischen Formeln (Mathematik, Klasse 8)",
        "intro": "Drei Formeln, mit denen du Klammern blitzschnell auflösen kannst. Hier lernst du, wie sie aussehen, warum sie stimmen und wie du sie anwendest.",
        "fonts": "math", "first_view": "formeln", "factsheet": "Factsheet als PDF ↓",
    },
    {
        "slug": "bruchterme", "grade": "8", "subject": "mathematik", "chapter": "I", "order": 5,
        "title": "Bruchterme", "short": "Bruchterme", "tag": "Terme",
        "card": "Definitionsmenge, Kürzen und Erweitern, Rechnen mit Bruchtermen, Trainer mit Lösungsweg, Quiz",
        "description": "Interaktive Lernhilfe zu Bruchtermen (Mathematik, Klasse 8)",
        "intro": "Brüche mit Variablen: Was ist erlaubt, wie kürzt man, und wie rechnet man damit? Mit Trainer, der deine Antworten prüft.",
        "fonts": "math", "first_view": "grundlagen", "factsheet": "Factsheet als PDF ↓",
    },
    {
        "slug": "ausmultiplizieren-faktorisieren", "grade": "8", "subject": "mathematik", "chapter": "I", "order": 3, "kit": True, "accent": ACCENT_MATH8,
        "title": "Ausmultiplizieren und Faktorisieren", "short": "Ausmultiplizieren", "tag": "Terme",
        "card": "Klammern auflösen, Klammer mal Klammer, Ausklammern, Flächenmodell, Trainer, Quiz",
        "description": "Interaktive Lernhilfe zum Ausmultiplizieren und Faktorisieren (Mathematik, Klasse 8)",
        "intro": "Klammern auflösen und Faktoren ausklammern: mit Flächenmodell zum Ausprobieren und einem Trainer, der deine Ergebnisse prüft.",
        "fonts": "math", "first_view": "verstehen", "factsheet": "Factsheet als PDF ↓",
    },
    {
        "slug": "terme-vereinfachen", "grade": "8", "subject": "mathematik", "chapter": "I", "order": 2, "kit": True, "accent": ACCENT_MATH8,
        "title": "Terme vereinfachen", "short": "Terme vereinfachen", "tag": "Terme",
        "card": "Gleichartige Terme, Zusammenfassen, Produkte mit mehreren Variablen, Termsortierer, Trainer, Quiz",
        "description": "Interaktive Lernhilfe zum Vereinfachen von Termen mit mehreren Variablen (Mathematik, Klasse 8)",
        "intro": "Terme mit mehreren Variablen zusammenfassen und Produkte vereinfachen: mit Termsortierer und einem Trainer, der deine Ergebnisse prüft.",
        "fonts": "math", "first_view": "verstehen", "factsheet": "Factsheet als PDF ↓",
    },
    {
        "slug": "gleichungen", "grade": "8", "subject": "mathematik", "chapter": "I", "order": 6, "kit": True, "accent": ACCENT_MATH8,
        "title": "Gleichungen lösen", "short": "Gleichungen", "tag": "Gleichungen",
        "card": "Äquivalenzumformungen, Fahrplan mit Probe, Umformungs-Werkstatt, Trainer mit Rechenweg, Quiz",
        "description": "Interaktive Lernhilfe zum Lösen linearer Gleichungen (Mathematik, Klasse 8)",
        "intro": "Lineare Gleichungen Schritt für Schritt lösen: mit Waage-Modell, einer Werkstatt, in der du selbst umformst, und einem Trainer mit Rechenweg.",
        "fonts": "math", "first_view": "verstehen", "factsheet": "Factsheet als PDF ↓",
    },
    {
        "slug": "ungleichungen", "grade": "8", "subject": "mathematik", "chapter": "I", "order": 7, "kit": True, "accent": ACCENT_MATH8,
        "title": "Ungleichungen lösen", "short": "Ungleichungen", "tag": "Gleichungen",
        "card": "Zeichen und Lösungsmengen, Zahlenstrahl, Zeichen umdrehen, Umformungs-Werkstatt, Trainer, Quiz",
        "description": "Interaktive Lernhilfe zum Lösen linearer Ungleichungen (Mathematik, Klasse 8)",
        "intro": "Lineare Ungleichungen lösen und Lösungsmengen am Zahlenstrahl verstehen, mit der wichtigsten Regel: Zeichen umdrehen beim Teilen durch negative Zahlen.",
        "fonts": "math", "first_view": "verstehen", "factsheet": "Factsheet als PDF ↓",
    },
    {
        "slug": "druck", "grade": "8", "subject": "physik", "kit": True, "accent": ACCENT_PHYS,
        "title": "Druck in Flüssigkeiten und Gasen", "short": "Druck", "tag": "Druck",
        "card": "Druck = Kraft : Fläche, Einheiten, Kolbendruck, Gase und Flüssigkeiten, Kolben-Versuch, Trainer, Quiz",
        "description": "Interaktive Lernhilfe zum Druck in eingeschlossenen Flüssigkeiten und Gasen (Physik, Klasse 8)",
        "intro": "Was Druck ist, wie man ihn berechnet und warum er sich in eingeschlossenen Flüssigkeiten und Gasen überall gleich ausbreitet.",
        "fonts": "math", "first_view": "verstehen", "factsheet": "Factsheet als PDF ↓",
    },
    {
        "slug": "hydraulik", "grade": "8", "subject": "physik", "kit": True, "accent": ACCENT_PHYS,
        "title": "Hydraulische Anlagen", "short": "Hydraulik", "tag": "Druck",
        "card": "Kraftübersetzung, Wege, Goldene Regel der Mechanik, Hebebühne zum Ausprobieren, Trainer, Quiz",
        "description": "Interaktive Lernhilfe zu hydraulischen Anlagen (Physik, Klasse 8)",
        "intro": "Wie eine kleine Kraft ein Auto hebt: Kraft und Weg bei hydraulischen Anlagen, mit Hebebühne zum Ausprobieren und Rechentrainer.",
        "fonts": "math", "first_view": "verstehen", "factsheet": "Factsheet als PDF ↓",
    },
    {
        "slug": "schweredruck", "grade": "8", "subject": "physik", "kit": True, "accent": ACCENT_PHYS,
        "title": "Schweredruck in Flüssigkeiten", "short": "Schweredruck", "tag": "Druck",
        "card": "p = ρ · g · h, Tiefe und Dichte, hydrostatisches Paradoxon, Tauchbecken, Trainer, Quiz",
        "description": "Interaktive Lernhilfe zum Schweredruck in Flüssigkeiten (Physik, Klasse 8)",
        "intro": "Warum es beim Tauchen in den Ohren drückt: Schweredruck berechnen, Tiefe und Dichte vergleichen und im Tauchbecken ausprobieren.",
        "fonts": "math", "first_view": "verstehen", "factsheet": "Factsheet als PDF ↓",
    },
    {
        "slug": "auftrieb", "grade": "8", "subject": "physik", "kit": True, "accent": ACCENT_PHYS,
        "title": "Auftrieb", "short": "Auftrieb", "tag": "Druck",
        "card": "Archimedes, sinken, schweben, schwimmen, Dichtevergleich, Versuch, Vorhersagen, Trainer, Quiz",
        "description": "Interaktive Lernhilfe zum Auftrieb in Flüssigkeiten (Physik, Klasse 8)",
        "intro": "Warum ein Stahlschiff schwimmt und ein Nagel sinkt: Auftriebskraft, Dichtevergleich und das Gesetz des Archimedes zum Ausprobieren.",
        "fonts": "math", "first_view": "verstehen", "factsheet": "Factsheet als PDF ↓",
    },
    {
        "slug": "luftdruck", "grade": "8", "subject": "physik", "kit": True, "accent": ACCENT_PHYS,
        "title": "Luftdruck", "short": "Luftdruck", "tag": "Druck",
        "card": "Luftdruck und seine Kraft, Versuche, Barometer, Höhe und Wetter, Höhenreise, Trainer, Quiz",
        "description": "Interaktive Lernhilfe zum Luftdruck (Physik, Klasse 8)",
        "intro": "Wir leben am Boden eines Luftmeeres: wie groß der Luftdruck ist, wie man ihn misst und warum er auf dem Berg kleiner ist.",
        "fonts": "math", "first_view": "verstehen", "factsheet": "Factsheet als PDF ↓",
    },
    {
        "slug": "classpad", "tool": True,
        "title": "ClassPad-Simulator", "card_title": "Taschenrechner: ClassPad-Simulator", "icon": "⌨",
        "card": "Übungsrechner nach dem Vorbild des CASIO fx-CP400 mit Lektionen zur Bedienung von Klasse 8 bis 12",
        "description": "Simulator und Bedienungstrainer im Stil des CASIO fx-CP400 ClassPad II (unabhängiges Lernprojekt)",
        "intro": "Ein Übungsrechner, der sich an der Bedienung des CASIO fx-CP400 (ClassPad II) orientiert. Rechne frei oder lerne Schritt für Schritt, welche Tasten und Menüs du für typische Schulaufgaben brauchst.",
        "fonts": "base", "first_view": "lernen", "factsheet": "Spickzettel als PDF ↓",
        "scripts": ["vendor/algebrite.js"], "assets": ["vendor/algebrite.js"],
    },
]
