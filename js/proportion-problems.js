/**
 * proportion-problems.js
 * Direct (suoraan verrannollisuus) and inverse (kääntäen verrannollisuus) proportionality.
 *
 *   prop-direct    y ∝ x (price and weight), y ∝ x² (braking distance, free fall, pizza price),
 *                  y ∝ x³ (mass of a cube)
 *   prop-inverse   y ∝ 1/x (workers and days, speed and time), y ∝ 1/x² (light intensity)
 *   prop-identify  from a table: direct, inverse or neither? / find the constant k
 *
 * The numbers are chosen so that the answer is exact (at most two decimals).
 * Problems: { kind: 'value' | 'choice', text, question, answer, steps }.
 *
 * Load after equations.js (random helpers), polynomial-equations.js (pick) and numbers.js (gcdInt).
 */

// ─── helpers ──────────────────────────────────────────────────────────────────

/** 38.400000000000006 → "38.4" (the numbers here have at most 2 decimals) */
const num = n => String(Number(n.toFixed(4)));

/** Pairs (p, q) of different, coprime integers in [lo, hi]: the ratio p/q cannot be reduced */
function coprimePair(lo, hi) {
  for (;;) {
    const p = randInt(lo, hi), q = randInt(lo, hi);
    if (p !== q && gcdInt(p, q) === 1) return [p, q];
  }
}

// stories do not repeat within the last few problems of a level
const recentProportion = {};
function pickStory(level, list) {
  const recent  = recentProportion[level] = recentProportion[level] || [];
  const memory  = Math.min(3, list.length - 1);
  const choices = list.filter(s => !recent.includes(s));
  const chosen  = choices[randInt(0, choices.length - 1)];
  recent.push(chosen);
  if (recent.length > memory) recent.shift();
  return chosen;
}

const NAMES_P = ['Pekka', 'Aino', 'Matti', 'Liisa', 'Onni', 'Helmi', 'Eero', 'Venla', 'Mikko', 'Siiri'];

// ─── level 1: direct proportion ───────────────────────────────────────────────

/** y = rate · x, linear: the unit is (yUnit per xUnit) */
const LINEAR_STORIES = [
  { rates: [6.5, 8, 9.5, 12, 14.5], x: [2, 12], xUnit: 'kg', yUnit: '€',
    text: (who, x1, y1) => `${who} buys cheese at the market. ${x1} kg of cheese cost €${num(y1)}. The price is directly proportional to the weight.`,
    ask: x2 => `How much do ${x2} kg of cheese cost? (in €)` },
  { rates: [12.5, 14, 15.5, 18, 22], x: [3, 20], xUnit: 'h', yUnit: '€',
    text: (who, x1, y1) => `${who} earns €${num(y1)} for ${x1} hours of work. The pay is directly proportional to the hours worked.`,
    ask: x2 => `How much does the pay come to for ${x2} hours? (in €)` },
  { rates: [0.05, 0.06, 0.07, 0.08], x: [100, 500], step: 50, xUnit: 'km', yUnit: 'l',
    text: (who, x1, y1) => `${who}'s car uses ${num(y1)} litres of petrol on a ${x1} km trip. The consumption is directly proportional to the distance.`,
    ask: x2 => `How many litres does the car use on a ${x2} km trip?` },
  { rates: [2, 2.5, 5, 10, 25], x: [2, 12], xUnit: 'cm', yUnit: 'km',
    text: (who, x1, y1) => `On a map, ${x1} cm stands for ${num(y1)} km in reality. The real distance is directly proportional to the distance on the map.`,
    ask: x2 => `How many kilometres do ${x2} cm on the map stand for?` },
  { rates: [0.25, 0.5, 0.75], x: [4, 24], step: 4, xUnit: 'pancakes', yUnit: 'dl',
    text: (who, x1, y1) => `A recipe for ${x1} pancakes needs ${num(y1)} dl of flour. The amount of flour is directly proportional to the number of pancakes.`,
    ask: x2 => `How many decilitres of flour are needed for ${x2} pancakes?` },
  { rates: [14, 15, 16, 18, 22], x: [2, 9], xUnit: 'h', yUnit: 'km',
    text: (who, x1, y1) => `${who} cycles ${num(y1)} km in ${x1} hours at a constant speed. The distance is directly proportional to the time.`,
    ask: (x2, who) => `How far does ${who} cycle in ${x2} hours at the same speed? (in km)` },
];

