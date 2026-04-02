## 9. State Management

State management follows a reactive state tree with observable projections consumed by Slint models and shell surfaces.

### 9.1 State architecture

- canonical runtime and durable state live in Rust-owned records/projections
- Slint surfaces subscribe to observable projections rather than polling
- UI models update through batched `invoke_from_event_loop` mutations

### 9.2 State categories

- **UI state:** ephemeral, not persisted; hover, local selection, transient panel expansion
- **Session state:** persisted per session/thread/workspace tab
- **Project state:** persisted per project and shared across reopened sessions for that project
- **Global state:** user preferences and cross-project durable defaults

### 9.3 State flow

Canonical flow:
`User action -> Command -> State mutation -> UI update`

Rules:
- commands are the mutation boundary
- mutations write to canonical projections first
- UI updates render from the new projection state rather than optimistic ad hoc local rewrites unless explicitly marked pending

### 9.4 Conflict resolution

- last-write-wins for UI state
- merge strategy for project state when multiple durable sources contribute
- requested vs effective runtime values must remain separately inspectable

### 9.5 Persistence boundaries

- ephemeral state may be discarded on restart unless explicitly promoted
- persisted state must have stable keys and versioned migrations
- migration reads from deprecated keys are allowed only during forward migration and must rewrite to the canonical family

### 9.6 Context management

Context management combines thread context, Investigation Context, editor/file references, and review/document references without hiding provenance.

Rules:
- each context block has stable identity and owner surface
- context usage counters and token summaries derive from canonical usage/state projections
- pruning, compaction, and restoration rules must disclose what was removed, summarized, or rehydrated

