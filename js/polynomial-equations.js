/**
 * polynomial-equations.js
 * Quadratic, cubic and quartic equations.
 *
 * The "builders" (polyQuadratic, polyCubicFactorX, ...) describe one polynomial with
 * integer roots and the steps that find those roots. They are shared: the equation
 * generators below solve  expr = 0,  and inequalities.js uses the same builders to find
 * where  expr > 0 / < 0.
 *
 * A builder returns
 *   { expr, leadPositive, roots, steps, note? }
 *   expr         LaTeX of the polynomial, e.g. "x^3 + 5x^2 + 6x"
 *   leadPositive is the leading coefficient positive?
 *   roots        distinct real roots, ascending
 *   steps        [{explanation, math}] from "expr = 0" down to the list of roots
 *   note         optional extra step for inequalities (a factor that is always positive)
 *
 * Equation generators return { kind: 'numbers', latex, answer, steps }.
 * Load after equations.js and polynomial.js.
 */

// ─── helpers ──────────────────────────────────────────────────────────────────

function pick(list) {
  return list[randInt(0, list.length - 1)];
}

/** n distinct integers from [lo, hi] (optionally without 0), ascending */
function pickDistinct(n, lo, hi, allowZero = true) {
  const pool = [];
  for (let r = lo; r <= hi; r++) if (allowZero || r !== 0) pool.push(r);
  const out = [];
  while (out.length < n) out.push(pool.splice(randInt(0, pool.length - 1), 1)[0]);
  return out.sort((p, q) => p - q);
}

/** Negative numbers in brackets: -3 → (-3) */
function numP(n) {
  return n < 0 ? `(${n})` : `${n}`;
}

/** Linear factor with root r: (x - 3), (x + 2) or just x (v is the variable name) */
function factorLatex(r, v = 'x') {
  if (r === 0) return v;
  return r > 0 ? `(${v} - ${r})` : `(${v} + ${-r})`;
}

/** mx - k without brackets: 2x - 3, x + 4, 3x */
function linearLatex(m, k) {
  if (k === 0) return coefX(m);
  return `${coefX(m)} ${k > 0 ? '-' : '+'} ${Math.abs(k)}`;
}

/** x = -3,  x = 2  (v is the variable name) */
function rootsListLatex(roots, v = 'x') {
  return roots.map(r => `${v} = ${r}`).join(',\\; ');
}

const uniqueAscending = list => [...new Set(list)].sort((p, q) => p - q);

// ─── steps for ax² + bx + c = 0 ───────────────────────────────────────────────

/**
 * Steps that solve ax² + bx + c = 0 when the roots are the integers p ≤ q.
 * Monic: two numbers with the given sum and product, then the factored form.
 * Otherwise: discriminant and the quadratic formula.
 * The list of roots is NOT included; callers add it (v = variable name).
 */
function quadraticSolveSteps(a, b, c, roots, v = 'x') {
  const [p, q] = roots;
  const steps = [];

  if (a === 1) {
    steps.push({
      explanation: TEXTS.solution.vieta(-b, c),
      math: `${numP(p)} + ${numP(q)} = ${-b}, \\quad ${numP(p)} \\cdot ${numP(q)} = ${c}`
    });
    steps.push({
      explanation: TEXTS.solution.factorQuadratic,
      math: p === q
        ? `${factorLatex(p, v)}^2 = 0`
        : `${factorLatex(p, v)}${factorLatex(q, v)} = 0`
    });
  } else {
    const D     = b * b - 4 * a * c;
    const sqrtD = Math.round(Math.sqrt(D));
    steps.push({
      explanation: TEXTS.solution.discriminant,
      math: `D = b^2 - 4ac = ${numP(b)}^2 - 4 \\cdot ${numP(a)} \\cdot ${numP(c)} = ${D}`
    });
    steps.push({
      explanation: TEXTS.solution.quadraticFormula,
      math: D === 0
        ? `${v} = \\dfrac{-b}{2a} = \\dfrac{${-b}}{${2 * a}}`
        : `${v} = \\dfrac{-b \\pm \\sqrt{D}}{2a} = \\dfrac{${-b} \\pm ${sqrtD}}{${2 * a}}`
    });
  }
  return steps;
}

