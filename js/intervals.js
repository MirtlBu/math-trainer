/**
 * intervals.js
 * Helpers for answers to inequalities, which are sets of intervals.
 * An interval is { lo, loIncl, hi, hiIncl }; lo / hi may be -Infinity / Infinity
 * (and then the matching "Incl" is false).
 */

/**
 * Turn what the user typed into one interval. Accepted forms:
 *   inequality:  x > 4,  4 < x,  x >= 4,  -3 < x < -2,  -3 <= x < 2   (also ≥ ≤ −)
 *   brackets:    (-3, -2),  [2; 5),  (-inf, 1],  (0, ∞)
 * Returns { interval } or { error: 'empty' | 'invalid' }.
 */
function parseInterval(raw) {
  const s = raw
    .toLowerCase()
    .replace(/[−–—]/g, '-')
    .replace(/≥/g, '>=')
    .replace(/≤/g, '<=')
    .replace(/∞|infinity/g, 'inf')
    .replace(/\+inf/g, 'inf')
    .replace(/;/g, ',')
    .replace(/\s+/g, '');

  if (s === '') return { error: 'empty' };

  const NUM = '[+-]?\\d+(?:\\.\\d+)?';

  // brackets: (a, b)  [a, b)  (-inf, b]  (a, inf)
  let m = s.match(new RegExp(`^([\\(\\[])(-inf|${NUM}),(inf|${NUM})([\\)\\]])$`));
  if (m) {
    const lo = m[2] === '-inf' ? -Infinity : Number(m[2]);
    const hi = m[3] === 'inf'  ?  Infinity : Number(m[3]);
    if (!(lo < hi)) return { error: 'invalid' };
    return { interval: {
      lo, hi,
      loIncl: m[1] === '[' && lo !== -Infinity,
      hiIncl: m[4] === ']' && hi !==  Infinity,
    } };
  }

  // inequality: x > 4,  4 < x,  -3 < x < -2
  m = s.match(new RegExp(`^(?:(${NUM})(<=|>=|<|>))?x(?:(<=|>=|<|>)(${NUM}))?$`));
  if (!m || (!m[2] && !m[3])) return { error: 'invalid' };

  let lo = -Infinity, hi = Infinity, loIncl = false, hiIncl = false, loSet = 0, hiSet = 0;

  if (m[2]) {                       // number op x
    const n = Number(m[1]), incl = m[2].includes('=');
    if (m[2][0] === '<') { lo = n; loIncl = incl; loSet++; }
    else                 { hi = n; hiIncl = incl; hiSet++; }
  }
  if (m[3]) {                       // x op number
    const n = Number(m[4]), incl = m[3].includes('=');
    if (m[3][0] === '<') { hi = n; hiIncl = incl; hiSet++; }
    else                 { lo = n; loIncl = incl; loSet++; }
  }
  if (loSet > 1 || hiSet > 1 || !(lo < hi)) return { error: 'invalid' };

  return { interval: { lo, hi, loIncl, hiIncl } };
}

function intervalsEqual(a, b) {
  return a.lo === b.lo && a.hi === b.hi && a.loIncl === b.loIncl && a.hiIncl === b.hiIncl;
}

/**
 * Match the typed intervals against the expected ones, in any order.
 * Returns the indexes of typed intervals that match nothing (empty list = all correct).
 */
function unmatchedIntervals(given, expected) {
  const used = new Array(expected.length).fill(false);
  const bad  = [];
  given.forEach((g, i) => {
    const j = expected.findIndex((e, k) => !used[k] && intervalsEqual(g, e));
    if (j === -1) bad.push(i);
    else used[j] = true;
  });
  return bad;
}

// ─── LaTeX ────────────────────────────────────────────────────────────────────

function boundLatex(v) {
  if (v === Infinity)  return '\\infty';
  if (v === -Infinity) return '-\\infty';
  return String(v);
}

/** (−3, −2]  as LaTeX */
function intervalToLatex(iv) {
  return `${iv.loIncl ? '[' : '('}${boundLatex(iv.lo)}, ${boundLatex(iv.hi)}${iv.hiIncl ? ']' : ')'}`;
}

/** (−3, −2) ∪ (0, ∞)  as LaTeX */
function intervalsToLatex(list) {
  return list.map(intervalToLatex).join(' \\cup ');
}
