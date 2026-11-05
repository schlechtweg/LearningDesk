"""Figure tasks for the worksheets: one graphic per topic to label, complete or draw in.

Every function returns a dict with
  title  short heading of the task
  stars  difficulty mark
  task   (svg, html) for page 1: drawing without solution and the instructions / blank lines
  sol    (svg, html) for page 2: drawing with the solution and the answers
Computed answers are checked with assertions.
"""
import math

MINUS = "−"


def svg(vb, inner, h=None):
    style = f' style="max-height:{h}mm"' if h else ""
    return f'<svg class="fsvg" viewBox="{vb}" xmlns="http://www.w3.org/2000/svg"{style}>{inner}</svg>'


def num(n, x, y):
    return f'<circle class="numc" cx="{x}" cy="{y}" r="8"/><text class="numt" x="{x}" y="{y + 3.6}">{n}</text>'


def lead(x1, y1, x2, y2):
    return f'<line class="lead" x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}"/>'


def labels(items):
    """items: (n, target x, target y, number x, number y) -> leader lines and number circles."""
    return "".join(lead(nx, ny, tx, ty) for _, tx, ty, nx, ny in items) + "".join(num(n, nx, ny) for n, _, _, nx, ny in items)


def blanks(names, cols=2):
    return f'<ol class="lab" style="--lc:{cols}">' + "".join(f'<li><b>{i}</b><span class="blank"></span></li>' for i in range(1, len(names) + 1)) + "</ol>"


def answers(names, cols=2):
    return f'<ol class="lab" style="--lc:{cols}">' + "".join(f'<li><b>{i}</b><span class="lt">{n}</span></li>' for i, n in enumerate(names, 1)) + "</ol>"


def labeling(title, stars, vb, drawing, items, names, instr, extra_task="", extra_sol="", cols=2, h=None):
    assert len(items) == len(names)
    pic = svg(vb, drawing + labels(items), h)
    return {"title": title, "stars": stars,
            "task": (pic, f"<p>{instr}</p>{blanks(names, cols)}{extra_task}"),
            "sol": (pic, f"{answers(names, cols)}{extra_sol}")}


def arrow(x1, y1, x2, y2, cls="arr", head=7):
    a = math.atan2(y2 - y1, x2 - x1)
    p1 = (x2 - head * math.cos(a - 0.45), y2 - head * math.sin(a - 0.45))
    p2 = (x2 - head * math.cos(a + 0.45), y2 - head * math.sin(a + 0.45))
    return (f'<path class="{cls}" d="M{x1:.1f} {y1:.1f} L{x2:.1f} {y2:.1f} M{p1[0]:.1f} {p1[1]:.1f} '
            f'L{x2:.1f} {y2:.1f} L{p2[0]:.1f} {p2[1]:.1f}"/>')


def text(x, y, t, cls="ft", anchor="middle"):
    return f'<text class="{cls}" x="{x}" y="{y}" text-anchor="{anchor}">{t}</text>'


# ------------------------------------------------------------------ biology
def auge():
    cx, cy = 250, 160

    def arc(r, a):
        p = lambda d: (cx + r * math.cos(math.radians(d)), cy + r * math.sin(math.radians(d)))
        (x1, y1), (x2, y2) = p(-a), p(a)
        return f"M{x1:.1f} {y1:.1f} A{r} {r} 0 1 1 {x2:.1f} {y2:.1f}"
    pu = 13
    d = (f'<circle cx="268" cy="160" r="84" fill="#e3f0f8"/>'
         f'<path d="{arc(118, 148)}" fill="none" stroke="#cfc8ba" stroke-width="8"/>'
         f'<path d="{arc(110, 146)}" fill="none" stroke="#a8687a" stroke-width="5"/>'
         f'<path d="{arc(103, 144)}" fill="none" stroke="#e39a83" stroke-width="5"/>'
         f'<path d="M150 98 A81 81 0 0 0 150 222" fill="none" stroke="#8fbcdc" stroke-width="5"/>'
         f'<path d="M148 102 A78 78 0 0 0 148 218 Z" fill="#e3f0f8"/>'
         f'<rect x="154" y="102" width="9" height="{58 - pu}" fill="#8a6a3e"/><rect x="154" y="{160 + pu}" width="9" height="{58 - pu}" fill="#8a6a3e"/>'
         f'<ellipse cx="182" cy="160" rx="13" ry="33" fill="#d7e8f5" stroke="#2f7fb8" stroke-width="1.5"/>'
         f'<ellipse cx="168" cy="102" rx="7" ry="10" fill="#c27a72"/><ellipse cx="168" cy="218" rx="7" ry="10" fill="#c27a72"/>'
         f'<path d="M171 111 L182 128 M171 209 L182 192" stroke="#888" stroke-width="1.5"/>'
         f'<path d="M356 176 Q395 178 450 182 L450 210 Q395 206 354 198 Z" fill="#f2d98f" stroke="#b8962e" stroke-width="1.2"/>'
         f'<circle cx="351" cy="186" r="6" fill="#f6dfa0" stroke="#b8962e" stroke-width="1.2"/>')
    items = [(1, 124, 125, 92, 70), (2, 158, 110, 150, 52), (3, 184, 130, 205, 52), (4, 170, 95, 255, 52),
             (5, 280, 170, 280, 170), (6, 330, 98, 380, 60), (7, 333, 244, 380, 270), (8, 430, 200, 440, 240), (9, 351, 186, 400, 150), (10, 155, 160, 92, 160)]
    names = ["Hornhaut", "Iris (Regenbogenhaut)", "Linse", "Ziliarmuskel", "Glaskörper", "Netzhaut", "Lederhaut", "Sehnerv", "Blinder Fleck", "Pupille"]
    return labeling("Beschrifte das Auge", "★☆☆", "80 40 380 245", d, items, names,
                    "Schreibe die Namen der nummerierten Teile auf.",
                    extra_task='<p class="q">Welcher Teil stellt das Bild scharf? Wo entsteht das Bild? <span class="blank wide"></span></p>',
                    extra_sol='<p class="q">Die <b>Linse</b> (mit dem Ziliarmuskel) stellt scharf; das Bild entsteht auf der <b>Netzhaut</b>.</p>')


