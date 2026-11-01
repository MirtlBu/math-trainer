/**
 * percent-problems.js
 * Percent word problems (prosenttilaskut).
 *
 *   perc-of       a percent of a quantity (also decimal percents, unit conversion, milk fat),
 *                 and "what percent is B of A?"
 *   perc-change   percent change from two values; a new value after a rise / fall of p %
 *   perc-reverse  the original value when the changed one is known (discount, VAT, "p % of x is B")
 *
 * Problem: { kind: 'value', text, question, answer, steps, meta }. The numbers are chosen so that
 * every answer is exact (at most one decimal).
 *
 * Load after word-problems.js (NAMES, pickFresh), polynomial-equations.js (pick), equations.js
 * (randInt) and texts.js.
 */

// ─── helpers (names start with "pc" so they cannot clash with other files) ───

/** 38.400000000000006 → "38.4" */
const pcNum = n => String(Number(n.toFixed(6)));

/** 12.5 → "0.125" (a percent as a decimal) */
const pcDec = p => pcNum(p / 100);

/** p·base/100 is a whole number or has one decimal: base·(p in hundredths) divisible by 1000 */
const pcTenth = (base, p) => (base * Math.round(p * 100)) % 1000 === 0;
const pcWhole = (base, p) => (base * Math.round(p * 100)) % 10000 === 0;

/** A random value from a theme's range [lo, hi, step] */
const pcBase = ([lo, hi, step]) => lo + step * randInt(0, Math.floor((hi - lo) / step));

const pcValue = (text, question, answer, steps, meta) => ({
  kind: 'value', text, question, answer: Number(answer.toFixed(6)), steps, meta,
});

// ─── level 1: a percent of a quantity ─────────────────────────────────────────

const PC_PERCENTS = [5, 10, 12.5, 15, 20, 25, 30, 40, 50, 60, 75, 80, 90, 120, 150, 0.5, 2.5, 3.5];

/** How much is p % of A? (the answer is in the same unit) */
function pcOf() {
  const themes = [
    { text: (b) => `A jacket costs €${b}.`, ask: (p) => `How many euros is ${pcNum(p)}% of the price?` },
    { text: (b) => `A box of oranges weighs ${b} kg.`, ask: (p) => `How many kilograms is ${pcNum(p)}% of the weight?` },
    { text: (b) => `A runner trains on a ${b} m track.`, ask: (p) => `How many metres is ${pcNum(p)}% of the track?` },
    { text: (b) => `A town has ${b} inhabitants.`, ask: (p) => `How many inhabitants are ${pcNum(p)}% of the town?`, whole: true },
  ];
  const t = pickFresh('perc-of-simple', themes);
  for (;;) {
    const p = pick(PC_PERCENTS), base = randInt(2, 60) * 10;
    if (!(t.whole ? pcWhole(base, p) : pcTenth(base, p))) continue;
    const ans = base * p / 100;
    return pcValue(t.text(base), t.ask(p), ans, [
      { explanation: TEXTS.percent.toDecimal(pcNum(p)), math: `${pcNum(p)}\\% = \\dfrac{${pcNum(p)}}{100} = ${pcDec(p)}` },
      { explanation: TEXTS.percent.multiply, math: `${pcDec(p)} \\cdot ${base} = ${pcNum(ans)}` },
    ], { type: 'of', p, base });
  }
}

/** p % of a quantity in a larger unit, the answer in the smaller unit (0.1 % of 20 kg in grams) */
function pcConvert() {
  const themes = [
    { big: ['kilogram', 'kilograms', 'kg'], small: ['gram', 'grams', 'g'], factor: 1000, bases: [2, 5, 10, 20, 25, 40, 50] },
    { big: ['litre', 'litres', 'l'], small: ['millilitre', 'millilitres', 'ml'], factor: 1000, bases: [2, 3, 5, 10, 20, 50] },
    { big: ['kilometre', 'kilometres', 'km'], small: ['metre', 'metres', 'm'], factor: 1000, bases: [2, 5, 8, 10, 15, 40] },
    { big: ['hour', 'hours', 'h'], small: ['minute', 'minutes', 'min'], factor: 60, bases: [1, 2, 3, 5, 10] },
    { big: ['metre', 'metres', 'm'], small: ['centimetre', 'centimetres', 'cm'], factor: 100, bases: [2, 3, 5, 8, 12] },
  ];
  const t = pickFresh('perc-of-convert', themes);
  const percents = t.factor === 60 ? [5, 10, 15, 20, 25, 30, 50, 75, 80] : [0.1, 0.2, 0.5, 1, 2, 2.5, 5, 10, 15, 25, 50];
  for (;;) {
    const p = pick(percents), A = pick(t.bases);
    const inSmall = A * t.factor;
    if (!pcWhole(inSmall, p)) continue;
    const ans = inSmall * p / 100;
    return pcValue(`How many ${t.small[1]} is ${pcNum(p)}% of ${A} ${t.big[1]}?`, `Give the answer in ${t.small[1]}.`, ans, [
      { explanation: TEXTS.percent.convertUnit, math: `${A}\\,\\text{${t.big[2]}} = ${inSmall}\\,\\text{${t.small[2]}}` },
      { explanation: TEXTS.percent.toDecimal(pcNum(p)), math: `${pcNum(p)}\\% = ${pcDec(p)}` },
      { explanation: TEXTS.percent.multiply, math: `${pcDec(p)} \\cdot ${inSmall} = ${pcNum(ans)}\\,\\text{${t.small[2]}}` },
    ], { type: 'convert', p, A });
  }
}

