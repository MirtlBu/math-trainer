/**
 * fg-problems.js
 * Two linear functions f and g where one is given by an equation and the other one by a graph:
 *
 *   fg-statements  "Which statement is true?": both increase / decrease, which one faster, one up and one down
 *   fg-read        read g from the graph (the slope, the y-intercept) or compare g and f at one x
 *   fg-intersect   at which x do f and g have the same value? (read g from the graph, solve the equation)
 *   fg-table       Function 1 by a table, Function 2 by a graph (or the other way round): which has the greater slope / y-intercept / value?
 *
 * f(x) = k x + b with k = k2 / 2 (halves: ±1/2, ±1, ±3/2, ±2, ±3), b a whole number; the same for g.
 * Problem: { kind: 'choice' | 'value', text (the equation of f), question, graph (g), answer, steps, meta }.
 *
 * Load after equations.js (randInt), polynomial-equations.js (pick), word-problems.js (pickFresh),
 * graph.js, percent-advanced.js (pcShuffle) and texts.js.
 */

// ─── helpers (names start with "fg") ──────────────────────────────────────────

const FG_SLOPES2 = [1, -1, 2, -2, 3, -3, 4, -4, 6, -6];     // twice the slope

const fgNum = n => String(Number(n.toFixed(4)));

/** "kx + b" in LaTeX for the slope k2/2: x, -x, 2x, \dfrac{1}{2}x, -\dfrac{3}{2}x + 4 … */
function fgLineTex(k2, b, name = 'f') {
  const kk = Math.abs(k2);
  const coef = kk === 2 ? '' : kk % 2 === 0 ? String(kk / 2) : `\\dfrac{${kk}}{2}`;
  const term = `${k2 < 0 ? '-' : ''}${coef}x`;
  return `${name}(x) = ${term}${b === 0 ? '' : b > 0 ? ` + ${b}` : ` - ${-b}`}`;
}

/** The slope as a decimal text: 0.5, -1.5, 2 */
const fgSlope = k2 => fgNum(k2 / 2);

/** g, drawn: the plot area is -6…6 on both axes */
function fgGraph(k2, c, label = 'g') {
  const fn = x => c + k2 / 2 * x;
  return {
    x: { min: -6, max: 6, step: 1, label: 'x' },
    y: { min: -6, max: 6, step: 1, label: 'y' },
    lines: [{ fn, label }],
    caption: TEXTS.practice.graphHint,
    ariaLabel: `The graph of the function g: a straight line through the point (0, ${c}).`,
  };
}

/** A line c + (k2/2)x is easy to read: it passes the y-axis at a whole number inside the plot and has 3 or more grid points in it */
function fgReadable(k2, c) {
  if (Math.abs(c) > 5) return false;
  const q = k2 % 2 === 0 ? 1 : 2;                                  // the grid points of the line are a multiple of q apart
  let points = 0;
  for (let x = -6; x <= 6; x += 1) {
    if (x % q !== 0) continue;
    const y = c + k2 / 2 * x;
    if (Number.isInteger(y) && Math.abs(y) <= 6) points++;
  }
  return points >= 3;
}

/** Two functions: f by the equation, g by the graph; `sameSlopeAllowed` lets them be parallel now and then */
function fgPair(sameSlopeAllowed = false) {
  for (;;) {
    const kf2 = pick(FG_SLOPES2), kg2 = pick(FG_SLOPES2), bf = randInt(-5, 5), cg = randInt(-5, 5);
    if (kf2 === kg2 && !(sameSlopeAllowed && randInt(1, 6) === 1)) continue;
    if (kf2 === kg2 && bf === cg) continue;                         // the same line
    if (!fgReadable(kg2, cg)) continue;
    return { kf2, bf, kg2, cg };
  }
}

/** Two grid points of g for the slope: (0, c) and the next one to the right */
function fgTwoPoints(kg2, cg) {
  const dx = kg2 % 2 === 0 ? 1 : 2;
  return { x1: 0, y1: cg, x2: dx, y2: cg + kg2 / 2 * dx };
}

/** The steps that read the slope of g from the graph */
function fgReadSlopeSteps(kg2, cg, name = 'g') {
  const { x1, y1, x2, y2 } = fgTwoPoints(kg2, cg);
  return [
    { explanation: TEXTS.fg.readPoints(name), math: `(${x1},\\ ${y1}) \\quad\\text{and}\\quad (${x2},\\ ${y2})` },
    { explanation: TEXTS.fg.slopeOfG, math: `m = \\dfrac{${y2} - ${y1 < 0 ? `(${y1})` : y1}}{${x2} - ${x1}} = \\dfrac{${y2 - y1}}{${x2 - x1}} = ${fgSlope(kg2)}` },
  ];
}