def nerven():
    line, soma = "#8e5aa0", "#ead3f0"
    seg, gaps = [140, 192, 244, 296, 348], [188, 240, 292, 344]
    dend = "M52 132 L28 100 L12 92 M28 100 L22 78 M50 166 L24 196 L10 200 M24 196 L20 220 M70 122 L60 88 L46 70 M60 88 L70 66 M72 178 L62 214 L50 232 M62 214 L76 236"
    d = (f'<path d="{dend}" fill="none" stroke="{line}" stroke-width="4" stroke-linecap="round"/>'
         f'<path d="M112 150 H402" stroke="{line}" stroke-width="5"/>'
         + "".join(f'<rect x="{x}" y="139" width="44" height="22" rx="10" fill="#f3e2a8" stroke="#b8962e" stroke-width="1.5"/>' for x in seg)
         + f'<ellipse cx="80" cy="150" rx="34" ry="30" fill="{soma}" stroke="{line}" stroke-width="2"/><circle cx="78" cy="148" r="12" fill="{line}"/>'
         + f'<path d="M402 150 L432 114 M402 150 L444 150 M402 150 L432 186" stroke="{line}" stroke-width="4"/>'
         + "".join(f'<circle cx="{x}" cy="{y}" r="7" fill="{soma}" stroke="{line}" stroke-width="2"/>' for x, y in [(432, 114), (444, 150), (432, 186)]))
    items = [(1, 46, 72, 40, 30), (2, 100, 128, 120, 85), (3, 80, 150, 80, 255), (4, 126, 152, 140, 230), (5, 210, 140, 210, 95), (6, 292, 155, 292, 230), (7, 438, 108, 440, 70)]
    names = ["Dendriten", "Zellkörper", "Zellkern", "Axon (Nervenfaser)", "Myelinscheide", "Schnürring", "Endknöpfchen"]
    return labeling("Beschrifte die Nervenzelle", "★☆☆", "0 15 460 255", d + arrow(170, 268, 330, 268, "arr thin") + text(250, 262, "Richtung des Signals", "ft small"), items, names,
                    "Schreibe die Namen der nummerierten Teile auf.",
                    extra_task='<p class="q">Welche Aufgabe hat Teil 5? <span class="blank wide"></span></p>',
                    extra_sol='<p class="q">Die <b>Myelinscheide</b> isoliert das Axon; das Signal springt von Schnürring zu Schnürring und ist dadurch schneller.</p>')


def osmose():
    d = ('<rect x="40" y="20" width="220" height="150" rx="10" fill="#f4f8ef" stroke="#4a7a1e" stroke-width="6"/>'
         + "".join(f'<circle cx="{x}" cy="{y}" r="2.2" fill="#2f7fb8"/>' for x, y in [(55, 40), (245, 40), (55, 150), (245, 150), (60, 95), (240, 100), (150, 33), (150, 160)])
         + '<path d="M80 52 C120 40 190 44 225 60 C238 80 236 120 222 136 C190 150 110 152 82 138 C68 118 68 70 80 52 Z" fill="#e3f1cf" stroke="#2f6b1a" stroke-width="2"/>'
         '<ellipse cx="150" cy="96" rx="48" ry="26" fill="#cfe4f3" stroke="#2f7fb8" stroke-width="1.5"/>'
         '<circle cx="207" cy="76" r="11" fill="#9c7bb5"/>')
    items = [(1, 42, 60, 14, 40), (2, 74, 115, 14, 120), (3, 150, 96, 150, 192), (4, 207, 76, 290, 40), (5, 100, 70, 100, 6), (6, 245, 110, 290, 120)]
    names = ["Zellwand", "Zellmembran", "Vakuole", "Zellkern", "Cytoplasma", "Außenlösung"]
    return labeling("Pflanzenzelle in einer Lösung", "★★☆", "0 -4 304 206", d, items, names,
                    "Die Zelle liegt in einer Salzlösung. Beschrifte die Teile.",
                    extra_task='<p class="q">Ist die Außenlösung hypo-, iso- oder hypertonisch? In welche Richtung strömt das Wasser? Wie heißt der Vorgang? <span class="blank wide"></span><span class="blank wide"></span></p>',
                    extra_sol='<p class="q"><b>Hypertonisch</b>: Wasser strömt <b>aus der Zelle heraus</b>, das Zellinnere löst sich von der Zellwand: <b>Plasmolyse</b>.</p>')


def nak():
    heads = "".join(f'<circle cx="{x}" cy="70" r="4" fill="#cfd6dd"/><circle cx="{x}" cy="104" r="4" fill="#cfd6dd"/>' for x in range(6, 300, 10))
    d = (f'<rect x="0" y="70" width="300" height="34" fill="#eef1f4"/>{heads}'
         '<rect x="125" y="56" width="50" height="62" rx="12" fill="#f3dbe6" stroke="#8e2c5c" stroke-width="2"/>'
         + arrow(140, 150, 140, 22, "arr na") + arrow(160, 22, 160, 150, "arr k")
         + text(118, 145, "Na⁺", "ft na", "end") + text(182, 30, "K⁺", "ft k", "start")
         + '<circle cx="215" cy="125" r="13" fill="#fdf1d6" stroke="#b8962e" stroke-width="1.5"/>' + arrow(203, 119, 178, 104, "arr thin"))
    items = [(1, 40, 30, 22, 30), (2, 40, 145, 22, 145), (3, 120, 22, 100, 22), (4, 182, 140, 205, 150), (5, 215, 125, 255, 125), (6, 150, 87, 255, 60)]
    names = ["außen (Zellumgebung)", "innen (Cytoplasma)", "3 Na⁺ hinaus", "2 K⁺ hinein", "ATP (wird zu ADP + P)", "Na⁺/K⁺-Pumpe: primär aktiver Antiport"]
    return labeling("Die Pumpe bei der Arbeit", "★★☆", "0 8 300 160", d, items, names,
                    "Ergänze: 1 und 2 die Seiten, 3 und 4 wie viele Ionen in welche Richtung, 5 den Energieträger, 6 Name und Transportart.", cols=1)


