import re
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



# ================================================================ grade 8 maths, chapter II: random experiments
def _pct(q):
    return de(float(q) * 100, 1) + " %"


def zufallsexperimente():
    r = random.Random(92)
    L = {1: [], 2: [], 3: []}
    things = [("Würfel", "eine 6"), ("Münze", "Kopf"), ("Reißzwecke", "Kopflage"), ("Glücksrad", "Rot"), ("Kronkorken", "„Zacken oben“")]
    events = [("Augenzahl größer als 4", "{5; 6}"), ("gerade Augenzahl", "{2; 4; 6}"), ("Primzahl", "{2; 3; 5}"), ("höchstens 2", "{1; 2}"),
              ("mindestens 4", "{4; 5; 6}"), ("durch 3 teilbar", "{3; 6}"), ("ungerade Augenzahl", "{1; 3; 5}"), ("kleiner als 1", "{ } (unmöglich)")]
    for i in range(150):
        t = i % 3
        if t == 0:
            th, ev = things[i % len(things)]
            n = r.choice([20, 25, 40, 50, 80, 100, 200, 250, 400, 500])
            k = r.randint(1, n - 1)
            q = Fr(k, n)
            L[1].append((f"{n} Würfe mit einem {th}: {k}-mal {ev}. Relative Häufigkeit?", f"{k} : {n} = <b>{de(float(q), 4)}</b> = {_pct(q)}"))
        elif t == 1:
            ev, st = events[(i // 3) % len(events)]
            L[1].append((f"Würfel: Schreibe das Ereignis „{ev}“ als Menge.", m(f"<b>{st}</b>")))
        else:
            k, n = r.randint(1, 49), r.choice([50, 100, 200])
            L[1].append((f"Schreibe {k}/{n} als Dezimalzahl und in Prozent.", f"<b>{de(k / n, 3)}</b> = <b>{_pct(Fr(k, n))}</b>"))
    for i in range(220):
        t = i % 4
        if t == 0:
            n, hp = r.choice([50, 100, 200, 400, 500, 800, 1000]), r.choice([5, 10, 12, 15, 20, 24, 25, 30, 35, 40, 45, 60, 65, 75])
            k = Fr(n * hp, 100)
            if k.denominator != 1:
                continue
            L[2].append((f"{n} Versuche, relative Häufigkeit {hp} %. Absolute Häufigkeit?", f"{n} · {de(hp / 100, 2)} = <b>{k}</b>"))
        elif t == 1:
            name, p, ns = r.choice([("eine 6 beim Würfeln", Fr(1, 6), [300, 600, 1200]), ("Kopf beim Münzwurf", Fr(1, 2), [100, 500, 1000]),
                                    ("eine Zahl kleiner 3 beim Würfeln", Fr(1, 3), [150, 300, 900]), ("Gelb am Glücksrad (P = ⅙)", Fr(1, 6), [60, 240])])
            n = r.choice(ns)
            L[2].append((f"Wie oft erwartest du bei {n} Versuchen ungefähr {name}?", f"{n} · {ftext(p)} ≈ <b>{n * p}</b>-mal"))
        elif t == 2:
            a, b = r.choice([(0.25, 0.4), (0.15, 0.5), (0.3, 0.45), (0.2, 0.35), (0.1, 0.6)])
            c = round(1 - a - b, 2)
            L[2].append((f"Glücksrad mit Rot, Blau, Gelb: relative Häufigkeiten Rot {de(a, 2)}, Blau {de(b, 2)}. Wie groß ist die relative Häufigkeit von Gelb?", f"1 − {de(a, 2)} − {de(b, 2)} = <b>{de(c, 2)}</b>"))
        else:
            if i % 16 != 3:
                continue
            n1, n2 = r.choice([(20, 400), (10, 500), (50, 1000), (30, 600)])
            L[2].append((f"Lisa würfelt {n1}-mal, Tom {n2}-mal. Wessen relative Häufigkeit ist der bessere Schätzwert für die Wahrscheinlichkeit? Begründe.",
                         f"<b>Toms</b>: Bei mehr Versuchen stabilisiert sich die relative Häufigkeit (Gesetz der großen Zahlen)."))
    for i in range(70):
        t = i % 5
        if t == 0:
            k1, n1, k2, n2 = r.randint(10, 40), 50, r.randint(40, 140), 200
            q = Fr(k1 + k2, n1 + n2)
            L[3].append((f"Zwei Gruppen werfen eine Reißzwecke: Gruppe A {k1}-mal Kopf bei {n1} Würfen, Gruppe B {k2}-mal bei {n2} Würfen. Bestimme die relative Häufigkeit für alle Würfe zusammen.",
                         f"({k1} + {k2}) : ({n1} + {n2}) = {k1 + k2} : {n1 + n2} = <b>{de(float(q), 3)}</b>"))
        elif t == 1:
            a, b, c, d = r.randint(30, 45), 50, r.randint(60, 85), 100
            better = "A" if Fr(a, b) > Fr(c, d) else "B"
            if Fr(a, b) == Fr(c, d):
                continue
            L[3].append((f"Elfmeter: Spielerin A traf {a} von {b}, Spielerin B {c} von {d}. Wer ist (statistisch) die sicherere Schützin?",
                         f"A: {de(a / b, 2)}, B: {de(c / d, 2)} ⇒ <b>Spielerin {better}</b>"))
        elif t == 2:
            six = r.randint(150, 200)
            L[3].append((f"Ein Würfel zeigte bei 600 Würfen {six}-mal die 6. Ist er vermutlich gezinkt? Begründe.",
                         f"Erwartet wären etwa <b>100</b>; {six} ist <b>viel mehr</b> (rel. Häufigkeit {de(six / 600, 2)} statt etwa 0,17): wahrscheinlich gezinkt."))
        elif t == 3:
            n, k = r.choice([(2000, 30), (5000, 40), (1000, 12), (4000, 50)])
            lot = r.choice([10000, 20000, 50000])
            L[3].append((f"Von {n} geprüften Teilen waren {k} fehlerhaft. Wie viele fehlerhafte Teile erwartest du bei {lot} Teilen?",
                         f"{k} : {n} = {de(k / n, 4)}; {lot} · {de(k / n, 4)} ≈ <b>{de(lot * k / n, 0)}</b>"))
        else:
            L[3].append(("Nach fünfmal Kopf sagt Max: „Jetzt kommt bestimmt Zahl.“ Nimm Stellung.",
                         "<b>Falsch</b>: Die Münze hat kein Gedächtnis, die Wahrscheinlichkeit bleibt bei jedem Wurf <b>½</b>."))
    return L



def laplace():
    r = random.Random(93)
    L = {1: [], 2: [], 3: []}

    def pf(k, n):
        q = Fr(k, n)
        return f"{m(fr(k, n) if q.denominator == n else fr(k, n) + ' = ' + fnum(q))} ≈ {_pct(q)}"
    for i in range(160):
        t = i % 4
        if t == 0:
            rr, b, g = r.randint(1, 7), r.randint(1, 9), r.randint(0, 5)
            c, k = r.choice([("rote", rr), ("blaue", b)])
            L[1].append((f"Urne: {rr} rote, {b} blaue, {g} grüne Kugeln. P(<b>{c}</b> Kugel)?", pf(k, rr + b + g)))
        elif t == 1:
            ev, k = r.choice([("Zahl größer als 2", 4), ("ungerade Zahl", 3), ("1 oder 6", 2), ("Zahl kleiner als 6", 5), ("Primzahl", 3), ("Vielfaches von 3", 2)])
            L[1].append((f"Würfel: P({ev})?", pf(k, 6)))
        elif t == 2:
            k, n = r.randint(1, 19), r.choice([20, 25, 40, 50])
            L[1].append((f"P(<i>E</i>) = {k}/{n}. P(Gegenereignis)?", f"1 − {k}/{n} = {m(fnum(Fr(n - k, n)))}"))
        else:
            a, b = r.randint(2, 6), r.randint(2, 6)
            L[1].append((f"{a} T-Shirts und {b} Hosen. Wie viele Kombinationen?", m(f"{a} · {b} = <b>{a * b}</b>")))
    sums = {s_: sum(1 for i in range(1, 7) for j in range(1, 7) if i + j == s_) for s_ in range(2, 13)}
    for i in range(120):
        t = i % 4
        if t == 0:
            ev, k = r.choice([("Herz", 8), ("Ass", 4), ("Bildkarte (B, D, K)", 12), ("rote Karte", 16), ("Kreuz-Bube", 1), ("rote Dame", 2), ("keine Bildkarte", 20)])
            L[2].append((f"32 Skatkarten: P({ev})?", pf(k, 32)))
        elif t == 1:
            s_ = r.randint(2, 12)
            L[2].append((f"Zwei Würfel: P(Augensumme {s_})?", pf(sums[s_], 36)))
        elif t == 2:
            a, b, c = r.randint(2, 5), r.randint(2, 6), r.randint(2, 4)
            L[2].append((f"{a} Vorspeisen, {b} Hauptgerichte, {c} Nachspeisen. Wie viele Menüs gibt es?", m(f"{a} · {b} · {c} = <b>{a * b * c}</b>")))
        else:
            n = r.randint(3, 5)
            L[2].append((f"Zahlenschloss mit {n} Rädern (0 bis 9): Anzahl der Codes und Wahrscheinlichkeit, beim ersten Versuch richtig zu raten?", f"<b>{10 ** n:,}</b>".replace(",", " ") + f" Codes; P = 1/{10 ** n:,}".replace(",", " ")))
    for i in range(40):
        t = i % 5
        if t == 0:
            n = r.choice([2, 3])
            k = r.randint(0, n)
            from math import comb
            L[3].append((f"{n} Münzen werden geworfen. Wie groß ist die Wahrscheinlichkeit für genau {k}-mal Kopf?",
                         f"{2 ** n} Ergebnisse, davon {comb(n, k)} günstig: {m(fnum(Fr(comb(n, k), 2 ** n)))}"))
        elif t == 1:
            w = r.choice(["eine 6 und Kopf", "eine gerade Zahl und Zahl", "eine Zahl größer 4 und Kopf"])
            k = {"eine 6 und Kopf": 1, "eine gerade Zahl und Zahl": 3, "eine Zahl größer 4 und Kopf": 2}[w]
            L[3].append((f"Ein Würfel und eine Münze werden geworfen. Wie viele Ergebnisse gibt es, und wie groß ist P({w})?", f"6 · 2 = <b>12</b> Ergebnisse; P = {m(fnum(Fr(k, 12)))}"))
        elif t == 2:
            n, z = r.choice([(4, 62), (6, 62), (8, 62), (4, 36), (5, 36)])
            L[3].append((f"Ein Passwort hat {n} Zeichen, jedes aus {z} möglichen Zeichen. Wie viele Passwörter gibt es?", m(f"{z}<sup>{n}</sup> = <b>{z ** n:,}</b>".replace(",", " "))))
        elif t == 3:
            rr, b = r.randint(3, 9), r.randint(3, 9)
            rem = b - 2 * rr
            if rem <= 0:
                continue
            L[3].append((f"Urne mit {rr} roten und {b} blauen Kugeln. Wie viele blaue Kugeln muss man herausnehmen, damit P(rot) = 1/3 ist?", f"Dann doppelt so viele blaue wie rote ({2 * rr}): <b>{rem}</b> blaue herausnehmen"))
            assert Fr(rr, rr + b - rem) == Fr(1, 3)
        else:
            mon, days = r.choice([("Januar", 31), ("Februar", 28), ("April", 30), ("Dezember", 31)])
            L[3].append((f"Wie groß ist (vereinfacht, 365 Tage, alle gleich wahrscheinlich) die Wahrscheinlichkeit, dass jemand im {mon} Geburtstag hat?", f"{m(fr(days, 365))} ≈ {_pct(Fr(days, 365))}"))
    for i in range(80):
        t = i % 5
        if t == 0:
            a = r.randint(4, 9)
            L[3].append((f"Ein Lauf mit {a} Teilnehmenden. Wie viele Möglichkeiten gibt es für die Plätze 1 bis 3?", m(f"{a} · {a - 1} · {a - 2} = <b>{a * (a - 1) * (a - 2)}</b>")))
        elif t == 1:
            n = r.randint(2, 4)
            L[3].append((f"Ein Code aus {n} Buchstaben (26) und einer Ziffer (10). Wie viele Codes gibt es?", m(f"26<sup>{n}</sup> · 10 = <b>{26 ** n * 10:,}</b>".replace(",", " "))))
        elif t == 2:
            rr, b = r.randint(2, 6), r.randint(2, 6)
            k = r.randint(1, 4)
            # how many red balls must be added so that P(red) = 1/2
            add = b - rr
            if add <= 0:
                continue
            L[3].append((f"Urne mit {rr} roten und {b} blauen Kugeln. Wie viele rote Kugeln muss man hinzufügen, damit P(rot) = ½ ist?", f"Gleich viele rote wie blaue: <b>{add}</b> rote dazu"))
            assert Fr(rr + add, rr + add + b) == Fr(1, 2)
            _ = k
        elif t == 3:
            L[3].append(("Begründe, warum die Augensummen 2 bis 12 bei zwei Würfeln nicht gleich wahrscheinlich sind.", "Die Summen entstehen auf <b>verschieden viele Arten</b>: 7 sechsmal (1|6 … 6|1), 2 nur einmal (1|1)."))
        else:
            k = r.randint(1, 5)
            q = Fr(1, 6) ** 0 - Fr(5, 6) ** 2
            L[3].append(("Zwei Würfel: Wie groß ist die Wahrscheinlichkeit für mindestens eine 6? Nutze das Gegenereignis.", f"Gegenereignis „keine 6“: 25 von 36. P = 1 − 25/36 = <b>11/36</b> ≈ {_pct(Fr(11, 36))}"))
            assert q == Fr(11, 36)
            _ = k
    return L



def baumdiagramme():
    r = random.Random(94)
    L = {1: [], 2: [], 3: []}
    for i in range(160):
        t = i % 3
        rr, b = r.randint(1, 7), r.randint(1, 7)
        n = rr + b
        if t == 0:
            q = Fr(rr, n) * Fr(rr, n)
            L[1].append((f"Urne {rr} rot, {b} blau, zweimal <b>mit</b> Zurücklegen. P(rot, rot)?", m(f"{fr(rr, n)} · {fr(rr, n)} = <b>{fnum(q)}</b>")))
        elif t == 1:
            if rr < 2:
                continue
            q = Fr(rr, n) * Fr(rr - 1, n - 1)
            L[1].append((f"Urne {rr} rot, {b} blau, zweimal <b>ohne</b> Zurücklegen. P(rot, rot)?", m(f"{fr(rr, n)} · {fr(rr - 1, n - 1)} = <b>{fnum(q)}</b>")))
        else:
            p1, p2 = r.choice([0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8]), r.choice([0.25, 0.4, 0.5, 0.6, 0.75, 0.9])
            L[1].append((f"Ampel 1 grün mit {de(p1, 2)}, Ampel 2 mit {de(p2, 2)}. P(beide grün)?", m(f"{de(p1, 2)} · {de(p2, 2)} = <b>{de(p1 * p2, 4)}</b>")))
    for i in range(140):
        t = i % 4
        rr, b = r.randint(2, 7), r.randint(2, 7)
        n = rr + b
        if t == 0:
            q = 2 * Fr(rr, n) * Fr(b, n)
            L[2].append((f"Urne {rr} rot, {b} blau, zweimal mit Zurücklegen. P(genau eine rote)?", m(f"2 · {fr(rr, n)} · {fr(b, n)} = <b>{fnum(q)}</b>")))
        elif t == 1:
            q = 2 * Fr(rr, n) * Fr(b, n - 1)
            L[2].append((f"Urne {rr} rot, {b} blau, zweimal ohne Zurücklegen. P(genau eine rote)?", m(f"{fr(rr, n)} · {fr(b, n - 1)} + {fr(b, n)} · {fr(rr, n - 1)} = <b>{fnum(q)}</b>")))
        elif t == 2:
            q = Fr(rr, n) * Fr(rr - 1, n - 1) + Fr(b, n) * Fr(b - 1, n - 1)
            L[2].append((f"Urne {rr} rot, {b} blau, zweimal ohne Zurücklegen. P(gleiche Farbe)?", m(f"{fr(rr, n)} · {fr(rr - 1, n - 1)} + {fr(b, n)} · {fr(b - 1, n - 1)} = <b>{fnum(q)}</b>")))
        else:
            k = r.choice([2, 3])
            q = 1 - Fr(5, 6) ** k
            L[2].append((f"Würfel, {k} Würfe. P(mindestens eine 6)?", f"1 − {m(f'({fr(5, 6)})<sup>{k}</sup>')} = <b>{m(fnum(q))}</b>"))
    for i in range(80):
        t = i % 5
        if t == 0:
            p_ = r.choice([Fr(1, 2), Fr(3, 5), Fr(7, 10), Fr(4, 5)])
            k = r.choice([2, 3])
            q = 1 - (1 - p_) ** k
            L[3].append((f"Trefferquote {_pct(p_)}. Wie groß ist die Wahrscheinlichkeit für mindestens einen Treffer bei {k} Würfen?", f"1 − ({ftext(1 - p_)})<sup>{k}</sup> = <b>{m(fnum(q))}</b> ≈ {_pct(q)}"))
        elif t == 1:
            g, j = r.randint(10, 15), r.randint(10, 15)
            n = g + j
            q = Fr(g, n) * Fr(g - 1, n - 1)
            L[3].append((f"In einer Klasse sind {g} Mädchen und {j} Jungen. Zwei Klassensprecher werden gelost. P(zwei Mädchen)?", m(f"{fr(g, n)} · {fr(g - 1, n - 1)} = <b>{fnum(q)}</b>") + f" ≈ {_pct(q)}"))
        elif t == 2:
            rr, b = r.randint(3, 6), r.randint(2, 5)
            n = rr + b
            q = Fr(rr, n) * Fr(rr - 1, n - 1) * Fr(rr - 2, n - 2)
            L[3].append((f"Urne {rr} rot, {b} blau. Drei Kugeln ohne Zurücklegen. P(dreimal rot)?", m(f"{fr(rr, n)} · {fr(rr - 1, n - 1)} · {fr(rr - 2, n - 2)} = <b>{fnum(q)}</b>")))
        elif t == 3:
            k = r.randint(2, 5)
            q = 1 - Fr(1, 2) ** k
            L[3].append((f"Wie groß ist die Wahrscheinlichkeit, bei {k} Münzwürfen mindestens einmal Kopf zu werfen?", f"1 − (½)<sup>{k}</sup> = <b>{m(fnum(q))}</b>"))
        else:
            n = r.randint(2, 4)
            L[3].append((f"Wie oft muss man mindestens würfeln, damit die Wahrscheinlichkeit für mindestens eine 6 größer als 50 % ist?", "1 − (5/6)<sup>3</sup> ≈ 42 %, 1 − (5/6)<sup>4</sup> ≈ <b>52 %</b>: mindestens <b>4</b>-mal"))
            assert 1 - Fr(5, 6) ** 3 < Fr(1, 2) < 1 - Fr(5, 6) ** 4
            _ = n
    return L



def unabhaengig():
    r = random.Random(95)
    L = {1: [], 2: [], 3: []}
    for i in range(60):
        pa, pb = r.choice([Fr(1, 2), Fr(1, 3), Fr(1, 4), Fr(3, 5), Fr(2, 3)]), r.choice([Fr(1, 2), Fr(1, 6), Fr(1, 5), Fr(3, 4), Fr(2, 5)])
        L[1].append((f"A, B unabhängig, P(A) = {m(fnum(pa))}, P(B) = {m(fnum(pb))}. P(A und nicht B)?", m(f"{fnum(pa)} · {fnum(1 - pb)} = <b>{fnum(pa * (1 - pb))}</b>")))
    for i in range(140):
        t = i % 3
        if t == 0:
            a, b = r.choice([Fr(1, 2), Fr(1, 3), Fr(1, 4), Fr(2, 5), Fr(3, 10)]), r.choice([Fr(1, 2), Fr(1, 6), Fr(1, 5), Fr(3, 4), Fr(2, 3)])
            L[1].append((f"A und B unabhängig, P(A) = {m(fnum(a))}, P(B) = {m(fnum(b))}. P(A und B)?", m(f"{fnum(a)} · {fnum(b)} = <b>{fnum(a * b)}</b>")))
        elif t == 1:
            pa, pb = r.choice([0.2, 0.3, 0.4, 0.5, 0.6, 0.7]), r.choice([0.1, 0.2, 0.25, 0.4, 0.5, 0.8])
            L[1].append((f"Unabhängig: P(A) = {de(pa, 2)}, P(B) = {de(pb, 2)}. P(A und B)?", m(f"{de(pa, 2)} · {de(pb, 2)} = <b>{de(pa * pb, 4)}</b>")))
        else:
            e = r.choice([("zweimal würfeln", "unabhängig"), ("Münze und Würfel werfen", "unabhängig"), ("zwei Kugeln ohne Zurücklegen ziehen", "abhängig"),
                          ("zwei Kugeln mit Zurücklegen ziehen", "unabhängig"), ("„Es regnet“ und „Schirm dabei“", "abhängig"), ("„viel geübt“ und „gute Note“", "abhängig")])
            L[1].append((f"Abhängig oder unabhängig: {e[0]}?", f"<b>{e[1]}</b>"))
    for i in range(140):
        t = i % 3
        n = r.choice([100, 200, 400, 500])
        pa, pb = r.choice([0.2, 0.25, 0.3, 0.4, 0.5]), r.choice([0.2, 0.3, 0.4, 0.5, 0.6])
        if t == 0:
            k = n * pa * pb
            if abs(k - round(k)) > 1e-9:
                continue
            L[2].append((f"{n} Personen, {de(n * pa, 0)} mit A, {de(n * pb, 0)} mit B. Wie viele haben beides, wenn A und B unabhängig sind?", m(f"{n} · {de(pa, 2)} · {de(pb, 2)} = <b>{de(k, 0)}</b>")))
        elif t == 1:
            dv = r.choice([0, 0, -0.04, 0.05, 0.06])
            pab = round(pa * pb + dv, 3)
            ans = "unabhängig" if dv == 0 else "abhängig"
            L[2].append((f"P(A) = {de(pa, 2)}, P(B) = {de(pb, 2)}, P(A und B) = {de(pab, 3)}. Unabhängig?", f"{de(pa, 2)} · {de(pb, 2)} = {de(pa * pb, 3)} ⇒ <b>{ans}</b>"))
        else:
            na = int(n * pa)
            a = r.randint(1, na - 1)
            c = r.randint(1, n - na - 1)
            L[2].append((f"Vierfeldertafel ({n} Personen): {na} mit A, davon {a} auch mit B; {c} haben B, aber nicht A. Ergänze: Wie viele haben weder A noch B?", f"{n} − {na} − {c} = <b>{n - na - c}</b>"))
    for i in range(60):
        t = i % 3
        if t == 0:
            ps = [r.choice([Fr(1, 2), Fr(2, 5), Fr(3, 5), Fr(7, 10), Fr(4, 5)]) for _ in range(3)]
            q = ps[0] * ps[1] * ps[2]
            L[3].append((f"Drei unabhängige Ampeln sind mit {', '.join(_pct(p_) for p_ in ps)} grün. Wie groß ist die Wahrscheinlichkeit, dass alle drei grün sind?", m(" · ".join(de(float(p_), 1) for p_ in ps) + f" = <b>{de(float(q), 3)}</b>")))
        elif t == 1:
            ev = r.choice([("„erster Wurf gerade“", "„Augensumme 7“", Fr(3, 36), Fr(1, 2), Fr(1, 6), "unabhängig"), ("„Pasch“", "„Augensumme 7“", Fr(0), Fr(1, 6), Fr(1, 6), "abhängig"),
                           ("„erster Wurf 6“", "„Augensumme 12“", Fr(1, 36), Fr(1, 6), Fr(1, 36), "abhängig"), ("„erster Wurf 1“", "„zweiter Wurf 1“", Fr(1, 36), Fr(1, 6), Fr(1, 6), "unabhängig")])
            assert (ev[2] == ev[3] * ev[4]) == (ev[5] == "unabhängig")
            L[3].append((f"Zwei Würfel: Sind {ev[0]} und {ev[1]} unabhängig? Prüfe rechnerisch.", f"P(A und B) = {m(fnum(ev[2]))}, P(A) · P(B) = {m(fnum(ev[3] * ev[4]))} ⇒ <b>{ev[5]}</b>"))
        else:
            k = r.randint(2, 6)
            L[3].append((f"Eine Münze wird {k}-mal geworfen. Wie groß ist die Wahrscheinlichkeit, dass jedes Mal Kopf kommt?", m(f"(½)<sup>{k}</sup> = <b>1/{2 ** k}</b>")))
    for i in range(70):
        t = i % 4
        if t == 0:
            a1, n1, a2, n2 = r.choice([(12, 30, 28, 70), (18, 60, 42, 140), (10, 40, 30, 120), (24, 80, 21, 70), (30, 50, 20, 100), (9, 30, 35, 70)])
            s1, s2 = Fr(a1, n1), Fr(a2, n2)
            ans = "unabhängig" if s1 == s2 else "abhängig"
            L[3].append((f"Unter {n1} Personen mit A haben {a1} auch B, unter {n2} Personen ohne A haben {a2} B. Sind A und B unabhängig? Begründe mit Anteilen.", f"{a1}/{n1} = {_pct(s1)}, {a2}/{n2} = {_pct(s2)} ⇒ <b>{ans}</b>"))
        elif t == 1:
            p_ = r.choice([Fr(1, 100), Fr(2, 100), Fr(5, 100)])
            L[3].append((f"Zwei unabhängige Rauchmelder fallen jeweils mit {_pct(p_)} aus. Wie groß ist die Wahrscheinlichkeit, dass mindestens einer funktioniert?", f"1 − {de(float(p_), 2)} · {de(float(p_), 2)} = <b>{de(float(1 - p_ * p_), 4)}</b>"))
        elif t == 2:
            L[3].append(("Begründe: Zwei unvereinbare Ereignisse A und B mit P(A) > 0 und P(B) > 0 sind nicht unabhängig.", "P(A und B) = 0, aber P(A) · P(B) > 0. Die Produktbedingung ist <b>nicht erfüllt</b>."))
        else:
            n = r.choice([200, 400])
            pa, pb = r.choice([0.25, 0.5]), r.choice([0.2, 0.4])
            ab, a_nb = int(n * pa * pb), int(n * pa * (1 - pb))
            nab, nanb = int(n * (1 - pa) * pb), int(n * (1 - pa) * (1 - pb))
            assert ab + a_nb + nab + nanb == n
            L[3].append((f"Erstelle eine Vierfeldertafel für {n} Personen mit P(A) = {de(pa, 2)} und P(B) = {de(pb, 2)}, in der A und B unabhängig sind.",
                         f"A und B: <b>{ab}</b>, A und nicht B: <b>{a_nb}</b>, nicht A und B: <b>{nab}</b>, weder noch: <b>{nanb}</b>"))
    return L



# ================================================================ grade 8 maths, chapter III: functions
def _lin_html(mm, b):
    """m·x + b as HTML with proper signs, m and b Fractions or ints."""
    mm, b = Fr(mm), Fr(b)
    if mm == 0:
        return fnum(b)
    head = "" if mm == 1 else MINUS if mm == -1 else fnum(mm)
    s_ = f"{head}<i>x</i>"
    if b > 0:
        s_ += f" + {fnum(b)}"
    elif b < 0:
        s_ += f" − {fnum(-b)}"
    return s_


def funktionsbegriff():
    r = random.Random(96)
    L = {1: [], 2: [], 3: []}
    for i in range(160):
        t = i % 3
        mm, b = r.choice([-4, -3, -2, -1, 2, 3, 4, 5]), r.randint(-6, 6)
        x = r.randint(-5, 5)
        if t == 0:
            L[1].append((f"{m(f'<i>f</i>(<i>x</i>) = {_lin_html(mm, b)}')}. Berechne {m(f'<i>f</i>({_n(x)})')}.", m(f"<b>{_n(mm * x + b)}</b>")))
        elif t == 1:
            c = r.randint(-5, 5)
            sq = '<i>f</i>(<i>x</i>) = <i>x</i><sup>2</sup>' + (f' + {c}' if c > 0 else f' − {-c}' if c < 0 else '')
            L[1].append((f"{m(sq)}. Berechne {m(f'<i>f</i>({_n(x)})')}.", m(f"<b>{_n(x * x + c)}</b>")))
        else:
            xs = [-2, -1, 0, 1, 2]
            L[1].append((f"Wertetabelle für {m(f'<i>f</i>(<i>x</i>) = {_lin_html(mm, b)}')} mit <i>x</i> = −2 bis 2.", m(" · ".join(_n(mm * v + b) for v in xs))))
    for i in range(140):
        t = i % 4
        mm, b = r.choice([-4, -3, -2, 2, 3, 4, 5]), r.randint(-6, 6)
        x = r.randint(-5, 5)
        if t == 0:
            y = mm * x + b
            L[2].append((f"{m(f'<i>f</i>(<i>x</i>) = {_lin_html(mm, b)}')}. Für welches <i>x</i> ist {m(f'<i>f</i>(<i>x</i>) = {_n(y)}')}?", m(f"<b><i>x</i> = {_n(x)}</b>")))
        elif t == 1:
            on = r.random() < 0.5
            y = mm * x + b + (0 if on else r.choice([-2, -1, 1, 2]))
            L[2].append((f"Liegt P({_n(x)} | {_n(y)}) auf dem Graphen von {m(f'<i>f</i>(<i>x</i>) = {_lin_html(mm, b)}')}?", f"<i>f</i>({_n(x)}) = {_n(mm * x + b)} ⇒ <b>{'ja' if on else 'nein'}</b>"))
        elif t == 2:
            k, d = r.randint(2, 9), r.randint(1, 9)
            w = r.choice([(f"Multipliziere mit {k} und subtrahiere {d}.", f"{k}<i>x</i> − {d}"), (f"Addiere {d} und multipliziere mit {k}.", f"{k}(<i>x</i> + {d})"), (f"Quadriere und addiere {d}.", f"<i>x</i><sup>2</sup> + {d}")])
            L[2].append((f"Schreibe als Funktionsgleichung: „{w[0]}“", m(f"<b><i>f</i>(<i>x</i>) = {w[1]}</b>")))
        else:
            a = r.randint(1, 6)
            L[2].append((f"Welche Zahl gehört nicht zur Definitionsmenge von {m(f'<i>f</i>(<i>x</i>) = {fr(12, f'<i>x</i> − {a}')}')}?", f"<i>x</i> = <b>{a}</b> (Nenner 0): D = ℚ \\ {{{a}}}"))
    for i in range(80):
        t = i % 4
        if t == 0:
            g, k = r.choice([3.5, 4, 4.5]), r.choice([1.8, 2, 2.2, 2.5])
            km = r.randint(3, 20)
            L[3].append((f"Taxi: {de(g, 2)} € Grundpreis, {de(k, 2)} € pro km. Stelle die Funktionsgleichung auf und berechne den Preis für {km} km.", f"{m(f'<i>p</i>(<i>x</i>) = {de(k, 2)}<i>x</i> + {de(g, 2)}')}; <b>{de(g + k * km, 2)} €</b>"))
        elif t == 1:
            w = r.randint(5, 600)
            price = 0.95 if w <= 20 else 1.10 if w <= 50 else 1.80 if w <= 500 else 2.75
            L[3].append((f"Porto: bis 20 g 0,95 €, bis 50 g 1,10 €, bis 500 g 1,80 €, bis 1000 g 2,75 €. Wie viel kostet ein Brief mit {w} g? Warum ist das eine Funktion?", f"<b>{de(price, 2)} €</b>; jedem Gewicht ist <b>genau ein</b> Preis zugeordnet."))
        elif t == 2:
            c = r.randint(-5, 5)
            L[3].append((f"Bestimme die Wertemenge von {m(f'<i>f</i>(<i>x</i>) = <i>x</i><sup>2</sup>' + (f' + {c}' if c > 0 else f' − {-c}' if c < 0 else ''))}. Begründe.", f"Quadrate sind ≥ 0, also <b>W: alle Zahlen ≥ {_n(c)}</b>"))
        else:
            e = r.choice([("Jeder Zahl wird ihr Doppeltes zugeordnet.", "Funktion"), ("Jeder Zahl werden alle ihre Teiler zugeordnet.", "keine Funktion"), ("Jedem Schüler wird sein Geburtstag zugeordnet.", "Funktion"),
                          ("Jedem Monat wird ein Tag mit Regen zugeordnet.", "keine Funktion"), ("Jedem Land wird seine Hauptstadt zugeordnet.", "Funktion")])
            L[3].append((f"Funktion oder nicht? Begründe: {e[0]}", f"<b>{e[1]}</b>: {'zu jeder Eingabe genau eine Ausgabe' if e[1] == 'Funktion' else 'zu einer Eingabe gibt es mehrere Ausgaben'}"))
    return L



def eigenschaften():
    r = random.Random(97)
    L = {1: [], 2: [], 3: []}
    for i in range(160):
        t = i % 3
        mm = r.choice([-5, -4, -3, -2, -1, 1, 2, 3, 4, 5])
        x0 = r.randint(-6, 6)
        b = -mm * x0
        if t == 0:
            L[1].append((f"Nullstelle von {m(f'<i>f</i>(<i>x</i>) = {_lin_html(mm, b)}')}?", m(f"<b><i>x</i> = {_n(x0)}</b>")))
        elif t == 1:
            bb = r.randint(-9, 9)
            L[1].append((f"Schnittpunkt von {m(f'<i>f</i>(<i>x</i>) = {_lin_html(mm, bb)}')} mit der <i>y</i>-Achse?", m(f"<b>(0 | {_n(bb)})</b>")))
        else:
            bb = r.randint(-9, 9)
            L[1].append((f"Ist {m(f'<i>f</i>(<i>x</i>) = {_lin_html(mm, bb)}')} steigend oder fallend?", f"<b>{'steigend' if mm > 0 else 'fallend'}</b>"))
    for i in range(140):
        t = i % 4
        if t == 0:
            k = r.randint(1, 6)
            L[2].append((f"Nullstellen von {m(f'<i>f</i>(<i>x</i>) = <i>x</i><sup>2</sup> − {k * k}')}?", m(f"<b><i>x</i> = −{k}</b> und <b><i>x</i> = {k}</b>")))
        elif t == 1:
            p_, q = r.randint(-4, 4), r.randint(-5, 5)
            body = f"(<i>x</i> {'+ ' + str(-p_) if p_ < 0 else '− ' + str(p_)})<sup>2</sup>" if p_ else "<i>x</i><sup>2</sup>"
            body += (f" + {q}" if q > 0 else f" − {-q}" if q < 0 else "")
            L[2].append((f"Tiefpunkt von {m(f'<i>f</i>(<i>x</i>) = {body}')}?", m(f"<b>T({_n(p_)} | {_n(q)})</b>")))
        elif t == 2:
            e = r.choice([("<i>x</i><sup>2</sup>", "achsensymmetrisch zur <i>y</i>-Achse"), ("<i>x</i><sup>3</sup>", "punktsymmetrisch zum Ursprung"), ("3<i>x</i>", "punktsymmetrisch zum Ursprung"),
                          ("<i>x</i><sup>2</sup> − 5", "achsensymmetrisch zur <i>y</i>-Achse"), ("<i>x</i> + 2", "keine Symmetrie"), ("(<i>x</i> − 1)<sup>2</sup>", "keine Symmetrie zum Koordinatensystem"),
                          ("<i>x</i><sup>4</sup> + <i>x</i><sup>2</sup>", "achsensymmetrisch zur <i>y</i>-Achse"), ("<i>x</i><sup>3</sup> + <i>x</i>", "punktsymmetrisch zum Ursprung")])
            L[2].append((f"Symmetrie von {m(f'<i>f</i>(<i>x</i>) = {e[0]}')}?", f"<b>{e[1]}</b>"))
        else:
            k = r.randint(1, 5)
            L[2].append((f"Wo steigt, wo fällt {m(f'<i>f</i>(<i>x</i>) = <i>x</i><sup>2</sup> + {k}')}?", f"fallend für <b><i>x</i> ≤ 0</b>, steigend für <b><i>x</i> ≥ 0</b>"))
    for i in range(120):
        t = i % 3
        if t == 0:
            a_, b_ = r.randint(1, 6), r.randint(1, 6)
            L[2].append((f"Nullstellen von {m(f'<i>f</i>(<i>x</i>) = (<i>x</i> − {a_})(<i>x</i> + {b_})')}?", m(f"<b><i>x</i> = {a_}</b> und <b><i>x</i> = −{b_}</b>")))
        elif t == 1:
            mm, b_ = r.choice([2, 3, 4, 5, -2, -3, -4]), r.randint(1, 9) * r.choice([1, -1])
            if b_ % mm == 0:
                continue
            L[2].append((f"Nullstelle von {m(f'<i>f</i>(<i>x</i>) = {_lin_html(mm, b_)}')} (als Bruch)?", m(f"<b><i>x</i> = {fnum(Fr(-b_, mm))}</b>")))
        else:
            k = r.randint(1, 9)
            L[2].append((f"Hochpunkt von {m(f'<i>f</i>(<i>x</i>) = −<i>x</i><sup>2</sup> + {k}')} und Nullstellen?", m(f"<b>H(0 | {k})</b>; Nullstellen <b>±√{k}</b>") if k not in (1, 4, 9) else m(f"<b>H(0 | {k})</b>; Nullstellen <b>±{int(k ** 0.5)}</b>")))
    for i in range(80):
        t = i % 4
        if t == 0:
            a, b = r.randint(2, 8), r.randint(20, 90)
            # profit of a school kiosk: price a per roll, fixed costs b
            L[3].append((f"Ein Schulkiosk verdient pro Brötchen {a} € und hat {b} € feste Kosten: {m(f'<i>G</i>(<i>x</i>) = {a}<i>x</i> − {b}')}. Bestimme die Nullstelle und deute sie.", f"<i>x</i> = {b}/{a} ≈ <b>{de(b / a, 1)}</b>: Ab {-(-b // a)} Brötchen macht der Kiosk Gewinn."))
        elif t == 1:
            k = r.randint(1, 4)
            L[3].append((f"Zeige rechnerisch, dass {m(f'<i>f</i>(<i>x</i>) = <i>x</i><sup>2</sup> − {k}')} achsensymmetrisch zur <i>y</i>-Achse ist.", m(f"<i>f</i>(−<i>x</i>) = (−<i>x</i>)<sup>2</sup> − {k} = <i>x</i><sup>2</sup> − {k} = <i>f</i>(<i>x</i>)")))
        elif t == 2:
            p_, q = r.randint(1, 4), r.randint(1, 9)
            L[3].append((f"Gib eine Funktion an, deren Graph eine Parabel mit dem Hochpunkt H({p_} | {q}) ist.", m(f"z. B. <b><i>f</i>(<i>x</i>) = −(<i>x</i> − {p_})<sup>2</sup> + {q}</b>")))
        else:
            c = r.randint(1, 9)
            L[3].append((f"Begründe, warum {m(f'<i>f</i>(<i>x</i>) = <i>x</i><sup>2</sup> + {c}')} keine Nullstelle hat.", f"<i>x</i><sup>2</sup> ≥ 0, also ist <i>f</i>(<i>x</i>) ≥ {c} > 0 für alle <i>x</i>."))
    return L



def lineare_funktionen():
    r = random.Random(98)
    L = {1: [], 2: [], 3: []}
    for i in range(160):
        t = i % 4
        mm, b = r.choice([-5, -4, -3, -2, -1, 2, 3, 4, 5]), r.randint(-9, 9)
        if t == 0:
            L[1].append((f"Steigung und <i>y</i>-Achsenabschnitt von {m(f'<i>f</i>(<i>x</i>) = {_lin_html(mm, b)}')}?", m(f"<b><i>m</i> = {_n(mm)}</b>, <b><i>b</i> = {_n(b)}</b>")))
        elif t == 1:
            x = r.randint(-5, 5)
            L[1].append((f"{m(f'<i>f</i>(<i>x</i>) = {_lin_html(mm, b)}')}: berechne {m(f'<i>f</i>({_n(x)})')}.", m(f"<b>{_n(mm * x + b)}</b>")))
        elif t == 2:
            L[1].append((f"Ist {m(f'<i>f</i>(<i>x</i>) = {_lin_html(mm, b)}')} steigend oder fallend? Proportional?", f"<b>{'steigend' if mm > 0 else 'fallend'}</b>, <b>{'proportional' if b == 0 else 'nicht proportional'}</b>"))
        else:
            mm2 = r.choice([mm, mm, r.randint(-5, 5)])
            b2 = r.randint(-9, 9)
            if b2 == b:
                continue
            L[1].append((f"Sind {m(f'<i>f</i>(<i>x</i>) = {_lin_html(mm, b)}')} und {m(f'<i>g</i>(<i>x</i>) = {_lin_html(mm2, b2)}')} parallel?", f"<b>{'ja' if mm == mm2 else 'nein'}</b> ({'gleiche' if mm == mm2 else 'verschiedene'} Steigung)"))
    for i in range(160):
        t = i % 3
        if t == 0:
            x1, y1 = r.randint(-5, 3), r.randint(-6, 6)
            x2, y2 = x1 + r.randint(1, 5), r.randint(-6, 6)
            mm = Fr(y2 - y1, x2 - x1)
            L[2].append((f"Steigung der Geraden durch P({_n(x1)} | {_n(y1)}) und Q({_n(x2)} | {_n(y2)})?", m(f"({_n(y2)} − {_sg(y1)}) : ({_n(x2)} − {_sg(x1)}) = <b>{fnum(mm)}</b>")))
        elif t == 1:
            mm, b = r.choice([-4, -3, -2, 2, 3, 4, 5]), r.randint(-9, 9)
            if b == 0:
                continue
            L[2].append((f"Nullstelle von {m(f'<i>f</i>(<i>x</i>) = {_lin_html(mm, b)}')}?", m(f"<b><i>x</i> = {fnum(Fr(-b, mm))}</b>")))
        else:
            xs, ys = r.randint(-4, 4), r.randint(-5, 5)
            m1 = r.choice([-3, -2, -1, 1, 2, 3])
            m2 = r.choice([v for v in [-3, -2, -1, 1, 2, 3] if v != m1])
            b1, b2 = ys - m1 * xs, ys - m2 * xs
            L[2].append((f"Schnittpunkt von {m(f'<i>f</i>(<i>x</i>) = {_lin_html(m1, b1)}')} und {m(f'<i>g</i>(<i>x</i>) = {_lin_html(m2, b2)}')}?", m(f"<b>S({_n(xs)} | {_n(ys)})</b>")))
    for i in range(80):
        t = i % 4
        if t == 0:
            g_, p_ = r.choice([5, 8, 10, 12]), r.choice([Fr(5, 100), Fr(8, 100), Fr(9, 100)])
            p2 = p_ + r.choice([Fr(5, 100), Fr(7, 100), Fr(10, 100)])
            xs = Fr(g_) / (p2 - p_)
            L[3].append((f"Tarif A: {g_} € Grundgebühr + {de(float(p_), 2)} € pro Minute, Tarif B: {de(float(p2), 2)} € pro Minute. Ab wie vielen Minuten ist A günstiger?", f"{g_} + {de(float(p_), 2)}<i>x</i> = {de(float(p2), 2)}<i>x</i> ⇒ <i>x</i> = <b>{de(float(xs), 1)}</b>; ab mehr als {de(float(xs), 1)} Minuten ist A günstiger."))
        elif t == 1:
            h, v = r.choice([20, 24, 30, 15]), r.choice([1.5, 2, 2.5, 3])
            L[3].append((f"Eine Kerze ist {h} cm lang und brennt {de(v, 1)} cm pro Stunde ab. Stelle die Funktion auf. Wann ist sie abgebrannt?", f"{m(f'<i>h</i>(<i>t</i>) = {h} − {de(v, 1)}<i>t</i>')}; <i>t</i> = {h} : {de(v, 1)} = <b>{de(h / v, 1)} h</b>"))
        elif t == 2:
            mm = r.choice([-3, -2, 2, 3, 4])
            x0, y0 = r.randint(-3, 3), r.randint(-4, 4)
            b = y0 - mm * x0
            L[3].append((f"Eine Gerade ist parallel zu {m(f'<i>y</i> = {_lin_html(mm, 0)}')} und geht durch P({_n(x0)} | {_n(y0)}). Gleichung?", m(f"<b><i>y</i> = {_lin_html(mm, b)}</b>")))
        else:
            pct = r.choice([6, 8, 10, 12, 15])
            dist = r.choice([200, 500, 800, 1000])
            L[3].append((f"Ein Straßenschild zeigt {pct} % Steigung. Wie viele Meter Höhe gewinnt man auf {dist} m waagerechter Strecke?", f"<i>m</i> = {de(pct / 100, 2)}; {dist} · {de(pct / 100, 2)} = <b>{de(dist * pct / 100, 0)} m</b>"))
    return L



def funktionsgleichungen():
    r = random.Random(99)
    L = {1: [], 2: [], 3: []}
    for i in range(160):
        t = i % 2
        mm = r.choice([-4, -3, -2, -1, 1, 2, 3, 4])
        b = r.randint(-7, 7)
        x = r.randint(-4, 4)
        y = mm * x + b
        if t == 0:
            L[1].append((f"Steigung {m(f'<i>m</i> = {_n(mm)}')}, Punkt P({_n(x)} | {_n(y)}). Gleichung?", m(f"{_n(y)} = {_n(mm)} · {_sg(x)} + <i>b</i> ⇒ <b><i>f</i>(<i>x</i>) = {_lin_html(mm, b)}</b>")))
        else:
            L[1].append((f"Gerade mit {m(f'<i>m</i> = {_n(mm)}')}, die die <i>y</i>-Achse bei {_n(b)} schneidet. Gleichung?", m(f"<b><i>f</i>(<i>x</i>) = {_lin_html(mm, b)}</b>")))
    for i in range(160):
        mm = r.choice([Fr(-3), Fr(-2), Fr(-1), Fr(1), Fr(2), Fr(3), Fr(1, 2), Fr(-1, 2), Fr(2, 3), Fr(3, 2)])
        x1 = r.randint(-4, 2)
        dx = r.choice([1, 2, 3, 4]) * mm.denominator
        b = Fr(r.randint(-6, 6))
        x2 = x1 + dx
        y1, y2 = mm * x1 + b, mm * x2 + b
        if y1.denominator != 1 or y2.denominator != 1:
            continue
        L[2].append((f"Gerade durch P({_n(x1)} | {_n(int(y1))}) und Q({_n(x2)} | {_n(int(y2))}). Gleichung?", m(f"<i>m</i> = {fnum(mm)}, <i>b</i> = {fnum(b)}: <b><i>f</i>(<i>x</i>) = {_lin_html(mm, b)}</b>")))
    for i in range(80):
        t = i % 4
        if t == 0:
            a1, k1 = r.choice([(1000, 420), (1500, 570), (2000, 720)])
            a2 = a1 + 1000
            k2 = k1 + 300
            mm = Fr(k2 - k1, a2 - a1)
            b = k1 - mm * a1
            L[3].append((f"Stromkosten: {a1} kWh kosten {k1} €, {a2} kWh kosten {k2} €. Bestimme die Funktionsgleichung. Was bedeuten <i>m</i> und <i>b</i>?", f"{m(f'<i>K</i>(<i>x</i>) = {de(float(mm), 2)}<i>x</i> + {de(float(b), 0)}')}: <b>{de(float(mm), 2)} € pro kWh</b>, <b>{de(float(b), 0)} € Grundgebühr</b>"))
        elif t == 1:
            h1, v1, h2 = r.choice([(2, 160, 5), (1, 180, 4), (3, 140, 6)])
            rate = r.choice([10, 20])
            v2 = v1 - rate * (h2 - h1)
            start = v1 + rate * h1
            L[3].append((f"Ein Becken wird geleert: nach {h1} h sind {v1} m³ darin, nach {h2} h noch {v2} m³. Wie viel war am Anfang drin, wann ist es leer?", f"{m(f'<i>V</i>(<i>t</i>) = {start} − {rate}<i>t</i>')}: Anfang <b>{start} m³</b>, leer nach <b>{de(start / rate, 1)} h</b>"))
        elif t == 2:
            L[3].append(("Wasser gefriert bei 0 °C = 32 °F und siedet bei 100 °C = 212 °F. Bestimme die Gleichung <i>F</i>(<i>C</i>) und rechne 25 °C um.", f"{m('<i>F</i> = 1,8<i>C</i> + 32')}; 25 °C = <b>77 °F</b>"))
            assert Fr(212 - 32, 100) == Fr(9, 5) and Fr(9, 5) * 25 + 32 == 77
        else:
            mm = r.choice([2, 3, -2, -1])
            x0, y0 = r.randint(-3, 3), r.randint(-4, 4)
            b = y0 - mm * x0
            L[3].append((f"Prüfe, ob die Punkte A({_n(x0)} | {_n(y0)}), B({_n(x0 + 1)} | {_n(y0 + mm)}) und C({_n(x0 + 3)} | {_n(y0 + 3 * mm + 1)}) auf einer Geraden liegen.", f"Gerade durch A, B: {m(f'<i>y</i> = {_lin_html(mm, b)}')}; C ergibt {_n(y0 + 3 * mm)} ≠ {_n(y0 + 3 * mm + 1)}: <b>nein</b>"))
    return L



# ================================================================ grade 8 maths, chapter IV: linear systems
def _eq2(a, b, c):
    """a·x + b·y = c as HTML."""
    def t(k, v, first):
        if k == 0:
            return ""
        sign = (MINUS if k < 0 else "") if first else (" − " if k < 0 else " + ")
        return f"{sign}{'' if abs(k) == 1 else abs(k)}<i>{v}</i>"
    left = t(a, "x", True) + t(b, "y", a == 0)
    return f"{left or '0'} = {_n(c)}"


def _system(r, lo=-5, hi=5, coef=(-4, 4)):
    """Random system with an integer solution and a unique solution."""
    while True:
        x, y = r.randint(lo, hi), r.randint(lo, hi)
        a1, b1, a2, b2 = [r.choice([v for v in range(coef[0], coef[1] + 1) if v]) for _ in range(4)]
        if a1 * b2 - a2 * b1 != 0:
            return x, y, (a1, b1, a1 * x + b1 * y), (a2, b2, a2 * x + b2 * y)


def lgs_grafisch():
    r = random.Random(100)
    L = {1: [], 2: [], 3: []}
    for i in range(170):
        t = i % 3
        a, b = r.choice([1, 2, 3, -1, -2]), r.choice([1, 2, -1, 3])
        x, y = r.randint(-4, 5), r.randint(-4, 5)
        if t == 0:
            ok = r.random() < 0.5
            c = a * x + b * y + (0 if ok else r.choice([-2, -1, 1, 2]))
            L[1].append((f"Ist ({_n(x)} | {_n(y)}) Lösung von {m(_eq2(a, b, c))}?", f"{_n(a * x + b * y)} {'=' if ok else '≠'} {_n(c)}: <b>{'ja' if ok else 'nein'}</b>"))
        elif t == 1:
            bb = r.choice([1, -1])
            c = a * x + bb * y
            L[1].append((f"Stelle nach <i>y</i> um: {m(_eq2(a, bb, c))}", m(f"<b><i>y</i> = {_lin_html(Fr(-a, bb), Fr(c, bb))}</b>")))
        else:
            c = a * x + b * y
            L[1].append((f"Gib zwei Lösungen von {m(_eq2(a, b, c))} an.", f"z. B. <b>({_n(x)} | {_n(y)})</b> und <b>({_n(x + b)} | {_n(y - a)})</b>"))
            assert a * (x + b) + b * (y - a) == c
    for i in range(120):
        t = i % 2
        if t == 0:
            x, y, e1, e2 = _system(r, -4, 4, (-3, 3))
            L[2].append((f"Löse grafisch: I: {m(_eq2(*e1))}, II: {m(_eq2(*e2))}", m(f"<b>({_n(x)} | {_n(y)})</b>")))
        else:
            a, b, c = r.choice([1, 2, -1, 3]), r.choice([1, 2, -2, 3]), r.randint(-6, 6)
            k = r.choice([2, 3, -1, -2])
            kind = r.choice(["keine", "unendlich viele", "genau eine"])
            if kind == "keine":
                e2 = (k * a, k * b, k * c + r.choice([1, 2, -1]))
            elif kind == "unendlich viele":
                e2 = (k * a, k * b, k * c)
            else:
                a2, b2 = r.choice([1, 2, -1, 3]), r.choice([1, -1, 2, -3])
                if a * b2 == a2 * b:
                    continue
                e2 = (a2, b2, r.randint(-6, 6))
            L[2].append((f"Wie viele Lösungen? I: {m(_eq2(a, b, c))}, II: {m(_eq2(*e2))}", f"<b>{kind}</b>"))
    for i in range(70):
        t = i % 3
        if t == 0:
            k, beine = r.randint(15, 35), 0
            h = r.randint(3, k - 3)
            beine = 2 * h + 4 * (k - h)
            L[3].append((f"Auf einem Hof leben Hühner und Kaninchen: {k} Köpfe, {beine} Beine. Stelle ein LGS auf und löse es.", f"{m('<i>h</i> + <i>k</i> = ' + str(k))}, {m(f'2<i>h</i> + 4<i>k</i> = {beine}')}: <b>{h} Hühner, {k - h} Kaninchen</b>"))
        elif t == 1:
            n_, e = r.randint(5, 12), r.choice([8, 9, 10, 12])
            ki = r.choice([5, 6])
            ad = r.randint(1, n_ - 1)
            total = ad * e + (n_ - ad) * ki
            L[3].append((f"{n_} Kinokarten kosten {total} €. Erwachsene zahlen {e} €, Kinder {ki} €. Wie viele Erwachsene und Kinder?", f"{m(f'<i>e</i> + <i>k</i> = {n_}')}, {m(f'{e}<i>e</i> + {ki}<i>k</i> = {total}')}: <b>{ad} Erwachsene, {n_ - ad} Kinder</b>"))
        else:
            a, b, c = r.choice([1, 2, 3]), r.choice([1, -1, 2]), r.randint(-6, 6)
            L[3].append((f"Gib eine zweite Gleichung an, sodass das System mit {m(_eq2(a, b, c))} <b>keine</b> Lösung hat. Begründe.", f"z. B. {m(_eq2(a, b, c + 1))}: gleiche Steigung, anderer Achsenabschnitt ⇒ <b>parallel</b>"))
    return L


def gleichsetzungsverfahren():
    r = random.Random(101)
    L = {1: [], 2: [], 3: []}
    yl = lambda mm, b: m(f"<i>y</i> = {_lin_html(mm, b)}")
    for i in range(170):
        x, y = r.randint(-4, 5), r.randint(-4, 6)
        if i % 2 == 0:
            m1 = r.choice([1, 2, 3, -1, -2]); m2 = r.choice([v for v in (1, 2, -1, -2, -3) if v != m1])
            b1, b2 = y - m1 * x, y - m2 * x
            L[1].append((f"Gleichsetzen: I: {yl(m1, b1)}, II: {yl(m2, b2)}", f"{m(f'{_lin_html(m1, b1)} = {_lin_html(m2, b2)}')} ⇒ <b>({_n(x)} | {_n(y)})</b>"))
        else:
            m1, a = r.choice([1, 2, 3, -1, -2]), r.choice([1, 2, 3, -1])
            if a + m1 == 0:
                continue
            b1 = y - m1 * x
            c = a * x + y
            L[1].append((f"Einsetzen: I: {yl(m1, b1)}, II: {m(_eq2(a, 1, c))}", f"{m(f'{_lin_html(a + m1, b1)} = {_n(c)}')} ⇒ <b>({_n(x)} | {_n(y)})</b>"))
    for i in range(130):
        t = i % 4
        x, y = r.randint(-5, 6), r.randint(-5, 6)
        if t == 0:
            # both solved for x
            k1, k2 = r.choice([1, 2, -1, 3]), r.choice([2, -2, -1, -3, 1])
            if k1 == k2:
                continue
            c1, c2 = x - k1 * y, x - k2 * y
            hy = lambda k, c: (("" if k == 1 else MINUS if k == -1 else _n(k)) + "<i>y</i>" + (f" + {_n(c)}" if c > 0 else f" − {_n(-c)}" if c < 0 else ""))
            L[2].append((f"I: {m('<i>x</i> = ' + hy(k1, c1))}, II: {m('<i>x</i> = ' + hy(k2, c2))}", f"{m(hy(k1, c1) + ' = ' + hy(k2, c2))} ⇒ <b>({_n(x)} | {_n(y)})</b>"))
        elif t == 1:
            # one equation must be solved for y first
            a1, a2, b2 = r.choice([2, 3, -2, 1]), r.choice([1, 2, -1, 3]), r.choice([2, 3, -2])
            m1 = -a1
            if a2 + b2 * m1 == 0:
                continue
            c1, c2 = a1 * x + y, a2 * x + b2 * y
            L[2].append((f"Löse: I: {m(_eq2(a1, 1, c1))}, II: {m(_eq2(a2, b2, c2))}", f"I: {yl(m1, c1)} in II ⇒ <b>({_n(x)} | {_n(y)})</b>"))
        elif t == 2:
            mm, b = r.choice([2, -1, 3, -2, 1]), r.randint(-5, 5)
            same = r.random() < 0.5
            k = r.choice([2, 3])
            e2 = (-k * mm, k, k * b if same else k * b + r.choice([1, 2, -1]))
            L[2].append((f"Wie viele Lösungen? I: {yl(mm, b)}, II: {m(_eq2(*e2))}", f"Einsetzen ergibt {m(f'{_n(k * b)} = {_n(e2[2])}')}: <b>{'unendlich viele' if same else 'keine'}</b>"))
        else:
            m1, a, bb = r.choice([2, -1, 3, 1]), r.choice([1, 2, 3, -2]), r.choice([-1, -2, 2, 3])
            if a + bb * m1 == 0:
                continue
            b1 = y - m1 * x
            c = a * x + bb * y
            L[2].append((f"Einsetzen: I: {yl(m1, b1)}, II: {m(_eq2(a, bb, c))}", f"{m(f'{_n(a)}<i>x</i> {MINUS if bb < 0 else '+'} {abs(bb)}·({_lin_html(m1, b1)}) = {_n(c)}')} ⇒ <b>({_n(x)} | {_n(y)})</b>"))
    eur = lambda c: f"{c / 100:.2f}".replace(".", ",")
    seen = set()
    for i in range(400):
        t = i % 7
        if t == 0:
            g, p1 = r.choice([5, 6, 8, 9, 10, 12]), r.choice([4, 5, 6, 8, 10])
            p2 = p1 + r.choice([4, 5, 6, 10])
            if (100 * g) % (p2 - p1):
                continue
            xx = 100 * g // (p2 - p1)
            q = f"Tarif A: {g} € Grundgebühr und {p1} ct pro Minute, Tarif B: {p2} ct pro Minute ohne Grundgebühr. Ab wie vielen Minuten ist A günstiger?"
            a_ = f"<i>x</i>: Minuten. A: {m(f'{g} + {eur(p1)}<i>x</i>')}, B: {m(f'{eur(p2)}<i>x</i>')}. Gleichsetzen ⇒ {m(f'{eur(p2 - p1)}<i>x</i> = {g}')} ⇒ <i>x</i> = {xx}. Bei {xx} min kosten beide {eur(p2 * xx)} € ({g} + {eur(p1 * xx)} = {eur(p2 * xx)} ✓): <b>ab mehr als {xx} Minuten</b> ist A günstiger."
        elif t == 1:
            a, k = r.randint(4, 25), r.choice([2, 3, 4, 5])
            s_ = a * (k + 1)
            q = f"Die Summe zweier Zahlen ist {s_}. Die eine Zahl ist {k}-mal so groß wie die andere. Stelle ein LGS auf und löse es mit dem Einsetzungsverfahren."
            a_ = f"{m('<i>a</i> + <i>b</i> = ' + str(s_))}, {m(f'<i>a</i> = {k}<i>b</i>')}. Einsetzen: {m(f'{k + 1}<i>b</i> = {s_}')} ⇒ <i>b</i> = {a}, <i>a</i> = {a * k}. Probe: {a * k} + {a} = {s_} ✓ <b>{a * k} und {a}</b>"
        elif t == 2:
            v1, v2, d = r.choice([12, 15, 18, 20]), r.choice([36, 40, 45, 60]), r.choice([2, 3, 4, 5, 6])
            tt = Fr(d, v2 - v1)
            mins = tt * 60
            if mins.denominator != 1:
                continue
            q = f"Ein Radfahrer ({v1} km/h) hat {d} km Vorsprung vor einem Bus ({v2} km/h). Nach wie vielen Minuten holt der Bus ihn ein?"
            a_ = f"<i>t</i> in h. Rad: {m(f'<i>s</i> = {v1}<i>t</i> + {d}')}, Bus: {m(f'<i>s</i> = {v2}<i>t</i>')}. Gleichsetzen ⇒ {m(f'{v2 - v1}<i>t</i> = {d}')} ⇒ <i>t</i> = {fnum(tt)} h = <b>{mins} min</b>. Probe: Bus {_n(v2 * tt)} km, Rad {_n(v1 * tt)} + {d} = {_n(v1 * tt + d)} km ✓"
        elif t == 3:
            ma, mb, sa, sb = r.randint(20, 80), r.randint(0, 20), r.choice([2, 3, 4, 5]), r.choice([6, 7, 8, 10])
            if (ma - mb) % (sb - sa):
                continue
            w = (ma - mb) // (sb - sa)
            q = f"Lea hat {ma} € und spart {sa} € pro Woche, Ben hat {mb} € und spart {sb} € pro Woche. Wann haben beide gleich viel?"
            a_ = f"<i>w</i>: Wochen. {m(f'{ma} + {sa}<i>w</i> = {mb} + {sb}<i>w</i>')} ⇒ {m(f'{ma - mb} = {sb - sa}<i>w</i>')}: <b>nach {w} Wochen</b> haben beide {ma + sa * w} € ({ma} + {sa * w} = {mb} + {sb * w} ✓), danach Ben mehr."
        elif t == 4:
            ap, d, na, nb = r.choice([30, 35, 40, 45, 50]), r.choice([10, 15, 20, 25]), r.choice([2, 3, 4]), r.choice([2, 3, 5])
            tot = na * ap + nb * (ap + d)
            q = f"{na} Äpfel und {nb} Birnen kosten {eur(tot)} €. Eine Birne kostet {d} ct mehr als ein Apfel. Was kostet ein Apfel, was eine Birne?"
            a_ = f"In ct: {m(f'{na}<i>a</i> + {nb}<i>b</i> = {tot}')}, {m(f'<i>b</i> = <i>a</i> + {d}')}. Einsetzen: {m(f'{na + nb}<i>a</i> + {nb * d} = {tot}')} ⇒ <b>Apfel {ap} ct, Birne {ap + d} ct</b>. Probe: {na * ap} + {nb * (ap + d)} = {tot} ✓"
        elif t == 5:
            b_, d = r.randint(3, 15), r.randint(2, 9)
            u = 2 * (2 * b_ + d)
            q = f"Ein Rechteck hat den Umfang {u} cm. Die Länge ist {d} cm größer als die Breite. Berechne Länge und Breite."
            a_ = f"{m(f'2<i>l</i> + 2<i>b</i> = {u}')}, {m(f'<i>l</i> = <i>b</i> + {d}')}. Einsetzen: {m(f'4<i>b</i> + {2 * d} = {u}')} ⇒ <b><i>b</i> = {b_} cm, <i>l</i> = {b_ + d} cm</b>. Probe: 2 · {b_ + d} + 2 · {b_} = {u} ✓"
        else:
            kid, diff, yrs = r.randint(6, 16), r.randint(22, 34), r.choice([4, 5, 6, 8, 10])
            mum = kid + diff
            q = f"Eine Mutter ist {diff} Jahre älter als ihr Kind. In {yrs} Jahren sind beide zusammen {mum + kid + 2 * yrs} Jahre alt. Wie alt sind sie heute?"
            a_ = f"{m(f'<i>m</i> = <i>k</i> + {diff}')}, {m(f'(<i>m</i> + {yrs}) + (<i>k</i> + {yrs}) = {mum + kid + 2 * yrs}')}. Einsetzen: {m(f'2<i>k</i> + {diff + 2 * yrs} = {mum + kid + 2 * yrs}')} ⇒ <b>Kind {kid}, Mutter {mum} Jahre</b>. Probe: {mum + yrs} + {kid + yrs} = {mum + kid + 2 * yrs} ✓"
        if q not in seen:
            seen.add(q)
            L[3].append((q, a_))
    return L


def additionsverfahren():
    r = random.Random(102)
    L = {1: [], 2: [], 3: []}
    nzc = lambda lo, hi: r.choice([v for v in range(lo, hi + 1) if v])
    seen = set()

    def add(lvl, q, a):
        if q not in seen:
            seen.add(q)
            L[lvl].append((q, a))
    for i in range(300):
        x, y = r.randint(-4, 5), r.randint(-4, 5)
        if i % 3 < 2:
            a1, a2, b = nzc(-5, 5), nzc(-5, 5), nzc(1, 5)
            if a1 + a2 == 0:
                continue
            sg = r.choice([1, -1])
            e1, e2 = (a1, sg * b, a1 * x + sg * b * y), (a2, -sg * b, a2 * x - sg * b * y)
            add(1, f"I: {m(_eq2(*e1))}, II: {m(_eq2(*e2))}", f"I + II: {m(_eq2(a1 + a2, 0, e1[2] + e2[2]))} ⇒ <b>({_n(x)} | {_n(y)})</b>")
        else:
            a, b1, b2 = nzc(1, 5), nzc(-5, 5), nzc(-5, 5)
            if b1 == b2:
                continue
            e1, e2 = (a, b1, a * x + b1 * y), (a, b2, a * x + b2 * y)
            add(1, f"I: {m(_eq2(*e1))}, II: {m(_eq2(*e2))}", f"I − II: {m(_eq2(0, b1 - b2, e1[2] - e2[2]))} ⇒ <b>({_n(x)} | {_n(y)})</b>")
    for i in range(300):
        t = i % 3
        x, y = r.randint(-5, 5), r.randint(-5, 5)
        if t == 0:
            # one multiplication suffices
            a1, b1, k = nzc(-4, 4), nzc(-3, 3), r.choice([2, 3, -2, -3])
            a2, b2 = nzc(-5, 5), -k * b1
            if a1 * b2 - a2 * b1 == 0:
                continue
            e1, e2 = (a1, b1, a1 * x + b1 * y), (a2, b2, a2 * x + b2 * y)
            add(2, f"I: {m(_eq2(*e1))}, II: {m(_eq2(*e2))}", f"I · {_n(k)}: {m(_eq2(k * a1, k * b1, k * e1[2]))}; + II: {m(_eq2(k * a1 + a2, 0, k * e1[2] + e2[2]))} ⇒ <i>x</i> = {_n(x)}, <i>y</i> = {_n(y)}: <b>({_n(x)} | {_n(y)})</b>")
        elif t == 1:
            x, y, e1, e2 = _system(r, -4, 5, (-5, 5))
            g = math.gcd(abs(e1[0]), abs(e2[0]))
            k1, k2 = abs(e2[0]) // g, -(1 if e1[0] * e2[0] > 0 else -1) * abs(e1[0]) // g
            assert k1 * e1[0] + k2 * e2[0] == 0
            add(2, f"Mit welchen Zahlen musst du I und II multiplizieren, damit <i>x</i> wegfällt? Löse dann. I: {m(_eq2(*e1))}, II: {m(_eq2(*e2))}", f"I · {_n(k1)}, II · {_n(k2)}: {m(_eq2(k1 * e1[0], k1 * e1[1], k1 * e1[2]))}, {m(_eq2(k2 * e2[0], k2 * e2[1], k2 * e2[2]))}; addiert: {m(_eq2(0, k1 * e1[1] + k2 * e2[1], k1 * e1[2] + k2 * e2[2]))} ⇒ <b>({_n(x)} | {_n(y)})</b>")
        else:
            a, b, c = nzc(1, 4), nzc(-4, 4), r.randint(-8, 8)
            k = r.choice([2, 3, -2, -1])
            same = r.random() < 0.5
            e2 = (k * a, k * b, k * c if same else k * c + r.choice([1, 2, -1, 3]))
            add(2, f"Wie viele Lösungen? I: {m(_eq2(a, b, c))}, II: {m(_eq2(*e2))}", f"I · {_n(-k)} + II: {m(f'0 = {_n(e2[2] - k * c)}')} ⇒ <b>{'unendlich viele' if same else 'keine'}</b>")
    eur = lambda c: f"{c / 100:.2f}".replace(".", ",")
    for i in range(500):
        t = i % 6
        if t == 0:
            x, y, e1, e2 = _system(r, -6, 6, (-7, 7))
            if min(abs(v) for v in (e1[0], e1[1], e2[0], e2[1])) < 2:
                continue
            g = math.gcd(abs(e1[1]), abs(e2[1]))
            k1, k2 = abs(e2[1]) // g, -(1 if e1[1] * e2[1] > 0 else -1) * abs(e1[1]) // g
            add(3, f"Löse mit dem Additionsverfahren und mache die Probe: I: {m(_eq2(*e1))}, II: {m(_eq2(*e2))}", f"I · {_n(k1)}, II · {_n(k2)}: {m(_eq2(k1 * e1[0] + k2 * e2[0], 0, k1 * e1[2] + k2 * e2[2]))} ⇒ <i>x</i> = {_n(x)}, <i>y</i> = {_n(y)}: <b>({_n(x)} | {_n(y)})</b>. Probe: {_n(e1[0] * x)} + {_n(e1[1] * y)} = {_n(e1[2])} ✓")
        elif t == 1:
            k_, b_ = r.choice([90, 100, 110, 120, 130, 140]), r.choice([50, 80, 100, 120])
            n1, n2 = r.choice([2, 3]), r.choice([4, 5])
            m1, m2 = r.choice([1, 2]), r.choice([1, 2])
            p1, p2 = n1 * k_ + m1 * b_, n2 * k_ + m2 * b_
            if n1 * m2 == n2 * m1:
                continue
            add(3, f"Eisdiele: {n1} Kugeln und {m1} Becher kosten {eur(p1)} €, {n2} Kugeln und {m2} Becher kosten {eur(p2)} €. Was kosten eine Kugel und ein Becher?", f"In ct: {m(f'{n1}<i>k</i> + {m1}<i>b</i> = {p1}')}, {m(f'{n2}<i>k</i> + {m2}<i>b</i> = {p2}')} ⇒ Faktoren I · {_n(n2 // math.gcd(n1, n2))}, II · {_n(-n1 // math.gcd(n1, n2))} eliminieren <i>k</i> ⇒ <b>Kugel {eur(k_)} €, Becher {eur(b_)} €</b>. Probe: {n1 * k_} + {m1 * b_} = {p1} ✓")
        elif t == 2:
            z, d = r.randint(3, 14), r.randint(2, 9)
            add(3, f"Im Basketballspiel trifft Mia {z + d}-mal und erzielt {2 * z + 3 * d} Punkte, nur mit Zweiern und Dreiern. Wie viele Zweier und Dreier waren es?", f"{m(f'<i>z</i> + <i>d</i> = {z + d}')}, {m(f'2<i>z</i> + 3<i>d</i> = {2 * z + 3 * d}')}. I · (−2) + II: <i>d</i> = {d}, in I: <i>z</i> = {z + d} − {d} = {z}: <b>{z} Zweier, {d} Dreier</b>. Probe: {2 * z} + {3 * d} = {2 * z + 3 * d} ✓")
        elif t == 3:
            v, st = r.randint(8, 20), r.randint(1, 6)
            add(3, f"Ein Boot fährt flussabwärts {v + st} km/h und flussaufwärts {v - st} km/h. Wie schnell ist das Boot im stehenden Wasser, wie schnell die Strömung?", f"{m(f'<i>v</i> + <i>s</i> = {v + st}')}, {m(f'<i>v</i> − <i>s</i> = {v - st}')}. Addieren: {m(f'2<i>v</i> = {2 * v}')} ⇒ <i>v</i> = {v}, in I: {m(f'{v} + <i>s</i> = {v + st}')}: <b>Boot {v} km/h, Strömung {st} km/h</b>. Probe: {v} − {st} = {v - st} ✓")
        elif t == 4:
            e, z = r.randint(3, 15), r.randint(3, 15)
            add(3, f"In einer Kasse liegen {e + z} Münzen, nur 1-€- und 2-€-Stücke, zusammen {e + 2 * z} €. Wie viele von jeder Sorte?", f"{m(f'<i>e</i> + <i>z</i> = {e + z}')}, {m(f'<i>e</i> + 2<i>z</i> = {e + 2 * z}')}. II − I: <i>z</i> = {z}, in I: <i>e</i> = {e + z} − {z} = {e}: <b>{e} Ein-Euro- und {z} Zwei-Euro-Stücke</b>. Probe: {e} + {2 * z} = {e + 2 * z} ✓")
        else:
            x, y = r.randint(-4, 6), r.randint(-4, 6)
            a1, b1, a2, b2 = nzc(2, 5), nzc(2, 4), nzc(2, 5), nzc(-4, -2)
            if a1 * b2 - a2 * b1 == 0:
                continue
            c1, c2 = a1 * x + b1 * y, a2 * x + b2 * y
            add(3, f"Bringe zuerst in die Form {m('<i>ax</i> + <i>by</i> = <i>c</i>')} und löse: I: {m(f'{a1}<i>x</i> = {_n(c1)} − {b1}<i>y</i>')}, II: {m(f'{a2}<i>x</i> − {_n(c2)} = {-b2}<i>y</i>')}", f"I: {m(_eq2(a1, b1, c1))}, II: {m(_eq2(a2, b2, c2))}. Faktoren für <i>y</i>: I · {_n(-b2 // math.gcd(b1, -b2))}, II · {_n(b1 // math.gcd(b1, -b2))} ⇒ {m(_eq2((-b2 * a1 + b1 * a2) // math.gcd(b1, -b2), 0, (-b2 * c1 + b1 * c2) // math.gcd(b1, -b2)))} ⇒ <b>({_n(x)} | {_n(y)})</b>")
    return L


def lgs_anwendungen():
    r = random.Random(103)
    L = {1: [], 2: [], 3: []}
    seen = set()
    dec = lambda v: f"{float(v):g}".replace(".", ",").replace("-", MINUS)
    eur = lambda c: f"{c / 100:.2f}".replace(".", ",")
    names = ["Anna", "Ben", "Cem", "Dana", "Emil", "Fiona", "Jonas", "Lina", "Mehmet", "Nele", "Paul", "Sara"]

    def add(lvl, q, a):
        if q not in seen:
            seen.add(q)
            L[lvl].append((q, a))
    for i in range(600):
        t = i % 6
        p1, p2 = r.sample(names, 2)
        k = r.randint(2, 15)
        if t == 0:
            add(1, f"Übersetze: „{p1} ist {k} Jahre älter als {p2}.“", f"<i>{p1[0].lower()}</i>, <i>{p2[0].lower()}</i>: Alter in Jahren. " + m(f"<b><i>{p1[0].lower()}</i> = <i>{p2[0].lower()}</i> + {k}</b>") + f": Zum Alter von {p2} kommen {k} Jahre dazu.")
        elif t == 1:
            f = r.choice([2, 3, 4])
            word = {2: "doppelt", 3: "dreimal", 4: "viermal"}[f]
            add(1, f"Übersetze: „{p1} hat {word} so viele Sticker wie {p2}.“", f"<i>{p1[0].lower()}</i>, <i>{p2[0].lower()}</i>: Anzahl der Sticker. " + m(f"<b><i>{p1[0].lower()}</i> = {f}<i>{p2[0].lower()}</i></b>") + f": Die Anzahl von {p2} wird mit {f} multipliziert.")
        elif t == 2:
            add(1, f"Übersetze: „{p1} und {p2} haben zusammen {k * 3} €.“", f"<i>{p1[0].lower()}</i>, <i>{p2[0].lower()}</i>: Geld in €. " + m(f"<b><i>{p1[0].lower()}</i> + <i>{p2[0].lower()}</i> = {k * 3}</b>"))
        elif t == 3:
            b = r.randint(3, 30)
            add(1, f"Summe zweier Zahlen: {2 * b + k}, Differenz: {k}. Bestimme die Zahlen.", f"{m(f'<i>a</i> + <i>b</i> = {2 * b + k}')}, {m(f'<i>a</i> − <i>b</i> = {k}')} ⇒ addieren: {m(f'2<i>a</i> = {2 * b + 2 * k}')} ⇒ <b>{b + k} und {b}</b>")
        elif t == 4:
            b = r.randint(2, 20)
            f = r.choice([2, 3, 4, 5])
            add(1, f"Eine Zahl ist {f}-mal so groß wie eine andere, zusammen ergeben sie {b * (f + 1)}. Bestimme die Zahlen.", f"{m(f'<i>a</i> = {f}<i>b</i>')}, {m(f'<i>a</i> + <i>b</i> = {b * (f + 1)}')} ⇒ einsetzen: {m(f'{f + 1}<i>b</i> = {b * (f + 1)}')} ⇒ <b>{b * f} und {b}</b>")
        else:
            b = r.randint(2, 20)
            add(1, f"{p1} hat {k} € mehr als {p2}, zusammen haben sie {2 * b + k} €. Wie viel hat jeder?", f"{m(f'<i>{p1[0].lower()}</i> = <i>{p2[0].lower()}</i> + {k}')} ⇒ {m(f'2<i>{p2[0].lower()}</i> + {k} = {2 * b + k}')}: <b>{p1} {b + k} €, {p2} {b} €</b>. Probe: {b + k} + {b} = {2 * b + k} ✓")
    for i in range(600):
        t = i % 5
        if t == 0:
            e, k_, pe, pk = r.randint(2, 9), r.randint(2, 12), r.choice([8, 9, 10, 12, 14]), r.choice([4, 5, 6, 7])
            add(2, f"{e + k_} Personen zahlen im Zoo zusammen {e * pe + k_ * pk} €. Erwachsene zahlen {pe} €, Kinder {pk} €. Wie viele Erwachsene, wie viele Kinder?", f"{m(f'<i>e</i> + <i>k</i> = {e + k_}')}, {m(f'{pe}<i>e</i> + {pk}<i>k</i> = {e * pe + k_ * pk}')} ⇒ <b>{e} Erwachsene, {k_} Kinder</b>")
        elif t == 1:
            h, k_ = r.randint(4, 25), r.randint(3, 15)
            add(2, f"Hühner und Ziegen: {h + k_} Köpfe, {2 * h + 4 * k_} Beine. Wie viele von jeder Art?", f"{m(f'<i>h</i> + <i>z</i> = {h + k_}')}, {m(f'2<i>h</i> + 4<i>z</i> = {2 * h + 4 * k_}')} ⇒ <b>{h} Hühner, {k_} Ziegen</b>")
        elif t == 2:
            a, b = r.choice([60, 80, 90, 120, 150]), r.choice([40, 50, 70, 110])
            n1, m1, n2, m2 = r.randint(1, 4), r.randint(1, 4), r.randint(1, 4), r.randint(1, 4)
            if n1 * m2 == n2 * m1:
                continue
            add(2, f"{n1} Brezeln und {m1} Brötchen kosten {eur(n1 * a + m1 * b)} €, {n2} Brezeln und {m2} Brötchen kosten {eur(n2 * a + m2 * b)} €. Einzelpreise?", f"In ct: {m(f'{n1}<i>z</i> + {m1}<i>b</i> = {n1 * a + m1 * b}')}, {m(f'{n2}<i>z</i> + {m2}<i>b</i> = {n2 * a + m2 * b}')} ⇒ <b>Brezel {eur(a)} €, Brötchen {eur(b)} €</b>")
        elif t == 3:
            b, d = r.randint(3, 15), r.randint(1, 9)
            add(2, f"Ein Rechteck hat {2 * (2 * b + d)} cm Umfang, die Länge ist {d} cm größer als die Breite. Seitenlängen?", f"{m(f'2<i>l</i> + 2<i>b</i> = {2 * (2 * b + d)}')}, {m(f'<i>l</i> = <i>b</i> + {d}')} ⇒ <b><i>l</i> = {b + d} cm, <i>b</i> = {b} cm</b>")
        else:
            k_, diff, y = r.randint(5, 15), r.randint(22, 34), r.choice([3, 4, 5, 6, 8, 10])
            add(2, f"Ein Vater ist {diff} Jahre älter als sein Sohn. In {y} Jahren sind beide zusammen {2 * k_ + diff + 2 * y} Jahre alt. Wie alt sind sie heute?", f"{m(f'<i>v</i> = <i>s</i> + {diff}')}, {m(f'<i>v</i> + <i>s</i> + {2 * y} = {2 * k_ + diff + 2 * y}')} ⇒ <b>Sohn {k_}, Vater {k_ + diff}</b>")
    for i in range(600):
        t = i % 5
        if t == 0:
            # mixing: x litres of p1 % plus y litres of p2 % give total at p %
            p1, p2 = r.choice([10, 20, 30, 40]), r.choice([60, 70, 80, 100])
            x, y = r.randint(1, 8), r.randint(1, 8)
            tot = x + y
            if (p1 * x + p2 * y) % tot:
                continue
            pm = (p1 * x + p2 * y) // tot
            add(3, f"Schorle mit {p1} % Saft und Saft mit {p2} % Saftanteil sollen {tot} l Getränk mit {pm} % Saft ergeben. Wie viel Liter von jeder Sorte?", f"{m(f'<i>x</i> + <i>y</i> = {tot}')}, {m(f'{dec(Fr(p1, 100))}<i>x</i> + {dec(Fr(p2, 100))}<i>y</i> = {dec(Fr(pm * tot, 100))}')} ⇒ I · (−{dec(Fr(p1, 100))}) + II: {m(f'{dec(Fr(p2 - p1, 100))}<i>y</i> = {dec(Fr(pm * tot - p1 * tot, 100))}')} ⇒ <b>{x} l mit {p1} %, {y} l mit {p2} %</b>. Probe: {dec(Fr(p1 * x, 100))} + {dec(Fr(p2 * y, 100))} = {dec(Fr(pm * tot, 100))} l Saft ✓")
        elif t == 1:
            v1, v2 = r.choice([40, 50, 60, 80]), r.choice([60, 70, 90, 100])
            tt = Fr(r.choice([1, 2, 3, 4, 5]), 2)
            d = (v1 + v2) * tt
            if d.denominator != 1:
                continue
            add(3, f"Zwei Orte liegen {d} km auseinander. Ein Auto startet in A ({v1} km/h), gleichzeitig ein zweites in B ({v2} km/h), beide fahren aufeinander zu. Wann und wo treffen sie sich?", f"{m(f'<i>s</i> = {v1}<i>t</i>')}, {m(f'<i>s</i> = {d} − {v2}<i>t</i>')} ⇒ {m(f'{v1 + v2}<i>t</i> = {d}')} ⇒ <b><i>t</i> = {dec(tt)} h, {dec(v1 * tt)} km von A</b>. Probe: {dec(v1 * tt)} + {dec(v2 * tt)} = {d} km ✓ Antwort: Nach {dec(tt * 60)} Minuten treffen sie sich {dec(v1 * tt)} km von A entfernt.")
        elif t == 2:
            g, p1 = r.choice([5, 8, 10, 12, 15]), r.choice([5, 8, 10])
            p2 = p1 + r.choice([5, 10])
            if (100 * g) % (p2 - p1):
                continue
            xx = 100 * g // (p2 - p1)
            add(3, f"Stromtarif A: {g} € Grundpreis und {p1} ct pro kWh, Tarif B: {p2} ct pro kWh ohne Grundpreis. Ab welchem Verbrauch ist A günstiger? Wie hoch sind dann die Kosten?", f"{m(f'<i>y</i> = {eur(p1)}<i>x</i> + {g}')}, {m(f'<i>y</i> = {eur(p2)}<i>x</i>')} ⇒ {m(f'{eur(p2 - p1)}<i>x</i> = {g}')}: bei {xx} kWh kosten beide {eur(p2 * xx)} € ({g} + {eur(p1 * xx)} = {eur(p2 * xx)} ✓). <b>Ab mehr als {xx} kWh</b> ist A günstiger, weil A pro kWh weniger kostet.")
        elif t == 3:
            a, b = r.randint(1, 9), r.randint(1, 9)
            if a <= b:
                continue
            add(3, f"Eine zweistellige Zahl hat die Quersumme {a + b}. Vertauscht man die Ziffern, wird die Zahl um {9 * (a - b)} kleiner. Wie heißt die Zahl?", f"{m(f'<i>z</i> + <i>e</i> = {a + b}')}, {m(f'(10<i>z</i> + <i>e</i>) − (10<i>e</i> + <i>z</i>) = {9 * (a - b)}')} ⇒ {m(f'<i>z</i> − <i>e</i> = {a - b}')} ⇒ addieren: {m(f'2<i>z</i> = {2 * a}')}, <i>z</i> = {a}, <i>e</i> = {b}: <b>{10 * a + b}</b>. Probe: {10 * a + b} − {10 * b + a} = {9 * (a - b)} ✓")
        else:
            fix, var, price = r.choice([60, 80, 90, 120, 150]), r.choice([1, 2]), r.choice([3, 4, 5])
            if fix % (price - var):
                continue
            n_ = fix // (price - var)
            add(3, f"Ein Waffelstand hat {fix} € feste Kosten und {var} € Kosten pro Waffel. Eine Waffel wird für {price} € verkauft. Ab wie vielen Waffeln macht der Stand Gewinn?", f"Kosten {m(f'<i>y</i> = {var}<i>x</i> + {fix}')}, Einnahmen {m(f'<i>y</i> = {price}<i>x</i>')} ⇒ {m(f'{price - var}<i>x</i> = {fix}')}: <i>x</i> = {n_}. Bei {n_} Waffeln Kosten = Einnahmen = {price * n_} €, <b>ab {n_ + 1} Waffeln</b> Gewinn ({price * (n_ + 1)} € > {var * (n_ + 1) + fix} €).")
    return L


def zentrische_streckung():
    r = random.Random(104)
    L = {1: [], 2: [], 3: []}
    seen = set()
    dec = lambda v: f"{float(v):g}".replace(".", ",").replace("-", MINUS)
    def rd(v):
        v = Fr(v)
        return dec(v) if (v * 1000).denominator == 1 else "≈ " + f"{float(v):.2f}".replace(".", ",")
    P = lambda x, y: f"({dec(x)} | {dec(y)})"

    def add(lvl, q, a):
        if q not in seen and len(L[lvl]) < 120:
            seen.add(q)
            L[lvl].append((q, a))
    ks = [Fr(1, 2), Fr(3, 2), Fr(2), Fr(5, 2), Fr(3), Fr(1, 4), Fr(3, 4), Fr(4), Fr(5, 4)]
    for i in range(800):
        t = i % 5
        k = r.choice(ks)
        a = r.choice([2, 3, 4, 5, 6, 8, 10, 12])
        if t == 0:
            add(1, f"|<i>ZP</i>| = {a} cm, |<i>ZP</i>′| = {dec(a * k)} cm. Bestimme <i>k</i>.", f"<i>k</i> = {dec(a * k)} : {a} = <b>{dec(k)}</b>")
        elif t == 1:
            kk = k * r.choice([1, 1, -1])
            add(1, f"Strecke mit {a} cm, <i>k</i> = {dec(kk)}. Länge der Bildstrecke?", f"|{dec(kk)}| · {a} cm = <b>{dec(abs(kk) * a)} cm</b>")
        elif t == 2:
            add(1, f"Bildstrecke {dec(a * k)} cm bei <i>k</i> = {dec(k)}. Länge des Originals?", f"{dec(a * k)} : {dec(k)} = <b>{a} cm</b>")
        elif t == 3:
            kk = k * r.choice([1, -1])
            kind = "Vergrößerung" if abs(kk) > 1 else "Verkleinerung"
            add(1, f"<i>k</i> = {dec(kk)}: Vergrößerung oder Verkleinerung? Auf welcher Seite von <i>Z</i> liegt das Bild?", f"<b>{kind}</b>, {'gleiche Seite' if kk > 0 else 'gegenüberliegende Seite'}")
        else:
            x, y = r.randint(2, 9), r.randint(2, 9)
            sim = r.random() < 0.5
            x2, y2 = x * k, y * k + (0 if sim else r.choice([1, -1]))
            if y2 <= 0 or x == y:
                continue
            add(1, f"Rechtecke {x} cm × {y} cm und {dec(x2)} cm × {dec(y2)} cm: ähnlich?", f"{dec(x2)} : {x} = {dec(k)}, {dec(y2)} : {y} = {rd(Fr(y2) / y)}: <b>{'ja' if sim else 'nein'}</b>")
    for i in range(800):
        t = i % 6
        k = r.choice([2, 3, Fr(1, 2), -1, -2, Fr(3, 2)])
        if t == 4:
            sc, cm = r.choice([10000, 20000, 25000, 50000]), r.choice([2, 3, 4, 5, 6, 8, 12])
            add(2, f"Karte 1 : {sc}: {cm} cm auf der Karte. Wirkliche Länge?", f"{cm} cm · {sc} = {cm * sc} cm = {dec(Fr(cm * sc, 100))} m = <b>{dec(Fr(cm * sc, 100000))} km</b>")
            continue
        if t == 5:
            sc, km = r.choice([10000, 25000, 50000]), r.choice([1, 2, 3, 5])
            add(2, f"Wie lang sind {km} km auf einer Karte 1 : {sc}?", f"{km} km = {km * 100000} cm, : {sc} = <b>{dec(Fr(km * 100000, sc))} cm</b>")
            continue
        if t == 0:
            x, y = r.randint(-4, 5), r.randint(-4, 5)
            add(2, f"<i>Z</i>(0 | 0), <i>k</i> = {dec(k)}. Bild von <i>P</i>{P(x, y)}?", f"({dec(k)} · {dec(x)} | {dec(k)} · {dec(y)}) = <b><i>P</i>′{P(k * x, k * y)}</b>")
        elif t == 1:
            zx, zy, x, y = r.randint(-3, 3), r.randint(-3, 3), r.randint(-3, 5), r.randint(-3, 5)
            if (zx, zy) == (x, y):
                continue
            bx, by = zx + k * (x - zx), zy + k * (y - zy)
            add(2, f"<i>Z</i>{P(zx, zy)}, <i>P</i>{P(x, y)}, <i>k</i> = {dec(k)}. Berechne <i>P</i>′.", f"<i>ZP</i> = ({dec(x - zx)} | {dec(y - zy)}), · {dec(k)} = ({dec(k * (x - zx))} | {dec(k * (y - zy))}), + <i>Z</i>: <b><i>P</i>′{P(bx, by)}</b>")
        elif t == 2:
            zx, zy, dx, dy = r.randint(-3, 3), r.randint(-3, 3), r.choice([1, 2, -1, -2]), r.choice([1, 2, 3, -1])
            add(2, f"<i>Z</i>{P(zx, zy)}, <i>P</i>{P(zx + dx, zy + dy)}, <i>P</i>′{P(zx + k * dx, zy + k * dy)}. Bestimme <i>k</i>.", f"<i>ZP</i> = ({dec(dx)} | {dec(dy)}), <i>ZP</i>′ = ({dec(k * dx)} | {dec(k * dy)}) ⇒ <b><i>k</i> = {dec(k)}</b>")
        else:
            a, b, c = r.randint(3, 9), r.randint(3, 9), r.randint(3, 9)
            kk = r.choice([Fr(3, 2), Fr(2), Fr(5, 2), Fr(1, 2)])
            add(2, f"Dreieck mit Seiten {a} cm, {b} cm, {c} cm wird mit <i>k</i> = {dec(kk)} gestreckt. Seiten und Umfang des Bildes?", f"<b>{dec(a * kk)} cm, {dec(b * kk)} cm, {dec(c * kk)} cm</b>, Umfang {dec((a + b + c) * kk)} cm = {dec(kk)} · {a + b + c} cm")
    for i in range(800):
        t = i % 5
        if t == 0:
            zx, zy, x, y = r.randint(-3, 3), r.randint(-3, 3), r.randint(-3, 4), r.randint(-3, 4)
            k = r.choice([2, 3, -1, -2])
            if (zx, zy) == (x, y):
                continue
            bx, by = zx + k * (x - zx), zy + k * (y - zy)
            # Z = (P' - kP) / (1 - k)
            assert Fr(bx - k * x, 1 - k) == zx and Fr(by - k * y, 1 - k) == zy
            add(3, f"Bei einer Streckung mit <i>k</i> = {dec(k)} wird <i>P</i>{P(x, y)} auf <i>P</i>′{P(bx, by)} abgebildet. Bestimme das Streckzentrum <i>Z</i>.", f"<i>P</i>′ − <i>Z</i> = {dec(k)} · (<i>P</i> − <i>Z</i>) ⇒ <i>Z</i> = (<i>P</i>′ − {dec(k)}<i>P</i>) : {dec(1 - k)} = ({dec(bx - k * x)} | {dec(by - k * y)}) : {dec(1 - k)}: <b><i>Z</i>{P(zx, zy)}</b>")
        elif t == 1:
            dist, size, wall = r.choice([1, 2, 3]), r.choice([2, 3, 4, 5]), r.choice([2, 3, 4])
            add(3, f"Eine Lampe steht {dist} m vor einer {size} cm großen Figur, die Wand ist {dist * wall} m von der Lampe entfernt. Wie groß ist der Schatten?", f"Die Lampe ist das Streckzentrum. <i>k</i> = Abstand Wand : Abstand Figur = {dist * wall} : {dist} = {wall} ⇒ Schatten {wall} · {size} cm = <b>{size * wall} cm</b>")
        elif t == 2:
            m_ = r.choice([18, 24, 43, 87, 50, 25])
            L_ = r.choice([360, 432, 450, 480, 516, 540])
            v = Fr(L_, m_)
            if v.denominator not in (1, 2, 4, 5, 10):
                continue
            add(3, f"Ein Modellauto im Maßstab 1 : {m_} ist {dec(v)} cm lang. Wie lang ist das echte Auto? Welcher Streckfaktor führt vom Original zum Modell?", f"Jede Länge des Originals ist {m_}-mal so groß: {dec(v)} cm · {m_} = {dec(v * m_)} cm = <b>{dec(v * m_ / 100)} m</b>. Vom Original zum Modell: <b><i>k</i> = 1/{m_}</b> (Verkleinerung)")
        elif t == 3:
            a, b = r.choice([10, 13, 15, 20]), r.choice([15, 18, 20, 30])
            c, d = r.choice([20, 26, 30, 40]), r.choice([30, 36, 40, 60])
            if a >= b or c >= d:
                continue
            sim = Fr(c, a) == Fr(d, b)
            add(3, f"Lässt sich ein Foto {a} × {b} ohne Abschneiden auf {c} × {d} vergrößern? Begründe.", f"Vergleiche die Faktoren beider Seiten: {c} : {a} = {rd(Fr(c, a))}, {d} : {b} = {rd(Fr(d, b))}: <b>{'ja, ähnlich' if sim else 'nein, nicht ähnlich: Es muss abgeschnitten werden'}</b>")
        else:
            a, b, k = r.randint(2, 8), r.randint(2, 8), r.choice([2, 3, Fr(1, 2), Fr(3, 2)])
            add(3, f"Ein Rechteck {a} cm × {b} cm wird mit <i>k</i> = {dec(k)} gestreckt. Wie ändern sich Umfang und Flächeninhalt?", f"Umfang {2 * (a + b)} cm → {dec(2 * (a + b) * k)} cm (· {dec(k)}), Fläche {a * b} cm² → {dec(a * b * k * k)} cm² (<b>· {dec(k * k)} = {dec(k)}²</b>)")
    return L


def aehnliche_dreiecke():
    r = random.Random(105)
    L = {1: [], 2: [], 3: []}
    seen = set()
    dec = lambda v: f"{float(v):g}".replace(".", ",").replace("-", MINUS)
    def rd(v):
        v = Fr(v)
        return dec(v) if (v * 1000).denominator == 1 else "≈ " + f"{float(v):.2f}".replace(".", ",")
    cm = lambda v: dec(v) + " cm"

    def add(lvl, q, a):
        if q not in seen and len(L[lvl]) < 120:
            seen.add(q)
            L[lvl].append((q, a))

    def sides():
        while True:
            t = sorted(r.randint(2, 9) for _ in range(3))
            if t[0] + t[1] > t[2]:
                return t
    ks = [Fr(3, 2), Fr(2), Fr(5, 2), Fr(3), Fr(1, 2)]
    for i in range(900):
        t = i % 6
        if t >= 4:
            a, b = r.randint(6, 14) * 5, r.randint(6, 12) * 5
            if a + b >= 170:
                continue
            g = 180 - a - b
            add(1, f"Dreieck 1: α = {a}°, β = {b}°. Dreieck 2: β′ = {b}°, γ′ = {g}°. Ähnlich? Begründe.", f"Dreieck 1: γ = 180° − {a}° − {b}° = {g}°. Dreieck 2: α′ = 180° − {b}° − {g}° = {a}°. Alle Winkel gleich: <b>ähnlich (WW)</b>")
            continue
        if t == 0:
            a, b = r.randint(6, 16) * 5, r.randint(6, 14) * 5
            if a + b >= 170:
                continue
            add(1, f"Dreieck: α = {a}°, β = {b}°. Wie groß sind die Winkel eines ähnlichen Dreiecks?", f"Winkel bleiben gleich: α′ = {a}°, β′ = {b}°, γ′ = 180° − {a}° − {b}° = <b>{180 - a - b}°</b>")
        elif t == 1:
            x, k = r.randint(2, 9), r.choice(ks)
            add(1, f"Entsprechende Seiten: {cm(x)} und {cm(x * k)}. Bestimme <i>k</i>.", f"<i>k</i> = Bild : Original = {dec(x * k)} : {x} = <b>{dec(k)}</b> ({'Vergrößerung' if k > 1 else 'Verkleinerung'})")
        elif t == 2:
            a, b = r.randint(6, 14) * 5, r.randint(6, 12) * 5
            same = r.random() < 0.5
            g = 180 - a - b
            c2 = g if same else g + r.choice([5, 10, -5])
            if a + b >= 170:
                continue
            add(1, f"Dreieck 1: α = {a}°, β = {b}°. Dreieck 2: α′ = {a}°, γ′ = {c2}°. Ähnlich?", f"γ = 180° − {a}° − {b}° = {g}° {'=' if same else '≠'} {c2}°: <b>{'ja (WW)' if same else 'nein'}</b>")
        else:
            s_ = sides()
            k = r.choice(ks)
            add(1, f"Dreieck mit {', '.join(cm(v) for v in s_)} wird mit <i>k</i> = {dec(k)} vergrößert/verkleinert. Neue Seiten?", f"Jede Seite · {dec(k)}: <b>{', '.join(cm(v * k) for v in s_)}</b>")
    for i in range(900):
        t = i % 4
        s_ = sides()
        k = r.choice(ks)
        if t == 0:
            j = r.choice([1, 2])
            shown = [cm(s_[0] * k)] + ["<i>x</i>" if q == j else cm(s_[q] * k) for q in (1, 2)]
            add(2, f"Ähnliche Dreiecke: {', '.join(cm(v) for v in s_)} und {', '.join(shown)}. Berechne <i>x</i>.", f"<i>k</i> = {dec(s_[0] * k)} : {s_[0]} = {dec(k)}, <i>x</i> = {dec(k)} · {s_[j]} = <b>{cm(s_[j] * k)}</b>")
        elif t == 1:
            same = r.random() < 0.5
            s2 = [v * k for v in s_]
            if not same:
                s2[2] += r.choice([1, -1, Fr(1, 2)])
            add(2, f"Dreiecke {', '.join(cm(v) for v in s_)} und {', '.join(cm(v) for v in s2)}: ähnlich?", f"{', '.join(f'{dec(b)} : {a} = {rd(Fr(b) / a)}' for a, b in zip(s_, s2))}: <b>{'ja (SSS)' if same else 'nein'}</b>")
        elif t == 2:
            b, c, w = r.randint(3, 8), r.randint(3, 8), r.randint(6, 24) * 5
            same = r.random() < 0.5
            w2 = w if same else w + r.choice([5, 10, -10])
            add(2, f"Dreieck 1: <i>b</i> = {cm(b)}, <i>c</i> = {cm(c)}, α = {w}°. Dreieck 2: <i>b</i>′ = {cm(b * k)}, <i>c</i>′ = {cm(c * k)}, α′ = {w2}°. Ähnlich?", f"<i>b</i>′ : <i>b</i> = <i>c</i>′ : <i>c</i> = {dec(k)}, Winkel {'gleich' if same else 'verschieden'}: <b>{'ja (SWS)' if same else 'nein'}</b>")
        else:
            add(2, f"Ähnliche Dreiecke mit <i>k</i> = {dec(k)}. Umfang des Originals: {cm(sum(s_))}. Umfang des Bildes?", f"Umfang · <i>k</i>: {dec(k)} · {sum(s_)} = <b>{cm(sum(s_) * k)}</b>")
    for i in range(900):
        t = i % 4
        if t == 0:
            h, sh, S = r.choice([Fr(3, 2), Fr(8, 5), Fr(9, 5), Fr(2)]), r.choice([Fr(1), Fr(6, 5), Fr(3, 2), Fr(2), Fr(5, 2)]), r.choice([6, 8, 9, 10, 12, 15, 20])
            H = h * S / sh
            if (H * 100).denominator != 1:
                continue
            add(3, f"Ein {dec(h)} m großer Mensch wirft {dec(sh)} m Schatten, ein Turm gleichzeitig {S} m. Wie hoch ist der Turm? Warum sind die Dreiecke ähnlich?", f"Sonnenstrahlen parallel, rechter Winkel ⇒ gleiche Winkel (WW). {dec(h)} : {dec(sh)} = <i>H</i> : {S} ⇒ <i>H</i> = {dec(h)} · {S} : {dec(sh)} = <b>{dec(H)} m</b>. Der Turm ist {rd(Fr(S) / sh)}-mal so hoch wie der Mensch, weil sein Schatten {rd(Fr(S) / sh)}-mal so lang ist.")
        elif t == 1:
            arm, w = r.choice([60, 65, 70]), r.choice([20, 25, 30, 40, 50, 80])
            th = Fr(arm, 10)
            dist = Fr(arm, th) * w
            if (dist * 10).denominator != 1:
                continue
            add(3, f"Daumensprung: Armlänge {arm} cm, Augenabstand {dec(th)} cm. Der Daumen springt am Ziel um {w} m. Wie weit ist das Ziel entfernt?", f"Ähnliche Dreiecke: <i>e</i> : {w} m = {arm} : {dec(th)} ⇒ <i>e</i> = {w} · {arm} : {dec(th)} ≈ <b>{dec(dist)} m</b>. Faustregel: Armlänge ≈ 10 · Augenabstand, also Entfernung ≈ 10 · Sprung.")
        elif t == 2:
            a, b = r.randint(2, 6), r.randint(3, 8)
            k = r.choice([Fr(3, 2), Fr(2), Fr(5, 2), Fr(3)])
            add(3, f"Ein rechtwinkliges Dreieck hat die Katheten {cm(a)} und {cm(b)}. Ein ähnliches Dreieck hat die kürzere Kathete {cm(min(a, b) * k)}. Berechne die andere Kathete und das Verhältnis der Flächen.", f"<i>k</i> = {dec(k)}, Kathete <b>{cm(max(a, b) * k)}</b>; Flächen: {dec(Fr(a * b, 2))} cm² → {dec(Fr(a * b, 2) * k * k)} cm², <b>Verhältnis {dec(k * k)} = <i>k</i>²</b>. Begründung: Beide Katheten werden mit {dec(k)} multipliziert, die Fläche also mit {dec(k)} · {dec(k)}.")
        else:
            d1, h1, d2 = r.choice([2, 3, 4]), r.choice([Fr(3, 2), Fr(8, 5), Fr(9, 5)]), r.choice([10, 12, 15, 18, 20])
            H = h1 * Fr(d2 + d1, d1)
            if (H * 100).denominator != 1:
                continue
            add(3, f"Spiegelmethode: Ein Spiegel liegt {d2} m vor einem Baum. Lea steht {d1} m vom Spiegel entfernt, ihre Augen sind {dec(h1)} m hoch, und sie sieht die Baumspitze im Spiegel. Wie hoch ist der Baum?", f"Einfallswinkel = Ausfallswinkel ⇒ ähnliche Dreiecke (WW): <i>H</i> : {d2} = {dec(h1)} : {d1} ⇒ <i>H</i> = {dec(h1)} · {d2} : {d1} = <b>{dec(h1 * d2 / d1)} m</b>. Beide Dreiecke haben einen rechten Winkel und gleiche Winkel am Spiegel.")
    return L


def flaeche_volumen_aehnlich():
    r = random.Random(106)
    L = {1: [], 2: [], 3: []}
    seen = set()
    def dec(v):
        v = Fr(v)
        t = f"{float(v):,.6g}" if abs(v) < 1e6 else f"{float(v):,.0f}"
        return t.replace(",", " ").replace(".", ",").replace(" ", ".").replace("-", MINUS)
    def eq(v):
        # "= exact" or "≈ rounded"
        v = Fr(v)
        return "= " + dec(v) if (v * 1000).denominator == 1 else "≈ " + f"{float(v):.2f}".replace(".", ",")

    def add(lvl, q, a):
        if q not in seen and len(L[lvl]) < 120:
            seen.add(q)
            L[lvl].append((q, a))
    ks = [Fr(2), Fr(3), Fr(4), Fr(5), Fr(1, 2), Fr(3, 2), Fr(10), Fr(1, 4), Fr(5, 2)]
    for i in range(900):
        t = i % 5
        k = r.choice(ks)
        if t == 0:
            add(1, f"<i>k</i> = {dec(k)}: Mit welchem Faktor ändern sich Längen, Flächen, Volumen?", f"Längen · {dec(k)}, Flächen · <b>{dec(k * k)}</b>, Volumen · <b>{dec(k ** 3)}</b>")
        elif t == 1:
            A = r.choice([2, 3, 4, 5, 6, 8, 10, 12, 15])
            add(1, f"Fläche {A} cm², gestreckt mit <i>k</i> = {dec(k)}. Neue Fläche?", f"{A} · {dec(k)}² = {A} · {dec(k * k)} = <b>{dec(A * k * k)} cm²</b>")
        elif t == 2:
            V = r.choice([1, 2, 3, 4, 5, 6, 8, 10])
            add(1, f"Volumen {V} cm³, gestreckt mit <i>k</i> = {dec(k)}. Neues Volumen?", f"{V} · {dec(k)}³ = {V} · {dec(k ** 3)} = <b>{dec(V * k ** 3)} cm³</b>")
        elif t == 3:
            kk = r.choice([2, 3, 4, 5, 6, 7, 8, 9, 10])
            add(1, f"Die Fläche ist {kk * kk}-mal so groß. Wie groß ist <i>k</i>?", f"<i>k</i> = √{kk * kk} = <b>{kk}</b>")
        else:
            kk = r.choice([2, 3, 4, 5, 10])
            add(1, f"Das Volumen ist {kk ** 3}-mal so groß. Wie groß ist <i>k</i>?", f"<i>k</i> = ∛{kk ** 3} = <b>{kk}</b>")
    for i in range(900):
        t = i % 5
        if t == 0:
            a, k = r.randint(2, 6), r.choice([2, 3, Fr(1, 2), Fr(3, 2)])
            add(2, f"Würfel mit Kante {a} cm, Streckung mit <i>k</i> = {dec(k)}. Oberfläche und Volumen vorher und nachher?", f"<i>O</i>: {6 * a * a} cm² → <b>{dec(6 * a * a * k * k)} cm²</b>, <i>V</i>: {a ** 3} cm³ → <b>{dec(a ** 3 * k ** 3)} cm³</b>")
        elif t == 1:
            sc, A = r.choice([100, 200, 500, 1000]), r.choice([2, 4, 5, 6, 8, 12, 20])
            real = A * sc * sc
            add(2, f"Plan im Maßstab 1 : {sc}: Ein Raum ist auf dem Plan {A} cm² groß. Wie groß in Wirklichkeit (in m²)?", f"Fläche · {sc}² = {A} · {dec(sc * sc)} cm² = {dec(real)} cm² = <b>{dec(Fr(real, 10000))} m²</b>")
        elif t == 2:
            A1, k = r.choice([3, 5, 8, 12, 20]), r.choice([2, 3, 4, 5])
            add(2, f"Zwei ähnliche Figuren haben {A1} cm² und {A1 * k * k} cm². Wie verhalten sich entsprechende Seiten?", f"Flächenfaktor {k * k} ⇒ <b><i>k</i> = √{k * k} = {k}</b>: Seiten {k}-mal so lang")
        elif t == 3:
            V1, k = r.choice([2, 5, 10, 25, 40]), r.choice([2, 3, 4, 5])
            add(2, f"Zwei ähnliche Körper haben {V1} cm³ und {V1 * k ** 3} cm³. Kantenlänge des kleinen: 3 cm. Kantenlänge des großen?", f"Volumenfaktor {k ** 3} ⇒ <i>k</i> = ∛{k ** 3} = {k}: <b>{3 * k} cm</b>")
        else:
            d1, d2 = r.choice([(24, 32), (26, 32), (20, 30), (28, 36), (30, 40), (22, 33)])
            k = Fr(d2, d1)
            add(2, f"Pizza mit {d1} cm und mit {d2} cm Durchmesser. Wievielmal so viel Pizza hat die große?", f"<i>k</i> = {d2} : {d1} {eq(k)}, Fläche · <i>k</i>² <b>{eq(k * k)}</b>")
    for i in range(900):
        t = i % 5
        if t == 0:
            d1, d2, p1 = r.choice([(24, 32), (26, 36), (28, 40), (30, 40), (20, 30)]) + (r.choice([6, 7, 8, 9]),)
            p2 = p1 + r.choice([3, 4, 5, 6])
            k2 = Fr(d2 * d2, d1 * d1)
            ratio = Fr(p2, p1)
            better = "die große" if k2 > ratio else "die kleine"
            add(3, f"Pizza A: {d1} cm für {p1} €, Pizza B: {d2} cm für {p2} €. Welche ist im Verhältnis günstiger?", f"Fläche · ({d2} : {d1})² {eq(k2)}, Preis · ({p2} : {p1}) {eq(ratio)}: <b>{better} Pizza</b> ist günstiger pro cm²")
        elif t == 1:
            sc, m = r.choice([(10, 1500), (20, 1600), (18, 1458), (24, 1728), (12, 1728)])
            add(3, f"Ein Modellauto im Maßstab 1 : {sc} aus demselben Material wie das Original. Das Original wiegt {m} kg. Was würde das Modell wiegen? Wie viel Lack (Fläche) braucht es im Vergleich?", f"Masse wächst wie das Volumen: {m} kg : {sc}³ = {m} kg : {dec(sc ** 3)} <b>{eq(Fr(m * 1000, sc ** 3))} g</b>; Lack: <b>1/{dec(sc * sc)}</b>")
        elif t == 2:
            k = r.choice([2, 3, 4])
            add(3, f"Ein Würfel wird mit <i>k</i> = {k} gestreckt. Wie ändert sich das Verhältnis Oberfläche : Volumen? Was bedeutet das für große Tiere?", f"Oberfläche · <i>k</i>² = {k * k}, Volumen · <i>k</i>³ = {k ** 3}: Das Verhältnis <i>O</i> : <i>V</i> wird mit {k * k}/{k ** 3} = 1/{k} multipliziert. <b>Große Tiere haben relativ weniger Oberfläche</b> und verlieren langsamer Wärme.")
        elif t == 3:
            h1, h2, V1 = r.choice([(10, 20), (8, 12), (6, 18), (10, 15), (12, 24)]) + (r.choice([200, 250, 330, 500]),)
            k = Fr(h2, h1)
            add(3, f"Zwei ähnliche Gläser sind {h1} cm und {h2} cm hoch. Ins kleine passen {V1} ml. Wie viel passt ins große?", f"<i>k</i> = {h2} : {h1} {eq(k)}, Volumen · <i>k</i>³ {eq(k ** 3)}: {V1} ml · {dec(k ** 3)} <b>{eq(V1 * k ** 3)} ml</b>")
        else:
            A1, A2 = r.choice([(4, 9), (9, 16), (4, 25), (16, 25), (1, 4)])
            k = Fr(int(A2 ** 0.5), int(A1 ** 0.5))
            add(3, f"Die Grundflächen zweier ähnlicher Pyramiden verhalten sich wie {A1} : {A2}. Wie verhalten sich Höhen und Volumen?", f"Grundflächen sind Flächen, ihr Verhältnis ist <i>k</i>². <i>k</i> = √({A2}/{A1}) {eq(k)}: Höhen <b>{int(A1 ** 0.5)} : {int(A2 ** 0.5)}</b>, Volumen <b>{int(A1 ** 0.5) ** 3} : {int(A2 ** 0.5) ** 3}</b>")
    return L


def strahlensaetze():
    r = random.Random(107)
    L = {1: [], 2: [], 3: []}
    seen = set()
    def dec(v):
        return f"{float(Fr(v)):g}".replace(".", ",").replace("-", MINUS)
    def eq(v):
        v = Fr(v)
        return "= " + dec(v) if (v * 100).denominator == 1 else "≈ " + f"{float(v):.2f}".replace(".", ",")
    Z = lambda t: "|<i>" + t + "</i>|"

    def add(lvl, q, a):
        if q not in seen and len(L[lvl]) < 120:
            seen.add(q)
            L[lvl].append((q, a))
    ks = [Fr(3, 2), Fr(2), Fr(5, 2), Fr(3), Fr(4)]
    for i in range(900):
        t = i % 4
        za, zb, k = r.randint(2, 8), r.randint(2, 9), r.choice(ks)
        if t == 0:
            add(1, f"V-Figur: {Z('ZA')} = {za} cm, {Z('ZA′')} = {dec(za * k)} cm, {Z('ZB')} = {zb} cm. Berechne {Z('ZB′')}.", f"1. Strahlensatz: {Z('ZB′')} : {Z('ZB')} = {Z('ZA′')} : {Z('ZA')} ⇒ {Z('ZB′')} = {zb} · {dec(za * k)} : {za} = <b>{dec(zb * k)} cm</b>")
        elif t == 1:
            ab = r.randint(2, 7)
            add(1, f"V-Figur: {Z('ZA')} = {za} cm, {Z('ZA′')} = {dec(za * k)} cm, {Z('AB')} = {ab} cm. Berechne {Z('A′B′')}.", f"2. Strahlensatz: {Z('A′B′')} : {Z('AB')} = {Z('ZA′')} : {Z('ZA')} ⇒ {Z('A′B′')} = {ab} · {dec(za * k)} : {za} = <b>{dec(ab * k)} cm</b>")
        elif t == 2:
            add(1, f"V-Figur: {Z('ZB')} = {zb} cm, {Z('ZB′')} = {dec(zb * k)} cm, {Z('ZA′')} = {dec(za * k)} cm. Berechne {Z('ZA')}.", f"1. Strahlensatz: {Z('ZA')} : {Z('ZA′')} = {Z('ZB')} : {Z('ZB′')} ⇒ {Z('ZA')} = {dec(za * k)} · {zb} : {dec(zb * k)} = <b>{za} cm</b>")
        else:
            wrong = r.random() < 0.5
            if wrong:
                add(1, f"Richtig oder falsch? {Z('AB')} : {Z('A′B′')} = {Z('ZA')} : {Z('AA′')}", "<b>falsch</b>: Beim 2. Strahlensatz immer vom Zentrum aus messen: " + Z('ZA') + " : " + Z('ZA′'))
            else:
                add(1, f"Richtig oder falsch? {Z('ZA')} : {Z('AA′')} = {Z('ZB')} : {Z('BB′')} (V-Figur)", "<b>richtig</b>: Beim 1. Strahlensatz dürfen auch die Teilstücke auf den Strahlen verglichen werden.")
    for i in range(900):
        t = i % 4
        za, k = r.randint(2, 8), r.choice(ks)
        if t == 0:
            aa, ab = dec(za * k - za), r.randint(2, 7)
            add(2, f"V-Figur: {Z('ZA')} = {za} cm, {Z('AA′')} = {aa} cm, {Z('AB')} = {ab} cm. Berechne {Z('A′B′')}.", f"{Z('ZA′')} = {za} + {aa} = {dec(za * k)} cm. 2. Strahlensatz: {Z('A′B′')} : {Z('AB')} = {Z('ZA′')} : {Z('ZA')} ⇒ {Z('A′B′')} = {ab} · {dec(za * k)} : {za} = <b>{dec(ab * k)} cm</b>")
        elif t == 1:
            za2, ab = r.randint(3, 9), r.randint(2, 6)
            add(2, f"X-Figur: {Z('ZA')} = {za} cm, {Z('ZA′')} = {za2} cm, {Z('AB')} = {ab} cm. Berechne {Z('A′B′')}.", f"2. Strahlensatz (X-Figur): {Z('A′B′')} : {Z('AB')} = {Z('ZA′')} : {Z('ZA')} ⇒ {Z('A′B′')} = {ab} · {za2} : {za} <b>{eq(Fr(ab * za2, za))} cm</b>")
        elif t == 2:
            zb, ab = r.randint(2, 7), r.randint(2, 6)
            add(2, f"V-Figur: {Z('ZA')} = {za} cm, {Z('ZA′')} = {dec(za * k)} cm, {Z('ZB')} = {zb} cm, {Z('AB')} = {ab} cm. Berechne {Z('ZB′')} und {Z('A′B′')}.", f"Faktor <i>k</i> = {dec(za * k)} : {za} = {dec(k)}. 1. Strahlensatz: {Z('ZB′')} = {dec(k)} · {zb}; 2. Strahlensatz: {Z('A′B′')} = {dec(k)} · {ab}. <b>{Z('ZB′')} = {dec(zb * k)} cm</b>, <b>{Z('A′B′')} = {dec(ab * k)} cm</b>")
        else:
            zb, bb = r.randint(2, 7), None
            bb = zb * k - zb
            add(2, f"V-Figur: {Z('ZB')} = {zb} cm, {Z('BB′')} = {dec(bb)} cm, {Z('ZA')} = {za} cm. Berechne {Z('AA′')}.", f"{Z('ZA')} : {Z('AA′')} = {Z('ZB')} : {Z('BB′')} ⇒ {Z('AA′')} = {za} · {dec(bb)} : {zb} = <b>{dec(za * bb / zb)} cm</b>")
    for i in range(900):
        t = i % 5
        if t == 0:
            a, b, c = r.choice([4, 5, 6, 8, 10]), r.choice([12, 15, 18, 20, 24, 30]), r.choice([3, 4, 5, 6])
            if b <= a:
                continue
            x = Fr(c * b, a) - c
            add(3, f"Flussbreite: Von einem Punkt <i>Z</i> peilt man über zwei Pflöcke. {Z('ZA')} = {a} m, {Z('AB')} = {c} m und {Z('ZA′')} = {b} m (bis zum anderen Ufer gemessen auf der Uferlinie). Wie lang ist {Z('A′B′')}? Wie viel davon ist breiter als {Z('AB')}?", f"2. Strahlensatz: {Z('A′B′')} = {c} · {b} : {a} <b>{eq(Fr(c * b, a))} m</b>, also {eq(x)} m länger als {Z('AB')}. Die Pflocklinien <i>AB</i> und <i>A</i>′<i>B</i>′ müssen parallel sein.")
        elif t == 1:
            G, g, b = r.choice([2, 3, 4, 5, 10]), r.choice([5, 8, 10, 20, 25]), r.choice([4, 5, 6, 8, 10])
            B = Fr(G * 100 * b, g * 100)
            add(3, f"Lochkamera: Ein {G} m hoher Gegenstand steht {g} m vor dem Loch, der Schirm ist {b} cm hinter dem Loch. Wie hoch ist das Bild? Warum steht es auf dem Kopf?", f"X-Figur, Loch = <i>Z</i>: Bild = {G * 100} cm · {b} : {g * 100} <b>{eq(B)} cm</b>. Die Strahlen kreuzen sich im Loch: Was oben ist, landet unten. Das Bild ist um den Faktor {b} : {g * 100} verkleinert.")
        elif t == 2:
            n = r.choice([3, 4, 5, 6, 7])
            ln = r.choice([7, 8, 9, 10, 11, 13])
            add(3, f"Teile eine {ln} cm lange Strecke ohne Messen in {n} gleiche Teile. Beschreibe die Konstruktion und gib die Länge eines Teils an.", f"Hilfsstrahl von <i>A</i>, {n} gleiche Abschnitte abtragen, letzten Punkt mit <i>B</i> verbinden, Parallelen durch die anderen Punkte: Strahlensatz. Teil <b>{eq(Fr(ln, n))} cm</b>")
        elif t == 3:
            za, aa, zb, bb = r.randint(2, 6), r.randint(2, 6), r.randint(2, 6), None
            par = r.random() < 0.5
            bb = Fr(zb * aa, za) if par else Fr(zb * aa, za) + r.choice([1, -1, Fr(1, 2)])
            if bb <= 0:
                continue
            add(3, f"Prüfe, ob <i>AB</i> und <i>A</i>′<i>B</i>′ parallel sind: {Z('ZA')} = {za} cm, {Z('AA′')} = {aa} cm, {Z('ZB')} = {zb} cm, {Z('BB′')} = {dec(bb)} cm.", f"{za} : {aa} {eq(Fr(za, aa))}, {zb} : {dec(bb)} {eq(Fr(zb) / bb)}: <b>{'parallel' if par else 'nicht parallel'}</b> (Umkehrung des 1. Strahlensatzes: Nur bei gleichen Verhältnissen sind die Geraden parallel.)")
        else:
            arm, s_, bl = r.choice([60, 65, 70]), r.choice([2, 3, 4, 5]), r.choice([20, 25, 30, 40])
            add(3, f"Ein Stab der Länge {s_} cm, mit gestrecktem Arm ({arm} cm vom Auge) gehalten, verdeckt genau einen {bl} m hohen Turm. Wie weit ist der Turm entfernt?", f"Das Auge ist <i>Z</i>, Stab und Turm sind parallel (V-Figur). 2. Strahlensatz: <i>e</i> : {arm} cm = {bl} m : {s_} cm ⇒ <i>e</i> = {arm} · {bl} : {s_} <b>{eq(Fr(arm * bl, s_))} m</b>")
    return L


# ================================================================ grade 11 chemistry
def _chem():
    """Element data shared with the apps: parsed from src/shared/chemdata.js."""
    import json
    import os
    src = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "shared", "chemdata.js"), encoding="utf-8").read()
    raw = json.loads("[" + src.split("const raw = [", 1)[1].split("];", 1)[0] + "]")
    keys = ["z", "sym", "name", "group", "period", "A", "mass", "en", "r", "ie", "cls"]
    els = [dict(zip(keys, row)) for row in raw]

    def shells(z):
        if z <= 2: return [z]
        if z <= 10: return [2, z - 2]
        if z <= 18: return [2, 8, z - 10]
        if z <= 20: return [2, 8, 8, z - 18]
        if z <= 36: return [2, 8, 18, z - 28]
        if z <= 38: return [2, 8, 18, 8, z - 36]
        return [2, 8, 18, 18, z - 46]
    for e in els:
        e["shells"] = shells(e["z"])
    return els, shells


