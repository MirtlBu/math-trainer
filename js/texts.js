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
    inequalities: 'Inequalities',
    graphs: 'Functions & Graphs',
  },

  // ─── practice screen ────────────────────────────────────────────────────────
  practice: {
    solveLabel: 'Solve for $x$:',
    simplifyLabel: 'Expand and simplify:',
    inequalityLabel: 'Solve the inequality:',
    radicalLabel: 'Simplify:',
    valueLabel: 'Read the graph:',
    whichTrue: 'Based on the graph, which of these statements is true?',
    whichEquation: 'Which equation matches the graph?',
    whichPoint: 'Which ordered pair is the point where the line crosses the vertical axis?',
    graphHint: 'Move the cursor along the line (or drag a finger) to read values.',
    numberPlaceholder: 'your answer',
    expressionPlaceholder: 'e.g. 5x^2 - 3x + 1',
    intervalPlaceholder: 'e.g. x > 1',
    radicalPlaceholder: 'e.g. 3√6 - 2',
    radicalHint: 'Type a root as √6 or sqrt(6), for example 3√6 + 2. Give the fully simplified form.',
    numbersHint: 'One field per solution, in any order. Fractions like 3/2 are fine.',
    intervalHint: 'One field per interval. Write each as an inequality (x > 4, -3 <= x < 2) or with brackets ((-3, 2], (-inf, 1)).',
  },

  // ─── answer checking ────────────────────────────────────────────────────────
  feedback: {
    notANumber: 'Please enter a number.',
    chooseOne: 'Please choose an answer.',
    notAnInterval: 'Please enter an interval like x > 4, -3 < x < 2 or (-3, 2].',
    fillAll: 'Please fill in all the fields.',
    notARadical: 'Please enter an expression like 3√6 - 2 (√ can be typed as sqrt, e.g. 3*sqrt(6)).',
    simplifyRoots: 'Simplify the roots: no perfect square should be left under a root (for example √12 = 2√3).',
    combineRoots: 'Combine like terms: each root, and the plain numbers, should appear only once.',
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
    summary: (solved, total) => `You solved ${solved} of ${total}.`,
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
    originalInequality: 'Write the original inequality.',
    soEquationUp: 'The quantity starts at the starting value and grows by the rate each time unit, so the equation is:',
    soEquationDown: 'The quantity starts at the starting value and shrinks by the rate each time unit (the rate is subtracted), so the equation is:',
    soPoint: 'So the point is:',
    // comparing two linear functions
    equalExpressions: 'They have the same value when the two expressions are equal.',
    collectTerms: (v) => `Move the terms with $${v}$ to one side and the numbers to the other side.`,
    substituteEither: 'Substitute this time into either equation.',
    computeBoth: (v, t) => `Substitute $${v} = ${t}$ into both equations.`,
    subtractValues: 'Subtract the smaller number from the larger one.',
    rateIsCoefficient: (v) => `The rate of change is the number multiplying $${v}$ in each equation.`,
    startIsConstant: (v) => `The starting value is the number without $${v}$: the value when $${v} = 0$.`,
    // square roots
    squareFactor: 'Find the largest perfect square that divides the number under the root.',
    splitRoot: 'Split the root of a product into a product of roots: $\\sqrt{ab} = \\sqrt{a} \\cdot \\sqrt{b}$.',
    multiplyCoefficients: 'Multiply the numbers in front of the root.',
    simplifyEachRoot: 'Simplify each root: take out the largest perfect square.',
    combineSameRoots: 'Combine the terms with the same root.',
    multiplyRoots: 'Multiply the numbers in front of the roots, and the numbers under the roots.',
    multiplyUnder: 'Multiply the numbers under the roots.',
    simplifyRoot: 'Simplify the root.',
    divideRoots: 'Write both roots under one root: $\\dfrac{\\sqrt{a}}{\\sqrt{b}} = \\sqrt{\\dfrac{a}{b}}$.',
    squareBracket: 'A square means multiplying the bracket by itself.',
    simplifyAndCombine: 'Simplify the roots and combine like terms.',
    rationalizeRoot: 'Multiply the numerator and the denominator by the root from the denominator.',
    conjugate: 'Multiply the numerator and the denominator by the conjugate of the denominator (change the sign between its terms).',
    denominatorDifference: 'In the denominator use $(a + b)(a - b) = a^2 - b^2$.',
    cancelFraction: 'Divide the numerator by the denominator.',
    divideNegative: (n) => `Divide both sides by (${n}). Dividing by a negative number reverses the inequality sign.`,
    findRoots: 'Find the roots: set each factor equal to zero.',
    findZeros: 'Find where the expression equals zero: solve the equation.',
    signTable: (leadPositive) =>
      'The roots split the number line into intervals. To the right of the largest root the expression is ' +
      (leadPositive ? 'positive' : 'negative (the leading coefficient is negative)') +
      ', and its sign changes at every root.',
    pickIntervals: (positive, strict) =>
      `Take the intervals where the expression is ${positive ? 'positive' : 'negative'}` +
      (strict ? '.' : ', and include the roots (square brackets) because equality is allowed.'),
    distribute: 'Multiply the term outside the brackets by each term inside.',
    distributeAll: 'Multiply each term of the first bracket by each term of the second.',
    multiplyPowers: 'Multiply the coefficients and the powers of $x$ ($x \\cdot x = x^2$).',
    multiplyOut: 'Calculate each product.',
    combineLike: 'Combine like terms.',
    simplify: 'Simplify.',
    // quadratic, cubic and quartic equations
    zeroProduct: 'A product is zero when at least one of its factors is zero.',
    solveEach: 'Solve each equation.',
    rootsAre: 'The solutions are:',
    moveAllLeft: 'Move all terms to the left side.',
    vieta: (sum, product) => `Find two numbers whose sum is ${sum} and whose product is ${product}.`,
    factorQuadratic: 'Write the quadratic in factored form.',
    discriminant: 'Calculate the discriminant $D = b^2 - 4ac$.',
    quadraticFormula: 'Use the quadratic formula.',
    sqrtBoth: 'Take the square root of both sides: there are two solutions, one positive and one negative.',
    factorCommon: 'Factor out the common factor.',
    factorOutX: 'Factor out $x$.',
    zeroProductQuad: 'A product is zero when a factor is zero: $x = 0$, or the quadratic in the brackets is zero.',
    groupTerms: 'Group the terms in pairs and factor each pair.',
    factorCommonBracket: 'Factor out the common bracket.',
    diffSquares: 'Factor the difference of squares: $a^2 - b^2 = (a - b)(a + b)$.',
    substitute: 'Substitute $t = x^2$ to get a quadratic equation.',
    backToX: 'Go back to $x$: replace $t$ by $x^2$.',
    noRealRoots: (c) => `The equation $x^2 = -${c}$ has no real solutions, so only $x^2 = ${c}$ counts.`,
    alwaysPositive: (c) => `The factor $x^2 + ${c}$ is always positive, so it does not change the sign.`,
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
