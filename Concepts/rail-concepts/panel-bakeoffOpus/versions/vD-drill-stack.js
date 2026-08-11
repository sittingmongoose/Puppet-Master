/* PANEL BAKEOFF — vD DRILL STACK
   =====================================================================
   THESIS
   ------
   The panel is a navigation stack, not a page. A hub of counts, then a
   list, then an object, then a sub-object. Exactly ONE level is in the DOM
   at a time, so no two levels ever share the 240px band. Every other system
   in this bakeoff solves narrow width with layout — columns, accordions,
   lenses, sheets. This one solves it with DEPTH: nothing is ever nested
   visually, because nesting happens in TIME.

   That is the whole trade. It buys the only system that trivially survives
   depth 4 at 240px (GitHub Actions: hub > Runs > run #310 > job "test" >
   step logs) and it pays for it in taps.

   LEVELS
   ------
   L0  Hub       5-12 destination rows, [glyph][name][count][status][chevron],
                 plus 1-2 global primary actions pinned as a footer and any
                 blocked banner. The panel header is the only bar.
                 Three of those rows are IDENTITY rather than inventory --
                 Source > the repository, Docker > the registry identity,
                 Search > the remote accelerator -- and each leads its hub,
                 because it is the scope every row under it is subject to.
   L1  List      filter-first toolbar, then uniform one-line rows. Singleton
                 subviews (Docker > Build, Search > Index) render as an object
                 at depth 1 — the LEVEL BODY keys off kind, not off depth.
   L2  Object    identity header, status, 3-6 stacked KVs, an action bar, and
                 0-2 sub-lists that drill to L3.
   Back bar      24px nominal (26px so the 24px target survives retro's 2px
                 border): [< Back][title, elided][overflow]. It REPLACES the
                 panel header rather than stacking under it — two 28px bars in
                 a 224px band is a quarter of the chrome budget for nothing.
                 NO BREADCRUMB. There is no width for one; the back bar title
                 IS the breadcrumb tail, and the activity bar still shows which
                 panel you are in.

   WIDTH LADDER (bucket = PM_DATA.bucket(px), never a continuum)
   ------------------------------------------------------------
                  240 (0)        320 (1)        380 (2)         480 (3)
   structure      strict stack   strict stack   strict stack    VERTICAL split
                                                                L1 top 45% /
                                                                L2 bottom 55%
   L0 rows        1 line         1 line         + summary line  + summary
                                                                + inline action
   L1 rows        identity only  + tail time    + meta run      + priority cols
   L2 KVs         all stacked    all stacked    inline for      all inline,
                                                token kinds     2 columns
   back bar       icon-only <    < Back         < Back          < Back

   The 480 split is VERTICAL ONLY, and deliberately. A horizontal split at
   480px gives each pane ~232px, which is the 240px problem again — recreated
   inside a panel that was supposed to have escaped it. Splitting vertically
   keeps the full 464px band for both panes and only spends height, which is
   the axis this panel has to spare.

   THE THREE RISKS, HANDLED
   ------------------------
   1. DEPTH FATIGUE. hub > Containers > container > logs is three taps for what
      a VS Code user does in one. Mitigation: the hub is not a menu. Every L0
      row carries a live count AND a status mark, so "3/5 containers, one
      failed" is readable without descending, and at bucket >= 2 a summary line
      carries the discriminating detail. You descend to ACT, not to find out.
   2. SOURCE CONTROL BREAKS NATIVELY. "Review my changes WHILE writing the
      commit message" is a two-region task and this system renders one region.
      Fix: the Changes L1 pins the commit composer as a FOOTER (.vD-pin) below
      the scroller, so the file list and the message field co-exist at every
      width. This is the one special case in an otherwise uniform system and it
      is called out here rather than hidden. The Docker Publish stage list and
      the hub primary bar reuse the same footer mechanic.
   3. NAVIGATION STATE. A module-local STACK object keyed by panel id (see
      below). The harness re-renders the whole stage on state change, so a
      plain object is enough; no framework, no DOM state. FinalGUISpec.md:686
      (the GitHub Actions side-panel owner block; the rule itself sits at :713)
      requires the panel hard-refresh or CLEAR STALE SELECTIONS on effective-
      account change, and storage-plan.md:1060 requires pins and last-opened
      run/job/log focus be invalidated with it. resetStacks() below is that
      invalidation: an account switch drops every panel back to its hub, which
      is the only state that cannot be stale.

   CONFIRMATION
   ------------
   No destructive or egress action executes from a single tap. Discard,
   Remove, Drop, Prune, Delete, Replace all, Evict, Stop, Cancel and the four
   Exports open PM.confirm (_pm-components.js:498) carrying SCOPE, CONSEQUENCE
   and a verb on the confirm button, which is what GitHub_Integration.md:L156
   requires of a strong action. An action that is already DISABLED is never
   gated -- a sheet in front of a dead control teaches the wrong lesson about
   what the sheet means. See THE CONFIRMATION GATE below for the three
   carriers and the one shared-layer gap.

   MOTION
   ------
   ONE primitive from the shared layer, and it is the one this system cannot
   be honestly judged without: PMM.push (_pm-motion.css .pmm-frame). A stack
   whose levels cut is a stack you have to re-read from the top every tap,
   because nothing tells you whether you went deeper or came back. Forward
   enters from the right, Back from the left; the back bar travels with its
   level, because in a stack the bar's title IS the frame's identity, not
   chrome that outlives it.

   Nothing else moves. There is no list enter here: the frame slide already
   carries the whole arriving level, and running both would animate the same
   pixels twice. Travel is the family knob (2px basic, 4px retro, 8px
   friendly, 12px glass) over --motion-med at most, and the push fires ONLY on
   a navigation - never on a theme, width, density or resizer re-render, and
   never in the fit rig. See pushFrames() for why that is a JS call and not a
   class in the markup.

   SLINT MAPPING
   -------------
   The stack is a VecModel<StackFrame> per panel, StackFrame being
   { id: string, title: string, arg: string }. stackFrame() maps to:

     if stack.length == 0 : Hub    { rows: hub-model; }
     if stack.length == 1 : ListL1 { frame: stack[0]; }
     if stack.length >= 2 : Object { frame: stack[stack.length - 1]; }

   with the back bar as a sibling that renders when stack.length > 0, and the
   480 case as a VerticalLayout of two of those blocks at stretch 45/55. Push
   is stack.push(frame), back is stack.remove(stack.length - 1). Every width
   decision reads an int bucket computed once in Rust, so nothing here needs
   text measurement mid-layout. There are no global ids and no runtime colour
   math, so the port is mechanical.

   NOTE ON FIXTURE COUNTS. Hub counts are computed from _pm-data.js, never
   asserted. Where the brief quoted a larger number than the fixture ships
   (Actions "Runs 24"/"Workflows 6", Agents "Completed 6"/"Available 14"), the
   rendered count is the real array length. Inventing a count to make a hub
   look busy is exactly the failure mode the shared-fixture rule exists to stop.
   ===================================================================== */
