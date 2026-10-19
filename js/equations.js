/**
 * equations.js
 * Generates problems and step-by-step solutions for each subtopic.
 * Each generator returns an object: { latex, answer, steps }
 *   latex  — KaTeX string for the equation display
 *   answer — number (the correct value of x)
 *   steps  — array of { explanation: string, math: string }
 */

// ─── helpers ──────────────────────────────────────────────────────────────────

/** Random integer in [min, max], never 0 unless min=0 */
function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** Random non-zero integer in [-range, range] */
function randNZ(range) {
  let n;
  do { n = randInt(-range, range); } while (n === 0);
  return n;
}

/** Random coefficient in [-range, range] with |n| >= 2 (so 1x / -x never appear) */
function randCoef(range) {
  let n;
  do { n = randInt(-range, range); } while (Math.abs(n) < 2);
  return n;
}

/** Format a number as a signed string for display, e.g. +3, -5 */
function signed(n) {
  return n >= 0 ? `+${n}` : `${n}`;
}

/** Format coefficient: 2x → "2x", 1x → "x", -1x → "-x" */
function coefX(c) {
  if (c === 1)  return 'x';
  if (c === -1) return '-x';
  return `${c}x`;
}

/** Format a term for display: handles sign, coefficient, variable */
function term(coef, varName = 'x') {
  if (coef === 0) return '';
  const abs = Math.abs(coef);
  const sign = coef > 0 ? '+' : '-';
  const v = varName === '' ? '' : varName;
  const c = abs === 1 && v ? '' : `${abs}`;
  return `${sign} ${c}${v}`;
}

/** Format a constant term (no variable) */
function constTerm(n) {
  if (n === 0) return '';
  return n > 0 ? `+ ${n}` : `- ${Math.abs(n)}`;
}

/**
 * Fraction simplification helper
 * Returns { num, den } in lowest terms (den always positive)
 */
function simplifyFrac(num, den) {
  function gcd(a, b) { return b === 0 ? Math.abs(a) : gcd(b, a % b); }
  const g = gcd(Math.abs(num), Math.abs(den));
  let n = num / g, d = den / g;
  if (d < 0) { n = -n; d = -d; }
  return { num: n, den: d };
}

/** Render fraction as LaTeX, or integer if denominator is 1 */
function latexFrac(num, den) {
  const f = simplifyFrac(num, den);
  if (f.den === 1) return `${f.num}`;
  return `\\dfrac{${f.num}}{${f.den}}`;
}


// ─── generators ───────────────────────────────────────────────────────────────

/**
 * BASIC LINEAR: one step
 * Patterns:
 *   x + a = b   (addition/subtraction)
 *   a * x = b   (multiplication, integer answer)
 */
function generateLinearBasic() {
  const type = randInt(1, 3);

  if (type === 1) {
    // x + a = b  →  x = b - a
    const x  = randInt(-10, 10);
    const a  = randNZ(10);
    const b  = x + a;

    const aStr = a > 0 ? `+ ${a}` : `- ${Math.abs(a)}`;
    const latex = `x ${aStr} = ${b}`;

    return {
      latex,
      answer: x,
      steps: [
        {
          explanation: TEXTS.solution.original,
          math: `x ${aStr} = ${b}`
        },
        {
          explanation: a > 0
            ? TEXTS.solution.subtractIsolate(a)
            : TEXTS.solution.addIsolate(Math.abs(a)),
          math: `x ${aStr} ${a > 0 ? `- ${a}` : `+ ${Math.abs(a)}`} = ${b} ${a > 0 ? `- ${a}` : `+ ${Math.abs(a)}`}`
        },
        {
          explanation: TEXTS.solution.simplify,
          math: `x = ${x}`
        }
      ]
    };
  } else if (type === 2) {
    // a * x = b  →  x = b/a  (keep answer integer)
    const x = randNZ(10);
    const a = randCoef(8);
    const b = a * x;

    const lhs = coefX(a);
    const latex = `${lhs} = ${b}`;

    return {
      latex,
      answer: x,
      steps: [
        {
          explanation: TEXTS.solution.original,
          math: `${lhs} = ${b}`
        },
        {
          explanation: TEXTS.solution.divide(a),
          math: `\\dfrac{${lhs}}{${a}} = \\dfrac{${b}}{${a}}`
        },
        {
          explanation: TEXTS.solution.simplify,
          math: `x = ${x}`
        }
      ]
    };
  } else {
    // x / a = b  →  x = a * b  (answer is always an integer)
    const a = randCoef(8);
    const b = randCoef(6);
    const x = a * b;

    const aStr = a > 0 ? `${a}` : `(${a})`;   // brackets around negatives in the steps
    const latex = `\\dfrac{x}{${a}} = ${b}`;

    return {
      latex,
      answer: x,
      steps: [
        {
          explanation: TEXTS.solution.original,
          math: latex
        },
        {
          explanation: TEXTS.solution.multiply(a),
          math: `${aStr} \\cdot \\dfrac{x}{${a}} = ${aStr} \\cdot ${b < 0 ? `(${b})` : b}`
        },
        {
          explanation: TEXTS.solution.simplify,
          math: `x = ${x}`
        }
      ]
    };
  }
}


