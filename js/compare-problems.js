/**
 * compare-problems.js
 * Two characters, each with a linear equation in the same variable, e.g.
 *   D = 6t + 10   (Pörri)        E = 3t + 20   (Misu)
 * Questions (typed numbers): when are they equal, what is the common value, how much more
 * has one than the other at a given time, how different are the rates or the starts.
 * The numbers are chosen so that the lines meet at a whole number of time units.
 *
 * Problem: { kind: 'value', text (story + both equations), question, answer, steps }
 * Load after equations.js (random helpers), polynomial-equations.js (pick) and texts.js.
 */

// ─── stories ──────────────────────────────────────────────────────────────────

/**
 * dir: 'up' (both quantities grow) or 'down' (both shrink). A and B are the two characters:
 * name (as used in sentences) and y (the letter of their quantity). The question builders
 * are written out per story so that the wording stays natural.
 */
const COMPARE_STORIES = [
  {
    dir: 'up', x: 'd', unit: ['day', 'days'], maxRate: 9, yUnit: 'seeds',
    A: { name: 'Nappi', y: 'S' }, B: { name: 'Tiku', y: 'T' },
    intro: 'Nappi and Tiku are two hamsters hiding sunflower seeds in their secret hiding places. The total number of seeds in each hiding place after $d$ days is $S$ for Nappi and $T$ for Tiku, given by the equations below.',
    same: 'have the same number of seeds hidden',
    bothQ: 'At that moment, how many seeds does each hamster have hidden?',
    diffQ: (X, Y, t) => `How many more seeds has ${X} hidden than ${Y} after ${t} days?`,
  },
  {
    dir: 'up', x: 'h', unit: ['hour', 'hours'], maxRate: 8, yUnit: 'km',
    A: { name: 'Juho', y: 'D' }, B: { name: 'Ilmari', y: 'E' },
    intro: 'Juho and Ilmari are skiing across a frozen lake at steady speeds. The distance each of them has skied after $h$ hours (in kilometres) is $D$ for Juho and $E$ for Ilmari, given by the equations below.',
    same: 'have skied the same distance',
    bothQ: 'At that moment, how many kilometres has each of them skied?',
    diffQ: (X, Y, t) => `How many kilometres further has ${X} skied than ${Y} after ${t} hours?`,
  },
  {
    dir: 'up', x: 'd', unit: ['day', 'days'], maxRate: 6, yUnit: 'toys',
    A: { name: 'Mirri', y: 'M' }, B: { name: 'Kisu', y: 'K' },
    intro: 'Mirri and Kisu are two cats who do not trust their owners, so they keep hiding toys under the sofa. The number of toys each cat has hidden after $d$ days is $M$ for Mirri and $K$ for Kisu, given by the equations below.',
    same: 'have the same number of toys hidden',
    bothQ: 'At that moment, how many toys has each cat hidden?',
    diffQ: (X, Y, t) => `How many more toys has ${X} hidden than ${Y} after ${t} days?`,
  },
  {
    dir: 'up', x: 'h', unit: ['hour', 'hours'], maxRate: 9, yUnit: 'euros',
    A: { name: 'Aada', y: 'A' }, B: { name: 'Elmeri', y: 'E' },
    intro: 'Aada and Elmeri collect empty bottles to return them for deposit money. The amount of money they have collected after $h$ hours (in euros) is $A$ for Aada and $E$ for Elmeri, given by the equations below.',
    same: 'have collected the same amount of money',
    bothQ: 'At that moment, how many euros has each of them collected?',
    diffQ: (X, Y, t) => `How many more euros has ${X} collected than ${Y} after ${t} hours?`,
  },
  {
    dir: 'up', x: 'h', unit: ['hour', 'hours'], maxRate: 8, yUnit: 'metres',
    A: { name: 'Mauno', y: 'P' }, B: { name: 'Seppo', y: 'Q' },
    intro: 'Mauno and Seppo are painting a long fence, each at a steady pace. The length of fence each of them has painted after $h$ hours (in metres) is $P$ for Mauno and $Q$ for Seppo, given by the equations below.',
    same: 'have painted the same length of fence',
    bothQ: 'At that moment, how many metres of fence has each of them painted?',
    diffQ: (X, Y, t) => `How many more metres of fence has ${X} painted than ${Y} after ${t} hours?`,
  },
  {
    dir: 'up', x: 'h', unit: ['hour', 'hours'], maxRate: 9, yUnit: 'cm',
    A: { name: 'Elli', y: 'E' }, B: { name: 'Kerttu', y: 'K' },
    intro: 'Elli and Kerttu are knitting scarves. The length of each scarf after $h$ hours (in centimetres) is $E$ for Elli and $K$ for Kerttu, given by the equations below.',
    same: 'have scarves of the same length',
    bothQ: 'At that moment, how many centimetres long is each scarf?',
    diffQ: (X, Y, t) => `How many centimetres longer is the scarf of ${X} than the scarf of ${Y} after ${t} hours?`,
  },
  {
    dir: 'down', x: 'm', unit: ['minute', 'minutes'], maxRate: 9, yUnit: 'litres',
    A: { name: 'Maija’s bathtub', y: 'W' }, B: { name: 'Joonas’s bathtub', y: 'V' },
    intro: 'Maija and Joonas both pull the plug in their bathtubs, and the water drains at constant rates. The amount of water left after $m$ minutes (in litres) is $W$ for Maija’s bathtub and $V$ for Joonas’s bathtub, given by the equations below.',
    same: 'have the same amount of water left',
    bothQ: 'At that moment, how many litres of water does each bathtub hold?',
    diffQ: (X, Y, t) => `How many more litres of water does ${X} hold than ${Y} after ${t} minutes?`,
  },
  {
    dir: 'down', x: 'm', unit: ['minute', 'minutes'], maxRate: 5, yUnit: 'degrees',
    A: { name: 'Iida’s tea', y: 'T' }, B: { name: 'Lauri’s tea', y: 'U' },
    intro: 'Iida and Lauri each pour a cup of hot tea, and the tea cools down at a constant rate. The temperature of the tea after $m$ minutes (in °C) is $T$ for Iida’s tea and $U$ for Lauri’s tea, given by the equations below.',
    same: 'have the same temperature',
    bothQ: 'At that moment, what is the temperature of each cup of tea? (in °C)',
    diffQ: (X, Y, t) => `By how many degrees is ${X} warmer than ${Y} after ${t} minutes?`,
  },
  {
    dir: 'down', x: 'd', unit: ['day', 'days'], maxRate: 6, yUnit: 'decilitres',
    A: { name: 'Oona’s jug', y: 'O' }, B: { name: 'Topias’s jug', y: 'R' },
    intro: 'Oona and Topias each have a big jug of juice and drink the same amount every day. The amount of juice left after $d$ days (in decilitres) is $O$ for Oona’s jug and $R$ for Topias’s jug, given by the equations below.',
    same: 'have the same amount of juice left',
    bothQ: 'At that moment, how many decilitres of juice are left in each jug?',
    diffQ: (X, Y, t) => `How many more decilitres of juice are left in ${X} than in ${Y} after ${t} days?`,
  },
];

