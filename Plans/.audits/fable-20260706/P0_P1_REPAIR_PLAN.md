# P0/P1 Buildability Repair Plan — FABLE 20260706 Currentness Triage

Generated: 2026-07-07T11:56:40Z
Updated: 2026-07-07T18:49:00Z for storage/coordination canon repair and platform_specs authority repair.
Updated: 2026-07-07T19:36:27Z for platform_specs closure hardening and non-provider residue adjudication.
Updated: 2026-07-07T20:26:31Z for FileSafe fail-closed security repair and stale GUI toolkit mechanical row closure hygiene.
Updated: 2026-07-07T21:35:04Z for contract-runtime core repair.
Updated: 2026-07-07T22:45:00Z for GUI command, production wiring, launch-chain, openref, and gate registry repair.

Scope: triage plus bounded storage/coordination canon repair, platform_specs authority repair, FileSafe fail-closed security repair, stale GUI toolkit mechanical row closure hygiene, contract-runtime core repair, and GUI command/wiring/gate/openref repair. Broad PlanUnit boilerplate, runtime certification harness, unrelated mechanical findings, and buildability proof remain out of scope.

## Current Buildability Reality

- `Plans/.implementation_readiness/buildability_gate_report.json` currently reports `buildability_gate_passed=False` and `Approve And Build` enabled=False while runtime lifecycle and clean-room harness blockers remain open.
- Live wiring metrics still show `179` generic `Cataloged GUI surface` rows, `323` rows with no events, `99` placeholder `*.command_applied` rows, and `35/459` rows with both a real location and non-placeholder event.
- Therefore this plan treats current governance validation as insufficient buildability proof where the live P0/P1 evidence below remains unresolved.

## Dependency Order

10. `fable-20260706-p0-storage-coordination-canon-file-vs-seglog-redb` — **repaired_current** — Closed by `STORAGE_COORDINATION_CANON_REPAIR.md` and `storage_coordination_canon_repair_report.json`; active canon now names coordination EventRecord families, redb projections, append/CAS semantics, and debug/export mirror-only `.puppet-master/state/*.json` disposition.
20. `fable-20260706-p0-platform-specs-authority-drift` — **repaired_current** — Closed by `PLATFORM_SPECS_AUTHORITY_REPAIR.md` and `platform_specs_authority_repair_report.json`; Models_System now owns context-window, max-token, fallback-chain, provenance, and requested/effective capability fields, Contracts_V0 only carries snapshot refs, and Assistant Chat no longer uses legacy platform_specs functions as active authority.
30. `fable-20260706-p0-gui-toolkit-truth-spec-lock-vs-final-gui` — **repaired_superseded** — Closed by `GUI_PLATFORM_CURRENTNESS_REPAIR.md` and hardened by `GUI_PLATFORM_HARDENING_REPAIR.md`; active canon now pins Slint 1.17.1, Slint/WASM canvas web bootstrap limits, native Rust + Slint `.slint` markup, and `validate-gui-asset-policy` governance coverage.
40. `fable-20260706-p0-tier-vocabulary-and-subagent-config-canon` — **repaired_current** — Closed by `CONTRACT_RUNTIME_CORE_REPAIR.md` and `contract_runtime_core_repair_report.json`; tier-era Phase/Task/Subtask/Iteration and subagent config labels are compatibility/search aliases, while `SubagentPolicy` owns runtime field names, units, defaults, limits, fanout, cost, retry, and alias normalization.
50. `fable-20260706-p0-filesafe-fail-open-and-allowlist-security` — **repaired_current** — Closed by `FILESAFE_FAIL_CLOSED_SECURITY_REPAIR.md` and `filesafe_fail_closed_security_repair_report.json`; active canon now blocks guard initialization failure, requires exact normalized approved-command matching, fails closed on missing/empty allowlists and missing baselines regardless of `strict_mode`, treats `PUPPET_MASTER_ALLOW_DESTRUCTIVE=1` as a request signal only, requires authenticated scoped destructive override receipts, and fences fail-open/prefix snippets as noncanonical source-lineage.
110. `fable-20260706-p1-ui-command-catalog-missing-families` — **repaired_current** — Closed by `GUI_COMMAND_WIRING_GATE_REPAIR.md`, `gui_command_wiring_gate_repair_report.json`, and UCC-108; command families and field-level response/receipt contracts are cataloged.
120. `fable-20260706-p1-wiring-matrix-preimplementation-and-placeholder-events` — **repaired_current** — Closed by `GUI_COMMAND_WIRING_GATE_REPAIR.md` and WM-042; production wiring has zero generic `Cataloged GUI surface` rows, zero placeholder `*.command_applied` events, and validates through `validate-wiring-matrix`.
125. `fable-20260706-p1-launch-approval-chain-preimplementation-proof` — **repaired_current** — Closed for command/wiring contract scope by `GUI_COMMAND_WIRING_GATE_REPAIR.md`; launch-chain commands now require projected availability, disabled reasons, UICommandResponse/receipt refs, and canonical effects without claiming runtime certification or buildability.
130. `fable-20260706-p1-contracts-v0-open-enums-field-drift` — **repaired_current** — Closed by `CONTRACT_RUNTIME_CORE_REPAIR.md` and `contract_runtime_core_repair_report.json`; Contracts_V0 now closes runtime enums, safe-point fields, auth-required handling, UI command response, concern/AuthEvent minima, per-event payload schema_version, and package_id compatibility.
140. `fable-20260706-p1-goal-runtime-event-payload-minima` — **repaired_current** — Closed by `CONTRACT_RUNTIME_CORE_REPAIR.md` and `contract_runtime_core_repair_report.json`; Goal Runtime now lists payload minima for all goal/goal_run events and defines the required runtime records.
150. `fable-20260706-p1-executor-wake-reasons-and-coalescing-missing-owner-section` — **repaired_current** — Closed by `CONTRACT_RUNTIME_CORE_REPAIR.md` and `contract_runtime_core_repair_report.json`; Executor Protocol now owns wake reasons/coalescing, score tuple sort, closed mapping, timeout, backpressure, and transport decision receipts.
160. `fable-20260706-p1-missing-referenced-docs-and-openrefs` — **repaired_current** — Closed by repointing missing normative references to existing owner sections for widgets, release, terminal, context management, and Skills_System.
170. `fable-20260706-p1-progression-gates-registry-and-run-gates-coverage` — **repaired_current** — Closed by PG-061: GATE-007/008 are tombstoned, GATE-010 rejects wiring semantic defects, and GATE-011/012/013 are explicitly manual-pending with owners.
180. `fable-20260706-p1-planunit-layer-behavioral-acceptance-dependencies` — **confirmed_current** — PlanUnit layer still relies heavily on migration-preservation acceptance and sparse dependency/unblocks metadata.

