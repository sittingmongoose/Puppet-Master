# FINDINGS — fable Settings bakeoff

Required written findings: major information-architecture choices per concept, what each deliberately explores differently, inventory/Plans conflicts found, functionality that remains simulated, and Slint translation risks. This document records observations only. **It contains no ranking and no recommendation** (packet rule; the user may ask later).

Updated for the **final cumulative packet pass (2026-08-08)**, which reassigned the manager families and roughly doubled the built surface area.

## 0. Final cumulative pass — family reassignment map

The packet's four-group assignment was adopted literally. Managers that previously lived in the "wrong" concept were re-authored in the destination's idiom from shared data and semantics (never from the sibling's markup, per the contract's differentiation clause); the source concept keeps an honest cross-concept receipt.

| Family | Was (2026-08-05 pass) | Now | Note |
|---|---|---|---|
| Context & Instructions | c4 Ledger | **c1 Atlas** (Appendix E) | re-authored as document plates |
| Personas | c3 Focus Stack | **c1 Atlas** (Appendix F) | capsule preview moved into marginalia |
| Crew | c2 Mission Control | **c1 Atlas** (Appendix H) | roster/topology tables |
| Permissions & FileSafe, Goal & Automation, Back Seat Driver | — (rows only) | **c1 Atlas** (Appendices I, G, J) | new builds |
| Notifications & Sounds, Sound Library/packs, Appearance, Desktop/Tray, Teacher | — | **c2 Mission Control** | new consoles; Spellcheck rows upgraded to a console |
| MCP | c1 Atlas (Appendix C) | **c3 Focus Stack** | re-authored as sheet stacks; c1 keeps a numbered stub |
| LSP | c1 Atlas (Appendix D) | **c3 Focus Stack** | same |
| Commands & Shortcuts, Skills/Plugins/Tools | c4 Ledger | **c3 Focus Stack** | three distinct stacks sharing lifecycle grammar |
| File Manager, Formatters, Testing & Debug | — | **c3 Focus Stack** | new builds |
| All twelve data-lifecycle families (Storage → Server module shell) | — | **c4 Ledger** | new builds in the record+inspector grammar |
| Media routes | c2 Mission Control | c2 (kept) | beyond assignment, marked in manager-coverage.json |

The provider manager was upgraded identically in all four concepts (installations with the ten-state update lifecycle, auth boundaries, explicit official-source install offers, OpenCode external server, Free Models six states with catalog freshness, requested/effective routes) through the new DOM-free `_shared/pm-provider.js` resolver, so product behavior is shared while composition stays per-concept.

## 1. Major information-architecture choices per concept

### c1 — fable · Atlas ("Settings as a reference manual")

- The humanized taxonomy is the organizing hero, and the editorial devices are structure, not skin: every domain is a numbered section ("3.2 Accounts & keys"), a sticky running header names the current location, and each row's status/chips/flags/scope are typeset as **marginalia in a dedicated hairline-separated margin column** rather than trailing chips.
- Home is a full-width search bar over a grouped directory (Parts I-IV plus an Appendices group). Typing morphs the directory **in place** into grouped results under the same persistent part headers — search is the directory, never an overlay.
- The Workspace keeps a persistent leader-dot TOC tree; the loaded section expands its subcategory list with a sliding ink dot in the right page-number gutter (deliberately not a left selection bar); other sections collapse to compact icon+count statuses. **Editing is inline in the document rows.**
- Managers are **appendices in the same book**: Appendix A Providers & models (full 15-state matrix), Appendix B Memory (gists, evidence, review, pin, versions, recall dynamics), Appendix C Connected servers (MCP). They are reached from the tree's distinct Appendices chapter and from inline "See Appendix A" cross-references in the document.
- Motion "Typesetting": content composes once in reading order (heading, rule, prologue, rows) with 40ms steps capped at 8; reduced motion collapses to a simultaneous instant state; the calm scenario renders with zero animated nodes.

### c2 — fable · Mission Control ("Settings as an operational console")

