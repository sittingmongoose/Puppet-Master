/* PMF Guided Tour — fixtures and steps. Three chapters: Ask (Assistant Chat +
   Teacher + ELI5), Arrange (move Chat, add a widget), Plan (Planning Wizard
   practice: goal, question, review, edit consequence, approval boundary). Every
   meaningful step asks the user to act; Show Me demonstrates the same handler. */
(function () {
  'use strict';
  var T = window.PMF_TOUR, U = T.util, esc = U.esc, $ = U.$, $$ = U.$$, I = T.icons;
  var HW = function () { return window.PM_HOME_WORKSPACE; };

  // ---- fixtures (local, deterministic; no provider request, no usage) ---------------
  T.fixture = {
    prompt: 'What happens before Puppet Master changes my files?',
    teacher: 'Before work begins, Puppet Master turns your request into a plan. You can review the important choices, correct anything that looks wrong, and decide when to begin. Your Project permissions still control what the work may change.',
    teacher_eli5: 'First, Puppet Master writes down what it thinks you want. You can fix the plan before anything starts. It waits for your decision to begin.',
    goal: 'Create a simple website for my neighborhood book club. It should show the next meeting, the current book, and how to join.',
    outcomes: [
      { id: 'o1', text: 'Visitors can see the next meeting', sub: 'Date, time, and place on the front page' },
      { id: 'o2', text: 'Visitors can see the current book', sub: 'Title, author, and a short note' },
      { id: 'o3', text: 'New members can learn how to join', sub: 'A simple page with the steps' }
    ],
    question: 'Who should be able to update the meeting and book?',
    choices: [{ id: 'me', label: 'Only me' }, { id: 'organizers', label: 'A few organizers' }, { id: 'unsure', label: 'I\'m not sure yet' }],
    why: 'This decides whether the site needs shared sign-in and editing. Answering now keeps Puppet Master from planning the wrong kind of site.',
    assumptions: [
      { id: 'a1', text: 'One page per section is enough', sub: 'Assumed from the goal. Easy to change later.' },
      { id: 'a2', text: 'No online payments', sub: 'Joining is free unless you say otherwise.' }
    ],
    open: [{ id: 'u1', text: 'Which book club name and colors to use', sub: 'Puppet Master will ask when it matters.' }],
    consequence: {
      organizers: { outcomes: [{ id: 'c1', text: 'Organizers can sign in and edit', sub: 'Shared sign-in for a few people' }], decisions: [{ id: 'd2', text: 'Organizer access with separate sign-ins', sub: 'Each organizer gets their own login' }] },
      me: { outcomes: [], decisions: [] },
      unsure: { outcomes: [], decisions: [{ id: 'd3', text: 'Editing access still to decide', sub: 'Puppet Master plans a single editor for now and asks again before building sign-in' }] }
    }
  };
  T.fx = { teacherShown: false, eli5Applied: false, goalSubmitted: false, answer: null, answerChanged: false, reviewSeen: false, answerHistory: [] };

  // ---- shell helpers ---------------------------------------------------------------
  function chatSurface() { var l = HW() && HW().layout; return l && (l.surfaces || []).filter(function (s) { return (s.surface_instance_id || s.surface_id) === 'chat'; })[0]; }
  function chatPanel() { return document.getElementById('chatPanel'); }
  function chatVisible() { var p = chatPanel(), s = chatSurface(); return !!(p && !p.classList.contains('hidden') && p.getBoundingClientRect().width > 0 && (!s || s.visible)); }
  function chatIcon() { return $('.activity-bar .icon[title="Chat"], .icon[data-ab-id="chat"]'); }
  function chatStream() { return $('#chatPanel .message-stream, #chatPanel .messageStream'); }
  function chatComposer() { return $('#chatPanel .pm6-chat-composer'); }
  function chatInput() { return $('#chatPanel .pm6-chat-input'); }
  function eli5Toggle() { return $('#chatPanel .toggle-eli5'); }
  function chatGrip() { return $('#chatPanel [data-pm-home-handle="chat"], [data-pm-home-handle="chat"]'); }
  function homeRoot() { return document.getElementById('pm-home-workspace'); }
  function dockLeft() { return $('[data-pm-home-host="dock_left"]'); }
  function addWidgetBtn() { return document.getElementById('pm6DashAddBtn'); }
  function catalogItem() { return $('[data-demo-action="dash.add.approval_queue"]'); }
  function widgetCard() { return $('.pm6-dash-card[data-widget-kind="approval_queue"]'); }
  function wizardTab() { return document.getElementById('tab-wizard'); }
  function wizardPanel() { return document.getElementById('panel-wizard'); }
  T.h = { chatSurface: chatSurface, chatVisible: chatVisible, chatIcon: chatIcon, chatStream: chatStream, chatGrip: chatGrip, widgetCard: widgetCard, wizardPanel: wizardPanel };

  // Real command for showing Chat. The activity-bar Chat icon is the visible
  // control; this build's icon handler is inert, so the tour wraps the canonical
  // command the shell itself uses for that icon (cmd.panel.switch).
  function showChat() { T.command('cmd.panel.switch', { surface: 'chat', visible: true }); var api = HW(); if (api && api.setSurfaceVisible) api.setSurfaceVisible('chat', true, 'cmd.panel.switch'); var p = chatPanel(); if (p) { p.classList.remove('hidden'); p.classList.remove('pmft-reveal'); void p.offsetWidth; p.classList.add('pmft-reveal'); setTimeout(function () { p.classList.remove('pmft-reveal'); }, 700 * U.timeScale()); } var r = document.getElementById('chatResizer'); if (r) r.classList.remove('hidden'); var ic = chatIcon(); if (ic) ic.classList.add('active'); }
  function hideChat() { T.command('cmd.panel.switch', { surface: 'chat', visible: false }); var api = HW(); if (api && api.setSurfaceVisible) api.setSurfaceVisible('chat', false, 'cmd.panel.switch'); }
  T.h.showChat = showChat; T.h.hideChat = hideChat;

  // guided example thread inside the real chat stream
  function ensureSysNote() { var s = chatStream(); if (!s || $('.pmft-sysnote', s)) return; var n = document.createElement('div'); n.className = 'pmft-sysnote'; n.innerHTML = I.info + '<span>Guided example. Uses none of your AI plan and changes no files.</span>'; s.appendChild(n); s.scrollTop = s.scrollHeight; }
  function mountSuggest() {
    var comp = chatComposer(); if (!comp || $('.pmft-suggest')) return;
    var box = document.createElement('div'); box.className = 'pmft-suggest'; box.setAttribute('data-pm-hover-exempt', 'true');
    box.innerHTML = '<div class="pmft-suggest-label">' + I.sparkles + '<span>Try asking Teacher</span></div><button type="button" class="pmft-suggest-btn" data-pmft-suggest data-pm-hover-exempt="true"><span>' + esc(T.fixture.prompt) + '</span>' + I.next + '</button>';
    comp.parentNode.insertBefore(box, comp);
    box.querySelector('[data-pmft-suggest]').addEventListener('click', function () { T.h.sendGuided(); });
    var inp = chatInput();
    if (inp && !inp.__pmftBound) { inp.__pmftBound = true; inp.addEventListener('keydown', function (ev) { if (ev.key === 'Enter' && !ev.shiftKey && T.state.running && T.current && T.current.id === 'teacher-ask' && /before puppet master changes/i.test(inp.value)) { ev.preventDefault(); ev.stopImmediatePropagation(); inp.value = ''; T.h.sendGuided(); } }, true); }
  }
  function unmountSuggest() { var b = $('.pmft-suggest'); if (b) b.remove(); }
  T.h.mountSuggest = mountSuggest; T.h.unmountSuggest = unmountSuggest;
  T.h.sendGuided = function () {
    if (T.fx.teacherShown) return;
    var s = chatStream(); if (!s) return;
    T.command('cmd.chat.send', { thread: 'guided_example', local_fixture: true, provider_request: false });
    ensureSysNote(); unmountSuggest();
    var u = document.createElement('div'); u.className = 'message user pm6-chat-msg pmft-msg'; u.setAttribute('data-pm6-role', 'user');
    u.innerHTML = '<div class="msg-body"><div class="runtime-snapshot"><span class="pmft-tag">Example</span><span>you</span></div>' + esc(T.fixture.prompt) + '</div>';
    s.appendChild(u); s.scrollTop = s.scrollHeight;
    var typing = document.createElement('div'); typing.className = 'message assistant pm6-chat-msg pmft-msg pmft-typing'; typing.innerHTML = '<div class="msg-body"><div class="runtime-snapshot"><span class="pmft-tag">Example</span><span class="pmft-teacher">Teacher</span></div><span class="pmft-cursor"></span></div>';
    setTimeout(function () {
      s.appendChild(typing); s.scrollTop = s.scrollHeight;
      var body = typing.querySelector('.msg-body'); var target = body; body.innerHTML = '<div class="runtime-snapshot"><span class="pmft-tag">Example</span><span class="pmft-teacher">Teacher</span></div><div class="pmft-morph"><span class="pmft-text is-new" id="pmft-teacher-text"></span></div>';
      var textEl = body.querySelector('#pmft-teacher-text'); var words = T.fixture.teacher.split(' '); var i = 0;
      var cur = document.createElement('span'); cur.className = 'pmft-cursor'; textEl.appendChild(cur);
      (function tick() {
        if (i < words.length) { cur.insertAdjacentText('beforebegin', (i ? ' ' : '') + words[i]); i++; s.scrollTop = s.scrollHeight; setTimeout(tick, U.reduced() ? 8 : 38 + Math.random() * 40); }
        else { cur.remove(); typing.classList.remove('pmft-typing'); typing.id = 'pmft-teacher-msg'; T.fx.teacherShown = true; T.receipt('guided_example.teacher', 'ok', { provider_request: false }); T.emit('teacher-shown'); }
      })();
    }, U.reduced() ? 60 : 520);
  };
  T.h.applyEli5 = function () {
    var msg = document.getElementById('pmft-teacher-msg'); if (!msg || T.fx.eli5Applied) return;
    T.command('cmd.chat.eli5.apply', { thread: 'guided_example', local_fixture: true });
    T.morphText(msg, T.fixture.teacher_eli5);
    var tag = document.createElement('span'); tag.className = 'pmft-eli5-tag'; tag.innerHTML = I.sparkles + '<span>ELI5: simpler words, same meaning</span>'; msg.querySelector('.msg-body').appendChild(tag);
    T.fx.eli5Applied = true; T.emit('eli5-applied');
  };

  // ---- practice sheet inside the Planning Wizard --------------------------------------
  var PR = T.practice = { el: null, stage: 'goal' };
  function item(o, extra) { return '<div class="pmft-p-item ' + (extra || '') + '" data-pid="' + o.id + '"><span class="pmft-p-ico">' + (o.icon || I.check) + '</span><span><span>' + esc(o.text) + '</span>' + (o.sub ? '<small>' + esc(o.sub) + '</small>' : '') + '</span><span>' + (o.edit ? '<button type="button" class="pmft-p-edit" data-pmft="edit-answer">Edit</button>' : '') + '</span></div>'; }
  PR.mount = function () {
    var panel = wizardPanel(); if (!panel) return null;
    if (PR.el && PR.el.isConnected) return PR.el;
    var el = document.createElement('section'); el.className = 'pmft-practice'; el.setAttribute('data-pm-hover-exempt', 'true'); el.id = 'pmft-practice';
    panel.appendChild(el); PR.el = el; PR.render();
    requestAnimationFrame(function () { el.classList.add('is-on'); });
    el.addEventListener('click', function (ev) { var b = ev.target.closest('[data-pmft]'); if (!b) return; var a = b.getAttribute('data-pmft'); if (PR.actions[a]) PR.actions[a](b, ev); });
    return el;
  };
  PR.unmount = function () { var el = PR.el; if (!el) return; el.classList.add('is-leaving'); setTimeout(function () { el.remove(); }, U.reduced() ? 20 : 380); PR.el = null; };
  PR.render = function () {
    var el = PR.el; if (!el) return; var f = T.fixture, fx = T.fx;
    var head = '<div class="pmft-p-kicker">' + I.wand + '<span>Planning Wizard</span><span class="pmft-tag">Practice</span></div>';
    var html = head;
    if (PR.stage === 'goal') {
      html += '<h1 class="pmft-p-title">Start with one sentence.</h1><p class="pmft-p-sub">Planning Wizard helps turn a rough idea into a plan you can inspect before work begins. Here is a practice idea to try.</p>';
      html += '<div class="pmft-p-goal" id="pmft-goal"><div><div class="pmft-p-goal-label">Practice goal</div><div class="pmft-p-goal-text">' + esc(f.goal) + '</div></div><button type="button" class="pmft-btn is-primary" data-pmft="submit-goal" data-pm-hover-exempt="true">Plan this' + I.next + '</button></div>';
    } else {
      html += '<h1 class="pmft-p-title">' + (PR.stage === 'review' || PR.stage === 'edit' ? 'Review before anything is built' : 'From an idea to outcomes') + '</h1>';
      html += '<div class="pmft-p-goal is-submitted"><div><div class="pmft-p-goal-label">Your goal</div><div class="pmft-p-goal-text">' + esc(f.goal) + '</div></div><span class="pmft-done">' + I.check + 'Understood</span></div>';
      var cons = fx.answer ? f.consequence[fx.answer] : { outcomes: [], decisions: [] };
      var qcard = '<div class="pmft-p-question is-in" id="pmft-question"><div class="pmft-p-label">One decision that changes the plan</div><h3 class="pmft-p-q">' + esc(f.question) + '</h3><div class="pmft-p-choices">' + f.choices.map(function (c) { return '<button type="button" class="pmft-p-choice" role="radio" aria-checked="' + (fx.answer === c.id) + '" data-pmft="choose" data-choice="' + c.id + '" data-pm-hover-exempt="true">' + esc(c.label) + '</button>'; }).join('') + '</div>' + (fx.whyOpen ? '<div class="pmft-p-why">' + I.info + '<span>' + esc(f.why) + '</span></div>' : '<button type="button" class="pmft-p-why-toggle" data-pmft="why" data-pm-hover-exempt="true">Why this matters</button>') + '</div>';
      if (PR.stage === 'edit') html += qcard;
      html += '<div class="pmft-p-section"><div class="pmft-p-label">Outcomes <span class="pmft-count">' + (f.outcomes.length + cons.outcomes.length) + '</span></div><div class="pmft-p-items" id="pmft-outcomes">' + f.outcomes.map(function (o, i) { return item(o, PR.stage === 'outcomes' ? 'is-in' : ''); }).join('') + cons.outcomes.map(function (o) { return item(o, 'is-consequence'); }).join('') + '</div></div>';
      if (PR.stage === 'question') html += qcard;
      if (PR.stage === 'review' || PR.stage === 'edit') {
        var decisions = [{ id: 'd1', text: 'Who can update: ' + (f.choices.filter(function (c) { return c.id === fx.answer; })[0] || {}).label, sub: 'Your answer. Change it anytime before approval.', edit: PR.stage === 'review' }].concat(cons.decisions.map(function (d) { d = U.clone(d); return d; }));
        html += '<div class="pmft-p-board"><div class="pmft-p-section"><div class="pmft-p-label">Decisions <span class="pmft-count">' + decisions.length + '</span></div><div class="pmft-p-items" id="pmft-decisions">' + decisions.map(function (d, i) { return item(U.clone(d), (i > 0 ? 'is-consequence' : '')); }).join('') + '</div></div>';
        html += '<div class="pmft-p-section"><div class="pmft-p-label">Assumptions <span class="pmft-count">' + f.assumptions.length + '</span></div><div class="pmft-p-items">' + f.assumptions.map(function (a) { return item({ id: a.id, text: a.text, sub: a.sub, icon: I.info }, 'is-muted'); }).join('') + '</div></div>';
        html += '<div class="pmft-p-section"><div class="pmft-p-label">Still open <span class="pmft-count">' + f.open.length + '</span></div><div class="pmft-p-items">' + f.open.map(function (a) { return item({ id: a.id, text: a.text, sub: a.sub, icon: I.clock }, 'is-muted'); }).join('') + '</div></div></div>';
        html += '<div class="pmft-p-boundary" id="pmft-boundary">' + I.shield + '<div><b>Nothing has been built yet.</b><span>This is your chance to check the outcome, the decisions Puppet Master used, and anything that is still uncertain.</span></div><button type="button" class="pmft-p-approve" aria-disabled="true" title="In the real Planning Wizard, this is where you decide.">Approve plan and begin</button></div>';
      }
      if (PR.stage === 'outcomes') html += '<div class="pmft-p-foot"><span class="pmft-hint">Three outcomes. Next, one question that shapes the plan.</span></div>';
    }
    el.innerHTML = html;
    $$('button', el).forEach(function (b) { b.setAttribute('data-pm-hover-exempt', 'true'); });
  };
  PR.actions = {
    'submit-goal': function () {
      if (T.fx.goalSubmitted) return; T.fx.goalSubmitted = true; T.command('cmd.planning_wizard.submit_goal', { practice: true, local_fixture: true });
      var goal = document.getElementById('pmft-goal'); if (goal) goal.classList.add('is-submitted');
      setTimeout(function () { PR.stage = 'outcomes'; PR.render(); $$('#pmft-outcomes .pmft-p-item', PR.el).forEach(function (it, i) { it.style.setProperty('--i', i); }); T.emit('goal-submitted'); }, U.reduced() ? 20 : 380);
    },
    'why': function () { T.fx.whyOpen = true; PR.render(); },
    'choose': function (b) {
      var id = b.getAttribute('data-choice'); var prev = T.fx.answer; if (prev === id) return;
      T.command('cmd.planning_wizard.answer', { question: 'who_updates', answer: id, practice: true });
      T.fx.answerHistory.push(id); T.fx.answer = id; if (prev && prev !== id) T.fx.answerChanged = true;
      $$('.pmft-p-choice', PR.el).forEach(function (c) { c.setAttribute('aria-checked', c.getAttribute('data-choice') === id ? 'true' : 'false'); });
      if (PR.stage === 'edit') PR.applyConsequence(prev, id); else T.emit('answered');
    },
    'edit-answer': function () { PR.stage = 'edit'; PR.render(); T.emit('edit-opened'); }
  };
  // animate only the affected plan elements; keep everything else still
  PR.applyConsequence = function (prev, next) {
    var f = T.fixture, from = f.consequence[prev] || { outcomes: [], decisions: [] }, to = f.consequence[next] || { outcomes: [], decisions: [] };
    var oh = document.getElementById('pmft-outcomes'), dh = document.getElementById('pmft-decisions');
    // update the decision label in place
    var d1 = dh && dh.querySelector('[data-pid="d1"] > span:nth-child(2) > span'); if (d1) d1.textContent = 'Who can update: ' + (f.choices.filter(function (c) { return c.id === next; })[0] || {}).label;
    // remove previous consequences
    from.outcomes.concat(from.decisions).forEach(function (o) { var el = PR.el.querySelector('[data-pid="' + o.id + '"]'); if (el) { el.classList.add('is-out'); setTimeout(function () { el.remove(); }, U.reduced() ? 20 : 340); } });
    // add new consequences after the removal settles
    setTimeout(function () {
      to.outcomes.forEach(function (o, i) { if (oh && !oh.querySelector('[data-pid="' + o.id + '"]')) { oh.insertAdjacentHTML('beforeend', item(o, 'is-consequence is-in')); oh.lastElementChild.style.setProperty('--i', i); } });
      to.decisions.forEach(function (d, i) { if (dh && !dh.querySelector('[data-pid="' + d.id + '"]')) { dh.insertAdjacentHTML('beforeend', item(d, 'is-consequence is-in')); dh.lastElementChild.style.setProperty('--i', i); } });
      var oc = $('.pmft-p-label .pmft-count', oh.parentNode); if (oc) oc.textContent = oh.children.length;
      var dc = dh && $('.pmft-p-label .pmft-count', dh.parentNode); if (dc) dc.textContent = dh.children.length;
      T.emit('consequence-applied', { from: prev, to: next });
    }, U.reduced() ? 30 : 360);
  };

  // ---- steps ---------------------------------------------------------------------------
  T.CHAPTERS = ['Ask', 'Arrange', 'Plan'];
  T.STEPS = [
    { id: 'intro', chapter: 0, title: 'Let\'s make Puppet Master feel familiar.', body: 'You will try a few real actions. This guided example does not change your files or use your AI plan.', target: null, action: false, primary: 'Start', onEnter: function () { T.snapshotLayout(); if (chatVisible()) hideChat(); } },
    { id: 'open-chat', chapter: 0, title: 'Open Assistant Chat', body: 'Click the <strong>Chat</strong> icon at the top of the left rail. Assistant Chat is where you ask Puppet Master for help.', target: chatIcon, pad: 6, place: 'right', action: true, block: false,
      predicate: chatVisible, ack: 'Assistant Chat is open.',
      onEnter: function () { var ic = chatIcon(); if (ic && !ic.__pmftBound) { ic.__pmftBound = true; ic.addEventListener('click', function () { setTimeout(function () { if (T.state.running && T.current && T.current.id === 'open-chat' && !chatVisible()) showChat(); }, 60); }); } },
      showMe: async function () { var ic = chatIcon(); await T.demo.travelClick(ic, 'Click'); if (!chatVisible()) showChat(); } },
    { id: 'teacher-ask', chapter: 0, title: 'Ask Teacher a question', body: 'Teacher can explain the screen you are on, an unfamiliar term, or why a choice matters. Send the suggested question.', target: function () { return $('.pmft-suggest') || chatComposer(); }, pad: 8, place: 'left', action: true,
      predicate: function () { return T.fx.teacherShown; }, ack: 'Teacher answered inside Assistant Chat.',
      onEnter: function () { if (!chatVisible()) showChat(); setTimeout(function () { ensureSysNote(); mountSuggest(); T.relayout(); }, 120); },
      showMe: async function () { var b = $('.pmft-suggest-btn'); if (!b) return; await T.demo.travelClick(b, 'Send'); },
      onExit: function () { unmountSuggest(); } },
    { id: 'eli5', chapter: 0, title: 'Make it simpler with ELI5', body: 'Click <strong>ELI5</strong> under the message box. The same answer becomes shorter and simpler, and still accurate.', target: eli5Toggle, pad: 8, place: 'left', action: true,
      predicate: function () { return T.fx.eli5Applied; }, ack: 'Same answer, simpler words.',
      onEnter: function () { var t = eli5Toggle(); if (t && !t.__pmftBound) { t.__pmftBound = true; t.addEventListener('click', function () { if (T.state.running && T.current && T.current.id === 'eli5') setTimeout(T.h.applyEli5, 40); }); } },
      showMe: async function () { var t = eli5Toggle(); await T.demo.travelClick(t, 'Click'); setTimeout(T.h.applyEli5, 40); } },
    { id: 'move-chat', chapter: 1, title: 'Move Assistant Chat', body: 'Drag the grip at the top-right corner of Chat to the <strong>left side</strong> of the workspace. The destination lights up as you get close.', target: chatGrip, pad: 10, place: 'left', action: true,
      predicate: function () { var s = chatSurface(); return !!(s && s.visible && s.host !== T.state.snapshot.chat_host && s.host !== 'floating'); }, ack: 'The same Chat stays with you; only its place changed.',
      showMe: async function () { await T.demo.dragChatLeft(); } },
    { id: 'add-widget', chapter: 1, title: 'Add a widget', body: 'Click <strong>Add widget</strong> on the Home page, then choose <strong>Approval queue</strong>. Widgets keep useful Project information nearby.', target: function () { return catalogItem() && catalogItem().offsetParent ? catalogItem() : addWidgetBtn(); }, pad: 8, place: 'below', action: true, follow: true,
      predicate: function () { return !!widgetCard(); }, ack: 'Widgets keep useful Project information nearby without taking you away from the page you are using.',
      onEnter: function () { try { if (window.PM_PAGES && window.PM_PAGES.current !== 'dashboard') window.PM_PAGES.go('dashboard'); } catch (e) {} },
      showMe: async function () { var b = addWidgetBtn(); await T.demo.travelClick(b, 'Click'); var ok = await T.until(function () { return catalogItem() && catalogItem().offsetParent; }, 2500); if (!ok) return; await U.sleep(U.reduced() ? 10 : 500); T.relayout(); await T.demo.travelClick(catalogItem(), 'Choose'); } },
    { id: 'open-wizard', chapter: 2, title: 'Open the Planning Wizard', body: 'Click <strong>Planning Wizard</strong> in the top bar. Planning is where Puppet Master turns an idea into a plan you can check.', target: wizardTab, pad: 6, place: 'below', action: true,
      predicate: function () { return window.PM_PAGES && window.PM_PAGES.current === 'wizard'; }, ack: 'This is the Planning Wizard.',
      showMe: async function () { await T.demo.travelClick(wizardTab(), 'Click'); } },
    { id: 'practice-goal', chapter: 2, title: 'Plan a practice idea', body: 'Press <strong>Plan this</strong>. Puppet Master turns the sentence into outcomes it can check.', target: function () { return document.getElementById('pmft-goal'); }, pad: 10, place: 'below', action: true,
      predicate: function () { return T.fx.goalSubmitted && PR.stage !== 'goal'; }, ack: 'One sentence became three outcomes.',
      onEnter: function () { PR.stage = T.fx.goalSubmitted ? 'outcomes' : 'goal'; PR.mount(); setTimeout(T.relayout, 200); },
      showMe: async function () { await T.demo.travelClick($('[data-pmft="submit-goal"]'), 'Press'); } },
    { id: 'answer-question', chapter: 2, title: 'Answer one real question', body: 'Puppet Master asks only what changes the plan. Pick an answer. <strong>Why this matters</strong> explains the effect.', target: function () { return document.getElementById('pmft-question'); }, pad: 10, place: 'right', action: true,
      predicate: function () { return !!T.fx.answer; }, ack: 'Answered. That single choice shapes the plan.',
      onEnter: function () { PR.mount(); PR.stage = 'question'; PR.render(); setTimeout(T.relayout, 200); },
      showMe: async function () { var w = $('[data-pmft="why"]'); if (w) { await T.demo.travelClick(w, 'Read why'); await U.sleep(U.reduced() ? 20 : 1400); } var c = $('[data-pmft="choose"][data-choice="me"]'); await T.demo.travelClick(c, 'Choose'); } },
    { id: 'review-plan', chapter: 2, title: 'Review the plan', body: 'Outcomes, the decision you made, what Puppet Master assumed, and what is still open. Nothing has been built yet.', target: function () { return document.getElementById('pmft-boundary'); }, pad: 10, place: 'above', action: false, primary: 'Continue',
      onEnter: function () { PR.mount(); PR.stage = 'review'; PR.render(); T.fx.reviewSeen = true; setTimeout(T.relayout, 200); } },
    { id: 'edit-answer', chapter: 2, title: 'Change your answer', body: 'Press <strong>Edit</strong> on the decision and choose <strong>A few organizers</strong>. Watch which parts of the plan change. Everything else stays still.', target: function () { return document.getElementById('pmft-question') || $('#pmft-decisions [data-pid="d1"]'); }, pad: 10, place: 'right', action: true, follow: true,
      predicate: function () { return T.fx.answerChanged; }, ack: 'Only the affected parts moved: shared sign-in and organizer access appeared.',
      onEnter: function () { PR.mount(); if (PR.stage !== 'edit') { PR.stage = 'review'; PR.render(); } setTimeout(T.relayout, 200); },
      showMe: async function () { var e = $('[data-pmft="edit-answer"]'); if (e) { await T.demo.travelClick(e, 'Edit'); await U.sleep(U.reduced() ? 20 : 600); T.relayout(); } var other = T.fx.answer === 'organizers' ? 'me' : 'organizers'; var c = $('[data-pmft="choose"][data-choice="' + other + '"]'); await T.demo.travelClick(c, 'Choose'); } },
    { id: 'approval', chapter: 2, title: 'The approval boundary', body: 'That is the planning loop: describe the outcome, answer only the questions that matter, review the plan, then decide whether to begin. Nothing runs until you approve.', target: function () { return $('.pmft-p-approve'); }, pad: 10, place: 'above', action: false, primary: 'Finish tour',
      onEnter: function () { PR.stage = 'review'; PR.render(); setTimeout(T.relayout, 200); } }
  ];

  // ---- Show Me choreography: pre-cue, travel, arrival, settle ---------------------------------
  T.demo = {};
  T.demo.travelClick = async function (el, label) {
    if (!el) return false;
    var c = T.center(el);
    T.spotlight(el, { pad: 8, precue: true });
    T.pointerShow(P0().x, P0().y, null);
    await U.sleep(U.reduced() ? 10 : 260);
    T.pointerLabel(label);
    await T.pointerMove(c.x, c.y, U.reduced() ? 1 : Math.max(500, Math.min(1100, Math.hypot(c.x - P0().x, c.y - P0().y) * 1.6)));
    if (T.showMeCancelled) return false;
    T.arrive();
    await U.sleep(U.reduced() ? 10 : 260);
    await T.pointerPress();
    try { el.click(); } catch (e) {}
    await U.sleep(U.reduced() ? 10 : 200);
    return true;
  };
  function P0() { var r = card.rect(); return { x: r.x + r.w / 2, y: r.y + r.h }; }
  var card = { rect: function () { var c = document.getElementById('pmft-card'); var r = c.getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height }; } };
  T.demo.dragChatLeft = async function () {
    var grip = chatGrip(), rootEl = homeRoot(); if (!grip || !rootEl) return false;
    var g = T.center(grip), b = rootEl.getBoundingClientRect();
    var dest = { x: b.left + 18, y: b.top + Math.min(b.height * .45, 320) };
    T.spotlight(grip, { pad: 10, precue: true });
    T.pointerShow(P0().x, P0().y);
    await U.sleep(U.reduced() ? 10 : 260);
    T.pointerLabel('Grab');
    await T.pointerMove(g.x, g.y, U.reduced() ? 1 : 900); if (T.showMeCancelled) return false;
    T.arrive(); await U.sleep(U.reduced() ? 10 : 240);
    pointer_down(); T.pev('pointerdown', g.x, g.y, grip);
    T.pointerLabel('Drag to the left edge');
    T.spotlight(dockLeft() || rootEl, { pad: 0 });
    var steps = U.reduced() ? 2 : 1;
    await T.pointerMove(dest.x, dest.y, U.reduced() ? 1 : 1500, function (x, y) { T.pev('pointermove', x, y); });
    if (T.showMeCancelled) { T.pev('pointercancel', dest.x, dest.y); pointer_up(); return false; }
    T.pointerLabel('Drop');
    await U.sleep(U.reduced() ? 10 : 520);
    T.pev('pointerup', dest.x, dest.y); pointer_up();
    await U.sleep(U.reduced() ? 10 : 400);
    return true;
    function pointer_down() { document.querySelector('.pmft-pointer').classList.add('is-drag'); }
    function pointer_up() { document.querySelector('.pmft-pointer').classList.remove('is-drag'); }
  };
})();
