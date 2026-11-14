/**
 * sandbox-algebra.js
 * Sandbox toys about equations and quadratics:
 *
 *   balance-scale   an equation as a balance: do the same to both sides, until x is alone
 *   square-areas    (a + b)² and (a − b)² as areas: where the middle term 2ab comes from
 *   roots-vieta     drag the two roots: the sum, the product and the equation follow (and back)
 *
 * Load after sandbox.js and sandbox-kit.js, before ui.js. The texts are in TEXTS.sandbox.*.
 */

// ─── balance-scale ────────────────────────────────────────────────────────────

TOYS['balance-scale'] = {
  mount(root) {
    const T = TEXTS.sandbox.balance;
    const W = 640, H = 300, PIVOT = [320, 90], ARM = 210;
    let eq, secret, history, steps, leftOnly = false;
    const stage = KIT.stage(root, W, H, T.aria);
    const actions = document.createElement('div'); actions.className = 'toy-actions'; root.appendChild(actions);
    const panel = KIT.panel(root);
    KIT.hint(root, T.hint);
    const log = document.createElement('ol'); log.className = 'toy-steps'; root.appendChild(log);

    const side = (x, n) => (x === 0 && n === 0 ? '0' : `${x === 0 ? '' : `${x === 1 ? '' : x}x`}${x !== 0 && n !== 0 ? ' + ' : ''}${n === 0 && x !== 0 ? '' : n}`);
    const text = e => `${side(e.a, e.b)} = ${side(e.c, e.d)}`;
    const copy = e => ({ a: e.a, b: e.b, c: e.c, d: e.d });

    function generate() {
      for (;;) {
        const n = 1 + Math.floor(Math.random() * 9), a = 2 + Math.floor(Math.random() * 2), c = Math.floor(Math.random() * a), b = Math.floor(Math.random() * 7);
        const d = a * n + b - c * n;
        if (d < 1 || d > 16 || (a === 1)) continue;
        secret = n; eq = { a, b, c, d }; history = []; steps = []; leftOnly = false; box.checked = false;
        return draw();
      }
    }

    // the operations; each one gives the new equation, or null when it cannot be done
    const OPS = {
      x: { label: T.minusX, apply: (e, only) => (e.a >= 1 && (only || e.c >= 1) ? { ...e, a: e.a - 1, c: only ? e.c : e.c - 1 } : null) },
      one: { label: T.minusOne, apply: (e, only) => (e.b >= 1 && (only || e.d >= 1) ? { ...e, b: e.b - 1, d: only ? e.d : e.d - 1 } : null) },
      d2: { label: T.divide(2), apply: e => ([e.a, e.b, e.c, e.d].every(v => v % 2 === 0) ? { a: e.a / 2, b: e.b / 2, c: e.c / 2, d: e.d / 2 } : null) },
      d3: { label: T.divide(3), apply: e => ([e.a, e.b, e.c, e.d].every(v => v % 3 === 0) ? { a: e.a / 3, b: e.b / 3, c: e.c / 3, d: e.d / 3 } : null) },
    };
    const buttonsByKey = {};
    Object.entries(OPS).forEach(([key, op]) => { buttonsByKey[key] = KIT.button(actions, op.label, () => run(key)); });
    KIT.button(actions, T.undo, () => { if (history.length) { eq = history.pop(); steps.pop(); draw(); } });
    KIT.button(actions, T.next, generate, 'btn btn-primary');
    const lab = document.createElement('label'); lab.className = 'toy-check';
    const box = document.createElement('input'); box.type = 'checkbox';
    box.addEventListener('change', () => { leftOnly = box.checked; draw(); });
    lab.appendChild(box); lab.appendChild(document.createTextNode(` ${T.onlyLeft}`)); actions.appendChild(lab);

    function run(key) {
      const op = OPS[key], next = op.apply(eq, leftOnly && (key === 'x' || key === 'one'));
      if (!next) return;
      history.push(copy(eq)); steps.push(`${op.label}${leftOnly && (key === 'x' || key === 'one') ? ` (${T.leftOnlyShort})` : ''}: ${text(next)}`);
      eq = next; draw();
    }

    const weight = (x, n) => x * secret + n;
    function draw() {
      const diff = weight(eq.a, eq.b) - weight(eq.c, eq.d);                     // the real weights, when x is the secret number
      const angle = Math.max(-14, Math.min(14, diff * 2.5)) * Math.PI / 180;       // the heavier side goes down
      const L = [PIVOT[0] - ARM * Math.cos(angle), PIVOT[1] + ARM * Math.sin(angle)], R = [PIVOT[0] + ARM * Math.cos(angle), PIVOT[1] - ARM * Math.sin(angle)];
      const out = [`<polygon points="${PIVOT[0] - 16},${PIVOT[1] + 150} ${PIVOT[0] + 16},${PIVOT[1] + 150} ${PIVOT[0]},${PIVOT[1]}" fill="var(--clr-border)" stroke="var(--clr-text)" stroke-width="1.5"/>`];
      out.push(`<line x1="${L[0].toFixed(1)}" y1="${L[1].toFixed(1)}" x2="${R[0].toFixed(1)}" y2="${R[1].toFixed(1)}" stroke="var(--clr-text)" stroke-width="5" stroke-linecap="round"/>`);
      out.push(`<circle cx="${PIVOT[0]}" cy="${PIVOT[1]}" r="8" fill="var(--clr-text)"/>`);
      const pan = (P, x, n) => {
        const top = P[1] + 52, items = [];
        for (let i = 0; i < x; i++) items.push('x'); for (let i = 0; i < n; i++) items.push('1');
        const perRow = 7, size = 26;
        const out2 = [`<line x1="${P[0]}" y1="${P[1]}" x2="${P[0] - 90}" y2="${top}" stroke="var(--clr-text)"/><line x1="${P[0]}" y1="${P[1]}" x2="${P[0] + 90}" y2="${top}" stroke="var(--clr-text)"/>`,
          `<path d="M ${P[0] - 100} ${top} L ${P[0] + 100} ${top} L ${P[0] + 80} ${top + 14} L ${P[0] - 80} ${top + 14} Z" fill="var(--clr-text)"/>`];
        items.forEach((kind, i) => {
          const row = Math.floor(i / perRow), col = i % perRow, rowItems = Math.min(perRow, items.length - row * perRow);
          const ix = P[0] - rowItems * (size + 3) / 2 + col * (size + 3), iy = top - (row + 1) * (size + 3);
          out2.push(`<rect x="${ix.toFixed(1)}" y="${iy.toFixed(1)}" width="${size}" height="${size}" rx="3" class="${kind === 'x' ? 'toy-block-x' : 'toy-block-one'}"/><text class="toy-text-strong" x="${(ix + size / 2).toFixed(1)}" y="${(iy + size / 2 + 5).toFixed(1)}" text-anchor="middle" fill="${kind === 'x' ? '#fff' : 'var(--clr-text)'}">${kind}</text>`);
        });
        return out2.join('');
      };
      out.push(pan(L, eq.a, eq.b), pan(R, eq.c, eq.d));
      stage.svg.innerHTML = out.join('');
      const solved = eq.a === 1 && eq.b === 0 && eq.c === 0, balanced = diff === 0;
      Object.entries(OPS).forEach(([key, op]) => { buttonsByKey[key].disabled = !op.apply(eq, leftOnly && (key === 'x' || key === 'one')); });
      panel.innerHTML = KIT.row(T.equation, text(eq)) +
        (balanced ? '' : KIT.row(T.scale, T.unbalanced, T.unbalancedNote, 'toy-warn')) +
        (solved && balanced ? KIT.row(T.solved, `x = ${eq.d}`, T.solvedNote, 'toy-ok') : '');
      log.innerHTML = steps.map(s => `<li>${s}</li>`).join('');
    }
    generate();
  },
};