- System state organizes everything: a **persistent global health strip** (provider readiness, worst usage pressure, notice counts — each chip a live navigation target that morphs glyph+label together on change) sits above Home, Workspace, and every manager.
- Home leads with a strictly ranked vertical triage stack (Needs attention elevated, Continue setup neutral, Recommended dashed/quiet), then recents, then rectangular station cards — three Console cards ranked above eleven domain stations, each with purpose line, live health summary, and an explicit Open affordance.
- Search is a docked command bar (Ctrl/Cmd-K) opening a keyboard-first palette overlay with owner-category breadcrumbs and exposure labels.
- The Workspace inverts the usual hierarchy: the **right-edge proportional minimap is the primary navigation** — section blocks built purely from the scrollspy's section registry (never ad-hoc DOM geometry), heat-marked by row semantics, with a draggable role=slider viewport window — while the left station rail is secondary.
- **Managers are the primary surfaces** and plain settings hang off them in Configure drawers. The three consoles share one grammar (toolbar + inventory + detail inspector): Providers (full 15-state matrix, explicit "Signed in is not the same as ready" two-step status), Crew (requested 5 vs effective 2 concurrency with queued waves and the operational wave warning), Media (native vs PM-transformed routes, fallbacks, history).
- Motion "Instrumental": one-shot state-driven morphs, region-scoped refresh shimmer over last-known-good rows, minimap glide; the calm scenario verified to run zero animations.

### c3 — fable · Focus Stack ("Settings as layered attention")

- Exactly one surface is live at a time; a left-edge **layer spine** (vertical stacked labels, Home > Category > Manager/Sheet, plus a depth counter) makes the stack visible and poppable.
- Home is nearly empty: a dominant hero search, one collapsed notice-queue row that expands as its own sheet, and oversized typographic destination plates whose footnotes carry status and a "Resume at 4.2 Approvals" affordance. Search results replace the plates in the same stack.
- Hard rule explored: **disclosure is navigation, never in-place expansion** — advanced settings, row details, text editing, expert confirmations, capability evidence, requested-vs-effective explanations, and free-route setup each push a (half-)sheet onto the spine.
- No sidebar: a sticky "you are here" outline chip crossfades with scrollspy and expands into a full outline overlay for jumps, sideways category swaps, and pop-to-home.
- Managers stress depth as meaning: Personas descend definition > runtime/scope > compact capsule as three progressively deeper, smaller sheets; Terminal pairs list > detail with a live ANSI/font/cursor preview updated by edits immediately.
- Motion "Spatial continuity" (origin-anchored slide+scale on push/pop, dimmed opaque layers beneath); reduced motion is designed first-class: instant swaps, step-changed spine highlight, breadcrumb in the status bar. In glass themes only the topmost sheet carries backdrop blur. Deliberately the lowest-density concept.

### c4 — fable · Ledger ("Settings as an object browser")

- Every setting, notice, provider, account, model, free route, role, context source, tool, skill, and plugin is a **read-only record** in a continuous middle document; **all editing happens in a persistent right inspector** showing the full control, a default > global > project > thread provenance chain, requested-vs-effective diffs, capability evidence with source+timestamp, scope notes, reset-to-default, and caution+confirm gating for expert records (the risk note persists after unlock).
- The left navigator is a **query engine**: a query bar that never disappears across Home/Workspace/Managers, plus four state chips (Managed / Differs from default / Unavailable / Attention). Typing dims non-matches in both navigator and document without reflowing mid-scroll; a "Matches elsewhere" panel deep-links across views.
- Home is a compact ranked notices ledger, recents, a destination index, and a genuinely sortable/filterable 133-row settings table paged in lazy chunks.
- Managers (Context & Instructions with admitted/omitted-last-turn provenance and the AGENTS.md precedence chain; Skills/Plugins/Tools with the installed > project-enabled > available > selected > invoked funnel and risk/approval columns) reuse the identical record/inspector grammar as the provider manager.
- Motion "Instantaneous": the CSS declares zero animations and zero transitions; the scrollspy marker steps discretely; controlled jumps are forced instant. Reduced-motion mode is literally identical — the concept doubles as proof the design system works motionless. Highest density, most expert-feeling of the four.

## 2. What each concept deliberately explores differently

