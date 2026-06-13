# Progression Gates (Canonical)


## Canonical owner-section requirements

These requirements are canonical live specification text for this owner document and preserve the required product, runtime, storage, UI, and governance details in owner-section form.

### Promotion classes and gate evidence


> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: “Puppet Master” only. No open questions; deterministic defaults per `Plans/Decision_Policy.md`.


<!--
PUPPET MASTER -- PROGRESSION / VERIFICATION GATES

ABSOLUTE NAMING RULE:
- Platform name is "Puppet Master" only.
- If older naming exists, refer to it only as "legacy naming" (do not quote it).
-->

## 0. Scope


This file defines deterministic gates used to validate plan quality and implementation evidence.

### P5 progression owner recovery requirements

- Supporting docs with narrower surface area still feed gate ownership: BinaryLocator_Spec.md, BinaryLocator_Spec, OpenCode cli_launcher, non-existent four-tier ContractRef `/false` cases, Containers_Registry_and_Unraid.md, Containers_Registry_and_Unraid, publish-authority, blocked-payload, command IDs, publish-result, Document_Packaging_Policy.md, Document_Packaging_Policy, GATE, agent-rules-context.md, agent-rules-context, under-enumerates callers, execution-role input, `/Prompt_Pipeline`, and `/help` disclosure must be represented in progression evidence when they affect gate status.
- Graph and evidence schema gates must track `Plans/plan_graph.schema.json`, `/plan_graph.schema.json`, `Plans/project_plan_node.schema.json`, `/project_plan_node.schema.json`, `Plans/test_strategy.schema.json`, `/test_strategy.schema.json`, `Plans/evidence.schema.json`, `/evidence.schema.json`, `Plans/gui_automation_manifest.schema.json`, `/gui_automation_manifest.schema.json`, `/node/tier-scoped`, `/package/lane/promotion/account`, `/runtime/storage`, safe-point, contamination, and restore provenance.
- ContractRef syntax inside `Plans/Progression_Gates.md`, `/Progression_Gates.md`, `Plans/Architecture_Invariants.md`, `/Architecture_Invariants.md`, `Plans/DRY_Rules.md`, `/DRY_Rules.md`, evidence.schema.json, SchemaID, INV, and ContractName references must use the ContractName taxonomy that `Plans/DRY_Rules.md` requires; - This bypasses the accepted taxonomy that gates are allowed to verify.
- Orchestrator-facing gate UI references through `Plans/FinalGUISpec.md`, `/FinalGUISpec.md`, `Plans/Run_Graph_View.md`, `/Run_Graph_View.md`, `Plans/Widget_System.md`, `/Widget_System.md`, widget.tier_tree, grouped-by-phase graph layouts, `/worker`, `/worker/worktree`, package, seam, lane, contamination state, promotion state, and multiple overseer/worker identities must remain visible in gate expectations.
- Gate and evidence integrity includes Progression_Gates, run-gates, plan-shard freshness, pm.evidence.schema.v1, `/status`, `/evidence`, tri-state, machine-readable arrays, GATE, `/GATE-012`, GATE-011, GATE-012, attention_required, and blocked escalation without collapsing true blocked state into attention-only evidence.
- Cross-owner seam docs include `Plans/Wiring_Matrix.schema.json`, `/Wiring_Matrix.schema.json`, `Plans/UI_Command_Catalog.md`, `/UI_Command_Catalog.md`, `Plans/Contracts_V0.md`, `/Contracts_V0.md`, `Plans/FileManager.md`, `/FileManager.md`, `Plans/Decision_Policy.md`, and `/Decision_Policy.md`.
- Later-model high-risk routing keeps `Plans/Commands_System.md`, `Plans/Wiring_Matrix.md`, `Plans/UI_Wiring_Rules.md`, `Plans/Project_Output_Artifacts.md`, `/Project_Output_Artifacts.md`, `Plans/FileManager.md`, `Plans/Decision_Policy.md`, `Plans/Run_Modes.md`, `/Run_Modes.md`, `Plans/Progression_Gates.md`, `/Progression_Gates.md`, `Plans/newtools.md`, `Plans/assistant-memory-subsystem.md`, `Plans/Glossary.md`, `/Glossary.md`, `Plans/Crosswalk.md`, SSOT, `/term`, and later-model ownership failures in the gate-risk inventory.
- Wiring seam owners `Plans/UI_Command_Catalog.md`, `/UI_Command_Catalog.md`, `Plans/Contracts_V0.md`, `/Contracts_V0.md`, and `Plans/Wiring_Matrix.schema.json`, `/Wiring_Matrix.schema.json` are required gate references.
- Primary owners `Plans/UI_Command_Catalog.md`, `/UI_Command_Catalog.md`, `Plans/Contracts_V0.md`, `/Contracts_V0.md`, `Plans/Wiring_Matrix.schema.json`, `/Wiring_Matrix.schema.json`, `Plans/UI_Wiring_Rules.md`, `/UI_Wiring_Rules.md`, `Plans/Progression_Gates.md`, `/Progression_Gates.md`, and `Plans/Crosswalk.md`, `/Crosswalk.md` must be represented when command and wiring gates are evaluated.
- `Plans/Wiring_Matrix.schema.json` and `/Wiring_Matrix.schema.json` must carry command-kind and normalization metadata when command wrappers or aliases are gate inputs.
- Primary wiring owners `Plans/UI_Wiring_Rules.md`, `/UI_Wiring_Rules.md`, `Plans/Wiring_Matrix.md`, `/Wiring_Matrix.md`, `Plans/Wiring_Matrix.schema.json`, `/Wiring_Matrix.schema.json`, and `Plans/UI_Command_Catalog.md`, `/UI_Command_Catalog.md` are part of the same gate seam.
- Gate evidence seams across `Plans/Progression_Gates.md`, `/Progression_Gates.md`, `Plans/evidence.schema.json`, `/evidence.schema.json`, `Plans/UI_Wiring_Rules.md`, `/UI_Wiring_Rules.md`, and `Plans/Wiring_Matrix.md`, `/Wiring_Matrix.md` must stay consistent.
- Runtime-native approval records use `blocked_reason_code = waiting_approval`, blocked_reason_code, waiting_approval, blocked_sequence, `/runtime`, runtime-native, and runtime-facing action families instead of generic paused state.
- Primary owner sets for command/wiring continuation include `Plans/Commands_System.md`, `Plans/Wiring_Matrix.md`, `Plans/UI_Wiring_Rules.md`, `Plans/Project_Output_Artifacts.md`, `/Project_Output_Artifacts.md`, `Plans/Glossary.md`, `/Glossary.md`, `Plans/FileManager.md`, `Plans/Crosswalk.md`, `/Crosswalk.md`, `Plans/Decision_Policy.md`, `Plans/Run_Modes.md`, `Plans/Progression_Gates.md`, `/Progression_Gates.md`, `Plans/newtools.md`, and `Plans/assistant-memory-subsystem.md`.
- GPT continuation risk keeps GPT, `Plans/Commands_System.md`, `Plans/Wiring_Matrix.md`, `Plans/UI_Wiring_Rules.md`, `Plans/Project_Output_Artifacts.md`, `/Project_Output_Artifacts.md`, `Plans/FileManager.md`, `Plans/Crosswalk.md`, `/Crosswalk.md`, `Plans/Decision_Policy.md`, `Plans/Run_Modes.md`, `Plans/Progression_Gates.md`, `/Progression_Gates.md`, `Plans/newtools.md`, `Plans/assistant-memory-subsystem.md`, and `Plans/Glossary.md`, `/Glossary.md` in the same owner-risk list.
- Run graph and orchestrator docs `Plans/Run_Graph_View.md`, `/Run_Graph_View.md`, `Plans/Orchestrator_Page.md`, `/Orchestrator_Page.md`, `/catalog`, compatibility-era identity, `/action`, and command/catalog normalization must be verified before affected gates pass.
- Widget gates include `Plans/Widget_System.md`, `/Widget_System.md`, project-scoped layouts, terminal-widget normalization, projection-trust chrome, `/lane-aware`, and attempt/lane-aware live data contracts.
- Normalization ownership across `Plans/UI_Command_Catalog.md`, `/UI_Command_Catalog.md`, `Plans/storage-plan.md`, and `/storage-plan.md` must make surface docs converge before gates rely on them.
- Account/trust gate ownership keeps `Plans/Multi-Account.md`, `/Multi-Account.md`, requested-account, `/history/trust`, design-open, and SSOTs in scope until adjacent ownership is resolved.
- Permission and HITL gate seams include `Plans/Permissions_System.md`, `/Permissions_System.md`, `Plans/Tools.md`, `/Tools.md`, `Plans/human-in-the-loop.md`, and `/human-in-the-loop.md`.
- Gate closeout treats duplicate addenda as `/mechanical`; pm.evidence.schema.v1, run-gates, `/evidence`, tri-state, and structured payloads must be represented by numbered gate mappings.
- Backfill and architecture docs `Plans/UI_Command_Catalog.md`, `/UI_Command_Catalog.md`, `Plans/00-plans-index.md`, `/00-plans-index.md`, `Plans/Architecture_Invariants.md`, and `/Architecture_Invariants.md` remain gate-adjacent sources.
- UI command, contracts, crosswalk, and wiring references `Plans/UI_Command_Catalog.md`, `/UI_Command_Catalog.md`, `Plans/Contracts_V0.md`, `/Contracts_V0.md`, `Plans/Crosswalk.md`, `/Crosswalk.md`, and `Plans/UI_Wiring_Rules.md`, `/UI_Wiring_Rules.md` must be gate-visible.
- GATE-010 verifies wrapper commands, deprecated aliases, canonical command IDs, command-kind, normalization metadata, GATE, and command IDs without expanding wiring schema more than necessary.
- Binary locator and architecture owner docs `Plans/00-plans-index.md`, `/00-plans-index.md`, `Plans/Architecture_Invariants.md`, `/Architecture_Invariants.md`, `Plans/BinaryLocator_Spec.md`, and `/BinaryLocator_Spec.md` remain implicated when progression gates depend on binary location semantics.
- HITL, UI command, and storage owners `Plans/human-in-the-loop.md`, `/human-in-the-loop.md`, `Plans/UI_Command_Catalog.md`, `/UI_Command_Catalog.md`, `Plans/storage-plan.md`, and `/storage-plan.md` must align before route or approval gates depend on them.
- Progression_Gates.md owner normalization requires `/wrapper`, command-definition metadata, ContractRef taxonomy, numbered gate canon, GATE, GATE-010, deterministic gate language, routing/wrapper normalization, and wiring evidence.
- Related owner docs `Plans/Project_Output_Artifacts.md`, `/Project_Output_Artifacts.md`, `Plans/Permissions_System.md`, `/Permissions_System.md`, and `Plans/Decision_Policy.md`, `/Decision_Policy.md` are progression gate inputs when packaging or permission decisions affect promotion.
- Stewardship refresh artifacts meta.json, mode_rules.md, mode_status.md, mode_rules, mode_status, fresh-agent, and existing packet/run metadata are gate-state references, not a replacement for canonical gate evidence.
- Actor, receipt, and usage normalization connects `Plans/UI_Command_Catalog.md`, `/UI_Command_Catalog.md`, `Plans/Runtime_Artifacts_Panel.md`, `/Runtime_Artifacts_Panel.md`, and `/receipt/usage`.
- Adjacent account/runtime owners include Multi-Account.md, Permissions_System.md, Permissions_System, Glossary.md, Contracts_V0, Contracts_V0.md, Run_Graph_View, Run_Graph_View.md, Prompt_Pipeline, Prompt_Pipeline.md, Orchestrator_Page, Orchestrator_Page.md, storage-plan, and storage-plan.md.
- Graph-local wrappers may remain for UX readability only when graph-local, cmd.runtime.approve, cmd.runtime.decline, normalization target, and arg derivation are explicit.
- GATE-010 must relate to `/open` route primitives in Contracts_V0.md, Contracts_V0, wrapper metadata in UI_Command_Catalog.md, UI_Command_Catalog, GATE, and evidence structures that encode normalization and alias failures.
- `Plans/orchestrator-subagent-integration.md`, `/orchestrator-subagent-integration.md`, and split-brain body/addenda contradictions remain gate-risk inputs.
- allowed_actions in canonical-looking HITL `/storage` shapes is a gate risk until the deprecation addendum is reflected in owner docs.
- `Plans/human-in-the-loop.md` and `/human-in-the-loop.md` remain the primary owner for HITL route, approval, and blocked identity semantics referenced by progression gates.
- The executor-facing contract is mostly normalization across existing owner docs, not a greenfield schema invention.
- UI_Wiring_Rules, UI_Wiring_Rules.md, Wiring_Matrix, Wiring_Matrix.md, dead-command detection, and over-expanding public command families become gate expectations once a command ID is stable.
- GATE-010 `/reporting` evidence captures wrapper normalization target, deprecated alias target, and mismatch detection when wrapper commands claim one primitive but wire to different semantics.
- Wrapper normalization metadata describes canonical primitive family, not serialized route payload.
- inspector_target and `inspector_target = evidence` are required when the target object is already selected and detail focus must land on evidence.
- GUI_Rebuild_Requirements_Checklist, GUI_Rebuild_Requirements_Checklist.md, and stale upstream PASS conditions cannot create false confidence in progression gates.
- Transfer coverage blockers cov-034, cov-511, cov-526, transfer-coverage, owner-definition, and evidence-collection are owner-definition gaps until resolved, not just missing evidence-collection gaps.
- Widget catalog refresh must replace widget.tier_tree and widget.progress_bars with package, seam, lane, and parallel execution visualizations before the Tiers tab can be renamed or replaced.
- automation-first defaults must be reconciled with HITL, `/schema`, mandatory gates, optional boundaries, and settings/schema flips.
- Shared progression states are info, warning, attention_required, blocked, and system_notification.
- GATE-010 route-aware verification must be explicit, either inside GATE-010 or as a sibling GATE boundary.
- GATE-011, GATE-012, GATE-010, machine-readable failure arrays, and generic check rows must not diverge across gate patterns.
- append-only addenda in high-value owner docs are risk signals when stale canonical text remains unreconciled.
- Deprecated aliases should eventually disappear, while wrapper commands may remain as permanent UX-facing vocabulary when their primitive family is explicit.

ContractRef: Primitive:Gate

---

## Route-aware progression and packet verification gates

Progression gates are the canonical owners of promotion evidence, route/open packet verification, and compatibility checks before run sealing and archival.

### Promotion classes and required evidence

Promotions follow these classes:
- **READY**: Sufficient concerns resolved, approval status clear, usage within bounds, and no blocking externalities.
- **STAGED**: Promotion state is pending; promotion review window is open and waiting for coordinator review or automated gate judgment.
- **HELD**: Temporary gate; promotion may proceed after external condition clears (e.g., rate limit window, dependent run completion).
- **REJECTED**: Promotion gate failed; promotion cannot proceed unless the gate criterion is waived by escalation or project rule.

Evidence for each promotion class:
- READY: `concern_summary` clear or resolved-with-mitigation, `approval_summary` in final state, `usage_summary` within budget, `route_target_reachability` verified, `blockers` field is empty array.
- STAGED: `coordinator_review_id`, `review_deadline_utc`, `active_blockers[]`, `pending_external_conditions[]`.
- HELD: `hold_reason`, `expected_clear_time_utc`, `blocking_external_condition_id`.
- REJECTED: `rejection_reason`, `rejected_criterion`, `waiver_required`, `escalation_contact`.

### Route-aware wiring evidence

Route awareness requires:
- `route_target` is reachable and has not changed between build time and promotion time.
- `OpenSubject` resolution is still valid (e.g., the GitHub issue still exists, the workspace path is still writable).
- Route/open commands that were executed during the run are reflected in the promotion artifact.
- Route side-effects (file writes, PR opens, issue comments) are linked in the `route_completion_refs[]` field.

### route_target/OpenSubject packet checks

Packet verification gates check:
- Every `route_target` in the run packet is present in the promotion artifact as a reachability confirmation.
- Every `OpenSubject` in the run packet is present as a resolution confirmation or explicit waiver (if the subject became unreachable).
- Cross-packet route/open references are coherent: if run A routes to run B's artifacts, run B's artifacts must be sealed before run A is promoted.

### Compatibility fallback and contradiction-fail rules