// ─── statements about increasing / decreasing and the rate ────────────────────

/** The statements: exactly one of them is true for any pair of different or equal slopes */
const FG_STATEMENTS = {
  bothUpFaster:   { text: '$f$ and $g$ are both increasing, and $f$ increases faster than $g$.', test: (kf, kg) => kf > 0 && kg > 0 && kf > kg },
  bothUpSlower:   { text: '$f$ and $g$ are both increasing, and $g$ increases faster than $f$.', test: (kf, kg) => kf > 0 && kg > 0 && kg > kf },
  bothDownFaster: { text: '$f$ and $g$ are both decreasing, and $f$ decreases faster than $g$.', test: (kf, kg) => kf < 0 && kg < 0 && kf < kg },
  bothDownSlower: { text: '$f$ and $g$ are both decreasing, and $g$ decreases faster than $f$.', test: (kf, kg) => kf < 0 && kg < 0 && kg < kf },
  gUpFDown:       { text: '$g$ is increasing and $f$ is decreasing.', test: (kf, kg) => kg > 0 && kf < 0 },
  fUpGDown:       { text: '$f$ is increasing and $g$ is decreasing.', test: (kf, kg) => kf > 0 && kg < 0 },
  bothUpSame:     { text: '$f$ and $g$ are both increasing at the same rate.', test: (kf, kg) => kf > 0 && kg > 0 && kf === kg },
  bothDownSame:   { text: '$f$ and $g$ are both decreasing at the same rate.', test: (kf, kg) => kf < 0 && kg < 0 && kf === kg },
};

function generateFgStatements() {
  const { kf2, bf, kg2, cg } = fgPair(true);
  const all = Object.values(FG_STATEMENTS);
  const right = all.find(s => s.test(kf2, kg2));
  // 5 options: the right one and 4 others, the ones that are close to the truth first
  const others = pcShuffle(all.filter(s => s !== right)).slice(0, 4);
  const options = pcShuffle([right, ...others]);
  const state = (k2, name) => (k2 > 0 ? `${name} is increasing` : `${name} is decreasing`);
  const steps = [
    ...fgReadSlopeSteps(kg2, cg),
    { explanation: TEXTS.fg.slopeOfF, math: `f(x) = ${fgSlope(kf2)}x ${bf < 0 ? '-' : '+'} ${Math.abs(bf)} \\quad\\Rightarrow\\quad k = ${fgSlope(kf2)}` },
    { explanation: TEXTS.fg.compareSlopes, math: `${fgSlope(kf2)} \\ (f), \\quad ${fgSlope(kg2)} \\ (g)` },
    { explanation: TEXTS.fg.theTrue(right.text) },
  ];
  return {
    kind: 'choice',
    text: `$${fgLineTex(kf2, bf)}$. The graph of the function $g$ is drawn below.`,
    question: 'Which statement is true?',
    options: options.map(s => s.text), answer: options.indexOf(right),
    graph: fgGraph(kg2, cg), steps,
    meta: { type: 'statements', kf2, bf, kg2, cg },
  };
}

// ─── reading g, comparing with f ──────────────────────────────────────────────

function generateFgRead() {
  const type = pick(['slope', 'intercept', 'difference']);
  const { kf2, bf, kg2, cg } = fgPair();
  const text = `$${fgLineTex(kf2, bf)}$. The graph of the function $g$ is drawn below.`;

  if (type === 'slope') {
    return fgValue(text, 'What is the slope of $g$?', kg2 / 2, fgReadSlopeSteps(kg2, cg), { type, kf2, bf, kg2, cg }, fgGraph(kg2, cg));
  }
  if (type === 'intercept') {
    return fgValue(text, 'At which value of $y$ does the graph of $g$ cross the $y$-axis?', cg, [
      { explanation: TEXTS.fg.yIntercept, math: `g(0) = ${cg}` },
    ], { type, kf2, bf, kg2, cg }, fgGraph(kg2, cg));
  }
  // g(x0) - f(x0) at an x where both values are whole numbers
  const qf = kf2 % 2 === 0 ? 1 : 2, qg = kg2 % 2 === 0 ? 1 : 2, q = Math.max(qf, qg);
  const candidates = [];
  for (let x = -4; x <= 4; x += 1) {
    if (x === 0 || x % q !== 0) continue;
    if (Math.abs(cg + kg2 / 2 * x) <= 6) candidates.push(x);
  }
  if (candidates.length === 0) return generateFgRead();
  const x0 = pick(candidates), gv = cg + kg2 / 2 * x0, fv = bf + kf2 / 2 * x0;
  return fgValue(text, `What is $g(${x0}) - f(${x0})$?`, gv - fv, [
    { explanation: TEXTS.fg.readG(x0), math: `g(${x0}) = ${gv}` },
    { explanation: TEXTS.fg.calcF(x0), math: `f(${x0}) = ${fgSlope(kf2)} \\cdot ${x0 < 0 ? `(${x0})` : x0} ${bf < 0 ? '-' : '+'} ${Math.abs(bf)} = ${fv}` },
    { explanation: TEXTS.fg.subtract, math: `${gv} - ${fv < 0 ? `(${fv})` : fv} = ${gv - fv}` },
  ], { type, kf2, bf, kg2, cg, x0 }, fgGraph(kg2, cg));
}