CHEM_ELS, CHEM_SHELLS = _chem()
CH = {e["sym"]: e for e in CHEM_ELS}
_SUP = str.maketrans("0123456789+-", "⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻")
_SUB = str.maketrans("0123456789", "₀₁₂₃₄₅₆₇₈₉")


def chg(q):
    """Ion charge as superscript: 2 -> ²⁺, -1 -> ⁻."""
    return "" if q == 0 else (("" if abs(q) == 1 else str(abs(q))) + ("+" if q > 0 else "-")).translate(_SUP)


def ion_q(e):
    if e["cls"] == "e" or e["group"] == 4:
        return None
    return e["group"] if e["group"] <= 3 else e["group"] - 8


def nuc(e, A, q=0):
    return f'<sup>{A}</sup><sub>{e["z"]}</sub>{e["sym"]}{chg(q)}'


def atombau():
    r = random.Random(201)
    L = {1: [], 2: [], 3: []}
    seen = set()
    f20 = [e for e in CHEM_ELS if e["z"] <= 20]
    ions = [e for e in f20 if ion_q(e) is not None and e["z"] > 2]
    noble = {2: "Helium", 10: "Neon", 18: "Argon", 36: "Krypton"}

    def add(lvl, q, a):
        if q not in seen and len(L[lvl]) < 120:
            seen.add(q)
            L[lvl].append((q, a))
    for i in range(1500):
        t = i % 5
        e = r.choice(f20)
        if t == 0:
            A = e["A"] + r.choice([0, 0, 1, 2])
            add(1, f"Wie viele Protonen, Neutronen und Elektronen hat {nuc(e, A)}?", f"<b>{e['z']} p⁺, {A - e['z']} n, {e['z']} e⁻</b>")
        elif t == 1:
            add(1, f"Schalenbesetzung von {e['name']} (Z = {e['z']})?", f"<b>{', '.join(map(str, e['shells']))}</b>")
        elif t == 2:
            if e["z"] == 2:
                continue
            add(1, f"Valenzelektronen von {e['name']}?", f"{e['group']}. Hauptgruppe: <b>{e['group']}</b>")
        elif t == 3:
            e = r.choice(ions)
            q = ion_q(e)
            add(1, f"Ist {e['sym']}{chg(q)} ein Kation oder ein Anion?", f"<b>{'Kation' if q > 0 else 'Anion'}</b> ({'positiv' if q > 0 else 'negativ'})")
        else:
            A = e["A"]
            add(1, f"Massenzahl eines {e['name']}-Atoms mit {A - e['z']} Neutronen?", f"{e['z']} + {A - e['z']} = <b>{A}</b>")
    for i in range(1500):
        t = i % 5
        if t == 0:
            e = r.choice(ions)
            q = ion_q(e)
            ne = e["z"] - q
            add(2, f"Elektronenzahl und Schalenbesetzung von {e['sym']}{chg(q)}?", f"{e['z']} {'−' if q > 0 else '+'} {abs(q)} = <b>{ne} e⁻</b>: <b>{', '.join(map(str, CHEM_SHELLS(ne)))}</b> wie {noble.get(ne, '')}")
        elif t == 1:
            e = r.choice([x for x in f20 if x["z"] > 2])
            add(2, f"Welches Element hat die Schalenbesetzung {', '.join(map(str, e['shells']))}?", f"Elektronen: {' + '.join(map(str, e['shells']))} = {e['z']} = Z: <b>{e['name']} ({e['sym']})</b>, {e['period']}. Periode, {e['group']}. Hauptgruppe")
        elif t == 2:
            e = r.choice(f20)
            dn = r.choice([0, 1, 2])
            q = r.choice([0, 0, ion_q(e) or 0])
            A = e["A"] + dn
            add(2, f"Ein Teilchen hat {e['z']} Protonen, {A - e['z']} Neutronen und {e['z'] - q} Elektronen. Schreibe es in Symbolschreibweise.", f"Z = {e['z']} ⇒ {e['name']}, A = {e['z']} + {A - e['z']} = {A}, Ladung {e['z']} − {e['z'] - q} = {q}: <b>{nuc(e, A, q)}</b>")
        elif t == 3:
            a, b = r.sample(f20, 2)
            same = r.random() < 0.5
            if same:
                b = a
            Aa, Ab = a["A"], b["A"] + (r.choice([1, 2]) if same else 0)
            if not same and Aa == Ab:
                ans = "keine Isotope: gleiche Massenzahl, aber verschiedene Elemente"
            else:
                ans = "Isotope: gleiche Protonenzahl, verschiedene Neutronenzahl" if same else "keine Isotope: verschiedene Protonenzahlen"
            add(2, f"Sind {nuc(a, Aa)} und {nuc(b, Ab)} Isotope? Begründe.", f"<b>{ans}</b>")
        else:
            e = r.choice(ions)
            q = ion_q(e)
            eq = f"{e['sym']} → {e['sym']}{chg(q)} + {'' if q == 1 else q} e⁻" if q > 0 else f"{e['sym']} + {'' if q == -1 else -q} e⁻ → {e['sym']}{chg(q)}"
            add(2, f"Stelle die Gleichung für die Bildung des Ions von {e['name']} auf.", f"<b>{eq}</b>: {e['name']} {'gibt' if q > 0 else 'nimmt'} {abs(q)} Elektron{'en' if abs(q) > 1 else ''} {'ab' if q > 0 else 'auf'} und erreicht Edelgaskonfiguration ({', '.join(map(str, CHEM_SHELLS(e['z'] - q)))}).")
    iso = [("Chlor", "Cl", [(35, 75.78), (37, 24.22)]), ("Bor", "B", [(10, 19.9), (11, 80.1)]), ("Lithium", "Li", [(6, 7.59), (7, 92.41)]), ("Kupfer", "Cu", [(63, 69.15), (65, 30.85)]),
           ("Brom", "Br", [(79, 50.69), (81, 49.31)]), ("Gallium", "Ga", [(69, 60.11), (71, 39.89)]), ("Magnesium", "Mg", [(24, 78.99), (25, 10.00), (26, 11.01)]), ("Silber", "Ag", [(107, 51.84), (109, 48.16)])]
    de = lambda v: f"{v:g}".replace(".", ",")
    for name, sym, parts in iso:
        M = sum(A * p for A, p in parts) / 100
        add(3, f"{name} besteht aus {' und '.join(f'{de(p)} % <sup>{A}</sup>{sym}' for A, p in parts)}. Berechne die mittlere Atommasse (Isotopenmasse ≈ Massenzahl in u).",
            f"Anteile als Dezimalzahl gewichten: {' + '.join(f'{A} · ' + f'{p / 100:.4f}'.replace('.', ',') for A, p in parts)} ≈ <b>{M:.2f} u</b>. Der Wert liegt nahe am häufigsten Isotop <sup>{max(parts, key=lambda t: t[1])[0]}</sup>{sym}.".replace(".", ",").replace(", Der", ". Der"))
    for i in range(6):
        A1 = r.choice([10, 20, 30, 35, 50, 63, 79])
        A2 = A1 + 2
        x = r.choice([20, 25, 40, 60, 75, 80])
        M = (A1 * x + A2 * (100 - x)) / 100
        add(3, f"Ein Element hat zwei Isotope mit den Massenzahlen {A1} und {A2}. Die mittlere Atommasse beträgt {de(M)} u. Berechne die Anteile.",
            f"<i>x</i> = Anteil von <sup>{A1}</sup>X. {A1}·<i>x</i> + {A2}·(1 − <i>x</i>) = {de(M)} ⇒ {A2} − 2<i>x</i> = {de(M)} ⇒ <i>x</i> = {de(x / 100)}: <b>{x} % <sup>{A1}</sup>X, {100 - x} % <sup>{A2}</sup>X</b>")

    # identify an ion from electron and neutron numbers
    for e in r.sample(ions, 8):
        q = ion_q(e)
        add(3, f"Ein Ion mit der Ladung {chg(q) or '0'} hat {e['z'] - q} Elektronen und {e['A'] - e['z']} Neutronen. Um welches Teilchen handelt es sich?", f"Protonen = {e['z'] - q} {'+' if q > 0 else '−'} {abs(q)} = {e['z']} ⇒ {e['name']}; A = {e['z']} + {e['A'] - e['z']} = {e['A']}: <b>{nuc(e, e['A'], q)}</b>")
    # mass of single atoms
    for sym in ["C", "O", "Fe" if "Fe" in CH else "Na", "Ca", "Al"]:
        e = CH[sym]
        mk = e["A"] * 1.66054e-27
        n1g = 1e-3 / mk
        add(3, f"Berechne die Masse eines <sup>{e['A']}</sup>{sym}-Atoms in kg (1 u ≈ 1,66 · 10⁻²⁷ kg) und wie viele Atome 1 g {e['name']} enthält.",
            f"<i>m</i> ≈ {e['A']} · 1,66 · 10⁻²⁷ kg ≈ <b>{mk / 10 ** -26:.2f} · 10⁻²⁶ kg</b>".replace(".", ",") + f"; 1 g : <i>m</i> ≈ <b>{n1g / 1e22:.1f} · 10²² Atome</b>".replace(".", ","))
    fixed = [
        ("Warum reagieren Edelgase kaum? Erkläre mit dem Schalenmodell.", "Ihre Valenzschale ist voll besetzt (8, bei He 2 Elektronen): <b>Edelgaskonfiguration</b> ist energetisch besonders günstig, Abgabe oder Aufnahme von Elektronen lohnt sich nicht."),
        ("Erkläre mit dem Bohr-Modell, warum Natriumsalze eine Flamme gelb färben.", "Die Wärme hebt Elektronen auf eine höhere Schale (<b>angeregter Zustand</b>). Beim Zurückfallen wird die Energiedifferenz als Licht einer bestimmten Farbe frei (Na: gelb, ≈ 589 nm)."),
        ("Nenne zwei Grenzen des Bohr-Modells.", "<b>Elektronen bewegen sich nicht auf festen Kreisbahnen</b> (nur Aufenthaltswahrscheinlichkeiten, Orbitalmodell); Spektren von Atomen mit mehreren Elektronen und Bindungswinkel lassen sich nicht erklären."),
        ("Beschreibe Rutherfords Streuversuch und seine Folgerung.", "α-Teilchen auf Goldfolie: <b>fast alle gehen durch</b>, wenige werden stark abgelenkt ⇒ Atom ist fast leer, Masse und positive Ladung sitzen in einem <b>winzigen Kern</b>."),
        ("Warum bilden Natrium und Chlor die Ionen Na⁺ und Cl⁻ und nicht Na⁷⁻ und Cl⁷⁺?", "Na gibt <b>1</b> Valenzelektron ab (2,8 wie Ne), Cl nimmt <b>1</b> Elektron auf (2,8,8 wie Ar). Beides erreicht Edelgaskonfiguration mit dem <b>geringsten Aufwand</b>."),
        ("Das Isotop ¹⁴C entsteht in der Atmosphäre aus ¹⁴N. Vergleiche die Teilchenzahlen beider Kerne.", "¹⁴N: 7 p⁺, 7 n; ¹⁴C: 6 p⁺, 8 n. <b>Gleiche Massenzahl</b>, aber ein Proton wurde zu einem Neutron: anderes Element."),
        ("Warum ist ein Atom nach außen elektrisch neutral, obwohl es geladene Teilchen enthält?", "Im Atom gilt <b>Protonenzahl = Elektronenzahl</b>; die Ladungen +1 und −1 heben sich auf."),
        ("Erkläre, warum K⁺ und Cl⁻ gleich viele Elektronen haben, aber verschieden groß sind.", "Beide haben 18 e⁻ (2,8,8). K⁺ hat aber <b>19 Protonen</b>, Cl⁻ nur 17: Die höhere Kernladung zieht die Hülle stärker an, <b>K⁺ ist kleiner</b>."),
        ("Ordne die isoelektronischen Teilchen O²⁻, F⁻, Na⁺, Mg²⁺ nach ihrer Größe. Begründe.", "Alle haben 10 e⁻ (2, 8). Mit steigender Protonenzahl (8, 9, 11, 12) wird die Hülle stärker angezogen: <b>O²⁻ > F⁻ > Na⁺ > Mg²⁺</b>."),
        ("Warum steigt der Atomradius innerhalb einer Hauptgruppe von oben nach unten?", "Mit jeder Periode kommt <b>eine Schale hinzu</b>; die Valenzelektronen sind weiter vom Kern entfernt, die inneren Schalen schirmen die Kernladung ab."),
        ("Welcher Anteil der Masse eines ¹²C-Atoms entfällt auf die Elektronen? (Elektron ≈ 1/1836 u)", "6 · 1/1836 u ≈ 0,0033 u; 0,0033 : 12 ≈ <b>0,03 %</b>. Fast die ganze Masse steckt im <b>Kern</b>."),
        ("Ein Elektron springt einmal von der M- auf die L-Schale und einmal von der M- auf die K-Schale. Wann wird mehr Energie frei?", "Beim Sprung auf die <b>K-Schale</b>: Der Energieunterschied ist größer, das Licht energiereicher (kürzere Wellenlänge, z. B. UV statt sichtbar)."),
        ("Warum steht Wasserstoff in der 1. Hauptgruppe, gehört aber nicht zu den Alkalimetallen?", "H hat <b>1 Valenzelektron</b> wie die Alkalimetalle, ist aber ein <b>Nichtmetall</b> (Gas, H₂-Moleküle) und kann auch ein Elektron aufnehmen (H⁻) oder Elektronenpaarbindungen bilden."),
        ("Zeichne die Lewis-Schreibweise von N, O und Cl und gib die Zahl der Elektronenpaare und ungepaarten Elektronen an.", "N: 1 Paar, <b>3 ungepaarte</b>; O: 2 Paare, <b>2 ungepaarte</b>; Cl: 3 Paare, <b>1 ungepaartes</b> Elektron. Ungepaarte Elektronen können Bindungen eingehen."),
        ("Die 1. Ionisierungsenergie von Natrium beträgt 496 kJ/mol, die 2. aber 4562 kJ/mol. Erkläre den Sprung.", "Das 1. Elektron kommt aus der fast leeren <b>M-Schale</b>. Danach hat Na⁺ Edelgaskonfiguration; das 2. Elektron muss aus der voll besetzten, kernnahen <b>L-Schale</b> entfernt werden."),
        ("Warum haben die Isotope ³⁵Cl und ³⁷Cl die gleichen chemischen Eigenschaften?", "Chemische Eigenschaften hängen von der <b>Elektronenhülle</b> ab. Beide haben 17 Protonen und 17 Elektronen (2, 8, 7); sie unterscheiden sich nur in der Neutronenzahl, also in der Masse."),
    ]
    for q_, a_ in fixed:
        add(3, q_, a_)
    r.shuffle(L[3])
    return L


