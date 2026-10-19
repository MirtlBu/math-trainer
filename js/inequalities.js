/**
 * inequalities.js
 * Generators for inequality problems. Each returns
 *   { kind: 'intervals', latex, answer, steps }
 *   answer — array of intervals (see intervals.js); the practice screen shows one
 *            input per interval
 *
 * Load after equations.js (random helpers, GENERATORS registry), intervals.js, texts.js and
 * polynomial-equations.js (the polynomial builders shared with the equations).
 */

// ─── helpers ──────────────────────────────────────────────────────────────────

/** The four comparison signs. dir: which way the inequality points, strict: no equality */
const INEQUALITY_SIGNS = [
  { tex: '>',     dir: 'gt', strict: true  },
  { tex: '<',     dir: 'lt', strict: true  },
  { tex: '\\ge',  dir: 'gt', strict: false },
  { tex: '\\le',  dir: 'lt', strict: false },
];

/** The sign you get when both sides are multiplied/divided by a negative number */
function flipSign(sign) {
  return INEQUALITY_SIGNS.find(s => s.dir !== sign.dir && s.strict === sign.strict);
}

/** The interval x ⟨sign⟩ value, e.g. x ≥ 4 → [4, ∞) */
function intervalFromSign(sign, value) {
  return sign.dir === 'gt'
    ? { lo: value,     loIncl: !sign.strict, hi: Infinity, hiIncl: false }
    : { lo: -Infinity, loIncl: false,        hi: value,    hiIncl: !sign.strict };
}

function randomSign() {
  return INEQUALITY_SIGNS[randInt(0, INEQUALITY_SIGNS.length - 1)];
}

/**
 * Sign analysis for  (polynomial) ⟨sign⟩ 0  with the distinct real roots given ascending.
 * To the right of the largest root the polynomial has the sign of its leading coefficient,
 * and the sign flips at every root. Returns the answer intervals and the sign table.
 */
function signAnalysis(roots, leadPositive, sign) {
  const n = roots.length;
  const parts = [];
  for (let k = 0; k <= n; k++) {
    parts.push({
      lo: k === 0 ? -Infinity : roots[k - 1],
      hi: k === n ?  Infinity : roots[k],
      positive: ((n - k) % 2 === 0) === leadPositive,
    });
  }

  const wantPositive = sign.dir === 'gt';
  const answer = parts
    .filter(p => p.positive === wantPositive)
    .map(p => ({
      lo: p.lo, hi: p.hi,
      loIncl: !sign.strict && p.lo !== -Infinity,
      hiIncl: !sign.strict && p.hi !==  Infinity,
    }));

  const table =
    `\\begin{array}{c|${'c'.repeat(n + 1)}} x & ` +
    parts.map(p => `(${boundLatex(p.lo)}, ${boundLatex(p.hi)})`).join(' & ') +
    ` \\\\ \\hline \\text{sign} & ` +
    parts.map(p => (p.positive ? '+' : '-')).join(' & ') +
    ` \\end{array}`;

  return { answer, table, wantPositive };
}

// ─── generators ───────────────────────────────────────────────────────────────

/** ax + b ⟨sign⟩ c   e.g. 3x − 5 > 7 → x > 4 ; −2x + 1 ≤ 9 → x ≥ −4 (the sign flips) */
function generateInequalityLinear() {
  const sign = randomSign();
  const x0   = randNZ(10);                          // the boundary value of the answer
  const a    = randCoef(8);
  const b    = randInt(1, 3) === 1 ? 0 : randNZ(10); // sometimes no constant: one-step
  const c    = a * x0 + b;

  const resultSign = a > 0 ? sign : flipSign(sign);
  const answer     = [intervalFromSign(resultSign, x0)];

  const lhs   = coefX(a);
  const bStr  = b > 0 ? `+ ${b}` : `- ${Math.abs(b)}`;
  const latex = b === 0 ? `${lhs} ${sign.tex} ${c}` : `${lhs} ${bStr} ${sign.tex} ${c}`;

  const steps = [{ explanation: TEXTS.solution.originalInequality, math: latex }];

  if (b !== 0) {
    steps.push({
      explanation: b > 0 ? TEXTS.solution.subtract(b) : TEXTS.solution.add(Math.abs(b)),
      math: `${lhs} ${sign.tex} ${c - b}`
    });
  }

  steps.push({
    explanation: a > 0 ? TEXTS.solution.divide(a) : TEXTS.solution.divideNegative(a),
    math: `\\dfrac{${lhs}}{${a}} ${resultSign.tex} \\dfrac{${c - b}}{${a}}`
  });

  steps.push({
    explanation: TEXTS.solution.simplify,
    math: `x ${resultSign.tex} ${x0} \\quad\\Rightarrow\\quad x \\in ${intervalsToLatex(answer)}`
  });

  return { kind: 'intervals', latex, answer, steps };
}

