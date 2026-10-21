/**
 * graph-problems.js
 * Word problems about a straight-line graph: a quantity that starts at b and changes at a
 * constant rate p/q per unit of time. Each problem has a text, a question and a graph.
 *
 *   kind 'value'  — read a number from the graph (answer: number)
 *   kind 'choice' — pick the true statement (options: [text], answer: index)
 *
 * Problem fields used by the practice screen besides the usual ones:
 *   text      paragraph shown above the question ($…$ allowed)
 *   question  replaces the default label ("Solve for x:")
 *   graph     spec for renderGraph (graph.js)
 *
 * Load after equations.js (random helpers), polynomial-equations.js (pick) and graph.js.
 */

// ─── contexts ─────────────────────────────────────────────────────────────────

// The stories (GRAPH_CONTEXTS) are in graph-stories.js


// ─── helpers ──────────────────────────────────────────────────────────────────


// Each level has its own stories (see graph-stories.js). Within a level a story is chosen at
// random but never repeats within the last 9 problems, so a set of 10 shows 10 different stories.
const recentContexts = { value: [], equation: [], interpret: [] };

function pickContext(level) {
  const pool    = GRAPH_CONTEXTS.filter(c => c.level === level);
  const recent  = recentContexts[level];
  const memory  = Math.min(9, pool.length - 1);
  const choices = pool.filter(c => !recent.includes(c));
  const chosen  = choices[randInt(0, choices.length - 1)];
  recent.push(chosen);
  if (recent.length > memory) recent.shift();
  return chosen;
}

const gcd = (a, b) => (b === 0 ? Math.abs(a) : gcd(b, a % b));

/** "it grew 2 cm each day" / "it grew 1 cm every 2 days" */
function ratePhrase(ctx, p, q) {
  const when = q === 1 ? `each ${ctx.unit[0]}` : `every ${q} ${ctx.unit[1]}`;
  return `${ctx.verb} ${ctx.fmt(p)} ${when}`;
}

/** The statement "Maya started with €10, and then she added €2 each week." */
function statement(ctx, b, p, q) {
  return `${ctx.start(ctx.fmt(b))}, and then ${ratePhrase(ctx, p, q)}.`;
}

/**
 * Pick the line and the grid so that it can be read exactly:
 * the starting value is on a horizontal grid line, and the line crosses a grid
 * intersection again somewhere to the right.
 */
function pickLine(ctx) {
  const down = ctx.dir === 'down';

  for (;;) {
    const q = pick([1, 1, 1, 2, 3]);
    const xStep = q === 1 ? pick([2, 3, 4, 5]) : (q === 2 ? pick([2, 4]) : 3);
    const xMax  = 6 * xStep;

    const maxRate = ctx.maxRate || 6;
    let p = q === 1 ? randInt(1, Math.max(1, Math.min(maxRate, Math.floor(90 / xMax)))) : pick([1, 2]);
    if (gcd(p, q) !== 1) p = 1;

    const rise = p * xMax / q;                                   // change over the whole x range
    const b    = down ? Math.ceil(rise) + randInt(2, 12) : randInt(2, 20);
    const sign = down ? -1 : 1;
    const fn   = x => b + sign * p * x / q;
    const maxY = down ? b : b + rise;
    if (maxY > (ctx.cap || Infinity)) continue;   // keep the numbers believable

    // choose a y grid step: the start value lies on a grid line, at most 10 rows
    const yStep = [1, 2, 5, 10, 20, 25, 50].find(s =>
      b % s === 0 && Math.ceil(maxY / s) <= 10 && Math.ceil(maxY / s) >= 4);
    if (!yStep) continue;

    // x values (multiples of xStep) where the line is exactly on a horizontal grid line
    const readable = [];
    for (let x = xStep; x <= xMax; x += xStep) {
      const y = fn(x);
      if (Number.isInteger(y) && y % yStep === 0 && y > 0) readable.push(x);
    }
    if (readable.length === 0) continue;

    const yMax = Math.ceil(maxY / yStep) * yStep;
    return { q, p, b, sign, fn, xStep, xMax, yStep, yMax, readable };
  }
}

