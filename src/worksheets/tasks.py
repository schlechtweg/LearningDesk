"""Task pools for the worksheets.

Every generator returns {1: [...], 2: [...], 3: [...]} with (task_html, solution_html)
pairs for the levels easy, medium and hard. Pools are larger than one page; the
worksheet removes tasks until everything fits. Random tasks use a fixed seed per
topic so the PDFs are reproducible, and every computed solution is checked with
assertions (substitution, re-expansion) while generating.
"""
import math
import random
from fractions import Fraction as Fr

# ---------------------------------------------------------------- formatting
MINUS = "−"


def de(v, d=2):
    """German number: decimal comma, dot as thousands separator, trailing zeros removed."""
    v = round(float(v), d)
    if abs(v) < 10 ** -(d + 1):
        v = 0.0
    s = f"{abs(v):,.{d}f}".replace(",", "X").replace(".", ",").replace("X", ".")
    if "," in s:
        s = s.rstrip("0").rstrip(",")
    return (MINUS if v < 0 else "") + s


def m(s):
    return f'<span class="m">{s}</span>'


def fr(n, d):
    return f'<span class="fr"><span>{n}</span><span>{d}</span></span>'


def fnum(q):
    """Fraction as HTML: integer or stacked fraction with a leading minus."""
    q = Fr(q)
    if q.denominator == 1:
        return (MINUS if q < 0 else "") + str(abs(q.numerator))
    return (MINUS if q < 0 else "") + fr(abs(q.numerator), q.denominator)


def ftext(q):
    q = Fr(q)
    return str(q.numerator) if q.denominator == 1 else f"{q.numerator}/{q.denominator}"


X = "<i>x</i>"

# ---------------------------------------------------------------- polynomials
VORDER = "abcmnpqrstuvwxyz"


def _key(d):
    return tuple(sorted(((k, e) for k, e in d.items() if e != 0), key=lambda p: VORDER.index(p[0])))


class P:
    """Multivariate polynomial with Fraction coefficients."""

    def __init__(self, t=None):
        self.t = {k: Fr(v) for k, v in (t or {}).items() if v != 0}

    @staticmethod
    def of(x):
        return x if isinstance(x, P) else P({(): Fr(x)})

    @staticmethod
    def v(name, coef=1, e=1):
        return P({((name, e),): Fr(coef)})

    def __add__(self, o):
        o = P.of(o)
        r = dict(self.t)
        for k, v in o.t.items():
            r[k] = r.get(k, 0) + v
        return P(r)

    __radd__ = __add__

    def __neg__(self):
        return P({k: -v for k, v in self.t.items()})

    def __sub__(self, o):
        return self + (-P.of(o))

    def __rsub__(self, o):
        return P.of(o) - self

    def __mul__(self, o):
        o = P.of(o)
        r = {}
        for k1, v1 in self.t.items():
            for k2, v2 in o.t.items():
                d = dict(k1)
                for var, e in k2:
                    d[var] = d.get(var, 0) + e
                k = _key(d)
                r[k] = r.get(k, 0) + v1 * v2
        return P(r)

    __rmul__ = __mul__

    def __pow__(self, n):
        r = P.of(1)
        for _ in range(n):
            r = r * self
        return r

    def __eq__(self, o):
        return isinstance(o, P) and self.t == o.t

    def ev(self, env):
        s = Fr(0)
        for k, c in self.t.items():
            p = Fr(c)
            for var, e in k:
                p *= Fr(env[var]) ** e
            s += p
        return s

    def terms(self):
        def order(item):
            k = item[0]
            return (-sum(e for _, e in k), [(VORDER.index(v), -e) for v, e in k])
        return sorted(self.t.items(), key=order)

    def tail(self):
        """HTML for appending this polynomial to an expression: every term with its sign."""
        h = self.html()
        return f" {MINUS} " + h[1:] if h.startswith(MINUS) else " + " + h

    def html(self):
        out = []
        for i, (k, c) in enumerate(self.terms()):
            mono = "".join(f"<i>{v}</i>" + (f"<sup>{e}</sup>" if e != 1 else "") for v, e in k)
            a = abs(c)
            coef = "" if (a == 1 and mono) else fnum(a)
            body = coef + mono
            if i == 0:
                out.append((MINUS if c < 0 else "") + body)
            else:
                out.append((f" {MINUS} " if c < 0 else " + ") + body)
        return "".join(out) or "0"


x, a, b, y = P.v("x"), P.v("a"), P.v("b"), P.v("y")


def lin(p, q, var=None):
    var = var or x
    return p * var + q


def par(p):
    return f"({p.html()})"


def pick_nz(r, lo, hi):
    v = 0
    while v == 0:
        v = r.randint(lo, hi)
    return v


def rel_samples(p, q, vars_="abxy"):
    """Check two polynomials are equal by evaluating at a few rational points."""
    for t in range(4):
        env = {v: Fr(2 * t + i + 3, 3 + i) for i, v in enumerate(vars_)}
        assert p.ev(env) == q.ev(env)


