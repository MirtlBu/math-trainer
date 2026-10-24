/**
 * word-problems.js
 * Word problems (sanalliset tehtävät): from the story to an equation to the answer.
 *
 *   word-parts        a whole is split into parts that change by a constant step
 *                     (a 300 cm rope cut into 5 parts, each 10 cm shorter than the one before)
 *   word-consecutive  consecutive integers / even / odd numbers with a given sum, two related numbers
 *   word-geometry     perimeter of a rectangle or a triangle with related sides
 *   word-quadratic    area of a rectangle, product of consecutive integers (a quadratic, one root rejected)
 *
 * Problem: { kind: 'numbers', ordered: true, labels, hint, text, question, answer, equation, steps }
 * The answers are listed in the order of the named fields, and the unknown x is always the first
 * answer. `equation` (LaTeX) and `meta` are there for checking.
 *
 * Load after equations.js (random helpers), polynomial-equations.js (pick, quadraticSolveSteps, …)
 * and texts.js.
 */

const ORD = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th'];
const COUNT_WORD = { 2: 'two', 3: 'three', 4: 'four', 5: 'five', 6: 'six' };
const NAMES = ['Pekka', 'Aino', 'Matti', 'Liisa', 'Onni', 'Helmi', 'Eero', 'Venla', 'Mikko', 'Siiri'];

// stories do not repeat within the last few problems of a level
const recentWordThemes = {};
function pickFresh(level, list) {
  const recent  = recentWordThemes[level] = recentWordThemes[level] || [];
  const memory  = Math.min(4, list.length - 1);
  const choices = list.filter(t => !recent.includes(t));
  const chosen  = choices[randInt(0, choices.length - 1)];
  recent.push(chosen);
  if (recent.length > memory) recent.shift();
  return chosen;
}

/** The fields' answers as "80,\; 70,\; 60" */
const listLatex = values => values.join(',\\; ');

/** x + (x - 10) + (x - 20) written out (offset 0 is plain x) */
function termLatex(offset) {
  if (offset === 0) return 'x';
  return offset > 0 ? `(x + ${offset})` : `(x - ${-offset})`;
}

/**
 * The common solving steps of "n·x + constant = total":
 * combine like terms, undo the constant, divide by n.
 */
function sumSteps(n, constant, total, xValue) {
  const combined = constant === 0
    ? `${n}x = ${total}`
    : `${n}x ${constant > 0 ? '+' : '-'} ${Math.abs(constant)} = ${total}`;
  const steps = [{ explanation: TEXTS.solution.combineLike, math: combined }];
  if (constant !== 0) {
    steps.push({
      explanation: constant > 0 ? TEXTS.solution.subtract(constant) : TEXTS.solution.add(-constant),
      math: `${n}x = ${total - constant}`
    });
  }
  steps.push({ explanation: TEXTS.solution.divide(n), math: `x = ${xValue}` });
  return steps;
}

// ─── level 1: parts of a whole ────────────────────────────────────────────────

/**
 * dir: 'down' (each next part is smaller; x is the largest) or 'up' (each next is larger; x is the smallest)
 * unit: shown in the field labels; step: the smallest part is a multiple of it; diffs: possible steps
 */