def symport():
    def panel(ox, arrows):
        s = f'<rect x="{ox}" y="45" width="90" height="28" fill="#eef1f4"/><rect x="{ox + 25}" y="35" width="40" height="48" rx="10" fill="#dcefe4" stroke="#2f7d5b" stroke-width="2"/>'
        for x, down, shape in arrows:
            y1, y2 = (12, 108) if down else (108, 12)
            s += arrow(ox + x, y1, ox + x, y2, "arr")
            sx, sy = ox + x + 9, (20 if down else 100)
            s += (f'<circle cx="{sx}" cy="{sy}" r="5" fill="#d0782a"/>' if shape == "c" else f'<path d="M{sx - 5} {sy + 4} L{sx} {sy - 5} L{sx + 5} {sy + 4} Z" fill="#2f7fb8"/>')
        return s
    d = (panel(5, [(45, True, "c")]) + panel(105, [(37, True, "c"), (53, True, "t")]) + panel(205, [(37, True, "c"), (53, False, "t")])
         + text(50, 128, "A", "ft big") + text(150, 128, "B", "ft big") + text(250, 128, "C", "ft big") + text(2, 10, "außen", "ft small", "start"))
    pic = svg("0 0 300 135", d)
    names = ["Uniport (z. B. GLUT)", "Symport (z. B. Na⁺-Glucose-Symporter)", "Antiport (z. B. Na⁺/K⁺-Pumpe)"]
    task = ('<p>Benenne die Transportart von A, B und C und nenne je ein Beispiel.</p>'
            '<ol class="lab abc" style="--lc:1">' + "".join(f'<li><b>{c}</b><span class="blank"></span></li>' for c in "ABC") + '</ol>'
            '<p class="q">Was bedeutet „sekundär aktiv“? <span class="blank wide"></span></p>')
    sol = ('<ol class="lab abc" style="--lc:1">' + "".join(f'<li><b>{c}</b><span class="lt">{n}</span></li>' for c, n in zip("ABC", names)) + '</ol>'
           '<p class="q">Die Energie stammt aus dem <b>Gefälle eines anderen Stoffs</b> (meist Na⁺ oder H⁺), nicht direkt aus ATP.</p>')
    return {"title": "Transportarten erkennen", "stars": "★☆☆", "task": (pic, task), "sol": (pic, sol)}


def endo():
    mem = lambda p: f'<path d="{p}" fill="none" stroke="#7a3f8f" stroke-width="5"/><path d="{p}" fill="none" stroke="#fff" stroke-width="1.6"/>'
    dip = "M0 40 H25 C33 40 30 64 40 64 C50 64 47 40 55 40 H80"
    A = mem("M0 40 H16 C24 40 20 16 29 10 C34 7 38 11 35 17 C32 25 32 34 40 34 C48 34 48 25 45 17 C42 11 46 7 51 10 C60 16 56 40 64 40 H80") + '<rect x="29" y="14" width="22" height="13" rx="6" fill="#3d8a4c"/>'
    B = mem(dip) + "".join(f'<circle cx="{x}" cy="{y}" r="2.6" fill="#2f7fb8"/>' for x, y in [(36, 54), (45, 56), (40, 46), (12, 22), (62, 18), (28, 12), (70, 30)])
    C = (mem(dip) + "".join(f'<path d="M{x} {y} v-6 M{x - 3} {y - 9} L{x} {y - 6} L{x + 3} {y - 9}" stroke="#8e44ad" stroke-width="1.4" fill="none"/>' for x, y in [(33, 56), (40, 60), (47, 56)])
         + "".join(f'<circle cx="{x}" cy="{y}" r="4" fill="#d9a21b"/>' for x, y in [(33, 44), (40, 49), (47, 44), (14, 20)])
         + "".join(f'<line x1="{x}" y1="{y}" x2="{x + dx}" y2="{y + dy}" stroke="#8e44ad" stroke-width="1.6"/>' for x, y, dx, dy in [(30, 64, -2, 5), (40, 69, 0, 5), (50, 64, 2, 5), (27, 56, -4, 3), (53, 56, 4, 3)]))
    D = (mem("M0 40 H30 C35 40 33 44 31 48 C26 56 28 74 40 74 C52 74 54 56 49 48 C47 44 45 40 50 40 H80")
         + "".join(f'<circle cx="{x}" cy="{y}" r="3" fill="#8e44ad"/>' for x, y in [(36, 64), (45, 60), (40, 22)]) + arrow(40, 44, 40, 30, "arr thin")
         + '<path d="M10 110 Q25 100 40 110 Q55 100 70 110" fill="none" stroke="#c4561c" stroke-width="3"/>')
    d = "".join(f'<g transform="translate({i * 84 + 4} 0)"><rect x="0" y="0" width="80" height="40" fill="#f3ecf6"/>{p}{text(40, 132, "ABCD"[i], "ft big")}</g>' for i, p in enumerate([A, B, C, D]))
    pic = svg("0 0 340 138", d + text(4, 9, "außen", "ft small", "start"))
    names = ["Phagocytose", "Pinocytose", "rezeptorvermittelte Endocytose", "Exocytose"]
    task = ('<p>Benenne die vier Vorgänge. Bei D ist unten der Golgi-Apparat angedeutet.</p>'
            '<ol class="lab abc" style="--lc:2">' + "".join(f'<li><b>{c}</b><span class="blank"></span></li>' for c in "ABCD") + '</ol>'
            '<p class="q">Woran erkennst du C? <span class="blank wide"></span></p>')
    sol = ('<ol class="lab abc" style="--lc:2">' + "".join(f'<li><b>{c}</b><span class="lt">{n}</span></li>' for c, n in zip("ABCD", names)) + '</ol>'
           '<p class="q">C: Stoffe binden an <b>Rezeptoren</b>, unter der Mulde liegt eine <b>Clathrin</b>-Hülle.</p>')
    return {"title": "Vorgänge erkennen", "stars": "★★☆", "task": (pic, task), "sol": (pic, sol)}


