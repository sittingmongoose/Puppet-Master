/* ============================================================================
   Kimi K3 — questionnaire card (composer-slot module).

   window.K3Questionnaire = { mount(slotEl, ctx, threadId) -> {unmount},
                              isActive(ctx, threadId) }

   The composer engine mounts this module into the window's composer slot
   while a questionnaire is active for the thread (the ordinary composer is
   unavailable meanwhile). ONE questionnaire is visible at a time, taken
   oldest-first from the per-thread live queue in K3Data. All state (answers,
   skips, freeform drafts, position) persists through K3Data -> K3Store, so
   the card survives thread switches, remounts, and simulated restarts.

   Answer model: option questions store an array of strings via
   answerQuestion — picked option labels in option order, plus the freeform
   text from the "Something else" row (when non-empty) as one extra entry.
   data.js merges arrays back verbatim, so both halves survive remount and
   either half satisfies a required question. Pure freeform questions store
   a plain string draft. Answering a skipped question replaces the skip
   (data.js drops the skip flag on answerQuestion).
   ========================================================================== */
(function () {
  'use strict';

  // Questionnaires whose entrance has already played in this session. A
  // docked<->pop-out remount re-mounts the questionnaire; we don't want the
  // entrance animation to re-fire for the same questionnaire on a mere mode
  // flip. Cleared when a questionnaire resolves (no longer active).
  var shownQuests = {};

  // Video-D causal lifecycle: the questionnaire is ONE element — a slim
  // "Preparing questions…" pill grows into the card; on submit the card
  // condenses back into a "Submitting answers…" pill that dissolves to the
  // composer. Both beats are presentation-only (the data facade resolves
  // synchronously — SPEC_GAPS K3-GAP-024) and are skipped under reduced motion.
  function beatPill(text, testid) {
    var pill = el('div', 'k3q-pill');
    pill.setAttribute('data-testid', testid);
    var o = el('span', 'k3-orbit');
    o.setAttribute('aria-hidden', 'true');
    for (var i = 0; i < 4; i++) o.appendChild(el('i'));
    pill.appendChild(o);
    pill.appendChild(el('span', 'k3q-pill-label', text));
    return pill;
  }

  function clamp(n, lo, hi) { return Math.max(lo, Math.min(hi, n)); }
  function arr(v) { return Array.isArray(v) ? v : []; }

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (tag === 'button') node.type = 'button';
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }
  function icon(name) { return window.K3Icons.get(name); }

  function kindOf(question) {
    var k = String((question && question.kind) || '').toLowerCase();
    if (k.indexOf('freeform') >= 0) return 'freeform';
    if (k.indexOf('multi') >= 0) return 'multi';
    return 'single';
  }
  function isUnresolved(q) { return !!q && (q.status === 'incomplete' || q.status === 'queued'); }
  function hasAnswer(question) {
    if (!question) return false;
    if (kindOf(question) === 'freeform') return String(question.draft || '').trim().length > 0;
    return arr(question.selected).length > 0;
  }
  function freeformTextOf(question) {
    if (kindOf(question) === 'freeform') return String(question.draft || '');
    var options = arr(question.options);
    var extra = arr(question.selected).filter(function (s) { return options.indexOf(s) < 0; });
    return extra.length ? String(extra[0]) : '';
  }
  function pickedOptions(question) {
    var selected = arr(question.selected);
    return arr(question.options).filter(function (o) { return selected.indexOf(o) >= 0; });
  }
  function missingRequiredIndices(q) {
    var out = [];
    arr(q && q.questions).forEach(function (question, i) {
      if (question.required && !hasAnswer(question)) out.push(i);
    });
    return out;
  }

  function mount(slotEl, ctx, threadId, variant) {
    if (!slotEl) return { unmount: function () {} };
    var K3 = window.K3;
    var data = ctx.data;

    var alive = true;
    var mute = false;        // ignore K3Data events caused by our own mutations
    var announced = false;
    var animTimer = null;
    var variantId = variant || 'morph';   // choreography variant

    var q = null;            // active questionnaire (merged; refreshed often)
    var idx = 0;             // current question index
    var noteFor = null;      // question index the inline note points at
    var noteEl = null;
    var primaryBtn = null;

    var root = el('section', 'k3q-card k3q-var-' + variantId);
    root.setAttribute('data-testid', 'k3-quest');
    root.setAttribute('data-variant', variantId);
    root.setAttribute('aria-label', 'Questionnaire');
    slotEl.appendChild(root);

    // --- data access ---------------------------------------------------------
    function getActive() {
      try { return data.activeQuestionnaire(threadId); } catch (e) { return null; }
    }
    function queuedCount() {
      try { return arr(data.questionnaires(threadId)).filter(isUnresolved).length; }
      catch (e) { return 0; }
    }
    function callData(fn) { // K3Data emits synchronously, inside this window
      mute = true;
      try { return fn(); } finally { mute = false; }
    }
    function announce(active) {
      if (announced === active) return;
      announced = active;
      K3.emit('questionnaire-active', { threadId: threadId, active: active });
    }
    function hasSubagentOrigin() {
      if (!q) return false;
      if (q.origin || q.fromSubagent) return true;
      try { // merged records drop extra fields; check the base record too
        var t = data.thread(threadId);
        var list = arr(t && t.questionnaires);
        for (var i = 0; i < list.length; i++) {
          if (list[i].id === q.id) return !!(list[i].origin || list[i].fromSubagent);
        }
      } catch (e) { /* ignore */ }
      return false;
    }

    // --- inline note ---------------------------------------------------------
    function showNote(qIndex) {
      noteFor = qIndex;
      if (noteEl) {
        noteEl.textContent = 'Question ' + (qIndex + 1) + ' still needs an answer';
        noteEl.hidden = false;
      }
    }
    function hideNote() {
      noteFor = null;
      if (noteEl) noteEl.hidden = true;
    }

    // --- render ----------------------------------------------------------------
    var submitting = false;
    var preparing = false;
    function unmountedRef() { return !root.isConnected; }
    function render(dir) {
      if (submitting || preparing) return; // beats own the slot; they re-render at the end
      q = getActive();
      announce(!!(q && arr(q.questions).length));
      if (!q || arr(q.questions).length === 0) {
        root.innerHTML = '';
        root.hidden = true;
        noteEl = null;
        primaryBtn = null;
        // when the questionnaire resolves, allow its entrance to play again
        // next time it (or a queued one) becomes active.
        return;
      }
      root.hidden = false;
      idx = clamp(q.currentQuestionIndex || 0, 0, q.questions.length - 1);
      // one-shot prepare beat + variant entrance on FIRST appearance of this
      // questionnaire in the session — a remount must NOT replay it. Reduced
      // motion skips the beat via the global gate.
      if (!shownQuests[q.id] && !K3.motionReduced()) {
        shownQuests[q.id] = true;
        var qid = q.id;
        // prepare beat: the pill occupies the slot before the card grows from it;
        // intermediate renders no-op while `preparing` (the slot is the beat's).
        preparing = true;
        if (lockedFor !== q.id) { root.style.minHeight = ''; lockedFor = null; } // no stale region behind the pill
        root.innerHTML = '';
        root.appendChild(beatPill('Preparing questions\u2026', 'k3-quest-prepare'));
        root.classList.add('k3q-pill-in');
        setTimeout(function () {
          preparing = false;
          if (unmountedRef()) return;
          // the flow may have resolved during the beat; render() re-reads state
          root.classList.remove('k3q-pill-in');
          q = getActive();
          if (!q || q.id !== qid) { render(); return; }
          root.innerHTML = '';
          lockCardHeight();
          root.innerHTML = '';
          buildHead();
          buildBody();
          buildFoot();
          refreshState();
          root.classList.add('k3q-enter-' + variantId);
          setTimeout(function () { root.classList.remove('k3q-enter-' + variantId); }, 600);
        }, 460);
        return;
      }
      // non-beat build (repeat appearance or reduced motion): lock geometry first
      lockCardHeight();
      root.innerHTML = '';
      buildHead();
      buildBody(dir);
      buildFoot();
      refreshState();
    }

    // Video-B stability: the card keeps ONE geometry across pages — measure
    // every page once (in the same JS turn as the prepare beat, so nothing
    // paints mid-measure) and lock the card to the tallest. Idempotent per
    // mount; options scroll internally via the body's overflow rule.
    var lockedFor = null;
    function lockCardHeight() {
      if (lockedFor && lockedFor !== q.id) { root.style.minHeight = ''; lockedFor = null; }
      if (root.style.minHeight) return;
      var keep = idx;
      var maxH = 0;
      for (var i = 0; i < q.questions.length; i++) {
        idx = i;
        root.innerHTML = '';
        buildHead();
        buildBody();
        buildFoot();
        maxH = Math.max(maxH, root.getBoundingClientRect().height);
      }
      idx = keep;
      if (maxH > 0) {
        root.style.minHeight = Math.ceil(maxH) + 'px';
        lockedFor = q.id;
      }
    }

    function buildHead() {
      var head = el('div', 'k3q-head');
      var main = el('div', 'k3q-head-main');

      var ic = el('span', 'k3q-head-icon');
      ic.appendChild(icon('question'));
      main.appendChild(ic);
      main.appendChild(el('span', 'k3q-title', 'Questionnaire'));
      if (hasSubagentOrigin()) main.appendChild(el('span', 'k3q-origin', 'Asked on behalf of a subagent'));
      main.appendChild(el('span', 'k3q-head-spacer'));

      var pager = el('div', 'k3q-pager');
      var prev = el('button', 'k3-icon-btn k3q-pager-btn');
      prev.setAttribute('data-testid', 'k3-quest-prev');
      prev.setAttribute('aria-label', 'Previous question');
      prev.appendChild(icon('chevron-left'));
      prev.addEventListener('click', function () { goTo(idx - 1); });
      var label = el('span', 'k3q-pager-label');
      var next = el('button', 'k3-icon-btn k3q-pager-btn');
      next.setAttribute('data-testid', 'k3-quest-next');
      next.setAttribute('aria-label', 'Next question');
      next.appendChild(icon('chevron-right'));
      next.addEventListener('click', function () { goTo(idx + 1); });
      pager.appendChild(prev);
      pager.appendChild(label);
      pager.appendChild(next);
      main.appendChild(pager);

      var close = el('button', 'k3-icon-btn k3q-close');
      close.setAttribute('data-testid', 'k3-quest-cancel');
      close.setAttribute('aria-label', 'Cancel questionnaire');
      close.appendChild(icon('close'));
      close.addEventListener('click', requestCancel);
      main.appendChild(close);
      head.appendChild(main);

      var dotsRow = el('div', 'k3q-dots-row');
      var dots = el('div', 'k3q-dots');
      dots.setAttribute('data-testid', 'k3-quest-dots');
      dotsRow.appendChild(dots);
      var skipTag = el('span', 'k3q-skipped-tag', 'Skipped');
      skipTag.hidden = true;
      dotsRow.appendChild(skipTag);
      head.appendChild(dotsRow);

      root.appendChild(head);
    }

    function buildBody(dir) {
      var body = el('div', 'k3q-body');
      var anim = el('div', 'k3q-anim');
      var question = q.questions[idx];
      var kind = kindOf(question);

      var promptRow = el('div', 'k3q-prompt-row');
      promptRow.appendChild(el('p', 'k3q-prompt', String(question.prompt || '')));
      if (question.required) promptRow.appendChild(el('span', 'k3-chip k3q-required', 'Required'));
      anim.appendChild(promptRow);

      if (kind !== 'freeform') {
        var options = el('div', 'k3q-options k3-stagger');
        arr(question.options).forEach(function (optionLabel, i) {
          var row = el('button', 'k3q-option');
          row.style.setProperty('--k3-i', i);
          row.setAttribute('data-testid', 'k3-quest-option');
          row.setAttribute('data-option', String(optionLabel));
          row.setAttribute('aria-pressed', 'false');
          row.appendChild(el('span', 'k3q-option-num', (i + 1) + '.'));
          row.appendChild(el('span', 'k3q-option-label', String(optionLabel)));
          var check = el('span', 'k3q-option-check');
          check.appendChild(icon('check'));
          row.appendChild(check);
          row.addEventListener('click', function () { toggleOption(optionLabel); });
          options.appendChild(row);
        });
        anim.appendChild(options);
        anim.appendChild(buildFreeform('Something else', 'Type your own answer'));
      } else {
        anim.appendChild(buildFreeform('Your answer', 'Type your answer'));
      }

      body.appendChild(anim);
      root.appendChild(body);

      if (dir && !K3.motionReduced()) { // CSS kill-switch covers reduced motion
        // variant-aware advance motion: each variant gets its own entrance
        // direction/feel via a variant+dir class.
        var advanceCls = 'k3q-adv-' + variantId + '-' + (dir === 'next' ? 'next' : 'prev');
        anim.classList.add(advanceCls);
        clearTimeout(animTimer);
        animTimer = setTimeout(function () { anim.classList.remove(advanceCls); }, 360);
      }
    }

    function buildFreeform(labelText, placeholder) {
      var wrap = el('div', 'k3q-freeform');
      wrap.appendChild(el('label', 'k3q-freeform-label', labelText));
      var input = el('input', 'k3-input k3q-freeform-input');
      input.type = 'text';
      input.setAttribute('data-testid', 'k3-quest-freeform');
      input.setAttribute('aria-label', labelText);
      input.setAttribute('spellcheck', 'false');
      input.placeholder = placeholder;
      input.value = freeformTextOf(q.questions[idx]);
      input.addEventListener('input', function () { onFreeform(input.value); });
      wrap.appendChild(input);
      return wrap;
    }

    function buildFoot() {
      var foot = el('div', 'k3q-foot');

      noteEl = el('div', 'k3q-note');
      noteEl.setAttribute('data-testid', 'k3-quest-note');
      noteEl.hidden = true;
      if (noteFor != null) { // the note survives the navigation it triggers
        noteEl.textContent = 'Question ' + (noteFor + 1) + ' still needs an answer';
        noteEl.hidden = false;
      }
      foot.appendChild(noteEl);

      var row = el('div', 'k3q-foot-row');
      var cancel = el('button', 'k3-btn k3-btn-ghost k3q-cancel', 'Cancel');
      cancel.addEventListener('click', requestCancel);
      primaryBtn = el('button', 'k3-btn k3q-primary', 'Skip');
      primaryBtn.setAttribute('data-testid', 'k3-quest-skip');
      primaryBtn.addEventListener('click', onPrimary);
      row.appendChild(cancel);
      row.appendChild(primaryBtn);
      foot.appendChild(row);

      var queued = queuedCount() - 1;
      if (queued > 0) {
        foot.appendChild(el('div', 'k3q-queue-line',
          queued === 1 ? '1 more questionnaire queued after this one'
                       : queued + ' more questionnaires queued after this one'));
      }

      root.appendChild(foot);
    }

    // In-place state sync after answer/skip mutations (no focus loss while typing).
    function refreshState() {
      var fresh = getActive();
      if (!fresh || !q || fresh.id !== q.id || arr(fresh.questions).length === 0) { render(); return; }
      q = fresh;
      var questions = q.questions;
      var n = questions.length;
      idx = clamp(q.currentQuestionIndex != null ? q.currentQuestionIndex : idx, 0, n - 1);
      var question = questions[idx];

      var dots = root.querySelector('[data-testid="k3-quest-dots"]');
      if (dots) {
        var i, d;
        if (dots.childElementCount !== n) {
          dots.innerHTML = '';
          for (i = 0; i < n; i++) {
            (function (dotIndex) {
              var dot = el('button', 'k3q-dot');
              dot.setAttribute('aria-label', 'Go to question ' + (dotIndex + 1));
              dot.addEventListener('click', function () { goTo(dotIndex); });
              dots.appendChild(dot);
            })(i);
          }
        }
        for (i = 0; i < n; i++) {
          d = dots.children[i];
          var cls = 'k3q-dot';
          if (i === idx) cls += ' is-current';
          else if (hasAnswer(questions[i])) cls += ' is-answered';
          else if (questions[i].skipped) cls += ' is-skipped';
          else if (questions[i].required) cls += ' is-missing';
          d.className = cls;
        }
      }

      // option rows reflect the current question's picks (covers initial render
      // and in-place toggles without rebuilding the body, so focus stays put)
      var rows = root.querySelectorAll('.k3q-option');
      if (rows.length) {
        var pickedNow = pickedOptions(question);
        for (var r = 0; r < rows.length; r++) {
          var sel = pickedNow.indexOf(rows[r].getAttribute('data-option')) >= 0;
          rows[r].classList.toggle('is-selected', sel);
          rows[r].setAttribute('aria-pressed', sel ? 'true' : 'false');
        }
      }

      var tag = root.querySelector('.k3q-skipped-tag');
      if (tag) tag.hidden = !question.skipped;

      var label = root.querySelector('.k3q-pager-label');
      if (label) label.textContent = (idx + 1) + ' of ' + n;
      var prev = root.querySelector('[data-testid="k3-quest-prev"]');
      var next = root.querySelector('[data-testid="k3-quest-next"]');
      if (prev) prev.disabled = idx === 0;
      if (next) next.disabled = idx === n - 1;

      if (primaryBtn) { // ONE button; label/state morphs with (index, answer, last)
        var willSubmit = idx === n - 1;
        var newLabel = willSubmit ? 'Submit' : (hasAnswer(question) ? 'Next' : 'Skip');
        // animate the Skip -> Next -> Submit morph: a brief crossfade/scale so
        // the label change reads as an intentional transition, not an instant
        // swap. Reduced motion collapses it to instant.
        if (primaryBtn.textContent !== newLabel && !K3.motionReduced()) {
          primaryBtn.classList.add('k3q-primary-morph');
          setTimeout(function () { primaryBtn.classList.remove('k3q-primary-morph'); }, 260);
        }
        primaryBtn.setAttribute('data-testid', willSubmit ? 'k3-quest-submit' : 'k3-quest-skip');
        primaryBtn.textContent = newLabel;
        primaryBtn.disabled = willSubmit ? missingRequiredIndices(q).length > 0 : false;
      }

      if (noteFor != null && hasAnswer(questions[noteFor])) hideNote();
    }

    // --- actions ---------------------------------------------------------------
    function goTo(newIdx, keepNote) {
      if (!q) return;
      var clamped = clamp(newIdx, 0, q.questions.length - 1);
      if (clamped === idx) return;
      var dir = clamped > idx ? 'next' : 'prev';
      callData(function () { data.navigateQuestion(threadId, q.id, clamped); });
      if (!keepNote) hideNote();
      render(dir);
      focusPrimary();
    }

    function toggleOption(optionLabel) {
      var question = q && q.questions[idx];
      if (!question) return;
      var kind = kindOf(question);
      var picked = pickedOptions(question);
      if (kind === 'single') {
        if (picked.length === 1 && picked[0] === optionLabel) return; // radio: stays put
        picked = [optionLabel];
      } else {
        var at = picked.indexOf(optionLabel);
        if (at >= 0) picked.splice(at, 1);
        else picked.push(optionLabel);
      }
      var ordered = arr(question.options).filter(function (o) { return picked.indexOf(o) >= 0; });
      var free = freeformTextOf(question);
      var value = free.trim() ? ordered.concat([free]) : ordered;
      callData(function () { data.answerQuestion(threadId, q.id, question.id, value); });
      refreshState();
    }

    function onFreeform(text) {
      var question = q && q.questions[idx];
      if (!question) return;
      callData(function () {
        if (kindOf(question) === 'freeform') {
          data.answerQuestion(threadId, q.id, question.id, text);
        } else {
          var picked = pickedOptions(question);
          data.answerQuestion(threadId, q.id, question.id, text.trim() ? picked.concat([text]) : picked);
        }
      });
      refreshState(); // morphs Skip -> Next, fills the dot, re-gates Submit
    }

    function onPrimary() {
      if (!q) return;
      var question = q.questions[idx];
      if (idx === q.questions.length - 1) { attemptSubmit(); return; }
      if (hasAnswer(question)) { goTo(idx + 1); return; }
      callData(function () { data.skipQuestion(threadId, q.id, question.id); });
      hideNote();
      render('next'); // data.js advances currentIndex past the skip
      focusPrimary();
    }

    function attemptSubmit() {
      if (!q) return;
      var missing = missingRequiredIndices(q);
      if (missing.length) {
        showNote(missing[0]);
        goTo(missing[0], true);
        return;
      }
      var qid = q.id;
      if (K3.motionReduced()) { doSubmit(qid); return; }
      // submit beat (video D): the card condenses to a pill that dissolves,
      // THEN the data resolves — the composer must not reclaim the slot during
      // the beat, and the resolution event would make it do exactly that.
      submitting = true;
      root.style.minHeight = ''; // release the page lock so the region condenses with the pill
      lockedFor = null;
      root.innerHTML = '';
      root.appendChild(beatPill('Submitting answers\u2026', 'k3-quest-submitting'));
      root.classList.add('k3q-exit-' + variantId);
      setTimeout(function () {
        submitting = false;
        root.classList.remove('k3q-exit-' + variantId);
        if (unmountedRef()) return;
        var cur = getActive();
        if (!cur || cur.id !== qid) { render(); return; } // flow changed mid-beat
        doSubmit(qid);
      }, 520);
    }

    function doSubmit(qid) {
      var res = callData(function () { return data.submitQuestionnaire(threadId, qid); });
      if (res && res.error === 'incomplete') {
        var ids = arr(res.missing); // data.js returns question ids (older notes said indices)
        var target = -1;
        for (var i = 0; i < ids.length && target < 0; i++) {
          target = typeof ids[i] === 'number'
            ? clamp(ids[i], 0, q.questions.length - 1)
            : q.questions.findIndex(function (qq) { return qq.id === ids[i]; });
        }
        if (target < 0) target = missingRequiredIndices(q)[0] || 0;
        showNote(target);
        goTo(target, true);
        return;
      }
      hideNote();
      render(); // next queued questionnaire, or the composer returns
    }

    function requestCancel() {
      if (!q) return;
      var qid = q.id;
      ctx.ui.confirm({
        title: 'Cancel this questionnaire?',
        body: 'Remaining questions are cancelled, draft answers are not submitted, and the requester is notified.',
        confirmLabel: 'Cancel questionnaire',
        cancelLabel: 'Keep answering',
        danger: true
      }).then(function (ok) {
        if (!ok || !alive) return;
        callData(function () { data.cancelQuestionnaire(threadId, qid); });
        hideNote();
        render();
      });
    }

    function focusPrimary() {
      if (primaryBtn && !primaryBtn.disabled) primaryBtn.focus();
    }

    // Enter advances an answered question / attempts submit (the disabled-submit
    // attempt surfaces the inline note and navigates to the gap).
    root.addEventListener('keydown', function (e) {
      if (e.key !== 'Enter' || e.shiftKey || e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.target && e.target.closest && e.target.closest('button')) return; // buttons activate natively
      if (!q) return;
      e.preventDefault();
      if (idx === q.questions.length - 1) attemptSubmit();
      else if (hasAnswer(q.questions[idx])) goTo(idx + 1);
    });

    // External data changes (restart, harness, other modules) re-render; our own
    // mutations are muted so typing never loses focus.
    function onData(evt) {
      if (!alive || mute || !evt) return;
      if (evt.type === 'restarted') { shownQuests = {}; render(); return; }
      if (evt.threadId !== threadId) return;
      if (evt.type === 'questionnaire-resolved' && evt.id) {
        // a resolved questionnaire may re-run later (or a queued one activates);
        // let its entrance play again on next appearance.
        delete shownQuests[evt.id];
      }
      if (evt.type === 'questionnaire-updated' || evt.type === 'questionnaire-resolved') render();
    }
    K3.on('data', onData);

    announce(true);
    render();

    return {
      unmount: function () {
        if (!alive) return;
        alive = false;
        K3.off('data', onData);
        clearTimeout(animTimer);
        announce(false);
        root.remove();
      }
    };
  }

  function isActive(ctx, threadId) {
    try {
      return !!(ctx && ctx.data && typeof ctx.data.activeQuestionnaire === 'function' &&
        ctx.data.activeQuestionnaire(threadId));
    } catch (e) { return false; }
  }

  window.K3Questionnaire = { mount: mount, isActive: isActive };
})();
