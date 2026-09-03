# pm7-tools -- PMConcept7 refactor pipeline

Toolchain that derives `Concepts/PMConcept7.html` from a pinned base by
scripted, assertion-guarded transforms. PMConcept7 is ALWAYS a build
artifact: it is never hand-edited, and neither is any intermediate output.
If something is wrong in the output, fix the transform (or the frozen inputs)
and rebuild.

The 2026-08-27 re-baseline froze the last non-reproducible PM7 bytes as the
pinned base. The active pipeline now has nineteen assertion-guarded transform
entries:
T33 preserves the previously approved retro drag correction; T34 contains
GUI-01..GUI-10 plus the approved GUI-X01..GUI-X04 Usage corrections; T35
closes the authorized Usage presentation residuals; T36 repairs the approved
physical-width layouts; T37 applies component-scoped contrast repairs; T38
repairs Usage and Home widget transactions plus shared vertical-chart labels;
T39 adds stable two-dimensional Usage slots and the final every-bar label
layout; T40 preserves painted peer nodes during reorder preview and repairs
directional curated resizing; T41 stabilizes magnetic handle acquisition and
narrow page-overflow hit testing; T42 restores persisted Usage slots only
after the page has visible geometry; and T43 gives Usage pointer resize a real
live target footprint with occupied-neighbor displacement and exact accepted
settlement parity. T44 replaces the embedded Settings owner with the pinned
Kimi K3 Tome Tabs geometry and a canonical Settings read model; the two T45
entries add Product Onboarding and the deterministic live-shell Guided Tour;
T46 adds owner-routed Doctor and operational system consumers, including the
fail-closed Plugins System owner projection; T46F adds the provider-neutral
Source Control, Actions & Pipelines, forge, and backup/recovery projections;
T46P adds the
bounded full-thread browser fixture; T47 installs the shared hover/focus tag
controller; and T48 refreshes the re-baselined Home workspace from its current
authored source. T38 through T43 leave the protected embedded Settings and Chat
sources unchanged. T44 through T48, including T46F, are authored transforms, not hand-edits to
the generated artifact.
Read the next section before changing anything here.

## Re-baseline — 2026-08-27 (current)

The base is `base/PM7-base.html` (not PMConcept6). It hashes to
`7bbc1932dbfbbee45bab9533a9fe41b96b13452720ea0fd29e43cbeab710d50d`
(4,100,293 bytes), which is the `BASE_SHA` pin in `build_pm7.py`. The file is
LF-only, so the raw and universal-newline-normalized hashes coincide. The
block census on this base is 43 = 22 style + 21 script.

The 2026-09-01 pin refresh removes the base's Google Fonts preconnect/preload
links. PM7 now resolves typography only through its theme-authored local/system
fallback stacks, keeping offline behavior, first paint, and browser evidence
self-contained without changing the frozen style/script block census.

`TRANSFORMS` starts at **T33+** (the re-baseline left T01-T32.2 frozen in the
base). A build loads the base, asserts the pin and the census, runs T33+,
writes the artifact, and runs the five static gates.

The retained T33-T43 sequence and its last frozen measurements are:

| Stage | Bytes | SHA-256 | Disposition |
|---|---:|---|---|
| pinned base | 4,101,102 | `9dcde2a8862de0cdd28a0d540cb4976396ea0556e6ff15a5c9c8fc14bd121090` | frozen input |
| after T33 | 4,100,982 | `a88cdbb20f44753395a73abe4a1b6d4408993007fd0ae151d009f7ec8ed4ecc6` | prior retro drag correction; -120 bytes |
| after T34 | 4,192,958 | `60af52096ca851321d0548464076fe3f0b7a727bf5ea756bffc1dfc350d146aa` | GUI-01..GUI-10 plus GUI-X01..GUI-X04, terminal current-thread projection synchronization, and transactional resize release validation; +91,976 bytes |
| after T35 | 4,213,453 | `d2f96aee19bd985f7ead90ea08fbdc7b8b254d23751543a208c07588c4eaa52b` | Usage navigation/disclosure/truthful chart/physical-width/complete-record/ghost residuals, protected card identity, earned wide/tall compositions, and narrow Ledger containment; +20,495 bytes |
| after T36 | 4,224,248 | `a4d275cb20ef1c555f849d0c60f14f92ec68744ab06600b0cfae596205bb0081` | narrow Wizard/Home/Projects/Orchestrator layouts, direct Home CTA-rail containment, overflow-page nav-ink resync, and the canonical full-width status zone; +10,795 bytes |
| after T37 | 4,230,484 | `4ef6d82693e8494de1f582f9be87b876c868912f5e1bd9cb3a85197937476c09` | scoped semantic contrast and Retro component states; the Glass approval observation is external audit evidence, not a build probe; +6,236 bytes |
| after T38 | 4,268,922 | `4895d682ad35d70af3f29014d6bd254a2d22c5f950b0913c4a73da2e5b40bd82` | stable measured-footprint Usage reorder, contained unit-aware vertical labels, compact-summary fact reflow, a contained six-track narrow reorder band, wrapper-owned transactional Home widget move/resize, and transform-independent settled Home move coordinates; +38,438 bytes |
| after T39 | 4,290,233 | `1b8f1f45b1ab28f4288a70ef3cbee6750d2e7f4cc48a74cd858003b36a1aff09` | stable pointer/keyboard two-dimensional Usage slots, exact empty-cavity targeting, v12 demo-workspace migration, changed-only boundary resize, and one exact visible label for every painted vertical bar—including zero bars—with at least four CSS pixels of same-band clearance; +21,311 bytes |
| after T40 | 4,294,542 | `5eaacd7f4838502be900a00eaaa396943558e5f24c1f83857246188665224f1d` | mounted and continuously painted reorder peers, one accepted DOM-order reconciliation, restored preview-only board extent, strict requested-axis curated resize at right/left/middle positions, edge-limited one-step intent, and owner-rejected/adapter-failed resize rollback; +4,309 bytes |
| after T41 | 4,307,393 | `e0c9e9218e4ad85fd6567e20fccd1427bd45d88ccb8610b0843c6ee37d314b69` | measured base-coordinate magnetic control zones, continuous near-control neutralization with body magnetism retained, pointer/top-hit-scoped acquisition rescue, operation reentrancy exclusion, and hit-testable narrow page overflow while its menu is active; +12,851 bytes |
| after T42 | 4,308,739 | `b019cf8dfed0e6d64f415bb5d71871d844cf58bbce16017ac82fb1e904ab0923` | hidden boot renders cannot project persisted grid slots from zero geometry; class activation and the board ResizeObserver coalesce until one active positive-width non-transaction render completes; +1,346 bytes |
| after T43 | 4,311,254 | `a96a2c6348de902c9552f7f047ab8ce560f1c52b5e1e502627c12d6b6a28bb1b` | Usage-only live occupied-neighbor pointer-resize preview through the shared target-first slot projection; accepted settlement retains the exact painted topology without board remount; Dashboard resize remains frozen-peer; +2,515 bytes |

