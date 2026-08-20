<!-- SEVEN_NEW_CONCEPTS_2026_08_18 -->
# 5.6 Sol — Settings redesign concepts

This folder contains **eleven unranked Settings concepts**. Concepts **01–04 remain frozen historical work**. Concepts **05–11 are seven complete Settings systems built from the selected reference architectures and finalized by the 2026-08-19 exhaustive visual/motion audit.** No winner is selected.

## Final certification status

- **7/7 new concepts passed** with no open blocker, major, or minor finding.
- **5,796/5,796 canonical setting destinations** rendered.
- **112/112 declared search routes**, **1,344 rendered search results**, **329/329 manager routes**, **714 manager-tab renders**, **546 manager-object renders**, and **63/63 browser interaction cases** passed.
- **1,904 distinct destinations** were reviewed at 760 and 1700 px through **7,173 screenshots** and **56 contact sheets**.
- **336/336 theme-width cells** passed across eight themes and six widths, with **1,680 representative surface captures**.
- **98/98 real Chromium compositor sequences** passed across **2,145 observed frames**.
- Concepts 01–04: **49/49 frozen files unchanged**.

| # | Concept | Distinctive system | Status |
|---:|---|---|---|
| 01 | Index House | Frozen original | Frozen |
| 02 | Switchboard | Frozen original | Frozen |
| 03 | Wayfinder | Frozen original | Frozen |
| 04 | Ledger | Frozen original | Frozen |
| 05 | Meridian Directory / Take 1 | Crisp spatial directory | Final pass |
| 06 | Editorial Directory / Take 2 | Editorial list and stable rail | Final pass |
| 07 | Atlas Compendium Workspace | Faceted long-tail compendium | Final pass |
| 08 | Horizon Directory / Take 3 | Spacious destination dashboard | Final pass |
| 09 | Chapter Tabs | Rethemed layered chapter system | Final pass |
| 10 | Command Suite | Rethemed keyboard-first multi-pane system | Final pass |
| 11 | Layered Tab Organizer | Rethemed tab-and-sheet organizer | Final pass |

The seven new concepts share only headless inventory, search, state, and manager semantics. Their Home composition, navigation, manager presentation, search dropdown, exact-result reveal, narrow transformation, and motion remain concept-native.

Primary final evidence:

- `PACKET_COMPLIANCE_MATRIX.json`
- `SEVEN_NEW_CONCEPTS_TEST_REPORT.md`
- `SEVEN_NEW_CONCEPTS_FINDINGS.md`
- `SEVEN_NEW_CONCEPTS_AUDIT_REPORT.md`
- `SEVEN_NEW_CONCEPTS_VISUAL_AUDIT.json`
- `SEVEN_NEW_CONCEPTS_IMPACT_REGISTER.json`
- `_seven/SEVEN_NEW_CONCEPTS_QA.json`
- `_seven/ALL_INVENTORY_ROUTE_AUDIT.json`
- `_seven/FINAL_CONTRACT_AUDIT.json`

The certification is for the HTML/Chromium concept implementation. It does not claim a native Slint build or physical legacy-hardware benchmark.
<!-- END_SEVEN_NEW_CONCEPTS_2026_08_18 -->

# 5.6 Sol — Puppet Master Settings correction

This folder contains four unranked, concept-only Settings directions for the `5.6 Sol` bakeoff. No winner is selected. Nothing here edits or claims authority over PMConcept7, canonical `Plans/**`, the Settings inventory/schema, the command catalog, production wiring, DRY owners, Usage, Assistant Chat, ConceptHub, or another model folder.

The 2026-08-13 correction is material. The original packet omitted the full Performance decision register and mispathed the provider-CLI adjudication. The correction authorities were opened in their required order, the original entry/coverage/GUI/impact authorities were reopened, and the current implementation and tests were inspected. The omission affected all four concepts because they share the Settings data, state, runtime-projection, provider, rendering, motion, and verification layers. It also required corrections to every concept's manager and candidate-impact artifacts.

