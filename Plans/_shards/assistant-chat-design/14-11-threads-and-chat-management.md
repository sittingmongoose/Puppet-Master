## 11. Threads and chat management

### 11.0A Debug investigation lifecycle and reopen semantics

Threads may contain ordinary turns, historical investigations, and at most one active investigation at a time.

Required lifecycle rules:
- a thread may hold multiple historical investigations, but only one investigation may be `active` for prompt injection and mutation-capable automation at a time
- choosing a new debug target in a thread with an active investigation must default to `continue current investigation`; switching to a different target requires explicit supersede behavior that marks the older investigation `superseded`
- `resolved`, `failed`, `cancelled`, and `superseded` investigations reopen as historical views by default; they do not silently restart automation, instrumentation, or browser sessions
- `attention_required`, `blocked`, and `failed_cleanup` investigations reopen as the same investigation with the same `investigation_id`, outstanding approvals, and pending cleanup state when possible
- thread restore must rehydrate the visible Investigation Context header, linked artifacts, requested/effective debug posture, and frozen target bindings without silently rebinding to a different target

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/Runtime_Artifacts_Panel.md

Recovery and branch rules:
- `cmd.chat.resume` remains the canonical resume path for recoverable Debug investigations; there is no debug-local alternate resume pipeline
- `cmd.chat.rewind` remains conversation-only and MUST NOT erase persisted investigation artifacts or runtime evidence
- file revert or restore actions remain owned by the canonical file-restore pipeline rather than by thread-local debug history
- when linked runtime identities expire across restart or disconnect, the thread must surface revalidation requirements rather than silently minting replacement identities

ContractRef: ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/FileSafe.md, ContractName:Plans/GitHub_Integration.md

ContractRef: ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/storage-plan.md

Threads and chat management are persistent shell behaviors.

### Canonical navigation model

Assistant Chat consumes the shared navigation and runtime identity contracts rather than defining chat-local replacements.

Rules:
- routed opens resolve through `route_target`
- source opens resolve through `OpenSubject` or `OpenFile`
- thread usage, artifact usage, ledger pivots, wizard resume, and object-focused opens use the same internal route model
- `resume_url` is serialized transport only and must not outgrow the canonical route contract

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/FileManager.md, ContractName:Plans/FinalGUISpec.md

Runtime identity display rules:
- chat may display requested/effective runtime identity and projection state
- chat must not define assistant-local replacements for the owner-doc field set
- historical thread/activity views use frozen requested/effective runtime snapshots captured for the execution

ContractRef: ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/Multi-Account.md, ContractName:Plans/storage-plan.md
### Branching conversations
- restore-and-branch creates a new `thread_id` and `branch_id` linked to the source restore point and source thread
- branch labels are visible in history and thread navigation
- branching from a running or dirty thread requires confirmation that names the preserved source state and the new branch target
- branch lineage remains queryable for restore/history and usage attribution

### Session browser interaction
- project/session browsing may open or focus a thread, but active-thread navigation remains local to the chat shell
- blocked, queued, and background states must remain visible through badges and attention surfaces even when the thread is not active
