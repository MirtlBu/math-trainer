/**
 * radical-problems.js
 * Generators for square-root problems. Each returns
 *   { kind: 'radicals', latex, answer, steps }
 *   answer — { radicand: coefficient } with 1 as the plain-number key (see radicals.js)
 *
 * Load after radicals.js, equations.js (random helpers) and polynomial-equations.js (pick).
 */

// ─── helpers ──────────────────────────────────────────────────────────────────

/** Square-free numbers used as the "core" of the roots */
const RADICANDS = [2, 3, 5, 6, 7, 10, 11, 13];

const randPM = () => pick([-1, 1]);

/** Non-zero integer with |n| ≤ max and a random sign */
const signedInt = max => randPM() * randInt(1, max);

/** A single term as LaTeX, in brackets when negative: -3√2 → (-3\sqrt{2}) */
function termP(t) {
  const s = radicalTermsLatex([t]);
  return s.startsWith('-') ? `(${s})` : s;
}

/** The value (as an object) of a list of terms {coef, n} */
function valueOfTerms(terms) {
  const value = {};
  terms.forEach(t => addRadical(value, t.n, t.coef));
  return dropZeros(value);
}

// ─── generators ───────────────────────────────────────────────────────────────

/** √54 = 3√6,  2√48 = 8√3 */
function generateRadicalSimplify() {
  const r = pick(RADICANDS);
  const k = randInt(2, 9);
  const c = pick([1, 1, 1, 2, 3, 4]);
  const n = k * k * r;

  const pre    = c === 1 ? '' : `${c}`;
  const latex  = `${pre}\\sqrt{${n}}`;
  const answer = { [r]: c * k };

  const steps = [
    { explanation: TEXTS.solution.originalExpression, math: latex },
    { explanation: TEXTS.solution.squareFactor,       math: `${n} = ${k * k} \\cdot ${r}` },
    {
      explanation: TEXTS.solution.splitRoot,
      math: `${pre}\\sqrt{${n}} = ${pre}\\sqrt{${k * k} \\cdot ${r}} = ${pre}\\sqrt{${k * k}} \\cdot \\sqrt{${r}} = ` +
            `${c > 1 ? `${c} \\cdot ` : ''}${k}\\sqrt{${r}}`
    },
  ];
  if (c > 1) {
    steps.push({
      explanation: TEXTS.solution.multiplyCoefficients,
      math: `${c} \\cdot ${k}\\sqrt{${r}} = ${c * k}\\sqrt{${r}}`
    });
  }

  return { kind: 'radicals', latex, answer, steps };
}

/** √54 − √24 = √6,   2√27 + √12 − √75 = 3√3 */
function generateRadicalAddSub() {
  for (;;) {
    // one common root, or (sometimes) two different ones
    const two   = randInt(1, 4) === 1;
    const cores = two ? [pick(RADICANDS), pick(RADICANDS)] : [pick(RADICANDS)];
    if (two && cores[0] === cores[1]) continue;

    const count = two ? randInt(3, 4) : randInt(2, 3);
    const terms = [];
    for (let i = 0; i < count; i++) {
      // the first two terms share a root so that something can be combined; the last one
      // uses the second root when there are two
      const r = (!two || i < 2) ? cores[0] : (i === count - 1 ? cores[1] : pick(cores));
      const k = randInt(1, 5);
      const c = pick([1, 1, 1, 2, 3]);
      const s = (i === 0 && randInt(1, 5) > 1) ? 1 : randPM();
      terms.push({ r, k, c, s });
    }

    // sums per root; skip cases where something cancels completely
    const sums = {};
    terms.forEach(t => { sums[t.r] = (sums[t.r] || 0) + t.s * t.c * t.k; });
    if (Object.values(sums).some(v => v === 0)) continue;

    const original   = terms.map(t => ({ coef: t.s * t.c, n: t.k * t.k * t.r }));
    const simplified = terms.map(t => ({ coef: t.s * t.c * t.k, n: t.r }));
    const latex      = radicalTermsLatex(original);

    // (3 − 2)√6 + (4 − 1)√3 = …
    const groups = Object.keys(sums).map(Number).sort((p, q) => p - q).map(r => {
      const coefs = simplified.filter(t => t.n === r).map(t => t.coef);
      const inner = coefs.map((c, i) =>
        i === 0 ? `${c}` : `${c < 0 ? '-' : '+'} ${Math.abs(c)}`).join(' ');
      return coefs.length > 1 ? `(${inner})\\sqrt{${r}}` : `${coefs[0]}\\sqrt{${r}}`;
    });
    const answer = {};
    Object.keys(sums).forEach(r => { answer[r] = sums[r]; });

    return {
      kind: 'radicals',
      latex,
      answer,
      steps: [
        { explanation: TEXTS.solution.originalExpression, math: latex },
        { explanation: TEXTS.solution.simplifyEachRoot,   math: radicalTermsLatex(simplified) },
        { explanation: TEXTS.solution.combineSameRoots,
          math: `${groups.join(' + ')} = ${radicalsToLatex(answer)}` },
      ]
    };
  }
}

