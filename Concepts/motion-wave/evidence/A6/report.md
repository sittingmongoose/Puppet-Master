# A6 — W6 Menus & popovers

## Prototype (protos/menus.html, port 8798, killed)
Reproduced tb-sprout / fm-ctx / trigger+chevron / 2 submenus. Key finding:
Chrome SNAPS the display:none -> block entry of the reference tb-menu pattern
(no transition across the display flip; mid-flight transform was identity).
Fix: top-level `@starting-style` blocks define the entry start style for
`.pm6-tb-menu.is-open`, `.fm-ctx.is-open`, `.fm-ctx-wrap.open > .fm-ctx-sub`.
After that: overshoot bezier active mid-flight (scale > 1 sampled), click-point
origin exact, item cascade 0/12/24/36ms, submenu flyout from 0% 0% with
overshoot, .is-closing exit, chevron settle, reduced snaps, Escape closes,
rapid open/close/open clean, console zero.

## fm-ctx display/visibility dance (as implemented)
`.fm-ctx` base: display:none + local sprout knobs (--pm6-sprout-tx 0px / ty
-6px / sx .78 / sy .52) + transform-origin var(--pm6-sprout-ox/oy) + opacity 0
+ scaled transform + visibility hidden + pointer-events none + closed
transition (opacity 160ms --ease-out, transform 300ms cubic-bezier(0.22,1.55,
0.36,1), visibility 0s linear 300ms). `.is-open`: display:block + identity +
visible + pointer-events auto + open transition (opacity 140ms, transform
300ms overshoot, visibility 0s) + @starting-style entry. `.is-closing`:
display:block + scaled + hidden + close transition (opacity 45ms ease-in
175ms, transform 220ms cubic-bezier(0.45,0.05,0.55,0.2), visibility 0s linear
220ms) — PMMenu.close()'s existing 240ms done() owns the removal, so the exit
came free once ctx joined the engine's close path (it already did via
openMenus). @keyframes fmSprout DELETED (grep-clean); submenus moved to the
same transition pattern (closed state + wrap.open open state + @starting-style,
transform-origin 0% 0% — they fly RIGHT).

## Click-origin math
PMMenu.openAt (only fm-ctx uses it): after edge-clamp/flip placement,
`--pm6-sprout-ox = max(0, x - fx) px`, `oy = max(0, y - fy) px` (was screen-half
12%/88% + 0%/100%). Shift+F10 path: openAt(rc.left+16, rc.bottom) then
override ox = rc.left - menuRect.left (negative = the 16px indent back to the
row's left edge; sampled -16px friendly / -22px glass).

## What changed (anchors in PM7-base.html)
- CSS pm6-css-chat: @starting-style entry for .pm6-tb-menu.is-open only (chat
  more-menu untouched).
- CSS cozy-shelves W6 block (after W5): @keyframes pmMenuIn + .pm-menu-in > *
  (12ms step), @keyframes pmSelPop + .pm-sel-pop, .pm-trigger-open chevD
  rotate(180deg) w/ --motion-med --ease-settle, panel-scoped tb-item
  transitions + hover/focus-visible translateX(2px) + :active scale(.98)
  (body > portaled / #sidePanelSlot / #bottomDebugHost).
- CSS cozy-shelves fm-ctx: full transition sprout system + item micro-
  interactions (hover/focus-visible/active, aria-disabled gated) + submenu
  transition flyout; reduced-motion: fm-ctx/sub transition kills, .pm-menu-in
  + .pm-sel-pop animation kills, trigger chevron transition kill (both
  @media prefers-reduced-motion and [data-reduced-motion]/[data-motion] attr
  blocks; legacy `[data-reduced-motion="1"] .fm-ctx.is-open {animation:none}`
  replaced with the transition shape).
- JS: engine open() adds .pm-trigger-open + pmMenuCascade(menu,8) (chat-more
  excluded); close() removes it + drops .pm-menu-in/.pm-sel-pop in done();
  upgradeWrap select path pops .pm-sel-pop; openAt px origin + cascade;
  pmMenuCascade helper (window-exposed, reduce()-guarded, 480ms class
  cleanup so hover transforms free up and re-open re-cascades); wireFiles
  submenus() openSub/closeSub with cap-5 cascade + cleanup; keydown origin
  override.

## Build
BASE_SHA 847b9c72... -> 50bc24d83c42950e408df24bc2231cf736773e44e8e179f11e780ea82b4fba7f
Gates: brace_balance PASS, css_vars_defined PASS, js_node_check PASS, no_emoji PASS.
Grep built PMConcept7.html: fmSprout 0 (gone), pm-trigger-open 5, pmMenuIn 4,
pm-menu-in 10, @starting-style 5, .fm-ctx.is-closing 1, pm-sel-pop 7.

## Smoke (built file, port 8798, killed; friendly-dark + glass-light)
26/26 menu exercises PASS — 13 menus x 2 themes (fmRootMenu, shScopeMenu,
shReplScopeMenu, rdCfgMenu, rdAfAdapter, rdSessMenu, rdBpMode, shBranchMenu,
shDispRefCI, shDispRefDkr, shDispPlatDkr, shCtxMenu, shArtSort), each:
mid-flight transform CSSTransition with cubic-bezier(0.22,1.55,0.36,1),
cascade delays ascending (0/12/24/36ms), chevron mid-rotate while open +
restore on close, Escape -> .is-closing sampled -> display:none, aria-expanded
round-trip. Item counts per spec (5,4,4,6,3,2,3,5,3,2,3,4,3).
- fmRootMenu pick: label updates, .pm-sel-pop fired, re-open re-cascades.
- FM ctx: folder/file/git-M rows — sprout from click point (friendly dx 0.6px
  subpixel; transAnim running), Paste enabled on folder only, "Open with..."
  submenu flies out (overshoot scale 1.014, origin 0px 0px, cascade), Copy
  path submenu items correct, item click -> is-closing -> display none,
  Shift+F10 opens at row left edge, Escape closes.
- Item hover matrix(1,0,0,1,2,0) + :active matrix(0.98) on both tb + fm items.
- Outside-click closes; rapid open/close/open -> final open, no stuck is-closing.
- rdCfgMenu "Add Configuration..." reveals #rdAddForm; #rdAddCancel hides.
- shArtSort reorder: FLIP animations on cards observed + order changed; menu
  re-opens fine after.
- Reduced: instant open (opacity 1, identity, 0 running anims, no pm-menu-in),
  chevron snaps to matrix(-1,0,0,-1), instant close (display none, no
  is-closing linger), ctx same.
- Console: zero errors vs favicon baseline.

## Deviations
1. Glass themes: `.app-shell` carries `backdrop-filter`, which makes a fixed
   containing block — fm-ctx (not portaled by design) renders +6px off the
   cursor in glass; PRE-EXISTING placement behavior, origin math shares the
   same frame as placement. Fixing = portaling ctx to body = engine rewrite
   (out of scope per do-not-touch).
2. fmRootBtn chevron: at default slot width the FM root trigger is in the
   data-wtier="min" trimmed mode where chevD is display:none (pre-existing
   product CSS) — rotation verified on the other 12 visible triggers + at-rest
   rotate under reduced via shScopeMenu.
3. Entry needed @starting-style (Chrome snaps display-flip transitions
   otherwise) — also applied to .pm6-tb-menu so the reference engine's entry
   actually animates; chat more-menu deliberately excluded.
