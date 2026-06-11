# Shard 023: PlanUnits

Source: `Plans/WorktreeGitImprovement.md`

Source lines: L803-L1021

Source SHA256: `9e13eed1d3a67b07c0ec4decf8064275c8070f4530efceed756879e346046907`

---

## PlanUnits

### W-001 - Worktree & Git Improvement -- Implementation Plan Source-Preserving PlanUnit

```yaml
plan_unit_id: W-001
unit_type: requirement
status: accepted
owner_doc: Plans/WorktreeGitImprovement.md
canonical_text: Plans/WorktreeGitImprovement.md keeps its pre-migration canonical source content losslessly in place while exposing a source-preserving PlanUnit for Plan Document System indexing. Fine-grained requirement splitting may occur in a later controlled batch using the recorded span_map and coverage_map.
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
- Plans/WorktreeGitImprovement.md
node_compile_hint:
  mode: source_preserving_planunit
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:WorktreeGitImprovement-S0001
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:WorktreeGitImprovement-S0002
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:WorktreeGitImprovement-S0003
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:WorktreeGitImprovement-S0004
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:WorktreeGitImprovement-S0005
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:WorktreeGitImprovement-S0006
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:WorktreeGitImprovement-S0007
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:WorktreeGitImprovement-S0008
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:WorktreeGitImprovement-S0009
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:WorktreeGitImprovement-S0010
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:WorktreeGitImprovement-S0011
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:WorktreeGitImprovement-S0012
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:WorktreeGitImprovement-S0013
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:WorktreeGitImprovement-S0014
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:WorktreeGitImprovement-S0015
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:WorktreeGitImprovement-S0016
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:WorktreeGitImprovement-S0017
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:WorktreeGitImprovement-S0018
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:WorktreeGitImprovement-S0019
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:WorktreeGitImprovement-S0020
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:WorktreeGitImprovement-S0021
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:WorktreeGitImprovement-S0022
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:WorktreeGitImprovement-S0023
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:WorktreeGitImprovement-S0024
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:WorktreeGitImprovement-S0025
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:WorktreeGitImprovement-S0026
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:WorktreeGitImprovement-S0027
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:WorktreeGitImprovement-S0028
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:WorktreeGitImprovement-S0029
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:WorktreeGitImprovement-S0030
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:WorktreeGitImprovement-S0031
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:WorktreeGitImprovement-S0032
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:WorktreeGitImprovement-S0033
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:WorktreeGitImprovement-S0034
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:WorktreeGitImprovement-S0035
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:WorktreeGitImprovement-S0036
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:WorktreeGitImprovement-S0037
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:WorktreeGitImprovement-S0038
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:WorktreeGitImprovement-S0039
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:WorktreeGitImprovement-S0040
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:WorktreeGitImprovement-S0041
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:WorktreeGitImprovement-S0042
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:WorktreeGitImprovement-S0043
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:WorktreeGitImprovement-S0044
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:WorktreeGitImprovement-S0045
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:WorktreeGitImprovement-S0046
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:WorktreeGitImprovement-S0047
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:WorktreeGitImprovement-S0048
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:WorktreeGitImprovement-S0049
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:WorktreeGitImprovement-S0050
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:WorktreeGitImprovement-S0051
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:WorktreeGitImprovement-S0052
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:WorktreeGitImprovement-S0053
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:WorktreeGitImprovement-S0054
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:WorktreeGitImprovement-S0055
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:WorktreeGitImprovement-S0056
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:WorktreeGitImprovement-S0057
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:WorktreeGitImprovement-S0058
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:WorktreeGitImprovement-S0059
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:WorktreeGitImprovement-S0060
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:WorktreeGitImprovement-S0061
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:WorktreeGitImprovement-S0062
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:WorktreeGitImprovement-S0063
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:WorktreeGitImprovement-S0064
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:WorktreeGitImprovement-S0065
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:WorktreeGitImprovement-S0066
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:WorktreeGitImprovement-S0067
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:WorktreeGitImprovement-S0068
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:WorktreeGitImprovement-S0069
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:WorktreeGitImprovement-S0070
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:WorktreeGitImprovement-S0071
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:WorktreeGitImprovement-S0072
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:WorktreeGitImprovement-S0073
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:WorktreeGitImprovement-S0074
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:WorktreeGitImprovement-S0075
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:WorktreeGitImprovement-S0076
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:WorktreeGitImprovement-S0077
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:WorktreeGitImprovement-S0078
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:WorktreeGitImprovement-S0079
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:WorktreeGitImprovement-S0080
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:WorktreeGitImprovement-S0081
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:WorktreeGitImprovement-S0082
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:WorktreeGitImprovement-S0083
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:WorktreeGitImprovement-S0084
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:WorktreeGitImprovement-S0085
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:WorktreeGitImprovement-S0086
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:WorktreeGitImprovement-S0087
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:WorktreeGitImprovement-S0088
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:WorktreeGitImprovement-S0089
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:WorktreeGitImprovement-S0090
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:WorktreeGitImprovement-S0091
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:WorktreeGitImprovement-S0092
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:WorktreeGitImprovement-S0093
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:WorktreeGitImprovement-S0094
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:WorktreeGitImprovement-S0095
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:WorktreeGitImprovement-S0096
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:WorktreeGitImprovement-S0097
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:WorktreeGitImprovement-S0098
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:WorktreeGitImprovement-S0099
preserved_exact_tokens:
- Worktree & Git Improvement -- Implementation Plan
- Canonical owner-section requirements
- Source Control and worktree handshake
- Lane vs worktree lifecycle split
- Historical semantic consistency
- Coverage blocker provider/model precedence owner section
- Coverage blocker worktree allocation strategy
- Projection fields for startup rehydration
- Lane cleanup lineage fields
- Plan Document Status
- Rewrite alignment (2026-02-21)
- SSOT references (DRY)
- 'ContractRef: SchemaID:Spec_Lock.json, ContractName:Plans/DRY_Rules.md, ContractName:Plans/Glossary.md, PolicyRule:Decision_Policy.md, Gate:GATE-002'
- Table of Contents
- 1. Executive Summary
- Goals
- Critical Blocker
- GUI updates needed
- Readiness for implementation
- 2. Worktree Improvements
- 2.0 Symlink resolution in worktree paths
- 2.0.1 Worktree path guard rules
- 'ContractRef: ContractName:Plans/Permissions_System.md, ContractName:Plans/FileSafe.md'
- 'ContractRef: ContractName:Plans/FileSafe.md, ContractName:Plans/Architecture_Invariants.md'
negative_constraints:
- '- Manual prune/remove stays forbidden while the worktree is `active` or `blocked_preserved` unless the explicit override policy permits it and records the override.'
- 'User-facing copy distinguishes action nouns across Source Control, GitHub Actions, Docker publish, Kubernetes, and Orchestrator: `Rebind`, `Start fresh`, retry, resume, recover, and restore are not interchangeable. Receipt nouns are also reserved: `Receipt`, `History`, `Evidence`, `Log`, and `Ledger'
- '- Fatal scenarios MUST NOT be retried or skipped (`skip-silently-never`). The operation fails with a structured error that includes the git command, exit code, and stderr content.'
- '- **Fix:** Implement PR creation via GitHub HTTPS API per `Plans/GitHub_API_Auth_and_Flows.md` (OAuth device-code token in OS credential store). Doctor must validate GitHub API auth state and required scopes; runtime PR creation must not shell out to a GitHub CLI.'
- '- `Conflict assistant` turns merge, `/rebase/worktree`, and worktree conflict-caused blocked episodes into a guided repair flow instead of leaving users only with raw file markers. The primary placement is the `Source Control > Changes` conflict group plus a dedicated conflict flyout; blocked worktr'
- '- **Settings projection (rewrite):** Option B and Phase 1 are required for initial release and must work with **YAML-only** config. Redb/seglog is out of scope for this plan; when storage-plan lands, run config can be read from redb instead of gui_config. In the seglog/redb architecture (storage-pla'
- '- **Platform/tool resolution:** Do not hardcode paths. Use shared helpers: `path_utils::find_tool_executable`, `path_utils::resolve_app_local_executable` (or a new `resolve_git_executable()` that both GitManager and Doctor use). Tag new shared helpers with `// DRY:FN:<name>`.'
- Parallel execution must not confuse snapshot-based single-context concurrency with multi-lane worktree isolation. `newfeatures.md` background agent queues and snapshot-based recovery are single-context mechanisms unless they allocate isolated lanes with dedicated worktrees. The Source Control view t
- Cross-surface openings must not pollute base route identity. `Orchestrator_Page.md` / `Orchestrator_Page.md` Evidence pivots into workflow `/Docker/Kubernetes` detail through an explicit receipt `/attempt` join path. `line` / `range` belong to path `/document-open` specialization rather than the can
- Source Control row ownership is explicit even when the UI stays worktree-first. Legacy `owner run/tier` or `/tier` labels are compatibility, while current rows expose owner run, `/package/lane`, `/lane`, and `/package/node-first` execution-context metadata beside `worktree` identity. `Feature Seam`,
compatibility_only_notes:
- '- Legacy `git_panel/*` and `git_panel` state is one-time migration input into `source_control.project_state.{project_id}` only. Settings-owned policy such as `branching.base_branch` remains canonical settings policy, followed by canonical Source Control project state, with legacy `git_panel/*` consu'
- '`Progress > Current Task` and `Progress > Orchestrator Status` consume the same first-class SCM status strip instead of assistant-chat-local worktree summaries. The status payload includes `repo_id`, `repo_root`, `worktree_id`, `worktree_path`, compatibility `worktree_id/path`, `worktree_status`, `b'
- '- after `git add`, run a post-add `git status --porcelain` verification before accepting any `/commit-sensitive` staged-state transition'
- '- **Gap:** PR creation currently relies on a GitHub CLI subprocess in some legacy integration paths. This violates the locked decision: GitHub operations are **API-only**.'
- '- `History / graph / worktree parity` and `Branch/worktree lineage graph` go beyond a plain commit graph by showing which worktree, run, or branch owns each branch tip in `Source Control > Graph`. Required GUI state includes branch filter, worktree overlay toggle, ahead`/behind/diverged` badges, com'
- '- `Review mode` compares a worktree against a base branch, another worktree, a PR target, or a selected commit range in a roomy diff-centric Source Control GUI lens. `Source Control > History` and `Worktrees` both expose `Open Review Mode`; dense compares may take over the editor-area while staying '
- '- Migration: on first load, map legacy strings to enum variants ("single" → None, "per_phase" → Phase, "per_task" → Task). Log `config.migrated` seglog event.'
- '`Plans/WorktreeGitImprovement.md`, `Plans/orchestrator-subagent-integration.md`, and `Plans/Crosswalk.md` converge on `/worktree` and `/worktrees` ownership, but the worktree owner must make the allocation strategy concrete. Worktree allocation is package/lane based: Orchestrator owns the active run'
- 'Historical audit anchors stay visible only as owner references for the worktree allocation defect: `cov-526`, `obl-222`, `Plans/Crosswalk.md:88-94`, `Plans/WorktreeGitImprovement.md:62-66`, `Plans/WorktreeGitImprovement.md:78-80`, `Plans/orchestrator-subagent-integration.md:28-41`, `/Crosswalk.md:88'
- 'Cross-lane reuse is not a best-effort cleanup path. A `safe-point` restore may make a suspect worktree eligible for `cross-lane` reuse only after contamination checks pass; `contamination-triggered` shrink can reduce a package''s lane-pool, and flat `provider-only` limits never replace `per-package` '
- Source Control row ownership is explicit even when the UI stays worktree-first. Legacy `owner run/tier` or `/tier` labels are compatibility, while current rows expose owner run, `/package/lane`, `/lane`, and `/package/node-first` execution-context metadata beside `worktree` identity. `Feature Seam`,
- 'The lane-pool model is end-to-end across Orchestrator, Source Control, recovery policy, and SCM. `package-based` lane-pool allocation unifies former per-run branches, per-subtask worktrees, branch-per-run flows, `/tier`, and `/PR` assumptions without treating those compatibility patterns as current '
stale_retired_dispositions:
- '- Stale worktrees (allocated but not reclaimed) are eligible for cleanup via storage housekeeping.'
- Source Control owns the live SCM truth for current repo/worktree state, while Health is a read-only diagnostic and `/validation` mirror unless a repair utility deep-links back into Source Control. Worktree projection keys use `project_id/repo_id/worktree_id`; the compact `/repo_id/worktree_id` displ
- Blocked-state copy has a `reason-family` translation layer with structured-copy templates and typed placeholders for target identity, missing capability, blocked step, recovery action, and timestamp. Canonical families include approval-gated, policy-blocked, preflight-blocked, auth-blocked, governan
- '- Cross-references now point at `Plans/Orchestrator_Page.md#Source Control boundary` rather than the stale numbered anchor.'
- This feature-by-feature wiring contract for `Worktree topology view` makes worktrees first-class instead of hidden plumbing. Its primary placement is `Source Control > Worktrees`; it may also expose an optional graph overlay badge in `Source Control > Graph`. The panel state includes selected worktr
- '- `Review mode` compares a worktree against a base branch, another worktree, a PR target, or a selected commit range in a roomy diff-centric Source Control GUI lens. `Source Control > History` and `Worktrees` both expose `Open Review Mode`; dense compares may take over the editor-area while staying '
- Source Control is the primary operational surface for worktree inventory and actions, and Orchestrator consumes worktree identity, blocked state, and lineage. `dirty_worktree` and `worktree_conflict` route back to Source Control with the correct worktree in scope; historical runs preserve historical
owner_boundary_notes:
- '## Canonical owner-section requirements'
- These requirements are canonical live specification text for this owner document and preserve the required product, runtime, storage, UI, and governance details in owner-section form.
- '### Coverage blocker provider/model precedence owner section'
- '> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: “Puppet Master” only. No open questions; deterministic defaults per `Plans/Decision_Policy.md`.'
- '## SSOT references (DRY)'
- '- Canonical terms: `Plans/Glossary.md`'
- '- Source Control actions operate on concrete repositories and worktrees but MUST report results back through canonical lane/worktree records'
- '- `worktree.deleted` may be emitted only after the grace-period and file-lock checks pass; `worktree.created` records the allocation path, branch, lane/run/package lineage, and source-control owner before a node begins work in that tree'
- '- Legacy `git_panel/*` and `git_panel` state is one-time migration input into `source_control.project_state.{project_id}` only. Settings-owned policy such as `branching.base_branch` remains canonical settings policy, followed by canonical Source Control project state, with legacy `git_panel/*` consu'
- Source Control owns the live SCM truth for current repo/worktree state, while Health is a read-only diagnostic and `/validation` mirror unless a repair utility deep-links back into Source Control. Worktree projection keys use `project_id/repo_id/worktree_id`; the compact `/repo_id/worktree_id` displ
- Remote-mode and `/SSH` projects still use the same canonical IDs. Remote `worktree_path` is a remote path string, not a local-path-oriented mirror path. `Open in Source Control` opens a remote-aware Source Control context; if connectivity is lost, Source Control stays visible in degraded read-only m
- '`Progress > Current Task` and `Progress > Orchestrator Status` consume the same first-class SCM status strip instead of assistant-chat-local worktree summaries. The status payload includes `repo_id`, `repo_root`, `worktree_id`, `worktree_path`, compatibility `worktree_id/path`, `worktree_status`, `b'
- 'User-facing copy distinguishes action nouns across Source Control, GitHub Actions, Docker publish, Kubernetes, and Orchestrator: `Rebind`, `Start fresh`, retry, resume, recover, and restore are not interchangeable. Receipt nouns are also reserved: `Receipt`, `History`, `Evidence`, `Log`, and `Ledger'
- Blocked-state copy has a `reason-family` translation layer with structured-copy templates and typed placeholders for target identity, missing capability, blocked step, recovery action, and timestamp. Canonical families include approval-gated, policy-blocked, preflight-blocked, auth-blocked, governan
- SCM `/receipt` lineage records include worktree path/worktree id, branch, commit range, base branch, PR number and URL when applicable, GitHub Actions run/job/step refs, preview/container/compose runtime refs, image tag/digest/registry host, template repo/push status, and Kubernetes context/namespac
- '`Source Control` remains the Git/worktree owner surface.'
- '- Cross-references now point at `Plans/Orchestrator_Page.md#Source Control boundary` rather than the stale numbered anchor.'
- Source Control mirrors Orchestrator's SCM lineage acceptance details for worktree recovery. A blocked worktree row must show the exact worktree, affected files summary, safe-point relation, and recovery target from the canonical blocked payload, and any partial lineage badge must mean the repo/workt
- '- `AI commit batching` suggests logical commit groupings and draft messages from diff clusters in `Source Control > Changes` near staged and `/unstaged` groups. Required `/settings` include auto-suggest on/off, batching aggressiveness, message tone/style, and cross-directory grouping. `cmd.source_co'
- '- External Source Control UX baselines reinforce dense owner-surface behavior without making the panel side-panel-only. JetBrains Git log and conflict-resolution references validate roomy history/log tabs, strong filtering, and a dedicated conflict-resolution surface; GitLens and `/GitKraken` valida'
- '- `Review mode` compares a worktree against a base branch, another worktree, a PR target, or a selected commit range in a roomy diff-centric Source Control GUI lens. `Source Control > History` and `Worktrees` both expose `Open Review Mode`; dense compares may take over the editor-area while staying '
- '- Source Control owns the canonical compare/diff identity contract for reuse across chat, file surfaces, and Source Control. Hunk-level actions are explicit review commands: `stage`, `unstage`, `discard`, `apply`, `expand/collapse`, and conflict-resolution actions. Grouped undo/redo for diff-driven '
- 'ContractRef: ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Orchestrator_Page.md#Source Control boundary, ContractName:Plans/storage-plan.md'
- '*(Other options for reference: Option A = single canonical YAML schema; Option C = two files. Not chosen.)*'
owner_hints:
- Plans/WorktreeGitImprovement.md
split_recommendation_reason: The doc-level source-preserving unit covers both GUI-related and non-GUI spans; future fine-grained PlanUnits should split those surfaces when safe.
```

