"""Additional written tasks so that every level fills its own page.

EXTRA[slug][level] = [(task_html, solution_html), ...]; appended to the pools from tasks.py.
Computed physics answers are checked with assertions at the end of this file.
"""

EXTRA = {}

# ------------------------------------------------------------------ Das Auge (Klasse 8)
EXTRA["auge"] = {
    1: [
        ("Wie heißen die Lichtsinneszellen für Farben, wie die für hell und dunkel?", "<b>Zapfen</b> (Farben), <b>Stäbchen</b> (hell und dunkel)."),
        ("Was ist die Aufgabe der Iris?", "Sie regelt wie eine <b>Blende</b> die Größe der Pupille und damit den Lichteinfall."),
        ("Wohin leitet der Sehnerv die Signale?", "Zum <b>Gehirn</b> (Sehzentrum)."),
        ("Wie heißt die Anpassung der Linse an verschiedene Entfernungen?", "<b>Akkommodation</b>"),
        ("Welche Brille hilft bei Kurzsichtigkeit?", "Eine Brille mit <b>Zerstreuungslinsen</b> (Minus-Werte)."),
        ("Welche Brille hilft bei Weitsichtigkeit?", "Eine Brille mit <b>Sammellinsen</b> (Plus-Werte)."),
    ],
    2: [
        ("Erkläre, warum die Pupille schwarz aussieht.", "Die Pupille ist ein <b>Loch</b>; das Licht fällt hinein und wird im Auge fast vollständig verschluckt."),
        ("Beschreibe, wie sich die Pupille verändert, wenn du aus einem dunklen Raum in die Sonne gehst.", "Sie wird <b>eng</b> (Pupillenreflex), damit weniger Licht auf die Netzhaut fällt."),
        ("Ordne zu: Ziliarmuskel angespannt, Linsenbänder locker. Nah- oder Fernsicht?", "<b>Nahsicht</b> (Nahakkommodation)."),
        ("Ordne zu: Linse flach, Brechkraft klein. Nah- oder Fernsicht?", "<b>Fernsicht</b> (Fernakkommodation)."),
        ("Warum rundet sich die Linse bei Nahsicht?", "Die Linsenbänder werden locker; die Linse rundet sich durch ihre <b>Eigenelastizität</b>."),
        ("Erkläre den Unterschied zwischen Nahpunkt und Fernpunkt.", "Nahpunkt: <b>kleinste</b>, Fernpunkt: <b>größte</b> Entfernung, in der man scharf sieht."),
        ("Warum sieht man am gelben Fleck am schärfsten?", "Dort liegen besonders <b>viele Zapfen</b> dicht nebeneinander."),
        ("Nenne die Aufgaben von Lederhaut und Aderhaut.", "Lederhaut: <b>Schutz und Form</b>. Aderhaut: <b>Versorgung</b> mit Blut."),
        ("Ein Kind hält ein Buch sehr nah vor die Augen und sieht trotzdem scharf. Ein 60-Jähriger kann das nicht. Erkläre.", "Beim Kind ist die Linse noch <b>elastisch</b> (Nahpunkt ≈ 7 cm); im Alter kann sie sich kaum wölben (Nahpunkt ≈ 1 m)."),
        ("Welche Aufgabe hat die Tränenflüssigkeit?", "Sie hält die Hornhaut <b>feucht</b>, spült Staub weg und schützt vor Keimen."),
        ("Beschreibe zwei Unterschiede zwischen Stäbchen und Zapfen.", "Stäbchen: hell/dunkel, empfindlich, viele. Zapfen: <b>Farben</b>, brauchen <b>viel Licht</b>, weniger."),
        ("Warum fällt es schwer, im Dunkeln Farben zu erkennen?", "Bei wenig Licht arbeiten nur noch die <b>Stäbchen</b>; sie unterscheiden keine Farben."),
        ("Was bedeutet „+2 Dioptrien“ auf einem Brillenpass?", "Eine <b>Sammellinse</b> mit der Brechkraft 2 dpt, z. B. gegen <b>Weit- oder Alterssichtigkeit</b>."),
        ("Erkläre, warum man im Kino am Anfang kaum etwas sieht.", "Die Lichtsinneszellen brauchen Zeit, um sich an die <b>Dunkelheit anzupassen</b> (bis zu 30 min)."),
        ("Warum ist das Bild auf der Netzhaut kleiner als der Gegenstand?", "Die Linse <b>bündelt</b> das Licht auf die kleine Netzhaut; das Bild ist verkleinert (und umgekehrt)."),
        ("Nenne vier Teile, die das Licht durchquert, bevor es die Netzhaut erreicht.", "<b>Hornhaut, Kammerwasser, Linse, Glaskörper</b> (und die Pupille)."),
    ],
    3: [
        ("Ein Mensch hat einen zu langen Augapfel. Beschreibe, was er sieht, wo das Bild entsteht und wie man hilft.", "Er ist <b>kurzsichtig</b>: Fernes ist unscharf, das Bild entsteht <b>vor</b> der Netzhaut. Hilfe: <b>Zerstreuungslinse</b>."),
        ("Warum hilft eine Lesebrille nicht beim Autofahren?", "Die Sammellinse verstärkt die Brechung; für die <b>Ferne</b> ist das Bild dann <b>vor</b> der Netzhaut und unscharf."),
        ("Erkläre, warum ein weitsichtiger Mensch schon beim Blick in die Ferne akkommodieren muss.", "Sein Augapfel ist zu kurz; ohne Akkommodation läge das Bild <b>hinter</b> der Netzhaut. Er braucht <b>mehr Brechkraft</b>."),
        ("Ein Kurzsichtiger hat seinen Fernpunkt bei 50 cm. Was sieht er scharf, was nicht?", "Alles <b>näher als 50 cm</b> ist scharf, alles weiter Entfernte <b>unscharf</b>."),
        ("Begründe, warum Lesen bei schlechtem Licht anstrengender ist.", "Die Pupille ist weit, das Bild weniger scharf; die Zapfen bekommen wenig Licht. Die Augen <b>müssen sich mehr anstrengen</b>."),
        ("Vergleiche das Auge mit einer Kamera: Wie stellen beide scharf?", "Kamera: das Objektiv wird <b>verschoben</b>. Auge: die Linse ändert ihre <b>Form</b> (Akkommodation)."),
        ("Warum siehst du einen schwach leuchtenden Stern nachts besser, wenn du knapp neben ihn schaust?", "Am Rand der Netzhaut liegen viele <b>Stäbchen</b>; sie sind lichtempfindlicher als die Zapfen im gelben Fleck."),
        ("Erkläre, warum man mit zwei Augen Entfernungen besser schätzen kann als mit einem.", "Beide Augen sehen <b>leicht verschiedene Bilder</b>; das Gehirn berechnet daraus die Entfernung (räumliches Sehen)."),
        ("Ein Fußballer verliert ein Auge. Welche Schwierigkeiten erwartest du?", "Schlechteres <b>räumliches Sehen</b>: Entfernungen und Flugbahnen sind schwer einzuschätzen; kleineres Blickfeld."),
        ("Nach einem Blitzlicht siehst du kurz einen dunklen Fleck. Erkläre.", "Die getroffenen Lichtsinneszellen sind kurz <b>überreizt</b> und melden weniger; die Stelle erscheint dunkel."),
        ("Warum tränen die Augen bei Wind oder Rauch?", "Ein <b>Schutzreflex</b>: Mehr Tränenflüssigkeit spült Reizstoffe weg und hält die Hornhaut feucht."),
        ("Begründe, warum man beim Lesen am Bildschirm regelmäßig Pausen machen sollte (20-20-20-Regel).", "Der <b>Ziliarmuskel</b> ist bei Nahsicht dauernd angespannt, man blinzelt seltener. Blick in die Ferne <b>entspannt</b>."),
        ("Erkläre, warum ältere Menschen Zeitungen mit ausgestrecktem Arm halten.", "Ihr <b>Nahpunkt</b> ist weit weg, weil die Linse unelastisch ist (Alterssichtigkeit)."),
        ("Ein Brillenpass zeigt rechts −1,5 und links +0,5. Was bedeutet das?", "Rechts <b>kurzsichtig</b> (Zerstreuungslinse), links leicht <b>weitsichtig</b> (Sammellinse)."),
        ("Erkläre, warum die Hornhaut keine Blutgefäße hat und trotzdem versorgt wird.", "Sie muss <b>durchsichtig</b> sein; Nährstoffe kommen aus dem <b>Kammerwasser</b> und der Tränenflüssigkeit."),
        ("Plane einen Versuch, mit dem du deinen Nahpunkt bestimmst.", "Einen Text langsam an das Auge heranführen, bis er unscharf wird; den <b>Abstand messen</b> (ein Auge geschlossen)."),
    ],
}

