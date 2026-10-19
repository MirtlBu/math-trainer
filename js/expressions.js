/**
 * expressions.js
 * Generators for "expand and simplify" problems. Each returns
 *   { kind: 'simplify', latex, answer, steps }
 *   answer — polynomial { degree: coefficient } (see polynomial.js)
 *   steps  — array of { explanation: string, math: string }
 *
 * Load after equations.js (uses its random helpers and the GENERATORS registry)
 * and after polynomial.js.
 */

// ─── helpers ──────────────────────────────────────────────────────────────────

/** Put negative numbers/terms in brackets so products read correctly: -3x → (-3x) */
function wrapNeg(str) {
  return str.startsWith('-') ? `(${str})` : str;
}

/** ax + b as LaTeX: binomial(3, -2) → "3x - 2" */
function binomial(a, b) {
  return `${coefX(a)} ${b > 0 ? '+' : '-'} ${Math.abs(b)}`;
}

// ─── generators ───────────────────────────────────────────────────────────────

/** number · (bx + c)   e.g. 4 · (3x − 2) = 12x − 8 */
function generateExpandNumber() {
  const k = randCoef(9);
  const b = randNZ(9);
  const c = randNZ(9);

  const latex  = `${k} \\cdot (${binomial(b, c)})`;
  const answer = { 1: k * b, 0: k * c };

  return {
    kind: 'simplify',
    latex,
    answer,
    steps: [
      {
        explanation: TEXTS.solution.originalExpression,
        math: latex
      },
      {
        explanation: TEXTS.solution.distribute,
        math: `${wrapNeg(`${k}`)} \\cdot ${wrapNeg(coefX(b))} + ${wrapNeg(`${k}`)} \\cdot ${wrapNeg(`${c}`)}`
      },
      {
        explanation: TEXTS.solution.simplify,
        math: polyToLatex(answer)
      }
    ]
  };
}

/** kx · (bx + c)   e.g. 4x · (3x − 2) = 12x² − 8x */
function generateExpandMonomial() {
  const k = randCoef(6);
  const b = randNZ(6);
  const c = randNZ(9);

  const latex  = `${coefX(k)} \\cdot (${binomial(b, c)})`;
  const answer = { 2: k * b, 1: k * c };

  return {
    kind: 'simplify',
    latex,
    answer,
    steps: [
      {
        explanation: TEXTS.solution.originalExpression,
        math: latex
      },
      {
        explanation: TEXTS.solution.distribute,
        math: `${wrapNeg(coefX(k))} \\cdot ${wrapNeg(coefX(b))} + ${wrapNeg(coefX(k))} \\cdot ${wrapNeg(`${c}`)}`
      },
      {
        explanation: TEXTS.solution.multiplyPowers,
        math: polyToLatex(answer)
      }
    ]
  };
}

/** (ax + b) · (cx + d)   e.g. (4x − 2)(3x + 2) = 12x² + 8x − 6x − 4 = 12x² + 2x − 4 */
function generateExpandBinomials() {
  const a = randNZ(5);
  const b = randNZ(9);
  const c = randNZ(5);
  const d = randNZ(9);

  const latex  = `(${binomial(a, b)}) \\cdot (${binomial(c, d)})`;
  const answer = { 2: a * c, 1: a * d + b * c, 0: b * d };

  // the four products, in the order first·first, first·second, second·first, second·second
  const A = coefX(a), B = `${b}`, C = coefX(c), D = `${d}`;
  const products = termsLatex([
    { coef: a * c, deg: 2 },
    { coef: a * d, deg: 1 },
    { coef: b * c, deg: 1 },
    { coef: b * d, deg: 0 },
  ]);

  return {
    kind: 'simplify',
    latex,
    answer,
    steps: [
      {
        explanation: TEXTS.solution.originalExpression,
        math: latex
      },
      {
        explanation: TEXTS.solution.distributeAll,
        math: `${wrapNeg(A)} \\cdot ${wrapNeg(C)} + ${wrapNeg(A)} \\cdot ${wrapNeg(D)} + ${wrapNeg(B)} \\cdot ${wrapNeg(C)} + ${wrapNeg(B)} \\cdot ${wrapNeg(D)}`
      },
      {
        explanation: TEXTS.solution.multiplyOut,
        math: products
      },
      {
        explanation: TEXTS.solution.combineLike,
        math: polyToLatex(answer)
      }
    ]
  };
}

// ─── register with the shared generator table (defined in equations.js) ──────
Object.assign(GENERATORS, {
  'expand-number':    generateExpandNumber,
  'expand-monomial':  generateExpandMonomial,
  'expand-binomials': generateExpandBinomials,
});
