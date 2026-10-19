/**
 * ui.js
 * Handles view routing, problem rendering, answer checking, and step display.
 *
 * A "session" is a set of SESSION_LENGTH problems generated up front and kept in
 * memory, so the user can move back and forth (Prev / Next / progress bar) and find
 * each problem as they left it. It is replaced when the user starts a new set or
 * opens a different level.
 */

// ─── state ────────────────────────────────────────────────────────────────────
let currentTopic    = null;   // 'equations' | 'expressions'
let currentSubtopic = null;
let shownKind       = null;   // 'solve' | 'simplify': what the practice screen is set up for

/**
 * {
 *   subtopic, index, finished,
 *   items: [{ problem, solved, hadHelp, input, wrong, stepsOpen }]
 * }
 *  hadHelp  — a wrong attempt or the solution was opened before solving
 *  wrong    — the last check of the current input was wrong (to restore the hint)
 */
let session = null;

const SESSION_LENGTH = 10;     // problems per set
const PASS_THRESHOLD = 7;      // first-try solves needed to suggest the next level

const currentItem = () => session.items[session.index];

// ─── completed levels (remembered in the browser) ─────────────────────────────
const COMPLETED_KEY = 'math-trainer-completed';

function loadCompleted() {
  try {
    return new Set(JSON.parse(localStorage.getItem(COMPLETED_KEY)) || []);
  } catch (e) {
    return new Set();   // storage blocked or corrupted: start empty
  }
}

const completed = loadCompleted();

/** A level counts as completed once the user moves on from its finished set */
function markCompleted(subtopic) {
  completed.add(subtopic);
  try {
    localStorage.setItem(COMPLETED_KEY, JSON.stringify([...completed]));
  } catch (e) { /* not saved, still shown until the page is closed */ }
  renderCompleted();
}

/** Green check on the subtopic cards of completed levels */
function renderCompleted() {
  document.querySelectorAll('.subtopic-card[data-subtopic]').forEach(card => {
    card.classList.toggle('completed', completed.has(card.dataset.subtopic));
  });
}

/** Add the (initially hidden) check icon to every subtopic card */
function addCheckIcons() {
  document.querySelectorAll('.subtopic-card[data-subtopic]').forEach(card => {
    const icon = document.createElement('span');
    icon.className = 'subtopic-check';
    icon.title = TEXTS.progress.levelCompleted;
    icon.setAttribute('role', 'img');
    icon.setAttribute('aria-label', TEXTS.progress.levelCompleted);
    icon.innerHTML =
      '<svg viewBox="0 0 24 24" aria-hidden="true">' +
      '<circle cx="12" cy="12" r="12" fill="currentColor"/>' +
      '<path d="M7 12.5l3.2 3.2L17 8.8" fill="none" stroke="#fff" stroke-width="2.4" ' +
      'stroke-linecap="round" stroke-linejoin="round"/></svg>';
    card.appendChild(icon);
  });
}

// ─── DOM refs ─────────────────────────────────────────────────────────────────
const views = {
  home:      document.getElementById('view-home'),
  equations: document.getElementById('view-equations'),
  expressions: document.getElementById('view-expressions'),
  practice:  document.getElementById('view-practice'),
};

const breadcrumb      = document.getElementById('breadcrumb');
const TOPICS          = ['equations', 'expressions'];   // views that list subtopic cards

const problemLabel    = document.getElementById('problem-label');
const problemEquation = document.getElementById('problem-equation');
const answerPrefix    = document.getElementById('answer-prefix');
const answerInput     = document.getElementById('answer-input');
const feedback        = document.getElementById('feedback');
const btnCheck        = document.getElementById('btn-check');
const btnPrev         = document.getElementById('btn-prev');
const btnNext         = document.getElementById('btn-next');
const btnSteps        = document.getElementById('btn-steps');
const stepsBox        = document.getElementById('steps-box');
const stepsScroll     = document.getElementById('steps-scroll');
const stepsList       = document.getElementById('steps-list');
const progressCount   = document.getElementById('progress-count');
const progressScore   = document.getElementById('progress-score');
const progressTrack   = document.getElementById('progress-track');
const sessionComplete = document.getElementById('session-complete');
const sessionSummary  = document.getElementById('session-summary');
const btnNextLevel    = document.getElementById('btn-next-level');
const btnRepeat       = document.getElementById('btn-repeat');

// ─── routing ──────────────────────────────────────────────────────────────────
function showView(name) {
  Object.values(views).forEach(v => v.classList.remove('active'));
  views[name].classList.add('active');
}

function goHome() {
  showView('home');
  setBreadcrumb([{ label: TEXTS.nav.home, view: 'home' }]);
}