# ------------------------------------------------------------------ Das Nervensystem (Klasse 8)
EXTRA["nervensystem"] = {
    1: [
        ("Welche zwei Teile bilden das ZNS?", "<b>Gehirn</b> und <b>Rückenmark</b>."),
        ("Was ist ein Reiz? Nenne zwei Beispiele.", "Eine Einwirkung auf Sinneszellen, z. B. <b>Licht, Schall, Hitze, Druck</b>."),
        ("Wo liegt das Rückenmark?", "Geschützt im <b>Wirbelkanal</b> der Wirbelsäule."),
        ("Welche Teile einer Nervenzelle geben das Signal an die nächste Zelle weiter?", "Die <b>Endknöpfchen</b> an der Synapse."),
        ("Was schützt das Gehirn vor Stößen?", "Der <b>Schädel</b>, die Hirnhäute und die Gehirnflüssigkeit."),
        ("Wie schnell leiten Nerven mit Myelinscheide ungefähr?", "Bis zu etwa <b>120 m/s</b>."),
    ],
    2: [
        ("Ordne zu: Nerv vom Auge zum Gehirn – sensorisch oder motorisch?", "<b>sensorisch</b> (Sehnerv)."),
        ("Ordne zu: Nerv vom Rückenmark zum Beinmuskel – sensorisch oder motorisch?", "<b>motorisch</b>."),
        ("Erkläre den Unterschied zwischen ZNS und peripherem Nervensystem.", "ZNS: Gehirn und Rückenmark, <b>verarbeiten</b>. Peripher: übrige Nerven, <b>leiten</b> zum und vom ZNS."),
        ("Beschreibe die Reaktion beim Ballfangen als Reiz-Reaktions-Kette.", "Licht → <b>Auge</b> → Sehnerv → <b>Großhirn</b> → Rückenmark → motorischer Nerv → <b>Armmuskel</b>."),
        ("Ein Signal läuft 0,9 m mit 90 m/s. Wie lange braucht es?", "0,9 : 90 = 0,01 s = <b>10 ms</b>"),
        ("Ein Signal braucht 20 ms bei 60 m/s. Wie lang ist der Weg?", "60 · 0,02 = <b>1,2 m</b>"),
        ("Was passiert an der Synapse?", "Das Signal wird mit einem <b>Botenstoff</b> über einen kleinen Spalt auf die nächste Zelle übertragen."),
        ("Nenne zwei Wirkungen des Parasympathikus.", "Herz <b>langsamer</b>, Verdauung <b>aktiver</b>, Pupillen enger."),
        ("Nenne drei Wirkungen des Sympathikus.", "Herz <b>schneller</b>, Atmung schneller, Pupillen <b>weit</b>, Verdauung gebremst."),
        ("Warum nennt man das vegetative Nervensystem auch „autonom“?", "Es arbeitet <b>selbstständig</b>, ohne dass wir es bewusst steuern."),
        ("Ordne zu: Gleichgewicht halten, Wörter lernen, Atmen im Schlaf.", "Gleichgewicht: <b>Kleinhirn</b>; Lernen: <b>Großhirn</b>; Atmen: <b>Hirnstamm</b>."),
        ("Ordne zu: Körpertemperatur, Herzschlag, bewusstes Sehen.", "Temperatur: <b>Zwischenhirn</b>; Herzschlag: <b>Hirnstamm</b>; Sehen: <b>Großhirn</b>."),
        ("Warum ist der Lidschlussreflex für uns nützlich?", "Er <b>schützt das Auge</b> blitzschnell vor Fremdkörpern."),
        ("Beschreibe den Kniesehnenreflex in vier Schritten.", "Schlag dehnt den Muskel → <b>sensorischer Nerv</b> → <b>Rückenmark</b> → motorischer Nerv → Muskel zieht sich zusammen."),
        ("Wie viele Nervenzellen hat das Gehirn ungefähr?", "Etwa <b>86 Milliarden</b>."),
        ("Erkläre, warum Reflexe schneller sind als bewusste Reaktionen.", "Der Weg ist <b>kürzer</b> (Umschaltung im Rückenmark) und es gibt <b>weniger Synapsen</b>; das Großhirn muss nicht entscheiden."),
    ],
    3: [
        ("Bei einer Verletzung des Rückenmarks auf Höhe der Brust kann jemand die Arme bewegen, aber nicht die Beine. Erkläre.", "Die Nerven zu den Armen verlassen das Rückenmark <b>oberhalb</b> der Verletzung; Befehle zu den Beinen kommen <b>nicht mehr durch</b>."),
        ("Warum zittert man bei Kälte, ohne es zu wollen?", "Das <b>Zwischenhirn</b> bemerkt die Kälte und löst <b>unwillkürliche</b> Muskelzuckungen aus; sie erzeugen Wärme."),
        ("Ein Sprinter reagiert auf den Startschuss in 0,15 s. Warum gilt eine Reaktion unter 0,1 s als Fehlstart?", "So schnell kann das Signal Ohr → Gehirn → Muskel <b>nicht</b> verarbeitet werden; er muss <b>vorher</b> losgelaufen sein."),
        ("Berechne: Ein Signal läuft vom Zeh (1,5 m) zum Gehirn. Wie lange braucht es mit 100 m/s und mit 1 m/s?", "Mit Myelin <b>15 ms</b>, ohne Myelin <b>1,5 s</b>."),
        ("Warum spürt man einen Mückenstich oft erst, wenn es juckt, und nicht beim Stich?", "Der Reiz ist sehr <b>schwach</b>; erst die spätere Reaktion des Körpers reizt die Sinneszellen stärker."),
        ("Erkläre, warum man sich bei Müdigkeit schlechter konzentriert und langsamer reagiert.", "Das Gehirn arbeitet weniger zuverlässig; die Verarbeitung im <b>Großhirn</b> dauert länger."),
        ("Bei Angst wird der Mund trocken und das Herz rast. Welcher Teil des Nervensystems wirkt hier? Wozu ist das gut?", "Der <b>Sympathikus</b>: Er bereitet den Körper auf <b>Flucht oder Kampf</b> vor; Verdauung (Speichel) wird gebremst."),
        ("Begründe, warum das Kleinhirn für das Lernen von Bewegungen wichtig ist.", "Es <b>speichert und verfeinert</b> Bewegungsabläufe, z. B. beim Radfahren, bis sie automatisch klappen."),
        ("Eine Person kann nach einem Unfall nicht mehr sprechen, versteht aber alles. Welcher Hirnteil ist betroffen?", "Ein Bereich der <b>Großhirnrinde</b>, der das Sprechen steuert."),
        ("Erkläre mit dem Begriff Synapse, warum Alkohol die Reaktionszeit verlängert.", "Alkohol stört die <b>Übertragung an den Synapsen</b>; Signale werden langsamer und ungenauer weitergegeben."),
        ("Vergleiche einen Reflex mit einer erlernten Bewegung wie Schreiben (drei Unterschiede).", "Reflex: <b>angeboren</b>, Rückenmark, unbewusst. Schreiben: <b>gelernt</b>, Großhirn und Kleinhirn, bewusst steuerbar."),
        ("Warum sollte man nach einem Sturz auf den Kopf nicht weiterspielen, auch wenn man sich gut fühlt?", "Eine <b>Gehirnerschütterung</b> zeigt sich manchmal später; ein zweiter Schlag kann das Gehirn schwer schädigen."),
        ("Erkläre, warum man bei geschlossenen Augen schlechter auf einem Bein stehen kann.", "Dem <b>Kleinhirn</b> fehlen die Informationen der Augen; es kann die Haltung schlechter korrigieren."),
        ("Nervenzellen teilen sich kaum noch. Welche Folge hat das bei Verletzungen?", "Zerstörte Nervenzellen werden <b>kaum ersetzt</b>; Schäden an Gehirn und Rückenmark sind oft <b>bleibend</b>."),
        ("Plane einen Versuch, mit dem du zeigst, dass Übung die Reaktionszeit verbessert.", "Lineal-Test oder Online-Test <b>mehrmals</b> durchführen, Zeiten notieren, <b>Mittelwerte</b> von Anfang und Ende vergleichen."),
    ],
}

