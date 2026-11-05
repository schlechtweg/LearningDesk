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
]

# Accent colours of LearnKit apps: (light, dark, soft background)
ACCENT_MATH8 = ("#1f6e8c", "#5fb6d6", "rgba(31, 110, 140, 0.12)")
ACCENT_PHYS = ("#b4531f", "#f0995a", "rgba(180, 83, 31, 0.12)")
ACCENT_SYM = ("#2f7d5b", "#6cc79a", "rgba(47, 125, 91, 0.12)")
ACCENT_ENDO = ("#7a3f8f", "#c995de", "rgba(122, 63, 143, 0.12)")

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
        "slug": "binomische-formeln", "grade": "8", "subject": "mathematik",
        "title": "Binomische Formeln", "short": "Binomische Formeln", "tag": "Terme",
        "card": "Die drei Formeln, Erklärung mit Flächen, Trainer mit Lückenaufgaben, Kopfrechen-Trick, Quiz",
        "description": "Interaktive Lernhilfe zu den binomischen Formeln (Mathematik, Klasse 8)",
        "intro": "Drei Formeln, mit denen du Klammern blitzschnell auflösen kannst. Hier lernst du, wie sie aussehen, warum sie stimmen und wie du sie anwendest.",
        "fonts": "math", "first_view": "formeln", "factsheet": "Factsheet als PDF ↓",
    },
    {
        "slug": "bruchterme", "grade": "8", "subject": "mathematik",
        "title": "Bruchterme", "short": "Bruchterme", "tag": "Terme",
        "card": "Definitionsmenge, Kürzen und Erweitern, Rechnen mit Bruchtermen, Trainer mit Lösungsweg, Quiz",
        "description": "Interaktive Lernhilfe zu Bruchtermen (Mathematik, Klasse 8)",
        "intro": "Brüche mit Variablen: Was ist erlaubt, wie kürzt man, und wie rechnet man damit? Mit Trainer, der deine Antworten prüft.",
        "fonts": "math", "first_view": "grundlagen", "factsheet": "Factsheet als PDF ↓",
    },
    {
        "slug": "ausmultiplizieren-faktorisieren", "grade": "8", "subject": "mathematik", "kit": True, "accent": ACCENT_MATH8,
        "title": "Ausmultiplizieren und Faktorisieren", "short": "Ausmultiplizieren", "tag": "Terme",
        "card": "Klammern auflösen, Klammer mal Klammer, Ausklammern, Flächenmodell, Trainer, Quiz",
        "description": "Interaktive Lernhilfe zum Ausmultiplizieren und Faktorisieren (Mathematik, Klasse 8)",
        "intro": "Klammern auflösen und Faktoren ausklammern: mit Flächenmodell zum Ausprobieren und einem Trainer, der deine Ergebnisse prüft.",
        "fonts": "math", "first_view": "verstehen", "factsheet": "Factsheet als PDF ↓",
    },
    {
        "slug": "terme-vereinfachen", "grade": "8", "subject": "mathematik", "kit": True, "accent": ACCENT_MATH8,
        "title": "Terme vereinfachen", "short": "Terme vereinfachen", "tag": "Terme",
        "card": "Gleichartige Terme, Zusammenfassen, Produkte mit mehreren Variablen, Termsortierer, Trainer, Quiz",
        "description": "Interaktive Lernhilfe zum Vereinfachen von Termen mit mehreren Variablen (Mathematik, Klasse 8)",
        "intro": "Terme mit mehreren Variablen zusammenfassen und Produkte vereinfachen: mit Termsortierer und einem Trainer, der deine Ergebnisse prüft.",
        "fonts": "math", "first_view": "verstehen", "factsheet": "Factsheet als PDF ↓",
    },
    {
        "slug": "gleichungen", "grade": "8", "subject": "mathematik", "kit": True, "accent": ACCENT_MATH8,
        "title": "Gleichungen lösen", "short": "Gleichungen", "tag": "Gleichungen",
        "card": "Äquivalenzumformungen, Fahrplan mit Probe, Umformungs-Werkstatt, Trainer mit Rechenweg, Quiz",
        "description": "Interaktive Lernhilfe zum Lösen linearer Gleichungen (Mathematik, Klasse 8)",
        "intro": "Lineare Gleichungen Schritt für Schritt lösen: mit Waage-Modell, einer Werkstatt, in der du selbst umformst, und einem Trainer mit Rechenweg.",
        "fonts": "math", "first_view": "verstehen", "factsheet": "Factsheet als PDF ↓",
    },
    {
        "slug": "ungleichungen", "grade": "8", "subject": "mathematik", "kit": True, "accent": ACCENT_MATH8,
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
