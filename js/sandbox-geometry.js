/**
 * sandbox-geometry.js
 * Sandbox toys about shapes. All of them are drawn on the common grid (KIT.GRID: a cell is 16 units, the picture is
 * 720 units wide, 1 cell = 1 cm) and every length is a whole number of cm from 1 to 10 (the radius up to 5).
 *
 *   rectangle-fixed   a rectangle with a fixed perimeter (or a fixed area): drag its sides, the other quantity changes
 *   angle-sum         the corners of a triangle torn off and put together: a straight angle
 *   pythagoras        squares on the sides of a triangle; a² + b² = c² only for a right angle
 *   area-cutting      a parallelogram becomes a rectangle, two triangles become a parallelogram
 *   cuboid-net        a cuboid: the six faces unfolded (the surface), and the layers (the volume)
 *   circle-unroll     the circumference unrolled next to the diameters, the area as sectors in a row
 *   similar-scale     a triangle scaled by k: the sides ×k, the perimeter ×k, the area ×k²
 *
 * Load after sandbox.js and sandbox-kit.js, before ui.js. The texts are in TEXTS.sandbox.*.
 */

const toyControls = root => { const c = document.createElement('div'); c.className = 'toy-controls'; root.appendChild(c); return c; };
const CELL = KIT.GRID.cell;

// ─── rectangle-fixed ──────────────────────────────────────────────────────────

