/**
 * number-problems.js
 * Number sets (lukujoukot) and decimals ↔ fractions.
 *
 *   numset-sets       which sets does a number belong to? (kind 'multi', tick all that apply)
 *                     or: what is the smallest set it belongs to? (kind 'choice')
 *   numdec-fractions  write a decimal (ending or repeating) as a fraction in lowest terms
 *                     (kind 'fraction', answer { num, den })
 *
 * Finnish convention: the natural numbers (luonnolliset luvut) include 0.
 * Load after equations.js (random helpers), polynomial-equations.js (pick), numbers.js, texts.js.
 */

// ─── the sets ─────────────────────────────────────────────────────────────────

/** In this order: the options of the "which sets" question */
const NUMBER_SETS = [
  { key: 'N', label: '$\\mathbb{N}$ natural numbers (luonnolliset luvut)', short: 'natural numbers (luonnolliset luvut)' },
  { key: 'Z', label: '$\\mathbb{Z}$ integers (kokonaisluvut)',             short: 'integers (kokonaisluvut)' },
  { key: 'Q', label: '$\\mathbb{Q}$ rational numbers (rationaaliluvut)',   short: 'rational numbers (rationaaliluvut)' },
  { key: 'I', label: 'irrational numbers (irrationaaliluvut)',             short: 'irrational numbers (irrationaaliluvut)' },
  { key: 'R', label: '$\\mathbb{R}$ real numbers (reaaliluvut)',           short: 'real numbers (reaaliluvut)' },
];

/** Which sets a kind of number belongs to */
function setsOf(type) {
  return {
    N: type === 'nat',
    Z: type === 'nat' || type === 'negint',
    Q: type !== 'irr',
    I: type === 'irr',
    R: true,
  };
}

// ─── numbers ──────────────────────────────────────────────────────────────────

const NON_SQUARES = [2, 3, 5, 6, 7, 8, 10, 11, 12, 13, 14, 15, 17, 18, 19, 20, 21, 22, 23, 24, 26, 27, 28, 29, 30, 31, 32, 33, 35, 40, 45, 50];

const isSquare = n => Number.isInteger(Math.sqrt(n));

/** The repeating block as a number: not all nines (0.999… is 1) and, for two digits, not 11, 22, … */
function randomRepeatingBlock(period) {
  let block;
  do { block = randInt(1, 10 ** period - 2); } while (period === 2 && block % 11 === 0);
  return block;
}

/** 5 → "05" for a two-digit period */
const blockText = (block, period) => String(block).padStart(period, '0');

/** A decimal with k decimal places: sign, integer part and the digits, as text and as a fraction */
function randomDecimal(maxInt, maxPlaces) {
  const places = randInt(1, maxPlaces);
  let digits;
  do { digits = randInt(1, 10 ** places - 1); } while (digits % 10 === 0);   // last digit not 0
  const whole = randInt(0, maxInt);
  const text  = `${whole}.${String(digits).padStart(places, '0')}`;
  const num   = whole * 10 ** places + digits;
  const den   = 10 ** places;
  return { text, num, den, value: num / den };
}

/**
 * A random number with the facts needed for the question:
 *   { type, latex, value, frac?, simplified? }
 * type: nat | negint | ratfrac | ratdec | repdec | irr
 *  frac        LaTeX of the number written as a fraction in lowest terms (rational, not whole)
 *  simplified  LaTeX line "√49 = 7" shown first when the number has to be simplified
 */