/** √6 · √15 = 3√10,  2√3 · 3√6 = 18√2,  √98 / √2 = 7 */
function generateRadicalMulDiv() {
  if (randInt(1, 3) === 1) return generateRadicalDivide();

  let m, n;
  do { m = randInt(2, 20); n = randInt(2, 20); } while (m === n);
  const a = pick([1, 1, 1, 2, 3]);
  const b = pick([1, 1, 1, 2, 3]);
  const ab = a * b;
  const mn = m * n;
  const { k, r } = splitSquare(mn);

  const latex = `${a > 1 ? a : ''}\\sqrt{${m}} \\cdot ${b > 1 ? b : ''}\\sqrt{${n}}`;
  const answer = addRadical({}, mn, ab);

  const steps = [
    { explanation: TEXTS.solution.originalExpression, math: latex },
    {
      explanation: ab > 1 ? TEXTS.solution.multiplyRoots : TEXTS.solution.multiplyUnder,
      math: `${ab > 1 ? `(${a} \\cdot ${b})` : ''}\\sqrt{${m} \\cdot ${n}} = ${ab > 1 ? ab : ''}\\sqrt{${mn}}`
    },
  ];

  if (k > 1) {
    const left  = `${ab > 1 ? ab : ''}\\sqrt{${mn}}`;
    const mid   = (ab > 1 ? `${ab} \\cdot ` : '') + (r === 1 ? `${k}` : `${k}\\sqrt{${r}}`);
    const final = r === 1 ? `${ab * k}` : `${ab * k}\\sqrt{${r}}`;
    steps.push({
      explanation: TEXTS.solution.simplifyRoot,
      math: ab > 1 ? `${left} = ${mid} = ${final}` : `${left} = ${mid}`
    });
  }

  return { kind: 'radicals', latex, answer, steps };
}

/** √M / √N where M/N = k²·r (r = 1 gives a whole number) */
function generateRadicalDivide() {
  const N = randInt(2, 6);
  const r = randInt(1, 3) === 1 ? 1 : pick([2, 3, 5, 6, 7]);
  const k = r === 1 ? randInt(2, 9) : randInt(1, 4);
  const q = k * k * r;
  const M = N * q;

  const latex  = `\\dfrac{\\sqrt{${M}}}{\\sqrt{${N}}}`;
  const answer = addRadical({}, q, 1);

  const steps = [
    { explanation: TEXTS.solution.originalExpression, math: latex },
    { explanation: TEXTS.solution.divideRoots,
      math: `\\sqrt{\\dfrac{${M}}{${N}}} = \\sqrt{${q}}` },
  ];
  if (k > 1) {
    steps.push({
      explanation: TEXTS.solution.simplifyRoot,
      math: r === 1 ? `\\sqrt{${q}} = ${k}` : `\\sqrt{${q}} = ${k}\\sqrt{${r}}`
    });
  }

  return { kind: 'radicals', latex, answer, steps };
}