# ================================================================ mathematics
def binomische_formeln():
    r = random.Random(81)
    L = {1: [], 2: [], 3: []}
    for i in range(160):
        k = r.randint(1, 9)
        v = [x, a, y][i % 3]
        t = (i // 3) % 3
        if t == 0:
            task, res = f"({(v + k).html()})<sup>2</sup>", (v + k) ** 2
        elif t == 1:
            task, res = f"({(v - k).html()})<sup>2</sup>", (v - k) ** 2
        else:
            task, res = f"({(v + k).html()})({(v - k).html()})", (v + k) * (v - k)
        L[1].append((m(task), m(f"{task} = <b>{res.html()}</b>")))
    for i in range(144):
        t = i % 4
        if t == 0:
            k, c = r.randint(2, 5), pick_nz(r, -9, 9)
            e = k * x + c
            res = e ** 2
            L[2].append((m(f"({e.html()})<sup>2</sup>"), m(f"<b>{res.html()}</b>")))
        elif t == 1:
            p, q = r.randint(2, 5), r.randint(1, 4)
            e1, e2 = p * a + q * b, p * a - q * b
            L[2].append((m(f"({e1.html()})({e2.html()})"), m(f"<b>{(e1 * e2).html()}</b>")))
        elif t == 2:
            k = r.randint(2, 9) * r.choice([1, -1])
            e = (x + k) ** 2
            L[2].append(("Faktorisiere: " + m(e.html()), m(f"<b>({(x + k).html()})<sup>2</sup></b>")))
        else:
            k = r.randint(2, 12)
            L[2].append(("Faktorisiere: " + m(((x ** 2) - k * k).html()), m(f"<b>({(x + k).html()})({(x - k).html()})</b>")))
    for i in range(128):
        t = i % 5
        if t == 0:
            p, q = r.randint(2, 4), r.randint(1, 5) * r.choice([1, -1])
            e = (p * x + q * y) ** 2
            L[3].append(("Faktorisiere: " + m(e.html()), m(f"<b>({(p * x + q * y).html()})<sup>2</sup></b>")))
        elif t == 1:
            p, q = r.randint(1, 6), r.randint(1, 6)
            res = (x + p) ** 2 - (x - q) ** 2
            L[3].append(("Vereinfache: " + m(f"({(x + p).html()})<sup>2</sup> {MINUS} ({(x - q).html()})<sup>2</sup>"),
                         m(f"{((x + p) ** 2).html()} {MINUS} ({((x - q) ** 2).html()}) = <b>{res.html()}</b>")))
        elif t == 2:
            n = r.choice([19, 21, 29, 31, 39, 41, 49, 51, 59, 61, 69, 71, 79, 81, 99, 101])
            base = round(n, -1)
            d = n - base
            op = "+" if d > 0 else MINUS
            L[3].append(("Rechne im Kopf mit einer binomischen Formel: " + m(f"{n}<sup>2</sup>"),
                         m(f"({base} {op} {abs(d)})<sup>2</sup> = {base * base} {op} {2 * base * abs(d)} + {d * d} = <b>{n * n}</b>")))
        elif t == 3:
            k = r.randint(2, 9)
            L[3].append(("Ergänze die Lücken: " + m(f"<i>x</i><sup>2</sup> + {2 * k}<i>x</i> + ▢ = (<i>x</i> + ▢)<sup>2</sup>"),
                         m(f"<i>x</i><sup>2</sup> + {2 * k}<i>x</i> + <b>{k * k}</b> = (<i>x</i> + <b>{k}</b>)<sup>2</sup>")))
        else:
            base, d = r.choice([30, 40, 50, 60, 70, 80]), r.randint(1, 4)
            L[3].append(("Rechne im Kopf: " + m(f"{base + d} · {base - d}"),
                         m(f"({base} + {d})({base} {MINUS} {d}) = {base * base} {MINUS} {d * d} = <b>{base * base - d * d}</b>")))
    return L


def ausmultiplizieren():
    r = random.Random(82)
    L = {1: [], 2: [], 3: []}
    for i in range(160):
        k = pick_nz(r, -9, 9) if i % 4 else -1
        p, q = r.randint(1, 6), pick_nz(r, -9, 9)
        e = lin(p, q)
        res = k * e
        kt = MINUS if k == -1 else (f"({MINUS}{abs(k)})" if k < 0 else str(k))
        L[1].append((m(f"{kt}·({e.html()})" if k != -1 else f"{MINUS}({e.html()})"), m(f"<b>{res.html()}</b>")))
    for i in range(144):
        if i % 2 == 0:
            p, q, s, t = r.choice([1, 1, 2, 3]), pick_nz(r, -9, 9), r.choice([1, 1, 2]), pick_nz(r, -9, 9)
            e1, e2 = lin(p, q), lin(s, t)
            L[2].append((m(f"({e1.html()})({e2.html()})"), m(f"<b>{(e1 * e2).html()}</b>")))
        else:
            while True:
                p, q = r.randint(1, 7), pick_nz(r, -9, 9)
                if math.gcd(p, abs(q)) == 1:
                    break
            g = r.randint(2, 9)
            s = g * lin(p, q)
            L[2].append(("Klammere aus: " + m(s.html()), m(f"<b>{g}({lin(p, q).html()})</b>")))
    for i in range(128):
        t = i % 4
        if t == 0:
            while True:
                p, q = r.randint(1, 5), pick_nz(r, -9, 9)
                if math.gcd(p, abs(q)) == 1:
                    break
            g = r.randint(2, 6)
            s = g * x * lin(p, q)
            L[3].append(("Klammere aus: " + m(s.html()), m(f"<b>{g}<i>x</i>({lin(p, q).html()})</b>")))
        elif t == 1:
            g = r.choice([2, 3, 4, 5])
            while True:
                c = [r.randint(1, 5), pick_nz(r, -5, 5), pick_nz(r, -5, 5)]
                if math.gcd(math.gcd(c[0], abs(c[1])), abs(c[2])) == 1:
                    break
            inner = c[0] * x ** 2 + c[1] * x + c[2]
            s = g * x * inner
            L[3].append(("Klammere aus: " + m(s.html()), m(f"<b>{g}<i>x</i>({inner.html()})</b>")))
        elif t == 2:
            k1, k2 = r.randint(2, 5), r.randint(2, 5)
            p, q = pick_nz(r, -6, 6), pick_nz(r, -6, 6)
            res = k1 * (x + p) - k2 * (x + q)
            L[3].append(("Vereinfache: " + m(f"{k1}({(x + p).html()}) {MINUS} {k2}({(x + q).html()})"),
                         m(f"{(k1 * (x + p)).html()} {MINUS} ({(k2 * (x + q)).html()}) = <b>{res.html()}</b>")))
        else:
            p, q, s = pick_nz(r, -6, 6), pick_nz(r, -6, 6), pick_nz(r, -6, 6)
            res = (x + p) * (x + q) - x * (x + s)
            L[3].append(("Vereinfache: " + m(f"({(x + p).html()})({(x + q).html()}) {MINUS} <i>x</i>({(x + s).html()})"),
                         m(f"{((x + p) * (x + q)).html()} {MINUS} ({(x * (x + s)).html()}) = <b>{res.html()}</b>")))
    return L


def terme():
    r = random.Random(83)
    L = {1: [], 2: [], 3: []}
    kinds = [a, b, a * b, a ** 2, P.of(1)]
    for i in range(160):
        ts = r.sample(range(5), 2)
        parts = [pick_nz(r, -8, 9) * kinds[ts[j % 2]] for j in range(4)]
        r.shuffle(parts)
        task = parts[0].html() + "".join((" + " if p.terms()[0][1] > 0 else f" {MINUS} ") + P({p.terms()[0][0]: abs(p.terms()[0][1])}).html() for p in parts[1:])
        res = sum(parts, P())
        L[1].append((m(task), m(f"<b>{res.html()}</b>")))
    vs = [a, b, x]
    for i in range(144):
        n = 2 if i % 3 else 3
        fs = [pick_nz(r, -6, 7) * r.choice(vs) * (r.choice(vs) if r.random() < 0.4 else 1) for _ in range(n)]
        task = " · ".join(f"({f.html()})" if f.terms()[0][1] < 0 else f.html() for f in fs)
        res = P.of(1)
        for f in fs:
            res = res * f
        L[2].append((m(task), m(f"<b>{res.html()}</b>")))
    for i in range(128):
        k, mm = pick_nz(r, -5, 5), pick_nz(r, -4, 4)
        p, q, s, t = pick_nz(r, -6, 6), pick_nz(r, -6, 6), pick_nz(r, -6, 6), pick_nz(r, -6, 6)
        if i % 2 == 0:
            inner = p * a + q * b
            rest = s * a + t * b
            res = k * inner + rest
            task = f"{fnum(k)}·({inner.html()}){rest.tail()}"
        else:
            inner1, inner2 = p * a + q * a * b, s * a + t * a * b
            res = k * inner1 - mm * inner2
            task = f"{fnum(k)}·({inner1.html()}) {MINUS} {fnum(mm)}·({inner2.html()})"
        L[3].append((m(task), m(f"<b>{res.html()}</b>")))
    return L


def lin_eq_html(p1, q1, p2, q2, rel="="):
    return f"{lin(p1, q1).html()} {rel} {lin(p2, q2).html()}"


def solve_lin(p1, q1, p2, q2):
    """p1 x + q1 = p2 x + q2 -> x (Fraction)."""
    return Fr(q2 - q1, 1) / Fr(p1 - p2, 1)


def gleichungen():
    r = random.Random(84)
    L = {1: [], 2: [], 3: []}
    for i in range(176):
        p, x0, q = pick_nz(r, -9, 9), pick_nz(r, -9, 9), pick_nz(r, -12, 12)
        c = p * x0 + q
        sol = solve_lin(p, q, 0, c)
        assert sol == x0
        L[1].append((m(f"{lin(p, q).html()} = {fnum(c)}"), m(f"{lin(p, 0).html()} = {fnum(c - q)} ⇒ <b><i>x</i> = {fnum(sol)}</b>")))
    for i in range(144):
        while True:
            p1, p2 = pick_nz(r, -7, 8), r.randint(-5, 5)
            if p1 != p2:
                break
        x0, q1 = pick_nz(r, -8, 8), r.randint(-9, 9)
        q2 = (p1 - p2) * x0 + q1
        sol = solve_lin(p1, q1, p2, q2)
        assert sol == x0
        L[2].append((m(lin_eq_html(p1, q1, p2, q2)), m(f"{lin(p1 - p2, 0).html()} = {fnum(q2 - q1)} ⇒ <b><i>x</i> = {fnum(sol)}</b>")))
    for i in range(128):
        t = i % 3
        if t == 0:
            while True:
                k, p, q, c = pick_nz(r, -5, 6), r.choice([1, 2, 3]), pick_nz(r, -6, 6), r.randint(-4, 4)
                if k * p != c:
                    break
            x0 = Fr(pick_nz(r, -8, 8), r.choice([1, 1, 2]))
            d = k * (p * x0 + q) - c * x0
            if d.denominator != 1:
                d = Fr(round(d))
            sol = solve_lin(k * p, k * q, c, d)
            assert k * (p * sol + q) == c * sol + d
            L[3].append((m(f"{fnum(k)}({lin(p, q).html()}) = {lin(c, d).html()}"),
                         m(f"{lin(k * p, k * q).html()} = {lin(c, d).html()} ⇒ <b><i>x</i> = {fnum(sol)}</b>")))
        elif t == 1:
            n, q, x0 = r.choice([2, 3, 4, 5]), pick_nz(r, -6, 6), pick_nz(r, -6, 6) * 1
            xv = x0 * n
            c = Fr(xv, n) + q
            L[3].append((m(f"{fr('<i>x</i>', n)} + {q} = {fnum(c)}".replace("+ -", f"{MINUS} ")),
                         m(f"{fr('<i>x</i>', n)} = {fnum(c - q)} ⇒ <b><i>x</i> = {fnum(xv)}</b>")))
        else:
            p, q, s, t2 = r.randint(1, 4), pick_nz(r, -5, 5), r.randint(1, 4), pick_nz(r, -5, 5)
            # (x+p)(x+q) = (x+s)(x+t2) + c with a nice solution
            x0 = pick_nz(r, -6, 6)
            lhs = (x + p) * (x + q)
            rhs0 = (x + s) * (x + t2)
            if p + q == s + t2:
                t2 += 1
                rhs0 = (x + s) * (x + t2)
            c = lhs.ev({"x": x0}) - rhs0.ev({"x": x0})
            rhs = rhs0 + c
            diff = lhs - rhs
            k1 = diff.t.get((("x", 1),), Fr(0))
            k0 = diff.t.get((), Fr(0))
            sol = -k0 / k1
            assert lhs.ev({"x": sol}) == rhs.ev({"x": sol})
            ctxt = f" + {fnum(c)}" if c > 0 else (f" {MINUS} {fnum(-c)}" if c < 0 else "")
            L[3].append((m(f"({(x + p).html()})({(x + q).html()}) = ({(x + s).html()})({(x + t2).html()}){ctxt}"),
                         m(f"<i>x</i><sup>2</sup> fällt weg: {(lhs - (x ** 2)).html()} = {(rhs - (x ** 2)).html()} ⇒ <b><i>x</i> = {fnum(sol)}</b>")))
    return L


REL_FLIP = {"<": ">", ">": "<", "≤": "≥", "≥": "≤"}
REL_H = {"<": "&lt;", ">": "&gt;", "≤": "≤", "≥": "≥"}


def ungleichungen():
    r = random.Random(85)
    L = {1: [], 2: [], 3: []}

    def make(p1, q1, p2, q2, rel):
        k = p1 - p2
        bound = Fr(q2 - q1) / k
        rr = REL_FLIP[rel] if k < 0 else rel
        # verify with points on both sides of the bound
        hold = {"<": lambda u, v: u < v, ">": lambda u, v: u > v, "≤": lambda u, v: u <= v, "≥": lambda u, v: u >= v}
        side = -1 if rr in "<≤" else 1
        inside, outside = bound + side * Fr(1, 3), bound - side * Fr(1, 3)
        assert hold[rel](p1 * inside + q1, p2 * inside + q2) and not hold[rel](p1 * outside + q1, p2 * outside + q2)
        flip = " (Zeichen umdrehen)" if k < 0 else ""
        sol = m(f"{lin(k, 0).html()} {REL_H[rel]} {fnum(q2 - q1)}") + f"<span class='small'>{flip}</span> ⇒ " + m(f"<b><i>x</i> {REL_H[rr]} {fnum(bound)}</b>")
        return m(f"{lin(p1, q1).html()} {REL_H[rel]} {lin(p2, q2).html()}"), sol

    rels = ["<", ">", "≤", "≥"]
    for i in range(176):
        p, x0, q = r.randint(2, 9), pick_nz(r, -8, 8), pick_nz(r, -9, 9)
        L[1].append(make(p, q, 0, p * x0 + q, rels[i % 4]))
    for i in range(144):
        p, x0, q = -r.randint(1, 7), pick_nz(r, -8, 8), pick_nz(r, -9, 9)
        L[2].append(make(p, q, 0, p * x0 + q, rels[i % 4]))
    for i in range(128):
        while True:
            p1, p2 = pick_nz(r, -6, 7), r.randint(-5, 5)
            if p1 != p2:
                break
        x0, q1 = pick_nz(r, -7, 7), r.randint(-9, 9)
        q2 = (p1 - p2) * x0 + q1
        if i % 2:
            k = r.choice([2, 3, -2])
            if q1 % k == 0:
                t, s = make(p1, q1, p2, q2, rels[i % 4])
                inner = lin(Fr(p1, k), Fr(q1, k))
                if all(c.denominator == 1 for c in inner.t.values()):
                    t = m(f"{fnum(k)}({inner.html()}) {REL_H[rels[i % 4]]} {lin(p2, q2).html()}")
                L[3].append((t, s))
                continue
        L[3].append(make(p1, q1, p2, q2, rels[i % 4]))
    return L


def bruchterme():
    r = random.Random(86)
    L = {1: [], 2: [], 3: []}
    for i in range(160):
        t = i % 3
        if t == 0:
            k, a0 = r.randint(2, 9), pick_nz(r, -9, 9)
            den = x - a0
            L[1].append(("Definitionsmenge: " + m(fr(k, den.html())), m(f"<b>D = ℚ \\ {{{fnum(a0)}}}</b>")))
        elif t == 1:
            g = r.randint(2, 6)
            while True:
                p, q = r.randint(1, 5), r.randint(1, 5)
                if math.gcd(p, q) == 1 and (p, q) != (1, 1):
                    break
            e1, e2 = r.randint(1, 3), r.randint(1, 3)
            num, den = g * p * x ** e1, g * q * x ** e2
            e = e1 - e2
            rn = (p * x ** e) if e > 0 else P.of(p)
            rd = (q * x ** (-e)) if e < 0 else P.of(q)
            res = rn.html() if rd == P.of(1) else fr(rn.html(), rd.html())
            L[1].append(("Kürze: " + m(fr(num.html(), den.html())), m(f"<b>{res}</b>")))
        else:
            p, q, c = r.randint(1, 9), r.randint(1, 9), pick_nz(r, -6, 6)
            den = (x + c).html()
            L[1].append((m(f"{fr(p, den)} + {fr(q, den)}"), m(f"<b>{fr(p + q, den)}</b>")))
    for i in range(144):
        t = i % 4
        if t == 0:
            a0 = pick_nz(r, -7, 7)
            L[2].append(("Definitionsmenge: " + m(fr(1, f"<i>x</i>({(x - a0).html()})")),
                         m(f"<b>D = ℚ \\ {{{', '.join(fnum(v) for v in sorted([0, a0]))}}}</b>".replace(", ", "; "))))
        elif t == 1:
            k = r.randint(2, 9)
            s = r.choice([1, -1])
            L[2].append(("Kürze: " + m(fr((x ** 2 - k * k).html(), (x + s * k).html())), m(f"<b>{(x - s * k).html()}</b>")))
        elif t == 2:
            p, q, kk = r.randint(1, 9), r.randint(1, 9), r.randint(2, 5)
            L[2].append((m(f"{fr(p, X)} + {fr(q, f'{kk}{X}')}"), m(f"{fr(p * kk, f'{kk}{X}')} + {fr(q, f'{kk}{X}')} = <b>{fr(p * kk + q, f'{kk}{X}')}</b>")))
        else:
            p, q, s, t2 = r.randint(1, 6), r.randint(2, 6), r.randint(2, 9), r.randint(2, 6)
            n, d = p * s, q * t2
            g = math.gcd(n, d)
            N, D = n // g, d // g
            res = fr(N, f"{'' if D == 1 else D}{X}")
            L[2].append((m(f"{fr(f'{p}{X}' if p > 1 else X, q)} · {fr(s, f'{t2}{X}<sup>2</sup>')}"), m(f"{fr(f'{n}{X}', f'{d}{X}<sup>2</sup>')} = <b>{res}</b>")))
    for i in range(128):
        t = i % 4
        if t == 0:
            p, q = r.randint(2, 9), r.randint(1, 9)
            L[3].append((m(f"{fr(p, X)} {MINUS} {fr(q, f'{X}<sup>2</sup>')}"), m(f"<b>{fr(f'{p}{X} {MINUS} {q}', f'{X}<sup>2</sup>')}</b>")))
        elif t == 1:
            c = pick_nz(r, -6, 6)
            num = (2 * x + c).html()
            L[3].append((m(f"{fr(1, X)} + {fr(1, (x + c).html())}"), m(f"<b>{fr(num, f'{X}({(x + c).html()})')}</b>")))
        elif t == 2:
            p, q, s, t2 = r.randint(1, 9), r.randint(1, 5), r.randint(1, 9), r.randint(1, 5)
            n, d = p * t2, q * s
            g = math.gcd(n, d)
            N, D = n // g, d // g
            res = f"{'' if N == 1 else N}{X}" if D == 1 else fr(f"{'' if N == 1 else N}{X}", D)
            L[3].append((m(f"{fr(p, f'{q}{X}' if q > 1 else X)} : {fr(s, f'{t2}{X}<sup>2</sup>' if t2 > 1 else f'{X}<sup>2</sup>')}"),
                         m(f"{fr(p, f'{q}{X}' if q > 1 else X)} · {fr(f'{t2}{X}<sup>2</sup>' if t2 > 1 else f'{X}<sup>2</sup>', s)} = <b>{res}</b>")))
        else:
            k = r.randint(1, 8)
            num, den = (x + k) ** 2, x ** 2 - k * k
            L[3].append(("Kürze und gib D an: " + m(fr(num.html(), den.html())),
                         m(f"{fr(f'({(x + k).html()})<sup>2</sup>', f'({(x + k).html()})({(x - k).html()})')} = <b>{fr((x + k).html(), (x - k).html())}</b>, D = ℚ \\ {{{MINUS}{k}; {k}}}")))
    return L


# ---- derivatives: single variable with rational exponents
def mono(c, e):
    """c·x^e as HTML (no sign handling for c < 0 beyond a leading minus)."""
    c, e = Fr(c), Fr(e)
    s = MINUS if c < 0 else ""
    a = abs(c)
    if e == 0:
        return s + fnum(a)
    if e > 0:
        xs = X if e == 1 else (f"√{X}" if e == Fr(1, 2) else f"{X}<sup>{ftext(e)}</sup>")
        return s + ("" if a == 1 else fnum(a)) + xs
    den = X if e == -1 else (f"√{X}" if e == Fr(-1, 2) else f"{X}<sup>{ftext(-e)}</sup>")
    if a.denominator != 1:
        den = f"{a.denominator}{den}"
    return s + fr(a.numerator, den)


def dpoly(terms):
    """terms: list of (c, e) -> HTML sum."""
    out = []
    for i, (c, e) in enumerate([t for t in terms if t[0] != 0]):
        body = mono(abs(c), e)
        out.append(((MINUS if c < 0 else "") + body) if i == 0 else ((f" {MINUS} " if c < 0 else " + ") + body))
    return "".join(out) or "0"


def deriv(terms):
    return [(Fr(c) * e, Fr(e) - 1) for c, e in terms if e != 0]


def dev(terms, x0):
    return sum(Fr(c) * Fr(x0) ** int(e) if Fr(e).denominator == 1 else Fr(c) * Fr(x0) ** e for c, e in terms)


def ableiten():
    r = random.Random(87)
    L = {1: [], 2: [], 3: []}
    for i in range(160):
        degs = sorted(r.sample([0, 1, 2, 3, 4, 5], r.choice([2, 3])), reverse=True)
        f = [(pick_nz(r, -7, 7), d) for d in degs]
        L[1].append((m(f"<i>f</i>(<i>x</i>) = {dpoly(f)}"), m(f"<i>f</i>′(<i>x</i>) = <b>{dpoly(deriv(f))}</b>")))
    for i in range(144):
        t = i % 2
        if t == 0:
            f = [(r.choice([1, 2, 3, -2, 4]), r.choice([2, 3])), (r.choice([1, 2, 3, -1, 4]), r.choice([-1, -2])), (r.choice([2, 4, 6, -2]), Fr(1, 2))]
            r.shuffle(f)
            f.sort(key=lambda t_: -t_[1])
            L[2].append((m(f"<i>f</i>(<i>x</i>) = {dpoly(f)}"), m(f"<i>f</i>′(<i>x</i>) = <b>{dpoly(deriv(f))}</b>")))
        else:
            degs = sorted(r.sample([1, 2, 3], 2), reverse=True)
            f = [(pick_nz(r, -4, 4), d) for d in degs] + [(pick_nz(r, -5, 5), 0)]
            x0 = pick_nz(r, -3, 3)
            dv = sum(Fr(c) * e * Fr(x0) ** (e - 1) for c, e in f if e != 0)
            L[2].append((f"Steigung von {m(f'<i>f</i>(<i>x</i>) = {dpoly(f)}')} an der Stelle {m(f'<i>x</i> = {fnum(x0)}')}",
                         m(f"<i>f</i>′(<i>x</i>) = {dpoly(deriv(f))}, <b><i>f</i>′({fnum(x0)}) = {fnum(dv)}</b>")))
    for i in range(128):
        t = i % 2
        if t == 0:
            f = [(r.choice([1, -1, 2, Fr(1, 2)]), 2), (pick_nz(r, -4, 4), 1), (r.randint(-5, 5), 0)]
            x0 = pick_nz(r, -3, 3)
            y0 = sum(Fr(c) * Fr(x0) ** e for c, e in f)
            mm = sum(Fr(c) * e * Fr(x0) ** (e - 1) for c, e in f if e != 0)
            bb = y0 - mm * x0
            tangent = dpoly([(mm, 1), (bb, 0)])
            # check: tangent touches f at x0
            assert mm * x0 + bb == y0
            L[3].append((f"Tangente an {m(f'<i>f</i>(<i>x</i>) = {dpoly(f)}')} bei {m(f'<i>x</i><sub>0</sub> = {fnum(x0)}')}",
                         m(f"<i>f</i>({fnum(x0)}) = {fnum(y0)}, <i>m</i> = {fnum(mm)}, <b><i>t</i>(<i>x</i>) = {tangent}</b>")))
        else:
            k, c = r.randint(1, 3), r.randint(-4, 4)
            f = [(1, 3), (-3 * k * k, 1), (c, 0)]
            ys = [Fr(v) ** 3 - 3 * k * k * v + c for v in (-k, k)]
            L[3].append((f"Wo hat {m(f'<i>f</i>(<i>x</i>) = {dpoly(f)}')} eine waagerechte Tangente?",
                         m(f"<i>f</i>′(<i>x</i>) = 3<i>x</i><sup>2</sup> {MINUS} {3 * k * k} = 0 ⇒ <b><i>x</i> = ±{k}</b>") + f" (Punkte {m(f'({MINUS}{k} | {fnum(ys[0])})')} und {m(f'({k} | {fnum(ys[1])})')})"))
    return L


# ================================================================ physics
G = 9.81


def druck():
    r = random.Random(91)
    L = {1: [], 2: [], 3: []}
    for i in range(144):
        t = i % 3
        if t == 0:
            A = r.choice([2, 3, 4, 5, 6, 8, 10, 12, 15, 20, 25]); F = A * r.randint(4, 60)
            L[1].append((f"Kraft {m(f'{F} N')} auf Fläche {m(f'{A} cm²')}. Berechne den Druck in N/cm².", f"{m(f'<i>p</i> = {F} N : {A} cm² = ')}<b>{de(F / A)} N/cm²</b>"))
        elif t == 1:
            v = round(r.uniform(0.2, 9.9), 1)
            L[1].append((f"Rechne {de(v)} bar in hPa um.", f"<b>{de(v * 1000, 0)} hPa</b> (1 bar = 1 000 hPa)"))
        else:
            v = r.randint(5, 300) * 10
            L[1].append((f"Rechne {de(v, 0)} hPa in Pa um.", f"<b>{de(v * 100, 0)} Pa</b> (1 hPa = 100 Pa)"))
    for i in range(128):
        t = i % 3
        if t == 0:
            A = r.choice([4, 5, 8, 10, 15, 20, 25, 40]); F = A * r.randint(10, 80)
            p = F / A / 10
            L[2].append((f"Ein Kolben ({m(f'{A} cm²')}) wird mit {m(f'{de(F, 0)} N')} gedrückt. Wie groß ist der Druck in bar?", f"{de(F / A)} N/cm² = <b>{de(p, 2)} bar</b>"))
        elif t == 1:
            pb, A = r.choice([1.5, 2, 2.5, 3, 3.5, 4, 5, 6, 8, 10]), r.choice([2, 4, 5, 8, 10, 12, 15, 20, 25, 30])
            F = pb * 10 * A
            L[2].append((f"In einem Zylinder herrschen {m(f'{de(pb)} bar')}. Welche Kraft wirkt auf einen Kolben mit {m(f'{A} cm²')}?", f"{de(pb * 10)} N/cm² · {A} cm² = <b>{de(F, 1)} N</b>"))
        else:
            c = r.choice([50, 150, 250, 400, 800, 1200, 1500, 2500, 4000, 7500, 25000, 60000])
            L[2].append((f"Rechne {de(c, 0)} cm² in m² um.", f"<b>{de(c / 10000, 4)} m²</b> (1 m² = 10 000 cm²)"))
    hard = [
        ("Eine Reißzwecke wird mit 30 N eingedrückt. Die Spitze hat 0,1 mm² = 0,0000001 m². Wie groß ist der Druck an der Spitze in bar?", f"<i>p</i> = 30 N : 0,0000001 m² = 300 000 000 Pa = <b>3 000 bar</b>"),
        ("Eine Person (Gewichtskraft 600 N) steht auf Schneeschuhen (2 · 1 200 cm²) bzw. auf Schuhen (2 · 200 cm²). Vergleiche die Drücke.", "Schneeschuhe: 600 N : 2 400 cm² = <b>0,25 N/cm²</b>; Schuhe: 600 N : 400 cm² = <b>1,5 N/cm²</b>, also sechsmal so groß."),
        ("Eine Luftpumpe enthält 100 cm³ Luft bei 1 bar. Sie wird ohne Temperaturänderung auf 25 cm³ zusammengedrückt. Welcher Druck herrscht jetzt? (p · V = konstant)", "<i>p</i> = 1 bar · 100 : 25 = <b>4 bar</b>"),
        ("Warum kann man Wasser in einer Spritze kaum, Luft aber leicht zusammendrücken? Erkläre mit dem Teilchenmodell.", "In Gasen sind die Teilchen weit voneinander entfernt, die Zwischenräume lassen sich verkleinern. In Flüssigkeiten liegen die Teilchen dicht beieinander."),
        ("Ein Fahrradreifen hat 4 bar Überdruck, die Auflagefläche ist 8 cm². Welche Gewichtskraft trägt der Reifen ungefähr?", "4 bar = 40 N/cm², <i>F</i> = 40 N/cm² · 8 cm² = <b>320 N</b>"),
        ("Wie groß muss eine Fläche sein, damit 1 200 N einen Druck von 3 bar erzeugen?", "3 bar = 30 N/cm², <i>A</i> = 1 200 N : 30 N/cm² = <b>40 cm²</b>"),
        ("Bei der Spritzkugel drückt man oben auf den Kolben. Warum spritzt das Wasser auch seitlich und nach oben heraus?", "In einer eingeschlossenen Flüssigkeit breitet sich der Druck <b>in alle Richtungen gleich</b> aus (Kolbendruck)."),
        ("Ein Elefant (50 000 N) steht auf vier Füßen mit je 0,12 m². Eine Frau (600 N) steht auf einem Absatz von 1 cm². Wer übt den größeren Druck aus?", "Elefant: 50 000 N : 0,48 m² ≈ <b>104 000 Pa</b>; Absatz: 600 N : 0,0001 m² = <b>6 000 000 Pa</b>, der Absatz drückt etwa 58-mal stärker."),
    ]
    L[3] = hard
    return L


def hydraulik():
    r = random.Random(92)
    L = {1: [], 2: [], 3: []}
    for i in range(128):
        A1, k, F1 = r.choice([1, 2, 3, 4, 5, 8, 10]), r.choice([4, 5, 8, 10, 12, 15, 20, 25, 40, 50]), r.randint(2, 30) * 10
        A2 = A1 * k
        L[1].append((f"{m(f'<i>A</i><sub>1</sub> = {A1} cm²')}, {m(f'<i>F</i><sub>1</sub> = {F1} N')}, {m(f'<i>A</i><sub>2</sub> = {A2} cm²')}. Berechne {m('<i>F</i><sub>2</sub>')}.",
                     f"{m(f'<i>F</i><sub>2</sub> = {F1} N · {A2} : {A1} = ')}<b>{de(F1 * k, 0)} N</b>"))
    for i in range(128):
        t = i % 2
        if t == 0:
            A1, F1, F2 = r.choice([1, 2, 4, 5, 8]), r.choice([50, 80, 100, 120, 150, 200, 250]), r.randint(4, 30) * 1000
            A2 = F2 * A1 / F1
            L[2].append((f"Mit {m(f'{F1} N')} am kleinen Kolben ({m(f'{A1} cm²')}) soll eine Last von {m(f'{de(F2, 0)} N')} gehoben werden. Wie groß muss {m('<i>A</i><sub>2</sub>')} sein?",
                         f"<i>p</i> = {de(F1 / A1)} N/cm², <i>A</i><sub>2</sub> = {de(F2, 0)} : {de(F1 / A1)} = <b>{de(A2, 1)} cm²</b>"))
        else:
            A1, k, s1 = r.choice([1, 2, 3, 4, 5, 8]), r.choice([5, 8, 10, 16, 20, 25, 40, 50]), r.choice([5, 8, 10, 12, 15, 20, 25, 30, 40])
            A2 = A1 * k
            L[2].append((f"Der kleine Kolben ({m(f'{A1} cm²')}) wird {m(f'{s1} cm')} hineingedrückt. Wie weit hebt sich der große ({m(f'{A2} cm²')})?",
                         f"<i>s</i><sub>2</sub> = {A1} · {s1} : {A2} = <b>{de(s1 / k, 3)} cm</b>"))
    L[3] = [
        ("Ein Wagenheber hat A₁ = 2 cm² und A₂ = 50 cm². Pro Pumpstoß bewegt sich der kleine Kolben 5 cm. Wie viele Pumpstöße braucht man, um ein Auto 10 cm anzuheben?", "Pro Stoß: s₂ = 2 · 5 : 50 = 0,2 cm. Anzahl: 10 : 0,2 = <b>50 Pumpstöße</b>"),
        ("F₁ = 120 N, s₁ = 30 cm, A₁ = 3 cm², A₂ = 90 cm². Berechne F₂ und s₂ und prüfe die Goldene Regel der Mechanik.", "F₂ = <b>3 600 N</b>, s₂ = <b>1 cm</b>; F₁·s₁ = 3 600 N·cm = F₂·s₂ ✓"),
        ("Warum werden Autobremsen „entlüftet“?", "Luft lässt sich zusammendrücken. Luftblasen würden federn, ein Teil des Pedalwegs ginge verloren und die Bremse wäre <b>schwammig</b>."),
        ("Eine Hebebühne soll ein Auto mit 15 000 N heben. Der große Kolben hat 600 cm². Welcher Druck in bar ist nötig?", "<i>p</i> = 15 000 N : 600 cm² = 25 N/cm² = <b>2,5 bar</b>"),
        ("Kann man mit einer hydraulischen Anlage Energie gewinnen? Begründe.", "<b>Nein.</b> Die Kraft wird größer, der Weg im gleichen Verhältnis kleiner: F₁·s₁ = F₂·s₂."),
        ("Bei einer Presse ist der große Kolben 4-mal so breit (Durchmesser) wie der kleine. Wie groß ist die Kraftverstärkung?", "Die Fläche wächst mit dem Quadrat des Durchmessers: <b>16-fach</b>."),
        ("Der kleine Kolben (5 cm²) wird mit 80 N gedrückt. Der große Kolben hebt eine Last von 3 200 N. Wie groß ist A₂?", "<i>p</i> = 16 N/cm², A₂ = 3 200 : 16 = <b>200 cm²</b>"),
    ]
    return L


def schweredruck():
    r = random.Random(93)
    L = {1: [], 2: [], 3: []}
    for i in range(128):
        h = r.randint(1, 60)
        p = 1000 * G * h
        L[1].append((f"Wie groß ist der Schweredruck in {m(f'{h} m')} Wassertiefe (in hPa)?", f"{m(f'1 000 · 9,81 · {h} = ')}{de(p, 0)} Pa = <b>{de(p / 100, 0)} hPa</b>"))
    for i in range(128):
        t = i % 3
        if t == 0:
            name, rho = r.choice([("Meerwasser", 1025), ("Speiseöl", 920), ("Spiritus", 790)])
            h = r.randint(1, 40)
            p = rho * G * h
            L[2].append((f"Schweredruck in {m(f'{h} m')} Tiefe in {name} ({de(rho, 0)} kg/m³), in Pa?", f"<b>{de(p, 0)} Pa</b>"))
        elif t == 1:
            h = r.randint(2, 30) * 10
            p = 1000 * G * h / 100
            L[2].append((f"Aquarium, {m(f'{h} cm')} tief. Schweredruck am Boden in Pa?", f"{h} cm = {de(h / 100)} m, <b>{de(p, 1)} Pa</b>"))
        else:
            pb = r.choice([0.2, 0.5, 0.8, 1, 1.5, 2, 2.5, 3, 4, 5, 6, 8])
            h = pb * 100000 / (1000 * G)
            L[2].append((f"In welcher Wassertiefe beträgt der Schweredruck {m(f'{de(pb)} bar')}?", f"<i>h</i> = {de(pb * 100000, 0)} : (1 000 · 9,81) ≈ <b>{de(h, 1)} m</b>"))
    L[3] = [
        ("Ein Taucher ist 25 m tief im Süßwasser. Gesamtdruck mit Luftdruck (1 013 hPa) in bar?", f"Schweredruck {de(1000 * G * 25 / 100, 0)} hPa + 1 013 hPa = <b>{de((1013 + 1000 * G * 25 / 100) / 1000, 2)} bar</b>"),
        ("Ein U-Boot-Fenster (0,05 m²) ist 100 m tief im Meer (1 025 kg/m³). Welche Kraft drückt das Wasser darauf?", f"<i>p</i> = 1 025 · 9,81 · 100 ≈ {de(1025 * G * 100, 0)} Pa, <i>F</i> = <i>p</i> · <i>A</i> ≈ <b>{de(1025 * G * 100 * 0.05, 0)} N</b>"),
        ("Wie hoch muss eine Quecksilbersäule (13 600 kg/m³) sein, um 1 013 hPa zu erzeugen?", f"<i>h</i> = 101 300 : (13 600 · 9,81) ≈ <b>{de(101300 / (13600 * G), 2)} m</b> (≈ 76 cm)"),
        ("Drei Gefäße (schmal, breit, trichterförmig) sind gleich hoch mit Wasser gefüllt. Wo ist der Druck am Boden am größten?", "<b>Überall gleich</b>: Der Schweredruck hängt nur von Tiefe und Dichte ab (hydrostatisches Paradoxon)."),
        ("Warum ist eine Staumauer unten dicker als oben?", "Der Wasserdruck wächst mit der Tiefe, unten wirken die <b>größten Kräfte</b>."),
        ("Ein Wasserturm steht 40 m über einem Haus. Welcher Wasserdruck herrscht im Haus (ohne Luftdruck) in bar?", f"<i>p</i> = 1 000 · 9,81 · 40 = {de(1000 * G * 40, 0)} Pa ≈ <b>{de(1000 * G * 40 / 100000, 2)} bar</b>"),
        ("In welcher Tiefe ist der Druck im Meer doppelt so groß wie an der Oberfläche?", f"Schweredruck = 1 013 hPa: <i>h</i> = 101 300 : (1 025 · 9,81) ≈ <b>{de(101300 / (1025 * G), 1)} m</b>"),
    ]
    return L


def auftrieb():
    r = random.Random(94)
    L = {1: [], 2: [], 3: []}
    for i in range(128):
        V = r.randint(1, 100) * 20
        FA = 1000 * V / 1e6 * G
        L[1].append((f"Ein Körper mit {m(f'{V} cm³')} ist ganz in Wasser. Wie groß ist der Auftrieb?", f"{m(f'1 000 · 9,81 · {de(V / 1e6, 6)} = ')}<b>{de(FA, 3)} N</b>"))
    pairs = [("Kork", 240, "Wasser", 1000), ("Eisen", 7870, "Wasser", 1000), ("Eis", 920, "Spiritus", 790), ("Eis", 920, "Meerwasser", 1025), ("Eisen", 7870, "Quecksilber", 13600), ("Aluminium", 2700, "Wasser", 1000)]
    for bn, rb, ln, rl in pairs:
        L[1].append((f"Schwimmt {bn} ({de(rb, 0)} kg/m³) in {ln} ({de(rl, 0)} kg/m³)?", f"<b>{'Schwimmt' if rb < rl else 'Sinkt'}</b>, weil die Dichte {'kleiner' if rb < rl else 'größer'} ist."))
    for i in range(128):
        t = i % 3
        if t == 0:
            name, rb = r.choice([("Aluminium", 2700), ("Eisen", 7870), ("Stein", 2600)])
            V = r.randint(1, 30) * 10
            FG, FA = rb * V / 1e6 * G, 1000 * V / 1e6 * G
            L[2].append((f"{name} ({V} cm³, {de(rb, 0)} kg/m³) hängt am Kraftmesser ganz im Wasser. Was zeigt er an?", f"F<sub>G</sub> = {de(FG, 3)} N, F<sub>A</sub> = {de(FA, 3)} N, Anzeige <b>{de(FG - FA, 3)} N</b>"))
        elif t == 1:
            name, rb = r.choice([("Holz", 600), ("Eis", 920), ("Kork", 240), ("Kunststoff", 800)])
            L[2].append((f"Wie viel Prozent eines schwimmenden {name}-Stücks ({de(rb, 0)} kg/m³) liegen unter Süßwasser?", f"{de(rb, 0)} : 1 000 = <b>{de(rb / 10, 0)} %</b>"))
        else:
            mm, V = r.randint(2, 50) * 10, r.randint(2, 30) * 10
            rho = mm / V * 1000
            L[2].append((f"Ein Körper hat {m(f'{mm} g')} und {m(f'{V} cm³')}. Schwimmt er in Wasser?", f"ρ = {de(mm / V, 2)} g/cm³ = {de(rho, 0)} kg/m³, er <b>{'sinkt' if rho > 1000 else 'schwimmt'}</b>."))
    L[3] = [
        ("Ein Stein wiegt an der Luft 5,0 N und im Wasser 3,0 N. Berechne Auftrieb, Volumen und Dichte.", "F<sub>A</sub> = 2,0 N, V = 2,0 : (1 000 · 9,81) ≈ <b>204 cm³</b>, m ≈ 510 g, ρ ≈ <b>2 500 kg/m³</b>"),
        ("Ein Floß aus Holz (0,5 m³, 600 kg/m³) schwimmt im See. Welche Last kann es höchstens tragen, ohne unterzugehen?", "Auftrieb ganz eingetaucht: 1 000 · 9,81 · 0,5 = 4 905 N; Gewicht Floß 2 943 N; Last <b>≈ 1 962 N (200 kg)</b>"),
        ("Warum schwimmt ein Schiff aus Stahl, obwohl Stahl eine größere Dichte als Wasser hat?", "Der Rumpf ist <b>hohl</b>. Mit der Luft darin ist die mittlere Dichte kleiner als die von Wasser, das Schiff verdrängt viel Wasser."),
        ("Wie taucht ein U-Boot ab und wieder auf?", "Abtauchen: Tanks <b>fluten</b> (mehr Masse). Auftauchen: Wasser mit <b>Druckluft</b> herauspressen."),
        ("Ein Eisberg ragt 50 m³ aus dem Meer (Eis 920, Meerwasser 1 025 kg/m³). Wie groß ist er insgesamt?", "Über Wasser 1 − 920/1 025 ≈ 10,2 %. Gesamt ≈ 50 : 0,102 ≈ <b>490 m³</b>"),
        ("Erkläre mit dem Schweredruck, warum es Auftrieb gibt.", "An der Unterseite ist der Körper tiefer, dort ist der <b>Druck größer</b> als oben. Die Differenz der Kräfte zeigt nach oben."),
        ("Ein rohes Ei sinkt in Leitungswasser, schwimmt aber in sehr salzigem Wasser. Warum?", "Salz erhöht die Dichte des Wassers über die Dichte des Eis (≈ 1 050 kg/m³), der Auftrieb wird größer."),
    ]
    return L


def luftdruck():
    r = random.Random(95)
    L = {1: [], 2: [], 3: []}
    for i in range(128):
        t = i % 3
        if t == 0:
            v = r.randint(600, 1050)
            L[1].append((f"Rechne {de(v, 0)} hPa in Pa um.", f"<b>{de(v * 100, 0)} Pa</b>"))
        elif t == 1:
            h = r.randint(2, 100) * 8
            L[1].append((f"Um wie viel hPa sinkt der Luftdruck ungefähr, wenn man {h} m höher steigt? (1 hPa pro 8 m)", f"<b>{de(h / 8, 0)} hPa</b>"))
        else:
            v = r.randint(600, 1050)
            L[1].append((f"Rechne {de(v, 0)} hPa in bar um.", f"<b>{de(v / 1000, 3)} bar</b>"))
    for i in range(128):
        t = i % 2
        if t == 0:
            what, A, u = r.choice([("eine Tischplatte", 1.2, "m²"), ("eine Tür", 1.8, "m²"), ("ein Fenster", 0.75, "m²"), ("eine Handfläche", 150, "cm²"), ("ein Heft", 600, "cm²")])
            Am2 = A if u == "m²" else A / 10000
            F = 101300 * Am2
            L[2].append((f"Mit welcher Kraft drückt die Luft (1 013 hPa) auf {what} ({de(A)} {u})?", f"<i>F</i> = 101 300 Pa · {de(Am2, 4)} m² ≈ <b>{de(F, 0)} N</b>"))
        else:
            p0, dp = r.randint(990, 1030), r.randint(3, 60)
            L[2].append((f"Im Tal: {de(p0, 0)} hPa, auf dem Hügel: {de(p0 - dp, 0)} hPa. Wie hoch ist der Hügel ungefähr?", f"{dp} hPa · 8 m = <b>{dp * 8} m</b>"))
    L[3] = [
        ("Magdeburger Halbkugeln: Radius 25 cm, innen fast luftleer. Mit welcher Kraft werden sie zusammengedrückt?", f"<i>A</i> = π · 0,25² ≈ 0,196 m², <i>F</i> ≈ 101 300 · 0,196 ≈ <b>{de(101300 * math.pi * 0.25 ** 2, 0)} N</b> (≈ 2 t)"),
        ("Flugzeugfenster (0,1 m²): innen 750 hPa, außen 250 hPa. Welche Kraft drückt auf das Fenster?", "Δp = 500 hPa = 50 000 Pa, <i>F</i> = 50 000 · 0,1 = <b>5 000 N</b> nach außen"),
        ("Warum werden wir vom Luftdruck nicht zerdrückt?", "Er wirkt <b>von allen Seiten</b>, und im Körper herrscht derselbe Druck. Die Kräfte heben sich auf."),
        ("Erkläre, warum man mit einem Strohhalm trinken kann.", "Im Mund wird der Druck verringert. Der äußere <b>Luftdruck drückt</b> das Getränk in den Halm."),
        ("Warum kochen Nudeln auf der Zugspitze (≈ 700 hPa) langsamer?", "Bei kleinerem Luftdruck siedet Wasser schon bei <b>etwa 90 °C</b>. Das Wasser wird nicht heißer, die Nudeln garen langsamer."),
        ("Ein Quecksilberbarometer zeigt 745 mm. Welcher Luftdruck in hPa ist das? (760 mm ≙ 1 013 hPa)", f"745 : 760 · 1 013 ≈ <b>{de(745 / 760 * 1013, 0)} hPa</b>, ein Tief."),
        ("Eine verschlossene Plastikflasche wird auf einem Berg geleert und verschlossen. Was passiert im Tal?", "Im Tal ist der äußere Luftdruck größer, die Flasche wird <b>eingedrückt</b>."),
    ]
    return L


# ================================================================ biology (text tasks)
def osmose():
    return {
        1: [
            ("Was versteht man unter Osmose?", "Diffusion von <b>Wasser</b> durch eine selektiv permeable Membran zur Seite mit mehr gelösten Teilchen."),
            ("Was bedeutet „selektiv permeabel“?", "Die Membran lässt <b>Wasser durch</b>, gelöste Teilchen nicht (halbdurchlässig)."),
            ("Ordne zu: Außen sind weniger gelöste Teilchen als in der Zelle. Hypo-, iso- oder hypertonisch?", "<b>hypotonisch</b>"),
            ("In welche Richtung strömt Wasser bei einer hypertonischen Außenlösung?", "<b>Aus der Zelle heraus.</b>"),
            ("Braucht die Zelle für Osmose Energie (ATP)?", "<b>Nein</b>, Osmose ist passiv."),
            ("Was geschieht mit roten Blutzellen in destilliertem Wasser?", "Sie nehmen Wasser auf und <b>platzen</b> (Hämolyse)."),
            ("Was bedeutet Turgor?", "Der <b>Druck des Zellinhalts gegen die Zellwand</b>, er macht Pflanzen straff."),
            ("Nenne zwei Alltagsbeispiele für Osmose.", "z. B. <b>gesalzener Gurkensalat wird wässrig</b>, <b>welker Salat wird in Wasser wieder knackig</b>, Kirschen platzen im Regen."),
            ("Was bedeutet „isotonisch“?", "Innen und außen sind <b>gleich viele gelöste Teilchen</b>."),
            ("Was ist Plasmolyse?", "Die Pflanzenzelle verliert Wasser, das Zellinnere <b>löst sich von der Zellwand</b>."),
            ("Was ist Deplasmolyse?", "Eine plasmolysierte Zelle nimmt wieder Wasser auf und <b>füllt die Zellwand wieder aus</b>."),
            ("Welche Teilchen können eine selektiv permeable Membran passieren: Wasser oder Zucker?", "<b>Wasser</b>"),
            ("Wie heißen die Wasserkanäle in der Zellmembran?", "<b>Aquaporine</b>"),
            ("Was passiert mit roten Blutzellen in einer hypertonischen Lösung?", "Sie verlieren Wasser und <b>schrumpfen</b> (Stechapfelform)."),
            ("Welche Aufgabe hat die Vakuole einer Pflanzenzelle bei der Osmose?", "Sie ist der <b>Wasserspeicher</b>; ist sie voll, ist die Zelle prall."),
            ("Ergänze: Das Wasser folgt dem …", "<b>Salz</b> (den gelösten Teilchen)."),
        ],
        2: [
            ("Zwiebelhautzellen liegen in konzentrierter Zuckerlösung. Beschreibe, was du unter dem Mikroskop siehst.", "<b>Plasmolyse</b>: Die Vakuole schrumpft, das Zellinnere löst sich von der Zellwand."),
            ("Warum platzt eine Pflanzenzelle in reinem Wasser nicht, eine Blutzelle aber schon?", "Die Pflanzenzelle hat eine <b>feste Zellwand</b>, die dem Turgordruck standhält. Tierzellen haben keine."),
            ("Warum bekommt man bei einer Infusion 0,9 % Kochsalzlösung und kein reines Wasser?", "Die Lösung ist <b>isotonisch</b> zum Blut. Reines Wasser würde Blutzellen platzen lassen."),
            ("Erdbeeren werden gezuckert. Nach kurzer Zeit liegen sie im eigenen Saft. Erkläre.", "Zucker bildet eine <b>hypertonische</b> Lösung, den Zellen wird osmotisch Wasser entzogen."),
            ("Warum verdirbt Marmelade kaum?", "Die hohe Zuckerkonzentration entzieht Bakterien und Pilzen <b>Wasser</b> (Plasmolyse), sie wachsen nicht."),
            ("Unterscheide Diffusion und Osmose in zwei Punkten.", "Diffusion: alle Teilchen, keine Membran nötig. Osmose: <b>nur Wasser</b>, <b>halbdurchlässige Membran</b> nötig."),
            ("Was bedeutet „isotonisch“ für die Wasserbewegung? Bewegt sich gar kein Wasser?", "Wasser bewegt sich <b>in beide Richtungen gleich stark</b>, es gibt keinen Nettostrom."),
            ("Kirschen platzen nach langem Regen. Erkläre mit Fachbegriffen.", "Der zuckerreiche Zellsaft ist <b>hypertonisch</b> zum Regenwasser, Wasser strömt ein, die Haut reißt."),
            ("Welker Salat wird in kaltem Wasser wieder knackig. Erkläre.", "Leitungswasser ist <b>hypotonisch</b>, die Zellen nehmen Wasser auf, der <b>Turgor</b> steigt."),
            ("Warum ist ein Pantoffeltierchen auf eine pulsierende Vakuole angewiesen?", "Im Süßwasser strömt ständig Wasser ein; die Vakuole <b>pumpt es unter Energieaufwand hinaus</b>, sonst würde die Zelle platzen."),
            ("Rote Blutzellen werden in 0,9 %, 0,3 % und 3 % Kochsalzlösung gegeben. Ordne zu: normal, geplatzt, geschrumpft.", "0,9 %: <b>normal</b>; 0,3 %: <b>geplatzt</b>; 3 %: <b>geschrumpft</b>"),
            ("Wie kann man unter dem Mikroskop eine Plasmolyse rückgängig machen?", "Die Salz- oder Zuckerlösung durch <b>destilliertes Wasser</b> ersetzen (Deplasmolyse)."),
            ("Warum werden gesalzene Gurkenscheiben weich?", "Den Zellen wird osmotisch Wasser entzogen, der <b>Turgor sinkt</b>."),
            ("Erkläre den Begriff „Nettostrom“ bei der Osmose.", "Wasser wandert in beide Richtungen; der <b>Überschuss</b> in eine Richtung ist der Nettostrom."),
        ],
        3: [
            ("Kartoffelstäbchen werden 1 h in Zuckerlösungen gelegt. Massenänderung: 0,0 mol/L +12 %, 0,2 mol/L +4 %, 0,4 mol/L −5 %, 0,6 mol/L −11 %. Bestimme ungefähr die Konzentration des Zellsafts.", "Keine Massenänderung zwischen 0,2 und 0,4 mol/L, also isotonisch bei <b>etwa 0,3 mol/L</b>."),
            ("Im Osmometer steigt der Spiegel auf der Zuckerseite und bleibt dann stehen. Warum stoppt der Anstieg?", "Die höhere Wassersäule erzeugt einen <b>Gegendruck</b> (hydrostatisch), zusätzlich wird die Zuckerlösung verdünnt."),
            ("Warum wirkt 0,1 mol/L Kochsalz osmotisch etwa doppelt so stark wie 0,1 mol/L Traubenzucker?", "NaCl zerfällt in <b>zwei Teilchen</b> (Na⁺ und Cl⁻), es zählt die Teilchenzahl."),
            ("Streusalz am Straßenrand: Bäume welken, obwohl der Boden feucht ist. Erkläre.", "Das Bodenwasser wird <b>hypertonisch</b>, die Wurzeln können kein Wasser aufnehmen (physiologische Trockenheit)."),
            ("Ein Pantoffeltierchen wird von Süßwasser in leicht salziges Wasser gesetzt. Wie verändert sich die Tätigkeit der pulsierenden Vakuole?", "Es strömt <b>weniger Wasser</b> ein, die Vakuole pulsiert <b>langsamer</b>."),
            ("Warum sollen Schiffbrüchige kein Meerwasser trinken?", "Das Blut wird <b>hypertonisch</b>, Körperzellen verlieren Wasser, die Niere braucht zusätzlich Wasser für das Salz."),
            ("Plane einen Versuch, mit dem man zeigt, dass Wasser durch eine Membran wandert. Material: Schweinsblase oder Dialyseschlauch, Zuckerlösung, Wasser, Steigrohr.", "Zuckerlösung in den Schlauch, mit Steigrohr verschließen, in Wasser stellen: Der <b>Spiegel im Rohr steigt</b>."),
            ("Warum ist Osmose für Pflanzen lebenswichtig? Nenne zwei Gründe.", "<b>Wasseraufnahme</b> über die Wurzeln und <b>Turgor</b>, der krautige Pflanzen aufrecht hält."),
            ("Ein Fisch aus dem Süßwasser wird ins Meer gesetzt. Welche Probleme bekommt er?", "Das Meerwasser ist <b>hypertonisch</b>, der Fisch verliert ständig Wasser und kann seinen Salzhaushalt nicht regulieren."),
            ("Zu viel Dünger lässt Zimmerpflanzen welken. Erkläre.", "Die Bodenlösung wird <b>hypertonisch</b>, die Wurzelzellen verlieren Wasser."),
            ("Vergleiche das Verhalten von Tier- und Pflanzenzelle in hypotonischer Lösung.", "Tierzelle: schwillt an und <b>platzt</b>. Pflanzenzelle: wird prall, die <b>Zellwand</b> verhindert das Platzen."),
        ],
    }


def nak():
    return {
        1: [
            ("Wie viele Na⁺ und K⁺ befördert die Pumpe pro ATP, und in welche Richtung?", "<b>3 Na⁺ hinaus, 2 K⁺ hinein</b>"),
            ("Wo ist die Na⁺-Konzentration hoch, wo die K⁺-Konzentration?", "Na⁺ <b>außen</b> hoch, K⁺ <b>innen</b> hoch."),
            ("Ist die Na⁺/K⁺-Pumpe ein passiver oder aktiver Transport?", "<b>Aktiv</b> (primär aktiv, sie verbraucht ATP)."),
            ("Was bedeutet „Antiport“?", "Zwei Teilchensorten werden in <b>entgegengesetzte Richtungen</b> befördert."),
            ("Woher bekommt die Pumpe ihre Energie?", "Aus der Spaltung von <b>ATP</b>."),
            ("Läuft die Pumpe nur nach einem Nervenimpuls?", "<b>Nein</b>, sie arbeitet ständig."),
            ("Nenne den Unterschied zwischen Ionenkanal und Pumpe.", "Kanal: offen, Ionen fließen <b>mit</b> dem Gefälle. Pumpe: transportiert <b>gegen</b> das Gefälle mit Formänderung und ATP."),
            ("Was sind Ionen?", "<b>Elektrisch geladene Teilchen</b>, z. B. Na⁺ und K⁺."),
            ("Was ist ATP?", "Der <b>Energieträger</b> der Zelle („aufgeladene Batterie“)."),
            ("In welchem Teil der Zelle sitzt die Na⁺/K⁺-Pumpe?", "In der <b>Zellmembran</b>."),
            ("Wie groß ist das Ruhepotential einer Nervenzelle ungefähr?", "Etwa <b>−70 mV</b>."),
            ("Ist die Zelle in Ruhe innen positiv oder negativ geladen?", "Innen <b>negativ</b>."),
            ("Was bedeutet „gegen das Konzentrationsgefälle“?", "Von der Seite mit <b>wenig</b> zur Seite mit <b>viel</b> Teilchen."),
            ("Nenne zwei Hemmstoffe der Pumpe.", "<b>Ouabain</b> und <b>Digitalis</b>."),
        ],
        2: [
            ("Bringe in die richtige Reihenfolge: K⁺ bindet außen · ATP phosphoryliert · Na⁺ bindet innen · Pumpe klappt nach außen, Na⁺ wird frei · Phosphat wird abgespalten · Pumpe klappt nach innen, K⁺ wird frei.", "<b>Na⁺ bindet innen → ATP phosphoryliert → Umklappen, Na⁺ frei → K⁺ bindet außen → Phosphat ab → Zurückklappen, K⁺ frei</b>"),
            ("Was bewirkt die Phosphorylierung der Pumpe?", "Eine <b>Formänderung</b>: Die Pumpe öffnet sich nach außen, ihre Affinität für Na⁺ sinkt."),
            ("Warum nennt man die Pumpe „elektrogen“?", "Pro Runde gelangt netto <b>eine positive Ladung nach außen</b> (3 raus, 2 rein)."),
            ("Eine Pumpe durchläuft 500 Zyklen. Wie viele Na⁺, K⁺ und ATP sind beteiligt?", "<b>1 500 Na⁺</b> hinaus, <b>1 000 K⁺</b> hinein, <b>500 ATP</b>."),
            ("Wie trägt die Pumpe zur Regulation des Zellvolumens bei?", "Sie befördert <b>mehr Teilchen hinaus</b> als hinein, so strömt kein Wasser osmotisch ein."),
            ("Was passiert mit der Pumpleistung, wenn innen mehr Na⁺ vorliegt?", "Sie <b>steigt</b>, weil mehr Bindungsstellen besetzt werden (Rückkopplung)."),
            ("Was bedeutet Affinität? Wann ist sie für Na⁺ hoch?", "Wie <b>fest</b> ein Ion gebunden wird; für Na⁺ hoch, wenn die Pumpe <b>nach innen offen</b> ist (E1)."),
            ("Erkläre den Unterschied zwischen primär und sekundär aktivem Transport.", "Primär: <b>ATP direkt</b> (Pumpe). Sekundär: nutzt einen <b>Ionengradienten</b> als Antrieb (z. B. Na⁺-Glucose-Symporter)."),
            ("Warum ist die Pumpe für eine Nervenzelle lebenswichtig?", "Sie hält die <b>Ionengradienten</b> aufrecht, ohne die es kein Ruhepotential und keine Aktionspotentiale gäbe."),
            ("Wie viel ATP verbraucht eine Pumpe, die 2 400 Na⁺ hinausbefördert?", "2 400 : 3 = <b>800 ATP</b>"),
            ("Was geschieht, wenn die Pumpe ausfällt, mit der Anzahl gelöster Teilchen in der Zelle und dem Zellvolumen?", "Teilchenzahl <b>steigt</b>, Wasser strömt ein, die Zelle <b>schwillt an</b>."),
            ("Vergleiche die Stellungen E1 und E2 der Pumpe.", "E1: <b>nach innen offen</b>, bindet Na⁺. E2: <b>nach außen offen</b>, bindet K⁺."),
        ],
        3: [
            ("Ouabain hemmt die Pumpe. Beschreibe die Folgen für Konzentrationen und Membranpotential über einige Minuten.", "Na⁺ innen steigt, K⁺ innen sinkt <b>langsam</b>; das Ruhepotential wird <b>weniger negativ</b>, die Zelle schwillt an."),
            ("Eine Mitschülerin sagt: „Die Pumpe repolarisiert die Membran nach dem Aktionspotential.“ Nimm Stellung.", "<b>Falsch.</b> Die Repolarisation erfolgt durch spannungsgesteuerte <b>K⁺-Kanäle</b>. Die Pumpe stellt nur langfristig die Gradienten wieder her."),
            ("Warum schwellen Nervenzellen bei Sauerstoffmangel (Schlaganfall) an?", "Ohne O₂ kaum ATP, die Pumpe fällt aus, Na⁺ (und Cl⁻) sammeln sich innen, <b>Wasser folgt osmotisch</b>."),
            ("Erkläre, warum Trinklösungen gegen Durchfall Salz und Zucker enthalten.", "Darmzellen nehmen <b>Na⁺ und Glucose gemeinsam</b> auf (sekundär aktiv). Die Pumpe hält Na⁺ innen niedrig, Wasser folgt osmotisch."),
            ("Hyperkaliämie (mehr K⁺ im Blut): Wie verändert sich das Ruhepotential? Begründe.", "Der K⁺-Gradient wird kleiner, das Ruhepotential wird <b>positiver</b> (Depolarisation)."),
            ("Warum verbraucht das Gehirn so viel ATP?", "Nervenzellen müssen ständig die Ionengradienten aufrechterhalten. Ein großer Teil des ATP geht an die <b>Na⁺/K⁺-Pumpe</b>."),
            ("Digitalis hemmt die Pumpe im Herzmuskel teilweise. Beschreibe den ersten Effekt und die Wirkung auf den Herzschlag.", "Na⁺ innen steigt leicht; dadurch bleibt mehr <b>Ca²⁺</b> in der Zelle, der Herzmuskel <b>kontrahiert kräftiger</b>."),
            ("Eine Nervenzelle feuert 1 000 Aktionspotentiale. Warum bricht das Ruhepotential trotzdem nicht sofort zusammen?", "Pro Aktionspotential fließen nur <b>sehr wenige Ionen</b>; die Gradienten bleiben weitgehend erhalten, die Pumpe gleicht aus."),
            ("Begründe, warum die Pumpe ein Carrier und kein Kanal ist.", "Sie ist immer nur <b>zu einer Seite offen</b> und transportiert mit <b>Formänderung</b>; ein Kanal ist durchgehend offen."),
            ("Stelle eine Hypothese auf: Was passiert mit dem Na⁺-Glucose-Transport im Darm, wenn die Pumpe gehemmt wird?", "Na⁺ innen steigt, der <b>Na⁺-Gradient fehlt</b>, die Glucose-Aufnahme <b>nimmt ab</b>."),
        ],
    }



def symport():
    return {
        1: [
            ("Was ist ein Symport?", "Zwei Stoffe werden in <b>dieselbe Richtung</b> befördert."),
            ("Was ist ein Antiport?", "Zwei Stoffe werden in <b>entgegengesetzte Richtungen</b> befördert."),
            ("Was ist ein Uniport?", "<b>Ein</b> Stoff wird in <b>eine</b> Richtung befördert."),
            ("Ordne zu: Die Na⁺/K⁺-Pumpe ist ein Uniport, Symport oder Antiport?", "<b>Antiport</b> (3 Na⁺ hinaus, 2 K⁺ hinein)."),
            ("Ordne zu: 2 Na⁺ und 1 Glucose gelangen gemeinsam in die Darmzelle.", "<b>Symport</b>"),
            ("Was ist ein Carrier?", "Ein <b>Transportprotein</b>, das Teilchen bindet, seine Form ändert und sie auf der anderen Seite abgibt."),
            ("Was bedeutet „primär aktiv“?", "Die Energie kommt <b>direkt aus ATP</b>."),
            ("Was bedeutet „sekundär aktiv“?", "Die Energie kommt aus dem <b>Gefälle eines anderen Stoffs</b> (meist Na⁺ oder H⁺)."),
            ("Ist der Glucose-Transporter GLUT aktiv oder passiv?", "<b>Passiv</b> (erleichterte Diffusion, Uniport)."),
            ("Woher kommen die Wörter „Symport“ und „Antiport“?", "griech. <b>syn = zusammen</b>, <b>anti = gegen</b>."),
            ("Nenne einen Unterschied zwischen Carrier und Kanal.", "Kanal: <b>offener Tunnel</b>, schnell. Carrier: immer nur <b>zu einer Seite offen</b>, ändert seine Form."),
            ("Der Na⁺/Ca²⁺-Austauscher befördert 3 Na⁺ hinein und 1 Ca²⁺ hinaus. Welche Transportart?", "<b>Antiport</b> (sekundär aktiv)."),
            ("Welches Ion nutzen Pflanzen meist als Antrieb für sekundär aktiven Transport?", "<b>H⁺</b> (Protonen)."),
            ("Verbraucht der Na⁺-Glucose-Symporter ATP?", "<b>Nein</b>, er nutzt das Na⁺-Gefälle."),
        ],
        2: [
            ("Der Na⁺-Glucose-Symporter befördert 2 Na⁺ pro Glucose. Wie viele Na⁺ sind es bei 450 Glucose?", "450 · 2 = <b>900 Na⁺</b>"),
            ("Der Na⁺/Ca²⁺-Austauscher hat 600 Na⁺ hineingelassen. Wie viele Ca²⁺ wurden hinausbefördert?", "600 : 3 = <b>200 Ca²⁺</b>"),
            ("Die Na⁺/K⁺-Pumpe hat 240 K⁺ hineinbefördert. Wie viele Na⁺ und ATP?", "120 Runden: <b>360 Na⁺</b>, <b>120 ATP</b>"),
            ("Erkläre, warum der Na⁺-Glucose-Symporter von der Na⁺/K⁺-Pumpe abhängt.", "Die Pumpe baut mit ATP das <b>Na⁺-Gefälle</b> auf. Ohne dieses Gefälle fehlt dem Symporter der Antrieb."),
            ("Wie kann Glucose gegen ihr Gefälle in die Darmzelle gelangen?", "Sie wird an <b>Na⁺ gekoppelt</b>, das mit seinem Gefälle einströmt und die Energie liefert."),
            ("Begründe: Der Cl⁻/HCO₃⁻-Austauscher ist ein Antiport, aber kein aktiver Transport.", "Zwei Stoffe in Gegenrichtung, aber <b>beide mit ihrem Gefälle</b>, ohne Energie."),
            ("Ordne zu und begründe: Die Protonenpumpe im Magen tauscht H⁺ gegen K⁺ und spaltet ATP.", "<b>Primär aktiver Antiport</b>: Gegenrichtung, Energie direkt aus ATP."),
            ("Warum enthalten Trinklösungen gegen Durchfall Salz <b>und</b> Zucker?", "Der <b>Na⁺-Glucose-Symporter</b> nimmt beides gemeinsam auf, Wasser folgt osmotisch."),
            ("Was bedeutet „Sättigung“ bei einem Carrier?", "Sind <b>alle Carrier besetzt</b>, steigt die Transportrate nicht weiter."),
            ("Erkläre, wie Pflanzen Zucker in die Leitbahnen laden.", "Eine <b>Protonenpumpe</b> schafft H⁺ hinaus (ATP). Ein <b>H⁺-Saccharose-Symporter</b> nutzt das Gefälle."),
            ("Vergleiche primär und sekundär aktiven Transport in einer Tabelle (Energiequelle, Beispiel).", "Primär: <b>ATP</b>, Na⁺/K⁺-Pumpe. Sekundär: <b>Ionengefälle</b>, Na⁺-Glucose-Symporter."),
            ("Ein Carrier befördert Na⁺ hinein und H⁺ hinaus. Bestimme Transportart und Energieform.", "<b>Antiport</b>, <b>sekundär aktiv</b> (Na⁺-Gefälle)."),
        ],
        3: [
            ("Die Na⁺/K⁺-Pumpe wird mit Ouabain gehemmt. Beschreibe die Folgen für die Glucose-Aufnahme im Darm.", "Na⁺ innen steigt, das <b>Na⁺-Gefälle zerfällt</b>, der Symporter verliert seinen Antrieb: Glucose-Aufnahme <b>sinkt</b>."),
            ("Digitalis hemmt die Na⁺/K⁺-Pumpe im Herzen teilweise. Erkläre, warum der Herzmuskel kräftiger kontrahiert.", "Kleineres Na⁺-Gefälle → der <b>Na⁺/Ca²⁺-Austauscher</b> schafft weniger Ca²⁺ hinaus → mehr Ca²⁺ in der Zelle → <b>stärkere Kontraktion</b>."),
            ("Diabetes-Medikamente hemmen den Na⁺-Glucose-Symporter in der Niere. Erkläre die Wirkung.", "Glucose wird nicht aus dem Harn <b>zurückgeholt</b> und mit dem Urin ausgeschieden: Der Blutzucker sinkt."),
            ("Glucose-Konzentration: außen 5 mmol/L, in der Darmzelle 20 mmol/L. Welcher Transporter kann sie aufnehmen? Begründe.", "Nur der <b>Na⁺-Glucose-Symporter</b>, denn Glucose muss <b>gegen</b> ihr Gefälle; GLUT arbeitet nur mit dem Gefälle."),
            ("Protonenpumpenhemmer werden gegen Sodbrennen eingesetzt. Erkläre die Wirkung.", "Die <b>H⁺/K⁺-Pumpe</b> wird gehemmt, es gelangen weniger H⁺ in den Magen: <b>weniger Magensäure</b>."),
            ("Pro Runde befördert die Na⁺/K⁺-Pumpe netto eine positive Ladung nach außen. Begründe und nenne die Folge.", "3 Na⁺ hinaus, 2 K⁺ hinein: <b>+1 Ladung</b> außen; die Pumpe ist <b>elektrogen</b> und trägt etwas zum negativen Ruhepotential bei."),
            ("Plane einen Versuch, der zeigt, dass die Glucose-Aufnahme in Darmzellen von Na⁺ abhängt.", "Zellen in Lösung <b>mit und ohne Na⁺</b> (gleiche Glucose) geben, Glucose-Aufnahme messen. Ohne Na⁺: <b>kaum Aufnahme</b>."),
            ("Warum sinkt die Transportrate eines Carriers bei sehr hohen Konzentrationen nicht weiter, sondern bleibt konstant?", "<b>Sättigung</b>: Alle Carrier sind besetzt, jeder braucht Zeit für das Umklappen."),
            ("Rote Blutzellen nehmen im Gewebe CO₂ auf, es entsteht HCO₃⁻. Erkläre die Rolle des Cl⁻/HCO₃⁻-Austauschers.", "HCO₃⁻ verlässt die Zelle ins Plasma, <b>Cl⁻ kommt herein</b> (Ladungsausgleich). So wird CO₂ als HCO₃⁻ im Plasma transportiert."),
            ("Bei Sauerstoffmangel sinkt der ATP-Gehalt einer Darmzelle. Welche Transporter sind sofort betroffen, welche erst später?", "<b>Sofort</b>: Na⁺/K⁺-Pumpe (primär aktiv). <b>Später</b>: Na⁺-Glucose-Symporter, wenn das Na⁺-Gefälle zerfallen ist."),
        ],
    }


def endo():
    return {
        1: [
            ("Was versteht man unter Endocytose?", "Die Membran stülpt sich ein und schnürt ein <b>Bläschen nach innen</b> ab."),
            ("Was versteht man unter Exocytose?", "Ein Bläschen <b>verschmilzt mit der Membran</b> und gibt den Inhalt nach außen ab."),
            ("Was ist ein Vesikel?", "Ein kleines, von <b>Membran umschlossenes Bläschen</b>."),
            ("Was bedeutet Phagocytose?", "„<b>Zellfressen</b>“: Aufnahme großer Teilchen wie Bakterien."),
            ("Was bedeutet Pinocytose?", "„<b>Zelltrinken</b>“: Aufnahme von Flüssigkeit mit gelösten Stoffen."),
            ("Brauchen Endo- und Exocytose Energie?", "<b>Ja</b>, ATP."),
            ("Welches Zellorganell enthält Verdauungsenzyme?", "Das <b>Lysosom</b>."),
            ("Wo werden die Vesikel für die Exocytose gebildet?", "Am <b>Golgi-Apparat</b>."),
            ("Welcher Vorgang: Eine Fresszelle nimmt ein Bakterium auf.", "<b>Phagocytose</b>"),
            ("Welcher Vorgang: Eine Nervenzelle gibt Botenstoff in den synaptischen Spalt ab.", "<b>Exocytose</b>"),
            ("Welches Protein bildet die Hülle bei der rezeptorvermittelten Endocytose?", "<b>Clathrin</b>"),
            ("Was ist ein Phagosom?", "Das Bläschen mit dem <b>aufgenommenen Teilchen</b> nach der Phagocytose."),
            ("Nenne ein Beispiel für einen Stoff, der per Exocytose abgegeben wird.", "z. B. <b>Insulin</b>, Botenstoffe, Schleim, Verdauungsenzyme."),
            ("Was ist Transcytose?", "Aufnahme auf <b>einer</b> Seite der Zelle, Abgabe auf der <b>anderen</b>."),
        ],
        2: [
            ("Beschreibe die Phagocytose eines Bakteriums in vier Schritten.", "<b>Anheften → Umfließen mit Scheinfüßchen → Phagosom abgeschnürt → Verschmelzen mit Lysosom, Verdauung</b>"),
            ("Beschreibe die Exocytose in vier Schritten.", "<b>Vesikel am Golgi → Transport zur Membran → Verschmelzen → Inhalt draußen</b>"),
            ("Vergleiche Pinocytose und rezeptorvermittelte Endocytose.", "Pinocytose: <b>unspezifisch</b>, alles Gelöste. Rezeptorvermittelt: <b>gezielt</b> über Rezeptoren und Clathrin."),
            ("Wie verändert sich die Fläche der Zellmembran bei Endocytose und bei Exocytose?", "Endocytose: <b>kleiner</b>. Exocytose: <b>größer</b>."),
            ("Erkläre den Begriff Membranfluss.", "Membranstücke wandern ständig: <b>ER → Golgi → Vesikel → Zellmembran</b> und per Endocytose zurück."),
            ("Was passiert mit den Rezeptoren nach der rezeptorvermittelten Endocytose?", "Sie kehren in Bläschen zur Membran <b>zurück</b> und werden wiederverwendet."),
            ("Warum wird ein Stoff bei der Endocytose nicht „durch“ die Membran transportiert?", "Er bleibt immer in einem <b>Vesikel</b>, von Membran umschlossen."),
            ("Unterscheide ständige und signalgesteuerte Exocytose mit je einem Beispiel.", "Ständig: z. B. <b>Schleim</b>, Membranbausteine. Signal (Ca²⁺): z. B. <b>Insulin, Botenstoffe</b>."),
            ("Welche Rolle spielt Ca²⁺ an der Synapse?", "Ca²⁺-Einstrom ist das <b>Signal</b> für das Verschmelzen der Vesikel (Exocytose)."),
            ("Wofür braucht die Zelle bei Endo- und Exocytose ATP?", "Für das <b>Cytoskelett</b> (Membranbewegung) und den <b>Transport der Vesikel</b>."),
            ("Was entsteht, wenn Phagosom und Lysosom verschmelzen, und was geschieht darin?", "Ein <b>Phagolysosom</b>; Enzyme <b>verdauen</b> den Inhalt."),
            ("Warum hat eine Zelle der Bauchspeicheldrüse besonders viel Golgi-Apparat und ER?", "Sie bildet viele Proteine (Enzyme, Insulin) und gibt sie per <b>Exocytose</b> ab."),
        ],
        3: [
            ("Bei familiärer Hypercholesterinämie fehlen LDL-Rezeptoren. Erkläre, warum der Cholesterinspiegel im Blut steigt.", "Ohne Rezeptoren keine <b>rezeptorvermittelte Endocytose</b> von LDL: Cholesterin bleibt im Blut."),
            ("Botox spaltet Proteine, die für das Verschmelzen der Vesikel nötig sind. Erkläre die Wirkung auf Muskeln.", "Kein Botenstoff wird per <b>Exocytose</b> freigesetzt, der Muskel bekommt kein Signal und <b>erschlafft</b>."),
            ("Eine Zelle gibt pro Minute 100 Vesikel ab, nimmt aber nur 60 auf. Was passiert mit ihrer Oberfläche? Wie gleicht sie aus?", "Die Oberfläche <b>wächst</b>; Ausgleich durch mehr <b>Endocytose</b> (Membranfluss)."),
            ("Bei einer Erbkrankheit fehlen in Lysosomen Enzyme. Welche Folgen hat das für Fresszellen?", "Aufgenommenes Material wird <b>nicht abgebaut</b> und sammelt sich in den Zellen an."),
            ("Warum können Viren über Endocytose in Zellen gelangen, obwohl sie die Membran nicht durchdringen können?", "Sie binden an <b>Rezeptoren</b> und werden wie ein normaler Stoff in einem Vesikel aufgenommen."),
            ("Plane einen Versuch, mit dem man zeigt, dass Phagocytose Energie braucht.", "Fresszellen mit Bakterien <b>mit und ohne ATP-Hemmstoff</b> (oder bei Kälte) beobachten. Mit Hemmstoff: <b>keine Aufnahme</b>."),
            ("Antikörper der Mutter gelangen in die Muttermilch. Erkläre den Weg durch die Milchdrüsenzelle.", "<b>Transcytose</b>: Endocytose an der Blutseite, Vesikeltransport, Exocytose an der Milchseite."),
            ("Vergleiche Endocytose mit Carrier-Transport: Teilchengröße, Spezifität, Energie.", "Endocytose: <b>große Teilchen</b>, teils unspezifisch, immer ATP. Carrier: <b>kleine Teilchen</b>, spezifisch, aktiv oder passiv."),
            ("Ein Hemmstoff blockiert den Ca²⁺-Einstrom in Nervenendigungen. Welche Folge hat das für die Signalübertragung?", "Keine <b>Exocytose</b> der Botenstoffe, das Signal wird <b>nicht übertragen</b>."),
            ("Warum ist Eiter ein Zeichen dafür, dass das Immunsystem arbeitet?", "Er besteht aus <b>Fresszellen</b>, die Bakterien per <b>Phagocytose</b> aufgenommen haben und abgestorben sind."),
        ],
    }



def auge():
    return {
        1: [
            ("Wo entsteht das Bild im Auge?", "Auf der <b>Netzhaut</b>."),
            ("Welcher Teil gibt dem Auge seine Farbe?", "Die <b>Iris</b> (Regenbogenhaut)."),
            ("Was ist die Pupille?", "Das <b>Sehloch</b> in der Iris, durch das Licht ins Auge fällt."),
            ("Welche Aufgabe hat der Sehnerv?", "Er leitet die Signale der Netzhaut zum <b>Gehirn</b>."),
            ("Welche Sinneszellen sehen Farben?", "Die <b>Zapfen</b>."),
            ("Welche Sinneszellen arbeiten in der Dämmerung?", "Die <b>Stäbchen</b>."),
            ("Was passiert mit der Pupille bei grellem Licht?", "Sie wird <b>eng</b>."),
            ("Welcher Teil bricht das Licht am stärksten?", "Die <b>Hornhaut</b>."),
            ("Was versteht man unter Akkommodation?", "Die Anpassung der <b>Linsenwölbung</b> an die Entfernung."),
            ("In welcher Einheit wird die Brechkraft einer Linse angegeben?", "In <b>Dioptrien (dpt)</b>."),
            ("Was ist der gelbe Fleck?", "Die Stelle des <b>schärfsten Sehens</b>."),
            ("Was ist der blinde Fleck?", "Die Stelle, an der der Sehnerv das Auge verlässt; dort gibt es <b>keine Sinneszellen</b>."),
            ("Nenne drei Schutzeinrichtungen des Auges.", "z. B. <b>Augenhöhle, Wimpern, Lidschlag, Tränen, Augenbrauen</b>."),
            ("Welche Aufgabe hat der Glaskörper?", "Er füllt den Augapfel und <b>hält ihn in Form</b>."),
            ("Welche Aufgabe hat die Lederhaut?", "Sie <b>schützt</b> das Auge und gibt ihm seine <b>Form</b>."),
            ("Welche Aufgabe hat die Aderhaut?", "Sie <b>versorgt die Netzhaut</b> mit Blut, Nährstoffen und Sauerstoff."),
        ],
        2: [
            ("Beschreibe den Weg des Lichts durch das Auge bis zum Gehirn.", "<b>Hornhaut → Kammerwasser → Pupille → Linse → Glaskörper → Netzhaut → Sehnerv → Gehirn</b>"),
            ("Wie verändern sich Ziliarmuskel und Linse beim Blick in die Nähe?", "Ziliarmuskel <b>angespannt</b>, Linsenbänder locker, Linse <b>stark gewölbt</b>."),
            ("Wie verändern sich Ziliarmuskel und Linse beim Blick in die Ferne?", "Ziliarmuskel <b>entspannt</b>, Linsenbänder gespannt, Linse <b>flach</b>."),
            ("Beschreibe das Bild auf der Netzhaut.", "<b>Verkleinert</b>, <b>auf dem Kopf</b> und <b>seitenverkehrt</b>."),
            ("Erkläre den Pupillenreflex und seinen Nutzen.", "Hell: Pupille eng, <b>Netzhaut geschützt</b>. Dunkel: Pupille weit, <b>mehr Licht</b>."),
            ("Vergleiche Stäbchen und Zapfen (Anzahl, Aufgabe).", "Stäbchen: ≈ 120 Mio., <b>hell/dunkel</b>. Zapfen: ≈ 6 Mio., <b>Farben</b>."),
            ("Warum sehen wir nachts kaum Farben?", "Bei wenig Licht arbeiten nur die <b>Stäbchen</b>; Zapfen brauchen viel Licht."),
            ("Vergleiche das Auge mit einer Kamera: Welche Teile entsprechen Blende, Objektiv und Bildsensor?", "Blende = <b>Iris</b>, Objektiv = <b>Linse</b> (mit Hornhaut), Bildsensor = <b>Netzhaut</b>."),
            ("Erkläre Kurzsichtigkeit: Ursache, Wirkung, Brille.", "Augapfel <b>zu lang</b>, Bild <b>vor</b> der Netzhaut, Ferne unscharf; <b>Zerstreuungslinse</b>."),
            ("Erkläre Weitsichtigkeit: Ursache, Wirkung, Brille.", "Augapfel <b>zu kurz</b>, Bild <b>hinter</b> der Netzhaut, Nähe unscharf; <b>Sammellinse</b>."),
            ("Warum sieht man im Kino am Anfang kaum etwas?", "Die Augen müssen sich an die <b>Dunkelheit anpassen</b>; das dauert bis zu 30 min."),
            ("Auf einem Brillenpass steht −2,0. Was bedeutet das?", "<b>Zerstreuungslinse</b>: Die Person ist <b>kurzsichtig</b>."),
            ("Erkläre die Begriffe Nahpunkt und Fernpunkt.", "Nahpunkt: <b>kleinste</b>, Fernpunkt: <b>größte</b> Entfernung, in der man scharf sieht."),
            ("Ordne zu: Nahakkommodation oder Fernakkommodation? Ziliarmuskel entspannt, Zonulafasern gespannt.", "<b>Fernakkommodation</b>"),
        ],
        3: [
            ("Warum brauchen viele Menschen ab etwa 45 Jahren eine Lesebrille?", "Die Linse wird <b>weniger elastisch</b> und kann sich nicht mehr stark wölben: Alterssichtigkeit."),
            ("Warum merkt man den blinden Fleck im Alltag nicht?", "Das <b>andere Auge</b> sieht die Stelle, und das <b>Gehirn ergänzt</b> die Lücke."),
            ("Beschreibe einen Versuch, mit dem man den blinden Fleck nachweisen kann.", "Kreuz und Punkt auf ein Blatt, ein Auge schließen, Kreuz fixieren, Abstand ändern: Der <b>Punkt verschwindet</b>."),
            ("Warum entstehen auf Fotos mit Blitz oft rote Augen?", "Die Pupille ist im Dunkeln <b>weit</b>; das Licht wird vom <b>durchbluteten Augenhintergrund</b> rot zurückgeworfen."),
            ("Warum ist eine dunkle Sonnenbrille ohne UV-Schutz schädlich?", "Hinter dem dunklen Glas wird die <b>Pupille weit</b>; es gelangt <b>mehr UV-Licht</b> ins Auge."),
            ("Warum ist räumliches Sehen mit einem Auge schwieriger?", "Das Gehirn vergleicht die <b>zwei leicht verschiedenen Bilder</b> beider Augen, um Entfernungen zu schätzen."),
            ("Warum werden die Augen bei langer Bildschirmarbeit trocken und müde?", "Man <b>blinzelt seltener</b>, und der <b>Ziliarmuskel</b> bleibt lange angespannt."),
            ("Eine Person sieht ihr Handy scharf, die Tafel aber nicht. Erkläre mit Fachbegriffen und nenne eine Lösung.", "Sie ist <b>kurzsichtig</b>: Augapfel zu lang, Bild ferner Dinge vor der Netzhaut. Lösung: <b>Zerstreuungslinse</b>."),
            ("Beschreibe die Nahakkommodation in der richtigen Reihenfolge mit den Fachbegriffen.", "Ziliarmuskel <b>spannt sich an</b> → Muskelring enger → Zonulafasern <b>erschlaffen</b> → Linse rundet sich durch <b>Eigenelastizität</b> → <b>Brechkraft steigt</b>."),
            ("Der Nahpunkt eines 10-Jährigen liegt bei 7 cm, der eines 60-Jährigen bei 1 m. Erkläre.", "Die Linse verliert mit dem Alter ihre <b>Eigenelastizität</b>, sie kann sich kaum noch wölben: <b>Alterssichtigkeit</b>."),
            ("Warum sollte man beim Lesen ab und zu in die Ferne schauen?", "Dabei <b>entspannt</b> sich der Ziliarmuskel, die Augen ermüden weniger."),
            ("Erkläre, warum ein Mensch mit Rot-Grün-Schwäche Rot und Grün schlecht unterscheiden kann.", "Eine Sorte <b>Zapfen</b> arbeitet nicht richtig, die Farbsignale fehlen."),
        ],
    }



def nerven():
    # signal times: t = s / v, verified by computing
    def tms(s_, v): return s_ / v * 1000
    assert abs(tms(1.2, 60) - 20) < 1e-9 and abs(tms(0.5, 1) - 500) < 1e-9
    return {
        1: [
            ("Welche Organe bilden das zentrale Nervensystem?", "<b>Gehirn</b> und <b>Rückenmark</b>."),
            ("Welche Aufgabe haben die Dendriten?", "Sie <b>empfangen</b> Signale."),
            ("Welche Aufgabe hat das Axon?", "Es <b>leitet</b> das Signal weiter."),
            ("Wozu dient die Myelinscheide?", "Sie <b>isoliert</b> das Axon und macht die Leitung <b>schneller</b>."),
            ("Was ist eine Synapse?", "Die <b>Kontaktstelle</b>, an der das Signal mit einem Botenstoff auf die nächste Zelle übertragen wird."),
            ("Wohin leiten sensorische Nerven?", "Von den Sinnesorganen <b>zum ZNS</b>."),
            ("Wohin leiten motorische Nerven?", "Vom ZNS <b>zu den Muskeln</b>."),
            ("Welcher Hirnteil ist für das Gleichgewicht zuständig?", "Das <b>Kleinhirn</b>."),
            ("Welcher Hirnteil steuert Atmung und Herzschlag?", "Der <b>Hirnstamm</b> (Nachhirn)."),
            ("Wo entstehen Denken und Gedächtnis?", "Im <b>Großhirn</b>."),
            ("Nenne drei Reflexe.", "z. B. <b>Kniesehnenreflex, Lidschlussreflex, Rückziehreflex</b>, Husten, Niesen."),
            ("Wie heißt das Fachwort für Nervenzelle?", "<b>Neuron</b>"),
            ("Was bewirkt der Sympathikus?", "Er stellt den Körper auf <b>Leistung</b> ein: Herz schneller, Pupillen weit."),
            ("Was bewirkt der Parasympathikus?", "<b>Ruhe und Erholung</b>: Herz langsamer, Verdauung aktiv."),
        ],
        2: [
            ("Beschreibe die Reiz-Reaktions-Kette.", "<b>Reiz → Sinneszelle → sensorischer Nerv → ZNS → motorischer Nerv → Muskel → Reaktion</b>"),
            ("Beschreibe den Reflexbogen an der heißen Herdplatte.", "Hautsinneszellen → <b>sensorischer Nerv</b> → <b>Umschaltung im Rückenmark</b> → <b>motorischer Nerv</b> → Muskel zieht die Hand zurück."),
            ("Nenne drei Merkmale eines Reflexes.", "<b>angeboren</b>, <b>sehr schnell</b>, läuft <b>immer gleich</b> und <b>unbewusst</b> ab."),
            ("Warum spürt man den Schmerz an der Herdplatte erst, wenn die Hand schon zurückgezogen ist?", "Der Reflex wird im <b>Rückenmark</b> umgeschaltet; das Signal erreicht das <b>Gehirn erst danach</b>."),
            ("Vergleiche Reflex und bewusste Reaktion (Ort der Umschaltung, Tempo).", "Reflex: <b>Rückenmark</b>, sehr schnell. Bewusst: <b>Großhirn</b>, ca. 0,2–0,3 s."),
            ("Ein Signal läuft 1,2 m mit 60 m/s. Wie lange braucht es?", "1,2 : 60 = 0,02 s = <b>20 ms</b>"),
            ("Ein Signal läuft 0,5 m in einer Faser ohne Myelin (1 m/s). Wie lange braucht es?", "0,5 : 1 = <b>0,5 s</b> = 500 ms"),
            ("Ordne zu: Du balancierst auf einem Bein. Welcher Hirnteil arbeitet vor allem?", "Das <b>Kleinhirn</b>."),
            ("Ordne zu: Dir wird heiß, du beginnst zu schwitzen. Welcher Hirnteil steuert das?", "Das <b>Zwischenhirn</b> (Körpertemperatur)."),
            ("Erkläre, warum Fasern mit Myelinscheide schneller leiten.", "Das Signal <b>springt von Schnürring zu Schnürring</b>, statt die ganze Faser entlangzulaufen."),
            ("Wie wirkt der Sympathikus vor einer Klassenarbeit auf Herz, Pupillen und Verdauung?", "Herz <b>schneller</b>, Pupillen <b>weit</b>, Verdauung <b>gebremst</b>."),
            ("Unterscheide willkürliches und vegetatives Nervensystem mit je einem Beispiel.", "Willkürlich: <b>bewusst</b>, z. B. schreiben. Vegetativ: <b>unbewusst</b>, z. B. Herzschlag."),
        ],
        3: [
            ("Beim Lineal-Test fällt das Lineal 20 cm, bevor es gefangen wird. Das entspricht etwa 0,2 s. Erkläre, warum die Reaktion so lange dauert, obwohl Nerven sehr schnell leiten.", "Die Leitung selbst dauert nur wenige ms; den Großteil braucht das <b>Gehirn</b> zum Erkennen und Entscheiden, dazu kommen <b>Synapsen</b>."),
            ("Bei einer Verletzung des Rückenmarks im Nackenbereich können Arme und Beine gelähmt sein. Erkläre.", "Die Befehle des Gehirns erreichen die <b>motorischen Nerven</b> unterhalb der Verletzung nicht mehr: <b>Querschnittslähmung</b>."),
            ("Die Ärztin prüft den Kniesehnenreflex. Welche Teile des Nervensystems testet sie damit?", "<b>Sinneszellen im Muskel, sensorischen Nerv, Rückenmark, motorischen Nerv</b> und den Muskel."),
            ("Warum ist Radfahren mit dem Handy gefährlich? Rechne: Bei 20 km/h (≈ 5,6 m/s) und 1 s Ablenkung …", "In 1 s fährt man etwa <b>5,6 m</b> „blind“; die Reaktion beginnt viel später."),
            ("Alkohol verlangsamt die Signalübertragung an Synapsen. Welche Folgen hat das im Straßenverkehr?", "<b>Längere Reaktionszeit</b>, schlechtere Koordination (Kleinhirn), Fehleinschätzungen."),
            ("Bei Multipler Sklerose wird die Myelinscheide geschädigt. Welche Folgen erwartest du?", "Signale werden <b>langsamer</b> oder gar nicht mehr weitergeleitet: z. B. Lähmungen, Sehstörungen."),
            ("Warum kann man den Lidschlussreflex kaum unterdrücken, das Heben der Hand aber schon?", "Der Reflex läuft <b>unbewusst</b> über tiefere Teile des ZNS; das Heben der Hand plant das <b>Großhirn</b> bewusst."),
            ("Berechne, wie lange ein Signal vom Fuß zum Rückenmark braucht: Strecke 1 m, Tempo 100 m/s.", "1 : 100 = 0,01 s = <b>10 ms</b>"),
            ("Erkläre, warum man nach dem Gleichgewichtsorgan im Ohr auch das Kleinhirn braucht, um auf einem Bein zu stehen.", "Das <b>Kleinhirn</b> verarbeitet die Meldungen aus Ohr, Augen und Muskeln und <b>korrigiert</b> die Muskelspannung."),
            ("Warum lernt man besser, wenn man vor einer Arbeit ausreichend schläft?", "Im Schlaf <b>festigt</b> das Gehirn Gelerntes; Verbindungen zwischen Nervenzellen werden verstärkt."),
        ],
    }


# ================================================================ grade 8 maths, chapter I: term structure
def _sg(v):
    """Number for substitution: negative values in brackets."""
    return f"({MINUS}{abs(v)})" if v < 0 else str(v)


def _n(v):
    return (MINUS if v < 0 else "") + str(abs(v))


def termstruktur():
    r = random.Random(91)
    L = {1: [], 2: [], 3: []}
    kinds = [
        (lambda a, b, c: f"{a}<i>x</i> + {b}", "Summe"), (lambda a, b, c: f"{a} · (<i>x</i> + {b})", "Produkt"),
        (lambda a, b, c: f"(<i>x</i> − {b})<sup>2</sup>", "Potenz"), (lambda a, b, c: f"({a}<i>x</i> + {b}) : {c}", "Quotient"),
        (lambda a, b, c: f"{a}<i>x</i><sup>2</sup> − {b}", "Differenz"), (lambda a, b, c: f"(<i>x</i> + {a}) · (<i>x</i> − {b})", "Produkt"),
        (lambda a, b, c: f"{a} − {b} · <i>x</i>", "Differenz"), (lambda a, b, c: f"<i>x</i> : {c} + {a}", "Summe"),
    ]
    for i in range(150):
        t = i % 3
        a, b, c = r.randint(2, 9), r.randint(2, 9), r.randint(2, 6)
        if t == 0:
            f, kind = kinds[(i // 3) % len(kinds)]
            L[1].append((f"Termart von {m(f(a, b, c))}?", f"<b>{kind}</b>"))
        elif t == 1:
            x = r.randint(1, 9)
            L[1].append((f"Berechne {m(f'{a}<i>x</i> + {b}')} für {m(f'<i>x</i> = {x}')}.", m(f"{a} · {x} + {b} = <b>{a * x + b}</b>")))
        else:
            p, q, s_ = r.randint(2, 9), r.randint(2, 9), r.randint(2, 9)
            L[1].append((f"Berechne: {m(f'{p} + {q} · {s_}')}", m(f"{p} + {q * s_} = <b>{p + q * s_}</b>")))
    for i in range(140):
        t = i % 4
        a, b = r.choice([-4, -3, -2, 2, 3, 4, 5]), r.randint(1, 9)
        x = r.choice([-5, -4, -3, -2, -1, 2, 3, 4])
        if t == 0:
            val = a * x * x - b
            L[2].append((f"Berechne {m(f'{_n(a)}<i>x</i><sup>2</sup> − {b}')} für {m(f'<i>x</i> = {_n(x)}')}.", m(f"{_n(a)} · {_sg(x)}<sup>2</sup> − {b} = {_n(a)} · {x * x} − {b} = <b>{_n(val)}</b>")))
        elif t == 1:
            val = (x - b) * (x + 2)
            L[2].append((f"Berechne {m(f'(<i>x</i> − {b}) · (<i>x</i> + 2)')} für {m(f'<i>x</i> = {_n(x)}')}.", m(f"({_n(x)} − {b}) · ({_n(x)} + 2) = {_sg(x - b)} · {_sg(x + 2)} = <b>{_n(val)}</b>")))
        elif t == 2:
            k, d = r.randint(2, 9), r.randint(1, 9)
            word = ["", "", "Doppelte", "Dreifache", "Vierfache", "Fünffache", "Sechsfache", "Siebenfache", "Achtfache", "Neunfache"][k]
            form = r.choice([(f"das {word} einer Zahl <i>x</i>, vermindert um {d}", f"{k}<i>x</i> − {d}"),
                             (f"die Summe aus <i>x</i> und {d}, multipliziert mit {k}", f"{k} · (<i>x</i> + {d})"),
                             (f"das Quadrat einer Zahl <i>x</i>, vermehrt um {d}", f"<i>x</i><sup>2</sup> + {d}"),
                             (f"die Differenz aus {d} und dem {word} von <i>x</i>", f"{d} − {k}<i>x</i>")])
            L[2].append((f"Schreibe als Term: {form[0]}.", m(f"<b>{form[1]}</b>")))
        else:
            xs = [-2, -1, 0, 1, 2]
            vals = [a * v + b for v in xs]
            L[2].append((f"Wertetabelle von {m(f'{_n(a)}<i>x</i> + {b}')} für <i>x</i> = −2, −1, 0, 1, 2.", m(" · ".join(f"<b>{_n(v)}</b>" for v in vals))))
    for i in range(70):
        t = i % 7
        if t == 4:
            k, d = r.randint(2, 7), r.randint(1, 9)
            x = r.randint(2, 9)
            L[3].append((f"Welche Zahl muss man für {m('<i>x</i>')} einsetzen, damit {m(f'{k}<i>x</i> − {d}')} den Wert {k * x - d} hat?", f"{m(f'{k} · {x} − {d} = {k * x - d}')} ⇒ <b><i>x</i> = {x}</b>"))
            continue
        if t == 5:
            c = r.randint(1, 4)
            xs = list(range(-2, 4))
            vals = [v * v - 2 * c * v for v in xs]
            low = min(vals)
            L[3].append((f"Lege eine Wertetabelle von {m(f'<i>x</i><sup>2</sup> − {2 * c}<i>x</i>')} für <i>x</i> = −2 bis 3 an. Für welches <i>x</i> ist der Wert am kleinsten?",
                         m(" · ".join(_n(v) for v in vals)) + f"; kleinster Wert <b>{_n(low)}</b> bei <b><i>x</i> = {xs[vals.index(low)]}</b>"))
            continue
        if t == 6:
            a_, b_ = r.randint(2, 5), r.randint(1, 6)
            L[3].append((f"Begründe ohne Rechnen, welcher Term für <i>x</i> = −{b_} den Wert 0 hat: {m(f'{a_}(<i>x</i> + {b_})')} oder {m(f'{a_}<i>x</i> + {b_}')}.",
                         f"{m(f'{a_}(<i>x</i> + {b_})')}: Die Klammer wird 0, und ein <b>Produkt mit dem Faktor 0</b> ist 0."))
            assert a_ * (-b_ + b_) == 0 and a_ * (-b_) + b_ != 0
            continue
        if t == 0:
            n = r.randint(5, 30)
            L[3].append((f"Streichhölzer: Eine Reihe aus {m('<i>n</i>')} Quadraten braucht {m('3<i>n</i> + 1')} Hölzer. Wie viele Hölzer braucht man für {n} Quadrate, wie viele Quadrate schafft man mit {3 * n + 4} Hölzern?",
                         f"{m(f'3 · {n} + 1 = <b>{3 * n + 1}</b>')} Hölzer; {m(f'3<i>n</i> + 1 = {3 * n + 4}')} ⇒ <b>{n + 1} Quadrate</b>"))
        elif t == 1:
            a, b = r.randint(2, 6), r.randint(1, 5)
            # the terms a(x + b) and ax + b differ for every x
            assert all(a * (x + b) != a * x + b for x in range(-5, 6))
            L[3].append((f"Zeige mit einem Gegenbeispiel: {m(f'{a}(<i>x</i> + {b})')} und {m(f'{a}<i>x</i> + {b}')} sind <b>nicht</b> gleichwertig.",
                         f"z. B. <i>x</i> = 0: {m(f'{a} · {b} = {a * b}')}, aber {m(f'{a} · 0 + {b} = {b}')}. <b>Verschiedene Werte.</b>"))
        elif t == 2:
            g, p = r.choice([3, 4, 5, 6, 8]), r.choice([12, 15, 18, 20, 25])
            n = r.choice([10, 20, 25, 30])
            total = Fr(200 + p * n, n)
            L[3].append((f"Eine Klassenfahrt: Bus 200 €, Eintritt {p} € pro Person. Stelle einen Term für die Kosten pro Person bei {m('<i>n</i>')} Personen auf und berechne ihn für {n} Personen.",
                         f"{m(f'(200 + {p}<i>n</i>) : <i>n</i>')}; für {n}: {m(f'(200 + {p * n}) : {n} = <b>{de(float(total))} €</b>')}"))
        else:
            a, b, c = r.randint(2, 6), r.randint(2, 6), r.randint(2, 6)
            target = (a + b) * c
            assert target != a + b * c
            L[3].append((f"Setze Klammern so, dass das Ergebnis stimmt: {m(f'{a} + {b} · {c} = {target}')}", m(f"<b>({a} + {b}) · {c}</b> = {target}")))
    return L


M8, PH = "#1f6e8c", "#b4531f"
TOPICS = {
    "osmose": ({"title": "Osmose", "eyebrow": "Biologie · Klasse 11", "accent": "#0d6f74", "cols": [1, 1, 1], "sol_cols": [1, 1, 1]}, osmose),
    "natrium-kalium-pumpe": ({"title": "Natrium-Kalium-Pumpe", "eyebrow": "Biologie · Klasse 11", "accent": "#8e2c5c", "cols": [1, 1, 1], "sol_cols": [1, 1, 1]}, nak),
    "symport-antiport": ({"title": "Symport und Antiport", "eyebrow": "Biologie · Klasse 11", "accent": "#2f7d5b", "cols": [1, 1, 1], "sol_cols": [1, 1, 1]}, symport),
    "endocytose-exocytose": ({"title": "Endocytose und Exocytose", "eyebrow": "Biologie · Klasse 11", "accent": "#7a3f8f", "cols": [1, 1, 1], "sol_cols": [1, 1, 1]}, endo),
    "ableiten": ({"title": "Ableiten", "eyebrow": "Mathematik · Klasse 11", "accent": "#24539c", "cols": 2, "sol_cols": 2}, ableiten),
    "nervensystem": ({"title": "Das Nervensystem", "eyebrow": "Biologie · Klasse 8", "accent": "#4a7a1e", "cols": [1, 1, 1], "sol_cols": [1, 1, 1]}, nerven),
    "auge": ({"title": "Das Auge", "eyebrow": "Biologie · Klasse 8", "accent": "#4a7a1e", "cols": [1, 1, 1], "sol_cols": [1, 1, 1]}, auge),
    "termstruktur": ({"title": "Termstruktur und Termwerte", "eyebrow": "Mathematik · Klasse 8", "accent": M8, "cols": [3, 2, 1], "sol_cols": [3, 2, 1]}, termstruktur),
    "binomische-formeln": ({"title": "Binomische Formeln", "eyebrow": "Mathematik · Klasse 8", "accent": M8, "cols": 2, "sol_cols": 2}, binomische_formeln),
    "bruchterme": ({"title": "Bruchterme", "eyebrow": "Mathematik · Klasse 8", "accent": "#2d6a4f", "cols": 3, "sol_cols": 3}, bruchterme),
    "ausmultiplizieren-faktorisieren": ({"title": "Ausmultiplizieren und Faktorisieren", "eyebrow": "Mathematik · Klasse 8", "accent": M8, "cols": 3, "sol_cols": 3}, ausmultiplizieren),
    "terme-vereinfachen": ({"title": "Terme vereinfachen", "eyebrow": "Mathematik · Klasse 8", "accent": M8, "cols": 3, "sol_cols": 3}, terme),
    "gleichungen": ({"title": "Gleichungen", "eyebrow": "Mathematik · Klasse 8", "accent": M8, "cols": 3, "sol_cols": 3}, gleichungen),
    "ungleichungen": ({"title": "Ungleichungen", "eyebrow": "Mathematik · Klasse 8", "accent": M8, "cols": [3, 2, 2], "sol_cols": [3, 2, 2]}, ungleichungen),
    "druck": ({"title": "Druck", "eyebrow": "Physik · Klasse 8", "accent": PH, "cols": [2, 2, 1], "sol_cols": [2, 2, 1]}, druck),
    "hydraulik": ({"title": "Hydraulische Anlagen", "eyebrow": "Physik · Klasse 8", "accent": PH, "cols": [2, 2, 1], "sol_cols": [2, 2, 1]}, hydraulik),
    "schweredruck": ({"title": "Schweredruck", "eyebrow": "Physik · Klasse 8", "accent": PH, "cols": [2, 2, 1], "sol_cols": [2, 2, 1]}, schweredruck),
    "auftrieb": ({"title": "Auftrieb", "eyebrow": "Physik · Klasse 8", "accent": PH, "cols": [2, 2, 1], "sol_cols": [2, 2, 1]}, auftrieb),
    "luftdruck": ({"title": "Luftdruck", "eyebrow": "Physik · Klasse 8", "accent": PH, "cols": [2, 2, 1], "sol_cols": [2, 2, 1]}, luftdruck),
}
