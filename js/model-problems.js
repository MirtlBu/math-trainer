/**
 * model-problems.js
 * Linear models built from the data of a story (word problems about a constant rate of change).
 *
 *   model-data         find the rate / the starting value from the given data, then a time or a value
 *   model-containers   a container filled with identical objects (two scenarios → a system of equations)
 *   model-consistency  is the information in the story consistent, or does it contradict itself?
 *
 * Problems: { kind: 'numbers', ordered: true, labels, hint, text, question, answer, steps, meta }
 * or (consistency) { kind: 'choice', … }. All numbers are chosen so that every answer is exact.
 *
 * Load after word-problems.js (NAMES, pickFresh, listLatex), polynomial-equations.js (pick),
 * equations.js (random helpers) and texts.js.
 */

// ─── helpers ──────────────────────────────────────────────────────────────────

/** 38.400000000000006 → "38.4" */
const mnum = n => String(Number(n.toFixed(4)));

const plural = (n, one, many) => (n === 1 ? one : many);

// ─── level 1: a model from the data ───────────────────────────────────────────

/**
 * One story = a quantity that changes by a constant rate per unit of time.
 *   dir        'up' or 'down'
 *   unit       [singular, plural] of the time unit
 *   fmt(n)     an amount with its unit
 *   y0s, rs    possible starting values and rates (rs: per time unit)
 *   zero       the target is 0 (the loan is paid off, the tank is empty): then y0 = r·tT
 *   target(T)  a sentence naming the target value (null when the target is 0 and obvious)
 *   limit      largest value the quantity may have (batteries: 100 %)
 *   startKnown if set, the starting value is fixed (a full battery) and only the rate is unknown
 */
