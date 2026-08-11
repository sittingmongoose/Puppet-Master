# Rolling Trial Pilot Family Briefs

These are common-visible starting facts for a future read-only method trial. They are not a claim that the current Plans satisfy the controls. Each pilot is risk tier `R3` for the trial. Open external exploration may add, challenge, refine, or reject obligations; it must not be constrained to these seeds.

`ACCESSIBILITY_CONTROL_CONTRACTS` is deliberately a **revealed known-answer realization calibration** derived from lessons exposed after F3. It tests answerability, named-instance compilation, loss attribution, and cargo-cult rejection; it is excluded from independent-discovery efficacy and from scale inference about rediscovery. F3 benchmark/oracle/source files remain outside every semantic-role packet. The other three pilots provide the novel rolling-method signal.

The fourth pilot is **migrations and durable state evolution**, not authentication. Migration adds a distinct irreversible-state, crash-recovery, replay, and data-loss risk family. Usage and web already exercise substantial account, provider, permission, and identity seams.

## 1. `USAGE_ACCOUNTING_TRUTH`

### Scope

Truthful token, cost, quota, attribution, settlement, and provenance behavior from provider event through every user-visible and machine consumer.

### Live evidence seeds

- `Plans/usage-feature.md` (`UF-074`, `UF-085`, `UF-086`, `UF-087`, `UF-088`)
- `Plans/Contracts_V0.md`
- `Plans/storage-plan.md`
- `Plans/Runtime_Artifacts_Panel.md`
- `Plans/runtime_artifact_cost_usage.schema.json`
- `Plans/Multi-Account.md`
- `Plans/Models_System.md`
- `Plans/FinalGUISpec.md`
- `Plans/assistant-chat-design.md`
- `Plans/Widget_System.md`
- `Plans/UI_Command_Catalog.md`
- `Plans/Wiring_Matrix.production.json`
- `tests/fixtures/usage_gui/golden/usage_gui_acceptance_fixtures.json`
- `scripts/pm-plans-verify.py` (`validate-usage-gui-fixtures`, `validate-usage-contract-drift`)

### High-risk promises and surface seeds

- Preserve missing, unsupported, disabled, stale, unknown, provider-reported zero, estimated, partial, settled, and adjusted states.
- Prevent double-counting across retry, abort, cache, reasoning, and provider-inclusive totals.
- Preserve provider/model/route/account/attempt/run/thread/node/tool/source-confidence/pricing lineage.
- Never display hidden BYOK/subscription cost as known zero or invent quota/window authority.
- Bind the Usage page, widgets, chat context/detail, Ledger usage rows, Runtime Artifact `cost_usage`, Run Graph, Orchestrator, provider/account/settings rows, refresh/export controls, and route-to-subject controls.

Command/control seeds include `catalog.usage_refresh`, `catalog.usage_export`, `catalog.nav_open_usage_subject`, `catalog.artifacts_show_in_usage`, `catalog.artifacts_show_in_ledger`, and `catalog.account_select_profile`.

### Creative research directions

Explore official provider streaming/usage/quota/pricing contracts, SDK payload parsers and tests, retry/aborted-stream/null-versus-zero/settlement incidents, coding-agent usage interfaces, and direct comparators. Follow adjacent ideas from payment ledgers, cloud cost explorers, telecom metering, and observability. Record surprising user-trust improvements and rejected ideas. If no concrete incident evidence emerges, trigger the one bounded failure-evidence recovery worker.

### Common-visible controls

- `USG-C01`: missing usage remains distinct from provider-reported zero.
- `USG-C02`: aborted partial stream plus retry/resume is deduplicated while preserving forensic partial state.
- `USG-C03`: inclusive cache/reasoning totals are never added twice.
- `USG-C04`: estimate → settled → adjusted transitions preserve authority and history.
- `USG-C05`: BYOK/subscription-hidden cost is unknown/hidden, never `$0.00`.
- `USG-C06`: drill-through/export resolves the same `UsageRecord` and bridge refs.
- `USG-C07` negative: reject an authoritative “remaining quota” display without provider evidence.
- `USG-C08` negative: reject coercing missing/null/unknown usage to zero.