The authored tail runs in this exact order:

| Stage | Authored source | Scope | Evidence status in this README |
|---|---|---|---|
| T44 Settings Tome Tabs | `settings_tome_source.py` | pinned K3 Settings geometry, canonical inventory projection, typed `cmd.settings.open` and Settings transaction simulation | build/browser evidence must be read from the report produced for the exact artifact under review |
| T45 Product Onboarding | `onboarding_cinematic_source.py` | simple cinematic first-run flow and typed local UI actions | verifier provided; no native Slint certification |
| T45 live-shell Guided Tour | `guided_tour_source.py` | deterministic local teacher over the mounted shell | verifier provided; concept simulation only |
| T46 operational systems | `systems_integration_source.py` | owner-routed Doctor plus Server, backup, Browser/capture, SCM/Origin, Named Plan, performance, and compact Plugins System owner consumers | verifiers provided; plugin controls remain `handler_unavailable`; no production handler claim |
| T46F forge/backup post-integration | `forge_backup_post_integration_source.py` | one adaptive Source Control occupant, one provider-neutral Actions & Pipelines occupant, Git/Jujutsu semantics, Forgejo/Gitea and other forge projections, and the K3 backup/recovery manager | browser-concept projection only; production/native handlers remain unavailable and the September 1 packet audit must cite an exact artifact |
| T46P full-thread performance | `full_thread_performance_source.py` | deterministic browser-applicable fixture for the retained performance topics and scenarios | verifier provided; native/static/hardware boundaries remain explicit |
| T47 global hover tags | `global_hover_tags_source.py` | shared theme-aware pointer/focus overlay, accessibility descriptions, and fail-closed census | verifier provided; presentation/UI-action layer only |
| T48 Home workspace authored-source refresh | `home_workspace_refresh_source.py` | replace only the pinned T20 style/controller bands from `home_workspace_source.py`, preserving the exact authored markup and frozen base | generated browser concept only; no acceptance or native-runtime claim |

Do not infer that a verifier has run merely because its runner exists. A result
is credited only when its preserved report identifies the same artifact SHA-256
as the artifact being reviewed. The current working tail can change while this
integration wave is active, so this README intentionally does not pin a new
T48 artifact byte count or hash before promotion evidence is frozen.

T34-T48, including T46F, are isolated in source modules and registered in the table order above
immediately after T33 in `build_pm7.py`; Product Onboarding precedes the
live-shell Guided Tour within T45, T46F precedes T46P, T46P precedes T47, and
`T48_home_workspace_source_refresh` is the current tail. Their pre/post
assertions fail closed if the consumed input shape moves. T34 mints zero new
primary command IDs, while its measured source set-diff adds the already-owned
`cmd.settings.open` literal to this document. `cmd.settings.open` is the typed
Settings entry command; `cmd.settings.bloom.open` is retired lineage and must
not be presented as a current command. T34's approved domain-event
set-diff adds `usage.details.open` and
`usage.provider_setup.open_settings`, removes the two context-compaction
lookalikes and `view.usage.subject_opened`, and records the approved workspace
envelope/legacy-cleanup persistence targets. T35-T37 assert empty command,
domain-event, DOM-event-type, and persistence target set-diffs. T38 likewise
adds no command, domain-event, or DOM-event type; its only persistence-target
set additions are guarded Dashboard prototype-state eviction paths. T39 also
adds no command, domain-event, or DOM-event type; its guarded persistence delta
replaces the split v11 layout/order writes with one v12 demo envelope and one
bounded prior-envelope cleanup path. T40-T43 likewise add no command,
domain-event, DOM-event-type, or persistence target. T43 reuses the existing
resize command/event literals while changing only the local preview and exact
settlement path. T35-T43
compare the complete named embedded Settings and Assistant/Chat owner slices
at transform input and output. That is an exact source-slice guard, not a
rendered-pixel or standalone-prototype equality claim. Prototype Usage state
remains explicitly noncanonical.

The two T45 transforms keep local presentation controls outside the semantic
command catalog. Product Onboarding uses exactly thirteen typed-local actions:
`ui.onboarding.start`, `ui.onboarding.next`, `ui.onboarding.back`,
`ui.onboarding.close`, `ui.onboarding.skip`, `ui.onboarding.defer`,
`ui.onboarding.open_details`, `ui.onboarding.more_ways`,
`ui.onboarding.choose_simple_path`, `ui.onboarding.open_owner_flow`,
`ui.onboarding.run_automatic_preparation`,
`ui.onboarding.choose_first_project`, and `ui.onboarding.finish`.
Its closed concept request/result projection uses
`pm.product_onboarding.action_request.v1` and
`pm.product_onboarding.action_result.v1`. Every request includes required closed
`local_context` with only normalized, secret-free `intent`, `scope`,
`branch_kind`, `branch_step`, `selection_ref`, `target_ref`,
`owner_operation_ref`, `owner_branch_ref`, `expanded`, `start_tour`, and
`recovery_condition`; arbitrary/raw payload fields and secret-bearing values
are rejected. These are not semantic commands or native/runtime handler
evidence. Guided Tour uses the closed
`ui.guided_tour.*` vocabulary,
including typed `ui.guided_tour.focus_route` with `route_target.page_id` for
mounted-shell page/focus presentation and closed
`pm.guided_tour.focus_route_result.v1` result/error metadata. That action emits
no domain mutation or persistence write and does not promote the optional historical
`cmd.nav.focus_route` migration alias. Guided Tour's guarded command set-diff
adds only the already-owned `cmd.widget.configure` literal needed to exercise
the mounted Usage concept owner; its domain-event, DOM-event-type, and
persistence-target deltas remain empty.