- If a route_target becomes unreachable between build and promotion, the promotion enters HELD state instead of failing silently.
- If an OpenSubject resolution contradicts the prior intent (e.g., the issue was closed externally), the gate emits a REJECTION with `rejection_reason: 'subject_state_contradiction'`.
- Waiver paths: project admins may waive route reachability or subject contradiction using a durable `gate_waiver_rule` in the project config.

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Decision_Policy.md

## 1. Verifier role (AI-only; deterministic)
The Verifier is an AI role that runs these gates and returns a progression decision.

**Hard rules:**
- The Verifier MUST run gates exactly as written here (no discretionary skipping).  
  ContractRef: Primitive:Gate
- The Verifier MUST block progression when any gate fails.  
  ContractRef: Primitive:Gate
- The Verifier MUST NOT require a human to read logs or approve decisions; it relies only on machine-checkable artifacts (schemas, evidence bundles, deterministic lints).  
  ContractRef: PolicyRule:Decision_Policy.md§4

**Execution contract (recommended):**
- Implement a repo-local verifier command that can be invoked headlessly, e.g. `python3 scripts/pm-plans-verify.py run-gates`.  
  ContractRef: SchemaID:plan_graph.schema.json

**Current script-enforceable coverage (`run-gates`):**
- `GATE-001` schema validation (plan graph + node change budgets + auto decisions)
- `GATE-002` Spec Lock integrity (SSOT hash verification)
- `GATE-004` drift phrase lint (`TBD`, `Open Questions`, `ask later`)
- `GATE-005` non-example node evidence existence + schema validation
- `GATE-006` non-example node change-budget declaration checks
- `GATE-009` ContractRef coverage lint
- `GATE-011`, `GATE-012`, `GATE-013` target the traceability layer (not yet enforced by `run-gates`; pending traceability artifact generation integration)
- `GATE-014` targets Document Set packaging verification (not yet enforced by `run-gates`; pending Document Set artifact generation integration)

ContractRef: Gate:GATE-001, Gate:GATE-002, Gate:GATE-004, Gate:GATE-005, Gate:GATE-006, Gate:GATE-009, Gate:GATE-011, Gate:GATE-012, Gate:GATE-013, Gate:GATE-014

### Verifier scope boundary


`python3 scripts/pm-plans-verify.py run-gates` is the canonical repo-local verifier command for build-governing Puppet Master repository artifacts.

- Generated user-project artifacts under `.puppet-master/project/**` MUST satisfy the relevant gate contracts defined here.
- They are not implied to be fully covered by the current repo-local `run-gates` script unless a validator explicitly targets them.

ContractRef: ContractName:Plans/Project_Output_Artifacts.md, Gate:GATE-011, Gate:GATE-012, Gate:GATE-013, Gate:GATE-014

### Verifier result normalization


### Verifier result normalization canonical rules

- Individual gates MAY expose machine states beyond `PASS` / `FAIL` for workflow or UI purposes.
- For the Verifier's top-level progression decision, any gate state other than `PASS` MUST be treated as a blocking non-pass outcome.
- The original gate-specific state MUST still be preserved in machine-readable evidence.
- Model-label normalization keeps raw IDs exact for runtime/API use; normalized labels are display-only and do not replace machine-readable model IDs in verifier evidence.
- Recovery pass results that launch or resume a packetized run preserve a pointer to the original work item/run; for post-audit recovery of `r-20260312-203855-07`, the verifier treats the existing `packetized` work item as the recovery target instead of requiring a new work item.
- Route result evidence distinguishes routing/deep-link normalization from FileManager UI conveniences; FileManager open/copy behavior can consume the route result, but it is not the owner of the normalized route identity.
- Corroboration and review results preserve participant outputs, quorum result, accepted / not accepted / advisory-only classification, and resulting concern, `/promotion/patch`, or graph-patch implications in machine-readable evidence.

ContractRef: Primitive:Gate, Gate:GATE-012, PolicyRule:Decision_Policy.md§2

## Runtime node-model progression gate definitions

Legacy tier-level gate definitions are replaced by package-, seam-, and lane-scoped progression gates. These gates inherit the existing blocking, approval, and timeout/remediation behavior patterns already defined by the progression system; only the execution entities change from tiers to node-model packages, seams, and lanes.

ContractRef: Primitive:Gate, ContractName:Plans/Executor_Protocol.md, ContractName:Plans/human-in-the-loop.md

### `package_complete_gate`

Pass condition:
- all nodes in the package are in a terminal resolved state: `completed`, `skipped`, or `failed` with remediation recorded
- the gate prevents the package from reporting completion until every constituent node is resolved

ContractRef: Primitive:Gate, ContractName:Plans/Executor_Protocol.md, ContractName:Plans/human-in-the-loop.md

### `seam_complete_gate`

Pass condition:
- the source package is complete
- target package prerequisites are resolved
- cross-package transition readiness validates prerequisite resolution, context handoff preparation, and contract compatibility
- feature-seam overseer evidence validates cross-package coherence, integration correctness across package boundaries, style/architecture consistency, seam-level "did we actually build the intended thing" judgment, and authority to withhold seam completion when integration quality is weak even if constituent packages passed

ContractRef: Primitive:Gate, ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Contracts_V0.md

### `lane_complete_gate`

Pass condition:
- every package assigned to the lane satisfies `package_complete_gate` before the lane reports `done`
- lane completion remains blocked until all assigned packages are resolved

ContractRef: Primitive:Gate, ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Contracts_V0.md

---

<a id="GATE-001"></a>
## GATE-001 -- Schema validation (anti-drift core)
**Pass condition:** All schema-validated artifacts parse as JSON and validate against their schemas:
- `Plans/plan_graph.json` vs `Plans/plan_graph.schema.json`
- Evidence bundles (`evidence.json`) vs `Plans/evidence.schema.json`
- Change budgets (embedded) vs `Plans/change_budget.schema.json`
- Auto decisions (JSONL rows) vs `Plans/auto_decisions.schema.json`

Required evidence:
- Evidence bundle conforming to `Plans/evidence.schema.json` with a `checks[]` entry for each schema validation.  
  ContractRef: SchemaID:evidence.schema.json

ContractRef: SchemaID:plan_graph.schema.json, SchemaID:evidence.schema.json, SchemaID:change_budget.schema.json, SchemaID:auto_decisions.schema.json

---

<a id="GATE-002"></a>
## GATE-002 -- Spec Lock integrity


**Pass condition:**
- `Plans/Spec_Lock.json` pins schema versions and locked decisions, and
- every `canonical_ssot_hashes.files[*].sha256` matches the current file contents for the listed SSOT files.

Required evidence:
- Evidence bundle entry that includes a Spec Lock hash verification report (must be empty / no mismatches).  
  ContractRef: SchemaID:evidence.schema.json

ContractRef: SchemaID:Spec_Lock.json, PolicyRule:Decision_Policy.md#spec-lock-update-protocol

---

<a id="GATE-003"></a>
## GATE-003 -- Architecture invariants
**Pass condition:** All referenced invariants hold for the change under test.

Minimum checks:
- `INV-002` secrets rule is not violated (no secrets in logs/state/events/evidence).
- `INV-010` naming rule is not violated in user-visible docs/strings.

Required evidence:
- Evidence bundle conforming to `Plans/evidence.schema.json`.
- A grep/audit summary showing no token-like strings persisted (implementation-specific).

**Script enforcement status:** Not currently enforced by `run-gates`; this gate is validated by dedicated invariant checks in implementation-specific verifiers.

ContractRef: Plans/Architecture_Invariants.md#INV-002, Plans/Architecture_Invariants.md#INV-010, SchemaID:evidence.schema.json

---

<a id="GATE-004"></a>
## GATE-004 -- Forbidden deps + drift phrases


**Pass condition:**
- No build-governing doc introduces forbidden dependencies from Spec Lock, and
- no drift phrases exist in build-governing docs: `TBD`, `Open Questions`, `ask later`.

**Script enforcement status:** `run-gates` currently enforces the drift-phrase half of this gate.

ContractRef: SchemaID:Spec_Lock.json#forbidden_deps, ContractName:Plans/DRY_Rules.md#4-forbidden-patterns-drift-accelerators

---

<a id="GATE-005"></a>
## GATE-005 -- Evidence required for completion
**Pass condition:** A node cannot be marked complete unless its evidence bundle exists and validates.

**Script enforcement status:** `run-gates` enforces this gate for non-example nodes in `Plans/plan_graph.json`.

ContractRef: SchemaID:evidence.schema.json, SchemaID:plan_graph.schema.json

---

<a id="GATE-006"></a>
## GATE-006 -- Change budget enforcement
**Pass condition:** The actual change stays within the node’s declared change budget (max files, LOC delta, allowed/forbidden paths/files).

**Script enforcement status:** `run-gates` enforces non-example node change-budget declaration completeness and schema validity (including bounded change fields).

ContractRef: SchemaID:change_budget.schema.json, SchemaID:plan_graph.schema.json

---

<a id="GATE-009"></a>
## GATE-009 -- ContractRef coverage
**Pass condition:** Every operational requirement line contains at least one `ContractRef:`.

Deterministic detection:
- Operational requirement line contains: `MUST`, `MUST NOT`, `SHALL`, `REQUIRED`, `NEVER`.

Required evidence:
- A report listing all operational lines missing `ContractRef:` (must be empty).

ContractRef: ContractName:Plans/DRY_Rules.md#7, ContractName:Plans/DRY_Rules.md#9

---

<a id="GATE-010"></a>
## GATE-010 -- Wiring matrix validation

`GATE-010` verifies canonical command binding and route-aware navigation normalization.

The gate must fail when any of the following are true:
- a public wrapper command lacks declared normalization metadata
- a deprecated alias is treated as an independent canonical command
- a routed command bypasses the canonical `route_target` / `OpenSubject` contract family
- routing-adjacent owner docs contain unresolved spec-integrity defects that make route/open verification ambiguous or contradictory
- a command row claims layout-only semantics while actually targeting a runtime object, usage object, or cross-surface focus action
- a command/action payload still keys approval or usage correlation by `request_id` or `tier_id` where blocked/runtime or usage identity is canonical
- command-family expansion is a broad-pass change: Source Control `git*`, GitHub Actions `actions*`, Docker Manager, and Docker `/registry/Kubernetes` command-family additions also require wiring-matrix expansion and renewed `GATE-010` coverage
- built-in chat command namespaces such as `git*` and `actions*` stay reserved; chat and file-tree surfaces are consumers of Source Control and GitHub Actions command contracts, not independent feature-owner command namespaces

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/Crosswalk.md

Evidence for this gate must capture:
- command ID
- command kind
- normalization metadata when present
- handler binding
- emitted target contract or action family
- failure reason when the row is invalid

ContractRef: ContractName:Plans/UI_Wiring_Rules.md, ContractName:Plans/evidence.schema.json, ContractName:Plans/Wiring_Matrix.schema.json
## GATE-011 -- Requirements traceability coverage


**Pass conditions (ALL must hold; deterministic, no soft thresholds, no flag-driven overrides):**

1. `.puppet-master/project/traceability/requirements_coverage.json` exists **and** validates against schema `pm.requirements_coverage.schema.v1` (cross-ref: `Plans/requirements_coverage.schema.json`).  
   ContractRef: SchemaID:pm.requirements_coverage.schema.v1, Gate:GATE-011
2. `.puppet-master/project/traceability/requirements_coverage.md` exists and all requirement IDs listed in the Markdown file match the JSON exactly — no additions, no omissions.  
   ContractRef: SchemaID:pm.requirements_coverage.schema.v1, Gate:GATE-011
3. `uncovered_requirements[]` is empty (equivalent: `summary.uncovered == 0`).  
   ContractRef: SchemaID:pm.requirements_coverage.schema.v1, Gate:GATE-011
4. `orphaned_node_requirement_refs[]` is empty (equivalent: `summary.orphaned_refs == 0`).  
   ContractRef: SchemaID:pm.requirements_coverage.schema.v1, SchemaID:pm.project-plan-node.v1, Gate:GATE-011
5. `uncovered_acceptance[]` is empty (equivalent: `summary.uncovered_acceptance_count == 0`).  
   ContractRef: SchemaID:pm.requirements_coverage.schema.v1, Gate:GATE-011
6. Every requirement in `requirements[]` maps to **at least one plan node** and **at least one acceptance check**:
   - `len(requirements[i].node_ids) >= 1`
   - `len(requirements[i].acceptance_check_ids) >= 1`  
   Deterministic enforcement: produce a machine-checkable violation list of `req_id`s that fail either predicate; list MUST be empty.  
   ContractRef: SchemaID:pm.requirements_coverage.schema.v1, SchemaID:pm.project-plan-node.v1, ContractName:Plans/Project_Output_Artifacts.md§11.4, Gate:GATE-011
7. Integrity checks 1–8 from `Plans/Project_Output_Artifacts.md §11.4` all pass (count consistency, list consistency, JSON↔MD sync, schema validity).  
   ContractRef: SchemaID:pm.requirements_coverage.schema.v1, Gate:GATE-011

**Fail condition:** Any pass condition (1–7) fails.  
ContractRef: Gate:GATE-011

**Required evidence:**
- Evidence bundle conforming to `Plans/evidence.schema.json` with `checks[]` entries:
   - `requirements_coverage_json_validates` — JSON validates against `pm.requirements_coverage.schema.v1`
   - `requirements_coverage_md_sync` — Markdown req IDs match JSON exactly (no additions, no omissions)
   - `no_uncovered_requirements` — `uncovered_requirements[]` empty
   - `no_orphaned_refs` — `orphaned_node_requirement_refs[]` empty
   - `no_uncovered_acceptance` — `uncovered_acceptance[]` empty
   - `per_requirement_minimum_mappings` — deterministic report proving every `req_id` has `node_ids >= 1` and `acceptance_check_ids >= 1` (violation list empty)
   - `integrity_checks_pass` — all integrity rules from `Plans/Project_Output_Artifacts.md §11.4` pass  
  - Evidence payload MUST include machine-readable failure detail fields for each check (for example `missing_in_md_ids[]`, `missing_in_json_ids[]`, `uncovered_requirement_ids[]`, `orphaned_refs[]`, `uncovered_acceptance_ids[]`, `missing_node_mapping_req_ids[]`, `missing_acceptance_mapping_req_ids[]`); all lists MUST be empty on PASS.  
   ContractRef: SchemaID:evidence.schema.json, Gate:GATE-011

**Script enforcement status:** Not currently enforced by `run-gates`; targeted for future enforcement after traceability tooling is in place.

ContractRef: SchemaID:pm.requirements_coverage.schema.v1, SchemaID:pm.project-plan-node.v1, SchemaID:evidence.schema.json, Gate:GATE-011, ContractName:Plans/Project_Output_Artifacts.md

---

<a id="GATE-012"></a>
## GATE-012 -- Requirements quality
### Evaluation moment and progression boundary

- GATE-012 evaluates the latest `.puppet-master/project/traceability/requirements_quality_report.json` produced by the requirements validation workflow.
- For this gate, “advance to the next plan node” means any transition from requirements-generation/validation into execution of executable plan-graph nodes, and any later attempt to resume execution after a prior `BLOCKED` result.
- Puppet Master MUST NOT start or resume executable plan-node progression while GATE-012 is `BLOCKED` or `FAIL`.

ContractRef: Gate:GATE-012, ContractName:Plans/chain-wizard-flexibility.md, ContractName:Plans/Decision_Policy.md#6.4-requirements-quality-report-boundary-severity-and-persistence

**Pass conditions (ALL must hold):**
1. `.puppet-master/project/traceability/requirements_quality_report.json` exists.
2. The file validates against schema `pm.requirements_quality_report.schema.v1` (cross-ref: `Plans/requirements_quality_report.schema.json`).
3. `verdict == "PASS"`.
4. `needs_user_clarification[]` is empty (length == 0).

**BLOCKED state (deterministic):**
- If `needs_user_clarification[]` is non-empty after a Puppet Master run, the gate enters BLOCKED state.
- In BLOCKED state: Puppet Master MUST NOT advance to the next plan node; instead it MUST surface each clarification item to the user via the UI escalation path (thread badge + in-thread clarification message + dashboard CtA).  
  ContractRef: Gate:GATE-012, PolicyRule:Decision_Policy.md§6, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/FinalGUISpec.md
- Puppet Master MUST NOT auto-resolve clarification items; each item MUST be resolved by explicit user input before re-running the gate.  
  ContractRef: Gate:GATE-012, PolicyRule:Decision_Policy.md§6, ContractName:Plans/assistant-chat-design.md
