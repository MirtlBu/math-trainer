/**
 * polynomial.js
 * Small helpers for expressions in x such as 12x^2 + 2x - 4.
 * A polynomial is stored as an object { degree: coefficient }, e.g. { 2: 12, 1: 2, 0: -4 }.
 */

/**
 * Turn what the user typed into a polynomial.
 * Accepts a flat sum of terms only: 5x^2 - 3x + 1, also x², −x, 2*x, spaces.
 * Returns { coeffs } or { error } where error is one of:
 *   'empty'    — nothing typed
 *   'invalid'  — not an expression we understand
 *   'brackets' — contains ( ), i.e. not expanded yet
 *   'combine'  — the same power of x appears twice, i.e. not simplified yet
 */
function parsePolynomial(raw) {
  const s = raw
    .toLowerCase()
    .replace(/[−–—]/g, '-')   // minus sign variants
    .replace(/[·×⋅]/g, '*')   // multiplication dot / cross
    .replace(/²/g, '^2')
    .replace(/³/g, '^3')
    .replace(/\s+/g, '');

  if (s === '')          return { error: 'empty' };
  if (/[()]/.test(s))    return { error: 'brackets' };

  // split into signed terms: "12x^2+8x-6" → ["12x^2", "+8x", "-6"]
  const parts = s.match(/[+-]?[^+-]+/g);
  if (!parts || parts.join('') !== s) return { error: 'invalid' };

  const coeffs = {};
  for (const part of parts) {
    const m = part.match(/^([+-])?(\d+(?:\.\d+)?)?(?:\*?(x)(?:\^(\d+))?)?$/);
    if (!m || (m[2] === undefined && m[3] === undefined)) return { error: 'invalid' };

    const sign   = m[1] === '-' ? -1 : 1;
    const number = m[2] !== undefined ? parseFloat(m[2]) : 1;
    const degree = m[3] === undefined ? 0 : (m[4] !== undefined ? parseInt(m[4], 10) : 1);

    if (degree in coeffs) return { error: 'combine' };
    coeffs[degree] = sign * number;
  }
  return { coeffs };
}

/** Are two polynomials equal? (a missing degree counts as 0) */
function polyEquals(a, b) {
  const degrees = new Set([...Object.keys(a), ...Object.keys(b)]);
  for (const d of degrees) {
    if (Math.abs((a[d] || 0) - (b[d] || 0)) > 1e-9) return false;
  }
  return true;
}

/**
 * LaTeX for a list of terms, kept in the given order, zero terms skipped:
 * [{coef: 12, deg: 2}, {coef: 8, deg: 1}, {coef: -6, deg: 1}] → "12x^2 + 8x - 6x"
 */
function termsLatex(terms) {
  const shown = terms.filter(t => t.coef !== 0);
  if (shown.length === 0) return '0';

  return shown.map((t, i) => {
    const abs  = Math.abs(t.coef);
    const x    = t.deg === 0 ? '' : (t.deg === 1 ? 'x' : `x^${t.deg}`);
    const body = t.deg === 0 ? `${abs}` : (abs === 1 ? x : `${abs}${x}`);
    if (i === 0) return t.coef < 0 ? `-${body}` : body;
    return `${t.coef < 0 ? '-' : '+'} ${body}`;
  }).join(' ');
}

/** LaTeX for a polynomial, highest power first: { 2: 12, 1: 2, 0: -4 } → "12x^2 + 2x - 4" */
function polyToLatex(coeffs) {
  const terms = Object.keys(coeffs)
    .map(d => ({ coef: coeffs[d], deg: Number(d) }))
    .sort((p, q) => q.deg - p.deg);
  return termsLatex(terms);
}