/** Fat in milk: the volume in decilitres, 1 litre of milk weighs about 1 kg */
function pcMilk() {
  const themes = [
    { what: 'Milk', fat: [1, 1.5, 2.5, 3.5], gl: 'a glass', vols: [2] },
    { what: 'Milk', fat: [1, 1.5, 2.5, 3.5], gl: 'a cup', vols: [2, 3] },
    { what: 'Cream', fat: [10, 15, 35], gl: 'a small jug', vols: [1, 2, 3] },
    { what: 'Whole milk', fat: [3.5], gl: 'a bowl of porridge needs', vols: [2, 3, 4, 5] },
  ];
  const t = pickFresh('perc-of-milk', themes);
  const p = pick(t.fat), V = pick(t.vols);
  const grams = V * 100, ans = grams * p / 100;
  const text = `${t.what} contains ${pcNum(p)}% fat. How many grams of fat are in ${t.gl} (${V} dl) of ${t.what.toLowerCase()}? Assume that 1 litre weighs about 1 kg.`;
  return pcValue(text, 'Give the answer in grams.', ans, [
    { explanation: TEXTS.percent.milkMass,
      math: `${V}\\,\\text{dl} = ${pcNum(V / 10)}\\,\\text{L} \\approx ${pcNum(V / 10)}\\,\\text{kg} = ${grams}\\,\\text{g}` },
    { explanation: TEXTS.percent.toDecimal(pcNum(p)), math: `${pcNum(p)}\\% = ${pcDec(p)}` },
    { explanation: TEXTS.percent.multiply, math: `${pcDec(p)} \\cdot ${grams} = ${pcNum(ans)}\\,\\text{g}` },
  ], { type: 'milk', p, V });
}

/** What percent is B of A? */
function pcWhatPercent() {
  const themes = [
    { text: (who, A, B) => `${who} needs €${A} for a new bicycle and has saved €${B}.`, ask: 'What percent of the price has been saved?' },
    { text: (who, A, B) => `A class has ${A} students and ${B} of them wear glasses.`, ask: 'What percent of the students wear glasses?' },
    { text: (who, A, B) => `A tub contains ${A} g of nuts, and ${B} g of them are almonds.`, ask: 'What percent of the nuts are almonds?' },
    { text: (who, A, B) => `${who} answered ${B} of the ${A} questions of a test correctly.`, ask: 'What percent of the questions were answered correctly?' },
  ];
  const t = pickFresh('perc-of-what', themes);
  const who = pick(NAMES);
  const Alist = [20, 25, 40, 50, 60, 80, 120, 150, 200, 250, 300, 400, 500];
  const plist = [4, 5, 8, 10, 12.5, 15, 20, 25, 30, 35, 40, 45, 50, 60, 75, 80, 90];
  for (;;) {
    const A = pick(Alist), p = pick(plist);
    const B = A * p / 100;
    if (!Number.isInteger(B) || B < 2) continue;
    return pcValue(t.text(who, A, B), `${t.ask} (give the answer in percent)`, p, [
      { explanation: TEXTS.percent.shareOfWhole, math: `\\dfrac{${B}}{${A}} = ${pcNum(B / A)}` },
      { explanation: TEXTS.percent.toPercent, math: `${pcNum(B / A)} \\cdot 100\\% = ${pcNum(p)}\\%` },
    ], { type: 'what', A, B, p });
  }
}

function generatePercentOf() {
  return pick([pcOf, pcOf, pcOf, pcConvert, pcConvert, pcMilk, pcWhatPercent, pcWhatPercent])();
}

