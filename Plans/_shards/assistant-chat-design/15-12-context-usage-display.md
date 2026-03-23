## 12. Context usage display

### 12.0A Investigation Context for Debug threads

Debug threads expose a visible **Investigation Context** alongside the normal context-usage affordances.

Investigation Context is the live, user-visible bundle of bounded evidence, target metadata, temporary instrumentation state, and verification outcomes that the assistant may use while an investigation is active.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/Runtime_Artifacts_Panel.md

Required header fields:
- `investigation_id`
- `primary_target`
- `debug_target_kind`
- `current_phase`
- `final_or_intermediate_state`
- `verification_strength?`
- `attention_reason_code?`
- `blocked_reason_code?`
- `active_instrumentation_count`
- `last_updated_at_utc`

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Glossary.md

Required per-item states:
- `active`
- `redacted`
- `revoked`
- `blocked`
- `expired`
- `omitted`

Only `active` and `redacted` items may be serialized into prompt context. `revoked`, `blocked`, `expired`, and `omitted` items remain visible for audit but must not be serialized as successful context.

ContractRef: ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/Permissions_System.md

Visibility rules:
- Investigation Context is separate from ordinary browser/document composer chips
- ordinary browser capture remains explicit and user-triggered
- Debug auto-ingestion is allowed only inside an active investigation and must create visible Investigation Context items rather than hidden messages
- every Investigation Context item must expose provenance, timestamp, redaction/truncation state, and a revoke action
- raw logs, traces, screenshots, and recordings remain owned by Runtime Artifacts; Investigation Context carries bounded summaries and refs rather than raw unbounded payloads

ContractRef: ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/UI_Command_Catalog.md

Required actions from the Investigation Context surface:
- `Open target`
- `Open artifacts`
- `Export bundle`
- `Revoke item`
- `Show raw in Context Detail Pane`

ContractRef: ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/FileManager.md

Per-thread context uses one compact chat entrypoint and one canonical detailed surface.

Rules:
- the context indicator lives in the chat header for the active thread
- hovering the indicator opens a lightweight status module
- the hover module shows `Usage`, `Tokens`, estimated `Cost`, and a bottom action labeled `More Details`
- clicking the context indicator does not compact immediately; it reveals the `Compact Now` action
- choosing `Compact Now` triggers the canonical compaction pipeline immediately
- choosing `More Details` opens or focuses the thread-scoped Context Detail Pane in an editor tab
- one Context Detail Pane tab exists per thread; repeated opens focus the existing tab instead of opening duplicates
- app-wide Usage remains a separate surface and is not replaced by the thread-scoped Context Detail Pane
- earlier thread-Usage-in-side-panel or detached-pop-out wording is superseded by this model

ContractRef: ContractName:Plans/usage-feature.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/FinalGUISpec.md

The Context Detail Pane is the canonical detailed per-thread context surface.

Required structure:
- top-level view toggle: `Curated` and `Raw`
- `Curated` view sections: `Overview`, `Breakdown`, and `Messages`
- `Raw` view exposes full serialized payload inspection for the thread and for individual messages

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/FileManager.md

`Overview` must show:
- thread title or session title
- message counts
- headline provider, model, mode, persona, and worker summary
- headline token, context, and estimated-cost metrics

`Breakdown` must show:
- context-usage bar
- token buckets
- grouped breakdowns by role, tool activity, and provider/model when available

`Messages` must show:
- one expandable row per message
- compact row fields for role, worker type, mode, model, time or duration, total tokens, and estimated cost when known
- expanded per-message details with provider, model, effort, persona, token breakdown, context usage, cost, relevant requested/effective deltas, and notable tool or part summary
- raw payload access without leaving the message row

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/Contracts_V0.md

Cost and freshness rules:
- per-thread cost is labeled `Estimated Cost` unless provider-authoritative cost exists
- hover and detail surfaces may show in-progress or updating states while a turn is streaming
- partial streaming updates must not present final totals before they are known
- raw views may expose lower-level buckets, receipts, or normalization details used to derive the estimate

ContractRef: ContractName:Plans/usage-feature.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Runtime_Artifacts_Panel.md