// ─── builders ─────────────────────────────────────────────────────────────────

/** a(x − p)(x − q) expanded; p ≤ q (equal for a double root) */
function polyQuadratic(a, p, q) {
  const b = -a * (p + q);
  const c = a * p * q;
  const roots = uniqueAscending([p, q]);

  const steps = quadraticSolveSteps(a, b, c, [p, q]);
  steps.push({ explanation: TEXTS.solution.rootsAre, math: rootsListLatex(roots) });

  return { expr: polyToLatex({ 2: a, 1: b, 0: c }), leadPositive: a > 0, roots, steps, b, c };
}

/** x(x − p)(x − q) = x³ + bx² + cx, with p, q distinct and non-zero */
function polyCubicFactorX(p, q) {
  const b = -(p + q);
  const c = p * q;
  const inner = polyToLatex({ 2: 1, 1: b, 0: c });
  const roots = uniqueAscending([0, p, q]);

  const steps = [
    { explanation: TEXTS.solution.factorOutX,       math: `x(${inner}) = 0` },
    { explanation: TEXTS.solution.zeroProductQuad,  math: `x = 0 \\quad \\text{or} \\quad ${inner} = 0` },
    ...quadraticSolveSteps(1, b, c, [Math.min(p, q), Math.max(p, q)]),
    { explanation: TEXTS.solution.rootsAre,         math: rootsListLatex(roots) },
  ];

  return { expr: polyToLatex({ 3: 1, 2: b, 1: c }), leadPositive: true, roots, steps };
}

/** (x − r)(x² − k²) = x³ − rx² − k²x + rk², solved by grouping; r ≠ 0, r ≠ ±k */
function polyCubicGrouping(r, k) {
  const k2 = k * k;
  const roots = uniqueAscending([r, k, -k]);

  const steps = [
    { explanation: TEXTS.solution.groupTerms,
      math: `x^2${factorLatex(r)} - ${k2}${factorLatex(r)} = 0` },
    { explanation: TEXTS.solution.factorCommonBracket,
      math: `${factorLatex(r)}(x^2 - ${k2}) = 0` },
    { explanation: TEXTS.solution.diffSquares,
      math: `${factorLatex(r)}(x - ${k})(x + ${k}) = 0` },
    { explanation: TEXTS.solution.rootsAre, math: rootsListLatex(roots) },
  ];

  return {
    expr: polyToLatex({ 3: 1, 2: -r, 1: -k2, 0: r * k2 }),
    leadPositive: true, roots, steps
  };
}

/** (x² − p²)(x² − q²) = x⁴ − (p² + q²)x² + p²q², solved with t = x²; 0 < p < q */
function polyQuarticBiquadratic(p, q) {
  const p2 = p * p, q2 = q * q;
  const B = p2 + q2, C = p2 * q2;
  const roots = uniqueAscending([-q, -p, p, q]);

  const steps = [
    { explanation: TEXTS.solution.substitute,
      math: `t = x^2 \\quad\\Rightarrow\\quad t^2 - ${B}t + ${C} = 0` },
    ...quadraticSolveSteps(1, -B, C, [p2, q2], 't'),
    { explanation: TEXTS.solution.rootsAre, math: rootsListLatex([p2, q2], 't') },
    { explanation: TEXTS.solution.backToX,
      math: `x^2 = ${p2} \\quad \\text{or} \\quad x^2 = ${q2}` },
    { explanation: TEXTS.solution.rootsAre, math: rootsListLatex(roots) },
  ];

  return { expr: polyToLatex({ 4: 1, 2: -B, 0: C }), leadPositive: true, roots, steps };
}

