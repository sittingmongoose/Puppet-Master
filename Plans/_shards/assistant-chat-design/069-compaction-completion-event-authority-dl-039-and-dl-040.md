# Shard 069: Compaction completion Event Authority (DL-039 and DL-040)

Source: `Plans/assistant-chat-design.md`

Source lines: L25287-L25340

Source SHA256: `35379f0b8c2fd1c3ea7425b336f90ed33f8a8f6b5220eba030e8a89af5a8b94c`

---

## Compaction completion Event Authority (DL-039 and DL-040)

The following contract establishes the previously missing bindings under Jared's explicit EA-S6-001 approval; it is not a claim of pre-existing implementation. Assistant Chat is the semantic/payload owner, Prompt Pipeline retains compaction policy, Shared Integration Runtime owns operation/lease/replay machinery, and Storage owns append, projection durability, registry admission and retention.

**Membership and producer.** `event-family-context-compaction-completed@1.0.0` has the sole exact event type `context.compaction.completed` and closed payload `pm.context_compaction_completed.schema.v1`, version `1.0.0`, in `Plans/event_payload_context_compaction_completed.schema.json`. Define producer binding ID `assistant_chat.compaction_commit.v1` for the existing bounded compaction transaction's commit step. Manual `cmd.chat.compact_context` reaches it through `handlers::chat::compact_context`; automatic and eligible micro-compaction reach the same commit step under PP-078. UI click, helper return, local progress and command-result rendering are not independent emitters.

**Identity and scope.** This family is `project_only`, bound to the real owning Project of the existing `thr_{ulid}` Chat thread and the project-bound ThreadDetail schema. Worktree-unbound is not projectless. Resolve Project, Project Home Server, thread, execution environment and topology against their authorities before preparation/commit; application-scope generic operations do not authorize application-scoped Chat completion. Missing or ambiguous ownership, cross-Project thread, stale topology or deleted/hidden target fails closed. Payload `project_id` and `thread_id` equal the EventRecord envelope; the envelope remains exclusively Contracts-owned `pm.event.v0@2.0.0`. The existing operation carries `operation_id` and its current `operation_generation`; a lease retry keeps the logical operation ID. EventRecord `run_id`, `node_id`, `attempt_id`, account refs and causality refs are required-present null unless actually proven; never invent them from the focused UI. Actor and correlation identities come from that operation. `occurred_at_utc` equals payload `committed_at_utc`, frozen at the commit attempt, and no timestamp is an identity.

**Commit and state meaning.** A completion means a candidate passed every PP-078 fence and useful-gain predicate and the Storage commit marker durably committed. Input/output context revisions are monotonic integers; `output_context_revision > input_context_revision`, `input_tokens - output_tokens = reclaimed_tokens > 0`, and configured `min_reclaim_tokens` must also be met. The detailed CompactionReceipt records branch/head, retained obligations, redaction, hashes, artifacts, fences and policy proof; its opaque reference must resolve to this exact operation/thread/revision pair at commit. The permanent EventRecord is a bounded audit projection of that receipt, containing no transcript, summary, prompt, tool output, content-derived hash, title or arbitrary message. Required token/byte counts are measurements, not billed Usage. No-op, soft-defer, cancellation, stale/late result, policy denial, helper failure and precommit interruption emit no completion. `context.compaction.started` and `context.compaction.failed` remain unregistered, independently visible through existing result/receipt state.

**Consumers and presentation.** Define consumer ID `assistant_chat.focused_thread_detail.compaction.v1`, binding version `1.0.0`, and projector ID `assistant_chat.focused_thread_projector.v1`, version `1.0.0`, as the compaction binding of the existing Assistant Chat focused-thread projector. On a validated live or replayed completion, the projector adds the stable `event:<event_id>` reference once to the existing bounded/windowed `thread_detail_projection.agent_activity_refs` view, preserves transcript/tool/artifact refs, and advances the existing applied/published cursors only under SIR-038 and SP-259. The view may resolve that content-free event and a still-authorized detailed receipt. Evicting an old reference from the hot detail window preserves the permanent EventRecord and its on-demand audit lookup; it does not accumulate indefinite history in one projection. Unfocused threads replay on demand through the same binding; they do not need a second event consumer. Compaction completion never sends a chat message, invokes a tool, bills Usage, schedules a helper, or produces another event during replay. AgentChatHistorySearch continues to query retained transcript authority under ACD-062; its search capability is unchanged and is not an extra completion-event subscription.

**Deletion, compatibility and withdrawal.** Archive preserves identity and existing read rules. Logical deletion immediately suppresses the thread and its completion activity from ordinary Chat/search/detail even if an old projection survives. The permanent EventRecord is available only through already-authorized content-free audit access. A deleted or expired receipt resolves to a typed unavailable/tombstoned result; it never recreates a thread, head, content, artifact or search document. Existing legal holds and deletion deadlines remain unchanged. There is no accepted legacy event alias, extension, or synthesized backfill: historical command/local receipts are not automatically durable completion events. Version 1 readers reject unknown payload fields/versions. Any successor schema or withdrawal needs owner migration and a separately reviewed registry revision; malformed or unknown-family inputs follow Storage quarantine rules without checkpoint advance. An otherwise valid unsupported future-version record remains untouched; the consumer halts with `unsupported_schema_version` and preserves its last supported sequence until a compatible reader is available. Withdrawal stops new append first, retains existing indefinite audit bytes and identity records, fences dependent publication, and requires an owner-validated compatible read/replay path before resumption; it never turns old completion bytes into started/failed events.

ContractRef: ContractName:Plans/Contracts_V0.md#EventRecord, ContractName:Plans/Prompt_Pipeline.md#PP-078, ContractName:Plans/storage-plan.md#SP-259, ContractName:Plans/Shared_Integration_Runtime.md#SIR-038, SchemaID:pm.context_compaction_completed.schema.v1
### ACD-461 - Compaction Completion Event Authority

```yaml
plan_unit_id: ACD-461
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Successful committed compaction produces one content-free context.compaction.completed EventRecord under the explicit owner contract above. The focused-thread detail consumer uses the existing replay path; retained transcript search and thread-deletion behavior remain unchanged.
gui_related: true
gui_classification_reason: This unit binds the visible focused-thread completion history to durable authority.
depends_on: []
unblocks: []
acceptance_criteria:
  - "ACD-461 binds the exact producer, consumer, projector, project/thread identity, closed payload, commit-only transition and compatibility/withdrawal behavior."
  - "SP-259 and SIR-038 provide append durability, idempotency, concrete checkpoint key/version, replay fencing and indefinite content-free retention."
  - "Started, failed, cancelled, no-op, stale and deferred operations have no completion EventRecord; schema and semantic negatives reject invalid identity, gains, payloads and commit claims."
  - "Replaying a completion cannot resurrect a deleted thread or change transcript/search authority."
validation_surfaces:
  - Plans/context_compaction_completion_contract_fixtures.json
  - reports/event-authority-20260911/step-06-contract-validation.md
risk_class: compaction_completion_authority
reasoning_tier: high
context_scope: compaction_completion_event_authority
implementation_surfaces:
  - Plans/assistant-chat-design.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/Decision_Log.md#DL-039
  - Plans/Decision_Log.md#DL-040
negative_constraints:
  - No runtime, buildability, independent-validator clearance, governance seal, WorkNodes, or NodeSeeds follows from this contract.
owner_hints:
  - Plans/storage-plan.md
  - Plans/Shared_Integration_Runtime.md
  - Plans/Prompt_Pipeline.md
```
