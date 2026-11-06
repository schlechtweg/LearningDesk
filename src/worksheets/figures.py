"""Figure tasks for the worksheets: one graphic per topic to label, complete or draw in.

Every function returns a dict with
  title  short heading of the task
  stars  difficulty mark
  task   (svg, html) for page 1: drawing without solution and the instructions / blank lines
  sol    (svg, html) for page 2: drawing with the solution and the answers
Computed answers are checked with assertions.
"""
import math
from fractions import Fraction as Fr

from tasks import de, ftext

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


def termstruktur():
    # tree of 2 · (x + 3)^2 − 5 for x = 1, values checked
    x = 1
    v_sum, v_pow = x + 3, (x + 3) ** 2
    v_prod, v_top = 2 * v_pow, 2 * v_pow - 5
    assert (v_sum, v_pow, v_prod, v_top) == (4, 16, 32, 27)
    nodes = {"top": (150, 22, "−", v_top), "prod": (95, 72, "·", v_prod), "pow": (140, 122, "^", v_pow), "sum": (95, 172, "+", v_sum)}
    leaves = [(250, 72, "5", "top"), (45, 122, "2", "prod"), (190, 172, "2", "pow"), (55, 222, "<tspan font-style=\"italic\">x</tspan>", "sum"), (135, 222, "3", "sum")]
    edges = [("top", "prod"), ("prod", "pow"), ("pow", "sum")]

    def fig(show):
        d = ""
        for a, b in edges:
            d += f'<line class="o" x1="{nodes[a][0]}" y1="{nodes[a][1]}" x2="{nodes[b][0]}" y2="{nodes[b][1]}"/>'
        for lx, ly, _, parent in leaves:
            d += f'<line class="o" x1="{nodes[parent][0]}" y1="{nodes[parent][1]}" x2="{lx}" y2="{ly}"/>'
        for key, (nx, ny, op, val) in nodes.items():
            d += f'<circle cx="{nx}" cy="{ny}" r="13" fill="#e2eef4" stroke="#1f6e8c" stroke-width="1.6"/>{text(nx, ny + 4.5, op, "ft big")}'
            d += f'<rect x="{nx + 17}" y="{ny - 11}" width="34" height="20" rx="4" fill="#fff" stroke="#9aa4ad"/>'
            if show:
                d += text(nx + 34, ny + 4, str(val), "ft sol")
        for lx, ly, lab, _ in leaves:
            d += f'<rect x="{lx - 15}" y="{ly - 12}" width="30" height="24" rx="5" fill="#fff" stroke="#9aa4ad"/>{text(lx, ly + 5, lab, "ft big")}'
        d += text(55, 248, "x = 1", "ft it")
        return svg("20 0 260 260", d)
    task = ('<p>Der Rechenbaum gehört zum Term 2 · (<i>x</i> + 3)² − 5. Trage für <i>x</i> = 1 die Zwischenergebnisse in die Kästchen ein.</p>'
            '<p class="q">Welche Termart ist es? Woran erkennst du das am Baum? <span class="blank wide"></span><span class="blank wide"></span></p>'
            '<p class="q">Termwert für <i>x</i> = −3: <span class="blank"></span></p>')
    assert 2 * (-3 + 3) ** 2 - 5 == -5
    sol = ('<p class="q">Zwischenergebnisse: 1 + 3 = 4, 4² = 16, 2 · 16 = 32, 32 − 5 = <b>27</b>.</p>'
           '<p class="q">Eine <b>Differenz</b>: Ganz oben im Baum (zuletzt) steht das Minus.</p><p class="q">Für <i>x</i> = −3: 2 · 0² − 5 = <b>−5</b></p>')
    return {"title": "Rechenbaum ausfüllen", "stars": "★☆☆", "task": (fig(False), task), "sol": (fig(True), sol)}


