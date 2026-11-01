/**
 * mixed-levels.js
 * Levels that mix several related generators: one card on the page, and the 10 problems of a set
 * are taken from all of its parts in turn (each part appears about equally often, in random order).
 *
 * The parts keep their own keys in GENERATORS (so they still work on their own); a mixed level is
 * just one more key whose generator calls the parts in a shuffled round-robin.
 *
 * Load after all the files that register generators, before ui.js.
 */

const MIXED_LEVELS = {
  // equations
  'linear-medium':  ['linear-twoStep', 'linear-bothSides'],
  'frac-hard':      ['frac-linear', 'frac-rational'],
  'sys-medium':     ['sys-substitution', 'sys-elimination'],
  'quad-medium':    ['quad-factored', 'quad-incomplete'],
  'poly-hard':      ['quad-general', 'cubic', 'quartic'],
  // expressions
  'expand-medium':  ['expand-monomial', 'expand-binomials'],
  'radical-medium': ['radical-addsub', 'radical-muldiv'],
  'radical-hard':   ['radical-expand', 'radical-rationalize'],
  // inequalities
  'ineq-hard':      ['ineq-product', 'ineq-quadratic', 'ineq-cubic', 'ineq-quartic'],
  // graphs
  'graph-easy':     ['graph-value', 'func-equation'],
  'graph-medium':   ['func-compare', 'graph-interpret'],
  // word problems
  'word-eq':        ['word-parts', 'word-consecutive', 'word-geometry', 'word-system'],
  'perc-medium':    ['perc-change', 'perc-compare', 'perc-statements', 'perc-points', 'perc-round', 'perc-factor'],
  'perc-hard':      ['perc-reverse', 'perc-successive', 'perc-compound', 'perc-mixture', 'perc-net'],
  'model-medium':   ['model-data', 'model-decimal'],
  'model-hard':     ['model-containers', 'model-consistency'],
  'prop-medium':    ['prop-direct', 'prop-inverse'],
};

/** A shuffled copy of a list */
function mixShuffle(list) {
  const a = list.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = randInt(0, i);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * A generator that goes through the parts in a random order, then again in a new random order, …
 * (the same part never comes twice in a row, also across rounds).
 */
function mixedGenerator(keys) {
  let queue = [];
  let last = null;
  const generate = () => {
    if (queue.length === 0) {
      queue = mixShuffle(keys);
      if (queue.length > 1 && queue[0] === last) queue.push(queue.shift());
    }
    last = queue.shift();
    const problem = GENERATORS[last]();
    problem.part = last;                        // which part it came from (for checking)
    return problem;
  };
  generate.reset = () => { queue = []; };        // a new set starts with a fresh round
  return generate;
}

for (const [level, parts] of Object.entries(MIXED_LEVELS)) {
  for (const part of parts) {
    if (!GENERATORS[part]) throw new Error(`mixed-levels: "${part}" is not a generator (level ${level})`);
  }
  GENERATORS[level] = mixedGenerator(parts);
}
