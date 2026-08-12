/* Shared Send/Stop + scripted fake-send sequencer + composer harness states. */
(function () {
  'use strict';

  /** @type {Record<string, number[]>} */
  var timersByThread = Object.create(null);
  var bindings = [];

  var HARNESS_STATES = [
    'ordinary',
    'multiline',
    'attachments',
    'question-xor',
    'redirect-active',
    'offline-queued',
    'provider-setup-required',
    'cross-project-grant',
    'spellcheck-suggestions',
    'send-disabled'
  ];

  function isRunning(store, threadId) {
    var run = store && store.demo && store.demo.runningByThread
      ? store.demo.runningByThread[threadId]
      : null;
    if (!run || run.stopped) return false;
    if (run.status === 'redirected' || run.status === 'interrupted') return true;
    return true;
  }

  function draftText(store, threadId) {
    var t = store && store.threads && store.threads[threadId];
    return t && t.draft && t.draft.text != null ? String(t.draft.text) : '';
  }

  function activeLocal(store, threadId) {
    if (store && typeof store.getThreadLocal === 'function' && threadId) {
      return store.getThreadLocal(threadId);
    }
    if (store && typeof store.getActiveLocal === 'function') {
      return store.getActiveLocal();
    }
    var t = store && store.threads && store.threads[threadId];
    return (t && t.localState) || null;
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
   * Derive composer harness/presentation state for demo + chrome.
   */
  function composerState(store, threadId) {
    var session = store && store.session;
    var run =
      store && store.demo && store.demo.runningByThread
        ? store.demo.runningByThread[threadId]
        : null;
    var thread = store && store.threads && store.threads[threadId];
    var local = activeLocal(store, threadId);
    var q =
      store && typeof store.getActiveQuestionnaire === 'function'
        ? store.getActiveQuestionnaire(threadId)
        : null;

    if (q) return { id: 'question-xor', reason: 'Questionnaire active · composer hidden' };
    if (session && session.composerState && HARNESS_STATES.indexOf(session.composerState) >= 0) {
      return {
        id: session.composerState,
        reason: session.composerStateReason || session.sendDisabledReason || ''
      };
    }
    if (session && session.providerSetupRequired) {
      return {
        id: 'provider-setup-required',
        reason:
          session.providerSetupRequired.reason ||
          session.providerSetupRequired.message ||
          'Provider setup required'
      };
    }
    if (session && session.crossProjectGrant) {
      return {
        id: 'cross-project-grant',
        reason: session.crossProjectGrant.text || 'Cross-project grant required'
      };
    }
    if (run && (run.status === 'redirected' || run.status === 'interrupted' || run.redirectText)) {
      return {
        id: 'redirect-active',
        reason: run.badge || 'Interrupted → Redirected',
        badge: run.badge || 'Interrupted → Redirected'
      };
    }
    if (session && session.sync && session.sync.state === 'offline') {
      var hasQueued =
        Array.isArray(session.outbox) &&
        session.outbox.some(function (row) {
          return row && row.status === 'queued';
        });
      return {
        id: 'offline-queued',
        reason: hasQueued ? 'Queued to send' : 'Offline · messages queue to outbox'
      };
    }
    if (session && session.sendDisabledReason) {
      return { id: 'send-disabled', reason: String(session.sendDisabledReason) };
    }
    var atts = thread && thread.draft && thread.draft.attachments;
    if (atts && atts.length) return { id: 'attachments', reason: '' };
    var text = draftText(store, threadId);
    if (text.indexOf('\n') >= 0) return { id: 'multiline', reason: '' };
    if (local && local.spellcheckEnabled !== false && session && session.spellcheckSuggestions) {
      return { id: 'spellcheck-suggestions', reason: '' };
    }
    return { id: 'ordinary', reason: '' };
  }

  function applyComposerState(rootOrComposer, store, threadId) {
    var el =
      rootOrComposer && rootOrComposer.getAttribute
        ? rootOrComposer
        : null;
    if (!el) return null;
    var target = el.matches && el.matches('[data-composer]') ? el : el.querySelector && el.querySelector('[data-composer]');
    if (!target) target = el;
    var st = composerState(store, threadId);
    target.setAttribute('data-composer-state', st.id);
    if (st.reason) target.setAttribute('data-composer-reason', st.reason);
    else target.removeAttribute('data-composer-reason');
    target.classList.toggle('is-redirect-active', st.id === 'redirect-active');
    target.classList.toggle('is-offline-queued', st.id === 'offline-queued');
    target.classList.toggle('is-provider-setup', st.id === 'provider-setup-required');
    target.classList.toggle('is-cross-project', st.id === 'cross-project-grant');
    target.classList.toggle('is-send-disabled', st.id === 'send-disabled');

    var badgeHost = target.querySelector('[data-redirect-badge]') || null;
    if (st.id === 'redirect-active') {
      if (!badgeHost) {
        badgeHost = document.createElement('div');
        badgeHost.className = 'pm-redirect-badge';
        badgeHost.setAttribute('data-redirect-badge', '1');
        target.insertBefore(badgeHost, target.firstChild);
      }
      badgeHost.textContent = st.badge || st.reason || 'Interrupted → Redirected';
      badgeHost.hidden = false;
    } else if (badgeHost) {
      badgeHost.hidden = true;
    }

    var reasonHost = target.querySelector('[data-composer-state-reason]');
    if (st.reason && st.id !== 'redirect-active') {
      if (!reasonHost) {
        reasonHost = document.createElement('div');
        reasonHost.className = 'pm-composer-state-reason';
        reasonHost.setAttribute('data-composer-state-reason', '1');
        target.appendChild(reasonHost);
      }
      reasonHost.textContent = st.reason;
      reasonHost.hidden = false;
    } else if (reasonHost) {
      reasonHost.hidden = true;
    }

    var input = target.querySelector('[data-composer-input]');
    if (input) {
      var local = activeLocal(store, threadId);
      var enabled = !(local && local.spellcheckEnabled === false);
      input.setAttribute('spellcheck', enabled ? 'true' : 'false');
    }

    var btn = target.querySelector('[data-composer-button]');
    if (btn && (st.id === 'send-disabled' || st.id === 'provider-setup-required')) {
      btn.setAttribute('disabled', 'disabled');
      btn.setAttribute('aria-disabled', 'true');
      btn.title = st.reason || 'Send disabled';
      btn.setAttribute(
        'aria-description',
        st.id === 'provider-setup-required'
          ? 'Provider setup required · choose another model or repair in Settings'
          : st.reason || 'Send disabled'
      );
    } else if (btn) {
      btn.removeAttribute('disabled');
      btn.removeAttribute('aria-disabled');
      btn.removeAttribute('aria-description');
    }

    var actionHost = target.querySelector('[data-provider-setup-actions]');
    if (st.id === 'provider-setup-required') {
      if (!actionHost) {
        actionHost = document.createElement('div');
        actionHost.className = 'pm-provider-setup-actions';
        actionHost.setAttribute('data-provider-setup-actions', '1');
        actionHost.innerHTML =
          '<button type="button" class="pm-btn" data-provider-setup-choose>Choose another model</button>' +
          '<button type="button" class="pm-btn pm-btn-ghost" data-provider-setup-settings>Settings ownership</button>';
        target.appendChild(actionHost);
        actionHost.addEventListener('click', function (ev) {
          var choose = ev.target.closest('[data-provider-setup-choose]');
          var settings = ev.target.closest('[data-provider-setup-settings]');
          var sess = store && store.session;
          if (choose && sess) {
            sess.providerSetupRequired = null;
            if (sess.composerState === 'provider-setup-required') {
              sess.composerState = 'ordinary';
              sess.composerStateReason = '';
            }
            if (
              sess.sendDisabledReason &&
              String(sess.sendDisabledReason).indexOf('Provider setup') >= 0
            ) {
              sess.sendDisabledReason = '';
            }
            if (store._emit) store._emit();
            var modelTrigger =
              document.querySelector('.pm-chat-selector[data-selector="model"] .pm6-tb-menu-trigger') ||
              document.querySelector('[data-selector="model"] .pm6-tb-menu-trigger');
            if (modelTrigger && typeof modelTrigger.click === 'function') {
              window.setTimeout(function () {
                modelTrigger.click();
              }, 30);
            }
            return;
          }
          if (settings) {
            var msg =
              'Provider & account managers · owned by Settings · deep-link not wired in this concept';
            if (window.PMChatMotion && typeof window.PMChatMotion.toast === 'function') {
              window.PMChatMotion.toast(msg, 2400);
            } else if (window.PMChatHost && typeof window.PMChatHost.toast === 'function') {
              window.PMChatHost.toast(msg);
            }
          }
        });
      }
      actionHost.hidden = false;
    } else if (actionHost) {
      actionHost.hidden = true;
    }
    return st;
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
          : 'Stopped.';
    if (typeof store.appendStoppedResult === 'function') {
      store.appendStoppedResult(threadId, stopBody);
    }
    store.setRunning(threadId, null);
    return stopBody;
  }

  function finishReply(store, threadId, reply) {
    clearTimers(threadId);
    if (typeof store.appendAssistantFromReply === 'function') {
      store.appendAssistantFromReply(threadId, reply);
    }
    store.setRunning(threadId, null);
  }

  function startScriptedRun(store, threadId, reply) {
    clearTimers(threadId);
    var steps = (reply && reply.activity) || [];
    var i = 0;
    store.setRunning(threadId, {
      status: 'running',
      reply: reply,
      partialBody: '',
      stopped: false
    });

    function putRunning(summary) {
      var cur = store.demo.runningByThread[threadId] || {};
      store.setRunning(threadId, {
        status: 'running',
        reply: reply,
        partialBody: cur.partialBody || '',
        activitySummary: summary,
        stopped: false
      });
    }

    function advance() {
      if (!isRunning(store, threadId)) return;
      if (i >= steps.length) {
        finishReply(store, threadId, reply);
        return;
      }
      var step = steps[i++];
      putRunning(step && (step.summary || step.label || step.kind) || 'Working');
      schedule(store, threadId, (step && step.ms) || 420, advance);
    }

    if (!steps.length) {
      schedule(store, threadId, 360, function () {
        finishReply(store, threadId, reply);
      });
      return;
    }
    advance();
  }

  function send(store, threadId) {
    var st = composerState(store, threadId);
    if (st.id === 'send-disabled' || st.id === 'provider-setup-required') {
      return null;
    }
    if (st.id === 'question-xor') return null;

    var text = draftText(store, threadId);
    var trimmed = String(text || '').trim();
    var thread = store.threads[threadId];
    var editingId = thread && thread.draft && thread.draft.editingMessageId;

    if (editingId && trimmed && typeof store.applyEditedMessageRewind === 'function') {
      store.applyEditedMessageRewind(threadId, editingId, text);
      return { edited: true };
    }

    if (isRunning(store, threadId) && trimmed) {
      /* Typing while running → button is Send; append without stopping.
         Active-turn redirect path when an attempt is live. */
      if (typeof store.redirectActiveTurn === 'function') {
        var redirected = store.redirectActiveTurn(threadId, trimmed);
        schedule(store, threadId, 500, function () {
          if (typeof store.markRedirectResumed === 'function') {
            store.markRedirectResumed(threadId);
          }
          var reply = store.getNextScriptedReply && store.getNextScriptedReply(threadId);
          if (reply) startScriptedRun(store, threadId, reply);
          else store.setRunning(threadId, null);
        });
        return redirected;
      }
    }

    if (!trimmed) return null;

    if (st.id === 'offline-queued' && typeof store.enqueueOutbox === 'function') {
      store.enqueueOutbox({
        id: 'ob-send-' + Date.now().toString(36),
        kind: 'send',
        payload: { threadId: threadId, text: trimmed },
        status: 'queued'
      });
      store.setDraft(threadId, { text: '' });
      return { queued: true };
    }

    var userMsg = store.appendUserMessage(threadId, trimmed);
    store.setDraft(threadId, { text: '' });
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
      button: els.button || els.sendButton || els.composerButton || null,
      root: els.root || els.composer || null
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
      var host = els.root || (els.input && els.input.closest && els.input.closest('[data-composer]'));
      if (host) applyComposerState(host, store, tid);
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
          var st = composerState(store, tid);
          if (st.id === 'send-disabled' || st.id === 'provider-setup-required') return;
          if (buttonMode(store, tid) === 'stop') stop(store, tid);
          else send(store, tid);
        });
      }
      if (els.button && !els.button._pmComposerBound) {
        els.button._pmComposerBound = true;
        els.button.addEventListener('click', function () {
          var tid = activeThreadId();
          if (!tid) return;
          var st = composerState(store, tid);
          if (st.id === 'send-disabled' || st.id === 'provider-setup-required') return;
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
    composerState: composerState,
    applyComposerState: applyComposerState,
    HARNESS_STATES: HARNESS_STATES,
    send: send,
    stop: stop,
    onInput: onInput
  };
})();