# ------------------------------------------------------------------ Osmose (Klasse 11)
EXTRA["osmose"] = {
    1: [
        ("Was versteht man unter Diffusion?", "Die <b>selbstständige Verteilung</b> von Teilchen von Orten hoher zu Orten niedriger Konzentration."),
        ("Was ist eine Lösung? Nenne Lösungsmittel und gelösten Stoff bei Salzwasser.", "Ein Gemisch; Lösungsmittel: <b>Wasser</b>, gelöster Stoff: <b>Salz</b>."),
        ("Was bedeutet „hypertonisch“?", "Die Lösung enthält <b>mehr gelöste Teilchen</b> als die Vergleichslösung (z. B. der Zellsaft)."),
        ("Was bedeutet „hypotonisch“?", "Die Lösung enthält <b>weniger gelöste Teilchen</b> als die Vergleichslösung."),
        ("Welche Zellbestandteile hat eine Pflanzenzelle, die einer Tierzelle fehlen? Nenne zwei.", "<b>Zellwand</b>, große <b>Vakuole</b> (und Chloroplasten)."),
        ("Warum braucht Osmose eine Membran?", "Nur eine <b>selektiv permeable</b> Membran hält die gelösten Teilchen zurück und lässt Wasser durch."),
        ("In welche Richtung bewegt sich Wasser bei der Osmose?", "Zur Seite mit <b>mehr gelösten Teilchen</b> (höhere Konzentration)."),
        ("Was passiert mit einer Blutzelle in isotonischer Lösung?", "<b>Nichts</b>: Sie behält ihre Form, es gibt keinen Nettostrom."),
        ("Wie heißt der Druck, den der Zellinhalt auf die Zellwand ausübt?", "<b>Turgor</b> (Turgordruck)."),
        ("Woran erkennst du unter dem Mikroskop eine plasmolysierte Zelle?", "Das Zellinnere hat sich von der <b>Zellwand gelöst</b>, die Vakuole ist kleiner."),
        ("Ist Osmose ein aktiver oder passiver Vorgang?", "<b>Passiv</b>, sie braucht keine Energie."),
        ("Nenne ein Beispiel, bei dem Pflanzen durch Osmose Wasser aufnehmen.", "Die <b>Wurzelhaarzellen</b> nehmen Wasser aus dem Boden auf."),
    ],
    2: [
        ("Rosinen quellen in Wasser auf. Erkläre.", "Der zuckerreiche Inhalt ist <b>hypertonisch</b>; Wasser strömt osmotisch hinein."),
        ("Warum soll man Salat erst kurz vor dem Essen salzen?", "Salz entzieht den Zellen <b>Wasser</b>, der Salat wird schnell welk."),
        ("Erkläre, warum Süßwasserfische kaum trinken, aber viel Urin abgeben.", "Ihr Körper ist <b>hypertonisch</b> zum Wasser; es strömt ständig Wasser ein, das sie ausscheiden müssen."),
        ("Warum werden Gurken in Salzlake eingelegt haltbar?", "Die Lake entzieht Bakterien und Pilzen <b>Wasser</b>, sie können sich nicht vermehren."),
    ],
    3: [
        ("Meeresfische trinken Meerwasser und scheiden Salz über die Kiemen aus. Erkläre, warum das nötig ist.", "Meerwasser ist <b>hypertonisch</b>; sie verlieren ständig Wasser und müssen trinken. Das Salz geben sie <b>aktiv</b> wieder ab."),
        ("Warum kann man Zellen nicht einfach in destilliertem Wasser aufbewahren?", "Wasser strömt osmotisch ein; <b>tierische Zellen platzen</b>, pflanzliche werden prall."),
        ("Ein Versuch: Eine Kartoffelscheibe wird in Salzwasser weich, eine andere in Leitungswasser fest. Erkläre beide Ergebnisse.", "Salzwasser: <b>hypertonisch</b>, Wasserverlust, Turgor sinkt. Leitungswasser: <b>hypotonisch</b>, Wasseraufnahme, Turgor steigt."),
        ("Warum welken Pflanzen an heißen Tagen, obwohl der Boden feucht ist?", "Sie verdunsten mehr Wasser über die Blätter, als die Wurzeln aufnehmen; der <b>Turgor sinkt</b>."),
        ("Erkläre, warum Aquaporine die Osmose beschleunigen.", "Sie sind <b>Wasserkanäle</b> in der Membran; Wasser gelangt dadurch viel schneller hindurch."),
        ("Begründe, warum Ärzte bei Infusionen genau auf die Konzentration achten.", "Eine falsche Konzentration ließe Blutzellen <b>schrumpfen oder platzen</b>; nur isotonische Lösungen sind sicher."),
        ("Warum sterben Süßwasserpflanzen im Meer ab?", "Das Meerwasser ist <b>hypertonisch</b>; die Zellen verlieren Wasser (Plasmolyse) und können keines aufnehmen."),
        ("Ein Ei ohne Schale (in Essig aufgelöst) wird in Sirup gelegt. Was passiert? Begründe.", "Es <b>schrumpft</b>: Sirup ist hypertonisch, Wasser strömt aus dem Ei heraus."),
        ("Das gleiche schalenlose Ei wird in Wasser gelegt. Was passiert?", "Es <b>quillt auf</b>: Wasser strömt osmotisch hinein."),
        ("Warum gießt man Zimmerpflanzen nicht mit Salzwasser?", "Die Bodenlösung würde <b>hypertonisch</b>; die Wurzeln verlören Wasser, die Pflanze welkt."),
        ("Erkläre, wie Pflanzen mit Hilfe des Turgors aufrecht stehen.", "Die prallen Zellen drücken gegen die <b>Zellwände</b>; das macht Stängel und Blätter <b>fest</b>."),
        ("Formuliere eine Hypothese: Welche Auswirkung hat eine höhere Temperatur auf die Geschwindigkeit der Osmose?", "Die Osmose wird <b>schneller</b>, weil sich die Teilchen schneller bewegen."),
    ],
}

