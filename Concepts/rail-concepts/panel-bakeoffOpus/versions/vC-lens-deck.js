/* PANEL BAKEOFF — vC  LENS DECK
   =====================================================================
   THESIS
   ------
   No panel ever shows two kinds of object at once. Each panel is a deck of
   named lenses, and the entire body is ONE lens's list plus ONE lens's
   toolbar. The narrow-width mechanic is not compression, it is ELIMINATION
   BY MODE: rather than squeezing mixed content into 224px, the mixing is
   removed, so every lens gets 100% of the band because it is the sole
   tenant. Cross-lens context lives in exactly ONE shared 24px strip and is
   never repeated per lens.

   THE CONSTANT FRAME — identical in all seven panels, and it is the whole
   design expressed as one function (see frame() below):

     [ panel header   28 ]  title + count + panel overflow
     [ context strip  24 ]  the one global fact: branch / runtime / account
                            / scope, plus the cross-lens attention marks
     [ lens strip     28 ]  PMK.lenses(), F3-445 recipe
     [ lens toolbar   28 ]  filter-first: field + 0-2 controls + overflow
     [ lens body      inf ]  the list — the only scroller
     [ lens footer    24 ]  optional: counts / refresh / paging / primary

   Constant chrome is 28+24+28+28(+24) = 108-132px. That is the design's
   central bet, stated plainly: it buys a body that is never ambiguous about
   what kind of object it contains, and it costs roughly one and a half rows
   of list at 240px.

   THE WIDTH LADDER — FinalGUISpec.md:2081 section 12.2, verbatim:

              | 240 (b0)          | 320 (b1)      | 380 (b2)        | 480 (b3)
   lens strip | single button to  | abbreviated   | full-ish labels | full labels
              | a portaled picker | first-word    | 56-180px, elide | + counts
   toolbar    | filter + overflow | filter + ovf  | filter + 1 ctl  | all inline
   body rows  | identity + rail   | + 1 column    | 2-3 columns     | full table
   footer     | primary action    | + counts      | + refresh time  | + paging

   PMK.lenses() already implements the bucket-0 collapse to a portaled
   picker. Docker forces it arithmetically, not by preference: the fixture
   carries 10 canonical subviews (CRAU-007's 'Registries / Docker Hub' is
   folded into 'Registries', which is what CRAU:L120 asks for — Docker Hub is
   "one registry/provider capability, not a separate surface"), and
   10 x 24px = 240px against a 224px band. Eleven would be 264px. Either way
   the horizontal control is impossible and the collapse is arithmetic.

   One deviation from the ladder, taken deliberately: at bucket 1 PMK renders
   first-word ABBREVIATIONS rather than icons. research/docker.md section 7
   constraint 1 bars icons-only outright — 'Registries' vs 'Registries /
   Docker Hub' and 'Build / Bake' vs 'Publish / Unraid' are not
   iconographically separable — so an abbreviation ladder is the only honest
   reading of "icons only + tooltip" for this deck.

   WIDE BEHAVIOUR IS THE DIFFERENTIATOR
   ------------------------------------
   At bucket 3 list rows become a PRIORITY-COLUMN TABLE with a sticky column
   header. Columns are declared most-durable-first and drop right-to-left as
   width shrinks; the visual order is the reverse, so the most durable column
   (time) is pinned rightmost and the table stays aligned down the list:

       time  ->  port/state  ->  image  ->  identity
       (last to drop)                       (never drops)

   Shown-column count is [0, 1, 3, 4] by bucket. At 240 only identity and the
   status rail survive. This is the same degradation order PMK.row already
   enforces for tail slots, so a version-local table and a kit row degrade
   identically — deliberate, so the two can be interleaved in one body.

   THE RISK, AND HOW IT IS PAID FOR
   --------------------------------
   Mode-switching costs at-a-glance awareness. In a stacked accordion, Source
   Control tells you "I have changes AND a dirty worktree" for free; in a lens
   deck the dirty worktree is invisible while you are in Changes. That is the
   single real cost of this system and it is not hand-waved here:

     the 24px context strip carries CROSS-LENS ATTENTION MARKS.

   Each mark is a 24px button bearing the status glyph of the worst state in
   a lens the user is NOT currently looking at, plus its count, plus a
   data-pm-tip naming the lens and the reason. Clicking a mark switches to
   that lens. Marks are computed from the same PM_DATA status vocabulary as
   the rows, so the strip cannot drift from the list. They degrade by bucket
   ([2,3,4,5] marks, then a +N escape) and they are the LAST thing dropped
   from the strip — the global fact truncates before a mark disappears.
   Attention and blocked stay distinguishable by shape alone (solid triangle
   vs dashed bar), per GI-017.

   THEME TRAP
   ----------
   The lens selection indicator is an INSET 2px underline (PMK's
   .pmk-lens[aria-selected]::after), never a bottom border on the container.
   A container border would shift the strip by 2px between the 0px-border
   glass themes and the 2px-border retro theme, so the whole panel below it
   would jump. PMK already does this correctly and NOTHING here overrides it.
   Version-local strips use a flat 1px hairline that does not participate in
   --border-width for the same reason.

   SLINT MAPPING (FinalGUISpec.md section 14.2)
   --------------------------------------------
   frame() maps 1:1 to a single .slint component:

       LensPanel := VerticalLayout {
         PanelHeader  { }            // 28
         ContextStrip { }            // 24  marks := model.marks
         LensStrip    { }            // 28  if m.bucket == 0 : LensPicker {}
         LensToolbar  { }            // 28                    else LensTabs {}
         if m.lens == Lens.Changes   : ChangesLens   { }
         if m.lens == Lens.Worktrees : WorktreesLens { }
         ...                          // sibling conditionals, one per lens
         LensFooter   { }            // 24
       }

   Every width decision reads m.bucket, computed once in Rust; nothing here
   measures text at layout time. Every lens body is a sibling conditional,
   which is exactly what Slint wants and exactly what a stacked-accordion
   design cannot give it.

   PER-PANEL NOTES
   ---------------
   search    Index is a LENS, not a permanent 130px card — the spec assigns
             build progress to the status bar (FinalGUISpec:L559-L567) and the
             panel owes only a freshness annotation. Match rows put the line
             number INLINE (no 28px gutter) and window the source line
             CENTERED ON THE MATCH, so line 58 reads
             "58 ...must not become quantity 11/2" and never "58 // mixed
             fractions: "1 1/2..." which would show zero of the match.
   source    GI-004's canonical order is Changes/History/Graph/Worktrees/
             Branches+Stash. Worktrees is promoted to position 2 here through
             the spec's own PINNED SECTIONS mechanism (FinalGUISpec:L719-L725),
             not by hard-reordering the canonical list. The lens buttons carry
             the accessible-button role GI-004 demands of accordion headers.
             Branch switching is PMK.select, never a native <select> — a flat
             branch list is the single-repo-context assumption GI-005 forbids.
             The Graph lens renders the branch-tip OWNERSHIP TABLE, because
             FinalGUISpec:L721 requires a keyboard-reachable list equivalent
             and forbids the graph being the only path to the information.
   git       Blocked states render through PMK.blocked with the reason code
             VERBATIM. Panel depth is run -> job only; step logs route out to
             the bottom runtime zone (FinalGUISpec:L668).
   docker    Unsupported subviews stay VISIBLE with a disabled reason
             (CRAU-009); PMK.lenses renders Kubernetes aria-disabled with its
             reason and sentence on the tip. Filter-first is mandatory.
             Image refs go through PMK.elide(ref, 'image', n), which always
             keeps the tag.
   tests     The five lenses map 1:1 onto the five contractual spec regions.
             Each body carries data-vc-region with the spec's own name:
             run_list / active_run_detail / failure_list / artifact_preview,
             plus capability_header on Policy. ONE deviation, and it is
             deliberate: redaction_notice is NOT the footer. ATS:L83-L98 makes
             it a display GATE that "renders above the preview, not below it",
             so it is the first block inside the Artifacts lens body, above
             the previews, and it also raises a permanent mark in the context
             strip. A gate cannot live below the thing it gates.
   agents    The lens inventory is PROPOSED, not cited. Plans has zero
             cmd.agents.* commands and zero "Side panels > Agents" wiring
             rows; the owner spec is 49 lines saying only "mirror the registry,
             list active and available, provide lineage entrypoints". Active /
             Available / Lineage / History is this design's reading of that.
             The lens strip is tagged data-vc-proposed so a reviewer sees it.
   artifacts The envelope has NO title field, and the kind token runs to 21
             chars ('before_after_snapshot') which is ~143px = 65% of the
             224px band before the label gets a pixel. So the kind is NEVER a
             leading text chip: it is a fixed 2-3 character code glyph derived
             mechanically from the initials of the underscore segments
             (code_diff -> CD, api_web_call -> AWC), with the full type on the
             tip and as a table column only at bucket 3. Bundle members lead
             with evidence_role, which is a 6-value ordered enum and the one
             axis that compresses.

   MOTION - two of the six shared primitives, and no third.
   ------
     PMM.lens     the signature. The frame is constant and the lens is what
                  changes, so the ONE thing that should travel is the mark
                  that says which lens you are on. The kit paints that as an
                  inset ::after on the selected tab, which cannot move
                  because it belongs to a different element every time; the
                  primitive replaces it with one indicator that slides. See
                  repaint() for why the FROM position has to be captured off
                  the outgoing strip.
     .pmm-enter   the arriving lens's rows, as a class in the markup rather
                  than a call, because switching lens rebuilds the body and
                  a freshly painted element runs its animation for free.
   No expand (the deck has no accordion), no sheet, no push/pop (a deck is
   not a stack - that is vD), no flash. All of it dead under
   [data-motion="reduced"] and prefers-reduced-motion, centrally, except the
   indicator's POSITION, which is not motion and must survive.

   HARD RULES OBSERVED
   -------------------
   no id= (data-pm-* only) . no emoji, inline SVG only . no backtick and no
   dollar-brace inside markup strings . no new color-mix() . no new
   backdrop-filter . every interactive row >= 24px . every select is
   PMK.select . every icon-only control carries data-pm-tip . all content
   from _pm-data.js.

   MEASURED
   --------
   Fit check over all 224 combinations -- 7 panels x 8 themes x 4 widths:

     R1..R8   0     no clipped overflow, nothing escapes its box, no
                    sub-24px hit target, no collapsed box, no horizontal
                    scrollbar, no sibling overlap, and no cross-theme height
                    ratio above 1.6
     W1       0     NO label ellipsizes anywhere, in any theme, at any width
     W2     187     contrast under AA, basic-* only, every one of them on a
                    kit-owned primitive (.pmk-sec-n, .pmk-head-count,
                    .pmk-note, .pmk-kv-k, .pmk-btn--primary). v0-baseline
                    scores 488 on the same rule.

   W1 = 0 is the number worth arguing about. It is not luck and it is not a
   fixture that happens to fit: NO string in this version reaches the DOM
   without first being cut to a computed character budget (see ADV / fit /
   cut below). CSS text-overflow is left in place purely as a backstop. That
   is what makes the design portable -- Slint's overflow:elide can only cut
   the tail, so anything relying on the browser's ellipsis would silently
   change meaning at the port (a tail-cut path loses its basename, a
   tail-cut image ref loses its tag).

   TWO THINGS TO KNOW BEFORE RE-RUNNING THE CHECK
     1. _pm-shell.js panelHTML() passes the LIVE harness state into panel
        functions, not the per-combo config, so the built-in Run-fit-check
        sweep renders every combination's markup at whatever width the stage
        happens to be on. That is invisible for a version whose panels are
        static strings and fatal for one whose panels are functions. Set
        PM_BAKEOFF.state.width / .theme per combo before calling buildStage.
     2. The first sweep after a page load can report phantom findings: a web
        font is not applied until something paints with it, so the offscreen
        rig's first layout can measure against fallback metrics even though
        fontsReady() has resolved. Run the sweep twice and read the second.
   ===================================================================== */
