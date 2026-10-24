/**
 * system-problems.js
 * Word problems with two unknown quantities that give a system of two linear equations:
 * "n items of two kinds, together worth S" (bills, coins, tickets, wheels, legs, baskets …).
 *
 *   word-system   x + y = n,  a·x + b·y = S   →  y = n − x  →  one equation in x
 *
 * Problem: { kind: 'numbers', ordered: true, labels, hint, text, question, answer, equation, steps, meta }
 * The answers are the numbers of the two kinds, in the order of the fields. The solution is chosen
 * first and the story built around it, so both answers are positive whole numbers.
 *
 * Load after word-problems.js (NAMES, pickFresh, listLatex), polynomial-equations.js (pick),
 * equations.js (randInt) and texts.js.
 */

/**
 * One story = two kinds of things with a value each.
 *   pairs     possible [a, b] values per item (a is the first kind, b the second)
 *   n         range of the total number of items
 *   kinds     [first, second] as [singular, plural]
 *   text      (who, n, a, b, S) → the story
 *   question  the question line
 *   labels    (a, b) → the two field labels
 */
const SYSTEM_THEMES = [
  { pairs: [[10, 20], [5, 10], [20, 50], [10, 50], [5, 20]], n: [20, 60],
    text: (who, n, a, b, S) => `${who} has ${n} bills of €${a} and €${b}. The total amount of money is €${S}.`,
    question: (a, b) => `How many €${a} bills and how many €${b} bills are there?`,
    labels: (a, b) => [`Number of €${a} bills`, `Number of €${b} bills`] },
  { pairs: [[1, 2], [2, 5], [1, 5]], n: [25, 50],
    text: (who, n, a, b, S) => `${who} has ${n} coins worth €${a} and €${b}. In total there are €${S}.`,
    question: (a, b) => `How many €${a} coins and how many €${b} coins are there?`,
    labels: (a, b) => [`Number of €${a} coins`, `Number of €${b} coins`] },
  { pairs: [[2, 5], [3, 4], [2, 4], [3, 6], [4, 7]], n: [20, 40],
    text: (who, n, a, b, S) => `${who} bought ${n} items in a shop: notebooks at €${a} each and pads at €${b} each. The whole purchase cost €${S}.`,
    question: () => 'How many notebooks and how many pads were bought?',
    labels: () => ['Number of notebooks', 'Number of pads'] },
  { pairs: [[4, 9], [5, 12], [6, 10], [3, 8], [5, 8]], n: [40, 120],
    text: (who, n, a, b, S) => `A theatre sold ${n} tickets: child tickets at €${a} and adult tickets at €${b}. The ticket sales were €${S} in total.`,
    question: () => 'How many child tickets and how many adult tickets were sold?',
    labels: () => ['Number of child tickets', 'Number of adult tickets'] },
  { pairs: [[2, 4]], n: [20, 40],
    text: (who, n, a, b, S) => `There are ${n} vehicles in a car park: bicycles and cars. Together they have ${S} wheels. A bicycle has ${a} wheels and a car has ${b} wheels.`,
    question: () => 'How many bicycles and how many cars are in the car park?',
    labels: () => ['Number of bicycles', 'Number of cars'] },
  { pairs: [[2, 4]], n: [25, 50],
    text: (who, n, a, b, S) => `On a farm there are ${n} animals: hens and rabbits. Together they have ${S} legs. A hen has ${a} legs and a rabbit has ${b} legs.`,
    question: () => 'How many hens and how many rabbits are on the farm?',
    labels: () => ['Number of hens', 'Number of rabbits'] },
  { pairs: [[2, 3]], n: [20, 40],
    text: (who, n, a, b, S) => `${who} scored ${n} baskets in a basketball tournament: shots worth ${a} points and shots worth ${b} points. In total that is ${S} points.`,
    question: (a, b) => `How many ${a}-point baskets and how many ${b}-point baskets were scored?`,
    labels: (a, b) => [`Number of ${a}-point baskets`, `Number of ${b}-point baskets`] },
  { pairs: [[2, 3]], n: [20, 40],
    text: (who, n, a, b, S) => `A shop sells ${n} bicycles and tricycles. Together they have ${S} wheels. A bicycle has 2 wheels and a tricycle has 3 wheels.`,
    question: () => 'How many bicycles and how many tricycles does the shop sell?',
    labels: () => ['Number of bicycles', 'Number of tricycles'] },
];

/** "3x", "x", "-x", "-3x" */
const sysCoefX = c => (c === 1 ? 'x' : c === -1 ? '-x' : `${c}x`);

/** n items of two kinds with the values a and b, worth S together */
function generateWordSystem() {
  const theme = pickFresh('word-system', SYSTEM_THEMES);
  const who = pick(NAMES);
  const [a, b] = pick(theme.pairs);
  let x, y, n, S;
  do {
    n = randInt(theme.n[0], theme.n[1]);
    x = randInt(3, n - 3);
    y = n - x;
    S = a * x + b * y;
  } while (x === y);

  const text = theme.text(who, n, a, b, S);
  const labels = theme.labels(a, b);
  const c = a - b;                                  // the coefficient of x after multiplying out
  const k = b * n;                                  // the constant after multiplying out
  const sign = k >= 0 ? '+' : '-';

  const steps = [
    { explanation: TEXTS.system.setup,
      math: `\\begin{cases} x + y = ${n} \\\\ ${sysCoefX(a)} + ${b === 1 ? '' : b}y = ${S} \\end{cases}` },
    { explanation: TEXTS.system.expressY, math: `y = ${n} - x` },
    { explanation: TEXTS.system.substitute, math: `${sysCoefX(a)} + ${b}(${n} - x) = ${S}` },
    { explanation: TEXTS.words.expandBrackets, math: `${sysCoefX(a)} + ${k} - ${sysCoefX(b)} = ${S}` },
    { explanation: TEXTS.solution.combineLike, math: `${sysCoefX(c)} ${sign} ${Math.abs(k)} = ${S}` },
    { explanation: k > 0 ? TEXTS.solution.subtract(k) : TEXTS.solution.add(-k), math: `${sysCoefX(c)} = ${S - k}` },
  ];
  if (c !== 1) steps.push({ explanation: TEXTS.solution.divide(c), math: `x = ${x}` });
  steps.push(
    { explanation: TEXTS.system.findY, math: `y = ${n} - ${x} = ${y}` },
    { explanation: TEXTS.words.answerIs, math: listLatex([x, y]) },
  );

  return {
    kind: 'numbers', ordered: true,
    text,
    question: theme.question(a, b),
    labels,
    hint: TEXTS.words.orderHint,
    answer: [x, y],
    equation: `${sysCoefX(a)} + ${b}(${n} - x) = ${S}`,
    steps,
    meta: { a, b, n, S, x, y },
  };
}

// ─── register with the shared generator table (defined in equations.js) ──────
Object.assign(GENERATORS, {
  'word-system': generateWordSystem,
});
