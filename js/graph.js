/**
 * graph.js
 * A small SVG function plotter with a "read the value" interaction: moving the pointer
 * (mouse or finger) along the graph shows a marker and its coordinates.
 *
 * renderGraph(container, spec) with
 *   spec = {
 *     x: { min, max, step, label },   // grid line / tick every `step`; label = axis name
 *     y: { min, max, step, label },
 *     lines: [{ fn }],                // fn(x) → y, drawn over the whole x range
 *     caption,                        // optional small text under the graph
 *     ariaLabel,                      // optional description for screen readers
 *   }
 * Styling is in style.css (.graph-*).
 */

const SVG_NS = 'http://www.w3.org/2000/svg';
let graphCounter = 0;

function svgEl(name, attrs = {}, text) {
  const el = document.createElementNS(SVG_NS, name);
  Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
  if (text !== undefined) el.textContent = text;
  return el;
}

/** 12, 12.5, 0.3333 → "12", "12.5", "0.33" (no trailing zeros) */
function formatNumber(v) {
  return String(Math.round(v * 100) / 100);
}

function renderGraph(container, spec) {
  container.innerHTML = '';

  const W = 400, H = 330;
  const M = { l: 44, r: 36, t: 30, b: 40 };
  const pw = W - M.l - M.r;
  const ph = H - M.t - M.b;

  const { x: X, y: Y } = spec;
  const sx = x => M.l + (x - X.min) / (X.max - X.min) * pw;
  const sy = y => M.t + ph - (y - Y.min) / (Y.max - Y.min) * ph;
  const invX = px => X.min + (px - M.l) / pw * (X.max - X.min);

  // the axes cross at (0, 0) when that is inside the plot, else at the lower left corner
  const axisX = sx(Math.min(Math.max(0, X.min), X.max));   // x position of the vertical axis
  const axisY = sy(Math.min(Math.max(0, Y.min), Y.max));   // y position of the horizontal axis

  const id = `graph-clip-${++graphCounter}`;
  const svg = svgEl('svg', { viewBox: `0 0 ${W} ${H}`, class: 'graph-svg', role: 'img' });
  if (spec.ariaLabel) svg.setAttribute('aria-label', spec.ariaLabel);

  const defs = svgEl('defs');
  const clip = svgEl('clipPath', { id });
  clip.appendChild(svgEl('rect', { x: M.l, y: M.t, width: pw, height: ph }));
  defs.appendChild(clip);
  svg.appendChild(defs);

  // grid and tick labels
  const gridX = [], gridY = [];
  for (let v = X.min; v <= X.max + 1e-9; v += X.step) gridX.push(v);
  for (let v = Y.min; v <= Y.max + 1e-9; v += Y.step) gridY.push(v);

  gridX.forEach(v => {
    svg.appendChild(svgEl('line', { class: 'graph-grid', x1: sx(v), x2: sx(v), y1: M.t, y2: M.t + ph }));
    if (v !== 0) svg.appendChild(svgEl('text', { class: 'graph-tick', x: sx(v), y: axisY + 18, 'text-anchor': 'middle' }, formatNumber(v)));
    svg.appendChild(svgEl('line', { class: 'graph-tickmark', x1: sx(v), x2: sx(v), y1: axisY - 4, y2: axisY + 4 }));
  });
  gridY.forEach(v => {
    svg.appendChild(svgEl('line', { class: 'graph-grid', x1: M.l, x2: M.l + pw, y1: sy(v), y2: sy(v) }));
    if (v !== 0) svg.appendChild(svgEl('text', { class: 'graph-tick', x: axisX - 9, y: sy(v) + 4, 'text-anchor': 'end' }, formatNumber(v)));
    svg.appendChild(svgEl('line', { class: 'graph-tickmark', x1: axisX - 4, x2: axisX + 4, y1: sy(v), y2: sy(v) }));
  });

  // axes with arrow heads
  svg.appendChild(svgEl('line', { class: 'graph-axis', x1: axisX, x2: axisX, y1: M.t + ph, y2: M.t - 10 }));
  svg.appendChild(svgEl('line', { class: 'graph-axis', x1: M.l, x2: M.l + pw + 10, y1: axisY, y2: axisY }));
  svg.appendChild(svgEl('path', { class: 'graph-arrow', d: `M ${axisX - 5} ${M.t - 3} L ${axisX} ${M.t - 12} L ${axisX + 5} ${M.t - 3}` }));
  svg.appendChild(svgEl('path', { class: 'graph-arrow', d: `M ${M.l + pw + 3} ${axisY - 5} L ${M.l + pw + 12} ${axisY} L ${M.l + pw + 3} ${axisY + 5}` }));
  svg.appendChild(svgEl('text', { class: 'graph-label', x: axisX + 12, y: M.t - 10, 'text-anchor': 'start' }, Y.label));
  svg.appendChild(svgEl('text', { class: 'graph-label', x: M.l + pw + 17, y: axisY + 5, 'text-anchor': 'start' }, X.label));

  // the lines
  const STEPS = 120;
  (spec.lines || []).forEach(line => {
    let d = '';
    for (let i = 0; i <= STEPS; i++) {
      const x = X.min + (X.max - X.min) * i / STEPS;
      d += `${i === 0 ? 'M' : 'L'} ${sx(x).toFixed(2)} ${sy(line.fn(x)).toFixed(2)} `;
    }
    svg.appendChild(svgEl('path', { class: 'graph-line', d, 'clip-path': `url(#${id})` }));
  });

  // reading marker (hidden until the pointer is over the graph)
  const marker = svgEl('g', { class: 'graph-marker', visibility: 'hidden' });
  const guideV = svgEl('line', { class: 'graph-guide' });
  const guideH = svgEl('line', { class: 'graph-guide' });
  const dot    = svgEl('circle', { class: 'graph-dot', r: 5 });
  const tip    = svgEl('text', { class: 'graph-tip' });
  [guideV, guideH, dot, tip].forEach(n => marker.appendChild(n));
  svg.appendChild(marker);

  // transparent layer that receives the pointer
  const hit = svgEl('rect', { class: 'graph-hit', x: M.l, y: M.t, width: pw, height: ph, fill: 'transparent' });
  svg.appendChild(hit);

  function show(event) {
    const line = (spec.lines || [])[0];
    if (!line) return;

    const box = svg.getBoundingClientRect();
    const px  = (event.clientX - box.left) * W / box.width;
    // snap to whole numbers on the x axis so the read-out is easy to read
    const x = Math.min(X.max, Math.max(X.min, Math.round(invX(px))));
    const y = line.fn(x);
    if (y < Y.min - 1e-9 || y > Y.max + 1e-9) { marker.setAttribute('visibility', 'hidden'); return; }

    const cx = sx(x), cy = sy(y);
    guideV.setAttribute('x1', cx); guideV.setAttribute('x2', cx);
    guideV.setAttribute('y1', cy); guideV.setAttribute('y2', axisY);
    guideH.setAttribute('x1', cx); guideH.setAttribute('x2', axisX);
    guideH.setAttribute('y1', cy); guideH.setAttribute('y2', cy);
    dot.setAttribute('cx', cx); dot.setAttribute('cy', cy);

    tip.textContent = `(${formatNumber(x)}, ${formatNumber(y)})`;
    const right = cx > W - 120;
    tip.setAttribute('x', right ? cx - 10 : cx + 10);
    tip.setAttribute('y', cy < M.t + 24 ? cy + 22 : cy - 10);
    tip.setAttribute('text-anchor', right ? 'end' : 'start');

    marker.setAttribute('visibility', 'visible');
  }

  hit.addEventListener('pointermove',  show);
  hit.addEventListener('pointerdown',  show);
  hit.addEventListener('pointerleave', () => marker.setAttribute('visibility', 'hidden'));

  container.appendChild(svg);

  if (spec.caption) {
    const caption = document.createElement('div');
    caption.className = 'graph-caption';
    caption.textContent = spec.caption;
    container.appendChild(caption);
  }
}
