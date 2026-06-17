# audit-20260617-003-orchestrator-goal-runtime-flow-head-semantic-fidelity

Status: BLOCKED

## Inferred Range

- ledger_id: `pldg-20260616-002-orchestrator-goal-runtime-flow`
- baseline_ref: `ea1a0d1d4d99888aaf37b8f84b567bfc9301cb96`
- current_ref: `cd41074b31bdc476a3bc2a985e7551f7de6775ed`
- Range inference: `current_ref=HEAD` (`cd41074b...`) is audit-only and adds the prior audit directory. The latest semantic PM cycle inside the HEAD-inclusive range is `3bcc0a3a...`; `baseline_ref` is its parent `ea1a0d1d...`.

## Changed Files

- Changed files in range: 300; full inventory is in `audit_report.json`.
- Changed live Plans docs: `Plans/Contracts_V0.md`, `Plans/Goal_Runtime_System.md`, `Plans/Models_System.md`, `Plans/Planning_Ledger_System.md`, `Plans/assistant-chat-design.md`, `Plans/orchestrator-subagent-integration.md`, `Plans/storage-plan.md`.
- Changed PlanUnits: `ACD-420`, `CV-288`, `GRS-026`, `GRS-027`, `MS-109`, `OSI-428`, `PLS-011`, `SP-215`.
- Added PlanUnits: none.
- Deleted PlanUnits: none.

## PlanUnit Deltas

- `Plans/Contracts_V0.md`: added=[]; deleted=[]; changed=['CV-288']; status=review_required.
- `Plans/Goal_Runtime_System.md`: added=[]; deleted=[]; changed=['GRS-026', 'GRS-027']; status=review_required.
- `Plans/Models_System.md`: added=[]; deleted=[]; changed=['MS-109']; status=review_required.
- `Plans/Planning_Ledger_System.md`: added=[]; deleted=[]; changed=['PLS-011']; status=no_unexplained_removed_contractrefs_or_exact_tokens_detected.
- `Plans/assistant-chat-design.md`: added=[]; deleted=[]; changed=['ACD-420']; status=review_required.
- `Plans/orchestrator-subagent-integration.md`: added=[]; deleted=[]; changed=['OSI-428']; status=no_unexplained_removed_contractrefs_or_exact_tokens_detected.
- `Plans/storage-plan.md`: added=[]; deleted=[]; changed=['SP-215']; status=review_required.

## Exact-Detail Fidelity

Atom matrix summary: `{'not_for_plan': 2, 'source_lineage_only': 84, 'equivalent_with_evidence': 8, 'stale_retired': 1, 'explicitly_deferred': 1, 'missing_or_drift': 8}`.

No clean semantic PASS. High-signal remaining drift/loss:

- Atoms `0036` through `0070`: 58 atom-to-PlanUnit compiled output claims do not have reciprocal live `source_lineage` in the target PlanUnits.
- `atom-0035`: controller/planner/reviewer roles are missing from compiled target blocks.
- `atom-0041`: high-end controller/planner decomposition into `WorkGraph` and bounded `WorkNode` work is not substantively present in `EP-098`.
- `atom-0049`: validator failure, verifier unavailable, repair budget exhaustion, and degraded outcome are not substantively preserved.
- `atom-0053`: defect signature details narrow affected artifact/path/span to affected artifact.
- `atom-0059`: GUI subagent/verification field labels are compressed or dropped.
- `atom-0070`: GUI Plan/PlanUnit + Node Graph requirement lacks Plan_Document_System ownership and target GUI outputs omit atom-0070 lineage.
- `atom-0094`: repair adds typed `VerificationFinding` fields beyond the bounded atom exact field set support.
- `atom-0098`: `F3-395` drops `gui_impact_matrix` and several exact GUI surface tokens.
- Several broad doc-path and planning-matrix tokens are classified `source_lineage_only`, especially `atom-0078`, `atom-0080`, `atom-0081`, `atom-0096`, `atom-0097`, and `atom-0099`.