function fgValue(text, question, answer, steps, meta, graph) {
  return { kind: 'value', text, question, answer: Number(answer.toFixed(6)), graph, steps, meta };
}

// ─── the intersection ─────────────────────────────────────────────────────────

function generateFgIntersect() {
  for (;;) {
    const kf2 = pick(FG_SLOPES2), kg2 = pick(FG_SLOPES2), x0 = randNZ(5), bf = randInt(-5, 5);
    if (kf2 === kg2) continue;
    const cg2 = 2 * bf + (kf2 - kg2) * x0;                            // twice the y-intercept of g: g(x0) = f(x0)
    if (cg2 % 2 !== 0) continue;
    const cg = cg2 / 2;
    if (!fgReadable(kg2, cg)) continue;
    const dk = (kf2 - kg2) / 2, rhs = cg - bf;                       // (k_f - k_g) x = c - b
    if (Math.abs(dk * x0 - rhs) > 1e-9) continue;
    const yAt = bf + kf2 / 2 * x0;
    const lineG = `g(x) = ${fgSlope(kg2)}x ${cg < 0 ? '-' : '+'} ${Math.abs(cg)}`.replace(/ \+ 0$/, '');
    return {
      kind: 'value',
      text: `$${fgLineTex(kf2, bf)}$. The graph of the function $g$ is drawn below.`,
      question: 'At which value of $x$ do $f$ and $g$ have the same value?',
      answer: x0, graph: fgGraph(kg2, cg),
      steps: [
        ...fgReadSlopeSteps(kg2, cg),
        { explanation: TEXTS.fg.equationOfG, math: lineG },
        { explanation: TEXTS.fg.setEqual, math: `${fgSlope(kf2)}x ${bf < 0 ? '-' : '+'} ${Math.abs(bf)} = ${fgSlope(kg2)}x ${cg < 0 ? '-' : '+'} ${Math.abs(cg)}` },
        { explanation: TEXTS.fg.collect, math: `(${fgSlope(kf2)} - ${fgSlope(kg2) < 0 ? `(${fgSlope(kg2)})` : fgSlope(kg2)})x = ${cg} - ${bf < 0 ? `(${bf})` : bf} \\quad\\Rightarrow\\quad ${fgNum(dk)}x = ${rhs}` },
        { explanation: TEXTS.solution.divide(dk), math: `x = \\dfrac{${rhs}}{${dk < 0 ? `(${fgNum(dk)})` : fgNum(dk)}} = ${x0}` },
        { explanation: TEXTS.fg.checkValue, math: `f(${x0}) = g(${x0}) = ${fgNum(yAt)}` },
      ],
      meta: { type: 'intersect', kf2, bf, kg2, cg, x0 },
    };
  }
}

// ─── a table and a graph: "Which function has a greater slope?" ──────────────

const FG_INPUTS = ['x', 'r', 't', 'p', 'm', 's'];
const FG_LINES = ['g', 'h', 'q', 'k', 'w'];

/** The table as HTML (the numbers with a real minus sign) */
function fgTableHtml(input, rows) {
  const n = v => fgNum(v).replace('-', '\u2212');
  return `<table class="fg-table"><thead><tr><th><i>${input}</i></th><th><i>y</i></th></tr></thead><tbody>` +
    rows.map(([x, y]) => `<tr><td>${n(x)}</td><td>${n(y)}</td></tr>`).join('') + '</tbody></table>';
}

/**
 * Function 1 / Function 2: one is given by a table (4 rows of the line y = kx + b), the other by a graph.
 * Questions: which has the greater slope / y-intercept / value at one x (or: they are the same).
 */
