## 11. Threads and chat management
ContractRef: ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/storage-plan.md

Threads and chat management are persistent shell behaviors.

### Canonical navigation model
- the thread list is a persistent sidebar or equivalent persistent shell region
- the user may resize or collapse it, but not replace it with a transient-only overlay model
- switching threads preserves scroll position, pending-input draft state, and side-panel tab state per thread where applicable

### Branching conversations
- restore-and-branch creates a new `thread_id` and `branch_id` linked to the source restore point and source thread
- branch labels are visible in history and thread navigation
- branching from a running or dirty thread requires confirmation that names the preserved source state and the new branch target
- branch lineage remains queryable for restore/history and usage attribution

### Session browser interaction
- project/session browsing may open or focus a thread, but active-thread navigation remains local to the chat shell
- blocked, queued, and background states must remain visible through badges and attention surfaces even when the thread is not active