## Concepts — distinct and unranked

| Concept | Preserved design thesis | Manager emphasis | Motion character |
|---|---|---|---|
| **Index House** | Stable-address archive for settings, provenance, memory, policy, and delegated behavior. | Providers; Context & Instructions; Memory; Personas; Goal & Automation; Crew; Permissions & FileSafe; Back Seat Driver. | Editorial address transfer, staged directory-to-record arrival, localized evidence crossfades, and restrained archival depth. |
| **Switchboard** | Quiet operational surface for readiness, notification, appearance, input, desktop, and help behavior. | Providers; Notifications & Sounds; Appearance; Spellcheck; Desktop; Teacher & Help. | Signal routing, latching state, local preview choreography, and transactional confirmation without permanent ambient motion. |
| **Wayfinder** | Guided toolchain route with explicit setup, verification, dependency, and recovery checkpoints. | Providers; File Manager; Terminal; LSP; Formatters; Commands & Shortcuts; MCP; Skills; Plugins; Tools; Testing & Debugging. | Route resolution, checkpoint progression, branch disclosure, and clear recovery movement. |
| **Ledger** | Dense requested/effective and provenance folio for lifecycle, storage, source, and runtime systems. | Providers; Storage & Retention; Backup & Restore; Settings Lifecycle; History & Sessions; Runtime Artifacts; Source Control & Worktrees; GitHub Actions; Containers & Registries; Web/Search/Fetch; Project Search Index; Workspace Cleanup; missing-owner, inspect-only Server insertion. | Folio arrival, compact reflow, rule draws, comparison emphasis, and receipt-oriented transitions. |

Shared product semantics support fair comparison; they do not collapse the concepts into one visual composition.

## What the correction changed

1. **Sole runtime owners.** `RuntimeResourceGovernor` is the only resource-policy/admission owner represented by the concepts. Host enforcement consumes that contract and is not a second governor. `ObservableWork` is the only truthful progress/wait owner; cards and rows only project its state. The exact permit outcomes are `admitted`, `queued`, `admitted_degraded`, `blocked_permission`, `blocked_resource`, and `cancelled`.
2. **Compact startup and lazy detail.** Home and search consume compact metadata from `_shared/data-core-values.mjs`. Selected manager data is loaded through the dynamic `_shared/data-details.mjs` module. Startup does not probe every provider, tool, Server, or resource, and compact search does not hydrate manager payloads.
3. **Bounded UI work.** Manager detail caches are byte-bounded and evict inactive entries; heavy subscriptions are reference-counted and released when inactive; virtual list windows mount at most 40 rows; stale hydration generations fail closed; persistence is compact, debounced, byte-limited, and skips transient search/focus/scroll/loading state; render work uses frame-coalesced narrow patches and exposes concept-only counters.
4. **Truthful state.** Work projections distinguish accepted, queued, active, wait, degraded, stalled, terminal, cancellation, and recovery states. Determinate progress is shown only with a trustworthy denominator and a non-unknown source. Cached content remains visible where the fixture says it is safe to do so.
5. **Provider first-acquisition policy.** Provider CLIs are not bundled, baseline-preseeded, silently installed, or first-acquired through Project/model/provider/Goal/Plan/WorkNode/agent/`Auto`/`On` demand. The user must explicitly review the official source and exact Host/Environment, consent to setup, and authenticate separately. Existing-install selection, request coalescing, setup continuation currentness, generation identity, rollback, and post-consent maintenance are represented independently.
6. **Human identity before implementation identity.** Normal provider rows show provider, human Host/Environment, readiness, version, selection, and the next safe action. Raw paths, shims, package roots, hashes, and procedure identities are reserved for **Advanced Details**.
7. **Pressure and motion.** Deterministic legacy CPU, low-memory, slow-disk, poor/offline/metered-network, thermal/Low Power, and large-catalog profiles project requested/effective degradation without claiming physical-hardware results. Decorative clocks stop when hidden or inactive; the sound meter runs only during an active preview; reduced motion preserves semantic state.
8. **Coverage and impact artifacts.** All four concepts now carry a complete 47-row classification matrix and corrected candidate command, wiring, DRY, Plan-owner, and impact artifacts. The exact canonical Server owner remains unresolved, so that row is missing/fail-closed and its mutation surface is disabled.

