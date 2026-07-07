# P0/P1 Buildability Repair Plan — FABLE 20260706 Currentness Triage

Generated: 2026-07-07T11:56:40Z
Updated: 2026-07-07T18:49:00Z for storage/coordination canon repair and platform_specs authority repair.
Updated: 2026-07-07T19:36:27Z for platform_specs closure hardening and non-provider residue adjudication.

Scope: triage plus bounded storage/coordination canon repair and platform_specs authority repair. FileSafe, tier vocabulary, UI command catalog, wiring matrix, Goal Runtime, Executor Protocol, broad Contracts_V0 gaps, missing docs, and broad PlanUnit boilerplate remain out of scope.

## Current Buildability Reality

- `Plans/.implementation_readiness/buildability_gate_report.json` currently reports `buildability_gate_passed=False` and `Approve And Build` enabled=False while runtime lifecycle and clean-room harness blockers remain open.
- Live wiring metrics still show `179` generic `Cataloged GUI surface` rows, `323` rows with no events, `99` placeholder `*.command_applied` rows, and `35/459` rows with both a real location and non-placeholder event.
- Therefore this plan treats current governance validation as insufficient buildability proof where the live P0/P1 evidence below remains unresolved.

## Dependency Order

10. `fable-20260706-p0-storage-coordination-canon-file-vs-seglog-redb` — **repaired_current** — Closed by `STORAGE_COORDINATION_CANON_REPAIR.md` and `storage_coordination_canon_repair_report.json`; active canon now names coordination EventRecord families, redb projections, append/CAS semantics, and debug/export mirror-only `.puppet-master/state/*.json` disposition.
20. `fable-20260706-p0-platform-specs-authority-drift` — **repaired_current** — Closed by `PLATFORM_SPECS_AUTHORITY_REPAIR.md` and `platform_specs_authority_repair_report.json`; Models_System now owns context-window, max-token, fallback-chain, provenance, and requested/effective capability fields, Contracts_V0 only carries snapshot refs, and Assistant Chat no longer uses legacy platform_specs functions as active authority.
30. `fable-20260706-p0-gui-toolkit-truth-spec-lock-vs-final-gui` — **repaired_superseded** — Closed by `GUI_PLATFORM_CURRENTNESS_REPAIR.md` and hardened by `GUI_PLATFORM_HARDENING_REPAIR.md`; active canon now pins Slint 1.17.1, Slint/WASM canvas web bootstrap limits, native Rust + Slint `.slint` markup, and `validate-gui-asset-policy` governance coverage.
40. `fable-20260706-p0-tier-vocabulary-and-subagent-config-canon` — **owner_decision_required** — Tier-era config and iteration wording remain live beside node/package/seam/lane canon.
50. `fable-20260706-p0-filesafe-fail-open-and-allowlist-security` — **partial_current** — FileSafe still preserves fail-open and prefix-match source snippets while later rows attempt to demote them to source-lineage.
110. `fable-20260706-p1-ui-command-catalog-missing-families` — **confirmed_current** — Core UI command families remain absent, including cmd.chat.send and theme/persona/alert/concern/model command families.
120. `fable-20260706-p1-wiring-matrix-preimplementation-and-placeholder-events` — **confirmed_current** — Production wiring matrix still has 179 generic locations, 323 rows without events, 99 placeholder command_applied event rows, and 35/459 fully located+evented rows.
125. `fable-20260706-p1-launch-approval-chain-preimplementation-proof` — **partial_current** — Launch/approval chain is partially current: PRD and Approve And Build rows now have real events/locations, but runtime.approve and plan_compile.open_build still use placeholder events/pre-implementation evidence while buildability gate is enabled.
130. `fable-20260706-p1-contracts-v0-open-enums-field-drift` — **partial_current** — Contracts_V0 still has open wake_reason ellipsis and safe_point.created field drift; blocked_reason/auth handling remains suspect.
140. `fable-20260706-p1-goal-runtime-event-payload-minima` — **partial_current** — Goal/GoalRun catalog now has a shared envelope and family-specific payload minima for only selected events; the remaining event names still lack per-event payload contracts.
150. `fable-20260706-p1-executor-wake-reasons-and-coalescing-missing-owner-section` — **confirmed_current** — Executor_Protocol still references a missing Wake reasons and coalescing section six times.
160. `fable-20260706-p1-missing-referenced-docs-and-openrefs` — **confirmed_current** — Several normative referenced docs remain absent; corrected false alarms are separately suppressed.
170. `fable-20260706-p1-progression-gates-registry-and-run-gates-coverage` — **partial_current** — GATE-007 and GATE-008 still do not exist; run-gates is named-check based and does not prove every gate ID is wired or manually dispositioned.
180. `fable-20260706-p1-planunit-layer-behavioral-acceptance-dependencies` — **confirmed_current** — PlanUnit layer still relies heavily on migration-preservation acceptance and sparse dependency/unblocks metadata.

## Owner-Grouped Repairs

