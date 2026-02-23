# Recovery Fix Queue

This queue is ordered for recovery execution (highest impact first).

## `Plans/Decision_Policy.md`

- Recommended action: **Re-run Prompt 1 Fill-In + Drift Hardening**
- Estimated scope: **Small**
- Why: Missing acceptance/verification section (not gateable / not AI-executable).
- Why: Missing PolicyRule `no_secrets_in_storage` and ConfigKey `github.api_version` definitions referenced by other plans.

## `Plans/DRY_Rules.md`

- Recommended action: **Re-run Prompt 1 Fill-In + Drift Hardening**
- Estimated scope: **Medium**
- Why: Contains unresolved placeholder markers that block execution-ready plans.
- Why: Missing acceptance/verification section (not gateable / not AI-executable).

## `Plans/Contracts_V0.md`

- Recommended action: **Run Review Prompt 2**
- Estimated scope: **Small**
- Why: Missing acceptance/verification section (not gateable / not AI-executable).

## `Plans/Architecture_Invariants.md`

- Recommended action: **Run Review Prompt 2**
- Estimated scope: **Small**
- Why: Missing acceptance/verification section (not gateable / not AI-executable).

## `Plans/UI_Command_Catalog.md`

- Recommended action: **Run Review Prompt 2**
- Estimated scope: **Small**
- Why: Missing acceptance/verification section (not gateable / not AI-executable).

## `Plans/Glossary.md`

- Recommended action: **Re-run Prompt 1 Fill-In + Drift Hardening**
- Estimated scope: **Medium**
- Why: Missing primitive definitions referenced by ContractRef: `DRYRules`, `PatchPipeline`, `SessionStore`.

## `Plans/Tools.md`

- Recommended action: **Re-run Prompt 1 Fill-In + Drift Hardening**
- Estimated scope: **Medium**
- Why: Missing ToolID `GitHubApiTool` definition referenced by `Plans/Crosswalk.md`.

## `Plans/plan_graph.schema.json`

- Recommended action: **Run Review Prompt 2**
- Estimated scope: **Medium**
- Why: Missing user-project sharded plan graph schema: `.puppet-master/project/plan_graph/index.json` + `nodes/<node_id>.json` (+ optional `edges.json`).

## `Plans/plan_graph.json`

- Recommended action: **Run Review Prompt 2**
- Estimated scope: **Medium**
- Why: Missing user-project sharded plan graph coverage (should reference `.puppet-master/project/plan_graph/index.json` + `nodes/<node_id>.json`).

## `Plans/interview-subagent-integration.md`

- Recommended action: **Run Review Prompt 2**
- Estimated scope: **Medium**
- Why: Must explicitly specify user-project outputs under `.puppet-master/project/plan_graph/` (sharded index + nodes).

## `Plans/storage-plan.md`

- Recommended action: **Run Review Prompt 2**
- Estimated scope: **Medium**
- Why: Must define canonical artifact persistence semantics in seglog (full content, chunking for large payloads, hashes, logical paths; filesystem as export/cache).

## `Plans/GitHub_API_Auth_and_Flows.md`

- Recommended action: **Re-run Prompt 1 Fill-In + Drift Hardening**
- Estimated scope: **Medium**
- Why: References ConfigKey `github.api_version` and PolicyRule `no_secrets_in_storage` which are not currently defined in SSOT docs.

## `Plans/Rebrand_Chunked_Playbook.md`

- Recommended action: **Restore and rewrite from scratch**
- Estimated scope: **Large**
- Why: Contains legacy naming (must be replaced with "Puppet Master" only).
- Why: Lacks explicit SSOT references (risk of duplicated/contradictory definitions).

## `Plans/rebrand.md`

- Recommended action: **Restore and rewrite from scratch**
- Estimated scope: **Large**
- Why: Contains legacy naming (must be replaced with "Puppet Master" only).
- Why: Lacks explicit SSOT references (risk of duplicated/contradictory definitions).

## `Plans/newfeatures.md`

- Recommended action: **Re-run Prompt 1 Fill-In + Drift Hardening**
- Estimated scope: **Small**
- Why: Contains legacy naming (must be replaced with "Puppet Master" only).
- Why: Lacks explicit SSOT references (risk of duplicated/contradictory definitions).

## `Plans/chain-wizard-flexibility.md`

- Recommended action: **Re-run Prompt 1 Fill-In + Drift Hardening**
- Estimated scope: **Small**
- Why: Contains legacy naming (must be replaced with "Puppet Master" only).
- Why: Lacks explicit SSOT references (risk of duplicated/contradictory definitions).

## `AGENTS.md`

- Recommended action: **Run Review Prompt 2**
- Estimated scope: **Small**
- Why: Contains legacy naming (must be replaced with "Puppet Master" only).

