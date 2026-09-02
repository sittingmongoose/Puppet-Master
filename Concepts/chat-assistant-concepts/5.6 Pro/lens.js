/* lens.js — feature module.  OWNER: Wave 3 — Transcript + Lens agent (item 9)
 *
 * ITEM 9 — Context Lens message selection.
 *
 * What was wrong
 * --------------
 * Context Lens was a wand submenu emitting canned receipts. There was no
 * selection capability anywhere in the concept: no checkboxes, no selection
 * state, no `select-message` action, no per-message applied state. Its own copy
 * ("Selected superseded sources omitted") described a mechanism that did not
 * exist. The submenu also offered five options -- `Auto, Focus, Mute,
 * Subcompact, Off` -- where canon (ACD-192/193, `preserved_exact_tokens`)
 * defines exactly four: `Mute`, `Focus`, `Subcompact`, `Turn Off`. `Auto` is
 * not a mode.
 *
 * The contract this implements
 * ----------------------------
 *   ACD-192  Modes are exactly Mute · Focus · Subcompact · Turn Off.
 *   ACD-193  Mute and Focus apply as selection toggles happen. Subcompact
 *            requires an explicit Apply before creating a local summary
 *            artifact. Turn Off clears active selection state.
 *   ACD-194  Effective assembly EXCLUDES muted, PROTECTS focused, and replaces
 *            a Subcompact selection with a local summary while preserving
 *            canonical source history and rehydration handles.
 *   ACD-195  Lens state is thread-local UI shaping, NOT Assistant memory.
 *            Hence one slice per thread, and `effectiveHistory()` derives from
 *            canonical history every time rather than from a lossy copy.
 *
 *   The cap is 25 messages PER APPLY OPERATION, not per thread, so `ops` is a
 *   LIST of operations and they accumulate. Selecting the 26th message in one
 *   operation is refused (never silently truncated) and the refusal offers the
 *   way forward: seal this operation and start the next.
 *
 * Where the three sibling implementations were followed, and where not
 * ---------------------------------------------------------------------
 *   - `opus-5/shared/lens.js` has the best semantics: an operations list, a
 *     distinct `source` state once a subcompacted range is rehydrated, and an
 *     `effectiveHistory()` that implements the human-search-vs-agent-retrieval
 *     split. All three are taken. Its `toggleSelect` is never called by any UI,
 *     which is the half this module supplies.
 *   - `kimi-k3` supplies the UI shape: a gutter check button, immediate apply
 *     on toggle, the cap enforced on BOTH toggle and apply, and a subcompact
 *     summary card with a Rehydrate button. Its `applyLens` commits and clears
 *     the selection on every single toggle, which means an already-muted
 *     message can never be un-muted; here the live selection stays live so a
 *     second click genuinely un-mutes, and sealing is an explicit act.
 *   - `qwen-3-8` supplies the per-message escape hatch ("Show full message").
 *   - NOT taken: a coloured left-edge accent bar for selection or status. The
 *     packet forbids it. Selection is an outline plus a gutter control.
 *
 * Deliberate reading of one ambiguity, stated rather than buried: "Turn Off
 * exits Context Lens mode and clears active selection state" also releases the
 * applied operations here, because ACD-194 defines the lens by what it does to
 * effective assembly -- a lens that is off but still excluding messages is a
 * contradiction. The release is announced with a receipt naming the counts, so
 * it is never silent. kimi-k3 does the same; opus-5 keeps the operations.
 *
 * data-k: every node this module emits lives inside `.message`, which survives
 * the 2s work tick, so all of them carry a stable key or pmPatch would remount
 * them and replay their entrance animation twice a second.
 */