def zufallsexperimente():
    import random as _r
    rr = _r.Random(7)
    p, n, k, pts = 0.62, 500, 0, []
    for i in range(1, n + 1):
        k += rr.random() < p
        pts.append((i, k / i))
    X = lambda i: 40 + i / n * 240
    Y = lambda v: 170 - v * 150
    grid_ = "".join(f'<line class="gl" x1="40" y1="{Y(v)}" x2="280" y2="{Y(v)}"/>{text(34, Y(v) + 3, de(v, 1), "ft tiny", "end")}' for v in [0, 0.2, 0.4, 0.6, 0.8, 1])
    grid_ += "".join(text(X(i), 184, str(i), "ft tiny") for i in [100, 200, 300, 400, 500])
    line = '<polyline fill="none" stroke="#1f6e8c" stroke-width="1.6" points="' + " ".join(f"{X(i):.1f},{Y(v):.1f}" for i, v in pts[::2]) + '"/>'
    base = grid_ + '<line class="o" x1="40" y1="170" x2="282" y2="170"/><line class="o" x1="40" y1="170" x2="40" y2="16"/>' + line + text(160, 198, "Anzahl der Würfe", "ft small") + text(44, 12, "relative Häufigkeit „Kopf“", "ft small", "start")
    final = k / n
    sol = base + f'<line x1="40" y1="{Y(0.62):.1f}" x2="280" y2="{Y(0.62):.1f}" stroke="#c0392b" stroke-width="1.6" stroke-dasharray="5 3"/>'
    task = ('<p>Eine Reißzwecke wurde 500-mal geworfen. Das Diagramm zeigt die relative Häufigkeit von „Kopf“.</p>'
            '<p class="q">Beschreibe, wie sich die Kurve verändert: <span class="blank wide"></span></p>'
            '<p class="q">Schätze die Wahrscheinlichkeit für „Kopf“ und zeichne sie als Linie ein: <span class="blank"></span></p>'
            '<p class="q">Wie oft erwartest du bei 2 000 Würfen etwa „Kopf“? <span class="blank"></span></p>')
    soltxt = (f'<p class="q">Am Anfang schwankt die Kurve stark, mit vielen Würfen <b>stabilisiert</b> sie sich (Gesetz der großen Zahlen).</p>'
              f'<p class="q">Schätzwert: <b>P ≈ {de(round(final, 2), 2)}</b> (rote Linie).</p><p class="q">2 000 · {de(round(final, 2), 2)} ≈ <b>{de(2000 * round(final, 2), 0)}</b>-mal</p>')
    return {"title": "Versuchsreihe auswerten", "stars": "★★☆", "task": (svg("0 0 290 205", base), task), "sol": (svg("0 0 290 205", sol), soltxt)}


def laplace():
    # 6 x 6 table of the sums of two dice
    def fig(show):
        d = ""
        for i in range(1, 7):
            d += text(40 + i * 28, 22, str(i), "ft big") + text(26, 40 + i * 24, str(i), "ft big")
            for j in range(1, 7):
                hit = i + j == 7
                fill = "#f6d7d2" if show and hit else "#fff"
                d += f'<rect x="{27 + j * 28}" y="{26 + i * 24}" width="26" height="22" rx="3" fill="{fill}" stroke="#9aa4ad"/>'
                if show or (i + j) % 5 == 0:
                    d += text(40 + j * 28, 41 + i * 24, str(i + j), "ft" + (" sol" if show and (i + j) % 5 else ""))
        d += text(124, 8, "2. Würfel", "ft small") + f'<text class="ft small" x="8" y="110" transform="rotate(-90 8 110)" text-anchor="middle">1. Würfel</text>'
        return svg("0 0 232 200", d)
    assert sum(1 for i in range(1, 7) for j in range(1, 7) if i + j == 7) == 6
    assert sum(1 for i in range(1, 7) for j in range(1, 7) if i + j >= 10) == 6
    task = ('<p>Trage in die Tabelle die Augensummen der beiden Würfel ein (einige sind schon eingetragen). Färbe alle Felder mit der Summe 7.</p>'
            '<p class="q">P(Summe 7) = <span class="blank"></span> &nbsp; P(Summe mindestens 10) = <span class="blank"></span></p>'
            '<p class="q">Welche Summe ist am wahrscheinlichsten? <span class="blank"></span></p>')
    sol = ('<p class="q">Summe 7 kommt 6-mal vor: <b>P = 6/36 = 1/6</b>.</p><p class="q">Summe 10, 11 oder 12: 3 + 2 + 1 = 6 Felder: <b>P = 1/6</b>.</p>'
           '<p class="q">Am wahrscheinlichsten ist die Summe <b>7</b>.</p>')
    return {"title": "Augensummen-Tabelle", "stars": "★★☆", "task": (fig(False), task), "sol": (fig(True), sol)}


