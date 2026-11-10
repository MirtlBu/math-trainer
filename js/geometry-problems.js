/**
 * geometry-problems.js
 * Geometry word problems with pictures (js/figures.js): perimeter, area, sides of triangles, angles.
 *
 *   geo-perimeter        running around a field, a fence, the missing side, the side of a square from its perimeter
 *   geo-area             a square's area from its perimeter and back, a floor, the missing side from the area
 *   geo-triangle-sides   an equilateral / isosceles triangle from its perimeter, the third side
 *   geo-angles           the angles of a triangle (isosceles, right-angled), a straight angle, a quadrilateral
 *   geo-area-figure      the area of a triangle or a parallelogram from a picture with extra, unneeded lengths
 *
 * The level `geo-basic` mixes all of them (see mixed-levels.js).
 * Problem: { kind: 'value', text, question, answer, figure?, steps, meta }; all answers are exact (at most 2 decimals).
 *
 * Load after word-problems.js (NAMES, pickFresh), equations.js (randInt), polynomial-equations.js (pick),
 * figures.js and texts.js.
 */

// ─── helpers (names start with "geo") ─────────────────────────────────────────

/** 38.400000000000006 → "38.4" */
const geoNum = n => String(Number(n.toFixed(4)));
const geoCm = n => `${n.toFixed(1)} cm`;

const geoValue = (text, question, answer, steps, meta, figure) => {
  const problem = { kind: 'value', text, question, answer: Number(answer.toFixed(6)), steps, meta };
  if (figure) problem.figure = figure;
  return problem;
};

const geoRect = (w, h, bottom, left, aria) => ({
  pts: [[0, 0], [w, 0], [w, h], [0, h]], sides: [bottom, '', '', left], right: [0, 1, 2, 3], aria,
});

/** Triangle with the base c on the bottom and the sides a (right) and b (left): C above the base */
function geoTriangle(a, b, c) {
  const x = (b * b + c * c - a * a) / (2 * c), y = Math.sqrt(Math.max(b * b - x * x, 0));
  return [[0, 0], [c, 0], [x, y]];
}

const geoDeg = rad => rad * 180 / Math.PI;

// ─── perimeter ────────────────────────────────────────────────────────────────

const GEO_TIMES = { 2: 'twice', 3: 'three times', 4: 'four times' };

function generateGeoPerimeter() {
  const type = pick(['laps', 'laps', 'fence', 'missingSide', 'squareSide']);

  if (type === 'laps') {
    const L = randInt(8, 24) * 5; let W; do { W = randInt(4, 16) * 5; } while (W >= L);
    const k = pick([2, 3, 4]), P = 2 * L + 2 * W;
    return geoValue(`A rectangular sports field is ${L} m long and ${W} m wide. For the warm-up, the team runs around the field ${GEO_TIMES[k]}.`,
      'How long a distance is run? (in m)', k * P, [
        { explanation: TEXTS.geometry.perimeterRect, math: `P = 2 \\cdot ${L} + 2 \\cdot ${W} = ${P}\\ \\text{m}` },
        { explanation: TEXTS.geometry.timesLaps(k), math: `${k} \\cdot ${P} = ${k * P}\\ \\text{m}` },
      ], { type, L, W, k }, geoRect(L, W, `${L} m`, `${W} m`, `A rectangle ${L} m by ${W} m`));
  }
  if (type === 'fence') {
    const L = randInt(6, 30); let W; do { W = randInt(4, 20); } while (W >= L);
    const P = 2 * L + 2 * W;
    return geoValue(`A rectangular garden is ${L} m long and ${W} m wide. A fence is built all the way around it.`,
      'How many metres of fence are needed?', P, [
        { explanation: TEXTS.geometry.perimeterRect, math: `P = 2 \\cdot ${L} + 2 \\cdot ${W} = ${P}\\ \\text{m}` },
      ], { type, L, W }, geoRect(L, W, `${L} m`, `${W} m`, `A rectangle ${L} m by ${W} m`));
  }
  if (type === 'missingSide') {
    const a = randInt(5, 40); let b; do { b = randInt(3, 40); } while (b === a);
    const P = 2 * (a + b);
    return geoValue(`The perimeter of a rectangle is ${P} cm and one side is ${a} cm.`, 'How long is the other side? (in cm)', b, [
      { explanation: TEXTS.geometry.halfPerimeter, math: `${P} \\div 2 = ${P / 2}` },
      { explanation: TEXTS.geometry.otherSide, math: `${P / 2} - ${a} = ${b}` },
    ], { type, a, b, P }, geoRect(Math.max(a, 6), Math.max(a, 6) * 0.6, `${a} cm`, '?', `A rectangle with one side ${a} cm`));
  }
  const s = randInt(3, 40);
  return geoValue(`The perimeter of a square is ${4 * s} cm.`, 'How long is one side? (in cm)', s, [
    { explanation: TEXTS.geometry.squareSideFromPerimeter, math: `${4 * s} \\div 4 = ${s}` },
  ], { type, s }, geoRect(5, 5, '?', '', 'A square'));
}

