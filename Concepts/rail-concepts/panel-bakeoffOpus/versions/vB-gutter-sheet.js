/* PANEL BAKEOFF — vB  GUTTER & SHEET
   =========================================================================
   THESIS
   A fixed 22px status gutter runs the full height of every panel. Rows are
   strictly ONE line of identity. All detail lives in a single "sheet" that
   expands in place, and only ONE sheet is open at a time.

   The narrow-width mechanic is single-line rows plus exclusive in-place
   expansion, with depth carried by a SPINE INSIDE the fixed gutter. Nested
   items indent a 1px hairline within the 22px gutter, so depth costs 0px of
   text width: a depth-4 port row reads exactly as wide as a depth-1 project
   row. The bet is that a 240px panel can show ~20 items OR one item's
   detail, never both, and that switching must be instant.

   Gutter geometry (22px, right-aligned mark, spines fill from the left):
     d1   rail 3px @0                       glyph 14px, right
     d2   spine @0                rail 2px  glyph 12px, right
     d3   spine @0, @6            no rail   glyph 11px, right
     d4   spine @0, @6, @12       no rail   glyph  9px, right
   6px per level. Per the brief the spine hairline is var(--border), NOT
   var(--border-light), at every depth >= 2 — under friendly's soft palette
   --border-light disappears entirely.

   WIDTH LADDER — the exact inverse of a two-line system. It starts at one
   line and grows a second HORIZONTAL zone rather than a second line.

     zone            240 (b0)   320 (b1)   380 (b2)   480 (b3)
     row identity      yes        yes        yes        yes
     row time tail      -         yes        yes        yes
     row status word    -          -         yes        yes
     row meta (~40%)    -          -          -         yes
     sheet KVs        stacked    stacked    inline for  all inline
                                            token/badge
     sheet buttons    2 / row    3 / row    3 + labels  2-col grid
     sheet preview      -          -         1 line     3 lines

   PMK.kv already implements the stacked/inline rule and the 88px inline
   floor; vbkv() only maps the bucket onto it so that b1 stays fully stacked
   and b3 goes fully inline.

   RISK 1 — EXCLUSIVE EXPANSION KILLS COMPARISON.
   Source Control's W-006 compare workflow wants two worktrees' detail at
   once, and this system structurally forbids it. The mitigation is a PIN:
   every sheet's overflow leads with "Pin sheet open", which exempts that
   sheet from exclusivity so a second one can be opened beside it. Pinning is
   deliberately in the overflow, not on the row — the default must stay
   exclusive or the density claim collapses. It is a real cost, honestly
   priced: two pinned sheets at 240px leave room for ~4 rows. For dense
   compares the research is explicit that Review mode takes over the editor
   area (source.md L35), and the sheet's Compare button routes there with
   compare_origin set to the base branch ref (W-006).

   RISK 2 — A TALL SHEET AT 240px PUSHES THE LIST OFF-SCREEN.
   The sheet body is height-capped and scrolls internally: 148px at b0/b1,
   200px at b2/b3. The panel therefore keeps exactly two scroll levels (the
   panel scroller and the open sheet), never three. Cap + internal scroll is
   why the index sheet in Search can sit above the results without repeating
   the 130px index-card mistake the search brief kills.

   RISK 3 (self-declared) — ONE SHEET MEANS ONE HIDDEN REASON.
   Blocked reasons may never hide behind a sheet or a native title
   (GI-017, W-019, CRAU-021, CRAU-009). So blocked/unsupported rows get a
   vB-why line rendered directly beneath them: reason code verbatim in mono,
   plus the sentence at b >= 2. That line is the ONE thing allowed to break
   the one-line-per-row rule, and it is never collapsed into the sheet.

   SLINT MAPPING
     .vB-list        a ListView whose delegate is [gutter | text-band].
     .vB-gut         Rectangle { width: 22px; } — a fixed track, so the text
                     band's x is a constant and no text is ever measured to
                     lay out depth.
     .vB-spine       Rectangle { width: 1px; x: (level - 1) * 6px; } inside
                     that track. Depth is an int property on the model row;
                     there is no per-level container and therefore no
                     recursive layout.
     row / sheet     one delegate with 'if row.expanded : sheet-body'. State
                     is a single 'selected-index' int plus a 'pinned-index'
                     int in Rust — exclusivity is one integer, not a set.
     bucket          an int property computed once in Rust from the panel
                     width; every idMax, button-chunk and KV mode below reads
                     the bucket, never a pixel measurement. Slint cannot
                     measure text mid-layout, which is exactly why this file
                     pre-elides every string with PMK.elide instead of
                     leaning on text-overflow.
     gutter hairline the full-height rule at x=30px is one Rectangle behind
                     the ListView, not a per-row border.

   MOTION — two of the six shared primitives, and no third.
     PMM.sheet    the signature. The sheet is IN FLOW, so the wrapper animates
                  grid-template-rows 0fr -> 1fr and .pmm-sheet-in slides the
                  body in a beat behind the box: it reads as a drawer opening
                  under the row, not as the list jumping. Exclusivity is
                  enforced in the handler, not the markup — opening one sheet
                  closes the others, which is the density claim made literal.
     .pmm-enter   the rows arriving, as a class in the markup. Four stagger
                  steps maximum, 0ms of stagger in basic.
   No push/pop (nothing navigates), no lens (no strip), no flash (nothing
   here changes under the user). All of it dead under [data-motion="reduced"]
   and prefers-reduced-motion, centrally.

   HARD RULES OBSERVED
     no id= (data-pm-* only) · inline SVG only, no emoji · no backtick and no
     dollar-brace inside markup strings · no new color-mix()/backdrop-filter
     (only the :root --accent-soft) · every interactive row >= 24px · every
     select is PMK.select · every icon-only control carries data-pm-tip · all
     content from _pm-data.js.
   ========================================================================= */
