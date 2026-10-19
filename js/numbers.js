/**
 * numbers.js
 * Reading and comparing numeric answers (single numbers and sets of numbers).
 */

/**
 * Turn what the user typed into a number. Accepts 5, -3, 2.5, 2,5, 3/2, -3/2 (also − as minus).
 * Returns { value } or { error: 'empty' | 'invalid' }.
 */
function parseNumber(raw) {
  const s = raw
    .toLowerCase()
    .replace(/[−–—]/g, '-')
    .replace(/\s+/g, '')
    .replace(',', '.');

  if (s === '') return { error: 'empty' };

  let m = s.match(/^([+-]?)(\d+(?:\.\d+)?)$/);
  if (m) return { value: (m[1] === '-' ? -1 : 1) * Number(m[2]) };

  m = s.match(/^([+-]?)(\d+)\/(\d+)$/);
  if (m && Number(m[3]) !== 0) {
    return { value: (m[1] === '-' ? -1 : 1) * Number(m[2]) / Number(m[3]) };
  }

  return { error: 'invalid' };
}

/**
 * Match the typed numbers against the expected ones, in any order.
 * Returns the indexes of typed numbers that match nothing (empty list = all correct).
 */
function unmatchedNumbers(given, expected) {
  const used = new Array(expected.length).fill(false);
  const bad  = [];
  given.forEach((g, i) => {
    const j = expected.findIndex((e, k) => !used[k] && Math.abs(g - e) < 1e-9);
    if (j === -1) bad.push(i);
    else used[j] = true;
  });
  return bad;
}
