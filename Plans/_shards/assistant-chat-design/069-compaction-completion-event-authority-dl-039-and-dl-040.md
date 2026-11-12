# Shard 069: Compaction completion Event Authority (DL-039 and DL-040)

Source: `Plans/assistant-chat-design.md`

Source lines: L26210-L26274

Source SHA256: `f80be12686299431277ddda1e924d5ae429b0010be452c072bea541c970de0a5`

---

## Compaction completion Event Authority (DL-039 and DL-040)

The following contract establishes the previously missing bindings under Jared's explicit EA-S6-001 approval; it is not a claim of pre-existing implementation. Assistant Chat is the semantic/payload owner, Prompt Pipeline retains compaction policy, Shared Integration Runtime owns operation/lease/replay machinery, and Storage owns append, projection durability, registry admission and retention.

**Membership and producer.** `event-family-context-compaction-completed@1.0.0` has the sole exact event type `context.compaction.completed` and closed payload `pm.context_compaction_completed.schema.v1`, version `1.0.0`, in `Plans/event_payload_context_compaction_completed.schema.json`. Define producer binding ID `assistant_chat.compaction_commit.v1` for the existing bounded compaction transaction's commit step. Manual `cmd.chat.compact_context` reaches it through `handlers::chat::compact_context`; automatic and eligible micro-compaction reach the same commit step under PP-078. UI click, helper return, local progress and command-result rendering are not independent emitters.

**Identity and scope.** `context.compaction.completed` remains `project_only` in `Plans/event_family_registry.json`; DL-300 admits no application edition of this family. A Project thread retains real Project/Home Server and the exact old ThreadDetail payload/codec; a worktree-unbound Project remains a Project form. Outer/inner scope and thread agree; the EventRecord envelope remains Contracts-owned `pm.event.v0@2.0.0`. Resolve current owner, thread/deletion/head, roots, topology, writer/lease and complete currentness before commit. `operation_id` and `operation_generation` stay exact across retry. Optional run/node/attempt/account/causality refs are required-present null unless genuinely proven. Actor/correlation come from the original operation and commit time is frozen, never identity. Unknown schema, cross-scope join, deleted/hidden target or missing evidence refuses. Application compaction keeps null `project_id`, real `thr_{ulid}`, Server/Computer/environment/topology and app storage writer in its owner operation/result receipts; those receipts do not become EventRecords or enter the Project event replay/checkpoint. App event emission remains `missing_event_registration` and non-emitting until a separate Event Authority admission and complete payload/source/append/read/checkpoint/retention adoption. Missing owner receipt/source custody leaves that app operation unavailable; no synthetic Project or app completion event is permitted.

**Commit and state meaning.** A completion means a candidate passed every PP-078 fence and useful-gain predicate and the Storage commit marker durably committed. Input/output context revisions are monotonic integers; `output_context_revision > input_context_revision`, `input_tokens - output_tokens = reclaimed_tokens > 0`, and configured `min_reclaim_tokens` must also be met. The detailed CompactionReceipt records branch/head, retained obligations, redaction, hashes, artifacts, fences and policy proof; its opaque reference must resolve to this exact operation/thread/revision pair at commit. The permanent EventRecord is a bounded audit projection of that receipt, containing no transcript, summary, prompt, tool output, content-derived hash, title or arbitrary message. Required token/byte counts are measurements, not billed Usage. No-op, soft-defer, cancellation, stale/late result, policy denial, helper failure and precommit interruption emit no completion. `context.compaction.started` and `context.compaction.failed` remain unregistered, independently visible through existing result/receipt state.

**Consumers and presentation.** Define consumer ID `assistant_chat.focused_thread_detail.compaction.v1`, binding version `1.0.0`, and projector ID `assistant_chat.focused_thread_projector.v1`, version `1.0.0`, as the compaction binding of the existing Assistant Chat focused-thread projector. On a validated live or replayed completion, the projector adds the stable `event:<event_id>` reference once to the existing bounded/windowed `thread_detail_projection.agent_activity_refs` view, preserves transcript/tool/artifact refs, and advances the existing applied/published cursors only under SIR-038 and SP-259. The view may resolve that content-free event and a still-authorized detailed receipt. Evicting an old reference from the hot detail window preserves the permanent EventRecord and its on-demand audit lookup; it does not accumulate indefinite history in one projection. Unfocused threads open from their render-page store (thread_head, hot tail and newest sealed page, SP-338) and never replay their events to open. The projector replays this event only to repair or rebuild the derived store, through the same binding; they do not need a second event consumer. Compaction completion never sends a chat message, invokes a tool, bills Usage, schedules a helper, or produces another event during replay. AgentChatHistorySearch continues to query retained transcript authority under ACD-062; its search capability is unchanged and is not an extra completion-event subscription.

