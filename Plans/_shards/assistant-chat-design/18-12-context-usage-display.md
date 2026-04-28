## 12. Context usage display

### 12.0 Normal thread context usage

Every Assistant or Interview thread exposes a visible context-usage summary and a drill-down Context Detail Pane for the context actually consumed by that thread.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/usage-feature.md, ContractName:Plans/Prompt_Pipeline.md

**Required visible thread-level signals:**
- current context usage against the effective model window
- the last compaction / truncation reason when compaction changed what remained in prompt
- whether displayed cost/token figures are provider-authoritative or estimated
- whether additional hidden/background usage contributed to the thread total

ContractRef: ContractName:Plans/usage-feature.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Contracts_V0.md

**Required Context Detail Pane breakdown:**
- system and instruction blocks
- user and assistant messages
- compiled context attachments and forwarded document selections
- tool-derived or activity-derived context when the thread uses it
- run-level or message-level usage snapshots derived from canonical `usage.event` and `run.completed.usage`
- debug-only Investigation Context items when the thread is an active debug thread

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/Runtime_Artifacts_Panel.md

Rules:
- the thread surface MUST derive usage from canonical runtime records; it MUST NOT invent a second chat-local cost model
- hidden/background helper calls MAY roll into thread totals, but their source class MUST remain inspectable in raw/detail views
- truncation, redaction, and context-serialization state remain visible per item; the UI MUST NOT silently present omitted context as if it were still serialized

ContractRef: ContractName:Plans/usage-feature.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md

### 12.0A Investigation Context for Debug threads

Debug threads expose a visible **Investigation Context** alongside the normal context-usage affordances.

Investigation Context is the live, user-visible bundle of bounded evidence, target metadata, temporary instrumentation state, verification outcomes, and revalidation state that the assistant may use while an investigation is active.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/Runtime_Artifacts_Panel.md

**Canonical header fields imported into chat:**
- `investigation_id`
- `primary_target_summary`
- `debug_target_kind`
- `investigation_phase`
- `state`
- `verification_state?`
- `attention_reason_code?`
- `blocked_reason_code?`
- `revalidation_reason_code?`
- `active_instrumentation_count`
- `last_updated_at_utc`

Chat-local aliases such as `primary_target` and `final_or_intermediate_state` are retired. Assistant Chat consumes the canonical field names above and may layer presentation labels on top, but it must not rename the durable data contract.

**Required per-item states:**
- `active`
- `redacted`
- `revoked`
- `blocked`
- `expired`
- `omitted`

Only `active` and `redacted` items may be serialized into prompt context. `revoked`, `blocked`, `expired`, and `omitted` items remain visible for audit but must not be serialized as successful context.

ContractRef: ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/Permissions_System.md

**Visibility rules:**
- Investigation Context is separate from ordinary browser/document composer chips.
- ordinary browser capture remains explicit and user-triggered.
- Debug auto-ingestion is allowed only inside an active investigation and must create visible Investigation Context items rather than hidden messages.
- every Investigation Context item must expose provenance, timestamp, redaction/truncation state, and a revoke action.
- raw logs, traces, screenshots, recordings, and full transcript payloads remain owned by Runtime Artifacts; Investigation Context carries bounded summaries and stable refs rather than raw unbounded payloads.

**Required actions from the Investigation Context surface:**
- `Open target`
- `Open artifacts`
- `Export bundle`
- `Revalidate target`
- `Revoke item`
- `Show raw in Context Detail Pane`

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/FileManager.md, ContractName:Plans/UI_Command_Catalog.md