## Owner-Grouped Repairs

### Plans/orchestrator-subagent-integration.md
- `fable-20260706-p0-storage-coordination-canon-file-vs-seglog-redb` (P0, Critical, repaired_current): FABLE P0 #1 is closed by `STORAGE_COORDINATION_CANON_REPAIR.md`; OSI-271 and related coordination units now retire file-based canon, and `OSI-432` names the canonical event/projection/mirror contract.
  - Repair target satisfied: `active-agents.json`, `agent-messages.json`, and `.puppet-master/state/*.json` are compatibility/debug/export mirrors only; canonical coordination uses `coordination.*` EventRecords plus `coordination_*_projection.v1` redb projections with append/CAS and transactional checkpoint semantics.
- `fable-20260706-p0-tier-vocabulary-and-subagent-config-canon` (P0, High, repaired_current): FABLE P0 #4 is closed by `CONTRACT_RUNTIME_CORE_REPAIR.md`; OSI-408, OSI-425, and OSI-428 now fence tier-era labels as compatibility/search aliases and define canonical `SubagentPolicy` defaults.
  - Repair target satisfied: live runtime prose uses GoalRun/WorkGraph/WorkNode/package/seam/lane/capability_lane/agent_role/SubagentWave/SubagentPolicy; `tier_overrides`, `enable_tier_subagents`, and Phase/Task/Subtask/Iteration normalize before runtime admission.

### Plans/assistant-chat-design.md
- `fable-20260706-p0-platform-specs-authority-drift` (P0, High, repaired_current): FABLE P0 #2 is closed by `PLATFORM_SPECS_AUTHORITY_REPAIR.md`; Assistant Chat context repack and Auditor Validation dropdown/fallback units now consume Models_System capability snapshot and `fallback_chain[]` fields instead of legacy platform_specs functions.
  - Repair target satisfied: active `platform_specs::context_window(provider)` and `platform_specs::fallback_model_ids(platform)` claims were replaced or fenced as retired source-lineage; Models_System defines context-window/fallback metadata; Contracts_V0 defines only the cross-surface capability snapshot ref envelope.
  - Closure hardening: `PLATFORM_SPECS_CLOSURE_HARDENING.md` supersedes stale mechanical report rows for the original Assistant Chat contradiction, context-window sourcing, ACD-009, deeper ACD fallback/context rows, and Models_System missing-source/absent-term rows. This is provider/model scoped only; it is not global retirement of every `platform_specs` token.

### Plans/Spec_Lock.json
- `fable-20260706-p0-gui-toolkit-truth-spec-lock-vs-final-gui` (P0, High, repaired_superseded): FABLE P0 #3 is closed by `GUI_PLATFORM_CURRENTNESS_REPAIR.md` and hardened by `GUI_PLATFORM_HARDENING_REPAIR.md`; historical `currentness_check_report.json` and original registry rows remain source evidence only.
  - Repair target satisfied: `Plans/Spec_Lock.json` and active GUI owner docs use Slint 1.17.1; `FinalGUISpec.md` forbids React/Tauri/DOM-rendered product UI while allowing only minimal HTML/canvas bootstrap and generated/minimal JavaScript glue for Slint/WASM; `scripts/pm-plans-verify.py validate-gui-asset-policy` is a run-gates and audit-governance check.

