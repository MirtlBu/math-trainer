/**
 * fraction-equations.js
 * Equations with fractions: multiply every term by the lowest common denominator to clear them.
 *
 *   frac-simple    x/2 + x/3 = 5,  x/3 + 2 = 7,  3x/4 = 9 …           (numbers in the denominators)
 *   frac-linear    (x + 1)/3 = (x − 2)/4,  x/2 − 3 = x/4 + 1,  x/2 + 1/3 = 5/6 …
 *   frac-rational  a/x = b/(x + c),  a/x + b/c = d/x,  x + a/x = b   (x in a denominator: x ≠ 0)
 *
 * The solution is chosen first (an integer x*), then the equation is built around it, so the
 * answer is always a whole number. Problems: { kind: 'solve', latex, answer, steps }, or
 * { kind: 'numbers', … } for the quadratic rational equation (two roots).
 *
 * Load after equations.js (random helpers), polynomial-equations.js (pick, quadraticSolveSteps,
 * rootsListLatex) and numbers.js (gcdInt, reduceFraction).
 */

// ─── terms ────────────────────────────────────────────────────────────────────

const lcm = (a, b) => a / gcdInt(a, b) * b;

/**
 * One term of a side: s·(a·x + b) / den.   den = 1 means "no fraction" (a plain number b).
 *   fracTerm(1, 0, 3)   →  x/3        fracTerm(1, 5, 2) → (x + 5)/2        fracTerm(0, 1, 6) → 1/6
 */
const fracTerm = (a, b, den, s = 1) => ({ s, a, b, den });
// a negative number is written as a subtracted positive one, so no "- -3" appears
const numTerm = (b, s = 1) => (b < 0 ? { s: -s, a: 0, b: -b, den: 1 } : { s, a: 0, b, den: 1 });

/** ax + b as LaTeX: x, 2x, x + 5, 3x - 4, 7 */
function numeratorLatex(a, b) {
  const xPart = a === 1 ? 'x' : `${a}x`;
  if (a === 0) return `${b}`;
  if (b === 0) return xPart;
  return `${xPart} ${b > 0 ? '+' : '-'} ${Math.abs(b)}`;
}

const termBody = t => (t.den === 1 ? numeratorLatex(t.a, t.b) : `\\dfrac{${numeratorLatex(t.a, t.b)}}{${t.den}}`);

/** A side as LaTeX: x/2 + x/3,  (x + 1)/3 - 2 */
function sideLatex(terms) {
  return terms.map((t, i) => {
    const lead = i === 0 ? (t.s < 0 ? '-' : '') : (t.s < 0 ? ' - ' : ' + ');
    return lead + termBody(t);
  }).join('');
}

/** The lowest common denominator of all the fractions on both sides */
function commonDenominator(left, right) {
  return [...left, ...right].reduce((m, t) => lcm(m, t.den), 1);
}

/** 12 · x/2 + 12 · x/3 = 12 · 5 : every term multiplied by m */
function multiplyAllLatex(terms, m) {
  return terms.map((t, i) => {
    const lead = i === 0 ? (t.s < 0 ? '-' : '') : (t.s < 0 ? ' - ' : ' + ');
    const body = t.den === 1 ? (t.b < 0 ? `(${t.b})` : `${t.b}`) : termBody(t);
    return `${lead}${m} \\cdot ${body}`;
  }).join('');
}

/**
 * The terms after multiplying by m and cancelling the denominators: 6x + 4x,  4(x + 1) - 3(x - 2).
 * Returns the LaTeX and whether brackets were used (then a "multiply out" step follows).
 */
function clearedLatex(terms, m) {
  let brackets = false;
  const text = terms.map((t, i) => {
    const f = t.den === 1 ? m : m / t.den;
    const lead = i === 0 ? (t.s < 0 ? '-' : '') : (t.s < 0 ? ' - ' : ' + ');
    let body;
    if (t.den === 1) {
      body = `${m * t.b}`;
    } else if (t.a !== 0 && t.b !== 0) {                       // a two-term numerator
      const inner = numeratorLatex(t.a, t.b);
      if (f > 1)               { body = `${f}(${inner})`; brackets = true; }
      else if (i > 0 || t.s < 0) { body = `(${inner})`;      brackets = true; }
      else                       body = inner;
    } else {
      body = numeratorLatex(f * t.a, f * t.b);                  // a single term: just multiply
    }
    return lead + body;
  }).join('');
  return { text, brackets };
}

