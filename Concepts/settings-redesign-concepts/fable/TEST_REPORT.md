# Test Report — fable Settings bakeoff

Date: 2026-08-05. Environment: macOS, ConceptHub server (`python3 Concepts/ConceptHub/server.py --port 0 --no-browser --no-runtime-state`, OS-assigned port), in-app Chromium browser pane, isolated session scratchpad for all outputs. No test material was written inside this folder.

## Headline result

`python3 Concepts/ConceptHub/validate.py Concepts/settings-redesign-concepts/fable` — **passed** (run before and after the verification fixes). All four concepts plus the index load through the hub with zero console errors. One shared-data defect found during the build (banned "YOLO" sentence inherited from canonical inventory copy) was fixed during this pass; the upstream canon conflict is recorded in FINDINGS.md item 4 and IMPACT_REGISTER.json, not applied.

## 1. Static assertions (full folder)

| Check | Result |
|---|---|
| validate.py (manifest schema, folder/model name, per-page `data-concept-model="fable"`, bridge literals, temp-artifact ban, duplicate-model scan) | pass |
| `node --check` on all 11 JS files (7 shared + 4 concept) | pass |
| Emoji scan (all source files) | 0 hits (only `→` arrows in doc prose/comments, none rendered as UI copy) |
| Colored `border-left` status pattern scan (all CSS) | 0 hits |
| "YOLO"/"Yolo" in rendered copy | 0 after fix (remaining mentions are the conflict reports themselves in FINDINGS/IMPACT_REGISTER) |
| `concept-hub.json` + `IMPACT_REGISTER.json` parse | pass |
| Hub catalog discovery (`/api/catalog`) | topic "Settings Redesign" auto-created; model `settings-redesign:settings-redesign-concepts/fable` with 4 entries + workspace; width role page 760–2500; 0 warnings |

## 2. Functional smoke checks (sampled per plan §7)

Run once per concept unless noted; theme/width sampling points noted inline.