- Once the user resolves all items and the quality agent re-runs, producing `needs_user_clarification[] == []` and `verdict == "PASS"`, the gate transitions to PASS and progression resumes.

**Deterministic gate outcomes:**
- PASS: Conditions 1–4 hold.
- BLOCKED: Conditions 1–2 hold and `needs_user_clarification[]` is non-empty.
- FAIL: Missing/invalid report artifact (conditions 1–2 fail), or `needs_user_clarification[]` is empty while `verdict != "PASS"`.
ContractRef: Gate:GATE-012, SchemaID:pm.requirements_quality_report.schema.v1

Required evidence:
- Evidence bundle conforming to `Plans/evidence.schema.json` with `checks[]` entries:
   - Schema validation of `requirements_quality_report.json` against `pm.requirements_quality_report.schema.v1`
   - Deterministic gate-state classification evidence (`PASS` | `BLOCKED` | `FAIL`) derived from `verdict` + `needs_user_clarification[]`
   - PASS-path assertions (required when classified as PASS): `verdict == "PASS"` and `needs_user_clarification[]` is empty
    - BLOCKED-path escalation evidence (required when `needs_user_clarification[]` is non-empty):
      - Thread state transitioned to `attention_required` with unanswered-question count equal to `len(needs_user_clarification[])` (thread badge evidence).
        Cross-ref: `Plans/assistant-chat-design.md §11.1`
      - A dashboard clarification Call to Action was emitted and linked to the same clarification scope (wizard/thread context), consistent with dashboard CtA behavior.
        Cross-ref: `Plans/assistant-chat-design.md §21`
      - Clarification request payload/message evidence includes all `question_id`s from `needs_user_clarification[]` (no omissions).
        Cross-ref: `Plans/assistant-chat-design.md §11.2`
      - A persisted `requirements.clarification_requested` event exists for the same `wizard_id`, `thread_id`, and `question_id` set represented by the final blocked report.
        Cross-ref: `Plans/Contracts_V0.md §3.3`
      - A deterministic redaction check proves that `description`, `before`, `after`, `context`, and `question` fields in the stored report contain no secret-like values.
        Cross-ref: `Plans/Decision_Policy.md §6.4`
    - Unblock/re-run evidence (required before progression resumes from BLOCKED): subsequent report shows `needs_user_clarification[] == []` and `verdict == "PASS"`.
   ContractRef: SchemaID:evidence.schema.json, Gate:GATE-012, ContractName:Plans/assistant-chat-design.md, PolicyRule:Decision_Policy.md§6

**Script enforcement status:** Not yet enforced by `run-gates`; targeted for inclusion after traceability artifact generation is integrated.

ContractRef: SchemaID:pm.requirements_quality_report.schema.v1, Gate:GATE-012, SchemaID:evidence.schema.json, PolicyRule:Decision_Policy.md§6, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/FinalGUISpec.md

---

<a id="GATE-013"></a>
## GATE-013 -- Ambiguity marker resolution
**Canonical ambiguity marker format:** `<!-- AMBIGUOUS: <id> <description> -->` (HTML comment; works in Markdown and JSON strings).

Example: `<!-- AMBIGUOUS: AMB-001 Unclear whether this requirement applies to guest users -->`

**Pass conditions (ALL must hold):**
1. No unresolved ambiguity markers matching `<!-- AMBIGUOUS: <id> ... -->` exist in any of:
   - `.puppet-master/project/requirements.md`
   - `.puppet-master/project/plan.md`
   - Any file under `.puppet-master/project/contracts/` (contract fragments)
2. For each ambiguity marker ID that appears in any of the above files, a corresponding entry MUST exist in `.puppet-master/project/auto_decisions.jsonl` where the `applied_to[]` array contains the marker ID (e.g., `"AMB-001"`).  
   ContractRef: Gate:GATE-013, ContractName:Plans/Decision_Policy.md
3. The `auto_decisions.jsonl` entry MUST validate against `Plans/auto_decisions.schema.json`.  
   ContractRef: SchemaID:pm.auto_decisions.schema.v1, Gate:GATE-013, ContractName:Plans/Decision_Policy.md

**Ambiguity marker resolution rule (normative):**
- An ambiguity is unresolved only when an active `<!-- AMBIGUOUS: ... -->` marker lacks a matching schema-valid auto-decision row.
- Historical auto-decision rows MAY remain in `.puppet-master/project/auto_decisions.jsonl` after the corresponding marker is removed from current artifacts.
- Duplicate active ambiguity IDs in the current artifact set are a gate failure.

ContractRef: Gate:GATE-013, SchemaID:pm.auto_decisions.schema.v1

**Deterministic detection rules:**
- Scan: `grep -rn '<!-- AMBIGUOUS:' .puppet-master/project/requirements.md .puppet-master/project/plan.md .puppet-master/project/contracts/`
- For each match, extract the marker ID (second token after `AMBIGUOUS:`).
- Look up the marker ID in `.puppet-master/project/auto_decisions.jsonl` via `applied_to[]` field.
- If any marker ID has no corresponding `auto_decisions.jsonl` entry with a matching `applied_to[]` element: FAIL.
- If the scan returns zero matches AND `auto_decisions.jsonl` contains no entries with marker IDs in `applied_to[]`: PASS (no ambiguities exist).

Required evidence:
- Evidence bundle conforming to `Plans/evidence.schema.json` with `checks[]` entries:
  - Grep scan result (zero unresolved markers or full list matched to decisions)
  - For each resolved marker: the `decision_id` from the matching `auto_decisions.jsonl` row
  - Schema validation of each referenced `auto_decisions.jsonl` row against `pm.auto_decisions.schema.v1`  
  ContractRef: SchemaID:evidence.schema.json

**Script enforcement status:** Not yet enforced by `run-gates`; targeted for inclusion after traceability artifact generation is integrated.

ContractRef: SchemaID:pm.auto_decisions.schema.v1, Gate:GATE-013, SchemaID:evidence.schema.json, ContractName:Plans/Decision_Policy.md, ContractName:Plans/Project_Output_Artifacts.md

---

<a id="GATE-014"></a>
## GATE-014 -- Document Set packaging verification


`GATE-014` verifies packet completeness against the reconciled impacted-doc set.

The gate must fail when any of the following are true:
- a doc marked MUST CHANGE is absent from the packet
- a doc marked MUST RECONCILE is absent from the packet
- a packet uses append-only placement where canon replacement/retirement is required
- a packet targets a structured container indirectly instead of replacing the owning headed section with the final canonical content
- a packet preserves stale tier-era, request-era, or legacy tier-level gate text as a peer option rather than collapsing to the canonical `package_complete_gate`, `seam_complete_gate`, and `lane_complete_gate` model
- For Debug Mode and Investigation Context packetization, GATE-014 treats `Plans/Commands_System.md` (`/Commands_System.md`), `Plans/Glossary.md` (`/Glossary.md`), `Plans/FileManager.md` (`/FileManager.md`), and `Plans/human-in-the-loop.md` (`/human-in-the-loop.md`) as MUST RECONCILE docs whenever the packet touches debug dispatch commands, canonical debug/runtime terms, workspace-file attach/open behavior, or run-scoped investigation approvals.

ContractRef: ContractName:Plans/DRY_Rules.md, ContractName:Plans/Decision_Policy.md, ContractName:Plans/Contracts_V0.md

### 14.1 Packet Document Set Rule

`GATE-014` treats the packet document set as exactly the MUST CHANGE plus MUST RECONCILE docs. `MUST VERIFY` docs are pre-emit consistency checks, not primary packet docs. `protocol/checklist/reference` docs may be `MUST VERIFY` when they are mostly aligned but likely to become misleading if overlooked; they must be checked before packet emission even when they do not become packet write targets. Derived-only regen-only outputs such as `Plans/_shards/**` stay out of the packet intent set.

Verification-only docs may be absent from the packet only when the reconciliation pass explicitly confirmed they do not require edits for the current change set.

Instant Grep packet verification treats `Plans/Architecture_Invariants.md`, `Plans/BinaryLocator_Spec.md`, and `Plans/usage-feature.md` as impacted verification-only references; they may stay out of the packet only when reconciliation confirms their invariants, binary/helper discovery, and usage analytics contracts require no canonical edit.

ContractRef: ContractName:Plans/Decision_Log.md, ContractName:Plans/00-plans-index.md, ContractName:Plans/feature-list.md
## References
- `Plans/DRY_Rules.md`
- `Plans/Architecture_Invariants.md`
- `Plans/Decision_Policy.md`
- `Plans/evidence.schema.json`
- `Plans/auto_decisions.schema.json`
- `Plans/Project_Output_Artifacts.md`
- `Plans/requirements_coverage.schema.json`
- `Plans/requirements_quality_report.schema.json`
- `Plans/human-in-the-loop.md`
- `Plans/UI_Wiring_Rules.md`
- `Plans/Wiring_Matrix.schema.json`
- `Plans/Document_Packaging_Policy.md`

## Runtime Integrity and Recovery Gates Addendum (2026-03-08)

Add the following gate expectations.

### 1. Canonical graph integrity gate

A run MUST NOT proceed into canonical execution when the canonical sharded graph is invalid, cyclic, or internally inconsistent.
ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Decision_Policy.md, Gate:GATE-014

Required outcome:
- raise `graph_integrity` failure
- stop execution
- do not silently degrade to flat canonical execution

### 2. Safe-point-before-risk gate

Any mutation-capable attempt must have a valid runtime safe point before dispatch.

Missing safe point for a risky attempt is a gate failure.

### 3. Blocked-outcome correctness gate

UI/projections must keep blocked outcomes distinct from failures for:
- policy denial
- FileSafe blocks
- external side-effect confirmation blocks
- auth refresh blocks where the action never executed

### 4. Event-driven wakeup gate

Scheduler correctness must not depend on timer polling. Authoritative wakeups must be event-driven.

### 5. Wizard blocked-state gate

Wizard flows must recognize `blocked` as a canonical persisted state distinct from `attention_required`.

### 6. Acceptance criteria

- Invalid canonical graphs stop execution.
- Risky execution cannot run without a safe point.
- Blocked/failed semantics do not collapse into one UI state.
- Scheduler correctness does not depend on polling.
- Wizard blocked is treated as a real state, not a footnote.

## Post-Edit Verification Sweep Addendum (2026-03-08)

After applying the runtime scheduler packet, perform an explicit verification sweep across the affected docs and projections.

Required verification checks:
- `Executor_Protocol.md` no longer canonically defines pure lexicographic ready-node dispatch
- `chain-wizard-flexibility.md` canonical `wizard_status` enum includes `blocked`
- `assistant-chat-design.md` formally models `blocked` thread state instead of punting it out of scope
- `FinalGUISpec.md` includes `wizard_blocked` UI/card parity with recovery behavior
- `Contracts_V0.md`, `storage-plan.md`, `Run_Graph_View.md`, and `Orchestrator_Page.md` all expose the same scheduler/remediation field vocabulary
- `safe point`, `restore point`, and `rollback` are kept distinct in `storage-plan.md`, `newfeatures.md`, and `Crosswalk.md`
- `Tools.md`, `Permissions_System.md`, `FileSafe.md`, and `Containers_Registry_and_Unraid.md` agree on blocked-vs-failed semantics
- `Prompt_Pipeline.md` and `CLI_Bridged_Providers.md` preserve the runtime lineage metadata required for retries/remediation
- `GitHub_Integration.md` and wizard/deferred-launch paths preserve blocked-state resume behavior
- all new scheduler/remediation GUI surfaces still follow the event-driven/no-polling rewrite rule

This verification sweep is mandatory work, not an optional reminder.
## Runtime Packet Verification Gate Addendum (2026-03-09)

Progression gates for this feature set must confirm:
- executor, contracts, storage, UI, and provider docs all use the same attempt / blocked / safe-point / remediation terminology
- no remaining doc defines pure lexical dispatch as canonical runtime selection
- blocked outcomes are not mislabeled as generic failures
- draft decomposition fallback is scoped to pre-lock stages only
- queue-analysis visibility exists in at least one canonical UI surface
- a recovery-plan leaves active blockers unresolved by choosing `append` or `verify_only` when `replace_section` is required to repair or retire stale owner canon
- a Scribe packetization plan uses a standalone `replace_section` for a trailing subsection that has no later same-level peer heading; for example, when re-packetizing `Plans/Media_Generation_and_Capabilities.md`, `### 5.2 Disabled-reason messages` is not a safe standalone anchor because there is no later `###` before `## 6. Acceptance criteria`, so the plan targets `## 5. UI copy strings` or another true owner section instead of the trailing `### 5.2`
- Missing-spec recovery verifies all impacted topics, not only a narrow web-related subset, before the recovery work can be called complete.
- secondary buildability findings remain behind the ledger-backed missed-transfer set in packet verification priority and cannot be used to declare missed-transfer recovery complete
- Crosswalk and `/Progression` structural repair adds rewrite-era runtime/governance primitives/gates to canonical gate sections instead of leaving those requirements stranded in prose addenda

The gate should fail when any of the above are contradicted by packetized docs.
## Runtime Scheduler Packet Verification Canonical Alignment (2026-03-09)


Add verification checks for:
- canonical event-name precedence (`scheduler.pass` and related canonical names win over legacy aliases)
- no remaining primary lexical-dispatch wording in canonical executor/runtime sections
- graph-degradation fallback forbidden after `run.graph_canonical_locked`
- blocked outcomes remain distinct from failures in UI/projections
- permission/auth/approval/replan resolution emits same-cycle prerequisite wake behavior
- FileSafe restore-before-rerun override is honored when declared by blocked projections
## Runtime Packet Contradiction-Fail Verification Consolidation Addendum (2026-03-09)

The packet verification gate MUST fail if any of the following remain true in primary or summary docs:
ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Executor_Protocol.md, ContractName:Plans/UI_Command_Catalog.md
- any canonical executor/runtime section still defines lexical ready-node selection as the active dispatch rule
- any runtime-facing doc uses `recovery_options[]` or `allowed_actions[]` as the canonical shared blocked payload field
- any runtime-facing doc models blocked reasons as `failure_class` values
- any queue-analysis event/command/artifact uses `analysis_id` as canonical identity instead of `scheduler_pass_id`
- any core wizard/thread/dashboard section still models `attention_required` as the only paused clarification state
- any recovery command table lacks exact canonical command ids for runtime action families
- any provider/auth/tool doc still authorizes hidden local retry loops after runtime classification exists

## Field Name Verification Gate Update Addendum

### Gate rule clarification: canonical blocked-payload field name


The verification sweep rule that flags docs using `recovery_options[]` or `allowed_actions[]` as the canonical shared blocked-payload field now also flags any prescriptive usage (payload definition, schema, storage shape, or contract) of these deprecated names. The sole canonical name is `allowed_action_ids[]`.

The gate rule MUST:
1. Flag any doc that uses `recovery_options[]` or `allowed_actions[]` in a prescriptive context (not just as the canonical field name).
2. Accept `recovery_options[]` or `allowed_actions[]` only in deprecation notices, migration notes, or gate rules that detect their presence as a defect.
3. Verify that `allowed_action_ids[]` is used in all canonical blocked payloads, HITL contracts, FileSafe contracts, and container publishing contracts.

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/DRY_Rules.md

## Runtime Recovery Canonicalization Gate Addendum

The runtime recovery sweep MUST fail if any doc:
- uses `allowed_actions[]` or `recovery_options[]` in a prescriptive runtime-facing context
- uses `analysis_id` as canonical queue-analysis identity instead of `scheduler_pass_id`
- leaves stale canonical text in owner docs while only appending a contradictory later note
- treats blocked reasons as `failure_class` values in runtime policy or consumer contracts

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Crosswalk.md

Accept deprecated names only inside deprecation notices, migration notes, or gate rules that detect them as defects.

## Owner / Consumer Map

This source-preserving standardization keeps the owner and consumer boundaries stated in the original document body. During this batch, `Plans/Progression_Gates.md` remains the owner doc for the behavior described by its preserved sections, while cross-doc ownership follows the ContractRefs and boundary notes already present in the original text.

ContractRef: ContractName:Plans/Plan_Document_System.md, ContractName:Plans/Bootstrap_Planning_Migration.md

## PlanUnits

### PG-002 - Document Owner-Section Authority