const MODEL_THEMES = [
  { dir: 'down', unit: ['month', 'months'], zero: true, fmt: n => `€${n}`, rs: [100, 120, 150, 200, 250],
    intro: who => `${who} took out a loan and pays it back by paying the same amount every month.`,
    start: y0 => `The original loan was €${y0}.`,
    at: (t, v) => `After ${t} ${plural(t, 'month', 'months')} the remaining debt is €${v}.`,
    rate: (who, r) => `${who} pays back €${r} every month.`,
    labels: { rate: 'Monthly payment (€)', start: 'Original loan (€)', time: () => 'Months until the loan is paid off', value: t => `Remaining debt after ${t} months (€)` } },
  { dir: 'up', unit: ['second', 'seconds'], fmt: n => `${n} MB`, y0s: [50, 100, 150, 200], rs: [10, 15, 20, 25, 30, 40],
    intro: who => `${who} copies files to a flash drive at a constant speed.`,
    start: y0 => `The drive already contains ${y0} MB.`,
    at: (t, v) => `After ${t} ${plural(t, 'second', 'seconds')} it contains ${v} MB.`,
    rate: (who, r) => `The copying speed is ${r} MB per second.`,
    target: T => `The capacity of the drive is ${T} MB.`,
    labels: { rate: 'Speed (MB per second)', start: 'Data at the start (MB)', time: () => 'Seconds until the drive is full', value: t => `Data after ${t} seconds (MB)` } },
  { dir: 'up', unit: ['week', 'weeks'], fmt: n => `€${n}`, y0s: [50, 80, 100, 120, 200], rs: [10, 15, 20, 25, 30, 40, 50],
    intro: who => `${who} saves money in an account by depositing the same amount every week.`,
    start: y0 => `The account already has €${y0}.`,
    at: (t, v) => `After ${t} ${plural(t, 'week', 'weeks')} it has €${v}.`,
    rate: (who, r) => `${who} deposits €${r} every week.`,
    target: T => `The goal is to save €${T}.`,
    labels: { rate: 'Weekly deposit (€)', start: 'Money at the start (€)', time: T => `Weeks until the account has €${T}`, value: t => `Money after ${t} weeks (€)` } },
  { dir: 'up', unit: ['minute', 'minutes'], fmt: n => `${n} pages`, y0s: [100, 150, 250, 300], rs: [20, 30, 40, 50, 60, 80],
    intro: () => 'A printing machine prints at a constant speed.',
    start: y0 => `It has already printed ${y0} pages.`,
    at: (t, v) => `After ${t} ${plural(t, 'minute', 'minutes')} it has printed ${v} pages.`,
    rate: (who, r) => `It prints ${r} pages per minute.`,
    target: T => `The whole job is ${T} pages.`,
    labels: { rate: 'Speed (pages per minute)', start: 'Pages at the start', time: () => 'Minutes until the job is done', value: t => `Pages printed after ${t} minutes` } },
  { dir: 'up', unit: ['minute', 'minutes'], fmt: n => `${n} litres`, y0s: [200, 400, 800, 1000], rs: [25, 40, 50, 60, 75, 100],
    intro: () => 'A swimming pool is filled with a pump at a constant rate.',
    start: y0 => `The pool already contains ${y0} litres of water.`,
    at: (t, v) => `After ${t} ${plural(t, 'minute', 'minutes')} it contains ${v} litres.`,
    rate: (who, r) => `The pump adds ${r} litres per minute.`,
    target: T => `The pool is full at ${T} litres.`,
    labels: { rate: 'Pumping rate (litres per minute)', start: 'Water at the start (litres)', time: () => 'Minutes until the pool is full', value: t => `Water after ${t} minutes (litres)` } },
  { dir: 'down', unit: ['hour', 'hours'], fmt: n => `${n}%`, limit: 100, rs: [5, 8, 10, 12],
    intro: who => `${who}'s phone is running a game and the battery drains at a constant rate.`,
    start: y0 => `At the start the battery is at ${y0}%.`,
    at: (t, v) => `After ${t} ${plural(t, 'hour', 'hours')} the battery is at ${v}%.`,
    rate: (who, r) => `The battery loses ${r} percentage points every hour.`,
    target: T => `The phone warns about low battery at ${T}%.`,
    labels: { rate: 'Loss per hour (percentage points)', start: 'Battery at the start (%)', time: T => `Hours until the battery is at ${T}%`, value: t => `Battery after ${t} hours (%)` } },
  { dir: 'down', unit: ['hour', 'hours'], fmt: n => `${n}%`, startKnown: 100, zero: true, rs: [4, 5, 10, 20],
    intro: () => 'A robot starts its mission with a fully charged battery and loses energy at a constant rate.',
    start: () => 'At the start the battery is at 100%.',
    at: (t, v) => `After ${t} ${plural(t, 'hour', 'hours')} ${v}% of the battery remains.`,
    rate: (who, r) => `The robot loses ${r}% of the battery every hour.`,
    labels: { rate: 'Loss per hour (%)', start: 'Battery at the start (%)', time: () => 'Hours until the battery is empty', value: t => `Battery after ${t} hours (%)` } },
  { dir: 'up', unit: ['hour', 'hours'], fmt: n => `${n} km`, y0s: [0, 40, 60, 120], rs: [60, 70, 80, 90, 100],
    intro: () => 'A car drives along a straight road at a constant speed.',
    start: y0 => `At the start of the observation the car has driven ${y0} km.`,
    at: (t, v) => `After ${t} ${plural(t, 'hour', 'hours')} it has driven ${v} km.`,
    rate: (who, r) => `The car drives at ${r} km/h.`,
    target: T => `The destination is ${T} km from the starting point.`,
    labels: { rate: 'Speed (km/h)', start: 'Distance at the start (km)', time: () => 'Hours until the car reaches the destination', value: t => `Distance after ${t} hours (km)` } },
  { dir: 'down', unit: ['minute', 'minutes'], fmt: n => `${n} litres`, zero: true, rs: [20, 25, 40, 50],
    intro: () => 'A water tank is drained at a constant rate.',
    start: y0 => `At the start the tank contains ${y0} litres.`,
    at: (t, v) => `After ${t} ${plural(t, 'minute', 'minutes')} it contains ${v} litres.`,
    rate: (who, r) => `Water is drained at ${r} litres per minute.`,
    labels: { rate: 'Drain rate (litres per minute)', start: 'Water at the start (litres)', time: () => 'Minutes until the tank is empty', value: t => `Water after ${t} minutes (litres)` } },
];

/** The linear model y = y0 + s·r·t */
const modelValue = (m, t) => m.y0 + m.s * m.r * t;

/** "y = 150 + 30t" / "y = 500 - 25t" */
const modelEquation = m => (m.s > 0 ? `y = ${m.y0} + ${m.r}t` : `y = ${m.y0} - ${m.r}t`);

