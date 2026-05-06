### Do-not-forget details
- This is a hard persistence-contract contradiction.
- It sits in a cross-cutting SSOT and should be cleaned up during the same widget reconciliation tranche.

## Research Progress - 2026-03-17 - GPT-5.4 remaining-partial tranche synthesis

### Targeted docs read
- `Plans/00-plans-index.md`
- `Plans/Architecture_Invariants.md`
- `Plans/BinaryLocator_Spec.md`
- `Plans/Containers_Registry_and_Unraid.md`
- `Plans/DRY_Rules.md`
- `Plans/Decision_Log.md`
- `Plans/Document_Packaging_Policy.md`
- `Plans/FileSafe.md`
- `Plans/Formatters_System.md`
- `Plans/GUI_Rebuild_Requirements_Checklist.md`
- `Plans/LSPSupport.md`
- `Plans/Media_Generation_and_Capabilities.md`
- `Plans/MiscPlan.md`
- `Plans/OpenCode_Coverage_Matrix.md`
- `Plans/OpenCode_Deep_Extraction.md`
- `Plans/Plugins_System.md`
- `Plans/Section15_MVP_Promoted_Features_Spec.md`
- `Plans/Skills_System.md`
- `Plans/agent-rules-context.md`
- `Plans/feature-list.md`
- `Plans/newfeatures.md`
- `Plans/rewrite-tie-in-memo.md`

### Key findings
- The `GPT-5.4` wave still produced substantive owner-level deltas across the entire remaining partial tranche. This is not yet a convergence zone.
- The sharpest new pattern is that several docs now fail mechanically, not just conceptually:
  - `DRY_Rules.md` cross-checks surfaced duplicated canonical sections, malformed/uncategorized `ContractRef`s, lowercase normative text that evades traceability gates, and alias-canonicalization rules that now contradict owner docs.
  - `GUI_Rebuild_Requirements_Checklist.md` is not just stale; its own command-coverage block is self-invalidating because it cites phantom or superseded IDs and points at the wrong catalog section ranges.
  - `OpenCode_Coverage_Matrix.md` is now stale both structurally and procedurally: missing audit rows it claims to cover, stale fix-status entries, and matrix assumptions that no longer match current OpenCode / bridged-provider identity contracts.
- Runtime identity and recovery semantics sharpened again:
  - `Architecture_Invariants.md` needs explicit invariants for frozen requested/effective execution identity bundles, provider-pool concurrency scope, projection trust vs scheduler authority, and safe-point lineage exactness.
  - `Decision_Log.md` still lacks canonical entries for the very rewrite decisions that are currently only captured as addenda or ledger facts, which is now causing canon ambiguity rather than simple under-documentation.
  - `MiscPlan.md` and `FileSafe.md` continue to expose the same deep seam from different angles: deferred-run resume validity, pre-cleanup vs safe-point restore ordering, DAE/post-scan blocked phases, and orphan cleanup/remediation logic outside the canonical runtime lineage model.
- OpenCode limitations are now source-verified enough that they should be treated as hard architectural constraints unless the bridge changes:
  - `OpenCode_Deep_Extraction.md` sharpens the server-global SSE / fixed working-directory / session-scoped compaction and approvals / ephemeral session identity issues into direct PM obligations.
  - `Media_Generation_and_Capabilities.md` and `OpenCode_Coverage_Matrix.md` both show that caller-scoped identity and transient runtime capability state still lack proper request/event surfaces.
- Shell / promoted-feature / UI owner drift remains active:
  - `Section15_MVP_Promoted_Features_Spec.md` still points at missing command rows and unresolved shell-surface ownership for project/session browser and attention center.
  - `feature-list.md` / `newfeatures.md` still mix promoted shell/runtime language with pre-promotion page/title-bar/recovery models, and now also show internal contradictions around persistence identity and recovery anchors.
  - `00-plans-index.md` still under-routes rewrite-critical owner docs, especially around Multi-Account, Provider, and Orchestrator packet ownership.
- Tooling subsystems still have unresolved enforcement boundaries:
  - `Formatters_System.md` continues to sit outside the central mutation/policy engine and loses attribution under DAE.
  - `Plugins_System.md` still permits read-only mode bypass via mutating plugin tools and env-var mutation, plus namespace/runtime model splits.
  - `Skills_System.md` still has unresolved bundling-off semantics, compaction behavior for bundled skill text, and HTE/DAE reachability rules.
  - `LSPSupport.md` still lacks a normalized split between UI-only, internal-service, read-only tool, and mutation-capable LSP actions, especially in multi-project-tab routing.