def periodensystem():
    r = random.Random(202)
    L = {1: [], 2: [], 3: []}
    seen = set()
    RO = ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII"]
    GN = {1: "Alkalimetalle", 2: "Erdalkalimetalle", 3: "Borgruppe (Erdmetalle)", 4: "Kohlenstoffgruppe", 5: "Stickstoffgruppe", 6: "Chalkogene", 7: "Halogene", 8: "Edelgase"}
    CN = {"m": "Metall", "h": "Halbmetall", "n": "Nichtmetall", "e": "Edelgas"}
    de = lambda v: f"{v:g}".replace(".", ",")
    pool = [e for e in CHEM_ELS if e["cls"] != "e" and e["z"] != 1]

    def add(lvl, q, a):
        if q not in seen and len(L[lvl]) < 120:
            seen.add(q)
            L[lvl].append((q, a))

    def why(a, b):
        if a["period"] == b["period"]:
            return f"gleiche Periode, {(a if a['z'] > b['z'] else b)['sym']} hat mehr Protonen bei gleicher Schalenzahl"
        return f"gleiche Gruppe, {(a if a['period'] > b['period'] else b)['sym']} hat mehr Schalen"

    def pair(k, md):
        while True:
            a, b = r.sample(pool, 2)
            if (a["period"] == b["period"] or a["group"] == b["group"]) and abs(a[k] - b[k]) >= md:
                return a, b
    for i in range(1500):
        t = i % 5
        e = r.choice([x for x in CHEM_ELS if x["z"] > 2])
        if t == 0:
            add(1, f"Schalen {', '.join(map(str, e['shells']))}: Hauptgruppe und Periode?", f"{e['shells'][-1]} Valenzelektronen, {len(e['shells'])} Schalen: <b>{RO[e['group']]}. HG, {e['period']}. Periode</b> ({e['name']})")
        elif t == 1:
            add(1, f"Wie viele Schalen und Valenzelektronen hat {e['name']} ({RO[e['group']]}. HG, {e['period']}. Periode)?", f"Periode = Schalen, HG = Valenzelektronen: <b>{e['period']} Schalen, {e['group'] if e['z'] != 2 else 2} Valenzelektronen</b> ({', '.join(map(str, e['shells']))})")
        elif t == 2:
            add(1, f"Zu welcher Gruppe gehört {e['name']}? Name der Gruppe?", f"<b>{RO[e['group']]}. Hauptgruppe</b>{', ' + GN[e['group']] if e['z'] != 1 else ''}")
        elif t == 3:
            add(1, f"Ist {e['name']} ein Metall, Halbmetall, Nichtmetall oder Edelgas?", f"<b>{CN[e['cls']]}</b> ({RO[e['group']]}. HG, {e['period']}. Periode{': links bzw. unten im PSE' if e['cls'] == 'm' else ': an der Grenze' if e['cls'] == 'h' else ': rechts oben im PSE' if e['cls'] == 'n' else ': ganz rechts'})")
        else:
            add(1, f"Welches Element steht in der {RO[e['group']]}. Hauptgruppe und {e['period']}. Periode?", f"<b>{e['name']} ({e['sym']})</b>, Z = {e['z']}, Schalen {', '.join(map(str, e['shells']))}")
    for i in range(1500):
        t = i % 5
        if t == 0:
            a, b = pair("r", 8)
            big = a if a["r"] > b["r"] else b
            add(2, f"Welches Atom ist größer: {a['sym']} oder {b['sym']}? Begründe.", f"<b>{big['sym']}</b> ({a['r']} pm / {b['r']} pm): {why(a, b)}")
        elif t == 1:
            a, b = pair("en", 0.2)
            big = a if a["en"] > b["en"] else b
            add(2, f"Welches Element hat die höhere Elektronegativität: {a['sym']} oder {b['sym']}? Begründe.", f"<b>{big['sym']}</b> ({de(a['en'])} / {de(b['en'])}): {why(a, b)}")
        elif t == 2:
            a, b = pair("ie", 60)
            big = a if a["ie"] > b["ie"] else b
            add(2, f"Welches Atom gibt sein äußerstes Elektron leichter ab: {a['sym']} oder {b['sym']}?", f"<b>{(b if big is a else a)['sym']}</b> (geringere Ionisierungsenergie {min(a['ie'], b['ie'])} kJ/mol): {why(a, b)}")
        elif t == 3:
            e = r.choice([x for x in pool if ion_q(x) is not None and not (x['group'] == 3 and x['z'] > 20)])
            q = ion_q(e)
            add(2, f"Welches Ion bildet {e['name']} ({RO[e['group']]}. HG)? Welche Edelgaskonfiguration erreicht es?", f"<b>{e['sym']}{chg(q)}</b>, {', '.join(map(str, CHEM_SHELLS(e['z'] - q)))}")
        else:
            g = r.choice([1, 2, 6, 7])
            trio = sorted(r.sample([x for x in pool if x["group"] == g], 3), key=lambda x: x["r"])
            sh = trio[:]
            r.shuffle(sh)
            add(2, f"Ordne nach steigendem Atomradius: {', '.join(x['sym'] for x in sh)}.", f"<b>{' < '.join(x['sym'] for x in trio)}</b> (mehr Schalen nach unten)")
    # Mendeleev-style predictions from the neighbours above and below
    for sym in ["Ge", "Si", "Se", "Br", "Ga", "Sb", "Ca"]:
        e = CH[sym]
        up = next(x for x in CHEM_ELS if x["group"] == e["group"] and x["period"] == e["period"] - 1)
        dn = next((x for x in CHEM_ELS if x["group"] == e["group"] and x["period"] == e["period"] + 1), None)
        if not dn:
            continue
        est = (up["r"] + dn["r"]) / 2
        add(3, f"Schätze wie Mendelejew den Atomradius von {e['name']} aus seinen Nachbarn {up['sym']} ({up['r']} pm) und {dn['sym']} ({dn['r']} pm). Vergleiche mit dem Tabellenwert {e['r']} pm.",
            f"Mittelwert ({up['r']} + {dn['r']}) : 2 = <b>{de(est)} pm</b>; Abweichung {de(abs(est - e['r']))} pm. Die Schätzung trifft die Größenordnung, weil sich Eigenschaften in einer Gruppe <b>regelmäßig</b> ändern.")
    # successive ionisation energies reveal the group
    ies = {"Na": [496, 4562, 6910, 9543], "Mg": [738, 1451, 7733, 10543], "Al": [578, 1817, 2745, 11577], "Li": [520, 7298, 11815, None], "Be": [900, 1757, 14849, 21007], "B": [801, 2427, 3660, 25026]}
    for sym, v in ies.items():
        vals = [x for x in v if x]
        jump = max(range(1, len(vals)), key=lambda i: vals[i] / vals[i - 1])
        add(3, f"Die ersten Ionisierungsenergien eines Elements der 2. oder 3. Periode sind {', '.join(f'{x:,}'.replace(',', '.') for x in vals)} kJ/mol. In welcher Hauptgruppe steht es? Um welches Element handelt es sich, wenn es in der {CH[sym]['period']}. Periode steht?",
            f"Großer Sprung nach dem {jump}. Elektron: Danach muss eine voll besetzte, kernnähere Schale angegriffen werden ⇒ <b>{jump} Valenzelektron{'en' if jump > 1 else ''}, {RO[jump]}. Hauptgruppe</b>: <b>{CH[sym]['name']}</b>")
    fixed = [
        ("Erkläre, warum der Atomradius innerhalb einer Periode abnimmt, obwohl die Zahl der Elektronen steigt.", "Die Elektronen kommen auf <b>dieselbe Schale</b>, aber die <b>Kernladung steigt</b>. Die stärkere Anziehung zieht die Hülle zusammen; die Abstoßung zusätzlicher Elektronen derselben Schale ist schwächer."),
        ("Warum nimmt die Reaktivität der Alkalimetalle von Lithium zu Kalium zu, die der Halogene von Fluor zu Iod aber ab?", "Alkalimetalle <b>geben</b> ein Elektron ab: Nach unten ist es weiter vom Kern entfernt und leichter abzugeben. Halogene <b>nehmen</b> ein Elektron auf: Nach unten wird es schwächer angezogen."),
        ("Warum haben die Edelgase die höchsten Ionisierungsenergien ihrer Periode?", "Sie haben die <b>höchste Kernladung</b> der Periode bei gleicher Schalenzahl und eine voll besetzte Valenzschale (<b>Edelgaskonfiguration</b>): Ein Elektron zu entfernen kostet sehr viel Energie."),
        ("Ein unbekanntes Element ist ein glänzender Feststoff, leitet Strom und bildet Ionen X²⁺. Es hat 4 Schalen. Um welches Element handelt es sich?", "Ion X²⁺ ⇒ <b>II. Hauptgruppe</b>, 4 Schalen ⇒ <b>4. Periode</b>: <b>Calcium (Ca)</b>, ein Metall."),
        ("Warum ist die Elektronegativität für Edelgase meist nicht angegeben?", "EN beschreibt das Anziehen von <b>Bindungselektronen</b>. Edelgase (He, Ne, Ar) gehen praktisch <b>keine Bindungen</b> ein."),
        ("Begründe, warum Silicium ein Halbmetall ist, mit seiner Stellung im Periodensystem.", "Si steht an der <b>Grenze</b> zwischen Metallen (links unten) und Nichtmetallen (rechts oben), IV. HG: 4 Valenzelektronen, weder leicht abzugeben noch aufzunehmen. Daher <b>Halbleiter</b>."),
        ("Lithium, Natrium und Kalium werden in Wasser gegeben. Beschreibe und erkläre die Unterschiede.", "Li reagiert ruhig, Na heftig (schmilzt, zischt), K entzündet den Wasserstoff. Nach unten <b>sinkt die Ionisierungsenergie</b>, das Valenzelektron wird leichter abgegeben."),
        ("Ordne F, Cl, O, S nach steigender Elektronegativität und begründe.", "<b>S (2,58) < Cl (3,16) < O (3,44) < F (3,98)</b>: EN steigt nach rechts in der Periode und sinkt nach unten in der Gruppe."),
        ("Warum ist das Atom Na größer als das Ion Na⁺, aber das Atom Cl kleiner als das Ion Cl⁻?", "Na⁺ hat die äußere M-Schale verloren (2, 8): <b>kleiner</b>. Cl⁻ hat ein Elektron mehr bei gleicher Kernladung: Die Elektronen stoßen sich stärker ab, <b>größer</b>."),
        ("Warum stehen Elemente mit ähnlichen Eigenschaften im Periodensystem untereinander?", "Sie haben <b>gleich viele Valenzelektronen</b>. Chemische Eigenschaften hängen von den Valenzelektronen ab; die Eigenschaften wiederholen sich daher <b>periodisch</b> mit jeder neuen Schale."),
    ]
    for q_, a_ in fixed:
        add(3, q_, a_)
    r.shuffle(L[3])
    return L