// ─── area ─────────────────────────────────────────────────────────────────────

function generateGeoArea() {
  const type = pick(['perimToArea', 'perimToArea', 'areaToPerim', 'rectArea', 'missingSide']);

  if (type === 'perimToArea') {
    const s = randInt(3, 30);
    return geoValue(`The perimeter of a square is ${4 * s} cm.`, 'Calculate the area of the square. (in cm²)', s * s, [
      { explanation: TEXTS.geometry.squareSideFromPerimeter, math: `${4 * s} \\div 4 = ${s}\\ \\text{cm}` },
      { explanation: TEXTS.geometry.areaSquare, math: `A = ${s} \\cdot ${s} = ${s * s}\\ \\text{cm}^2` },
    ], { type, s }, geoRect(5, 5, '', '', 'A square'));
  }
  if (type === 'areaToPerim') {
    const s = randInt(3, 30);
    return geoValue(`The area of a square is ${s * s} cm².`, 'What is the perimeter of the square? (in cm)', 4 * s, [
      { explanation: TEXTS.geometry.sqrtSide, math: `\\sqrt{${s * s}} = ${s}\\ \\text{cm}` },
      { explanation: TEXTS.geometry.perimeterSquare, math: `P = 4 \\cdot ${s} = ${4 * s}\\ \\text{cm}` },
    ], { type, s }, geoRect(5, 5, '', '', 'A square'));
  }
  if (type === 'rectArea') {
    const L = randInt(3, 25); let W; do { W = randInt(2, 15); } while (W === L);
    const themes = [
      [`The floor of a classroom is ${L} m long and ${W} m wide.`, 'What is the area of the floor? (in m²)'],
      [`A rectangular vegetable patch is ${L} m long and ${W} m wide.`, 'What is the area of the patch? (in m²)'],
      [`A wall is ${L} m long and ${W} m high and it is going to be painted.`, 'How many square metres are painted? (in m²)'],
    ];
    const [text, question] = pick(themes);
    return geoValue(text, question, L * W, [
      { explanation: TEXTS.geometry.areaRect, math: `A = ${L} \\cdot ${W} = ${L * W}\\ \\text{m}^2` },
    ], { type, L, W }, geoRect(L, W, `${L} m`, `${W} m`, `A rectangle ${L} m by ${W} m`));
  }
  const a = randInt(3, 20), b = randInt(2, 15);
  return geoValue(`The area of a rectangle is ${a * b} cm² and one side is ${a} cm.`, 'How long is the other side? (in cm)', b, [
    { explanation: TEXTS.geometry.otherSideFromArea, math: `${a * b} \\div ${a} = ${b}` },
  ], { type, a, b }, geoRect(Math.max(a, 6), Math.max(a, 6) * 0.6, `${a} cm`, '?', `A rectangle with one side ${a} cm`));
}

// ─── sides of triangles ───────────────────────────────────────────────────────