/** Product of 2 or 3 linear factors compared with 0, e.g. x(x + 2)(x + 3) > 0 */
function generateInequalityProduct() {
  const n     = randInt(2, 3);
  const roots = pickDistinct(n, -6, 6);
  const sign  = randomSign();

  // a factor "x" (root 0) goes first, the others in order of their roots
  const factors = roots.filter(r => r === 0).concat(roots.filter(r => r !== 0)).map(r => factorLatex(r));
  const latex   = `${factors.join('')} ${sign.tex} 0`;

  const { answer, table, wantPositive } = signAnalysis(roots, true, sign);

  return {
    kind: 'intervals',
    latex,
    answer,
    steps: [
      { explanation: TEXTS.solution.originalInequality, math: latex },
      { explanation: TEXTS.solution.findRoots,          math: rootsListLatex(roots) },
      { explanation: TEXTS.solution.signTable(true),    math: table },
      {
        explanation: TEXTS.solution.pickIntervals(wantPositive, sign.strict),
        math: `x \\in ${intervalsToLatex(answer)}`
      },
    ]
  };
}

/**
 * Inequality  polynomial ⟨sign⟩ 0  built from one of the shared polynomial builders:
 * find the roots (the builder's steps), then the sign table.
 */
function inequalityFromBuilder(builder) {
  const sign  = randomSign();
  const latex = `${builder.expr} ${sign.tex} 0`;
  const { answer, table, wantPositive } = signAnalysis(builder.roots, builder.leadPositive, sign);

  const steps = [
    { explanation: TEXTS.solution.originalInequality, math: latex },
    { explanation: TEXTS.solution.findZeros,          math: `${builder.expr} = 0` },
    ...builder.steps,
  ];
  if (builder.note) steps.push(builder.note);
  steps.push({ explanation: TEXTS.solution.signTable(builder.leadPositive), math: table });
  steps.push({
    explanation: TEXTS.solution.pickIntervals(wantPositive, sign.strict),
    math: `x \\in ${intervalsToLatex(answer)}`
  });

  return { kind: 'intervals', latex, answer, steps };
}

/** ax² + bx + c ⟨sign⟩ 0, e.g. x² − 5x + 6 < 0 or −x² + 4x + 5 ≥ 0 */
function generateInequalityQuadratic() {
  const a = pick([1, 1, 1, 2, 3, -1, -1, -2]);
  const [p, q] = pickDistinct(2, -8, 8);
  return inequalityFromBuilder(polyQuadratic(a, p, q));
}

/** x³ + 5x² + 6x > 0  or  x³ − 3x² − 4x + 12 ≤ 0 */
function generateInequalityCubic()   { return inequalityFromBuilder(randomCubicBuilder()); }

/** x⁴ − 5x² + 4 ≤ 0  or  x⁴ − 81 > 0 */
function generateInequalityQuartic() { return inequalityFromBuilder(randomQuarticBuilder()); }

// ─── register with the shared generator table (defined in equations.js) ──────
Object.assign(GENERATORS, {
  'ineq-linear':    generateInequalityLinear,
  'ineq-product':   generateInequalityProduct,
  'ineq-quadratic': generateInequalityQuadratic,
  'ineq-cubic':     generateInequalityCubic,
  'ineq-quartic':   generateInequalityQuartic,
});
