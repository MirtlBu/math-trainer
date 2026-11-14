/**
 * sandbox-graphs.js
 * Sandbox toys about lines and parabolas:
 *
 *   line-sliders      y = kx + b with sliders for k and b: the slope triangle, the y-intercept, the zero, a table
 *   two-lines         two lines and their common point = the solution of a system of equations
 *   parabola-sliders  y = ax² + bx + c with sliders: the roots, the vertex, the discriminant, Vieta
 *   guess-the-line    some points on a hidden line: set k and b until your line goes through all of them
 *
 * Load after sandbox.js and sandbox-kit.js, before ui.js. The texts are in TEXTS.sandbox.*.
 */

/** "y = −1.5x + 2" with real minus signs, as text */
function lineText(k, b, name = 'y') {
  const kk = Math.abs(k) === 1 ? '' : KIT.fmt(Math.abs(k), 2);
  const first = k === 0 ? '' : `${k < 0 ? '−' : ''}${kk}x`;
  const rest = b === 0 ? (k === 0 ? '0' : '') : `${k === 0 ? (b < 0 ? '−' : '') : (b < 0 ? ' − ' : ' + ')}${KIT.fmt(Math.abs(b), 2)}`;
  return `${name} = ${first}${rest}`;
}

const GRAPH_SIZE = 370;                                          // 16 × 16 cells of 20 px plus room for the numbers
const graphStage = (root, aria) => { const st = KIT.stage(root, GRAPH_SIZE, GRAPH_SIZE, aria); st.svg.style.cssText = `max-width: ${GRAPH_SIZE}px; margin: 0 auto;`; return st; };
const squarePlot = () => KIT.plot({ w: GRAPH_SIZE, h: GRAPH_SIZE, x: [-8, 8], y: [-8, 8], pad: { l: 30, r: 20, t: 20, b: 30 } });

// ─── line-sliders ─────────────────────────────────────────────────────────────

TOYS['line-sliders'] = {
  mount(root) {
    const T = TEXTS.sandbox.lineSliders;
    const st = { k: 1.5, b: 2 };
    const stage = graphStage(root, T.aria);
    const controls = document.createElement('div'); controls.className = 'toy-controls'; root.appendChild(controls);
    const panel = KIT.panel(root);
    KIT.hint(root, T.hint);
    const sl = {
      k: KIT.slider(controls, { label: T.slope, min: -4, max: 4, step: 0.5, value: st.k, onInput: v => { st.k = v; draw(); } }),
      b: KIT.slider(controls, { label: T.intercept, min: -6, max: 6, step: 0.5, value: st.b, onInput: v => { st.b = v; draw(); } }),
    };
    KIT.button(root, T.reset, () => { st.k = 1.5; st.b = 2; sl.k.set(1.5); sl.b.set(2); draw(); });
    const P = squarePlot();

    function draw() {
      const { k, b } = st, f = x => k * x + b, out = [P.grid(), P.path(f)];
      const inside = (x, y) => Math.abs(x) <= 8 && Math.abs(y) <= 8;
      // the slope triangle: 2 to the right, 2k up, starting at the y-intercept
      if (inside(0, b) && inside(2, b + 2 * k)) {
        out.push(`<path d="M ${P.sx(0)} ${P.sy(b)} L ${P.sx(2)} ${P.sy(b)} L ${P.sx(2)} ${P.sy(b + 2 * k)}" fill="none" stroke="#c0392b" stroke-width="2.5" stroke-dasharray="6 4"/>`);
        out.push(`<text class="toy-text-muted" x="${P.sx(1)}" y="${P.sy(b) + (k >= 0 ? 15 : -7)}" text-anchor="middle">${T.run}</text>`);
        out.push(`<text class="toy-text-muted" x="${P.sx(2) + 6}" y="${P.sy(b + k) + 4}">${T.rise(KIT.fmt(2 * k, 1))}</text>`);
      }
      if (inside(0, b)) out.push(`<circle class="toy-dot" cx="${P.sx(0)}" cy="${P.sy(b)}" r="6"/><text class="toy-text-strong" x="${P.sx(0) + 10}" y="${P.sy(b) - 8}">(0, ${KIT.fmt(b, 1)})</text>`);
      if (k !== 0 && inside(-b / k, 0)) out.push(`<circle class="toy-dot-2" cx="${P.sx(-b / k)}" cy="${P.sy(0)}" r="6"/>`);
      stage.svg.innerHTML = out.join('');
      const xs = [-2, -1, 0, 1, 2];
      const table = `<table class="toy-table"><tr><th>x</th>${xs.map(x => `<td>${x}</td>`).join('')}</tr><tr><th>y</th>${xs.map(x => `<td>${KIT.fmt(f(x), 2).replace('-', '−')}</td>`).join('')}</tr></table>`;
      panel.innerHTML = KIT.row(T.equation, lineText(k, b)) +
        KIT.row(T.slopeMeaning, k === 0 ? T.flat : T.slopeText(KIT.fmt(Math.abs(k), 2), k > 0)) +
        KIT.row(T.yIntercept, `(0, ${KIT.fmt(b, 1)})`, T.yInterceptText) +
        KIT.row(T.zero, k === 0 ? (b === 0 ? T.everywhere : T.never) : `x = ${KIT.fmt(-b / k, 2)}`, k === 0 ? '' : T.zeroText) + table;
    }
    draw();
  },
};