T48 does not replay the retired T20 assembly. After the re-baseline, it finds
the one embedded `PM7 T20: Home workspace model-first transform` markup band
and the uniquely bounded T20 style/controller bands already frozen into
`base/PM7-base.html`. It requires SHA-256
`04b7f065297853339c66c15bb31f9a7bad34791a91de4ba4fbbace05db171845`
for markup, `01e5bd1c0c7210323badf623870a29ee9ee40081a1d50f7788f6599a1a376781`
for style, and
`73615ff4ed05750c08783cedc020523297169bba1bd654eb633422a99a584d8b`
for controller input. The markup must also equal the current authored markup
and remains untouched. Only the pinned style and controller bands are replaced
from `home_workspace_source.py`; their authored output hashes are respectively
`b7f426db83ef57cb86d02234dfbbdbf14a837177febaed655b209da79ca5da4f`
and `665186796b51ab245cd3d72466ff86bead6875fad920b045f6aa73a7a8150bf8`.
The build report records `home_workspace_refresh_source.py` under
`build_provenance.authored_transform_sources_used`, so source provenance is
bound to the report for the exact build. Its guarded effect-surface delta only
removes the retired `cmd.workspace_layout.size_surface` literal; it adds no
command, domain event, DOM event type, or persistence target. These are static
source and browser-prototype constraints, not visual acceptance, persistence
execution, migration execution, native Slint certification, or readiness.

### Why

Two distinct bodies of work are now baked into the base.

1. **T01-T20 — retired-into-base.** These were genuine pipeline transforms
   that produced the previous artifact (sha `213a3ee9…`, 3,619,880 bytes) from
   the Jul 15 PMConcept6 assembly (sha `3d82a850…`). Their output is already
   present in the base, so re-running them would abort on their own
   pre-assertions — the anchors they search for no longer exist. The
   `t01_*..t20_*` functions, `dead_selectors.py` and `home_workspace_source.py`
   are kept as the historical record of how the base was derived; they are no
   longer executed.

2. **T21-T24 and T29-T32.2 — hand-authored, no generator.** On 2026-08-20 a
   large body of work (the Prism Usage workspace replacing the old usage grid,
   the retro-dark palette retune, the IBM Plex Mono + Poppins font additions)
   was edited **directly into the HTML**, in violation of the never-hand-edit
   rule below. The wave labels appear in the document's CSS comments and style
   block ids, but no transform source for them has ever existed — it is not in
   this repo, in any worktree, or anywhere on disk. That work cannot be
   re-derived.

Because (2) cannot be regenerated, the only honest options were to freeze it
into the base or to lose it. It was frozen. The alternative — leaving
`BASE_SHA` pinned to PMConcept6 with `TRANSFORMS` ending at T20 — was a live
hazard: the next build would have silently regenerated the old artifact and
destroyed every hand-authored wave.

### What this means going forward

New PM7 work belongs in this pipeline after the current T48 tail, restoring a
real derivation chain from this base forward. The pin/census assertions,
transform assertions, and five static gates catch a corrupted input, moved
anchor, invalid script/CSS, newly undefined CSS variable, final-artifact T45
stage/action/return drift, or banned glyph.

If a future change needs the PM6 lineage, the previous pin was
`3d82a850dad0e412e3abafe1b3f0717e34071425152efd93d3c49fa6e85408c3` and the
recipe it used is preserved in the re-derivation section below.

## Files

- `base/PM7-base.html` -- the pinned 2026-08-27 input (it was previously the
  shipped Jul 15 `Concepts/PMConcept6.html`). Its SHA-256 tracks `BASE_SHA` in
  `build_pm7.py`; re-derive it with `sha256sum` after any intentional repin.
  Never edit it. `build_pm7.py` refuses to run against a base whose sha does
  not match the pin unless `--allow-new-base` is passed intentionally.
- `build_pm7.py` -- the pipeline. Segments the document into style/script
  blocks (census asserted: 43 blocks = 22 style + 21 script on the pinned
  base), runs ordered content-anchored transforms (currently T33 through T48,
  including separate Product Onboarding and Guided Tour T45 entries, T46P,
  and the T48 Home authored-source refresh)
  with mandatory pre/post assertions (any failure aborts), writes the output
  plus a JSON build report, then runs the static gates: per-style-block brace balance,
  var(--x)-used-implies-defined (baseline-relative to the base),
  per-script-block extraction + `node --check`, the final generated T45
  nine-stage new/local and six-stage connect-existing, exact-thirteen-action,
  request-result/owner-return contract, and the pm6-build emoji checker
  (invoked read-only). Flags: `--until N`, `--skip NAME`,
  `--report`, `--out FILE`, `--outdir DIR`, `--allow-new-base`, `--base FILE`.
- `css_audit.py` -- unused-CSS-selector detector. Brace-balanced rule
  scanner (recurses @media/@supports/@container, treats @keyframes and
  @font-face atomically), per-selector class/id token extraction (tokens
  inside `:not()/:is()/:where()/:has()` and `[...]` are ignored because they
  cannot prove a selector dead), non-CSS corpus = whole document minus style
  contents, dynamic-prefix harvesting from JS string concatenation
  (`'foo-' + expr`) and template literals (`foo-${expr}`), always-keep for
  attribute/pseudo/element-only selectors, and keyframes reference counting.
  Outputs a CSV (`selector, family, bytes, verdict, evidence`) and, with
  `--freeze`, a generated dead-selectors module.
- `dead_selectors.py` -- the FROZEN human-reviewed dead-selector list that
  transform T01 consumes. Generated by `css_audit.py --freeze`, then
  reviewed (approved families only; dynamic-prefix and doubt exclusions are
  listed in the file header with reasons). Do not hand-tune entries; if the
  base changes, re-derive (recipe below).
- `usage_corrections_source.py` -- authored T34 source for GUI-01..GUI-10 plus
  the approved GUI-X01..GUI-X04 Usage repairs. It owns the transform payload
  and its exact assertions; the generated HTML is not a substitute source.
  PMConcept7 Ledger attempt drill-through uses a `usage_attempt` object route
  whose object id is the stable `attempt_id`; the distinct `usage_event_ref`
  and provider/account identities remain correlation fields, and the route
  carries no document/artifact `OpenSubject` payload.
  Pointer resize is transactional: a release far outside the supported board
  corridor rolls the preview back without a command, receipt, domain event, or
  persisted layout change. A valid captured-pointer release may overshoot the
  min/max curated-size gesture coordinates by one horizontal and vertical grid
  step, while the settled layout remains clamped to a supported curated size.
  The effect guard reports `cmd.settings.open` as added to PMConcept7's
  command-literal set, but `primary_command_ids_minted` remains zero because
  T34 reuses that existing command contract rather than inventing an ID.
  The Chat Assistant 5.6 Pro compact menu and More Details GUI remain a
  separate protected lineage and are not ported by T34.
