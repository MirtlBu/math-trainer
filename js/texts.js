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
    numbers: 'Numbers',
    words: 'Word Problems',
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
    multiHint: 'Select all that apply.',
    fractionPlaceholder: 'e.g. -3/4',
    fractionHint: 'Write a fraction like 3/4 in lowest terms (a minus sign goes in front).',
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
    chooseAtLeastOne: 'Please select at least one option.',
    notAFraction: 'Please enter a fraction like -3/4 (or a whole number).',
    notLowest: 'Write the fraction in lowest terms.',
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

  // ─── number sets, decimals and fractions ────────────────────────────────────
  numbers: {
    definitions: 'Natural numbers (luonnolliset luvut) are 0, 1, 2, 3, … (in Finland 0 is included). Integers (kokonaisluvut) are the whole numbers with their negatives: …, −2, −1, 0, 1, 2, … Rational numbers (rationaaliluvut) can be written as a fraction of two integers. Irrational numbers (irrationaaliluvut) cannot. Together they make up the real numbers (reaaliluvut).',
    simplifyFirst: 'First simplify the number.',
    whyNatural: 'It is a whole number that is not negative, so it is a natural number. Every natural number is also an integer, a rational number and a real number.',
    whyNegativeInteger: 'It is a whole number, but negative: so it is an integer, not a natural number. It is also a rational and a real number.',
    whyNotWhole: 'It is not a whole number, so it is neither a natural number nor an integer.',
    endingDecimalAsFraction: 'A decimal number that ends can be written as a fraction, so it is rational:',
    repeatingDecimalAsFraction: 'A repeating decimal can always be written as a fraction, so it is rational:',
    alreadyFraction: 'It is a fraction of two integers, so it is a rational number.',
    whyIrrational: (n) => `$\\sqrt{${n}}$ is not a whole number and ${n} is not a square number, so its decimal expansion never ends and never repeats. It cannot be written as a fraction: it is irrational.`,
    whyPi: '$\\pi = 3.14159\\ldots$ has a decimal expansion that never ends and never repeats, so it cannot be written as a fraction: it is irrational (and so is any non-zero whole-number multiple of it).',
    belongsTo: (names) => `So the number belongs to: ${names.join('; ')}.`,
    smallestIs: (name) => `The smallest of the sets that contains it is: ${name}.`,
    overPowerOfTen: (k) => `Write the digits over 1 followed by as many zeros as there are decimal places (${k}).`,
    divideByGcd: (g) => `Divide the numerator and the denominator by their greatest common divisor, ${g}.`,
    letX: 'Let $x$ be the number.',
    shiftPeriod: (k) => `Multiply by ${10 ** k} to move one whole period in front of the decimal point; the repeating part stays the same.`,
    subtractEquations: 'Subtract the first equation from the second: the repeating parts cancel.',
    solveForX: 'Solve for $x$ and reduce the fraction.',
  },

  // ─── equations with fractions ───────────────────────────────────────────────
  fractions: {
    original: 'Write the original equation.',
    lcd: (dens, m) => `The denominators are ${dens.length > 1 ? dens.slice(0, -1).join(', ') + ' and ' + dens[dens.length - 1] : dens[0]}. Their lowest common multiple is ${m}: this is the lowest common denominator (LCD).`,
    multiplyAll: (m) => `Multiply every term on both sides by ${m}, so that the fractions disappear.`,
    cancel: 'Cancel the denominators.',
    expand: 'Multiply out the brackets.',
    collect: 'Move the terms with $x$ to the left side and the numbers to the right side, and combine.',
    domain: 'The denominators cannot be zero, so some values of $x$ are not allowed:',
    multiplyByDenominators: 'Multiply both sides by both denominators (cross-multiply) and cancel.',
    lcdWithX: (e) => `The common denominator is $${e}$. Multiply every term on both sides by it.`,
    multiplyByX: 'Multiply every term on both sides by $x$.',
    checkDomain: 'This value is allowed (the denominators are not zero), so it is the solution.',
    bothAllowed: 'Neither solution is $0$, so both are allowed.',
  },

  // ─── proportionality ────────────────────────────────────────────────────────
  proportion: {
    directConstant: 'The two quantities are directly proportional, so their ratio is constant: the constant of proportionality $k$.',
    multiplyByK: 'Multiply the new amount by $k$.',
    directPower: (n) => `The quantity is directly proportional to the ${n === 2 ? 'square' : 'cube'} of the other one, so the ratio of the new value to the old value equals the ${n === 2 ? 'square' : 'cube'} of the ratio of the other quantity.`,
    inversePower: (n) => `The quantity is inversely proportional to the square of the other one, so the ratio of the new value to the old value equals the square of the inverted ratio of the other quantity (old over new).`,
    reduceRatio: 'Write the ratio of the $x$ values in lowest terms.',
    solveForSecond: 'Substitute the known values and calculate.',
    inverseConstant: 'The quantities are inversely proportional, so their product is constant.',
    sameProduct: 'The product is the same for the new values.',
    kFromRatio: 'For direct proportion $k = \\dfrac{y}{x}$.',
    kFromProduct: 'For inverse proportion $k = x \\cdot y$.',
    checkOthers: 'Check with another pair of values: it gives the same number.',
    testRatio: 'Direct proportion: the ratio $\\dfrac{y}{x}$ is the same for every pair.',
    testProduct: 'Inverse proportion: the product $x \\cdot y$ is the same for every pair.',
    concludeDirect: 'The ratio $\\dfrac{y}{x}$ is constant, so $y$ is directly proportional to $x$.',
    concludeInverse: 'The product $x \\cdot y$ is constant, so $y$ is inversely proportional to $x$.',
    concludeNeither: 'Neither the ratio nor the product is constant, so $y$ is neither directly nor inversely proportional to $x$.',
  },

  // ─── systems of two linear equations (systems.js) ───────────────────────────
  linsys: {
    question: 'Solve the system of equations.',
    substituteInto: (q) => `The first equation already gives $${q}$. Substitute it into the second equation.`,
    findOther: (p, q) => `Put $${p}$ into the first equation to find $${q}$.`,
    multiplyBoth: (m1, m2, v) => {
      const which = m1 !== 1 && m2 !== 1 ? `Multiply the first equation by ${m1} and the second by ${m2}` : m1 !== 1 ? `Multiply the first equation by ${m1}` : `Multiply the second equation by ${m2}`;
      return `${which}, so that the coefficients of $${v}$ are equal in size.`;
    },
    addEq: (v) => `The coefficients of $${v}$ are opposite numbers: add the two equations and $${v}$ cancels.`,
    subtractEq: (v) => `The coefficients of $${v}$ are equal: subtract the second equation from the first and $${v}$ cancels.`,
    backSub: (w, w0) => `Put $${w} = ${w0}$ into the first original equation.`,
    moveNumber: 'Calculate and move the number to the right side.',
  },

  // ─── systems of equations (two kinds of items) ──────────────────────────────
  system: {
    setup: 'Let $x$ be the number of the first kind and $y$ the number of the second kind. The total number of items and the total value give two equations:',
    expressY: 'From the first equation express $y$.',
    substitute: 'Substitute $y$ into the second equation: now there is only one unknown.',
    findY: 'Find $y$ from $y = $ (total) $- x$.',
  },

  // ─── models from data ───────────────────────────────────────────────────────
  model: {
    askAll: 'Find the missing values.',
    linear: (up) => `The quantity changes by the same amount every time unit, so it follows a linear model. Let $y_0$ be the starting value and $r$ the rate; it ${up ? 'grows' : 'shrinks'} by $r$ each time unit.`,
    useKnownPoint: 'Put the known point into the model to find the rate $r$.',
    solveRate: 'Solve for $r$.',
    useKnownPointStart: 'Put the known point and the rate into the model to find the starting value $y_0$.',
    solveStart: 'Solve for $y_0$.',
    rateFromTwoPoints: 'The rate is the change in the quantity divided by the elapsed time.',
    startFromPoint: 'Put one of the points into the model to find the starting value $y_0$.',
    timeToTarget: (T) => `Find the time when the quantity reaches ${T}: put ${T} into the model.`,
    solveTime: 'Solve for $t$.',
    valueAtTime: (t) => `Put $t = ${t}$ into the model.`,
    containerModel: (container, objects) => `The ${container} holds the water and the ${objects}: its volume $V$ equals the water plus the volume of the ${objects}.`,
    containerSystem: (container, objects) => `Let $V$ be the volume of the ${container} and $w$ the volume of one object. The volume of the ${container} equals the water plus the ${objects}, which gives two equations:`,
    subtractEquations: 'Subtract the second equation from the first: $V$ cancels.',
    volumeFromOne: 'Put the volume of one object into one of the equations to find $V$.',
    objectsForWater: (water) => `With ${water} litres of water, let $n$ be the number of objects.`,
    solveCount: 'Solve for $n$.',
    differenceDebt: 'Their debts shrink by different amounts every month, so the difference between the debts changes by the difference of the payments each month.',
    differenceSavings: 'They save different amounts every month, so the difference between their savings changes by the difference of the deposits each month.',
    calculateReal: 'Calculate what the difference should be after that time.',
    matches: (stated) => `This matches the stated ${stated}, so the information is consistent.`,
    contradicts: (real, stated) => `The rates give ${real}, but the story says ${stated}: the information contradicts itself.`,
  },

  // ─── word problems ──────────────────────────────────────────────────────────
  words: {
    orderHint: 'One answer per field, in the order of the labels.',
    letFirst: (which, d, more) => `Let $x$ be the first one (the ${which}). Each next one is ${d} ${more ? 'more' : 'less'}, so they are:`,
    letSmallest: (name, step) => `Let $x$ be the smallest number. Consecutive ${name} differ by ${step}, so they are:`,
    letSmaller: (diff) => `Let $x$ be the smaller number. The larger number is ${diff} more, so the numbers are:`,
    letSmallerTimes: (k) => `Let $x$ be the smaller number. The other number is ${k} times as large, so the numbers are:`,
    letWidth: (k) => `Let $x$ be the width. The length is ${k} more, so the sides are:`,
    letWidthTimes: (m) => `Let $x$ be the width. The length is ${m} times the width, so the sides are:`,
    letFirstSide: 'Let $x$ be the first side. The other sides are longer by the given amounts, so the sides are:',
    letEqualSide: (k) => `Let $x$ be the length of an equal side. The base is ${k} cm shorter, so the sides are:`,
    total: 'Together they add up to the total.',
    perimeterRectangle: 'The perimeter of a rectangle is twice the sum of its width and its length.',
    perimeterTriangle: 'The perimeter is the sum of the three sides.',
    areaRectangle: 'The area of a rectangle is its width times its length.',
    productEquation: 'The product of the two numbers is given.',
    simplifyBrackets: 'Simplify inside the brackets.',
    expandBrackets: 'Multiply out the brackets.',
    expandAndMove: 'Multiply out the brackets and move everything to the left side.',
    rejectNegative: 'A width cannot be negative, so only the positive solution fits the problem.',
    rejectNegativeInteger: 'The integers are positive, so only the positive solution fits the problem. The next integer is $x + 1$:',
    widthLength: 'So the width and the length are:',
    equalSideAndBase: 'So an equal side and the base are:',
    answerIs: 'So the answer is:',
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
    twoSolutions: 'Calculate the two solutions.',
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