### Plans/FileSafe.md
- `fable-20260706-p0-filesafe-fail-open-and-allowlist-security` (P0, Critical, repaired_current): FABLE P0 #5 is closed by `FILESAFE_FAIL_CLOSED_SECURITY_REPAIR.md`; FileSafe now requires blocking init failure, exact normalized approved-command identities, strict fail-closed allowlists/baselines, authenticated destructive override grants with receipt fields, advisory-only prompt/free-text extraction, non-existent-create and TOCTOU path checks, and retired fail-open snippet fencing.
  - Repair target satisfied: `validate-filesafe-security-policy` rejects active fail-open guard snippets, prefix/`starts_with` approved-command semantics, env-var-alone destructive override semantics, missing FileSafe fail-closed event payloads, missing destructive override receipt fields, and prompt/free-text-only enforcement wording.

### Platform_specs Residue Boundary

- Provider/model capability uses of `platform_specs` are retired and closed by the repaired Models_System/Contracts/Assistant Chat/Provider OpenCode authority lane.
- Non-provider uses remain separately adjudicated: binary discovery, CLI invocation formatting, platform display names, tool-policy-to-CLI mapping, and skills injection are platform-adapter or runner concerns, not provider/model capability authority.
- `Plans/MiscPlan.md` M-083 remains **needs_repair** under the skill-injection owner/schema gap; it must not be marked closed merely because it contains `platform_specs`.
- `Plans/chain-wizard-flexibility.md` is compatibility/source-lineage only; its `platform_specs` mentions are not active product canon.

### Plans/UI_Command_Catalog.md
- `fable-20260706-p1-ui-command-catalog-missing-families` (P1, High, repaired_current): closed by UCC-108 and GUI command/wiring repair artifacts.
  - Repair target: validate-wiring-matrix should fail when production rows reference command families absent from UI_Command_Catalog.; validate-implementation-readiness should require launch-critical command payload/result schemas, not just command IDs.

### Plans/Wiring_Matrix.production.json
- `fable-20260706-p1-wiring-matrix-preimplementation-and-placeholder-events` (P1, Critical, repaired_current): closed by WM-042 and production wiring validation; runtime implementation certification remains separate.
  - Repair target: validate-wiring-matrix should fail on ui_location == Cataloged GUI surface for production launch/safety rows.; Reject placeholder *.command_applied event types unless defined as real domain events in Contracts_V0.

### Plans/Planning_Wizard.md
- `fable-20260706-p1-launch-approval-chain-preimplementation-proof` (P1, Critical, repaired_current for command/wiring contract scope): launch authority path now has command/receipt contract coverage without claiming executable proof.
  - Repair target: Buildability gate must require end-to-end launch-chain implementation evidence, not pre-implementation wiring contract rows.; Approve And Build must remain disabled if any launch-chain command effect is placeholder or evidence_required is pre-implementation only.

### Plans/Contracts_V0.md
- `fable-20260706-p1-contracts-v0-open-enums-field-drift` (P1, High, repaired_current): FABLE P1 #8 is closed by `CONTRACT_RUNTIME_CORE_REPAIR.md`; CV-313 closes the runtime enum/schema drift and binds affected Contracts, Goal Runtime, and Executor dependencies.
  - Repair target satisfied: closed enum families and field minima now cover wake/stop/attention/budget/unblock/conflict/auth/safe-point/UI command/concern/AuthEvent/package identity for this slice.

### Plans/Goal_Runtime_System.md
- `fable-20260706-p1-goal-runtime-event-payload-minima` (P1, High, repaired_current): FABLE P1 #9 is closed by `CONTRACT_RUNTIME_CORE_REPAIR.md`; GRS-041 enumerates all required event payload minima and runtime record primitives.
  - Repair target satisfied: named goal/goal_run events no longer rely only on a generic envelope in Goal Runtime canon.

### Plans/Executor_Protocol.md
- `fable-20260706-p1-executor-wake-reasons-and-coalescing-missing-owner-section` (P1, High, repaired_current): FABLE P1 #10 is closed by `CONTRACT_RUNTIME_CORE_REPAIR.md`; EP-114 binds the wake/coalescing section, score tuple, closed reason mapping, timeout, backpressure, and transport receipt behavior.
  - Repair target satisfied: `### Wake reasons and coalescing` now exists and owns the closed wake list plus coalescing algorithm.

### Plans/FinalGUISpec.md
- `fable-20260706-p1-missing-referenced-docs-and-openrefs` (P1, High, repaired_current): missing docs were repointed to existing owner sections; no placeholder docs were created.
  - Repair target: lint-path-refs should fail normative OpenRefs unless explicitly tagged future/source-lineage/manual.; Add typo-aware guard for singular Skill_System.md when Skills_System.md exists.

### Plans/Progression_Gates.md
- `fable-20260706-p1-progression-gates-registry-and-run-gates-coverage` (P1, High, repaired_current): GATE-007/008 tombstones and GATE-011/012/013 manual owner dispositions are recorded; GATE-014 remains separately manual pending document-set tooling.
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