### Explicit non-goals

No runtime implementation, provider-accuracy certification, universal pricing authority, demo-data promotion, feature-local competing cost model, or canonical edit.

## 2. `WEB_RESEARCH_BEHAVIOR`

### Scope

Provider-pluggable search, read, extract, research, deep research, crawl, map, fetch, citation, permission, provenance, fallback, and closure behavior across user- and agent-initiated entry points.

### Live evidence seeds

- `Plans/Tools.md` (§3.5D)
- `Plans/web_operation_contracts.schema.json`
- `Plans/web_provider_adapter_registry.seed.json`
- `Plans/web_provider_projection_fixtures.json`
- `Plans/web_operation_card_fixtures.json`
- `Plans/web_operation_job_fixtures.json`
- `Plans/web_agent_policy_fixtures.json`
- `Plans/web_research_run_fixtures.json`
- `Plans/web_intent_routing_fixtures.json`
- `Plans/web_policy_negative_fixtures.json`
- `Plans/web_policy_negative_fixtures.schema.json`
- `Plans/web_capability_findings_coverage.json`
- `Plans/web_capability_source_packet_receipt.json`
- `Plans/Permissions_System.md`
- `Plans/Commands_System.md`
- `Plans/UI_Command_Catalog.md`
- `Plans/assistant-chat-design.md`
- `Plans/Planning_Wizard.md`
- `Plans/PRD_Builder.md`
- `Plans/Goal_Runtime_System.md`
- `Plans/Automated_Testing_System.md`
- `scripts/pm-plans-verify.py` (`validate-web-capability-contracts`)

### High-risk promises and surface seeds

- Final answer and research-synthesis claims derive from content actually read/extracted. Visibly labeled snippet-only source/activity evidence may remain as a degraded provenance state when no deeper read occurred; it cannot support a final synthesized claim.
- Provider selection, fallback, cache freshness, partial/timeout/unavailable results, permissions, egress, robots, SSRF/private-host denial, and invocation provenance remain visible.
- Research closure exposes unresolved subquestions, failed access, and residual uncertainty.
- Secrets do not enter research artifacts and provider-native autonomy cannot bypass PM bounds.
- Bind assistant activity/source cards, `/web`, `catalog.chat_web_research`, Planning Wizard/PRD/Goal research, WebOperation job/progress cards, provider/permission settings, Site Reader/browser sessions, and research evidence artifacts.

### Creative research directions

Explore official provider/browser contracts, real reader/crawler source and tests, citation and prompt-injection failures, robots/SSRF/dynamic rendering/PDF/OCR/rate-limit/provider-drift incidents, and comparable research UX. Follow adjacent lessons from digital forensics, investigative journalism, systematic reviews, and reproducible science. Record better mental models and explicitly rejected approaches. Trigger failure recovery if the open pass remains documentation-only.

### Common-visible controls

- `WEB-C01`: every final answer or research-synthesis citation resolves to a read/extract receipt; visibly labeled snippet-only source/activity evidence is permitted only as degraded provenance and cannot close the claim.
- `WEB-C02`: mid-run provider failure discloses fallback, effective provider, and provenance.
- `WEB-C03`: SSRF/private-host or permission denial occurs before fetch.
- `WEB-C04`: dynamic-page browser interaction is bounded and disclosed.
- `WEB-C05`: partial/timeout retains acquired sources, progress, and truthful closure reason.
- `WEB-C06`: Planning Wizard research preserves invocation and source identities without creating runtime/build authority.
- `WEB-C07` negative: reject provider-native autonomy that bypasses bounds, permissions, or citation rules.
- `WEB-C08` negative: reject snippet citation + silent fallback + false `sufficient` closure.

### Explicit non-goals

No permanent provider selection, browser/network implementation, live-provider certification, source-count quality metric, uncited autonomous synthesis authority, or canonical edit.