def stoffklassen():
    r = random.Random(203)
    L = {1: [], 2: [], 3: []}
    seen = set()
    de = lambda v: f"{v:.2f}".replace(".", ",")
    fh = lambda f: re.sub(r"([A-Za-z)])(\d+)", r"\1<sub>\2</sub>", f)
    CAT = [("Natrium", "Na", 1), ("Kalium", "K", 1), ("Lithium", "Li", 1), ("Ammonium", "NH4", 1), ("Magnesium", "Mg", 2), ("Calcium", "Ca", 2), ("Barium", "Ba", 2), ("Zink", "Zn", 2), ("Eisen(II)", "Fe", 2), ("Kupfer(II)", "Cu", 2), ("Aluminium", "Al", 3), ("Eisen(III)", "Fe", 3)]
    AN = [("Fluorid", "F", -1), ("Chlorid", "Cl", -1), ("Bromid", "Br", -1), ("Iodid", "I", -1), ("Hydroxid", "OH", -1), ("Nitrat", "NO3", -1), ("Oxid", "O", -2), ("Sulfid", "S", -2), ("Sulfat", "SO4", -2), ("Carbonat", "CO3", -2), ("Nitrid", "N", -3), ("Phosphat", "PO4", -3)]
    poly = lambda f: bool(re.search(r"[A-Z].*[A-Z]|\d", f))
    part = lambda f, n: f if n == 1 else (f"({f}){n}" if poly(f) else f"{f}{n}")

    def salt(c, a):
        g = math.gcd(c[2], -a[2])
        nc, na = -a[2] // g, c[2] // g
        name = c[0] + ("-" if c[0].endswith(")") else "") + a[0].lower()
        return part(c[1], nc) + part(a[1], na), nc, na, name
    ion = lambda f, q: fh(f) + chg(q)

    def soluble(c, a):
        """Rough solubility rules for the ions used here (oxides, sulfides, nitrides react or are insoluble)."""
        cs, an = c[1], a[1]
        if an in ("Cl", "Br", "I", "NO3"):
            return True
        if an == "SO4":
            return cs not in ("Ba", "Ca")
        if an == "OH":
            return cs in ("Na", "K", "Li", "Ba")
        if an in ("CO3", "PO4", "F"):
            return cs in ("Na", "K", "NH4")
        return False
    SOL = [(c, a) for c in CAT for a in AN if soluble(c, a)]

    def diss(c, a):
        f, nc, na, _ = salt(c, a)
        return f"{fh(f)}(s) → {str(nc) + ' ' if nc > 1 else ''}{ion(c[1], c[2])}(aq) + {str(na) + ' ' if na > 1 else ''}{ion(a[1], a[2])}(aq)"
    KL = [("Cu", "m"), ("Fe", "m"), ("Al", "m"), ("Mg", "m"), ("Zn", "m"), ("Ag", "m"), ("Messing (Cu, Zn)", "m"), ("NaCl", "i"), ("KBr", "i"), ("MgO", "i"), ("CaCl2", "i"), ("Al2O3", "i"), ("Na2S", "i"), ("LiF", "i"), ("K2O", "i"),
          ("H2O", "mol"), ("CO2", "mol"), ("CH4", "mol"), ("NH3", "mol"), ("Cl2", "mol"), ("O2", "mol"), ("HCl", "mol"), ("C2H5OH", "mol"), ("I2", "mol"), ("SO2", "mol"), ("N2", "mol")]
    KN = {"m": "Metall (Metallbindung)", "i": "Ionensubstanz (Ionenbindung)", "mol": "Molekülsubstanz (Elektronenpaarbindung)"}
    WHY = {"m": "nur Metallatome", "i": "Metall und Nichtmetall", "mol": "nur Nichtmetallatome"}
    SUB = {"H2": ("Wasserstoff", -253, "l"), "N2": ("Stickstoff", -196, "l"), "O2": ("Sauerstoff", -183, "l"), "F2": ("Fluor", -188, "l"), "Cl2": ("Chlor", -34, "l"), "Br2": ("Brom", 59, "l"), "I2": ("Iod", 184, "l"),
           "CH4": ("Methan", -162, "l"), "C2H6": ("Ethan", -89, "l"), "C3H8": ("Propan", -42, "l"), "C4H10": ("Butan", -1, "l"), "C5H12": ("Pentan", 36, "l"), "C6H14": ("Hexan", 69, "l"), "C8H18": ("Octan", 126, "l"),
           "HF": ("Fluorwasserstoff", 20, "h"), "HCl": ("Chlorwasserstoff", -85, "d"), "HBr": ("Bromwasserstoff", -67, "d"), "HI": ("Iodwasserstoff", -35, "d"), "H2O": ("Wasser", 100, "h"), "H2S": ("Schwefelwasserstoff", -60, "d"),
           "NH3": ("Ammoniak", -33, "h"), "C2H5OH": ("Ethanol", 78, "h"), "CH3OCH3": ("Dimethylether", -24, "d"), "CH3OH": ("Methanol", 65, "h"), "SiH4": ("Silan", -112, "l"), "SnH4": ("Stannan", -52, "l"), "H2Se": ("Selenwasserstoff", -41, "d"), "H2Te": ("Tellurwasserstoff", -2, "d")}
    WWN = {"l": "nur London-Kräfte (unpolares Molekül)", "d": "London- und Dipol-Dipol-Kräfte (Dipolmolekül)", "h": "London-Kräfte, Dipol-Dipol-Kräfte und Wasserstoffbrücken (H an N, O oder F)"}
    en_els = [e for e in CHEM_ELS if e["en"] is not None]

    def add(lvl, q, a):
        if q not in seen and len(L[lvl]) < 120:
            seen.add(q)
            L[lvl].append((q, a))
    for i in range(1500):
        t = i % 5
        if t == 0:
            f, k = r.choice(KL)
            add(1, f"Zu welcher Stoffklasse gehört {fh(f)}?", f"<b>{KN[k]}</b>: {WHY[k]}")
        elif t == 1:
            c, a = r.choice(CAT[:3] + CAT[4:8] + CAT[10:11]), r.choice(AN[:4] + AN[6:8])
            f, nc, na, name = salt(c, a)
            add(1, f"Verhältnisformel von {name}?", f"{ion(c[1], c[2])} und {ion(a[1], a[2])}: <b>{fh(f)}</b>")
        elif t == 2:
            fm = r.choice(list(SUB))
            n, bp, k = SUB[fm]
            add(1, f"Welche Kräfte wirken zwischen {n}-Molekülen ({fh(fm)})?", f"<b>{WWN[k]}</b>")
        elif t == 3:
            c, a = r.choice(SOL)
            add(1, f"Gleichung für das Lösen von {fh(salt(c, a)[0])} in Wasser?", f"<b>{diss(c, a)}</b>")
        else:
            qa = r.choice([("Leitet festes Kupfer den Strom?", "<b>ja</b>: frei bewegliche Elektronen"), ("Leitet festes Kochsalz den Strom?", "<b>nein</b>: Ionen fest im Gitter"),
                           ("Leitet eine Kochsalzlösung den Strom?", "<b>ja</b>: bewegliche Ionen"), ("Leitet Zuckerlösung den Strom?", "<b>nein</b>: nur Moleküle, keine Ionen"),
                           ("Ist ein Kupferdraht verformbar oder spröde?", "<b>verformbar</b> (Metallbindung)"), ("Ist ein Salzkristall verformbar oder spröde?", "<b>spröde</b> (Ionengitter)"),
                           ("Hat Methan eine hohe oder niedrige Siedetemperatur?", "<b>niedrig</b> (−162 °C), nur schwache London-Kräfte"), ("Leitet geschmolzenes Natriumchlorid den Strom?", "<b>ja</b>: Ionen sind in der Schmelze beweglich"),
                           ("Leitet destilliertes Wasser den Strom?", "<b>praktisch nicht</b>: Moleküle, kaum Ionen"), ("Welche Teilchen bilden ein Metallgitter?", "<b>Atomrümpfe</b> (positiv) und <b>freie Elektronen</b>")])
            add(1, *qa)
    for i in range(2000):
        t = i % 5
        if t == 0:
            a, b = r.sample(en_els, 2)
            d = abs(a["en"] - b["en"])
            # metals only together with a nonmetal and a clear ionic bond
            if (a["cls"] == "m" or b["cls"] == "m") and not ({a["cls"], b["cls"]} == {"m", "n"} and d > 1.8):
                continue
            if abs(d - 0.4) < 0.08 or abs(d - 1.7) < 0.1:
                continue
            neg, pos = (a, b) if a["en"] > b["en"] else (b, a)
            kind = "unpolare Elektronenpaarbindung" if d < 0.4 else "polare Elektronenpaarbindung" if d <= 1.7 else "Ionenbindung"
            extra = "" if d < 0.4 else f", {neg['sym']} δ⁻, {pos['sym']} δ⁺" if d <= 1.7 else f": {neg['sym']} bildet das Anion"
            add(2, f"Bestimme die Bindungsart zwischen {a['sym']} (EN {de(a['en'])}) und {b['sym']} (EN {de(b['en'])}).", f"ΔEN = {de(d)}: <b>{kind}</b>{extra}")
        elif t == 1:
            c, a = r.choice(SOL)
            f, nc, na, name = salt(c, a)
            add(2, f"Formel und Lösegleichung von {name}?", f"{nc} · (+{c[2]}) + {na} · (−{-a[2]}) = 0: <b>{fh(f)}</b>; {diss(c, a)}")
        elif t == 2:
            x, y = r.choice([("H2O", "H2S"), ("C2H5OH", "CH3OCH3"), ("HF", "HCl"), ("Cl2", "Br2"), ("CH4", "C4H10"), ("HCl", "F2"), ("NH3", "CH4"), ("C5H12", "C8H18"), ("Br2", "I2"), ("CH3OH", "C2H6"), ("H2Te", "H2Se"), ("SnH4", "SiH4"), ("HI", "HBr"), ("C3H8", "C6H14")])
            hi, lo = (x, y) if SUB[x][1] > SUB[y][1] else (y, x)
            why = "Wasserstoffbrücken" if SUB[hi][2] == "h" and SUB[lo][2] != "h" else "Dipol-Dipol-Kräfte" if SUB[hi][2] == "d" and SUB[lo][2] == "l" else "stärkere London-Kräfte (größeres Molekül, mehr Elektronen)"
            add(2, f"Welcher Stoff siedet höher: {fh(x)} oder {fh(y)}? Begründe.", f"<b>{fh(hi)}</b> ({SUB[hi][1]} °C / {SUB[lo][1]} °C): {why}".replace(" -", " −").replace("(-", "(−"))
        elif t == 3:
            m_, dip, why = r.choice([("H2O", True, "gewinkelt, Ladungsschwerpunkte getrennt"), ("CO2", False, "linear, Teilladungen heben sich auf"), ("NH3", True, "pyramidal, freies Elektronenpaar am N"),
                                     ("CH4", False, "tetraedrisch, C–H kaum polar und symmetrisch"), ("HCl", True, "polare Bindung, nur zwei Atome"), ("CCl4", False, "tetraedrisch, die vier Dipole heben sich auf"),
                                     ("CHCl3", True, "tetraedrisch, aber unsymmetrisch besetzt"), ("O2", False, "gleiche Atome, unpolare Bindung"), ("HF", True, "sehr polare Bindung, zwei Atome"), ("H2S", True, "gewinkelt wie Wasser")])
            add(2, f"Ist {fh(m_)} ein Dipolmolekül? Begründe mit dem räumlichen Bau.", f"<b>{'ja' if dip else 'nein'}</b>: {why}")
        else:
            qa = r.choice([("Warum leitet eine Lösung von Chlorwasserstoff in Wasser den Strom, reiner Chlorwasserstoff aber nicht?", "HCl reagiert mit Wasser: <b>HCl + H₂O → H₃O⁺ + Cl⁻</b>. Erst dabei entstehen bewegliche Ionen."),
                           ("Warum schmilzt Natrium (98 °C) viel niedriger als Magnesium (650 °C)?", "Mg gibt <b>2 Valenzelektronen</b> ab, seine Rümpfe sind zweifach geladen und kleiner: <b>stärkere Metallbindung</b>."),
                           ("Ordne nach steigender Siedetemperatur: Ethan, Ethanol, Dimethylether.", "<b>Ethan (−89 °C) < Dimethylether (−24 °C) < Ethanol (78 °C)</b>: London < Dipol-Dipol < Wasserstoffbrücken."),
                           ("Warum löst sich Iod kaum in Wasser, aber gut in Benzin?", "I₂ ist <b>unpolar</b>. Mit Benzin (unpolar) entstehen ähnliche London-Kräfte, Wasser bevorzugt Wasserstoffbrücken untereinander: <b>Ähnliches löst sich in Ähnlichem</b>."),
                           ("Wie unterscheiden sich Elektronenpaarbindung und zwischenmolekulare Kräfte?", "Elektronenpaarbindungen halten Atome <b>im Molekül</b> zusammen und sind stark; zwischenmolekulare Kräfte wirken <b>zwischen Molekülen</b> und sind viel schwächer."),
                           ("Ein Stoff schmilzt bei 1083 °C, glänzt und leitet fest den Strom. Stoffklasse?", "<b>Metall</b> (es ist Kupfer): freie Elektronen, starke Metallbindung."),
                           ("Ein Stoff schmilzt bei 770 °C, leitet fest nicht, aber gelöst. Stoffklasse?", "<b>Ionensubstanz</b> (z. B. KCl): Ionen werden erst in Lösung oder Schmelze beweglich."),
                           ("Ein Stoff siedet bei −34 °C und leitet nicht. Stoffklasse?", "<b>Molekülsubstanz</b> (z. B. Cl₂): nur schwache Kräfte zwischen den Molekülen.")])
            add(2, *qa)
    fixed = [
        ("Beschreibe den Lösevorgang von Calciumchlorid in Wasser auf Teilchenebene und stelle die Gleichung auf.", "Wasser-Dipole lagern sich an: <b>O-Atome (δ⁻) an Ca²⁺, H-Atome (δ⁺) an Cl⁻</b>. Ionen an Ecken und Kanten werden herausgelöst und von einer <b>Hydrathülle</b> umgeben. CaCl₂(s) → Ca²⁺(aq) + 2 Cl⁻(aq)"),
        ("Vergleiche, was passiert, wenn man mit dem Hammer auf ein Metall und auf einen Salzkristall schlägt.", "Metall: Schichten von Atomrümpfen <b>gleiten</b>, das Elektronengas hält sie weiter zusammen: verformbar. Salz: Nach der Verschiebung liegen <b>gleich geladene Ionen</b> nebeneinander, Abstoßung: <b>spröde</b>, der Kristall bricht."),
        ("Begründe, warum Magnesiumoxid (2852 °C) viel höher schmilzt als Natriumchlorid (801 °C).", "Mg²⁺ und O²⁻ sind <b>zweifach geladen</b> und <b>kleiner</b> als Na⁺ und Cl⁻. Die Anziehung (Gitterenergie) ist dadurch viel größer."),
        ("Beim Lösen von Ammoniumnitrat wird die Lösung kalt, beim Lösen von Calciumchlorid warm. Erkläre mit den Energien beim Lösen.", "Zum Abbau des Gitters wird <b>Gitterenergie</b> benötigt, bei der Bildung der Hydrathüllen wird <b>Hydratationsenergie</b> frei. NH₄NO₃: Gitterenergie überwiegt, Wärme wird der Umgebung entzogen. CaCl₂: Hydratationsenergie überwiegt."),
        ("Wasser müsste nach dem Trend der Wasserstoffverbindungen der VI. Hauptgruppe bei etwa −80 °C sieden. Erkläre den tatsächlichen Wert von 100 °C.", "Das O-Atom ist sehr elektronegativ und klein, die O–H-Bindung stark polar. Zwischen den Molekülen bilden sich <b>Wasserstoffbrücken</b> (H an O zu freiem Elektronenpaar am O), die viel Energie zum Trennen brauchen. H₂S, H₂Se, H₂Te bilden keine."),
        ("Erkläre, warum die Siedetemperaturen der Alkane mit der Kettenlänge steigen.", "Alkane sind unpolar, es wirken nur <b>London-Kräfte</b>. Längere Moleküle haben <b>mehr Elektronen</b> und eine <b>größere Oberfläche</b>, die kurzzeitigen Dipole sind stärker."),
        ("Warum leitet festes Natriumchlorid keinen Strom, obwohl es aus geladenen Teilchen besteht?", "Strom ist die Bewegung von Ladungsträgern. Im Ionengitter sind die Ionen an <b>feste Plätze gebunden</b>. Erst in der Schmelze oder in Lösung werden sie beweglich."),
        ("Ordne H₂O, CO₂ und CH₄ nach ihrer Löslichkeit in Wasser und erkläre.", "H₂O mischt sich selbst (Wasserstoffbrücken); CO₂ hat polare Bindungen, ist aber unpolar, löst sich mäßig (auch durch Reaktion zu Kohlensäure); <b>CH₄</b> ist unpolar und löst sich am schlechtesten."),
        ("Entscheide mit ΔEN, welche der Verbindungen KF, HF, F₂ eine Ionenbindung, eine polare und eine unpolare Elektronenpaarbindung enthält.", "KF: ΔEN = 3,16 ⇒ <b>Ionenbindung</b>; HF: ΔEN = 1,78, an der Grenze, aber zwei Nichtmetalle ⇒ <b>sehr polare Elektronenpaarbindung</b>; F₂: ΔEN = 0 ⇒ <b>unpolar</b>."),
        ("Warum ist Kohlenstoffdioxid ein Gas, Siliciumdioxid (Quarz) aber ein harter Feststoff mit 1713 °C Schmelztemperatur?", "CO₂ bildet <b>einzelne Moleküle</b> mit schwachen London-Kräften. SiO₂ bildet ein <b>Atomgitter</b>, in dem alle Atome durch Elektronenpaarbindungen verknüpft sind: Zum Schmelzen müssen echte Bindungen gelöst werden."),
        ("Erkläre, wie Tenside Fett und Wasser verbinden.", "Tensidmoleküle haben einen <b>polaren (hydrophilen) Kopf</b> und einen <b>unpolaren (hydrophoben) Schwanz</b>. Der Schwanz löst sich im Fett, der Kopf im Wasser: Fetttröpfchen werden umhüllt und ausgewaschen."),
        ("Warum gefriert Salzwasser erst unter 0 °C?", "Die gelösten, hydratisierten Ionen stören den geordneten Aufbau des Eisgitters aus Wassermolekülen. Die Wassermoleküle müssen stärker abgekühlt werden, bis sie ins Gitter einrasten: <b>Gefrierpunktserniedrigung</b>."),
        ("Ethanol ist mit Wasser und mit Benzin mischbar. Erkläre mit dem Bau des Moleküls.", "C₂H₅OH hat eine <b>polare OH-Gruppe</b> (Wasserstoffbrücken zu Wasser) und einen <b>unpolaren Ethylrest</b> (London-Kräfte zu Benzin)."),
        ("Ein Stoff X ist bei Raumtemperatur fest, schmilzt bei 186 °C unter Zersetzung, löst sich gut in Wasser, die Lösung leitet nicht. Bestimme die Stoffklasse und begründe.", "<b>Molekülsubstanz</b> (z. B. Zucker): Lösung ohne Ionen leitet nicht; gut löslich wegen vieler polarer OH-Gruppen (Wasserstoffbrücken); relativ niedrige Schmelztemperatur."),
        ("Erkläre, warum Metalle Wärme gut leiten und glänzen.", "Die frei beweglichen Elektronen des <b>Elektronengases</b> nehmen Energie auf und transportieren sie schnell weiter; einfallendes Licht wird von ihnen zurückgestrahlt: <b>Metallglanz</b>."),
        ("Welche Teilchen und Kräfte müssen beim Schmelzen von Eis, Kochsalz und Eisen jeweils überwunden werden?", "Eis: <b>Wasserstoffbrücken</b> zwischen H₂O-Molekülen (0 °C). Kochsalz: <b>Ionenbindung</b> im Gitter (801 °C). Eisen: <b>Metallbindung</b> zwischen Atomrümpfen und Elektronengas (1538 °C)."),
    ]
    for q_, a_ in fixed:
        add(3, q_, a_)
    for c, a in r.sample([(c, a) for c, a in SOL if a[2] != -1 or c[2] != 1], 6):
        f, nc, na, name = salt(c, a)
        add(3, f"Leite die Formel von {name} aus der Stellung der Elemente bzw. den Ionenladungen her und gib an, wie viele Ionen eine Formeleinheit beim Lösen liefert.", f"{ion(c[1], c[2])}, {ion(a[1], a[2])}: kleinstes gemeinsames Vielfaches der Ladungen ⇒ <b>{fh(f)}</b>; {diss(c, a)}: <b>{nc + na} Ionen</b>")
    r.shuffle(L[3])
    return L