/** x⁴ − k⁴ = (x² − k²)(x² + k²): only x = ±k are real */
function polyQuarticDifference(k) {
  const k2 = k * k;
  const roots = [-k, k];

  const steps = [
    { explanation: TEXTS.solution.diffSquares, math: `(x^2 - ${k2})(x^2 + ${k2}) = 0` },
    { explanation: TEXTS.solution.zeroProduct, math: `x^2 = ${k2} \\quad \\text{or} \\quad x^2 = -${k2}` },
    { explanation: TEXTS.solution.noRealRoots(k2), math: `x^2 = ${k2} \\quad\\Rightarrow\\quad x = \\pm ${k}` },
    { explanation: TEXTS.solution.rootsAre, math: rootsListLatex(roots) },
  ];

  return {
    expr: polyToLatex({ 4: 1, 0: -(k2 * k2) }),
    leadPositive: true, roots, steps,
    note: { explanation: TEXTS.solution.alwaysPositive(k2), math: `x^2 + ${k2} > 0` },
  };
}

/** A random cubic builder: factoring out x, or grouping */
function randomCubicBuilder() {
  if (randInt(1, 5) <= 3) {
    const [p, q] = pickDistinct(2, -7, 7, false);
    return polyCubicFactorX(p, q);
  }
  let r, k;
  do { r = randNZ(7); k = randInt(2, 6); } while (Math.abs(r) === k);
  return polyCubicGrouping(r, k);
}

/** A random quartic builder: biquadratic, or x⁴ − k⁴ */
function randomQuarticBuilder() {
  if (randInt(1, 10) <= 7) {
    const [p, q] = pickDistinct(2, 1, 6, false);
    return polyQuarticBiquadratic(p, q);
  }
  return polyQuarticDifference(randInt(2, 4));
}

// ─── equation generators ──────────────────────────────────────────────────────

/** A linear factor m·x − k with a rational root k/m (sometimes a fraction) */
function randomLinearFactor() {
  const m = pick([1, 1, 1, 1, 2, 3]);
  if (m === 1) return { m, k: randInt(-8, 8) };

  const wantFraction = randInt(1, 2) === 1;
  let k;
  do { k = randNZ(9); } while ((k % m === 0) === wantFraction);
  return { m, k };
}

const factorGroupLatex = f => (f.m === 1 && f.k === 0) ? 'x' : `(${linearLatex(f.m, f.k)})`;
const rootOfFactorLatex = f => f.k % f.m === 0 ? `${f.k / f.m}` : latexFrac(f.k, f.m);

/** (x − 2)(x + 5) = 0,  (2x − 3)(x + 1) = 0 */
function generateQuadFactored() {
  let f1, f2;
  do { f1 = randomLinearFactor(); f2 = randomLinearFactor(); } while (f1.k * f2.m === f2.k * f1.m);

  const latex = `${factorGroupLatex(f1)}${factorGroupLatex(f2)} = 0`;

  return {
    kind: 'numbers',
    latex,
    answer: [f1.k / f1.m, f2.k / f2.m],
    steps: [
      { explanation: TEXTS.solution.original, math: latex },
      { explanation: TEXTS.solution.zeroProduct,
        math: `${linearLatex(f1.m, f1.k)} = 0 \\quad \\text{or} \\quad ${linearLatex(f2.m, f2.k)} = 0` },
      { explanation: TEXTS.solution.solveEach,
        math: `x = ${rootOfFactorLatex(f1)} \\quad \\text{or} \\quad x = ${rootOfFactorLatex(f2)}` },
    ]
  };
}

