/**
 * ui.js
 * Handles view routing, problem rendering, answer checking, and step display.
 */

// ─── state ────────────────────────────────────────────────────────────────────
let currentSubtopic = null;
let currentProblem  = null;
let answered        = false;   // has user already checked this problem?

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

// ─── routing ──────────────────────────────────────────────────────────────────
function showView(name) {
  Object.values(views).forEach(v => v.classList.remove('active'));
  views[name].classList.add('active');
}

function goHome() {
  showView('home');
  setBreadcrumb([{ label: 'Home', view: 'home' }]);
}

function goEquations() {
  showView('equations');
  setBreadcrumb([
    { label: 'Home', view: 'home' },
    { label: 'Equations', view: 'equations' },
  ]);
  // Re-render KaTeX in the subtopic list (cards contain inline math)
  renderKatex(views.equations);
}

function goPractice(subtopic, label) {
  currentSubtopic = subtopic;
  showView('practice');
  setBreadcrumb([
    { label: 'Home',      view: 'home' },
    { label: 'Equations', view: 'equations' },
    { label: label,       view: null },
  ]);
  loadNewProblem();
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

// ─── problem lifecycle ────────────────────────────────────────────────────────
function loadNewProblem() {
  currentProblem = generateProblem(currentSubtopic);
  if (!currentProblem) return;

  answered = false;

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
  btnSteps.textContent   = 'Show step-by-step solution';
  btnCheck.disabled = false;

  answerInput.focus();
}

// ─── answer checking ──────────────────────────────────────────────────────────
function checkAnswer() {
  if (answered) return;

  const raw   = answerInput.value.trim().replace(',', '.');
  const value = parseFloat(raw);

  if (raw === '' || isNaN(value)) {
    feedback.textContent = 'Please enter a number.';
    feedback.className   = 'feedback incorrect';
    return;
  }

  answered = true;
  btnCheck.disabled = true;

  // compare with small epsilon for floats (answers here are always integers)
  const correct = Math.abs(value - currentProblem.answer) < 1e-9;

  if (correct) {
    answerInput.classList.add('correct');
    feedback.textContent = 'Correct!';
    feedback.className   = 'feedback correct';
  } else {
    answerInput.classList.add('incorrect');
    feedback.textContent = `Not quite. The answer is ${currentProblem.answer}.`;
    feedback.className   = 'feedback incorrect';
  }
}

// ─── step-by-step ─────────────────────────────────────────────────────────────
function toggleSteps() {
  if (stepsBox.style.display === 'none') {
    renderSteps();
    stepsBox.style.display = 'block';
    btnSteps.textContent   = 'Hide solution';
  } else {
    stepsBox.style.display = 'none';
    btnSteps.textContent   = 'Show step-by-step solution';
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
btnNext.addEventListener('click',  loadNewProblem);
btnSteps.addEventListener('click', toggleSteps);

// Allow Enter key to check answer
answerInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    if (!answered) checkAnswer();
    else loadNewProblem();
  }
});

// ─── init ─────────────────────────────────────────────────────────────────────
goHome();