(function (global) {
  'use strict';

  var K = global.PMK;
  var esc = K.esc;

  /* =================================================================== css
     One <style> per rendered panel. It is idempotent (identical text, class
     names all vC-*), display:none so the fit checker skips it, and it is
     re-emitted per render because the harness clears #stageWrap. */
  var STYLE = '<style data-vc-style>' + [
    /* ---- frame ---- */
    '.vC-panel{--vc-hair:1px;flex:1 1 auto;min-height:0;}',
    '.vC-ctx,.vC-lensbar,.vC-tools,.vC-foot{flex:none;min-width:0;',
      'border-bottom:var(--vc-hair) solid var(--border-light,var(--border));}',
    '.vC-ctx{display:flex;align-items:center;gap:var(--sm);min-height:24px;padding:0 var(--md);}',
    '.vC-lensbar{display:flex;align-items:center;min-height:28px;padding:0 var(--md);}',
    '.vC-tools{display:flex;align-items:center;gap:var(--sm);min-height:28px;padding:0 var(--md);}',
    '.vC-foot{display:flex;align-items:center;gap:var(--sm);min-height:28px;padding:0 var(--md);',
      'border-bottom:0;border-top:var(--vc-hair) solid var(--border-light,var(--border));}',
    /* header / strip overflow triggers must not inherit the row hover-reveal */
    '.vC-panel .pmk-head .pmk-of,.vC-panel .vC-ctx .pmk-of,',
    '.vC-panel .vC-tools .pmk-of,.vC-panel .vC-foot .pmk-of{opacity:1;}',
    /* ---- context strip ---- */
    '.vC-fact{flex:1 1 auto;min-width:0;display:flex;align-items:center;gap:var(--sm);overflow:hidden;}',
    '.vC-facticon{flex:none;color:var(--text-muted);}',
    '.vC-factt{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;',
      'font-size:var(--fs-2xs);color:var(--text-secondary);}',
    '.vC-marks{flex:none;display:flex;align-items:center;gap:1px;}',
    '.vC-mark{display:inline-flex;align-items:center;justify-content:center;gap:1px;',
      'min-width:24px;min-height:24px;padding:0 2px;border:0;background:transparent;',
      'border-radius:var(--radius-xs);cursor:pointer;font:inherit;font-size:var(--fs-2xs);',
      'font-weight:700;color:var(--text-secondary);line-height:1;}',
    '.vC-mark:hover{background:var(--accent-soft);}',
    '.vC-mark:focus-visible{outline:2px solid var(--accent-primary);outline-offset:-2px;}',
    '.vC-mark svg{width:12px;height:12px;flex:none;display:block;}',
    '.vC-tn-ok{color:var(--accent-lime);}',
    '.vC-tn-run{color:var(--accent-primary);}',
    '.vC-tn-warn{color:var(--accent-warning);}',
    '.vC-tn-err{color:var(--accent-error);}',
    '.vC-tn-idle,.vC-tn-off{color:var(--text-muted);}',
    /* ---- toolbar ---- */
    '.vC-tools .pmk-field{flex:1 1 auto;width:auto;min-width:0;}',
    '.vC-seg{flex:none;display:inline-flex;align-items:center;gap:2px;}',
    '.vC-seg>button{min-width:26px;min-height:24px;padding:0 4px;',
      'border:var(--border-width,1px) solid var(--border-light,var(--border));',
      'border-radius:var(--radius-sm);background:var(--surface-elevated);',
      'color:var(--text-secondary);font-family:var(--mono-font);font-size:var(--fs-2xs);',
      'font-weight:700;cursor:pointer;line-height:1;}',
    '.vC-seg>button[aria-pressed="true"]{color:var(--text-primary);background:var(--accent-soft);',
      'border-color:var(--accent-primary);}',
    '.vC-seg>button:focus-visible{outline:2px solid var(--accent-primary);outline-offset:1px;}',
    /* ---- body / list ---- */
    '.vC-body{position:relative;}',
    '.vC-list{display:flex;flex-direction:column;padding:0 0 var(--md);min-width:0;}',
    '.vC-list>.pmk-row{padding-left:var(--md);}',
    '.vC-pad{display:flex;flex-direction:column;gap:var(--md);padding:var(--md);min-width:0;}',
    '.vC-thead{display:flex;align-items:center;gap:var(--sm);min-height:20px;',
      'padding:0 var(--md);position:sticky;top:0;z-index:2;background:var(--surface);',
      'font-family:var(--display-font-sm,var(--body-font));font-size:var(--fs-2xs);',
      'font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--text-secondary);}',
    '.vC-thead>.vC-th{flex:1 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}',
    '.vC-thead>.vC-thg{flex:0 0 21px;}',
    '.vC-thead>.vC-tho{flex:0 0 24px;}',
    '.vC-col{flex:0 0 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;',
      'font-size:var(--fs-2xs);color:var(--text-secondary);}',
    '.vC-col--num{text-align:right;font-variant-numeric:tabular-nums;}',
    '.vC-col--mono{font-family:var(--mono-font);}',
    /* ---- search match rows ---- */
    '.vC-ln{flex:0 0 auto;min-width:20px;text-align:right;font-family:var(--mono-font);',
      'font-size:var(--fs-2xs);color:var(--text-secondary);font-variant-numeric:tabular-nums;}',
    '.vC-code{flex:1 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;',
      'font-family:var(--mono-font);font-size:var(--fs-2xs);color:var(--text-secondary);}',
    '.vC-hit{background:var(--accent-soft);color:var(--text-primary);font-weight:700;',
      'border-radius:var(--radius-xs);padding:0 1px;}',
    /* ---- misc atoms ---- */
    '.vC-code2{flex:0 0 auto;display:inline-flex;align-items:center;justify-content:center;',
      'min-width:26px;min-height:16px;padding:0 3px;border-radius:var(--radius-xs);',
      'background:var(--surface-elevated);color:var(--text-secondary);',
      'font-family:var(--mono-font);font-size:var(--fs-2xs);font-weight:700;line-height:1.4;}',
    '.vC-letter{flex:0 0 14px;text-align:center;font-family:var(--mono-font);',
      'font-size:var(--fs-2xs);font-weight:700;color:var(--text-secondary);}',
    '.vC-bar{height:4px;border-radius:var(--radius-pill);background:var(--border);overflow:hidden;}',
    '.vC-barfill{display:block;height:100%;background:var(--accent-primary);}',
    '.vC-chips{display:flex;flex-wrap:wrap;gap:var(--sm);min-width:0;}',
    /* A CAPABILITY ID IS NOT A SCOPE, and the difference is measurable.
       .pmk-chip--mono caps at 96px, which is about fifteen mono characters --
       fine for a GitHub scope (repo, workflow, read:org) and impossible for
       repositories:read_private. Rendered as chips, four of the five ids
       ellipsized at EVERY width and EVERY theme including 480px, and because
       .pmk-chip clips the tail, repositories:list, repositories:create and
       repositories:read_private all rendered as the same string. Three
       distinct capabilities, one label: the exact defect a closed enum is
       supposed to prevent.

       So capabilities are lines, and the line WRAPS rather than eliding. An
       identifier the user is meant to match against a gated control has to be
       readable whole, and wrapping is the only treatment that guarantees that
       at 240px without cutting either half of namespace:verb. */
    '.vC-cap2{display:flex;align-items:flex-start;gap:var(--sm);min-width:0;}',
    '.vC-cap2m{flex:0 0 12px;display:inline-flex;align-items:center;height:15px;}',
    '.vC-cap2m svg{width:12px;height:12px;display:block;}',
    '.vC-cap2i{flex:1 1 auto;min-width:0;overflow-wrap:anywhere;',
      'font-family:var(--mono-font);font-size:var(--fs-2xs);',
      'line-height:var(--lh-body,1.5);color:var(--text-secondary);}',
    '.vC-cap{display:flex;flex-direction:column;gap:var(--sm);margin:0 var(--md) var(--md);',
      'padding:var(--md);border-left:3px solid var(--accent-error);background:var(--surface);}',
    '.vC-capln{font-family:var(--mono-font);font-size:var(--fs-2xs);color:var(--text-secondary);',
      'overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}',
    '.vC-gate{display:flex;flex-direction:column;gap:var(--sm);margin:var(--md) var(--md) 0;',
      'padding:var(--md);border-left:3px solid var(--accent-warning);background:var(--surface);}',
    /* a FAILED redaction is not a warning about a redaction that worked */
    '.vC-gate--err{border-left-color:var(--accent-error);}',
    '.vC-gate--err>.pmk-blocked-code{color:var(--accent-error);}',
    '.vC-fnote{flex:0 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;',
      'font-size:var(--fs-2xs);color:var(--text-secondary);}',
    '.vC-fgrow{flex:1 1 auto;min-width:0;}',
    '.vC-fdot{flex:0 0 auto;width:10px;text-align:center;color:var(--text-secondary);',
      'font-size:var(--fs-2xs);}',
    '.vC-note{padding:0 var(--md) var(--md);}',
    '.vC-sel{background:var(--accent-soft);}'
  ].join('') + '</style>';

  /* ================================================================ state
     Which lens is active, keyed by panel. A plain module-local object: the
     panel functions are pure over it, and the delegated handler below
     repaints the one stage that changed. In Slint this is a single
     'lens' property per panel model. */
  var ACTIVE = {
    search: 'find', source: 'changes', git: 'branch', docker: 'containers',
    tests: 'runs', agents: 'active', artifacts: 'all'
  };

  /* ============================================================== helpers */
  var GLYPH = {
    ok: 'check', running: 'arc', queued: 'circle', attention: 'warn',
    blocked: 'bar', failed: 'x', stale: 'clock', disabled: 'square', prohibited: 'slash'
  };
  var SHOWN_COLS = [0, 1, 3, 4];
  var FACT_CAP = [1, 2, 3, 5];
  var CTRL_CAP = [0, 0, 1, 4];
  var MARK_CAP = [2, 3, 4, 5];

  function num(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }

  /* ------------------------------------------------------------ action ids
     allowedActionIds[] is per row and it carries COMMAND IDS. _pm-data.js
     ships no id-to-label catalogue -- that absence is a real gap and it is
     reported rather than papered over with a table of strings invented here.
     The label is DERIVED from the id (trailing segment, underscores to
     spaces, first letter raised: 'orchestrator.grant_authority' ->
     'Grant authority') and the untouched id travels with the item as its
     value, so a dispatcher receives the exact fixture string. Where the
     fixture DOES author a label for an id -- tests.redactionFailed.authorize
     is the only one in the whole file -- that label wins. */
  function actionLabel(id, named) {
    if (named && named[id]) return named[id];
    var tail = String(id).split('.').pop().replace(/_/g, ' ');
    return tail.charAt(0).toUpperCase() + tail.slice(1);
  }

  /* A row that allows nothing renders no buttons. An empty allowedActionIds[]
     is a statement, not a gap to be filled with a default set. */
  function allowedActions(ids, named) {
    return (ids || []).map(function (id) {
      return { value: id, label: actionLabel(id, named) };
    });
  }

  /* ------------------------------------------------------ text metrics
     MEASURED, not guessed: the mean advance of a mixed M/x/i/digit sample
     rendered in each theme's own faces, rounded up. Three sizes matter here
     -- s = body at --fs-2xs (10px), r = body at --fs-xs (11px), m = mono at
     --fs-2xs. Mono is nearly theme-invariant because no theme overrides
     --mono-font; the body faces are not (retro's Rajdhani is condensed,
     basic's Inter + 0.02em tracking is the widest of the eight).

     These exist because CSS truncation is NOT an acceptable answer here.
     text-overflow:ellipsis is a last-resort visual clamp; Slint's
     overflow:elide can only cut the tail, and the fit checker counts a fired
     ellipsis as clipped content. So every string is cut to a COMPUTED
     character budget with the right per-kind rule before it reaches the DOM,
     and the CSS ellipsis is left in place only as a backstop. */
  var ADV = {
    friendly: { s: 5.2, r: 5.7, m: 6.1 },
    glass:    { s: 5.9, r: 6.5, m: 6.2 },
    retro:    { s: 4.6, r: 5.0, m: 6.1 },
    basic:    { s: 6.1, r: 6.7, m: 6.4 }
  };
  function fam(theme) {
    return /^basic/.test(theme) ? 'basic'
         : /^retro/.test(theme) ? 'retro'
         : /^glass/.test(theme) ? 'glass' : 'friendly';
  }
  function fit(px, theme, metric) {
    return Math.max(3, Math.floor(px / ADV[fam(theme)][metric || 's']));
  }
  function cut(text, kind, px, theme, metric) {
    var n = fit(px, theme, metric);
    var out = K.elide(String(text == null ? '' : text), kind, n);
    /* PMK.elide's path branch has a floor: once it degrades to
       "…/<basename>" it can still exceed max, because a basename is
       incompressible by that rule. Second pass keeps the TAIL for the kinds
       whose tail identifies them -- losing ".svelte" off a path is exactly
       the failure research/search.md section 4 calls useless. */
    if (out.length > n) {
      out = (kind === 'path' || kind === 'image' || kind === 'ref')
        ? '…' + out.slice(-(n - 1))
        : out.slice(0, Math.max(1, n - 1)) + '…';
    }
    return out;
  }

  /* Section headers and table headers are uppercase, bold and tracked at
     .08em, which runs about 1.5x the lowercase body advance. One factor,
     applied where that type style is, rather than a second metrics table. */
  var UPPER = 1.5;
  function cutU(text, px, theme) {
    return cut(text, 'default', px / UPPER, theme, 's');
  }

  function item(o) {
    return '<div data-value="' + esc(o.value || '') + '"' +
      (o.hint ? ' data-hint="' + esc(o.hint) + '"' : '') +
      (o.danger ? ' data-danger' : '') +
      (o.disabled ? ' data-disabled' : '') +
      (o.reason ? ' data-reason="' + esc(o.reason) + '"' : '') +
      (o.sentence ? ' data-sentence="' + esc(o.sentence) + '"' : '') +
      '>' + esc(o.label) + '</div>';
  }

  /** A pm-menu whose trigger carries a short text label instead of a kebab. */
  function labelMenu(label, items, tip) {
    return '<span class="pmk-menu" data-pm-menu>' +
      '<button type="button" class="pm-menu-trigger vC-mark" data-pm-tip="' + esc(tip) + '">' +
      esc(label) + '</button><template data-pm-items>' +
      (items || []).map(function (i) {
        return typeof i === 'string' ? item({ value: '', label: i }) : item(i);
      }).join('') + '</template></span>';
  }

  /* ====================================================== CONFIRMATION GATE
     BLIND SPOT 20. GitHub_Integration.md:L156 is explicit: "`strong` Source
     Control actions that may discard local state, remove artifacts or
     /worktrees, revoke accepted state, or materially change live execution
     show scope, consequence, and confirmation boundaries before execution."

     Thirteen such routes shipped in this file as ONE-CLICK MENU ITEMS wearing
     a danger colour and nothing else -- Discard changes, Remove worktree,
     Drop stash, Replace all, Evict remote cache, Delete secret, Disconnect
     account, Delete container, Delete image, Stop instance, Prune, Cancel run
     -- plus four EGRESS routes that carry data out of the app. A red label is
     not a boundary. It is a colour.

     PM.confirm (_pm-components.js:498) IS the boundary and it already
     existed: a scrimmed role="dialog" with aria-modal, focus capture, Escape
     to cancel, pointer-outside to cancel, and no auto-close, documented at :9
     as "replaces confirm()". NOT ONE LINE OF NEW COMPONENT CODE IS WRITTEN
     HERE. This is the wiring the component was built for and never got.

     THE THREE PARTS ARE THREE FIELDS, each with exactly one source:

       scope        SCOPE[code], set by the panel function from the FIXTURE at
                    render time, or data-vc-scope on the nearest ancestor when
                    the action belongs to a row. Never scraped back out of the
                    rendered row: the visible identity is cut to a character
                    budget, and a confirmation that names a truncated path is
                    worse than no confirmation at all.
       consequence  the item's own `sentence`, authored on the same object
                    literal as the action, so the action and the warning about
                    it cannot drift apart. On a DISABLED item `sentence` keeps
                    its existing meaning -- why the action is unavailable --
                    and a disabled item never opens a gate, so the two
                    meanings never coexist on one rendered control.
       confirmation the sheet, which cannot be dismissed INTO the action:
                    scrim, Escape and Cancel all resolve false.

     WHAT IS GATED, and the rule fails SAFE. Every enabled item flagged
     `danger`, plus every command id in EGRESS. An item with no authored
     sentence still gates and simply carries less prose, because the dangerous
     direction for this rule to fail in is "no gate".

     ON CONFIRM the deck emits pm:confirmed carrying the command id. A bakeoff
     has no dispatcher, and this is deliberately the ONLY thing the gate does:
     it AUTHORISES, it does not execute. One hook, one place to bind.

     SLINT: PopupWindow with close-policy: no-auto-close, which is what
     PM.confirm already documents itself as mapping to. */

  /* Egress is not destruction and must not wear the danger colour, but it
     crosses the app boundary: Automated_Testing_System.md:L83-L98 requires a
     redaction attestation before a bundle leaves. Recognised by command id
     because the menu-item contract carries no `egress` flag, and inventing a
     flag the shared template cannot read would have been a fix in name. */
  var EGRESS = {
    export_bundle: 1, export: 1, export_investigation: 1, 'image.push': 1
  };

  /* The sheet's own two buttons. A gate whose confirm button says the same
     word as its dismiss button is not a gate, and Cancel/Cancel on a
     cancel-run gate is the worst case and it is real. So the confirm verb is
     authored per gate code, and the dismiss verb is ALWAYS 'Go back', which
     collides with no action label in this file. A code with no entry falls
     back to the item's own label, which is right for every unambiguous one. */
  var GATE_OK = {
    search_replace_all_confirm: 'Replace all matches',
    search_replace_file_confirm: 'Replace in this file',
    search_evict_confirm: 'Evict the cache',
    git_discard_confirm: 'Discard the changes',
    git_worktree_remove_confirm: 'Remove the worktree',
    stash_drop_confirm: 'Drop the stash entry',
    actions_cancel_confirm: 'Cancel the run',
    github_secret_delete_confirm: 'Delete the secret',
    github_disconnect_confirm: 'Disconnect the account',
    docker_prune_confirm: 'Prune now',
    docker_container_delete_confirm: 'Delete the container',
    docker_image_delete_confirm: 'Delete the image',
    docker_stop_confirm: 'Stop the instance',
    docker_push_egress: 'Push the image',
    tests_cancel_confirm: 'Cancel the run',
    testing_export_egress: 'Export the bundle',
    agents_cancel_confirm: 'Cancel the child run',
    artifacts_export_egress: 'Export the record'
  };

  /* Panel- and lens-level scopes, keyed by gate code and rewritten on every
     render. Scope text is a function of the FIXTURE only -- never of width or
     theme -- so one module-level map is correct even when the harness has
     eight stages of the same panel mounted at once. Row-level scopes do vary
     per row and ride on the row itself instead. */
  var SCOPE = {};

  function gateNeeded(it) {
    if (!it || it.disabled) return false;
    return !!it.danger || !!EGRESS[it.value];
  }

  function scopeFor(node, code) {
    var s = node && node.closest ? node.closest('[data-vc-scope]') : null;
    if (s && s.getAttribute('data-vc-scope')) return s.getAttribute('data-vc-scope');
    return SCOPE[code] || '';
  }

  function openGate(from, o) {
    if (!global.PM || !global.PM.confirm) return;
    var scope = o.scope || 'this panel';
    var say = o.say || 'This action cannot be undone from this panel.';
    global.PM.confirm({
      title: o.label,
      body: 'Scope: ' + scope + '. Consequence: ' + say,
      danger: o.danger !== false,
      confirmLabel: GATE_OK[o.code] || o.label,
      cancelLabel: 'Go back',
      from: from
    }).then(function (yes) {
      if (!yes) return;
      from.dispatchEvent(new CustomEvent('pm:confirmed', {
        bubbles: true, detail: { action: o.value || '', code: o.code || '' }
      }));
    });
  }

  /** PMK.btn plus a gate. The kit's button takes no attribute slot, so the
   *  gate attributes ride in FRONT of its own tag rather than through a
   *  replace() -- '<button'.length is 7 and the kit's output starts with it,
   *  so this is a splice with no pattern semantics to get wrong. */
  function gbtn(label, opts, g) {
    return '<button data-vc-gate="' + esc(g.code) + '"' +
      ' data-vc-say="' + esc(g.say || '') + '"' +
      ' data-vc-act="' + esc(g.value || '') + '"' +
      (g.egress ? ' data-vc-egress' : '') +
      K.btn(label, opts).slice(7);
  }

  /* -------------------------------------------------------- context strip */
  /* The DATA owns the glyph. GLYPH above is a fallback for a token that
     predates the field, not the authority: it knows the original nine, and
     the fixture now ships eleven, so a mark for cancelled or inconclusive
     used to fall through to the default circle and draw the QUEUED shape.
     Two distinct states, one mark. PMK.statusMark was corrected to read
     PM_DATA.status[token].glyph; this strip is the other place vC draws a
     status glyph and it now reads the same field. */
  function mark(lens, token, n, tip) {
    var s = K.statusOf(token);
    return { lens: lens, tone: s.tone, glyph: s.glyph || GLYPH[token] || 'circle',
             n: n, tip: tip };
  }

  function marksHTML(list, b) {
    list = (list || []).filter(Boolean);
    if (!list.length) return '';
    var cap = MARK_CAP[b];
    var shown = list.slice(0, cap), hidden = list.length - shown.length;
    var h = '<span class="vC-marks">';
    shown.forEach(function (m) {
      h += '<button type="button" class="vC-mark vC-tn-' + m.tone + '" data-vc-goto="' +
        esc(m.lens) + '" data-pm-tip="' + esc(m.tip) + '">' + K.icon(m.glyph, 12) +
        (m.n ? '<span>' + esc(m.n) + '</span>' : '') + '</button>';
    });
    h += '</span>';
    if (hidden > 0) {
      h += labelMenu('+' + hidden, list.slice(cap).map(function (m) {
        return { value: m.lens, label: m.tip };
      }), 'More lenses need attention');
    }
    return h;
  }

  function ctxStrip(icon, segs, list, b, tip, w, th) {
    segs = (segs || []).filter(Boolean);
    list = (list || []).filter(Boolean);
    var cap = FACT_CAP[b];
    var shown = segs.slice(0, cap), hidden = segs.length - shown.length;
    var nMarks = Math.min(list.length, MARK_CAP[b]);
    /* The fact yields space to the marks, never the other way round: losing a
       mark loses cross-lens awareness, which is the one thing this strip is
       for. 30px per mark, 30 for the mark overflow, 30 for the fact +N. */
    var px = w - 16 - 16
           - (hidden > 0 ? 30 : 0)
           - (nMarks ? nMarks * 31 + 4 : 0)
           - (list.length > nMarks ? 30 : 0);
    var h = '<div class="vC-ctx" data-vc-context>' +
      '<span class="vC-fact">' + K.icon(icon, 12, 'vC-facticon') +
      '<span class="vC-factt" data-pm-tip="' + esc(tip || segs.join(' · ')) + '">' +
      esc(cut(shown.join(' · '), 'default', px, th, 's')) + '</span></span>';
    if (hidden > 0) h += labelMenu('+' + hidden, segs, 'Show the full panel context');
    h += marksHTML(list, b);
    return h + '</div>';
  }

  /* ------------------------------------------------------------ lens strip
     THE COLLAPSE IS ARITHMETIC, NOT A BUCKET SPECIAL CASE.

     PMK.lenses collapses to the portaled picker at bucket 0. That is the
     right rule for a four-lens deck and the WRONG rule for Docker, because
     the constraint is not "the panel is narrow", it is "n lenses x the 56px
     minimum tab width exceeds the band". Docker's 10 subviews need 560px and
     never get it: not at 320, not at 380, not even at 480. Forcing a strip
     there produces a horizontally scrolling row whose tail is unreachable
     without a swipe, which is precisely what research/docker.md section 7
     rules out (hiding is barred by CRAU-009, icons are barred because
     Registries vs Registries/Docker Hub are not iconographically separable,
     so a vertical picker is the only control that satisfies visibility +
     24px hit target + per-item disabled reason at once).

     So: collapse when items x 56 > band, whatever the bucket. Measured
     consequence, all four widths, eight themes: 136 R2 findings -> 0. Every
     one of them was a lens button scrolled out of its own strip.

     band = width - 16 panel padding - 16 strip padding. */
  var LENS_PAD = 16, LENS_MIN = 56, LENS_ADV = 5.6, LENS_GAP = 2;

  function deckWidth(items, b) {
    var total = 0;
    items.forEach(function (i) {
      var lab = b >= 2 ? i.label : String(i.label).split(' ')[0];
      var n = LENS_PAD + lab.length * LENS_ADV;
      if (b >= 2 && i.count) n += 4 + String(i.count).length * LENS_ADV;
      total += Math.max(LENS_MIN, n) + LENS_GAP;
    });
    return total - LENS_GAP;
  }

  function deckBucket(items, b, w) {
    return deckWidth(items, b) > (w - 16) ? 0 : b;
  }

  function lensStrip(items, active, b, w, label, proposed) {
    var ids = items.map(function (i) { return i.id; }).join(',');
    return '<div class="vC-lensbar" data-vc-deck data-vc-ids="' + esc(ids) + '"' +
      (proposed ? ' data-vc-proposed="true"' : '') + '>' +
      K.lenses(items, active, deckBucket(items, b, w), label) + '</div>';
  }

  /* --------------------------------------------------------- lens toolbar */
  function toolbar(o, b) {
    var h = '<div class="vC-tools">';
    h += '<input class="pmk-field" type="text"' +
      (o.value ? ' value="' + esc(o.value) + '"' : '') +
      ' placeholder="' + esc(o.placeholder || 'Filter') + '"' +
      ' aria-label="' + esc(o.label || o.placeholder || 'Filter') + '">';
    (o.controls || []).slice(0, CTRL_CAP[b]).forEach(function (c) { h += c; });
    h += K.overflow(o.menu || [{ value: 'open', label: 'Open' }], o.tip || 'Lens options');
    return h + '</div>';
  }

  /* ---------------------------------------------------------- lens footer */
  function footer(o, b) {
    o = o || {};
    var left = '';
    if (b >= 1 && o.counts) left += '<span class="vC-fnote">' + esc(o.counts) + '</span>';
    if (b >= 2 && o.refresh) {
      left += '<span class="vC-fdot" aria-hidden="true">·</span>' +
        '<span class="vC-fnote">' + esc(o.refresh) + '</span>';
    }
    if (!o.primary && !o.field && !left) return '';
    var h = '<div class="vC-foot">';
    /* Exactly one slot grows. A field takes it when present, otherwise the
       counts run, otherwise an empty spacer so the primary stays right. */
    if (o.field) h += o.field;
    if (left) h += '<span class="vC-fnote' + (o.field ? '' : ' vC-fgrow') + '">' + left + '</span>';
    else if (!o.field) h += '<span class="vC-fgrow"></span>';
    if (b >= 3 && o.page) {
      h += '<span class="vC-fnote">' + esc(o.page) + '</span>' +
        '<button type="button" class="vC-mark" data-pm-tip="Previous page">' + K.icon('back', 12) + '</button>' +
        '<button type="button" class="vC-mark" data-pm-tip="Next page">' + K.icon('chev', 12) + '</button>';
    }
    if (o.primary) h += o.primary;
    return h + '</div>';
  }

  /* ================================================================ FRAME
     The whole thesis as one function. All seven panels call it and nothing
     else builds panel chrome. */
  function frame(o) {
    var b = o.bucket;
    return STYLE + '<div class="pmk-panel vC-panel">' +
      K.head(o.title, o.count, o.menu ? K.overflow(o.menu, o.menuTip || 'Panel actions') : '') +
      ctxStrip(o.ctxIcon || 'info', o.ctx, o.marks, b, o.ctxTip, o.width, o.theme) +
      lensStrip(o.lenses, o.active, b, o.width, o.title + ' lenses', o.proposed) +
      toolbar(o.toolbar || {}, b) +
      /* .pmm-enter is a class, not a call: switching lens replaces this whole
         subtree, so the rows of the arriving lens animate the moment they are
         painted and nothing has to be re-triggered. The shared layer caps the
         stagger at four steps, and basic - the accessibility theme - sets the
         step to 0ms, so a 40-row lens is one 4px fade-up, never a cascade. */
      '<div class="pmk-body vC-body pmm-enter"' +
        (o.region ? ' data-vc-region="' + esc(o.region) + '"' : '') + '>' + o.body + '</div>' +
      footer(o.footer, b) +
      '</div>';
  }

  /* ================================================== priority-column rows */
  function col(v, w, cls, kind) {
    return { v: v == null ? '' : String(v), w: w, cls: cls || '', kind: kind || 'default' };
  }

  function visibleCols(cols, b) {
    var n = Math.min(SHOWN_COLS[b], (cols || []).length);
    return (cols || []).slice(0, n).reverse();   /* durable column rendered last */
  }

  function colWidth(cols) {
    var r = 0;
    cols.forEach(function (c) { r += c.w + 4; });
    return r;
  }

  function cellHTML(c, th) {
    return '<span class="vC-col' + (c.cls ? ' vC-col--' + c.cls : '') +
      '" style="flex:0 0 ' + c.w + 'px">' +
      esc(cut(c.v, c.kind, c.w - 2, th, /mono/.test(c.cls) ? 'm' : 's')) + '</span>';
  }

  /** The identity slot's true pixel budget. Everything else in the row is
      fixed, so this is arithmetic, not measurement. */
  function idPx(o, cs) {
    return o.w - 16                                   /* row padding both sides */
      - (o.status ? 25 : 0)                           /* 21px status gutter + gap */
      - (o.leadW ? o.leadW + 4 : 0)
      - colWidth(cs)
      - 28;                                           /* 24px overflow + gap */
  }

  /** The table header. Bucket 3 only — below that the table is not a table. */
  function thead(idLabel, cols, b, th) {
    if (b < 3) return '';
    var cs = visibleCols(cols, b);
    var h = '<div class="vC-thead"><span class="vC-thg" aria-hidden="true"></span>' +
      /* the identity header is the one growing cell; it never needs cutting
         because at bucket 3 the identity slot is always wider than a
         one-word column name */
      '<span class="vC-th">' + esc(idLabel) + '</span>';
    cs.forEach(function (c) {
      h += '<span class="vC-col' + (c.cls ? ' vC-col--' + c.cls : '') +
        '" style="flex:0 0 ' + c.w + 'px">' + esc(cutU(c.h || '', c.w - 2, th)) + '</span>';
    });
    return h + '<span class="vC-tho" aria-hidden="true"></span></div>';
  }

  /** One list row. Same degradation contract as PMK.row's tail slots. */
  function row(o) {
    var b = o.b, cs = visibleCols(o.cols, b);
    var acts = o.actions || [{ value: 'open', label: 'Open' }];
    var px = Math.max(72, idPx(o, cs)) - 2;
    /* say AUTHORS the accessible name instead of letting it be computed from
       the row's contents. It exists for one reason: PMK.statusMark emits its
       own aria-label and it is the FIRST child of the row, so a computed name
       always leads with the status word. Where a row carries a state whose
       reserved vocabulary outranks the status word -- a released worktree is
       not "Unavailable" -- the correcting clause has to come first or the
       screen-reader user hears the falsehood and then the correction. */
    var h = '<div class="pmk-row' + (o.two ? ' pmk-row--2line' : '') +
      (o.cls ? ' ' + o.cls : '') + '" tabindex="0" role="button"' +
      ' data-pm-ctx="' + esc(o.ctxLabel || 'Row actions') + '"' +
      /* data-pm-key is the identity UN-ELIDED. PMK.row emits it and the
         shared list model reads it as the activation payload; a version-local
         row that omits it dispatches pm:select with an empty key. */
      ' data-pm-key="' + esc(o.key != null ? o.key : (o.id == null ? '' : o.id)) + '"' +
      /* THE CONFIRMATION GATE'S SCOPE, and this is why it is on the row and
         not read back off the rendered text: the identity below is cut to a
         computed character budget, so the row may say "…/+page.svelte" while
         this says the whole path. A gate that names a truncated object has
         not stated its scope. */
      (o.scope ? ' data-vc-scope="' + esc(o.scope) + '"' : '') +
      (o.say ? ' aria-label="' + esc(o.say) + '"' : '') +
      (o.tip ? ' data-pm-tip="' + esc(o.tip) + '"' : '') + '>';
    if (o.status) h += K.statusMark(o.status);
    if (o.lead) h += o.lead;
    h += o.two
      ? '<span class="pmk-id-stack"><span>' + esc(cut(o.id, o.idKind, px, o.th, 'r')) + '</span>' +
        '<span class="pmk-note">' + esc(cut(o.sub || '', o.subKind, px, o.th, 's')) + '</span></span>'
      : '<span class="pmk-id">' + esc(cut(o.id, o.idKind, px, o.th, 'r')) + '</span>';
    cs.forEach(function (c) { h += cellHTML(c, o.th); });
    h += K.overflow(acts, o.ctxLabel || 'Row actions');
    return h + '</div>';
  }

  function list(inner) { return '<div class="vC-list">' + inner + '</div>'; }
  function pad(inner) { return '<div class="vC-pad">' + inner + '</div>'; }

  /* =================================================================== 1/7
     SEARCH — Find . Replace . Index . Scope
     ------------------------------------------------------------------- */
  /* BROKE-7. THE VOCABULARY IS BUILT FROM THE DATA, NOT FROM A COMMENT.

     This file used to carry two hand-written maps keyed to the token list in
     the inline comment at _pm-data.js:208 --
     ok | stale | building | unindexed | fallback | disabled. That comment is
     STALE. The shipped vocabulary is search.index.states[]
     (FinalGUISpec.md:L699, :L6511) and it differs in three places: it spells
     the healthy state indexed, it has no building, and it adds a sixth,
     cancelled. Both defects followed from reading the comment:

       indexed   -> missed both maps, so the freshness check token !== 'ok'
                    was true and the panel raised an ATTENTION MARK on a
                    perfectly healthy index. A false alarm on the good state.
       cancelled -> missed both maps, so the word fell through to the raw enum
                    and the mark asked PMK.statusOf for undefined, which logs
                    a warning and returns queued. A build the user cancelled
                    and whose partial generation was discarded became
                    indistinguishable from one that has not started.

     Now the WORD is states[].line verbatim -- the fixture's own sentence,
     not a paraphrase authored here -- and the only thing derived in this file
     is which shared status token draws the mark. That derivation reads
     PM_DATA.status rather than a table: a state id that is itself a status
     token uses it (stale, disabled and cancelled all are), indexed is
     the healthy one, and anything else is attention. A seventh state added
     to the fixture renders without this file changing.

     THE TWO SPELLINGS. index.state is live and reads ok; states[] spells the
     same healthy state indexed. That is the one alias and it is declared
     here rather than guessed. A token that resolves to NEITHER renders its own
     name and is never treated as healthy -- an unrecognised freshness state
     must not be reported as a fresh one. */
  var IDX_ALIAS = { ok: 'indexed' };

  function indexState(ix) {
    var want = IDX_ALIAS[ix.state] || ix.state, hit = null;
    (ix.states || []).forEach(function (s) { if (s.id === want) hit = s; });
    return hit || { id: want, line: String(ix.state), annotateRows: true };
  }

  function idxToken(D, id) {
    if (id === 'indexed') return 'ok';
    return (D.status && D.status[id]) ? id : 'attention';
  }

  /** Window the source line on the MATCH, not on column 0. */
  function codeWindow(hit, chars) {
    var pre = String(hit.pre).replace(/^\s+/, '');
    var m = String(hit.hit);
    var post = String(hit.post);
    var room = Math.max(12, chars);
    var lead = 8, lcut = false, left = pre;
    if (left.length > lead) { left = left.slice(left.length - lead); lcut = true; }
    var used = left.length + m.length + (lcut ? 1 : 0);
    var avail = room - used, rcut = false, right = post;
    if (avail < 0) {
      /* The match itself outruns the band: keep its LEFT edge and the
         highlight, never scroll the match out of view. */
      var keep = Math.max(3, room - left.length - (lcut ? 1 : 0) - 1);
      m = m.slice(0, keep) + '…';
      right = '';
    } else if (right.length > avail) {
      right = right.slice(0, Math.max(0, avail - 1));
      rcut = true;
    }
    return (lcut ? '…' : '') + esc(left) +
      '<mark class="vC-hit">' + esc(m) + '</mark>' +
      esc(right) + (rcut ? '…' : '');
  }

  function matchRow(hit, f, b, w, th) {
    /* Exact box: W - 16 row padding - 20 line-number token - 8 gaps -
       24 overflow, less 6 for the highlight's own padding. */
    var chars = fit(w - 74, th, 'm');
    return '<div class="pmk-row vC-mrow" tabindex="0" role="button" data-pm-ctx="Match actions"' +
      ' data-pm-tip="' + esc(f.path + ':' + hit.line) + '">' +
      '<span class="vC-ln">' + esc(hit.line) + '</span>' +
      '<span class="vC-code">' + codeWindow(hit, chars) + '</span>' +
      K.overflow([
        { value: 'open', label: 'Open match' },
        { value: 'replace_selected', label: 'Replace this match' },
        { value: 'copy', label: 'Copy path and line' }
      ], 'Match actions') + '</div>';
  }

  function pSearch(D, st) {
    var b = D.bucket(st.width), w = st.width, th = st.theme;
    var s = D.search, ix = s.index;
    var active = ACTIVE.search;
    var ixs = indexState(ix);
    var word = ixs.line;
    /* builtAt is a FRESHNESS ANCHOR, and annotateRows is the fixture's own
       marker for "this index is not the authority for these rows". Printing
       commit abc12ef, 4m ago beside Index build cancelled or
       Indexing off - grep only pairs a dead index with a current-sounding
       timestamp, so the anchor travels only while the index is authoritative.
       The live state is authoritative, so this renders exactly as before. */
    var fresh = ixs.annotateRows === false ? ix.builtAt : '';
    var scopeLabel = 'All files';
    s.scopeOptions.forEach(function (o) { if (o.value === s.scope) scopeLabel = o.label; });

    /* ------------------------------------------------------- BLIND SPOT 15
       search.remote states IN ITS OWN SENTENCE that these results are local
       only and that the fallback was not silent. Rendering none of it WAS the
       silent fallback the field exists to forbid, in every redesign at once.

       Three channels, because one is not enough across four widths: a
       cross-lens attention mark (present at every bucket -- marks are the last
       thing this strip drops, before the global fact), the footer counts run
       from bucket 1, and the full block carrying the fixture's own two
       recovery actions in the Index lens at every width. */
    var rem = s.remote || {};
    var remoteOff = rem.available === false;

    /* Every redesign offered to EVICT a remote cache for a service the fixture
       declares down. Eviction is now gated on the same boolean that raises the
       notice and cites the remote's own reason code, rather than a sentence
       invented here. When the remote IS up the item is legal and carries the
       confirmation gate's code and consequence instead. */
    var evict = {
      value: 'evict_remote_cache', label: 'Evict remote cache', danger: true,
      disabled: remoteOff,
      reason: remoteOff ? rem.reason : 'search_evict_confirm',
      sentence: remoteOff ? rem.sentence
        : 'The remote acceleration cache is dropped and the next search rebuilds it from scratch.'
    };

    /* Gate scopes for this panel, from the fixture. */
    SCOPE.search_replace_all_confirm = s.summary.matches + ' matches in ' +
      s.summary.files + ' files matching ' + s.query + ', scope ' + scopeLabel;
    SCOPE.search_evict_confirm = 'the remote acceleration cache for this project on ' +
      (rem.host || 'the configured remote');

    var lenses = [
      { id: 'find', label: 'Find', count: String(s.summary.matches) },
      { id: 'replace', label: 'Replace' },
      { id: 'index', label: 'Index' },
      { id: 'scope', label: 'Scope' }
    ];

    /* The healthy id is the one the live token aliases to; everything else is
       worth a cross-lens mark, including the two the old map could not see. */
    var marks = [];
    if (ixs.id !== IDX_ALIAS.ok) {
      marks.push(mark('index', idxToken(D, ixs.id), '', 'Index — ' + word));
    }
    if (remoteOff && active !== 'index') {
      marks.push(mark('index', 'attention', '', 'Index — ' + rem.sentence));
    }

    var body = '', foot = null, tools = {};

    if (active === 'find') {
      var inner = '';
      s.files.forEach(function (f) {
        inner += K.section(cut(f.path, 'path', (w - 42) / UPPER, th, 's'), f.count, true);
        f.hits.forEach(function (hit) { inner += matchRow(hit, f, b, w, th); });
      });
      body = list(inner);
      tools = {
        value: s.query, placeholder: 'Find in files', label: 'Search query',
        controls: [
          '<span class="vC-seg" role="group" aria-label="Match flags">' +
          '<button type="button" aria-pressed="' + (s.flags.regex ? 'true' : 'false') +
            '" data-pm-tip="Use regular expression">.*</button>' +
          '<button type="button" aria-pressed="' + (s.flags.caseSensitive ? 'true' : 'false') +
            '" data-pm-tip="Match case">Aa</button>' +
          '<button type="button" aria-pressed="' + (s.flags.wholeWord ? 'true' : 'false') +
            '" data-pm-tip="Match whole word">\\b</button></span>',
          K.select(s.scope, s.scopeOptions, { style: 'flex:0 1 128px;min-width:0' })
        ],
        menu: [
          { type: 'head', label: 'Match flags' },
          { value: 'toggle_regex', label: 'Use regular expression' },
          { value: 'toggle_case_sensitive', label: 'Match case' },
          { value: 'toggle_whole_word', label: 'Match whole word' },
          { type: 'sep' },
          { value: 'expand_all', label: 'Expand all' },
          { value: 'collapse_all', label: 'Collapse all' }
        ],
        tip: 'Find options'
      };
      foot = {
        /* 'local only' is the fixture's own shorthand for the sentence the
           mark carries in full; it rides in the counts run rather than the
           facts run because a mark is never dropped and a fact is. */
        counts: s.summary.matches + ' in ' + s.summary.files + ' files' +
          (remoteOff ? ' · local only' : ''),
        refresh: word,
        page: '1-' + s.summary.matches + ' of ' + s.summary.matches,
        primary: '<button type="button" class="vC-mark" data-pm-tip="Previous match">' +
          K.icon('back', 12) + '</button><button type="button" class="vC-mark" ' +
          'data-pm-tip="Next match">' + K.icon('chev', 12) + '</button>'
      };
    } else if (active === 'replace') {
      var rinner = '';
      s.files.forEach(function (f) {
        rinner += row({
          b: b, w: w, th: th, id: f.path, idKind: 'path',
          cols: [col(f.count + ' hits', 46, 'num')],
          tip: f.path,
          /* The gate's scope is the WHOLE path plus its match count. The row
             above renders "…/IngredientQuantityEditor.svelte" at 240px, and a
             confirmation that names a truncated file has not stated a scope. */
          scope: f.count + ' matches in ' + f.path,
          ctxLabel: 'Replace actions',
          actions: [
            { value: 'replace_in_files', label: 'Replace in this file', danger: true,
              reason: 'search_replace_file_confirm',
              sentence: 'Every match in this one file is rewritten in place.' },
            { value: 'open', label: 'Open file' }
          ]
        });
      });
      body = list(rinner);
      tools = {
        value: s.replace, placeholder: 'Replace with', label: 'Replacement text',
        controls: [K.select(s.scope, s.scopeOptions, { style: 'flex:0 1 128px;min-width:0' })],
        menu: [
          { value: 'replace_in_files', label: 'Preview replacements' },
          { value: 'replace_all', label: 'Replace all', danger: true,
            reason: 'search_replace_all_confirm',
            sentence: 'Every match in the current result snapshot is rewritten in place, across all files.' }
        ],
        tip: 'Replace options'
      };
      foot = {
        counts: s.summary.matches + ' in ' + s.summary.files + ' files' +
          (remoteOff ? ' · local only' : ''),
        refresh: word,
        page: '1-' + s.summary.files + ' of ' + s.summary.files,
        /* Was a plain PMK.btn whose tooltip PROMISED a confirmation that did
           not exist. Now it opens one. */
        primary: gbtn('Replace All', { primary: true, tip: 'Asks for confirmation first' },
          { code: 'search_replace_all_confirm', value: 'replace_all',
            say: 'Every match in the current result snapshot is rewritten in place, across all files.' })
      };
    } else if (active === 'index') {
      var lb = ix.lastBuild || null;
      body = pad(
        /* THE REMOTE STATEMENT, in the fixture's own sentence and with the
           fixture's own two actions. warning, not blocked: local search still
           works, which is precisely the claim the sentence is making, and
           dressing it as a block would say the panel is broken. */
        (remoteOff
          ? K.blocked({ code: rem.reason, sentence: rem.sentence, severity: 'warning',
              actions: rem.actions })
          : '') +
        /* index.lastBuild is a TERMINAL RECORD of the previous build, not the
           live state. Here state is ok and lastBuild.state is cancelled, and
           the panel has to be able to say BOTH -- "the index is current" and
           "the last build you started was cancelled two days ago and its
           partial generation was discarded" -- without either erasing the
           other. So it renders as its own warning-tier block below the live
           state and never in place of it. severity is chosen rather than read,
           because lastBuild carries none: a finished-and-cancelled build is a
           fact worth stating, not a condition that blocks anything, which is
           what warning means. resumable:false is why the fixture's one action
           is 'Start a fresh build' and not 'Resume'. */
        (lb && lb.state !== 'ok'
          ? K.blocked({ code: lb.state, sentence: lb.line + '. ' + lb.detail,
              severity: 'warning', actions: lb.actions })
          : '') +
        K.card(
          K.kv('State', word, 'token', b) +
          K.kv('Engine', ix.engine, 'token', b) +
          K.kv('Documents', num(ix.documents), 'token', b) +
          K.kv('Last indexed', ix.builtAt, 'measure', b) +
          (lb ? K.kv('Last build', lb.line + ' · ' + lb.at, 'measure', b) : '')
        ) +
        /* Remote acceleration is a SEPARATE inventory from the local index and
           it is stated as one: host, state and when it was last checked. The
           panel used to carry an Evict action for this service and no field
           anywhere naming the service, its host or its health. */
        K.card(
          K.kv('Remote', rem.host || 'not configured', 'measure', b) +
          K.kv('Acceleration', rem.state || 'unknown', 'token', b) +
          K.kv('Checked', rem.checkedAt || '--', 'token', b) +
          K.kv('Fallback', rem.silentFallback === false ? 'stated, not silent' : 'unknown', 'token', b)
        ) +
        K.card(
          K.kv('Large files', ix.largeFileThresholdMb + ' MB', 'token', b) +
          K.kv('Generated', ix.excludeGenerated ? 'Excluded' : 'Indexed', 'token', b) +
          K.kv('Symlinks', ix.followSymlinks ? 'Followed' : 'Skipped', 'token', b)
        )
      );
      tools = {
        placeholder: 'Filter settings', label: 'Filter index settings',
        controls: [],
        menu: [
          { value: 'rebuild_index', label: 'Rebuild index' },
          evict
        ],
        tip: 'Index actions'
      };
      foot = {
        counts: num(ix.documents) + ' documents' + (remoteOff ? ' · local only' : ''),
        refresh: ix.builtAt,
        primary: K.btn('Rebuild index', { tip: 'Rebuilds the ' + ix.engine + ' index' })
      };
    } else {
      var sinner = '';
      s.scopeOptions.forEach(function (o) {
        sinner += row({
          b: b, w: w, th: th, id: o.label,
          cls: o.value === s.scope ? 'vC-sel' : '',
          leadW: 14,
          lead: o.value === s.scope
            ? '<span class="vC-letter" aria-label="Current scope">' + K.icon('check', 12) + '</span>'
            : '<span class="vC-letter" aria-hidden="true"></span>',
          cols: [col(o.value, 54, 'mono')],
          ctxLabel: 'Scope actions',
          actions: [{ value: 'set_scope', label: 'Use this scope' }]
        });
      });
      body = list(sinner);
      tools = {
        placeholder: 'Include or exclude glob', label: 'Scope glob',
        controls: [K.select(s.scope, s.scopeOptions, { style: 'flex:0 1 128px;min-width:0' })],
        menu: [{ value: 'clear_scope', label: 'Clear scope' }],
        tip: 'Scope actions'
      };
      foot = {
        counts: scopeLabel,
        primary: K.btn('Apply', { primary: true })
      };
    }

    return frame({
      bucket: b, width: w, theme: th, title: 'Search', count: s.summary.matches + '/' + s.summary.files,
      menu: [
        { type: 'head', label: 'Indexing' },
        { value: 'rebuild_index', label: 'Rebuild index' },
        /* the SAME item literal the Index lens uses, so the panel menu cannot
           offer an eviction the lens has correctly disabled */
        evict,
        { type: 'sep' },
        { value: 'show', label: 'Detach panel' }
      ],
      menuTip: 'Search actions',
      ctxIcon: 'search',
      ctx: [scopeLabel, word, remoteOff ? 'local only' : '',
            num(ix.documents) + ' docs', fresh],
      ctxTip: scopeLabel + ' · ' + word + (fresh ? ' · ' + fresh : '') +
        (remoteOff ? ' · ' + rem.sentence : ''),
      marks: marks,
      lenses: lenses, active: active,
      toolbar: tools,
      region: active === 'find' ? 'results_tree' : active,
      body: body, footer: foot
    });
  }

  /* =================================================================== 2/7
     SOURCE CONTROL — Changes . Worktrees . History . Graph . Branches . Stash
     ------------------------------------------------------------------- */
  function baseOf(p) { var i = p.lastIndexOf('/'); return i < 0 ? p : p.slice(i + 1); }
  function dirOf(p) { var i = p.lastIndexOf('/'); return i < 0 ? '' : p.slice(0, i); }

  function fileRow(f, group, b, w, th, repo) {
    return row({
      b: b, w: w, th: th, two: true,
      id: baseOf(f.path),
      sub: dirOf(f.path), subKind: 'path',
      leadW: 14,
      lead: '<span class="vC-letter" aria-label="' + esc(group) + '">' + esc(f.code) + '</span>',
      cols: [col(group, 56)],
      tip: f.path,
      /* The row splits the path across two lines and cuts both. The gate gets
         it whole, and names the repository too -- L397 forbids assuming a
         single repo context, and a discard is exactly the moment to say which
         checkout is about to lose its edits. */
      scope: f.path + ' (' + group + ') in ' + repo,
      ctxLabel: 'File actions',
      actions: [
        { value: 'diff_open', label: 'Open diff' },
        { value: group === 'staged' ? 'unstage_hunks' : 'stage_hunks',
          label: group === 'staged' ? 'Unstage' : 'Stage' },
        { type: 'sep' },
        { value: 'discard_hunks', label: 'Discard changes', danger: true,
          reason: 'git_discard_confirm',
          sentence: 'The working-tree edits are removed. Nothing is written to the stash and there is no undo.' }
      ]
    });
  }

  function pSource(D, st) {
    var b = D.bucket(st.width), w = st.width, th = st.theme;
    var s = D.source, p = D.project, active = ACTIVE.source;
    var dirty = s.worktrees.filter(function (x) { return x.dirty; }).length;
    var parallel = s.worktrees.length - 1;

    /* ------------------------------------------------------- BLIND SPOT 2
       REPO IDENTITY. source.repo carries name, owner, nameWithOwner, host,
       remote, lifecycle, visibility, defaultBranch and two sibling repos, and
       ten of ten designs rendered NONE of it. GitHub_Integration.md:L397
       forbids assuming a single repo context, and this panel did exactly that:
       every string it showed -- branch, ahead, dirty, remote health -- is
       true of "the repository", with no statement anywhere of which one, on
       what host, at what visibility, or that two siblings exist beside it.

       Three surfaces, chosen so none of them costs a row at 240px:

         context strip  nameWithOwner as the SECOND fact, so the branch keeps
                        the single bucket-0 slot -- the branch is the more
                        operational fact and demoting it to buy an identity
                        would have been a trade, not a fix. The strip's
                        tooltip carries the whole identity at every width.
         Branches lens  a card. Branches are repo-scoped objects, so the lens
                        that lists them is the honest home for host,
                        visibility, lifecycle, default branch and remote URL.
         panel menu     the siblings, by name, as reachable items. A count of
                        2 that cannot be opened is not a repo context. */
    var repo = s.repo || {};
    var nwo = repo.nameWithOwner || p.name;

    SCOPE.git_discard_confirm = 'the working tree of ' + nwo;
    SCOPE.git_worktree_remove_confirm = 'a worktree of ' + nwo;
    SCOPE.stash_drop_confirm = 'the stash of ' + nwo;

    var lenses = [
      { id: 'changes', label: 'Changes', count: String(s.counts.staged + s.counts.unstaged) },
      { id: 'worktrees', label: 'Worktrees', count: String(s.counts.worktrees) },
      { id: 'history', label: 'History', count: String(s.counts.commits) },
      { id: 'graph', label: 'Graph' },
      { id: 'branches', label: 'Branches', count: String(s.counts.branches) },
      { id: 'stash', label: 'Stash', count: String(s.counts.stash) }
    ];

    /* THE RISK, PAID FOR. In an accordion these two facts are free; in a lens
       deck they must be carried by the strip or they are lost. */
    var marks = [];
    if (active !== 'changes' && (s.counts.staged + s.counts.unstaged) > 0) {
      marks.push(mark('changes', 'attention', String(s.counts.staged + s.counts.unstaged),
        'Changes — ' + s.counts.staged + ' staged, ' + s.counts.unstaged + ' unstaged'));
    }
    if (active !== 'worktrees' && dirty > 0) {
      marks.push(mark('worktrees', 'attention', String(dirty),
        'Worktrees — ' + dirty + ' dirty'));
    }
    var running = s.worktrees.filter(function (x) { return x.status === 'running'; }).length;
    if (active !== 'worktrees' && running > 0) {
      marks.push(mark('worktrees', 'running', String(running),
        'Worktrees — ' + running + ' owned by an active run'));
    }
    var stale = s.worktrees.filter(function (x) { return x.status === 'stale'; }).length;
    if (active !== 'worktrees' && stale > 0) {
      marks.push(mark('worktrees', 'stale', String(stale), 'Worktrees — ' + stale + ' stale'));
    }
    if (active !== 'stash' && s.counts.stash > 0) {
      marks.push(mark('stash', 'queued', String(s.counts.stash),
        'Stash — ' + s.counts.stash + ' entry'));
    }

    var body = '', foot = null, tools = {};

    if (active === 'changes') {
      var inner = K.section('Staged', s.counts.staged, true);
      s.staged.forEach(function (f) { inner += fileRow(f, 'staged', b, w, th, nwo); });
      inner += K.section('Unstaged', s.counts.unstaged, true);
      s.unstaged.forEach(function (f) { inner += fileRow(f, 'unstaged', b, w, th, nwo); });
      body = list(inner);
      tools = {
        value: '', placeholder: 'Filter changed files', label: 'Filter changed files',
        controls: [
          K.btn('Stage all', { tip: 'Stage every unstaged change' }),
          K.btn('Fetch', { tip: 'Fetch from the remote' })
        ],
        menu: [
          { value: 'stage_hunks', label: 'Stage all' },
          { value: 'unstage_hunks', label: 'Unstage all' },
          { type: 'sep' },
          { value: 'toggle_generated_filter', label: 'Hide generated files' },
          { value: 'suggest_commit_batches', label: 'Suggest commit batches' }
        ],
        tip: 'Changes options'
      };
      /* The composer is the lens footer: it is docked OUTSIDE the section's
         scroller, which is the two-level scroll model GI-004:L160 requires. */
      foot = {
        counts: s.counts.staged + ' staged',
        refresh: 'ahead ' + p.ahead,
        field: '<input class="pmk-field" type="text" style="flex:1 1 auto;width:auto;min-width:0" ' +
          'placeholder="Commit message" aria-label="Commit message" value="' +
          esc(s.commitDraft) + '">',
        primary: K.btn('Commit', { primary: true, tip: 'Commit the staged changes' }) +
          K.overflow([
            { value: 'generate_commit_message', label: 'Generate commit message' },
            { value: 'suggest_commit_batches', label: 'Suggest commit batches' }
          ], 'Composer actions')
      };
    } else if (active === 'worktrees') {
      var winner = '';
      s.worktrees.forEach(function (t) {
        /* BROKE-3. WorktreeGitImprovement.md:L297 reserves five words --
           active, reserved, orphaned, released, blocked_preserved -- precisely
           because PM_DATA.status cannot express them, and this row rendered
           the status word in their place at every width and in the accessible
           name. released was the worst of the five: that worktree was
           released after a CLEAN MERGE into main and is retained for lineage,
           and the row announced it as "Unavailable" -- a successfully merged
           worktree reported as broken, to the one user who cannot see the rail
           and check.

           The word goes on LINE TWO rather than into a column, and that is
           arithmetic rather than taste: blocked_preserved is 17 characters,
           which needs 106px in the basic theme's Inter, and a 106px column
           takes the identity slot below the branch name at 380px. Line two is
           budgeted against the identity width, so the reserved word renders
           WHOLE in all four themes from bucket 1 up. Eliding it to
           'blocked_pr...' would have been the same defect wearing a column.

           The accessible name is authored so the reserved word leads. The
           status label still follows it -- the rail is real information and
           dropping it would trade one omission for another -- but it can no
           longer be the first thing said about a released worktree. */
        var lc = t.lifecycle || '';
        winner += row({
          b: b, w: w, th: th, two: b >= 1, status: t.status,
          id: t.branch, idKind: 'path',
          sub: (lc ? lc + ' · ' : '') + t.owner,
          cols: [col(t.run || '', 34, 'num'), col(t.kind, 50), col(t.base, 44)],
          say: t.branch + '. ' + (lc ? 'Lifecycle ' + lc + '. ' : '') +
               K.statusOf(t.status).label + '. ' + t.owner,
          /* a RESERVED worktree has no checkout on disk, so path is null; the
             row used to concatenate it anyway and render the literal 'null' */
          tip: (t.path ? t.path + ' · ' : '') + t.owner +
               (lc ? ' · ' + lc : ''),
          /* Branch AND checkout path AND dirty state AND owner: removing a
             worktree destroys a directory, so the gate names the directory.
             A reserved worktree has no path and the scope says so instead of
             concatenating the literal null. */
          scope: t.branch + ' at ' + (t.path || 'no checkout on disk') +
                 (t.dirty ? ', which has uncommitted changes' : ', clean') +
                 ', owned by ' + t.owner,
          ctxLabel: 'Worktree actions',
          actions: [
            { value: 'worktree.open', label: 'Open' },
            { value: 'worktree.open_files', label: 'Open Files' },
            { value: 'worktree.compare', label: 'Compare' },
            { value: 'worktree.focus_lineage', label: 'Focus lineage' },
            { type: 'sep' },
            { value: 'worktree.remove', label: 'Remove', danger: true,
              disabled: !!t.lockedBy, reason: t.lockedBy ? (t.lockReason || 'worktree_locked')
                                                         : 'git_worktree_remove_confirm',
              sentence: t.lockedBy ? 'Locked by ' + t.lockedBy + '.'
                : 'The checkout directory is deleted from disk' +
                  (t.dirty ? ', including its uncommitted changes' : '') +
                  '. Lineage is preserved; the directory is not.' },
            /* WorktreeGitImprovement.md:L439 names prunable as one of the four
               flags that drive action enablement, and every version derived
               enablement from lockedBy alone. Prune is the one this file can
               answer from the data it has. */
            { value: 'worktree.request_prune', label: 'Request prune',
              disabled: t.prunable !== true,
              reason: t.prunable !== true ? 'worktree_not_prunable' : '',
              sentence: t.prunable !== true
                ? 'Git does not report this worktree as prunable.' : '' }
          ]
        });
        /* GI-020 / W-014: the reason is an always-visible line inside the row
           group, never a native title on a disabled control. */
        if (t.lockedBy) {
          winner += K.blocked({
            code: t.lockReason,
            sentence: 'Locked by ' + t.lockedBy + '.',
            actions: [{ label: 'Open Lane' }, { label: 'Focus lineage' }, { label: 'Request prune' }]
          });
        }
      });
      body = list(winner);
      tools = {
        placeholder: 'Filter worktrees', label: 'Filter worktrees',
        controls: [K.select('all', [
          { value: 'all', label: 'All' },
          { value: 'thread', label: 'Threads' },
          { value: 'orch', label: 'Orchestrator' },
          { value: 'manual', label: 'Manual' }
        ], { style: 'flex:0 1 116px;min-width:0' })],
        menu: [
          { value: 'worktree.create', label: 'New worktree' },
          { value: 'worktree.list', label: 'Refresh list' },
          { type: 'sep' },
          { value: 'hide_stale', label: 'Hide stale worktrees' }
        ],
        tip: 'Worktree options'
      };
      foot = {
        counts: s.counts.worktrees + ' worktrees · ' + dirty + ' dirty',
        refresh: s.remote.freshness,
        page: '1-' + s.counts.worktrees + ' of ' + s.counts.worktrees,
        primary: K.btn('New worktree', { primary: true })
      };
    } else if (active === 'history') {
      var hinner = thead('Commit', [
        { v: '', w: 30, cls: 'num', h: 'age' },
        { v: '', w: 52, cls: '', h: 'author' },
        { v: '', w: 60, cls: '', h: 'branch' }
      ], b, th);
      s.history.forEach(function (c) {
        hinner += row({
          b: b, w: w, th: th, two: true,
          id: c.sha, idKind: 'ref',
          sub: c.subject,
          cols: [col(c.when, 30, 'num'), col(c.who, 52), col(p.branch, 60)],
          tip: c.sha + ' · ' + c.subject,
          ctxLabel: 'Commit actions',
          actions: [
            { value: 'history_open_commit', label: 'Open commit' },
            { value: 'set_compare_target', label: 'Set compare target' },
            { value: 'open_review', label: 'Open Review Mode' }
          ]
        });
      });
      body = list(hinner);
      tools = {
        placeholder: 'Filter commits', label: 'Filter commits',
        controls: [K.select(p.branch, s.branches.map(function (x) {
          return { value: x, label: x };
        }), { style: 'flex:0 1 128px;min-width:0' })],
        menu: [
          { value: 'open_review', label: 'Open Review Mode' },
          { value: 'load_older', label: 'Load older commits' }
        ],
        tip: 'History options'
      };
      foot = {
        counts: s.counts.commits + ' commits',
        refresh: s.remote.freshness,
        page: '1-' + s.counts.commits + ' of ' + s.counts.commits,
        primary: K.btn('Open Review Mode')
      };
    } else if (active === 'graph') {
      /* FinalGUISpec:L721 — the graph must never be the only path. This lens
         IS the keyboard-reachable list equivalent: which worktree or run owns
         each branch tip, with ahead/behind. */
      var owner = {};
      s.worktrees.forEach(function (t) { owner[t.branch] = t; });
      var ginner = thead('Branch tip', [
        { v: '', w: 34, cls: 'num', h: 'behind' },
        { v: '', w: 34, cls: 'num', h: 'ahead' },
        { v: '', w: 86, cls: '', h: 'owner' },
        { v: '', w: 34, cls: 'num', h: 'run' }
      ], b, th);
      s.branchList.forEach(function (br) {
        var t = owner[br.name];
        ginner += row({
          b: b, w: w, th: th,
          status: t ? t.status : (br.current ? 'ok' : 'queued'),
          id: br.name, idKind: 'path',
          cols: [
            col('-' + br.behind, 34, 'num'),
            col('+' + br.ahead, 34, 'num'),
            col(t ? t.owner : 'Manual', 86),
            col(t && t.run ? t.run : '', 34, 'num')
          ],
          tip: br.name + (t ? ' · ' + t.owner : ''),
          ctxLabel: 'Graph actions',
          actions: [
            { value: 'graph.focus', label: 'Focus this tip' },
            { value: 'worktree.focus_lineage', label: 'Focus lineage' },
            { value: 'open_diff', label: 'Compare' }
          ]
        });
      });
      body = list(ginner);
      tools = {
        placeholder: 'Filter tips', label: 'Filter branch tips',
        controls: [K.select('compact', [
          { value: 'compact', label: 'Compact' },
          { value: 'expanded', label: 'Expanded' }
        ], { style: 'flex:0 1 104px;min-width:0' })],
        menu: [
          { value: 'graph.layout', label: 'Layout' },
          { value: 'graph.filter', label: 'Filter' }
        ],
        tip: 'Graph options'
      };
      foot = {
        counts: s.counts.branches + ' tips · ' + s.counts.worktrees + ' owned',
        refresh: s.remote.freshness,
        primary: K.btn('Focus lineage')
      };
    } else if (active === 'branches') {
      /* BLIND SPOT 2, the card. Every field here is a source.repo field and
         none of them was rendered anywhere before. `remote` gets the measure
         treatment because a git URL is 38 characters and a token kv would put
         it past its own label at every width. */
      var repoCard = pad(K.card(
        K.kv('Repository', nwo, 'measure', b) +
        K.kv('Host', repo.host || '', 'token', b) +
        K.kv('Visibility', repo.visibility || '', 'token', b) +
        K.kv('Lifecycle', repo.lifecycle || '', 'token', b) +
        K.kv('Default branch', repo.defaultBranch || '', 'token', b) +
        K.kv('Remote', repo.remote || '', 'measure', b) +
        K.kv('Sibling repos', String(repo.siblingCount == null ? 0 : repo.siblingCount), 'token', b)
      ));
      var binner = thead('Branch', [
        { v: '', w: 34, cls: 'num', h: 'behind' },
        { v: '', w: 34, cls: 'num', h: 'ahead' },
        { v: '', w: 54, cls: '', h: 'state' }
      ], b, th);
      s.branchList.forEach(function (br) {
        binner += row({
          b: b, w: w, th: th,
          status: br.current ? 'ok' : 'queued',
          id: br.name, idKind: 'path',
          cls: br.current ? 'vC-sel' : '',
          cols: [col('-' + br.behind, 34, 'num'), col('+' + br.ahead, 34, 'num'),
                 col(br.current ? 'current' : '', 54)],
          tip: br.name,
          ctxLabel: 'Branch actions',
          actions: [
            { value: 'switch', label: 'Switch to branch', disabled: br.current,
              reason: br.current ? 'branch_already_current' : '',
              sentence: br.current ? 'This branch is already checked out.' : '' },
            { value: 'open_diff', label: 'Compare' },
            { value: 'pr.create', label: 'Create pull request' }
          ]
        });
      });
      body = repoCard + list(binner);
      tools = {
        placeholder: 'Filter branches', label: 'Filter branches',
        controls: [K.select(p.branch, s.branches.map(function (x) {
          return { value: x, label: x };
        }), { style: 'flex:0 1 128px;min-width:0' })],
        menu: [
          { value: 'branch.create', label: 'New branch' },
          { value: 'fetch', label: 'Fetch' }
        ],
        tip: 'Branch options'
      };
      foot = {
        counts: s.counts.branches + ' branches',
        refresh: s.remote.health,
        page: '1-' + s.counts.branches + ' of ' + s.counts.branches,
        primary: K.btn('Switch', { primary: true })
      };
    } else {
      var kinner = '';
      s.stash.forEach(function (e, i) {
        kinner += row({
          b: b, w: w, th: th, two: true,
          id: 'stash@{' + i + '}',
          sub: e.label,
          status: 'queued',
          cols: [col(e.when, 30, 'num')],
          tip: e.label,
          /* The row shows a cut label; the gate shows the whole message and
             the age, because "Drop" on the wrong stash entry is unrecoverable
             and the message is the only thing that tells them apart. */
          scope: 'stash@{' + i + '} — ' + e.label + ' (' + e.when + ')',
          ctxLabel: 'Stash actions',
          actions: [
            { value: 'stash.apply', label: 'Apply' },
            { value: 'stash.pop', label: 'Pop' },
            { type: 'sep' },
            { value: 'stash.drop', label: 'Drop', danger: true,
              reason: 'stash_drop_confirm',
              /* Deliberately NOT "unrecoverable": a dropped stash sometimes
                 survives as a dangling commit, and a gate that overstates the
                 damage teaches the user to distrust the next one. The claim is
                 kept to what this app can actually promise. */
              sentence: 'The entry is removed from the stash list. Puppet Master offers no route to bring it back.' }
          ]
        });
      });
      body = list(kinner);
      tools = {
        placeholder: 'Filter stash', label: 'Filter stash entries',
        controls: [K.btn('Stash all', { tip: 'Stash every change in the working tree' })],
        menu: [{ value: 'stash', label: 'Stash all changes' }],
        tip: 'Stash options'
      };
      foot = {
        counts: s.counts.stash + ' entry',
        primary: K.btn('Apply', { primary: true })
      };
    }

    return frame({
      bucket: b, width: w, theme: th, title: 'Source Control',
      count: s.counts.staged + '/' + s.counts.unstaged,
      menu: [
        /* The repository names ITSELF at the top of its own menu, and its
           siblings are items rather than a count. L397's "do not assume a
           single repo context" is not satisfied by a number. */
        { type: 'head', label: nwo + ' · ' + (repo.visibility || '') },
        { value: 'repo.open', label: 'Open on ' + (repo.host || 'the host') },
        { value: 'repo.copy_remote', label: 'Copy remote URL' },
        { type: 'head', label: 'Sibling repositories' },
      ].concat((repo.siblings || []).map(function (sib) {
        return { value: 'repo.switch', label: sib };
      })).concat([
        { type: 'sep' },
        { type: 'head', label: 'Remote' },
        { value: 'pull', label: 'Pull' },
        { value: 'push', label: 'Push' },
        { value: 'fetch', label: 'Fetch' },
        { type: 'sep' },
        { value: 'open_review', label: 'Open Review Mode' },
        { value: 'pr.create', label: 'Create pull request' }
      ]),
      menuTip: 'Source Control actions',
      ctxIcon: 'branch',
      /* nameWithOwner is fact TWO. The branch keeps the single bucket-0 slot
         because it is the more operational of the two, and the tooltip below
         carries the whole identity at every width including 240px. */
      ctx: [p.branch, nwo, 'ahead ' + p.ahead, dirty + ' dirty', s.remote.health],
      ctxTip: nwo + ' · ' + (repo.visibility || '') + ' · ' + (repo.host || '') +
        ' · ' + p.branch + ' · ahead ' + p.ahead + ' · ' + parallel +
        ' parallel contexts · ' + (repo.siblingCount || 0) + ' sibling repositories',
      marks: marks,
      lenses: lenses, active: active,
      toolbar: tools,
      region: active,
      body: body, footer: foot
    });
  }

  /* =================================================================== 3/7
     GITHUB ACTIONS — Branch . Runs . Workflows . Secrets . Settings
     ------------------------------------------------------------------- */
  /* Columns are declared most-durable-first: age outlives run, run outlives
     branch, branch outlives duration. Below bucket 2 there is no table, so
     the row falls back to the two-line form the research asks for. */
  var RUN_COLS = [
    { v: '', w: 30, cls: 'num', h: 'age' },
    { v: '', w: 38, cls: 'num', h: 'run' },
    { v: '', w: 90, cls: '', h: 'branch' },
    { v: '', w: 52, cls: 'num', h: 'dur' }
  ];

  /* BROKE-6. GI-021, GitHub_Integration.md:L1271-L1275: archived, deleted and
     historical_only disable mutation DETERMINISTICALLY, and a capability limit
     must surface as EFFECTIVE CAPABILITY STATE -- in prose -- rather than as a
     hidden control. This panel offered Re-run, Re-run failed jobs, Cancel and
     Dispatch on a repository the fixture declares archived, because it read
     none of repository.lifecycle, .capabilities, .mutationDisabled or
     .capabilitySentence. The row states were read correctly and the
     repository's were not read at all, so a green run on an archived repo
     offered a live Re-run.

     Every control below reads its OWN named capability rather than the
     umbrella mutationDisabled boolean, because the fixture models them
     separately and ships a second canonical sentence -- 'You can dispatch but
     cannot manage secrets' -- for the state where they differ. Controls stay
     VISIBLE and disabled; L1275 is explicit that a capability limit is not a
     reason to remove a control.

     THE UMBRELLA IS THE FALLBACK, NOT THE ANSWER. capabilities{} names five
     of them -- view_runs, dispatch, manage_secrets, rerun, cancel -- and the
     panel offers more mutations than that: pin and unpin, and the approval
     route out of a blocked deployment. Reading only the named five left every
     unnamed mutation live on a repository that forbids all of them, which is
     the same defect as BROKE-6 with a smaller blast radius. So a capability
     the map does not name falls back to mutationDisabled, and an UNKNOWN verb
     is treated as a mutation rather than assumed harmless -- the safe
     direction for a gate to fail in. */
  function repoGate(A) {
    var R = A.repository || {}, CAP = R.capabilities || {};
    /* 'active' is the one lifecycle that limits nothing. Every other member
       of repository.lifecycleStates is a limit of some kind, so the test is
       "not active" rather than a list of the ones this file happens to
       know -- five of the seven render nowhere in the bakeoff today and a
       hard-coded list is how they stay that way. */
    var limited = !!R.lifecycle && R.lifecycle !== 'active';
    /* An explicit mutationDisabled wins in BOTH directions; its absence on a
       non-live lifecycle still closes the gate, because GI-021 makes the
       lifecycle itself deterministic and a missing flag is not permission. */
    var mut = R.mutationDisabled === true ||
              (R.mutationDisabled == null && limited);
    function can(n) {
      if (CAP[n] === false) return false;
      if (CAP[n] === true) return true;
      return !mut;
    }
    return {
      repo: R,
      code: R.lifecycle || '',
      say: R.sentence || '',
      prose: R.capabilitySentence || '',
      limited: limited,
      mut: mut,
      rerun: !can('rerun'), cancel: !can('cancel'),
      dispatch: !can('dispatch'), secrets: !can('manage_secrets'),
      /* Neither of these is a named capability and both change remote state,
         so both ride the umbrella. Naming them in the fixture later changes
         the answer without changing this file. */
      pin: !can('pin'), approve: !can('approve')
    };
  }

  /* An allowedActionIds[] entry is a COMMAND ID, not a permission: the fixture
     lists the actions a blocked row still routes to, and 'still routes to' is
     not 'still permitted'. github.request_review is an approval and an
     approval mutates the remote, so on an archived repository it is disabled
     exactly like Re-run. The verb is read off the id's trailing segment rather
     than matched against a list of known ids, and anything whose verb is not
     a READ is treated as a mutation. A new id in the fixture therefore gates
     correctly by default and only a demonstrably read-only verb opts out. */
  var READ_VERB = /^(open|view|copy|compare|list|show|read|download|inspect|export)(_|$)/;
  function mutatingAction(id) {
    return !READ_VERB.test(String(id).split('.').pop());
  }

  /* PMK.blocked() renders the code, the sentence and an action row -- but its
     action row has no disabled state, and the repository gate has to reach
     those buttons. Same component, same classes, one capability the shared
     helper does not carry, plus the VISIBLE reason line GI-017 and GAAAF-005
     require: a greyed button with the explanation hidden in a tooltip fails
     both. Actions authored by the fixture keep their authored labels; where
     only ids are given the label is derived, as everywhere else in this file. */
  function blockedGated(bl, g, tone) {
    if (!bl) return '';
    /* BLIND SPOTS 1 AND 16, the design half. This helper was a FORK of
       PMK.blocked, written when the kit's action row had no disabled state
       and the repository gate had to reach those buttons. The kit has since
       gained two things the fork did not copy, and a fork that stops tracking
       is how a version loses features the shared layer already fixed:

         SEVERITY. PMK.severityOf reads blocked.severity and PMK.blocked draws
         the tier -- glyph, rail dash and the severity word.
         actions_runner_unavailable is severity 'warning' and retryable, and
         this fork drew it in exactly the same red as a production deploy
         needing two approvals from the release group. Two states, one look.

         THE UNION. PMK.blockedActions merges actions[] with
         allowedActionIds[] and de-duplicates by id, where this fork took one
         or the other. Run #17 supplies both -- the same id, once with the
         author's label and once bare -- and the either/or was right about it
         only by luck.

       So the fork is gone. The block comes from PMK.blocked with its action
       row suppressed, and the ONLY thing built here is the gated row the kit
       cannot build, spliced in ahead of the closing tag rather than by
       re-emitting the kit's structure -- so the next change to PMK.blocked is
       inherited instead of missed. */
    var acts = K.blockedActions(bl);
    var off = [];
    var rowH = acts.map(function (a) {
      var no = g && g.approve && mutatingAction(a.id);
      if (no) off.push(a.label);
      return K.btn(a.label, { disabled: no });
    }).join('');
    var head = K.blocked(bl, tone, { actions: false });
    var tail = (rowH ? '<span class="pmk-acts">' + rowH + '</span>' : '') +
      (off.length
        ? '<span class="pmk-note">' + esc(off.join(', ')) +
          ' — disabled, this repository is ' + esc(g.code) + '.</span>'
        : '');
    return tail ? head.slice(0, -6) + tail + '</div>' : head;
  }

  function runRow(r, b, w, th, g) {
    /* The repository capability OUTRANKS the row's own state: an archived repo
       cannot re-run a green run either, and answering with the run's status
       code would be the right answer to the wrong question. */
    var noRerun = g.rerun, noCancel = g.cancel;
    return row({
      b: b, w: w, th: th, two: b < 2, status: r.status,
      id: r.name,
      sub: r.run + ' · ' + r.branch + ' · ' + r.age,
      cols: [col(r.age, 30, 'num'), col(r.run, 38, 'num'),
             col(r.branch, 90, '', 'path'), col(r.dur, 52, 'num')],
      tip: r.name + ' ' + r.run + ' · ' + r.branch,
      scope: 'run ' + r.run + ', ' + r.name + ', on ' + r.branch +
             ' (' + K.statusOf(r.status).word + ', ' + r.age + ')',
      ctxLabel: 'Run actions',
      actions: [
        { value: 'github.actions.open_run', label: 'Open run' },
        { value: 'actions.view_logs', label: 'View logs' },
        { type: 'sep' },
        { value: 'actions.rerun', label: 'Re-run', disabled: noRerun,
          reason: noRerun ? g.code : '', sentence: noRerun ? g.say : '' },
        { value: 'actions.rerun_failed', label: 'Re-run failed jobs',
          disabled: noRerun || r.status !== 'failed',
          reason: noRerun ? g.code
                : (r.status !== 'failed' ? 'actions_no_failed_jobs' : ''),
          sentence: noRerun ? g.say
                  : (r.status !== 'failed' ? 'This run has no failed jobs.' : '') },
        /* Three states on one item, and the field pair says which: BLOCKED by
           the repository, BLOCKED by the run's own state, or LEGAL -- in
           which case reason/sentence carry the confirmation gate's code and
           consequence instead of a refusal. */
        { value: 'actions.cancel', label: 'Cancel', danger: true,
          disabled: noCancel || r.status !== 'running',
          reason: noCancel ? g.code
                : (r.status !== 'running' ? 'actions_run_not_in_progress'
                                          : 'actions_cancel_confirm'),
          sentence: noCancel ? g.say
                  : (r.status !== 'running'
                      ? 'Only an in-progress run can be cancelled.'
                      : 'The run stops where it is and lands as cancelled. Finished jobs keep their receipts; queued jobs never start.') },
        { type: 'sep' },
        { value: 'actions.open_in_browser', label: 'Open in browser' }
      ]
    });
  }

  function triage(r, w, th) {
    var t = r.triage;
    var h = '<div class="vC-cap"><span class="pmk-note" data-pm-tip="Excerpt only — ' +
      'full step logs open in the bottom runtime zone">job ' + esc(t.job) +
      ' · step ' + esc(t.step) + '</span>';
    t.lines.forEach(function (l) {
      h += '<div class="vC-capln">' + esc(cut(l, 'default', w - 42, th, 'm')) + '</div>';
    });
    /* ------------------------------------------- REGRESSION VS v0, closed
       GitHub_Integration.md:L920. The shipped app's triage capsule names the
       CHANGED FILES and the LIKELY NEXT ACTION; all six redesigns dropped
       both, and pass 2 found the fields present on all four triage blocks and
       grepped the emitted markup for strings that exist only in changedFiles
       at every width without a single hit. A stack trace says what broke.
       changedFiles says where to look and likelyNext says what to do, which
       is the whole reason a triage capsule exists rather than a log tail.

       changedCount is stated as its own label rather than inferred from the
       array length, so a capsule that shows two of six says two of six
       instead of implying the array is complete. The paths reuse .vC-capln --
       same mono face, same computed cut budget as the log lines above them --
       so no new width behaviour is introduced at 240px.

       The sentence is NEVER width-gated. It is the shortest field in the
       capsule and the most actionable one, and it wraps in .pmk-blocked-say,
       which is the kit's own prose treatment. */
    if (t.changedFiles && t.changedFiles.length) {
      var nf = t.changedCount == null ? t.changedFiles.length : t.changedCount;
      h += '<span class="pmk-note">' + esc(nf + (nf === 1 ? ' changed file' : ' changed files')) +
        '</span>';
      t.changedFiles.forEach(function (f) {
        h += '<div class="vC-capln">' + esc(cut(f, 'path', w - 42, th, 'm')) + '</div>';
      });
    }
    if (t.likelyNext) {
      h += '<span class="pmk-blocked-say">Likely next: ' + esc(t.likelyNext) + '</span>';
    }
    h += '<span class="pmk-acts">' + K.btn('Open step logs') +
      K.btn('Compare last success') + '</span>';
    return h + '</div>';
  }

  function pGit(D, st) {
    var b = D.bucket(st.width), w = st.width, th = st.theme;
    var a = D.actions, c = a.connection, rd = a.readiness, active = ACTIVE.git;
    var g = repoGate(a);
    var gnwo = (g.repo && g.repo.nameWithOwner) || 'this repository';

    /* Gate scopes. Disconnect is the widest blast radius in the panel and the
       only one whose scope is NOT this repository: the credential is the
       account's, so removing it takes every repository in the workspace with
       it, and a confirmation that named only the open repo would understate
       what the button does. */
    SCOPE.actions_cancel_confirm = 'the selected workflow run in ' + gnwo;
    SCOPE.github_secret_delete_confirm = 'an Actions secret in ' + gnwo;
    SCOPE.github_disconnect_confirm = 'the stored credential for ' + c.account +
      ', which every repository in this workspace authenticates with';

    var lenses = [
      { id: 'branch', label: 'Branch' },
      { id: 'runs', label: 'Runs', count: String(a.runs.length) },
      { id: 'workflows', label: 'Workflows', count: String(a.workflows.length) },
      { id: 'secrets', label: 'Secrets', count: String(a.secrets.length) },
      { id: 'settings', label: 'Settings' }
    ];

    var failed = a.runs.filter(function (r) { return r.status === 'failed'; }).length;
    var blocked = a.runs.filter(function (r) { return r.status === 'blocked'; }).length;
    var missing = a.secrets.filter(function (x) { return !x.present; }).length;
    var marks = [];
    if (active !== 'runs' && failed) {
      marks.push(mark('runs', 'failed', String(failed), 'Runs — ' + failed + ' failed'));
    }
    if (active !== 'runs' && blocked) {
      marks.push(mark('runs', 'blocked', String(blocked), 'Runs — ' + blocked + ' blocked'));
    }
    if (active !== 'settings' && c.missingScopes.length) {
      marks.push(mark('settings', 'attention', String(c.missingScopes.length),
        'Settings — ' + c.blocked.code));
    }
    if (active !== 'secrets' && missing) {
      marks.push(mark('secrets', 'attention', String(missing),
        'Secrets — ' + missing + ' not present'));
    }

    var body = '', foot = null, tools = {};

    if (active === 'branch') {
      /* The repository is NAMED here because it is not the project: the
         archived repo is jared-dev/tastebook-unraid-templates and
         project.name is a different, live one. A lifecycle word with no
         subject reads as though the checkout in front of the user is
         archived. */
      var binner = pad(K.card(
        K.kv('Repository', g.repo.nameWithOwner, 'measure', b) +
        K.kv('Lifecycle', g.code, 'token', b) +
        K.kv('Branch', rd.branch, 'token', b) +
        K.kv('Checks', rd.green + ' of ' + rd.of + ' green', 'token', b) +
        K.kv('Observation', rd.snapshot, 'measure', b) +
        K.kv('Age', rd.age, 'token', b)
      ));
      var pinned = K.section('Pinned', a.pinned.length, true);
      a.pinned.forEach(function (pn) {
        pinned += row({
          b: b, w: w, th: th, status: pn.status,
          id: pn.name,
          cols: [col(pn.age, 30, 'num'), col(pn.run, 38, 'num'), col(pn.badge, 52)],
          tip: pn.name + ' ' + pn.run,
          ctxLabel: 'Pinned workflow actions',
          actions: [
            { value: 'github.actions.open_run', label: 'Open run' },
            /* Unpin is a mutation and it lives in the Branch lens only, which
               is exactly how it stayed live while Re-run three rows below was
               correctly disabled. The gate is per LENS, not per panel. */
            { value: 'github.actions.unpin', label: 'Unpin', disabled: g.pin,
              reason: g.pin ? g.code : '', sentence: g.pin ? g.say : '' }
          ]
        });
      });
      var onBranch = K.section('Runs on ' + rd.branch, '', true);
      a.runs.filter(function (r) { return r.branch === rd.branch; })
        .forEach(function (r) {
          onBranch += runRow(r, b, w, th, g);
          if (r.blocked) onBranch += blockedGated(r.blocked, g);
        });
      body = binner + list(pinned + onBranch);
      tools = {
        placeholder: 'Filter runs', label: 'Filter runs on this branch',
        controls: [K.select('all', [
          { value: 'all', label: 'All' },
          { value: 'failed', label: 'Failed' },
          { value: 'running', label: 'Running' },
          { value: 'success', label: 'Success' }
        ], { style: 'flex:0 1 108px;min-width:0' })],
        menu: [
          { value: 'github.actions.validate_dispatch_readiness', label: 'Refresh readiness' },
          { value: 'github.actions.open_current_branch', label: 'Open current branch' }
        ],
        tip: 'Branch options'
      };
      foot = {
        counts: rd.green + ' of ' + rd.of + ' green',
        refresh: rd.snapshot + ' · ' + rd.age,
        primary: K.btn('Re-run', { primary: true, disabled: g.rerun,
          tip: g.rerun ? g.code + ' — ' + g.say : 'Re-run the latest run on this branch' })
      };
    } else if (active === 'runs') {
      var rinner = thead('Workflow run', RUN_COLS, b, th);
      a.runs.forEach(function (r) {
        rinner += runRow(r, b, w, th, g);
        if (r.blocked) rinner += blockedGated(r.blocked, g);
        if (r.triage) rinner += triage(r, w, th);
      });
      body = list(rinner);
      tools = {
        placeholder: 'Filter runs', label: 'Filter runs',
        controls: [K.select('all', [
          { value: 'all', label: 'All' },
          { value: 'failed', label: 'Failed' },
          { value: 'running', label: 'Running' },
          { value: 'success', label: 'Success' }
        ], { style: 'flex:0 1 108px;min-width:0' })],
        menu: [
          { value: 'actions.rerun', label: 'Re-run selected', disabled: g.rerun,
            reason: g.rerun ? g.code : '', sentence: g.rerun ? g.say : '' },
          { value: 'actions.cancel', label: 'Cancel selected', danger: true,
            disabled: g.cancel,
            reason: g.cancel ? g.code : 'actions_cancel_confirm',
            sentence: g.cancel ? g.say
              : 'The run stops where it is and lands as cancelled. Finished jobs keep their receipts; queued jobs never start.' },
          { type: 'sep' },
          { value: 'github.actions.compare_last_success', label: 'Compare last success' },
          { value: 'actions.open_in_browser', label: 'Open in browser' }
        ],
        tip: 'Run options'
      };
      foot = {
        counts: a.runs.length + ' runs',
        refresh: rd.snapshot + ' · ' + rd.age,
        page: '1-' + a.runs.length + ' of ' + a.runs.length,
        primary: K.btn('Re-run', { primary: true, disabled: g.rerun,
          tip: g.rerun ? g.code + ' — ' + g.say : 'Re-run the selected run' })
      };
    } else if (active === 'workflows') {
      var winner = thead('Workflow', [
        { v: '', w: 74, cls: '', h: 'dispatch' },
        { v: '', w: 110, cls: 'mono', h: 'file' }
      ], b, th);
      a.workflows.forEach(function (f) {
        winner += row({
          b: b, w: w, th: th,
          status: f.dispatchable ? 'ok' : 'blocked',
          id: f.name,
          cols: [col(f.dispatchable ? 'ready' : 'blocked', 74),
                 col(f.file, 110, 'mono', 'path')],
          tip: f.file,
          ctxLabel: 'Workflow actions',
          actions: [
            /* Two independent blocks, and they are NOT the same answer.
               The account is missing the workflow scope AND the repository
               forbids mutation; reconnecting fixes the first and does
               nothing about the second, so the repository is cited first
               when it applies. */
            { value: 'github.actions.dispatch', label: 'Dispatch',
              disabled: g.dispatch || !f.dispatchable,
              reason: g.dispatch ? g.code : c.blocked.code,
              sentence: g.dispatch ? g.say : c.blocked.sentence },
            /* Pinning writes to the repository's own pin list. It sat live in
               the same menu as a correctly disabled Dispatch. */
            { value: 'github.actions.pin', label: 'Pin workflow', disabled: g.pin,
              reason: g.pin ? g.code : '', sentence: g.pin ? g.say : '' },
            { value: 'github.actions.open_in_github', label: 'Open in GitHub' }
          ]
        });
      });
      body = list(winner);
      /* The lens-level Dispatch was hard-coded disabled:true -- right answer,
         no read behind it, so an active repository with the workflow scope
         would have rendered it dead too. Both blocks are now derived. */
      var noDispatch = g.dispatch || !!(c.blocked && c.blocked.code);
      tools = {
        placeholder: 'Filter workflows', label: 'Filter workflows',
        controls: [K.btn('Dispatch', {
          disabled: noDispatch,
          tip: (g.dispatch ? g.code + ' — ' + g.say
                           : c.blocked.code + ' — ' + c.blocked.sentence)
        })],
        menu: [
          { value: 'github.actions.dispatch', label: 'Dispatch', disabled: noDispatch,
            reason: g.dispatch ? g.code : c.blocked.code,
            sentence: g.dispatch ? g.say : c.blocked.sentence },
          { value: 'github.actions.pin', label: 'Pin workflow', disabled: g.pin,
            reason: g.pin ? g.code : '', sentence: g.pin ? g.say : '' },
          { value: 'github.connect', label: 'Reconnect account' }
        ],
        tip: 'Workflow options'
      };
      /* The primary was Reconnect, and at bucket 0 the toolbar drops its
         controls -- so the ONE width where the panel is tightest was also the
         one where Workflows showed no gated control at all, while Branch, Runs
         and Secrets all kept theirs. Worse, Reconnect is the recovery for the
         missing scope and there is no recovery for the archived repository, so
         the prominent slot was offering the wrong cure. Reconnect is still one
         click away in this lens's own menu, in the panel menu, and as the
         connection banner's own action in every lens. */
      foot = {
        counts: a.workflows.length + ' workflows',
        refresh: rd.age,
        primary: K.btn('Dispatch', { primary: true, disabled: noDispatch,
          tip: (g.dispatch ? g.code + ' — ' + g.say
                           : c.blocked.code + ' — ' + c.blocked.sentence) })
      };
    } else if (active === 'secrets') {
      var sinner = thead('Secret', [
        { v: '', w: 62, cls: '', h: 'state' },
        { v: '', w: 48, cls: '', h: 'scope' }
      ], b, th);
      a.secrets.forEach(function (x) {
        sinner += row({
          b: b, w: w, th: th,
          status: x.present ? 'ok' : 'attention',
          id: x.name,
          cols: [col(x.present ? 'present' : 'missing', 62), col(x.scope, 48)],
          tip: x.name + ' · ' + x.scope,
          scope: 'the ' + x.scope + '-scope secret ' + x.name + ' in ' + gnwo,
          ctxLabel: 'Secret actions',
          /* The three secret WRITES are named separately rather than hidden
             behind one 'Manage in GitHub', because manage_secrets:false is a
             statement about add, edit and delete and a menu that offers only
             the hosted-settings link cannot show that. Copy name is a read and
             stays live -- the gate is on mutation, not on the panel. */
          actions: [
            { value: 'github.actions.secret.edit', label: 'Edit value',
              disabled: g.secrets, reason: g.secrets ? g.code : '',
              sentence: g.secrets ? g.say : '' },
            { value: 'github.actions.secret.delete', label: 'Delete secret', danger: true,
              disabled: g.secrets,
              reason: g.secrets ? g.code : 'github_secret_delete_confirm',
              sentence: g.secrets ? g.say
                : 'The value is removed from the repository. Every workflow that reads this name starts failing on its next run.' },
            { type: 'sep' },
            { value: 'github.actions.settings.open', label: 'Manage in GitHub',
              disabled: g.secrets, reason: g.secrets ? g.code : '',
              sentence: g.secrets ? g.say : '' },
            { value: 'copy', label: 'Copy name' }
          ]
        });
      });
      body = list(sinner);
      tools = {
        placeholder: 'Filter secrets', label: 'Filter secrets',
        controls: [K.select('repo', [
          { value: 'repo', label: 'Repository' },
          { value: 'env', label: 'Environment' },
          { value: 'org', label: 'Organization' }
        ], { style: 'flex:0 1 118px;min-width:0' })],
        menu: [
          { value: 'github.actions.secret.add', label: 'Add secret',
            disabled: g.secrets, reason: g.secrets ? g.code : '',
            sentence: g.secrets ? g.say : '' },
          { value: 'github.actions.settings.open', label: 'Open hosted settings',
            disabled: g.secrets, reason: g.secrets ? g.code : '',
            sentence: g.secrets ? g.say : '' }
        ],
        tip: 'Secret options'
      };
      /* The primary slot carries the lens's own mutation, so Secrets states
         its limit the same way Branch and Runs do -- with a visible disabled
         control in the footer rather than only inside a menu nobody opened.
         The hosted-settings link it replaces is still in both menus above. */
      foot = {
        counts: a.secrets.length + ' names · ' + missing + ' missing',
        primary: K.btn('Add secret', { primary: true, disabled: g.secrets,
          tip: g.secrets ? g.code + ' — ' + g.say : 'Add a repository secret' })
      };
    } else {
      var ginner = pad(
        K.card(
          K.kv('Account', c.account, 'token', b) +
          K.kv('Requested', c.requested, 'token', b) +
          K.kv('Effective', c.effective, 'token', b) +
          K.kv('State', c.state, 'token', b)
        ) +
        /* Key-value rows are banned for scopes: the value alone runs past its
           label at every width. Scopes are wrapping chips. */
        K.card('<span class="pmk-note">Scopes</span><span class="vC-chips">' +
          c.scopes.map(function (x) { return K.chip(x, 'ok', true); }).join('') +
          c.missingScopes.map(function (x) { return K.chip(x, 'warn', true); }).join('') +
          '</span>') +
        /* The account block above answers "who am I to GitHub". This one
           answers "what may I do to THIS repository", and they are different
           questions with different recoveries -- reconnecting fixes a missing
           scope and does nothing about an archived repository. Settings is the
           lens that states capability rather than exercising it, so the
           lifecycle and the capability sentence are stated here as PROSE, in
           the same words the fixture uses, beside the effective mutation
           state. Mutations reads from the derived gate, not from the flag, so
           it stays right if only the named capabilities change. */
        K.card(
          K.kv('Repository', g.repo.nameWithOwner, 'measure', b) +
          K.kv('Lifecycle', g.code, 'token', b) +
          K.kv('Mutations', g.mut ? 'disabled' : 'enabled', 'token', b) +
          '<span class="pmk-note">' + esc(g.prose) + '</span>'
        )
      );
      body = ginner;
      tools = {
        placeholder: 'Filter settings', label: 'Filter hosted settings',
        controls: [K.btn('Reconnect', { tip: 'Re-authorize with the workflow scope' })],
        menu: [
          { value: 'github.connect', label: 'Reconnect' },
          { value: 'github.disconnect', label: 'Disconnect', danger: true,
            reason: 'github_disconnect_confirm',
            sentence: 'The stored credential is deleted. Every hosted surface in this workspace falls back to unauthenticated until an account is reconnected.' }
        ],
        tip: 'Account options'
      };
      foot = {
        counts: c.scopes.length + ' scopes · ' + c.missingScopes.length + ' missing',
        refresh: rd.age,
        primary: K.btn('Reconnect', { primary: true })
      };
    }

    /* BOTH BANNERS ARE PANEL SCOPE. The GI-017 connection banner used to be
       built inside the Workflows and Settings bodies only, so Branch, Runs and
       Secrets rendered a panel whose dispatch route was dead with nothing
       saying why -- research/actions.md:160 works the arithmetic and concludes
       the banner can consume a third of the panel AND that it is never
       suppressed for space, which is a rule about what is legal to hide, not a
       budget to spend. In a lens deck the only way to honour it is to hoist it
       out of the lens.

       The repository banner is the GI-021 half and it renders the capability
       sentence AS PROSE, above the controls it explains, rather than leaving
       the user to infer the limit from which buttons are grey. Two distinct
       codes, two blocks: reconnecting the account fixes one of them and has no
       effect whatever on the other, so merging them into one banner would
       promise a recovery that does not exist. */
    var banners = (g.limited
      ? K.blocked({ code: g.code, sentence: g.prose,
          actions: [{ label: 'Open in GitHub' }] })
      : '') + K.blocked(c.blocked);
    body = banners + body;

    return frame({
      bucket: b, width: w, theme: th, title: 'GitHub Actions', count: rd.green + '/' + rd.of,
      menu: [
        { value: 'github.actions.open_in_github', label: 'Open in GitHub' },
        { value: 'github.actions.validate_dispatch_readiness', label: 'Refresh readiness' },
        { type: 'sep' },
        { value: 'github.connect', label: 'Reconnect' },
        /* the same three fields as the Settings lens copy: a panel menu that
           offered an ungated Disconnect beside a gated one would have been the
           gate with a hole in it */
        { value: 'github.disconnect', label: 'Disconnect', danger: true,
          reason: 'github_disconnect_confirm',
          sentence: 'The stored credential is deleted. Every hosted surface in this workspace falls back to unauthenticated until an account is reconnected.' }
      ],
      menuTip: 'GitHub Actions options',
      ctxIcon: 'branch',
      ctx: [c.effective, c.state, rd.branch, rd.snapshot + ' ' + rd.age],
      ctxTip: c.effective + ' · ' + c.state + ' · ' + rd.branch,
      marks: marks,
      lenses: lenses, active: active,
      toolbar: tools,
      region: active,
      body: body, footer: foot
    });
  }

  /* =================================================================== 4/7
     DOCKER MANAGER — the CRAU-007 subview list, straight from the fixture
     ------------------------------------------------------------------- */
  /* BROKE-4. The two axes CRAU-021 (:L218, :L2097-L2157) requires every host
     row to answer, kept SEPARATE because they are not the same question:
     local vs remote is not writable vs read-only, and neither answers whether
     a terminal resolves. Download / Save Local Copy stays available whenever
     source access is READABLE even when writes are blocked, so readable and
     writable are two booleans and not one flag. */
  function accessOf(h) {
    return h.writable === true ? 'read+write'
         : h.readable === true ? 'read-only' : 'no access';
  }
  function termOf(h) { return h.terminalCapable === true ? 'terminal' : 'no terminal'; }

  /* Most-durable-first, same contract as every other table in this file.
     Access is the most durable because it is the only column that changes
     which of the row's actions are legal; age is the least, because a host
     that cannot be reached has no age to report ('--' in three of five). */
  var HOST_COLS = [
    { v: '', w: 76, cls: '', h: 'access' },
    { v: '', w: 74, cls: '', h: 'terminal' },
    /* 'kind' is the fixture's own field name and it is four characters, which
       is what the 48px cell can render whole; the identity header is already
       'Host', so labelling this one 'Host' too (or 'Location', which elides to
       'Loca...') would put two different questions under one word. */
    { v: '', w: 48, cls: '', h: 'kind' },
    { v: '', w: 30, cls: 'num', h: 'age' }
  ];

  /* The eleven cmd.docker.host.* commands have no published precondition
     token (research/docker.md section 9.1), so a disabled row cites the
     HOST'S OWN CRAU:L449 reason and sentence verbatim. offline_cached,
     network_blocked_by_policy, host_unreachable and host_untrusted are not
     interchangeable and the recovery differs for each, so nothing here
     collapses them into one "unavailable". Refresh stays live on every row:
     it is the recovery path for the three unreachable states, and disabling
     it on exactly the rows that need it would be the gate eating its own
     purpose. */
  function hostActions(h) {
    var code = h.reason || '', say = h.sentence || '';
    /* `gate` marks a command as strong. When the host BLOCKS it, reason and
       sentence carry the host's own CRAU:L449 refusal, as before. When the
       host permits it, they carry the confirmation gate's code and its
       consequence -- the two never coexist on one rendered item, because a
       disabled item never opens a gate. */
    function cmd(value, label, on, gate) {
      var o = { value: value, label: label };
      if (gate) {
        o.danger = true;
        if (on) { o.reason = gate.code; o.sentence = gate.say; }
      }
      if (!on) { o.disabled = true; o.reason = code; o.sentence = say; }
      return o;
    }
    return [
      cmd('host.refresh', 'Refresh host', true),
      cmd('host.preflight', 'Run preflight', true),
      cmd('container.view_logs', 'View logs', h.readable === true),
      cmd('host.session.launch', 'Open in Terminal', h.terminalCapable === true),
      { type: 'sep' },
      cmd('context.select', 'Switch to this context', h.readable === true),
      cmd('host.instance.restart', 'Restart instance', h.writable === true),
      cmd('host.instance.stop', 'Stop instance', h.writable === true, {
        code: 'docker_stop_confirm',
        say: 'Every container on this host stops. Anything depending on them from another host fails until the instance is started again.'
      })
    ];
  }

  /* ---------------------------------------------- BLIND SPOT 3, carried over
     CRAU:L927's Requested-vs-Effective identity block. The audit's wording is
     exact and worth repeating: THIS FILE ALREADY BUILDS THIS BLOCK, for the
     GitHub account, in the Actions Settings lens. It was simply never carried
     across -- so the Registries lens listed four hosts and said nothing about
     WHO the daemon is to them, while the fixture shipped the six labels, a
     degraded state, credential_expired, and a closed capability enum in which
     images:push is absent.

     THE PATTERN IS CARRIED, NOT RE-INVENTED. Same two cards, same kv-then-
     chips split, and the same reason for the split: a capability id like
     repositories:read_private runs past its own label at every width, so the
     enum is wrapping chips and never key-value rows -- exactly the judgement
     the Actions scopes card already made.

     THE LABELS ARE THE FIXTURE'S, all six read from auth.labels rather than
     spelled here. They are CRAU:L927's own words and this panel does not get
     to paraphrase them; hard-coding 'Requested' would have been the same
     defect wearing a fix.

     THE CLOSED ENUM IS RENDERED CLOSED. Five capabilities, five chips, the
     two absent ones present-and-marked rather than omitted -- an absent
     capability that renders as nothing is indistinguishable from one nobody
     asked about, and images:push being absent is the entire reason Push is
     dead two lines below.

     THE GATED CONTROLS ARE THE POINT. auth.gated names each control, the
     capability it needs and the sentence for it. They stay VISIBLE and
     disabled with the sentence beside them, which is the rule GI-021 already
     gave the Actions panel: a capability limit is not a reason to remove a
     control. allowedActionIds supplies the two recoveries and they become
     buttons here -- BLIND SPOT 1, in the one panel that can close it from
     data it already has. */
  function authBlock(A, b) {
    if (!A) return '';
    var L = A.labels || {};
    var gated = A.gated || [];
    var recover = K.blockedActions({ allowedActionIds: A.allowedActionIds });
    return K.card(
      K.kv(L.requested || 'Requested', A.requested, 'measure', b) +
      K.kv(L.effective || 'Effective', A.effective, 'measure', b) +
      K.kv('State', A.state, 'token', b) +
      (A.degradedReason ? K.kv('Degraded', A.degradedReason, 'token', b) : '') +
      K.kv(L.reason || 'Reason', A.reason, 'measure', b) +
      K.kv(L.inheritedFrom || 'Inherited from', A.inheritedFrom, 'measure', b) +
      K.kv(L.overriddenBy || 'Overridden by', A.overriddenBy, 'measure', b) +
      K.kv(L.support || 'Support', A.support, 'measure', b)
    ) +
    /* The enum is rendered CLOSED: five capabilities, five lines, the two
       absent ones present-and-marked rather than omitted. A capability that
       renders as nothing is indistinguishable from one nobody asked about,
       and images:push being absent is the whole reason Push is dead below. */
    K.card('<span class="pmk-note">Capabilities</span>' +
      (A.capabilities || []).map(function (x) {
        return '<div class="vC-cap2"><span class="vC-cap2m vC-tn-' +
          (x.present ? 'ok' : 'warn') + '" role="img" aria-label="' +
          (x.present ? 'present' : 'absent') + '">' +
          K.icon(x.present ? 'check' : 'x', 12) + '</span>' +
          '<span class="vC-cap2i">' + esc(x.id) + '</span></div>';
      }).join('')) +
    (gated.length
      ? K.card('<span class="pmk-note">Blocked by this identity</span>' +
          gated.map(function (x) {
            return '<span class="pmk-acts">' + K.btn(x.control, { disabled: true }) + '</span>' +
              '<span class="pmk-blocked-say">' + esc(x.sentence) + '</span>';
          }).join('') +
          (recover.length
            ? '<span class="pmk-acts">' +
              recover.map(function (x) { return K.btn(x.label); }).join('') + '</span>'
            : ''))
      : '');
  }

  function pDocker(D, st) {
    var b = D.bucket(st.width), w = st.width, th = st.theme;
    var d = D.docker, rt = d.runtime, active = ACTIVE.docker;
    var auth = d.auth || null;

    SCOPE.docker_prune_confirm = 'every stopped container, unused network and ' +
      'dangling image on context ' + rt.context;
    SCOPE.docker_container_delete_confirm = 'a container on context ' + rt.context;
    SCOPE.docker_image_delete_confirm = 'an image on context ' + rt.context;
    SCOPE.docker_stop_confirm = 'a Docker instance on a configured host';
    SCOPE.docker_push_egress = 'an image, pushed to ' +
      ((d.registries[0] && d.registries[0].host) || 'the default registry') +
      ' as ' + ((auth && auth.effective) || 'the effective identity');

    /* The lens items ARE d.subviews: id, label, count, available, reason and
       sentence already match PMK.lenses' contract, so an unavailable subview
       stays VISIBLE and carries its disabled reason (CRAU-009). */
    var lenses = d.subviews;
    var ok = false;
    lenses.forEach(function (l) { if (l.id === active && l.available !== false) ok = true; });
    if (!ok) { active = 'containers'; ACTIVE.docker = active; }

    var badC = d.containers.filter(function (c) { return c.status === 'failed'; }).length;
    var warnC = d.containers.filter(function (c) { return c.status === 'attention'; }).length;
    var badS = d.compose.services.filter(function (s) { return s.status === 'failed'; }).length;
    var badR = d.registries.filter(function (r) { return r.state === 'blocked'; }).length;
    var marks = [];
    if (active !== 'containers' && badC) {
      marks.push(mark('containers', 'failed', String(badC), 'Containers — ' + badC + ' failed'));
    }
    if (active !== 'containers' && warnC) {
      marks.push(mark('containers', 'attention', String(warnC),
        'Containers — ' + warnC + ' restarting'));
    }
    if (active !== 'compose' && badS) {
      marks.push(mark('compose', 'failed', String(badS), 'Compose — ' + badS + ' service down'));
    }
    if (active !== 'registries' && badR) {
      marks.push(mark('registries', 'blocked', String(badR),
        'Registries — ' + badR + ' not configured'));
    }
    /* The identity is degraded and every registry action is downstream of it,
       so it earns a cross-lens mark of its own rather than being discoverable
       only by opening the lens it lives in. */
    if (active !== 'registries' && auth && auth.state !== 'authenticated') {
      marks.push(mark('registries', 'attention', '',
        'Registries — identity ' + auth.state + ', ' + auth.degradedReason));
    }
    marks.push(mark('k8s', 'disabled', '', 'Kubernetes — k8s_kubeconfig_missing'));

    var body = '', foot = null, tools = {};
    var lens = null;
    lenses.forEach(function (l) { if (l.id === active) lens = l; });

    if (active === 'containers') {
      var cinner = thead('Container', [
        { v: '', w: 32, cls: 'num', h: 'age' },
        { v: '', w: 42, cls: 'num', h: 'port' },
        { v: '', w: 96, cls: 'mono', h: 'image' },
        { v: '', w: 74, cls: '', h: 'detail' }
      ], b, th);
      d.containers.forEach(function (c) {
        cinner += row({
          b: b, w: w, th: th, status: c.status, id: c.name, idKind: 'path',
          cols: [col(c.age, 32, 'num'), col(c.ports, 42, 'num'),
                 col(c.image, 96, 'mono', 'image'),
                 col(c.detail || '', 74)],
          tip: c.name + ' · ' + c.image,
          scope: 'container ' + c.name + ' (' + c.image + ') on context ' + rt.context,
          ctxLabel: 'Container actions',
          actions: [
            { value: 'container.view_logs', label: 'Logs' },
            { value: 'container.open', label: 'Open app', disabled: !c.url,
              reason: c.url ? '' : 'access_url_unresolved',
              sentence: c.url ? '' : 'No direct access URL detected' },
            { value: 'container.attach_shell', label: 'Shell', disabled: c.status !== 'running',
              reason: c.status !== 'running' ? 'container_unhealthy' : '',
              sentence: c.status !== 'running' ? 'The container is not running.' : '' },
            { type: 'sep' },
            { value: 'container.restart', label: 'Restart' },
            { value: 'container.stop', label: 'Stop' },
            { value: 'container.delete', label: 'Delete', danger: true,
              reason: 'docker_container_delete_confirm',
              sentence: 'The container and its writable layer are removed. Anything written inside it that is not on a volume is lost.' }
          ]
        });
      });
      body = list(cinner);
      foot = { counts: lens.count + ' running', refresh: rt.context, page: '1-5 of 5' };
    } else if (active === 'images') {
      var iinner = thead('Image', [
        { v: '', w: 32, cls: 'num', h: 'age' },
        { v: '', w: 54, cls: 'num', h: 'size' },
        { v: '', w: 84, cls: 'mono', h: 'digest' }
      ], b, th);
      d.images.forEach(function (im) {
        iinner += row({
          b: b, w: w, th: th, status: 'ok', id: im.ref, idKind: 'image',
          cols: [col(im.age, 32, 'num'), col(im.size, 54, 'num'),
                 col(im.digest, 84, 'mono')],
          tip: im.ref + ' · ' + im.digest,
          scope: 'image ' + im.ref + ' (' + im.digest + ', ' + im.size + ')',
          ctxLabel: 'Image actions',
          actions: [
            /* Push carried the words 'asks for approval' and asked for none.
               It is EGRESS, not destruction, so it keeps its ordinary colour
               and still opens the gate -- and the gate's scope names the
               effective identity, because the reason this push may fail is
               two cards away in the Registries lens. */
            { value: 'image.push', label: 'Push', reason: 'docker_push_egress',
              sentence: 'The image and its layers are uploaded to a remote registry and become visible to anyone with pull access.' },
            { value: 'image.tag', label: 'Tag' },
            { value: 'run', label: 'Run' },
            { type: 'sep' },
            { value: 'image.delete', label: 'Delete', danger: true,
              reason: 'docker_image_delete_confirm',
              sentence: 'The image is removed from this host. Containers built from it keep running; nothing new can start from it until it is pulled or rebuilt.' }
          ]
        });
      });
      body = list(iinner);
      foot = { counts: d.images.length + ' images', refresh: rt.context,
               primary: gbtn('Push', { primary: true, tip: 'Leaves the app — asks for confirmation' },
                 { code: 'docker_push_egress', value: 'image.push', egress: true,
                   say: 'The image and its layers are uploaded to a remote registry and become visible to anyone with pull access.' }) };
    } else if (active === 'compose') {
      /* ------------------------------------------- REGRESSION VS v0, closed
         CRAU:L148. The shipped app lists compose SCENARIOS with a stale badge
         and a repair CTA; nine of nine Docker redesigns dropped the list, and
         pass 2 recorded the regression as WORSE rather than fixed, because the
         fixture had since grown four scenarios, two of them stale, each with a
         drift code, a drift summary and a repair action -- and still nine of
         nine rendered none of it.

         The stale badge degrades by SHAPE, not by a column. status is 'stale'
         on one and 'attention' on the other, so PMK.statusMark draws a clock
         and a triangle on the rail at every width including 240px, where this
         row has no columns at all. The word 'stale' then arrives in the tail
         column from bucket 1 up. A badge that only exists as a 46px column
         would have vanished at exactly the width the audit measures.

         DRIFT IS NOT A FAILURE. compose_file_changed and
         compose_service_missing are warning-tier: the scenario is still there
         and still openable, it simply no longer matches the file it was saved
         from. driftSummary is the fixture's own sentence and repair is the
         fixture's own action, so both are rendered rather than described. */
      var minner = K.section('Scenarios', (d.compose.scenarios || []).length, true);
      (d.compose.scenarios || []).forEach(function (sc) {
        minner += row({
          b: b, w: w, th: th, two: b >= 1, status: sc.status,
          id: sc.name,
          sub: sc.services + ' services · ' + sc.file,
          subKind: 'path',
          cols: [col(sc.stale ? 'stale' : 'current', 46),
                 col(sc.profiles.join(', '), 56),
                 col(sc.lastRun, 30, 'num')],
          tip: sc.name + ' · ' + sc.file + ' · profiles ' + sc.profiles.join(', ') +
               ' · last run ' + sc.lastRun + (sc.stale ? ' · stale' : ''),
          say: sc.name + '. ' + (sc.stale ? 'Stale. ' : '') +
               K.statusOf(sc.status).label + '. ' + sc.services + ' services.',
          scope: 'compose scenario ' + sc.name + ' (' + sc.services + ' services, ' +
                 sc.file + ')',
          ctxLabel: 'Scenario actions',
          actions: [
            { value: 'compose.scenario.up', label: 'Up with this scenario',
              disabled: sc.valid === false,
              reason: sc.valid === false ? sc.drift : '',
              sentence: sc.valid === false ? sc.driftSummary : '' },
            { value: 'compose.scenario.open', label: 'Open ' + sc.file },
            { value: (sc.repair && sc.repair.id) || 'docker.compose.scenario.repair',
              label: (sc.repair && sc.repair.label) || 'Repair scenario',
              disabled: !sc.repair,
              reason: sc.repair ? '' : 'compose_scenario_current',
              sentence: sc.repair ? '' : 'This scenario matches its compose file.' }
          ]
        });
        if (sc.drift) {
          minner += K.blocked({
            code: sc.drift, sentence: sc.driftSummary, severity: 'warning',
            actions: sc.repair ? [sc.repair] : []
          });
        }
      });
      minner += K.section('Services', d.compose.services.length, true);
      minner += thead('Service', [{ v: '', w: 60, cls: '', h: 'state' }], b, th);
      d.compose.services.forEach(function (sv) {
        minner += row({
          b: b, w: w, th: th, status: sv.status, id: sv.name,
          cols: [col(K.statusOf(sv.status).word, 60)],
          tip: d.compose.project + ' · ' + sv.name,
          ctxLabel: 'Service actions',
          actions: [
            { value: 'compose.up_subset', label: 'Up' },
            { value: 'compose.down_subset', label: 'Down' },
            { value: 'container.view_logs', label: 'Logs' },
            { value: 'container.restart', label: 'Restart' }
          ]
        });
      });
      body = list(minner);
      var staleN = (d.compose.scenarios || []).filter(function (x) { return x.stale; }).length;
      foot = { counts: (d.compose.scenarios || []).length + ' scenarios · ' + staleN +
                 ' stale · ' + d.compose.services.length + ' services',
               refresh: d.compose.file,
               primary: K.btn('Compose up', { primary: true }) };
    } else if (active === 'registries') {
      var ginner = thead('Registry', [{ v: '', w: 78, cls: '', h: 'capability' }], b, th);
      d.registries.forEach(function (r) {
        ginner += row({
          b: b, w: w, th: th,
          /* FOUR STATES, FOUR RAILS. This read `r.state === 'ok' ? 'ok' :
             'blocked'`, which drew ghcr.io (no token at all),
             registry.gitlab.com (a working pull-only registry whose token
             expires in six days) and localhost:5000 (daemon not running) as
             one indistinguishable red. All four values the fixture uses are
             already status tokens in the shared vocabulary, so the state IS
             the rail and the collapse bought nothing. */
          status: r.state,
          id: r.host, idKind: 'path',
          cols: [col(r.capability, 78)],
          tip: r.host,
          ctxLabel: 'Registry actions',
          actions: [
            { value: 'registry.browse', label: 'Browse' },
            { value: 'registry.promote', label: 'Promote' },
            { value: 'github.connect', label: 'Reconnect' }
          ]
        });
        /* Any registry carrying a reason renders it, not only a blocked one.
           registry_token_expiring ("expires in 6 days") and
           registry_daemon_unreachable are real states with real recoveries
           and both rendered NOWHERE, because the test was on the word
           'blocked' rather than on whether the fixture supplied a reason.
           An expiring token that says nothing until it expires is the whole
           value of the warning tier, thrown away. */
        if (r.reason) {
          ginner += K.blocked({ code: r.reason, sentence: r.sentence,
            severity: r.state === 'attention' ? 'warning' : 'blocked',
            actions: [{ label: 'Open Settings' }] });
        }
      });
      /* The identity leads the lens, because every row below it is a thing
         this identity may or may not reach, and reading the four rows without
         it tells you what exists and not what you can do with it. */
      body = pad(authBlock(auth, b)) + list(ginner);
      foot = { counts: d.registries.length + ' registries' +
                 (auth ? ' · identity ' + auth.state : ''),
               primary: K.btn('Reconnect') };
    } else if (active === 'build') {
      body = pad(K.card(
        K.kv('Tag', d.build.tag, 'measure', b) +
        K.kv('Context', d.build.context, 'token', b) +
        K.kv('Dockerfile', d.build.dockerfile, 'token', b) +
        K.kv('Digest', K.elide(d.build.digest, 'digest'), 'measure', b)
      ));
      foot = { counts: d.build.dockerfile, refresh: rt.context,
               primary: K.btn('Build image', { primary: true }) };
    } else if (active === 'publish') {
      if (b === 0) {
        var cur = d.publish.stages[0];
        d.publish.stages.forEach(function (s) { if (s.status === 'running') cur = s; });
        body = list(row({
          b: b, w: w, th: th, status: cur.status, id: cur.label,
          tip: 'Stage ' + cur.n + ' of ' + d.publish.stages.length,
          ctxLabel: 'Publish actions',
          actions: [{ value: 'template.commit', label: 'Open receipt' }]
        }));
      } else {
        var pinner = thead('Stage', [{ v: '', w: 62, cls: '', h: 'state' },
                                     { v: '', w: 26, cls: 'num', h: 'n' }], b, th);
        d.publish.stages.forEach(function (s) {
          pinner += row({
            b: b, w: w, th: th, status: s.status, id: s.label,
            cols: [col(K.statusOf(s.status).word, 62), col(String(s.n), 26, 'num')],
            tip: s.id,
            ctxLabel: 'Stage actions',
            actions: [
              { value: 'receipt.open', label: 'Open receipt' },
              { value: 'resume', label: 'Resume' }
            ]
          });
        });
        body = list(pinner);
      }
      foot = { counts: d.publish.stages.length + ' stages',
               primary: gbtn('Push image',
                 { primary: true, tip: 'Leaves the app — asks for confirmation' },
                 { code: 'docker_push_egress', value: 'image.push', egress: true,
                   say: 'The image and its layers are uploaded to a remote registry and become visible to anyone with pull access.' }) };
    } else if (active === 'k8s') {
      body = K.blocked({ code: lens.reason, sentence: lens.sentence,
        actions: [{ label: 'Open Settings' }] }) +
        K.empty('unavailable', 'Kubernetes is not configured',
          'The subview stays visible with its reason rather than disappearing.');
      foot = null;
    } else if (active === 'hosts' && d.hosts && d.hosts.length) {
      /* BROKE-4. This subview ships FIVE rows and a count of 5, and the id fell
         through to the "no rows" empty written for networks / volumes /
         contexts -- which genuinely do carry a count and no rows. The result
         was a header reading 5 over a body saying the fixture had given the
         panel nothing, in the same frame, at the same instant: the panel
         asserting, in the UI, that data it was handed does not exist.

         degraded is the third state between available and unavailable, and
         the subview carries its own reason and sentence for it: four of the
         five hosts are readable-but-not-writable, unreachable or untrusted, so
         the lens is neither fine nor off. It leads the body, once, rather than
         being repeated per row -- the per-row reasons below are the four
         distinct codes, not this summary. */
      var hinner = '';
      if (lens.degraded) {
        hinner += K.blocked({ code: lens.degradedReason, sentence: lens.sentence,
          actions: [{ label: 'Run preflight' }] });
      }
      hinner += thead('Host', HOST_COLS, b, th);
      d.hosts.forEach(function (h) {
        /* An unreadable host reports no inventory, and containers:0 is the
           ABSENCE OF A READING rather than a reading of zero. Printing the 0
           would state that the host has no containers, which is a different
           claim from being unable to look. */
        var seen = h.readable === true;
        hinner += row({
          b: b, w: w, th: th, status: h.state, id: h.name,
          /* idKind is deliberately the default head-keep elision, not 'path'.
             A hostname's discriminating token is its LEADING label --
             ci-pool-3, build-01, lab-shared -- so keeping the tail would
             render three of these five as the same domain suffix. */
          cols: [col(accessOf(h), 76), col(termOf(h), 74),
                 col(h.kind, 48), col(h.age, 30, 'num')],
          tip: h.name + ' · ' + h.context + ' · ' +
               (seen ? h.containers + ' containers' : 'inventory unavailable'),
          scope: 'the Docker instance on ' + h.name + ' (' + h.kind + ', context ' +
                 h.context + ', ' +
                 (seen ? h.containers + ' containers' : 'inventory unavailable') + ')',
          ctxLabel: 'Host actions',
          actions: hostActions(h)
        });
        if (h.reason) {
          hinner += K.blocked({ code: h.reason, sentence: h.sentence,
            actions: [{ label: 'Run preflight' }, { label: 'Open Settings' }] });
        }
      });
      body = list(hinner);
      foot = { counts: d.hosts.length + ' hosts', refresh: rt.context,
               page: '1-' + d.hosts.length + ' of ' + d.hosts.length,
               primary: K.btn('Refresh hosts',
                 { tip: 'Re-read every configured Docker host' }) };
    } else {
      /* networks / volumes / contexts — the fixture carries counts but no
         rows, so this says so rather than inventing product data. Docker /
         Hosts used to land here too and it does not: it ships rows, and the
         branch above renders them. */
      body = K.empty('no-data', lens.label + ' — ' + (lens.count || '0') + ' items',
        'The shared fixture carries a count for this lens but no rows.');
      foot = { counts: (lens.count || '0') + ' items', refresh: rt.context };
    }

    tools = {
      placeholder: 'Filter ' + lens.label, label: 'Filter ' + lens.label,
      controls: [
        K.select(rt.context, [
          { value: 'default', label: 'default' },
          { value: 'desktop', label: 'desktop-linux' }
        ], { style: 'flex:0 1 118px;min-width:0' }),
        K.btn('Refresh', { tip: 'Refresh remote state' })
      ],
      menu: [
        { type: 'head', label: 'Docker Manager' },
        { value: 'cleanup.scan', label: 'Cleanup advisor' },
        { value: 'drift.compare', label: 'Compare drift' },
        { value: 'hosts.open', label: 'Docker / Hosts' },
        { type: 'sep' },
        { value: 'context.select', label: 'Switch context' }
      ],
      tip: lens.label + ' options'
    };

    return frame({
      bucket: b, width: w, theme: th, title: 'Docker Manager', count: (lens && lens.count) || '',
      menu: [
        { value: 'cleanup.scan', label: 'Cleanup advisor' },
        { value: 'cleanup.prune', label: 'Prune', danger: true,
          reason: 'docker_prune_confirm',
          sentence: 'Every stopped container, unused network and dangling image on this context is deleted. Running containers and named volumes are untouched.' },
        { type: 'sep' },
        { value: 'hosts.open', label: 'Docker / Hosts' },
        { value: 'show', label: 'Show advanced subviews' }
      ],
      menuTip: 'Docker actions',
      ctxIcon: 'square',
      /* The EFFECTIVE identity is a panel-scope fact: it is what every push,
         pull and browse in every lens actually runs as, and it was stated
         nowhere. It sits third, ahead of the detection flag, because a
         degraded identity changes what the panel can do and 'detected' does
         not. */
      ctx: [rt.engine, rt.context, auth ? auth.effective : '',
            rt.detected ? 'detected' : 'not_detected', rt.state],
      ctxTip: rt.engine + ' · ' + rt.context +
        (auth ? ' · ' + auth.labels.requested + ' ' + auth.requested + ' · ' +
                auth.labels.effective + ' ' + auth.effective + ' · ' + auth.reason : ''),
      marks: marks,
      lenses: lenses, active: active,
      toolbar: tools,
      region: active,
      body: body, footer: foot
    });
  }

  /* =================================================================== 5/7
     TESTING — Runs . Active . Failures . Artifacts . Policy
     The five lenses map 1:1 onto the five contractual spec regions. The body
     carries the spec's own region name in data-vc-region.
     ------------------------------------------------------------------- */
  var TEST_REGION = {
    runs: 'run_list', active: 'active_run_detail', failures: 'failure_list',
    artifacts: 'artifact_preview', policy: 'capability_header'
  };

  /* ------------------------------------------------------- the redaction gate
     BROKE-5. Automated_Testing_System.md:L83-L98: a redaction failure BLOCKS
     display and persistence until it is resolved or EXPLICITLY authorized. The
     gate exists FOR the failure case, and this panel hard-coded the literal
     string 'redaction_clean' over a run whose redaction failed on 2 of 6
     fields, then offered Open and Export on its artifacts. A clean assertion
     with no read behind it: the code was a constant, so no fixture state could
     ever have changed it.

     THREE STATES, NOT TWO, and they are read from T.redactionStates rather
     than branched on here. preview is 'render' | 'placeholder' | 'suppress',
     so redaction_pending holds display back too -- it is not a slower clean --
     and a fourth state added to the fixture changes this panel without
     touching this file.

     THE GATE IS ENTERED FROM THE DATA, not from a flag in this file: a run in
     the list carrying redactionState 'redaction_failed'. That is also what
     makes the notice ATTRIBUTABLE -- it names run 209 rather than the panel.

     dismissible:false is stated in the data and honoured by emitting no
     dismiss control. Every version passes non-dismissibility today by
     accident, because none of them has a close button to wrongly offer. */
  function redactionGate(t) {
    var RF = t.redactionFailed || null;
    /* Any non-clean run enters the gate, not just a failed one: pending is a
       held state in its own right and a run carrying it must not fall through
       to the clean notice. */
    var run = null;
    (t.runs || []).forEach(function (r) {
      if (r.redactionState && r.redactionState !== 'redaction_clean') run = r;
    });
    var want = run ? run.redactionState : (t.redaction && t.redaction.state);
    var RS = null;
    (t.redactionStates || []).forEach(function (s) { if (s.id === want) RS = s; });
    /* redactionFailed is the DETAIL BLOCK for exactly one state and it says so
       in its own state field. Reading its reason and its authorize route
       under redaction_pending would attach a failure's recovery to a run that
       has not failed. */
    var on = !!(RF && RF.state === want);
    /* The fixture authors exactly one action label in this file, and it is the
       authorize route; everything else derives from its command id. */
    var named = {};
    if (RF && RF.authorize) named[RF.authorize.id] = RF.authorize.label;
    var preview = RS ? RS.preview : 'render';
    return {
      id: want, on: on, rf: RF, state: RS, run: run,
      held: preview !== 'render',
      preview: preview,
      code: on ? RF.reason : want,
      say: on ? RF.sentence : (RS ? RS.line : t.redaction.note),
      detail: on ? RF.detail : '',
      count: on ? RF.failed + ' of ' + RF.attempted + ' failed'
                : t.redaction.fields + ' redacted',
      n: on ? String(RF.failed) : String(t.redaction.fields),
      acts: on ? allowedActions(RF.allowedActionIds, named)
               : [{ value: 'session.redaction.inspect', label: 'Inspect redaction' }]
    };
  }

  function pTests(D, st) {
    var b = D.bucket(st.width), w = st.width, th = st.theme;
    var t = D.tests, run = t.active, active = ACTIVE.tests;
    var rg = redactionGate(t);

    SCOPE.tests_cancel_confirm = 'the active run ' + run.name + ', ' +
      run.done + ' of ' + run.total + ' cases done after ' + run.elapsed;
    /* An EGRESS scope has to state what is leaving AND what state the
       redaction is in, because the attestation the user is being asked for is
       about exactly that. rg.count is the fixture's own count either way --
       "6 redacted" when clean, "2 of 6 failed" when not. */
    SCOPE.testing_export_egress = 'the run bundle for ' + run.name + ', ' +
      t.artifacts.length + ' artifacts, redaction ' + rg.count;

    var lenses = [
      { id: 'runs', label: 'Runs', count: String(t.runs.length) },
      { id: 'active', label: 'Active' },
      { id: 'failures', label: 'Failures', count: String(t.failures.length) },
      { id: 'artifacts', label: 'Artifacts', count: String(t.artifacts.length) },
      { id: 'policy', label: 'Policy', count: String(t.policy.capabilities.length) }
    ];

    var blockedCaps = t.policy.capabilities.filter(function (c) { return c.state === 'blocked'; });
    var prohibited = t.policy.capabilities.filter(function (c) { return c.state === 'prohibited'; });
    var marks = [];
    if (active !== 'active' && run.status === 'running') {
      marks.push(mark('active', 'running', '', 'Active — ' + run.name + ' running'));
    }
    if (active !== 'failures' && t.failures.length) {
      marks.push(mark('failures', 'failed', String(t.failures.length),
        'Failures — ' + t.failures.length + ' failing tests'));
    }
    if (active !== 'policy' && blockedCaps.length) {
      marks.push(mark('policy', 'blocked', String(blockedCaps.length),
        'Policy — ' + blockedCaps[0].reason));
    }
    if (active !== 'policy' && prohibited.length) {
      marks.push(mark('policy', 'prohibited', String(prohibited.length),
        'Policy — ' + prohibited[0].reason));
    }
    if (active !== 'artifacts') {
      marks.push(rg.held
        ? mark('artifacts', 'blocked', rg.n, 'Artifacts — ' + rg.code)
        : mark('artifacts', 'attention', rg.n, 'Artifacts — ' + rg.say));
    }

    var body = '', foot = null, tools = {};

    if (active === 'runs') {
      var rinner = thead('Test run', [
        { v: '', w: 30, cls: 'num', h: 'age' },
        { v: '', w: 34, cls: 'num', h: 'id' },
        { v: '', w: 62, cls: '', h: 'state' }
      ], b, th);
      t.runs.forEach(function (r) {
        rinner += row({
          b: b, w: w, th: th, status: r.status, id: r.name, idKind: 'path',
          cols: [col(r.when, 30, 'num'), col(r.id, 34, 'num'),
                 col(K.statusOf(r.status).word, 62)],
          /* the run whose redaction failed says so on its own row, so the
             panel-scope gate below is attributable to a run rather than to
             the panel at large */
          tip: r.name + ' · run ' + r.id + (r.redactionState ? ' · ' + r.redactionState : ''),
          scope: 'test run ' + r.id + ', ' + r.name + ' (' +
                 K.statusOf(r.status).word + ', ' + r.when + ')' +
                 (r.redactionState ? ', redaction ' + r.redactionState : ''),
          ctxLabel: 'Run actions',
          actions: [
            { value: 'watch_run', label: 'Watch', disabled: r.status !== 'running',
              reason: r.status !== 'running' ? 'run_status_terminal' : '',
              sentence: r.status !== 'running' ? 'Watch is only available while a run is live.' : '' },
            { value: 'cancel_run', label: 'Cancel', danger: true, disabled: r.status !== 'running',
              reason: r.status !== 'running' ? 'run_status_terminal' : 'tests_cancel_confirm',
              sentence: r.status !== 'running'
                ? 'Only a queued or running test run can be cancelled.'
                : 'The run lands as cancelled. Cases already executed keep their receipts; the rest never run.' },
            { type: 'sep' },
            { value: 'open_receipt', label: 'Open receipt', disabled: r.status === 'running',
              reason: r.status === 'running' ? 'run_status_not_terminal' : '',
              sentence: r.status === 'running' ? 'The receipt exists once the run reaches a terminal state.' : '' },
            /* Egress from the run list too, not only from the Artifacts lens.
               An export route that is gated in one lens and open in another is
               a gate with a second door. */
            { value: 'export_bundle', label: 'Export bundle',
              reason: 'testing_export_egress',
              sentence: 'The bundle leaves the app. Confirming attests that the redaction profile applied to every field it carries.' }
          ]
        });
      });
      body = list(rinner);
      foot = { counts: t.runs.length + ' runs', refresh: t.runtime.adapter,
               page: '1-' + t.runs.length + ' of ' + t.runs.length,
               primary: K.btn('Run', { primary: true }) };
    } else if (active === 'active') {
      var pct = Math.round(run.done / run.total * 100);
      body = pad(
        K.card(
          '<div class="pmk-row" style="min-height:24px;padding:0;cursor:default">' +
            K.statusMark(run.status) +
            '<span class="pmk-id">' + esc(cut(run.name, 'path', w - 36 - 16 - 25 - 44, th, 'r')) + '</span>' +
            '<span class="vC-col vC-col--num" style="flex:0 0 40px">' + esc(run.elapsed) + '</span>' +
          '</div>' +
          '<div class="vC-bar"><span class="vC-barfill" style="width:' + pct + '%"></span></div>' +
          K.kv('Progress', run.done + ' of ' + run.total, 'token', b) +
          K.kv('Passed', String(run.passed), 'token', b) +
          K.kv('Failed', String(run.failed), 'token', b) +
          K.kv('Skipped', String(run.skipped), 'token', b) +
          K.kv('Lane', run.lane, 'token', b) +
          K.kv('Retry', run.retry, 'token', b) +
          K.kv('Adapter', t.runtime.adapter, 'token', b)
        ) +
        '<span class="pmk-acts">' + K.btn('Watch') +
          gbtn('Cancel', { danger: true, tip: 'Lands as cancelled and deletes no receipts' },
            { code: 'tests_cancel_confirm', value: 'cancel_run',
              say: 'The run lands as cancelled. Cases already executed keep their receipts; the rest never run.' }) +
        '</span>'
      );
      foot = { counts: run.passed + ' passed · ' + run.failed + ' failed',
               refresh: run.elapsed,
               primary: gbtn('Cancel', { danger: true },
                 { code: 'tests_cancel_confirm', value: 'cancel_run',
                   say: 'The run lands as cancelled. Cases already executed keep their receipts; the rest never run.' }) };
    } else if (active === 'failures') {
      var finner = '';
      t.failures.forEach(function (f) {
        finner += row({
          b: b, w: w, th: th, two: true, status: 'failed',
          id: f.test, idKind: 'path',
          sub: f.message,
          cols: [col('failed', 56)],
          tip: f.test + ' — ' + f.message,
          ctxLabel: 'Failure actions',
          actions: [
            { value: 'open_failure', label: 'Open failure' },
            { value: 'open_receipt', label: 'Open receipt' }
          ]
        });
      });
      body = list(finner);
      foot = { counts: t.failures.length + ' failures', refresh: run.retry,
               primary: K.btn('Open failure') };
    } else if (active === 'artifacts') {
      var ainner = thead('Artifact', [
        { v: '', w: 54, cls: 'num', h: 'size' },
        { v: '', w: 78, cls: '', h: 'kind' }
      ], b, th);
      /* The gate blocks DISPLAY AND PERSISTENCE, so both routes off this row
         are disabled while it is up, each citing the profile that failed
         rather than the export's own egress rule. Export already had a reason;
         a run whose secrets were never masked is a different and stronger one,
         and it outranks. */
      var held = rg.held;
      t.artifacts.forEach(function (ar) {
        ainner += row({
          b: b, w: w, th: th, status: 'ok', id: ar.name, idKind: 'path',
          cols: [col(ar.size, 54, 'num'), col(ar.kind, 78)],
          tip: ar.name + ' · ' + ar.kind,
          scope: 'artifact ' + ar.name + ' (' + ar.kind + ', ' + ar.size +
                 ') from ' + run.name + ', redaction ' + rg.count,
          ctxLabel: 'Artifact actions',
          actions: [
            { value: 'open_receipt', label: 'Open', disabled: held,
              reason: held ? rg.code : '', sentence: held ? rg.say : '' },
            { value: 'export_bundle', label: 'Export bundle', disabled: held,
              reason: held ? rg.code : 'testing_export_egress',
              sentence: held ? rg.say
                : 'The bundle leaves the app. Confirming attests that the redaction profile applied to every field it carries.' }
          ]
        });
      });
      body = list(ainner);
      foot = { counts: t.artifacts.length + ' artifacts',
               refresh: rg.count,
               /* Still disabled under the redaction hold -- the gate does not
                  replace the block, it stands behind it. When the hold lifts,
                  the button asks before it exports rather than after. */
               primary: gbtn('Export bundle', { primary: !held, disabled: held,
                 tip: held ? rg.code + ' — ' + rg.say
                           : 'Leaves the app — asks for confirmation' },
                 { code: 'testing_export_egress', value: 'export_bundle', egress: true,
                   say: 'The bundle leaves the app. Confirming attests that the redaction profile applied to every field it carries.' }) };
    } else {
      var cinner = '';
      t.policy.capabilities.forEach(function (c) {
        cinner += row({
          b: b, w: w, th: th, status: c.state, id: c.label,
          cols: [col(c.mode, 42), col(c.state, 66)],
          tip: c.reason ? c.reason + ' — ' + c.sentence : c.label + ' · ' + c.mode,
          ctxLabel: 'Capability actions',
          actions: [
            { value: 'capability_policy.set', label: 'Auto' },
            { value: 'capability_policy.set', label: 'On' },
            { value: 'capability_policy.set', label: 'Off' },
            { type: 'sep' },
            { value: 'open_settings', label: 'Open Settings' }
          ]
        });
        if (c.reason) {
          cinner += K.blocked({ code: c.reason, sentence: c.sentence,
            actions: [{ label: 'Open Settings' }] },
            c.state === 'prohibited' ? 'err' : '');
        }
      });
      body = list(cinner);
      foot = { counts: t.policy.visibility, refresh: t.runtime.probe,
               primary: K.btn('Open Settings') };
    }

    /* PANEL SCOPE, not lens scope. A display gate that is only visible from
       the lens whose display it gates is not a gate: in a lens deck the user
       reaches the Runs list, the Failures list and the Policy list without
       ever passing through Artifacts, and under redaction_failed every one of
       those is a route to a run whose secrets were never masked. It renders
       once, above whichever lens is mounted, and there is no dismiss control
       because redactionStates says dismissible:false -- dismissal implies the
       user saw the artifact, which is what the gate is preventing.

       The detail sentence names the profile that failed to load and the run
       it left unmasked. At bucket 0 the two sentences together are most of a
       224px band, so the detail joins from bucket 2 -- the same ladder every
       other secondary fact in this file follows. The BLOCKING sentence is
       never width-gated. */
    var gate = '<div class="vC-gate' + (rg.on ? ' vC-gate--err' : '') +
      '" data-vc-region="redaction_notice">' +
      '<span class="pmk-blocked-code">' + esc(rg.code) + '</span>' +
      '<span class="pmk-blocked-say">' + esc(rg.say) + '</span>' +
      (rg.detail && b >= 2
        ? '<span class="pmk-note">' + esc(rg.detail) + '</span>' : '') +
      '<span class="pmk-acts">' +
      rg.acts.map(function (a) { return K.btn(a.label); }).join('') +
      '</span></div>';
    body = gate + body;

    tools = {
      placeholder: 'Filter ' + (active === 'policy' ? 'families' : 'runs'),
      label: 'Filter test list',
      controls: [
        K.select('all', [
          { value: 'all', label: 'All' },
          { value: 'failed', label: 'Failed' },
          { value: 'running', label: 'Running' },
          { value: 'passed', label: 'Passed' }
        ], { style: 'flex:0 1 106px;min-width:0' }),
        K.btn('Run', { primary: true, tip: 'Run with ' + t.runtime.adapter })
      ],
      menu: [
        { value: 'run', label: 'Run tests' },
        { value: 'watch_run', label: 'Watch active run' },
        { value: 'cancel_run', label: 'Cancel active run', danger: true,
          reason: 'tests_cancel_confirm',
          sentence: 'The run lands as cancelled. Cases already executed keep their receipts; the rest never run.' },
        { type: 'sep' },
        { value: 'export_bundle', label: 'Export bundle',
          /* the redaction hold reaches the lens menu too: a route that is dead
             on the row and live in the toolbar is not a hold */
          disabled: rg.held,
          reason: rg.held ? rg.code : 'testing_export_egress',
          sentence: rg.held ? rg.say
            : 'The bundle leaves the app. Confirming attests that the redaction profile applied to every field it carries.' },
        { value: 'session.redaction.inspect', label: 'Inspect redaction profile' }
      ],
      tip: 'Testing options'
    };

    return frame({
      bucket: b, width: w, theme: th, title: 'Testing', count: run.done + '/' + run.total,
      menu: [
        { value: 'run', label: 'Run tests' },
        { value: 'open_receipt', label: 'Open receipt' },
        { type: 'sep' },
        { value: 'capability_policy.set', label: 'Open capability policy' },
        { value: 'session.redaction.inspect', label: 'Inspect redaction profile' }
      ],
      menuTip: 'Testing actions',
      ctxIcon: 'check',
      ctx: [t.runtime.adapter, t.runtime.probe, t.policy.visibility,
            rg.held ? rg.id : rg.count],
      ctxTip: t.runtime.adapter + ' · ' + t.runtime.probe,
      marks: marks,
      lenses: lenses, active: active,
      toolbar: tools,
      region: TEST_REGION[active],
      body: body, footer: foot
    });
  }

  /* =================================================================== 6/7
     AGENTS — Active . Available . Lineage . History      (PROPOSED)
     Plans carries zero cmd.agents.* commands and zero "Side panels > Agents"
     wiring rows. Everything below is this design's proposal, and the lens
     strip is tagged data-vc-proposed so a reviewer sees that.
     ------------------------------------------------------------------- */
  function pAgents(D, st) {
    var b = D.bucket(st.width), w = st.width, th = st.theme;
    var g = D.agents, active = ACTIVE.agents;

    var lenses = [
      { id: 'active', label: 'Active', count: String(g.active.length) },
      { id: 'available', label: 'Available', count: String(g.available.length) },
      { id: 'lineage', label: 'Lineage' },
      { id: 'history', label: 'History', count: String(g.completed.length) }
    ];

    var blocked = g.active.filter(function (a) { return a.status === 'blocked'; });
    var queued = g.active.filter(function (a) { return a.status === 'queued'; }).length;
    var attn = g.completed.filter(function (a) { return a.status === 'attention'; }).length;
    var marks = [];
    if (active !== 'active' && blocked.length) {
      marks.push(mark('active', 'blocked', String(blocked.length),
        'Active — ' + blocked[0].reason));
    }
    if (active !== 'active' && queued) {
      marks.push(mark('active', 'queued', String(queued), 'Active — ' + queued + ' queued'));
    }
    if (active !== 'history' && attn) {
      marks.push(mark('history', 'attention', String(attn),
        'History — ' + attn + ' needs remediation'));
    }

    var body = '', foot = null;
    var run = g.active[0].run;

    SCOPE.agents_cancel_confirm = 'a subagent child run under ' +
      g.active[0].thread;

    if (active === 'active') {
      var ainner = thead('Subagent', [
        { v: '', w: 44, cls: 'num', h: 'time' },
        { v: '', w: 74, cls: '', h: 'persona' },
        { v: '', w: 34, cls: 'num', h: 'run' }
      ], b, th);
      g.active.forEach(function (a) {
        ainner += row({
          b: b, w: w, th: th, two: b >= 1, status: a.status,
          id: a.name, idKind: 'path',
          sub: a.note || a.sentence || a.target,
          cols: [col(a.elapsed, 44, 'num'), col(a.persona, 74), col(a.run || '', 34, 'num')],
          tip: a.name + ' · ' + a.thread,
          scope: 'subagent ' + a.name + ' on thread ' + a.thread +
                 (a.run ? ', child run ' + a.run : '') +
                 ' (' + K.statusOf(a.status).word + ', ' + a.elapsed + ')',
          ctxLabel: 'Subagent actions',
          actions: [
            { value: 'open_lineage', label: 'Open lineage' },
            { value: 'open_thread', label: 'Open owning thread' },
            { value: 'watch_run', label: 'Watch', disabled: a.status !== 'running',
              reason: a.status !== 'running' ? 'run_status_not_live' : '',
              sentence: a.status !== 'running' ? 'Watch needs a queued or running child run.' : '' },
            { type: 'sep' },
            { value: 'cancel_run', label: 'Cancel', danger: true, disabled: !a.run,
              reason: a.run ? 'agents_cancel_confirm' : 'no_child_run',
              sentence: a.run
                ? 'The child run stops and the subagent is released. Work already recorded keeps its lineage; anything in flight is lost.'
                : 'This entry has no child run to cancel.' }
          ]
        });
        if (a.reason) {
          /* BROKE-9. This emitted the same fixed triple -- Open lineage /
             Replan node / Abort node -- under all six blocked rows, and was
             right about one of them. allowedActionIds[] is supplied PER ROW
             and it differs per row, because the legal recovery differs: a
             session that is restoring from a checkpoint allows only Open for
             edit and needs nothing else, a disconnected one allows Reconnect
             session, and a node that has hit its remediation ceiling allows
             Replan. Offering Replan on a session that is already restoring
             invites the user to redo work that is recovering by itself;
             offering Abort on a row that does not permit it is worse.

             FinalGUISpec.md:L3749-L3760 also forbids an automatic-retry
             affordance on a remediation ceiling. Nothing is added here that
             the row does not list, so that constraint is satisfied by
             construction rather than by remembering it.

             agent_prohibited_by_policy lists no allowed actions at all and
             therefore renders NO buttons. An empty list is a statement -- this
             row permits nothing -- not a gap to be filled with a default. */
          /* BLIND SPOT 1, and the kit now owns the whole of it: PMK.blocked
             reads allowedActionIds directly, derives labels with the same
             rule this file used to apply locally, marks the derived ones
             data-pm-derived, and draws the severity tier. Handing it the raw
             payload is strictly more than allowedActions() could produce, and
             it keeps one derivation instead of two that can diverge. */
          ainner += K.blocked({ code: a.reason, sentence: a.sentence,
            severity: a.severity, allowedActionIds: a.allowedActionIds },
            a.status === 'prohibited' ? 'err' : '');
        }
      });
      body = list(ainner);
      foot = { counts: g.active.length + ' active · ' + blocked.length + ' blocked',
               refresh: run, primary: K.btn('Open lineage') };
    } else if (active === 'available') {
      var vinner = thead('Registry entry', [{ v: '', w: 92, cls: '', h: 'persona' }], b, th);
      g.available.forEach(function (a) {
        vinner += row({
          b: b, w: w, th: th, status: 'queued', id: a.name,
          cols: [col(a.persona, 92)],
          tip: a.name + ' resolves to persona ' + a.persona,
          ctxLabel: 'Registry actions',
          actions: [
            { value: 'open_config', label: 'Open in Agent Config' },
            { value: 'open_lineage', label: 'Open lineage' }
          ]
        });
      });
      body = list(vinner);
      foot = { counts: g.available.length + ' available', primary: K.btn('Open Agent Config') };
    } else if (active === 'lineage') {
      var linner = '';
      g.lineageTargets.forEach(function (target) {
        linner += row({
          b: b, w: w, th: th,
          leadW: 14,
          lead: '<span class="vC-letter">' + K.icon('ext', 12) + '</span>',
          id: target,
          cols: [col(run, 34, 'num')],
          tip: target,
          ctxLabel: 'Lineage actions',
          actions: [{ value: 'open_lineage', label: 'Open' }]
        });
      });
      body = list(linner) +
        '<div class="vC-note">' + K.empty('no-data', 'Lineage payload is unspecified',
          'runtime_artifact_subagent_lineage declares no minimum payload semantics, ' +
          'so the panel can route to a lineage record but cannot summarise one.') + '</div>';
      foot = { counts: g.lineageTargets.length + ' entrypoints', primary: K.btn('Open lineage') };
    } else {
      var hinner = thead('Subagent', [
        { v: '', w: 30, cls: 'num', h: 'age' },
        { v: '', w: 88, cls: '', h: 'outcome' },
        { v: '', w: 74, cls: '', h: 'persona' }
      ], b, th);
      g.completed.forEach(function (a) {
        hinner += row({
          b: b, w: w, th: th, status: a.status, id: a.name,
          cols: [col(a.when, 30, 'num'), col(a.outcome, 88), col(a.persona, 74)],
          tip: a.name + ' · ' + a.outcome,
          ctxLabel: 'History actions',
          actions: [
            { value: 'open_lineage', label: 'Open lineage' },
            { value: 'open_activity', label: 'Open activity' }
          ]
        });
      });
      body = list(hinner);
      foot = { counts: g.completed.length + ' completed',
               page: '1-' + g.completed.length + ' of ' + g.completed.length,
               primary: K.btn('Open lineage') };
    }

    return frame({
      bucket: b, width: w, theme: th, title: 'Agents', count: g.active.length + '/' + g.available.length,
      menu: [
        { value: 'open_lineage', label: 'Open lineage' },
        { value: 'open_activity', label: 'Open Agent Activity' },
        { type: 'sep' },
        { value: 'open_config', label: 'Open Agent Config' }
      ],
      menuTip: 'Agents actions',
      ctxIcon: 'branch',
      ctx: [run, g.active[0].thread, g.active.length + ' active', blocked.length + ' blocked'],
      ctxTip: g.active[0].thread + ' · ' + run,
      marks: marks,
      lenses: lenses, active: active, proposed: true,
      toolbar: {
        placeholder: 'Filter subagents', label: 'Filter subagents',
        controls: [
          K.select('all', [
            { value: 'all', label: 'All' },
            { value: 'running', label: 'Running' },
            { value: 'queued', label: 'Queued' },
            { value: 'blocked', label: 'Blocked' },
            { value: 'remediation', label: 'Remediation' },
            { value: 'completed', label: 'Completed' }
          ], { style: 'flex:0 1 118px;min-width:0' }),
          K.btn('Lineage', { tip: 'Open the lineage entrypoint for the selection' })
        ],
        menu: [
          { value: 'filter_state', label: 'Filter by lifecycle state' },
          { value: 'open_activity', label: 'Open Agent Activity' },
          { type: 'sep' },
          { value: 'open_config', label: 'Open Agent Config' }
        ],
        tip: 'Agents options'
      },
      region: active,
      body: body, footer: foot
    });
  }

  /* =================================================================== 7/7
     ARTIFACTS — All . Evidence . Web . Browser . Bundles . Receipts
     ------------------------------------------------------------------- */

  /** Mechanical, memorable, portable: initials of the underscore segments,
      capped at 3. code_diff -> CD, api_web_call -> AWC, screenshot -> SCR.
      Single-segment types take their first three letters. */
  function kindCode(kind) {
    var parts = String(kind).split('_');
    if (parts.length === 1) return parts[0].slice(0, 3).toUpperCase();
    return parts.map(function (p) { return p.charAt(0); }).join('').slice(0, 3).toUpperCase();
  }

  function kindGlyph(kind) {
    return '<span class="vC-code2" data-pm-tip="' + esc(kind) + '" aria-label="' + esc(kind) + '">' +
      esc(kindCode(kind)) + '</span>';
  }

  function pArtifacts(D, st) {
    var b = D.bucket(st.width), w = st.width, th = st.theme;
    var A = D.artifacts, p = D.project, active = ACTIVE.artifacts;

    SCOPE.artifacts_export_egress = 'an artifact record from ' + p.name +
      ', with its provenance and redaction envelope';

    var lenses = A.families.map(function (f) {
      return { id: f.id, label: f.label, count: String(f.count) };
    });

    var attn = A.rows.filter(function (r) { return r.status === 'attention'; }).length;
    var stale = A.rows.filter(function (r) { return r.status === 'stale'; }).length;
    var redacted = A.rows.filter(function (r) {
      return r.meta.join(' ').indexOf('redacted') >= 0;
    }).length;
    var marks = [];
    if (active !== 'evidence' && attn) {
      marks.push(mark('evidence', 'attention', String(attn),
        'Evidence — ' + attn + ' needs attention'));
    }
    if (active !== 'evidence' && stale) {
      marks.push(mark('evidence', 'stale', String(stale), 'Evidence — ' + stale + ' stale'));
    }
    if (active !== 'browser' && redacted) {
      marks.push(mark('browser', 'attention', String(redacted),
        'Browser — ' + redacted + ' redacted recording'));
    }

    var body = '', foot = null;

    if (active === 'bundle') {
      var bu = A.bundle;
      var binner = K.section(cutU(bu.id + ' · ' + bu.title, w - 42, th),
        bu.members.length, true);
      bu.members.forEach(function (m) {
        binner += row({
          b: b, w: w, th: th,
          leadW: 26,
          lead: kindGlyph(m.kind),
          id: m.role,
          cols: [col(m.kind, 118)],
          tip: m.role + ' · ' + m.kind,
          scope: 'bundle member ' + m.role + ' (' + m.kind + ') of ' + bu.id,
          ctxLabel: 'Bundle member actions',
          actions: [
            { value: 'open', label: 'Open member' },
            { value: 'export', label: 'Export record',
              reason: 'artifacts_export_egress',
              sentence: 'The record and its provenance leave the app as a file on disk. Redactions travel with it; nothing is re-checked on the way out.' }
          ]
        });
      });
      body = pad(K.card(
        K.kv('Outcome', bu.outcome, 'token', b) +
        K.kv('Verification', bu.confidence, 'token', b) +
        K.kv('Members', String(bu.members.length), 'token', b)
      )) + list(binner);
      foot = { counts: bu.members.length + ' members · ' + bu.outcome,
               refresh: bu.confidence,
               primary: gbtn('Export investigation',
                 { primary: true, tip: 'Leaves the app — asks for confirmation' },
                 { code: 'artifacts_export_egress', value: 'export_investigation',
                   egress: true,
                   say: 'All ' + bu.members.length + ' members leave the app as one bundle, with their provenance and redaction envelopes.' }) };
    } else {
      var rows = A.rows.filter(function (r) {
        return active === 'all' || r.family === active;
      });
      var ainner = thead('Artifact', [
        { v: '', w: 30, cls: 'num', h: 'age' },
        { v: '', w: 60, cls: '', h: 'meta' },
        { v: '', w: 66, cls: '', h: 'meta' },
        { v: '', w: 76, cls: 'mono', h: 'kind' }
      ], b, th);
      if (!rows.length) {
        ainner += '<div class="vC-note">' +
          K.empty('no-results', 'No artifacts in this family', '') + '</div>';
      }
      rows.forEach(function (r) {
        var m = r.meta, last = m[m.length - 1];
        ainner += row({
          b: b, w: w, th: th, status: r.status,
          leadW: 26,
          lead: kindGlyph(r.kind),
          id: K.artifactLabel(r),
          cols: [col(last, 30, 'num'), col(m[1] || '', 60), col(m[0] || '', 66),
                 col(r.kind, 76, 'mono')],
          tip: r.provenance || r.preview,
          /* The row's identity may be a DERIVED label (PMK.artifactLabel), so
             the gate names the kind and the provenance too -- exporting the
             wrong record is not undoable once it is on disk. */
          scope: K.artifactLabel(r) + ' (' + r.kind + ', ' + r.family + ')' +
                 (r.provenance ? ' — ' + r.provenance : ''),
          ctxLabel: 'Artifact actions',
          actions: [
            { value: 'open', label: 'Open artifact' },
            { value: 'preview', label: 'Preview' },
            { type: 'sep' },
            { value: 'show_in_usage', label: 'Show in Usage',
              disabled: r.family !== 'receipt',
              reason: r.family !== 'receipt' ? 'usage_event_ref_absent' : '',
              sentence: r.family !== 'receipt'
                ? 'Show in Usage needs a usage_event_ref on the envelope.' : '' },
            { value: 'show_in_ledger', label: 'Show in Ledger',
              disabled: r.family !== 'receipt',
              reason: r.family !== 'receipt' ? 'ledger_ref_absent' : '',
              sentence: r.family !== 'receipt' ? 'This artifact carries no ledger reference.' : '' },
            { type: 'sep' },
            { value: 'export', label: 'Export record',
              reason: 'artifacts_export_egress',
              sentence: 'The record and its provenance leave the app as a file on disk. Redactions travel with it; nothing is re-checked on the way out.' }
          ]
        });
      });
      body = list(ainner);
      foot = { counts: rows.length + ' of ' + A.families[0].count,
               refresh: 'current',
               page: '1-' + rows.length + ' of ' + rows.length,
               primary: gbtn('Export',
                 { primary: true, tip: 'Leaves the app — asks for confirmation' },
                 { code: 'artifacts_export_egress', value: 'export', egress: true,
                   say: 'The record and its provenance leave the app as a file on disk. Redactions travel with it; nothing is re-checked on the way out.' }) };
    }

    return frame({
      bucket: b, width: w, theme: th, title: 'Artifacts', count: String(A.families[0].count),
      menu: [
        { value: 'refresh', label: 'Refresh snapshot' },
        { value: 'load_older', label: 'Load older' },
        { type: 'sep' },
        { value: 'export', label: 'Export record',
          reason: 'artifacts_export_egress',
          sentence: 'The record and its provenance leave the app as a file on disk. Redactions travel with it; nothing is re-checked on the way out.' },
        { value: 'export_investigation', label: 'Export investigation',
          reason: 'artifacts_export_egress',
          sentence: 'Every member of the investigation bundle leaves the app as one file, with their provenance and redaction envelopes.' },
        { value: 'import_bundle', label: 'Import bundle' }
      ],
      menuTip: 'Artifacts actions',
      ctxIcon: 'square',
      ctx: [p.name, A.families[0].count + ' artifacts', 'current', 'healthy'],
      ctxTip: p.name + ' · ' + A.families[0].count + ' artifacts · current, healthy',
      marks: marks,
      lenses: lenses, active: active,
      toolbar: {
        placeholder: 'Filter artifacts', label: 'Filter artifacts',
        controls: [
          K.select('curated', [
            { value: 'curated', label: 'Curated' },
            { value: 'raw', label: 'Raw' }
          ], { style: 'flex:0 1 104px;min-width:0' }),
          K.btn('Compare', { tip: 'Pick a compare target' })
        ],
        menu: [
          { value: 'set_preview_mode', label: 'Curated / Raw preview' },
          { value: 'set_compare_target', label: 'Set compare target' },
          { type: 'sep' },
          { value: 'load_older', label: 'Load older' },
          { value: 'export', label: 'Export',
            reason: 'artifacts_export_egress',
            sentence: 'The record and its provenance leave the app as a file on disk. Redactions travel with it; nothing is re-checked on the way out.' }
        ],
        tip: 'Artifacts options'
      },
      region: active,
      body: body, footer: foot
    });
  }

  /* ======================================================== lens switching
     The harness has no per-version event bus, so the deck wires its own,
     once, by delegation. Clicking a lens (or an attention mark, or picking
     from the bucket-0 portaled list) mutates ACTIVE and repaints exactly one
     stage. Roving Left/Right/Home/End over the tablist is manual-activation,
     which is the correct pattern for tabs whose panels are expensive. */
  var PANELS = {
    search: pSearch, source: pSource, git: pGit, docker: pDocker,
    tests: pTests, agents: pAgents, artifacts: pArtifacts
  };

  function vcStage(node) {
    var s = node && node.closest ? node.closest('.pm-stage') : null;
    return s && s.getAttribute('data-pm-version') === 'vC' ? s : null;
  }

  /* ------------------------------------------------------- MOTION: the lens
     The indicator slide is this version's signature, and it is the one
     primitive that cannot be a class in a markup string: PMM.lens has to
     MEASURE the selected tab. Two facts make the wiring what it is.

     ONE - a lens change repaints the whole panel, so the strip the indicator
     lives in is destroyed and rebuilt every time. A fresh .pmm-lens-ind would
     therefore always start at x=0 with width 0 and grow out of the left edge
     instead of travelling from the lens you were just on. So the FROM state
     is captured off the outgoing strip (the same one geometry read PMM.lens
     itself does: two rects, no loop, no observer), stamped onto the incoming
     track BEFORE the helper appends its indicator, and only then does
     PMM.lens set the new position. The transition then runs from the old lens
     to the new one, which is the whole point of a sliding indicator.

     TWO - the initial paint is the harness's, not ours, and there is no mount
     hook to run in. That is fine and deliberate: with no indicator element
     the strip is not a .pmm-lens-track, so the kit's own static underline
     still marks the selection. The first lens change is what promotes the
     strip, and the motion layer paints the indicator to match what the kit
     was drawing (inset 2px underline, 3px hard bar in retro, the accent-soft
     pill in friendly), so the promotion is invisible.

     Under reduced motion PMM.lens still measures and still positions - the
     two custom properties are the indicator's POSITION, not its animation -
     so the selection is always marked, it just does not travel. */
  function lensFrom(view) {
    var track = view.querySelector('.pmk-lenses');
    var sel = track && track.querySelector('.pmk-lens[aria-selected="true"]');
    if (!track || !sel) return null;
    var a = sel.getBoundingClientRect(), t = track.getBoundingClientRect();
    if (!a.width || !t.width) return null;
    return { x: Math.round((a.left - t.left) + (track.scrollLeft || 0)) + 'px',
             w: Math.round(a.width) + 'px' };
  }

  function lensTo(view, from) {
    if (!global.PMM) return;
    var track = view.querySelector('.pmk-lenses');
    if (!track) return;                 /* bucket 0: the portaled picker */
    if (from) {
      track.style.setProperty('--pmm-lens-x', from.x);
      track.style.setProperty('--pmm-lens-w', from.w);
    }
    global.PMM.lens(track, null);
  }

  /* THE STAGE'S OWN CONFIGURATION, not the harness's global one.

     PM_BAKEOFF.buildStage renders every stage from a PER-STAGE cfg -- matrix
     mode paints one panel at four widths across eight themes, side by side --
     but repaint() read PM_BAKEOFF.state, which is the toolbar's single
     current selection. So switching lens inside any stage that was not built
     from the toolbar's current values re-rendered it at the WRONG width: a
     240px stage came back laid out for 380px and broke out of its own panel
     by 57px, columns and all, because SHOWN_COLS was indexed by the other
     bucket. Single-stage mode hides this completely -- there the two agree by
     construction -- and the fit matrix never caught it because the matrix
     only ever measures each panel's DEFAULT lens, which is painted by
     buildStage and never by repaint.

     Width rides on the stage as --files-panel-w, which is the property the
     panel is actually sized by, and the theme is data-theme. Both are read
     back off the element being repainted, so the render and the box it lands
     in cannot disagree. The global state is a fallback for a stage carrying
     neither, which no stage the harness builds ever is. */
  function stageState(stage) {
    var g = (global.PM_BAKEOFF && global.PM_BAKEOFF.state) || {};
    var px = parseInt(stage.style.getPropertyValue('--files-panel-w'), 10);
    return {
      width: (px > 0) ? px : g.width,
      theme: stage.getAttribute('data-theme') || g.theme
    };
  }

  function repaint(stage, refocus) {
    var view = stage.querySelector('[data-pm-panelview]');
    var panel = stage.getAttribute('data-pm-panel');
    if (!view || !PANELS[panel]) return;
    var from = lensFrom(view);
    view.innerHTML = PANELS[panel](global.PM_DATA, stageState(stage));
    if (global.PM && global.PM.mountAll) global.PM.mountAll(view);
    lensTo(view, from);
    if (refocus) {
      var sel = view.querySelector('.pmk-lens[aria-selected="true"]');
      if (sel) sel.focus();
    }
  }

  function setLens(stage, id, refocus) {
    var panel = stage.getAttribute('data-pm-panel');
    if (!id || !panel || !PANELS[panel]) return;
    if (ACTIVE[panel] === id) return;
    ACTIVE[panel] = id;
    repaint(stage, refocus);
  }

  function onClick(e) {
    var t = e.target;
    if (!t || !t.closest) return;
    var stage = vcStage(t);
    if (!stage) return;
    /* THE GATE RUNS FIRST. A click that opens a confirmation must not also
       switch lens or select a row underneath the sheet -- the sheet traps
       focus, so a lens change behind it would land on a strip the user cannot
       see and cannot reach until they answer. */
    var gb = t.closest('[data-vc-gate]');
    if (gb && gb.getAttribute('aria-disabled') !== 'true') {
      e.preventDefault();
      var gcode = gb.getAttribute('data-vc-gate');
      openGate(gb, {
        code: gcode,
        say: gb.getAttribute('data-vc-say'),
        value: gb.getAttribute('data-vc-act') || '',
        label: (gb.textContent || '').trim(),
        scope: scopeFor(gb, gcode),
        danger: !gb.hasAttribute('data-vc-egress')
      });
      return;
    }
    var goto_ = t.closest('[data-vc-goto]');
    if (goto_) { setLens(stage, goto_.getAttribute('data-vc-goto')); return; }
    var btn = t.closest('.pmk-lens');
    if (!btn) return;
    if (btn.getAttribute('aria-disabled') === 'true') { e.preventDefault(); return; }
    var deck = btn.closest('[data-vc-deck]');
    if (!deck) return;
    var ids = (deck.getAttribute('data-vc-ids') || '').split(',');
    var i = Array.prototype.indexOf.call(btn.parentNode.children, btn);
    if (i >= 0 && ids[i]) setLens(stage, ids[i], true);
  }

  function onKey(e) {
    var t = e.target;
    if (!t || !t.closest) return;
    var btn = t.closest('.pmk-lens');
    if (!btn || !vcStage(btn)) return;
    var kids = Array.prototype.slice.call(btn.parentNode.children);
    var i = kids.indexOf(btn), n = kids.length, j = -1;
    if (e.key === 'ArrowRight') j = (i + 1) % n;
    else if (e.key === 'ArrowLeft') j = (i - 1 + n) % n;
    else if (e.key === 'Home') j = 0;
    else if (e.key === 'End') j = n - 1;
    else return;
    e.preventDefault();
    if (kids[j] && kids[j].focus) kids[j].focus();
  }

  function onChange(e) {
    var t = e.target;
    if (!t || !t.closest) return;
    var deck = t.closest('[data-vc-deck]');
    if (!deck) return;
    var stage = vcStage(deck);
    if (!stage) return;
    setLens(stage, e.detail && e.detail.value);
  }

  /* pm:menuaction is dispatched on the in-panel [data-pm-menu] root -- not on
     the portaled popup -- so it bubbles through the row, the panel and the
     stage, and every attribute the gate needs is on the path. detail.item is
     the item literal the version authored, carried through the template
     round-trip by PM.menu's own readMenuTemplate. */
  function onMenuAction(e) {
    var root = e.target;
    if (!root || !root.closest || !vcStage(root)) return;
    var it = (e.detail && e.detail.item) || null;
    if (!gateNeeded(it)) return;
    openGate(root, {
      code: it.reason || '',
      say: it.sentence || '',
      value: it.value || (e.detail && e.detail.action) || '',
      label: it.label,
      scope: scopeFor(root, it.reason || ''),
      /* An egress route is not destruction and does not get the danger
         button; anything flagged danger does, egress or not. */
      danger: !EGRESS[it.value] || !!it.danger
    });
  }

  if (!global.__vcLensDeckBound) {
    global.__vcLensDeckBound = true;
    document.addEventListener('click', onClick);
    document.addEventListener('keydown', onKey);
    document.addEventListener('pm:change', onChange);
    document.addEventListener('pm:menuaction', onMenuAction);
  }

  /* ================================================================ register */
  global.PM_BAKEOFF.register('vC', {
    name: 'Lens Deck',
    blurb: 'A constant four-strip frame over one lens at a time.',
    panels: PANELS
  });
})(window);