/** y = u · x² or y = u · x³: the unit u is chosen so that the answer is exact */
const POWER_STORIES = [
  { power: 2, mult: 10, range: [3, 13], us: [0.4, 0.5, 0.6, 0.7], xSym: 'v', ySym: 's', xUnit: 'km/h', yUnit: 'm',
    text: (x1, y1) => `The braking distance of a car is directly proportional to the square of its speed. At ${x1} km/h the braking distance is ${num(y1)} m.`,
    ask: x2 => `How long is the braking distance at ${x2} km/h? (in m)` },
  { power: 2, mult: 1, range: [2, 8], us: [4.9], xSym: 't', ySym: 'd', xUnit: 's', yUnit: 'm',
    text: (x1, y1) => `The distance a stone falls in free fall is directly proportional to the square of the time. In ${x1} seconds it falls ${num(y1)} m.`,
    ask: x2 => `How far does the stone fall in ${x2} seconds? (in m)` },
  { power: 2, mult: 10, range: [2, 6], us: [1.5, 2, 2.5, 3, 4], xSym: 'd', ySym: 'C', xUnit: 'cm', yUnit: '€',
    text: (x1, y1) => `The price of a pizza is directly proportional to its area, so it is proportional to the square of its diameter. A pizza with a diameter of ${x1} cm costs €${num(y1)}.`,
    ask: x2 => `How much does a pizza with a diameter of ${x2} cm cost? (in €)` },
  { power: 3, mult: 1, range: [2, 6], us: [2.7, 7.8, 8.9], xSym: 'a', ySym: 'm', xUnit: 'cm', yUnit: 'g',
    text: (x1, y1) => `The mass of a metal cube is directly proportional to the cube of its edge length. A cube with an edge of ${x1} cm has a mass of ${num(y1)} g.`,
    ask: x2 => `What is the mass of a cube of the same metal with an edge of ${x2} cm? (in g)` },
];