const PART_THEMES = [
  { dir: 'down', unit: 'cm', step: 5, diffs: [5, 10, 15, 20], part: 'part',
    text: (L, n, d, who) => `${who} cuts a rope that is ${L} cm long into ${n} parts so that each next part is ${d} cm shorter than the previous one.`,
    ask: 'Find the lengths of the parts, from the longest to the shortest.' },
  { dir: 'down', unit: 'cm', step: 2, diffs: [2, 3, 4, 5], part: 'piece',
    text: (L, n, d, who) => `${who} cuts a ${L} cm ribbon into ${n} pieces so that each next piece is ${d} cm shorter than the one before.`,
    ask: 'Find the lengths of the pieces, from the longest to the shortest.' },
  { dir: 'down', unit: 'cm', step: 10, diffs: [10, 20, 25, 30], part: 'plank',
    text: (L, n, d, who) => `${who} saws a ${L} cm plank into ${n} pieces so that every piece is ${d} cm shorter than the previous piece.`,
    ask: 'Find the lengths of the pieces, from the longest to the shortest.' },
  { dir: 'up', unit: 'km', step: 1, diffs: [1, 2, 3, 5], part: 'stage',
    text: (L, n, d) => `A ski race of ${L} km is divided into ${n} stages so that each next stage is ${d} km longer than the previous one.`,
    ask: 'Find the lengths of the stages, from the shortest to the longest.' },
  { dir: 'down', unit: '€', step: 10, diffs: [10, 20, 25, 50], part: 'place',
    text: (L, n, d) => `A prize of €${L} is shared among ${n} winners so that each next place gets €${d} less than the place before.`,
    ask: 'How much does each winner get, from the first place to the last?' },
  { dir: 'up', unit: '€', step: 5, diffs: [5, 10, 20], part: 'month',
    text: (L, n, d, who) => `${who} saves €${L} in ${n} months. Every month ${who} saves €${d} more than in the month before.`,
    ask: 'How much is saved each month, from the first month to the last?' },
  { dir: 'up', unit: 'pages', step: 1, diffs: [2, 3, 5, 10], part: 'day',
    text: (L, n, d, who) => `${who} reads a ${L}-page book in ${n} days. Every day ${who} reads ${d} pages more than on the day before.`,
    ask: 'How many pages are read each day, from the first day to the last?' },
];

function partLabel(theme, i) {
  if (theme.part === 'month') return `Month ${i + 1} (${theme.unit})`;
  if (theme.part === 'day')   return `Day ${i + 1} (${theme.unit})`;
  return `${ORD[i]} ${theme.part} (${theme.unit})`;
}

/** A rope cut into parts that differ by a constant step */
function generateWordParts() {
  const theme = pickFresh('parts', PART_THEMES);
  const n = randInt(3, 6);
  const d = pick(theme.diffs);
  const who = pick(NAMES);
  const smallest = randInt(1, 6) * theme.step;

  const down = theme.dir === 'down';
  const x = down ? smallest + (n - 1) * d : smallest;           // the first part
  const parts = Array.from({ length: n }, (_, i) => x + (down ? -i : i) * d);
  const total = parts.reduce((a, b) => a + b, 0);
  const offsets = parts.map((_, i) => (down ? -i : i) * d);
  const constant = offsets.reduce((a, b) => a + b, 0);

  const equation = `${offsets.map(termLatex).join(' + ')} = ${total}`;
  const steps = [
    { explanation: TEXTS.words.letFirst(down ? 'largest' : 'smallest', d, !down),
      math: listLatex(offsets.map(o => (o === 0 ? 'x' : o > 0 ? `x + ${o}` : `x - ${-o}`))) },
    { explanation: TEXTS.words.total, math: equation },
    ...sumSteps(n, constant, total, x),
    { explanation: TEXTS.words.answerIs, math: listLatex(parts) },
  ];

  return {
    kind: 'numbers', ordered: true,
    text: theme.text(total, n, d, who),
    question: theme.ask,
    labels: parts.map((_, i) => partLabel(theme, i)),
    hint: TEXTS.words.orderHint,
    answer: parts, equation, steps,
    meta: { total, n, d, down },
  };
}

// ─── level 2: consecutive and related numbers ─────────────────────────────────

const NUMBER_KINDS = [
  { name: 'integers',     step: 1, first: () => (randInt(1, 6) === 1 ? randInt(-20, -3) : randInt(3, 60)) },
  { name: 'even numbers', step: 2, first: () => 2 * (randInt(1, 6) === 1 ? randInt(-10, -2) : randInt(1, 30)) },
  { name: 'odd numbers',  step: 2, first: () => 2 * randInt(0, 30) + 1 },
];

