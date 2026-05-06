  - step/clarification focus is a domain-local anchor or serialized deep-link detail, not base identity
- node graph detail:
  - `object_kind = node` or `attempt`
  - `object_id = <id>`
  - `inspector_target = evidence` / `history` / `reviews` / similar
- file/code open:
  - `OpenFile { path, line, range }`

### Impacted docs
- Primary owners:
  - `Plans/Contracts_V0.md`
  - `Plans/FinalGUISpec.md`
  - `Plans/Orchestrator_Page.md`
  - `Plans/FileManager.md`
- Cross-owner docs implicated by this seam:
  - `Plans/assistant-chat-design.md`
  - `Plans/storage-plan.md`
  - `Plans/UI_Command_Catalog.md`

### Contradictions / gaps surfaced
- Several current docs still blur “which object” and “what part of that object’s UI should be shown.”
- Without a sub-selection rule, route payloads will either bloat or every surface will go back to inventing custom anchor fields.
- `wizard_step` is a strong example of a field that matters operationally but should not force the base target object to become wizard-shaped.

### Candidate fixes to carry forward
- Define `inspector_target` narrowly in the contract layer as reusable detail/subsection focus.
- Keep line/range under `OpenFile`.
- Allow some object-family-specific anchors, but force them to justify themselves instead of defaulting every special case into the base route contract.

### Do-not-forget details
- Canonical identity and UI focus are different layers.
- The base routing model gets much cleaner once those layers stay separate.
- This seam is what prevents the new route-target contract from immediately turning back into per-surface deep-link spaghetti.

## Research Progress - 2026-03-16 - Migration pattern for `route_target` and navigation wrappers

### Targeted docs read
- `Plans/UI_Command_Catalog.md`
- `Plans/Contracts_V0.md`
- `Plans/FinalGUISpec.md`
- `Plans/Wiring_Matrix.md`

### Key findings
- The project already has two good migration precedents:
  - canonical event names with explicit legacy aliases in `Contracts_V0.md`
  - canonical runtime recovery command consolidation in `UI_Command_Catalog.md`, where legacy command families become deprecated aliases but consumers map to one shared namespace
- Navigation should follow the same pattern instead of claiming a hard flag day.
- The likely stable migration rule is:
  - existing user-facing wrapper commands may remain
  - their payload semantics should normalize through `route_target` / `OpenSubject`
  - older payload shapes can be accepted during migration
  - new producers/docs should emit the canonical normalized target model
- `resume_url` fits this too:
  - it can remain as a serialized transport form during migration
  - but it should stop being treated as a stronger separate primitive

### Recommended migration pattern
- Canonical layer:
  - `route_target`
  - `OpenSubject`
  - specialized `OpenFile`
  - canonical wrapper family such as `cmd.nav.*` if adopted
- During migration:
  - surface-specific commands like `cmd.artifacts.show_in_usage` or `cmd.orchestrator.open_in_source_control` may remain user-facing wrappers
  - wrappers normalize their args into canonical target/subject forms internally
  - docs should explicitly mark older/raw payload conventions as migration aliases where needed
- Compatibility rule:
  - new docs/producers MUST prefer canonical route-target forms
  - consumers MAY accept older wrapper-local payloads during migration
  - migration aliases MUST NOT become permanent parallel canon

### Impacted docs
- Primary owners:
  - `Plans/Contracts_V0.md`
  - `Plans/UI_Command_Catalog.md`
  - `Plans/Crosswalk.md`
- Cross-owner docs implicated by this seam:
  - `Plans/Wiring_Matrix.md`
  - `Plans/UI_Wiring_Rules.md`
  - `Plans/FinalGUISpec.md`
  - `Plans/assistant-chat-design.md`

### Contradictions / gaps surfaced
- Right now navigation has no explicit migration discipline comparable to event aliases or `cmd.runtime.*` consolidation.
- Without that discipline, consumer docs may either freeze old payloads forever or overclaim an immediate canonical switch that downstream docs cannot actually absorb.
- Wrapper commands are currently real and useful, but the docs still lack a rule for when they are canonical UX affordances versus deprecated raw transport shapes.