### Plans/orchestrator-subagent-integration.md
- `fable-20260706-p0-storage-coordination-canon-file-vs-seglog-redb` (P0, Critical, repaired_current): FABLE P0 #1 is closed by `STORAGE_COORDINATION_CANON_REPAIR.md`; OSI-271 and related coordination units now retire file-based canon, and `OSI-432` names the canonical event/projection/mirror contract.
  - Repair target satisfied: `active-agents.json`, `agent-messages.json`, and `.puppet-master/state/*.json` are compatibility/debug/export mirrors only; canonical coordination uses `coordination.*` EventRecords plus `coordination_*_projection.v1` redb projections with append/CAS and transactional checkpoint semantics.
- `fable-20260706-p0-tier-vocabulary-and-subagent-config-canon` (P0, High, owner_decision_required): FABLE P0 #4: decide tier vocabulary; reconcile OSI-425/OSI-428/OSI-408 and define the fanout/parallel/cost/retry schema with exact fields/defaults.
  - Repair target: Add a banned-live-vocabulary check for tier-era runtime/config labels unless the row is marked compatibility/source-lineage.; Require SubagentPolicy schema fields, units, and defaults before subagent runtime readiness can pass.

### Plans/assistant-chat-design.md
- `fable-20260706-p0-platform-specs-authority-drift` (P0, High, repaired_current): FABLE P0 #2 is closed by `PLATFORM_SPECS_AUTHORITY_REPAIR.md`; Assistant Chat context repack and Auditor Validation dropdown/fallback units now consume Models_System capability snapshot and `fallback_chain[]` fields instead of legacy platform_specs functions.
  - Repair target satisfied: active `platform_specs::context_window(provider)` and `platform_specs::fallback_model_ids(platform)` claims were replaced or fenced as retired source-lineage; Models_System defines context-window/fallback metadata; Contracts_V0 defines only the cross-surface capability snapshot ref envelope.
  - Closure hardening: `PLATFORM_SPECS_CLOSURE_HARDENING.md` supersedes stale mechanical report rows for the original Assistant Chat contradiction, context-window sourcing, ACD-009, deeper ACD fallback/context rows, and Models_System missing-source/absent-term rows. This is provider/model scoped only; it is not global retirement of every `platform_specs` token.

### Plans/Spec_Lock.json
- `fable-20260706-p0-gui-toolkit-truth-spec-lock-vs-final-gui` (P0, High, repaired_superseded): FABLE P0 #3 is closed by `GUI_PLATFORM_CURRENTNESS_REPAIR.md` and hardened by `GUI_PLATFORM_HARDENING_REPAIR.md`; historical `currentness_check_report.json` and original registry rows remain source evidence only.
  - Repair target satisfied: `Plans/Spec_Lock.json` and active GUI owner docs use Slint 1.17.1; `FinalGUISpec.md` forbids React/Tauri/DOM-rendered product UI while allowing only minimal HTML/canvas bootstrap and generated/minimal JavaScript glue for Slint/WASM; `scripts/pm-plans-verify.py validate-gui-asset-policy` is a run-gates and audit-governance check.

### Plans/FileSafe.md
- `fable-20260706-p0-filesafe-fail-open-and-allowlist-security` (P0, Critical, partial_current): FABLE P0 #5: replace disabled fallback, prefix allowlist, empty-allowlist warn-only, and destructive override with fail-closed/auth/audit semantics.
  - Repair target: Readiness gate should reject fail-open code/prose patterns in security docs unless an adjacent current row explicitly marks them retired and no accepted unit uses them as final canon.; Add exact-match allowlist and destructive override auth/audit checks to implementation-readiness validation.

### Platform_specs Residue Boundary

- Provider/model capability uses of `platform_specs` are retired and closed by the repaired Models_System/Contracts/Assistant Chat/Provider OpenCode authority lane.
- Non-provider uses remain separately adjudicated: binary discovery, CLI invocation formatting, platform display names, tool-policy-to-CLI mapping, and skills injection are platform-adapter or runner concerns, not provider/model capability authority.
- `Plans/MiscPlan.md` M-083 remains **needs_repair** under the skill-injection owner/schema gap; it must not be marked closed merely because it contains `platform_specs`.
- `Plans/chain-wizard-flexibility.md` is compatibility/source-lineage only; its `platform_specs` mentions are not active product canon.

### Plans/UI_Command_Catalog.md
- `fable-20260706-p1-ui-command-catalog-missing-families` (P1, High, confirmed_current): FABLE P1 #6: add missing command families and field-level payload/response schemas; map recovery allowed_action_ids.
  - Repair target: validate-wiring-matrix should fail when production rows reference command families absent from UI_Command_Catalog.; validate-implementation-readiness should require launch-critical command payload/result schemas, not just command IDs.

### Plans/Wiring_Matrix.production.json
- `fable-20260706-p1-wiring-matrix-preimplementation-and-placeholder-events` (P1, Critical, confirmed_current): FABLE P1 #7 and concept showstopper: regenerate/fix production wiring so production rows have real UI locations, event/receipt effects, state selectors, disabled reasons, and implementation evidence.
  - Repair target: validate-wiring-matrix should fail on ui_location == Cataloged GUI surface for production launch/safety rows.; Reject placeholder *.command_applied event types unless defined as real domain events in Contracts_V0.

