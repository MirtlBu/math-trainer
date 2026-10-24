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

// ─── building blocks ──────────────────────────────────────────────────────────

/**
 * A bracket with an x term and a number, written either as (bx + c) or as (c + bx).
 * Returns the text inside the brackets and its two terms in the order they are written:
 * each term is { text, coef, deg } (deg 1 for the x term, 0 for the number).
 */
function randomBracket(b, c) {
  const constFirst = randInt(1, 2) === 1;
  const xTerm = { text: coefX(b), coef: b, deg: 1 };
  const cTerm = { text: `${c}`,   coef: c, deg: 0 };
  const text  = constFirst
    ? `${c} ${b > 0 ? '+' : '-'} ${Math.abs(b) === 1 ? 'x' : `${Math.abs(b)}x`}`
    : binomial(b, c);
  return { text, terms: constFirst ? [cTerm, xTerm] : [xTerm, cTerm] };
}

/**
 * Multiply every term of `left` by every term of `right` (in that order).
 * Returns the product terms (not yet combined), the same as a LaTeX list "a · b + a · c + …",
 * and the combined result as a polynomial { degree: coefficient }.
 */
function expandTerms(left, right) {
  const products = [];
  const factors  = [];
  left.forEach(l => right.forEach(r => {
    products.push({ coef: l.coef * r.coef, deg: l.deg + r.deg });
    factors.push(`${wrapNeg(l.text)} \\cdot ${wrapNeg(r.text)}`);
  }));

  const answer = {};
  products.forEach(t => { answer[t.deg] = (answer[t.deg] || 0) + t.coef; });
  return { products, factors: factors.join(' + '), answer };
}

/** A factor in front of or behind a bracket: k·(…) or (…)·k, with the bracket's terms */
function factorWithBracket(multiplier, bracket) {
  const onRight = randInt(1, 2) === 1;                     // (…) · k instead of k · (…)
  const latex = onRight
    ? `(${bracket.text}) \\cdot ${wrapNeg(multiplier.text)}`          // a negative factor after the dot gets brackets
    : `${multiplier.text} \\cdot (${bracket.text})`;
  const { factors, answer } = onRight
    ? expandTerms(bracket.terms, [multiplier])
    : expandTerms([multiplier], bracket.terms);
  return { latex, factors, answer };
}

// ─── generators ───────────────────────────────────────────────────────────────

/** number · (bx + c), also (c + bx) and with the number behind: 4 · (3x − 2) = 12x − 8 */
function generateExpandNumber() {
  const k = randCoef(9);
  const { latex, factors, answer } = factorWithBracket(
    { text: `${k}`, coef: k, deg: 0 },
    randomBracket(randNZ(9), randNZ(9))
  );

  return {
    kind: 'simplify',
    latex,
    answer,
    steps: [
      { explanation: TEXTS.solution.originalExpression, math: latex },
      { explanation: TEXTS.solution.distribute,         math: factors },
      { explanation: TEXTS.solution.simplify,           math: polyToLatex(answer) },
    ]
  };
}

/** kx · (bx + c), also (c + bx) and with kx behind: 4x · (3x − 2) = 12x² − 8x */
function generateExpandMonomial() {
  const k = randCoef(6);
  const { latex, factors, answer } = factorWithBracket(
    { text: coefX(k), coef: k, deg: 1 },
    randomBracket(randNZ(6), randNZ(9))
  );

  return {
    kind: 'simplify',
    latex,
    answer,
    steps: [
      { explanation: TEXTS.solution.originalExpression, math: latex },
      { explanation: TEXTS.solution.distribute,         math: factors },
      { explanation: TEXTS.solution.multiplyPowers,     math: polyToLatex(answer) },
    ]
  };
}

/** (ax + b)(cx + d), each bracket also as (b + ax) / (d + cx): (4x − 2)(3x + 2) = 12x² + 2x − 4 */
function generateExpandBinomials() {
  const first  = randomBracket(randNZ(5), randNZ(9));
  const second = randomBracket(randNZ(5), randNZ(9));

  const latex = `(${first.text}) \\cdot (${second.text})`;
  const { products, factors, answer } = expandTerms(first.terms, second.terms);

  return {
    kind: 'simplify',
    latex,
    answer,
    steps: [
      { explanation: TEXTS.solution.originalExpression, math: latex },
      { explanation: TEXTS.solution.distributeAll,      math: factors },
      { explanation: TEXTS.solution.multiplyOut,        math: termsLatex(products) },
      { explanation: TEXTS.solution.combineLike,        math: polyToLatex(answer) },
    ]
  };
}

// ─── register with the shared generator table (defined in equations.js) ──────
Object.assign(GENERATORS, {
  'expand-number':    generateExpandNumber,
  'expand-monomial':  generateExpandMonomial,
  'expand-binomials': generateExpandBinomials,
});
