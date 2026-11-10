/**
 * formulas.js
 * Learning formulas by heart (kaavat): geometry, short multiplication formulas, quadratics, powers,
 * percent, lines. Every level goes through its formulas in a shuffled order and asks about each one
 * in a different way:
 *
 *   which    "Which formula gives the area of a rectangle?"   (the right one among 4, with typical mistakes)
 *   blank    "A = a · ?"                                       (fill in the missing part)
 *   name     the formula is shown: "What does this formula give?"
 *   symbol   "In P = 2a + 2b, what does P stand for?"          (with the Finnish word)
 *   apply    a number problem that uses the formula            (value, or a choice with π)
 *   concept  short facts: units, what the perimeter is, D < 0 …
 *
 * A formula: { id, name, fi, latex, note, example, wrong: [LaTeX × 3+], blanks: [{ tpl ("@@" is the gap), ans, wrong }],
 *              symbols: [{ sym, mean }], apply: () => problem }
 * Problems are { kind: 'choice', … } or { kind: 'value', … }.
 *
 * Load after word-problems.js (NAMES), equations.js (randInt), polynomial-equations.js (pick) and texts.js.
 */

// ─── helpers (names start with "fm") ──────────────────────────────────────────

function fmShuffle(list) {
  const a = list.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = randInt(0, i);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const fmCap = s => s.charAt(0).toUpperCase() + s.slice(1);
const fmMath = latex => `$${latex}$`;

/** An answer fragment of a blank; a lone sign is drawn larger so that it can be seen */
const fmFragment = latex => (['+', '-', '/', '\\cdot'].includes(latex) ? `$\\Large ${latex}$` : fmMath(latex));

/** A value problem that uses the formula f (steps: the formula, then the numbers put in) */
function fmValue(f, text, question, answer, substituted) {
  return {
    kind: 'value', text, question, answer,
    steps: [
      { explanation: TEXTS.formulas.useFormula(f.name), math: f.latex },
      { explanation: TEXTS.formulas.putNumbers, math: substituted },
    ],
    meta: { formula: f.id, type: 'apply' },
  };
}

/** A choice problem with exact answers in terms of π */
function fmChoice(f, text, question, correct, wrongs, substituted) {
  const distinct = wrongs.filter((w, i) => w !== correct && wrongs.indexOf(w) === i);      // typical mistakes, never equal to the right answer
  const options = fmShuffle([correct, ...distinct.slice(0, 3)]);
  return {
    kind: 'choice', text, question, options: options.map(fmMath), answer: options.indexOf(correct),
    steps: [
      { explanation: TEXTS.formulas.useFormula(f.name), math: f.latex },
      { explanation: TEXTS.formulas.putNumbers, math: substituted },
    ],
    meta: { formula: f.id, type: 'apply' },
  };
}

// ─── the formulas ─────────────────────────────────────────────────────────────

const FM_SIDE = 'side (sivu)', FM_PERIM = 'perimeter (piiri)', FM_AREA = 'area (pinta-ala)', FM_VOL = 'volume (tilavuus)';
const FM_BASE = 'base (kanta)', FM_HEIGHT = 'height (korkeus)', FM_RADIUS = 'radius (säde)', FM_BASEAREA = 'area of the base (pohjan ala)';

const FM_RECT_PERIMETER = {
  id: 'rect-perimeter', name: 'perimeter of a rectangle', fi: 'suorakulmion piiri', latex: 'P = 2a + 2b',
  note: 'Walk around the rectangle: two sides of length $a$ and two sides of length $b$. It can also be written $P = 2(a + b)$.',
  example: 'a = 3,\\ b = 5: \\quad P = 2 \\cdot 3 + 2 \\cdot 5 = 16',
  wrong: ['P = a + b', 'P = a \\cdot b', 'P = 2ab', 'P = 2a + b'],
  blanks: [{ tpl: 'P = 2a + @@', ans: '2b', wrong: ['b', 'ab', '2a'] }, { tpl: 'P = @@ + 2b', ans: '2a', wrong: ['a', 'ab', '2b'] }],
  symbols: [{ sym: 'P', mean: FM_PERIM }, { sym: 'a', mean: FM_SIDE }, { sym: 'b', mean: FM_SIDE }],
  apply() {
    const a = randInt(2, 20); let b; do { b = randInt(2, 20); } while (b === a);
    return fmValue(this, `A rectangle has sides ${a} cm and ${b} cm.`, 'What is its perimeter? (in cm)', 2 * a + 2 * b, `P = 2 \\cdot ${a} + 2 \\cdot ${b} = ${2 * a + 2 * b}`);
  },
};
const FM_RECT_AREA = {
  id: 'rect-area', name: 'area of a rectangle', fi: 'suorakulmion pinta-ala', latex: 'A = a \\cdot b',
  note: 'The rectangle is $b$ rows of $a$ unit squares. Area is measured in square units (cm², m²).',
  example: 'a = 3,\\ b = 5: \\quad A = 3 \\cdot 5 = 15',
  wrong: ['A = a + b', 'A = 2a + 2b', 'A = 2(a + b)', 'A = \\dfrac{a \\cdot b}{2}'],
  blanks: [{ tpl: 'A = a \\cdot @@', ans: 'b', wrong: ['2b', 'a', 'b^2'] }],
  symbols: [{ sym: 'A', mean: FM_AREA }, { sym: 'a', mean: FM_SIDE }, { sym: 'b', mean: FM_SIDE }],
  apply() {
    const a = randInt(2, 20); let b; do { b = randInt(2, 20); } while (b === a);
    return fmValue(this, `A rectangle has sides ${a} m and ${b} m.`, 'What is its area? (in m²)', a * b, `A = ${a} \\cdot ${b} = ${a * b}`);
  },
};
const FM_SQUARE_PERIMETER = {
  id: 'square-perimeter', name: 'perimeter of a square', fi: 'neliön piiri', latex: 'P = 4a',
  note: 'A square has four equal sides.', example: 'a = 6: \\quad P = 4 \\cdot 6 = 24',
  wrong: ['P = a^2', 'P = 2a', 'P = a + 4', 'P = 4 + a^2'],
  blanks: [{ tpl: 'P = @@ \\cdot a', ans: '4', wrong: ['2', 'a', '3'] }],
  symbols: [{ sym: 'P', mean: FM_PERIM }, { sym: 'a', mean: FM_SIDE }],
  apply() { const a = randInt(2, 30); return fmValue(this, `A square has a side of ${a} cm.`, 'What is its perimeter? (in cm)', 4 * a, `P = 4 \\cdot ${a} = ${4 * a}`); },
};
const FM_SQUARE_AREA = {
  id: 'square-area', name: 'area of a square', fi: 'neliön pinta-ala', latex: 'A = a^2',
  note: 'A square is a rectangle with $b = a$, so $A = a \\cdot a$.', example: 'a = 6: \\quad A = 6^2 = 36',
  wrong: ['A = 4a', 'A = 2a', 'A = 2a^2', 'A = a + a'],
  blanks: [{ tpl: 'A = a \\cdot @@', ans: 'a', wrong: ['2', '4', '2a'] }],
  symbols: [{ sym: 'A', mean: FM_AREA }, { sym: 'a', mean: FM_SIDE }],
  apply() { const a = randInt(2, 25); return fmValue(this, `A square has a side of ${a} m.`, 'What is its area? (in m²)', a * a, `A = ${a}^2 = ${a * a}`); },
};

const FM_TRIANGLE_AREA = {
  id: 'triangle-area', name: 'area of a triangle', fi: 'kolmion pinta-ala', latex: 'A = \\dfrac{a \\cdot h}{2}',
  note: 'In words: area = base times height divided by 2 (<i>kanta · korkeus / 2</i>). A triangle is half of the rectangle $a \\times h$. The height $h$ is perpendicular to the base $a$ (it is not a side of the triangle).',
  example: 'a = 8,\\ h = 5: \\quad A = \\dfrac{8 \\cdot 5}{2} = 20',
  wrong: ['A = a \\cdot h', 'A = \\dfrac{a + h}{2}', 'A = \\dfrac{a \\cdot h}{3}', 'A = 2 \\cdot a \\cdot h'],
  blanks: [{ tpl: 'A = \\dfrac{a \\cdot h}{@@}', ans: '2', wrong: ['3', '1', 'a'] }, { tpl: 'A = \\dfrac{a \\cdot @@}{2}', ans: 'h', wrong: ['b', 'c', '2'] }, { tpl: 'A = \\dfrac{@@ \\cdot h}{2}', ans: 'a', wrong: ['b', 'c', '2'] }],
  symbols: [{ sym: 'A', mean: FM_AREA }, { sym: 'a', mean: FM_BASE }, { sym: 'h', mean: FM_HEIGHT }],
  apply() {
    let a, h; do { a = randInt(2, 20); h = randInt(2, 20); } while ((a * h) % 2 !== 0);
    return fmValue(this, `A triangle has the base ${a} cm and the height ${h} cm.`, 'What is its area? (in cm²)', a * h / 2, `A = \\dfrac{${a} \\cdot ${h}}{2} = ${a * h / 2}`);
  },
};
const FM_TRIANGLE_PERIMETER = {
  id: 'triangle-perimeter', name: 'perimeter of a triangle', fi: 'kolmion piiri', latex: 'P = a + b + c',
  note: 'Add the three sides.', example: 'a = 3,\\ b = 4,\\ c = 5: \\quad P = 3 + 4 + 5 = 12',
  wrong: ['P = a \\cdot b \\cdot c', 'P = a + b', 'P = 2a + 2b', 'P = \\dfrac{a + b + c}{2}'],
  blanks: [{ tpl: 'P = a + b + @@', ans: 'c', wrong: ['2c', 'h', 'ab'] }],
  symbols: [{ sym: 'P', mean: FM_PERIM }, { sym: 'a', mean: FM_SIDE }],
  apply() { const a = randInt(3, 15), b = randInt(3, 15), c = randInt(Math.abs(a - b) + 1, a + b - 1);
    return fmValue(this, `A triangle has sides ${a} cm, ${b} cm and ${c} cm.`, 'What is its perimeter? (in cm)', a + b + c, `P = ${a} + ${b} + ${c} = ${a + b + c}`); },
};
const FM_PARALLELOGRAM_AREA = {
  id: 'parallelogram-area', name: 'area of a parallelogram', fi: 'suunnikkaan pinta-ala', latex: 'A = a \\cdot h',
  note: 'The height $h$ is the perpendicular distance between the parallel sides, not the slanted side $b$.',
  example: 'a = 7,\\ h = 4: \\quad A = 7 \\cdot 4 = 28',
  wrong: ['A = a \\cdot b', 'A = \\dfrac{a \\cdot h}{2}', 'A = 2(a + b)', 'A = a + h'],
  blanks: [{ tpl: 'A = a \\cdot @@', ans: 'h', wrong: ['b', 'a', '2'] }],
  symbols: [{ sym: 'A', mean: FM_AREA }, { sym: 'a', mean: FM_BASE }, { sym: 'h', mean: FM_HEIGHT }],
  apply() { const a = randInt(3, 20), h = randInt(2, 15);
    return fmValue(this, `A parallelogram has the base ${a} cm and the height ${h} cm.`, 'What is its area? (in cm²)', a * h, `A = ${a} \\cdot ${h} = ${a * h}`); },
};
const FM_TRAPEZOID_AREA = {
  id: 'trapezoid-area', name: 'area of a trapezoid', fi: 'puolisuunnikkaan pinta-ala', latex: 'A = \\dfrac{1}{2}(a + b) \\cdot h',
  note: 'The average of the two parallel sides times the height. $a$ and $b$ are the parallel sides.',
  example: 'a = 3,\\ b = 7,\\ h = 4: \\quad A = \\dfrac{1}{2}(3 + 7) \\cdot 4 = 20',
  wrong: ['A = (a + b) \\cdot h', 'A = \\dfrac{1}{2} \\cdot a \\cdot b \\cdot h', 'A = \\dfrac{1}{2}(a - b) \\cdot h', 'A = \\dfrac{a + b}{h}'],
  blanks: [{ tpl: 'A = @@(a + b) \\cdot h', ans: '\\dfrac{1}{2}', wrong: ['2', '1', '\\dfrac{1}{3}'] }, { tpl: 'A = \\dfrac{1}{2}(a @@ b) \\cdot h', ans: '+', wrong: ['-', '\\cdot', '/'] }],
  symbols: [{ sym: 'A', mean: FM_AREA }, { sym: 'h', mean: FM_HEIGHT }],
  apply() { let a, b, h; do { a = randInt(2, 14); b = randInt(a + 1, 18); h = randInt(2, 12); } while (((a + b) * h) % 2 !== 0);
    return fmValue(this, `A trapezoid has parallel sides ${a} cm and ${b} cm, and the height ${h} cm.`, 'What is its area? (in cm²)', (a + b) * h / 2, `A = \\dfrac{1}{2}(${a} + ${b}) \\cdot ${h} = ${(a + b) * h / 2}`); },
};
const FM_CIRCLE_CIRCUMFERENCE = {
  id: 'circle-circumference', name: 'circumference of a circle', fi: 'ympyrän kehä (ympärysmitta)', latex: 'C = 2 \\pi r',
  note: 'Since the diameter is $d = 2r$, this is the same as $C = \\pi d$. The circumference is a length (cm, m).',
  example: 'r = 3: \\quad C = 2 \\pi \\cdot 3 = 6\\pi',
  wrong: ['C = \\pi r^2', 'C = \\pi r', 'C = 2 \\pi r^2', 'C = 2 \\pi d'],
  blanks: [{ tpl: 'C = 2 \\pi @@', ans: 'r', wrong: ['r^2', 'd', '2r'] }],
  symbols: [{ sym: 'C', mean: 'circumference (ympärysmitta)' }, { sym: 'r', mean: FM_RADIUS }],
  apply() { const r = randInt(2, 12);
    return fmChoice(this, `A circle has the radius ${r} cm.`, 'What is its circumference? (in cm)', `${2 * r}\\pi`, [`${r}\\pi`, `${r * r}\\pi`, `${4 * r}\\pi`, `${2 * r * r}\\pi`, `${r + 2}\\pi`, `${3 * r}\\pi`], `C = 2 \\pi \\cdot ${r} = ${2 * r}\\pi`); },
};
const FM_CIRCLE_AREA = {
  id: 'circle-area', name: 'area of a circle', fi: 'ympyrän pinta-ala', latex: 'A = \\pi r^2',
  note: 'Only the radius is squared: $\\pi r^2$ is not $(\\pi r)^2$. Area is measured in square units.',
  example: 'r = 3: \\quad A = \\pi \\cdot 3^2 = 9\\pi',
  wrong: ['A = 2 \\pi r', 'A = \\pi r', 'A = \\pi d^2', 'A = 2 \\pi r^2'],
  blanks: [{ tpl: 'A = \\pi \\cdot @@', ans: 'r^2', wrong: ['2r', 'r', 'd^2'] }],
  symbols: [{ sym: 'A', mean: FM_AREA }, { sym: 'r', mean: FM_RADIUS }],
  apply() { const r = randInt(2, 12);
    return fmChoice(this, `A circle has the radius ${r} cm.`, 'What is its area? (in cm²)', `${r * r}\\pi`, [`${2 * r}\\pi`, `${r}\\pi`, `${4 * r * r}\\pi`, `${2 * r * r}\\pi`, `${(2 * r) ** 2}\\pi`, `${r * r + 2}\\pi`], `A = \\pi \\cdot ${r}^2 = ${r * r}\\pi`); },
};
const FM_PYTHAGORAS = {
  id: 'pythagoras', name: 'Pythagorean theorem (right triangle)', fi: 'Pythagoraan lause', latex: 'c^2 = a^2 + b^2',
  note: '$c$ is the hypotenuse, the side opposite to the right angle (the longest one). $a$ and $b$ are the legs.',
  example: 'a = 3,\\ b = 4: \\quad c^2 = 9 + 16 = 25,\\ c = 5',
  wrong: ['c = a + b', 'c^2 = a^2 - b^2', 'c^2 = a + b', 'c = a^2 + b^2'],
  blanks: [{ tpl: 'c^2 = a^2 @@ b^2', ans: '+', wrong: ['-', '\\cdot', '/'] }, { tpl: '@@ = a^2 + b^2', ans: 'c^2', wrong: ['c', '2c', 'c + 2'] }],
  symbols: [{ sym: 'c', mean: 'hypotenuse (hypotenuusa)' }, { sym: 'a', mean: 'leg (kateetti)' }, { sym: 'b', mean: 'leg (kateetti)' }],
  apply() {
    const triples = [[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25], [20, 21, 29]];
    const [a0, b0, c0] = pick(triples), k = pick([1, 1, 2, 3]);
    const a = a0 * k, b = b0 * k, c = c0 * k;
    return fmValue(this, `The legs of a right triangle are ${a} cm and ${b} cm.`, 'How long is the hypotenuse? (in cm)', c, `c^2 = ${a}^2 + ${b}^2 = ${a * a} + ${b * b} = ${c * c}, \\quad c = ${c}`);
  },
};

const FM_CUBOID_VOLUME = {
  id: 'cuboid-volume', name: 'volume of a cuboid', fi: 'suorakulmaisen särmiön tilavuus', latex: 'V = a \\cdot b \\cdot c',
  note: 'Base area $a \\cdot b$ times the height $c$. Volume is measured in cubic units (cm³, m³).',
  example: 'a = 2,\\ b = 3,\\ c = 4: \\quad V = 2 \\cdot 3 \\cdot 4 = 24',
  wrong: ['V = a + b + c', 'V = 2(ab + bc + ac)', 'V = a \\cdot b', 'V = \\dfrac{a \\cdot b \\cdot c}{3}'],
  blanks: [{ tpl: 'V = a \\cdot b \\cdot @@', ans: 'c', wrong: ['a', '2c', '3'] }],
  symbols: [{ sym: 'V', mean: FM_VOL }],
  apply() { const a = randInt(2, 10), b = randInt(2, 10), c = randInt(2, 10);
    return fmValue(this, `A box measures ${a} cm × ${b} cm × ${c} cm.`, 'What is its volume? (in cm³)', a * b * c, `V = ${a} \\cdot ${b} \\cdot ${c} = ${a * b * c}`); },
};
const FM_CUBOID_SURFACE = {
  id: 'cuboid-surface', name: 'surface area of a cuboid', fi: 'särmiön pinta-ala', latex: 'S = 2(ab + bc + ac)',
  note: 'Three pairs of equal faces: $ab$, $bc$ and $ac$, each twice.',
  example: 'a = 2,\\ b = 3,\\ c = 4: \\quad S = 2(6 + 12 + 8) = 52',
  wrong: ['S = ab + bc + ac', 'S = 2abc', 'S = 2(a + b + c)', 'S = 6a^2'],
  blanks: [{ tpl: 'S = @@(ab + bc + ac)', ans: '2', wrong: ['1', '3', '6'] }],
  symbols: [],
  apply() { const a = randInt(2, 9), b = randInt(2, 9), c = randInt(2, 9);
    return fmValue(this, `A box measures ${a} cm × ${b} cm × ${c} cm.`, 'What is the area of its whole surface? (in cm²)', 2 * (a * b + b * c + a * c), `S = 2(${a * b} + ${b * c} + ${a * c}) = ${2 * (a * b + b * c + a * c)}`); },
};
const FM_CUBE_VOLUME = {
  id: 'cube-volume', name: 'volume of a cube', fi: 'kuution tilavuus', latex: 'V = a^3',
  note: 'A cube is a cuboid with all three edges equal: $a \\cdot a \\cdot a$.', example: 'a = 3: \\quad V = 3^3 = 27',
  wrong: ['V = 3a', 'V = a^2', 'V = 6a^2', 'V = 3a^2'],
  blanks: [{ tpl: 'V = a \\cdot a \\cdot @@', ans: 'a', wrong: ['3', '2a', 'a^2'] }],
  symbols: [{ sym: 'V', mean: FM_VOL }],
  apply() { const a = randInt(2, 12); return fmValue(this, `A cube has an edge of ${a} cm.`, 'What is its volume? (in cm³)', a ** 3, `V = ${a}^3 = ${a ** 3}`); },
};
const FM_CUBE_SURFACE = {
  id: 'cube-surface', name: 'surface area of a cube', fi: 'kuution pinta-ala', latex: 'S = 6a^2',
  note: 'A cube has 6 equal square faces, each with the area $a^2$.', example: 'a = 3: \\quad S = 6 \\cdot 9 = 54',
  wrong: ['S = 6a', 'S = a^3', 'S = 4a^2', 'S = 12a'],
  blanks: [{ tpl: 'S = @@ \\cdot a^2', ans: '6', wrong: ['4', '3', '12'] }],
  symbols: [],
  apply() { const a = randInt(2, 12); return fmValue(this, `A cube has an edge of ${a} cm.`, 'What is the area of its whole surface? (in cm²)', 6 * a * a, `S = 6 \\cdot ${a}^2 = ${6 * a * a}`); },
};
const FM_PRISM_VOLUME = {
  id: 'prism-volume', name: 'volume of a prism', fi: 'särmiön tilavuus', latex: 'V = A_b \\cdot h',
  note: 'Base area times height. It works for any prism and for a cylinder.', example: 'A_b = 12,\\ h = 5: \\quad V = 12 \\cdot 5 = 60',
  wrong: ['V = \\dfrac{1}{3} A_b h', 'V = A_b + h', 'V = 2 A_b h', 'V = A_b \\cdot h^2'],
  blanks: [{ tpl: 'V = A_b \\cdot @@', ans: 'h', wrong: ['b', '2h', 'A'] }],
  symbols: [{ sym: 'V', mean: FM_VOL }, { sym: 'h', mean: FM_HEIGHT }, { sym: 'A_b', mean: FM_BASEAREA }],
  apply() { const A = randInt(4, 40), h = randInt(2, 15);
    return fmValue(this, `A prism has a base area of ${A} cm² and the height ${h} cm.`, 'What is its volume? (in cm³)', A * h, `V = ${A} \\cdot ${h} = ${A * h}`); },
};
const FM_PYRAMID_VOLUME = {
  id: 'pyramid-volume', name: 'volume of a pyramid', fi: 'pyramidin tilavuus', latex: 'V = \\dfrac{1}{3} A_b \\cdot h',
  note: 'A pyramid is one third of the prism with the same base and height. The same holds for a cone.',
  example: 'A_b = 12,\\ h = 5: \\quad V = \\dfrac{1}{3} \\cdot 12 \\cdot 5 = 20',
  wrong: ['V = A_b \\cdot h', 'V = \\dfrac{1}{2} A_b h', 'V = 3 A_b h', 'V = \\dfrac{1}{3}(A_b + h)'],
  blanks: [{ tpl: 'V = @@ A_b \\cdot h', ans: '\\dfrac{1}{3}', wrong: ['\\dfrac{1}{2}', '3', '1'] }],
  symbols: [{ sym: 'V', mean: FM_VOL }, { sym: 'A_b', mean: FM_BASEAREA }],
  apply() { let A, h; do { A = randInt(3, 30); h = randInt(2, 15); } while ((A * h) % 3 !== 0);
    return fmValue(this, `A pyramid has a base area of ${A} cm² and the height ${h} cm.`, 'What is its volume? (in cm³)', A * h / 3, `V = \\dfrac{1}{3} \\cdot ${A} \\cdot ${h} = ${A * h / 3}`); },
};
const FM_CYLINDER_VOLUME = {
  id: 'cylinder-volume', name: 'volume of a cylinder', fi: 'sylinterin tilavuus', latex: 'V = \\pi r^2 h',
  note: 'The base area $\\pi r^2$ times the height.', example: 'r = 2,\\ h = 5: \\quad V = \\pi \\cdot 4 \\cdot 5 = 20\\pi',
  wrong: ['V = 2 \\pi r h', 'V = \\pi r h', 'V = \\pi r^2', 'V = 2 \\pi r^2 h'],
  blanks: [{ tpl: 'V = \\pi r^2 \\cdot @@', ans: 'h', wrong: ['r', '2', 'd'] }],
  symbols: [{ sym: 'V', mean: FM_VOL }, { sym: 'r', mean: FM_RADIUS }, { sym: 'h', mean: FM_HEIGHT }],
  apply() { const r = randInt(2, 8), h = randInt(2, 12);
    return fmChoice(this, `A cylinder has the radius ${r} cm and the height ${h} cm.`, 'What is its volume? (in cm³)', `${r * r * h}\\pi`, [`${2 * r * h}\\pi`, `${r * h}\\pi`, `${r * r}\\pi`, `${3 * r * r * h}\\pi`, `${r * r * h + r}\\pi`, `${2 * r * r * h}\\pi`], `V = \\pi \\cdot ${r}^2 \\cdot ${h} = ${r * r * h}\\pi`); },
};
const FM_CYLINDER_SIDE = {
  id: 'cylinder-side', name: 'lateral surface of a cylinder', fi: 'sylinterin vaippa', latex: 'A_{side} = 2 \\pi r h',
  note: 'Unroll the side: a rectangle with the width $2\\pi r$ (the circumference) and the height $h$.',
  example: 'r = 2,\\ h = 5: \\quad A_{side} = 2 \\pi \\cdot 2 \\cdot 5 = 20\\pi',
  wrong: ['A_{side} = \\pi r^2 h', 'A_{side} = \\pi r h', 'A_{side} = 2 \\pi r^2', 'A_{side} = 2 \\pi r + h'],
  blanks: [{ tpl: 'A_{side} = 2 \\pi r \\cdot @@', ans: 'h', wrong: ['r', '2', 'd'] }],
  symbols: [],
};
const FM_CONE_VOLUME = {
  id: 'cone-volume', name: 'volume of a cone', fi: 'kartion tilavuus', latex: 'V = \\dfrac{1}{3} \\pi r^2 h',
  note: 'One third of the cylinder with the same base and height.', example: 'r = 3,\\ h = 4: \\quad V = \\dfrac{1}{3} \\pi \\cdot 9 \\cdot 4 = 12\\pi',
  wrong: ['V = \\pi r^2 h', 'V = \\dfrac{1}{2} \\pi r^2 h', 'V = \\dfrac{1}{3} \\pi r h', 'V = 3 \\pi r^2 h'],
  blanks: [{ tpl: 'V = @@ \\pi r^2 h', ans: '\\dfrac{1}{3}', wrong: ['\\dfrac{1}{2}', '2', '1'] }],
  symbols: [{ sym: 'V', mean: FM_VOL }],
};
const FM_SPHERE_VOLUME = {
  id: 'sphere-volume', name: 'volume of a sphere', fi: 'pallon tilavuus', latex: 'V = \\dfrac{4}{3} \\pi r^3',
  note: 'The radius is cubed (a volume has three dimensions).', example: 'r = 3: \\quad V = \\dfrac{4}{3} \\pi \\cdot 27 = 36\\pi',
  wrong: ['V = 4 \\pi r^2', 'V = \\dfrac{4}{3} \\pi r^2', 'V = \\dfrac{1}{3} \\pi r^3', 'V = \\dfrac{3}{4} \\pi r^3'],
  blanks: [{ tpl: 'V = @@ \\pi r^3', ans: '\\dfrac{4}{3}', wrong: ['\\dfrac{3}{4}', '4', '\\dfrac{1}{3}'] }],
  symbols: [{ sym: 'V', mean: FM_VOL }],
  apply() { const r = pick([3, 6, 9, 12]);
    return fmChoice(this, `A ball has the radius ${r} cm.`, 'What is its volume? (in cm³)', `${4 * r ** 3 / 3}\\pi`, [`${4 * r * r}\\pi`, `${r ** 3 / 3}\\pi`, `${4 * r ** 3}\\pi`, `${3 * r ** 3 / 4}\\pi`, `${r ** 3}\\pi`, `${2 * r ** 3 / 3}\\pi`], `V = \\dfrac{4}{3} \\pi \\cdot ${r}^3 = ${4 * r ** 3 / 3}\\pi`); },
};
const FM_SPHERE_SURFACE = {
  id: 'sphere-surface', name: 'surface area of a sphere', fi: 'pallon pinta-ala', latex: 'A = 4 \\pi r^2',
  note: 'Four times the area of the great circle $\\pi r^2$.', example: 'r = 3: \\quad A = 4 \\pi \\cdot 9 = 36\\pi',
  wrong: ['A = \\dfrac{4}{3} \\pi r^3', 'A = 2 \\pi r^2', 'A = \\pi r^2', 'A = 4 \\pi r'],
  blanks: [{ tpl: 'A = @@ \\pi r^2', ans: '4', wrong: ['2', '3', '\\dfrac{4}{3}'] }],
  symbols: [{ sym: 'A', mean: FM_AREA }, { sym: 'r', mean: FM_RADIUS }],
};

/** (a ± b)² with small numbers for quick mental calculation: 31² = (30 + 1)² */
function fmSquareApply(f, sign) {
  const tens = randInt(2, 9) * 10, s = randInt(1, 3), n = tens + sign * s, op = sign > 0 ? '+' : '-';
  return fmValue(f, `Calculate ${n}² in your head using $(a ${op} b)^2$.`, `What is ${n}²?`, n * n,
    `(${tens} ${op} ${s})^2 = ${tens * tens} ${op} ${2 * tens * s} + ${s * s} = ${n * n}`);
}
const FM_SQ_SUM = {
  id: 'sq-sum', name: 'square of a sum', fi: 'summan neliö', latex: '(a + b)^2 = a^2 + 2ab + b^2',
  note: 'The middle term $2ab$ is the one people forget: $(a + b)^2$ is not $a^2 + b^2$.',
  example: '(3 + 4)^2 = 49 = 9 + 24 + 16',
  wrong: ['(a + b)^2 = a^2 + b^2', '(a + b)^2 = a^2 + ab + b^2', '(a + b)^2 = a^2 + 2ab - b^2', '(a + b)^2 = 2a + 2b'],
  blanks: [{ tpl: '(a + b)^2 = a^2 + @@ + b^2', ans: '2ab', wrong: ['ab', '2a + 2b', 'a^2 b^2'] }, { tpl: '(a + b)^2 = a^2 + 2ab @@ b^2', ans: '+', wrong: ['-', '\\cdot', '/'] }],
  symbols: [],
  apply() { return fmSquareApply(this, 1); },
};
const FM_SQ_DIFF = {
  id: 'sq-diff', name: 'square of a difference', fi: 'erotuksen neliö', latex: '(a - b)^2 = a^2 - 2ab + b^2',
  note: 'The middle term is $-2ab$, but the last term is $+b^2$ (a square is never negative).',
  example: '(5 - 2)^2 = 9 = 25 - 20 + 4',
  wrong: ['(a - b)^2 = a^2 - b^2', '(a - b)^2 = a^2 - 2ab - b^2', '(a - b)^2 = a^2 - ab + b^2', '(a - b)^2 = a^2 + 2ab + b^2'],
  blanks: [{ tpl: '(a - b)^2 = a^2 - 2ab @@ b^2', ans: '+', wrong: ['-', '\\cdot', '/'] }, { tpl: '(a - b)^2 = a^2 @@ 2ab + b^2', ans: '-', wrong: ['+', '\\cdot', '/'] }],
  symbols: [],
  apply() { return fmSquareApply(this, -1); },
};
const FM_DIFF_SQUARES = {
  id: 'diff-squares', name: 'product of a sum and a difference', fi: 'summan ja erotuksen tulo', latex: '(a + b)(a - b) = a^2 - b^2',
  note: 'The middle terms cancel: $-ab + ab = 0$. Good for quick products such as $52 \\cdot 48$.',
  example: '(5 + 2)(5 - 2) = 21 = 25 - 4',
  wrong: ['(a + b)(a - b) = a^2 + b^2', '(a + b)(a - b) = a^2 - 2ab + b^2', '(a + b)(a - b) = a^2 + 2ab - b^2', '(a + b)(a - b) = (a - b)^2'],
  blanks: [{ tpl: '(a + b)(a - b) = a^2 @@ b^2', ans: '-', wrong: ['+', '\\cdot', '/'] }],
  symbols: [],
  apply() {
    const m = pick([20, 30, 40, 50, 60, 70, 80, 100]), d = randInt(1, 5);
    return fmValue(this, `Calculate ${m + d} · ${m - d} in your head using $(a + b)(a - b)$.`, `What is ${m + d} · ${m - d}?`, m * m - d * d,
      `(${m} + ${d})(${m} - ${d}) = ${m}^2 - ${d}^2 = ${m * m} - ${d * d} = ${m * m - d * d}`);
  },
};
const FM_FACTOR_SQUARES = {
  id: 'factor-squares', name: 'difference of squares (factoring)', fi: 'neliöiden erotus', latex: 'a^2 - b^2 = (a + b)(a - b)',
  note: 'The same rule read backwards. A sum of squares $a^2 + b^2$ cannot be factored this way.',
  example: 'x^2 - 9 = (x + 3)(x - 3)',
  wrong: ['a^2 - b^2 = (a - b)^2', 'a^2 - b^2 = (a - b)(a - b)', 'a^2 - b^2 = a - b', 'a^2 - b^2 = (a + b)^2'],
  blanks: [{ tpl: 'a^2 - b^2 = (a + b)(a @@ b)', ans: '-', wrong: ['+', '\\cdot', '/'] }],
  symbols: [],
};
const FM_COMMON_FACTOR = {
  id: 'common-factor', name: 'common factor (factoring out)', fi: 'yhteinen tekijä', latex: 'ab + ac = a(b + c)',
  note: 'Take the common factor out of the brackets; multiplying out gives back $ab + ac$.',
  example: '6x + 9 = 3(2x + 3)',
  wrong: ['ab + ac = a(b \\cdot c)', 'ab + ac = a + bc', 'ab + ac = ab(c + 1)', 'ab + ac = (a + b)(a + c)'],
  blanks: [{ tpl: 'ab + ac = a(b @@ c)', ans: '+', wrong: ['-', '\\cdot', '/'] }],
  symbols: [],
};
const FM_FACTOR_QUADRATIC = {
  id: 'factor-quadratic', name: 'factoring a quadratic with leading coefficient 1', fi: 'toisen asteen polynomin tekijöihin jako', latex: 'x^2 + (p + q)x + pq = (x + p)(x + q)',
  note: 'Find two numbers whose product is the constant term and whose sum is the coefficient of $x$.',
  example: 'x^2 + 7x + 12 = (x + 3)(x + 4)',
  wrong: ['x^2 + (p + q)x + pq = (x + p)(x - q)', 'x^2 + (p + q)x + pq = (x + pq)(x + 1)', 'x^2 + (p + q)x + pq = (x + p + q)^2', 'x^2 + (p + q)x + pq = x(x + p + q)'],
  blanks: [{ tpl: 'x^2 + (p + q)x + pq = (x + p)(x @@ q)', ans: '+', wrong: ['-', '\\cdot', '/'] }],
  symbols: [],
};

const FM_Q_COEFF2 = 'coefficient of $x^2$', FM_Q_COEFF1 = 'coefficient of $x$', FM_Q_CONST = 'constant term (vakiotermi)';
const FM_Q_DISC = 'discriminant (diskriminantti)', FM_Q_ROOT = 'solution, root (juuri)';
const fmQuad = (a, b, c) => {
  const t = (n, v, first) => (first ? `${n < 0 ? '-' : ''}${Math.abs(n) === 1 && v ? '' : Math.abs(n)}${v}` : ` ${n < 0 ? '-' : '+'} ${Math.abs(n) === 1 && v ? '' : Math.abs(n)}${v}`);
  return `${t(a, 'x^2', true)}${b === 0 ? '' : t(b, 'x', false)}${c === 0 ? '' : t(c, '', false)} = 0`;
};
const FM_DISCRIMINANT = {
  id: 'discriminant', name: 'discriminant', fi: 'diskriminantti', latex: 'D = b^2 - 4ac',
  note: 'For the equation $ax^2 + bx + c = 0$. Its sign tells how many real solutions there are.',
  example: 'x^2 - 5x + 6 = 0: \\quad D = (-5)^2 - 4 \\cdot 1 \\cdot 6 = 1',
  wrong: ['D = b^2 + 4ac', 'D = 4ac - b^2', 'D = b^2 - 2ac', 'D = b - 4ac'],
  blanks: [{ tpl: 'D = b^2 - @@', ans: '4ac', wrong: ['2ac', 'ac', '4a + c'] }, { tpl: 'D = @@ - 4ac', ans: 'b^2', wrong: ['b', '2b', 'a^2'] }],
  symbols: [{ sym: 'D', mean: FM_Q_DISC }, { sym: 'a', mean: FM_Q_COEFF2 }, { sym: 'b', mean: FM_Q_COEFF1 }, { sym: 'c', mean: FM_Q_CONST }],
  apply() {
    const a = randNZ(4), b = randNZ(9), c = randNZ(9);
    const D = b * b - 4 * a * c;
    return fmValue(this, `Consider the equation $${fmQuad(a, b, c)}$.`, 'What is its discriminant?', D, `D = ${b < 0 ? `(${b})` : b}^2 - 4 \\cdot ${a < 0 ? `(${a})` : a} \\cdot ${c < 0 ? `(${c})` : c} = ${b * b} ${-4 * a * c < 0 ? '-' : '+'} ${Math.abs(4 * a * c)} = ${D}`);
  },
};
const FM_QUAD_FORMULA = {
  id: 'quad-formula', name: 'quadratic formula', fi: 'toisen asteen yhtälön ratkaisukaava', latex: 'x = \\dfrac{-b \\pm \\sqrt{D}}{2a}',
  note: 'Remember the minus in front of $b$, and that the whole numerator is divided by $2a$.',
  example: 'x^2 - 5x + 6 = 0: \\quad x = \\dfrac{5 \\pm \\sqrt{1}}{2},\\ x = 3 \\text{ or } x = 2',
  wrong: ['x = \\dfrac{b \\pm \\sqrt{D}}{2a}', 'x = \\dfrac{-b \\pm \\sqrt{D}}{a}', 'x = \\dfrac{-b \\pm D}{2a}', 'x = \\dfrac{-b \\pm \\sqrt{D}}{2}'],
  blanks: [{ tpl: 'x = \\dfrac{-b \\pm \\sqrt{D}}{@@}', ans: '2a', wrong: ['a', '2', '4a'] }, { tpl: 'x = \\dfrac{@@ \\pm \\sqrt{D}}{2a}', ans: '-b', wrong: ['b', '-2b', 'b^2'] }],
  symbols: [{ sym: 'x', mean: FM_Q_ROOT }, { sym: 'D', mean: FM_Q_DISC }],
};
const FM_VIETA_SUM = {
  id: 'vieta-sum', name: 'sum of the roots (Vieta)', fi: 'juurten summa (Vietan kaava)', latex: 'x_1 + x_2 = -\\dfrac{b}{a}',
  note: 'For $ax^2 + bx + c = 0$ with the roots $x_1$ and $x_2$. Check: $x^2 - 5x + 6 = 0$ has the roots 2 and 3, the sum is $5 = -\\frac{-5}{1}$.',
  example: 'x^2 - 5x + 6 = 0: \\quad x_1 + x_2 = -\\dfrac{-5}{1} = 5',
  wrong: ['x_1 + x_2 = \\dfrac{b}{a}', 'x_1 + x_2 = -\\dfrac{c}{a}', 'x_1 + x_2 = \\dfrac{c}{a}', 'x_1 + x_2 = -b'],
  blanks: [{ tpl: 'x_1 + x_2 = @@\\dfrac{b}{a}', ans: '-', wrong: ['+', '2', '\\dfrac{1}{2}'] }],
  symbols: [{ sym: 'x_1', mean: FM_Q_ROOT }],
  apply() {
    const a = pick([1, 1, 2, 3]); let x1, x2; do { x1 = randNZ(8); x2 = randNZ(8); } while (x1 === x2);
    const b = -a * (x1 + x2), c = a * x1 * x2;
    return fmValue(this, `The equation $${fmQuad(a, b, c)}$ has the solutions $x_1$ and $x_2$.`, 'What is $x_1 + x_2$? (without solving the equation)', x1 + x2,
      `x_1 + x_2 = -\\dfrac{${b < 0 ? `(${b})` : b}}{${a}} = ${x1 + x2}`);
  },
};
const FM_VIETA_PRODUCT = {
  id: 'vieta-product', name: 'product of the roots (Vieta)', fi: 'juurten tulo (Vietan kaava)', latex: 'x_1 \\cdot x_2 = \\dfrac{c}{a}',
  note: 'No minus sign here. Check: the roots 2 and 3 of $x^2 - 5x + 6 = 0$ have the product $6 = \\frac{6}{1}$.',
  example: 'x^2 - 5x + 6 = 0: \\quad x_1 \\cdot x_2 = \\dfrac{6}{1} = 6',
  wrong: ['x_1 \\cdot x_2 = -\\dfrac{c}{a}', 'x_1 \\cdot x_2 = \\dfrac{b}{a}', 'x_1 \\cdot x_2 = -\\dfrac{b}{a}', 'x_1 \\cdot x_2 = c'],
  blanks: [{ tpl: 'x_1 \\cdot x_2 = \\dfrac{@@}{a}', ans: 'c', wrong: ['b', '-b', '-c'] }],
  symbols: [{ sym: 'x_1', mean: FM_Q_ROOT }],
  apply() {
    const a = pick([1, 1, 2, 3]); let x1, x2; do { x1 = randNZ(8); x2 = randNZ(8); } while (x1 === x2);
    const b = -a * (x1 + x2), c = a * x1 * x2;
    return fmValue(this, `The equation $${fmQuad(a, b, c)}$ has the solutions $x_1$ and $x_2$.`, 'What is $x_1 \\cdot x_2$? (without solving the equation)', x1 * x2,
      `x_1 \\cdot x_2 = \\dfrac{${c < 0 ? `(${c})` : c}}{${a}} = ${x1 * x2}`);
  },
};
const FM_QUAD_FACTORED = {
  id: 'quad-factored', name: 'factored form of a quadratic', fi: 'tekijämuoto', latex: 'ax^2 + bx + c = a(x - x_1)(x - x_2)',
  note: 'Do not forget the leading coefficient $a$ in front, and the minus signs: the root $x_1$ gives the factor $(x - x_1)$.',
  example: '2x^2 - 10x + 12 = 2(x - 2)(x - 3)',
  wrong: ['ax^2 + bx + c = (x - x_1)(x - x_2)', 'ax^2 + bx + c = a(x + x_1)(x + x_2)', 'ax^2 + bx + c = a(x - x_1) + (x - x_2)', 'ax^2 + bx + c = a(x - x_1)(x + x_2)'],
  blanks: [{ tpl: 'ax^2 + bx + c = a(x @@ x_1)(x - x_2)', ans: '-', wrong: ['+', '\\cdot', '/'] }],
  symbols: [],
};
const FM_VERTEX = {
  id: 'vertex', name: 'x-coordinate of the vertex of a parabola', fi: 'paraabelin huipun x-koordinaatti', latex: 'x_v = -\\dfrac{b}{2a}',
  note: 'The vertex lies exactly in the middle of the two roots. For $y = ax^2 + bx + c$.',
  example: 'y = x^2 - 6x + 5: \\quad x_v = -\\dfrac{-6}{2} = 3',
  wrong: ['x_v = \\dfrac{b}{2a}', 'x_v = -\\dfrac{b}{a}', 'x_v = -\\dfrac{2b}{a}', 'x_v = -\\dfrac{c}{2a}'],
  blanks: [{ tpl: 'x_v = -\\dfrac{b}{@@}', ans: '2a', wrong: ['a', '2', '4a'] }],
  symbols: [],
  apply() {
    const a = pick([1, 1, 2, 3, -1, -2]), k = randNZ(6), b = -2 * a * k, c = randNZ(9);
    return fmValue(this, `The parabola $y = ${fmQuad(a, b, c).replace(' = 0', '')}$.`, 'What is the $x$-coordinate of its vertex?', k,
      `x_v = -\\dfrac{${b < 0 ? `(${b})` : b}}{2 \\cdot ${a < 0 ? `(${a})` : a}} = ${k}`);
  },
};

const FM_POW_PRODUCT = {
  id: 'pow-product', name: 'product of powers with the same base', fi: 'samankantaisten potenssien tulo', latex: 'a^m \\cdot a^n = a^{m + n}',
  note: 'Same base: add the exponents. Count the factors: $a^2 \\cdot a^3 = (a \\cdot a)(a \\cdot a \\cdot a) = a^5$.',
  example: '2^3 \\cdot 2^4 = 2^7',
  wrong: ['a^m \\cdot a^n = a^{m n}', 'a^m \\cdot a^n = (2a)^{m + n}', 'a^m \\cdot a^n = a^{m - n}', 'a^m \\cdot a^n = a^m + a^n'],
  blanks: [{ tpl: 'a^m \\cdot a^n = a^{@@}', ans: 'm + n', wrong: ['m n', 'm - n', 'm^n'] }],
  symbols: [],
  apply() { const base = pick([2, 3, 5, 7, 10]), m = randInt(2, 9), n = randInt(2, 9);
    return fmValue(this, `$${base}^{${m}} \\cdot ${base}^{${n}} = ${base}^x$`, 'What is $x$?', m + n, `${base}^{${m}} \\cdot ${base}^{${n}} = ${base}^{${m} + ${n}} = ${base}^{${m + n}}`); },
};
const FM_POW_QUOTIENT = {
  id: 'pow-quotient', name: 'quotient of powers with the same base', fi: 'samankantaisten potenssien osamäärä', latex: '\\dfrac{a^m}{a^n} = a^{m - n}',
  note: 'Same base: subtract the exponents (the one in the denominator is subtracted).', example: '\\dfrac{5^7}{5^3} = 5^4',
  wrong: ['\\dfrac{a^m}{a^n} = a^{m + n}', '\\dfrac{a^m}{a^n} = a^{\\frac{m}{n}}', '\\dfrac{a^m}{a^n} = a^{n - m}', '\\dfrac{a^m}{a^n} = a^{m n}'],
  blanks: [{ tpl: '\\dfrac{a^m}{a^n} = a^{@@}', ans: 'm - n', wrong: ['m + n', 'n - m', '\\dfrac{m}{n}'] }],
  symbols: [],
  apply() { const base = pick([2, 3, 5, 7, 10]), n = randInt(2, 6), m = n + randInt(2, 7);
    return fmValue(this, `$\\dfrac{${base}^{${m}}}{${base}^{${n}}} = ${base}^x$`, 'What is $x$?', m - n, `\\dfrac{${base}^{${m}}}{${base}^{${n}}} = ${base}^{${m} - ${n}} = ${base}^{${m - n}}`); },
};
const FM_POW_POWER = {
  id: 'pow-power', name: 'power of a power', fi: 'potenssin potenssi', latex: '(a^m)^n = a^{m n}',
  note: 'Multiply the exponents (not add): $(a^2)^3 = a^2 \\cdot a^2 \\cdot a^2 = a^6$.', example: '(3^2)^4 = 3^8',
  wrong: ['(a^m)^n = a^{m + n}', '(a^m)^n = a^{m^n}', '(a^m)^n = a^m \\cdot a^n', '(a^m)^n = a^{m - n}'],
  blanks: [{ tpl: '(a^m)^n = a^{@@}', ans: 'm n', wrong: ['m + n', 'm^n', 'm - n'] }],
  symbols: [],
  apply() { const base = pick([2, 3, 5, 7]), m = randInt(2, 6), n = randInt(2, 6);
    return fmValue(this, `$(${base}^{${m}})^{${n}} = ${base}^x$`, 'What is $x$?', m * n, `(${base}^{${m}})^{${n}} = ${base}^{${m} \\cdot ${n}} = ${base}^{${m * n}}`); },
};
const FM_POW_PRODUCT_BASE = {
  id: 'pow-product-base', name: 'power of a product', fi: 'tulon potenssi', latex: '(ab)^n = a^n b^n',
  note: 'The exponent goes to every factor. For a sum it does not work: $(a + b)^n \\neq a^n + b^n$.', example: '(2 \\cdot 3)^2 = 36 = 4 \\cdot 9',
  wrong: ['(ab)^n = a b^n', '(ab)^n = a^n + b^n', '(ab)^n = a^n b', '(ab)^n = n a b'],
  blanks: [{ tpl: '(ab)^n = a^n @@ b^n', ans: '\\cdot', wrong: ['+', '-', '/'] }],
  symbols: [],
};
const FM_POW_QUOTIENT_BASE = {
  id: 'pow-quotient-base', name: 'power of a quotient', fi: 'osamäärän potenssi', latex: '\\left(\\dfrac{a}{b}\\right)^n = \\dfrac{a^n}{b^n}',
  note: 'The exponent goes to both the numerator and the denominator.', example: '\\left(\\dfrac{2}{3}\\right)^2 = \\dfrac{4}{9}',
  wrong: ['\\left(\\dfrac{a}{b}\\right)^n = \\dfrac{a^n}{b}', '\\left(\\dfrac{a}{b}\\right)^n = \\dfrac{a}{b^n}', '\\left(\\dfrac{a}{b}\\right)^n = \\dfrac{a^n}{n b}', '\\left(\\dfrac{a}{b}\\right)^n = \\dfrac{a^n}{b^{-n}}'],
  blanks: [{ tpl: '\\left(\\dfrac{a}{b}\\right)^n = \\dfrac{a^n}{@@}', ans: 'b^n', wrong: ['b', 'n b', 'b^{-n}'] }],
  symbols: [],
};
const FM_POW_ZERO = {
  id: 'pow-zero', name: 'zero exponent', fi: 'nollas potenssi', latex: 'a^0 = 1 \\quad (a \\neq 0)',
  note: 'From $\\frac{a^n}{a^n} = a^{n - n} = a^0$, and anything divided by itself is 1.', example: '7^0 = 1',
  wrong: ['a^0 = 0', 'a^0 = a', 'a^0 = -1', 'a^0 = \\text{undefined}'],
  blanks: [{ tpl: 'a^0 = @@ \\quad (a \\neq 0)', ans: '1', wrong: ['0', 'a', '-1'] }],
  symbols: [],
};
const FM_POW_NEGATIVE = {
  id: 'pow-negative', name: 'negative exponent', fi: 'negatiivinen eksponentti', latex: 'a^{-n} = \\dfrac{1}{a^n}',
  note: 'A negative exponent does not make the number negative: it turns it upside down.', example: '2^{-3} = \\dfrac{1}{2^3} = \\dfrac{1}{8}',
  wrong: ['a^{-n} = -a^n', 'a^{-n} = \\dfrac{n}{a}', 'a^{-n} = \\dfrac{1}{a n}', 'a^{-n} = \\dfrac{a}{n}'],
  blanks: [{ tpl: 'a^{-n} = \\dfrac{1}{@@}', ans: 'a^n', wrong: ['a', 'a n', '-a^n'] }],
  symbols: [],
};
const FM_POW_ROOT = {
  id: 'pow-root', name: 'fractional exponent (root)', fi: 'murtopotenssi (juuri)', latex: 'a^{\\frac{1}{n}} = \\sqrt[n]{a}',
  note: 'The exponent $\\frac{1}{2}$ is the square root: $a^{1/2} = \\sqrt{a}$.', example: '9^{\\frac{1}{2}} = \\sqrt{9} = 3',
  wrong: ['a^{\\frac{1}{n}} = \\dfrac{a}{n}', 'a^{\\frac{1}{n}} = a^n', 'a^{\\frac{1}{n}} = \\dfrac{1}{a^n}', 'a^{\\frac{1}{n}} = n \\sqrt{a}'],
  blanks: [{ tpl: 'a^{\\frac{1}{n}} = \\sqrt[@@]{a}', ans: 'n', wrong: ['2', 'a', '1'] }],
  symbols: [],
};
const FM_SQRT_PRODUCT = {
  id: 'sqrt-product', name: 'root of a product', fi: 'tulon neliöjuuri', latex: '\\sqrt{ab} = \\sqrt{a} \\cdot \\sqrt{b} \\quad (a, b \\geq 0)',
  note: 'This is how $\\sqrt{50} = \\sqrt{25 \\cdot 2} = 5\\sqrt{2}$ works. For a sum it does not: $\\sqrt{a + b} \\neq \\sqrt{a} + \\sqrt{b}$.',
  example: '\\sqrt{4 \\cdot 9} = 6 = 2 \\cdot 3',
  wrong: ['\\sqrt{ab} = \\sqrt{a} + \\sqrt{b}', '\\sqrt{ab} = a \\sqrt{b}', '\\sqrt{ab} = \\dfrac{\\sqrt{a}}{\\sqrt{b}}', '\\sqrt{ab} = (ab)^2'],
  blanks: [{ tpl: '\\sqrt{ab} = \\sqrt{a} @@ \\sqrt{b}', ans: '\\cdot', wrong: ['+', '-', '/'] }],
  symbols: [],
};
const FM_SQRT_QUOTIENT = {
  id: 'sqrt-quotient', name: 'root of a quotient', fi: 'osamäärän neliöjuuri', latex: '\\sqrt{\\dfrac{a}{b}} = \\dfrac{\\sqrt{a}}{\\sqrt{b}} \\quad (a \\geq 0,\\ b > 0)',
  note: 'The root goes to the numerator and the denominator separately.', example: '\\sqrt{\\dfrac{9}{4}} = \\dfrac{3}{2}',
  wrong: ['\\sqrt{\\dfrac{a}{b}} = \\dfrac{\\sqrt{a}}{b}', '\\sqrt{\\dfrac{a}{b}} = \\sqrt{a} - \\sqrt{b}', '\\sqrt{\\dfrac{a}{b}} = \\dfrac{a}{\\sqrt{b}}', '\\sqrt{\\dfrac{a}{b}} = \\sqrt{a} \\cdot \\sqrt{b}'],
  blanks: [{ tpl: '\\sqrt{\\dfrac{a}{b}} = \\dfrac{\\sqrt{a}}{@@}', ans: '\\sqrt{b}', wrong: ['b', '2b', 'b^2'] }],
  symbols: [],
};

const FM_P_PART = 'percentage (prosenttiluku)', FM_P_SHARE = 'the part (osa)', FM_P_WHOLE = 'the whole (kokonaisuus)';
const FM_PERCENT_OF = {
  id: 'percent-of', name: 'a percent of a quantity', fi: 'prosentti jostakin määrästä', latex: 'x = \\dfrac{p}{100} \\cdot W',
  note: 'Divide the percentage by 100 to get the decimal, then multiply the whole.', example: '25\\% \\text{ of } 300: \\quad x = \\dfrac{25}{100} \\cdot 300 = 75',
  wrong: ['x = p \\cdot W', 'x = \\dfrac{100}{p} \\cdot W', 'x = \\dfrac{p + W}{100}', 'x = \\dfrac{W}{100 p}'],
  blanks: [{ tpl: 'x = \\dfrac{p}{@@} \\cdot W', ans: '100', wrong: ['10', '1', 'W'] }],
  symbols: [{ sym: 'p', mean: FM_P_PART }, { sym: 'x', mean: FM_P_SHARE }, { sym: 'W', mean: FM_P_WHOLE }],
  apply() { const p = pick([5, 10, 15, 20, 25, 30, 40, 50, 60, 75]), W = pick([40, 60, 80, 120, 200, 240, 300, 400, 500]);
    return fmValue(this, `${p}% of ${W}.`, 'How much is it?', p * W / 100, `x = \\dfrac{${p}}{100} \\cdot ${W} = ${p * W / 100}`); },
};
const FM_PERCENT_FROM = {
  id: 'percent-from', name: 'percentage from the part and the whole', fi: 'prosenttiluku', latex: 'p = \\dfrac{x}{W} \\cdot 100',
  note: 'The part goes on top, the whole at the bottom (the whole is 100%).', example: '15 \\text{ of } 60: \\quad p = \\dfrac{15}{60} \\cdot 100 = 25\\%',
  wrong: ['p = \\dfrac{W}{x} \\cdot 100', 'p = x \\cdot W \\cdot 100', 'p = \\dfrac{x}{100 W}', 'p = (W - x) \\cdot 100'],
  blanks: [{ tpl: 'p = \\dfrac{x}{@@} \\cdot 100', ans: 'W', wrong: ['100', 'p', 'x'] }],
  symbols: [{ sym: 'p', mean: FM_P_PART }, { sym: 'x', mean: FM_P_SHARE }, { sym: 'W', mean: FM_P_WHOLE }],
  apply() { const p = pick([5, 10, 20, 25, 40, 50, 60, 75]), W = pick([20, 40, 60, 80, 120, 200, 400]);
    return fmValue(this, `${p * W / 100} of ${W}.`, 'How many percent is it? (in percent)', p, `p = \\dfrac{${p * W / 100}}{${W}} \\cdot 100 = ${p}`); },
};
const FM_PERCENT_CHANGE = {
  id: 'percent-change', name: 'percent change', fi: 'prosentuaalinen muutos', latex: 'p = \\dfrac{x_{new} - x_{old}}{x_{old}} \\cdot 100',
  note: 'Always divide by the OLD value. A negative result is a decrease.', example: '4 \\to 5: \\quad p = \\dfrac{5 - 4}{4} \\cdot 100 = 25\\%',
  wrong: ['p = \\dfrac{x_{new} - x_{old}}{x_{new}} \\cdot 100', 'p = \\dfrac{x_{new}}{x_{old}} \\cdot 100', 'p = (x_{new} - x_{old}) \\cdot 100', 'p = \\dfrac{x_{old}}{x_{new} - x_{old}} \\cdot 100'],
  blanks: [{ tpl: 'p = \\dfrac{x_{new} - x_{old}}{@@} \\cdot 100', ans: 'x_{old}', wrong: ['x_{new}', '100', '2'] }],
  symbols: [],
  apply() { const o = pick([4, 8, 20, 25, 40, 50, 80, 200]), p = pick([10, 25, 50, 100, -10, -20, -25, -50]), n = o * (100 + p) / 100;
    if (!Number.isInteger(n)) return this.apply();
    return fmValue(this, `A value changed from ${o} to ${n}.`, 'What is the percent change? (a decrease is negative)', p, `p = \\dfrac{${n} - ${o}}{${o}} \\cdot 100 = \\dfrac{${n - o}}{${o}} \\cdot 100 = ${p}`); },
};
const FM_PERCENT_UP = {
  id: 'percent-up', name: 'value after an increase of p percent', fi: 'arvo korotuksen jälkeen', latex: 'x_{new} = x_{old}\\left(1 + \\dfrac{p}{100}\\right)',
  note: 'Increase by 20% means multiply by $1.20$.', example: '80 \\text{ increased by } 25\\%: \\quad 80 \\cdot 1.25 = 100',
  wrong: ['x_{new} = x_{old} + p', 'x_{new} = x_{old} \\cdot \\dfrac{p}{100}', 'x_{new} = x_{old}\\left(1 - \\dfrac{p}{100}\\right)', 'x_{new} = x_{old}(1 + p)'],
  blanks: [{ tpl: 'x_{new} = x_{old}\\left(1 @@ \\dfrac{p}{100}\\right)', ans: '+', wrong: ['-', '\\cdot', '/'] }],
  symbols: [],
  apply() { const o = pick([40, 60, 80, 120, 200, 250, 400]), p = pick([5, 10, 20, 25, 50]);
    return fmValue(this, `${o} is increased by ${p}%.`, 'What is the new value?', o * (100 + p) / 100, `x_{new} = ${o}\\left(1 + \\dfrac{${p}}{100}\\right) = ${o} \\cdot ${(100 + p) / 100} = ${o * (100 + p) / 100}`); },
};
const FM_PERCENT_DOWN = {
  id: 'percent-down', name: 'value after a decrease of p percent', fi: 'arvo alennuksen jälkeen', latex: 'x_{new} = x_{old}\\left(1 - \\dfrac{p}{100}\\right)',
  note: 'A discount of 20% means multiply by $0.80$.', example: '80 \\text{ lowered by } 25\\%: \\quad 80 \\cdot 0.75 = 60',
  wrong: ['x_{new} = x_{old} - p', 'x_{new} = x_{old} \\cdot \\dfrac{p}{100}', 'x_{new} = x_{old}\\left(1 + \\dfrac{p}{100}\\right)', 'x_{new} = x_{old}(1 - p)'],
  blanks: [{ tpl: 'x_{new} = x_{old}\\left(1 @@ \\dfrac{p}{100}\\right)', ans: '-', wrong: ['+', '\\cdot', '/'] }],
  symbols: [],
  apply() { const o = pick([40, 60, 80, 120, 200, 250, 400]), p = pick([5, 10, 20, 25, 50]);
    return fmValue(this, `${o} is lowered by ${p}%.`, 'What is the new value?', o * (100 - p) / 100, `x_{new} = ${o}\\left(1 - \\dfrac{${p}}{100}\\right) = ${o} \\cdot ${(100 - p) / 100} = ${o * (100 - p) / 100}`); },
};
const FM_PERCENT_ORIGINAL = {
  id: 'percent-original', name: 'original value after an increase of p percent', fi: 'alkuperäinen arvo', latex: 'x_{old} = \\dfrac{x_{new}}{1 + \\frac{p}{100}}',
  note: 'The classic trap: do not take $p$ percent off the new value. Divide by the factor instead.', example: '\\text{after } +20\\%: 60: \\quad x_{old} = \\dfrac{60}{1.2} = 50',
  wrong: ['x_{old} = x_{new}\\left(1 - \\dfrac{p}{100}\\right)', 'x_{old} = x_{new} - p', 'x_{old} = x_{new}\\left(1 + \\dfrac{p}{100}\\right)', 'x_{old} = \\dfrac{x_{new}}{p}'],
  blanks: [{ tpl: 'x_{old} = \\dfrac{x_{new}}{@@}', ans: '1 + \\frac{p}{100}', wrong: ['1 - \\frac{p}{100}', 'p', '100'] }],
  symbols: [],
  apply() { const o = pick([40, 50, 80, 100, 150, 200, 250, 400]), p = pick([10, 20, 25, 50]);
    const n = o * (100 + p) / 100;
    return fmValue(this, `After an increase of ${p}% the value is ${n}.`, 'What was the value before?', o, `x_{old} = \\dfrac{${n}}{${(100 + p) / 100}} = ${o}`); },
};

const FM_LINE = {
  id: 'line', name: 'equation of a line (slope–intercept form)', fi: 'suoran yhtälö', latex: 'y = kx + b',
  note: '$k$ tells how much $y$ changes when $x$ grows by 1; $b$ is the value of $y$ at $x = 0$.', example: 'y = 2x + 3: \\quad x = 4 \\Rightarrow y = 11',
  wrong: ['y = bx + k', 'y = k(x + b)', 'y = kxb', 'y = \\dfrac{x}{k} + b'],
  blanks: [{ tpl: 'y = @@ x + b', ans: 'k', wrong: ['b', '2', 'y'] }],
  symbols: [{ sym: 'k', mean: 'slope (kulmakerroin)' }, { sym: 'b', mean: 'y-intercept (vakiotermi)' }],
};
const FM_SLOPE = {
  id: 'slope', name: 'slope from two points', fi: 'kulmakerroin kahdesta pisteestä', latex: 'k = \\dfrac{y_2 - y_1}{x_2 - x_1}',
  note: 'The change in $y$ over the change in $x$; keep the order the same in the top and the bottom.', example: '(1, 2) \\text{ and } (3, 8): \\quad k = \\dfrac{8 - 2}{3 - 1} = 3',
  wrong: ['k = \\dfrac{x_2 - x_1}{y_2 - y_1}', 'k = \\dfrac{y_2 + y_1}{x_2 + x_1}', 'k = \\dfrac{y_2 - y_1}{x_1 - x_2}', 'k = (y_2 - y_1)(x_2 - x_1)'],
  blanks: [{ tpl: 'k = \\dfrac{@@}{x_2 - x_1}', ans: 'y_2 - y_1', wrong: ['x_2 - x_1', 'y_2 + y_1', 'y_1 - y_2'] }],
  symbols: [{ sym: 'k', mean: 'slope (kulmakerroin)' }],
  apply() { const k = randNZ(5), x1 = randInt(-4, 3), dx = randInt(1, 5), y1 = randInt(-6, 6), x2 = x1 + dx, y2 = y1 + k * dx;
    return fmValue(this, `A line goes through the points $(${x1}, ${y1})$ and $(${x2}, ${y2})$.`, 'What is its slope?', k, `k = \\dfrac{${y2} - ${y1 < 0 ? `(${y1})` : y1}}{${x2} - ${x1 < 0 ? `(${x1})` : x1}} = \\dfrac{${y2 - y1}}{${dx}} = ${k}`); },
};
const FM_POINT_SLOPE = {
  id: 'point-slope', name: 'equation of a line through a point', fi: 'pisteen kautta kulkevan suoran yhtälö', latex: 'y - y_1 = k(x - x_1)',
  note: 'The point $(x_1, y_1)$ is on the line. The signs in the brackets are minus.', example: 'k = 2,\\ (1, 3): \\quad y - 3 = 2(x - 1)',
  wrong: ['y + y_1 = k(x + x_1)', 'y - y_1 = k(x + x_1)', 'y - x_1 = k(x - y_1)', 'y = k(x - x_1)'],
  blanks: [{ tpl: 'y - y_1 = k(x @@ x_1)', ans: '-', wrong: ['+', '\\cdot', '/'] }],
  symbols: [],
};
const FM_ZERO = {
  id: 'zero', name: 'zero of a line (x-intercept)', fi: 'nollakohta', latex: 'x = -\\dfrac{b}{k}',
  note: 'Solve $kx + b = 0$: the line crosses the $x$-axis there.', example: 'y = 2x - 6: \\quad x = -\\dfrac{-6}{2} = 3',
  wrong: ['x = \\dfrac{b}{k}', 'x = -\\dfrac{k}{b}', 'x = -bk', 'x = b - k'],
  blanks: [{ tpl: 'x = -\\dfrac{b}{@@}', ans: 'k', wrong: ['b', '2', 'x'] }],
  symbols: [],
  apply() { const k = randNZ(5), x0 = randNZ(8), b = -k * x0;
    return fmValue(this, `A line has the equation $y = ${k === 1 ? '' : k === -1 ? '-' : k}x ${b < 0 ? '-' : '+'} ${Math.abs(b)}$.`, 'Where does it cross the $x$-axis? (the value of $x$)', x0,
      `x = -\\dfrac{${b < 0 ? `(${b})` : b}}{${k < 0 ? `(${k})` : k}} = ${x0}`); },
};
const FM_SPEED = {
  id: 'speed', name: 'speed', fi: 'nopeus', latex: 'v = \\dfrac{s}{t}',
  note: 'Distance per time. Also $s = vt$ and $t = \\dfrac{s}{v}$.', example: '120 \\text{ km in } 2 \\text{ h}: \\quad v = \\dfrac{120}{2} = 60 \\text{ km/h}',
  wrong: ['v = s \\cdot t', 'v = \\dfrac{t}{s}', 'v = s + t', 'v = \\dfrac{s}{t^2}'],
  blanks: [{ tpl: 'v = \\dfrac{s}{@@}', ans: 't', wrong: ['v', 's', '2'] }],
  symbols: [{ sym: 'v', mean: 'speed (nopeus)' }, { sym: 's', mean: 'distance (matka)' }, { sym: 't', mean: 'time (aika)' }],
  apply() { const v = pick([4, 5, 8, 12, 30, 40, 50, 60, 80, 90]), t = pick([2, 3, 4, 5]);
    return fmValue(this, `A car drives ${v * t} km in ${t} hours at a constant speed.`, 'What is its speed? (in km/h)', v, `v = \\dfrac{${v * t}}{${t}} = ${v}`); },
};
const FM_DISTANCE = {
  id: 'distance', name: 'distance from speed and time', fi: 'matka', latex: 's = v \\cdot t',
  note: 'Distance = speed times time.', example: '60 \\text{ km/h for } 3 \\text{ h}: \\quad s = 60 \\cdot 3 = 180 \\text{ km}',
  wrong: ['s = \\dfrac{v}{t}', 's = \\dfrac{t}{v}', 's = v + t', 's = v \\cdot t^2'],
  blanks: [{ tpl: 's = v @@ t', ans: '\\cdot', wrong: ['+', '-', '/'] }],
  symbols: [{ sym: 'v', mean: 'speed (nopeus)' }, { sym: 's', mean: 'distance (matka)' }, { sym: 't', mean: 'time (aika)' }],
  apply() { const v = pick([5, 8, 12, 30, 40, 50, 60, 80]), t = pick([2, 3, 4, 5]);
    return fmValue(this, `A cyclist rides at ${v} km/h for ${t} hours.`, 'How far does the cyclist ride? (in km)', v * t, `s = ${v} \\cdot ${t} = ${v * t}`); },
};
const FM_TIME = {
  id: 'time', name: 'time from distance and speed', fi: 'aika', latex: 't = \\dfrac{s}{v}',
  note: 'Time = distance divided by speed. Check the units: km divided by km/h gives hours.', example: '150 \\text{ km at } 50 \\text{ km/h}: \\quad t = \\dfrac{150}{50} = 3 \\text{ h}',
  wrong: ['t = s \\cdot v', 't = \\dfrac{v}{s}', 't = s - v', 't = \\dfrac{s}{v^2}'],
  blanks: [{ tpl: 't = \\dfrac{s}{@@}', ans: 'v', wrong: ['t', 's', '2'] }],
  symbols: [{ sym: 'v', mean: 'speed (nopeus)' }, { sym: 's', mean: 'distance (matka)' }, { sym: 't', mean: 'time (aika)' }],
  apply() { const v = pick([4, 5, 8, 12, 30, 40, 50, 60, 80]), t = pick([2, 3, 4, 5, 6]);
    return fmValue(this, `A train travels ${v * t} km at a speed of ${v} km/h.`, 'How long does it take? (in hours)', t, `t = \\dfrac{${v * t}}{${v}} = ${t}`); },
};

// ─── short facts ──────────────────────────────────────────────────────────────

const fmConcept = (q, correct, wrong, note) => ({ concept: true, q, correct, wrong, note });
const FM_GEO_CONCEPTS = [
  fmConcept('What does the perimeter (piiri) of a shape tell?', 'The length of the line around the shape', ['How much surface is inside the shape', 'How much space is inside a solid', 'The longest line inside the shape'], 'Perimeter = the distance around. It is a length, so it is measured in m, cm.'),
  fmConcept('What does the area (pinta-ala) of a shape tell?', 'How much surface is inside the shape', ['The length of the line around the shape', 'How much space is inside a solid', 'The longest line inside the shape'], 'Area = the surface inside, measured in square units: m², cm².'),
  fmConcept('In which unit is the area measured?', 'm² (square metres)', ['m (metres)', 'm³ (cubic metres)', 'm/s (metres per second)'], 'Area is length times length, so the unit is squared.'),
  fmConcept('In which unit is the perimeter measured?', 'm (metres)', ['m² (square metres)', 'm³ (cubic metres)', 'kg (kilograms)'], 'Perimeter is a length.'),
  fmConcept('In which unit is the volume (tilavuus) measured?', 'm³ (cubic metres)', ['m (metres)', 'm² (square metres)', 'kg (kilograms)'], 'Volume is length times length times length. 1 litre = 1 dm³.'),
  fmConcept('What is the diameter (halkaisija) of a circle?', 'A line through the centre from one side of the circle to the other', ['A line from the centre to the circle', 'The line around the circle', 'The area inside the circle'], 'The diameter is two radii: $d = 2r$.'),
  fmConcept('What is the radius (säde) of a circle?', 'The distance from the centre to the circle', ['The distance across the circle through the centre', 'The length of the line around the circle', 'The area of the circle'], 'The radius is half of the diameter: $r = \\dfrac{d}{2}$.'),
  fmConcept('How are the radius $r$ and the diameter $d$ related?', '$d = 2r$', ['$d = \\dfrac{r}{2}$', '$r = 2d$', '$d = r + 2$'], 'The diameter goes through the centre, so it is two radii long.'),
];
const FM_QUAD_CONCEPTS = [
  fmConcept('How many real solutions does a quadratic equation have when $D > 0$?', 'Two', ['None', 'One', 'Infinitely many'], 'The square root of $D$ is a real number, and $\\pm$ gives two different values.'),
  fmConcept('How many real solutions does a quadratic equation have when $D = 0$?', 'One (a double root)', ['None', 'Two different solutions', 'Infinitely many'], '$\\sqrt{0} = 0$, so $\\pm$ gives the same value twice.'),
  fmConcept('How many real solutions does a quadratic equation have when $D < 0$?', 'None', ['One', 'Two', 'Infinitely many'], 'The square root of a negative number is not a real number.'),
];
const FM_PRODUCTS_CONCEPTS = [
  fmConcept('Is $(a + b)^2 = a^2 + b^2$ true?', 'No: the middle term $2ab$ is missing', ['Yes, always', 'Yes, if $a$ and $b$ are positive', 'Only if $a = b$'], 'Check with numbers: $(1 + 2)^2 = 9$, but $1^2 + 2^2 = 5$.'),
  fmConcept('Is $(a - b)^2 = a^2 - b^2$ true?', 'No: $(a - b)^2 = a^2 - 2ab + b^2$', ['Yes, always', 'Yes, if $a > b$', 'Only if $a = 1$'], 'Check: $(3 - 1)^2 = 4$, but $3^2 - 1^2 = 8$.'),
];
const FM_POWER_CONCEPTS = [
  fmConcept('Is $\\sqrt{a + b} = \\sqrt{a} + \\sqrt{b}$ true?', 'No: for example $\\sqrt{9 + 16} = 5$, but $\\sqrt{9} + \\sqrt{16} = 7$', ['Yes, always', 'Yes, if $a$ and $b$ are positive', 'Only if $a = b$'], 'A root does not go through a sum, only through a product or a quotient.'),
  fmConcept('Is $(a + b)^n = a^n + b^n$ true for $n = 2$?', 'No: $(a + b)^2 = a^2 + 2ab + b^2$', ['Yes, always', 'Yes, if $a$ and $b$ are positive', 'Only if $a = b$'], 'The exponent goes through a product, not through a sum.'),
];

// ─── the levels ───────────────────────────────────────────────────────────────

const FM_GEO_POOL = [FM_PERIM, FM_AREA, FM_VOL, FM_RADIUS, 'diameter (halkaisija)', FM_HEIGHT, FM_BASE, FM_SIDE, 'hypotenuse (hypotenuusa)', 'leg (kateetti)', 'circumference (ympärysmitta)', FM_BASEAREA];
const FM_QUAD_POOL = [FM_Q_DISC, FM_Q_COEFF2, FM_Q_COEFF1, FM_Q_CONST, FM_Q_ROOT, 'vertex (huippu)'];
const FM_LINE_POOL = ['slope (kulmakerroin)', 'y-intercept (vakiotermi)', 'speed (nopeus)', 'distance (matka)', 'time (aika)', 'zero (nollakohta)'];
const FM_PERCENT_POOL = [FM_P_PART, FM_P_SHARE, FM_P_WHOLE, 'new value (uusi arvo)', 'old value (vanha arvo)'];

/** weight: how many times the item is in the deck (the formulas are asked more often than the short facts) */
const FM_LEVELS = {
  'fm-geo-basic':  { items: [FM_RECT_PERIMETER, FM_RECT_AREA, FM_SQUARE_PERIMETER, FM_SQUARE_AREA, ...FM_GEO_CONCEPTS], weight: 2, pool: FM_GEO_POOL,
                     nameQ: 'What does this formula give?', whichQ: n => `Which formula gives the ${n}?` },
  'fm-geo-shapes': { items: [FM_TRIANGLE_AREA, FM_TRIANGLE_PERIMETER, FM_PARALLELOGRAM_AREA, FM_TRAPEZOID_AREA, FM_CIRCLE_CIRCUMFERENCE, FM_CIRCLE_AREA, FM_PYTHAGORAS], weight: 1, pool: FM_GEO_POOL,
                     nameQ: 'What does this formula give?', whichQ: n => `Which formula gives the ${n}?` },
  'fm-geo-solids': { items: [FM_CUBOID_VOLUME, FM_CUBOID_SURFACE, FM_CUBE_VOLUME, FM_CUBE_SURFACE, FM_PRISM_VOLUME, FM_PYRAMID_VOLUME, FM_CYLINDER_VOLUME, FM_CYLINDER_SIDE, FM_CONE_VOLUME, FM_SPHERE_VOLUME, FM_SPHERE_SURFACE], weight: 1, pool: FM_GEO_POOL,
                     nameQ: 'What does this formula give?', whichQ: n => `Which formula gives the ${n}?` },
  'fm-products':   { items: [FM_SQ_SUM, FM_SQ_DIFF, FM_DIFF_SQUARES, FM_FACTOR_SQUARES, FM_COMMON_FACTOR, FM_FACTOR_QUADRATIC, ...FM_PRODUCTS_CONCEPTS], weight: 2, pool: [],
                     nameQ: 'Which rule is this?', whichQ: n => `Which formula is correct for the ${n}?` },
  'fm-quadratic':  { items: [FM_DISCRIMINANT, FM_QUAD_FORMULA, FM_VIETA_SUM, FM_VIETA_PRODUCT, FM_QUAD_FACTORED, FM_VERTEX, ...FM_QUAD_CONCEPTS], weight: 2, pool: FM_QUAD_POOL,
                     nameQ: 'What does this formula give?', whichQ: n => `Which formula is correct for the ${n}?` },
  'fm-powers':     { items: [FM_POW_PRODUCT, FM_POW_QUOTIENT, FM_POW_POWER, FM_POW_PRODUCT_BASE, FM_POW_QUOTIENT_BASE, FM_POW_ZERO, FM_POW_NEGATIVE, FM_POW_ROOT, FM_SQRT_PRODUCT, FM_SQRT_QUOTIENT, ...FM_POWER_CONCEPTS], weight: 1, pool: [],
                     nameQ: 'Which rule is this?', whichQ: n => `Which formula is correct for the ${n}?` },
  'fm-percent':    { items: [FM_PERCENT_OF, FM_PERCENT_FROM, FM_PERCENT_CHANGE, FM_PERCENT_UP, FM_PERCENT_DOWN, FM_PERCENT_ORIGINAL], weight: 2, pool: FM_PERCENT_POOL,
                     nameQ: 'What does this formula give?', whichQ: n => `Which formula gives the ${n}?` },
  'fm-linear':     { items: [FM_LINE, FM_SLOPE, FM_POINT_SLOPE, FM_ZERO, FM_SPEED, FM_DISTANCE, FM_TIME], weight: 2, pool: FM_LINE_POOL,
                     nameQ: 'What does this formula give?', whichQ: n => `Which formula gives the ${n}?` },
};

/** Why the right answer is right: the formula, what the symbols mean, a hint, a check with numbers */
function fmFormulaSteps(f) {
  const steps = [{ explanation: TEXTS.formulas.theFormula(f.name, f.fi), math: f.latex }];
  if (f.symbols && f.symbols.length) {
    steps.push({ explanation: TEXTS.formulas.where(f.symbols.map(s => `$${s.sym}$ is the ${s.mean}`).join(', ')) });
  }
  if (f.note) steps.push({ explanation: f.note });
  if (f.example) steps.push({ explanation: TEXTS.formulas.checkNumbers, math: f.example });
  return steps;
}

function fmChoiceProblem(question, latex, options, correct, steps, meta) {
  const shuffled = fmShuffle(options);
  return { kind: 'choice', text: '', latex, question, options: shuffled, answer: shuffled.indexOf(correct), steps, meta };
}

const FM_TYPES = ['apply', 'apply', 'apply', 'blank', 'blank', 'which', 'which', 'name', 'symbol'];

/** One question about the formula f in the level def */
function fmFormulaProblem(f, def) {
  const available = FM_TYPES.filter(t => (
    (t === 'apply' && f.apply) || (t === 'blank' && f.blanks && f.blanks.length) || t === 'which' ||
    (t === 'name' && def.items.filter(i => !i.concept).length >= 4) || (t === 'symbol' && f.symbols && f.symbols.length)));
  const type = pick(available);
  const meta = { formula: f.id, type };

  if (type === 'apply') return f.apply();

  if (type === 'which') {
    const options = [f.latex, ...fmShuffle(f.wrong).slice(0, 3)].map(fmMath);
    return fmChoiceProblem(def.whichQ(f.name), undefined, options, fmMath(f.latex), fmFormulaSteps(f), meta);
  }
  if (type === 'blank') {
    const b = pick(f.blanks);
    const options = [b.ans, ...b.wrong].map(fmFragment);
    const shown = b.tpl.replace('@@', '\\boxed{\\ ?\\ }');
    return fmChoiceProblem(`Complete the formula for the ${f.name}:`, shown, options, fmFragment(b.ans), fmFormulaSteps(f), { ...meta, blank: b.tpl });
  }
  if (type === 'name') {
    const names = def.items.filter(i => !i.concept && i.id !== f.id).map(i => i.name);
    const options = [f.name, ...fmShuffle(names).slice(0, 3)].map(fmCap);
    return fmChoiceProblem(def.nameQ, f.latex, options, fmCap(f.name), fmFormulaSteps(f), meta);
  }
  // symbol
  const s = pick(f.symbols);
  const pool = def.pool.filter(m => m !== s.mean);
  const options = [s.mean, ...fmShuffle(pool).slice(0, 3)].map(fmCap);
  return fmChoiceProblem(`In the formula $${f.latex}$, what does $${s.sym}$ stand for?`, undefined, options, fmCap(s.mean), fmFormulaSteps(f), { ...meta, symbol: s.sym });
}

function fmConceptProblem(c) {
  const options = [c.correct, ...c.wrong];
  return fmChoiceProblem(c.q, undefined, options, c.correct, [{ explanation: c.note }], { concept: true });
}

/** A level: its items are dealt in a shuffled order, again and again (reset at the start of each set) */
function fmLevelGenerator(def) {
  let deck = [], last = null;
  const generate = () => {
    if (deck.length === 0) {
      deck = fmShuffle(def.items.flatMap(i => Array(i.concept ? 1 : def.weight).fill(i)));
      if (deck.length > 1 && deck[0] === last) deck.push(deck.shift());
    }
    last = deck.shift();
    return last.concept ? fmConceptProblem(last) : fmFormulaProblem(last, def);
  };
  generate.reset = () => { deck = []; };
  return generate;
}

for (const [key, def] of Object.entries(FM_LEVELS)) GENERATORS[key] = fmLevelGenerator(def);
