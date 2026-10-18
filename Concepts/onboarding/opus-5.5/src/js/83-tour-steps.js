/* The Guided Tour's steps (canonical phase ids). Chapter 1 Ask and understand, chapter 2 Make the workspace yours (the
   Home panels, D25), chapter 3 Plan before building, which carries the most of the learner's actions. Every action step
   has a real target, a success predicate that reads the real result, and a Show Me that goes through the same control. */
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
    /* Explain this reply simply (cmd.chat.eli5.explain_reply, DL-126) adds one simpler reply under the example answer,
       which stays as it was. Then the spotlight moves to the quick ELI5 switch by the message box (cmd.chat.eli5.set),
       which changes only the replies written after it; Ask sends the next question to show that. */
    target: (st) => (st.sess.done.includes('same_answer_eli5') ? C.eli5Btn() : C.explainBtn(C.midFor('a1'))),
    /* the callout keeps one place clear of Chat, so it never covers the answer or the simpler reply being read */
    avoid: () => [document.getElementById('chatPanel')],
    done: () => C.explainedSame('a1'),
    extra: (st) => (st.sess.done.includes('same_answer_eli5') ? `<div class="o55t-inline">${TR.btn('askProject', T('tour.steps.same_answer_eli5.ask'), 'secondary')}</div>` : ''),
    actions: { askProject: async () => { const t = C.composer(); if (!t) return; t.focus(); t.value = T('tour.teacher.q2'); t.dispatchEvent(new Event('input', { bubbles: true })); await M.delay(120); const b = C.sendBtn(); if (b) b.click(); } },
    stay: true,
    showMe: async (sm) => { await sm.click(C.explainBtn(C.midFor('a1'))); } });

  /* ================================================================ chapter 2: Make the workspace yours */
  /* The workspace is the Home panels (Concepts/home-redesign, D25): pages on top, panels in the middle, Chat on the right
     (it moves only by popping out, D3). The steps teach + (open_from_plus), opening a file into a panel
     (open_file_from_rail), splitting by dragging a tab to a panel edge (split_by_drag) and adding a widget to the Home
     dashboard (widget_action, D10 round two P10), each finished by what the panels report, never by a timer. What only
     the panels know (their buttons, menus, tabs, receipts, Back snapshots and dashboard boards) comes from their tour
     hooks, PMW.tour (home-redesign src/panels/js/52-tour.js), looked up as a step runs: the panels boot after this
     script. */
  const panels = document.documentElement.getAttribute('data-pmw-home') === 'on';
  const hk = (name, ...a) => { const h = window.PMW && window.PMW.tour; return h && typeof h[name] === 'function' ? h[name](...a) : null; };
  const stepDone = (id) => !!(TR.st.sess && TR.st.sess.done.includes(id));
  const ORIENT = [() => q('.page-tabs'), () => document.getElementById('pm-home-centre') || document.getElementById('pm-home-workspace'), () => document.getElementById('chatPanel')];
  S({ id: 'workspace_orientation', chapter: 'workspace', kind: 'info',
    enter(st) { goPage('dashboard'); st.orient = 0; st.orientAt = performance.now(); st.orientLoops = 0; },
    tick(st) { if (performance.now() - st.orientAt > 1700) { st.orient = (st.orient + 1) % ORIENT.length; st.orientAt = performance.now(); if (st.orient === 0) st.orientLoops++; O55.sound.play('move', { step: st.orient }); } },
    target: (st) => ORIENT[st.orient || 0](),
    avoid: () => [ORIENT[0](), ORIENT[2]()],
    ready: (st) => st.orientLoops > 0 || st.orient === ORIENT.length - 1 });

  if (panels) {
    /* two moves: open the + menu, then pick a row; the spotlight follows the menu while it is open */
    S({ id: 'open_from_plus', chapter: 'workspace', kind: 'action', after: true,
      enter(st, o) { hk('entry', 'open_from_plus', o); goPage('dashboard'); hk('watchPlus'); st.plusPhase = null; },
      leave(st) { st.plusPhase = null; },
      tick(st) { const ph = hk('plusMenu') ? 'pick' : 'do'; if (st.plusPhase !== ph) { const first = st.plusPhase == null; st.plusPhase = ph; if (!first) { st.side = null; st.fixed = null; TR.refresh(); } } },
      doKey: (st) => (st.plusPhase === 'pick' ? 'pick' : 'do'),
      target: () => hk('plusMenu') || hk('plusButton'),
      done: () => !!hk('plusDone'),
      showMe: async (sm) => { if (!hk('plusMenu')) { await sm.click(hk('plusButton')); await sm.wait(380); } const row = hk('plusRow'); if (row) await sm.click(row); },
      goTo: () => goPage('dashboard') });

    /* one click opens a preview tab, a double click keeps it; done once an editor tab is created */
    S({ id: 'open_file_from_rail', chapter: 'workspace', kind: 'action', after: true,
      async enter(st, o) { hk('entry', 'open_file_from_rail', o); goPage('dashboard'); await hk('watchFile', o); },
      target: () => hk('fileRow'),
      done: () => !!hk('fileDone'),
      showMe: async (sm) => { hk('showFiles'); await sm.click(hk('fileRow')); },
      goTo: () => { goPage('dashboard'); hk('showFiles'); } });

    /* While a tab is carried the callout and the bar hold still and step back, as for any drag in the tour (this file
       and the core read body.pm-home-dragging); the class is set here only while this step carries. */
    let held = false;
    const hold = (on) => { if (on === held) return; held = on; document.body.classList.toggle('pm-home-dragging', on); };
    /* the copy names the edge that fits (Split right, else Split down); done once a split is applied and a panel added */
    S({ id: 'split_by_drag', chapter: 'workspace', kind: 'action', after: true, pad: 6,
      enter(st, o) { hk('entry', 'split_by_drag', o); goPage('dashboard'); st.splitEdge = hk('watchSplit'); },
      tick(st) {
        hold(!!hk('carrying'));
        if (held || stepDone('split_by_drag')) return;
        const e = hk('splitEdge'); if (e && e !== st.splitEdge) { st.splitEdge = e; TR.refresh(); }
      },
      leave: () => hold(false),
      doKey: (st) => (st.splitEdge === 'bottom' ? 'doDown' : 'do'),
      /* the tab; while it is carried, the whole centre (every edge it can land on); once split, its new panel */
      target: () => hk('splitTarget', stepDone('split_by_drag')),
      done: () => !!hk('splitDone'),
      showMe: async (sm) => { const d = hk('splitDrag'); if (d) await sm.drag(d.el, d.to, { ready: d.ready }); },
      goTo: () => goPage('dashboard') });

    /* Upcoming resets on the Home dashboard board (hidden at the start when the board shows it): done once it is added
       and then moved or resized there */
    S({ id: 'widget_action', chapter: 'workspace', kind: 'action', after: true,
      async enter(st, o) { hk('entry', 'widget_action', o); goPage('dashboard'); st.wlog = (await hk('watchWidget')) || 0; },
      target: () => hk('widgetAddButton'),
      done: (st) => !!hk('widgetDone', st),
      showMe: async () => { await hk('widgetShowMe'); },
      goTo: () => { goPage('dashboard'); hk('showDashboard'); } });
  }

  /* Checkpoints across step orders (80-tour-core.js): the step order of the page before the Home panels, whose
     checkpoints name no step, and the chapter of each retired step (Chat moves only by popping out, D3). */
  TR.unstamped = ['comfort_intro', 'open_chat', 'select_teacher', 'send_question', 'answer_stream', 'same_answer_eli5',
    'workspace_orientation', 'move_or_dock_chat', 'widget_action', 'open_planning', 'book_club_goal', 'three_outcomes',
    'access_answer', 'review', 'review_parts', 'answer_edit', 'consequence_changed', 'completion_boundary'];
  TR.retired = { move_or_dock_chat: 'workspace' };

  /* ================================================================ chapter 3: Plan before building */
  /* its visible route: the page tab, or on a narrow window the pages menu (the strip folds pages into it) */
  const wizardTab = () => q('#tab-wizard'), wizardItem = () => q('#pageTabsMoreMenu .pm6-tb-pages-more-item[data-page="wizard"]');
  S({ id: 'open_planning', chapter: 'plan', kind: 'action', planning: true,
    target: () => wizardTab() || wizardItem() || q('#pageTabsMoreBtn'),
    doKey: () => (wizardTab() ? 'do' : 'doMore'),
    done: () => page() === 'wizard',
    showMe: async (sm) => {
      if (wizardTab()) { await sm.click(wizardTab()); return; }
      if (!wizardItem()) { await sm.click(q('#pageTabsMoreBtn')); await sm.wait(320); }
      await sm.click(wizardItem());
    } });

  /* On a phone-width window the shell lets Chat cover the whole Wizard page, so the planning chapter tucks Chat away
     through its real command and says so; it comes back when the tour ends (Restore or Keep). */
  const cramped = () => innerWidth < 600;
  S({ id: 'book_club_goal', chapter: 'plan', kind: 'action', planning: true, place: 'right',
    /* the practice goal grows into the page; the callout is placed once it has its final size, so it never jumps */
    async enter(st) {
      goPage('wizard'); P.injectGoal();
      const card = document.getElementById('o55pGoal'); if (card) await M.settled(card, { subtree: true, fallback: 900 });
      if (cramped() && C.chatVisible()) { api().setSurfaceVisible('chat', false, 'cmd.panel.switch'); st.sess.chatTucked = true; }
    },
    extra: (st) => (st.sess.chatTucked ? `<p class="o55t-tips">${O55.c.small('spark', 13)}<span>${U.esc(T('tour.steps.book_club_goal.tucked'))}</span></p>` : ''),
    target: () => q('#o55pGoal'),
    done: () => P.active,
    showMe: async (sm) => { await sm.click(q('#o55pGoal .o55p-use')); },
    goTo: () => { goPage('wizard'); P.injectGoal(); } });

  S({ id: 'three_outcomes', chapter: 'plan', kind: 'action', planning: true,
    target: () => document.getElementById('pm6WizTopicList'),
    done: () => !!P.outcome,
    showMe: async (sm) => { await sm.click(q('.o55p-outcome[data-arg="o1"]')); },
    goTo: () => goPage('wizard') });

  /* the thread-column steps keep their callout to the left, over the topic map, so the Live Plan stays in view:
     answering and editing change it, and the learner is asked to watch it */
  S({ id: 'access_answer', chapter: 'plan', kind: 'action', planning: true, place: 'left',
    target: () => q('#pm6WizThread .o55p-bubble'),
    done: () => !!P.answer,
    showMe: async (sm) => { await sm.click(q('[data-o55p="why"]')); await sm.wait(900); await sm.click(q('[data-o55p="answer"][data-arg="few"]')); },
    goTo: () => goPage('wizard') });

  S({ id: 'review', chapter: 'plan', kind: 'action', planning: true, after: true, place: (st) => (TR.st.sess.done.includes('review') ? 'auto' : 'left'),
    target: () => (P.reviewed ? document.getElementById('pm6WizDoc') : q('[data-o55p="review"]')),
    done: () => P.reviewed,
    showMe: async (sm) => { await sm.click(q('[data-o55p="review"]')); },
    goTo: () => goPage('wizard') });

  /* the review, read part by part: the spotlight settles on each part of the Live Plan with a one-line caption (on the
     tour's own clock, so Pause and Reduced Motion hold it), then opens onto the whole plan */
  const PARTS = ['s-out', 's-dec', 's-as', 's-open'];
  S({ id: 'review_parts', chapter: 'plan', kind: 'info', planning: true,
    enter(st) { st.part = 0; st.partTicks = 0; st.partsDone = false; },
    tick(st) {
      if (st.partsDone || ++st.partTicks < 19) return; /* about 2.7 s per part */
      st.partTicks = 0;
      if (st.part < PARTS.length - 1) st.part++; else st.partsDone = true;
      O55.sound.play('move', { step: st.part }); TR.refresh();
    },
    doKey: (st) => (st.partsDone ? 'do' : 'part' + ((st.part || 0) + 1)),
    target: (st) => (st.partsDone ? document.getElementById('pm6WizDoc') : q(`#pm6WizDoc [data-key="${PARTS[st.part || 0]}"]`) || document.getElementById('pm6WizDoc')),
    avoid: () => [document.getElementById('pm6WizDoc')],
    ready: (st) => !!st.partsDone,
    goTo: () => goPage('wizard') });

  S({ id: 'answer_edit', chapter: 'plan', kind: 'action', planning: true, place: 'left',
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
      return h.kicker(T('tour.chapters.plan')) + `<h2 class="o55t-title" id="o55t-h" tabindex="-1">${U.esc(h.copy('completion_boundary', 'title'))}</h2>`
        + `<p class="o55t-body">${U.esc(h.copy('completion_boundary', 'do'))}</p>`
        + `<div class="o55t-finish" role="group" aria-label="${U.esc(T('tour.finish.title'))}">`
        + `<button type="button" class="o55t-choice o55t-on" data-o55t="finish" data-arg="restore" data-pm-hover-exempt="true"><strong>${U.esc(T('tour.finish.restore'))}</strong><span>${U.esc(T('tour.finish.restoreSub'))}</span></button>`
        + `<button type="button" class="o55t-choice" data-o55t="finish" data-arg="keep" data-pm-hover-exempt="true"><strong>${U.esc(T('tour.finish.keep'))}</strong><span>${U.esc(T('tour.finish.keepSub'))}</span></button></div>`
        + h.actions(h.btn('back', T('tour.controls.back'), 'ghost'));
    } });

  /* landing: a short note on the real Planning Wizard once the tour has gone (a skin may hold it back until its own
     finish has folded away, so nothing lands on top of it, and may give it a lead word) */
  /* the note's exit: a skin's (a listener on 'unland' that returns a promise), else a fade; then it goes. A second
     landing while one shows takes the note over, and the first one's exit is cancelled. */
  let leaving = null;
  async function unland(note) {
    if (!note.isConnected) return;
    const out = TR.emit('unland', { note });
    if (out.length) await TR.settle(out, 900);
    else { note.classList.add('o55t-leaving'); await M.delay(500); }
    note.remove();
  }
  TR.landing = async function landing() {
    const deco = { lead: '' };
    await TR.settle(TR.emit('landing', deco), 7000);
    const host = document.querySelector('#pm6WizStageIntake .pm6-wiz-intake-scroll'); if (!host || TR.running) return;
    let note = document.getElementById('o55tLanding');
    if (leaving) { leaving.cancel(); leaving = null; }
    if (!note) { note = document.createElement('div'); note.id = 'o55tLanding'; note.className = 'o55t-landing'; note.setAttribute('role', 'status'); const hero = host.querySelector('.pm6-wiz-hero'); host.insertBefore(note, hero ? hero.nextSibling : host.firstChild); }
    note.classList.remove('o55t-leaving');
    note.innerHTML = `${O55.c.small('seed', 16)}<span>${deco.lead ? `<b class="o55t-landlead">${U.esc(deco.lead)}</b> ` : ''}<span class="o55t-landwords">${U.esc(T('tour.landing'))}</span></span>`;
    TR.emit('landed', { note });
    const mine = leaving = M.after(9000, () => { if (leaving === mine) leaving = null; unland(note); });
    /* a phone-width window may have Chat over the Wizard again: say it where it will be seen as well */
    if (innerWidth < 600) O55.pageToast(T('tour.landing'), 6000);
  };
  /* measured by tools/tour_census.mjs on the real tour with the Home panels (2026-10-10): 4.8 minutes at 200 words a
     minute with every action shown (Planning takes 7 of 16 actions and 49 % of the time); rounded up so the promise is
     kept */
  TR.minutes = () => 5;
})();
