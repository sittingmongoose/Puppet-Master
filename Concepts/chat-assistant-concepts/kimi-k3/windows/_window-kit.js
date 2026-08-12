/* ============================================================================
   Kimi K3 — window kit (window.K3WindowKit).

   Shared chrome components every window concept arranges. All classes are
   prefixed k3w-kit-. Every factory is re-callable (fresh DOM per call) and
   attaches an .unmount() to the returned element whenever it registers
   listeners/subscriptions, so window modules can tear down cleanly on
   docked<->pop-out remount.

   Coordinates against (loaded elsewhere; never created here):
   - window.K3Search.attach(inputEl, ctx) -> {unmount}
   - window.K3Search.open(ctx, anchorEl)  -> {close, el}
   - window.K3Lens.button(ctx)            -> element
   - window.K3Lens.mountBanner(host, ctx) -> {unmount}

   YIELD RULE (fixed): while ctx.data.activeQuestionnaire(threadId) is
   non-null, goalSurface/todoSurface/workChips collapse to a single slim
   strip ("Work continues in the background — surfaces return when the
   questionnaire resolves") and restore losslessly afterwards. Implemented
   by yieldWrap(): content stays mounted (hidden), state untouched, and the
   swap re-evaluates on K3 'questionnaire-active' and 'data' events.
   ========================================================================== */