/**
 * TWO-STEP LINEAR
 * Pattern: ax + b = c  →  x = (c - b) / a
 * Answer is always an integer (a divides c-b).
 */
function generateLinearTwoStep() {
  const x = randNZ(10);
  const a = randCoef(8);
  const b = randNZ(10);
  const c = a * x + b;

  const lhsA = coefX(a);
  const bStr = b >= 0 ? `+ ${b}` : `- ${Math.abs(b)}`;
  const latex = `${lhsA} ${bStr} = ${c}`;
  const rhs2  = c - b;

  return {
    latex,
    answer: x,
    steps: [
      {
        explanation: TEXTS.solution.original,
        math: `${lhsA} ${bStr} = ${c}`
      },
      {
        explanation: b > 0
          ? TEXTS.solution.subtract(b)
          : TEXTS.solution.add(Math.abs(b)),
        math: `${lhsA} = ${rhs2}`
      },
      {
        explanation: TEXTS.solution.divide(a),
        math: `\\dfrac{${lhsA}}{${a}} = \\dfrac{${rhs2}}{${a}}`
      },
      {
        explanation: TEXTS.solution.simplify,
        math: `x = ${x}`
      }
    ]
  };
}


/**
 * VARIABLES ON BOTH SIDES
 * Pattern: ax + b = cx + d  →  x = (d - b) / (a - c)
 * Answer is always an integer.
 */
function generateLinearBothSides() {
  const x  = randNZ(10);
  const c  = randCoef(6);
  const b  = randNZ(10);
  const d  = randNZ(10);
  // a*x + b = c*x + d  →  a = c + (d-b)/x   pick a such that it's integer
  // Easier: choose a = c + k where k ≠ 0, then d = b + k*x
  let k, a;
  do {
    k = randCoef(5);
    a = c + k;
  } while (Math.abs(a) < 2);   // no 0x / x / -x on the left either
  const dActual = b + k * x;   // overwrite d

  const lhsA = coefX(a);
  const bStr = b >= 0 ? `+ ${b}` : `- ${Math.abs(b)}`;
  const rhsC = coefX(c);
  const dStr = dActual >= 0 ? `+ ${dActual}` : `- ${Math.abs(dActual)}`;

  const latex = `${lhsA} ${bStr} = ${rhsC} ${dStr}`;

  // steps
  const diff = dActual - b;   // = k * x
  const lhsAfter = coefX(k); // (a - c)x = k*x

  return {
    latex,
    answer: x,
    steps: [
      {
        explanation: TEXTS.solution.original,
        math: `${lhsA} ${bStr} = ${rhsC} ${dStr}`
      },
      {
        explanation: TEXTS.solution.moveVariable(rhsC),
        math: `${lhsAfter} ${bStr} = ${dActual}`
      },
      {
        explanation: b > 0
          ? TEXTS.solution.subtract(b)
          : TEXTS.solution.add(Math.abs(b)),
        math: `${lhsAfter} = ${diff}`
      },
      {
        explanation: TEXTS.solution.divide(k),
        math: `\\dfrac{${lhsAfter}}{${k}} = \\dfrac{${diff}}{${k}}`
      },
      {
        explanation: TEXTS.solution.simplify,
        math: `x = ${x}`
      }
    ]
  };
}


// ─── public API ───────────────────────────────────────────────────────────────

const GENERATORS = {
  'linear-basic':      generateLinearBasic,
  'linear-twoStep':    generateLinearTwoStep,
  'linear-bothSides':  generateLinearBothSides,
};

/**
 * Generate a problem for the given subtopic key.
 * Returns { latex, answer, steps } or null if key unknown.
 */
function generateProblem(subtopic) {
  const gen = GENERATORS[subtopic];
  if (!gen) return null;
  return gen();
}