/** Pick the numbers of one story so that every answer is a whole number */
function modelNumbers(theme) {
  const s = theme.dir === 'up' ? 1 : -1;
  for (let tries = 0; tries < 200; tries++) {
    const r = pick(theme.rs);
    const tT = randInt(6, 14);                                    // the time to the target
    let y0, T;
    if (theme.zero) {                                             // down to 0: y0 = r·tT
      T = 0;
      y0 = theme.startKnown || r * tT;
    } else if (s > 0) {
      y0 = pick(theme.y0s);
      T = y0 + r * tT;
    } else {                                                      // down to a target T > 0
      T = pick([0, 10, 20, 30].filter(v => v > 0));
      y0 = T + r * tT;
    }
    if (theme.limit && y0 > theme.limit) continue;
    if (theme.startKnown) {                                       // the time to 0 must be a whole number
      if (theme.startKnown % r !== 0) continue;
    }
    const tTime = theme.zero ? y0 / r : tT;                       // whole by construction
    if (!Number.isInteger(tTime) || tTime < 4) continue;

    const t1 = randInt(1, tTime - 3);
    const t2 = randInt(t1 + 1, tTime - 1);
    // a later time for "the value after t3"
    const maxT3 = s > 0 ? tTime + 3 : tTime - 1;
    const t3 = randInt(t2 + 1, Math.max(t2 + 1, maxT3));
    if (s < 0 && y0 - r * t3 < 0) continue;
    return { s, r, y0, T, tT: tTime, t1, t2, t3 };
  }
  throw new Error('model-problems: could not find numbers');
}

/** Find the rate and the time / value from the data of a story */
function generateModelData() {
  const theme = pickFresh('model-data', MODEL_THEMES);
  const who = pick(NAMES);
  const given = modelNumbers(theme);
  const { s, r, y0, T, tT, t1, t2, t3 } = given;
  const m = { y0, r, s };
  const v1 = modelValue(m, t1), v2 = modelValue(m, t2), v3 = modelValue(m, t3);
  const L = theme.labels;

  // what is known: the starting value and one point / the rate and one point / two points
  const types = theme.startKnown !== undefined ? ['startAndPoint'] : ['startAndPoint', 'ratePoint', 'twoPoints', 'twoPoints'];
  const type  = pick(types);
  const hasTarget = !!theme.target || theme.zero;
  const targetSentence = theme.target ? ` ${theme.target(T)}` : '';
  const targetLabel = L.time(T);
  const askTime = type !== 'twoPoints' || (hasTarget && randInt(1, 2) === 1);

  const pieces = [theme.intro(who)];
  let labels, answer;
  const steps = [];
  const sign = s > 0 ? '+' : '-';

  steps.push({ explanation: TEXTS.model.linear(s > 0), math: s > 0 ? 'y = y_0 + r t' : 'y = y_0 - r t' });

  if (type === 'startAndPoint') {
    pieces.push(theme.start(y0), theme.at(t1, v1));
    labels = [L.rate, targetLabel];
    answer = [r, tT];
    steps.push(
      { explanation: TEXTS.model.useKnownPoint,
        math: `${v1} = ${y0} ${sign} r \\cdot ${t1}` },
      { explanation: TEXTS.model.solveRate,
        math: `r = \\dfrac{${s > 0 ? `${v1} - ${y0}` : `${y0} - ${v1}`}}{${t1}} = ${r}` },
    );
  } else if (type === 'ratePoint') {
    pieces.push(theme.rate(who, r), theme.at(t1, v1));
    labels = [L.start, targetLabel];
    answer = [y0, tT];
    steps.push(
      { explanation: TEXTS.model.useKnownPointStart, math: `${v1} = y_0 ${sign} ${r} \\cdot ${t1}` },
      { explanation: TEXTS.model.solveStart,
        math: `y_0 = ${v1} ${s > 0 ? '-' : '+'} ${r * t1} = ${y0}` },
    );
  } else {
    pieces.push(theme.at(t1, v1), theme.at(t2, v2));
    labels = askTime ? [L.rate, L.start, targetLabel] : [L.rate, L.start, L.value(t3)];
    answer = askTime ? [r, y0, tT] : [r, y0, v3];
    steps.push(
      { explanation: TEXTS.model.rateFromTwoPoints,
        math: `r = \\dfrac{${s > 0 ? `${v2} - ${v1}` : `${v1} - ${v2}`}}{${t2} - ${t1}} = \\dfrac{${r * (t2 - t1)}}{${t2 - t1}} = ${r}` },
      { explanation: TEXTS.model.startFromPoint,
        math: `y_0 = ${v1} ${s > 0 ? '-' : '+'} ${r} \\cdot ${t1} = ${y0}` },
    );
  }

  if (askTime) {
    if (hasTarget) pieces.push(theme.zero ? '' : targetSentence.trim());
    steps.push(
      { explanation: TEXTS.model.timeToTarget(T),
        math: s > 0 ? `${T} = ${y0} + ${r}t` : `${T} = ${y0} - ${r}t` },
      { explanation: TEXTS.model.solveTime,
        math: `t = \\dfrac{${s > 0 ? `${T} - ${y0}` : `${y0} - ${T}`}}{${r}} = ${tT}` },
    );
  } else {
    steps.push(
      { explanation: TEXTS.model.valueAtTime(t3),
        math: `y(${t3}) = ${y0} ${sign} ${r} \\cdot ${t3} = ${v3}` },
    );
  }

  const text = pieces.filter(Boolean).join(' ');
  steps.push({ explanation: TEXTS.words.answerIs, math: listLatex(answer) });

  return {
    kind: 'numbers', ordered: true,
    text,
    question: TEXTS.model.askAll,
    labels,
    hint: TEXTS.words.orderHint,
    answer,
    equation: modelEquation(m),
    steps,
    meta: { s, r, y0, T, tT, t1, t2, t3, type, askTime },
  };
}