# ------------------------------------------------------------------ mathematics
def grid(ox, oy, u, xr, yr):
    s = ""
    for i in range(xr[0], xr[1] + 1):
        s += f'<line class="gl" x1="{ox + i * u}" y1="{oy - yr[1] * u}" x2="{ox + i * u}" y2="{oy - yr[0] * u}"/>'
    for j in range(yr[0], yr[1] + 1):
        s += f'<line class="gl" x1="{ox + xr[0] * u}" y1="{oy - j * u}" x2="{ox + xr[1] * u}" y2="{oy - j * u}"/>'
    s += arrow(ox + xr[0] * u, oy, ox + xr[1] * u + 10, oy, "arr thin") + arrow(ox, oy - yr[0] * u, ox, oy - yr[1] * u - 10, "arr thin")
    for i in range(xr[0], xr[1] + 1):
        if i: s += text(ox + i * u, oy + 12, str(i).replace("-", MINUS), "ft tiny")
    for j in range(yr[0], yr[1] + 1):
        if j: s += text(ox - 6, oy - j * u + 3, str(j).replace("-", MINUS), "ft tiny", "end")
    return s


def plot(f, ox, oy, u, x0, x1, ymax, cls):
    pts, n = [], 120
    for k in range(n + 1):
        x = x0 + (x1 - x0) * k / n
        y = f(x)
        if abs(y) <= ymax:
            pts.append(f"{ox + x * u:.1f} {oy - y * u:.1f}")
    return f'<path class="{cls}" d="M{" L".join(pts)}"/>'


def ableiten():
    f = lambda x: x ** 3 / 3 - x
    fp = lambda x: x ** 2 - 1
    assert abs(f(-1) - 2 / 3) < 1e-12 and fp(1) == 0 and fp(-1) == 0
    ox, oy, u = 120, 100, 28
    base = grid(ox, oy, u, (-3, 3), (-3, 3)) + plot(f, ox, oy, u, -3, 3, 3.3, "fg") + text(ox + 2.45 * u, oy - 2.9 * u, "f", "ft it")
    sol = base + plot(fp, ox, oy, u, -3, 3, 3.3, "fs") + text(ox - 2.15 * u, oy - 2.9 * u, "f′", "ft it sol") \
        + f'<circle class="pt" cx="{ox - u}" cy="{oy - 2 / 3 * u}" r="3.5"/><circle class="pt" cx="{ox + u}" cy="{oy + 2 / 3 * u}" r="3.5"/>'
    task = ('<p>Der Graph zeigt <i>f</i>. Markiere Hoch- und Tiefpunkt und skizziere den Graphen der Ableitung <i>f</i>′ in dasselbe Koordinatensystem.</p>'
            '<p class="q">Wo hat <i>f</i>′ Nullstellen? Warum? <span class="blank wide"></span><span class="blank wide"></span></p>')
    soltxt = ('<p class="q">Hochpunkt H(−1 | ⅔), Tiefpunkt T(1 | −⅔). An diesen Stellen ist die Steigung 0, also hat <i>f</i>′ dort <b>Nullstellen</b> (<i>x</i> = −1 und <i>x</i> = 1). '
              'Wo <i>f</i> steigt, ist <i>f</i>′ positiv, wo <i>f</i> fällt, negativ. Hier: <i>f</i>′(<i>x</i>) = <i>x</i>² − 1.</p>')
    return {"title": "Grafisch ableiten", "stars": "★★☆", "task": (svg("0 0 250 200", base), task), "sol": (svg("0 0 250 200", sol), soltxt)}


def binom():
    def fig(show):
        x0, y0, a, b = 30, 22, 100, 50
        s = (f'<rect class="o" x="{x0}" y="{y0}" width="{a}" height="{a}" fill="#e2eef4"/><rect class="o" x="{x0 + a}" y="{y0}" width="{b}" height="{a}" fill="#f5e7d6"/>'
             f'<rect class="o" x="{x0}" y="{y0 + a}" width="{a}" height="{b}" fill="#f5e7d6"/><rect class="o" x="{x0 + a}" y="{y0 + a}" width="{b}" height="{b}" fill="#e6f0dc"/>'
             + text(x0 + a / 2, y0 - 6, "a", "ft it") + text(x0 + a + b / 2, y0 - 6, "b", "ft it") + text(x0 - 8, y0 + a / 2 + 4, "a", "ft it") + text(x0 - 8, y0 + a + b / 2 + 4, "b", "ft it"))
        vals = ["a²", "a·b", "a·b", "b²"] if show else ["?"] * 4
        for (cx, cy), v in zip([(x0 + a / 2, y0 + a / 2), (x0 + a + b / 2, y0 + a / 2), (x0 + a / 2, y0 + a + b / 2), (x0 + a + b / 2, y0 + a + b / 2)], vals):
            s += text(cx, cy + 5, v, "ft it big" + (" sol" if show else ""))
        return svg("0 0 200 180", s)
    task = ('<p>Das große Quadrat hat die Seitenlänge <i>a</i> + <i>b</i>. Trage die Flächeninhalte der vier Teilflächen ein.</p>'
            '<p class="q">Schreibe die Formel für den Flächeninhalt des großen Quadrats auf: <span class="blank wide"></span></p>'
            '<p class="q">Welche Formel ist das? <span class="blank wide"></span></p>')
    sol = '<p class="q">(<i>a</i> + <i>b</i>)² = <i>a</i>² + <i>ab</i> + <i>ab</i> + <i>b</i>² = <b><i>a</i>² + 2<i>ab</i> + <i>b</i>²</b>: die <b>1. binomische Formel</b>.</p>'
    return {"title": "Binomische Formel am Quadrat", "stars": "★☆☆", "task": (fig(False), task), "sol": (fig(True), sol)}


