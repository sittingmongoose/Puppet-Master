/* PMF Guided Tour — state machine: start/resume/skip/finish, step transitions,
   success predicates, Show Me orchestration, workspace snapshot/restore, and the
   settings/onboarding shims. */
(function () {
  'use strict';
  var T = window.PMF_TOUR, U = T.util, esc = U.esc, $ = U.$, $$ = U.$$, I = T.icons, PR = T.practice;
  T.state = { running: false, index: -1, snapshot: null, source: null, done: {}, keepLayout: null };
  T.current = null;
  var pollTimer = 0;

  function stepsInChapter(ch) { return T.STEPS.filter(function (s) { return s.chapter === ch; }); }
  function chapterProgress(step) { var list = stepsInChapter(step.chapter); var i = list.indexOf(step); return list.length ? (i + 1) / list.length : 0; }
  function persist() { T.store.write({ index: T.state.index, snapshot: T.state.snapshot, started_at: T.state.started_at, updated: U.now(), completed: false }); }

  // ---- lifecycle -----------------------------------------------------------------------
  T.start = function (opts) {
    opts = opts || {};
    if (!T.mount()) return false;
    if (T.state.running) return true;
    var saved = T.store.read();
    T.state.running = true; T.state.source = opts.source || 'settings'; T.state.started_at = U.now(); T.state.project_id = opts.project_id || null;
    T.fx.teacherShown = false; T.fx.eli5Applied = false; T.fx.goalSubmitted = false; T.fx.answer = null; T.fx.answerChanged = false; T.fx.whyOpen = false; T.fx.answerHistory = [];
    T.command('ui.guided_tour.start', { source: T.state.source });
    T.emit('started', { source: T.state.source });
    T.show();
    if (saved && !saved.completed && saved.index > 0 && !opts.fresh) {
      T.state.snapshot = saved.snapshot || null;
      T.renderChapters(T.CHAPTERS, 0, 0);
      T.spotlight(null);
      T.renderCard('<div class="pmft-step">Guided Tour</div><h2 class="pmft-title" id="pmft-title">Pick up where you left off?</h2><p class="pmft-body">You were on step ' + (saved.index + 1) + ' of ' + T.STEPS.length + '. Resume there, or start from the beginning.</p>',
        '<div class="pmft-foot-left"><button type="button" class="pmft-btn is-ghost" data-act="start-over">Start over</button></div><div class="pmft-foot-right"><button type="button" class="pmft-btn is-primary" data-act="resume" data-index="' + saved.index + '">Resume' + I.next + '</button></div>');
      return true;
    }
    T.goto(0);
    return true;
  };
  T.actions.resume = function (el) { var i = parseInt(el.getAttribute('data-index'), 10) || 0; if (!T.state.snapshot) T.snapshotLayout(); T.goto(Math.min(i, T.STEPS.length - 1)); };
  T.actions['start-over'] = function () { T.store.clear(); T.goto(0); };
  T.skip = function () { if (!T.state.running) return; T.command('ui.guided_tour.skip', { at: T.current && T.current.id }); T.emit('skipped', { at: T.current && T.current.id }); T.store.write({ completed: true, skipped: true, updated: U.now() }); end(true); };
  T.actions.skip = function () { T.skip(); };
  T.finish = function () { T.command('ui.guided_tour.finish', {}); T.emit('completed', {}); T.store.write({ completed: true, updated: U.now() }); showOutro(); };
  function end(restore) {
    if (T.current && T.current.onExit) { try { T.current.onExit(); } catch (e) {} }
    T.cancelShowMe(); clearInterval(pollTimer); pollTimer = 0;
    T.h.unmountSuggest(); PR.unmount();
    if (restore) T.restoreLayout();
    T.state.running = false; T.current = null; T.state.index = -1;
    T.hide(); T.noteHide();
    try { if (window.PM_PAGES && window.PM_PAGES.current !== 'wizard') window.PM_PAGES.go('wizard'); } catch (e) {}
  }
  function showOutro() {
    if (T.current && T.current.onExit) { try { T.current.onExit(); } catch (e) {} }
    clearInterval(pollTimer); pollTimer = 0; T.current = null;
    PR.unmount();
    T.spotlight(null);
    T.renderChapters(T.CHAPTERS, 3, 1);
    var changed = T.layoutChanged();
    T.renderCard('<div class="pmft-step">Tour complete</div><h2 class="pmft-title" id="pmft-title">Your Project is ready.</h2><p class="pmft-body">Start with one sentence about what you want to make or change. Teacher is one question away whenever something is unfamiliar.</p>' + (changed ? '<p class="pmft-hint">You moved Chat and added a widget during the tour. Keep that layout, or put things back the way they were.</p>' : ''),
      changed ? '<div class="pmft-foot-left"><button type="button" class="pmft-btn is-ghost" data-act="keep-layout">Keep this layout</button></div><div class="pmft-foot-right"><button type="button" class="pmft-btn is-primary" data-act="restore-layout">Restore my layout' + I.check + '</button></div>'
              : '<div class="pmft-foot-left"></div><div class="pmft-foot-right"><button type="button" class="pmft-btn is-primary" data-act="done">Start planning' + I.next + '</button></div>');
  }
  T.actions['keep-layout'] = function () { T.state.keepLayout = true; T.receipt('workspace.tour_layout', 'kept', {}); end(false); };
  T.actions['restore-layout'] = function () { T.state.keepLayout = false; end(true); };
  T.actions.done = function () { end(false); };

  // ---- navigation ------------------------------------------------------------------------
  T.goto = function (i) {
    var prev = T.current;
    if (prev && prev.onExit) { try { prev.onExit(); } catch (e) { console.error(e); } }
    T.cancelShowMe(); clearInterval(pollTimer); pollTimer = 0; T.noteHide();
    var step = T.STEPS[i]; if (!step) { T.finish(); return; }
    T.state.index = i; T.current = step; T.state.done[step.id] = false; T.cardFollow = !!step.follow;
    T.command('ui.guided_tour.step', { id: step.id, index: i });
    if (step.onEnter) { try { step.onEnter(); } catch (e) { console.error('[pmf-tour] onEnter', step.id, e); } }
    persist();
    // give the shell a beat to settle (page switches, mounts) before targeting
    setTimeout(function () { if (T.current !== step) return; targetAndRender(step); }, U.reduced() ? 20 : 160);
  };
  function targetAndRender(step) {
    var el = typeof step.target === 'function' ? step.target() : step.target;
    if (step.action && !el) { recovery(step); return; }
    T.spotlight(el, { pad: step.pad, precue: !!step.action, block: false });
    T.renderChapters(T.CHAPTERS, step.chapter, chapterProgress(step));
    var n = T.state.index + 1, total = T.STEPS.length;
    var body = '<div class="pmft-step">Step ' + n + ' of ' + total + '</div><h2 class="pmft-title" id="pmft-title">' + esc(step.title) + '</h2><p class="pmft-body">' + step.body + '</p>';
    var foot;
    if (step.action) {
      body += '<div id="pmft-status"><span class="pmft-wait"><i></i>Your turn. Try it in the real interface.</span></div>';
      foot = '<div class="pmft-foot-left">' + (T.state.index > 0 ? '<button type="button" class="pmft-btn is-ghost" data-act="back">' + I.back + 'Back</button>' : '') + '</div><div class="pmft-foot-right"><button type="button" class="pmft-btn" data-act="show-me">' + I.play + 'Show Me</button></div>';
    } else {
      foot = '<div class="pmft-foot-left">' + (T.state.index > 0 ? '<button type="button" class="pmft-btn is-ghost" data-act="back">' + I.back + 'Back</button>' : '') + '</div><div class="pmft-foot-right"><button type="button" class="pmft-btn is-primary" data-act="next">' + esc(step.primary || 'Continue') + I.next + '</button></div>';
    }
    T.renderCard(body, foot);
    if (step.action) {
      pollTimer = setInterval(function () { checkPredicate(step); }, 140);
    }
  }
  function checkPredicate(step) {
    if (T.current !== step || T.state.done[step.id]) return;
    var ok = false; try { ok = !!step.predicate(); } catch (e) {}
    if (!ok) return;
    T.state.done[step.id] = true; clearInterval(pollTimer); pollTimer = 0;
    T.receipt('guided_tour.step', 'ok', { id: step.id, via: T.showMeRunning ? 'show_me' : 'user' });
    T.emit('step-complete', { id: step.id });
    var wasShowMe = T.showMeRunning; T.showMeRunning = false; T.pointerHide();
    T.status('<span class="pmft-done">' + I.check + esc(step.ack || 'Done') + '</span>');
    // the target may have re-rendered (practice sheet, catalog): re-resolve it before celebrating
    setTimeout(function () { if (T.current !== step) return; var el = null; try { el = typeof step.target === 'function' ? step.target() : step.target; } catch (e) {} if (el && el.isConnected) T.spotlight(el, { pad: step.pad }); T.arrive(); }, 60);
    var foot = $('#pmft-card-foot .pmft-foot-right'); if (foot) foot.innerHTML = '<button type="button" class="pmft-btn is-primary" data-act="next">Continue' + I.next + '</button>';
    $$('button', foot || document.createElement('div')).forEach(function (b) { b.setAttribute('data-pm-hover-exempt', 'true'); });
    if (step.ack) T.note(step.ack, 4200);
    setTimeout(function () { var b = $('#pmft-card-foot .pmft-btn.is-primary'); if (b) { try { b.focus({ preventScroll: true }); } catch (e) {} } }, wasShowMe ? 400 : 80);
  }
  function recovery(step) {
    T.spotlight(null);
    T.renderChapters(T.CHAPTERS, step.chapter, chapterProgress(step));
    T.renderCard('<div class="pmft-step">Step ' + (T.state.index + 1) + ' of ' + T.STEPS.length + '</div><h2 class="pmft-title" id="pmft-title">That part of the screen is not available right now.</h2><p class="pmft-body">' + esc(step.title) + ' needs a control that is hidden or has changed. You can try again, skip this step, or end the tour.</p>',
      '<div class="pmft-foot-left"><button type="button" class="pmft-btn is-ghost" data-act="skip">Skip Tour</button></div><div class="pmft-foot-right"><button type="button" class="pmft-btn" data-act="retry">Try again</button><button type="button" class="pmft-btn is-primary" data-act="next">Skip step' + I.next + '</button></div>');
    T.emit('recovery', { id: step.id });
  }
  T.actions.retry = function () { T.goto(T.state.index); };
  T.actions.next = function () { T.command('ui.guided_tour.next', { from: T.current && T.current.id }); T.goto(T.state.index + 1); };
  T.actions.back = function () { if (T.state.index > 0) { T.command('ui.guided_tour.back', { from: T.current && T.current.id }); T.goto(T.state.index - 1); } };
  T.next = function () { T.actions.next(); };
  T.back = function () { T.actions.back(); };

  // ---- Show Me ------------------------------------------------------------------------------
  T.actions['show-me'] = function (el) {
    var step = T.current; if (!step || !step.showMe || T.showMeRunning) return;
    T.showMeRunning = true; T.showMeCancelled = false;
    T.command('ui.guided_tour.show_me', { id: step.id });
    el.classList.add('is-busy'); el.innerHTML = '<span class="pmft-wait"><i></i>Showing</span>';
    T.status('<span class="pmft-wait"><i></i>Watch the pointer. You can press Esc to take over.</span>');
    Promise.resolve().then(function () { return step.showMe(); }).then(function () {
      if (T.current !== step) return;
      T.until(function () { return T.state.done[step.id]; }, 2500).then(function (ok) {
        T.showMeRunning = false; T.pointerHide();
        if (!ok && T.current === step) { el.classList.remove('is-busy'); el.innerHTML = I.play + 'Show Me'; T.status('<span class="pmft-wait"><i></i>The demonstration ran. Now try it yourself, or press Show Me again.</span>'); }
      });
    }).catch(function (e) { console.error('[pmf-tour] show me', e); T.showMeRunning = false; T.pointerHide(); el.classList.remove('is-busy'); el.innerHTML = I.play + 'Show Me'; });
  };
  T.cancelShowMe = function () { if (!T.showMeRunning) return; T.showMeCancelled = true; T.showMeRunning = false; T.pointerHide(); };

  // ---- workspace snapshot / restore ----------------------------------------------------------
  T.snapshotLayout = function () {
    var s = T.h.chatSurface();
    T.state.snapshot = { chat_host: s ? s.host : 'dock_right', chat_visible: s ? !!s.visible : true, chat_slot: s ? s.slot_index : 0, widget_present: !!T.h.widgetCard(), page: (window.PM_PAGES && window.PM_PAGES.current) || 'dashboard', at: U.now() };
    T.receipt('workspace.snapshot', 'ok', T.state.snapshot);
    return T.state.snapshot;
  };
  T.layoutChanged = function () { var snap = T.state.snapshot; if (!snap) return false; var s = T.h.chatSurface(); return !!((s && s.host !== snap.chat_host) || (!snap.widget_present && T.h.widgetCard())); };
  T.restoreLayout = function () {
    var snap = T.state.snapshot; if (!snap) return;
    var api = window.PM_HOME_WORKSPACE; var s = T.h.chatSurface();
    try { if (s && s.host !== snap.chat_host && api && api.moveSurface) api.moveSurface('chat', snap.chat_host); } catch (e) {}
    try { if (api && api.setSurfaceVisible) api.setSurfaceVisible('chat', snap.chat_visible !== false, 'cmd.panel.switch'); } catch (e) {}
    if (!snap.widget_present) { var card = T.h.widgetCard(); if (card) { card.style.transition = 'opacity 240ms, transform 240ms'; card.style.opacity = '0'; card.style.transform = 'scale(.98)'; setTimeout(function () { card.remove(); }, 260); T.receipt('workspace.restore.widget', 'removed_concept_dom', { note: 'Dashboard demo has no remove command; the concept removes the card node and leaves the catalog flag set.' }); } }
    T.receipt('workspace.restore', 'ok', snap);
    T.command('cmd.workspace_layout.restore_snapshot', { snapshot_at: snap.at });
  };

  // ---- shims (settings handlers call these) ---------------------------------------------------------
  window.PM7_GUIDED_TOUR = {
    schema_id: 'pm.guided_tour.pmf.compat.v1', concept_simulation_only: true,
    start: function (o) { return T.start(o); }, next: function () { return T.next(); }, back: function () { return T.back(); }, skip: function () { return T.skip(); },
    resume: function () { return T.start({ source: 'resume' }); }, replay: function () { T.store.clear(); return T.start({ source: 'settings', fresh: true }); },
    snapshot: function () { return { running: T.state.running, index: T.state.index, step: T.current && T.current.id, provider_requests: T.provider_requests, usage_increment: T.usage_increment }; }
  };
  T.mount();
})();