```yaml
plan_unit_id: PG-002
unit_type: requirement
status: accepted
owner_doc: Plans/Progression_Gates.md
canonical_text: >-
  Progression_Gates.md is the canonical owner text for deterministic progression gates and preserves product, runtime, storage, UI, and governance requirements.
gui_related: true
gui_classification_reason: >-
  This unit includes GUI/UI/user-visible presentation or interactive control gate expectations.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
  - "Document Owner-Section Authority remains addressable as a fine-grained Progression Gates PlanUnit."
  - "ContractRefs, anchors, exact tokens, and negative constraints from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: progression_gate_drift
reasoning_tier: standard
context_scope: progression_gates
implementation_surfaces:
  - Plans/Progression_Gates.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Progression_Gates-S0001
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Progression_Gates-S0002
preserved_exact_tokens:
  - "Progression Gates (Canonical)"
  - "Canonical owner-section requirements"
  - "UI"
  - "governance"
negative_constraints: []
owner_hints:
  - Plans/Progression_Gates.md
```
### PG-003 - Naming And Compliance Constraint

```yaml
plan_unit_id: PG-003
unit_type: constraint
status: accepted
owner_doc: Plans/Progression_Gates.md
canonical_text: >-
  Progression_Gates.md follows DRY, Contracts, and Decision Policy references and uses only the Puppet Master name, with older names referenced only as legacy naming.
gui_related: false
gui_classification_reason: >-
  This unit defines verification, runtime, governance, or evidence behavior rather than visual presentation.
split_recommended: false
depends_on:
  - "PG-002"
unblocks: []
acceptance_criteria:
  - "Naming And Compliance Constraint remains addressable as a fine-grained Progression Gates PlanUnit."
  - "ContractRefs, anchors, exact tokens, and negative constraints from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: progression_gate_drift
reasoning_tier: standard
context_scope: progression_gates
implementation_surfaces:
  - Plans/Progression_Gates.md
node_compile_hint:
  mode: constraint
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Progression_Gates-S0003
preserved_exact_tokens:
  - "Puppet Master"
  - "legacy naming"
  - "DRY_Rules.md"
  - "Contracts_V0.md"
  - "Decision_Policy.md"
negative_constraints:
  - "Do not quote older product naming; refer to it only as legacy naming."
owner_hints:
  - Plans/Progression_Gates.md
```
### PG-004 - Deterministic Gate Scope

```yaml
plan_unit_id: PG-004
unit_type: requirement
status: accepted
owner_doc: Plans/Progression_Gates.md
canonical_text: >-
  Progression_Gates.md defines deterministic gates for validating plan quality and implementation evidence.
gui_related: false
gui_classification_reason: >-
  This unit defines verification, runtime, governance, or evidence behavior rather than visual presentation.
split_recommended: false
depends_on:
  - "PG-002"
unblocks: []
acceptance_criteria:
  - "Deterministic Gate Scope remains addressable as a fine-grained Progression Gates PlanUnit."
  - "ContractRefs, anchors, exact tokens, and negative constraints from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: progression_gate_drift
reasoning_tier: standard
context_scope: progression_gates
implementation_surfaces:
  - Plans/Progression_Gates.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Progression_Gates-S0004
preserved_exact_tokens:
  - "deterministic gates"
  - "plan quality"
  - "implementation evidence"
negative_constraints: []
owner_hints:
  - Plans/Progression_Gates.md
```
### PG-005 - P5 Gate Evidence Inventory

```yaml
plan_unit_id: PG-005
unit_type: requirement
status: accepted
owner_doc: Plans/Progression_Gates.md
canonical_text: >-
  Progression evidence must include supporting docs, graph and evidence schemas, gate status evidence, and numbered gate mappings when they affect gate status.
gui_related: false
gui_classification_reason: >-
  This unit defines verification, runtime, governance, or evidence behavior rather than visual presentation.
split_recommended: false
depends_on:
  - "PG-004"
unblocks: []
acceptance_criteria:
  - "P5 Gate Evidence Inventory remains addressable as a fine-grained Progression Gates PlanUnit."
  - "ContractRefs, anchors, exact tokens, and negative constraints from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: progression_gate_drift
reasoning_tier: standard
context_scope: progression_gates
implementation_surfaces:
  - Plans/Progression_Gates.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Progression_Gates-S0005
preserved_exact_tokens:
  - "run-gates"
  - "pm.evidence.schema.v1"
  - "/status"
  - "/evidence"
  - "tri-state"
  - "blocked"
negative_constraints:
  - "True blocked state must not collapse into attention-only evidence."
preserved_contractrefs:
  - "ContractRef: Primitive:Gate"
owner_hints:
  - Plans/Progression_Gates.md
```
### PG-006 - ContractRef Taxonomy And Owner Seams

```yaml
plan_unit_id: PG-006
unit_type: constraint
status: accepted
owner_doc: Plans/Progression_Gates.md
canonical_text: >-
  Gate evidence must keep ContractRef taxonomy and cross-owner seam docs visible when evaluating progression status.
gui_related: false
gui_classification_reason: >-
  This unit defines verification, runtime, governance, or evidence behavior rather than visual presentation.
split_recommended: false
depends_on:
  - "PG-005"
unblocks: []
acceptance_criteria:
  - "ContractRef Taxonomy And Owner Seams remains addressable as a fine-grained Progression Gates PlanUnit."
  - "ContractRefs, anchors, exact tokens, and negative constraints from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: progression_gate_drift
reasoning_tier: standard
context_scope: progression_gates
implementation_surfaces:
  - Plans/Progression_Gates.md
node_compile_hint:
  mode: constraint
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Progression_Gates-S0005
preserved_exact_tokens:
  - "ContractName taxonomy"
  - "SSOT"
  - "/term"
  - "Plans/Wiring_Matrix.schema.json"
  - "Plans/UI_Command_Catalog.md"
  - "Plans/Contracts_V0.md"
negative_constraints:
  - "ContractRef syntax must use the accepted ContractName taxonomy."
preserved_contractrefs:
  - "ContractRef: Primitive:Gate"
owner_hints:
  - Plans/Progression_Gates.md
```
### PG-007 - Command And Wiring Gate Normalization

```yaml
plan_unit_id: PG-007
unit_type: constraint
status: accepted
owner_doc: Plans/Progression_Gates.md
canonical_text: >-
  Command and wiring gates verify wrappers, aliases, command IDs, route primitives, normalization metadata, and evidence targets without inventing broad schema expansion.
gui_related: true
gui_classification_reason: >-
  This unit includes GUI/UI/user-visible presentation or interactive control gate expectations.
split_recommended: false
depends_on:
  - "PG-006"
unblocks: []
acceptance_criteria:
  - "Command And Wiring Gate Normalization remains addressable as a fine-grained Progression Gates PlanUnit."
  - "ContractRefs, anchors, exact tokens, and negative constraints from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: progression_gate_drift
reasoning_tier: standard
context_scope: progression_gates
implementation_surfaces:
  - Plans/Progression_Gates.md
node_compile_hint:
  mode: constraint
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Progression_Gates-S0005
preserved_exact_tokens:
  - "GATE-010"
  - "/wrapper"
  - "command-definition metadata"
  - "deprecated aliases"
  - "canonical primitive family"
  - "inspector_target = evidence"
negative_constraints:
  - "Do not over-expand wiring schema more than necessary."
preserved_contractrefs:
  - "ContractRef: Primitive:Gate"
owner_hints:
  - Plans/Progression_Gates.md
```
### PG-008 - Orchestrator Widget GUI Gate Visibility

```yaml
plan_unit_id: PG-008
unit_type: requirement
status: accepted
owner_doc: Plans/Progression_Gates.md
canonical_text: >-
  Orchestrator-facing gate expectations must keep run graph, widget, package, seam, lane, contamination, promotion, and projection-trust visibility in scope.
gui_related: true
gui_classification_reason: >-
  This unit includes GUI/UI/user-visible presentation or interactive control gate expectations.
split_recommended: false
depends_on:
  - "PG-005"
unblocks: []
acceptance_criteria:
  - "Orchestrator Widget GUI Gate Visibility remains addressable as a fine-grained Progression Gates PlanUnit."
  - "ContractRefs, anchors, exact tokens, and negative constraints from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: progression_gate_drift
reasoning_tier: standard
context_scope: progression_gates
implementation_surfaces:
  - Plans/Progression_Gates.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Progression_Gates-S0005
preserved_exact_tokens:
  - "FinalGUISpec.md"
  - "Run_Graph_View.md"
  - "Widget_System.md"
  - "widget.tier_tree"
  - "package"
  - "seam"
  - "lane"
negative_constraints:
  - "Stale upstream PASS conditions cannot create false confidence in progression gates."
preserved_contractrefs:
  - "ContractRef: Primitive:Gate"
owner_hints:
  - Plans/Progression_Gates.md
```
### PG-009 - Runtime HITL Approval State Semantics

```yaml
plan_unit_id: PG-009
unit_type: constraint
status: accepted
owner_doc: Plans/Progression_Gates.md
canonical_text: >-
  Runtime approval, HITL route, blocked identity, automation defaults, and shared progression states must align before gates depend on them.
gui_related: false
gui_classification_reason: >-
  This unit defines verification, runtime, governance, or evidence behavior rather than visual presentation.
split_recommended: false
depends_on:
  - "PG-005"
unblocks: []
acceptance_criteria:
  - "Runtime HITL Approval State Semantics remains addressable as a fine-grained Progression Gates PlanUnit."
  - "ContractRefs, anchors, exact tokens, and negative constraints from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: progression_gate_drift
reasoning_tier: standard
context_scope: progression_gates
implementation_surfaces:
  - Plans/Progression_Gates.md
node_compile_hint:
  mode: constraint
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Progression_Gates-S0005
preserved_exact_tokens:
  - "blocked_reason_code = waiting_approval"
  - "blocked_sequence"
  - "/runtime"
  - "allowed_actions"
  - "safe-point"
  - "restore provenance"
  - "attention_required"
  - "system_notification"
negative_constraints:
  - "allowed_actions in canonical-looking HITL storage shapes remains a gate risk until reflected in owner docs."
preserved_contractrefs:
  - "ContractRef: Primitive:Gate"
owner_hints:
  - Plans/Progression_Gates.md
```
### PG-010 - Gate Risk Gap And Stale Addenda Treatment

```yaml
plan_unit_id: PG-010
unit_type: constraint
status: accepted
owner_doc: Plans/Progression_Gates.md
canonical_text: >-
  Gate risk inventory must preserve transfer coverage blockers, stale addenda signals, and deprecated alias retirement as gate-risk inputs.
gui_related: false
gui_classification_reason: >-
  This unit defines verification, runtime, governance, or evidence behavior rather than visual presentation.
split_recommended: false
depends_on:
  - "PG-005"
unblocks: []
acceptance_criteria:
  - "Gate Risk Gap And Stale Addenda Treatment remains addressable as a fine-grained Progression Gates PlanUnit."
  - "ContractRefs, anchors, exact tokens, and negative constraints from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: progression_gate_drift
reasoning_tier: standard
context_scope: progression_gates
implementation_surfaces:
  - Plans/Progression_Gates.md
node_compile_hint:
  mode: constraint
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Progression_Gates-S0005
preserved_exact_tokens:
  - "cov-034"
  - "cov-511"
  - "cov-526"
  - "transfer-coverage"
  - "owner-definition"
  - "append-only addenda"
negative_constraints:
  - "Owner-definition gaps are not merely missing evidence-collection gaps."
preserved_contractrefs:
  - "ContractRef: Primitive:Gate"
owner_hints:
  - Plans/Progression_Gates.md
```
### PG-011 - Route-Aware Progression Owner Boundary

```yaml
plan_unit_id: PG-011
unit_type: requirement
status: accepted
owner_doc: Plans/Progression_Gates.md
canonical_text: >-
  Progression gates own promotion evidence, route/open packet verification, and compatibility checks before run sealing and archival.
gui_related: false
gui_classification_reason: >-
  This unit defines verification, runtime, governance, or evidence behavior rather than visual presentation.
split_recommended: false
depends_on:
  - "PG-004"
unblocks: []
acceptance_criteria:
  - "Route-Aware Progression Owner Boundary remains addressable as a fine-grained Progression Gates PlanUnit."
  - "ContractRefs, anchors, exact tokens, and negative constraints from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: progression_gate_drift
reasoning_tier: standard
context_scope: progression_gates
implementation_surfaces:
  - Plans/Progression_Gates.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Progression_Gates-S0006
preserved_exact_tokens:
  - "promotion evidence"
  - "route/open packet verification"
  - "compatibility checks"
  - "run sealing"
  - "archival"
negative_constraints: []
owner_hints:
  - Plans/Progression_Gates.md
```
### PG-012 - Promotion Classes And Evidence Fields

```yaml
plan_unit_id: PG-012
unit_type: requirement
status: accepted
owner_doc: Plans/Progression_Gates.md
canonical_text: >-
  Promotions use READY, STAGED, HELD, and REJECTED classes with required machine-readable evidence fields per class.
gui_related: false
gui_classification_reason: >-
  This unit defines verification, runtime, governance, or evidence behavior rather than visual presentation.
split_recommended: false
depends_on:
  - "PG-011"
unblocks: []
acceptance_criteria:
  - "Promotion Classes And Evidence Fields remains addressable as a fine-grained Progression Gates PlanUnit."
  - "ContractRefs, anchors, exact tokens, and negative constraints from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: progression_gate_drift
reasoning_tier: standard
context_scope: progression_gates
implementation_surfaces:
  - Plans/Progression_Gates.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Progression_Gates-S0007
preserved_exact_tokens:
  - "READY"
  - "STAGED"
  - "HELD"
  - "REJECTED"
  - "concern_summary"
  - "blockers"
  - "gate_waiver_rule"
negative_constraints: []
owner_hints:
  - Plans/Progression_Gates.md
```
### PG-013 - Route-Aware Wiring Evidence

```yaml
plan_unit_id: PG-013
unit_type: requirement
status: accepted
owner_doc: Plans/Progression_Gates.md
canonical_text: >-
  Route awareness requires target reachability, valid OpenSubject resolution, run-command reflection, and linked route side effects.
gui_related: false
gui_classification_reason: >-
  This unit defines verification, runtime, governance, or evidence behavior rather than visual presentation.
split_recommended: false
depends_on:
  - "PG-011"
unblocks: []
acceptance_criteria:
  - "Route-Aware Wiring Evidence remains addressable as a fine-grained Progression Gates PlanUnit."
  - "ContractRefs, anchors, exact tokens, and negative constraints from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: progression_gate_drift
reasoning_tier: standard
context_scope: progression_gates
implementation_surfaces:
  - Plans/Progression_Gates.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Progression_Gates-S0008
preserved_exact_tokens:
  - "route_target"
  - "OpenSubject"
  - "route_completion_refs[]"
negative_constraints: []
owner_hints:
  - Plans/Progression_Gates.md
```
### PG-014 - Packet Route/Open Checks

```yaml
plan_unit_id: PG-014
unit_type: requirement
status: accepted
owner_doc: Plans/Progression_Gates.md
canonical_text: >-
  Packet gates verify route targets, OpenSubject confirmations or waivers, and sealed cross-run artifact dependencies.
gui_related: false
gui_classification_reason: >-
  This unit defines verification, runtime, governance, or evidence behavior rather than visual presentation.
split_recommended: false
depends_on:
  - "PG-011"
unblocks: []
acceptance_criteria:
  - "Packet Route/Open Checks remains addressable as a fine-grained Progression Gates PlanUnit."
  - "ContractRefs, anchors, exact tokens, and negative constraints from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: progression_gate_drift
reasoning_tier: standard
context_scope: progression_gates
implementation_surfaces:
  - Plans/Progression_Gates.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Progression_Gates-S0009
preserved_exact_tokens:
  - "route_target"
  - "OpenSubject"
  - "cross-packet route/open references"
  - "sealed"
negative_constraints: []
owner_hints:
  - Plans/Progression_Gates.md
```
### PG-015 - Compatibility Fallback And Contradiction Rules

```yaml
plan_unit_id: PG-015
unit_type: constraint
status: accepted
owner_doc: Plans/Progression_Gates.md
canonical_text: >-
  Unreachable route targets enter HELD state, contradictory subject state emits REJECTION, and waivers require durable project config.
gui_related: false
gui_classification_reason: >-
  This unit defines verification, runtime, governance, or evidence behavior rather than visual presentation.
split_recommended: false
depends_on:
  - "PG-011"
unblocks: []
acceptance_criteria:
  - "Compatibility Fallback And Contradiction Rules remains addressable as a fine-grained Progression Gates PlanUnit."
  - "ContractRefs, anchors, exact tokens, and negative constraints from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: progression_gate_drift
reasoning_tier: standard
context_scope: progression_gates
implementation_surfaces:
  - Plans/Progression_Gates.md
node_compile_hint:
  mode: constraint
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Progression_Gates-S0010
preserved_exact_tokens:
  - "HELD"
  - "REJECTION"
  - "subject_state_contradiction"
  - "gate_waiver_rule"
negative_constraints:
  - "Route target loss or OpenSubject contradiction must not fail silently."
preserved_contractrefs:
  - "ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Decision_Policy.md"
owner_hints:
  - Plans/Progression_Gates.md
```
### PG-016 - Verifier Role And Run-Gates Coverage