function generateGeoTriangleSides() {
  const type = pick(['equilateral', 'equilateral', 'isoscelesLeg', 'isoscelesBase', 'thirdSide']);

  if (type === 'equilateral') {
    const s = randInt(3, 40), P = 3 * s;
    return geoValue(`The perimeter of an equilateral triangle is ${P} cm.`, 'How long is each side? (in cm)', s, [
      { explanation: TEXTS.geometry.equilateral, math: `${P} \\div 3 = ${s}\\ \\text{cm}` },
    ], { type, s }, { pts: geoTriangle(1, 1, 1), sides: ['?', '?', '?'], aria: 'An equilateral triangle' });
  }
  if (type === 'isoscelesLeg') {
    for (;;) {
      const c = randInt(3, 30), l = randInt(Math.floor(c / 2) + 1, 30);
      if (c >= 2 * l) continue;
      const P = c + 2 * l;
      return geoValue(`An isosceles triangle has the base ${c} cm and the perimeter ${P} cm.`, 'How long is each of the two equal sides? (in cm)', l, [
        { explanation: TEXTS.geometry.isoLeg, math: `${P} - ${c} = ${P - c}, \\quad ${P - c} \\div 2 = ${l}\\ \\text{cm}` },
      ], { type, c, l }, { pts: geoTriangle(l, l, c), sides: [`${c} cm`, '?', '?'], aria: 'An isosceles triangle' });
    }
  }
  if (type === 'isoscelesBase') {
    for (;;) {
      const l = randInt(4, 30), c = randInt(2, 2 * l - 1);
      const P = c + 2 * l;
      return geoValue(`The equal sides of an isosceles triangle are ${l} cm each and the perimeter is ${P} cm.`, 'How long is the base? (in cm)', c, [
        { explanation: TEXTS.geometry.isoBase, math: `${P} - 2 \\cdot ${l} = ${P} - ${2 * l} = ${c}\\ \\text{cm}` },
      ], { type, c, l }, { pts: geoTriangle(l, l, c), sides: ['?', `${l} cm`, `${l} cm`], aria: 'An isosceles triangle' });
    }
  }
  for (;;) {
    const a = randInt(3, 25), b = randInt(3, 25), c = randInt(Math.abs(a - b) + 1, a + b - 1);
    const P = a + b + c;
    return geoValue(`A triangle has the sides ${a} cm and ${b} cm. Its perimeter is ${P} cm.`, 'How long is the third side? (in cm)', c, [
      { explanation: TEXTS.geometry.thirdSide, math: `${P} - ${a} - ${b} = ${c}\\ \\text{cm}` },
    ], { type, a, b, c }, { pts: geoTriangle(a, b, c), sides: ['?', `${a} cm`, `${b} cm`], aria: 'A triangle' });
  }
}

// ─── angles ───────────────────────────────────────────────────────────────────

function generateGeoAngles() {
  const type = pick(['isoApex', 'isoApex', 'isoBase', 'triThird', 'rightTri', 'straight', 'quad']);

  if (type === 'isoApex' || type === 'isoBase') {
    const alpha = randInt(20, 80), apex = 180 - 2 * alpha;
    const rad = alpha * Math.PI / 180;
    const pts = [[0, 0], [10, 0], [5, 5 * Math.tan(rad)]];
    if (type === 'isoApex') {
      return geoValue(`The base angle of an isosceles triangle is ${alpha}°.`, 'How large is the apex angle? (in degrees)', apex, [
        { explanation: TEXTS.geometry.isoBaseAngles, math: `2 \\cdot ${alpha}^\\circ = ${2 * alpha}^\\circ` },
        { explanation: TEXTS.geometry.angleSum, math: `180^\\circ - ${2 * alpha}^\\circ = ${apex}^\\circ` },
      ], { type, alpha, apex }, { pts, angles: [{ i: 0, label: `${alpha}°` }, { i: 1, label: `${alpha}°` }, { i: 2, label: '?' }], aria: 'An isosceles triangle' });
    }
    return geoValue(`The apex angle of an isosceles triangle is ${apex}°.`, 'How large is each base angle? (in degrees)', alpha, [
      { explanation: TEXTS.geometry.angleSum, math: `180^\\circ - ${apex}^\\circ = ${180 - apex}^\\circ` },
      { explanation: TEXTS.geometry.isoBaseAngles, math: `${180 - apex}^\\circ \\div 2 = ${alpha}^\\circ` },
    ], { type, alpha, apex }, { pts, angles: [{ i: 0, label: '?' }, { i: 1, label: '?' }, { i: 2, label: `${apex}°` }], aria: 'An isosceles triangle' });
  }
  if (type === 'triThird') {
    let A, B; do { A = randInt(25, 95); B = randInt(25, 95); } while (A + B < 70 || A + B > 150 || A === B);
    const C = 180 - A - B, c = 10;
    const sinC = Math.sin(C * Math.PI / 180), b = c * Math.sin(B * Math.PI / 180) / sinC;
    const pts = [[0, 0], [c, 0], [b * Math.cos(A * Math.PI / 180), b * Math.sin(A * Math.PI / 180)]];
    return geoValue(`Two angles of a triangle are ${A}° and ${B}°.`, 'How large is the third angle? (in degrees)', C, [
      { explanation: TEXTS.geometry.angleSum, math: `180^\\circ - ${A}^\\circ - ${B}^\\circ = ${C}^\\circ` },
    ], { type, A, B, C }, { pts, angles: [{ i: 0, label: `${A}°` }, { i: 1, label: `${B}°` }, { i: 2, label: '?' }], aria: 'A triangle' });
  }
  if (type === 'rightTri') {
    const alpha = randInt(15, 75), other = 90 - alpha;
    const pts = [[0, 0], [10, 0], [10, 10 * Math.tan(alpha * Math.PI / 180)]];
    return geoValue(`One of the acute angles of a right triangle is ${alpha}°.`, 'How large is the other acute angle? (in degrees)', other, [
      { explanation: TEXTS.geometry.rightAngleSum, math: `180^\\circ - 90^\\circ - ${alpha}^\\circ = ${other}^\\circ` },
    ], { type, alpha, other }, { pts, right: [1], angles: [{ i: 0, label: `${alpha}°` }, { i: 2, label: '?' }], aria: 'A right triangle' });
  }
  if (type === 'straight') {
    const alpha = randInt(15, 165);
    return geoValue(`Two angles next to each other form a straight angle. One of them is ${alpha}°.`, 'How large is the other angle? (in degrees)', 180 - alpha, [
      { explanation: TEXTS.geometry.straightAngle, math: `180^\\circ - ${alpha}^\\circ = ${180 - alpha}^\\circ` },
    ], { type, alpha });
  }
  let A, B, C; do { A = randInt(60, 130); B = randInt(60, 130); C = randInt(60, 130); } while (A + B + C > 330 || A + B + C < 200);
  return geoValue(`Three angles of a quadrilateral are ${A}°, ${B}° and ${C}°.`, 'How large is the fourth angle? (in degrees)', 360 - A - B - C, [
    { explanation: TEXTS.geometry.quadAngleSum, math: `360^\\circ - ${A}^\\circ - ${B}^\\circ - ${C}^\\circ = ${360 - A - B - C}^\\circ` },
  ], { type, A, B, C });
}