// stories are chosen so that none repeats within the last few problems
let recentCompare = [];

function pickCompareStory() {
  const memory = Math.min(8, COMPARE_STORIES.length - 1);
  const choices = COMPARE_STORIES.filter(s => !recentCompare.includes(s));
  const chosen = choices[randInt(0, choices.length - 1)];
  recentCompare.push(chosen);
  if (recentCompare.length > memory) recentCompare.shift();
  return chosen;
}

// ─── helpers ──────────────────────────────────────────────────────────────────

/** 6t + 10 / 10 + 6t   or   40 - 2h / -2h + 40 (the letter is the time variable) */
function compareRhs(story, b, a) {
  const term = a === 1 ? story.x : `${a}${story.x}`;
  const flip = randInt(1, 2) === 1;
  if (story.dir === 'up')   return flip ? `${b} + ${term}` : `${term} + ${b}`;
  return flip ? `-${term} + ${b}` : `${b} - ${term}`;
}

// ─── generator ────────────────────────────────────────────────────────────────

function generateFunctionCompare() {
  const story = pickCompareStory();
  const down  = story.dir === 'down';
  const sign  = down ? -1 : 1;
  const x     = story.x;

  // two different rates, and a meeting time t* (whole number) with the common value v*
  let a1, a2, tStar, vStar;
  do {
    a1 = randInt(1, story.maxRate);
    a2 = randInt(1, story.maxRate);
  } while (a1 === a2);
  tStar = randInt(2, 12);
  const aMax = Math.max(a1, a2);
  // up: both starts stay positive; down: both quantities last at least 3 time units after t*
  vStar = down ? 3 * aMax + randInt(2, 20) : aMax * tStar + randInt(2, 15);

  // b_i is chosen so that b_i + sign·a_i·t* = v*
  const b1 = vStar - sign * a1 * tStar;
  const b2 = vStar - sign * a2 * tStar;
  const f1 = t => b1 + sign * a1 * t;
  const f2 = t => b2 + sign * a2 * t;

  const rhs1 = compareRhs(story, b1, a1);
  const rhs2 = compareRhs(story, b2, a2);
  const { A, B } = story;
  const text = `${story.intro} $$\\begin{aligned} ${A.y} &= ${rhs1} \\\\ ${B.y} &= ${rhs2} \\end{aligned}$$`;
  const base = { kind: 'value', text };

  const unitP = story.unit[1];
  const type  = pick(['meet', 'meet', 'meet', 'both', 'both', 'diff', 'diff', 'diff', 'rates', 'starts']);

  // the steps that find t*: used by 'meet' and 'both'
  const meetSteps = () => {
    // collect the terms so that the coefficient of the variable is positive
    const c = sign * (a1 - a2);
    const coef = Math.abs(c);
    const rest = c > 0 ? b2 - b1 : b1 - b2;
    return [
      { explanation: TEXTS.solution.equalExpressions, math: `${rhs1} = ${rhs2}` },
      { explanation: TEXTS.solution.collectTerms(x), math: `${coefLetter(coef, x)} = ${rest}` },
      ...(coef === 1 ? [] : [{ explanation: TEXTS.solution.divide(coef), math: `${x} = ${tStar}` }]),
    ];
  };

  if (type === 'meet') {
    return { ...base,
      question: `After how many ${unitP} do ${A.name} and ${B.name} ${story.same}?`,
      answer: tStar, steps: meetSteps() };
  }

  if (type === 'both') {
    return { ...base, question: story.bothQ, answer: vStar, steps: [
      ...meetSteps(),
      { explanation: TEXTS.solution.substituteEither,
        math: `${A.y} = ${valueExpr(story, b1, a1, tStar, vStar)}` },
    ] };
  }

  if (type === 'diff') {
    // a time (not t*) at which both quantities are still sensible
    const tMax = down ? Math.floor(Math.min(b1 / a1, b2 / a2)) : 16;
    let t;
    do { t = randInt(2, Math.min(16, tMax)); } while (t === tStar);
    const v1 = f1(t), v2 = f2(t);
    const [X, Y] = v1 > v2 ? [A, B] : [B, A];
    return { ...base, question: story.diffQ(X.name, Y.name, t), answer: Math.abs(v1 - v2), steps: [
      { explanation: TEXTS.solution.computeBoth(x, t),
        math: `${A.y} = ${valueExpr(story, b1, a1, t, v1)}, \\quad ${B.y} = ${valueExpr(story, b2, a2, t, v2)}` },
      { explanation: TEXTS.solution.subtractValues,
        math: `${Math.max(v1, v2)} - ${Math.min(v1, v2)} = ${Math.abs(v1 - v2)}` },
    ] };
  }

  if (type === 'rates') {
    return { ...base,
      question: `By how many ${story.yUnit} per ${story.unit[0]} do the rates of ${A.name} and ${B.name} differ?`,
      answer: Math.abs(a1 - a2), steps: [
        { explanation: TEXTS.solution.rateIsCoefficient(x),
          math: `${a1} \\quad\\text{and}\\quad ${a2}` },
        { explanation: TEXTS.solution.subtractValues,
          math: `${Math.max(a1, a2)} - ${Math.min(a1, a2)} = ${Math.abs(a1 - a2)}` },
      ] };
  }

  // starts
  return { ...base,
    question: `What is the difference between the starting values of $${A.y}$ and $${B.y}$? (in ${story.yUnit})`,
    answer: Math.abs(b1 - b2), steps: [
      { explanation: TEXTS.solution.startIsConstant(x),
        math: `${b1} \\quad\\text{and}\\quad ${b2}` },
      { explanation: TEXTS.solution.subtractValues,
        math: `${Math.max(b1, b2)} - ${Math.min(b1, b2)} = ${Math.abs(b1 - b2)}` },
    ] };
}

/** coefficient written with the variable: 3t, -t, -2h */
function coefLetter(c, v) {
  if (c === 1)  return v;
  if (c === -1) return `-${v}`;
  return `${c}${v}`;
}

/** The value of one line at time t, written out: 6 · 10 + 10 = 70   or   40 - 2 · 5 = 30 */
function valueExpr(story, b, a, t, result) {
  return story.dir === 'up'
    ? `${a} \\cdot ${t} + ${b} = ${a * t} + ${b} = ${result}`
    : `${b} - ${a} \\cdot ${t} = ${b} - ${a * t} = ${result}`;
}

// ─── register with the shared generator table (defined in equations.js) ──────
Object.assign(GENERATORS, {
  'func-compare': generateFunctionCompare,
});
