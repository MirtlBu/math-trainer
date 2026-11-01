/**
 * percent-advanced.js
 * More percent levels, built on the helpers of percent-problems.js (pcNum, pcDec, pcBase, pcValue).
 *
 *   perc-statements  choice: which statement about two values is true (the base trap)
 *   perc-points      percentage points, percent change of a rate, "times as large" and percent
 *   perc-round       percent answers that must be rounded (1/3 = 33.3 %)
 *   perc-successive  two changes in a row (+20 % then -20 %)
 *   perc-compound    the same change repeated for several years (savings, depreciation)
 *   perc-mixture     mixing solutions, adding water (concentration in percent)
 *
 * Problems: { kind: 'value', … } (the answer is typed) or { kind: 'choice', options, answer }.
 * The numbers are chosen so that every answer is exact; in perc-round the answer is the rounded value
 * and the question says how to round.
 *
 * Load after percent-problems.js, word-problems.js (NAMES, pickFresh), equations.js (randInt),
 * polynomial-equations.js (pick) and texts.js.
 */

/** A shuffled copy */
function pcShuffle(list) {
  const a = list.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = randInt(0, i);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Cents as euros: 250 → "2.50" */
const pcEuro = cents => (cents / 100).toFixed(2);

// ─── perc-statements: which statement is true? ────────────────────────────────

/** dear : cheap = num : den; "dear is x % more" and "cheap is y % less" (both whole or one decimal) */
const PC_RATIOS = [
  { num: 5, den: 4 }, { num: 5, den: 4 }, { num: 8, den: 5 }, { num: 2, den: 1 }, { num: 5, den: 2 },
];

const PC_STATEMENTS = [
  { money: true, cheap: [150, 500],
    text: (d, c) => `A single ticket to the swimming hall costs €${d}. With a season card one swim costs €${c}.`,
    more: p => `A single ticket is ${p}% more expensive.`, less: p => `With the season card a swim is ${p}% cheaper.` },
  { money: true, cheap: [160, 400],
    text: (d, c) => `A single bus ticket costs €${d}. With a monthly card one trip costs €${c}.`,
    more: p => `A single ticket is ${p}% more expensive.`, less: p => `A trip with the monthly card is ${p}% cheaper.` },
  { money: true, cheap: [400, 1000],
    text: (d, c) => `A normal cinema ticket costs €${d} and a student ticket costs €${c}.`,
    more: p => `A normal ticket is ${p}% more expensive.`, less: p => `A student ticket is ${p}% cheaper.` },
  { money: false, cheap: [8, 45],
    text: (d, c) => `The usual route to school takes ${d} minutes and the shortcut takes ${c} minutes.`,
    more: p => `The usual route takes ${p}% more time.`, less: p => `The shortcut takes ${p}% less time.` },
];

function generatePercentStatements() {
  const t = pickFresh('perc-statements', PC_STATEMENTS);
  const r = pick(PC_RATIOS);
  const x = (r.num - r.den) / r.den * 100;               // the dearer value is x % more than the cheaper
  const y = (r.num - r.den) / r.num * 100;               // the cheaper value is y % less than the dearer
  let cheap, dear;                                       // cents, or minutes
  for (;;) {                                             // a realistic cheaper value that is a multiple of the ratio
    const u = randInt(1, 100) * (t.money ? 10 : 1);
    cheap = r.den * u; dear = r.num * u;
    if (cheap >= t.cheap[0] && cheap <= t.cheap[1] && (t.money ? dear <= 1200 : dear <= 90)) break;
  }
  const show = v => (t.money ? pcEuro(v) : String(v));

  const moreStmt = p => ({ text: t.more(pcNum(p)), true: p === x });
  const lessStmt = p => ({ text: t.less(pcNum(p)), true: p === y });
  const noneTrue = randInt(1, 5) <= 2;
  let statements;
  do {
    let z;                                               // a made-up percent that is wrong
    do { z = pick([10, 15, 20, 25, 30, 40, 50, 60, 75]); } while (z === x || z === y);
    const lessWrong = x < 100 ? lessStmt(x) : lessStmt(z);                     // a price cannot fall by 100% or more
    if (noneTrue) statements = [moreStmt(y), lessWrong, randInt(0, 1) ? moreStmt(z) : lessStmt(z)];
    else          statements = [randInt(0, 1) ? moreStmt(x) : lessStmt(y), moreStmt(y), lessWrong];
  } while (new Set(statements.map(st => st.text)).size < 3 || statements.some(st => !st.true && st.text.includes('100%')));
  statements = pcShuffle(statements);
  const options = [TEXTS.percent.noneTrue, ...statements.map(s => s.text)];
  const answer = noneTrue ? 0 : 1 + statements.findIndex(s => s.true);

  const diff = dear - cheap;
  const steps = [
    { explanation: TEXTS.percent.findChange, math: `${show(dear)} - ${show(cheap)} = ${show(diff)}` },
    { explanation: TEXTS.percent.dearerThanCheaper,
      math: `\\dfrac{${show(diff)}}{${show(cheap)}} = ${pcDec(x)} = ${pcNum(x)}\\%` },
    { explanation: TEXTS.percent.cheaperThanDearer,
      math: `\\dfrac{${show(diff)}}{${show(dear)}} = ${pcDec(y)} = ${pcNum(y)}\\%` },
    { explanation: noneTrue ? TEXTS.percent.verdictNone : TEXTS.percent.verdictTrue(options[answer]),
      math: `${pcNum(x)}\\% \\quad\\text{and}\\quad ${pcNum(y)}\\%` },
  ];
  return {
    kind: 'choice',
    text: t.text(show(dear), show(cheap)),
    question: TEXTS.percent.whichTrue,
    options, answer, steps,
    meta: { x, y, dear, cheap, noneTrue, money: t.money },
  };
}

// ─── perc-points: percentage points, percent, "times as large" ────────────────

const PC_RATES = [
  { name: 'The unemployment rate in a town', plain: 'rate' },
  { name: 'The interest rate of a loan', plain: 'rate' },
  { name: 'The share of students who cycle to school', plain: 'share' },
  { name: 'The share of voters who support a party', plain: 'share' },
];

const PC_SIZES = [
  { big: 'A bridge', small: 'a tunnel', adj: 'long', unit: 'm', range: [20, 200, 10] },
  { big: 'A sack of potatoes', small: 'a bag of onions', adj: 'heavy', unit: 'kg', range: [4, 40, 2] },
  { big: 'A tablet', small: 'a phone', adj: 'expensive', unit: '€', range: [50, 400, 10] },
  { big: 'A tank', small: 'a bucket', adj: 'large', unit: 'litres', range: [10, 100, 5] },
];

function generatePercentPoints() {
  const type = pick(['points', 'points', 'relative', 'relative', 'times', 'timesToPercent', 'percentToTimes']);

  if (type === 'points' || type === 'relative') {
    const t = pickFresh('perc-points-rate', PC_RATES);
    const up = randInt(0, 1) === 1;
    for (;;) {
      const p = pick([10, 20, 25, 50, 12.5, 40, 60, 75]);
      const o = randInt(2, 40);
      const n = o * (up ? 100 + p : 100 - p) / 100;
      if (!Number.isInteger(n) || n < 1 || n > 100 || n === o) continue;
      const diff = Math.abs(n - o), verb = up ? 'rose' : 'fell';
      const text = `${t.name} ${verb} from ${o}% to ${n}%.`;
      if (type === 'points') {
        return pcValue(text, `By how many percentage points did it ${up ? 'rise' : 'fall'}?`, diff, [
          { explanation: TEXTS.percent.pointsDifference, math: up ? `${n} - ${o} = ${diff}` : `${o} - ${n} = ${diff}` },
        ], { type, o, n, diff });
      }
      return pcValue(text, `By what percent did it ${up ? 'rise' : 'fall'}? (give the answer in percent)`, p, [
        { explanation: TEXTS.percent.findChange, math: up ? `${n} - ${o} = ${diff}` : `${o} - ${n} = ${diff}` },
        { explanation: TEXTS.percent.relativeToOld, math: `\\dfrac{${diff}}{${o}} = ${pcNum(diff / o)}` },
        { explanation: TEXTS.percent.toPercent, math: `${pcNum(diff / o)} \\cdot 100\\% = ${pcNum(p)}\\%` },
      ], { type, o, n, p });
    }
  }

  const t = pickFresh('perc-points-size', PC_SIZES);
  const adjAs = `as ${t.adj}`;
  const unitStr = v => (t.unit === '€' ? `€${v}` : `${v} ${t.unit}`);
  for (;;) {
    const k = pick([1.5, 2, 2.5, 3, 4, 1.2, 1.25, 1.4, 1.6, 1.8, 3.5]);
    const small = pcBase(t.range), big = small * k;
    if (!Number.isInteger(big)) continue;
    if (type === 'times') {
      return pcValue(`${t.big} is ${unitStr(big)} and ${t.small} is ${unitStr(small)}.`,
        `How many times ${adjAs} as ${t.small} is ${t.big.toLowerCase()}?`, k, [
          { explanation: TEXTS.percent.timesRatio, math: `\\dfrac{${big}}{${small}} = ${pcNum(k)}` },
        ], { type, k, big, small });
    }
    if (type === 'timesToPercent') {
      const p = Math.round((k - 1) * 100 * 1e6) / 1e6;
      return pcValue(`${t.big} is ${pcNum(k)} times ${adjAs} as ${t.small}.`,
        `By what percent is ${t.big.toLowerCase()} ${t.adj === 'large' ? 'larger' : t.adj + 'er'} than ${t.small}? (give the answer in percent)`, p, [
          { explanation: TEXTS.percent.timesToPercent, math: `${pcNum(k)} = ${pcNum(k * 100)}\\%` },
          { explanation: TEXTS.percent.subtractWhole, math: `${pcNum(k * 100)}\\% - 100\\% = ${pcNum(p)}\\%` },
        ], { type, k, p });
    }
    const p = Math.round((k - 1) * 100 * 1e6) / 1e6;
    return pcValue(`${t.big} is ${pcNum(p)}% ${t.adj === 'large' ? 'larger' : t.adj + 'er'} than ${t.small}.`,
      `How many times ${adjAs} as ${t.small} is ${t.big.toLowerCase()}?`, k, [
        { explanation: TEXTS.percent.percentToTimes, math: `100\\% + ${pcNum(p)}\\% = ${pcNum(100 + p)}\\%` },
        { explanation: TEXTS.percent.asDecimal, math: `${pcNum(100 + p)}\\% = ${pcNum(k)}` },
      ], { type, k, p });
  }
}

// ─── perc-round: percents that need rounding ──────────────────────────────────

function generatePercentRound() {
  const digits = pick([0, 1, 1]);                         // decimals in the answer
  const rule = digits === 0 ? 'Round the answer to the nearest whole percent.' : 'Round the answer to one decimal place.';
  const type = pick(['share', 'share', 'change']);
  for (;;) {
    let text, question, value, steps, meta;
    if (type === 'share') {
      const stories = [
        (who, A, B) => [`${who} has read ${B} pages of a book of ${A} pages.`, 'What percent of the book has been read?'],
        (who, A, B) => [`A class of ${A} students has ${B} left-handed students.`, 'What percent of the students are left-handed?'],
        (who, A, B) => [`${who} solved ${B} of the ${A} tasks of a test correctly.`, 'What percent of the tasks were solved correctly?'],
        (who, A, B) => [`A football team won ${B} of its ${A} matches.`, 'What percent of the matches did the team win?'],
      ];
      const A = randInt(3, 40), B = randInt(1, A - 1);
      [text, question] = pick(stories)(pick(NAMES), A, B);
      value = B / A * 100;
      steps = [
        { explanation: TEXTS.percent.shareOfWhole, math: `\\dfrac{${B}}{${A}} = ${(B / A).toFixed(4)}\\ldots` },
        { explanation: TEXTS.percent.toPercent, math: `${(B / A).toFixed(4)} \\cdot 100\\% \\approx ${value.toFixed(3)}\\%` },
      ];
      meta = { type, A, B };
    } else {
      const up = randInt(0, 1) === 1;
      const o = randInt(3, 40), n = randInt(2, 60);
      if (n === o || (n > o) !== up) continue;
      const diff = Math.abs(n - o);
      value = diff / o * 100;
      text = up ? `The price of a product rose from €${o} to €${n}.` : `The price of a product fell from €${o} to €${n}.`;
      question = `By what percent did the price ${up ? 'rise' : 'fall'}?`;
      steps = [
        { explanation: TEXTS.percent.findChange, math: up ? `${n} - ${o} = ${diff}` : `${o} - ${n} = ${diff}` },
        { explanation: TEXTS.percent.relativeToOld, math: `\\dfrac{${diff}}{${o}} = ${(diff / o).toFixed(4)}\\ldots` },
        { explanation: TEXTS.percent.toPercent, math: `${(diff / o).toFixed(4)} \\cdot 100\\% \\approx ${value.toFixed(3)}\\%` },
      ];
      meta = { type, o, n, up };
    }
    const scaled = value * 10 ** digits;
    if (Math.abs(scaled - Math.round(scaled)) < 0.02) continue;               // exact: nothing to round
    if (Math.abs((scaled % 1 + 1) % 1 - 0.5) < 0.03) continue;               // too close to a tie
    const answer = Number(value.toFixed(digits));
    steps.push({ explanation: TEXTS.percent.roundTo(digits), math: `${value.toFixed(3)}\\% \\approx ${answer}\\%` });
    return pcValue(text, `${question} ${rule}`, answer, steps, { ...meta, digits, value });
  }
}

// ─── perc-successive: two changes in a row ────────────────────────────────────

function generatePercentSuccessive() {
  const type = pick(['final', 'final', 'total', 'total']);
  const themes = [
    { what: p => `The price of a jacket`, unit: '€', range: [40, 400, 20], up: 'is raised', down: 'is lowered' },
    { what: p => `The rent of a flat`, unit: '€', range: [400, 1200, 40], up: 'goes up', down: 'goes down' },
    { what: p => `The number of visitors of a museum`, unit: '', range: [200, 2000, 100], up: 'grows', down: 'falls',
      repeat: { up: 'grew', down: 'fell', period: 'year' } },
    { what: p => `The number of orders of a sewing shop`, unit: '', range: [200, 2000, 100], up: 'grows', down: 'falls',
      repeat: { up: 'grew', down: 'fell', period: 'year' } },
  ];
  const t = pickFresh('perc-successive', themes);
  const phrase = (up, p) => `${up ? t.up : t.down} by ${p}%`;
  for (;;) {
    const same = t.repeat && randInt(1, 3) === 1;                          // the same change twice in a row
    const up1 = randInt(0, 1) === 1, up2 = same ? up1 : randInt(0, 1) === 1;
    const p1 = pick([10, 20, 25, 30, 40, 50]), p2 = same ? p1 : pick([10, 20, 25, 30, 40, 50]);
    const f1 = up1 ? 100 + p1 : 100 - p1, f2 = up2 ? 100 + p2 : 100 - p2;
    const o = type === 'total' ? 100 : pcBase(t.range);
    if (o * f1 % 100 !== 0 || o * f1 * f2 % 10000 !== 0) continue;           // whole values after each change
    if (type === 'total' && (f1 * f2) % 10 !== 0) continue;
    const m1 = o * f1 / 100, m2 = m1 * f2 / 100;
    const u = v => (t.unit === '€' ? `€${v}` : `${v}`);
    const repeated = t.repeat && up1 === up2 && p1 === p2;
    const text = repeated
      ? `${t.what()} ${t.repeat[up1 ? 'up' : 'down']} by ${p1}% in each of two consecutive ${t.repeat.period}s.`
      : `${t.what()} ${phrase(up1, p1)} and then ${phrase(up2, p2)}.`;
    const steps = [
      { explanation: TEXTS.percent[up1 ? 'factorUp' : 'factorDown'](p1, f1), math: `${pcDec(f1)}` },
      { explanation: TEXTS.percent[up2 ? 'factorUp' : 'factorDown'](p2, f2), math: `${pcDec(f2)}` },
    ];
    if (type === 'final') {
      steps.push(
        { explanation: TEXTS.percent.afterFirst, math: `${o} \\cdot ${pcDec(f1)} = ${m1}` },
        { explanation: TEXTS.percent.afterSecond, math: `${m1} \\cdot ${pcDec(f2)} = ${m2}` });
      return pcValue(`${text} At the start it was ${u(o)}.`, `What is it after both changes?`, m2, steps, { type, o, f1, f2, m2 });
    }
    const total = m2 - 100;
    steps.push(
      { explanation: TEXTS.percent.assume100, math: `100 \\cdot ${pcDec(f1)} = ${m1}` },
      { explanation: TEXTS.percent.afterSecond, math: `${m1} \\cdot ${pcDec(f2)} = ${pcNum(m2)}` },
      { explanation: TEXTS.percent.totalChange, math: `${pcNum(m2)} - 100 = ${pcNum(total)}\\%` });
    if (up1 === up2 && total < 0) steps.push({ explanation: TEXTS.percent.sizeOfDecrease, math: `${pcNum(Math.abs(total))}\\%` });
    if (up1 === up2) {                                                         // both changes go the same way: ask for the size of the change
      const verb = up1 ? 'increase' : 'decrease';
      return pcValue(text, `By what percent did it ${verb} in total? (give the answer in percent)`, Number(Math.abs(total).toFixed(6)), steps,
        { type, f1, f2, total });
    }
    return pcValue(text, 'What is the total change in percent? (use a minus sign if it decreased)', Number(total.toFixed(6)), steps,
      { type, f1, f2, total });
  }
}

// ─── perc-compound: the same change several times ─────────────────────────────

function generatePercentCompound() {
  const themes = [
    { up: true,  text: (b, p, n) => `€${b} is put in a savings account with an interest of ${p}% per year. The interest is added to the account every year.`,
      ask: n => `How many euros are in the account after ${n} years?`, range: [200, 2000, 100], unit: '€' },
    { up: false, text: (b, p, n) => `A new car costs €${b}. Its value falls by ${p}% every year.`,
      ask: n => `What is the value of the car after ${n} years? (in euros)`, range: [5000, 30000, 1000], unit: '€' },
    { up: true,  text: (b, p, n) => `A town has ${b} inhabitants and the population grows by ${p}% every year.`,
      ask: n => `How many inhabitants will the town have after ${n} years?`, range: [1000, 20000, 1000], unit: '' },
    { up: false, text: (b, p, n) => `A pond holds ${b} litres of water and ${p}% of the water evaporates every week.`,
      ask: n => `How many litres are left after ${n} weeks?`, range: [200, 2000, 100], unit: '' },
  ];
  const t = pickFresh('perc-compound', themes);
  for (;;) {
    const p = pick([5, 10, 20, 25, 50, 15, 30]), n = pick([2, 2, 3]);
    const f = t.up ? 100 + p : 100 - p;
    const b = pcBase(t.range);
    const num = b * f ** n;                                // value·100ⁿ
    if (num % (100 ** (n - 1)) !== 0) continue;           // the result has at most 2 decimals
    const result = num / 100 ** n;
    if (result < 1) continue;
    if (Math.round(result * 10) !== result * 10 && Math.abs(result * 10 - Math.round(result * 10)) > 1e-9) continue;
    const chain = [b];
    for (let i = 0; i < n; i++) chain.push(chain[i] * f / 100);
    if (!chain.every(v => Math.abs(v * 10 - Math.round(v * 10)) < 1e-9)) continue;   // every year is exact too
    const factor = pcDec(f);
    return pcValue(t.text(b, p, n), t.ask(n), Number(result.toFixed(6)), [
      { explanation: TEXTS.percent[t.up ? 'factorUp' : 'factorDown'](p, f), math: `${factor}` },
      { explanation: TEXTS.percent.repeatFactor(n), math: `${b} \\cdot ${factor}^{${n}}` },
      { explanation: TEXTS.percent.yearByYear, math: chain.map(pcNum).join(' \\to ') },
    ], { b, p, n, f, up: t.up, result });
  }
}

// ─── perc-mixture: concentrations ─────────────────────────────────────────────

function generatePercentMixture() {
  const type = pick(['mix', 'mix', 'water']);
  const subst = pick([['salt', 'salt solution'], ['sugar', 'sugar solution'], ['juice concentrate', 'juice']]);
  const [what, sol] = subst;
  for (;;) {
    if (type === 'mix') {
      const m1 = pick([100, 200, 300, 400, 500]), m2 = pick([100, 200, 300, 400, 500]);
      const p1 = pick([5, 10, 15, 20, 25, 30, 40]), p2 = pick([5, 10, 15, 20, 25, 30, 40, 50]);
      if (p1 === p2) continue;
      const s1 = m1 * p1 / 100, s2 = m2 * p2 / 100, total = m1 + m2;
      const result = (s1 + s2) / total * 100;
      if (Math.abs(result * 10 - Math.round(result * 10)) > 1e-9) continue;
      return pcValue(`${m1} g of ${sol} with ${p1}% ${what} is mixed with ${m2} g of ${sol} with ${p2}% ${what}.`,
        `What is the percentage of ${what} in the mixture? (give the answer in percent)`, Number(result.toFixed(6)), [
          { explanation: TEXTS.percent.amountInFirst(what), math: `${pcDec(p1)} \\cdot ${m1} = ${pcNum(s1)}\\,\\text{g}` },
          { explanation: TEXTS.percent.amountInSecond(what), math: `${pcDec(p2)} \\cdot ${m2} = ${pcNum(s2)}\\,\\text{g}` },
          { explanation: TEXTS.percent.mixTotals, math: `${pcNum(s1)} + ${pcNum(s2)} = ${pcNum(s1 + s2)}\\,\\text{g}, \\quad ${m1} + ${m2} = ${total}\\,\\text{g}` },
          { explanation: TEXTS.percent.shareOfWhole, math: `\\dfrac{${pcNum(s1 + s2)}}{${total}} = ${pcNum((s1 + s2) / total)} = ${pcNum(result)}\\%` },
        ], { type, m1, p1, m2, p2, result });
    }
    const m = pick([100, 200, 300, 400, 500, 600]);
    const p = pick([10, 12, 15, 20, 24, 25, 30, 40]);
    const q = pick([2, 4, 5, 6, 8, 10, 12, 15, 20]);
    if (q >= p) continue;
    const s = m * p / 100, newTotal = s / (q / 100), water = newTotal - m;
    if (!Number.isInteger(s) || !Number.isInteger(newTotal) || water <= 0) continue;
    return pcValue(`${m} g of ${sol} contains ${p}% ${what}. Water is added to make the ${what} content ${q}%.`,
      'How many grams of water must be added?', water, [
        { explanation: TEXTS.percent.amountInFirst(what), math: `${pcDec(p)} \\cdot ${m} = ${s}\\,\\text{g}` },
        { explanation: TEXTS.percent.newTotal(what, q), math: `${pcDec(q)} \\cdot x = ${s} \\quad\\Rightarrow\\quad x = \\dfrac{${s}}{${pcDec(q)}} = ${newTotal}\\,\\text{g}` },
        { explanation: TEXTS.percent.waterAdded, math: `${newTotal} - ${m} = ${water}\\,\\text{g}` },
      ], { type, m, p, q, water });
  }
}

// ─── perc-factor: "if x grows by 1.2 %, the new value is …" ───────────────────

function generatePercentFactor() {
  const up = randInt(0, 1) === 1;
  for (;;) {
    const p = pick([0.5, 0.8, 1.2, 1.5, 2.5, 3.5, 4, 6, 7.5, 8, 12, 15, 20, 25]);
    const f = up ? 1 + p / 100 : 1 - p / 100;
    const fmt = v => `$${pcNum(Math.round(v * 1e6) / 1e6)}x$`;
    const correct = fmt(f);
    const wrong = (up
      ? [p / 100, 1 - p / 100, 1 + p / 10, 1 + p]               // forgot the original, wrong direction, ÷10 instead of ÷100, the percent as the factor
      : [p / 100, 1 + p / 100, 1 - p / 10, p / 10])             // (a negative or silly factor is dropped below)
      .filter(v => v > 0 && v < 11)
      .map(fmt)
      .filter((v, i, all) => v !== correct && all.indexOf(v) === i);
    if (wrong.length < 3) continue;
    const options = pcShuffle([correct, ...pcShuffle(wrong).slice(0, 3)]);
    const verb = up ? 'increases' : 'decreases';
    const pct = pcNum(100 + (up ? p : -p));
    return {
      kind: 'choice',
      text: '',
      question: `If the quantity $x$ ${verb} by ${pcNum(p)}%, the new value is:`,
      options, answer: options.indexOf(correct),
      steps: [
        { explanation: TEXTS.percent[up ? 'factorUp' : 'factorDown'](pcNum(p), pct),
          math: up ? `100\\% + ${pcNum(p)}\\% = ${pct}\\%` : `100\\% - ${pcNum(p)}\\% = ${pct}\\%` },
        { explanation: TEXTS.percent.asDecimal, math: `${pct}\\% = ${pcNum(Math.round(f * 1e6) / 1e6)}` },
        { explanation: TEXTS.percent.newValueIs, math: `${pcNum(Math.round(f * 1e6) / 1e6)}\\,x` },
      ],
      meta: { type: 'factor', p, up, f },
    };
  }
}

// ─── perc-net: how did the value change compared with the original? ──────────

function generatePercentNet() {
  const themes = [
    { noun: 'price', what: 'The price of a product', first: (u, p) => `was ${u ? 'raised' : 'lowered'} by ${p}% before Christmas`, second: (u, p) => `${u ? 'raised' : 'lowered'} by ${p}% after Christmas` },
    { noun: 'number of subscribers', what: 'The number of subscribers of a channel', first: (u, p) => `${u ? 'grew' : 'fell'} by ${p}% in January`, second: (u, p) => `${u ? 'grew' : 'fell'} by ${p}% in February` },
    { noun: 'salary', what: 'A worker\'s salary', first: (u, p) => `${u ? 'was raised' : 'was cut'} by ${p}% in spring`, second: (u, p) => `${u ? 'raised' : 'cut'} by ${p}% in autumn` },
    { noun: 'value of the shares', what: 'The value of some shares', first: (u, p) => `${u ? 'rose' : 'fell'} by ${p}% on Monday`, second: (u, p) => `${u ? 'rose' : 'fell'} by ${p}% on Tuesday` },
  ];
  const t = pickFresh('perc-net', themes);
  for (;;) {
    const up1 = randInt(0, 1) === 1, up2 = randInt(0, 1) === 1;
    const p1 = pick([10, 20, 25, 30, 40, 50, 100]), p2 = pick([10, 20, 25, 30, 40, 50, 80]);
    if (!up1 && p1 >= 100) continue;
    if (!up2 && p2 >= 100) continue;
    const f1 = up1 ? 100 + p1 : 100 - p1, f2 = up2 ? 100 + p2 : 100 - p2;
    if (f1 * f2 % 10 !== 0) continue;
    const m1 = f1, m2 = f1 * f2 / 100, net = m2 - 100;
    const opposite = up1 !== up2;
    const mostlyZero = net === 0;
    if (!opposite && randInt(1, 3) > 1) continue;                      // mostly one up, one down (the trap)
    const say = n => (n === 0 ? 'It did not change.' : n > 0 ? `It rose by ${pcNum(n)}%.` : `It fell by ${pcNum(-n)}%.`);
    const naive = (up1 ? p1 : -p1) + (up2 ? p2 : -p2);               // simply adding the percents
    const candidates = [say(net), say(0), say(naive), say(-net), say(up1 ? p1 : -p1), say(naive + 10)];
    const unique = candidates.filter((v, i, a) => a.indexOf(v) === i);
    const correct = say(net);
    const others = pcShuffle(unique.filter(v => v !== correct)).slice(0, 3);
    if (others.length < 3) continue;
    // keep the interesting wrong answers: "did not change" and the sum of the percents
    for (const must of [say(0), say(naive)]) {
      if (must !== correct && !others.includes(must)) others[randInt(0, 2)] = must;
    }
    const options = pcShuffle([correct, ...others.filter((v, i, a) => a.indexOf(v) === i)]);
    if (options.length !== 4) continue;
    const text = `${t.what} ${t.first(up1, p1)} and ${t.second(up2, p2)}.`;
    return {
      kind: 'choice', text,
      question: `How did the ${t.noun} change compared with the original?`,
      options, answer: options.indexOf(correct),
      steps: [
        { explanation: TEXTS.percent.assume100, math: `100 \\cdot ${pcDec(f1)} = ${pcNum(m1)}` },
        { explanation: TEXTS.percent.afterSecond, math: `${pcNum(m1)} \\cdot ${pcDec(f2)} = ${pcNum(m2)}` },
        { explanation: TEXTS.percent.totalChange, math: `${pcNum(m2)} - 100 = ${pcNum(net)}\\%` },
        { explanation: TEXTS.percent.percentsNotAdded, math: `${up1 ? '+' : '-'}${p1}\\% ${up2 ? '+' : '-'} ${p2}\\% \\neq ${pcNum(net)}\\%` },
      ],
      meta: { type: 'net', f1, f2, net, mostlyZero },
    };
  }
}

// ─── register with the shared generator table (defined in equations.js) ──────
Object.assign(GENERATORS, {
  'perc-statements': generatePercentStatements,
  'perc-points':     generatePercentPoints,
  'perc-round':      generatePercentRound,
  'perc-successive': generatePercentSuccessive,
  'perc-compound':   generatePercentCompound,
  'perc-mixture':    generatePercentMixture,
  'perc-factor':     generatePercentFactor,
  'perc-net':        generatePercentNet,
});