def baumdiagramme():
    # urn with 3 red and 2 blue balls, two draws without replacement
    R, B = 3, 2
    nodes = {"": (20, 100), "r": (110, 50), "b": (110, 150), "rr": (200, 25), "rb": (200, 75), "br": (200, 125), "bb": (200, 175)}
    probs = {"r": (R, 5), "b": (B, 5), "rr": (2, 4), "rb": (2, 4), "br": (3, 4), "bb": (1, 4)}
    paths = {"rr": Fr(3, 5) * Fr(2, 4), "rb": Fr(3, 5) * Fr(2, 4), "br": Fr(2, 5) * Fr(3, 4), "bb": Fr(2, 5) * Fr(1, 4)}
    assert sum(paths.values()) == 1

    def fig(show):
        d = ""
        for k, (x, y) in nodes.items():
            if not k:
                continue
            px, py = nodes[k[:-1]]
            d += f'<line class="o" x1="{px}" y1="{py}" x2="{x}" y2="{y}"/>'
            mx, my = (px + x) / 2, (py + y) / 2 - 7
            if show:
                d += text(mx, my, f"{probs[k][0]}/{probs[k][1]}", "ft sol")
            else:
                d += f'<rect x="{mx - 15}" y="{my - 11}" width="30" height="15" rx="3" fill="#fff" stroke="#9aa4ad"/>'
        for k, (x, y) in nodes.items():
            col = "#1b2228" if not k else ("#c0392b" if k[-1] == "r" else "#2f7fb8")
            d += f'<circle cx="{x}" cy="{y}" r="{4 if not k else 7}" fill="{col}"/>'
        for k in ["rr", "rb", "br", "bb"]:
            x, y = nodes[k]
            d += text(x + 14, y + 4, k.upper() + ":", "ft", "start")
            if show:
                d += text(x + 46, y + 4, ftext(paths[k]), "ft sol", "start")
            else:
                d += f'<rect x="{x + 42}" y="{y - 9}" width="34" height="15" rx="3" fill="#fff" stroke="#9aa4ad"/>'
        return svg("0 5 290 185", d)
    task = ('<p>In einer Urne liegen 3 rote und 2 blaue Kugeln. Es werden zwei Kugeln <b>ohne Zurücklegen</b> gezogen. Ergänze die Wahrscheinlichkeiten an den Ästen und an den Pfadenden.</p>'
            '<p class="q">P(gleiche Farbe) = <span class="blank"></span> &nbsp; P(mindestens eine blaue) = <span class="blank"></span></p>')
    same = paths["rr"] + paths["bb"]
    atleast = 1 - paths["rr"]
    assert same == Fr(2, 5) and atleast == Fr(7, 10)
    sol = (f'<p class="q">Pfade: RR = RB = BR = 3/10, BB = 1/10 (Summe 1).</p>'
           f'<p class="q">P(gleiche Farbe) = 3/10 + 1/10 = <b>2/5</b>; P(mindestens eine blaue) = 1 − 3/10 = <b>7/10</b>.</p>')
    return {"title": "Baumdiagramm ergänzen", "stars": "★★☆", "task": (fig(False), task), "sol": (fig(True), sol)}


