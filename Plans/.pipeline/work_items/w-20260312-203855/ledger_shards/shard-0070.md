  - `object_id = <wizard_id>`
- evidence source document:
  - `subject_id = doc:<document_id>`
- generated draft source:
  - `subject_id = artifact:<artifact_id>`

### Impacted docs
- Primary owners:
  - `Plans/Contracts_V0.md`
- Strongly implicated adjacent docs:
  - `Plans/Crosswalk.md`
  - `Plans/storage-plan.md`
  - `Plans/FinalGUISpec.md`
  - `Plans/FileManager.md`
  - `Plans/usage-feature.md`
  - `Plans/assistant-chat-design.md`

### Contradictions / gaps surfaced
- `usage_event_ref` still reads like a direct route field in some docs rather than a normalized object identity.
- `document_id` and `artifact_id` still appear in some navigation prose where `subject_id` should be named directly.
- Wizard and message flows already behave like object routes, but some docs still make them look like special deep-link payload families.

### Candidate fixes to carry forward
- Put the classification rule directly in `Contracts_V0.md`.
- Keep `subject_id` frozen to the two canonical families until a new cross-surface content identity proves necessary.
- Normalize every other routed identity through `object_kind` + `object_id`.

### Do-not-forget details
- `subject_id` is not a second generic object taxonomy.
- If `subject_id` expands carelessly, the whole routing model becomes muddy again.

## Research Progress - 2026-03-17 - Sonnet remaining-partial tranche synthesis

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
- The full Sonnet continuation wave produced substantial new deltas across the entire remaining partial set. This was not a confirmation pass.
- The highest-value pattern is that several “owner-of-owners” docs remain structurally stale and now actively amplify drift:
  - `00-plans-index.md` still has missing SSOT rows, stranded addendum-to-plan-map updates, and stale routing around Crosswalk, Multi-Account, GitHub auth, and feature-list.
  - `Decision_Log.md` is still essentially empty for the rewrite era while major decisions are being made only in downstream addenda.
  - `rewrite-tie-in-memo.md` is itself a stale rewrite root: it still omits seams/packages/lanes/overseers, scopes requested/effective identity too narrowly, and does not nominate several current owner docs that now carry rewrite-critical contracts.
  - `feature-list.md` / `newfeatures.md` still preserve tier-era execution, old widget/tab assumptions, stale recovery models, and promoted-feature phasing contradictions that would mislead implementers who treat them as current.
- Runtime governance and safety contracts continue to sharpen materially:
  - `Architecture_Invariants.md` still lacks concrete invariant ownership for execution-role identity, run-scoped requested/effective snapshots, graph-lock degradation boundaries, projection freshness, blocked/failure classification, role-scoped account-pool contamination, and safe-point vs restore-point immutability rules.
  - `FileSafe.md` still contains major DAE-enforcement holes, write-scope contradictions (`context_files` and prefix matching), absent remote side-effect integration, undefined safe-point restore triggers, and silent-disable / bypass paths.
  - `MiscPlan.md` still conflicts with safe-point cleanup ordering, remediation lineage preservation, attempt-scoped evidence retention, and also carries orphan cleanup/crew runtime contracts not owned anywhere else.
- Provider/runtime/account seams got materially sharper under Sonnet:
  - `OpenCode_Deep_Extraction.md` source-verifies hard architecture limits: server-global SSE with concurrent-client pollution, fixed server working directory requiring separate instances per worktree, session-scoped approvals and compaction state that are destroyed on session deletion, no observable upstream account identity, and no real reconnect/observe path for mid-run SSE loss.
  - `OpenCode_Coverage_Matrix.md` itself is now behind the rewrite: it omits A2A/stream-owner coverage, runtime-correlation records, OpenCode dual-auth-realm ownership, several Multi-Account GUI surfaces, and even some fixes that are already complete.
  - `Media_Generation_and_Capabilities.md` still lacks requested/effective account disclosure in `media.generate`, leaves transient disabled-state recovery under-specified, and has no event model for capability-change refresh behavior.
- Tooling / command / UI owner gaps are still strong enough to justify later-model continuation:
  - `GUI_Rebuild_Requirements_Checklist.md` still claims phantom command IDs, keeps superseded chat usage commands, omits the `cmd.runtime.*` family entirely, and does not track degraded/projection-trust runtime surfaces.
  - `LSPSupport.md` still has unresolved MVP/gating contradictions, missing rename approval command/event families, no clear plan-mode rule for mutating LSP operations, and no multi-project-tab routing contract.
  - `Section15_MVP_Promoted_Features_Spec.md` still points at stale Final GUI body text, missing project/session browser and attention-center surface ownership, and ungated promoted-feature command families.
- Plugins / skills / formatters remain deeply under-owned in cross-runtime behavior:
  - `Plugins_System.md` still has a hook-name schism, missing `mutation_capable` on plugin tools, a `shell.env` bypass that can mutate PM control env vars, shadow approval paths via `permission.ask`, and Persona-disabled plugins whose tools remain callable.
  - `Skills_System.md` still has unresolved HTE/DAE runtime delivery mechanics, bundling-off ambiguity, bundled-skill compaction loss, actor-scope ambiguity for subagents/rotated runs, and provider-affinity ambiguity for `.claude/` discovery roots.
  - `Formatters_System.md` still conflicts with LSP formatting ownership, has no DAE reconciliation semantics for formatter writes, bypasses FileSafe/tool policy for custom formatter commands, and defines unregistered `format.*` / `file.edited` event families.