// ─── two-lines ────────────────────────────────────────────────────────────────

TOYS['two-lines'] = {
  mount(root) {
    const T = TEXTS.sandbox.twoLines;
    const st = { k1: 2, b1: -1, k2: -1, b2: 5 };
    const stage = graphStage(root, T.aria);
    const controls = document.createElement('div'); controls.className = 'toy-controls'; root.appendChild(controls);
    const panel = KIT.panel(root);
    KIT.hint(root, T.hint);
    const mk = (key, label, min, max, step) => KIT.slider(controls, { label, min, max, step, value: st[key], onInput: v => { st[key] = v; draw(); } });
    const sl = { k1: mk('k1', T.k1, -4, 4, 0.5), b1: mk('b1', T.b1, -6, 6, 1), k2: mk('k2', T.k2, -4, 4, 0.5), b2: mk('b2', T.b2, -6, 6, 1) };
    KIT.button(root, T.reset, () => { Object.assign(st, { k1: 2, b1: -1, k2: -1, b2: 5 }); Object.keys(sl).forEach(key => sl[key].set(st[key])); draw(); });
    const P = squarePlot();

    function draw() {
      const { k1, b1, k2, b2 } = st, out = [P.grid(), P.path(x => k1 * x + b1), P.path(x => k2 * x + b2, 'toy-curve-2')];
      const parallel = k1 === k2, same = parallel && b1 === b2;
      let solution = '';
      if (!parallel) {
        const x = (b2 - b1) / (k1 - k2), y = k1 * x + b1;
        if (Math.abs(x) <= 8 && Math.abs(y) <= 8) out.push(`<circle cx="${P.sx(x)}" cy="${P.sy(y)}" r="7" fill="#1a773e" stroke="#fff" stroke-width="2"/><text class="toy-text-strong" x="${P.sx(x) + 10}" y="${P.sy(y) - 10}">(${KIT.fmt(x, 2)}, ${KIT.fmt(y, 2)})</text>`);
        solution = KIT.row(T.solution, `x = ${KIT.fmt(x, 3)}, y = ${KIT.fmt(y, 3)}`, '', 'toy-ok') +
          KIT.row(T.steps, `${KIT.fmt(k1, 2)}x ${b1 < 0 ? '−' : '+'} ${KIT.fmt(Math.abs(b1), 2)} = ${KIT.fmt(k2, 2)}x ${b2 < 0 ? '−' : '+'} ${KIT.fmt(Math.abs(b2), 2)}`, T.stepsNote(KIT.fmt(k1 - k2, 2), KIT.fmt(b2 - b1, 2)));
      } else {
        solution = KIT.row(T.solution, same ? T.same : T.none, same ? T.sameNote : T.noneNote, same ? '' : 'toy-warn');
      }
      stage.svg.innerHTML = out.join('');
      panel.innerHTML = KIT.row(T.line1, lineText(k1, b1)) + KIT.row(T.line2, lineText(k2, b2)) + solution;
    }
    draw();
  },
};

