/* The Guided Tour's steps (canonical phase ids). Chapter 1 Ask and understand, chapter 2 Make the workspace yours,
   chapter 3 Plan before building — which carries more than half of the learner's actions. Every action step has a real
   target, a success predicate that reads the real result, and a Show Me that goes through the same control. */
(function () {
  'use strict';
  const O55 = window.O55, U = O55.util, T = (k, v) => O55.t(k, v), M = O55.motion, TR = O55.tour, C = TR.chat, P = TR.practice;
  const S = (d) => TR.define(d);
  const api = () => window.PM_HOME_WORKSPACE;
  const chatSurface = () => api() && api().layout.surfaces.find((s) => s.surface_kind === 'chat');
  const page = () => ((document.querySelector('.page-tab.active[data-page]') || {}).getAttribute ? document.querySelector('.page-tab.active[data-page]').getAttribute('data-page') : '');
  const goPage = (p) => { if (page() !== p) { const t = TR.q(`.page-tab[data-page="${p}"]`); if (t) t.click(); } };
  const q = TR.q;

  /* ================================================================ chapter 1: Ask and understand */
  S({ id: 'comfort_intro', chapter: 'ask', kind: 'info', place: 'center',
    extra: (st) => `<p class="o55t-tips">${O55.c.small('spark', 13)}<span>${U.esc(T('tour.steps.comfort_intro.' + (st.tips === 'eli5' ? 'tipsEli5' : 'tips')))}</span></p>`,
    nextLabel: () => T('tour.controls.start') });

  S({ id: 'open_chat', chapter: 'ask', kind: 'action', planning: false,
    /* the tour tucks Chat away (it comes back with the layout restore) so opening it is a real action */
    enter() { goPage('dashboard'); const s = chatSurface(); if (s && s.visible) api().setSurfaceVisible('chat', false, 'cmd.panel.switch'); },
    target: () => q('#activityBar .icon[data-ab-id="chat"]'),
    done: () => C.chatVisible(),
    showMe: async (sm) => { await sm.click(q('#activityBar .icon[data-ab-id="chat"]')); },
    goTo: () => goPage('dashboard') });

  S({ id: 'select_teacher', chapter: 'ask', kind: 'action',
    async enter() { if (!C.chatVisible()) api().setSurfaceVisible('chat', true, 'cmd.panel.switch'); await C.ensureThread(); },
    target: () => C.personaItem('Teacher') || C.personaBtn(),
    done: () => C.persona() === 'Teacher',
    showMe: async (sm) => { if (!C.personaItem('Teacher')) { await sm.click(C.personaBtn()); await sm.wait(320); } await sm.click(C.personaItem('Teacher')); },
    goTo: () => { goPage('dashboard'); api().setSurfaceVisible('chat', true, 'cmd.panel.switch'); } });

  /* the suggested prompt lives in the callout: it fills the real composer, and the learner sends it with the real Send */
  function fill(text) { const t = C.composer(); if (!t) return false; t.focus(); t.value = text; t.dispatchEvent(new Event('input', { bubbles: true })); O55.sound.play('select'); return true; }
  const filled = () => { const t = C.composer(); return !!t && t.value.trim() === T('tour.teacher.q1'); };
  S({ id: 'send_question', chapter: 'ask', kind: 'action', pad: 10,
    enter() { if (!C.chatVisible()) api().setSurfaceVisible('chat', true, 'cmd.panel.switch'); },
    target: () => (filled() ? C.sendBtn() : C.composer()),
    extra: () => `<div class="o55t-inline">${TR.btn('fillQuestion', T('tour.teacher.q1'), 'secondary o55t-prompt')}</div>`,
    actions: { fillQuestion: () => { fill(T('tour.teacher.q1')); TR.refresh(); } },
    done: () => C.sent.some((x) => x.trim() === T('tour.teacher.q1')),
    showMe: async (sm) => { await sm.click(document.querySelector('#pm-o55-tour [data-o55t="fillQuestion"]')); await sm.wait(300); await sm.click(C.sendBtn()); } });

  S({ id: 'answer_stream', chapter: 'ask', kind: 'info', pad: 6,
    target: () => C.lastAnswerEl(),
    ready: () => C.answered('a1') });

  S({ id: 'same_answer_eli5', chapter: 'ask', kind: 'action', after: true,
    /* the real ELI5 toggle; when it turns on, the same bubble is rewritten (and back if it turns off) */
    tick(st) { const on = !!q('span.chat-toggle-btn.toggle-eli5.active'); if (on !== st.eli5Shown) { st.eli5Shown = on; if (C.lastAnswerEl()) C.rewrite(on); } },
    enter(st) { st.eli5Shown = !!q('span.chat-toggle-btn.toggle-eli5.active'); },
    target: () => (TR.st.sess.done.includes('same_answer_eli5') ? C.lastAnswerEl() : C.eli5Btn()),
    done: (st) => st.eli5Shown && C.eli5Shown(),
    extra: (st) => (st.sess.done.includes('same_answer_eli5') ? `<div class="o55t-inline">${TR.btn('askProject', T('tour.steps.same_answer_eli5.ask'), 'secondary')}</div>` : ''),
    actions: { askProject: async () => { const t = C.composer(); if (!t) return; t.focus(); t.value = T('tour.teacher.q2'); t.dispatchEvent(new Event('input', { bubbles: true })); await M.delay(120); const b = C.sendBtn(); if (b) b.click(); } },
    stay: true,
    showMe: async (sm) => { await sm.click(C.eli5Btn()); } });

  /* ================================================================ chapter 2: Make the workspace yours */
  const ORIENT = [() => q('.page-tabs'), () => document.getElementById('pm-home-workspace'), () => document.getElementById('chatPanel')];
  S({ id: 'workspace_orientation', chapter: 'workspace', kind: 'info',
    enter(st) { goPage('dashboard'); st.orient = 0; st.orientAt = performance.now(); st.orientLoops = 0; },
    tick(st) { if (performance.now() - st.orientAt > 1700) { st.orient = (st.orient + 1) % ORIENT.length; st.orientAt = performance.now(); if (st.orient === 0) st.orientLoops++; O55.sound.play('spot'); } },
    target: (st) => ORIENT[st.orient || 0](),
    avoid: () => [ORIENT[0](), ORIENT[2]()],
    ready: (st) => st.orientLoops > 0 || st.orient === ORIENT.length - 1 });

  /* the left dock's entry band: 28 px inside the workspace's left edge (the engine's frozen dock latch) */
  function leftBand() { const ws = document.getElementById('pm-home-workspace'); if (!ws) return null; const r = ws.getBoundingClientRect(); return { x: r.left, y: r.top, w: 28, h: r.height }; }
  function showZone(on) {
    const z = document.querySelector('#pm-o55-tour .o55t-zone'); if (!z) return;
    const b = leftBand(); if (!on || !b) { z.classList.remove('o55t-on'); return; }
    z.style.transform = `translate(${b.x}px, ${b.y}px)`; z.style.width = b.w + 'px'; z.style.height = b.h + 'px'; z.classList.add('o55t-on');
  }
  S({ id: 'move_or_dock_chat', chapter: 'workspace', kind: 'action', after: true,
    enter() { goPage('dashboard'); if (!C.chatVisible()) api().setSurfaceVisible('chat', true, 'cmd.panel.switch'); },
    tick() { showZone(!TR.st.sess.done.includes('move_or_dock_chat')); },
    leave: () => showZone(false),
    target: () => q('[data-pm-home-handle="chat"]'),
    done: () => { const s = chatSurface(); return !!(s && s.host === 'dock_left' && s.visible); },
    showMe: async (sm) => { const b = leftBand(); await sm.drag(q('[data-pm-home-handle="chat"]'), { x: b.x + 12, y: b.y + b.h * 0.45 }); },
    goTo: () => goPage('dashboard') });

  const aqItem = () => [...document.querySelectorAll('.pm6-dash-catalog-item')].find((x) => TR.vis(x) && /approval queue/i.test(x.textContent)) || null;
  const aqWidget = () => [...document.querySelectorAll('[data-widget-id], .pm6-dash-widget')].find((w) => TR.vis(w) && /approval queue/i.test(w.textContent)) || null;
  S({ id: 'widget_action', chapter: 'workspace', kind: 'action', after: true,
    enter() { goPage('dashboard'); },
    target: () => (TR.st.sess.done.includes('widget_action') ? aqWidget() : aqItem() || q('#pm6DashAddBtn')),
    done: () => !!aqWidget(),
    showMe: async (sm) => { if (!aqItem()) { await sm.click(q('#pm6DashAddBtn')); await sm.wait(420); } await sm.click(aqItem()); },
    goTo: () => goPage('dashboard') });

  /* ================================================================ chapter 3: Plan before building */
  S({ id: 'open_planning', chapter: 'plan', kind: 'action', planning: true,
    target: () => q('#tab-wizard'),
    done: () => page() === 'wizard',
    showMe: async (sm) => { await sm.click(q('#tab-wizard')); } });

  S({ id: 'book_club_goal', chapter: 'plan', kind: 'action', planning: true, place: 'right',
    enter() { goPage('wizard'); P.injectGoal(); },
    target: () => q('#o55pGoal'),
    done: () => P.active,
    showMe: async (sm) => { await sm.click(q('#o55pGoal .o55p-use')); },
    goTo: () => { goPage('wizard'); P.injectGoal(); } });

  S({ id: 'three_outcomes', chapter: 'plan', kind: 'action', planning: true,
    target: () => document.getElementById('pm6WizTopicList'),
    done: () => !!P.outcome,
    showMe: async (sm) => { await sm.click(q('.o55p-outcome[data-arg="o1"]')); },
    goTo: () => goPage('wizard') });

  S({ id: 'access_answer', chapter: 'plan', kind: 'action', planning: true,
    target: () => q('#pm6WizThread .o55p-bubble'),
    done: () => !!P.answer,
    showMe: async (sm) => { await sm.click(q('[data-o55p="why"]')); await sm.wait(900); await sm.click(q('[data-o55p="answer"][data-arg="few"]')); },
    goTo: () => goPage('wizard') });

  S({ id: 'review', chapter: 'plan', kind: 'action', planning: true, after: true,
    target: () => (P.reviewed ? document.getElementById('pm6WizDoc') : q('[data-o55p="review"]')),
    done: () => P.reviewed,
    showMe: async (sm) => { await sm.click(q('[data-o55p="review"]')); },
    goTo: () => goPage('wizard') });

  S({ id: 'answer_edit', chapter: 'plan', kind: 'action', planning: true,
    target: () => (P.edited ? document.getElementById('pm6WizDoc') : q('#pm6WizThread .o55p-bubble') || q('[data-o55p="change"]')),
    done: () => P.edited,
    showMe: async (sm) => {
      if (!q('#pm6WizThread .o55p-bubble')) { await sm.click(q('[data-o55p="change"]')); await sm.wait(400); }
      await sm.click(q(`[data-o55p="answer"][data-arg="${P.answer === 'few' ? 'me' : 'few'}"]`));
    },
    goTo: () => goPage('wizard') });

  /* the spotlight narrows to the decisions the answer touched, and the new rows glow once more */
  S({ id: 'consequence_changed', chapter: 'plan', kind: 'info', planning: true,
    enter() { M.after(420, () => (P.changed || []).forEach((k) => { const r = q(`#pm6WizDoc [data-key="r-${k}"]`); if (r) { r.classList.remove('o55p-pulse'); void r.offsetWidth; r.classList.add('o55p-pulse'); } })); },
    leave() { document.querySelectorAll('#pm6WizDoc .o55p-pulse').forEach((r) => r.classList.remove('o55p-pulse')); },
    target: () => q('#pm6WizDoc [data-key="s-dec"]') || document.getElementById('pm6WizDoc'),
    goTo: () => goPage('wizard') });

  S({ id: 'completion_boundary', chapter: 'plan', kind: 'info', planning: true, place: 'left',
    target: () => q('.o55p-fence'),
    render(st, h) {
      return `<p class="o55t-kicker">${U.esc(T('tour.chapters.plan'))}</p><h2 class="o55t-title" id="o55t-h" tabindex="-1">${U.esc(h.copy('completion_boundary', 'title'))}</h2>`
        + `<p class="o55t-body">${U.esc(h.copy('completion_boundary', 'do'))}</p>`
        + `<div class="o55t-finish" role="group" aria-label="${U.esc(T('tour.finish.title'))}">`
        + `<button type="button" class="o55t-choice o55t-on" data-o55t="finish" data-arg="restore" data-pm-hover-exempt="true"><strong>${U.esc(T('tour.finish.restore'))}</strong><span>${U.esc(T('tour.finish.restoreSub'))}</span></button>`
        + `<button type="button" class="o55t-choice" data-o55t="finish" data-arg="keep" data-pm-hover-exempt="true"><strong>${U.esc(T('tour.finish.keep'))}</strong><span>${U.esc(T('tour.finish.keepSub'))}</span></button></div>`
        + `<div class="o55t-actions">${h.btn('back', T('tour.controls.back'), 'ghost')}</div>`;
    } });

  /* landing: a short note on the real Planning Wizard once the tour has gone */
  TR.landing = function landing() {
    const host = document.querySelector('#pm6WizStageIntake .pm6-wiz-intake-scroll'); if (!host) return;
    let note = document.getElementById('o55tLanding');
    if (!note) { note = document.createElement('div'); note.id = 'o55tLanding'; note.className = 'o55t-landing'; note.setAttribute('role', 'status'); const hero = host.querySelector('.pm6-wiz-hero'); host.insertBefore(note, hero ? hero.nextSibling : host.firstChild); }
    note.innerHTML = `${O55.c.small('seed', 16)}<span>${U.esc(T('tour.landing'))}</span>`;
    M.after(9000, () => { if (note.isConnected) note.classList.add('o55t-leaving'); M.after(500, () => note.remove()); });
  };
  /* measured on the reference run: about four minutes at a reading pace, Show Me used twice */
  TR.minutes = () => 4;
})();