// ─── level 1b: the same, with a decimal rate ──────────────────────────────────

/**
 * Quantities that grow up to a limit at a decimal rate (a battery is charged, a file is downloaded …).
 *   cap        the limit (100 % or a capacity)
 *   rs         possible rates per time unit (tenths)
 *   fmt        an amount with its unit
 */
const DECIMAL_THEMES = [
  { cap: 100, rs: [0.5, 0.8, 1.2, 1.5, 1.6, 2.2, 2.5, 3.2], fmt: n => `${n} percent`, unit: ['minute', 'minutes'],
    intro: 'A battery was charged.',
    start: y0 => `When the charging began, it was ${y0} percent full.`,
    at: (t, v) => `After ${t} minutes of charging, the battery was ${v} percent full.`,
    rate: r => `The battery is charged by ${mnum(r)} percentage points every minute.`,
    labels: { rate: 'Charging speed (percentage points per minute)', start: 'Battery at the start (%)', time: 'Minutes until the battery is fully charged' } },
  { cap: 100, rs: [0.4, 0.5, 0.8, 1.5, 2.5, 3.5], unit: ['second', 'seconds'],
    intro: 'A file is being downloaded at a constant speed.',
    start: y0 => `When the observation began, ${y0} percent of the file had been downloaded.`,
    at: (t, v) => `After ${t} seconds, ${v} percent had been downloaded.`,
    rate: r => `The download progresses by ${mnum(r)} percentage points every second.`,
    labels: { rate: 'Download speed (percentage points per second)', start: 'Downloaded at the start (%)', time: 'Seconds until the download is complete' } },
  { cap: 100, rs: [0.5, 0.6, 0.8, 1.2, 1.5, 2.5], unit: ['hour', 'hours'],
    intro: 'A solar-powered scooter battery is charged.',
    start: y0 => `At the start of charging the battery was ${y0} percent full.`,
    at: (t, v) => `After ${t} hours it was ${v} percent full.`,
    rate: r => `The battery is charged by ${mnum(r)} percentage points every hour.`,
    labels: { rate: 'Charging speed (percentage points per hour)', start: 'Battery at the start (%)', time: 'Hours until the battery is fully charged' } },
];