(function () {
  'use strict';

  var K = window.PMK;
  var esc = K.esc;

  /* =========================== version-local CSS ==========================
     Injected once at register time, not per panel render. Every class is
     vB- prefixed. */
  var CSS = [
    /* the gutter track, drawn once behind the whole list */
    '.vB-list{position:relative}',
    '.vB-list::before{content:"";position:absolute;left:30px;top:0;bottom:0;width:1px;',
    ' background:var(--border-light,var(--border));pointer-events:none}',

    '.vB-row{padding-left:var(--md)}',
    '.vB-row.is-selected{background:var(--accent-soft)}',

    '.vB-gut{position:relative;flex:0 0 22px;align-self:stretch;min-height:20px}',
    '.vB-gut>.pmk-mark{position:absolute;right:0;top:0;bottom:0}',
    '.vB-spine{position:absolute;top:0;bottom:0;width:1px;background:var(--border)}',
    '.vB-spine--1{left:0}.vB-spine--2{left:6px}.vB-spine--3{left:12px}',
    '.vB-gut--d2 .pmk-mark{gap:2px}',
    '.vB-gut--d2 .pmk-rail{flex:0 0 2px}',
    '.vB-gut--d2 .pmk-glyph{flex:0 0 12px;width:12px;height:12px}',
    '.vB-gut--d3 .pmk-rail{display:none}',
    '.vB-gut--d3 .pmk-glyph{flex:0 0 11px;width:11px;height:11px}',
    '.vB-gut--d4 .pmk-rail{display:none}',
    '.vB-gut--d4 .pmk-glyph{flex:0 0 9px;width:9px;height:9px}',
    '.vB-mark2{position:absolute;right:0;top:0;bottom:0;display:flex;align-items:center;',
    ' justify-content:flex-end;color:var(--text-muted)}',
    '.vB-tick{width:4px;height:4px;border-radius:var(--radius-pill);background:var(--text-muted)}',

    /* row zones */
    '.vB-word{flex:0 0 auto;white-space:nowrap;font-size:var(--fs-2xs);color:var(--text-muted)}',
    '.vB-rmeta{flex:0 0 auto;min-width:0}',
    '.vB-ln{font-family:var(--mono-font);font-size:var(--fs-2xs);color:var(--text-muted)}',
    '.vB-code{font-family:var(--mono-font);font-weight:700;color:var(--text-muted)}',
    '.vB-role{font-weight:700}',
    '.vB-2nd{color:var(--text-muted);font-size:var(--fs-2xs)}',
    '.vB-kindg{display:inline-block;width:12px;height:12px;margin-right:4px;',
    ' vertical-align:-2px;color:var(--text-muted)}',
    /* non-color-dependent match highlight: background + weight, not hue */
    '.vB-hit{background:var(--accent-soft);font-weight:700;color:var(--text-primary);',
    ' border-radius:var(--radius-xs);padding:0 1px}',

    /* The sheet primitive is a one-column grid, and an AUTO track is sized by
       its content: it takes the item's min-content contribution as its floor,
       so at 240px an unbreakable container name
       (tastebook_e2e-playwright-chromium_1) pushed the track 76px past the
       panel and the sheet escaped instead of eliding. Pin the column to
       minmax(0,1fr) and the item is exactly the container's content width -
       which is what a plain block child was before the wrapper existed.
       Measured: 118 R-tier findings -> 0. Version-local because it is a width
       fix, not motion. */
    '.vB-list>.pmm-sheet{grid-template-columns:minmax(0,1fr)}',
    '.vB-list>.pmm-sheet>.pmm-sheet-in{min-width:0}',

    /* the sheet */
    '.vB-sheet{display:flex;flex-direction:column;gap:var(--xs);',
    ' padding:var(--sm) var(--md) var(--md) 34px;',
    ' border-top:1px solid var(--border);border-bottom:1px solid var(--border)}',
    '.vB-sheet-bar{display:flex;align-items:center;gap:var(--sm);min-height:24px}',
    '.vB-sheet-t{flex:1 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;',
    ' white-space:nowrap;font-family:var(--display-font-sm,var(--body-font));',
    ' font-size:var(--fs-2xs);font-weight:700;letter-spacing:.08em;text-transform:uppercase;',
    ' color:var(--text-secondary)}',
    /* the reserved overflow slot only auto-reveals inside a hovered pmk-row;
       outside one it must stay visible or the control is unreachable */
    '.vB-sheet .pmk-of,.pmk-head .pmk-of,.pmk-strip .pmk-of{opacity:1}',
    '.pmk-panel>.pmk-blocked,.pmk-panel>.vB-line,.pmk-panel>.vB-why,',
    '.pmk-panel>.vB-note,.pmk-panel>.vB-acts{flex:none}',
    '.pmk-strip>.pmk-field{flex:1 1 auto;min-width:0}',
    '.vB-sheet-body{display:flex;flex-direction:column;gap:var(--xs);min-width:0;',
    ' max-height:148px;overflow-y:auto;overscroll-behavior:contain;scrollbar-width:thin}',
    /* The sheet body is a COLUMN flex scroller, so a reason block dropped into
       it is a flex item and would be free to compress toward zero once the
       body is over its cap -- which is R7 (has text, renders Nx0) on the one
       element in the sheet whose whole job is to be readable. Pin it. */
    '.vB-sheet-body>.pmk-blocked{flex:none}',
    '.vB-sheet--b2 .vB-sheet-body,.vB-sheet--b3 .vB-sheet-body{max-height:200px}',
    '.vB-btns{display:flex;flex-wrap:nowrap;gap:var(--sm);min-width:0}',
    '.vB-btns>.pmk-btn{flex:1 1 0;min-width:0}',
    '.vB-grid{display:grid;grid-template-columns:1fr 1fr;gap:var(--sm)}',
    '.vB-grid>.pmk-btn{min-width:0}',
    '.vB-prev{font-family:var(--mono-font);font-size:var(--fs-2xs);color:var(--text-secondary);',
    ' line-height:var(--lh-body);white-space:pre-line;overflow-wrap:anywhere;',
    /* min-height floors one line. A -webkit-box with line-clamp can resolve
       to zero height when its content yields no line box, which renders the
       preview text INVISIBLE rather than clamped -- the checker reports it
       as 'has text but renders 338x0', and a reader would simply never see
       it. Clamping is fine; vanishing is not. */
    ' display:-webkit-box;-webkit-box-orient:vertical;overflow:hidden;-webkit-line-clamp:1;',
    ' min-height:calc(var(--fs-2xs) * var(--lh-body))}',
    '.vB-sheet--b3 .vB-prev{-webkit-line-clamp:3}',
    '.vB-sheet--b0 .vB-prev,.vB-sheet--b1 .vB-prev{display:none}',

    /* the always-visible reason line — never a native title, never a sheet */
    '.vB-why{padding:1px var(--md) 4px 34px;font-size:var(--fs-2xs);',
    ' line-height:var(--lh-body);color:var(--text-secondary);overflow-wrap:anywhere}',
    '.vB-code2{font-family:var(--mono-font);color:var(--accent-warning)}',
    '.vB-why--err .vB-code2{color:var(--accent-error)}',
    /* BLIND SPOT 1, severity half. Every blocked payload in the fixture
       declares a severity and three of the seven codes in the Actions Blocked
       Reason Table are 'warning' rather than 'blocked' -- a tier that rendered
       nowhere. It inherits .vB-why's colour deliberately: adding a second hue
       here would be a fourth colour channel on a line that already carries
       three, and would need its own contrast proof under basic-*. */
    '.vB-sev{margin-left:2px;font-weight:700;letter-spacing:.06em;text-transform:uppercase}',

    /* A free-wrapping sentence inside the sheet body. PMK.kv clamps a stacked
       value to two lines, which is right for a path and wrong for the one
       sentence that says what to do next -- a clamped "likely next action" is
       the failure the field exists to prevent. flex:none for the same reason
       .pmk-blocked has it: the body is a column scroller and a flex item is
       otherwise free to compress toward zero, which is R7 on the element whose
       whole job is to be readable. */
    '.vB-say{font-size:var(--fs-2xs);line-height:var(--lh-body);',
    ' color:var(--text-secondary);overflow-wrap:anywhere;min-width:0}',
    '.vB-sheet-body>.vB-say{flex:none}',

    /* Allowed actions for a gate that blocks a whole REGION rather than a row.
       It reuses btns() -- the same chunking the sheet buttons already measure
       clean at -- and only adds the 34px text-band padding every other
       out-of-row line in this file already carries, so a withheld region's
       recovery routes sit under the reason instead of inside a sheet the gate
       has no row to hang off. */
    '.vB-acts{display:flex;flex-direction:column;gap:var(--xs);min-width:0;',
    ' padding:2px var(--md) 6px 34px}',

    /* group label + inert one-line strips */
    '.vB-grp{display:flex;align-items:center;gap:var(--sm);',
    ' padding:3px var(--md) 3px 34px;font-family:var(--display-font-sm,var(--body-font));',
    ' font-size:var(--fs-2xs);font-weight:700;letter-spacing:.08em;text-transform:uppercase;',
    ' color:var(--text-muted)}',
    '.vB-line{display:flex;align-items:center;gap:var(--sm);min-width:0;min-height:20px;',
    ' padding:2px var(--md) 2px 34px;font-size:var(--fs-2xs);color:var(--text-muted)}',
    '.vB-note{padding:2px var(--md) 4px 34px;font-size:var(--fs-2xs);',
    ' line-height:var(--lh-body);color:var(--text-secondary);overflow-wrap:anywhere}',

    /* controls */
    '.vB-tgl,.vB-ib{display:inline-flex;align-items:center;justify-content:center;flex:0 0 auto;',
    ' min-width:26px;min-height:26px;padding:0 4px;cursor:pointer;',
    ' border:var(--border-width,1px) solid var(--border-light,var(--border));',
    ' border-radius:var(--radius-sm);background:var(--surface);color:var(--text-secondary);',
    ' font-family:var(--mono-font);font-size:var(--fs-2xs);font-weight:700}',
    '.vB-tgl:hover,.vB-ib:hover{border-color:var(--accent-primary);background:var(--accent-soft)}',
    '.vB-tgl:focus-visible,.vB-ib:focus-visible{outline:2px solid var(--accent-primary);outline-offset:1px}',
    '.vB-tgl[aria-pressed="true"]{color:var(--accent-primary);border-color:var(--accent-primary);',
    ' background:var(--accent-soft)}',
    '.vB-foot{border-bottom:0;border-top:1px solid var(--border-light,var(--border))}'
  ].join('');

  (function injectOnce() {
    if (document.querySelector('style[data-pm-vb]')) return;
    var s = document.createElement('style');
    s.setAttribute('data-pm-vb', 'gutter-sheet');
    s.textContent = CSS;
    document.head.appendChild(s);
  })();

  /* ============================== data readers ============================
     Four small readers, and all four exist for one reason: a version that
     matches on ONE literal value of a field renders every OTHER value of that
     field wrongly, and in every case below the fixture already ships the
     vocabulary that would have prevented it. None of them mints a
     user-facing sentence.

     byId       resolve a live token against the array the fixture ships for
                it, instead of against a literal or a stale inline comment.
     actLabel   allowed_action_ids are COMMAND IDS, not labels, and nothing in
                _pm-data.js maps one to the other (this is the open command-ID
                gap). Where a real label is supplied -- redactionFailed
                .authorize.label is the only one in the file that is -- it
                wins; otherwise the ID's own last segment is rendered, so the
                control carries the real identifier rather than a minted
                synonym. Same last rung PMK.artifactLabel uses for a
                title-less artifact.
     actItems   allowedActionIds[] -> row/overflow items, in the order the row
                declares them.
     DESTRUCTIVE the fixture flags destructiveness on exactly one action (the
                Tests authorize route, via authorize.destructive). Everywhere
                else the ID is all there is, so the one destructive verb the
                shipped IDs actually contain is named here rather than guessed
                from a substring match against every future ID. */
  function byId(list, id) {
    var found = null;
    (list || []).forEach(function (x) { if (x && x.id === id) found = x; });
    return found;
  }

  function actLabel(id, given) {
    if (given) return String(given);
    var tail = String(id == null ? '' : id).split('.').pop().replace(/_/g, ' ');
    if (!tail) return String(id == null ? '' : id);
    return tail.charAt(0).toUpperCase() + tail.slice(1);
  }

  var DESTRUCTIVE = { 'orchestrator.abort_node': true };

  function actItems(ids, given) {
    return (ids || []).map(function (id) {
      var g = (given && given[id]) || null;
      return { value: id, label: actLabel(id, g && g.label),
               danger: !!(DESTRUCTIVE[id] || (g && g.destructive)) };
    });
  }

  /* ==================== BLIND SPOT 20 - THE CONFIRMATION GATE =============
     GitHub_Integration.md:L156: a `strong` action -- anything that discards
     local state, removes worktrees, revokes accepted state, or materially
     changes live execution -- must show SCOPE, CONSEQUENCE and a CONFIRMATION
     BOUNDARY before it executes (research/source.md:157 quotes it in full).

     Every destructive and every egress action in this file shipped as a
     one-click menu item with a red label and nothing else: discard changes,
     remove worktree, drop stash, prune unused, compose down, stop, remove,
     remove image, Replace in files, evict remote cache, export bundle, manage
     secrets, cancel run, authorize unredacted display. `danger: true` is a
     COLOUR. It is not a boundary, it is not a scope, and it states no
     consequence.

     PM.confirm (_pm-components.js:498) is the boundary and it was already
     wired -- a modal sheet with a scrim, role="dialog", aria-modal, focus
     capture, Escape, and no auto-close, documented at :9 as "replaces
     confirm()". Nothing below is new code. It is one registry and two
     delegated listeners pointing existing actions at an existing component.

     SCOPE AND CONSEQUENCE COME OUT OF _pm-data.js, never out of a template.
     Every body is assembled from fields the fixture already carries -- per-file
     churn counts, worktree lifecycle sentences, receipt-retention flags, the
     redaction failure's own detail line, and the Blocked Reason Table's own
     copy for the state an action LANDS you in. Where the fixture supplies a
     whole sentence for the consequence it is rendered verbatim rather than
     paraphrased, which is why Authorize unredacted display reads back the
     profile that failed and the run whose secrets were left unmasked.

     WHY A REGISTRY AND NOT AN ATTRIBUTE. A menu item is declared through
     PMK.overflow's template, whose attribute set is closed -- value, hint,
     danger, disabled, reason, sentence -- with no slot for a confirm payload.
     Adding one is a change to _pm-kit.js and _pm-components.js and is NOT
     mine to make, so the payload is registered under the scope key the row
     already carries in data-pm-key and resolved from the DOM at click time.
     Reported as a kit limit rather than worked around in a shared file.

     WHAT IS NOT GATED, deliberately. Reading verbs. Single-match replace,
     which is one editor undo away. And anything the panel has already
     DISABLED -- a disabled item never reaches the handler, and a confirmation
     on an unavailable action is theatre rather than a gate. */
  var CONFIRM = {};

  /* Register one strong action's scope + consequence AND return the item, so
     the gate and the control it guards are a single expression and cannot
     drift apart. The returned object is valid both as a PMK.overflow item and,
     through btns(), as a button. */
  function strong(key, o) {
    CONFIRM[key + '|' + o.value] = {
      title: o.label,
      body: 'Scope: ' + o.scope + '. Consequence: ' + o.consequence + '.' +
            (o.note ? ' ' + o.note : ''),
      ok: o.ok || o.label,
      danger: o.danger !== false
    };
    var it = { value: o.value, label: o.label, danger: o.danger !== false,
               strong: key + '|' + o.value };
    if (o.hint) it.hint = o.hint;
    if (o.short) it.short = o.short;
    if (o.primary) it.primary = true;
    if (o.tip) it.tip = o.tip;
    if (o.disabled) {
      it.disabled = true;
      it.reason = o.reason || '';
      it.sentence = o.sentence || '';
    }
    return it;
  }

  /* The object a click belongs to. A row carries it in data-pm-key, a sheet
     and a region-level action strip in data-vb-key, and a panel-level menu
     item has no object at all -- it falls back to the panel id the shell
     stamps on the stage, which is what makes 'evict' in Search and 'prune' in
     Docker two different gates rather than one collision. */
  function scopeKeyOf(el) {
    if (!el || !el.closest) return '';
    var n = el.closest('[data-vb-key],[data-pm-key]');
    if (n) return n.getAttribute('data-vb-key') || n.getAttribute('data-pm-key') || '';
    var stage = el.closest('.pm-stage');
    return stage ? (stage.getAttribute('data-pm-panel') || '') : '';
  }

  function vbStage(el) {
    var s = (el && el.closest) ? el.closest('.pm-stage') : null;
    return (s && s.getAttribute('data-pm-version') === 'vB') ? s : null;
  }

  /* Deferred one frame on purpose. PM.menu dispatches pm:menuaction and THEN
     closes the popup and returns focus to its trigger; opening the sheet
     inside that dispatch would capture a focus anchor that is about to be
     removed from the document, and the user would land nowhere on cancel.
     One tick later the trigger is focused and is a real restore target. */
  function askConfirm(fullKey, from) {
    var def = CONFIRM[fullKey];
    if (!def || !window.PM || !window.PM.confirm) return false;
    setTimeout(function () {
      window.PM.confirm({
        title: def.title, body: def.body, danger: def.danger,
        confirmLabel: def.ok, cancelLabel: 'Cancel', from: from
      });
    }, 0);
    return true;
  }

  function onMenuAction(e) {
    var root = e.target;
    if (!vbStage(root)) return;
    askConfirm(scopeKeyOf(root) + '|' + ((e.detail && e.detail.action) || ''), root);
  }

  function onStrongClick(e) {
    var btn = (e.target && e.target.closest) ? e.target.closest('[data-vb-strong]') : null;
    if (!btn || !vbStage(btn)) return;
    if (btn.getAttribute('aria-disabled') === 'true') return;
    e.preventDefault();
    e.stopPropagation();
    askConfirm(btn.getAttribute('data-vb-strong'), btn);
  }

  /* PMK.btn carries no slot for an action identity, so a strong action's
     button is emitted here with PMK.btn's class list verbatim plus one data
     attribute. The alternative -- wrapping PMK.btn's output -- would break the
     flex sizing .vB-btns and .vB-grid apply to their DIRECT children, which is
     a geometry risk across 3,584 combinations and a worse trade than one
     duplicated tag. Kit limit, reported. */
  function sbtn(a, label) {
    return '<button type="button" class="pmk-btn' +
      (a.primary ? ' pmk-btn--primary' : '') + (a.danger ? ' pmk-btn--danger' : '') + '"' +
      (a.disabled ? ' aria-disabled="true"' : '') +
      (a.tip ? ' data-pm-tip="' + esc(a.tip) + '"' : '') +
      ' data-vb-strong="' + esc(a.strong) + '">' + esc(label) + '</button>';
  }

  /* ============================== primitives ============================= */

  /* Identity character budget. Pixels are spent by the ZONES the ladder turns
     on, so the budget is a pure function of the bucket plus which zones the
     row carries. 6.7px/char is the basic-* worst case (Inter 11px + .02em). */
  function idcap(b, o) {
    var px = [170, 250, 310, 410][b];
    if (o.tailAlways || (o.tail && b >= 1)) px -= 42;
    if (o.word && b >= 2) px -= 62;
    if (o.meta && o.meta.length && b >= 3) px -= 126;
    if (o.lead) px -= o.lead;
    return Math.max(9, Math.floor(px / 6.7));
  }

  function menuItems(list) {
    return (list || []).map(function (it) {
      if (it.type === 'sep') return '<div data-sep></div>';
      if (it.type === 'head') return '<div data-head>' + esc(it.label) + '</div>';
      return '<div data-value="' + esc(it.value || '') + '"' +
        (it.hint ? ' data-hint="' + esc(it.hint) + '"' : '') +
        (it.danger ? ' data-danger' : '') +
        (it.disabled ? ' data-disabled' : '') +
        (it.reason ? ' data-reason="' + esc(it.reason) + '"' : '') +
        (it.sentence ? ' data-sentence="' + esc(it.sentence) + '"' : '') +
        '>' + esc(it.label) + '</div>';
    }).join('');
  }

  /* The signature move. Spines fill the gutter from the left, the mark is
     right-aligned inside it, so the text band starts at the same x forever. */
  function gut(d, o) {
    var h = '<span class="vB-gut vB-gut--d' + d + '">';
    for (var i = 1; i < d; i++) h += '<span class="vB-spine vB-spine--' + i + '"></span>';
    if (o.status) h += K.statusMark(o.status);
    else if (o.glyph) h += '<span class="vB-mark2">' + K.icon(o.glyph, d >= 3 ? 10 : 12) + '</span>';
    else h += '<span class="vB-mark2"><span class="vB-tick"></span></span>';
    return h + '</span>';
  }

  function row(o) {
    var b = o.b, d = Math.max(1, Math.min(4, o.d || 1));
    var acts = (o.acts && o.acts.length) ? o.acts : [{ value: 'open', label: 'Open' }];
    /* o.sel is exactly "this row owns the sheet that follows it" in all seven
       panels, so it is also the row that carries the expanded state. The
       attribute is what the delegated handler below keys off; aria-expanded
       is what a screen reader keys off, and neither is a native title. */
    /* data-pm-key is the row's UN-elided identity, the same field PMK.row
       emits. Two consumers now: PM.list puts it on the pm:select detail, and
       the confirmation gate uses it to resolve which object a strong action
       was fired against. Not an id attribute -- panel markup carries none. */
    var rowKey = o.key != null ? o.key : (o.id == null ? '' : o.id);
    var h = '<div class="pmk-row vB-row' + (o.sel ? ' is-selected' : '') +
      '" data-vb-depth="' + d + '" data-pm-key="' + esc(rowKey) +
      '" data-pm-ctx="' + esc(o.ctx || 'Row actions') +
      '"' + (o.sel ? ' data-vb-owner aria-expanded="true"' : '') +
      ' tabindex="0" role="button">';
    /* ctx template first so the delegated context menu reads THESE items and
       not the overflow's copy; both carry the same list either way. */
    h += '<template data-pm-items>' + menuItems(acts) + '</template>';
    h += gut(d, o);
    h += '<span class="pmk-id">' +
      (o.idHtml != null ? o.idHtml : esc(K.elide(o.id, o.idKind, idcap(b, o)))) + '</span>';
    if (o.meta && o.meta.length && b >= 3) {
      h += '<span class="vB-rmeta">' + K.metaRun(o.meta, 3, { cap: 2 }) + '</span>';
    }
    if (o.word && b >= 2) h += '<span class="vB-word">' + esc(o.word) + '</span>';
    if (o.tail && (b >= 1 || o.tailAlways)) {
      h += '<span class="pmk-tail pmk-tail--time">' + esc(o.tail) + '</span>';
    }
    h += K.overflow(acts, o.tip || 'Row actions');
    return h + '</div>';
  }

  /* Bucket -> PMK.kv mode. b0/b1 all stacked, b2 inline for token/badge only,
     b3 all inline. PMK.kv owns the 88px floor. */
  function vbkv(k, v, kind, b) {
    kind = kind || 'token';
    if (b <= 1) return K.kv(k, v, kind, 0);
    if (b === 2) return K.kv(k, v, kind, 2);
    return K.kv(k, v, kind === 'prose' ? 'prose' : 'token', 3);
  }

  /* a.disabled rides through to aria-disabled: a capability limit is shown as
     an effective, VISIBLE, disabled control (GitHub_Integration.md:L1275
     forbids hiding it), never as a control that quietly vanishes. */
  function btns(list, b) {
    if (b >= 3) {
      return '<div class="vB-grid">' + list.map(function (a) {
        return a.strong ? sbtn(a, a.label)
          : K.btn(a.label, { primary: a.primary, danger: a.danger, tip: a.tip,
                             disabled: a.disabled });
      }).join('') + '</div>';
    }
    var per = b === 0 ? 2 : 3, out = '', i;
    for (i = 0; i < list.length; i += per) {
      out += '<div class="vB-btns">' + list.slice(i, i + per).map(function (a) {
        var lbl = b >= 2 ? a.label : (a.short || a.label);
        return a.strong ? sbtn(a, lbl)
          : K.btn(lbl, { primary: a.primary, danger: a.danger, tip: a.tip,
                         disabled: a.disabled });
      }).join('') + '</div>';
    }
    return out;
  }

  /* Region-level allowed actions: the same button chunking as the sheet, in
     the list's text band. Used where a gate blocks a whole region and there is
     no row to hang a sheet off. `key` names the object the region is about, so
     a strong action fired from here resolves the same scope a row would. */
  function gacts(list, b, key) {
    if (!list || !list.length) return '';
    return '<div class="vB-acts"' + (key ? ' data-vb-key="' + esc(key) + '"' : '') +
      '>' + btns(list, b) + '</div>';
  }

  /* The one sheet. Pin leads the overflow — see RISK 1 in the header.

     MOTION. The sheet is this version's signature interaction and it is the
     one the shared layer has a primitive for: PMM.sheet / .pmm-sheet. The
     in-flow variant is deliberate, not a fallback — the sheet PUSHES the rows
     below it, which is the whole claim ("~20 items OR one item's detail"), so
     the wrapper animates grid-template-rows 0fr -> 1fr while .pmm-sheet-in
     slides its body in a beat behind the box. An overlay would be cheaper and
     would also be a different design.

     Two divs, no styling of their own: .pmm-sheet is the sized box (the
     primitive needs EXACTLY ONE element child) and .pmm-sheet-in carries the
     transform. Both start open and settled, because the sheet is open on
     first paint today and this is a motion change, not a layout one. */
  function sheet(o) {
    var b = o.b;
    var of = [{ value: 'pin', label: 'Pin sheet open', hint: 'keep a 2nd sheet' },
              { type: 'sep' }].concat(o.of || []);
    var h = '<div class="vB-sheet vB-sheet--b' + b + '" data-vb-sheet data-vb-key="' +
      esc(o.key != null ? o.key : o.title) + '">' +
      '<div class="vB-sheet-bar"><span class="vB-sheet-t">' + esc(o.title) + '</span>' +
      K.overflow(of, 'Sheet actions') + '</div><div class="vB-sheet-body">';
    (o.kvs || []).forEach(function (kv) { if (kv) h += vbkv(kv[0], kv[1], kv[2], b); });
    (o.say || []).forEach(function (s) {
      if (s) h += '<div class="vB-say">' + esc(s) + '</div>';
    });
    if (o.blocked) h += K.blocked(o.blocked, o.blockedTone);
    if (o.prev) h += '<div class="vB-prev">' + esc(o.prev) + '</div>';
    if (o.acts && o.acts.length) h += btns(o.acts, b);
    return '<div class="pmm-sheet is-open pmm-settled" data-vb-sheetbox>' +
      '<div class="pmm-sheet-in">' + h + '</div></div></div></div>';
  }

  /* Reason code verbatim. Visible, keyboard-reachable, never a native title.

     BLIND SPOT 1, severity half. The fifth argument is the payload's own
     severity. Three of the seven codes in the Actions Blocked Reason Table
     (GitHub_Integration.md:L2091-L2099) are 'warning' rather than 'blocked',
     and until now this line drew both tiers identically -- so a reader could
     not tell "you may not" from "not right now" on a row whose sentence is
     dropped below 380px anyway. The word renders at EVERY bucket, beside the
     code, because that is the half of the pair that always survives. */
  function why(code, sentence, b, err, sev) {
    return '<div class="vB-why' + (err ? ' vB-why--err' : '') + '">' +
      '<span class="vB-code2">' + esc(code) + '</span>' +
      /* The separating space is a real text node, not the margin. margin-left
         puts 6px on screen and NOTHING in the text stream, so a screen reader
         reads "actions_runner_unavailablewarning" as one token -- which is the
         same class of defect as explaining a limit by tooltip only. */
      (sev ? ' <span class="vB-sev">' + esc(sev) + '</span>' : '') +
      (b >= 2 && sentence ? ' <span>' + esc(sentence) + '</span>' : '') + '</div>';
  }

  /* BLIND SPOT 1, allowed-actions half. A blocked payload that names its
     recovery routes and renders none of them is the exact failure GI-017
     exists to prevent: the panel says you are stuck and withholds the way out.
     PMK.blockedActions is the kit's one ordering rule -- labelled actions
     first, then every allowedActionId not already covered -- so the reason
     line, the region buttons and the row overflow cannot disagree about which
     routes exist or what order they come in.

     Rendered as BUTTONS in the text band rather than as overflow items only:
     an approval route that lives one popup down is a route the reader has to
     go looking for, and GitHub_Integration.md:L1275's "effective capability
     state, not a hidden control" cuts both ways -- what you MAY do has to be
     as visible as what you may not. */
  function whyActs(payload, b, key, gate) {
    var acts = K.blockedActions(payload);
    if (!acts.length) return '';
    return gacts(acts.map(function (a) {
      var g = gate ? gate(a.id, a.label) : null;
      return g || { label: a.label, short: a.label, danger: !!DESTRUCTIVE[a.id] };
    }), b, key);
  }

  function grp(label, n) {
    return '<div class="vB-grp"><span>' + esc(label) + '</span>' +
      (n != null ? '<span class="pmk-sec-n">' + esc(n) + '</span>' : '') + '</div>';
  }
  function line(inner) { return '<div class="vB-line">' + inner + '</div>'; }
  function note(text) { return '<div class="vB-note">' + esc(text) + '</div>'; }
  /* .pmm-enter is a class, not a call: the rows animate the moment the list is
     first painted, which is exactly when a list arrives. The shared layer caps
     the stagger at four steps (and basic, the accessibility theme, sets the
     step to 0ms), so a 23-object Source Control list is a single 4px fade-up,
     never a cascade that a reader has to wait out. */
  function list(inner) {
    return K.body('<div class="vB-list pmm-enter">' + inner + '</div>', false);
  }

  function tgl(label, tip, on) {
    return '<button type="button" class="vB-tgl" aria-pressed="' + (on ? 'true' : 'false') +
      '" data-pm-tip="' + esc(tip) + '">' + esc(label) + '</button>';
  }
  function ib(icon, tip) {
    return '<button type="button" class="vB-ib" data-pm-tip="' + esc(tip) + '">' +
      K.icon(icon, 12) + '</button>';
  }
  var PIN = { value: 'pin', label: 'Pin sheet open' };

  /* Window a source line ON THE MATCH, not on column 0 (search.md section 6).
     Leading indentation is dropped, up to 8 chars of left context survive,
     the remainder is filled from the right, and the highlight is guaranteed
     visible because the match is placed before anything is trimmed. */
  function mwin(pre, hit, post, budget) {
    var p = String(pre).replace(/^\s+/, '');
    /* only spend the leading ellipsis when it actually buys a character */
    var cutL = p.length > 9;
    var L = cutL ? p.slice(p.length - 8) : p;
    var used = L.length + String(hit).length + (cutL ? 1 : 0);
    var room = Math.max(0, budget - used);
    var R = String(post).slice(0, room);
    return { l: (cutL ? '…' : '') + L, h: hit,
             r: R + (String(post).length > R.length ? '…' : '') };
  }
  function mline(hit, b) {
    var budget = idcap(b, {}) - (String(hit.line).length + 1);
    var w = mwin(hit.pre, hit.hit, hit.post, budget);
    return '<span class="vB-ln">' + esc(String(hit.line)) + '</span> ' + esc(w.l) +
      '<span class="vB-hit">' + esc(w.h) + '</span>' + esc(w.r);
  }

  /* ================================ SEARCH ===============================
     research/search.md: region 5 is ONE LINE, never a card — the 130px
     Index/Engine/Documents/Last-indexed block belongs to the status bar. The
     whole indexing control surface (enable, engine, docs, last built, 10MB
     large-file threshold, generated-file exclusions, follow-symlinks,
     Rebuild, Re-anchor) therefore collapses into a single sheet on the
     one-line freshness row. Shown open here because it is the claim under
     test; the height cap keeps the results visible underneath.

     BROKE-7. The freshness row used to build its identity as a literal
     ('Indexed - ' + builtAt) and its mark as state === 'ok' ? 'ok' : 'stale'.
     That renders the WRONG SENTENCE for five of the six states the fixture
     ships, announces the HEALTHY state as "Stale" to a screen reader, and --
     because row() drops the word slot below 380px -- leaves the wrong
     sentence as the only text in the region at the panel's minimum width.
     Every word in that row now comes out of index.states.

     IX_ALIAS is the one thing states cannot carry: the live token is 'ok',
     the SHARED vocabulary's healthy word, and the search vocabulary spells
     the same state 'indexed' (FinalGUISpec.md:L699). Resolved once, here, so
     no code below ever matches a literal again. vC's failure was the mirror
     image -- it read the stale inline comment instead of the states array and
     raised a false alarm on exactly this value.

     IX_MARK picks the rendering CHANNEL (glyph shape, rail dash, tone,
     accessible label) per state. It is total over the six ids rather than a
     match on one, and it carries no copy. unindexed and disabled share the
     'disabled' mark because both mean there is no index in play; the identity
     line tells them apart at every width, 240px included. */
  var IX_ALIAS = { ok: 'indexed' };
  var IX_MARK = { indexed: 'ok', stale: 'stale', unindexed: 'disabled',
                  fallback: 'attention', disabled: 'disabled',
                  cancelled: 'cancelled' };

  function pSearch(D, st) {
    var b = D.bucket(st.width), S = D.search, ix = S.index;
    var rem = S.remote, lb = ix.lastBuild;
    var h = '';

    /* ------------------------------------------------------ BLIND SPOT 15
       Two facts the fixture states outright and no version reads.

       1. REMOTE ACCELERATION IS DOWN. search.remote carries available:false,
          silentFallback:false, a reason code and the finished sentence.
          GitHub_Integration.md:L1600 and :L1630-L1631 make no-silent-local-
          fallback mandatory -- remote acceleration is not a fallback path, so
          when it is unavailable the panel must SAY SO rather than quietly
          answering from the local index and returning something plausible.
          The boolean alone does not satisfy that; the sentence does, and it is
          rendered verbatim below the results header where the answer it
          qualifies is.

          It also settles Evict remote cache, which every redesign offered
          against a service the fixture says is down. Offering it is not a
          confirmation problem, it is an ENABLEMENT problem: the control is
          visible and disabled, citing remote.reason and remote.sentence, in
          all three places this panel exposed it. A confirm is still registered
          for the day availability flips, and a disabled item never reaches it.

       2. THE LAST INDEX BUILD WAS CANCELLED. index.lastBuild is a distinct
          terminal state with its own copy, detail, age and recovery action --
          turning indexing off mid-build cancels through a CancellationToken,
          discards the partial generation, and a re-enable starts fresh
          (FinalGUISpec.md:L699). The live state is still 'ok', so the freshness
          row is unchanged and correct; the cancelled build belongs to the
          index sheet, which is where the whole indexing surface already lives.

       The evict gate is registered under the PANEL key because the item sits
       in the header overflow, which has no row and therefore no object -- see
       scopeKeyOf. */
    var evict = strong('search', {
      value: 'evict', label: 'Evict remote cache', ok: 'Evict',
      disabled: !rem.available, reason: rem.reason, sentence: rem.sentence,
      scope: rem.host + ', checked ' + rem.checkedAt + ' ago',
      consequence: 'the cached remote index for that host is deleted and has to ' +
                   'be rebuilt by the remote service before it accelerates again'
    });

    h += K.head('Search', S.summary.matches + ' in ' + S.summary.files + ' files',
      K.overflow([
        strong('search', {
          value: 'replace', label: 'Replace in files', ok: 'Replace all',
          scope: S.summary.matches + ' shown of ' + S.paging.total +
                 ' matches in ' + S.summary.files + ' files, scope ' + S.scope,
          consequence: S.summary.files + ' files are rewritten on disk, replacing ' +
                       S.query + ' with ' +
                       (S.replace ? S.replace : 'an empty replacement string')
        }),
        { value: 'scope', label: 'Set scope' },
        { type: 'sep' },
        { value: 'expand', label: 'Expand all' },
        { value: 'collapse', label: 'Collapse all' },
        { type: 'sep' },
        { value: 'rebuild', label: 'Rebuild index' },
        { value: 'reanchor', label: 'Re-anchor index' },
        evict
      ], 'Search options'));

    h += '<div class="pmk-strip"><input class="pmk-field" type="text" value="' +
      esc(S.query) + '" aria-label="Search query"></div>';

    h += '<div class="pmk-strip">' +
      tgl('.*', 'Regular expression', S.flags.regex) +
      tgl('Aa', 'Case sensitive', S.flags.caseSensitive) +
      tgl('\\b', 'Whole word', S.flags.wholeWord) +
      (b >= 1
        ? K.select(S.scope, S.scopeOptions, { style: 'flex:1 1 auto;min-width:0' })
        : '<span class="pmk-strip-grow"></span>') +
      K.overflow([
        { value: 'scope', label: 'Scope: ' + S.scope },
        { value: 'replace', label: 'Replace in files' }
      ], 'More search controls') + '</div>';

    var body = '';

    /* region 5 — one line, and its sheet is the entire indexing surface.
       An unknown token falls through to itself rather than to a confident
       wrong sentence: the row then says exactly what the data says, no more,
       and annotateRows stays conservative. */
    var ixNow = byId(ix.states, IX_ALIAS[ix.state] || ix.state) ||
                { id: ix.state, line: String(ix.state), annotateRows: true };
    /* The build anchor is shown only while the index is the thing answering
       the query. annotateRows:true means the results are NOT coming from that
       build (unindexed, fallback, indexing-off, cancelled), so naming the
       commit it was built from would re-create the contradiction this fix
       exists to remove. It is never dropped, only relocated: 'Last built' is
       the third row of the sheet below, which is open on first paint. */
    body += row({
      b: b, d: 1, sel: true, status: IX_MARK[ixNow.id] || 'stale',
      id: ixNow.line,
      word: ixNow.annotateRows ? '' : String(ix.builtAt).split(',')[0],
      meta: [ix.engine, ix.documents.toLocaleString() + ' docs'],
      ctx: 'Index actions', key: 'index',
      acts: [PIN, { value: 'rebuild', label: 'Rebuild index' },
             { value: 'reanchor', label: 'Re-anchor index' }, evict]
    });
    body += sheet({
      b: b, title: 'Index', key: 'index',
      kvs: [
        ['State', ixNow.line, 'measure'],
        ['Engine', ix.engine, 'token'],
        ['Documents', ix.documents.toLocaleString(), 'token'],
        ['Last built', ix.builtAt, 'measure'],
        /* the terminal state of the previous build, in the surface that owns
           indexing. Not a variation on the live state above it -- both are
           named, side by side, so 'ok' and 'cancelled' cannot be conflated. */
        ['Last build', lb.line + ', ' + lb.at + ' ago', 'measure'],
        ['Large files', ix.largeFileThresholdMb + ' MB', 'token'],
        ['Generated files', ix.excludeGenerated ? 'excluded' : 'indexed', 'token'],
        ['Follow symlinks', ix.followSymlinks ? 'yes' : 'no', 'token']
      ],
      say: [lb.detail],
      acts: [
        { label: 'Rebuild index', short: 'Rebuild', primary: true },
        { label: 'Re-anchor', short: 'Re-anchor' },
        /* Turning indexing off is the action that PRODUCED the cancelled
           build above, and the fixture's own detail line is the consequence,
           verbatim. This is the cheapest possible proof that the gate reads
           data rather than a template. */
        strong('index', {
          value: 'disable', label: 'Disable indexing', short: 'Disable', ok: 'Disable',
          scope: ix.engine + ', ' + ix.documents.toLocaleString() + ' documents, ' +
                 'built ' + ix.builtAt,
          consequence: 'a build in flight is cancelled and its partial generation ' +
                       'discarded, and re-enabling starts a fresh build rather than ' +
                       'resuming',
          note: 'Last time: ' + lb.detail
        })
      ],
      of: [
        evict,
        { value: 'excl', label: 'Edit generated-file exclusions' },
        { value: 'sym', label: 'Follow symlinks' },
        { value: 'large', label: 'Large-file threshold' }
      ]
    });

    /* No silent local fallback -- the SENTENCE, not the boolean, and above the
       results it qualifies rather than buried in the index sheet. why() drops
       its sentence below 380px by design, and here the sentence IS the
       requirement, so the code and state ride the why line and the sentence
       gets a note of its own that survives 240px. */
    body += why(rem.reason, '', b, false, rem.state);
    body += note(rem.sentence);
    body += whyActs(rem, b, 'remote');

    S.files.forEach(function (f) {
      body += row({
        b: b, d: 1, glyph: 'down', id: f.path, idKind: 'path', word: String(f.count),
        ctx: 'File actions', key: f.path,
        acts: [{ value: 'collapse', label: 'Collapse file' },
               strong(f.path, {
                 value: 'replacefile', label: 'Replace in this file', ok: 'Replace',
                 scope: f.path + ', ' + f.count + ' matches',
                 consequence: 'the file is rewritten on disk, replacing ' + S.query +
                              ' with ' + (S.replace ? S.replace :
                              'an empty replacement string') + ' at all ' + f.count +
                              ' matches'
               }),
               { value: 'copy', label: 'Copy path' }]
      });
      f.hits.forEach(function (hit) {
        body += row({
          b: b, d: 2, idHtml: mline(hit, b), ctx: 'Match actions',
          key: f.path + ':' + hit.line, tip: 'Match actions',
          /* Replace this match is NOT gated: it is one editor undo away, and
             a confirmation on every single-match replace would train the user
             to dismiss the one that matters. */
          acts: [{ value: 'open', label: 'Open match' },
                 { value: 'replaceone', label: 'Replace this match' },
                 { value: 'copyline', label: 'Copy path and line' }]
        });
      });
    });

    h += list(body);
    h += '<div class="pmk-strip vB-foot"><span class="pmk-strip-grow pmk-note">' +
      esc(S.summary.matches + ' in ' + S.summary.files + ' files') + '</span>' +
      ib('back', 'Previous match') + ib('chev', 'Next match') + '</div>';

    return K.panel([h]);
  }

  /* ============================ SOURCE CONTROL ===========================
     The showcase: ~23 objects visible with one sheet open. GI-004's five
     views render verbatim; Worktrees is promoted by the pinned-section
     mechanism GI-004 permits, not by hard-reordering. GI-005 forbids a flat
     single-repo branch select, so the switcher is PMK.select over the real
     multi-context branch list and the W-018 strip keeps "+N parallel
     contexts", which is never dropped. The worktree sheet carries Path,
     Owner, Run, Base and the W-019 blocked reason as a VISIBLE line with
     allowed_action_ids as real buttons — never a native title. */
  function pSource(D, st) {
    var b = D.bucket(st.width), S = D.source, P = D.project;
    var repo = S.repo;
    var h = '';

    h += K.head('Source Control', S.counts.staged + S.counts.unstaged + ' changed',
      K.overflow([
        { value: 'review', label: 'Open Review Mode' },
        { value: 'newwt', label: '+ New Worktree' },
        { type: 'sep' },
        { value: 'sync', label: 'Sync (pull / push / fetch)' },
        { value: 'stash', label: 'Stash actions' },
        { value: 'ghmirror', label: 'GitHub Actions mirror' },
        { type: 'sep' },
        { value: 'cmptarget', label: 'Set compare target' },
        { value: 'hidestale', label: 'Hide stale worktrees' },
        /* BLIND SPOT 2, the actionable half. GI-005's negative constraint
           (GitHub_Integration.md:L397) is that the model "never assumes a
           single repo context", and this workspace resolves three. Naming the
           siblings turns the repo line from a label into a switcher, and the
           remote is the one identity string too long for any width. */
        { type: 'head', label: 'Repository' },
        { value: 'repo', label: repo.nameWithOwner,
          hint: repo.visibility + ' - ' + repo.host },
        { value: 'remote', label: 'Copy remote', hint: repo.remote }
      ].concat((repo.siblings || []).map(function (s) {
        return { value: 'switch', label: s };
      })), 'Source Control actions'));

    h += '<div class="pmk-strip">' +
      K.select(P.branch, S.branches.map(function (n) { return { value: n, label: n }; }),
        { style: 'flex:1 1 auto;min-width:0' }) +
      '<span class="pmk-tail">+' + P.ahead + ' -' + P.behind + '</span>' + '</div>';

    /* ------------------------------------------------------- BLIND SPOT 2
       REPO IDENTITY, which ten of ten Source designs render nowhere. A header
       that shows only a branch is showing exactly the shape GI-005 forbids:
       it implies the branch identifies the repository, and here it does not --
       source.repo is jared-dev/tastebook while actions.repository is
       jared-dev/tastebook-unraid-templates and two more siblings are
       resolvable in the same workspace.

       Order is drop order, because .pmk-meta sheds segments right to left:
       nameWithOwner first because it is the identity, then the sibling count
       because it is the GI-005 point, then visibility, lifecycle and host.
       maxPx is mandatory -- pGit learned that the hard way -- because metaRun
       otherwise drops by COUNT and a 19-character identity busts the 240px
       band on its own. 0.88 is the basic-* correction: metaRun budgets at
       6.2px per character and basic renders at about 6.6. */
    h += line(K.metaRun([repo.nameWithOwner, '+' + repo.siblingCount + ' repos',
      repo.visibility, repo.lifecycle, repo.host], b,
      { maxPx: Math.max(56, (st.width - 46) * 0.88) }));

    /* W-018 shared projection, degraded to primary context + N */
    h += line(K.metaRun([P.branch, S.remote.health,
      '+' + (S.counts.worktrees - 1) + ' parallel contexts',
      S.counts.staged + S.counts.unstaged + ' dirty'], b));

    var body = '';

    /* ---- Changes ----
       BLIND SPOT 20. Discard is the canonical `strong` action -- it discards
       local state, which is the first clause of GitHub_Integration.md:L156 --
       and it shipped as a red menu line. The scope is the file and which group
       it is in; the consequence is the churn the fixture already counts on
       every row, so the user is told how much work is about to go, per file,
       before it goes. */
    function discardOf(f, group) {
      return strong(f.path, {
        value: 'discard', label: 'Discard changes', ok: 'Discard',
        scope: f.path + ', ' + group + ', status ' + f.code +
               (f.from ? ', renamed from ' + f.from : ''),
        consequence: f.add + ' added and ' + f.del + ' deleted lines in that file ' +
                     'are discarded and are not recoverable from Git'
      });
    }

    body += K.section('Changes', S.counts.staged + S.counts.unstaged, true);
    body += grp('Staged', S.counts.staged);
    S.staged.forEach(function (f) {
      body += row({
        b: b, d: 2, glyph: null, ctx: 'File actions', key: f.path,
        idHtml: '<span class="vB-code">' + esc(f.code) + '</span> ' +
          esc(K.elide(f.path, 'path', idcap(b, { lead: 16 }))),
        acts: [{ value: 'unstage', label: 'Unstage' },
               { value: 'diff', label: 'Open diff' },
               discardOf(f, 'staged')]
      });
    });
    body += grp('Unstaged', S.counts.unstaged);
    S.unstaged.forEach(function (f) {
      body += row({
        b: b, d: 2, glyph: null, ctx: 'File actions', key: f.path,
        idHtml: '<span class="vB-code">' + esc(f.code) + '</span> ' +
          esc(K.elide(f.path, 'path', idcap(b, { lead: 16 }))),
        acts: [{ value: 'stage', label: 'Stage' },
               { value: 'diff', label: 'Open diff' },
               discardOf(f, 'unstaged')]
      });
    });

    /* ---- Worktrees (pinned above History) ----
       REGRESSION VS v0, section 4 row 5. v0, vA, vC, xS1 and xS2 carry a
       worktree filter bar (All / Threads / Orchestrator / Manual); vB, vD, vE,
       vF and xS3 dropped it. With twelve worktrees across three kinds that is
       not a convenience -- it is the only way to answer "show me just my
       threads" without reading every row.

       It is a PMK.select rather than a chip strip because four labelled tabs
       plus counts do not fit a 224px band, and this file's own rule is that a
       strip which cannot hold its items collapses to a portaled picker. The
       counts are counted off S.worktrees rather than written down, so the bar
       cannot disagree with the list beneath it. */
    var wtKind = { orch: 0, thread: 0, manual: 0 };
    S.worktrees.forEach(function (w) {
      if (wtKind[w.kind] != null) wtKind[w.kind]++;
    });
    body += K.section('Worktrees', S.counts.worktrees, true);
    body += line(K.select('all', [
      { value: 'all',    label: 'All  ' + S.worktrees.length },
      { value: 'thread', label: 'Threads  ' + wtKind.thread },
      { value: 'orch',   label: 'Orchestrator  ' + wtKind.orch },
      { value: 'manual', label: 'Manual  ' + wtKind.manual }
    ], { style: 'flex:1 1 auto;min-width:0' }));
    S.worktrees.forEach(function (w, i) {
      var locked = !!w.lockReason;
      var orch = w.kind === 'orch';
      /* BROKE-3. The word slot carried PMK.statusOf(status).word, which prints
         the SHARED status token where the reserved lifecycle word belongs:
         released rendered as 'disabled', reserved as 'queued', orphaned as
         'attention', blocked_preserved as 'blocked'. 'released' is the worst
         of the four -- that worktree was released after a clean merge into
         main and is retained for lineage, and the row said it was
         unavailable. WorktreeGitImprovement.md:L297 reserves those five words
         because each carries both a Git-native and a Puppet-Master-specific
         meaning, and PM_DATA.status cannot express them -- which is exactly
         why the fixture carries lifecycle as its own field.
         The status has not been dropped: it still owns the gutter mark's
         glyph, rail, tone and accessible label, and the sheet names it. The
         word slot is the lifecycle's.
         KIT LIMIT, reported rather than faked: PMK.statusMark takes no label
         override, so the mark on the released row still ANNOUNCES
         "Unavailable" to a screen reader. Nothing in this file can change
         that. */
      /* BLIND SPOT 20, clause two of GitHub_Integration.md:L156 by name:
         "removes worktrees". The scope is the checkout and the W-014 identity
         triple the fixture carries per row; the consequence is the churn that
         goes with it. Where the lifecycle supplies its own sentence -- the
         preserved, orphaned, released and reserved rows all do -- it is
         appended VERBATIM, because that sentence is the fixture's own
         statement of what removing this particular worktree costs, and
         paraphrasing it would be the exact failure BROKE-3 was. */
      var removeWt = strong(w.branch, {
        value: 'remove', label: 'Remove', ok: 'Remove worktree',
        disabled: locked, reason: w.lockReason || '',
        sentence: locked ? 'Owned by ' + w.lockedBy + '.' : '',
        scope: w.branch + ' at ' + (w.path || 'no checkout on disk') +
               ', ' + w.worktreeId + ', lifecycle ' + w.lifecycle,
        consequence: 'the checkout is removed with ' + w.ahead + ' commits ahead of ' +
                     w.base + (w.dirty ? ' and uncommitted changes' : ' and no dirty files'),
        note: w.preservedSentence || w.orphanSentence || w.releasedSentence ||
              w.reservedSentence || ''
      });
      body += row({
        b: b, d: 1, status: w.status, id: w.branch, idKind: 'path',
        word: w.lifecycle, key: w.branch,
        meta: [w.kind, w.run || w.base],
        sel: i === 0, ctx: 'Worktree actions',
        acts: [PIN,
               { value: 'open', label: orch ? 'Open Lane' : 'Open Thread' },
               { value: 'files', label: 'Open Files' },
               { value: 'compare', label: 'Compare' },
               { value: 'merge', label: 'Merge' },
               { value: 'pr', label: 'Create PR' },
               { value: 'lineage', label: 'Focus lineage' },
               { type: 'sep' },
               removeWt]
      });
      if (i === 0) {
        body += sheet({
          b: b, title: w.branch, key: w.branch,
          kvs: [
            /* Both, side by side and never conflated: the reserved lifecycle
               word, then the shared status the mark is drawing. */
            ['Lifecycle', w.lifecycle, 'measure'],
            ['Status', K.statusOf(w.status).label, 'measure'],
            ['Path', w.path, 'measure'],
            ['Owner', w.owner, 'measure'],
            ['Run', w.run || '—', 'token'],
            ['Base', w.base, 'token'],
            /* REGRESSION VS v0, section 4 row 6: Path / Base / AGE. v0 printed
               'age 2h' while the fixture had no age field, so v0 was
               fabricating it and nine of ten versions correctly declined to
               render it. The fixture carries age now, so declining is a choice
               rather than a principle -- and this row completes the triple. */
            ['Age', w.age, 'token'],
            ['Ahead', String(w.ahead), 'token'],
            ['Dirty', w.dirty ? 'yes' : 'no', 'token']
          ],
          blocked: locked ? {
            code: w.lockReason,
            sentence: 'Owned by ' + w.lockedBy + '.',
            actions: [{ label: 'Open Lane' }, { label: 'Focus lineage' },
                      { label: 'Request prune' }]
          } : null,
          acts: [
            { label: 'Compare', short: 'Compare', primary: true },
            { label: 'Open Files', short: 'Files' },
            { label: 'Create PR', short: 'PR' }
          ],
          of: [
            { value: 'lane', label: 'Open Lane' },
            { value: 'merge', label: 'Merge' },
            { value: 'lineage', label: 'Focus lineage' },
            { value: 'reuse', label: 'Reuse' },
            { type: 'sep' },
            removeWt
          ]
        });
      }
    });

    /* ---- History ---- */
    body += K.section('History', S.counts.commits, true);
    S.history.forEach(function (c) {
      body += row({
        b: b, d: 1, glyph: 'branch', tail: c.when, word: c.who,
        id: c.sha + ' ' + c.subject, ctx: 'Commit actions',
        acts: [{ value: 'opendiff', label: 'Open diff' },
               { value: 'review', label: 'Open Review Mode' },
               { value: 'copysha', label: 'Copy SHA' }]
      });
    });

    /* ---- Graph: collapsed, and never the only route to the data ---- */
    body += K.section('Graph', S.counts.commits, false);

    /* ---- Branches / Stash ---- */
    body += K.section('Branches / Stash', S.counts.branches + S.counts.stash, true);
    S.branchList.forEach(function (br) {
      body += row({
        b: b, d: 1, glyph: 'branch', id: br.name, idKind: 'path',
        word: br.current ? 'current' : '', meta: ['+' + br.ahead, '-' + br.behind],
        ctx: 'Branch actions',
        acts: [{ value: 'checkout', label: 'Checkout' },
               { value: 'compare', label: 'Compare' },
               { value: 'newwt', label: '+ New Worktree' }]
      });
    });
    S.stash.forEach(function (s, si) {
      body += row({
        b: b, d: 2, glyph: null, id: s.label, tail: s.when, ctx: 'Stash actions',
        key: s.label,
        acts: [{ value: 'apply', label: 'Apply stash' },
               { value: 'pop', label: 'Pop stash' },
               /* Drop discards local state with no Git object left behind, so
                  it is `strong` for the same reason Discard is. The scope
                  names the entry and its index because 'stash@{1}' is what the
                  underlying command takes and the label is what the reader
                  recognises. */
               strong(s.label, {
                 value: 'drop', label: 'Drop stash', ok: 'Drop',
                 scope: 'stash@{' + si + '} - ' + s.label + ', stashed ' + s.when + ' ago',
                 consequence: 'that entry is deleted and ' + (S.counts.stash - 1) +
                              ' of ' + S.counts.stash + ' stash entries remain'
               })]
      });
    });

    h += list(body);

    /* pinned composer, outside the list's scroller so files scroll under it */
    h += '<div class="pmk-strip vB-foot">' +
      '<input class="pmk-field" type="text" placeholder="Commit message" ' +
      'aria-label="Commit message"></div>';

    return K.panel([h]);
  }

  /* =========================== GITHUB ACTIONS ============================
     GI-008: Current Branch / Workflows / Settings are stable subviews, not
     three stacked cards. GI-017's blocked banner is a strip and is never
     suppressed for space. GI-015 failure triage is the sheet on the failing
     run. Per-run blocked codes get a vB-why line so no reason ever hides
     inside an unopened sheet.

     BROKE-6. The live repository is ARCHIVED and every mutating control in
     this panel was enabled over it -- 52 rerun controls, none disabled.
     GI-021 / GitHub_Integration.md:L1271-L1275: archived, deleted and
     historical-only disable mutation DETERMINISTICALLY, and the limit shows
     as effective capability state, NOT as a hidden control. So the capability
     is stated in prose (the shape v0 gets right and all six redesigns
     dropped), the two repository-level mutations get VISIBLE disabled buttons
     under that prose, and every mutating item anywhere else in the panel --
     rerun, rerun failed, cancel, pin/unpin, request review, dispatch, manage
     secrets -- stays visible and disabled carrying the repository's own
     lifecycle word as its reason code plus the canonical capability sentence.
     Read-only verbs (open run, view logs, compare, open diff, open
     environment, open in browser, the filters and the lens strip) are
     untouched: GI-021 freezes mutation and leaves the repo READABLE, and
     disabling a reading verb would be the same defect pointed the other way. */
  function pGit(D, st) {
    var b = D.bucket(st.width), A = D.actions, C = A.connection, R = A.readiness;
    var repo = A.repository, cap = repo.capabilities || {};
    var h = '';

    /* ------------------------------------------------------------ THE GATE
       DERIVED, never matched against a literal. GI-021 ships seven lifecycle
       states in repository.lifecycleStates and exactly ONE of them -- active --
       leaves mutation alone; archived, deleted, historical_only, transferred,
       renamed_redirected and remote_mismatch are every one of them a limit. So
       the test is "is this repo in the one live state", not "is it archived",
       and repository.mutationDisabled -- the fixture's own gate flag -- is
       honoured first. Set repository.lifecycle to any other member of
       lifecycleStates and every control below re-gates itself with no second
       edit in this file.

       capabilities is a CLOSED, PER-CAPABILITY map, so it outranks the umbrella
       in BOTH directions: an explicit false denies even on a live repo, and an
       explicit true grants even on a frozen one -- which is how the fixture's
       second canonical shape (capabilitySentenceAlt: can dispatch, cannot
       manage secrets) renders correctly here with no second branch and no
       second sentence.

       A verb the closed map does not NAME is not asserted either way, so it
       follows the repo gate rather than defaulting to allowed. That default is
       the whole fix: pin, request_review and the secret verbs are mutations the
       map never mentions, and leaving unnamed verbs open is exactly how this
       panel ended up gating four controls while offering the rest live. */
    var LIVE_LIFECYCLE = { active: true };
    var frozen = repo.mutationDisabled === true ||
                 (repo.lifecycle != null && LIVE_LIFECYCLE[repo.lifecycle] !== true);

    function can(verb) {
      if (cap[verb] === true) return true;
      if (cap[verb] === false) return false;
      return !frozen;
    }

    /* Visible and disabled, never hidden, and never explained by a tooltip
       alone: reason/sentence are what PMK.overflow and PMK.select render as a
       real reason LINE in the popup body, beneath the item and measurably on
       screen. tip is the supplementary hover string only, and it is
       data-pm-tip -- the kit's own tooltip -- never a native title. */
    function gate(item, verb) {
      if (can(verb)) return item;
      item.disabled = true;
      item.primary = false;
      /* The reason names whichever thing ACTUALLY bit. A frozen repo answers
         with GI-021's own vocabulary, the lifecycle word. A LIVE repo whose
         closed capability map denies this one verb answers with the capability
         id, because printing 'active' beside a greyed control would name the
         state that is precisely not the limit -- which is the shape the
         fixture's second sentence (can dispatch, cannot manage secrets)
         exists to test. */
      item.reason = frozen ? repo.lifecycle : verb;
      item.sentence = repo.capabilitySentence;
      item.tip = item.reason + ' - ' + repo.capabilitySentence;
      return item;
    }

    /* A button carries no reason line of its own, so wherever a gated control
       lands in an action GRID rather than a popup the sheet states the reason
       once, above the grid, with the kit's own blocked component: lifecycle
       token verbatim, capability sentence verbatim. Without it the greyed
       Rerun buttons explained themselves on hover only, which is the
       tooltip-only failure GI-017 and GAAAF-005 both name. */
    var gateSay = can('rerun') ? null
      : { code: frozen ? repo.lifecycle : 'rerun', sentence: repo.capabilitySentence };

    /* allowed_action_ids are COMMAND IDS, and which of them the LIFECYCLE owns
       is a per-id fact, not a substring. Mapped by exact id for the same reason
       DESTRUCTIVE above is: guessing from a prefix is how a version ends up
       disabling 'Open runners'. Account recovery -- connect_account, reconnect,
       reauthenticate -- is deliberately NOT gated: an archived repository does
       not make the user's token less refreshable, and disabling the recovery
       route would strand them on a panel that is otherwise readable. */
    var ACTION_VERB = { 'github.request_review': 'request_review',
                        'github.dispatch_workflow': 'dispatch' };

    function allowedItems(bl) {
      if (!bl || !bl.allowedActionIds || !bl.allowedActionIds.length) return [];
      var given = {};
      (bl.actions || []).forEach(function (a) { if (a && a.id) given[a.id] = a; });
      return actItems(bl.allowedActionIds, given).map(function (it) {
        return ACTION_VERB[it.value] ? gate(it, ACTION_VERB[it.value]) : it;
      });
    }

    /* The Actions Blocked Reason Table is keyed by `code`, not by `id`, so byId
       cannot read it. One row of it is used below as the CONSEQUENCE of
       disconnecting -- the spec's own copy for the state that action produces,
       rather than a sentence written here to describe it. */
    function blockedRow(code) {
      var found = null;
      (A.blockedTable || []).forEach(function (r) { if (r && r.code === code) found = r; });
      return found;
    }
    var AUTH_GONE = blockedRow('actions_auth_missing');

    h += K.head('GitHub Actions', C.effective,
      K.overflow([
        { value: 'refresh', label: 'Refresh runs' },
        { value: 'browser', label: 'Open in browser' },
        { type: 'sep' },
        /* The two repo-level mutations GI-021 names. They had no control at
           all before, which is its own way of hiding them: a capability the
           panel never mentions cannot be shown as limited. The hints name the
           surface each one stands for -- the eight workflows that Dispatch runs
           and the nine secrets that add/edit/delete operate on -- so the single
           menu entry is visibly the whole mutation surface, not one verb of it. */
        gate({ value: 'dispatch', label: actLabel('dispatch'),
               hint: A.workflows.length + ' workflows' }, 'dispatch'),
        gate({ value: 'secrets', label: actLabel('manage_secrets'),
               hint: A.secrets.length + ' secrets' }, 'manage_secrets'),
        { type: 'sep' },
        { value: 'connect', label: 'Reconnect account' },
        /* BLIND SPOT 20, "revokes accepted state" -- the third clause of
           GitHub_Integration.md:L156, literally. The consequence is not
           invented: it is the Blocked Reason Table's OWN code and message for
           the state the panel lands in once the account is gone, quoted from
           actions.blockedTable, so the confirmation reads back the exact
           sentence the panel will be showing a second later. */
        strong('git', {
          value: 'disconnect', label: 'Disconnect', ok: 'Disconnect',
          scope: 'account ' + C.account + ', ' + C.state + ', scopes ' +
                 C.scopes.join(' '),
          consequence: 'the panel returns to ' +
                       (AUTH_GONE ? AUTH_GONE.code + ' - ' + AUTH_GONE.message
                                  : 'an unauthenticated state')
        })
      ], 'Actions options'));

    h += '<div class="pmk-strip">' + K.lenses([
      { id: 'branch', label: 'Current Branch' },
      { id: 'workflows', label: 'Workflows', count: String(A.workflows.length) },
      { id: 'settings', label: 'Settings', count: String(A.secrets.length) }
    ], 'branch', b, 'Actions subviews') + '</div>';

    /* GI-017: visible, verbatim code, ordered allowed_action_ids as buttons.

       BLIND SPOT 1. This used to hand PMK.blocked a hand-built object carrying
       only code, sentence and the ONE labelled action -- which dropped
       C.blocked.severity and dropped github.open_scopes, an allowed route the
       fixture names and the panel then offered nowhere. The payload now goes
       through whole, so the kit reads both fields: the severity word renders,
       and PMK.blockedActions emits the labelled Reconnect first and then
       Open scopes behind it, in the order the payload declares. */
    h += K.blocked(C.blocked);

    /* GI-021, stated rather than implied: which repository, what lifecycle it
       is in, and what that leaves the user able to do. Two elements, both
       verbatim from actions.repository -- the identity line, then the
       canonical capability sentence, which is the one thing a disabled
       control cannot say for itself. Naming the repository is not decoration:
       project.name is a DIFFERENT repo whose lifecycle is 'active', so a bare
       "archived" would leave the user guessing which of the two it means.
       The lifecycle word leads because .pmk-meta drops segments right to
       left; it therefore survives at 240px while the 36-character name falls
       to the +N escape. maxPx is mandatory here and its absence was a real
       R1: without a pixel budget metaRun drops by COUNT only, and one 36-char
       segment busted the band by 74px at 240px in all eight themes. The 0.88
       is the basic-* correction -- metaRun budgets at 6.2px/char and basic
       renders at ~6.6. */
    h += line(K.metaRun(
      [repo.lifecycle, K.elide(repo.nameWithOwner, 'path', [20, 20, 26, 40][b])],
      b, { maxPx: Math.max(56, (st.width - 46) * 0.88) }));
    h += note(repo.capabilitySentence);

    /* GitHub_Integration.md:L1275 -- a capability limit shows as EFFECTIVE
       CAPABILITY STATE, not as a hidden control. A control that exists only
       inside an overflow popup is one the reader has to go looking for, so the
       two REPOSITORY-level mutations GI-021 names get a visible, disabled
       button directly under the sentence that explains them. This is what
       gacts() was written for: a gate that blocks a whole REGION and has no row
       to hang a sheet off.

       Per-run verbs are deliberately NOT here. Rerun and Cancel belong to a
       run, every run row carries both, and lifting them to the panel would
       offer a mutation with no object. The labels come from the capability ids
       in repository.capabilities through actLabel, not from copy invented here;
       'Secrets' is the short form the b0/b1 chunking uses, which is the same
       last-segment rule actLabel itself applies. */
    h += gacts([
      gate({ label: actLabel('dispatch') }, 'dispatch'),
      gate({ label: actLabel('manage_secrets'), short: 'Secrets' }, 'manage_secrets')
    ], b);

    h += line(K.metaRun([R.branch, R.green + ' of ' + R.of + ' green',
                         R.snapshot, R.age], b));

    /* Pin state is REPOSITORY state and actions.pinned is where the fixture
       keeps it, so membership -- not a guess -- decides which of the two verbs
       a row offers. Neither verb appears in the closed capability map, so
       can() routes both through the repo gate. The key carries the run AND the
       name because #88 is two different runs in this fixture (Release and
       Deploy to staging) and only one of them is pinned. */
    var PINNED = {};
    (A.pinned || []).forEach(function (p) { PINNED[p.run + ' ' + p.name] = true; });

    var body = '';
    A.runs.forEach(function (r) {
      var isTriage = !!r.triage;
      var isPinned = !!PINNED[r.run + ' ' + r.name];
      var rkey = r.run + ' ' + r.name;
      /* Cancelling a run materially changes live execution, which is the last
         clause of GitHub_Integration.md:L156. It is ALSO capability-gated on
         this archived repository, so gate() wins and the item ships disabled --
         which is the correct precedence and the reason the gate registers
         anyway: flip repository.lifecycle to 'active' and the same control
         becomes enabled and confirmed rather than enabled and bare. */
      var cancelRun = gate(strong(rkey, {
        value: 'cancel', label: 'Cancel run', ok: 'Cancel run',
        scope: r.run + ' ' + r.name + ' on ' + r.branch + ', running ' + r.dur +
               ', started ' + r.age + ' ago',
        consequence: 'the run stops where it is and its remaining jobs do not report'
      }), 'cancel');
      /* Every mutating verb this row offers, gated; every reading verb left
         alone. The reading half is not incidental -- GI-021 disables mutation
         and leaves the repo READABLE, so View logs, Compare and Open in
         browser staying live is the other half of the same requirement. */
      var acts = [PIN,
                  gate({ value: 'rerun', label: 'Rerun' }, 'rerun'),
                  gate({ value: 'rerunfailed', label: 'Rerun failed jobs' }, 'rerun'),
                  cancelRun,
                  gate({ value: isPinned ? 'unpin' : 'pinrun',
                         label: isPinned ? 'Unpin run' : 'Pin run',
                         hint: 'workflow pin' }, 'pin'),
                  { type: 'sep' },
                  { value: 'logs', label: 'View logs' },
                  { value: 'compare', label: 'Compare last success' },
                  { value: 'browser', label: 'Open in browser' }];
      /* GI-017's allowed_action_ids for THIS row's blocked state. They had no
         control anywhere in this panel before, and an approval route that is
         merely absent cannot be shown as limited -- which is how the two
         environment-review runs kept their Request review silently available
         in principle and invisible in fact. Request review is a repository
         mutation and gates; Open environment reads and does not. */
      var allowed = allowedItems(r.blocked);
      if (allowed.length) acts = acts.concat([{ type: 'sep' }], allowed);
      body += row({
        b: b, d: 1, status: r.status, id: rkey, key: rkey,
        tail: r.age, word: K.statusOf(r.status).word,
        meta: [K.elide(r.branch, 'path', 12), r.dur],
        sel: isTriage, ctx: 'Run actions', acts: acts
      });
      if (r.blocked) {
        /* BLIND SPOT 1, both halves, on the rows that carry it. The severity
           word now renders -- #17's runner_unavailable is 'warning' and the
           three environment reviews are 'blocked', and until now those drew
           identically -- and the allowed routes render as BUTTONS in the text
           band rather than living only behind the row's overflow. */
        body += why(r.blocked.code, r.blocked.sentence, b, false,
                    K.severityOf(r.blocked));
        body += whyActs(r.blocked, b, rkey, function (id, label) {
          return ACTION_VERB[id]
            ? gate({ label: label, short: label }, ACTION_VERB[id]) : null;
        });
      }
      if (isTriage) {
        body += sheet({
          b: b, title: r.run + ' failure triage', key: rkey,
          kvs: [
            ['Job', r.triage.job, 'token'],
            ['Step', r.triage.step, 'token'],
            ['Branch', r.branch, 'measure'],
            ['Duration', r.dur, 'token'],
            ['Age', r.age, 'token'],
            /* ------------------------------ REGRESSION VS v0, section 4 row 2
               GitHub_Integration.md:L920 makes the failure triage capsule
               "changed files plus likely next action". v0 renders both by
               hard-coding two strings; all six redesigns dropped both, and
               after the fixture grew changedFiles / changedCount / likelyNext
               they still rendered nothing -- so the audit found no string that
               exists only in changedFiles anywhere in any redesign at any
               width. That is the regression, and this is the whole fix.

               The count leads because it is the one token that survives an
               inline KV at 320px; the paths are elided per PATH so the
               basename -- the only part that identifies a file -- always
               survives, and they sit in a stacked measure KV so the value gets
               the full text band rather than 60% of it. */
            ['Changed', r.triage.changedCount +
              (r.triage.changedCount === 1 ? ' file' : ' files'), 'token'],
            ['Changed files', r.triage.changedFiles.map(function (p) {
              return K.elide(p, 'path', 24);
            }).join(', '), 'measure']
          ],
          /* likelyNext is a SENTENCE, and PMK.kv clamps a stacked value at two
             lines -- clamping the next action is the failure the field exists
             to prevent -- so it goes in the free-wrapping say slot instead. */
          say: [r.triage.likelyNext],
          blocked: gateSay,
          prev: r.triage.lines.join('\n'),
          acts: [
            gate({ label: 'Rerun failed', short: 'Rerun', primary: true }, 'rerun'),
            { label: 'View logs', short: 'Logs' },
            { label: 'Compare', short: 'Compare' }
          ],
          of: [
            { value: 'diff', label: 'Open related diff' },
            { value: 'worktree', label: 'Open related worktree' },
            { value: 'browser', label: 'Open in browser' },
            { type: 'sep' },
            cancelRun,
            gate({ value: isPinned ? 'unpin' : 'pinrun',
                   label: isPinned ? 'Unpin run' : 'Pin run' }, 'pin')
          ]
        });
      }
    });

    h += list(body);
    return K.panel([h]);
  }

  /* ============================ DOCKER MANAGER ===========================
     The spine earns its keep here. Compose project > service > container >
     port is naturally depth 4 and costs zero text width, so a 240px panel
     renders the whole hierarchy at full identity width.

     CRAU-007's subview inventory is 10 entries in the fixture and
     10 x 24px = 240px against a 224px band, so the switcher CANNOT be a chip
     strip at 240px. PMK.lenses collapses to a portaled picker at bucket 0.
     That is arithmetic, not preference. CRAU-009's unsupported subview stays
     VISIBLE with its disabled reason: in the picker as a focusable disabled
     option carrying reason + sentence, and as a vB-why line at every bucket
     so the reason is never tooltip-only. */
  function pDocker(D, st) {
    var b = D.bucket(st.width), G = D.docker, C = G.compose;
    var h = '';

    /* BLIND SPOT 20. Prune is the widest-blast-radius action in the panel and
       it shipped as a one-click red line with no object named at all. The
       scope is counted off the fixture rather than described: how many
       containers are on screen against how many exist, how many of the visible
       ones are not running, and how many images. runtime.host and
       runtime.context are in the scope because CRAU-021 makes local-vs-remote
       a per-surface fact, and pruning the wrong context is exactly the mistake
       a confirmation exists to catch. */
    var idle = 0;
    (G.containers || []).forEach(function (c) { if (c.status !== 'running') idle++; });

    h += K.head('Docker Manager', G.runtime.engine + ' · ' + G.runtime.context,
      K.overflow([
        { value: 'context', label: 'Select context' },
        { value: 'advanced', label: 'Show Advanced' },
        { type: 'sep' },
        { value: 'explain', label: 'Explain this state' },
        { value: 'refresh', label: 'Refresh remote state' },
        { type: 'sep' },
        strong('docker', {
          value: 'prune', label: 'Prune unused', ok: 'Prune',
          scope: 'context ' + G.runtime.context + ' on host ' + G.runtime.host +
                 ', ' + G.paging.containers.total + ' containers and ' +
                 G.paging.images.total + ' images, ' + idle + ' of ' +
                 G.containers.length + ' shown containers are not running',
          consequence: 'every stopped container and every unreferenced image on ' +
                       'that context is removed, and their writable layers go with them'
        })
      ], 'Docker options'));

    h += '<div class="pmk-strip">' +
      K.lenses(G.subviews, 'compose', b, 'Docker subviews') + '</div>';

    var off = null;
    G.subviews.forEach(function (s) { if (s.available === false) off = s; });
    if (off) h += why(off.reason, off.sentence, b);

    h += '<div class="pmk-strip">' +
      K.btn('Compose up', { primary: true, tip: 'Bring the compose project up' }) +
      '<span class="pmk-strip-grow"></span>' +
      '<span class="pmk-note">' + esc(C.file) + '</span></div>';

    var body = '';
    body += row({
      b: b, d: 1, status: 'running', id: C.project, word: 'running',
      key: C.project,
      meta: [String(C.services.length) + ' services', G.runtime.context],
      ctx: 'Compose project actions',
      acts: [{ value: 'up', label: 'Compose up' },
             strong(C.project, {
               value: 'down', label: 'Compose down', ok: 'Compose down',
               scope: C.project + ', ' + C.services.length + ' services, ' + C.file,
               consequence: 'all ' + C.services.length + ' services stop and their ' +
                            'containers are removed from context ' + G.runtime.context
             }),
             { value: 'logs', label: 'Open logs' },
             { value: 'restart', label: 'Restart project' }]
    });

    /* compose services and containers are positional peers in the fixture:
       db/cache/web/worker map 1:1 onto the first four container records. */
    C.services.forEach(function (svc, si) {
      var c = G.containers[si] || null;
      body += row({
        b: b, d: 2, status: svc.status, id: svc.name, key: svc.name,
        word: K.statusOf(svc.status).word, ctx: 'Service actions',
        acts: [{ value: 'upsub', label: 'Up this service' },
               strong(svc.name, {
                 value: 'downsub', label: 'Down this service', ok: 'Take down',
                 scope: svc.name + ' in ' + C.project +
                        (c ? ', container ' + c.name : ''),
                 consequence: 'the service stops and its container is removed; the ' +
                              'other ' + (C.services.length - 1) + ' services keep running'
               }),
               { value: 'logs', label: 'Open logs' }]
      });
      if (!c) return;
      var sel = c.status === 'failed';
      /* Stop and Remove are two different consequences and shipped as one red
         pair. Stop is reversible from the same row; Remove is not, and the
         fixture knows the port it releases and the image it came from. */
      var stopC = strong(c.name, {
        value: 'stop', label: 'Stop', ok: 'Stop',
        scope: c.name + ', up ' + c.age + (c.ports ? ', port ' + c.ports : ''),
        consequence: 'the container stops and ' +
                     (c.ports ? 'port ' + c.ports + ' is released'
                              : 'anything depending on it loses its endpoint') +
                     '; Restart brings it back'
      });
      var rmC = strong(c.name, {
        value: 'rm', label: 'Remove', ok: 'Remove container',
        scope: c.name + ' from ' + C.project + ', image ' + c.image + ', up ' + c.age,
        consequence: 'the container and its writable layer are deleted, and ' +
                     'Compose up recreates it from ' + c.image + ' rather than ' +
                     'restoring it'
      });
      body += row({
        b: b, d: 3, status: c.status, id: c.name, tail: c.age, key: c.name,
        word: K.statusOf(c.status).word, sel: sel, ctx: 'Container actions',
        acts: [PIN,
               { value: 'logs', label: 'Open logs' },
               { value: 'restart', label: 'Restart' },
               { value: 'terminal', label: 'Open in Terminal' },
               { value: 'inspect', label: 'Inspect' },
               { value: 'stats', label: 'Stats' },
               { type: 'sep' },
               stopC, rmC]
      });
      if (sel) {
        body += sheet({
          b: b, title: c.name, key: c.name,
          kvs: [
            ['Image', K.elide(c.image, 'image', 34), 'measure'],
            ['Status', c.detail || K.statusOf(c.status).label, 'token'],
            ['Service', svc.name, 'token'],
            ['Project', C.project, 'token'],
            ['Ports', c.ports ? ':' + c.ports : 'none', 'token'],
            ['Age', c.age, 'token']
          ],
          acts: [
            { label: 'Open logs', short: 'Logs', primary: true },
            { label: 'Restart', short: 'Restart' },
            { label: 'Inspect', short: 'Inspect' }
          ],
          of: [
            { value: 'terminal', label: 'Open in Terminal' },
            { value: 'stats', label: 'Stats' },
            { value: 'url', label: 'Open access URL', disabled: !c.url,
              reason: 'access_url_unresolved',
              sentence: c.url ? '' : 'No direct access URL detected' },
            { type: 'sep' },
            stopC, rmC
          ]
        });
      }
      /* depth 4 — image and published port. Zero text-width cost. */
      body += row({
        b: b, d: 4, glyph: null, id: K.elide(c.image, 'image', idcap(b, {})),
        ctx: 'Image actions', key: c.image,
        acts: [{ value: 'inspectimg', label: 'Inspect image' },
               { value: 'copydigest', label: 'Copy digest' },
               strong(c.image, {
                 value: 'rmi', label: 'Remove image', ok: 'Remove image',
                 scope: c.image + ', in use by ' + c.name,
                 consequence: 'the local image is deleted and the next Compose up ' +
                              'pulls it again from the registry'
               })]
      });
      if (c.ports) {
        body += row({
          b: b, d: 4, glyph: null, id: ':' + c.ports + ' -> ' + c.ports,
          ctx: 'Port actions', key: c.name + ':' + c.ports,
          acts: [{ value: 'openport', label: 'Open in browser' },
                 { value: 'copyport', label: 'Copy port mapping' }]
        });
      }
    });

    h += list(body);
    return K.panel([h]);
  }

  /* ================================ TESTING ==============================
     All five spec regions are present and in spec order, with
     redaction_notice ABOVE artifact_preview because it is a gate, not a
     footnote: run_list, active_run_detail, failure_list, redaction_notice,
     artifact_preview. Enablement is per adapter (capability rows), not one
     global boolean, and blocked / prohibited families keep their reason
     codes on a visible line rather than collapsing into a red chip.
     Failure detail is the sheet.

     BROKE-5. Automated_Testing_System.md:L83-L98 -- "Redaction failures block
     display/persistence until resolved or explicitly authorized." The gate
     exists FOR the failure case, and this panel used to render
     T.redaction.note unconditionally and then render all eleven artifacts.
     Run 209 carries redactionState 'redaction_failed', so that notice was
     ASSERTING a clean redaction over a failed one, above a preview of the two
     artifacts redactionFailed.affectedArtifacts names as unmasked.

     The effective state is the worst state any run is in, ranked by the
     preview disposition the fixture itself declares -- render < placeholder <
     suppress -- rather than by a hand-ordered list of ids, so a fourth state
     ranks itself. suppress means the preview is WITHHELD: not greyed, not
     blurred, not rendered behind a warning. dismissible:false is honoured the
     only way it can be, by there being no dismiss control anywhere near it. */
  var PREVIEW_RANK = ['render', 'placeholder', 'suppress'];

  function redactionGate(T) {
    var states = T.redactionStates || [];
    var now = byId(states, T.redaction.state) ||
              { id: T.redaction.state, preview: 'render', dismissible: true,
                line: T.redaction.note };
    (T.runs || []).forEach(function (r) {
      var s = r.redactionState ? byId(states, r.redactionState) : null;
      if (s && PREVIEW_RANK.indexOf(s.preview) > PREVIEW_RANK.indexOf(now.preview)) now = s;
    });
    return now;
  }

  function pTests(D, st) {
    var b = D.bucket(st.width), T = D.tests, A = T.active;
    var gate = redactionGate(T);
    var rfail = (T.redactionFailed && gate.id === T.redactionFailed.state)
      ? T.redactionFailed : null;
    /* The fixture's own cancelled run, used below to state what cancelling
       COSTS. receiptRetained is the fact; asserting receipt retention without
       finding a row that declares it would be inventing a guarantee. */
    var CANCEL_EG = null;
    (T.runs || []).forEach(function (r) {
      if (r.status === 'cancelled') CANCEL_EG = r;
    });
    var h = '';

    h += K.head('Testing', T.runtime.adapter,
      K.overflow([
        { value: 'policy', label: 'Capability policy' },
        { value: 'visibility', label: 'Visibility policy' },
        { type: 'sep' },
        { value: 'redaction', label: 'Inspect redaction profile' },
        { value: 'settings', label: 'Open Settings' }
      ], 'Testing options'));

    h += '<div class="pmk-strip">' +
      K.chip(T.runtime.adapter, 'ok', true) +
      '<span class="pmk-strip-grow pmk-note">' + esc(T.runtime.probe) + '</span>' +
      K.btn('Run', { primary: true, tip: 'Run the configured adapter' }) + '</div>';

    var body = '';

    /* per-adapter capability projection
       REGRESSION VS v0, section 4 row 7: the visibility value chip. v0, vA,
       vC, vD and vF render policy.visibility; vB and vE dropped it. It belongs
       above the capability rows because it is the policy those rows are
       projected THROUGH -- show_when_possible is why a blocked capability is
       still visible and greyed rather than absent, which is the whole shape of
       the section beneath it. Rendered as the value verbatim, in mono, because
       it is a policy token and not a sentence. */
    body += K.section('Capabilities', T.policy.capabilities.length, true);
    body += line(K.chip(T.policy.visibility, null, true));
    T.policy.capabilities.forEach(function (c) {
      body += row({
        b: b, d: 1, status: c.state, id: c.label, word: c.mode,
        meta: [c.state, c.mode], ctx: 'Capability actions',
        acts: [{ value: 'auto', label: 'Auto' }, { value: 'on', label: 'On' },
               { value: 'off', label: 'Off' }, { type: 'sep' },
               { value: 'settings', label: 'Open Settings' }]
      });
      if (c.reason) body += why(c.reason, c.sentence, b, c.state === 'prohibited');
    });

    /* region 1 — run_list
       BLIND SPOT 20, two shapes at once.

       CANCEL materially changes live execution, and tests.runPreconditions
       records the fixture's own view of it: cancel_run "is destructive-adjacent
       and needs a confirm the kit cannot currently express". It can. The
       consequence is not written here either -- receiptRetained on the
       cancelled exemplar row is what says the receipt survives, so the
       sentence is true of this system rather than true in general.

       EXPORT BUNDLE is EGRESS, and egress under a failed redaction is the one
       thing Automated_Testing_System.md:L83-L98 blocks outright: "Redaction
       failures block display/persistence until resolved or explicitly
       authorized." A confirmation is the wrong instrument for that -- the
       correct answer is that the control is visible and DISABLED, citing the
       redaction reason, exactly as the preview beneath it is suppressed. When
       redaction is clean the same control is enabled and confirmed, and the
       confirmation carries the attestation: how many fields were redacted
       before anything leaves the workspace. Every redesign shipped Export
       enabled over a failed redaction. */
    var exportBlocked = gate.preview !== 'render';
    function exportRun(r) {
      return strong('#' + r.id + ' ' + r.name, {
        value: 'export', label: 'Export bundle', ok: 'Export',
        disabled: exportBlocked,
        reason: rfail ? rfail.reason : gate.id,
        sentence: gate.line,
        scope: 'run #' + r.id + ' ' + r.name + ', ' + T.artifacts.length +
               ' artifacts, ' + r.when + ' old',
        consequence: 'a copy of the run and its artifacts leaves the workspace',
        note: 'Redaction attestation: ' + T.redaction.note + '.'
      });
    }
    body += K.section('Runs', T.runs.length, true);
    T.runs.forEach(function (r) {
      var rkey = '#' + r.id + ' ' + r.name;
      body += row({
        b: b, d: 1, status: r.status, id: rkey, key: rkey, tail: r.when,
        word: K.statusOf(r.status).word, meta: [r.status, '#' + r.id],
        ctx: 'Run actions',
        /* NOT selected: exclusivity gives the one sheet to the failure below,
           and active_run_detail is a fixed strip instead. */
        acts: [{ value: 'watch', label: 'Watch run' },
               { value: 'receipt', label: 'Open receipt' },
               exportRun(r),
               { type: 'sep' },
               strong(rkey, {
                 value: 'cancel', label: 'Cancel run', ok: 'Cancel run',
                 scope: rkey + ', ' + K.statusOf(r.status).label.toLowerCase() +
                        (r.status === 'running'
                          ? ', case ' + A.done + ' of ' + A.total + ', ' + A.elapsed
                          : ', ' + r.when + ' old'),
                 consequence: 'the run stops at the current case' +
                              (CANCEL_EG && CANCEL_EG.receiptRetained
                                ? ' and its receipt is retained, so no completed ' +
                                  'results are discarded'
                                : '')
               })]
      });
      /* BLIND SPOT 1 in Tests. Three run rows carry a reason, a sentence and
         allowedActionIds -- #204 blocked on authority, #216 inconclusive, #217
         cancelled -- and this panel rendered none of the three, so a blocked
         run and a passing run differed only by a glyph. The code is verbatim,
         the routes are the row's own, and neither hides in a sheet. */
      if (r.reason || r.sentence) {
        body += why(r.reason || r.specStatus, r.sentence, b,
                    r.status === 'blocked' || r.status === 'prohibited');
        body += whyActs(r, b, rkey);
      }
    });

    /* region 2 — active_run_detail, a fixed counts strip (never the sheet,
       because the sheet is exclusive and failure detail earns it) */
    body += grp('Active run', A.retry);
    body += line(K.metaRun([A.passed + ' / ' + A.failed + ' / ' + A.skipped,
                            A.done + ' of ' + A.total, A.elapsed, A.lane], b));

    /* region 3 — failure_list; the first failure holds the one open sheet */
    body += K.section('Failures', T.failures.length, true);
    T.failures.forEach(function (f, i) {
      body += row({
        b: b, d: 2, status: 'failed', id: f.test, idKind: 'ref', key: f.test,
        word: 'failed', sel: i === 0, ctx: 'Failure actions',
        acts: [PIN,
               { value: 'openfail', label: 'Open failure' },
               { value: 'receipt', label: 'Open receipt' },
               { value: 'copy', label: 'Copy assertion' }]
      });
      if (i === 0) {
        var live = T.runs[0];
        var exportFail = strong(f.test, {
          value: 'export', label: 'Export bundle', short: 'Export', ok: 'Export',
          disabled: exportBlocked,
          reason: rfail ? rfail.reason : gate.id,
          sentence: gate.line,
          scope: f.test + ' from run #' + live.id + ', ' + T.artifacts.length +
                 ' artifacts',
          consequence: 'a copy of the failure and its artifacts leaves the workspace',
          note: 'Redaction attestation: ' + T.redaction.note + '.'
        });
        var cancelFail = strong(f.test, {
          value: 'cancel', label: 'Cancel run', ok: 'Cancel run',
          scope: 'run #' + live.id + ' ' + live.name + ', case ' + A.done +
                 ' of ' + A.total + ', ' + A.elapsed,
          consequence: 'the run stops at the current case and the remaining ' +
                       (A.total - A.done) + ' cases do not report'
        });
        body += sheet({
          b: b, title: f.test, key: f.test,
          kvs: [
            ['Run', '#' + live.id, 'token'],
            ['Adapter', T.runtime.adapter, 'token'],
            ['Lane', A.lane, 'token'],
            ['Retry', A.retry, 'token']
          ],
          prev: f.message,
          acts: [
            { label: 'Open failure', short: 'Open', primary: true },
            { label: 'Open receipt', short: 'Receipt' },
            exportFail
          ],
          of: [
            { value: 'watch', label: 'Watch run' },
            { value: 'artifacts', label: 'Open artifacts' },
            { type: 'sep' },
            cancelFail
          ]
        });
      }
    });

    /* region 5 — redaction_notice, ABOVE the preview, and non-dismissible.
       On failure it is a vB-why line rather than a note: the reason code is
       rendered verbatim, in the error tone, on a line that can never be
       collapsed into a sheet — the same rule blocked run rows already follow.
       The recovery routes are the row's OWN allowedActionIds, in order, and
       the authorize route keeps the destructive marking the fixture gives it
       rather than one inferred from its name. */
    if (rfail) {
      var authOf = {};
      if (rfail.authorize) authOf[rfail.authorize.id] = rfail.authorize;
      body += why(rfail.reason, rfail.sentence, b, true);
      body += note(rfail.detail);
      /* BLIND SPOT 20, the one action in the whole fixture that ASKS for this
         in its own data: redactionFailed.authorize carries destructive:true
         and needsConfirm:true, and it shipped as a bare button. The scope is
         the exact artifacts that would be shown unmasked and the run they
         belong to; the consequence is redactionFailed.detail VERBATIM -- the
         profile that failed to load and what that left unredacted. Nothing in
         this confirmation is written here.

         The other two routes -- retry redaction, open the profile -- are not
         gated. They are the way OUT of the failure, and a confirmation on the
         safe route beside the unsafe one teaches the user that both are the
         same kind of thing. */
      body += gacts(actItems(rfail.allowedActionIds, authOf).map(function (it) {
        if (!(rfail.authorize && it.value === rfail.authorize.id &&
              rfail.authorize.needsConfirm)) return it;
        return strong('redaction', {
          value: it.value, label: it.label, ok: rfail.authorize.label,
          scope: rfail.affectedArtifacts.length + ' artifacts in run ' +
                 rfail.affectedRunId + ' - ' + rfail.affectedArtifacts.join(', ') +
                 ', profile ' + rfail.profileId + ', ' + rfail.failed + ' of ' +
                 rfail.attempted + ' fields unmasked',
          consequence: 'those previews render with secrets visible',
          note: rfail.detail
        });
      }), b, 'redaction');
    } else {
      body += note(gate.line);
    }

    /* region 4 — artifact_preview. Withheld, not decorated: no row, no name,
       no size, no kind. What renders in its place is the blocked REGION's own
       identifier out of redactionFailed.blocks and the state's own line, so
       the reader is told what is missing and why rather than shown a masked
       version of it. The section keeps its true count — eleven artifacts do
       exist; none of them may be previewed. */
    body += K.section('Artifacts', T.artifacts.length, true);
    if (gate.preview === 'render') {
      T.artifacts.forEach(function (a) {
        body += row({
          b: b, d: 2, glyph: null, id: a.name, tail: a.size, word: a.kind,
          ctx: 'Artifact actions', key: a.name,
          acts: [{ value: 'open', label: 'Open artifact' },
                 { value: 'usage', label: 'Show in Usage' },
                 strong(a.name, {
                   value: 'export', label: 'Export bundle', ok: 'Export',
                   scope: a.name + ', ' + a.kind + ', ' + a.size.trim(),
                   consequence: 'a copy of that artifact leaves the workspace',
                   note: 'Redaction attestation: ' + T.redaction.note + '.'
                 })]
        });
      });
    } else {
      body += why((rfail && rfail.blocks && rfail.blocks[0]) || gate.id,
                  gate.line, b, true);
    }

    h += list(body);
    return K.panel([h]);
  }

  /* ================================ AGENTS ===============================
     F3-452: the panel MIRRORS the registry and holds no state of its own, so
     there is no launch control. Group headers are the five lifecycle tokens;
     available is never interleaved with active rows and stays collapsed and
     count-first. The sheet carries status, owning thread, target, outcome
     (where the record has one) and the lineage entrypoints, which come
     verbatim from D.agents.lineageTargets. Blocked rows keep their reason on
     a visible line — the panel must not mint an agents-local authority
     state, so the code renders as-is. */
  function pAgents(D, st) {
    var b = D.bucket(st.width), G = D.agents;
    var running = [], queued = [], blocked = [];
    G.active.forEach(function (a) {
      if (a.status === 'blocked') blocked.push(a);
      else if (a.status === 'queued') queued.push(a);
      else running.push(a);
    });

    var lineageOf = G.lineageTargets.map(function (t, i) {
      return { value: 'lin' + i, label: t };
    });

    var h = '';
    h += K.head('Agents', running.length + ' running · ' + blocked.length + ' blocked',
      K.overflow([
        { value: 'filter', label: 'Filter by state' },
        { value: 'activity', label: 'Open Agent Activity' },
        { type: 'sep' },
        { value: 'config', label: 'Open Agent Config' }
      ], 'Agents options'));

    var body = '';

    /* BLIND SPOT 20. Cancelling an agent materially changes live execution --
       the last clause of GitHub_Integration.md:L156 -- and the panel is a
       MIRROR of the registry (F3-452), so the object it stops is somebody
       else's thread. The scope therefore names the thread and the target as
       well as the agent, because "Cancel run" beside a persona name does not
       tell the reader whose run it is. */
    function cancelAgent(a) {
      return strong(a.name, {
        value: 'cancel', label: 'Cancel run', ok: 'Cancel run',
        scope: a.name + ' - ' + a.persona + ', ' + a.thread +
               (a.run ? ', run ' + a.run : ', no run') +
               (a.elapsed && a.elapsed !== '--' ? ', elapsed ' + a.elapsed : ''),
        consequence: 'the agent stops and ' + a.target + ' is left where it is'
      });
    }

    body += K.section('Running', running.length, true);
    running.forEach(function (a, i) {
      body += row({
        b: b, d: 1, status: a.status, id: a.name, tail: a.elapsed, key: a.name,
        word: K.statusOf(a.status).word, meta: [a.persona, a.run || 'no run'],
        sel: i === 0, ctx: 'Agent actions',
        acts: [PIN].concat(lineageOf).concat([
          { type: 'sep' },
          { value: 'watch', label: 'Watch run' },
          cancelAgent(a)
        ])
      });
      if (i === 0) {
        body += sheet({
          b: b, title: a.name, key: a.name,
          kvs: [
            ['Status', K.statusOf(a.status).label, 'token'],
            ['Persona', a.persona, 'token'],
            ['Thread', a.thread, 'measure'],
            ['Target', a.target, 'measure'],
            ['Run', a.run || '—', 'token'],
            ['Elapsed', a.elapsed, 'token'],
            a.note ? ['Note', a.note, 'measure'] : null
          ],
          acts: [
            { label: 'Open thread', short: 'Thread', primary: true },
            { label: 'Open target', short: 'Target' },
            { label: 'Open lineage', short: 'Lineage' }
          ],
          of: lineageOf.concat([
            { type: 'sep' },
            { value: 'watch', label: 'Watch run' },
            cancelAgent(a)
          ])
        });
      }
    });

    /* BROKE-9. Each blocked row now offers exactly the actions it declares in
       allowedActionIds[], in the order it declares them. The fixed quintuple
       this used to emit was correct for none of the five blocked rows in the
       fixture: it never offered grant_authority, which is the ONLY action
       that can unblock Deploy Sentinel; it offered a minted "Request
       authority" on the remediation-ceiling row and on the self-restoring
       session, where authority is not the issue at all and research/agents.md
       section 6 forbids minting an agents-local authority state; and it
       offered a destructive Abort beside a sentence reading "The session is
       restoring from a checkpoint. No action is needed yet." Schema
       Cartographer now shows one action, open_for_edit, because that is the
       one it allows. No retry affordance appears on the ceiling row, because
       the ceiling row does not list one.
       The word is the row's own spec lifecycle token where it carries one --
       FinalGUISpec.md:L1720-L1728 marks those five contractual and says do not
       paraphrase -- and the shared vocabulary's word otherwise. */
    body += K.section('Blocked', blocked.length, true);
    blocked.forEach(function (a) {
      /* BLIND SPOT 20 on the one action the fixture already marks destructive.
         orchestrator.abort_node ends somebody else's node, and the honest
         consequence is that it does NOT resolve what blocked it -- an aborted
         node that still needs authority still needs authority. The blocked
         sentence is quoted so the reader is not asked to remember it from the
         line above. */
      function gateAbort(id, label) {
        if (id !== 'orchestrator.abort_node') return null;
        return strong(a.name, {
          value: id, label: label, ok: 'Abort node',
          scope: a.name + ' - ' + a.target + ', ' + a.thread +
                 (a.blockedFor ? ', blocked for ' + a.blockedFor : '') +
                 (a.blockedAt ? ' since ' + a.blockedAt : ''),
          consequence: 'the node is aborted and ' + a.reason +
                       ' is not resolved by aborting it',
          note: a.sentence
        });
      }
      body += row({
        b: b, d: 1, status: 'blocked', id: a.name, key: a.name,
        word: a.specStatus || K.statusOf(a.status).word,
        meta: [a.persona, a.run || 'no run'], ctx: 'Agent actions',
        acts: actItems(a.allowedActionIds).map(function (it) {
          return gateAbort(it.value, it.label) || it;
        })
      });
      body += why(a.reason, a.sentence, b);
      /* BLIND SPOT 1. The routes were reachable only from the row's overflow.
         grant_authority is the ONLY thing that unblocks Deploy Sentinel and it
         lived one popup down; approve_node is the only thing that releases the
         migration. Both are now buttons in the text band, in the order the row
         declares them. */
      body += whyActs(a, b, a.name, gateAbort);
    });

    body += K.section('Queued', queued.length, true);
    queued.forEach(function (a) {
      body += row({
        b: b, d: 1, status: 'queued', id: a.name, word: 'queued', key: a.name,
        meta: [a.persona, a.target], ctx: 'Agent actions',
        acts: lineageOf.concat([{ type: 'sep' }, cancelAgent(a)])
      });
    });

    body += K.section('Completed', G.completed.length, true);
    G.completed.forEach(function (a) {
      body += row({
        b: b, d: 1, status: a.status, id: a.name, tail: a.when, key: a.name,
        word: a.outcome, meta: [a.persona, a.outcome], ctx: 'Agent actions',
        acts: lineageOf
      });
    });

    /* available: collapsed, count-first, never interleaved */
    body += K.section('Available', G.available.length, false);

    h += list(body);
    return K.panel([h]);
  }

  /* =============================== ARTIFACTS =============================
     The envelope has NO title field, and the kind token runs to 21 chars
     (before_after_snapshot) which is ~143px = 65% of the 224px band before
     the label gets a pixel. So the kind is NEVER a leading chip below bucket
     2 — it renders as a 12px glyph carrying data-pm-tip with the full
     artifact_type, and the full token lives in the sheet. Relative time is
     in the never-droppable set, so it is the one zone forced on at bucket 0
     against the ladder. Exactly one state marker per row (the status word),
     never a chip stack. Bundle members lead with evidence_role; the kind is
     secondary and only appears at bucket >= 2. */
  var KINDGLYPH = {
    code_diff: 'branch', validation_test: 'check', api_web_call: 'search',
    browser_recording: 'ext', screenshot: 'square', cost_usage: 'bar',
    tool_llm_trace: 'info', restore_point: 'clock'
  };

  function pArtifacts(D, st) {
    var b = D.bucket(st.width), R = D.artifacts, B = R.bundle;
    var h = '';

    /* BLIND SPOT 20, the EGRESS half. Export is not destructive -- nothing is
       lost -- which is exactly why it went ungated in ten of ten designs and
       exactly why it needs a boundary: it is the only action in this panel
       that moves governed material OUT of the workspace, and the reader cannot
       un-export it afterwards. The scope is counted off artifacts.paging and
       artifacts.families rather than described, so a view export says how many
       of the 421 records the current view actually is. */
    var egress = [
      strong('artifacts', {
        value: 'exportrecord', label: 'Export record', ok: 'Export',
        scope: 'the selected record only',
        consequence: 'one runtime-artifact record leaves the workspace with its ' +
                     'envelope intact'
      }),
      strong('artifacts', {
        value: 'exportbundle', label: 'Export bundle', ok: 'Export bundle',
        scope: B.title + ' - ' + B.id + ', ' + B.members.length + ' members',
        consequence: 'all ' + B.members.length + ' member records leave the ' +
                     'workspace as one bundle'
      }),
      strong('artifacts', {
        value: 'exportview', label: 'Export view', ok: 'Export view',
        scope: R.paging.shown + ' rows shown of ' + R.paging.total +
               ' records, family ' + R.families[0].label,
        consequence: 'every one of those ' + R.paging.shown +
                     ' rows leaves the workspace, not just the ones on screen'
      })
    ];

    h += K.head('Artifacts', String(R.families[0].count),
      K.overflow([
        { value: 'usage', label: 'Show in Usage' },
        { value: 'ledger', label: 'Show in Ledger' },
        { type: 'sep' }
      ].concat(egress), 'Artifacts options'));

    h += '<div class="pmk-strip">' + K.lenses(R.families.map(function (f) {
      return { id: f.id, label: f.label, count: String(f.count) };
    }), 'all', b, 'Artifact families') + '</div>';

    var body = '';

    R.rows.forEach(function (a) {
      var when = a.meta[a.meta.length - 1];
      var lead = 16;
      var cap = idcap(b, { tail: when, tailAlways: true, word: a.status,
                           meta: a.meta, lead: lead });
      /* BROKE-1. title is OPTIONAL on the envelope -- the header comment above
         says so, and the fixture carries two rows (tool_llm_trace,
         context_snapshot) that omit it. This line was a.title.indexOf(), which
         threw on row 39 of 47 and took the entire panel down at every width in
         every theme; the one-line repair that followed was a local
         a.title || a.kind ternary, which stops at the kind and therefore
         duplicates a token this row already draws as the leading glyph.
         PMK.artifactLabel is the spec's full chain in one place -- title, then
         summary (which art-3ab77f10 has), then the kind carrying the short id
         (which is all art-9c4471e2 has) -- so RAP:L318's computed identity and
         RAP:L314's never-an-empty-row are one policy, not seven. */
      var label = K.artifactLabel(a);
      var idKind = label.indexOf('/') >= 0 ? 'path' : 'default';
      var sel = a.kind === 'api_web_call';
      /* retention_class is a REQUIRED envelope field that renders in no
         version, in no menu and in no sheet (blind spot 4). It is not fixed
         here in full, but it belongs in an egress scope more than anywhere
         else: what leaves the workspace, and under what retention the original
         is held. freshness and health ride along because RAP:L2042 forbids
         collapsing them into one axis and an export of a `degraded` projection
         is a different thing from an export of a healthy one. */
      var exportRec = strong(a.id, {
        value: 'export', label: 'Export record', ok: 'Export',
        scope: label + ' - ' + a.id + ', ' + a.kind + ', retention ' + a.retention,
        consequence: 'a copy of that record leaves the workspace; it is ' +
                     a.freshness + ' and ' + a.health + ' at the moment of export'
      });
      body += row({
        b: b, d: 1, status: a.status, tail: when, tailAlways: true, key: a.id,
        word: K.statusOf(a.status).word, meta: a.meta.slice(0, 2),
        sel: sel, ctx: 'Artifact actions',
        idHtml: '<span class="vB-kindg" data-pm-tip="' + esc(a.kind) + '">' +
          K.icon(KINDGLYPH[a.kind] || 'info', 12) + '</span>' +
          esc(K.elide(label, idKind, cap)),
        acts: [PIN,
               { value: 'open', label: 'Open artifact' },
               { value: 'usage', label: 'Show in Usage' },
               { value: 'ledger', label: 'Show in Ledger' },
               { type: 'sep' },
               exportRec]
      });
      if (sel) {
        body += sheet({
          b: b, title: a.kind, key: a.id,
          kvs: [
            ['Kind', a.kind, 'measure'],
            ['Family', a.family, 'token'],
            ['State', K.statusOf(a.status).label, 'token'],
            ['Retention', a.retention, 'token'],
            ['Age', when, 'token'],
            ['Command', a.meta[0], 'measure'],
            ['Sources', a.meta[1], 'token']
          ],
          prev: a.provenance || a.preview,
          acts: [
            { label: 'Open', short: 'Open', primary: true },
            { label: 'Show in Usage', short: 'Usage' },
            { label: 'Show in Ledger', short: 'Ledger' }
          ],
          of: [
            { value: 'sources', label: 'Open sources' },
            { value: 'chat', label: 'Open in Chat' },
            { value: 'raw', label: 'Curated / Raw view' },
            { type: 'sep' },
            exportRec
          ]
        });
      }
    });

    /* investigation bundle — an index over canonical records, not a new kind */
    body += row({
      b: b, d: 1, status: 'ok', id: B.title, key: B.id,
      word: B.outcome, meta: [B.id, String(B.members.length) + ' members'],
      ctx: 'Bundle actions',
      acts: [{ value: 'openbundle', label: 'Open investigation record' },
             strong(B.id, {
               value: 'exportbundle', label: 'Export bundle', ok: 'Export bundle',
               scope: B.title + ' - ' + B.id + ', ' + B.members.length +
                      ' members, outcome ' + B.outcome,
               consequence: 'all ' + B.members.length + ' member records leave the ' +
                            'workspace as one bundle, including any the Omitted ' +
                            'items summary lists as withheld'
             }),
             { value: 'omitted', label: 'Omitted items summary' }]
    });
    B.members.forEach(function (m) {
      body += row({
        b: b, d: 2, glyph: null, ctx: 'Member actions',
        key: B.id + '/' + m.role,
        idHtml: '<span class="vB-role">' + esc(m.role) + '</span>' +
          (b >= 2 ? ' <span class="vB-2nd">' + esc(m.kind) + '</span>' : ''),
        acts: [{ value: 'open', label: 'Open artifact' },
               { value: 'usage', label: 'Show in Usage' }]
      });
    });

    h += list(body);
    return K.panel([h]);
  }

  /* ============================================================ sheet wiring
     The harness has no per-version event bus, so this wires its own, once, by
     delegation — the same shape vC and vD already use.

     EXCLUSIVITY IS THE DESIGN, so it is enforced here and not left to the
     markup: opening a sheet closes every other open sheet in the same panel
     first. (Docker and Artifacts can emit more than one owner row, which is
     the case that needs it.) Pinning is in the sheet overflow per RISK 1 and
     is not wired here — this is the motion pass, not the state model.

     PMM.sheet owns the animation. This owns aria-expanded and .is-selected,
     because the accessible state and the row's selected paint are not the
     motion layer's to fake, and both must survive reduced motion, where
     PMM.sheet still toggles .is-open and settles in the same frame.

     A click inside the row's overflow menu is the menu's, never the sheet's. */
  function vbBox(rowEl) {
    var n = rowEl.nextElementSibling;
    return (n && n.hasAttribute('data-vb-sheetbox')) ? n : null;
  }

  function vbSet(rowEl, box, open) {
    rowEl.setAttribute('aria-expanded', open ? 'true' : 'false');
    rowEl.classList.toggle('is-selected', open);
    if (window.PMM) window.PMM.sheet(box, open);
    else box.classList.toggle('is-open', open);
  }

  function vbToggle(rowEl) {
    var box = vbBox(rowEl);
    if (!box) return;
    var open = !box.classList.contains('is-open');
    if (open) {
      var view = rowEl.closest('[data-pm-panelview]') || document;
      var others = view.querySelectorAll('[data-vb-owner]');
      for (var i = 0; i < others.length; i++) {
        var ob = others[i] === rowEl ? null : vbBox(others[i]);
        if (ob && ob.classList.contains('is-open')) vbSet(others[i], ob, false);
      }
    }
    vbSet(rowEl, box, open);
  }

  function vbRow(t) {
    if (!t || !t.closest) return null;
    if (t.closest('[data-pm-menu]') || t.closest('[data-pm-portal]')) return null;
    /* a strong action's button is its own gate's business, never a toggle */
    if (t.closest('[data-vb-strong]')) return null;
    var r = t.closest('[data-vb-owner]');
    if (!r) return null;
    var stage = r.closest('.pm-stage');
    return (stage && stage.getAttribute('data-pm-version') === 'vB') ? r : null;
  }

  function onSheetClick(e) {
    var r = vbRow(e.target);
    if (r) vbToggle(r);
  }

  /* role="button" on a div does not get Enter/Space for free. */
  function onSheetKey(e) {
    if (e.key !== 'Enter' && e.key !== ' ' && e.key !== 'Spacebar') return;
    var r = vbRow(e.target);
    if (!r || r !== e.target) return;
    e.preventDefault();
    vbToggle(r);
  }

  if (!window.__vBGutterSheetBound) {
    window.__vBGutterSheetBound = true;
    document.addEventListener('click', onSheetClick);
    document.addEventListener('keydown', onSheetKey);
    /* BLIND SPOT 20. Capture phase, so the gate runs before the row's own
       click handling and before PM.list's selection -- a strong action must
       not also select, expand or navigate on its way to being confirmed. */
    document.addEventListener('click', onStrongClick, true);
    document.addEventListener('pm:menuaction', onMenuAction);
  }

  /* ================================ register ============================= */
  PM_BAKEOFF.register('vB', {
    name: 'Gutter & Sheet',
    blurb: 'One-line rows, exclusive in-place detail. Depth costs zero width.',
    panels: {
      search: pSearch,
      source: pSource,
      git: pGit,
      docker: pDocker,
      tests: pTests,
      agents: pAgents,
      artifacts: pArtifacts
    }
  });
})();