```yaml
plan_unit_id: PG-016
unit_type: constraint
status: accepted
owner_doc: Plans/Progression_Gates.md
canonical_text: >-
  The AI Verifier runs gates exactly as written, blocks on any failure, relies only on machine-checkable artifacts, and exposes current run-gates coverage.
gui_related: false
gui_classification_reason: >-
  This unit defines verification, runtime, governance, or evidence behavior rather than visual presentation.
split_recommended: false
depends_on:
  - "PG-004"
unblocks: []
acceptance_criteria:
  - "Verifier Role And Run-Gates Coverage remains addressable as a fine-grained Progression Gates PlanUnit."
  - "ContractRefs, anchors, exact tokens, and negative constraints from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: progression_gate_drift
reasoning_tier: standard
context_scope: progression_gates
implementation_surfaces:
  - Plans/Progression_Gates.md
node_compile_hint:
  mode: constraint
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Progression_Gates-S0011
preserved_exact_tokens:
  - "AI-only"
  - "MUST"
  - "MUST NOT"
  - "python3 scripts/pm-plans-verify.py run-gates"
  - "GATE-001"
  - "GATE-014"
negative_constraints:
  - "The Verifier MUST NOT require a human to read logs or approve decisions."
preserved_contractrefs:
  - "ContractRef: Primitive:Gate"
  - "ContractRef: PolicyRule:Decision_Policy.md§4"
  - "ContractRef: SchemaID:plan_graph.schema.json"
  - "ContractRef: Gate:GATE-001, Gate:GATE-002, Gate:GATE-004, Gate:GATE-005, Gate:GATE-006, Gate:GATE-009, Gate:GATE-011, Gate:GATE-012, Gate:GATE-013, Gate:GATE-014"
owner_hints:
  - Plans/Progression_Gates.md
```
### PG-017 - Verifier Scope Boundary

```yaml
plan_unit_id: PG-017
unit_type: constraint
status: accepted
owner_doc: Plans/Progression_Gates.md
canonical_text: >-
  Repo-local run-gates governs build-governing Puppet Master repository artifacts; generated user-project artifacts must satisfy relevant contracts but need explicit validator coverage.
gui_related: false
gui_classification_reason: >-
  This unit defines verification, runtime, governance, or evidence behavior rather than visual presentation.
split_recommended: false
depends_on:
  - "PG-016"
unblocks: []
acceptance_criteria:
  - "Verifier Scope Boundary remains addressable as a fine-grained Progression Gates PlanUnit."
  - "ContractRefs, anchors, exact tokens, and negative constraints from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: progression_gate_drift
reasoning_tier: standard
context_scope: progression_gates
implementation_surfaces:
  - Plans/Progression_Gates.md
node_compile_hint:
  mode: constraint
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Progression_Gates-S0012
preserved_exact_tokens:
  - ".puppet-master/project/**"
  - "build-governing Puppet Master repository artifacts"
  - "run-gates"
negative_constraints:
  - "Generated user-project artifacts are not implied to be fully covered by the current repo-local run-gates script unless a validator explicitly targets them."
preserved_contractrefs:
  - "ContractRef: ContractName:Plans/Project_Output_Artifacts.md, Gate:GATE-011, Gate:GATE-012, Gate:GATE-013, Gate:GATE-014"
owner_hints:
  - Plans/Progression_Gates.md
```
### PG-018 - Top-Level Result Normalization

```yaml
plan_unit_id: PG-018
unit_type: constraint
status: accepted
owner_doc: Plans/Progression_Gates.md
canonical_text: >-
  Top-level progression treats any non-PASS as blocking while preserving gate-specific states, raw model IDs, recovery pointers, and review outcomes.
gui_related: false
gui_classification_reason: >-
  This unit defines verification, runtime, governance, or evidence behavior rather than visual presentation.
split_recommended: false
depends_on:
  - "PG-016"
unblocks: []
acceptance_criteria:
  - "Top-Level Result Normalization remains addressable as a fine-grained Progression Gates PlanUnit."
  - "ContractRefs, anchors, exact tokens, and negative constraints from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: progression_gate_drift
reasoning_tier: standard
context_scope: progression_gates
implementation_surfaces:
  - Plans/Progression_Gates.md
node_compile_hint:
  mode: constraint
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Progression_Gates-S0013
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Progression_Gates-S0014
preserved_exact_tokens:
  - "PASS"
  - "FAIL"
  - "blocking non-pass outcome"
  - "raw IDs exact"
  - "r-20260312-203855-07"
  - "packetized"
  - "quorum result"
negative_constraints:
  - "Any gate state other than PASS is a blocking non-pass top-level outcome."
preserved_contractrefs:
  - "ContractRef: Primitive:Gate, Gate:GATE-012, PolicyRule:Decision_Policy.md§2"
owner_hints:
  - Plans/Progression_Gates.md
```
### PG-019 - Route Result And FileManager UI Boundary

```yaml
plan_unit_id: PG-019
unit_type: constraint
status: accepted
owner_doc: Plans/Progression_Gates.md
canonical_text: >-
  Route evidence owns normalized route identity; FileManager UI may consume open/copy behavior but must not re-own route identity.
gui_related: true
gui_classification_reason: >-
  This unit explicitly separates route identity from FileManager UI open/copy presentation behavior.
split_recommended: false
depends_on:
  - "PG-018"
unblocks: []
acceptance_criteria:
  - "Route Result And FileManager UI Boundary remains addressable as a fine-grained Progression Gates PlanUnit."
  - "ContractRefs, anchors, exact tokens, and negative constraints from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: progression_gate_drift
reasoning_tier: standard
context_scope: progression_gates
implementation_surfaces:
  - Plans/Progression_Gates.md
node_compile_hint:
  mode: constraint
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Progression_Gates-S0014
preserved_exact_tokens:
  - "routing/deep-link normalization"
  - "FileManager UI conveniences"
  - "open/copy"
  - "normalized route identity"
negative_constraints:
  - "FileManager UI conveniences are not the owner of normalized route identity."
preserved_contractrefs:
  - "ContractRef: Primitive:Gate, Gate:GATE-012, PolicyRule:Decision_Policy.md§2"
owner_hints:
  - Plans/Progression_Gates.md
```
### PG-020 - Node-Model Gate Replacement

```yaml
plan_unit_id: PG-020
unit_type: requirement
status: accepted
owner_doc: Plans/Progression_Gates.md
canonical_text: >-
  Package, seam, and lane gates replace legacy tier-level gates while inheriting existing blocking, approval, timeout, and remediation behavior.
gui_related: false
gui_classification_reason: >-
  This unit defines verification, runtime, governance, or evidence behavior rather than visual presentation.
split_recommended: false
depends_on:
  - "PG-016"
unblocks: []
acceptance_criteria:
  - "Node-Model Gate Replacement remains addressable as a fine-grained Progression Gates PlanUnit."
  - "ContractRefs, anchors, exact tokens, and negative constraints from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: progression_gate_drift
reasoning_tier: standard
context_scope: progression_gates
implementation_surfaces:
  - Plans/Progression_Gates.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Progression_Gates-S0015
preserved_exact_tokens:
  - "Legacy tier-level gate definitions are replaced"
  - "package-"
  - "seam-"
  - "lane-scoped progression gates"
negative_constraints: []
preserved_contractrefs:
  - "ContractRef: Primitive:Gate, ContractName:Plans/Executor_Protocol.md, ContractName:Plans/human-in-the-loop.md"
owner_hints:
  - Plans/Progression_Gates.md
```
### PG-021 - Package Complete Gate

```yaml
plan_unit_id: PG-021
unit_type: requirement
status: accepted
owner_doc: Plans/Progression_Gates.md
canonical_text: >-
  A package cannot report completion until all constituent nodes are resolved to completed, skipped, or failed with remediation recorded.
gui_related: false
gui_classification_reason: >-
  This unit defines verification, runtime, governance, or evidence behavior rather than visual presentation.
split_recommended: false
depends_on:
  - "PG-020"
unblocks: []
acceptance_criteria:
  - "Package Complete Gate remains addressable as a fine-grained Progression Gates PlanUnit."
  - "ContractRefs, anchors, exact tokens, and negative constraints from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: progression_gate_drift
reasoning_tier: standard
context_scope: progression_gates
implementation_surfaces:
  - Plans/Progression_Gates.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Progression_Gates-S0016
preserved_exact_tokens:
  - "package_complete_gate"
  - "completed"
  - "skipped"
  - "failed"
  - "remediation recorded"
negative_constraints: []
preserved_contractrefs:
  - "ContractRef: Primitive:Gate, ContractName:Plans/Executor_Protocol.md, ContractName:Plans/human-in-the-loop.md"
owner_hints:
  - Plans/Progression_Gates.md
```
### PG-022 - Seam Complete Gate

```yaml
plan_unit_id: PG-022
unit_type: requirement
status: accepted
owner_doc: Plans/Progression_Gates.md
canonical_text: >-
  Seam completion requires source package completion, target prerequisites, transition readiness, contract compatibility, and feature-seam overseer coherence evidence.
gui_related: false
gui_classification_reason: >-
  This unit defines verification, runtime, governance, or evidence behavior rather than visual presentation.
split_recommended: false
depends_on:
  - "PG-020"
unblocks: []
acceptance_criteria:
  - "Seam Complete Gate remains addressable as a fine-grained Progression Gates PlanUnit."
  - "ContractRefs, anchors, exact tokens, and negative constraints from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: progression_gate_drift
reasoning_tier: standard
context_scope: progression_gates
implementation_surfaces:
  - Plans/Progression_Gates.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Progression_Gates-S0017
preserved_exact_tokens:
  - "seam_complete_gate"
  - "source package"
  - "target package prerequisites"
  - "feature-seam overseer evidence"
  - "authority to withhold"
negative_constraints: []
preserved_contractrefs:
  - "ContractRef: Primitive:Gate, ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Contracts_V0.md"
owner_hints:
  - Plans/Progression_Gates.md
```
### PG-023 - Lane Complete Gate

```yaml
plan_unit_id: PG-023
unit_type: requirement
status: accepted
owner_doc: Plans/Progression_Gates.md
canonical_text: >-
  A lane cannot report done until every assigned package satisfies package_complete_gate.
gui_related: false
gui_classification_reason: >-
  This unit defines verification, runtime, governance, or evidence behavior rather than visual presentation.
split_recommended: false
depends_on:
  - "PG-020"
unblocks: []
acceptance_criteria:
  - "Lane Complete Gate remains addressable as a fine-grained Progression Gates PlanUnit."
  - "ContractRefs, anchors, exact tokens, and negative constraints from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: progression_gate_drift
reasoning_tier: standard
context_scope: progression_gates
implementation_surfaces:
  - Plans/Progression_Gates.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Progression_Gates-S0018
preserved_exact_tokens:
  - "lane_complete_gate"
  - "package_complete_gate"
  - "done"
  - "GATE-001"
negative_constraints: []
preserved_contractrefs:
  - "ContractRef: Primitive:Gate, ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Contracts_V0.md"
owner_hints:
  - Plans/Progression_Gates.md
```
### PG-024 - GATE-001 Schema Validation

```yaml
plan_unit_id: PG-024
unit_type: requirement
status: accepted
owner_doc: Plans/Progression_Gates.md
canonical_text: >-
  GATE-001 validates schema-governed plan graph, evidence, change-budget, and auto-decision artifacts.
gui_related: false
gui_classification_reason: >-
  This unit defines verification, runtime, governance, or evidence behavior rather than visual presentation.
split_recommended: false
depends_on:
  - "PG-016"
unblocks: []
acceptance_criteria:
  - "GATE-001 Schema Validation remains addressable as a fine-grained Progression Gates PlanUnit."
  - "ContractRefs, anchors, exact tokens, and negative constraints from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: progression_gate_drift
reasoning_tier: standard
context_scope: progression_gates
implementation_surfaces:
  - Plans/Progression_Gates.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Progression_Gates-S0018
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Progression_Gates-S0019
preserved_exact_tokens:
  - "GATE-001"
  - "Plans/plan_graph.json"
  - "evidence.json"
  - "checks[]"
  - "GATE-002"
negative_constraints: []
preserved_contractrefs:
  - "ContractRef: SchemaID:evidence.schema.json"
  - "ContractRef: SchemaID:plan_graph.schema.json, SchemaID:evidence.schema.json, SchemaID:change_budget.schema.json, SchemaID:auto_decisions.schema.json"
owner_hints:
  - Plans/Progression_Gates.md
```
### PG-025 - GATE-002 Spec Lock Integrity

```yaml
plan_unit_id: PG-025
unit_type: constraint
status: accepted
owner_doc: Plans/Progression_Gates.md
canonical_text: >-
  GATE-002 verifies Spec Lock versions, locked decisions, and SSOT hashes with empty mismatch evidence.
gui_related: false
gui_classification_reason: >-
  This unit defines verification, runtime, governance, or evidence behavior rather than visual presentation.
split_recommended: false
depends_on:
  - "PG-016"
unblocks: []
acceptance_criteria:
  - "GATE-002 Spec Lock Integrity remains addressable as a fine-grained Progression Gates PlanUnit."
  - "ContractRefs, anchors, exact tokens, and negative constraints from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: progression_gate_drift
reasoning_tier: standard
context_scope: progression_gates
implementation_surfaces:
  - Plans/Progression_Gates.md
node_compile_hint:
  mode: constraint
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Progression_Gates-S0019
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Progression_Gates-S0020
preserved_exact_tokens:
  - "GATE-002"
  - "Plans/Spec_Lock.json"
  - "canonical_ssot_hashes.files[*].sha256"
  - "GATE-003"
negative_constraints:
  - "Spec Lock hash verification evidence must be empty of mismatches."
preserved_contractrefs:
  - "ContractRef: SchemaID:evidence.schema.json"
  - "ContractRef: SchemaID:Spec_Lock.json, PolicyRule:Decision_Policy.md#spec-lock-update-protocol"
owner_hints:
  - Plans/Progression_Gates.md
```
### PG-026 - GATE-003 Architecture Invariants

```yaml
plan_unit_id: PG-026
unit_type: constraint
status: accepted
owner_doc: Plans/Progression_Gates.md
canonical_text: >-
  GATE-003 requires invariant evidence for no secrets and naming compliance, currently via dedicated implementation verifiers rather than run-gates.
gui_related: false
gui_classification_reason: >-
  This unit defines verification, runtime, governance, or evidence behavior rather than visual presentation.
split_recommended: false
depends_on:
  - "PG-016"
unblocks: []
acceptance_criteria:
  - "GATE-003 Architecture Invariants remains addressable as a fine-grained Progression Gates PlanUnit."
  - "ContractRefs, anchors, exact tokens, and negative constraints from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: progression_gate_drift
reasoning_tier: standard
context_scope: progression_gates
implementation_surfaces:
  - Plans/Progression_Gates.md
node_compile_hint:
  mode: constraint
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Progression_Gates-S0020
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Progression_Gates-S0021
preserved_exact_tokens:
  - "GATE-003"
  - "INV-002"
  - "INV-010"
  - "no secrets"
  - "token-like strings"
  - "not currently enforced by run-gates"
negative_constraints:
  - "Secrets and token-like strings must not be persisted in logs, state, events, or evidence."
preserved_contractrefs:
  - "ContractRef: Plans/Architecture_Invariants.md#INV-002, Plans/Architecture_Invariants.md#INV-010, SchemaID:evidence.schema.json"
owner_hints:
  - Plans/Progression_Gates.md
```
### PG-027 - GATE-004 Forbidden Deps And Drift Phrases