/** a·x + b of a whole side after clearing and multiplying out */
function expandedSide(terms, m) {
  let A = 0, B = 0;
  terms.forEach(t => {
    const f = t.den === 1 ? m : m / t.den;
    A += t.s * f * t.a;
    B += t.s * f * (t.den === 1 ? t.b : t.b);
  });
  return { A, B };
}

const linearSide = (A, B) => {
  if (A === 0) return `${B}`;
  const x = A === 1 ? 'x' : A === -1 ? '-x' : `${A}x`;
  if (B === 0) return x;
  return `${x} ${B > 0 ? '+' : '-'} ${Math.abs(B)}`;
};

// ─── the solution steps for an equation with constant denominators ────────────

function fractionSolutionSteps(left, right, xStar) {
  const latex = `${sideLatex(left)} = ${sideLatex(right)}`;
  const dens  = [...new Set([...left, ...right].map(t => t.den).filter(d => d > 1))].sort((p, q) => p - q);
  const m     = commonDenominator(left, right);

  const steps = [
    { explanation: TEXTS.fractions.original, math: latex },
    { explanation: TEXTS.fractions.lcd(dens, m), math: `\\text{LCD}(${dens.join(', ')}) = ${m}` },
    { explanation: TEXTS.fractions.multiplyAll(m), math: `${multiplyAllLatex(left, m)} = ${multiplyAllLatex(right, m)}` },
  ];

  const L = clearedLatex(left, m), Rr = clearedLatex(right, m);
  steps.push({ explanation: TEXTS.fractions.cancel, math: `${L.text} = ${Rr.text}` });

  const l = expandedSide(left, m), r = expandedSide(right, m);
  if (L.brackets || Rr.brackets) {
    steps.push({ explanation: TEXTS.fractions.expand, math: `${linearSide(l.A, l.B)} = ${linearSide(r.A, r.B)}` });
  }

  // collect: (A1 − A2)x = B2 − B1
  const C = l.A - r.A, D = r.B - l.B;
  const collected = `${linearSide(C, 0)} = ${D}`;
  const last = steps[steps.length - 1].math;
  if (last !== collected) steps.push({ explanation: TEXTS.fractions.collect, math: collected });
  if (C !== 1) steps.push({ explanation: TEXTS.solution.divide(C), math: `x = ${xStar}` });

  return { latex, steps };
}

/**
 * Build the problem object from the two sides and the chosen solution.
 * Returns null when the equation is degenerate: the x terms cancel completely (an identity such as
 * x/3 + x/6 - x/2 = 0 that every x satisfies), so the caller must try again.
 */
function fractionProblem(left, right, xStar) {
  const m = commonDenominator(left, right);
  const l = expandedSide(left, m), r = expandedSide(right, m);
  if (l.A - r.A === 0) return null;

  const { latex, steps } = fractionSolutionSteps(left, right, xStar);
  return { kind: 'solve', latex, answer: xStar, steps };
}

/** Run a generator until it gives a valid problem (it returns null for degenerate ones) */
function untilValid(generate) {
  return () => {
    for (let i = 0; i < 100; i++) {
      const problem = generate();
      if (problem) return problem;
    }
    throw new Error('fraction-equations: no valid problem found');
  };
}

// ─── level 1: constant denominators, simple ───────────────────────────────────

const nonZeroInt = (lo, hi) => { let n; do { n = randInt(lo, hi); } while (n === 0); return n; };

function generateFractionSimple() {
  const type = pick(['two', 'two', 'plus', 'times', 'three', 'minus']);
  const dens = (count) => { const out = []; while (out.length < count) { const d = randInt(2, 9); if (!out.includes(d)) out.push(d); } return out; };

  if (type === 'plus') {                                       // x/a + p = q
    const a = randInt(2, 9), t = nonZeroInt(-8, 8), p = nonZeroInt(-9, 9);
    return fractionProblem([fracTerm(1, 0, a), numTerm(p)], [numTerm(t + p)], a * t);
  }
  if (type === 'times') {                                      // kx/a = c
    const a = randInt(2, 9), k = randInt(2, 5);
    if (gcdInt(a, k) !== 1) return null;
    const t = nonZeroInt(-6, 6), xStar = a * t;
    return fractionProblem([fracTerm(k, 0, a)], [numTerm(k * t)], xStar);
  }
  if (type === 'two') {                                        // x/a + x/b = c
    const [a, b] = dens(2);
    const xStar = lcm(a, b) * nonZeroInt(-3, 3);
    return fractionProblem([fracTerm(1, 0, a), fracTerm(1, 0, b)], [numTerm(xStar / a + xStar / b)], xStar);
  }
  if (type === 'minus') {                                      // x/a - x/b = c
    const [a, b] = dens(2).sort((p, q) => p - q);              // a < b, so the difference is positive for x > 0
    const xStar = lcm(a, b) * nonZeroInt(-3, 3);
    return fractionProblem([fracTerm(1, 0, a), fracTerm(1, 0, b, -1)], [numTerm(xStar / a - xStar / b)], xStar);
  }
  // three fractions: x/a + x/b - x/c = d
  const [a, b, c] = dens(3);
  const L = lcm(lcm(a, b), c);
  const xStar = L * nonZeroInt(-2, 2);
  const d = xStar / a + xStar / b - xStar / c;
  return fractionProblem([fracTerm(1, 0, a), fracTerm(1, 0, b), fracTerm(1, 0, c, -1)], [numTerm(d)], xStar);
}

