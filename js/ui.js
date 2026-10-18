/**
 * ui.js
 * Handles view routing, problem rendering, answer checking, and step display.
 */

// ─── state ────────────────────────────────────────────────────────────────────
let currentSubtopic = null;
let currentProblem  = null;
let answered        = false;   // has user solved this problem?
let hadHelp         = false;   // wrong attempt or solution opened before solving
let sessionResults  = [];      // per problem: 'first' (clean), 'retry' (with help) or 'skipped'

const SESSION_LENGTH = 10;     // problems per set
const PASS_THRESHOLD = 7;      // first-try solves needed to suggest the next level

// ─── DOM refs ─────────────────────────────────────────────────────────────────
const views = {
  home:      document.getElementById('view-home'),
  equations: document.getElementById('view-equations'),
  practice:  document.getElementById('view-practice'),
};

const breadcrumb      = document.getElementById('breadcrumb');
const problemEquation = document.getElementById('problem-equation');
const answerInput     = document.getElementById('answer-input');
const feedback        = document.getElementById('feedback');
const btnCheck        = document.getElementById('btn-check');
const btnNext         = document.getElementById('btn-next');
const btnSteps        = document.getElementById('btn-steps');
const stepsBox        = document.getElementById('steps-box');
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

function goEquations() {
  showView('equations');
  setBreadcrumb([
    { label: TEXTS.nav.home, view: 'home' },
    { label: TEXTS.nav.equations, view: 'equations' },
  ]);
  // Re-render KaTeX in the subtopic list (cards contain inline math)
  renderKatex(views.equations);
}

function goPractice(subtopic, label) {
  currentSubtopic = subtopic;
  showView('practice');
  setBreadcrumb([
    { label: TEXTS.nav.home,      view: 'home' },
    { label: TEXTS.nav.equations, view: 'equations' },
    { label: label,       view: null },
  ]);
  startSession();
}

