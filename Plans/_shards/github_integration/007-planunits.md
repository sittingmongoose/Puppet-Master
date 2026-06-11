# Shard 007: PlanUnits

Source: `Plans/GitHub_Integration.md`

Source lines: L235-L353

Source SHA256: `3fd236bf9f6ce0c2780dc77e155b225db95206c07d8e83b7baa89d8fc939f8a3`

---

## PlanUnits

### GI-001 - GitHub Integration -- Spec Source-Preserving PlanUnit

```yaml
plan_unit_id: GI-001
unit_type: requirement
status: accepted
owner_doc: Plans/GitHub_Integration.md
canonical_text: Plans/GitHub_Integration.md keeps its pre-migration canonical source content losslessly in place while exposing a source-preserving PlanUnit for Plan Document System indexing. Fine-grained requirement splitting may occur in a later controlled batch using the recorded span_map and coverage_map.
gui_related: true
gui_classification_reason: The preserved source spans include GUI/UI/user-visible presentation or interactive control requirements.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- Original source spans remain available for exact-text audit.
- Every original span for this doc has one coverage_map disposition.
- ContractRefs, anchors or aliases, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage are preserved by span_map and coverage_map.
- No WorkNodes, NodeSeeds, or executable build tasks are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-001-standardize-plans
- python3 scripts/pm-plans-verify.py run-gates
- python3 scripts/pm-shard-plans.py --check
risk_class: source_preservation
reasoning_tier: standard
context_scope: single_plan_doc
implementation_surfaces:
- Plans/GitHub_Integration.md
node_compile_hint:
  mode: source_preserving_planunit
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:GitHub_Integration-S0001
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:GitHub_Integration-S0002
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:GitHub_Integration-S0003
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:GitHub_Integration-S0004
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:GitHub_Integration-S0005
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:GitHub_Integration-S0006
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:GitHub_Integration-S0007
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:GitHub_Integration-S0008
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:GitHub_Integration-S0009
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:GitHub_Integration-S0010
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:GitHub_Integration-S0011
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:GitHub_Integration-S0012
preserved_exact_tokens:
- GitHub Integration -- Spec
- Canonical owner-section requirements
- Source Control and worktree handshake
- GitHub stable account identity
- Change Summary
- SSOT References (DRY)
- 'ContractRef: ContractName:Plans/DRY_Rules.md, PolicyRule:Decision_Policy.md§2'
- 'ContractRef:` annotations (ContractRef: Plans/DRY_Rules.md, Plans/Progression_Gates.md#GATE-009).'
- 'ContractRef: Plans/Architecture_Invariants.md#INV-002, Plans/Architecture_Invariants.md#INV-010).'
- Canonical owner and consumer reconciliation
- Source Control and GitHub Actions surface split
- 'ContractRef: ContractName:Plans/WorktreeGitImprovement.md, ContractName:Plans/Orchestrator_Page.md#Source Control boundary, ContractName:Plans/newtools.md, ContractName:Plans/FinalGUISpec.md'
- Runtime status and owner cross-references
- 'ContractRef: ContractName:Plans/Run_Modes.md, ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Tools.md, ContractName:Plans/FileSafe.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/FinalGUISpec.md'
- Consumer propagation
- C.3 Remote Project Context
- C.4 Tool & Provider Execution on Remote
- 'ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Models_System.md, ContractName:Plans/GitHub_API_Auth_and_Flows.md'
negative_constraints:
- The following canonical documents govern this spec. This document MUST NOT redefine schemas or contracts owned by those sources; it adds the IDE UX layer on top of them.
- '> - `github_api` and `copilot_github` tokens and `/state` are never cross-consumed; GitHub Copilot provider account switching must not change GitHub API, Git transport, or local worktree authority.'
- GitHub Integration owns two distinct user-facing surfaces. **Source Control** is the Git-first repo/worktree surface for `Changes`, `History`, `Graph`, `Worktrees`, `Branches / Stash`, review/compare, conflicts, worktree-native recovery, and `/safe` local repo actions. **GitHub Actions** is the GitH
- Four GitHub-adjacent concepts stay separate. `GitHub Copilot` is a provider capability and is out of scope as a user-facing GitHub Integration GUI surface for this research pass. `GitHub API` is internal integration plumbing for GitHub-hosted features, not a visible GUI panel. `GitHub Actions` is th
- 'GitHub Integration owns GitHub Actions and hosted-repo ConfigKey schema details only for GitHub-specific Settings, readiness, workflow, admin, and source-control preferences. Shared storage key catalog rules remain imported from `Plans/storage-plan.md`, and ConfigKey entries here must not duplicate '
- '`Replay from last known good` belongs to GitHub Actions failure triage and workflow history. It compares a failed run against the last successful run on the same workflow and branch, records the known-good run id, cached comparison target id, comparison window length, and `run-history` comparison co'
- Hosted Git and GitHub Actions surfaces display canonical runtime outcomes from their owners. Legacy `stop.*` wording is stale or compatibility-only where it conflicts with the canonical `kill.*` family; pre-dispatch denial remains `kill.*`, post-response overrun remains `done.*`, and GitHub UI label
- '- Absence of a fresh Actions observation MUST NOT by itself mark the workflow `skipped/failed`, and the resulting receipt keeps the shared `wait_state_class?`, `timeout_class?`, and observation timestamps from Plans/Contracts_V0.md.'
compatibility_only_notes:
- '- If older naming exists, refer to it only as "legacy naming" (do not quote it).'
- GitHub Integration owns two distinct user-facing surfaces. **Source Control** is the Git-first repo/worktree surface for `Changes`, `History`, `Graph`, `Worktrees`, `Branches / Stash`, review/compare, conflicts, worktree-native recovery, and `/safe` local repo actions. **GitHub Actions** is the GitH
- 'The GitHub Actions IA has three stable subviews: `Current Branch`, `Workflows`, and `Settings`; `Current Branch / Workflows / Settings` is the SSOT split for hosted workflow/admin behavior, and the legacy route token `/Workflows/Settings` maps to the GitHub Actions Settings subview. `Current Branch`'
- '`Pinned critical workflows` and `Critical workflow pinning / health badges` are owned by `GitHub Actions > Workflows`. Users can pin or unpin high-value workflows with `cmd.github.actions.pin` and `cmd.github.actions.unpin`; compatibility `cmd.actions.pin` aliases must resolve to the canonical comma'
- Hosted Git and GitHub Actions surfaces display canonical runtime outcomes from their owners. Legacy `stop.*` wording is stale or compatibility-only where it conflicts with the canonical `kill.*` family; pre-dispatch denial remains `kill.*`, post-response overrun remains `done.*`, and GitHub UI label
- '- GitHub HITL consumers treat `HITL`, request-centric `tier-boundary`, and older approval wording as compatibility inputs; live GitHub workflow actions project the blocked `/runtime` overlay with canonical blocked episode and allowed-action identity before approval or mutation.'
- '- Legacy target `GitHub_Integration.md ### C.3` is represented by this owner section after section compaction. FID-04 generalized security behavior applies to GitHub remote, SSH, Actions, and repository operations: no GitHub consumer flow may bypass FileSafe, permission, credential, redaction, or pr'
- '- SSH remote execution and reconnect authority for `GitHub_Integration.md §C` is live in this owner section: GitHub remote operations use the remote SSH subprocess model, keep the 30s keepalive, allow one bounded auto-retry (`one-auto-retry` legacy token), then require explicit `Reconnect` before mo'
stale_retired_dispositions:
- '`Pinned critical workflows` and `Critical workflow pinning / health badges` are owned by `GitHub Actions > Workflows`. Users can pin or unpin high-value workflows with `cmd.github.actions.pin` and `cmd.github.actions.unpin`; compatibility `cmd.actions.pin` aliases must resolve to the canonical comma'
- 'Actions readiness triggers are concrete: opening `GitHub Actions > Current Branch`, opening a dispatch form, opening `GitHub Actions > Settings`, saving a workflow file under `.github/workflows/`, changing worktree or branch context, and completing secrets/variables/environments CRUD all re-evaluate'
- Hosted Git governance blockers use policy-specific reasons rather than a generic branch-rule mismatch. Direct push denied by protected branch or `branch-rule`, force-push denied, required PR or merge queue required, required status checks not satisfied, required signed commits or `/tags` not satisfi
- '`Worktrees` rows are first-class Source Control objects, not settings-only utilities. Each row preserves compare/open/recover/prune/lineage actions as `/open/recover/prune/lineage`, displays dirty plus `/conflict/orphaned/stale` state, and keeps recoverable lineage visible even when the row points t'
- Hosted Git and GitHub Actions surfaces display canonical runtime outcomes from their owners. Legacy `stop.*` wording is stale or compatibility-only where it conflicts with the canonical `kill.*` family; pre-dispatch denial remains `kill.*`, post-response overrun remains `done.*`, and GitHub UI label
- '- GitHub Integration treats a scheduled workflow with no fresh observation as stale or unknown until GitHub reports a concrete run, skipped outcome, failed outcome, or missed-run signal.'
owner_boundary_notes:
- '## Canonical owner-section requirements'
- These requirements are canonical live specification text for this owner document and preserve the required product, runtime, storage, UI, and governance details in owner-section form.
- '> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: "Puppet Master" only. No open questions; deterministic defaults per `Plans/Decision_Policy.md`.'
- '## SSOT References (DRY)'
- The following canonical documents govern this spec. This document MUST NOT redefine schemas or contracts owned by those sources; it adds the IDE UX layer on top of them.
- '| `Plans/DRY_Rules.md` | DRY + ContractRef rule (canonical) |'
- '| `Plans/Contracts_V0.md` | Canonical contracts: EventRecord, UICommand, AuthState |'
- '| `Plans/Glossary.md` | Canonical terminology |'
- '| `Plans/GitHub_API_Auth_and_Flows.md` | GitHub auth contract and API call flows (SSOT for auth; this doc adds IDE UX layer only) |'
- '| `Plans/UI_Command_Catalog.md` | Stable UI command IDs (canonical SSOT) |'
- '> Those are canonical in `Plans/GitHub_API_Auth_and_Flows.md` and `Plans/Contracts_V0.md`.'
- '## Canonical owner and consumer reconciliation'
- This section reconciles GitHub integration consumer semantics with the canonical owner specifications in Plans/Contracts_V0.md, Plans/Executor_Protocol.md, and Plans/Models_System.md.
- Source Control is the canonical SCM panel contract, even when GitHub-hosted features are nearby. Its `Changes` subview includes staged/unstaged/untracked groups, diff preview mode, stage/unstage/discard/commit/push/pull/fetch/sync, stash flows, branch switch/create, incoming/outgoing status, `/commi
- 'Compare/open identity consumption and run-aware compare-origin forwarding: GitHub compare/open pivots carry canonical compare identity instead of reconstructing targets from local UI state. The `compare_origin` value is closed to `changes.unstaged`, `changes.staged`, `history.commit_parent`, `confli'
- The owner-level gaps in GitHub Integration require live canonical repair or explicit retirement evidence before a row can be treated as transferred; annotations alone are not sufficient.
- '`recovery.safe_point_retry` opens a confirmation before restore or retry mutation. The confirmation names the repo, worktree, branch, expected baseline/head, `safe_point_id`, affected files summary, owner run/node/attempt, and the action that will follow restore, such as `restore_safe_point_then_ret'
- 'The GitHub Actions IA has three stable subviews: `Current Branch`, `Workflows`, and `Settings`; `Current Branch / Workflows / Settings` is the SSOT split for hosted workflow/admin behavior, and the legacy route token `/Workflows/Settings` maps to the GitHub Actions Settings subview. `Current Branch`'
- '`Pinned critical workflows` and `Critical workflow pinning / health badges` are owned by `GitHub Actions > Workflows`. Users can pin or unpin high-value workflows with `cmd.github.actions.pin` and `cmd.github.actions.unpin`; compatibility `cmd.actions.pin` aliases must resolve to the canonical comma'
- '`Current Branch` semantics are explicit when multiple worktrees, branches, or background runs exist (`/branches/background`). The active branch/worktree binding is shown, background run status remains visible without stealing focus, and Actions readiness distinguishes requested admin/runtime action '
- Actions-to-code correlation is a remediation bridge, not canonical proof by log parsing. Required state includes preferred diff target, auto-open failing file hints, show heuristic matches toggle, correlation confidence threshold, changed-files source preference, and auto-open nearest worktree toggl
- '`Run impact mapping` is owned by GitHub Actions run detail and mirrored by Orchestrator receipts. A run impact map shows `/branch/commit/PR`, branch, PR, worktree, container publish, deploy chain, and `Secrets / variables / environments readiness` implications for the selected run/job/step. Related '
- '`Failure triage view` is the GitHub Actions run-detail GUI pane for compressing a failed run into the failing job, failing step, last relevant logs, changed files, likely next action, and retained metadata. It owns `step-log`, `fail-step`, `log-download`, job-level and step-level log access, `/colla'
- '`Workflow authoring assistance` is a GitHub Actions Settings and workflow-editor capability, not a generic YAML textarea. It provides `language-service` validation, completion, syntax hints, integrated docs, `remote-repo` support disclosure, `/proxy` behavior where provider access is mediated, and `'
owner_hints:
- Plans/GitHub_Integration.md
split_recommendation_reason: The doc-level source-preserving unit covers both GUI-related and non-GUI spans; future fine-grained PlanUnits should split those surfaces when safe.
```