- `usage_residuals_source.py` -- authored T35 source for the authorized Usage
  residuals: named 13-room navigation, exact Source Authority 4/6/8
  disclosure, deterministic five-label chart sampling with the truthful
  complete accessible series, physical card tiers, narrow stage layout and
  named icon-only scope control, setup-card containment, complete Ledger
  timestamp/status lanes, a visible body-portal reorder ghost, protected card
  title identity ahead of optional metadata, aligned wide instrument lanes,
  earned tall-summary plots, and fixture-derived Usage Context attribution.
- `narrow_layout_source.py` -- authored T36, using the actual `.primary-content`
  width to adapt Planning Wizard, Home, Projects, and Orchestrator, while
  superseding the old floating Glass status strip with the canonical
  full-width status zone. Home's direct `#pm6DashCtaRail > .pm6-dash-cta`
  children (both approval and Usage-warning cards) wrap at the dashboard's
  physical 320px threshold, with a 220px decoration reduction. Overflow-only
  page activation schedules a visual page-tab ink resync after title-bar
  density settles. T36 adds no command, domain-event ID, DOM-event type, or
  persistence target.
- `contrast_repairs_source.py` -- authored T37, which strengthens semantic
  tokens only inside Usage, Wizard, ordinary Projects surfaces, and
  Orchestrator, including the measured Retro disabled-approval and Projects
  primary-CTA composites. The enabled Glass approval rule is paint-only; the
  report's one-activation/one-`run.approveGate`/one-terminal-`run.gate`
  observation is external audit evidence and is not executed or re-proven by
  the build.
- `widget_interaction_repairs_source.py` -- authored T38 source for immutable
  Usage insertion candidates, measured physical placeholders, last-painted
  intent commits, visible interruptible peer displacement, an overflow-free
  six-track Usage composition at or below 820 physical stage pixels, stacked
  primary summary facts when a curated card is at most 180 physical pixels,
  transactional Home Dashboard pointer/keyboard move and resize, semantic
  four-column restore, and shared contained vertical-chart labels with
  metric-correct formatting.
  Dashboard dispatch records the existing catalog payload fields and a
  clearly labeled prototype-only owner result/receipt; it is not a production
  `handlers::widget` or `widget_layout:v1:dashboard` implementation claim.
  Move payload coordinates use transform-independent committed layout
  geometry, so an in-flight neighbour/card FLIP cannot report the old row.
- `widget_grid_and_chart_repairs_source.py` -- authored T39 source for shared
  pointer/keyboard multi-span Usage grid-slot candidates, reachable empty
  cavities, stable before/after correlations, changed-only boundary resize,
  bounded v11/v10-to-v12 demo-workspace migration, and the final chart-label
  fitter. Every painted bar has exactly one visible declared-unit label,
  including zero bars; attempt values retain exact cents, no label is
  suppressed, and labels in the same vertical band keep at least four CSS
  pixels of horizontal clearance.
- `widget_preview_and_resize_repairs_source.py` -- authored T40 source. Usage
  reorder previews retain the same mounted peer nodes, suppress their entrance
  animation, and defer DOM-order reconciliation until one accepted settlement,
  eliminating the board-wide black repaint. Both commit and rollback restore
  the exact pre-transaction preview-only board extent. Pointer and keyboard
  resize select the next supported geometry strictly on the requested axis at
  the far right, far left, and middle while minimizing companion-axis drift;
  edge-limited travel can express one step. A changed dispatch that the owner
  rejects, or whose persistence adapter fails, restores authoritative geometry
  with one truthful rejected/failed receipt and no settled event or successful
  owner-store write.
- `usage_control_and_overflow_repairs_source.py` -- authored T41 source. It
  keeps Usage card-body magnetism, but continuously reduces translation to zero
  inside measured move/resize control zones so the control does not jump away
  during acquisition. Its short pointer-specific handoff requires the current
  top hit to remain owned by the remembered card, clears on every direct or
  rescued activation, and cannot bypass an intervening interactive layer.
  Resize/reorder entry points reject reentrancy before mutation. The page-tab
  edge mask is disabled only while the existing overflow menu is opening, open,
  or closing so narrow overflow entries remain hit-testable.
- `usage_activation_layout_repairs_source.py` -- authored T42 source. It
  prevents settled-slot projection while Usage is hidden or has no measurable
  board width, then coalesces exactly one first-visible render on activation so
  a persisted room is correct on its first paint rather than only after an
  away-and-back room change.
- `widget_live_resize_preview_source.py` -- authored T43 source. It reuses
  T39's target-first two-dimensional grid simulation so a held Usage pointer
  resize advances a real supported placeholder footprint and visibly moves
  only obstructed mounted peers. Preview remains command/receipt/event/write
  silent. One accepted release persists and retains the exact painted slots
  without board remount; cancellation, owner rejection, or adapter failure
  restores the captured authoritative layout. Dashboard resize is unchanged.
- `settings_tome_source.py` -- authored T44 source. It hash-pins the winning
  Kimi K3 HTML and companion assets, projects `Plans/settings_inventory.json`
  into the complete Settings read model, preserves the 250px rail and 62px
  topbar geometry, and adapts the result to all eight PM7 theme combinations.
  `k3_geometry_manifest.json` freezes the wide and responsive geometry,
  continuous structure, allowed theme/paint differences, forbidden chrome
  drift, exact source hashes, and browser-versus-native evidence boundary.
  Its browser contract exposes typed `cmd.settings.open`,
  `cmd.settings.transaction.preview`, `cmd.settings.transaction.apply`,
  `cmd.settings.transaction.rollback`, and `cmd.settings.export`, plus route
  restoration, persistence, theme, glass-transparency, tooltip, and
  reduced-motion controls. It does not implement a native Settings owner or
  native command handler.