function graphSpec(ctx, line) {
  return {
    x: { min: 0, max: line.xMax, step: line.xStep, label: ctx.x },
    y: { min: 0, max: line.yMax, step: line.yStep, label: ctx.y },
    lines: [{ fn: line.fn }],
    caption: TEXTS.practice.graphHint,
    ariaLabel: `Graph of ${ctx.y} against ${ctx.x}: a straight line starting at ${line.b}.`,
  };
}

/** The two points used in the rate step: (0, b) and (x1, y1) */
function ratePoints(line) {
  const x1 = line.readable[0];
  return { x1, y1: line.fn(x1) };
}

// ─── generators ───────────────────────────────────────────────────────────────

/** Read a number from the graph: a value, a time, the start or the rate */
function generateGraphValue() {
  const ctx  = pickContext('value');
  const line = pickLine(ctx);
  const { b, p, q, xStep } = line;
  const spec = graphSpec(ctx, line);
  const yv = ctx.y, xv = ctx.x;

  const type = pick(['valueAt', 'valueAt', 'timeAt', 'timeAt', 'start', 'rate']);
  const base = { kind: 'value', text: ctx.intro, graph: spec };

  if (type === 'valueAt') {
    const x0 = pick(line.readable);
    const y0 = line.fn(x0);
    return { ...base, question: ctx.askValue(x0), answer: y0, steps: [
      { explanation: `Find $${xv} = ${x0}$ on the horizontal axis, go up to the line, then across to the vertical axis.`,
        math: `${yv}(${x0}) = ${y0}` },
    ] };
  }

  if (type === 'timeAt') {
    const x0 = pick(line.readable);
    const y0 = line.fn(x0);
    return { ...base, question: ctx.askTime(y0), answer: x0, steps: [
      { explanation: `Find ${y0} on the vertical axis, go across to the line, then down to the horizontal axis.`,
        math: `${yv} = ${y0} \\quad\\Rightarrow\\quad ${xv} = ${x0}` },
    ] };
  }

  if (type === 'start') {
    return { ...base, question: ctx.askStart, answer: b, steps: [
      { explanation: `The starting value is where the line meets the vertical axis, that is at $${xv} = 0$.`,
        math: `${yv}(0) = ${b}` },
    ] };
  }

  // rate: the size of the change per unit of time
  const { x1, y1 } = ratePoints(line);
  return { ...base, question: ctx.askRate, answer: p / q, steps: [
    { explanation: `Take two points on the line, for example $(0, ${b})$ and $(${x1}, ${y1})$.`,
      math: `\\dfrac{${y1} - ${b}}{${x1} - 0} = \\dfrac{${y1 - b}}{${x1}} = ${latexFrac(y1 - b, x1)}` },
    { explanation: line.sign > 0
        ? `The line goes up, so the quantity grows by this amount each ${ctx.unit[0]}.`
        : `The line goes down, so the quantity decreases by this amount each ${ctx.unit[0]} (the answer is the size of the change).`,
      math: `${latexFrac(p, q)}` },
  ] };
}


/** The rate term as LaTeX: d, 3d or \dfrac{1}{2}d */
function slopeTermLatex(p, q, v) {
  if (q === 1) return p === 1 ? v : `${p}${v}`;
  return `\\dfrac{${p}}{${q}}${v}`;
}

/** S = 3d + 15 (growing)  or  S = 15 - 3d (shrinking) */
function lineEquationLatex(y, v, b, p, q, down) {
  const term = slopeTermLatex(p, q, v);
  return down ? `${y} = ${b} - ${term}` : `${y} = ${term} + ${b}`;
}

/** Three wrong options out of the candidates (different from the right one and from each other) */
function pickWrongOptions(correct, candidates) {
  const unique = [...new Set(candidates)].filter(c => c !== correct);
  unique.sort(() => Math.random() - 0.5);
  return unique.length >= 3 ? unique.slice(0, 3) : null;
}

