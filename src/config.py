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
]

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
        "slug": "classpad", "tool": True,
        "title": "ClassPad-Simulator", "card_title": "Taschenrechner: ClassPad-Simulator", "icon": "⌨",
        "card": "Übungsrechner nach dem Vorbild des CASIO fx-CP400 mit Lektionen zur Bedienung von Klasse 8 bis 12",
        "description": "Simulator und Bedienungstrainer im Stil des CASIO fx-CP400 ClassPad II (unabhängiges Lernprojekt)",
        "intro": "Ein Übungsrechner, der sich an der Bedienung des CASIO fx-CP400 (ClassPad II) orientiert. Rechne frei oder lerne Schritt für Schritt, welche Tasten und Menüs du für typische Schulaufgaben brauchst.",
        "fonts": "base", "first_view": "lernen", "factsheet": "Spickzettel als PDF ↓",
        "scripts": ["vendor/algebrite.js"], "assets": ["vendor/algebrite.js"],
    },
]