- `onboarding_cinematic_source.py` -- authored T45 Product Onboarding source.
  It provides the deliberately simple nine-stage Welcome, Starting Point,
  Project, Safe History and Online Copy, Server/Storage/Client, Private Access,
  Review, Preparation, and Ready flow with interruptible,
  reduced-motion-aware, Slint-portable choreography. The connect-existing
  journey uses the six-stage Welcome, Starting Point, Private Access, Review,
  Preparation, and Ready shortcut and never forces an established user to
  create another project. Optional forge/account/repository, mounted storage,
  Headscale, VPN, reverse-proxy, Remote Link, and Cursor Origin choices remain
  progressive disclosures rather than extra top-level stages. Before Review,
  the concept may project owner-bounded, non-authenticating read-only discovery
  and already-detected session state; it may not pair, sign in, create or bind a
  repository, restore, write files, or mutate Server/network state. Review is
  the sole execution boundary. Preparation remains a truthful browser-only
  preview and Ready never claims production mutation.
  The flow stays one bounded modal over the visible input-blocked workspace; it
  adds no browser/route Back or breadcrumb chrome, while its existing typed
  Back action remains local to the bounded stage/owner-branch presentation. Its
  exact current thirteen-action
  `ui.onboarding.*` vocabulary is enumerated above. `ui.onboarding.defer`
  durably preserves exact stage/path/branch/history/revision/continuation,
  initiating-Client, and focus-return context before dismissal;
  `ui.onboarding.close` dismisses without completing, skipping, or deferring;
  `ui.onboarding.skip` records an explicit skipped session; and
  `ui.onboarding.open_details` toggles ephemeral same-stage Details without a
  persistence write or owner command. Closed action results distinguish
  `applied`, `disabled`, and `rejected`; disabled/rejected results have no
  local effect, session/continuation write, owner route/operation, or production
  receipt and retain their exact reason. `ui.onboarding.more_ways` distinguishes
  setup/project disclosure (`toggle_setup_options`, matching choice/scope,
  null branch) from branch-local state updates (`update_branch_state`, null
  choice, canonical branch). `ui.onboarding.skip` distinguishes the global
  `skip_product_onboarding`/`session_skipped` outcome from active-session
  Project or Remote Access `skip_optional_scope`/`optional_scope_skipped`.
  Mixed or ambiguous intent/scope/choice/branch combinations fail closed. The packet candidates
  `cmd.onboarding.back`, `cmd.onboarding.cancel`, `cmd.onboarding.continue`,
  `cmd.onboarding.defer`, `cmd.onboarding.finish`,
  `cmd.onboarding.open_details`, `cmd.onboarding.resume`, and
  `cmd.onboarding.skip` are source-lineage candidate tokens only and are
  rejected as commands, aliases, and handlers because typed local actions own
  their semantics. This is separate from the eleven retired UCC-106
  provider-first command-era tokens. Owner-flow projections are simulations,
  not production mutations.
- `guided_tour_source.py` -- authored T45 live-workspace Guided Tour source. It
  uses a deterministic local teacher over already-mounted Assistant Chat,
  workspace, widget, Usage, and Planning Wizard surfaces. It owns no provider,
  runtime, command bus, persistence, layout, or AuthBrowserSession state.
  The directed beginner film follows Usage, Planning Wizard, then Assistant
  Chat without returning to an earlier feature. Exact watched controls advance
  the lesson; Chat finishes docked at the far right; ELI5 stays beside Pause and
  Skip; selecting Teacher exposes the novice prompt `Ask Teacher anything about
  Puppet Master…`, four calm first-view questions, an unobscured categorized
  `Browse 26 more` library inside Assistant Chat, and a deterministic local
  reply. The tour callout yields while that library is open and returns to the
  same beat when it closes. Non-exact scene transitions
  focus the exempt scene heading instead of an action, preventing an unrequested
  visual hover tag while retaining normal keyboard traversal. Page/focus
  presentation uses typed `ui.guided_tour.focus_route`, not a synthetic
  navigation command. Dynamically unavailable actions remain
  keyboard-focusable through `aria-disabled` so their themed hover tag and
  accessible disabled reason are still reachable.
- `systems_integration_source.py` -- authored T46 source. It keeps K3 geometry
  while replacing the placeholder Doctor with cached/lazy owner-routed
  projections and adding bounded Settings consumers for Server/remote access,
  Full Server Backup/Restore, Browser/capture, SCM/forges/Origin, Named Plans,
  performance, and Plugins System. The Plugins tab progressively projects
  manifest lanes, package/component generations, conformance, permissions,
  update/reapproval, containment, supply-chain, rollback, runtime bounds, and
  bounded evidence; its exact twelve commands are all `handler_unavailable`
  and cannot fall through to generic K3 mutation handlers. All operations
  remain browser-concept simulations unless a real owner bridge is attached;
  `AuthBrowserSession` remains excluded from recording and inspection.
- `forge_backup_post_integration_source.py` -- authored T46F source. It keeps
  the existing Source Control and activity-panel occupants, migrates legacy
  GitHub Actions identities to one `repository_automation` identity, preserves
  GitHub detail, adds provider-native GitLab/Azure/Bitbucket/Forgejo/Gitea and
  connected-check projections, and renders Git and Jujutsu without borrowing
  each other's concepts. It also deepens the existing K3 backup manager with
  destination-account versus decryption readiness, Recovery Kit controls, and
  explicit restore/Doctor routes. Every owner command remains
  `owner_unavailable_concept_preview`; this source is not runtime evidence.
- `full_thread_performance_source.py` -- authored T46P source. It extends the
  T46 performance consumer with deterministic browser fixtures, preserves the
  separate governor-decision, command-outcome, and ObservableWork axes, and
  consumes rather than duplicates T44's Settings model. It does not represent
  browser timing as native Slint, compositor, Server, storage, network,
  package, platform, or hardware evidence.
- `global_hover_tags_source.py` -- authored T47 source. It installs one
  `PMHoverTag` model and one `HoverTagController`, migrates native `title`
  presentation into stable accessible descriptions, binds actionable and
  focusable targets, applies theme/reduced-motion/glass-transparency behavior,
  and emits no domain command, domain event, or persistence write. Accessible
  descriptions bind immediately; visual tags require 1600ms pointer residence
  plus 1100ms stationary intent within 5px, or 1000ms continuous keyboard focus;
  opened pointer tags retain a 160ms departure grace.
  Its
  fail-closed census is exercised by `verify/hover_tags.mjs`.
- `home_workspace_refresh_source.py` -- authored T48 source. It hash-pins the
  re-baselined T20 Home markup/style/controller input, leaves the equal current
  authored markup in place, and replaces only the uniquely bounded style and
  controller bands from `home_workspace_source.py`. It does not modify the
  frozen base or rerun the retired T20 assembly. The refreshed browser concept
  keeps exact-v1-factory-only upgrade behavior and non-destructive customized
  v1 copy-forward behavior; neither is native persistence or migration proof.
