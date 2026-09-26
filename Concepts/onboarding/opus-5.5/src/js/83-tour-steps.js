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

  /* Where Chat should go. On a wide window the workspace has side docks and Chat is dragged to the left dock. Below
     the width where the workspace stacks its docks under the main area, the right dock's hit band spans the whole
     width, so no dock can be reached by dragging; the reachable version there is a button that sends the same move
     command (cmd.workspace_layout.move_surface) to put Chat above the work. Production impact noted in REPORT.md. */
  const hostEl = (h) => document.querySelector(`#pm-home-workspace [data-pm-home-host="${h}"]`);
  const stacked = () => { const m = hostEl('home_main'), r = hostEl('dock_right'); if (!m || !r) return false; const a = m.getBoundingClientRect(), b = r.getBoundingClientRect(); return b.width > 0 && b.top >= a.bottom - 4; };
  /* the left dock's entry band: 28 px inside the workspace's left edge (the engine's frozen dock latch) */
  function leftBand() { const ws = document.getElementById('pm-home-workspace'); if (!ws) return null; const r = ws.getBoundingClientRect(); return { x: r.left, y: r.top, w: 28, h: r.height }; }
  TR.dockBand = () => { const b = leftBand(); return b ? Object.assign({ stacked: stacked(), drop: { x: b.x + 12, y: b.y + b.h * 0.45 } }, b) : null; };
  /* the zone lights up while the left dock reports a drop; watched only while the zone shows */
  let dropWatch = null;
  function watchDrop(on) {
    const z = document.querySelector('#pm-o55-tour .o55t-zone'), ws = document.getElementById('pm-home-workspace');
    const sync = () => { if (z) z.classList.toggle('o55t-drop-hot', !!(ws && ws.querySelector('[data-pm-home-host="dock_left"].pm-home-drop-active'))); };
    if (!on || !z || !ws || typeof MutationObserver !== 'function') { if (dropWatch) { dropWatch.disconnect(); dropWatch = null; } if (z) z.classList.remove('o55t-drop-hot'); return; }
    if (!dropWatch) { dropWatch = new MutationObserver(sync); dropWatch.observe(ws, { subtree: true, attributes: true, attributeFilter: ['class'] }); }
    sync();
  }
  function showZone(on) {
    const z = document.querySelector('#pm-o55-tour .o55t-zone'); if (!z) return;
    const b = leftBand(); if (!on || !b) { z.classList.remove('o55t-on'); watchDrop(false); return; }
    z.style.transform = `translate(${b.x}px, ${b.y}px)`; z.style.width = b.w + 'px'; z.style.height = b.h + 'px'; z.classList.add('o55t-on');
    watchDrop(true);
  }
  const dockDone = () => TR.st.sess.done.includes('move_or_dock_chat');
  S({ id: 'move_or_dock_chat', chapter: 'workspace', kind: 'action', after: true,
    enter() { goPage('dashboard'); if (!C.chatVisible()) api().setSurfaceVisible('chat', true, 'cmd.panel.switch'); },
    tick(st) {
      const sk = stacked(); if (st.dockStacked !== sk) { const first = st.dockStacked === undefined; st.dockStacked = sk; if (!first) TR.refresh(); }
      showZone(!dockDone() && !sk);
    },
    leave: (st) => { showZone(false); st.dockStacked = undefined; },
    doKey: () => (stacked() ? 'doTop' : 'do'),
    extra: () => (stacked() && !dockDone() ? `<div class="o55t-inline">${TR.btn('moveChatTop', T('tour.steps.move_or_dock_chat.moveTop'), 'secondary')}</div>` : ''),
    actions: { moveChatTop: () => { O55.sound.play('drop'); api().moveSurface('chat', 'dock_top'); } },
    /* the grip while Chat is still in place; the drop zone while it is lifted; once it has moved, the whole panel */
    target: () => (dockDone() ? document.getElementById('chatPanel')
      : document.body.classList.contains('pm-home-dragging') ? document.querySelector('#pm-o55-tour .o55t-zone') : q('[data-pm-home-handle="chat"]')),
    done: () => { const s = chatSurface(); return !!(s && s.visible && (s.host === 'dock_left' || s.host === 'dock_top')); },
    showMe: async (sm) => {
      if (stacked()) { await sm.click(document.querySelector('#pm-o55-tour [data-o55t="moveChatTop"]')); return; }
      const b = leftBand(); if (b) await sm.drag(q('[data-pm-home-handle="chat"]'), { x: b.x + 12, y: b.y + b.h * 0.45 });
    },
    goTo: () => goPage('dashboard') });

  const aqItem = () => [...document.querySelectorAll('.pm6-dash-catalog-item')].find((x) => TR.vis(x) && /approval queue/i.test(x.textContent)) || null;
  const aqWidget = () => [...document.querySelectorAll('[data-widget-id], .pm6-dash-widget')].find((w) => TR.vis(w) && /approval queue/i.test(w.textContent)) || null;
  /* placed = the dashboard accepted a move or a resize of the Approval queue since this step began */
  const AQ = 'pm6-dash-approval-queue';
  const dashLogs = () => window.PM7_DASH_WIDGETS || { command_log: [], receipt_log: [] };
  const placed = (st) => {
    const w = dashLogs(), mine = w.command_log.slice(st.wlog || 0).filter((c) => (c.command_id === 'cmd.widget.move' || c.command_id === 'cmd.widget.resize') && c.instance_id === AQ);
    return mine.some((c) => w.receipt_log.some((r) => r.command_instance_id === c.command_instance_id && (r.outcome === 'accepted' || r.outcome === 'applied')));
  };
  /* where to drop it: onto the card just before the new widget, so it moves up a place. The point is kept clear of
     the dashboard's auto-scroll bands (about 80 px from its top and bottom edges), where a held pointer would scroll
     the list under itself. No such point in view: the widget is placed by choosing a size instead. */
  const dropSpot = () => {
    const h = document.getElementById('dashGridMain'), sc = document.getElementById('pm6DashScroll'), w = aqWidget(); if (!h || !w) return null;
    const v = sc ? sc.getBoundingClientRect() : { top: 0, bottom: innerHeight };
    const cards = [...h.children].filter((c) => c.classList.contains('pm6-dash-card') && TR.vis(c)), at = cards.indexOf(w);
    const prev = at > 0 ? cards[at - 1] : null; if (!prev) return null;
    const r = prev.getBoundingClientRect(), lo = Math.max(r.top + 6, v.top + 86), hi = Math.min(r.bottom - 6, v.bottom - 86);
    if (hi - lo < 12) return null;
    return { card: prev, id: prev.getAttribute('data-widget-id'), x: r.left + r.width * 0.3, y: Math.max(lo, Math.min(hi, r.top + r.height * 0.35)) };
  };
  TR.dashDrop = () => { const d = dropSpot(); return d ? { id: d.id, x: d.x, y: d.y } : null; };
  S({ id: 'widget_action', chapter: 'workspace', kind: 'action', after: true,
    enter(st) { goPage('dashboard'); st.wlog = dashLogs().command_log.length; st.wphase = null; },
    /* two moves in one step: add it from the real catalog, then place it (drag its grip, or choose a size) */
    tick(st) { const ph = aqWidget() ? 'place' : 'add'; if (st.wphase !== ph) { const first = st.wphase === null; st.wphase = ph; if (!first) { st.side = null; O55.sound.play('step'); TR.refresh(); } } },
    /* while placing, the callout stands beside the dashboard column, never over the cards the widget can drop onto */
    place: (st) => (st.wphase === 'place' ? 'left' : 'auto'),
    doKey: (st) => (st.wphase === 'place' ? 'place' : 'do'),
    target: (st) => { const w = aqWidget(); if (TR.st.sess.done.includes('widget_action')) return w; if (w) return w; return aqItem() || q('#pm6DashAddBtn'); },
    done: (st) => !!aqWidget() && placed(st),
    showMe: async (sm) => {
      if (!aqWidget()) { if (!aqItem()) { await sm.click(q('#pm6DashAddBtn')); await sm.wait(420); } await sm.click(aqItem()); await sm.wait(900); }
      const w = aqWidget(), grip = w && w.querySelector('.pm6-dash-drag'), to = dropSpot();
      if (grip && to) { await sm.drag(grip, { x: to.x, y: to.y }); return; }
      /* nothing above it in view: give it a size that reads at a glance */
      const sizeBtn = w && w.querySelector('.pm7-dash-size-btn'); if (!sizeBtn) return;
      await sm.click(sizeBtn); await sm.wait(320);
      const cur = w.getAttribute('data-pm7-size'), pick = document.querySelector(`.pm7-dash-size-pop.open [data-size="${cur === '1x2' ? '2x1' : '1x2'}"]`);
      if (pick) await sm.click(pick);
    },
    goTo: () => goPage('dashboard') });

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
      O55.sound.play('spot'); TR.refresh();
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
    /* a phone-width window may have Chat over the Wizard again: say it where it will be seen as well */
    if (innerWidth < 600) O55.pageToast(T('tour.landing'), 6000);
  };
  /* measured by tools/tour_census.mjs on the real tour: 4.5 minutes at 200 words a minute with every action shown
     (Planning takes 7 of 14 actions and 53 % of the time); rounded up so the promise is kept */
  TR.minutes = () => 5;
})();
