/**
 * sandbox-triangle.js
 * Toy "a triangle with a fixed area": the base and the height are fixed, the top vertex slides along the line of
 * the height, so the angles and the sides change but the area does not.
 *
 *  - the common grid (36 × 14 cells, a cell is 1 cm); the top vertex snaps to the grid (drag it, or use the arrow keys)
 *  - click a length to change it: the base and the height (1–10 cm) are whole numbers of cells, a side is 1–10 cm;
 *    for a side, the top vertex moves so that the side gets this length while the other side stays the same
 *    (so the height may change: to build an isosceles triangle, set the two sides one after the other)
 *  - the panel shows the area (does not change), the perimeter and the angles (do); the angles are also written
 *    in the picture. The labels are placed by a small search (placeLabels): inside or outside, left or right of a
 *    line, so that they keep about a cell apart and away from the lines.
 *
 * Load after sandbox.js and figures.js (the small vector helpers fig…), before ui.js.
 */

TOYS['triangle-area'] = {
  mount(root) {
    const CELL = KIT.GRID.cell, GRID_W = 36, GRID_H = 14, Y0 = 2;                 // the common grid: 1 cell = 1 cm
    const MT = 56, MB = 28, W = KIT.GRID.width, MX = KIT.gridX(GRID_W), H = GRID_H * CELL + MT + MB;   // room around the grid for the labels
    const DEFAULT = { b: 8, h: 5, dp: 3 };                         // dp: where the top vertex is, counted from the left corner of the base
    const centred = base => Math.floor((GRID_W - base) / 2);       // the base sits in the middle of the grid, on its lower part
    let { b, h } = DEFAULT, X0 = centred(b), p = X0 + DEFAULT.dp;
    let editor = null;                                              // the input that is open now
    const labelAt = {};                                             // where each clickable label is, in svg units

    root.innerHTML = `
      <div class="toy-stage"><svg class="toy-svg" style="max-width: 720px; margin: 0 auto;" viewBox="0 0 ${W} ${H}" role="group" aria-label="${TEXTS.sandbox.triangleAria}"></svg></div>
      <p class="toy-status" role="status" aria-live="polite"></p>
      <div class="toy-panel"></div>
      <p class="toy-hint">${TEXTS.sandbox.triangleHint}</p>
      <div class="toy-actions"><button type="button" class="btn btn-secondary toy-reset">${TEXTS.sandbox.reset}</button></div>`;
    const stage = root.querySelector('.toy-stage'), svg = root.querySelector('.toy-svg');
    const panel = root.querySelector('.toy-panel'), status = root.querySelector('.toy-status');

    const S = pt => [MX + pt[0] * CELL, MT + (GRID_H - pt[1]) * CELL];       // grid → svg coordinates (y up → y down)
    const fmt = n => figFmt(n);
    const num = n => String(Number(n.toFixed(1)));
    const num2 = n => String(Number(n.toFixed(2)));
    const say = text => { status.textContent = text; };

    function geometry() {
      const A = [X0, Y0], B = [X0 + b, Y0], C = [p, Y0 + h];
      const left = Math.hypot(C[0] - A[0], C[1] - A[1]), right = Math.hypot(C[0] - B[0], C[1] - B[1]);
      const angle = (V, P, Q) => {
        const d1 = [P[0] - V[0], P[1] - V[1]], d2 = [Q[0] - V[0], Q[1] - V[1]];
        return Math.acos((d1[0] * d2[0] + d1[1] * d2[1]) / (Math.hypot(...d1) * Math.hypot(...d2))) * 180 / Math.PI;
      };
      return { A, B, C, left, right, angles: [angle(A, B, C), angle(B, C, A), angle(C, A, B)] };   // at A, B, C
    }

    /** An arc in the corner V between the neighbours P and Q (grid coordinates in, drawn in pixels) */
    function arc(V, P, Q, r) {
      const v = S(V), d1 = figUnit(figSub(S(P), v)), d2 = figUnit(figSub(S(Q), v));
      const s1 = figAdd(v, figMul(d1, r)), s2 = figAdd(v, figMul(d2, r));
      const sweep = (d1[0] * d2[1] - d1[1] * d2[0]) > 0 ? 1 : 0;
      return `<path class="toy-arc" d="M ${fmt(s1[0])} ${fmt(s1[1])} A ${r} ${r} 0 0 ${sweep} ${fmt(s2[0])} ${fmt(s2[1])}"/>`;
    }

    /** A label at the chosen place: a length (clickable, with an input that opens on it) or an angle (plain) */
    function labelSvg(item, at) {
      if (!item.key) return `<text class="toy-angle" x="${fmt(at.x)}" y="${fmt(at.y)}" text-anchor="middle">${item.text}</text>`;
      labelAt[item.key] = { x: at.x, y: at.y, anchor: at.anchor };
      return `<text class="toy-label ${item.cls || ''}" data-edit="${item.key}" tabindex="0" role="button" aria-label="${TEXTS.sandbox.editLength(item.key, item.text)}" x="${fmt(at.x)}" y="${fmt(at.y)}" text-anchor="${at.anchor}">${item.text}</text>`;
    }

    // ── placing the labels so that they do not touch each other or the lines ─────
    const CHAR_W = 7.2, GAP = 14;                                       // GAP: the wanted space between two labels, a bit less than a cell
    const boxOf = (text, at) => {
      const w = String(text).length * CHAR_W + 4;
      const x0 = at.anchor === 'start' ? at.x : at.anchor === 'end' ? at.x - w : at.x - w / 2;
      return { x0, x1: x0 + w, y0: at.y - 13, y1: at.y + 4 };
    };
    const along = (P, Q, step = 4) => {                                  // points along a segment (the lines the labels must keep away from)
      const n = Math.max(1, Math.ceil(figLen(figSub(Q, P)) / step));
      return Array.from({ length: n + 1 }, (_, i) => figAdd(P, figMul(figSub(Q, P), i / n)));
    };
    const around = (c, r) => Array.from({ length: 12 }, (_, i) => [c[0] + r * Math.cos(i * Math.PI / 6), c[1] + r * Math.sin(i * Math.PI / 6)]);

    /** items: [{ text, cands: [{ x, y, anchor, ... }] }], the first candidate is the preferred one */
    function placeLabels(items, obstacles, polygon) {
      const penalty = (item, at) => {
        const box = boxOf(item.text, at);
        let pen = 0;
        if (box.x0 < 4 || box.x1 > W - 4 || box.y0 < 4 || box.y1 > H - 4) pen += 80;
        if (obstacles.some(q => q[0] > box.x0 - 3 && q[0] < box.x1 + 3 && q[1] > box.y0 - 3 && q[1] < box.y1 + 3)) pen += 60;
        if (at.needsRoom && !figRoomIn(polygon, [at.x, at.y - 4], 6 + (box.x1 - box.x0) / 2)) pen += 40;
        return pen;
      };
      const between = (a, b) => {
        const gx = Math.max(a.x0 - b.x1, b.x0 - a.x1), gy = Math.max(a.y0 - b.y1, b.y0 - a.y1), gap = Math.max(gx, gy);
        return gap < 0 ? 100 : gap < GAP ? 30 * (1 - gap / GAP) : 0;
      };
      let best = null;
      const chosen = [];
      (function search(i, cost) {
        if (best && cost >= best.cost) return;
        if (i === items.length) { best = { cost, picks: chosen.slice() }; return; }
        items[i].cands.forEach((at, k) => {
          const box = boxOf(items[i].text, at);
          let extra = k * 2 + penalty(items[i], at);
          for (let j = 0; j < i; j++) extra += between(box, boxOf(items[j].text, chosen[j]));
          chosen[i] = at;
          search(i + 1, cost + extra);
        });
      })(0, 0);
      return best.picks;
    }

    function render() {
      const { A, B, C, left, right, angles } = geometry();
      const [a, bb, c] = [S(A), S(B), S(C)], foot = S([p, Y0]);
      const out = [];

      // the grid
      for (let i = 0; i <= GRID_W; i++) out.push(`<line class="toy-grid" x1="${MX + i * CELL}" y1="${MT}" x2="${MX + i * CELL}" y2="${MT + GRID_H * CELL}"/>`);
      for (let j = 0; j <= GRID_H; j++) out.push(`<line class="toy-grid" x1="${MX}" y1="${MT + j * CELL}" x2="${MX + GRID_W * CELL}" y2="${MT + j * CELL}"/>`);

      // the triangle, the angle arcs, the height
      out.push(`<polygon class="toy-triangle" points="${[a, bb, c].map(q => `${fmt(q[0])},${fmt(q[1])}`).join(' ')}"/>`);
      out.push(arc(A, B, C, 20), arc(B, C, A, 20), arc(C, A, B, 20));
      if (p < X0 || p > X0 + b) {                                              // an obtuse triangle: the base is extended to the foot
        const near = p < X0 ? a : bb;
        out.push(`<line class="toy-extend" x1="${fmt(near[0])}" y1="${fmt(near[1])}" x2="${fmt(foot[0])}" y2="${fmt(foot[1])}"/>`);
      }
      out.push(`<line class="toy-height" x1="${fmt(c[0])}" y1="${fmt(c[1])}" x2="${fmt(foot[0])}" y2="${fmt(foot[1])}"/>`);
      const dir = p <= X0 + b / 2 ? 1 : -1, sq = 11;                           // the right-angle mark at the foot of the height
      out.push(`<polyline class="toy-right" points="${fmt(foot[0] + dir * sq)},${fmt(foot[1])} ${fmt(foot[0] + dir * sq)},${fmt(foot[1] - sq)} ${fmt(foot[0])},${fmt(foot[1] - sq)}"/>`);

      // the labels: the lengths (click to change) and the angles; each has a preferred place and a second one
      const centre = [(a[0] + bb[0] + c[0]) / 3, (a[1] + bb[1] + c[1]) / 3];
      const sideCands = (P, Q) => {                                           // outside or inside the triangle, at the middle or nearer one end
        const cands = [];
        for (const t of [0.5, 0.3, 0.7]) {
          const mid = figAdd(P, figMul(figSub(Q, P), t)), d = figUnit(figSub(figAdd(P, figMul(figSub(Q, P), 0.5)), centre));
          for (const away of [16, 30]) {
            for (const sign of [1, -1]) {
              const dd = figMul(d, sign), at = figAdd(mid, figMul(dd, away));
              cands.push({ x: at[0], y: at[1] + (dd[1] > 0.4 ? 12 : dd[1] < -0.4 ? -2 : 5), anchor: dd[0] > 0.4 ? 'start' : dd[0] < -0.4 ? 'end' : 'middle' });
            }
          }
        }
        return cands;
      };
      const tag = p < X0 ? -1 : p > X0 + b ? 1 : dir;                          // the height label: outside the triangle when the top vertex is beyond the base
      const heightCands = [];
      for (const f of [0.5, 0.3, 0.7]) {
        for (const t of [tag, -tag]) heightCands.push({ x: foot[0] + t * 14, y: foot[1] + (c[1] - foot[1]) * f + 5, anchor: t > 0 ? 'start' : 'end' });
      }
      const angleCands = (V, P, Q, r) => {
        const v = S(V), bis = figUnit(figAdd(figUnit(figSub(S(P), v)), figUnit(figSub(S(Q), v))));
        const options = [{ d: r + 20, needsRoom: true }, { d: -(r + 18) }, { d: r + 32, needsRoom: true }, { d: -(r + 30) },
                         { d: -(r + 14), dx: -30 }, { d: -(r + 14), dx: 30 }, { d: -(r + 4), dx: -36 }, { d: -(r + 4), dx: 36 }];
        return options.map(o => {
          const at = figAdd(v, figMul(bis, o.d));
          return { x: at[0] + (o.dx || 0), y: at[1] + 5, anchor: 'middle', needsRoom: o.needsRoom };
        });
      };
      const items = [
        { key: 'height', text: `${num(h)}`, cls: 'toy-height-label', cands: heightCands },
        { key: 'left',   text: `${num(left)}`, cls: 'toy-side', cands: sideCands(a, c) },
        { key: 'right',  text: `${num(right)}`, cls: 'toy-side', cands: sideCands(bb, c) },
        { text: `${angles[0].toFixed(1)}°`, cands: angleCands(A, B, C, 20) },
        { text: `${angles[1].toFixed(1)}°`, cands: angleCands(B, C, A, 20) },
        { text: `${angles[2].toFixed(1)}°`, cands: angleCands(C, A, B, 20) },
      ];
      const sqPts = [[foot[0] + dir * sq, foot[1]], [foot[0] + dir * sq, foot[1] - sq], [foot[0], foot[1] - sq]];
      const obstacles = [
        ...along(a, bb), ...along(bb, c), ...along(c, a), ...along(c, foot), ...sqPts,
        ...(p < X0 || p > X0 + b ? along(p < X0 ? a : bb, foot) : []),
        ...around(c, 14), ...around(a, 8), ...around(bb, 8),
      ];
      const picks = placeLabels(items, obstacles, [a, bb, c]);
      out.push(labelSvg({ key: 'base', text: `${b}`, cls: 'toy-base' }, { x: (a[0] + bb[0]) / 2, y: a[1] + 28, anchor: 'middle' }));
      items.forEach((item, i) => out.push(labelSvg(item, picks[i])));

      // the vertices: the base ones are fixed, the top one is the handle
      out.push(`<circle class="toy-fixed" cx="${fmt(a[0])}" cy="${fmt(a[1])}" r="5"/><circle class="toy-fixed" cx="${fmt(bb[0])}" cy="${fmt(bb[1])}" r="5"/>`);
      out.push(`<g class="toy-handle" data-handle="1" tabindex="0" role="slider" aria-label="${TEXTS.sandbox.handleAria}" aria-valuemin="0" aria-valuemax="${GRID_W}" aria-valuenow="${num(p)}">` +
               `<circle class="toy-handle-hit" cx="${fmt(c[0])}" cy="${fmt(c[1])}" r="24"/><circle class="toy-handle-dot" cx="${fmt(c[0])}" cy="${fmt(c[1])}" r="9"/></g>`);
      svg.innerHTML = out.join('');

      const area = b * h / 2, perimeter = left + right + b;
      panel.innerHTML =
        `<div class="toy-row toy-row-fixed"><span>${TEXTS.sandbox.area}</span><b>A = ½ · ${b} · ${num(h)} = ${num2(area)} cm²</b><em>${TEXTS.sandbox.areaSame}</em></div>` +
        `<div class="toy-row"><span>${TEXTS.sandbox.perimeter}</span><b>${num(left)} + ${b} + ${num(right)} = ${num(perimeter)} cm</b></div>` +
        `<div class="toy-row"><span>${TEXTS.sandbox.angles}</span><b>${angles.map(v => `${v.toFixed(1)}°`).join(' · ')}</b></div>` +
        (Number.isInteger(p) && Number.isInteger(h) ? '' : `<div class="toy-note">${TEXTS.sandbox.offGrid}</div>`);
    }

    // ── dragging the top vertex ─────────────────────────────────────────────────
    let dragging = false;
    const gridX = e => {
      const box = svg.getBoundingClientRect();
      return (((e.clientX - box.left) * W / box.width) - MX) / CELL;
    };
    svg.addEventListener('pointerdown', e => {
      if (!e.target.closest('[data-handle]')) return;
      closeEditor(false);
      dragging = true;
      svg.setPointerCapture(e.pointerId);
      e.preventDefault();
    });
    svg.addEventListener('pointermove', e => {
      if (!dragging) return;
      const x = Math.min(GRID_W, Math.max(0, Math.round(gridX(e))));
      if (x !== p) { p = x; say(''); render(); }
    });
    const stopDrag = () => { dragging = false; };
    svg.addEventListener('pointerup', stopDrag);
    svg.addEventListener('pointercancel', stopDrag);
    svg.addEventListener('keydown', e => {
      if (e.target.closest('[data-handle]') && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
        e.preventDefault();
        p = Math.min(GRID_W, Math.max(0, Math.round(p) + (e.key === 'ArrowRight' ? 1 : -1)));
        say(''); render();
        svg.querySelector('[data-handle]').focus();
      } else if (e.target.closest('[data-edit]') && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        openEditor(e.target.closest('[data-edit]').dataset.edit);
      }
    });

    // ── changing a length ───────────────────────────────────────────────────────
    function openEditor(key) {
      closeEditor(false);
      const where = labelAt[key], box = svg.getBoundingClientRect(), g = geometry();
      const current = key === 'base' ? b : key === 'height' ? h : key === 'left' ? g.left : g.right;
      const input = document.createElement('input');
      input.type = 'text'; input.inputMode = 'decimal'; input.className = 'toy-input';
      input.value = num(current);
      input.setAttribute('aria-label', TEXTS.sandbox.editLength(key, `${num(current)} cm`));
      const left = where.x * box.width / W, top = where.y * box.height / H;
      input.style.left = `${left}px`; input.style.top = `${top - 18}px`;
      input.style.transform = where.anchor === 'middle' ? 'translateX(-50%)' : where.anchor === 'end' ? 'translateX(-100%)' : 'none';
      stage.appendChild(input);
      editor = { key, input };
      input.focus(); input.select();
      input.addEventListener('keydown', ev => {
        if (ev.key === 'Enter')  { ev.preventDefault(); closeEditor(true); }
        if (ev.key === 'Escape') { ev.preventDefault(); closeEditor(false); }
      });
      input.addEventListener('blur', () => closeEditor(true));
    }

    function closeEditor(apply) {
      if (!editor) return;
      const { key, input } = editor;
      editor = null;
      const text = input.value;
      input.remove();
      if (apply) applyLength(key, text);
    }

    function applyLength(key, text) {
      const v = parseFloat(String(text).replace(',', '.'));
      if (!Number.isFinite(v) || v <= 0) { say(TEXTS.sandbox.notANumber); return; }
      if (key === 'base' || key === 'height') {
        const [lo, hi] = [1, 10];
        if (!Number.isInteger(v) || v < lo || v > hi) { say(TEXTS.sandbox.wholeRange(key, lo, hi)); render(); return; }
        if (key === 'base') { b = v; const old = X0; X0 = centred(b); p += X0 - old; } else h = v;
        p = Math.min(GRID_W, Math.max(0, p));
        say(''); render(); return;
      }
      if (v > 10) { say(TEXTS.sandbox.sideRange); render(); return; }
      // a side: the top vertex moves so that this side gets the length v while the other side stays as it is
      // (the height changes, if it has to). The vertex is where the two circles around the base corners meet.
      const g = geometry(), L = key === 'left' ? v : g.left, R = key === 'right' ? v : g.right;
      const x = (L * L - R * R + b * b) / (2 * b);                       // from the left corner of the base
      const y2 = L * L - x * x;
      if (y2 < 0.01) { say(TEXTS.sandbox.noTriangle(num(L), num(R), b)); render(); return; }
      const y = Math.sqrt(y2);
      if (y > GRID_H - Y0 + 1e-9 || X0 + x < -1e-9 || X0 + x > GRID_W + 1e-9) { say(TEXTS.sandbox.outsideGrid); render(); return; }
      p = Math.round((X0 + x) * 1e9) / 1e9;
      h = Math.round(y * 1e9) / 1e9;
      say(''); render();
    }

    svg.addEventListener('click', e => {
      const el = e.target.closest('[data-edit]');
      if (el) openEditor(el.dataset.edit);
    });
    root.querySelector('.toy-reset').addEventListener('click', () => { closeEditor(false); ({ b, h } = DEFAULT); X0 = centred(b); p = X0 + DEFAULT.dp; say(''); render(); });

    render();
  },
};