### Plans/Planning_Wizard.md
- `fable-20260706-p1-launch-approval-chain-preimplementation-proof` (P1, Critical, partial_current): FABLE concept gap #1: launch authority path must not be treated as executable proof until render, dispatcher, receipt/event, state selector, disabled reason, and regression evidence exist end to end.
  - Repair target: Buildability gate must require end-to-end launch-chain implementation evidence, not pre-implementation wiring contract rows.; Approve And Build must remain disabled if any launch-chain command effect is placeholder or evidence_required is pre-implementation only.

### Plans/Contracts_V0.md
- `fable-20260706-p1-contracts-v0-open-enums-field-drift` (P1, High, partial_current): FABLE P1 #8: close open enums, pin safe_point.created fields, add UICommand response/error contract, typed concern/AuthEvent payloads, schema_version, and canonical package_id/work_package_id naming.
  - Repair target: Contract lint should fail on ellipsis/open-ended enum syntax in persisted event fields.; Readiness should require a UICommand result/ack/error envelope before command wiring can count as implementation-ready.

### Plans/Goal_Runtime_System.md
- `fable-20260706-p1-goal-runtime-event-payload-minima` (P1, High, partial_current): FABLE P1 #9: enumerate event payload minima for all goal/goal_run events and define the new primitives before runtime buildability.
  - Repair target: Readiness should compare event catalogs to per-event payload schemas and fail when named events only inherit a generic envelope.; Require schema refs for LoopBreakerRegistry, AgentControlEnvelope, CertificationReceipt, ChildAgentLease, WorkNodeRequests, AuditCycle/Finding/Closure.

### Plans/Executor_Protocol.md
- `fable-20260706-p1-executor-wake-reasons-and-coalescing-missing-owner-section` (P1, High, confirmed_current): FABLE P1 #10: write the missing wake/coalescing owner section with score tuple, closed reasons, timeout, backpressure, and transport-decision receipt.
  - Repair target: lint-contractrefs should support intra-doc heading-anchor validation for backticked owner-section references.; Readiness should fail on repeated references to a missing owner section.

### Plans/FinalGUISpec.md
- `fable-20260706-p1-missing-referenced-docs-and-openrefs` (P1, High, confirmed_current): FABLE P1 #11: create or repoint WIDGETS_VISUAL_REFERENCE.md, WIDGETS_QUICK_REFERENCE.md, Release_Process.md, Terminal_Integration.md, Context_Management.md, and Skill_System.md typo refs as applicable.
  - Repair target: lint-path-refs should fail normative OpenRefs unless explicitly tagged future/source-lineage/manual.; Add typo-aware guard for singular Skill_System.md when Skills_System.md exists.

### Plans/Progression_Gates.md
- `fable-20260706-p1-progression-gates-registry-and-run-gates-coverage` (P1, High, partial_current): FABLE P1 #12: define GATE-007/008 or tombstones and wire GATE-011/012/013/014 or mark manual with owners.
  - Repair target: run-gates should emit gate-id coverage mapping and fail if any Progression_Gates.md registry entry is not enforced or explicitly manual.; Progression_Gates validator should reject missing GATE number tombstones.

### Plans/.plan_index/plan_units.jsonl
- `fable-20260706-p1-planunit-layer-behavioral-acceptance-dependencies` (P1, High, confirmed_current): FABLE P1 #13: replace boilerplate acceptance criteria with behavioral ACs for gui_related/P0 units, populate depends_on/unblocks, execute split_recommended cleanup, and repair corrupted tokens.
  - Repair target: plan-index validate should flag boilerplate-only acceptance on P0/gui_related units.; Require non-empty/inverse-consistent dependency edges for build-order-critical units before ready_for_node_compile.

## Gate Changes Required

- Fail buildability when production wiring rows are still pre-implementation contracts or use placeholder *.command_applied events.
- Fail buildability when launch-chain commands lack render/control, dispatcher, receipt/event, state-selector, disabled-reason, and regression evidence.
- Add gate-id coverage mapping from Progression_Gates.md to scripts/pm-plans-verify.py run-gates; fail missing gate IDs or unowned manual gates.
- Reject live source-lineage/retired authority terms in current owner docs unless fenced by explicit compatibility disposition.
- Make Spec_Lock/toolchain currentness and canonical owner-doc agreement a gate, with explicit auto_decision exceptions only.
- Require event catalogs to have per-event payload minima and schema refs, not just generic envelopes.
- Require behavioral acceptance and dependency graph quality for P0/gui_related PlanUnits instead of preservation-only acceptance criteria.

## Stop Rules

- Do not create WorkNodes, NodeSeeds, executable queues, implementation files, runtime launches, or production build tasks as part of these repairs unless a later goal explicitly authorizes implementation work.
- Treat report-corrected false alarms in the registry as suppression guards, not repair backlog.
- Keep validator wrapper timeouts separate from content failures in any follow-on run.
