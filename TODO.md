# TODO

Rough priority order inside each section. Last review of the UI/UX logic: 2026-10-19.

## Next up (agreed)

- [ ] **No real roots / all real numbers** for quadratic and quartic: equations with no real solutions (answer "no solution") and inequalities like `x² + 1 > 0` (all real numbers) or `x² + 1 < 0` (no solution). Needs new answer tokens in the interval parser (`R`, `all real numbers`, `(-inf, inf)`, `no solution`, `∅`) and answers that can be an empty set.
- [ ] **Double (repeated) roots in inequalities**: `x²(x − 2) > 0`, `(x − 1)²(x + 3) ≤ 0`. The sign does not flip at an even-multiplicity root; non-strict signs can add an isolated point (`x = 1`).
- [ ] **Cubics that need a root search**: `x³ − 6x² + 11x − 6 = 0`: try divisors of the constant term, divide by `(x − r)`, solve the quadratic. Equations and inequalities.
- [ ] **Non-integer roots** outside the factored-form level (rational roots like `x = 3/2` in general-form quadratics, maybe `√`-roots).
- [ ] **Roots, next steps:** answers with fractional coefficients (`√2/2`, `3√2/2`; today the parser accepts whole-number coefficients only, so rationalizing problems are generated only when the result is a whole-number combination), rationalizing with a coefficient in the denominator (`6/(2√3)`), cube and n-th roots, nested roots, equations with a root (`√(x + 2) = x`).
- [ ] **Graphs, next steps** (first version: reading a straight-line graph): more graph levels (find the equation `y = kx + b` from the graph, two graphs and their intersection, parabola: zeros, vertex, axis of symmetry; solve an inequality from the graph; domain and range), input by interacting with the graph (place a point, drag a line through two points), sliders for `a`, `b`, `c` in `y = ax² + bx + c`, negative axes (the plotter supports them but the generators only make first-quadrant graphs), a graph inside the solution that highlights the points used.
- [x] Meaning of a number in the equation (`func-equation`, done 2026-10-21): rate over a period, value, time, start, what a number means. Possible extension: fractional rates, units conversion, two equations compared.
- [ ] **Graphs with negative values** (example: weekly profit vs kilograms of paprika; the line starts below zero and crosses the x axis): generators for stories with a fixed cost (negative start) and questions about break-even (x-intercept) and negative values; `graph.js` already draws negative axes, but needs long axis titles with units (rotated "Profit (dollars)") instead of single letters, and numeric multiple-choice options (negative numbers too).
- [x] Compare two linear functions (`func-compare`, done 2026-10-21). Possible extension: "who grows faster" as a choice, graphs of both lines with their intersection marked, one line shrinking while the other grows.
- [ ] **"Story → equation → table → graph" problems** (example from the user: snow melts 2 inches a day from 12 inches; write `y = 12 − 2x`, fill the table x = 0…6, plot the points, when is the snow gone?). Parts that can be checked separately: (1) write the equation from the text (reuse `parsePolynomial`, accept `y = 12 - 2x`, `-2x + 12`); (2) fill in a table of values (a new table answer type); (3) plot points by clicking on the grid (`graph.js` needs click-to-place; check that every point lies on the line and at least two are given); (4) a follow-up number (time until zero = solve `12 − 2x = 0`). Suggested order: 1 → 2 → 3. The domain is limited (here 0 ≤ x ≤ 6), so the graph is a segment.
- [ ] **Numbers, next steps** (first version: number sets, decimal ↔ fraction): ordering and comparing numbers (fractions, decimals, negatives), percentages and ratios, powers and roots (laws of exponents), scientific notation (potenssi, 10-potenssi), rounding and estimation, absolute value, divisibility / prime factorisation, mixed numbers.
- [ ] **Word problems, next steps** (first version: parts, consecutive numbers, perimeter, quadratic area): ages ("in 5 years Mikko will be twice as old"), motion (distance = speed × time, meeting and overtaking), work together, mixtures and percentages (discounts, interest), systems of two equations from a story, equations with fractions ("a third of the rope is…"), problems where the answer is not an integer, a typed equation ("write the equation for this story") instead of only the final numbers.
- [ ] **Fractions, next steps** (first version: clearing denominators): fractions in inequalities (multiplying by a negative number flips the sign), rational equations that lead to an extraneous root (`x/(x−2) = 2/(x−2) + 1`: the "solution" is excluded), equations with fractional answers, mixed numbers, equations with a fraction inside a bracket (`(x/2 + 1)/3 = …`).
- [ ] **Proportionality, next steps:** answers that need rounding (the user's example: 73 m at 110 km/h, how long at 80 km/h? = 38.6 m): add a `tolerance` to numeric answers and the phrase "round to one decimal", compound proportion (workers × days × hours), percentages as proportions, proportions with unit conversion, writing the equation `y = kx²` from data.
- [ ] **Model problems, next steps:** non-whole answers with rounding, tables or graphs as input, "when are the two quantities equal?", three-scenario container problems.
- [ ] **Systems of linear equations, next steps:** a harder word level without the "total number of items" ("2 notebooks and 3 pads cost €21, 4 notebooks and 1 pad cost €17"), solved by elimination (add / subtract the equations) and by substitution; then plain systems with no story (`x + y = 7`, `2x - y = 5`) and a graph of two lines meeting at the solution.
- [ ] Remaining topics from the roadmap in README: geometry. Equations/inequalities levels beyond the exam list if wanted (systems, absolute value, rational and irrational equations, logarithms, trigonometry).

## Found while reviewing the UI/UX (worth fixing)

_Done 2026-10-19: numeric fields now use a text keyboard (phones had no minus or "/"); the end-of-set message and the next-level suggestion now depend only on the number of solved problems, attempts are no longer tracked._

- [ ] **Cards and breadcrumb are not keyboard accessible**: topic/level cards and breadcrumb items are `div`/`span` with click handlers (no `tabindex`, role or Enter/Space). Make them buttons or links.
- [ ] **Feedback is not announced** to screen readers: add `aria-live="polite"` to the feedback line; label each answer field.
- [ ] **`renderLatexInto` retry can render stale math**: if KaTeX is slow to load, the retry timer re-renders the old formula into the element after the user has moved to another problem, and it retries forever if the CDN is blocked. Bound the retries and check the element still wants that formula.
- [ ] **Session is lost on reload** (only completed levels are saved). Decide whether to persist the current set in `localStorage`.
- [x] Focus no longer scrolls the page to the answer field (done 2026-10-22): the field is focused only when it is already on screen.
- [ ] **Next level stays inside a topic**: the last level of a topic never leads to the next topic's first level.
- [ ] "The solutions are:" is shown for roots in the inequality solutions too (they are roots, not solutions): adjust the wording there.
- [ ] Stale comments in `ui.js`: `currentTopic` lists only two topics, `shownKind` mentions two kinds, `goTopic` doc mentions two topics.
- [ ] A wrong attempt on a multi-field answer highlights only the wrong fields, but the number of fields already reveals the number of roots/intervals (accepted, noted).

## Embedding into WordPress / Elementor

- [ ] Remove `renderMathInElement(document.body …)` from the `onload` in `index.html` (it would process `$…$` anywhere on the host page); render only inside `#math-trainer`.
- [ ] Global JS: everything is a global function/const; wrap in an IIFE or namespace so names cannot clash with the theme's scripts. The element ids are global too (`view-home`, `btn-check`, …), so two trainers cannot live on one page.
- [x] First version: GitHub Pages + `<iframe>` in an Elementor HTML widget; page background set per embed with `?bg=` (see ARCHITECTURE.md). Direct (non-iframe) embedding is still open.
- [ ] Direct embedding instead of the iframe: Elementor HTML widget with the files hosted on GitHub Pages / the WP media library. Check CSS inheritance inside the theme (fonts, button styles, line heights).
- [ ] Load KaTeX once, and only on pages that use the trainer.
- [ ] Publish: push to GitHub (see README), maybe GitHub Pages for a live demo.

## Quality

- [ ] Move the ad-hoc checks used so far into a `tests/` folder: generator checks (answers satisfy the equation; intervals match brute force), parser tests, a few UI flows in jsdom.
- [ ] Persist per-level statistics (best score, attempts) if wanted: `localStorage`, same pattern as completed levels.
- [ ] Optional UI language switch (all wording is already in `js/texts.js`, but card descriptions in `index.html` are not).