def ausmult():
    # (x + 4)(x + 2) = x^2 + 6x + 8
    for x in range(-5, 6):
        assert (x + 4) * (x + 2) == x * x + 6 * x + 8

    def fig(show):
        x0, y0, wx, w4, hx, h2 = 30, 22, 100, 45, 80, 32
        s = (f'<rect class="o" x="{x0}" y="{y0}" width="{wx}" height="{hx}" fill="#e2eef4"/><rect class="o" x="{x0 + wx}" y="{y0}" width="{w4}" height="{hx}" fill="#f5e7d6"/>'
             f'<rect class="o" x="{x0}" y="{y0 + hx}" width="{wx}" height="{h2}" fill="#f5e7d6"/><rect class="o" x="{x0 + wx}" y="{y0 + hx}" width="{w4}" height="{h2}" fill="#e6f0dc"/>'
             + text(x0 + wx / 2, y0 - 6, "x", "ft it") + text(x0 + wx + w4 / 2, y0 - 6, "4", "ft") + text(x0 - 8, y0 + hx / 2 + 4, "x", "ft it") + text(x0 - 8, y0 + hx + h2 / 2 + 4, "2", "ft"))
        vals = ["x²", "4x", "2x", "8"] if show else ["?"] * 4
        for (cx, cy), v in zip([(x0 + wx / 2, y0 + hx / 2), (x0 + wx + w4 / 2, y0 + hx / 2), (x0 + wx / 2, y0 + hx + h2 / 2), (x0 + wx + w4 / 2, y0 + hx + h2 / 2)], vals):
            s += text(cx, cy + 5, v, "ft it big" + (" sol" if show else ""))
        return svg("0 0 200 150", s)
    task = ('<p>Das Rechteck hat die Seiten <i>x</i> + 4 und <i>x</i> + 2. Trage die Flächeninhalte der vier Teilrechtecke ein.</p>'
            '<p class="q">Gesamtfläche als Summe (zusammengefasst): (<i>x</i> + 4)(<i>x</i> + 2) = <span class="blank wide"></span></p>')
    sol = '<p class="q">(<i>x</i> + 4)(<i>x</i> + 2) = <i>x</i>² + 4<i>x</i> + 2<i>x</i> + 8 = <b><i>x</i>² + 6<i>x</i> + 8</b></p>'
    return {"title": "Flächenmodell", "stars": "★☆☆", "task": (fig(False), task), "sol": (fig(True), sol)}


def terme():
    # perimeters, checked by substitution
    for x in range(0, 5):
        assert 3 * x + (2 * x + 5) + (x + 1) == 6 * x + 6
    for a in range(0, 4):
        for b in range(0, 4):
            assert 2 * (2 * a + b) + 2 * a == 6 * a + 2 * b
    d = ('<path class="o" d="M20 140 L150 140 L70 30 Z" fill="#e2eef4"/>' + text(85, 156, "3x", "ft it") + text(28, 85, "x + 1", "ft it") + text(130, 80, "2x + 5", "ft it")
         + '<rect class="o" x="190" y="60" width="110" height="60" fill="#f5e7d6"/>' + text(245, 54, "2a + b", "ft it") + text(310, 94, "a", "ft it", "start"))
    pic = svg("0 15 330 150", d)
    task = ('<p>Die Figuren sind nicht maßstabsgetreu. Stelle für beide Figuren einen Term für den <b>Umfang</b> auf und vereinfache ihn so weit wie möglich.</p>'
            '<p class="q">Dreieck: <i>u</i> = <span class="blank wide"></span></p><p class="q">Rechteck: <i>u</i> = <span class="blank wide"></span></p>'
            '<p class="q">Berechne den Umfang des Dreiecks für <i>x</i> = 4: <span class="blank"></span></p>')
    sol = ('<p class="q">Dreieck: 3<i>x</i> + (2<i>x</i> + 5) + (<i>x</i> + 1) = <b>6<i>x</i> + 6</b></p>'
           '<p class="q">Rechteck: 2 · (2<i>a</i> + <i>b</i>) + 2 · <i>a</i> = <b>6<i>a</i> + 2<i>b</i></b></p><p class="q">Für <i>x</i> = 4: 6 · 4 + 6 = <b>30</b></p>')
    assert 6 * 4 + 6 == 30
    return {"title": "Umfang als Term", "stars": "★★☆", "task": (pic, task), "sol": (pic, sol)}


def gleichungen():
    assert 3 * 3 + 4 == 3 + 10
    bag = lambda x, y: f'<path d="M{x - 11} {y} Q{x - 13} {y - 18} {x - 4} {y - 22} L{x + 4} {y - 22} Q{x + 13} {y - 18} {x + 11} {y} Z" fill="#e8d3a8" stroke="#8a6a3e" stroke-width="1.5"/>{text(x, y - 7, "x", "ft it")}'
    wt = lambda x, y, v: f'<rect x="{x - 14}" y="{y - 22}" width="28" height="22" rx="3" fill="#9aa3ad" stroke="#4a525b" stroke-width="1.5"/>{text(x, y - 7, v, "ft white")}'
    # left pan holds 3 bags and a 4 kg weight, right pan 1 bag and a 10 kg weight
    d = ('<path d="M150 72 L136 160 L164 160 Z" fill="#c9d1d8" stroke="#4a525b" stroke-width="1.5"/><rect class="o" x="20" y="66" width="260" height="7" fill="#c9d1d8"/>'
         '<path class="o" d="M70 73 L36 120 M70 73 L118 120 M230 73 L198 120 M230 73 L262 120" fill="none"/><rect class="o" x="24" y="120" width="104" height="5" fill="#c9d1d8"/><rect class="o" x="188" y="120" width="84" height="5" fill="#c9d1d8"/>'
         + bag(38, 120) + bag(61, 120) + bag(84, 120) + wt(111, 120, "4") + bag(210, 120) + wt(245, 120, "10")
         + text(150, 185, "Gewichte in kg", "ft small"))
    pic = svg("0 40 300 150", d)
    task = ('<p>Die Waage ist im Gleichgewicht. Alle Säckchen wiegen gleich viel (<i>x</i> kg).</p>'
            '<p class="q">Gleichung: <span class="blank wide"></span></p><p class="q">Lösung mit Rechenweg und Probe: <span class="blank wide"></span><span class="blank wide"></span></p>')
    sol = ('<p class="q">3<i>x</i> + 4 = <i>x</i> + 10 &nbsp;| − <i>x</i> &nbsp;→&nbsp; 2<i>x</i> + 4 = 10 &nbsp;| − 4 &nbsp;→&nbsp; 2<i>x</i> = 6 &nbsp;| : 2 &nbsp;→&nbsp; <b><i>x</i> = 3</b></p>'
           '<p class="q">Probe: 3 · 3 + 4 = 13 und 3 + 10 = 13 ✓. Ein Säckchen wiegt <b>3 kg</b>.</p>')
    return {"title": "Gleichung an der Waage", "stars": "★☆☆", "task": (pic, task), "sol": (pic, sol)}