### Candidate fixes to carry forward
- Reuse the event-alias and recovery-command migration style as the template for navigation normalization.
- Let wrapper commands remain if they provide real UX meaning, but make the underlying target model canonical.
- Add explicit migration notes when replacing raw local IDs with normalized `subject_id` or `object_kind/object_id` forms.
- Teach the wiring/gate docs to understand canonical command vs wrapper vs deprecated alias, not just “command id exists.”

### Do-not-forget details
- The goal is not to delete every surface-specific command.
- The goal is to stop every surface-specific command from inventing its own private navigation semantics.
- This seam is what makes the route-target work practical to reconcile across the existing doc set.

## Research Progress - 2026-03-16 - Opus uncovered tranche synthesis

### Targeted docs read
- `Plans/UI_Command_Catalog.md` (Gemini backfill)
- `Plans/00-plans-index.md`
- `Plans/Architecture_Invariants.md`
- `Plans/Containers_Registry_and_Unraid.md`
- `Plans/Document_Packaging_Policy.md`
- `Plans/FileSafe.md`
- `Plans/GUI_Rebuild_Requirements_Checklist.md`
- `Plans/Media_Generation_and_Capabilities.md`
- `Plans/MiscPlan.md`
- `Plans/OpenCode_Deep_Extraction.md`
- `Plans/Section15_MVP_Promoted_Features_Spec.md`
- `Plans/agent-rules-context.md`
- `Plans/LSPSupport.md`

### Key findings
- This uncovered tranche produced real new synthesis, not filler. The remaining Gemini-only surface still hides several owner-level contradictions.
- `UI_Command_Catalog.md` backfill plus adjacent docs sharpened command/event ownership further:
  - the catalog still has an unresolved split between legacy `cmd.graph.*` recovery commands and canonical `cmd.runtime.*` recovery families.
  - `cmd.runtime.*` still lacks first-class placement in the main catalog structure despite being the actual cross-surface recovery command set.
- Index / checklist / promoted-feature docs are now confirmed drift carriers, not just passive summaries:
  - `00-plans-index.md` still misroutes or under-describes several rewrite-critical owners (`Orchestrator_Page`, `Widget_System`, `storage-plan`, `Executor_Protocol`) and does not surface Multi-Account/Crosswalk strongly enough.
  - `GUI_Rebuild_Requirements_Checklist.md` contains phantom command IDs and inherits stale panel/view assumptions from Final GUI/Orchestrator docs.
  - `Section15_MVP_Promoted_Features_Spec.md` still points at missing concrete command entries, stale Final GUI summary text, and a persistence model that has not caught up to workspace-tab identity.
- Several remaining docs are still structurally tied to old tier-era execution assumptions:
  - `Architecture_Invariants.md` lacks invariants for requested/effective identity completeness, graph-lock degradation boundaries, projection trust/generation staleness, blocked/failure classification, concurrent actors sharing provider pools, and safe-point vs restore-point separation.
  - `MiscPlan.md` still embeds sequential tier-era cleanup/remediation assumptions, including a cleanup-remediation loop outside the canonical runtime failure matrix and prepare/cleanup ordering that can erase safe-point baselines.
  - `FileSafe.md` still contains silent or under-owned bypass/degradation paths, HTE-only enforcement assumptions, and no complete DAE-side contract for write-scope or remote side-effect enforcement.
- Provider/runtime capability and account seams continued to widen in useful ways:
  - `Media_Generation_and_Capabilities.md` vs `orchestrator-subagent-integration.md` still disagree on live capability re-checks vs frozen run snapshots, and `platform.capability_evaluated` remains outside Contracts_V0 event registration.
  - `OpenCode_Deep_Extraction.md` source-verified that OpenCode’s SSE bus and auth model are process-global/server-global, making per-session/per-run identity and account binding impossible without explicit PM-side scoping logic.
  - `agent-rules-context.md` still assumes a tiny set of actors and CLI-only transport, while the real provider-using actor set is much broader and now includes non-CLI transports.
