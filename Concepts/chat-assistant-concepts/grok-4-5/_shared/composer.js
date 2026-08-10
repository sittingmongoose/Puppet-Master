/* Shared Send/Stop + scripted fake-send sequencer. */
(function () {
  'use strict';

  /** @type {Record<string, number[]>} */
  var timersByThread = Object.create(null);
  var bindings = [];

  function isRunning(store, threadId) {
    var run = store && store.demo && store.demo.runningByThread
      ? store.demo.runningByThread[threadId]
      : null;
    return !!(run && !run.stopped);
  }

  function draftText(store, threadId) {
    var t = store && store.threads && store.threads[threadId];
    return t && t.draft && t.draft.text != null ? String(t.draft.text) : '';
  }

  function clearTimers(threadId) {
    var list = timersByThread[threadId] || [];
    list.forEach(function (id) {
      clearTimeout(id);
    });
    timersByThread[threadId] = [];
  }

  function mirrorTimeouts(store, threadId) {
    var run = store.demo.runningByThread[threadId];
    if (run) run.timeoutIds = (timersByThread[threadId] || []).slice();
  }

  function schedule(store, threadId, ms, fn) {
    var id = setTimeout(function () {
      var list = timersByThread[threadId] || [];
      var idx = list.indexOf(id);
      if (idx !== -1) list.splice(idx, 1);
      mirrorTimeouts(store, threadId);
      fn();
    }, Math.max(0, ms | 0));
    if (!timersByThread[threadId]) timersByThread[threadId] = [];
    timersByThread[threadId].push(id);
    mirrorTimeouts(store, threadId);
    return id;
  }

  function buttonMode(store, threadId) {
    if (isRunning(store, threadId) && !String(draftText(store, threadId) || '').trim()) {
      return 'stop';
    }
    return 'send';
  }

  /**
   * Apply Send/Stop label immediately. Under reduced motion, skip swap
   * animation so the label stays readable without relying on opacity fades.
   */
  function applyButtonMode(button, mode) {
    if (!button) return 'send';
    var next = mode === 'stop' ? 'stop' : 'send';
    var label = next === 'stop' ? 'Stop' : 'Send';
    var prev = button.getAttribute('data-mode') || '';
    button.setAttribute('data-mode', next);
    button.setAttribute('aria-label', label);
    button.setAttribute('title', label);
    /* Preserve SVG icon — never wipe with textContent on the whole button. */
    var labelEl = button.querySelector('.pm-composer-btn-label');
    if (labelEl) {
      labelEl.textContent = label;
    } else {
      var span = document.createElement('span');
      span.className = 'pm-composer-btn-label';
      span.textContent = label;
      button.appendChild(span);
    }
    var iconName = next === 'stop' ? 'stop' : 'arrowUp';
    var iconHost = button.querySelector('.pm-btn-icon, svg');
    if (typeof window.PMIcon === 'function') {
      var html = window.PMIcon(iconName, 'pm-btn-icon');
      if (html) {
        if (iconHost && iconHost.parentNode === button) {
          iconHost.outerHTML = html;
        } else if (!button.querySelector('.pm-btn-icon, svg')) {
          button.insertAdjacentHTML('afterbegin', html);
        } else {
          var firstSvg = button.querySelector('svg');
          if (firstSvg) firstSvg.outerHTML = html;
        }
      }
    }
    button.classList.remove('is-label-swap', 'is-mode-morph');
    button.classList.toggle('is-stop', next === 'stop');
    button.classList.toggle('is-send', next === 'send');
    var reduced =
      window.PMChatMotion && typeof window.PMChatMotion.isReduced === 'function'
        ? window.PMChatMotion.isReduced()
        : false;
    if (!reduced && prev && prev !== next) {
      void button.offsetWidth;
      button.classList.add('is-label-swap', 'is-mode-morph');
      window.setTimeout(function () {
        button.classList.remove('is-label-swap', 'is-mode-morph');
      }, 320);
    }
    return next;
  }

  function onInput(store, threadId, text) {
    store.setDraft(threadId, { text: text == null ? '' : String(text) });
  }

  function stop(store, threadId) {
    if (!isRunning(store, threadId)) return null;
    var run = store.demo.runningByThread[threadId] || {};
    clearTimers(threadId);
    var stopBody =
      run.stopResultBody != null
        ? run.stopResultBody
        : run.reply && run.reply.stopResultBody != null
          ? run.reply.stopResultBody
          : 'Stopped before completion.';
    var msg = store.appendStoppedResult(threadId, stopBody);
    store.setRunning(threadId, null);
    return msg;
  }

  function finishReply(store, threadId, reply) {
    clearTimers(threadId);
    if (!isRunning(store, threadId)) return;
    store.appendAssistantFromReply(threadId, reply);
    store.advanceScriptedCursor(threadId);
  }

  function startScriptedRun(store, threadId, reply) {
    clearTimers(threadId);
    var sequence = Array.isArray(reply.workingSummarySequence)
      ? reply.workingSummarySequence.slice()
      : ['Working'];
    var durations = Array.isArray(reply.stepDurationsMs) ? reply.stepDurationsMs.slice() : [];
    var step = 0;

    function putRunning(summary) {
      store.setRunning(threadId, {
        active: true,
        stopped: false,
        step: step,
        summary: summary,
        workingSummary: summary,
        stopResultBody: reply.stopResultBody || 'Stopped before completion.',
        replyId: reply.id || null,
        reply: reply,
        timeoutIds: (timersByThread[threadId] || []).slice()
      });
      mirrorTimeouts(store, threadId);
    }

    putRunning(sequence[0] || 'Working');

    function advance() {
      if (!isRunning(store, threadId)) return;
      step += 1;
      if (step >= sequence.length) {
        finishReply(store, threadId, reply);
        return;
      }
      putRunning(sequence[step] || sequence[sequence.length - 1]);
      var wait = durations[step] != null ? durations[step] : durations[durations.length - 1] || 650;
      schedule(store, threadId, wait, advance);
    }

    var firstWait = durations[0] != null ? durations[0] : 650;
    schedule(store, threadId, firstWait, advance);
  }

  function send(store, threadId) {
    var text = String(draftText(store, threadId) || '');
    var trimmed = text.trim();
    var running = isRunning(store, threadId);
    var thread = store.threads && store.threads[threadId];
    var editingId =
      thread && thread.draft && thread.draft.editingMessageId
        ? thread.draft.editingMessageId
        : null;

    if (editingId && trimmed && typeof store.applyEditedMessageRewind === 'function') {
      store.pushDraftRevision(threadId);
      var edited = store.applyEditedMessageRewind(threadId, editingId, text);
      var reply = store.getNextScriptedReply(threadId);
      if (reply) startScriptedRun(store, threadId, reply);
      else store.setRunning(threadId, null);
      return edited;
    }

    if (running) {
      /* Typing while running → button is Send; append without stopping. */
      if (!trimmed) return null;
      store.pushDraftRevision(threadId);
      var queued = store.appendUserMessage(threadId, text);
      store.clearDraft(threadId);
      return queued;
    }

    if (!trimmed) return null;

    store.pushDraftRevision(threadId);
    var userMsg = store.appendUserMessage(threadId, text);
    store.clearDraft(threadId);

    var replyNew = store.getNextScriptedReply(threadId);
    if (!replyNew) {
      store.setRunning(threadId, null);
      return userMsg;
    }
    startScriptedRun(store, threadId, replyNew);
    return userMsg;
  }

  function resolveEls(getComposerEls) {
    if (typeof getComposerEls !== 'function') return null;
    var els = getComposerEls() || {};
    return {
      input: els.input || els.textarea || els.composerInput || null,
      button: els.button || els.sendButton || els.composerButton || null
    };
  }

  function bind(opts) {
    opts = opts || {};
    var store = opts.store;
    var getComposerEls = opts.getComposerEls;
    var onRender = opts.onRender;
    if (!store) throw new Error('PMChatComposer.bind: store required');

    var unbound = false;

    function activeThreadId() {
      return (
        (opts.getThreadId && opts.getThreadId()) ||
        (store.session && store.session.activeThreadKey) ||
        null
      );
    }

    function syncButton() {
      var els = resolveEls(getComposerEls);
      if (!els || !els.button) return;
      var tid = activeThreadId();
      if (!tid) return;
      applyButtonMode(els.button, buttonMode(store, tid));
    }

    function refreshUi() {
      if (unbound) return;
      if (typeof onRender === 'function') onRender();
      syncButton();
    }

    var unsub =
      typeof store.subscribe === 'function'
        ? store.subscribe(refreshUi)
        : function () {};

    function wire() {
      var els = resolveEls(getComposerEls);
      if (!els) return;
      if (els.input && !els.input._pmComposerBound) {
        els.input._pmComposerBound = true;
        els.input.addEventListener('input', function () {
          var tid = activeThreadId();
          if (!tid) return;
          onInput(store, tid, els.input.value);
        });
        els.input.addEventListener('keydown', function (ev) {
          if (ev.key !== 'Enter' || ev.shiftKey) return;
          if (ev.isComposing) return;
          ev.preventDefault();
          var tid = activeThreadId();
          if (!tid) return;
          if (buttonMode(store, tid) === 'stop') stop(store, tid);
          else send(store, tid);
        });
      }
      if (els.button && !els.button._pmComposerBound) {
        els.button._pmComposerBound = true;
        els.button.addEventListener('click', function () {
          var tid = activeThreadId();
          if (!tid) return;
          if (buttonMode(store, tid) === 'stop') stop(store, tid);
          else send(store, tid);
        });
      }
    }

    wire();
    refreshUi();

    var binding = {
      refresh: wire,
      unbind: function () {
        unbound = true;
        unsub();
      }
    };
    bindings.push(binding);
    return binding;
  }

  window.PMChatComposer = {
    bind: bind,
    buttonMode: buttonMode,
    applyButtonMode: applyButtonMode,
    send: send,
    stop: stop,
    onInput: onInput
  };
})();
