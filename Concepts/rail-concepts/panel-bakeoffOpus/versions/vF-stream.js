/* PANEL BAKEOFF — vF STREAM
   =========================================================================
   THESIS
   -------------------------------------------------------------------------
   Every panel's primary axis is TIME, not object. Each of the seven panels is
   one reverse-chronological activity stream of its domain, and the domain's
   objects become FILTERS over that stream rather than the stream's structure.

   The narrow-width mechanic is UNIFORMITY BY EVENT. There is exactly one row
   shape in the entire version — an event — so the 240px problem is solved
   once, for one row type, and never re-solved per domain. Seven panels, one
   grammar, one measurement.

   ROW ANATOMY
   -------------------------------------------------------------------------
     | 5h  |R X| #310 CI - build + test    failed |   32px (36px friendly)
     |     |   | cargo test - assertion failed... |   line 2
       ^34   ^21px status gutter (3px rail + 14px glyph)

   The 34px anchor column is the row's ORDERING KEY, always at the left edge,
   never shrinking, never growing, always font-variant-numeric: tabular-nums.
   For six panels the key is time. For Search match rows it is the line number
   (see DEVIATIONS). The fixture's own null-time token is "--" and it is used
   verbatim for events the fixtures do not timestamp.

   ORDERING RULE. Reverse-chronological. Rows the fixtures do not timestamp
   sort within their lifecycle group rather than being dumped at one end: an
   untimed LIVE row (a blocked or queued delegation, a running compose
   service) sits above the terminal history, an untimed TERMINAL row (a
   worktree checkout, a queued publish stage) sits below it. That rule is
   stated because it is the first thing a time-axis system has to compromise
   on, and hiding the compromise would be the dishonest move.

   FRAME
   -------------------------------------------------------------------------
     [ panel header      28px ]  PMK.head - label + live event count
     [ stream controls   32px ]  [Live/Paused] [ filter... ] [overflow]
     [ object chips      30px ]  PMK.lenses strip - THE DOMAIN LIVES HERE
     [ pinned state    24-110px] the "what IS" block (see RISK 1)
     [ stream body       inf  ]  the one scroller; role=listbox
     [ jump-to-latest pill    ]  overlay, rendered only while paused
     [ footer          0-64px ]  tests only: redaction_notice + artifact_preview

   Nominal control heights are 24px; the strips are 30-32px because a 24px
   control plus the kit's 2-4px strip padding cannot be 24px total. Those are
   the honest numbers, not the diagram's.

   WIDTH LADDER (keyed off PM_DATA.bucket, never a continuum)
   -------------------------------------------------------------------------
                   | 240 (b0)      | 320 (b1)   | 380 (b2)     | 480 (b3)
     anchor column | relative 34px | relative   | relative     | rel + clock 68px
     row           | key+rail+glyph| + verb tail| + full line 2| + owning-object col
                   | + subject     |            |              |
     line 2        | blocks/fails  | blocks/fails| all rows    | all rows
     chips         | portaled picker| short lbl | full + count | full + sort control
     meta cap      | 2 segments    | 3          | 4            | unbounded

   b0's chips are a portaled PMK.select rather than "icons + count" because
   Docker has 10 subviews and 10 x 24px = 240px against a 224px band. That is
   arithmetic (versions/README.md), and PMK.lenses already collapses for it.
   Icons-only is separately barred for Docker: research/docker.md:L249 notes
   Registries vs Registries / Docker Hub are not iconographically separable.

   THE FOUR RISKS — HANDLED, NOT HIDDEN
   -------------------------------------------------------------------------
   RISK 1. A stream answers "what happened", not "what is". "Which containers
   are running right now?" is a state question and a feed answers it badly.
   Every panel therefore carries a PINNED STATE HEADER above the stream:
   Search pins the query session + freshness, Source pins WORKING, Actions
   pins account/readiness/blocked, Docker pins runtime + the CRAU-007 subview
   selector, Tests pins active_run_detail, Agents pins the roster counts,
   Artifacts pins the investigation bundle.
   >>> Having now written seven state headers, this version has partially
   >>> rebuilt a focus-card system. The pinned block is 24-110px of every
   >>> panel; on Actions at 240px it is roughly a third of the column. If the
   >>> pinned block keeps growing under review, STREAM converges on a
   >>> card-plus-list design and its distinctiveness is the list, not the
   >>> thesis. That is the honest read and reviewers should apply it.

   RISK 2. Source Control cannot be committed from a feed. The WORKING block
   is pinned and non-negotiable: branch picker, staged/unstaged counts,
   commit-message field, AI + Commit. research/source.md:L167 additionally
   requires it be docked outside the list's scroll container, which the pin
   satisfies exactly. Note the blocking gap it inherits: research/source.md
   §10 gap 1 says no canonical command id exists for commit/push/pull/stage,
   so the Commit button here has no wired command to dispatch.

   RISK 3. Docker fights its owner doc. research/docker.md frames Docker as
   "a navigator plus one CTA, not a cockpit" (L243): one asset list scoped by
   a CRAU-007 subview selector, object axis first, one subview-scoped primary
   CTA. A feed is a different surface. Shipping STREAM for Docker requires an
   owner-doc reconciliation and this file does not pretend otherwise.
   Correction to the brief this version was written from: that brief attributed
   a "unified asset explorer" requirement to CRAU-009. research/docker.md does
   NOT carry that framing — it cites CRAU-009 only as the hide-vs-disable rule
   (unsupported subviews stay visible with a disabled reason). The conflict is
   real but its citation is CRAU-007 + L239/L243, not CRAU-009. The
   reconciliation implemented here: all 10 subviews stay reachable and
   disabled-with-reason inside a PMK.select in the pinned block, so CRAU-009
   is satisfied even though the subview is no longer the panel's spine.

   RISK 4. Friendly is the aesthetic risk — a dense log is the least cozy
   thing possible. Rows take a theme-driven height (32px, 36px under friendly)
   and friendly softens the rails (rounded, 80% opacity). No row sets
   overflow:hidden, so friendly's 2px hover ring and 22px glow are not clipped.

   RISK 5 (found during research, not in the brief). Two owner docs contradict
   the thesis outright, and one of them is the panel the brief called the most
   natural fit:
     - Artifacts. research/artifacts.md:L186 quotes the owner doc verbatim:
       "Runtime Artifacts never infers lost identity from timestamps or from
       its rebuildable index." The log-like surface is assigned by name to a
       SEPARATE view (L120), the axis is object + investigation-bundle, member
       order is task-phase (baseline > repro > diagnosis > fix > verification),
       not chronological, and there is no follow / jump-to-latest / live-append
       language anywhere in the brief. Artifacts is the WORST doctrinal fit of
       the seven, not the best.
     - GitHub Actions. GI-017 forbids silently aggregating multiple worktrees
       into one branch stream (research/actions.md:L109), and L144 assigns
       pause / follow / jump-to-latest to the bottom runtime zone rather than
       to this panel. This version's mitigation is that the aggregation is not
       silent: the chip strip makes BRANCH the filter axis (chip 1 = main =
       the "Current Branch" subview), every row carries its branch, and the
       three canonical subviews stay visible in the pinned selector.
   The brief's "lands FinalGUISpec.md:719-721 natively" claim survives only for
   the windowing half (initial_window, page_size, max_live_rows,
   max_in_memory_rows, load-older, filter-first). The follow/pause/jump half is
   assigned elsewhere for Actions. Say so before anyone ships it.

   MOTION
   -------------------------------------------------------------------------
   ONE primitive from the shared layer, used twice: PMM.enter on the stream so
   an arriving event enters at the TOP rather than appearing, and PMM.enter on
   the jump-to-latest pill so the "there is newer content" affordance arrives
   rather than blinking in. The cascade is capped at four steps by the layer,
   which is the whole reason a 23-row feed can animate at all without the
   reader waiting on it. Nothing else moves: a feed that flashed its rows
   would be a feed you cannot read. Full rationale, including why the enter is
   gated on a width-free signature, in the MOTION block below.

   SLINT MAPPING
   -------------------------------------------------------------------------
   streamFrame maps to a ListView over a ring-buffer-backed custom Model capped
   at max_live_rows. Consequence: the §14.3 custom Model work becomes MANDATORY
   rather than optional for this version. Slint's built-in VecModel copies on
   every append and cannot express a bounded live tail with load-older paging,
   so a Model impl with a fixed-capacity ring buffer plus a paged tail is a
   hard prerequisite, not a nice-to-have. The rest ports cleanly:
     - the anchor column is a fixed 34px / 68px Rectangle, so Slint never has
       to measure text to lay out a row;
     - one row type means ONE Slint component with one delegate, instead of
       seven; bucket is computed once in Rust and read as a property;
     - tail slots drop whole by bucket, so no runtime text measurement;
     - chips are the existing lens strip; at b0 they are a portaled popup,
       which Slint already needs for every other picker.
   Row height is the one wrinkle: a two-line row is ~48px and a one-line row
   32/36px, so the Model must expose a per-row height or the ListView must use
   a variable-height delegate.

   DEVIATIONS AND COSTS, STATED
   -------------------------------------------------------------------------
   1. The anchor column costs 38px of every row at every width, forever. At
      240px that leaves ~141px of text band, ~21 characters at 11px mono. For
      Search that is 5-6 characters of match context less than a design with no
      anchor column. This is the single largest measurable cost of the thesis.
   2. Search matches have no timestamps. The anchor column carries the LINE
      NUMBER for match rows. research/search.md:L114 argues against a 28px line
      gutter because it costs 12.5% of the panel on every row; here the column
      already exists for six other panels, so the gutter is free and the match
      window gets the whole remaining band. The text window is centred on the
      match per research/search.md:L115, never column 0.
   3. Search chips are the matched FILES, not past query sessions. The brief
      asked for query sessions; _pm-data.js supplies exactly one query and no
      session history, and inventing session names would break the
      all-content-from-fixtures rule. The query session identity is pinned
      instead. In production this strip is driven by
      search_query_state.v1:{project_id}:{query_session_id}.
   4. At b3 the anchor column shows a clock time beside the relative age. The
      fixtures carry relative ages only, so the clock is COMPUTED from one
      fixed session anchor (see ANCHOR_MIN). No new content strings are
      introduced and ages of a day or more render no clock at all rather than
      a misleading time-without-date. A composite live elapsed ("4m 12s") is
      rendered at its leading unit ("4m"): the anchor column is a fixed 34px
      and a 5-character token with two letter glyphs measures ~33px in
      basic-*, which is Inter 10px plus 0.02em tracking. Coarsening the token
      is the honest fix; widening the column would have moved every row in
      every panel to buy one fixture's seconds.
   5. Blocked events are the ONE exception to row uniformity: they attach a
      PMK.blocked block under the row. GI-017 / GAAAF-005 / CRAU-021 all
      require the reason code verbatim plus its sentence plus real action
      buttons, and that cannot be done inside two 11px lines at 240px. One
      exception, applied identically in Actions, Docker, Agents and Tests.
   6. Rows are role="option" in a role="listbox", not role="button".
      research/docker.md:L253 requires "the row body is never a button" while
      research/agents.md:L115 requires the row itself be the lineage
      entrypoint and a single focusable element. Selection-then-activate
      satisfies both, and keeps Up/Down/Enter/Escape/Home/End
      (FinalGUISpec.md:2129-2135).
   7. Artifact kind is a muted 14px glyph. Encoding 19 canonical kinds as
      glyphs needs 19 distinct marks; the shared kit has 22 icons total and
      several already carry status meaning. The 19-kind abbreviation mapping is
      an open spec gap (research/artifacts.md §12) and a glyph-only encoding at
      240px is a real risk, not a solved problem.
   8. The stream scroller carries .pm-sp-content so the fit checker's R5
      (horizontal scroll) and R8 (cross-theme height blowup) actually run
      against this version. Opting out would have hidden the exact risk the
      friendly 36px row and the wrapping pinned block create.
   9. Fixture reason codes rendered verbatim that are NOT canonical upstream:
      "needs_authority" (agents) does not exist in Plans
      (research/agents.md:L105); "actions_missing_scope_runtime" and
      "actions_environment_review_required" are GI-017 codes that have no
      canonical user-facing string (research/actions.md:L168 — 13 of 20 codes
      have none), so the sentences shown come from the fixture.

   10. Chip labels are pre-elided AND the chips carry data-fit-allow="R2".
      .pmk-lenses is overflow-x:auto, so chips past the fold are scrolled out
      of view rather than escaped; the checker exempts [data-pm-portal] for
      exactly this reason but has no equivalent exemption for a scroller's own
      children. This produced 244 suppressions when it was written; the
      current checker raises none of them, so the attribute is now inert and
      is kept only because the exemption gap it names is still real.
   11. basic-* promotes every muted secondary colour to --text-secondary. A
      feed leans on muted text far harder than a card layout: the anchor
      column, verb tail, line 2 and owning-object column are all secondary, and
      --text-muted measures under 4.5:1 on --surface in both basic themes,
      where §13.1 mandates AA. The override is scoped to
      [data-pm-version="vF"] so it cannot repaint another version's stage.
   12. A GATE THAT LIVES ONLY IN A TEMPLATE IS NOT A GATE. The GI-021
      repository lifecycle gate (see repoGate) was already computed, and was
      written only into the disabled-item attributes of overflow templates.
      A template is inert, so the live DOM carried 87 gated menu items and
      ZERO disabled controls: the panel printed "archived" and "You can view
      runs but cannot dispatch" and offered every mutation anyway, everywhere
      a reader could see one. Asserting a constraint the surface does not
      enforce is worse than never asserting it. The repository-scope mutations
      are now VISIBLE and disabled in the pinned capability block, per
      GitHub_Integration.md:L1275, and the menus keep their gates as well.
      Two shared-layer gaps this exposed are REPORTED, not patched here,
      because a version owns its layout and not the kit:
        - PMK.blocked() renders every allowed action as a LIVE button and has
          no disabled form, so a gated blocked-row action cannot be expressed
          through it. Worked around locally in blockedBlock(); the kit should
          grow the same disabled-item support PMK.overflow()/PMK.select()
          already have.
        - _pm-data.js ships allowedActionIds[] with no id-to-capability
          catalogue, so nothing in the fixture says which command mutates.
          isMutation() splits on the command verb and fails CLOSED; a real
          catalogue belongs in the data.
      Also unavailable by construction: no id= is permitted in panel markup,
      so aria-describedby cannot point a disabled control at its reason line.
      The reason is spelled into the accessible name instead.

   MEASURED — re-measured after the CONFIRMATION-GATE pass, over the full
   3,584-combination matrix (16 versions x 7 panels x 8 themes x 4 widths), on
   a server whose /__whoami was checked first (harness
   puppet-master-panel-bakeoff, dataSha1 169fa176b09e) and on a port with no
   cache history. Version count asserted at 16 before the numbers were
   believed. Fonts: 6 of 6 probed present, cssReady true.

   Three back-to-back sweeps: 2,576 R-tier each, ALL of them v0, and the three
   runs agree on every one of the 3,584 combinations -- including the cold run,
   which the audit warns is usually the untrustworthy one. This version: ZERO
   R-tier in all three.

   THE ADDITIONS COST NOTHING IN THE CHECKER. W1 8 and W2 4 are exactly the
   numbers this file reported before the pass, after one correction the pass
   itself surfaced: the repo identity row shares its pin row with a second
   flex child, and budgeting both as if each owned the band fired 20 extra W1
   findings. pinChars now takes `share`. Measured before the fix: W1 32.
   -------------------------------------------------------------------------
     R-tier failures      0     (v0 baseline control: 2576, all of the 2576)
     W1 ellipsis          8     basic-* only, 2-5px overshoots of the computed
                                budget in the widest theme family. SIX are new
                                and they are the priced cost of rendering the
                                WHOLE Docker collection: the minio image ref
                                and two image digests belong to rows the old
                                fixed-index feed never drew at all. The
                                earlier "W1 0" claim was true only because
                                those rows were invisible. Closing them means
                                widening the per-character constants in
                                subjChars/l2Chars, which re-elides every row in
                                every panel, so the finding is reported rather
                                than bought at that price.
     W2 contrast          4     .pmk-btn--primary, the Commit CTA, basic-dark
                                at 2.21:1 - a kit pair, not this version's
                                markup, see below
     R2 suppressed        0     the checker no longer raises the lens-strip
                                chips, so deviation 10's suppressions are gone

   Findings that belong to the harness and the kit, not to this version:

   A. FIXED IN THE SHARED LAYER, RECORDED BECAUSE THE NUMBER MOVED. This file
      previously reported that _pm-shell.js panelHTML() passed the module-scope
      live state rather than the cfg it was handed, so every width-responsive
      version was laid out in a box its markup was not built for -- this
      version measured 1910 phantom failures that way. _pm-shell.js:110 now
      takes cfg. The sweeps above use PM_BAKEOFF.buildStage unwrapped and need
      no compensating wrapper.

   A2. THE RIGHT-CLICK MENU DISPATCHES NOWHERE, so no version can gate it.
      PM.mountAll's contextmenu handler (_pm-components.js:777-782) calls
      ctx.open() and drops the Promise; ctx.close() resolves it and nothing
      listens. Every row in this file carries data-pm-ctx and every one of them
      is the same item list as its kebab -- so the kebab is gated and the
      identical right-click route is not, which is a worse outcome than either
      being uniformly true. The kit fix is one line: dispatch pm:menuaction
      from the ctx host the way menu.create already does. NOT patched here; a
      version owns its layout, not the kit's event contract.

   A3. PMK.blocked HAS NO DISABLED ACTION FORM. It renders every entry of
      blockedActions() as a live button, which is how an archived repository
      came to offer Request review. Worked around locally in blockedBlock();
      the kit should grow the disabled-item support K.overflow and K.select
      already have.

   B. KIT COLOUR PAIRS FAIL AA IN basic-*, and every version that uses them
      inherits it. Deliberately NOT patched here: a version owns its layout,
      not the shared status vocabulary, and a per-version override would hide
      a defect all six share. Three of the four have since been fixed in the
      shared layer; one has not, and it is the worst one:
        .pmk-btn--primary        2.21:1   <-- the Commit CTA, still short of
                                              the 4.5 floor in basic-dark
        .pmk-chip--ok            fixed in _pm-kit.css
        .pmk-chip--warn          fixed in _pm-kit.css
        .pmk-blocked-code        fixed in _pm-kit.css

   Version-local classes are all .vF-*. No id attributes, no emoji, no
   backticks, no runtime colour math, no new backdrop-filter.
   ========================================================================= */
