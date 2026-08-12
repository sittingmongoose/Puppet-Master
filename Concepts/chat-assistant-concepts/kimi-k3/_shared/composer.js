/* ============================================================================
   Kimi K3 — composer module (window.K3Composer).

   Fills the window module's [data-k3-slot="composer"]. Per active thread:
   - Draft text + attachments persist through K3Data draft helpers (the
     store semantic slice), so they survive thread switches, docked/pop-out
     remounts, and simulated restarts.
   - Send/Stop state machine: agent active + empty draft -> Stop; active +
     typed text -> Redirect (K3ThreadOps.redirect when loaded, else the
     legacy steering send); inactive -> Send (disabled while the draft is
     empty). Enter sends, Shift+Enter newline.
   - Attachments: the attach button opens K3Attachments.pick (real resolver);
     resolution results become draft chips decorated with K3Attachments
     chipBadge. Drafts persist plain name STRINGS; resolution records live in
     a mount-local resolutionByName map.
   - Offline: while K3Sync.state() is 'offline'/'queued' Send routes to
     K3Sync.queueSend (never data.send) and a queued hint shows above the
     toolbar. A broken configured route (api-key-required etc.) disables Send
     with a Provider Settings deep-link hint under the toolbar.
   - Passive spellcheck: native spellcheck stays on; K3Spell.attach adds the
     context-menu suggestions (no toolbar button, no autocorrect).
   - Draft revisions: pushRevision on blur and every 15s while dirty;
     history menu restores a revision or clears the draft (with confirm).
   - Questionnaire takeover: while K3Data.activeQuestionnaire(threadId)
     returns a questionnaire the composer yields the slot to
     window.K3Questionnaire. Re-evaluated on every 'data' event and on
     activeThreadId changes. Only one UI occupies the slot at a time.
   ========================================================================== */