// ─── level 2: percent change ──────────────────────────────────────────────────

const PC_CHANGES = [
  { up: true,  range: [2, 30, 1], text: (who, o, n) => `The price of a cheese rose from €${o} to €${n}.`, ask: 'By what percent did the price rise?' },
  { up: true,  range: [1800, 3200, 100], maxP: 20, text: (who, o, n) => `${who} ran ${n} m in the Cooper test, a personal record. The previous result was ${o} m.`, ask: 'By what percent did the result improve?' },
  { up: true,  range: [1800, 4000, 100], maxP: 30, text: (who, o, n) => `${who}'s monthly salary rose from €${o} to €${n}.`, ask: 'By what percent did the salary rise?' },
  { up: true,  range: [1000, 50000, 500], text: (who, o, n) => `A town grew from ${o} to ${n} inhabitants.`, ask: 'By what percent did the population grow?' },
  { up: false, range: [20, 300, 5], text: (who, o, n) => `A coat that cost €${o} was put on sale for €${n}.`, ask: 'By what percent was the price lowered?' },
  { up: false, range: [50, 120, 1], text: (who, o, n) => `${who} weighed ${o} kg and now weighs ${n} kg.`, ask: 'By what percent did the weight fall?' },
  { up: false, range: [20, 200, 5], text: (who, o, n) => `The number of members of a club fell from ${o} to ${n}.`, ask: 'By what percent did the number of members fall?' },
  { up: false, range: [8, 40, 1], text: (who, o, n) => `A phone battery lasted ${o} hours and after two years it lasts ${n} hours.`, ask: 'By what percent did the battery life fall?' },
];

/** Old and new value → the percent change */
function pcChangeFromValues() {
  const t = pickFresh('perc-change', PC_CHANGES);
  const who = pick(NAMES);
  const ups = [5, 10, 12.5, 15, 20, 25, 30, 40, 50, 60, 75, 100], downs = [5, 10, 12.5, 15, 20, 25, 30, 40, 50, 60, 75];
  for (;;) {
    const p = pick((t.up ? ups : downs).filter(v => !t.maxP || v <= t.maxP));
    const o = pcBase(t.range);
    const n = o * (t.up ? 100 + p : 100 - p) / 100;
    if (!Number.isInteger(n) || n < 1 || o === n) continue;
    const diff = Math.abs(n - o);
    return pcValue(t.text(who, o, n), `${t.ask} (give the answer in percent)`, p, [
      { explanation: TEXTS.percent.findChange, math: t.up ? `${n} - ${o} = ${diff}` : `${o} - ${n} = ${diff}` },
      { explanation: TEXTS.percent.relativeChange, math: `\\dfrac{${diff}}{${o}} = ${pcNum(diff / o)}` },
      { explanation: TEXTS.percent.toPercent, math: `${pcNum(diff / o)} \\cdot 100\\% = ${pcNum(p)}\\%` },
    ], { type: 'values', up: t.up, o, n, p });
  }
}

const PC_NEW = [
  { up: true,  range: [10, 100, 5], text: (who, o, p) => `The price of a ticket is €${o}. It is raised by ${p}%.`, ask: 'What is the new price? (in euros)' },
  { up: false, range: [30, 300, 5], text: (who, o, p) => `A jacket costs €${o}. During a sale the price is lowered by ${p}%.`, ask: 'What is the sale price? (in euros)' },
  { up: true,  range: [300, 1200, 10], text: (who, o, p) => `${who}'s rent is €${o} a month and it goes up by ${p}%.`, ask: 'What is the new rent? (in euros)' },
  { up: false, range: [150, 900, 10], text: (who, o, p) => `A shop sells a bicycle for €${o}. ${who} gets a discount of ${p}%.`, ask: 'How much does the buyer pay? (in euros)' },
  { up: true,  range: [20, 500, 10], text: (who, o, p) => `A company has ${o} employees. The number grows by ${p}%.`, ask: 'How many employees are there after the growth?', whole: true },
  { up: false, range: [200, 5000, 50], text: (who, o, p) => `A pool holds ${o} litres of water. ${p}% of the water evaporates.`, ask: 'How many litres are left?' },
];

