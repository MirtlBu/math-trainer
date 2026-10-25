/**
 * systems.js
 * Systems of two linear equations in x and y, solved step by step.
 *
 *   sys-substitution   one equation already gives a variable (y = 2x - 1), put it into the other
 *   sys-elimination    add or subtract the equations: one variable cancels at once
 *   sys-multiply       multiply one or both equations first so that one variable cancels
 *
 * Problem: { kind: 'numbers', ordered: true, labels: ['x', 'y'], latex (the system), answer: [x, y], steps }
 * The solution (x, y) is chosen first (whole numbers, x ≠ y), the equations are built around it.
 *
 * Load after equations.js (randInt, randNZ, constTerm), words in texts.js (TEXTS.linsys, TEXTS.solution,
 * TEXTS.words) and word-problems.js (listLatex).
 */

// ─── helpers (names start with "sys" so they cannot clash with other files) ──

/** A negative number in brackets: -3 → "(-3)" */
const sysPar = n => (n < 0 ? `(${n})` : `${n}`);

/** One term with its sign: first → "3x" / "-x"; later → "+ 3x" / "- x" */
function sysTerm(c, v, first) {
  const abs = Math.abs(c);
  const body = (abs === 1 ? '' : `${abs}`) + v;
  if (first) return c < 0 ? `-${body}` : body;
  return `${c < 0 ? '-' : '+'} ${body}`;
}

/** "3x - 2y" */
const sysLhs = (a, b) => `${sysTerm(a, 'x', true)} ${sysTerm(b, 'y', false)}`;

/** "2x - 1", "-x + 3", "5x" (a variable and a constant) */
function sysLinC(a, c, v) {
  return `${sysTerm(a, v, true)}${c === 0 ? '' : ` ${c < 0 ? '-' : '+'} ${Math.abs(c)}`}`;
}

/** The system as LaTeX */
const sysCases = lines => `\\begin{cases} ${lines.join(' \\\\ ')} \\end{cases}`;

/** The solution (x, y): non-zero whole numbers that are different */
function sysSolution() {
  let x, y;
  do { x = randNZ(8); y = randNZ(8); } while (x === y);
  return { x, y };
}

const sysLcm = (a, b) => {
  let g = a, h = b;
  while (h) [g, h] = [h, g % h];
  return a * b / g;
};

const SYS_LABELS = ['x', 'y'];

function sysProblem(latex, answer, steps, meta) {
  return {
    kind: 'numbers', ordered: true,
    question: TEXTS.linsys.question,
    labels: SYS_LABELS,
    hint: TEXTS.words.orderHint,
    latex, answer,
    steps: [...steps, { explanation: TEXTS.words.answerIs, math: listLatex(answer.map(String)) }],
    meta,
  };
}

// ─── level 1: substitution ────────────────────────────────────────────────────

/** y = kx + m (or x = ky + m) in the first equation; a·x + b·y = c in the second */
function generateSysSubstitution() {
  for (;;) {
    const { x, y } = sysSolution();
    const q = randInt(0, 1) === 0 ? 'y' : 'x';          // the variable the first equation gives
    const p = q === 'y' ? 'x' : 'y';
    const p0 = p === 'x' ? x : y, q0 = q === 'x' ? x : y;
    const k = randNZ(4);
    const m = q0 - k * p0;
    if (m === 0 || Math.abs(m) > 15) continue;

    const a = randNZ(5), b = randNZ(5);
    const cp = p === 'x' ? a : b, cq = q === 'x' ? a : b;   // coefficients of p and q in the second equation
    const A = cp + cq * k;
    if (A === 0) continue;
    const c = a * x + b * y;

    const eq1 = `${q} = ${sysLinC(k, m, p)}`;
    const eq2 = `${sysLhs(a, b)} = ${c}`;
    const substituted = `${sysTerm(cp, p, true)} ${cq < 0 ? '-' : '+'} ${Math.abs(cq) === 1 ? '' : Math.abs(cq)}(${sysLinC(k, m, p)})`;
    const C = cq * m;
    const kTimes = k === 1 ? sysPar(p0) : k === -1 ? `-${sysPar(p0)}` : `${k} \\cdot ${sysPar(p0)}`;

    const steps = [
      { explanation: TEXTS.linsys.substituteInto(q), math: `${substituted} = ${c}` },
      { explanation: TEXTS.words.expandBrackets,
        math: `${sysTerm(cp, p, true)} ${sysTerm(cq * k, p, false)} ${C < 0 ? '-' : '+'} ${Math.abs(C)} = ${c}` },
      { explanation: TEXTS.solution.combineLike, math: `${sysLinC(A, C, p)} = ${c}` },
      { explanation: C > 0 ? TEXTS.solution.subtract(C) : TEXTS.solution.add(-C), math: `${sysTerm(A, p, true)} = ${c - C}` },
    ];
    if (A !== 1) steps.push({ explanation: TEXTS.solution.divide(A), math: `${p} = ${p0}` });
    steps.push({ explanation: TEXTS.linsys.findOther(p, q),
      math: `${q} = ${kTimes} ${m < 0 ? '-' : '+'} ${Math.abs(m)} = ${q0}` });

    return sysProblem(sysCases([eq1, eq2]), [x, y], steps, { x, y, k, m, q });
  }
}