/** Subtopic list of a topic ('equations' or 'expressions') */
function goTopic(topic) {
  currentTopic = topic;
  showView(topic);
  setBreadcrumb([
    { label: TEXTS.nav.home,  view: 'home' },
    { label: TEXTS.nav[topic], view: topic },
  ]);
  // Re-render KaTeX in the subtopic list (cards contain inline math)
  renderKatex(views[topic]);
}

function goPractice(topic, subtopic, label) {
  currentTopic    = topic;
  currentSubtopic = subtopic;
  showView('practice');
  setBreadcrumb([
    { label: TEXTS.nav.home,   view: 'home' },
    { label: TEXTS.nav[topic], view: topic },
    { label: label,            view: null },
  ]);

  // coming back to the same level resumes the set; another level starts a new one
  if (session && session.subtopic === subtopic) showProblem();
  else startSession();
}

/** Next enabled subtopic after the current one (in the order shown on the page), or null */
function getNextLevel() {
  const cards = [...views[currentTopic].querySelectorAll('.subtopic-card:not(.disabled)')];
  const i = cards.findIndex(c => c.dataset.subtopic === currentSubtopic);
  const next = cards[i + 1];
  if (!next) return null;
  return { subtopic: next.dataset.subtopic, label: next.querySelector('h3').textContent };
}

// ─── breadcrumb ───────────────────────────────────────────────────────────────
function setBreadcrumb(items) {
  breadcrumb.innerHTML = '';
  items.forEach((item, i) => {
    const span = document.createElement('span');
    span.className = 'breadcrumb-item' + (i === items.length - 1 ? ' active' : '');
    span.textContent = item.label;
    if (item.view && i < items.length - 1) {
      span.addEventListener('click', () => {
        if (item.view === 'home') goHome();
        else                      goTopic(item.view);
      });
    }
    breadcrumb.appendChild(span);

    if (i < items.length - 1) {
      const sep = document.createElement('span');
      sep.className = 'breadcrumb-sep';
      sep.textContent = '›';
      breadcrumb.appendChild(sep);
    }
  });
}

// ─── KaTeX rendering ──────────────────────────────────────────────────────────
function renderKatex(container, tries = 0) {
  // auto-render is loaded via CDN with onload; this re-runs it on a subtree
  if (window.renderMathInElement) {
    renderMathInElement(container, {
      delimiters: [
        { left: '$$', right: '$$', display: true },
        { left: '$',  right: '$',  display: false },
      ],
      throwOnError: false,
    });
  } else if (tries < 10) {
    // KaTeX not loaded yet — try again shortly
    setTimeout(() => renderKatex(container, tries + 1), 300);
  }
}

function renderLatexInto(el, latex) {
  if (window.katex) {
    try {
      katex.render(latex, el, { throwOnError: false, displayMode: true });
    } catch (e) {
      el.textContent = latex;
    }
  } else {
    // KaTeX not yet loaded — retry once
    setTimeout(() => renderLatexInto(el, latex), 300);
  }
}

// ─── session (set of SESSION_LENGTH problems) ─────────────────────────────────
function startSession() {
  session = {
    subtopic: currentSubtopic,
    index:    0,
    finished: false,
    items: Array.from({ length: SESSION_LENGTH }, () => ({
      problem:   generateProblem(currentSubtopic),
      solved:    false,
      hadHelp:   false,
      input:     '',
      wrong:     false,
      stepsOpen: false,
    })),
  };
  showProblem();
}

/** Move to problem i (0-based), remembering what was typed in the current one */
function goTo(i) {
  if (i < 0 || i >= SESSION_LENGTH || i === session.index) return;
  currentItem().input = answerInput.value;
  session.index = i;
  showProblem();
}

function renderProgress() {
  const solved = session.items.filter(it => it.solved).length;

  progressCount.textContent = TEXTS.progress.current(session.index + 1, SESSION_LENGTH);
  progressScore.textContent = TEXTS.progress.score(solved);

  progressTrack.innerHTML = '';
  session.items.forEach((item, i) => {
    const seg = document.createElement('button');
    seg.type      = 'button';
    seg.className = 'progress-seg';
    if (item.solved)         seg.classList.add('correct');
    if (i === session.index) seg.classList.add('current');
    seg.setAttribute('aria-label', TEXTS.progress.goTo(i + 1));
    if (i === session.index) seg.setAttribute('aria-current', 'true');
    seg.addEventListener('click', () => goTo(i));
    progressTrack.appendChild(seg);
  });
}

