/**
 * figures.js
 * Draws geometry figures as SVG (triangles, rectangles, parallelograms, with side labels, a dashed
 * red height, right-angle marks and angle arcs). Used by problems that have a `figure`.
 *
 * spec = {
 *   pts:    [[x, y], …]      the corners in counter-clockwise order, in any units, y pointing up
 *   sides:  ['8.5 cm', …]    a label for each side i (from pts[i] to pts[i + 1]); '' or missing: no label
 *   height: { apex, foot, label, towards }   a dashed red height from `apex` down to `foot`, with a right-angle
 *                                            mark on the side of the point `towards`
 *   angles: [{ i, label }]   an arc and a label in the corner i (label '?' for the unknown)
 *   right:  [i, …]           right-angle marks in these corners
 *   aria:   'text'           the description for screen readers
 * }
 * The drawing is scaled to fit; the shape is drawn with the real proportions of pts.
 */

const FIG = { W: 480, H: 250, padX: 64, padY: 50, labelOffset: 14, arc: 28 };

const figAdd = (a, b) => [a[0] + b[0], a[1] + b[1]];
const figSub = (a, b) => [a[0] - b[0], a[1] - b[1]];
const figMul = (a, k) => [a[0] * k, a[1] * k];
const figLen = a => Math.hypot(a[0], a[1]);
const figUnit = a => figMul(a, 1 / (figLen(a) || 1));
const figFmt = n => n.toFixed(1);
const figEsc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');


/** Is the point inside the polygon, at least `margin` pixels away from every side? */
function figRoomIn(P, pt, margin) {
  let inside = false;
  for (let i = 0, j = P.length - 1; i < P.length; j = i++) {
    const [xi, yi] = P[i], [xj, yj] = P[j];
    if ((yi > pt[1]) !== (yj > pt[1]) && pt[0] < (xj - xi) * (pt[1] - yi) / (yj - yi) + xi) inside = !inside;
    const ab = figSub(P[i], P[j]), t = Math.max(0, Math.min(1, ((pt[0] - P[j][0]) * ab[0] + (pt[1] - P[j][1]) * ab[1]) / (ab[0] * ab[0] + ab[1] * ab[1])));
    const near = figAdd(P[j], figMul(ab, t));
    if (figLen(figSub(pt, near)) < margin) return false;
  }
  return inside;
}