/** Consecutive integers / even / odd numbers with a given sum, or two related numbers */
function generateWordNumbers() {
  const type = pick(['consecutive', 'consecutive', 'consecutive', 'difference', 'ratio']);

  if (type === 'consecutive') {
    const kind = pick(NUMBER_KINDS);
    const n = randInt(3, 5);
    const x = kind.first();
    const offsets = Array.from({ length: n }, (_, i) => i * kind.step);
    const numbers = offsets.map(o => x + o);
    const total = numbers.reduce((a, b) => a + b, 0);
    const constant = offsets.reduce((a, b) => a + b, 0);
    const equation = `${offsets.map(termLatex).join(' + ')} = ${total}`;

    return {
      kind: 'numbers', ordered: true,
      text: `The sum of ${COUNT_WORD[n]} consecutive ${kind.name} is ${total}.`,
      question: 'Find the numbers, from the smallest to the largest.',
      labels: numbers.map((_, i) => `${ORD[i]} number`),
      hint: TEXTS.words.orderHint,
      answer: numbers, equation,
      steps: [
        { explanation: TEXTS.words.letSmallest(kind.name, kind.step),
          math: listLatex(offsets.map(o => (o === 0 ? 'x' : `x + ${o}`))) },
        { explanation: TEXTS.words.total, math: equation },
        ...sumSteps(n, constant, total, x),
        { explanation: TEXTS.words.answerIs, math: listLatex(numbers) },
      ],
      meta: { total, n, step: kind.step },
    };
  }

  if (type === 'difference') {
    // the sum of two numbers and how much larger one is
    const x = randInt(3, 60);
    const diff = randInt(2, 30);
    const numbers = [x, x + diff];
    const total = 2 * x + diff;
    const equation = `x + (x + ${diff}) = ${total}`;
    return {
      kind: 'numbers', ordered: true,
      text: `The sum of two numbers is ${total}. The larger number is ${diff} more than the smaller one.`,
      question: 'Find the numbers, the smaller one first.',
      labels: ['Smaller number', 'Larger number'],
      hint: TEXTS.words.orderHint,
      answer: numbers, equation,
      steps: [
        { explanation: TEXTS.words.letSmaller(diff), math: `x, \\quad x + ${diff}` },
        { explanation: TEXTS.words.total, math: equation },
        ...sumSteps(2, diff, total, x),
        { explanation: TEXTS.words.answerIs, math: listLatex(numbers) },
      ],
      meta: { total, n: 2, diff },
    };
  }

  // one number is k times the other
  const k = randInt(2, 6);
  const x = randInt(2, 25);
  const numbers = [x, k * x];
  const total = (k + 1) * x;
  const equation = `x + ${k}x = ${total}`;
  return {
    kind: 'numbers', ordered: true,
    text: `The sum of two numbers is ${total}. One of the numbers is ${k} times the other.`,
    question: 'Find the numbers, the smaller one first.',
    labels: ['Smaller number', 'Larger number'],
    hint: TEXTS.words.orderHint,
    answer: numbers, equation,
    steps: [
      { explanation: TEXTS.words.letSmallerTimes(k), math: `x, \\quad ${k}x` },
      { explanation: TEXTS.words.total, math: equation },
      ...sumSteps(k + 1, 0, total, x),
      { explanation: TEXTS.words.answerIs, math: listLatex(numbers) },
    ],
    meta: { total, n: 2, k },
  };
}

// ─── level 3: perimeter ───────────────────────────────────────────────────────

