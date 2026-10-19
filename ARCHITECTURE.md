# How Math Trainer works

Notes for myself (and for Claude in a future session): what the pieces are, how data flows, and how to add things. Planned work is in [TODO.md](TODO.md).

Plain HTML + CSS + JavaScript, no build step, no framework. Math is rendered with KaTeX from a CDN (`katex@0.16.9`).

## Files

| File | Role |
|---|---|
| `index.html` | All markup: header/breadcrumb, home, one view per topic, the practice screen. Script order matters (see below). |
| `style.css` | All styles, scoped under `.math-trainer` so the app can sit inside a WordPress/Elementor page. |
| `js/texts.js` | **Every user-facing text the scripts produce** (`TEXTS`). Texts written in `index.html` (titles, card descriptions) stay there. |
| `js/polynomial.js` | Parse/compare/print polynomials in x (`parsePolynomial`, `polyEquals`, `polyToLatex`, `termsLatex`). |
| `js/intervals.js` | Parse/compare/print intervals for inequality answers (`parseInterval`, `unmatchedIntervals`, `intervalsToLatex`). |
| `js/numbers.js` | Parse numbers (`3`, `-2.5`, `3/2`) and compare sets of numbers (`parseNumber`, `unmatchedNumbers`). |
| `js/equations.js` | Random helpers (`randInt`, `randNZ`, `randCoef`, `coefX`, `latexFrac`), the three linear-equation generators, the `GENERATORS` registry and `generateProblem(key)`. |
| `js/expressions.js` | "Expand and simplify" generators. |
| `js/polynomial-equations.js` | Quadratic / cubic / quartic: shared **builders** plus the equation generators. |
| `js/inequalities.js` | Inequality generators; reuse the builders; `signAnalysis` (sign table + answer intervals). |
| `js/ui.js` | Everything that touches the page: routing, session, checking, rendering. |
| `js/embed.js` | Options read from the URL for embedding (currently `?bg=`, see below). Loaded last. |

Script order in `index.html` (later files use globals from earlier ones):
`texts → polynomial → intervals → numbers → equations → expressions → polynomial-equations → inequalities → ui → embed`.
`expressions.js`, `polynomial-equations.js` and `inequalities.js` add themselves to `GENERATORS` with `Object.assign`.

## Content model

Levels live in **topics** (`equations`, `expressions`, `inequalities`). Each topic has a view in `index.html` with `.subtopic-card` elements; the card's `data-subtopic` is the key into `GENERATORS`.

| Topic | Level keys |
|---|---|
| equations | `linear-basic`, `linear-twoStep`, `linear-bothSides`, `quad-factored`, `quad-incomplete`, `quad-general`, `cubic`, `quartic` |
| expressions | `expand-number`, `expand-monomial`, `expand-binomials` |
| inequalities | `ineq-linear`, `ineq-product`, `ineq-quadratic`, `ineq-cubic`, `ineq-quartic` |

Home also has disabled placeholders (Functions & Graphs, Geometry).

### A problem

`generateProblem(key)` returns:

```js
{
  kind:   'solve' | 'simplify' | 'numbers' | 'intervals',   // missing kind = 'solve'
  latex:  'x^3 + 5x^2 + 6x > 0',      // shown in the problem box (KaTeX, display mode)
  answer: ...,                         // depends on kind, see below
  steps:  [{ explanation, math }],     // explanation: HTML text, may hold $inline math$; math: LaTeX
}
```

| kind | answer | fields on screen | accepted input |
|---|---|---|---|
| `solve` | one number | 1 (with "x =") | `5`, `-3`, `2.5`, `2,5`, `3/2` |
| `numbers` | array of numbers (a set of roots) | one per root (each with "x =") | same as above, any order |
| `simplify` | polynomial `{degree: coef}` | 1 | `12x^2+2x-4`, `12x²+2x−4`, `2*x`; no brackets, each power once |
| `intervals` | array of `{lo, loIncl, hi, hiIncl}` (±Infinity allowed) | one per interval | `x > 4`, `4 < x`, `-3 <= x < 2`, `(-3, 2]`, `(-inf, 1)`, `(0, ∞)`; also ≥ ≤ − |