function figureSvg(spec) {
  const { W, H, padX, padY } = FIG;
  const raw = spec.pts;
  const extra = spec.height ? [spec.height.apex, spec.height.foot] : [];
  const everything = raw.concat(extra);
  const xs = everything.map(p => p[0]), ys = everything.map(p => p[1]);
  const minX = Math.min(...xs), minY = Math.min(...ys);
  const bw = Math.max(...xs) - minX || 1, bh = Math.max(...ys) - minY || 1;
  const k = Math.min((W - 2 * padX) / bw, (H - 2 * padY) / bh);
  const ox = (W - bw * k) / 2, oy = (H - bh * k) / 2;
  const T = p => [ox + (p[0] - minX) * k, H - (oy + (p[1] - minY) * k)];       // to screen coordinates (y down)

  const P = raw.map(T), n = P.length;
  const centre = [P.reduce((s, p) => s + p[0], 0) / n, P.reduce((s, p) => s + p[1], 0) / n];
  const out = [];

  out.push(`<polygon class="fig-poly" points="${P.map(p => `${figFmt(p[0])},${figFmt(p[1])}`).join(' ')}"/>`);

  // right-angle marks in the corners
  for (const i of spec.right || []) {
    const v = P[i], a = figUnit(figSub(P[(i + 1) % n], v)), b = figUnit(figSub(P[(i + n - 1) % n], v)), s = 12;
    const p1 = figAdd(v, figMul(a, s)), p3 = figAdd(v, figMul(b, s)), p2 = figAdd(p1, figMul(b, s));
    out.push(`<polyline class="fig-right" points="${[p1, p2, p3].map(p => `${figFmt(p[0])},${figFmt(p[1])}`).join(' ')}"/>`);
  }

  // angle arcs and their labels: inside the corner when there is room, otherwise outside, beyond the corner
  const arcs = (spec.angles || []).map(an => {
    const v = P[an.i], d1 = figUnit(figSub(P[(an.i + 1) % n], v)), d2 = figUnit(figSub(P[(an.i + n - 1) % n], v));
    const edge = Math.min(figLen(figSub(P[(an.i + 1) % n], v)), figLen(figSub(P[(an.i + n - 1) % n], v)));
    const r = Math.min(FIG.arc, edge * 0.35);
    const bis = figUnit(figAdd(d1, d2));
    const inside = figAdd(v, figMul(bis, r + 15)), outside = figAdd(v, figMul(bis, -(r + 16)));
    const width = 9 * String(an.label).length;                                  // about the width of the text
    return { an, v, d1, d2, r, inside, outside, width, useInside: figRoomIn(P, inside, 6 + width / 2) };
  });
  arcs.forEach((a, i) => arcs.forEach((b, j) => {                               // two labels that would touch: both go outside
    if (i < j && a.useInside && b.useInside && Math.abs(a.inside[0] - b.inside[0]) < (a.width + b.width) / 2 + 4 && Math.abs(a.inside[1] - b.inside[1]) < 20) {
      a.crowded = b.crowded = true;
    }
  }));
  for (const a of arcs) {
    const s1 = figAdd(a.v, figMul(a.d1, a.r)), s2 = figAdd(a.v, figMul(a.d2, a.r));
    const sweep = (a.d1[0] * a.d2[1] - a.d1[1] * a.d2[0]) > 0 ? 1 : 0;           // the short way round
    out.push(`<path class="fig-arc" d="M ${figFmt(s1[0])} ${figFmt(s1[1])} A ${figFmt(a.r)} ${figFmt(a.r)} 0 0 ${sweep} ${figFmt(s2[0])} ${figFmt(s2[1])}"/>`);
    const at = a.useInside && !a.crowded ? a.inside : a.outside;
    out.push(`<text class="fig-label fig-angle" x="${figFmt(at[0])}" y="${figFmt(at[1] + 5)}" text-anchor="middle">${figEsc(a.an.label)}</text>`);
  }

  // side labels, pushed away from the middle of the shape
  (spec.sides || []).forEach((label, i) => {
    if (!label) return;
    const a = P[i], b = P[(i + 1) % n], mid = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
    const dir = figUnit(figSub(mid, centre));
    const at = figAdd(mid, figMul(dir, FIG.labelOffset));
    const anchor = dir[0] > 0.4 ? 'start' : dir[0] < -0.4 ? 'end' : 'middle';
    const dy = dir[1] > 0.4 ? 13 : dir[1] < -0.4 ? -3 : 5;
    out.push(`<text class="fig-label" x="${figFmt(at[0])}" y="${figFmt(at[1] + dy)}" text-anchor="${anchor}">${figEsc(label)}</text>`);
  });

  // the dashed height with its right-angle mark
  if (spec.height) {
    const A = T(spec.height.apex), F = T(spec.height.foot);
    out.push(`<line class="fig-height" x1="${figFmt(A[0])}" y1="${figFmt(A[1])}" x2="${figFmt(F[0])}" y2="${figFmt(F[1])}"/>`);
    const up = figUnit(figSub(A, F)), along = figUnit(figSub(T(spec.height.towards), F)), s = 12;
    const p1 = figAdd(F, figMul(along, s)), p3 = figAdd(F, figMul(up, s)), p2 = figAdd(p1, figMul(up, s));
    out.push(`<polyline class="fig-right" points="${[p1, p2, p3].map(p => `${figFmt(p[0])},${figFmt(p[1])}`).join(' ')}"/>`);
    if (spec.height.label) {
      // the label goes on the side of the dashed line that has more room (the side the base reaches further)
      const mid = [(A[0] + F[0]) / 2, (A[1] + F[1]) / 2];
      const xs = P.map(p => p[0]);
      const roomRight = Math.max(...xs) - F[0], roomLeft = F[0] - Math.min(...xs);
      const right = roomRight >= roomLeft;
      out.push(`<text class="fig-label fig-label-height" x="${figFmt(mid[0] + (right ? 9 : -9))}" y="${figFmt(mid[1] + 5)}" text-anchor="${right ? 'start' : 'end'}">${figEsc(spec.height.label)}</text>`);
    }
  }

  return `<svg class="fig-svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="${figEsc(spec.aria || 'A geometry figure')}">${out.join('')}</svg>`;
}

function renderFigure(el, spec) {
  el.innerHTML = figureSvg(spec);
}