/** Direct proportion: y ∝ x, x², x³ */
function generateDirectProportion() {
  const kind = pick(['linear', 'linear', 'linear', 'power', 'power', 'power']);

  if (kind === 'linear') {
    const st  = pickStory('direct-linear', LINEAR_STORIES);
    const who = pick(NAMES_P);
    const step = st.step || 1;
    let x1, x2;
    do {
      x1 = randInt(st.x[0] / step, st.x[1] / step) * step;
      x2 = randInt(st.x[0] / step, st.x[1] / step) * step;
    } while (x1 === x2);
    const rate = pick(st.rates);
    const y1 = rate * x1, y2 = rate * x2;

    return {
      kind: 'value',
      text: st.text(who, x1, y1),
      question: st.ask(x2, who),
      answer: Number(y2.toFixed(4)),
      meta: { type: 'linear', x1, y1, x2 },
      steps: [
        { explanation: TEXTS.proportion.directConstant,
          math: `k = \\dfrac{${num(y1)}\\,\\text{${st.yUnit}}}{${x1}\\,\\text{${st.xUnit}}} = ${num(rate)}\\,\\dfrac{\\text{${st.yUnit}}}{\\text{${st.xUnit}}}` },
        { explanation: TEXTS.proportion.multiplyByK,
          math: `${num(rate)} \\cdot ${x2} = ${num(y2)}\\,\\text{${st.yUnit}}` },
      ],
    };
  }

  // y ∝ x^n: the ratio of the x values is p/q in lowest terms
  const st = pickStory('direct-power', POWER_STORIES);
  const [p, q] = coprimePair(st.range[0], st.range[1]);
  const u  = pick(st.us);
  const n  = st.power;
  const x1 = q * st.mult, x2 = p * st.mult;
  const y1 = q ** n * u, y2 = p ** n * u;

  const ratio = `\\dfrac{${x2}}{${x1}}`;
  return {
    kind: 'value',
    text: st.text(x1, y1),
    question: st.ask(x2),
    answer: Number(y2.toFixed(4)),
    meta: { type: 'power', n, x1, y1, x2 },
    steps: [
      { explanation: TEXTS.proportion.directPower(n),
        math: `\\dfrac{${st.ySym}_2}{${st.ySym}_1} = \\left(\\dfrac{${st.xSym}_2}{${st.xSym}_1}\\right)^{${n}}` },
      ...(st.mult > 1 ? [{ explanation: TEXTS.proportion.reduceRatio,
        math: `\\dfrac{${st.xSym}_2}{${st.xSym}_1} = ${ratio} = \\dfrac{${p}}{${q}}` }] : []),
      { explanation: TEXTS.proportion.solveForSecond,
        math: `${st.ySym}_2 = ${num(y1)} \\cdot \\left(\\dfrac{${p}}{${q}}\\right)^{${n}} = ${num(y1)} \\cdot \\dfrac{${p ** n}}{${q ** n}} = ${num(y2)}` },
    ],
  };
}

// ─── level 2: inverse proportion ──────────────────────────────────────────────

/** x · y = K constant */
const INVERSE_STORIES = [
  { constants: [24, 36, 48, 60, 72, 120], pick: 'divisors', xSym: 'n', ySym: 't', xUnit: 'workers', yUnit: 'days',
    text: (who, x1, y1) => `${x1} workers build a fence in ${y1} days. All workers work at the same speed, so the time is inversely proportional to the number of workers.`,
    ask: x2 => `How many days do ${x2} workers need?` },
  { constants: [240, 360, 480, 600], pick: 'speeds', xSym: 'v', ySym: 't', xUnit: 'km/h', yUnit: 'h',
    text: (who, x1, y1) => `${who} drives from Tampere to a cabin. At a speed of ${x1} km/h the trip takes ${num(y1)} hours. The travel time is inversely proportional to the speed.`,
    ask: x2 => `How long does the trip take at ${x2} km/h? (in hours)` },
  { constants: [120, 240, 360], pick: 'divisors', xSym: 'n', ySym: 't', xUnit: 'pumps', yUnit: 'hours',
    text: (who, x1, y1) => `${x1} identical pumps empty a pool in ${y1} hours. The emptying time is inversely proportional to the number of pumps.`,
    ask: x2 => `How many hours do ${x2} pumps need?` },
  { constants: [120, 180, 240, 360], pick: 'divisors', xSym: 'n', ySym: 't', xUnit: 'people', yUnit: 'days',
    text: (who, x1, y1) => `The food supplies of a camp last ${y1} days for ${x1} people. The number of days is inversely proportional to the number of people.`,
    ask: x2 => `How many days would the same supplies last for ${x2} people?` },
];

/** y ∝ 1/x² */
const INVERSE_SQUARE_STORIES = [
  { xSym: 'd', ySym: 'I', xUnit: 'm', yUnit: 'lux', us: [2, 4, 5, 10, 20], mult: 1, range: [2, 6],
    text: (x1, y1) => `The intensity of the light from a lamp is inversely proportional to the square of the distance from the lamp. At a distance of ${x1} m the intensity is ${num(y1)} lux.`,
    ask: x2 => `What is the intensity at a distance of ${x2} m? (in lux)` },
  { xSym: 'd', ySym: 'S', xUnit: 'm', yUnit: 'units', us: [4, 5, 8, 10, 25], mult: 10, range: [2, 6],
    text: (x1, y1) => `The strength of a radio signal is inversely proportional to the square of the distance from the transmitter. At a distance of ${x1} m the strength is ${num(y1)} units.`,
    ask: x2 => `What is the signal strength at a distance of ${x2} m? (in units)` },
];