| # | Check | Where verified | Result |
|---|---|---|---|
| 1 | Search result opens correct category/subcategory/setting | C1 home search "concurrency" → section 7 loaded, running header "7.1 Goal Mode", focus flash on "Concurrent agents ceiling"; C2 palette "spell" → "General & Startup — Writing & spelling" with focus flash | pass |
| 2 | Scrolling changes active subcategory without oscillation | C1 running header + C3 outline chip ("1.1 Startup & windows") tracked scroll; deadband hysteresis in shared PMSpy (offset-cache math, not IntersectionObserver) | pass |
| 3 | Subcategory jump lands at stable offset | C1 deep link + C2 minimap jump (sticky-header topOffset respected) | pass |
| 4 | Provider refresh preserves last-known-good rows | "Refresh provider catalog" trigger (C4 States drawer) staged transition; C2 renders row-level shimmer on refreshing region only, rows stay solid | pass |
| 5 | Account selection affects future simulated requests only | "Use next" receipts state future-requests-only (C2/C3 builders' checks; receipt text verified in code) | pass |
| 6 | Model menu exposes effort and Normal/Fast only when supported | GPT-5.2 shows effort low/medium/high + Fast (menu stays open through both); Qwen3 Coder 30B shows neither (explicit unsupported evidence) | pass |
| 7 | Default/inherit/reset state unambiguous | C1 row: value chips (Custom / Effective: 2 / "Set here"), Reset to default affordance; C4 inspector: provenance + reset; no blank-means-auto fields observed | pass |
| 8 | Manager action returns visible simulated result or honest unavailable state | Receipts confirmed for connect/sign-in/setup/usage-deep-link across concepts (each concept's `simulated` list in FINDINGS) | pass |
| 9 | Spellcheck suggestions never replace text automatically | Assistant composer: "definately… teh…" → text unchanged, 2 underline decorations; suggestions only via menu | pass |
| 10 | Reduced motion reaches equivalent final states | Shell toggle stamps `data-motion="reduced"` + `data-reduced-motion="1"`; shared CSS kill switches zero durations and delays; C3's reduced mode designed first-class (instant sheet swap + spine step) | pass |
| 11 | Concepts remain visually distinct after theme changes | C4 in retro-light keeps the ledger skeleton with retro material (verified by screenshot); glass-light applied to C1 via hub bridge with layout unchanged | pass |
| 12 | validate.py | pass (final run after fixes) | pass |

## 3. Hub integration

- Previews load with `?hub=1`; full shell (title bar + status bar) visible in every preview iframe (rule 5).
- Bridge round-trip verified inside a hub preview: hub theme → `data-theme="glass-light"` in the iframe; hub PAGE WIDTH 900 → `--hub-test-width/--hub-page-width/--hub-viewport-width: 900px` stamped on the iframe root; `pm-concept-ready` handshake (hub resynced on load).
- Width control: topic adopted the manifest's role-page control (760–2500, presets 760/900/1280/1700/2200/2500).

## 4. Width / shell / theme sampling

- Layout inspected at ~800px effective width (narrow: C1 "Contents" drawer, C2 bottom-sheet minimap + icon rail with focus-reachable labels, C3 natively narrow, C4 overlay navigator + bottom-sheet inspector) and at 1440px desktop (C2 full three-region console with right-edge proportional minimap + viewport window). Shell rail/Assistant-panel toggles exercised; Assistant panel hosts the spellcheck composer.
- Themes: friendly-dark (default, all pages), retro-light (C4 full-page), glass-light (C1 via hub bridge). All 8 themes share the PM7-extracted token layer in `_shared/pm-shell.css`; theme flavor is token-level (material/typography/radius/border), semantic status language unchanged.
- Not exhaustively swept: the full 1,536-configuration cross-product (4 concepts × 8 themes × 2 motion × 6 widths × 4 shell combos) was deliberately sampled per the approved plan; the remaining combinations received static token/clip review only. This is a stated sampling bound, not a claim of full coverage.

## 5. Defects found and fixed

1. `_shared/pm-demo-data.js` carried the banned sentence "YOLO mode cannot skip this." (inherited verbatim from `Plans/settings_inventory.json`, which contains five "YOLO" occurrences). Fixed in the demo data ("No access mode can skip this."); c2's render-time sanitizer retained as defense-in-depth; canon conflict recorded in FINDINGS item 4 / IMPACT_REGISTER (not applied to Plans). Verified live in the rendered UI afterwards.
2. `c1-atlas.css` `.atlas-dir-purpose` was `display:inline`, so its intended `text-overflow: ellipsis` never applied and the longest directory row overflowed by up to 9px in wide-font themes at 760px. Fixed with `display:block`; all 8 themes re-swept clean.
3. `c1-atlas.js` free-route setup button said "1 steps" for single-step routes; pluralization fixed.

## 5a. Second (deep) verification pass — 2026-08-05

An automated **clipping sweep** (every `button/th/heading/chip/status/label/badge/title` element checked for `scrollWidth > clientWidth` across **all 8 themes**) was run per page at packet widths:

| Page | Widths swept (8 themes each) | Result |
|---|---|---|
| c1-atlas | 760, 1440 | clean (after fix 2) |
| c2-mission-control | 760, 1280 (incl. Crew console and rail+Assistant both open), 2200 | clean |
| c3-focus-stack | 760, 2200 | clean |
| c4-ledger | 760 (home + Context & Instructions manager) | clean except one *designed* truncation (below) |
| index | 1440 | clean |

Surfaces individually opened and verified in this pass (previously covered only by builder self-reports):

- **C2 Crew console:** requested 5 vs effective 2, queued waves, guards/reserve, thread-local note. **C2 Media routes console:** purpose/route assignment, native vs PM-transformed, fallback, safety, generation history. Station grid confirms the managers-primary thesis (three console cards; domains on the station rail).
- **C3 Personas:** roles incl. child-only, ceiling rule, capsule; definition → runtime → capsule as deeper sheets; the scope picker at spine depth 4 offers all six scopes ("This turn only / This conversation / This Goal run / Project default / Global default / Child agents only"). **C3 Terminal Profiles:** three profiles → detail sheet with a genuine live preview (sample output rendered from the profile's font/colors/cursor), 16-swatch ANSI palette, `Automatic`/`Inherited` value chips, cursor/retention/CWD rows. **C3 spellcheck:** full Normal block + Advanced block (technical prose, unknown names, packs, overrides) as sheets.
- **C4 Context & Instructions:** admitted/omitted-last-turn with reasons and token counts, AGENTS.md chain, persona footprint, selected-vs-installed tools. **C4 Skills/Plugins/Tools:** funnel stages, risk/approval, trust, lifecycle/failure.
- **C1 Memory appendix:** gists, verified/awaiting-review, evidence, pin, half-life-as-fades. **C1 MCP appendix:** transport, requested/negotiated protocol, health/reconnect, scope, lazy exposure, approval policy, logs. **C1 free-route stepper:** account → credential → verify → quota → return-to-row. **C1 marginalia column** confirmed at wide width (status/scope typeset in the margin, not trailing chips); the fixed always-ask-before-publishing copy verified in the rendered row.

**Recorded, deliberately not "fixed":** c4's compact record rows ellipsize paragraph-length values in the value chip (`max-width` + ellipsis); the full value is shown in the inspector on selection — this is the concept's record/inspector thesis (same gray-zone family as c3's two-line clamp; see FINDINGS item 7). Recents-strip labels ellipsize below the 760px supported floor.

## 5b. Compliance-audit round — 2026-08-05 (second session)

A three-auditor fresh-eyes pass verified the built artifacts requirement-by-requirement against packet files 00–06, the spellcheck contract, the fixed decisions, CONCEPT_RULES, and both prompts. It confirmed 26 gaps; all were fixed (or knowingly recorded in FINDINGS) and re-verified live:

- **Raw-enum leaks closed:** account-health vocabulary humanized in all four concepts ("Signed out", "Signed in, cannot run models", fallback "Unknown" — verified rendered on Copilot/Antigravity surfaces in every concept); `recommended` data hygiene (58 no-op recommendations deleted, 3 rewritten to real option members; verified 0 outside options, 0 equal-to-value).
- **Reduced-motion focus treatment restored:** the deep-link tint was animation-only and vanished under the three kill switches; a static background tint now applies in all three reduced-motion contexts.
- **Packet items added:** memory-manager library maintenance (rebuild+dedup, retention & redaction) plus gist edit and per-gist context-capsule preview (c1); catalog material-change notices, removed/no-longer-free history, and a quarantined-update state over last-known-good (data + rendered in c1/c2/c4); per-account last-catalog-refresh and last-successful-generation; repair/rescan/update-CLI/connection-logs controls; parent-agent-handoff and warn-before-route-change controls plus a compaction/cache strategy view with source hashes (c4); Goal reserve-policy, worktree provisioning, and port-collision settings; capability evidence completed to all 6 sources and all 7 states; Copilot demonstrates the single-login isolation model; crew test-resource isolation; terminal selection/opacity/paste/link/diagnostics; a **Commands & shortcuts manager** (c4-native table with conflict + resolution, inspector remap/reset, custom-command lifecycle; searchable via the shared index; other concepts route to honest receipts); the grammar/style separation row (off by default, privacy+cost flagged); spellcheck Normal view now reads `Automatic` with the three source options exactly per contract; the blank-number-means-auto row now carries an explicit Auto chip.
- **c2 thin spots:** rows now render scope words and recommended/attention status words; motion staging added for view/category replacement, palette open, drawer expansion, and the narrow bottom-sheet (one-shot, reduced-motion collapsed).
- **Layout fixes at packet widths:** c1 nav tree widened (330px) so the longest section title no longer ellipsizes in wide-font themes; c4 gains a concept-specific collapse threshold (`narrowAt: 1120` via a new PMShell option) because its three fixed columns cannot honestly fit 900px — at 900 it now runs its drawer + bottom-sheet layout; c3's sheet push settles via a timeout fallback as well as rAF (interrupted-motion robustness; rAF never fires in hidden tabs).
- **Width grid completed:** the theme×clip sweep now covers 900 / 1700 / 2500 on c1, c2, c3, c4 (both its narrow and forced-wide layouts), and the index (900/2500), in addition to §5a's 760/1280/1440/2200 — all clean.
- **Keyboard/focus sanity (packet §06):** theme menu opens per concept and Esc closes it; C2 palette drives by ArrowDown/Enter/Esc; States drawer is a roving-focus radiogroup with Esc; all interactive elements are native buttons/inputs (129 focusables on c1, zero non-standard tabindex values); C2's icon-only narrow rail labels are focus-reachable. Structural pass — a human screen-reader pass remains future work.

## 5c. Recorded-item resolution round — 2026-08-05 (third session)

The four items previously "recorded rather than fixed" were built/fixed and verified live:

1. **Language servers manager (was the unclaimed group-B manager):** built as c1's Appendix D — humanized server states (Running / Detected / Not installed / Stopped, no raw slugs), language coverage, executable (explicit "Auto-detected" value, never blank), version with provenance ("found on PATH"), scope, startup mode, capabilities, conflict cautions (verified: the TypeScript server's Prettier-ownership caution renders), formatting/diagnostics ownership facts, restart/install receipts, per-server log drawers, and a D.2 ownership table. Reachable from the home directory, the TOC, search (`manager.lsp` routes natively in c1), and notices; c2/c3/c4 route it to honest cross-concept receipts naming Atlas.
2. **MCP manager completed:** discovered resources/templates per server (honest "No resources discovered yet." empty state on the unreachable server), an extensions list, discovery-cache freshness lines (fresh/stale with notes), provider/CLI projection notes, and an "Add a server" flow (transport + name) ending in an honest simulated receipt. All verified rendered in Appendix C.
3. **c3 description clamp removed:** row descriptions wrap fully (computed line-clamp none, no height clipping — verified); only the sheet-title two-line clamp remains, which never truncates at supported widths per the sweeps.
4. **c4 value chips wrap:** paragraph-length values render whole in record rows (verified: the 77-character Planning-phase-rules value shows fully wrapped, `white-space: normal`), including the home-table value column and the inspector precedence chain; ellipsis survives only on descriptions/labels.

`node --check` clean on all JS after the round; `validate.py` passes on the final state.

## 6. Known limits of this report

- Interaction verification was scripted DOM-driving plus screenshots, not a human pass; transient motion (focus-flash decay, sheet push choreography) was verified by state and end-condition rather than frame-by-frame.
- Per-concept honest gaps (deliberate simulations, per-concept compromises) are enumerated in FINDINGS.md — notably: non-assigned managers are compact/receipt surfaces per the manager assignment matrix; C3's two-line description clamp; the shell-titlebar-plus-topmost-sheet double blur in glass themes (FINDINGS items 7–8).
- Google Fonts require network; on blocked networks pages fall back to system fonts by design.

## 7. How to reproduce

```bash
python3 Concepts/ConceptHub/server.py --port 0 --no-browser --no-runtime-state
# open the printed port, choose the "Settings Redesign" tab, model fable
python3 Concepts/ConceptHub/validate.py Concepts/settings-redesign-concepts/fable
```

Use each page's States drawer (bottom right) for scenarios (baseline / calm / attention heavy / usage exhausted / invocation failed / managed workspace) and transient triggers (catalog refresh, reconnect, invocation test).