// ─── square-areas ─────────────────────────────────────────────────────────────

TOYS['square-areas'] = {
  mount(root) {
    const T = TEXTS.sandbox.squares;
    const W = 460, H = 460;
    const st = { mode: 'plus', a: 5, b: 3 };
    KIT.tabs(root, [{ key: 'plus', label: '(a + b)²' }, { key: 'minus', label: '(a − b)²' }], st.mode, key => {
      st.mode = key; if (key === 'minus' && st.b > st.a) { st.b = st.a; sl.b.set(st.b); } sl.b.setRange(1, key === 'minus' ? st.a : 9); draw();
    });
    const stage = KIT.stage(root, W, H, T.aria);
    const controls = document.createElement('div'); controls.className = 'toy-controls'; root.appendChild(controls);
    const panel = KIT.panel(root);
    KIT.hint(root, T.hint);
    const sl = {
      a: KIT.slider(controls, { label: 'a', min: 1, max: 9, value: st.a, onInput: v => { st.a = v; if (st.mode === 'minus' && st.b > v) { st.b = v; sl.b.set(v); } sl.b.setRange(1, st.mode === 'minus' ? v : 9); draw(); } }),
      b: KIT.slider(controls, { label: 'b', min: 1, max: 9, value: st.b, onInput: v => { st.b = v; draw(); } }),
    };

    function draw() {
      const { a, b } = st, out = [];
      const total = st.mode === 'plus' ? a + b : a, k = 380 / total, X0 = 40, Y0 = 410;
      const rect = (x, y, w, h, cls, label) => `<rect x="${(X0 + x * k).toFixed(1)}" y="${(Y0 - (y + h) * k).toFixed(1)}" width="${(w * k).toFixed(1)}" height="${(h * k).toFixed(1)}" class="${cls}" stroke="var(--clr-text)" stroke-width="2"/>` +
        (label ? `<text class="toy-text-strong" x="${(X0 + (x + w / 2) * k).toFixed(1)}" y="${(Y0 - (y + h / 2) * k + 5).toFixed(1)}" text-anchor="middle">${label}</text>` : '');
      if (st.mode === 'plus') {
        out.push(rect(0, 0, a, a, 'toy-fill', `a² = ${a * a}`), rect(a, 0, b, a, 'toy-fill-2', `ab = ${a * b}`), rect(0, a, a, b, 'toy-fill-2', `ab = ${a * b}`), rect(a, a, b, b, 'toy-fill-3', `b² = ${b * b}`));
        out.push(`<text class="toy-text-muted" x="${X0 + (a / 2) * k}" y="${Y0 + 22}" text-anchor="middle">a</text><text class="toy-text-muted" x="${X0 + (a + b / 2) * k}" y="${Y0 + 22}" text-anchor="middle">b</text>`);
        panel.innerHTML = KIT.row('(a + b)²', `(${a} + ${b})² = ${(a + b) ** 2}`) + KIT.row('a² + 2ab + b²', `${a * a} + ${2 * a * b} + ${b * b} = ${a * a + 2 * a * b + b * b}`, T.same, 'toy-ok') +
          `<div class="toy-note">${T.notePlus(2 * a * b)}</div>`;
      } else {
        const r = a - b;
        out.push(rect(0, 0, a, a, 'toy-empty', ''));
        out.push(rect(0, 0, r, r, 'toy-fill-3', r > 0 ? `(a − b)² = ${r * r}` : ''));
        out.push(rect(r, 0, b, a, 'toy-fill-2', '− ab'), rect(0, r, a, b, 'toy-fill-2', '− ab'));
        out.push(rect(r, r, b, b, 'toy-over', `+ b² = ${b * b}`));
        panel.innerHTML = KIT.row('(a − b)²', `(${a} − ${b})² = ${r * r}`) + KIT.row('a² − 2ab + b²', `${a * a} − ${2 * a * b} + ${b * b} = ${a * a - 2 * a * b + b * b}`, T.same, 'toy-ok') +
          `<div class="toy-note">${T.noteMinus}</div>`;
      }
      stage.svg.innerHTML = out.join('');
    }
    draw();
  },
};

