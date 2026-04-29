## 11. Threads and chat management

### Message Taxonomy

Canonical chat records use the following message taxonomy.

| message_type | sender | properties | rendering |
|---|---|---|---|
| `user` | human | `text`, `attachments[]`, `edit_history[]` | left-aligned bubble |
| `assistant` | model | `text`, `tool_calls[]`, `citations[]` | right-aligned bubble |
| `system` | runtime | `text`, `severity` | centered notice |
| `tool_result` | tool | `tool_id`, `output`, `exit_code` | collapsible card |
| `operation_card` | runtime | `operation_type`, `status`, `progress` | inline card |
| `blocked_notice` | runtime | `blocked_family`, `allowed_action_ids[]` | warning card |
| `error` | runtime | `error_code`, `message` | error banner |

Rules:
- the visible rendering vocabulary is closed to the taxonomy above unless a later SSOT contract extends it
- message taxonomy is independent of thread lifecycle state and runtime posture
- persisted transcript records MUST retain their canonical `message_type` so restore, export, and search do not infer type from presentation alone

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/FinalGUISpec.md

### Thread Lifecycle State Machine

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0577
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - `thread_id: None` in multiple handoff/coordination examples even though thread continuity is part of the surrounding model
  - thread_id: None
  - `object_kind = thread`
  - object_kind = thread
  - `thread_id = <thread_id>` when the associated thread must be restored
  - thread_id = <thread_id>
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.

Thread lifecycle state is separate from operational status markers such as `attention_required`, `blocked`, `completed`, or `failed`.

Canonical lifecycle path:
`creating -> active -> suspended -> archived -> deleted`

Transitions:
- `creating -> active`: first message sent
- `active -> suspended`: user closes thread / session ends
- `suspended -> active`: user reopens thread
- `active -> archived`: user archives or retention policy triggers
- `archived -> active`: user unarchives
- `active -> deleted`: user deletes
- `archived -> deleted`: retention policy or user deletes

Persistence behavior by state:
- `creating`: keep only lightweight draft shell metadata; no durable transcript is required until the first user message commits
- `active`: keep the full transcript, queue state, thread metadata, runtime references, and restorable UI state
- `suspended`: keep the durable transcript and metadata, but drop ephemeral auto-follow, focus, and non-restorable streaming affordances
- `archived`: keep transcript, lineage, citations, attachments, and audit metadata while pruning transient composer state, active queue state, and nonessential caches according to retention policy
- `deleted`: remove the thread from normal user-visible chat surfaces; only minimal tombstone or ledger records required for integrity, sync, or retention compliance may remain

Rules:
- lifecycle transitions MUST be explicit and auditable
- archiving does not rewrite message ids, thread lineage, or worktree lineage
- deletion is terminal for ordinary user navigation even if compliance metadata is retained elsewhere

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Decision_Policy.md

### Thread Identity Model

Thread identity is canonical and stable across reopen, restore, archive, and branch-aware history views.

Required fields and relationships:
- `thread_id`: format `thr_{ulid}`; minted on the first user message; globally unique within the PM instance
- `dev_session_id`: optional reference to the originating development/runtime session; one dev session may span multiple threads
- `terminal_session_id`: optional lineage field when the thread was spawned from a terminal context
- thread metadata includes `created_at`, `updated_at`, `title`, `mode_overlay`, and `persona_id`

Generation and lineage rules:
- the system MUST NOT mint a durable `thread_id` for an unsent empty draft
- `title` is auto-generated from the first user message and remains user-editable without changing identity
- `mode_overlay` stores the effective workflow overlay for the thread using the canonical closed overlay enum
- thread records reference their originating `dev_session_id` when present, but a single `dev_session_id` may relate to multiple branched or restored threads
- when terminal lineage exists, `terminal_session_id` remains attached for audit even if the terminal later exits

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/Contracts_V0.md

### 11.0A Debug investigation lifecycle and reopen semantics

Threads may contain ordinary turns, historical investigations, and at most one active investigation at a time.

**Closed investigation lifecycle:**
- `active` — the current mutation-capable or evidence-gathering investigation for the thread.
- `blocked` — waiting on a prerequisite such as approval, target availability, or revalidation.
- `attention_required` — user input or human review is needed before the investigation may continue.
- `verifying` — the investigation is in its verification stage and has not yet reached a terminal conclusion.
- `failed_cleanup` — the investigation found or fixed something, but cleanup could not be completed.
- `resolved` — verification passed and required cleanup completed (or was explicitly preserved under a documented hold).
- `cancelled` — the user or runtime stopped the investigation without resolving it.
- `superseded` — replaced by a newer investigation targeting a different subject or a newer branch of the same problem.

Required lifecycle rules:
- A thread may hold multiple historical investigations, but only one investigation may be non-terminal (`active`, `blocked`, `attention_required`, `verifying`, or `failed_cleanup`) for prompt injection and mutation-capable automation at a time.
- Choosing a new debug target in a thread with a non-terminal investigation must default to continuing the current investigation. Switching to a materially different target requires an explicit supersede action that marks the older investigation `superseded`.
- `resolved`, `cancelled`, and `superseded` investigations reopen as historical views by default; they do not silently restart automation, instrumentation, or browser/dev sessions.
- Reopening a terminal investigation for new live work creates a new investigation lineage entry linked by `supersedes_investigation_id` unless the prior investigation is still in a resumable non-terminal state.
- `blocked`, `attention_required`, `verifying`, and `failed_cleanup` investigations reopen against the same `investigation_id` when the bound target, runtime identity, and worktree identity are still valid.
- Thread restore must rehydrate the visible Investigation Context header, linked artifacts, requested/effective debug posture, revalidation reason (if any), and frozen target bindings without silently rebinding to a different target.

**Revalidation reasons** that prevent silent resume include at minimum target replacement, auth/account switch, worktree or branch drift, HEAD drift for bound file/worktree targets, expired instrumentation, and stale safe-point or remediation lineage.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/UI_Command_Catalog.md

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
