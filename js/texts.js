/**
 * texts.js
 * All user-facing texts used by the scripts, in one place.
 * Plain strings are used as is; functions take the values to insert.
 * Texts written directly in index.html (titles, card descriptions) live there.
 */

const TEXTS = {

  // ─── breadcrumb ─────────────────────────────────────────────────────────────
  nav: {
    home: 'Home',
    equations: 'Equations',
    expressions: 'Expressions',
  },

  // ─── practice screen ────────────────────────────────────────────────────────
  practice: {
    solveLabel: 'Solve for $x$:',
    simplifyLabel: 'Expand and simplify:',
    numberPlaceholder: 'your answer',
    expressionPlaceholder: 'e.g. 5x^2 - 3x + 1',
  },

  // ─── answer checking ────────────────────────────────────────────────────────
  feedback: {
    notANumber: 'Please enter a number.',
    notAnExpression: 'Please enter an expression like 5x^2 - 3x + 1.',
    expandFirst: 'Expand the brackets first, the answer should have none.',
    combineLike: 'Combine like terms: each power of x should appear once.',
    wrong: 'Not quite, try again.',
    correct: 'Correct!',
  },

  // ─── step-by-step button ────────────────────────────────────────────────────
  steps: {
    show: 'Step-by-step solution',
    hide: 'Hide solution',
  },

  // ─── progress bar ───────────────────────────────────────────────────────────
  progress: {
    current: (n, total) => `Problem ${n} of ${total}`,
    goTo: (n) => `Go to problem ${n}`,
    score: (solved) => `${solved} solved`,
    levelCompleted: 'Level completed',
  },

  // ─── end of set ─────────────────────────────────────────────────────────────
  session: {
    summary: (solved, total, firstTry) => `You solved ${solved} of ${total}.`,
    nextProblem: 'Next problem',
    finish: 'Finish set',
    passed: 'Nice work!',
    notPassed: 'Another set at this level might help.',
    nextLevel: (label) => `Next level: ${label}`,
    backToTopics: 'Back to topics',
  },

  // ─── solution steps (equations.js) ──────────────────────────────────────────
  solution: {
    original: 'Write the original equation.',
    originalExpression: 'Write the original expression.',
    distribute: 'Multiply the term outside the brackets by each term inside.',
    distributeAll: 'Multiply each term of the first bracket by each term of the second.',
    multiplyPowers: 'Multiply the coefficients and the powers of $x$ ($x \\cdot x = x^2$).',
    multiplyOut: 'Calculate each product.',
    combineLike: 'Combine like terms.',
    simplify: 'Simplify.',
    // n is the number being added/subtracted; always positive here
    subtract: (n) => `Subtract ${n} from both sides.`,
    add: (n) => `Add ${n} to both sides.`,
    subtractIsolate: (n) => `Subtract ${n} from both sides to isolate $x$.`,
    addIsolate: (n) => `Add ${n} to both sides to isolate $x$.`,
    multiply: (n) => `Multiply both sides by ${n < 0 ? `(${n})` : n}.`,
    // negative divisors are shown in brackets: "Divide both sides by (-3)."
    divide: (n) => `Divide both sides by ${n < 0 ? `(${n})` : n}.`,
    // term is LaTeX, e.g. "2x" or "-x"
    moveVariable: (term) => `Subtract $${term}$ from both sides to move variable terms to the left.`,
  },

};