/** (4 + 3√2)(1 − √2),  (2 + √3)²,  (√5 + √2)(√5 − √2) */
function generateRadicalExpand() {
  for (;;) {
    const type = pick(['same', 'same', 'conjugate', 'square', 'mixedSquare', 'mixedConjugate']);
    let A, B, latex;
    const tl = radicalTermsLatex;

    if (type === 'mixedSquare' || type === 'mixedConjugate') {
      const p = pick([2, 3, 5, 6, 7]);
      let q;
      do { q = pick([2, 3, 5, 6, 7]); } while (q === p);
      const c1 = pick([1, 1, 2]), c2 = pick([1, 1, 3]);
      A = [{ coef: c1, n: p }, { coef: c2, n: q }];
      if (type === 'mixedSquare') { B = A;                                             latex = `(${tl(A)})^2`; }
      else { B = [{ coef: c1, n: p }, { coef: -c2, n: q }];                            latex = `(${tl(A)})(${tl(B)})`; }
    } else {
      const r = pick([2, 3, 5, 6, 7]);
      const a = signedInt(5), b = signedInt(4);
      A = [{ coef: a, n: 1 }, { coef: b, n: r }];
      if (type === 'same')      { B = [{ coef: signedInt(5), n: 1 }, { coef: signedInt(4), n: r }]; latex = `(${tl(A)})(${tl(B)})`; }
      if (type === 'conjugate') { B = [{ coef: a, n: 1 }, { coef: -b, n: r }];                       latex = `(${tl(A)})(${tl(B)})`; }
      if (type === 'square')    { B = A;                                                             latex = `(${tl(A)})^2`; }
    }

    // products of every term of A with every term of B, roots not simplified yet
    const products = [];
    const factors  = [];
    A.forEach(a => B.forEach(b => {
      products.push({ coef: a.coef * b.coef, n: a.n * b.n });
      factors.push(`${termP(a)} \\cdot ${termP(b)}`);
    }));

    const answer = valueOfTerms(products);
    if (Object.keys(answer).length === 0) continue;

    const steps = [{ explanation: TEXTS.solution.originalExpression, math: latex }];
    if (A === B) {
      steps.push({ explanation: TEXTS.solution.squareBracket, math: `(${tl(A)})(${tl(A)})` });
    }
    steps.push({ explanation: TEXTS.solution.distributeAll, math: factors.join(' + ') });
    steps.push({ explanation: TEXTS.solution.multiplyOut,   math: tl(products) });
    steps.push({ explanation: TEXTS.solution.simplifyAndCombine, math: radicalsToLatex(answer) });

    return { kind: 'radicals', latex, answer, steps };
  }
}

/** 6/√3 = 2√3,   10 / (3 + √5) = 10(3 − √5)/4 … with whole-number results */
function generateRadicalRationalize() {
  if (randInt(1, 2) === 1) {
    const n = pick(RADICANDS);
    const m = randInt(1, 6);
    const k = n * m;

    const latex  = `\\dfrac{${k}}{\\sqrt{${n}}}`;
    const answer = { [n]: m };

    return {
      kind: 'radicals', latex, answer,
      steps: [
        { explanation: TEXTS.solution.originalExpression, math: latex },
        { explanation: TEXTS.solution.rationalizeRoot,
          math: `\\dfrac{${k}}{\\sqrt{${n}}} \\cdot \\dfrac{\\sqrt{${n}}}{\\sqrt{${n}}} = \\dfrac{${k}\\sqrt{${n}}}{${n}}` },
        { explanation: TEXTS.solution.cancelFraction,
          math: `\\dfrac{${k}\\sqrt{${n}}}{${n}} = ${radicalsToLatex(answer)}` },
      ]
    };
  }

  // k / (a ± √r): multiply by the conjugate; the denominator becomes a² − r
  const a = randInt(2, 5);
  const r = pick(RADICANDS.filter(x => x < a * a));
  const d = a * a - r;
  const m = randInt(1, 4);
  const k = d * m;
  const plus = randInt(1, 2) === 1;

  const den  = `${a} ${plus ? '+' : '-'} \\sqrt{${r}}`;
  const conj = `${a} ${plus ? '-' : '+'} \\sqrt{${r}}`;
  const latex = `\\dfrac{${k}}{${den}}`;
  const answer = { 1: m * a, [r]: plus ? -m : m };

  const steps = [
    { explanation: TEXTS.solution.originalExpression, math: latex },
    { explanation: TEXTS.solution.conjugate,
      math: `\\dfrac{${k}}{${den}} \\cdot \\dfrac{${conj}}{${conj}} = \\dfrac{${k}(${conj})}{(${den})(${conj})}` },
    { explanation: TEXTS.solution.denominatorDifference,
      math: `(${den})(${conj}) = ${a}^2 - (\\sqrt{${r}})^2 = ${a * a} - ${r} = ${d}` },
    { explanation: TEXTS.solution.cancelFraction,
      math: m === 1
        ? `\\dfrac{${k}(${conj})}{${d}} = ${conj}`
        : `\\dfrac{${k}(${conj})}{${d}} = ${m}(${conj}) = ${radicalsToLatex(answer)}` },
  ];

  return { kind: 'radicals', latex, answer, steps };
}

// ─── register with the shared generator table (defined in equations.js) ──────
Object.assign(GENERATORS, {
  'radical-simplify':    generateRadicalSimplify,
  'radical-addsub':      generateRadicalAddSub,
  'radical-muldiv':      generateRadicalMulDiv,
  'radical-expand':      generateRadicalExpand,
  'radical-rationalize': generateRadicalRationalize,
});