## 3. `ACCESSIBILITY_CONTROL_CONTRACTS`

### Scope

Determine whether selected **named production controls** have concrete accessibility, keyboard, focus, state, command, effect, and test semantics rather than only generic accessibility prose.

### Live evidence seeds

- `Plans/FinalGUISpec.md`
- `Plans/UI_Wiring_Rules.md`
- `Plans/Wiring_Matrix.production.json`
- `Plans/Wiring_Matrix.schema.json`
- `Plans/Wiring_Matrix.md`
- `Plans/UI_Command_Catalog.md`
- `Plans/PMConcept_Control_Reconciliation.json`
- `Plans/Wiring_Matrix.production.exclusions.json`
- `Plans/GUI_Rebuild_Requirements_Checklist.md`
- `Plans/Automated_Testing_System.md`
- `scripts/pm-plans-verify.py` (`validate-wiring-matrix`)

### High-risk promises and surface seeds

- A generic pattern or command row cannot close a named physical control.
- Each selected control needs stable identity, role/name/state, keyboard/focus behavior, command/handler/effect, disabled reason, receipt/event, failure/recovery semantics, and a named automation oracle.
- Selection differs from activation; disabled reasons and asynchronous state changes are nonvisually discoverable.
- Text/caret/selection/speech/braille behavior and assistive-technology-on large-list latency are either concretely tested or evidence-backed as not applicable.
- Current wiring validation is non-executable specification evidence, not rendered/runtime proof.

Named seeds include Planning Wizard `Approve And Build`, Source Control Worktrees `ListView`, account profile selector, Usage refresh/export, Web Research activity/command, Permissions rule controls, Orchestrator tabs/menus/disclosures, a large virtualized list, and a production multiline editor if applicability is proven.

### Creative research directions

Explore current Slint accessibility contracts/source/tests/issues, platform accessibility bridges, W3C APG, AccessKit, NVDA/JAWS/VoiceOver/Orca reports, caret/selection/braille/repeated-value/focus/large-list latency failures, comparable Rust-native GUI implementations, accessible IDE workflows, and alternative nonvisual representations. Seek improvements rather than only standards parity.

### Common-visible controls

- `A11Y-C01`: exact `planning.wizard.final_review.approve_and_build` and `cmd.planning_wizard.approve_and_build`—role/name, discoverable disabled reason, stale/CAS announcement, focus return, guarded command, atomic receipt/run identity, duplicate idempotency.
- `A11Y-C02`: exact Worktrees `ListView`—stable row IDs, concrete composite role/model, outer and internal keys, selection versus activation, status announcements, disabled reasons, AT-on scale/latency behavior.
- `A11Y-C03`: named tab/menu/disclosure state semantics and deterministic focus restoration.
- `A11Y-C04`: text-input applicability gate; when applicable, require a pinned caret/selection/speech/braille task matrix.
- `A11Y-C05`: representative large-list dataset, pinned platform/AT tuple, and key-to-announcement latency threshold.
- `A11Y-C06` negative: reject role/label metadata alone when behavior, command, state, effect, and test evidence are absent.
- `A11Y-C07` negative: reject visual-only focus/contrast screenshots as nonvisual behavior proof.
- `A11Y-C08` negative: reject generic composite/action templates as named realization.

### Explicit non-goals

No WCAG/assistive-technology certification from prose, Slint implementation/fix, exhaustive audit of every control, PMConcept DOM promotion, generic-template closure, or conflation of visible label with accessible name.

## 4. `MIGRATIONS_DURABLE_STATE`

### Scope

Event-record and storage migration across schema evolution, replay, crash recovery, atomic promotion, corruption, backup, locking, and consumer projection.

### Live evidence seeds