/** Charging / downloading: the rate is a decimal, every answer is still exact */
function generateModelDecimal() {
  const theme = pickFresh('model-decimal', DECIMAL_THEMES);
  const cap = theme.cap;
  for (;;) {
    const r = pick(theme.rs);
    const rt = Math.round(r * 10);
    const m = 10 / (function g(a, b) { return b ? g(b, a % b) : a; })(rt, 10);   // r·m is a whole number
    const kT = randInt(3, 10), tT = m * kT * (m === 1 ? randInt(2, 4) : 1);
    const y0 = cap - Math.round(r * tT);
    if (y0 < 5 || y0 > 60) continue;
    const k1 = randInt(1, Math.floor(tT / m) - 1), t1 = m * k1;
    const k2 = randInt(k1 + 1, Math.floor(tT / m)), t2 = m * k2;
    if (t2 >= tT) continue;
    const v1 = y0 + Math.round(r * t1), v2 = y0 + Math.round(r * t2);

    const L = theme.labels;
    const type = pick(['startPoint', 'startPoint', 'twoPoints', 'ratePoint']);
    const pieces = [theme.intro];
    const steps = [{ explanation: TEXTS.model.linear(true), math: 'y = y_0 + r t' }];
    let labels, answer;
    if (type === 'startPoint') {
      pieces.push(theme.start(y0), theme.at(t1, v1));
      labels = [L.rate, L.time]; answer = [r, tT];
      steps.push(
        { explanation: TEXTS.model.useKnownPoint, math: `${v1} = ${y0} + r \\cdot ${t1}` },
        { explanation: TEXTS.model.solveRate, math: `r = \\dfrac{${v1} - ${y0}}{${t1}} = \\dfrac{${v1 - y0}}{${t1}} = ${mnum(r)}` });
    } else if (type === 'ratePoint') {
      pieces.push(theme.rate(r), theme.at(t1, v1));
      labels = [L.start, L.time]; answer = [y0, tT];
      steps.push(
        { explanation: TEXTS.model.useKnownPointStart, math: `${v1} = y_0 + ${mnum(r)} \\cdot ${t1}` },
        { explanation: TEXTS.model.solveStart, math: `y_0 = ${v1} - ${v1 - y0} = ${y0}` });
    } else {
      pieces.push(theme.at(t1, v1), theme.at(t2, v2));
      labels = [L.rate, L.start, L.time]; answer = [r, y0, tT];
      steps.push(
        { explanation: TEXTS.model.rateFromTwoPoints,
          math: `r = \\dfrac{${v2} - ${v1}}{${t2} - ${t1}} = \\dfrac{${v2 - v1}}{${t2 - t1}} = ${mnum(r)}` },
        { explanation: TEXTS.model.startFromPoint, math: `y_0 = ${v1} - ${mnum(r)} \\cdot ${t1} = ${y0}` });
    }
    steps.push(
      { explanation: TEXTS.model.timeToTarget(cap), math: `${cap} = ${y0} + ${mnum(r)}t` },
      { explanation: TEXTS.model.solveTime, math: `t = \\dfrac{${cap} - ${y0}}{${mnum(r)}} = \\dfrac{${cap - y0}}{${mnum(r)}} = ${tT}` },
      { explanation: TEXTS.words.answerIs, math: listLatex(answer.map(mnum)) });
    return {
      kind: 'numbers', ordered: true,
      text: pieces.join(' '),
      question: TEXTS.model.askAll,
      labels, hint: TEXTS.words.orderHint, answer,
      equation: `y = ${y0} + ${mnum(r)}t`,
      steps,
      meta: { r, y0, T: cap, tT, t1, t2, v1, v2, type },
    };
  }
}

// ─── level 2: containers and identical objects ────────────────────────────────

const CONTAINERS = [
  { container: 'aquarium', objects: 'marbles',  object: 'marble',  ws: [0.5, 1, 1.5, 2],   Vs: [40, 50, 56, 60, 72] },
  { container: 'fish tank', objects: 'stones',  object: 'stone',   ws: [1, 2, 3],          Vs: [30, 36, 45, 50, 60] },
  { container: 'bucket',   objects: 'rocks',    object: 'rock',    ws: [1, 1.5, 2, 2.5],   Vs: [24, 30, 36, 45] },
  { container: 'glass jar', objects: 'pebbles', object: 'pebble',  ws: [0.2, 0.25, 0.5],   Vs: [8, 10, 12, 15] },
];

