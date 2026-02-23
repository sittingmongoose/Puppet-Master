# Recovery Fix Queue

Audit basis commit: `91dca72`

## `Plans/Decision_Policy.md`

- Recommended action: **Re-run Prompt 1 Fill-In + Drift Hardening**
- Estimated scope: **Medium**
- Why: SSOT coverage gap: canonical definitions missing/invalid for references used by other plans.
- Why: Contains unresolved placeholder markers (must be resolved).

## `Plans/DRY_Rules.md`

- Recommended action: **Re-run Prompt 1 Fill-In + Drift Hardening**
- Estimated scope: **Medium**
- Why: Contains unresolved placeholder markers (must be resolved).
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
- Why: SSOT coverage gap: canonical definitions missing/invalid for references used by other plans.

## `Plans/Tools.md`

- Recommended action: **Re-run Prompt 1 Fill-In + Drift Hardening**
- Estimated scope: **Medium**
- Why: SSOT coverage gap: canonical definitions missing/invalid for references used by other plans.

## `Plans/Progression_Gates.md`

- Recommended action: **Re-run Prompt 1 Fill-In + Drift Hardening**
- Estimated scope: **Medium**
- Why: Contains unresolved placeholder markers (must be resolved).

## `Plans/FileSafe.md`

- Recommended action: **Re-run Prompt 1 Fill-In + Drift Hardening**
- Estimated scope: **Medium**
- Why: Contains unresolved placeholder markers (must be resolved).

## `Plans/LSPSupport.md`

- Recommended action: **Re-run Prompt 1 Fill-In + Drift Hardening**
- Estimated scope: **Medium**
- Why: Contains an open-questions heading/section (must be resolved or removed).

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

## `AGENTS.md`

- Recommended action: **Re-run Prompt 1 Fill-In + Drift Hardening**
- Estimated scope: **Small**
- Why: Contains legacy naming (must be replaced with "Puppet Master" only).

## `Plans/usage-feature.md`

- Recommended action: **Re-run Prompt 1 Fill-In + Drift Hardening**
- Estimated scope: **Medium**
- Why: Missing acceptance/verification section (not gateable / not AI-executable).
- Why: Lacks explicit SSOT references (risk of duplicated/contradictory definitions).

## `Plans/newtools.md`

- Recommended action: **Re-run Prompt 1 Fill-In + Drift Hardening**
- Estimated scope: **Medium**
- Why: Lacks explicit SSOT references (risk of duplicated/contradictory definitions).

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

## `Plans/WorktreeGitImprovement.md`

- Recommended action: **Re-run Prompt 1 Fill-In + Drift Hardening**
- Estimated scope: **Medium**
- Why: Lacks explicit SSOT references (risk of duplicated/contradictory definitions).

## `Plans/agent-rules-context.md`

- Recommended action: **Re-run Prompt 1 Fill-In + Drift Hardening**
- Estimated scope: **Medium**
- Why: Missing acceptance/verification section (not gateable / not AI-executable).
- Why: Lacks explicit SSOT references (risk of duplicated/contradictory definitions).

## `Plans/rewrite-tie-in-memo.md`

- Recommended action: **Re-run Prompt 1 Fill-In + Drift Hardening**
- Estimated scope: **Medium**
- Why: Missing acceptance/verification section (not gateable / not AI-executable).
- Why: Lacks explicit SSOT references (risk of duplicated/contradictory definitions).

## `Plans/chain-wizard-flexibility.md` (Builder/Review recovery contracts)

- Recommended action: **Resolved by spec update**
- Estimated scope: **Closed**
- Why: Added pane-selection persistence contract (`document_pane_state.v1`), checkpoint contract (`document_checkpoint.v1`), findings summary contract (`review_findings_summary.v1`), and final approval gate contract (`review_approval_gate.v1`).
- Why: Added explicit restoration requirements for interrupted runs and `awaiting_final_approval` workflows.

## `Plans/interview-subagent-integration.md` (Interview recovery contracts)

- Recommended action: **Resolved by spec update**
- Estimated scope: **Closed**
- Why: Added findings-summary-before-approval flow and single final approval gate for interview Multi-Pass.
- Why: Added recovery requirements to restore findings preview + final approval state and document-pane context.

## `Plans/FinalGUISpec.md` (GUI recovery wiring)

- Recommended action: **Resolved by spec update**
- Estimated scope: **Closed**
- Why: Added redb keys for document pane state, review findings, approval gates, and checkpoints.
- Why: Added session recovery behavior for restoring pane selection and final approval stage after interruption.

## `Plans/FileManager.md` (shared restore pipeline)

- Recommended action: **Resolved by spec update**
- Estimated scope: **Closed**
- Why: Added embedded document-pane shared buffer/history contract with File Editor.
- Why: Added required unsaved-buffer recovery and restore-through-open-file pipeline semantics.