function randomNumberItem() {
  const kind = pick(['nat', 'nat', 'negint', 'negint', 'ratfrac', 'ratfrac', 'ratdec', 'ratdec', 'ratdec', 'repdec', 'irr', 'irr', 'irr']);

  if (kind === 'nat') {
    const how = randInt(1, 6);
    if (how === 1) { const n = randInt(0, 250); return { type: 'nat', latex: `${n}`, value: n }; }
    if (how === 2) { const r = randInt(2, 15); return { type: 'nat', latex: `\\sqrt{${r * r}}`, value: r, simplified: `\\sqrt{${r * r}} = ${r}` }; }
    if (how === 3) { const d = randInt(2, 9), q = randInt(2, 12); return { type: 'nat', latex: `\\dfrac{${d * q}}{${d}}`, value: q, simplified: `\\dfrac{${d * q}}{${d}} = ${q}` }; }
    if (how === 4) { const b = randInt(2, 5), e = randInt(2, 4); return { type: 'nat', latex: `${b}^{${e}}`, value: b ** e, simplified: `${b}^{${e}} = ${b ** e}` }; }
    if (how === 5) return { type: 'nat', latex: '0', value: 0 };
    const n = randInt(2, 40);
    return { type: 'nat', latex: `${n}.0`, value: n, simplified: `${n}.0 = ${n}` };
  }

  if (kind === 'negint') {
    const how = randInt(1, 4);
    if (how === 1) { const n = randInt(1, 200); return { type: 'negint', latex: `-${n}`, value: -n }; }
    if (how === 2) { const r = randInt(2, 12); return { type: 'negint', latex: `-\\sqrt{${r * r}}`, value: -r, simplified: `-\\sqrt{${r * r}} = -${r}` }; }
    if (how === 3) { const d = randInt(2, 9), q = randInt(2, 12); return { type: 'negint', latex: `-\\dfrac{${d * q}}{${d}}`, value: -q, simplified: `-\\dfrac{${d * q}}{${d}} = -${q}` }; }
    const d = randInt(2, 9), q = randInt(2, 12);
    return { type: 'negint', latex: `\\dfrac{-${d * q}}{${d}}`, value: -q, simplified: `\\dfrac{-${d * q}}{${d}} = -${q}` };
  }

  if (kind === 'ratfrac') {
    const den = randInt(2, 12);
    let num;
    do { num = randInt(1, 25); } while (num % den === 0);
    const neg = randInt(1, 2) === 1;
    const r = reduceFraction(num, den);
    if (randInt(1, 6) === 1) {                           // √(9/4) = 3/2: a root that is rational
      const a = randInt(1, 9), b = randInt(2, 9);
      if (gcdInt(a, b) === 1) {
        return { type: 'ratfrac', latex: `\\sqrt{\\dfrac{${a * a}}{${b * b}}}`, value: a / b,
                 simplified: `\\sqrt{\\dfrac{${a * a}}{${b * b}}} = \\dfrac{${a}}{${b}}`, frac: `\\dfrac{${a}}{${b}}` };
      }
    }
    const latex = `${neg ? '-' : ''}\\dfrac{${num}}{${den}}`;
    return { type: 'ratfrac', latex, value: (neg ? -1 : 1) * num / den,
             frac: `${neg ? '-' : ''}\\dfrac{${r.num}}{${r.den}}`, alreadyFraction: true };
  }

  if (kind === 'ratdec') {
    if (randInt(1, 8) === 1) return { type: 'ratdec', latex: '3.14', value: 3.14, frac: '\\dfrac{157}{50}', decimalFraction: '3.14 = \\dfrac{314}{100} = \\dfrac{157}{50}' };
    const d = randomDecimal(30, 3);
    const neg = randInt(1, 2) === 1;
    const r = reduceFraction(d.num, d.den);
    const sign = neg ? '-' : '';
    return {
      type: 'ratdec', latex: `${sign}${d.text}`, value: (neg ? -1 : 1) * d.value,
      frac: `${sign}\\dfrac{${r.num}}{${r.den}}`,
      decimalFraction: `${sign}${d.text} = ${sign}\\dfrac{${d.num}}{${d.den}} = ${sign}\\dfrac{${r.num}}{${r.den}}`,
    };
  }

  if (kind === 'repdec') {
    const period = randInt(1, 2);
    const block = randomRepeatingBlock(period);
    const whole = randInt(0, 5);
    const neg = randInt(1, 2) === 1;
    const num = whole * (10 ** period - 1) + block;
    const r = reduceFraction(num, 10 ** period - 1);
    const sign = neg ? '-' : '';
    return {
      type: 'repdec', latex: `${sign}${whole}.\\overline{${blockText(block, period)}}`, value: (neg ? -1 : 1) * num / (10 ** period - 1),
      frac: `${sign}\\dfrac{${r.num}}{${r.den}}`,
      repeating: { block, whole, period },
    };
  }

  // irrational
  const how = randInt(1, 6);
  if (how === 1) { const n = pick(NON_SQUARES); return { type: 'irr', latex: `\\sqrt{${n}}`, value: Math.sqrt(n), radicand: n }; }
  if (how === 2) { const n = pick(NON_SQUARES); return { type: 'irr', latex: `-\\sqrt{${n}}`, value: -Math.sqrt(n), radicand: n }; }
  if (how === 3) return { type: 'irr', latex: '\\pi', value: Math.PI, special: 'pi' };
  if (how === 4) { const k = randInt(2, 5); return { type: 'irr', latex: `${k}\\pi`, value: k * Math.PI, special: 'pi' }; }
  if (how === 5) { const n = pick(NON_SQUARES), k = randInt(1, 5); return { type: 'irr', latex: `${k} + \\sqrt{${n}}`, value: k + Math.sqrt(n), radicand: n }; }
  const n = pick(NON_SQUARES);
  return { type: 'irr', latex: `\\dfrac{\\sqrt{${n}}}{2}`, value: Math.sqrt(n) / 2, radicand: n };
}

// stories never repeat within a set: remember the last numbers
let recentNumbers = [];
function pickNumberItem() {
  let item;
  let tries = 0;
  do { item = randomNumberItem(); tries++; } while (recentNumbers.includes(item.latex) && tries < 30);
  recentNumbers.push(item.latex);
  if (recentNumbers.length > 12) recentNumbers.shift();
  return item;
}

// ─── level 1: number sets ─────────────────────────────────────────────────────