| Axis | c1 Atlas | c2 Mission Control | c3 Focus Stack | c4 Ledger |
|---|---|---|---|---|
| Organizing principle | Taxonomy as edited reference | Live system state | Layered attention, one surface at a time | Metadata and provenance per record |
| Home | Directory of places under part headers | Ranked triage stack + station cards + health strip | Near-empty: hero search + plates + one queue row | Notices ledger + sortable settings table + index |
| Search embodiment | In-place directory morph, no overlay | Ctrl/Cmd-K palette overlay | Hero field; results replace plates in-stack | Persistent query bar + state chips, dims non-matches |
| Workspace navigation | Leader-dot TOC tree + running header + ink dot | Proportional minimap primary, station rail secondary | Sticky outline chip + expandable overlay, layer spine | Navigator column with position marker + query filtering |
| Manager relation | Appendices of the same book, inline cross-references | Managers are the primary consoles; settings hang off them | Deeper spine layers; depth carries meaning | Same record classes in the same ledger |
| Editing model | Inline in the document rows | Inspector within consoles; Configure drawers for plain settings | Every edit/disclosure is a pushed sheet | Records read-only; all editing in the persistent inspector |
| Density | Medium-high, editorial | Medium, instrument-panel | Lowest | Highest |
| Motion | "Typesetting" reading-order compose | "Instrumental" state-driven morphs + region shimmer | "Spatial continuity" push/pop; first-class reduced mode | "Instantaneous" — zero animation by design |
| Narrow behavior | Tree becomes top Contents drawer; marginalia stacks inline | Minimap folds to bottom-sheet outline; icon-only rail with focus-reachable labels | Natively narrow-safe; spine narrows, sheets go full-width | Navigator becomes overlay drawer; inspector becomes bottom detail sheet |

Manager coverage now follows the final packet's four-group assignment exactly (see §0): c1 proves the agent-policy group (Context & Instructions, Memory, Personas, Goal & Automation, Crew, Permissions & FileSafe, BSD), c2 the ambience-and-input group (Notifications & Sounds, Sound Library/uploads/packs, Appearance with custom TOML themes, Spellcheck & Dictionaries, Desktop/Tray/Window, Teacher/Help, plus Media beyond assignment), c3 the developer-tooling group (File Manager, Terminal, LSP, Formatters, Commands & Shortcuts, MCP, Skills, Plugins, Tools, Testing & Debug), and c4 the data-lifecycle group (Storage & Retention, Backup & Restore, Settings Lifecycle, History & Sessions, Runtime Artifacts, Source Control/Worktrees, GitHub Actions, Containers & Registries, Web/Search/Fetch, Search Index, Workspace Cleanup, and the reserved Server module shell with nine named-owner insertion destinations). Every concept also proves the shared core group. Families a concept does not own surface in its search and stubs as honest cross-concept receipts with working links; the machine-readable proof lives in each concept folder's `manager-coverage.json`. `CONTRACT.md` (revision 2) remains the binding shared-layer specification.

## 3. Inventory / Plans conflicts found

Recorded here and mirrored with uncertainty grades in `IMPACT_REGISTER.json`. Nothing outside the model folder was changed.

