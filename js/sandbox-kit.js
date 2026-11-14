/**
 * sandbox-kit.js
 * Small building blocks shared by the sandbox toys (sandbox-*.js): sliders, tabs, buttons, an info panel,
 * an SVG stage, a coordinate plot with a grid, pointer dragging and a tween.
 *
 *   KIT.stage(parent, w, h, aria)            → { svg, wrap }       the picture (viewBox w × h)
 *   KIT.slider(parent, { label, min, max, step, value, fmt, onInput }) → { get(), set(v) }
 *   KIT.tabs(parent, [{ key, label }], active, onChange)             → { set(key) }
 *   KIT.button(parent, label, onClick, cls)  → the button
 *   KIT.panel(parent)                        → the element to put the numbers into (innerHTML)
 *   KIT.hint(parent, text)
 *   KIT.plot({ w, h, x: [min, max], y: [min, max], xStep, yStep, pad }) → { sx, sy, ix, iy, grid, path(fn) }
 *   KIT.drag(svg, w, h, { start(pt, e) → bool, move(pt, e), end() })   pt: the point in viewBox units
 *   KIT.tween(ms, fn, done)                  → cancel()   fn(t) for t from 0 to 1
 *   KIT.fmt(n, digits)                       → "3.1" (no trailing zeros)
 *
 * Load after sandbox.js, before the toys.
 */