/** The steps shared by the equation / point questions: start value and rate */
function startAndRateSteps(ctx, line) {
  const { b } = line;
  const { x1, y1 } = ratePoints(line);
  const yv = ctx.y, xv = ctx.x;
  return [
    { explanation: `Find the starting value: it is where the line meets the vertical axis, at $${xv} = 0$.`,
      math: `${yv}(0) = ${b}` },
    { explanation: `Find the rate of change: take two points on the line and divide the change in $${yv}$ by the change in $${xv}$.`,
      math: `\\dfrac{${y1} - ${b}}{${x1} - 0} = \\dfrac{${y1 - b}}{${x1}} = ${latexFrac(y1 - b, x1)}` },
  ];
}

/** Which equation matches the graph? */
function interpretEquation(ctx, line) {
  const { b, p, q } = line;
  const down = ctx.dir === 'down';
  const y = ctx.y, v = ctx.x;

  const correct = lineEquationLatex(y, v, b, p, q, down);
  const candidates = [
    lineEquationLatex(y, v, b, p, q, !down),            // the rate has the wrong sign
    `${y} = ${slopeTermLatex(p, q, v)} - ${b}`,          // a negative start
    lineEquationLatex(y, v, b, p + 1, q, down),          // a slightly different rate
    lineEquationLatex(y, v, b, q, p, down),              // the inverse rate (2 per 1 ↔ 1 per 2)
  ];
  if (q === 1 && p !== b) candidates.push(lineEquationLatex(y, v, p, b, 1, down));   // start and rate swapped

  const wrong = pickWrongOptions(correct, candidates);
  if (!wrong) return generateGraphInterpret();

  const options = [correct, ...wrong].sort(() => Math.random() - 0.5);
  return {
    kind: 'choice',
    text: ctx.intro,
    question: TEXTS.practice.whichEquation,
    graph: graphSpec(ctx, line),
    options: options.map(o => `$${o}$`),
    answer: options.indexOf(correct),
    steps: [
      ...startAndRateSteps(ctx, line),
      { explanation: down ? TEXTS.solution.soEquationDown : TEXTS.solution.soEquationUp, math: correct },
    ]
  };
}

/** Which ordered pair is where the line crosses the vertical axis? */
function interpretPoint(ctx, line) {
  const { b, p, yStep } = line;
  const pair = (u, w) => `$(${u}, ${w})$`;

  const correct = pair(0, b);
  const candidates = [pair(b, 0), pair(0, p), pair(p, b), pair(b, p), pair(0, b + yStep), pair(0, Math.max(1, b - yStep))];
  const wrong = pickWrongOptions(correct, candidates);
  if (!wrong) return generateGraphInterpret();

  const options = [correct, ...wrong].sort(() => Math.random() - 0.5);
  return {
    kind: 'choice',
    text: ctx.intro,
    question: TEXTS.practice.whichPoint,
    graph: graphSpec(ctx, line),
    options,
    answer: options.indexOf(correct),
    steps: [
      { explanation: `The line crosses the vertical axis where $${ctx.x} = 0$.`, math: `${ctx.y}(0) = ${b}` },
      { explanation: TEXTS.solution.soPoint, math: `(0, ${b})` },
    ]
  };
}