def unabhaengig():
    # two-way table: 200 pupils, smartphone > 1 h (A) and sleeps badly (B)
    v = {"ab": 30, "anb": 50, "nab": 20, "nanb": 100}
    rows = [("Handy > 1 h", "ab", "anb"), ("nicht", "nab", "nanb")]
    a = v["ab"] + v["anb"]; b = v["ab"] + v["nab"]; n = sum(v.values())
    assert n == 200 and (a, b) == (80, 50)
    hidden = {"anb", "nab"}

    def cell(x, y, val, show, given):
        box = f'<rect x="{x}" y="{y}" width="62" height="24" rx="3" fill="#fff" stroke="#9aa4ad"/>'
        if given:
            return box + text(x + 31, y + 16, str(val), "ft")
        return box + (text(x + 31, y + 16, str(val), "ft sol") if show else "")

    def fig(show):
        d = text(110, 18, "schläft schlecht", "ft small") + text(178, 18, "nicht", "ft small") + text(246, 18, "Summe", "ft small")
        y = 26
        for name, k1, k2 in rows:
            d += text(8, y + 16, name, "ft small", "start")
            d += cell(80, y, v[k1], show, k1 not in hidden) + cell(148, y, v[k2], show, k2 not in hidden) + cell(216, y, v[k1] + v[k2], show, False)
            y += 30
        d += text(8, y + 16, "Summe", "ft small", "start")
        d += cell(80, y, b, show, False) + cell(148, y, n - b, show, False) + cell(216, y, n, show, True)
        return svg("0 0 285 120", d)
    task = ('<p>Umfrage unter 200 Jugendlichen. Ergänze die Vierfeldertafel.</p>'
            '<p class="q">Anteil „schläft schlecht“ bei Handy > 1 h: <span class="blank"></span> und bei den anderen: <span class="blank"></span></p>'
            '<p class="q">Sind die Merkmale unabhängig? Begründe: <span class="blank wide"></span></p>')
    sol = ('<p class="q">30/80 = <b>37,5 %</b>; 20/120 ≈ <b>16,7 %</b>.</p>'
           '<p class="q"><b>Abhängig</b>: Die Anteile unterscheiden sich deutlich. Auch P(A und B) = 0,15 ≠ P(A) · P(B) = 0,4 · 0,25 = 0,1.</p>')
    assert Fr(30, 200) != Fr(80, 200) * Fr(50, 200)
    return {"title": "Vierfeldertafel ergänzen", "stars": "★★☆", "task": (fig(False), task), "sol": (fig(True), sol)}


def funktionsbegriff():
    # four small graphs: which ones belong to functions?
    def axes(ox):
        return f'<line class="o" x1="{ox}" y1="70" x2="{ox + 70}" y2="70"/><line class="o" x1="{ox + 35}" y1="12" x2="{ox + 35}" y2="128"/>'
    def path(ox, pts):
        return '<path fill="none" stroke="#1f6e8c" stroke-width="2.2" d="M' + " L".join(f"{ox + 35 + x * 10:.1f} {70 - y * 10:.1f}" for x, y in pts) + '"/>'
    A = path(0, [(x / 4, (x / 4) ** 2 / 1.8 - 2.5) for x in range(-12, 13)])
    circle = '<circle cx="{}" cy="70" r="28" fill="none" stroke="#1f6e8c" stroke-width="2.2"/>'
    B = circle.format(80 + 35)
    C = path(160, [((y / 4) ** 2 / 1.8 - 2.5, y / 4) for y in range(-14, 15)])
    D = "".join(f'<line x1="{240 + 35 + x0 * 10}" y1="{70 - yv * 10}" x2="{240 + 35 + x1 * 10}" y2="{70 - yv * 10}" stroke="#1f6e8c" stroke-width="2.6"/>' for x0, x1, yv in [(-3.2, -1, -2), (-1, 1, 0), (1, 3.2, 2)])
    d = "".join(axes(o) for o in (0, 80, 160, 240)) + A + B + C + D
    d += "".join(text(o + 35, 146, c, "ft big") for o, c in zip((0, 80, 160, 240), "ABCD"))
    pic = svg("-4 4 320 150", d)
    names = ["Funktion (Parabel)", "keine Funktion (Kreis)", "keine Funktion (liegende Parabel)", "Funktion (Treppenfunktion)"]
    task = ('<p>Welche Graphen gehören zu einer Funktion? Begründe mit dem „Senkrechte-Linie-Test“.</p>'
            '<ol class="lab abc" style="--lc:2">' + "".join(f'<li><b>{c}</b><span class="blank"></span></li>' for c in "ABCD") + '</ol>'
            '<p class="q">Regel: <span class="blank wide"></span></p>')
    sol = ('<ol class="lab abc" style="--lc:2">' + "".join(f'<li><b>{c}</b><span class="lt">{n}</span></li>' for c, n in zip("ABCD", names)) + '</ol>'
           '<p class="q">Jede senkrechte Linie darf den Graphen <b>höchstens einmal</b> schneiden; bei B und C schneidet sie zweimal.</p>')
    return {"title": "Funktion oder nicht?", "stars": "★☆☆", "task": (pic, task), "sol": (pic, sol)}