const KIT = {
  fmt: (n, digits = 1) => String(Number(n.toFixed(digits))).replace('-', '\u2212'),          // a real minus sign

  /** the picture; by default inside a wrapper div (.toy-stage, the place for an input over the picture); { wrap: false } gives the bare svg */
  stage(parent, w, h, aria, { wrap = true } = {}) {
    if (!wrap) {
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('class', 'toy-svg'); svg.setAttribute('viewBox', `0 0 ${w} ${h}`); svg.setAttribute('role', 'img'); svg.setAttribute('aria-label', aria || '');
      parent.appendChild(svg);
      return { svg, wrap: null };
    }
    const box = document.createElement('div');
    box.className = 'toy-stage';
    box.innerHTML = `<svg class="toy-svg" viewBox="0 0 ${w} ${h}" role="img" aria-label="${aria || ''}"></svg>`;
    parent.appendChild(box);
    return { svg: box.querySelector('svg'), wrap: box };
  },

  slider(parent, { label, min, max, step = 1, value, fmt: fmtIn = v => String(v).replace('-', '\u2212'), onInput }) {
    let fmt = fmtIn;
    const row = document.createElement('label');
    row.className = 'toy-slider';
    row.innerHTML = `<span class="toy-slider-label">${label}</span>` +
      `<input type="range" min="${min}" max="${max}" step="${step}" value="${value}"><output>${fmt(value)}</output>`;
    const input = row.querySelector('input'), out = row.querySelector('output');
    input.addEventListener('input', () => { out.textContent = fmt(+input.value); if (onInput) onInput(+input.value); });
    parent.appendChild(row);
    return {
      get: () => +input.value,
      set: v => { input.value = v; out.textContent = fmt(+input.value); },
      setRange: (lo, hi, st) => { input.min = lo; input.max = hi; if (st) input.step = st; out.textContent = fmt(+input.value); },
      setFmt: f => { fmt = f; out.textContent = fmt(+input.value); },
      row,
    };
  },

  tabs(parent, items, active, onChange) {
    const bar = document.createElement('div');
    bar.className = 'toy-tabs';
    bar.setAttribute('role', 'tablist');
    items.forEach(({ key, label }) => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'toy-tab'; b.dataset.tab = key; b.textContent = label;
      b.setAttribute('role', 'tab');
      b.addEventListener('click', () => set(key, true));
      bar.appendChild(b);
    });
    function set(key, fire) {
      bar.querySelectorAll('.toy-tab').forEach(b => {
        b.classList.toggle('active', b.dataset.tab === key);
        b.setAttribute('aria-selected', String(b.dataset.tab === key));
      });
      if (fire && onChange) onChange(key);
    }
    parent.appendChild(bar);
    set(active, false);
    return { set: key => set(key, true) };
  },

  button(parent, label, onClick, cls = 'btn btn-secondary') {
    const b = document.createElement('button');
    b.type = 'button'; b.className = `${cls} toy-button`; b.textContent = label;
    b.addEventListener('click', onClick);
    parent.appendChild(b);
    return b;
  },

  panel(parent) {
    const el = document.createElement('div');
    el.className = 'toy-panel';
    parent.appendChild(el);
    return el;
  },

  hint(parent, text) {
    const p = document.createElement('p');
    p.className = 'toy-hint';
    p.textContent = text;
    parent.appendChild(p);
    return p;
  },

  /** a row of the panel: a name, a value (bold), an optional remark */
  row(name, value, remark = '', cls = '') {
    return `<div class="toy-row ${cls}"><span>${name}</span><b>${value}</b>${remark ? `<em>${remark}</em>` : ''}</div>`;
  },

  /** a grid of cols × rows cells (each `cell` px), from the corner (x0, y0): the background that shows what 1 unit is */
  gridBg(x0, y0, cols, rows, cell, cls = 'toy-grid') {
    const out = [];
    for (let i = 0; i <= cols; i++) out.push(`<line class="${cls}" x1="${x0 + i * cell}" y1="${y0}" x2="${x0 + i * cell}" y2="${y0 + rows * cell}"/>`);
    for (let j = 0; j <= rows; j++) out.push(`<line class="${cls}" x1="${x0}" y1="${y0 + j * cell}" x2="${x0 + cols * cell}" y2="${y0 + j * cell}"/>`);
    return out.join('');
  },

  /**
   * The common grid of the geometric toys: every toy is 720 units wide and a cell is 16 units, so one centimetre
   * looks the same everywhere (the widest grids, 40 cells, fit). `gridStage` makes the picture for a grid of `rows` rows
   * (a bare svg, at most 720 px wide); `gridX(cols)` is the left edge of a grid of `cols` columns, centred in the picture.
   */
  GRID: { cell: 16, width: 720 },
  gridStage(parent, rows, { top = 16, bottom = 30, aria = '', wrap = false } = {}) {
    const H = top + rows * KIT.GRID.cell + bottom;
    const st = KIT.stage(parent, KIT.GRID.width, H, aria, { wrap });
    st.svg.style.cssText = 'max-width: 720px; margin: 0 auto;';
    return { ...st, W: KIT.GRID.width, H, top };
  },
  gridX: cols => (KIT.GRID.width - cols * KIT.GRID.cell) / 2,

  /** coordinates of a plot: a grid with the axes and tick numbers */
  plot({ w, h, x, y, xStep = 1, yStep = 1, pad = { l: 34, r: 24, t: 20, b: 30 }, tickEvery = 1 }) {
    const pw = w - pad.l - pad.r, ph = h - pad.t - pad.b;
    const sx = v => pad.l + (v - x[0]) / (x[1] - x[0]) * pw;
    const sy = v => pad.t + ph - (v - y[0]) / (y[1] - y[0]) * ph;
    const ix = px => x[0] + (px - pad.l) / pw * (x[1] - x[0]);
    const iy = py => y[0] + (pad.t + ph - py) / ph * (y[1] - y[0]);
    const ax = sx(Math.min(Math.max(0, x[0]), x[1])), ay = sy(Math.min(Math.max(0, y[0]), y[1]));
    const f = n => n.toFixed(1);
    const grid = () => {
      const out = [];
      for (let v = Math.ceil(x[0] / xStep) * xStep; v <= x[1] + 1e-9; v += xStep) {
        out.push(`<line class="toy-grid" x1="${f(sx(v))}" y1="${pad.t}" x2="${f(sx(v))}" y2="${pad.t + ph}"/>`);
      }
      for (let v = Math.ceil(y[0] / yStep) * yStep; v <= y[1] + 1e-9; v += yStep) {
        out.push(`<line class="toy-grid" x1="${pad.l}" y1="${f(sy(v))}" x2="${pad.l + pw}" y2="${f(sy(v))}"/>`);
      }
      out.push(`<line class="toy-axis" x1="${f(ax)}" y1="${pad.t}" x2="${f(ax)}" y2="${pad.t + ph}"/>`);
      out.push(`<line class="toy-axis" x1="${pad.l}" y1="${f(ay)}" x2="${pad.l + pw}" y2="${f(ay)}"/>`);
      for (let v = Math.ceil(x[0] / xStep) * xStep; v <= x[1] + 1e-9; v += xStep) {
        if (v !== 0 && Math.round(v / xStep) % tickEvery === 0) out.push(`<text class="toy-tick" x="${f(sx(v))}" y="${f(ay + 15)}" text-anchor="middle">${KIT.fmt(v)}</text>`);
      }
      for (let v = Math.ceil(y[0] / yStep) * yStep; v <= y[1] + 1e-9; v += yStep) {
        if (v !== 0 && Math.round(v / yStep) % tickEvery === 0) out.push(`<text class="toy-tick" x="${f(ax - 6)}" y="${f(sy(v) + 4)}" text-anchor="end">${KIT.fmt(v)}</text>`);
      }
      return out.join('');
    };
    /** the graph of fn as a path, cut at the edges of the plot */
    const path = (fn, cls = 'toy-curve', steps = 160) => {
      let d = '', pen = false;
      for (let i = 0; i <= steps; i++) {
        const xv = x[0] + (x[1] - x[0]) * i / steps, yv = fn(xv);
        if (!Number.isFinite(yv) || yv < y[0] - 1e-9 || yv > y[1] + 1e-9) { pen = false; continue; }
        d += `${pen ? 'L' : 'M'} ${f(sx(xv))} ${f(sy(yv))} `;
        pen = true;
      }
      return `<path class="${cls}" d="${d}"/>`;
    };
    return { sx, sy, ix, iy, grid, path, pad, pw, ph, ax, ay };
  },

  /** pointer dragging on an svg: the handlers get the point in viewBox units */
  drag(svg, w, h, { start, move, end }) {
    let active = false;
    const pt = e => {
      const box = svg.getBoundingClientRect();
      return { x: (e.clientX - box.left) * w / box.width, y: (e.clientY - box.top) * h / box.height };
    };
    svg.addEventListener('pointerdown', e => {
      if (!start(pt(e), e)) return;
      active = true;
      if (svg.setPointerCapture) svg.setPointerCapture(e.pointerId);
      e.preventDefault();
    });
    svg.addEventListener('pointermove', e => { if (active) move(pt(e), e); });
    const stop = () => { if (active) { active = false; if (end) end(); } };
    svg.addEventListener('pointerup', stop);
    svg.addEventListener('pointercancel', stop);
  },

  /** calls fn(t) for t from 0 to 1 over `ms` milliseconds; returns a function that stops it */
  tween(ms, fn, done) {
    let raf = 0, stopped = false;
    const t0 = performance.now();
    const step = now => {
      if (stopped) return;
      const t = Math.min(1, (now - t0) / ms);
      fn(t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);              // ease in and out
      if (t < 1) raf = requestAnimationFrame(step); else if (done) done();
    };
    raf = requestAnimationFrame(step);
    return () => { stopped = true; cancelAnimationFrame(raf); };
  },
};