// ─── roots-vieta ──────────────────────────────────────────────────────────────

TOYS['roots-vieta'] = {
  mount(root) {
    const T = TEXTS.sandbox.vieta;
    const W = 640, H = 150, X0 = 40, STEP = 28, AXIS = 80;                    // the number line −10…10
    const st = { mode: 'roots', x1: -1, x2: 3, a: 1, b: -2, c: -3 };
    KIT.tabs(root, [{ key: 'roots', label: T.tabRoots }, { key: 'equation', label: T.tabEquation }], st.mode, key => { st.mode = key; showSliders(); draw(); });
    const stage = KIT.stage(root, W, H, T.aria);
    const controls = document.createElement('div'); controls.className = 'toy-controls'; root.appendChild(controls);
    const panel = KIT.panel(root);
    KIT.hint(root, T.hint);
    const mk = (key, label, min, max, step = 1) => KIT.slider(controls, { label, min, max, step, value: st[key], onInput: v => { st[key] = v; draw(); } });
    const sl = { x1: mk('x1', 'x₁', -10, 10), x2: mk('x2', 'x₂', -10, 10), a: mk('a', 'a', 1, 3), b: mk('b', 'b', -10, 10), c: mk('c', 'c', -20, 20) };
    const rows = [...controls.querySelectorAll('.toy-slider')];
    const showSliders = () => rows.forEach((row, i) => { const roots = st.mode === 'roots'; row.style.display = (i < 3) === roots ? '' : 'none'; });
    showSliders();
    const sx = v => X0 + (v + 10) * STEP;
    const signed = (n, first) => (n < 0 ? (first ? '−' : ' − ') : (first ? '' : ' + ')) + KIT.fmt(Math.abs(n), 2);
    const factor = r => (r === 0 ? 'x' : `(x ${r < 0 ? '+' : '−'} ${KIT.fmt(Math.abs(r), 2)})`);
    const term = (n, v, first) => `${n < 0 ? (first ? '−' : ' − ') : (first ? '' : ' + ')}${v && Math.abs(n) === 1 ? '' : KIT.fmt(Math.abs(n), 2)}${v}`;

    function draw() {
      const out = [`<line x1="${X0 - 14}" y1="${AXIS}" x2="${X0 + 20 * STEP + 14}" y2="${AXIS}" stroke="var(--clr-text)" stroke-width="2"/>`];
      for (let v = -10; v <= 10; v++) out.push(`<line x1="${sx(v)}" y1="${AXIS - 5}" x2="${sx(v)}" y2="${AXIS + 5}" stroke="var(--clr-text)"/><text class="toy-tick" x="${sx(v)}" y="${AXIS + 22}" text-anchor="middle">${KIT.fmt(v, 0)}</text>`);
      let roots, a, b, c, extra = '';
      if (st.mode === 'roots') {
        a = st.a; roots = [st.x1, st.x2]; b = -a * (st.x1 + st.x2); c = a * st.x1 * st.x2;
      } else {
        a = 1; b = st.b; c = st.c; const D = b * b - 4 * c; roots = D >= 0 ? (D === 0 ? [-b / 2] : [(-b - Math.sqrt(D)) / 2, (-b + Math.sqrt(D)) / 2]) : [];
      }
      roots.forEach((r, i) => { if (r >= -10 && r <= 10) out.push(`<g class="${st.mode === 'roots' ? 'toy-vertex' : ''}" data-i="${i}"><circle class="toy-handle-hit" cx="${sx(r)}" cy="${AXIS}" r="18"/><circle class="${i ? 'toy-dot-2' : 'toy-dot'}" cx="${sx(r)}" cy="${AXIS}" r="9"/></g><text class="toy-text-strong" x="${sx(r)}" y="${AXIS - 18}" text-anchor="middle">x${i ? '₂' : '₁'} = ${KIT.fmt(r, 2)}</text>`); });
      stage.svg.innerHTML = out.join('');
      const eq = `${term(a, 'x²', true)}${b === 0 ? '' : term(b, 'x', false)}${c === 0 ? '' : term(c, '', false)} = 0`;
      if (st.mode === 'roots') {
        panel.innerHTML = KIT.row(T.sum, `x₁ + x₂ = ${KIT.fmt(st.x1 + st.x2, 2)}`, T.sumNote(KIT.fmt(-b / a, 2)), 'toy-ok') +
          KIT.row(T.product, `x₁ · x₂ = ${KIT.fmt(st.x1 * st.x2, 2)}`, T.productNote(KIT.fmt(c / a, 2)), 'toy-ok') +
          KIT.row(T.factored, `${a === 1 ? '' : a}${factor(st.x1)}${factor(st.x2)} = 0`) + KIT.row(T.expanded, eq, T.expandedNote);
      } else {
        const D = b * b - 4 * c;
        panel.innerHTML = KIT.row(T.equation, eq) + KIT.row('D = b² − 4ac', KIT.fmt(D, 2), D > 0 ? T.two : D === 0 ? T.one : T.noRoots, D < 0 ? 'toy-warn' : 'toy-ok') +
          (roots.length ? KIT.row(T.roots, roots.map(r => KIT.fmt(r, 2)).join(' ; ')) + KIT.row(T.sum, `${KIT.fmt(roots.reduce((s, r) => s + r, 0) * (roots.length === 1 ? 2 : 1), 2)}`, T.sumNote(KIT.fmt(-b, 2)), 'toy-ok') +
            KIT.row(T.product, `${KIT.fmt(roots.length === 1 ? roots[0] * roots[0] : roots[0] * roots[1], 2)}`, T.productNote(KIT.fmt(c, 2)), 'toy-ok') : '');
      }
    }

    let dragging = -1;
    KIT.drag(stage.svg, W, H, {
      start: (pt, e) => { if (st.mode !== 'roots') return false; const g = e.target.closest('[data-i]'); if (!g) return false; dragging = +g.dataset.i; return true; },
      move: pt => { const v = Math.max(-10, Math.min(10, Math.round((pt.x - X0) / STEP - 10))); if (dragging === 0) { st.x1 = v; sl.x1.set(v); } else { st.x2 = v; sl.x2.set(v); } draw(); },
      end: () => { dragging = -1; },
    });
    draw();
  },
};