### Impacted docs
- Primary docs in this tranche:
  - `Plans/00-plans-index.md`
  - `Plans/Architecture_Invariants.md`
  - `Plans/BinaryLocator_Spec.md`
  - `Plans/Containers_Registry_and_Unraid.md`
  - `Plans/DRY_Rules.md`
  - `Plans/Decision_Log.md`
  - `Plans/Document_Packaging_Policy.md`
  - `Plans/FileSafe.md`
  - `Plans/Formatters_System.md`
  - `Plans/GUI_Rebuild_Requirements_Checklist.md`
  - `Plans/LSPSupport.md`
  - `Plans/Media_Generation_and_Capabilities.md`
  - `Plans/MiscPlan.md`
  - `Plans/OpenCode_Coverage_Matrix.md`
  - `Plans/OpenCode_Deep_Extraction.md`
  - `Plans/Plugins_System.md`
  - `Plans/Section15_MVP_Promoted_Features_Spec.md`
  - `Plans/Skills_System.md`
  - `Plans/agent-rules-context.md`
  - `Plans/feature-list.md`
  - `Plans/newfeatures.md`
  - `Plans/rewrite-tie-in-memo.md`
- Repeatedly implicated adjacent owners:
  - `Plans/Executor_Protocol.md`
  - `Plans/Crosswalk.md`
  - `Plans/Glossary.md`
  - `Plans/Orchestrator_Page.md`
  - `Plans/FinalGUISpec.md`
  - `Plans/Prompt_Pipeline.md`
  - `Plans/Multi-Account.md`
  - `Plans/storage-plan.md`
  - `Plans/UI_Command_Catalog.md`
  - `Plans/Run_Modes.md`
  - `Plans/Tools.md`
  - `Plans/Permissions_System.md`
  - `Plans/Project_Output_Artifacts.md`
  - `Plans/Widget_System.md`

### Contradictions / gaps surfaced
- The tail still has broad, meaningful signal at the fourth model pass; it remains worth continuing intact.
- Several docs are now clearly causing canon ambiguity because addenda and base text conflict in active owner docs with no Decision Log resolution.
- There are still unresolved architectural edges around DAE enforcement, OpenCode bridge limits, promoted-feature shell ownership, and runtime identity provenance.

### Candidate fixes to carry forward
- Continue the ordered sequence on this same 22-doc tranche into `GPT-5.2`; `GPT-5.4` still produced enough novel signal to justify it.
- Highest-signal docs still look like:
  - `Plans/Architecture_Invariants.md`
  - `Plans/FileSafe.md`
  - `Plans/MiscPlan.md`
  - `Plans/OpenCode_Deep_Extraction.md`
  - `Plans/OpenCode_Coverage_Matrix.md`
  - `Plans/Section15_MVP_Promoted_Features_Spec.md`
  - `Plans/DRY_Rules.md`
  - `Plans/Decision_Log.md`
  - `Plans/feature-list.md`
  - `Plans/newfeatures.md`
  - `Plans/rewrite-tie-in-memo.md`
  - with `Plans/GUI_Rebuild_Requirements_Checklist.md`, `Plans/Plugins_System.md`, `Plans/Skills_System.md`, and `Plans/LSPSupport.md` still clearly active.

### Do-not-forget details
- After this merge, the remaining partial tail should sit uniformly at `Gemini + Opus + Sonnet + GPT-5.4`.
- The `Decision_Log` retry succeeded under `agent-331`; keep `agent-314` recorded as the failed attempt and `agent-331` as the canonical successful run.
- `meta.json` remains active; this sweep is still not ready for reconciliation.


## Research Progress - 2026-03-17 - GPT-5.2 remaining-partial tranche synthesis

### Targeted docs read
- `Plans/00-plans-index.md`
- `Plans/Architecture_Invariants.md`
- `Plans/BinaryLocator_Spec.md`
- `Plans/Containers_Registry_and_Unraid.md`
- `Plans/DRY_Rules.md`
- `Plans/Decision_Log.md`
- `Plans/Document_Packaging_Policy.md`
- `Plans/FileSafe.md`
- `Plans/Formatters_System.md`
- `Plans/GUI_Rebuild_Requirements_Checklist.md`
- `Plans/LSPSupport.md`
- `Plans/Media_Generation_and_Capabilities.md`
- `Plans/MiscPlan.md`
- `Plans/OpenCode_Coverage_Matrix.md`
- `Plans/OpenCode_Deep_Extraction.md`
- `Plans/Plugins_System.md`
- `Plans/Section15_MVP_Promoted_Features_Spec.md`
- `Plans/Skills_System.md`
- `Plans/agent-rules-context.md`
- `Plans/feature-list.md`
- `Plans/newfeatures.md`
- `Plans/rewrite-tie-in-memo.md`

