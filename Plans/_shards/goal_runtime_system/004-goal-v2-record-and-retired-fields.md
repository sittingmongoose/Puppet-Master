# Shard 004: Goal V2 record and retired fields

Source: `Plans/Goal_Runtime_System.md`

Source lines: L58-L121

Source SHA256: `62576d2ba5cc5495c0ec34c833274975525938d5686d0e4b45924cbb8a0fed2c`

---

## Goal V2 record and retired fields

A Goal is one concise text objective plus a lifecycle. There is no title field, no separate summary, no structured decomposition, and no second text field of any kind. The objective prose itself carries the outcome, the finish condition, and the constraints, because a user who wants to change any of those edits one paragraph rather than reconciling five fields.

`GoalRecordV2` is the only active writer schema:

```yaml
schema_id: pm.goal.record.v2
fields:
  goal_id: string
  project_id: string
  thread_id: string
  objective_text: string
  revision: integer
  state: active|paused|blocked|completed
  blocked_reason_ref: string|null
  active_run_ref: string|null
  created_at: timestamp
  updated_at: timestamp
  currentness_hash: string
negative_fields:
  - title
  - phase
  - tranche
  - child_goal_ids
  - goal_budget
  - planner_role
  - verifier_role
  - adjudicator_role
  - separate_done_when
  - separate_scope
  - separate_constraints
  - attachment_manifest
```

`objective_text` is expected to remain concise. The product maximum stays consistent with the existing approximately 4,000-character Goal convention; a request that exceeds it is rejected with a typed error rather than silently truncated, and the user is shown the limit. `currentness_hash` is the compare-and-swap token for every mutation; a stale projection cannot write.

The lifecycle enum is exactly `active | paused | blocked | completed`. `active` means the host may schedule the next turn when the thread is idle and eligible. `paused` means the user stopped continuation. `blocked` means an owner-supplied condition prevents safe progress and names it through `blocked_reason_ref`. `completed` means objective-completion evidence satisfied the continuation check.

Cancellation is not a fifth state. Cancelling writes a `goal.cancelled` event and a minimal cancellation receipt, then removes the Goal from the active projection. A cancelled Goal is not rendered as an enduring status card, and no continuation may fire for it afterwards. History remains readable for audit; the Activity domain simply stops showing it.

Every Goal has zero or one `active_run_ref`. Concurrency between the Goal and its run is resolved by the run owner, not by adding queue structure to the Goal.

`GoalRevisionRecord` is the append-only objective history:

```yaml
schema_id: pm.goal.revision.v2
fields:
  goal_id: string
  revision: integer
  objective_text: string
  change_source: user_direct|agent_proposed_user_approved
  source_message_id: string|null
  approval_id: string|null
  prior_revision_hash: string|null
  revision_hash: string
  created_at: timestamp
```

Only two `change_source` values exist. There is no third path by which a Goal's text changes. Automatic memory, compaction, title generation, summarization, Persona switching, model switching, provider retry, and BSD advice can none of them write `objective_text`. A semantic diff or a predicted To-Do impact is not required for the approval UI, though internal audit may retain `prior_revision_hash` and `revision_hash`.

Relevant attachments and context remain thread-owned. A Goal never carries an attachment manifest, and a Goal never freezes an input snapshot at creation. Where a workflow needs frozen inputs, that workflow owns the freeze under its own contract.

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/storage-plan.md, ContractName:Plans/assistant-chat-design.md