# ------------------------------------------------------------------ Natrium-Kalium-Pumpe (Klasse 11)
EXTRA["natrium-kalium-pumpe"] = {
    1: [
        ("Ist die Na⁺-Konzentration innen oder außen höher?", "<b>Außen</b>."),
        ("Ist die K⁺-Konzentration innen oder außen höher?", "<b>Innen</b>."),
        ("Was ist ein Konzentrationsgefälle?", "Ein <b>Unterschied</b> in der Konzentration zwischen zwei Bereichen."),
        ("Was bedeutet „aktiver Transport“?", "Transport <b>gegen das Gefälle</b> unter <b>Energieverbrauch</b>."),
        ("Was bedeutet „passiver Transport“?", "Transport <b>mit dem Gefälle</b>, ohne Energie."),
        ("Wie viele Ladungen bringt die Pumpe pro Runde netto nach außen?", "<b>Eine</b> positive Ladung (3 hinaus, 2 hinein)."),
        ("Was ist ein Carrier?", "Ein Transportprotein, das Teilchen <b>bindet</b>, seine Form ändert und sie auf der anderen Seite abgibt."),
        ("Wie viele ATP verbraucht die Pumpe pro Runde?", "<b>1 ATP</b>"),
        ("Was entsteht bei der Spaltung von ATP?", "<b>ADP</b> und <b>Phosphat</b>; dabei wird Energie frei."),
        ("Nenne ein Organ, dessen Zellen besonders viele Na⁺/K⁺-Pumpen haben.", "z. B. <b>Gehirn</b> (Nervenzellen) oder <b>Niere</b>."),
        ("Wie heißt die Spannung an der Membran einer ruhenden Nervenzelle?", "<b>Ruhepotential</b> (≈ −70 mV)."),
        ("Ist die Na⁺/K⁺-Pumpe ein Kanal oder ein Carrier?", "Ein <b>Carrier</b>."),
        ("Wofür steht die Abkürzung ATP?", "<b>Adenosintriphosphat</b>, der Energieträger der Zelle."),
    ],
    2: [
        ("Eine Pumpe hat 900 Na⁺ hinausbefördert. Wie viele K⁺ und wie viele ATP?", "300 Runden: <b>600 K⁺</b>, <b>300 ATP</b>."),
        ("Eine Pumpe hat 1 000 K⁺ hineinbefördert. Wie viele Na⁺?", "500 Runden: <b>1 500 Na⁺</b>."),
        ("Erkläre, warum die Pumpe Na⁺ innen fest und außen locker bindet.", "So kann sie Na⁺ innen <b>aufnehmen</b> und außen <b>abgeben</b>; die Formänderung ändert die Affinität."),
        ("Welche Folge hat ATP-Mangel für die Pumpe?", "Sie <b>stoppt</b>; die Ionengradienten bauen sich langsam ab."),
        ("Warum spricht man bei der Na⁺/K⁺-Pumpe von „primär“ aktivem Transport?", "Sie nutzt <b>direkt ATP</b> als Energiequelle."),
        ("Vergleiche Ionenkanal und Pumpe in Bezug auf Geschwindigkeit.", "Kanäle sind <b>viel schneller</b>; die Pumpe schafft nur einige hundert Runden pro Sekunde."),
    ],
    3: [
        ("Erkläre, warum ein Großteil der Energie des Gehirns für die Na⁺/K⁺-Pumpe verbraucht wird.", "Nervenzellen müssen nach Signalen ständig die <b>Gradienten wiederherstellen</b>; das kostet viel ATP."),
        ("Warum sind die Gradienten von Na⁺ und K⁺ auch für die Nährstoffaufnahme wichtig?", "Das <b>Na⁺-Gefälle</b> treibt Symporter an, z. B. für Glucose im Darm (sekundär aktiv)."),
        ("Bei Kälte arbeitet die Pumpe langsamer. Welche Folgen hat das für eine Zelle?", "Na⁺ sammelt sich innen, K⁺ geht verloren; Gradienten und <b>Ruhepotential</b> werden schwächer, Wasser strömt ein."),
        ("Begründe, warum die Pumpe allein das Ruhepotential nicht vollständig erklärt.", "Sie trägt nur wenig direkt bei; entscheidend ist <b>K⁺, das durch offene Kanäle ausströmt</b>."),
        ("Ein Medikament erhöht die Zahl der Pumpen in Muskelzellen. Welchen Effekt erwartest du nach Belastung?", "Die Gradienten werden <b>schneller wiederhergestellt</b>, die Zelle erholt sich schneller."),
        ("Erkläre am Beispiel der Pumpe den Zusammenhang zwischen Proteinform und Funktion.", "Erst die <b>Formänderung</b> (E1 ↔ E2) ermöglicht Binden, Transportieren und Abgeben der Ionen."),
        ("Warum muss die Pumpe immer zu einer Seite geschlossen sein?", "Sonst würden die Ionen <b>mit dem Gefälle zurückfließen</b>; ein Transport gegen das Gefälle wäre unmöglich."),
        ("Bei Herzschwäche wird teils Digitalis gegeben. Welches Risiko besteht bei zu hoher Dosis?", "Die Pumpe wird zu stark gehemmt; Na⁺ und Ca²⁺ steigen, es drohen <b>Herzrhythmusstörungen</b>."),
        ("Erkläre, warum man nach starkem Schwitzen Mineralstoffe (Na⁺, K⁺) ersetzen sollte.", "Ohne genug Na⁺ und K⁺ im Blut können die <b>Gradienten</b> nicht aufrechterhalten werden; Muskeln und Nerven arbeiten schlechter."),
        ("Stelle eine Hypothese auf, wie sich eine Hemmung der Pumpe auf das Zellvolumen auswirkt, und begründe.", "Das Volumen <b>nimmt zu</b>: Innen sammeln sich Teilchen (Na⁺), Wasser strömt osmotisch ein."),
        ("Warum kann die Zelle mit der Pumpe auch ihren pH-Wert und andere Ionen regulieren?", "Das <b>Na⁺-Gefälle</b> treibt Austauscher an, z. B. Na⁺/H⁺-Antiporter (H⁺ hinaus)."),
        ("Erkläre, warum ein einzelnes Aktionspotential die Na⁺-Konzentration innen kaum verändert.", "Es fließen nur <b>sehr wenige Ionen</b> im Verhältnis zur Gesamtmenge in der Zelle."),
    ],
}