(function () {
  'use strict';

  var SVG_NS = 'http://www.w3.org/2000/svg';

  // --- locked selector vocabularies -----------------------------------------
  var PERSONAS = ['Research analyst', 'Pair programmer', 'Planner', 'Reviewer'];
  var MODES = ['Ask', 'Agent', 'Plan', 'Deep plan'];
  var WORKTREES = ['main', 'feat-usage-redesign', 'fix-import-tests'];
  // selectors.model / selectors.effort remain as the persisted project-default
  // mirror for old sessions; the route picker (_shared/route.js) owns model,
  // effort, and speed selection now.
  var SELECTOR_DEFAULTS = {
    persona: 'Research analyst',
    model: 'Kimi K3',
    effort: 'High',
    mode: 'Agent',
    worktree: 'main'
  };

  // todo state -> {label, icon}; running rows additionally get .k3-running.
  var TODO_STATE_META = {
    'pending':   { label: 'Pending',   icon: 'dot' },
    'running':   { label: 'Running',   icon: 'activity' },
    'verifying': { label: 'Verifying', icon: 'search' },
    'complete':  { label: 'Complete',  icon: 'check' },
    'blocked':   { label: 'Blocked',   icon: 'warning' },
    'failed':    { label: 'Failed',    icon: 'close' },
    'skipped':   { label: 'Skipped',   icon: 'skip' },
    'cancelled': { label: 'Cancelled', icon: 'close' },
    'stale':     { label: 'Stale',     icon: 'timer' },
    'replanned': { label: 'Replanned', icon: 'branch' }
  };

  var YIELD_TEXT = 'Work continues in the background — surfaces return when the questionnaire resolves';

  // Used only when a blocked goal carries no blocker record of its own.
  var BLOCKED_FALLBACK = {
    cause: 'A signing key required to verify the audited build artifacts is missing from this environment.',
    affectedScope: 'Security audit — artifact signing and verification step',
    lastAttemptedRecovery: 'Retried verification with the local test certificate store.',
    whyRecoveryStopped: 'No approved signing key is available, and generating or fetching one would exceed the approved security scope.',
    nextSafeAction: 'Provide a scoped signing key, or stop the goal.'
  };

  // --- tiny DOM helpers -------------------------------------------------------
  function el(tag, className, text) {
    var n = document.createElement(tag);
    if (className) n.className = className;
    if (text != null) n.textContent = text;
    return n;
  }
  function icon(name) { return window.K3Icons.get(name); }
  function iconSpan(name, cls) { var s = el('span', cls || 'k3w-kit-row-status-ic'); s.appendChild(icon(name)); return s; }
  function ui(ctx) { return ctx.ui || window.K3UI; }
  function arr(v) { return Array.isArray(v) ? v : []; }

  function capitalize(s) {
    s = String(s || '');
    return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
  }
  // 'awaiting question' | 'awaiting_question' | 'awaiting-question' -> 'awaiting-question'
  function normStateKey(state) {
    return String(state || 'idle').toLowerCase().replace(/[\s_]+/g, '-');
  }
  function humanizeThreadState(state) {
    var k = normStateKey(state);
    if (k === 'awaiting-question') return 'Awaiting question';
    return k.split('-').map(capitalize).join(' ');
  }
  function threadDotVariant(state) {
    var k = normStateKey(state);
    if (k === 'running') return 'is-running';
    if (k === 'paused') return 'is-paused';
    if (k === 'blocked') return 'is-blocked';
    if (k === 'awaiting-question') return 'is-waiting';
    return '';
  }
  // classify a thread summary into one of three animated-symbol buckets:
  //   'working'         — actively doing work
  //   'needs-attention' — blocked / paused / awaiting a question
  //   'finished'        — idle, or a completed goal
  // Returns { bucket, icon, variant } for the statusSymbol builder.
  function threadStatusBucket(t) {
    if (!t) return { bucket: 'finished', icon: 'dot', variant: '' };
    var st = normStateKey(t.threadState);
    var gs = String(t.goalStatus || '').toLowerCase();
    if (st === 'running' || gs === 'running' || gs === 'replanning') {
      return { bucket: 'working', icon: 'activity', variant: 'is-working' };
    }
    if (st === 'blocked' || st === 'paused' || st === 'awaiting-question' ||
        (t.questionnairePending | 0) > 0 || gs === 'blocked' || gs === 'paused') {
      // awaiting-question / pending questionnaire => a question glyph;
      // blocked => warning; paused => a paused dot.
      if ((t.questionnairePending | 0) > 0 || st === 'awaiting-question') {
        return { bucket: 'needs-attention', icon: 'question', variant: 'is-attention' };
      }
      if (st === 'blocked' || gs === 'blocked') {
        return { bucket: 'needs-attention', icon: 'warning', variant: 'is-attention' };
      }
      return { bucket: 'needs-attention', icon: 'pause', variant: 'is-attention' };
    }
    if (gs === 'complete' || gs === 'completed') {
      return { bucket: 'finished', icon: 'check', variant: 'is-complete' };
    }
    return { bucket: 'finished', icon: 'dot', variant: '' };
  }
  // build the animated symbol element for a history row (symbol-only; no text).
  function statusSymbol(t) {
    var b = threadStatusBucket(t);
    var sym = el('span', 'k3w-kit-row-status k3w-kit-row-status-' + b.bucket);
    sym.setAttribute('title', humanizeThreadState(t.threadState)); // hover hint only
    sym.setAttribute('aria-label', humanizeThreadState(t.threadState));
    if (b.bucket === 'working') {
      // animated: orbit spinner (always in motion) + a leading activity glyph
      sym.appendChild(iconSpan(b.icon, 'k3w-kit-row-status-ic'));
      var orb = el('span', 'k3-orbit');
      orb.setAttribute('aria-hidden', 'true');
      for (var i = 0; i < 4; i++) orb.appendChild(el('i'));
      sym.appendChild(orb);
    } else if (b.bucket === 'needs-attention') {
      // slow-pulsing attention glyph
      var ic = iconSpan(b.icon, 'k3w-kit-row-status-ic k3-dot is-attention');
      sym.appendChild(ic);
    } else {
      // finished/idle: calm static glyph (complete gets a one-time settle-in)
      var cls = 'k3w-kit-row-status-ic';
      if (b.variant === 'is-complete') cls += ' k3w-kit-row-status-ic-done';
      sym.appendChild(iconSpan(b.icon, cls));
    }
    return sym;
  }
  function humanizeGoalStatus(status) {
    var k = String(status || '').toLowerCase();
    if (k === 'running') return 'Running';
    if (k === 'paused') return 'Paused';
    if (k === 'blocked') return 'Blocked';
    if (k === 'stopped') return 'Stopped';
    if (k === 'completed') return 'Complete';
    if (k === 'replanning') return 'Replanning';
    return capitalize(k || 'unknown');
  }
  function goalDotVariant(status) {
    var k = String(status || '').toLowerCase();
    if (k === 'running' || k === 'replanning') return 'is-running';
    if (k === 'paused') return 'is-paused';
    if (k === 'blocked') return 'is-blocked';
    if (k === 'completed') return 'is-complete';
    return ''; // stopped/unknown: neutral dot
  }

  function stateChip(state) {
    var chip = el('span', 'k3-chip k3w-kit-state');
    var variant = threadDotVariant(state);
    var dot = el('span', 'k3-dot' + (variant ? ' ' + variant : ''));
    chip.appendChild(dot);
    chip.appendChild(el('span', 'k3w-kit-state-label', humanizeThreadState(state)));
    return chip;
  }

  function relTime(iso) {
    if (!iso) return '';
    var then = Date.parse(iso);
    if (isNaN(then)) return '';
    var diff = Date.now() - then;
    if (diff < 0) diff = 0;
    var m = Math.floor(diff / 60000);
    if (m < 1) return 'just now';
    if (m < 60) return m + 'm ago';
    var h = Math.floor(m / 60);
    if (h < 24) return h + 'h ago';
    var d = Math.floor(h / 24);
    if (d < 7) return d + 'd ago';
    return new Date(then).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  }

  function fmtDuration(sec) {
    sec = Math.max(0, Math.round(Number(sec) || 0));
    if (sec < 60) return sec + 's';
    var m = Math.floor(sec / 60);
    if (m < 60) return m + 'm';
    var h = Math.floor(m / 60);
    var rm = m % 60;
    if (h < 24) return rm ? h + 'h ' + rm + 'm' : h + 'h';
    var d = Math.floor(h / 24);
    var rh = h % 24;
    return rh ? d + 'd ' + rh + 'h' : d + 'd';
  }
  function fmtInt(n) {
    n = Math.round(Number(n) || 0);
    return n.toLocaleString(undefined);
  }
  function fmtCost(n) {
    return '$' + (Number(n) || 0).toFixed(2);
  }

  function latestAssistantRuntime(thread) {
    var msgs = arr(thread && thread.messages);
    for (var i = msgs.length - 1; i >= 0; i--) {
      if (msgs[i].role === 'assistant' && msgs[i].runtime) return msgs[i].runtime;
    }
    return null;
  }
  function latestAssistantMessageId(thread) {
    var msgs = arr(thread && thread.messages);
    for (var i = msgs.length - 1; i >= 0; i--) {
      if (msgs[i].role === 'assistant') return msgs[i].id;
    }
    return null;
  }

  function kvRow(k, v) {
    var row = el('div', 'k3-kv');
    row.appendChild(el('span', 'k3-kv-k', k));
    row.appendChild(el('span', 'k3-kv-v', v));
    return row;
  }

  function iconButton(iconName, label, className, testid) {
    var b = el('button', 'k3-icon-btn' + (className ? ' ' + className : ''));
    b.type = 'button';
    b.setAttribute('aria-label', label);
    b.title = label;
    if (testid) b.setAttribute('data-testid', testid);
    b.appendChild(icon(iconName));
    return b;
  }

  // Filesystem-safe export filename ('<title>.json' contract).
  function safeFilename(title) {
    var base = String(title || 'thread').replace(/[\/\\:*?"<>|]/g, '-').trim();
    return (base || 'thread') + '.json';
  }
  function downloadText(filename, text) {
    var blob = new Blob([text], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  }
  function exportThread(ctx, threadId) {
    var text = ctx.data.exportThread(threadId);
    if (text == null) return;
    var t = ctx.data.thread(threadId);
    downloadText(safeFilename((t && t.title) || threadId), text);
  }

  function deleteThreadWithReselect(ctx, threadId) {
    var t = ctx.data.thread(threadId);
    var title = (t && t.title) || threadId;
    ui(ctx).confirm({
      title: 'Delete thread',
      body: '"' + title + '" will be permanently deleted. This cannot be undone.',
      confirmLabel: 'Delete',
      danger: true
    }).then(function (ok) {
      if (!ok) return;
      ctx.data.deleteThread(threadId);
      if (ctx.store.get('activeThreadId', null) === threadId) {
        var rest = ctx.data.listThreads();
        var next = null;
        for (var i = 0; i < rest.length; i++) {
          if (!rest[i].archived) { next = rest[i]; break; }
        }
        if (!next && rest.length) next = rest[0];
        ctx.store.set('activeThreadId', next ? next.id : null);
      }
    });
  }

  // --- yield rule -------------------------------------------------------------
  // Wraps a work surface: while a questionnaire is active on the thread the
  // content hides and a slim strip shows instead. Content stays mounted, so
  // restore is lossless. Re-checks on 'questionnaire-active' + 'data'.
  function yieldWrap(ctx, threadId, contentEl) {
    var wrap = el('div', 'k3w-kit-yieldwrap');
    var strip = el('div', 'k3w-kit-yield');
    strip.setAttribute('data-testid', 'k3w-kit-yield');
    var ic = el('span', 'k3w-kit-yield-ic');
    ic.appendChild(icon('activity'));
    strip.appendChild(ic);
    strip.appendChild(el('span', 'k3w-kit-yield-text', YIELD_TEXT));
    wrap.appendChild(strip);
    wrap.appendChild(contentEl);

    function render() {
      var yielding = false;
      try { yielding = !!ctx.data.activeQuestionnaire(threadId); } catch (e) { yielding = false; }
      // Exactly ONE of {strip, contentEl} may occupy layout space at a time.
      // The inactive one is collapsed to max-height:0 + overflow:hidden (a hard
      // collapse that works even though the wrapper is display:contents), with
      // an opacity crossfade layered on top. Surface state is untouched.
      if (yielding) {
        strip.style.opacity = '1';
        strip.style.maxHeight = 'none';
        strip.style.overflow = '';
        strip.style.pointerEvents = '';
        strip.removeAttribute('aria-hidden');
        contentEl.style.opacity = '0';
        contentEl.style.maxHeight = '0';
        contentEl.style.overflow = 'hidden';
        contentEl.style.pointerEvents = 'none';
        contentEl.setAttribute('aria-hidden', 'true');
      } else {
        strip.style.opacity = '0';
        strip.style.maxHeight = '0';
        strip.style.overflow = 'hidden';
        strip.style.pointerEvents = 'none';
        strip.setAttribute('aria-hidden', 'true');
        contentEl.style.opacity = '1';
        contentEl.style.maxHeight = 'none';
        contentEl.style.overflow = '';
        contentEl.style.pointerEvents = '';
        contentEl.removeAttribute('aria-hidden');
      }
    }
    function onQ(info) {
      if (!info || !info.threadId || info.threadId === threadId) render();
    }
    function onData() { render(); }
    window.K3.on('questionnaire-active', onQ);
    window.K3.on('data', onData);
    render();

    wrap.unmount = function () {
      window.K3.off('questionnaire-active', onQ);
      window.K3.off('data', onData);
      if (contentEl.unmount) contentEl.unmount();
    };
    return wrap;
  }

  // === 1. selectorRow ==========================================================
  function selectorRow(ctx) {
    var store = ctx.store;
    // Defaults on first mount (only where the store has no value yet).
    Object.keys(SELECTOR_DEFAULTS).forEach(function (k) {
      if (store.get('selectors.' + k, null) == null) store.set('selectors.' + k, SELECTOR_DEFAULTS[k]);
    });

    var wrap = el('div', 'k3w-kit-selectors');

    function peerButton(iconName, aria, testid) {
      var b = el('button', 'k3w-kit-sel');
      b.type = 'button';
      b.setAttribute('aria-label', aria);
      b.setAttribute('data-testid', testid);
      var ic = el('span', 'k3w-kit-sel-ic');
      ic.appendChild(icon(iconName));
      var label = el('span', 'k3w-kit-sel-label');
      var chev = el('span', 'k3w-kit-sel-chev');
      chev.appendChild(icon('chevron-down'));
      b.appendChild(ic);
      b.appendChild(label);
      b.appendChild(chev);
      return { btn: b, label: label };
    }

    var persona = peerButton('persona', 'Persona', 'k3w-kit-persona');
    var mode = peerButton('mode', 'Mode', 'k3w-kit-mode');
    var worktree = iconButton('worktree', 'Worktree', 'k3w-kit-worktree-btn', 'k3w-kit-worktree');

    wrap.appendChild(persona.btn);
    // Route picker replaces the old Model peer (the effort flyout moves into
    // the picker's submenu stack — clean cutover, no second effort menu).
    // K3Route.button keeps data-testid "k3w-kit-model" for harness compat.
    var routeBtn = window.K3Route.button(ctx);
    wrap.appendChild(routeBtn);
    wrap.appendChild(mode.btn);
    var accessBtn = window.K3Access.button(ctx);
    wrap.appendChild(accessBtn);
    var bsdBtn = window.K3BSD.button(ctx,
      (window.K3BSD_VARIANTS && window.K3BSD_VARIANTS[ctx.env.windowId]) || 'mono');
    wrap.appendChild(bsdBtn);
    wrap.appendChild(worktree);

    persona.btn.addEventListener('click', function () {
      var tid = store.get('activeThreadId', null);
      var eff = tid ? ctx.data.effective(tid) : null;
      var cur = (eff && eff.persona) || store.get('selectors.persona', SELECTOR_DEFAULTS.persona);
      var items = PERSONAS.map(function (p) {
        return {
          label: p,
          selected: p === cur,
          action: function () {
            // Persona is thread-local by default (packet: thread-local state);
            // "project default" is an explicit secondary choice.
            if (tid) {
              // Goal route-frozen rule: model/Persona/access changes while a
              // Goal runs require an explicit Update-Goal first.
              if (window.K3Work && window.K3Work.guardRouteChange &&
                  window.K3Work.guardRouteChange(ctx, tid)) return;
              ctx.data.setThreadLocal(tid, { persona: p });
            } else store.set('selectors.persona', p);
          }
        };
      });
      items.push({ type: 'header', label: 'Applies from the next turn · this thread only' });
      if (tid) {
        items.push({
          label: 'Set as project default',
          icon: 'check',
          action: function () {
            var tl = store.get('threadLocal.' + tid, null);
            if (tl && tl.persona != null) store.set('selectors.persona', tl.persona);
          }
        });
      }
      ui(ctx).menu(persona.btn, items, { searchable: true, searchPlaceholder: 'Search personas', width: 220 });
    });

    mode.btn.addEventListener('click', function () {
      var tid = store.get('activeThreadId', null);
      var eff = tid ? ctx.data.effective(tid) : null;
      var cur = (eff && eff.mode) || store.get('selectors.mode', SELECTOR_DEFAULTS.mode);
      var items = MODES.map(function (m) {
        return {
          label: m,
          selected: m === cur,
          action: function () {
            if (tid) {
              if (window.K3Work && window.K3Work.guardRouteChange &&
                  window.K3Work.guardRouteChange(ctx, tid)) return;
              ctx.data.setThreadLocal(tid, { mode: m });
            } else store.set('selectors.mode', m);
          }
        };
      });
      items.push({ type: 'header', label: 'Conversation/workflow mode is separate from the access profile · this thread only' });
      ui(ctx).menu(mode.btn, items, { width: 180 });
    });

    worktree.addEventListener('click', function () {
      var tid = store.get('activeThreadId', null);
      var eff = tid ? ctx.data.effective(tid) : null;
      var cur = (eff && eff.worktree) || store.get('selectors.worktree', SELECTOR_DEFAULTS.worktree);
      var items = WORKTREES.map(function (w) {
        return {
          label: w,
          selected: w === cur,
          action: function () {
            if (tid) ctx.data.setThreadLocal(tid, { worktree: w });
            else store.set('selectors.worktree', w);
          }
        };
      });
      ui(ctx).menu(worktree, items, { width: 220 });
    });

    // "This thread" mini chip appended to a peer label when the field carries
    // a thread-local override (packet: scope must be visible without crowding).
    function paintScope(btnEl, overridden) {
      var old = btnEl.querySelector('.k3w-kit-scope');
      if (old) old.remove();
      if (!overridden) return;
      var chip = el('span', 'k3w-kit-scope', 'This thread');
      chip.setAttribute('data-testid', 'k3w-kit-scope');
      btnEl.appendChild(chip);
    }

    function refreshLabels() {
      var tid = store.get('activeThreadId', null);
      var eff = tid ? ctx.data.effective(tid) : null;
      var p = (eff && eff.persona) || store.get('selectors.persona', SELECTOR_DEFAULTS.persona);
      var mo = (eff && eff.mode) || store.get('selectors.mode', SELECTOR_DEFAULTS.mode);
      var w = (eff && eff.worktree) || store.get('selectors.worktree', SELECTOR_DEFAULTS.worktree);
      persona.label.textContent = p;
      mode.label.textContent = mo;
      persona.btn.title = 'Persona: ' + p;
      mode.btn.title = 'Mode: ' + mo;
      worktree.title = 'Worktree: ' + w;
      worktree.setAttribute('aria-label', 'Worktree: ' + w);
      paintScope(persona.btn, !!(eff && eff.overrides.persona));
      paintScope(mode.btn, !!(eff && eff.overrides.mode));
    }
    var unsub = store.subscribe('selectors', refreshLabels);
    var unsubTl = store.subscribe('threadLocal', refreshLabels);
    var unsubActive = store.subscribe('activeThreadId', refreshLabels);
    refreshLabels();

    wrap.unmount = function () {
      unsub(); unsubTl(); unsubActive();
      if (routeBtn.unmount) routeBtn.unmount();
      if (accessBtn.unmount) accessBtn.unmount();
      if (bsdBtn.unmount) bsdBtn.unmount();
    };
    return wrap;
  }

  // === 2. searchBox ============================================================
  function searchBox(ctx) {
    var wrap = el('div', 'k3w-kit-search');
    var ic = el('span', 'k3w-kit-search-ic');
    ic.appendChild(icon('search'));
    var input = document.createElement('input');
    input.type = 'text';
    input.className = 'k3-input k3w-kit-search-input';
    input.placeholder = 'Search this chat';
    input.setAttribute('spellcheck', 'false');
    input.setAttribute('aria-label', 'Search this chat');
    wrap.appendChild(ic);
    wrap.appendChild(input);

    var handle = null;
    if (window.K3Search && typeof window.K3Search.attach === 'function') {
      handle = window.K3Search.attach(input, ctx);
    }
    // K3Search.attach stamps its own testid; the window-kit contract wins.
    input.setAttribute('data-testid', 'k3w-kit-search');

    wrap.unmount = function () { if (handle && handle.unmount) handle.unmount(); };
    return wrap;
  }

  // === 3. lensButton ===========================================================
  function lensButton(ctx) {
    if (window.K3Lens && typeof window.K3Lens.button === 'function') {
      return window.K3Lens.button(ctx);
    }
    // Lens module not loaded yet: inert placeholder, same chrome family.
    var b = iconButton('lens', 'Context Lens', 'k3w-kit-lens');
    b.disabled = true;
    return b;
  }

  // === 4. lensBannerHost =======================================================
  function lensBannerHost(ctx) {
    var host = el('div', 'k3w-kit-lens-banner');
    var handle = null;
    if (window.K3Lens && typeof window.K3Lens.mountBanner === 'function') {
      handle = window.K3Lens.mountBanner(host, ctx);
    }
    return {
      element: host,
      unmount: function () { if (handle && handle.unmount) handle.unmount(); }
    };
  }

  // === 5. contextRing ==========================================================
  function contextRing(ctx) {
    var R = 7;
    var C = 2 * Math.PI * R;

    var btn = el('button', 'k3w-kit-ring');
    btn.type = 'button';
    btn.setAttribute('data-testid', 'k3w-kit-ring');
    btn.title = 'Context usage';

    var svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('viewBox', '0 0 18 18');
    svg.setAttribute('width', '15');
    svg.setAttribute('height', '15');
    svg.setAttribute('aria-hidden', 'true');
    svg.classList.add('k3w-kit-ring-svg');
    var track = document.createElementNS(SVG_NS, 'circle');
    track.setAttribute('cx', '9');
    track.setAttribute('cy', '9');
    track.setAttribute('r', String(R));
    track.classList.add('k3w-kit-ring-track');
    var arc = document.createElementNS(SVG_NS, 'circle');
    arc.setAttribute('cx', '9');
    arc.setAttribute('cy', '9');
    arc.setAttribute('r', String(R));
    arc.setAttribute('transform', 'rotate(-90 9 9)');
    arc.setAttribute('stroke-dasharray', C.toFixed(2));
    arc.classList.add('k3w-kit-ring-arc');
    svg.appendChild(track);
    svg.appendChild(arc);
    btn.appendChild(svg);

    // Usage from the active thread's last runtime; falls back to ~62% and an
    // empty breakdown when the thread has no runtime data yet.
    function stats() {
      var tid = ctx.store.get('activeThreadId', null);
      var t = tid ? ctx.data.thread(tid) : null;
      var frac = 0.62;
      var input = 0, output = 0, cost = 0;
      if (t) {
        arr(t.messages).forEach(function (m) {
          if (!m.runtime) return;
          cost += Number(m.runtime.estimatedCost) || 0;
          var tok = Number(m.runtime.tokenCount) || 0;
          if (m.role === 'user') input += tok;
          else if (m.role === 'assistant') output += tok;
        });
        var last = latestAssistantRuntime(t);
        if (last && Number(last.contextLimit) > 0) {
          var used = Number(last.contextUsed) || 0;
          frac = Math.max(0, Math.min(1, used / last.contextLimit));
          if (!input) input = used;
        }
      }
      return { frac: frac, pct: Math.round(frac * 100), input: input, output: output, cost: cost };
    }

    function render() {
      var s = stats();
      arc.setAttribute('stroke-dashoffset', (C * (1 - s.frac)).toFixed(2));
      btn.setAttribute('aria-label', 'Context usage: ' + s.pct + '%');
    }

    function openPopover() {
      ui(ctx).popover(btn, function (root) {
        var s = stats();
        var box = el('div', 'k3w-kit-ringpop');
        var kvs = el('div', 'k3w-kit-ringpop-kvs');
        kvs.appendChild(kvRow('Usage %', s.pct + '%'));
        kvs.appendChild(kvRow('Input tokens', fmtInt(s.input)));
        kvs.appendChild(kvRow('Output tokens', fmtInt(s.output)));
        kvs.appendChild(kvRow('Est. cost', fmtCost(s.cost)));
        box.appendChild(kvs);
        var row = el('div', 'k3w-kit-ringpop-actions');
        var compact = el('button', 'k3-btn k3-btn-ghost k3w-kit-mini', 'Compact now');
        compact.type = 'button';
        var more = el('button', 'k3-btn k3-btn-ghost k3w-kit-mini', 'More details');
        more.type = 'button';
        row.appendChild(compact);
        row.appendChild(more);
        box.appendChild(row);
        root.appendChild(box);

        compact.addEventListener('click', function () {
          // Real operation: visible progress -> durable receipt in the
          // transcript. Canonical history and historical Usage are untouched.
          box.innerHTML = '';
          var prog = el('div', 'k3-footnote k3w-kit-ringpop-progress', 'Compacting context…');
          box.appendChild(prog);
          ui(ctx).springResize(root);
          var tid2 = ctx.store.get('activeThreadId', null);
          var finish = function () {
            if (tid2) {
              ctx.data.appendRecord(tid2, {
                receiptCard: {
                  id: 'rc-compact-' + tid2,
                  kind: 'compact',
                  title: 'Context compacted',
                  lines: [
                    { label: 'Tokens', value: '41,200 → 9,800' },
                    { label: 'Summary represents', value: '34 messages' },
                    { label: 'History', value: 'untouched — branch ancestry preserved' }
                  ]
                }
              });
            }
            window.K3.emit('data', { type: 'compact-now-done', threadId: tid2 });
            box.innerHTML = '';
            box.appendChild(el('div', 'k3-footnote', 'Context compacted — receipt added to the transcript.'));
            ui(ctx).springResize(root);
          };
          if (ui(ctx).reduced()) finish();
          else setTimeout(finish, 700);
        });
        more.addEventListener('click', function () {
          // Context Lens admission receipt (sources + provenance), not a
          // generic token dump.
          if (window.K3Lens && typeof window.K3Lens.openReceipt === 'function') {
            window.K3Lens.openReceipt(ctx, more);
          }
        });
      }, { align: 'right' });
    }

    // Real <button>: Enter/Space fire click natively. Hover is CSS-glow only.
    btn.addEventListener('click', openPopover);

    var unsub = ctx.store.subscribe('activeThreadId', render);
    function onData() { render(); }
    window.K3.on('data', onData);
    render();

    btn.unmount = function () {
      unsub();
      window.K3.off('data', onData);
    };
    return btn;
  }

  // === 6. moreMenu =============================================================
  function moreMenu(ctx) {
    var btn = iconButton('more', 'More actions', 'k3w-kit-more-btn', 'k3w-kit-more');

    function openThreadInfo(threadId) {
      var t = ctx.data.thread(threadId);
      if (!t) return;
      ui(ctx).popover(btn, function (root) {
        var box = el('div', 'k3w-kit-threadinfo');
        box.appendChild(kvRow('Title', t.title || threadId));
        box.appendChild(kvRow('Messages', fmtInt(arr(t.messages).length)));
        box.appendChild(kvRow('State', humanizeThreadState(t.threadState || 'idle')));
        box.appendChild(kvRow('Updated', relTime(t.updatedAt) || '—'));
        root.appendChild(box);
      }, { align: 'right' });
    }

    btn.addEventListener('click', function () {
      var tid = ctx.store.get('activeThreadId', null);
      var t = tid ? ctx.data.thread(tid) : null;
      var popout = ctx.env.mode !== 'popout';
      var items = [
        {
          label: popout ? 'Pop out' : 'Dock',
          icon: popout ? 'popout' : 'dock',
          action: function () { window.K3.setEnv({ mode: popout ? 'popout' : 'docked' }); }
        },
        { type: 'separator' },
        {
          label: 'Export thread',
          icon: 'export',
          disabled: !t,
          action: function () { exportThread(ctx, tid); }
        },
        {
          label: 'Thread info',
          icon: 'info',
          disabled: !t,
          // Defer: K3UI.menu closes every open popup right after the action,
          // so the info popover must open on the next tick.
          action: function () { setTimeout(function () { openThreadInfo(tid); }, 0); }
        },
        { type: 'separator' },
        {
          // Quiet spellcheck scope toggle (packet: thread overflow may carry it)
          label: (tid && store.get('spell.threadDisabled.' + tid, false))
            ? 'Enable spell check in this thread'
            : 'Disable spell check in this thread',
          icon: 'spell',
          disabled: !t,
          action: function () {
            if (!tid || !window.K3Spell) return;
            var cur = store.get('spell.threadDisabled.' + tid, false);
            window.K3Spell.toggleThread(tid, !cur);
          }
        },
        { type: 'separator' },
        {
          label: t && t.archived ? 'Unarchive thread' : 'Archive thread',
          icon: t && t.archived ? 'unarchive' : 'archive',
          disabled: !t,
          action: function () { ctx.data.archiveThread(tid, !(t && t.archived)); }
        },
        {
          label: 'Delete thread',
          icon: 'trash',
          danger: true,
          disabled: !t,
          action: function () { deleteThreadWithReselect(ctx, tid); }
        }
      ];
      ui(ctx).menu(btn, items, { align: 'right', width: 210 });
    });
    return btn;
  }

  // === 7. header ===============================================================
  function header(ctx, opts) {
    opts = opts || {};
    var showSearch = opts.showSearch !== false;
    var compact = opts.compact === true;

    var root = el('div', 'k3w-kit-header');

    var line1 = el('div', 'k3w-kit-titleline');
    var title = el('span', 'k3w-kit-title');
    title.setAttribute('data-testid', 'k3w-kit-title');
    var chipHolder = el('span', 'k3w-kit-title-chip');
    line1.appendChild(title);
    line1.appendChild(chipHolder);
    // Offline/sync pill arrives via the header for every window concept.
    var syncPill = window.K3Sync ? window.K3Sync.pill(ctx) : null;
    if (syncPill) chipHolder.appendChild(syncPill);
    var tag = el('span', 'k3-agent-tag', 'Kimi K3');
    tag.setAttribute('data-concept-model', 'Kimi K3');
    line1.appendChild(tag);

    var line2 = el('div', 'k3w-kit-controls');
    var sel = selectorRow(ctx);
    line2.appendChild(sel);

    var searchEl = null;
    if (showSearch && !compact) {
      searchEl = searchBox(ctx);
      line2.appendChild(searchEl);
    } else if (showSearch && compact) {
      var searchBtn = iconButton('search', 'Search this chat', 'k3w-kit-search-open-btn', 'k3w-kit-search-open');
      searchBtn.addEventListener('click', function () {
        if (window.K3Search && typeof window.K3Search.open === 'function') {
          window.K3Search.open(ctx, searchBtn);
        }
      });
      searchEl = searchBtn;
      line2.appendChild(searchBtn);
    }

    var lens = lensButton(ctx);
    line2.appendChild(lens);
    var ring = contextRing(ctx);
    line2.appendChild(ring);
    var more = moreMenu(ctx);
    line2.appendChild(more);

    root.appendChild(line1);
    root.appendChild(line2);

    function renderTitle() {
      var tid = ctx.store.get('activeThreadId', null);
      var t = tid ? ctx.data.thread(tid) : null;
      title.textContent = t ? (t.title || tid) : 'No thread selected';
      title.title = t ? (t.title || tid) : '';
      // rebuild only the state chip; the sync pill is persistent chrome
      chipHolder.querySelectorAll('.k3w-kit-state').forEach(function (n) { n.remove(); });
      var st = t ? normStateKey(t.threadState || 'idle') : 'idle';
      if (st !== 'idle') chipHolder.appendChild(stateChip(st));
      if (syncPill && syncPill.parentNode !== chipHolder) chipHolder.appendChild(syncPill);
    }
    var unsubActive = ctx.store.subscribe('activeThreadId', renderTitle);
    function onData() { renderTitle(); }
    window.K3.on('data', onData);
    renderTitle();

    root.unmount = function () {
      unsubActive();
      window.K3.off('data', onData);
      if (sel.unmount) sel.unmount();
      if (searchEl && searchEl.unmount) searchEl.unmount();
      if (ring.unmount) ring.unmount();
      if (syncPill && syncPill.unmount) syncPill.unmount();
    };
    return root;
  }

  // === 8. historyPanel =========================================================
  function historyPanel(ctx, opts) {
    opts = opts || {};
    var store = ctx.store;
    var data = ctx.data;

    var root = el('div', 'k3w-kit-history');
    root.setAttribute('data-testid', 'k3w-kit-history');

    var head = el('div', 'k3w-kit-history-head');
    head.appendChild(el('span', 'k3w-kit-history-heading', 'Chats'));
    var newBtn = iconButton('plus', 'New chat', 'k3w-kit-new-thread-btn', 'k3w-kit-new-thread');
    newBtn.addEventListener('click', function () {
      var t = data.createThread('New chat');
      if (t) store.set('activeThreadId', t.id);
    });
    head.appendChild(newBtn);

    var filter = document.createElement('input');
    filter.type = 'text';
    filter.className = 'k3-input k3w-kit-history-filter';
    filter.placeholder = 'Filter chats';
    filter.setAttribute('aria-label', 'Filter chats');
    filter.setAttribute('spellcheck', 'false');
    filter.setAttribute('data-testid', 'k3w-kit-history-filter');
    filter.value = store.get('history.query', '') || '';
    filter.addEventListener('input', function () {
      store.set('history.query', filter.value);
    });

    var list = el('div', 'k3w-kit-history-list k3-scroll');

    root.appendChild(head);
    root.appendChild(filter);
    root.appendChild(list);

    function badge(iconName, label) {
      var b = el('span', 'k3w-kit-badge');
      b.title = label;
      b.setAttribute('aria-label', label);
      b.appendChild(icon(iconName));
      return b;
    }

    function startRename(row, t) {
      var titleEl = row.querySelector('.k3w-kit-row-title');
      if (!titleEl) return;
      var input = document.createElement('input');
      input.type = 'text';
      input.className = 'k3-input k3w-kit-rename';
      input.value = t.title || '';
      input.setAttribute('aria-label', 'Rename chat');
      titleEl.replaceWith(input);
      input.focus();
      input.select();
      var done = false;
      function commit() {
        if (done) return;
        done = true;
        var v = input.value.trim();
        if (v && v !== t.title) data.renameThread(t.id, v);
        else renderList();
      }
      function cancel() {
        if (done) return;
        done = true;
        renderList();
      }
      input.addEventListener('click', function (e) { e.stopPropagation(); });
      input.addEventListener('keydown', function (e) {
        e.stopPropagation(); // keep row Enter/Space activation away
        if (e.key === 'Enter') { e.preventDefault(); commit(); }
        else if (e.key === 'Escape') { e.preventDefault(); cancel(); }
      });
      input.addEventListener('blur', commit);
    }

    function rowMenu(t, anchor) {
      var items = [
        {
          label: t.pinned ? 'Unpin' : 'Pin',
          icon: t.pinned ? 'pin-off' : 'pin',
          action: function () { data.pinThread(t.id, !t.pinned); }
        },
        {
          label: 'Rename',
          icon: 'rename',
          action: function () {
            var row = list.querySelector('[data-testid="k3w-kit-thread-row-' + t.id + '"]');
            if (row) startRename(row, t);
          }
        },
        { type: 'separator' },
        {
          label: 'Branch from here',
          icon: 'branch',
          action: function () {
            var msgs = data.messages(t.id);
            var last = msgs[msgs.length - 1];
            data.branchThread(t.id, last && last.id);
          }
        },
        {
          label: 'Export thread',
          icon: 'export',
          action: function () { exportThread(ctx, t.id); }
        },
        { type: 'separator' },
        {
          label: t.archived ? 'Unarchive' : 'Archive',
          icon: t.archived ? 'unarchive' : 'archive',
          action: function () { data.archiveThread(t.id, !t.archived); }
        },
        {
          label: 'Delete',
          icon: 'trash',
          danger: true,
          action: function () { deleteThreadWithReselect(ctx, t.id); }
        }
      ];
      ui(ctx).menu(anchor, items, { align: 'right', width: 200 });
    }

    function buildRow(t, activeId) {
      var row = el('div', 'k3w-kit-thread-row' + (t.id === activeId ? ' is-active' : ''));
      row.setAttribute('data-testid', 'k3w-kit-thread-row-' + t.id);
      row.setAttribute('role', 'button');
      row.tabIndex = 0;
      row.setAttribute('aria-label', t.title || t.id);

      var main = el('span', 'k3w-kit-row-main');
      var titleEl = el('span', 'k3w-kit-row-title', t.title || t.id);
      titleEl.title = t.title || t.id;
      // animated status symbol at the row's leading edge (symbol-only; the
      // text status was removed in favor of a working/needs-attention/finished
      // animation). Hover reveals the human-readable label via title.
      var sym = statusSymbol(t);
      main.appendChild(sym);
      main.appendChild(titleEl);
      var moreBtn = el('button', 'k3-icon-btn k3w-kit-row-more');
      moreBtn.type = 'button';
      moreBtn.setAttribute('aria-label', 'Thread actions');
      moreBtn.title = 'Thread actions';
      moreBtn.appendChild(icon('more'));
      moreBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        rowMenu(t, moreBtn);
      });
      main.appendChild(titleEl);
      main.appendChild(moreBtn);

      var sub = el('span', 'k3w-kit-row-sub');
      // (status text removed — the leading symbol in .k3w-kit-row-main now
      // carries working/needs-attention/finished. Keep the content badges + time.)
      var badges = el('span', 'k3w-kit-row-badges');
      if (t.hasDraft) badges.appendChild(badge('draft', 'Draft in progress'));
      if (t.questionnairePending > 0) {
        badges.appendChild(badge('question', t.questionnairePending === 1 ? '1 question waiting' : t.questionnairePending + ' questions waiting'));
      }
      if (t.hasGoal) badges.appendChild(badge('goal', 'Goal attached'));
      if (t.hasArtifacts) badges.appendChild(badge('artifact', 'Has artifacts'));
      sub.appendChild(badges);
      sub.appendChild(el('span', 'k3w-kit-row-time', relTime(t.updatedAt)));

      row.appendChild(main);
      row.appendChild(sub);

      function activate() { store.set('activeThreadId', t.id); }
      row.addEventListener('click', activate);
      row.addEventListener('keydown', function (e) {
        if (e.target !== row) return;
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activate(); }
      });
      return row;
    }

    function groupHeader(text) {
      list.appendChild(el('div', 'k3w-kit-history-group', text));
    }

    function renderList() {
      var activeId = store.get('activeThreadId', null);
      var q = (store.get('history.query', '') || '').trim().toLowerCase();
      var showArchived = store.get('history.showArchived', false) === true;

      var threads = data.listThreads();
      if (q) {
        threads = threads.filter(function (t) {
          return (t.title || '').toLowerCase().indexOf(q) >= 0 ||
                 (t.project || '').toLowerCase().indexOf(q) >= 0;
        });
      }
      function byRecent(a, b) {
        return String(b.updatedAt || '').localeCompare(String(a.updatedAt || ''));
      }
      var pinned = threads.filter(function (t) { return t.pinned && !t.archived; }).sort(byRecent);
      var recent = threads.filter(function (t) { return !t.pinned && !t.archived; }).sort(byRecent);
      var archived = threads.filter(function (t) { return t.archived; }).sort(byRecent);

      list.innerHTML = '';
      if (pinned.length) {
        groupHeader('Pinned');
        pinned.forEach(function (t) { list.appendChild(buildRow(t, activeId)); });
      }
      groupHeader('Recent');
      if (recent.length) {
        recent.forEach(function (t) { list.appendChild(buildRow(t, activeId)); });
      } else if (!pinned.length) {
        list.appendChild(el('div', 'k3w-kit-history-empty', q ? 'No chats match the filter' : 'No chats yet'));
      }
      if (archived.length) {
        var toggle = el('button', 'k3w-kit-arch-toggle');
        toggle.type = 'button';
        toggle.setAttribute('data-testid', 'k3w-kit-arch-toggle');
        toggle.setAttribute('aria-expanded', showArchived ? 'true' : 'false');
        var chev = el('span', 'k3w-kit-arch-chev');
        chev.appendChild(icon(showArchived ? 'chevron-down' : 'chevron-right'));
        toggle.appendChild(chev);
        toggle.appendChild(el('span', 'k3w-kit-arch-label', 'Archived (' + archived.length + ')'));
        toggle.addEventListener('click', function () {
          store.set('history.showArchived', !showArchived);
        });
        list.appendChild(toggle);
        if (showArchived) {
          archived.forEach(function (t) { list.appendChild(buildRow(t, activeId)); });
        }
      }
    }

    function onData() { renderList(); }
    window.K3.on('data', onData);
    var unsubActive = store.subscribe('activeThreadId', renderList);
    var unsubDrafts = store.subscribe('drafts', renderList);
    var unsubHistory = store.subscribe('history', renderList);
    renderList();

    root.unmount = function () {
      window.K3.off('data', onData);
      unsubActive();
      unsubDrafts();
      unsubHistory();
    };
    return root;
  }

  // === shared: todo item list ==================================================
  function todoStateMeta(state) {
    return TODO_STATE_META[String(state || 'pending').toLowerCase()] || TODO_STATE_META['pending'];
  }

  function todoItemsList(todo, prev /* optional {id->state} map */) {
    var list = el('div', 'k3w-kit-todo-items k3-stagger');
    arr(todo && todo.items).forEach(function (item, i) {
      var id = item.id || ('task-' + i);
      var meta = todoStateMeta(item.state);
      var stateKey = String(item.state || 'pending').toLowerCase();
      var cls = 'k3w-kit-todo-item';
      // one-shot transition animation when this item's state changed since
      // the previous render (complete -> check-pop + settle; blocked/failed/
      // cancelled -> shake; running -> running sweep). Reduced motion is
      // handled by the global gate (these classes collapse to instant).
      var prevKey = prev && prev[id];
      var transitioned = prev && prevKey != null && prevKey !== stateKey;
      if (stateKey === 'running') cls += ' k3-running-soft';
      if (transitioned) {
        if (stateKey === 'complete') cls += ' k3-settle';
        if (stateKey === 'blocked' || stateKey === 'failed' || stateKey === 'cancelled') cls += ' k3-shake-now';
      }
      var row = el('div', cls);
      row.style.setProperty('--k3-i', i);
      var ic = el('span', 'k3w-kit-todo-ic is-' + stateKey + (transitioned && stateKey === 'complete' ? ' k3-check-pop-ic' : ''));
      ic.appendChild(icon(meta.icon));
      row.appendChild(ic);
      row.appendChild(el('span', 'k3w-kit-todo-label', item.label || item.id || 'Task'));
      row.appendChild(el('span', 'k3w-kit-todo-state', meta.label));
      list.appendChild(row);
    });
    return list;
  }
  // snapshot a todo's item states into an {id->state} map (for diffing)
  function todoStateMap(todo) {
    var m = {};
    arr(todo && todo.items).forEach(function (item, i) {
      m[item.id || ('task-' + i)] = String(item.state || 'pending').toLowerCase();
    });
    return m;
  }

  // === 9. goalSurface ==========================================================
  function goalSurface(ctx, threadId) {
    var store = ctx.store;
    var data = ctx.data;
    var thread = data.thread(threadId);
    var goal = thread && thread.activeGoal;
    if (!goal || store.get('goalView.' + threadId + '.cleared', false)) return null;

    var card = el('section', 'k3w-kit-goal k3w-kit-surface');
    card.setAttribute('data-testid', 'k3w-kit-goal');

    var flashReplanning = false;   // transient 1.2s "Replanning" status flash
    var replannedNote = false;     // footnote after an edit-save
    var flashTimer = null;

    function overrideStatus() { return store.get('goalView.' + threadId + '.statusOverride', null); }
    function effStatus() {
      if (flashReplanning) return 'replanning';
      return overrideStatus() || goal.status || 'running';
    }
    function sectionOpen(name) {
      return store.get('goalView.' + threadId + '.section.' + name, false) === true;
    }
    function toggleSection(name) {
      store.set('goalView.' + threadId + '.section.' + name, !sectionOpen(name));
    }

    function goalControl(label, opts) {
      opts = opts || {};
      var b = el('button', 'k3-btn k3-btn-ghost k3w-kit-mini k3w-kit-goal-btn', label);
      b.type = 'button';
      if (opts.disabled) b.disabled = true;
      if (opts.pressed != null) b.setAttribute('aria-pressed', opts.pressed ? 'true' : 'false');
      if (opts.danger) b.classList.add('k3w-kit-goal-btn-danger');
      if (opts.onClick) b.addEventListener('click', opts.onClick);
      return b;
    }

    function deriveSubgoals(objective) {
      var text = String(objective || '').replace(/[.\s]+$/, '');
      var parts = text.split(/,| and /i)
        .map(function (s) { return s.trim(); })
        .filter(function (s) { return s.length > 2; })
        .map(capitalize);
      if (parts.length < 2) {
        var base = text || 'the objective';
        parts = [
          'Plan the work for: ' + base,
          'Execute the plan for: ' + base,
          'Verify the outcome of: ' + base
        ];
      }
      return parts.slice(0, 3);
    }

    function evidenceLines() {
      var msgs = arr(thread.messages);
      var ag = null;
      for (var i = msgs.length - 1; i >= 0; i--) {
        if (msgs[i].activityGroup && Array.isArray(msgs[i].activityGroup.stages)) {
          ag = msgs[i].activityGroup;
          break;
        }
      }
      if (!ag) return null;
      return ag.stages.map(function (st) {
        var line = st.label || st.kind || 'Stage';
        var bits = [];
        if (typeof st.count === 'number') bits.push(st.count + ' items');
        if (st.summary) bits.push(st.summary);
        if (typeof st.durationSeconds === 'number') bits.push(fmtDuration(st.durationSeconds));
        if (st.status && st.status !== 'complete') bits.push(capitalize(st.status));
        return bits.length ? line + ' — ' + bits.join(' · ') : line;
      });
    }

    function blockedCard() {
      var b = goal.blocker || BLOCKED_FALLBACK;
      var box = el('div', 'k3w-kit-goal-blocked');
      [
        ['Cause', b.cause],
        ['Affected scope', b.affectedScope],
        ['Recovery attempted', b.lastAttemptedRecovery || b.recoveryAttempted],
        ['Why autonomous recovery stopped', b.whyRecoveryStopped],
        ['Next safe action', b.nextSafeAction]
      ].forEach(function (pair) {
        if (!pair[1]) return;
        var row = el('div', 'k3w-kit-blocked-row');
        row.appendChild(el('span', 'k3w-kit-blocked-k', pair[0]));
        row.appendChild(el('span', 'k3w-kit-blocked-v', pair[1]));
        box.appendChild(row);
      });
      return box;
    }

    function render() {
      var st = effStatus();
      // reflect blocked/running on the card root so CSS can drive the
      // blocked-dot pulse + attention treatment.
      card.classList.toggle('is-blocked', st === 'blocked');
      card.classList.toggle('is-running', st === 'running' || st === 'replanning');
      card.innerHTML = '';

      // header: goal icon + title + status chip + worked/elapsed
      var head = el('div', 'k3w-kit-goal-head');
      var ic = el('span', 'k3w-kit-goal-ic');
      ic.appendChild(icon('goal'));
      head.appendChild(ic);
      head.appendChild(el('span', 'k3w-kit-goal-title', goal.title || 'Goal'));
      var chip = el('span', 'k3-chip k3w-kit-state' + (flashReplanning ? ' k3-replan-pop' : ''));
      var variant = goalDotVariant(st);
      chip.appendChild(el('span', 'k3-dot' + (variant ? ' ' + variant : '')));
      chip.appendChild(el('span', 'k3w-kit-state-label', humanizeGoalStatus(st)));
      head.appendChild(chip);
      var times = 'Worked for ' + fmtDuration(goal.workedSeconds);
      if (Number(goal.totalElapsedSeconds) && Number(goal.totalElapsedSeconds) !== Number(goal.workedSeconds)) {
        times += ' · Elapsed ' + fmtDuration(goal.totalElapsedSeconds);
      }
      head.appendChild(el('span', 'k3w-kit-goal-times', times));
      card.appendChild(head);

      // objective: clamped 2 lines, expand on click
      var objective = el('div', 'k3w-kit-goal-objective' + (flashReplanning ? ' k3-replanning' : ''), goal.objective || '');
      objective.title = 'Click to expand';
      objective.addEventListener('click', function () {
        var open = objective.classList.toggle('is-expanded');
        objective.title = open ? 'Click to collapse' : 'Click to expand';
      });
      card.appendChild(objective);

      // controls row
      var controls = el('div', 'k3w-kit-goal-controls');
      var viewBtn = goalControl('View', { pressed: sectionOpen('detail'), onClick: function () { toggleSection('detail'); } });
      var editBtn = goalControl('Edit', {
        disabled: goal.canEdit === false,
        onClick: function () { openEdit(editBtn); }
      });
      controls.appendChild(viewBtn);
      controls.appendChild(editBtn);

      var isPaused = st === 'paused';
      var isFinal = st === 'stopped' || st === 'completed';
      if (isPaused) {
        controls.appendChild(goalControl('Resume', {
          disabled: goal.canResume === false && !overrideStatus(),
          onClick: function () {
            if (window.K3Work) window.K3Work.resumeGoal(threadId);
            else store.set('goalView.' + threadId + '.statusOverride', 'running');
          }
        }));
      } else if (!isFinal) {
        controls.appendChild(goalControl('Pause', {
          disabled: goal.canPause === false,
          onClick: function () {
            if (window.K3Work) window.K3Work.pauseGoal(threadId);
            else store.set('goalView.' + threadId + '.statusOverride', 'paused');
          }
        }));
      }
      if (!isFinal) {
        controls.appendChild(goalControl('Stop', {
          disabled: goal.canStop === false,
          onClick: function () {
            ui(ctx).confirm({
              title: 'Stop goal',
              body: 'Stop "' + (goal.title || 'this goal') + '"? The run record stays in the transcript.',
              confirmLabel: 'Stop goal',
              danger: true
            }).then(function (ok) {
              if (!ok) return;
              if (window.K3Work) window.K3Work.stopGoal(threadId);
              else store.set('goalView.' + threadId + '.statusOverride', 'stopped');
            });
          }
        }));
      }
      controls.appendChild(goalControl('Clear', {
        disabled: goal.canClear === false,
        onClick: function () {
          ui(ctx).confirm({
            title: 'Clear goal',
            body: 'Clear removes the Goal from this chat; the run record stays.',
            confirmLabel: 'Clear goal',
            danger: true
          }).then(function (ok) {
            if (ok) store.set('goalView.' + threadId + '.cleared', true);
          });
        }
      }));
      controls.appendChild(goalControl('Tasks', {
        pressed: sectionOpen('tasks'),
        disabled: !thread.todo,
        onClick: function () { toggleSection('tasks'); }
      }));
      controls.appendChild(goalControl('Subgoals', {
        pressed: sectionOpen('subgoals'),
        onClick: function () { toggleSection('subgoals'); }
      }));
      controls.appendChild(goalControl('Evidence and logs', {
        pressed: sectionOpen('evidence'),
        onClick: function () { toggleSection('evidence'); }
      }));
      card.appendChild(controls);

      // sections
      if (sectionOpen('detail')) {
        var detail = el('div', 'k3w-kit-goal-section');
        var kvs = el('div', 'k3w-kit-goal-kvs');
        kvs.appendChild(kvRow('Status', humanizeGoalStatus(st)));
        kvs.appendChild(kvRow('Worked', fmtDuration(goal.workedSeconds)));
        kvs.appendChild(kvRow('Elapsed', fmtDuration(goal.totalElapsedSeconds)));
        if (goal.progress && typeof goal.progress.total === 'number') {
          kvs.appendChild(kvRow('Progress', (goal.progress.complete || goal.progress.done || 0) + ' of ' + goal.progress.total));
        }
        if (goal.phase) kvs.appendChild(kvRow('Phase', goal.phase));
        detail.appendChild(kvs);
        detail.appendChild(el('div', 'k3-footnote',
          'Goal state survives compaction, disconnect, and UI close.'));
        if (st === 'blocked') {
          var bc = blockedCard();
          bc.classList.add('k3-shake-now'); // one-shot attention shake on reveal
          detail.appendChild(bc);
        }
        card.appendChild(detail);
      }
      if (sectionOpen('tasks')) {
        var tasks = el('div', 'k3w-kit-goal-section');
        if (thread.todo) tasks.appendChild(todoItemsList(thread.todo));
        else tasks.appendChild(el('div', 'k3-footnote', 'No task list on this thread.'));
        card.appendChild(tasks);
      }
      if (sectionOpen('subgoals')) {
        var subs = el('div', 'k3w-kit-goal-section');
        deriveSubgoals(goal.objective).forEach(function (line) {
          subs.appendChild(el('div', 'k3w-kit-subgoal-line', line));
        });
        subs.appendChild(el('div', 'k3-footnote', 'Derived from the objective (prototype projection)'));
        card.appendChild(subs);
      }
      if (sectionOpen('evidence')) {
        var ev = el('div', 'k3w-kit-goal-section');
        var lines = evidenceLines();
        if (lines && lines.length) {
          lines.forEach(function (line) { ev.appendChild(el('div', 'k3w-kit-log-line', line)); });
        } else {
          ev.appendChild(el('div', 'k3-footnote', 'No activity recorded yet.'));
        }
        card.appendChild(ev);
      }

      // Completion receipt: durable, compact, evidence-linked.
      if (st === 'completed' || st === 'complete') {
        var receipt = el('div', 'k3w-kit-goal-receipt');
        receipt.setAttribute('data-testid', 'k3w-kit-goal-receipt');
        receipt.appendChild(el('div', 'k3w-kit-goal-receipt-title', 'Completion receipt'));
        var rl = el('div', 'k3w-kit-goal-kvs');
        rl.appendChild(kvRow('Objective', goal.objective || goal.title || '—'));
        if (goal.phase) rl.appendChild(kvRow('Final phase', goal.phase));
        var ev2 = evidenceLines();
        rl.appendChild(kvRow('Evidence', ev2 && ev2.length ? ev2.length + ' activity lines' : '—'));
        rl.appendChild(kvRow('Artifacts', arr(thread.artifacts).length + ' attached'));
        rl.appendChild(kvRow('Worked', fmtDuration(goal.workedSeconds)));
        if (Number(goal.totalElapsedSeconds) && Number(goal.totalElapsedSeconds) !== Number(goal.workedSeconds)) {
          rl.appendChild(kvRow('Elapsed', fmtDuration(goal.totalElapsedSeconds)));
        }
        receipt.appendChild(rl);
        card.appendChild(receipt);
      }

      if (replannedNote) {
        card.appendChild(el('div', 'k3-footnote k3w-kit-goal-note', 'Replanned — tasks and schedule updated (prototype)'));
      }
    }

    function openEdit(anchor) {
      var pop;
      pop = ui(ctx).popover(anchor, function (root) {
        var box = el('div', 'k3w-kit-goal-edit');
        box.appendChild(el('div', 'k3w-kit-goal-edit-label', 'Objective'));
        var ta = document.createElement('textarea');
        ta.className = 'k3-input k3w-kit-goal-edit-input';
        ta.rows = 4;
        ta.value = goal.objective || '';
        box.appendChild(ta);
        var row = el('div', 'k3w-kit-goal-edit-actions');
        var save = el('button', 'k3-btn k3w-kit-mini', 'Save');
        save.type = 'button';
        save.addEventListener('click', function () {
          if (pop) pop.close();
          var newObjective = ta.value;
          // Real replan flow: explicit safe-boundary choice, durable revision
          // note on the goal record, then the replan flash.
          ui(ctx).confirm({
            title: 'Replan with the updated objective?',
            body: 'Tasks and schedule update inside the current safe boundary. Widening scope or retargeting the route needs an explicit Goal update.',
            confirmLabel: 'Replan within boundary',
            cancelLabel: 'Keep current plan'
          }).then(function (ok) {
            if (!ok) return;
            goal.objective = newObjective;
            goal.revisions = arr(goal.revisions);
            goal.revisions.push({ at: new Date().toISOString(), note: 'Objective edited; replanned within the safe boundary.' });
            if (window.K3Work && typeof window.K3Work.replanGoal === 'function') {
              window.K3Work.replanGoal(threadId, { objective: newObjective, boundary: 'safe' });
            }
            flashReplanning = true;
            replannedNote = true;
            render();
            clearTimeout(flashTimer);
            // The replan flash lingers as a status pill + objective shimmer. Under
            // reduced motion the CSS is instant, so clear the flash state at once
            // (the replanned footnote stays) instead of letting the pill appear
            // then silently vanish 1.2s later.
            var flashMs = K3.motionReduced() ? 0 : 1200;
            flashTimer = setTimeout(function () {
              flashReplanning = false;
              render();
            }, flashMs);
          });
        });
        row.appendChild(save);
        box.appendChild(row);
        root.appendChild(box);
        setTimeout(function () { ta.focus(); }, ui(ctx).reduced() ? 0 : 60);
      }, { width: 300 });
    }

    render();

    var wrapped = yieldWrap(ctx, threadId, card);
    var innerUnmount = wrapped.unmount;
    var unsub = store.subscribe('goalView.' + threadId, function () {
      if (store.get('goalView.' + threadId + '.cleared', false)) {
        wrapped.unmount();
        wrapped.remove();
        return;
      }
      render();
    });
    // K3Work mutates thread.activeGoal directly and nudges via touchThread;
    // re-read the record so lifecycle ops (pause/resume/complete) repaint.
    function onData(evt) {
      if (!evt || evt.threadId && evt.threadId !== threadId) return;
      if (evt.type === 'threads-changed' || evt.type === 'restarted') {
        var t2 = ctx.data.thread(threadId);
        if (t2 && t2.activeGoal) { goal = t2.activeGoal; render(); }
      }
    }
    window.K3.on('data', onData);
    wrapped.unmount = function () {
      clearTimeout(flashTimer);
      window.K3.off('data', onData);
      unsub();
      innerUnmount();
    };
    return wrapped;
  }

  // === 10. todoSurface =========================================================
  function todoSurface(ctx, threadId) {
    var store = ctx.store;
    var thread = ctx.data.thread(threadId);
    var todo = thread && thread.todo;
    if (!todo || !arr(todo.items).length) return null;

    var card = el('section', 'k3w-kit-todo k3w-kit-surface');
    card.setAttribute('data-testid', 'k3w-kit-todo');

    var total = todo.items.length;
    var done = todo.items.filter(function (i) { return String(i.state).toLowerCase() === 'complete'; }).length;

    var open = store.get('surfaceView.' + threadId + '.todoOpen', true) !== false;

    var headBtn = el('button', 'k3w-kit-todo-head');
    headBtn.type = 'button';
    headBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    var chev = el('span', 'k3w-kit-todo-chev');
    var headText = el('span', 'k3w-kit-todo-headtext');
    var ic = el('span', 'k3w-kit-todo-headic');
    ic.appendChild(icon('todo'));
    headText.appendChild(ic);
    headText.appendChild(el('span', null, 'Todo — ' + done + '/' + total + ' done'));
    headBtn.appendChild(chev);
    headBtn.appendChild(headText);

    var acc = el('div', 'k3-acc k3w-kit-todo-acc' + (open ? ' is-open' : ''));
    var accIn = el('div', 'k3-acc-in');
    var prevStates = todoStateMap(todo);
    var listEl = todoItemsList(todo, null);
    accIn.appendChild(listEl);
    acc.appendChild(accIn);

    function refreshItems() {
      // re-read the live thread; if item states changed, rebuild the list
      // with the diff so transitions animate. Only the items rebuild, not
      // the whole card.
      var t2 = ctx.data.thread(threadId);
      var todo2 = t2 && t2.todo;
      if (!todo2) return;
      var next = todoStateMap(todo2);
      var changed = false;
      for (var k in next) if (next[k] !== prevStates[k]) { changed = true; break; }
      if (!changed && arr(todo2.items).length === arr(todo.items).length) return;
      var fresh = todoItemsList(todo2, prevStates);
      accIn.innerHTML = '';
      accIn.appendChild(fresh);
      listEl = fresh;
      prevStates = next;
      todo = todo2;
    }
    function onData(evt) {
      if (!evt) return;
      if (evt.type === 'threads-changed' || evt.type === 'restarted' || evt.type === 'message-added') refreshItems();
    }
    window.K3.on('data', onData);

    function paint() {
      chev.innerHTML = '';
      chev.appendChild(icon(open ? 'chevron-down' : 'chevron-right'));
      acc.classList.toggle('is-open', open);
      headBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    }
    headBtn.addEventListener('click', function () {
      open = !open;
      store.set('surfaceView.' + threadId + '.todoOpen', open);
      paint();
    });
    paint();

    card.appendChild(headBtn);
    card.appendChild(acc);

    var wrapped = yieldWrap(ctx, threadId, card);
    var innerUnmount = wrapped.unmount;
    wrapped.unmount = function () {
      window.K3.off('data', onData);
      if (innerUnmount) innerUnmount();
    };
    return wrapped;
  }

  // === 11. workChips ===========================================================
  function workChips(ctx, threadId) {
    var thread = ctx.data.thread(threadId);
    if (!thread) return null;

    function chipDefs() {
      var defs = [];
      // subagents: aggregate counts across groups
      var counts = { working: 0, blocked: 0, waiting: 0, complete: 0 };
      arr(thread.subagentGroups).forEach(function (g) {
        var c = g.counts || {};
        counts.working += Number(c.working) || 0;
        counts.blocked += Number(c.blocked) || 0;
        counts.waiting += Number(c.waiting) || 0;
        counts.complete += Number(c.complete) || 0;
      });
      var parts = [];
      if (counts.working) parts.push(counts.working + ' working');
      if (counts.blocked) parts.push(counts.blocked + ' blocked');
      if (counts.waiting) parts.push(counts.waiting + ' waiting');
      if (counts.complete && parts.length < 2) parts.push(counts.complete + ' complete');
      if (parts.length) defs.push({ icon: 'subagent', label: parts.slice(0, 2).join(' · '), hint: 'Subagents' });

      // diff: files + add/remove totals
      var files = 0, added = 0, removed = 0;
      arr(thread.diffGroups).forEach(function (g) {
        arr(g.files).forEach(function (f) {
          files += 1;
          added += Number(f.added) || 0;
          removed += Number(f.removed) || 0;
        });
      });
      if (files) defs.push({ icon: 'diff', label: files + (files === 1 ? ' file' : ' files') + ' · +' + added + ' -' + removed, hint: 'Uncommitted changes' });

      // activity: latest activity group compact label
      var msgs = arr(thread.messages);
      for (var i = msgs.length - 1; i >= 0; i--) {
        var ag = msgs[i].activityGroup;
        if (ag && ag.compactLabel) {
          defs.push({ icon: 'activity', label: ag.compactLabel, hint: 'Latest activity' });
          break;
        }
      }
      return defs;
    }

    if (!chipDefs().length) return null;

    var row = el('div', 'k3w-kit-chips');
    row.setAttribute('data-testid', 'k3w-kit-chips');

    function emitReveal() {
      var mid = latestAssistantMessageId(thread);
      if (mid) window.K3.emit('reveal-message', { threadId: threadId, messageId: mid });
    }

    function render() {
      var defs = chipDefs();
      row.innerHTML = '';
      row.style.display = defs.length ? '' : 'none';
      defs.forEach(function (d) {
        var chip = el('button', 'k3-chip k3w-kit-chip');
        chip.type = 'button';
        chip.title = d.hint + ' — click to reveal in transcript';
        var ic = el('span', 'k3w-kit-chip-ic');
        ic.appendChild(icon(d.icon));
        chip.appendChild(ic);
        chip.appendChild(el('span', 'k3w-kit-chip-label', d.label));
        chip.addEventListener('click', emitReveal);
        row.appendChild(chip);
      });
    }
    function onData() { render(); }
    window.K3.on('data', onData);
    render();

    row.unmount = function () { window.K3.off('data', onData); };
    return yieldWrap(ctx, threadId, row);
  }

  // === 12. capacitySurface (packet: sustainable capacity forecast) ============
  function capacitySurface(ctx, threadId) {
    var thread = ctx.data.thread(threadId);
    var fc = thread && thread.capacityForecast;
    if (!fc) return null;

    var card = el('section', 'k3w-kit-capacity k3w-kit-surface');
    card.setAttribute('data-testid', 'k3w-kit-capacity');

    function render() {
      card.innerHTML = '';
      var head = el('div', 'k3w-kit-surface-head');
      head.appendChild(iconSpan('capacity', 'k3w-kit-surface-ic'));
      head.appendChild(el('span', 'k3w-kit-surface-title', 'Capacity forecast'));
      head.appendChild(el('span', 'k3w-kit-surface-meta',
        'Recommended ' + (fc.recommended || 1) + ' concurrent · ' + (fc.waves || 1) + ' waves'));
      card.appendChild(head);
      var rows = el('div', 'k3w-kit-kv-rows');
      rows.appendChild(kvRow('Requested specialists', String(fc.requested || 0)));
      rows.appendChild(kvRow('Recommended concurrent', String(fc.recommended || 0)));
      rows.appendChild(kvRow('Waves', String(fc.waves || 0)));
      rows.appendChild(kvRow('Reason', fc.reason || ''));
      card.appendChild(rows);
      card.appendChild(el('div', 'k3-footnote',
        'A compact forecast, not a guarantee. Required independent roles are preserved.'));
    }
    function onData(evt) {
      if (evt && evt.type === 'capacity-changed' && (!evt.threadId || evt.threadId === threadId)) {
        var t2 = ctx.data.thread(threadId);
        fc = t2 && t2.capacityForecast;
        if (fc) render();
      }
    }
    window.K3.on('data', onData);
    render();
    card.unmount = function () { window.K3.off('data', onData); };
    return yieldWrap(ctx, threadId, card);
  }

  // === 13. crewSurface (packet: crew as execution strategy) ===================
  function crewSurface(ctx, threadId) {
    var thread = ctx.data.thread(threadId);
    var crew = thread && thread.crew;
    if (!crew) return null;

    var card = el('section', 'k3w-kit-crew k3w-kit-surface');
    card.setAttribute('data-testid', 'k3w-kit-crew');

    function routeLabel(routeKey) {
      var r = routeKey ? ctx.data.routeByKey(routeKey) : null;
      return r ? r.providerName + ' · ' + r.accountLabel + ' · ' + r.modelShort : (routeKey || '—');
    }
    function render() {
      card.innerHTML = '';
      var head = el('div', 'k3w-kit-surface-head');
      head.appendChild(iconSpan('crew', 'k3w-kit-surface-ic'));
      head.appendChild(el('span', 'k3w-kit-surface-title', 'Crew — ' + (crew.templateLabel || crew.templateId || 'custom')));
      var waves = crew.waves || {};
      head.appendChild(el('span', 'k3w-kit-surface-meta',
        (waves.concurrent || 0) + ' running · ' + (waves.queued || 0) + ' queued'));
      card.appendChild(head);
      var rows = el('div', 'k3w-kit-crew-rows');
      arr(crew.members).forEach(function (m) {
        var row = el('div', 'k3w-kit-crew-row');
        row.appendChild(el('span', 'k3w-kit-crew-role', m.role || 'Member'));
        row.appendChild(el('span', 'k3w-kit-crew-route', routeLabel(m.route)));
        var st = el('span', 'k3-chip k3w-kit-state');
        var stKey = normStateKey(m.status || 'queued');
        st.appendChild(el('span', 'k3-dot' + (threadDotVariant(stKey) ? ' ' + threadDotVariant(stKey) : '')));
        st.appendChild(el('span', 'k3w-kit-state-label', humanizeThreadState(stKey)));
        row.appendChild(st);
        rows.appendChild(row);
      });
      card.appendChild(rows);
      var tpl = null;
      arr(ctx.data.crewTemplates()).forEach(function (t) { if (t.id === crew.templateId) tpl = t; });
      card.appendChild(el('div', 'k3-footnote',
        (tpl && tpl.reserveReason ? tpl.reserveReason + '. ' : '') +
        'Members produce independent results; the parent thread reduces. Crew selection is local to this thread.'));
    }
    function onData(evt) {
      if (evt && evt.type === 'crew-changed' && (!evt.threadId || evt.threadId === threadId)) {
        var t2 = ctx.data.thread(threadId);
        crew = t2 && t2.crew;
        if (crew) render();
      }
    }
    window.K3.on('data', onData);
    render();
    card.unmount = function () { window.K3.off('data', onData); };
    return yieldWrap(ctx, threadId, card);
  }

  // === 14. opsSurface (packet: operational awareness) =========================
  function opsSurface(ctx, threadId) {
    var summary = window.K3Work ? window.K3Work.opsSummary(threadId) : null;
    if (!summary || !arr(summary.conflicts).length) return null;

    var card = el('section', 'k3w-kit-ops k3w-kit-surface');
    card.setAttribute('data-testid', 'k3w-kit-ops');

    function render() {
      summary = window.K3Work.opsSummary(threadId);
      card.innerHTML = '';
      var conflicts = arr(summary.conflicts).filter(function (c) { return c.state !== 'resolved'; });
      if (!conflicts.length) { card.style.display = 'none'; return; }
      card.style.display = '';
      var head = el('div', 'k3w-kit-surface-head');
      head.appendChild(iconSpan('port', 'k3w-kit-surface-ic'));
      head.appendChild(el('span', 'k3w-kit-surface-title',
        conflicts.length === 1 ? '1 operational conflict' : conflicts.length + ' operational conflicts'));
      card.appendChild(head);
      conflicts.forEach(function (c) {
        var row = el('div', 'k3w-kit-ops-conflict');
        var text = el('span', 'k3w-kit-ops-text',
          'Port ' + c.port + ' is used by ' + (c.ownerLabel || c.owner || 'another worktree') + '.');
        row.appendChild(text);
        var actions = el('span', 'k3w-kit-ops-actions');
        if (c.alternative != null) {
          var useAlt = el('button', 'k3-btn k3-btn-ghost k3w-kit-mini', 'Use ' + c.alternative + ' instead?');
          useAlt.type = 'button';
          useAlt.setAttribute('data-testid', 'k3w-kit-ops-alt');
          useAlt.addEventListener('click', function () {
            window.K3Work.applyPortAlternative(threadId, c);
          });
          actions.appendChild(useAlt);
        }
        var detailsBtn = el('button', 'k3-btn k3-btn-ghost k3w-kit-mini', 'Details');
        detailsBtn.type = 'button';
        detailsBtn.addEventListener('click', function () {
          var box = el('div', 'k3w-kit-ops-details');
          box.appendChild(kvRow('Port', String(c.port)));
          box.appendChild(kvRow('Owner', c.ownerLabel || c.owner || '—'));
          box.appendChild(kvRow('Worktree', c.owner || '—'));
          box.appendChild(kvRow('Thread', c.threadId || '—'));
          if (c.alternative != null) box.appendChild(kvRow('Alternative', String(c.alternative) + ' (free)'));
          var s2 = window.K3Work.opsSummary(threadId);
          box.appendChild(el('div', 'k3w-kit-ops-sub', 'Worktrees'));
          arr(s2.worktrees).forEach(function (w) {
            box.appendChild(kvRow(w.label || w.id, humanizeThreadState(w.state) + (w.cleanup ? ' · cleanup ' + w.cleanup : '')));
          });
          if (s2.allowance) box.appendChild(kvRow('Allowance', s2.allowance.reserve + ' · resets ' + (s2.allowance.reset || '—')));
          if (s2.pressure) box.appendChild(kvRow('Pressure', 'CPU ' + s2.pressure.cpu + ' · memory ' + s2.pressure.memory));
          ui(ctx).popover(detailsBtn, box, { className: 'k3w-kit-ops-pop k3-scroll' });
        });
        actions.appendChild(detailsBtn);
        row.appendChild(actions);
        card.appendChild(row);
      });
    }
    function onData(evt) {
      if (evt && evt.type === 'ops-conflict') render();
    }
    window.K3.on('data', onData);
    render();
    card.unmount = function () { window.K3.off('data', onData); };
    return yieldWrap(ctx, threadId, card);
  }

  // === public surface ==========================================================
  window.K3WindowKit = {
    PERSONAS: PERSONAS,
    selectorRow: selectorRow,
    searchBox: searchBox,
    lensButton: lensButton,
    lensBannerHost: lensBannerHost,
    contextRing: contextRing,
    moreMenu: moreMenu,
    header: header,
    historyPanel: historyPanel,
    goalSurface: goalSurface,
    todoSurface: todoSurface,
    workChips: workChips,
    capacitySurface: capacitySurface,
    crewSurface: crewSurface,
    opsSurface: opsSurface
  };
})();