/** Next enabled subtopic after the current one (in the order shown on the page), or null */
function getNextLevel() {
  const cards = [...views.equations.querySelectorAll('.subtopic-card:not(.disabled)')];
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
        if (item.view === 'home')      goHome();
        if (item.view === 'equations') goEquations();
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
function renderKatex(container) {
  // auto-render is loaded via CDN with onload; this re-runs it on a subtree
  if (window.renderMathInElement) {
    renderMathInElement(container, {
      delimiters: [
        { left: '$$', right: '$$', display: true },
        { left: '$',  right: '$',  display: false },
      ],
      throwOnError: false,
    });
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
  sessionResults = [];
  sessionComplete.style.display = 'none';
  btnNext.style.display = '';
  loadNewProblem();
}

function renderProgress() {
  const done    = sessionResults.length;
  const solved  = sessionResults.filter(r => r !== 'skipped').length;

  progressCount.textContent = done >= SESSION_LENGTH
    ? TEXTS.progress.done(SESSION_LENGTH)
    : TEXTS.progress.current(done + 1, SESSION_LENGTH);
  progressScore.textContent = TEXTS.progress.score(solved);

  progressTrack.innerHTML = '';
  for (let i = 0; i < SESSION_LENGTH; i++) {
    const seg = document.createElement('div');
    seg.className = 'progress-seg';
    if (i < done) seg.classList.add(sessionResults[i] === 'skipped' ? 'skipped' : 'correct');
    else if (i === done) seg.classList.add('current');
    progressTrack.appendChild(seg);
  }
}

function finishSession() {
  const solved  = sessionResults.filter(r => r !== 'skipped').length;
  const correct = sessionResults.filter(r => r === 'first').length;
  const passed  = correct >= PASS_THRESHOLD;
  const next    = getNextLevel();

  sessionSummary.textContent = TEXTS.session.summary(solved, SESSION_LENGTH, correct) + ' ' +
    (passed ? TEXTS.session.passed : TEXTS.session.notPassed);

  btnNextLevel.textContent = next ? TEXTS.session.nextLevel(next.label) : TEXTS.session.backToTopics;
  btnNextLevel.onclick = next
    ? () => goPractice(next.subtopic, next.label)
    : goEquations;

  // highlight the recommended option
  btnNextLevel.className = 'btn ' + (passed ? 'btn-primary' : 'btn-secondary');
  btnRepeat.className    = 'btn ' + (passed ? 'btn-secondary' : 'btn-primary');

  // lock input (the last problem may have been skipped, not solved)
  answered = true;
  btnCheck.disabled    = true;
  answerInput.disabled = true;

  btnNext.style.display = 'none';
  sessionComplete.style.display = 'block';
}

// ─── problem lifecycle ────────────────────────────────────────────────────────
function loadNewProblem() {
  currentProblem = generateProblem(currentSubtopic);
  if (!currentProblem) return;

  answered = false;
  hadHelp  = false;

  // render equation
  renderLatexInto(problemEquation, currentProblem.latex);

  // reset UI
  answerInput.value = '';
  answerInput.classList.remove('correct', 'incorrect');
  answerInput.disabled = false;
  feedback.textContent = '';
  feedback.className   = 'feedback';
  stepsBox.style.display = 'none';
  stepsList.innerHTML    = '';
  btnSteps.textContent   = TEXTS.steps.show;
  btnCheck.disabled = false;

  renderProgress();
  answerInput.focus();
}

// ─── answer checking ──────────────────────────────────────────────────────────
function checkAnswer() {
  if (answered) return;

  const raw   = answerInput.value.trim().replace(',', '.');
  const value = parseFloat(raw);

  if (raw === '' || isNaN(value)) {
    feedback.textContent = TEXTS.feedback.notANumber;
    feedback.className   = 'feedback incorrect';
    return;
  }

  // compare with small epsilon for floats (answers here are always integers)
  const correct = Math.abs(value - currentProblem.answer) < 1e-9;

  if (!correct) {
    // let the user fix it; the answer stays hidden (it's in the step-by-step solution)
    hadHelp = true;
    answerInput.classList.add('incorrect');
    feedback.textContent = TEXTS.feedback.wrong;
    feedback.className   = 'feedback incorrect';
    answerInput.select();
    return;
  }

  answered = true;
  btnCheck.disabled = true;
  answerInput.classList.remove('incorrect');
  answerInput.classList.add('correct');
  feedback.textContent = TEXTS.feedback.correct;
  feedback.className   = 'feedback correct';

  recordResult(hadHelp ? 'retry' : 'first');
}

/** "Next problem" button: an unsolved problem counts as skipped */
function nextProblem() {
  if (!answered) {
    recordResult('skipped');
    if (sessionResults.length >= SESSION_LENGTH) return;
  }
  loadNewProblem();
}

function recordResult(result) {
  sessionResults.push(result);
  renderProgress();
  if (sessionResults.length >= SESSION_LENGTH) finishSession();
}

// ─── step-by-step ─────────────────────────────────────────────────────────────
function toggleSteps() {
  if (stepsBox.style.display === 'none') {
    if (!answered) hadHelp = true;
    renderSteps();
    stepsBox.style.display = 'block';
    btnSteps.textContent   = TEXTS.steps.hide;
  } else {
    stepsBox.style.display = 'none';
    btnSteps.textContent   = TEXTS.steps.show;
  }
}

function renderSteps() {
  stepsList.innerHTML = '';
  currentProblem.steps.forEach(step => {
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
}

// ─── event listeners ──────────────────────────────────────────────────────────

// Topic cards on home
views.home.querySelectorAll('.topic-card:not(.disabled)').forEach(card => {
  card.addEventListener('click', () => {
    const topic = card.dataset.topic;
    if (topic === 'equations') goEquations();
  });
});

// Subtopic cards on equations view
views.equations.querySelectorAll('.subtopic-card:not(.disabled)').forEach(card => {
  card.addEventListener('click', () => {
    const subtopic = card.dataset.subtopic;
    const label    = card.querySelector('h3').textContent;
    goPractice(subtopic, label);
  });
});

// Practice buttons
btnCheck.addEventListener('click', checkAnswer);
btnNext.addEventListener('click',  nextProblem);
btnSteps.addEventListener('click', toggleSteps);
btnRepeat.addEventListener('click', startSession);

// Clear the red "wrong" state as soon as the user edits the answer
answerInput.addEventListener('input', () => {
  if (answered) return;
  answerInput.classList.remove('incorrect');
  feedback.textContent = '';
  feedback.className   = 'feedback';
});

// Allow Enter key to check answer
answerInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    if (!answered) checkAnswer();
    else if (sessionResults.length < SESSION_LENGTH) loadNewProblem();
  }
});

// ─── init ─────────────────────────────────────────────────────────────────────
goHome();