# ------------------------------------------------------------------ Symport und Antiport (Klasse 11)
EXTRA["symport-antiport"] = {
    1: [
        ("Nenne ein Beispiel für einen Uniport.", "<b>GLUT</b> (Glucose-Transporter)."),
        ("Nenne ein Beispiel für einen Symport.", "<b>Na⁺-Glucose-Symporter</b> im Darm."),
        ("Nenne ein Beispiel für einen Antiport.", "<b>Na⁺/K⁺-Pumpe</b> oder Na⁺/Ca²⁺-Austauscher."),
        ("Was bedeutet „mit dem Gefälle“?", "Von der Seite mit <b>viel</b> zur Seite mit <b>wenig</b> Teilchen."),
        ("Was bedeutet Spezifität bei Carriern?", "Ein Carrier transportiert nur <b>bestimmte Teilchen</b>, die zu seiner Bindestelle passen."),
    ],
    2: [
        ("Ein Carrier bringt Na⁺ und Aminosäuren in die Zelle. Bestimme Transportart und Energieform.", "<b>Symport</b>, <b>sekundär aktiv</b> (Na⁺-Gefälle)."),
        ("Ein Carrier lässt Fructose mit ihrem Gefälle in die Zelle. Bestimme Transportart und Energieform.", "<b>Uniport</b>, <b>passiv</b>."),
        ("Der Na⁺/Ca²⁺-Austauscher hat 300 Ca²⁺ hinausbefördert. Wie viele Na⁺ kamen herein?", "300 · 3 = <b>900 Na⁺</b>"),
        ("Der Na⁺-Glucose-Symporter hat 800 Na⁺ hineingelassen. Wie viel Glucose?", "800 : 2 = <b>400 Glucose</b>"),
        ("Woran erkennt man, dass ein Transport aktiv ist?", "Ein Stoff wird <b>gegen sein Gefälle</b> transportiert."),
        ("Warum ist der Cl⁻/HCO₃⁻-Austauscher passiv, obwohl er ein Antiport ist?", "Beide Stoffe bewegen sich <b>mit ihrem Gefälle</b>; es wird keine Energie gebraucht."),
        ("Erkläre, warum die Na⁺/K⁺-Pumpe für alle Na⁺-gekoppelten Symporter wichtig ist.", "Sie hält das <b>Na⁺-Gefälle</b> aufrecht, das die Symporter antreibt."),
        ("Ordne zu: Die H⁺/K⁺-Pumpe im Magen. Transportart und Energieform?", "<b>Antiport</b>, <b>primär aktiv</b> (ATP)."),
        ("Ordne zu: Der H⁺-Saccharose-Symporter in Pflanzen. Transportart und Energieform?", "<b>Symport</b>, <b>sekundär aktiv</b> (H⁺-Gefälle)."),
        ("Wie bauen Pflanzen das H⁺-Gefälle auf?", "Mit einer <b>Protonenpumpe</b>, die H⁺ unter ATP-Verbrauch hinausbefördert."),
        ("Beschreibe in drei Schritten, wie ein Carrier arbeitet.", "Teilchen <b>binden</b> → Carrier <b>ändert seine Form</b> → Teilchen werden auf der anderen Seite <b>abgegeben</b>."),
        ("Warum transportiert ein Carrier langsamer als ein Kanal?", "Er muss für jeden Transport seine <b>Form ändern</b>; ein Kanal ist durchgehend offen."),
        ("Was passiert mit der Transportrate eines Carriers, wenn sehr viel Substrat vorhanden ist?", "Sie erreicht ein <b>Maximum</b> (Sättigung), weil alle Carrier besetzt sind."),
        ("Erkläre den Begriff „gekoppelter Transport“.", "Der Transport eines Stoffes ist an den eines <b>anderen Stoffes gebunden</b> (Symport oder Antiport)."),
        ("Ein Carrier befördert 1 Na⁺ hinein und 1 H⁺ hinaus. Welche Funktion könnte er haben?", "Er senkt die H⁺-Konzentration innen: <b>pH-Regulation</b> (Na⁺/H⁺-Austauscher)."),
    ],
    3: [
        ("Glucose wird im Darm mit SGLT1 aufgenommen und verlässt die Zelle zum Blut über GLUT2. Erkläre, warum zwei verschiedene Transporter nötig sind.", "Hinein <b>gegen das Gefälle</b> (sekundär aktiv, SGLT1), hinaus ins Blut <b>mit dem Gefälle</b> (passiv, GLUT2)."),
        ("Warum hören Darmzellen ohne Sauerstoff bald auf, Glucose aufzunehmen?", "Ohne O₂ kaum ATP, die Na⁺/K⁺-Pumpe stoppt, das <b>Na⁺-Gefälle</b> zerfällt; SGLT1 verliert seinen Antrieb."),
        ("Erkläre an einem Beispiel, wie ein Antiport sekundär aktiv sein kann.", "Na⁺/Ca²⁺-Austauscher: Na⁺ strömt <b>mit</b> seinem Gefälle hinein und treibt Ca²⁺ <b>gegen</b> sein Gefälle hinaus."),
        ("Ein Gift blockiert nur den Na⁺-Glucose-Symporter. Was passiert mit der Glucose-Konzentration im Darm und im Blut?", "Im Darm <b>steigt</b> sie, im Blut steigt sie weniger an; zudem bleibt mehr Wasser im Darm (Durchfall)."),
        ("Vergleiche primär und sekundär aktiven Transport in Bezug auf Energiequelle und ATP-Verbrauch.", "Primär: <b>ATP direkt</b>. Sekundär: <b>Ionengefälle</b>; ATP wird indirekt verbraucht, weil eine Pumpe das Gefälle aufbaut."),
        ("Begründe, warum Uni-, Sym- und Antiport keine Aussage über den Energiebedarf machen.", "Die Begriffe beschreiben nur die <b>Richtung</b> und die Zahl der Teilchensorten; jede Art kann passiv oder aktiv sein."),
        ("Erkläre, warum SGLT2-Hemmer bei Diabetes zu Zucker im Urin führen.", "Der Symporter holt Glucose in der Niere <b>nicht mehr zurück</b>; sie bleibt im Harn."),
        ("Plane einen Versuch, mit dem du zeigst, dass ein Transporter Na⁺-abhängig ist.", "Aufnahme mit <b>und ohne Na⁺</b> im Außenmedium messen; ohne Na⁺ <b>keine</b> oder kaum Aufnahme."),
        ("Warum können Carrier gesättigt werden, Diffusion durch die Lipidschicht aber nicht?", "Es gibt nur <b>begrenzt viele Carrier</b>; bei freier Diffusion steigt die Rate mit der Konzentration weiter an."),
        ("Erkläre, warum ein Na⁺/K⁺-Pumpen-Hemmer im Herzmuskel den Ca²⁺-Gehalt erhöht.", "Kleineres Na⁺-Gefälle → <b>NCX</b> schafft weniger Ca²⁺ hinaus → Ca²⁺ steigt in der Zelle."),
        ("Stelle eine Energiebilanz auf: Wie viel ATP kostet es, 100 Glucose über SGLT1 aufzunehmen?", "200 Na⁺ strömen ein; die Pumpe braucht für 200 Na⁺ (3 pro ATP) etwa <b>67 ATP</b>."),
        ("Begründe, warum Pflanzen eher H⁺ als Na⁺ für sekundär aktiven Transport nutzen.", "Pflanzenzellen haben statt der Na⁺/K⁺-Pumpe vor allem eine <b>Protonenpumpe</b>; sie bauen damit ein <b>H⁺-Gefälle</b> auf. Viel Na⁺ ist für viele Pflanzen zudem schädlich."),
        ("Erkläre, warum Trinklösungen mit Salz und Zucker besser wirken als reines Wasser.", "Na⁺ und Glucose werden <b>gemeinsam aufgenommen</b> (SGLT1); Wasser folgt osmotisch nach."),
    ],
}

# ------------------------------------------------------------------ Endocytose und Exocytose (Klasse 11)
EXTRA["endocytose-exocytose"] = {
    1: [
        ("Welcher Vorgang ist „Zellfressen“?", "<b>Phagocytose</b>"),
        ("Welcher Vorgang ist „Zelltrinken“?", "<b>Pinocytose</b>"),
        ("Wie heißen die Ausstülpungen, mit denen Fresszellen Bakterien umfließen?", "<b>Scheinfüßchen</b> (Pseudopodien)."),
        ("Was enthält ein Lysosom?", "<b>Verdauungsenzyme</b>."),
        ("Wie nennt man Zellen des Immunsystems, die Bakterien fressen?", "<b>Fresszellen</b> (Makrophagen, Granulozyten)."),
        ("Nenne zwei Stoffe, die per Exocytose abgegeben werden.", "z. B. <b>Insulin, Botenstoffe</b>, Schleim, Verdauungsenzyme."),
        ("Woraus besteht ein Vesikel?", "Aus einer <b>Membran</b> (Lipiddoppelschicht), die einen Inhalt umschließt."),
        ("Wird bei Endocytose die Zellmembran größer oder kleiner?", "<b>Kleiner</b>."),
        ("Wird bei Exocytose die Zellmembran größer oder kleiner?", "<b>Größer</b>."),
        ("In welchem Zellorganell werden Proteine für die Ausschüttung verpackt?", "Im <b>Golgi-Apparat</b>."),
        ("Was ist Clathrin?", "Ein Protein, das eine <b>Hülle</b> um entstehende Vesikel bildet (rezeptorvermittelte Endocytose)."),
        ("Wie nennt man den Weg ER → Golgi → Vesikel → Zellmembran?", "<b>Membranfluss</b>"),
    ],
    2: [
        ("Erkläre den Unterschied zwischen Phagosom und Phagolysosom.", "Phagosom: Bläschen mit aufgenommenem Teilchen. Phagolysosom: Phagosom <b>verschmolzen mit Lysosom</b>, Inhalt wird verdaut."),
        ("Warum ist rezeptorvermittelte Endocytose so gezielt?", "Nur Stoffe, die an <b>passende Rezeptoren</b> binden, werden aufgenommen."),
        ("Was passiert mit den Rezeptoren nach der Aufnahme von LDL?", "Sie werden in Vesikeln zur Membran <b>zurückgebracht</b> und wiederverwendet."),
        ("Erkläre, warum Exocytose an der Synapse ein Signal braucht.", "Botenstoffe sollen nur bei einem <b>Nervenimpuls</b> frei werden; der Ca²⁺-Einstrom löst die Verschmelzung aus."),
        ("Wofür braucht die Zelle bei der Phagocytose ATP?", "Für die Bewegung der Membran durch das <b>Cytoskelett</b>."),
        ("Ordne zu: Becherzellen geben Schleim ab. Welcher Vorgang?", "<b>Exocytose</b>"),
        ("Ordne zu: Eine Amöbe nimmt eine Alge auf. Welcher Vorgang?", "<b>Phagocytose</b>"),
        ("Ordne zu: Eine Zelle nimmt gezielt Eisen auf. Welcher Vorgang?", "<b>rezeptorvermittelte Endocytose</b>"),
        ("Erkläre, warum bei der Endocytose der Stoff die Membran nicht durchquert.", "Er bleibt im <b>Vesikel</b> eingeschlossen und gelangt so ins Zellinnere."),
    ],
    3: [
        ("Viren nutzen die rezeptorvermittelte Endocytose. Erkläre, warum ein Virus nur bestimmte Zellen befällt.", "Es braucht passende <b>Rezeptoren</b>; nur Zellen mit diesen Rezeptoren nehmen es auf."),
        ("Ein Medikament blockiert Clathrin. Welche Vorgänge sind betroffen, welche nicht?", "Betroffen: <b>rezeptorvermittelte Endocytose</b>. Kaum betroffen: Phagocytose und Exocytose."),
        ("Erkläre, warum sich das Membranvolumen einer Zelle trotz ständiger Exocytose nicht ändert.", "Es wird gleichzeitig Membran per <b>Endocytose</b> zurückgeholt (Membranfluss)."),
        ("Bei einer Erkrankung funktionieren die Lysosomen nicht. Welche Folgen hat das für Fresszellen?", "Aufgenommenes Material wird <b>nicht abgebaut</b> und sammelt sich an; die Abwehr ist geschwächt."),
        ("Warum ist Phagocytose für den Körper auch ohne Infektion wichtig?", "Fresszellen beseitigen <b>abgestorbene Zellen</b> und Zelltrümmer."),
        ("Begründe, warum Zellen der Bauchspeicheldrüse besonders viel raues ER und Golgi-Apparat haben.", "Sie stellen viele <b>Proteine</b> (Enzyme, Insulin) her und geben sie per <b>Exocytose</b> ab."),
        ("Erkläre, warum Botox gegen Falten wirkt.", "Es blockiert die <b>Exocytose</b> von Botenstoff an Nerv-Muskel-Verbindungen; die Muskeln <b>erschlaffen</b>."),
        ("Vergleiche Exocytose an der Synapse mit der Abgabe von Schleim (Auslöser, Zeitpunkt).", "Synapse: auf <b>Signal</b> (Ca²⁺), schlagartig. Schleim: <b>ständig</b>, ohne besonderes Signal."),
        ("Erkläre, wie Antikörper aus dem Blut der Mutter in die Muttermilch gelangen.", "Per <b>Transcytose</b>: Endocytose an der Blutseite der Milchdrüsenzellen, Vesikeltransport, Exocytose in die Milch."),
        ("Formuliere eine Hypothese: Was passiert mit der Endocytose bei 4 °C? Begründe.", "Sie wird stark <b>gebremst</b>: Membran und Cytoskelett bewegen sich bei Kälte kaum, enzymatische Vorgänge sind langsam."),
        ("Erkläre, warum Cholesterin ohne LDL-Rezeptoren im Blut bleibt, obwohl Zellen Pinocytose betreiben.", "Pinocytose nimmt nur <b>wenig</b> und <b>ungezielt</b> auf; die große Menge LDL braucht die rezeptorvermittelte Aufnahme."),
        ("Plane einen Versuch, mit dem man Phagocytose unter dem Mikroskop sichtbar macht.", "Fresszellen mit <b>gefärbten Teilchen</b> (z. B. Hefe, Tusche) mischen und beobachten, wie die Teilchen <b>in Bläschen</b> im Zellinneren erscheinen."),
    ],
}