def eigenschaften():
    # graph of f(x) = 0.5 (x + 1)^2 - 2 to read off properties
    f = lambda x: 0.5 * (x + 1) ** 2 - 2
    assert f(1) == 0 and f(-3) == 0 and f(0) == -1.5
    ox, oy, u = 120, 110, 22
    base = grid(ox, oy, u, (-5, 4), (-3, 4)) + plot(f, ox, oy, u, -5, 4, 4.3, "fg") + text(ox + 2.6 * u, oy - 3.6 * u, "f", "ft it")
    sol = base + "".join(f'<circle class="pt" cx="{ox + x * u}" cy="{oy}" r="4"/>' for x in (-3, 1)) + f'<circle cx="{ox - u}" cy="{oy + 2 * u}" r="6" fill="none" stroke="#c0392b" stroke-width="2"/><circle cx="{ox}" cy="{oy + 1.5 * u}" r="4" fill="#7b4bb0"/>'
    task = ('<p>Lies am Graphen von <i>f</i> ab:</p>'
            '<ol class="lab" style="--lc:1"><li><b>a)</b><span class="lt">Nullstellen: <span class="blank"></span></span></li><li><b>b)</b><span class="lt">Schnittpunkt mit der <i>y</i>-Achse: <span class="blank"></span></span></li>'
            '<li><b>c)</b><span class="lt">Tiefpunkt: <span class="blank"></span></span></li><li><b>d)</b><span class="lt">Wo fällt, wo steigt der Graph? <span class="blank"></span></span></li><li><b>e)</b><span class="lt">Symmetrieachse: <span class="blank"></span></span></li></ol>')
    soltxt = ('<ol class="lab" style="--lc:1"><li><b>a)</b><span class="lt"><b><i>x</i> = −3</b> und <b><i>x</i> = 1</b></span></li><li><b>b)</b><span class="lt"><b>(0 | −1,5)</b></span></li>'
              '<li><b>c)</b><span class="lt"><b>T(−1 | −2)</b></span></li><li><b>d)</b><span class="lt">fallend für <i>x</i> ≤ −1, steigend für <i>x</i> ≥ −1</span></li><li><b>e)</b><span class="lt">die senkrechte Gerade <b><i>x</i> = −1</b></span></li></ol>')
    return {"title": "Eigenschaften ablesen", "stars": "★☆☆", "task": (svg("0 0 240 200", base), task), "sol": (svg("0 0 240 200", sol), soltxt)}


def lineare_funktionen():
    f = lambda x: 2 * x - 1
    g = lambda x: -0.5 * x + 4
    assert f(2) == g(2) == 3
    ox, oy, u = 110, 120, 18
    base = grid(ox, oy, u, (-5, 6), (-4, 6))
    sol = base + plot(f, ox, oy, u, -5, 6, 6.2, "fs") + plot(g, ox, oy, u, -5, 6, 6.2, "fs") + f'<circle class="pt" cx="{ox + 2 * u}" cy="{oy - 3 * u}" r="4.5"/>' + text(ox + 2 * u + 8, oy - 3 * u - 6, "S(2|3)", "ft sol", "start")
    task = ('<p>Zeichne die Graphen von <i>f</i>(<i>x</i>) = 2<i>x</i> − 1 und <i>g</i>(<i>x</i>) = −0,5<i>x</i> + 4 mit Hilfe von <i>y</i>-Achsenabschnitt und Steigungsdreieck.</p>'
            '<p class="q">Schnittpunkt abgelesen: <span class="blank"></span></p><p class="q">Rechnerische Kontrolle: <span class="blank wide"></span></p>')
    soltxt = ('<p class="q"><i>f</i>: Start (0 | −1), 1 nach rechts, 2 nach oben. <i>g</i>: Start (0 | 4), 2 nach rechts, 1 nach unten.</p>'
              '<p class="q">2<i>x</i> − 1 = −0,5<i>x</i> + 4 ⇒ 2,5<i>x</i> = 5 ⇒ <i>x</i> = 2, <i>y</i> = 3: <b>S(2 | 3)</b></p>')
    return {"title": "Geraden zeichnen", "stars": "★★☆", "task": (svg("0 0 230 210", base), task), "sol": (svg("0 0 230 210", sol), soltxt)}