def numberline(y, marks=None):
    """Number line from -5 to 5 at height y. marks: list of drawing snippets."""
    ox, u = 25, 25
    s = arrow(ox - 10, y, ox + 10 * u + 15, y, "arr thin")
    for i in range(-5, 6):
        x = ox + (i + 5) * u
        s += f'<line class="o" x1="{x}" y1="{y - 4}" x2="{x}" y2="{y + 4}"/>' + text(x, y + 16, str(i).replace("-", MINUS), "ft tiny")
    return s


def nl_x(v):
    return 25 + (v + 5) * 25


def ray(y, a, closed, right):
    x = nl_x(a)
    end = nl_x(5) + 12 if right else nl_x(-5) - 12
    return (f'<line class="solline" x1="{x}" y1="{y}" x2="{end}" y2="{y}"/>' + arrow(end - (6 if right else -6), y, end, y, "arr sol")
            + f'<circle class="{"dotc" if closed else "doto"}" cx="{x}" cy="{y}" r="5"/>')


def ungleichungen():
    rows = [("a", "<i>x</i> &gt; 2", 30), ("b", "<i>x</i> ≤ −1", 85), ("c", "−2 &lt; <i>x</i> ≤ 3", 140)]
    base = "".join(numberline(y) + text(0, y - 12, f"{c})", "ft", "start") for c, _, y in rows)
    sol = (base + ray(30, 2, False, True) + ray(85, -1, True, False)
           + f'<line class="solline" x1="{nl_x(-2)}" y1="140" x2="{nl_x(3)}" y2="140"/><circle class="doto" cx="{nl_x(-2)}" cy="140" r="5"/><circle class="dotc" cx="{nl_x(3)}" cy="140" r="5"/>')
    task = ('<p>Markiere die Lösungsmengen auf den Zahlenstrahlen. Zeichne ● für „Zahl gehört dazu“ und ○ für „gehört nicht dazu“.</p>'
            '<ol class="lab abc" style="--lc:1">' + "".join(f'<li><b>{c})</b><span class="lt">{t}</span></li>' for c, t, _ in rows) + '</ol>'
            '<p class="q">Nenne zu c) zwei ganze Zahlen, die dazugehören, und eine, die nicht dazugehört: <span class="blank wide"></span></p>')
    soltxt = ('<p class="q">a) offener Kreis bei 2, alles rechts davon. b) ausgefüllter Kreis bei −1, alles links davon. c) offener Kreis bei −2, ausgefüllter bei 3, dazwischen.</p>'
              '<p class="q">c) z. B. <b>0 und 3</b> gehören dazu, <b>−2</b> nicht.</p>')
    return {"title": "Lösungsmengen am Zahlenstrahl", "stars": "★☆☆", "task": (svg("-4 10 300 150", base), task), "sol": (svg("-4 10 300 150", sol), soltxt)}


def bruchterme():
    cross = lambda v, y: f'<path class="solx" d="M{nl_x(v) - 6} {y - 6} L{nl_x(v) + 6} {y + 6} M{nl_x(v) - 6} {y + 6} L{nl_x(v) + 6} {y - 6}"/>'
    rows = [("a", 35), ("b", 95)]
    base = "".join(numberline(y) + text(0, y - 14, f"{c})", "ft", "start") for c, y in rows)
    sol = base + cross(4, 35) + cross(0, 95) + cross(-2, 95)
    # check: the denominators are zero exactly at the marked values
    assert all((v - 4 == 0) == (v == 4) for v in range(-5, 6))
    assert [v for v in range(-5, 6) if v * (v + 2) == 0] == [-2, 0]
    fr = lambda n, d: f'<span class="fr"><span>{n}</span><span>{d}</span></span>'
    task = ('<p>Markiere auf dem Zahlenstrahl mit ✗ alle Zahlen, die man <b>nicht</b> einsetzen darf, und gib die Definitionsmenge an.</p>'
            f'<ol class="lab abc" style="--lc:2"><li><b>a)</b><span class="lt m">{fr("3", "<i>x</i> − 4")}</span></li><li><b>b)</b><span class="lt m">{fr("<i>x</i> + 1", "<i>x</i>(<i>x</i> + 2)")}</span></li></ol>'
            '<p class="q">a) D = <span class="blank"></span> &nbsp; b) D = <span class="blank"></span></p>')
    soltxt = ('<p class="q">a) Der Nenner wird 0 für <i>x</i> = 4: <b>D = ℚ \\ {4}</b></p>'
              '<p class="q">b) <i>x</i>(<i>x</i> + 2) = 0 für <i>x</i> = 0 oder <i>x</i> = −2: <b>D = ℚ \\ {−2; 0}</b></p>')
    return {"title": "Definitionslücken markieren", "stars": "★★☆", "task": (svg("-4 15 300 110", base), task), "sol": (svg("-4 15 300 110", sol), soltxt)}