```yaml
plan_unit_id: PG-027
unit_type: constraint
status: accepted
owner_doc: Plans/Progression_Gates.md
canonical_text: >-
  GATE-004 blocks forbidden dependencies and drift phrases; current run-gates enforces the drift-phrase half.
gui_related: false
gui_classification_reason: >-
  This unit defines verification, runtime, governance, or evidence behavior rather than visual presentation.
split_recommended: false
depends_on:
  - "PG-016"
unblocks: []
acceptance_criteria:
  - "GATE-004 Forbidden Deps And Drift Phrases remains addressable as a fine-grained Progression Gates PlanUnit."
  - "ContractRefs, anchors, exact tokens, and negative constraints from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: progression_gate_drift
reasoning_tier: standard
context_scope: progression_gates
implementation_surfaces:
  - Plans/Progression_Gates.md
node_compile_hint:
  mode: constraint
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Progression_Gates-S0021
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Progression_Gates-S0022
preserved_exact_tokens:
  - "GATE-004"
  - "TBD"
  - "Open Questions"
  - "ask later"
  - "forbidden deps"
negative_constraints:
  - "No build-governing doc may introduce forbidden dependencies or drift phrases."
preserved_contractrefs:
  - "ContractRef: SchemaID:Spec_Lock.json#forbidden_deps, ContractName:Plans/DRY_Rules.md#4-forbidden-patterns-drift-accelerators"
owner_hints:
  - Plans/Progression_Gates.md
```
### PG-028 - GATE-005 Completion Evidence

```yaml
plan_unit_id: PG-028
unit_type: constraint
status: accepted
owner_doc: Plans/Progression_Gates.md
canonical_text: >-
  GATE-005 prevents node completion unless its evidence bundle exists and validates.
gui_related: false
gui_classification_reason: >-
  This unit defines verification, runtime, governance, or evidence behavior rather than visual presentation.
split_recommended: false
depends_on:
  - "PG-016"
unblocks: []
acceptance_criteria:
  - "GATE-005 Completion Evidence remains addressable as a fine-grained Progression Gates PlanUnit."
  - "ContractRefs, anchors, exact tokens, and negative constraints from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: progression_gate_drift
reasoning_tier: standard
context_scope: progression_gates
implementation_surfaces:
  - Plans/Progression_Gates.md
node_compile_hint:
  mode: constraint
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Progression_Gates-S0022
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Progression_Gates-S0023
preserved_exact_tokens:
  - "GATE-005"
  - "node cannot be marked complete"
  - "evidence bundle"
  - "non-example nodes"
negative_constraints:
  - "A node cannot be marked complete unless its evidence bundle exists and validates."
preserved_contractrefs:
  - "ContractRef: SchemaID:evidence.schema.json, SchemaID:plan_graph.schema.json"
owner_hints:
  - Plans/Progression_Gates.md
```
### PG-029 - GATE-006 Change Budget

```yaml
plan_unit_id: PG-029
unit_type: constraint
status: accepted
owner_doc: Plans/Progression_Gates.md
canonical_text: >-
  GATE-006 requires actual changes to stay within declared node change budgets.
gui_related: false
gui_classification_reason: >-
  This unit defines verification, runtime, governance, or evidence behavior rather than visual presentation.
split_recommended: false
depends_on:
  - "PG-016"
unblocks: []
acceptance_criteria:
  - "GATE-006 Change Budget remains addressable as a fine-grained Progression Gates PlanUnit."
  - "ContractRefs, anchors, exact tokens, and negative constraints from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: progression_gate_drift
reasoning_tier: standard
context_scope: progression_gates
implementation_surfaces:
  - Plans/Progression_Gates.md
node_compile_hint:
  mode: constraint
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Progression_Gates-S0023
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Progression_Gates-S0024
preserved_exact_tokens:
  - "GATE-006"
  - "max files"
  - "LOC delta"
  - "allowed/forbidden paths/files"
  - "bounded change fields"
negative_constraints:
  - "Actual changes must stay within the node declared change budget."
preserved_contractrefs:
  - "ContractRef: SchemaID:change_budget.schema.json, SchemaID:plan_graph.schema.json"
owner_hints:
  - Plans/Progression_Gates.md
```
### PG-030 - GATE-009 ContractRef Coverage

```yaml
plan_unit_id: PG-030
unit_type: constraint
status: accepted
owner_doc: Plans/Progression_Gates.md
canonical_text: >-
  GATE-009 requires operational requirement lines to carry ContractRef coverage and emits an empty missing-line report on pass.
gui_related: false
gui_classification_reason: >-
  This unit defines verification, runtime, governance, or evidence behavior rather than visual presentation.
split_recommended: false
depends_on:
  - "PG-016"
unblocks: []
acceptance_criteria:
  - "GATE-009 ContractRef Coverage remains addressable as a fine-grained Progression Gates PlanUnit."
  - "ContractRefs, anchors, exact tokens, and negative constraints from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: progression_gate_drift
reasoning_tier: standard
context_scope: progression_gates
implementation_surfaces:
  - Plans/Progression_Gates.md
node_compile_hint:
  mode: constraint
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Progression_Gates-S0024
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Progression_Gates-S0025
preserved_exact_tokens:
  - "GATE-009"
  - "ContractRef:"
  - "MUST"
  - "MUST NOT"
  - "SHALL"
  - "REQUIRED"
  - "NEVER"
negative_constraints:
  - "The missing ContractRef report must be empty on pass."
preserved_contractrefs:
  - "ContractRef: ContractName:Plans/DRY_Rules.md#7, ContractName:Plans/DRY_Rules.md#9"
owner_hints:
  - Plans/Progression_Gates.md
```
### PG-031 - GATE-010 Route Command Failure Rules

```yaml
plan_unit_id: PG-031
unit_type: constraint
status: accepted
owner_doc: Plans/Progression_Gates.md
canonical_text: >-
  GATE-010 fails invalid wrapper, alias, routed-command, owner-defect, layout/runtime mismatch, stale identity, and reserved namespace cases.
gui_related: true
gui_classification_reason: >-
  This unit includes GUI/UI/user-visible presentation or interactive control gate expectations.
split_recommended: false
depends_on:
  - "PG-007"
  - "PG-013"
unblocks: []
acceptance_criteria:
  - "GATE-010 Route Command Failure Rules remains addressable as a fine-grained Progression Gates PlanUnit."
  - "ContractRefs, anchors, exact tokens, and negative constraints from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: progression_gate_drift
reasoning_tier: standard
context_scope: progression_gates
implementation_surfaces:
  - Plans/Progression_Gates.md
node_compile_hint:
  mode: constraint
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Progression_Gates-S0025
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Progression_Gates-S0026
preserved_exact_tokens:
  - "GATE-010"
  - "public wrapper command"
  - "deprecated alias"
  - "route_target"
  - "OpenSubject"
  - "request_id"
  - "tier_id"
  - "git*"
  - "actions*"
negative_constraints:
  - "Deprecated aliases must not be treated as independent canonical commands."
preserved_contractrefs:
  - "ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/Crosswalk.md"
owner_hints:
  - Plans/Progression_Gates.md
```
### PG-032 - GATE-010 Evidence Payload

```yaml
plan_unit_id: PG-032
unit_type: requirement
status: accepted
owner_doc: Plans/Progression_Gates.md
canonical_text: >-
  GATE-010 evidence captures command identity, kind, metadata, binding, emitted contract or action family, and invalid-row reason.
gui_related: false
gui_classification_reason: >-
  This unit defines verification, runtime, governance, or evidence behavior rather than visual presentation.
split_recommended: false
depends_on:
  - "PG-031"
unblocks: []
acceptance_criteria:
  - "GATE-010 Evidence Payload remains addressable as a fine-grained Progression Gates PlanUnit."
  - "ContractRefs, anchors, exact tokens, and negative constraints from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: progression_gate_drift
reasoning_tier: standard
context_scope: progression_gates
implementation_surfaces:
  - Plans/Progression_Gates.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Progression_Gates-S0026
preserved_exact_tokens:
  - "command ID"
  - "command kind"
  - "normalization metadata"
  - "handler binding"
  - "failure reason"
negative_constraints: []
preserved_contractrefs:
  - "ContractRef: ContractName:Plans/UI_Wiring_Rules.md, ContractName:Plans/evidence.schema.json, ContractName:Plans/Wiring_Matrix.schema.json"
owner_hints:
  - Plans/Progression_Gates.md
```
### PG-033 - GATE-011 Traceability Pass/Fail Conditions

```yaml
plan_unit_id: PG-033
unit_type: constraint
status: accepted
owner_doc: Plans/Progression_Gates.md
canonical_text: >-
  GATE-011 requires requirements coverage JSON/Markdown sync, schema validity, zero uncovered or orphaned coverage, and per-requirement node plus acceptance mappings.
gui_related: false
gui_classification_reason: >-
  This unit defines verification, runtime, governance, or evidence behavior rather than visual presentation.
split_recommended: false
depends_on:
  - "PG-016"
unblocks: []
acceptance_criteria:
  - "GATE-011 Traceability Pass/Fail Conditions remains addressable as a fine-grained Progression Gates PlanUnit."
  - "ContractRefs, anchors, exact tokens, and negative constraints from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: progression_gate_drift
reasoning_tier: standard
context_scope: progression_gates
implementation_surfaces:
  - Plans/Progression_Gates.md
node_compile_hint:
  mode: constraint
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Progression_Gates-S0027
preserved_exact_tokens:
  - "GATE-011"
  - "requirements_coverage.json"
  - "requirements_coverage.md"
  - "uncovered_requirements[]"
  - "orphaned_node_requirement_refs[]"
  - "uncovered_acceptance[]"
negative_constraints:
  - "All uncovered, orphaned, and missing mapping lists must be empty."
preserved_contractrefs:
  - "ContractRef: SchemaID:pm.requirements_coverage.schema.v1, Gate:GATE-011"
  - "ContractRef: SchemaID:pm.requirements_coverage.schema.v1, SchemaID:pm.project-plan-node.v1, ContractName:Plans/Project_Output_Artifacts.md§11.4, Gate:GATE-011"
  - "ContractRef: Gate:GATE-011"
owner_hints:
  - Plans/Progression_Gates.md
```
### PG-034 - GATE-011 Evidence And Enforcement Status

```yaml
plan_unit_id: PG-034
unit_type: requirement
status: accepted
owner_doc: Plans/Progression_Gates.md
canonical_text: >-
  GATE-011 evidence must include machine-readable check entries and failure-detail arrays; script enforcement remains future traceability-tooling work.
gui_related: false
gui_classification_reason: >-
  This unit defines verification, runtime, governance, or evidence behavior rather than visual presentation.
split_recommended: false
depends_on:
  - "PG-033"
unblocks: []
acceptance_criteria:
  - "GATE-011 Evidence And Enforcement Status remains addressable as a fine-grained Progression Gates PlanUnit."
  - "ContractRefs, anchors, exact tokens, and negative constraints from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: progression_gate_drift
reasoning_tier: standard
context_scope: progression_gates
implementation_surfaces:
  - Plans/Progression_Gates.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Progression_Gates-S0027
preserved_exact_tokens:
  - "requirements_coverage_json_validates"
  - "requirements_coverage_md_sync"
  - "per_requirement_minimum_mappings"
  - "integrity_checks_pass"
  - "missing_in_md_ids[]"
negative_constraints:
  - "All failure-detail arrays must be empty on PASS."
preserved_contractrefs:
  - "ContractRef: SchemaID:evidence.schema.json, Gate:GATE-011"
  - "ContractRef: SchemaID:pm.requirements_coverage.schema.v1, SchemaID:pm.project-plan-node.v1, SchemaID:evidence.schema.json, Gate:GATE-011, ContractName:Plans/Project_Output_Artifacts.md"
owner_hints:
  - Plans/Progression_Gates.md
```
### PG-035 - GATE-012 Requirements Quality Boundary

```yaml
plan_unit_id: PG-035
unit_type: constraint
status: accepted
owner_doc: Plans/Progression_Gates.md
canonical_text: >-
  GATE-012 evaluates the latest requirements quality report and blocks executable plan-node progression unless the report exists, validates, passes, and has no clarification items.
gui_related: false
gui_classification_reason: >-
  This unit defines verification, runtime, governance, or evidence behavior rather than visual presentation.
split_recommended: false
depends_on:
  - "PG-016"
  - "PG-018"
unblocks: []
acceptance_criteria:
  - "GATE-012 Requirements Quality Boundary remains addressable as a fine-grained Progression Gates PlanUnit."
  - "ContractRefs, anchors, exact tokens, and negative constraints from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: progression_gate_drift
reasoning_tier: standard
context_scope: progression_gates
implementation_surfaces:
  - Plans/Progression_Gates.md
node_compile_hint:
  mode: constraint
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Progression_Gates-S0027
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Progression_Gates-S0028
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Progression_Gates-S0029
preserved_exact_tokens:
  - "GATE-012"
  - "requirements_quality_report.json"
  - "pm.requirements_quality_report.schema.v1"
  - "verdict == \"PASS\""
  - "needs_user_clarification[]"
  - "BLOCKED"
  - "FAIL"
negative_constraints:
  - "Puppet Master MUST NOT start or resume executable plan-node progression while GATE-012 is BLOCKED or FAIL."
preserved_contractrefs:
  - "ContractRef: Gate:GATE-012, ContractName:Plans/chain-wizard-flexibility.md, ContractName:Plans/Decision_Policy.md#6.4-requirements-quality-report-boundary-severity-and-persistence"
  - "ContractRef: Gate:GATE-012, SchemaID:pm.requirements_quality_report.schema.v1"
owner_hints:
  - Plans/Progression_Gates.md
```
### PG-036 - GATE-012 Clarification Escalation

```yaml
plan_unit_id: PG-036
unit_type: requirement
status: accepted
owner_doc: Plans/Progression_Gates.md
canonical_text: >-
  Non-empty needs_user_clarification[] puts GATE-012 in BLOCKED and must surface every clarification item through the UI escalation path until explicit user input resolves it.
gui_related: true
gui_classification_reason: >-
  This unit defines user-visible blocked clarification escalation through thread and dashboard UI surfaces.
split_recommended: false
depends_on:
  - "PG-035"
unblocks: []
acceptance_criteria:
  - "GATE-012 Clarification Escalation remains addressable as a fine-grained Progression Gates PlanUnit."
  - "ContractRefs, anchors, exact tokens, and negative constraints from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: progression_gate_drift
reasoning_tier: standard
context_scope: progression_gates
implementation_surfaces:
  - Plans/Progression_Gates.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Progression_Gates-S0029
preserved_exact_tokens:
  - "thread badge"
  - "in-thread clarification message"
  - "dashboard CtA"
  - "attention_required"
  - "requirements.clarification_requested"
  - "wizard_id"
  - "thread_id"
  - "question_id"
negative_constraints:
  - "Puppet Master MUST NOT advance while clarification items are unresolved."
  - "Puppet Master MUST NOT auto-resolve clarification items."
preserved_contractrefs:
  - "ContractRef: Gate:GATE-012, PolicyRule:Decision_Policy.md§6, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/FinalGUISpec.md"
owner_hints:
  - Plans/Progression_Gates.md
```
### PG-037 - GATE-012 Evidence And Re-Run

```yaml
plan_unit_id: PG-037
unit_type: validation_rule
status: accepted
owner_doc: Plans/Progression_Gates.md
canonical_text: >-
  GATE-012 evidence must classify state from verdict plus needs_user_clarification[], include blocked escalation and redaction evidence, and require a later PASS report before progression resumes.
gui_related: true
gui_classification_reason: >-
  This unit includes UI escalation evidence and blocked-state presentation validation.
split_recommended: false
depends_on:
  - "PG-035"
  - "PG-036"
unblocks: []
acceptance_criteria:
  - "GATE-012 Evidence And Re-Run remains addressable as a fine-grained Progression Gates PlanUnit."
  - "ContractRefs, anchors, exact tokens, and negative constraints from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: progression_gate_drift
reasoning_tier: standard
context_scope: progression_gates
implementation_surfaces:
  - Plans/Progression_Gates.md
node_compile_hint:
  mode: validation_rule
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Progression_Gates-S0029
preserved_exact_tokens:
  - "checks[]"
  - "PASS"
  - "BLOCKED"
  - "FAIL"
  - "description"
  - "before"
  - "after"
  - "context"
  - "question"
  - "run-gates"
negative_constraints:
  - "Redaction evidence must prove stored report fields contain no secret-like values."
  - "Progression resumes only after a subsequent report shows needs_user_clarification[] empty and verdict PASS."
preserved_contractrefs:
  - "ContractRef: SchemaID:evidence.schema.json, Gate:GATE-012, ContractName:Plans/assistant-chat-design.md, PolicyRule:Decision_Policy.md§6"
  - "ContractRef: SchemaID:pm.requirements_quality_report.schema.v1, Gate:GATE-012, SchemaID:evidence.schema.json, PolicyRule:Decision_Policy.md§6, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/FinalGUISpec.md"
owner_hints:
  - Plans/Progression_Gates.md
```
### PG-038 - GATE-013 Ambiguity Marker Resolution