ORB_ORDER = [("1s", 1), ("2s", 1), ("2p", 3), ("3s", 1), ("3p", 3), ("4s", 1), ("3d", 5), ("4p", 3)]
ORB_WRITE = ["1s", "2s", "2p", "3s", "3p", "3d", "4s", "4p"]
ORB_SYM = ["", "H", "He", "Li", "Be", "B", "C", "N", "O", "F", "Ne", "Na", "Mg", "Al", "Si", "P", "S", "Cl", "Ar", "K", "Ca", "Sc", "Ti", "V", "Cr", "Mn", "Fe", "Co", "Ni", "Cu", "Zn", "Ga", "Ge", "As", "Se", "Br", "Kr"]
ORB_NAME = ["", "Wasserstoff", "Helium", "Lithium", "Beryllium", "Bor", "Kohlenstoff", "Stickstoff", "Sauerstoff", "Fluor", "Neon", "Natrium", "Magnesium", "Aluminium", "Silicium", "Phosphor", "Schwefel", "Chlor", "Argon", "Kalium", "Calcium", "Scandium", "Titan", "Vanadium", "Chrom", "Mangan", "Eisen", "Cobalt", "Nickel", "Kupfer", "Zink", "Gallium", "Germanium", "Arsen", "Selen", "Brom", "Krypton"]


