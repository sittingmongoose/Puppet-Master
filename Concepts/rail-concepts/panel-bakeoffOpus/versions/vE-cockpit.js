/* PANEL BAKEOFF — vE COCKPIT
   =====================================================================
   THESIS
   ------
   Every panel names exactly ONE current object. That object gets a fixed,
   non-scrolling FOCUS CARD carrying its status, its two-to-six most important
   facts and its primary action. Everything else in the domain collapses to a
   one-line list underneath.

   The narrow-width mechanic is ASYMMETRIC PRIORITIZATION. The other five
   systems try to make every row survive 240px; this one refuses. It makes one
   object rich and every other object minimal. That works because the card is a
   VERTICAL STACK: it has no width problem at all. The only shrinkable thing in
   it is its identity line, and that line owns the whole card width because
   there is no status gutter, no tail cluster and no overflow slot competing
   with it. A list row at 240px has 224 - 21(mark) - 24(overflow) - 16(pad) =
   163px for identity; the card's identity line has 208px. The card is 28%
   roomier than the row it replaces, per line, for free.

   FOCUS OBJECT PER PANEL
   ----------------------
     search     the current query session          (query + flags + scope + count)
     source     the primary active worktree        (W-018 strip made large, +N drill)
     git        current-branch readiness           (GI-011, blocked verbatim)
     docker     the active compose project         (+ the runtime context)
     tests      the active run                     (this IS active_run_detail)
     agents     the owning thread's active delegation, blocked one first
     artifacts  the most recent / selected artifact

   THE WIDTH LADDER  (keyed off PM_DATA.bucket, never a continuum)
   ---------------------------------------------------------------
                     240 (b0)      320 (b1)     380 (b2)          480 (b3)
     card          1 meta seg    2 meta segs   3 meta segs       4 meta segs
                   1 fact        2 facts       2 facts + stats   2x3 KV grid
                   1 button      1 button      2 buttons         2 buttons
     card min-h    96px          112px         132px             132px
     card pad      8px           12px          12px              12px
     list rows     1 line        + tail        + sub on select   + priority cols
                   no tail       (time/size)   (meta, 2nd line)  (fixed columns)

   Card inner padding drops --lg (12px) to --md (8px) at bucket 0 to buy back
   8px of identity width, which is 4-5 characters at 240px.

   min-height, NOT height. A hard height would clip in retro (2px borders) and
   basic (1.6 line-height, widest text of the eight) and fire R1 clipped-
   overflow. min-height gives the no-jump guarantee the empty states need
   without inviting a clip. .vE-acts carries margin-top:auto so the action row
   still pins to the bottom edge of the reserved box.

   THE THREE RISKS, HANDLED
   ------------------------
   1. WHAT IS "THE ONE OBJECT" WHEN THERE ISN'T ONE?
      Five distinct empty-focus components, not one with variable copy, each
      rendered INSIDE a card of the same min-height so the layout never jumps:

        panel      predicate that empties the focus       component
        ---------------------------------------------------------------
        search     no query string                        no-data
        search     query present, 0 matches               no-results
        source     no worktrees / not a git repo          not-configured
        git        GHES remote under github.com_only      not-relevant
        git        no GitHub remote                       not-configured
        docker     runtime not detected                   unavailable
        docker     detected, no compose project           no-data
        tests      adapter not configured                 not-configured
        tests      configured, no run yet                 no-data
        agents     registry mirrored, no delegation       no-data
        artifacts  no artifacts in project                no-data
        artifacts  filter matches nothing                 no-results

      Every one of those is a live guarded branch below, reading the real
      fixture. This fixture set populates all seven focus objects, so none of
      them fire on screen — they are code paths, not screenshots, and saying so
      is more honest than shortening a fixture to manufacture the state.

   2. THE CARD PERMANENTLY COSTS 96-132px OF A ~700px PANEL (14-19%).
      That hurts Docker and Artifacts most, the two longest lists: Docker's
      container list wants 5 x 28px = 140px and Artifacts' wants 8 x 28 = 224px
      plus a 5-member bundle, so the card eats roughly one full screen of rows
      from Artifacts. Mitigation: the card is COLLAPSIBLE from the panel header
      (aria-expanded, 24px target, tooltipped), and collapsed it renders a
      28px rail keeping status + identity + the overflow — 104px returned, four
      more rows. FOCUS_COLLAPSED below is the per-panel switch; it ships false
      everywhere so the bakeoff compares the same thesis on all seven panels.
      The tradeoff is real and is not hidden: on Docker and Artifacts a user
      who is scanning rather than acting will collapse it and never open it
      again, at which point this system degrades into vC/vF with a title bar.

   3. FOCUS FOLLOWS SELECTION, SO THE CARD IS A SECOND SELECTION MODEL.
      Clicking a stopped container must not silently re-point the card away
      from the compose project. So focus mode is EXPLICIT, not implied:
        pinned    the card is locked to its object; list selection highlights
                  a row and changes nothing above it
        follows   list selection re-points the card
      The toggle is a 24px aria-pressed control in the card action row with a
      full sentence in data-pm-tip, and at bucket >= 2 the mode ALSO renders as
      a word ("pinned" / "follows") in the micro-stat strip, so the state is
      never carried by an icon alone. Docker ships pinned — the compose project
      is the object you act on while you read container rows — and every other
      panel ships following. That difference is the whole point of making it
      explicit rather than inferring it.

   THEME RANGE
   -----------
   The focus card is the ONLY bordered container in the panel. Nothing else
   nests a box inside a box, so the 0px-to-2px border swing and the 0px-to-20px
   radius swing land in exactly one place and cost zero cumulative height.
   friendly's 20px radius plus elev-1 reads as an intentional card; retro's 0px
   radius + 2px border + 3px 3px 0 hard shadow reads as a bevelled block; glass
   borderless at 16px reads as a floating pane. PMK.card does all of it.
   PMK.blocked's 3px left rail and the notice rail are deliberately NOT full
   borders, so a blocked banner never reads as a second card.

   MOTION
   ------
   Two primitives from the shared layer, matched to the asymmetry the thesis
   is built on. PMM.flash goes on the CARD - the identity line and every
   micro-stat cell - because the card is the only place a value is large
   enough that its changing under you is worth announcing; a flashing row in a
   scanning list is noise. PMM.enter goes on the LIST, a few px and a fade,
   gated so it fires when the list changed and not when the panel was merely
   re-laid out. Nothing else moves, and the card never animates its size: it
   is the one fixed thing on screen and a card that resizes is a card the eye
   has to re-find. Full rationale, including why the flash fires zero times on
   a static fixture, in the MOTION block below.

   THE CONFIRMATION BOUNDARY
   -------------------------
   Every strong action in this file -- discard, remove worktree, release,
   request prune, compose down, delete container, replace all, replace match,
   evict remote cache, cancel run, cancel delegation, abort node, disconnect,
   authorize unredacted display, and all four egress exports -- routes through
   PM.confirm before anything runs. The sheet states SCOPE, CONSEQUENCE and the
   command id, all read from _pm-data.js; egress adds a redaction or retention
   ATTESTATION. See the gate block below for why that is three clauses and not
   a colour, and for the three carriers a gate rides on. The card's own danger
   buttons carry it too, and the capability check outranks it: an action the
   repository forbids is disabled and never reaches a sheet.

   SLINT MAPPING
   -------------
     PanelRoot := VerticalLayout {
       PanelHeader  { vertical-stretch: 0; }          // pmk-head
       FocusCard    { vertical-stretch: 0;            // vE-dock > pmk-card
                      min-height: root.card-min; }    //   Rectangle + VerticalLayout
       BlockedStrip { vertical-stretch: 0; }          // conditional: if blocked
       ListHead     { vertical-stretch: 0; }          // lenses / composer strip
       ListView     { vertical-stretch: 1; }          // the ONE scroller
     }
   The card is a Rectangle with border-width/border-radius bound to the theme
   singleton and a VerticalLayout inside; the list is a ListView with a
   for-in over a Rust-side model. bucket is an int property computed once in
   Rust from the panel width — every "if (b >= n)" in this file is a Slint
   "if bucket >= n" on that property, so nothing here needs text measurement.
   The pin toggle is a bool property on the panel; the collapse toggle is a
   second bool; neither is layout-derived.
   ===================================================================== */