/** Rectangles and triangles whose sides are related; the perimeter is given */
function generateWordPerimeter() {
  const type = pick(['rectMore', 'rectMore', 'rectTimes', 'triangle', 'isosceles']);

  if (type === 'rectMore') {
    const x = randInt(3, 30), k = randInt(1, 15);
    const P = 2 * (2 * x + k);
    const equation = `2(x + (x + ${k})) = ${P}`;
    return {
      kind: 'numbers', ordered: true,
      text: `The length of a rectangle is ${k} cm more than its width. The perimeter of the rectangle is ${P} cm.`,
      question: 'Find the width and the length of the rectangle.',
      labels: ['Width (cm)', 'Length (cm)'],
      hint: TEXTS.words.orderHint,
      answer: [x, x + k], equation,
      steps: [
        { explanation: TEXTS.words.letWidth(k), math: `x, \\quad x + ${k}` },
        { explanation: TEXTS.words.perimeterRectangle, math: equation },
        { explanation: TEXTS.words.simplifyBrackets, math: `2(2x + ${k}) = ${P}` },
        { explanation: TEXTS.words.expandBrackets, math: `4x + ${2 * k} = ${P}` },
        { explanation: TEXTS.solution.subtract(2 * k), math: `4x = ${P - 2 * k}` },
        { explanation: TEXTS.solution.divide(4), math: `x = ${x}` },
        { explanation: TEXTS.words.widthLength, math: `x = ${x}, \\quad x + ${k} = ${x + k}` },
      ],
      meta: { P, k },
    };
  }

  if (type === 'rectTimes') {
    const x = randInt(2, 20), m = randInt(2, 4);
    const P = 2 * (1 + m) * x;
    const equation = `2(x + ${m}x) = ${P}`;
    return {
      kind: 'numbers', ordered: true,
      text: `The length of a rectangle is ${m} times its width. The perimeter of the rectangle is ${P} cm.`,
      question: 'Find the width and the length of the rectangle.',
      labels: ['Width (cm)', 'Length (cm)'],
      hint: TEXTS.words.orderHint,
      answer: [x, m * x], equation,
      steps: [
        { explanation: TEXTS.words.letWidthTimes(m), math: `x, \\quad ${m}x` },
        { explanation: TEXTS.words.perimeterRectangle, math: equation },
        { explanation: TEXTS.words.simplifyBrackets, math: `2 \\cdot ${m + 1}x = ${P}` },
        { explanation: TEXTS.solution.simplify,      math: `${2 * (m + 1)}x = ${P}` },
        { explanation: TEXTS.solution.divide(2 * (m + 1)), math: `x = ${x}` },
        { explanation: TEXTS.words.widthLength, math: `x = ${x}, \\quad ${m}x = ${m * x}` },
      ],
      meta: { P, m },
    };
  }

  if (type === 'triangle') {
    const a = randInt(1, 6), b = a + randInt(1, 6);
    const x = randInt(b - a + 1, 25);                            // the triangle inequality holds
    const P = 3 * x + a + b;
    const equation = `x + (x + ${a}) + (x + ${b}) = ${P}`;
    return {
      kind: 'numbers', ordered: true,
      text: `The second side of a triangle is ${a} cm longer than the first side, and the third side is ${b} cm longer than the first side. The perimeter of the triangle is ${P} cm.`,
      question: 'Find the lengths of the sides, from the shortest to the longest.',
      labels: ['1st side (cm)', '2nd side (cm)', '3rd side (cm)'],
      hint: TEXTS.words.orderHint,
      answer: [x, x + a, x + b], equation,
      steps: [
        { explanation: TEXTS.words.letFirstSide, math: `x, \\quad x + ${a}, \\quad x + ${b}` },
        { explanation: TEXTS.words.perimeterTriangle, math: equation },
        ...sumSteps(3, a + b, P, x),
        { explanation: TEXTS.words.answerIs, math: listLatex([x, x + a, x + b]) },
      ],
      meta: { P, a, b },
    };
  }

  // isosceles: two equal sides and a shorter base
  const x = randInt(6, 25), k = randInt(1, x - 2);
  const P = 3 * x - k;
  const equation = `x + x + (x - ${k}) = ${P}`;
  return {
    kind: 'numbers', ordered: true,
    text: `An isosceles triangle has two equal sides. Its base is ${k} cm shorter than each of the equal sides. The perimeter of the triangle is ${P} cm.`,
    question: 'Find the length of an equal side and the length of the base.',
    labels: ['Equal side (cm)', 'Base (cm)'],
    hint: TEXTS.words.orderHint,
    answer: [x, x - k], equation,
    steps: [
      { explanation: TEXTS.words.letEqualSide(k), math: `x, \\quad x, \\quad x - ${k}` },
      { explanation: TEXTS.words.perimeterTriangle, math: equation },
      ...sumSteps(3, -k, P, x),
      { explanation: TEXTS.words.equalSideAndBase, math: `x = ${x}, \\quad x - ${k} = ${x - k}` },
    ],
    meta: { P, k },
  };
}