def orb_fill(z):
    res, left = {}, z
    for l, o in ORB_ORDER:
        res[l] = min(left, 2 * o)
        left -= res[l]
    if z == 24:
        res["4s"], res["3d"] = 1, 5
    if z == 29:
        res["4s"], res["3d"] = 1, 10
    return res


def orb_conf(z, short=False):
    f = orb_fill(z)
    sup = lambda n: str(n).translate(_SUP)
    if short and z > 2:
        core = 18 if z > 18 else 10 if z > 10 else 2
        fc = orb_fill(core)
        return f"[{ORB_SYM[core]}] " + " ".join(l + sup(f[l]) for l in ORB_WRITE if f[l] and f[l] != fc[l])
    return " ".join(l + sup(f[l]) for l in ORB_WRITE if f[l])


def orb_unpaired(z):
    f = orb_fill(z)
    return sum(f[l] if f[l] <= o else 2 * o - f[l] for l, o in ORB_ORDER)


def orbitalmodell():
    r = random.Random(204)
    L = {1: [], 2: [], 3: []}
    seen = set()

    def add(lvl, q, a):
        if q not in seen and len(L[lvl]) < 120:
            seen.add(q)
            L[lvl].append((q, a))
    for i in range(800):
        t = i % 4
        z = r.randint(1, 20)
        if t == 0:
            add(1, f"Elektronenkonfiguration von {ORB_NAME[z]} (Z = {z})?", f"<b>{orb_conf(z)}</b>")
        elif t == 1:
            l = r.choice(["1s", "2s", "2p", "3s", "3p", "3d", "4s", "4p", "4d", "4f"])
            n = {"s": 1, "p": 3, "d": 5, "f": 7}[l[1]]
            add(1, f"Wie viele Orbitale hat das Niveau {l}, wie viele Elektronen passen hinein?", f"<b>{n} Orbital{'e' if n > 1 else ''}, {2 * n} Elektronen</b>")
        elif t == 2:
            add(1, f"Welches Element hat die Konfiguration {orb_conf(z)}?", f"{z} Elektronen: <b>{ORB_NAME[z]} ({ORB_SYM[z]})</b>")
        else:
            a, b = r.sample(["1s", "2s", "2p", "3s", "3p", "4s", "3d", "4p"], 2)
            idx = [x for x, _ in ORB_ORDER]
            first = a if idx.index(a) < idx.index(b) else b
            add(1, f"Welches Niveau wird zuerst besetzt: {a} oder {b}?", f"<b>{first}</b> (niedrigere Energie)")
    for i in range(800):
        t = i % 4
        z = r.randint(3, 36)
        if t == 0:
            add(2, f"Konfiguration von {ORB_NAME[z]} (Z = {z}) in ausführlicher und in Edelgas-Kurzschreibweise?", f"Reihenfolge 1s, 2s, 2p, 3s, 3p, 4s, 3d, 4p: <b>{orb_conf(z)}</b>; Edelgaskern ersetzt die inneren Elektronen: <b>{orb_conf(z, True)}</b>")
        elif t == 1:
            add(2, f"Wie viele ungepaarte Elektronen hat {ORB_NAME[z]}? Begründe mit der Hund'schen Regel.", f"{orb_conf(z, True)}: <b>{orb_unpaired(z)} ungepaarte</b>; gleichwertige Orbitale werden zuerst einzeln besetzt.")
        elif t == 2:
            f = orb_fill(z)
            blk = "d" if 21 <= z <= 30 else "s" if f["4p"] == 0 and z in (3, 4, 11, 12, 19, 20) else "p"
            if z in (10, 18, 36):
                blk = "p"
            add(2, f"In welchem Block, welcher Periode und (Haupt- oder Neben-)Gruppe steht {ORB_NAME[z]}?", f"{orb_conf(z, True)}: <b>{blk}-Block, {4 if z > 18 else 3 if z > 10 else 2}. Periode</b>{', Nebengruppenelement' if blk == 'd' else ''}")
        else:
            ions = [(11, 1), (12, 2), (13, 3), (8, -2), (9, -1), (17, -1), (16, -2), (19, 1), (20, 2), (7, -3)]
            zz, q = r.choice(ions)
            add(2, f"Konfiguration des Ions {ORB_SYM[zz]}{chg(q)}? Mit welchem Edelgas stimmt sie überein?", f"{ORB_SYM[zz]} hat {zz} e⁻, {'gibt' if q > 0 else 'nimmt'} {abs(q)} {'ab' if q > 0 else 'auf'} ⇒ {zz - q} Elektronen: <b>{orb_conf(zz - q)}</b>, Edelgaskonfiguration wie <b>{ORB_NAME[zz - q]}</b>")

    # transition-metal ions lose the 4s electrons first
    tm = [(26, 2, "Eisen(II)"), (26, 3, "Eisen(III)"), (29, 2, "Kupfer(II)"), (29, 1, "Kupfer(I)"), (30, 2, "Zink"), (25, 2, "Mangan(II)"), (24, 3, "Chrom(III)"), (27, 2, "Cobalt(II)"), (28, 2, "Nickel(II)"), (22, 4, "Titan(IV)")]
    for z, q, nm in tm:
        d = z - 18 - q  # all 4s electrons leave first
        dd = d
        unp = dd if dd <= 5 else 10 - dd
        add(3, f"Gib die Elektronenkonfiguration des {nm}-Ions {ORB_SYM[z]}{chg(q)} an und bestimme die Zahl ungepaarter Elektronen. Beachte: Bei Ionen werden zuerst die 4s-Elektronen abgegeben.",
            f"{ORB_SYM[z]}: {orb_conf(z, True)}; {ORB_SYM[z]}{chg(q)}: <b>[Ar] 3d{str(d).translate(_SUP) if d else '⁰'}</b>, <b>{unp} ungepaarte</b> Elektronen" + (" (halb gefülltes d-Niveau, besonders stabil)" if d == 5 else " (volles d-Niveau: farblos, nicht magnetisch)" if d == 10 else ""))
    fixed = [
        ("Warum wird beim Kalium (Z = 19) das 19. Elektron in das 4s- und nicht in das 3d-Orbital eingebaut?", "Das <b>4s-Niveau hat eine niedrigere Energie</b> als 3d. Nach dem Energieprinzip wird immer zuerst das energieärmste freie Orbital besetzt."),
        ("Erkläre die Ausnahmen bei Chrom ([Ar] 3d⁵ 4s¹) und Kupfer ([Ar] 3d¹⁰ 4s¹).", "Ein <b>halb gefülltes</b> (d⁵) bzw. <b>vollständig gefülltes</b> (d¹⁰) d-Niveau ist besonders stabil. Dafür wechselt ein 4s-Elektron ins 3d-Niveau."),
        ("Nenne zwei Beobachtungen, die das Bohr-Modell nicht erklären kann, das Orbitalmodell aber schon.", "Z. B. die <b>Nebengruppen</b> (Auffüllen von 3d nach 4s), die räumliche Gestalt von Molekülen (Bindungswinkel), Feinstrukturen in Atomspektren, magnetische Eigenschaften (ungepaarte Elektronen)."),
        ("Formuliere das Pauli-Prinzip und zeige an Helium, wie es angewendet wird.", "Ein Orbital fasst <b>höchstens zwei Elektronen mit entgegengesetztem Spin</b>. He: 1s² als ↑↓ in einem Kästchen; ein drittes Elektron müsste in 2s."),
        ("Begründe, warum die Hauptgruppen I und II s-Block und die Hauptgruppen III bis VIII p-Block heißen.", "Bei ihnen wird als letztes ein <b>s-Orbital</b> bzw. ein <b>p-Orbital</b> der Valenzschale besetzt. Da s 2 und p 6 Elektronen fasst, ist der s-Block 2 und der p-Block 6 Gruppen breit."),
        ("Warum ist die Periode 4 achtzehn Elemente lang, die Periode 3 aber nur acht?", "In Periode 4 wird zwischen 4s und 4p das <b>3d-Niveau</b> (10 Elektronen) aufgefüllt: 2 + 10 + 6 = <b>18</b>. In Periode 3 nur 3s und 3p: 2 + 6 = 8."),
        ("Erkläre, warum Eisen magnetisch ist, Zink aber nicht.", "Fe: [Ar] 3d⁶ 4s² hat <b>4 ungepaarte Elektronen</b>, deren Spins sich ausrichten können. Zn: [Ar] 3d¹⁰ 4s², alle Elektronen <b>gepaart</b>."),
        ("Warum sind viele Verbindungen der Nebengruppenelemente farbig?", "In <b>teilweise besetzten d-Orbitalen</b> können Elektronen Licht bestimmter Wellenlängen absorbieren; die Komplementärfarbe sehen wir (Cu²⁺: blau)."),
        ("Was bedeutet die Aussage: Ein Orbital ist der Raum, in dem sich ein Elektron mit 90 % Wahrscheinlichkeit aufhält?", "Der Ort eines Elektrons ist <b>nicht exakt bestimmbar</b>. Man kann nur angeben, mit welcher Wahrscheinlichkeit es in einem Raumbereich anzutreffen ist; das Orbital ist der Bereich, der 90 % davon umfasst."),
        ("Vergleiche 1s- und 2s-Orbital.", "Beide sind <b>kugelförmig</b>. Das 2s-Orbital ist <b>größer</b> und energiereicher, seine Elektronen sind im Mittel weiter vom Kern entfernt."),
        ("Warum ist Fe³⁺ stabiler als Fe²⁺? Argumentiere mit der Elektronenkonfiguration.", "Fe²⁺: [Ar] 3d⁶, Fe³⁺: [Ar] <b>3d⁵</b>. Das halb gefüllte d-Niveau (je ein Elektron in allen fünf d-Orbitalen) ist besonders energiearm."),
        ("Wie viele Elektronen besitzen in einem Bromatom (Z = 35) die Hauptquantenzahl n = 4? Wie viele Valenzelektronen hat es?", "[Ar] 3d¹⁰ 4s² 4p⁵: n = 4 hat <b>2 + 5 = 7 Elektronen</b>; das sind die <b>7 Valenzelektronen</b> (VII. Hauptgruppe)."),
        ("Begründe mit Orbitalen, warum Edelgase reaktionsträge sind.", "Alle besetzten s- und p-Orbitale der Valenzschale sind <b>voll (ns² np⁶)</b>; es gibt keine ungepaarten Elektronen und keine energetisch günstigen freien Plätze."),
        ("Kohlenstoff hat die Konfiguration 1s² 2s² 2p². Wie viele Bindungen erwartest du danach, wie viele bildet C tatsächlich? Nenne eine Erklärung.", "Nach dem Schema nur <b>2 ungepaarte</b> Elektronen, tatsächlich bildet C aber <b>4 Bindungen</b> (CH₄). Ein 2s-Elektron wird in das freie 2p-Orbital angehoben (Hybridisierung, sp³), dann sind 4 Elektronen ungepaart."),
    ]
    for q_, a_ in fixed:
        add(3, q_, a_)
    for z in r.sample(range(21, 31), 6):
        add(3, f"Zeichne das Kästchenschema für {ORB_NAME[z]} (Z = {z}) ab 3d und 4s. Wie viele ungepaarte Elektronen gibt es?", f"<b>{orb_conf(z, True)}</b>: <b>{orb_unpaired(z)} ungepaarte</b> Elektronen (3d erst einzeln, dann doppelt){'; Ausnahme!' if z in (24, 29) else ''}")
    r.shuffle(L[3])
    return L


def _rom(n):
    return "0" if n == 0 else ("+" if n > 0 else "−") + ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII"][abs(n)]


REDOX_SP = [("Wasser", [("H", 2, 1), ("O", 1, -2)], 0), ("Wasserstoffperoxid", [("H", 2, 1), ("O", 2, -1)], 0), ("Kohlenstoffdioxid", [("C", 1, 4), ("O", 2, -2)], 0),
            ("Kohlenstoffmonooxid", [("C", 1, 2), ("O", 1, -2)], 0), ("Methan", [("C", 1, -4), ("H", 4, 1)], 0), ("Ammoniak", [("N", 1, -3), ("H", 3, 1)], 0),
            ("Ammonium-Ion", [("N", 1, -3), ("H", 4, 1)], 1), ("Salpetersäure", [("H", 1, 1), ("N", 1, 5), ("O", 3, -2)], 0), ("Nitrit-Ion", [("N", 1, 3), ("O", 2, -2)], -1),
            ("Stickstoffmonooxid", [("N", 1, 2), ("O", 1, -2)], 0), ("Schwefeldioxid", [("S", 1, 4), ("O", 2, -2)], 0), ("Sulfat-Ion", [("S", 1, 6), ("O", 4, -2)], -2),
            ("Sulfit-Ion", [("S", 1, 4), ("O", 3, -2)], -2), ("Schwefelwasserstoff", [("H", 2, 1), ("S", 1, -2)], 0), ("Permanganat-Ion", [("Mn", 1, 7), ("O", 4, -2)], -1),
            ("Mangandioxid", [("Mn", 1, 4), ("O", 2, -2)], 0), ("Dichromat-Ion", [("Cr", 2, 6), ("O", 7, -2)], -2), ("Chromat-Ion", [("Cr", 1, 6), ("O", 4, -2)], -2),
            ("Eisen(III)-oxid", [("Fe", 2, 3), ("O", 3, -2)], 0), ("Kupfer(I)-oxid", [("Cu", 2, 1), ("O", 1, -2)], 0), ("Chlorat-Ion", [("Cl", 1, 5), ("O", 3, -2)], -1),
            ("Perchlorat-Ion", [("Cl", 1, 7), ("O", 4, -2)], -1), ("Hypochlorit-Ion", [("Cl", 1, 1), ("O", 1, -2)], -1), ("Natriumhydrid", [("Na", 1, 1), ("H", 1, -1)], 0),
            ("Phosphorsäure", [("H", 3, 1), ("P", 1, 5), ("O", 4, -2)], 0), ("Thiosulfat-Ion", [("S", 2, 2), ("O", 3, -2)], -2), ("Methanol", [("C", 1, -2), ("H", 4, 1), ("O", 1, -2)], 0),
            ("Ethanol", [("C", 2, -2), ("H", 6, 1), ("O", 1, -2)], 0), ("Methanal", [("C", 1, 0), ("H", 2, 1), ("O", 1, -2)], 0), ("Ameisensäure", [("C", 1, 2), ("H", 2, 1), ("O", 2, -2)], 0)]


def _sp_formula(at, q):
    return "".join(e + (f"<sub>{c}</sub>" if c > 1 else "") for e, c, _ in at) + chg(q)


def redoxreaktionen():
    r = random.Random(205)
    L = {1: [], 2: [], 3: []}
    seen = set()

    def add(lvl, q, a):
        if q not in seen and len(L[lvl]) < 120:
            seen.add(q)
            L[lvl].append((q, a))
    SER = ["K", "Ca", "Na", "Mg", "Al", "Zn", "Fe", "Ni", "Sn", "Pb", "Cu", "Ag", "Au"]
    ION = {"Mg": ("Mg", 2), "Al": ("Al", 3), "Zn": ("Zn", 2), "Fe": ("Fe", 2), "Ni": ("Ni", 2), "Sn": ("Sn", 2), "Pb": ("Pb", 2), "Cu": ("Cu", 2), "Ag": ("Ag", 1), "Au": ("Au", 3)}
    for name, at, q in REDOX_SP:
        for e, c, oz in at:
            if e in ("H", "O") and not (name in ("Wasserstoffperoxid", "Natriumhydrid")):
                continue
            add(1, f"Oxidationszahl von {e} in {_sp_formula(at, q)} ({name})?", f"<b>{_rom(oz)}</b>")
    for i in range(400):
        t = i % 3
        if t == 0:
            m = r.choice(SER[3:])
            e, qq = ION.get(m, (m, 1))
            add(1, f"Stelle die Teilgleichung für die Oxidation von {m} auf.", f"<b>{m} → {e}{chg(qq)} + {'' if qq == 1 else qq} e⁻</b>")
        elif t == 1:
            x = r.choice([("Cl₂", "2 Cl⁻", 2), ("Br₂", "2 Br⁻", 2), ("O₂", "2 O²⁻", 4), ("Cu²⁺", "Cu", 2), ("Ag⁺", "Ag", 1), ("Fe³⁺", "Fe²⁺", 1), ("I₂", "2 I⁻", 2), ("Au³⁺", "Au", 3)])
            add(1, f"Reduktion: {x[0]} → {x[1]}. Ergänze die Elektronen.", f"<b>{x[0]} + {'' if x[2] == 1 else x[2]} e⁻ → {x[1]}</b>")
        else:
            a, b = r.sample(SER[3:], 2)
            yes = SER.index(a) < SER.index(b)
            e, qq = ION[b]
            add(1, f"Reagiert {a} mit einer Lösung von {e}{chg(qq)}-Ionen?", f"<b>{'ja' if yes else 'nein'}</b>: {a} ist {'unedler' if yes else 'edler'} als {b}")
    rx = [("Zn + Cu²⁺ → Zn²⁺ + Cu", "Zn", "Cu²⁺"), ("Fe + Cu²⁺ → Fe²⁺ + Cu", "Fe", "Cu²⁺"), ("2 Na + Cl₂ → 2 NaCl", "Na", "Cl₂"), ("2 Al + 3 Cl₂ → 2 AlCl₃", "Al", "Cl₂"),
          ("Cl₂ + 2 Br⁻ → 2 Cl⁻ + Br₂", "Br⁻", "Cl₂"), ("2 Mg + O₂ → 2 MgO", "Mg", "O₂"), ("CuO + H₂ → Cu + H₂O", "H₂", "CuO"), ("Fe₂O₃ + 2 Al → 2 Fe + Al₂O₃", "Al", "Fe₂O₃"),
          ("2 Fe³⁺ + 2 I⁻ → 2 Fe²⁺ + I₂", "I⁻", "Fe³⁺"), ("Zn + 2 H⁺ → Zn²⁺ + H₂", "Zn", "H⁺"), ("C + O₂ → CO₂", "C", "O₂"), ("2 H₂O₂ → 2 H₂O + O₂", "H₂O₂ (ein Teil)", "H₂O₂ (anderer Teil)")]
    for eq, ox, red in rx:
        add(2, f"Bestimme Oxidationsmittel und Reduktionsmittel: {eq}", f"oxidiert: <b>{ox}</b> (Reduktionsmittel), reduziert: <b>{red}</b> (Oxidationsmittel)" + (" – Disproportionierung: O von −I auf −II und 0" if "H₂O₂ →" in eq else ""))
    eqs = [("Al + O₂", "Ox: Al → Al³⁺ + 3 e⁻ (·4); Red: O₂ + 4 e⁻ → 2 O²⁻ (·3)", "4 Al + 3 O₂ → 2 Al₂O₃"),
           ("Cu + Ag⁺", "Ox: Cu → Cu²⁺ + 2 e⁻; Red: Ag⁺ + e⁻ → Ag (·2)", "Cu + 2 Ag⁺ → Cu²⁺ + 2 Ag"),
           ("Al + Cu²⁺", "Ox: Al → Al³⁺ + 3 e⁻ (·2); Red: Cu²⁺ + 2 e⁻ → Cu (·3)", "2 Al + 3 Cu²⁺ → 2 Al³⁺ + 3 Cu"),
           ("Fe³⁺ + Zn", "Ox: Zn → Zn²⁺ + 2 e⁻; Red: Fe³⁺ + e⁻ → Fe²⁺ (·2)", "Zn + 2 Fe³⁺ → Zn²⁺ + 2 Fe²⁺"),
           ("Cl₂ + I⁻", "Ox: 2 I⁻ → I₂ + 2 e⁻; Red: Cl₂ + 2 e⁻ → 2 Cl⁻", "Cl₂ + 2 I⁻ → 2 Cl⁻ + I₂"),
           ("Fe₂O₃ + CO", "Fe +III → 0 (je 3 e⁻), C +II → +IV (je 2 e⁻): 6 e⁻ pro Formel", "Fe₂O₃ + 3 CO → 2 Fe + 3 CO₂"),
           ("Na + H₂O", "Ox: Na → Na⁺ + e⁻ (·2); Red: 2 H₂O + 2 e⁻ → H₂ + 2 OH⁻", "2 Na + 2 H₂O → 2 Na⁺ + 2 OH⁻ + H₂"),
           ("Mg + H⁺", "Ox: Mg → Mg²⁺ + 2 e⁻; Red: 2 H⁺ + 2 e⁻ → H₂", "Mg + 2 H⁺ → Mg²⁺ + H₂")]
    for k, steps, res in eqs:
        add(2, f"Stelle die Redoxgleichung mit Teilgleichungen auf: {k}", f"{steps}: <b>{res}</b>")
    for name, at, q in r.sample(REDOX_SP, 12):
        u = next(i for i, (e, c, oz) in enumerate(at) if e not in ("H", "O")) if any(e not in ("H", "O") for e, _, _ in at) else 1
        e, c, oz = at[u]
        known = " + ".join(f"{cc}·({o:+d})" for i, (ee, cc, o) in enumerate(at) if i != u)
        add(2, f"Berechne die Oxidationszahl von {e} in {_sp_formula(at, q)} und schreibe den Rechenweg auf.", f"{c}·x + {known} = {q} ⇒ <b>x = {_rom(oz)}</b>".replace("+-", "−").replace("(-", "(−"))
    big = [("MnO₄⁻ + Fe²⁺ (sauer)", "Red: MnO₄⁻ + 8 H⁺ + 5 e⁻ → Mn²⁺ + 4 H₂O; Ox: Fe²⁺ → Fe³⁺ + e⁻ (·5)", "MnO₄⁻ + 5 Fe²⁺ + 8 H⁺ → Mn²⁺ + 5 Fe³⁺ + 4 H₂O"),
           ("Cr₂O₇²⁻ + I⁻ (sauer)", "Red: Cr₂O₇²⁻ + 14 H⁺ + 6 e⁻ → 2 Cr³⁺ + 7 H₂O; Ox: 2 I⁻ → I₂ + 2 e⁻ (·3)", "Cr₂O₇²⁻ + 6 I⁻ + 14 H⁺ → 2 Cr³⁺ + 3 I₂ + 7 H₂O"),
           ("MnO₄⁻ + SO₃²⁻ (sauer)", "Red: MnO₄⁻ + 8 H⁺ + 5 e⁻ → Mn²⁺ + 4 H₂O (·2); Ox: SO₃²⁻ + H₂O → SO₄²⁻ + 2 H⁺ + 2 e⁻ (·5)", "2 MnO₄⁻ + 5 SO₃²⁻ + 6 H⁺ → 2 Mn²⁺ + 5 SO₄²⁻ + 3 H₂O"),
           ("Cu + HNO₃ (NO entsteht)", "Ox: Cu → Cu²⁺ + 2 e⁻ (·3); Red: NO₃⁻ + 4 H⁺ + 3 e⁻ → NO + 2 H₂O (·2)", "3 Cu + 2 NO₃⁻ + 8 H⁺ → 3 Cu²⁺ + 2 NO + 4 H₂O"),
           ("H₂O₂ + I⁻ (sauer)", "Red: H₂O₂ + 2 H⁺ + 2 e⁻ → 2 H₂O; Ox: 2 I⁻ → I₂ + 2 e⁻", "H₂O₂ + 2 I⁻ + 2 H⁺ → 2 H₂O + I₂"),
           ("MnO₄⁻ + H₂O₂ (sauer)", "Red: MnO₄⁻ + 8 H⁺ + 5 e⁻ → Mn²⁺ + 4 H₂O (·2); Ox: H₂O₂ → O₂ + 2 H⁺ + 2 e⁻ (·5)", "2 MnO₄⁻ + 5 H₂O₂ + 6 H⁺ → 2 Mn²⁺ + 5 O₂ + 8 H₂O"),
           ("MnO₄⁻ + I⁻ (basisch, MnO₂ entsteht)", "Red: MnO₄⁻ + 2 H₂O + 3 e⁻ → MnO₂ + 4 OH⁻ (·2); Ox: 2 I⁻ → I₂ + 2 e⁻ (·3)", "2 MnO₄⁻ + 6 I⁻ + 4 H₂O → 2 MnO₂ + 3 I₂ + 8 OH⁻"),
           ("Fe²⁺ + Cr₂O₇²⁻ (sauer)", "Red: Cr₂O₇²⁻ + 14 H⁺ + 6 e⁻ → 2 Cr³⁺ + 7 H₂O; Ox: Fe²⁺ → Fe³⁺ + e⁻ (·6)", "Cr₂O₇²⁻ + 6 Fe²⁺ + 14 H⁺ → 2 Cr³⁺ + 6 Fe³⁺ + 7 H₂O"),
           ("Zn + NO₃⁻ (sauer, NH₄⁺ entsteht)", "Ox: Zn → Zn²⁺ + 2 e⁻ (·4); Red: NO₃⁻ + 10 H⁺ + 8 e⁻ → NH₄⁺ + 3 H₂O", "4 Zn + NO₃⁻ + 10 H⁺ → 4 Zn²⁺ + NH₄⁺ + 3 H₂O"),
           ("Cu + konz. H₂SO₄ (SO₂ entsteht)", "Ox: Cu → Cu²⁺ + 2 e⁻; Red: SO₄²⁻ + 4 H⁺ + 2 e⁻ → SO₂ + 2 H₂O", "Cu + SO₄²⁻ + 4 H⁺ → Cu²⁺ + SO₂ + 2 H₂O"),
           ("Ethanol + Dichromat (sauer, Ethanal entsteht)", "Ox: C₂H₅OH → CH₃CHO + 2 H⁺ + 2 e⁻ (·3); Red: Cr₂O₇²⁻ + 14 H⁺ + 6 e⁻ → 2 Cr³⁺ + 7 H₂O", "3 C₂H₅OH + Cr₂O₇²⁻ + 8 H⁺ → 3 CH₃CHO + 2 Cr³⁺ + 7 H₂O"),
           ("Al + OH⁻ + H₂O (Wasserstoff entsteht, [Al(OH)₄]⁻)", "Ox: Al + 4 OH⁻ → [Al(OH)₄]⁻ + 3 e⁻ (·2); Red: 2 H₂O + 2 e⁻ → H₂ + 2 OH⁻ (·3)", "2 Al + 2 OH⁻ + 6 H₂O → 2 [Al(OH)₄]⁻ + 3 H₂"),
           ("Fe²⁺ + H₂O₂ (sauer)", "Ox: Fe²⁺ → Fe³⁺ + e⁻ (·2); Red: H₂O₂ + 2 H⁺ + 2 e⁻ → 2 H₂O", "2 Fe²⁺ + H₂O₂ + 2 H⁺ → 2 Fe³⁺ + 2 H₂O"),
           ("Cl₂ in Natronlauge (Disproportionierung)", "Cl₂ + 2 e⁻ → 2 Cl⁻; Cl₂ + 4 OH⁻ → 2 ClO⁻ + 2 H₂O + 2 e⁻", "Cl₂ + 2 OH⁻ → Cl⁻ + ClO⁻ + H₂O")]
    for k, steps, res in big:
        add(3, f"Stelle die vollständige Redoxgleichung mit Oxidationszahlen, Teilgleichungen sowie Ladungs- und Stoffausgleich auf: {k}.", f"{steps} ⇒ <b>{res}</b>")
    fixed = [
        ("Erkläre, warum Oxidation und Reduktion immer gleichzeitig ablaufen.", "Elektronen können nicht frei existieren: Die von einem Teilchen <b>abgegebenen</b> Elektronen müssen von einem anderen <b>aufgenommen</b> werden. Deshalb ist jede Oxidation mit einer Reduktion gekoppelt."),
        ("Leite die höchste und niedrigste Oxidationszahl von Stickstoff, Schwefel und Chlor aus dem PSE ab und nenne je ein Beispiel.", "Höchste = Gruppennummer, niedrigste = Gruppe − 8: <b>N +V (HNO₃) / −III (NH₃)</b>, <b>S +VI (SO₄²⁻) / −II (H₂S)</b>, <b>Cl +VII (ClO₄⁻) / −I (Cl⁻)</b>."),
        ("Warum schützt eine Zinkschicht Eisen vor Rost, auch wenn sie beschädigt ist?", "Zink ist <b>unedler</b> als Eisen und gibt seine Elektronen bevorzugt ab: Es wird an Stelle des Eisens oxidiert (<b>Opferanode</b>)."),
        ("Ordne die Metalle Cu, Zn, Ag, Fe nach ihrer Fähigkeit, Elektronen abzugeben. Begründe mit Versuchen.", "<b>Zn > Fe > Cu > Ag</b>: Zn überzieht sich in Fe²⁺-Lösung mit Eisen, Fe in Cu²⁺-Lösung mit Kupfer, Cu in Ag⁺-Lösung mit Silber, umgekehrt passiert nichts."),
        ("In der Glucoseoxidation C₆H₁₂O₆ + 6 O₂ → 6 CO₂ + 6 H₂O: Wie ändern sich die Oxidationszahlen von C und O? Wie viele Elektronen werden pro Glucosemolekül übertragen?", "C: 0 → +IV (je 4 e⁻, 6 C ⇒ <b>24 e⁻</b>); O in O₂: 0 → −II (12 O-Atome nehmen 24 e⁻ auf)."),
        ("Was ist eine Disproportionierung? Gib ein Beispiel.", "Ein Element mit mittlerer OZ wird <b>gleichzeitig oxidiert und reduziert</b>, z. B. 2 H₂O₂ → 2 H₂O + O₂ (O: −I → −II und 0)."),
        ("Prüfe mit Oxidationszahlen, ob die Reaktion CaCO₃ → CaO + CO₂ eine Redoxreaktion ist.", "Ca +II, C +IV, O −II bleiben überall gleich: <b>keine Redoxreaktion</b> (Zersetzung)."),
        ("Berechne die Oxidationszahlen von C in Methan, Methanol, Methanal, Ameisensäure und CO₂. Was fällt auf?", "−IV, −II, 0, +II, +IV: Die Reihe zeigt eine <b>schrittweise Oxidation</b> des Kohlenstoffs um je zwei Elektronen."),
        ("Begründe, warum Fluor das stärkste Oxidationsmittel unter den Elementen ist.", "Fluor hat die <b>höchste Elektronegativität</b>; es nimmt Elektronen am stärksten auf und wird dabei zu F⁻ reduziert."),
        ("Warum kann man Silberbesteck in einer Aluminiumschale mit heißem Salzwasser reinigen?", "Al ist unedel und reduziert das schwarze Ag₂S: <b>3 Ag₂S + 2 Al → 6 Ag + Al₂S₃</b> (Ag +I → 0, Al 0 → +III)."),
    ]
    for q_, a_ in fixed:
        add(3, q_, a_)
    r.shuffle(L[3])
    return L