/** Choose the true statement about the start and the rate, or the matching equation / point */
function generateGraphInterpret() {
  const ctx  = pickContext('interpret');
  const line = pickLine(ctx);
  const { b, p, q, yStep } = line;

  // half of the problems are the "true statement" kind, the rest ask for the equation or the point
  const kind = pick(['statement', 'statement', 'equation', 'point']);
  if (kind === 'equation') return interpretEquation(ctx, line);
  if (kind === 'point')    return interpretPoint(ctx, line);

  const rateKey = (pp, qq) => `${pp / gcd(pp, qq)}/${qq / gcd(pp, qq)}`;
  const truth   = rateKey(p, q);

  // plausible wrong rates: the inverse (2 per 1 ↔ 1 per 2), a bit more, a bit less, a longer period
  const wrongRates = [[q, p], [p + 1, q], [p - 1, q], [p, q + 1], [p * 2, q]]
    .filter(([pp, qq]) => pp >= 1 && qq >= 1 && rateKey(pp, qq) !== truth);
  // plausible wrong starts: the neighbouring grid lines, or the rate mistaken for the start
  const wrongStarts = [b + yStep, b - yStep, p].filter(v => v >= 1 && v !== b);

  // candidate wrong statements: wrong rate / wrong start / both
  const candidates = [];
  wrongRates.forEach(([pp, qq]) => candidates.push([b, pp, qq]));
  wrongStarts.forEach(bb => candidates.push([bb, p, q]));
  wrongStarts.slice(0, 2).forEach(bb => wrongRates.slice(0, 2).forEach(([pp, qq]) => candidates.push([bb, pp, qq])));

  const texts = new Set();
  const correct = statement(ctx, b, p, q);
  texts.add(correct);
  const wrong = [];
  // shuffle, then take three distinct statements
  candidates.sort(() => Math.random() - 0.5);
  for (const [bb, pp, qq] of candidates) {
    const t = statement(ctx, bb, pp, qq);
    if (!texts.has(t)) { texts.add(t); wrong.push(t); }
    if (wrong.length === 3) break;
  }
  if (wrong.length < 3) return generateGraphInterpret();   // very rare: try another line

  const options = [correct, ...wrong];
  options.sort(() => Math.random() - 0.5);

  const { x1, y1 } = ratePoints(line);
  const yv = ctx.y, xv = ctx.x;

  return {
    kind: 'choice',
    text: ctx.intro,
    question: TEXTS.practice.whichTrue,
    graph: graphSpec(ctx, line),
    options,
    answer: options.indexOf(correct),
    steps: [
      { explanation: `Find the starting value: it is where the line meets the vertical axis, at $${xv} = 0$.`,
        math: `${yv}(0) = ${b}` },
      { explanation: `Find the rate of change: take two points on the line and divide the change in $${yv}$ by the change in $${xv}$.`,
        math: `\\dfrac{${y1} - ${b}}{${x1} - 0} = \\dfrac{${y1 - b}}{${x1}} = ${latexFrac(y1 - b, x1)}` },
      { explanation: `So the true statement is: "${correct}"`, math: '' },
    ]
  };
}


/**
 * The equation of a line, as LaTeX. up: S = 5w + 45 (or 45 + 5w); down: B = 80 - 5h (or -5h + 80).
 */
function equationLatex(ctx, a, b) {
  const y = ctx.y, x = ctx.x;
  const flip = randInt(1, 2) === 1;
  if (ctx.dir === 'up') return flip ? `${y} = ${b} + ${a}${x}` : `${y} = ${a}${x} + ${b}`;
  return flip ? `${y} = -${a}${x} + ${b}` : `${y} = ${b} - ${a}${x}`;
}

const capitalize = t => t.charAt(0).toUpperCase() + t.slice(1);

/**
 * A story with an equation, e.g. S = 5w + 45. Questions: the change over a period, a value,
 * the time to reach a value, the start, or what one of the numbers means.
 */