- Container / Docker / Unraid ownership is still more fragmented than the main owner set suggested:
  - `Containers_Registry_and_Unraid.md` is itself a second source of ghost command IDs and still defines auth/publish/repo-management command families absent from the catalog.
  - `cmd.docker.image.push` and `cmd.orchestrator.push_image` still both claim publish authority with the same event family.
  - DockerHub auth/account identity remains structurally isolated from Multi-Account and still lacks a coherent receipt/lineage bridge.
- Packaging / evidence / artifact lineage gaps are broader than just Project_Output_Artifacts:
  - `Document_Packaging_Policy.md` still has no place for glossary artifacts, requirements-staging seglog artifacts, or package-generation lineage states.
  - packaging evidence and execution evidence still share confusing `evidence/` naming without a canonical discriminator.
- LSP/tooling and PM internal-tool boundaries remain under-owned:
  - `LSPSupport.md` still assumes `tool.invoked` for user editor actions, which conflicts with event requirements that assume a `run_id`.
  - plan-mode tooling policy still denies `lsp` even though LSP context is assumed for planning/interview features.
  - mixed mutation semantics inside `lsp` remain unresolved against the `mutation_capable: bool` contract.

### Impacted docs
- Primary docs in this tranche:
  - `Plans/UI_Command_Catalog.md`
  - `Plans/00-plans-index.md`
  - `Plans/Architecture_Invariants.md`
  - `Plans/Containers_Registry_and_Unraid.md`
  - `Plans/Document_Packaging_Policy.md`
  - `Plans/FileSafe.md`
  - `Plans/GUI_Rebuild_Requirements_Checklist.md`
  - `Plans/Media_Generation_and_Capabilities.md`
  - `Plans/MiscPlan.md`
  - `Plans/OpenCode_Deep_Extraction.md`
  - `Plans/Section15_MVP_Promoted_Features_Spec.md`
  - `Plans/agent-rules-context.md`
  - `Plans/LSPSupport.md`
- Repeatedly implicated adjacent owners:
  - `Plans/FinalGUISpec.md`
  - `Plans/Orchestrator_Page.md`
  - `Plans/Executor_Protocol.md`
  - `Plans/storage-plan.md`
  - `Plans/Run_Modes.md`
  - `Plans/Permissions_System.md`
  - `Plans/newtools.md`
  - `Plans/Multi-Account.md`
  - `Plans/Contracts_V0.md`
  - `Plans/WorktreeGitImprovement.md`
  - `Plans/GitHub_Integration.md`
  - `STATE_FILES.md`

### Contradictions / gaps surfaced
- Remaining Gemini-only docs are not low-value leftovers; many still hide active owner gaps in indices/checklists/policies and subsystem plans.
- The broader rewrite still lacks a strong single source for several cross-cutting concerns: command namespace promotion, capability-state ownership, cleanup/remediation lineage, packaging lineage, container publish authority, and actor-scope/rules injection.
- Multiple supporting docs still silently inherit stale assumptions from earlier docs rather than independently reflecting the rewrite model.

### Candidate fixes to carry forward
- Treat these docs as real follow-on candidates for later-model continuation if the next coverage audit still shows too much unevenness.
- Highest-signal follow-on docs from this tranche appear to be:
  - `Plans/Architecture_Invariants.md`
  - `Plans/Containers_Registry_and_Unraid.md`
  - `Plans/FileSafe.md`
  - `Plans/Media_Generation_and_Capabilities.md`
  - `Plans/MiscPlan.md`
  - `Plans/OpenCode_Deep_Extraction.md`
  - `Plans/Section15_MVP_Promoted_Features_Spec.md`
  - `Plans/LSPSupport.md`
  - with `Plans/00-plans-index.md` and `Plans/GUI_Rebuild_Requirements_Checklist.md` important as drift-multipliers.

### Do-not-forget details
- The broader sweep still cannot be called complete until coverage is recomputed again after this tranche.
- `UI_Command_Catalog.md` now has the missing Gemini pass, which removes a weird asymmetry from the most central command-owner doc.
- This tranche confirms that some of the remaining docs are not just “less important” — they were simply under-examined and still contain real contradictions.

## Research Progress - 2026-03-16 - `resume_url` / deep-link serialization should be a narrowed transport

### Targeted docs read
- `Plans/FinalGUISpec.md`