def gebrauchsmetalle():
    r = random.Random(206)
    L = {1: [], 2: [], 3: []}
    seen = set()
    M = {"Fe": 55.85, "O": 16.0, "Al": 26.98, "Cu": 63.55, "S": 32.06, "Zn": 65.38, "C": 12.01, "Pb": 207.2}
    de = lambda v, n=1: f"{v:,.{n}f}".replace(",", " ").replace(".", ",").replace(" ", ".")

    def add(lvl, q, a):
        if q not in seen and len(L[lvl]) < 120:
            seen.add(q)
            L[lvl].append((q, a))
    METH = {"Kupfer": "Reduktion (Rösten), Reinigung durch Elektrolyse", "Eisen": "Reduktion mit Kohlenstoff/CO im Hochofen", "Zink": "Reduktion mit Kohlenstoff", "Blei": "Reduktion mit Kohlenstoff",
            "Aluminium": "Schmelzflusselektrolyse", "Magnesium": "Schmelzflusselektrolyse", "Natrium": "Schmelzflusselektrolyse", "Gold": "kommt gediegen vor"}
    for m, v in METH.items():
        add(1, f"Mit welchem Verfahren wird {m} gewonnen?", f"<b>{v}</b>")
    facts = [("Was ist ein Erz?", "Gestein mit so viel <b>Metallverbindung</b>, dass sich die Gewinnung lohnt"), ("Welche Teilchenart liegt das Metall in Erzen meist vor?", "als <b>Kation</b> (z. B. Fe³⁺ in Fe₂O₃)"),
             ("Ist die Metallgewinnung eine Oxidation oder Reduktion?", "<b>Reduktion</b> der Metall-Ionen"), ("Welche Stoffe werden oben in den Hochofen gefüllt?", "<b>Eisenerz, Koks, Kalk</b> (Zuschläge)"),
             ("Was wird unten in den Hochofen eingeblasen?", "<b>Heißwind</b> (heiße Luft, ca. 1200 °C)"), ("Was ist Schlacke?", "Calciumsilicat aus <b>Gangart und Kalk</b>, schwimmt auf dem Roheisen"),
             ("Wie viel Kohlenstoff enthält Roheisen etwa?", "etwa <b>4 %</b>"), ("Wie entsteht aus Roheisen Stahl?", "<b>Frischen</b>: Sauerstoff verbrennt Kohlenstoff zu CO/CO₂"),
             ("Was ist Bauxit?", "Erz für <b>Aluminium</b> (Aluminiumoxid-Hydrat)"), ("Wozu dient Kryolith?", "senkt die <b>Schmelztemperatur</b> des Al₂O₃ auf ca. 950 °C"),
             ("An welchem Pol entsteht bei der Elektrolyse das Metall?", "am <b>Minuspol (Kathode)</b>: Reduktion"), ("Was ist Anodenschlamm?", "<b>Edelmetalle</b> (Ag, Au), die bei der Kupferraffination zu Boden fallen"),
             ("Warum ist Aluminium-Recycling sinnvoll?", "spart etwa <b>95 % Energie</b> gegenüber der Elektrolyse"), ("Welches Gas entsteht im Hochofen als Reduktionsmittel?", "<b>Kohlenstoffmonooxid CO</b>"),
             ("Gib die Hauptreaktion im Hochofen an.", "<b>Fe₂O₃ + 3 CO → 2 Fe + 3 CO₂</b>"), ("Kathodenreaktion bei der Aluminiumelektrolyse?", "<b>Al³⁺ + 3 e⁻ → Al</b>"),
             ("Anodenreaktion bei der Kupferraffination?", "<b>Cu → Cu²⁺ + 2 e⁻</b>"), ("Was ist Thermit?", "Gemisch aus <b>Eisenoxid und Aluminiumpulver</b>, liefert flüssiges Eisen"),
             ("Warum wird Kalk in den Hochofen gegeben?", "bindet die Gangart (SiO₂) zu <b>Schlacke</b>"), ("Welches Treibhausgas entsteht beim Hochofen?", "<b>CO₂</b>")]
    for q_, a_ in facts:
        add(1, q_, a_)

    ore_names = [("Hämatit", "Fe₂O₃", "Fe", "+III"), ("Magnetit", "Fe₃O₄", "Fe", "+II und +III"), ("Kupferglanz", "Cu₂S", "Cu", "+I"), ("Zinkblende", "ZnS", "Zn", "+II"), ("Bleiglanz", "PbS", "Pb", "+II"),
                 ("Bauxit (Hauptbestandteil)", "Al₂O₃", "Al", "+III"), ("Zinnstein", "SnO₂", "Sn", "+IV"), ("Siderit", "FeCO₃", "Fe", "+II"), ("Pyrit", "FeS₂", "Fe", "+II"), ("Cuprit", "Cu₂O", "Cu", "+I")]
    for n_, f_, met, oz in ore_names:
        add(1, f"Welche Oxidationszahl hat {met} im Erz {n_} ({f_})?", f"<b>{oz}</b>")
        add(1, f"Welches Metall gewinnt man aus {n_} ({f_})?", f"<b>{met}</b>")
    for ion_, n_, met in [("Al³⁺", 3, "Al"), ("Mg²⁺", 2, "Mg"), ("Na⁺", 1, "Na"), ("Cu²⁺", 2, "Cu"), ("Zn²⁺", 2, "Zn"), ("Ag⁺", 1, "Ag")]:
        add(1, f"Kathodenreaktion bei der Abscheidung von {met} aus {ion_}?", f"<b>{ion_} + {'' if n_ == 1 else n_} e⁻ → {met}</b> (Reduktion)")
    for f_, met, k, Mo in [("Fe₂O₃", "Fe", 2, 159.7), ("Al₂O₃", "Al", 2, 101.96), ("CuO", "Cu", 1, 79.55), ("ZnS", "Zn", 1, 97.44), ("Cu₂S", "Cu", 2, 159.16)]:
        add(1, f"Berechne die molare Masse von {f_}.", f"<b>{de(Mo, 2)} g/mol</b>")
    ores = [("Fe₂O₃", "Fe", 2, M["Fe"] * 2 + M["O"] * 3), ("Fe₃O₄", "Fe", 3, M["Fe"] * 3 + M["O"] * 4), ("Al₂O₃", "Al", 2, M["Al"] * 2 + M["O"] * 3),
            ("Cu₂S", "Cu", 2, M["Cu"] * 2 + M["S"]), ("ZnS", "Zn", 1, M["Zn"] + M["S"]), ("PbS", "Pb", 1, M["Pb"] + M["S"]), ("CuO", "Cu", 1, M["Cu"] + M["O"]), ("ZnO", "Zn", 1, M["Zn"] + M["O"])]
    for i in range(200):
        f, met, k, Mo = r.choice(ores)
        m = r.choice([50, 100, 160, 200, 250, 500, 1000])
        mm = m / Mo * k * M[met]
        if i % 2:
            add(2, f"Wie viel kg {met} lassen sich höchstens aus {m} kg {f} gewinnen?", f"M({f}) = {de(Mo, 2)} g/mol; n = {m} : {de(Mo, 2)} = {de(m / Mo, 3)} kmol; m({met}) = {k} · {de(m / Mo, 3)} · {de(M[met], 2)} = <b>{de(mm)} kg</b>")
        else:
            add(2, f"Massenanteil des Metalls in {f}?", f"{k} · {de(M[met], 2)} : {de(Mo, 2)} = <b>{de(k * M[met] / Mo * 100)} %</b>")
    eqs = [("Reduktion von Fe₃O₄ durch CO", "Fe₃O₄ + 4 CO → 3 Fe + 4 CO₂"), ("Boudouard-Reaktion", "CO₂ + C ⇌ 2 CO"), ("Rösten von Zinkblende ZnS", "2 ZnS + 3 O₂ → 2 ZnO + 2 SO₂"),
           ("Reduktion von ZnO mit Kohlenstoff", "ZnO + C → Zn + CO"), ("Thermitreaktion", "Fe₂O₃ + 2 Al → 2 Fe + Al₂O₃"), ("Bildung der Schlacke", "CaO + SiO₂ → CaSiO₃"),
           ("Kalkbrennen im Hochofen", "CaCO₃ → CaO + CO₂"), ("Gesamtgleichung der Aluminiumelektrolyse", "2 Al₂O₃ → 4 Al + 3 O₂"), ("Frischen (C im Roheisen)", "2 C + O₂ → 2 CO bzw. C + O₂ → CO₂"),
           ("Reduktion von Fe₂O₃ mit Wasserstoff (grüner Stahl)", "Fe₂O₃ + 3 H₂ → 2 Fe + 3 H₂O"), ("Anodenreaktion Aluminiumelektrolyse (Kohleanode)", "2 O²⁻ + C → CO₂ + 4 e⁻"), ("Röstreaktion Cu₂S", "2 Cu₂S + 3 O₂ → 2 Cu₂O + 2 SO₂")]
    for k_, e_ in eqs:
        add(2, f"Stelle die Reaktionsgleichung auf: {k_}. Kennzeichne Oxidation und Reduktion, falls es eine Redoxreaktion ist.", f"<b>{e_}</b>" + ("" if k_ in ("Bildung der Schlacke", "Kalkbrennen im Hochofen") else " (Redoxreaktion: OZ ändern sich)" if True else ""))
    calc3 = []
    for t in [1, 2, 5, 10]:
        nFe = t * 1e6 / M["Fe"]
        mCO2 = nFe * 1.5 * (M["C"] + 2 * M["O"]) / 1e6
        calc3.append((f"Wie viel CO₂ entsteht mindestens, wenn im Hochofen {t} t Eisen nach Fe₂O₃ + 3 CO → 2 Fe + 3 CO₂ gewonnen werden?", f"n(Fe) = {de(nFe / 1000, 1)} kmol; n(CO₂) = 1,5 · n(Fe) = {de(nFe * 1.5 / 1000, 1)} kmol; m = <b>{de(mCO2, 2)} t CO₂</b>"))
    for kg in [1, 5, 20]:
        calc3.append((f"Die Elektrolyse braucht etwa 13 kWh pro kg Aluminium, das Recycling 5 % davon. Wie viel Energie spart das Recycling von {kg} kg Aluminium?", f"Neu: {kg * 13} kWh, Recycling: {de(kg * 13 * 0.05, 2)} kWh ⇒ Ersparnis <b>{de(kg * 13 * 0.95, 2)} kWh</b>"))
    for m in [100, 500]:
        nAl2O3 = m * 1000 / (2 * M["Al"] + 3 * M["O"])
        calc3.append((f"Wie viel Bauxit (als reines Al₂O₃ gerechnet) braucht man für {m} kg Aluminium?", f"n(Al) = {de(m * 1000 / M['Al'], 0)} mol; n(Al₂O₃) = n(Al) : 2 = {de(m * 500 / M['Al'], 0)} mol; m = <b>{de(m * 500 / M['Al'] * (2 * M['Al'] + 3 * M['O']) / 1000, 1)} kg</b>"))
    for q_, a_ in calc3:
        add(3, q_, a_)
    fixed = [
        ("Erkläre, warum Eisen mit Kohlenstoff, Aluminium aber nur durch Elektrolyse gewonnen werden kann.", "Al ist viel <b>unedler</b> als Fe: Al³⁺ hält die Elektronen nicht freiwillig fest, C ist kein ausreichend starkes Reduktionsmittel. Strom liefert die Elektronen <b>erzwungen</b>."),
        ("Beschreibe den Weg des Eisenoxids im Hochofen von der Gicht bis zum Abstich.", "Vorwärmen und Trocknen in der Gicht; stufenweise <b>Reduktion</b> durch CO (Fe₂O₃ → Fe₃O₄ → FeO → Fe); <b>Kohlung</b>: Fe nimmt C auf, Schmelztemperatur sinkt; Schmelzen; Abstich als <b>Roheisen</b> unter der Schlacke."),
        ("Erkläre die Kupferraffination und warum Zink und Silber als Verunreinigungen unterschiedlich enden.", "Rohkupfer-Anode: Cu und <b>unedleres Zn</b> werden oxidiert und gehen in Lösung, an der Kathode scheidet sich nur Cu ab (Zn²⁺ bleibt gelöst). <b>Edleres Ag</b> wird nicht oxidiert und fällt als Anodenschlamm."),
        ("Warum werden bei der Aluminiumelektrolyse die Kohleanoden verbraucht?", "Der an der Anode entstehende <b>Sauerstoff</b> reagiert bei 950 °C mit dem Kohlenstoff zu <b>CO₂</b>; die Anoden müssen regelmäßig ersetzt werden."),
        ("Bewerte Wasserstoff als Reduktionsmittel für die Stahlherstellung.", "Vorteil: Produkt ist <b>Wasser statt CO₂</b>. Nachteil: Wasserstoff muss mit viel (möglichst erneuerbarem) Strom hergestellt werden; teurer, Infrastruktur nötig."),
        ("Warum sind Althandys eine wertvolle Rohstoffquelle?", "Sie enthalten Gold, Silber, Kupfer, Cobalt in <b>höherer Konzentration</b> als viele Erze (ca. 250 g Au pro t); Recycling spart Energie, Bergbauflächen und Abfall."),
        ("Begründe, warum Roheisen spröde ist und Stahl verformbar.", "Der hohe Kohlenstoffgehalt (≈ 4 %) bildet <b>Eisencarbid</b> und stört das Metallgitter; die Schichten können schlechter gleiten. Stahl enthält höchstens etwa 2 % C."),
        ("Warum wird im Hochofen CO und nicht der feste Koks als Hauptreduktionsmittel betrachtet?", "Feststoffe reagieren kaum miteinander. Das <b>gasförmige CO</b> durchströmt die Schüttung und erreicht jedes Erzkorn; Koks liefert Wärme und bildet ständig neues CO (Boudouard)."),
        ("Warum wird für die Aluminiumherstellung oft billiger Strom aus Wasserkraft genutzt?", "Die Schmelzflusselektrolyse braucht sehr viel <b>elektrische Energie</b> (ca. 13 kWh/kg); der Strompreis bestimmt die Kosten, Hütten stehen daher bei Wasserkraftwerken."),
        ("Begründe, warum man edle Metalle wie Gold manchmal gediegen findet, Natrium aber nie.", "Gold gibt Elektronen kaum ab und reagiert nicht mit Luft und Wasser. <b>Natrium</b> ist so unedel, dass es sofort mit Sauerstoff und Wasser reagiert; es kommt nur als <b>Na⁺</b> in Salzen vor."),
        ("Die Thermitreaktion ist stark exotherm. Was sagt das über die Stellung von Fe und Al in der Redoxreihe?", "Al ist <b>unedler</b> als Fe und gibt seine Elektronen bereitwillig an Fe³⁺ ab; Al₂O₃ ist sehr stabil, dabei wird viel Energie frei (flüssiges Eisen über 2000 °C)."),
        ("Warum muss das Aluminiumoxid vor der Elektrolyse geschmolzen oder gelöst sein?", "Im Feststoff sind die Ionen <b>unbeweglich</b>. Nur in der Schmelze können Al³⁺ zur Kathode und O²⁻ zur Anode wandern."),
        ("Berechne, wie viele Elektronen (in mol) für 1 kg Aluminium nötig sind.", "n(Al) = 1000 g : 26,98 g/mol = 37,1 mol; pro Al³⁺ 3 e⁻ ⇒ <b>111 mol Elektronen</b>."),
        ("Vergleiche Hochofen und Elektrolyse als Reduktionsverfahren.", "Hochofen: <b>chemisches Reduktionsmittel</b> (CO/C), sehr große Mengen, CO₂-Ausstoß. Elektrolyse: <b>Strom</b> als Elektronenquelle, für sehr unedle Metalle nötig, hoher Energiebedarf, dafür sehr rein."),
    ]
    for q_, a_ in fixed:
        add(3, q_, a_)
    r.shuffle(L[3])
    return L


def komplexverbindungen():
    r = random.Random(207)
    L = {1: [], 2: [], 3: []}
    seen = set()
    MET = [("Cu", 2, "kupfer", "cuprat"), ("Cu", 1, "kupfer", "cuprat"), ("Fe", 2, "eisen", "ferrat"), ("Fe", 3, "eisen", "ferrat"), ("Ag", 1, "silber", "argentat"), ("Zn", 2, "zink", "zinkat"),
           ("Co", 2, "cobalt", "cobaltat"), ("Co", 3, "cobalt", "cobaltat"), ("Ni", 2, "nickel", "nickelat"), ("Al", 3, "aluminium", "aluminat"), ("Cr", 3, "chrom", "chromat")]
    LIG = [("H2O", 0, "aqua"), ("NH3", 0, "ammin"), ("Cl", -1, "chlorido"), ("CN", -1, "cyanido"), ("OH", -1, "hydroxido"), ("F", -1, "fluorido"), ("SCN", -1, "thiocyanato"), ("S2O3", -2, "thiosulfato")]
    NUM = {2: "di", 4: "tetra", 6: "hexa"}
    ROM = ["0", "I", "II", "III"]
    sub = lambda f: re.sub(r"(\d+)", r"<sub>\1</sub>", f)

    def build(m, l, n):
        q = m[1] + n * l[1]
        lf = f"({sub(l[0])})<sub>{n}</sub>" if (len(l[0]) > 2 or re.search(r"\d", l[0])) else f"{sub(l[0])}<sub>{n}</sub>"
        name = (NUM[n] + l[2] + (m[3] if q < 0 else m[2])) + f"({ROM[m[1]]})"
        return q, f"[{m[0]}{lf}]{chg(q)}", name[0].upper() + name[1:] + ("" if q == 0 else "-Ion")

    def add(lvl, q, a):
        if q not in seen and len(L[lvl]) < 120:
            seen.add(q)
            L[lvl].append((q, a))
    for i in range(1500):
        m, l, n = r.choice(MET), r.choice(LIG), r.choice([2, 4, 6])
        if l[0] == "S2O3" and n > 2:
            continue
        q, f, name = build(m, l, n)
        t = i % 4
        if t == 0:
            add(1, f"Ladung des Komplexes aus {m[0]}{chg(m[1])} und {n} {sub(l[0])}{chg(l[1])}?", f"{m[1]} + {n}·({l[1]}) = <b>{q}</b>: {f}".replace("+-", "−").replace("(-", "(−"))
        elif t == 1:
            add(1, f"Koordinationszahl und Gestalt von {f}?", f"KZ <b>{n}</b>, {'linear' if n == 2 else 'tetraedrisch/quadratisch-planar' if n == 4 else 'oktaedrisch'}")
        elif t == 2:
            add(1, f"Oxidationszahl des Zentralions in {f}?", f"{q} − {n}·({l[1]}) = <b>+{ROM[m[1]]}</b>".replace("(-", "(−"))
        else:
            add(2, f"Benenne {f}.", f"<b>{name}</b>{' (Anion: Endung -at)' if q < 0 else ''}")
            add(2, f"Formel von {name}?", f"<b>{f}</b>; Ladung {m[1]} + {n}·({l[1]}) = {q}".replace("(-", "(−"))
    salts = [("K₃[Fe(CN)₆]", "Kaliumhexacyanidoferrat(III)", "Fe +III, Komplex 3−"), ("K₄[Fe(CN)₆]", "Kaliumhexacyanidoferrat(II)", "Fe +II, Komplex 4−"),
             ("[Cu(NH₃)₄]SO₄", "Tetraamminkupfer(II)-sulfat", "Cu +II, Komplex 2+"), ("[Ag(NH₃)₂]Cl", "Diamminsilber(I)-chlorid", "Ag +I, Komplex 1+"),
             ("Na₃[Ag(S₂O₃)₂]", "Natriumdithiosulfatoargentat(I)", "Ag +I, Komplex 3−"), ("Na[Al(OH)₄]", "Natriumtetrahydroxidoaluminat(III)", "Al +III, Komplex 1−"),
             ("[Co(NH₃)₆]Cl₃", "Hexaammincobalt(III)-chlorid", "Co +III, Komplex 3+"), ("K₂[Zn(OH)₄]", "Kaliumtetrahydroxidozinkat(II)", "Zn +II, Komplex 2−")]
    for f, n_, info in salts:
        add(2, f"Benenne das Komplexsalz {f} und bestimme die Oxidationszahl des Zentralions.", f"<b>{n_}</b>: {info}")
    exch = [("Kupfersulfatlösung (hellblau) + Ammoniak → tiefblau", "[Cu(H₂O)₄]²⁺ + 4 NH₃ ⇌ [Cu(NH₃)₄]²⁺ + 4 H₂O"),
            ("Eisen(III)-Lösung + Thiocyanat → blutrot", "[Fe(H₂O)₆]³⁺ + SCN⁻ ⇌ [Fe(SCN)(H₂O)₅]²⁺ + H₂O"),
            ("Silberchlorid löst sich in Ammoniakwasser", "AgCl + 2 NH₃ ⇌ [Ag(NH₃)₂]⁺ + Cl⁻"),
            ("Fixieren: Silberbromid löst sich in Thiosulfat", "AgBr + 2 S₂O₃²⁻ ⇌ [Ag(S₂O₃)₂]³⁻ + Br⁻"),
            ("Cobaltchlorid-Papier wird bei Feuchtigkeit rosa", "[CoCl₄]²⁻ (blau) + 6 H₂O ⇌ [Co(H₂O)₆]²⁺ (rosa) + 4 Cl⁻"),
            ("Zinkhydroxid löst sich in Natronlauge", "Zn(OH)₂ + 2 OH⁻ ⇌ [Zn(OH)₄]²⁻"),
            ("Aluminiumhydroxid löst sich in Natronlauge", "Al(OH)₃ + OH⁻ ⇌ [Al(OH)₄]⁻"),
            ("Kupfer(II)-chlorid-Lösung wird mit konz. Salzsäure gelbgrün", "[Cu(H₂O)₄]²⁺ + 4 Cl⁻ ⇌ [CuCl₄]²⁻ + 4 H₂O")]
    for k, e in exch:
        add(3, f"Formuliere die Gleichung des Ligandenaustauschs und benenne die Komplexe: {k}.", f"<b>{e}</b>")
    fixed = [
        ("Erkläre die koordinative Bindung am Beispiel [Cu(NH₃)₄]²⁺.", "Jedes NH₃ stellt sein <b>freies Elektronenpaar</b> am N-Atom zur Verfügung; Cu²⁺ hat freie Orbitale und nimmt es auf. Beide Bindungselektronen stammen vom Liganden (<b>Donor-Akzeptor-Bindung</b>)."),
        ("Warum können Ammoniak und Wasser Liganden sein, Methan aber nicht?", "NH₃ und H₂O besitzen <b>freie Elektronenpaare</b> (am N bzw. O). CH₄ hat alle Valenzelektronen in Bindungen, <b>kein freies Paar</b>."),
        ("Erkläre den Nachweis von Fe³⁺-Ionen mit Thiocyanat.", "SCN⁻ verdrängt H₂O-Liganden, es bildet sich der <b>blutrote</b> Komplex [Fe(SCN)(H₂O)₅]²⁺. Schon sehr geringe Konzentrationen sind sichtbar."),
        ("Beschreibe die Rolle von Komplexen beim Fixieren eines Schwarz-Weiß-Films.", "Unbelichtetes, schwer lösliches <b>AgBr</b> bleibt nach dem Entwickeln im Film. Thiosulfat bildet den <b>löslichen Komplex [Ag(S₂O₃)₂]³⁻</b>, der ausgewaschen wird; das Bild wird lichtunempfindlich."),
        ("Warum ist Kohlenstoffmonooxid giftig? Argumentiere mit Komplexen.", "CO bindet als Ligand <b>viel fester</b> an das Fe²⁺ des Hämoglobins als O₂ (etwa 200-mal). Die Bindungsstellen sind blockiert, der Sauerstofftransport bricht zusammen."),
        ("Ein Komplex [Co(NH₃)₅Cl]Cl₂: Bestimme Ladung, Oxidationszahl und Koordinationszahl.", "Gegenionen 2 Cl⁻ ⇒ Komplex <b>2+</b>; 5 · 0 + (−1) + x = +2 ⇒ <b>Co +III</b>; 6 Liganden: <b>KZ 6</b>, oktaedrisch."),
        ("Wie wirken Komplexbildner in Waschmitteln?", "Sie binden <b>Ca²⁺ und Mg²⁺</b> (Wasserhärte) in stabilen, löslichen Komplexen; so fällt kein Kalk aus und Tenside werden nicht gebunden."),
        ("Warum sind viele Komplexe farbig, Zn²⁺-Komplexe aber farblos?", "Farbe entsteht durch Elektronenübergänge in <b>teilweise besetzten d-Orbitalen</b>. Zn²⁺ hat [Ar] 3d¹⁰ (voll), deshalb keine Absorption im Sichtbaren."),
        ("Bestimme für K₃[Fe(CN)₆] und K₄[Fe(CN)₆] jeweils Komplexladung, Oxidationszahl des Eisens und die Elektronenkonfiguration des Zentralions.", "K₃[…]: Komplex 3−, <b>Fe +III</b> ([Ar] 3d⁵); K₄[…]: Komplex 4−, <b>Fe +II</b> ([Ar] 3d⁶). Beide KZ 6, oktaedrisch."),
        ("Zeichne den räumlichen Bau von [Ag(NH₃)₂]⁺ und [Zn(OH)₄]²⁻ und benenne beide.", "<b>Diamminsilber(I)-Ion</b>: linear (H₃N–Ag–NH₃); <b>Tetrahydroxidozinkat(II)-Ion</b>: tetraedrisch."),
        ("Warum löst sich Silberchlorid in Ammoniakwasser, aber nicht in reinem Wasser?", "Ammoniak bindet Ag⁺ als <b>[Ag(NH₃)₂]⁺</b>. Dadurch sinkt die Konzentration freier Ag⁺-Ionen, das Löslichkeitsgleichgewicht AgCl ⇌ Ag⁺ + Cl⁻ verschiebt sich nach rechts."),
        ("Ein Komplex hat die Formel [CrCl₂(H₂O)₄]⁺. Bestimme die Oxidationszahl des Chroms und benenne den Komplex.", "x + 2·(−1) + 0 = +1 ⇒ <b>Cr +III</b>; <b>Tetraaquadichloridochrom(III)-Ion</b> (Liganden alphabetisch: aqua vor chlorido)."),
        ("Erkläre, warum Cobaltchlorid-Papier als Feuchtigkeitsanzeiger dient.", "Trocken liegt der <b>blaue</b> [CoCl₄]²⁻-Komplex vor; mit Wasser tauschen die Liganden aus zum <b>rosa</b> [Co(H₂O)₆]²⁺. Der Farbwechsel zeigt Feuchtigkeit an."),
        ("Begründe, warum Komplexbildung eine Säure-Base-Reaktion nach Lewis ist.", "Das Zentralion ist <b>Elektronenpaar-Akzeptor</b> (Lewis-Säure), der Ligand <b>Elektronenpaar-Donator</b> (Lewis-Base)."),
        ("Was versteht man unter einem Chelatkomplex? Nenne ein Beispiel.", "Ein Ligand bindet mit <b>mehreren freien Elektronenpaaren</b> gleichzeitig an dasselbe Zentralion (Zange), z. B. EDTA mit Ca²⁺; besonders stabile Komplexe."),
        ("Wie kann man Eisen(III)-Ionen in einer Probe Leitungswasser nachweisen? Beschreibe Durchführung und Beobachtung.", "Probe ansäuern, Kaliumthiocyanat-Lösung zugeben: <b>Rotfärbung</b> zeigt Fe³⁺ an ([Fe(SCN)(H₂O)₅]²⁺)."),
    ]
    for q_, a_ in fixed:
        add(3, q_, a_)
    r.shuffle(L[3])
    return L


