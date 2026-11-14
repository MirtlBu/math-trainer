/**
 * sandbox-percent.js
 * Sandbox toys about percent, fractions and growth:
 *
 *   percent-bar       the same part is a different percent of different wholes (the whole is always 100 %)
 *   percent-ladder    +p1 % and then +p2 %: the two changes are not added; what is needed to get back
 *   compound-interest the growth "interest on interest" next to the simple interest
 *   fraction-strip    a fraction, its simplest form, the decimal and the percent on strips
 *
 * Load after sandbox.js and sandbox-kit.js, before ui.js. The texts are in TEXTS.sandbox.*.
 */

// ─── percent-bar ──────────────────────────────────────────────────────────────

TOYS['percent-bar'] = {
  mount(root) {
    const T = TEXTS.sandbox.percentBar;
    const W = 640, H = 270, X0 = 70, BAR = 400, MAXP = 1.5;                // 100 % is 400 px wide, up to 150 % is shown
    const st = { part: 30, w1: 50, w2: 200 };
    const stage = KIT.stage(root, W, H, T.aria);
    const controls = document.createElement('div'); controls.className = 'toy-controls'; root.appendChild(controls);
    const panel = KIT.panel(root);
    KIT.hint(root, T.hint);

    const sliders = [
      KIT.slider(controls, { label: T.part, min: 0, max: 400, value: st.part, onInput: v => { st.part = v; draw(); } }),
      KIT.slider(controls, { label: T.whole1, min: 10, max: 400, step: 10, value: st.w1, onInput: v => { st.w1 = v; draw(); } }),
      KIT.slider(controls, { label: T.whole2, min: 10, max: 400, step: 10, value: st.w2, onInput: v => { st.w2 = v; draw(); } }),
    ];
    KIT.button(root, T.reset, () => { Object.assign(st, { part: 30, w1: 50, w2: 200 }); sliders[0].set(30); sliders[1].set(50); sliders[2].set(200); draw(); });

    function bar(y, whole, label, cls) {
      const p = st.part / whole, shown = Math.min(p, MAXP);
      const out = [];
      out.push(`<text class="toy-text-strong" x="${X0}" y="${y - 12}">${label}: ${whole}</text>`);
      out.push(`<rect x="${X0}" y="${y}" width="${BAR}" height="40" fill="none" stroke="var(--clr-text)" stroke-width="2"/>`);
      out.push(`<rect x="${X0}" y="${y}" width="${Math.min(shown, 1) * BAR}" height="40" class="${cls}"/>`);
      if (shown > 1) out.push(`<rect x="${X0 + BAR}" y="${y}" width="${(shown - 1) * BAR}" height="40" class="toy-over"/>`);
      for (const q of [0, 0.25, 0.5, 0.75, 1]) {
        const x = X0 + q * BAR;
        out.push(`<line x1="${x}" y1="${y + 40}" x2="${x}" y2="${y + 48}" stroke="var(--clr-text)"/>`);
        out.push(`<text class="toy-tick" x="${x}" y="${y + 62}" text-anchor="middle">${KIT.fmt(q * 100, 0)}%</text>`);
        out.push(`<text class="toy-text-muted" x="${x}" y="${y + 76}" text-anchor="middle">${KIT.fmt(q * whole, 1)}</text>`);
      }
      out.push(`<text class="toy-text-strong" x="${X0 + BAR + 14 + (shown > 1 ? (shown - 1) * BAR : 0)}" y="${y + 26}">${KIT.fmt(p * 100, 1)} %</text>`);
      return out.join('');
    }

    function draw() {
      stage.svg.innerHTML = bar(34, st.w1, T.whole, 'toy-fill') + bar(158, st.w2, T.whole, 'toy-fill-2');
      const p1 = st.part / st.w1 * 100, p2 = st.part / st.w2 * 100;
      panel.innerHTML =
        KIT.row(`${st.part} / ${st.w1}`, `= ${KIT.fmt(p1, 1)} %`) +
        KIT.row(`${st.part} / ${st.w2}`, `= ${KIT.fmt(p2, 1)} %`) +
        `<div class="toy-note">${T.note}</div>`;
    }
    draw();
  },
};