/** The new value after a rise / fall of p % */
function pcNewValue() {
  const t = pickFresh('perc-new', PC_NEW);
  const who = pick(NAMES);
  for (;;) {
    const p = pick([5, 8, 10, 12, 15, 20, 25, 30, 35, 40, 50, 60]);
    const o = pcBase(t.range);
    const f = t.up ? 100 + p : 100 - p;
    if (!pcTenth(o, f)) continue;                      // o·f/100 has at most one decimal
    if (t.whole && !pcWhole(o, f)) continue;
    const n = o * f / 100;
    const factor = pcDec(f);
    return pcValue(t.text(who, o, p), t.ask, n, [
      { explanation: TEXTS.percent[t.up ? 'factorUp' : 'factorDown'](p, f),
        math: t.up ? `100\\% + ${p}\\% = ${f}\\% = ${factor}` : `100\\% - ${p}\\% = ${f}\\% = ${factor}` },
      { explanation: TEXTS.percent.multiplyOld, math: `${factor} \\cdot ${o} = ${pcNum(n)}` },
    ], { type: 'new', up: t.up, o, p, n });
  }
}

function generatePercentChange() {
  return pick([pcChangeFromValues, pcChangeFromValues, pcNewValue])();
}

// ─── level 2b: comparing two values ───────────────────────────────────────────

/**
 * Two values, "by what percent is A more / less than B?": the base is the value after "than".
 *   range     [lo, hi, step] of the base value
 *   dec       values are stored as whole numbers in units of 1/dec (decimals such as 1.25 million: dec 100)
 *   text      (x, y, big, small) the story; x has the larger value, y the smaller
 *   more      (x, y) the question about the larger value (the base is the smaller one)
 *   less      (x, y) the question about the smaller value (the base is the larger one)
 */
const PC_COMPARE = [
  { range: [40, 400, 5], text: (x, y, big, small) => `${x} bought a new smartphone and paid €${big}. ${y} got the same phone for €${small}.`,
    more: (x, y) => `By what percent was ${x}'s phone more expensive than ${y}'s?`, less: (x, y) => `By what percent was ${y}'s phone cheaper than ${x}'s?` },
  { range: [10, 60, 1], text: (x, y, big, small) => `${y} used ${small} minutes for a practice test and ${x} used ${big} minutes.`,
    more: (x, y) => `By what percent did ${x} use more time than ${y}?`, less: (x, y) => `By what percent did ${y} use less time than ${x}?` },
  { range: [100000, 900000, 10000], text: (x, y, big, small) => `The turnover of a company was €${big} in 2018 and only €${small} in 2019.`,
    more: () => 'By what percent was the turnover in 2018 greater than in 2019?', less: () => 'By what percent was the turnover in 2019 smaller than in 2018?' },
  { range: [20, 200, 5], text: (x, y, big, small) => `${x} ran ${big} km in a month and ${y} ran ${small} km.`,
    more: (x, y) => `By what percent did ${x} run more than ${y}?`, less: (x, y) => `By what percent did ${y} run less than ${x}?` },
  { range: [1500, 4500, 100], text: (x, y, big, small) => `${x}'s monthly salary is €${big} and ${y}'s is €${small}.`,
    more: (x, y) => `By what percent is ${x}'s salary higher than ${y}'s?`, less: (x, y) => `By what percent is ${y}'s salary lower than ${x}'s?` },
  { dec: 100, range: [50, 400, 5], text: (x, y, big, small) => `The turnover of a company was €${big} million in 2019 and €${small} million in 2020.`,
    more: () => 'By what percent was the turnover in 2019 greater than in 2020?', less: () => 'By what percent was the turnover in 2020 smaller than in 2019?' },
  { dec: 10, range: [8, 40, 1], text: (x, y, big, small) => `${x}'s backpack weighs ${big} kg and ${y}'s backpack weighs ${small} kg.`,
    more: (x, y) => `By what percent is ${x}'s backpack heavier than ${y}'s?`, less: (x, y) => `By what percent is ${y}'s backpack lighter than ${x}'s?` },
  { range: [100, 400, 5], text: (x, y, big, small) => `A storage disk holds ${big} GB and a smaller one holds ${small} GB.`,
    more: () => 'By what percent is the capacity of the larger disk greater than that of the smaller one?', less: () => 'By what percent is the capacity of the smaller disk less than that of the larger one?' },
];