// ─── level 4: quadratic word problems ─────────────────────────────────────────

/** x² + kx − A = 0 has the roots w and −(w + k); only the positive one makes sense */
function generateWordQuadratic() {
  if (randInt(1, 3) <= 2) {
    // area of a rectangle
    const w = randInt(2, 14), k = randInt(1, 9);
    const A = w * (w + k);
    const equation = `x(x + ${k}) = ${A}`;
    return {
      kind: 'numbers', ordered: true,
      text: `The length of a rectangle is ${k} cm more than its width. The area of the rectangle is ${A} cm².`,
      question: 'Find the width and the length of the rectangle.',
      labels: ['Width (cm)', 'Length (cm)'],
      hint: TEXTS.words.orderHint,
      answer: [w, w + k], equation,
      steps: [
        { explanation: TEXTS.words.letWidth(k), math: `x, \\quad x + ${k}` },
        { explanation: TEXTS.words.areaRectangle, math: equation },
        { explanation: TEXTS.words.expandAndMove, math: `x^2 + ${k}x - ${A} = 0` },
        ...quadraticSolveSteps(1, k, -A, [-(w + k), w], 'x', true),     // by the discriminant
        { explanation: TEXTS.solution.rootsAre, math: rootsListLatex([-(w + k), w]) },
        { explanation: TEXTS.words.rejectNegative, math: `x = ${w}` },
        { explanation: TEXTS.words.widthLength, math: `x = ${w}, \\quad x + ${k} = ${w + k}` },
      ],
      meta: { A, k },
    };
  }

  // the product of two consecutive positive integers
  const w = randInt(2, 20);
  const P = w * (w + 1);
  const equation = `x(x + 1) = ${P}`;
  return {
    kind: 'numbers', ordered: true,
    text: `The product of two consecutive positive integers is ${P}.`,
    question: 'Find the integers, the smaller one first.',
    labels: ['1st number', '2nd number'],
    hint: TEXTS.words.orderHint,
    answer: [w, w + 1], equation,
    steps: [
      { explanation: TEXTS.words.letSmallest('integers', 1), math: `x, \\quad x + 1` },
      { explanation: TEXTS.words.productEquation, math: equation },
      { explanation: TEXTS.words.expandAndMove, math: `x^2 + x - ${P} = 0` },
      ...quadraticSolveSteps(1, 1, -P, [-(w + 1), w], 'x', true),     // by the discriminant
      { explanation: TEXTS.solution.rootsAre, math: rootsListLatex([-(w + 1), w]) },
      { explanation: TEXTS.words.rejectNegativeInteger, math: `x = ${w}, \\quad x + 1 = ${w + 1}` },
    ],
    meta: { P },
  };
}

// ─── register with the shared generator table (defined in equations.js) ──────
Object.assign(GENERATORS, {
  'word-parts':       generateWordParts,
  'word-consecutive': generateWordNumbers,
  'word-geometry':    generateWordPerimeter,
  'word-quadratic':   generateWordQuadratic,
});