// ─── levels 2 and 3: elimination ──────────────────────────────────────────────

/** Coefficient pairs of the variable that gets eliminated when the equations are multiplied first */
const SYS_MULTIPLY_PAIRS = [[2, 3], [3, 2], [2, 5], [3, 4], [4, 3], [5, 2], [3, 5], [2, 4], [4, 2], [3, 6], [6, 3], [2, 6], [4, 6], [6, 4]];

/**
 * multiply = false: the coefficients of one variable are equal or opposite (add / subtract at once)
 * multiply = true:  the coefficients differ, so one or both equations are multiplied first
 */
function sysElimination(multiply) {
  for (;;) {
    const { x, y } = sysSolution();
    const v = randInt(0, 1) === 0 ? 'x' : 'y';          // the variable that is eliminated
    const w = v === 'x' ? 'y' : 'x';
    const v0 = v === 'x' ? x : y, w0 = v === 'x' ? y : x;

    const [u1, u2] = multiply ? SYS_MULTIPLY_PAIRS[randInt(0, SYS_MULTIPLY_PAIRS.length - 1)]
                              : (() => { const u = randInt(1, 6); return [u, u]; })();
    const s1 = randInt(0, 1) ? 1 : -1, s2 = randInt(0, 1) ? 1 : -1;
    if (multiply === false && s1 === -1) continue;       // the first equation starts with a positive coefficient
    const p1 = s1 * u1, p2 = s2 * u2;                    // coefficients of v
    const q1 = randNZ(multiply ? 5 : 6), q2 = randNZ(multiply ? 5 : 6);   // coefficients of w

    const L = sysLcm(u1, u2);
    const m1 = L / u1, m2 = L / u2;                      // multipliers
    const subtract = s1 === s2;                          // equal coefficients: subtract, opposite: add
    const r = subtract ? m1 * q1 - m2 * q2 : m1 * q1 + m2 * q2;   // the coefficient of w that is left
    if (r === 0 || Math.abs(r) > 60) continue;

    const eq = (cv, cw) => (v === 'x' ? [cv, cw] : [cw, cv]);
    const [a1, b1] = eq(p1, q1), [a2, b2] = eq(p2, q2);
    const c1 = a1 * x + b1 * y, c2 = a2 * x + b2 * y;
    if (Math.abs(c1) > 150 || Math.abs(c2) > 150) continue;

    const steps = [];
    let e1 = [a1, b1, c1], e2 = [a2, b2, c2];
    if (m1 !== 1 || m2 !== 1) {
      e1 = e1.map(n => n * m1); e2 = e2.map(n => n * m2);
      steps.push({ explanation: TEXTS.linsys.multiplyBoth(m1, m2, v),
        math: sysCases([`${sysLhs(e1[0], e1[1])} = ${e1[2]}`, `${sysLhs(e2[0], e2[1])} = ${e2[2]}`]) });
    }
    const op = subtract ? '-' : '+';
    const rhs = subtract ? e1[2] - e2[2] : e1[2] + e2[2];
    steps.push({ explanation: subtract ? TEXTS.linsys.subtractEq(v) : TEXTS.linsys.addEq(v),
      math: `(${sysLhs(e1[0], e1[1])}) ${op} (${sysLhs(e2[0], e2[1])}) = ${e1[2]} ${op} ${sysPar(e2[2])}` +
            ` \\quad\\Rightarrow\\quad ${sysTerm(r, w, true)} = ${rhs}` });
    if (r !== 1) steps.push({ explanation: TEXTS.solution.divide(r), math: `${w} = ${w0}` });

    // put the value into the first original equation to find the other variable
    const rest = c1 - q1 * w0;                           // p1·v = rest
    steps.push(
      { explanation: TEXTS.linsys.backSub(w, w0),
        math: `${sysTerm(p1, v, true)} ${q1 < 0 ? '-' : '+'} ${Math.abs(q1)} \\cdot ${sysPar(w0)} = ${c1}` },
      { explanation: TEXTS.linsys.moveNumber, math: `${sysTerm(p1, v, true)} = ${rest}` },
    );
    if (p1 !== 1) steps.push({ explanation: TEXTS.solution.divide(p1), math: `${v} = ${v0}` });

    return sysProblem(sysCases([`${sysLhs(a1, b1)} = ${c1}`, `${sysLhs(a2, b2)} = ${c2}`]), [x, y], steps,
      { x, y, v, m1, m2, subtract });
  }
}

const generateSysElimination = () => sysElimination(false);
const generateSysMultiply    = () => sysElimination(true);

// ─── register with the shared generator table (defined in equations.js) ──────
Object.assign(GENERATORS, {
  'sys-substitution': generateSysSubstitution,
  'sys-elimination':  generateSysElimination,
  'sys-multiply':     generateSysMultiply,
});