/** Which value is the base: the one after "than". The same two values give two different percents. */
function generatePercentCompare() {
  const t = pickFresh('perc-compare', PC_COMPARE);
  const x = pick(NAMES);
  let who2;
  do { who2 = pick(NAMES); } while (who2 === x);
  const askMore = randInt(0, 1) === 1;                  // true: the base is the smaller value
  for (;;) {
    const p = pick(askMore ? [10, 12.5, 20, 25, 30, 40, 50, 60, 75, 80, 100] : [10, 12.5, 20, 25, 30, 40, 50, 60, 75, 80]);
    const base = pcBase(t.range);
    const other = base * (askMore ? 100 + p : 100 - p) / 100;      // the value that is compared to the base
    if (!Number.isInteger(other) || other < 1 || other === base) continue;
    const big = Math.max(base, other), small = Math.min(base, other);
    const diff = big - small;
    const sc = t.dec || 1, show = v => pcNum(v / sc);          // shown with decimals
    return pcValue(t.text(x, who2, show(big), show(small)), `${(askMore ? t.more : t.less)(x, who2)} (give the answer in percent)`, p, [
      { explanation: TEXTS.percent.thanBase, math: `\\text{base} = ${show(base)}` },
      { explanation: TEXTS.percent.findChange, math: `${show(big)} - ${show(small)} = ${show(diff)}` },
      { explanation: TEXTS.percent.divideByBase, math: `\\dfrac{${show(diff)}}{${show(base)}} = ${pcNum(diff / base)}` },
      { explanation: TEXTS.percent.toPercent, math: `${pcNum(diff / base)} \\cdot 100\\% = ${pcNum(p)}\\%` },
    ], { type: 'compare', big, small, base, p, askMore });
  }
}

// ─── level 3: the original value ──────────────────────────────────────────────

/** The changed value is known, find the value before the change */
function generatePercentReverse() {
  const themes = [
    { kind: 'up',   range: [1800, 4000, 100], text: (who, n, p) => `After a ${p}% raise ${who}'s salary is €${n} a month.`, ask: 'What was the salary before the raise? (in euros)' },
    { kind: 'down', range: [30, 200, 10], text: (who, n, p) => `${who} bought a pair of shoes at a sale with a ${p}% discount and paid €${n}.`, ask: 'What was the original price? (in euros)' },
    { kind: 'down', range: [1000, 50000, 500], text: (who, n, p) => `A town lost ${p}% of its inhabitants and now has ${n} inhabitants.`, ask: 'How many inhabitants did the town have before?', whole: true },
    { kind: 'up',   range: [20, 300, 10], text: (who, n, p) => `A tree grew ${p}% in a year and is now ${n} cm tall.`, ask: 'How tall was the tree a year ago? (in cm)' },
    { kind: 'vat',  range: [20, 600, 20], text: (who, n, p) => `The price of a product is €${n} including VAT of ${p}%.`, ask: 'What is the price without VAT? (in euros)' },
    { kind: 'part', range: [20, 400, 10], text: (who, n, p) => `${p}% of a number is ${n}.`, ask: 'What is the number?' },
  ];
  const t = pickFresh('perc-reverse', themes);
  const who = pick(NAMES);
  for (;;) {
    const p = t.kind === 'vat' ? pick([25.5, 14, 10])
            : t.kind === 'part' ? pick([5, 8, 12, 15, 20, 25, 30, 35, 40, 45, 60, 75, 80])
            : pick([5, 10, 15, 20, 25, 30, 40, 50]);
    const orig = pcBase(t.range);
    const f = t.kind === 'down' ? 100 - p : t.kind === 'part' ? p : 100 + p;     // the changed value is f % of the original
    const n = orig * f / 100;
    if (!pcTenth(orig, f) || (t.whole && !Number.isInteger(n)) || n < 1) continue;
    if (Math.abs(f - 100) < 1e-9) continue;
    const factor = pcDec(f);
    const steps = [];
    if (t.kind === 'part') {
      steps.push({ explanation: TEXTS.percent.partOfNumber(pcNum(p)), math: `${factor}x = ${pcNum(n)}` });
    } else {
      steps.push(
        { explanation: TEXTS.percent.unknownOriginal(pcNum(f)),
          math: t.kind === 'down' ? `100\\% - ${p}\\% = ${f}\\% = ${factor}` : `100\\% + ${pcNum(p)}\\% = ${pcNum(f)}\\% = ${factor}` },
        { explanation: TEXTS.percent.equationFactor, math: `${factor}x = ${pcNum(n)}` });
    }
    steps.push({ explanation: TEXTS.solution.divide(Number(factor)),
      math: `x = \\dfrac{${pcNum(n)}}{${factor}} = ${pcNum(orig)}` });
    return pcValue(t.text(who, pcNum(n), pcNum(p)), t.ask, orig, steps, { type: t.kind, p, orig, n });
  }
}

// ─── register with the shared generator table (defined in equations.js) ──────
Object.assign(GENERATORS, {
  'perc-of':      generatePercentOf,
  'perc-change':  generatePercentChange,
  'perc-compare': generatePercentCompare,
  'perc-reverse': generatePercentReverse,
});
