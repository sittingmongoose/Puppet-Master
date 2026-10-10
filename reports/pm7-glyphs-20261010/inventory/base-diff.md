# W2b base-diff: PM7-base.html vs TestPMConcept.html (the real build base)

`B` = `Concepts/pm7-tools/base/PM7-base.html` (59,958 lines),
`T` = `Concepts/Onboarding concepts/TestPMConcept.html` (84,501 lines).
Worktree at `88ae42bbdc`, both files clean. Method: per-row exact stripped-line
match inside the table's Test region (anchor search on miss), plus glyph-count
parity per table and full-statement compare for multi-line vars.

## 1. Icon tables: all 9 same (213/213 rows byte-identical)

| table | rows | base rows | Test rows | verdict |
|---|---|---|---|---|
| T-core (PM_ICONS/w) | 43 | B:34284-34327 | T:55968-56011 | same (43 `w(` lines both; `w` wrapper identical) |
| T-bridge (add/s) | 75 | B:57406-57488 | T:79643-79725 | same (72 `s(` lines + alias line `add.tsx=...` identical; fill-missing merge identical) |
| T-term (iconSvg) | 21 | B:28400-28421 | T:34342-34363 | same (20 kinds + default tail) |
| T-term-split | 2 | B:28426,28428 | T:34368,34370 | same |
| T-term-wg | 1 | B:28433-28436 | T:34374-34377 | same (4-line statement) |
| T-single | 10 | B:27476-27478,41374,45065,45868,53839,59492-59494 | T:32671-32673,63314,67125,67873,76040,81788-81790 | same (full statements incl. GRIP_SVG concat) |
| T-aliasmap RUN_ICONS | 6 | B:53422-53423 | T:75623-75624 | same content (see erratum E1) |
| T-aliasmap PAGE_ICONS | 6 | B:57071-57076 | T:79279-79284 | same |
| T-aliasmap GLYPHS | 5 | B:48317 | T:70481 | same |
| T-chat (var SVG) | 27 | B:53595-53621 | T:75796-75822 | same (27 entries both) |
| T-usage-base (var SVG) | 17 | B:26464-26480 | T:30910-30926 | same (17 entries both) |

No icon-table row is changed or absent. Glyph counts match per table, so Test
adds no extra glyphs to any of these tables either.

## 2. Status vocabs: 17 same (92 rows), 1 absent (6 rows)

Same (base range -> Test range, every row byte-identical): V-proj
B:2662-12290 -> T:2660-12647; V-health B:6100-6102 -> T:6098-6100; V-sa
B:7437-7443 -> T:7435-7441; V-wizschip B:12889-12898 -> T:13246-13255;
V-wiztstate B:12915-12919 -> T:13272-13276; V-orchbadge B:13995-50258 ->
T:14352-72422 (CSS + JS halves); V-deadcss B:3180-3199 -> T:3178-3197;
V-notify B:16371-16374 -> T:16728-16731; V-dashdot B:11179-11182 ->
T:11500-11503; V-statusbar B:26151-26163 -> T:29896-29908; V-toast
B:34864-34880 -> T:56548-56564; V-wt B:52250,52722 -> T:74445,74917;
V-opstate B:53366-53368 -> T:75567-75569; V-thread B:53722-53726 ->
T:75923-75927; V-orchfresh B:50264 -> T:72428; V-wizpill B:48784-48790 ->
T:70948-70954 (see E2); V-gitfile B:58363-58368 -> T:80610-80615.

Absent: **V-s4** (all 6 rows, B:33622-33630). `badgeHtml`/`pillHtml`
(`s4-badge`, `s4-pill`, `pillHtml`: 0 hits in T) and its
`PM_ICONS.restart/scales/sparkle` use-sites are gone with the old settings
renderer. The T-core glyphs themselves still exist (T-core same, above), and
`needs-setup` survives only in the dead-CSS rule (V-deadcss, T:3179).

## 3. New in TestPMConcept.html (not in PM7-base.html)