# ------------------------------------------------------------------ physics, hard level (computed, g = 9,81 N/kg)
from tasks import de  # noqa: E402

G = 9.81


def _auftrieb():
    out = []
    # body hanging in water: reading of the spring scale
    for name, rho, vcm in [("Aluminiumwürfel", 2700, 125), ("Eisenkugel", 7870, 60), ("Kupferstück", 8960, 40), ("Glasstein", 2500, 200)]:
        v = vcm / 1e6
        fg, fa = rho * v * G, 1000 * v * G
        out.append((f"Ein {name} (<i>V</i> = {vcm} cm³, <i>ρ</i> = {de(rho, 0)} kg/m³) hängt am Kraftmesser und wird ganz in Wasser getaucht. Was zeigt der Kraftmesser an?",
                    f"<i>F</i><sub>G</sub> = {de(fg, 2)} N, <i>F</i><sub>A</sub> = {de(fa, 2)} N, Anzeige: <b>{de(fg - fa, 2)} N</b>"))
    # density from the loss of weight
    for fl, fw in [(5.4, 3.4), (7.9, 6.9), (2.7, 1.7)]:
        fa = fl - fw
        v = fa / (1000 * G)
        rho = fl / G / v
        out.append((f"Ein Körper wiegt an der Luft {de(fl, 1)} N, ganz in Wasser {de(fw, 1)} N. Berechne Volumen und Dichte.",
                    f"<i>F</i><sub>A</sub> = {de(fa, 1)} N, <i>V</i> = <i>F</i><sub>A</sub> : (1 000 · 9,81) = {de(v * 1e6, 0)} cm³, <i>ρ</i> = <b>{de(rho, 0)} kg/m³</b>"))
        assert abs(rho - 1000 * fl / fa) < 1e-6
    # floating: immersed fraction
    for name, rho, rl, liq in [("Eisberg", 920, 1025, "Meerwasser"), ("Holzbalken", 650, 1000, "Süßwasser"), ("Kerze", 900, 1000, "Wasser"), ("Eiswürfel", 920, 1000, "Wasser")]:
        out.append((f"Welcher Anteil eines {name}s (<i>ρ</i> = {rho} kg/m³) liegt in {liq} (<i>ρ</i> = {de(rl, 0)} kg/m³) unter der Oberfläche?",
                    f"{rho} : {de(rl, 0)} = <b>{de(100 * rho / rl, 1)} %</b>"))
    # load of a raft
    for vm, rho_h in [(0.4, 600), (0.25, 500)]:
        mmax = vm * (1000 - rho_h)
        out.append((f"Ein Floß aus Holz (<i>ρ</i> = {rho_h} kg/m³) hat ein Volumen von {de(vm, 2)} m³. Wie viel Last (kg) kann es tragen, bevor es untergeht?",
                    f"Auftrieb ganz eingetaucht entspricht {de(1000 * vm, 0)} kg Wasser, Floß wiegt {de(rho_h * vm, 0)} kg: Last bis <b>{de(mmax, 0)} kg</b>"))
    out += [
        ("Ein Schiff fährt aus der Nordsee in die Elbe (Süßwasser). Taucht es tiefer oder weniger tief ein? Begründe.", "<b>Tiefer</b>: Süßwasser hat eine kleinere Dichte, für den gleichen Auftrieb muss mehr Wasser verdrängt werden."),
        ("Ein Heißluftballon steigt. Erkläre mit dem Auftrieb in Luft.", "Die warme Luft im Ballon hat eine <b>kleinere Dichte</b> als die Umgebungsluft; der Auftrieb ist größer als die Gewichtskraft."),
        ("Warum geht ein voller Kochtopf aus Stahl im Spülbecken unter, ein leerer schwimmt?", "Leer verdrängt er viel Wasser bei kleiner Masse (<b>mittlere Dichte</b> klein); voll ist die mittlere Dichte größer als die von Wasser."),
        ("Ein Taucher trägt Bleigewichte. Wozu?", "Mit Neoprenanzug und Luft in der Lunge wäre seine <b>mittlere Dichte</b> zu klein, er würde auftreiben."),
        ("Ein Aräometer (Dichtemesser) taucht in Salzwasser weniger tief ein als in Süßwasser. Erkläre.", "Salzwasser ist <b>dichter</b>; schon ein kleineres verdrängtes Volumen liefert den nötigen Auftrieb."),
        ("Warum spürt man beim Herausheben eines Steins aus dem Wasser plötzlich mehr Gewicht?", "Außerhalb des Wassers fehlt die <b>Auftriebskraft</b>; man muss die volle Gewichtskraft halten."),
    ]
    return out