## Reciprocal Lineage

PlanUnit claim summary: `{'supported': 16, 'review_required': 6}`.

- `SP-215`: typed `VerificationFinding` / defect-signature fields omit direct `atom-0053` lineage.
- `CV-288` and `SP-215`: typed `VerificationFinding` details need fuller reciprocal atom lineage; exact `status` / `failed | passed | blocked` tokens are compressed.
- `MS-109`: canonical text names raw atom ids and falsely says `atom-0031`/`atom-0032` are carried by `EP-098`, `GRS-026`, and `GRS-027`; direct lineage confirms them in `OSI-428`, not those other units.
- `OSI-428`: canonical unit exists, but generated `.plan_index` `source_location` heading is wrong, and direct owner-boundary `atom-0014` lineage is weak/missing for Contracts/storage boundary claims.
- `MS-109` uses non-standard `moved_owner_lineage`, outside the PlanUnit required field list.

## Owner Routing

No wrong-owner blocker was found, but owner impact is incomplete:

- medium: `owner-routing-cv288-acceptance-fields` - CV-288 canonical_text adds VerificationFinding/finding type/failing check/affected artifact/root_cause_key/prior repair strategies, but acceptance criteria still validate the older smaller VerificationCycle field set.
- medium: `owner-routing-sp215-acceptance-fields` - SP-215 storage text adds typed VerificationFinding fields, but storage acceptance criteria can pass while dropping them.
- medium: `owner-routing-sp215-permissions-ref` - SP-215 persists write_mode and authority-check refs but implementation_surfaces/owner_hints omit Permissions_System.
- high: `owner-routing-atom0070-plan-document-system-gap` - atom-0070 requires GUI Plan/PlanUnit pages, Node Graph/Run Graph, gui_related inheritance, receipt status, and compiler contract; no Plan_Document_System PlanUnit was compiled and claimed GUI outputs do not cite atom-0070.
- low: `owner-routing-acd420-pnc009-dependency-review` - ACD-420 canonical_text names Plan_To_Node_Compilation/PNC-009, but depends_on omits PNC-009. Add dependency if normative or demote exact PlanUnit id to routing metadata.

## Ledger And Governance

- Ledger status: `fail` under the strict prompt rule.
- Manifest, current, registry entry, ledger registry, compile queue, and ledger health agree on sealed/governance-sealed status.
- `q-0007`, `q-0008`, and `q-0009` are open but marked `post_seal_followup_not_compiled`; this is coherent as ledger-only continuation, but it fails the audit prompt's literal deferred/not_for_plan/source_lineage_only exception labels.
- `compile_queue.candidate_compile_plan.active=false`, but its reason text still says to proceed to an explicit ledger-to-Plans compile; low risk, stale projection text.
- `.plan_index` includes all 22 compiled PlanUnits, 5065 PlanUnits, and 18075 acceptance units; node readiness remains `blocked_compiler_contract_incomplete`.
- Dependency graph is non-executable: no unresolved dependency refs, but build order is empty with cycle blockers and must not be consumed as a WorkNode/NodeSeed schedule.

## Validators

All required validators passed with no worktree mutation:

- `bootstrap_ledger_validate`: pass (no mutation).
- `pm_plan_index_validate`: pass (no mutation).
- `pm_plan_migration_validate`: pass (no mutation).
- `run_gates`: pass (no mutation).
- `shard_check`: pass (no mutation).
- `validate_auto_decisions`: pass (no mutation).
- `verify_spec_lock`: pass (no mutation).
- `validate_evidence`: pass (no mutation).
- `git_diff_check`: pass (no mutation).

YAML-dependent validators used `PYTHONPATH=Plans/.audits/audit-20260616-008-orchestrator-goal-runtime-flow-post-repair/.pydeps`.

## Forbidden Artifacts

No range-created WorkNodes, NodeSeeds, NodeSeed candidates, executable queues, final node manifests, final/production build tasks, implementation files, Rust/Slint scaffold, or old Rust/Iced app resurrection were found.