### Key findings
- The `GPT-5.2` continuation wave still produced substantive new deltas across the full 22-doc tail, so the tranche has still not converged before the final `GPT-5.3-Codex` pass.
- The strongest `GPT-5.2` pattern is that multiple specs now fail at exact field, anchor, or command-registration boundaries rather than only at conceptual alignment:
  - `DRY_Rules.md`, `Crosswalk.md`, `Progression_Gates.md`, and `Contracts_V0.md` now show concrete `ContractRef` format, anchor, and duplicate-section failures that would break deterministic traceability rather than just weaken it.
  - `GUI_Rebuild_Requirements_Checklist.md`, `Section15_MVP_Promoted_Features_Spec.md`, `feature-list.md`, and `newfeatures.md` still contain exact phantom/superseded/missing command IDs, stale shell-surface assumptions, and persistence-identity contradictions against `UI_Command_Catalog.md`, `FinalGUISpec.md`, and promoted-shell canon.
  - `Document_Packaging_Policy.md` now has a sharper canonicality split with `Project_Output_Artifacts.md`: docset-directory-as-canon, gate-enforcement claims, and `evidence/` namespace assumptions do not line up with seglog-first artifact ownership or actual verifier coverage.
- Runtime invariants and recovery ownership sharpened again:
  - `Architecture_Invariants.md` is now missing invariants that adjacent owner docs already state normatively: safe-point vs restore-point boundaries, graph-lock non-degradation, classification-before-policy, checkpoint-derived projection freshness, and attempt-boundary identity freeze.
  - `FileSafe.md` still has a concrete DAE enforcement seam: post-approval arg mutation, `context_files` widening write scope, fail-open initialization paths, and `recovery_options[]` vs `allowed_action_ids[]` schema drift.
  - `MiscPlan.md` now has a tighter cleanup contradiction: best-effort prepare/cleanup can still invalidate safe-point prerequisites and mtime-based evidence pruning can cut across attempt-lineage retention requirements.
- Provider/runtime identity findings are still active:
  - `BinaryLocator_Spec.md` now has a sharper ownership gap around OpenCode launcher discovery and an explicitly dangling `Spec_Lock` naming-rule claim.
  - `Media_Generation_and_Capabilities.md`, `agent-rules-context.md`, and `Skills_System.md` all still under-specify caller scope, execution-role capture, identity disclosure, or currently-usable-vs-instance-enabled capability semantics.
  - `OpenCode_Coverage_Matrix.md` and `OpenCode_Deep_Extraction.md` now pin more exact OpenCode limits: session identity must stay provider-native, SSE correlation fields remain under-specified, and requested/effective identity parity is still weaker for server-bridged providers than for direct providers.
- Tooling subsystems continue to surface enforcement and routing mismatches:
  - `Formatters_System.md` still has no authoritative rule for formatter-vs-LSP ownership, DAE non-triggering host writes, or overlapping formatter detectors.
  - `Plugins_System.md` still contains a concrete post-permission mutation bypass, TOML namespace collisions for plugin tool IDs, and mutation-capable mode bypass risk when policy keys remain name-based.
  - `LSPSupport.md` still lacks a normalized split between run-scoped `tool.*` telemetry, UI-session LSP interactions, and mutation-capable apply-edit paths in multi-project/workspace-tab routing.
- Rewrite-root routing drift remains active rather than historical:
  - `00-plans-index.md`, `Decision_Log.md`, and `rewrite-tie-in-memo.md` still under-route or fail to record rewrite-era owner decisions around Seams/Packages/Overseers, requested/effective identity scope, operational identity classes, and Crosswalk-based owner precedence.

### Impacted docs
- Primary docs in this tranche:
  - `Plans/00-plans-index.md`
  - `Plans/Architecture_Invariants.md`
  - `Plans/BinaryLocator_Spec.md`
  - `Plans/Containers_Registry_and_Unraid.md`
  - `Plans/DRY_Rules.md`
  - `Plans/Decision_Log.md`
  - `Plans/Document_Packaging_Policy.md`
  - `Plans/FileSafe.md`
  - `Plans/Formatters_System.md`
  - `Plans/GUI_Rebuild_Requirements_Checklist.md`
  - `Plans/LSPSupport.md`
  - `Plans/Media_Generation_and_Capabilities.md`
  - `Plans/MiscPlan.md`
  - `Plans/OpenCode_Coverage_Matrix.md`
  - `Plans/OpenCode_Deep_Extraction.md`
  - `Plans/Plugins_System.md`
  - `Plans/Section15_MVP_Promoted_Features_Spec.md`
  - `Plans/Skills_System.md`
  - `Plans/agent-rules-context.md`
  - `Plans/feature-list.md`
  - `Plans/newfeatures.md`
  - `Plans/rewrite-tie-in-memo.md`
- Repeatedly implicated adjacent owners:
  - `Plans/Executor_Protocol.md`
  - `Plans/Crosswalk.md`
  - `Plans/Glossary.md`
  - `Plans/Orchestrator_Page.md`
  - `Plans/FinalGUISpec.md`
  - `Plans/Prompt_Pipeline.md`
  - `Plans/Multi-Account.md`
  - `Plans/storage-plan.md`