def funktionsgleichungen():
    f = lambda x: 2 / 3 * x - 2
    g = lambda x: -0.5 * x + 1
    assert abs(f(3)) < 1e-12 and g(-4) == 3 and g(2) == 0
    ox, oy, u = 110, 100, 18
    base = grid(ox, oy, u, (-5, 6), (-4, 5)) + plot(f, ox, oy, u, -5, 6, 5.3, "fg") + plot(g, ox, oy, u, -5, 6, 5.3, "fg") + text(ox + 5.2 * u, oy - 1.9 * u, "f", "ft it") + text(ox - 4.6 * u, oy - 3.9 * u, "g", "ft it")
    sol = base + f'<path class="arr sol" d="M{ox} {oy + 2 * u} H{ox + 3 * u} V{oy}"/>' + text(ox + 1.5 * u, oy + 2 * u + 12, "3", "ft sol") + text(ox + 3 * u + 8, oy + u + 4, "2", "ft sol", "start")
    task = ('<p>Lies die Gleichungen der beiden Geraden ab.</p>'
            '<p class="q"><i>f</i>(<i>x</i>) = <span class="blank"></span></p><p class="q"><i>g</i>(<i>x</i>) = <span class="blank"></span></p>'
            '<p class="q">Berechne den Schnittpunkt von <i>f</i> und <i>g</i>: <span class="blank wide"></span></p>')
    xs = Fr(3) / (Fr(2, 3) + Fr(1, 2))
    ys = Fr(-1, 2) * xs + 1
    assert (xs, ys) == (Fr(18, 7), Fr(-2, 7))
    soltxt = ('<p class="q"><i>f</i>: <i>b</i> = −2, Steigungsdreieck 3 nach rechts, 2 nach oben: <b><i>f</i>(<i>x</i>) = ⅔<i>x</i> − 2</b></p>'
              '<p class="q"><i>g</i>: <i>b</i> = 1, 2 nach rechts, 1 nach unten: <b><i>g</i>(<i>x</i>) = −½<i>x</i> + 1</b></p>'
              '<p class="q">⅔<i>x</i> − 2 = −½<i>x</i> + 1 ⇒ <sup>7</sup>⁄<sub>6</sub><i>x</i> = 3 ⇒ <b>S(18/7 | −2/7)</b> ≈ (2,57 | −0,29)</p>')
    return {"title": "Gleichungen ablesen", "stars": "★★☆", "task": (svg("0 0 230 190", base), task), "sol": (svg("0 0 230 190", sol), soltxt)}


def lgs_grafisch():
    # I: x + 2y = 8  ->  y = -x/2 + 4 ;  II: x - y = 2  ->  y = x - 2 ;  solution (4 | 2)
    assert 4 + 2 * 2 == 8 and 4 - 2 == 2
    ox, oy, u = 100, 130, 17
    base = grid(ox, oy, u, (-4, 8), (-4, 6))
    sol = base + plot(lambda x: -x / 2 + 4, ox, oy, u, -4, 8, 6.2, "fs") + plot(lambda x: x - 2, ox, oy, u, -4, 8, 6.2, "fs") + f'<circle class="pt" cx="{ox + 4 * u}" cy="{oy - 2 * u}" r="4.5"/>' + text(ox + 4 * u + 7, oy - 2 * u - 7, "(4|2)", "ft sol", "start")
    task = ('<p>Löse das Gleichungssystem grafisch. I: <i>x</i> + 2<i>y</i> = 8 &nbsp; II: <i>x</i> − <i>y</i> = 2</p>'
            '<p class="q">I nach <i>y</i>: <span class="blank"></span> &nbsp; II nach <i>y</i>: <span class="blank"></span></p>'
            '<p class="q">Lösung: <span class="blank"></span> &nbsp; Probe: <span class="blank wide"></span></p>')
    soltxt = ('<p class="q">I: <b><i>y</i> = −½<i>x</i> + 4</b>, II: <b><i>y</i> = <i>x</i> − 2</b></p>'
              '<p class="q">Schnittpunkt <b>(4 | 2)</b>. Probe: I: 4 + 4 = 8 ✓, II: 4 − 2 = 2 ✓</p>')
    return {"title": "LGS grafisch lösen", "stars": "★☆☆", "task": (svg("0 0 260 220", base), task), "sol": (svg("0 0 260 220", sol), soltxt)}


