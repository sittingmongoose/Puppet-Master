/* PANEL BAKEOFF — SOURCE CONTROL one-off explorations (xS1 / xS2 / xS3)
   =====================================================================
   Three panel-scoped variants that populate ONLY the 'source' panel. They are
   deliberately NOT constrained to any of the six systems' theses, because
   Source Control is the panel where the six all converge on the same answer
   (a section list with a footer composer) and convergence is not evidence.

   What they are answering, and how they differ from the two zero-failure
   incumbents:

     vD drill-stack  one region at a time, composer pinned as the Changes
                     footer. The composer only exists at one stack level.
     vC lens-deck    a constant four-strip frame, one lens at a time, composer
                     pinned as the lens footer. Changes and Worktrees are peers.

     xS1 Commit Desk    the composer is the MASTHEAD, not the footer, and every
                        list below it is graded by whether it is in the commit.
     xS2 Lane Board     the worktree is the primary object; changes, history
                        and branches are properties OF a selected lane, never
                        peer sections.
     xS3 Review Queue   16 changed files are a worklist with reviewed/unreviewed
                        state, an explicit progress rail, and a two-column
                        480px layout that vD explicitly refuses.

   ONE FINDING FIRST, because it killed a fourth direction outright.
   The brief offered a "diff-stat rail: each changed file renders as a single
   line with an inline +/- magnitude bar". _pm-data.js ships NO line counts on
   any changed file -- staged/unstaged entries carry path, chars, code, and for
   renames from/fromChars, and nothing else. Building that rail would have
   meant inventing 32 numbers, which is exactly the "if a design only survives
   after you edit a fixture, the design does not survive" rule inverted. xS3
   keeps the SCAN-AS-A-SHAPE value of that direction and spends it on state the
   fixture actually carries (review progress and change kind), which is the
   honest version of the same idea.

   MOTION
   All three are wired to the shared layer (_pm-motion.css / PMM) and declare no
   keyframe, no duration and no easing of their own. Four primitives, one per
   interaction, never two on the same click:

     xS1  .pmm-expand   every section body and every worktree detail. xS1 is the
                        only variant whose interactions are DOM toggles rather
                        than repaints, so the accordion IS its motion; it also
                        carries .pmm-enter in the markup, which is safe exactly
                        because nothing here repaints.
     xS2  .pmm-frame    the focus region on a lane change, the view body on a
                        lens change, direction read off list order.
          .pmm-enter    the lane list on a filter change -- the one xS2
                        interaction that replaces a list rather than re-marking
                        one.
     xS3  .pmm-frame    push-to-detail below 480 and Back, the vD convention
                        verbatim; at 480 the push narrows to the detail column
                        because the queue never leaves.
          .pmm-flash    the review rail when a mark flips a segment.
          .pmm-enter    the queue list on a To review / Reviewed / All change.
     xS2+xS3 .pmm-lens-ind  the F3-445 strip selection travels instead of
                        re-painting on a different element.

   Two things the shared layer could not decide for these files, both documented
   at their call sites: .pmm-expand is applied at TOGGLE time rather than in the
   markup (so the fit rig, which never clicks, measures exactly the markup it
   measured before motion existed), and the lens indicator is snapshotted across
   the repaint that destroys it (so it travels from where the mark was instead
   of sliding in from the left edge).

   WHAT THIS PASS ADDED, and where to read it
   Four findings from research/AUDIT-SUMMARY.md section 3, all of them design
   absences rather than fixture gaps, and none of them needing new shared code:

     blind spot 20  THE CONFIRMATION GATE. PM.confirm has existed in
                    _pm-components.js:498 the whole time -- modal, scrimmed,
                    role=dialog, aria-modal, focus-captured, no auto-close --
                    and no version called it. Every strong action in these
                    three variants now routes through gateDef/gate, which name
                    scope and consequence before the verb. See THE
                    CONFIRMATION GATE below.
     blind spot 2   REPO IDENTITY. source.repo and its two sibling repos were
                    read by nobody. The branch combobox is now a context
                    header over repository + siblings + branch, which is what
                    GI-005 and source.md section 8 asked for. See REPO
                    IDENTITY.
     blind spot 8   CONFLICT RESOLUTION. conflicts[].sides[] with per-side
                    churn, markersRemaining and a deliberately null base on
                    the add-add row. The card renders both sides as peers and
                    the compare target now depends on whether a base exists.
                    See CONFLICTS.
     blind spot 9   WORKTREE FLAGS. locked / prunable / dirty / repairable
                    plus the lifecycle word drive every action's enablement,
                    and `Recover` exists for the first time outside a comment.
                    See ACTION ENABLEMENT.

   Plus the four x-source corrections the audit called mandatory: lifecycle
   reads w.lifecycle (done in the previous pass), a null path renders an
   explicit absent state, the lock sentence switches on reason family, and
   activeContexts filters on lifecycle rather than on `run`.

   SHARED RULES OBSERVED
   - no id= anywhere; every hook is data-pm-* or data-xs*-*
   - inline SVG only via PMK.icon; no emoji
   - no backtick and no dollar-brace in any string
   - no new color-mix(), no new backdrop-filter, no hard-coded radius
   - every select is PMK.select; every overflow is PMK.overflow (pm-menu)
   - every icon-only control carries data-pm-tip AND an aria-label
   - all content from _pm-data.js; UI chrome words (section labels, action
     nouns from research/source.md section 6) are the only non-fixture strings
   - no fixture array is indexed by fixed position for meaning: the primary
     context is RESOLVED (see primaryContext / primaryLane), because vE reading
     worktrees[0] as primary is a latent bug and 'main' is not in that array
     at all.
   ===================================================================== */