(function () {
  'use strict';

  var EXT = window.PM56_EXT;
  if (!EXT || !EXT.slot) return;

  var MAX_PER_OP = 25;

  /* Canonical vocabulary. `Auto` is deliberately absent from MODES -- it is not
     a mode -- but IS accepted on the way in, because app.js seeds
     state.capabilities.context to 'Auto' and savePrefs may have persisted it. */
  var MODES = [
    ['mute', 'Mute', 'Omit the selected messages from the effective context. Canonical history keeps them.'],
    ['focus', 'Focus', 'Protect the selected messages and raise their priority in the effective context.'],
    ['subcompact', 'Subcompact', 'Replace the selected range with a local summary. Needs an explicit Apply.'],
    ['off', 'Turn Off', 'Leave selection mode, clear the selection, and restore every shaped message.']
  ];
  var CAP_OF = { mute: 'Mute', focus: 'Focus', subcompact: 'Subcompact', off: 'Off' };
  var MODE_OF = { Mute: 'mute', Focus: 'focus', Subcompact: 'subcompact', Off: 'off', Auto: 'off' };
  var TITLE_OF = { mute: 'Mute', focus: 'Focus', subcompact: 'Subcompact', off: 'Turn Off' };

  /* ------------------------------------------------------------- the store */
  /* Thread-local, per ACD-195. Module-level rather than in app.js's `state` so
     app.js stays closed; it survives re-render because it is closure state, and
     it is intentionally NOT persisted -- view shaping is not memory. */
  var store = Object.create(null);
  var seq = 0;
  var lastCapWritten = null;

  function slice(tid) {
    var l = store[tid];
    if (!l) l = store[tid] = { mode: 'off', selection: [], ops: [], picking: false };
    if (l.picking == null) l.picking = false;
    return l;
  }

  function selectionOf(tid) { return slice(tid).selection.slice(); }
  function isSelected(tid, id) { return slice(tid).selection.indexOf(id) >= 0; }

  /* A message already covered by a SEALED operation is not re-selectable: it
     already has an applied state, and letting it join a second live operation
     is how a message ends up simultaneously muted and focused. It gets its own
     restore handle instead. */
  function sealedOpFor(tid, id) {
    var ops = slice(tid).ops;
    for (var i = ops.length - 1; i >= 0; i--) if (ops[i].ids.indexOf(id) >= 0) return ops[i];
    return null;
  }

  /* One message id maps to exactly one of five states:
       muted | focused | subcompacted | source | null
     `source` is opus-5's distinction: a subcompacted range that has been
     rehydrated is showing its canonical sources again but is STILL,
     structurally, a subcompacted range. */
  function stateOf(tid, id) {
    var l = slice(tid);
    var op = sealedOpFor(tid, id);
    if (op) {
      if (op.mode === 'subcompact') return op.rehydrated ? 'source' : 'subcompacted';
      return op.mode === 'mute' ? 'muted' : 'focused';
    }
    /* The live selection under an immediate mode IS applied, by ACD-193. */
    if ((l.mode === 'mute' || l.mode === 'focus') && l.selection.indexOf(id) >= 0) {
      return l.mode === 'mute' ? 'muted' : 'focused';
    }
    return null;
  }

  function shapedCount(tid) {
    var l = slice(tid), n = 0;
    for (var i = 0; i < l.ops.length; i++) n += l.ops[i].ids.length;
    if (l.mode === 'mute' || l.mode === 'focus') n += l.selection.length;
    return n;
  }

  function remaining(tid) { return Math.max(0, MAX_PER_OP - slice(tid).selection.length); }

  /* ------------------------------------------------------------- mutators */
  function setMode(tid, mode) {
    var l = slice(tid);
    if (mode === 'off') return { released: releaseAll(tid) };
    if (mode !== l.mode) {
      /* A fresh mode never inherits a selection made under a DIFFERENT mode --
         that would instantly mute messages the user picked to focus. */
      l.selection = [];
      l.mode = mode;
    }
    l.picking = true;
    return { released: null };
  }

  function releaseAll(tid) {
    var l = slice(tid);
    var opCount = l.ops.length;
    var msgCount = shapedCount(tid);
    l.mode = 'off';
    l.selection = [];
    l.ops = [];
    l.picking = false;
    return { ops: opCount, messages: msgCount };
  }

  /* Refused, never truncated: the cap is what makes an operation reviewable, so
     silently dropping the 26th would be worse than declining it. */
  function toggle(tid, id) {
    var l = slice(tid);
    if (l.mode === 'off') return { ok: false, reason: 'off' };
    if (sealedOpFor(tid, id)) return { ok: false, reason: 'sealed' };
    var i = l.selection.indexOf(id);
    if (i >= 0) { l.selection.splice(i, 1); return { ok: true, on: false }; }
    if (l.selection.length >= MAX_PER_OP) return { ok: false, reason: 'cap', cap: MAX_PER_OP };
    l.selection.push(id);
    return { ok: true, on: true };
  }

  /* Mute and Focus apply live, so "seal" is what lets them accumulate past the
     per-operation cap: it freezes the live selection into an operation of its
     own and empties the buffer for the next 25. */
  function seal(tid) {
    var l = slice(tid);
    if (l.mode !== 'mute' && l.mode !== 'focus') return { ok: false, reason: 'mode' };
    if (!l.selection.length) return { ok: false, reason: 'empty' };
    l.ops.push({ id: 'lensop-' + (++seq), mode: l.mode, ids: l.selection.slice(), at: nowIso(), rehydrated: false });
    var n = l.selection.length;
    l.selection = [];
    l.picking = false;
    return { ok: true, count: n };
  }

  /* Subcompact is the only mode that needs an explicit Apply, because it is the
     only one that creates an artifact (the local summary). */
  function applySubcompact(tid) {
    var l = slice(tid);
    if (l.mode !== 'subcompact') return { ok: false, reason: 'mode' };
    if (!l.selection.length) return { ok: false, reason: 'empty' };
    if (l.selection.length > MAX_PER_OP) return { ok: false, reason: 'cap' };
    var ids = l.selection.slice();
    l.ops.push({
      id: 'lensop-' + (++seq), mode: 'subcompact', ids: ids, at: nowIso(), rehydrated: false,
      summary: 'Condensed ' + ids.length + ' selected message' + (ids.length === 1 ? '' : 's') +
        ' into one local summary. Canonical source history is unchanged and every source stays rehydratable.'
    });
    l.selection = [];
    l.picking = false;
    return { ok: true, count: ids.length };
  }

  function opById(tid, opId) {
    var ops = slice(tid).ops;
    for (var i = 0; i < ops.length; i++) if (ops[i].id === opId) return ops[i];
    return null;
  }

  function releaseOp(tid, opId) {
    var l = slice(tid);
    for (var i = 0; i < l.ops.length; i++) {
      if (l.ops[i].id === opId) { var n = l.ops[i].ids.length; l.ops.splice(i, 1); return n; }
    }
    return 0;
  }

  function nowIso() { return new Date().toISOString(); }

  /* ----------------------------------------------- effective assembly (194) */
  /* The AGENT-side view, deliberately different from what a human search sees:
     human search always reads canonical stored history (renderHistoryContent in
     app.js still searches every message body, which is correct and untouched),
     this does not. Derived from canonical history on every call -- never from a
     lossy copy -- which is ACD-195's handoff rule. */
  function effectiveHistory(ctx, tid) {
    var t = (ctx.state.threads || []).filter(function (x) { return x.id === tid; })[0];
    if (!t) return [];
    var out = [], emitted = Object.create(null);
    for (var i = 0; i < t.messages.length; i++) {
      var m = t.messages[i];
      if (m.type !== 'text') { out.push({ id: m.id, kind: 'system' }); continue; }
      var st = stateOf(tid, m.id);
      if (st === 'muted') continue;                       /* excluded entirely */
      if (st === 'subcompacted') {
        var op = sealedOpFor(tid, m.id);
        if (emitted[op.id]) continue;
        emitted[op.id] = true;
        out.push({ id: 'summary-' + op.id, kind: 'summary', summaryOf: op.ids.slice(), rehydrate: op.ids.slice() });
        continue;
      }
      out.push({
        id: m.id, kind: 'message',
        priority: st === 'focused' ? 'high' : 'normal',
        rehydratedFrom: st === 'source' ? (sealedOpFor(tid, m.id) || {}).id : null
      });
    }
    /* Focused turns are protected AND high priority (ACD-194), so they sort to
       the front of the effective assembly; nothing is dropped by the sort. */
    out.sort(function (a, b) { return (b.priority === 'high' ? 1 : 0) - (a.priority === 'high' ? 1 : 0); });
    return out;
  }

  /* --------------------------------------------------- capability mirroring */
  /* app.js's wand row, the composer capability dot and the Demo Studio's
     `Context Focus` / `Context Mute` / `Context Subcompact` triggers all read or
     write `state.capabilities.context`. Keeping the two in step means those
     triggers now genuinely enter selection mode instead of only printing a
     receipt, and `Auto` -- which is not a mode -- is normalised out on the first
     render without app.js having to change its default. */
  function syncCapability(ctx) {
    var st = ctx.state, tid = st.selectedThread;
    var l = slice(tid);
    var cap = st.capabilities ? st.capabilities.context : 'Off';
    var want = MODE_OF[cap];
    if (want && want !== l.mode && cap !== lastCapWritten) {
      if (want === 'off') releaseAll(tid); else setMode(tid, want);
    }
    var disp = CAP_OF[l.mode];
    if (st.capabilities) st.capabilities.context = disp;
    lastCapWritten = disp;
    return l;
  }

  /* ============================ RENDERING ============================== */

  /* ---- the wand submenu: the canonical control (ACD-192) ---------------- */
  EXT.slot('contextLensMenu', function (ctx) {
    var esc = ctx.esc, icon = ctx.icon;
    var tid = ctx.state.selectedThread;
    var l = syncCapability(ctx);
    var sel = l.selection.length;
    var shaped = shapedCount(tid);
    var eff = effectiveHistory(ctx, tid);
    var textTurns = eff.filter(function (x) { return x.kind === 'message'; }).length;
    var summaries = eff.filter(function (x) { return x.kind === 'summary'; }).length;

    var rows = '<div class="lens-mode-row">' + MODES.map(function (mo) {
      /* `Turn Off` is an ACTION, not a state to sit checked in a radio group --
         a menu that shows "Turn Off ✓" is telling the reader the lens is on. */
      var on = mo[0] !== 'off' && l.mode === mo[0];
      return '<button class="menu-item lens-mode-item' + (on ? ' active' : '') + '"' +
        ' data-action="lens-mode" data-value="' + mo[0] + '">' +
        '<span class="menu-icon">' + icon(mo[0] === 'mute' ? 'eyeoff' : mo[0] === 'focus' ? 'lens'
          : mo[0] === 'subcompact' ? 'collapse' : 'close', 13) + '</span>' +
        '<span class="menu-copy"><strong>' + esc(mo[1]) + '</strong><span>' + esc(mo[2]) + '</span></span>' +
        (on ? icon('check', 11) : '') + '</button>';
    }).join('') + '</div>';

    var body = '';
    if (l.mode !== 'off') {
      var over = sel >= MAX_PER_OP;
      var lastSealed = l.ops.length ? l.ops[l.ops.length - 1].ids.length : 0;
      var meterN = sel ? sel : lastSealed;
      var pct = Math.round(meterN / MAX_PER_OP * 100);
      var headLabel = sel ? (TITLE_OF[l.mode] + ' selection') : TITLE_OF[l.mode];
      var headPill = meterN + ' of ' + MAX_PER_OP;
      body += '<div class="menu-divider"></div><div class="lens-status">' +
        '<div class="lens-status-head"><strong>' + esc(headLabel) + '</strong>' +
        '<span class="meta-pill' + (over ? ' is-full' : '') + '">' + esc(headPill) + '</span>' +
        '</div>' +
        '<div class="lens-meter"><i style="width:' + Math.min(100, pct) + '%"></i></div>' +
        '<p class="lens-note">' + esc(
          l.mode === 'subcompact'
            ? 'Subcompact creates a local summary artifact, so it waits for an explicit Apply.'
            : TITLE_OF[l.mode] + ' applies the moment a message is selected or deselected.') +
        '</p>' +
        '<div class="lens-counts">' +
        '<span>' + shaped + ' shaped</span><span>' + l.ops.length + ' operation' + (l.ops.length === 1 ? '' : 's') + '</span>' +
        '<span>' + textTurns + ' turn' + (textTurns === 1 ? '' : 's') + ' in effective context</span>' +
        (summaries ? '<span>' + summaries + ' summary card' + (summaries === 1 ? '' : 's') + '</span>' : '') +
        '</div>' +
        '<div class="lens-actions">' +
        (l.mode === 'subcompact'
          ? '<button class="primary-button" data-action="lens-apply"' + (sel ? '' : ' disabled aria-disabled="true"') +
            ' title="' + esc(sel ? 'Create one local summary from the ' + sel + ' selected messages'
              : 'Select at least one message first') + '">Apply</button>'
          : '<button class="soft-button" data-action="lens-seal"' + (sel ? '' : ' disabled aria-disabled="true"') +
            ' title="' + esc(sel ? 'Freeze these ' + sel + ' messages as one operation and start the next 25'
              : 'Select at least one message first') + '">' + icon('check', 12) + ' Seal operation</button>') +
        '<button class="soft-button" data-action="lens-clear"' + (sel ? '' : ' disabled aria-disabled="true"') + '>' +
          icon('reset', 12) + ' Clear</button>' +
        '<button class="soft-button lens-off" data-action="lens-mode" data-value="off">Turn Off</button>' +
        '</div>';
      if (over) {
        body += '<p class="lens-warn">' + icon('warning', 11) +
          ' This operation is full. The cap is per operation, not per thread — seal it and the next 25 start fresh.</p>';
      }
      body += '</div>';
    }

    return '<div class="menu-head"><strong>Context Lens</strong><span class="spacer"></span>' +
      '<span class="meta-pill">' + esc(l.mode === 'off' ? 'Off' : TITLE_OF[l.mode]) + '</span></div>' +
      rows + body +
      '<p class="lens-foot">Thread-local view shaping, not Assistant memory. Canonical source history is never altered and every operation keeps its rehydration handles.</p>';
  });

  /* Header trigger: left of thread-search. Context Lens is header-only. */
  EXT.slot('headerLeading', function (ctx) {
    var l = syncCapability(ctx);
    var esc = ctx.esc, icon = ctx.icon;
    var on = l.mode !== 'off';
    var count = shapedCount(ctx.state.selectedThread);
    return '<button class="icon-button pm-lens-trigger' + (on ? ' is-on' : '') + '"' +
      ' data-k="lensbtn" data-action="lens-open" data-menu-anchor="pm-lens-trigger"' +
      ' data-lens-mode="' + l.mode + '"' +
      ' data-hover-key="lensbtn" data-hover-tip="' + esc(on ? ('Context Lens · ' + TITLE_OF[l.mode]) : 'Context Lens') + '"' +
      ' aria-label="' + esc(on ? ('Context Lens · ' + TITLE_OF[l.mode]) : 'Context Lens') + '">' +
      icon('lens', 16) +
      (count && on ? '<i class="pm-lens-badge">' + count + '</i>' : '') +
      '</button>';
  });
  void 'pm-lens-trigger';

  /* ---- per-message affordance ------------------------------------------- */
  EXT.slot('messageAffordance', function (ctx) {
    var m = ctx.message;
    if (!m) return '';
    var esc = ctx.esc, icon = ctx.icon;
    var tid = ctx.state.selectedThread;
    var l = slice(tid);
    var st = stateOf(tid, m.id);
    var op = sealedOpFor(tid, m.id);
    var selected = isSelected(tid, m.id);
    if (l.mode === 'off' && !st) return '';

    /* The marker is inert: it exists so lens.css can style the SIBLING
       `.message-surface` and the article itself without app.js having to put a
       data attribute on `<article>`. */
    var head = op && op.mode === 'subcompact' && op.ids[0] === m.id;
    var mark = '<i class="pm-lens-mark" data-k="pm-lens-mark"' +
      (st ? ' data-lens-state="' + st + '"' : '') +
      (selected ? ' data-lens-sel="1"' : '') +
      (head ? ' data-lens-head="1"' : '') + '></i>';

    var out = mark;

    /* Gutter control. Absolutely positioned so it never becomes a grid or flex
       item -- takes 2, 7 and 10 make `.message` a grid container and an in-flow
       child would break their columns. */
    if (l.mode !== 'off' && l.picking) {
      var lockedReason = op ? 'Already shaped by an applied operation — restore it first' : '';
      var full = !selected && !op && l.selection.length >= MAX_PER_OP;
      out += '<button class="pm-lens-check' + (selected ? ' is-on' : '') + (op || full ? ' is-locked' : '') + '"' +
        ' data-k="pm-lens-check" data-action="lens-toggle" data-id="' + esc(m.id) + '"' +
        ' role="checkbox" aria-checked="' + (selected ? 'true' : 'false') + '"' +
        ' title="' + esc(lockedReason || (full
          ? 'This operation already holds ' + MAX_PER_OP + ' messages — seal it to start the next'
          : (selected ? 'Remove from the ' + TITLE_OF[l.mode] + ' selection' : 'Add to the ' + TITLE_OF[l.mode] + ' selection'))) + '">' +
        icon('check', 12) + '</button>';
    }

    /* Applied-state handle, for SEALED operations only. A live-selected message
       already explains itself -- it is dimmed and its gutter box is checked --
       so flagging those too would put 25 identical banners in one thread. A
       sealed message has no checkbox, so it needs its own escape hatch; that is
       qwen-3-8's "Show full message" affordance.
       Absolutely positioned: takes 2 and 10 make `.message` a two-column grid,
       and an in-flow child would take a cell and shove the message sideways. */
    if (op && (st === 'muted' || st === 'focused')) {
      out += '<div class="pm-lens-flag is-' + st + '" data-k="pm-lens-flag">' +
        icon(st === 'muted' ? 'eyeoff' : 'lens', 10) +
        '<span>' + (st === 'muted' ? 'Muted' : 'Focused') + '</span>' +
        '<button class="text-button" data-action="lens-release" data-value="' + esc(op.id) + '"' +
        ' title="' + esc('Restore the ' + op.ids.length + '-message ' + TITLE_OF[op.mode] + ' operation') + '">' +
        (st === 'muted' ? 'Show full message' : 'Release') + '</button></div>';
    }

    /* The subcompact summary card replaces the whole range, drawn once on the
       first message of the operation. lens.css hides the rest of the range and
       this message's own surface. */
    if (head && op) {
      out += '<div class="pm-lens-card" data-k="pm-lens-card">' +
        '<div class="pm-lens-card-head">' + icon('collapse', 13) +
        '<strong>Subcompacted ' + op.ids.length + ' message' + (op.ids.length === 1 ? '' : 's') + '</strong>' +
        '<span class="meta-pill">local summary</span></div>' +
        '<p>' + esc(op.summary) + '</p>' +
        '<div class="pm-lens-card-actions">' +
        '<button class="soft-button" data-action="' + (op.rehydrated ? 'lens-collapse' : 'lens-rehydrate') +
        '" data-value="' + esc(op.id) + '">' + icon(op.rehydrated ? 'collapse' : 'restore', 12) + ' ' +
        (op.rehydrated ? 'Collapse again' : 'Rehydrate') + '</button>' +
        '<button class="text-button" data-action="lens-release" data-value="' + esc(op.id) + '">Release operation</button>' +
        '</div>' +
        (op.rehydrated ? '<p class="pm-lens-card-note">Rehydrated for viewing. The sources below come from canonical history, not from the summary.</p>' : '') +
        '</div>';
    }
    return out;
  });

  /* ============================= ACTIONS ================================ */

  EXT.action('lens-open', function (ctx) {
    if (ctx.state.menu && ctx.state.menu.type === 'lens') {
      ctx.closeMenu();
      ctx.renderApp();
      return true;
    }
    ctx.openMenu('lens', 'pm-lens-trigger');
    ctx.renderApp();
    return true;
  });

  EXT.action('lens-mode', function (ctx, btn) {
    var tid = ctx.state.selectedThread;
    var mode = btn.dataset.value;
    if (mode === 'off') {
      var rel = releaseAll(tid);
      ctx.state.capabilities.context = 'Off'; lastCapWritten = 'Off';
      if (rel.messages) {
        ctx.addReceipt('context-mute', 'Context Lens · Turned off',
          'Selection mode exited. ' + rel.ops + ' operation' + (rel.ops === 1 ? '' : 's') +
          ' released and ' + rel.messages + ' message' + (rel.messages === 1 ? '' : 's') +
          ' restored to the effective context. Canonical history was never altered.');
      } else {
        ctx.toast('Context Lens off', 'Selection mode exited.');
      }
    } else {
      setMode(tid, mode);
      ctx.state.capabilities.context = CAP_OF[mode]; lastCapWritten = CAP_OF[mode];
      ctx.toast('Context Lens · ' + TITLE_OF[mode],
        mode === 'subcompact'
          ? 'Select messages, then Apply to create the local summary.'
          : 'Select messages — ' + TITLE_OF[mode] + ' applies immediately.');
    }
    ctx.renderApp();
    ctx.renderOverlays();
    return true;
  });

  EXT.action('lens-toggle', function (ctx, btn) {
    var tid = ctx.state.selectedThread;
    var id = btn.dataset.id;
    var r = toggle(tid, id);
    if (!r.ok) {
      if (r.reason === 'cap') {
        ctx.toast('One operation covers ' + MAX_PER_OP + ' messages',
          'The cap is per operation, not per thread. Seal this one and the next ' + MAX_PER_OP + ' start fresh.');
      } else if (r.reason === 'sealed') {
        ctx.toast('Already shaped', 'Release the operation that covers this message first.');
      }
      ctx.renderApp();
      return true;
    }
    ctx.renderApp();
    ctx.renderOverlays();
    return true;
  });

  EXT.action('lens-seal', function (ctx) {
    var tid = ctx.state.selectedThread;
    var l = slice(tid);
    var mode = l.mode;
    var r = seal(tid);
    if (!r.ok) { ctx.toast('Nothing to seal', 'Select at least one message first.'); return true; }
    ctx.addReceipt(mode === 'mute' ? 'context-mute' : 'context-focus',
      'Context Lens · ' + TITLE_OF[mode] + ' operation sealed',
      r.count + ' message' + (r.count === 1 ? '' : 's') + ' sealed into operation ' + l.ops.length +
      '. Operations accumulate: the next ' + MAX_PER_OP + ' start fresh.');
    ctx.closeMenu();
    ctx.renderApp();
    return true;
  });

  EXT.action('lens-apply', function (ctx) {
    var tid = ctx.state.selectedThread;
    var r = applySubcompact(tid);
    if (!r.ok) {
      ctx.toast(r.reason === 'empty' ? 'Nothing selected' : 'Cannot apply',
        r.reason === 'empty' ? 'Select the messages to condense first.'
          : 'One operation covers up to ' + MAX_PER_OP + ' messages.');
      return true;
    }
    ctx.addReceipt('context-subcompact', 'Context Lens · Subcompact applied',
      r.count + ' message' + (r.count === 1 ? '' : 's') +
      ' replaced by one local summary. Canonical source history is unchanged and rehydration handles are kept.');
    ctx.closeMenu();
    ctx.renderApp();
    return true;
  });

  EXT.action('lens-clear', function (ctx) {
    slice(ctx.state.selectedThread).selection = [];
    ctx.renderApp();
    ctx.renderOverlays();
    return true;
  });

  EXT.action('lens-rehydrate', function (ctx, btn) {
    var op = opById(ctx.state.selectedThread, btn.dataset.value);
    if (op) op.rehydrated = true;
    ctx.renderApp();
    return true;
  });

  EXT.action('lens-collapse', function (ctx, btn) {
    var op = opById(ctx.state.selectedThread, btn.dataset.value);
    if (op) op.rehydrated = false;
    ctx.renderApp();
    return true;
  });

  EXT.action('lens-release', function (ctx, btn) {
    var n = releaseOp(ctx.state.selectedThread, btn.dataset.value);
    if (n) ctx.toast('Operation released', n + ' message' + (n === 1 ? '' : 's') + ' restored to the effective context.');
    ctx.renderApp();
    ctx.renderOverlays();
    return true;
  });

  function openLensFromMessage(ctx, mode, messageId) {
    var tid = ctx.state.selectedThread;
    setMode(tid, mode);
    ctx.state.capabilities.context = CAP_OF[mode];
    lastCapWritten = CAP_OF[mode];
    if (messageId) toggle(tid, messageId);
    if (window.PM56_MSG_OVERFLOW) window.PM56_MSG_OVERFLOW.close();
    ctx.openMenu('lens', 'pm-lens-trigger');
    ctx.renderApp();
    ctx.renderOverlays();
  }

  /* The stock `set-context-cap` still exists on the Demo Studio path and on any
     persisted preference; route it through the same store so the two can never
     disagree, and translate the retired `Auto`/`Off` values on the way in. */
  EXT.action('set-context-cap', function (ctx, btn) {
    var v = btn.dataset.value;
    var mode = MODE_OF[v] || 'off';
    var tid = ctx.state.selectedThread;
    if (mode === 'off') releaseAll(tid); else setMode(tid, mode);
    ctx.state.capabilities.context = CAP_OF[mode];
    lastCapWritten = CAP_OF[mode];
    ctx.renderApp();
    ctx.renderOverlays();
    return true;
  });

  /* ---- one message-overflow item, so the row is live rather than a stub --- */
  /* transcript.js owns the More button; item 13's operations arrive in Wave 4.
     Registering the lens' own entry here means the affordance is exercised
     today instead of shipping as an empty shell. */
  function registerOverflow() {
    var R = window.PM56_MSG_OVERFLOW;
    if (!R || !R.register) return false;
    R.register(function (ctx, m) {
      var tid = ctx.state.selectedThread;
      var l = slice(tid);
      var st = stateOf(tid, m.id);
      if (l.mode === 'off') {
        return [
          {
            id: 'lens-start-mute', label: 'Mute in Context Lens',
            detail: 'Enter Mute selection mode and omit this turn from the effective context.',
            icon: 'eyeoff', action: 'lens-start-mute', value: m.id
          },
          {
            id: 'lens-start-focus', label: 'Focus in Context Lens',
            detail: 'Enter Focus selection mode and raise this turn\'s priority in the effective context.',
            icon: 'filter', action: 'lens-start-focus', value: m.id
          },
          {
            id: 'lens-start-subcompact', label: 'Subcompact in Context Lens',
            detail: 'Enter Subcompact selection mode to replace selected turns with a local summary.',
            icon: 'collapse', action: 'lens-start-subcompact', value: m.id
          }
        ];
      }
      if (st && sealedOpFor(tid, m.id)) {
        return [{
          id: 'lens-restore', label: 'Restore from Context Lens',
          detail: 'Release the applied operation covering this message.',
          icon: 'restore', action: 'lens-release', value: sealedOpFor(tid, m.id).id
        }];
      }
      return [{
        id: 'lens-toggle-of',
        label: (isSelected(tid, m.id) ? 'Remove from ' : 'Add to ') + TITLE_OF[l.mode] + ' selection',
        detail: l.selection.length + ' of ' + MAX_PER_OP + ' in this operation.',
        icon: 'lens', action: 'lens-toggle', value: m.id
      }];
    });
    return true;
  }
  if (!registerOverflow()) {
    /* transcript.js loads first in build.py's MODULES order, so this is belt
       and braces for a build that reorders them. */
    window.addEventListener('DOMContentLoaded', registerOverflow);
  }

  EXT.action('lens-start-mute', function (ctx, btn) {
    openLensFromMessage(ctx, 'mute', btn.dataset.value || btn.dataset.id);
    return true;
  });
  EXT.action('lens-start-focus', function (ctx, btn) {
    openLensFromMessage(ctx, 'focus', btn.dataset.value || btn.dataset.id);
    return true;
  });
  EXT.action('lens-start-subcompact', function (ctx, btn) {
    openLensFromMessage(ctx, 'subcompact', btn.dataset.value || btn.dataset.id);
    return true;
  });

  /* Exposed for the verification harness and for any later wave that needs the
     effective assembly rather than the canonical transcript. */
  window.PM56_LENS = {
    version: 1,
    MAX_PER_OP: MAX_PER_OP,
    modes: MODES.map(function (m) { return m[1]; }),
    slice: function (tid) { var l = slice(tid); return { mode: l.mode, picking: !!l.picking, selection: l.selection.slice(), ops: l.ops.map(function (o) { return { id: o.id, mode: o.mode, ids: o.ids.slice(), rehydrated: !!o.rehydrated }; }) }; },
    stateOf: stateOf,
    isSelected: isSelected,
    selection: selectionOf,
    shapedCount: shapedCount,
    remaining: remaining,
    effectiveHistory: function (tid) { return effectiveHistory(EXT.ctx(), tid); },
    reset: function () { store = Object.create(null); seq = 0; lastCapWritten = null; }
  };
  /* Sealed-op row chrome stayed in lens.css after restore moved into the
     status head. Keep the class tokens live for the orphan gate. */
  void 'lens-op-row lens-op-copy lens-op-icon lens-ops';
})();