Current-tree/range warnings:

- Ignored local Claude credential/session files exist under `.claude/`; no token contents are quoted in this audit.
- HEAD-added audit-002 `validator_results.json` records absolute `/Users/...` PYTHONPATH entries.
- Baseline-carried audit vendored PyYAML deps and `/private/tmp` provenance remain in older audit/governance artifacts.
- Generated shard `manifest.json` files are governance manifests, not final node manifests.

## Subagent Summary

- atom exact-fidelity atom-0002..atom-0035: warn - Most early atoms are exact/equivalent/stale-retired, but atom-0035 loses controller/planner/reviewer role vocabulary in target PlanUnits.
- atom exact-fidelity atom-0036..atom-0070: blocked - Atoms 0036-0070 contain 58 compiled_output overclaims where target PlanUnits do not cite the atom; atom-0049 failure modes, atom-0059 GUI field labels, and atom-0070 Plan/PlanUnit + Node Graph routing remain incomplete.
- atom exact-fidelity atom-0071..atom-0104: warn - Atoms 0078-0082 exact doc-path obligations are compressed into broad owner-map prose; compile_queue.reason still contains stale proceed-to-compile text despite sealed state.
- PlanUnit reciprocal lineage: blocked - SP-215 omits atom-0053 lineage, atom-0053 path/span is compressed, MS-109 overclaims moved lineage and adds non-standard moved_owner_lineage, OSI-428 has weak cross-owner lineage plus wrong index source_location.
- owner routing: pass_with_contradictory_evidence - Focused owner adjudication found no wrong-owner blocker, but reciprocal-lineage and exact-fidelity slices still flag SP-215 Permissions_System routing and atom-0070 Plan_Document_System/GUI routing gaps.
- changed-doc fidelity: warn - No PlanUnits added/deleted and no headings/ContractRefs/preserved tokens removed; MS-109 leaks ledger ids into canonical_text and ACD-420 may need PNC-009 dependency metadata or demotion of exact PlanUnit id from canonical text.
- ledger consistency/index/governance: blocked - Projection surfaces agree on sealed/governance-sealed, but q-0007..q-0009 are open with post_seal_followup_not_compiled, which fails the prompt's literal deferred/not_for_plan/source_lineage_only exception list.
- forbidden artifacts: blocked_current_tree_warn_range_pass - No range-created WorkNodes, NodeSeeds, executable queues, final node manifests, build tasks, implementation scaffold, or Iced resurrection; ignored current-tree .claude credential files and committed audit-local absolute PYTHONPATH traces were found.
- validator mutability: pass - Full validator suite passed; before/after status matched and no non-audit side effects required revert.

## Next Safe Action

Open a separate repair-only pass for the warnings. Do not repair inside this audit.

Compact repair prompt:

```text
Repair pldg-20260616-002 post-repair semantic audit warnings only. Do not broaden scope. Remove ledger atom ids from MS-109 canonical_text; narrow or fix the atom-0031/0032 moved-lineage claim and avoid non-standard PlanUnit keys unless the PlanUnit schema is intentionally changed. Add/align reciprocal lineage and acceptance criteria for typed VerificationFinding fields in CV-288/SP-215/GRS-027, including affected artifact/path/span and prior repair strategies where supported. Add Permissions_System to SP-215 surfaces/hints for write_mode/authority refs. Fix OSI-428 .plan_index source_location by regenerating index, then regenerate shards/evidence/spec-lock through governance scripts only. Address atom-0035/0041/0049/0053/0059/0070/0094/0098 drift, atoms 0036-0070 compiled_output overclaims, and doc-path exact-fidelity gaps, or explicitly disposition as deferred/source_lineage_only/not_for_plan. Normalize q-0007..q-0009 open-question dispositions to an allowed sealed-ledger label or update the strict ledger rule. Remove current-tree credential/local-state artifacts outside the audit lane and avoid committed absolute local paths in future audit validator output. Do not create WorkNodes, NodeSeeds, executable queues, implementation files, or build tasks.
```