def gleichsetzungsverfahren():
    # costs: A = 8 + 2x, B = 4x  ->  equal at x = 4 h, 16 euros
    assert 8 + 2 * 4 == 4 * 4 == 16
    ox, oy, ux, uy = 40, 190, 26, 8
    g = "".join(f'<line class="gr" x1="{ox + i * ux}" y1="{oy}" x2="{ox + i * ux}" y2="{oy - 22 * uy}"/>' for i in range(8))
    g += "".join(f'<line class="gr" x1="{ox}" y1="{oy - j * uy}" x2="{ox + 7 * ux}" y2="{oy - j * uy}"/>' for j in range(0, 23, 2))
    g += f'<line class="ax" x1="{ox}" y1="{oy}" x2="{ox + 7.4 * ux}" y2="{oy}"/><line class="ax" x1="{ox}" y1="{oy}" x2="{ox}" y2="{oy - 23 * uy}"/>'
    g += "".join(text(ox + i * ux, oy + 13, str(i), "ft") for i in range(1, 8)) + "".join(text(ox - 8, oy - j * uy + 4, str(j), "ft", "end") for j in range(4, 23, 4))
    g += text(ox + 7.4 * ux, oy - 6, "h", "ft it", "end") + text(ox + 6, oy - 22.4 * uy, "€", "ft", "start")
    lines = f'<line class="fg" x1="{ox}" y1="{oy - 8 * uy}" x2="{ox + 7 * ux}" y2="{oy - 22 * uy}"/><line class="fg" x1="{ox}" y1="{oy}" x2="{ox + 5.5 * ux}" y2="{oy - 22 * uy}"/>'
    lines += text(ox + 6.6 * ux, oy - 18.6 * uy, "A", "ft it") + text(ox + 4.3 * ux, oy - 20.6 * uy, "B", "ft it")
    base = g + lines
    sol = base + f'<circle class="pt" cx="{ox + 4 * ux}" cy="{oy - 16 * uy}" r="4.5"/>' + text(ox + 4 * ux + 8, oy - 16 * uy + 14, "(4|16)", "ft sol", "start")
    task = ('<p>Fahrradverleih A: 8 € Grundgebühr und 2 € pro Stunde. Verleih B: 4 € pro Stunde.</p>'
            '<p class="q">Kosten A: <span class="blank"></span> &nbsp; Kosten B: <span class="blank"></span></p>'
            '<p class="q">Gleichsetzen und lösen: <span class="blank wide"></span></p>'
            '<p class="q">Markiere den Schnittpunkt. Wann ist A günstiger? <span class="blank wide"></span></p>')
    soltxt = ('<p class="q">A: <b><i>y</i> = 2<i>x</i> + 8</b>, B: <b><i>y</i> = 4<i>x</i></b></p>'
              '<p class="q">2<i>x</i> + 8 = 4<i>x</i> ⇒ 8 = 2<i>x</i> ⇒ <b><i>x</i> = 4</b>, <i>y</i> = 16</p>'
              '<p class="q">Schnittpunkt <b>(4 | 16)</b>: Ab mehr als <b>4 Stunden</b> ist A günstiger.</p>')
    return {"title": "Tarife vergleichen", "stars": "★★☆", "task": (svg("0 0 240 215", base), task), "sol": (svg("0 0 240 215", sol), soltxt)}


FIGS = {
    "osmose": osmose, "natrium-kalium-pumpe": nak, "symport-antiport": symport, "endocytose-exocytose": endo,
    "ableiten": ableiten, "nervensystem": nerven, "auge": auge,
    "termstruktur": termstruktur, "zufallsexperimente": zufallsexperimente, "laplace": laplace, "baumdiagramme": baumdiagramme, "unabhaengige-ereignisse": unabhaengig, "funktionsbegriff": funktionsbegriff, "eigenschaften-funktionen": eigenschaften, "lineare-funktionen": lineare_funktionen, "funktionsgleichungen": funktionsgleichungen, "lgs-grafisch": lgs_grafisch, "gleichsetzungsverfahren": gleichsetzungsverfahren, "binomische-formeln": binom, "bruchterme": bruchterme, "ausmultiplizieren-faktorisieren": ausmult, "terme-vereinfachen": terme,
    "gleichungen": gleichungen, "ungleichungen": ungleichungen,
    "druck": druck, "hydraulik": hydraulik, "schweredruck": schweredruck, "auftrieb": auftrieb, "luftdruck": luftdruck,
}