def _druck():
    out = []
    for f, a_cm in [(450, 3), (1200, 15), (80, 0.5), (2500, 50)]:
        p = f / (a_cm / 1e4)
        out.append((f"Eine Kraft von {de(f, 0)} N wirkt auf einen Kolben mit {de(a_cm, 1)} cm². Berechne den Druck in Pa und bar.",
                    f"<i>p</i> = {de(f, 0)} N : {de(a_cm / 1e4, 5)} m² = <b>{de(p, 0)} Pa = {de(p / 1e5, 2)} bar</b>"))
    for p_bar, a_cm in [(2.5, 12), (6, 4)]:
        f = p_bar * 10 * a_cm
        out.append((f"In einem Gefäß herrschen {de(p_bar, 1)} bar Überdruck. Welche Kraft wirkt auf einen Deckel von {a_cm} cm²?",
                    f"{de(p_bar, 1)} bar = {de(p_bar * 10, 0)} N/cm², <i>F</i> = <b>{de(f, 0)} N</b>"))
    out += [
        ("Warum hat ein Messer eine scharfe Schneide?", "Die Fläche ist sehr <b>klein</b>, deshalb ist bei gleicher Kraft der <b>Druck</b> sehr groß."),
        ("Warum haben Panzer und Bagger breite Ketten?", "Die Gewichtskraft verteilt sich auf eine <b>große Fläche</b>, der Druck auf den Boden ist kleiner, sie sinken nicht ein."),
        ("Ein Luftballon wird in den Gefrierschrank gelegt und wird kleiner. Erkläre mit dem Teilchenmodell.", "Die Teilchen bewegen sich <b>langsamer</b> und stoßen seltener und schwächer gegen die Hülle; der Druck sinkt, der Ballon schrumpft."),
        ("Eine Spritze mit 20 cm³ Luft (1 bar) wird verschlossen und auf 5 cm³ zusammengedrückt. Welcher Druck entsteht? (<i>p</i> · <i>V</i> = konstant)", "<i>p</i> = 1 bar · 20 : 5 = <b>4 bar</b>"),
        ("Begründe, warum ein Wasserbett gleichmäßig nachgibt, egal wo man sich hinlegt.", "Der Druck breitet sich in der eingeschlossenen Flüssigkeit <b>in alle Richtungen gleich</b> aus."),
    ]
    return out


def _hydraulik():
    out = []
    for a1, a2, f1 in [(3, 90, 150), (5, 200, 80), (2, 120, 250), (4, 60, 300)]:
        f2 = f1 * a2 / a1
        out.append((f"Hebebühne: <i>A</i>₁ = {a1} cm², <i>A</i>₂ = {a2} cm², <i>F</i>₁ = {f1} N. Welche Kraft <i>F</i>₂ entsteht, und welche Masse kann gehoben werden?",
                    f"<i>F</i>₂ = {f1} N · {a2} : {a1} = <b>{de(f2, 0)} N</b>, das entspricht etwa <b>{de(f2 / G, 0)} kg</b>"))
    for a1, a2, s1 in [(2, 80, 40), (5, 150, 30)]:
        s2 = s1 * a1 / a2
        out.append((f"Der Pumpkolben ({a1} cm²) wird um {s1} cm hineingedrückt. Wie weit hebt sich der Arbeitskolben ({a2} cm²)?",
                    f"Das verdrängte Öl ist gleich: {a1} · {s1} = {a2} · <i>s</i>₂, <i>s</i>₂ = <b>{de(s2, 1)} cm</b>"))
    for m_car, a2, a1 in [(1200, 400, 8), (900, 300, 6)]:
        f2 = m_car * G
        f1 = f2 * a1 / a2
        out.append((f"Ein Auto ({m_car} kg) soll gehoben werden. <i>A</i>₂ = {a2} cm², <i>A</i>₁ = {a1} cm². Wie groß muss <i>F</i>₁ mindestens sein?",
                    f"<i>F</i>₂ = {m_car} · 9,81 = {de(f2, 0)} N, <i>F</i>₁ = {de(f2, 0)} · {a1} : {a2} = <b>{de(f1, 0)} N</b>"))
    out += [
        ("Warum muss man den Pumpkolben eines Wagenhebers sehr oft drücken, um ein Auto ein paar Zentimeter zu heben?", "Goldene Regel: Was an <b>Kraft</b> gespart wird, muss an <b>Weg</b> zugelegt werden. Jeder Hub hebt das Auto nur ein kleines Stück."),
        ("Warum darf in einer hydraulischen Bremse keine Luft sein?", "Luft lässt sich <b>zusammendrücken</b>; die Kraft würde nicht vollständig übertragen, die Bremse wird weich."),
        ("Begründe, warum man für Hydraulikanlagen Öl und nicht Wasser verwendet. Nenne zwei Gründe.", "Öl <b>schmiert</b>, verhindert <b>Rost</b> und gefriert nicht so leicht."),
        ("Vergleiche eine Hebebühne mit einem Hebel: Was haben beide gemeinsam?", "Beide sind <b>Kraftwandler</b>: kleine Kraft auf langem Weg, große Kraft auf kurzem Weg (goldene Regel)."),
        ("Ein Bagger hebt mit Hydraulikzylindern eine Schaufel. Warum sind die Zylinder groß im Durchmesser?", "Große <b>Kolbenfläche</b> → bei gleichem Öldruck eine <b>große Kraft</b>."),
    ]
    return out


def _luftdruck():
    out = []
    for h in [400, 800, 1600, 2400, 4000, 8848]:
        p = 1013 * __import__("math").exp(-h / 8000)
        out.append((f"Schätze den Luftdruck in {de(h, 0)} m Höhe (Faustregel: alle 5 500 m halbiert sich der Druck, nahe dem Boden 1 hPa pro 8 m).",
                    f"etwa <b>{de(round(p, -1), 0)} hPa</b>"))
    for a_m2, dp in [(0.05, 100), (1.5, 20), (2.0, 50)]:
        f = dp * 100 * a_m2
        out.append((f"Zwischen innen und außen besteht ein Druckunterschied von {dp} hPa. Welche Kraft wirkt auf eine Fläche von {de(a_m2, 2)} m²?",
                    f"{dp} hPa = {de(dp * 100, 0)} Pa, <i>F</i> = {de(dp * 100, 0)} · {de(a_m2, 2)} = <b>{de(f, 0)} N</b>"))
    out += [
        ("Warum platzt eine Chipstüte im Flugzeug nicht, bläht sich aber auf?", "In der Kabine ist der Druck etwas <b>kleiner</b> als am Boden; die eingeschlossene Luft dehnt sich aus, die Tüte hält das aus."),
        ("Erkläre, warum ein Saugnapf an einer rauen Wand nicht hält.", "Durch die Unebenheiten strömt <b>Luft nach</b>; innen und außen gleicht sich der Druck aus."),
        ("Warum zeigen Wetterkarten Hochs und Tiefs, und wohin weht der Wind?", "Unterschiedliche Luftdrücke; der Wind weht vom <b>Hoch zum Tief</b>, um den Unterschied auszugleichen."),
        ("Bergsteiger am Mount Everest atmen schwerer. Erkläre.", "Der Luftdruck ist nur etwa ein <b>Drittel</b> so groß; pro Atemzug gelangt viel weniger Sauerstoff in die Lunge."),
        ("Warum kann man mit einem Strohhalm Wasser höchstens etwa 10 m hoch saugen?", "Der Luftdruck (≈ 1 bar) kann eine Wassersäule von nur etwa <b>10 m</b> tragen."),
        ("Warum funktioniert eine Saugpumpe auf dem Mond nicht?", "Es gibt <b>keine Luft</b> und damit keinen Luftdruck, der das Wasser hochdrücken könnte."),
    ]
    return out