// ─── percent-ladder ───────────────────────────────────────────────────────────

TOYS['percent-ladder'] = {
  mount(root) {
    const T = TEXTS.sandbox.percentLadder;
    const W = 640, H = 300, BASE = 262, TOP = 40, X0 = 90;
    const st = { start: 100, p1: 20, p2: -20 };
    const stage = KIT.stage(root, W, H, T.aria);
    const controls = document.createElement('div'); controls.className = 'toy-controls'; root.appendChild(controls);
    const panel = KIT.panel(root);
    KIT.hint(root, T.hint);
    const sign = v => `${v > 0 ? '+' : v < 0 ? '−' : ''}${KIT.fmt(Math.abs(v), 1)}`;
    const sl = {
      start: KIT.slider(controls, { label: T.start, min: 20, max: 200, step: 10, value: st.start, onInput: v => { st.start = v; draw(); } }),
      p1: KIT.slider(controls, { label: T.first, min: -50, max: 100, step: 5, value: st.p1, fmt: v => `${sign(v)} %`, onInput: v => { st.p1 = v; draw(); } }),
      p2: KIT.slider(controls, { label: T.second, min: -60, max: 100, step: 0.1, value: st.p2, fmt: v => `${sign(v)} %`, onInput: v => { st.p2 = v; draw(); } }),
    };
    KIT.button(root, T.back, () => {
      const need = Math.round(-st.p1 / (100 + st.p1) * 1000) / 10;               // to get back: -p1/(100+p1)
      st.p2 = need; sl.p2.set(need); draw();
    });
    KIT.button(root, T.reset, () => { Object.assign(st, { start: 100, p1: 20, p2: -20 }); sl.start.set(100); sl.p1.set(20); sl.p2.set(-20); draw(); });

    function draw() {
      const v0 = st.start, v1 = v0 * (1 + st.p1 / 100), v2 = v1 * (1 + st.p2 / 100);
      const top = Math.max(v0, v1, v2, 1), k = (BASE - TOP) / top;
      const bars = [[v0, T.s0, 'toy-fill', ''], [v1, T.s1, 'toy-fill-2', ` (${sign(st.p1)} %)`], [v2, T.s2, 'toy-fill-3', ` (${sign(st.p2)} %)`]];
      const out = [`<line x1="${X0 - 20}" y1="${BASE}" x2="${W - 20}" y2="${BASE}" stroke="var(--clr-text)" stroke-width="2"/>`];
      bars.forEach(([v, label, cls, extra], i) => {
        const x = X0 + i * 175, h = v * k;
        out.push(`<rect x="${x}" y="${BASE - h}" width="110" height="${h}" class="${cls}"/>`);
        out.push(`<text class="toy-text-strong" x="${x + 55}" y="${BASE - h - 8}" text-anchor="middle">${KIT.fmt(v, 1)}${extra}</text>`);
        out.push(`<text class="toy-text-muted" x="${x + 55}" y="${BASE + 18}" text-anchor="middle">${label}</text>`);
      });
      out.push(`<line class="toy-line-dashed" x1="${X0 - 20}" y1="${BASE - v0 * k}" x2="${W - 20}" y2="${BASE - v0 * k}"/>`);
      stage.svg.innerHTML = out.join('');
      const total = (v2 / v0 - 1) * 100, need = -st.p1 / (100 + st.p1) * 100;
      const back = Math.abs(total) < 0.05;
      panel.innerHTML =
        KIT.row(T.afterFirst, `${KIT.fmt(v0, 1)} → ${KIT.fmt(v1, 1)}`) +
        KIT.row(T.afterSecond, `${KIT.fmt(v1, 1)} → ${KIT.fmt(v2, 1)}`) +
        KIT.row(T.total, `${sign(total)} %`, back ? T.backOk : T.notSum(sign(st.p1), sign(st.p2)), back ? 'toy-ok' : 'toy-warn') +
        KIT.row(T.needed(sign(st.p1)), `${sign(need)} %`);
    }
    draw();
  },
};