All fields use a plain text keyboard (`inputmode="text"`), because the numeric keypads on phones have no minus sign or "/".

Number of fields = `answerCount(problem)` in `ui.js` (answer length for `numbers`/`intervals`, else 1). The field count is a small hint on its own.

### Polynomial builders (`polynomial-equations.js`)

A builder describes one polynomial with integer roots and the steps that find them:
`{ expr, leadPositive, roots, steps, note? }`. Builders: `polyQuadratic`, `polyCubicFactorX` (x(x−p)(x−q)), `polyCubicGrouping` ((x−r)(x²−k²) by grouping), `polyQuarticBiquadratic` (t = x²), `polyQuarticDifference` (x⁴ − k⁴). `quadraticSolveSteps` is the shared "solve ax²+bx+c=0" explanation: Vieta when a = 1, discriminant otherwise.

- **Equations** = `expr = 0` + builder steps; answer = `roots`.
- **Inequalities** = `expr ⟨sign⟩ 0` + "find where it equals zero" + builder steps + sign table (`signAnalysis`) + chosen intervals.

`signAnalysis(roots, leadPositive, sign)`: right of the largest root the sign is the sign of the leading coefficient and flips at every (simple) root; non-strict signs make finite endpoints closed.

Constraints of the current generators: integer roots everywhere except factored-form equations (rational roots there); inequalities have only distinct simple roots and real roots.

## The screens (`ui.js`)

One page, views switched with the `.active` class (`showView`). No URL routing: the browser Back button leaves the app.

- **Home** (`view-home`): topic cards. Enabled ones call `goTopic`.
- **Topic view** (`view-equations`, …): level cards → `goPractice(topic, subtopic, label)`. Completed levels show a green check.
- **Practice** (`view-practice`): progress bar on top; two equal columns below. Left: problem box, answer fields, Check, feedback, Prev/Next. Right: "Step-by-step solution" button and the solution box (hidden until opened). Under ≈720 px the columns stack.
- **Breadcrumb**: Home › Topic › Level; the first two are clickable.

### Session = a set of 10 problems

`startSession()` generates all 10 problems immediately and keeps them in memory in the `session` object:

```js
session = { subtopic, index, finished, items: [{ problem, solved, inputs, wrong, bad, stepsOpen }] }
```

- Only one session exists. Opening the **same level** again resumes it; a **different level**, or "10 more at this level", creates a new one. Reloading the page loses it.
- `goTo(i)` (Prev, Next, progress-bar segment) saves what is typed, switches `index`, and `showProblem()` redraws everything from the item's state (typed text, wrong-field highlight, solved state, whether the solution is open). Nothing is lost when moving around.
- **Progress bar**: 10 segments (buttons). Green = solved (even after mistakes or peeking). Light grey = not solved. A blue ring marks the problem being viewed. Header shows "Problem n of 10" and "k solved".
- **Finishing**: automatically when all 10 are solved, or by pressing "Finish set" (the Next button on problem 10). Unsolved problems stay grey and can still be solved afterwards. The end panel then stays visible.
- **End panel**: summary text and two buttons: next level and "10 more at this level". The next level (first enabled card after the current one *in the same topic*) is highlighted when at least `PASS_THRESHOLD` (7) of the 10 problems are solved; otherwise "10 more" is highlighted. On the last level of a topic the button is "Back to topics".
- **Completed levels**: pressing the next-level / back-to-topics button calls `markCompleted(currentSubtopic)`, which stores the key in `localStorage` (`math-trainer-completed`; wrapped in try/catch) and shows the check on the card. The result of the set does not matter; "10 more" does not mark.

### Checking an answer

`checkAnswer()` → `judgeAnswer(rawInputs, problem)` returns one of:

- **hint**: the input can't be judged yet (empty, not a number/interval, brackets left, powers not combined). Shown in amber; nothing is recorded.
- **wrong**: the answer stays hidden; the wrong fields (`bad`) get an amber border; for multi-field answers a right field stays neutral. Typing in a field clears its highlight and the message.
- **correct**: `solved = true`, fields become green and read-only (`readOnly`, not `disabled`, so Enter keeps working), Check is disabled.

Multi-field answers (`numbers`, `intervals`) are matched as a set: any order, and one expected answer can only be used once (the same interval twice is wrong).

Keyboard: Enter in a field moves to the next field, in the last field it checks, and in a solved problem it goes to the next problem. The first field is focused whenever a problem is shown.

### Solution box

- Opened with the button in the right column; the state is remembered per problem. Attempts are not counted anywhere: a problem is simply solved or not.
- The box scrolls sideways as a whole when a formula is too wide; formulas are padded so the space at the right end equals the left padding. Fades at the left/right edge show only on the side that can still scroll (`updateStepsFade`, driven by scroll events, `ResizeObserver` on each formula, resize and font loading).
- Steps are rendered with `katex.render` (display mode) for the formula and `renderMathInElement` for `$…$` in the explanation.

### KaTeX

Loaded with `defer` from the CDN. `renderLatexInto` / `renderInline` / `renderKatex` retry for a short time if KaTeX is not ready yet. `index.html` also runs auto-render once on load for the static card texts (`$…$`).

## Embedding options (URL parameters)

The app is meant to run inside an iframe on the WordPress site (GitHub Pages URL in `src`). `js/embed.js` reads parameters from the URL; with none, nothing changes.

- `?bg=transparent`: page background transparent so the host page shows through.
- `?bg=%23fff8f0` (or `?bg=fff8f0`, or a colour name): any other background colour. Invalid values are ignored.

Implementation: it sets the CSS variable `--page-bg` on `<html>`; `body` (inline style in `index.html`) and `.math-trainer` (`style.css`) use `var(--page-bg, <default>)`. Only the page background is affected (cards stay white).

## Texts

Scripts never hard-code user-facing strings; they use `TEXTS.*` from `js/texts.js`. Plain strings are used as is; functions take values to insert (`TEXTS.progress.current(3, 10)`). Change wording there.

## Styles

- Everything is under `.math-trainer` (reset, tokens, components). Colour/size tokens are CSS variables on `.math-trainer` (`--clr-*`, `--fs-control`, `--radius`, …).
- One font size for controls (`--fs-control`: inputs, buttons, feedback) and one for paragraphs (`p`, 1rem); formulas also 1rem (`.math-trainer .katex`).
- Amber (`--clr-retry`) = "not right yet" (instead of red); green = solved/completed.
- Breakpoints: 720 px (columns stack) and 480 px (tighter paddings, full-width inputs).

## How to add things

**A new level in an existing topic**
1. Write a generator returning a problem (see above) and register it: `Object.assign(GENERATORS, { 'my-key': generateMine })` (or add to `GENERATORS` in `equations.js`).
2. Add a `.subtopic-card data-subtopic="my-key"` to the topic's view in `index.html` (cards are the order of "next level").
3. New wording → `texts.js`.

**A new topic**
1. New `<main id="view-NAME" class="view" data-topic="NAME">` with cards; a home card with `data-topic="NAME"`.
2. Add `NAME` to `views` and `TOPICS` in `ui.js`, and `TEXTS.nav.NAME`.

**A new answer type** (`kind`)
1. Add parsing/compare helpers in a `js/*.js` file (script tag before `ui.js`).
2. `ui.js`: `answerCount` (fields), `setupForKind` (label, hint), `buildInputs` (placeholder, keyboard, prefix), `judgeAnswer` (verdict, `bad` indexes).
3. Texts for the label/hint/messages in `texts.js`.

## Testing

There is no test suite in the repo. While building, generators were verified by substituting values into the generated expression (answers must satisfy the equation, intervals must match a brute-force check) and the UI by driving it in jsdom / headless Chrome. Moving such checks into a `tests/` folder is in the TODO.