// ─── level 2: numerators with brackets, x on both sides, fraction constants ───

function generateFractionLinear() {
  const type = pick(['equalBrackets', 'sumBrackets', 'bothSides', 'coefficients', 'constants', 'sumBrackets']);

  if (type === 'equalBrackets') {                              // (x + p)/a = (x + q)/b
    let a, b;
    do { a = randInt(2, 9); b = randInt(2, 9); } while (a === b);
    const u = nonZeroInt(-5, 5), xStar = nonZeroInt(-9, 9);
    const p = a * u - xStar, q = b * u - xStar;
    return fractionProblem([fracTerm(1, p, a)], [fracTerm(1, q, b)], xStar);
  }

  if (type === 'sumBrackets') {                                // (x + p)/a ± (x + q)/b = c
    const a = randInt(2, 8), b = randInt(2, 8);
    const s = pick([1, -1]);
    const u = nonZeroInt(-6, 6), v = nonZeroInt(-6, 6), xStar = nonZeroInt(-9, 9);
    const c = u + s * v;
    if (c === 0) return null;
    return fractionProblem([fracTerm(1, a * u - xStar, a), fracTerm(1, b * v - xStar, b, s)], [numTerm(c)], xStar);
  }

  if (type === 'bothSides') {                                  // x/a - p = x/b + q
    let a, b;
    do { a = randInt(2, 9); b = randInt(2, 9); } while (a === b);
    const xStar = lcm(a, b) * nonZeroInt(-3, 3);
    const total = xStar / a - xStar / b;                       // p + q
    const p = nonZeroInt(-8, 8), q = total - p;
    if (q === 0) return null;
    return fractionProblem([fracTerm(1, 0, a), numTerm(p, -1)], [fracTerm(1, 0, b), numTerm(q)], xStar);
  }

  if (type === 'coefficients') {                               // 2x/3 - 3x/4 = c
    let a, b;
    do { a = randInt(2, 9); b = randInt(2, 9); } while (a === b);
    const k = randInt(2, 5), m = randInt(2, 5);
    if (gcdInt(k, a) !== 1 || gcdInt(m, b) !== 1) return null;   // 5x/5 would just be x
    const xStar = lcm(a, b) * nonZeroInt(-3, 3);
    const c = k * xStar / a - m * xStar / b;
    if (c === 0) return null;
    return fractionProblem([fracTerm(k, 0, a), fracTerm(m, 0, b, -1)], [numTerm(c)], xStar);
  }

  // fraction constants: x/a + p/b = c/d
  const a = randInt(2, 8), b = randInt(2, 8);
  const xStar = a * nonZeroInt(-4, 4);
  const p = nonZeroInt(-7, 7);
  const r = reduceFraction(xStar * b + p * a, a * b);           // x*/a + p/b
  if (r.den === 1 || r.num === 0 || gcdInt(Math.abs(p), b) !== 1) return null;
  const rhs = r.num < 0 ? fracTerm(0, -r.num, r.den, -1) : fracTerm(0, r.num, r.den);
  return fractionProblem([fracTerm(1, 0, a), fracTerm(0, Math.abs(p), b, p < 0 ? -1 : 1)], [rhs], xStar);
}

// ─── level 3: x in a denominator ──────────────────────────────────────────────

const xPlus = c => (c > 0 ? `x + ${c}` : `x - ${-c}`);