TOYS['rectangle-fixed'] = {
  mount(root) {
    const T = TEXTS.sandbox.rectangleFixed;
    const COLS = 36, ROWS = 14, MAXV = 10, GX = KIT.gridX(COLS);
    const st = { mode: 'perimeter', total: 20, x0: 0, w: 3, h: 7 };                  // the rectangle: the left edge x0, the width w, the height h (its bottom is on the bottom of the grid)
    KIT.tabs(root, [{ key: 'perimeter', label: T.fixedPerimeter }, { key: 'area', label: T.fixedArea }], st.mode, key => {
      st.mode = key;
      if (key === 'perimeter') { st.total = 20; sl.total.setRange(8, 22, 2); } else { st.total = 24; sl.total.setRange(6, 60, 1); }
      sl.total.set(st.total); sl.total.setFmt(totalFmt); restart(); draw();
    });
    const stage = KIT.gridStage(root, ROWS, { aria: T.aria });
    const GY = stage.top;
    const controls = toyControls(root);
    const panel = KIT.panel(root);
    KIT.hint(root, T.hint);
    const totalFmt = v => (st.mode === 'perimeter' ? `${v} cm` : `${v} cm²`);
    const sl = { total: KIT.slider(controls, { label: T.total, min: 8, max: 22, step: 2, value: st.total, fmt: totalFmt, onInput: v => { st.total = v; restart(); draw(); } }) };

    // the two sides depend on each other: w + h = P/2 with a fixed perimeter, w · h = A with a fixed area; both are 1 … 10 cm
    const otherOf = v => (st.mode === 'perimeter' ? st.total / 2 - v : st.total / v);
    const okW = w => w >= 1 && w <= MAXV && otherOf(w) >= 1 && otherOf(w) <= MAXV + 1e-9;
    function restart() {
      let w = Math.max(1, Math.round(st.mode === 'perimeter' ? st.total / 6 : Math.sqrt(st.total) * 0.8));
      while (!okW(w) && w < MAXV) w++;
      st.w = w; st.h = otherOf(w); st.x0 = Math.floor((COLS - w) / 2);      // respawns in the middle of the grid, on its bottom
    }
    // moving a side: the new value of the dragged side (a whole number of cells); the other side follows
    const keepInside = (x0, w) => Math.max(0, Math.floor(Math.min(x0, COLS - w) + 1e-9));
    function setWidth(w, x0 = st.x0) { if (!okW(w)) return false; st.w = w; st.h = otherOf(w); st.x0 = keepInside(x0, w); return true; }
    function setHeight(h) { const w = otherOf(h); if (!(h >= 1 && h <= MAXV && okW(w) && Math.abs(otherOf(w) - h) < 1e-9)) return false; st.h = h; st.w = w; st.x0 = keepInside(st.x0, w); return true; }
    const sideMove = {
      top: gy => setHeight(Math.round(gy)),
      right: gx => setWidth(Math.round(gx) - st.x0),
      left: gx => { const right = st.x0 + st.w, nx = Math.max(0, Math.min(Math.round(gx), right - 1)); return setWidth(right - nx, nx); },
    };

    function draw() {
      const { x0, w, h } = st, out = [KIT.gridBg(GX, GY, COLS, ROWS, CELL)];
      const bottom = GY + ROWS * CELL, left = GX + x0 * CELL, right = GX + (x0 + w) * CELL, top = bottom - h * CELL;
      out.push(`<rect x="${left}" y="${top.toFixed(1)}" width="${w * CELL}" height="${(h * CELL).toFixed(1)}" class="toy-fill" stroke="var(--clr-text)" stroke-width="2.5"/>`);
      // the sides that can be dragged (the bottom is fixed to the bottom of the grid); each has a wide invisible band to grab
      const band = (side, x1, y1, x2, y2, cursor, label) => `<g class="toy-side-handle" data-side="${side}" tabindex="0" role="slider" aria-label="${label}" style="cursor:${cursor}">` +
        `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="transparent" stroke-width="22"/><line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="toy-side-line" stroke-width="5"/></g>`;
      out.push(band('top', left, top.toFixed(1), right, top.toFixed(1), 'ns-resize', T.sideAria('top')), band('left', left, top.toFixed(1), left, bottom, 'ew-resize', T.sideAria('left')), band('right', right, top.toFixed(1), right, bottom, 'ew-resize', T.sideAria('right')));
      out.push(`<line x1="${left}" y1="${bottom}" x2="${right}" y2="${bottom}" stroke="var(--clr-text)" stroke-width="5"/>`);   // the fixed bottom
      out.push(`<text class="toy-text-strong" x="${(left + right) / 2}" y="${bottom + 18}" text-anchor="middle">${KIT.fmt(w, 2)} cm</text>`);
      out.push(`<text class="toy-text-strong" x="${left - 6}" y="${(top + h * CELL / 2 + 5).toFixed(1)}" text-anchor="end">${KIT.fmt(h, 2)}</text>`);
      stage.svg.innerHTML = out.join('');
      const area = w * h, perimeter = 2 * (w + h), square = Math.abs(w - h) < 1e-9;
      const rowP = (note, cls) => KIT.row(T.perimeter, `2 · (${KIT.fmt(w, 2)} + ${KIT.fmt(h, 2)}) = ${KIT.fmt(perimeter, 2)} cm`, note, cls);
      const rowA = (note, cls) => KIT.row(T.area, `${KIT.fmt(w, 2)} · ${KIT.fmt(h, 2)} = ${KIT.fmt(area, 2)} cm²`, note, cls);
      panel.innerHTML = st.mode === 'perimeter' ? rowP(T.stays, 'toy-ok') + rowA(square ? T.biggest : '') : rowA(T.stays, 'toy-ok') + rowP(square ? T.smallest : '');
    }

    // dragging a side with the pointer, or moving it with the arrow keys
    let side = null;
    const toCells = pt => ({ gx: (pt.x - GX) / CELL, gy: (GY + ROWS * CELL - pt.y) / CELL });
    KIT.drag(stage.svg, stage.W, stage.H, {
      start: (pt, e) => { const g = e.target.closest('[data-side]'); if (!g) return false; side = g.dataset.side; return true; },
      move: pt => { const { gx, gy } = toCells(pt); if (sideMove[side](side === 'top' ? gy : gx)) draw(); },
      end: () => { side = null; },
    });
    stage.svg.addEventListener('keydown', e => {
      const g = e.target.closest('[data-side]');
      if (!g || !['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) return;
      e.preventDefault();
      const key = g.dataset.side, step = (e.key === 'ArrowUp' || e.key === 'ArrowRight') ? 1 : -1;
      const moved = key === 'top' ? sideMove.top(st.h + step) : key === 'right' ? sideMove.right(st.x0 + st.w + step) : sideMove.left(st.x0 + step);
      if (moved) draw();
      stage.svg.querySelector(`[data-side="${key}"]`).focus();
    });
    restart(); draw();
  },
};

// ─── angle-sum ────────────────────────────────────────────────────────────────

TOYS['angle-sum'] = {
  mount(root) {
    const T = TEXTS.sandbox.angleSum;
    const COLS = 36, ROWS = 14, GX = KIT.gridX(COLS);
    const P = [[8, 2], [28, 1], [17, 10]];                                      // the corners, in grid units
    const st = { torn: 0 };
    const stage = KIT.gridStage(root, ROWS, { aria: T.aria });
    const GY = stage.top;
    const actions = document.createElement('div'); actions.className = 'toy-actions'; root.appendChild(actions);
    const panel = KIT.panel(root);
    KIT.hint(root, T.hint);
    const S = p => [GX + p[0] * CELL, GY + (ROWS - p[1]) * CELL];               // grid → screen (y up)
    const COLORS = ['toy-fill', 'toy-fill-2', 'toy-fill-3'];

    // each corner as a wedge: the corner, the start direction and the sweep (the short way round)
    function wedges() {
      return P.map((v, i) => {
        const a = S(v), b = S(P[(i + 1) % 3]), c = S(P[(i + 2) % 3]);
        const a1 = Math.atan2(b[1] - a[1], b[0] - a[0]), a2 = Math.atan2(c[1] - a[1], c[0] - a[0]);
        let d = a2 - a1; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI;
        return d >= 0 ? { at: a, start: a1, sweep: d } : { at: a, start: a2, sweep: -d };       // always turning the same way
      });
    }
    function wedgePath(cx, cy, start, sweep, r) {
      const x1 = cx + r * Math.cos(start), y1 = cy + r * Math.sin(start), x2 = cx + r * Math.cos(start + sweep), y2 = cy + r * Math.sin(start + sweep);
      return `M ${cx.toFixed(1)} ${cy.toFixed(1)} L ${x1.toFixed(1)} ${y1.toFixed(1)} A ${r} ${r} 0 0 ${sweep > 0 ? 1 : 0} ${x2.toFixed(1)} ${y2.toFixed(1)} Z`;
    }
    const angleDeg = i => wedges()[i].sweep * 180 / Math.PI;

    function draw() {
      const w = wedges(), t = st.torn, out = [KIT.gridBg(GX, GY, COLS, ROWS, CELL)];
      const poly = P.map(p => S(p).map(n => n.toFixed(1)).join(',')).join(' ');
      out.push(`<polygon points="${poly}" fill="var(--clr-surface)" stroke="var(--clr-text)" stroke-width="2.5" stroke-linejoin="round" opacity="${1 - 0.8 * t}"/>`);
      // the wedges slide to a point on a line and turn to lie side by side: together a straight angle
      const target = [KIT.GRID.width / 2, GY + ROWS * CELL - 10], R = 44;
      let acc = Math.PI;                                                       // from pointing left, over the top, to pointing right
      w.forEach((q, i) => {
        const goalStart = acc, goalSweep = q.sweep;
        acc += q.sweep;
        let s0 = q.start; while (goalStart - s0 > Math.PI) s0 += 2 * Math.PI; while (goalStart - s0 < -Math.PI) s0 -= 2 * Math.PI;
        const at = [q.at[0] + (target[0] - q.at[0]) * t, q.at[1] + (target[1] - q.at[1]) * t];
        const start = s0 + (goalStart - s0) * t, sweep = q.sweep + (goalSweep - q.sweep) * t;
        out.push(`<path d="${wedgePath(at[0], at[1], start, sweep, R)}" class="${COLORS[i]}" stroke="var(--clr-text)" stroke-width="1.5"/>`);
        const mid = start + sweep / 2;
        out.push(`<text class="toy-text-strong" x="${(at[0] + (R + 20) * Math.cos(mid)).toFixed(1)}" y="${(at[1] + (R + 20) * Math.sin(mid) + 5).toFixed(1)}" text-anchor="middle">${KIT.fmt(angleDeg(i), 1)}°</text>`);
      });
      if (t > 0.01) out.push(`<line x1="${target[0] - 110}" y1="${target[1]}" x2="${target[0] + 110}" y2="${target[1]}" stroke="var(--clr-text)" stroke-width="2" opacity="${t}"/>`);
      // the corners to drag
      P.forEach((p, i) => { const c = S(p); out.push(`<g class="toy-vertex" data-i="${i}" tabindex="0" role="slider" aria-label="${T.cornerAria(i + 1)}"><circle class="toy-handle-hit" cx="${c[0]}" cy="${c[1]}" r="18"/><circle class="toy-dot" cx="${c[0]}" cy="${c[1]}" r="7"/></g>`); });
      stage.svg.innerHTML = out.join('');
      const a = [0, 1, 2].map(angleDeg);
      panel.innerHTML = KIT.row(T.angles, a.map(v => `${KIT.fmt(v, 1)}°`).join(' + ')) + KIT.row(T.sum, `${KIT.fmt(a[0] + a[1] + a[2], 1)}°`, T.always, 'toy-ok');
    }

    let dragging = -1;
    KIT.drag(stage.svg, stage.W, stage.H, {
      start: (pt, e) => { const g = e.target.closest('[data-i]'); if (!g || st.torn > 0.01) return false; dragging = +g.dataset.i; return true; },
      move: pt => {
        const x = Math.min(COLS, Math.max(0, Math.round((pt.x - GX) / CELL))), y = Math.min(ROWS, Math.max(0, Math.round(ROWS - (pt.y - GY) / CELL)));
        const q = P.map(v => v.slice()); q[dragging] = [x, y];
        const area2 = (q[1][0] - q[0][0]) * (q[2][1] - q[0][1]) - (q[2][0] - q[0][0]) * (q[1][1] - q[0][1]);
        if (Math.abs(area2) < 1) return;                                        // not a flat triangle
        P[dragging] = [x, y]; draw();
      },
      end: () => { dragging = -1; },
    });

    let cancel = null;
    const toggle = KIT.button(actions, T.tear, () => {
      if (cancel) cancel();
      const to = st.torn < 0.5 ? 1 : 0, from = st.torn;
      toggle.textContent = to ? T.putBack : T.tear;
      cancel = KIT.tween(900, t => { st.torn = from + (to - from) * t; draw(); });
    }, 'btn btn-primary');
    draw();
  },
};

// ─── pythagoras ───────────────────────────────────────────────────────────────

TOYS['pythagoras'] = {
  mount(root) {
    const T = TEXTS.sandbox.pythagoras;
    const COLS = 36, ROWS = 36, GX = KIT.gridX(COLS);
    const st = { a: 3, b: 4, g: 90 };
    const stage = KIT.gridStage(root, ROWS, { aria: T.aria });
    const GY = stage.top;
    const controls = toyControls(root);
    const panel = KIT.panel(root);
    KIT.hint(root, T.hint);
    const sl = {
      a: KIT.slider(controls, { label: T.sideA, min: 1, max: 10, value: st.a, fmt: v => `${v} cm`, onInput: v => { st.a = v; draw(); } }),
      b: KIT.slider(controls, { label: T.sideB, min: 1, max: 10, value: st.b, fmt: v => `${v} cm`, onInput: v => { st.b = v; draw(); } }),
      g: KIT.slider(controls, { label: T.angle, min: 40, max: 140, value: st.g, fmt: v => `${v}°`, onInput: v => { st.g = v; draw(); } }),
    };
    KIT.button(root, T.right, () => { st.g = 90; sl.g.set(90); draw(); });

    function draw() {
      const { a, b } = st, g = st.g * Math.PI / 180;
      // the corner C at the origin; B along the x axis (side a), A at the angle g (side b); y up; units are cm
      const C = [0, 0], B = [a, 0], A = [b * Math.cos(g), b * Math.sin(g)];
      const square = (P, Q, color) => {                                          // the square on PQ, outside the triangle
        const dx = Q[0] - P[0], dy = Q[1] - P[1];
        const n = [-dy, dx], mid = [(P[0] + Q[0]) / 2, (P[1] + Q[1]) / 2], centre = [(A[0] + B[0]) / 3, (A[1] + B[1]) / 3];
        const sign = ((mid[0] + n[0] / 2 - centre[0]) ** 2 + (mid[1] + n[1] / 2 - centre[1]) ** 2) > ((mid[0] - n[0] / 2 - centre[0]) ** 2 + (mid[1] - n[1] / 2 - centre[1]) ** 2) ? 1 : -1;
        const m = [n[0] * sign, n[1] * sign];
        return { pts: [P, Q, [Q[0] + m[0], Q[1] + m[1]], [P[0] + m[0], P[1] + m[1]]], color };
      };
      const c2 = a * a + b * b - 2 * a * b * Math.cos(g);
      const shapes = [square(C, B, 'toy-fill'), square(A, C, 'toy-fill-2'), square(B, A, 'toy-fill-3')];
      const tri = [C, B, A];
      const all = shapes.flatMap(s => s.pts).concat(tri);
      const xs = all.map(p => p[0]), ys = all.map(p => p[1]);
      const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys);
      // the drawing is moved (by whole cells) to the middle of the grid
      const ox = Math.round((COLS - (maxX - minX)) / 2 - minX), oy = Math.round((ROWS - (maxY - minY)) / 2 - minY);
      const T2 = p => [GX + (p[0] + ox) * CELL, GY + (ROWS - (p[1] + oy)) * CELL];
      const out = [KIT.gridBg(GX, GY, COLS, ROWS, CELL)];
      shapes.forEach(s => out.push(`<polygon points="${s.pts.map(p => T2(p).map(n => n.toFixed(1)).join(',')).join(' ')}" class="${s.color}" stroke="var(--clr-text)" stroke-width="1.5"/>`));
      out.push(`<polygon points="${tri.map(p => T2(p).map(n => n.toFixed(1)).join(',')).join(' ')}" fill="var(--clr-surface)" stroke="var(--clr-text)" stroke-width="2.5" stroke-linejoin="round"/>`);
      const label = (sq, text) => { const c = [0, 1, 2, 3].reduce((s, i) => [s[0] + sq.pts[i][0] / 4, s[1] + sq.pts[i][1] / 4], [0, 0]); const p = T2(c); return `<text class="toy-text-strong" x="${p[0].toFixed(1)}" y="${(p[1] + 5).toFixed(1)}" text-anchor="middle">${text}</text>`; };
      out.push(label(shapes[0], `a² = ${a * a}`), label(shapes[1], `b² = ${b * b}`), label(shapes[2], `c² = ${KIT.fmt(c2, 1)}`));
      stage.svg.innerHTML = out.join('');
      const sum = a * a + b * b, right = Math.abs(sum - c2) < 1e-6;
      panel.innerHTML = KIT.row('a² + b²', `${a * a} + ${b * b} = ${sum}`) + KIT.row('c²', KIT.fmt(c2, 2), right ? T.equal : T.notEqual(KIT.fmt(sum - c2, 2)), right ? 'toy-ok' : 'toy-warn') +
        `<div class="toy-note">${st.g < 90 ? T.acute : st.g > 90 ? T.obtuse : T.rightNote}</div>`;
    }
    draw();
  },
};

// ─── area-cutting ─────────────────────────────────────────────────────────────

TOYS['area-cutting'] = {
  mount(root) {
    const T = TEXTS.sandbox.areaCutting;
    const COLS = 36, ROWS = 14, GX = KIT.gridX(COLS);
    const st = { mode: 'parallelogram', b: 8, h: 5, shift: 3, t: 0 };
    KIT.tabs(root, [{ key: 'parallelogram', label: T.tabParallelogram }, { key: 'triangle', label: T.tabTriangle }], st.mode, key => { st.mode = key; sl.t.set(0); st.t = 0; draw(); });
    const stage = KIT.gridStage(root, ROWS, { aria: T.aria });
    const GY = stage.top;
    const controls = toyControls(root);
    const panel = KIT.panel(root);
    KIT.hint(root, T.hint);
    const sl = {
      t: KIT.slider(controls, { label: T.move, min: 0, max: 1, step: 0.01, value: 0, fmt: v => `${Math.round(v * 100)} %`, onInput: v => { st.t = v; draw(); } }),
      b: KIT.slider(controls, { label: T.base, min: 2, max: 10, value: st.b, fmt: v => `${v} cm`, onInput: v => { st.b = v; st.shift = Math.min(st.shift, v - 1); draw(); } }),
      h: KIT.slider(controls, { label: T.height, min: 1, max: 10, value: st.h, fmt: v => `${v} cm`, onInput: v => { st.h = v; draw(); } }),
      shift: KIT.slider(controls, { label: T.slant, min: 1, max: 9, value: st.shift, fmt: v => `${v} cm`, onInput: v => { st.shift = Math.min(v, st.b - 1); draw(); } }),
    };
    let X0 = 0;                                                                 // the left edge of the figure: set in draw() so that it is in the middle of the grid
    const S = p => [GX + (X0 + p[0]) * CELL, GY + (ROWS - 2 - p[1]) * CELL];    // the base is on the third line from the bottom
    const pts = list => list.map(p => S(p).map(n => n.toFixed(1)).join(',')).join(' ');

    function draw() {
      const { b, h, t } = st, s = Math.min(st.shift, b - 1), out = [KIT.gridBg(GX, GY, COLS, ROWS, CELL)];
      X0 = Math.floor((COLS - b - (st.mode === 'parallelogram' ? s : 0)) / 2);
      if (st.mode === 'parallelogram') {
        // the parallelogram 0,0 – b,0 – b+s,h – s,h; the left triangle 0,0 – s,0 – s,h slides b to the right
        const piece = [[0, 0], [s, 0], [s, h]].map(p => [p[0] + b * t, p[1]]);
        const body = [[s, 0], [b, 0], [b + s, h], [s, h]];
        out.push(`<polygon points="${pts(body)}" class="toy-fill" stroke="var(--clr-text)" stroke-width="2"/>`);
        out.push(`<polygon points="${pts(piece)}" class="toy-fill-2" stroke="var(--clr-text)" stroke-width="2"/>`);
        out.push(`<line class="toy-height" x1="${S([s, 0])[0]}" y1="${S([s, 0])[1]}" x2="${S([s, h])[0]}" y2="${S([s, h])[1]}"/>`);
        out.push(`<text class="toy-text-strong" x="${S([b / 2, 0])[0]}" y="${S([0, 0])[1] + 20}" text-anchor="middle">${b} cm</text>`);
        out.push(`<text class="toy-text-strong" x="${S([s, h / 2])[0] + 8}" y="${S([s, h / 2])[1] + 5}" text-anchor="start" fill="#c0392b">${h} cm</text>`);
        panel.innerHTML = KIT.row(T.parallelogramArea, `${b} · ${h} = ${b * h} cm²`) + KIT.row(T.rectangleArea, `${b} · ${h} = ${b * h} cm²`, T.same, 'toy-ok') + `<div class="toy-note">${T.noteParallelogram}</div>`;
      } else {
        // the triangle 0,0 – b,0 – s,h; a copy turned by 180° round the middle of the right side (b,0) – (s,h)
        const mid = [(b + s) / 2, h / 2], angle = 180 * t;
        const m = S(mid);
        out.push(`<polygon points="${pts([[0, 0], [b, 0], [s, h]])}" class="toy-fill" stroke="var(--clr-text)" stroke-width="2"/>`);
        out.push(`<g transform="rotate(${angle} ${m[0].toFixed(1)} ${m[1].toFixed(1)})"><polygon points="${pts([[0, 0], [b, 0], [s, h]])}" class="toy-fill-2" stroke="var(--clr-text)" stroke-width="2"/></g>`);
        out.push(`<text class="toy-text-strong" x="${S([b / 2, 0])[0]}" y="${S([0, 0])[1] + 20}" text-anchor="middle">${b} cm</text>`);
        panel.innerHTML = KIT.row(T.triangleArea, `½ · ${b} · ${h} = ${KIT.fmt(b * h / 2, 1)} cm²`) + KIT.row(T.twoCopies, `${b} · ${h} = ${b * h} cm²`, t > 0.99 ? T.makeParallelogram : '', t > 0.99 ? 'toy-ok' : '') + `<div class="toy-note">${T.noteTriangle}</div>`;
      }
      stage.svg.innerHTML = out.join('');
    }
    draw();
  },
};

// ─── cuboid-net ───────────────────────────────────────────────────────────────

TOYS['cuboid-net'] = {
  mount(root) {
    const T = TEXTS.sandbox.cuboidNet;
    const COLS = 40, ROWS = 30, GX = KIT.gridX(COLS);                                  // the net: 40 × 30 cells; above it the cuboid
    const st = { mode: 'surface', a: 4, b: 3, h: 2 };
    KIT.tabs(root, [{ key: 'surface', label: T.tabSurface }, { key: 'volume', label: T.tabVolume }], st.mode, key => { st.mode = key; draw(); });
    const stage = KIT.gridStage(root, ROWS, { aria: T.aria, top: 100 });
    const controls = toyControls(root);
    const panel = KIT.panel(root);
    KIT.hint(root, T.hint);
    ['a', 'b', 'h'].forEach(k => KIT.slider(controls, { label: T[`side_${k}`], min: 1, max: 10, value: st[k], fmt: v => `${v} cm`, onInput: v => { st[k] = v; draw(); } }));

    function draw() {
      const { a, b, h } = st, out = [];
      // the cuboid in an oblique view, a cell is a cell; its faces are divided into 1 cm × 1 cm squares
      const k = CELL, d = 0.35 * b, TOPROOM = Math.ceil((h + d) * k) + 70, ox = 70, oy = TOPROOM - 36;      // the room above the net follows the cuboid
      const X = x => ox + x * k, Y = y => oy - y * k;
      const poly = (ps, cls) => `<polygon points="${ps.map(p => `${X(p[0]).toFixed(1)},${Y(p[1]).toFixed(1)}`).join(' ')}" class="${cls}" stroke="var(--clr-text)" stroke-width="2" stroke-linejoin="round"/>`;
      const line = (x1, y1, x2, y2) => `<line x1="${X(x1).toFixed(1)}" y1="${Y(y1).toFixed(1)}" x2="${X(x2).toFixed(1)}" y2="${Y(y2).toFixed(1)}" stroke="var(--clr-text)" stroke-opacity=".45"/>`;
      out.push(poly([[0, 0], [a, 0], [a, h], [0, h]], 'toy-fill'));                                   // the front (a × h)
      out.push(poly([[0, h], [a, h], [a + d, h + d], [d, h + d]], 'toy-fill-3'));                    // the top (a × b)
      out.push(poly([[a, 0], [a + d, d], [a + d, h + d], [a, h]], 'toy-fill-2'));                    // the right side (b × h)
      for (let i = 1; i < a; i++) out.push(line(i, 0, i, h), line(i, h, i + d, h + d));
      for (let j = 1; j < h; j++) out.push(line(0, j, a, j), line(a, j, a + d, j + d));
      for (let j = 1; j < b; j++) { const t = j / b * d; out.push(line(t, h + t, a + t, h + t), line(a + t, t, a + t, h + t)); }
      out.push(`<text class="toy-text-strong" x="${X(a / 2)}" y="${Y(0) + 20}" text-anchor="middle">a = ${a}</text>`);
      out.push(`<text class="toy-text-strong" x="${X(0) - 8}" y="${Y(h / 2) + 5}" text-anchor="end">h = ${h}</text>`);
      out.push(`<text class="toy-text-strong" x="${X(a + d) + 8}" y="${Y(h / 2 + d) + 5}" text-anchor="start">b = ${b}</text>`);
      let height = TOPROOM + 30;
      if (st.mode === 'volume') {
        out.push(`<text class="toy-text-muted" x="${X(a / 2)}" y="${Y(0) + 40}" text-anchor="middle">${a} · ${b} · ${h} = ${a * b * h}</text>`);
      } else {
        // the net on the grid: a strip of the four walls, the top above the front wall and the bottom below it
        const NY = TOPROOM + 20;
        height = NY + ROWS * CELL + 30;
        out.push(KIT.gridBg(GX, NY, COLS, ROWS, CELL));
        const ox2 = Math.floor((COLS - (2 * a + 2 * b)) / 2), oy2 = Math.floor((ROWS - (2 * b + h)) / 2);      // the net in the middle of the grid
        const face = (x, y, w, hh, cls) => `<rect x="${GX + (x + ox2) * CELL}" y="${NY + (y + oy2) * CELL}" width="${w * CELL}" height="${hh * CELL}" class="${cls}" stroke="var(--clr-text)" stroke-width="1.5"/>` +
          `<text class="toy-text-muted" x="${GX + (x + ox2 + w / 2) * CELL}" y="${NY + (y + oy2 + hh / 2) * CELL + 4}" text-anchor="middle">${w}×${hh}</text>`;
        out.push(face(b, b, a, h, 'toy-fill'), face(0, b, b, h, 'toy-fill-2'), face(b + a, b, b, h, 'toy-fill-2'), face(2 * b + a, b, a, h, 'toy-fill'),
                 face(b, 0, a, b, 'toy-fill-3'), face(b, b + h, a, b, 'toy-fill-3'));
      }
      stage.svg.setAttribute('viewBox', `0 0 ${KIT.GRID.width} ${height}`);
      stage.svg.innerHTML = out.join('');
      const surface = 2 * (a * b + a * h + b * h);
      panel.innerHTML = st.mode === 'surface'
        ? KIT.row(T.faces, `2 · ${a * b} + 2 · ${a * h} + 2 · ${b * h}`) + KIT.row(T.surface, `${2 * a * b} + ${2 * a * h} + ${2 * b * h} = ${surface} cm²`, '', 'toy-ok') + `<div class="toy-note">${T.noteSurface}</div>`
        : KIT.row(T.baseArea, `${a} · ${b} = ${a * b} cm²`) + KIT.row(T.volume, `${a * b} · ${h} = ${a * b * h} cm³`, T.cubes(a * b * h), 'toy-ok') + `<div class="toy-note">${T.noteVolume}</div>`;
    }
    draw();
  },
};

// ─── circle-unroll ────────────────────────────────────────────────────────────

TOYS['circle-unroll'] = {
  mount(root) {
    const T = TEXTS.sandbox.circleUnroll;
    const COLS = 38, ROWS = 16, GX = KIT.gridX(COLS);
    const st = { mode: 'circumference', r: 3, t: 0, n: 8 };
    KIT.tabs(root, [{ key: 'circumference', label: T.tabCircumference }, { key: 'area', label: T.tabArea }], st.mode, key => {
      st.mode = key; st.t = 0; sl.t.set(0); nRow.style.display = key === 'area' ? '' : 'none'; draw();
    });
    const stage = KIT.gridStage(root, ROWS, { aria: T.aria });
    const GY = stage.top;
    const controls = toyControls(root);
    const panel = KIT.panel(root);
    KIT.hint(root, T.hint);
    const sl = {
      r: KIT.slider(controls, { label: T.radius, min: 1, max: 5, step: 0.5, value: st.r, fmt: v => `${v} cm`, onInput: v => { st.r = v; draw(); } }),
      t: KIT.slider(controls, { label: T.roll, min: 0, max: 1, step: 0.01, value: 0, fmt: v => `${Math.round(v * 100)} %`, onInput: v => { st.t = v; draw(); } }),
      n: KIT.slider(controls, { label: T.sectors, min: 4, max: 48, step: 2, value: st.n, onInput: v => { st.n = v; draw(); } }),
    };
    const nRow = controls.querySelectorAll('.toy-slider')[2];
    nRow.style.display = 'none';
    const S = (x, y) => [GX + x * CELL, GY + (ROWS - y) * CELL];                // cells (y up) → svg

    function draw() {
      const r = st.r, out = [KIT.gridBg(GX, GY, COLS, ROWS, CELL)];
      if (st.mode === 'circumference') {
        const yb = 4, x0 = Math.max(r, Math.floor((COLS - 2 * Math.PI * r - 2 * r) / 2) + r), theta = 2 * Math.PI * st.t, C = 2 * Math.PI * r;
        const [lx0, ly] = S(x0, yb), [lx1] = S(x0 + C, yb), R = r * CELL;
        out.push(`<line x1="${lx0}" y1="${ly}" x2="${lx1.toFixed(1)}" y2="${ly}" stroke="var(--clr-text)" stroke-width="2.5"/>`);
        const cx = lx0 + R * theta, cy = ly - R;                                    // the circle rolls along the line
        out.push(`<circle cx="${cx.toFixed(1)}" cy="${cy}" r="${R}" fill="rgba(26,115,232,.12)" stroke="var(--clr-text)" stroke-width="2.5"/>`);
        out.push(`<line x1="${cx.toFixed(1)}" y1="${cy}" x2="${(cx - R * Math.sin(theta)).toFixed(1)}" y2="${(cy + R * Math.cos(theta)).toFixed(1)}" stroke="#c0392b" stroke-width="2.5"/>`);
        out.push(`<line x1="${lx0}" y1="${ly + 6}" x2="${(lx0 + R * theta).toFixed(1)}" y2="${ly + 6}" stroke="#c0392b" stroke-width="5"/>`);
        // below: the diameters laid along the line: three of them and a little more (0.14 d)
        const dd = 2 * r;
        for (let i = 0; i < 4; i++) {
          const full = i < 3, w = full ? dd : C - 3 * dd, [bx, by] = S(x0 + i * dd, 2);
          out.push(`<rect x="${bx.toFixed(1)}" y="${by}" width="${(w * CELL).toFixed(1)}" height="${CELL}" class="${full ? 'toy-fill' : 'toy-fill-2'}" stroke="var(--clr-text)" stroke-width="1.5"/>`);
          if (full) out.push(`<text class="toy-text-muted" x="${(bx + w * CELL / 2).toFixed(1)}" y="${by + CELL - 3}" text-anchor="middle">d = ${KIT.fmt(dd, 1)}</text>`);
        }
        out.push(`<text class="toy-text-muted" x="${S(x0, 0.3)[0]}" y="${S(x0, 0.3)[1] + 12}">${T.diametersNote}</text>`);
        panel.innerHTML = KIT.row(T.circumference, `2π · ${r} = ${KIT.fmt(2 * Math.PI * r, 2)} cm`) + KIT.row(T.diameters, `${KIT.fmt(2 * Math.PI * r / (2 * r), 3)} · d`, 'π ≈ 3.14', 'toy-ok');
      } else {
        const n = st.n, theta = 2 * Math.PI / n, R = r * CELL, t = st.t;
        const cyCells = r + 1, arcLen = r * theta;                                // the circle at the left, the sectors in a row at the right, all on the bottom
        const ox = Math.max(0, Math.floor((COLS - (2 * r + 4 + Math.PI * r + 2)) / 2)), circleC = S(ox + r, cyCells);
        const rowStart = ox + 2 * r + 4 + arcLen / 2;
        for (let i = 0; i < n; i++) {
          const up = i % 2 === 0;                                                 // the sectors point up and down in turn
          const circleAngle = i * theta * 180 / Math.PI;
          let rowAngle = up ? -90 : 90;
          while (rowAngle - circleAngle > 180) rowAngle -= 360;
          while (rowAngle - circleAngle < -180) rowAngle += 360;
          const rowPos = S(rowStart + i * arcLen / 2, up ? cyCells - r / 2 : cyCells + r / 2);
          const pos = [circleC[0] + (rowPos[0] - circleC[0]) * t, circleC[1] + (rowPos[1] - circleC[1]) * t];
          const ang = circleAngle + (rowAngle - circleAngle) * t;
          const half = theta / 2, p1 = [R * Math.cos(-half), R * Math.sin(-half)], p2 = [R * Math.cos(half), R * Math.sin(half)];
          out.push(`<path d="M 0 0 L ${p1[0].toFixed(1)} ${p1[1].toFixed(1)} A ${R.toFixed(1)} ${R.toFixed(1)} 0 0 1 ${p2[0].toFixed(1)} ${p2[1].toFixed(1)} Z" transform="translate(${pos[0].toFixed(1)} ${pos[1].toFixed(1)}) rotate(${ang.toFixed(1)})" class="${up ? 'toy-fill' : 'toy-fill-2'}" stroke="var(--clr-text)" stroke-width="1"/>`);
        }
        panel.innerHTML = KIT.row(T.area, `π · ${r}² = ${KIT.fmt(Math.PI * r * r, 2)} cm²`) +
          KIT.row(T.rectangle, `${KIT.fmt(Math.PI * r, 2)} · ${r} = ${KIT.fmt(Math.PI * r * r, 2)} cm²`, T.rectangleNote, 'toy-ok');
      }
      stage.svg.innerHTML = out.join('');
    }
    draw();
  },
};

// ─── similar-scale ────────────────────────────────────────────────────────────

TOYS['similar-scale'] = {
  mount(root) {
    const T = TEXTS.sandbox.similarScale;
    const COLS = 36, ROWS = 14, GX = KIT.gridX(COLS);
    const st = { k: 2 };
    const stage = KIT.gridStage(root, ROWS, { aria: T.aria });
    const GY = stage.top;
    const controls = toyControls(root);
    const panel = KIT.panel(root);
    KIT.hint(root, T.hint);
    KIT.slider(controls, { label: T.scale, min: 0.5, max: 3, step: 0.5, value: st.k, fmt: v => `× ${v}`, onInput: v => { st.k = v; draw(); } });
    const S = p => [GX + (14 + p[0]) * CELL, GY + (ROWS - 1 - p[1]) * CELL];      // the corner of the triangles: in the middle (the default copy is 8 wide), 1 from the bottom
    const pts = list => list.map(p => S(p).map(n => n.toFixed(1)).join(',')).join(' ');

    function draw() {
      const k = st.k, out = [KIT.gridBg(GX, GY, COLS, ROWS, CELL)];
      // the triangle 3-4-5 and its copy scaled by k, from the same corner
      out.push(`<polygon points="${pts([[0, 0], [4 * k, 0], [0, 3 * k]])}" class="toy-fill-2" stroke="var(--clr-text)" stroke-width="2"/>`);
      out.push(`<polygon points="${pts([[0, 0], [4, 0], [0, 3]])}" class="toy-fill" stroke="var(--clr-text)" stroke-width="2"/>`);
      out.push(`<text class="toy-text-strong" x="${S([2, 0])[0]}" y="${S([0, 0])[1] + 18}" text-anchor="middle">4</text>`);
      out.push(`<text class="toy-text-strong" x="${S([0, 1.5])[0] - 8}" y="${S([0, 1.5])[1] + 5}" text-anchor="end">3</text>`);
      if (k !== 1) {
        out.push(`<text class="toy-text-strong" x="${S([4 * k, 0])[0]}" y="${S([0, 0])[1] + 18}" text-anchor="middle" fill="#c0392b">${KIT.fmt(4 * k, 1)}</text>`);
        out.push(`<text class="toy-text-strong" x="${S([0, 3 * k])[0] - 8}" y="${S([0, 3 * k])[1] + 5}" text-anchor="end" fill="#c0392b">${KIT.fmt(3 * k, 1)}</text>`);
      }
      stage.svg.innerHTML = out.join('');
      panel.innerHTML = KIT.row(T.sides, `3 · 4 · 5 → ${KIT.fmt(3 * k, 1)} · ${KIT.fmt(4 * k, 1)} · ${KIT.fmt(5 * k, 1)}`, T.timesK(k)) +
        KIT.row(T.perimeter, `12 → ${KIT.fmt(12 * k, 1)}`, T.timesK(k)) +
        KIT.row(T.area, `6 → ${KIT.fmt(6 * k * k, 2)}`, T.timesKK(k, KIT.fmt(k * k, 2)), 'toy-warn');
    }
    draw();
  },
};