function renderSessionComplete() {
  const solved  = session.items.filter(it => it.solved).length;
  const correct = session.items.filter(it => it.solved && !it.hadHelp).length;
  const passed  = correct >= PASS_THRESHOLD;
  const next    = getNextLevel();

  sessionSummary.textContent = TEXTS.session.summary(solved, SESSION_LENGTH, correct) + ' ' +
    (passed ? TEXTS.session.passed : TEXTS.session.notPassed);

  btnNextLevel.textContent = next ? TEXTS.session.nextLevel(next.label) : TEXTS.session.backToTopics;
  // moving on from a finished set marks the level as completed
  btnNextLevel.onclick = () => {
    markCompleted(currentSubtopic);
    if (next) goPractice(currentTopic, next.subtopic, next.label);
    else      goTopic(currentTopic);
  };

  // highlight the recommended option
  btnNextLevel.className = 'btn ' + (passed ? 'btn-primary' : 'btn-secondary');
  btnRepeat.className    = 'btn ' + (passed ? 'btn-secondary' : 'btn-primary');

  sessionComplete.style.display = 'block';
}

/** Show the end-of-set panel (all solved, or the user pressed "Finish set") */
function finishSession() {
  session.finished = true;
  renderSessionComplete();
  updateNav();
  sessionComplete.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/** Prev / Next buttons depend on the position in the set */
function updateNav() {
  const last = session.index === SESSION_LENGTH - 1;
  btnPrev.disabled      = session.index === 0;
  btnNext.textContent   = last ? TEXTS.session.finish : TEXTS.session.nextProblem;
  // once the set is finished there is nothing left to do from the last problem
  btnNext.style.display = last && session.finished ? 'none' : '';
}

// ─── problem lifecycle ────────────────────────────────────────────────────────
/** Label, input prefix, placeholder and keyboard depend on the answer type */
function setupForKind(kind) {
  if (kind === shownKind) return;
  shownKind = kind;

  const simplify = kind === 'simplify';
  problemLabel.textContent    = simplify ? TEXTS.practice.simplifyLabel : TEXTS.practice.solveLabel;
  renderKatex(problemLabel);
  answerPrefix.style.display  = simplify ? 'none' : '';   // "x =" only for equations
  answerInput.placeholder     = simplify ? TEXTS.practice.expressionPlaceholder : TEXTS.practice.numberPlaceholder;
  answerInput.inputMode       = simplify ? 'text' : 'decimal';
}

/** Draw the current problem with everything the user has already done on it */
function showProblem() {
  const item = currentItem();
  if (!item.problem) return;

  renderLatexInto(problemEquation, item.problem.latex);
  setupForKind(item.problem.kind || 'solve');

  // answer area
  answerInput.value    = item.input;
  answerInput.readOnly = item.solved;   // readOnly (not disabled) so Enter still moves on
  btnCheck.disabled    = item.solved;
  answerInput.classList.remove('correct', 'incorrect');
  feedback.className   = 'feedback';
  feedback.textContent = '';
  if (item.solved) {
    answerInput.classList.add('correct');
    feedback.textContent = TEXTS.feedback.correct;
    feedback.className   = 'feedback correct';
  } else if (item.wrong) {
    answerInput.classList.add('incorrect');
    feedback.textContent = TEXTS.feedback.wrong;
    feedback.className   = 'feedback incorrect';
  }

  // solution
  applySteps();

  // end-of-set panel stays visible once the set is finished
  sessionComplete.style.display = session.finished ? 'block' : 'none';

  renderProgress();
  updateNav();
  answerInput.focus();
}

// ─── answer checking ──────────────────────────────────────────────────────────
/**
 * Compare what the user typed with the problem's answer.
 * Returns { status: 'correct' | 'wrong' | 'hint', message? }
 *  hint — the input can't be judged yet (not a number, brackets left...); not an attempt
 */
function judgeAnswer(rawInput, problem) {
  if (problem.kind === 'simplify') {
    const parsed = parsePolynomial(rawInput);
    if (parsed.error === 'brackets') return { status: 'hint', message: TEXTS.feedback.expandFirst };
    if (parsed.error === 'combine')  return { status: 'hint', message: TEXTS.feedback.combineLike };
    if (parsed.error)                return { status: 'hint', message: TEXTS.feedback.notAnExpression };
    return { status: polyEquals(parsed.coeffs, problem.answer) ? 'correct' : 'wrong' };
  }

  const raw   = rawInput.trim().replace(',', '.');
  const value = parseFloat(raw);
  if (raw === '' || isNaN(value)) return { status: 'hint', message: TEXTS.feedback.notANumber };

  // compare with small epsilon for floats (answers here are always integers)
  return { status: Math.abs(value - problem.answer) < 1e-9 ? 'correct' : 'wrong' };
}

function checkAnswer() {
  const item = currentItem();
  if (item.solved) return;

  const verdict = judgeAnswer(answerInput.value, item.problem);

  if (verdict.status === 'hint') {
    feedback.textContent = verdict.message;
    feedback.className   = 'feedback incorrect';
    return;
  }

  item.input = answerInput.value;

  if (verdict.status === 'wrong') {
    // let the user fix it; the answer stays hidden (it's in the step-by-step solution)
    item.hadHelp = true;
    item.wrong   = true;
    answerInput.classList.add('incorrect');
    feedback.textContent = TEXTS.feedback.wrong;
    feedback.className   = 'feedback incorrect';
    answerInput.select();
    return;
  }

  item.solved = true;
  item.wrong  = false;
  showProblem();

  if (session.items.every(it => it.solved)) finishSession();
}

// ─── step-by-step ─────────────────────────────────────────────────────────────
function toggleSteps() {
  const item = currentItem();
  item.stepsOpen = !item.stepsOpen;
  if (item.stepsOpen && !item.solved) item.hadHelp = true;
  applySteps();
}

/** Show or hide the solution according to the current item's state */
function applySteps() {
  const item = currentItem();
  if (item.stepsOpen) {
    renderSteps(item.problem);
    stepsBox.style.display = 'block';
    stepsScroll.scrollLeft = 0;
    updateStepsFade();
    btnSteps.textContent   = TEXTS.steps.hide;
  } else {
    stepsBox.style.display = 'none';
    stepsList.innerHTML    = '';
    btnSteps.textContent   = TEXTS.steps.show;
  }
}

/** Show the edge fades only on the sides where the solution can still be scrolled */
function updateStepsFade() {
  const max = stepsScroll.scrollWidth - stepsScroll.clientWidth;
  stepsBox.classList.toggle('fade-left',  stepsScroll.scrollLeft > 2);
  stepsBox.classList.toggle('fade-right', stepsScroll.scrollLeft < max - 2);
}

// formulas change width after KaTeX / its fonts finish loading, so each one is watched
const stepsObserver = window.ResizeObserver ? new ResizeObserver(updateStepsFade) : null;

function renderSteps(problem) {
  stepsList.innerHTML = '';
  problem.steps.forEach(step => {
    const li = document.createElement('li');

    const content = document.createElement('div');
    content.className = 'step-content';

    const explanation = document.createElement('div');
    explanation.className = 'step-explanation';
    explanation.innerHTML = step.explanation; // may contain inline $...$

    const mathEl = document.createElement('div');
    mathEl.className = 'step-math';
    renderLatexInto(mathEl, step.math);

    content.appendChild(explanation);
    content.appendChild(mathEl);
    li.appendChild(content);
    stepsList.appendChild(li);
  });

  // render any inline KaTeX in explanations
  renderKatex(stepsList);

  if (stepsObserver) {
    stepsObserver.disconnect();
    stepsObserver.observe(stepsScroll);
    stepsList.querySelectorAll('.step-math').forEach(el => stepsObserver.observe(el));
  }
}

// ─── event listeners ──────────────────────────────────────────────────────────

// Topic cards on home
views.home.querySelectorAll('.topic-card:not(.disabled)').forEach(card => {
  card.addEventListener('click', () => {
    const topic = card.dataset.topic;
    if (TOPICS.includes(topic)) goTopic(topic);
  });
});

// Subtopic cards on each topic view
TOPICS.forEach(topic => {
  views[topic].querySelectorAll('.subtopic-card:not(.disabled)').forEach(card => {
    card.addEventListener('click', () => {
      const subtopic = card.dataset.subtopic;
      const label    = card.querySelector('h3').textContent;
      goPractice(topic, subtopic, label);
    });
  });
});

// Edge fades follow the scroll position and any change of size (KaTeX finishing, window resize)
stepsScroll.addEventListener('scroll', updateStepsFade);
window.addEventListener('resize', updateStepsFade);
if (document.fonts && document.fonts.ready) document.fonts.ready.then(updateStepsFade);

// Practice buttons
btnCheck.addEventListener('click', checkAnswer);
btnPrev.addEventListener('click',  () => goTo(session.index - 1));
btnNext.addEventListener('click',  () => {
  if (session.index < SESSION_LENGTH - 1) goTo(session.index + 1);
  else finishSession();
});
btnSteps.addEventListener('click', toggleSteps);
btnRepeat.addEventListener('click', startSession);

// Remember the input and clear the "wrong" state as soon as the user edits the answer
answerInput.addEventListener('input', () => {
  const item = currentItem();
  if (item.solved) return;
  item.input = answerInput.value;
  item.wrong = false;
  answerInput.classList.remove('incorrect');
  feedback.textContent = '';
  feedback.className   = 'feedback';
});

// Enter: check the answer, or go on to the next problem once solved
answerInput.addEventListener('keydown', e => {
  if (e.key !== 'Enter') return;
  if (!currentItem().solved) checkAnswer();
  else if (session.index < SESSION_LENGTH - 1) goTo(session.index + 1);
});

// ─── init ─────────────────────────────────────────────────────────────────────
addCheckIcons();
renderCompleted();
goHome();