- Supporting docs with narrower surface area still produced useful deltas:
  - `BinaryLocator_Spec.md` sharpens an ownership vacuum around OpenCode `cli_launcher`, has a dangling/false ContractRef to a non-existent four-tier naming rule, and still uses ambiguous Session wording.
  - `Containers_Registry_and_Unraid.md` still has uncataloged command IDs, unresolved publish-authority split, broken blocked-payload consistency, and unanchored publish-result lineage.
  - `Document_Packaging_Policy.md` still conflicts with Project Output Artifacts around docset canonicality, provenance fields, evidence schema discrimination, and claims hard gate enforcement even though GATE-014 is not live.
  - `agent-rules-context.md` still under-enumerates callers, omits execution-role input, conflicts with Personas/Prompt_Pipeline on bundle ordering, and has weaker disclosure/help contracts than adjacent systems.

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
  - `Plans/Orchestrator_Page.md`
  - `Plans/Crosswalk.md`
  - `Plans/Glossary.md`
  - `Plans/FinalGUISpec.md`
  - `Plans/Prompt_Pipeline.md`
  - `Plans/Multi-Account.md`
  - `Plans/storage-plan.md`
  - `Plans/UI_Command_Catalog.md`
  - `Plans/Run_Modes.md`
  - `Plans/Tools.md`
  - `Plans/Permissions_System.md`
  - `Plans/Widget_System.md`
  - `Plans/Project_Output_Artifacts.md`

### Contradictions / gaps surfaced
- The remaining partial surface is still high-signal; later-model continuation remains justified.
- Several docs that look like summaries, indexes, or side-system specs are actually major drift multipliers because they still frame the old model and route readers incorrectly.
- The rewrite still lacks clean owner boundaries for several cross-cutting areas: runtime identity invariants, safe-point cleanup ordering, OpenCode server/session limits, project/session browser ownership, attention-center ownership, runtime-recovery command family coverage, and plugin/skill/formatter runtime safety.

### Candidate fixes to carry forward
- Continue the ordered sequence on this same 22-doc tranche into `GPT-5.4`; Sonnet still produced real new deltas across almost every doc.
- Highest-signal docs for later-model continuation remain:
  - `Plans/Architecture_Invariants.md`
  - `Plans/FileSafe.md`
  - `Plans/MiscPlan.md`
  - `Plans/OpenCode_Deep_Extraction.md`
  - `Plans/OpenCode_Coverage_Matrix.md`
  - `Plans/Section15_MVP_Promoted_Features_Spec.md`
  - `Plans/feature-list.md`
  - `Plans/newfeatures.md`
  - `Plans/rewrite-tie-in-memo.md`
  - `Plans/Decision_Log.md`
  - with `Plans/00-plans-index.md`, `Plans/GUI_Rebuild_Requirements_Checklist.md`, `Plans/Plugins_System.md`, `Plans/Skills_System.md`, and `Plans/Formatters_System.md` also still clearly above the noise floor.

### Do-not-forget details
- After this merge, the entire remaining partial set should sit uniformly at `Gemini + Opus + Sonnet`; there is no longer any unevenness inside the tail.
- Several Sonnet findings sharpened prior generic flags into precise contract failures or source-verified architecture limits; these should not be collapsed back into generic summary language during reconciliation.
- `meta.json` must remain active; this is still an in-progress research sweep, not a reconciliation-ready state.

## Research Progress - 2026-03-17 - Concrete route normalization for high-pressure user flows

### Targeted docs read
- `Plans/usage-feature.md`
- `Plans/FinalGUISpec.md`
- `Plans/assistant-chat-design.md`
- `Plans/UI_Command_Catalog.md`

### Key findings
- The contract now has enough shape to define concrete route normalization for the most common user-facing flows.

### Canonical route examples
- cost usage -> Show in Usage:
  - `target_kind = primary_view`
  - `project_id = <project_id>`
  - `object_kind = usage_event`
  - `object_id = <canonical usage event id>`
  - `thread_id = <thread_id>` when thread-scoped usage is required
  - `inspector_target = usage`
- cost usage -> Show in Ledger:
  - `target_kind = primary_view`
  - `project_id = <project_id>`
  - `object_kind = usage_event`
  - `object_id = <canonical usage event id>`
  - `thread_id = <thread_id>` when thread-scoped history is required
  - `tab_id = ledger`
- wizard resume:
  - `target_kind = primary_view`
  - `project_id = <project_id>`
  - `object_kind = wizard`
  - `object_id = <wizard_id>`
  - `thread_id = <thread_id>` when the associated thread must be restored
  - serialized `resume_url` carries narrow step anchor detail
- chat search hit:
  - `target_kind = side_panel`
  - `project_id = <project_id>`
  - `thread_id = <thread_id>`
  - `object_kind = message`
  - `object_id = <message_id>`
- node detail pivot:
  - `target_kind = page_tab`
  - `project_id = <project_id>`
  - `focused_run_id = <run_id>`
  - `object_kind = node`
  - `object_id = <node_id>`
  - `tab_id = node_graph`
  - `inspector_target = details | evidence | usage | history`
- attempt detail pivot:
  - `target_kind = page_tab`