// ─── compound-interest ────────────────────────────────────────────────────────

TOYS['compound-interest'] = {
  mount(root) {
    const T = TEXTS.sandbox.compound;
    const W = 640, H = 290, BASE = 250, TOP = 30, X0 = 50;
    const st = { principal: 1000, rate: 5, years: 15 };
    const stage = KIT.stage(root, W, H, T.aria);
    const controls = document.createElement('div'); controls.className = 'toy-controls'; root.appendChild(controls);
    const panel = KIT.panel(root);
    KIT.hint(root, T.hint);
    const sl = {
      principal: KIT.slider(controls, { label: T.principal, min: 100, max: 5000, step: 100, value: st.principal, fmt: v => `€${v}`, onInput: v => { st.principal = v; draw(); } }),
      rate: KIT.slider(controls, { label: T.rate, min: 1, max: 20, step: 0.5, value: st.rate, fmt: v => `${v} %`, onInput: v => { st.rate = v; draw(); } }),
      years: KIT.slider(controls, { label: T.years, min: 1, max: 30, step: 1, value: st.years, onInput: v => { st.years = v; draw(); } }),
    };
    KIT.button(root, T.reset, () => { Object.assign(st, { principal: 1000, rate: 5, years: 15 }); sl.principal.set(1000); sl.rate.set(5); sl.years.set(15); draw(); });

    function draw() {
      const { principal: P, rate: r, years: n } = st;
      const comp = y => P * Math.pow(1 + r / 100, y), simple = y => P * (1 + r / 100 * y);
      const top = Math.max(comp(n), simple(n)), k = (BASE - TOP) / top;
      const slot = (W - X0 - 20) / n, bw = Math.min(26, slot * 0.7);
      const out = [`<line x1="${X0 - 8}" y1="${BASE}" x2="${W - 10}" y2="${BASE}" stroke="var(--clr-text)" stroke-width="2"/>`];
      let dots = '';
      for (let y = 1; y <= n; y++) {
        const x = X0 + (y - 0.5) * slot, h = comp(y) * k;
        out.push(`<rect x="${(x - bw / 2).toFixed(1)}" y="${(BASE - h).toFixed(1)}" width="${bw.toFixed(1)}" height="${h.toFixed(1)}" class="toy-fill"/>`);
        dots += `${y === 1 ? 'M' : 'L'} ${x.toFixed(1)} ${(BASE - simple(y) * k).toFixed(1)} `;
        if (n <= 15 || y % 5 === 0 || y === n) out.push(`<text class="toy-tick" x="${x.toFixed(1)}" y="${BASE + 15}" text-anchor="middle">${y}</text>`);
      }
      out.push(`<path d="${dots}" fill="none" stroke="#c0392b" stroke-width="3"/>`);
      out.push(`<text class="toy-text-muted" x="${X0}" y="${H - 8}">${T.axis}</text>`);
      out.push(`<text class="toy-text-strong" x="${W - 12}" y="${BASE - comp(n) * k - 8}" text-anchor="end" fill="var(--clr-primary)">€${KIT.fmt(comp(n), 0)}</text>`);
      out.push(`<text class="toy-text-strong" x="${W - 12}" y="${BASE - simple(n) * k + 16}" text-anchor="end" fill="#c0392b">€${KIT.fmt(simple(n), 0)}</text>`);
      stage.svg.innerHTML = out.join('');
      panel.innerHTML =
        KIT.row(T.compound, `€${KIT.fmt(comp(n), 2)}`, T.compoundNote(KIT.fmt(1 + r / 100, 3), n)) +
        KIT.row(T.simple, `€${KIT.fmt(simple(n), 2)}`, T.simpleNote) +
        KIT.row(T.difference, `€${KIT.fmt(comp(n) - simple(n), 2)}`) +
        KIT.row(T.doubling, `≈ ${KIT.fmt(72 / r, 1)}`, T.doublingNote);
    }
    draw();
  },
};