- `Plans/storage-plan.md`
- `Plans/Contracts_V0.md`
- `Plans/event_record.schema.json`
- `Plans/storage_value_registry.json`
- `Plans/storage_value_registry.schema.json`
- `Plans/Release_Supply_Chain.md`
- `scripts/pm-implementation-readiness.py`
- `Plans/.implementation_readiness/non_executable_closure_evidence.json`
- `Plans/.implementation_readiness/readiness_blockers.jsonl`
- `tests/fixtures/runtime_artifacts/golden/runtime_artifact_fixtures.json`
- `tests/fixtures/goal_runtime_events/golden/minimal_goal_events.json`
- `scripts/pm-plans-verify.py`

### High-risk promises and surface seeds

- Preserve data and ordering; unsupported future schemas fail/quarantine rather than being guessed.
- The append-only segment log remains canonical; redb/Tantivy/JSONL projections remain rebuildable and never become alternate truth.
- Migrations are versioned, idempotent, forward-only, additive-first, backup-before-write, temp-write/fsync/atomic-promote aware, and restartable from a committed checkpoint.
- Corrupt-tail recovery removes only bytes after the last verified record.
- Legacy `EventEnvelopeV1` is read-only input normalized before canonical write; canonical writers never emit it.
- Lock conflict or unsafe filesystem conditions fail closed into a visible read-only state.
- Bind the EventRecord append/replay path, legacy upgrader, projection checkpoint, storage-value migration, startup/recovery state, backup/restore artifact, corrupt-tail diagnostic, and read-only viewer fallback.

### Creative research directions

Explore official redb/MessagePack/schema-evolution guidance, event-sourcing upcasters, real partial-write/crash/lock/downgrade/rolling-upgrade/silent-data-loss incidents, shadow reads and successor events, cross-platform filesystem atomicity, Rust event-store issues/tests, and adjacent lessons from financial ledgers and distributed logs. Trigger failure archaeology if no concrete corruption/data-loss evidence emerges.

### Common-visible controls

- `MIG-C01`: legacy envelope upgrades exactly once, records migration lineage, and canonical writer emits only `EventRecord`.
- `MIG-C02`: unsupported future schema is rejected/quarantined before projection while original bytes remain preserved.
- `MIG-C03`: crash after backup/temp write but before promotion resumes or rolls back deterministically without half-migrated write authority.
- `MIG-C04`: corrupt segment tail truncates only after the last verified record without reordering.
- `MIG-C05`: replay duplicate returns the original idempotent result without repeating effects.
- `MIG-C06`: lock conflict or unsafe filesystem enters disclosed read-only mode; no second writer.
- `MIG-C07`: forbidden secret-bearing legacy fields are rejected/redacted and never persisted.
- `MIG-C08` negative: reject generic “forward compatible” prose without a named transition, invariants, recovery, and consumer effects.
- `MIG-C09` negative: reject restoring a disposable projection as canonical truth.

### Explicit non-goals

No migration runner implementation, destructive user-data migration, schema changes, downgrade promise, deferred-family certification, redb promotion to source of truth, validator-as-runtime-proof claim, governance edit, or canonical edit.

## Shared named-scenario and control rules

Every control is answerability-qualified against the frozen common-visible `SurfaceInstanceLedger` before scoring. Missing common-visible identity is `CONTROL_UNANSWERABLE`, not a hidden Plan miss. A template may receive reusable-pattern credit but exactly zero named-instance realization credit.

Each positive or research-generated scenario binds exact actor, entrypoint, journey, surface, control/command/event/data identities, initial state, ordered steps, allowed/forbidden transitions, concurrency/retry/restart conditions, permission and authority, failure/recovery, consumer truth, observability, deterministic oracle, builder-discretion boundary, and obligation edges. Component results remain separate: identity, actors/entrypoints, surface/consumer, lifecycle, authority, failure/recovery, persistence, accessibility/user truth, wiring, observability/currentness, oracle, and discretion.

Negative controls test cargo-cult rejection. Research may create additional common-visible scenarios from surprising failures, alternatives, or user-enhancing ideas. These scenarios freeze before detailed Plan comparison, and their adoption/rejection/conditional disposition remains visible. There is no novelty quota.
