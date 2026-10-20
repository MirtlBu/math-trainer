/**
 * radicals.js
 * Helpers for expressions with square roots, e.g. 3√6 − 2 or 5 + 4√3.
 * A value is stored as an object { radicand: coefficient }; the key 1 is the rational part:
 *   3√6 − 2   →  { 6: 3, 1: -2 }
 * Radicands are always square-free in stored values (√54 is stored as 3√6).
 */

/** n = k²·r with r square-free:  splitSquare(54) → { k: 3, r: 6 } */
function splitSquare(n) {
  let k = 1, r = n;
  for (let f = 2; f * f <= r; f++) {
    while (r % (f * f) === 0) { r /= f * f; k *= f; }
  }
  return { k, r };
}

/** Add c·√n to a value, simplifying the root first (adds 3·6 to key 6 for √54) */
function addRadical(value, n, c) {
  const { k, r } = splitSquare(n);
  value[r] = (value[r] || 0) + c * k;
  return value;
}

/** Product of two values, simplified and combined */
function multiplyRadicals(a, b) {
  const out = {};
  for (const [n1, c1] of Object.entries(a)) {
    for (const [n2, c2] of Object.entries(b)) {
      addRadical(out, Number(n1) * Number(n2), c1 * c2);
    }
  }
  return dropZeros(out);
}

function dropZeros(value) {
  for (const key of Object.keys(value)) if (value[key] === 0) delete value[key];
  return value;
}

function radicalsEqual(a, b) {
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  for (const key of keys) {
    if ((a[key] || 0) !== (b[key] || 0)) return false;
  }
  return true;
}

/** Numeric value, for checks */
function radicalsValue(value) {
  return Object.entries(value).reduce((s, [n, c]) => s + c * Math.sqrt(Number(n)), 0);
}

/**
 * Turn what the user typed into a value. Accepts 3√6, 3*sqrt(6), 3sqrt6, √6, -2√3 + 5, ...
 * Returns { terms } or { error }:
 *   'empty' | 'invalid'
 *   'notSimplified' — a root can still be simplified (√54, √9, √1)
 *   'combine'       — the same root (or two plain numbers) appears twice
 */
function parseRadicals(raw) {
  const s = raw
    .toLowerCase()
    .replace(/[−–—]/g, '-')
    .replace(/[·×⋅]/g, '*')
    .replace(/√/g, 'sqrt')
    .replace(/\s+/g, '');

  if (s === '') return { error: 'empty' };

  const parts = s.match(/[+-]?[^+-]+/g);
  if (!parts || parts.join('') !== s) return { error: 'invalid' };

  const terms = {};
  let notSimplified = false;

  for (const part of parts) {
    const m = part.match(/^([+-])?(\d+)?(?:\*?sqrt(?:\((\d+)\)|(\d+)))?$/);
    if (!m) return { error: 'invalid' };

    const radicand = m[3] !== undefined ? m[3] : m[4];
    if (m[2] === undefined && radicand === undefined) return { error: 'invalid' };

    const sign = m[1] === '-' ? -1 : 1;
    const coef = m[2] !== undefined ? Number(m[2]) : 1;
    let key = 1;

    if (radicand !== undefined) {
      const n = Number(radicand);
      if (n < 1) return { error: 'invalid' };
      if (n === 1 || splitSquare(n).k > 1) notSimplified = true;
      key = n;
    }

    if (key in terms) return { error: 'combine' };
    terms[key] = sign * coef;
  }

  if (notSimplified) return { error: 'notSimplified' };
  return { terms: dropZeros(terms) };
}

// ─── LaTeX ────────────────────────────────────────────────────────────────────

/**
 * LaTeX for a list of terms in the given order, zero terms skipped. A term is
 * { coef, n }: n = 1 is a plain number, otherwise coef·√n (n is printed as given, so
 * unsimplified roots like √54 can be shown in the steps).
 */
function radicalTermsLatex(terms) {
  const shown = terms.filter(t => t.coef !== 0);
  if (shown.length === 0) return '0';

  return shown.map((t, i) => {
    const abs  = Math.abs(t.coef);
    const body = t.n === 1 ? `${abs}` : (abs === 1 ? `\\sqrt{${t.n}}` : `${abs}\\sqrt{${t.n}}`);
    if (i === 0) return t.coef < 0 ? `-${body}` : body;
    return `${t.coef < 0 ? '-' : '+'} ${body}`;
  }).join(' ');
}

/** LaTeX for a value: the plain number first, then the roots by increasing radicand */
function radicalsToLatex(value) {
  const terms = Object.keys(value)
    .map(n => ({ coef: value[n], n: Number(n) }))
    .sort((p, q) => p.n - q.n);
  return radicalTermsLatex(terms);
}