// ─── fraction-strip ───────────────────────────────────────────────────────────

/** n/d as a decimal: "0.75", or with a repeating part marked by a line: 0.\overline{3} */
function fractionDecimal(n, d) {
  const whole = Math.floor(n / d);
  let rem = n % d, digits = '', seen = new Map();
  while (rem !== 0 && !seen.has(rem) && digits.length < 18) {
    seen.set(rem, digits.length);
    rem *= 10;
    digits += Math.floor(rem / d);
    rem %= d;
  }
  if (rem === 0) return digits ? `${whole}.${digits}` : `${whole}`;
  const at = seen.get(rem);
  return `${whole}.${digits.slice(0, at)}<span class="toy-repeat">${digits.slice(at)}</span>`;
}

TOYS['fraction-strip'] = {
  mount(root) {
    const T = TEXTS.sandbox.fractionStrip;
    const W = 640, H = 250;
    const st = { n: 3, d: 4 };
    const stage = KIT.stage(root, W, H, T.aria);
    const controls = document.createElement('div'); controls.className = 'toy-controls'; root.appendChild(controls);
    const panel = KIT.panel(root);
    KIT.hint(root, T.hint);
    const sl = {
      n: KIT.slider(controls, { label: T.numerator, min: 0, max: st.d, value: st.n, onInput: v => { st.n = v; draw(); } }),
      d: KIT.slider(controls, { label: T.denominator, min: 1, max: 20, value: st.d, onInput: v => {
        st.d = v; sl.n.setRange(0, v); if (st.n > v) { st.n = v; sl.n.set(v); } draw();
      } }),
    };
    const gcd = (a, b) => (b ? gcd(b, a % b) : a);

    function draw() {
      const { n, d } = st, out = [];
      const X = 40, SW = W - 80, cell = SW / d;
      out.push(`<text class="toy-text-strong" x="${X}" y="26">${n}/${d} ${T.ofStrip}</text>`);
      for (let i = 0; i < d; i++) {
        out.push(`<rect x="${(X + i * cell).toFixed(1)}" y="38" width="${cell.toFixed(1)}" height="46" class="${i < n ? 'toy-fill' : 'toy-empty'}" stroke="var(--clr-text)" stroke-width="1.5"/>`);
      }
      // the same amount as 100 small squares: a percent
      const pct = n / d * 100, G = 14, GX = X, GY = 116;
      out.push(`<text class="toy-text-strong" x="${X}" y="106">${KIT.fmt(pct, 1)} ${T.ofHundred}</text>`);
      for (let i = 0; i < 100; i++) {
        const filled = i + 1 <= Math.floor(pct + 1e-9), part = !filled && i < pct - 1e-9;
        out.push(`<rect x="${GX + (i % 25) * (G + 3)}" y="${GY + Math.floor(i / 25) * (G + 3)}" width="${G}" height="${G}" class="${filled ? 'toy-fill' : part ? 'toy-fill-half' : 'toy-empty'}" stroke="var(--clr-border)"/>`);
      }
      stage.svg.innerHTML = out.join('');
      const g = gcd(n, d) || 1, sn = n / g, sd = d / g;
      panel.innerHTML =
        KIT.row(T.fraction, `${n}/${d}`) +
        KIT.row(T.simplest, sd === 1 ? `${sn}` : `${sn}/${sd}`, g > 1 ? T.divided(g) : T.alreadySimplest) +
        KIT.row(T.decimal, fractionDecimal(n, d)) +
        KIT.row(T.percent, `${KIT.fmt(pct, 2)} %`);
    }
    draw();
  },
};
