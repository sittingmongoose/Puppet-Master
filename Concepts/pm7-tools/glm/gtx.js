/* ============================================================
   GLM Guided Tour "gtx" — First Night
   Learn by doing, over the real shell. Show Me = same handler.
   Deterministic fixtures only — zero provider calls, zero usage.
   ============================================================ */
(function () {
  'use strict';
  var root, hole, ring, slate, pointer, ack, actEl, titleEl, bodyEl, showmeBtn, nextBtn, ticksEl, resumeBtn, replayBtn, openCard, ping, actCard;

  var state = {
    open: false, idx: 0, showing: false, done: false,
    snapshot: null, enteredAt: 0
  };

  var FIXTURES = {
    prompt: 'What happens before Puppet Master changes my files?',
    teacher: 'Before work begins, Puppet Master turns your request into a plan. You can review the important choices, correct anything that looks wrong, and decide when to begin. Your Project permissions still control what the work may change.',
    eli5: 'First, Puppet Master writes down what it thinks you want. You can fix the plan before anything starts. It waits for your decision to begin.',
    goal: 'Create a simple website for my neighborhood book club. It should show the next meeting, the current book, and how to join.',
    outcomes: ['Visitors can see the next meeting.', 'Visitors can see the current book.', 'New members can learn how to join.'],
    question: 'Who should be able to update the meeting and book?',
    why: 'This decides whether the site needs shared sign-in and editing. Answering now keeps Puppet Master from planning the wrong kind of site.'
  };

  function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  function q(sel, ctx) { return (ctx || document).querySelector(sel); }
  function qa(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }
  function reduced() { return document.documentElement.getAttribute('data-motion') === 'reduced' || (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches); }

  /* ---------------- steps ---------------- */
  var STEPS = [
    { act: 1, of: 3, title: 'Ask anything', body: 'Assistant Chat is where you ask Puppet Master for help. Teacher explains the screen you are on, an unfamiliar term, or why a choice matters — no account needed.', target: function () { return chatPanel(); },
      enter: async function () { await ensureChat(); },
      expect: function () { var ta = q('.pm6-chat-input', chatPanel()); return !!(ta && ta.value.trim().length > 3); },
      showme: async function () { var t = chatPanel(); await pointerTravel(t, { x: .16, y: .22 }); await pressAt(t, { x: .16, y: .22 }); } },

    { act: 1, of: 3, title: 'Send the example question', body: 'Type or paste the suggested question, then press send. This guided example does not use your AI plan.', target: function () { var p = chatPanel(); var ta = q('.pm6-chat-input', p); if (ta) ta.scrollIntoView({ block: 'nearest', behavior: reduced() ? 'auto' : 'smooth' }); return ta || p; },
      enter: async function () {
        await sleep(300);
        hookRealSend();
      },
      expect: function () { return !!findTeacherBubble(); },
      showme: async function () {
        await typeChat(FIXTURES.prompt);
        await sleep(220);
        var btn = q('.pm6-chat-send', chatPanel());
        if (btn) { await pointerTravel(btn, { x: .5, y: .5 }); pressAt(btn, { x: .5, y: .5 }); btn.click(); }
        await sleep(700);
        var body = appendGuidedBubble('assistant', '', 'teacher');
        await streamText(body, FIXTURES.teacher);
      },
      ack: 'Teacher answers from your screen — no account needed.' },

    { act: 1, of: 3, title: 'Make it simpler with ELI5', body: 'ELI5 rewrites the last answer in plainer words. Find the ELI5 pill near the composer and switch it on.', target: function () { var p = chatPanel(); var e = q('.toggle-eli5', p); if (e) e.scrollIntoView({ block: 'nearest', behavior: reduced() ? 'auto' : 'smooth' }); return e; },
      enter: async function () { await sleep(350); },
      expect: function () { var e = q('.toggle-eli5', chatPanel()); return e && e.classList.contains('active'); },
      showme: async function () { var e = q('.toggle-eli5', chatPanel()); if (e) { await pointerTravel(e, { x: .5, y: .5 }); pressAt(e, { x: .5, y: .5 }); e.click(); } },
      ack: 'Same answer, simpler words.' },

    { act: 2, of: 3, title: 'Park the chat where you like', body: 'Assistant Chat docks to any side of the workspace and stays with you while you work. Move it — the same chat, a new place.', target: function () { return chatPanel(); },
      enter: async function () { state.chatHost = currentChatHost(); },
      expect: function () { return state.chatHost != null && currentChatHost() !== state.chatHost; },
      showme: async function () {
        var from = currentChatHost();
        var to = from === 'dock_left' ? 'dock_right' : 'dock_left';
        var done = false;
        try {
          var panel = chatPanel();
          var rect = panel.getBoundingClientRect();
          var handle = q('.pm6-chat-header', panel) || q('header', panel) || panel;
          PM_HOME_WORKSPACE.beginDrag(handle);
          var steps = reduced() ? 2 : 8;
          var tx = to === 'dock_left' ? 80 : innerWidth - 140;
          for (var i = 1; i <= steps; i++) {
            var x = (rect.left + 40) + (tx - rect.left - 40) * (i / steps);
            PM_HOME_WORKSPACE.updateDrag({ clientX: x, clientY: rect.top + 12, preventDefault: function () {}, stopPropagation: function () {} });
            await sleep(reduced() ? 30 : 60);
          }
          PM_HOME_WORKSPACE.commitDrop();
          done = true;
        } catch (e) {}
        if (!done) { try { PM_HOME_WORKSPACE.moveSurface('chat', to); } catch (e2) {} }
        await sleep(520);
      },
      ack: 'The chat moved with you — only its place changed.' },

    { act: 2, of: 3, title: 'Keep a widget nearby', body: 'Widgets hold useful project info at a glance. Add the Project overview widget to your board.', target: function () { var b = q('.pm6-dash-edit-btn'); if (b) b.scrollIntoView({ block: 'center', behavior: reduced() ? 'auto' : 'smooth' }); return b; },
      enter: async function () { try { PM_PAGES.go('dashboard'); } catch (e) {} await sleep(360); },
      expect: function () { return !!q('[data-widget-host="project_overview"], .pm6-widget[data-widget="project_overview"]'); },
      showme: async function () {
        var fab = q('.pm6-dash-edit-btn');
        if (fab) { await pointerTravel(fab, { x: .5, y: .5 }); pressAt(fab, { x: .5, y: .5 }); fab.click(); }
        await sleep(650);
        var card = q('.pm6-catalog-card[data-widget="project_overview"]');
        if (card) { await pointerTravel(card, { x: .5, y: .5 }); pressAt(card, { x: .5, y: .5 }); card.click(); }
      },
      ack: 'Glanceable, movable, removable — your board, your call.' },

    { act: 3, of: 3, title: 'Meet the Planning Wizard', body: 'Planning Wizard turns a rough idea into a plan you can inspect before any work begins — the crown jewel. Open it with me.', target: function () { return q('.page-tab[data-page="wizard"]'); },
      enter: async function () { state.wizardMsgs = -1; },
      expect: function () { try { return PM_PAGES.current === 'wizard'; } catch (e) { return !!q('.page-wizard.active'); } },
      showme: async function () { var tab = q('.page-tab[data-page="wizard"]'); if (tab) { await pointerTravel(tab, { x: .5, y: .5 }); pressAt(tab, { x: .5, y: .5 }); tab.click(); } try { PM_PAGES.go('wizard'); } catch (e) {} await sleep(640); } },

    { act: 3, of: 3, title: 'Describe what you want', body: 'One sentence is enough. Describe the outcome — the wizard asks only the questions that change the result.', target: function () { var ta = q('.page-wizard textarea'); if (ta) ta.scrollIntoView({ block: 'center', behavior: reduced() ? 'auto' : 'smooth' }); return ta; },
      enter: async function () { state.wizardMsgs = wizardBubbleCount(); },
      expect: function () { return wizardBubbleCount() > (state.wizardMsgs || 0); },
      showme: async function () {
        var ta = q('.page-wizard textarea');
        if (ta) {
          await pointerTravel(ta, { x: .5, y: .6 }); pressAt(ta, { x: .5, y: .6 });
          ta.focus(); ta.value = FIXTURES.goal; ta.dispatchEvent(new Event('input', { bubbles: true }));
          await sleep(420);
        }
        var btn = q('.page-wizard .pm6-chat-send-embed, .page-wizard .pm6-chat-send');
        if (btn) { await pointerTravel(btn, { x: .5, y: .5 }); pressAt(btn, { x: .5, y: .5 }); btn.click(); }
        await sleep(800);
      },
      ack: 'An idea became a plan the wizard can work with.' },

    { act: 3, of: 3, title: 'Give the wizard what it needs', body: 'The wizard reads your project before planning. Attach where the work lives — a folder is enough for this tour.', target: function () { var c = q('.page-wizard .pm6-wiz-attach-card'); if (c) c.scrollIntoView({ block: 'center', behavior: reduced() ? 'auto' : 'smooth' }); return c; },
      enter: async function () { state.wizardAttached = false; listenWizardInteraction(); },
      expect: function () { return state.wizardAttached || !!q('.page-wizard .pm6-wiz-attach-card.selected, .page-wizard .pm6-wiz-attach-card.picked, .page-wizard .pm6-wiz-attach-card[aria-pressed="true"], .page-wizard .pm6-wiz-stage:not(.pm6-wiz-stage-intake).active'); },
      showme: async function () { var c = q('.page-wizard .pm6-wiz-attach-card'); if (c) { await pointerTravel(c, { x: .5, y: .5 }); pressAt(c, { x: .5, y: .5 }); c.click(); } await sleep(700); },
      ack: 'Attached — the wizard can read before it plans.' },

    { act: 3, of: 3, title: 'Watch an idea become a plan', body: 'This is the heart of Puppet Master. Answer the one question that changes what gets built — and see the plan react to your answer.', target: function () { return document.getElementById('pmx-gt-practice'); },
      enter: async function () { PRACTICE.mount(); await sleep(reduced() ? 200 : 1100); },
      expect: function () { return !!document.body.getAttribute('data-gt-practice-answered'); },
      showme: async function () {
        var row = q('.gtx-qrow[data-answer="organizers"]');
        if (row) { await pointerTravel(row, { x: .18, y: .5 }); pressAt(row, { x: .18, y: .5 }); row.click(); }
      },
      ack: 'One answer — one consequence. The outcomes never moved.' },

    { act: 3, of: 3, title: 'Change your answer, watch it react', body: 'Plans are not fragile. Change the answer and watch only the consequence change — the plan stays whole.', target: function () { return document.getElementById('pmx-gt-edit'); },
      enter: async function () { await sleep(250); },
      expect: function () { return document.body.getAttribute('data-gt-practice-latest') !== document.body.getAttribute('data-gt-practice-answered'); },
      showme: async function () {
        var edit = document.getElementById('pmx-gt-edit');
        if (edit) { await pointerTravel(edit, { x: .3, y: .5 }); pressAt(edit, { x: .3, y: .5 }); edit.click(); }
        await sleep(420);
        var row = q('.gtx-qrow[data-answer="me"]') || q('.gtx-qrow:not([aria-pressed="true"])');
        if (row) { await pointerTravel(row, { x: .18, y: .5 }); pressAt(row, { x: .18, y: .5 }); row.click(); }
      },
      ack: 'That is the planning loop: describe, answer, review, decide.' },

    { act: 3, of: 3, title: 'The boundary before building', body: 'Nothing has been built. The real wizard waits for your approval before any work begins — check outcomes, decisions, and anything uncertain, then decide. The practice panel steps aside.', target: function () { var b = q('.page-wizard .pm6-wiz-btn.primary, .page-wizard .pm6-wiz-bigbtn'); if (b) b.scrollIntoView({ block: 'center', behavior: reduced() ? 'auto' : 'smooth' }); return b; },
      enter: async function () { PRACTICE.unmount(); await sleep(320); },
      expect: function () { return false; /* terminal */ },
      showme: null,
      terminal: true }
  ];

  function currentChatHost() {
    try {
      var l = PM_HOME_WORKSPACE.layout;
      var s = (l.surfaces || []).filter(Boolean).find(function (x) { return x.domain_ref && x.domain_ref.chat_surface_id === 'chat'; });
      return s ? (s.host || 'dock_right') : null;
    } catch (e) { return null; }
  }
  function wizardBubbleCount() {
    var w = q('.page-wizard');
    if (!w) return 0;
    return qa('.pm6-chat-msg, .message, .pm6-chat-embed-msg', w).length;
  }
  var wizardListener = null;
  function listenWizardInteraction() {
    if (wizardListener) return;
    wizardListener = function (ev) {
      var w = q('.page-wizard');
      if (w && w.contains(ev.target)) {
        var card = ev.target.closest('.pm6-wiz-attach-card, .pm6-wiz-btn, .pm6-wiz-bigbtn, button, input, textarea, select');
        if (card) state.wizardAttached = true;
      }
    };
    document.addEventListener('click', wizardListener, true);
  }

  function findTeacherBubble() { return q('[data-gt-teacher]', chatPanel()); }
  function chatPanel() { return q('#chatPanel') || q('#floatingChat'); }
  function chatStream() { return q('.pm6-chat-stream', chatPanel()) || q('.message-stream', chatPanel()); }

  async function ensureChat() {
    var p = chatPanel();
    if (p && !p.offsetParent) {
      /* the chat tab is hidden — surface it through the real workspace owner */
      try { PM_HOME_WORKSPACE.setSurfaceVisible('chat', true); } catch (e) {}
    }
  }

  /* append a labeled guided-example bubble into the REAL chat stream */
  function appendGuidedBubble(role, text, tag) {
    var stream = chatStream();
    if (!stream || !window.PM6_CHAT_UI) return null;
    var host = document.createElement('div');
    host.setAttribute('data-gt-teacher', tag || 'teacher');
    host.innerHTML = PM6_CHAT_UI.bubbleHtml({ role: role, text: '' });
    var body = host.querySelector('.msg-body') || host.firstElementChild;
    if (body) body.setAttribute('data-gt-label', tag === 'eli5' ? 'Guided example · ELI5' : 'Guided example · Teacher');
    if (body) body.insertAdjacentHTML('afterbegin', '<em style="display:block;font-size:10px;font-style:normal;letter-spacing:.08em;text-transform:uppercase;opacity:.62;margin-bottom:3px">' + (tag === 'eli5' ? 'Guided example · ELI5' : 'Guided example · Teacher') + '</em>');
    stream.appendChild(host);
    stream.scrollTop = stream.scrollHeight;
    return body || host;
  }

  /* stream text into a bubble over ~1.1s (reduced motion: instant) */
  async function streamText(el, text) {
    if (!el) return;
    if (reduced()) { el.appendChild(document.createTextNode(text)); return; }
    var target = el.childNodes[el.childNodes.length - 1];
    var span = document.createElement('span');
    el.appendChild(span);
    var i = 0, step = Math.max(2, Math.round(text.length / 64));
    while (i < text.length) {
      span.textContent += text.slice(i, i + step);
      i += step;
      await sleep(17);
    }
  }

  /* rewrite the teacher bubble to ELI5 copy with a soft crossfade */
  async function rewriteEli5() {
    var b = findTeacherBubble();
    if (!b || b.getAttribute('data-gt-eli5') === '1') return;
    b.setAttribute('data-gt-eli5', '1');
    var label = b.querySelector('em');
    if (label) label.textContent = 'Guided example · ELI5';
    var span = b.querySelectorAll('span')[1] || b.lastElementChild;
    if (!span) return;
    if (reduced()) { span.textContent = FIXTURES.eli5; return; }
    span.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 160, fill: 'forwards' }).finished.catch(function () {});
    await sleep(180);
    span.textContent = FIXTURES.eli5;
    span.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 240, fill: 'forwards' }).finished.catch(function () {});
  }

  /* real composer typing */
  async function typeChat(text) {
    var ta = q('.pm6-chat-input', chatPanel());
    if (!ta) return;
    ta.focus();
    if (reduced()) { ta.value = text; ta.dispatchEvent(new Event('input', { bubbles: true })); return; }
    ta.value = '';
    var i = 0, step = Math.max(3, Math.round(text.length / 26));
    while (i < text.length) {
      ta.value += text.slice(i, i + step);
      i += step;
      ta.dispatchEvent(new Event('input', { bubbles: true }));
      await sleep(34);
    }
  }
  function clickRealSend() {
    var btn = q('.pm6-chat-send', chatPanel()) || q('.chat-send-btn', chatPanel());
    if (btn) { btn.click(); return true; }
    return false;
  }
  function chatMsgCount() { return qa('.pm6-chat-msg, .message', chatStream()).length; }

  var sendHookInstalled = false;
  function hookRealSend() {
    if (sendHookInstalled) return;
    sendHookInstalled = true;
    var fired = false;
    async function reply() {
      if (fired || findTeacherBubble()) return;
      fired = true;
      await sleep(820);
      var body = appendGuidedBubble('assistant', '', 'teacher');
      await streamText(body, FIXTURES.teacher);
    }
    document.addEventListener('click', function (ev) {
      var btn = ev.target.closest && ev.target.closest('.pm6-chat-send, .chat-send-btn');
      if (btn && chatPanel() && chatPanel().contains(btn)) reply();
    }, true);
    document.addEventListener('keydown', function (ev) {
      if (ev.key !== 'Enter' || ev.shiftKey) return;
      var ta = ev.target.closest && ev.target.closest('.pm6-chat-input');
      if (ta && chatPanel() && chatPanel().contains(ta)) reply();
    }, true);
  }

  /* ---------------- spotlight ---------------- */
  var trackRaf = 0, currentTarget = null;
  function rectOf(el) {
    var r = el.getBoundingClientRect();
    var pad = Math.min(18, Math.max(10, Math.min(r.width, r.height) * .18));
    return { x: r.left - pad, y: r.top - pad, w: r.width + pad * 2, h: r.height + pad * 2 };
  }
  function placeSpotlight(el) {
    var r = rectOf(el);
    var rw = Math.min(r.w, innerWidth - 16), rh = Math.min(r.h, innerHeight - 16);
    hole.style.left = r.x + 'px'; hole.style.top = r.y + 'px';
    hole.style.width = rw + 'px'; hole.style.height = rh + 'px';
    ring.style.left = (r.x - 5) + 'px'; ring.style.top = (r.y - 5) + 'px';
    ring.style.width = (rw + 10) + 'px'; ring.style.height = (rh + 10) + 'px';
    ring.style.borderWidth = 'clamp(2px,.25vmin,3px)';
  }
  function track() {
    cancelAnimationFrame(trackRaf);
    (function loop() {
      if (currentTarget && document.contains(currentTarget)) placeSpotlight(currentTarget);
      trackRaf = requestAnimationFrame(loop);
    })();
  }
  function placeSlate(el) {
    slate.className = 'gtx-slate';
    if (!el) return;
    var r = el.getBoundingClientRect();
    var cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    var slateW = Math.min(520, innerWidth - 40), slateH = 190;
    var dx = cx < innerWidth / 2 ? 1 : -1; /* slate to the side with room */
    var dy = cy < innerHeight / 2 ? 1 : -1;
    /* prefer bottom; go top if target occupies the bottom band */
    if (r.bottom + slateH + 40 > innerHeight && r.top - slateH - 24 > 0) {
      slate.classList.add(dx < 0 ? 'pos-tl' : 'pos-tr');
    } else if (r.left + r.width + slateW + 40 > innerWidth && r.right - slateW - 24 > 0) {
      slate.classList.add('pos-bl');
    }
  }

  /* ---------------- pointer (Show Me) ---------------- */
  async function pointerTravel(el, focus) {
    if (!el) return;
    var r = el.getBoundingClientRect();
    var tx = r.left + r.width * (focus ? focus.x : .5);
    var ty = r.top + r.height * (focus ? focus.y : .5);
    pointer.classList.add('on');
    if (reduced()) {
      pointer.style.left = (tx - 17) + 'px'; pointer.style.top = (ty - 3) + 'px';
      await sleep(160);
      return { tx: tx, ty: ty };
    }
    /* entrance: fade in slightly above target */
    var sx = tx + 120, sy = ty - 90;
    pointer.style.left = (sx - 17) + 'px'; pointer.style.top = (sy - 3) + 'px';
    await sleep(40);
    var anim = pointer.animate(
      [
        { left: (sx - 17) + 'px', top: (sy - 3) + 'px', offset: 0 },
        { left: (sx - 17 - 14) + 'px', top: (sy - 3 - 10) + 'px', offset: .18 }, /* anticipation pull-back */
        { left: (tx - 17) + 'px', top: (ty - 3) + 'px', offset: 1 }
      ],
      { duration: 760, easing: 'cubic-bezier(.3,.1,.25,1)' }
    );
    await anim.finished.catch(function () {});
    pointer.style.left = (tx - 17) + 'px'; pointer.style.top = (ty - 3) + 'px';
    await sleep(120);
    return { tx: tx, ty: ty };
  }
  async function pressAt(el, focus) {
    pointer.classList.add('press');
    firePing();
    try { el.focus && el.focus({ preventScroll: true }); } catch (e) {}
    await sleep(140);
    pointer.classList.remove('press');
    await sleep(180);
    pointer.classList.remove('on');
  }
  function firePing() {
    if (!ping) return;
    var r = pointer.getBoundingClientRect();
    ping.style.left = (r.left + r.width / 2 - 22) + 'px';
    ping.style.top = (r.top + 4 - 22) + 'px';
    ping.classList.remove('go'); void ping.offsetWidth; ping.classList.add('go');
  }
  async function showActCard(act, label) {
    if (!actCard) return;
    actCard.innerHTML = '<b>Act ' + act + '</b>' + label;
    actCard.classList.add('on');
    await sleep(1500);
    actCard.classList.remove('on');
    await sleep(280);
  }

  /* ---------------- ack ---------------- */
  var ackTimer = 0;
  function showAck(text) {
    ack.textContent = text;
    ack.classList.add('on');
    clearTimeout(ackTimer);
    ackTimer = setTimeout(function () { ack.classList.remove('on'); }, 2600);
  }

  /* ---------------- render step ---------------- */
  var lastAct = 0;
  async function showStep(i) {
    if (i >= STEPS.length) { finishTour(true); return; }
    state.idx = i;
    var st = STEPS[i];
    var actChanged = lastAct && lastAct !== st.act;
    lastAct = st.act;
    if (actChanged) await showActCard(st.act, ({ 2: 'Make the workspace yours', 3: 'Plan before building' })[st.act] || '');
    actEl.textContent = 'Act ' + st.act + ' of 3';
    slate.classList.remove('swap'); void slate.offsetWidth; slate.classList.add('swap');
    titleEl.textContent = st.title;
    bodyEl.textContent = st.body;
    ticksEl.innerHTML = STEPS.map(function (s, j) {
      return '<i class="' + (j < i ? 'on' : '') + '"></i>';
    }).join('');
    showmeBtn.hidden = !st.showme;
    nextBtn.hidden = !(st.terminal || st.expect() );
    nextBtn.textContent = st.terminal ? 'Finish the tour' : 'Continue';
    if (st.enter) { await st.enter(); }
    var t = st.target && st.target();
    currentTarget = (t && document.contains(t)) ? t : null;
    if (currentTarget) { placeSpotlight(currentTarget); placeSlate(currentTarget); }
    track();
    watchExpect(st);
  }

  var watchTimer = 0;
  function watchExpect(st) {
    clearInterval(watchTimer);
    if (!st.expect || st.terminal) return;
    watchTimer = setInterval(function () {
      if (!state.open) { clearInterval(watchTimer); return; }
      if (state.showing) return;
      try {
        if (st.expect()) {
          clearInterval(watchTimer);
          if (state.idx === 2) rewriteEli5();
          if (st.ack) showAck(st.ack);
          nextBtn.hidden = false;
          nextBtn.textContent = 'Continue';
        }
      } catch (e) {}
    }, 320);
  }

  async function doShowMe() {
    var st = STEPS[state.idx];
    if (!st || !st.showme || state.showing) return;
    state.showing = true;
    showmeBtn.setAttribute('aria-disabled', 'true');
    try { await st.showme(); } catch (e) { }
    await sleep(600);
    state.showing = false;
    showmeBtn.removeAttribute('aria-disabled');
    try { if (st.expect && st.expect()) { if (st.ack) showAck(st.ack); nextBtn.hidden = false; } } catch (e) {}
  }

  function next() {
    var st = STEPS[state.idx];
    if (st && st.terminal) { finishTour(true); return; }
    showStep(state.idx + 1);
  }

  /* ---------------- workspace snapshot/restore ---------------- */
  function snapshotWorkspace() {
    var snap = { page: null, chatHost: currentChatHost(), eli5: false };
    try { snap.page = PM_PAGES.current; } catch (e) {}
    var e = q('.toggle-eli5', chatPanel());
    snap.eli5 = !!(e && e.classList.contains('active'));
    return snap;
  }
  function restoreWorkspace(snap, keep) {
    try { if (!keep && snap.chatHost && currentChatHost() !== snap.chatHost) PM_HOME_WORKSPACE.moveSurface('chat', snap.chatHost); } catch (e) {}
    try {
      if (!keep) {
        var e = q('.toggle-eli5', chatPanel());
        var nowActive = !!(e && e.classList.contains('active'));
        if (e && nowActive !== snap.eli5) e.click();
      }
    } catch (e) {}
    try { if (!keep && snap.page) PM_PAGES.go(snap.page); } catch (e) {}
  }

  /* ---------------- wizard guided practice (deterministic fixture) ---------------- */
  var PRACTICE = {
    el: null, answer: null, edited: false,
    outcomes: ['Visitors can see the next meeting.', 'Visitors can see the current book.', 'New members can learn how to join.'],
    mount: function () {
      this.unmount();
      var el = document.createElement('div');
      el.className = 'gtx-practice';
      el.id = 'pmx-gt-practice';
      el.setAttribute('role', 'dialog');
      el.setAttribute('aria-label', 'Guided practice: from idea to plan');
      el.innerHTML =
        '<div class="gtx-practice-head"><span class="gtx-practice-chip">Guided practice</span>'
        + '<span class="gtx-practice-sub">local example · uses none of your AI plan</span></div>'
        + '<h3>Your idea became three outcomes</h3>'
        + '<p class="gtx-practice-lede">The wizard turns "a website for my neighborhood book club" into things it can check:</p>'
        + '<div class="gtx-outcomes">' + this.outcomes.map(function (o, i) {
            return '<div class="gtx-outcome" data-outcome="' + i + '"><span class="gtx-ok">'
              + '<svg viewBox="0 0 12 12"><path d="M2 6.2l2.6 2.7L10 3.4" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/></svg>'
              + '</span>' + o + '</div>';
          }).join('') + '</div>'
        + '<div class="gtx-question" id="pmx-gt-question">'
        + '<h4>Who should be able to update the meeting and book?</h4>'
        + [['me', 'Only me'], ['organizers', 'A few organizers'], ['unsure', 'I&rsquo;m not sure yet']].map(function (q) {
            return '<button type="button" class="gtx-qrow" data-answer="' + q[0] + '"><span class="gtx-dot"></span>' + q[1] + '</button>';
          }).join('')
        + '<div class="gtx-why"><b>Why this matters:</b> this decides whether the site needs shared sign-in and editing. Answering now keeps Puppet Master from planning the wrong kind of site.</div>'
        + '</div>'
        + '<div class="gtx-consequence" id="pmx-gt-consequence" hidden>'
        + '<span class="gtx-cq" id="pmx-gt-cq-icon"></span><div id="pmx-gt-cq-body"></div></div>'
        + '<div class="gtx-practice-actions">'
        + '<button type="button" class="gtx-practice-edit" id="pmx-gt-edit" hidden>Change my answer</button>'
        + '<span class="gtx-practice-note" id="pmx-gt-note"></span></div>';
      root.appendChild(el);
      this.el = el;
      requestAnimationFrame(function () { el.classList.add('on'); });
      var self = this;
      el.addEventListener('click', function (ev) {
        var row = ev.target.closest && ev.target.closest('.gtx-qrow');
        if (row) { self.setAnswer(row.getAttribute('data-answer'), row); return; }
        if (ev.target.closest && ev.target.closest('#pmx-gt-edit')) { self.enterEditMode(); }
      });
      /* outcomes stagger in */
      el.querySelectorAll('.gtx-outcome').forEach(function (o, i) {
        setTimeout(function () { o.classList.add('on'); }, reduced() ? 30 : 260 + i * 240);
      });
    },
    setAnswer: function (v, rowEl) {
      
      if (this.answer === v) return;
      var first = this.answer == null;
      this.answer = v;
      this.el.querySelectorAll('.gtx-qrow').forEach(function (r) { r.setAttribute('aria-pressed', String(r === rowEl)); });
      var cons = this.el.querySelector('#pmx-gt-consequence');
      var icon = this.el.querySelector('#pmx-gt-cq-icon');
      var body = this.el.querySelector('#pmx-gt-cq-body');
      var note = this.el.querySelector('#pmx-gt-note');
      var edit = this.el.querySelector('#pmx-gt-edit');
      var content = v === 'me'
        ? '<b>Simplest site.</b> One sign-in — yours. The plan skips shared accounts entirely.'
        : v === 'unsure'
        ? '<b>Plan keeps it open.</b> The wizard notes this as an unresolved choice and plans the simplest safe version.'
        : '<b>Site needs shared access.</b> The plan adds organizer sign-in and editing — two extra outcomes appear.';
      var svg = v === 'organizers'
        ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="9" cy="8" r="3.2"/><path d="M3.5 19c.6-3 2.8-4.6 5.5-4.6s4.9 1.6 5.5 4.6"/><circle cx="16.5" cy="9" r="2.6"/><path d="M15 14.6c2.6.2 4.6 1.7 5.2 4.4"/></svg>'
        : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="5" y="10.5" width="14" height="9" rx="2"/><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5"/><circle cx="12" cy="15" r="1.4" fill="currentColor" stroke="none"/></svg>';
      if (cons.hidden) {
        cons.hidden = false;
        icon.innerHTML = svg;
        body.innerHTML = content;
        cons.classList.add('on');
        note.textContent = 'Only the affected parts changed — the outcomes stayed still.';
        edit.hidden = false;
      } else {
        this.edited = true;
        cons.classList.remove('on');
        cons.classList.add('swap');
        var self = this;
        setTimeout(function () {
          icon.innerHTML = svg;
          body.innerHTML = content;
          cons.classList.remove('swap');
          void cons.offsetWidth;
          cons.classList.add('on');
        }, reduced() ? 40 : 170);
        note.textContent = 'Answer changed — consequence moved, plan stayed whole.';
      }
      if (first) document.body.setAttribute('data-gt-practice-answered', v);
      document.body.setAttribute('data-gt-practice-latest', v);
    },
    enterEditMode: function () {
      var q = this.el && this.el.querySelector('#pmx-gt-question');
      if (!q) return;
      q.scrollIntoView({ block: 'nearest', behavior: reduced() ? 'auto' : 'smooth' });
      var first = q.querySelector('.gtx-qrow:not([aria-pressed="true"])');
      if (first) { try { first.focus({ preventScroll: true }); } catch (e) {} }
    },
    unmount: function () {
      var el = document.getElementById('pmx-gt-practice');
      if (el) el.remove();
      this.el = null; this.answer = null; this.edited = false;
      document.body.removeAttribute('data-gt-practice-answered');
      document.body.removeAttribute('data-gt-practice-latest');
    }
  };

  /* ---------------- lifecycle ---------------- */
  function openTour() {
    state.open = true;
    state.done = false;
    state.snapshot = snapshotWorkspace();
    root.hidden = false;
    document.documentElement.setAttribute('data-pm7-guided-tour-open', 'true');
    resumeBtn.hidden = true;
    requestAnimationFrame(function () { root.setAttribute('data-open', 'true'); });
    showStep(0);
  }
  function finishTour(complete) {
    state.open = false;
    root.setAttribute('data-open', 'false');
    document.documentElement.removeAttribute('data-pm7-guided-tour-open');
    cancelAnimationFrame(trackRaf);
    clearInterval(watchTimer);
    setTimeout(function () {
      root.hidden = true;
      currentTarget = null;
    }, 380);
    restoreWorkspace(state.snapshot, false);
    replayBtn.hidden = false;
    showAck(complete ? 'That is the planning loop — describe, answer, review, decide.' : 'Tour closed — replay it anytime from Settings.');
  }

  /* ---------------- opening card ---------------- */
  async function opening() {
    openCard.classList.add('on');
    await sleep(reduced() ? 900 : 2400);
    openCard.classList.add('iris');
    await sleep(reduced() ? 120 : 460);
    openCard.classList.remove('on', 'iris');
    await sleep(160);
  }

  /* ---------------- boot ---------------- */
  function init() {
    root = document.getElementById('pmx-tour');
    if (!root || root.dataset.bound) return;
    root.dataset.bound = '1';
    hole = root.querySelector('.gtx-hole');
    ring = root.querySelector('.gtx-ring');
    slate = root.querySelector('.gtx-slate');
    pointer = root.querySelector('.gtx-pointer');
    ack = root.querySelector('.gtx-ack');
    actEl = root.querySelector('#pmx-gt-act');
    titleEl = root.querySelector('#pmx-gt-title');
    bodyEl = root.querySelector('#pmx-gt-body');
    showmeBtn = root.querySelector('#pmx-gt-showme');
    nextBtn = root.querySelector('#pmx-gt-next');
    ticksEl = root.querySelector('#pmx-gt-ticks');
    resumeBtn = document.getElementById('pm7-guided-tour-resume');
    replayBtn = document.getElementById('pm7-guided-tour-replay');

    ping = document.createElement('div');
    ping.className = 'gtx-ping'; root.appendChild(ping);
    actCard = document.createElement('div');
    actCard.className = 'gtx-actcard'; root.appendChild(actCard);
    pointer.insertAdjacentHTML('beforeend', '<span class="gtx-trail"></span><span class="gtx-trail t2"></span>');

    if (!document.getElementById('pmx-gt-open')) {
      openCard = document.createElement('div');
      openCard.id = 'pmx-gt-open'; openCard.className = 'gtx-open';
      openCard.innerHTML = '<div class="gtx-open-curtain" aria-hidden="true"></div>'
        + '<h2>' + 'Let’s make Puppet Master feel familiar.'.split(' ').map(function (w, i) { return '<span class="gtx-ow" style="--wi:' + i + '">' + w + '</span>'; }).join(' ') + '</h2>'
        + '<p>You’ll try a few real actions — ask, arrange, plan. This guided example does not change your files or use your AI plan.</p>'
        + '<div class="gtx-acts"><span style="--ai:0"><b>Act 1</b>Ask anything</span><span style="--ai:1"><b>Act 2</b>Arrange the stage</span><span style="--ai:2"><b>Act 3</b>Plan the show</span></div>';
      root.appendChild(openCard);
    } else openCard = document.getElementById('pmx-gt-open');

    var skipBtn = root.querySelector('[data-ui-action-id="ui.guided_tour.skip"]');
    if (skipBtn) skipBtn.addEventListener('click', function () { finishTour(false); });
    if (showmeBtn) showmeBtn.addEventListener('click', doShowMe);
    if (nextBtn) nextBtn.addEventListener('click', next);
    if (resumeBtn) resumeBtn.addEventListener('click', openTour);
    if (replayBtn) replayBtn.addEventListener('click', openTour);

    window.PM7_GUIDED_TOUR = {
      schema_id: 'pm.glm.guided_tour.v1',
      start: async function () { await opening(); openTour(); return snapshotApi(); },
      next: next,
      skip: function () { finishTour(false); return snapshotApi(); },
      back: function () { if (state.idx > 0) showStep(state.idx - 1); return snapshotApi(); },
      resume: openTour,
      replay: async function () { await opening(); openTour(); return snapshotApi(); },
      snapshot: snapshotApi
    };
  }
  function snapshotApi() {
    return { open: state.open, step: state.idx, steps: STEPS.length, concept_only: true };
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