(function (global) {
  'use strict';

  var PMK = global.PMK;
  var esc = PMK.esc;
  var E = '…';
  var DOT = ' · ';

  /* ------------------------------------------------------------------ CSS
     Injected once. A version file is one file by contract, so version-local
     CSS has to arrive through the DOM; every selector is .vF-* scoped and the
     theme-conditional rules use the stage's own [data-theme], which is
     container-scopable in this codebase. */
  var CSS = [
    '.vF-ctl{padding:var(--xs) var(--md);min-height:32px;gap:var(--sm)}',
    '.vF-chips{padding:var(--xs) var(--sm);min-height:30px;gap:var(--sm)}',
    /* .pmk-lens ships flex:0 1 auto, so inside a bounded strip the chips
       SHRINK and clip their labels instead of overflowing and letting the
       strip scroll. F3-445 asks for a non-wrapping row that scrolls on
       overflow with labels that ellipsize only when a chip is genuinely too
       long, so the chips are pinned to their natural width here. */
    '.vF-chips .pmk-lens{flex:0 0 auto}',
    /* max-width:none let a single artifact chip (name + size) grow past the
       whole panel at 240px. flex-wrap cannot rescue a chip that is itself
       wider than its container, so it overflowed and dragged the footer,
       the artifacts row and the panel with it -- 64 findings from one
       declaration. Cap to the row and let the chip's own ellipsis work. */
    '.vF-arts .pmk-chip{max-width:100%;min-width:0}',
    /* AA is mandated in basic-* (FinalGUISpec 13.1) and a feed leans on muted
       secondary text far harder than a card layout does: the anchor column,
       the verb tail, line 2 and the owning-object column are ALL --text-muted,
       which measures under 4.5:1 on --surface in both basic themes. basic-*
       therefore promotes every one of them to --text-secondary. Scoped to
       [data-pm-version="vF"] because this style element is document-global
       and must not repaint another version's stage. */
    '[data-pm-version="vF"][data-theme^="basic"] .vF-t-rel,',
    '[data-pm-version="vF"][data-theme^="basic"] .vF-t-abs,',
    '[data-pm-version="vF"][data-theme^="basic"] .vF-verb,',
    '[data-pm-version="vF"][data-theme^="basic"] .vF-l2,',
    '[data-pm-version="vF"][data-theme^="basic"] .vF-own,',
    '[data-pm-version="vF"][data-theme^="basic"] .vF-kind,',
    '[data-pm-version="vF"][data-theme^="basic"] .vF-pin-sub,',
    '[data-pm-version="vF"][data-theme^="basic"] .vF-pin-lbl,',
    '[data-pm-version="vF"][data-theme^="basic"] .pmk-sec-n,',
    '[data-pm-version="vF"][data-theme^="basic"] .pmk-head-count,',
    '[data-pm-version="vF"][data-theme^="basic"] .pmk-meta,',
    '[data-pm-version="vF"][data-theme^="basic"] .pmk-meta-seg,',
    '[data-pm-version="vF"][data-theme^="basic"] .pmk-meta-more,',
    '[data-pm-version="vF"][data-theme^="basic"] .pmk-note{color:var(--text-secondary)}',
    '.vF-pin .pmk-chip{max-width:none}',
    '.vF-subj--code{font-family:var(--mono-font)}',

    '.vF-pin{flex:none;display:flex;flex-direction:column;gap:var(--sm);',
    'padding:var(--sm) var(--md);min-width:0;background:var(--surface-elevated);',
    'border-bottom:1px solid var(--border-light,var(--border));',
    'border-left:3px solid var(--accent-primary)}',
    '.vF-pin-row{display:flex;align-items:center;flex-wrap:wrap;gap:var(--sm);min-width:0}',
    '.vF-pin-lbl{flex:none;font-family:var(--display-font-sm,var(--body-font));',
    'font-size:var(--fs-2xs);font-weight:700;letter-spacing:.08em;',
    'text-transform:uppercase;color:var(--text-muted);white-space:nowrap}',
    '.vF-pin-grow{flex:1 1 96px;min-width:0;overflow:hidden;text-overflow:ellipsis;',
    'white-space:nowrap;font-size:var(--fs-xs);color:var(--text-primary)}',
    '.vF-pin-sub{flex:1 1 96px;min-width:0;overflow:hidden;text-overflow:ellipsis;',
    'white-space:nowrap;font-size:var(--fs-2xs);color:var(--text-muted)}',
    '.vF-msg{flex:1 1 96px;min-width:0;width:auto}',

    '.vF-streamwrap{position:relative;flex:1 1 auto;min-height:0;display:flex;flex-direction:column}',
    '.vF-stream{flex:1 1 auto;min-height:0;padding:0}',

    '.vF-ev{display:flex;align-items:stretch;gap:var(--sm);min-height:32px;',
    'padding:7px var(--md) 7px var(--sm);min-width:0;cursor:pointer;',
    'color:var(--text-primary);font-size:var(--fs-xs);border-radius:var(--radius-xs)}',
    '.vF-ev:hover{background:var(--accent-soft)}',
    '.vF-ev:focus-visible{outline:2px solid var(--accent-primary);outline-offset:-2px}',
    '.vF-ev--sel{background:var(--accent-soft)}',
    '[data-theme^="friendly"] .vF-ev{min-height:36px;padding-top:9px;padding-bottom:9px}',
    '[data-theme^="friendly"] .vF-ev .pmk-rail{border-radius:2px;opacity:.8}',
    '[data-theme^="retro"] .vF-ev{border-radius:0}',

    '.vF-t{flex:0 0 34px;width:34px;display:flex;align-items:flex-start;',
    'justify-content:flex-end;gap:var(--sm);white-space:nowrap;overflow:hidden;',
    'font-size:var(--fs-2xs);color:var(--text-muted);font-variant-numeric:tabular-nums}',
    '.vF-t--wide{flex-basis:68px;width:68px}',
    '.vF-t-abs{opacity:.8}',
    '.vF-gap{flex:0 0 21px}',
    '.vF-kind{flex:0 0 14px;display:flex;align-items:flex-start;color:var(--text-muted)}',
    '.vF-kind svg{width:14px;height:14px;display:block}',

    '.vF-b{flex:1 1 auto;min-width:0;display:flex;flex-direction:column;',
    'justify-content:flex-start;gap:1px}',
    '.vF-l1{display:flex;align-items:baseline;gap:var(--sm);min-width:0}',
    '.vF-subj{flex:1 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
    '.vF-verb{flex:0 0 auto;white-space:nowrap;font-size:var(--fs-2xs);color:var(--text-muted)}',
    '.vF-l2{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;',
    'font-size:var(--fs-2xs);color:var(--text-muted)}',
    '.vF-own{flex:0 0 auto;max-width:104px;align-self:flex-start;white-space:nowrap;',
    'overflow:hidden;text-overflow:ellipsis;font-size:var(--fs-2xs);color:var(--text-muted)}',

    /* match highlight: weight + background, never hue alone (FinalGUISpec:1237) */
    '.vF-hit{background:var(--accent-glow);color:var(--text-primary);font-weight:700;',
    'border-radius:2px}',

    '.vF-blk{padding:0 var(--md) var(--sm) 38px;min-width:0}',
    /* the capsule: triage (changed files + likely next) and artifact
       provenance. Indented to the text band so it reads as the row's tail,
       nowrap + ellipsis so it can only ever fire W1. */
    '.vF-cap{display:flex;flex-direction:column;gap:1px;min-width:0;',
    'padding:0 var(--md) var(--sm) 38px}',
    '.vF-cap-l{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;',
    'font-size:var(--fs-2xs);color:var(--text-muted)}',
    '[data-pm-version="vF"][data-theme^="basic"] .vF-cap-l{color:var(--text-secondary)}',
    '.vF-older{padding:var(--sm) var(--md) var(--md)}',

    '.vF-jump{position:absolute;left:0;right:0;bottom:var(--md);display:flex;',
    'justify-content:center;pointer-events:none}',
    '.vF-jumpb{pointer-events:auto;box-shadow:var(--elev-2,var(--elev-1))}',

    '.vF-foot{flex:none;display:flex;flex-direction:column;gap:var(--sm);',
    'padding:var(--sm) var(--md);min-width:0;',
    'border-top:1px solid var(--border-light,var(--border))}',
    '.vF-arts{display:flex;flex-wrap:wrap;gap:var(--sm);min-width:0}'
  ].join('');

  (function injectOnce() {
    if (document.querySelector('style[data-pm-vf]')) return;
    var s = document.createElement('style');
    s.setAttribute('data-pm-vf', 'stream');
    s.appendChild(document.createTextNode(CSS));
    document.head.appendChild(s);
  })();

  /* ======================================================= MOTION =======
     ONE primitive from the shared layer (_pm-motion.css / PMM), used twice.
     No locals, no @keyframes in this file:

       3. PMM.enter   the stream, and the jump-to-latest pill

     WHY ENTER IS THE WHOLE VOCABULARY HERE. A feed's only real motion event
     is "a row arrived". The newest event is row 1 and the shared cascade caps
     at four steps, so the arrival reads top-down over ~90ms and then stops -
     rows five and beyond land with row four. That is the point of the cap:
     23 visible rows at 30ms each would be 690ms of a log visibly assembling
     itself, which is 690ms in which the thing you opened the panel to read is
     still fading in. Nothing here delays reading row 1.

     The jump-to-latest pill (rendered only while paused, RISK 1 / deviation)
     is the same primitive applied to a one-child wrapper: it rises the
     family's --pmm-rise and fades, so an affordance that says "there is newer
     content below" arrives rather than blinking into place. It is deliberately
     NOT a sheet: a sheet animates a size, and the pill is an absolutely
     positioned overlay that must not reflow the stream behind it.

     WHY IT IS GATED ON A SIGNATURE. The harness re-renders every stage on
     every mousemove of the panel resizer. An unconditional enter - whether
     declared as a class in the markup or fired on every render - would restart
     the cascade 60 times a second while dragging and the stream would strobe
     at opacity 0. So the enter fires only when the stream's own signature
     changes, and the signature is WIDTH-FREE by construction: it counts rows,
     and rows are elided per bucket but never added or removed by width.

     The sweep is one rAF per render batch, coalesced - the browser's pre-paint
     step, so a stream that did not change is never SEEN to animate, and one
     that did is never seen unanimated first. No loop, no observer, no second
     document listener. The fit rig is untouched: runMatrix() builds offscreen,
     outside #stageWrap, and kills animation and transition wholesale. */
  var SIG = {};         /* stage key -> stream signature */
  var QUEUED = false;

  function afterRender() {
    if (QUEUED || !global.PMM || !global.requestAnimationFrame) return;
    QUEUED = true;
    global.requestAnimationFrame(function () {
      QUEUED = false;
      var stages = document.querySelectorAll('#stageWrap .pm-stage[data-pm-version="vF"]');
      for (var i = 0; i < stages.length; i++) sweepStage(stages[i]);
    });
  }

  function sweepStage(stage) {
    var panel = stage.getAttribute('data-pm-panel');
    var key = panel + '|' + stage.getAttribute('data-theme');
    var stream = stage.querySelector('[data-pm-stream]');
    if (!stream) return;

    /* Row COUNT, not markup: every subject and line 2 is elided per bucket, so
       a markup signature would differ on every pixel of a resizer drag. */
    var sig = panel + ':' + stream.children.length;
    if (SIG[key] === sig) return;
    SIG[key] = sig;

    global.PMM.enter(stream);
    var jump = stage.querySelector('.vF-jump');
    if (jump) global.PMM.enter(jump);
  }

  /* ---------------------------------------------------------------- time
     The fixtures carry relative ages only. ANCHOR_MIN is one fixed session
     clock (15:20) so the b3 column can show an absolute time WITHOUT any new
     content string. Ages of a day or more get no clock: a time without a date
     is worse than no time. */
  var ANCHOR_MIN = 15 * 60 + 20;

  function minutesOf(rel) {
    var m = /^(\d+)\s*([smhdw])$/.exec(String(rel || '').replace(/\s+/g, ''));
    if (!m) return null;
    var n = parseInt(m[1], 10);
    if (m[2] === 's') return 0;
    if (m[2] === 'm') return n;
    if (m[2] === 'h') return n * 60;
    if (m[2] === 'd') return n * 1440;
    return n * 10080;
  }

  function clockOf(rel) {
    var mins = minutesOf(rel);
    if (mins == null || mins >= 1440) return '';
    var t = ((ANCHOR_MIN - mins) % 1440 + 1440) % 1440;
    var hh = Math.floor(t / 60), mm = t % 60;
    return (hh < 10 ? '0' : '') + hh + ':' + (mm < 10 ? '0' : '') + mm;
  }

  /* At most 4 characters. "4m 12s" is a live elapsed, not an age; it renders
     at its leading unit so the fixed 34px column can never overflow, which
     would fire R1 in the widest theme and nowhere else. */
  function relOf(rel) {
    if (rel == null || rel === '') return '--';
    var s = String(rel).replace(/\s+/g, ' ').trim();
    var m = /^(\d+[smhd])\s+\d+[smhd]$/.exec(s);
    return m ? m[1] : s.replace(/\s+/g, '');
  }

  /* ------------------------------------------------------ ORDERING AND LOOKUP
     THE RULE THIS FILE BROKE. The header states an ordering rule -- reverse-
     chronological, untimed LIVE rows above the terminal history, untimed
     TERMINAL rows below it -- and three panels did not obey it, because they
     took their rows from HAND-WRITTEN INDEX LISTS instead of from the
     collections. Agents rendered [G.active[1], G.active[0], G.active[2],
     G.active[3]] (4 of 15 rows, 1 of 5 blocked episodes) while its own pinned
     strip counted all 15; Docker rendered a nine-element array of fixed
     container and image indices (5 of 24 containers, 4 of 16 images) under a
     strip reading "containers 16/24"; Source rendered S.history.slice(0, 2),
     S.stash[0] and S.history[2] (3 of 14 commits, 1 of 3 stashes). A fixed
     index cannot express an ordering rule and it silently drops whatever the
     fixture grows past it, so every feed now sorts its WHOLE collection on the
     fixture's own clock.

     ageMins SUMS the units in a token so a composite live elapsed ("3h 12m",
     "4m 12s") ranks against a plain age ("6h") -- the anchor column coarsens
     such a token to its leading unit for display, but ranking on the leading
     unit alone would tie 4m 12s with 4m 59s. The fixture's own null-time token
     is "--"; it sorts to the tail of the list it is sorted in, never to the
     head, which is the ordering rule's untimed-LIVE clause. */
  var UNIT_MIN = { s: 1 / 60, m: 1, h: 60, d: 1440, w: 10080 };

  function ageMins(v) {
    var s = String(v == null ? '' : v).trim();
    if (!s || s === '--') return null;
    var re = /(\d+)\s*([smhdw])\b/g, m, total = null;
    while ((m = re.exec(s))) total = (total || 0) + parseInt(m[1], 10) * UNIT_MIN[m[2]];
    return total;
  }

  /* Stable: equal ages and untimed rows keep the order the fixture listed them
     in, so nothing is reordered by accident and nothing is dropped. */
  function sortByAge(list, ageOf) {
    return list
      .map(function (v, i) { return { v: v, i: i, a: ageMins(ageOf(v)) }; })
      .sort(function (p, q) {
        if (p.a == null && q.a == null) return p.i - q.i;
        if (p.a == null) return 1;
        if (q.a == null) return -1;
        return p.a === q.a ? p.i - q.i : p.a - q.a;
      })
      .map(function (k) { return k.v; });
  }

  /* Fixture arrays are addressed by their own id, never by position. */
  function byId(list, id) {
    var found = null;
    (list || []).forEach(function (o) { if (o.id === id) found = o; });
    return found;
  }

  /* ------------------------------------------------------------ action ids
     allowedActionIds[] carries COMMAND IDS and _pm-data.js ships no id-to-label
     catalogue -- that absence is the gap, and it is reported rather than papered
     over with a table of strings this file made up. The label is DERIVED from
     the id (trailing segment, underscores to spaces, first letter raised:
     'orchestrator.grant_authority' -> 'Grant authority') and the untouched id
     travels with the item as its value, so a dispatcher receives the exact
     fixture string. Where the fixture DOES ship a label for an id --
     tests.redactionFailed.authorize is the only one -- that label wins. */
  function actionLabel(id, named) {
    if (named && named[id]) return named[id];
    var tail = String(id).split('.').pop().replace(/_/g, ' ');
    return tail.charAt(0).toUpperCase() + tail.slice(1);
  }

  function allowedActions(ids, named) {
    return (ids || []).map(function (id) {
      return { id: id, value: id, label: actionLabel(id, named) };
    });
  }

  /* WHICH allowedActionIds[] ENTRY IS A STRONG ACTION. Same shape and the same
     honesty as isMutation(): _pm-data.js ships no per-id capability flag, so
     the split is made on the command VERB the id already carries, and it fails
     CLOSED -- a verb this list has never seen is NOT treated as strong, which
     is the safe direction here because a false positive gates a harmless
     action while a false negative would ship an ungated destructive one. The
     verbs are the ones the fixture actually uses: abort, delete, drop, discard,
     remove, prune, evict, revoke, authorize, cancel, force. A real build reads
     this from the command catalogue, which is the same reported gap. */
  var STRONG_VERB = { abort: 1, delete: 1, drop: 1, discard: 1, remove: 1, prune: 1,
                      evict: 1, revoke: 1, authorize: 1, cancel: 1, force: 1 };

  function isStrongId(id) {
    return !!STRONG_VERB[String(id).split('.').pop().split('_')[0]];
  }

  /* allowedActions(), with the strong ones routed through the gate. `say` is a
     function of the id so the caller can quote the row's own fixture facts. */
  function allowedActionsGated(ids, named, say) {
    return allowedActions(ids, named).map(function (a) {
      if (!isStrongId(a.id)) return a;
      return strong(a.id, a.label, say(a.id), { id: a.id });
    });
  }

  /* ================================================= GI-021 LIFECYCLE GATE
     GitHub_Integration.md:L1271-L1275. A repository whose lifecycle is not the
     LIVE one disables mutation DETERMINISTICALLY, and the limit is shown as
     effective capability STATE -- in prose -- never as a hidden control, and
     never as a control that still works.

     BROKE-6, SECOND HALF, AND THE REASON THIS PASS EXISTS. The gate was
     already computed here. It was written ONLY into the disabled-item
     attributes of overflow TEMPLATES, and a template is inert: its children
     are not in the document, not in the accessibility tree, and not reachable
     by querySelectorAll. Measured on the live DOM this panel carried 87 gated
     menu items and ZERO disabled controls -- it printed "archived" and "You
     can view runs but cannot dispatch" and then offered the mutations anyway
     everywhere a reader could actually see one. That is worse than the
     original defect, because the surface asserts a constraint it does not
     enforce. The gate now renders where it can be SEEN -- the repository-scope
     mutations stay VISIBLE and disabled with the reason beside them, which is
     exactly what L1275 asks for -- and it stays in the menus as well.

     DERIVED FROM THE DATA, NEVER FROM THE TOKEN 'archived'. The fixture ships
     seven states in repository.lifecycleStates and exactly one of them,
     'active', is live; archived, deleted, historical_only, transferred,
     renamed_redirected and remote_mismatch all freeze mutation. One rule --
     the lifecycle is not the live word -- gates all six without another edit,
     and mutationDisabled is honoured on its own so a lifecycle string this
     file has never seen still fails CLOSED. The claim is testable without
     changing anything: source.repo carries lifecycle 'active' and this same
     helper leaves it entirely live.

     can(name) reads the per-capability map FIRST, so a repository frozen for
     dispatch but live for rerun -- capabilitySentenceAlt is the fixture's own
     second copy shape -- gates per control rather than wholesale. A capability
     the map does not mention follows the lifecycle. */
  var LIVE_LIFECYCLE = 'active';

  function repoGate(repo) {
    repo = repo || {};
    var caps = repo.capabilities || {};
    var frozen = repo.mutationDisabled === true ||
      (repo.lifecycle != null && String(repo.lifecycle) !== LIVE_LIFECYCLE);
    return {
      frozen: frozen,
      /* the reason token is the fixture's own lifecycle word. audit-git 4.9
         records that this version has minted a reason code before; this fix
         does not add another. */
      reason: repo.lifecycle ? String(repo.lifecycle) : 'mutation_disabled',
      say: repo.capabilitySentence || '',
      sentence: repo.sentence || repo.capabilitySentence || '',
      why: (repo.lifecycle ? String(repo.lifecycle) + '. ' : '') +
           (repo.capabilitySentence || ''),
      can: function (name) {
        if (caps[name] === false) return false;
        if (caps[name] === true) return true;
        return !frozen;
      }
    };
  }

  /* Which allowedActionIds[] entry MUTATES. _pm-data.js ships no per-id
     capability flag and no id-to-verb catalogue -- that absence is the gap,
     and it is reported rather than papered over with a table this file made up
     -- so the split is made on the command VERB the id already carries.
     open / view / browse / copy / refresh / inspect / compare / show / list
     READ; everything else is treated as a mutation, so an id this list has
     never seen fails CLOSED under a frozen repository instead of staying live.
     'github.open_environment' reads; 'github.request_review' writes. */
  var READ_VERB = { open: 1, view: 1, browse: 1, copy: 1, refresh: 1,
                    inspect: 1, compare: 1, show: 1, list: 1 };

  function isMutation(id) {
    return !READ_VERB[String(id).split('.').pop().split('_')[0]];
  }

  /* A control that is PRESENT, VISIBLE and disabled, whose reason can be read
     without hovering. PMK.btn can set aria-disabled but carries the reason
     only in data-pm-tip, which is a hover surface, and GI-017 / GAAAF-005 both
     require the user learn WHY, visibly. No id= is permitted in panel markup,
     so aria-describedby is not available either -- which is why the reason is
     spelled into the accessible NAME here and printed once, in prose, by the
     block the control sits in. Never a native title attribute. */
  function gateBtn(label, off, why, tip) {
    return '<button type="button" class="pmk-btn"' +
      (off ? ' aria-disabled="true" aria-label="' +
             esc(label + '. Unavailable. ' + why) + '"' : '') +
      ' data-pm-tip="' + esc(off ? why : (tip || label)) + '">' +
      esc(label) + '</button>';
  }

  /* PMK.blocked's shape plus the one thing the kit cannot express: an action
     that is present and DISABLED. K.blocked renders every action as a live
     button, which is how an archived repository came to offer Request review.
     Kit-owned classes only, so the block is identical in all eight themes.
     sentences[] rather than one sentence because GI-021 wants the capability
     sentence AND the lifecycle sentence; empty members drop. */
  function blockedBlock(o, acts, tone) {
    return '<div class="pmk-blocked' + (tone === 'err' ? ' pmk-blocked--err' : '') + '">' +
      (o.code ? '<span class="pmk-blocked-code">' + esc(o.code) + '</span>' : '') +
      (o.sentences || []).filter(Boolean).map(function (s) {
        return '<span class="pmk-blocked-say">' + esc(s) + '</span>';
      }).join('') +
      (acts && acts.length ? '<span class="pmk-acts">' + acts.join('') + '</span>' : '') +
      '</div>';
  }

  /* ================================================ THE CONFIRMATION GATE
     BLIND SPOT 20. GitHub_Integration.md:L156 requires that a `strong` action
     -- one that "may discard local state, remove artifacts or worktrees,
     revoke accepted state, or materially change live execution" -- show SCOPE,
     CONSEQUENCE and a CONFIRMATION BOUNDARY before it executes. This file
     shipped every one of them as a one-click menu item with a red label and
     nothing else: Discard unstaged, Amend, Revert, Pop stash, Drop stash,
     Remove worktree, Remove container, Remove image, Stop, Prune unused,
     Compose down, Delete scenario, Replace all, Replace in file, Replace this
     match, Evict remote cache, Cancel run (three panels), Export bundle,
     Export record, Disconnect, Authorize unredacted display. The red text WAS
     the gate.

     PM.confirm ALREADY EXISTS -- _pm-components.js:498: a modal sheet with a
     scrim, role="dialog", aria-modal, focus capture and no auto-close,
     documented at :9 as "replaces confirm()". No version called it. Closing
     this needs no new component and no shared-layer change; it is wiring.

     THE RULE, written so it is greppable rather than trusted: `strong()` is
     the ONLY way this file writes danger:true, and it takes the consequence
     sentence as a required argument -- an empty one throws at render. So an
     ungated destructive item cannot be added without deleting the helper, and
     "grep danger: true" is a complete audit of the gate.

     WHERE THE TWO HALVES COME FROM.
       SCOPE is the fixture, always, and it is spelled UN-ELIDED: the row may
       be showing 21 characters of a path, but the sheet is not width-bound and
       a confirmation that names a truncated object has not named it.
       CONSEQUENCE is the fixture wherever the fixture carries one, and it
       carries more than the audit credits: a worktree ships releasedSentence /
       orphanSentence / preservedSentence / reservedSentence for exactly this
       question, search.remote ships its own unavailability sentence, and
       tests.redaction ships the attestation an export needs. Where the fixture
       has none, this file writes one short clause AT THE CALL SITE, so a
       reader can see which words are the fixture's and which are this file's.
       That is a REPORTED GAP, not a silent invention: _pm-data.js ships no
       per-command consequence catalogue, the same absence already reported
       here for allowedActionIds (no id-to-capability map).

     WIRING. A menu dispatches pm:menuaction from the menu root, which bubbles
     through the row and the stage (_pm-components.js:255). ONE delegated
     listener on the document, scoped to this version's stages so it can never
     fire on another author's panel, reads the consequence off the nearest
     ancestor carrying data-pm-gate-<action>. No id attributes: the attribute
     name is the action's own value token, which is already unique within the
     host that owns it, so `remove` can mean this container on one row and this
     worktree on another with no lookup table and no minted ids.

     AFTER CONFIRMATION, NOTHING HAPPENS -- HONESTLY. The bakeoff has no
     dispatcher; no menu item in any version executes anything. A confirmed
     action re-dispatches as pm:strongaction carrying the action id and the
     scope, which is the seam a real dispatcher binds to. Faking the mutation
     would make the gate look load-bearing when what is behind it is not built.

     TWO GAPS THIS EXPOSED, REPORTED AND NOT PATCHED, because a version owns
     its layout and not the kit:
       - THE RIGHT-CLICK MENU CANNOT BE GATED BY ANY VERSION. PM.mountAll's
         contextmenu handler (_pm-components.js:777-782) calls ctx.open() and
         DISCARDS the Promise it returns; ctx.close() resolves it and nothing
         else. So a context-menu activation reaches no listener anywhere. The
         kebab and the context menu carry identical items by construction in
         this file, and only the kebab can be gated. The kit fix is one line --
         dispatch pm:menuaction from the ctx host the way menu.create does.
       - PM.confirm's body is ONE escaped string in one div, so scope and
         consequence cannot be two blocks. They are joined into one paragraph
         with a leading 'Scope:' label, which reads correctly but is one
         boundary where L156 describes two. */
  /* The attribute suffix for an action value. Command ids carry dots
     ('orchestrator.abort_node') and an attribute name cannot, so the suffix is
     a sanitised copy while the item keeps the UNTOUCHED id as its value -- the
     dispatcher still receives the exact fixture string. Both sides of the gate
     run the same transform, so there is no table to keep in step. */
  function gateKey(v) {
    return String(v == null ? '' : v).toLowerCase().replace(/[^a-z0-9]+/g, '_');
  }

  function strong(value, label, say, extra) {
    if (!say) throw new Error('vF: strong action ' + value + ' has no consequence');
    var it = extra || {};
    it.value = value;
    it.label = label;
    it.danger = true;
    it.__say = say;
    return it;
  }

  /* The host attributes a gated menu belongs to. Walks the item list the host
     is about to render, so the consequence and the item can never drift. */
  function gateAttrs(scope, items) {
    var h = ' data-pm-scope="' + esc(scope == null ? '' : scope) + '"';
    (items || []).forEach(function (it) {
      var k = it && it.__say ? gateKey(it.value) : '';
      if (k) h += ' data-pm-gate-' + k + '="' + esc(it.__say) + '"';
    });
    return h;
  }

  /* A standalone destructive BUTTON carries its own scope and consequence, so
     it does not depend on an ancestor. 24px minimum comes from .pmk-btn. */
  function strongBtn(id, label, scope, say, opts) {
    opts = opts || {};
    return '<button type="button" class="pmk-btn pmk-btn--danger"' +
      ' data-pm-strong="' + esc(id) + '"' +
      ' data-pm-scope="' + esc(scope) + '"' +
      ' data-pm-gate-' + gateKey(id) + '="' + esc(say) + '"' +
      (opts.disabled ? ' aria-disabled="true"' : '') +
      ' data-pm-tip="' + esc(opts.tip || say) + '">' + esc(label) + '</button>';
  }

  function askGate(node, action, label) {
    var k = gateKey(action);
    if (!k) return;
    var host = node.closest('[data-pm-scope]');
    if (!host) return;
    var say = host.getAttribute('data-pm-gate-' + k);
    if (!say) return;
    if (!global.PM || !global.PM.confirm) return;
    var scope = host.getAttribute('data-pm-scope') || '';

    /* DEFERRED BY ONE TASK, AND THE REASON IS A REAL DEFECT THAT WAS MEASURED.
       pm-menu dispatches pm:menuaction and then calls close(true), which calls
       trigger.focus(). Opening the sheet synchronously inside the handler put
       the modal up first and let the closing menu take the focus back out of
       it a moment later: document.activeElement read .pm-menu-trigger with the
       dialog open, which defeats the focus capture PM.confirm exists to
       provide and strands a keyboard user outside an aria-modal. Deferring one
       macrotask lets the menu finish closing and refocus, and the sheet then
       captures from there -- which also makes the kebab the correct restore
       target when the user cancels. */
    global.setTimeout(function () {
      global.PM.confirm({
        title: label,
        body: 'Scope: ' + scope + '  ' + say,
        confirmLabel: label,
        cancelLabel: 'Cancel',
        danger: true,
        from: node
      }).then(function (ok) {
        if (!ok) return;
        host.dispatchEvent(new global.CustomEvent('pm:strongaction', {
          bubbles: true, detail: { action: action, scope: scope, say: say }
        }));
      });
    }, 0);
  }

  function inVF(n) {
    return !!(n && n.closest && n.closest('.pm-stage[data-pm-version="vF"]'));
  }

  (function bindGateOnce() {
    if (global.__vfGate) return;
    global.__vfGate = true;
    document.addEventListener('pm:menuaction', function (e) {
      if (!inVF(e.target)) return;
      var d = e.detail || {};
      if (!d.action) return;
      askGate(e.target, d.action, (d.item && d.item.label) || d.action);
    });
    /* Two button shapes reach this: strongBtn's own data-pm-strong, and the
       kit's data-pm-action, which PMK.blocked stamps on every action it draws
       from allowedActionIds. The second one is why a blocked row's Abort node
       is gated at all -- the button belongs to the kit, the consequence
       belongs to the row, and the row is the ancestor holding it. */
    document.addEventListener('click', function (e) {
      var t = e.target && e.target.closest
        ? e.target.closest('[data-pm-strong],[data-pm-action]') : null;
      if (!t || !inVF(t)) return;
      if (t.getAttribute('aria-disabled') === 'true') return;
      var id = t.getAttribute('data-pm-strong') || t.getAttribute('data-pm-action');
      var host = t.closest('[data-pm-scope]');
      if (!host || !host.getAttribute('data-pm-gate-' + gateKey(id))) return;
      e.preventDefault();
      askGate(t, id, t.textContent.trim());
    });
  })();

  function timeCell(rel, b) {
    var r = relOf(rel);
    var abs = b >= 3 ? clockOf(rel) : '';
    return '<span class="vF-t' + (b >= 3 ? ' vF-t--wide' : '') + '">' +
      (abs ? '<span class="vF-t-abs">' + esc(abs) + '</span>' : '') +
      '<span class="vF-t-rel">' + esc(r) + '</span></span>';
  }

  /* --------------------------------------------------------------- budget
     Characters that survive in the subject band once the anchor column, the
     status gutter and the reserved overflow slot are paid for. Rough but
     honest, and it is the number that makes the anchor column's cost visible.
       band = width - row padding(12) - anchor(34|68) - gaps(8) - gutter(21)
              - overflow(24) */
  function bandChars(width, b) {
    var band = width - 12 - (b >= 3 ? 68 : 34) - 8 - 21 - 24;
    return Math.max(10, Math.floor(band / 6.6));
  }

  /* Elision is COMPUTED, not styled. Two reasons, and the second is the one
     that matters: (a) Slint's overflow:elide only does tail, so a path elided
     by CSS loses the basename, which is the only part that identifies it;
     (b) a CSS ellipsis is a clipped overflow, and the fit checker is right to
     call that out - the honest fix is for the string to arrive already the
     right length. The cost is that the budget must assume the WIDEST theme
     (basic-* is Inter plus 0.02em tracking), so retro-* renders a few
     characters shorter than it strictly needs to. That is the price of a
     measurement-free layout and it is the same price Slint charges. */
  function rowBand(width, b, hasGlyph) {
    return width - 12 - (b >= 3 ? 68 : 34) - 8 - 21 - 24 -
           (hasGlyph ? 18 : 0) - (b >= 3 ? 108 : 0);
  }
  function subjChars(width, b, hasGlyph, verb) {
    var band = rowBand(width, b, hasGlyph);
    if (b >= 1 && verb) band -= String(verb).length * 6.4 + 8;
    return Math.max(6, Math.floor(band / 6.5));
  }
  function l2Chars(width, b, hasGlyph, mono) {
    return Math.max(6, Math.floor(rowBand(width, b, hasGlyph) / (mono ? 6.8 : 5.9)));
  }
  /* Pinned rows wrap, so an item that does not fit drops to its own line and
     gets the full band. The budget assumes it does NOT, which over-elides a
     little rather than clipping - the safe direction.

     `share` is the number of flex:1 1 96px children SPLITTING that row. Two of
     them do not each get the band; they get half of it, and budgeting both as
     if they owned it over-reports by 2x and hands the surplus to the CSS
     ellipsis -- which is W1, i.e. exactly the clipped overflow this file
     computes elision to avoid. Measured: the repo identity row fired 20 of
     this version's W1 findings until share was passed. */
  function pinChars(width, b, reserved, small, share) {
    var band = (width - 19 - (reserved || 0) - (b >= 1 ? 48 : 0)) / (share || 1);
    return Math.max(8, Math.floor(band / (small ? 5.9 : 6.5)));
  }

  /* ------------------------------------------------------------------ row
     ONE row shape, all seven panels.
       e = { time, status, glyph, glyphTip, subj, subjHtml, verb, line2,
             line2Mono, force2, own, sel, say, actions, blocked, blockedTone }

     e.say IS THE ROW'S ACCESSIBLE NAME, and it exists for exactly one reason.
     The row's visual anatomy puts the status gutter BEFORE the text band --
     that is the 34px anchor + 21px rail/glyph contract every panel is laid out
     on -- so a name computed from content order always leads with the status
     mark's label. On six panels that is right, because status is the only state
     the row carries. On Source it is a FALSEHOOD: a worktree carries a status
     AND a reserved lifecycle word, and leading with the status label announces
     a released worktree as "Unavailable" before the correcting clause arrives
     (BROKE-3's accessible half). Reordering the DOM would move the gutter in
     all seven panels; naming the row explicitly fixes the announcement and
     moves nothing. A row that sets e.say must spell the WHOLE name -- an
     aria-label replaces the content, it does not prepend to it. */
  function eventRow(e, ctx) {
    var b = ctx.b, w = ctx.width;
    var two = e.line2 && (b >= 2 || e.force2);
    var glyph = !!e.glyph;
    /* The gate attributes belong to the OUTERMOST element of the row unit: a
       blocked row's action buttons live in the sibling block, not in .vF-ev,
       and closest() has to reach them. */
    var unit = e.blocked || e.blockedHtml || (e.cap && e.cap.length);
    var gate = gateAttrs(e.scope, e.actions);
    var h = '<div class="vF-ev' + (e.sel ? ' vF-ev--sel' : '') + '" role="option"' +
      ' aria-selected="' + (e.sel ? 'true' : 'false') + '" tabindex="0"' +
      (e.say ? ' aria-label="' + esc(e.say) + '"' : '') +
      (unit ? '' : gate) +
      ' data-pm-ctx="Event actions">';

    h += timeCell(e.time, b);
    h += e.status ? PMK.statusMark(e.status)
                  : '<span class="vF-gap" aria-hidden="true"></span>';
    if (e.glyph) {
      h += '<span class="vF-kind" role="img" aria-label="' + esc(e.glyphTip || '') +
           '" data-pm-tip="' + esc(e.glyphTip || '') + '">' + PMK.icon(e.glyph, 14) + '</span>';
    }
    h += '<span class="vF-b"><span class="vF-l1">' +
         '<span class="vF-subj' + (e.subjClass || '') + '">' +
         (e.subjHtml || esc(PMK.elide(e.subj, e.subjKind, subjChars(w, b, glyph, e.verb)))) +
         '</span>' +
         (b >= 1 && e.verb ? '<span class="vF-verb">' + esc(e.verb) + '</span>' : '') +
         '</span>';
    if (two) {
      h += '<span class="vF-l2' + (e.line2Mono ? ' pmk-mono' : '') + '">' +
           esc(PMK.elide(e.line2, e.line2Kind, l2Chars(w, b, glyph, e.line2Mono))) + '</span>';
    }
    h += '</span>';
    if (b >= 3 && e.own) {
      h += '<span class="vF-own">' + esc(PMK.elide(e.own, null, 15)) + '</span>';
    }

    /* The overflow template doubles as the row's right-click menu: PM.mountAll
       reads the first template[data-pm-items] under [data-pm-ctx], so kebab
       and context menu carry identical items by construction, which is what
       research/docker.md:L239 requires. */
    h += PMK.overflow(e.actions || [{ value: 'open', label: 'Open' }], 'Event actions');
    h += '</div>';

    /* A blocked event is the ONE row that grows past two lines. The wrapper
       keeps role=option a valid descendant of role=listbox.
       blockedHtml is the GATED variant (see blockedBlock): the same block with
       the same kit classes, but its action buttons can be disabled. PMK.blocked
       stays the default for the panels whose blocked rows carry no gated
       action, so nothing outside Actions changes shape. */
    /* THE CAPSULE. A third channel under the row, for the facts that are not
       the row's identity and are not a blocked state: the failure triage
       capsule GitHub_Integration.md:L920 requires (changed files + likely next
       action) and the artifact provenance sentence RAP wants beside a web
       call. Every line is elided by the row's own budget, so it can fire W1
       and never R1/R3. */
    if (e.cap && e.cap.length) {
      h += '<div class="vF-cap">' + e.cap.map(function (c) {
        return '<span class="vF-cap-l">' + esc(PMK.elide(c, null, l2Chars(w, b, false, false) + 6)) +
               '</span>';
      }).join('') + '</div>';
    }
    if (e.blocked || e.blockedHtml) {
      h += '<div class="vF-blk">' +
           (e.blockedHtml || PMK.blocked(e.blocked, e.blockedTone)) + '</div>';
    }
    if (unit) h = '<div role="presentation"' + gate + '>' + h + '</div>';
    return h;
  }

  /* --------------------------------------------------------------- strips */
  function liveBtn(paused, b) {
    var tip = paused
      ? 'Paused. New events are buffered - click to resume following.'
      : 'Following live. Click to pause and read.';
    var ico = PMK.icon(paused ? 'play' : 'circle', 12);
    var lbl = paused ? 'Paused' : 'Live';
    return '<button type="button" class="pmk-btn" data-pm-tip="' + esc(tip) + '">' +
      ico + (b >= 1 ? '<span>' + esc(lbl) + '</span>' : '') + '</button>';
  }

  function streamMenu(extra, paused) {
    var items = [
      { type: 'head', label: 'Stream' },
      { value: 'jump', label: 'Jump to latest' },
      { value: 'follow', label: paused ? 'Resume following' : 'Pause following' },
      { value: 'older', label: 'Load older' },
      { value: 'clear', label: 'Clear filter' }
    ];
    return items.concat(extra || []);
  }

  function controls(o) {
    /* The panel menu is where the panel-SCOPED strong actions live -- Replace
       all, Evict remote cache, Prune unused, Disconnect -- so the strip is
       itself a gate host and its scope is the panel's own object. */
    var items = streamMenu(o.menu, o.paused);
    return '<div class="pmk-strip vF-ctl"' + gateAttrs(o.scope, items) + '>' +
      liveBtn(o.paused, o.bucket) +
      '<span class="pmk-strip-grow">' + PMK.filter(o.filter || 'Filter stream') + '</span>' +
      PMK.overflow(items, 'Stream and panel actions') +
      '</div>';
  }

  var LENS_MAX = [26, 14, 18, 22];

  function chipStrip(items, active, b, label) {
    var cap = LENS_MAX[b];
    var trimmed = items.map(function (i) {
      var o = {}, k;
      for (k in i) if (Object.prototype.hasOwnProperty.call(i, k)) o[k] = i[k];
      o.label = PMK.elide(i.label, i.labelKind, cap);
      return o;
    });
    /* data-fit-allow="R2" on the chips, deliberately and visibly: .pmk-lenses
       is overflow-x:auto, so chips past the fold are scrolled out of view, not
       escaped. The checker exempts [data-pm-portal] for the same reason but
       has no equivalent exemption for a scroller's own children. Every
       suppression is printed in the fit report, so this is on the record
       rather than hidden. */
    var h = '<div class="pmk-strip vF-chips">' +
      PMK.lenses(trimmed, active, b, label)
        .replace(/class="pmk-lens"/g, 'class="pmk-lens" data-fit-allow="R2"')
        .replace(/class="pmk-sec-n"/g, 'class="pmk-sec-n" data-fit-allow="R2"');
    if (b >= 3) {
      h += PMK.select('new', [
        { value: 'new', label: 'Newest first' },
        { value: 'old', label: 'Oldest first' }
      ], { style: 'flex:0 0 118px' });
    }
    return h + '</div>';
  }

  /* -------------------------------------------------------- streamFrame
     The one helper all seven panels call.
       pinned  html string, the "what IS" block (RISK 1)
       chips   html string from chipStrip - the domain's filter axis
       events  array of event descriptors
       opts    { title, bucket, paused, filter, menu, older, footer, listLabel } */
  function streamFrame(pinned, chips, events, opts) {
    opts = opts || {};
    var b = opts.bucket;
    var ctx = { b: b, width: opts.width };
    var body = '';
    for (var i = 0; i < events.length; i++) body += eventRow(events[i], ctx);

    /* page_size lives here: one paged tail affordance, no invented row budget.
       Plans assigns initial_window / page_size / max_live_rows /
       max_in_memory_rows no number on any surface, so none is shown. */
    var older = '<div class="vF-older">' +
      PMK.btn(opts.older || 'Load older', { wide: true, tip: 'Fetch the next page of older events' }) +
      '</div>';

    /* data-pm-stream is the motion hook and nothing else: PMM.enter needs the
       row container, and role="listbox" is a role, not a handle. No id, per
       the version contract. */
    var stream = '<div class="vF-streamwrap">' +
      '<div class="vF-stream pmk-body pm-sp-content">' +
      '<div data-pm-stream role="listbox" aria-label="' +
      esc(opts.listLabel || 'Activity stream') + '">' +
      body + '</div>' + older + '</div>' +
      (opts.paused
        ? '<div class="vF-jump"><button type="button" class="pmk-btn vF-jumpb"' +
          ' data-pm-tip="Scroll to the newest event and resume following">' +
          PMK.icon('down', 12) + '<span>Jump to latest</span></button></div>'
        : '') +
      '</div>';

    /* Motion is applied after the string is in the document, never declared in
       it: see the MOTION block above for why an enter that fires on every
       re-render is wrong here. */
    afterRender();

    return PMK.panel([
      PMK.head(opts.title, events.length + ' events'),
      controls(opts),
      chips,
      pinned,
      stream,
      opts.footer || ''
    ]);
  }

  /* ------------------------------------------------------------- pin bits */
  function pin(rows) { return '<div class="vF-pin">' + rows.join('') + '</div>'; }
  function pinRow(inner) { return '<div class="vF-pin-row">' + inner + '</div>'; }
  /* a pin row that owns strong actions: same row, plus the gate host attrs */
  function pinRowG(inner, scope, items) {
    return '<div class="vF-pin-row"' + gateAttrs(scope, items) + '>' + inner + '</div>';
  }
  function pinLbl(txt, b) {
    return b >= 1 ? '<span class="vF-pin-lbl">' + esc(txt) + '</span>' : '';
  }
  function pinGrow(txt, w, b, reserved, share) {
    return '<span class="vF-pin-grow">' +
      esc(PMK.elide(txt, null, pinChars(w, b, reserved, false, share))) + '</span>';
  }
  function pinSub(txt, w, b, reserved, share) {
    return '<span class="vF-pin-sub">' +
      esc(PMK.elide(txt, null, pinChars(w, b, reserved, true, share))) + '</span>';
  }

  function allChip(label, count) {
    return { id: 'all', label: label, count: String(count) };
  }

  /* ===================================================================== */
  /* SEARCH                                                                */
  /* ===================================================================== */
  function matchWindow(hit, chars) {
    var pre = String(hit.pre).replace(/^\s+/, '');
    var mid = String(hit.hit);
    var post = String(hit.post);
    if (mid.length > chars - 2) mid = mid.slice(0, Math.max(1, chars - 3)) + E;
    var lead = 8;
    var cutL = pre.length > lead;
    var left = cutL ? pre.slice(pre.length - lead) : pre;
    var budget = chars - left.length - mid.length - (cutL ? 1 : 0);
    if (budget < 0) budget = 0;
    var right = post, cutR = false;
    if (post.length > budget) { right = post.slice(0, Math.max(0, budget - 1)); cutR = true; }
    return {
      left: (cutL ? E : '') + left,
      mid: mid,
      right: right + (cutR ? E : '')
    };
  }

  function base(path) {
    var p = String(path).split('/');
    return p[p.length - 1];
  }

  /* BROKE-7. The freshness line was the LITERAL word 'Indexed' concatenated
     with builtAt and search.index.state was never read, so the panel asserted a
     healthy, freshly-built index under every one of the six states the fixture
     ships -- including 'disabled' and 'cancelled', where the index is off or its
     build was discarded. That is the one flat falsehood this version rendered.

     Every word now comes from search.index.states[], which is the SHIPPED
     vocabulary (FinalGUISpec.md:L699, :L6511). Nothing about freshness is
     spelled in this file.

     THE TWO SPELLINGS. index.state is live and reads 'ok'; the states array
     spells the same healthy state 'indexed'. The inline comment at
     _pm-data.js:208 lists the older vocabulary and is the map vC was built
     from, which is why vC raises an alarm on the healthy token. Rather than
     pick a side, the token is looked up under both spellings, and if NEITHER
     resolves the raw token is rendered: an unrecognised freshness state must
     never be reported as a healthy one.

     BUILTAT IS GATED ON annotateRows. annotateRows is the fixture's own marker
     for "this index is not the authority for these rows", and a commit anchor
     plus a build age underneath 'Indexing off - grep only' or 'Index build
     cancelled' is exactly the pair of current-sounding facts the audit called
     out in vD. It is appended only when the index is authoritative. */
  var IDX_ALIAS = { ok: 'indexed' };

  function indexState(ix) {
    return byId(ix.states, IDX_ALIAS[ix.state] || ix.state) ||
           { id: ix.state, line: String(ix.state), annotateRows: true };
  }

  function panelSearch(D, state) {
    var b = D.bucket(state.width), S = D.search;
    var ix = indexState(S.index);
    /* the match window is rendered in the mono face, and the highlighted run
       is bold, so the budget is calibrated wider than plain 11px mono */
    var chars = Math.max(10, Math.floor(rowBand(state.width, b, false) / 7.1));

    var chips = [allChip('All', S.summary.matches)].concat(S.files.map(function (f) {
      return { id: f.path, label: base(f.path), count: String(f.count) };
    }));

    var flags = '';
    if (b >= 2) {
      flags = PMK.btn('.*', { tip: 'Regular expression' }) +
              PMK.btn('Aa', { tip: 'Match case' }) +
              PMK.btn('\\b', { tip: 'Whole word' });
    }

    /* BLIND SPOT 15, both halves, and the audit calls it the cheapest
       high-value fix in the panel.

       NO SILENT LOCAL FALLBACK. GitHub_Integration.md:L1600 / :L1630-L1631
       make it mandatory: remote acceleration is not a fallback path, so when
       it is down the panel must SAY it is down rather than quietly searching
       locally and returning a plausible answer. search.remote ships
       available:false, silentFallback:false, the reason code, the ready-made
       sentence and two actions, and every version rendered none of it while
       still offering to evict its cache. PMK.blocked draws it: the code
       verbatim, the sentence as prose, and remote.actions[] as real buttons.
       Severity is left to the kit, which assumes `blocked` for a payload that
       declares none -- the conservative read, and not this file's to mint.

       INDEX BUILD CANCELLED. index.lastBuild is a distinct TERMINAL state --
       partial generation discarded, resumable:false -- not a slower
       'unindexed', and the live index.state stays 'ok' beside it. Both are
       therefore rendered: the freshness line from index.states[], and the last
       build's own line and detail underneath. The rebuild menu item takes its
       label from lastBuild.actions[0] ('Start a fresh build'), which is the
       fixture's own wording for the fact that a cancelled build does not
       resume. */
    var rem = S.remote || {};
    var lb = S.index.lastBuild;

    var pinned = pin([
      pinRow(pinLbl('Query', b) +
        PMK.chip(S.query, null, true) +
        pinGrow(S.summary.matches + ' matches in ' + S.summary.files + ' files',
                state.width, b, 68 + (b >= 2 ? 104 : 0)) +
        flags),
      pinRow(
        (b >= 1 ? PMK.select(S.scope, S.scopeOptions, { style: 'flex:0 1 116px' }) : '') +
        pinSub(ix.line + (ix.annotateRows ? '' : DOT + S.index.builtAt),
               state.width, b, b >= 1 ? 120 : 0)),
      lb ? pinRow(pinLbl('Last build', b) +
        pinSub(lb.line + DOT + lb.detail, state.width, b, b >= 1 ? 84 : 0)) : '',
      rem.available === false ? PMK.blocked({
        code: rem.reason, sentence: rem.sentence, actions: rem.actions
      }) : ''
    ]);

    /* The consequence a replace carries is not this file's opinion: with
       remote acceleration down the match set the replace rewrites is the LOCAL
       one, and rem.sentence says so in the fixture's own words. A version that
       gates Replace all without repeating that is confirming against a match
       count the panel has already been told is incomplete. */
    var localOnly = rem.available === false ? ' ' + rem.sentence : '';

    var events = [];
    S.files.forEach(function (f) {
      f.hits.forEach(function (hit) {
        var w = matchWindow(hit, chars);
        events.push({
          /* the anchor column carries the LINE NUMBER for match rows: the
             ordering key of a query session is position, not time */
          time: String(hit.line),
          status: null,
          subjClass: ' vF-subj--code',
          subjHtml: esc(w.left) + '<mark class="vF-hit">' + esc(w.mid) + '</mark>' + esc(w.right),
          subj: w.left + w.mid + w.right,
          verb: null,
          line2: f.path, line2Kind: 'path',
          own: base(f.path),
          scope: f.path + ' line ' + hit.line + ', ' + f.count + ' matches in this file',
          actions: [
            { value: 'open', label: 'Open at line ' + hit.line },
            /* consequence clauses on the three replace routes are this file's
               words -- see the GATE block: the fixture ships no per-command
               consequence catalogue. The counts in them are the fixture's. */
            strong('replace_one', 'Replace this match',
                   'Rewrites this one occurrence in ' + base(f.path) + ' on disk.' + localOnly),
            { value: 'copy', label: 'Copy path and line' },
            { type: 'sep' },
            strong('file', 'Replace in ' + base(f.path),
                   'Rewrites all ' + f.count + ' matches in this file on disk. There is no ' +
                   'single undo for a file-wide replace.' + localOnly)
          ]
        });
      });
    });

    return streamFrame(pinned, chipStrip(chips, 'all', b, 'Matched files'), events, {
      title: 'Search', bucket: b, width: state.width, paused: false,
      filter: 'Filter matches',
      listLabel: 'Match stream',
      older: 'Load more results',
      scope: S.summary.matches + ' matches in ' + S.summary.files + ' files for ' + S.query,
      menu: [
        { type: 'sep' },
        { type: 'head', label: 'Search' },
        { value: 'replace', label: 'Replace in files' },
        strong('replace_all', 'Replace all',
               'Rewrites all ' + S.summary.matches + ' matches across ' + S.summary.files +
               ' files on disk. There is no single undo for a multi-file replace.' + localOnly),
        { value: 'scope', label: 'Set scope' },
        { type: 'sep' },
        { type: 'head', label: 'Index' },
        /* the fixture's own label for the fact that a cancelled build does
           not resume; hint is the terminal state it is recovering from */
        { value: 'rebuild',
          label: (lb && lb.actions && lb.actions[0]) ? lb.actions[0].label : 'Rebuild index',
          hint: lb ? lb.state : '' },
        /* BLIND SPOT 15. Every redesign offered to evict the cache of a
           service the fixture says is unavailable. Evict is disabled by the
           SAME field that drives the banner, with the same code and the same
           sentence, so the two can never disagree; the gate stays attached for
           the state where remote IS available. */
        strong('evict', 'Evict remote cache',
               'Discards the remote acceleration cache on ' + (rem.host || 'the remote host') +
               '. The next search rebuilds it from scratch.',
               { disabled: rem.available === false,
                 reason: rem.available === false ? rem.reason : '',
                 sentence: rem.available === false ? rem.sentence : '' }),
        { value: 'threshold', label: 'Large-file threshold',
          hint: S.index.largeFileThresholdMb + ' MB' },
        { value: 'symlinks', label: 'Follow symlinks',
          hint: S.index.followSymlinks ? 'on' : 'off' }
      ]
    });
  }

  /* ===================================================================== */
  /* SOURCE CONTROL                                                        */
  /* ===================================================================== */
  function panelSource(D, state) {
    var b = D.bucket(state.width), S = D.source;
    var chars = bandChars(state.width, b);

    /* BLIND SPOT 2. REPO IDENTITY. source.repo carries name, owner,
       nameWithOwner, host, remote, lifecycle, visibility, defaultBranch and
       TWO sibling repos, and ten of ten Source designs rendered none of it --
       the one blind spot the audit attributes to design convergence rather
       than to thin data. GI-005 (GitHub_Integration.md:L397) is a NEGATIVE
       constraint: the model "never assumes a single repo context", so a header
       that shows only a branch is showing the shape the spec forbids, and this
       panel showed exactly that.

       Two facts, one wrapping row: the identity (nameWithOwner + visibility)
       and the qualifiers (host, lifecycle, and the sibling COUNT, which is the
       fact that makes the single-repo assumption visibly wrong). The siblings
       are named in the panel menu rather than in the pin, because naming two
       more repositories in a 240px pinned block would elide all three into
       nothing. The repo is also the gate scope for every commit-side strong
       action below -- 'Discard unstaged' has to say WHICH repository. */
    var repo = S.repo || {};
    var repoLine = [repo.host, repo.lifecycle,
                    repo.siblingCount ? repo.siblingCount + ' sibling repos here' : '']
      .filter(Boolean).join(DOT);

    /* RISK 2 — the WORKING block. Pinned, always, at every width. */
    var branchOpts = S.branches.map(function (n) { return { value: n, label: n }; });
    var commitActs = [
      strong('amend', 'Amend last commit',
             'Replaces the last commit on ' + D.project.branch + '. Its hash changes, so a ' +
             'branch already pushed has to be force-pushed afterwards.'),
      { value: 'batches', label: 'Suggest commit batches' },
      { value: 'stage_all', label: 'Stage all' },
      /* the count is the fixture's; the irreversibility clause is this file's */
      strong('discard', 'Discard unstaged',
             'Discards the ' + S.counts.unstaged + ' unstaged changes in ' +
             repo.nameWithOwner + '. Git holds no copy of them.'),
      { type: 'sep' },
      { value: 'push', label: 'Push', hint: String(S.remote.outgoing) },
      { value: 'pull', label: 'Pull', hint: String(S.remote.incoming) }
    ];

    var pinned = pin([
      /* share:2 -- the identity and the qualifiers split this row */
      pinRow(pinLbl('Repo', b) +
        pinGrow(repo.nameWithOwner, state.width, b, 60, 2) +
        PMK.chip(repo.visibility) +
        pinSub(repoLine, state.width, b, 60, 2)),
      pinRow(pinLbl('Working', b) +
        PMK.select(D.project.branch, branchOpts, { style: 'flex:1 1 96px' }) +
        PMK.chip('+' + D.project.ahead, 'ok')),
      pinRow(pinSub(S.counts.staged + ' staged' + DOT + S.counts.unstaged + ' unstaged' +
        DOT + S.counts.worktrees + ' worktrees', state.width, b, 0)),
      pinRow('<input class="pmk-field vF-msg" type="text" placeholder="Commit message"' +
        ' aria-label="Commit message">'),
      pinRowG(
        PMK.btn('AI', { tip: 'Generate a commit message from the staged diff (advisory)' }) +
        PMK.btn('Commit', { primary: true, tip: 'Commit the staged changes' }) +
        PMK.overflow(commitActs, 'Commit actions'),
        repo.nameWithOwner + ' on ' + D.project.branch, commitActs)
    ]);

    var events = [];

    /* BROKE-2 sweep. This feed was S.history.slice(0, 2), then S.stash[0], then
       S.history[2] -- three of fourteen commits and one of three stashes, in a
       hand-written order no data drove, under a chip that counted all 26. Both
       collections render whole and interleave on their own clock. */
    var timed = S.history.map(function (c) { return commitEvent(c); })
      .concat(S.stash.map(function (s, i) { return stashEvent(s, i, D); }));
    sortByAge(timed, function (e) { return e.time; })
      .forEach(function (e) { events.push(e); });

    /* untimed, terminal-ish rows sort to the tail (see ordering rule) */
    S.worktrees.forEach(function (w) {
      var locked = !!w.lockReason;
      /* BLIND SPOT 9, partly. WorktreeGitImprovement.md:L439 names FOUR flags
         that drive action enablement -- locked, prunable, repairable and the
         lifecycle -- and every version derived enablement from lockedBy alone,
         which is why `Recover` appeared once in the whole versions directory,
         inside a comment. Remove is now legal only when the row is not locked
         AND the fixture marks it prunable; Recover appears only where the
         fixture marks it repairable. UI_Command_Catalog.md:L730 forbids manual
         prune while a worktree is active or blocked_preserved unless an
         override policy allows it and RECORDS the override, so a greyed-out
         Remove is only half the answer -- the reason travels with it.

         THE LIFECYCLE SENTENCE is the fixture's own consequence copy, and it
         differs per state: releasedSentence, orphanSentence, preservedSentence
         and reservedSentence. It is what the confirmation reads out, so the
         gate is quoting the data rather than a clause this file wrote. */
      var lcSay = w.releasedSentence || w.orphanSentence ||
                  w.preservedSentence || w.reservedSentence || '';
      var removable = !locked && w.prunable === true;
      var acts = [
        { value: 'open_files', label: 'Open files' },
        { value: 'compare', label: 'Compare' },
        { value: 'lineage', label: 'Focus lineage' }
      ];
      /* W-006: orchestrator-owned rows say Open Lane, never Open Thread */
      if (w.kind === 'orch') acts.push({ value: 'lane', label: 'Open Lane' });
      else if (w.kind === 'thread') acts.push({ value: 'thread', label: 'Open Thread' });
      if (w.repairable) {
        acts.push({ value: 'recover', label: 'Recover worktree' });
      }
      acts.push({ type: 'sep' });
      acts.push(strong('remove', 'Remove worktree',
        'Removes the checkout at ' + (w.path || 'no path on disk') + '. The branch ' +
        w.branch + ' and its lineage are not deleted.' + (lcSay ? ' ' + lcSay : ''),
        { disabled: !removable,
          reason: locked ? w.lockReason : (w.prunable === true ? '' : 'worktree_not_prunable'),
          sentence: locked ? 'Locked by ' + w.lockedBy + '.'
                           : (w.prunable === true ? ''
                              : (lcSay || 'Lifecycle ' + w.lifecycle + ' does not allow a prune.')) }));
      /* BROKE-3. The verb slot is this version's state word -- 'commit' on a
         commit, statusOf().word on a run -- and on a worktree it carried the
         literal 'worktree', so the five RESERVED lifecycle words
         (WorktreeGitImprovement.md:L297: reserved | active |
         blocked_preserved | released | orphaned) rendered nowhere and the
         only state on the row was the status pill. That substitution is
         worst on thread/ratings-schema, whose lifecycle is 'released' -- a
         clean merge into main, retained for lineage -- and whose pill says
         'disabled', so the row and its accessible name both announced a
         successfully merged worktree as unavailable.
         lifecycle is its own field precisely because PM_DATA.status cannot
         express these words (_pm-data.js:497-513); the pill still carries
         w.status, so the row now states BOTH channels instead of one word
         standing in for the other.

         THE ACCESSIBLE HALF, which the visible fix did not close. The status
         gutter precedes the text band in every row in every panel, so a name
         computed from content led with the status label and a released
         worktree still ANNOUNCED "Unavailable" first. The name is now spelled
         out in the order the finding asks for -- identity, then the reserved
         lifecycle word, then the status label as the secondary channel it is.
         The lifecycle word is spoken verbatim, snake_case included: it is a
         reserved token, and humanising 'blocked_preserved' into prose would
         re-introduce exactly the substitution this fix removes.

         w.path is OPTIONAL -- orch/lane-e-search is reserved and has none, and
         the unguarded concatenation printed a dangling ' · ' after the owner.
         The separator is now carried by the field, not by the row. */
      var wst = PMK.statusOf(w.status);
      var wDetail = locked
        ? w.lockReason + '. Locked by ' + w.lockedBy + '.'
        : w.owner + (w.path ? '. ' + w.path : '');
      events.push({
        time: null, status: w.status, verb: w.lifecycle,
        subj: w.branch,
        line2: locked
          ? w.lockReason
          : (w.owner + (w.path ? DOT + PMK.elide(w.path, 'path', chars) : '')),
        line2Mono: locked,
        force2: locked,
        own: w.base,
        say: w.branch + '. Lifecycle ' + w.lifecycle + '. ' + wst.label + '. ' + wDetail,
        /* the fixture's own lifecycle sentence, on the row rather than only in
           the confirmation: reserved / orphaned / released / blocked_preserved
           each say something a status pill cannot */
        cap: lcSay ? [lcSay] : null,
        scope: w.branch + ' (' + w.lifecycle + ') at ' + (w.path || 'no checkout on disk'),
        actions: acts
      });
    });

    /* THE WORKTREE FILTER BAR, and it is a regression this version owned.
       GitHub_Integration.md (the Worktrees paragraph) specifies it exactly:
       "All | Threads | Orchestrator | Manual", defaults to All, persisted per
       project as worktree_filter. v0, vA, vC, xS1 and xS2 have it; vB, vD, vE,
       vF and xS3 dropped it. This strip previously listed worktrees BY BRANCH,
       which is a different control -- twelve chips of branch names is a
       picker, not the four-way ownership filter the spec names. The chip strip
       is exactly where a filter bar belongs in this design, so it becomes one;
       the counts are computed from kind, which is the fixture's own field. */
    var KIND_CHIP = [
      { id: 'thread', label: 'Threads' },
      { id: 'orch', label: 'Orchestrator' },
      { id: 'manual', label: 'Manual' }
    ];
    var chips = [allChip('All', events.length)]
      .concat(KIND_CHIP.map(function (k) {
        var c = 0;
        S.worktrees.forEach(function (w) { if (w.kind === k.id) c++; });
        return { id: k.id, label: k.label, count: String(c) };
      }));

    return streamFrame(pinned, chipStrip(chips, 'all', b, 'Worktree filter'), events, {
      title: 'Source Control', bucket: b, width: state.width, paused: false,
      filter: 'Filter activity',
      listLabel: 'Repository activity stream',
      scope: repo.nameWithOwner,
      menu: [
        { type: 'sep' },
        /* GI-005 again: the workspace resolves more than one repository, so
           the siblings are NAMED. A panel that lists exactly one repo is the
           single-repo context L397 forbids assuming. */
        { type: 'head', label: 'Repositories' },
        { value: 'repo_current', label: repo.nameWithOwner, hint: repo.lifecycle }
      ].concat((repo.siblings || []).map(function (s) {
        return { value: 'repo_' + s, label: s };
      })).concat([
        { type: 'sep' },
        { type: 'head', label: 'Views' },
        { value: 'changes', label: 'Changes', hint: String(S.counts.staged + S.counts.unstaged) },
        { value: 'history', label: 'History', hint: String(S.counts.commits) },
        { value: 'graph', label: 'Graph' },
        { value: 'worktrees', label: 'Worktrees', hint: String(S.counts.worktrees) },
        { value: 'branches', label: 'Branches / Stash', hint: String(S.counts.branches) },
        { type: 'sep' },
        { value: 'review', label: 'Open Review Mode' },
        { value: 'conflicts', label: 'Open Conflict Assistant' }
      ])
    });
  }

  function commitEvent(c) {
    return {
      time: c.when, status: 'ok', verb: 'commit',
      subj: c.subject,
      line2: c.sha + DOT + c.who,
      own: 'main',
      scope: c.sha + ' ' + c.subject + ', by ' + c.who,
      actions: [
        { value: 'diff', label: 'Open diff' },
        { value: 'compare', label: 'Compare with parent' },
        { value: 'copy', label: 'Copy ' + c.sha },
        { type: 'sep' },
        strong('revert', 'Revert commit',
               'Writes a new commit that undoes ' + c.sha + '. History is not rewritten.')
      ]
    };
  }

  /* i is git's own stash enumeration (stash@{0} is the top of the stack), not a
     read of a fixed position -- every entry in source.stash renders. */
  function stashEvent(s, i, D) {
    return {
      time: s.when, status: 'stale', verb: 'stash',
      subj: s.label,
      line2: 'stash@{' + i + '}' + DOT + D.project.branch,
      own: D.project.branch,
      scope: 'stash@{' + i + '} ' + s.label + ' on ' + D.project.branch,
      actions: [
        { value: 'apply', label: 'Apply stash' },
        strong('pop', 'Pop stash',
               'Applies stash@{' + i + '} to ' + D.project.branch + ' and then deletes the ' +
               'stash entry. A conflict during apply leaves the entry gone.'),
        strong('drop', 'Drop stash',
               'Deletes stash@{' + i + '} without applying it. The changes it holds are not ' +
               'recoverable from git.')
      ]
    };
  }

  /* ===================================================================== */
  /* GITHUB ACTIONS                                                        */
  /* ===================================================================== */
  function panelGit(D, state) {
    var b = D.bucket(state.width), A = D.actions;

    /* The three canonical subviews stay visible as a picker rather than a
       tab strip: 36 characters of labels do not fit a 224px row
       (research/actions.md:L161). */
    var subview = PMK.select('current', [
      { value: 'current', label: 'Current Branch' },
      { value: 'workflows', label: 'Workflows' },
      { value: 'settings', label: 'Settings' }
    ], { style: 'flex:1 1 96px' });

    /* BROKE-6. GI-021 (GitHub_Integration.md:L1271-L1275): archived, deleted
       and historical_only disable mutation DETERMINISTICALLY, and the limit is
       shown as effective capability STATE -- in prose -- never as a hidden or
       silently-live control. The repository this panel reports on is archived,
       mutationDisabled is true, and every mutating control here was live: 26
       Rerun controls, 0 disabled.

       The identity is rendered with it. actions.repository is NOT project.name
       (source.repo is), so a panel that shows a branch and no repo is showing
       the single-repo context GitHub_Integration.md:L397 forbids assuming --
       and here it would attach the archived state to the wrong repository in
       the reader's head.

       The reason token is the fixture's own lifecycle word and the sentence is
       the fixture's own capability sentence. audit-git 4.9 records that this
       version has minted reason codes before; this fix does not add another.

       WHAT THAT FIRST PASS STILL GOT WRONG, and what the block below fixes:
       every one of those gates lived inside an overflow TEMPLATE. Templates
       are inert, so on the live DOM the panel had 87 gated menu items and
       ZERO disabled controls -- it asserted the constraint and enforced it
       nowhere a reader could see. See repoGate above. */
    var repo = A.repository;
    var g = repoGate(repo);
    var canRerun = g.can('rerun');
    var canCancel = g.can('cancel');
    var canDispatch = g.can('dispatch');
    var canSecrets = g.can('manage_secrets');

    var pinned = pin([
      pinRow(pinLbl('Actions', b) + subview +
        PMK.chip(A.connection.effective, 'ok')),
      pinRow(pinLbl('Repository', b) +
        pinGrow(repo.nameWithOwner, state.width, b, 8)),
      pinRow(pinSub(A.readiness.branch + DOT + A.readiness.green + '/' + A.readiness.of +
        ' green' + DOT + A.readiness.snapshot + DOT + A.readiness.age, state.width, b, 0)),
      /* THE GI-021 CAPABILITY BLOCK. Three requirements, one surface:
           - the lifecycle token, verbatim, in mono;
           - the capability sentence as PROSE. It wraps in .pmk-blocked-say
             rather than being elided into a pin line, because it is the
             load-bearing sentence of GI-021 and 'You can view runs but cannot
             dispa…' is not it. It is also the ONE place effective capability
             is stated in words rather than implied by a greyed button, which
             is why the audit scores losing it as an introduced regression;
           - the two repository-scope mutations, kept VISIBLE and disabled with
             the reason readable beside them. L1275 is explicit that the
             control must not be hidden, and the fixture's own comment adds
             that a version which hides its Dispatch button here is violating
             it. Both are derived from the capability map, so a repository that
             allows one and not the other renders exactly that. */
      blockedBlock(
        { code: g.reason,
          sentences: [g.say, g.frozen && g.sentence !== g.say ? g.sentence : ''] },
        [gateBtn('Run workflow', !canDispatch, g.why,
                 'Dispatch a workflow run on this repository'),
         gateBtn('Manage secrets', !canSecrets, g.why,
                 'Open secrets and variables for this repository')]),
      /* The account banner keeps its LIVE Reconnect deliberately. GI-021
         freezes mutation of the REPOSITORY; reconnecting the GitHub account is
         neither a repository mutation nor made pointless by one, and the
         missing workflow scope is the thing that button exists to repair.
         Gating it would be the mirror-image error of leaving Dispatch live. */
      PMK.blocked(A.connection.blocked)
    ]);

    /* GI-017: never SILENTLY aggregate worktrees into one branch stream. The
       chip axis is the branch, chip 1 is main = the Current Branch subview,
       and every row carries its branch. */
    var branches = [];
    A.runs.forEach(function (r) { if (branches.indexOf(r.branch) < 0) branches.push(r.branch); });
    var chips = [allChip('All', A.runs.length)].concat(branches.map(function (n) {
      var c = 0;
      A.runs.forEach(function (r) { if (r.branch === n) c++; });
      return { id: n, label: n, count: String(c) };
    }));

    var events = A.runs.map(function (r) {
      var st = D.status[r.status];
      /* Lifecycle first, run status second. The lifecycle limit is
         deterministic and applies to every row; the status limit is per-row.
         Whichever bites, the code and the sentence beside it are the one that
         actually blocks the control. */
      var noFail = r.status !== 'failed';
      var noStop = r.status !== 'running';
      var e = {
        time: r.age, status: r.status, verb: st.word,
        subj: r.run + ' ' + r.name,
        line2: r.branch + DOT + r.dur,
        own: r.branch,
        scope: 'run ' + r.run + ' ' + r.name + ' on ' + r.branch + ' in ' + repo.nameWithOwner,
        actions: [
          { value: 'open_run', label: 'Open run ' + r.run },
          { value: 'rerun', label: 'Re-run',
            disabled: !canRerun,
            reason: canRerun ? '' : g.reason,
            sentence: canRerun ? '' : g.sentence },
          { value: 'rerun_failed', label: 'Re-run failed jobs',
            disabled: !canRerun || noFail,
            reason: !canRerun ? g.reason : (noFail ? 'actions_no_failed_jobs' : ''),
            sentence: !canRerun ? g.sentence
                                : (noFail ? 'This run has no failed jobs to rerun.' : '') },
          strong('cancel', 'Cancel run',
            'Stops run ' + r.run + ' of ' + r.name + ' on ' + r.branch + ' while it is in ' +
            'flight. A cancelled run cannot be resumed; it can only be re-run from the start.',
            { disabled: !canCancel || noStop,
              reason: !canCancel ? g.reason : (noStop ? 'actions_run_not_cancellable' : ''),
              sentence: !canCancel ? g.sentence
                                   : (noStop ? 'Only queued or running runs can be cancelled.' : '') }),
          { type: 'sep' },
          { value: 'logs', label: 'View logs' },
          { value: 'compare', label: 'Compare last success' },
          { value: 'diff', label: 'Open related diff' },
          { value: 'worktree', label: 'Open related worktree' },
          { value: 'browser', label: 'Open in browser' }
        ]
      };
      if (r.triage) {
        e.force2 = true;
        /* was r.triage.lines[1] -- a fixed position into a fixture array whose
           four blocks carry three and four lines each, so which line surfaced
           was decided by where the fixture happened to put it and the rest were
           unreachable at every width. The run is joined and the row's own
           elision budget cuts it. */
        e.line2 = r.triage.step + ' - ' + r.triage.lines.join(' ');
        /* BLIND SPOT 5, AND A REGRESSION VS v0 FOR THE SECOND AUDIT RUNNING.
           GitHub_Integration.md:L920 defines the failure triage capsule as
           "changed files plus likely next action". v0 renders both; all six
           Actions redesigns rendered neither, and pass 1 excused it because the
           fixture carried only job/step/log lines. The fixture now ships
           changedFiles, changedCount and likelyNext on all four triage blocks,
           and grepping the emitted markup for a string that exists only in
           changedFiles still returned nothing in any redesign at any width.
           Both lines are the fixture's, verbatim; only the words 'changed' and
           'Next:' are this file's, and they are labels, not claims. The log
           lines stay on line 2, so the capsule ADDS the two facts rather than
           displacing the assertion text. */
        e.cap = [
          r.triage.changedCount + ' changed: ' + r.triage.changedFiles.join(', '),
          'Next: ' + r.triage.likelyNext
        ];
      }
      if (r.blocked) {
        e.force2 = true;
        e.line2 = r.blocked.code;
        e.line2Mono = true;
        /* Two defects in one block, both from letting the kit draw it.
           PMK.blocked renders only b.actions, and the two environment-review
           runs -- the rows whose entire content is "a reviewer must approve"
           -- carry allowedActionIds and NO actions[], so they rendered no
           action at all; the one row that did carry actions[] rendered it
           LIVE, on an archived repository. Both halves close here: the allowed
           ids are surfaced as real buttons, and the mutating half of each list
           is gated by the same repository rule as the kebab, so 'Request
           review' is visible and disabled while 'Open environment' stays
           usable. Labels are derived from the ids and the untouched id travels
           as the value (see actionLabel); where the fixture ships a label for
           an id, that label wins. */
        var named = {};
        (r.blocked.actions || []).forEach(function (a) { named[a.id] = a.label; });
        var ids = (r.blocked.allowedActionIds && r.blocked.allowedActionIds.length)
          ? r.blocked.allowedActionIds
          : (r.blocked.actions || []).map(function (a) { return a.id; });
        e.blockedHtml = blockedBlock(
          { code: r.blocked.code, sentences: [r.blocked.sentence] },
          allowedActions(ids, named).map(function (a) {
            return gateBtn(a.label, g.frozen && isMutation(a.id), g.why, 'Command ' + a.id);
          }));
      }
      return e;
    });

    return streamFrame(pinned, chipStrip(chips, 'all', b, 'Branches'), events, {
      title: 'GitHub Actions', bucket: b, width: state.width, paused: true,
      filter: 'Filter runs',
      listLabel: 'Workflow run stream',
      scope: repo.nameWithOwner + ' (' + repo.lifecycle + ') as ' + A.connection.effective,
      menu: [
        { type: 'sep' },
        { type: 'head', label: 'Workflows' }
      ].concat(A.workflows.map(function (w) {
        return {
          value: w.file, label: w.name, hint: 'dispatch',
          disabled: !canDispatch || !w.dispatchable,
          reason: !canDispatch ? g.reason
                               : (w.dispatchable ? '' : 'actions_workflow_not_dispatchable'),
          sentence: !canDispatch ? g.sentence
                                 : (w.dispatchable ? '' : A.connection.blocked.sentence)
        };
      })).concat([
        { type: 'sep' },
        { type: 'head', label: 'Settings' },
        /* account-scope, not repository-scope: see the pinned banner comment */
        { value: 'reconnect', label: 'Reconnect account' },
        { value: 'secrets', label: 'Secrets and variables',
          hint: String(A.secrets.length),
          disabled: !canSecrets,
          reason: canSecrets ? '' : g.reason,
          sentence: canSecrets ? '' : g.sentence },
        strong('disconnect', 'Disconnect',
               'Revokes this workspace\'s link to the GitHub account ' +
               A.connection.effective + '. Every run list, dispatch route and ' +
               'secret reference in this panel stops resolving until it is reconnected.')
      ])
    });
  }

  /* ===================================================================== */
  /* DOCKER MANAGER                                                        */
  /* ===================================================================== */
  function panelDocker(D, state) {
    var b = D.bucket(state.width), K = D.docker;
    var chars = bandChars(state.width, b);

    /* CRAU-009 reconciliation: all 10 subviews stay VISIBLE, unavailable ones
       disabled with the reason code and sentence rendered in the popup body
       (never a native title). The picker is the only shape that fits: 10
       chips x 24px = 240px against a 224px band. */
    var subview = PMK.select('containers', K.subviews.map(function (s) {
      return {
        value: s.id,
        label: s.label + (s.count ? '  ' + s.count : ''),
        disabled: s.available === false,
        reason: s.reason, sentence: s.sentence
      };
    }), { style: 'flex:1 1 96px' });

    var pinned = pin([
      pinRow(pinLbl('Runtime', b) + subview +
        PMK.chip(K.runtime.engine, K.runtime.state === 'ok' ? 'ok' : 'warn')),
      /* four segments, not six: metaRun caps at 4 in bucket 2 and six 10px
         segments measure past the 361px band in basic-*, which would fire R1
         on a strip that cannot scroll.
         Read by ID, not by position: these were K.subviews[0|1|7] and they
         resolved only because the fixture appended its eleventh row at index
         10 -- audit-docker filed that as fixture discipline standing in for
         version correctness. */
      pinRow(PMK.metaRun([
        'context ' + K.runtime.context,
        subCount(K, 'containers', 'containers '),
        subCount(K, 'images', 'images '),
        subCount(K, 'volumes', 'volumes ')
      ], b))
    ]);

    var events = [];

    /* BROKE-2 sweep, one panel over from Agents and the same defect. This was
       a nine-element array of fixed container and image indices, so the feed
       showed 5 of 24 containers and 4 of 16 images -- underneath a strip
       reading "containers 16/24" and a chip strip listing all 24 by name.
       Both collections merge and sort on their own age.

       THE SORT NOW HAPPENS OVER EVENTS, not over fixture rows, because the
       compose SCENARIOS carry a lastRun age and belong in the same ordering.
       Discriminating fixture shapes after the sort (row.image !== undefined)
       does not extend to a third type without guessing at another field. */
    sortByAge(
      K.containers.map(function (c) { return containerEvent(c, chars, D); })
        .concat(K.images.map(function (im) { return imageEvent(im, chars); }))
        .concat((K.compose.scenarios || []).map(function (s) {
          return scenarioEvent(s, K);
        })),
      function (e) { return e.time; }
    ).forEach(function (e) { events.push(e); });

    /* untimed tail: compose services, the blocked registry, the publish chain */
    K.compose.services.forEach(function (s) {
      events.push({
        time: null, status: s.status, verb: 'service',
        subj: s.name,
        line2: K.compose.project + DOT + K.compose.file,
        own: K.compose.project,
        scope: 'service ' + s.name + ' in project ' + K.compose.project +
               ' (' + K.compose.file + ')',
        actions: [
          { value: 'up', label: 'Compose up' },
          strong('down', 'Compose down',
                 'Stops and removes every container in project ' + K.compose.project +
                 ', not only ' + s.name + '. Anonymous volumes go with them.'),
          { value: 'logs', label: 'Open logs' },
          { value: 'restart', label: 'Restart service' }
        ]
      });
    });

    K.registries.forEach(function (r) {
      var bad = r.state !== 'ok';
      events.push({
        time: null, status: bad ? 'blocked' : 'ok', verb: 'registry',
        subj: r.host,
        line2: bad ? r.reason : r.capability,
        line2Mono: bad,
        force2: bad,
        own: r.capability,
        blocked: bad ? { code: r.reason, sentence: r.sentence,
                         actions: [{ id: 'settings', label: 'Open Settings' }] } : null,
        actions: [
          { value: 'login', label: 'Sign in to registry', disabled: bad,
            reason: bad ? r.reason : '', sentence: bad ? r.sentence : '' },
          { value: 'browse', label: 'Browse repositories', disabled: bad,
            reason: bad ? r.reason : '', sentence: bad ? r.sentence : '' }
        ]
      });
    });

    K.publish.stages.forEach(function (s) {
      events.push({
        time: null, status: s.status, verb: 'publish',
        subj: s.n + '. ' + s.label,
        line2: K.build.tag,
        own: 'stage ' + s.n,
        actions: [
          { value: 'open', label: 'Open stage receipt' },
          { value: 'retry', label: 'Retry from this stage',
            disabled: s.status !== 'blocked' && s.status !== 'failed',
            reason: 'publish_stage_not_retryable',
            sentence: 'Only a blocked or failed stage can be retried.' }
        ]
      });
    });

    var staleN = 0;
    (K.compose.scenarios || []).forEach(function (s) { if (s.stale) staleN++; });

    var chips = [allChip('All', events.length)]
      .concat(K.containers.map(function (c) {
        return { id: c.name, label: c.name, count: '' };
      }))
      .concat([{ id: 'compose', label: 'compose:' + K.compose.project,
                 count: String(K.compose.services.length) },
               /* the scenario chip carries the STALE count, not the total:
                  'stale' is the state CRAU:L148 wants visible from the strip */
               { id: 'scenarios', label: 'scenarios',
                 count: (K.compose.scenarios || []).length + (staleN ? ' - ' + staleN + ' stale' : '') }]);

    return streamFrame(pinned, chipStrip(chips, 'all', b, 'Containers and compose'), events, {
      title: 'Docker Manager', bucket: b, width: state.width, paused: true,
      filter: 'Filter events',
      listLabel: 'Container runtime stream',
      scope: K.runtime.engine + ' on context ' + K.runtime.context,
      menu: [
        { type: 'sep' },
        { type: 'head', label: 'Subviews' }
      ].concat(K.subviews.map(function (s) {
        return {
          value: s.id, label: s.label, hint: s.count,
          disabled: s.available === false,
          reason: s.reason, sentence: s.sentence
        };
      })).concat([
        { type: 'sep' },
        /* the scenario commands the fixture names: save / run / edit / delete.
           The list itself lives in the stream; this is the create route. */
        { value: 'scenario_save', label: 'Save current as scenario',
          hint: String((K.compose.scenarios || []).length) },
        { value: 'build', label: 'Build image', hint: K.build.dockerfile },
        strong('prune', 'Prune unused',
               'Deletes every stopped container, unused network and dangling image on ' +
               'context ' + K.runtime.context + ' at once. It is not scoped to the rows ' +
               'shown here, and nothing it removes can be recovered.')
      ])
    });
  }

  /* A subview's count, addressed by the subview's own id. Returns '' when the
     fixture does not carry that subview, so metaRun drops the slot whole
     rather than printing a label with nothing after it. */
  function subCount(K, id, prefix) {
    var s = byId(K.subviews, id);
    return s && s.count ? prefix + s.count : '';
  }

  /* THE COMPOSE SCENARIO LIST. The clearest regression in the whole audit:
     v0 has it, NINE OF NINE Docker redesigns dropped it, and CRAU:L148 wants
     the drift SHOWN and REPAIRABLE rather than silently re-read. The fixture
     ships four scenarios, two stale, each with drift, driftSummary and its own
     repair action -- and nobody rendered the list, the badge or the repair
     path. All four render here as ordinary stream rows on their lastRun age,
     which is what makes them fit a feed at all.

     SEVERITY IS DERIVED, NOT MINTED. A stale scenario that is still VALID can
     be run knowing it has drifted, and one whose service no longer exists
     cannot -- so valid:true takes the kit's `warning` tier and valid:false
     takes `blocked`. Both words come from the kit's own severity vocabulary
     (K.severityOf), and the split reads a field the fixture ships rather than
     a judgement this file makes. It also puts the warning tier on screen for
     the first time: blind spot 1 records that the tier "renders nowhere". */
  function scenarioEvent(s, K) {
    var acts = [
      { value: 'run', label: 'Run scenario' },
      { value: 'edit', label: 'Edit scenario' },
      { value: 'save', label: 'Save current as scenario' }
    ];
    if (s.repair) acts.push({ value: 'repair', label: s.repair.label });
    acts.push({ type: 'sep' });
    acts.push(strong('delete', 'Delete scenario',
      'Deletes the saved scenario ' + s.name + ' (' + s.services + ' services from ' +
      s.file + '). The compose file itself is not touched.'));

    return {
      time: s.lastRun, status: s.status, verb: 'scenario',
      subj: s.name,
      line2: s.services + ' services' + DOT + s.profiles.join(', ') + DOT + s.file,
      force2: !!s.stale,
      own: s.file,
      scope: 'scenario ' + s.name + ' in ' + s.file,
      say: s.name + '. Compose scenario. ' + (s.stale ? 'Stale. ' + s.driftSummary + '. ' : '') +
           s.services + ' services, last run ' + s.lastRun + '.',
      blocked: s.stale ? {
        code: s.drift, sentence: s.driftSummary,
        severity: s.valid ? 'warning' : 'blocked',
        actions: s.repair ? [{ id: s.repair.id, label: s.repair.label }] : []
      } : null,
      actions: acts
    };
  }

  function containerEvent(c, chars, D) {
    var st = D.status[c.status];
    return {
      time: c.age, status: c.status, verb: st.word,
      subj: c.name,
      line2: c.detail
        ? c.detail + DOT + PMK.elide(c.image, 'image', chars)
        : PMK.elide(c.image, 'image', chars) + (c.ports ? DOT + c.ports : ''),
      force2: !!c.detail,
      own: c.ports || '',
      scope: 'container ' + c.name + ' from ' + c.image + (c.ports ? ' on ' + c.ports : ''),
      actions: [
        { value: 'logs', label: 'Open logs' },
        { value: 'terminal', label: 'Open in Terminal' },
        { value: 'restart', label: 'Restart' },
        strong('stop', 'Stop',
               'Stops ' + c.name + ' now. Anything served on ' +
               (c.ports || 'its published ports') + ' stops answering.'),
        { type: 'sep' },
        { value: 'url', label: c.url ? 'Open ' + c.url : 'Open access URL',
          disabled: !c.url,
          reason: c.url ? '' : 'access_url_unresolved',
          sentence: c.url ? '' : 'No direct access URL detected' },
        strong('remove', 'Remove container',
               'Deletes the container ' + c.name + ' and its writable layer. Named volumes ' +
               'survive; anything written outside one does not.')
      ]
    };
  }

  function imageEvent(im, chars) {
    return {
      time: im.age, status: 'ok', verb: 'image',
      subj: PMK.elide(im.ref, 'image', chars),
      line2: im.size + DOT + PMK.elide(im.digest, 'digest'),
      own: im.size,
      scope: 'image ' + im.ref + ' (' + im.size + ', ' + im.digest + ')',
      actions: [
        { value: 'inspect', label: 'Inspect image' },
        { value: 'push', label: 'Push to registry' },
        { value: 'copy', label: 'Copy digest' },
        { type: 'sep' },
        strong('remove', 'Remove image',
               'Deletes ' + im.ref + ' locally, reclaiming ' + im.size.trim() +
               '. Pulling it again needs the registry to still hold ' + im.digest + '.')
      ]
    };
  }

  /* WHICH redaction state governs artifact_preview.
     tests.redaction is the panel's live record and it is clean. Deciding from
     that alone is what every version did, and it is the wrong read: the FAILURE
     record, tests.redactionFailed, names 'artifact_preview' in its blocks[] and
     names two affectedArtifacts that are IN the list this region renders
     (playwright-trace.zip, import-worker-stdout-retry-2.log). A gate is decided
     by what the region actually shows, not by which object was read first, so
     the overlap is what promotes the region to the failed state.
     The vocabulary -- the three ids, their preview policy, their copy and
     dismissible -- is read whole from tests.redactionStates. */
  function redactionGate(T) {
    var live = T.redaction || {};
    var fail = T.redactionFailed;
    var gov = live.state;
    if (fail && (fail.blocks || []).indexOf('artifact_preview') >= 0) {
      var have = {};
      (T.artifacts || []).forEach(function (a) { have[a.name] = true; });
      var hit = false;
      (fail.affectedArtifacts || []).forEach(function (n) { if (have[n]) hit = true; });
      if (hit) gov = fail.state;
    }
    return {
      state: byId(T.redactionStates, gov) ||
             { id: gov, line: live.note, preview: 'render', dismissible: true },
      failed: (fail && gov === fail.state) ? fail : null
    };
  }

  /* ===================================================================== */
  /* TESTING                                                               */
  /* ===================================================================== */
  function panelTests(D, state) {
    var b = D.bucket(state.width), T = D.tests;
    var chars = bandChars(state.width, b);

    /* pinned = active_run_detail. Enablement is per adapter, never global.
       The picker opens on the first capability the fixture reports OK rather
       than on whatever sits at position 0: a blocked or prohibited adapter is
       not a default, and the option list is disabled-with-reason, so opening on
       one would mean the picker's own value is unusable. */
    var capOpen = null, capFirst = null;
    T.policy.capabilities.forEach(function (c) {
      if (!capFirst) capFirst = c;
      if (!capOpen && c.state === 'ok') capOpen = c;
    });
    capOpen = capOpen || capFirst;

    var caps = PMK.select(capOpen ? capOpen.id : '',
      T.policy.capabilities.map(function (c) {
        return {
          value: c.id, label: c.label + '  ' + c.mode,
          disabled: c.state === 'blocked' || c.state === 'prohibited',
          reason: c.reason, sentence: c.sentence
        };
      }), { style: 'flex:1 1 96px' });

    /* The pinned Cancel button was labelled "confirmation required" in its own
       tooltip and had none: it was a one-click stop on the suite in flight.
       It is now a strongBtn, which is the same gate the menu items use --
       _pm-data.js:1176 records that cancel_run "needs a confirm the kit cannot
       currently express", which was true of PMK and never true of PM.confirm.
       The consequence quotes the fixture's own progress numbers, because
       "cancel 118 of 214 tests" is the fact that decides the answer. */
    var pinned = pin([
      pinRow(pinLbl('Active run', b) +
        pinGrow(T.active.name, state.width, b, 80) +
        PMK.chip(T.runtime.adapter, 'ok')),
      pinRow(pinSub(T.active.done + '/' + T.active.total + DOT +
        T.active.passed + ' passed' + DOT + T.active.failed + ' failed' + DOT +
        T.active.skipped + ' skipped' + DOT + T.active.elapsed, state.width, b, 0)),
      pinRow(caps +
        PMK.btn('Watch', { tip: 'Watch the running suite' }) +
        strongBtn('cancel_active', 'Cancel',
          T.active.name + ', ' + T.active.done + ' of ' + T.active.total + ' done after ' +
          T.active.elapsed,
          'Stops the suite where it is. The ' + (T.active.total - T.active.done) +
          ' tests not yet run produce no result, and a cancelled run restarts from the ' +
          'beginning rather than resuming.'))
    ]);

    var suites = [];
    T.runs.forEach(function (r) { if (suites.indexOf(r.name) < 0) suites.push(r.name); });
    var chips = [allChip('All', T.runs.length)].concat(suites.map(function (n) {
      var c = 0;
      T.runs.forEach(function (r) { if (r.name === n) c++; });
      return { id: n, label: n, count: String(c) };
    }));

    /* run_list + failure_list are ONE stream; the failures of the active run
       carry that run's age because they happened inside it.
       The active run is MATCHED against active_run_detail rather than taken
       from position 0: T.runs is no longer reverse-chronological (217 at 6h and
       216 at 8h were appended after 201 at 5d), so index 0 is an accident of
       fixture order, not "the run in flight". */
    var activeRun = null;
    T.runs.forEach(function (r) {
      if (!activeRun && r.name === T.active.name && r.status === T.active.status) activeRun = r;
    });

    /* EXPORT IS EGRESS, AND THE ATTESTATION IS THE POINT. An export leaves the
       machine, so the thing the confirmation owes the reader is not "are you
       sure" but WHAT REDACTION STATE the bundle carries -- and this panel
       already computes it (redactionGate). When redaction is clean the sheet
       states the attestation the fixture spells ('4 fields redacted before
       display'); when it has FAILED the sheet states the failure sentence and
       the two artifacts it names, because exporting then ships unmasked
       secrets. Automated_Testing_System.md:L83-L98 blocks display AND
       PERSISTENCE on a redaction failure; a bundle written to disk is
       persistence. This is the one gate in the file whose consequence is
       entirely the fixture's words. */
    var rgate = redactionGate(T);
    var exportSay = rgate.failed
      ? rgate.failed.sentence + ' ' + rgate.failed.detail +
        ' Affected: ' + rgate.failed.affectedArtifacts.join(', ') + '.'
      : rgate.state.line + '. The bundle leaves this machine with that redaction ' +
        'profile applied and nothing else.';

    var events = [];
    T.runs.forEach(function (r) {
      var st = D.status[r.status];
      events.push({
        time: r.when, status: r.status, verb: st.word,
        subj: '#' + r.id + ' ' + r.name,
        line2: T.runtime.adapter + DOT + 'run ' + r.id,
        own: 'run ' + r.id,
        sel: r === activeRun,
        scope: 'run ' + r.id + ', ' + r.name + ', ' + st.label.toLowerCase() + ' ' + r.when + ' ago',
        actions: [
          { value: 'watch', label: 'Watch run',
            disabled: r.status !== 'running',
            reason: r.status !== 'running' ? 'run_status_terminal' : '',
            sentence: r.status !== 'running' ? 'Watch is available only while a run is queued or running.' : '' },
          strong('cancel', 'Cancel run',
            'Stops run ' + r.id + ' where it is. A cancelled run keeps its receipt but ' +
            'produces no result for the tests it never reached, and it restarts from the ' +
            'beginning rather than resuming.',
            { disabled: r.status !== 'running',
              reason: r.status !== 'running' ? 'run_status_terminal' : '',
              sentence: r.status !== 'running' ? 'Only a queued or running run can be cancelled.' : '' }),
          { value: 'receipt', label: 'Open receipt',
            disabled: r.status === 'running',
            reason: r.status === 'running' ? 'run_status_not_terminal' : '',
            sentence: r.status === 'running' ? 'The receipt exists once the run reaches a terminal state.' : '' },
          { type: 'sep' },
          strong('export', 'Export bundle',
                 'Writes run ' + r.id + ' and its artifacts outside this workspace. ' + exportSay)
        ]
      });
      if (r === activeRun) {
        T.failures.forEach(function (f) {
          events.push({
            time: r.when, status: 'failed', verb: 'assert',
            subj: PMK.elide(f.test, 'ref', chars),
            line2: f.message,
            force2: true,
            own: 'run ' + r.id,
            actions: [
              { value: 'open_failure', label: 'Open failure' },
              { value: 'copy', label: 'Copy assertion' }
            ]
          });
        });
      }
    });

    /* redaction_notice renders ABOVE artifact_preview: it is a display gate,
       not a footnote (research/tests.md:L20). It is built from the kit's
       blocked classes rather than PMK.blocked because PMK.blocked cannot mark
       an action destructive and the authorize route is destructive. Every
       string is the fixture's; no reason code and no state token is minted
       here.

       BROKE-5. The notice asserted "4 fields redacted before display"
       UNCONDITIONALLY, directly above eleven artifact chips two of which are
       the ones redactionFailed names as unmasked. That is the "silently
       downgrade evidence quality" outcome Automated_Testing_System.md:L83-L98
       names by that phrase: the gate exists FOR the failure case and it was
       affirming success over data that says redaction failed. */
    var rg = rgate;
    var rf = rg.failed;
    var rnamed = {};
    if (rf && rf.authorize) rnamed[rf.authorize.id] = rf.authorize.label;

    var footer = '<div class="vF-foot">' +
      '<div class="pmk-blocked' + (rf ? ' pmk-blocked--err' : '') + '">' +
      (rf ? '<span class="pmk-blocked-code">' + esc(rf.reason) + '</span>' : '') +
      '<span class="pmk-blocked-say">' + esc(rf ? rf.sentence : rg.state.line) + '</span>' +
      (rf ? '<span class="pmk-blocked-say">' + esc(rf.detail) + '</span>' : '') +
      '<span class="pmk-acts">' +
      /* THE AUTHORIZE ROUTE IS THE FIXTURE'S OWN GATED ACTION. It ships
         destructive:true AND needsConfirm:true (_pm-data.js:1293) -- the only
         place the fixture asks for a confirmation by name -- and it shipped
         here as a one-click red button. It is now the only strongBtn in this
         footer; every other allowed id stays an ordinary button, because
         retrying redaction and opening the profile are neither destructive nor
         egress. The consequence is the fixture's failure detail: authorising
         means the two named artifacts render UNMASKED. */
      (rf
        ? allowedActions(rf.allowedActionIds, rnamed).map(function (a) {
            var isAuth = !!(rf.authorize && a.id === rf.authorize.id);
            if (!isAuth) return PMK.btn(a.label, { tip: 'Command ' + a.id });
            return strongBtn('authorize',
              a.label,
              'run ' + rf.affectedRunId + ', ' + rf.affectedArtifacts.join(' and '),
              rf.detail + ' Authorising displays those ' + rf.failed +
              ' unmasked fields to anyone who can see this panel.');
          }).join('')
        : PMK.btn('Inspect redaction', { tip: 'Open the redaction profile for these artifacts' })) +
      '</span></div>' +
      /* preview: 'render' | 'placeholder' | 'suppress'. Anything but 'render'
         means the chips do not appear -- 'placeholder' forbids the raw asset
         just as hard as 'suppress' and this region has no placeholder asset to
         put in their place, so the notice occupies the region instead, which is
         what R27 asks for. Non-dismissibility is satisfied by construction:
         there is no dismiss control in this footer, and dismissible:false is
         the fixture saying not to add one. */
      (rg.state.preview === 'render'
        ? '<div class="vF-arts">' +
          T.artifacts.map(function (a) {
            return PMK.chip(a.name + '  ' + a.size, null, true);
          }).join('') + '</div>'
        : '') +
      '</div>';

    return streamFrame(pinned, chipStrip(chips, 'all', b, 'Suites'), events, {
      title: 'Testing', bucket: b, width: state.width, paused: false,
      filter: 'Filter runs and failures',
      listLabel: 'Test run and failure stream',
      scope: T.runtime.adapter + DOT + T.runs.length + ' runs shown of ' + T.paging.runs.total,
      footer: footer,
      menu: [
        { type: 'sep' },
        { type: 'head', label: 'Testing' },
        { value: 'run', label: 'Run tests' },
        { value: 'policy', label: 'Capability policy' },
        { value: 'visibility', label: 'Visibility policy', hint: T.policy.visibility },
        { value: 'redaction', label: 'Inspect redaction',
          hint: T.redaction.fields + ' fields' }
      ]
    });
  }

  /* ===================================================================== */
  /* AGENTS                                                                */
  /* ===================================================================== */
  function panelAgents(D, state) {
    var b = D.bucket(state.width), G = D.agents;

    var blockedN = 0;
    G.active.forEach(function (a) { if (a.status === 'blocked') blockedN++; });

    /* BLIND SPOT 12. PROVENANCE, on all sixteen registry entries, read by
       nobody -- so a shipped subagent was indistinguishable from one the user
       wrote. FinalGUISpec.md:L1398-L1415 makes protected_core / bundled /
       user_created a badge set, and it is not cosmetic: a protected_core entry
       cannot be edited or deleted, so the badge is the thing that EXPLAINS a
       disabled row action. It is rendered twice here, on purpose:

         - as the hint on every roster option, so the badge sits beside the
           name it qualifies;
         - as a COUNT LINE in the pinned block, because the audit's actual
           complaint is that a reader cannot tell the classes apart without
           opening anything, and an option hint only pays off after a click.

       REQUESTED vs EFFECTIVE PERSONA, the other half. An entry can resolve to
       a Persona other than the one it names, and a SILENTLY substituted
       persona is exactly the drift this panel exists to expose
       (orchestrator-subagent-integration.md:L1157/:L1169). The option label
       spells 'Investigator -> Implementer' where personaDiverged is set and
       carries the fixture's own personaSentence beside it.

       AND UNRESOLVABLE ENTRIES STAY VISIBLE. :L1334 is emphatic -- "Do not
       silently filter" -- so the two unresolvable rows render DISABLED with
       the fixture's error and detail, and the reason code is the fixture's own
       resolution token rather than one this file minted. */
    var PROV = ['protected_core', 'bundled', 'user_created'];
    var provN = {};
    PROV.forEach(function (p) { provN[p] = 0; });
    G.available.forEach(function (a) {
      if (provN[a.provenance] != null) provN[a.provenance]++;
    });

    var roster = PMK.select('all', [{ value: 'all', label: 'Available: ' + G.available.length }]
      .concat(G.available.map(function (a) {
        var bad = a.resolution === 'unresolvable' || a.enabled === false;
        var persona = a.personaDiverged
          ? a.requestedPersona + ' -> ' + a.effectivePersona
          : a.persona;
        return {
          value: a.name,
          label: a.name + '  ' + persona,
          hint: a.provenance,
          disabled: bad,
          reason: bad ? a.resolution : '',
          sentence: bad ? (a.error + ' ' + a.detail) : (a.personaSentence || '')
        };
      })), { style: 'flex:1 1 96px' });

    var pinned = pin([
      pinRow(pinLbl('Roster', b) + roster +
        PMK.chip(blockedN + ' blocked', blockedN ? 'warn' : null)),
      pinRow(pinSub(G.active.length + ' active' + DOT + G.completed.length + ' recent' +
        DOT + G.available.length + ' available', state.width, b, 0)),
      pinRow(pinLbl('Provenance', b) +
        pinSub(PROV.map(function (p) { return provN[p] + ' ' + p; }).join(DOT),
               state.width, b, b >= 1 ? 84 : 0))
    ]);

    var personas = G.available.map(function (a) { return a.persona; });
    var chips = [allChip('All', G.active.length + G.completed.length)]
      .concat(personas.map(function (p) {
        var c = 0;
        G.active.concat(G.completed).forEach(function (a) { if (a.persona === p) c++; });
        return { id: p, label: p, count: String(c) };
      }));

    function lineage(extra) {
      var items = G.lineageTargets.map(function (t, i) {
        return { value: 'lineage' + i, label: t };
      });
      return (extra || []).concat([{ type: 'sep' }, { type: 'head', label: 'Lineage' }])
        .concat(items);
    }

    /* ============ BROKE-2. The most severe defect this file carried. =========
       This was, unchanged since pass 1:

         var order = [G.active[1], G.active[0], G.active[2], G.active[3]];

       Four fixed positions against a fifteen-row array. It rendered 4 of 15
       active rows and 1 of 5 blocked episodes, while the pinned strip and the
       chip strip were both computed from the FULL array -- so the header said
       "5 blocked" over a list showing one, "15 active" over four, and the chip
       strip said "All 28" over 17 events. needs_approval,
       agent_session_disconnected, agent_session_restoring and
       remediation_ceiling_exceeded appeared nowhere in the markup at any width.
       FinalGUISpec.md:L3745 forbids collapsing concurrent blocked episodes;
       one line collapsed four of them, and kit rule 8 with it.

       The whole collection renders, ordered by the rule this version states in
       its own header rather than by a hand-written list.

       WHICH CLOCK RANKS A BLOCKED ROW. FinalGUISpec.md:L3743 requires TIME
       SINCE BLOCKED, and blockedFor is supplied for exactly that. elapsed is
       the age of the RUN and differs from it on two of the five blocked rows
       (Media Pipeline Wrangler 52m 04s vs 12m 31s, Schema Cartographer
       18m 47s vs 38s), so ranking or labelling those rows by elapsed puts the
       newest blockage third from the top and prints the wrong number beside it.
       A 41-second approval wait and a 3h 12m authority wait have to be
       rankable, and on elapsed they are not. */
    var events = [];
    sortByAge(G.active, function (a) { return a.blockedFor || a.elapsed; })
      .forEach(function (a) {
        var st = D.status[a.status];
        var when = a.blockedFor || a.elapsed;
        var e = {
          time: when === '--' ? null : when,
          status: a.status, verb: st.word,
          subj: a.name,
          line2: a.persona + DOT + a.target + DOT + a.thread,
          own: a.run || '',
          scope: a.name + ' on ' + a.target + ', run ' + (a.run || 'none') +
                 ', thread ' + a.thread
        };
        if (a.note) e.line2 = a.note + DOT + a.persona + DOT + a.thread;

        /* BLIND SPOT 12, the active half. A substituted persona is not a
           blocked state, and it is not nothing -- it is the WARNING tier, the
           one the kit ships and the audit records as rendering nowhere
           (blind spot 1). personaReason and personaSentence are the fixture's
           own code and sentence; the row keeps its identity line and the
           divergence gets the block, so 'running with a substituted persona'
           is no longer the only trace of it. */
        if (a.personaDiverged) {
          e.force2 = true;
          e.line2 = 'persona ' + a.requestedPersona + ' -> ' + a.effectivePersona +
                    DOT + a.target + DOT + a.thread;
          e.blocked = { code: a.personaReason, sentence: a.personaSentence,
                        severity: 'warning' };
          e.say = a.name + '. ' + st.label + '. Requested persona ' + a.requestedPersona +
                  ', effective persona ' + a.effectivePersona + '. ' + a.personaSentence;
        }

        if (a.reason) {
          /* BROKE-9. Every blocked row got the same minted "Request authority"
             button. research/agents.md 6 bars minting an agents-local authority
             state outright, and the button was wrong on four of the five rows:
             it sat beside "The session is restoring from a checkpoint. No
             action is needed yet.", whose ONLY allowed action is open_for_edit,
             and beside the remediation ceiling, where authority is not the
             issue. The row's kebab was worse than the button -- it offered
             "Cancel run" on all five, including the self-healing session.

             allowedActionIds[] is per row and it differs per row. It is now the
             only source of a blocked row's actions, in the block and in the
             kebab alike, and a row that allows nothing (the prohibited agent,
             which carries a reason and a sentence and no allowed ids) renders
             no action rather than a plausible one.

             The ceiling row's list is replan / open_for_edit / abort and
             contains no retry, which is FinalGUISpec.md:L3749-L3760's negative
             constraint holding because the data says so rather than because
             nothing was modelled. */
          /* the abort route is a strong action and shipped ungated: on the
             remediation-ceiling row it is the ONLY terminal choice the ceiling
             leaves, so it is the last one that should be one click. The
             consequence quotes the fixture -- the blocked sentence, and the
             remediation generation where the fixture carries one. */
          var allowed = allowedActionsGated(a.allowedActionIds, null, function () {
            return 'Ends ' + a.name + ' on run ' + (a.run || 'none') + ' at node ' +
              (a.nodeId || 'unknown') + '. ' + a.sentence +
              (a.remediation
                ? ' Remediation is at generation ' + a.remediation.generation + ' of ' +
                  a.remediation.ceiling + ' and the lineage stays visible.'
                : '');
          });

          /* BROKE-2, second half. Rendering the whole collection made the five
             blocked episodes visible and immediately made a second defect
             legible: the row OVERWROTE its own identity line with the reason
             code, and PMK.blocked printed that same code again 4px below it.
             Every blocked row read "Schema Cartographer blocked
             agent_session_restoring / agent_session_restoring The session is
             restoring..." -- the code twice, and persona, target and thread
             nowhere, on the five rows where knowing WHAT the agent was doing
             matters most. The fixture supplies all three on every blocked row.
             line2 therefore stays the identity every other row carries; the
             code is stated once, by the component whose job it is, at every
             width. force2 is kept so the identity survives b0/b1 -- a blocked
             row is still the one row that earns a second line at 240px. */
          e.force2 = true;
          e.blocked = { code: a.reason, sentence: a.sentence, actions: allowed };
          e.actions = lineage(
            allowed.length
              ? allowed.concat([{ type: 'sep' },
                                { value: 'config', label: 'Open in Agent Config' }])
              : [{ value: 'config', label: 'Open in Agent Config' }]);
        } else {
          e.actions = lineage([
            { value: 'watch', label: 'Watch run' },
            strong('cancel', 'Cancel run',
                   'Stops the delegation ' + a.name + ' on run ' + (a.run || 'none') +
                   ' after ' + a.elapsed + '. Its lineage is kept; the work in flight ' +
                   'on ' + a.target + ' is not resumed.'),
            { value: 'config', label: 'Open in Agent Config' }
          ]);
        }
        events.push(e);
      });

    G.completed.forEach(function (a) {
      var st = D.status[a.status];
      events.push({
        time: a.when, status: a.status, verb: st.word,
        subj: a.name,
        line2: a.persona + DOT + a.outcome,
        own: a.outcome,
        actions: lineage([{ value: 'config', label: 'Open in Agent Config' }])
      });
    });

    return streamFrame(pinned, chipStrip(chips, 'all', b, 'Personas'), events, {
      title: 'Agents', bucket: b, width: state.width, paused: false,
      filter: 'Filter delegations',
      listLabel: 'Delegation lifecycle stream',
      scope: G.active.length + ' active delegations, ' + blockedN + ' blocked',
      menu: [
        { type: 'sep' },
        { type: 'head', label: 'Agents' },
        { value: 'blocked', label: 'Show blocked only', hint: String(blockedN) },
        { value: 'activity', label: 'Open Agent Activity' },
        { value: 'config', label: 'Open Agent Config' }
      ]
    });
  }

  /* ===================================================================== */
  /* ARTIFACTS                                                             */
  /* ===================================================================== */
  var KIND_GLYPH = {
    code_diff: 'branch',
    validation_test: 'check',
    api_web_call: 'search',
    browser_recording: 'play',
    screenshot: 'square',
    cost_usage: 'bar',
    tool_llm_trace: 'refresh',
    restore_point: 'clock'
  };

  function panelArtifacts(D, state) {
    var b = D.bucket(state.width), R = D.artifacts;
    var bd = R.bundle;

    /* Bundle members lead with evidence_role, in the deterministic task-phase
       order the owner doc specifies. Role is short, ordered, and explains the
       row's function; the kind is secondary. */
    var pinned = pin([
      pinRow(pinLbl('Bundle', b) +
        PMK.chip(bd.id, null, true) +
        pinGrow(bd.title, state.width, b, 104)),
      pinRow(PMK.chip(bd.outcome, 'ok') + PMK.chip(bd.confidence, 'ok') +
        pinSub(bd.members.length + ' members', state.width, b, 96)),
      /* role only, at every width: role+kind is 23-27 characters per segment
         and five of them measure ~630px against a 461px band at 480px. The
         kinds are one tap away in the row overflow; the ROLE is the thing
         that explains the member's function. */
      pinRow(PMK.metaRun(bd.members.map(function (m) { return m.role; }), b))
    ]);

    var chips = R.families.map(function (f) {
      return { id: f.id, label: f.label, count: String(f.count) };
    });

    var events = R.rows.map(function (r) {
      var meta = r.meta || [];
      var when = meta[meta.length - 1];
      /* THE META TAIL. `Sources (N)`, the redaction count and the command id
         all live in meta[] -- 'cmd.chat.web.search', '5 sources', 'redacted 2'
         -- and this version read meta only for its LAST element, the age, and
         threw the rest away. That is the audit's "Sources (N), redaction
         count, provenance line" regression, and it was one slice.
         The age is consumed by the anchor column, so the tail is everything
         before it, in the fixture's own order. */
      var tail = meta.slice(0, -1).join(DOT);
      var st = D.status[r.status];
      var rec = r.kind === 'browser_recording';
      var gone = r.recordOnly === true || r.health === 'unavailable';

      var acts = [
        { value: 'open', label: 'Open artifact' }
      ];
      /* RAP-021, and a regression vs v0: a browser_recording gets the OPEN /
         WATCH PAIR, not a single Open. v0, xA1, xA2 and xA3 have it; all six
         full systems dropped it. Watch is disabled on the evicted record --
         with the fixture's own eviction reason and sentence -- because the
         record survives and the payload does not. */
      if (rec) {
        acts.push({ value: 'watch', label: 'Watch recording',
          disabled: gone,
          reason: gone ? (r.evictionReason || r.availability || '') : '',
          sentence: gone ? (r.sentence || '') : '' });
      }
      acts.push({ value: 'record', label: 'Open owning record' });
      if (r.provenance) acts.push({ value: 'prov', label: 'Open provenance record' });
      acts.push({ type: 'sep' });
      /* export is EGRESS. The consequence names the retention class the
         envelope carries (blind spot 4's field, read here for the first time)
         and the row's own redaction count where meta declares one. */
      var red = '';
      meta.forEach(function (m) { if (/^redacted /.test(m)) red = m; });
      acts.push(strong('export', 'Export record',
        'Writes ' + (r.title || r.kind) + ' (' + r.id + ') outside this workspace. ' +
        'Retention class ' + r.retention + '. ' +
        (red ? 'It carries ' + red + ' fields.' : 'It declares no redacted fields.')));

      return {
        time: when, status: r.status, verb: st.word,
        glyph: KIND_GLYPH[r.kind] || 'info',
        glyphTip: r.kind,
        /* title and preview are both OPTIONAL on the envelope. Without the
           fallbacks a titleless row renders a blank subject, and a
           previewless row renders the literal string "undefined" into line 2
           -- neither of which the geometry checker can see, because both are
           correctly sized. Kind is the one identity token every row carries;
           summary is the next-best body line. */
        subj: r.title || r.kind,
        /* KIND MOVES OFF LINE 2, and the measurement is the reason. With
           'api_web_call' leading, the budget at 380 and 480 cut the line at
           'cmd.chat.web.search · 5 sour…' -- so the string '5 sources' existed
           in NO width's markup, which is precisely the grep the audit runs to
           score the `Sources (N)` regression. Kind is not lost: it is the
           14px glyph and that glyph's accessible name on every row, it is the
           subject on a titleless row, and at b3 it takes the owning-object
           column, where family was duplicating the chip strip's own axis. */
        line2: [tail, r.preview || r.summary].filter(Boolean).join(DOT),
        own: r.kind,
        scope: (r.title || r.kind) + ' (' + r.id + ', ' + r.family + ', retention ' +
               r.retention + ')',
        /* the provenance SENTENCE, which is the third thing the regression
           names and the only one that cannot fit a meta segment */
        cap: r.provenance ? ['Provenance: ' + r.provenance] : null,
        /* the evicted record: the envelope's own words for a payload that is
           gone while the record is intact, with the routes it still allows */
        blocked: gone && r.sentence ? {
          code: r.evictionReason || r.availability, sentence: r.sentence,
          severity: 'warning', allowedActionIds: r.allowedActionIds
        } : null,
        actions: acts
      };
    });

    return streamFrame(pinned, chipStrip(chips, 'all', b, 'Artifact families'), events, {
      title: 'Artifacts', bucket: b, width: state.width, paused: false,
      filter: 'Filter artifacts',
      listLabel: 'Artifact stream',
      scope: 'investigation bundle ' + bd.id + ', ' + bd.members.length + ' members',
      menu: [
        { type: 'sep' },
        { type: 'head', label: 'Artifacts' },
        { value: 'bundle', label: 'Open investigation bundle', hint: bd.id },
        { value: 'import', label: 'Import bundle' },
        { value: 'compare', label: 'Set compare target' },
        { value: 'raw', label: 'Preview mode: Curated / Raw' }
      ]
    });
  }

  /* ===================================================================== */
  PM_BAKEOFF.register('vF', {
    name: 'Stream',
    blurb: 'Time is the axis; objects become filters. Highest risk, most novel.',
    panels: {
      search: panelSearch,
      source: panelSource,
      git: panelGit,
      docker: panelDocker,
      tests: panelTests,
      agents: panelAgents,
      artifacts: panelArtifacts
    }
  });
})(window);