// ─── parabola-sliders ─────────────────────────────────────────────────────────

TOYS['parabola-sliders'] = {
  mount(root) {
    const T = TEXTS.sandbox.parabola;
    const st = { a: 1, b: -2, c: -3 };
    const stage = graphStage(root, T.aria);
    const controls = document.createElement('div'); controls.className = 'toy-controls'; root.appendChild(controls);
    const panel = KIT.panel(root);
    KIT.hint(root, T.hint);
    const sl = {
      a: KIT.slider(controls, { label: 'a', min: -3, max: 3, step: 0.5, value: st.a, onInput: v => { if (v === 0) { v = 0.5; sl.a.set(0.5); } st.a = v; draw(); } }),
      b: KIT.slider(controls, { label: 'b', min: -8, max: 8, step: 1, value: st.b, onInput: v => { st.b = v; draw(); } }),
      c: KIT.slider(controls, { label: 'c', min: -8, max: 8, step: 1, value: st.c, onInput: v => { st.c = v; draw(); } }),
    };
    KIT.button(root, T.reset, () => { Object.assign(st, { a: 1, b: -2, c: -3 }); Object.keys(sl).forEach(key => sl[key].set(st[key])); draw(); });
    const P = squarePlot();
    // a term of the equation: the sign, the number (1 is left out before x) and the variable
    const term = (n, v, first) => `${n < 0 ? (first ? '−' : ' − ') : (first ? '' : ' + ')}${v && Math.abs(n) === 1 ? '' : KIT.fmt(Math.abs(n), 2)}${v}`;

    function draw() {
      const { a, b, c } = st, f = x => a * x * x + b * x + c;
      const D = b * b - 4 * a * c, xv = -b / (2 * a), yv = f(xv);
      const out = [P.grid()];
      out.push(`<line class="toy-line-dashed" x1="${P.sx(xv)}" y1="${P.pad.t}" x2="${P.sx(xv)}" y2="${P.pad.t + P.ph}"/>`);        // the axis of symmetry
      out.push(P.path(f));
      let roots = [];
      if (D >= 0) roots = D === 0 ? [xv] : [(-b - Math.sqrt(D)) / (2 * a), (-b + Math.sqrt(D)) / (2 * a)];
      roots.forEach(x => { if (Math.abs(x) <= 8) out.push(`<circle class="toy-dot-2" cx="${P.sx(x)}" cy="${P.sy(0)}" r="6"/><text class="toy-text-strong" x="${P.sx(x)}" y="${P.sy(0) + (a > 0 ? 22 : -12)}" text-anchor="middle">${KIT.fmt(x, 2)}</text>`); });
      if (Math.abs(xv) <= 8 && Math.abs(yv) <= 8) out.push(`<circle class="toy-dot" cx="${P.sx(xv)}" cy="${P.sy(yv)}" r="6"/><text class="toy-text-muted" x="${P.sx(xv) + 9}" y="${P.sy(yv) + (a > 0 ? 18 : -9)}">(${KIT.fmt(xv, 2)}, ${KIT.fmt(yv, 2)})</text>`);
      stage.svg.innerHTML = out.join('');
      const eq = `y = ${term(a, 'x²', true)}${b === 0 ? '' : term(b, 'x', false)}${c === 0 ? '' : term(c, '', false)}`;
      panel.innerHTML = KIT.row(T.equation, eq) +
        KIT.row('D = b² − 4ac', `${b * b} − ${4 * a * c < 0 ? `(${KIT.fmt(4 * a * c, 2)})` : KIT.fmt(4 * a * c, 2)} = ${KIT.fmt(D, 2)}`, D > 0 ? T.two : D === 0 ? T.one : T.none, D < 0 ? 'toy-warn' : 'toy-ok') +
        KIT.row(T.roots, roots.length ? roots.map(x => KIT.fmt(x, 2)).join(' ; ') : '—', roots.length ? T.rootsNote : '') +
        (roots.length ? KIT.row(T.vieta, `x₁ + x₂ = ${KIT.fmt(-b / a, 2)} ; x₁ · x₂ = ${KIT.fmt(c / a, 2)}`, T.vietaNote) : '') +
        KIT.row(T.vertex, `x = −b / 2a = ${KIT.fmt(xv, 2)}`, T.vertexNote);
    }
    draw();
  },
};