- `pm7_transform_guards.py` -- shared T34-T48 source/effect guard. T35-T43
  compare six complete Settings/Chat owner blocks, nine balanced embedded DOM
  elements, and the complete Assistant context-owner band exactly across each
  transform. The guard's scope is named embedded PMConcept7 source, not pixels
  or the standalone redesigned Chat and Tome Tabs Settings prototypes. The
  same module computes before/after command, domain-event, DOM-event-type, and
  persistence-target sets; unexpected additions or removals abort the build.

## Never hand-edit rule

The PM7 output, the build report, and `dead_selectors.py` are derived
artifacts. Regenerate them; do not patch them. Hand-authored pipeline files
include `build_pm7.py`, `home_workspace_source.py`, the T34-T48 source modules
(including T46F),
`pm7_transform_guards.py`, `css_audit.py`, the verification runners under
`verify/`, and this README.

This rule was broken once, on 2026-08-20, when the Prism Usage work was edited
straight into `Concepts/PMConcept7.html`. The result was unreproducible: the
delivered artifact could not be regenerated from any input in the repo, and
recovering the pipeline meant freezing that work into the base and giving up
its derivation history. That is the whole cost of a hand-edit here — it is not
recoverable after the fact. Add a transform instead.

## Re-derivation recipe (when a new base is adopted)

1. Place the new base at `base/PM7-base.html` (or point `--base` at it).
2. `python3 css_audit.py --input base/PM7-base.html --csv <scratch>/audit.csv
   --freeze <scratch>/dead_selectors.generated.py`
3. Review the generated module: check the harvested-prefix list for new
   dynamic families, check the EXCLUDED notes, spot-grep any token you are
   not sure about (`grep -c '<token>' base/PM7-base.html` must equal its
   CSS-only occurrence count for a true dead token). When in doubt, exclude.
4. Copy the reviewed module over `dead_selectors.py`, update `BASE_SHA` in
   `build_pm7.py`, and update the block-census constants if the scan reports
   a different segmentation.
5. Rebuild with `--report` and diff the report against the previous run.
   Pre-assertion failures pinpoint exactly which upstream edits moved an
   anchor.

## Build and verification

Run from the repository root:

    python3 Concepts/pm7-tools/build_pm7.py \
        --outdir scratchpad/pm7-build \
        --out scratchpad/pm7-build/PMConcept7.html \
        --report

The build writes the HTML plus `<outdir>/build_report.json`. A checked-in
artifact is promoted through the same command by setting
`--out Concepts/PMConcept7.html`; never copy or patch an intermediate by hand.

During an integration wave, first build to a fresh scratch directory. Promote
only after its report and browser evidence are frozen and adjudicated:

    artifact=Concepts/PMConcept7.html
    recheck="$(mktemp -d scratchpad/pm7-t48-recheck.XXXXXX)"
    python3 Concepts/pm7-tools/build_pm7.py \
        --outdir "$recheck" \
        --out "$recheck/PMConcept7.html" \
        --report
    jq '{output_bytes,output_sha256,gates_all_pass}' "$recheck/build_report.json"

After an authorized source-owned promotion, a second clean build must compare
byte-for-byte with the checked-in artifact:

    cmp "$artifact" "$recheck/PMConcept7.html"
    sha256sum "$artifact" "$recheck/PMConcept7.html"

Relevant repository checks are:

    python3 scripts/pm-plans-verify.py validate-usage-gui-fixtures
    python3 scripts/pm-plans-verify.py validate-pm7-gui-fixtures
    python3 scripts/pm-plans-verify.py validate-usage-contract-drift
    python3 scripts/pm-plans-verify.py validate-wiring-matrix
    python3 scripts/pm-shared-runtime-command-contracts.py validate
    python3 scripts/pm-plans-verify.py run-gates
    python3 scripts/pm-shard-plans.py --check

Serve the repository root before using `--server`:

    python3 -m http.server 8741 --bind 127.0.0.1

Set `PM7_FILE` to the artifact path relative to the served repository root
(for example `scratchpad/pm7-build/PMConcept7.html`), and set `PM7_EVIDENCE`,
`PM7_MODULES`, and `PM7_CHROME` to explicit paths. The server-using runners
append `PM7_FILE` to the server URL. Each runner hashes the local artifact when
its contract supports that; keep the report beside the exact build it
exercised.

    node Concepts/pm7-tools/verify/settings_transactions.mjs \
      --file "$PM7_FILE" --out "$PM7_EVIDENCE/settings-transactions.json" \
      --modules "$PM7_MODULES" --server http://127.0.0.1:8741 --chromium "$PM7_CHROME"

    node Concepts/pm7-tools/verify/onboarding_cinematic.mjs \
      --file "$PM7_FILE" --outdir "$PM7_EVIDENCE/onboarding" \
      --modules "$PM7_MODULES" --server http://127.0.0.1:8741 --chromium "$PM7_CHROME"

For Onboarding, the source assertions and final generated-artifact static gate
must reject any stage/action census drift, any `cmd.onboarding.*` command
family entry, incomplete request/result closure, absent/open-ended
`local_context`, arbitrary/raw or secret-bearing context, ambiguous
setup/project-versus-branch-local `more_ways`, ambiguous whole-session-versus-
optional-scope `skip`, persisted Details state, or loss of bounded-modal
semantics. The browser runner must cover the exact normalized local-context
shape and both `more_ways`/`skip` variants, applied, disabled, and rejected
results; durable exact-continuation Defer;
non-completing Close; explicit skipped-session Skip; ephemeral same-stage
Details; focus return; modal containment; and absence of route/breadcrumb
chrome. These gates validate the exact generated browser concept only. They do
not certify native Slint, native Storage, dispatcher/handler execution,
production persistence, accessibility conformance, or runtime behavior.

    node Concepts/pm7-tools/verify/guided_tour.mjs \
      --file "$PM7_FILE" --outdir "$PM7_EVIDENCE/guided-tour" \
      --modules "$PM7_MODULES" --server http://127.0.0.1:8741 --chromium "$PM7_CHROME"

    node Concepts/pm7-tools/verify/systems_integration.mjs \
      --html "$PM7_FILE" --evidence "$PM7_EVIDENCE/systems.json" \
      --geometry-manifest Concepts/pm7-tools/k3_geometry_manifest.json \
      --modules "$PM7_MODULES" --chromium "$PM7_CHROME"

    node Concepts/pm7-tools/verify/plugin_projection_matrix.mjs \
      --html "$PM7_FILE" --evidence "$PM7_EVIDENCE/plugin-projection.json" \
      --modules "$PM7_MODULES" --chromium "$PM7_CHROME"

    node Concepts/pm7-tools/verify/backup_browser_scm_matrix.mjs \
      --html "$PM7_FILE" --evidence "$PM7_EVIDENCE/backup-browser-scm.json" \
      --modules "$PM7_MODULES" --chromium "$PM7_CHROME"

    node Concepts/pm7-tools/verify/forge_backup_post_integration_checkpoint.mjs \
      --file "$PM7_FILE" --out "$PM7_EVIDENCE/forge-backup-fast-checkpoint.json" \
      --modules "$PM7_MODULES" --chromium "$PM7_CHROME" \
      --url "http://127.0.0.1:8741/$PM7_FILE"