1. **Canonical 12x3 taxonomy vs the packet's 11-domain reorganization.** `Plans/settings_inventory.json` (pm.settings_inventory.v1, 825 settings) and PM7's `PM_SETTINGS_DATA` use 12 categories x 3 subgroups keyed by dotted `cat.sub.slug` ids. The packet's section 01 mandates 11 humanized domains. The shared dataset keeps canonical dotted ids but regroups them: `general.visual.*` and `general.interaction.panel-dock` move to domain 2 "Appearance & Layout"; `ai.models.*` and `ai.accounts.*` to domain 3 "Agents, Models & Accounts"; `safety.*` to domain 4 "Permissions & Safety"; `memory.*` to domain 6 "Context, Memory & History"; `branching.*` to domain 8 "Git, Worktrees & Crew"; `web.*` and `system.mcp.*` to domain 9 "Connections, Tools & Web". Setting ids never changed — only grouping — but canon has no representation for a display taxonomy distinct from the id taxonomy.
2. **Two-tier `tier: simple|advanced` vs six exposure levels.** The inventory knows only simple/advanced. The packet requires standard / advanced / expert / managed / diagnostic / unavailable, and the shared dataset assigns all six (86/37/2/3/3/2 across the 133 demo settings). Expert additionally implies a caution+confirm interaction; managed implies a lock+reason; unavailable implies visible-but-inert+reason. Canon schema needs an exposure field (or a mapping rule) before any concept can be promoted.
3. **No value-source or requested-vs-effective model in canon.** The inventory's `status{state,note}` cannot express the packet's nine value states. The dataset adds `valueSource: default|custom|inherited|auto|managed|recommended|not-configured` plus a separate `effective` value (requested-vs-effective difference, e.g. Opus 4.1 requested but running as Sonnet 4.5 on Team, and `planning.goal.concurrency-ceiling` configured 8 vs `planning.goal.sustainable-now` 2). All four concepts render from these fields via the single shared resolver.
4. **Banned copy inside inventory-derived text (fixed locally; canon conflict remains).** `Plans/settings_inventory.json` contains five occurrences of "YOLO" in access-mode copy (e.g. "YOLO mode cannot skip this." on the always-ask-before-publish setting, and "YOLO skips approval prompts…" on the chat access mode) — violating the packet's access-mode naming rule (modes are Full Access / Auto / Auto accept edits / Ask for approval; "Yolo" must never appear). One sentence propagated into `_shared/pm-demo-data.js` during extraction; it has been corrected in the demo data ("No access mode can skip this."), and c2 additionally carries a render-time sanitizer as defense-in-depth. The canonical inventory still carries the stale copy — recorded here and in the impact register, not applied.
5. **`ai.usage.monthly-spend-limit` vs "never a universal budget setting".** The inventory carries a global monthly spend limit; the packet forbids a universal "when budget runs out" control and requires provider-specific "what happens next" options instead. The concepts keep the setting as an advanced spend guard (it is also the standard search deep-link test target) while exhaustion behavior lives per-provider in the manager (`whatNext` lists only provider-supported options). Whether the global limit survives, becomes derived, or is retired is a canon decision.
6. **29 packet-required settings have no inventory ids.** The dataset marks them `src: "packet-2026-08-05"` (110 rows carry `src: "inventory"`): the full spellcheck block (`general.spellcheck.*`, 9 rows), the thread-scoped override rows (`ai.models.thread-model-override`, `ai.accounts.thread-account-override`, `ai.models.thread-effort-override`, `ai.models.thread-speed-override`, `safety.rules.thread-access-override`, `branching.crew.thread-crew-override`, `memory.assembly.thread-context-override`), the access-mode radio (`safety.rules.access-mode`), the cross-project policy block (`safety.crossproject.read-access/write-access/grant-duration/child-inheritance`, off by default, read and write separate), the concurrency pair (`planning.goal.concurrency-ceiling` + read-only `planning.goal.sustainable-now`), and six added during the compliance audit — `planning.goal.reserve-policy`, `branching.worktrees.provisioning`, `branching.worktrees.port-collision`, `memory.assembly.parent-handoff`, `memory.assembly.warn-route-change`, and `general.writing.grammar-assist` (the packet's separate, off-by-default, provider-disclosed grammar/style boundary). These need minted canonical ids before promotion.
7. **"No clipped text" vs editorial truncation (resolved).** Both formerly-flagged cases were fixed: c3's row descriptions no longer clamp at two lines (they wrap fully; the details sheet still carries extended facts), and c4's record-row value chips now wrap paragraph-length values instead of ellipsizing (max-width retained so chips stay chip-shaped; the inspector remains the editing surface). The only remaining truncations are single-line ellipses on *descriptions/labels* (index blurbs, recents strip below the 760px floor) and c3's two-line sheet-title clamp, none of which cut a required label, value, action, or status at supported widths (verified by the theme-by-width clip sweeps).
8. **Single blur layer in glass themes (resolved).** The shell title bar (from `_shared/pm-shell.css`) carries the one allowed backdrop-filter on c1/c2/c4/index. On c3, the topmost sheet carries it instead and c3's stylesheet makes the shell titlebar yield (`backdrop-filter: none` under glass) — so every page renders exactly one blur layer. Slint equivalent for lower layers stays pre-composited opaque surfaces.
9. **Diagnostic drawer placement ambiguity.** The packet allows a per-domain diagnostics drawer; c2 renders diagnostics per-subcategory, c1/c4 per-domain. Both readings satisfy the contract text; a promoted design should pick one.
10. **Shared trigger API gap (resolved this pass, lesson recorded).** The trigger registry now spans installations, settings lifecycle, sounds/notifications, appearance, storage/index/cleanup, tooling, permissions, and Teacher; `reconnect` resolves MCP server ids ahead of the first-provider fallback. The lesson stands for canon: production commands need typed, owner-scoped payloads — id-precedence heuristics are a demo convenience, not a wiring contract.
11. **Inventory census discrepancy (new).** Counts disagree across artifacts: 817 (PM7 build assertion), 818/819 (PM6 sidecar / PM7 embedded payload), 824 (F3-441 PlanUnit text), 826 (`Plans/settings_inventory.json` itself). The rows this pass adds (sounds, desktop/tray, BSD mode, storage/backup/lifecycle, formatters, web limits, MCP transport preference — all `src:"packet-2026-08-08"`) exist in no canon count. The implementation census must reconcile the number before minting ids.
12. **Navigation-command overlap (new).** Canon carries point commands `cmd.settings.open_notifications` and `cmd.settings.open_storage_retention` alongside the packet's `cmd.settings.navigate` candidate family. Every per-concept command delta flags these as supersede-into-family (aliases), and `cmd.settings.category.reset` as a merge candidate against `cmd.settings.reset.apply {scope: category}`; `cmd.theme.*` is flagged reuse-before-mint against the appearance candidates. `cmd.settings.bloom.open` is flagged retire-with-compatibility-alias in all four deltas.
13. **Notification surface consolidation (confirmed by construction).** The title-bar stack + sprout inbox in the shared shell is the only in-app notification affordance in the entire folder — destination test-sends land there, and no corner stack, status-bar bell, or notifications side panel exists to retire.

## 4. Functionality that remains simulated

Everything below returns an honest, visibly labeled simulated receipt (`PMState.receipt`) or a staged local state transition — never a silent no-op:

- **Auth and installation:** provider connect, CLI installs (e.g. Cursor CLI), CLI sign-ins, PM-direct OAuth flows — described, never executed.
- **Free-route setup:** the stepped account > credential > verify flow advances with receipts; no key is ever really stored; readiness checks are informational.
- **Billing and usage:** the Usage page deep link, "what happens next" choice application (choice persists in the demo UI + receipt), account "Use next" switches (explicitly future-simulated-requests-only).
- **Catalog and invocation:** provider refresh, catalog refresh over last-known-good, reconnect, and invocation tests are staged async simulations in the demo store.
- **Collection editors and actions:** list/keyvalue/multiselect "Manage"/"Edit" editors and action-type settings return receipts.
- **Manager actions:** create Crew template, new persona, new terminal profile, add media route, run test generation, MCP connect, plugin Update/Retry, role qualified-override requests, memory version restore (single-version demo gists), log viewers. Real local demo-state mutations do exist where honest: gist pin/verify, plugin enable/disable, account rename/enable/priority, model favorite/alias/hide, effort/speed choices.
- **Spellcheck:** dictionary additions persist only to the namespaced localStorage; the per-thread disable is a shell overflow receipt. Suggestions never auto-replace.
- **Cross-concept manager deep-links:** managers not built in a given concept return honest receipts naming the sibling concept that builds them — now systematic in all four via `PMState.registerManagers`.
- **Scenario switching** rebuilds the working data from pristine, discarding in-session edits (inherent to `PMState.applyScenario`); fixture overlays re-apply automatically after every rebuild.
- **New in this pass, all honestly simulated:** installation update/verify/rollback/repair walk truthful staged phases in the demo store; the explicit Cursor CLI install offer ends in a receipt (nothing downloads); sound preview is local-only with deliberately no receipt, while destination test-sends are masked, rate-limited, and receipted into the title-bar stack; pack import runs real license/format gates against fixture packs; TOML theme reload re-validates fixture files; the settings-import chain (preview → conflicts → restore point → atomic apply → rollback) mutates only the demo store with receipts in both directions; backup-now/test-restore/index-rebuild/cleanup-dry-run are staged phase simulations; permission rule tests emit the last-match-wins trace from fixture rules; Teacher overlays highlight real elements and can hand off into real (still demo-scoped) flows.

## 5. Slint translation risks

Target: Slint 1.17.1, cross-platform. Shared risks first, then per-concept.

### Shared foundation

- **Scrollspy offset mapping:** `PMSpy` already implements the portable model — cached section offsets `{id, offset, height}` recomputed on relayout, active = last section whose offset is within 28% of viewport with deadband hysteresis, programmatic-scroll suppression. Slint: the same registry drives `Flickable.viewport-y`; ResizeObserver becomes relayout notifications (note: the web ResizeObserver does not fire in hidden tabs — a test-environment artifact, not a design dependency).
- **Single-layer glass rule:** the shell's one backdrop-filter maps to pre-composited translucency or opaque elevated surfaces in Slint; concepts that add none (c1, c2, c4) are already conformant.
- **Windowed lists:** nothing eagerly instantiates hundreds of rows — the largest single domain document is 18 rows, manager inventories top out around 16, search results are capped, and c4's 133-row home table pages explicitly (40 rows first, +60 per "Show more"). The web demo therefore needs no virtualization; production Slint should still use `ListView` over a section model for the full 825-setting inventory.
- **Spellcheck service abstraction:** `contenteditable` + DOM-range underline spans + context menu must become a spelling-service decoration layer over `TextEdit` with a popup menu service; the demo module is already isolated behind `PMSpell.attach`.
- **color-mix() tints** used for cautions/diffs/dims across concepts become precomputed per-theme rgba brush tokens.
- **Inline SVG icon strings** become path/image primitives from a shared icon table.

### New surfaces (this pass)

- **Routing matrix (c2)** and **testing matrix (c3)**: bounded grids of select cells — GridLayout over models; each stays under ~90 cells, no virtualization needed in the demo, `ListView` recommended at production scale.
- **Reorderable lists** (c1 permission rules, c2 Activity Bar order): move-up/move-down buttons mutating a model — deliberately not HTML drag-and-drop, so the Slint port is trivial.
- **Key recorder (c3)**: keydown capture with live conflict check → `FocusScope` key handling.
- **Theme hover-preview (c2)**: temporary `data-theme` attribute swap on the root — in Slint a preview theme property that rebinds token brushes; keyboard focus drives the same path as hover.
- **Import preview diff records (c4)** and **evaluation trace (c1)**: pure model-driven lists; no DOM measurement anywhere.
- **Hash router (shared)**: maps to a navigation intent bus; `pushState/replaceState` history becomes the app's own back-stack. The `data-pm-state="ready"` handshake maps to a test-hook signal after initial navigation settles.

### c1 Atlas

- `position: sticky` running header inside the scroller: fixed header row above a Flickable bound to viewport offset.
- CSS-grid row/marginalia and account/model layouts: GridLayout row templates with a fixed margin column.
- Typesetting stagger (`animation-delay: calc(var(--set-i) * 40ms)`, capped at 8): per-row sequenced opacity animations keyed by index; reduced motion = single fade.
- Smooth scrollTo + cached-offset scrollspy: animated `contentY` + the shared section-offset table.
- Narrow Contents drawer as absolute overlay + scrim: conditional layout swap plus popup layer keyed on a width property.
- `:empty::before` prose placeholders: `TextEdit` placeholder property.

### c2 Mission Control

- Minimap: absolutely positioned proportional blocks + draggable role=slider window derived from the PMSpy registry — in Slint a model-driven Rectangle column with y/height bindings against `Flickable.viewport-y`; drag writes viewport-y directly. No DOM geometry reads exist to port.
- Refresh shimmer (gradient-sweep keyframes on the refreshing region only): static "Refreshing — showing last known good" badge (already the reduced-motion end state) or a Timer-driven opacity pulse.
- Command palette and bottom-sheet outline (fixed-position overlays): PopupWindow/overlay layer with an explicit focus scope.
- `scrollIntoView({block:'center'})` for row focus after a section jump: compute row offset from the cached section model and animate viewport-y.
- The inline content-blocker fallback loader (XHR + eval when a blocklist cancels a css/js request) is a web-only defensive shim, not portable and not needed in Slint.

### c3 Focus Stack

- Topmost-sheet backdrop blur in glass themes: pre-composited translucency or opaque fallback; lower layers are already opaque dimmed rectangles by design.
- `writing-mode: vertical-rl` spine labels: rotated Text elements inside TouchAreas.
- Sheet push/pop transform/opacity transitions: x/scale/opacity property animations; reduced motion collapses to instant swaps via the global switch (same end states).
- `-webkit-line-clamp` elision: max-lines text elision.
- `element.inert` on non-top layers: input disabled on lower layers in the component tree.
- Smooth scroll + scrollend/idle settle detection: Flickable animated viewport-y with an explicit settle callback.
- Terminal live preview via styled spans: a fixed sample buffer rendered by the real terminal component.

### c4 Ledger

- Three-region grid + narrow overlay drawer/bottom detail sheet: HorizontalLayout of three panels with conditional popup layers.
- `position: sticky` home-table headers: header row rendered outside the ListView viewport.
- `withInstantMotion` (temporarily forcing reduced motion so PMSpy scrolls instantly) is a web-only trick; Slint sets viewport-y directly, no hack needed.
- Sorted/filtered/paged table: ListView over a sorted+filtered model with incremental paging (already modeled as explicit 40-row pages growing by 60).
- Because c4 declares zero animations and zero transitions, it is the lowest-risk port and doubles as the motionless proof of the design system.

## 6. Known gaps and environment caveats

- `PMSpy.reveal` settles via double requestAnimationFrame; in a hidden/throttled tab the jump defers until frames resume (test-environment artifact; verified working when visible, instant under reduced motion).
- The preview pane's content blocker intermittently cancelled requests to URLs containing "mission-control" (a mandated filename); c2 ships a same-origin fallback loader. Behavior under the real ConceptHub server is re-verified in the folder-level test pass.
- Google Fonts were blocked in the sandboxed test browser, so some visual verification ran on fallback fonts; the allowed fonts link is intact.
- c3's boot retries for up to 15s if shared modules settle late — observed only in file:// snapshot previews; served pages boot immediately.
- Expert rows re-lock on re-render, not on scroll-away (c1). Inline renames commit on Enter only; blur cancels silently (c1). Resume-at targets follow scrollspy deadband hysteresis (c3). State-chip filtering maps manager rows only approximately (c4). (c4's narrow nav-button rule now lives in its CSS file — resolved this pass.)
- Store events rebuild the open console inspector in c2; an effort/speed menu open at that exact moment closes (state preserved, focus not).
- Deep links into non-native managers land on Home with an honest receipt naming the covering concept; the clickable cross-page links live in search results, stubs, and receipt panels rather than auto-redirecting (deliberate: a URL never silently navigates to a different page).
- The `reconnect` trigger's MCP-vs-provider precedence is id-based; two fixtures sharing an id across families would confuse it (none do).
- The exhaustive theme/cross-product pass (TEST_REPORT §3c) caught two defects the sampled sweeps missed, both fixed: the glass-light "Recommended" status word rendered at 1.84:1 contrast (shared-shell tone override added), and c3's sheet titles clipped in the squeezed state — a 900px shell with the Assistant panel open squeezes the sheet below what `is-narrow`'s shell-width trigger sees (`overflow-wrap: anywhere` added inside the two-line clamp). Lesson for canon: squeeze detection should key on the content pane's width, not the window's — recorded for the Slint port, where a container-width binding is the natural expression.

Width sampling beyond the build-time checks (full 760-2500 sweep across rail/panel combos, all-theme passes, and the functional smoke matrix) belongs to `TEST_REPORT.md`, which is written by the verification pass from real results.

No ranking or recommendation is offered in this document.

## 7. Dependency-correction pass (2026-08-13)

The omitted performance decision register was reviewed in full against the built work. Verdict:
the omission was material in a narrow way — it exposed fake-progress semantics (index-rebuild
percentages), whole-stack re-rendering in c3, one startup-scan description, and missing
progress-kind/source/wait-reason semantics on operation events, all now corrected and probed —
but it did not change manager coverage, fixtures, themes, provider policy, or the deterministic
test surface, each of which was re-verified with exact evidence rather than assumed. The honest
ledger of which packet references the build pass actually opened (including that
`PERFORMANCE_SETTINGS_RETURN.md` was only skimmed by headings and
`PM_CROSS_SYSTEM_COMPLETENESS_AUDIT.md` was never opened) is in `reference-review-report.json`.
Register §23's calibration gates (825+-row search, 100-installation collapse, old-hardware and
poor-network operation) are recorded in every impact register as implementation benchmarks the
demo does not claim to meet.