/** A container that is filled up with water after some objects have been put in */
function generateModelContainers() {
  const c = pickFresh('model-containers', CONTAINERS);
  const known = randInt(1, 5) <= 2;                               // the volume of one object is given
  for (;;) {
    const w = pick(c.ws), V = pick(c.Vs);
    const maxN = Math.floor((V - 2) / w);                        // most objects that still leave 2 litres free
    if (maxN < 10) continue;
    const n1 = randInt(3, Math.floor(maxN / 2));
    const n2Max = Math.min(maxN - 1, n1 + 12);
    if (n2Max < n1 + 3) continue;
    const n2 = randInt(n1 + 3, n2Max);
    const n3 = randInt(2, maxN - 1);
    if ([n1, n2].includes(n3)) continue;
    const W1 = V - n1 * w, W2 = V - n2 * w, W3 = V - n3 * w;
    if (W3 <= 0) continue;

    const unit = 'litres';
    if (known) {
      const text = `${c.objects[0].toUpperCase()}${c.objects.slice(1)} of equal size are put into an empty ${c.container}; each ${c.object} has a volume of ${mnum(w)} litres. After ${n1} ${c.objects} are put in, ${mnum(W1)} litres of water are needed to fill the ${c.container} completely.`;
      return {
        kind: 'numbers', ordered: true,
        text,
        question: TEXTS.model.askAll,
        labels: [`Volume of the ${c.container} (litres)`, `Number of ${c.objects} if ${mnum(W3)} litres of water fill it`],
        hint: TEXTS.words.orderHint,
        answer: [V, n3],
        equation: `V - ${mnum(w)} \\cdot ${n1} = ${mnum(W1)}`,
        steps: [
          { explanation: TEXTS.model.containerModel(c.container, c.objects), math: 'V = \\text{water} + \\text{objects}' },
          { explanation: TEXTS.model.volumeFromOne, math: `V = ${mnum(W1)} + ${n1} \\cdot ${mnum(w)} = ${mnum(V)}` },
          { explanation: TEXTS.model.objectsForWater(mnum(W3)), math: `${mnum(V)} = ${mnum(W3)} + n \\cdot ${mnum(w)}` },
          { explanation: TEXTS.model.solveCount, math: `n = \\dfrac{${mnum(V)} - ${mnum(W3)}}{${mnum(w)}} = ${n3}` },
          { explanation: TEXTS.words.answerIs, math: listLatex([V, n3]) },
        ],
        meta: { known, V, w, n1, n2, n3, W1, W3 },
      };
    }

    const text = `Identical ${c.objects} are put into an empty ${c.container}. After ${n1} ${c.objects} are put in, ${mnum(W1)} litres of water are needed to fill the ${c.container} completely. With ${n2} ${c.objects} put in, ${mnum(W2)} litres are needed.`;
    return {
      kind: 'numbers', ordered: true,
      text,
      question: TEXTS.model.askAll,
      labels: [`Volume of the ${c.container} (litres)`, `Volume of one ${c.object} (litres)`, `Number of ${c.objects} if ${mnum(W3)} litres of water fill it`],
      hint: TEXTS.words.orderHint,
      answer: [V, w, n3],
      equation: `V - ${n1}w = ${mnum(W1)}`,
      steps: [
        { explanation: TEXTS.model.containerSystem(c.container, c.objects), math: `V - ${n1}w = ${mnum(W1)}, \\quad V - ${n2}w = ${mnum(W2)}` },
        { explanation: TEXTS.model.subtractEquations,
          math: `(${n2} - ${n1})w = ${mnum(W1)} - ${mnum(W2)} \\quad\\Rightarrow\\quad ${n2 - n1}w = ${mnum(W1 - W2)}` },
        { explanation: TEXTS.solution.divide(n2 - n1), math: `w = ${mnum(w)}` },
        { explanation: TEXTS.model.volumeFromOne, math: `V = ${mnum(W1)} + ${n1} \\cdot ${mnum(w)} = ${mnum(V)}` },
        { explanation: TEXTS.model.objectsForWater(mnum(W3)), math: `${mnum(V)} - n \\cdot ${mnum(w)} = ${mnum(W3)}` },
        { explanation: TEXTS.model.solveCount, math: `n = \\dfrac{${mnum(V)} - ${mnum(W3)}}{${mnum(w)}} = ${n3}` },
        { explanation: TEXTS.words.answerIs, math: listLatex([V, w, n3].map(mnum)) },
      ],
      meta: { known, V, w, n1, n2, n3, W1, W2, W3 },
    };
  }
}

// ─── level 3: is the information consistent? ──────────────────────────────────

const CONSISTENCY_OPTIONS = [
  'The information is consistent.',
  'The information is not consistent: the real value would be larger than the one stated.',
  'The information is not consistent: the real value would be smaller than the one stated.',
];

