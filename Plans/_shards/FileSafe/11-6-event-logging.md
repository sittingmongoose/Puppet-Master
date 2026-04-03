## 6. Event Logging
**Contract:** FileSafe emits a structured event for every block or approved override (command blocklist, write scope, security filter, or compiled-prompt safety check) into the canonical event stream.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md

Authoritative logging path:
- FileSafe events are written to seglog as canonical `EventRecord` entries.
- Any `filesafe-events.jsonl` surface is a derived projector or diagnostic mirror rebuilt from seglog.
- PM MUST NOT maintain a second authoritative FileSafe append log alongside seglog, and recovery logic MUST NOT prefer a FileSafe-only mirror over the canonical event stream.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Architecture_Invariants.md, ContractName:Plans/Runtime_Artifacts_Panel.md

**FileSafeEvent payload (minimum canonical fields):**

```rust
pub struct FileSafeEvent {
    pub event_type: String,
    pub guard_type: String,
    pub pattern_matched: String,
    pub command_preview: String,
    pub agent: Option<String>,
    pub timestamp: DateTime<Utc>,
    pub allowed: bool,
}
```

ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/Run_Modes.md, ContractName:Plans/Contracts_V0.md

Logging call semantics:
- guard blocks and approved overrides are emitted on the main execution path before the user-facing result is returned
- event-write failure MUST surface as a structured diagnostic; it is not silently ignored
- analytics, dashboards, and gate reports read FileSafe history from the canonical event stream or its derived projections

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/Decision_Policy.md