// ─── guess-the-line ───────────────────────────────────────────────────────────

TOYS['guess-the-line'] = {
  mount(root) {
    const T = TEXTS.sandbox.guessLine;
    const st = { k: 1, b: 0, target: null, shown: false, hint: 0 };
    const stage = graphStage(root, T.aria);
    const controls = document.createElement('div'); controls.className = 'toy-controls'; root.appendChild(controls);
    const panel = KIT.panel(root);
    KIT.hint(root, T.hint);
    const sl = {
      k: KIT.slider(controls, { label: T.slope, min: -4, max: 4, step: 0.5, value: st.k, onInput: v => { st.k = v; draw(); } }),
      b: KIT.slider(controls, { label: T.intercept, min: -6, max: 6, step: 0.5, value: st.b, onInput: v => { st.b = v; draw(); } }),
    };
    const P = squarePlot();
    const pick = list => list[Math.floor(Math.random() * list.length)];

    function newPuzzle() {
      const k = pick([-3, -2, -1.5, -1, -0.5, 0.5, 1, 1.5, 2, 3]), b = Math.floor(Math.random() * 11) - 5;
      const step = Number.isInteger(k) ? 1 : 2, xs = [];
      for (let x = -6; x <= 6; x += step) if (Math.abs(k * x + b) <= 7 && Math.abs(k * x + b) % 1 === 0) xs.push(x);
      const dots = [];
      while (dots.length < 3 && xs.length) dots.push(xs.splice(Math.floor(Math.random() * xs.length), 1)[0]);
      if (dots.length < 3) return newPuzzle();
      st.target = { k, b, dots: dots.sort((p, q) => p - q) };
      st.shown = false; st.hint = 0; st.k = 0; st.b = 0; sl.k.set(0); sl.b.set(0);
      draw();
    }
    KIT.button(root, T.next, newPuzzle, 'btn btn-primary');
    KIT.button(root, T.hintButton, () => { st.hint = Math.min(2, st.hint + 1); draw(); });
    KIT.button(root, T.show, () => { st.shown = true; draw(); });

    function draw() {
      const { k, b } = st, t = st.target, out = [P.grid()];
      if (st.shown) out.push(P.path(x => t.k * x + t.b, 'toy-line-dashed'));
      out.push(P.path(x => k * x + b));
      t.dots.forEach(x => {
        const y = t.k * x + t.b, on = Math.abs(k * x + b - y) < 1e-9;
        out.push(`<circle cx="${P.sx(x)}" cy="${P.sy(y)}" r="7" fill="${on ? '#1a773e' : '#c0392b'}" stroke="#fff" stroke-width="2"/>`);
      });
      stage.svg.innerHTML = out.join('');
      const hit = t.dots.filter(x => Math.abs(k * x + b - (t.k * x + t.b)) < 1e-9).length, solved = Math.abs(k - t.k) < 1e-9 && Math.abs(b - t.b) < 1e-9;
      const hints = [];
      if (st.hint >= 1) hints.push(KIT.row(T.hint1, T.hint1Text(t.b)));
      if (st.hint >= 2) hints.push(KIT.row(T.hint2, T.hint2Text(t.dots[0], t.dots[1], KIT.fmt(t.k * t.dots[0] + t.b, 1), KIT.fmt(t.k * t.dots[1] + t.b, 1))));
      panel.innerHTML = KIT.row(T.yours, lineText(k, b)) +
        KIT.row(T.onLine, `${hit} / 3`, solved ? T.solved : '', solved ? 'toy-ok' : (hit === 3 ? 'toy-warn' : '')) +
        (st.shown ? KIT.row(T.answer, lineText(t.k, t.b)) : '') + hints.join('');
    }
    newPuzzle();
  },
};