```yaml
plan_unit_id: PG-038
unit_type: constraint
status: accepted
owner_doc: Plans/Progression_Gates.md
canonical_text: >-
  GATE-013 requires every active ambiguity marker to have a schema-valid auto-decision row whose applied_to[] contains that marker ID.
gui_related: false
gui_classification_reason: >-
  This unit defines verification, runtime, governance, or evidence behavior rather than visual presentation.
split_recommended: false
depends_on:
  - "PG-016"
unblocks: []
acceptance_criteria:
  - "GATE-013 Ambiguity Marker Resolution remains addressable as a fine-grained Progression Gates PlanUnit."
  - "ContractRefs, anchors, exact tokens, and negative constraints from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: progression_gate_drift
reasoning_tier: standard
context_scope: progression_gates
implementation_surfaces:
  - Plans/Progression_Gates.md
node_compile_hint:
  mode: constraint
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Progression_Gates-S0030
preserved_exact_tokens:
  - "<!-- AMBIGUOUS: <id> <description> -->"
  - "AMB-001"
  - ".puppet-master/project/requirements.md"
  - ".puppet-master/project/plan.md"
  - ".puppet-master/project/contracts/"
  - "auto_decisions.jsonl"
  - "applied_to[]"
negative_constraints:
  - "Duplicate active ambiguity IDs in the current artifact set are a gate failure."
preserved_contractrefs:
  - "ContractRef: Gate:GATE-013, ContractName:Plans/Decision_Policy.md"
  - "ContractRef: SchemaID:pm.auto_decisions.schema.v1, Gate:GATE-013, ContractName:Plans/Decision_Policy.md"
  - "ContractRef: Gate:GATE-013, SchemaID:pm.auto_decisions.schema.v1"
owner_hints:
  - Plans/Progression_Gates.md
```
### PG-039 - GATE-013 Detection And Evidence

```yaml
plan_unit_id: PG-039
unit_type: validation_rule
status: accepted
owner_doc: Plans/Progression_Gates.md
canonical_text: >-
  GATE-013 detection scans project artifacts, extracts marker IDs, validates matching decisions, and records grep plus decision evidence.
gui_related: false
gui_classification_reason: >-
  This unit defines verification, runtime, governance, or evidence behavior rather than visual presentation.
split_recommended: false
depends_on:
  - "PG-038"
unblocks: []
acceptance_criteria:
  - "GATE-013 Detection And Evidence remains addressable as a fine-grained Progression Gates PlanUnit."
  - "ContractRefs, anchors, exact tokens, and negative constraints from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: progression_gate_drift
reasoning_tier: standard
context_scope: progression_gates
implementation_surfaces:
  - Plans/Progression_Gates.md
node_compile_hint:
  mode: validation_rule
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Progression_Gates-S0030
preserved_exact_tokens:
  - "grep -rn '<!-- AMBIGUOUS:'"
  - "decision_id"
  - "checks[]"
  - "pm.auto_decisions.schema.v1"
negative_constraints:
  - "A marker ID with no corresponding auto_decisions.jsonl entry matching applied_to[] is a FAIL."
preserved_contractrefs:
  - "ContractRef: SchemaID:evidence.schema.json"
  - "ContractRef: SchemaID:pm.auto_decisions.schema.v1, Gate:GATE-013, SchemaID:evidence.schema.json, ContractName:Plans/Decision_Policy.md, ContractName:Plans/Project_Output_Artifacts.md"
owner_hints:
  - Plans/Progression_Gates.md
```
### PG-040 - GATE-014 Packet Fail Conditions

```yaml
plan_unit_id: PG-040
unit_type: constraint
status: accepted
owner_doc: Plans/Progression_Gates.md
canonical_text: >-
  GATE-014 fails packets that omit required docs, use append-only placement where replacement is required, target containers indirectly, or preserve stale gate models as peers.
gui_related: false
gui_classification_reason: >-
  This unit defines verification, runtime, governance, or evidence behavior rather than visual presentation.
split_recommended: false
depends_on:
  - "PG-016"
  - "PG-020"
unblocks: []
acceptance_criteria:
  - "GATE-014 Packet Fail Conditions remains addressable as a fine-grained Progression Gates PlanUnit."
  - "ContractRefs, anchors, exact tokens, and negative constraints from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: progression_gate_drift
reasoning_tier: standard
context_scope: progression_gates
implementation_surfaces:
  - Plans/Progression_Gates.md
node_compile_hint:
  mode: constraint
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Progression_Gates-S0031
preserved_exact_tokens:
  - "MUST CHANGE"
  - "MUST RECONCILE"
  - "append-only"
  - "structured container"
  - "package_complete_gate"
  - "seam_complete_gate"
  - "lane_complete_gate"
  - "Debug Mode"
  - "Investigation Context"
negative_constraints:
  - "Packets must not preserve stale tier-era, request-era, or legacy tier-level gate text as peer options."
preserved_contractrefs:
  - "ContractRef: ContractName:Plans/DRY_Rules.md, ContractName:Plans/Decision_Policy.md, ContractName:Plans/Contracts_V0.md"
owner_hints:
  - Plans/Progression_Gates.md
```
### PG-041 - Packet Document Set Rule

```yaml
plan_unit_id: PG-041
unit_type: requirement
status: accepted
owner_doc: Plans/Progression_Gates.md
canonical_text: >-
  GATE-014 packet scope is MUST CHANGE plus MUST RECONCILE; MUST VERIFY docs are pre-emit checks and derived-only regen outputs stay out of packet intent.
gui_related: false
gui_classification_reason: >-
  This unit defines verification, runtime, governance, or evidence behavior rather than visual presentation.
split_recommended: false
depends_on:
  - "PG-040"
unblocks: []
acceptance_criteria:
  - "Packet Document Set Rule remains addressable as a fine-grained Progression Gates PlanUnit."
  - "ContractRefs, anchors, exact tokens, and negative constraints from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: progression_gate_drift
reasoning_tier: standard
context_scope: progression_gates
implementation_surfaces:
  - Plans/Progression_Gates.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Progression_Gates-S0032
preserved_exact_tokens:
  - "MUST VERIFY"
  - "protocol/checklist/reference"
  - "Plans/_shards/**"
  - "Architecture_Invariants.md"
  - "BinaryLocator_Spec.md"
  - "usage-feature.md"
negative_constraints:
  - "Verification-only docs may be absent from the packet only when reconciliation confirms they require no edits."
preserved_contractrefs:
  - "ContractRef: ContractName:Plans/Decision_Log.md, ContractName:Plans/00-plans-index.md, ContractName:Plans/feature-list.md"
owner_hints:
  - Plans/Progression_Gates.md
```
### PG-042 - Runtime Integrity Addendum Boundary

```yaml
plan_unit_id: PG-042
unit_type: requirement
status: accepted
owner_doc: Plans/Progression_Gates.md
canonical_text: >-
  The runtime integrity addendum introduces additional gate expectations for graph integrity, safe points, blocked semantics, wakeups, wizard blocked state, and acceptance criteria.
gui_related: false
gui_classification_reason: >-
  This unit defines verification, runtime, governance, or evidence behavior rather than visual presentation.
split_recommended: false
depends_on:
  - "PG-040"
unblocks: []
acceptance_criteria:
  - "Runtime Integrity Addendum Boundary remains addressable as a fine-grained Progression Gates PlanUnit."
  - "ContractRefs, anchors, exact tokens, and negative constraints from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: progression_gate_drift
reasoning_tier: standard
context_scope: progression_gates
implementation_surfaces:
  - Plans/Progression_Gates.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Progression_Gates-S0034
preserved_exact_tokens:
  - "Runtime Integrity and Recovery Gates Addendum (2026-03-08)"
  - "Add the following gate expectations"
negative_constraints: []
owner_hints:
  - Plans/Progression_Gates.md
```
### PG-043 - Canonical Graph Integrity Gate

```yaml
plan_unit_id: PG-043
unit_type: constraint
status: accepted
owner_doc: Plans/Progression_Gates.md
canonical_text: >-
  Runs must not enter canonical execution when the canonical sharded graph is invalid, cyclic, or internally inconsistent.
gui_related: false
gui_classification_reason: >-
  This unit defines verification, runtime, governance, or evidence behavior rather than visual presentation.
split_recommended: false
depends_on:
  - "PG-042"
unblocks: []
acceptance_criteria:
  - "Canonical Graph Integrity Gate remains addressable as a fine-grained Progression Gates PlanUnit."
  - "ContractRefs, anchors, exact tokens, and negative constraints from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: progression_gate_drift
reasoning_tier: standard
context_scope: progression_gates
implementation_surfaces:
  - Plans/Progression_Gates.md
node_compile_hint:
  mode: constraint
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Progression_Gates-S0035
preserved_exact_tokens:
  - "canonical sharded graph"
  - "graph_integrity"
  - "stop execution"
  - "do not silently degrade to flat canonical execution"
negative_constraints:
  - "A run MUST NOT proceed into canonical execution when the canonical sharded graph is invalid, cyclic, or internally inconsistent."
preserved_contractrefs:
  - "ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Decision_Policy.md, Gate:GATE-014"
owner_hints:
  - Plans/Progression_Gates.md
```
### PG-044 - Safe-Point Before Risk Gate

```yaml
plan_unit_id: PG-044
unit_type: constraint
status: accepted
owner_doc: Plans/Progression_Gates.md
canonical_text: >-
  Mutation-capable attempts require a valid runtime safe point before dispatch.
gui_related: false
gui_classification_reason: >-
  This unit defines verification, runtime, governance, or evidence behavior rather than visual presentation.
split_recommended: false
depends_on:
  - "PG-042"
unblocks: []
acceptance_criteria:
  - "Safe-Point Before Risk Gate remains addressable as a fine-grained Progression Gates PlanUnit."
  - "ContractRefs, anchors, exact tokens, and negative constraints from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: progression_gate_drift
reasoning_tier: standard
context_scope: progression_gates
implementation_surfaces:
  - Plans/Progression_Gates.md
node_compile_hint:
  mode: constraint
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Progression_Gates-S0036
preserved_exact_tokens:
  - "mutation-capable attempt"
  - "valid runtime safe point"
  - "risky attempt"
negative_constraints:
  - "Missing safe point for a risky attempt is a gate failure."
owner_hints:
  - Plans/Progression_Gates.md
```
### PG-045 - Blocked Outcome Correctness Gate

```yaml
plan_unit_id: PG-045
unit_type: constraint
status: accepted
owner_doc: Plans/Progression_Gates.md
canonical_text: >-
  UI and projections must not collapse blocked outcomes into failures for policy, FileSafe, side-effect confirmation, or auth-refresh blocks.
gui_related: true
gui_classification_reason: >-
  This unit governs user-visible UI/projection state separation for blocked outcomes.
split_recommended: false
depends_on:
  - "PG-042"
unblocks: []
acceptance_criteria:
  - "Blocked Outcome Correctness Gate remains addressable as a fine-grained Progression Gates PlanUnit."
  - "ContractRefs, anchors, exact tokens, and negative constraints from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: progression_gate_drift
reasoning_tier: standard
context_scope: progression_gates
implementation_surfaces:
  - Plans/Progression_Gates.md
node_compile_hint:
  mode: constraint
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Progression_Gates-S0037
preserved_exact_tokens:
  - "UI/projections"
  - "blocked outcomes"
  - "policy denial"
  - "FileSafe blocks"
  - "external side-effect confirmation blocks"
  - "auth refresh blocks"
negative_constraints:
  - "Blocked outcomes must stay distinct from failures."
owner_hints:
  - Plans/Progression_Gates.md
```
### PG-046 - Event-Driven Wakeup Gate

```yaml
plan_unit_id: PG-046
unit_type: constraint
status: accepted
owner_doc: Plans/Progression_Gates.md
canonical_text: >-
  Scheduler correctness must use event-driven authoritative wakeups rather than timer polling.
gui_related: false
gui_classification_reason: >-
  This unit defines verification, runtime, governance, or evidence behavior rather than visual presentation.
split_recommended: false
depends_on:
  - "PG-042"
unblocks: []
acceptance_criteria:
  - "Event-Driven Wakeup Gate remains addressable as a fine-grained Progression Gates PlanUnit."
  - "ContractRefs, anchors, exact tokens, and negative constraints from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: progression_gate_drift
reasoning_tier: standard
context_scope: progression_gates
implementation_surfaces:
  - Plans/Progression_Gates.md
node_compile_hint:
  mode: constraint
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Progression_Gates-S0038
preserved_exact_tokens:
  - "Scheduler correctness"
  - "timer polling"
  - "Authoritative wakeups"
  - "event-driven"
negative_constraints:
  - "Scheduler correctness must not depend on timer polling."
owner_hints:
  - Plans/Progression_Gates.md
```
### PG-047 - Wizard Blocked State Gate

```yaml
plan_unit_id: PG-047
unit_type: requirement
status: accepted
owner_doc: Plans/Progression_Gates.md
canonical_text: >-
  Wizard flows must persist blocked as a canonical state distinct from attention_required.
gui_related: false
gui_classification_reason: >-
  This unit defines verification, runtime, governance, or evidence behavior rather than visual presentation.
split_recommended: false
depends_on:
  - "PG-042"
unblocks: []
acceptance_criteria:
  - "Wizard Blocked State Gate remains addressable as a fine-grained Progression Gates PlanUnit."
  - "ContractRefs, anchors, exact tokens, and negative constraints from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: progression_gate_drift
reasoning_tier: standard
context_scope: progression_gates
implementation_surfaces:
  - Plans/Progression_Gates.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Progression_Gates-S0039
preserved_exact_tokens:
  - "blocked"
  - "canonical persisted state"
  - "attention_required"
negative_constraints:
  - "Wizard blocked state must not collapse into attention_required."
owner_hints:
  - Plans/Progression_Gates.md
```
### PG-048 - Runtime Integrity Acceptance Criteria

```yaml
plan_unit_id: PG-048
unit_type: validation_rule
status: accepted
owner_doc: Plans/Progression_Gates.md
canonical_text: >-
  Runtime integrity acceptance requires graph stop, safe-point enforcement, blocked/failed UI separation, event-driven scheduling, and real wizard blocked handling.
gui_related: true
gui_classification_reason: >-
  This unit includes acceptance for blocked/failed UI state separation.
split_recommended: false
depends_on:
  - "PG-043"
  - "PG-044"
  - "PG-045"
  - "PG-046"
  - "PG-047"
unblocks: []
acceptance_criteria:
  - "Runtime Integrity Acceptance Criteria remains addressable as a fine-grained Progression Gates PlanUnit."
  - "ContractRefs, anchors, exact tokens, and negative constraints from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: progression_gate_drift
reasoning_tier: standard
context_scope: progression_gates
implementation_surfaces:
  - Plans/Progression_Gates.md
node_compile_hint:
  mode: validation_rule
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Progression_Gates-S0040
preserved_exact_tokens:
  - "Invalid canonical graphs stop execution"
  - "Risky execution"
  - "Blocked/failed semantics"
  - "UI state"
  - "Scheduler correctness"
  - "Wizard blocked"
negative_constraints: []
owner_hints:
  - Plans/Progression_Gates.md
```
### PG-049 - Backend Runtime Verification Sweep

```yaml
plan_unit_id: PG-049
unit_type: validation_rule
status: accepted
owner_doc: Plans/Progression_Gates.md
canonical_text: >-
  The post-edit sweep must verify backend, runtime, storage, and provider docs align on scheduler, blocked, remediation, and recovery vocabulary.
gui_related: false
gui_classification_reason: >-
  This unit defines verification, runtime, governance, or evidence behavior rather than visual presentation.
split_recommended: false
depends_on:
  - "PG-043"
  - "PG-044"
  - "PG-045"
  - "PG-046"
  - "PG-047"
  - "PG-048"
unblocks: []
acceptance_criteria:
  - "Backend Runtime Verification Sweep remains addressable as a fine-grained Progression Gates PlanUnit."
  - "ContractRefs, anchors, exact tokens, and negative constraints from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: progression_gate_drift
reasoning_tier: standard
context_scope: progression_gates
implementation_surfaces:
  - Plans/Progression_Gates.md
node_compile_hint:
  mode: validation_rule
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Progression_Gates-S0041
preserved_exact_tokens:
  - "Executor_Protocol.md"
  - "wizard_status"
  - "Contracts_V0.md"
  - "storage-plan.md"
  - "Run_Graph_View.md"
  - "Orchestrator_Page.md"
  - "safe point"
  - "restore point"
  - "rollback"
  - "runtime lineage metadata"
negative_constraints:
  - "This verification sweep is mandatory work, not an optional reminder."
owner_hints:
  - Plans/Progression_Gates.md
```
### PG-050 - GUI Blocked-State Verification Sweep