function generateFgTable() {
  const type = pick(['slope', 'slope', 'intercept', 'value']);
  const input = pick(FG_INPUTS), line = pick(FG_LINES.filter(l => l !== input));
  for (;;) {
    const { kf2: kt2, kg2, cg } = fgPair(true);                      // kt2: the slope of the table (twice), kg2, cg: the graph
    const bt2 = randInt(-10, 10);                                    // the intercept of the table (twice): a half is allowed
    const kt = kt2 / 2, bt = bt2 / 2;
    // the table: x = 0 (when the intercept is asked) and three more values
    const xs = new Set(type === 'intercept' ? [0] : []);
    while (xs.size < 4) xs.add(randInt(-4, 9));
    const rows = [...xs].sort((a, b) => a - b).map(x => [x, kt * x + bt]);
    if (rows.some(([, y]) => Math.abs(y) > 20)) continue;
    const gOf = x => cg + kg2 / 2 * x;
    let x0 = null, v1, v2, ask, tieText, steps = [];
    const tableFirst = randInt(0, 1) === 1;                          // which function is the table: 1 or 2
    const tableNo = tableFirst ? 1 : 2, graphNo = tableFirst ? 2 : 1;

    const [ra, rb] = [rows[0], rows[1]];                             // two rows for the slope
    const slopeSteps = [
      { explanation: TEXTS.fg.fromTable(tableNo), math: `m = \\dfrac{${fgNum(rb[1])} - ${ra[1] < 0 ? `(${fgNum(ra[1])})` : fgNum(ra[1])}}{${rb[0]} - ${ra[0] < 0 ? `(${ra[0]})` : ra[0]}} = \\dfrac{${fgNum(rb[1] - ra[1])}}{${rb[0] - ra[0]}} = ${fgNum(kt)}` },
      ...fgReadSlopeSteps(kg2, cg, line).map((st, i) => (i === 0 ? { ...st, explanation: TEXTS.fg.readPoints(line) + ' ' + `(Function ${graphNo})` } : st)),
    ];
    let t1, t2;                                                       // the compared values of Function 1 and Function 2
    if (type === 'slope') {
      const [kTab, kGr] = [kt, kg2 / 2];
      [t1, t2] = tableFirst ? [kTab, kGr] : [kGr, kTab];
      ask = 'Which function has a greater slope?'; tieText = 'The functions have the same slope.';
      steps = slopeSteps;
    } else if (type === 'intercept') {
      [t1, t2] = tableFirst ? [bt, cg] : [cg, bt];
      ask = 'Which function has a greater y-intercept?'; tieText = 'The functions have the same y-intercept.';
      steps = [
        { explanation: TEXTS.fg.interceptTable(tableNo, input), math: `y(0) = ${fgNum(bt)}` },
        { explanation: TEXTS.fg.interceptGraph(graphNo, line), math: `${line}(0) = ${cg}` },
      ];
    } else {
      const candidates = rows.map(r => r[0]).filter(x => x !== 0 && Math.abs(x) <= 6 && x % (kg2 % 2 === 0 ? 1 : 2) === 0 && Math.abs(gOf(x)) <= 6);
      if (candidates.length === 0) continue;
      x0 = pick(candidates);
      const vt = kt * x0 + bt, vg = gOf(x0);
      [t1, t2] = tableFirst ? [vt, vg] : [vg, vt];
      ask = `Which function has the greater value at ${input} = ${x0}?`; tieText = 'The functions have the same value there.';
      steps = [
        { explanation: TEXTS.fg.valueTable(tableNo, input, x0), math: `y(${x0}) = ${fgNum(vt)}` },
        { explanation: TEXTS.fg.valueGraph(graphNo, line, input, x0), math: `${line}(${x0}) = ${fgNum(vg)}` },
      ];
    }
    const answer = Math.abs(t1 - t2) < 1e-9 ? 2 : (t1 > t2 ? 0 : 1);
    if (type === 'slope') steps.push({ explanation: TEXTS.fg.greaterSlope });
    const options = ['Function 1', 'Function 2', tieText];
    steps.push({ explanation: TEXTS.fg.theBigger(options[answer]), math: `${fgNum(t1)} \\ \\text{(Function 1)}, \\quad ${fgNum(t2)} \\ \\text{(Function 2)}` });
    const text = tableFirst
      ? `Function 1 is defined by the following table.${fgTableHtml(input, rows)}Function 2 is defined by the line <i>${line}</i>.`
      : `Function 1 is defined by the line <i>${line}</i>. Function 2 is defined by the following table.${fgTableHtml(input, rows)}`;
    const graph = fgGraph(kg2, cg, line);
    graph.x.label = input;
    return {
      kind: 'choice', text, question: ask, options, answer, graph, steps,
      meta: { type, tableFirst, kt2, bt2, kg2, cg, x0, rows, input, line },
    };
  }
}

// ─── register with the shared generator table (defined in equations.js) ──────
Object.assign(GENERATORS, {
  'fg-statements': generateFgStatements,
  'fg-read':       generateFgRead,
  'fg-intersect':  generateFgIntersect,
  'fg-table':      generateFgTable,
});
