## 12. Context usage display

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