## `Plans/orchestrator-subagent-integration.md`

- Recommended action: **Re-run Prompt 1 Fill-In + Drift Hardening**
- Estimated scope: **Medium**
- Why: Contains unresolved placeholder markers that block execution-ready plans.

## `Plans/usage-feature.md`

- Recommended action: **Re-run Prompt 1 Fill-In + Drift Hardening**
- Estimated scope: **Medium**
- Why: Contains unresolved placeholder markers that block execution-ready plans.
- Why: Missing acceptance/verification section (not gateable / not AI-executable).

## `Plans/FileSafe.md`

- Recommended action: **Re-run Prompt 1 Fill-In + Drift Hardening**
- Estimated scope: **Medium**
- Why: Contains unresolved placeholder markers that block execution-ready plans.

## `Plans/LSPSupport.md`

- Recommended action: **Re-run Prompt 1 Fill-In + Drift Hardening**
- Estimated scope: **Medium**
- Why: Contains an open-questions heading/section (must be resolved or removed).

## `Plans/00-plans-index.md`

- Recommended action: **Run Review Prompt 2**
- Estimated scope: **Small**
- Why: Missing acceptance/verification section (not gateable / not AI-executable).

## `Plans/Crosswalk.md`

- Recommended action: **Run Review Prompt 2**
- Estimated scope: **Small**
- Why: Missing acceptance/verification section (not gateable / not AI-executable).

## `Plans/Decision_Log.md`

- Recommended action: **Run Review Prompt 2**
- Estimated scope: **Small**
- Why: Missing acceptance/verification section (not gateable / not AI-executable).

## `Plans/MiscPlan.md`

- Recommended action: **Re-run Prompt 1 Fill-In + Drift Hardening**
- Estimated scope: **Medium**
- Why: Lacks explicit SSOT references (risk of duplicated/contradictory definitions).

## `Plans/Multi-Account.md`

- Recommended action: **Re-run Prompt 1 Fill-In + Drift Hardening**
- Estimated scope: **Medium**
- Why: Missing acceptance/verification section (not gateable / not AI-executable).
- Why: Lacks explicit SSOT references (risk of duplicated/contradictory definitions).

## `Plans/OpenCode_Deep_Extraction.md`

- Recommended action: **Re-run Prompt 1 Fill-In + Drift Hardening**
- Estimated scope: **Medium**
- Why: Lacks explicit SSOT references (risk of duplicated/contradictory definitions).

## `Plans/PlanPathAudit_Report.md`

- Recommended action: **Run Review Prompt 2**
- Estimated scope: **Small**
- Why: Missing acceptance/verification section (not gateable / not AI-executable).

## `Plans/WorktreeGitImprovement.md`

- Recommended action: **Re-run Prompt 1 Fill-In + Drift Hardening**
- Estimated scope: **Medium**
- Why: Lacks explicit SSOT references (risk of duplicated/contradictory definitions).

## `Plans/agent-rules-context.md`

- Recommended action: **Re-run Prompt 1 Fill-In + Drift Hardening**
- Estimated scope: **Medium**
- Why: Missing acceptance/verification section (not gateable / not AI-executable).
- Why: Lacks explicit SSOT references (risk of duplicated/contradictory definitions).

## `Plans/geminigui-spec.md`

- Recommended action: **Run Review Prompt 2**
- Estimated scope: **Small**
- Why: Missing acceptance/verification section (not gateable / not AI-executable).

## `Plans/gui-layout-architecture.md`

- Recommended action: **Run Review Prompt 2**
- Estimated scope: **Small**
- Why: Missing acceptance/verification section (not gateable / not AI-executable).

## `Plans/human-in-the-loop.md`

- Recommended action: **Re-run Prompt 1 Fill-In + Drift Hardening**
- Estimated scope: **Medium**
- Why: Lacks explicit SSOT references (risk of duplicated/contradictory definitions).

## `Plans/newtools.md`

- Recommended action: **Re-run Prompt 1 Fill-In + Drift Hardening**
- Estimated scope: **Medium**
- Why: Lacks explicit SSOT references (risk of duplicated/contradictory definitions).

## `Plans/opusgui-redesign-spec.md`

- Recommended action: **Run Review Prompt 2**
- Estimated scope: **Small**
- Why: Missing acceptance/verification section (not gateable / not AI-executable).

## `Plans/rewrite-tie-in-memo.md`

- Recommended action: **Re-run Prompt 1 Fill-In + Drift Hardening**
- Estimated scope: **Medium**
- Why: Missing acceptance/verification section (not gateable / not AI-executable).
- Why: Lacks explicit SSOT references (risk of duplicated/contradictory definitions).