def _schweredruck():
    out = []
    for h, rho, liq in [(2.5, 1000, "Wasser"), (40, 1025, "Meerwasser"), (0.8, 13600, "Quecksilber"), (11000, 1025, "Meerwasser (Marianengraben)"), (3, 920, "Öl")]:
        p = rho * G * h
        out.append((f"Berechne den Schweredruck in {de(h, 1)} m Tiefe in {liq} (<i>ρ</i> = {de(rho, 0)} kg/m³).",
                    f"<i>p</i> = {de(rho, 0)} · 9,81 · {de(h, 1)} = <b>{de(p, 0)} Pa ≈ {de(p / 1e5, 2)} bar</b>"))
    for p_bar in [1.5, 3, 5]:
        h = p_bar * 1e5 / (1000 * G)
        out.append((f"In welcher Wassertiefe beträgt der Schweredruck {de(p_bar, 1)} bar?",
                    f"<i>h</i> = <i>p</i> : (<i>ρ</i> · <i>g</i>) = {de(p_bar * 1e5, 0)} : 9 810 = <b>{de(h, 1)} m</b>"))
    for h, a in [(10, 0.03), (300, 0.5)]:
        f = 1025 * G * h * a
        out.append((f"Ein Bullauge (<i>A</i> = {de(a, 2)} m²) eines Tauchboots ist {h} m tief im Meer. Welche Kraft drückt das Wasser darauf?",
                    f"<i>p</i> = 1 025 · 9,81 · {h} = {de(1025 * G * h, 0)} Pa, <i>F</i> = <b>{de(f, 0)} N</b>"))
    out += [
        ("Warum ist eine Staumauer unten dicker als oben?", "Der Schweredruck nimmt mit der <b>Tiefe</b> zu; unten wirken die größten Kräfte."),
        ("Hydrostatisches Paradoxon: Warum ist der Bodendruck in einer schmalen und einer breiten Vase gleich, wenn das Wasser gleich hoch steht?", "Der Schweredruck hängt nur von <b>Tiefe und Dichte</b> ab, nicht von der Form oder Wassermenge."),
        ("Warum können Taucher nicht beliebig tief tauchen?", "Der Druck steigt alle 10 m um etwa <b>1 bar</b>; Lunge, Ohren und Ausrüstung halten das nur begrenzt aus."),
        ("Ein Wasserturm ist 30 m hoch. Welcher Druck herrscht ungefähr unten in der Leitung?", "<i>p</i> = 1 000 · 9,81 · 30 ≈ <b>294 000 Pa ≈ 2,9 bar</b>"),
        ("Erkläre, warum es in Ohren beim Tauchen in 3 m Tiefe drückt, beim Schwimmen an der Oberfläche aber nicht.", "In 3 m Tiefe ist der Wasserdruck um <b>0,3 bar</b> größer als der Druck im Mittelohr; das Trommelfell wird eingedrückt."),
    ]
    assert abs(1000 * G * 30 - 294300) < 1e-6
    return out


for slug, fn in [("auftrieb", _auftrieb), ("druck", _druck), ("hydraulik", _hydraulik), ("luftdruck", _luftdruck), ("schweredruck", _schweredruck)]:
    EXTRA[slug] = {3: fn()}


# a few more tasks where a page was not yet full
EXTRA["druck"][3] += [
    ("Warum tun Schuhe mit Pfennigabsätzen auf dem Fuß eines anderen besonders weh?", "Die Gewichtskraft wirkt auf eine <b>winzige Fläche</b>; der Druck ist riesig."),
    ("Ein Auto (12 000 N) steht auf vier Reifen mit je 150 cm² Auflagefläche. Welcher Druck wirkt auf die Straße?", "<i>p</i> = 12 000 N : 600 cm² = <b>20 N/cm² = 2 bar</b>"),
    ("Begründe, warum man beim Eislaufen auf dünnem Eis besser flach liegt als steht.", "Die Gewichtskraft verteilt sich auf eine <b>größere Fläche</b>; der Druck auf das Eis ist kleiner."),
    ("Eine Gasflasche hat 200 bar. Welche Kraft wirkt auf das Ventil (0,5 cm²)?", "200 bar = 2 000 N/cm², <i>F</i> = 2 000 · 0,5 = <b>1 000 N</b>"),
]
EXTRA["hydraulik"][3] += [
    ("Eine hydraulische Presse soll 50 000 N erzeugen. Der Arbeitskolben hat 250 cm², die Pumpkraft beträgt 400 N. Wie groß muss der Pumpkolben sein?", "<i>A</i>₁ = <i>A</i>₂ · <i>F</i>₁ : <i>F</i>₂ = 250 · 400 : 50 000 = <b>2 cm²</b>"),
    ("Warum wirkt im ganzen Öl einer Hebebühne derselbe Druck?", "Das Öl ist <b>eingeschlossen</b>; der Kolbendruck breitet sich in alle Richtungen gleich aus."),
    ("Bei einer Bremse drückt der Fuß mit 150 N auf einen Kolben von 3 cm². Die Radkolben haben je 12 cm². Wie groß ist die Kraft an jedem Rad?", "<i>F</i> = 150 · 12 : 3 = <b>600 N</b>"),
]
EXTRA["schweredruck"][3] += [
    ("Ein U-Boot ist für 30 bar gebaut. Wie tief kann es höchstens im Meer tauchen (<i>ρ</i> = 1 025 kg/m³)?", "<i>h</i> = 3 000 000 : (1 025 · 9,81) ≈ <b>298 m</b>"),
    ("In welcher Tiefe ist der Schweredruck in Öl (<i>ρ</i> = 900 kg/m³) genauso groß wie in 9 m Wassertiefe?", "900 · <i>h</i> = 1 000 · 9: <b><i>h</i> = 10 m</b>"),
    ("Warum steigt Wasser in verbundenen Gefäßen (z. B. Gießkanne und Ausguss) gleich hoch?", "Gleiche Höhe heißt gleicher <b>Schweredruck</b> am Verbindungspunkt; erst dann herrscht Gleichgewicht."),
    ("Ein Schnorchel ist 35 cm lang. Warum kann man mit einem 2 m langen Schnorchel nicht atmen?", "In 2 m Tiefe drückt das Wasser mit etwa <b>0,2 bar</b> auf den Brustkorb; die Atemmuskeln können dagegen nicht einatmen."),
    ("Erkläre, warum ein Taucher beim Aufsteigen langsam ausatmen muss.", "Der Wasserdruck nimmt ab, die Luft in der Lunge <b>dehnt sich aus</b>; ohne Ausatmen könnte die Lunge verletzt werden."),
    ("Ein Aquarium ist 60 cm hoch. Berechne den Druck am Boden.", "<i>p</i> = 1 000 · 9,81 · 0,6 = <b>5 886 Pa</b>"),
]
EXTRA["endocytose-exocytose"][3] += [
    ("Begründe, warum Endo- und Exocytose nur bei Lebewesen mit Zellmembran ohne starre Hülle (oder an Stellen ohne Zellwand) möglich sind.", "Die Membran muss sich <b>einstülpen und verschmelzen</b> können; eine starre Zellwand verhindert große Vesikel."),
    ("Erkläre, warum Nervenzellen sehr viele synaptische Vesikel bereithalten.", "Bei jedem Signal wird Botenstoff per <b>Exocytose</b> abgegeben; bei schnellen Signalfolgen werden viele Vesikel gebraucht."),
    ("Vergleiche Phagocytose und rezeptorvermittelte Endocytose (Größe der Teilchen, Spezifität).", "Phagocytose: <b>große</b> Teilchen, wenig spezifisch. Rezeptorvermittelt: <b>kleine</b> Moleküle, <b>sehr spezifisch</b>."),
    ("Warum dauert es nach einer Infektion einige Zeit, bis Eiter entsteht?", "Fresszellen müssen erst <b>einwandern</b> und Bakterien per Phagocytose aufnehmen; abgestorbene Fresszellen sammeln sich an."),
]
EXTRA["natrium-kalium-pumpe"][3] += [
    ("Erkläre, warum rote Blutzellen ohne Mitochondrien trotzdem eine arbeitende Na⁺/K⁺-Pumpe haben.", "Sie gewinnen ATP aus der <b>Glykolyse</b>; das reicht für die Pumpe."),
    ("Begründe, warum die Pumpe für das Zellvolumen wichtiger ist als für das Ruhepotential.", "Ohne Pumpe sammeln sich Teilchen innen, <b>Wasser strömt ein</b>, die Zelle platzt; das Potential sinkt nur langsam."),
    ("Ein Forscher misst, dass eine Zelle 300 ATP pro Sekunde für die Pumpe verbraucht. Wie viele Na⁺ befördert sie pro Minute?", "300 · 3 · 60 = <b>54 000 Na⁺</b>"),
    ("Warum steigt bei Fieber der Energieverbrauch des Körpers?", "Viele Prozesse, auch die <b>Pumpen</b>, laufen bei höherer Temperatur schneller und verbrauchen mehr ATP."),
]
EXTRA["symport-antiport"][1] += [
    ("Wie heißt ein Transportprotein, das Teilchen bindet und seine Form ändert?", "<b>Carrier</b>"),
    ("Was ist ein Ionenkanal?", "Ein Protein mit einem <b>offenen Tunnel</b>, durch den Ionen mit dem Gefälle strömen."),
    ("Welcher Energieträger wird bei primär aktivem Transport direkt genutzt?", "<b>ATP</b>"),
]
