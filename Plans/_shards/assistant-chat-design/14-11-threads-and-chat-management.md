## 11. Threads and chat management
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
