/* ============================================================================
   Kimi K3 — Back Seat Driver controller + chrome (window.K3BSD).

   BSD receives bounded deltas, is read-only, cannot widen authority, and can
   NEVER block the primary turn — 'unavailable'/'timeout' results are
   display-only and Send is never gated by this module.

   Controller (ctx-free, like K3Data):
   - K3BSD.get(threadId)        -> {mode, scope, autoActive, lastResult,
                                    turnExpires, overridden} (defaults:
                                    mode 'auto', scope 'thread' = inherit)
   - K3BSD.set(threadId, {mode, scope})
       mode: 'off'|'auto'|'on' (null clears to inherit); scope: 'turn'|'thread'
       ('turn' stamps turnExpires and reverts via onTurnComplete).
   - K3BSD.onTurnComplete(threadId) -> reverts a 'turn'-scoped override back to
       the project inherit state. Called by composer/demo pacing.
   - K3BSD.setAutoActive(threadId, bool) — truthful "evaluating" flag; the glow
       is shown ONLY while this is true.
   - K3BSD.pushResult(threadId, result)
       result: {kind:'silent'|'advice'|'duplicate'|'timeout'|'unavailable'|
       'quota', summary, at}. Always emits 'bsd-changed'; kind 'advice' also
       emits 'bsd-advice'.

   Chrome (four compositions over the one controller, mapped per window):
   - K3BSD_VARIANTS = {w1:'mono', w2:'chip', w3:'token', w4:'chip',
                       w5:'token', w6:'rail', w7:'mono', w8:'rail'}
   - K3BSD.button(ctx, variant) -> element (.unmount() drops subscriptions)
       mono  — circular monogram button + popover detail
       chip  — labeled pill "BSD · Auto" + popover detail
       token — compact status token (detail mirrored via detailHost)
       rail  — icon with state ring (detail mirrored via detailHost)
   - K3BSD.detailHost(ctx, threadId) -> live-updating detail node for
       dock/console/pane hosts (token/rail variants). tid null = follow the
       active thread.

   Detail surface (popover + host share one builder): Off/Auto/On radio
   (Auto labeled "Auto — system default"), scope radio (This turn/This
   thread), last-result line, footer "BSD can only advise — it cannot run
   tools or widen access". CSS prefix k3b-. No emoji. No timers.
   ========================================================================== */