/** A claim that either follows from the rates or contradicts them */
function generateModelConsistency() {
  const consistent = randInt(1, 2) === 1;
  const type = pick(['difference', 'difference', 'single']);

  if (type === 'difference') {
    // two people paying back loans or saving: the difference between them after m periods
    const debt = randInt(1, 2) === 1;
    const [a, b] = [randInt(100, 250), randInt(100, 250)].map(v => Math.round(v / 10) * 10);
    if (a === b) return generateModelConsistency();
    const [p1, p2] = (() => { const x = pick(NAMES); let y; do { y = pick(NAMES); } while (y === x); return [x, y]; })();
    const D = randInt(5, 20) * 100;                               // the difference at the start (p1 − p2)
    const m = randInt(3, 9);
    // debts shrink by the payment, savings grow by the deposit
    const real = debt ? D + m * (b - a) : D + m * (a - b);
    const stated = consistent ? real : real + pick([-1, 1]) * randInt(2, 8) * 50;
    if (stated <= 0 && !consistent) return generateModelConsistency();
    if (real <= 0) return generateModelConsistency();

    const text = debt
      ? `${p1} and ${p2} both owe money to a bank. ${p1} pays back €${a} every month and ${p2} pays back €${b} every month. At the start ${p1} owes €${D} more than ${p2}. After ${m} months ${p1} still owes €${stated} more than ${p2}.`
      : `${p1} and ${p2} both save money. ${p1} saves €${a} every month and ${p2} saves €${b} every month. At the start ${p1} has €${D} more than ${p2}. After ${m} months ${p1} has €${stated} more than ${p2}.`;

    const answer = consistent ? 0 : (real > stated ? 1 : 2);
    const change = debt ? `${m} \\cdot (${b} - ${a})` : `${m} \\cdot (${a} - ${b})`;
    return {
      kind: 'choice',
      text,
      question: 'Is the information consistent?',
      options: CONSISTENCY_OPTIONS, answer,
      steps: [
        { explanation: debt ? TEXTS.model.differenceDebt : TEXTS.model.differenceSavings,
          math: `${D} + ${change}` },
        { explanation: TEXTS.model.calculateReal, math: `${D} + ${change} = ${real}` },
        { explanation: consistent ? TEXTS.model.matches(stated) : TEXTS.model.contradicts(real, stated),
          math: consistent ? `${real} = ${stated}` : `${real} \\neq ${stated}` },
      ],
      meta: { type, consistent, real, stated },
    };
  }

  // one quantity with a rate: the value after some time is quoted
  const theme = pickFresh('model-consistency', MODEL_THEMES.filter(t => !t.startKnown && !t.zero));
  const who = pick(NAMES);
  const s = theme.dir === 'up' ? 1 : -1;
  const r = pick(theme.rs);
  const t = randInt(3, 12);
  const y0 = s > 0 ? pick(theme.y0s) : Math.min(theme.limit || 1000, r * t + pick([20, 30, 40]));
  if (theme.limit && y0 > theme.limit) return generateModelConsistency();
  const real = y0 + s * r * t;
  if (real < 0) return generateModelConsistency();
  const stated = consistent ? real : Math.max(0, real + pick([-1, 1]) * randInt(2, 6) * (r >= 20 ? 10 : 5));
  if (!consistent && stated === real) return generateModelConsistency();

  const text = [theme.intro(who), theme.start(y0), theme.rate(who, r), theme.at(t, stated)].join(' ');
  const answer = consistent ? 0 : (real > stated ? 1 : 2);
  return {
    kind: 'choice',
    text,
    question: 'Is the information consistent?',
    options: CONSISTENCY_OPTIONS, answer,
    steps: [
      { explanation: TEXTS.model.valueAtTime(t),
        math: `${y0} ${s > 0 ? '+' : '-'} ${r} \\cdot ${t} = ${real}` },
      { explanation: consistent ? TEXTS.model.matches(stated) : TEXTS.model.contradicts(real, stated),
        math: consistent ? `${real} = ${stated}` : `${real} \\neq ${stated}` },
    ],
    meta: { type, consistent, real, stated },
  };
}

// ─── register with the shared generator table (defined in equations.js) ──────
Object.assign(GENERATORS, {
  'model-data':        generateModelData,
  'model-decimal':     generateModelDecimal,
  'model-containers':  generateModelContainers,
  'model-consistency': generateModelConsistency,
});