// ─── the area from a picture ──────────────────────────────────────────────────

function generateGeoAreaFigure() {
  if (randInt(1, 3) < 3) {                                      // a triangle with its height; the other sides are not needed
    const base = randInt(8, 24) * 0.5, h = randInt(2, 8), foot = base * (randInt(15, 85) / 100);
    const left = Math.hypot(foot, h), right = Math.hypot(base - foot, h);
    const area = base * h / 2;
    return geoValue('Calculate the area of the triangle.', 'What is the area? (in cm²)', area, [
      { explanation: TEXTS.geometry.baseAndHeight, math: `a = ${geoNum(base)}\\ \\text{cm}, \\quad h = ${h}\\ \\text{cm}` },
      { explanation: TEXTS.formulas.useFormula('area of a triangle'), math: 'A = \\dfrac{a \\cdot h}{2}' },
      { explanation: TEXTS.formulas.putNumbers, math: `A = \\dfrac{${geoNum(base)} \\cdot ${h}}{2} = ${geoNum(area)}\\ \\text{cm}^2` },
    ], { type: 'triangle', base, h, area }, {
      pts: [[0, 0], [base, 0], [foot, h]], sides: [geoCm(base), geoCm(right), geoCm(left)],
      height: { apex: [foot, h], foot: [foot, 0], label: geoCm(h), towards: [base, 0] },
      aria: `A triangle with the base ${geoCm(base)} and the height ${geoCm(h)}`,
    });
  }
  const base = randInt(8, 24) * 0.5, h = randInt(2, 7), shift = base * (randInt(15, 50) / 100);
  const slant = Math.hypot(shift, h), area = base * h;
  return geoValue('Calculate the area of the parallelogram.', 'What is the area? (in cm²)', area, [
    { explanation: TEXTS.geometry.parallelogramHeight, math: `a = ${geoNum(base)}\\ \\text{cm}, \\quad h = ${h}\\ \\text{cm}` },
    { explanation: TEXTS.formulas.useFormula('area of a parallelogram'), math: 'A = a \\cdot h' },
    { explanation: TEXTS.formulas.putNumbers, math: `A = ${geoNum(base)} \\cdot ${h} = ${geoNum(area)}\\ \\text{cm}^2` },
  ], { type: 'parallelogram', base, h, area }, {
    pts: [[0, 0], [base, 0], [base + shift, h], [shift, h]], sides: [geoCm(base), geoCm(slant), '', ''],
    height: { apex: [shift, h], foot: [shift, 0], label: geoCm(h), towards: [base, 0] },
    aria: `A parallelogram with the base ${geoCm(base)} and the height ${geoCm(h)}`,
  });
}

// ─── register with the shared generator table (defined in equations.js) ──────
Object.assign(GENERATORS, {
  'geo-perimeter':      generateGeoPerimeter,
  'geo-area':           generateGeoArea,
  'geo-triangle-sides': generateGeoTriangleSides,
  'geo-angles':         generateGeoAngles,
  'geo-area-figure':    generateGeoAreaFigure,
});