def reaktionsgeschwindigkeit():
    r = random.Random(208)
    L = {1: [], 2: [], 3: []}
    seen = set()
    de = lambda v, n=3: (f"{v:.{n}f}".rstrip("0").rstrip(".") if "." in f"{v:.{n}f}" else f"{v:.{n}f}").replace(".", ",")

    def add(lvl, q, a):
        if q not in seen and len(L[lvl]) < 120:
            seen.add(q)
            L[lvl].append((q, a))
    for i in range(1500):
        t = i % 4
        if t == 0:
            c1 = r.randint(6, 20) / 10
            dc = r.randint(1, int(c1 * 10) - 2) / 10
            dt = r.choice([10, 20, 25, 40, 50, 100])
            add(1, f"c(A) sinkt in {dt} s von {de(c1, 1)} auf {de(c1 - dc, 1)} mol/L. Mittlere Reaktionsgeschwindigkeit?", f"v = −Δc/Δt = −({de(c1 - dc, 1)} − {de(c1, 1)}) : {dt} = {de(dc, 1)} : {dt} = <b>{de(dc / dt, 4)} mol/(L·s)</b>")
        elif t == 1:
            dT = r.choice([10, 20, 30, 40])
            add(1, f"Um welchen Faktor steigt v nach der RGT-Regel, wenn T um {dT} K erhöht wird?", f"je 10 K Faktor 2: 2<sup>{dT // 10}</sup> = <b>{2 ** (dT // 10)}</b>, die Reaktion ist {2 ** (dT // 10)}-mal so schnell")
        elif t == 2:
            V, tt = r.choice([10, 20, 30, 40, 50, 60]), r.choice([5, 10, 20, 30])
            add(1, f"In {tt} s entstehen {V} mL Gas. Mittlere Bildungsgeschwindigkeit?", f"v = ΔV/Δt = {V} mL : {tt} s = <b>{de(V / tt, 2)} mL/s</b>")
        else:
            q_, a_ = r.choice([("Wie ändert sich v, wenn ein Stück Marmor durch Marmorpulver ersetzt wird?", "<b>schneller</b>: größere Oberfläche"), ("Wie ändert sich v beim Verdünnen der Säure?", "<b>langsamer</b>: weniger Stöße"),
                               ("Was senkt ein Katalysator?", "die <b>Aktivierungsenergie</b>"), ("Wird ein Katalysator verbraucht?", "<b>nein</b>, er liegt nach der Reaktion unverändert vor"),
                               ("Nenne drei Bedingungen für einen wirksamen Stoß.", "Teilchen <b>stoßen zusammen</b>, mit <b>E ≥ Eₐ</b>, in <b>passender Ausrichtung</b>"), ("Wie misst man v bei Mg + HCl?", "<b>Volumen des Wasserstoffs</b> über die Zeit (Kolbenprober)"),
                               ("Wie misst man v bei CaCO₃ + HCl?", "<b>Massenverlust</b> durch entweichendes CO₂ (Waage)"), ("Wann ist v meist am größten?", "<b>zu Beginn</b>, bei höchster Eduktkonzentration"),
                               ("Ändert ein Katalysator ΔH?", "<b>nein</b>, nur Eₐ"), ("Was ist ein Enzym?", "ein <b>Biokatalysator</b> (Protein)"), ("Warum lagert man Lebensmittel kühl?", "Verderbnisreaktionen laufen <b>langsamer</b> (RGT-Regel)"),
                               ("Wie heißt der Katalysator für die Zersetzung von H₂O₂ im Schulversuch?", "<b>Braunstein MnO₂</b>")])
            add(1, q_, a_)
    for i in range(1500):
        t = i % 4
        if t == 0:
            # gas volume table, two intervals
            k = r.choice([0.05, 0.08, 0.1])
            Vm = r.choice([40, 50, 60, 80])
            ts = [0, 10, 20, 30, 40]
            Vs = [round(Vm * (1 - math.exp(-k * x))) for x in ts]
            add(2, f"Gasvolumen (mL) bei t = 0, 10, 20, 30, 40 s: {', '.join(map(str, Vs))}. Berechne v in den Intervallen 0–10 s und 30–40 s und erkläre den Unterschied.", f"{de((Vs[1] - Vs[0]) / 10, 2)} mL/s bzw. {de((Vs[4] - Vs[3]) / 10, 2)} mL/s: <b>v nimmt ab</b>, weil die Eduktkonzentration sinkt.")
        elif t == 1:
            c0, f = r.choice([0.1, 0.2, 0.5]), r.choice([2, 3, 4])
            v0 = r.choice([0.002, 0.005, 0.01, 0.02])
            add(2, f"Bei c₀ = {de(c0, 1)} mol/L beträgt v₀ = {de(v0, 3)} mol/(L·s). Wie groß ist v₀ bei {de(c0 * f, 1)} mol/L, wenn v proportional zu c ist?", f"c · {f} ⇒ v · {f}: <b>{de(v0 * f, 3)} mol/(L·s)</b>")
        elif t == 2:
            tmin, dT = r.choice([20, 40, 60, 80, 120]), r.choice([10, 20, 30])
            up = r.random() < 0.6
            f = 2 ** (dT // 10)
            add(2, f"Eine Reaktion dauert bei 20 °C {tmin} min. Wie lange dauert sie etwa bei {20 + dT if up else 20 - dT} °C?", f"Geschwindigkeit {'· ' + str(f) if up else ': ' + str(f)} ⇒ Zeit {': ' + str(f) if up else '· ' + str(f)} = <b>{de(tmin / f if up else tmin * f, 1)} min</b>")
        else:
            q_, a_ = r.choice([("Zeichne ein Energiediagramm einer exothermen Reaktion mit und ohne Katalysator.", "Edukte höher als Produkte (ΔH < 0); katalysierter Weg mit <b>niedrigerem Maximum</b>, gleiche Anfangs- und Endniveaus"),
                               ("Erkläre mit der Stoßtheorie, warum Temperaturerhöhung stärker wirkt als nur die Zahl der Stöße vermuten lässt.", "Bei höherer T haben <b>überproportional viele Teilchen E ≥ Eₐ</b>; die Zahl wirksamer Stöße steigt stark, nicht nur die Stoßzahl."),
                               ("Unterscheide mittlere und momentane Reaktionsgeschwindigkeit.", "Mittlere: Steigung der <b>Sekante</b> zwischen zwei Zeitpunkten; momentane: Steigung der <b>Tangente</b> in einem Punkt."),
                               ("Warum wird beim Abgaskatalysator Platin fein auf einem Keramikträger verteilt?", "<b>Große Oberfläche</b> bei wenig teurem Edelmetall; heterogene Katalyse findet an der Oberfläche statt."),
                               ("Unterscheide homogene und heterogene Katalyse mit Beispielen.", "Homogen: Katalysator in derselben Phase (H⁺ bei der Esterbildung); heterogen: andere Phase (Pt im Abgaskatalysator, Fe bei der NH₃-Synthese)."),
                               ("Erkläre, warum Fieber über 42 °C gefährlich ist.", "Enzyme <b>denaturieren</b>, ihre Struktur und Wirkung gehen verloren; Stoffwechselreaktionen laufen nicht mehr ab.")])
            add(2, q_, a_)
    fixed = [
        ("Plane ein Experiment, mit dem man den Einfluss der Säurekonzentration auf die Reaktion von Magnesium mit Salzsäure untersucht. Was muss konstant bleiben?", "Gleiche Mg-Bänder, gleiche Temperatur und Säurevolumen; nur c(HCl) variieren (z. B. 0,5/1/2 mol/L); <b>Wasserstoffvolumen</b> im Kolbenprober über die Zeit messen; Anfangsgeschwindigkeiten vergleichen."),
        ("Die Halbwertszeit einer Reaktion 1. Ordnung beträgt bei 25 °C 60 s. Schätze sie für 45 °C mit der RGT-Regel.", "+20 K ⇒ v · 4 ⇒ Halbwertszeit : 4 = <b>15 s</b>."),
        ("Begründe, warum eine Kerze an der Luft nicht von selbst brennt, obwohl die Reaktion exotherm ist.", "Die <b>Aktivierungsenergie</b> ist zu hoch; erst die Flamme des Streichholzes liefert sie, danach hält die frei werdende Wärme die Reaktion in Gang."),
        ("Warum ist ein Katalysator für die Industrie so wertvoll, obwohl er die Ausbeute im Gleichgewicht nicht erhöht?", "Das Gleichgewicht stellt sich <b>schneller</b> und bei <b>niedrigerer Temperatur</b> ein: Zeit- und Energieersparnis, kleinere Anlagen, oft bessere Ausbeute bei Gleichgewichten, die bei niedriger T günstiger liegen."),
        ("Erkläre, warum Kohlenstaub explosiv sein kann, ein Kohlestück aber nur langsam brennt.", "Feiner Staub hat eine <b>riesige Oberfläche</b>; sehr viele Teilchen reagieren gleichzeitig, die Wärme wird schlagartig frei."),
        ("Bei 20 °C entstehen in der ersten Minute 30 mL CO₂, bei 30 °C 58 mL. Prüfe, ob die RGT-Regel gilt.", "58 : 30 ≈ <b>1,9</b>, also etwa Verdopplung bei +10 K: Die RGT-Regel ist erfüllt."),
        ("Warum verlaufen Reaktionen in Lösung meist schneller als zwischen Feststoffen?", "In Lösung sind die Teilchen <b>beweglich</b> und fein verteilt; Feststoffe berühren sich nur an der Oberfläche."),
        ("Erkläre am Energiediagramm, warum ein Katalysator Hin- und Rückreaktion gleichermaßen beschleunigt.", "Er senkt den gemeinsamen <b>Energieberg</b> (Übergangszustand) für beide Richtungen um denselben Betrag; die Lage des Gleichgewichts bleibt gleich."),
        ("Wie lange braucht eine Reaktion, die bei 60 °C 30 s dauert, ungefähr bei 20 °C?", "−40 K ⇒ v : 2⁴ = : 16 ⇒ Zeit · 16 = <b>480 s = 8 min</b>."),
        ("Beschreibe zwei Messverfahren für die Reaktionsgeschwindigkeit, wenn kein Gas entsteht.", "<b>Fotometrie</b> (Farbintensität, z. B. Iod), <b>Leitfähigkeitsmessung</b> (Ionenkonzentration), Trübungsmessung (Thiosulfat + Säure: Schwefel)."),
        ("Warum werden Lebensmittel durch Einfrieren auf −18 °C lange haltbar?", "Gegenüber 22 °C ist das 40 K kälter: v sinkt nach RGT etwa auf <b>1/16</b>; außerdem ist Wasser gefroren, Mikroorganismen und Enzyme arbeiten kaum."),
        ("Erkläre die Wirkungsweise eines Enzyms mit dem Schlüssel-Schloss-Prinzip.", "Das Substrat passt in das <b>aktive Zentrum</b>; dort wird es so gebunden, dass die Aktivierungsenergie sinkt; das Enzym geht unverändert aus der Reaktion hervor."),
        ("Skizziere den zeitlichen Verlauf von c(Edukt) und c(Produkt) einer vollständig ablaufenden Reaktion A → B und begründe die Kurvenform.", "c(A) fällt zuerst steil, dann immer flacher gegen 0; c(B) steigt spiegelbildlich. Die Steigung (v) nimmt ab, weil <b>weniger Edukt-Teilchen</b> für Stöße vorhanden sind."),
        ("Warum muss man bei Messungen der Reaktionsgeschwindigkeit die Temperatur konstant halten?", "Schon wenige Kelvin ändern v deutlich (RGT-Regel); sonst wären Unterschiede nicht eindeutig einem anderen Faktor zuzuordnen (<b>Variablenkontrolle</b>)."),
        ("Erkläre, warum Wasserstoff und Sauerstoff bei Raumtemperatur jahrelang nebeneinander bestehen können, mit Platinpulver aber sofort reagieren.", "Die Knallgasreaktion hat eine hohe <b>Aktivierungsenergie</b>; Platin als Katalysator senkt sie so weit, dass bereits bei Raumtemperatur viele Stöße wirksam sind."),
        ("Eine Reaktion hat bei c = 0,5 mol/L die Anfangsgeschwindigkeit 0,01 mol/(L·s), bei c = 1 mol/L 0,04 mol/(L·s). Welcher Zusammenhang besteht?", "Doppelte Konzentration, vierfache Geschwindigkeit: <b>v ~ c²</b> (Reaktion 2. Ordnung bezüglich dieses Stoffes)."),
    ]
    for q_, a_ in fixed:
        add(3, q_, a_)
    for tmin, Tf, Tt in [(40, 20, 50), (90, 25, 45), (12, 60, 30), (256, 10, 50)]:
        f = 2 ** ((Tt - Tf) / 10)
        add(3, f"Eine Reaktion dauert bei {Tf} °C {tmin} min. Wie lange dauert sie nach der RGT-Regel bei {Tt} °C? Wie zuverlässig ist diese Abschätzung?", f"Faktor 2<sup>{(Tt - Tf) // 10}</sup> = {de(f, 3)} ⇒ <b>{de(tmin / f, 1)} min</b>. Nur eine <b>Faustregel</b>; der Faktor liegt real meist zwischen 2 und 4.")
    r.shuffle(L[3])
    return L


def chemisches_gleichgewicht():
    r = random.Random(209)
    L = {1: [], 2: [], 3: []}
    seen = set()
    RX = [("N₂ + 3 H₂ ⇌ 2 NH₃", -1, 4, 2), ("2 SO₂ + O₂ ⇌ 2 SO₃", -1, 3, 2), ("N₂O₄ ⇌ 2 NO₂", 1, 1, 2), ("CO + H₂O(g) ⇌ CO₂ + H₂", -1, 2, 2), ("N₂ + O₂ ⇌ 2 NO", 1, 2, 2),
          ("CaCO₃(s) ⇌ CaO(s) + CO₂(g)", 1, 0, 1), ("C(s) + CO₂ ⇌ 2 CO", 1, 1, 2), ("PCl₅ ⇌ PCl₃ + Cl₂", 1, 1, 2), ("2 NO + O₂ ⇌ 2 NO₂", -1, 3, 2), ("H₂ + I₂(g) ⇌ 2 HI", -1, 2, 2),
          ("CH₄ + H₂O(g) ⇌ CO + 3 H₂", 1, 2, 4), ("2 H₂ + CO ⇌ CH₃OH(g)", -1, 3, 1)]
    D = {"T+": "Temperaturerhöhung", "T-": "Temperatursenkung", "p+": "Druckerhöhung", "p-": "Drucksenkung", "addE": "Zugabe eines Edukts", "remP": "Entfernen eines Produkts", "addP": "Zugabe eines Produkts", "kat": "Zugabe eines Katalysators"}

    def ans(rx, d):
        _, dh, gl, gr = rx
        if d == "kat":
            return "keine Verschiebung", "Katalysator beschleunigt Hin- und Rückreaktion gleich"
        if d in ("addE", "remP"):
            return "nach rechts", "Edukt wird verbraucht bzw. Produkt nachgebildet"
        if d == "addP":
            return "nach links", "Produkt wird verbraucht"
        if d in ("T+", "T-"):
            right = (dh > 0) if d == "T+" else (dh < 0)
            return ("nach rechts" if right else "nach links"), f"Hinreaktion {'exotherm' if dh < 0 else 'endotherm'}; {'Wärme begünstigt die endotherme' if d == 'T+' else 'Kälte begünstigt die exotherme'} Richtung"
        if gl == gr:
            return "keine Verschiebung", f"gleich viele Gasteilchen ({gl})"
        right = (gr < gl) if d == "p+" else (gr > gl)
        return ("nach rechts" if right else "nach links"), f"Gasteilchen {gl} → {gr}; {'weniger' if d == 'p+' else 'mehr'} Gasteilchen bevorzugt"

    def add(lvl, q, a):
        if q not in seen and len(L[lvl]) < 120:
            seen.add(q)
            L[lvl].append((q, a))
    for rx in RX:
        for d in D:
            a, why = ans(rx, d)
            lvl = 1 if d in ("addE", "remP", "addP", "kat", "T+", "T-") else 2
            add(lvl, f"{rx[0]}, ΔH {'< 0' if rx[1] < 0 else '> 0'}: {D[d]}. Verschiebung?", f"<b>{a}</b> ({why})")

    for rx in RX:
        for d1, d2 in [("p+", "T-"), ("p+", "T+"), ("p-", "T+"), ("remP", "T+")]:
            a1, _ = ans(rx, d1)
            a2, _ = ans(rx, d2)
            dirs = {a1, a2} - {"keine Verschiebung"}
            res = "nicht eindeutig (Wirkungen entgegengesetzt; nur mit K berechenbar)" if len(dirs) == 2 else (dirs.pop() if dirs else "keine Verschiebung")
            add(2, f"{rx[0]} (ΔH {'< 0' if rx[1] < 0 else '> 0'}): gleichzeitig {D[d1]} und {D[d2]}. Wirkung auf die Produktmenge?", f"{D[d1]}: {a1}; {D[d2]}: {a2} ⇒ <b>{res}</b>")
    facts = [("Was bedeutet „dynamisches“ Gleichgewicht?", "Hin- und Rückreaktion laufen <b>weiter, gleich schnell</b>; Konzentrationen bleiben konstant"),
             ("Welche Voraussetzung braucht ein Gleichgewicht?", "ein <b>geschlossenes System</b>"), ("Sind im Gleichgewicht alle Konzentrationen gleich?", "<b>nein</b>, sie sind nur konstant"),
             ("Wie lautet das Prinzip von Le Chatelier?", "Ein Zwang verschiebt das Gleichgewicht so, dass der <b>Zwang verringert</b> wird"), ("Was bewirkt ein Katalysator im Gleichgewicht?", "schnellere <b>Einstellung</b>, keine Verschiebung"),
             ("Welches Zeichen kennzeichnet eine Gleichgewichtsreaktion?", "den <b>Doppelpfeil ⇌</b>"), ("Kann sich ein Gleichgewicht von beiden Seiten einstellen?", "<b>ja</b>, aus Edukten und aus Produkten"),
             ("Welche Stoffe zählen beim Druckeinfluss?", "nur <b>Gase</b>"), ("Was passiert beim Öffnen einer Sprudelflasche?", "Druck sinkt: CO₂(aq) → CO₂(g), es <b>perlt aus</b>"),
             ("Bei welcher Temperatur arbeitet das Haber-Bosch-Verfahren etwa?", "etwa <b>450 °C</b>, 200–300 bar, Fe-Katalysator")]
    for q_, a_ in facts:
        add(1, q_, a_)
    for rx in RX:
        if rx[2] != rx[3]:
            hi = "hoher" if rx[3] < rx[2] else "niedriger"
            tt = "niedrige" if rx[1] < 0 else "hohe"
            add(2, f"Welche Bedingungen (Druck, Temperatur) ergeben bei {rx[0]} (ΔH {'< 0' if rx[1] < 0 else '> 0'}) eine hohe Produktausbeute?", f"<b>{hi} Druck</b> ({rx[2]} → {rx[3]} Gasteilchen) und <b>{tt} Temperatur</b> ({'exotherm' if rx[1] < 0 else 'endotherm'})")
    fixed = [
        ("Begründe, warum beim Haber-Bosch-Verfahren nicht bei 200 °C gearbeitet wird, obwohl dort über 80 % NH₃ im Gleichgewicht vorlägen.", "Bei 200 °C ist die Reaktion selbst mit Katalysator <b>viel zu langsam</b>. 450 °C sind ein <b>Kompromiss</b> aus akzeptabler Ausbeute und Geschwindigkeit; NH₃ wird herausgekühlt, das Restgas zurückgeführt."),
        ("Erkläre die Bildung von Tropfsteinen mit dem Gleichgewicht CaCO₃ + CO₂ + H₂O ⇌ Ca²⁺ + 2 HCO₃⁻.", "Im Boden nimmt Sickerwasser viel CO₂ auf und löst Kalk (nach rechts). In der Höhle <b>entweicht CO₂</b> aus dem Tropfen: Das Gleichgewicht verschiebt sich nach links, <b>CaCO₃ fällt aus</b>."),
        ("Beschreibe den Versuch mit NO₂/N₂O₄ im Kolbenprober beim schnellen Zusammendrücken und erkläre die Beobachtungen.", "Zuerst wird das Gas <b>dunkler</b> (gleiche Teilchen, kleineres Volumen, höhere Konzentration), dann <b>heller</b>: Das Gleichgewicht verschiebt sich zum farblosen N₂O₄ (weniger Gasteilchen)."),
        ("Erkläre den Sauerstofftransport im Blut mit Hb + O₂ ⇌ HbO₂.", "In der Lunge hohe O₂-Konzentration: Verschiebung <b>nach rechts</b>, O₂ wird gebunden. Im Gewebe niedrige O₂-Konzentration: <b>nach links</b>, O₂ wird abgegeben."),
        ("Warum führt man die Veresterung Säure + Alkohol ⇌ Ester + Wasser oft unter Entfernen des Wassers durch?", "Das Entfernen eines Produkts verschiebt das Gleichgewicht <b>nach rechts</b>; die Esterausbeute steigt über den Gleichgewichtswert hinaus."),
        ("Ein Gleichgewicht stellt sich ohne Katalysator in 2 h, mit Katalysator in 5 min ein. Vergleiche die Gleichgewichtszusammensetzungen.", "<b>Gleich</b>: Der Katalysator senkt die Aktivierungsenergie beider Richtungen gleich; er verkürzt nur die Zeit bis zum Gleichgewicht."),
        ("Erkläre am Modell der zwei Aquarien, warum im Gleichgewicht weiter Wasser transportiert wird, die Pegel aber konstant bleiben.", "Pro Durchgang wird in beide Richtungen <b>gleich viel</b> geschöpft (v hin = v rück); die Mengen ändern sich nicht, obwohl der Austausch weiterläuft."),
        ("Warum gelten Ozeane als CO₂-Speicher und warum versauern sie?", "CO₂(g) ⇌ CO₂(aq) und CO₂ + H₂O ⇌ H⁺ + HCO₃⁻: Steigender CO₂-Gehalt der Luft verschiebt die Gleichgewichte nach rechts; mehr H⁺: <b>pH sinkt</b>, Kalkschalen werden schlechter gebildet."),
        ("Beim Kalkbrennen CaCO₃ ⇌ CaO + CO₂ (endotherm) arbeitet man bei 900 °C im offenen Ofen. Begründe beide Bedingungen.", "Hohe Temperatur begünstigt die <b>endotherme</b> Zersetzung; im offenen Ofen <b>entweicht CO₂</b> laufend (kein Gleichgewicht), der Kalk wird vollständig gebrannt."),
        ("Erkläre, warum Le Chatelier vorhersagt, in welche Richtung, aber nicht wie weit sich ein Gleichgewicht verschiebt.", "Das Prinzip ist <b>qualitativ</b>; das Ausmaß folgt aus der Gleichgewichtskonstante K (<b>Massenwirkungsgesetz</b>) und hängt von den Zahlenwerten ab."),
        ("Welche Wirkung hat eine Temperaturerhöhung auf die Gleichgewichtskonstante einer exothermen Reaktion?", "K <b>sinkt</b>: Die Produkte werden im Gleichgewicht weniger begünstigt."),
        ("Nenne drei Maßnahmen der Ammoniakfabrik, mit denen sie die Ausbeute pro Zeit erhöht, und ordne sie Le Chatelier bzw. Kinetik zu.", "<b>Hoher Druck</b> (Le Chatelier), <b>NH₃ herauskühlen und Kreislauf</b> (Le Chatelier, Produkt entfernen), <b>Eisenkatalysator und 450 °C</b> (Kinetik, schnelle Einstellung)."),
        ("Nutze die Tabelle: Bei 300 bar liegen bei 400 °C 47 % NH₃, bei 500 °C 26,4 % NH₃ vor. Erkläre den Unterschied und warum die Industrie trotzdem bei etwa 450 °C arbeitet.", "Die Bildung ist <b>exotherm</b>: Höhere T verschiebt nach links. Bei niedrigerer T ist die Ausbeute höher, die Reaktion aber <b>zu langsam</b>; 450 °C ist der Kompromiss."),
        ("Bei der Synthese von Methanol 2 H₂ + CO ⇌ CH₃OH(g) (exotherm): Welche Bedingungen wählst du? Begründe.", "<b>Hoher Druck</b> (3 → 1 Gasteilchen), möglichst <b>niedrige Temperatur</b> (exotherm) mit Katalysator für ausreichende Geschwindigkeit, Methanol abtrennen."),
        ("Zeichne qualitativ den Verlauf von v(hin) und v(rück) gegen die Zeit, wenn man mit reinen Edukten startet.", "v(hin) startet hoch und <b>fällt</b>, v(rück) startet bei 0 und <b>steigt</b>; beide Kurven laufen auf denselben Wert zu: Gleichgewicht."),
        ("Warum stellt sich beim Kalkbrennen im offenen Ofen kein Gleichgewicht ein?", "Das gasförmige CO₂ <b>entweicht</b>; das System ist offen, die Rückreaktion findet praktisch nicht statt, die Zersetzung läuft vollständig ab."),
        ("Ein Glas Mineralwasser wird erwärmt. Erkläre mit dem Gleichgewicht CO₂(g) ⇌ CO₂(aq), was passiert.", "Die Löslichkeit von Gasen <b>sinkt mit steigender Temperatur</b> (Lösen ist exotherm): Das Gleichgewicht verschiebt sich nach links, CO₂ perlt aus."),
        ("Wie kann man experimentell zeigen, dass ein Gleichgewicht dynamisch ist?", "Mit <b>Isotopen-Markierung</b>: Gibt man z. B. radioaktives ¹⁴CO₂ zu einem CaCO₃/CO₂-Gleichgewicht, findet man später ¹⁴C auch im festen CaCO₃, obwohl sich die Mengen nicht ändern."),
        ("Erkläre den Unterschied zwischen einer vollständig ablaufenden Reaktion und einer Gleichgewichtsreaktion an je einem Beispiel.", "Vollständig: z. B. Verbrennung von Methan an offener Luft (Produkte entweichen, Rückreaktion vernachlässigbar). Gleichgewicht: z. B. Veresterung im geschlossenen Kolben (Edukte und Produkte liegen nebeneinander vor)."),
        ("Bei der Kontaktverfahren-Reaktion 2 SO₂ + O₂ ⇌ 2 SO₃ (exotherm) setzt man Luft im Überschuss ein. Warum?", "Ein <b>Edukt im Überschuss</b> verschiebt das Gleichgewicht nach rechts; das teure SO₂ wird möglichst vollständig umgesetzt."),
    ]
    for q_, a_ in fixed:
        add(3, q_, a_)
    r.shuffle(L[3])
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
    "zufallsexperimente": ({"title": "Zufallsexperimente und Häufigkeiten", "eyebrow": "Mathematik · Klasse 8", "accent": M8, "cols": [2, 2, 1], "sol_cols": [2, 2, 1]}, zufallsexperimente),
    "laplace": ({"title": "Laplace-Experimente und Anzahlen", "eyebrow": "Mathematik · Klasse 8", "accent": M8, "cols": [2, 2, 1], "sol_cols": [3, 2, 1]}, laplace),
    "baumdiagramme": ({"title": "Baumdiagramme und Pfadregeln", "eyebrow": "Mathematik · Klasse 8", "accent": M8, "cols": [2, 2, 1], "sol_cols": [3, 2, 2]}, baumdiagramme),
    "unabhaengige-ereignisse": ({"title": "Unabhängige Ereignisse", "eyebrow": "Mathematik · Klasse 8", "accent": M8, "cols": [2, 2, 1], "sol_cols": [2, 2, 1]}, unabhaengig),
    "funktionsbegriff": ({"title": "Funktionsbegriff und Darstellungen", "eyebrow": "Mathematik · Klasse 8", "accent": M8, "cols": [3, 2, 1], "sol_cols": [3, 2, 1]}, funktionsbegriff),
    "eigenschaften-funktionen": ({"title": "Eigenschaften von Funktionen", "eyebrow": "Mathematik · Klasse 8", "accent": M8, "cols": [2, 2, 1], "sol_cols": [3, 2, 1]}, eigenschaften),
    "lineare-funktionen": ({"title": "Lineare Funktionen", "eyebrow": "Mathematik · Klasse 8", "accent": M8, "cols": [2, 2, 1], "sol_cols": [2, 3, 1]}, lineare_funktionen),
    "funktionsgleichungen": ({"title": "Funktionsgleichungen bestimmen", "eyebrow": "Mathematik · Klasse 8", "accent": M8, "cols": [2, 2, 1], "sol_cols": [2, 3, 1]}, funktionsgleichungen),
    "lgs-grafisch": ({"title": "Gleichungen mit zwei Variablen und LGS", "eyebrow": "Mathematik · Klasse 8", "accent": M8, "cols": [2, 2, 1], "sol_cols": [2, 2, 1]}, lgs_grafisch),
    "gleichsetzungsverfahren": ({"title": "Gleichsetzungs- und Einsetzungsverfahren", "eyebrow": "Mathematik · Klasse 8", "accent": M8, "cols": [2, 2, 1], "sol_cols": [2, 2, 1]}, gleichsetzungsverfahren),
    "additionsverfahren": ({"title": "Additionsverfahren", "eyebrow": "Mathematik · Klasse 8", "accent": M8, "cols": [2, 2, 1], "sol_cols": [2, 2, 1]}, additionsverfahren),
    "lgs-anwendungen": ({"title": "Anwendungen linearer Gleichungssysteme", "eyebrow": "Mathematik · Klasse 8", "accent": M8, "cols": [2, 1, 1], "sol_cols": [2, 1, 1]}, lgs_anwendungen),
    "zentrische-streckung": ({"title": "Ähnliche Figuren und zentrische Streckung", "eyebrow": "Mathematik · Klasse 8", "accent": M8, "cols": [2, 2, 1], "sol_cols": [2, 2, 1]}, zentrische_streckung),
    "aehnliche-dreiecke": ({"title": "Ähnliche Dreiecke", "eyebrow": "Mathematik · Klasse 8", "accent": M8, "cols": [2, 1, 1], "sol_cols": [2, 1, 1]}, aehnliche_dreiecke),
    "flaeche-volumen-aehnlich": ({"title": "Flächen und Volumen ähnlicher Figuren", "eyebrow": "Mathematik · Klasse 8", "accent": M8, "cols": [2, 1, 1], "sol_cols": [2, 1, 1]}, flaeche_volumen_aehnlich),
    "strahlensaetze": ({"title": "Strahlensätze", "eyebrow": "Mathematik · Klasse 8", "accent": M8, "cols": [2, 2, 1], "sol_cols": [2, 2, 1]}, strahlensaetze),
    "atombau": ({"title": "Atombau und Schalenmodell", "eyebrow": "Chemie · Klasse 11", "accent": "#6a3fa0", "cols": [2, 2, 1], "sol_cols": [2, 2, 1]}, atombau),
    "periodensystem": ({"title": "Periodensystem, Atombau und Eigenschaften", "eyebrow": "Chemie · Klasse 11", "accent": "#6a3fa0", "cols": [2, 2, 1], "sol_cols": [2, 2, 1]}, periodensystem),
    "stoffklassen": ({"title": "Stoffklassen", "eyebrow": "Chemie · Klasse 11", "accent": "#6a3fa0", "cols": [2, 1, 1], "sol_cols": [2, 1, 1]}, stoffklassen),
    "orbitalmodell": ({"title": "Orbitalmodell und Elektronenkonfiguration", "eyebrow": "Chemie · Klasse 11", "accent": "#6a3fa0", "cols": [2, 2, 1], "sol_cols": [2, 2, 1]}, orbitalmodell),
    "redoxreaktionen": ({"title": "Redoxreaktionen und Oxidationszahlen", "eyebrow": "Chemie · Klasse 11", "accent": "#6a3fa0", "cols": [2, 1, 1], "sol_cols": [2, 1, 1]}, redoxreaktionen),
    "gebrauchsmetalle": ({"title": "Gebrauchsmetalle", "eyebrow": "Chemie · Klasse 11", "accent": "#6a3fa0", "cols": [2, 1, 1], "sol_cols": [2, 1, 1]}, gebrauchsmetalle),
    "komplexverbindungen": ({"title": "Komplexverbindungen", "eyebrow": "Chemie · Klasse 11 · Wahlpflicht", "accent": "#6a3fa0", "cols": [2, 2, 1], "sol_cols": [2, 2, 1]}, komplexverbindungen),
    "reaktionsgeschwindigkeit": ({"title": "Reaktionsgeschwindigkeit und Katalysatoren", "eyebrow": "Chemie · Klasse 11", "accent": "#6a3fa0", "cols": [2, 1, 1], "sol_cols": [2, 1, 1]}, reaktionsgeschwindigkeit),
    "chemisches-gleichgewicht": ({"title": "Chemisches Gleichgewicht und Le Chatelier", "eyebrow": "Chemie · Klasse 11", "accent": "#6a3fa0", "cols": [2, 2, 1], "sol_cols": [2, 2, 1]}, chemisches_gleichgewicht),
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