(function (global) {
  'use strict';

  var K = global.PMK;
  var esc = K.esc;

  /* ------------------------------------------------------------- ladders
     One table per width-varying decision. Index = PM_DATA.bucket(width). */
  var META_CAP   = [1, 2, 3, 4];    /* metadata segments shown in the card    */
  var SEG_CHARS  = [16, 13, 12, 13];/* per-segment cap; see the arithmetic in
                                       the note under metaLine()              */
  var FACTS      = [1, 2, 2, 6];    /* KV facts in the card                   */
  var BTNS       = [1, 1, 2, 2];    /* buttons in the card action row         */
  var STATS      = [0, 0, 3, 4];    /* micro-stat cells (last one is focus)   */
  var NAME_CH    = [24, 32, 42, 56];/* card identity line                     */
  /* Trimmed one character per bucket. The previous budget landed ~3px over
     in the widest theme (basic, Inter 15px plus 0.02em tracking), which
     measured as 328 ellipsis findings on artifact identities alone -- all
     of them a 3px cut. A computed character count cannot be exact across
     four font families, so the budget carries a one-character margin
     rather than aiming at the edge and losing. */
  var LIST_CH    = [25, 29, 33, 39];/* list row identity                      */
  var WIN_CH     = [30, 42, 54, 70];/* search match window                    */
  /* The .vE-col widths, in JS, so the sub-line budget below can subtract what
     the columns take. Same three numbers as the CSS rule; changing one means
     changing the other, which is why they sit under the same comment. */
  var COL_PX     = { sm: 44, md: 96, lg: 120 };
  var ROW_B3     = 360;             /* row text band at 480px, measured       */
  /* The sub-line runs at --fs-2xs (10px) against the identity's --fs-xs
     (11px), so it is NOT this file's 6.2px-per-character constant: it is that
     constant scaled by the font ratio, 6.2 x 10/11 = 5.64, rounded up to 5.7
     so the budget errs short. basic-* is the widest of the eight families and
     the one the budget has to survive. */
  var SUB_PX     = 5.7;

  /* Per-panel focus mode. See risk 3 above. */
  var FOCUS_PINNED = {
    search: false, source: false, git: false, docker: true,
    tests: false, agents: false, artifacts: false
  };
  /* Per-panel collapse. See risk 2 above. Ships false everywhere. */
  var FOCUS_COLLAPSED = {
    search: false, source: false, git: false, docker: false,
    tests: false, agents: false, artifacts: false
  };

  /* ============================ version-local CSS ======================
     Emitted once per panel render. display:none, so the fit checker skips
     it and it contributes no box. Every value is a token: no runtime colour
     math, no new translucency filter, no hard-coded radius. */
  var CSS = [
    '.vE-dock{flex:0 0 auto;padding:var(--md) var(--md) 0}',
    '.vE-dock .pmk-card{gap:var(--sm);padding:var(--lg)}',
    '.vE-b0 .pmk-card{padding:var(--md);min-height:96px}',
    '.vE-b1 .pmk-card{min-height:112px}',
    '.vE-b2 .pmk-card,.vE-b3 .pmk-card{min-height:132px}',
    '.vE-dock--min .pmk-card{min-height:0;padding:var(--sm) var(--md)}',
    '.vE-dock .pmk-empty{padding:0;max-height:none}',
    '.vE-idline{display:flex;align-items:center;gap:var(--sm);min-width:0}',
    '.vE-name{flex:1 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;',
    'white-space:nowrap;font-size:var(--fs-sm);font-weight:700;color:var(--text-primary)}',
    '.vE-tag{flex:0 0 auto;font-size:var(--fs-2xs);color:var(--text-muted);',
    'font-variant-numeric:tabular-nums;white-space:nowrap}',
    '.vE-metaline{display:flex;min-width:0;align-items:center}',
    '.vE-facts{display:flex;flex-direction:column;min-width:0}',
    '.vE-facts--grid{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:0 var(--md)}',
    '.vE-selrow{display:flex;min-width:0;gap:var(--sm);align-items:center}',
    '.vE-sk{flex:0 0 auto;font-size:var(--fs-2xs);color:var(--text-muted);white-space:nowrap}',
    /* The repo identity line. It is the one string in the Source card that
       has to shrink, so it owns the flex and everything beside it is fixed.
       Elision is still COMPUTED (PMK.elide) -- this rule is the backstop for
       a theme whose glyphs run wider than the budget assumed, not the
       mechanism. */
    '.vE-repo{flex:1 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;',
    'white-space:nowrap;font-family:var(--mono-font);font-size:var(--fs-2xs);',
    'color:var(--text-secondary)}',
    /* a 100%-width field inside a flex row would starve every sibling below
       the 24px floor, which is an R4 finding, not a cosmetic one */
    '.vE-selrow>.pmk-field,.pmk-strip>.pmk-field{flex:1 1 auto;min-width:0;width:auto}',
    '.vE-selrow>.pmk-btn,.pmk-strip>.pmk-btn{flex:0 0 auto;min-width:56px}',
    '.vE-selrow>.pmk-menu,.pmk-strip>.pmk-menu{flex:0 0 auto}',
    '.vE-bstrip{flex:0 0 auto;border-bottom:1px solid var(--border-light,var(--border))}',
    '.vE-idline .pm-menu-trigger{font-size:var(--fs-2xs);font-weight:700}',
    '.vE-chips{display:flex;flex-wrap:wrap;gap:var(--xs);min-width:0}',
    '.vE-stats{display:grid;gap:var(--sm);padding-top:var(--xs);margin-top:var(--xs);',
    'border-top:1px solid var(--border-light,var(--border))}',
    '.vE-stats--2{grid-template-columns:minmax(0,1fr) minmax(0,1fr)}',
    '.vE-stats--3{grid-template-columns:minmax(0,1fr) minmax(0,1fr) minmax(0,1fr)}',
    '.vE-stats--4{grid-template-columns:minmax(0,1fr) minmax(0,1fr) minmax(0,1fr) minmax(0,1fr)}',
    '.vE-stat{min-width:0;display:flex;flex-direction:column}',
    '.vE-stat-v{font-size:var(--fs-xs);font-weight:700;color:var(--text-primary);overflow:hidden;',
    'text-overflow:ellipsis;white-space:nowrap;font-variant-numeric:tabular-nums}',
    '.vE-stat-k{font-size:var(--fs-2xs);color:var(--text-muted);overflow:hidden;',
    'text-overflow:ellipsis;white-space:nowrap}',
    '.vE-acts{display:flex;align-items:center;gap:var(--sm);min-width:0;',
    'padding-top:var(--xs);margin-top:auto}',
    '.vE-acts-l{display:flex;align-items:center;gap:var(--xs);flex:0 0 auto}',
    '.vE-acts-r{display:flex;align-items:center;gap:var(--sm);flex:1 1 auto;',
    'min-width:0;justify-content:flex-end}',
    '.vE-acts-r>.pmk-btn{flex:1 1 auto;min-width:56px}',
    '.vE-acts .pmk-menu,.vE-idline .pmk-menu{flex:0 0 auto}',
    '.vE-tgl{display:inline-flex;align-items:center;justify-content:center;min-width:24px;',
    'min-height:24px;padding:0 2px;border:0;background:transparent;border-radius:var(--radius-xs);',
    'color:var(--text-muted);cursor:pointer;font-family:var(--mono-font);font-size:var(--fs-2xs);',
    'font-weight:700;line-height:1}',
    '.vE-tgl:hover{color:var(--text-primary);background:var(--accent-soft)}',
    '.vE-tgl[aria-pressed="true"]{color:var(--text-primary);background:var(--accent-soft)}',
    '.vE-tgl:focus-visible{outline:2px solid var(--accent-primary);outline-offset:1px}',
    '.vE-hbtn{display:inline-flex;align-items:center;justify-content:center;min-width:24px;',
    'min-height:24px;padding:0;border:0;background:transparent;border-radius:var(--radius-xs);',
    'color:var(--text-muted);cursor:pointer}',
    '.vE-hbtn:hover{color:var(--text-primary);background:var(--accent-soft)}',
    '.vE-hbtn:focus-visible{outline:2px solid var(--accent-primary);outline-offset:1px}',
    '.vE-hbtn[aria-expanded="false"] svg{transform:rotate(-90deg)}',
    '.pmk-head>.vE-hbtn,.pmk-head>.pmk-menu{flex:0 0 auto}',
    '.vE-qfield{flex:1 1 auto;min-width:0;font-family:var(--mono-font)}',
    '.vE-list{display:flex;flex-direction:column;padding-bottom:var(--md)}',
    '.vE-list .pmk-row{padding-left:var(--md)}',
    /* A KV is normally a CARD element. It appears in the list in exactly one
       place -- naming what a redaction gate is withholding, where rows are
       suppressed -- and it needs the same left edge the rows have. */
    '.vE-list>.pmk-kv{padding-left:var(--md);padding-right:var(--md)}',
    '.vE-list .pmk-row.is-selected{background:var(--accent-soft)}',
    '.vE-kind{flex:0 0 16px;width:16px;height:16px;color:var(--text-muted)}',
    '.vE-code{flex:0 0 12px;width:12px;text-align:center;font-family:var(--mono-font);',
    'font-size:var(--fs-2xs);font-weight:700;color:var(--text-secondary)}',
    '.vE-col{flex:0 0 auto;font-size:var(--fs-2xs);color:var(--text-muted);text-align:right;',
    'white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
    /* Widened md/lg by the measured shortfall (24px and 14px cuts). These are
     fixed-width columns that only render at bucket 3, where the band can
     afford it -- the alternative was clipping a value the column exists to
     show. sm is unchanged; it carries short tokens only. */
    '.vE-col--sm{width:44px}.vE-col--md{width:96px}.vE-col--lg{width:120px}',
    '.vE-tailtxt{max-width:96px;overflow:hidden;text-overflow:ellipsis}',
    '.vE-num{color:var(--text-muted);font-family:var(--mono-font)}',
    '.vE-hit{background:var(--accent-soft);color:var(--text-primary);font-weight:700;',
    'border-radius:var(--radius-xs);padding:0 1px}',
    '.vE-mono{font-family:var(--mono-font)}',
    '.vE-member .pmk-id{text-transform:uppercase;font-size:var(--fs-2xs);font-weight:700;',
    'letter-spacing:.04em}',
    '.vE-notice{display:flex;align-items:center;gap:var(--sm);min-width:0;min-height:28px;',
    'padding:var(--xs) var(--md);font-size:var(--fs-2xs);color:var(--text-secondary);',
    'border-left:3px solid var(--accent-warning);background:var(--surface)}',
    '.vE-notice svg{flex:0 0 14px;color:var(--accent-warning)}',
    '.vE-notice-t{flex:1 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
    '.vE-notice .pmk-btn{flex:0 0 auto}'
  ].join('');

  function styleTag() { return '<style>' + CSS + '</style>'; }

  /* ======================================================= MOTION =======
     Two primitives from the shared layer (_pm-motion.css / PMM), no locals,
     no @keyframes in this file:

       3. PMM.enter   the list under the card, when the LIST ITSELF changed
       6. PMM.flash   a card value that moved under the user

     WHY THE FLASH IS ON THE CARD AND NOWHERE ELSE. This system's thesis is
     that one object is rich and every other object is minimal, so the card is
     the only place a number is large enough for its change to be worth
     announcing. A row is one line of a scanning list; flashing rows would be
     the "long cascade" the layer exists to forbid, one row at a time.

     WHAT IS WATCHED. Any element carrying data-pm-live (a stable key) plus
     data-pm-live-v (its current value). Today that is the card identity line
     -- which changes when the focus RE-POINTS, the thing risk 3 in the header
     is about -- and every micro-stat cell, which is where the run counts and
     container states live. The comparison is per stage and per key, so a
     panel switch, a theme switch and a resizer drag can never fire it: those
     change which keys exist or nothing at all, never a key's value.

     HONEST NOTE. _pm-data.js is a static fixture with no ticker, so on this
     harness the flash fires ZERO times. It is the production mechanism (in
     Slint: a changed-callback on the model property driving a Rectangle's
     animate opacity), written here so the port has one, not a demo. Wiring a
     fake tick to make it visible would be inventing content, which the
     shared-fixture rule forbids.

     WHY THE LIST ENTER IS GATED. The harness re-renders every stage on every
     mousemove of the panel resizer. A list that re-enters 60 times a second
     is a strobe, not motion, so the enter fires only when the list's own
     signature changes -- and the signature is deliberately WIDTH-FREE. The
     sweep runs in one rAF, which is the browser's pre-paint step, so a list
     that did not change is never seen to animate and a list that did is never
     seen unanimated first. There is no loop and no second listener. */

  /* Flash tone from the shared status vocabulary (_pm-data.js status map),
     so a card going err never flashes the same colour as one going ok. */
  var FLASH_TONE = { err: 'down', warn: 'warn', ok: 'up' };
  function toneOf(token) {
    if (!token) return '';
    var s = K.statusOf(token);
    return (s && FLASH_TONE[s.tone]) || '';
  }

  /* The three attributes a watched value carries. Kept in one helper so a
     new watched value cannot half-declare itself. */
  function liveAttrs(key, value, tone) {
    return ' data-pm-live="' + esc(key) + '" data-pm-live-v="' + esc(String(value)) + '"' +
      (tone ? ' data-pm-live-tone="' + esc(tone) + '"' : '');
  }

  var LIVE = {};        /* stage key -> { watched key: last value }  */
  var SIG = {};         /* stage key -> list signature               */
  var QUEUED = false;

  /* Called by the shell at the end of every render. One rAF per render batch,
     coalesced; never a rAF loop. The fit rig is untouched: runMatrix() builds
     its stages offscreen outside #stageWrap and kills animations wholesale. */
  function afterRender() {
    if (QUEUED || !global.PMM || !global.requestAnimationFrame) return;
    QUEUED = true;
    global.requestAnimationFrame(function () {
      QUEUED = false;
      var stages = document.querySelectorAll('#stageWrap .pm-stage[data-pm-version="vE"]');
      for (var i = 0; i < stages.length; i++) sweepStage(stages[i]);
    });
  }

  function sweepStage(stage) {
    var panel = stage.getAttribute('data-pm-panel');
    var key = panel + '|' + stage.getAttribute('data-theme');

    /* Row COUNT, not markup: identity strings are elided per bucket, so a
       markup signature would change on every pixel of a resizer drag. */
    var list = stage.querySelector('.vE-list');
    if (list) {
      var sig = panel + ':' + list.children.length;
      if (SIG[key] !== sig) { SIG[key] = sig; global.PMM.enter(list); }
    }

    var prev = LIVE[key], next = {};
    var cells = stage.querySelectorAll('[data-pm-live]');
    for (var j = 0; j < cells.length; j++) {
      var c = cells[j];
      var k = c.getAttribute('data-pm-live'), v = c.getAttribute('data-pm-live-v');
      next[k] = v;
      /* A key that did not exist a render ago APPEARED (a stat cell that only
         renders at bucket >= 2, say). Appearing is not changing. */
      if (prev && Object.prototype.hasOwnProperty.call(prev, k) && prev[k] !== v) {
        global.PMM.flash(c, c.getAttribute('data-pm-live-tone'));
      }
    }
    LIVE[key] = next;
  }

  /* ------------------------------------------------------------- helpers */

  function labelOf(opts, v) {
    var r = v;
    (opts || []).forEach(function (o) { if (o.value === v) r = o.label; });
    return r;
  }

  function byId(list, id) {
    var hit = null;
    (list || []).forEach(function (o) { if (o.id === id) hit = o; });
    return hit;
  }

  /* ------------------------------------------------------------ action ids
     Three fixtures now hand a row the exact set of actions that row permits:
     agents.active[].allowedActionIds, actions.*.blocked.allowedActionIds and
     tests.redactionFailed.allowedActionIds. They carry COMMAND IDS, and
     _pm-data.js ships NO id-to-label catalogue.

     That absence is a real gap and it is reported rather than papered over
     with a table of display strings invented in this file. The label is
     DERIVED from the id -- trailing segment, underscores to spaces, first
     letter raised: 'orchestrator.grant_authority' -> 'Grant authority' -- and
     the untouched id travels as the item's value, so a dispatcher still
     receives the exact fixture string. Where the fixture DOES author a label
     for an id (tests.redactionFailed.authorize is the only one in the file),
     that label wins over the derivation. */
  function actionLabel(id, named) {
    if (named && named[id]) return named[id];
    var tail = String(id).split('.').pop().replace(/_/g, ' ');
    return tail.charAt(0).toUpperCase() + tail.slice(1);
  }

  /* -> overflow/menu items. The row's own set, never a fixed triple. */
  function allowedItems(ids, named) {
    return (ids || []).map(function (id) {
      return { value: id, label: actionLabel(id, named) };
    });
  }

  /* -> PMK.blocked button descriptors. Same derivation, same order. */
  function allowedButtons(ids, named) {
    return (ids || []).map(function (id) {
      return { id: id, label: actionLabel(id, named) };
    });
  }

  /* ================================================= THE CONFIRMATION GATE
     BLIND SPOT 20, and it is the cheapest fix in the whole report because it
     needs no new component. `_pm-components.js:498` has defined PM.confirm
     since the kit was written -- a modal sheet with a scrim, role="dialog",
     aria-modal, a focus trap, no auto-close and a promise -- documented at
     :9 as "replaces confirm()". Fifteen designs shipped destructive and
     egress actions as one-click menu items with a danger flag and reached
     for it exactly zero times. This file reaches for it.

     WHAT A GATE OWES. GitHub_Integration.md:L156 names three things a
     `strong` action must show BEFORE it runs: scope, consequence, and the
     confirmation boundary. A `danger: true` flag is none of the three -- it
     is a colour. So every gate here renders one sentence of SCOPE (what
     exactly is being acted on, named from the fixture), one of CONSEQUENCE
     (what is lost, quantified from the fixture wherever the fixture carries
     a number), and the command id that will run, verbatim. Egress actions
     add a fourth clause, the ATTESTATION, which for a test bundle is the
     redaction state in the fixture's own words -- including the case where
     redaction FAILED, where the attestation names the two artifacts that
     were never masked.

     NOTHING IS INVENTED. Every proper noun, count and sentence in a gate
     body is read from _pm-data.js. The only words this file supplies are the
     three clause labels and the verb the command id already carries, which is
     the same derivation actionLabel() has always done.

     WHERE THE GATE ATTACHES. Three carriers, because the panel offers strong
     actions in three shapes:
       - menu items      gate attributes ride on the <template> div, and the
                         handler reads them back off the template when
                         pm:menuaction names that value
       - card buttons    gate attributes are injected into PMK.btn's markup
       - blocked buttons PMK.blocked renders allowed_action_ids as real
                         buttons; the one the fixture marks needsConfirm gets
                         the attributes injected the same way
     The kit's own item serializer (PMK.overflow) drops fields it does not
     know, so row menus are serialized by this file's itemsHtml instead --
     identical markup, identical component, plus the gate. That is a shared-
     layer gap, reported rather than patched, because nine other agents are
     editing sibling files against the same kit.

     WHY CAPTURE-PHASE, AND WHY setTimeout. pm-menu dispatches pm:menuaction
     and only then closes itself with trigger.focus(). Opening the sheet
     synchronously would hand focus to the OK button and have the closing menu
     immediately steal it back, defeating the focus trap. So the gate opens on
     the next tick, after the menu has finished closing. The event is stopped
     in the capture phase so that nothing downstream can treat the choice as
     an execution -- in this harness nothing does, which is exactly why the
     gate has to be the thing that runs first if it is to be a gate at all.

     WHAT HAPPENS ON CONFIRM. pm:confirmed / pm:declined, bubbling, carrying
     the command id. The prototype dispatches intent and does not execute --
     the same contract the harness's own row activation states in as many
     words. The point under test is that the boundary exists and states the
     truth, not that a fixture can be mutated. */

  /** One gate. `scope` and `effect` are sentences built from fixture values;
   *  opts.attest adds the egress clause, opts.ok / opts.no name the buttons. */
  function gate(id, title, scope, effect, opts) {
    opts = opts || {};
    return {
      id: id,
      title: title,
      ok: opts.ok || 'Confirm',
      no: opts.no || 'Cancel',
      body: 'Scope: ' + scope + ' Consequence: ' + effect +
            (opts.attest ? ' Attestation: ' + opts.attest : '') +
            ' Confirming runs ' + id + '.'
    };
  }

  /** Serialized onto a template div, a button, or anything else that can
   *  carry attributes. data-* only: no id= anywhere in panel markup. */
  function gateAttrs(g) {
    if (!g) return '';
    return ' data-pm-gate="' + esc(g.id) + '"' +
      ' data-pm-gate-title="' + esc(g.title) + '"' +
      ' data-pm-gate-body="' + esc(g.body) + '"' +
      ' data-pm-gate-ok="' + esc(g.ok) + '"' +
      ' data-pm-gate-no="' + esc(g.no) + '"';
  }

  /** PMK.btn and PMK.blocked build their own markup and take no attribute
   *  bag, so the gate is injected into the string they return. PMK.btn always
   *  opens '<button type="button" class="pmk-btn...'; PMK.blocked always
   *  writes data-pm-action="<id>" on the button it renders for an allowed
   *  action id. Both are single, unambiguous replacements. */
  function gateBtn(html, g) {
    return html.replace('<button ', '<button' + gateAttrs(g) + ' ');
  }
  function gateActionBtn(html, g) {
    var needle = 'data-pm-action="' + esc(g.id) + '"';
    return html.replace(needle, needle + gateAttrs(g));
  }

  function readGate(n) {
    return {
      id: n.getAttribute('data-pm-gate') || '',
      title: n.getAttribute('data-pm-gate-title') || '',
      body: n.getAttribute('data-pm-gate-body') || '',
      ok: n.getAttribute('data-pm-gate-ok') || 'Confirm',
      no: n.getAttribute('data-pm-gate-no') || 'Cancel'
    };
  }

  function mine(n) {
    var s = n && n.closest ? n.closest('.pm-stage') : null;
    return !!s && s.getAttribute('data-pm-version') === 'vE';
  }

  /** The chosen menu value, looked up in the menu's own template. */
  function gateFromMenu(root, id) {
    if (!id || !root || !root.querySelector) return null;
    var t = root.querySelector('template[data-pm-items]');
    if (!t || !t.content) return null;
    var divs = t.content.querySelectorAll('div[data-pm-gate]');
    for (var i = 0; i < divs.length; i++) {
      if (divs[i].getAttribute('data-value') === id) return readGate(divs[i]);
    }
    return null;
  }

  function openGate(g, from) {
    if (!global.PM || !global.PM.confirm) return;
    global.PM.confirm({
      title: g.title, body: g.body,
      confirmLabel: g.ok, cancelLabel: g.no,
      danger: true, from: from
    }).then(function (ok) {
      from.dispatchEvent(new CustomEvent(ok ? 'pm:confirmed' : 'pm:declined', {
        bubbles: true, detail: { action: g.id, title: g.title, body: g.body }
      }));
    });
  }

  var GATE_WIRED = false;
  function wireGate() {
    if (GATE_WIRED) return;
    if (!global.document || !global.document.addEventListener) return;
    if (!global.PM || !global.PM.confirm) return;
    GATE_WIRED = true;

    global.document.addEventListener('pm:menuaction', function (e) {
      if (!mine(e.target)) return;
      var g = gateFromMenu(e.target, e.detail && e.detail.action);
      if (!g) return;
      e.stopPropagation();
      var from = e.target;
      global.setTimeout(function () { openGate(g, from); }, 0);
    }, true);

    global.document.addEventListener('click', function (e) {
      var btn = e.target && e.target.closest ? e.target.closest('[data-pm-gate]') : null;
      if (!btn || !mine(btn)) return;
      if (btn.getAttribute('aria-disabled') === 'true') return;
      e.preventDefault();
      e.stopPropagation();
      openGate(readGate(btn), btn);
    }, true);
  }

  function itemsHtml(items) {
    return (items || []).map(function (it) {
      if (it.type === 'sep') return '<div data-sep></div>';
      if (it.type === 'head') return '<div data-head>' + esc(it.label) + '</div>';
      return '<div data-value="' + esc(it.value || '') + '"' +
        (it.hint ? ' data-hint="' + esc(it.hint) + '"' : '') +
        (it.danger ? ' data-danger' : '') +
        (it.disabled ? ' data-disabled' : '') +
        (it.reason ? ' data-reason="' + esc(it.reason) + '"' : '') +
        (it.sentence ? ' data-sentence="' + esc(it.sentence) + '"' : '') +
        /* A gate never rides on a DISABLED item: a disabled item cannot
           dispatch, and its reason line already owns the same two attributes
           the pop renderer reads. */
        (it.gate && !it.disabled ? gateAttrs(it.gate) : '') +
        '>' + esc(it.label) + '</div>';
    }).join('');
  }

  /** PMK.overflow with this file's serializer. Same classes, same component,
   *  same 24px trigger, same tooltip -- the only difference is that item
   *  fields the kit does not know about survive into the template. */
  function overflow(items, tip) {
    return '<span class="pmk-of pmk-menu" data-pm-menu>' +
      '<button type="button" class="pm-menu-trigger" data-pm-tip="' +
      esc(tip || 'More actions') + '">' + K.icon('dots', 14) + '</button>' +
      '<template data-pm-items>' + itemsHtml(items) + '</template></span>';
  }

  /* PMK.overflow lives inside a row and is opacity:0 until hover. The card
     and the panel header need a menu that is ALWAYS visible, so they get
     this one instead. Same pm-menu component, same 24px trigger. */
  function menuBtn(items, tip) {
    return '<span class="pmk-menu" data-pm-menu>' +
      '<button type="button" class="pm-menu-trigger" data-pm-tip="' + esc(tip || 'More actions') + '">' +
      K.icon('dots', 14) + '</button>' +
      '<template data-pm-items>' + itemsHtml(items) + '</template></span>';
  }

  /* The W-018 "+N parallel contexts" escape, and any other count-that-opens-
     a-list. Never dropped at any width: losing it silently flattens contexts. */
  function plusN(n, items, tip) {
    return '<span class="pmk-menu" data-pm-menu>' +
      '<button type="button" class="pm-menu-trigger" data-pm-tip="' + esc(tip) + '">+' +
      esc(String(n)) + '</button>' +
      '<template data-pm-items>' + itemsHtml(items) + '</template></span>';
  }

  function tgl(label, on, tip) {
    return '<button type="button" class="vE-tgl" aria-pressed="' + (on ? 'true' : 'false') +
      '" data-pm-tip="' + esc(tip) + '">' + esc(label) + '</button>';
  }

  function pinBtn(pinned) {
    return '<button type="button" class="vE-tgl" aria-pressed="' + (pinned ? 'true' : 'false') +
      '" data-pm-tip="' + esc(pinned
        ? 'Pinned. Selecting a row in the list below highlights it and leaves this card alone. Activate to follow selection instead.'
        : 'Following selection. Selecting a row in the list below re-points this card. Activate to pin the current object.') +
      '">' + K.icon(pinned ? 'square' : 'refresh', 14) + '</button>';
  }

  function collapseBtn(open) {
    return '<button type="button" class="vE-hbtn" aria-expanded="' + (open ? 'true' : 'false') +
      '" data-pm-tip="' + esc(open
        ? 'Collapse the focus card and give its height back to the list.'
        : 'Expand the focus card.') + '">' + K.icon('down', 12) + '</button>';
  }

  function notice(text, cta) {
    return '<div class="vE-notice">' + K.icon('info', 14) +
      '<span class="vE-notice-t">' + esc(text) + '</span>' +
      (cta ? K.btn(cta) : '') + '</div>';
  }

  /* Segments are pre-elided AND capped by count. The arithmetic that sets
     SEG_CHARS: the card meta line owns the full card inner width (panel - 16
     dock padding - 2x card padding) = 208 / 240 / 320 / 440px. basic-* is the
     widest text at ~6.6px per character, and PMK.metaRun's "+N" escape costs
     a further 28px when it fires. 16 chars -> 106 + 28 = 134 < 208. Two 13s ->
     172 + 6 sep + 28 = 206 < 240. Three 12s -> 238 + 12 + 28 = 278 < 320. Four
     13s -> 343 + 18 + 28 = 389 < 440. .pmk-meta is overflow:hidden, so busting
     that budget is an R1 finding, not a cosmetic one. */
  function metaLine(segs, b) {
    var list = (segs || []).filter(Boolean).map(function (s) {
      return K.elide(String(s), 'text', SEG_CHARS[b]);
    });
    if (!list.length) return '';
    return '<div class="vE-metaline">' + K.metaRun(list, b, { cap: META_CAP[b] }) + '</div>';
  }

  function statsStrip(cells, b, pinned) {
    var n = STATS[b];
    if (!n) return '';
    var use = (cells || []).slice(0, n - 1);
    use.push({ k: 'focus', v: pinned ? 'pinned' : 'follows' });
    /* .pmm-flash on the CELL, not on .vE-stat-v: the value span is
       overflow:hidden for its ellipsis and would clip the overlay's 1px/3px
       bleed. The cell has no overflow of its own and no border, so the flash
       sits behind the value and its key together. */
    return '<div class="vE-stats vE-stats--' + use.length + '">' +
      use.map(function (c) {
        return '<span class="vE-stat pmm-flash"' + liveAttrs('stat.' + c.k, c.v) + '>' +
               '<span class="vE-stat-v">' + esc(c.v) + '</span>' +
               '<span class="vE-stat-k">' + esc(c.k) + '</span></span>';
      }).join('') + '</div>';
  }

  function selRow(key, selectHtml) {
    return '<div class="vE-selrow"><span class="vE-sk">' + esc(key) + '</span>' + selectHtml + '</div>';
  }

  /* ============================== FOCUS CARD ===========================
     o: { status, name, nameKind, nameHtml, tag, tagHtml, meta[], facts[],
          gridFacts[], extra, stats[], leftActions, primary, secondary,
          over[], pinned, collapsed, bucket } */
  function focusCard(o) {
    var b = o.bucket;
    var name = o.nameHtml ||
      '<span class="vE-name">' + esc(K.elide(o.name, o.nameKind, NAME_CH[b])) + '</span>';
    var tag = o.tagHtml || (o.tag ? '<span class="vE-tag">' + esc(o.tag) + '</span>' : '');

    /* The identity line is the card's one live value: it changes when the
       focus object RE-POINTS or when its status moves under the user, which
       are exactly the two events risk 3 says must never happen silently.
       Both are folded into one watched string, so a re-point that also
       changes status flashes once rather than twice. */
    var idline = '<div class="vE-idline pmm-flash"' +
      liveAttrs('focus', String(o.status || '') + '/' + String(o.name || ''), toneOf(o.status)) +
      '>' + (o.status ? K.statusMark(o.status) : '') + name + tag + '</div>';

    if (o.collapsed) {
      return K.card(idline.slice(0, idline.length - 6) +
        menuBtn(o.over || [], 'Focus card actions') + '</div>');
    }

    var h = idline;
    h += metaLine(o.meta, b);

    if (b >= 3 && o.gridFacts && o.gridFacts.length) {
      h += '<div class="vE-facts vE-facts--grid">' + o.gridFacts.slice(0, FACTS[b]).join('') + '</div>';
    } else if (o.facts && o.facts.length) {
      h += '<div class="vE-facts">' + o.facts.slice(0, FACTS[b]).join('') + '</div>';
    }
    if (o.extra) h += o.extra;
    h += statsStrip(o.stats, b, o.pinned);

    var right = '';
    var btns = [];
    if (o.primary) btns.push(o.primary);
    if (o.secondary && BTNS[b] >= 2) btns.push(o.secondary);
    right = btns.join('');

    h += '<div class="vE-acts">' +
      '<span class="vE-acts-l">' + pinBtn(o.pinned) + (o.leftActions || '') + '</span>' +
      '<span class="vE-acts-r">' + right + '</span>' +
      menuBtn(o.over || [], 'Focus card actions') +
      '</div>';

    return K.card(h);
  }

  /* Empty focus. Same dock, same min-height, so the list below never jumps
     between "there is a current object" and "there is not". Five distinct
     components from the canonical taxonomy, never one with variable copy. */
  function emptyFocus(kind, title, body, cta) {
    return K.card(K.empty(kind, title, body, cta));
  }

  /* ================================ LIST ROW ===========================
     The one-line row. b0 identity only; b1 adds the tail; b2 adds a second
     line on the selected row; b3 adds fixed priority columns.

     EXCEPTION, and it is deliberate: a row in a blocked / failed / degraded
     state gets its reason line at EVERY bucket. GI-017, CRAU-021 and RAP §9
     all forbid hiding the reason code, and a code is never a tail — it is
     28-35 characters. It goes in the identity STACK, so it costs height but
     never width, and the row can therefore never overflow because of it. */
  function row(o) {
    var b = o.bucket;
    var two = !!o.sub;
    /* o.say overrides the name a screen reader computes from the row's
       contents. It exists for ONE reason: when a row carries two state
       channels, the order they are announced in is a correctness question,
       not a nicety. A released worktree whose row announces "Unavailable"
       first has told the user the opposite of the truth before the
       correcting clause arrives. The caller therefore owns the clause
       order; see the lifecycle note in sourcePanel. */
    var h = '<div class="pmk-row' + (two ? ' pmk-row--2line' : '') +
      (o.selected ? ' is-selected' : '') + (o.cls ? ' ' + o.cls : '') +
      '" tabindex="0" role="button" data-pm-ctx="Row actions"' +
      (o.say ? ' aria-label="' + esc(o.say) + '"' : '') +
      (o.key ? ' data-pm-key="' + esc(o.key) + '"' : '') + '>';

    if (o.status) h += K.statusMark(o.status);
    if (o.lead) h += o.lead;

    var idHtml = o.idHtml || esc(K.elide(o.id, o.idKind, o.idMax || LIST_CH[b]));
    /* The sub-line was passed through raw while only the identity was
       budgeted, so CSS was left to clip it -- measured at up to 108px cut,
       and the largest single W1 source in this version. It now degrades by
       COMPUTED elision like every other string here. It sits at --fs-2xs
       (10px) against the identity's 11px, so it carries ~15% more characters
       in the same band. Computed rather than CSS elision is also what ports:
       Slint's overflow:elide can only cut tails.

       AND AT BUCKET 3 THE BAND IS NOT THE IDENTITY'S BAND. The 1.15 factor
       assumed the sub-line owns the same width the identity does, which stops
       being true the moment the fixed priority columns render: they take
       44-120px each out of the same row, and every remaining .pmk-note
       ellipsis finding in this version was at 480px for exactly that reason
       (measured: the Actions sub-line gets 149px of a row whose identity
       budget assumes ~365px). Subtracting the columns is arithmetic on
       numbers this file already owns -- COL_PX mirrors the .vE-col rules
       above, so the two cannot drift -- and it moves the cut from CSS back to
       PMK.elide, where the file's own doctrine says it belongs. No
       information is newly hidden: the same pixels were already being cut,
       just without a computed ellipsis to mark it. */
    var subMax = o.subMax || Math.round((o.idMax || LIST_CH[b]) * 1.15);
    if (!o.subMax && b >= 3 && o.cols) {
      var cpx = 0;
      o.cols.forEach(function (c) {
        if (c && c.t) cpx += (COL_PX[c.w || 'md'] || COL_PX.md) + 6;
      });
      subMax = Math.min(subMax, Math.max(16, Math.floor((ROW_B3 - cpx) / SUB_PX)));
    }
    var subHtml = two ? esc(K.elide(o.sub, o.subKind || 'text', subMax)) : '';
    h += two
      ? '<span class="pmk-id-stack"><span>' + idHtml + '</span>' +
        '<span class="pmk-note">' + subHtml + '</span></span>'
      : '<span class="pmk-id">' + idHtml + '</span>';

    if (b >= 3 && o.cols) {
      o.cols.forEach(function (c) {
        if (!c || !c.t) return;
        h += '<span class="vE-col vE-col--' + (c.w || 'md') + '">' + esc(c.t) + '</span>';
      });
    }
    if (b >= 1 && o.tail) {
      h += '<span class="pmk-tail ' + (o.tailText ? 'vE-tailtxt' : 'pmk-tail--time') + '">' +
        esc(o.tail) + '</span>';
    }
    h += overflow(o.actions || [{ value: 'open', label: 'Open' }]);
    return h + '</div>';
  }

  /* ============================== THE SHELL ============================
     Every panel calls exactly this. VerticalLayout: header (stretch 0),
     focus card (stretch 0), optional blocked strip (stretch 0), optional
     list head (stretch 0), list (stretch 1). */
  function cockpit(cardHtml, listHtml, o) {
    var b = o.bucket;
    var parts = [styleTag()];

    parts.push(K.head(o.title, o.count,
      collapseBtn(!o.collapsed) + menuBtn(o.panelOver || [], 'Panel actions')));

    parts.push('<div class="vE-dock vE-b' + b + (o.collapsed ? ' vE-dock--min' : '') +
      '" data-pm-focus="' + esc(o.focus) + '">' + cardHtml + '</div>');

    /* NOT pmk-strip: a blocked banner is a block, not a centred flex row, and
       nesting its padding inside the strip's would double it. */
    if (o.strip) parts.push('<div class="vE-bstrip">' + o.strip + '</div>');
    if (o.listHead) parts.push(K.strip(o.listHead));

    parts.push(K.body('<div class="vE-list">' + listHtml + '</div>', false));
    /* Motion is applied after the string is in the document, never declared
       in it: see the MOTION block at the top for why an enter that fires on
       every re-render is wrong here. */
    afterRender();
    /* Idempotent, and cheap enough to be safe here: the gate must be live for
       any stage this file ever paints, including the ones the fit rig builds
       offscreen, and a panel render is the one event guaranteed to precede a
       user reaching a menu. */
    wireGate();
    return K.panel(parts);
  }

  function headOf(D, id) {
    var lbl = id;
    D.panels.forEach(function (p) { if (p.id === id) lbl = p.label; });
    return lbl;
  }

  /* ===================================================================
     SEARCH — focus is the query session.
     research/search.md: the 130px Index / Engine / Documents / Last-indexed
     card duplicates what the spec assigns to the STATUS BAR, so it is gone.
     The panel owes one thing on freshness: a subtle annotation when the
     query actually fell back. That is a conditional meta segment here, not a
     card. Match rows put the line number inline (a 28px gutter costs 12.5%
     of the panel on every row forever) and window the source line CENTERED
     ON THE MATCH, because a 61-82 character line in a 30-character band
     rendered from column 0 shows zero of the match.
     =================================================================== */

  function matchWindow(hit, max) {
    var pre = String(hit.pre).replace(/^\s+/, '');
    var lead = 8;
    var drop = Math.max(0, pre.length - lead);
    var left = drop ? '…' + pre.slice(drop) : pre;
    var mid = String(hit.hit);
    var right = String(hit.post);
    var room = max - left.length - mid.length;
    if (room < 1) {
      /* The match itself is wider than the window: keep its left edge and the
         highlight, truncate the MATCH on the right. Never scroll it out. */
      mid = mid.slice(0, Math.max(1, mid.length + room - 1)) + '…';
      right = '';
    } else if (right.length > room) {
      right = right.slice(0, Math.max(0, room - 1)) + '…';
    }
    return { left: left, mid: mid, right: right };
  }

  /* BROKE-7. This panel printed search.index.state RAW -- the bare enum token
     'stale', 'unindexed', 'fallback', 'cancelled' -- as a metadata segment,
     and printed NOTHING at all under 'disabled', because the segment was gated
     on a state-is-not-ok test while the card's own status branch collapsed every
     non-ok value onto one word. 'disabled' is the single state where a user
     most needs to be told that search has fallen back to grep, and it was the
     one state that rendered silence.

     search.index.states[] is the SHIPPED vocabulary (FinalGUISpec.md:L699,
     :L6511) and it carries the sentence for each of the six. Nothing about
     freshness is spelled in this file any more.

     THE TWO SPELLINGS. index.state is live and reads 'ok'; the states array
     spells that same healthy state 'indexed'. The inline comment at
     _pm-data.js:208 lists the older vocabulary. Rather than pick a side the
     token is resolved under both spellings, and when NEITHER resolves the raw
     token is rendered as its own line: an unrecognised freshness state must
     never be reported as a healthy one.

     annotateRows IS THE AUTHORITY FOR THE GLYPH TOO. It is the fixture's own
     marker for "this index is not the authority for these rows", which is
     exactly the distinction the card's status mark has to draw. Deriving the
     mark from it means this file holds no freshness vocabulary of its own --
     not the words, not the severity. */
  var IDX_ALIAS = { ok: 'indexed' };

  function indexState(ix) {
    return byId(ix.states, IDX_ALIAS[ix.state] || ix.state) ||
           { id: ix.state, line: String(ix.state), annotateRows: true };
  }

  /* ------------------------------------------------- BLIND SPOT 15, in full
     Two facts the fixture states outright and no version has ever rendered:

     1. NO SILENT LOCAL FALLBACK. search.remote carries available:false, the
        reason code, silentFallback:false and a ready-made sentence. The
        requirement is not "look faster" -- it is that a user who is about to
        conclude something from a result set is told the set is local only.
        Rendering nothing IS the silent fallback the field exists to forbid.
     2. INDEX BUILD CANCELLED. index.state is 'ok' and index.lastBuild.state
        is 'cancelled'. Those are different facts about different moments and
        collapsing them loses the one that explains why coverage is what it
        is: the build was stopped at 41 percent and its partial generation was
        discarded. resumable:false says the only route forward is a fresh
        build, and the fixture supplies that action by id and label.

     WHY THE STRIP AND NOT THE CARD. Both are properties of the SEARCH
     SERVICE, not of this query session, so they would be wrong inside a card
     whose whole contract is "this is the one object you are working on". They
     also must not be width-gated -- a capability statement that disappears at
     240px is not a statement -- and the strip is the one slot in this shell
     that is never dropped and never elided.

     THE SEVERITY IS A DESIGN CHOICE AND IS LABELLED AS ONE. Neither payload
     ships a `severity`, and PMK.severityOf defaults an absent one to
     'blocked' -- the conservative read, and the wrong one here. Neither of
     these is a prohibition: remote acceleration being down still returns
     results (silentFallback:false, with the sentence that says so), and a
     build cancelled two days ago is a settled terminal state
     (partialDiscarded:true, resumable:false), not a wall. So both are raised
     at 'warning', which is the kit's own second tier from a closed two-value
     enum -- no vocabulary is invented, and this is the first place in the
     bakeoff where that tier renders at all.

     AND THE EVICT ACTION IS NO LONGER OFFERED FOR A SERVICE THAT IS DOWN.
     Every redesign kept 'Evict remote cache' live against a remote the
     fixture says is unavailable. It stays VISIBLE -- hiding it would be the
     other failure -- and goes inert carrying the remote's own reason code and
     sentence, the same deterministic-disabled pattern this file uses for an
     archived repository. When the remote IS available it is a strong action
     and passes through the confirmation gate. */
  function searchStrip(S) {
    var h = '';
    if (S.remote && S.remote.available === false) {
      h += K.blocked({
        code: S.remote.reason,
        sentence: S.remote.sentence,
        severity: 'warning',
        actions: S.remote.actions
      });
    }
    var lb = S.index && S.index.lastBuild;
    if (lb && lb.state === 'cancelled') {
      h += K.blocked({
        code: lb.state,
        /* line is the headline the fixture wrote for this state and detail is
           its explanation; the em-dash joiner is the same one the worktree
           lifecycle sub-line uses, so neither string is paraphrased. */
        sentence: lb.line + ' — ' + lb.detail,
        severity: 'warning',
        actions: lb.actions
      });
    }
    return h;
  }

  function searchPanel(D, state) {
    var b = D.bucket(state.width);
    var S = D.search;
    var pinned = FOCUS_PINNED.search, collapsed = FOCUS_COLLAPSED.search;
    var remoteDown = !!(S.remote && S.remote.available === false);
    var strip = searchStrip(S);
    var panelOver = [
      { type: 'head', label: 'Indexing' },
      { value: 'cmd.search.rebuild_index', label: 'Rebuild index' },
      { value: 'cmd.search.evict_remote_cache', label: 'Evict remote cache', danger: true,
        disabled: remoteDown,
        reason: remoteDown ? S.remote.reason : '',
        sentence: remoteDown ? S.remote.sentence : '',
        gate: gate('cmd.search.evict_remote_cache', 'Evict remote cache',
          'The remote search acceleration cache on ' + (S.remote ? S.remote.host : '') +
            ', last checked ' + (S.remote ? S.remote.checkedAt : '') + ' ago.',
          'Cached remote results for this workspace are dropped.',
          { ok: 'Evict cache' }) },
      { type: 'sep' },
      { value: 'cmd.search.expand_all', label: 'Expand all' },
      { value: 'cmd.search.collapse_all', label: 'Collapse all' }
    ];

    /* empty focus, live branches */
    if (!S.query) {
      return cockpit(
        emptyFocus('no-data', 'No query session', 'Type a query to start one.', 'Focus query'),
        '', { bucket: b, title: headOf(D, 'search'), count: '', focus: 'query-session',
              collapsed: collapsed, panelOver: panelOver, strip: strip });
    }
    if (!S.summary.matches) {
      return cockpit(
        emptyFocus('no-results', 'No matches', S.query + ' matched nothing in ' +
                   labelOf(S.scopeOptions, S.scope) + '.', 'Widen scope'),
        '', { bucket: b, title: headOf(D, 'search'), count: '0', focus: 'query-session',
              collapsed: collapsed, panelOver: panelOver, strip: strip });
    }

    var ix = indexState(S.index);
    var scopeLabel = labelOf(S.scopeOptions, S.scope);
    var meta = [scopeLabel];
    if (S.flags.regex) meta.push('regex');
    if (S.flags.caseSensitive) meta.push('case');
    if (S.flags.wholeWord) meta.push('whole word');
    /* The freshness state is NOT a meta segment. Segments are elided to 12-16
       characters and dropped whole by count, and half of 'Indexing off - grep
       only' is not a weaker version of the sentence -- it is a different one.
       It goes in the fact stack, which is vertical and carries the line
       verbatim at every bucket. */

    /* FACTS[0] is 1, so at 240px the card shows exactly one fact and the
       freshness line takes it whenever the index is not the plain healthy
       state. That is the asymmetry this system exists to make: match counts
       are already in the tag and the panel header, and an index that is off,
       stale or discarded is the one thing about this query session that
       nothing else on screen says. */
    var facts = [];
    if (ix.id !== 'indexed') facts.push(K.kv('index', ix.line, 'measure', b));
    facts.push(
      K.kv('matches', S.summary.matches + ' in ' + S.summary.files + ' files', 'token', b));
    if (b < 2) facts.push(K.kv('scope', scopeLabel, 'token', b));

    var grid = [
      K.kv('matches', String(S.summary.matches), 'token', b),
      K.kv('files', String(S.summary.files), 'token', b),
      K.kv('regex', S.flags.regex ? 'on' : 'off', 'token', b),
      K.kv('case', S.flags.caseSensitive ? 'on' : 'off', 'token', b),
      K.kv('whole word', S.flags.wholeWord ? 'on' : 'off', 'token', b),
      K.kv('index', ix.line, 'token', b)
    ];

    var card = focusCard({
      bucket: b, pinned: pinned, collapsed: collapsed,
      /* not authoritative for these rows -> attention; authoritative but not
         freshly built -> stale; healthy -> ok. Three marks from one fixture
         boolean and one id, and no freshness vocabulary in this file. */
      status: ix.annotateRows ? 'attention' : (ix.id === 'indexed' ? 'ok' : 'stale'),
      name: S.query,
      nameHtml: '<input class="pmk-field vE-qfield" type="text" value="' + esc(S.query) +
                '" aria-label="Search query">',
      tag: S.summary.matches + ' / ' + S.summary.files,
      meta: meta,
      facts: facts,
      gridFacts: grid,
      extra: b >= 2
        ? selRow('scope', K.select(S.scope, S.scopeOptions, { style: 'flex:1 1 auto;min-width:0' }))
        : '',
      stats: [
        { k: 'matches', v: String(S.summary.matches) },
        { k: 'files', v: String(S.summary.files) },
        { k: 'scope', v: S.scope }
      ],
      leftActions:
        tgl('.*', S.flags.regex, 'Regular expression') +
        tgl('Aa', S.flags.caseSensitive, 'Match case') +
        tgl('\\b', S.flags.wholeWord, 'Whole word'),
      primary: K.btn('Replace', { primary: true }),
      secondary: K.btn('Next'),
      over: [
        { value: 'cmd.search.replace_in_files', label: 'Replace in files…' },
        /* The hint said 'confirm' and nothing confirmed. It now does. The
           consequence clause is the one the fixture makes unavoidable:
           search.replace is the empty string, so Replace All is a delete of
           48 strings across 14 files, and saying "replaced" would be the
           understatement that makes the button dangerous. */
        { value: 'cmd.search.replace_all', label: 'Replace all', danger: true,
          hint: 'confirm',
          gate: gate('cmd.search.replace_all', 'Replace all',
            S.summary.matches + ' matches in ' + S.summary.files + ' files, scope ' +
              scopeLabel + ', query ' + S.query + '.',
            S.replace
              ? 'Every one of those matches is rewritten to ' + S.replace + '.'
              : 'Every one of those matches is rewritten. The replacement field is ' +
                'empty, so each match is deleted.',
            { ok: 'Replace all' }) },
        { type: 'sep' },
        { value: 'cmd.search.previous_result', label: 'Previous result' },
        { value: 'cmd.search.next_result', label: 'Next result' },
        { type: 'sep' },
        { value: 'cmd.search.set_scope', label: 'Set scope…' }
      ]
    });

    var list = '';
    S.files.forEach(function (f, fi) {
      list += K.section(K.elide(f.path, 'path', LIST_CH[b] + 4), f.count, true);
      f.hits.forEach(function (hit, hi) {
        var sel = fi === 0 && hi === 1;
        var w = matchWindow(hit, WIN_CH[b] - String(hit.line).length - 1);
        list += row({
          bucket: b,
          id: hit.hit,
          idHtml: '<span class="vE-num">' + esc(String(hit.line)) + '</span> ' +
                  esc(w.left) + '<mark class="vE-hit">' + esc(w.mid) + '</mark>' + esc(w.right),
          selected: sel,
          sub: (b >= 2 && sel) ? f.path + ':' + hit.line : null,
          actions: [
            { value: 'cmd.search.open_result', label: 'Open result' },
            { value: 'cmd.search.replace_selected', label: 'Replace this match', danger: true,
              gate: gate('cmd.search.replace_selected', 'Replace this match',
                f.path + ' line ' + hit.line + ', matching ' + hit.hit + '.',
                S.replace
                  ? 'This one match is rewritten to ' + S.replace + '.'
                  : 'This one match is rewritten. The replacement field is empty, so ' +
                    'the match is deleted.',
                { ok: 'Replace match' }) },
            { type: 'sep' },
            { type: 'head', label: f.path + ':' + hit.line }
          ]
        });
      });
    });

    return cockpit(card, list, {
      bucket: b, title: headOf(D, 'search'),
      count: S.summary.matches + ' in ' + S.summary.files,
      focus: 'query-session', collapsed: collapsed, panelOver: panelOver,
      strip: strip
    });
  }

  /* ===================================================================
     SOURCE CONTROL — focus is the primary active worktree (W-018).
     The strip's degradation rule is the card: primary_active_context plus
     +N parallel contexts, and +N is NEVER dropped at any width because
     losing it silently flattens contexts. Primary selection order is fixed
     (explicit selection -> most recently state-changed running attempt ->
     stable fallback); here that resolves to the running orch lane.
     The commit composer is the one thing that must stay reachable while the
     file list scrolls: it is IN the card at bucket >= 2, and in the pinned
     list header below the card at bucket < 2. Either way it is outside the
     scroller, which is what the two-level scroll model requires.
     Section order is the GI-004 canonical order with the recorded
     default-open / default-collapsed values, not a convenience order.

     BROKE-3. This panel rendered the STATUS token where the reserved
     LIFECYCLE word belongs, with no Lifecycle label anywhere, so five rows
     asserted something false: 'reserved' read as "queued", 'orphaned' as
     "attention", 'blocked_preserved' as "blocked", and worst of all
     'released' -- a worktree released after a clean merge into main and
     retained for lineage -- read as "disabled", i.e. unavailable.

     The two are different channels and the fixture says so in as many words
     (WorktreeGitImprovement.md:L297 reserves the five words precisely because
     PM_DATA.status cannot express them: one status vocabulary serves seven
     panels and 'blocked_preserved' is meaningless in Docker). So the row now
     states BOTH, and the lifecycle word renders VERBATIM -- 'blocked_preserved'
     is not humanised into "preserved", because the reserved word is the
     contract and a paraphrase of a reserved word is a different word.

     WHERE IT GOES AND WHY IT IS NEVER WIDTH-GATED. The lifecycle sits in the
     identity STACK, under the branch, at every bucket -- the same exception
     this file already makes for blocked reason codes. It drives which row
     actions are legal (UI_Command_Catalog.md:L730), and an affordance rule
     that disappears at 240px is not a rule. It costs height, never width, so
     it cannot overflow a row.

     AND THE ACCESSIBLE NAME LEADS WITH IT. Status marks carry their own
     aria-label, so a row left to compute its name from its contents announces
     the status word FIRST and the lifecycle only afterwards -- which is the
     original falsehood, spoken. The row therefore names itself explicitly:
     branch, then lifecycle, then the status label, then the state's own
     sentence. 'thread/ratings-schema. Lifecycle released. Unavailable.' is
     ordered so the correcting clause is not the correction.
     =================================================================== */

  /* Each non-active lifecycle ships its own sentence under its own key. The
     row renders whichever one this worktree carries; a locked active worktree
     falls back to its lock reason, which is the same class of fact. */
  function lifecycleSay(w) {
    return w.reservedSentence || w.orphanSentence || w.releasedSentence ||
           w.preservedSentence || w.lockReason || null;
  }

  /* ------------------------------------------------- BLIND SPOT 2: THE REPO
     Ten of ten Source designs render a branch and a worktree and never once
     say which REPOSITORY either belongs to. GitHub_Integration.md:L397 does
     not merely permit repo identity, it forbids assuming a single repo
     context -- and source.repo has carried name, owner, nameWithOwner, host,
     remote, lifecycle, visibility and two named siblings since the fixture
     was extended. The excuse was the fixture. The fixture answered.

     WHY IT IS A LINE AND NOT A META SEGMENT. The meta line is capped by
     COUNT (1 segment at 240px) and elided to 12-16 characters, so putting the
     repo there would have cost the worktree its owner at 240px and rendered
     'jared-dev/tasteb...' when it did fit. Repo identity is the qualifier
     every other string in this card depends on -- 'thread/import-fixes' means
     nothing without it -- so it gets its own row, above the action bar, at
     EVERY bucket. It costs ~18px of card height on one panel. That is the
     trade and it is the right way round.

     AND THE SIBLINGS ARE REACHABLE, WHICH IS THE ACTUAL REQUIREMENT. Naming
     one repo and stopping is still a single-repo assumption, just a
     better-labelled one. siblingCount and siblings[] hang off the same +N
     control this card already uses for parallel worktree contexts, so the
     answer to "which repo, and are there others" is one 24px target at 240px.

     Visibility and lifecycle join the line as chips from bucket 2, and the
     host from bucket 3, in that order because that is the order they change
     what you may do: a private archived repo is a different object from a
     public active one, and which host it lives on matters only once you know
     both. The character budget is worked in the same place as every other
     one in this file: at 240px the line reserves 24px for the label, 24px for
     the +N and 8px of gaps, leaving ~148px, which is 23 characters of the
     19-character nameWithOwner with room to spare. */
  var REPO_CH = [23, 29, 23, 27];

  function repoLine(repo, b) {
    if (!repo) return '';
    var h = '<div class="vE-selrow"><span class="vE-sk">repo</span>' +
      '<span class="vE-repo" data-pm-tip="' + esc(repo.remote) + '">' +
      esc(K.elide(repo.nameWithOwner || repo.name, 'path', REPO_CH[b])) + '</span>';
    /* Untoned deliberately. Colouring 'active' green and 'private' grey would
       make the repo's lifecycle a second status channel competing with the
       worktree's, and this file's rule is that a state is carried by a word
       before it is carried by a colour. */
    if (b >= 2) h += K.chip(repo.visibility) + K.chip(repo.lifecycle);
    if (b >= 3) h += K.chip(repo.host, '', true);
    if (repo.siblingCount) {
      h += plusN(repo.siblingCount, [{ type: 'head', label: 'Other repositories in this workspace' }]
        .concat((repo.siblings || []).map(function (s) {
          return { value: 'cmd.source_control.open_repository', label: s };
        })),
        'Other repositories in this workspace. This panel reports on ' +
        (repo.nameWithOwner || repo.name) + ' only.');
    }
    return h + '</div>';
  }

  function sourcePanel(D, state) {
    var b = D.bucket(state.width);
    var S = D.source;
    var pinned = FOCUS_PINNED.source, collapsed = FOCUS_COLLAPSED.source;
    var panelOver = [
      { value: 'cmd.git.worktree.create', label: 'New worktree' },
      { value: 'cmd.source_control.open_review', label: 'Open Review Mode' },
      { type: 'sep' },
      { value: 'cmd.source_control.pr.create', label: 'Create PR' },
      { value: 'cmd.source_control.toggle_generated_filter', label: 'Hide generated files' }
    ];

    if (!S.worktrees.length) {
      return cockpit(
        emptyFocus('not-configured', 'No worktree', 'This project has no git worktree bound.',
                   'Open Settings'),
        '', { bucket: b, title: headOf(D, 'source'), count: '', focus: 'active-worktree',
              collapsed: collapsed, panelOver: panelOver });
    }

    /* primary = the running attempt; the rest are the +N drill */
    var primary = S.worktrees[0];
    S.worktrees.forEach(function (w) { if (w.status === 'running') primary = w; });
    var others = S.worktrees.filter(function (w) { return w !== primary; });

    var composer =
      '<input class="pmk-field" type="text" value="' + esc(S.commitDraft) +
      '" placeholder="Commit message" aria-label="Commit message">' +
      K.btn('Commit', { primary: true }) +
      menuBtn([
        { value: 'cmd.source_control.generate_commit_message', label: 'Generate message' },
        { value: 'cmd.source_control.suggest_commit_batches', label: 'Suggest commit batches' }
      ], 'Commit assist');

    /* Lifecycle takes the first fact slot -- FACTS[0] is 1, so it is the one
       fact that survives 240px. Lock state is a consequence of it and is one
       tap away in the overflow; the reserved word is not derivable from
       anything else on screen. */
    var facts = [K.kv('lifecycle', primary.lifecycle, 'token', b)];
    if (b < 3) facts.push(K.kv('locked by', primary.lockedBy || 'nobody', 'token', b));

    /* 'branch' is gone from the grid: it is the card's own title one line
       above, and the slot it was wasting is the only place the repository's
       remote can be stated in full. GI-005 names the remote, not just the
       nameWithOwner, as part of repo identity. */
    var grid = [
      K.kv('remote', S.repo ? S.repo.remote : '', 'measure', b),
      K.kv('lifecycle', primary.lifecycle, 'token', b),
      K.kv('ahead', String(primary.ahead), 'token', b),
      K.kv('state', primary.dirty ? 'dirty' : 'clean', 'token', b),
      K.kv('locked by', primary.lockedBy || 'nobody', 'token', b),
      K.kv('path', primary.path, 'measure', b)
    ];

    /* --------------------------------------------------- the worktree gates
       Remove, Release and Request prune are the three strong actions this
       card offers. Each states what it is acting on and what is lost, both
       from the fixture: dirty says whether there is uncommitted work,
       `ahead` says how many commits would stop being reachable from this
       checkout, and lifecycle is the reserved word that decides whether the
       action is legal at all (UI_Command_Catalog.md:L730). */
    function wtScope(w) {
      return w.branch + ' at ' + w.path + ', lifecycle ' + w.lifecycle +
        ', base ' + w.base + ', owner ' + w.owner + '.';
    }
    function wtState(w) {
      return (w.dirty ? 'It has uncommitted changes. ' : 'It has no uncommitted changes. ') +
        'It is ' + w.ahead + ' commits ahead of ' + w.base + '.';
    }
    function removeGate(w) {
      return gate('cmd.git.worktree.remove', 'Remove worktree', wtScope(w),
        'The worktree directory is removed from disk. ' + wtState(w),
        { ok: 'Remove worktree' });
    }
    function releaseGate(w) {
      return gate('cmd.git.worktree.release', 'Release worktree', wtScope(w),
        'The worktree stops being owned by ' + (w.lockedBy || w.owner) +
        ' and becomes available for reuse. ' + wtState(w),
        { ok: 'Release' });
    }
    function pruneGate(w) {
      return gate('cmd.git.worktree.request_prune', 'Request prune', wtScope(w),
        'A prune request is recorded against this worktree. ' + wtState(w),
        { ok: 'Request prune' });
    }

    var card = focusCard({
      bucket: b, pinned: pinned, collapsed: collapsed,
      status: primary.status,
      name: primary.branch, nameKind: 'path',
      tagHtml: others.length
        ? plusN(others.length, others.map(function (w) {
            return { value: w.branch, label: w.branch + '  ' + w.owner +
                     (w.run ? '  ' + w.run : '') };
          }), 'Every active context: run, node, attempt, worktree, branch and status')
        : '',
      meta: [primary.owner, primary.base, primary.run || primary.kind],
      facts: facts,
      gridFacts: grid,
      extra: repoLine(S.repo, b) +
             (b >= 2 ? '<div class="vE-selrow">' + composer + '</div>' : ''),
      stats: [
        { k: 'staged', v: String(S.counts.staged) },
        { k: 'unstaged', v: String(S.counts.unstaged) },
        { k: 'worktrees', v: String(S.counts.worktrees) }
      ],
      primary: K.btn(primary.kind === 'orch' ? 'Open Lane' : 'Open Thread', { primary: true }),
      secondary: K.btn('Compare'),
      over: [
        { value: 'cmd.git.worktree.open_files', label: 'Open Files' },
        { value: 'cmd.git.worktree.compare', label: 'Compare' },
        { value: 'cmd.git.worktree.focus_lineage', label: 'Focus lineage' },
        { type: 'sep' },
        { value: 'cmd.git.worktree.request_prune', label: 'Request prune',
          disabled: !!primary.lockedBy, reason: primary.lockReason || '',
          gate: pruneGate(primary) },
        { value: 'cmd.git.worktree.release', label: 'Release',
          disabled: !!primary.lockedBy, reason: primary.lockReason || '',
          gate: releaseGate(primary) },
        { value: 'cmd.git.worktree.remove', label: 'Remove', danger: true,
          disabled: !!primary.lockedBy, reason: primary.lockReason || '',
          gate: removeGate(primary) }
      ]
    });

    var list = '';

    /* 1. Changes — default-open */
    var changed = S.staged.map(function (f) { return { f: f, grp: 'staged' }; })
      .concat(S.unstaged.map(function (f) { return { f: f, grp: 'unstaged' }; }));
    list += K.section('Changes', changed.length, true);
    changed.forEach(function (c) {
      list += row({
        bucket: b, id: c.f.path, idKind: 'path',
        lead: '<span class="vE-code">' + esc(c.f.code) + '</span>',
        tail: c.grp, tailText: true,
        actions: [
          { value: 'cmd.git.diff_open', label: 'Open diff' },
          { value: c.grp === 'staged' ? 'cmd.git.unstage_hunks' : 'cmd.git.stage_hunks',
            label: c.grp === 'staged' ? 'Unstage' : 'Stage' },
          { value: 'cmd.git.discard_hunks', label: 'Discard', danger: true,
            /* research/source.md:60 marks this DESTRUCTIVE - explicit
               confirmation. The consequence is quantified because the fixture
               quantifies it: add and del are on every changed row, so the
               sheet can say how many lines go rather than "changes". */
            gate: gate('cmd.git.discard_hunks', 'Discard changes',
              c.grp + ' ' + c.f.code + ' ' + c.f.path + ' on ' + primary.branch +
                ' in ' + (S.repo ? S.repo.nameWithOwner : '') + '.',
              c.f.add + ' added and ' + c.f.del + ' deleted lines in this file are ' +
                'discarded and the file returns to its last committed state.',
              { ok: 'Discard' }) },
          { type: 'sep' },
          { type: 'head', label: c.f.path }
        ]
      });
    });

    /* 2. History — default-collapsed */
    list += K.section('History', S.counts.commits, false);
    /* 3. Graph — default-collapsed (and the list equivalent is History, so
          the graph is never the only path to the information) */
    list += K.section('Graph', null, false);

    /* 4. Worktrees — default-open, pin-eligible. This is the asymmetry made
          visible: the focus object is rich above, its three peers are one
          line each down here, and the primary is marked selected. */
    list += K.section('Worktrees', S.counts.worktrees, true);
    S.worktrees.forEach(function (w) {
      /* Lifecycle first in the sub-line so tail elision can never reach it:
         the reserved word survives 240px whatever the sentence costs. */
      var say = lifecycleSay(w);
      list += row({
        bucket: b, id: w.branch, idKind: 'path', status: w.status,
        selected: w === primary,
        sub: w.lifecycle + (say ? ' — ' + say : ''),
        say: w.branch + '. Lifecycle ' + w.lifecycle + '. ' +
             K.statusOf(w.status).label + '.' + (say ? ' ' + say : ''),
        tail: w.run || w.kind, tailText: true,
        cols: [{ t: w.owner, w: 'lg' }, { t: w.base, w: 'sm' }],
        actions: [
          { value: 'cmd.git.worktree.open', label: 'Open' },
          { value: 'cmd.git.worktree.compare', label: 'Compare' },
          { value: 'cmd.git.worktree.focus_lineage', label: 'Focus lineage' },
          { type: 'sep' },
          { value: 'cmd.git.worktree.remove', label: 'Remove', danger: true,
            disabled: !!w.lockedBy, reason: w.lockReason || '',
            gate: removeGate(w) }
        ]
      });
    });

    /* 5. Branches / Stash — default-collapsed */
    list += K.section('Branches / Stash', S.counts.branches + ' / ' + S.counts.stash, false);

    return cockpit(card, list, {
      bucket: b, title: headOf(D, 'source'), count: String(S.counts.worktrees),
      focus: 'active-worktree', collapsed: collapsed, panelOver: panelOver,
      listHead: b < 2 ? composer : ''
    });
  }

  /* ===================================================================
     GITHUB ACTIONS — focus is current-branch readiness (GI-011).
     The blocked payload renders VERBATIM through PMK.blocked: the real code
     (actions_missing_scope_runtime), the required user sentence, and the
     ordered allowed_action_ids[] as real buttons. It sits in the strip
     BELOW the card rather than inside it, for two reasons: the banner is
     never suppressed for space so it must not eat the card's height
     contract, and its 3px left rail is not a border, so the card stays the
     only bordered container and the theme thesis holds.
     Scopes are chips, never a key/value row — the value alone runs to 53
     characters for a full scope set and overruns its label at every width.
     Run rows carry name + run number as ONE identity, because three
     consecutive rows all named "CI - build + test" are not identifiable
     without it, and a one-line list has no second line to put it on.

     BROKE-6. The repository this panel reports on is ARCHIVED, and the panel
     offered live mutation on it: Rerun and Cancel both enabled in the focus
     card, Rerun and Cancel enabled in every run row, 'Rerun failed jobs'
     enabled in the overflow. repository.lifecycle, repository.mutationDisabled,
     repository.capabilities and repository.capabilitySentence were all in the
     fixture and none of them was read.

     TWO OBLIGATIONS, AND THEY PULL IN OPPOSITE DIRECTIONS.
     GitHub_Integration.md:L1271-L1275 says archived / deleted / historical_only
     disable mutation DETERMINISTICALLY, and in the same breath that capability
     limits must show as effective capability state and NOT as hidden controls.
     So a panel that quietly drops its Dispatch button is as wrong as one that
     leaves it live. Every mutation control therefore stays exactly where it
     was, disabled, and the reason is stated in prose above them -- the one
     thing v0 does here that all six redesigns dropped.

     THE FIRST FIX READ ONLY THE CAPABILITY MAP, AND THAT WAS TOO NARROW.
     capabilities is { view_runs, dispatch, manage_secrets, rerun, cancel }, so
     gating by lookup gated exactly the verbs that happen to be spelled in it
     and left every verb that is not. 'Unpin' stayed live on an archived
     repository for precisely that reason -- there is no 'pin' key -- and so did
     the Approve/Review action carried in a blocked row's allowed_action_ids.
     A map that names five verbs is not a list of every write a panel offers.

     So the gate is a PREDICATE, not a lookup, and it is derived from the data
     in three layers: mutationDisabled, then any lifecycle other than the single
     live state, then the map for the live case. Branching on
     'lifecycle === "archived"' would hard-code one of the seven states in
     repository.lifecycleStates and offer live mutation on the other five that
     also forbid it; branching on the map alone offers live mutation on every
     verb the map forgot. Both were real, and only the second one was mine.
     =================================================================== */

  /* ------------------------------------------------------------- the gate
     Derived from the DATA in three layers and from no literal state name:

       mutationDisabled  the fixture's own deterministic flag
       lifecycle         ANY state other than the single live one gates too, so
                         deleted / historical_only / transferred /
                         renamed_redirected / remote_mismatch produce identical
                         gating with no further edit to this file
       capabilities      which verbs survive when the repository IS live

     The polarity of the two unknown cases is deliberate and they are NOT the
     same case. A live repository with no capability map is unconstrained: the
     absence of a constraint is not a constraint, and a missing map must never
     silently disable a panel. A NON-LIVE repository with no map is the
     opposite -- missing data about a repository GI-021 already says cannot be
     mutated -- so it gates. Reading only the map would leave every mutation
     live the moment a fixture ships a lifecycle without one. */
  var LIFECYCLE_LIVE = 'active';       /* the one state that permits mutation */

  function repoGate(repo) {
    if (!repo) return { repo: null, on: false, reason: '', say: '' };
    var lc = repo.lifecycle;
    var on = repo.mutationDisabled === true || (lc != null && lc !== LIFECYCLE_LIVE);
    return {
      repo: repo,
      on: on,
      /* the reserved word verbatim -- the machine-readable half of the pair */
      reason: on ? String(lc || 'mutation_disabled') : '',
      /* effective capability IN PROSE -- GI-021's own sentence, never a
         paraphrase and never a token */
      say: repo.capabilitySentence || repo.sentence || ''
    };
  }

  /* may(gate, verb) -- called ONLY with a mutating verb. Read-only verbs are
     never asked, because L1275 gates mutation and nothing else: Open run, Open
     logs, Compare, filter and paging stay live on an archived repository. */
  function may(gate, verb) {
    if (!gate || !gate.repo) return true;
    if (gate.on) return false;
    var caps = gate.repo.capabilities;
    if (!caps) return true;
    return caps[verb] !== false;
  }

  /* The reason pair every gated control carries, so the WHY travels with the
     affordance and not only with the banner. reason is the reserved word,
     sentence is the prose; PMK.overflow and the pop renderer put them on a
     visible line under the item, never in a native title. */
  function why(gate, verb) {
    if (may(gate, verb)) return { disabled: false, reason: '', sentence: '' };
    return {
      disabled: true,
      /* gate off but the map says no -> the limit is the account's, not the
         repository's, and saying 'archived' there would be a lie */
      reason: gate.on ? gate.reason : 'capability_limited',
      sentence: gate.say
    };
  }

  function gatedItem(gate, verb, value, label, danger) {
    var w = why(gate, verb);
    return { value: value, label: label, danger: !!danger,
             disabled: w.disabled, reason: w.reason, sentence: w.sentence };
  }

  /* K.btn takes one tip string, so the pair is joined the way PMK.lenses joins
     it. Still not a native title: data-pm-tip is the kit's own tooltip, and the
     same words are on screen unconditionally in the banner under the card. */
  function gateTip(w) {
    if (!w.disabled) return '';
    return (w.reason ? w.reason + ' — ' : '') + (w.sentence || '');
  }

  /* Which allowed_action_ids MUTATE. Derived from the verb the id itself
     carries rather than from a catalogue of ids, because _pm-data.js ships no
     id-to-capability table and inventing one here would be the same defect as
     inventing labels. 'github.open_environment' opens a page;
     'github.request_review' asks a human to approve a deployment, which is a
     write against a repository the gate has closed. */
  var READ_VERBS = /^(open|view|copy|compare|show|list|reveal|inspect|refresh|validate)\b/;

  function idMutates(id) {
    return !READ_VERBS.test(String(id).split('.').pop().replace(/_/g, ' '));
  }

  /* A blocked row's own allowed_action_ids, as menu items, in fixture order.
     The read-only ones stay live -- an archived repository still lets you look
     at the environment that is holding the deploy. */
  function allowedGated(blk, gate) {
    return (blk && blk.allowedActionIds || []).map(function (id) {
      if (!idMutates(id)) return { value: id, label: actionLabel(id) };
      return gatedItem(gate, 'review', id, actionLabel(id));
    });
  }

  function gitPanel(D, state) {
    var b = D.bucket(state.width);
    var A = D.actions;
    var pinned = FOCUS_PINNED.git, collapsed = FOCUS_COLLAPSED.git;
    /* Neither of the two writes here is a write against the REPOSITORY, so
       neither is gated: 'Refresh readiness' re-reads an observation, and
       'Disconnect' acts on the account. Gating the account action because the
       repository is archived would trap a user in the state they are trying to
       leave, and L1275 gates repository mutation, not workspace settings. */
    var panelOver = [
      { value: 'cmd.github.actions.open_current_branch', label: 'Current Branch' },
      { value: 'cmd.github.actions.settings.open', label: 'Settings' },
      { type: 'sep' },
      { value: 'cmd.github.actions.validate_dispatch_readiness', label: 'Refresh readiness' },
      { value: 'cmd.github.disconnect', label: 'Disconnect', danger: true,
        gate: gate('cmd.github.disconnect', 'Disconnect GitHub',
          'Account ' + A.connection.account + ', state ' + A.connection.state +
            ', scopes ' + A.connection.scopes.join(', ') + '.',
          'This workspace stops reading GitHub Actions until an account is ' +
            'reconnected. Nothing on GitHub changes.',
          { ok: 'Disconnect' }) }
    ];

    /* not-relevant and not-configured are different components, not different
       copy in one. GAAAF-005: under a github.com_only host policy a GitHub
       Enterprise Server remote gets deterministic disabled-state UX, not a
       hidden fallback — the panel does not apply, which is a different fact
       from "it applies but is unconfigured". */
    if (!A.connection || A.connection.state === 'host_excluded') {
      return cockpit(
        emptyFocus('not-relevant', 'Not this workspace',
                   'The remote is a GitHub Enterprise Server host and this workspace is github.com only.',
                   'Open Settings'),
        '', { bucket: b, title: headOf(D, 'git'), count: '', focus: 'branch-readiness',
              collapsed: collapsed, panelOver: panelOver });
    }
    if (A.connection.state === 'no_remote') {
      return cockpit(
        emptyFocus('not-configured', 'No GitHub remote',
                   'This project has no GitHub remote, so there is no branch readiness to report.',
                   'Connect GitHub'),
        '', { bucket: b, title: headOf(D, 'git'), count: '', focus: 'branch-readiness',
              collapsed: collapsed, panelOver: panelOver });
    }

    var R = A.readiness;
    var green = R.green === R.of;
    var REPO = A.repository || null;
    var GATE = repoGate(REPO);
    /* The reason pair for the two verbs the card's own action bar carries. */
    var wRerun = why(GATE, 'rerun');
    var wCancel = why(GATE, 'cancel');

    /* ------------------------------------------------ BLIND SPOT 5, in full
       THE TRIAGE REGRESSION. v0 -- the app that ships today -- puts the
       changed files and the likely next action in its failure capsule.
       All six redesigns dropped both, and pass 2 confirmed that grepping the
       emitted markup of any redesign at any width for a string that exists
       only in changedFiles returns nothing. The fixture puts changedFiles,
       changedCount and likelyNext on all four triage blocks.

       WHERE THEY GO IN A COCKPIT. The failure lines already live in the run
       row's own action menu, under a head naming job and step, because a
       three-line stack trace is not a row and never was. The changed files
       and the likely next action join them there, under their own heads,
       which means they render at EVERY bucket -- a template is not
       width-gated -- and they are one 24px target away from the row that
       owns them. The count also goes on the row's sub-line, so the
       existence of the evidence is visible without opening anything, which
       is the part a menu genuinely cannot do.

       This is still weaker than v0's persistent capsule and is reported as
       such rather than claimed as parity: v0 shows the triage without a
       click, this shows the count without a click and the content with one. */
    function triageItems(t) {
      var acts = [{ type: 'head', label: t.job + ' / ' + t.step }];
      t.lines.forEach(function (ln) { acts.push({ value: '', label: ln, disabled: true }); });
      if (t.changedFiles && t.changedFiles.length) {
        acts.push({ type: 'head',
                    label: 'Changed files (' + (t.changedCount != null
                      ? t.changedCount : t.changedFiles.length) + ')' });
        t.changedFiles.forEach(function (f) {
          acts.push({ value: 'cmd.github.actions.open_changed_file', label: f });
        });
      }
      if (t.likelyNext) {
        acts.push({ type: 'head', label: 'Likely next' });
        acts.push({ value: '', label: t.likelyNext, disabled: true });
      }
      acts.push({ type: 'sep' });
      return acts;
    }

    /* The blocked SEVERITY, on the row. GitHub_Integration.md:L2091-L2099 puts
       three of its seven codes at 'warning' and the fixture carries one of
       them (run #17, actions_runner_unavailable) alongside a 'blocked' one
       (actions_environment_review_required). Rendering the code alone makes
       the two identical, and the distinction is the whole point: one says you
       may not, the other says not right now. PMK.severityOf is the kit's own
       derivation, including its conservative default, so this file holds no
       severity vocabulary of its own. */
    function blockedSub(blk) {
      return K.severityOf(blk) + ' — ' + blk.code;
    }
    function cancelGate(r) {
      return gate('cmd.actions.cancel', 'Cancel run',
        r.name + ' ' + r.run + ' on ' + r.branch + ', ' + r.status +
          ', running ' + r.dur + ', started ' + r.age + ' ago.',
        'In-flight jobs stop and the run ends as cancelled.',
        { ok: 'Cancel run', no: 'Leave it running' });
    }

    var facts = [K.kv('checks', R.green + ' of ' + R.of + ' green', 'token', b)];
    /* When mutation is gated the second fact is the REASON, not the account.
       The card's two buttons are disabled one line below it, and at 320/380 the
       KV grid that would otherwise carry the lifecycle does not render at all,
       so without this swap the word explaining the greyed buttons lives only in
       the banner. The account is still on the meta line above. Same row count
       either way, so the card's height contract is untouched. */
    if (b < 3) {
      facts.push(GATE.on
        ? K.kv('repository', GATE.reason, 'token', b)
        : K.kv('account', A.connection.effective, 'token', b));
    }

    var grid = [
      K.kv('branch', R.branch, 'token', b),
      K.kv('checks', R.green + ' / ' + R.of, 'token', b),
      K.kv('account', A.connection.effective, 'token', b),
      K.kv('observed', R.age + ' ago', 'token', b),
      K.kv('transport', R.snapshot, 'token', b),
      K.kv('repository', REPO ? REPO.lifecycle : A.connection.state, 'token', b)
    ];

    var scopeChips = '<div class="vE-chips">' +
      A.connection.scopes.map(function (s) { return K.chip(s, 'ok', true); }).join('') +
      A.connection.missingScopes.map(function (s) { return K.chip(s, 'warn', true); }).join('') +
      '</div>';

    var card = focusCard({
      bucket: b, pinned: pinned, collapsed: collapsed,
      status: green ? 'ok' : 'attention',
      name: R.branch, nameKind: 'path',
      tag: R.green + ' / ' + R.of,
      meta: [R.snapshot, R.age, A.connection.effective],
      facts: facts,
      gridFacts: grid,
      extra: b >= 3 ? scopeChips : '',
      stats: [
        { k: 'green', v: R.green + '/' + R.of },
        { k: 'observed', v: R.age },
        { k: 'account', v: A.connection.effective }
      ],
      /* Visible and disabled, never hidden -- L1275 is explicit about that. */
      primary: K.btn('Rerun', { primary: true, disabled: wRerun.disabled,
                                tip: gateTip(wRerun) }),
      /* Disabled on this fixture (archived repository) and gated anyway: the
         two are different mechanisms and the gate must not depend on the
         capability check happening to be on. The click handler declines to
         open a sheet for an aria-disabled control, so the order is
         capability first, confirmation second. */
      secondary: gateBtn(
        K.btn('Cancel', { danger: true, disabled: wCancel.disabled,
                          tip: gateTip(wCancel) }),
        gate('cmd.actions.cancel', 'Cancel runs on ' + R.branch,
          'Branch ' + R.branch + ', ' + R.green + ' of ' + R.of +
            ' checks green, observed ' + R.age + ' ago over ' + R.snapshot + '.',
          'In-flight jobs on this branch stop and their runs end as cancelled.',
          { ok: 'Cancel run', no: 'Leave it running' })),
      over: [
        gatedItem(GATE, 'rerun', 'cmd.actions.rerun_failed', 'Rerun failed jobs'),
        gatedItem(GATE, 'dispatch', 'cmd.github.actions.dispatch', 'Run workflow'),
        { value: 'cmd.github.actions.compare_last_success', label: 'Compare last success' },
        { value: 'cmd.actions.view_logs', label: 'View logs' },
        { type: 'sep' },
        { value: 'cmd.actions.open_in_browser', label: 'Open in browser' },
        { value: 'cmd.github.actions.open_related_worktree', label: 'Open related worktree' }
      ]
    });

    var lenses = K.lenses([
      { id: 'current', label: 'Current Branch' },
      { id: 'workflows', label: 'Workflows', count: String(A.workflows.length) },
      { id: 'settings', label: 'Settings' }
    ], 'current', b, 'GitHub Actions subviews');

    var list = '';
    if (b >= 1 && A.pinned.length) {
      list += K.section('Pinned', A.pinned.length, true);
      A.pinned.forEach(function (p) {
        var pacts = [];
        /* A pinned row can be blocked too -- 'Deploy to production #41' is --
           and its code and its allowed_action_ids were dropped here while the
           identical run row below rendered both. */
        if (p.blocked) {
          pacts.push({ type: 'head', label: blockedSub(p.blocked) });
          pacts.push({ value: 'blocked', label: p.blocked.sentence, disabled: true,
                       reason: p.blocked.code, sentence: p.blocked.sentence });
          pacts = pacts.concat(allowedGated(p.blocked, GATE));
          pacts.push({ type: 'sep' });
        }
        pacts.push({ value: 'cmd.github.actions.open_run', label: 'Open run' });
        /* Unpin is a WRITE, and it was the last live one on this panel: the
           first gate asked the capability map, so it covered exactly the verbs
           the map happens to name and nothing else. There is no 'pin' key in
           it. That is precisely why the gate cannot be a lookup -- an unlisted
           verb on a non-live repository is still a write. */
        pacts.push(gatedItem(GATE, 'pin', 'cmd.github.actions.unpin', 'Unpin'));
        list += row({
          bucket: b, id: p.name + ' ' + p.run, status: p.status, tail: p.age,
          cols: [{ t: p.badge, w: 'sm' }, { t: p.branch, w: 'lg' }],
          actions: pacts
        });
      });
    }

    list += K.section('Runs', A.runs.length, true);
    A.runs.forEach(function (r, i) {
      var selected = r.status === 'failed';
      var sub = null;
      /* never hidden, and the severity leads it so the tier is legible
         without opening anything */
      if (r.blocked) sub = blockedSub(r.blocked);
      else if (r.triage) sub = r.triage.job + ' / ' + r.triage.step +
        (r.triage.changedCount != null ? ' — ' + r.triage.changedCount + ' changed' : '');
      else if (b >= 2 && selected) sub = r.branch;

      var acts = [];
      if (r.blocked) {
        acts.push({ type: 'head', label: blockedSub(r.blocked) });
        acts.push({ value: 'blocked', label: r.blocked.sentence, disabled: true,
                    reason: r.blocked.code, sentence: r.blocked.sentence });
        /* The row's own allowed set, gated. 'Request review' is the panel's
           one Approve/Review affordance and it is a write: on an archived
           repository it stays visible and inert, while 'Open environment'
           beside it stays live because reading is never gated. */
        acts = acts.concat(allowedGated(r.blocked, GATE));
        acts.push({ type: 'sep' });
      }
      if (r.triage) acts = acts.concat(triageItems(r.triage));
      acts.push({ value: 'cmd.github.actions.open_run', label: 'Open run' });
      acts.push(gatedItem(GATE, 'rerun', 'cmd.actions.rerun', 'Rerun'));
      /* Two independent reasons a Cancel can be inert, and they must not be
         conflated: the repository forbids every write, or this particular run
         has already finished. The gate outranks the run status, because it is
         the fact that would still be true if the run were live. */
      var notRunning = r.status !== 'running';
      acts.push(wCancel.disabled
        ? { value: 'cmd.actions.cancel', label: 'Cancel', danger: true, disabled: true,
            reason: wCancel.reason, sentence: wCancel.sentence }
        : { value: 'cmd.actions.cancel', label: 'Cancel', danger: true,
            disabled: notRunning, reason: notRunning ? 'run_status_terminal' : '',
            gate: cancelGate(r) });

      list += row({
        bucket: b, id: r.name + ' ' + r.run, status: r.status,
        selected: selected, sub: sub, tail: r.age,
        cols: [{ t: r.dur, w: 'md' }, { t: r.branch, w: 'lg' }],
        actions: acts
      });
    });

    /* The lifecycle banner sits UNDER the readiness blocked banner, not
       instead of it: they are two different facts (this account cannot
       dispatch; this repository cannot be mutated by anyone) and collapsing
       them would lose one. Rendered through the same blocked component so the
       reserved word is mono and verbatim and the sentence is prose, and not at
       the error colour -- an archived repository is a settled state, not a
       fault.

       SEVERITY IS LEFT AT THE KIT'S DEFAULT HERE, AND THAT IS THE RIGHT TIER.
       PMK.severityOf defaults an absent severity to 'blocked', and blocked is
       what this is: mutation on an archived repository is not deferred, it is
       forbidden, which is exactly the 'you may not' half of the distinction
       the two tiers exist to draw. Compare searchStrip, where the same absence
       is overridden to 'warning' because a degraded remote still answers.

       It reads the GATE, not mutationDisabled, so a fixture that ships a
       non-live lifecycle without the flag still gets the banner. This is the
       one place effective capability is stated in WORDS rather than implied by
       a greyed button, it is not width-gated, and it renders at 240px. */
    var repoStrip = GATE.on
      ? K.blocked({ code: GATE.reason, sentence: GATE.say })
      : '';

    return cockpit(card, list, {
      bucket: b, title: headOf(D, 'git'), count: R.green + ' of ' + R.of,
      focus: 'branch-readiness', collapsed: collapsed, panelOver: panelOver,
      strip: K.blocked(A.connection.blocked) + repoStrip,
      listHead: lenses
    });
  }

  /* ===================================================================
     DOCKER MANAGER — focus is the active compose project.
     The subview switcher is the panel's single most important 240px
     decision and it is arithmetic, not taste: CRAU-009 forbids hiding
     unsupported subviews, they must stay VISIBLE with a disabled reason,
     and 10 subviews x 24px minimum hit target = 240px against a 224px
     band. So PMK.lenses collapses to a portaled picker at bucket 0, where
     Kubernetes still appears, still disabled, still carrying
     k8s_kubeconfig_missing and its sentence.
     This is the panel that ships PINNED: you act on the compose project
     while you read container rows, so selecting a stopped container must
     not re-point the card. Toggle it in the card and the mode word changes
     in the micro-stat strip.
     Container images use PMK.elide(image) so the tag is never the thing
     that gets cut — both ends of an image ref are row-differentiating.
     =================================================================== */
  function dockerPanel(D, state) {
    var b = D.bucket(state.width);
    var C = D.docker;
    var pinned = FOCUS_PINNED.docker, collapsed = FOCUS_COLLAPSED.docker;
    var panelOver = [
      { value: 'cmd.docker.cleanup.scan', label: 'Cleanup advisor' },
      { value: 'cmd.docker.drift.compare', label: 'Compare drift' },
      { type: 'sep' },
      { value: 'cmd.docker.context.select', label: 'Select context…' },
      { value: 'cmd.docker.hosts.open', label: 'Docker / Hosts' }
    ];

    if (!C.runtime.detected) {
      return cockpit(
        emptyFocus('unavailable', 'Runtime unavailable',
                   'No container runtime was detected for this project.', 'Explain this state'),
        '', { bucket: b, title: headOf(D, 'docker'), count: '', focus: 'compose-project',
              collapsed: collapsed, panelOver: panelOver });
    }
    if (!C.compose || !C.compose.project) {
      return cockpit(
        emptyFocus('no-data', 'No compose project',
                   'The runtime is up but this project declares no compose file.', 'Build image'),
        '', { bucket: b, title: headOf(D, 'docker'), count: '', focus: 'compose-project',
              collapsed: collapsed, panelOver: panelOver });
    }

    var svc = C.compose.services;
    var up = svc.filter(function (s) { return s.status === 'running'; }).length;
    var bad = svc.filter(function (s) { return s.status === 'failed'; }).length;
    var running = C.containers.filter(function (c) { return c.status === 'running'; }).length;

    var facts = [K.kv('services', up + ' of ' + svc.length + ' up', 'token', b)];
    if (b < 3) facts.push(K.kv('context', C.runtime.context, 'token', b));

    var grid = [
      K.kv('project', C.compose.project, 'token', b),
      K.kv('services', up + ' / ' + svc.length, 'token', b),
      K.kv('engine', C.runtime.engine, 'token', b),
      K.kv('context', C.runtime.context, 'token', b),
      K.kv('detection', C.runtime.detected ? 'detected' : 'not_detected', 'token', b),
      K.kv('file', C.compose.file, 'measure', b)
    ];

    var card = focusCard({
      bucket: b, pinned: pinned, collapsed: collapsed,
      status: bad ? 'attention' : 'ok',
      name: C.compose.project,
      tag: up + ' / ' + svc.length,
      meta: [C.compose.file, C.runtime.engine, C.runtime.context],
      facts: facts,
      gridFacts: grid,
      stats: [
        { k: 'up', v: String(up) },
        { k: 'failed', v: String(bad) },
        { k: 'images', v: String(C.images.length) }
      ],
      primary: K.btn('Compose up', { primary: true }),
      secondary: K.btn('Logs'),
      over: [
        { value: 'cmd.docker.compose_down', label: 'Compose down', danger: true,
          gate: gate('cmd.docker.compose_down', 'Compose down',
            C.compose.project + ' from ' + C.compose.file + ', ' + up + ' of ' +
              svc.length + ' services running.',
            'Every running service in this project stops and its containers are ' +
              'removed. Named volumes and images are left alone.',
            { ok: 'Compose down' }) },
        { value: 'cmd.docker.compose.up_subset', label: 'Up subset…' },
        { value: 'cmd.docker.compose.scenario.save', label: 'Save scenario' },
        { type: 'sep' },
        { value: 'cmd.docker.build.run', label: 'Build image' },
        { value: 'cmd.docker.image.push', label: 'Push image', hint: 'hard gate' }
      ]
    });

    var list = '';
    list += K.section('Containers', running + ' / ' + C.containers.length, true);
    C.containers.forEach(function (c) {
      var img = K.elide(c.image, 'image', b >= 3 ? 15 : 22);
      list += row({
        bucket: b, id: c.name, status: c.status,
        sub: c.detail ? c.detail : ((b >= 2 && c.status === 'running' && c.url) ? img : null),
        tail: c.age,
        cols: [{ t: img, w: 'lg' }, { t: c.ports, w: 'sm' }],
        actions: [
          { value: 'cmd.docker.container.view_logs', label: 'Logs' },
          { value: 'cmd.docker.container.open', label: 'Open app',
            disabled: !c.url, reason: c.url ? '' : 'access_url_unresolved',
            sentence: c.url ? '' : 'No direct access URL detected' },
          { value: 'cmd.docker.container.attach_shell', label: 'Shell', hint: 'audited' },
          { type: 'sep' },
          { value: 'cmd.docker.container.restart', label: 'Restart' },
          { value: 'cmd.docker.container.delete', label: 'Delete', danger: true,
            gate: gate('cmd.docker.container.delete', 'Delete container',
              c.name + ', image ' + c.image + ', ports ' + c.ports + ', ' +
                c.status + ' for ' + c.age + '.',
              'This container and anything written inside it are removed. The ' +
                'image ' + c.image + ' stays.',
              { ok: 'Delete container' }) },
          { type: 'sep' },
          { type: 'head', label: c.image }
        ]
      });
    });

    return cockpit(card, list, {
      bucket: b, title: headOf(D, 'docker'), count: running + '/' + C.containers.length,
      focus: 'compose-project', collapsed: collapsed, panelOver: panelOver,
      listHead: K.lenses(C.subviews, 'containers', b, 'Docker subviews')
    });
  }

  /* ===================================================================
     TESTING — the card IS active_run_detail.
     Five region names are literal spec text. active_run_detail is promoted
     out of the list and becomes the focus card; the other four render
     below in canonical order with ONE reordering the spec itself demands:
     redaction_notice renders ABOVE artifact_preview, because it is a
     display gate and not a footnote.
     Enablement is per adapter, not global, so the capability strip is a
     lens row where browser stays visible-but-disabled with
     testing_needs_authority and performance stays visible-but-disabled
     with testing_prohibited_by_policy. An Off family never renders green.
     Button enablement derives from run status, not from the panel's own
     idea of state: Watch/Cancel while queued|running, Open receipt only
     when terminal.

     BROKE-5. redaction_notice rendered 'tests.redaction.note' -- "4 fields
     redacted before display" -- unconditionally, and then rendered all eleven
     artifact rows, two of which (playwright-trace.zip,
     import-worker-stdout-retry-2.log) are the ones tests.redactionFailed
     names as unmasked. A clean assertion over a run whose redaction FAILED,
     directly above the material the failure forbids showing.
     Automated_Testing_System.md:L83-L98 puts it in one line: redaction
     failures block display until resolved or explicitly authorized. The gate
     exists FOR the failure case, and this panel had only ever drawn the happy
     path.

     THREE STATES, READ FROM THE FIXTURE, NOT BRANCHED ON HERE.
     redactionStates carries 'preview': 'render' | 'placeholder' | 'suppress'.
     Pending is not a slower clean -- it suppresses too -- and a fourth state
     added to _pm-data.js would change this panel without touching this file.

     THE GATE IS ENTERED FROM THE DATA. A run in the list carrying
     redactionState 'redaction_failed' is what opens it; the panel does not
     decide. And nothing here is dismissible: dismissible:false is stated in
     the fixture, dismissal would imply the user saw the artifact, and every
     version passes that check today only by never having built a dismiss
     control. This one declines to build one on purpose.

     WITHHELD, NOT DECORATED. blocks[] names artifact_preview, so the region
     renders the gate and the NAMES of what is being held, never the rows. The
     count stays on the section header: the artifacts exist, they are not
     displayable. The only route past it is redactionFailed.authorize, which
     is destructive and needsConfirm in the fixture, so it is offered as one
     of the row's own allowed actions and never as a plain dismiss.
     =================================================================== */
  function testsPanel(D, state) {
    var b = D.bucket(state.width);
    var T = D.tests;
    var pinned = FOCUS_PINNED.tests, collapsed = FOCUS_COLLAPSED.tests;

    /* ---- the redaction gate, resolved before ANY markup, because the export
       action needs it too and the export action is in the panel header menu,
       which renders even in the two empty-focus branches below.

       EXPORT IS EGRESS AND EGRESS NEEDS AN ATTESTATION. A bundle leaves the
       workspace, and the only question that matters at that boundary is what
       state the redaction was in when it was built. The fixture answers it
       twice over: redaction.note for the clean case, and redactionFailed with
       the profile id, the 2-of-6 field count, the run the secrets belong to
       and the two artifacts that were never masked for the failed one. The
       attestation is those sentences verbatim. A version that exports without
       stating them has designed the happy path again, one boundary further
       out than the preview gate this panel already closed. */
    var RF = T.redactionFailed || null;
    var failedRun = null;
    T.runs.forEach(function (r) {
      if (r.redactionState === 'redaction_failed') failedRun = r;
    });
    var gated = !!(RF && failedRun);
    var attest = gated
      ? RF.sentence + ' ' + RF.detail + ' Unmasked: ' + RF.affectedArtifacts.join(', ') + '.'
      : ((T.redaction && T.redaction.note) ? T.redaction.note + '.' : '');

    function exportGate(what, count) {
      return gate('cmd.testing.export_bundle', 'Export bundle', what,
        'A copy of ' + count + ' leaves this workspace. Nothing in the run changes.',
        { ok: 'Export bundle', attest: attest });
    }

    var panelOver = [
      { value: 'cmd.testing.export_bundle', label: 'Export bundle', hint: 'egress',
        gate: exportGate(
          T.runtime.adapter + ' session, ' + T.runs.length + ' runs, ' +
            T.artifacts.length + ' artifacts.',
          T.artifacts.length + ' artifacts') },
      { value: 'cmd.testing.session.redaction.inspect', label: 'Inspect redaction' },
      { type: 'sep' },
      { value: 'cmd.testing.capability_policy.set', label: 'Capability policy…' },
      { value: 'cmd.testing.visibility_policy.set', label: 'Visibility policy…' }
    ];

    if (!T.runtime.enabled) {
      return cockpit(
        emptyFocus('not-configured', 'Testing runtime disabled',
                   'No adapter is configured for this project, so no run can produce a receipt.',
                   'Configure adapter'),
        '', { bucket: b, title: headOf(D, 'tests'), count: '', focus: 'active-run',
              collapsed: collapsed, panelOver: panelOver });
    }
    if (!T.active) {
      return cockpit(
        emptyFocus('no-data', 'No active run',
                   T.runtime.adapter + ' is ready. Nothing is running right now.', 'Run'),
        '', { bucket: b, title: headOf(D, 'tests'), count: '', focus: 'active-run',
              collapsed: collapsed, panelOver: panelOver });
    }

    var R = T.active;
    var live = R.status === 'running' || R.status === 'queued';

    var wantRedaction = gated ? RF.state : (T.redaction && T.redaction.state);
    var RS = byId(T.redactionStates, wantRedaction);
    var previewMode = RS ? RS.preview : 'render';
    /* The one id in the whole fixture that authors its own label. */
    var authNames = {};
    if (RF && RF.authorize) authNames[RF.authorize.id] = RF.authorize.label;

    /* _pm-data.js:1176 names cancel_run in the run-precondition block as
       "destructive-adjacent and needs a confirm the kit cannot currently
       express (blind spot 1 -- there is no PMK.confirm anywhere in this
       bakeoff)". The premise of that parenthesis was wrong -- PM.confirm was
       there all along -- so the requirement it states is now met. The
       consequence is arithmetic on the fixture's own counters: 214 planned,
       118 done, so 96 tests never run. */
    var cancelRunGate = gate('cmd.testing.cancel_run', 'Cancel run',
      R.name + ', ' + R.done + ' of ' + R.total + ' done, ' + R.elapsed +
        ' elapsed, lane ' + R.lane + ', retry ' + R.retry + '.',
      'The run stops at ' + R.done + ' of ' + R.total + '. The remaining ' +
        (R.total - R.done) + ' tests are not executed.',
      { ok: 'Cancel run', no: 'Leave it running' });

    var facts = [K.kv('progress', R.done + ' of ' + R.total, 'token', b)];
    if (b < 3) facts.push(K.kv('failed', String(R.failed), 'token', b));

    var grid = [
      K.kv('passed', String(R.passed), 'token', b),
      K.kv('failed', String(R.failed), 'token', b),
      K.kv('skipped', String(R.skipped), 'token', b),
      K.kv('elapsed', R.elapsed, 'token', b),
      K.kv('lane', R.lane, 'token', b),
      K.kv('adapter', T.runtime.adapter, 'token', b)
    ];

    var card = focusCard({
      bucket: b, pinned: pinned, collapsed: collapsed,
      status: R.status,
      name: R.name,
      tag: R.done + ' / ' + R.total,
      meta: [R.lane, R.retry, R.elapsed],
      facts: facts,
      gridFacts: grid,
      stats: [
        { k: 'passed', v: String(R.passed) },
        { k: 'failed', v: String(R.failed) },
        { k: 'elapsed', v: R.elapsed }
      ],
      primary: K.btn('Watch', { primary: true }),
      secondary: gateBtn(K.btn('Cancel', { danger: true, disabled: !live }), cancelRunGate),
      over: [
        { value: 'cmd.testing.run', label: 'Run again' },
        { value: 'cmd.testing.open_receipt', label: 'Open receipt', disabled: live,
          reason: 'run_status_terminal' },
        { value: 'cmd.testing.export_bundle', label: 'Export bundle', hint: 'egress',
          gate: exportGate(R.name + ', ' + R.done + ' of ' + R.total + ' done, lane ' +
                           R.lane + ', ' + T.artifacts.length + ' artifacts.',
                           'this run and its ' + T.artifacts.length + ' artifacts') },
        { type: 'sep' },
        { value: 'cmd.testing.cancel_run', label: 'Cancel run', danger: true,
          disabled: !live, gate: cancelRunGate }
      ]
    });

    var caps = T.policy.capabilities.map(function (c) {
      return { id: c.id, label: c.label, count: c.mode,
               available: c.state === 'ok',
               reason: c.reason, sentence: c.sentence };
    });

    var list = '';

    /* region 1 — run_list */
    list += K.section('Runs', T.runs.length, true);
    T.runs.forEach(function (r) {
      var sel = r.status === 'running';
      list += row({
        bucket: b, id: r.name, idKind: 'text', status: r.status, selected: sel,
        /* The gate names a run; the run has to name the gate back, or the two
           sit in the same panel with nothing connecting them. Like a blocked
           reason code this is never width-gated. */
        sub: r.redactionState ? r.redactionState
                              : ((b >= 2 && sel) ? 'run ' + r.id : null),
        tail: r.when,
        cols: [{ t: 'run ' + r.id, w: 'md' }],
        actions: [
          { value: 'cmd.testing.watch_run', label: 'Watch',
            disabled: !(r.status === 'running' || r.status === 'queued') },
          { value: 'cmd.testing.open_receipt', label: 'Open receipt',
            disabled: r.status === 'running', reason: 'run_status_terminal' },
          { value: 'cmd.testing.cancel_run', label: 'Cancel', danger: true,
            disabled: r.status !== 'running',
            gate: gate('cmd.testing.cancel_run', 'Cancel run',
              r.name + ', run ' + r.id + ', ' + r.status + ', started ' + r.when + ' ago.',
              'In-flight tests stop and the run ends without a complete receipt.',
              { ok: 'Cancel run', no: 'Leave it running' }) }
        ]
      });
    });

    /* region 3 — failure_list */
    list += K.section('Failures', T.failures.length, true);
    T.failures.forEach(function (f) {
      list += row({
        bucket: b, id: f.test, idKind: 'ref', status: 'failed',
        sub: b >= 1 ? f.message : null,
        actions: [
          { type: 'head', label: f.message },
          { value: 'cmd.testing.open_failure', label: 'Open failure' }
        ]
      });
    });

    /* region 5 — redaction_notice, ABOVE the preview because it is a gate */
    if (gated) {
      /* err tone: the fixture's own severity for this one is not in doubt --
         secrets in run 209 were not masked.

         AND THE ONE ACTION THE FIXTURE ITSELF MARKS needsConfirm IS THE ONE
         THAT GETS THE SHEET. redactionFailed.authorize carries
         destructive:true and needsConfirm:true -- the only place in the whole
         of _pm-data.js where a confirmation is demanded by name -- and every
         version rendered it as a plain button. PMK.blocked builds those
         buttons itself and takes no attribute bag, so the gate is injected
         into the one button whose data-pm-action matches. Its body is the
         failure verbatim: what is unmasked, which run it belongs to, and
         which profile failed to load. */
      list += gateActionBtn(K.blocked({
        code: RF.reason, sentence: RF.sentence,
        actions: allowedButtons(RF.allowedActionIds, authNames)
      }, 'err'), gate(RF.authorize.id, RF.authorize.label,
        'Run ' + RF.affectedRunId + ', artifacts ' + RF.affectedArtifacts.join(' and ') + '.',
        RF.detail + ' Confirming displays them unredacted.',
        { ok: RF.authorize.label, no: 'Keep them withheld', attest: RF.sentence }));
    } else if (RS || (T.redaction && T.redaction.fields)) {
      list += notice(RS ? RS.line : T.redaction.note, 'Inspect');
    }

    /* region 4 — artifact_preview, post-redaction only */
    list += K.section('Artifacts', T.artifacts.length, true);
    if (previewMode !== 'render') {
      /* A suppressing state with no payload still suppresses. The names are
         extra truth, not the reason to withhold. */
      if (RF) {
        list += K.kv('withheld', RF.affectedArtifacts.join(', '), 'measure', b);
        list += K.kv('blocks', RF.blocks.join(', '), 'measure', b);
      }
    } else {
      T.artifacts.forEach(function (a) {
        list += row({
          bucket: b, id: a.name, idKind: 'path',
          lead: '<span class="vE-kind">' + K.icon(
            a.kind === 'screenshot' ? 'square' : a.kind === 'evidence' ? 'check' : 'info', 16) +
            '</span>',
          tail: a.size, tailText: true,
          cols: [{ t: a.kind, w: 'md' }],
          actions: [
            { value: 'cmd.artifacts.open', label: 'Open' },
            { value: 'cmd.testing.export_bundle', label: 'Export', hint: 'egress',
              gate: exportGate(a.name + ', ' + a.kind + ', ' + a.size + '.',
                               'this artifact') }
          ]
        });
      });
    }

    return cockpit(card, list, {
      bucket: b, title: headOf(D, 'tests'), count: R.done + '/' + R.total,
      focus: 'active-run', collapsed: collapsed, panelOver: panelOver,
      listHead: K.lenses(caps, 'unit', b, 'Testing capabilities')
    });
  }

  /* ===================================================================
     AGENTS — the panel this system rescues best, so make it obvious.
     The panel mirrors the subagent registry and holds no state of its own,
     which is exactly what a focus card is: a projection of one row, larger.
     Focus resolution: the first BLOCKED delegation, else the first running
     one. Blocked wins because concurrent blocked episodes must not be
     collapsed and each is individually actionable, and because a blocked
     delegation is the only thing in this panel a human can act on.
     The blocked reason renders verbatim through PMK.blocked with lineage
     entrypoints as real buttons — the one behavior F3-452 actually
     mandates. Note that needs_authority is NOT a Plans code (see
     research/agents.md section 6); the panel renders whatever the registry
     hands it, verbatim, rather than paraphrasing it into a local vocabulary.
     Available is a single drill row, never interleaved with active rows:
     the two have opposite sort orders and share almost no metadata.
     =================================================================== */
  function agentsPanel(D, state) {
    var b = D.bucket(state.width);
    var G = D.agents;
    var pinned = FOCUS_PINNED.agents, collapsed = FOCUS_COLLAPSED.agents;
    var panelOver = [
      { value: 'cmd.agents.open_activity', label: 'Open Agent Activity' },
      { value: 'cmd.agents.open_config', label: 'Open Agent Config' },
      { type: 'sep' },
      { value: 'cmd.agents.filter_state', label: 'Filter by state…' }
    ];

    if (!G.active.length) {
      return cockpit(
        emptyFocus('no-data', 'No active delegation',
                   'The subagent registry is mirrored here. Nothing is delegated right now.',
                   'Open Agent Activity'),
        '', { bucket: b, title: headOf(D, 'agents'), count: '', focus: 'active-delegation',
              collapsed: collapsed, panelOver: panelOver });
    }

    var focus = null;
    G.active.forEach(function (a) { if (!focus && a.status === 'blocked') focus = a; });
    if (!focus) G.active.forEach(function (a) { if (!focus && a.status === 'running') focus = a; });
    if (!focus) focus = G.active[0];

    var facts = [K.kv('persona', focus.persona, 'token', b)];
    if (b < 3) facts.push(K.kv('target', focus.target, 'token', b));

    var grid = [
      K.kv('persona', focus.persona, 'token', b),
      K.kv('target', focus.target, 'token', b),
      K.kv('run', focus.run || 'none', 'token', b),
      K.kv('elapsed', focus.elapsed, 'token', b),
      K.kv('state', focus.status, 'token', b),
      K.kv('thread', focus.thread, 'measure', b)
    ];

    /* BROKE-9. This banner used to offer two LINEAGE entrypoints on every
       blocked delegation, identical on all five, while the row's own
       allowedActionIds[] went unread. Four of the five rows permit different
       things -- restoring permits only 'Open for edit', disconnected permits
       'Reconnect session', the remediation ceiling permits Replan but
       explicitly NO retry -- so one fixed pair was wrong on four rows out of
       five and looked equally authoritative on all of them.
       The allowed set now leads, in fixture order. Lineage follows it as the
       last button rather than replacing it, because F3-452 wants a lineage
       entrypoint and the remediation row's lineage must stay visible
       (lineageVisible:true) -- but it is navigation, and navigation does not
       get to sit where the permitted actions belong. */
    function cancelDelegation(a) {
      return gate('cmd.agents.cancel_run', 'Cancel delegation',
        a.name + ', persona ' + a.persona + ', target ' + a.target + ', thread ' +
          a.thread + (a.run ? ', run ' + a.run : '') + ', ' + a.elapsed + ' elapsed.',
        'The delegation stops and its node ends without a result. Work already ' +
          'written by it is not undone.',
        { ok: 'Cancel delegation', no: 'Leave it running' });
    }

    /* orchestrator.abort_node is the one genuinely destructive id in this
       panel's allowed sets, and it arrives from the fixture rather than from
       a menu written here -- three of the five blocked rows permit it. It is
       gated wherever it renders, in the banner and in the row, on the same
       terms as a cancel, because that is what it is. */
    function abortGate(a) {
      return gate('orchestrator.abort_node', 'Abort node',
        a.name + ', blocked ' + (a.blockedFor || a.elapsed) + ' on ' + a.reason +
          ', thread ' + a.thread + '.',
        a.sentence + ' Aborting ends the node without resolving that.',
        { ok: 'Abort node', no: 'Leave it blocked' });
    }
    var ABORT_ID = 'orchestrator.abort_node';

    var blocked = focus.reason
      ? K.blocked({
          code: focus.reason, sentence: focus.sentence,
          /* severity travels when the fixture ships one; agents rows do not,
             so PMK.severityOf's conservative default applies and says so */
          severity: focus.severity,
          actions: allowedButtons(focus.allowedActionIds)
            .concat([{ label: G.lineageTargets[5] }])
        })
      : '';
    if (blocked && (focus.allowedActionIds || []).indexOf(ABORT_ID) >= 0) {
      blocked = gateActionBtn(blocked, abortGate(focus));
    }

    var card = focusCard({
      bucket: b, pinned: pinned, collapsed: collapsed,
      status: focus.status,
      name: focus.name,
      tag: focus.run || focus.elapsed,
      meta: [focus.persona, focus.target, focus.thread],
      facts: facts,
      gridFacts: grid,
      stats: [
        { k: 'active', v: String(G.active.length) },
        { k: 'done', v: String(G.completed.length) },
        { k: 'roster', v: String(G.available.length) }
      ],
      primary: K.btn(G.lineageTargets[5], { primary: true }),
      secondary: K.btn(G.lineageTargets[0]),
      over: [
        { value: 'cmd.agents.open_lineage', label: G.lineageTargets[5] },
        { value: 'cmd.agents.open_thread', label: G.lineageTargets[0] },
        { value: 'cmd.agents.open_activity', label: G.lineageTargets[1] },
        { type: 'sep' },
        { value: 'cmd.agents.watch_run', label: 'Watch', disabled: focus.status !== 'running' },
        { value: 'cmd.agents.cancel_run', label: 'Cancel', danger: true,
          disabled: focus.status === 'blocked', reason: focus.reason || '',
          gate: cancelDelegation(focus) }
      ]
    });

    function agentActions(a) {
      var acts = [];
      if (a.reason) {
        acts.push({ type: 'head', label: a.reason });
        acts.push({ value: 'blocked', label: a.sentence, disabled: true,
                    reason: a.reason, sentence: a.sentence });
        acts.push({ type: 'sep' });
      }
      /* The row's OWN permitted set, in the fixture's order, before any
         navigation. A row that permits nothing gets nothing -- 'Perf
         Prospector' is prohibited by workspace policy and ships no
         allowedActionIds, and offering it a plausible action would be the
         same defect in the other direction. */
      var allowed = allowedItems(a.allowedActionIds).map(function (it) {
        if (it.value === ABORT_ID) it.gate = abortGate(a);
        return it;
      });
      if (allowed.length) acts = acts.concat(allowed, [{ type: 'sep' }]);

      acts.push({ value: 'cmd.agents.open_lineage', label: D.agents.lineageTargets[5] });
      acts.push({ value: 'cmd.agents.open_thread', label: D.agents.lineageTargets[0] });
      /* No Watch on a blocked row: it is not running and cannot be made to
         run by this control. The ceiling row makes the point -- autoRetry is
         false, so a retry affordance here would break the ceiling outright. */
      if (!a.reason) {
        acts.push({ value: 'cmd.agents.watch_run', label: 'Watch',
                    disabled: a.status !== 'running' });
      }
      return acts;
    }

    function agentRow(a, selected) {
      return row({
        bucket: b, id: a.name, idKind: 'text', status: a.status, selected: selected,
        sub: a.reason ? a.reason : (a.note ? a.note : ((b >= 2 && selected) ? a.thread : null)),
        tail: a.elapsed,
        cols: [{ t: a.persona, w: 'md' }, { t: a.thread, w: 'lg' }],
        actions: agentActions(a)
      });
    }

    /* Regions 1, 2 and 4 are three projections of ONE activity list, so they
       are one scroller with sticky group headers, not three scrollers. */
    var list = '';
    var groups = [
      { key: 'running', label: 'Running' },
      { key: 'blocked', label: 'Blocked' },
      { key: 'queued', label: 'Queued' }
    ];
    groups.forEach(function (g) {
      var rows = G.active.filter(function (a) { return a.status === g.key; });
      if (!rows.length) return;
      list += K.section(g.label, rows.length, true);
      rows.forEach(function (a) { list += agentRow(a, a === focus); });
    });

    list += K.section('Recent', G.completed.length, true);
    G.completed.forEach(function (c) {
      list += row({
        bucket: b, id: c.name, idKind: 'text', status: c.status,
        tail: c.when,
        cols: [{ t: c.persona, w: 'md' }, { t: c.outcome, w: 'lg' }],
        actions: [
          { value: 'cmd.agents.open_lineage', label: G.lineageTargets[5] },
          { value: 'cmd.agents.open_activity', label: G.lineageTargets[2] },
          { value: 'cmd.agents.open_activity', label: G.lineageTargets[3] }
        ]
      });
    });

    /* Available: one drill row. Registry-scoped, alphabetical, config-bearing
       — the opposite shape to everything above it. */
    list += row({
      bucket: b, id: 'Available subagents', idKind: 'text',
      lead: '<span class="vE-kind">' + K.icon('chev', 16) + '</span>',
      tail: String(G.available.length),
      actions: [{ type: 'head', label: 'Open in Agent Config' }].concat(
        G.available.map(function (a) {
          return { value: 'cmd.agents.open_config', label: a.name, hint: a.persona };
        }))
    });

    return cockpit(card, list, {
      bucket: b, title: headOf(D, 'agents'), count: String(G.active.length),
      focus: 'active-delegation', collapsed: collapsed, panelOver: panelOver,
      strip: blocked,
      listHead: K.lenses([
        { id: 'active', label: 'Active', count: String(G.active.length), available: true },
        { id: 'recent', label: 'Recent', count: String(G.completed.length), available: true },
        { id: 'roster', label: 'Available', count: String(G.available.length), available: true }
      ], 'active', b, 'Agent roster views')
    });
  }

  /* ===================================================================
     ARTIFACTS — focus is the most recent (or selected) artifact.
     The envelope has no title field, and the kind token runs to 21
     characters (before_after_snapshot) which is ~143px, 65% of the 224px
     band, before the label gets a pixel. So in the LIST the kind is a
     GLYPH with the full type in its tooltip, never a leading chip. In the
     CARD it can be a proper key/value, because the card is a vertical
     stack and a KV costs height rather than the identity line's width.
     The list gutter is 21px status + 20px kind = 41px, 18% of the band.
     That is the honest cost of two orthogonal always-present axes, and it
     is a fifth of what the chip costs.
     Bundle members lead with evidence_role, not artifact_type: role is a
     6-value closed enum, it is short, it orders deterministically
     (baseline -> repro -> diagnosis -> fix -> verification) and it explains
     the row's function. Kind moves to the tail.
     =================================================================== */
  var KIND_GLYPH = {
    code_diff: 'branch', validation_test: 'check', api_web_call: 'search',
    browser_recording: 'ext', screenshot: 'square', cost_usage: 'bar',
    tool_llm_trace: 'filter', restore_point: 'refresh'
  };

  function artifactsPanel(D, state) {
    var b = D.bucket(state.width);
    var A = D.artifacts;
    var pinned = FOCUS_PINNED.artifacts, collapsed = FOCUS_COLLAPSED.artifacts;
    /* Export is EGRESS on this panel too, and the envelope carries the field
       that decides whether it is allowed to leave: retention. The attestation
       states the retention class of what is being copied out, because
       'session' and 'project' are not the same promise. */
    function exportGate(r) {
      return gate('cmd.artifacts.export', 'Export record',
        K.artifactLabel(r) + ', kind ' + r.kind + ', family ' + r.family +
          ', id ' + r.id + '.',
        'A copy of this record leaves this workspace. The record itself is unchanged.',
        { ok: 'Export record', attest: 'Retention class ' + r.retention + '.' });
    }

    var panelOver = [
      { value: 'cmd.artifacts.export', label: 'Export…',
        gate: gate('cmd.artifacts.export', 'Export records',
          A.rows.length + ' records in view, families ' +
            A.families.map(function (f) { return f.label; }).join(', ') + '.',
          'A copy of every record in view leaves this workspace. The records ' +
            'themselves are unchanged.',
          { ok: 'Export records',
            attest: 'Retention classes vary by record; each row states its own.' }) },
      { value: 'cmd.artifacts.import_bundle', label: 'Import bundle…' },
      { type: 'sep' },
      { value: 'cmd.artifacts.load_older', label: 'Load older' },
      { value: 'cmd.artifacts.refresh', label: 'Refresh' }
    ];

    if (!A.rows.length) {
      return cockpit(
        emptyFocus('no-data', 'No artifacts',
                   'Nothing has been produced in this project yet.', 'Refresh'),
        '', { bucket: b, title: headOf(D, 'artifacts'), count: '', focus: 'artifact',
              collapsed: collapsed, panelOver: panelOver });
    }

    var focus = A.rows[0];

    var facts = [K.kv('kind', focus.kind, 'token', b)];
    if (b < 3) facts.push(K.kv('preview', focus.preview, 'measure', b));

    var grid = [
      K.kv('kind', focus.kind, 'token', b),
      K.kv('family', focus.family, 'token', b),
      K.kv('state', focus.status, 'token', b),
      K.kv('age', focus.meta[focus.meta.length - 1], 'token', b),
      K.kv('preview', focus.preview, 'measure', b),
      K.kv('scope', focus.meta[1], 'token', b)
    ];

    var card = focusCard({
      bucket: b, pinned: pinned, collapsed: collapsed,
      status: focus.status,
      /* Same computed identity the list rows use. 'title' is OPTIONAL on the
         envelope (RAP:L318) and the card must not be the one place a direct
         .title binding survives -- today's focus row happens to have one,
         which is exactly how this class of defect stays invisible. */
      name: K.artifactLabel(focus),
      tag: focus.meta[focus.meta.length - 1],
      meta: focus.meta,
      facts: facts,
      gridFacts: grid,
      stats: [
        { k: 'kind', v: focus.kind },
        { k: 'family', v: focus.family },
        { k: 'state', v: focus.status }
      ],
      primary: K.btn('Open', { primary: true }),
      secondary: K.btn('Show in Usage'),
      over: [
        { value: 'cmd.artifacts.open', label: 'Open' },
        { value: 'cmd.artifacts.preview', label: 'Preview' },
        { value: 'cmd.artifacts.show_in_usage', label: 'Show in Usage' },
        { value: 'cmd.artifacts.show_in_ledger', label: 'Show in Ledger' },
        { type: 'sep' },
        { value: 'cmd.artifacts.set_preview_mode', label: 'Curated / Raw' },
        { value: 'cmd.artifacts.export', label: 'Export record', hint: 'egress',
          gate: exportGate(focus) }
      ]
    });

    var list = '';
    A.rows.forEach(function (r) {
      var sel = r === focus;
      list += row({
        bucket: b, id: K.artifactLabel(r), idKind: 'text', status: r.status, selected: sel,
        lead: '<span class="vE-kind" data-pm-tip="' + esc(r.kind) + '">' +
              K.icon(KIND_GLYPH[r.kind] || 'info', 16) + '</span>',
        sub: (b >= 2 && sel) ? r.preview : null,
        tail: r.meta[r.meta.length - 1],
        cols: [{ t: r.meta[0], w: 'md' }, { t: r.meta[1], w: 'lg' }],
        actions: [
          { type: 'head', label: r.kind },
          { value: 'cmd.artifacts.open', label: 'Open' },
          { value: 'cmd.artifacts.preview', label: 'Preview' },
          { value: 'cmd.artifacts.show_in_usage', label: 'Show in Usage' },
          { type: 'sep' },
          { value: 'cmd.artifacts.export', label: 'Export record', hint: 'egress',
            gate: exportGate(r) }
        ]
      });
    });

    var Bd = A.bundle;
    list += K.section(Bd.title, Bd.members.length + ' / ' + Bd.outcome, true);
    Bd.members.forEach(function (m) {
      list += row({
        bucket: b, cls: 'vE-member', id: m.role, idKind: 'text',
        lead: '<span class="vE-kind" data-pm-tip="' + esc(m.kind) + '">' +
              K.icon(KIND_GLYPH[m.kind] || 'info', 16) + '</span>',
        tail: K.elide(m.kind, 'text', 12), tailText: true,
        actions: [
          { type: 'head', label: m.kind },
          { value: 'cmd.artifacts.open', label: 'Open' },
          { value: 'cmd.artifacts.export_investigation', label: 'Export investigation',
            hint: 'egress',
            gate: gate('cmd.artifacts.export_investigation', 'Export investigation',
              Bd.title + ', ' + Bd.members.length + ' members, outcome ' + Bd.outcome +
                ', confidence ' + Bd.confidence + '.',
              'A copy of the whole bundle leaves this workspace, including the ' +
                Bd.members.map(function (x) { return x.role; }).join(', ') + ' members.',
              { ok: 'Export investigation',
                attest: 'Bundle ' + Bd.id + ', outcome ' + Bd.outcome + '.' }) }
        ]
      });
    });

    return cockpit(card, list, {
      bucket: b, title: headOf(D, 'artifacts'), count: String(A.families[0].count),
      focus: 'artifact', collapsed: collapsed, panelOver: panelOver,
      listHead: K.lenses(A.families.map(function (f) {
        return { id: f.id, label: f.label, count: String(f.count), available: true };
      }), 'all', b, 'Artifact families')
    });
  }

  /* ------------------------------------------------------------ register */
  global.PM_BAKEOFF.register('vE', {
    name: 'Cockpit',
    blurb: 'One fixed focus card plus a lean list. Asymmetric by design.',
    panels: {
      search: searchPanel,
      source: sourcePanel,
      git: gitPanel,
      docker: dockerPanel,
      tests: testsPanel,
      agents: agentsPanel,
      artifacts: artifactsPanel
    }
  });

  wireGate();
})(window);