The Forge/Backup post-integration checkpoint is the deliberately bounded
pre-approval browser smoke for the exact T46F artifact. It checks the single
Source/Actions occupants, Git/Jujutsu presentation semantics, all forge and
automation profiles, new-control closure, the K3 Backup manager, Forgejo and
Gitea onboarding presence, the shared explainer/accessibility target and
self-hosted field-alignment regression guards, durable activity-ID migration,
and the truthful concept/native boundary. It is not the post-approval exhaustive, native,
provider, security, accessibility, performance, or motion campaign.

    node Concepts/pm7-tools/verify/full_thread_performance.mjs \
      --html "$PM7_FILE" --evidence "$PM7_EVIDENCE/full-thread-performance.json" \
      --modules "$PM7_MODULES" --chromium "$PM7_CHROME" --samples 240

    node Concepts/pm7-tools/verify/hover_tags.mjs \
      --file "$PM7_FILE" --out "$PM7_EVIDENCE/hover-tags.json" \
      --modules "$PM7_MODULES" --server http://127.0.0.1:8741 --chromium "$PM7_CHROME"

    node Concepts/pm7-tools/verify/accessibility_visual_matrix.mjs \
      --file "$PM7_FILE" --out "$PM7_EVIDENCE/accessibility-visual.json" \
      --geometry-manifest Concepts/pm7-tools/k3_geometry_manifest.json \
      --modules "$PM7_MODULES" --server http://127.0.0.1:8741 --chromium "$PM7_CHROME"

    node Concepts/pm7-tools/verify/home_workspace_matrix.mjs \
      --file "$PM7_FILE" --outdir "$PM7_EVIDENCE/home-workspace" \
      --modules "$PM7_MODULES" --server http://127.0.0.1:8741 \
      --chromium "$PM7_CHROME" --video off

The Home matrix is an active T48 check, runs alone, and is expected to be
substantially longer and more memory-intensive than the focused functional
runners. `--video off` avoids duplicate per-case video only because the
consolidated campaign owns the final motion recording.

The consolidated capture is intentionally separate from the functional
verifiers. Use a new evidence directory, preserve every delivered lossless
frame, and review it with the companion frame-review tool:

    node Concepts/pm7-tools/verify/final_campaign_capture.mjs \
      --file "$PM7_FILE" --outdir "$PM7_EVIDENCE/final-campaign" \
      --modules "$PM7_MODULES" --server http://127.0.0.1:8741 \
      --chromium "$PM7_CHROME" --campaign final --target-fps 60
    python3 Concepts/pm7-tools/verify/review_capture_frames.py \
      --frame-index "$PM7_EVIDENCE/final-campaign/frame-index.json" \
      --outdir "$PM7_EVIDENCE/final-campaign/frame-review" \
      --reviewers reviewer-1,reviewer-2 --chrome "$PM7_CHROME"
    python3 Concepts/pm7-tools/verify/review_capture_frames.py \
      --ledger "$PM7_EVIDENCE/final-campaign/frame-review/review-ledger.json" \
      --check-complete

`final_campaign_capture.mjs` records frames Chrome actually delivers and the
actual measured cadence. It does not resample missing frames into a claimed
60 FPS result. FFV1/MKV, MP4, frame indexes, hashes, timing, console, network,
scenario, and review outputs remain approval-gated evidence.

At the time of this README reconciliation, T44-T48 integration evidence is
still an active working set, not a final promotion campaign. Some bounded
reports exist under `scratchpad/pm-integration-20260831/`, but later source
changes can make them stale; the full-thread working report also retains
failures. Therefore Settings, Onboarding, Guided Tour, systems, backup/Browser/
SCM, full-thread, hover, the all-theme accessibility/visual matrix, and the
consolidated final film are **pending final exact-artifact rerun and
adjudication** here.

Every result above is browser-concept or static evidence only. It does not
establish native Slint 1.17.1 behavior, production command handlers, Server or
backup execution, real Browser/SCM state, assistive-technology conformance,
old-hardware performance, production readiness, or governance closure. Static
build gates cannot substitute for browser review, and browser review cannot
substitute for native/runtime certification.

Do not run the PM6-vs-PM7 pixel-parity matrix (`verify/capture_matrix.mjs` and
`verify/compare_shots.mjs`) against this artifact: the later PM7 designs
deliberately abandoned a PM6 pixel-equality contract. `verify/smoke.mjs` is
historical, not the successor audit runner.

## Hard rules

- `Concepts/pm6-build/` is READ-ONLY for this pipeline. It is another
  agent's active workspace. The only interaction allowed is invoking
  `Concepts/pm6-build/checks/check_no_emoji.py <output>` as a read-only
  gate.
- The untracked `Concepts/pm6-build/parts/29x-pm6-js-demo-engine.part.html`
  is a STALE ABANDONED artifact (pre-addendum recombine; not in the active
  manifest; missing the web-operations and requirements-readiness
  subsystems). It must never be used as an input by this or any pipeline.
- No emojis anywhere in authored or generated content (inline SVG only).
  The no-emoji gate enforces this on every build.

## Historical adaptations vs the design memo (pre-rebaseline lineage)

- The pre-rebaseline PM6 pin had a 31-block census (13 style + 18 script),
  while the memo said 28. The current pinned PM7 base is 43 blocks (22 style +
  21 script), asserted by the active build.
- T01 band: memo expected 40-60KB. Measured removal is ~37.8KB because the
  harvester proved `wt-` is a real dynamic prefix
  (`btn.className = 'wt-bind-btn wt-' + data.state;`), protecting all wt-*
  selectors, and review excluded every dead candidate outside the confirmed
  families (chat-/wizard-/files-/pm-/psm-/... stay in place, listed in
  `dead_selectors.py`). Hard band in code is 30-65KB; the report records
  the measured value against the memo band.