/** Inverse proportion: y ∝ 1/x or 1/x² */
function generateInverseProportion() {
  if (randInt(1, 4) <= 3) {
    const st  = pickStory('inverse', INVERSE_STORIES);
    const who = pick(NAMES_P);
    const K   = pick(st.constants);

    // two different values of x: divisors of K, or (for speeds) a list that divides K well
    const candidates = st.pick === 'speeds' ? [40, 50, 60, 80, 100, 120]
                                            : Array.from({ length: K }, (_, i) => i + 1).filter(d => K % d === 0 && d >= 2 && d <= 30);
    let x1, x2;
    do { x1 = pick(candidates); x2 = pick(candidates); } while (x1 === x2);
    const y1 = K / x1, y2 = K / x2;

    return {
      kind: 'value',
      text: st.text(who, x1, y1),
      question: st.ask(x2),
      answer: Number(y2.toFixed(4)),
      meta: { type: 'inverse', x1, y1, x2 },
      steps: [
        { explanation: TEXTS.proportion.inverseConstant,
          math: `${st.xSym}_1 \\cdot ${st.ySym}_1 = ${x1} \\cdot ${num(y1)} = ${K}` },
        { explanation: TEXTS.proportion.sameProduct,
          math: `${x2} \\cdot ${st.ySym}_2 = ${K}` },
        { explanation: TEXTS.solution.divide(x2),
          math: `${st.ySym}_2 = \\dfrac{${K}}{${x2}} = ${num(y2)}\\,\\text{${st.yUnit}}` },
      ],
    };
  }

  // y ∝ 1/x²: y2 = y1 · (x1/x2)²
  const st = pickStory('inverse-square', INVERSE_SQUARE_STORIES);
  const [p, q] = coprimePair(st.range[0], st.range[1]);
  const u  = pick(st.us);
  const x1 = p * st.mult, x2 = q * st.mult;                    // distances in the ratio p : q
  const y1 = q ** 2 * u, y2 = p ** 2 * u;

  return {
    kind: 'value',
    text: st.text(x1, y1),
    question: st.ask(x2),
    answer: Number(y2.toFixed(4)),
    meta: { type: 'inverseSquare', x1, y1, x2 },
    steps: [
      { explanation: TEXTS.proportion.inversePower(2),
        math: `\\dfrac{${st.ySym}_2}{${st.ySym}_1} = \\left(\\dfrac{${st.xSym}_1}{${st.xSym}_2}\\right)^2` },
      ...(st.mult > 1 ? [{ explanation: TEXTS.proportion.reduceRatio,
        math: `\\dfrac{${st.xSym}_1}{${st.xSym}_2} = \\dfrac{${x1}}{${x2}} = \\dfrac{${p}}{${q}}` }] : []),
      { explanation: TEXTS.proportion.solveForSecond,
        math: `${st.ySym}_2 = ${num(y1)} \\cdot \\left(\\dfrac{${p}}{${q}}\\right)^2 = ${num(y1)} \\cdot \\dfrac{${p ** 2}}{${q ** 2}} = ${num(y2)}` },
    ],
  };
}

// ─── level 3: which kind of dependence? ───────────────────────────────────────

/** A table x | y as a LaTeX array */
function tableLatex(xs, ys) {
  return `\\begin{array}{c|${'c'.repeat(xs.length)}} x & ${xs.join(' & ')} \\\\ \\hline y & ${ys.join(' & ')} \\end{array}`;
}