Icon tables / maps (rows in `icon-tables-b.csv`):
- T-engine `iconPaths` map, 60 keys, T:41940-42001 (keys T:41941-42000) +
  `icon(name, cls)` helper T:42003-42006 (fallback `iconPaths.settings`).
- T-aliasmap `PANEL_ICONS`, 25 entries, T:47544 (panel id -> iconPaths key).
- T-aliasmap `DOMAIN_ICONS`, 9 entries, T:47545 (domain id -> iconPaths key).
- T-aliasmap `PRIMARY_ICONS`, 9 entries, T:50785 (MCP button label -> iconPaths key).
- T-aliasmap `ROUTE_KINDS`, 5 entries, T:53816-53822 (route kind -> icon + canonical).
- T-obfall `fallbackIcons`, 4 keys (close/checkCircle/helpCircle/chevron),
  T:82423 + `sharedIcon(name)` T:82424 (prefers `window.PM_ICONS`, else
  fallback, else text "Icon"; hydrates `[data-pm7-shared-icon]`).

Status vocabs (rows in `status-vocab-b.csv`, 15 vocabs / 78 rows):
- V-engstatus `statusClass` T:42020-42027 + `renderStatus` T:42029-42031.
- V-pltone `TONE_BY_WORD` T:47127-47133 + `PM51.tone/status/pill/dot`
  T:47138-47145; dot CSS T:8259-8263, token CSS T:25329-25335.
- V-plabel `PLAIN_STATUS` T:47134-47136 + `PM51.plain` T:47137.
- V-route `ROUTE_STATUS` T:53806-53815 + `routeLabel` override T:53874.
- V-rold `OLD_ROUTE_STATUS` T:53825.
- V-destst T:48461, V-provst T:49055, V-lsppill + V-mcptone T:50164-50165,
  V-plugst T:50618, V-mcpst T:50783, V-profstad T:51668, V-groupill T:52646,
  V-repost T:52941, V-pathst T:54810-54811.

No new sprites (`<symbol>`: 0 in both files), no new CSS-mask icons (every
Test `mask:` line matches a base line), no new inline-svg clusters. Of the
5 Test `<svg` lines without a base match, 1 is the `icon()` wrapper (T:42005,
part of T-engine), 1 is QR-generator output (T:54173, excluded like round 1
excluded QR/identicon generators; `qrSvg` T:54164-54173), 1 is the
`fallbackIcons` map (T:82423, tabled above), and 2 are activity-bar icons
(T:25908/T:25911) whose div attributes changed (hover attrs, `gh-actions` ->
`repository_automation`) while the svg bodies are byte-identical to
B:22217/B:22220 (documented in `inline-svgs-b.csv`, no new svg).

## 4. Round-1 citation errata found while diffing (content unaffected)

- E1: T-aliasmap RUN_ICONS rows cite B:53427-53428; the map is at B:53422-53423
  (off by 5; verified against git-clean `88ae42bbdc`). Content same as T:75623-75624.
- E2: V-wizpill rows cite B:48784/48786/48788/48790 but the statepill branches
  are at B:48787-48790 (cites point 1-3 lines early); regions byte-identical.
- E3: V-wiztstate `impacted` cites the blank line B:12917 (true selector is the
  `review-impact` rule at B:12914); same blank line exists at T:13274.

## 5. Notes (not tables/vocabs, for the lead)

- B:33022 `const PM_ICONS = window.PM_ICONS || {};` (pm6SettingsBoot alias)
  has no Test counterpart: the old settings renderer was replaced by the
  engine. Not an icon table; listed so nobody hunts it.
- `PM51.chip` (T:47202) and `PM51.tag` (T:47144) are generic renderers, not
  state mappings; `primaryFor` (T:50784) maps to button labels, not statuses.
  None tabled.
- One nearby non-icon diff observed while verifying T-single: the usage-card
  body call after B:27478 reads `item.render(layout)` vs `renderWidgetBody(`
  at the corresponding Test spot. Outside census scope; not pursued.
