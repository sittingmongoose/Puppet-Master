/* O55.tour.practice — the Planning Wizard practice run, a scoped "Guided example" inside the real Wizard page. It uses
   the Wizard's own stage and regions (topic map, interview thread, live plan preview, readiness rail) and its own
   component classes, saves what those regions held, and puts them back when the tour ends. The Wizard's planning state
   is never touched, and Approve And Build is shown fenced, never pressed. */
(function () {
  'use strict';
  const O55 = window.O55, U = O55.util, T = (k, v) => O55.t(k, v), M = O55.motion, TR = O55.tour;
  const P = TR.practice = { active: false, outcome: null, answer: null, prev: null, why: false, reviewed: false, edited: false, saved: null, goalShown: false };
  const W = (k, v) => T('tour.wizard.' + k, v);
  const byId = (id) => document.getElementById(id);
  const REGIONS = ['pm6WizTopicList', 'pm6WizThread', 'pm6WizDoc', 'pm6WizRail', 'pm6WizRunState', 'pm6WizTopicCount', 'pm6WizDocTitle', 'pm6WizDocMeta', 'pm6WizIntegrateDock'];
  const icon = (name) => (window.PM_ICONS && window.PM_ICONS[name] ? `<span class="pm6-ico" aria-hidden="true">${window.PM_ICONS[name]}</span>` : '');

  /* ---------------------------------------------------------------- the practice goal card on the real intake */
  P.injectGoal = function injectGoal() {
    const scroll = document.querySelector('#pm6WizStageIntake .pm6-wiz-intake-scroll'); if (!scroll) return null;
    let card = byId('o55pGoal');
    if (!card) {
      card = document.createElement('div'); card.id = 'o55pGoal'; card.className = 'o55p-goal'; card.setAttribute('data-pm-hover-exempt', 'true');
      card.innerHTML = `<span class="o55p-badge">${U.esc(T('tour.steps.book_club_goal.kicker'))}</span><p class="o55p-goaltext">“${U.esc(T('tour.steps.book_club_goal.goal'))}”</p>`
        + `<button type="button" class="pm6-wiz-bigbtn o55p-use" data-o55p="useGoal" data-pm-hover-exempt="true">${U.esc(T('tour.steps.book_club_goal.use'))} <span class="pm6-wiz-glyph">→</span></button>`;
      const hero = scroll.querySelector('.pm6-wiz-hero');
      scroll.insertBefore(card, hero ? hero.nextSibling : scroll.firstChild);
    }
    P.goalShown = true;
    return card;
  };

  /* ---------------------------------------------------------------- start / remove */
  function activeStage() { const s = document.querySelector('#panel-wizard .pm6-wiz-stage.active'); return s ? s.getAttribute('data-wiz-stage') : 'intake'; }
  function setStage(name) { document.querySelectorAll('#panel-wizard .pm6-wiz-stage').forEach((s) => s.classList.toggle('active', s.getAttribute('data-wiz-stage') === name)); }
  P.start = function start() {
    if (P.active) return;
    const saved = { stage: activeStage(), regions: {}, title: (document.querySelector('#pm6WizRunHead .pm6-wiz-runhead-title') || {}).textContent };
    REGIONS.forEach((id) => { const el = byId(id); if (el) saved.regions[id] = el.innerHTML; });
    P.saved = saved; P.active = true; P.outcome = null; P.answer = null; P.why = false; P.reviewed = false; P.edited = false;
    byId('panel-wizard').classList.add('o55p-practice');
    setStage('workspace');
    const title = document.querySelector('#pm6WizRunHead .pm6-wiz-runhead-title'); if (title) title.innerHTML = `${U.esc(W('title'))} <span class="o55p-badge">${U.esc(W('badge'))}</span>`;
    render(true);
    O55.sound.play('success');
  };
  P.remove = function remove() {
    const card = byId('o55pGoal'); if (card) card.remove();
    P.goalShown = false;
    if (!P.active || !P.saved) { P.active = false; return; }
    REGIONS.forEach((id) => { const el = byId(id); if (el && P.saved.regions[id] != null) el.innerHTML = P.saved.regions[id]; });
    const title = document.querySelector('#pm6WizRunHead .pm6-wiz-runhead-title'); if (title && P.saved.title != null) title.textContent = P.saved.title;
    setStage(P.saved.stage || 'intake');
    const pw = byId('panel-wizard'); if (pw) pw.classList.remove('o55p-practice');
    P.active = false; P.saved = null;
  };

  /* Back in the tour: the practice as a step began (mark), and back to it (rewind). Before the goal was used there is
     no practice at all; after, the choices go back to what they were and the plan redraws from them. */
  const FIELDS = ['outcome', 'answer', 'prev', 'why', 'reviewed', 'edited', 'changing'];
  P.mark = () => { const m = { active: P.active }; FIELDS.forEach((k) => { m[k] = P[k] == null ? null : P[k]; }); return m; };
  P.rewind = function rewind(m) {
    if (!m) return;
    if (!m.active) { if (P.active || P.goalShown) P.remove(); return; }
    if (!P.active) return;
    FIELDS.forEach((k) => { P[k] = m[k]; }); P.fresh = []; P.changed = [];
    render(false);
  };
  /* a new run of the tour starts without the last run's practice */
  P.reset = () => { P.remove(); FIELDS.forEach((k) => { P[k] = null; }); P.why = false; P.reviewed = false; P.edited = false; P.changing = false; P.fresh = []; P.changed = []; };

  /* ---------------------------------------------------------------- rendering into the Wizard's regions */
  const OUT = ['o1', 'o2', 'o3'];
  function topicsHtml() {
    return OUT.map((id, i) => {
      const open = P.outcome === id, answered = !!P.answer;
      const state = answered ? 'ready' : open ? 'active' : 'not_started';
      return `<button type="button" class="pm6-wiz-topic-card pm-sheen${open ? ' open' : ''} o55p-outcome" data-tstate="${state}" style="--i:${i}" data-o55p="open" data-arg="${id}" data-key="t-${id}" data-pm-hover-exempt="true">`
        + `<span class="pm6-wiz-topic-toprow">${icon('clipboard')}<span class="pm6-wiz-topic-name">${i + 1} · ${U.esc(W('outcomes.' + id + '.title'))}</span>`
        + `<span class="pm6-wiz-schip" data-state="${state}"><span class="pm6-wiz-sdot"></span>${U.esc(answered ? 'Ready' : open ? 'Open' : 'Not started')}</span></span>`
        + `<span class="pm6-wiz-topic-sub">${U.esc(W('outcomes.' + id + '.sub'))}</span>`
        + `<span class="pm6-wiz-topic-prog"><span class="pm6-wiz-topic-prog-fill" style="width:${answered ? 100 : open ? 40 : 8}%"></span></span></button>`;
    }).join('');
  }
  function threadHtml() {
    const head = `<div class="pm6-wiz-thread-head">${icon('clipboard')}<div class="pm6-wiz-thread-title">${U.esc(P.reviewed ? T('tour.steps.review.button') : P.outcome ? W('outcomes.' + P.outcome + '.title') : W('topics'))}</div></div>`;
    if (!P.outcome) return head + `<div class="pm6-wiz-thread-body"><div class="pm6-wiz-thread-note">${U.esc(T('tour.steps.three_outcomes.title'))}</div></div>`;
    if (P.reviewed && !P.changing) {
      return head + `<div class="pm6-wiz-thread-body o55p-review" data-key="rev"><div class="pm6-wiz-thread-note">${U.esc(T('tour.steps.review.after'))}</div>`
        + answerRow() + `<div class="pm6-wiz-thread-actions"><button type="button" class="pm6-wiz-btn" data-o55p="change" data-pm-hover-exempt="true">${U.esc(W('change'))}</button></div></div>`;
    }
    let body = `<div class="o55p-bubble" data-key="q"><span class="o55p-who">${U.esc(W('badge'))}</span><p>${U.esc(W('question'))}</p>`
      + `<div class="o55p-opts" role="radiogroup" aria-label="${U.esc(W('question'))}">`
      + ['me', 'few', 'unsure'].map((v) => `<button type="button" class="pm6-wiz-opt${P.answer === v ? ' sel' : ''}" role="radio" aria-checked="${P.answer === v}" data-o55p="answer" data-arg="${v}" data-pm-hover-exempt="true">${U.esc(W('choices.' + v))}</button>`).join('') + '</div>'
      + `<button type="button" class="o55p-why" data-o55p="why" aria-expanded="${P.why}" data-pm-hover-exempt="true">${U.esc(W('why'))}</button>`
      + (P.why ? `<p class="o55p-whytext">${U.esc(W('whyText'))}</p>` : '') + '</div>';
    if (P.answer && !P.changing) body += answerRow() + `<div class="pm6-wiz-thread-actions"><button type="button" class="pm6-wiz-btn primary" data-o55p="review" data-pm-hover-exempt="true">${U.esc(T('tour.steps.review.button'))} <span class="pm6-wiz-glyph">→</span></button></div>`;
    return head + `<div class="pm6-wiz-thread-body">${body}</div>`;
  }
  function answerRow() {
    return `<div class="pm6-wiz-ans" data-key="ans"><span class="pm6-wiz-ans-check">${O55.c.small('check', 12)}</span><div><div class="pm6-wiz-ans-q">${U.esc(W('question'))}</div><div class="pm6-wiz-ans-a">${U.esc(W('choices.' + P.answer))}</div><div class="pm6-wiz-ans-src">${U.esc(W('badge'))}</div></div></div>`;
  }
  /* The live plan: keyed rows so a changed answer moves only what it affects */
  function planRows() {
    const dec = P.answer === 'few' ? [['sig', W('doc.signin')], ['acc', W('doc.access')]] : P.answer === 'me' ? [['one', W('doc.single')]] : [];
    const open = P.answer === 'unsure' ? [['unsure', W('doc.unsureRow')]] : [];
    return { dec, open };
  }
  function docHtml(gone) {
    const { dec, open } = planRows();
    const row = (k, text, cls) => `<div class="pm6-wiz-doc-decision o55p-row${cls ? ' ' + cls : ''}" data-key="r-${k}"><span class="pm6-wiz-glyph">${cls && cls.includes('gone') ? '−' : O55.c.small('check', 12)}</span><span>${U.esc(text)}</span></div>`;
    const decRows = dec.map(([k, t]) => row(k, t, P.fresh && P.fresh.includes(k) ? 'o55p-fresh' : '')).concat((gone || []).filter((g) => g.sec === 'dec').map((g) => row(g.k, g.t, 'o55p-gone')));
    const openRows = open.map(([k, t]) => row(k, t, P.fresh && P.fresh.includes(k) ? 'o55p-fresh o55p-open' : 'o55p-open')).concat((gone || []).filter((g) => g.sec === 'open').map((g) => row(g.k, g.t, 'o55p-gone')));
    return `<div class="pm6-wiz-doc-h" data-key="h">${U.esc(W('title'))} — ${U.esc(W('badge'))}</div>`
      + `<div class="pm6-wiz-doc-sec" data-key="s-out"><div class="pm6-wiz-doc-sec-h">${U.esc(W('doc.outcomes'))}</div>${OUT.map((id) => `<div class="pm6-wiz-doc-para" data-key="o-${id}">${U.esc(W('outcomes.' + id + '.title'))}</div>`).join('')}</div>`
      + `<div class="pm6-wiz-doc-sec" data-key="s-dec"><div class="pm6-wiz-doc-sec-h">${U.esc(W('doc.decisions'))}</div>${decRows.join('') || `<div class="pm6-wiz-doc-sec-p" data-key="dec-none"><em>—</em></div>`}</div>`
      + `<div class="pm6-wiz-doc-sec" data-key="s-as"><div class="pm6-wiz-doc-sec-h">${U.esc(W('doc.assumptions'))}</div><div class="pm6-wiz-doc-para" data-key="a1">${U.esc(W('doc.assume1'))}</div><div class="pm6-wiz-doc-para" data-key="a2">${U.esc(W('doc.assume2'))}</div></div>`
      + `<div class="pm6-wiz-doc-sec" data-key="s-open"><div class="pm6-wiz-doc-sec-h">${U.esc(W('doc.unresolved'))}</div>${openRows.join('') || `<div class="pm6-wiz-doc-sec-p" data-key="open-none"><em>${U.esc(W('doc.none'))}</em></div>`}</div>`
      + `<div class="pm6-wiz-doc-sec o55p-boundary" data-key="s-b"><div class="pm6-wiz-doc-sec-p"><strong>${U.esc(W('doc.boundary'))}</strong></div></div>`;
  }
  function railHtml() {
    const g = (done, label) => `<div class="pm6-wiz-gate${done ? ' done' : ''}"><span class="pm6-wiz-gate-mark">${done ? O55.c.small('check', 11) : ''}</span><span>${U.esc(label)}</span></div>`;
    return `<div class="pm6-wiz-rail-title">${U.esc(W('rail.title'))}</div>` + g(true, W('rail.g1')) + g(!!P.answer && P.answer !== 'unsure', W('rail.g2')) + g(!!P.answer && P.answer !== 'unsure', W('rail.g3'))
      + `<div class="o55p-fence" data-key="fence"><button type="button" class="pm6-wiz-approve o55p-approve" aria-disabled="true" data-pm-hover-exempt="true" tabindex="-1">${icon('rocket')}Approve And Build</button><span class="o55p-fencenote">${O55.c.small('lock', 13)}${U.esc(W('rail.fence'))}</span></div>`;
  }
  function render(first, gone) {
    if (!P.active) return;
    const set = (id, html) => { const el = byId(id); if (el) { if (first) el.innerHTML = html; else U.morph(el, html); } };
    set('pm6WizTopicList', topicsHtml()); set('pm6WizThread', threadHtml()); set('pm6WizDoc', docHtml(gone)); set('pm6WizRail', railHtml());
    set('pm6WizRunState', `<span class="pm6-wiz-statepill">${U.esc(W('state'))}</span>`);
    const cnt = byId('pm6WizTopicCount'); if (cnt) cnt.textContent = W('count', { n: 3 });
    const dt = byId('pm6WizDocTitle'); if (dt) dt.textContent = W('doc.title');
    const dm = byId('pm6WizDocMeta'); if (dm) dm.textContent = W('badge');
    const dock = byId('pm6WizIntegrateDock'); if (dock) dock.innerHTML = '';
  }
  P.render = () => render(false);

  /* ---------------------------------------------------------------- the learner's actions (real clicks) */
  function answer(v) {
    const before = planRows(), prev = P.answer;
    if (prev === v) return;
    if (prev && P.reviewed) { P.edited = true; P.prev = prev; }
    P.answer = v; P.changing = false;
    const after = planRows();
    const key = (r) => r[0];
    const gone = before.dec.filter((r) => !after.dec.some((x) => key(x) === key(r))).map(([k, t]) => ({ sec: 'dec', k, t }))
      .concat(before.open.filter((r) => !after.open.some((x) => key(x) === key(r))).map(([k, t]) => ({ sec: 'open', k, t })));
    P.fresh = after.dec.concat(after.open).filter((r) => !before.dec.concat(before.open).some((x) => key(x) === key(r))).map(key);
    P.changed = P.fresh.concat(gone.map((g) => g.k));
    /* evidence that only the affected rows changed: every other keyed node is the same node, and the outcomes
       did not move */
    const doc = byId('pm6WizDoc'), nodes = doc ? [...doc.querySelectorAll('[data-key]')] : [];
    const tops = OUT.map((id) => { const el = doc && doc.querySelector(`[data-key="o-${id}"]`); return el ? Math.round(el.getBoundingClientRect().top) : null; });
    render(false, gone);
    P.lastChange = { from: prev, to: v, fresh: P.fresh.slice(), gone: gone.map((g) => g.k).sort(),
      replaced: nodes.filter((n) => !n.isConnected).length, kept: nodes.length,
      outcomesMoved: OUT.some((id, i) => { const el = doc && doc.querySelector(`[data-key="o-${id}"]`); return !el || Math.round(el.getBoundingClientRect().top) !== tops[i]; }) };
    O55.sound.play('select');
    /* removed rows fold away, then leave the document; unaffected rows never moved */
    M.after(620, () => { if (P.active) { P.fresh = []; render(false); } });
  }
  document.addEventListener('click', (e) => {
    const b = e.target.closest && e.target.closest('[data-o55p]'); if (!b) return;
    const a = b.getAttribute('data-o55p'), arg = b.getAttribute('data-arg');
    e.preventDefault();
    if (a === 'useGoal') { P.start(); return; }
    if (!P.active) return;
    if (a === 'open') { P.outcome = arg; P.changing = false; O55.sound.play('select'); render(false); return; }
    if (a === 'answer') { answer(arg); return; }
    if (a === 'why') { P.why = !P.why; O55.sound.play('tap'); render(false); return; }
    if (a === 'review') { P.reviewed = true; O55.sound.play('next'); render(false); return; }
    if (a === 'change') { P.changing = true; O55.sound.play('tap'); render(false); }
  }, true);
})();