- T02: memo pre-asserted 2 occurrences of the shimmer token; the pinned base
  has exactly 1 (`.gl-shimmer-overlay` guard rule) plus a prose comment that
  does not contain the literal token. The transform asserts 1 and removes
  comment + rule.
- T06: memo pre-asserted 2 `clockTick` occurrences; the pinned base has 4.
  The extra 2 are `function clockTick()` / `setInterval(safe(clockTick, ...)`
  in pm6-js-demo-engine -- the LIVE master demo clock, same symbol name,
  different subsystem. The transform removes only the terminal-demo pair
  (`clockTick: 0,` field + 1s increment interval; the counter is never read)
  and asserts the master clock survives untouched.
- T07: the design post-condition "exactly one document-level pointermove
  registration" is asserted statically as one UNCONDITIONAL registration
  (the PM7_PMOVE dispatcher in pm6-js-globals) plus one guarded fallback
  occurrence inside wireParallax (dead code whenever the dispatcher exists,
  i.e. always -- globals is assembled before panels); the runtime Playwright
  probe confirms the actual registration count is 1 (base: 2). The parallax
  glass guard is PER-EVENT, not boot-time, so a live theme switch to
  glass-depth still gets parallax exactly like PM6.
- T08: on the usage page the local 1s ticker stands down ~2s after boot when
  the demo engine takes cooldown ownership (`cooldown.external`); the
  recurring hidden-DOM writer is `PM6_USAGE.setCooldown` (usage.tick, ~2s
  cadence), so its write is gated through the same helper + dirty flag as
  the ticker. Dashboard + usage flush on `page.changed` (the real bus event;
  PM_PAGES.go toggles `.active` before emitting, so flushes see an active
  page). Reveal-value equality verified: identical cooldown strings on both
  files under an identical scripted timeline.
- T09: buffer model VERIFIED on the base (`p.lines` state append capped at
  400 + `renderTranscript(body, p.lines)` rebuild), encoded as
  pre-assertions. Reveal paths that rebuild: revealSession/focusSession
  (already call renderAll), bottom-tab switch back to terminal
  (syncTerminalTabBar flush), and the #collapseBottom expand click
  (PM_TERMINAL_DEMO.pm7FlushIfDirty). A rebuild leaves scroll at the top,
  matching PM6's own renderAll paths (only live appends pin to bottom).
- T10 (measure-gated): 30s idle census parked on Settings measured
  usage.tick 16, demo.log 12, web.op 8, chat.card 7, term.feed 2,
  run.state 0. Only the dashboard `usage.tick` subscriber is wrapped in
  pm7PageGate (hot + snapshot-idempotent). The design's dashboard
  `run.state` candidate and panels `renderAgents` were SKIPPED as "not hot"
  (0 emissions/30s idle); event-semantic handlers (run.gate CTAs,
  usage.alert toasts, bottom term.feed/web.op appends) are excluded;
  the orchestrator was already page-gated upstream.
- T11: the JSON re-emit cannot sit at the literal's exact old position
  (inside the settings-js script block -- script tags do not nest); it is
  emitted as an application/json sibling immediately BEFORE the settings-js
  block, preserving document order (data precedes its single consumer,
  pm6SettingsBoot at DOMContentLoaded). Python-side deep-equal + 12
  categories/817 settings + script-data-safety asserted during the build.
- T12/T13/T14: SKIPPED with evidence recorded in the build report.
  T12: first PM6_CHAT_THREADS read is coincident with first paint
  (-1..+4ms over 6 probe runs, before paint in 2 of 6) -- post-first-paint
  access not proven. T13: timing alone passes (+89..+93ms) but the block is
  executable code mutating engine-shared PM_DEMO_TEXT.files with multiple
  independent read paths -- no safe chokepoint; default-skip stands.
  T14: all three candidate pages fail the eligibility audit (projects: boot
  does not re-render from snapshots -- onRunState(null) is a no-op; wizard:
  boot subscription fires a global toast on topic unlock, a cross-page side
  effect; usage: usage.tick handler does stateful ledger accumulation --
  deferred init would permanently drop rows). PM7_LAZY was NOT installed
  (zero registered pages would make it dead code).

## Egolite retained-contract source closure

The authored T46 systems source consumed by the current T48 tail now emits one
non-executable `application/json` projection with the exact fifteen retained
rows `HBU-005`, `HBU-013`, `BRW-010`, `BRW-011`, `SCM-005`, `SCM-019`,
`ORI-002`, `ORI-020`, `IRT-008`, `IRT-009`, `IRT-010`, `IRT-011`, `SEC-003`,
`SEC-007`, and `SEC-008`. It is browser-concept data only: it creates no
command, owner receipt, native handler, production wiring, runtime behavior,
security proof, benchmark result, or readiness claim. The projection keeps
AuthBrowserSession non-exportable and human-only, and labels actual network
effect checks as authoritative rather than URL-source scanning.

Validate the source and owner fixtures with the focused verifier in
`scratchpad/pm-integration-20260831/audits/egolite-exact-recheck/remediation/`.
Build only to a scratch outdir for static PM7 checking; do not promote
`Concepts/PMConcept7.html` as part of this closure.

## Status

CURRENT AUTHORED PIPELINE 2026-09-02: T33 through T48 are registered, with
separate T45 Product Onboarding and live-shell Guided Tour transforms and a
T46F forge/backup post-integration transform plus a T46P full-thread
performance transform; `T48_home_workspace_source_refresh`
is the current tail. `Concepts/PMConcept7.html` remains a generated artifact
and must be promoted only from `build_pm7.py` after the current working tail
stabilizes.

No final T48 promotion identity, Home workspace acceptance, all-theme visual
acceptance, consolidated film disposition, native Slint 1.17.1 implementation,
production runtime wiring, or readiness claim is made here. Working reports
remain evidence for their exact hashes and scopes only; failures and unresolved
native boundaries remain failures or residual risk until independently
repaired and rerun.

The older T41/T42 evidence under
`Plans/.audits/audit-20260829-001-pmconcept7-widget-followup/` remains historical
lineage for those exact predecessor hashes. It does not certify the T44-T48
Settings, Onboarding, Guided Tour, Doctor/systems, performance, or hover-tag
tail.