# ------------------------------------------------------------------ physics
def druck():
    p = 200 / (4 / 10000)
    assert abs(p - 500000) < 1e-6
    d = ('<rect x="60" y="70" width="120" height="110" fill="#cfe4f3"/><path class="o thick" d="M60 20 V180 H180 V20" fill="none"/>'
         '<rect x="62" y="58" width="116" height="12" fill="#9aa3ad" stroke="#4a525b"/><rect x="114" y="18" width="12" height="40" fill="#9aa3ad" stroke="#4a525b"/>'
         + arrow(120, -8, 120, 14, "arr force")
         + "".join(arrow(120, 125, 120 + 32 * math.cos(math.radians(a)), 125 + 32 * math.sin(math.radians(a)), "arr thin") for a in range(0, 360, 45)))
    items = [(1, 128, 2, 210, 0), (2, 175, 64, 210, 60), (3, 80, 160, 210, 150), (4, 150, 110, 210, 105)]
    names = ["Kraft <i>F</i>", "Kolben (Fläche <i>A</i>)", "eingeschlossene Flüssigkeit", "Druck wirkt in alle Richtungen gleich"]
    return labeling("Kolbendruck", "★★☆", "40 -15 200 205", d, items, names,
                    "Beschrifte die nummerierten Teile.", cols=1,
                    extra_task='<p class="q">Die Kraft beträgt 200 N, die Kolbenfläche 4 cm². Berechne den Druck in Pa und bar. <span class="blank wide"></span></p>',
                    extra_sol='<p class="q">4 cm² = 0,0004 m². <i>p</i> = <i>F</i> : <i>A</i> = 200 N : 0,0004 m² = <b>500 000 Pa = 5 bar</b></p>')


def hydraulik():
    f2 = 100 * 50 / 2
    assert f2 == 2500
    d = ('<rect x="30" y="90" width="40" height="80" fill="#f2d98f"/><rect x="70" y="150" width="70" height="20" fill="#f2d98f"/><rect x="140" y="90" width="80" height="80" fill="#f2d98f"/>'
         '<path class="o thick" d="M30 40 V180 H230 V60 M70 40 V150 H140 V60" fill="none"/>'
         '<rect x="31" y="80" width="38" height="10" fill="#9aa3ad" stroke="#4a525b"/><rect x="141" y="80" width="88" height="10" fill="#9aa3ad" stroke="#4a525b"/>'
         '<rect x="160" y="55" width="50" height="25" rx="4" fill="#c27a72" stroke="#7a2f29"/>' + text(185, 72, "Last", "ft white")
         + arrow(50, 40, 50, 76, "arr force") + arrow(185, 52, 185, 22, "arr force2"))
    items = [(1, 40, 85, 10, 70), (2, 150, 85, 120, 50), (3, 100, 160, 100, 200), (4, 56, 52, 10, 30), (5, 192, 30, 245, 25)]
    names = ["Pumpkolben (klein, Fläche <i>A</i>₁)", "Arbeitskolben (groß, Fläche <i>A</i>₂)", "Hydrauliköl", "Kraft <i>F</i>₁", "Kraft <i>F</i>₂"]
    return labeling("Hydraulische Hebebühne", "★★☆", "0 10 260 200", d, items, names,
                    "Beschrifte die nummerierten Teile.", cols=1,
                    extra_task='<p class="q"><i>A</i>₁ = 2 cm², <i>A</i>₂ = 50 cm², <i>F</i>₁ = 100 N. Berechne <i>F</i>₂. <span class="blank wide"></span></p>',
                    extra_sol='<p class="q"><i>F</i>₂ = <i>F</i>₁ · <i>A</i>₂ : <i>A</i>₁ = 100 N · 50 : 2 = <b>2 500 N</b></p>')


def schweredruck():
    top, ground, x0 = 20, 270, 120
    holes = [55, 95, 135]
    ranges = [0.6 * 2 * math.sqrt((y - top) * (ground - y)) for y in holes]
    assert ranges[0] < ranges[1] < ranges[2]  # the deepest jet reaches farthest at ground level
    base = ('<rect x="40" y="20" width="80" height="140" fill="#cfe4f3"/><path class="o thick" d="M40 8 V160 H120 V8" fill="none"/>'
            '<path class="o" d="M50 160 V270 M110 160 V270" fill="none"/><line class="o" x1="0" y1="270" x2="300" y2="270"/>'
            + "".join(f'<circle cx="{x0}" cy="{y}" r="3.5" fill="#fff" stroke="#1b2228" stroke-width="1.5"/>{text(x0 - 10, y + 4, n, "ft small", "end")}' for y, n in zip(holes, "ABC"))
            + text(80, 16, "Wasser", "ft small"))
    jets = "".join(f'<path class="jet" d="M{x0} {y} Q{x0 + r / 2:.1f} {y} {x0 + r:.1f} {ground}"/>' for y, r in zip(holes, ranges))
    task = ('<p>Aus den drei gleich großen Löchern A, B und C spritzt Wasser. Zeichne die drei Wasserstrahlen ein.</p>'
            '<p class="q">Begründe, welcher Strahl am stärksten ist: <span class="blank wide"></span><span class="blank wide"></span></p>'
            '<p class="q">Berechne den Schweredruck in 1,2 m Tiefe (<i>g</i> = 9,81 N/kg): <span class="blank wide"></span></p>')
    p = 1000 * 9.81 * 1.2
    assert abs(p - 11772) < 1e-6
    soltxt = ('<p class="q">Der Schweredruck nimmt mit der <b>Tiefe</b> zu. Bei C ist der Druck am größten, das Wasser spritzt am <b>schnellsten</b> und am weitesten heraus.</p>'
              '<p class="q"><i>p</i> = <i>ρ</i> · <i>g</i> · <i>h</i> = 1 000 · 9,81 · 1,2 = <b>11 772 Pa ≈ 0,12 bar</b></p>')
    return {"title": "Wasserstrahlen", "stars": "★★☆", "task": (svg("0 0 300 280", base, 58), task), "sol": (svg("0 0 300 280", base + jets, 58), soltxt)}