## Current shared architecture

The implementation is deterministic concept evidence, not production runtime evidence.

- `_shared/data.mjs` re-exports the compact core and dynamically obtainable detail contracts.
- `_shared/data-core-values.mjs` contains the compact startup/search projection: 148 baseline rows plus a deterministic 825-row scale fixture.
- `_shared/data-details.mjs` owns detailed manager payloads loaded only for the selected surface.
- `_shared/runtime-contracts.mjs` contains concept-only `ObservableWork`, `RuntimeResourceGovernor`, subscription, pressure, and progress projections.
- `_shared/state.mjs` owns generation-aware hydration, cache/subscription/list-window bounds, compact persistence, provider setup/continuation, deterministic pressure profiles, and state transitions.
- `_shared/view.mjs` renders human summaries, Advanced Details, truthful work/wait state, retained cached values, and bounded lists.
- `_shared/app.mjs` coalesces events into narrow render scopes and releases inactive/hidden work.

Provider, resource, host, pressure, and external-operation records are deterministic fixtures. They are not live-machine discovery, real provider state, or execution authority, and raw runtime/resource state is excluded from the compact model-prompt projection.

## Manager completeness

Each `manager-coverage.json` classifies the same 47 source families using the closed vocabulary `demonstrated`, `shared_grammar`, `deferred_named_owner`, or `missing`.

| Concept | Demonstrated | Shared grammar | Deferred named owner | Missing | Total |
|---|---:|---:|---:|---:|---:|
| Index House | 13 | 29 | 3 | 2 | 47 |
| Switchboard | 12 | 30 | 3 | 2 | 47 |
| Wayfinder | 16 | 26 | 3 | 2 | 47 |
| Ledger | 16 | 26 | 3 | 2 | 47 |
| **All cells** | **57** | **111** | **12** | **8** | **188** |

The three named deferred rows in each concept are Puppet Master app/content updates, Product Onboarding, and Doctor. They are insertion/navigation contracts only and do not invent those owners' state machines. The two missing rows retain separate traceability for the original Future Server Module Shell family and the correction's Server insertion family. Both map to inspect-only, mutation-blocked, fail-closed surfaces because the exact canonical Server owner remains unresolved; they do not create two Server engines.

## Evidence status

- State contract: **22/22 passed**.
- Render contract: **12/12 passed** for pure state-to-string and CSS source contracts only.
- Syntax: **14/14 `.mjs` files passed `node --check`**.
- JSON: **23/23 JSON files parsed with `jq -e`**.
- ConceptHub structural validation: **passed**.
- Diff whitespace/error check: **passed**.
- Compact-data generator consistency: **passed**.
- Firefox W3C harness: implemented without a Playwright product/runtime dependency, but this host blocks Firefox session creation because `unshare(CLONE_NEWPID)` returns `EPERM`. The final attempt ran **0 browser product assertions** and cleanup completed.
- Native Slint and physical hardware: **not run and not proven**.

Node state/render-contract and CSS/static evidence apply to the deterministic HTML implementation only. They do not become Firefox/browser evidence, native Slint evidence, or physical Ivy Bridge/Xeon/CPU/RAM/disk/network evidence.

See `FINDINGS.md`, `TEST_REPORT.md`, `IMPACT_REGISTER.json`, and `reference-review-report.json` for the causal findings, exact verification ledger, aggregate impacts, custody receipts, and named residual risks.
