# A5 — W5 trees / accordions / disclosures

## Prototype (protos/trees.html, browser-verified on 8797)
- Nested measured max-height tree (5 kids, one nested), grid-rows accordion
  (4 rows), max-height disclosure — all three recipes validated.
- Open cascade: kids run pmKidIn with --pi delays 0/26/52/78/104ms (cap 6).
- Chevron overshoot sampled at 200ms = 102deg exactly (70% keyframe), end 90deg;
  close plays chevClose.
- Nested expand mid-parent-flight: contained=true after settle (parent ends at
  max-height:none so cascading children are fully contained).
- reduce(): accordion snaps full-height, 0 kid animations, kids opacity 1,
  tree .open correct.
- Grid-rows finding: auto-height grids clamp fr tracks at content size, so
  >1fr overshoot cannot exceed rest height in ANY theme; the per-theme
  personality is the velocity profile instead. Measured time-to-full-height:
  friendly spring 107ms, basic settle 84ms, retro snap 111ms of 140ms
  (asymptotic). transition-timing-function verified per theme.

## Final names / machinery
- CSS: @keyframes pmKidIn, chevOpen, chevClose; classes .pm-kid-in,
  .pm-chev-open, .pm-chev-close; --pm-chev-deg (90deg default, .sh-bchev 180deg).
- JS helpers (pm6-js-cozy-shelves, next to W4 pmFlip): pmCascadeKids(container,
  cap) = assign --pi + class bump + 640ms cleanup; pmChev(el, open) = restart
  chevOpen/chevClose; pmAccBody(acc) resolves the .pm-acc-inner track;
  pmHeadChev(head) scopes to the owning row's direct chevron.
- --acc-ease indirection CONFIRMED: one rule change
  (var(--acc-ease, var(--ease-spring)) on the [data-acc] body transition) +
  --acc-ease defined at :root and in all 8 [data-theme] blocks alongside A1's
  knobs. Resolved values verified in-page: friendly -> spring
  (.34,1.56,.64,1), basic -> settle (.26,1.4,.36,1), retro -> snap (.2,0,0,1).
- Chevron justification: kept the plain transform transitions as no-JS +
  reduced-motion fallbacks; a running animation always wins over a transition
  on the same property and both land on the identical end state the static
  .open rules already define.

## Changed anchors (base only)
- :root tokens: --acc-ease, --pm-chev-deg. 8 theme blocks: --acc-ease each.
- [data-acc] body transition -> var(--acc-ease, ...).
- .fm-children max-height easing -> var(--ease-smooth).
- .sh-idxpanel / .sh-filtpanel / .fm-filter max-height easing -> --ease-settle.
- New W5 CSS block after .pm-acc-inner (keyframes, classes, header hover:
  .sh-head[data-collapse] tint 11%->17% cat + chevron translateX(1px) nudge,
  .sh-wt-h accent tint 8% + .chev nudge, open states compose the rotation).
- Both reduced kill blocks extended (pm-kid-in children -> animation none +
  opacity 1 + transform none; chev classes -> animation none).
- JS: pmCascadeKids/pmChev/pmAccBody/pmHeadChev; hooks in accToggle,
  collapseAllTb pane branch, collapseAnim.animate (chevron both ways + kid
  cascade on open only, per level), wireSearch idx/filter toggles (idx
  cascades the .sh-body kv rows, 180deg banner chevron), fm filterToggle.open.
- Untouched: wireAccordion click/keyboard semantics, collapseAnim
  measurement/interrupt core, body class names, 268px/140px disclosure caps.

## Re-pin + gates
- New BASE_SHA: 847b9c72ea415e375f87a4667f174f0e07d23b9d02a6d80a206b7115e5d71a16
- python3 Concepts/pm7-tools/build_pm7.py --out Concepts/PMConcept7.html
  --outdir <scratch>: brace_balance PASS, css_vars_defined PASS,
  js_node_check PASS, no_emoji PASS.
- Grep built PMConcept7.html: pmKidIn 4, chevOpen 4, chevClose 4, acc-ease 11,
  pmCascadeKids 10, pmChev 9, pm-chev-deg 7.

## Browser smoke (built file, port 8797; screenshots + smoke-results.json here)
- panel-files, 3 themes: 11 folders; every fresh open cascades kids (pmKidIn)
  + chevron chevOpen (8 fresh opens per theme — 3 start open via
  revealActive); expand-all/collapse-all via #fmCollapseAll works, contained
  everywhere; nested expand mid-parent-flight contained=true (parentH 144 >
  nestedH 48); #fmFilterToggle cascades the filter row, typing "recipes"
  filters (33 hidden, "1 match").
- panel-source, 3 themes: all 28 accordions toggle (6 change rows, worktrees,
  6 history, branch, stash); inner blocks cascade; chevrons overshoot;
  bodyAnimEasing confirmed per theme (see prototype finding re: overshoot
  clamp — velocity profile is the measurable differentiator).
- panel-search: #shIdxToggle opens with settle + kv/button cascade + 180deg
  chevron; Rebuild index machine intact (building 42% -> ok); #shFilterToggle
  cascades glob inputs + chevron.
- panel-docker 38 accs exercised (9 cascades), panel-git 11 (7), panel-testing
  13 (13), panel-agents 11 (11), panel-artifacts 16 (15, sh-r1 cards). All
  panels >= 2 accordions with live cascade. (Accordion bodies inside hidden
  panes legitimately run no animation — display:none subtrees; verified they
  cascade once their pane is visible.)
- Rapid spam x9 on one accordion: interrupt-safe, settled to last state
  (finalOpen false, height settled).
- prefers-reduced-motion: tree + accordion toggle snap with correct end
  states, 0 running animations anywhere in the slot, no pm-kid-in classes
  applied under reduce.
- Console: zero errors (not even the favicon 404 baseline).
- W4 double-fire check: opened-body children report animationName pmKidIn
  only — the [data-acc].open .pm-kid-in > * rule outranks the pane-row
  shPaneInDir rule; no element runs both.

## Deviations
- None from the brief. One naming note: fmKidIn generalized to pmKidIn as
  directed; chevOpen/chevClose parameterized via --pm-chev-deg so the 180deg
  banner chevron reuses the same keyframes (102deg/-8deg at the 90deg default).