(function () {
  'use strict';

  var PLACEHOLDER = 'Message the assistant';
  var MAX_ROWS = 6;
  var REVISION_INTERVAL_MS = 15000;
  var PREVIEW_LEN = 50;
  // Route statuses that gate Send with a Provider Settings deep link.
  // 'ok' / 'update-available' / null (no route selected) never gate.
  var SETUP_STATUS_LABELS = {
    'api-key-required': 'API key required',
    'sign-in-required': 'Sign-in required',
    'cli-not-found': 'CLI not found',
    'update-required': 'Update required',
    'model-unavailable': 'Model unavailable',
    'usage-unavailable': 'Usage unavailable'
  };

  function icon(name) { return window.K3Icons.get(name); }

  // per-window questionnaire choreography variant. Each concept gets a
  // distinct entrance/motion feel; the data interaction is shared.
  //   morph        — faithful to the reference video: pill<->card height
  //                  morph, staged option reveal, Skip->Submit morph.
  //   rise         — calm/airy: question rises inline, options cascade.
  //   stack        — playful/tactile: card scales in elastically, advances
  //                  push the card out and the next springs from depth.
  //   inline-strip — compact: expanding strip -> option reel, minimal footprint.
  var QUESTIONNAIRE_VARIANTS = {
    w1: 'morph', w2: 'rise', w3: 'stack', w4: 'rise',
    w5: 'inline-strip', w6: 'stack', w7: 'morph', w8: 'inline-strip'
  };
  function windowQuestionnaireVariant(windowId) {
    return QUESTIONNAIRE_VARIANTS[windowId] || 'morph';
  }

  function mount(slotEl, ctx) {
    var data = ctx.data;
    var store = ctx.store;
    var ui = ctx.ui;

    var threadId = store.get('activeThreadId', null);
    var mode = null;                 // null | 'composer' | 'questionnaire'
    var questionnaireInst = null;
    // Mount-local resolution records for draft attachment chips
    // (threadId + '::' + name -> resolution record from K3Attachments).
    var resolutionByName = {};
    var consumedCardIds = {};        // transcript attachment cards already ingested

    // --- composer-UI scoped state (rebuilt on every composer render) --------
    var root = null;
    var chipsWrap = null;
    var textarea = null;
    var actionBtn = null;
    var attachBtn = null;
    var revisionsBtn = null;
    var queueHintEl = null;
    var setupHintEl = null;
    var attachments = [];
    var dirty = false;               // text changed since last revision push
    var revTimer = null;
    var lastActionState = null;      // avoid rebuilding the button every key

    // --- small state helpers -------------------------------------------------
    function hasText() { return !!textarea && textarea.value.trim().length > 0; }
    function agentActive() { return !!(threadId && data.isActive(threadId)); }
    // Exact contract: active + empty -> stop; anything else -> send.
    function actionState() { return (agentActive() && !hasText()) ? 'stop' : 'send'; }

    function saveDraftNow() {
      if (!threadId) return;
      data.saveDraft(threadId, textarea.value, attachments);
    }

    function pushRevisionIfDirty() {
      if (!dirty || !threadId) return;
      data.pushRevision(threadId); // data.js dedupes identical, bounds to 8
      dirty = false;
    }

    // --- send gating: offline queue, provider setup, active-turn redirect ----
    function offlineLike() {
      if (!window.K3Sync || typeof window.K3Sync.state !== 'function') return false;
      var s = window.K3Sync.state();
      return s === 'offline' || s === 'queued';
    }

    // Broken configured route -> Send gates on Provider Settings. No route
    // selected (eff.route null) keeps the legacy send-enabled behavior.
    function setupIssue() {
      if (!threadId || typeof data.effective !== 'function') return null;
      var eff = data.effective(threadId);
      if (!eff || !eff.route) return null;
      var label = SETUP_STATUS_LABELS[eff.route.status];
      if (!label) return null;
      return { route: eff.route, label: label };
    }

    // Redirect is the visible label for send-during-work; the call itself is
    // guarded in doSend (K3ThreadOps.redirect when loaded, else the legacy
    // steering send).
    function redirectState() {
      return agentActive() && hasText() && !offlineLike();
    }

    // --- send / stop ----------------------------------------------------------
    function doSend() {
      if (!threadId || !hasText()) return;
      if (setupIssue()) return; // gated: the setup hint carries the deep link
      var text = textarea.value;
      if (offlineLike()) {
        window.K3Sync.queueSend(threadId, text, attachments.slice());
      } else if (redirectState() &&
          window.K3ThreadOps && typeof window.K3ThreadOps.redirect === 'function') {
        window.K3ThreadOps.redirect(threadId, text);
      } else {
        data.send(threadId, text);     // steers when the agent is working
      }
      data.clearDraft(threadId);       // send archives; clear is not a revision
      attachments = [];
      clearResolutionsFor(threadId);
      dirty = false;
      textarea.value = '';
      renderChips();
      autogrow();
      updateActionButton();
      textarea.focus();
    }

    function doStop() {
      if (!threadId) return;
      data.stop(threadId);
      updateActionButton();
    }

    function onActionClick() {
      if (actionState() === 'stop') doStop();
      else doSend();
    }

    // --- action button (single element; Send/Redirect share the send testid) --
    function updateActionButton() {
      if (!actionBtn) return;
      var state = actionState();
      var redirect = state === 'send' && redirectState();
      var key = state + (redirect ? ':redirect' : '');
      // Setup gates Send only — Stop must stay available on a broken route.
      var disabled = state === 'send' && (!hasText() || !!setupIssue());
      if (key !== lastActionState) {
        lastActionState = key;
        actionBtn.setAttribute('data-testid', state === 'stop' ? 'k3-composer-stop' : 'k3-composer-send');
        actionBtn.className = 'k3-btn k3c-action' + (state === 'stop' ? ' k3-btn-danger' : '');
        actionBtn.textContent = '';
        actionBtn.appendChild(icon(state === 'stop' ? 'stop' : (redirect ? 'redirect' : 'send')));
        var label = document.createElement('span');
        label.textContent = state === 'stop' ? 'Stop' : (redirect ? 'Redirect' : 'Send');
        actionBtn.appendChild(label);
      }
      actionBtn.disabled = disabled;
    }

    // --- attachments ------------------------------------------------------------
    // The attach button opens the real resolver (K3Attachments.pick). Draft
    // attachments persist as plain name strings; resolution records stay in
    // the mount-local resolutionByName map and decorate chips via chipBadge.
    function openAttachmentPicker() {
      if (!threadId) return;
      if (window.K3Attachments && typeof window.K3Attachments.pick === 'function') {
        window.K3Attachments.pick(ctx, attachBtn);
      }
    }

    function removeAttachment(index) {
      if (index < 0 || index >= attachments.length) return;
      var name = attachments[index];
      attachments.splice(index, 1);
      delete resolutionByName[threadId + '::' + name];
      saveDraftNow();
      renderChips();
    }

    function clearResolutionsFor(tid) {
      var prefix = tid + '::';
      Object.keys(resolutionByName).forEach(function (k) {
        if (k.indexOf(prefix) === 0) delete resolutionByName[k];
      });
    }

    function cardResolution(card) {
      return {
        cardId: card.id,
        state: card.state,
        file: card.file || null,
        derived: (card.derived || []).slice(),
        lineage: (card.lineage || []).slice(),
        reason: card.reason || null,
        summary: card.summary || null
      };
    }

    function findAttachmentCard(cardId) {
      var thread = threadId ? data.thread(threadId) : null;
      var msgs = thread && thread.messages ? thread.messages : [];
      for (var i = msgs.length - 1; i >= 0; i--) {
        var card = msgs[i] && msgs[i].attachmentCard;
        if (card && card.id === cardId) return card;
      }
      return null;
    }

    // A freshly appended attachmentCard becomes (or updates) a draft chip.
    // Cancelled/removed cards never produce chips.
    function ingestCard(card) {
      if (!threadId || !card || !card.id || consumedCardIds[card.id]) return;
      var name = card.file && card.file.name;
      if (!name) return;
      var state = String(card.state || '');
      if (state === 'cancelled' || state === 'removed') {
        consumedCardIds[card.id] = true;
        return;
      }
      consumedCardIds[card.id] = true;
      if (attachments.indexOf(name) < 0) attachments.push(name);
      resolutionByName[threadId + '::' + name] = cardResolution(card);
      saveDraftNow();
      renderChips();
    }

    // State updates on an already-ingested card (consent decisions, route
    // reevaluation): refresh the badge, or drop the chip when dismissed.
    function refreshAttachmentCard(cardId) {
      var card = findAttachmentCard(cardId);
      if (!card) return;
      var name = card.file && card.file.name;
      if (!name) return;
      var key = threadId + '::' + name;
      var state = String(card.state || '');
      if (state === 'cancelled' || state === 'removed') {
        var idx = attachments.indexOf(name);
        if (idx < 0 && !resolutionByName[key]) return;
        if (idx >= 0) attachments.splice(idx, 1);
        delete resolutionByName[key];
      } else {
        if (attachments.indexOf(name) < 0) attachments.push(name);
        resolutionByName[key] = cardResolution(card);
      }
      saveDraftNow();
      renderChips();
    }

    function renderChips() {
      if (!chipsWrap) return;
      chipsWrap.textContent = '';
      attachments.forEach(function (name, index) {
        var chip = document.createElement('span');
        chip.className = 'k3-chip k3c-chip';
        chip.setAttribute('data-testid', 'k3-composer-chip');
        chip.title = name;

        var ic = document.createElement('span');
        ic.className = 'k3c-chip-ic';
        ic.appendChild(icon('artifact'));
        chip.appendChild(ic);

        var label = document.createElement('span');
        label.className = 'k3c-chip-name';
        label.textContent = name;
        chip.appendChild(label);

        var rm = document.createElement('button');
        rm.type = 'button';
        rm.className = 'k3-icon-btn k3c-chip-x';
        rm.setAttribute('aria-label', 'Remove attachment ' + name);
        rm.appendChild(icon('close'));
        rm.addEventListener('click', function (e) {
          e.stopPropagation(); // never opens the chip detail popover
          removeAttachment(index);
        });
        chip.appendChild(rm);

        var resolution = resolutionByName[(threadId || '') + '::' + name];
        if (resolution && window.K3Attachments &&
            typeof window.K3Attachments.chipBadge === 'function') {
          window.K3Attachments.chipBadge(chip, resolution);
        }

        chipsWrap.appendChild(chip);
      });
    }

    // --- textarea auto-grow (1..6 rows, .k3-scroll only when scrollable) --------
    function autogrow() {
      if (!textarea) return;
      textarea.style.height = 'auto';
      var cs = window.getComputedStyle(textarea);
      var lh = parseFloat(cs.lineHeight);
      if (!lh || isNaN(lh)) lh = (parseFloat(cs.fontSize) || 13) * 1.5;
      var pad = (parseFloat(cs.paddingTop) || 0) + (parseFloat(cs.paddingBottom) || 0);
      var border = (parseFloat(cs.borderTopWidth) || 0) + (parseFloat(cs.borderBottomWidth) || 0);
      var min = lh + pad + border;
      var max = lh * MAX_ROWS + pad + border;
      var h = Math.max(min, Math.min(textarea.scrollHeight + border, max));
      textarea.style.height = h + 'px';
      textarea.classList.toggle('k3-scroll', textarea.scrollHeight + border > max + 1);
    }

    // --- draft revisions ----------------------------------------------------------
    function revisionLabel(rev) {
      var time = '';
      try {
        var d = new Date(rev.savedAt);
        if (!isNaN(d.getTime())) time = d.toLocaleTimeString();
      } catch (e) { /* keep empty time */ }
      var oneLine = String(rev.text || '').replace(/\s+/g, ' ').trim();
      var preview = oneLine.length > PREVIEW_LEN ? oneLine.slice(0, PREVIEW_LEN).trim() + '...' : oneLine;
      if (!preview) preview = '(empty draft)';
      return time ? time + ' — ' + preview : preview;
    }

    function restoreRevision(rev) {
      if (!threadId || !textarea) return;
      textarea.value = String(rev.text || '');
      saveDraftNow();              // restored text becomes the current draft
      dirty = false;
      autogrow();
      updateActionButton();
      textarea.focus();
    }

    function confirmClearDraft() {
      var tid = threadId;
      ui.confirm({
        title: 'Clear this draft?',
        body: 'This is distinct from sending.',
        confirmLabel: 'Clear draft',
        cancelLabel: 'Cancel',
        danger: true
      }).then(function (ok) {
        if (!ok) return;
        data.clearDraft(tid);
        if (mode !== 'composer' || !textarea || threadId !== tid) return;
        attachments = [];
        dirty = false;
        textarea.value = '';
        renderChips();
        autogrow();
        updateActionButton();
        textarea.focus();
      });
    }

    function openRevisionsMenu() {
      if (!threadId || !revisionsBtn) return;
      var draft = data.getDraft(threadId);
      var revs = draft ? draft.revisions : [];
      var items = [];
      if (revs.length === 0) {
        items.push({ label: 'No saved revisions', disabled: true });
      } else {
        revs.slice().reverse().forEach(function (rev) { // newest first
          items.push({
            label: revisionLabel(rev),
            icon: 'restore',
            action: function () { restoreRevision(rev); }
          });
        });
      }
      items.push({ type: 'separator' });
      items.push({
        label: 'Clear draft',
        icon: 'trash',
        danger: true,
        testid: 'k3-composer-clear',
        action: confirmClearDraft
      });
      ui.menu(revisionsBtn, items, { width: 340 });
    }

    // --- hint lines (offline queue above the toolbar, setup gate below) -------
    function updateHints() {
      if (queueHintEl) queueHintEl.hidden = !offlineLike();
      if (!setupHintEl) return;
      var issue = setupIssue();
      setupHintEl.textContent = '';
      if (!issue) { setupHintEl.hidden = true; return; }
      setupHintEl.hidden = false;
      setupHintEl.appendChild(document.createTextNode(
        issue.route.providerName + ' · ' + issue.label + ' — '));
      var link = document.createElement('button');
      link.type = 'button';
      link.className = 'k3c-setup-link';
      link.setAttribute('data-testid', 'k3-composer-setup-link');
      link.textContent = 'Open Provider Settings';
      link.addEventListener('click', function () {
        if (window.K3Route && typeof window.K3Route.openProviderSettings === 'function') {
          window.K3Route.openProviderSettings(ctx);
          return;
        }
        var routeKey = issue.route.key || null;
        ctx.store.set('settingsReturn', { threadId: threadId, routeKey: routeKey });
        ctx.emit('data', { type: 'settings-deeplink', threadId: threadId, routeKey: routeKey });
      });
      setupHintEl.appendChild(link);
    }

    // --- composer DOM -------------------------------------------------------------
    function buildButton(cls, testid, aria, iconName) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = cls;
      btn.setAttribute('data-testid', testid);
      btn.setAttribute('aria-label', aria);
      btn.title = aria;
      btn.appendChild(icon(iconName));
      return btn;
    }

    function renderComposer() {
      var draft = threadId ? data.getDraft(threadId) : null;
      // Normalize legacy persisted entries: drafts always store plain name
      // strings, but tolerate file objects from older sessions.
      attachments = (draft ? draft.attachments.slice() : []).map(function (a) {
        return typeof a === 'string' ? a : String((a && a.name) || 'attachment');
      });
      dirty = false;
      lastActionState = null;

      root = document.createElement('div');
      root.className = 'k3c';
      root.setAttribute('data-testid', 'k3-composer');

      chipsWrap = document.createElement('div');
      chipsWrap.className = 'k3c-chips';
      chipsWrap.setAttribute('data-testid', 'k3-composer-chips');
      root.appendChild(chipsWrap);

      textarea = document.createElement('textarea');
      textarea.className = 'k3c-input';
      textarea.setAttribute('data-testid', 'k3-composer-input');
      textarea.setAttribute('spellcheck', 'true');
      textarea.setAttribute('rows', '1');
      textarea.setAttribute('placeholder', PLACEHOLDER);
      textarea.setAttribute('aria-label', PLACEHOLDER);
      textarea.value = draft ? draft.text : '';
      root.appendChild(textarea);
      // Passive spellcheck menu (contextmenu only; native underline stays).
      if (window.K3Spell && typeof window.K3Spell.attach === 'function') {
        window.K3Spell.attach(ctx, textarea);
      }

      queueHintEl = document.createElement('div');
      queueHintEl.className = 'k3c-queue-hint';
      queueHintEl.setAttribute('data-testid', 'k3-composer-queued-hint');
      queueHintEl.textContent = 'Offline — messages queue to send';
      queueHintEl.hidden = true;
      root.appendChild(queueHintEl);

      var toolbar = document.createElement('div');
      toolbar.className = 'k3c-toolbar';

      attachBtn = buildButton('k3-icon-btn k3c-tool', 'k3-composer-attach', 'Attach a file', 'attach');
      attachBtn.addEventListener('click', openAttachmentPicker);
      toolbar.appendChild(attachBtn);

      revisionsBtn = buildButton('k3-icon-btn k3c-tool', 'k3-composer-revisions', 'Draft revision history', 'history');
      revisionsBtn.addEventListener('click', openRevisionsMenu);
      toolbar.appendChild(revisionsBtn);

      var spacer = document.createElement('span');
      spacer.className = 'k3c-spacer';
      toolbar.appendChild(spacer);

      actionBtn = document.createElement('button');
      actionBtn.type = 'button';
      actionBtn.addEventListener('click', onActionClick);
      toolbar.appendChild(actionBtn);

      root.appendChild(toolbar);

      setupHintEl = document.createElement('div');
      setupHintEl.className = 'k3c-setup-hint';
      setupHintEl.setAttribute('data-testid', 'k3-composer-setup-hint');
      setupHintEl.hidden = true;
      root.appendChild(setupHintEl);

      slotEl.appendChild(root);

      textarea.addEventListener('input', function () {
        dirty = true;
        saveDraftNow();
        autogrow();
        updateActionButton();
      });
      textarea.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          if (hasText()) doSend(); // empty draft while active: Enter does nothing
        }
      });
      textarea.addEventListener('blur', pushRevisionIfDirty);

      revTimer = setInterval(pushRevisionIfDirty, REVISION_INTERVAL_MS);

      renderChips();
      autogrow();
      updateActionButton();
      updateHints();
    }

    function teardownComposer() {
      if (revTimer) { clearInterval(revTimer); revTimer = null; }
      if (textarea) pushRevisionIfDirty();
      if (root && root.parentNode) root.parentNode.removeChild(root);
      root = null;
      chipsWrap = null;
      textarea = null;
      actionBtn = null;
      attachBtn = null;
      revisionsBtn = null;
      queueHintEl = null;
      setupHintEl = null;
      attachments = [];
      dirty = false;
      lastActionState = null;
    }

    // --- questionnaire takeover / composer: exactly one occupies the slot --------
    function syncMode() {
      var q = threadId ? data.activeQuestionnaire(threadId) : null;
      var canTakeOver = !!(q && window.K3Questionnaire && typeof window.K3Questionnaire.mount === 'function');

      if (canTakeOver) {
        if (mode !== 'questionnaire') {
          teardownComposer();
          // pick a per-window choreography variant so each concept gets a
          // distinct questionnaire feel. Falls back to the default ('morph').
          var variant = (window.K3 && window.K3.env && window.K3.env.windowId)
            ? windowQuestionnaireVariant(window.K3.env.windowId) : 'morph';
          questionnaireInst = window.K3Questionnaire.mount(slotEl, ctx, threadId, variant);
          mode = 'questionnaire';
        }
        return;
      }
      if (mode === 'questionnaire') {
        try { if (questionnaireInst && questionnaireInst.unmount) questionnaireInst.unmount(); } catch (e) {}
        questionnaireInst = null;
        mode = null;
      }
      if (mode !== 'composer') {
        renderComposer();
        mode = 'composer';
      } else {
        updateActionButton();
      }
    }

    function rebuildForThread() {
      if (mode === 'questionnaire') {
        try { if (questionnaireInst && questionnaireInst.unmount) questionnaireInst.unmount(); } catch (e) {}
        questionnaireInst = null;
      }
      teardownComposer();
      mode = null;
      syncMode();
    }

    // --- subscriptions --------------------------------------------------------------
    function onData(evt) {
      syncMode(); // takeover re-evaluates on EVERY data event
      if (mode !== 'composer') return;
      if (evt && evt.threadId === threadId) {
        if (evt.type === 'message-added' && evt.message && evt.message.attachmentCard) {
          ingestCard(evt.message.attachmentCard);
        } else if (evt.type === 'attachment-resolved' && evt.cardId) {
          refreshAttachmentCard(evt.cardId);
        }
      }
      updateHints(); // sync-changed / outbox-changed / route-changed land here
      if (!evt || !evt.threadId || evt.threadId === threadId) updateActionButton();
    }
    ctx.on('data', onData);

    var unsubStore = store.subscribe('activeThreadId', function () {
      var next = store.get('activeThreadId', null);
      if (next === threadId) { syncMode(); return; } // e.g. simulated restart
      threadId = next;
      rebuildForThread();
    });

    syncMode();

    return {
      unmount: function () {
        ctx.off('data', onData);
        unsubStore();
        if (mode === 'questionnaire') {
          try { if (questionnaireInst && questionnaireInst.unmount) questionnaireInst.unmount(); } catch (e) {}
          questionnaireInst = null;
        }
        teardownComposer();
        mode = null;
      }
    };
  }

  window.K3Composer = { mount: mount };
})();