def auftrieb():
    base = ('<rect x="10" y="50" width="300" height="120" fill="#cfe4f3"/><path class="o thick" d="M10 20 V170 H310 V20" fill="none"/>'
            '<rect x="45" y="36" width="50" height="28" fill="#d9b77c" stroke="#8a6a3e" stroke-width="1.5"/>'
            '<ellipse cx="160" cy="105" rx="16" ry="20" fill="#f1e2c8" stroke="#8a6a3e" stroke-width="1.5"/>'
            '<rect x="230" y="95" width="40" height="30" rx="6" fill="#8e959c" stroke="#4a525b" stroke-width="1.5"/>'
            + text(70, 190, "1 Holz", "ft small") + text(160, 190, "2 Ei in Salzwasser", "ft small") + text(250, 190, "3 Stein", "ft small") + arrow(282, 100, 282, 122, "arr thin"))
    # arrows: weight (down, red) and buoyancy (up, green); lengths show the force ratio
    sol = base + (arrow(62, 50, 62, 92, "arr fg") + arrow(78, 50, 78, 8, "arr fa")
                  + arrow(152, 105, 152, 145, "arr fg") + arrow(168, 105, 168, 65, "arr fa")
                  + arrow(242, 110, 242, 160, "arr fg") + arrow(258, 110, 258, 86, "arr fa"))
    task = ('<p>Zeichne bei jedem Körper die Gewichtskraft <i>F</i><sub>G</sub> und die Auftriebskraft <i>F</i><sub>A</sub> als Pfeile ein. Achte auf die Länge der Pfeile.</p>'
            '<ol class="lab" style="--lc:1"><li><b>1</b><span class="lt">schwimmt, schwebt oder sinkt? <span class="blank"></span></span></li><li><b>2</b><span class="blank"></span></li><li><b>3</b><span class="blank"></span></li></ol>')
    soltxt = ('<ol class="lab" style="--lc:1"><li><b>1</b><span class="lt"><b>schwimmt</b>: <i>F</i><sub>A</sub> = <i>F</i><sub>G</sub>, nur teilweise eingetaucht.</span></li>'
              '<li><b>2</b><span class="lt"><b>schwebt</b>: <i>F</i><sub>A</sub> = <i>F</i><sub>G</sub>, ganz eingetaucht, Dichte gleich.</span></li>'
              '<li><b>3</b><span class="lt"><b>sinkt</b>: <i>F</i><sub>G</sub> &gt; <i>F</i><sub>A</sub>.</span></li></ol>')
    return {"title": "Kräfte einzeichnen", "stars": "★★☆", "task": (svg("0 0 320 210", base), task), "sol": (svg("0 0 320 210", sol), soltxt)}


def luftdruck():
    hs = [0, 1000, 3000, 5500]
    vals = [1013 * math.exp(-h / 8000) for h in hs]
    assert [round(v, -1) for v in vals] == [1010, 890, 700, 510]
    y = lambda h: 175 - h * 0.028
    d = ('<path d="M0 175 L60 175 L120 140 L170 120 L215 90 L260 33 L300 70 L330 175 Z" fill="#dfe8d0" stroke="#5b6b4a" stroke-width="1.5"/>'
         '<line class="o" x1="0" y1="175" x2="340" y2="175"/>')
    pts = [(30, 0), (120, 1000), (215, 3000), (260, 5500)]
    for (x, h) in pts:
        d += f'<circle cx="{x}" cy="{y(h):.1f}" r="3.5" fill="#1b2228"/>' + text(x, y(h) - 8, f"{h:,} m".replace(",", " "), "ft small")
    base = svg("0 0 340 185", d)
    task = ('<p>Schätze den Luftdruck an den vier Orten. Faustregeln: auf Meereshöhe etwa 1 013 hPa, bis etwa 1 000 m rund 1 hPa weniger pro 8 m, in 5 500 m Höhe nur noch halb so viel.</p>'
            '<ol class="lab" style="--lc:2">' + "".join(f'<li><b>{h}</b><span class="lt"><span class="blank" style="width:15mm;min-width:0"></span> hPa</span></li>' for h in ["0 m", "1 000 m", "3 000 m", "5 500 m"]) + '</ol>'
            '<p class="q">Warum kocht Wasser auf dem Gipfel schon unter 100 °C? <span class="blank wide"></span></p>')
    soltxt = ('<ol class="lab" style="--lc:2"><li><b>0 m</b><span class="lt">≈ 1 013 hPa</span></li><li><b>1 000 m</b><span class="lt">≈ 900 hPa</span></li><li><b>3 000 m</b><span class="lt">≈ 700 hPa</span></li><li><b>5 500 m</b><span class="lt">≈ 500 hPa</span></li></ol>'
              '<p class="q">Der Luftdruck ist kleiner, deshalb siedet Wasser schon bei einer <b>niedrigeren Temperatur</b> (in 5 500 m etwa 82 °C).</p>')
    return {"title": "Luftdruck am Berg", "stars": "★★☆", "task": (base, task), "sol": (base, soltxt)}


FIGS = {
    "osmose": osmose, "natrium-kalium-pumpe": nak, "symport-antiport": symport, "endocytose-exocytose": endo,
    "ableiten": ableiten, "nervensystem": nerven, "auge": auge,
    "binomische-formeln": binom, "bruchterme": bruchterme, "ausmultiplizieren-faktorisieren": ausmult, "terme-vereinfachen": terme,
    "gleichungen": gleichungen, "ungleichungen": ungleichungen,
    "druck": druck, "hydraulik": hydraulik, "schweredruck": schweredruck, "auftrieb": auftrieb, "luftdruck": luftdruck,
}