/** x² = 49,  3x² = 48,  x² − 25 = 0,  3x² − 12x = 0 */
function generateQuadIncomplete() {
  const type = randInt(1, 4);
  const original = latex => ({ explanation: TEXTS.solution.original, math: latex });

  if (type === 4) {
    // ax² − arx = 0  →  ax(x − r) = 0
    const a = pick([1, 1, 2, 3]);
    const r = pick([-1, 1]) * randInt(2, 9);
    const latex = `${polyToLatex({ 2: a, 1: -a * r })} = 0`;
    return {
      kind: 'numbers',
      latex,
      answer: [0, r],
      steps: [
        original(latex),
        { explanation: TEXTS.solution.factorCommon, math: `${coefX(a)}${factorLatex(r)} = 0` },
        { explanation: TEXTS.solution.zeroProduct,
          math: `${coefX(a)} = 0 \\quad \\text{or} \\quad ${linearLatex(1, r)} = 0` },
        { explanation: TEXTS.solution.rootsAre, math: rootsListLatex(uniqueAscending([0, r])) },
      ]
    };
  }

  const k = randInt(2, 12);
  const d = k * k;
  const sqrtStep = {
    explanation: TEXTS.solution.sqrtBoth,
    math: `x = \\pm\\sqrt{${d}} = \\pm ${k}`
  };
  const roots = [-k, k];
  const done = { explanation: TEXTS.solution.rootsAre, math: rootsListLatex(roots) };

  if (type === 1) {
    const latex = `x^2 = ${d}`;
    return { kind: 'numbers', latex, answer: roots, steps: [original(latex), sqrtStep, done] };
  }

  if (type === 2) {
    const a = randInt(2, 5);
    const latex = `${a}x^2 = ${a * d}`;
    return {
      kind: 'numbers', latex, answer: roots,
      steps: [
        original(latex),
        { explanation: TEXTS.solution.divide(a), math: `x^2 = ${d}` },
        sqrtStep, done,
      ]
    };
  }

  const latex = `x^2 - ${d} = 0`;
  return {
    kind: 'numbers', latex, answer: roots,
    steps: [
      original(latex),
      { explanation: TEXTS.solution.add(d), math: `x^2 = ${d}` },
      sqrtStep, done,
    ]
  };
}

/** x² + 5x + 6 = 0,  2x² − 6x − 20 = 0,  x² + 5x = −6 */
function generateQuadGeneral() {
  const a = pick([1, 1, 1, 2, 3, -1, -2]);
  let p, q;
  if (randInt(1, 10) === 1) {
    p = q = randNZ(8);                                   // a double root
  } else {
    do { [p, q] = pickDistinct(2, -8, 8, false); } while (p + q === 0);
  }

  const b = polyQuadratic(a, p, q);
  const steps = [];

  // sometimes the constant is on the right: ax² + bx = −c
  if (randInt(1, 3) === 1) {
    const lhs = polyToLatex({ 2: a, 1: -a * (p + q) });
    const latex = `${lhs} = ${-a * p * q}`;
    steps.push({ explanation: TEXTS.solution.original,    math: latex });
    steps.push({ explanation: TEXTS.solution.moveAllLeft, math: `${b.expr} = 0` });
    return { kind: 'numbers', latex, answer: b.roots, steps: steps.concat(b.steps) };
  }

  const latex = `${b.expr} = 0`;
  steps.push({ explanation: TEXTS.solution.original, math: latex });
  return { kind: 'numbers', latex, answer: b.roots, steps: steps.concat(b.steps) };
}

function generateFromBuilder(builder) {
  const latex = `${builder.expr} = 0`;
  return {
    kind: 'numbers',
    latex,
    answer: builder.roots,
    steps: [{ explanation: TEXTS.solution.original, math: latex }, ...builder.steps]
  };
}

/** x³ + 5x² + 6x = 0  or  x³ − 3x² − 4x + 12 = 0 */
function generateCubic()   { return generateFromBuilder(randomCubicBuilder()); }

/** x⁴ − 5x² + 4 = 0  or  x⁴ − 81 = 0 */
function generateQuartic() { return generateFromBuilder(randomQuarticBuilder()); }

// ─── register with the shared generator table (defined in equations.js) ──────
Object.assign(GENERATORS, {
  'quad-factored':   generateQuadFactored,
  'quad-incomplete': generateQuadIncomplete,
  'quad-general':    generateQuadGeneral,
  'cubic':           generateCubic,
  'quartic':         generateQuartic,
});
