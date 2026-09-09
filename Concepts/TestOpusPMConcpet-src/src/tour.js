/* =====================================================================
   PMO GUIDED TOUR — learn by doing, in the real shell.

   Every step asks the user to perform a real action on a real control and
   completes on a real success predicate. Show Me is choreography wrapped
   around the same handler, never a second implementation. The planning
   chapter carries most of the tour's actions and dwell time.

   The tour makes no provider request and increments no usage: the Teacher
   and PRD content are local fixtures, visibly labelled as a guided example.
   ===================================================================== */
(function () {
  'use strict';
  if (window.PMO_TOUR) return;

  var root = null, els = {}, mounted = false;
  var idx = -1, active = false, watch = null, snapshot = null, restoreQueue = [];
  var advancing = false;
  var providerCallsAtStart = 0;

  /* ------------------------------------------------------------ helpers */

  function h(s) { return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }

  function q(sel, ctx) { try { return (ctx || document).querySelector(sel); } catch (e) { return null; } }
  function qa(sel, ctx) { try { return [].slice.call((ctx || document).querySelectorAll(sel)); } catch (e) { return []; } }

  /* Several shells keep a hidden duplicate of a control; always take one the
     user can actually see. */
  function firstVisible(sel, ctx) {
    var list = qa(sel, ctx);
    for (var i = 0; i < list.length; i++) if (visible(list[i])) return list[i];
    return null;
  }

  function visible(el) {
    if (!el) return false;
    var r = el.getBoundingClientRect();
    return r.width > 2 && r.height > 2 && el.offsetParent !== null;
  }

  /* Find a visible control by the text it shows — resilient to class churn. */
  function byText(text, sel) {
    var list = qa(sel || 'button, [role="button"], a');
    for (var i = 0; i < list.length; i++) {
      var t = (list[i].textContent || '').trim();
      if (t && t.toLowerCase().indexOf(text.toLowerCase()) === 0 && visible(list[i])) return list[i];
    }
    return null;
  }

  /* Chosen-state is spelled differently across the shell: aria-pressed,
     aria-selected, or a class token (`sel`, `active`, `is-on`…). */
  function isChosen(el) {
    if (!el) return false;
    if (el.getAttribute('aria-pressed') === 'true') return true;
    if (el.getAttribute('aria-selected') === 'true') return true;
    var cls = ' ' + (el.className || '').toString() + ' ';
    return /\s(sel|selected|active|is-on|is-active|on|checked)\s/.test(cls);
  }

  /* The panel whose heading matches — used to reach wizard regions. */
  function panelWithHeading(text) {
    var all = qa('.page.active *, .primary-content *');
    for (var i = 0; i < all.length; i++) {
      var el = all[i];
      if (!el.children || el.children.length > 40) continue;
      var t = (el.textContent || '').trim();
      if (t.toLowerCase().indexOf(text.toLowerCase()) === 0 && visible(el) && el.getBoundingClientRect().height > 60) return el;
    }
    return null;
  }

  /* Pages are identified by a page-<name> class, not a data attribute. */
  function activePage() {
    if (window.PM_PAGES && typeof PM_PAGES.current === 'string' && PM_PAGES.current) return PM_PAGES.current;
    var p = q('.primary-content > .page.active') || q('.page.active');
    if (!p) return '';
    var explicit = p.getAttribute('data-page');
    if (explicit) return explicit;
    var m = /(?:^|\s)page-([a-z0-9_-]+)/.exec(p.className || '');
    return m ? m[1] : '';
  }

  var W = function () { return window.PM_HOME_WORKSPACE; };
  function chatSurface() {
    var w = W(); if (!w || !w.layout) return null;
    var list = w.layout.surfaces || [];
    for (var i = 0; i < list.length; i++) if (list[i].surface_kind === 'chat') return list[i];
    return null;
  }
  function chatEl() {
    return q('[data-surface-kind="chat"]') || q('[data-surface-instance-id="chat"]') ||
           (q('.pm6-chat-input') && q('.pm6-chat-input').closest('[class*="panel"], [class*="surface"], aside, section'));
  }

  /* ------------------------------------------------------------ fixtures */

  var FIX = {
    prompt: 'What happens before Puppet Master changes my files?',
    teacher: 'Before work begins, Puppet Master turns your request into a plan. You can review the important choices, ' +
             'correct anything that looks wrong, and decide when to begin. Your project permissions still control what the work may change.',
    teacherEli5: 'First, Puppet Master writes down what it thinks you want. You can fix the plan before anything starts. ' +
                 'It waits for your decision to begin.',
    goal: 'Create a simple website for my neighbourhood book club. It should show the next meeting, the current book, and how to join.',
    outcomes: [
      'Visitors can see the next meeting.',
      'Visitors can see the current book.',
      'New members can learn how to join.'
    ],
    question: 'Who should be able to update the meeting and the book?',
    choices: [
      { id: 'me', label: 'Only me', consequence: 'sign-in-off' },
      { id: 'few', label: 'A few organisers', consequence: 'sign-in-on' },
      { id: 'unsure', label: 'I am not sure yet', consequence: 'unsure' }
    ],
    why: 'This decides whether the site needs shared sign-in and editing. Answering now keeps Puppet Master from planning the wrong kind of site.'
  };

  /* --------------------------------------------------------- practice UI
     Injected into the real Wizard panels and always restored on exit. */

  function stash(el) {
    if (!el) return;
    restoreQueue.push({ el: el, html: el.innerHTML });
  }
  function restoreAll() {
    while (restoreQueue.length) {
      var r = restoreQueue.pop();
      try { r.el.innerHTML = r.html; } catch (e) {}
    }
  }

  var practice = { answer: null };

  function projectionHTML() {
    var shared = practice.answer === 'few';
    var unsure = practice.answer === 'unsure';
    var rows = FIX.outcomes.map(function (o, i) {
      return '<div class="pmot-p-row" data-i="' + i + '"><span class="pmot-p-dot"></span><span>' + h(o) + '</span></div>';
    }).join('');
    var extra = '';
    if (shared) {
      extra = '<div class="pmot-p-row pmot-p-new" data-consequence="shared"><span class="pmot-p-dot pmot-p-dot--new"></span>' +
              '<span>Organisers can sign in and edit the page.</span></div>';
    } else if (unsure) {
      extra = '<div class="pmot-p-row pmot-p-open" data-consequence="open"><span class="pmot-p-dot pmot-p-dot--open"></span>' +
              '<span>Open question: who may edit the page. Puppet Master will ask again before building.</span></div>';
    }
    var decision = practice.answer
      ? (practice.answer === 'me' ? 'Only you can update the page.'
        : practice.answer === 'few' ? 'A few organisers can update the page.'
        : 'Not decided yet.')
      : 'Not answered yet.';
    return '' +
      '<div class="pmot-practice">' +
        '<div class="pmot-p-head"><span class="pmot-example-tag">Guided example</span>' +
          '<span class="pmot-p-note">Nothing here is built. No AI plan is used.</span></div>' +
        '<h3 class="pmot-p-h">Book club website — draft plan</h3>' +
        '<p class="pmot-p-k">What this should achieve</p>' +
        '<div class="pmot-p-list">' + rows + extra + '</div>' +
        '<p class="pmot-p-k">Decisions used</p>' +
        '<div class="pmot-p-dec"><span>' + h(FIX.question) + '</span><b>' + h(decision) + '</b></div>' +
        '<p class="pmot-p-k">Still uncertain</p>' +
        '<div class="pmot-p-dec pmot-p-dec--muted">' +
          (unsure || !practice.answer
            ? '<span>Who may edit the page</span><b>Needs an answer before building</b>'
            : '<span>How often the meeting changes</span><b>Assumed monthly</b>') + '</div>' +
        '<div class="pmot-p-boundary"><span class="pmot-p-lock"></span>' +
          '<span>Nothing is built until you approve this plan.</span></div>' +
      '</div>';
  }

  function questionHTML() {
    return '' +
      '<div class="pmot-practice pmot-practice--q">' +
        '<div class="pmot-p-head"><span class="pmot-example-tag">Guided example</span></div>' +
        '<p class="pmot-p-goal">' + h(FIX.goal) + '</p>' +
        '<h3 class="pmot-p-h">' + h(FIX.question) + '</h3>' +
        '<div class="pmot-p-choices">' +
          FIX.choices.map(function (c) {
            return '<button type="button" class="pmot-p-choice" data-pmot-act="answer" data-arg="' + c.id + '"' +
              ' aria-pressed="' + (practice.answer === c.id ? 'true' : 'false') + '">' + h(c.label) + '</button>';
          }).join('') +
        '</div>' +
        '<p class="pmot-p-why"><b>Why this matters.</b> ' + h(FIX.why) + '</p>' +
      '</div>';
  }

  function renderPractice() {
    var goalPanel = els.goalPanel, projPanel = els.projPanel;
    if (goalPanel) goalPanel.innerHTML = questionHTML();
    if (projPanel) projPanel.innerHTML = projectionHTML();
  }

  /* Idempotent: any planning step can call this, including on resume. */
  function ensurePractice() {
    if (els.goalPanel && document.contains(els.goalPanel) &&
        els.projPanel && document.contains(els.projPanel)) { renderPractice(); return true; }
    els.goalPanel = null; els.projPanel = null;
    return installPractice();
  }

  function installPractice() {
    var goal = panelWithHeading('GOAL');
    var proj = panelWithHeading('PRD — LIVE PROJECTION') || panelWithHeading('PRD —');
    if (goal) { stash(goal); els.goalPanel = goal; }
    if (proj) { stash(proj); els.projPanel = proj; }
    renderPractice();
    return !!(goal && proj);
  }

  /* ------------------------------------------------------------- Teacher
     The reply is rendered into the real chat thread when one is reachable. */

  function chatThread() {
    var input = q('.pm6-chat-input');
    if (!input) return null;
    var panel = input.closest('[class*="chat"]') || input.parentElement;
    if (!panel) return null;
    var best = null, bestArea = 0;
    qa('[class*="msg"], [class*="thread"], [class*="stream"], [class*="bubble"]', panel).forEach(function (el) {
      var r = el.getBoundingClientRect();
      var a = r.width * r.height;
      if (a > bestArea && r.height > 120) { bestArea = a; best = el; }
    });
    return best ? (best.parentElement || best) : null;
  }

  function teacherHTML(eli5) {
    return '<div class="pmot-teach" data-pmot-teach="1">' +
      '<div class="pmot-p-head"><span class="pmot-example-tag">Guided example</span>' +
      '<span class="pmot-p-note">Answered from a local example — no AI plan used.</span></div>' +
      '<p class="pmot-teach-q">' + h(FIX.prompt) + '</p>' +
      '<p class="pmot-teach-a" data-mode="' + (eli5 ? 'eli5' : 'regular') + '">' +
        h(eli5 ? FIX.teacherEli5 : FIX.teacher) + '</p>' +
      (eli5 ? '<p class="pmot-teach-tag">Simpler wording — same answer.</p>' : '') +
      '</div>';
  }

  /* The guided answer lives with chapter 1 and is cleared when it ends. */
  function dropTeacher() {
    if (els.teachHost && els.teachHost.parentNode) els.teachHost.parentNode.removeChild(els.teachHost);
    els.teachHost = null; els.floatTeach = null;
    /* the example prompt was typed for the user; do not leave it behind */
    var input = firstVisible('textarea.pm6-chat-input');
    if (input && input.value === FIX.prompt) {
      input.value = '';
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }

  function putTeacher(eli5) {
    var host = els.teachHost;
    if (!host) {
      var thread = chatThread();
      if (thread) {
        host = document.createElement('div');
        host.className = 'pmot-teach-host';
        thread.appendChild(host);
        els.teachHost = host;
      } else {
        host = els.floatTeach || (function () {
          var d = document.createElement('div');
          d.className = 'pmot-teach-host pmot-teach-host--float';
          root.appendChild(d);
          els.floatTeach = d;
          return d;
        })();
        els.teachHost = host;
      }
    }
    host.innerHTML = teacherHTML(eli5);
    try { host.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); } catch (e) {}
    return host;
  }

  /* ------------------------------------------------------------- steps */

  var CH = { ask: 'Ask and understand', shape: 'Make it yours', plan: 'Plan before building' };

  var STEPS = [

    /* --------------------------- Chapter 1 — Ask and understand --------- */
    {
      id: 'chat-open', chapter: CH.ask,
      title: 'Start by asking.',
      body: 'Assistant Chat is where you ask Puppet Master for help — about this screen, an unfamiliar word, or why a choice matters. It is open on the right now.',
      ask: 'Have a look, then continue.',
      target: function () { return chatEl() || firstVisible('textarea.pm6-chat-input'); },
      enter: function () {
        var w = W();
        if (w && w.setSurfaceVisible) { try { w.setSurfaceVisible('chat', true); } catch (e) {} }
      },
      run: function () { var w = W(); if (w && w.setSurfaceVisible) w.setSurfaceVisible('chat', true); },
      done: function () { return true; },
      manual: true
    },
    {
      id: 'chat-ask', chapter: CH.ask,
      title: 'Ask it something real.',
      body: 'Teacher answers questions about what you are looking at. This one is worth knowing before you start anything.',
      ask: 'Send: \u201c' + FIX.prompt + '\u201d',
      target: function () { return firstVisible('textarea.pm6-chat-input') || firstVisible('.pm6-chat-input'); },
      run: function () {
        var input = firstVisible('textarea.pm6-chat-input');
        if (input) {
          input.value = FIX.prompt;
          input.dispatchEvent(new Event('input', { bubbles: true }));
        }
        putTeacher(false);
      },
      done: function () { return !!q('[data-pmot-teach]'); }
    },
    {
      id: 'chat-eli5', chapter: CH.ask,
      title: 'Ask for it in plainer words.',
      body: 'ELI5 rewrites the same answer with simpler words and less assumed knowledge. It does not change what is true.',
      ask: 'Turn on ELI5.',
      target: function () { return firstVisible('.toggle-eli5') || byText('ELI5', 'span, button'); },
      run: function () {
        var b = firstVisible('.toggle-eli5');
        if (b) { try { b.click(); } catch (e) {} }
        putTeacher(true);
      },
      done: function () { var a = q('.pmot-teach-a'); return !!(a && a.getAttribute('data-mode') === 'eli5'); }
    },

    /* --------------------------- Chapter 2 — Make it yours -------------- */
    {
      id: 'dock', chapter: CH.shape,
      enter: function () { dropTeacher(); },
      title: 'Put things where you want them.',
      body: 'Panels can move. The same Chat stays with you \u2014 only its place changes.',
      ask: 'Move Assistant Chat to the other side.',
      target: function () { return chatEl() || firstVisible('textarea.pm6-chat-input'); },
      run: function () { return showDock(); },
      done: function () { var s = chatSurface(); return !!(s && s.host && s.host !== snapshot.chatHost); }
    },
    {
      id: 'widget-open', chapter: CH.shape,
      title: 'Keep useful things in view.',
      body: 'Widgets show project information beside whatever you are doing, so you do not have to go looking for it.',
      ask: 'Open Add widget.',
      page: 'dashboard',
      target: function () { return byText('Add widget'); },
      run: function () { var b = byText('Add widget'); if (b) b.click(); },
      done: function () { return !!firstVisible('.pm6-dash-catalog-item'); }
    },
    {
      id: 'widget-pick', chapter: CH.shape,
      title: 'Pick one you will actually look at.',
      body: 'Approval queue shows anything waiting on your decision. It is the one most worth having in the corner of your eye.',
      ask: 'Choose Approval queue.',
      target: function () {
        var items = qa('.pm6-dash-catalog-item');
        for (var i = 0; i < items.length; i++) if (/Approval queue/.test(items[i].textContent || '')) return items[i];
        return items[0] || null;
      },
      run: function () {
        var items = qa('.pm6-dash-catalog-item');
        for (var i = 0; i < items.length; i++) {
          if (/Approval queue/.test(items[i].textContent || '')) { items[i].click(); return; }
        }
      },
      done: function () { return !firstVisible('.pm6-dash-catalog-item'); }
    },

    /* --------------------------- Chapter 3 — Plan before building ------- */
    {
      id: 'wiz-open', chapter: CH.plan,
      title: 'This is the part that matters.',
      body: 'Planning Wizard turns a rough idea into a plan you can read and correct — before anything is built.',
      ask: 'Open Planning Wizard.',
      target: function () { return byText('Planning Wizard', '.nav-tab, [data-page], button, a'); },
      run: function () { var t = byText('Planning Wizard', '.nav-tab, [data-page], button, a'); if (t) t.click(); else window.PM_PAGES.go('wizard'); },
      done: function () { return activePage() === 'wizard'; }
    },
    {
      id: 'wiz-kind', chapter: CH.plan,
      title: 'Say what kind of thing this is.',
      body: 'The Wizard only asks questions that change the plan. This one decides how much it needs to work out from scratch.',
      ask: 'Choose “Brand-new product”.',
      target: function () { return byText('Brand-new product'); },
      run: function () { var b = byText('Brand-new product'); if (b) b.click(); },
      done: function () { return isChosen(byText('Brand-new product')); }
    },
    {
      id: 'wiz-continue', chapter: CH.plan,
      title: 'Move on when you are ready.',
      body: 'Nothing has been decided permanently. Every answer can still be changed.',
      ask: 'Continue.',
      target: function () { return byText('Continue'); },
      run: function () { var b = byText('Continue'); if (b) b.click(); },
      done: function () { return !!q('.pm6-wiz-stage-reqs.active') || !!byText('Build them with the PRD Builder'); }
    },
    {
      id: 'wiz-builder', chapter: CH.plan,
      title: 'Let it ask you the questions.',
      body: 'You can hand over documents, or let the Wizard work it out by asking. For something new, asking is usually faster.',
      ask: 'Choose “Build them with the PRD Builder”.',
      target: function () { return byText('Build them with the PRD Builder'); },
      run: function () { var b = byText('Build them with the PRD Builder'); if (b) b.click(); },
      done: function () { return !!q('.pm6-wiz-stage-prd.active'); },
      after: function () { ensurePractice(); }
    },
    {
      id: 'wiz-goal', chapter: CH.plan,
      title: 'One sentence is enough to start.',
      body: 'Here is a practice idea. Watch what the Wizard does with it — the panel on the right is the plan, and it updates as you answer.',
      ask: 'Read the practice idea, then answer the question below it.',
      why: '<b>What just happened.</b> One sentence became three clear outcomes. That is the whole trick: describe the result you want, not the steps.',
      target: function () { return els.goalPanel; },
      keepVisible: function () { return els.projPanel; },
      enter: function () { ensurePractice(); },
      run: function () { flashOutcomes(); },
      done: function () { return true; },
      manual: true
    },
    {
      id: 'wiz-answer', chapter: CH.plan,
      enter: function () { ensurePractice(); },
      keepVisible: function () { return els.projPanel; },
      title: 'Answer the one question that changes things.',
      body: 'The Wizard does not ask about everything. It asks about the few things that would send the plan in a different direction.',
      ask: 'Choose an answer.',
      why: '<b>Why this matters.</b> ' + FIX.why,
      target: function () { return els.goalPanel; },
      run: function () { answer('few'); },
      done: function () { return !!practice.answer; }
    },
    {
      id: 'wiz-consequence', chapter: CH.plan,
      enter: function () { ensurePractice(); },
      keepVisible: function () { return els.projPanel; },
      title: 'See exactly what your answer changed.',
      body: 'Only the affected part of the plan moves. Everything you already agreed stays still, so the cause and effect stays obvious.',
      ask: 'Change your answer to “Only me”.',
      target: function () { return els.projPanel; },
      run: function () { answer('me'); },
      done: function () { return practice.answer === 'me'; }
    },
    {
      id: 'wiz-review', chapter: CH.plan,
      enter: function () { ensurePractice(); },
      keepVisible: function () { return els.projPanel; },
      title: 'Check it before anything is built.',
      body: 'The plan shows what it will achieve, the decisions it used, and what is still uncertain. This is your chance to correct it.',
      ask: 'Look over the plan on the right.',
      target: function () { return els.projPanel; },
      run: function () { walkReview(); },
      done: function () { return true; },
      manual: true
    },
    {
      id: 'wiz-boundary', chapter: CH.plan,
      enter: function () { ensurePractice(); },
      keepVisible: function () { return els.projPanel; },
      title: 'Nothing is built until you say so.',
      body: 'Approving is a separate, deliberate step. Until you press it, Puppet Master has only written things down.',
      ask: 'That is the whole loop. Finish the tour when you are ready.',
      target: function () { return byText('Approve PRD') || byText('Start discovery') || els.projPanel; },
      run: function () { var b = byText('Approve PRD'); if (b) pulse(b); },
      done: function () { return true; },
      manual: true, last: true
    }
  ];

  /* --------------------------------------------------- Show Me machinery */

  function rectOf(el) {
    var r = el.getBoundingClientRect();
    return { x: r.left, y: r.top, w: r.width, h: r.height, cx: r.left + r.width / 2, cy: r.top + r.height / 2 };
  }

  var reduced = function () {
    try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; }
  };

  /* Moves the visible pointer along a path and resolves when it arrives. */
  function movePointer(to, label, ms) {
    return new Promise(function (res) {
      var c = els.cursor;
      if (!c) return res();
      var lab = c.querySelector('.pmot-cursor-label');
      if (lab) lab.textContent = label || '';
      var dur = reduced() ? 1 : (ms || 620);
      c.setAttribute('data-on', 'true');
      c.style.transition = 'left ' + dur + 'ms cubic-bezier(.33,0,.2,1), top ' + dur + 'ms cubic-bezier(.33,0,.2,1), opacity 200ms linear';
      /* one frame so the transition has a start value */
      requestAnimationFrame(function () {
        c.style.left = to.x + 'px';
        c.style.top = to.y + 'px';
        setTimeout(res, dur + 40);
      });
    });
  }

  function press() {
    return new Promise(function (res) {
      var c = els.cursor;
      if (!c) return res();
      c.setAttribute('data-press', 'true');
      setTimeout(function () { c.removeAttribute('data-press'); res(); }, reduced() ? 1 : 460);
    });
  }

  function hidePointer() {
    if (els.cursor) { els.cursor.removeAttribute('data-on'); }
  }

  function pulse(el) {
    if (!el) return;
    el.style.transition = 'box-shadow 300ms ease';
    el.style.boxShadow = '0 0 0 4px color-mix(in srgb, var(--accent-blue) 40%, transparent)';
    setTimeout(function () { el.style.boxShadow = ''; }, 900);
  }

  /* Show Me: pre-cue, travel, arrival, settle — then the real handler. */
  function showMe() {
    var step = STEPS[idx];
    if (!step || !root) return;
    root.setAttribute('data-showme', 'true');
    root.setAttribute('data-phase', 'cue');
    var target = step.target && step.target();
    var seq = Promise.resolve();

    if (target && visible(target)) {
      var r = rectOf(target);
      seq = seq.then(function () { return wait(reduced() ? 1 : 420); })              /* pre-cue */
               .then(function () { root.setAttribute('data-phase', 'travel'); })
               .then(function () { return movePointer({ x: r.cx, y: r.cy }, step.ask || 'Here', 640); })
               .then(function () { root.setAttribute('data-phase', 'arrive'); return press(); });
    }
    seq.then(function () {
        if (step.run) step.run();                 /* the same handler the user would fire */
        root.setAttribute('data-phase', 'settle');
        return wait(reduced() ? 1 : 700);         /* long enough to read the change */
      })
      .then(function () {
        hidePointer();
        root.removeAttribute('data-showme');
        root.setAttribute('data-phase', 'idle');
        check();
      });
  }

  function wait(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

  /* Show Me for docking: the object travels and the destination reacts. */
  function showDock() {
    var el = chatEl() || q('.pm6-chat-input');
    var w = W();
    var target = snapshot.chatHost === 'dock_right' ? 'dock_left' : 'dock_right';
    if (!el || !w) { if (w) w.moveSurface('chat', target); return; }
    var r = rectOf(el);
    var ghost = els.ghost, drop = els.drop;
    var destX = target === 'dock_left' ? 8 : window.innerWidth - r.w - 8;

    ghost.style.left = r.x + 'px'; ghost.style.top = r.y + 'px';
    ghost.style.width = Math.min(r.w, 320) + 'px'; ghost.style.height = Math.min(r.h, 420) + 'px';
    ghost.innerHTML = '<div class="pmot-ghost-bar"><span></span><span>Assistant Chat</span></div>' +
                      '<div class="pmot-ghost-lines"><i></i><i></i><i></i><i></i></div>';
    ghost.setAttribute('data-on', 'true');

    drop.style.left = destX + 'px'; drop.style.top = r.y + 'px';
    drop.style.width = Math.min(r.w, 320) + 'px'; drop.style.height = Math.min(r.h, 420) + 'px';

    var dur = reduced() ? 1 : 760;
    var tilt = target === 'dock_left' ? -2.6 : 2.6;
    ghost.style.transition = 'left ' + dur + 'ms cubic-bezier(.33,0,.2,1), top ' + dur + 'ms cubic-bezier(.33,0,.2,1), ' +
                             'transform 320ms cubic-bezier(.16,1,.3,1), opacity 220ms linear';
    ghost.style.transform = 'scale(.97)';
    return wait(reduced() ? 1 : 260)
      .then(function () { drop.setAttribute('data-on', 'true'); })     /* destination reacts first */
      .then(function () { return wait(reduced() ? 1 : 180); })
      .then(function () {
        if (!reduced()) ghost.style.transform = 'scale(.94) rotate(' + tilt + 'deg)';
        ghost.style.left = destX + 'px';
        return wait(dur * 0.62);
      })
      .then(function () { if (!reduced()) ghost.style.transform = 'scale(1) rotate(0deg)'; return wait(dur * 0.38 + 60); })
      .then(function () {
        w.moveSurface('chat', target);                                  /* the real command */
        ghost.removeAttribute('data-on');
        ghost.style.transform = '';
        return wait(reduced() ? 1 : 420);
      })
      .then(function () { drop.removeAttribute('data-on'); });
  }

  function flashOutcomes() {
    var rows = qa('.pmot-p-row', els.projPanel);
    rows.forEach(function (r, i) {
      r.style.animation = 'none'; void r.offsetWidth;
      r.style.animation = 'pmot-p-in 520ms cubic-bezier(.16,1,.3,1) ' + (i * 130) + 'ms both';
    });
  }

  function walkReview() {
    var keys = qa('.pmot-p-k', els.projPanel);
    keys.forEach(function (k, i) {
      setTimeout(function () { pulse(k); }, i * 520);
    });
  }

  function answer(id) {
    practice.answer = id;
    var before = qa('.pmot-p-row', els.projPanel).length;
    renderPractice();
    /* only the affected row animates; agreed outcomes stay still */
    var changed = q('.pmot-p-new, .pmot-p-open', els.projPanel);
    if (changed) {
      changed.style.animation = 'pmot-p-in 560ms cubic-bezier(.34,1.4,.5,1) both';
    }
    check();
  }

  /* ------------------------------------------------------------ spotlight */

  var lastTarget = null;

  function overlap(a, b) {
    if (!a || !b) return 0;
    var w = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x);
    var hh = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y);
    return (w > 0 && hh > 0) ? w * hh : 0;
  }

  function place(step) {
    var target = step.target && step.target();
    var spot = els.spot, card = els.card;
    if (!spot || !card) return;
    var gap = 18;
    var cw = card.offsetWidth || 376, chh = card.offsetHeight || 240;
    var clamp = function (v, lo, hi) { return Math.max(lo, Math.min(hi, v)); };

    if (target && visible(target)) {
      card.removeAttribute('data-lost');
      var r = rectOf(target), pad = 8;
      spot.style.left = (r.x - pad) + 'px';
      spot.style.top = (r.y - pad) + 'px';
      spot.style.width = (r.w + pad * 2) + 'px';
      spot.style.height = (r.h + pad * 2) + 'px';
      spot.style.display = '';
      if (lastTarget !== target) {
        spot.setAttribute('data-arrived', 'true');
        setTimeout(function () { spot.removeAttribute('data-arrived'); }, 480);
      }
      lastTarget = target;

      /* The guide must not cover the target, nor anything the step says has to
         stay readable — on the planning steps that is the live plan, which is
         the whole point of what the card is asking the user to watch. */
      var avoid = [{ x: r.x, y: r.y, w: r.w, h: r.h }];
      if (step.keepVisible) {
        var extra = step.keepVisible();
        if (extra && visible(extra)) { var e = rectOf(extra); avoid.push({ x: e.x, y: e.y, w: e.w, h: e.h }); }
      }

      var W = window.innerWidth, H = window.innerHeight;
      var cands = [
        { x: r.x + r.w + gap,      y: r.cy - chh / 2 },   /* right  */
        { x: r.x - cw - gap,       y: r.cy - chh / 2 },   /* left   */
        { x: r.cx - cw / 2,        y: r.y + r.h + gap },  /* below  */
        { x: r.cx - cw / 2,        y: r.y - chh - gap },  /* above  */
        { x: W - cw - gap,         y: H - chh - gap },    /* corner fallbacks */
        { x: gap,                  y: H - chh - gap },
        { x: gap,                  y: gap },
        { x: W - cw - gap,         y: gap }
      ];
      var best = null, bestScore = Infinity;
      for (var i = 0; i < cands.length; i++) {
        var c = { x: clamp(cands[i].x, gap, Math.max(gap, W - cw - gap)),
                  y: clamp(cands[i].y, gap, Math.max(gap, H - chh - gap)), w: cw, h: chh };
        var score = 0;
        for (var j = 0; j < avoid.length; j++) score += overlap(c, avoid[j]) * (j === 0 ? 1 : 1.4);
        /* prefer earlier candidates when they tie, so the card stays near its target */
        score += i * 0.5;
        if (score < bestScore) { bestScore = score; best = c; }
        if (score < 1) break;
      }
      card.style.left = best.x + 'px';
      card.style.top = best.y + 'px';
    } else {
      /* Honest recovery: say the target is not on screen and offer the route,
         rather than leaving a spotlight pointing at nothing. */
      spot.style.display = 'none';
      lastTarget = null;
      card.setAttribute('data-lost', 'true');
      card.style.left = clamp(window.innerWidth / 2 - cw / 2, gap, window.innerWidth - cw - gap) + 'px';
      card.style.top = clamp(window.innerHeight * 0.58, gap, window.innerHeight - chh - gap) + 'px';
    }
  }

  /* --------------------------------------------------------------- render */

  var ICON_HAND = '<svg viewBox="0 0 16 16" fill="none"><path d="M8 2v6M5.5 4.5v4M10.5 5v3.5M3.5 7.5v2.5a4 4 0 004 4h1a4 4 0 004-4V6.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>';

  function renderCard(quiet) {
    var step = STEPS[idx];
    if (!step) return;
    var chapterSteps = STEPS.filter(function (s) { return s.chapter === step.chapter; });
    var within = chapterSteps.indexOf(step) + 1;
    var card = els.card;
    card.innerHTML =
      '<div class="pmot-head"><span class="pmot-chapter">' + h(step.chapter) + '</span>' +
        '<span class="pmot-count">' + within + ' of ' + chapterSteps.length + '</span></div>' +
      '<h3 class="pmot-title">' + h(step.title) + '</h3>' +
      '<p class="pmot-body">' + h(step.body) + '</p>' +
      (step.ask ? '<p class="pmot-ask">' + ICON_HAND + '<span>' + h(step.ask) + '</span></p>' : '') +
      (step.why ? '<p class="pmot-why">' + step.why + '</p>' : '') +
      '<p class="pmot-lost">That control is not on screen right now. ' +
        '<button type="button" class="pmot-link" data-pmot-act="reveal">Take me to it</button></p>' +
      '<div class="pmot-foot">' +
        (idx > 0 ? '<button type="button" class="pmot-btn pmot-btn--ghost" data-pmot-act="back" data-ui-action-id="ui.guided_tour.back">Back</button>' : '') +
        (step.manual
          ? '<button type="button" class="pmot-btn pmot-btn--primary" data-pmot-act="next" data-ui-action-id="ui.guided_tour.next">' + (step.last ? 'Finish' : 'Got it') + '</button>'
          : '<button type="button" class="pmot-btn" data-pmot-act="showme">Show me</button>') +
        (step.manual && step.run ? '<button type="button" class="pmot-btn" data-pmot-act="showme">Show me</button>' : '') +
        '<button type="button" class="pmot-btn pmot-btn--ghost pmot-skip" data-pmot-act="skip" data-ui-action-id="ui.guided_tour.skip">Skip tour</button>' +
      '</div>' +
      /* Grouped by chapter: shows how far through, and how much shape is left,
         without reading as a fifteen-item checklist. */
      '<div class="pmot-progress">' + (function () {
        var out = '', seen = null;
        for (var i = 0; i < STEPS.length; i++) {
          if (STEPS[i].chapter !== seen) {
            if (seen !== null) out += '</span>';
            out += '<span class="pmot-progress-ch" title="' + h(STEPS[i].chapter) + '">';
            seen = STEPS[i].chapter;
          }
          out += '<i data-on="' + (i < idx ? 'done' : i === idx ? 'current' : 'todo') + '"></i>';
        }
        return out + (seen !== null ? '</span>' : '');
      })() + '</div>';
    if (quiet) card.setAttribute('data-quiet', 'true'); else card.removeAttribute('data-quiet');
    place(step);
  }

  /* -------------------------------------------------------------- driving */

  function goStep(i) {
    if (i < 0 || i >= STEPS.length) return finish();
    idx = i;
    var step = STEPS[idx];
    if (step.page && activePage() !== step.page && window.PM_PAGES) {
      try { window.PM_PAGES.go(step.page); } catch (e) {}
    }
    advancing = false;
    if (step.enter) { try { step.enter(); } catch (e) {} }
    root.setAttribute('data-step', step.id);
    root.setAttribute('data-phase', 'cue');
    /* Wait a beat so a page change settles before the spotlight lands. */
    setTimeout(function () {
      renderCard(false);
      root.setAttribute('data-phase', 'idle');
      arm();
    }, 220);
    persist();
  }

  function arm() {
    if (watch) clearInterval(watch);
    var step = STEPS[idx];
    if (!step || step.manual) { watch = setInterval(function () { place(STEPS[idx]); }, 400); return; }
    watch = setInterval(function () {
      place(step);
      check();
    }, 260);
  }

  function check() {
    var step = STEPS[idx];
    if (!step || step.manual || advancing) return;
    var ok = false;
    try { ok = !!step.done(); } catch (e) { ok = false; }
    if (!ok) return;
    advancing = true;
    if (watch) { clearInterval(watch); watch = null; }
    if (step.after) { try { step.after(); } catch (e) {} }
    var from = idx;
    /* let the result settle and be seen before moving on */
    setTimeout(function () { if (idx === from) goStep(idx + 1); }, 900);
  }

  /* Re-walk the Wizard to the stage a step belongs to, clicking the same
     controls the tour asks the user to click. */
  function routeToWizardStage(stepId) {
    var needPrd = /^wiz-(builder|goal|answer|consequence|review|boundary)$/.test(stepId);
    var step = function (fn, ms) { return function () { try { fn(); } catch (e) {} return wait(ms); }; };
    var chain = Promise.resolve();
    if (window.PM_PAGES) { try { PM_PAGES.go('wizard'); } catch (e) {} }
    chain = chain.then(function () { return wait(700); });
    if (!needPrd) return chain;
    chain = chain
      .then(step(function () { var b = byText('Brand-new product'); if (b && !isChosen(b)) b.click(); }, 400))
      .then(step(function () { var b = byText('Continue'); if (b) b.click(); }, 900))
      .then(step(function () { var b = byText('Build them with the PRD Builder'); if (b) b.click(); }, 1200));
    return chain;
  }

  /* --------------------------------------------------------- lifecycle */

  function takeSnapshot() {
    var s = chatSurface();
    snapshot = {
      chatHost: s ? s.host : 'dock_right',
      chatVisible: s ? s.visible : false,
      page: activePage()
    };
  }

  function restoreWorkspace(keep) {
    restoreAll();
    if (els.teachHost && els.teachHost.parentNode) { els.teachHost.parentNode.removeChild(els.teachHost); }
    els.teachHost = null; els.goalPanel = null; els.projPanel = null;
    if (keep || !snapshot) return;
    var w = W();
    try {
      if (w && w.moveSurface) w.moveSurface('chat', snapshot.chatHost);
      if (w && w.setSurfaceVisible) w.setSurfaceVisible('chat', snapshot.chatVisible);
      if (window.PM_PAGES && snapshot.page) window.PM_PAGES.go(snapshot.page);
    } catch (e) {}
  }

  function start(opts) {
    if (!mounted && !mount()) return false;
    active = true;
    practice.answer = null;
    takeSnapshot();
    root.hidden = false;
    void root.offsetWidth;
    root.setAttribute('data-open', 'true');
    document.documentElement.setAttribute('data-pmot-open', 'true');
    var res = document.getElementById('pmot-resume');
    if (res) res.hidden = true;
    goStep(0);
    return true;
  }

  function stop(reason, keepLayout) {
    if (watch) { clearInterval(watch); watch = null; }
    active = false;
    if (root) {
      root.setAttribute('data-open', 'false');
      setTimeout(function () { if (root && root.getAttribute('data-open') === 'false') root.hidden = true; }, 400);
    }
    document.documentElement.removeAttribute('data-pmot-open');
    hidePointer();
    if (els.ghost) els.ghost.removeAttribute('data-on');
    if (els.drop) els.drop.removeAttribute('data-on');
    restoreWorkspace(keepLayout);
    try { localStorage.setItem('pmo.tour.state', JSON.stringify({ done: reason === 'finish', at: idx })); } catch (e) {}
    var res = document.getElementById('pmot-resume');
    if (res) res.hidden = !(reason === 'skip');
    return true;
  }

  function finish() {
    /* End on the real Planning Wizard with nothing started. */
    if (window.PM_PAGES) { try { PM_PAGES.go('wizard'); } catch (e) {} }
    stop('finish', false);
    return true;
  }

  function persist() {
    try { localStorage.setItem('pmo.tour.state', JSON.stringify({ done: false, at: idx })); } catch (e) {}
  }

  /* ------------------------------------------------------------- actions */

  var ACTS = {
    next: function () { goStep(idx + 1); },
    back: function () { goStep(Math.max(0, idx - 1)); },
    showme: showMe,
    skip: function () { stop('skip', false); },
    answer: function (arg) { answer(arg); },
    /* Recovery route: walk the shell back to where the step lives, using the
       same real controls the user would, then re-place the guide. */
    reveal: function () {
      var step = STEPS[idx];
      if (!step) return;
      var chain = Promise.resolve();
      if (step.page && window.PM_PAGES) { try { PM_PAGES.go(step.page); } catch (e) {} }
      else if (/^chat|^dock/.test(step.id)) { var w = W(); if (w && w.setSurfaceVisible) w.setSurfaceVisible('chat', true); }
      else if (/^wiz-/.test(step.id)) chain = routeToWizardStage(step.id);
      chain.then(function () {
        if (/^wiz-(goal|answer|consequence|review|boundary)$/.test(step.id)) ensurePractice();
        renderCard(true);
        arm();
      });
    },
    resume: function () { start({ source: 'resume' }); }
  };

  function onClick(e) {
    var t = e.target.closest ? e.target.closest('[data-pmot-act]') : null;
    if (!t) return;
    var act = t.getAttribute('data-pmot-act');
    if (!ACTS[act]) return;
    e.preventDefault(); e.stopPropagation();
    ACTS[act](t.getAttribute('data-arg') || '');
  }

  function onKey(e) {
    if (!active) return;
    if (e.key === 'Escape') { e.preventDefault(); stop('skip', false); }
  }

  function onResize() { if (active && STEPS[idx]) place(STEPS[idx]); }

  /* --------------------------------------------------------------- mount */

  function mount() {
    if (document.getElementById('pmot')) { root = document.getElementById('pmot'); }
    else {
      root = document.createElement('div');
      root.id = 'pmot';
      root.className = 'pmot';
      root.setAttribute('data-slint-counterpart', 'GuidedTourOverlay');
      root.hidden = true;
      root.innerHTML =
        '<div class="pmot-spot" data-pmot-slot="spot"></div>' +
        '<div class="pmot-drop" data-pmot-slot="drop"></div>' +
        '<div class="pmot-ghost" data-pmot-slot="ghost"></div>' +
        '<div class="pmot-cursor" data-pmot-slot="cursor">' +
          '<svg viewBox="0 0 24 24" fill="none"><path d="M5 3l14 8-6 1.6L10 19 5 3z" fill="var(--surface)" stroke="var(--text-primary)" stroke-width="1.6" stroke-linejoin="round"/></svg>' +
          '<span class="pmot-cursor-label"></span>' +
        '</div>' +
        '<div class="pmot-card" role="dialog" aria-live="polite" data-pmot-slot="card"></div>';
      document.body.appendChild(root);

      var res = document.createElement('button');
      res.id = 'pmot-resume'; res.className = 'pmot-resume'; res.type = 'button';
      res.setAttribute('data-pmot-act', 'resume');
      res.setAttribute('data-ui-action-id', 'ui.guided_tour.resume');
      res.textContent = 'Continue the tour';
      res.hidden = true;
      document.body.appendChild(res);
    }
    els.spot = root.querySelector('[data-pmot-slot="spot"]');
    els.card = root.querySelector('[data-pmot-slot="card"]');
    els.cursor = root.querySelector('[data-pmot-slot="cursor"]');
    els.ghost = root.querySelector('[data-pmot-slot="ghost"]');
    els.drop = root.querySelector('[data-pmot-slot="drop"]');
    /* The shell still renders its own Replay Guided Tour control; its handler
       lived in the legacy tour module, so adopt it rather than leave it dead. */
    document.addEventListener('click', function (e) {
      var t = e.target.closest && e.target.closest(
        '#pm7-guided-tour-replay, [data-ui-action-id="ui.guided_tour.replay"], [data-ui-action-id="ui.guided_tour.resume"]');
      if (!t || (root && root.contains(t))) return;
      e.preventDefault(); e.stopPropagation();
      start({ source: 'settings_replay' });
    }, true);
    document.addEventListener('click', onClick, true);
    document.addEventListener('keydown', onKey, true);
    window.addEventListener('resize', onResize);
    window.addEventListener('scroll', onResize, true);
    mounted = true;
    return true;
  }

  function boot() { mount(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();

  /* -------------------------------------------------------------- export */

  window.PMO_TOUR = {
    schema_id: 'pmo.guided_tour.controller.v1',
    concept_simulation_only: true,
    provider_requests: 0,
    usage_increments: 0,
    start: start,
    stop: stop,
    skip: function () { return stop('skip', false); },
    next: function () { goStep(idx + 1); },
    back: function () { goStep(Math.max(0, idx - 1)); },
    showMe: showMe,
    goStep: goStep,
    steps: STEPS.map(function (s) { return { id: s.id, chapter: s.chapter, manual: !!s.manual }; }),
    get step() { return STEPS[idx] ? STEPS[idx].id : null; },
    get index() { return idx; },
    get running() { return active; },
    fixtures: FIX
  };

  /* Back-compat: Settings' "Replay Guided Tour" calls this. */
  window.PM7_GUIDED_TOUR = {
    schema_id: 'pmo.guided_tour.compat.v1',
    start: function (o) { return start(o || {}); },
    replay: function (o) { return start(o || {}); },
    skip: function () { return stop('skip', false); },
    next: function () { goStep(idx + 1); },
    back: function () { goStep(Math.max(0, idx - 1)); },
    resume: function () { return start({ source: 'resume' }); }
  };
})();