(function () {
  'use strict';

  var MODES = ['off', 'auto', 'on'];
  var SCOPES = ['turn', 'thread'];
  var RESULT_LABELS = {
    silent: 'Silent',
    advice: 'Advice available',
    duplicate: 'Duplicate suppressed',
    timeout: 'Timed out',
    unavailable: 'Unavailable',
    quota: 'Quota limited'
  };
  var FOOTER_TEXT = 'BSD can only advise — it cannot run tools or widen access';
  var radioSeq = 0;

  // per-window choreography variant (mirrors QUESTIONNAIRE_VARIANTS in
  // composer.js): same controller, distinct composition per concept.
  var K3BSD_VARIANTS = {
    w1: 'mono', w2: 'chip', w3: 'token', w4: 'chip',
    w5: 'token', w6: 'rail', w7: 'mono', w8: 'rail'
  };

  function store() { return window.K3Store; }
  function icons() { return window.K3Icons; }
  function emit(evt) { if (window.K3 && window.K3.emit) window.K3.emit('data', evt); }
  function activeThreadId(ctx) { return ctx.store.get('activeThreadId', null); }

  function icon(name, fallbackText) {
    if (icons() && icons().has(name)) return icons().get(name);
    var span = document.createElement('span');
    span.className = 'k3b-glyph-text';
    span.textContent = fallbackText || 'BSD';
    return span;
  }

  function el(tag, cls, text) {
    var node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text != null) node.textContent = text;
    return node;
  }

  // --- controller ------------------------------------------------------------

  function rawState(threadId) {
    if (!threadId) return {};
    return store().get('bsdState.' + threadId, null) || {};
  }

  function get(threadId) {
    var raw = rawState(threadId);
    return {
      mode: raw.mode != null ? raw.mode : 'auto',
      scope: raw.scope != null ? raw.scope : 'thread',
      autoActive: raw.autoActive === true,
      lastResult: raw.lastResult != null ? raw.lastResult : null,
      turnExpires: raw.turnExpires === true,
      overridden: raw.mode != null || raw.scope != null
    };
  }

  function write(threadId, next) {
    store().set('bsdState.' + threadId, next);
    emit({ type: 'bsd-changed', threadId: threadId, state: get(threadId) });
  }

  function set(threadId, patch) {
    if (!threadId || !patch) return get(threadId);
    var raw = rawState(threadId);
    var next = {
      autoActive: raw.autoActive === true,
      lastResult: raw.lastResult != null ? raw.lastResult : null
    };
    if (raw.mode != null) next.mode = raw.mode;
    if (raw.scope != null) next.scope = raw.scope;
    next.turnExpires = raw.turnExpires === true;
    if ('mode' in patch) {
      if (patch.mode == null) delete next.mode;
      else if (MODES.indexOf(patch.mode) >= 0) next.mode = patch.mode;
    }
    if ('scope' in patch) {
      if (patch.scope == null) { delete next.scope; next.turnExpires = false; }
      else if (SCOPES.indexOf(patch.scope) >= 0) {
        next.scope = patch.scope;
        next.turnExpires = patch.scope === 'turn';
      }
    }
    // a bare result/autoActive entry carries no override — collapse to inherit
    if (next.mode == null && next.scope == null && next.lastResult == null) next = null;
    write(threadId, next);
    return get(threadId);
  }

  // 'turn' scope auto-reverts to inherit once the turn completes.
  function onTurnComplete(threadId) {
    var raw = rawState(threadId);
    if (raw.scope !== 'turn' || raw.turnExpires !== true) return false;
    if (raw.lastResult != null) write(threadId, { autoActive: false, lastResult: raw.lastResult });
    else write(threadId, null);
    return true;
  }

  function setAutoActive(threadId, bool) {
    if (!threadId) return;
    var raw = rawState(threadId);
    var next = {};
    Object.keys(raw).forEach(function (k) { next[k] = raw[k]; });
    next.autoActive = bool === true;
    write(threadId, next);
  }

  function pushResult(threadId, result) {
    if (!threadId || !result || !RESULT_LABELS[result.kind]) return;
    var raw = rawState(threadId);
    var next = {};
    Object.keys(raw).forEach(function (k) { next[k] = raw[k]; });
    next.lastResult = {
      kind: result.kind,
      summary: String(result.summary != null ? result.summary : ''),
      at: result.at != null ? result.at : null
    };
    next.autoActive = false; // evaluation concluded — glow must stop
    write(threadId, next);
    if (result.kind === 'advice') {
      emit({ type: 'bsd-advice', threadId: threadId, result: next.lastResult });
    }
  }

  // --- shared detail surface (popover body AND dock/panel host) ---------------

  function radioRow(name, value, labelText, checked, onPick) {
    var lab = el('label', 'k3b-radio' + (checked ? ' is-checked' : ''));
    var input = document.createElement('input');
    input.type = 'radio';
    input.name = name;
    input.value = value;
    input.checked = checked;
    input.addEventListener('change', function () { if (input.checked) onPick(value); });
    lab.appendChild(input);
    lab.appendChild(el('span', 'k3b-radio-label', labelText));
    return lab;
  }

  function resultLine(st) {
    if (!st.lastResult) return 'No evaluations yet.';
    var r = st.lastResult;
    var line = 'Last result: ' + RESULT_LABELS[r.kind];
    if (r.summary) line += ' — ' + r.summary;
    return line;
  }

  // Fills `container` with the detail surface. onChange() is called after any
  // write so hosts can spring-resize / re-sync.
  function renderDetail(container, ctx, threadId, onChange) {
    container.innerHTML = '';
    var st = get(threadId);

    container.appendChild(el('div', 'k3b-detail-title', 'Back Seat Driver'));

    var modeName = 'k3b-mode-' + (++radioSeq);
    var modeGroup = el('div', 'k3b-radio-group');
    modeGroup.setAttribute('role', 'radiogroup');
    modeGroup.setAttribute('aria-label', 'BSD mode');
    [['off', 'Off'], ['auto', 'Auto — system default'], ['on', 'On']].forEach(function (pair) {
      modeGroup.appendChild(radioRow(modeName, pair[0], pair[1], st.mode === pair[0], function (v) {
        set(threadId, { mode: v });
        renderDetail(container, ctx, threadId, onChange);
        if (onChange) onChange();
      }));
    });
    container.appendChild(modeGroup);

    var scopeName = 'k3b-scope-' + (++radioSeq);
    var scopeGroup = el('div', 'k3b-radio-group');
    scopeGroup.setAttribute('role', 'radiogroup');
    scopeGroup.setAttribute('aria-label', 'BSD scope');
    [['turn', 'This turn'], ['thread', 'This thread']].forEach(function (pair) {
      scopeGroup.appendChild(radioRow(scopeName, pair[0], pair[1], st.scope === pair[0], function (v) {
        set(threadId, { scope: v });
        renderDetail(container, ctx, threadId, onChange);
        if (onChange) onChange();
      }));
    });
    container.appendChild(scopeGroup);
    if (st.scope === 'turn') {
      container.appendChild(el('div', 'k3b-scope-note', 'Reverts to the project default after this turn.'));
    }

    container.appendChild(el('div', 'k3b-last', resultLine(st)));
    container.appendChild(el('div', 'k3b-foot', FOOTER_TEXT));
  }

  function openDetailPopover(ctx, anchor) {
    var tid = activeThreadId(ctx);
    if (!tid) return null;
    var pop = ctx.ui.popover(anchor, function (popEl) {
      renderDetail(popEl, ctx, tid, function () { ctx.ui.springResize(popEl); });
    }, { className: 'k3b-pop' });
    return pop;
  }

  function openAdvicePopover(ctx, anchor) {
    var tid = activeThreadId(ctx);
    if (!tid) return null;
    var st = get(tid);
    if (!st.lastResult || st.lastResult.kind !== 'advice') return openDetailPopover(ctx, anchor);
    var pop = ctx.ui.popover(anchor, function (popEl) {
      popEl.innerHTML = '';
      popEl.appendChild(el('div', 'k3b-detail-title', 'BSD advice'));
      popEl.appendChild(el('p', 'k3b-advice-body', st.lastResult.summary || 'Advice is available.'));
      var settingsBtn = el('button', 'k3-btn k3-btn-ghost k3b-advice-settings', 'BSD settings…');
      settingsBtn.type = 'button';
      settingsBtn.setAttribute('data-testid', 'k3b-advice-settings');
      settingsBtn.addEventListener('click', function () {
        ctx.ui.closeAll();
        openDetailPopover(ctx, anchor);
      });
      popEl.appendChild(settingsBtn);
      popEl.appendChild(el('div', 'k3b-foot', FOOTER_TEXT));
    }, { className: 'k3b-pop k3b-pop-advice' });
    return pop;
  }

  // Click contract: an unread advice result opens the advice popover first;
  // everything else opens the detail popover.
  function openControl(ctx, anchor) {
    var tid = activeThreadId(ctx);
    if (!tid) return;
    var st = get(tid);
    if (st.lastResult && st.lastResult.kind === 'advice') openAdvicePopover(ctx, anchor);
    else openDetailPopover(ctx, anchor);
  }

  // --- shared button plumbing --------------------------------------------------

  function stateClass(st) {
    if (st.mode === 'off') return 'k3b-off';
    if (st.mode === 'on') return 'k3b-on';
    return st.autoActive ? 'k3b-eval' : 'k3b-auto';
  }

  function modeWord(st) {
    if (st.mode === 'off') return 'Off';
    if (st.mode === 'on') return 'On';
    return st.autoActive ? 'Evaluating' : 'Auto';
  }

  function applyState(btn, st) {
    btn.classList.remove('k3b-off', 'k3b-auto', 'k3b-eval', 'k3b-on');
    btn.classList.add(stateClass(st));
    var scopeWord = st.scope === 'turn' ? 'This turn' : 'This thread';
    var title = 'Back Seat Driver — ' + modeWord(st) + ' · ' + scopeWord;
    if (st.lastResult) title += ' · ' + RESULT_LABELS[st.lastResult.kind];
    btn.title = title;
    btn.setAttribute('aria-label', title);
  }

  function resultChip(st) {
    if (!st.lastResult) return null;
    var kind = st.lastResult.kind;
    var chip = el('span', 'k3b-result k3b-result-' + kind, RESULT_LABELS[kind]);
    chip.setAttribute('data-testid', 'k3b-result');
    return chip;
  }

  function subscribeFresh(ctx, refresh) {
    function onData(evt) {
      if (!evt) return;
      if (evt.type === 'bsd-changed' || evt.type === 'bsd-advice') refresh();
    }
    ctx.on('data', onData);
    var unsubBsd = ctx.store.subscribe('bsdState', refresh);
    var unsubActive = ctx.store.subscribe('activeThreadId', refresh);
    return function () {
      ctx.off('data', onData);
      unsubBsd();
      unsubActive();
    };
  }

  function finishButton(ctx, btn, refresh) {
    btn.addEventListener('click', function () { openControl(ctx, btn); });
    var unsubscribe = subscribeFresh(ctx, refresh);
    refresh();
    btn.unmount = unsubscribe;
    return btn;
  }

  // --- variants -----------------------------------------------------------------

  function buildMono(ctx) {
    var btn = el('button', 'k3-icon-btn k3b-btn k3b-mono');
    btn.type = 'button';
    btn.setAttribute('data-testid', 'k3b-button');
    btn.setAttribute('data-variant', 'mono');
    var glyph = el('span', 'k3b-glyph');
    glyph.appendChild(icon('bsd', 'BSD'));
    btn.appendChild(glyph);
    var dot = el('span', 'k3b-result-dot');
    dot.hidden = true;
    btn.appendChild(dot);
    return finishButton(ctx, btn, function () {
      var tid = activeThreadId(ctx);
      var st = get(tid);
      applyState(btn, st);
      dot.hidden = !st.lastResult;
      dot.className = 'k3b-result-dot' + (st.lastResult ? ' k3b-result-dot-' + st.lastResult.kind : '');
    });
  }

  function buildChip(ctx) {
    var btn = el('button', 'k3-chip k3b-btn k3b-chip');
    btn.type = 'button';
    btn.setAttribute('data-testid', 'k3b-button');
    btn.setAttribute('data-variant', 'chip');
    var glyph = el('span', 'k3b-glyph');
    glyph.appendChild(icon('bsd', 'BSD'));
    btn.appendChild(glyph);
    var label = el('span', 'k3b-chip-label');
    btn.appendChild(label);
    var chipHolder = el('span', 'k3b-chip-result');
    btn.appendChild(chipHolder);
    return finishButton(ctx, btn, function () {
      var tid = activeThreadId(ctx);
      var st = get(tid);
      applyState(btn, st);
      label.textContent = 'BSD · ' + modeWord(st);
      chipHolder.innerHTML = '';
      var chip = resultChip(st);
      if (chip) chipHolder.appendChild(chip);
    });
  }

  function buildToken(ctx) {
    var btn = el('button', 'k3b-btn k3b-token');
    btn.type = 'button';
    btn.setAttribute('data-testid', 'k3b-button');
    btn.setAttribute('data-variant', 'token');
    var dot = el('span', 'k3b-token-dot');
    btn.appendChild(dot);
    var label = el('span', 'k3b-token-label');
    btn.appendChild(label);
    return finishButton(ctx, btn, function () {
      var tid = activeThreadId(ctx);
      var st = get(tid);
      applyState(btn, st);
      var text = 'BSD ' + modeWord(st);
      if (st.lastResult) text += ' · ' + RESULT_LABELS[st.lastResult.kind];
      label.textContent = text;
    });
  }

  function buildRail(ctx) {
    var btn = el('button', 'k3-icon-btn k3b-btn k3b-rail');
    btn.type = 'button';
    btn.setAttribute('data-testid', 'k3b-button');
    btn.setAttribute('data-variant', 'rail');
    var glyph = el('span', 'k3b-glyph');
    glyph.appendChild(icon('bsd', 'BSD'));
    btn.appendChild(glyph);
    var ring = el('span', 'k3b-rail-ring');
    btn.appendChild(ring);
    return finishButton(ctx, btn, function () {
      var tid = activeThreadId(ctx);
      var st = get(tid);
      applyState(btn, st);
    });
  }

  // --- public --------------------------------------------------------------------

  var K3BSD = {
    get: get,
    set: set,
    setAutoActive: setAutoActive,
    pushResult: pushResult,
    onTurnComplete: onTurnComplete,

    button: function (ctx, variant) {
      var v = variant || K3BSD_VARIANTS[(ctx.env && ctx.env.windowId) || ''] || 'mono';
      if (v === 'chip') return buildChip(ctx);
      if (v === 'token') return buildToken(ctx);
      if (v === 'rail') return buildRail(ctx);
      return buildMono(ctx);
    },

    // Live detail mirror for dock/console/panel hosts (token/rail variants).
    // threadId null follows the active thread.
    detailHost: function (ctx, threadId) {
      var host = el('div', 'k3b-detail-host');
      host.setAttribute('data-testid', 'k3b-detail-host');
      function tid() { return threadId || activeThreadId(ctx); }
      function render() {
        var id = tid();
        if (!id) { host.innerHTML = ''; return; }
        renderDetail(host, ctx, id, null);
      }
      render();
      var unsubscribe = subscribeFresh(ctx, render);
      host.unmount = unsubscribe;
      return host;
    }
  };

  window.K3BSD = K3BSD;
  window.K3BSD_VARIANTS = K3BSD_VARIANTS;
})();