```yaml
plan_unit_id: PG-050
unit_type: validation_rule
status: accepted
owner_doc: Plans/Progression_Gates.md
canonical_text: >-
  The post-edit sweep must verify chat, dashboard, Final GUI, wizard, and scheduler/remediation GUI surfaces model blocked state consistently.
gui_related: true
gui_classification_reason: >-
  This unit validates GUI/chat/FinalGUI blocked-state surfaces.
split_recommended: false
depends_on:
  - "PG-045"
  - "PG-049"
unblocks: []
acceptance_criteria:
  - "GUI Blocked-State Verification Sweep remains addressable as a fine-grained Progression Gates PlanUnit."
  - "ContractRefs, anchors, exact tokens, and negative constraints from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: progression_gate_drift
reasoning_tier: standard
context_scope: progression_gates
implementation_surfaces:
  - Plans/Progression_Gates.md
node_compile_hint:
  mode: validation_rule
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Progression_Gates-S0041
preserved_exact_tokens:
  - "assistant-chat-design.md"
  - "blocked thread state"
  - "FinalGUISpec.md"
  - "wizard_blocked"
  - "GUI surfaces"
  - "event-driven/no-polling"
negative_constraints:
  - "blocked thread state must not be punted out of scope."
owner_hints:
  - Plans/Progression_Gates.md
```
### PG-051 - Runtime Packet Terminology Gate

```yaml
plan_unit_id: PG-051
unit_type: validation_rule
status: accepted
owner_doc: Plans/Progression_Gates.md
canonical_text: >-
  Runtime packet verification must align terminology across executor, contracts, storage, UI, and providers, forbid lexical dispatch, preserve blocked semantics, and expose queue analysis in a canonical UI surface.
gui_related: true
gui_classification_reason: >-
  This unit includes canonical UI surface visibility for queue-analysis and blocked semantics.
split_recommended: false
depends_on:
  - "PG-049"
  - "PG-050"
unblocks: []
acceptance_criteria:
  - "Runtime Packet Terminology Gate remains addressable as a fine-grained Progression Gates PlanUnit."
  - "ContractRefs, anchors, exact tokens, and negative constraints from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: progression_gate_drift
reasoning_tier: standard
context_scope: progression_gates
implementation_surfaces:
  - Plans/Progression_Gates.md
node_compile_hint:
  mode: validation_rule
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Progression_Gates-S0042
preserved_exact_tokens:
  - "attempt / blocked / safe-point / remediation"
  - "pure lexical dispatch"
  - "generic failures"
  - "pre-lock stages"
  - "queue-analysis visibility"
  - "canonical UI surface"
negative_constraints:
  - "Blocked outcomes must not be mislabeled as generic failures."
owner_hints:
  - Plans/Progression_Gates.md
```
### PG-052 - Packet Structural Repair Gate

```yaml
plan_unit_id: PG-052
unit_type: constraint
status: accepted
owner_doc: Plans/Progression_Gates.md
canonical_text: >-
  Packet verification must reject incomplete recovery or unsafe section targeting, including trailing-subsection replace_section plans without a later same-level anchor.
gui_related: false
gui_classification_reason: >-
  This unit defines verification, runtime, governance, or evidence behavior rather than visual presentation.
split_recommended: false
depends_on:
  - "PG-040"
  - "PG-051"
unblocks: []
acceptance_criteria:
  - "Packet Structural Repair Gate remains addressable as a fine-grained Progression Gates PlanUnit."
  - "ContractRefs, anchors, exact tokens, and negative constraints from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: progression_gate_drift
reasoning_tier: standard
context_scope: progression_gates
implementation_surfaces:
  - Plans/Progression_Gates.md
node_compile_hint:
  mode: constraint
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Progression_Gates-S0042
preserved_exact_tokens:
  - "append"
  - "verify_only"
  - "replace_section"
  - "Plans/Media_Generation_and_Capabilities.md"
  - "### 5.2 Disabled-reason messages"
  - "## 5. UI copy strings"
  - "## 6. Acceptance criteria"
  - "/Progression"
negative_constraints:
  - "A recovery-plan cannot leave active blockers unresolved by choosing append or verify_only when replace_section is required."
owner_hints:
  - Plans/Progression_Gates.md
```
### PG-053 - Scheduler Canonical Alignment

```yaml
plan_unit_id: PG-053
unit_type: validation_rule
status: accepted
owner_doc: Plans/Progression_Gates.md
canonical_text: >-
  Scheduler packet alignment must preserve canonical event-name precedence, forbid post-lock graph degradation, remove lexical dispatch, and honor wake/restore overrides.
gui_related: false
gui_classification_reason: >-
  This unit defines verification, runtime, governance, or evidence behavior rather than visual presentation.
split_recommended: false
depends_on:
  - "PG-051"
unblocks: []
acceptance_criteria:
  - "Scheduler Canonical Alignment remains addressable as a fine-grained Progression Gates PlanUnit."
  - "ContractRefs, anchors, exact tokens, and negative constraints from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: progression_gate_drift
reasoning_tier: standard
context_scope: progression_gates
implementation_surfaces:
  - Plans/Progression_Gates.md
node_compile_hint:
  mode: validation_rule
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Progression_Gates-S0043
preserved_exact_tokens:
  - "scheduler.pass"
  - "legacy aliases"
  - "run.graph_canonical_locked"
  - "same-cycle prerequisite wake"
  - "FileSafe restore-before-rerun"
negative_constraints:
  - "Graph degradation fallback is forbidden after run.graph_canonical_locked."
owner_hints:
  - Plans/Progression_Gates.md
```
### PG-054 - Scheduler UI Projection Alignment

```yaml
plan_unit_id: PG-054
unit_type: validation_rule
status: accepted
owner_doc: Plans/Progression_Gates.md
canonical_text: >-
  Scheduler alignment must keep blocked outcomes distinct from failures in UI/projections.
gui_related: true
gui_classification_reason: >-
  This unit validates UI/projection state alignment.
split_recommended: false
depends_on:
  - "PG-045"
  - "PG-053"
unblocks: []
acceptance_criteria:
  - "Scheduler UI Projection Alignment remains addressable as a fine-grained Progression Gates PlanUnit."
  - "ContractRefs, anchors, exact tokens, and negative constraints from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: progression_gate_drift
reasoning_tier: standard
context_scope: progression_gates
implementation_surfaces:
  - Plans/Progression_Gates.md
node_compile_hint:
  mode: validation_rule
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Progression_Gates-S0043
preserved_exact_tokens:
  - "blocked outcomes"
  - "failures"
  - "UI/projections"
negative_constraints:
  - "Blocked outcomes must remain distinct from failures in UI/projections."
owner_hints:
  - Plans/Progression_Gates.md
```
### PG-055 - Runtime Packet Contradiction-Fail Consolidation

```yaml
plan_unit_id: PG-055
unit_type: constraint
status: accepted
owner_doc: Plans/Progression_Gates.md
canonical_text: >-
  Packet verification must fail if primary or summary docs retain runtime contradictions in dispatch, blocked payloads, identity, clarification state, command IDs, or hidden retries.
gui_related: false
gui_classification_reason: >-
  This unit defines verification, runtime, governance, or evidence behavior rather than visual presentation.
split_recommended: false
depends_on:
  - "PG-051"
  - "PG-053"
unblocks: []
acceptance_criteria:
  - "Runtime Packet Contradiction-Fail Consolidation remains addressable as a fine-grained Progression Gates PlanUnit."
  - "ContractRefs, anchors, exact tokens, and negative constraints from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: progression_gate_drift
reasoning_tier: standard
context_scope: progression_gates
implementation_surfaces:
  - Plans/Progression_Gates.md
node_compile_hint:
  mode: constraint
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Progression_Gates-S0044
preserved_exact_tokens:
  - "lexical ready-node selection"
  - "recovery_options[]"
  - "allowed_actions[]"
  - "failure_class"
  - "analysis_id"
  - "scheduler_pass_id"
  - "attention_required"
  - "exact canonical command ids"
negative_constraints:
  - "Provider/auth/tool docs must not authorize hidden local retry loops after runtime classification exists."
preserved_contractrefs:
  - "ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Executor_Protocol.md, ContractName:Plans/UI_Command_Catalog.md"
owner_hints:
  - Plans/Progression_Gates.md
```
### PG-056 - Canonical Blocked Payload Field Name

```yaml
plan_unit_id: PG-056
unit_type: constraint
status: accepted
owner_doc: Plans/Progression_Gates.md
canonical_text: >-
  The sole canonical blocked payload field is allowed_action_ids[]; deprecated names are defects outside deprecation, migration, or gate-detection text.
gui_related: false
gui_classification_reason: >-
  This unit defines verification, runtime, governance, or evidence behavior rather than visual presentation.
split_recommended: false
depends_on:
  - "PG-055"
unblocks: []
acceptance_criteria:
  - "Canonical Blocked Payload Field Name remains addressable as a fine-grained Progression Gates PlanUnit."
  - "ContractRefs, anchors, exact tokens, and negative constraints from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: progression_gate_drift
reasoning_tier: standard
context_scope: progression_gates
implementation_surfaces:
  - Plans/Progression_Gates.md
node_compile_hint:
  mode: constraint
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Progression_Gates-S0045
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Progression_Gates-S0046
preserved_exact_tokens:
  - "recovery_options[]"
  - "allowed_actions[]"
  - "allowed_action_ids[]"
  - "payload definition"
  - "schema"
  - "storage shape"
  - "contract"
  - "HITL"
  - "FileSafe"
  - "container publishing"
negative_constraints:
  - "Accept recovery_options[] or allowed_actions[] only in deprecation notices, migration notes, or gate rules that detect them as defects."
preserved_contractrefs:
  - "ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/DRY_Rules.md"
owner_hints:
  - Plans/Progression_Gates.md
```
### PG-057 - Runtime Recovery Canonicalization Gate

```yaml
plan_unit_id: PG-057
unit_type: constraint
status: accepted
owner_doc: Plans/Progression_Gates.md
canonical_text: >-
  Runtime recovery sweeps must fail deprecated blocked payload fields, stale append-only contradictions, analysis_id queue identity, and blocked-reason-as-failure-class modeling.
gui_related: false
gui_classification_reason: >-
  This unit defines verification, runtime, governance, or evidence behavior rather than visual presentation.
split_recommended: false
depends_on:
  - "PG-056"
unblocks: []
acceptance_criteria:
  - "Runtime Recovery Canonicalization Gate remains addressable as a fine-grained Progression Gates PlanUnit."
  - "ContractRefs, anchors, exact tokens, and negative constraints from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: progression_gate_drift
reasoning_tier: standard
context_scope: progression_gates
implementation_surfaces:
  - Plans/Progression_Gates.md
node_compile_hint:
  mode: constraint
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Progression_Gates-S0047
preserved_exact_tokens:
  - "allowed_actions[]"
  - "recovery_options[]"
  - "analysis_id"
  - "scheduler_pass_id"
  - "failure_class"
  - "stale canonical text"
negative_constraints:
  - "Deprecated names are accepted only inside deprecation notices, migration notes, or gate rules that detect them as defects."
preserved_contractrefs:
  - "ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Crosswalk.md"
owner_hints:
  - Plans/Progression_Gates.md
```
### PG-001 - Progression Gates Retired Source-Preserving Bridge

```yaml
plan_unit_id: PG-001
unit_type: compatibility_disposition
status: retired
owner_doc: Plans/Progression_Gates.md
canonical_text: >-
  PG-001 is a retired source-preserving bridge for generated PDS Owner / Consumer Map, PlanUnits, and Migration Coverage audit material. Product prose from Progression_Gates-S0001 through Progression_Gates-S0047 is covered by fine-grained PG-002 through PG-057; Progression_Gates-S0048, Progression_Gates-S0049, and Progression_Gates-S0051 are generated structural/audit metadata, and Progression_Gates-S0050 is retired bridge lineage. No residual source_preserving_planunit product coverage remains for Plans/Progression_Gates.md.
gui_related: false
gui_classification_reason: The live retired bridge is migration/audit metadata only; the historical bridge span preserved GUI-related source tokens in span_map and coverage_map.
split_recommended: false
depends_on:
  - PG-002
  - PG-003
  - PG-004
  - PG-005
  - PG-006
  - PG-007
  - PG-008
  - PG-009
  - PG-010
  - PG-011
  - PG-012
  - PG-013
  - PG-014
  - PG-015
  - PG-016
  - PG-017
  - PG-018
  - PG-019
  - PG-020
  - PG-021
  - PG-022
  - PG-023
  - PG-024
  - PG-025
  - PG-026
  - PG-027
  - PG-028
  - PG-029
  - PG-030
  - PG-031
  - PG-032
  - PG-033
  - PG-034
  - PG-035
  - PG-036
  - PG-037
  - PG-038
  - PG-039
  - PG-040
  - PG-041
  - PG-042
  - PG-043
  - PG-044
  - PG-045
  - PG-046
  - PG-047
  - PG-048
  - PG-049
  - PG-050
  - PG-051
  - PG-052
  - PG-053
  - PG-054
  - PG-055
  - PG-056
  - PG-057
unblocks: []
acceptance_criteria:
  - PG-001 does not override PG-002 through PG-057 for Progression_Gates-S0001 through Progression_Gates-S0047.
  - Retired generated bridge and Migration Coverage spans remain available for exact-text audit.
  - Plans/Progression_Gates.md has no residual source_preserving_planunit product coverage after this bridge retirement.
  - No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this disposition.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: residual_bridge_overreach
reasoning_tier: standard
context_scope: progression_gates_residual_bridge
implementation_surfaces:
  - Plans/Progression_Gates.md
node_compile_hint:
  mode: retired_source_preserving_bridge
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Progression_Gates-S0048
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Progression_Gates-S0049
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Progression_Gates-S0050
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Progression_Gates-S0051
preserved_exact_tokens:
  - "PG-001"
  - "Progression Gates (Canonical) Source-Preserving PlanUnit"
  - "Progression Gates Residual Source-Preserving Bridge"
  - "source_preserving_planunit"
  - "retired_source_preserving_bridge"
  - "source_preserving_bridge_retired"
  - "Owner / Consumer Map"
  - "PlanUnits"
  - "Migration Coverage"
  - "PG-002"
  - "PG-057"
  - "Progression_Gates-S0048"
  - "Progression_Gates-S0049"
  - "Progression_Gates-S0050"
  - "Progression_Gates-S0051"
negative_constraints:
  - "PG-001 must not be used as implementation-ready product coverage for spans now mapped to PG-002 through PG-057."
  - "Do not remap Progression_Gates-S0001 through Progression_Gates-S0047 product coverage back to PG-001."
  - "PG-001 must not re-enter source_preserving_planunit mode after phase2b-149."
owner_hints:
  - Plans/Progression_Gates.md
```

## Migration Coverage

Original hash: `bb5559baa9f9e32acbf9ba920afade85c4de1d3ef0dd21c4be288cfc39e21271`.

Run-scoped proof artifacts:
- `Plans/.plan_migration/pds-20260611-002-atomize-planunits/original_hashes.json`
- `Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl`
- `Plans/.plan_migration/pds-20260611-002-atomize-planunits/coverage_map.jsonl`
- `Plans/.plan_migration/pds-20260611-002-atomize-planunits/anchor_aliases.json`

Original spans from `Progression_Gates-S0001` through `Progression_Gates-S0047` are preserved in place and atomized into fine-grained PlanUnits `PG-002` through `PG-057`. Generated structural/audit spans `Progression_Gates-S0048` through `Progression_Gates-S0051` are explicitly dispositioned; `PG-001` is retired as bridge lineage and no residual `source_preserving_planunit` product coverage remains for `Plans/Progression_Gates.md`. This batch did not update Spec Lock, generated shards, evidence bundles, auto_decisions, or plan_graph, and it did not create WorkNodes, NodeSeeds, or executable build tasks.