function generateFractionRational() {
  const type = pick(['proportion', 'proportion', 'sameX', 'quadratic']);

  if (type === 'proportion') {                                  // a/x = b/(x + c)
    let a, b;
    do { a = randInt(1, 9); b = randInt(1, 9); } while (a === b);
    const t = nonZeroInt(-5, 5);
    const xStar = a * t, c = t * (b - a);
    const latex = `\\dfrac{${a}}{x} = \\dfrac{${b}}{${xPlus(c)}}`;
    const coefficient = b - a, rest = a * c;
    return {
      kind: 'solve', latex, answer: xStar,
      steps: [
        { explanation: TEXTS.fractions.original, math: latex },
        { explanation: TEXTS.fractions.domain, math: `x \\neq 0, \\quad x \\neq ${-c}` },
        { explanation: TEXTS.fractions.multiplyByDenominators, math: `${a}(${xPlus(c)}) = ${b}x` },
        { explanation: TEXTS.fractions.expand, math: `${a}x ${c >= 0 ? '+' : '-'} ${Math.abs(a * c)} = ${b}x` },
        { explanation: TEXTS.fractions.collect, math: `${linearSide(coefficient, 0)} = ${rest}` },
        { explanation: TEXTS.solution.divide(coefficient), math: `x = ${xStar}` },
        { explanation: TEXTS.fractions.checkDomain, math: `x = ${xStar}` },
      ],
    };
  }

  if (type === 'sameX') {                                       // a/x + b/c = d/x
    const c = randInt(2, 9), b = randInt(1, 9), a = randInt(1, 9);
    const t = nonZeroInt(-5, 5), xStar = c * t;
    const d = a + b * t;
    if (d === 0) return generateFractionRational();
    const latex = `\\dfrac{${a}}{x} + \\dfrac{${b}}{${c}} = \\dfrac{${d}}{x}`;
    return {
      kind: 'solve', latex, answer: xStar,
      steps: [
        { explanation: TEXTS.fractions.original, math: latex },
        { explanation: TEXTS.fractions.domain, math: `x \\neq 0` },
        { explanation: TEXTS.fractions.lcdWithX(`${c}x`),
          math: `${c}x \\cdot \\dfrac{${a}}{x} + ${c}x \\cdot \\dfrac{${b}}{${c}} = ${c}x \\cdot \\dfrac{${d}}{x}` },
        { explanation: TEXTS.fractions.cancel, math: `${a * c} + ${b}x = ${d * c}` },
        { explanation: TEXTS.solution.subtract(a * c), math: `${b}x = ${d * c - a * c}` },
        { explanation: TEXTS.solution.divide(b), math: `x = ${xStar}` },
        { explanation: TEXTS.fractions.checkDomain, math: `x = ${xStar}` },
      ],
    };
  }

  // x + a/x = b  →  x² − bx + a = 0  with the two roots p and q
  let p, q;
  do { p = nonZeroInt(-9, 9); q = nonZeroInt(-9, 9); } while (p === q);
  const [lo, hi] = p < q ? [p, q] : [q, p];
  const a = p * q, b = p + q;
  const fraction = a < 0 ? `- \\dfrac{${-a}}{x}` : `+ \\dfrac{${a}}{x}`;
  const latex = `x ${fraction} = ${b}`;
  const quadratic = `x^2 ${b > 0 ? '-' : '+'} ${Math.abs(b)}x ${a > 0 ? '+' : '-'} ${Math.abs(a)} = 0`;
  return {
    kind: 'numbers', latex, answer: [lo, hi],
    steps: [
      { explanation: TEXTS.fractions.original, math: latex },
      { explanation: TEXTS.fractions.domain, math: `x \\neq 0` },
      { explanation: TEXTS.fractions.multiplyByX,
        math: `x \\cdot x ${a < 0 ? '-' : '+'} x \\cdot \\dfrac{${Math.abs(a)}}{x} = ${b} \\cdot x` },
      { explanation: TEXTS.fractions.cancel, math: `x^2 ${a < 0 ? '-' : '+'} ${Math.abs(a)} = ${b === 0 ? '0' : `${b}x`}` },
      ...(b === 0 ? [] : [{ explanation: TEXTS.solution.moveAllLeft, math: quadratic }]),
      ...quadraticSolveSteps(1, -b, a, [lo, hi]),
      { explanation: TEXTS.solution.rootsAre, math: rootsListLatex([lo, hi]) },
      { explanation: TEXTS.fractions.bothAllowed, math: `x \\neq 0` },
    ],
  };
}

// ─── register with the shared generator table (defined in equations.js) ──────
Object.assign(GENERATORS, {
  'frac-simple':   untilValid(generateFractionSimple),
  'frac-linear':   untilValid(generateFractionLinear),
  'frac-rational': generateFractionRational,
});
