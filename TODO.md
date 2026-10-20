# TODO

Rough priority order inside each section. Last review of the UI/UX logic: 2026-10-19.

## Next up (agreed)

- [ ] **No real roots / all real numbers** for quadratic and quartic: equations with no real solutions (answer "no solution") and inequalities like `x² + 1 > 0` (all real numbers) or `x² + 1 < 0` (no solution). Needs new answer tokens in the interval parser (`R`, `all real numbers`, `(-inf, inf)`, `no solution`, `∅`) and answers that can be an empty set.
- [ ] **Double (repeated) roots in inequalities**: `x²(x − 2) > 0`, `(x − 1)²(x + 3) ≤ 0`. The sign does not flip at an even-multiplicity root; non-strict signs can add an isolated point (`x = 1`).
- [ ] **Cubics that need a root search**: `x³ − 6x² + 11x − 6 = 0`: try divisors of the constant term, divide by `(x − r)`, solve the quadratic. Equations and inequalities.
- [ ] **Non-integer roots** outside the factored-form level (rational roots like `x = 3/2` in general-form quadratics, maybe `√`-roots).
- [ ] **Roots, next steps:** answers with fractional coefficients (`√2/2`, `3√2/2`; today the parser accepts whole-number coefficients only, so rationalizing problems are generated only when the result is a whole-number combination), rationalizing with a coefficient in the denominator (`6/(2√3)`), cube and n-th roots, nested roots, equations with a root (`√(x + 2) = x`).
- [ ] Remaining topics from the roadmap in README: functions & graphs, geometry. Equations/inequalities levels beyond the exam list if wanted (systems, absolute value, rational and irrational equations, logarithms, trigonometry).

## Found while reviewing the UI/UX (worth fixing)

_Done 2026-10-19: numeric fields now use a text keyboard (phones had no minus or "/"); the end-of-set message and the next-level suggestion now depend only on the number of solved problems, attempts are no longer tracked._

- [ ] **Cards and breadcrumb are not keyboard accessible**: topic/level cards and breadcrumb items are `div`/`span` with click handlers (no `tabindex`, role or Enter/Space). Make them buttons or links.
- [ ] **Feedback is not announced** to screen readers: add `aria-live="polite"` to the feedback line; label each answer field.
- [ ] **`renderLatexInto` retry can render stale math**: if KaTeX is slow to load, the retry timer re-renders the old formula into the element after the user has moved to another problem, and it retries forever if the CDN is blocked. Bound the retries and check the element still wants that formula.
- [ ] **Session is lost on reload** (only completed levels are saved). Decide whether to persist the current set in `localStorage`.
- [ ] **Focus jumps to the first field on every problem change**, including when clicking a progress-bar segment; on phones this opens the keyboard each time. Maybe focus only after Next / Check.
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