function generateFunctionEquation() {
  const ctx  = pickContext('equation');
  const down = ctx.dir === 'down';
  const sign = down ? -1 : 1;
  const cap  = ctx.cap || Infinity;

  // a ≠ b ("what does the number ... mean" must be unambiguous); values stay within the story's cap
  let a, b, xEnd;
  do {
    a    = randInt(2, Math.max(2, ctx.maxRate || 9));
    xEnd = randInt(8, 16);                               // the range of times we ask about
    b    = down ? a * xEnd + randInt(2, 15) : randInt(5, 60);
  } while (b === a || Math.max(b, b + sign * a * xEnd) > cap);
  const f = x => b + sign * a * x;
  const y = ctx.y, x = ctx.x;

  const eq   = equationLatex(ctx, a, b);
  const text = `${ctx.eqIntro} $$${eq}$$`;
  const base = { text };

  // the equation with a value put in
  const asRate = down ? `${b} - ${a}${x}` : `${a}${x} + ${b}`;

  const type = pick(['rateOver', 'rateOver', 'rateOver', 'valueAt', 'valueAt', 'timeAt', 'timeAt', 'start', 'meaning', 'meaning']);

  if (type === 'rateOver') {
    // a shrinking quantity cannot change by more than it has: keep a·k within the start value
    const k = pick([5, 10, 12, 15, 20, 30].filter(v => a * v <= (down ? b : cap)));
    const tS = ctx.unit[0], tP = ctx.unit[1];
    return { ...base, kind: 'value', question: ctx.askRateOver(k), answer: a * k, steps: [
      { explanation: `The rate of change is the number multiplying $${x}$: ${a} ${ctx.yUnit} per ${tS}${down ? ' (it is subtracted, so the quantity decreases)' : ''}. To find the change over ${k} ${tP}, multiply the rate by ${k}.`,
        math: `${a}\\,\\dfrac{\\text{${ctx.yUnit}}}{\\text{${tS}}} \\cdot ${k}\\,\\text{${tP}} = ${a * k}\\,\\text{${ctx.yUnit}}` },
    ] };
  }

  if (type === 'valueAt') {
    const x0 = randInt(2, down ? xEnd - 1 : xEnd);
    const y0 = f(x0);
    return { ...base, kind: 'value', question: ctx.askValue(x0), answer: y0, steps: [
      { explanation: `Substitute $${x} = ${x0}$ into the equation.`,
        math: down
          ? `${y} = ${b} - ${a} \\cdot ${x0} = ${b} - ${a * x0} = ${y0}`
          : `${y} = ${a} \\cdot ${x0} + ${b} = ${a * x0} + ${b} = ${y0}` },
    ] };
  }

  if (type === 'timeAt') {
    const x0 = randInt(2, down ? xEnd - 1 : xEnd);
    const y0 = f(x0);
    return { ...base, kind: 'value', question: ctx.askTime(y0), answer: x0, steps: [
      { explanation: `Put ${y0} in place of $${y}$.`,
        math: `${y0} = ${asRate}` },
      down
        ? { explanation: `Move the term with $${x}$ to the left side and the numbers to the right side.`,
            math: `${a}${x} = ${b - y0}` }
        : { explanation: TEXTS.solution.subtract(b), math: `${a}${x} = ${y0 - b}` },
      { explanation: TEXTS.solution.divide(a), math: `${x} = ${x0}` },
    ] };
  }

  if (type === 'start') {
    return { ...base, kind: 'value', question: ctx.askStart, answer: b, steps: [
      { explanation: `The starting value is the value at the beginning, when $${x} = 0$.`,
        math: down ? `${y} = ${b} - ${a} \\cdot 0 = ${b}` : `${y} = ${a} \\cdot 0 + ${b} = ${b}` },
    ] };
  }

  // meaning: what does a (or b) stand for?
  const askRate = randInt(1, 2) === 1;
  const number  = askRate ? a : b;
  const correct = capitalize(askRate ? ctx.rateMeaning : ctx.startMeaning);
  const wrong = [
    capitalize(askRate ? ctx.startMeaning : ctx.rateMeaning),
    `The number of ${ctx.unit[1]} that have passed`,
    `${capitalize(ctx.noun)} after one ${ctx.unit[0]}`,
  ];
  const options = [correct, ...wrong];
  options.sort(() => Math.random() - 0.5);

  return { ...base, kind: 'choice',
    question: `What does the number ${number} in the equation tell us?`,
    options, answer: options.indexOf(correct),
    steps: [
      { explanation: `In a linear equation the number that multiplies $${x}$ is the rate of change: how much the quantity changes each ${ctx.unit[0]}. The number on its own is the starting value: the value when $${x} = 0$.`,
        math: '' },
      { explanation: `So ${number} is: "${correct.charAt(0).toLowerCase()}${correct.slice(1)}".`, math: '' },
    ] };
}

// ─── register with the shared generator table (defined in equations.js) ──────
Object.assign(GENERATORS, {
  'graph-value':     generateGraphValue,
  'func-equation':   generateFunctionEquation,
  'graph-interpret': generateGraphInterpret,
});