**Deletion, compatibility and withdrawal.** Archive preserves identity and existing read rules. Logical deletion immediately suppresses the thread and its completion activity from ordinary Chat/search/detail even if an old projection survives. The permanent EventRecord is available only through already-authorized content-free audit access. A deleted or expired receipt resolves to a typed unavailable/tombstoned result; it never recreates a thread, head, content, artifact or search document. Existing legal holds and deletion deadlines remain unchanged. There is no accepted legacy event alias, extension, or synthesized backfill: historical command/local receipts are not automatically durable completion events. Version 1 readers reject unknown payload fields/versions. Any successor schema or withdrawal needs owner migration and a separately reviewed registry revision; malformed or unknown-family inputs follow Storage quarantine rules without checkpoint advance. An otherwise valid unsupported future-version record remains untouched; the consumer halts with `unsupported_schema_version` and preserves its last supported sequence until a compatible reader is available. Withdrawal stops new append first, retains existing indefinite audit bytes and identity records, fences dependent publication, and requires an owner-validated compatible read/replay path before resumption; it never turns old completion bytes into started/failed events.

ContractRef: ContractName:Plans/Contracts_V0.md#EventRecord, ContractName:Plans/Prompt_Pipeline.md#PP-078, ContractName:Plans/storage-plan.md#SP-259, ContractName:Plans/Shared_Integration_Runtime.md#SIR-038, SchemaID:pm.context_compaction_completed.schema.v1
### ACD-461 - Compaction Completion Event Authority

```yaml
plan_unit_id: ACD-461
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Successful committed Project compaction produces one content-free context.compaction.completed EventRecord
  under the explicit owner contract above. The focused-thread detail consumer uses the existing Project
  replay path; retained transcript search and thread-deletion behavior remain unchanged. The registry keeps
  this family project_only and DL-300 admits no application payload. Application compaction uses its owner
  operation/result receipts with explicit null Project, actual thread/Computer/writer and original
  operation/currentness/deletion fences, without emitting this EventRecord or advancing its Project
  event checkpoint. Missing receipt/source custody is unavailable. App event emission remains
  missing_event_registration/non-emitting until separate Event Authority admission and complete owner
  adoption. The original Project Event/codec and worktree-unbound Project form remain exact.
gui_related: true
gui_classification_reason: This unit binds the visible focused-thread completion history to durable authority.
depends_on: []
unblocks: []
acceptance_criteria:
  - "ACD-461 binds the exact producer, consumer, projector, project/thread identity, closed payload, commit-only transition and compatibility/withdrawal behavior."
  - "SP-259 and SIR-038 provide append durability, idempotency, concrete checkpoint key/version, replay fencing and indefinite content-free retention."
  - "Started, failed, cancelled, no-op, stale and deferred operations have no completion EventRecord; application operations remain non-emitting without separate family admission. Schema and semantic negatives reject invalid identity, gains, payloads and commit claims."
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
  - "Plans/Decision_Log.md#DL-039"
  - "Plans/Decision_Log.md#DL-040"
  - "projects-refresh-20261030/pass2/PLANS-EDIT-PLAN.md#lane-c"
  - "projects-refresh-20261030/pass2/NOPROJECT-PROPOSAL.md#approved-2026-11-03"
  - "Jared, 2026-11-03: Plan mode and scheduled tasks are also available in no project. It's only planning wizard/prd builder/orchestrator that isn't."
negative_constraints:
  - No runtime, buildability, independent-validator clearance, governance seal, WorkNodes, or NodeSeeds follows from this contract.
owner_hints:
  - Plans/storage-plan.md
  - Plans/Shared_Integration_Runtime.md
  - Plans/Prompt_Pipeline.md
```