(function (global) {
  'use strict';

  var PMK = global.PMK;
  var esc = PMK.esc;
  var ic = PMK.icon;
  var el = PMK.elide;
  var ELL = '…';

  /* ================================================================ CSS
     Injected once into the document, not per stage: eight contact-sheet
     stages would otherwise carry eight copies. Tokens only — no hard-coded
     radius, no colour math, no backdrop-filter, no font below 12px on
     --display-font (retro renders Orbitron there and it is unreadable). */
  (function injectCss() {
    if (document.querySelector('style[data-vd-css]')) return;
    var s = document.createElement('style');
    s.setAttribute('data-vd-css', '');
    s.textContent = [
      /* ---- back bar ---- */
      '.vD-back{display:flex;align-items:center;gap:var(--sm);flex:none;min-height:26px;',
      'padding:1px var(--sm);border-bottom:var(--border-width,1px) solid var(--border);',
      'background:var(--surface-elevated);min-width:0}',
      '.vD-backbtn{display:inline-flex;align-items:center;justify-content:center;gap:var(--xs);',
      'flex:none;min-height:24px;min-width:24px;padding:0 6px;border:0;border-radius:var(--radius-xs);',
      'background:transparent;color:var(--text-secondary);font-family:var(--body-font);',
      'font-size:var(--fs-2xs);font-weight:600;cursor:pointer;white-space:nowrap}',
      /* --accent-primary and --accent-soft are declared on :root in terms of
         --accent-blue, which only the [data-theme] blocks declare, so both
         compute to the guaranteed-invalid value: --accent-primary is dead in
         6 of 8 themes and --accent-soft in all 8. That is a shared-token
         defect, not a version one, and it is NOT repaired here (repairing it
         for vD alone would flatter this version for a reason unrelated to
         design). Version-local rules just carry an explicit fallback. */
      '.vD-backbtn:hover{color:var(--text-primary);',
      'background:var(--accent-soft,var(--surface-elevated))}',
      '.vD-backbtn:focus-visible{outline:2px solid var(--accent-primary,var(--accent-blue));',
      'outline-offset:-2px}',
      '.vD-backttl{flex:1 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;',
      'font-family:var(--display-font-sm,var(--body-font));font-size:var(--fs-2xs);font-weight:700;',
      'letter-spacing:.08em;text-transform:uppercase;color:var(--text-primary)}',
      /* the kit hides the overflow slot until row hover; outside a row it must stay visible */
      '.vD-back .pmk-of,.vD-acts .pmk-of,.pmk-strip .pmk-of,.vD-pin .pmk-of,',
      '.pmk-head .pmk-of{opacity:1}',
      /* ---- lists ---- */
      '.vD-list{display:flex;flex-direction:column;gap:1px;padding:var(--xs) var(--sm) var(--md)}',
      '.vD-hub{padding-left:var(--sm)}',
      '.vD-glyph{flex:none;display:flex;align-items:center;color:var(--text-muted)}',
      /* --text-secondary, not --text-muted: the count is the whole reason a hub
         row is informative rather than a menu entry, and --text-muted at 10px
         misses AA in the basic family, where section 13.1 mandates it. */
      '.vD-count{flex:none;white-space:nowrap;font-size:var(--fs-2xs);color:var(--text-secondary);',
      'font-variant-numeric:tabular-nums}',
      '.vD-chev{flex:none;display:flex;align-items:center;color:var(--text-muted)}',
      '.vD-off{opacity:.62}',
      '.vD-code2{flex:none;min-width:10px;text-align:center;font-size:var(--fs-2xs);',
      'font-weight:700;color:var(--text-secondary);white-space:nowrap}',
      /* ---- 480 vertical split ---- */
      '.vD-split{flex:1 1 auto;min-height:0;display:flex;flex-direction:column}',
      '.vD-pane{min-height:0;overflow-y:auto;overscroll-behavior:contain;scrollbar-width:thin}',
      '.vD-pane--t{flex:45 1 0;border-bottom:var(--border-width,1px) solid var(--border)}',
      '.vD-pane--b{flex:55 1 0}',
      /* ---- pinned footer (risk 2: the commit composer, and hub primaries) ---- */
      '.vD-pin{flex:none;display:flex;flex-direction:column;gap:var(--sm);',
      'padding:var(--sm) var(--md);border-top:var(--border-width,1px) solid var(--border);',
      'background:var(--surface-elevated);min-width:0}',
      /* ---- object level ---- */
      '.vD-obj{display:flex;flex-direction:column;gap:var(--xs);padding:var(--sm) var(--md) 0}',
      '.vD-obj-h{display:flex;align-items:center;gap:var(--sm);min-width:0;min-height:24px}',
      '.vD-obj-t{flex:1 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;',
      'font-size:var(--fs-sm);font-weight:700;color:var(--text-primary)}',
      '.vD-kvs{display:flex;flex-direction:column;padding:var(--sm) var(--md)}',
      '.vD-kvs--2{display:grid;grid-template-columns:1fr 1fr;gap:0 var(--md)}',
      '.vD-acts{padding:0 var(--md) var(--md);align-items:center}',
      '.vD-note{padding:0 var(--md) var(--sm)}',
      '.vD-sub{display:flex;flex-direction:column;min-width:0}',
      /* ---- search match row ---- */
      '.vD-hit{padding-left:var(--sm)}',
      /* dim, but --text-secondary rather than --text-muted: the line number is
         the row's only positional anchor, and 10px muted misses AA in basic */
      '.vD-ln{flex:none;min-width:26px;text-align:right;color:var(--text-secondary);',
      'font-family:var(--mono-font);font-size:var(--fs-2xs);font-variant-numeric:tabular-nums;',
      'white-space:nowrap}',
      '.vD-code{flex:1 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;',
      'font-family:var(--mono-font);font-size:var(--fs-2xs)}',
      /* Highlight is background + weight + rule, never hue alone
         (FinalGUISpec.md:1237). Three channels, so it survives both the dead
         --accent-soft above and any monochrome rendering. */
      '.vD-hl{background:var(--accent-soft,var(--surface-elevated));font-weight:700;',
      'box-shadow:inset 0 -2px 0 var(--accent-primary,var(--accent-blue));',
      'border-radius:var(--radius-xs);padding:0 1px}',
      /* ---- condensed blocked marker carried down the stack ---- */
      '.vD-flag{display:flex;align-items:center;gap:var(--sm);flex:none;min-height:24px;',
      'padding:2px var(--md);border-bottom:var(--border-width,1px) solid var(--border);',
      'border-left:3px solid var(--accent-warning);background:var(--surface);min-width:0}',
      '.vD-flag-c{flex:1 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;',
      'font-family:var(--mono-font);font-size:var(--fs-2xs);color:var(--accent-warning)}',
      /* ---- persistent effective-capability strip ----
         The one place the panel says what you can and cannot do in WORDS
         rather than by greying a control, so it is frame chrome: it renders
         at every level and every bucket and it WRAPS instead of eliding. A
         capability sentence cut at "You can view runs but cannot dis..." has
         stopped being a capability sentence. Neutral rail, deliberately NOT
         the warning rail of .vD-flag -- an archived repository is readable,
         not broken, and borrowing the warning colour would overstate it. */
      '.vD-cap{display:flex;flex-direction:column;gap:1px;flex:none;min-width:0;',
      'padding:3px var(--md);border-bottom:var(--border-width,1px) solid var(--border);',
      'border-left:3px solid var(--text-muted);background:var(--surface)}',
      '.vD-cap-c{font-family:var(--mono-font);font-size:var(--fs-2xs);',
      'color:var(--text-secondary);overflow-wrap:anywhere}',
      '.vD-cap-s{font-size:var(--fs-2xs);line-height:var(--lh-body);',
      'color:var(--text-secondary)}',
      /* ---- misc ---- */
      '.vD-1{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;min-width:0}',
      '.vD-role{flex:none;min-width:52px;font-size:var(--fs-2xs);font-weight:700;',
      'color:var(--text-secondary);white-space:nowrap}',
      '.vD-log{display:block;padding:2px var(--md);font-family:var(--mono-font);',
      'font-size:var(--fs-2xs);color:var(--text-secondary);white-space:nowrap;',
      'overflow:hidden;text-overflow:ellipsis}'
    ].join('');
    document.head.appendChild(s);
  })();

  /* ============================================== the back-stack (risk 3)
     Module-local, keyed by panel id. stack.length IS the depth: [] is the
     hub, [f] is L1, [f,g] is L2, [f,g,h] is L3. A frame is
     { id, title, arg } and nothing else — it must stay serialisable because
     in Slint it is a struct in a VecModel, not a closure. */
  var DEFAULT_STACK = {
    /* Search is the one panel that does NOT open on its hub. Searching is the
       panel's reason to exist, so Find is the default L1 and the hub is one
       Back away. Every other panel opens on its hub. */
    search: [{ id: 'find', title: 'Find', arg: null }],
    source: [], git: [], docker: [], tests: [], agents: [], artifacts: []
  };
  var STACK = {};
  var ACCOUNT = null;

  function resetStacks() {
    for (var k in DEFAULT_STACK) {
      if (Object.prototype.hasOwnProperty.call(DEFAULT_STACK, k)) {
        STACK[k] = DEFAULT_STACK[k].slice();
      }
    }
  }
  resetStacks();

  function stackOf(p) { return STACK[p] || (STACK[p] = []); }

  /* FinalGUISpec.md:686 / :713 — on effective-account change the panel hard
     refreshes or clears stale selections, and storage-plan.md:1060 invalidates
     pins and last-opened run/job/log focus with it. A back-stack IS a selection
     chain, so the whole chain drops. */
  function accountGuard(D) {
    var eff = D.actions.connection.effective;
    if (ACCOUNT === null) { ACCOUNT = eff; return; }
    if (ACCOUNT !== eff) { ACCOUNT = eff; resetStacks(); }
  }

  /* ------------------------------------------------------ nav, delegated
     Bound once on the document. Rows carry data-vd-go / data-vd-back, so
     nothing here needs to know which panel or stage it is looking at beyond
     reading data-pm-panel off the stage. */
  var wired = false;
  function wire() {
    if (wired) return;
    wired = true;

    /* THE CONFIRMATION GATE, both carriers. Registered BEFORE the navigation
       handlers so a gated control never also navigates -- see the matching
       guard in hit(), which is what actually guarantees it. */
    document.addEventListener('pm:menuaction', function (e) {
      var v = String((e.detail && e.detail.action) || '');
      if (v.indexOf(GATE) !== 0) return;
      if (!inVD(e.target)) return;
      e.stopPropagation();
      runConfirm(v.slice(GATE.length), e.target);
    }, false);
    document.addEventListener('click', function (e) {
      var n = e.target && e.target.closest ? e.target.closest('[data-vd-confirm]') : null;
      if (!n || n.getAttribute('aria-disabled') === 'true') return;
      if (!inVD(n)) return;
      e.preventDefault();
      e.stopPropagation();
      runConfirm(n.getAttribute('data-vd-confirm'), n);
    }, false);

    document.addEventListener('click', function (e) {
      var t = hit(e.target);
      if (t && apply(t)) { e.preventDefault(); e.stopPropagation(); rerender(); }
    }, false);
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Enter' && e.key !== ' ' && e.key !== 'Spacebar') return;
      var t = hit(e.target);
      if (t && apply(t)) { e.preventDefault(); e.stopPropagation(); rerender(); }
    }, false);
  }

  /** Is this node inside a vD stage? The confirmation handlers are on the
   *  document and nine other versions share it. */
  function inVD(node) {
    var stage = node && node.closest ? node.closest('[data-pm-version]') : null;
    return !!stage && stage.getAttribute('data-pm-version') === 'vD';
  }

  function hit(node) {
    if (!node || !node.closest) return null;
    /* menus, selects and portals own their own clicks */
    if (node.closest('[data-pm-portal], .pm-menu, .pm-select')) return null;
    /* and so does a gated control. A confirm button can sit inside a row that
       is itself a stack push (the hub's inline action slot), and navigating
       away while the sheet opens would leave the sheet describing a level the
       panel is no longer on. */
    if (node.closest('[data-vd-confirm]')) return null;
    var t = node.closest('[data-vd-go], [data-vd-back], [data-vd-home]');
    if (!t) return null;
    var stage = t.closest('[data-pm-version]');
    if (!stage || stage.getAttribute('data-pm-version') !== 'vD') return null;
    var panel = stage.getAttribute('data-pm-panel');
    return panel ? { el: t, panel: panel } : null;
  }

  /* Direction of the navigation that is about to cause a re-render. Read and
     cleared by pushFrames() immediately afterwards; it is a one-shot baton
     between "the stack changed" and "the new frame is in the document", not
     state. In Slint this is the direction property the frame's animate x
     reads, set by stack.push / stack.remove. */
  var NAV_DIR = null;

  function apply(t) {
    var n = t.el, st = stackOf(t.panel);
    if (n.hasAttribute('data-vd-home')) { STACK[t.panel] = []; NAV_DIR = 'back'; return true; }
    if (n.hasAttribute('data-vd-back')) { st.pop(); NAV_DIR = 'back'; return true; }
    if (n.getAttribute('aria-disabled') === 'true') return false;
    st.push({
      id: n.getAttribute('data-vd-go'),
      title: n.getAttribute('data-vd-title') || n.getAttribute('data-vd-go'),
      arg: n.getAttribute('data-vd-arg') || null
    });
    NAV_DIR = 'fwd';
    return true;
  }

  /* The harness re-renders every stage on any state change, so a throwaway
     key is all a push needs. writeHash() only serialises the known keys. */
  function rerender() {
    var B = global.PM_BAKEOFF;
    if (!B || !B.setState) return;
    B.setState({ vdTick: ((B.state && B.state.vdTick) || 0) + 1 });
    pushFrames();
  }

  /* ------------------------------------------- MOTION: shared primitive 2
     PMM.push(host, dir) -- _pm-motion.css .pmm-frame. Deeper enters from the
     right, Back enters from the left; the DIRECTION is the whole message,
     which is why the level is pushed here rather than given a class in the
     markup. Two consequences of pushing from here rather than from the
     markup string, both deliberate:

       - a re-render that is NOT a navigation (theme, width, density, the
         resizer's per-mousemove setState) does not animate. A frame that
         slides on every mousemove of a drag is a strobe, not motion.
       - the fit rig never sees it. runMatrix() builds its stages offscreen
         and never through this path, and its kill sheet drops animations
         anyway, so the sweep measures the settled frame exactly as before.

     setState() renders synchronously, so the new frames are already in the
     document by the time it returns -- no rAF, no observer.

     The host is .pmk-panel, i.e. the WHOLE level including its back bar. In
     a stack navigator the bar's title is the frame's identity, not chrome
     that outlives it, so it travels with the body. Nothing is wrapped and
     nothing is added to the markup: .pmk-panel already exists and is already
     the only child of the panel view. */
  function pushFrames() {
    var dir = NAV_DIR;
    NAV_DIR = null;
    if (!dir || !global.PMM) return;
    var stages = document.querySelectorAll(
      '#stageWrap .pm-stage[data-pm-version="vD"]');
    for (var i = 0; i < stages.length; i++) {
      var host = stages[i].querySelector('[data-pm-panelview] > .pmk-panel');
      if (host) global.PMM.push(host, dir);
    }
  }

  /* ==================================================== width arithmetic
     idChars is computed against the WIDEST family (basic: Inter 15px +
     0.02em tracking) regardless of the live theme. Two reasons: the harness
     hands a panel function the globally selected theme, not the per-stage
     one, so state.theme is wrong for 7 of 8 contact-sheet stages; and
     budgeting for the worst case is what lets ONE number be correct in all
     eight themes, which is also what ports to Slint. */
  function chars(state, reserved) { return PMK.idChars(state.width, 'basic', reserved || 0); }

  /* Identity budget for one PMK.row. PMK.row adds the tail at bucket >= 1 and
     the meta run / chip at bucket >= 2, so a row's identity share does NOT
     simply grow with the band -- each slot that appears takes its cut first.
     Declaring which slots a row uses keeps that arithmetic in one place, which
     is also the only form that ports: in Slint these are four integer
     constants selected by the bucket int, not a text measurement. */
  function idCap(state, b, o) {
    o = o || {};
    var r = o.extra || 0;
    if (o.tail && b >= 1) r += 40;
    if (o.meta && b >= 2) r += 100;
    if (o.chip && b >= 2) r += 40;
    return chars(state, r);
  }

  /* Characters of a MONO reason code that fit the second line of a two-line
     row. idChars is the wrong instrument here twice over: it budgets the
     identity slot, and it is calibrated against the 11px body face. This slot
     is --fs-2xs in --mono-font inside .pmk-id-stack.

     MEASURED, in all eight themes, at all four widths. The stack box is 171px
     at 240px in every theme -- the row spends 21px on the status mark and 24px
     on the reserved overflow, and the list and row padding take the rest --
     and it gains the full band above that, less the 44px the time tail takes
     from bucket 1. The widest mono is basic's at 6.32px per character, so 6.4
     is the honest divisor and 26 characters is what the narrowest band
     actually holds.

     Which means one code in the fixture does not fit: remediation_ceiling_
     exceeded is 28 characters and needs 177px in a 171px box. It is cut HERE,
     with a computed ellipsis at a known character, rather than left to a CSS
     clip -- and research/agents.md:91 already recorded that this code needs
     its own line at 240px, which is what it now has. The full code is one tap
     down in the record's blocked banner, where .pmk-blocked-code wraps. */
  function codeCap(state, b) {
    var box = state.width - 69 - (b >= 1 ? 44 : 0);
    return Math.max(8, Math.floor(box / 6.4));
  }

  /* The same arithmetic for a mono code in a fixed .pmk-strip, which has no
     status gutter and no time tail. Measured box is width - 62 with the
     leading glyph and width - 44 without, in all eight themes.

     The glyph is DROPPED at 240px, and that is the whole reason this helper
     is separate: redaction_profile_unavailable is 29 characters and needs
     184px against basic's mono, which does not fit the 178px the glyph leaves
     but does fit the 196px it does not. A 14px decoration that costs the
     reason code its last three characters is the wrong trade in a gate whose
     entire job is to name the reason. The warning tone is carried by
     .vD-flag-c's colour, which survives the glyph going. */
  function stripCap(state, b) {
    var box = state.width - (b >= 1 ? 62 : 44);
    return Math.max(8, Math.floor(box / 6.4));
  }

  /* =================================================== markup primitives */

  function field(value, placeholder, tip) {
    return '<input class="pmk-field" type="text" value="' + esc(value || '') +
      '" placeholder="' + esc(placeholder || '') + '"' +
      (tip ? ' data-pm-tip="' + esc(tip) + '"' : '') + '>';
  }

  /* Turn any kit row into a stack push. String surgery on purpose: it keeps
     PMK.row's slot discipline (one growing identity, tails drop whole) as the
     single source of truth instead of forking it. */
  function nav(html, go, title, arg) {
    return html.replace('<div class="pmk-row',
      '<div data-vd-go="' + esc(go) + '" data-vd-title="' + esc(title) + '"' +
      (arg ? ' data-vd-arg="' + esc(arg) + '"' : '') + ' class="pmk-row');
  }

  /* L0 row: [glyph][name][count][status mark][chevron], + summary at b>=2,
     + one inline action at b>=3. */
  function hubRow(o) {
    var b = o.bucket;
    var h = '<div class="pmk-row vD-hub' + (o.off ? ' vD-off' : '') + '"' +
      (o.go ? ' data-vd-go="' + esc(o.go) + '" data-vd-title="' + esc(o.title || o.name) + '"' : '') +
      (o.arg ? ' data-vd-arg="' + esc(o.arg) + '"' : '') +
      ' tabindex="0" role="button">';
    h += '<span class="vD-glyph">' + ic(o.glyph || 'circle', 14) + '</span>';
    if (b >= 2 && o.summary) {
      h += '<span class="pmk-id-stack"><span>' + esc(o.name) + '</span>' +
           '<span class="pmk-note">' + esc(o.summary) + '</span></span>';
    } else {
      h += '<span class="pmk-id">' + esc(o.name) + '</span>';
    }
    if (o.count) h += '<span class="vD-count">' + esc(o.count) + '</span>';
    if (o.status) h += PMK.statusMark(o.status);
    if (b >= 3 && o.action) h += PMK.btn(o.action.label, o.action);
    h += '<span class="vD-chev">' + ic('chev', 12) + '</span>';
    return h + '</div>';
  }

  function hubList(rows) { return '<div class="vD-list">' + rows.join('') + '</div>'; }

  function backBar(frame, cfg, b, depth) {
    var h = '<div class="vD-back">';
    h += '<button type="button" class="vD-backbtn" data-vd-back ' +
         'data-pm-tip="Back to ' + esc(depth > 1 ? cfg.stack[depth - 2].title : cfg.title) + '">' +
         ic('back', 12) + (b >= 1 ? '<span>Back</span>' : '') + '</button>';
    h += '<span class="vD-backttl">' + esc(el(frame.title, null, chars(cfg.state, 84))) + '</span>';
    if (depth >= 2) {
      h += '<button type="button" class="vD-backbtn" data-vd-home ' +
           'data-pm-tip="Back to the ' + esc(cfg.title) + ' hub">' + ic('square', 12) + '</button>';
    }
    h += PMK.overflow(cfg.levelActions || [{ value: 'copy', label: 'Copy identity' }], 'Level actions');
    return h + '</div>';
  }

  /* KV block. Stacked below 380px, inline for token/badge kinds above it,
     two columns at 480px. The kit's kv() already owns the inline/stacked
     rule and its 88px hard floor; this only owns the column count. */
  function kvs(list, b) {
    var h = '<div class="vD-kvs' + (b >= 3 ? ' vD-kvs--2' : '') + '">';
    (list || []).forEach(function (kv) {
      if (!kv || kv[1] == null || kv[1] === '') return;
      h += PMK.kv(kv[0], kv[1], kv[2] || 'token', b);
    });
    return h + '</div>';
  }

  /* Action bar. ONE button at 240 -- at that width anything that is not the
     single primary action belongs in the overflow, and two buttons leaves 89px
     each, which ellipsises any label past ten characters. Two at 320, three at
     380 and 480. Measured, not guessed: at cap 4 the 480 bar cuts labels like
     "Compare last success". Everything past the cap falls into the reserved
     overflow slot rather than shrinking a control below 24px. */
  function actionBar(items, b, flat) {
    items = (items || []).filter(Boolean);
    if (!items.length) return '';
    var n = [1, 2, 3, 3][b];
    var shown = items.slice(0, n), rest = items.slice(n);
    var h = '<div class="pmk-btnrow' + (flat ? '' : ' vD-acts') + '">';
    shown.forEach(function (a) { h += gbtn(a.label, a); });
    if (rest.length) {
      h += PMK.overflow(rest.map(function (a) {
        /* value, not label. An action-bar item that ask() has gated carries
           its gate token in value, and the bar's cap decides at render time
           whether that item is a button or a menu row -- so the token has to
           survive BOTH paths or the gate would apply at 480px and not at
           240px, which is the width it matters most at. */
        return { value: a.value || a.label, label: a.label, danger: a.danger,
                 disabled: a.disabled, reason: a.reason, sentence: a.sentence };
      }), 'More actions');
    }
    return h + '</div>';
  }

  function note(text) { return '<div class="pmk-note vD-note">' + esc(text) + '</div>'; }

  /* ================================================ THE CONFIRMATION GATE
     BLIND SPOT 20, and it is a correction to this file's own comment at the
     Tests panel, which read "needsConfirm has nowhere to land". It had a
     landing place the whole time. PM.confirm is defined at
     _pm-components.js:498 -- a real modal sheet with a scrim, role="dialog",
     aria-modal, focus capture, Escape-to-cancel and NO auto-close, documented
     at :9 as the replacement for confirm(). It is wired, it is mounted, and
     until now not one of the fifteen designs called it.

     GitHub_Integration.md:L156 is the requirement, and it is worth quoting
     because it names three things and this gate has to deliver all three:
     "strong Source Control actions that may discard local state, remove
     artifacts or /worktrees, revoke accepted state, or materially change live
     execution show SCOPE, CONSEQUENCE, and CONFIRMATION BOUNDARIES before
     execution."

       scope        WHAT exactly is affected, named from the fixture -- the
                    file path, the branch, the container, the run number, the
                    count of matches. Never "this item".
       consequence  what it costs and whether it comes back. This is the half
                    a danger colour cannot express: red says "careful", it
                    does not say "the working-tree edits are lost".
       boundary     the modal itself. A sheet with no auto-close, focus
                    captured, and a verb on the confirm button rather than
                    "OK" -- so the last thing read before committing is the
                    action, not an acknowledgement.

     WHAT WAS SHIPPING BEFORE. Every destructive action in this file was a
     one-click menu item with danger:true and nothing else: Discard changes,
     Discard all changes, Remove worktree, Prune stale worktrees, Drop stash,
     Revert, Delete branch, Replace / Replace all, Evict remote cache, Prune
     stopped, Prune dangling, Prune unused, Stop, Delete container, Delete
     image, Compose down, Remove host, Remove registry, Delete secret, Cancel
     run, Disconnect, Remove from view, Run cleanup, and the three exports.
     One tap, no gate, on a 240px band where the tap target next to Discard is
     Stage.

     EGRESS IS ITS OWN CASE. Export is not destructive -- nothing is lost --
     but it moves a record OUT of the workspace, and for an evidence record
     that is the one operation that cannot be taken back. Those gates carry a
     REDACTION ATTESTATION computed from the row's own metadata rather than a
     generic warning: how many of the records leaving carry a redaction
     marker, counted here, so the confirmation states a fact instead of a mood.

     THE FIXTURE ASKS FOR THIS EXPLICITLY IN TWO PLACES, and both are now
     honoured rather than commented about:
       _pm-data.js:1176  cancel_run "is destructive-adjacent and needs a
                         confirm the kit cannot currently express" -- it can;
                         Cancel now routes through the sheet in Actions, Tests
                         and Agents.
       _pm-data.js:1292  testing.authorize_unredacted ships destructive: true
                         AND needsConfirm: true. That route un-suppresses an
                         artifact whose secrets were not masked. It was a
                         one-click menu item.

     HOW IT ATTACHES, and why it needs no new component. A gated control
     carries a TOKEN in the one field that survives both of the kit's
     rendering paths -- value. PMK.overflow serialises value into
     data-value and pm-menu hands it back on pm:menuaction; PMK.btn does not
     serialise it at all, so gbtn() below re-attaches it as data-vd-confirm by
     the same string-surgery idiom nav() uses. The payload itself never enters
     the markup: it lives in CONFIRM, keyed by act + subject, rebuilt on every
     render and therefore bounded by the fixture rather than by session length.

     ONE GAP, REPORTED NOT PATCHED. PM.ctx (the right-click menu) RESOLVES a
     promise instead of dispatching an event, and nothing consumes it, so a
     row's context-menu copy of a gated action cannot reach the gate. Making
     ctx dispatch pm:menuaction the way pm-menu does is a four-line shared-file
     change and every version needs it; this file must not make it on the
     other versions' behalf. The overflow button is the primary path and it is
     gated. */
  var CONFIRM = {};       /* key -> payload */
  var CONFIRM_KEY = {};   /* act + subject -> key */
  var confirmN = 0;
  var GATE = 'vd-confirm~';

  /** Register a confirmation payload and return the key a control carries.
   *  def = { act, on, title, scope, consequence, verb, danger, actionId }
   *
   *  The key is an OPAQUE counter, not the subject string, and that is
   *  deliberate: it travels through two HTML attributes and back, and a
   *  subject like a commit subject line or an artifact title would arrive
   *  entity-escaped and fail its own lookup. It is stable across re-renders
   *  because the act-plus-subject index persists, so a control keeps the same
   *  key when the panel is redrawn under a different theme or width, and the
   *  map is bounded by the fixture rather than by session length. */
  function register(def) {
    var id = def.act + '~' + (def.on || '');
    var key = CONFIRM_KEY[id];
    if (!key) { key = 'c' + (++confirmN); CONFIRM_KEY[id] = key; }
    CONFIRM[key] = def;
    return key;
  }

  /** Route ONE menu item or action-bar item through PM.confirm. Mutates and
   *  returns the item, so it reads inline at the call site.
   *  A DISABLED item is never gated: it cannot execute, and a confirmation
   *  sheet over a control that does nothing would teach the wrong lesson
   *  about what the sheet means. */
  function ask(item, def) {
    if (!item || item.disabled) return item;
    item.value = GATE + register(def);
    return item;
  }

  /** PMK.btn, plus the gate token as data-vd-confirm when the item carries
   *  one. String surgery on the kit's output, the nav() idiom -- PMK.btn
   *  taking a data attribute is the right home for this and every version
   *  needs it, but the shared file is not this one's to change. */
  function gbtn(label, o) {
    var html = PMK.btn(label, o);
    var v = o && o.value;
    if (!v || o.disabled || String(v).indexOf(GATE) !== 0) return html;
    return html.replace('<button type="button"',
      '<button type="button" data-vd-confirm="' + esc(String(v).slice(GATE.length)) + '"');
  }

  /** THE THIRD CARRIER. PMK.blocked builds its own action buttons and stamps
   *  the action id into data-pm-action, so a gated id arrives there as the
   *  token instead of as an id. This puts both back: the real command id in
   *  data-pm-action, where the port will read it, and the key in
   *  data-vd-confirm, where the gate reads it. Same string-surgery idiom as
   *  gbtn() and nav(), for the same reason -- K.blocked growing a per-action
   *  confirm hook is a shared-file change and every version needs it. */
  function gateBanner(html) {
    return String(html).replace(/data-pm-action="vd-confirm~([A-Za-z0-9]+)"/g,
      function (m, key) {
        var d = CONFIRM[key] || {};
        return 'data-pm-action="' + esc(d.actionId || '') + '" data-vd-confirm="' + key + '"';
      });
  }

  /* The sheet. Title asks, body states scope then consequence, the confirm
     button carries the VERB.

     THE DISMISS LABEL IS NOT ALWAYS "CANCEL", and finding that out is the
     argument for rendering a design and reading it rather than trusting that
     it fits. On the three cancel-a-run gates the sheet came out with two
     buttons reading "Cancel" and "Cancel" -- the dismissal and the
     destructive confirmation, side by side, spelled identically. The word is
     the panel's own vocabulary for an operation AND the modal convention for
     backing out, and a confirmation whose two answers read the same is worse
     than no confirmation, because it invites the wrong one under time
     pressure. Those gates name the dismissal for what it does instead
     ("Keep running"), which is also the clearer instruction. */
  function runConfirm(key, from) {
    var def = CONFIRM[key];
    if (!def || !global.PM || !global.PM.confirm) return false;
    global.PM.confirm({
      title: def.title,
      body: def.scope + ' ' + def.consequence,
      confirmLabel: def.verb,
      cancelLabel: def.keep || 'Cancel',
      danger: def.danger !== false,
      from: from
    });
    return true;
  }

  /* ------------------------------------------------ accessible-name ORDER
     PMK.statusMark emits role="img" with the status label as its accessible
     name, and the mark is the FIRST element in a row and in an object header
     -- so whatever it says is the first thing a screen-reader user hears
     about that row. For a status that is correct. For a worktree it is the
     BROKE-3 defect in its purest form: PM_DATA.status labels 'disabled' as
     "Unavailable", and thread/ratings-schema is 'disabled' only because its
     lifecycle is 'released' -- merged cleanly into main and kept for lineage.
     The row therefore announced "Unavailable. thread/ratings-schema." with
     the reserved word appearing nowhere in the accessible name at all, while
     the visible Lifecycle KV one level down said 'released'. Fixing the
     visible half and leaving this is fixing it for sighted users only.

     So the reserved word is PREFIXED into that same label and the status
     label follows it -- lifecycle first, status second, which is the clause
     order the finding asks for. Nothing is removed: the status is still
     spoken, still drawn as a glyph, and still drawn as a rail dash.

     String surgery on the kit's output rather than an edit to _pm-kit.js, on
     purpose -- the same idiom nav() uses. K.statusMark taking an optional
     lead clause is the right home for this and every version needs it, but
     the shared file is not this one's to change. REPORTED, not patched. */
  function sayFirst(html, lead) {
    if (!lead) return html;
    return html.replace(' role="img" aria-label="',
                        ' role="img" aria-label="' + esc(lead) + '. ');
  }

  /* ------------------------------------------------ allowed_action_ids
     The fixture supplies an ORDERED allowed_action_ids array on blocked rows
     in Agents, Tests and Actions, and the sets differ per row: the only thing
     that unblocks Deploy Sentinel is grant_authority, while Schema
     Cartographer is self-restoring and allows open_for_edit and nothing else.
     A fixed action set therefore offers "Abort node" beside a sentence saying
     no action is needed. So the actions are READ, never assumed.

     There is no label catalogue in _pm-data.js, so the label is DERIVED from
     the id rather than minted: last dot segment, underscores to spaces, first
     letter raised. orchestrator.grant_authority becomes "Grant authority" and
     nothing is invented. Where the fixture DOES carry a label for an id
     (tests.redactionFailed.authorize) that label wins, which is what the
     'labels' map is for. The full id travels in the menu hint so the
     derivation is never the only record of what the control dispatches.

     REPORTED, NOT PATCHED HERE. This belongs in _pm-kit.js -- all seven
     versions need the same read, and K.blocked additionally ignores the
     'severity' field the fixture ships, so the 'warning' tier renders
     nowhere. Both are shared-layer edits and this file must not make them on
     the other versions' behalf. */
  function actionLabel(id, supplied) {
    if (supplied) return supplied;
    var s = String(id == null ? '' : id);
    var tail = s.slice(s.lastIndexOf('.') + 1).replace(/_/g, ' ');
    return tail ? tail.charAt(0).toUpperCase() + tail.slice(1) : s;
  }

  /* allowed_action_ids -> overflow / action-bar items, order preserved. */
  function allowedActions(ids, labels, danger) {
    return (ids || []).map(function (id) {
      return { value: id, label: actionLabel(id, labels && labels[id]), hint: id,
               danger: !!(danger && danger[id]) };
    });
  }

  function subList(label, count, rows) {
    return '<div class="vD-sub">' + PMK.section(label, count, true) +
      '<div class="vD-list">' + rows.join('') + '</div></div>';
  }

  /* =================================================== THE ONE HELPER
     Every one of the seven panels calls exactly this. It owns the frame
     (header or back bar, persistent strips, pinned footer, the 480 split)
     and nothing else; panels own only the content of a level.

     cfg = { panel, title, state, bucket, stack,
             hub(b)  -> { rows, banner, primary, count }
             view(stack, b) -> { kind:'list'|'object', ... }
             persist(depth, b) -> html | ''      (never scrolls)
             levelActions -> overflow items for the back bar } */
  function stackFrame(cfg) {
    var b = cfg.bucket, st = cfg.stack, depth = st.length;
    var parts = [];

    if (depth === 0) {
      var hub = cfg.hub(b);
      parts.push(PMK.head(cfg.title, hub.count || '',
        PMK.overflow(cfg.levelActions || [{ value: 'refresh', label: 'Refresh' }], 'Panel actions')));
      if (cfg.persist) parts.push(cfg.persist(0, b));
      parts.push(PMK.body((hub.banner || '') + hubList(hub.rows), false));
      if (hub.primary) parts.push('<div class="vD-pin">' + hub.primary + '</div>');
      return PMK.panel(parts);
    }

    var frame = st[depth - 1];
    var view = cfg.view(st, b) || { kind: 'list', rows: '' };
    cfg.levelActions = view.actions4menu || cfg.levelActions;
    parts.push(backBar(frame, cfg, b, depth));
    if (cfg.persist) parts.push(cfg.persist(depth, b));

    if (b === 3 && depth >= 2) {
      /* VERTICAL split only. Horizontal would hand each pane ~232px and
         reintroduce the 240px problem inside a 480px panel. */
      var up = cfg.view(st.slice(0, depth - 1), b) || { kind: 'list', rows: '' };
      parts.push('<div class="vD-split">' +
        '<div class="vD-pane vD-pane--t">' + levelBody(up, b, cfg.state) + '</div>' +
        '<div class="vD-pane vD-pane--b">' + levelBody(view, b, cfg.state) + '</div>' +
        '</div>');
    } else {
      if (view.toolbar) parts.push(PMK.strip(view.toolbar));
      parts.push(PMK.body(levelBody(view, b, cfg.state), false));
    }
    if (view.footer) parts.push('<div class="vD-pin">' + view.footer + '</div>');
    return PMK.panel(parts);
  }

  /* The L2 identity header is 12px bold, not the 11px row face, and it sits
     in a bar with no overflow slot -- so it gets its own budget rather than
     idChars'. Pre-eliding here means the cut is ONE computed ellipsis at a
     known character, not a CSS clip layered on top of a JS one. */
  function identCap(state, b, hasMark, hasWord) {
    var avail = state.width - 16 - (hasMark ? 29 : 0) - (b >= 2 && hasWord ? 62 : 0);
    return Math.max(8, Math.floor(avail / 7.0));
  }

  function levelBody(v, b, state) {
    if (!v) return '';
    if (v.kind === 'object') {
      var h = '';
      if (v.ident) {
        h += '<div class="vD-obj"><div class="vD-obj-h">' +
             (v.status ? sayFirst(PMK.statusMark(v.status), v.say) : '') +
             '<span class="vD-obj-t">' +
             esc(el(v.ident, v.identKind || null,
                    identCap(state, b, !!v.status, !!v.statusWord))) + '</span>' +
             (b >= 2 && v.statusWord ? '<span class="vD-count">' + esc(v.statusWord) + '</span>' : '') +
             '</div></div>';
      }
      if (v.blocked) h += v.blocked;
      if (v.note) h += note(v.note);
      h += kvs(v.kvs, b);
      if (v.acts) h += v.acts;
      (v.subs || []).forEach(function (s) { h += s; });
      return h;
    }
    var body = '';
    if (v.before) body += v.before;
    body += v.rows ? '<div class="vD-list">' + v.rows + '</div>' : (v.empty || '');
    if (v.after) body += v.after;
    return body;
  }

  /* Condensed one-line blocked marker. The full PMK.blocked with its ordered
     action buttons lives on the hub; deeper levels carry the CODE verbatim so
     the block never silently disappears when you descend, with a tap back to
     where the actions are. GI-017 / GAAAF-005 / CRAU-021 all forbid a native
     title tooltip as the only carrier. */
  function blockedFlag(code) {
    return '<div class="vD-flag" data-vd-home tabindex="0" role="button" ' +
      'data-pm-tip="Open the blocked banner on the hub">' +
      '<span class="vD-flag-c">' + esc(code) + '</span>' +
      '<span class="vD-chev">' + ic('chev', 12) + '</span></div>';
  }

  /* ====================================================================
     PANEL 1 — SEARCH
     Find is the default L1: searching is the panel's reason to exist, so the
     hub sits behind it rather than in front of it. The Index hub row is the
     whole answer to research/search.md's finding that the 130px index card
     duplicates the status bar's job (FinalGUISpec.md:562-567): the card
     becomes ONE 28px hub row carrying the document count, and the seven
     settings-shaped index controls live one tap down at L1 instead of above
     the query field. That is a 100px saving on the panel's most valuable
     region, paid for with a tap nobody takes during a search.
     ==================================================================== */
  function pSearch(D, state) {
    var b = D.bucket(state.width);
    accountGuard(D);
    var S = D.search;

    /* Window the source line ON THE MATCH, not on column 0 (research/search.md
       section 6.3). Leading indentation is dropped, up to 8 characters of
       context precede the hit, the remainder follows, and an ellipsis marks
       each side that lost characters. If the hit itself is wider than the
       band the hit is truncated on the RIGHT and its left edge is kept, so
       the highlight can never scroll out of view. */
    function window_(hitObj, cap) {
      var pre = String(hitObj.pre).replace(/^\s+/, '');
      var mid = String(hitObj.hit);
      var post = String(hitObj.post);
      if (mid.length >= cap - 2) {
        return { l: '', m: mid.slice(0, Math.max(1, cap - 3)) + ELL, r: '' };
      }
      var cutL = false, left = pre;
      if (left.length > 8) { left = left.slice(left.length - 8); cutL = true; }
      var room = cap - left.length - mid.length - (cutL ? 1 : 0);
      if (room < 0) room = 0;
      var cutR = false, right = post;
      if (right.length > room) { right = right.slice(0, Math.max(0, room - 1)); cutR = true; }
      return { l: (cutL ? ELL : '') + left, m: mid, r: right + (cutR ? ELL : '') };
    }

    function matchRow(f, hitObj) {
      /* 12px reserve, not the usual 21+: a match row has NO status gutter --
         the line number takes that slot -- and it renders 10px mono, which is
         narrower than the 11px body face idChars is calibrated against. Those
         two together are worth four more characters of the match window at
         240px, which is the single most valuable real estate in the panel. */
      var w = window_(hitObj, chars(state, 12));
      return '<div class="pmk-row vD-hit" tabindex="0" role="button" data-pm-ctx="Row actions">' +
        '<span class="vD-ln">' + esc(hitObj.line) + '</span>' +
        '<span class="vD-code">' + esc(w.l) +
          '<b class="vD-hl">' + esc(w.m) + '</b>' + esc(w.r) + '</span>' +
        PMK.overflow([
          { value: 'open', label: 'Open result' },
          ask({ label: 'Replace this match', danger: true }, {
            act: 'replace_one', on: f.path + ':' + hitObj.line,
            title: 'Replace this match?',
            scope: 'One match in ' + f.path + ' at line ' + hitObj.line + '.',
            consequence: 'The file is written on disk. This panel has no undo for it.',
            verb: 'Replace'
          }),
          { value: 'copy', label: 'Copy path and line' }
        ]) + '</div>';
    }

    function results() {
      var h = '';
      S.files.forEach(function (f) {
        h += PMK.section(el(f.path, 'path', chars(state, 40)), f.count, true);
        h += '<div class="vD-list">' + f.hits.map(function (x) { return matchRow(f, x); }).join('') + '</div>';
      });
      return h;
    }

    /* ------------------------------------------------------------ BROKE-7
       The index state is a SIX-value vocabulary and S.index.states ships the
       exact line for each one -- 'Stale - refreshing', 'Fallback - raw
       ripgrep', 'Indexing off - grep only', 'Index build cancelled'. This was
       'state === 'ok' ? 'Indexed' : state', which printed the bare lowercase
       enum for five of the six and, under 'disabled' and 'cancelled',
       presented a build anchor and a build age as current facts about an index
       that is off or whose generation was discarded.

       Two rules, both taken from the DATA rather than from a comment -- which
       is exactly how vC's vocabulary map went stale against this same array:

         - the LINE comes from states[], matched on id. The live token is 'ok'
           and the shipped vocabulary spells the healthy state 'indexed', so
           that single alias is stated here and nowhere else. An id the array
           does not carry renders VERBATIM and raises NO status mark: a raw
           token is honest, and a confident wrong sentence -- or a terminal
           failure wearing the queued circle -- is not.
         - the BUILD ANCHOR is a current fact only while the index is serving.
           annotateRows is the fixture's own flag for "these results are not
           index-backed", so it gates the anchor as well as the row badges. */
    var IDX_TOKEN = { indexed: 'ok', stale: 'stale', unindexed: 'attention',
                      fallback: 'attention', disabled: 'disabled', cancelled: 'cancelled' };

    function readIndex() {
      var want = S.index.state === 'ok' ? 'indexed' : S.index.state;
      var d = null;
      (S.index.states || []).forEach(function (s) { if (s.id === want) d = s; });
      return {
        id: want,
        line: d ? d.line : String(S.index.state),
        annotate: d ? !!d.annotateRows : true,
        token: d ? (IDX_TOKEN[want] || null) : null
      };
    }
    var IX = readIndex();

    /* ----------------------------------------------------- BLIND SPOT 15
       Two facts the fixture carries and this panel rendered NEITHER, and the
       pair of them is the cheapest high-value fix in the panel because each
       one turns a control that currently lies into one that tells the truth.

       1. search.remote. available:false, state 'unavailable', reason
          'remote_acceleration_unavailable', and a ready-made sentence:
          "Remote search acceleration is unavailable. These results are local
          only." silentFallback:false is the load-bearing flag -- the contract
          is that a fallback to local is STATED, never silent, and a panel that
          renders 48 matches with no remark is the silent fallback the flag
          exists to forbid. So the sentence gets a destination of its own, and
          the host and the check age go with it, because "unavailable" about an
          unnamed host is not actionable.

       2. Evict remote cache was offered THREE times -- level menu, search
          menu, Index action bar -- for a service the same fixture says is
          down. Now it is visible and DISABLED at all three, carrying the
          reason code verbatim and the fixture's own sentence, which is the
          same treatment this file already gives an archived repository in
          Actions: a capability limit shows as a capability STATE, never as a
          missing control.

       3. index.lastBuild. A terminal 'cancelled' state with its own line,
          a detail sentence, an age, partialDiscarded:true, resumable:false
          and a single action whose label is 'Start a fresh build' -- which is
          the fixture saying, in a label, that Rebuild is not a resume. All of
          it rendered nowhere. It goes on the Index object under its own
          heading: the live index is 'ok', so stating the cancellation as the
          CURRENT state would be a second falsehood in the opposite direction.
          It is the last BUILD that was cancelled, and it is labelled that. */
    var RM = S.remote || {};
    var LB = S.index.lastBuild || null;
    var evictOff = RM.available === false;

    function evictItem(extra) {
      var item = extra || {};
      item.label = item.label || 'Evict remote cache';
      item.danger = true;
      if (evictOff) {
        item.disabled = true;
        item.reason = RM.reason;
        item.sentence = RM.sentence;
        item.tip = RM.reason + ' ' + ELL + ' ' + RM.sentence;
        return item;
      }
      return ask(item, {
        act: 'evict_remote', on: RM.host || 'remote',
        title: 'Evict the remote search cache?',
        scope: 'The cache held for this project on ' + (RM.host || 'the remote host') + '.',
        consequence: 'Accelerated results are unavailable until it is rebuilt. Local search is unaffected.',
        verb: 'Evict'
      });
    }

    function freshness() {
      /* One line, never a card (FinalGUISpec.md:699). */
      var txt = IX.annotate ? IX.line : IX.line + ' ' + ELL + ' ' + S.index.builtAt;
      return '<span class="pmk-note vD-1 pmk-strip-grow">' +
        esc(el(txt, null, chars(state, 8))) + '</span>';
    }

    function toolbar(withReplace) {
      var flags = [
        ['.*', 'Regular expression', S.flags.regex],
        ['Aa', 'Match case', S.flags.caseSensitive],
        ['\\b', 'Whole word', S.flags.wholeWord]
      ].map(function (f) {
        return '<button type="button" class="pmk-btn" aria-pressed="' + (f[2] ? 'true' : 'false') +
          '" data-pm-tip="' + esc(f[1]) + '">' + esc(f[0]) + '</button>';
      }).join('');
      var row1 = '<span class="pmk-strip-grow">' +
        field(withReplace ? S.replace : S.query, withReplace ? 'Replace with' : 'Find in files',
              withReplace ? 'Replacement text' : 'Search this project') + '</span>' +
        PMK.overflow([
          { value: 'expand_all', label: 'Expand all' },
          { value: 'collapse_all', label: 'Collapse all' },
          { type: 'sep' },
          { value: 'rebuild', label: 'Rebuild index' },
          evictItem({ value: 'evict' })
        ], 'Search actions');
      var row2 = flags + PMK.select(S.scope, S.scopeOptions, { style: 'flex:1 1 auto;min-width:0' });
      /* three fixed strips: query, flags + scope, freshness. PMK.strip wraps
         the first and this closes/reopens for the other two, so all three stay
         OUT of the scroller -- results are the only thing that scrolls. */
      return row1 + '</div><div class="pmk-strip">' + row2 +
             '</div><div class="pmk-strip">' + freshness();
    }

    return stackFrame({
      panel: 'search', title: 'Search', state: state, bucket: b, stack: stackOf('search'),
      levelActions: [
        { value: 'rebuild', label: 'Rebuild index' },
        evictItem({ value: 'evict' })
      ],
      hub: function (bb) {
        return {
          count: S.summary.matches + ' in ' + S.summary.files,
          rows: [
            hubRow({ bucket: bb, glyph: 'search', name: 'Results', go: 'find', title: 'Find',
                     count: S.summary.matches + ' in ' + S.summary.files,
                     summary: S.files.length + ' files matched' }),
            hubRow({ bucket: bb, glyph: 'bar', name: 'Index', go: 'index', title: 'Index',
                     count: S.index.documents.toLocaleString(), status: IX.token,
                     summary: IX.annotate ? IX.line : S.index.builtAt }),
            /* BLIND SPOT 15. The remote is a DESTINATION, not a footnote:
               the hub's whole claim is that a status mark plus a one-line
               summary tells you whether to descend, and an acceleration
               service that is down is exactly the fact that claim exists for.
               The summary is the fixture's own sentence; the count slot -- the
               one slot that survives 240px -- carries the state word. */
            hubRow({ bucket: bb, glyph: 'ext', name: 'Remote', go: 'remote', title: 'Remote search',
                     count: RM.state || '', status: evictOff ? 'disabled' : 'ok',
                     off: evictOff, summary: RM.sentence || '' }),
            hubRow({ bucket: bb, glyph: 'filter', name: 'Scope', go: 'scope', title: 'Scope',
                     count: String(S.scopeOptions.length),
                     summary: 'All files' }),
            hubRow({ bucket: bb, glyph: 'refresh', name: 'Replace', go: 'replace', title: 'Replace',
                     summary: 'Preview before apply' })
          ],
          primary: PMK.btn('Find in files', { primary: true, wide: true })
        };
      },
      view: function (st, bb) {
        var id = st[st.length - 1].id;

        /* BLIND SPOT 15, the destination. Everything here is the fixture's:
           its sentence, its reason code, its host, its check age and its own
           two named actions in the order it lists them. The state is rendered
           through PMK.blocked so the reason code lands VERBATIM, which is what
           GI-017 / CRAU-021 require of a reason and what a summary line at
           240px cannot promise. */
        if (id === 'remote') {
          return {
            kind: 'object', ident: RM.host || 'Remote search',
            identKind: 'path',
            status: evictOff ? 'disabled' : 'ok',
            statusWord: PMK.statusOf(evictOff ? 'disabled' : 'ok').word,
            blocked: evictOff
              ? PMK.blocked({ code: RM.reason, sentence: RM.sentence,
                              actions: RM.actions || [] })
              : '',
            kvs: [
              ['Host', RM.host || '', 'measure'],
              ['State', RM.state || ''],
              ['Checked', RM.checkedAt ? RM.checkedAt + ' ago' : ''],
              /* silentFallback:false is the contract, so it is rendered as
                 the contract rather than as a boolean nobody can read. */
              ['Fallback', RM.silentFallback === false ? 'stated, never silent' : '', 'prose']
            ],
            acts: actionBar((RM.actions || []).map(function (a) {
              return { label: a.label, value: a.id };
            }).concat([evictItem({})]), bb)
          };
        }

        if (id === 'index') {
          return {
            kind: 'object', ident: S.index.engine, status: IX.token,
            statusWord: IX.token ? PMK.statusOf(IX.token).word : '',
            kvs: [
              ['Engine', S.index.engine],
              /* the state's own line, not the enum, and not a mark's tone */
              ['State', IX.line, 'prose'],
              ['Documents', S.index.documents.toLocaleString()],
              /* dropped whole when the index is not serving: kvs() skips '' */
              ['Built', IX.annotate ? '' : S.index.builtAt, 'measure'],
              /* BLIND SPOT 15. The last BUILD, under its own labels, so the
                 terminal state cannot be read as the current one. */
              ['Last build', LB ? LB.line : ''],
              ['Attempted', LB && LB.at ? LB.at + ' ago' : ''],
              ['Build detail', LB ? LB.detail : '', 'prose'],
              ['Resumable', LB ? (LB.resumable ? 'yes' : 'no') : ''],
              ['Large files', S.index.largeFileThresholdMb + ' MB'],
              ['Generated', S.index.excludeGenerated ? 'excluded' : 'included'],
              ['Symlinks', S.index.followSymlinks ? 'followed' : 'not followed']
            ],
            /* the primary label is the FIXTURE's -- 'Start a fresh build',
               which is the data saying in a label that a discarded partial
               generation is not resumed but replaced. Falling back to the
               authored 'Rebuild index' only when no last build is recorded. */
            acts: actionBar([
              { label: (LB && LB.actions && LB.actions[0] && LB.actions[0].label) || 'Rebuild index',
                primary: true },
              evictItem({}),
              ask({ label: 'Disable indexing' }, {
                act: 'disable_index', on: S.index.engine,
                title: 'Turn indexing off?',
                scope: 'The ' + S.index.engine + ' index over ' +
                       S.index.documents.toLocaleString() + ' documents.',
                consequence: 'Search falls back to grep only and the generation is discarded. Rebuilding it is a fresh build, not a resume.',
                verb: 'Turn off'
              })
            ], bb),
            note: 'Build progress belongs to the status bar, not this panel.'
          };
        }
        if (id === 'scope') {
          return {
            kind: 'list',
            toolbar: PMK.select(S.scope, S.scopeOptions, { style: 'flex:1 1 auto;min-width:0' }),
            rows: S.scopeOptions.map(function (o) {
              return PMK.row({ bucket: bb, id: o.label, idMax: idCap(state, bb, {}),
                               status: o.value === S.scope ? 'ok' : null,
                               actions: [{ value: 'set', label: 'Use this scope' }] });
            }).join('')
          };
        }
        /* find + replace share the result renderer; replace only adds the
           second field and the two destructive footer buttons. */
        var isReplace = id === 'replace';
        return {
          kind: 'list',
          toolbar: toolbar(isReplace),
          rows: '',
          before: results(),
          /* Prev/Next are short enough to pair at every width; Replace all is
             not, so it takes the overflow at 240 like any other long label. */
          /* THE CONFIRMATION GATE. 'Replace all' already CLAIMED a
             confirmation in its tooltip -- "Confirms before applying" -- and
             there was none: the tooltip was the whole of the promise. It now
             names the count it is about to rewrite, from S.summary rather
             than from the rows this page happens to have loaded. */
          footer: isReplace
            ? actionBar([
                ask({ label: 'Replace', danger: true }, {
                  act: 'replace_next', on: S.query,
                  title: 'Replace the next match?',
                  scope: 'One match of ' + S.query + ', in the file it sits in.',
                  consequence: 'The file is written on disk. This panel has no undo for it.',
                  verb: 'Replace'
                }),
                ask({ label: 'Replace all', danger: true }, {
                  act: 'replace_all', on: S.query,
                  title: 'Replace all matches?',
                  /* the replacement field is EMPTY in the fixture, and an
                     empty replacement is a delete. Saying "with" and then
                     nothing would hide the one detail that changes what this
                     button does. */
                  scope: S.summary.matches + ' matches across ' + S.summary.files +
                         ' files, replacing ' + S.query + ' with ' +
                         (S.replace ? S.replace : 'an empty string') + '.',
                  consequence: 'Every one of those files is written on disk in a single pass. This panel has no undo for it.',
                  verb: 'Replace all'
                })
              ], bb, true)
            : '<div class="pmk-btnrow">' +
                PMK.btn('Previous', { tip: 'Previous result' }) +
                PMK.btn('Next', { tip: 'Next result' }) +
              '</div>'
        };
      }
    });
  }
  /* ====================================================================
     PANEL 2 — SOURCE CONTROL
     Hub order follows the brief. GI-004's canonical enumeration is
     Changes / History / Graph / Worktrees / Branches / Stash; promoting
     Worktrees should go through the user-controllable pinned-sections
     mechanism rather than a hard reorder, and that is the one thing a hub
     makes trivial — a hub row is reorderable, an accordion position is not.

     This is where the system breaks natively and has to be patched: reviewing
     changes WHILE writing the commit message is two regions, and this system
     renders one. The Changes L1 pins the composer as a footer. Everything
     else in the panel stays uniform.
     ==================================================================== */
  function pSource(D, state) {
    var b = D.bucket(state.width);
    accountGuard(D);
    var SC = D.source;
    var byBranch = {};
    SC.worktrees.forEach(function (w) { byBranch[w.branch] = w; });

    /* ------------------------------------------------------ BLIND SPOT 2
       source.repo carries name, owner, nameWithOwner, host, remote,
       lifecycle, visibility, defaultBranch and TWO SIBLING REPOSITORIES, and
       ten of ten designs rendered none of it. The panel opened on a branch
       picker and a change count and left the reader to assume which
       repository they were looking at.

       GitHub_Integration.md:L397 is why that is a defect rather than a
       cosmetic gap: it forbids assuming a single repo context. siblingCount
       is 2, so the assumption this panel was making is false in its own
       fixture -- and the sibling that matters is
       jared-dev/tastebook-unraid-templates, which is the ARCHIVED repository
       the Actions panel is bound to. A user who reads "archived, every
       mutation is disabled" in Actions and "9 staged" in Source Control is
       looking at two different repositories, and until now nothing on either
       screen said so.

       It gets a hub row and an object rather than a header line, for the
       reason the whole system exists: nameWithOwner is 19 characters and the
       remote is 38, and a 224px band that spends its width on a constant is
       a band that has nothing left for the changed file it is there to show.
       The hub row carries the short name and the lifecycle; the identity that
       cannot be abbreviated lives one tap down where it has the full band. */
    var REPO = SC.repo || {};

    function branchStrip() {
      return '<div class="pmk-strip">' +
        '<span class="vD-glyph">' + ic('branch', 14) + '</span>' +
        PMK.select(D.project.branch, SC.branchList.map(function (x) {
          return { value: x.name, label: x.name,
                   hint: (x.ahead ? '+' + x.ahead : '') + (x.behind ? ' -' + x.behind : '') };
        }), { style: 'flex:1 1 auto;min-width:0' }) +
        '<span class="vD-count">' + esc('+' + D.project.ahead + ' -' + D.project.behind) + '</span>' +
        '</div>';
    }

    /* The status letter is P0 at 240px ("one-line file rows with status letter
       + basename"), but a kit chip only renders at bucket >= 2 -- it is a tail
       slot and tail slots drop. So the letter goes in the LEADING slot as a
       10px fixed token, the same place the hub puts its glyph. Ten pixels buys
       the one piece of state a change row cannot be read without. */
    function fileRow(f, bb) {
      return '<div class="pmk-row vD-hub" tabindex="0" role="button" data-pm-ctx="Row actions">' +
        '<span class="vD-code2 pmk-mono" data-pm-tip="' +
          esc(f.code === 'A' ? 'Added' : f.code === 'M' ? 'Modified' : f.code) + '">' +
          esc(f.code) + '</span>' +
        '<span class="pmk-id">' +
          esc(el(f.path, 'path', idCap(state, bb, { extra: 14 }))) + '</span>' +
        PMK.overflow([
          { value: 'open', label: 'Open file' },
          { value: 'stage', label: 'Stage' },
          /* THE CONFIRMATION GATE, and this is the row it exists for:
             Discard sits one menu item below Stage, on a 224px band, and
             discarding local state is the first clause of L156. */
          ask({ label: 'Discard changes', danger: true }, {
            act: 'discard_file', on: f.path,
            title: 'Discard changes to this file?',
            scope: 'The uncommitted ' + (f.code === 'A' ? 'addition' : 'edits') +
                   ' in ' + f.path + '.',
            consequence: 'The working-tree copy returns to its committed state. The changes are not recoverable from git.',
            verb: 'Discard'
          })
        ]) + '</div>';
    }

    /* ------------------------------------------------------------ BROKE-3
       lifecycle is its OWN field and its five values are RESERVED WORDS
       (WorktreeGitImprovement.md:L297): reserved | active | blocked_preserved
       | released | orphaned. PM_DATA.status cannot express them -- it is one
       vocabulary across seven panels and blocked_preserved is meaningless in
       Docker -- which is precisely why the fixture carries lifecycle
       separately. Reading the status word in its place substitutes a
       rendering token for a contractual one, and the substitution is not
       harmless: thread/ratings-schema is 'released' (merged cleanly into main,
       retained for lineage) and the panel called it 'disabled', which
       PM_DATA.status labels "Unavailable" -- so the object header, and the
       accessible name with it, told the user a successfully merged worktree
       was broken.

       The status word still renders, because a worktree genuinely has both.
       What changes is that the lifecycle word is now rendered as itself, and
       each lifecycle state's own sentence -- the fixture ships one per state
       under a state-specific key -- renders with it. That sentence is the
       whole of what 'released', 'reserved' and 'orphaned' mean operationally,
       and it is the only thing that distinguishes the two blocked_preserved
       rows from each other. */
    function lifeSentence(w) {
      return (w.lifecycle === 'reserved' ? w.reservedSentence
            : w.lifecycle === 'orphaned' ? w.orphanSentence
            : w.lifecycle === 'released' ? w.releasedSentence
            : w.lifecycle === 'blocked_preserved' ? w.preservedSentence
            : '') || '';
    }

    /* the row's accessible name leads with the RESERVED word, not the status
       label -- see sayFirst(). This is the only carrier of the lifecycle at
       L1: the visible row has no slot for it that does not cost the branch
       its width, and the branch is what the list is scanned by. */
    function lifeSay(w) { return w.lifecycle ? 'Lifecycle ' + w.lifecycle : ''; }

    /* Revert is a commit, not an erase, and the gate says so: L156's clause
       is "materially change live execution", which a revert on the checked-out
       branch is. Naming the subject line is the scope -- a SHA alone is not
       something a reader can check. */
    function revertCommit(c) {
      return ask({ value: 'revert', label: 'Revert', danger: true }, {
        act: 'revert_commit', on: c.sha,
        title: 'Revert this commit?',
        scope: c.sha + ', ' + c.subject + ', by ' + c.who + '.',
        consequence: 'A new commit undoing it is written on ' + D.project.branch +
                     '. History is added to, never rewritten.',
        verb: 'Revert'
      });
    }

    function wtRow(w, bb) {
      return sayFirst(nav(PMK.row({
        bucket: bb, status: w.status, id: w.branch, idKind: 'path', idMax: idCap(state, bb, { meta: 1, tail: 1 }),
        meta: [w.owner, w.base], tail: w.run || (w.dirty ? 'dirty' : ''),
        actions: [
          { value: 'open', label: 'Open files' },
          { value: 'compare', label: 'Compare' },
          removeWt(w, { value: 'remove', label: 'Remove' })
        ]
      }), 'worktree', w.branch, w.branch), lifeSay(w));
    }

    /* ONE writer for Remove-worktree at both of its call sites, because the
       two gates it carries are different things and both have to hold. The
       LOCK gate disables it -- an owned worktree is not removable and the
       reason code is the fixture's. The CONFIRMATION gate applies only when
       it is removable, and it is the second clause of L156 verbatim: an
       action that removes a /worktree states scope and consequence first.
       The lifecycle word decides the consequence, because removing a
       'released' worktree that was merged for lineage and removing a
       'blocked_preserved' one that is holding evidence are not the same
       loss, and the fixture ships a sentence for each. */
    function removeWt(w, item) {
      item = item || {};
      item.label = item.label || 'Remove';
      item.danger = true;
      if (w.lockedBy) {
        item.disabled = true;
        item.reason = w.lockReason || '';
        item.sentence = 'Owned by ' + w.lockedBy + '.';
        item.tip = 'Owned by ' + w.lockedBy;
        return item;
      }
      return ask(item, {
        act: 'remove_worktree', on: w.branch,
        title: 'Remove this worktree?',
        scope: 'The worktree for ' + w.branch + ' at ' + (w.path || 'no path on disk') +
               ', lifecycle ' + w.lifecycle + '.',
        consequence: (lifeSentence(w) ? lifeSentence(w) + ' ' : '') +
                     (w.dirty ? 'It has uncommitted changes, and they go with it. '
                              : 'Its checkout is removed from disk. ') +
                     'The branch itself is untouched.',
        verb: 'Remove'
      });
    }

    return stackFrame({
      panel: 'source', title: 'Source Control', state: state, bucket: b, stack: stackOf('source'),
      persist: function () { return branchStrip(); },
      levelActions: [
        { value: 'fetch', label: 'Fetch' },
        { value: 'pull', label: 'Pull' },
        { value: 'push', label: 'Push' }
      ],
      hub: function (bb) {
        return {
          count: SC.counts.staged + SC.counts.unstaged + ' changed',
          rows: [
            /* BLIND SPOT 2. First row, because it is the context every row
               below it is scoped to. The count slot -- the slot that survives
               240px -- carries visibility, which is the one property of a
               repository that changes what pushing to it means. */
            hubRow({ bucket: bb, glyph: 'ext',
                     name: el(REPO.nameWithOwner || '', 'path', chars(state, 96)),
                     go: 'repository', title: REPO.nameWithOwner || 'Repository',
                     count: REPO.visibility || '',
                     status: REPO.lifecycle === 'active' ? 'ok' : 'attention',
                     summary: REPO.host + ', ' + REPO.lifecycle + ', ' +
                              REPO.siblingCount + ' sibling repositories' }),
            hubRow({ bucket: bb, glyph: 'plus', name: 'Changes', go: 'changes', title: 'Changes',
                     count: String(SC.counts.staged + SC.counts.unstaged), status: 'attention',
                     summary: SC.counts.staged + ' staged, ' + SC.counts.unstaged + ' unstaged',
                     action: { label: 'Stage all' } }),
            hubRow({ bucket: bb, glyph: 'branch', name: 'Worktrees', go: 'worktrees', title: 'Worktrees',
                     count: String(SC.counts.worktrees), status: 'attention',
                     summary: '1 owned by ' + (byBranch['orch/lane-b-api'].lockedBy || '') }),
            hubRow({ bucket: bb, glyph: 'clock', name: 'History', go: 'history', title: 'History',
                     count: String(SC.counts.commits),
                     summary: SC.history[0].sha + ', ' + SC.history[0].when + ' ago' }),
            hubRow({ bucket: bb, glyph: 'ext', name: 'Graph', go: 'graph', title: 'Graph',
                     summary: 'List fallback below 480px' }),
            hubRow({ bucket: bb, glyph: 'branch', name: 'Branches', go: 'branches', title: 'Branches',
                     count: String(SC.counts.branches),
                     summary: 'on ' + D.project.branch }),
            hubRow({ bucket: bb, glyph: 'square', name: 'Stash', go: 'stash', title: 'Stash',
                     count: String(SC.counts.stash),
                     summary: SC.stash[0].when + ' ago' })
          ],
          primary: '<div class="pmk-btnrow">' + PMK.btn('Commit', { primary: true }) +
                   PMK.btn('Sync', {}) + '</div>'
        };
      },
      view: function (st, bb) {
        var f = st[st.length - 1], id = f.id;

        /* BLIND SPOT 2, the destination. Every field the fixture carries,
           under its own name, plus the siblings as a real sub-list -- because
           "2 siblings" as a number is the same assumption L397 forbids, one
           digit smaller. The sibling rows are navigation-shaped and inert:
           switching repository is a project-scope operation this panel does
           not own, and a row that looked switchable would be a claim. */
        if (id === 'repository') {
          return {
            kind: 'object', ident: REPO.nameWithOwner || '', identKind: 'path',
            status: REPO.lifecycle === 'active' ? 'ok' : 'attention',
            statusWord: REPO.lifecycle || '',
            kvs: [
              ['Name', REPO.name],
              ['Owner', REPO.owner],
              ['Name with owner', REPO.nameWithOwner, 'measure'],
              ['Host', REPO.host],
              ['Remote', REPO.remote, 'measure'],
              ['Lifecycle', REPO.lifecycle],
              ['Visibility', REPO.visibility],
              ['Default branch', REPO.defaultBranch],
              ['Checked out', D.project.branch]
            ],
            acts: actionBar([
              { label: 'Open in browser', primary: true },
              { label: 'Copy remote' },
              { label: 'Repository settings' }
            ], bb),
            subs: (REPO.siblings || []).length
              ? [ subList('Sibling repositories', REPO.siblingCount,
                  (REPO.siblings || []).map(function (sib) {
                    return '<div class="pmk-row" tabindex="0" role="button">' +
                      '<span class="vD-glyph">' + ic('ext', 14) + '</span>' +
                      '<span class="pmk-id">' +
                        esc(el(sib, 'path', chars(state, 20))) + '</span>' +
                      PMK.overflow([{ value: 'open', label: 'Open in browser' }]) +
                      '</div>';
                  })) ]
              : []
          };
        }

        if (id === 'changes') {
          return {
            kind: 'list',
            toolbar: '<span class="pmk-strip-grow">' + PMK.filter('Filter changed files') + '</span>' +
                     PMK.overflow([
                       { value: 'stage_all', label: 'Stage all' },
                       { value: 'unstage_all', label: 'Unstage all' },
                       ask({ label: 'Discard all changes', danger: true }, {
                         act: 'discard_all', on: 'changes',
                         title: 'Discard every change?',
                         scope: 'All ' + (SC.counts.staged + SC.counts.unstaged) +
                                ' changed files on ' + D.project.branch + ', staged and unstaged.',
                         consequence: 'Every working-tree edit returns to its committed state. None of it is recoverable from git.',
                         verb: 'Discard all'
                       })
                     ], 'Change actions'),
            rows: '',
            after: PMK.section('Staged', SC.counts.staged, true) +
              '<div class="vD-list">' + SC.staged.map(function (x) { return fileRow(x, bb); }).join('') + '</div>' +
              PMK.section('Unstaged', SC.counts.unstaged, true) +
              '<div class="vD-list">' + SC.unstaged.map(function (x) { return fileRow(x, bb); }).join('') + '</div>',
            /* THE SPECIAL CASE. A drill stack renders one region; this task
               needs two. The composer is pinned below the scroller so the file
               list and the message field co-exist at 240px. */
            footer: field(SC.commitDraft, 'Commit message', 'Message for this commit') +
              '<div class="pmk-btnrow">' + PMK.btn('Commit', { primary: true }) +
              PMK.overflow([
                { value: 'commit_push', label: 'Commit and push' },
                { value: 'amend', label: 'Amend last commit' },
                { value: 'sign', label: 'Commit signed' }
              ], 'Commit options') + '</div>'
          };
        }

        if (id === 'worktrees') {
          return {
            kind: 'list',
            toolbar: '<span class="pmk-strip-grow">' + PMK.filter('Filter worktrees') + '</span>' +
                     PMK.overflow([
                       { value: 'add', label: 'Add worktree' },
                       /* prunable is a per-row flag and four of the twelve
                          carry it, so the gate can name the count instead of
                          the word "stale" -- which is a status token here and
                          means something else. */
                       ask({ label: 'Prune stale worktrees', danger: true }, {
                         act: 'prune_worktrees', on: 'worktrees',
                         title: 'Prune stale worktrees?',
                         scope: SC.worktrees.filter(function (w) { return w.prunable; }).length +
                                ' of ' + SC.counts.worktrees + ' worktrees are marked prunable.',
                         consequence: 'Each one is removed from disk with any uncommitted work in it. Owned and preserved worktrees are left alone.',
                         verb: 'Prune'
                       })
                     ], 'Worktree actions'),
            rows: SC.worktrees.map(function (w) { return wtRow(w, bb); }).join('')
          };
        }

        if (id === 'worktree') {
          var w = byBranch[f.arg] || SC.worktrees[0];
          return {
            kind: 'object', ident: w.branch, identKind: 'path', status: w.status,
            statusWord: PMK.statusOf(w.status).word,
            /* the header mark announces the reserved word before the status
               label, so 'released' is heard before 'Unavailable' rather than
               after it. The status word still renders visibly beside the
               identity, because a worktree genuinely has both. */
            say: lifeSay(w),
            /* W-019 blocked-state contract: reason-family code VERBATIM, one
               templated sentence, and the ordered allowed_action_ids as real
               buttons associated to the disabled control. The fixture carries
               lockReason and lockedBy but no allowed_action_ids, so the two
               action nouns come from research/source.md section 6, cited to
               WorktreeGitImprovement.md:439. This is the ONE place vD renders
               a label that is not in _pm-data.js, and it is here because
               suppressing the actions would break the contract outright. */
            blocked: w.lockedBy ? PMK.blocked({
              code: w.lockReason,
              sentence: 'Owned by ' + w.lockedBy + '.',
              actions: [{ label: 'Open lane' }, { label: 'Focus lineage' }]
            }) : '',
            /* the lifecycle's own sentence, never the status label */
            note: lifeSentence(w),
            kvs: [
              /* BROKE-3: the reserved word verbatim, under its own label. */
              ['Lifecycle', w.lifecycle],
              ['Owner', w.owner, 'prose'],
              ['Path', w.path, 'measure'],
              ['Base', w.base],
              ['Ahead', String(w.ahead)],
              ['Dirty', w.dirty ? 'yes' : 'no'],
              ['Run', w.run || '']
            ],
            acts: actionBar([
              { label: 'Open files', primary: true },
              { label: 'Compare' },
              { label: 'Merge' },
              { label: 'Create PR' },
              removeWt(w, {})
            ], bb)
          };
        }

        if (id === 'history' || id === 'graph') {
          return {
            kind: 'list',
            toolbar: '<span class="pmk-strip-grow">' + PMK.filter('Filter commits') + '</span>',
            rows: SC.history.map(function (c) {
              return nav(PMK.row({
                bucket: bb, id: c.subject, idMax: idCap(state, bb, { meta: 1, tail: 1 }),
                meta: [c.sha, c.who], tail: c.when,
                actions: [{ value: 'open', label: 'Open commit' },
                          revertCommit(c)]
              }), 'commit', c.sha, c.sha);
            }).join(''),
            after: id === 'graph' ? note('Graph renders as the commit list below 480px.') : ''
          };
        }

        if (id === 'commit') {
          var c0 = SC.history[0];
          SC.history.forEach(function (x) { if (x.sha === f.arg) c0 = x; });
          return {
            kind: 'object', ident: c0.subject, status: 'ok',
            kvs: [['Commit', c0.sha, 'measure'], ['Author', c0.who],
                  ['When', c0.when + ' ago'], ['Branch', D.project.branch]],
            acts: actionBar([
              { label: 'Open diff', primary: true },
              { label: 'Copy SHA' },
              revertCommit(c0)
            ], bb)
          };
        }

        if (id === 'branches') {
          return {
            kind: 'list',
            toolbar: '<span class="pmk-strip-grow">' + PMK.filter('Filter branches') + '</span>' +
                     PMK.overflow([{ value: 'create', label: 'Create branch' }], 'Branch actions'),
            rows: SC.branchList.map(function (x) {
              return nav(PMK.row({
                bucket: bb, status: x.current ? 'ok' : null, id: x.name, idKind: 'path',
                idMax: idCap(state, bb, { meta: 1, tail: 1 }),
                meta: ['ahead ' + x.ahead, 'behind ' + x.behind],
                tail: x.current ? 'current' : '',
                actions: [{ value: 'switch', label: 'Switch' }, { value: 'compare', label: 'Compare' }]
              }), 'branch', x.name, x.name);
            }).join('')
          };
        }

        if (id === 'branch') {
          var br = SC.branchList[0];
          SC.branchList.forEach(function (x) { if (x.name === f.arg) br = x; });
          var owner = byBranch[br.name];
          return {
            kind: 'object', ident: br.name, status: br.current ? 'ok' : null,
            note: owner ? 'A branch owned by an active worktree opens read-only.' : '',
            kvs: [['Ahead', String(br.ahead)], ['Behind', String(br.behind)],
                  ['Current', br.current ? 'yes' : 'no'],
                  ['Worktree', owner ? owner.path : '', 'measure']],
            acts: actionBar([
              { label: 'Switch', primary: true, disabled: !!owner },
              { label: 'Compare' },
              ask({ label: 'Delete', danger: true, disabled: br.current,
                    reason: br.current ? 'branch_is_current' : '',
                    sentence: br.current ? 'The checked-out branch cannot be deleted.' : '' }, {
                act: 'delete_branch', on: br.name,
                title: 'Delete this branch?',
                scope: br.name + ', ' + br.ahead + ' ahead and ' + br.behind + ' behind ' +
                       D.project.branch + '.' +
                       (owner ? ' A worktree is checked out at ' + owner.path + '.' : ''),
                consequence: br.ahead
                  ? 'Its ' + br.ahead + ' unmerged commits are reachable only by SHA afterwards.'
                  : 'Nothing unmerged is lost; the ref is removed.',
                verb: 'Delete'
              })
            ], bb)
          };
        }

        return {
          kind: 'list',
          rows: SC.stash.map(function (s) {
            return PMK.row({ bucket: bb, id: s.label, idMax: idCap(state, bb, { tail: 1 }), tail: s.when,
                             actions: [{ value: 'apply', label: 'Apply' },
                                       ask({ label: 'Drop', danger: true }, {
                                         act: 'drop_stash', on: s.label,
                                         title: 'Drop this stash entry?',
                                         scope: s.label + ', stashed ' + s.when + ' ago.',
                                         consequence: 'The entry is deleted and its contents are not recoverable.',
                                         verb: 'Drop'
                                       })] });
          }).join('')
        };
      }
    });
  }

  /* ====================================================================
     PANEL 3 — GITHUB ACTIONS
     Current Branch / Workflows / Settings are stable subviews, not stacked
     cards (GI-004 / GitHub_Integration.md:563), and a hub is the cheapest
     honest rendering of a stable subview set. Depth here goes four levels:
     hub > Runs > run #310 > job "test" > step logs. The deepest level shows
     a 3-line excerpt and ROUTES the full log to the bottom runtime zone —
     a 224px band is not a log viewer and pretending otherwise is how the
     current build ends up with unreadable wrapped monospace.

     The connection block renders through PMK.blocked with the code
     actions_missing_scope_runtime verbatim and Reconnect as a real button.
     Deeper levels carry the condensed one-line marker so the block is never
     suppressed for space.
     ==================================================================== */
  function pGit(D, state) {
    var b = D.bucket(state.width);
    accountGuard(D);
    var A = D.actions;
    var blocked = A.connection.blocked;

    /* ------------------------------------------------------------ BROKE-6
       The repository this panel is looking at is ARCHIVED. repository ships
       lifecycle, mutationDisabled, the closed capability set and the two
       canonical capability sentences, and none of it was read -- so Re-run,
       Cancel and Dispatch stayed live on a repo whose own data says every
       mutation is disabled.

       GitHub_Integration.md:L1271-L1275 is specific about the remedy and it is
       not "hide the button": archived / deleted / historical_only disable
       mutation DETERMINISTICALLY, and the limit must show as an EFFECTIVE
       CAPABILITY STATE rather than as a missing control. So every mutation
       stays VISIBLE and disabled, and carries the lifecycle token as its
       reason code plus the repository's own sentence -- which is also the one
       thing v0 does here that all six redesigns dropped (state the effective
       capability in prose instead of implying it with a greyed control).

       capabilities is a CLOSED set; a capability that is not in it is not
       asserted either way, which is why the guard tests '=== false' rather
       than falsiness.

       THE CANONICAL SET, and where each member lives in a stack navigator.
       The first pass gated the four controls that happen to sit on a bar and
       left the rest live, which is the failure mode a depth-based system is
       most exposed to: a control you cannot see from the hub is still a
       control, and Unpin two taps down writes to the repository exactly as
       hard as Dispatch does on the hub footer.

         Re-run            L1 run row, L1 pinned row, L2 run bar, L2 job bar,
                           L2 jobs sub-list row
         Re-run failed     L0 hub footer
         Cancel            L1 run row, L2 run bar
         Dispatch          L0 hub footer, L1 workflow row, L2 workflow bar
         Pin / Unpin       L1 run row, L1 pinned row, L1 workflow row,
                           L2 run overflow, L2 workflow bar
         Secret add        L1 secrets toolbar
         Secret update     L1 secret row
         Secret delete     L1 secret row
         Request review    L2 run blocked block (from allowed_action_ids)

       Read-only actions -- Open run, Open job, Open logs, Open in browser,
       Open workflow file, Open in GitHub, Open environment, Open runners,
       Copy, Compare last success, Refresh, the filters and the status
       select -- all stay live. An archived repository is READABLE; disabling
       reads would be a second false claim in the opposite direction. */
    var REPO = A.repository || {};
    var CAPS = REPO.capabilities || {};

    /* LIMITED is DERIVED, never a list of the states this file happens to
       know. repository.lifecycleStates ships seven members and exactly one of
       them -- 'active' -- limits nothing; archived, deleted, historical_only,
       transferred, renamed_redirected and remote_mismatch all freeze mutation.
       Testing "not active" therefore gates all six with no further edit, which
       is the point: change the fixture's lifecycle word to any other member
       and this panel gates identically. A list of known-bad states is how five
       of the seven stay unrendered forever. */
    var LIMITED = !!REPO.lifecycle && REPO.lifecycle !== 'active';
    var GATED = LIMITED || !!REPO.mutationDisabled;

    /* The umbrella OUTRANKS the named capability -- an archived repo cannot
       re-run a green run even if its rerun capability said yes -- but a named
       false still gates on its own, which is the state the fixture ships its
       second sentence for ('You can dispatch but cannot manage secrets'). */
    function denied(cap) { return GATED || CAPS[cap] === false; }

    /* ONE writer for every mutating control in this panel, at every level.
       A stack navigator renders one level at a time, so a gate applied only
       where the action bar happens to be is a gate that is absent from most
       of the panel: the same Re-run is a row overflow item at L1, a bar
       button at L2 and a sub-list item at L3, and all three go through here.

       The reason travels in three carriers, none of them a native title:
       data-reason/data-sentence become the visible .pm-pop-reason line under
       a disabled menu item, data-pm-tip carries code and sentence on a bar
       button, and capStrip() below states the capability in prose on the
       frame itself so a reader never has to hover anything to learn why. */
    function withMut(item, cap) {
      if (!denied(cap)) return item;
      item.disabled = true;
      item.reason = REPO.lifecycle;
      item.sentence = REPO.sentence;
      item.tip = REPO.lifecycle + ' ' + ELL + ' ' + REPO.capabilitySentence;
      return item;
    }

    /* The effective capability IN PROSE, on the frame rather than in the
       scroller. GitHub_Integration.md:L1271-L1275 requires the limit to
       surface as an effective CAPABILITY STATE, and a greyed button is not a
       state -- it is an inference the reader is left to make. It used to ride
       the repository hub row's summary line, which buckets 0 and 1 drop and
       which disappears entirely the moment you descend; frame chrome does
       neither. */
    /* The closed capability set as a tally. It exists so the repository hub
       row has something to say that the strip does not already say: with the
       strip carrying the sentence, a summary line repeating it verbatim
       printed the same 38 characters twice on one 380px screen. */
    var capOn = 0, capAll = 0;
    for (var ck0 in CAPS) {
      if (Object.prototype.hasOwnProperty.call(CAPS, ck0)) {
        capAll++;
        if (CAPS[ck0]) capOn++;
      }
    }

    function capStrip() {
      if (!GATED) return '';
      var say = REPO.capabilitySentence || REPO.sentence || '';
      return '<div class="vD-cap">' +
        '<span class="vD-cap-c">' + esc(REPO.lifecycle || 'mutation_disabled') + '</span>' +
        (say ? '<span class="vD-cap-s">' + esc(say) + '</span>' : '') + '</div>';
    }

    /* allowed_action_ids carry no "mutating" flag -- the fixture models the
       ordered id list and nothing else -- so the verb is read off the id: the
       leading word of the last dot segment. open_environment and open_runners
       navigate; request_review acts on the repository and is therefore gated
       exactly like Re-run. REPORTED, NOT PATCHED HERE: the flag belongs on
       the fixture and K.blocked has no disabled-button support at all, which
       is why these render as a bar under the banner rather than inside it.
       Both are shared-layer edits this file must not make for the others. */
    var READ_VERB = { open: 1, view: 1, copy: 1, show: 1, list: 1 };
    function isReadAction(id) {
      var s = String(id == null ? '' : id);
      var tail = s.slice(s.lastIndexOf('.') + 1);
      return !!READ_VERB[tail.split('_')[0]];
    }

    /* Banner + its OWN allowed actions, ordered as the fixture orders them.
       The read-only ones stay live on an archived repo; Request review is an
       approval, i.e. a mutation, and gates with everything else. */
    function blockedBlock(bk, bb) {
      if (!bk) return '';
      var acts = allowedActions(bk.allowedActionIds).map(function (a) {
        var item = { label: a.label, value: a.value };
        return isReadAction(a.value) ? item : withMut(item, 'approve');
      });
      return PMK.blocked({ code: bk.code, sentence: bk.sentence }) +
             (acts.length ? actionBar(acts, bb, true) : '');
    }

    /* Cancel has a SECOND reason to be off -- a finished run cannot be
       cancelled -- and it was disabled for that reason with NO reason
       attached, which is the same defect as an ungated mutation wearing a
       different hat. withMut runs last and overwrites both fields, because
       the repository gate is deterministic and outranks the row's own state:
       answering an archived repo with "this run is not in progress" would be
       the right answer to the wrong question.

       NO INVENTED REASON CODE. The run-state case gets a sentence and no
       code, because neither vocabulary the fixture ships -- GI-017's
       taxonomy nor the Actions Blocked Reason Table -- has a member for
       "this run already finished", and minting one that LOOKS like a
       backend code is worse than having none: every other code in this panel
       is rendered verbatim from data, and a reader has no way to tell the
       fabricated one apart. The status token itself is the honest carrier,
       and it is already on the row. REPORTED: the table has no
       not-in-progress member and vC mints 'actions_run_not_in_progress' for
       this same case, so the two versions now differ in copy here. That is a
       fixture gap, not a design difference, and this file must not close it
       on the other versions' behalf. */
    function cancelItem(r, extra) {
      var live = r.status === 'running';
      var item = extra || {};
      item.label = item.label || 'Cancel';
      item.danger = true;
      item.disabled = !live;
      item.reason = '';
      item.sentence = live ? '' : 'Only a run that is still in progress can be cancelled.';
      if (!live) item.tip = item.sentence;
      /* THE CONFIRMATION GATE. _pm-data.js:1176 says of cancel_run that it
         "is destructive-adjacent and needs a confirm the kit cannot currently
         express". The kit expresses it; PM.confirm was there the whole time.
         withMut runs first so an archived repository still wins -- a gate on
         a control that is already disabled would be a sheet in front of a
         dead button. */
      return ask(withMut(item, 'cancel'), {
        act: 'cancel_run', on: runKey(r),
        title: 'Cancel this run?',
        scope: r.name + ' ' + r.run + ' on ' + r.branch + ', running for ' + r.dur + '.',
        consequence: 'In-flight jobs stop where they are and their partial logs are kept. A cancelled run cannot be resumed, only re-run from the start.',
        verb: 'Cancel run', keep: 'Keep running'
      });
    }

    /* THE RUN KEY. Resolution used to be x.run === f.arg, and the run
       NUMBER IS NOT UNIQUE in this fixture: #88 is both a blocked "Deploy to
       staging" and a failed "Release", and #87 is two more. A forEach that
       keeps the last match therefore opened Release #88 whenever the user
       tapped the blocked staging run -- a stack navigator sending you to a
       different object than the row you touched, silently, with the back bar
       showing the title you asked for. Name plus number is unique across all
       26 rows and across all four pinned rows, and it is what the frame title
       already carries. */
    function runKey(r) { return r.name + ' ' + r.run; }
    function findRun(arg) {
      var out = null;
      A.runs.forEach(function (x) { if (runKey(x) === arg) out = x; });
      return out;
    }

    /* ------------------------------------------------------ BLIND SPOT 1
       Three runs carry a blocked block -- code, severity, retryable,
       sentence and an ORDERED allowed_action_ids list -- and the run list
       rendered none of it: a blocked run was a status mark and a name, which
       at 240px is indistinguishable from a queued one to anybody who has not
       memorised the glyph set. The code now rides the identity stack's SECOND
       LINE, the one slot that survives 240px (meta and tail are both tail
       slots and both drop), exactly as the Agents panel already does it.

       The MENU is the row's own allowed_action_ids in the fixture's order,
       not the fixed Open/Re-run/Pin/Cancel quadruple: #88 and #41 allow
       open_environment and request_review, #17 allows open_runners, and
       offering Re-run on a run waiting for a human approval is the same
       mispairing the Agents panel was fixed for. Read verbs stay live on an
       archived repository; request_review is an approval, i.e. a mutation,
       and gates with everything else. */
    function runRow(r, bb) {
      if (r.blocked) {
        var bacts = allowedActions(r.blocked.allowedActionIds).map(function (a) {
          var item = { value: a.value, label: a.label, hint: a.hint };
          return isReadAction(a.value) ? item : withMut(item, 'approve');
        });
        return nav(PMK.row({
          bucket: bb, status: r.status, id: r.name, idMax: idCap(state, bb, { tail: 1 }),
          twoLine: true,
          sub: '<span class="pmk-mono">' +
               esc(el(r.blocked.code, null, codeCap(state, bb))) + '</span>',
          tail: r.run,
          actions: [{ value: 'open', label: 'Open run' }].concat(bacts)
        }), 'run', runKey(r), runKey(r));
      }
      return nav(PMK.row({
        bucket: bb, status: r.status, id: r.name, idMax: idCap(state, bb, { meta: 1, tail: 1 }),
        meta: [r.run, r.branch, r.dur], tail: r.age,
        actions: [
          { value: 'open', label: 'Open run' },
          withMut({ value: 'rerun', label: 'Re-run' }, 'rerun'),
          withMut({ value: 'pin', label: 'Pin run' }, 'pin'),
          cancelItem(r, { value: 'cancel', label: 'Cancel run' })
        ]
      }), 'run', runKey(r), runKey(r));
    }

    function statusFilter() {
      var seen = {}, opts = [{ value: 'all', label: 'All runs' }];
      A.runs.forEach(function (r) {
        if (seen[r.status]) return;
        seen[r.status] = 1;
        opts.push({ value: r.status, label: PMK.statusOf(r.status).label });
      });
      return PMK.select('all', opts, { style: 'flex:1 1 auto;min-width:0' });
    }

    return stackFrame({
      panel: 'git', title: 'GitHub Actions', state: state, bucket: b, stack: stackOf('git'),
      /* Two independent limits, both carried on the frame at EVERY depth: the
         repository's capability state in prose, and the connection's blocked
         code as the condensed marker with a tap back to its actions. Neither
         is a hub-only banner, because in a stack navigator a hub-only banner
         is invisible from three of the four levels. */
      persist: function (depth) {
        return capStrip() + (depth > 0 ? blockedFlag(blocked.code) : '');
      },
      levelActions: [
        { value: 'refresh', label: 'Refresh' },
        { value: 'browser', label: 'Open in browser' },
        { value: 'reconnect', label: 'Reconnect account' }
      ],
      hub: function (bb) {
        var missing = A.secrets.filter(function (s) { return !s.present; }).length;
        var anyDispatchable = false;
        A.workflows.forEach(function (w) { if (w.dispatchable) anyDispatchable = true; });
        return {
          count: A.connection.effective,
          banner: PMK.blocked(blocked),
          rows: [
            hubRow({ bucket: bb, glyph: 'branch', name: 'Current branch', go: 'branch',
                     title: A.readiness.branch,
                     count: A.readiness.green + '/' + A.readiness.of, status: 'ok',
                     summary: A.readiness.snapshot + ', ' + A.readiness.age + ' ago' }),
            hubRow({ bucket: bb, glyph: 'play', name: 'Runs', go: 'runs', title: 'Runs',
                     count: String(A.runs.length), status: 'failed',
                     summary: A.runs[2].run + ' failed on ' + A.runs[2].branch }),
            hubRow({ bucket: bb, glyph: 'square', name: 'Pinned', go: 'pinned', title: 'Pinned',
                     count: String(A.pinned.length), status: 'failed',
                     summary: A.pinned[1].name + ' ' + A.pinned[1].run }),
            hubRow({ bucket: bb, glyph: 'bar', name: 'Workflows', go: 'workflows', title: 'Workflows',
                     count: String(A.workflows.length),
                     summary: 'Dispatch needs the workflow scope' }),
            hubRow({ bucket: bb, glyph: 'slash', name: 'Secrets', go: 'secrets', title: 'Secrets',
                     count: A.secrets.length + ' ' + ELL + ' ' + missing,
                     status: missing ? 'attention' : 'ok',
                     summary: missing + ' not present' }),
            hubRow({ bucket: bb, glyph: 'info', name: 'Settings', go: 'settings', title: 'Settings',
                     status: 'attention',
                     summary: A.connection.state + ' as ' + A.connection.effective }),
            /* BROKE-6. The repo identity carries its own lifecycle word in the
               count slot -- the slot that survives 240px -- and the capability
               sentence as the summary. No status MARK: an archived repo is
               readable, and PM_DATA.status has no token for "readable but
               frozen" (the nearest, 'disabled', is labelled "Unavailable",
               which is the false claim this fix exists to remove). */
            hubRow({ bucket: bb, glyph: 'ext',
                     name: el(REPO.nameWithOwner, 'path', chars(state, 96)),
                     go: 'repository', title: REPO.nameWithOwner,
                     count: REPO.lifecycle,
                     summary: GATED ? capOn + ' of ' + capAll + ' capabilities available'
                                    : REPO.capabilitySentence })
          ],
          /* Dispatch was hard-disabled; now both reasons are derived. The
             missing workflow scope is the reason when the repository is live,
             the lifecycle is the reason when it is not, and withMut runs last
             so the deterministic gate wins. Hard-coding disabled:true happened
             to render correctly against this fixture and would have kept
             rendering a dead button against a live one. */
          primary: '<div class="pmk-btnrow">' +
            PMK.btn('Dispatch', withMut({
              primary: true, disabled: !anyDispatchable,
              tip: blocked.code + ' ' + ELL + ' ' + blocked.sentence
            }, 'dispatch')) +
            PMK.btn('Re-run failed', withMut({}, 'rerun')) + '</div>'
        };
      },
      view: function (st, bb) {
        var f = st[st.length - 1], id = f.id;

        if (id === 'runs' || id === 'branch') {
          var rows = id === 'branch'
            ? A.runs.filter(function (r) { return r.branch === A.readiness.branch; })
            : A.runs;
          return {
            kind: 'list',
            toolbar: statusFilter() + PMK.overflow([
              { value: 'refresh', label: 'Refresh' },
              { value: 'interval', label: 'Auto-refresh interval' }
            ], 'Run list actions'),
            before: id === 'branch'
              ? '<div class="pmk-strip"><span class="pmk-note vD-1 pmk-strip-grow">' +
                esc(el(A.readiness.branch + ' ' + ELL + ' ' + A.readiness.green + '/' +
                        A.readiness.of + ' ' + ELL + ' ' + A.readiness.snapshot + ' ' +
                        A.readiness.age + ' ago', null, chars(state, 8))) +
                '</span></div>'
              : '',
            rows: rows.map(function (r) { return runRow(r, bb); }).join('')
          };
        }

        if (id === 'run') {
          var r0 = findRun(f.arg) || A.runs[0];
          var subs = [];
          /* --------------------------------------------------- BLIND SPOT 5
             THE TRIAGE CAPSULE, and this one is a REGRESSION VS v0 rather
             than a missing nicety: PMConcept7 ships changed files and a
             likely next action on a failed run today, all six Actions
             redesigns dropped it, and the second audit found the data present
             on all four triage blocks and rendered by nobody.
             GitHub_Integration.md:L920 is the requirement.

             It lands on the RUN level, not the job level, for two reasons.
             The run is where a triage reader arrives -- hub > Runs > #310 --
             and it is the level the 480 split pairs with the job, so putting
             the same block on both would print the changed files twice on one
             screen. changedCount is rendered as the section count and the
             paths are rendered as rows, so a file list that is longer than
             the fixture's two never becomes a wrapped paragraph. */
          if (r0.triage && (r0.triage.changedFiles || []).length) {
            subs.push(subList('Changed files', r0.triage.changedCount,
              r0.triage.changedFiles.map(function (p) {
                return PMK.row({
                  bucket: bb, id: p, idKind: 'path', idMax: idCap(state, bb, {}),
                  actions: [{ value: 'open', label: 'Open file' },
                            { value: 'blame', label: 'Open blame' },
                            { value: 'diff', label: 'Open related diff' }]
                });
              })));
          }
          if (r0.triage) {
            subs.push(subList('Jobs', 1, [
              nav(PMK.row({
                bucket: bb, status: r0.status, id: r0.triage.job, idMax: idCap(state, bb, { meta: 1, tail: 1 }),
                meta: [r0.triage.step], tail: r0.dur,
                actions: [{ value: 'open', label: 'Open job' },
                          withMut({ value: 'rerun', label: 'Re-run this job' }, 'rerun')]
              }), 'job', r0.triage.job, runKey(r0))
            ]));
          }
          return {
            kind: 'object', ident: r0.name + ' ' + r0.run, status: r0.status,
            statusWord: PMK.statusOf(r0.status).word,
            blocked: blockedBlock(r0.blocked, bb),
            /* likelyNext is the fixture's own sentence and it is the SECOND
               half of L920: which files changed, and what to do about it.
               It renders as prose above the KVs rather than as a KV, because
               "Rerun after the parser fix lands on thread/import-fixes" is an
               instruction, not a value. */
            note: r0.triage ? r0.triage.likelyNext : '',
            kvs: [['Run', r0.run], ['Branch', r0.branch, 'measure'],
                  ['Duration', r0.dur], ['Age', r0.age + ' ago'],
                  ['Status', PMK.statusOf(r0.status).label],
                  ['Failing step', r0.triage ? r0.triage.step : '', 'measure'],
                  ['Changed', r0.triage ? r0.triage.changedCount + ' files' : '']],
            /* Order is the bar's budget: actionBar shows 1 / 2 / 3 / 3 and
               overflows the rest, so Pin run sits AFTER Open in browser to
               keep the visible bar exactly what it was. A gated control
               reached through the overflow is not a hidden control -- the
               menu renders its reason line, which is more than a greyed
               button in the bar ever says. */
            acts: actionBar([
              withMut({ label: 'Re-run', primary: true }, 'rerun'),
              cancelItem(r0),
              { label: 'Open in browser' },
              withMut({ label: 'Pin run' }, 'pin'),
              { label: 'Compare last success' }   /* longest: always overflow */
            ], bb),
            subs: subs
          };
        }

        if (id === 'job' || id === 'logs') {
          var rj = findRun(f.arg) || A.runs[2];
          var t = rj.triage || { job: rj.name, step: '', lines: [] };
          if (id === 'logs') {
            return {
              kind: 'object', ident: t.step, status: rj.status,
              note: 'Excerpt only. The full log opens in the bottom runtime zone.',
              kvs: [['Job', t.job], ['Run', rj.run], ['Lines', String(t.lines.length)]],
              acts: actionBar([
                { label: 'Open full log', primary: true },
                { label: 'Copy excerpt' },
                { label: 'Download log' }
              ], bb),
              subs: [ '<div class="vD-sub">' + PMK.section('Excerpt', t.lines.length, true) +
                t.lines.map(function (ln) {
                  return '<span class="vD-log">' + esc(el(ln, null, chars(state, 6))) + '</span>';
                }).join('') + '</div>' ]
            };
          }
          return {
            kind: 'object', ident: t.job, status: rj.status,
            statusWord: PMK.statusOf(rj.status).word,
            kvs: [['Step', t.step, 'measure'], ['Run', rj.run],
                  ['Branch', rj.branch, 'measure'], ['Duration', rj.dur]],
            acts: actionBar([
              withMut({ label: 'Re-run this job', primary: true }, 'rerun'),
              { label: 'Open in browser' }
            ], bb),
            subs: t.lines.length ? [ subList('Step logs', t.lines.length, [
              '<div class="pmk-row" data-vd-go="logs" data-vd-title="' + esc(t.step) +
              '" data-vd-arg="' + esc(runKey(rj)) + '" tabindex="0" role="button">' +
              '<span class="vD-glyph">' + ic('ext', 14) + '</span>' +
              '<span class="pmk-id">' + esc(el(t.step, null, chars(state, 40))) + '</span>' +
              '<span class="vD-count">' + t.lines.length + '</span>' +
              '<span class="vD-chev">' + ic('chev', 12) + '</span></div>'
            ]) ] : []
          };
        }

        if (id === 'pinned') {
          return {
            kind: 'list',
            toolbar: '<span class="pmk-strip-grow">' + PMK.filter('Filter pinned') + '</span>',
            rows: A.pinned.map(function (p) {
              return nav(PMK.row({
                bucket: bb, status: p.status, id: p.name, idMax: idCap(state, bb, { meta: 1, chip: 1, tail: 1 }),
                meta: [p.run, p.branch], chip: p.badge, tail: p.age,
                /* Unpin is a WRITE against the repository -- storage-plan
                   :1060 treats a pin as repository state, not as a local
                   view preference -- so it gates with Re-run and Dispatch.
                   It was the one mutation in this panel that stayed live on
                   an archived repo, which is exactly the shape of defect a
                   per-control gate is supposed to make impossible. */
                actions: [{ value: 'open', label: 'Open run' },
                          withMut({ value: 'rerun', label: 'Re-run' }, 'rerun'),
                          ask(withMut({ value: 'unpin', label: 'Unpin', danger: true }, 'pin'), {
                            act: 'unpin_run', on: runKey(p),
                            title: 'Unpin this run?',
                            scope: p.name + ' ' + p.run + ', pinned as ' + p.badge + '.',
                            consequence: 'The pin is repository state, so it is removed for everyone on this repository, not only in this window.',
                            verb: 'Unpin'
                          })]
                /* pinned rows resolve through the same name-plus-number key
                   as the run list: #88 is a pinned Release AND a blocked
                   Deploy to staging, so a pin that opened by number opened
                   the wrong one exactly as the run list did. */
              }), 'run', runKey(p), runKey(p));
            }).join('')
          };
        }

        if (id === 'workflows') {
          return {
            kind: 'list',
            toolbar: '<span class="pmk-strip-grow">' + PMK.filter('Filter workflows') + '</span>',
            rows: A.workflows.map(function (w) {
              return nav(PMK.row({
                bucket: bb, id: w.name, idMax: idCap(state, bb, { meta: 1 }), meta: [w.file],
                actions: [
                  withMut({ value: 'dispatch', label: 'Dispatch', disabled: !w.dispatchable,
                            reason: blocked.code, sentence: blocked.sentence }, 'dispatch'),
                  { value: 'open', label: 'Open workflow file' },
                  withMut({ value: 'pin', label: 'Pin workflow' }, 'pin')
                ]
              }), 'workflow', w.name, w.file);
            }).join('')
          };
        }

        if (id === 'workflow') {
          var wf = A.workflows[0];
          A.workflows.forEach(function (x) { if (x.file === f.arg) wf = x; });
          return {
            kind: 'object', ident: wf.name,
            blocked: wf.dispatchable ? '' : PMK.blocked(blocked),
            kvs: [['File', wf.file, 'measure'],
                  ['Dispatch', wf.dispatchable ? 'available' : 'blocked']],
            acts: actionBar([
              withMut({ label: 'Dispatch', primary: true, disabled: !wf.dispatchable,
                        reason: blocked.code, sentence: blocked.sentence,
                        tip: blocked.code + ' ' + ELL + ' ' + blocked.sentence }, 'dispatch'),
              { label: 'Open workflow file' },
              withMut({ label: 'Pin workflow' }, 'pin')
            ], bb)
          };
        }

        /* BROKE-6, the disclosure half. The capability set is rendered as
           itself -- the fixture's own capability ids, each with the value the
           data carries -- rather than being inferred from which buttons happen
           to be grey, and the seven-state lifecycle vocabulary is listed so a
           reader can see 'archived' is one member of a family rather than the
           only state that exists. */
        if (id === 'repository') {
          var capKV = [];
          for (var ck in CAPS) {
            if (Object.prototype.hasOwnProperty.call(CAPS, ck)) {
              capKV.push([ck, CAPS[ck] ? 'yes' : 'no']);
            }
          }
          return {
            kind: 'object', ident: REPO.nameWithOwner, identKind: 'path',
            /* no buttons on the banner: repository carries no
               allowed_action_ids, and the only honest actions here are the
               two read-only ones already in the bar below. Duplicating them
               into the banner would imply the banner offers a remedy. */
            blocked: PMK.blocked({ code: REPO.lifecycle, sentence: REPO.sentence }),
            /* capStrip() already states this sentence on the frame at every
               level, including this one, so repeating it in the body would
               print the same words twice on one screen. It stays here for the
               unlimited case, where there is no strip to carry it. */
            note: GATED ? '' : REPO.capabilitySentence,
            kvs: [
              ['Lifecycle', REPO.lifecycle],
              ['Mutation', REPO.mutationDisabled ? 'disabled' : 'enabled'],
              ['Host policy', REPO.hostPolicy]
            ].concat(capKV).concat([
              ['States', (REPO.lifecycleStates || []).join(', '), 'prose']
            ]),
            acts: actionBar([
              { label: 'Open in browser', primary: true },
              { label: 'Refresh' }
            ], bb)
          };
        }

        /* manage_secrets is false in the fixture's capability set, and this
           list used to offer no way to manage a secret at all -- which reads
           as a design decision rather than as a capability limit, and is the
           precise failure L1275 names: a capability limit must show as an
           effective capability STATE, not as a missing control. Add, Update
           and Delete are therefore present and gated, on their OWN named
           capability rather than on the umbrella, because manage_secrets is
           the one the fixture models separately (its second canonical
           sentence is 'You can dispatch but cannot manage secrets'). */
        if (id === 'secrets') {
          return {
            kind: 'list',
            toolbar: '<span class="pmk-strip-grow">' + PMK.filter('Filter secrets') + '</span>' +
                     PMK.overflow([
                       withMut({ value: 'add', label: 'Add secret' }, 'manage_secrets'),
                       { value: 'refresh', label: 'Refresh' }
                     ], 'Secret actions'),
            rows: A.secrets.map(function (s) {
              return PMK.row({
                bucket: bb, status: s.present ? 'ok' : 'attention',
                id: s.name, idMax: idCap(state, bb, { meta: 1, tail: 1 }), meta: [s.scope],
                tail: s.present ? 'set' : 'unset',
                actions: [
                  { value: 'open', label: 'Open in GitHub' },
                  withMut({ value: 'update', label: 'Update value' }, 'manage_secrets'),
                  ask(withMut({ value: 'delete', label: 'Delete secret', danger: true },
                              'manage_secrets'), {
                    act: 'delete_secret', on: s.name,
                    title: 'Delete this secret?',
                    scope: s.name + ', scoped to ' + s.scope + '.',
                    consequence: 'Every workflow reading it starts failing on its next run. The value cannot be read back from GitHub to restore it.',
                    verb: 'Delete'
                  })
                ]
              });
            }).join(''),
            after: note('Names only. Values never leave GitHub.')
          };
        }

        var c = A.connection;
        return {
          kind: 'object', ident: c.effective, status: 'attention',
          blocked: PMK.blocked(blocked),
          note: 'Changing the effective account clears pins and selections.',
          kvs: [['Account', c.account], ['Requested', c.requested],
                ['Effective', c.effective], ['State', c.state],
                ['Scopes', c.scopes.join(', '), 'prose'],
                ['Missing', c.missingScopes.join(', '), 'prose']],
          acts: actionBar([
            { label: 'Reconnect', primary: true },
            /* the consequence here is the panel's OWN documented behaviour,
               one line above in this same object: an effective-account change
               clears pins and selections (FinalGUISpec.md:713,
               storage-plan.md:1060), which accountGuard() implements by
               dropping every back-stack. Stating it in the note and not in
               the confirmation would be telling the user afterwards. */
            ask({ label: 'Disconnect', danger: true }, {
              act: 'disconnect_account', on: c.effective,
              title: 'Disconnect this account?',
              scope: c.effective + ', connected with scopes ' + c.scopes.join(', ') + '.',
              consequence: 'Every hosted view in this panel becomes unavailable, and pins and open selections are cleared with the account.',
              verb: 'Disconnect'
            }),
            { label: 'Open settings' }
          ], bb)
        };
      }
    });
  }

  /* ====================================================================
     PANEL 4 — DOCKER MANAGER  (the system's strongest panel)
     CRAU-007's subview set is the exact shape a hub was invented for. The
     arithmetic that kills every horizontal switcher — 11 subviews x 24px =
     264px against a 224px band — is not a constraint here at all, because a
     hub is VERTICAL: eleven 28px rows cost height, which this panel has, not
     width, which it does not. And a hub row carries what a chip cannot: a
     live count, a status mark, and at bucket >= 2 a summary line.

     The fixture ships 10 of the 11; CRAU-007's eleventh, Registries /
     Docker Hub, is nested UNDER Registries, and that nesting is exactly what
     the Registries L1 renders (docker.io/jared and ghcr.io) — the one place
     a chip strip would have had to flatten a hierarchy it cannot express.

     Kubernetes stays VISIBLE with its disabled reason (CRAU-009,
     Containers_Registry_and_Unraid.md:144). Its hub row carries the disabled
     status SHAPE (square glyph, off rail) so you know before you tap, the
     sentence at bucket >= 2, and the full PMK.blocked one tap down. Hiding it
     would be a contract violation; a tooltip would be a different one.
     ==================================================================== */
  function pDocker(D, state) {
    var b = D.bucket(state.width);
    accountGuard(D);
    var K = D.docker;
    var GLYPH = {
      containers: 'square', images: 'bar', compose: 'branch', registries: 'ext',
      build: 'plus', publish: 'play', networks: 'branch', volumes: 'bar',
      contexts: 'filter', k8s: 'slash'
    };
    var sub = {};
    K.subviews.forEach(function (s) { sub[s.id] = s; });

    /* ------------------------------------------------------ BLIND SPOT 3
       THE REQUESTED VS EFFECTIVE IDENTITY BLOCK, six exact labels, CRAU:L927.
       docker.auth ships labels{} with the six strings spelled the way the
       spec spells them, a requested identity, a DIFFERENT effective one, the
       reason they differ, the support line, and both provenance fields --
       inheritedFrom and overriddenBy. It also ships state 'degraded' out of a
       four-member enum, degradedReason 'credential_expired', a CLOSED
       capability set with images:push absent, two gated controls each with
       their own sentence, and two allowed_action_ids.

       Nine of nine Docker designs render none of it, and the audit's sharpest
       line about this panel is that every version "is a list of things you
       own; none is an account of what you are allowed to do with them".

       THE PATTERN ALREADY EXISTED IN THIS FILE. pGit builds exactly this
       block for the GitHub account -- Requested / Effective / State / Scopes /
       Missing -- and it was never carried across. This carries it, with the
       labels read from auth.labels rather than authored, because the fixture
       shipping its own label strings is the fixture saying the wording is
       part of the contract.

       And it is not only a disclosure. images:push is present:false, so Push
       is now VISIBLE and DISABLED wherever it appears, carrying the
       capability id as its reason code and the fixture's own sentence -- the
       same treatment pGit gives an archived repository, and the same rule:
       a capability limit surfaces as a capability STATE, never as a missing
       control. */
    var AU = K.auth || {};
    var AUL = AU.labels || {};
    var AUCAP = {};
    (AU.capabilities || []).forEach(function (c) { AUCAP[c.id] = !!c.present; });
    var AUGATE = {};
    (AU.gated || []).forEach(function (g) { AUGATE[g.capability] = g; });

    /* the capability set is CLOSED, so an id that is not in it is not
       asserted either way -- the test is '=== false', never falsiness. */
    function withCap(item, capId) {
      if (AUCAP[capId] !== false) return item;
      var g = AUGATE[capId] || {};
      item.disabled = true;
      item.reason = capId;
      item.sentence = g.sentence || '';
      item.tip = capId + ' ' + ELL + ' ' + (g.sentence || '');
      return item;
    }

    /* DEGRADED is a third state between available and unavailable, and the
       fixture states it as its own flag: Docker / Hosts is available: true,
       degraded: true, and four of its five hosts are read-only, unreachable
       or untrusted. Without this branch the hub row fell through to no mark
       and no summary -- so in a hub whose entire claim is "a live count, a
       status mark and a one-line summary", the one degraded destination was
       the only row that read as clean. That is the same assertion BROKE-4
       made at the destination, moved up one level: the hub is this system's
       whole navigation model, and a row that reads clean is a row you do not
       open. Both halves come from the fixture -- the flag and its sentence. */
    function subStatus(s) {
      if (s.available === false) return 'disabled';
      if (s.degraded) return 'attention';
      if (s.id === 'containers') return 'attention';
      if (s.id === 'compose') return 'failed';
      if (s.id === 'registries') return 'attention';
      if (s.id === 'publish') return 'running';
      return null;
    }
    function subSummary(s) {
      if (s.available === false) return s.sentence;
      if (s.degraded) return s.sentence;
      if (s.id === 'containers') return K.containers[3].name + ' ' + K.containers[3].detail;
      if (s.id === 'compose') return K.compose.project + ', ' + K.compose.file;
      if (s.id === 'registries') return K.registries[1].host + ' ' + K.registries[1].reason;
      if (s.id === 'build') return K.build.tag;
      if (s.id === 'publish') return K.publish.stages[1].label;
      if (s.id === 'images') return K.images[0].ref;
      return '';
    }

    /* Stop is L156's fourth clause -- "materially change live execution" --
       and the scope is what the container is SERVING, not its name: a
       container with a published port is something else on this machine
       depends on, and that is the fact a reader needs before the tap. */
    function stopContainer(c) {
      return ask({ value: 'stop', label: 'Stop', danger: true }, {
        act: 'stop_container', on: c.name,
        title: 'Stop this container?',
        scope: c.name + ', up ' + c.age +
               (c.ports ? ', serving ' + c.ports : ', with no published ports') + '.',
        consequence: 'Anything connecting through it fails until it is started again. Its writable layer is kept.',
        verb: 'Stop'
      });
    }

    function deleteContainer(c) {
      return ask({ value: 'delete', label: 'Delete', danger: true }, {
        act: 'delete_container', on: c.name,
        title: 'Delete this container?',
        scope: c.name + ', from image ' + c.image + '.',
        consequence: 'The container and its writable layer are removed. Data written inside it rather than into a volume is not recoverable.',
        verb: 'Delete'
      });
    }

    function deleteImage(im) {
      return ask({ value: 'delete', label: 'Delete', danger: true }, {
        act: 'delete_image', on: im.ref,
        title: 'Delete this image?',
        scope: im.ref + ', ' + im.size + ', digest ' + im.digest + '.',
        consequence: 'Any container still referencing it stops being restartable until the image is pulled or built again.',
        verb: 'Delete'
      });
    }

    /* writable is the enablement flag and it is not the confirmation: four of
       the five hosts are read-only, unreachable or untrusted, so most rows
       never reach the sheet at all -- and the one that does is the local
       host every container in the panel is running on, which is exactly the
       row a gate is for. */
    function removeHost(ho, item) {
      item = item || {};
      item.label = item.label || 'Remove host';
      item.danger = true;
      if (!ho.writable) {
        item.disabled = true;
        item.reason = ho.reason || '';
        item.sentence = ho.sentence || '';
        return item;
      }
      return ask(item, {
        act: 'remove_host', on: ho.id,
        title: 'Remove this host?',
        scope: ho.name + ', a ' + ho.kind + ' host on context ' + ho.context +
               ' with ' + ho.containers + ' containers.',
        consequence: 'Its containers and images stay where they are and stop being reachable from this panel. The context entry is deleted.',
        verb: 'Remove'
      });
    }

    function emptyFor(label, count) {
      return PMK.empty('no-data', label,
        count ? count + ' recorded, none loaded into this projection yet.' : 'Nothing to show yet.',
        'Refresh');
    }

    return stackFrame({
      panel: 'docker', title: 'Docker Manager', state: state, bucket: b, stack: stackOf('docker'),
      levelActions: [
        { value: 'refresh', label: 'Refresh' },
        ask({ label: 'Prune unused', danger: true }, {
          act: 'prune_unused', on: K.runtime.context,
          title: 'Prune unused Docker objects?',
          scope: 'Every stopped container, dangling image, unused network and unused volume in context ' +
                 K.runtime.context + ' on ' + K.runtime.engine + '.',
          consequence: 'Reclaimed space is not recoverable. Volumes hold data that no image can rebuild.',
          verb: 'Prune'
        }),
        { value: 'settings', label: 'Open container settings' }
      ],
      hub: function (bb) {
        return {
          count: K.runtime.engine + ' ' + ELL + ' ' + K.runtime.context,
          /* BLIND SPOT 3. Identity leads, above the canonical subview
             enumeration rather than inside it -- it is not a CRAU-007
             subview, and inserting it into that list would misreport the set.
             It leads because it is the scope every row below it is subject
             to: a Registries list read as jared-dev and a Registries list
             read as anonymous are different lists, and only one of them can
             push. */
          rows: [
            hubRow({ bucket: bb, glyph: 'info', name: 'Registry identity',
                     go: 'identity', title: 'Registry identity',
                     count: AU.state || '',
                     status: AU.state === 'authenticated' ? 'ok' : 'attention',
                     summary: AU.effective + ', ' + AU.reason })
          ].concat(K.subviews.map(function (s) {
            return hubRow({
              bucket: bb, glyph: GLYPH[s.id] || 'circle',
              name: s.label, count: s.count,
              status: subStatus(s), summary: subSummary(s),
              off: s.available === false,
              go: s.id, title: s.label
            });
          })),
          primary: '<div class="pmk-btnrow">' + PMK.btn('Compose up', { primary: true }) +
                   PMK.btn('Build image', {}) + '</div>'
        };
      },
      view: function (st, bb) {
        var f = st[st.length - 1], id = f.id;

        /* BLIND SPOT 3, the destination. The six labels come from
           auth.labels, in the fixture's own order, and the two identities sit
           adjacent so the difference between what was asked for and what is
           in force is one line apart rather than one screen apart.

           The capability set renders as ITSELF -- the closed enum with a
           present flag per member -- rather than being inferred from which
           buttons happen to be grey, and the gated controls render as their
           own rows carrying the sentence the fixture writes for each. That
           second list is the part no version in the bakeoff has anywhere:
           it is the panel finally saying what you are not allowed to do, in
           words, instead of leaving a disabled button to imply it. */
        if (id === 'identity') {
          var degraded = AU.state !== 'authenticated';
          return {
            kind: 'object', ident: AU.effective || '',
            status: degraded ? 'attention' : 'ok',
            statusWord: AU.state || '',
            blocked: degraded
              ? PMK.blocked({ code: AU.degradedReason, sentence: AU.reason,
                              allowedActionIds: AU.allowedActionIds })
              : '',
            kvs: [
              [AUL.requested, AU.requested],
              [AUL.effective, AU.effective],
              [AUL.reason, AU.reason, 'prose'],
              [AUL.inheritedFrom, AU.inheritedFrom, 'prose'],
              [AUL.overriddenBy, AU.overriddenBy, 'prose'],
              [AUL.support, AU.support, 'prose'],
              ['State', AU.state],
              ['States', (AU.states || []).join(', '), 'prose']
            ],
            acts: actionBar(allowedActions(AU.allowedActionIds).map(function (a) {
              return { label: a.label, value: a.value };
            }), bb),
            subs: [
              subList('Capabilities', (AU.capabilities || []).length,
                (AU.capabilities || []).map(function (cp) {
                  return PMK.row({
                    bucket: bb, status: cp.present ? 'ok' : 'disabled',
                    id: cp.id, idMax: idCap(state, bb, { tail: 1 }),
                    tail: cp.present ? 'present' : 'absent',
                    actions: [{ value: 'explain', label: 'Explain this state' }]
                  });
                })),
              /* the sentence is the point, so it renders through PMK.blocked
                 where the capability id lands VERBATIM and the sentence wraps
                 -- not as a menu label, which is where a sentence goes to be
                 clipped. opts.actions:false because these entries carry no
                 allowed_action_ids of their own; the two the identity DOES
                 allow are already the action bar above. */
              '<div class="vD-sub">' +
                PMK.section('Gated controls', (AU.gated || []).length, true) +
                (AU.gated || []).map(function (g) {
                  return '<div class="vD-list">' + PMK.row({
                    bucket: bb, status: 'blocked', id: g.control,
                    idMax: idCap(state, bb, { tail: 1 }), tail: 'blocked',
                    actions: [{ value: 'settings', label: 'Open registry settings' }]
                  }) + '</div>' +
                  PMK.blocked({ code: g.capability, sentence: g.sentence }, '', { actions: false });
                }).join('') +
              '</div>'
            ]
          };
        }

        if (id === 'containers') {
          return {
            kind: 'list',
            toolbar: '<span class="pmk-strip-grow">' + PMK.filter('Filter containers') + '</span>' +
                     PMK.overflow([
                       ask({ label: 'Prune stopped', danger: true }, {
                         act: 'prune_stopped', on: K.runtime.context,
                         title: 'Prune stopped containers?',
                         scope: 'Every stopped container in context ' + K.runtime.context +
                                '. The subview reports ' + sub.containers.count + ' running.',
                         consequence: 'Each one is deleted with its writable layer. Anything written inside a container and not into a volume is gone.',
                         verb: 'Prune'
                       }),
                       { value: 'stats', label: 'Open stats' }
                     ], 'Container actions'),
            rows: K.containers.map(function (c) {
              return nav(PMK.row({
                bucket: bb, status: c.status, id: c.name, idMax: idCap(state, bb, { meta: 1, tail: 1 }),
                /* the image ref is the longest string in the panel (up to 30
                   chars) and it is already the first KV at L2 -- carrying it in
                   the L1 meta run costs the container NAME its width to repeat
                   something one tap away. Ports and the failure detail are what
                   a list row is actually scanned for. */
                meta: [c.ports || 'no ports', c.detail], tail: c.age,
                actions: [
                  { value: 'logs', label: 'Logs' },
                  { value: 'shell', label: 'Open in terminal' },
                  { value: 'restart', label: 'Restart' },
                  stopContainer(c)
                ]
              }), 'container', c.name, c.name);
            }).join('')
          };
        }

        if (id === 'container') {
          var c0 = K.containers[0];
          K.containers.forEach(function (x) { if (x.name === f.arg) c0 = x; });
          return {
            kind: 'object', ident: c0.name, status: c0.status,
            statusWord: PMK.statusOf(c0.status).word,
            kvs: [
              ['Image', el(c0.image, 'image', chars(state, 40)), 'measure'],
              ['Ports', c0.ports || 'none'],
              ['Age', c0.age],
              ['Detail', c0.detail || PMK.statusOf(c0.status).label],
              ['URL', c0.url || '', 'measure']
            ],
            acts: actionBar([
              { label: 'Logs', primary: true },
              { label: c0.url ? 'Open app' : 'Inspect' },
              { label: 'Restart' },
              { label: 'Open in terminal' },
              stopContainer(c0),
              deleteContainer(c0)
            ], bb)
          };
        }

        if (id === 'images') {
          return {
            kind: 'list',
            toolbar: '<span class="pmk-strip-grow">' + PMK.filter('Filter images') + '</span>' +
                     PMK.overflow([{ value: 'pull', label: 'Pull image' },
                                   ask({ label: 'Prune dangling', danger: true }, {
                                     act: 'prune_images', on: K.runtime.context,
                                     title: 'Prune dangling images?',
                                     scope: 'Untagged image layers in context ' + K.runtime.context +
                                            ', from a roster of ' + sub.images.count + '.',
                                     consequence: 'A layer no longer on disk has to be rebuilt or pulled again. Tagged images are left alone.',
                                     verb: 'Prune'
                                   })], 'Image actions'),
            rows: K.images.map(function (im) {
              return nav(PMK.row({
                bucket: bb, id: el(im.ref, 'image', chars(state, 44)), idMax: 999,
                meta: [im.size], tail: im.age,
                actions: [withCap({ value: 'push', label: 'Push' }, 'images:push'),
                          { value: 'tag', label: 'Tag' },
                          { value: 'inspect', label: 'Inspect' },
                          deleteImage(im)]
              }), 'image', im.ref, im.ref);
            }).join('')
          };
        }

        if (id === 'image') {
          var im0 = K.images[0];
          K.images.forEach(function (x) { if (x.ref === f.arg) im0 = x; });
          return {
            kind: 'object', ident: im0.ref, identKind: 'image',
            kvs: [['Reference', el(im0.ref, 'image', chars(state, 30)), 'measure'],
                  ['Size', im0.size], ['Age', im0.age],
                  ['Digest', el(im0.digest, 'digest'), 'measure']],
            acts: actionBar([
              withCap({ label: 'Push', primary: true }, 'images:push'),
              { label: 'Tag' },
              { label: 'Inspect' }, deleteImage(im0)
            ], bb)
          };
        }

        if (id === 'compose') {
          return {
            kind: 'list',
            toolbar: '<span class="pmk-strip-grow">' + PMK.filter('Filter services') + '</span>' +
                     PMK.overflow([{ value: 'up', label: 'Compose up' },
                                   ask({ label: 'Compose down', danger: true }, {
                                     act: 'compose_down', on: K.compose.project,
                                     title: 'Take this project down?',
                                     scope: 'All ' + K.compose.services.length + ' services in ' +
                                            K.compose.project + ', from ' + K.compose.file + '.',
                                     consequence: 'Every container in the project stops and is removed. Named volumes survive; anything written inside a container does not.',
                                     verb: 'Compose down'
                                   })], 'Compose actions'),
            rows: K.compose.services.map(function (s) {
              return nav(PMK.row({
                bucket: bb, status: s.status, id: s.name, idMax: idCap(state, bb, { meta: 1 }),
                meta: [K.compose.project],
                actions: [{ value: 'logs', label: 'Logs' }, { value: 'restart', label: 'Restart' }]
              }), 'service', s.name, s.name);
            }).join(''),
            after: note(K.compose.file)
          };
        }

        if (id === 'service') {
          var s0 = K.compose.services[0];
          K.compose.services.forEach(function (x) { if (x.name === f.arg) s0 = x; });
          return {
            kind: 'object', ident: s0.name, status: s0.status,
            statusWord: PMK.statusOf(s0.status).word,
            kvs: [['Project', K.compose.project], ['File', K.compose.file, 'measure'],
                  ['Status', PMK.statusOf(s0.status).label]],
            acts: actionBar([{ label: 'Logs', primary: true }, { label: 'Restart' },
                             ask({ label: 'Stop', danger: true }, {
                               act: 'stop_service', on: s0.name,
                               title: 'Stop this service?',
                               scope: s0.name + ' in project ' + K.compose.project +
                                      ', defined in ' + K.compose.file + '.',
                               consequence: 'Anything in the project depending on it fails until it is started again.',
                               verb: 'Stop'
                             })], bb)
          };
        }

        if (id === 'registries') {
          return {
            kind: 'list',
            toolbar: '<span class="pmk-strip-grow">' + PMK.filter('Filter registries') + '</span>',
            rows: K.registries.map(function (r) {
              return nav(PMK.row({
                bucket: bb, status: r.state === 'ok' ? 'ok' : 'blocked',
                id: r.host, idKind: 'path', idMax: idCap(state, bb, { meta: 1 }),
                meta: [r.capability],
                actions: [{ value: 'browse', label: 'Browse' },
                          { value: 'reconnect', label: 'Reconnect' }]
              }), 'registry', r.host, r.host);
            }).join(''),
            after: note('Docker Hub is a provider capability of a registry row, not a peer surface.')
          };
        }

        if (id === 'registry') {
          var r0 = K.registries[0];
          K.registries.forEach(function (x) { if (x.host === f.arg) r0 = x; });
          return {
            kind: 'object', ident: r0.host, identKind: 'path', status: r0.state === 'ok' ? 'ok' : 'blocked',
            statusWord: PMK.statusOf(r0.state === 'ok' ? 'ok' : 'blocked').word,
            blocked: r0.reason ? PMK.blocked({ code: r0.reason, sentence: r0.sentence,
                                               actions: [{ label: 'Open settings' }] }) : '',
            kvs: [['Host', r0.host, 'measure'], ['Capability', r0.capability],
                  ['State', r0.state]],
            acts: actionBar([
              { label: 'Browse', primary: true, disabled: r0.state !== 'ok' },
              { label: 'Reconnect' },
              ask({ label: 'Remove', danger: true }, {
                act: 'remove_registry', on: r0.host,
                title: 'Remove this registry?',
                scope: r0.host + ', capability ' + r0.capability + ', state ' + r0.state + '.',
                consequence: 'Its stored credential is forgotten with it, and pushes and pulls against this host stop resolving.',
                verb: 'Remove'
              })
            ], bb)
          };
        }

        if (id === 'build') {
          return {
            kind: 'object', ident: K.build.tag, identKind: 'image',
            kvs: [['Tag', el(K.build.tag, 'image', chars(state, 30)), 'measure'],
                  ['Context', K.build.context], ['Dockerfile', K.build.dockerfile, 'measure'],
                  ['Digest', el(K.build.digest, 'digest'), 'measure']],
            acts: actionBar([
              { label: 'Build image', primary: true }, { label: 'Bake' },
              { label: 'Open Dockerfile' }, { label: 'Build settings' }
            ], bb)
          };
        }

        if (id === 'publish') {
          return {
            kind: 'list',
            rows: K.publish.stages.map(function (s) {
              return PMK.row({
                bucket: bb, status: s.status, id: s.n + '. ' + s.label,
                idMax: idCap(state, bb, { tail: 1 }), tail: s.id,
                actions: [{ value: 'open', label: 'Open stage receipt' }]
              });
            }).join(''),
            /* BLIND SPOT 3, the consequence half. images:push is absent from
               the identity's closed capability set, so the publish stage list
               offers Push as a VISIBLE, disabled control carrying the
               capability id as its reason and the fixture's own sentence --
               rather than a live button that fails at the registry. */
            footer: actionBar([withCap({ label: 'Push image', primary: true }, 'images:push'),
                               { label: 'Generate template' }], bb, true)
          };
        }

        /* ---------------------------------------------------------- BROKE-4
           docker.hosts ships FIVE rows and the subview ships count '5'. This
           id used to fall through to emptyFor(), so the hub advertised a
           count, promised a destination, and the destination answered
           "5 recorded, none loaded into this projection yet" -- the panel
           denying, in its own voice, data it had been handed. In a system
           whose entire navigation model is a hub of counts, a destination
           that contradicts the count it was reached by is the worst shape
           this defect can take.

           The five rows are the complete CRAU:L449 host/network family and
           they are NOT interchangeable: a cached offline host still serves
           reads, a policy-blocked host will not recover by retrying, an
           unreachable host might, and an untrusted host must not be trusted
           into working. So state, reason and sentence all render, and the
           three capability booleans drive enablement rather than decorating
           the row -- readable and writable are separate flags because
           Download / Save Local survives a read-only host (:L218), and
           terminalCapable is its own flag because Open in Terminal disables
           only when no terminal-capable host resolves. */
        if (id === 'hosts') {
          return {
            kind: 'list',
            toolbar: '<span class="pmk-strip-grow">' + PMK.filter('Filter hosts') + '</span>' +
                     PMK.overflow([{ value: 'add', label: 'Add host' },
                                   { value: 'refresh', label: 'Refresh hosts' }], 'Host actions'),
            rows: K.hosts.map(function (ho) {
              return nav(PMK.row({
                bucket: bb, status: ho.state, id: ho.name,
                idMax: idCap(state, bb, { meta: 1, tail: 1 }),
                meta: [ho.kind, ho.context, ho.containers + ' containers'],
                tail: ho.age,
                actions: [
                  { value: 'use', label: 'Use this context' },
                  { value: 'terminal', label: 'Open in terminal',
                    disabled: !ho.terminalCapable, reason: ho.reason || '',
                    sentence: ho.sentence || '' },
                  { value: 'refresh', label: 'Refresh' },
                  removeHost(ho, { value: 'remove' })
                ]
              }), 'host', ho.name, ho.id);
            }).join('')
          };
        }

        if (id === 'host') {
          var h0 = K.hosts[0];
          K.hosts.forEach(function (x) { if (x.id === f.arg) h0 = x; });
          return {
            kind: 'object', ident: h0.name, status: h0.state,
            statusWord: PMK.statusOf(h0.state).word,
            /* the reason code VERBATIM, one sentence, per CRAU-021 */
            blocked: h0.reason ? PMK.blocked({
              code: h0.reason, sentence: h0.sentence,
              actions: [{ label: 'Open settings' }]
            }, h0.state === 'prohibited' ? 'err' : '') : '',
            kvs: [
              ['Kind', h0.kind],
              ['Context', h0.context],
              ['Containers', String(h0.containers)],
              ['Age', h0.age],
              ['Readable', h0.readable ? 'yes' : 'no'],
              ['Writable', h0.writable ? 'yes' : 'no'],
              ['Terminal', h0.terminalCapable ? 'yes' : 'no']
            ],
            acts: actionBar([
              { label: 'Use this context', primary: true },
              { label: 'Open in terminal', disabled: !h0.terminalCapable,
                reason: h0.reason || '', sentence: h0.sentence || '' },
              { label: 'Refresh' },
              removeHost(h0, {})
            ], bb)
          };
        }

        if (id === 'k8s') {
          return {
            kind: 'object', ident: sub.k8s.label, status: 'disabled',
            statusWord: PMK.statusOf('disabled').word,
            blocked: PMK.blocked({ code: sub.k8s.reason, sentence: sub.k8s.sentence,
                                   actions: [{ label: 'Open settings' }] }),
            kvs: [['Engine', K.runtime.engine], ['Context', K.runtime.context],
                  ['State', PMK.statusOf('disabled').label]],
            acts: actionBar([{ label: 'Open settings', primary: true },
                             { label: 'Hide this subview' }], bb)
          };
        }

        var sv = sub[id] || { label: id, count: '' };
        return { kind: 'list', rows: '', empty: emptyFor(sv.label, sv.count) };
      }
    });
  }

  /* ====================================================================
     PANEL 5 — TESTING
     The hub rows ARE the five spec regions named verbatim in
     Automated_Testing_System.md:2231 — run_list, active_run_detail,
     failure_list, artifact_preview — plus Policy. They are rendered under
     their spec tokens rather than prettified, because a region set that is
     literal spec text is exactly the thing a hub should not paraphrase.

     redaction_notice is NOT a hub row. It is a display GATE, so it renders
     as a persistent strip above everything at EVERY level and cannot be
     navigated away from. Enablement is per adapter, not global, so the strip
     carries the adapter and its probe rather than one boolean.
     ==================================================================== */
  function pTests(D, state) {
    var b = D.bucket(state.width);
    accountGuard(D);
    var T = D.tests;

    /* ------------------------------------------------------------ BROKE-5
       The gate used to print T.redaction.note unconditionally -- "4 fields
       redacted before display" -- and then render all eleven artifacts,
       including the two that redactionFailed.affectedArtifacts names as
       UNMASKED. Automated_Testing_System.md:L83-L98: "Redaction failures block
       display/persistence until resolved or explicitly authorized." The gate
       exists FOR the failure case, and it was asserting the success case over
       it. That is not a missing feature; it is the panel affirming that
       redaction succeeded on data that says it did not, directly above a
       preview of the artifacts that were not masked -- the "silently downgrade
       evidence quality" outcome the spec names by that exact phrase.

       Redaction resolves PER RUN, which is why the state is COMPUTED rather
       than read off the panel-level object: T.redaction describes the clean
       default, run 209 carries redactionState 'redaction_failed', and
       T.redactionFailed carries the whole payload -- reason code, sentence,
       cause detail, the regions it blocks, dismissible:false, the ordered
       allowed_action_ids and the authorize route.

       The vocabulary is THREE-valued, not two, and redactionStates supplies
       the preview disposition for each: render | placeholder | suppress. The
       gate reads that disposition rather than a boolean, so redaction_pending
       -- which must show a placeholder and NEVER the raw asset -- is handled
       by the same branch the day it appears.

       NON-DISMISSIBLE holds by construction, not by omission: the strip emits
       no dismiss control in either state, and while the gate holds the only
       menu items are the allowed action ids. Dismissal would imply the user
       saw the artifact, which is exactly what the gate is preventing. */
    var RF = T.redactionFailed;
    var redRun = null;
    T.runs.forEach(function (r) { if (r.redactionState === 'redaction_failed') redRun = r; });
    var redId = redRun && RF ? RF.state : T.redaction.state;
    var redDesc = null;
    (T.redactionStates || []).forEach(function (s) { if (s.id === redId) redDesc = s; });
    var redHolds = !!(RF && redDesc && redDesc.preview !== 'render');

    function redBlocks(region) {
      return redHolds && ((RF.blocks || []).indexOf(region) >= 0);
    }

    /* authorize is the one id the fixture gives a label and a destructive
       flag to; the rest derive.

       BLIND SPOT 20, and this is the single clearest case in the fixture.
       The previous version of this comment read "needsConfirm has nowhere to
       land". It had a landing place: PM.confirm, _pm-components.js:498, wired
       and documented. testing.authorize_unredacted ships destructive: true
       AND needsConfirm: true, and it was a one-click menu item -- one tap
       between a suppressed preview and the raw contents of two artifacts
       whose secrets the fixture states were NOT masked, in a gate whose whole
       purpose is that display is blocked "until resolved or explicitly
       authorized". Explicitly authorized is what a confirmation sheet IS.

       The scope names the artifacts by name from affectedArtifacts, because
       "authorize unredacted display" without naming what becomes visible is
       the same non-answer as a danger colour. */
    function redActions() {
      var labels = {}, danger = {};
      if (RF && RF.authorize) {
        labels[RF.authorize.id] = RF.authorize.label;
        danger[RF.authorize.id] = !!RF.authorize.destructive;
      }
      return allowedActions(RF && RF.allowedActionIds, labels, danger).map(function (a) {
        if (!RF || !RF.authorize || a.value !== RF.authorize.id || !RF.authorize.needsConfirm) return a;
        return ask(a, {
          act: 'authorize_unredacted', on: RF.profileId || RF.reason,
          actionId: RF.authorize.id,
          title: 'Show unredacted evidence?',
          scope: (RF.affectedArtifacts || []).length + ' artifacts were not masked: ' +
                 (RF.affectedArtifacts || []).join(', ') + '.',
          consequence: RF.detail + ' Authorizing displays them as captured, and the authorization is recorded against this run.',
          verb: RF.authorize.label
        });
      });
    }

    /* The gate in FULL: the reason code verbatim, the fixture's own blocking
       sentence, and the ordered allowed_action_ids as REAL BUTTONS -- which is
       where the authorize route becomes something a user can see rather than
       something a menu contains.

       This is the half of BROKE-5 that survived the first fix pass in this
       file. The one-line strip below carried the code and, at 240 and 320,
       nothing else: stripCap gives 30 and 40 characters, redaction_profile_
       unavailable is 29 of them, and the sentence was cut off entirely. So the
       panel named a failure it never explained and offered no route out of it,
       at exactly the two widths this system exists to serve. A code with no
       sentence is not a gate.

       R28 (non-dismissible) still holds by construction: no dismiss control is
       emitted here or in the strip, and the only controls are the ids the
       fixture allows. */
    function redBanner() {
      return gateBanner(PMK.blocked({ code: RF.reason, sentence: RF.sentence,
                                      actions: redActions() }, 'err'));
    }

    /* R27: the notice OCCUPIES the region, carrying the blocking reason
       verbatim and the authorize route. It replaces the preview; it does not
       sit above one. The cause detail rides with it here and NOT on the hub --
       "secrets in run 209 were not masked" is a fact about the artifacts, and
       it belongs where the artifacts would have been. */
    function redNotice() {
      return redBanner() + note(RF.detail);
    }

    /* _pm-data.js:1176 names cancel_run as needing a confirm the kit "cannot
       currently express". It can. The scope is the progress the fixture
       already tracks, because "cancel the run" and "throw away 118 of 164
       completed tests" are the same instruction described at two different
       levels of honesty. */
    function cancelRun(r) {
      var live = r && r.status === 'running';
      var item = { label: 'Cancel', danger: true, disabled: !live };
      if (!live) return item;
      return ask(item, {
        act: 'cancel_test_run', on: r.name,
        title: 'Cancel this run?',
        scope: r.name + ', ' + T.active.done + ' of ' + T.active.total +
               ' complete on lane ' + T.active.lane + ' after ' + T.active.elapsed + '.',
        consequence: 'A cancelled run reports no verdict and its partial results are not a pass. Re-running starts from the beginning.',
        verb: 'Cancel run', keep: 'Keep running'
      });
    }

    /* EGRESS, per run. The attestation is the run's OWN redaction state --
       run 209 is the one carrying redaction_failed -- so the sheet says
       something different about the run that was not masked than about the
       ten that were. */
    function exportRun(r) {
      var bad = r && r.redactionState === 'redaction_failed';
      return ask({ label: 'Export', danger: !!bad }, {
        act: 'export_run', on: r.id || r.name,
        title: 'Export this run?',
        scope: r.name + (r.id ? ', run ' + r.id : '') + ', with its artifacts.',
        consequence: bad
          ? RF.reason + ': ' + RF.detail + ' Exporting writes them out unmasked.'
          : T.redaction.note + '. The files leave the workspace.',
        verb: 'Export'
      });
    }

    function gate() {
      if (!redHolds) {
        return '<div class="pmk-strip">' +
          '<span class="vD-glyph">' + ic('info', 14) + '</span>' +
          '<span class="pmk-note vD-1 pmk-strip-grow">' +
            esc(el(T.redaction.note, null, chars(state, 60))) + '</span>' +
          '<span class="vD-count">' + esc(T.runtime.adapter) + '</span>' +
          PMK.overflow([{ value: 'inspect', label: 'Inspect redaction' }], 'Redaction actions') +
          '</div>';
      }
      /* ONE line, at every level, in the same slot and at the same height as
         the clean strip -- a gate that reflows the panel when it trips is a
         gate that pushes failure_list off-screen mid-read (R29). The code
         leads because it is the part that must render verbatim at 240px; the
         sentence follows and is cut from the right by stripCap, which is
         measured rather than guessed and which is why the glyph stands down
         at 240px. */
      return '<div class="pmk-strip">' +
        (b >= 1 ? '<span class="vD-glyph">' + ic('warn', 14) + '</span>' : '') +
        '<span class="vD-flag-c">' +
          esc(el(RF.reason + ' ' + ELL + ' ' + redDesc.line, null, stripCap(state, b))) +
        '</span>' +
        PMK.overflow(redActions(), 'Redaction actions') +
        '</div>';
    }

    return stackFrame({
      panel: 'tests', title: 'Testing', state: state, bucket: b, stack: stackOf('tests'),
      /* WHERE THE GATE LIVES, by level. This file already states the rule for
         blocked state (see blockedFlag): the full banner with its ordered
         actions lives on the HUB, and deeper levels carry the code verbatim in
         a fixed one-line marker so the block can never silently disappear as
         you descend. The redaction gate now follows that same rule instead of
         being a strip everywhere and a banner nowhere.

         R29 is unaffected. Its requirement is that the gate must not reflow
         the level a user is READING when it trips -- which is why L1 and L2
         keep the one-line strip, in the same slot and at the same height as
         the clean strip. The hub is five rows and a pinned footer; there is
         nothing on it to push off-screen, and it is the one level a user who
         never descends will actually see. */
      persist: function (depth) { return depth === 0 && redHolds ? '' : gate(); },
      levelActions: [
        { value: 'run', label: 'Run tests' },
        { value: 'receipt', label: 'Open receipt' },
        /* EGRESS. Export is not destructive and its gate says so -- nothing
           is lost -- but it moves evidence out of the workspace, and the
           redaction state of what is leaving is the one fact that decides
           whether that is safe. It is stated from the live gate rather than
           from T.redaction.note, which is the clean default and is false
           right now. */
        ask({ label: 'Export results' }, {
          act: 'export_results', on: 'tests',
          title: 'Export these results?',
          scope: T.runs.length + ' runs and ' + T.artifacts.length +
                 ' artifacts leave the workspace as files.',
          consequence: redHolds
            ? RF.reason + ': ' + RF.sentence + ' Exporting now writes them out in that state.'
            : T.redaction.note + ' on the current profile.',
          verb: 'Export', danger: redHolds
        })
      ],
      hub: function (bb) {
        return {
          count: T.runtime.probe,
          banner: redHolds ? redBanner() : '',
          rows: [
            hubRow({ bucket: bb, glyph: 'bar', name: 'run_list', go: 'run_list', title: 'run_list',
                     count: String(T.runs.length), status: T.runs[0].status,
                     summary: T.runs[0].id + ' ' + T.runs[0].when + ' ago' }),
            hubRow({ bucket: bb, glyph: 'play', name: 'active_run_detail', go: 'active',
                     title: 'active_run_detail',
                     count: T.active.done + '/' + T.active.total, status: T.active.status,
                     summary: T.active.lane + ', retry ' + T.active.retry }),
            hubRow({ bucket: bb, glyph: 'x', name: 'failure_list', go: 'failure_list',
                     title: 'failure_list',
                     count: String(T.failures.length), status: 'failed',
                     summary: T.failures[0].test }),
            /* the count stays honest -- eleven artifacts exist, they are held,
               not absent -- but the hub must not name one while the gate
               holds, and the row must not be the only clean-looking row on
               the level the gate is blocking. */
            hubRow({ bucket: bb, glyph: 'square', name: 'artifact_preview', go: 'artifact_preview',
                     title: 'artifact_preview',
                     count: String(T.artifacts.length),
                     status: redBlocks('artifact_preview') ? 'blocked' : null,
                     summary: redBlocks('artifact_preview')
                       ? redDesc.line
                       : T.artifacts[0].name + ', ' + T.artifacts[0].size }),
            hubRow({ bucket: bb, glyph: 'filter', name: 'Policy', go: 'policy', title: 'Policy',
                     count: String(T.policy.capabilities.length), status: 'attention',
                     summary: T.policy.visibility })
          ],
          primary: '<div class="pmk-btnrow">' +
            PMK.btn('Run', { primary: true, disabled: !T.runtime.enabled }) +
            gbtn('Cancel', cancelRun(T.active)) + '</div>'
        };
      },
      view: function (st, bb) {
        var f = st[st.length - 1], id = f.id;

        if (id === 'run_list') {
          return {
            kind: 'list',
            toolbar: '<span class="pmk-strip-grow">' + PMK.filter('Filter runs') + '</span>',
            rows: T.runs.map(function (r) {
              return nav(PMK.row({
                bucket: bb, status: r.status, id: r.name, idMax: idCap(state, bb, { meta: 1, tail: 1 }),
                meta: [r.id], tail: r.when,
                actions: [{ value: 'open', label: 'Open run' },
                          { value: 'receipt', label: 'Open receipt' }]
              }), 'run', r.name, r.id);
            }).join('')
          };
        }

        if (id === 'run' || id === 'active') {
          var r0 = T.active;
          if (id === 'run') { T.runs.forEach(function (x) { if (x.id === f.arg) r0 = x; }); }
          /* run_list rows and active_run_detail are DIFFERENT projections of
             different shapes -- a TestRunReceipt row carries no per-run counts.
             The selected run only borrows the detail fields when it IS the
             active run; otherwise the object shows what its own record has,
             rather than lending it another run's numbers. */
          var live = r0.status === 'running';
          var isActive = live && r0.name === T.active.name;
          return {
            kind: 'object', ident: r0.name, status: r0.status,
            statusWord: PMK.statusOf(r0.status).word,
            kvs: isActive ? [
              ['Adapter', T.runtime.adapter],
              ['Lane', T.active.lane],
              ['Retry', T.active.retry],
              ['Elapsed', T.active.elapsed],
              ['Progress', T.active.done + '/' + T.active.total],
              ['Counts', T.active.passed + ' / ' + T.active.failed + ' / ' + T.active.skipped]
            ] : [
              ['Adapter', T.runtime.adapter],
              ['Run', r0.id || ''],
              ['When', r0.when ? r0.when + ' ago' : ''],
              ['Status', PMK.statusOf(r0.status).label]
            ],
            /* contextual PAIR only: Watch + Cancel while live, Receipt + Export
               when terminal. Four buttons in a 224px band is four ellipses. */
            acts: actionBar(live
              ? [{ label: 'Watch', primary: true }, cancelRun(r0),
                 { label: 'Open receipt' }, exportRun(r0)]
              : [{ label: 'Open receipt', primary: true }, exportRun(r0),
                 { label: 'Re-run' }], bb),
            subs: isActive ? [
              subList('failure_list', T.failures.length, T.failures.map(function (x) {
                return nav(PMK.row({
                  bucket: bb, status: 'failed', id: x.test, idMax: idCap(state, bb, {}),
                  actions: [{ value: 'open', label: 'Open failure' }]
                }), 'failure', x.test, x.test);
              })),
              /* the same region, reached from the run rather than the hub, and
                 therefore the same gate. The section keeps the real count:
                 the artifacts exist, their preview is withheld. */
              redBlocks('artifact_preview')
                ? '<div class="vD-sub">' +
                    PMK.section('artifact_preview', T.artifacts.length, true) +
                    redNotice() + '</div>'
                : subList('artifact_preview', T.artifacts.length, T.artifacts.map(function (a) {
                    return nav(PMK.row({
                      bucket: bb, id: a.name, idMax: idCap(state, bb, { meta: 1, tail: 1 }),
                      meta: [a.kind], tail: a.size,
                      actions: [{ value: 'open', label: 'Open artifact' }]
                    }), 'artifact', a.name, a.name);
                  }))
            ] : []
          };
        }

        if (id === 'failure_list') {
          return {
            kind: 'list',
            toolbar: '<span class="pmk-strip-grow">' + PMK.filter('Filter failures') + '</span>',
            rows: T.failures.map(function (x) {
              return nav(PMK.row({
                bucket: bb, status: 'failed', id: x.test, idMax: idCap(state, bb, {}),
                actions: [{ value: 'open', label: 'Open failure' },
                          { value: 'copy', label: 'Copy assertion' }]
              }), 'failure', x.test, x.test);
            }).join('')
          };
        }

        if (id === 'failure') {
          var fl = T.failures[0];
          T.failures.forEach(function (x) { if (x.test === f.arg) fl = x; });
          return {
            kind: 'object', ident: fl.test, status: 'failed',
            statusWord: PMK.statusOf('failed').word,
            kvs: [['Assertion', fl.message, 'prose'], ['Adapter', T.runtime.adapter],
                  ['Run', T.active.name, 'measure']],
            acts: actionBar([{ label: 'Open failure', primary: true },
                             { label: 'Copy assertion' }, { label: 'Re-run this test' }], bb)
          };
        }

        if (id === 'artifact_preview') {
          /* R27. Preview SUPPRESSED, notice in its place. No filter toolbar
             either: filtering a list that is not rendered is a control that
             implies the list is one interaction away. */
          if (redBlocks('artifact_preview')) {
            return { kind: 'list', rows: '', empty: redNotice() };
          }
          return {
            kind: 'list',
            toolbar: '<span class="pmk-strip-grow">' + PMK.filter('Filter artifacts') + '</span>',
            rows: T.artifacts.map(function (a) {
              return nav(PMK.row({
                bucket: bb, id: a.name, idMax: idCap(state, bb, { meta: 1, tail: 1 }), meta: [a.kind], tail: a.size,
                actions: [{ value: 'open', label: 'Open artifact' },
                          { value: 'download', label: 'Save local copy' }]
              }), 'artifact', a.name, a.name);
            }).join('')
          };
        }

        if (id === 'artifact') {
          var a0 = T.artifacts[0];
          T.artifacts.forEach(function (x) { if (x.name === f.arg) a0 = x; });
          /* the gate blocks the region, so it blocks every artifact in it --
             but the two rows affectedArtifacts names are the ones whose
             secrets were not masked, and they get the cause detail rather
             than the generic block sentence. Open and Save stay VISIBLE and
             disabled, citing the code: a hidden control teaches nothing. */
          var held = redBlocks('artifact_preview');
          var named = held && (RF.affectedArtifacts || []).indexOf(a0.name) >= 0;
          return {
            kind: 'object', ident: a0.name,
            status: held ? 'blocked' : null,
            statusWord: held ? PMK.statusOf('blocked').word : '',
            blocked: held ? gateBanner(PMK.blocked({ code: RF.reason,
                                          sentence: named ? RF.detail : RF.sentence,
                                          actions: redActions() }, 'err')) : '',
            note: held ? '' : T.redaction.note,
            kvs: [['Kind', a0.kind], ['Size', a0.size], ['Run', T.active.name, 'measure']],
            acts: actionBar([
              { label: 'Open artifact', primary: true, disabled: held,
                reason: held ? RF.reason : '', sentence: held ? RF.sentence : '' },
              { label: 'Save local copy', disabled: held,
                reason: held ? RF.reason : '', sentence: held ? RF.sentence : '' },
              { label: 'Inspect redaction' }
            ], bb)
          };
        }

        if (id === 'policy') {
          return {
            kind: 'list',
            rows: T.policy.capabilities.map(function (cp) {
              return nav(PMK.row({
                bucket: bb, status: cp.state, id: cp.label, idMax: idCap(state, bb, { tail: 1 }),
                tail: cp.mode,
                actions: [{ value: 'mode', label: 'Change mode' }]
              }), 'capability', cp.label, cp.id);
            }).join(''),
            after: note(T.policy.visibility)
          };
        }

        var cap0 = T.policy.capabilities[0];
        T.policy.capabilities.forEach(function (x) { if (x.id === f.arg) cap0 = x; });
        return {
          kind: 'object', ident: cap0.label, status: cap0.state,
          statusWord: PMK.statusOf(cap0.state).word,
          blocked: cap0.reason ? PMK.blocked({ code: cap0.reason, sentence: cap0.sentence,
                                               actions: [{ label: 'Open settings' }] },
                                             cap0.state === 'prohibited' ? 'err' : '') : '',
          kvs: [['Mode', cap0.mode], ['State', PMK.statusOf(cap0.state).label],
                ['Adapter', T.runtime.adapter], ['Probe', T.runtime.probe]],
          acts: '<div class="pmk-btnrow vD-acts">' +
            PMK.select(cap0.mode, [
              { value: 'auto', label: 'Auto' }, { value: 'on', label: 'On' },
              { value: 'off', label: 'Off' }
            ], { style: 'flex:1 1 auto;min-width:0' }) + '</div>'
        };
      }
    });
  }

  /* ====================================================================
     PANEL 6 — AGENTS
     The panel mirrors the subagent registry and holds no state of its own
     (F3-452), so every hub row is a projection count and every L2 is a
     read-only record with routes out. Counts are computed from the fixture
     arrays, never asserted.

     L2 carries the lineage entrypoints from D.agents.lineageTargets. At 240
     and 320 they are two real buttons plus the overflow, because six rows of
     routes below a record is a menu wearing a list's clothes; at 380+ they
     become a proper sub-list. Blocked agents render blocked_reason_code
     verbatim — research/agents.md notes needs_authority does not exist in
     Plans, which is exactly why the code must be shown rather than
     translated away.
     ==================================================================== */
  function pAgents(D, state) {
    var b = D.bucket(state.width);
    accountGuard(D);
    var G = D.agents;
    function count(s) {
      return G.active.filter(function (a) { return a.status === s; }).length;
    }
    var running = count('running'), blockedN = count('blocked'), queuedN = count('queued');

    function agentRow(a, bb, where) {
      return nav(PMK.row({
        bucket: bb, status: a.status, id: a.name, idMax: idCap(state, bb, { meta: 1, tail: 1 }),
        meta: [a.persona, a.target || a.outcome, a.thread], tail: a.elapsed || a.when,
        actions: [
          { value: 'lineage', label: 'Open lineage' },
          { value: 'thread', label: 'Open owning thread' },
          cancelAgent(a)
        ]
      }), 'agent', a.name, where + ':' + a.name);
    }

    /* Cancelling a delegation aborts work another surface is waiting on, and
       the owning thread is the scope: F3-452 makes this panel a mirror of the
       registry, so the consequence lands on the thread, not here. Both facts
       are the row's own. */
    function cancelAgent(a) {
      var item = { value: 'cancel', label: 'Cancel', danger: true,
                   disabled: a.status !== 'running' };
      if (item.disabled) return item;
      return ask(item, {
        act: 'cancel_agent', on: a.name,
        title: 'Cancel this delegation?',
        scope: a.name + ' as ' + a.persona +
               (a.target ? ', working on ' + a.target : '') +
               (a.elapsed ? ', running ' + a.elapsed : '') + '.',
        consequence: 'Its partial work is discarded and ' +
                     (a.thread ? a.thread : 'the owning thread') +
                     ' is left without the result it is waiting for.',
        verb: 'Cancel delegation', keep: 'Keep running'
      });
    }

    /* ------------------------------------------------------------ BROKE-9
       The blocked level used to be five bare names: agentRow drops its meta
       run below 380px and its tail below 320px, so at the width this system
       exists to serve, a blocked delegation rendered as a status mark and a
       name -- no reason code, and a fixed Open lineage / Open owning thread /
       Cancel triple that is not what any of the five rows allows.

       Both halves are in the fixture and both are per-row. The reason code
       rides the identity stack's SECOND LINE, which is the one slot that
       survives 240px (meta and tail are both tail slots and both drop), so a
       blocked episode can never again arrive with nothing but a name. And the
       menu is built from allowed_action_ids in the order the data gives them,
       because the sets genuinely differ: the only action that can unblock
       Deploy Sentinel is grant_authority, and Schema Cartographer -- whose
       session is restoring by itself, with a sentence that says in as many
       words that no action is needed yet -- allows open_for_edit and nothing
       else. Offering Abort node there was the worst pairing in the bakeoff.

       twoLine also suppresses the meta run, which is deliberate: persona,
       target and thread are one tap down on the record, and the reason is the
       only thing a blocked row is scanned for. */
    function blockedRow(a, bb, where) {
      var acts = allowedActions(a.allowedActionIds);
      /* a row the data allows nothing on gets navigation, never a minted
         action -- research/agents.md is explicit that an agents-local
         authority state must not be invented. */
      if (!acts.length) acts = [{ value: 'lineage', label: G.lineageTargets[5] }];
      return nav(PMK.row({
        bucket: bb, status: a.status, id: a.name, idMax: idCap(state, bb, { tail: 1 }),
        twoLine: true,
        sub: '<span class="pmk-mono">' +
             esc(el(a.reason || '', null, codeCap(state, bb))) + '</span>',
        /* blockedFor, not elapsed: elapsed is the age of the RUN. For Media
           Pipeline Wrangler those are 52m 04s and 12m 31s, and for Schema
           Cartographer 18m 47s and 38s. */
        tail: a.blockedFor || a.elapsed,
        actions: acts
      }), 'agent', a.name, where + ':' + a.name);
    }

    function find(arg) {
      var parts = String(arg || '').split(':');
      var list = parts[0] === 'completed' ? G.completed : parts[0] === 'available' ? G.available : G.active;
      var out = list[0];
      list.forEach(function (x) { if (x.name === parts[1]) out = x; });
      return out;
    }

    return stackFrame({
      panel: 'agents', title: 'Agents', state: state, bucket: b, stack: stackOf('agents'),
      levelActions: [
        { value: 'lineage', label: 'Open lineage' },
        { value: 'config', label: 'Open Agent Config' }
      ],
      hub: function (bb) {
        return {
          count: G.active.length + ' live',
          rows: [
            hubRow({ bucket: bb, glyph: 'arc', name: 'Active', go: 'active', title: 'Active',
                     count: String(running), status: 'running',
                     summary: G.active[0].name + ', ' + G.active[0].elapsed }),
            hubRow({ bucket: bb, glyph: 'bar', name: 'Blocked', go: 'blocked', title: 'Blocked',
                     count: String(blockedN), status: 'blocked',
                     summary: G.active[2].reason }),
            hubRow({ bucket: bb, glyph: 'circle', name: 'Queued', go: 'queued', title: 'Queued',
                     count: String(queuedN), status: 'queued',
                     summary: G.active[3].name }),
            hubRow({ bucket: bb, glyph: 'check', name: 'Completed', go: 'completed', title: 'Completed',
                     count: String(G.completed.length), status: 'attention',
                     summary: G.completed[2].name + ', ' + G.completed[2].outcome }),
            hubRow({ bucket: bb, glyph: 'square', name: 'Available', go: 'available', title: 'Available',
                     count: String(G.available.length),
                     summary: G.available.length + ' personas resolve' })
          ],
          primary: PMK.btn('Open lineage', { primary: true, wide: true })
        };
      },
      view: function (st, bb) {
        var f = st[st.length - 1], id = f.id;

        if (id === 'available') {
          return {
            kind: 'list',
            toolbar: '<span class="pmk-strip-grow">' + PMK.filter('Filter personas') + '</span>',
            rows: G.available.map(function (a) {
              return nav(PMK.row({
                bucket: bb, id: a.name, idMax: idCap(state, bb, { meta: 1 }), meta: [a.persona],
                actions: [{ value: 'config', label: 'Open in Agent Config' }]
              }), 'agent', a.name, 'available:' + a.name);
            }).join(''),
            after: note('Mirrors the subagent registry. Edits route to Agent Config.')
          };
        }

        if (id === 'completed') {
          return {
            kind: 'list',
            toolbar: '<span class="pmk-strip-grow">' + PMK.filter('Filter completed') + '</span>',
            rows: G.completed.map(function (a) { return agentRow(a, bb, 'completed'); }).join('')
          };
        }

        if (id === 'active' || id === 'blocked' || id === 'queued') {
          var want = id === 'active' ? 'running' : id;
          return {
            kind: 'list',
            toolbar: '<span class="pmk-strip-grow">' + PMK.filter('Filter agents') + '</span>',
            rows: G.active.filter(function (a) { return a.status === want; })
                          .map(function (a) {
                            return want === 'blocked'
                              ? blockedRow(a, bb, 'active')
                              : agentRow(a, bb, 'active');
                          }).join('')
          };
        }

        var a0 = find(f.arg);
        var lineage = G.lineageTargets;
        return {
          kind: 'object', ident: a0.name, status: a0.status || null,
          statusWord: a0.status ? PMK.statusOf(a0.status).word : '',
          /* BROKE-9 again, on the record. The banner's buttons are the ROW's
             allowed_action_ids, in order -- not two lineage routes, which are
             navigation and were never actions. A row the data allows nothing
             on gets a banner with no buttons; lineage still has the sub-list
             and the action bar below. */
          blocked: a0.reason ? PMK.blocked({ code: a0.reason, sentence: a0.sentence,
                                             actions: allowedActions(a0.allowedActionIds) }) : '',
          note: a0.note || '',
          kvs: [
            ['Persona', a0.persona],
            ['Target', a0.target || ''],
            ['Thread', a0.thread || '', 'prose'],
            ['Run', a0.run || ''],
            ['Elapsed', a0.elapsed || ''],
            ['Outcome', a0.outcome || ''],
            ['When', a0.when || '']
          ],
          /* Below 380 the six lineage routes are ONE primary button plus the
             overflow: 'Open investigation record' is 25 characters and a 240px
             action bar gives a button 89px, so rendering them as a button row
             would ellipsise five of the six into ambiguity. At 380+ they get a
             proper sub-list where each route reads in full. */
          acts: actionBar(bb >= 2
            ? [cancelAgent(a0)]
            : [{ label: lineage[5], primary: true }]
                .concat(lineage.slice(0, 5).map(function (t) { return { label: t }; }))
                .concat([cancelAgent(a0)]),
            bb),
          subs: bb >= 2 ? [ subList('Lineage', lineage.length, lineage.map(function (t) {
            return '<div class="pmk-row" tabindex="0" role="button">' +
              '<span class="vD-glyph">' + ic('ext', 14) + '</span>' +
              '<span class="pmk-id">' + esc(el(t, null, chars(state, 20))) + '</span>' +
              '<span class="vD-chev">' + ic('chev', 12) + '</span></div>';
          })) ] : []
        };
      }
    });
  }

  /* ====================================================================
     PANEL 7 — ARTIFACTS
     The hub is the family taxonomy, which is the only closed, short,
     ordered axis this surface has.

     THE CRITICAL CONSTRAINT. The runtime artifact envelope has NO title
     field: artifact_id and artifact_type are the only guaranteed identity
     strings. artifact_type runs to 21 characters (before_after_snapshot),
     which is ~143px, 65% of the 224px band, BEFORE the human label gets a
     pixel. So the kind is never a leading chip here:

       bucket 0-1  a 14px glyph in the leading slot, its data-pm-tip carrying
                   the full artifact_type. Not the sole affordance — the kind
                   is a real KV one level down.
       bucket 2-3  the glyph plus the kind as the FIRST segment of the meta
                   run, which drops whole rather than clipping.
       L2          a proper KV, first in the block, where it has the full band.

     Bundle members lead with evidence_role, not kind: role is a 6-value
     closed enum, 4-12 characters, deterministically ordered, and it explains
     what the row DID. Kind follows as the tail.

     Family counts are the projection counts; the list shows the rows this
     projection has actually loaded. The two are not the same number and the
     panel does not pretend they are.
     ==================================================================== */
  function pArtifacts(D, state) {
    var b = D.bucket(state.width);
    accountGuard(D);
    var R = D.artifacts;
    var KIND_GLYPH = {
      code_diff: 'branch', validation_test: 'check', api_web_call: 'search',
      browser_recording: 'ext', screenshot: 'square', cost_usage: 'bar',
      tool_llm_trace: 'info', restore_point: 'clock'
    };
    var FAM_GLYPH = {
      all: 'bar', evidence: 'check', web: 'search', browser: 'ext',
      bundle: 'branch', receipt: 'square'
    };

    function artRow(r, bb) {
      var h = '<div class="pmk-row" data-vd-go="artifact" data-vd-title="' + esc(r.kind) +
        '" data-vd-arg="' + esc(r.kind) + '" tabindex="0" role="button" data-pm-ctx="Row actions">';
      h += PMK.statusMark(r.status);
      h += '<span class="vD-glyph" data-pm-tip="' + esc(r.kind) + '">' +
           ic(KIND_GLYPH[r.kind] || 'circle', 14) + '</span>';
      /* 24px extra for the leading kind glyph, on top of the tail and meta
         slots. The title is a best-effort overlay -- when summary is absent
         the envelope leaves only artifact_id, so the identity slot is the
         only thing allowed to grow and the only thing allowed to elide.
         The kind does NOT enter the meta run: the glyph already carries it at
         every bucket, and re-stating a 17-character artifact_type inside the
         run would cost the title a third of its remaining width for a fact the
         leading slot has already given away. */
      /* Explicit per-bucket ladder rather than idCap's generic one, because
         this row is the only one carrying a leading glyph AND the panel where
         the identity is scarcest. glyph / +tail / +1 meta segment / +2.
         Measured ladder, all 8 themes: 20 / 23 / 29 / 27 / 38 characters.

         ACCEPTED ELLIPSIS. One row still ellipsizes at 380 and 480 in the
         wider faces: api_web_call, whose first meta segment is the 19-char
         command id cmd.chat.web.search -- roughly double a normal segment.
         Budgeting every row for that outlier would cost the other seven five
         characters each, so it is left to elide, and eliding is CORRECT here:
         the identity is the kit row's one compressible slot by design, the
         metadata drops whole rather than clipping, and the untruncated title
         plus the command id are both KVs one tap down. A drill stack can
         afford to lose characters at L1 precisely because L2 exists. */
      h += '<span class="pmk-id">' +
        esc(el(r.title, null, chars(state, [24, 64, 138, 168][bb]))) + '</span>';
      if (bb >= 2) h += PMK.metaRun(r.meta.slice(0, 2), bb, { cap: bb >= 3 ? 2 : 1 });
      if (bb >= 1) h += '<span class="pmk-tail pmk-tail--time">' +
        esc(r.meta[r.meta.length - 1]) + '</span>';
      h += PMK.overflow([
        { value: 'open', label: 'Open artifact' },
        { value: 'copy', label: 'Copy identity' },
        exportRecord(r),
        { type: 'sep' },
        ask({ label: 'Remove from view', danger: true }, {
          act: 'remove_artifact', on: r.id,
          title: 'Remove this artifact from the view?',
          scope: r.id + ', ' + r.kind + ', in the ' + r.family + ' family.',
          consequence: 'The record stays in the store and stops being listed here. Its retention is ' +
                       (r.retention || 'unstated') + ' and this does not change it.',
          verb: 'Remove'
        })
      ]);
      return h + '</div>';
    }

    /* ------------------------------------------------------------- EGRESS
       Export is the one operation on this panel that cannot be undone, and it
       is not destructive -- nothing is lost, something LEAVES. So the gate
       carries a REDACTION ATTESTATION rather than a warning, and the
       attestation is COUNTED from the record's own metadata: four of the 47
       rows carry a 'redacted N' segment, and a sheet that said "check
       redaction" over a record with no redaction marker would be teaching the
       reader to ignore it. */
    function redactedNote(r) {
      var seg = '';
      (r.meta || []).forEach(function (m) {
        if (String(m).indexOf('redacted') === 0) seg = String(m);
      });
      return seg ? 'Its record is marked ' + seg + '.'
                 : 'Its record carries no redaction marker.';
    }

    function exportRecord(r) {
      return ask({ value: 'export', label: 'Export record' }, {
        act: 'export_record', on: r.id,
        title: 'Export this record?',
        scope: r.id + ', ' + r.kind + '. ' + redactedNote(r),
        consequence: 'The record is written outside the workspace, where this panel can no longer withdraw or re-redact it.',
        verb: 'Export', danger: false
      });
    }

    function memberRow(m, bb) {
      return '<div class="pmk-row" tabindex="0" role="button">' +
        '<span class="vD-role">' + esc(m.role) + '</span>' +
        '<span class="pmk-id pmk-dim">' + esc(el(m.kind, null, chars(state, 70))) + '</span>' +
        PMK.overflow([{ value: 'open', label: 'Open member' }]) + '</div>';
    }

    function rowsFor(fam) {
      if (fam === 'all') return R.rows;
      return R.rows.filter(function (r) { return r.family === fam; });
    }

    /* the view export attests over the SET, so the count is computed rather
       than asserted: how many of the records leaving carry a redaction
       marker, out of how many are loaded. */
    function exportView() {
      var marked = R.rows.filter(function (r) {
        var hit = false;
        (r.meta || []).forEach(function (m) {
          if (String(m).indexOf('redacted') === 0) hit = true;
        });
        return hit;
      }).length;
      return ask({ value: 'export_view', label: 'Export view' }, {
        act: 'export_view', on: 'all',
        title: 'Export this view?',
        scope: R.rows.length + ' loaded records leave the workspace. ' + marked +
               ' of them carry a redaction marker.',
        consequence: 'Each is written outside the workspace, where this panel can no longer withdraw or re-redact it.',
        verb: 'Export', danger: false
      });
    }

    return stackFrame({
      panel: 'artifacts', title: 'Artifacts', state: state, bucket: b, stack: stackOf('artifacts'),
      levelActions: [
        exportView(),
        { value: 'import', label: 'Import bundle' },
        ask({ label: 'Run cleanup', danger: true }, {
          act: 'run_cleanup', on: 'artifacts',
          title: 'Run artifact cleanup?',
          scope: 'Every one of the ' + R.families[0].count +
                 ' records in this store is evaluated against its retention.',
          consequence: 'Records past retention are deleted from the store, not only from this view. Evidence attached to an investigation goes with them.',
          verb: 'Run cleanup'
        })
      ],
      hub: function (bb) {
        return {
          count: String(R.families[0].count),
          rows: R.families.map(function (fam) {
            var loaded = fam.id === 'bundle' ? 1 : rowsFor(fam.id).length;
            return hubRow({
              bucket: bb, glyph: FAM_GLYPH[fam.id] || 'circle',
              name: fam.label, count: String(fam.count),
              go: fam.id, title: fam.label,
              summary: loaded + ' loaded in this projection'
            });
          }),
          primary: gbtn('Export view', (function () {
            var it = exportView();
            it.primary = true; it.wide = true;
            return it;
          })())
        };
      },
      view: function (st, bb) {
        var f = st[st.length - 1], id = f.id;

        if (id === 'bundle') {
          return {
            kind: 'list',
            toolbar: '<span class="pmk-strip-grow">' + PMK.filter('Filter bundles') + '</span>',
            rows: '<div class="pmk-row" data-vd-go="bundleobj" data-vd-title="' +
              esc(R.bundle.id) + '" tabindex="0" role="button">' +
              PMK.statusMark('ok') +
              '<span class="vD-glyph" data-pm-tip="investigation bundle">' + ic('branch', 14) + '</span>' +
              '<span class="pmk-id">' + esc(el(R.bundle.title, null, chars(state, 40))) + '</span>' +
              '<span class="vD-count">' + R.bundle.members.length + '</span>' +
              '<span class="vD-chev">' + ic('chev', 12) + '</span></div>'
          };
        }

        if (id === 'bundleobj') {
          return {
            kind: 'object', ident: R.bundle.title, status: 'ok',
            statusWord: R.bundle.outcome,
            kvs: [
              ['Bundle', R.bundle.id, 'measure'],
              ['Outcome', R.bundle.outcome],
              ['Confidence', R.bundle.confidence],
              ['Members', String(R.bundle.members.length)]
            ],
            /* EGRESS, and the sharpest instance of it in the bakeoff: an
               investigation bundle is five evidence records with a verdict
               attached, and exporting it moves the whole case out of the
               workspace in one action. The attestation is honest about the
               limit of what this panel knows -- bundle members carry a role
               and a kind and no redaction marker at all, so the sheet says
               that rather than implying the members were checked. */
            acts: actionBar([
              { label: 'Open bundle', primary: true },
              ask({ label: 'Export bundle' }, {
                act: 'export_bundle', on: R.bundle.id,
                title: 'Export this bundle?',
                scope: R.bundle.id + ', ' + R.bundle.title + ' -- all ' +
                       R.bundle.members.length + ' members, outcome ' +
                       R.bundle.outcome + ', confidence ' + R.bundle.confidence + '.',
                consequence: 'No member of this bundle carries a redaction marker, so nothing here attests that they were masked. The bundle leaves the workspace as captured.',
                verb: 'Export', danger: false
              }),
              { label: 'Import bundle' }
            ], bb),
            /* members lead with evidence_role, ordered baseline > repro >
               diagnosis > fix > verification; kind is the dim tail */
            subs: [ subList('Members', R.bundle.members.length,
              R.bundle.members.map(function (m) { return memberRow(m, bb); })) ]
          };
        }

        if (id === 'artifact') {
          var r0 = R.rows[0];
          R.rows.forEach(function (x) { if (x.kind === f.arg) r0 = x; });
          return {
            kind: 'object', ident: r0.title, status: r0.status,
            statusWord: PMK.statusOf(r0.status).word,
            /* kind first: at L2 it finally has the whole band, which is the
               only place it ever gets one */
            kvs: [
              ['Kind', r0.kind, 'measure'],
              ['Family', r0.family],
              ['Status', PMK.statusOf(r0.status).label],
              ['Summary', r0.preview, 'prose'],
              ['Provenance', r0.provenance || '', 'prose'],
              ['Meta', r0.meta.join(', '), 'prose']
            ],
            acts: actionBar([
              { label: 'Open artifact', primary: true },
              { label: 'Copy identity' },
              exportRecord(r0),
              { label: 'Open producer' }
            ], bb),
            note: 'Opens by identity, never by path.'
          };
        }

        var fam0 = R.families[0];
        R.families.forEach(function (x) { if (x.id === id) fam0 = x; });
        var list = rowsFor(id);
        return {
          kind: 'list',
          toolbar: '<span class="pmk-strip-grow">' + PMK.filter('Filter ' + fam0.label.toLowerCase()) +
                   '</span>' + PMK.overflow([
                     exportView(),
                     { value: 'sort', label: 'Sort by created' }
                   ], 'View actions'),
          rows: list.map(function (r) { return artRow(r, bb); }).join(''),
          empty: list.length ? '' : PMK.empty('no-results', fam0.label,
            'No artifact in this family is loaded in the current projection.', 'Refresh')
        };
      }
    });
  }

  /* ==================================================================== */
  wire();

  PM_BAKEOFF.register('vD', {
    name: 'Drill Stack',
    blurb: 'Hub to list to object. One level renders; nesting happens in time.',
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
})(window);