/** From a table: direct, inverse or neither? / find the constant of proportionality */
function generateIdentifyProportion() {
  const type  = pick(['direct', 'inverse', 'neither']);
  const askK  = type !== 'neither' && randInt(1, 5) <= 2;        // typed: find the constant k
  const offsetLine = randInt(1, 2) === 1;                        // "neither": y = ax + b, or y = x²
  let xs, ys, k;

  if (type === 'direct') {
    k  = pick([2, 3, 4, 5, 6, 7, 1.5, 2.5, 0.5]);
    xs = [2, 4, 6, 8];
    ys = xs.map(v => k * v);
  } else if (type === 'inverse') {
    k  = pick([12, 24, 36, 48, 60]);
    const divisors = Array.from({ length: k }, (_, i) => i + 1).filter(d => k % d === 0 && d >= 2);
    xs = divisors.sort((a, b) => a - b).slice(0, 4);
    ys = xs.map(v => k / v);
  } else if (offsetLine) {                                       // y = ax + b with b ≠ 0
    const a = randInt(2, 5);
    let b;
    do { b = randNZ(8); } while (a + b <= 0);                  // keep all the values positive
    xs = [1, 2, 3, 4];
    ys = xs.map(v => a * v + b);
  } else {                                                      // y = x²
    xs = [1, 2, 3, 4];
    ys = xs.map(v => v * v);
  }

  const table = `$$${tableLatex(xs, ys.map(num))}$$`;

  if (askK) {
    const direct = type === 'direct';
    return {
      kind: 'value',
      text: direct
        ? `The table shows values of two quantities. $y$ is directly proportional to $x$, that is $y = kx$. ${table}`
        : `The table shows values of two quantities. $y$ is inversely proportional to $x$, that is $y = \\dfrac{k}{x}$. ${table}`,
      question: 'What is the constant of proportionality $k$?',
      answer: Number(k.toFixed(4)),
      steps: direct ? [
        { explanation: TEXTS.proportion.kFromRatio, math: `k = \\dfrac{y}{x} = \\dfrac{${num(ys[0])}}{${xs[0]}} = ${num(k)}` },
        { explanation: TEXTS.proportion.checkOthers, math: `\\dfrac{${num(ys[1])}}{${xs[1]}} = ${num(ys[1] / xs[1])}` },
      ] : [
        { explanation: TEXTS.proportion.kFromProduct, math: `k = x \\cdot y = ${xs[0]} \\cdot ${num(ys[0])} = ${num(k)}` },
        { explanation: TEXTS.proportion.checkOthers, math: `${xs[1]} \\cdot ${num(ys[1])} = ${num(xs[1] * ys[1])}` },
      ],
    };
  }

  const options = ['$y$ is directly proportional to $x$', '$y$ is inversely proportional to $x$', '$y$ is neither directly nor inversely proportional to $x$'];
  const answer  = type === 'direct' ? 0 : type === 'inverse' ? 1 : 2;

  const ratios   = xs.map((x, i) => num(ys[i] / x));
  const products = xs.map((x, i) => num(x * ys[i]));
  const steps = [
    { explanation: TEXTS.proportion.testRatio,   math: `\\dfrac{y}{x}: \\quad ${ratios.join(',\\; ')}` },
    { explanation: TEXTS.proportion.testProduct, math: `x \\cdot y: \\quad ${products.join(',\\; ')}` },
    { explanation: [TEXTS.proportion.concludeDirect, TEXTS.proportion.concludeInverse, TEXTS.proportion.concludeNeither][answer], math: '' },
  ];

  return {
    kind: 'choice',
    text: `The table shows values of two quantities. ${table}`,
    question: 'Which statement is true?',
    options, answer, steps,
  };
}

// ─── register with the shared generator table (defined in equations.js) ──────
Object.assign(GENERATORS, {
  'prop-direct':   generateDirectProportion,
  'prop-inverse':  generateInverseProportion,
  'prop-identify': generateIdentifyProportion,
});