/** The explanation steps, shared by both question kinds */
function numberSetSteps(item) {
  const T = TEXTS.numbers;
  const steps = [{ explanation: T.definitions, math: '' }];

  if (item.simplified) steps.push({ explanation: T.simplifyFirst, math: item.simplified });

  if (item.type === 'nat') {
    steps.push({ explanation: T.whyNatural, math: '' });
  } else if (item.type === 'negint') {
    steps.push({ explanation: T.whyNegativeInteger, math: '' });
  } else if (item.type === 'irr') {
    steps.push({ explanation: item.special === 'pi' ? T.whyPi : T.whyIrrational(item.radicand), math: '' });
  } else {
    steps.push({ explanation: T.whyNotWhole, math: '' });
    if (item.type === 'ratdec')        steps.push({ explanation: T.endingDecimalAsFraction, math: item.decimalFraction });
    else if (item.type === 'repdec')   steps.push({ explanation: T.repeatingDecimalAsFraction, math: `${item.latex} = ${item.frac}` });
    else                               steps.push({ explanation: T.alreadyFraction, math: '' });
  }
  return steps;
}

/** Which of the sets does the number belong to? / What is the smallest set? */
function generateNumberSets() {
  const item  = pickNumberItem();
  const facts = setsOf(item.type);
  const steps = numberSetSteps(item);

  if (randInt(1, 5) <= 3) {
    // tick all that apply
    const answer = NUMBER_SETS.map((s, i) => facts[s.key] ? i : -1).filter(i => i >= 0);
    steps.push({
      explanation: TEXTS.numbers.belongsTo(answer.map(i => NUMBER_SETS[i].short)),
      math: ''
    });
    return {
      kind: 'multi',
      question: `Which of these sets does the number $${item.latex}$ belong to?`,
      options: NUMBER_SETS.map(s => s.label),
      answer, steps,
    };
  }

  // the smallest set: N ⊂ Z ⊂ Q, or irrational
  const smallestKey = facts.N ? 'N' : facts.Z ? 'Z' : facts.Q ? 'Q' : 'I';
  const options = ['N', 'Z', 'Q', 'I'].map(k => NUMBER_SETS.find(s => s.key === k));
  steps.push({
    explanation: TEXTS.numbers.smallestIs(NUMBER_SETS.find(s => s.key === smallestKey).short),
    math: ''
  });
  return {
    kind: 'choice',
    question: `What is the smallest of these sets that contains the number $${item.latex}$?`,
    options: options.map(s => s.label),
    answer: options.findIndex(s => s.key === smallestKey),
    steps,
  };
}

// ─── level 2: decimals and fractions ──────────────────────────────────────────

/** Write 0.75 or 0.\overline{27} as a fraction in lowest terms */
function generateDecimalToFraction() {
  if (randInt(1, 3) <= 2) {
    // an ending decimal
    let d, r;
    do {
      d = randomDecimal(randInt(0, 1) === 0 ? 0 : 6, 3);
      r = reduceFraction(d.num, d.den);
    } while (r.den === 1);
    const neg = randInt(1, 3) === 1;
    const sign = neg ? '-' : '';
    const g = gcdInt(d.num, d.den);
    const answer = { num: (neg ? -1 : 1) * r.num, den: r.den };

    const steps = [
      { explanation: TEXTS.numbers.overPowerOfTen(d.text.split('.')[1].length),
        math: `${sign}${d.text} = ${sign}\\dfrac{${d.num}}{${d.den}}` },
    ];
    if (g > 1) {
      steps.push({ explanation: TEXTS.numbers.divideByGcd(g),
        math: `${sign}\\dfrac{${d.num}}{${d.den}} = ${sign}\\dfrac{${d.num} \\div ${g}}{${d.den} \\div ${g}} = ${sign}\\dfrac{${r.num}}{${r.den}}` });
    }
    return {
      kind: 'fraction',
      question: `Write $${sign}${d.text}$ as a fraction in lowest terms.`,
      answer, steps,
    };
  }

  // a repeating decimal: x = 0.\overline{27}
  const period = randInt(1, 2);
  const block = randomRepeatingBlock(period);
  const whole = randInt(0, 4);
  const mult  = 10 ** period;
  const num   = whole * (mult - 1) + block;
  const r     = reduceFraction(num, mult - 1);
  const digits  = blockText(block, period);
  const text  = `${whole}.\\overline{${digits}}`;
  const shifted = `${whole * mult + block}.\\overline{${digits}}`;

  const steps = [
    { explanation: TEXTS.numbers.letX, math: `x = ${text}` },
    { explanation: TEXTS.numbers.shiftPeriod(period), math: `${mult}x = ${shifted}` },
    { explanation: TEXTS.numbers.subtractEquations,
      math: `${mult}x - x = ${shifted} - ${text} \\quad\\Rightarrow\\quad ${mult - 1}x = ${num}` },
    { explanation: TEXTS.numbers.solveForX,
      math: r.den === mult - 1
        ? `x = \\dfrac{${num}}{${mult - 1}}`
        : `x = \\dfrac{${num}}{${mult - 1}} = \\dfrac{${r.num}}{${r.den}}` },
  ];
  return {
    kind: 'fraction',
    question: `Write $${text}$ as a fraction in lowest terms.`,
    answer: r, steps,
  };
}

// ─── register with the shared generator table (defined in equations.js) ──────
Object.assign(GENERATORS, {
  'numset-sets':      generateNumberSets,
  'numdec-fractions': generateDecimalToFraction,
});
