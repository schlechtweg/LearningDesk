(function () {
  "use strict";

  // ---------- Helpers ----------
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const fmt = (n, d = 2) => n.toFixed(d).replace(".", ",");
  const css = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  const store = {
    get(k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* storage unavailable */ } }
  };
  function shuffle(a) {
    const b = a.slice();
    for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; }
    return b;
  }

  // ---------- Hash routing between views ----------
  const VIEWS = ["verstehen", "simulation", "zellen", "alltag", "ueben"];
  function showView() {
    const name = location.hash.replace("#", "");
    const v = VIEWS.includes(name) ? name : "verstehen";
    VIEWS.forEach((n) => { $("#view-" + n).hidden = n !== v; });
    $$("nav.tabs a").forEach((a) => {
      if (a.dataset.view === v) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current");
    });
    if (v === "simulation") sim.resize();
    window.scrollTo({ top: 0 });
  }
  window.addEventListener("hashchange", showView);

  // =====================================================================
  // Simulation: vessel split by a membrane, particle-based visualisation.
  // Water level difference follows dd/dt = k * (A*Δc - 2d), where the
  // concentrations are derived from solute counts and current volumes.
  // =====================================================================
  const sim = (function () {
    const canvas = $("#sim");
    const ctx = canvas.getContext("2d");
    const PER_MOL = 40;          // solute particles per 1 mol/L at initial volume
    const WATER_TOTAL = 170;     // visible water particles
    let W = 600, H = 380, geo = {};
    let running = false, permeable = false;
    let d = 0;                   // half the level difference (px), right minus left
    let particles = [];
    let toR = 0, toL = 0;
    let last = 0;

    function resize() {
      const rect = canvas.getBoundingClientRect();
      if (!rect.width) return;
      const dpr = window.devicePixelRatio || 1;
      W = rect.width; H = rect.height;
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const oldGeo = geo;
      geo = {
        left: 28, right: W - 28, top: 22, floor: H - 26,
        mid: W / 2
      };
      geo.h0 = (geo.floor - geo.top) * 0.46;
      // first real layout (the view was hidden at start): create the particles now
      if (!oldGeo.right) { reset(); return; }
      // rescale particle positions on resize
      {
        const sx = (geo.right - geo.left) / (oldGeo.right - oldGeo.left);
        particles.forEach((p) => { p.x = geo.left + (p.x - oldGeo.left) * sx; });
      }
      draw();
    }

    function level(side) { return geo.h0 + (side === "R" ? d : -d); }
    function bounds(p) {
      const r = p.solute ? 6 : 3;
      const xmin = p.side === "L" ? geo.left + r : geo.mid + 3 + r;
      const xmax = p.side === "L" ? geo.mid - 3 - r : geo.right - r;
      const ymin = geo.floor - level(p.side) + r;
      const ymax = geo.floor - r;
      return { xmin, xmax, ymin, ymax };
    }
    function randIn(side, solute) {
      const p = { side, solute, x: 0, y: 0, vx: (Math.random() - 0.5) * 60, vy: (Math.random() - 0.5) * 60, crossing: null };
      const b = bounds(p);
      p.x = b.xmin + Math.random() * (b.xmax - b.xmin);
      p.y = b.ymin + Math.random() * (b.ymax - b.ymin);
      return p;
    }

    function reset() {
      running = false; d = 0; toR = 0; toL = 0;
      $("#simRun").textContent = "Start";
      const cL = parseFloat($("#cLeft").value), cR = parseFloat($("#cRight").value);
      particles = [];
      for (let i = 0; i < Math.round(cL * PER_MOL); i++) particles.push(randIn("L", true));
      for (let i = 0; i < Math.round(cR * PER_MOL); i++) particles.push(randIn("R", true));
      for (let i = 0; i < WATER_TOTAL / 2; i++) { particles.push(randIn("L", false)); particles.push(randIn("R", false)); }
      setStatus("Drücke auf Start.");
      updateReadout();
      draw();
    }

    function counts() {
      let sL = 0, sR = 0, wL = 0, wR = 0;
      particles.forEach((p) => {
        const side = p.crossing ? p.crossing.from : p.side;
        if (p.solute) { side === "L" ? sL++ : sR++; } else { side === "L" ? wL++ : wR++; }
      });
      return { sL, sR, wL, wR };
    }
    function conc() {
      const c = counts();
      return {
        cL: (c.sL / PER_MOL) * (geo.h0 / level("L")),
        cR: (c.sR / PER_MOL) * (geo.h0 / level("R"))
      };
    }

    function startCrossing(p, to) {
      p.crossing = { from: p.side, to };
      p.vy = 0;
      const lim = geo.floor - Math.min(level("L"), level("R")) + 6;
      if (p.y < lim) p.y = lim + Math.random() * 10;
    }
    function pickWater(side) {
      const cands = particles.filter((q) => !q.solute && !q.crossing && q.side === side);
      if (!cands.length) return null;
      // prefer particles near the membrane
      cands.sort((a, b) => Math.abs(a.x - geo.mid) - Math.abs(b.x - geo.mid));
      return cands[Math.floor(Math.random() * Math.min(6, cands.length))];
    }

    function step(dt) {
      const { cL, cR } = conc();
      // level dynamics: osmotic drive vs hydrostatic back pressure
      const A = geo.h0 * 0.9, k = 0.55;
      const target = permeable ? 0 : (A * (cR - cL)) / 2;
      d += k * (target - d) * dt;
      d = Math.max(-geo.h0 * 0.85, Math.min(geo.h0 * 0.85, d));

      // water particle bookkeeping: target counts proportional to volume
      const c = counts();
      const pendingR = particles.filter((p) => p.crossing && p.crossing.to === "R").length;
      const pendingL = particles.filter((p) => p.crossing && p.crossing.to === "L").length;
      const targetR = Math.round(WATER_TOTAL * level("R") / (2 * geo.h0));
      const projR = c.wR + pendingR - pendingL;
      if (projR < targetR && pendingR < 4) { const p = pickWater("L"); if (p) startCrossing(p, "R"); }
      if (projR > targetR && pendingL < 4) { const p = pickWater("R"); if (p) startCrossing(p, "L"); }
      // random exchange in both directions (shows water moves both ways)
      if (Math.random() < 1.6 * dt) {
        const a = pickWater("L"), b = pickWater("R");
        if (a && b) { startCrossing(a, "R"); startCrossing(b, "L"); }
      }

      particles.forEach((p) => {
        if (p.crossing) {
          const dir = p.crossing.to === "R" ? 1 : -1;
          p.x += dir * 70 * dt;
          if ((dir > 0 && p.x > geo.mid + 12) || (dir < 0 && p.x < geo.mid - 12)) {
            p.side = p.crossing.to; p.crossing = null;
            dir > 0 ? toR++ : toL++;
            p.vx = dir * 30; p.vy = (Math.random() - 0.5) * 60;
          }
          return;
        }
        // Brownian-like motion
        p.vx += (Math.random() - 0.5) * 140 * dt;
        p.vy += (Math.random() - 0.5) * 140 * dt;
        const vmax = p.solute ? 28 : 55;
        p.vx = Math.max(-vmax, Math.min(vmax, p.vx));
        p.vy = Math.max(-vmax, Math.min(vmax, p.vy));
        p.x += p.vx * dt; p.y += p.vy * dt;
        const b = bounds(p);
        // permeable membrane: solutes may pass when touching it
        if (p.solute && permeable) {
          const atMem = (p.side === "L" && p.x > b.xmax) || (p.side === "R" && p.x < b.xmin);
          const lim = geo.floor - Math.min(level("L"), level("R")) + 8;
          if (atMem && p.y > lim && Math.random() < 0.35) {
            p.side = p.side === "L" ? "R" : "L";
            p.x = p.side === "R" ? geo.mid + 10 : geo.mid - 10;
            return;
          }
        }
        if (p.x < b.xmin) { p.x = b.xmin; p.vx = Math.abs(p.vx); }
        if (p.x > b.xmax) { p.x = b.xmax; p.vx = -Math.abs(p.vx); }
        if (p.y < b.ymin) { p.y = b.ymin; p.vy = Math.abs(p.vy); }
        if (p.y > b.ymax) { p.y = b.ymax; p.vy = -Math.abs(p.vy); }
      });
    }

    function arrow(x1, y, x2, color, w) {
      ctx.strokeStyle = color; ctx.lineWidth = w; ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(x1, y); ctx.lineTo(x2, y);
      const dir = Math.sign(x2 - x1);
      ctx.moveTo(x2, y); ctx.lineTo(x2 - dir * 8, y - 6);
      ctx.moveTo(x2, y); ctx.lineTo(x2 - dir * 8, y + 6);
      ctx.stroke();
    }

    function draw() {
      if (!geo.right) return;
      const water = css("--water"), solute = css("--solute"), membrane = css("--membrane"),
        ink = css("--ink"), muted = css("--muted"), surface = css("--surface");
      ctx.fillStyle = surface; ctx.fillRect(0, 0, W, H);
      const hL = level("L"), hR = level("R");
      // fluid
      ctx.fillStyle = css("--water-soft");
      ctx.fillRect(geo.left, geo.floor - hL, geo.mid - geo.left, hL);
      ctx.fillRect(geo.mid, geo.floor - hR, geo.right - geo.mid, hR);
      // initial level
      ctx.setLineDash([4, 5]); ctx.strokeStyle = muted; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(geo.left, geo.floor - geo.h0); ctx.lineTo(geo.right, geo.floor - geo.h0); ctx.stroke();
      ctx.setLineDash([]);
      // surface lines
      ctx.strokeStyle = water; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(geo.left, geo.floor - hL); ctx.lineTo(geo.mid, geo.floor - hL);
      ctx.moveTo(geo.mid, geo.floor - hR); ctx.lineTo(geo.right, geo.floor - hR); ctx.stroke();
      // particles
      particles.forEach((p) => {
        ctx.fillStyle = p.solute ? solute : water;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.solute ? 6 : 2.6, 0, Math.PI * 2); ctx.fill();
      });
      // membrane
      ctx.strokeStyle = membrane; ctx.lineWidth = 4;
      ctx.setLineDash(permeable ? [3, 9] : [10, 4]);
      ctx.beginPath(); ctx.moveTo(geo.mid, geo.top); ctx.lineTo(geo.mid, geo.floor); ctx.stroke();
      ctx.setLineDash([]);
      // vessel
      ctx.strokeStyle = ink; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(geo.left, geo.top); ctx.lineTo(geo.left, geo.floor); ctx.lineTo(geo.right, geo.floor); ctx.lineTo(geo.right, geo.top); ctx.stroke();
      // labels
      ctx.fillStyle = muted; ctx.font = "12px " + css("--font-mono");
      ctx.textAlign = "left"; ctx.fillText("links", geo.left + 8, geo.top + 14);
      ctx.textAlign = "right"; ctx.fillText("rechts", geo.right - 8, geo.top + 14);
      ctx.textAlign = "left"; ctx.fillText("Startniveau", geo.left + 8, geo.floor - geo.h0 - 6);
      // net flow arrow
      if (running && !permeable) {
        const { cL, cR } = conc();
        const target = (geo.h0 * 0.9 * (cR - cL)) / 2;
        const rem = target - d;
        if (Math.abs(rem) > 1.5) {
          const y = geo.floor - Math.min(hL, hR) / 2;
          if (rem > 0) arrow(geo.mid - 44, y, geo.mid + 44, water, 4); else arrow(geo.mid + 44, y, geo.mid - 44, water, 4);
        }
      }
    }

    function setStatus(t) { $("#simStatus").textContent = t; }
    function updateReadout() {
      const { cL, cR } = conc();
      $("#roCL").textContent = fmt(cL) + " mol/L";
      $("#roCR").textContent = fmt(cR) + " mol/L";
      $("#roToR").textContent = toR;
      $("#roToL").textContent = toL;
      // display: assume the drawn level difference maps to mm on a lab scale
      $("#roDh").textContent = Math.round(Math.abs(2 * d) / geo.h0 * 100) + " mm " + (Math.abs(d) < 1 ? "" : d > 0 ? "(rechts höher)" : "(links höher)");
      if (!running) return;
      const target = permeable ? 0 : (geo.h0 * 0.9 * (cR - cL)) / 2;
      const settled = Math.abs(target - d) < 1.2;
      if (permeable) {
        setStatus(Math.abs(cL - cR) < 0.05 && Math.abs(d) < 1.5
          ? "Die gelösten Teilchen haben sich durch Diffusion gleichmäßig verteilt. Es gibt keinen Spiegelunterschied, also keine Osmose."
          : "Die Membran lässt auch die gelösten Teilchen durch. Sie diffundieren, bis die Konzentrationen gleich sind.");
      } else if (Math.abs(cR - cL) < 0.02 && Math.abs(d) < 1) {
        setStatus("Beide Seiten sind isotonisch. Wasser wandert in beide Richtungen gleich oft, der Nettostrom ist null.");
      } else if (settled) {
        setStatus("Gleichgewicht: Der hydrostatische Druck der höheren Wassersäule gleicht den osmotischen Druck aus.");
      } else {
        setStatus("Netto strömt Wasser zur Seite mit der höheren Konzentration (" + (cR > cL ? "rechts" : "links") + "). Dort steigt der Spiegel.");
      }
    }

    function loop(t) {
      const dt = Math.min(0.05, (t - last) / 1000 || 0.016);
      last = t;
      if (running && !$("#view-simulation").hidden) { step(dt); draw(); updateReadout(); }
      requestAnimationFrame(loop);
    }

    // wiring
    $("#cLeft").addEventListener("input", (e) => { $("#cLeftOut").textContent = fmt(+e.target.value, 1) + " mol/L"; reset(); });
    $("#cRight").addEventListener("input", (e) => { $("#cRightOut").textContent = fmt(+e.target.value, 1) + " mol/L"; reset(); });
    $("#simRun").addEventListener("click", () => {
      running = !running;
      $("#simRun").textContent = running ? "Pause" : "Weiter";
      if (running) updateReadout(); else setStatus("Pausiert.");
    });
    $("#simReset").addEventListener("click", reset);
    function setMem(full) {
      permeable = full;
      $("#memSemi").setAttribute("aria-pressed", String(!full));
      $("#memFull").setAttribute("aria-pressed", String(full));
      reset();
    }
    $("#memSemi").addEventListener("click", () => setMem(false));
    $("#memFull").addEventListener("click", () => setMem(true));
    window.addEventListener("resize", resize);
    if (window.matchMedia) {
      try { window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", draw); } catch (e) { /* old browsers */ }
    }

    return {
      init() { resize(); reset(); requestAnimationFrame((t) => { last = t; loop(t); }); },
      resize() { requestAnimationFrame(() => { resize(); }); }
    };
  })();

  // =====================================================================
  // Cells: red blood cell and onion epidermis cell react to the medium.
  // Shapes are interpolated between parameter sets for each medium.
  // =====================================================================
  const cells = (function () {
    const STATES = {
      hypo: {
        rbc: { R: 80, spike: 0, center: 0, burst: 1 },
        plant: { inset: 6, vac: 1 },
        rbcState: "angeschwollen, platzt (Hämolyse)",
        rbcText: "Außen sind weniger gelöste Teilchen als in der Zelle. Deshalb strömt Wasser in die Blutzelle. Sie wird kugelrund und platzt schließlich, weil keine Zellwand sie schützt. Das nennt man Hämolyse.",
        plantState: "prall (hoher Turgor)",
        plantText: "Wasser strömt in die Vakuole, den Wasserspeicher der Zelle. Die Zelle wird prall und drückt gegen die Zellwand (Turgor). Die feste Zellwand hält dagegen, deshalb platzt die Zelle nicht. So bleiben Pflanzen straff.",
        dir: "in"
      },
      iso: {
        rbc: { R: 62, spike: 0, center: 1, burst: 0 },
        plant: { inset: 9, vac: 0.8 },
        rbcState: "normal (bikonkav)",
        rbcText: "Innen und außen sind gleich viele gelöste Teilchen. Es strömt gleich viel Wasser hinein wie heraus. Die Zelle behält ihre normale Form: eine flache Scheibe mit einer Delle in der Mitte.",
        plantState: "Grenzplasmolyse",
        plantText: "Es strömt gleich viel Wasser hinein wie heraus. Das Zellinnere liegt gerade noch an der Zellwand an, drückt aber nicht dagegen. Diesen Zustand nennt man Grenzplasmolyse.",
        dir: "both"
      },
      hyper: {
        rbc: { R: 50, spike: 1, center: 0.4, burst: 0 },
        plant: { inset: 40, vac: 0.35 },
        rbcState: "geschrumpft (Stechapfelform)",
        rbcText: "Außen sind mehr gelöste Teilchen als in der Zelle. Deshalb strömt Wasser aus der Blutzelle heraus. Sie schrumpft und bekommt Zacken (Stechapfelform).",
        plantState: "Plasmolyse",
        plantText: "Die Vakuole, der Wasserspeicher, gibt Wasser ab und schrumpft. Das Zellinnere löst sich von der Zellwand. Das nennt man Plasmolyse. Legt man die Zelle danach in Wasser, füllt sie sich wieder (Deplasmolyse).",
        dir: "out"
      }
    };
    let cur = { R: 62, spike: 0, center: 1, burst: 0, inset: 9, vac: 0.8 };
    let target = Object.assign({}, cur);
    let anim = null;

    function rbcPath(R, spike) {
      const n = 16, pts = [], steps = 160;
      for (let i = 0; i <= steps; i++) {
        const t = (i / steps) * Math.PI * 2;
        const r = R * (1 + spike * 0.13 * Math.pow(Math.abs(Math.sin((n / 2) * t)), 3) - spike * 0.04);
        pts.push((120 + r * Math.cos(t)).toFixed(1) + " " + (120 + r * Math.sin(t)).toFixed(1));
      }
      return "M" + pts.join(" L") + " Z";
    }
    function arrowsSvg(dir, cx, cy, rIn, rOut) {
      const out = [];
      [45, 135, 225, 315].forEach((deg) => {
        const a = (deg * Math.PI) / 180, c = Math.cos(a), s = Math.sin(a);
        const p1 = [cx + rOut * c, cy + rOut * s], p2 = [cx + rIn * c, cy + rIn * s];
        const seg = (from, to) => {
          const dx = to[0] - from[0], dy = to[1] - from[1], L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L;
          const h1 = [to[0] - ux * 8 - uy * 6, to[1] - uy * 8 + ux * 6], h2 = [to[0] - ux * 8 + uy * 6, to[1] - uy * 8 - ux * 6];
          return `<path d="M${from[0].toFixed(1)} ${from[1].toFixed(1)} L${to[0].toFixed(1)} ${to[1].toFixed(1)} M${h1[0].toFixed(1)} ${h1[1].toFixed(1)} L${to[0].toFixed(1)} ${to[1].toFixed(1)} L${h2[0].toFixed(1)} ${h2[1].toFixed(1)}"/>`;
        };
        if (dir === "in") out.push(seg(p1, p2));
        else if (dir === "out") out.push(seg(p2, p1));
        else {
          const m = [(p1[0] + p2[0]) / 2, (p1[1] + p2[1]) / 2];
          out.push(`<g opacity="0.6">${seg(m, p2)}${seg(m, p1)}</g>`);
        }
      });
      return out.join("");
    }
    function render(s) {
      $("#rbcBody").setAttribute("d", rbcPath(s.R, s.spike));
      const rc = 26 * s.center * (s.R / 62);
      $("#rbcCenter").setAttribute("rx", rc.toFixed(1));
      $("#rbcCenter").setAttribute("ry", rc.toFixed(1));
      $("#rbcBody").setAttribute("opacity", (1 - 0.55 * s.burst).toFixed(2));
      $("#rbcBody").setAttribute("stroke-dasharray", s.burst > 0.9 ? "10 6" : "none");
      $("#rbcBurst").setAttribute("opacity", s.burst > 0.9 ? "1" : "0");
      // plant: wall inner box is x 34..206, y 44..196
      const i = s.inset, x = 34 + i, y = 44 + i * 0.85, w = 172 - 2 * i, h = 152 - 1.7 * i;
      const proto = $("#plantProto");
      proto.setAttribute("x", x.toFixed(1)); proto.setAttribute("y", y.toFixed(1));
      proto.setAttribute("width", w.toFixed(1)); proto.setAttribute("height", h.toFixed(1));
      proto.setAttribute("rx", (6 + i * 0.9).toFixed(1));
      const vw = (w - 24) * s.vac, vh = (h - 24) * s.vac;
      const vac = $("#plantVac");
      vac.setAttribute("x", (x + w / 2 - vw / 2 + 6).toFixed(1)); vac.setAttribute("y", (y + h / 2 - vh / 2 + 4).toFixed(1));
      vac.setAttribute("width", Math.max(8, vw).toFixed(1)); vac.setAttribute("height", Math.max(8, vh).toFixed(1));
      vac.setAttribute("rx", Math.min(30, vw / 2, vh / 2).toFixed(1));
      const nOff = 16 + i * 0.45;
      $("#plantNuc").setAttribute("cx", (x + nOff).toFixed(1)); $("#plantNuc").setAttribute("cy", (y + nOff).toFixed(1));
      $("#plantNuc").setAttribute("r", (8 + 3 * Math.min(1, w / 160)).toFixed(1));
    }
    function setMedium(m) {
      const st = STATES[m];
      $$("[data-medium]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.medium === m)));
      $("#rbcState").textContent = st.rbcState; $("#rbcText").textContent = st.rbcText;
      $("#plantState").textContent = st.plantState; $("#plantText").textContent = st.plantText;
      $("#rbcArrows").innerHTML = arrowsSvg(st.dir, 120, 120, 78 + (m === "hypo" ? 10 : 0), 112);
      $("#plantArrows").innerHTML = arrowsSvg(st.dir, 120, 120, 70, 108);
      target = Object.assign({}, st.rbc, st.plant);
      // swelling first, then burst for hypotonic medium
      const from = Object.assign({}, cur);
      const t0 = performance.now(), dur = 1400;
      const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      cancelAnimationFrame(anim);
      function tick(t) {
        let k = reduce ? 1 : Math.min(1, (t - t0) / dur);
        const e = 1 - Math.pow(1 - k, 3);
        Object.keys(target).forEach((key) => {
          if (key === "burst") cur.burst = k >= 1 ? target.burst : from.burst * (1 - e);
          else cur[key] = from[key] + (target[key] - from[key]) * e;
        });
        render(cur);
        if (k < 1) anim = requestAnimationFrame(tick);
      }
      anim = requestAnimationFrame(tick);
    }
    $$("[data-medium]").forEach((b) => b.addEventListener("click", () => setMedium(b.dataset.medium)));
    return { init() { render(cur); setMedium("iso"); } };
  })();

  // =====================================================================
  // Everyday examples: predict direction of net water flow for the cells.
  // =====================================================================
  const OPT = { in: "Wasser strömt netto in die Zellen", out: "Wasser strömt netto aus den Zellen", none: "Kein Nettostrom" };
  const EXAMPLES = [
    { ctx: "Küche", title: "Gurkensalat salzen", text: "Du salzt geschnittene Gurkenscheiben. Nach 20 Minuten steht eine Pfütze in der Schüssel und die Gurken sind weich.", ans: "out",
      why: "Das Salz löst sich in der Flüssigkeit an der Oberfläche. Diese Lösung ist hypertonisch zum Zellsaft. Wasser verlässt die Gurkenzellen, die Zellen verlieren Turgor und die Scheiben werden weich (Plasmolyse)." },
    { ctx: "Küche", title: "Welker Salat im Wasserbad", text: "Schlappe Salatblätter oder weiche Möhren legst du für eine halbe Stunde in kaltes Wasser. Danach sind sie wieder knackig.", ans: "in",
      why: "Leitungswasser ist hypotonisch zum Zellsaft. Wasser strömt in die Vakuolen, der Turgor steigt und das Gewebe wird wieder straff." },
    { ctx: "Garten", title: "Kirschen platzen im Regen", text: "Kurz vor der Ernte regnet es tagelang. Viele reife Kirschen am Baum sind aufgeplatzt.", ans: "in",
      why: "Reife Kirschen enthalten viel Zucker. Ihr Zellsaft ist stark hypertonisch gegenüber dem Regenwasser auf der Schale. Wasser dringt ein, das Fruchtfleisch quillt und die Haut reißt." },
    { ctx: "Küche", title: "Erdbeeren zuckern", text: "Du streust Zucker über geschnittene Erdbeeren. Nach kurzer Zeit liegen sie in ihrem eigenen roten Saft.", ans: "out",
      why: "Der Zucker bildet mit etwas Fruchtsaft eine hypertonische Lösung. Den Zellen wird Wasser entzogen. Es tritt als Saft aus." },
    { ctx: "Küche", title: "Rosinen einweichen", text: "Rosinen liegen über Nacht in Wasser. Am Morgen sind sie dick und rund.", ans: "in",
      why: "Die getrockneten Trauben haben eine sehr hohe Zuckerkonzentration. Gegenüber dem Wasser sind sie stark hypertonisch, deshalb nehmen sie Wasser auf und quellen auf." },
    { ctx: "Medizin", title: "Infusion im Krankenhaus", text: "Patienten bekommen eine Infusion mit „physiologischer Kochsalzlösung“ (0,9 % NaCl). Was passiert mit den roten Blutzellen?", ans: "none",
      why: "0,9 % NaCl ist isotonisch zum Blutplasma. Wasser strömt gleich stark in die Zellen hinein und heraus. Die Blutzellen behalten ihre Form. Reines Wasser würde zur Hämolyse führen." },
    { ctx: "Medizin", title: "Nasendusche", text: "Bei Schnupfen spült man die Nase mit isotonischer Kochsalzlösung. Mit reinem Leitungswasser brennt es dagegen unangenehm. Was passiert bei der Kochsalzlösung mit den Schleimhautzellen?", ans: "none",
      why: "Die isotonische Lösung verursacht keinen Nettostrom, die Zellen bleiben unverändert. Leitungswasser ist hypotonisch. Die Zellen nehmen Wasser auf und schwellen an, das reizt die Schleimhaut." },
    { ctx: "Straße", title: "Streusalz und Straßenbäume", text: "Im Winter wird viel Salz gestreut. Im Frühjahr kümmern Bäume und Hecken am Straßenrand, obwohl der Boden feucht ist. Was passiert an den Wurzelzellen?", ans: "out",
      why: "Das Bodenwasser wird durch das Salz hypertonisch. Die Wurzeln können kein Wasser mehr aufnehmen und verlieren sogar welches. Die Pflanze vertrocknet im nassen Boden (physiologische Trockenheit)." },
    { ctx: "Garten", title: "Zu viel Dünger", text: "Jemand meint es gut und gibt der Zimmerpflanze die dreifache Menge Flüssigdünger. Die Pflanze welkt trotz Gießen. Was passiert an den Wurzelzellen?", ans: "out",
      why: "Die gelösten Düngesalze machen die Bodenlösung hypertonisch. Wasser verlässt die Wurzelzellen, die Pflanze welkt. Man sagt, die Wurzeln „verbrennen“." },
    { ctx: "Vorratskammer", title: "Marmelade, Honig, Salzhering", text: "Marmelade, Honig und stark gesalzener Fisch halten sehr lange, ohne zu schimmeln. Was passiert mit Bakterien und Pilzsporen, die darauf landen?", ans: "out",
      why: "Die hohe Zucker- bzw. Salzkonzentration ist stark hypertonisch. Mikroorganismen wird Wasser entzogen (Plasmolyse). Sie können nicht wachsen. So funktionieren Zuckern, Pökeln und Einsalzen als Konservierung." },
    { ctx: "Natur", title: "Süßwasserfisch", text: "Eine Forelle lebt im Bach. Ihre Körperflüssigkeit ist salziger als das Bachwasser. Was passiert an den Kiemen?", ans: "in",
      why: "Das Süßwasser ist hypotonisch. Über die Kiemen strömt ständig Wasser in den Körper. Deshalb trinkt der Fisch kaum und scheidet viel sehr verdünnten Urin aus. Salze nimmt er aktiv über die Kiemen auf." },
    { ctx: "Natur", title: "Meeresfisch", text: "Ein Hering lebt im Meer. Das Meerwasser ist salziger als seine Körperflüssigkeit. Was passiert an den Kiemen?", ans: "out",
      why: "Das Meerwasser ist hypertonisch. Der Fisch verliert ständig Wasser. Er gleicht das aus, indem er Meerwasser trinkt und überschüssiges Salz aktiv über die Kiemen ausscheidet." },
    { ctx: "Schiffbruch", title: "Meerwasser trinken", text: "Schiffbrüchige sollen kein Meerwasser trinken, obwohl sie Durst haben. Was passiert mit den Körperzellen, wenn viel Salz ins Blut gelangt?", ans: "out",
      why: "Das Blut wird hypertonisch zu den Körperzellen, sie verlieren Wasser. Außerdem braucht die Niere zusätzliches Wasser, um das Salz auszuscheiden. Der Körper trocknet schneller aus." }
  ];
  const ex = (function () {
    let answers = store.get("osmose.ex") || {};
    function renderAll() {
      const grid = $("#exGrid");
      grid.innerHTML = "";
      EXAMPLES.forEach((e, idx) => {
        const card = document.createElement("article");
        card.className = "panel ex";
        card.innerHTML = `<span class="ctx">${e.ctx}</span><h3>${e.title}</h3><p style="font-size:var(--step--1)">${e.text}</p>
          <span class="q">Was passiert?</span><div class="opts"></div><div class="answer" hidden></div>`;
        const opts = $(".opts", card), ansBox = $(".answer", card);
        ["in", "out", "none"].forEach((k) => {
          const b = document.createElement("button");
          b.type = "button"; b.textContent = OPT[k]; b.dataset.k = k;
          b.addEventListener("click", () => { answers[idx] = k; store.set("osmose.ex", answers); paint(); });
          opts.appendChild(b);
        });
        function paint() {
          const chosen = answers[idx];
          $$("button", opts).forEach((b) => {
            b.classList.remove("right", "wrong");
            b.disabled = !!chosen;
            if (chosen) {
              if (b.dataset.k === e.ans) b.classList.add("right");
              else if (b.dataset.k === chosen) b.classList.add("wrong");
            }
          });
          if (chosen) {
            ansBox.hidden = false;
            ansBox.innerHTML = (chosen === e.ans ? '<b class="ok">Richtig.</b> ' : '<b class="no">Nicht ganz.</b> Richtig ist: ' + OPT[e.ans] + ". ") + e.why;
          } else ansBox.hidden = true;
          progress();
        }
        card._paint = paint;
        grid.appendChild(card);
        paint();
      });
    }
    function progress() {
      const keys = Object.keys(answers);
      const right = keys.filter((i) => EXAMPLES[i] && answers[i] === EXAMPLES[i].ans).length;
      $("#exScore").textContent = `${keys.length} von ${EXAMPLES.length} beantwortet · ${right} richtig`;
      $("#exBar").style.width = (keys.length / EXAMPLES.length) * 100 + "%";
    }
    $("#exReset").addEventListener("click", () => { answers = {}; store.set("osmose.ex", answers); renderAll(); });
    return { init: renderAll };
  })();

  // =====================================================================
  // Quiz: multiple choice with immediate feedback and explanations.
  // =====================================================================
  const QUESTIONS = [
    { q: "Was versteht man unter Osmose?", o: ["Die Diffusion gelöster Teilchen von hoher zu niedriger Konzentration", "Die Diffusion von Wasser durch eine selektiv permeable Membran zur Lösung mit höherer Teilchenkonzentration", "Den aktiven Transport von Wasser unter ATP-Verbrauch", "Das Auflösen von Salz in Wasser"], a: 1,
      e: "Osmose ist ein Sonderfall der Diffusion: Es geht um das Lösungsmittel Wasser, und es braucht eine selektiv permeable Membran." },
    { q: "Bei der Osmose bewegt sich netto …", o: ["das Wasser", "der gelöste Stoff", "beides gleichermaßen", "nichts, es ändert sich nur der Druck"], a: 0,
      e: "Die Membran hält die gelösten Teilchen zurück, nur Wasser gelangt hindurch. Netto bewegt sich also Wasser." },
    { q: "Eine Lösung ist hypertonisch im Vergleich zu einer anderen, wenn sie …", o: ["mehr Wasser enthält", "eine höhere Konzentration gelöster Teilchen hat", "wärmer ist", "eine niedrigere Konzentration gelöster Teilchen hat"], a: 1,
      e: "hyper = über. Die Lösung hat mehr gelöste Teilchen und zieht deshalb Wasser an." },
    { q: "Rote Blutzellen werden in destilliertes Wasser gegeben. Was passiert?", o: ["Sie schrumpfen zur Stechapfelform", "Nichts", "Sie schwellen an und platzen (Hämolyse)", "Sie bilden eine Zellwand"], a: 2,
      e: "Destilliertes Wasser ist hypotonisch. Wasser strömt ein, und weil keine Zellwand die Zelle stützt, platzt sie." },
    { q: "Zwiebelhautzellen liegen in konzentrierter Zuckerlösung. Unter dem Mikroskop siehst du …", o: ["Plasmolyse: Der Protoplast löst sich von der Zellwand", "Hämolyse", "Die Zellen platzen", "Die Vakuole wird größer"], a: 0,
      e: "Die Zuckerlösung ist hypertonisch. Die Vakuole verliert Wasser, der Protoplast schrumpft und löst sich von der Zellwand." },
    { q: "Warum platzt eine Pflanzenzelle in reinem Wasser nicht?", o: ["Weil Pflanzenzellen kein Wasser aufnehmen", "Weil die stabile Zellwand dem Turgordruck standhält", "Weil die Vakuole das Wasser sofort abpumpt", "Weil die Zellmembran für Wasser undurchlässig ist"], a: 1,
      e: "Der Protoplast drückt gegen die Zellwand (Turgor). Die Wand übt einen Gegendruck aus, der den weiteren Wassereinstrom stoppt." },
    { q: "Was passiert in einer isotonischen Lösung mit den Wassermolekülen?", o: ["Sie bewegen sich gar nicht", "Sie strömen nur in die Zelle", "Sie bewegen sich gleich stark in beide Richtungen, kein Nettostrom", "Sie strömen nur aus der Zelle"], a: 2,
      e: "Ein häufiger Klausurfehler! Wassermoleküle bewegen sich immer. Im isotonischen Fall gleichen sich die beiden Richtungen aus." },
    { q: "Im Osmometer (Membran in der Mitte) ist links reines Wasser, rechts Zuckerlösung. Was beobachtest du?", o: ["Der Spiegel links steigt", "Der Spiegel rechts steigt, bis der Gegendruck den Nettostrom stoppt", "Der Zucker wandert nach links", "Beide Spiegel bleiben gleich"], a: 1,
      e: "Wasser strömt netto zur Zuckerlösung. Die steigende Wassersäule erzeugt einen hydrostatischen Gegendruck, bis ein Gleichgewicht erreicht ist." },
    { q: "Was ändert sich, wenn die Membran auch für den Zucker durchlässig ist?", o: ["Die Osmose wird stärker", "Es findet keine Osmose statt, der Zucker diffundiert, bis die Konzentrationen gleich sind", "Das Wasser kann nicht mehr durch", "Der Zucker sammelt sich auf einer Seite"], a: 1,
      e: "Ohne selektive Permeabilität gleichen sich die Konzentrationen durch Diffusion aus. Ein dauerhafter Spiegelunterschied entsteht nicht." },
    { q: "Welche Lösung hat den höheren osmotischen Wert?", o: ["0,1 mol/L Glucose", "0,1 mol/L NaCl", "Beide gleich", "Kann man nicht sagen"], a: 1,
      e: "NaCl zerfällt in Na⁺ und Cl⁻, also entstehen etwa 0,2 mol/L gelöste Teilchen. Glucose zerfällt nicht. Entscheidend ist die Teilchenzahl." },
    { q: "Warum bekommt man bei einer Infusion 0,9-prozentige Kochsalzlösung und kein reines Wasser?", o: ["Weil Salz Bakterien abtötet", "Weil sie isotonisch zum Blut ist und die Blutzellen nicht schädigt", "Weil Salz den Blutdruck senkt", "Weil reines Wasser zu teuer ist"], a: 1,
      e: "Reines Wasser wäre hypotonisch und würde rote Blutzellen platzen lassen. Die 0,9 % NaCl-Lösung ist isotonisch." },
    { q: "Nach tagelangem Regen platzen reife Kirschen am Baum auf. Warum?", o: ["Der zuckerreiche Zellsaft ist hypertonisch zum Regenwasser, Wasser strömt ein", "Das Regenwasser ist hypertonisch", "Die Kirschen verlieren Wasser und reißen", "Kälte lässt die Haut springen"], a: 0,
      e: "Viel Zucker im Fruchtfleisch zieht Wasser von außen an. Die Frucht quillt, bis die Haut reißt." },
    { q: "Am Straßenrand vertrocknen Pflanzen nach dem Winter trotz feuchtem Boden. Ursache?", o: ["Das Streusalz macht das Bodenwasser hypertonisch, die Wurzeln können kein Wasser aufnehmen", "Das Salz verstopft die Blätter", "Die Wurzeln nehmen zu viel Wasser auf", "Der Boden ist hypotonisch"], a: 0,
      e: "Hohe Salzkonzentration im Boden kehrt das Konzentrationsgefälle um. Die Wurzelzellen verlieren Wasser (physiologische Trockenheit)." },
    { q: "Warum verdirbt Marmelade kaum, obwohl sie viel Wasser enthält?", o: ["Weil Zucker giftig für Bakterien ist", "Die hohe Zuckerkonzentration entzieht Mikroorganismen osmotisch das Wasser", "Weil Marmelade sauerstofffrei ist", "Weil Mikroorganismen Zucker nicht mögen"], a: 1,
      e: "Die Marmelade ist stark hypertonisch. Bakterien und Pilze verlieren Wasser (Plasmolyse) und können sich nicht vermehren." },
    { q: "Welche Aufgabe hat die pulsierende Vakuole des Pantoffeltierchens?", o: ["Sie speichert Nährstoffe", "Sie pumpt das osmotisch eingeströmte Wasser unter Energieaufwand nach außen", "Sie nimmt Salz auf", "Sie dient der Fortbewegung"], a: 1,
      e: "Süßwasser ist hypotonisch, ständig strömt Wasser ein. Ohne die pulsierende Vakuole würde die Zelle platzen." },
    { q: "Eine plasmolysierte Zwiebelzelle wird in destilliertes Wasser gelegt. Das nennt man …", o: ["Hämolyse", "Grenzplasmolyse", "Deplasmolyse", "Turgorverlust"], a: 2,
      e: "Die Vakuole nimmt wieder Wasser auf, und der Protoplast legt sich erneut an die Zellwand an." },
    { q: "Was beschreibt der Turgor?", o: ["Den Druck des Zellinhalts gegen die Zellwand", "Die Geschwindigkeit der Diffusion", "Die Dicke der Zellwand", "Den Salzgehalt der Vakuole"], a: 0,
      e: "Der Turgor hält krautige Pflanzen aufrecht. Sinkt er, welkt die Pflanze." },
    { q: "Warum sollten Schiffbrüchige kein Meerwasser trinken?", o: ["Weil es Bakterien enthält", "Weil das Salz dem Körper zusätzlich Wasser entzieht und die Niere Wasser zum Ausscheiden braucht", "Weil es zu kalt ist", "Weil es hypotonisch ist"], a: 1,
      e: "Meerwasser ist hypertonisch zu unseren Körperflüssigkeiten. Statt den Durst zu stillen, verstärkt es die Austrocknung." }
  ];
  const quiz = (function () {
    const N = 12;
    let order = [], idx = 0, score = 0, answered = false;
    function start() {
      order = shuffle(QUESTIONS).slice(0, N).map((q) => {
        const perm = shuffle(q.o.map((_, i) => i));
        return { q: q.q, o: perm.map((i) => q.o[i]), a: perm.indexOf(q.a), e: q.e };
      });
      idx = 0; score = 0; render();
    }
    function render() {
      const box = $("#quizBox");
      $("#qBar").style.width = (idx / N) * 100 + "%";
      if (idx >= N) {
        const best = Math.max(score, store.get("osmose.best") || 0);
        store.set("osmose.best", best);
        const msg = score >= 11 ? "Hervorragend! Du hast das Thema sicher drauf." : score >= 8 ? "Gut gemacht! Wiederhole die Fragen, bei denen du unsicher warst." : "Schau dir „Verstehen“ und die Simulation noch einmal an und versuche es dann erneut.";
        $("#qProgress").textContent = `fertig · Bestwert ${best} / ${N}`;
        box.innerHTML = `<span class="eyebrow">Ergebnis</span><div class="score-big mono">${score} / ${N}</div><p>${msg}</p>
          <div class="row"><button type="button" class="primary" id="qAgain">Neue Runde (gemischt)</button></div>`;
        $("#qAgain").addEventListener("click", start);
        return;
      }
      const q = order[idx];
      answered = false;
      $("#qProgress").textContent = `Frage ${idx + 1} von ${N} · ${score} richtig`;
      box.innerHTML = `<div class="qtext">${q.q}</div><div class="opts"></div><div class="feedback" hidden></div>
        <div class="row"><button type="button" class="primary" id="qNext" hidden>${idx + 1 < N ? "Nächste Frage" : "Ergebnis anzeigen"}</button></div>`;
      const opts = $(".opts", box);
      q.o.forEach((text, i) => {
        const b = document.createElement("button");
        b.type = "button";
        b.innerHTML = `<span class="k">${"ABCD"[i]}</span><span></span>`;
        b.lastChild.textContent = text;
        b.addEventListener("click", () => choose(i));
        opts.appendChild(b);
      });
      $("#qNext").addEventListener("click", () => { idx++; render(); });
    }
    function choose(i) {
      if (answered) return;
      answered = true;
      const q = order[idx], box = $("#quizBox");
      const btns = $$(".opts button", box);
      btns.forEach((b, j) => { b.disabled = true; if (j === q.a) b.classList.add("right"); else if (j === i) b.classList.add("wrong"); });
      const ok = i === q.a;
      if (ok) score++;
      const fb = $(".feedback", box);
      fb.hidden = false;
      fb.innerHTML = (ok ? '<b class="ok">Richtig!</b> ' : '<b class="no">Leider falsch.</b> ') + q.e;
      $("#qNext").hidden = false;
      $("#qNext").focus();
      $("#qProgress").textContent = `Frage ${idx + 1} von ${N} · ${score} richtig`;
    }
    return { init: start };
  })();

  // ---------- Boot ----------
  sim.init();
  cells.init();
  ex.init();
  quiz.init();
  showView();
})();