(function (global) {
  'use strict';

  var PMK = global.PMK;
  var esc = PMK.esc;
  var ic = PMK.icon;
  var elide = PMK.elide;

  /* =================================================================== CSS
     Injected once per document, not per stage: the contact sheet renders eight
     stages and would otherwise carry eight copies. Tokens only. Rules that are
     identical across the three variants list all three prefixes explicitly
     rather than inventing a fourth shared namespace. */
  (function injectCss() {
    if (document.querySelector('style[data-xsource-css]')) return;
    var s = document.createElement('style');
    s.setAttribute('data-xsource-css', '');
    s.textContent = [
      /* ---- overflow triggers outside a .pmk-row must not stay invisible ---- */
      '.xS1 .pmk-head .pmk-of,.xS1 .pmk-strip .pmk-of,.xS1-desk .pmk-of,',
      '.xS1-wtd .pmk-of,.xS2 .pmk-head .pmk-of,.xS2 .pmk-strip .pmk-of,',
      '.xS2-own .pmk-of,.xS2-foot .pmk-of,.xS3 .pmk-head .pmk-of,',
      '.xS3 .pmk-strip .pmk-of,.xS3-foot .pmk-of,.xS3-det .pmk-of{opacity:1}',

      /* ---- shared atoms ---- */
      '.xS1-code,.xS2-code,.xS3-code{flex:0 0 14px;width:14px;align-self:center;',
      'text-align:center;font-family:var(--mono-font);font-size:var(--fs-2xs);',
      'font-weight:700;color:var(--text-muted);line-height:1.4}',
      '.xS1-code[data-t="add"],.xS2-code[data-t="add"],.xS3-code[data-t="add"]{color:var(--accent-lime)}',
      '.xS1-code[data-t="del"],.xS2-code[data-t="del"],.xS3-code[data-t="del"]{color:var(--accent-error)}',
      '.xS1-code[data-t="warn"],.xS2-code[data-t="warn"],.xS3-code[data-t="warn"]{color:var(--accent-warning)}',

      '.xS1-base,.xS2-base,.xS3-base{font-size:var(--fs-xs);color:var(--text-primary)}',
      '.xS1-dir,.xS2-dir,.xS3-dir{font-size:var(--fs-2xs);color:var(--text-muted)}',

      '.xS1-mini,.xS2-mini,.xS3-mini{flex:0 0 24px;min-width:24px;min-height:24px;',
      'align-self:center;display:inline-flex;align-items:center;justify-content:center;',
      'padding:0;border:0;background:transparent;color:var(--text-muted);cursor:pointer;',
      'border-radius:var(--radius-xs)}',
      '.xS1-mini:hover,.xS2-mini:hover,.xS3-mini:hover{color:var(--text-primary);background:var(--accent-soft)}',
      '.xS1-mini:focus-visible,.xS2-mini:focus-visible,.xS3-mini:focus-visible{',
      'outline:2px solid var(--accent-primary);outline-offset:-2px}',

      '.xS1-nums,.xS2-nums,.xS3-nums{flex:0 0 auto;font-family:var(--mono-font);',
      'font-size:var(--fs-2xs);color:var(--text-muted);font-variant-numeric:tabular-nums;',
      'white-space:nowrap}',

      '.xS1-plus,.xS2-plus,.xS3-plus{flex:0 0 auto;min-height:24px;padding:0 var(--md);',
      'border:var(--border-width,1px) solid var(--border-light,var(--border));',
      'border-radius:var(--radius-sm);background:var(--surface);color:var(--text-secondary);',
      'font:inherit;font-size:var(--fs-2xs);font-weight:700;cursor:pointer;white-space:nowrap}',
      '.xS1-plus:hover,.xS2-plus:hover,.xS3-plus:hover{border-color:var(--accent-primary);color:var(--text-primary)}',

      /* ---- the context header button (repo + branch + worktree) ----------
         GI-005 / requirement 6. .pm-menu-trigger is a 24px ICON button, so a
         LABELLED trigger has to re-declare its box; it keeps the trigger's
         hover and focus contract and nothing else. Equal specificity, and
         this sheet is appended after the linked ones, so these win.
         text-overflow is the belt and cap()/elide() the braces: a repo
         identity that outgrows its budget degrades to an ellipsis (W1, a
         warning the checker exists to report) and can never hard-clip (R3). */
      '.xS1-ctx,.xS2-ctx,.xS3-ctx{flex:0 1 auto;min-width:0;min-height:24px;',
      'justify-content:flex-start;padding:0 var(--sm);',
      'border:var(--border-width,1px) solid var(--border-light,var(--border));',
      'border-radius:var(--radius-sm);background:var(--surface);color:var(--text-secondary);',
      'font:inherit;font-size:var(--fs-2xs);font-weight:600;cursor:pointer;',
      'white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
      '.xS1-ctx:hover,.xS2-ctx:hover,.xS3-ctx:hover{border-color:var(--accent-primary);',
      'color:var(--text-primary)}',

      '.xS1-list>.pmk-row,.xS2-list>.pmk-row,.xS3-list>.pmk-row{',
      'padding-left:calc(var(--md) + 10px)}',
      '.xS1-list,.xS2-list,.xS3-list{display:flex;flex-direction:column;min-width:0}',

      '.xS1-acts,.xS2-acts,.xS3-acts{display:flex;flex-wrap:wrap;gap:var(--sm);min-width:0}',

      /* =========================== xS1 Commit Desk =========================== */
      '.xS1-desk{flex:none;display:flex;flex-direction:column;gap:var(--sm);',
      'padding:var(--md);background:var(--surface-elevated);',
      'border-bottom:var(--border-width,1px) solid var(--border)}',
      '.xS1-msg{resize:none;line-height:var(--lh-body);font-family:var(--body-font);',
      'font-size:var(--fs-xs);min-height:26px;overflow:hidden}',
      '.xS1-msg:focus,.xS1-msg:focus-visible{min-height:54px;overflow:auto}',
      '.xS1-pay{display:flex;align-items:baseline;gap:var(--sm);min-width:0;',
      'font-size:var(--fs-2xs);color:var(--text-muted);white-space:nowrap;overflow:hidden;',
      'text-overflow:ellipsis}',
      '.xS1-pay b{color:var(--text-secondary);font-weight:700}',
      '.xS1-grp{padding-left:calc(var(--md) + 10px);text-transform:none;letter-spacing:.04em;',
      'font-weight:600;color:var(--text-muted);min-height:24px}',
      /* MOTION SPLIT. .xS1-secbody and .xS1-wtx are the boxes PMM.expand drives,
         so they must NOT declare a display of their own: .pmm-expand sets
         display:grid and this stylesheet is injected AFTER _pm-motion.css, so an
         equal-specificity display here would silently beat the primitive. The
         column flex moved one level in, to a wrapper that is also the "exactly
         one element child" the 0fr/1fr accordion requires. A block box holding
         one full-width block child lays out identically to the column flex it
         replaces, which is why this costs zero measured pixels. */
      '.xS1-secbody{min-width:0}',
      '.xS1-secbody[hidden]{display:none}',
      '.xS1-secin{display:flex;flex-direction:column;min-width:0}',
      '.xS1-wtx{min-width:0}',
      '.xS1-wtx[hidden]{display:none}',
      '.xS1-wtd{display:flex;flex-direction:column;gap:var(--sm);min-width:0;',
      'padding:var(--sm) var(--md) var(--md) calc(var(--md) + 10px)}',
      '.xS1-wtd[hidden]{display:none}',
      '.xS1-hair{flex:none;height:1px;margin:var(--md) var(--md) var(--xs);',
      'background:var(--border-light,var(--border))}',
      '.xS1 .pmk-row[aria-expanded="true"]{background:var(--accent-soft)}',

      /* ============================ xS2 Lane Board =========================== */
      '.xS2-lanes{flex:2 1 0;min-height:0;overflow-y:auto;overflow-x:hidden;',
      'overscroll-behavior:contain;scrollbar-width:thin;',
      'border-bottom:var(--border-width,1px) solid var(--border)}',
      '.xS2-focus{flex:3 1 0;min-height:0;display:flex;flex-direction:column;min-width:0}',
      '.xS2-ident{flex:none;display:flex;align-items:center;gap:var(--sm);min-width:0;',
      'padding:var(--md) var(--md) var(--xs)}',
      '.xS2-name{flex:1 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;',
      'white-space:nowrap;font-size:var(--fs-sm);font-weight:700;color:var(--text-primary);',
      'font-family:var(--display-font-sm,var(--body-font))}',
      '.xS2-own{flex:none;display:flex;flex-direction:column;gap:var(--xs);min-width:0;',
      'padding:0 var(--md) var(--md)}',
      '.xS2-ownline{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;',
      'font-size:var(--fs-xs);color:var(--text-secondary)}',
      '.xS2-kvs{display:flex;flex-direction:column;min-width:0}',
      '.xS2-body{flex:1 1 auto;min-height:0;overflow-y:auto;overflow-x:hidden;',
      'overscroll-behavior:contain;scrollbar-width:thin}',
      '.xS2-foot{flex:none;display:flex;flex-direction:column;gap:var(--sm);',
      'padding:var(--md);border-top:var(--border-width,1px) solid var(--border);',
      'background:var(--surface-elevated)}',
      '.xS2-msg{resize:none;line-height:var(--lh-body);font-family:var(--body-font);',
      'font-size:var(--fs-xs);min-height:26px;overflow:hidden}',
      '.xS2-msg:focus,.xS2-msg:focus-visible{min-height:54px;overflow:auto}',
      '.xS2 .pmk-row.is-lane{padding-left:var(--md)}',
      '.xS2 .pmk-row.is-sel{background:var(--accent-soft)}',
      '.xS2 .pmk-row.is-sel .pmk-of{opacity:1}',

      /* =========================== xS3 Review Queue ========================== */
      '.xS3-meter{display:flex;align-items:center;gap:2px;flex:1 1 auto;min-width:0;height:8px}',
      '.xS3-seg{flex:1 1 0;min-width:2px;height:8px;border-radius:var(--radius-xs);',
      'background:var(--border-light,var(--border))}',
      '.xS3-seg[data-s="done"]{background:var(--accent-lime)}',
      '.xS3-seg[data-s="conflict"]{background:var(--accent-warning)}',
      /* The push region. One box so PMM.push has a single node to slide -- the
         list frame and the back-bar + detail frame are the same box at
         different states. Flex column, flex:1 1 auto, min-height:0 reproduces
         exactly what .xS3-cols / .xS3-scroll got as direct children of the
         panel, so wrapping them changes no measured geometry. */
      '.xS3-main{display:flex;flex-direction:column;flex:1 1 auto;',
      'min-height:0;min-width:0}',
      '.xS3-cols{display:flex;flex:1 1 auto;min-height:0;min-width:0}',
      '.xS3-col{display:flex;flex-direction:column;min-height:0;min-width:0}',
      '.xS3-col--q{flex:1 1 56%;border-right:var(--border-width,1px) solid var(--border)}',
      '.xS3-col--d{flex:1 1 44%}',
      '.xS3-scroll{flex:1 1 auto;min-height:0;overflow-y:auto;overflow-x:hidden;',
      'overscroll-behavior:contain;scrollbar-width:thin}',
      '.xS3-back{flex:none;display:flex;align-items:center;gap:var(--sm);min-height:26px;',
      'padding:1px var(--md);border-bottom:var(--border-width,1px) solid var(--border);min-width:0}',
      '.xS3-backt{flex:1 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;',
      'white-space:nowrap;font-size:var(--fs-xs);color:var(--text-secondary)}',
      '.xS3-det{display:flex;flex-direction:column;gap:var(--md);padding:var(--md);min-width:0}',
      '.xS3-dett{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;',
      'font-size:var(--fs-sm);font-weight:700;color:var(--text-primary);',
      'font-family:var(--display-font-sm,var(--body-font))}',
      '.xS3-check[aria-pressed="true"]{color:var(--accent-lime)}',
      '.xS3-foot{flex:none;display:flex;flex-direction:column;gap:var(--sm);',
      'padding:var(--md);border-top:var(--border-width,1px) solid var(--border);',
      'background:var(--surface-elevated)}',
      '.xS3-msg{resize:none;line-height:var(--lh-body);font-family:var(--body-font);',
      'font-size:var(--fs-xs);min-height:26px;overflow:hidden}',
      '.xS3-msg:focus,.xS3-msg:focus-visible{min-height:54px;overflow:auto}',
      '.xS3 .pmk-row.is-sel{background:var(--accent-soft)}',
      '.xS3 .pmk-row.is-sel .pmk-of{opacity:1}',
      '.xS3-prog{flex:0 0 auto;font-size:var(--fs-2xs);color:var(--text-muted);',
      'white-space:nowrap;font-variant-numeric:tabular-nums}',

      /* ================= AA floors, basic-* only =========================
         FinalGUISpec section 13.1 mandates AA specifically for Basic, the
         designated accessibility theme, and the fit checker gates W2 to it for
         that reason. Measured against these grounds: --text-muted (#6B7280) on
         basic-dark's --surface-elevated is 3.76:1, --accent-warning on
         basic-light's --surface is 3.20:1 and --accent-lime is 4.24:1 -- so
         the change letter, which is the one glyph a change row cannot be read
         without, fails in the theme that most needs it. The kit patched its own
         .pmk-blocked-code the same way; these patch only the classes THIS file
         owns. Kit-owned classes (.pmk-note, .pmk-head-count, .pmk-btn--primary)
         are deliberately left alone: they are shared by all six systems and
         fixing them here would flatter these three against their peers. */
      '[data-theme="basic-dark"] .xS1-dir,[data-theme="basic-dark"] .xS2-dir,',
      '[data-theme="basic-dark"] .xS3-dir,[data-theme="basic-dark"] .xS1-nums,',
      '[data-theme="basic-dark"] .xS2-nums,[data-theme="basic-dark"] .xS3-nums,',
      '[data-theme="basic-dark"] .xS1-pay,[data-theme="basic-dark"] .xS3-prog,',
      '[data-theme="basic-dark"] .xS1-grp,[data-theme="basic-dark"] .xS1-mini,',
      '[data-theme="basic-dark"] .xS2-mini,[data-theme="basic-dark"] .xS3-mini,',
      '[data-theme="basic-dark"] .xS1-code,[data-theme="basic-dark"] .xS2-code,',
      '[data-theme="basic-dark"] .xS3-code,[data-theme="basic-dark"] .xS3-backt',
      '{color:#ABB2BC}',
      '[data-theme="basic-light"] .xS1-code[data-t="warn"],',
      '[data-theme="basic-light"] .xS2-code[data-t="warn"],',
      '[data-theme="basic-light"] .xS3-code[data-t="warn"]{color:#8A5200}',
      '[data-theme="basic-light"] .xS1-code[data-t="del"],',
      '[data-theme="basic-light"] .xS2-code[data-t="del"],',
      '[data-theme="basic-light"] .xS3-code[data-t="del"]{color:#A11212}',
      '[data-theme="basic-light"] .xS1-code[data-t="add"],',
      '[data-theme="basic-light"] .xS2-code[data-t="add"],',
      '[data-theme="basic-light"] .xS3-code[data-t="add"]{color:#1B6B2E}',
      '[data-theme="basic-dark"] .xS1-code[data-t="warn"],',
      '[data-theme="basic-dark"] .xS2-code[data-t="warn"],',
      '[data-theme="basic-dark"] .xS3-code[data-t="warn"]{color:#FFC14D}',
      '[data-theme="basic-dark"] .xS1-code[data-t="del"],',
      '[data-theme="basic-dark"] .xS2-code[data-t="del"],',
      '[data-theme="basic-dark"] .xS3-code[data-t="del"]{color:#FF8B8B}',
      '[data-theme="basic-dark"] .xS1-code[data-t="add"],',
      '[data-theme="basic-dark"] .xS2-code[data-t="add"],',
      '[data-theme="basic-dark"] .xS3-code[data-t="add"]{color:#8FE0A0}',
      '[data-theme="basic-dark"] .xS3-check[aria-pressed="true"]{color:#8FE0A0}',
      '[data-theme="basic-light"] .xS3-check[aria-pressed="true"]{color:#1B6B2E}'
    ].join('');
    document.head.appendChild(s);
  })();

  /* ============================================================== helpers */

  /* Characters that fit an identity slot. Same arithmetic as PMK.idChars but
     with an explicit reserved budget, because these rows have a leading status
     letter that the kit's gutter model does not know about. basic-* is the
     widest text (Inter 15px + 0.02em) and therefore the number that must hold. */
  function cap(st, reserved) {
    var th = (st && st.theme) || '';
    /* The kit's own idChars uses 5.4 for retro. Measured against these rows it
       is about 6% optimistic for Rajdhani at --fs-xs -- it was the only cause
       of residual ellipsis in retro-dark and retro-light once the column split
       was accounted for -- so this uses 5.75. basic stays the widest case. */
    var px = /^basic/.test(th) ? 6.6 : /^retro/.test(th) ? 5.75 : 6.2;
    var w = (st && st.width) || 380;
    return Math.max(8, Math.floor((w - 16 - 8 - (reserved || 0)) / px));
  }

  function baseOf(p) {
    p = String(p == null ? '' : p);
    var i = p.lastIndexOf('/');
    return i < 0 ? p : p.slice(i + 1);
  }
  function dirOf(p) {
    p = String(p == null ? '' : p);
    var i = p.lastIndexOf('/');
    return i < 0 ? '' : p.slice(0, i);
  }

  var CODE_WORD = {
    M: 'Modified', A: 'Added', D: 'Deleted', R: 'Renamed',
    U: 'Conflicted', '?': 'Untracked'
  };
  var CODE_TONE = { A: 'add', D: 'del', U: 'warn', R: 'add' };

  /* Compare-target defaults are deterministic per GitHub_Integration.md:L94 and
     must not be reinvented per row. This is the one place they are written. */
  var COMPARE = {
    staged: 'HEAD to index',
    unstaged: 'index to working tree',
    untracked: 'empty to working tree',
    conflict: 'three-way: base, ours, theirs, result'
  };

  /* ---------------------------------------------------------- CONFLICTS
     BLIND SPOT 8. source.conflicts carries, per conflicted file, both sides
     with per-side churn, the hunk count, markersRemaining, resolved:false, a
     kind (content | add-add) and a base that is DELIBERATELY null on the
     add-add row. The fixture marks neither side preferred, so a one-click
     "Take theirs" is visible as a violation of WorktreeGitImprovement.md:L451
     ("must never auto-write a side"). Nothing in this file read any of it.

     Three consequences, all data-driven:

     1. The compare target is not constant. 'three-way: base, ours, theirs,
        result' names a base that docker-compose.override.yml does not have --
        both sides CREATED that file -- so promising a three-way review there
        is the panel asserting something the fixture explicitly denies
        (audit-source 4.8).
     2. The sentence is not constant either. "Both sides changed X" is false
        for an add-add conflict; neither side changed it, both added it.
     3. `mark_conflict_resolved` has a precondition -- `no_conflict_markers`
        (source.md section 3) -- and markersRemaining is 3 and 1. It renders
        disabled with the count as its reason, not enabled and hopeful. */
  function conflictOf(SC, path) {
    var hit = null;
    ((SC && SC.conflicts) || []).forEach(function (c) { if (!hit && c.path === path) hit = c; });
    return hit;
  }

  function compareOf(group, cf) {
    if (group !== 'conflict') return COMPARE[group];
    return (cf && cf.base)
      ? 'three-way: base ' + cf.base + ', ours, theirs, result'
      : 'two-way: ours, theirs, result (no merge base recorded)';
  }

  function plural(n, word) { return n + ' ' + word + (n === 1 ? '' : 's'); }

  /* One irregular in the whole file, and it is in the sentence GI-005 is
     about, so it gets said properly rather than 'repositorys'. */
  function repos(n) { return n + ' sibling ' + (n === 1 ? 'repository' : 'repositories'); }

  /* A side as a KV pair. The fixture's label is 'Theirs - orch/lane-d-infra'
     and the whole string as a KV KEY measured as an ellipsis at 320 and 380 --
     which cuts the BRANCH, the only part that identifies the side. Split on
     the fixture's own ' - ' delimiter (not a paraphrase: both halves render
     verbatim) so the side word is the key and the branch plus its churn is a
     prose value, which stacks and wraps instead of truncating. */
  function sideKv(sd, b) {
    var cut = String(sd.label || '').indexOf(' - ');
    var key = cut > 0 ? sd.label.slice(0, cut) : (sd.id || 'Side');
    var rest = cut > 0 ? sd.label.slice(cut + 3) : sd.label;
    return PMK.kv(key, rest + ', plus ' + sd.add + ' minus ' + sd.del, 'prose', b);
  }

  function conflictSay(cf) {
    if (!cf) return '';
    return (cf.kind === 'add-add'
      ? 'Both sides added ' + baseOf(cf.path) + ' independently, so there is no merge base to compare against.'
      : 'Both sides modified ' + baseOf(cf.path) + '.') +
      ' ' + plural(cf.markersRemaining, 'conflict marker') +
      (cf.markersRemaining === 1 ? ' remains' : ' remain') + ' across ' +
      plural(cf.hunks, 'hunk') + '. Neither side is preferred; resolution is never written for you.';
  }

  /* The two sides, in the fixture's order, with their own churn and NEITHER
     marked default, primary or danger. The confirmation is what writes a
     side, and it is the same gate for both -- which is the whole point: an
     affordance that makes one side one click cheaper than the other IS the
     auto-preference :L451 forbids, whatever the code does afterwards. */
  function sideItems(cf) {
    if (!cf) return [];
    return (cf.sides || []).map(function (s) {
      return {
        value: 'resolve_conflict_side:' + s.id + ':' + cf.path,
        label: 'Resolve using ' + s.label,
        hint: '+' + s.add + ' -' + s.del
      };
    });
  }

  /* THE CONFLICT CARD, one per conflicted file, shared by all three variants.
     Everything in it is read off source.conflicts: both sides with their own
     churn, the marker and hunk counts, the resolved flag, and a compare target
     that is three-way only when a merge base actually exists.

     The two side buttons are PEERS -- same tone, same size, fixture order,
     neither primary, neither danger -- because an affordance that makes one
     side one click cheaper IS the auto-preference :L451 forbids, whatever the
     code behind it does. Both route through the confirmation gate, which is
     where the side gets named in full together with what the other side
     loses. `Use ours` / `Use theirs` are the button labels rather than the
     full side labels for one reason: 'Use Theirs - thread/scaling-rounding'
     is 38 characters into a 224px band, and the full labels are two KV rows
     above with their churn attached. */
  function conflictCard(pfx, boxCls, f, b) {
    var cf = conflictOf(SRC(), f.path);
    if (!cf) return '';
    return '<div class="' + boxCls + '" data-xs-kind="file" data-xs-scope="' + esc(f.path) + '">' +
      PMK.kv('Conflict', cf.conflict + ', ' + cf.kind, 'token', b) +
      PMK.kv('Compare target', compareOf('conflict', cf), 'prose', b) +
      (cf.sides || []).map(function (sd) {
        return sideKv(sd, b);
      }).join('') +
      PMK.kv('Markers remaining', cf.markersRemaining + ' across ' + plural(cf.hunks, 'hunk'),
             'prose', b) +
      PMK.kv('Resolved', cf.resolved ? 'yes' : 'no', 'token', b) +
      '<span class="pmk-note">' + esc(conflictSay(cf)) + '</span>' +
      '<div class="' + pfx + '-acts">' +
        actBtn('Open Conflict Assistant', 'open_conflict', { primary: true }) +
        (b >= 1 ? (cf.sides || []).map(function (sd) {
          return actBtn('Use ' + sd.id, 'resolve_conflict_side:' + sd.id + ':' + cf.path);
        }).join('') : '') +
      '</div></div>';
  }

  function conflictItems(cf) {
    if (!cf) return [];
    var out = [{ type: 'head', label: cf.conflict + ', ' + plural(cf.hunks, 'hunk') }];
    out.push({ value: 'open_conflict', label: 'Open Conflict Assistant' });
    out.push({ value: 'open_merge_editor', label: 'Open merge editor' });
    out.push({ type: 'sep' });
    out.push({ type: 'head', label: 'Resolve, after confirmation' });
    sideItems(cf).forEach(function (i) { out.push(i); });
    out.push({ value: 'conflict_apply_resolution:' + cf.path, label: 'Apply resolution per hunk' });
    out.push({
      value: 'mark_conflict_resolved', label: 'Mark resolved',
      disabled: cf.markersRemaining > 0,
      reason: cf.markersRemaining > 0 ? 'conflict_markers_remaining' : '',
      sentence: cf.markersRemaining > 0
        ? plural(cf.markersRemaining, 'marker') + ' still in the file; marking resolved needs none.' : ''
    });
    out.push({ type: 'sep' });
    return out;
  }

  /* -------------------------------------------------------- REPO IDENTITY
     BLIND SPOT 2. source.repo carries name, owner, nameWithOwner, host,
     remote, lifecycle, visibility and two sibling repos, and ten of ten
     versions rendered none of it. GitHub_Integration.md:L397 (GI-005) states
     the multi-context model "never assumes a single repo context"; a header
     that shows branch and worktree while two sibling repos are resolvable IS
     that assumption.

     source.md section 8 rules the 240px form: "Context header (1 row, 28px) --
     repo/branch/worktree as one truncating button + +N chip. Not a select."
     So this REPLACES the branch combobox rather than crowding in beside it:
     one control, one row, and the three subjects the requirement names live
     in its menu, where per-option disabled reasons are expressible (a
     combobox cannot carry a group head, which is why a select could never
     have held all three). +N stays its own separate control, because W-018
     makes it a separate projection. */
  function repoOf(D) { return (D.source && D.source.repo) || null; }

  /* The width ladder for the label, and the 240px rung is a deliberate loss.
     Measured, the button's budget at 240 is 10-13 characters depending on the
     variant, and 'tastebook · main' is 16 -- so the honest choices are a
     half-word ('tastebook · m...', which cuts the branch, the one identity
     that changes hourly) or the branch alone. This takes the branch alone and
     leaves the repository to the accessible name, which is complete at every
     width, and to the menu one click away. That is the 240px rule
     FinalGUISpec.md:L2089 states outright -- "all extras behind overflow
     menu" -- rather than a truncation dressed up as a render. From 320px up
     the repository is on screen, and from 380 with its owner. */
  function ctxLabel(D, st, b, reserved) {
    var r = repoOf(D), br = D.project.branch;
    var txt = (!r || b === 0) ? br : (b >= 2 ? r.nameWithOwner : r.name) + ' · ' + br;
    return elide(txt, 'path', cap(st, reserved));
  }

  function ctxSay(D) {
    var r = repoOf(D);
    if (!r) return 'Branch ' + D.project.branch + '. Change the repository, branch or worktree context.';
    return 'Repository ' + r.nameWithOwner + ', ' + r.visibility + ', on ' + r.host +
      '. Branch ' + D.project.branch + '. ' + repos(r.siblingCount) +
      ' resolvable. Change the repository, branch or worktree context.';
  }

  function ctxItems(D) {
    var SC = D.source || {}, r = repoOf(D), by = wtLookup(SC);
    var items = [];
    if (r) {
      items.push({ type: 'head', label: 'Repository' });
      items.push({ value: 'repo.open', label: r.nameWithOwner, hint: r.visibility });
      items.push({ value: 'repo.host', label: r.host, hint: 'host' });
      items.push({ value: 'repo.remote', label: r.remote, hint: 'remote' });
      items.push({ value: 'repo.default_branch', label: r.defaultBranch, hint: 'default branch' });
      items.push({ value: 'repo.lifecycle', label: r.lifecycle, hint: 'repo lifecycle' });
      items.push({ type: 'sep' });
      items.push({ type: 'head', label: repos(r.siblingCount) });
      (r.siblings || []).forEach(function (s) {
        items.push({ value: 'repo.switch:' + s, label: s, hint: 'open repository' });
      });
      items.push({ type: 'sep' });
    }
    items.push({ type: 'head', label: 'Branch' });
    (SC.branchList || []).forEach(function (br) {
      var w = by[br.name];
      items.push({
        value: 'branch:' + br.name,
        label: br.name + (br.current ? '  current' : ''),
        hint: '+' + br.ahead + ' -' + br.behind,
        disabled: !!(w && w.locked),
        reason: (w && w.lockReason) || '',
        sentence: w && w.locked ? branchLockSay(w) : ''
      });
    });
    return items;
  }

  function ctxBtn(pfx, D, st, b, reserved) {
    return '<span class="pmk-menu" data-pm-menu>' +
      '<button type="button" class="' + pfx + '-ctx pm-menu-trigger" ' +
      'data-pm-tip="Repository, branch and worktree context" ' +
      'aria-label="' + esc(ctxSay(D)) + '">' + esc(ctxLabel(D, st, b, reserved)) + '</button>' +
      '<template data-pm-items>' + menuTemplate(ctxItems(D)) + '</template></span>';
  }

  /* One template writer for every hand-rolled pm-menu in this file. PMK.overflow
     owns the icon-trigger form; these are labelled triggers, and duplicating
     the item serialisation three times is how the disabled-reason attributes
     went missing from one of them in the first place. */
  function menuTemplate(items) {
    return (items || []).map(function (it) {
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

  /* The change groups. staged 9 / unstaged 7 stay the advertised counts; the
     unstaged 7 split into 3 modified + 2 conflicted + 2 untracked, and a
     conflict is NEVER silently grouped with modified. */
  function groupsOf(SC) {
    var st = (SC && SC.staged) || [];
    var un = (SC && SC.unstaged) || [];
    var conflict = [], untracked = [], unstaged = [];
    un.forEach(function (f) {
      if (f.code === 'U') conflict.push(f);
      else if (f.code === '?') untracked.push(f);
      else unstaged.push(f);
    });
    return { staged: st, unstaged: unstaged, conflict: conflict, untracked: untracked, all: un };
  }

  /* Every changed file in one ordered queue, each tagged with the group that
     determines its compare target. */
  function queueOf(SC) {
    var g = groupsOf(SC), out = [];
    g.staged.forEach(function (f) { out.push({ f: f, group: 'staged' }); });
    ((SC && SC.unstaged) || []).forEach(function (f) {
      out.push({ f: f, group: f.code === 'U' ? 'conflict' : f.code === '?' ? 'untracked' : 'unstaged' });
    });
    return out;
  }

  /* W-018 primary_active_context selection, in the fixed order the spec gives:
     explicit user selection, then the most recently state-changed running
     attempt, then a stable fallback. Never worktrees[0] by position. */
  function primaryContext(SC, selected) {
    var ws = (SC && SC.worktrees) || [];
    if (!ws.length) return null;
    var hit = null;
    if (selected) ws.forEach(function (w) { if (!hit && w.branch === selected) hit = w; });
    if (!hit) ws.forEach(function (w) { if (!hit && w.status === 'running') hit = w; });
    if (!hit) ws.forEach(function (w) { if (!hit && w.run) hit = w; });
    return hit || ws[0];
  }

  /* Every worktree that an active run owns. additional_active_context_count is
     this length minus one, and the +N escape is never dropped.

     THE FILTER IS ON LIFECYCLE, NOT ON `run`. Filtering on `run` was the
     defect audit-source 4.5 named: thread/ratings-schema still carries
     run '#39' and was RELEASED two weeks ago after merging cleanly into main,
     so a finished run was counting itself as a parallel active context; the
     orphaned checkout (run #44, directory gone) and the reserved lane (run
     #47, no checkout on disk yet) were counted the same way. +8 for a repo
     with four live lanes. `lifecycle: active` is the field
     WorktreeGitImprovement.md:L297 reserves for exactly this question, and
     `run` then distinguishes an ACTIVE CONTEXT (a run owns it now) from a
     merely active worktree a human is using. Both conditions, in that order:
     lane-a/b/c/d, so the strip reads +3 beside its primary. */
  function activeContexts(SC) {
    return ((SC && SC.worktrees) || []).filter(function (w) {
      return !!w.run && w.lifecycle === 'active';
    });
  }

  /* Does a conflict name this branch as one of its sides? conflicts[].sides[]
     labels are 'Ours - main' and 'Theirs - orch/lane-d-infra', so the branch
     the conflict is against is IN the data and the :L293 blocked/conflict
     indicator per active context can be derived rather than left blank. */
  function conflictOn(SC, branch) {
    var hit = false;
    ((SC && SC.conflicts) || []).forEach(function (c) {
      (c.sides || []).forEach(function (s) {
        if (String(s.label || '').split(' - ').pop() === branch) hit = true;
      });
    });
    return hit;
  }

  function wtLookup(SC) {
    var by = {};
    ((SC && SC.worktrees) || []).forEach(function (w) { by[w.branch] = w; });
    return by;
  }

  /* The fixture is a read-only singleton and every panel builder is already
     handed it; the two helpers that run BELOW a builder (a row, a gate) reach
     it here rather than threading a parameter through four call sites that do
     not otherwise need it. Never written to -- the fixture is shared with
     fourteen other version files. */
  function SRC() { return (global.PM_DATA && global.PM_DATA.source) || {}; }

  /* The lane the changed files actually belong to. project.branch is 'main' and
     'main' is NOT one of the 8 worktrees, so a design that assumes the working
     copy is worktrees[0] attributes 16 changed files to an orchestrator lane it
     has never touched. Resolve by branch, and synthesise the repo-root lane when
     no worktree claims it -- with path/owner ABSENT rather than invented, which
     is the metadata-degradation rule applied to a whole object. */
  function primaryLane(D) {
    var SC = D.source, p = D.project, hit = null;
    ((SC && SC.worktrees) || []).forEach(function (w) {
      if (!hit && w.branch === p.branch) hit = w;
    });
    if (hit) return hit;
    return {
      branch: p.branch, kind: 'root', owner: null, path: null, base: null,
      dirty: true, ahead: p.ahead, behind: p.behind, run: null,
      /* lifecycle is DECLARED null, not left off. The repo checkout is not a
         worktree, so it has no worktree lifecycle at all -- and an absent key
         reads the same as a key nobody thought about. lifecycleKv/lifecycleSay
         below say so out loud instead of borrowing the status word. */
      status: 'attention', lockedBy: null, lockReason: null,
      lifecycle: null, isRoot: true
    };
  }

  function lanesOf(D) {
    return [primaryLane(D)].concat(((D.source && D.source.worktrees) || []).filter(function (w) {
      return w.branch !== D.project.branch;
    }));
  }

  /* The +N drilldown. GI-005 forbids assuming a single repo context, so this
     lists EVERY active worktree with its run, branch, status and blocked mark
     -- it is not a summary. */
  /* :L293 requires the drilldown to carry run_id + node_id + attempt_id per
     context, its status, and a blocked/conflict indicator. All five are in the
     fixture now, so the hint carries the identity triple and the indicator
     word, and the head states the count it is a list of -- vA's drilldown head
     disagreeing with its own list is a defect this shape cannot have. */
  function contextMenuItems(SC, primary) {
    var live = activeContexts(SC);
    var items = [{ type: 'head', label: plural(live.length, 'active context') }];
    live.forEach(function (w) {
      var s = PMK.statusOf(w.status);
      var mark = w.status === 'blocked' ? 'blocked'
        : conflictOn(SC, w.branch) ? 'conflict' : s.word;
      items.push({
        value: 'ctx:' + w.branch,
        label: w.branch + (primary && w.branch === primary.branch ? '  primary' : ''),
        hint: (w.run || 'no run') + ' ' + (w.nodeId || 'no node') + ' ' +
              (w.attemptId || 'no attempt') + ' ' + mark
      });
    });
    return items;
  }

  function plusN(SC, primary) {
    var n = Math.max(0, activeContexts(SC).length - 1);
    if (!n) return '';
    return '<span class="pmk-menu" data-pm-menu>' +
      '<button type="button" class="xS1-plus pm-menu-trigger" ' +
      'data-pm-tip="Show every active context" ' +
      'aria-label="' + esc(n + ' parallel contexts') + '">+' + n + '</button>' +
      '<template data-pm-items>' + menuTemplate(contextMenuItems(SC, primary)) +
      '</template></span>';
  }

  /* The changed-file row, shared shape, per-variant classes. Two lines because
     the worst realistic identity is 61 characters and a tail-elided path loses
     the basename, which is the only part that identifies it. The full path is
     the accessible name. */
  function fileRow(pfx, item, st, b, o) {
    o = o || {};
    var f = item.f, group = item.group;
    var cf = group === 'conflict' ? conflictOf(SRC(), f.path) : null;
    var reserved = 14 + 4 + 24 + 4 + (o.lead ? 28 : 0) + (o.inline ? 28 : 0);
    var n = cap(st, reserved);
    /* A root-level file has no dirname, and a lone '.' in the dimmed line
       reads as a stray period rather than as a location (audit-source 4.11).
       Name the location instead; it is chrome, not fixture data. */
    var base = baseOf(f.path), dir = dirOf(f.path) || 'repository root';
    var word = CODE_WORD[f.code] || f.code;
    var aria = word + '. ' + f.path + '. plus ' + f.add + ' minus ' + f.del +
      (cf ? '. Conflict: ' + cf.conflict + ', ' +
            plural(cf.markersRemaining, 'marker') + ' remaining, unresolved'
          : f.conflict ? '. Conflict: ' + f.conflict : '') +
      (f.from ? '. Renamed from ' + f.from : '');

    var acts = [];
    conflictItems(cf).forEach(function (i) { acts.push(i); });
    acts.push({ value: 'diff_open', label: 'Open diff', hint: compareOf(group, cf) });
    acts.push(group === 'staged'
      ? { value: 'unstage_hunks', label: 'Unstage' }
      : { value: 'stage_hunks', label: 'Stage' });
    acts.push({ value: 'diff_set_compare_target', label: 'Set compare target' });
    acts.push({ type: 'sep' });
    acts.push({ value: 'discard_hunks', label: 'Discard changes', danger: true });
    if (f.from) acts.unshift({ type: 'head', label: 'Renamed from ' + baseOf(f.from) });

    var h = '<div class="pmk-row pmk-row--2line ' + pfx + '-file' +
      (o.selected ? ' is-sel' : '') + '" tabindex="0" role="button" ' +
      'data-pm-ctx="File actions" data-xs-kind="file" data-xs-scope="' + esc(f.path) + '"' +
      (o.data ? ' ' + o.data : '') +
      ' aria-label="' + esc(aria) + '">';
    if (o.lead) h += o.lead;
    h += '<span class="' + pfx + '-code" data-t="' + esc(CODE_TONE[f.code] || 'mod') + '" ' +
      'data-pm-tip="' + esc(word) + '" aria-hidden="true">' + esc(f.code) + '</span>' +
      '<span class="pmk-id-stack">' +
      '<span class="' + pfx + '-base">' + esc(elide(base, 'name', n)) + '</span>' +
      '<span class="' + pfx + '-dir">' + esc(elide(dir, 'path', Math.floor(n * 1.1))) + '</span>' +
      '</span>';
    if (o.inline) h += o.inline;
    h += PMK.overflow(acts, 'File actions');
    return h + '</div>';
  }

  function miniBtn(pfx, glyph, tip, extra) {
    return '<button type="button" class="' + pfx + '-mini" data-pm-tip="' + esc(tip) + '" ' +
      'aria-label="' + esc(tip) + '"' + (extra || '') + '>' + ic(glyph, 12) + '</button>';
  }

  /* W-014 lifecycle. WorktreeGitImprovement.md:L297 reserves five words --
     reserved | active | blocked_preserved | released | orphaned -- and the
     fixture carries lifecycle as its OWN field precisely because
     PM_DATA.status cannot express them: that vocabulary is shared across seven
     panels and blocked_preserved is meaningless in Docker or Search.

     All three variants used to render PMK.statusOf(w.status).word under a
     literal Lifecycle label, which is not an approximation of the lifecycle,
     it is a different fact under the wrong name. thread/ratings-schema is
     lifecycle released -- merged cleanly into main and retained for lineage
     -- and printed disabled, i.e. the panel said a successful merge was
     unavailable, in the visible text AND in the row's accessible name.

     The token renders VERBATIM. The fixture supplies no display label per
     lifecycle word, and these words are reserved exactly so they are not
     paraphrased, so inventing "Blocked, preserved" here would re-commit the
     original mistake in a politer font. Rendering a code verbatim is already
     this panel's convention two rows below: PMK.blocked prints lockReason as
     the pmk-blocked-code with the sentence beside it (source.md section 6).

     The status pill is NOT removed anywhere -- it is real data (the fixture
     declares status and lifecycle independently on every row) and it is the
     only channel that survives to 240px.

     ORDER AND ATTRIBUTION, which is the half of this defect that outlived the
     first fix. Rendering lifecycle correctly in the KV list closed the visible
     text but left every row's accessible name reading
     "thread/ratings-schema. Unavailable. Lifecycle released" -- status first,
     bare, and the correction trailing behind it. A screen-reader user still
     heard a cleanly merged worktree announced as broken, which is the exact
     sentence this finding is named for; the reader does not get to skip ahead
     to the clause that fixes it.

     So stateSay orders the clause lifecycle-then-status, and LABELS BOTH. The
     label is what stops the substitution from re-forming by ear: an unlabelled
     "Unavailable" sitting against a branch name is heard as a verdict on the
     worktree, while "Status Unavailable" is heard as the value of one named
     field beside "Lifecycle released", which is what the two of them are.
     Lifecycle leads because it is the reserved vocabulary and it is the field
     that governs which actions are legal.

     Every row aria-label in all three variants goes through stateSay. The
     three variants have separate row builders and the first fix drifted
     between them; a single clause builder is what keeps them from drifting
     again. Nothing else builds a worktree name. */
  function lifecycleSay(w) {
    if (w && w.lifecycle) return '. Lifecycle ' + w.lifecycle;
    if (w && w.isRoot) return '. No worktree lifecycle';
    return '';
  }

  /* The whole state clause for a row's accessible name: lifecycle, then
     status, both attributed. Callers pass the row and prepend the branch. */
  function stateSay(w) {
    return lifecycleSay(w) + '. Status ' + PMK.statusOf(w.status).label;
  }

  function lifecycleKv(w, b) {
    if (w && w.lifecycle) return PMK.kv('Lifecycle', w.lifecycle, 'token', b);
    /* The synthesised repo-root lane, and any future row the fixture ships
       without the field. Neither borrows the status word and neither vanishes:
       a dropped key is the 4.2 defect, and this design already knows how to
       say absent (Repo checkout, no worktree owner / No file list for this
       lane). Prose kind because the honest value is a phrase, not a token. */
    return PMK.kv('Lifecycle', w && w.isRoot ? 'no worktree lifecycle' : 'unresolved',
                  'prose', b);
  }

  /* ================================================== ACTION ENABLEMENT
     BLIND SPOT 9. WorktreeGitImprovement.md:L439 names FOUR flags as what
     drives action enablement -- locked, prunable, dirty, repairable -- and all
     four are now on all twelve rows. Every version, this one included, derived
     enablement from lockedBy alone, which is wrong in both directions:

       orch/lane-d-infra  lockedBy null, lifecycle active   -> Remove was OFFERED
       thread/exif-...    lockedBy null, checkout GONE      -> Open Files was OFFERED
       orch/lane-f-...    prunable false                    -> Request prune was OFFERED

     The lifecycle word is the fifth gate and the one with the sharpest rule:
     UI_Command_Catalog.md:L730 and WorktreeGitImprovement.md:L224 forbid manual
     prune / remove / reuse while a worktree is `active` or `blocked_preserved`
     unless an override policy allows it AND RECORDS the override. This panel
     has no override-recording surface, so it never offers the override -- it
     states the gate.

     wtGate returns null when a command is legal and { code, sentence } when it
     is not. The code is the FIXTURE'S OWN token wherever the fixture has one
     (lockReason, preservedReason, orphanReason); the three gates the fixture
     does not code -- lifecycle policy, prune policy, dirty tree -- get one
     stable token each, spelled in the same snake_case, and never a paraphrase
     of a reserved word. Ordered: ownership first, then policy, then state,
     because that is the order in which a user can do something about them. */
  var LIFECYCLE_GATED = { active: 1, blocked_preserved: 1 };

  /* One lock sentence PER REASON FAMILY, and the fixture's own sentence wins.
     audit-source 4.3: this file used to template one sentence and swap the
     noun, so `worktree_preserved_at_safe_point` rendered as "Owned by safe
     point sp-11 ... until the run releases it" -- a safe point is not an
     owner, owns nothing and releases nothing, and `Owner` is a reserved
     glossary term (:L299). The fixture supplies preservedSentence for both
     preserved families, which also keeps `Rebind` / `Start fresh` verbatim as
     W-019 reserves them; only the active-run family has no sentence of its
     own, so it is the only one templated here. */
  function lockSay(w) {
    if (w.preservedSentence) return w.preservedSentence;
    if (w.lockReason === 'worktree_owned_by_active_run') {
      return 'Owned by ' + w.lockedBy + ' while that run is live. Remove, prune and reuse ' +
        'unlock when the run releases it.';
    }
    return 'Held by ' + w.lockedBy + '.';
  }

  /* A branch that an owned worktree holds opens read-only. The clause is the
     family sentence plus the consequence, never the generic "owned by an
     active worktree" -- run #46 is STOPPED, and saying otherwise is the same
     collapse of three families into one that 4.3 is about. */
  function branchLockSay(w) {
    return lockSay(w) + ' The branch opens read-only while that hold stands.';
  }

  function wtGate(w, cmd) {
    if (!w) return null;
    if (cmd === 'recover') {
      return w.repairable ? null : {
        code: 'worktree_not_repairable',
        sentence: 'The checkout is present and its lineage resolves, so there is nothing to recover.'
      };
    }
    if (cmd === 'unlock') {
      return w.locked ? null
        : { code: 'worktree_not_locked', sentence: 'Nothing holds this worktree.' };
    }
    if (cmd === 'lock') {
      return w.locked ? { code: w.lockReason || 'worktree_already_locked', sentence: lockSay(w) } : null;
    }
    if (cmd === 'release') {
      return w.lifecycle === 'released'
        ? { code: 'worktree_already_released',
            sentence: w.releasedSentence || 'This worktree was already released.' }
        : null;
    }
    /* remove | prune | request_prune | reuse */
    if (w.locked) return { code: w.lockReason || 'worktree_owned_by_active_run', sentence: lockSay(w) };
    if (LIFECYCLE_GATED[w.lifecycle]) {
      return {
        code: w.preservedReason || 'manual_change_forbidden_by_lifecycle',
        sentence: w.preservedSentence ||
          ('Manual remove, prune and reuse are forbidden while lifecycle is ' + w.lifecycle +
           '. An override policy would have to allow it and record the override.')
      };
    }
    if (!w.prunable && cmd !== 'reuse') {
      return { code: 'prune_policy_denies',
               sentence: 'prunable is false on this worktree, so the prune policy does not release it.' };
    }
    if (w.dirty && (cmd === 'remove' || cmd === 'reuse')) {
      return { code: 'worktree_dirty',
               sentence: 'Uncommitted changes are still in this checkout; remove and reuse need a clean worktree.' };
    }
    return null;
  }

  /* Open / Open Files need a checkout that EXISTS. Two rows fail that and for
     two different reasons: the reserved lane has never had one (path null) and
     the orphaned thread's has been deleted underneath it (path present,
     directory missing). Both sentences are the fixture's. */
  function pathGate(w) {
    if (!w) return null;
    /* The synthesised repo-root lane obviously HAS a checkout; what it has no
       path for is that W-018 ships repo_root and this fixture does not carry
       it. Not the same absence, so not the same gate. */
    if (w.isRoot) return null;
    if (!w.path) {
      return { code: 'worktree_path_unresolvable',
               sentence: w.reservedSentence || 'No checkout exists on disk.' };
    }
    if (w.lifecycle === 'orphaned') {
      return { code: w.orphanReason || 'worktree_directory_missing',
               sentence: w.orphanSentence || 'The checkout is gone from disk.' };
    }
    return null;
  }

  function gateItem(w, cmd, value, label, danger) {
    var g = wtGate(w, cmd);
    return { value: value, label: label, danger: !!danger, disabled: !!g,
             reason: g ? g.code : '', sentence: g ? g.sentence : '' };
  }

  /* Row actions for a worktree. Every command UI_Command_Catalog.md:L708-725
     lists is present on every row and disabled with its reason rather than
     hidden (:L439, and `show-unsafe-actions` may reveal but must not enable).
     The reason rides the item, so pm-menu renders a visible reason line and
     wires aria-describedby -- never a native title. */
  function wtActions(w) {
    var pg = pathGate(w);
    function opener(value, label) {
      return { value: value, label: label, disabled: !!pg,
               reason: pg ? pg.code : '', sentence: pg ? pg.sentence : '' };
    }
    return [
      opener('worktree.open', 'Open'),
      opener('worktree.open_files', 'Open Files'),
      { value: 'worktree.compare', label: 'Compare' },
      { value: 'open_review', label: 'Open Review Mode' },
      { value: 'worktree.focus_lineage', label: 'Focus lineage' },
      { value: w.kind === 'orch' ? 'worktree.open_lane' : 'worktree.open_thread',
        label: w.kind === 'orch' ? 'Open Lane' : 'Open Thread' },
      { type: 'sep' },
      gateItem(w, 'recover', 'worktree.recover', 'Recover'),
      gateItem(w, 'lock', 'worktree.lock', 'Lock'),
      gateItem(w, 'unlock', 'worktree.unlock', 'Unlock'),
      gateItem(w, 'reuse', 'worktree.reuse', 'Reuse'),
      gateItem(w, 'release', 'worktree.release', 'Release'),
      gateItem(w, 'request_prune', 'worktree.request_prune', 'Request prune'),
      gateItem(w, 'prune', 'worktree.prune', 'Prune', true),
      gateItem(w, 'remove', 'worktree.remove', 'Remove', true)
    ];
  }

  /* W-019: the reason-family code renders verbatim, the family's OWN sentence,
     and the ordered allowed actions as REAL buttons carrying their command ids
     (PMK.blocked stamps data-pm-action, which is what routes them through the
     confirmation gate below). The fixture carries no allowed_action_ids for
     worktrees, so the nouns come from research/source.md section 6 -- Remove,
     Prune, Reuse, Release, Recover and Request prune are reserved and are not
     synonymised.

     Which actions each family offers is DERIVED, not fixed: an action the
     gates forbid is not offered as the way out of the state that forbids it.
     That is the audit's "Request prune on a prunable:false row" finding, and
     it is why the safe-point row offers Release -- the fixture's own sentence
     for it says "Rebind or release it". */
  function stateBlock(w) {
    if (!w) return '';
    var open = { id: w.kind === 'orch' ? 'worktree.open_lane' : 'worktree.open_thread',
                 label: w.kind === 'orch' ? 'Open Lane' : 'Open Thread' };
    var lineage = { id: 'worktree.focus_lineage', label: 'Focus lineage' };
    var acts;

    /* Orphaned is a FAULT, and it is the state every version rendered as
       healthy: path printed, dirty reported, Open Files offered, on a
       directory that is gone (audit-source 4.4). Warning severity, not
       blocked: the lineage is still resolvable and there is a route out. */
    if (w.lifecycle === 'orphaned') {
      acts = [{ id: 'worktree.recover', label: 'Recover' }, lineage];
      if (!wtGate(w, 'prune')) acts.push({ id: 'worktree.prune', label: 'Prune' });
      return PMK.blocked({
        code: w.orphanReason || 'worktree_directory_missing',
        severity: 'warning',
        sentence: w.orphanSentence || '',
        actions: acts
      });
    }
    if (w.lockedBy) {
      var preserved = w.lifecycle === 'blocked_preserved';
      acts = preserved
        ? [{ id: 'worktree.release', label: 'Release' }, lineage, open]
        : [open, lineage];
      if (!wtGate(w, 'request_prune')) acts.push({ id: 'worktree.request_prune', label: 'Request prune' });
      return PMK.blocked({
        code: w.lockReason || 'worktree_owned_by_active_run',
        severity: preserved ? 'blocked' : 'warning',
        sentence: lockSay(w),
        actions: acts
      }, w.status === 'blocked' ? 'err' : '');
    }
    return '';
  }

  /* reserved and released are NOT faults and must not be drawn as one --
     released means "merged cleanly into main and retained for lineage", and
     this panel's own worst historical defect was announcing that worktree as
     unavailable. They get a plain note carrying the fixture's sentence, and
     the fixture ships no reason code for either, so none is invented. */
  function stateNote(w) {
    if (!w) return '';
    if (w.lifecycle === 'reserved' && w.reservedSentence) {
      return '<span class="pmk-note">' + esc(w.reservedSentence) + '</span>';
    }
    if (w.lifecycle === 'released' && w.releasedSentence) {
      return '<span class="pmk-note">' + esc(w.releasedSentence) + '</span>';
    }
    return '';
  }

  /* The expanded worktree detail, one builder for all three variants. The
     three used to have three copies of this and the first lifecycle fix
     drifted between them; GitHub_Integration.md:L160's Path / Base / Age
     triple and W-014's owner / lane / run / lifecycle / blocked state are
     assembled once or they will drift again. */
  function wtKvs(w, b, st) {
    var h = '';
    h += PMK.kv('Owner', w.owner || (w.isRoot ? 'Repo checkout, no worktree owner' : 'unresolved'),
                'prose', b);
    if (w.laneId) h += PMK.kv('Lane', w.laneId, 'token', b);
    if (w.run) h += PMK.kv('Owner run', w.run, 'token', b);
    if (w.nodeId || w.attemptId) {
      h += PMK.kv('Node / attempt', (w.nodeId || 'none') + ' / ' + (w.attemptId || 'none'), 'token', b);
    }
    h += w.path
      ? PMK.kv('Path', elide(w.path, 'path', cap(st, 24)), 'measure', b)
      /* audit-source 4.2: a null path used to make the key VANISH, so a lane
         with no checkout read as a normal worktree missing one field. */
      : PMK.kv('Path', w.isRoot ? 'repository root, not carried by this projection'
                                : 'no checkout on disk', 'prose', b);
    if (w.reservedFor) h += PMK.kv('Reserved for', w.reservedFor, 'token', b);
    if (w.base) h += PMK.kv('Base branch', w.base, 'token', b);
    if (w.mergedInto) h += PMK.kv('Merged into', w.mergedInto + ' ' + (w.releasedAt || '') + ' ago', 'measure', b);
    h += PMK.kv('Ahead', String(w.ahead), 'token', b);
    /* Age: on all twelve rows since the fixture was extended, rendered by no
       version but the baseline, which fabricates it. */
    if (w.age) h += PMK.kv('Age', w.age, 'token', b);
    h += lifecycleKv(w, b);
    h += PMK.kv('Flags', flagWords(w), 'prose', b);
    return h;
  }

  /* The four :L439 flags, literally. Not chips: PMK.chip caps at 72px, which
     ellipsizes `repairable` and mangles `blocked_preserved` -- truncating a
     reserved word is worse than spending one more KV row on it. */
  function flagWords(w) {
    var out = [];
    if (w.locked) out.push('locked');
    if (w.prunable) out.push('prunable');
    if (w.dirty) out.push('dirty');
    if (w.repairable) out.push('repairable');
    return out.length ? out.join(', ') : 'none set';
  }

  /* A disabled action button that ANNOUNCES its reason without an id.
     aria-describedby would need one, and static ids are banned across six
     versions, so the reason rides the accessible name instead. The same reason
     is also rendered visibly by stateBlock() next to it, which is the contract
     GI-017 / :L439 actually require. Enabled buttons carry their command id so
     the confirmation gate can reach them. */
  function denyBtn(label, code, sentence, danger) {
    return '<button type="button" class="pmk-btn' + (danger ? ' pmk-btn--danger' : '') +
      '" aria-disabled="true" aria-label="' +
      esc(label + '. Unavailable: ' + code + '. ' + sentence) + '">' + esc(label) + '</button>';
  }

  function gatedBtn(label, w, cmd, danger) {
    var g = wtGate(w, cmd);
    if (!g) return actBtn(label, 'worktree.' + cmd, { danger: danger });
    return denyBtn(label, g.code, g.sentence, danger);
  }

  /* PMK.btn with a command id attached. The kit's button takes no id slot and
     the kit is shared with fourteen other files, so this file writes the one
     button shape it needs -- same class, same 24px floor, plus the hook the
     confirmation gate routes on. gatedBtn already hand-rolled a .pmk-btn for
     the same reason. */
  function actBtn(label, act, opts) {
    opts = opts || {};
    return '<button type="button" class="pmk-btn' +
      (opts.primary ? ' pmk-btn--primary' : '') + (opts.danger ? ' pmk-btn--danger' : '') + '"' +
      ' data-xs-act="' + esc(act) + '"' +
      (opts.tip ? ' data-pm-tip="' + esc(opts.tip) + '"' : '') +
      '>' + esc(label) + '</button>';
  }

  /* =====================================================================
     THE CONFIRMATION GATE
     ---------------------------------------------------------------------
     BLIND SPOT 20. GitHub_Integration.md:L156 requires that `strong` actions
     -- anything that discards local state, removes worktrees, revokes
     accepted state, or materially changes live execution -- "show scope,
     consequence, and confirmation boundaries before execution". research/
     source.md section 3 marks six commands DESTRUCTIVE + confirm and two more
     approval-gated. This file shipped every one of them as a one-click menu
     item with a red flag and no gate.

     The component already existed. _pm-components.js:498 defines PM.confirm --
     a modal sheet with a scrim, role="dialog", aria-modal, focus capture and
     no auto-close, documented at :9 as "replaces confirm()" -- wired, themed
     off the stage, and called by ZERO versions. The first audit pass reported
     that no such component existed; it was wrong, and this is the correction.
     Nothing here is new code: it is a table of sentences and one router.

     WHAT A GATE OWES, and each one says all three:
       scope        the exact object, named, with the state that makes it that
                    object (lifecycle, churn, marker count, outgoing count)
       consequence  what is gone afterwards, in the affirmative -- "the edits
                    are deleted", not "this cannot be undone"
       boundary     which button does it, labelled with the verb, danger-toned,
                    with Cancel first in the DOM and Escape wired

     WHAT THIS DEMO DOES ON OK: nothing. The fixture is a read-only singleton
     shared with fourteen other version files, so a confirmed Discard cannot
     delete anything, exactly as every other button in this bakeoff performs
     nothing. The two exceptions are xS3's review marks, which are this file's
     own state, and they DO apply -- so the one gate whose subject is local is
     also the one you can watch work.

     WHAT IS NOT GATED, deliberately: Stage, Unstage, Switch branch, Commit,
     Apply stash, Mark reviewed, Lock, and every open_* pivot. A gate on a
     reversible action is a gate the user learns to click through, which is how
     the gates on the six that matter stop working. */

  function fileScope(SC, path) {
    var hit = null;
    ((SC && SC.staged) || []).forEach(function (f) {
      if (!hit && f.path === path) hit = { f: f, group: 'staged' };
    });
    ((SC && SC.unstaged) || []).forEach(function (f) {
      if (!hit && f.path === path) {
        hit = { f: f, group: f.code === 'U' ? 'conflict' : f.code === '?' ? 'untracked' : 'unstaged' };
      }
    });
    return hit;
  }

  function stashScope(SC, label) {
    var hit = null;
    ((SC && SC.stash) || []).forEach(function (s) { if (!hit && s.label === label) hit = s; });
    return hit;
  }

  function wtSay(w) {
    return 'worktree ' + w.branch + ', lifecycle ' + (w.lifecycle || 'unresolved') +
      ', ' + (w.path ? 'checkout ' + w.path : 'no checkout on disk') +
      ', owner ' + (w.owner || 'unresolved') + (w.run ? ', run ' + w.run : '') +
      ', flags ' + flagWords(w);
  }

  /* act -> confirmation sheet, or null when the action is not `strong`.
     `key` is the row identity the click came from (a path, a branch, a stash
     label); everything else is looked up in the fixture so the sentence
     cannot drift from what the row rendered. */
  function gateDef(act, key) {
    var SC = SRC(), D = global.PM_DATA || {};
    var cut = act.indexOf(':');
    var head = cut < 0 ? act : act.slice(0, cut);
    /* An action id may carry its own subject after the colon. Rows carry
       data-xs-scope and need no argument; a PANEL-LEVEL banner names one
       worktree and sits outside every row, so it says which one in the id
       rather than growing a wrapper element to hold the attribute. */
    var arg = cut < 0 ? '' : act.slice(cut + 1);
    var w = wtLookup(SC)[arg || key];

    if (head === 'discard_hunks') {
      var fs = fileScope(SC, key);
      if (!fs) return null;
      return {
        title: 'Discard changes in ' + baseOf(key),
        body: 'Scope: one file, ' + key + ', ' +
          (CODE_WORD[fs.f.code] || fs.f.code).toLowerCase() + ', plus ' + fs.f.add +
          ' minus ' + fs.f.del + ', compared ' + compareOf(fs.group, conflictOf(SC, key)) +
          '. Consequence: those working-tree edits are deleted. They are not committed, ' +
          'not stashed, and no other copy of them exists.',
        confirmLabel: 'Discard changes', danger: true
      };
    }
    if (head === 'resolve_conflict_side') {
      var bits = act.split(':'), sideId = bits[1], path = bits.slice(2).join(':');
      var cf = conflictOf(SC, path);
      if (!cf) return null;
      var mine = null, other = null;
      (cf.sides || []).forEach(function (s) { if (s.id === sideId) mine = s; else other = s; });
      if (!mine) return null;
      return {
        title: 'Resolve using ' + mine.label,
        body: 'Scope: ' + path + ', ' + cf.conflict + ', ' + plural(cf.hunks, 'hunk') + ', ' +
          plural(cf.markersRemaining, 'marker') + ' remaining, unresolved. Consequence: ' +
          mine.label + ' (plus ' + mine.add + ' minus ' + mine.del + ') is written into every ' +
          'hunk and ' + (other ? other.label + ' (plus ' + other.add + ' minus ' + other.del + ')' : 'the other side') +
          ' is dropped. The projection prefers neither side; this choice is yours and it is recorded as yours.',
        confirmLabel: 'Resolve using ' + (mine.id === 'ours' ? 'ours' : 'theirs'), danger: true
      };
    }
    if (head === 'conflict_apply_resolution') {
      var cp = act.split(':').slice(1).join(':');
      var cf2 = conflictOf(SC, cp);
      if (!cf2) return null;
      return {
        title: 'Apply resolution per hunk',
        body: 'Scope: ' + cp + ', ' + plural(cf2.hunks, 'hunk') + ', ' +
          plural(cf2.markersRemaining, 'marker') + ' remaining. Consequence: each hunk you apply ' +
          'rewrites that region of the file and keeps its conflict id as evidence. The file is ' +
          'not marked resolved until no markers remain.',
        confirmLabel: 'Apply per hunk'
      };
    }
    if (head === 'stash.drop' || head === 'stash.pop') {
      var sx = stashScope(SC, key);
      var isDrop = head === 'stash.drop';
      return {
        title: isDrop ? 'Drop this stash' : 'Pop this stash',
        body: 'Scope: ' + (sx ? sx.label + ', stashed ' + sx.when + ' ago' : 'one stash entry') +
          '. Consequence: ' + (isDrop
            ? 'the entry and the changes it holds are deleted. Nothing else holds this work.'
            : 'the changes are applied to the working tree and the entry is removed from the stash list.'),
        confirmLabel: isDrop ? 'Drop stash' : 'Pop stash', danger: isDrop
      };
    }
    if (head === 'push' || head === 'commit_push') {
      var r = repoOf(D), out = (SC.remote && SC.remote.outgoing) || 0;
      var staged = (SC.counts && SC.counts.staged) || 0;
      return {
        title: head === 'push' ? 'Push to ' + (r ? r.host : 'the remote') : 'Commit and push',
        body: 'Scope: branch ' + D.project.branch + ' to ' +
          (r ? r.nameWithOwner + ' on ' + r.host + ' (' + r.remote + '), visibility ' + r.visibility
             : 'the configured remote') + ', ' + plural(out, 'outgoing commit') +
          (head === 'commit_push' ? ' plus a new commit of ' + plural(staged, 'staged file') : '') +
          '. Consequence: this leaves the machine. Everyone with access to the repository can read ' +
          'it, and a published commit cannot be unpublished, only reverted.',
        confirmLabel: head === 'push' ? 'Push' : 'Commit and push'
      };
    }
    if (head === 'reset_review' || head === 'mark_all_reviewed') {
      var q = queueOf(SC), rv = s3Reviewed(SC);
      var doneN = q.filter(function (it) { return !!rv[it.f.path]; }).length;
      var clearing = head === 'reset_review';
      return {
        title: clearing ? 'Clear every review mark' : 'Mark all files reviewed',
        body: 'Scope: ' + plural(q.length, 'file') + ' in this queue, ' + doneN + ' marked reviewed. ' +
          'Consequence: ' + (clearing
            ? 'all ' + doneN + ' marks are cleared and the queue restarts from nothing reviewed.'
            : 'all ' + q.length + ' are marked reviewed at once, so the queue can no longer tell you ' +
              'which files you actually opened.') +
          ' Review marks are this panel’s state, not git state.',
        confirmLabel: clearing ? 'Clear marks' : 'Mark all reviewed', danger: clearing
      };
    }
    if (!w) return null;
    if (head === 'worktree.remove') {
      return {
        title: 'Remove ' + w.branch,
        body: 'Scope: ' + wtSay(w) + '. Consequence: the checkout is deleted from disk. The branch ' +
          'and the lineage records survive; anything uncommitted inside that directory does not.',
        confirmLabel: 'Remove worktree', danger: true
      };
    }
    if (head === 'worktree.prune') {
      return {
        title: 'Prune ' + w.branch,
        body: 'Scope: ' + wtSay(w) + '. Consequence: the worktree registration is dropped and its ' +
          'directory is removed. Lineage stays resolvable; the checkout does not come back.',
        confirmLabel: 'Prune worktree', danger: true
      };
    }
    if (head === 'worktree.request_prune') {
      return {
        title: 'Request prune of ' + w.branch,
        body: 'Scope: ' + wtSay(w) + '. Consequence: nothing is pruned now. This files an approval ' +
          'request against the prune policy and the worktree stays exactly as it is until the ' +
          'request is granted.',
        confirmLabel: 'Request prune'
      };
    }
    if (head === 'worktree.reuse') {
      return {
        title: 'Reuse ' + w.branch,
        body: 'Scope: ' + wtSay(w) + '. Consequence: ownership moves to your current context. ' +
          'Whatever owned it stops owning it, and any work in progress there is now yours to finish.',
        confirmLabel: 'Reuse worktree'
      };
    }
    if (head === 'worktree.release') {
      return {
        title: 'Release ' + w.branch,
        body: 'Scope: ' + wtSay(w) + '. Consequence: the ownership record is released, which is what ' +
          'makes prune and reuse legal on it afterwards. The checkout and its lineage are kept.',
        confirmLabel: 'Release worktree'
      };
    }
    if (head === 'worktree.recover') {
      return {
        title: 'Recover ' + w.branch,
        body: 'Scope: ' + wtSay(w) + (w.orphanSentence ? '. ' + w.orphanSentence : '') +
          ' Consequence: the checkout is rebuilt from the lineage record. If the owning run, node ' +
          'or attempt cannot be resolved, the worktree is kept and marked unknown ownership rather ' +
          'than guessed.',
        confirmLabel: 'Recover worktree'
      };
    }
    if (head === 'worktree.unlock') {
      return {
        title: 'Unlock ' + w.branch,
        body: 'Scope: ' + wtSay(w) + '. Consequence: the hold is removed while ' +
          (w.lockedBy || 'its owner') + ' may still be working in it, and remove, prune and reuse ' +
          'stop being gated by that hold.',
        confirmLabel: 'Unlock worktree', danger: true
      };
    }
    return null;
  }

  /* One router. Returns a promise so every call site reads the same whether or
     not the action was strong; PM.confirm resolves false on Cancel, Escape and
     scrim click, and never auto-closes. */
  function gate(act, node) {
    var def = null;
    try { def = gateDef(act, keyOf(node)); } catch (e) { def = null; }
    if (!def || !global.PM || !global.PM.confirm) return Promise.resolve(!def);
    def.from = node;
    return global.PM.confirm(def);
  }

  /* The row identity a click came from. data-xs-scope is this file's hook and
     data-pm-key is the kit's -- PMK.row stamps it with the UN-elided identity,
     which is exactly what a confirmation has to name (the visible text may be
     a computed ellipsis). */
  function keyOf(node) {
    var h = node && node.closest ? node.closest('[data-xs-scope],[data-pm-key]') : null;
    if (!h) return '';
    return h.getAttribute('data-xs-scope') || h.getAttribute('data-pm-key') || '';
  }

  /* Open / Open Files on a checkout that is not there. Same announcement
     contract as gatedBtn: the reason rides the accessible name and the same
     sentence is rendered visibly by stateBlock / stateNote beside it. */
  function pathBtn(label, w, act, primary) {
    var pg = pathGate(w);
    return pg ? denyBtn(label, pg.code, pg.sentence) : actBtn(label, act, { primary: primary });
  }

  function stageOf(node, ver) {
    var s = node && node.closest ? node.closest('.pm-stage') : null;
    return s && s.getAttribute('data-pm-version') === ver ? s : null;
  }

  /* Rebuild the config FROM THE STAGE, not from PM_BAKEOFF.state. The shell's
     own comment records that passing the control-bar state during a sweep
     measured markup built for the wrong bucket; a repaint has exactly the same
     hazard, and a contact sheet has eight stages at eight themes at once. */
  function cfgOf(stage) {
    var w = parseInt(stage.style.getPropertyValue('--files-panel-w'), 10);
    return {
      version: stage.getAttribute('data-pm-version'),
      panel: stage.getAttribute('data-pm-panel'),
      theme: stage.getAttribute('data-theme') || 'glass-dark',
      width: w > 0 ? w : 380,
      density: stage.getAttribute('data-density') || 'comfortable',
      motion: stage.getAttribute('data-motion') || 'full'
    };
  }

  /* =====================================================================
     MOTION — the shared layer only, nothing local
     ---------------------------------------------------------------------
     These three variants use four of the six PMM primitives and invent none:

       .pmm-expand   xS1. Every section body and every worktree detail. xS1 is
                     the only variant whose interactions are DOM toggles rather
                     than repaints, so the accordion is its whole motion story.
       .pmm-frame    xS2 focus-region swap on a lane change and view body swap
                     on a lens change; xS3 push-to-detail below 480 and the
                     detail-column swap at 480. PMM.push, direction from list
                     order, exactly as vD reads it.
       .pmm-enter    the two places a list is genuinely REPLACED rather than
                     re-rendered with a new highlight: xS1 first paint (it never
                     repaints, so the class can live in the markup) and the two
                     filter changes that swap the whole list for a different
                     one. Never on a selection change -- re-running a 16-row
                     cascade because one row got a background is the "long
                     cascade" the brief forbids, and it delays reading data that
                     did not change.
       .pmm-flash    xS3 only, on the review meter, when a mark flips a segment.

     Durations, easings, travel and stagger are all the theme's --pmm-* knobs.
     Nothing here reads data-theme and nothing here declares a keyframe.
     Reduced motion is handled centrally: PMM.* no-ops (except lens, which must
     still POSITION), and _pm-motion.css kills the rules under both
     [data-motion="reduced"] and prefers-reduced-motion. The one thing this file
     owns is that every outcome is still correct with the motion gone -- see
     xExpand, which re-applies the real [hidden] once a collapse has finished so
     a closed section leaves the tab order whether it animated or not. */

  /* Section / detail open-close. The markup keeps [hidden] as the resting
     closed state, and .pmm-expand is applied only while a box is actually
     moving. That is deliberate: the fit rig measures freshly built markup with
     animations and transitions killed, so a grid-template-rows box that is
     "closed" would expose a zero-height-but-laid-out subtree that [hidden]
     currently removes from measurement entirely. Motion that only exists after
     a click cannot move a number in a sweep that never clicks. */
  var SETTLE_MS = 600;
  function xExpand(box, open, fade) {
    if (!box) return;
    var PMM = global.PMM;
    if (!PMM) {
      if (open) box.removeAttribute('hidden'); else box.setAttribute('hidden', '');
      return;
    }
    var still = PMM.reduced(box);
    if (open) {
      /* .pmm-expand first (still hidden, so nothing paints), then unhide at
         0fr, then ONE forced flush so the browser has a "closed" style to
         transition from, then .is-open. Without the flush the box would resolve
         straight to 1fr and there would be nothing to animate. */
      box.classList.add('pmm-expand');
      if (fade) box.classList.add('pmm-expand--fade');
      box.removeAttribute('hidden');
      if (!still) void box.offsetWidth;
      PMM.expand(box, true);
      return;
    }
    if (still) {
      box.setAttribute('hidden', '');
      box.classList.remove('pmm-expand', 'pmm-expand--fade', 'is-open', 'pmm-settled');
      return;
    }
    /* A section that SHIPPED open is closing out of pristine markup and has no
       .pmm-expand to collapse from, so the first close of Changes, In commit,
       Not in commit and Worktrees would snap while every later one animated.
       Adopt the open state -- settled, so releasing the clip changes nothing
       visible -- and flush once, which gives the transition a 1fr start. */
    if (!box.classList.contains('pmm-expand')) {
      box.classList.add('pmm-expand', 'is-open', 'pmm-settled');
      if (fade) box.classList.add('pmm-expand--fade');
      void box.offsetWidth;
    }
    PMM.expand(box, false);
    var shut = function (e) {
      if (e && (e.target !== box || e.propertyName !== 'grid-template-rows')) return;
      box.removeEventListener('transitionend', shut);
      /* re-opened while it was collapsing: leave it alone */
      if (box.classList.contains('is-open')) return;
      box.setAttribute('hidden', '');
      box.classList.remove('pmm-expand', 'pmm-expand--fade');
    };
    box.addEventListener('transitionend', shut);
    /* a detached box runs no transition and so fires no event */
    global.setTimeout(function () { shut(null); }, SETTLE_MS);
  }

  /* ---------------------------------------------------------- lens travel
     Every lens click in xS2 and xS3 is a full repaint, so the indicator the
     kit would slide is destroyed before it can move. Snapshot its geometry off
     the OLD strip, seed the NEW strip with those two custom properties before
     PMM.lens creates the indicator, and PMM.lens's own measurement is then a
     move from where the mark actually was to where it now belongs.

     Cost: two extra getBoundingClientRect calls per selection change, on top of
     the two PMM.lens already takes. No loop, no observer, no rAF.

     If there is nothing to snapshot -- a strip that collapsed to a portaled
     picker at bucket 0, or a first paint -- this does nothing at all and the
     kit's static ::after underline stays in charge. That is also why no version
     markup carries .pmm-lens-track: adding it would suppress the static mark on
     a stage that no JS has touched, including every stage the fit rig builds. */
  var LENS_HOOKS = ['data-xs2-lens', 'data-xs2-filter', 'data-xs3-lens'];

  function lensTrack(view, hook) {
    var wrap = view && view.querySelector('[' + hook + ']');
    return wrap ? wrap.querySelector('.pmk-lenses') : null;
  }

  function lensSnap(view) {
    var out = {};
    if (!view || !global.PMM) return out;
    LENS_HOOKS.forEach(function (hook) {
      var track = lensTrack(view, hook);
      var act = track && track.querySelector('.pmk-lens[aria-selected="true"]');
      if (!act) return;
      var a = act.getBoundingClientRect(), t = track.getBoundingClientRect();
      if (!a.width || !t.width) return;
      out[hook] = {
        x: Math.round((a.left - t.left) + (track.scrollLeft || 0)),
        w: Math.round(a.width)
      };
    });
    return out;
  }

  function lensPlay(view, snap) {
    if (!view || !snap || !global.PMM) return;
    LENS_HOOKS.forEach(function (hook) {
      var s = snap[hook];
      if (!s) return;
      var track = lensTrack(view, hook);
      if (!track) return;
      track.classList.add('pmm-lens-track');
      track.style.setProperty('--pmm-lens-x', s.x + 'px');
      track.style.setProperty('--pmm-lens-w', s.w + 'px');
      global.PMM.lens(track);
    });
  }

  /* Thin, total wrappers so every call site can be a one-liner that survives a
     missing motion layer or a node the repaint already replaced. PMM's own
     helpers are total too; these only add the "is PMM loaded" guard, because a
     version file must still work if the page is opened without it. */
  function push(el, dir) { if (el && global.PMM) global.PMM.push(el, dir); }
  function enter(el) { if (el && global.PMM) global.PMM.enter(el); }
  function flash(el, tone) { if (el && global.PMM) global.PMM.flash(el, tone); }

  /* Index of a node among its element siblings, for a push direction that
     matches the list the user is looking at. */
  function sibIndex(el) {
    return el && el.parentNode
      ? Array.prototype.indexOf.call(el.parentNode.children, el) : -1;
  }
  function dirOfMove(from, to) {
    return (from >= 0 && to >= 0 && to < from) ? 'back' : 'fwd';
  }

  /* repaint keeps its contract -- rebuild from THIS stage's config -- and gains
     one before/after pair: the lens snapshot, and an optional callback that
     runs once the new markup is mounted, which is where every PMM.push and
     PMM.enter in this file is issued. */
  function repaint(stage, fn, after) {
    if (!stage || stage.getAttribute('data-pm-panel') !== 'source') return;
    var view = stage.querySelector('[data-pm-panelview]');
    if (!view) return;
    var snap = lensSnap(view);
    view.innerHTML = fn(global.PM_DATA, cfgOf(stage));
    if (global.PM && global.PM.mountAll) global.PM.mountAll(view);
    lensPlay(view, snap);
    if (after) after(view);
  }

  function lensWrap(attr, ids, items, active, b, label) {
    return '<span ' + attr + ' data-ids="' + esc(ids.join(',')) + '" ' +
      'style="display:flex;flex:1 1 auto;min-width:0">' +
      PMK.lenses(items, active, b, label) + '</span>';
  }

  /* =====================================================================
     xS1 — COMMIT DESK
     ---------------------------------------------------------------------
     THESIS
     The panel's product is the next commit, so the composer is the MASTHEAD,
     not the footer. Every other system in this bakeoff docks the composer at
     the bottom of a Changes region, which makes it the last thing you reach
     and the first thing that leaves the viewport when a section expands above
     it. Invert it: the message field, the payload count and the Commit button
     sit directly under the context strip and never move, and everything below
     is graded by one question -- is it in this commit or not. The three change
     groups are literally labelled IN COMMIT / NOT IN COMMIT / CONFLICTS, and
     the four remaining canonical views hang below them in canonical order.

     This is the cheapest possible answer to "the composer must stay reachable
     while reviewing changes": it is above the scroller, so it is reachable at
     every scroll position and at every section-expansion state, with no pinned
     footer, no sticky trickery and no second scroll container.

     STRUCTURE (two scroll levels exactly, per GI-004:L160)
       head            SOURCE CONTROL, changed count, panel overflow
       strip           W-018: status mark, branch picker, numerals, +N
       desk            message, payload line, Commit + Generate + overflow
       banner          blocked worktree, reason family + real buttons
       body (scroller) CHANGES > 3 group headers > rows,
                       then HISTORY / GRAPH / WORKTREES / BRANCHES + STASH
     No card wrapper anywhere. Group headers are sticky inside the ONE
     scroller, which is what kills the accordion > card > row nest that makes
     the current panel look like overlapping boxes.

     WIDTH LADDER (bucket = PM_DATA.bucket(px), never a continuum)
                     240 (0)         320 (1)        380 (2)         480 (3)
     strip           mark, branch,   + numerals     + words         + ahead
                     numerals, +N        as words
     desk            1-line field,   + payload      3-line field    + Generate
                     Commit + more     line         + Generate        inline
     file rows       code + 2 lines  + inline       + inline        + inline
                     + overflow        stage btn      stage btn       stage btn
     worktree rows   branch + status + owner on     + run and       + path meta
                     only, owner in    line 2         base meta
                     row detail
     sections open   Changes only    Changes,       Changes,        all but
                                     Worktrees      Worktrees       Graph

     THE GI-020 ANSWER
     At 240px the compact worktree row is glyph + branch + chevron + status and
     nothing else; the owner label moves into the row's own expanded detail,
     which is a SIBLING div, not a nested card, so the two-level scroll model
     survives. At 280px and up the owner is line 2 of the row. That is the
     literal reading of GitHub_Integration.md:L160 rather than a compromise.

     SLINT MAPPING
     VerticalLayout { head; strip; desk; if blocked: banner; Flickable { ... } }
     Sections are a VecModel<Section{ id, label, count, open }> and each body is
     a conditional sub-model; the toggle is section.open = !section.open with
     accessible-role: button and accessible-expanded bound to it. The desk is a
     plain non-scrolling child of the same VerticalLayout, so "pinned" needs no
     sticky positioning to port. Bucket is an int computed once in Rust.

     MOTION
     .pmm-expand on every section body and every worktree detail, and .pmm-enter
     on every file / commit / branch list. Nothing else moves, and in particular
     the MASTHEAD NEVER MOVES: the whole thesis is that the composer is the one
     thing that stays put while lists open and close under it, so animating it
     would be arguing against the design. That is also why the accordion is the
     right primitive here rather than a push -- a section opening pushes rows
     down, and the masthead demonstrably does not follow them.

     The one structural cost is a wrapper: grid-template-rows:0fr sizes the
     first row of a grid only, so an accordion box has to hold exactly one
     child. .xS1-secin and .xS1-wtx are that child and that box; both are bare
     boxes around content that already stacked full-width, so the layout is
     unchanged and the fit numbers did not move.

     HONEST WEAKNESS
     Fixed chrome. Strip + desk + banner is roughly 150px before a single file
     row is visible, which at 240px in a short window leaves under half the
     panel for the list -- the exact opposite trade from vD, which spends taps
     to buy vertical room. And putting the answer above the evidence is
     backwards for anyone who reads a diff top-down: hand travel is upward, and
     the Commit button sits closest to the panel header where users expect
     navigation, not a destructive-adjacent primary action.
     ===================================================================== */

  var S1 = { sel: null, wtf: 'all' };

  function s1Panel(D, st) {
    var b = D.bucket(st.width);
    var SC = D.source || {};
    var g = groupsOf(SC);
    var counts = SC.counts || {};
    var lanes = (SC.worktrees || []);
    var primary = primaryContext(SC, S1.sel);
    var blockedWt = null;
    lanes.forEach(function (w) { if (!blockedWt && w.status === 'blocked') blockedWt = w; });

    var changed = (counts.staged || 0) + (counts.unstaged || 0);

    /* ---------------------------------------------------------- head */
    var head = PMK.head(b === 0 ? 'Source' : 'Source Control', changed + ' changed',
      PMK.overflow([
        { value: 'fetch', label: 'Fetch' },
        { value: 'pull', label: 'Pull', hint: 'in ' + (SC.remote ? SC.remote.incoming : 0) },
        { value: 'push', label: 'Push', hint: 'out ' + (SC.remote ? SC.remote.outgoing : 0) },
        { type: 'sep' },
        { value: 'open_review', label: 'Open Review Mode' },
        { value: 'toggle_generated_filter', label: 'Hide generated files' },
        { value: 'worktree.create', label: 'New worktree' },
        { value: 'pr.create', label: 'Create pull request' }
      ], 'Repository actions'));

    /* ------------------------------------------------- W-018 strip
       At 240px this degrades to status mark + branch + numerals + N, and the
       +N is never dropped: losing it silently flattens contexts. */
    var nums = b >= 3
      ? (counts.staged || 0) + ' staged, ' + (counts.unstaged || 0) + ' unstaged, ' +
        g.conflict.length + ' conflicted'
      : (counts.staged || 0) + '/' + (counts.unstaged || 0) + '/' + g.conflict.length;
    /* CONTEXT HEADER, and it REPLACES the branch combobox rather than crowding
       in beside it. source.md section 8 rules the 240px form outright: "repo /
       branch / worktree as one truncating button + +N chip. Not a select." A
       combobox cannot carry a group head, so it could never hold the
       repository, its two sibling repos and the branch list in one control --
       which is why ten of ten versions rendered a branch picker and called it
       a context header. +N stays its own control: W-018 makes the parallel
       context count a separate projection, not a branch. */
    var strip = '<div class="pmk-strip">' +
      (primary ? PMK.statusMark(primary.status) : '') +
      ctxBtn('xS1', D, st, b, 21 + (b >= 3 ? 190 : 46) + 34 + 24) +
      '<span class="pmk-strip-grow"></span>' +
      /* The tip states the CONTAINMENT, because the three numerals do not:
         counts.unstaged is every file not staged, and the conflicted and
         untracked ones are inside it, not beside it. The group headers below
         sum to the head's changed count only if that is said somewhere. */
      '<span class="xS1-nums" data-pm-tip="' +
        esc((counts.staged || 0) + ' staged, ' + (counts.unstaged || 0) + ' not staged - of those ' +
            g.unstaged.length + ' modified, ' + g.conflict.length + ' conflicted, ' +
            g.untracked.length + ' untracked. Ahead ' + D.project.ahead +
            ', behind ' + D.project.behind) + '">' + esc(nums) + '</span>' +
      plusN(SC, primary) +
      '</div>';

    /* ---------------------------------------------------------- desk */
    var desk = '<div class="xS1-desk">' +
      '<textarea class="pmk-field xS1-msg" rows="' + (b >= 2 ? 3 : 1) + '" ' +
        'placeholder="Commit message" aria-label="Commit message">' +
        esc(SC.commitDraft || '') + '</textarea>' +
      (b >= 1
        ? '<div class="xS1-pay"><b>' + esc(String(counts.staged || 0)) + '</b> staged' +
          '<span aria-hidden="true">&middot;</span>' + esc(String(counts.unstaged || 0)) + ' unstaged' +
          '<span aria-hidden="true">&middot;</span>ahead ' + esc(String(D.project.ahead)) + '</div>'
        : '') +
      '<div class="pmk-btnrow">' +
        PMK.btn('Commit', { primary: true, tip: 'Commit the ' + (counts.staged || 0) + ' staged files' }) +
        (b >= 2 ? PMK.btn('Generate', { tip: 'Generate a commit message from the staged diff' }) : '') +
        PMK.overflow([
          { value: 'generate_commit_message', label: 'Generate commit message' },
          { value: 'suggest_commit_batches', label: 'Suggest commit batches' },
          { value: 'accept_commit_group', label: 'Accept suggested batch',
            disabled: true, reason: 'no_commit_group_selected',
            sentence: 'Batching is advisory; nothing is canonical until you accept a group.' },
          { type: 'sep' },
          { value: 'commit_push', label: 'Commit and push' },
          { value: 'amend', label: 'Amend last commit' },
          { value: 'signoff', label: 'Add Signed-off-by' }
        ], 'Commit options') +
      '</div></div>';

    /* ------------------------------------------------- blocked banner */
    var banner = '';
    if (blockedWt) {
      /* The sentence is now the FIXTURE'S, per reason family (lockSay), and
         the buttons are the ones its own copy names: "Release it explicitly
         before pruning" gets a Release button. Offering `Request prune` here
         was the audit's finding -- this row is blocked_preserved and
         prunable:false, so prune is the one thing it may not do. Ids carry
         the branch because the banner sits outside every row and the
         confirmation has to know which worktree it is talking about. */
      banner = PMK.blocked({
        code: blockedWt.lockReason || 'worktree_locked_by_stopped_run',
        sentence: blockedWt.branch + ': ' + lockSay(blockedWt),
        actions: b >= 1
          ? [{ id: 'worktree.release:' + blockedWt.branch, label: 'Release' },
             { id: 'worktree.focus_lineage:' + blockedWt.branch, label: 'Focus lineage' },
             { id: (blockedWt.kind === 'orch' ? 'worktree.open_lane:' : 'worktree.open_thread:') +
                   blockedWt.branch,
               label: blockedWt.kind === 'orch' ? 'Open Lane' : 'Open Thread' }]
          : [{ id: 'worktree.release:' + blockedWt.branch, label: 'Release' }]
      }, 'err');
    }

    /* ------------------------------------------------------ file rows
       .pmm-enter lives in the MARKUP here and nowhere else in this file,
       because xS1 is the only variant that never repaints: its sections and
       worktree details toggle in the DOM, so the class fires once per stage
       build and again when a collapsed section is un-hidden (display:none
       restarts a CSS animation, which is exactly the wanted behaviour -- rows
       arrive with the drawer). The cascade is capped at four steps by the CSS
       and is 0ms in basic. */
    function rows(list, group) {
      return '<div class="xS1-list pmm-enter">' + list.map(function (f) {
        var inline = '';
        if (b >= 1 && group === 'conflict') {
          inline = miniBtn('xS1', 'warn', 'Open Conflict Assistant for ' + baseOf(f.path));
        } else if (b >= 1) {
          inline = group === 'staged'
            ? miniBtn('xS1', 'down', 'Unstage ' + baseOf(f.path))
            : miniBtn('xS1', 'plus', 'Stage ' + baseOf(f.path));
        }
        return fileRow('xS1', { f: f, group: group }, st, b, { inline: inline });
      }).join('') + '</div>';
    }

    function grpHead(label, count, open) {
      return '<button type="button" class="pmk-sec xS1-grp" aria-expanded="' +
        (open ? 'true' : 'false') + '">' + ic('chev', 10, 'pmk-sec-chev') +
        '<span class="pmk-sec-lbl">' + esc(label) + '</span>' +
        '<span class="pmk-sec-n">' + esc(String(count)) + '</span></button>';
    }
    /* ONE element child, always. grid-template-rows:0fr sizes the FIRST row
       only, so an accordion box holding six rows directly collapses to the
       height of five of them; _pm-motion.js measured 90px of leaked body where
       0 was wanted and degrades such a box to .pmm-expand--static rather than
       ship a section that will not close. .xS1-secin is that child, and it
       carries the column flex the body used to declare itself. */
    function secBody(open, body) {
      return '<div class="xS1-secbody"' + (open ? '' : ' hidden') + '>' +
        '<div class="xS1-secin">' + body + '</div></div>';
    }
    function grp(label, count, open, body) {
      return grpHead(label, count, open) + secBody(open, body);
    }
    function sec(label, count, open, body) {
      return PMK.section(label, count, open) + secBody(open, body);
    }

    var changesBody =
      (g.conflict.length
        ? grp('Conflicts', g.conflict.length, true,
              '<div class="xS1-list pmm-enter">' + g.conflict.map(function (f) {
                return fileRow('xS1', { f: f, group: 'conflict' }, st, b, {
                  inline: b >= 1
                    ? miniBtn('xS1', 'warn', 'Open Conflict Assistant for ' + baseOf(f.path))
                    : ''
                }) + conflictCard('xS1', 'xS1-wtd', f, b);
              }).join('') + '</div>')
        : '') +
      grp('In commit', g.staged.length, true, rows(g.staged, 'staged')) +
      grp('Not in commit', g.unstaged.length, true, rows(g.unstaged, 'unstaged')) +
      (g.untracked.length
        /* Untracked is its own counted group, never folded into unstaged:
           GitHub_Integration.md:L90's group model is staged / unstaged /
           untracked, and its compare target is a different one (empty to
           working tree). */
        ? grp('Untracked', g.untracked.length, true, rows(g.untracked, 'untracked'))
        : '');

    /* ------------------------------------------------- worktree rows */
    function wtRow(w) {
      var reserved = 21 + 24 + 12 + (b >= 1 ? 44 : 0);
      var n = cap(st, reserved);
      var aria = w.branch + stateSay(w) + '. ' +
        (w.owner || 'Owner unresolved') +
        (w.lockedBy ? '. Locked by ' + w.lockedBy : '') + '. Collapsed';
      var meta = [];
      if (b >= 2) { if (w.run) meta.push(w.run); if (w.base) meta.push(w.base); }
      if (b >= 3 && w.path) meta.push(w.path);
      var h = '<div class="pmk-row' + (b >= 1 ? ' pmk-row--2line' : '') + '" ' +
        'tabindex="0" role="button" aria-expanded="false" ' +
        'data-xs1-wt="' + esc(w.branch) + '" data-pm-ctx="Worktree actions" ' +
        'data-xs-kind="worktree" data-xs-scope="' + esc(w.branch) + '" ' +
        'aria-label="' + esc(aria) + '">' +
        PMK.statusMark(w.status);
      if (b >= 1) {
        h += '<span class="pmk-id-stack">' +
          '<span class="xS1-base">' + esc(elide(w.branch, 'path', n)) + '</span>' +
          '<span class="xS1-dir">' + esc(elide(w.owner || 'Owner unresolved', 'name',
            Math.floor(n * 1.1))) + '</span></span>';
      } else {
        h += '<span class="pmk-id">' + esc(elide(w.branch, 'path', n)) + '</span>';
      }
      if (meta.length) h += PMK.metaRun(meta, b, { maxPx: 96 });
      h += ic('chev', 10, 'pmk-sec-chev');
      h += PMK.overflow(wtActions(w), 'Worktree actions');
      h += '</div>';

      /* The expanded detail is a SIBLING, not a nested card: no third box. */
      var kvs = wtKvs(w, b, st);
      var sb = stateBlock(w);

      var open = w.status === 'blocked';
      /* Same one-child rule: .xS1-wtx is the accordion box, .xS1-wtd stays the
         padded column it always was. The --fade modifier is added by xExpand at
         toggle time, never in the markup: .pmm-expand--fade > * sets opacity 0
         unconditionally, so a box that carried the class before anything opened
         it would render its contents invisible on first paint. */
      return '<div class="xS1-wtwrap">' + h.replace('aria-expanded="false"',
        'aria-expanded="' + (open ? 'true' : 'false') + '"') +
        '<div class="xS1-wtx"' + (open ? '' : ' hidden') + ' data-xs1-wtd ' +
        'data-xs-kind="worktree" data-xs-scope="' + esc(w.branch) + '">' +
        '<div class="xS1-wtd">' +
        kvs + sb + stateNote(w) +
        '<div class="xS1-acts">' +
          pathBtn('Open Files', w, 'worktree.open_files', true) +
          actBtn('Compare', 'worktree.compare') +
          (b >= 1 ? actBtn(w.kind === 'orch' ? 'Open Lane' : 'Open Thread',
                           w.kind === 'orch' ? 'worktree.open_lane' : 'worktree.open_thread') : '') +
          /* Lineage and Recover are offered ONCE. When a state banner is
             showing they are its allowed actions, one line above, as real
             buttons -- printing them again here would make the row's own
             cluster the second copy of the route out. Recover is promoted out
             of the menu on the rows the fixture marks repairable, because it
             is the only way back from an orphaned checkout and the word
             appeared nowhere in this bakeoff except a comment. */
          (b >= 1 && !sb ? actBtn('Focus lineage', 'worktree.focus_lineage') : '') +
          (w.repairable && !sb ? gatedBtn('Recover', w, 'recover') : '') +
          (b >= 2 ? actBtn('Create PR', 'pr.create') : '') +
          gatedBtn('Remove', w, 'remove', true) +
        '</div></div></div></div>';
    }

    /* The filter now FILTERS. It was a picker that changed nothing, which is
       the same defect class as a caret promising a row the panel never
       renders -- an affordance that lies. GI-020 also wants the choice
       persisted per project; S1.wtf is this file's stand-in for that store. */
    var wtShown = (SC.worktrees || []).filter(function (w) {
      return S1.wtf === 'all' || w.kind === S1.wtf;
    });
    var wtFilter = '<div class="pmk-strip">' +
      '<span data-xs1-wtfilter style="display:flex;flex:1 1 auto;min-width:0">' +
      PMK.select(S1.wtf, [
        { value: 'all', label: 'All', hint: String((SC.worktrees || []).length) },
        { value: 'thread', label: 'Threads' },
        { value: 'orch', label: 'Orchestrator' },
        { value: 'manual', label: 'Manual' }
      ], { style: 'flex:1 1 auto;min-width:0' }) + '</span>' +
      '<span class="xS1-nums">' + esc(wtShown.length + '/' + (SC.worktrees || []).length) + '</span>' +
      miniBtn('xS1', 'plus', 'New worktree') +
      '</div>';

    var histBody = '<div class="xS1-list pmm-enter">' + (SC.history || []).map(function (c) {
      return PMK.row({
        bucket: b, twoLine: true, id: c.sha, idKind: 'ref', idMax: 12,
        sub: elide(c.subject, 'name', cap(st, 21 + 24 + 44)),
        tail: c.when, width: st.width,
        actions: [
          { value: 'history_open_commit', label: 'Open commit' },
          { value: 'show_commit', label: 'Show commit' },
          { value: 'diff_set_compare_target', label: 'Set compare target' },
          { value: 'open_review', label: 'Open Review Mode' }
        ]
      });
    }).join('') + '</div>' +
      '<div class="xS1-wtd"><span class="pmk-note">' +
      esc('Showing ' + ((SC.paging && SC.paging.commits && SC.paging.commits.shown) || 0) +
          ' of ' + ((SC.paging && SC.paging.commits && SC.paging.commits.total) || 0)) +
      '</span><div class="pmk-btnrow">' + PMK.btn('Load older') + '</div></div>';

    var by = wtLookup(SC);
    var graphBody = '<div class="xS1-list pmm-enter">' + (SC.branchList || []).map(function (br) {
      var w = by[br.name];
      return PMK.row({
        bucket: b, status: w ? w.status : (br.current ? 'ok' : 'queued'),
        id: br.name, idKind: 'path', idMax: cap(st, 21 + 24 + 60),
        meta: [(br.ahead ? '+' + br.ahead : '0'), (br.behind ? '-' + br.behind : '0'),
               w ? (w.run || w.kind) : ''],
        width: st.width,
        actions: [
          { value: 'graph.focus', label: 'Focus branch tip' },
          { value: 'graph.filter', label: 'Filter graph' },
          { value: 'graph.layout', label: 'Change layout' }
        ]
      });
    }).join('') + '</div>' +
      '<div class="xS1-wtd"><span class="pmk-note">' +
      esc('Graph renders as this owner list below 480px. Every node is reachable ' +
          'by keyboard here, so the drawing is never the only path.') + '</span></div>';

    var branchBody = '<div class="xS1-list pmm-enter">' + (SC.branchList || []).map(function (br) {
      var w = by[br.name];
      return PMK.row({
        bucket: b, status: br.current ? 'ok' : (w && w.lockedBy ? 'blocked' : 'queued'),
        id: br.name, idKind: 'path', idMax: cap(st, 21 + 24 + 56),
        meta: ['+' + br.ahead, '-' + br.behind], width: st.width,
        actions: [
          { value: 'switch_branch', label: 'Switch to branch',
            disabled: !!(w && w.lockedBy), reason: w && w.lockReason ? w.lockReason : '',
            sentence: w && w.lockedBy ? branchLockSay(w) : '' },
          { value: 'worktree.compare', label: 'Compare' },
          { value: 'pr.create', label: 'Create pull request' }
        ]
      });
    }).join('') + '</div>' +
      grp('Stash', (SC.stash || []).length, true,
        '<div class="xS1-list pmm-enter">' + (SC.stash || []).map(function (sx) {
          return PMK.row({
            bucket: b, twoLine: true, id: sx.label, idMax: cap(st, 24 + 44),
            sub: sx.when + ' ago', tail: sx.when, width: st.width,
            actions: [
              { value: 'stash.apply', label: 'Apply' },
              { value: 'stash.pop', label: 'Pop' },
              { value: 'stash.drop', label: 'Drop', danger: true }
            ]
          });
        }).join('') + '</div>');

    /* Canonical order from GI-004: Changes, History, Graph, Worktrees,
       Branches / Stash. Worktrees is default-open per the recorded defaults;
       at 240px only Changes opens, because two open sections in a 224px band
       with a 150px masthead is not a panel, it is a scroll bar. */
    var body = PMK.body(
      sec('Changes', changed, true, changesBody) +
      '<div class="xS1-hair"></div>' +
      sec('History', counts.commits || 0, b >= 3, histBody) +
      sec('Graph', '', false, graphBody) +
      sec('Worktrees', counts.worktrees || 0, b >= 1,
          wtFilter + (wtShown.length
            ? wtShown.map(wtRow).join('')
            : PMK.empty('no-results', 'No worktrees match',
                'The ' + S1.wtf + ' filter hides every worktree in this project.', 'Show all'))) +
      sec('Branches / Stash', (counts.branches || 0) + ' / ' + (counts.stash || 0), b >= 3, branchBody),
      false);

    return '<div class="pmk-panel xS1">' + head + strip + desk + banner + body + '</div>';
  }

  /* =====================================================================
     xS2 — LANE BOARD
     ---------------------------------------------------------------------
     THESIS
     This repo is worktree-native: 8 worktrees, 4 orchestrator lanes owned by
     one run, 5 contexts live at once. Every other design in the bakeoff treats
     Worktrees as a peer section of Changes, which means the panel answers
     "what changed" before it answers "changed WHERE" -- and with five active
     contexts that is the wrong order. So the lane is the primary object and
     everything else is a property of the selected lane: changes, history,
     graph and branches all render INSIDE the focus region for one worktree at
     a time. There is no peer Changes section because there is no such thing as
     "the changes" -- only the changes of a lane.

     That reframing pays for GI-020 outright. The compact worktree row does not
     have to carry the owner label at 240px, because the panel has a PERMANENT
     detail region that shows the owner of the selected lane at all times. At
     240px the lane list collapses to a single picker and the focus region
     takes the whole panel; at 280px and up the list is a two-line row with the
     owner on line 2. The owner never has to be squeezed into 30 characters.

     THE LATENT BUG, FIXED IN PUBLIC
     project.branch is 'main' and 'main' is NOT one of the 8 worktrees. Any
     design that reads worktrees[0] as "the current worktree" attributes 16
     changed files to orch/lane-b-api, a lane owned by run #47 that has never
     seen them. primaryLane() resolves by branch and synthesises a repo-root
     lane when no worktree claims it, with owner and path ABSENT rather than
     invented. Selecting any other lane shows that lane's own facts and an
     explicit no-data empty for file-level changes, because the fixture does
     not carry per-worktree file lists and faking them would be worse than
     saying so.

     WIDTH LADDER
                     240 (0)          320 (1)         380 (2)        480 (3)
     lane list       picker only      2-line rows     + run/base     + path
                     (no rows)        owner line 2      meta           meta
     filter          in the picker    icon-only        All/Threads/   full strip
                                      controls          Orch/Manual    + counts
     ownership       owner line +     same             KV block       KV block
                     meta run                          (stacked)      (inline)
     view switch     portaled picker  lens strip       lens strip     lens strip
     composer        1-line + Commit  + payload        3-line         + Generate
     split           focus only       2:3 vertical    2:3 vertical   2:3 vertical

     The 480 case stays VERTICAL. A horizontal split at 480px gives each pane
     about 232px, which is the 240px problem recreated inside a panel that was
     supposed to escape it. xS3 takes the opposite bet on purpose so the
     bakeoff can measure which one is right instead of arguing about it.

     SLINT MAPPING
     VerticalLayout { head; if bucket>0 { lane-list: Flickable over
     VecModel<Lane> } else { picker }; focus: VerticalLayout { ident; own;
     if blocked { banner }; lens-strip; Flickable { view-body }; if
     view==changes { composer } } }. Selection is one int index into the lane
     model; the view is one enum. Both are plain properties, so the whole
     panel is two bindings and no text measurement.

     MOTION
     Two-axis navigation is exactly the thing motion is for here, so the two
     axes get two different-sized answers rather than one generic transition:

       lane change    .pmm-frame on .xS2-focus. The whole focus region is a
                      different object now -- different owner, different run,
                      different ahead count -- so the whole region slides. The
                      direction is the lane's position in the list the user is
                      looking at, which is what makes the swap read as "you
                      moved" instead of "something blinked".
       view change    .pmm-frame on .xS2-body ONLY. Ident, ownership block and
                      composer are the same lane and did not change; sliding
                      them would animate five things to communicate one.
       filter change  .pmm-enter on the lane list, and the focus region stays
                      perfectly still, because the filter changed WHICH LANES
                      EXIST and changed nothing about the selected one.
       lens strip     .pmm-lens-ind, so the F3-445 selection travels between
                      tabs instead of being repainted onto a different element.

     The honest cost of the reframing shows up in the motion too: a lane change
     is the more expensive animation of the two, and it is also the one a user
     of this panel performs most often.

     HONEST WEAKNESS
     Two-axis navigation. "Which lane" times "which view" is a 9 x 4 space, and
     a user who just wants the commit history of the repo has to notice that
     history is scoped to a lane at all. History and Branches are genuinely
     repo-scoped, not lane-scoped, so scoping them to the focus region is a
     small lie the design tells for consistency. And the lane list eats 40% of
     the panel height at every width above 240px whether or not you are
     switching lanes -- which is most of the time.
     ===================================================================== */

  var S2 = { lane: null, view: 'changes', filter: 'all' };

  function s2Panel(D, st) {
    var b = D.bucket(st.width);
    var SC = D.source || {};
    var counts = SC.counts || {};
    var lanes = lanesOf(D);
    var g = groupsOf(SC);

    var sel = null;
    lanes.forEach(function (l) { if (!sel && l.branch === S2.lane) sel = l; });
    if (!sel) sel = lanes.length ? lanes[0] : null;
    var isRoot = !!(sel && sel.isRoot);

    var shown = lanes.filter(function (l) {
      if (S2.filter === 'all') return true;
      if (S2.filter === 'thread') return l.kind === 'thread';
      if (S2.filter === 'orch') return l.kind === 'orch';
      if (S2.filter === 'manual') return l.kind === 'manual';
      return true;
    });

    var primary = primaryContext(SC, sel ? sel.branch : null);
    /* The count is the LANE LIST's length, not counts.worktrees: this design
       injects a synthesised repo-root lane, so quoting the fixture's worktree
       count over a list one longer was the panel disagreeing with itself
       (audit-source 4.11). At 240px the head has to give the context button
       its width, so the count degrades to the numeral alone. */
    /* 'Source' below 480 is not a nickname, it is what fits: the context
       button costs the head about 110px, and measured across the eight themes
       'Source Control' plus a count plus that button ellipsizes the TITLE at
       320 and 380 in the wider faces. A panel whose own name is cut to read
       'Source Contr...' has spent the wrong pixel; xS1 already used this
       shorter form at its narrowest bucket. */
    var head = PMK.head(b === 0 ? 'Lanes' : b >= 3 ? 'Source Control' : 'Source',
      b === 0 ? String(lanes.length) : lanes.length + ' lanes',
      ctxBtn('xS2', D, st, b, 21 + 70 + 34 + 24) + plusN(SC, primary) + PMK.overflow([
        { value: 'worktree.create', label: 'New worktree' },
        { value: 'worktree.list', label: 'Refresh worktree list' },
        { type: 'sep' },
        { value: 'fetch', label: 'Fetch' },
        { value: 'pull', label: 'Pull' },
        { value: 'push', label: 'Push' },
        { type: 'sep' },
        { value: 'hide_stale', label: 'Hide stale worktrees' },
        { value: 'open_review', label: 'Open Review Mode' }
      ], 'Repository actions'));

    /* ---------------------------------------------------- the lane list */
    function laneRow(l) {
      var reserved = 21 + 24 + 12 + (b >= 2 ? 60 : 0);
      var n = cap(st, reserved);
      var owner = l.owner || (l.isRoot ? 'Repo checkout' : 'Owner unresolved');
      var aria = l.branch + stateSay(l) + '. ' + owner +
        (l.lockedBy ? '. Locked by ' + l.lockedBy : '') +
        (l.branch === (sel && sel.branch) ? '. Selected' : '');
      var meta = [];
      if (b >= 2) { if (l.run) meta.push(l.run); if (l.base) meta.push(l.base); }
      if (b >= 3 && l.path) meta.push(l.path);
      if (b >= 2 && l.dirty) meta.push('dirty');

      var h = '<div class="pmk-row is-lane' + (b >= 1 ? ' pmk-row--2line' : '') +
        (l.branch === (sel && sel.branch) ? ' is-sel' : '') + '" tabindex="0" role="button" ' +
        'aria-current="' + (l.branch === (sel && sel.branch) ? 'true' : 'false') + '" ' +
        'data-xs2-lane="' + esc(l.branch) + '" data-pm-ctx="Worktree actions" ' +
        'data-xs-kind="worktree" data-xs-scope="' + esc(l.branch) + '" ' +
        'aria-label="' + esc(aria) + '">' + PMK.statusMark(l.status);
      if (b >= 1) {
        h += '<span class="pmk-id-stack">' +
          '<span class="xS2-base">' + esc(elide(l.branch, 'path', n)) + '</span>' +
          '<span class="xS2-dir">' + esc(elide(owner, 'name', Math.floor(n * 1.1))) + '</span></span>';
      } else {
        h += '<span class="pmk-id">' + esc(elide(l.branch, 'path', n)) + '</span>';
      }
      if (meta.length) h += PMK.metaRun(meta, b, { maxPx: 88 });
      h += PMK.overflow(l.isRoot
        ? [{ value: 'worktree.open_files', label: 'Open Files' },
           { value: 'worktree.compare', label: 'Compare' },
           { value: 'open_review', label: 'Open Review Mode' }]
        : wtActions(l), 'Worktree actions');
      return h + '</div>';
    }

    var filterItems = [
      { id: 'all', label: 'All', count: String(lanes.length) },
      { id: 'thread', label: 'Threads' },
      { id: 'orch', label: 'Orchestrator' },
      { id: 'manual', label: 'Manual' }
    ];

    var laneRegion;
    if (b === 0) {
      /* No compact worktree row at all at 240px. GI-020's row does not fit, so
         rather than amputate the owner the list becomes a picker and the owner
         lives in the focus header, which is permanently on screen anyway. */
      laneRegion = '<div class="pmk-strip">' +
        '<span data-xs2-lanepick style="display:flex;flex:1 1 auto;min-width:0">' +
        PMK.select(sel ? sel.branch : '', lanes.map(function (l) {
          return {
            value: l.branch, label: l.branch,
            hint: (l.run || '') + (l.dirty ? ' dirty' : ''),
            reason: l.lockReason || '', sentence: l.lockedBy ? 'Owned by ' + l.lockedBy + '.' : ''
          };
        }), { style: 'flex:1 1 auto;min-width:0' }) + '</span>' +
        '<span data-xs2-filterpick>' + PMK.select(S2.filter, filterItems.map(function (f) {
          return { value: f.id, label: f.label };
        }), { style: 'flex:0 0 auto;min-width:0' }) + '</span>' +
        '</div>';
    } else {
      laneRegion = '<div class="pmk-strip">' +
        lensWrap('data-xs2-filter', filterItems.map(function (f) { return f.id; }),
                 filterItems, S2.filter, b, 'Worktree filter') +
        '<span class="xS2-nums">' + esc(shown.length + '/' + lanes.length) + '</span>' +
        '</div>' +
        '<div class="xS2-lanes"><div class="xS2-list">' +
        (shown.length
          ? shown.map(laneRow).join('')
          : PMK.empty('no-results', 'No lanes match', 'The ' + S2.filter +
              ' filter hides every worktree in this project.', 'Show all')) +
        '</div></div>';
    }

    /* ------------------------------------------------- the focus region */
    var s = sel ? PMK.statusOf(sel.status) : null;
    var ident = '<div class="xS2-ident">' +
      (sel ? PMK.statusMark(sel.status) : '') +
      '<span class="xS2-name">' + esc(elide(sel ? sel.branch : '', 'path', cap(st, 21 + 70))) + '</span>' +
      (b >= 2 && s ? PMK.chip(s.word, s.tone === 'err' ? 'err' : s.tone === 'warn' ? 'warn' : '') : '') +
      '</div>';

    var own = '<div class="xS2-own"' +
      (sel ? ' data-xs-kind="worktree" data-xs-scope="' + esc(sel.branch) + '"' : '') + '>';
    if (sel) {
      var ownerTxt = sel.owner || (sel.isRoot ? 'Repo checkout, no worktree owner' : 'Owner unresolved');
      if (b >= 2) {
        own += '<div class="xS2-kvs">' + wtKvs(sel, b, st) + '</div>';
      } else {
        var segs = [];
        if (sel.run) segs.push(sel.run);
        if (sel.base) segs.push(sel.base);
        segs.push('ahead ' + sel.ahead);
        /* The lifecycle word survives to 240px in the meta run. It is the
           field that governs which actions are legal, so it is the last thing
           to drop, not the first. */
        segs.push(sel.lifecycle || (sel.isRoot ? 'no lifecycle' : 'lifecycle unresolved'));
        if (sel.dirty) segs.push('dirty');
        own += '<span class="xS2-ownline">' +
          esc(elide(ownerTxt, 'name', cap(st, 8))) + '</span>' +
          PMK.metaRun(segs, b, { maxPx: st.width - 32 });
      }
      var sb2 = stateBlock(sel);
      own += sb2 + stateNote(sel);
      own += '<div class="xS2-acts">' +
        pathBtn('Open Files', sel, 'worktree.open_files', true) +
        actBtn('Compare', 'worktree.compare') +
        (b >= 1 && !sel.isRoot ? actBtn(sel.kind === 'orch' ? 'Open Lane' : 'Open Thread',
          sel.kind === 'orch' ? 'worktree.open_lane' : 'worktree.open_thread') : '') +
        (b >= 1 && !sb2 ? actBtn('Focus lineage', 'worktree.focus_lineage') : '') +
        (sel.repairable && !sb2 ? gatedBtn('Recover', sel, 'recover') : '') +
        (b >= 2 ? actBtn('Create PR', 'pr.create') : '') +
        (sel.isRoot ? '' : gatedBtn('Remove', sel, 'remove', true)) +
        '</div>';
    }
    own += '</div>';

    /* ------------------------------------------------------ view switch */
    var viewItems = [
      { id: 'changes', label: 'Changes', count: String((counts.staged || 0) + (counts.unstaged || 0)) },
      { id: 'history', label: 'History', count: String(counts.commits || 0) },
      { id: 'graph', label: 'Graph' },
      { id: 'branches', label: 'Branches / Stash',
        count: (counts.branches || 0) + '/' + (counts.stash || 0) }
    ];
    var viewStrip = '<div class="pmk-strip">' +
      lensWrap('data-xs2-lens', viewItems.map(function (v) { return v.id; }),
               viewItems, S2.view, b, 'Lane views') + '</div>';

    /* --------------------------------------------------------- view body */
    var vb = '';
    if (S2.view === 'changes') {
      if (isRoot) {
        function rows2(list, group) {
          return '<div class="xS2-list">' + list.map(function (f) {
            var inline = b >= 1
              ? (group === 'staged'
                  ? miniBtn('xS2', 'down', 'Unstage ' + baseOf(f.path))
                  : miniBtn('xS2', 'plus', 'Stage ' + baseOf(f.path)))
              : '';
            return fileRow('xS2', { f: f, group: group }, st, b, { inline: inline });
          }).join('') + '</div>';
        }
        vb = (g.conflict.length
              ? PMK.section('Conflicts', g.conflict.length, true) +
                g.conflict.map(function (f) {
                  return '<div class="xS2-list">' +
                    fileRow('xS2', { f: f, group: 'conflict' }, st, b, {
                      inline: b >= 1
                        ? miniBtn('xS2', 'warn', 'Open Conflict Assistant for ' + baseOf(f.path))
                        : ''
                    }) + '</div>' + conflictCard('xS2', 'xS2-own', f, b);
                }).join('')
              : '') +
             PMK.section('Staged', g.staged.length, true) + rows2(g.staged, 'staged') +
             PMK.section('Unstaged', g.unstaged.length, true) + rows2(g.unstaged, 'unstaged') +
             PMK.section('Untracked', g.untracked.length, true) + rows2(g.untracked, 'untracked');
      } else {
        /* Honest degradation: the fixture carries dirty/ahead per worktree but
           no per-worktree file list, so this is a no-data empty, not an error
           and not a fabricated list. */
        vb = '<div class="xS2-own">' +
          PMK.metaRun(['ahead ' + sel.ahead, sel.dirty ? 'dirty' : 'clean',
                       'base ' + (sel.base || 'unresolved')], b, { maxPx: st.width - 32 }) +
          '</div>' +
          PMK.empty('no-data', 'No file list for this lane',
            'This projection carries lifecycle and ahead/behind for ' + sel.branch +
            ' but not its working-tree file list. Open the lane to inspect it.',
            'Open Files');
      }
    } else if (S2.view === 'history') {
      vb = '<div class="xS2-list">' + (SC.history || []).map(function (c) {
        return PMK.row({
          bucket: b, twoLine: true, id: c.sha, idKind: 'ref', idMax: 12,
          sub: elide(c.subject, 'name', cap(st, 21 + 24 + 44)),
          tail: c.when, width: st.width,
          actions: [
            { value: 'history_open_commit', label: 'Open commit' },
            { value: 'diff_set_compare_target', label: 'Set compare target' },
            { value: 'open_review', label: 'Open Review Mode' }
          ]
        });
      }).join('') + '</div>';
    } else if (S2.view === 'graph') {
      var by2 = wtLookup(SC);
      vb = '<div class="xS2-list">' + (SC.branchList || []).map(function (br) {
        var w = by2[br.name];
        return PMK.row({
          bucket: b, status: w ? w.status : (br.current ? 'ok' : 'queued'),
          id: br.name, idKind: 'path', idMax: cap(st, 21 + 24 + 60),
          meta: ['+' + br.ahead, '-' + br.behind, w ? (w.run || w.kind) : ''],
          width: st.width,
          actions: [
            { value: 'graph.focus', label: 'Focus branch tip' },
            { value: 'graph.filter', label: 'Filter graph' },
            { value: 'graph.layout', label: 'Change layout' }
          ]
        });
      }).join('') + '</div>' +
      '<div class="xS2-own"><span class="pmk-note">' +
      esc('Which worktree or run owns each branch tip. The drawing is never the ' +
          'only path to this; this list is the keyboard equivalent.') + '</span></div>';
    } else {
      var by3 = wtLookup(SC);
      vb = PMK.section('Branches', counts.branches || 0, true) +
        '<div class="xS2-list">' + (SC.branchList || []).map(function (br) {
          var w = by3[br.name];
          return PMK.row({
            bucket: b, status: br.current ? 'ok' : (w && w.lockedBy ? 'blocked' : 'queued'),
            id: br.name, idKind: 'path', idMax: cap(st, 21 + 24 + 56),
            meta: ['+' + br.ahead, '-' + br.behind], width: st.width,
            actions: [
              { value: 'switch_branch', label: 'Switch to branch',
                disabled: !!(w && w.lockedBy), reason: (w && w.lockReason) || '',
                sentence: w && w.lockedBy ? branchLockSay(w) : '' },
              { value: 'worktree.compare', label: 'Compare' },
              { value: 'pr.create', label: 'Create pull request' }
            ]
          });
        }).join('') + '</div>' +
        PMK.section('Stash', (SC.stash || []).length, true) +
        '<div class="xS2-list">' + (SC.stash || []).map(function (sx) {
          return PMK.row({
            bucket: b, twoLine: true, id: sx.label, idMax: cap(st, 24 + 44),
            sub: sx.when + ' ago', tail: sx.when, width: st.width,
            actions: [
              { value: 'stash.apply', label: 'Apply' },
              { value: 'stash.pop', label: 'Pop' },
              { value: 'stash.drop', label: 'Drop', danger: true }
            ]
          });
        }).join('') + '</div>';
    }

    /* ------------------------------------------------------- the composer
       Docked to the focus region, outside its scroller, and only for the lane
       that actually owns the changed files. A composer under a lane whose file
       list this projection does not carry would be a lie about what Commit
       would commit. */
    var foot = '';
    if (S2.view === 'changes' && isRoot) {
      foot = '<div class="xS2-foot">' +
        '<textarea class="pmk-field xS2-msg" rows="' + (b >= 2 ? 3 : 1) + '" ' +
        'placeholder="Commit message" aria-label="Commit message">' +
        esc(SC.commitDraft || '') + '</textarea>' +
        (b >= 1 ? '<div class="xS2-nums">' +
          esc((counts.staged || 0) + ' staged on ' + sel.branch) + '</div>' : '') +
        '<div class="pmk-btnrow">' +
          PMK.btn('Commit', { primary: true }) +
          (b >= 2 ? PMK.btn('Generate') : '') +
          PMK.overflow([
            { value: 'generate_commit_message', label: 'Generate commit message' },
            { value: 'suggest_commit_batches', label: 'Suggest commit batches' },
            { type: 'sep' },
            { value: 'commit_push', label: 'Commit and push' },
            { value: 'amend', label: 'Amend last commit' }
          ], 'Commit options') +
        '</div></div>';
    } else if (S2.view === 'changes') {
      foot = '<div class="xS2-foot"><span class="pmk-note">' +
        esc('Commit is scoped to ' + (lanes.length ? lanes[0].branch : '') +
            ', the checkout that owns these changes.') + '</span></div>';
    }

    var focus = '<div class="xS2-focus">' + ident + own + viewStrip +
      '<div class="xS2-body">' + vb + '</div>' + foot + '</div>';

    return '<div class="pmk-panel xS2">' + head + laneRegion + focus + '</div>';
  }

  /* =====================================================================
     xS3 — REVIEW QUEUE
     ---------------------------------------------------------------------
     THESIS
     16 changed files is a worklist, not a dump. Every other design in this
     bakeoff renders the change set as a list you scroll and hope you covered;
     none of them can tell you which files you have actually looked at. xS3
     gives the change set STATE: each file is reviewed or not, a progress rail
     across the top shows the whole set as one shape, and the primary action is
     "Review next" rather than "scroll". Committing is the end of the queue,
     not a button that happens to be nearby.

     The rail is where the brief's "diff-stat magnitude bar" direction ended
     up. _pm-data.js ships no +/- line counts on any changed file, so a
     magnitude bar would have meant inventing 32 numbers. The rail keeps the
     scan-as-a-shape property and spends it on state that exists: 16 segments,
     one per file, coloured reviewed / unreviewed / conflicted. You read "three
     done, two conflicts, thirteen to go" in one glance without reading a word.

     It is also the only variant here that keeps the composer reachable from
     the DETAIL surface. The composer is a panel-level footer outside the push
     region, so reviewing file 9 of 16 and typing the commit message are the
     same screen. vD's composer only exists at the Changes list level; step
     into a file and it is gone.

     WIDTH LADDER
                     240 (0)          320 (1)        380 (2)        480 (3)
     view switch     portaled picker  lens strip     lens strip     lens strip
     rail            16 segs, 8px     16 segs        + counts       + counts
     queue rows      check, code,     + code word    + inline       + inline
                     2 lines            in tip         diff btn       diff btn
     detail          PUSH (back bar   push           push           SIDE BY
                     replaces list)                                   SIDE 56/44
     detail KVs      stacked          stacked        stacked        stacked
     composer        1 line + Commit  + Review next  3-line field   + Generate

     THE 480 BET
     This is the only variant that spends 480px on a horizontal split, and it
     is a deliberate counter-experiment to vD's refusal. vD's argument is that
     two panes of ~232px recreate the 240px problem; the counter-argument is
     that a review queue's two panes are ASYMMETRIC -- the queue column needs
     an identity and a checkbox, the detail column needs stacked key/values,
     and neither wants the full band. If the bakeoff measures this as clipped,
     vD was right and the finding is worth more than the layout.

     THE GI-020 ANSWER
     The compact worktree row at 240px is glyph + branch + chevron + status,
     with the owner label in the pushed detail rather than on a second line.
     That is the third distinct answer of the three variants here: xS1 puts it
     on line 2 above 280px and in an inline expansion below, xS2 removes the
     compact row entirely, xS3 pushes it one level deep.

     SLINT MAPPING
     VerticalLayout { head; lens-strip; if view==changes { rail }; if bucket==3
     { HorizontalLayout { queue; detail } } else if selected { detail } else {
     queue }; footer }. Review state is a VecModel<bool> parallel to the file
     model -- no per-row component state, so the whole thing is one property
     plus an index. The rail is a HorizontalLayout of 16 Rectangles whose
     background reads that model, which is exactly the kind of thing Slint is
     good at and DOM is not.

     MOTION
     .pmm-frame, the same primitive and the same convention as vD, because below
     480px this IS vD's navigation: picking a row replaces the queue, forward
     enters from the right and Back enters from the left. The 480 bet gets the
     same primitive at a smaller scope -- the queue never leaves, so the push
     narrows to the detail COLUMN. That is the cheapest possible demonstration
     of what the split actually buys: at 380px the whole region moves and you
     lose your place in the queue, at 480px only the right-hand column moves and
     you do not. If the bakeoff picks the split, this is the reason in one
     frame.

     Selecting is always FORWARD, including at 480px. At bucket 3 there is no
     "up the stack" to return to, and a detail pane that slid left or right
     depending on which row was clicked would be reading a direction into a
     lateral swap.

     .pmm-flash on the rail is the only value-change flash in these three files,
     and it earns its place: under the To review filter, marking a file reviewed
     makes the ROW ITSELF DISAPPEAR, so without the flash the segment that just
     turned green is the one thing the user is not looking at. Tone up on a
     clear; the neutral accent on an un-mark, because taking back a review is
     not an error and --accent-error would claim it was.

     .pmm-enter is reserved for the To review / Reviewed / All switch, which
     genuinely swaps one list for a different one. It is deliberately NOT fired
     on selection or on a review mark: re-running a 16-row cascade because one
     row gained a background is the long cascade the brief forbids, and it
     delays reading fifteen rows that did not change.

     HONEST WEAKNESS
     Review state is not in the spec. Nothing in Plans defines a reviewed flag,
     a persistence key for it, or what invalidates it when the file changes
     under you -- and a stale "reviewed" tick is worse than no tick at all,
     because it is a claim about attention that the tool cannot back. It also
     adds a 24px control to every row, which is the most expensive real estate
     in the panel, to buy state the user may not want to maintain. And two
     strips plus a rail plus a footer is roughly 120px of fixed chrome at
     240px, second only to xS1.
     ===================================================================== */

  var S3 = { view: 'changes', q: 'todo', sel: {}, reviewed: null, wtf: 'all' };

  /* Seeded from the fixture rather than hard-coded: the staged modifications
     start marked reviewed, so the panel paints a MID-queue state, which is the
     state actually under test. An empty queue and a full queue both hide the
     layout question. */
  function s3Reviewed(SC) {
    if (S3.reviewed) return S3.reviewed;
    var r = {};
    ((SC && SC.staged) || []).forEach(function (f) { if (f.code === 'M') r[f.path] = true; });
    S3.reviewed = r;
    return r;
  }

  function s3Panel(D, st) {
    var b = D.bucket(st.width);
    var SC = D.source || {};
    var counts = SC.counts || {};
    var q = queueOf(SC);
    var rev = s3Reviewed(SC);
    var done = q.filter(function (it) { return !!rev[it.f.path]; }).length;
    var left = q.length - done;
    var by = wtLookup(SC);
    var primary = primaryContext(SC, null);

    /* COLUMN-AWARE IDENTITY BUDGET. At bucket 3 the queue and the detail are
       side by side at 56/44, so an identity budget computed from the PANEL
       width over-estimates by nearly half and the basename gets clipped by CSS
       instead of elided deliberately -- which the fit checker duly reported as
       22 W1 findings at 480px before this existed. Every width decision still
       keys off the bucket; the 56/44 split is a layout constant, so this ports
       to Slint as two stretch factors rather than a measurement. */
    var qst = b >= 3 ? { theme: st.theme, width: Math.floor(st.width * 0.56) } : st;
    var dst = b >= 3 ? { theme: st.theme, width: Math.floor(st.width * 0.44) } : st;

    var viewItems = [
      { id: 'changes', label: 'Changes', count: done + '/' + q.length },
      { id: 'history', label: 'History', count: String(counts.commits || 0) },
      { id: 'graph', label: 'Graph' },
      { id: 'worktrees', label: 'Worktrees', count: String(counts.worktrees || 0) },
      { id: 'branches', label: 'Branches / Stash',
        count: (counts.branches || 0) + '/' + (counts.stash || 0) }
    ];

    /* Same trade as xS2, plus one more: at 240 the head drops the review
       count entirely and below 480 it keeps only the numerals, because the
       rail directly under it already carries the meter, the number still to
       review and the queue filter. Two copies of one number, one of them
       spelled out, is what a 224px band cannot afford -- measured, it was
       cutting the panel's own name by up to 14px in the basic faces. */
    var head = PMK.head(b === 0 ? 'Review' : b >= 3 ? 'Source Control' : 'Source',
      (S3.view !== 'changes' || b === 0) ? ''
        : b >= 3 ? done + ' of ' + q.length + ' reviewed' : done + '/' + q.length,
      ctxBtn('xS3', D, st, b, 21 + 70 + 34 + 24) + plusN(SC, primary) + PMK.overflow([
        { value: 'mark_all_reviewed', label: 'Mark all reviewed' },
        { value: 'reset_review', label: 'Clear review marks' },
        { type: 'sep' },
        { value: 'open_review', label: 'Open Review Mode' },
        { value: 'review.swap', label: 'Swap compare sides' },
        { value: 'toggle_generated_filter', label: 'Hide generated files' },
        { type: 'sep' },
        { value: 'fetch', label: 'Fetch' },
        { value: 'pull', label: 'Pull' },
        { value: 'push', label: 'Push' }
      ], 'Repository actions'));

    var lensStrip = '<div class="pmk-strip">' +
      lensWrap('data-xs3-lens', viewItems.map(function (v) { return v.id; }),
               viewItems, S3.view, b, 'Source Control views') + '</div>';

    /* The worktree filter, one predicate, used by the rail's count and by the
       list itself so the two cannot disagree. */
    function wtPass(w) { return S3.wtf === 'all' || w.kind === S3.wtf; }

    /* --------------------------------------------------------- the rail */
    var rail = '';
    if (S3.view === 'changes') {
      rail = '<div class="pmk-strip">' +
        '<span class="xS3-meter" role="img" aria-label="' +
        esc(done + ' of ' + q.length + ' files reviewed, ' +
            q.filter(function (it) { return it.group === 'conflict'; }).length + ' conflicted') + '">' +
        q.map(function (it) {
          var state = rev[it.f.path] ? 'done' : it.group === 'conflict' ? 'conflict' : 'todo';
          return '<span class="xS3-seg" data-s="' + state + '"></span>';
        }).join('') + '</span>' +
        '<span class="xS3-prog">' + esc(b >= 2 ? left + ' left' : String(left)) + '</span>' +
        '<span data-xs3-q>' + PMK.select(S3.q, [
          { value: 'todo', label: 'To review', hint: String(left) },
          { value: 'done', label: 'Reviewed', hint: String(done) },
          { value: 'all', label: 'All', hint: String(q.length) }
        ], { style: 'flex:0 0 auto;min-width:0' }) + '</span>' +
        '</div>';
    } else if (S3.view === 'worktrees') {
      /* THE WORKTREE FILTER BAR, restored. GitHub_Integration.md:L160 requires
         All / Threads / Orchestrator / Manual, defaulting to All and persisted
         per project, and this variant was one of five that dropped it -- a
         regression against the shipped panel, which has it. It lives in the
         same rail slot the review filter uses in the changes view, so it costs
         no new chrome row: the rail is per-view furniture, not a fixed strip. */
      var wtShown = (SC.worktrees || []).filter(function (w) { return wtPass(w); });
      rail = '<div class="pmk-strip">' +
        '<span class="xS3-prog">' + esc(wtShown.length + '/' + (SC.worktrees || []).length) + '</span>' +
        '<span class="pmk-strip-grow"></span>' +
        '<span data-xs3-wtfilter>' + PMK.select(S3.wtf, [
          { value: 'all', label: 'All', hint: String((SC.worktrees || []).length) },
          { value: 'thread', label: 'Threads' },
          { value: 'orch', label: 'Orchestrator' },
          { value: 'manual', label: 'Manual' }
        ], { style: 'flex:0 0 auto;min-width:0' }) + '</span>' +
        '</div>';
    }

    /* -------------------------------------------------------- queue list */
    function queueList() {
      var list = q.filter(function (it) {
        if (S3.q === 'todo') return !rev[it.f.path];
        if (S3.q === 'done') return !!rev[it.f.path];
        return true;
      });
      if (!list.length) {
        return PMK.empty('no-results',
          S3.q === 'todo' ? 'Everything is reviewed' : 'Nothing reviewed yet',
          S3.q === 'todo'
            ? 'All ' + q.length + ' changed files are marked reviewed. Write the message and commit.'
            : 'Mark a file reviewed from its row or its detail to build the reviewed list.',
          S3.q === 'todo' ? 'Commit' : 'Show all');
      }
      return '<div class="xS3-list">' + list.map(function (it) {
        var isDone = !!rev[it.f.path];
        var lead = '<button type="button" class="xS3-mini xS3-check" ' +
          'aria-pressed="' + (isDone ? 'true' : 'false') + '" ' +
          'data-xs3-mark="' + esc(it.f.path) + '" ' +
          'data-pm-tip="' + esc(isDone ? 'Mark not reviewed' : 'Mark reviewed') + '" ' +
          'aria-label="' + esc((isDone ? 'Mark not reviewed: ' : 'Mark reviewed: ') + it.f.path) + '">' +
          ic(isDone ? 'check' : 'circle', 12) + '</button>';
        var inline = b >= 2
          ? miniBtn('xS3', 'ext', 'Open diff for ' + baseOf(it.f.path))
          : '';
        return fileRow('xS3', it, qst, b, {
          lead: lead, inline: inline,
          selected: S3.sel.changes === it.f.path,
          data: 'data-xs3-file="' + esc(it.f.path) + '"'
        });
      }).join('') + '</div>';
    }

    /* --------------------------------------------------------- list body */
    function listBody() {
      if (S3.view === 'changes') return queueList();
      if (S3.view === 'history') {
        return '<div class="xS3-list">' + (SC.history || []).map(function (c) {
          return '<div class="pmk-row pmk-row--2line' +
            (S3.sel.history === c.sha ? ' is-sel' : '') + '" tabindex="0" role="button" ' +
            'data-xs3-commit="' + esc(c.sha) + '" data-pm-ctx="Commit actions" ' +
            'aria-label="' + esc(c.sha + '. ' + c.subject + '. ' + c.who + ', ' + c.when + ' ago') + '">' +
            '<span class="pmk-id-stack">' +
            '<span class="xS3-base">' + esc(elide(c.subject, 'name', cap(qst, 24 + 44))) + '</span>' +
            '<span class="xS3-dir">' + esc(c.sha + '  ' + c.who) + '</span></span>' +
            (b >= 1 ? '<span class="pmk-tail pmk-tail--time">' + esc(c.when) + '</span>' : '') +
            PMK.overflow([
              { value: 'history_open_commit', label: 'Open commit' },
              { value: 'show_commit', label: 'Show commit' },
              { value: 'diff_set_compare_target', label: 'Set compare target' },
              { value: 'open_review', label: 'Open Review Mode' }
            ], 'Commit actions') + '</div>';
        }).join('') + '</div>';
      }
      if (S3.view === 'worktrees') {
        var wtList = (SC.worktrees || []).filter(wtPass);
        if (!wtList.length) {
          return PMK.empty('no-results', 'No worktrees match',
            'The ' + S3.wtf + ' filter hides every worktree in this project.', 'Show all');
        }
        return '<div class="xS3-list">' + wtList.map(function (w) {
          var n = cap(qst, 21 + 24 + 12 + (b >= 2 ? 44 : 0));
          var h = '<div class="pmk-row' + (b >= 1 ? ' pmk-row--2line' : '') +
            (S3.sel.worktrees === w.branch ? ' is-sel' : '') +
            '" tabindex="0" role="button" data-xs3-wt="' + esc(w.branch) + '" ' +
            'data-xs-kind="worktree" data-xs-scope="' + esc(w.branch) + '" ' +
            'data-pm-ctx="Worktree actions" aria-label="' +
            esc(w.branch + stateSay(w) + '. ' +
                (w.owner || 'Owner unresolved') +
                (w.lockedBy ? '. Locked by ' + w.lockedBy : '')) + '">' +
            PMK.statusMark(w.status);
          if (b >= 1) {
            h += '<span class="pmk-id-stack">' +
              '<span class="xS3-base">' + esc(elide(w.branch, 'path', n)) + '</span>' +
              '<span class="xS3-dir">' + esc(elide(w.owner || 'Owner unresolved', 'name',
                Math.floor(n * 1.1))) + '</span></span>';
          } else {
            h += '<span class="pmk-id">' + esc(elide(w.branch, 'path', n)) + '</span>';
          }
          if (b >= 2 && w.run) h += '<span class="pmk-tail pmk-tail--time">' + esc(w.run) + '</span>';
          h += ic('chev', 10, 'pmk-sec-chev');
          h += PMK.overflow(wtActions(w), 'Worktree actions');
          return h + '</div>';
        }).join('') + '</div>';
      }
      if (S3.view === 'graph') {
        return '<div class="xS3-list">' + (SC.branchList || []).map(function (br) {
          var w = by[br.name];
          return PMK.row({
            bucket: b, status: w ? w.status : (br.current ? 'ok' : 'queued'),
            id: br.name, idKind: 'path', idMax: cap(qst, 21 + 24 + 60),
            meta: ['+' + br.ahead, '-' + br.behind, w ? (w.run || w.kind) : ''],
            width: qst.width,
            actions: [
              { value: 'graph.focus', label: 'Focus branch tip' },
              { value: 'graph.filter', label: 'Filter graph' },
              { value: 'graph.layout', label: 'Change layout' }
            ]
          });
        }).join('') + '</div>' +
        '<div class="xS3-det"><span class="pmk-note">' +
        esc('Owner of each branch tip. Keyboard-reachable equivalent of the ' +
            'drawing, which is never the only path to this information.') + '</span></div>';
      }
      /* branches / stash */
      return PMK.section('Branches', counts.branches || 0, true) +
        '<div class="xS3-list">' + (SC.branchList || []).map(function (br) {
          var w = by[br.name];
          return '<div class="pmk-row' + (S3.sel.branches === br.name ? ' is-sel' : '') +
            '" tabindex="0" role="button" data-xs3-branch="' + esc(br.name) + '" ' +
            'data-pm-ctx="Branch actions" aria-label="' +
            esc(br.name + (br.current ? ', current' : '') + ', ahead ' + br.ahead +
                ', behind ' + br.behind + (w && w.lockedBy ? ', owned by ' + w.lockedBy : '')) + '">' +
            PMK.statusMark(br.current ? 'ok' : (w && w.lockedBy ? 'blocked' : 'queued')) +
            '<span class="pmk-id">' + esc(elide(br.name, 'path', cap(qst, 21 + 24 + 52))) + '</span>' +
            (b >= 1 ? '<span class="xS3-nums">' + esc('+' + br.ahead + ' -' + br.behind) + '</span>' : '') +
            PMK.overflow([
              { value: 'switch_branch', label: 'Switch to branch',
                disabled: !!(w && w.lockedBy), reason: (w && w.lockReason) || '',
                sentence: w && w.lockedBy ? branchLockSay(w) : '' },
              { value: 'worktree.compare', label: 'Compare' },
              { value: 'pr.create', label: 'Create pull request' }
            ], 'Branch actions') + '</div>';
        }).join('') + '</div>' +
        PMK.section('Stash', (SC.stash || []).length, true) +
        '<div class="xS3-list">' + (SC.stash || []).map(function (sx) {
          return PMK.row({
            bucket: b, twoLine: true, id: sx.label, idMax: cap(qst, 24 + 44),
            sub: sx.when + ' ago', tail: sx.when, width: qst.width,
            actions: [
              { value: 'stash.apply', label: 'Apply' },
              { value: 'stash.pop', label: 'Pop' },
              { value: 'stash.drop', label: 'Drop', danger: true }
            ]
          });
        }).join('') + '</div>';
    }

    /* ------------------------------------------------------ detail body */
    function detailFile(path) {
      var item = null;
      q.forEach(function (it) { if (!item && it.f.path === path) item = it; });
      if (!item) return '';
      var f = item.f, isDone = !!rev[f.path];
      var cf = conflictOf(SC, f.path);
      var h = '<div class="xS3-det" data-xs-kind="file" data-xs-scope="' + esc(f.path) + '">' +
        '<div class="xS3-dett">' + esc(elide(baseOf(f.path), 'name', cap(dst, 24))) + '</div>' +
        PMK.kv('Path', elide(f.path, 'path', cap(dst, 16)), 'measure', b) +
        PMK.kv('Change', CODE_WORD[f.code] || f.code, 'token', b) +
        PMK.kv('Group', item.group, 'token', b) +
        /* audit-source 4.8: this said 'three-way: base, ours, theirs, result'
           for a conflict the fixture records with base: null, two rows under
           a Conflict field reading 'both added'. The compare target is now a
           function of the conflict record, so the card cannot promise a base
           that does not exist. */
        PMK.kv('Compare target', compareOf(item.group, cf), 'prose', b) +
        PMK.kv('Churn', 'plus ' + f.add + ' minus ' + f.del, 'token', b) +
        (f.from ? PMK.kv('Renamed from', elide(f.from, 'path', cap(dst, 16)), 'measure', b) : '') +
        PMK.kv('Reviewed', isDone ? 'yes' : 'no', 'token', b);
      if (cf) {
        /* The card that promised a side control it did not have now has one:
           both sides, their churn, the marker count, and two peer buttons. */
        h += PMK.kv('Conflict', cf.conflict + ', ' + cf.kind, 'token', b) +
          (cf.sides || []).map(function (sd) {
            return sideKv(sd, b);
          }).join('') +
          PMK.kv('Markers remaining', cf.markersRemaining + ' across ' + plural(cf.hunks, 'hunk'),
                 'prose', b) +
          PMK.kv('Resolved', cf.resolved ? 'yes' : 'no', 'token', b) +
          PMK.blocked({
            code: 'worktree_conflict',
            severity: 'warning',
            sentence: conflictSay(cf),
            actions: [{ id: 'open_conflict', label: 'Open Conflict Assistant' },
                      { id: 'open_merge_editor', label: 'Open merge editor' }]
              .concat((cf.sides || []).map(function (sd) {
                return { id: 'resolve_conflict_side:' + sd.id + ':' + cf.path, label: 'Use ' + sd.id };
              }))
          });
      }
      h += '<div class="xS3-acts">' +
        PMK.btn(isDone ? 'Mark not reviewed' : 'Mark reviewed',
                { primary: true, tip: 'Toggle the review mark for ' + baseOf(f.path) }) +
        actBtn('Open diff', 'diff_open') +
        actBtn(item.group === 'staged' ? 'Unstage' : 'Stage',
               item.group === 'staged' ? 'unstage_hunks' : 'stage_hunks') +
        (cf
          ? (cf.markersRemaining > 0
              ? denyBtn('Mark resolved', 'conflict_markers_remaining',
                        plural(cf.markersRemaining, 'marker') +
                        ' still in the file; marking resolved needs none.')
              : actBtn('Mark resolved', 'mark_conflict_resolved'))
          : '') +
        actBtn('Discard changes', 'discard_hunks', { danger: true }) +
        '</div>';
      return h + '</div>';
    }

    function detailWt(branch) {
      var w = by[branch];
      if (!w) return '';
      var sb3 = stateBlock(w);
      return '<div class="xS3-det" data-xs-kind="worktree" data-xs-scope="' + esc(w.branch) + '">' +
        '<div class="xS3-dett">' + esc(elide(w.branch, 'path', cap(dst, 24))) + '</div>' +
        wtKvs(w, b, dst) +
        sb3 + stateNote(w) +
        '<div class="xS3-acts">' +
          pathBtn('Open Files', w, 'worktree.open_files', true) +
          actBtn('Compare', 'worktree.compare') +
          actBtn(w.kind === 'orch' ? 'Open Lane' : 'Open Thread',
                 w.kind === 'orch' ? 'worktree.open_lane' : 'worktree.open_thread') +
          (sb3 ? '' : actBtn('Focus lineage', 'worktree.focus_lineage')) +
          (sb3 ? '' : gatedBtn('Recover', w, 'recover')) +
          gatedBtn(w.locked ? 'Unlock' : 'Lock', w, w.locked ? 'unlock' : 'lock') +
          gatedBtn('Release', w, 'release') +
          actBtn('Create PR', 'pr.create') +
          gatedBtn('Prune', w, 'prune', true) +
          gatedBtn('Remove', w, 'remove', true) +
        '</div></div>';
    }

    function detailCommit(sha) {
      var c = null;
      (SC.history || []).forEach(function (x) { if (!c && x.sha === sha) c = x; });
      if (!c) return '';
      return '<div class="xS3-det">' +
        '<div class="xS3-dett">' + esc(elide(c.subject, 'name', cap(dst, 24))) + '</div>' +
        PMK.kv('Commit', c.sha, 'measure', b) +
        PMK.kv('Author', c.who, 'token', b) +
        PMK.kv('When', c.when + ' ago', 'token', b) +
        PMK.kv('Compare target', 'selected commit to first parent', 'prose', b) +
        '<div class="xS3-acts">' +
          PMK.btn('Open Review Mode', { primary: true }) +
          PMK.btn('Open commit') +
          PMK.btn('Set compare target') +
        '</div></div>';
    }

    function detailBranch(name) {
      var br = null;
      (SC.branchList || []).forEach(function (x) { if (!br && x.name === name) br = x; });
      if (!br) return '';
      var w = by[br.name];
      var h = '<div class="xS3-det">' +
        '<div class="xS3-dett">' + esc(elide(br.name, 'path', cap(dst, 24))) + '</div>' +
        PMK.kv('Ahead', String(br.ahead), 'token', b) +
        PMK.kv('Behind', String(br.behind), 'token', b) +
        PMK.kv('Current', br.current ? 'yes' : 'no', 'token', b) +
        (w ? PMK.kv('Owning worktree', w.branch, 'measure', b) : '');
      if (w && w.locked) {
        /* Ownership consequence, not a cosmetic badge: this branch opens
           read-only while an active worktree owns it. */
        h += PMK.blocked({
          code: w.lockReason || 'worktree_owned_by_active_run',
          severity: 'warning',
          sentence: lockSay(w) + ' Switching would move a checkout that hold depends on, ' +
            'so this branch opens read-only.',
          actions: [{ id: (w.kind === 'orch' ? 'worktree.open_lane:' : 'worktree.open_thread:') + w.branch,
                      label: w.kind === 'orch' ? 'Open Lane' : 'Open Thread' },
                    { id: 'worktree.focus_lineage:' + w.branch, label: 'Focus lineage' },
                    { id: 'worktree.compare', label: 'Compare' }]
        });
      }
      h += '<div class="xS3-acts">' +
        (w && w.locked
          ? denyBtn('Switch', w.lockReason || 'worktree_owned_by_active_run', lockSay(w))
          : actBtn('Switch', 'switch_branch', { primary: true })) +
        actBtn('Compare', 'worktree.compare') +
        actBtn('Create pull request', 'pr.create') +
        '</div></div>';
      return h;
    }

    function detailBody() {
      if (S3.view === 'changes') return detailFile(S3.sel.changes);
      if (S3.view === 'worktrees') return detailWt(S3.sel.worktrees);
      if (S3.view === 'history') return detailCommit(S3.sel.history);
      if (S3.view === 'branches') return detailBranch(S3.sel.branches);
      return '';
    }

    function detailTitle() {
      if (S3.view === 'changes' && S3.sel.changes) return baseOf(S3.sel.changes);
      if (S3.view === 'worktrees' && S3.sel.worktrees) return S3.sel.worktrees;
      if (S3.view === 'history' && S3.sel.history) return S3.sel.history;
      if (S3.view === 'branches' && S3.sel.branches) return S3.sel.branches;
      return '';
    }

    var detail = detailBody();

    /* ---------------------------------------------------------- assembly
       Everything between the rail and the footer lives in ONE .xS3-main box.
       That is the push region: below 480px it holds either the queue or the
       back-bar-plus-detail, and PMM.push needs a single node to slide. Above it
       the box holds the two columns and the push moves to the detail column
       alone. The wrapper is a flex column at flex:1 1 auto, min-height:0 --
       exactly the flex context .xS3-cols and .xS3-scroll had as direct children
       of .pmk-panel, which is why it measures identically. */
    var main;
    if (b >= 3) {
      main = '<div class="xS3-cols">' +
        '<div class="xS3-col xS3-col--q"><div class="xS3-scroll">' + listBody() + '</div></div>' +
        '<div class="xS3-col xS3-col--d"><div class="xS3-scroll">' +
          (detail || PMK.empty('no-data', 'Nothing selected',
            'Pick a row on the left to see its identity, compare target and actions.', '')) +
        '</div></div></div>';
    } else if (detail) {
      main = '<div class="xS3-back">' +
        '<button type="button" class="xS3-mini" data-xs3-back="1" ' +
        'data-pm-tip="Back to the list" aria-label="Back to the list">' + ic('back', 12) + '</button>' +
        '<span class="xS3-backt">' + esc(elide(detailTitle(), 'name', cap(st, 24 + 24))) + '</span>' +
        PMK.overflow([
          { value: 'next', label: 'Next unreviewed' },
          { value: 'prev', label: 'Previous' },
          { value: 'open_review', label: 'Open Review Mode' }
        ], 'Detail actions') + '</div>' +
        '<div class="xS3-scroll">' + detail + '</div>';
    } else {
      main = '<div class="xS3-scroll">' + listBody() + '</div>';
    }
    main = '<div class="xS3-main">' + main + '</div>';

    /* ------------------------------------------------------- the footer
       Outside the push region on purpose: the composer survives stepping into
       a file, which is the whole workflow this panel is built around. */
    var foot;
    if (S3.view === 'changes') {
      foot = '<div class="xS3-foot">' +
        '<textarea class="pmk-field xS3-msg" rows="' + (b >= 2 ? 3 : 1) + '" ' +
        'placeholder="Commit message" aria-label="Commit message">' +
        esc(SC.commitDraft || '') + '</textarea>' +
        (b >= 1 ? '<div class="xS3-prog">' +
          esc(done + ' of ' + q.length + ' reviewed, ' + (counts.staged || 0) + ' staged') +
          '</div>' : '') +
        '<div class="pmk-btnrow">' +
          (left > 0
            ? PMK.btn('Review next', { primary: true, tip: left + ' files still unreviewed' })
            : '') +
          PMK.btn('Commit', { primary: left === 0, tip: 'Commit the staged files' }) +
          PMK.overflow([
            { value: 'generate_commit_message', label: 'Generate commit message' },
            { value: 'suggest_commit_batches', label: 'Suggest commit batches' },
            { type: 'sep' },
            { value: 'commit_push', label: 'Commit and push' },
            { value: 'amend', label: 'Amend last commit' }
          ], 'Commit options') +
        '</div></div>';
    } else {
      var primaryLbl = S3.view === 'worktrees' ? 'New worktree'
        : S3.view === 'history' ? 'Open Review Mode'
        : S3.view === 'graph' ? 'Focus current branch' : 'New branch';
      foot = '<div class="xS3-foot"><div class="pmk-btnrow">' +
        PMK.btn(primaryLbl, { primary: true }) +
        PMK.overflow([
          { value: 'load_older', label: 'Load older' },
          { value: 'hide_stale', label: 'Hide stale worktrees' },
          { value: 'open_review', label: 'Open Review Mode' }
        ], 'View options') + '</div></div>';
    }

    return '<div class="pmk-panel xS3">' + head + lensStrip + rail + main + foot + '</div>';
  }

  /* =====================================================================
     WIRING
     The harness has no per-version event bus, so each variant wires its own by
     delegation, once, and repaints exactly one stage from THAT stage's config.
     Sections toggle in the DOM rather than by repaint, so expanding a section
     never loses scroll position or the text in the composer.
     ===================================================================== */
  /* aria-expanded stays the caller's job -- GI-004 requires the header be an
     accessible button and the accessible state is not the motion layer's to
     fake, which is exactly what _pm-motion.js says about PMM.expand. */
  function toggleSection(btn) {
    var open = btn.getAttribute('aria-expanded') === 'true';
    var body = btn.nextElementSibling;
    btn.setAttribute('aria-expanded', open ? 'false' : 'true');
    if (body && body.classList.contains('xS1-secbody')) xExpand(body, !open);
  }

  /* ------------------------------------------------- the gate, delegated
     Strong actions arrive by three routes and all three land in one place:
     a pm-menu item (pm:menuaction, the kit's event), a .pmk-btn this file
     stamped with data-xs-act, and an allowed-action button PMK.blocked
     stamped with data-pm-action. Routing them separately is how one of the
     three ends up ungated. */
  function isMine(node) {
    var s = node && node.closest ? node.closest('.pm-stage') : null;
    var v = s && s.getAttribute('data-pm-version');
    return (v === 'xS1' || v === 'xS2' || v === 'xS3') ? s : null;
  }

  /* Review marks are the one subject in this panel that IS this file's state,
     so their gates actually perform the action they described. */
  function applyReview(act, stage) {
    var SC = SRC(), rev = s3Reviewed(SC);
    if (act === 'reset_review') {
      Object.keys(rev).forEach(function (k) { delete rev[k]; });
    } else {
      queueOf(SC).forEach(function (it) { rev[it.f.path] = true; });
    }
    repaint(stage, s3Panel, function (view) {
      flash(view.querySelector('.xS3-meter'), act === 'reset_review' ? '' : 'up');
    });
  }

  /* xS1 is the one variant that otherwise never repaints -- its thesis is that
     the masthead stays put -- so the one thing that MUST rebuild it, a change
     of active context, carries the composer text across by hand rather than
     making the user retype a draft to look at another lane. */
  function repaintS1(stage) {
    var was = stage.querySelector('[data-pm-panelview]');
    var msg = stage.querySelector('.xS1-msg');
    var draft = msg ? msg.value : null;
    /* Section state is the other thing a rebuild would throw away, and at
       240px the Worktrees filter lives INSIDE the Worktrees section -- so a
       repaint that reset the accordion would close the section the user was
       filtering, from a control inside it. Restored by index: the section
       list is fixed, only its contents change. Set directly rather than
       through xExpand, because restoring a state is not a transition. */
    var open = was ? Array.prototype.map.call(was.querySelectorAll('.pmk-sec'), function (s) {
      return s.getAttribute('aria-expanded') === 'true';
    }) : [];
    repaint(stage, s1Panel, function (view) {
      var m = view.querySelector('.xS1-msg');
      if (m && draft != null) m.value = draft;
      Array.prototype.forEach.call(view.querySelectorAll('.pmk-sec'), function (s, i) {
        if (i >= open.length || (s.getAttribute('aria-expanded') === 'true') === open[i]) return;
        s.setAttribute('aria-expanded', open[i] ? 'true' : 'false');
        var body = s.nextElementSibling;
        if (!body || !body.classList.contains('xS1-secbody')) return;
        if (open[i]) body.removeAttribute('hidden'); else body.setAttribute('hidden', '');
      });
    });
  }

  function contextPick(stage, branch) {
    var v = stage.getAttribute('data-pm-version');
    if (v === 'xS1') { S1.sel = branch; repaintS1(stage); return; }
    if (v === 'xS2') {
      S2.lane = branch;
      repaint(stage, s2Panel, function (view) { push(view.querySelector('.xS2-focus'), 'fwd'); });
      return;
    }
    S3.view = 'worktrees';
    S3.sel.worktrees = branch;
    repaint(stage, s3Panel, function (view) { push(view.querySelector('.xS3-main'), 'fwd'); });
  }

  function dispatchAct(act, node, stage) {
    if (act.indexOf('ctx:') === 0) { contextPick(stage, act.slice(4)); return; }
    /* ONE MICROTASK, and it is load-bearing. pm-menu dispatches pm:menuaction
       and THEN closes itself with close(true), which calls trigger.focus() --
       synchronously, after this handler returns. Opening the sheet inline
       therefore focuses the confirm button and has it stolen back by the menu
       trigger behind the scrim a moment later, leaving a modal dialog with
       focus outside it. Deferring to the microtask queue lets the menu finish
       closing first, so PM.confirm's own focus capture is the last word. */
    Promise.resolve().then(function () { return gate(act, node); }).then(function (ok) {
      if (!ok) return;
      if (act === 'reset_review' || act === 'mark_all_reviewed') applyReview(act, stage);
      /* Everything else performs nothing here: the fixture is read-only and
         shared. The gate is the behaviour under test, not the mutation. */
    });
  }

  function onMenuAction(e) {
    var stage = isMine(e.target);
    if (!stage) return;
    var act = e.detail && e.detail.action;
    if (!act) return;
    dispatchAct(act, e.target, stage);
  }

  function onActClick(e) {
    var t = e.target;
    if (!t || !t.closest) return;
    var btn = t.closest('[data-xs-act],[data-pm-action]');
    if (!btn || btn.getAttribute('aria-disabled') === 'true') return;
    var stage = isMine(btn);
    if (!stage) return;
    var act = btn.getAttribute('data-xs-act') || btn.getAttribute('data-pm-action');
    if (!act) return;
    e.stopPropagation();
    dispatchAct(act, btn, stage);
  }

  function onClickS1(e) {
    var t = e.target;
    if (!t || !t.closest) return;
    var stage = stageOf(t, 'xS1');
    if (!stage) return;
    var sec = t.closest('.pmk-sec');
    if (sec && stage.contains(sec)) { toggleSection(sec); return; }
    if (t.closest('.pm-menu-trigger') || t.closest('[data-pm-select]') ||
        t.closest('.xS1-mini') || t.closest('.pmk-btn')) return;
    var wt = t.closest('[data-xs1-wt]');
    if (!wt) return;
    var open = wt.getAttribute('aria-expanded') === 'true';
    var det = wt.nextElementSibling;
    wt.setAttribute('aria-expanded', open ? 'false' : 'true');
    if (det && det.hasAttribute('data-xs1-wtd')) xExpand(det, !open, true);
  }

  function onKeyS1(e) {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    var t = e.target;
    if (!t || !t.closest) return;
    var wt = t.closest ? t.closest('[data-xs1-wt]') : null;
    if (!wt || !stageOf(wt, 'xS1')) return;
    e.preventDefault();
    onClickS1({ target: wt });
  }

  /* .pmk-lens ONLY, never parentNode.children. PMM.lens appends a
     .pmm-lens-ind span to the strip it drives, so once a strip has travelled
     once its child list is one longer than its id list. Counting children
     would map the last lens to the wrong id and would let End land keyboard
     focus on the indicator, which is aria-hidden and not focusable. */
  function lensButtons(strip) {
    return Array.prototype.slice.call(strip.querySelectorAll('.pmk-lens'));
  }
  function lensIndex(btn) {
    return btn && btn.parentNode ? lensButtons(btn.parentNode).indexOf(btn) : -1;
  }
  function lensIdFrom(wrap, btn) {
    var ids = (wrap.getAttribute('data-ids') || '').split(',');
    var i = lensIndex(btn);
    return i >= 0 ? ids[i] : null;
  }

  /* xS2 — one primitive per interaction, and never two at once.
       lane click   the whole focus region is a different object now, so the
                    focus region is the frame that pushes. Direction is the
                    lane's position in the list the user is looking at: picking
                    a lane further down enters from the right, further up from
                    the left. That is the vD convention read sideways, and it is
                    what makes the swap legible as "you moved" rather than
                    "something blinked".
       lens click   only the view body changed -- ident, ownership block and the
                    composer are the same lane -- so the push is scoped to
                    .xS2-body. Pushing the whole focus for a view switch would
                    animate five things that did not change.
       filter click the lane LIST is replaced by a different set of lanes, which
                    is the one xS2 interaction that is a list arrival, so it
                    gets .pmm-enter and the focus region stays still. */
  function onClickS2(e) {
    var t = e.target;
    if (!t || !t.closest) return;
    var stage = stageOf(t, 'xS2');
    if (!stage) return;
    var lens = t.closest('.pmk-lens');
    if (lens) {
      var wrapV = lens.closest('[data-xs2-lens]');
      if (wrapV) {
        /* both indices read BEFORE the repaint: the nodes are about to be
           replaced, so the direction has to be decided on the live tree */
        var dirV = dirOfMove(
          lensIndex(lens.parentNode.querySelector('.pmk-lens[aria-selected="true"]')),
          lensIndex(lens));
        S2.view = lensIdFrom(wrapV, lens) || S2.view;
        repaint(stage, s2Panel, function (view) {
          push(view.querySelector('.xS2-body'), dirV);
        });
        return;
      }
      var wrapF = lens.closest('[data-xs2-filter]');
      if (wrapF) {
        S2.filter = lensIdFrom(wrapF, lens) || S2.filter;
        repaint(stage, s2Panel, function (view) {
          enter(view.querySelector('.xS2-lanes .xS2-list'));
        });
        return;
      }
    }
    if (t.closest('.pm-menu-trigger') || t.closest('[data-pm-select]') ||
        t.closest('.xS2-mini') || t.closest('.pmk-btn') || t.closest('.pmk-sec')) return;
    var lane = t.closest('[data-xs2-lane]');
    if (lane) {
      var fromL = sibIndex(lane.parentNode.querySelector('.pmk-row.is-sel'));
      var dir = dirOfMove(fromL, sibIndex(lane));
      S2.lane = lane.getAttribute('data-xs2-lane');
      repaint(stage, s2Panel, function (view) {
        push(view.querySelector('.xS2-focus'), dir);
      });
    }
  }

  /* xS3 — the push is the design. Below 480px picking a row REPLACES the queue
     with the detail, which is the same navigation vD performs, so it uses the
     same primitive and the same convention: deeper enters from the right, Back
     enters from the left. At 480px the queue never leaves, so the push narrows
     to the detail COLUMN -- one node either way, which is why the whole region
     is wrapped in .xS3-main and the column scroller is addressable on its own.
     Selecting is always forward: at bucket 3 there is no "up the stack" to go,
     and a detail pane that slid left or right by list order would be reading a
     direction into a lateral swap. */
  function s3Push(stage, dir) {
    repaint(stage, s3Panel, function (view) {
      var col = view.querySelector('.xS3-col--d > .xS3-scroll');
      push(col || view.querySelector('.xS3-main'), dir);
    });
  }

  function onClickS3(e) {
    var t = e.target;
    if (!t || !t.closest) return;
    var stage = stageOf(t, 'xS3');
    if (!stage) return;

    var lens = t.closest('.pmk-lens');
    if (lens) {
      var wrap = lens.closest('[data-xs3-lens]');
      if (wrap) {
        var id = lensIdFrom(wrap, lens);
        var dirV = dirOfMove(
          lensIndex(lens.parentNode.querySelector('.pmk-lens[aria-selected="true"]')),
          lensIndex(lens));
        if (id) {
          S3.view = id;
          /* a view switch changes the whole region, list and detail together */
          repaint(stage, s3Panel, function (view) {
            push(view.querySelector('.xS3-main'), dirV);
          });
        }
        return;
      }
    }
    var mark = t.closest('[data-xs3-mark]');
    if (mark) {
      e.stopPropagation();
      var p = mark.getAttribute('data-xs3-mark');
      var rev = s3Reviewed(global.PM_DATA.source);
      var was = !!rev[p];
      if (was) delete rev[p]; else rev[p] = true;
      /* The rail is the only thing in the panel that changed under the user
         rather than in front of them -- the row itself usually leaves the list
         entirely under the To review filter, so without this the segment that
         just flipped is the one thing nobody looks at. Up when a file is
         cleared; the neutral accent when a mark is taken back, because undoing
         a review is not an error and --accent-error would say it was. */
      repaint(stage, s3Panel, function (view) {
        flash(view.querySelector('.xS3-meter'), was ? '' : 'up');
      });
      return;
    }
    if (t.closest('[data-xs3-back]')) {
      S3.sel[S3.view] = null;
      repaint(stage, s3Panel, function (view) {
        push(view.querySelector('.xS3-main'), 'back');
      });
      return;
    }
    if (t.closest('.pm-menu-trigger') || t.closest('[data-pm-select]') ||
        t.closest('.xS3-mini') || t.closest('.pmk-btn') || t.closest('.pmk-sec')) return;

    var f = t.closest('[data-xs3-file]');
    if (f) { S3.sel.changes = f.getAttribute('data-xs3-file'); s3Push(stage, 'fwd'); return; }
    var w = t.closest('[data-xs3-wt]');
    if (w) { S3.sel.worktrees = w.getAttribute('data-xs3-wt'); s3Push(stage, 'fwd'); return; }
    var c = t.closest('[data-xs3-commit]');
    if (c) { S3.sel.history = c.getAttribute('data-xs3-commit'); s3Push(stage, 'fwd'); return; }
    var br = t.closest('[data-xs3-branch]');
    if (br) { S3.sel.branches = br.getAttribute('data-xs3-branch'); s3Push(stage, 'fwd'); }
  }

  /* Roving Left/Right/Home/End over any lens strip in these three variants.
     Manual activation: moving focus does not switch the view, because a view
     switch here is a full repaint. */
  function onKeyLens(e) {
    var t = e.target;
    if (!t || !t.closest) return;
    var btn = t.closest('.pmk-lens');
    if (!btn) return;
    var stage = btn.closest('.pm-stage');
    var v = stage && stage.getAttribute('data-pm-version');
    if (v !== 'xS2' && v !== 'xS3') return;
    var kids = lensButtons(btn.parentNode);
    var i = kids.indexOf(btn), n = kids.length, j = -1;
    if (e.key === 'ArrowRight') j = (i + 1) % n;
    else if (e.key === 'ArrowLeft') j = (i - 1 + n) % n;
    else if (e.key === 'Home') j = 0;
    else if (e.key === 'End') j = n - 1;
    else return;
    e.preventDefault();
    if (kids[j] && kids[j].focus) kids[j].focus();
  }

  /* The bucket-0 portaled pickers emit pm:change instead of a click. Same
     primitives, chosen the same way -- 240px is the width where the design has
     the least room to explain itself, so it is the LAST place to drop the
     motion that says which region just changed. There is no strip to read a
     direction from here, so a picker change is always forward. */
  function onChange(e) {
    var t = e.target;
    if (!t || !t.closest) return;
    var val = e.detail && e.detail.value;
    if (!val) return;
    var s1 = stageOf(t, 'xS1');
    if (s1) {
      if (t.closest('[data-xs1-wtfilter]')) { S1.wtf = val; repaintS1(s1); }
      return;
    }
    var s2 = stageOf(t, 'xS2');
    if (s2) {
      if (t.closest('[data-xs2-lens]')) {
        S2.view = val;
        repaint(s2, s2Panel, function (view) { push(view.querySelector('.xS2-body'), 'fwd'); });
        return;
      }
      if (t.closest('[data-xs2-filter]') || t.closest('[data-xs2-filterpick]')) {
        S2.filter = val;
        repaint(s2, s2Panel, function (view) {
          enter(view.querySelector('.xS2-lanes .xS2-list'));
        });
        return;
      }
      if (t.closest('[data-xs2-lanepick]')) {
        S2.lane = val;
        repaint(s2, s2Panel, function (view) { push(view.querySelector('.xS2-focus'), 'fwd'); });
        return;
      }
      return;
    }
    var s3 = stageOf(t, 'xS3');
    if (s3) {
      if (t.closest('[data-xs3-lens]')) {
        S3.view = val;
        repaint(s3, s3Panel, function (view) { push(view.querySelector('.xS3-main'), 'fwd'); });
        return;
      }
      if (t.closest('[data-xs3-q]')) {
        /* the queue filter swaps one list for a different one, which is a list
           arrival and not a navigation */
        S3.q = val;
        repaint(s3, s3Panel, function (view) { enter(view.querySelector('.xS3-list')); });
        return;
      }
      if (t.closest('[data-xs3-wtfilter]')) {
        /* same shape as the queue filter, and the same primitive: the worktree
           list is REPLACED by a different set of lanes, so it arrives. */
        S3.wtf = val;
        S3.sel.worktrees = null;
        repaint(s3, s3Panel, function (view) { enter(view.querySelector('.xS3-list')); });
      }
    }
  }

  if (!global.__xSourceBound) {
    global.__xSourceBound = true;
    document.addEventListener('pm:menuaction', onMenuAction);
    document.addEventListener('click', onActClick);
    document.addEventListener('click', onClickS1);
    document.addEventListener('click', onClickS2);
    document.addEventListener('click', onClickS3);
    document.addEventListener('keydown', onKeyS1);
    document.addEventListener('keydown', onKeyLens);
    document.addEventListener('pm:change', onChange);
  }

  /* ============================================================ register
     Each registers ONLY the source panel; the other six fall back to the
     harness placeholder, which is how a panel-scoped variant stays comparable
     against the six full systems without pretending to be one. */
  global.PM_BAKEOFF.register('xS1', {
    name: 'Source: Commit Desk',
    blurb: 'The composer is the masthead; every list below is graded by whether it is in the commit.',
    panels: { source: s1Panel }
  });

  global.PM_BAKEOFF.register('xS2', {
    name: 'Source: Lane Board',
    blurb: 'The worktree is the primary object; changes, history and branches are properties of the selected lane.',
    panels: { source: s2Panel }
  });

  global.PM_BAKEOFF.register('xS3', {
    name: 'Source: Review Queue',
    blurb: '16 changed files as a worklist with a progress rail, push detail, and a two-column 480px split.',
    panels: { source: s3Panel }
  });
})(window);
