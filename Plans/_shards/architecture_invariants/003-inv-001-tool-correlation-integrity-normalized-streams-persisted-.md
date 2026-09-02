# Shard 003: INV-001 -- Tool correlation integrity (normalized streams + persisted events)

Source: `Plans/Architecture_Invariants.md`

Source lines: L25-L44

Source SHA256: `6ce7f74c2d708b8bdc9358c3f7e41354630e681db5985087d30bd42654a39c7b`

---

## INV-001 -- Tool correlation integrity (normalized streams + persisted events)


  ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Executor_Protocol.md, Primitive:RuntimeIdentity
  - `correlation_id` is not a local display hint. Provider/runtime dispatch, persisted EventRecord/domain events, artifacts, receipts, and route/open payloads MUST carry or reference the same correlation lineage with `run_id`, `thread_id`, and `attempt_id` where the owner contract makes those identities available.
  - Account-switch, pressure/confidence, actor-class, blocked/approval identity, requested/effective provider/model/auth/account, and trust metadata MUST be represented by owner-defined fields or normalized snapshots, not by anonymous prose aliases or by reusing `tier_id` as an execution identity.
  - `tier_id` may remain a human-readable grouping label for compatibility, but canonical execution correlation is owned by runtime identity fields and EventRecord payload contracts.
  - Route and open args MUST carry a normalized subject or route target. New producers/docs emit `subject_id` or `object_kind`/`object_id` forms and include explicit migration notes when replacing raw local ids.
  ContractRef: ContractName:Plans/Contracts_V0.md, Primitive:RouteTarget, Primitive:OpenSubject
  - `usage_event_ref` is canonical usage/accounting identity and the event-primary routing bridge. Event-primary callers normalize it to `object_kind = usage_event` plus `object_id`; a PMConcept7 Ledger attempt row instead selects `object_kind = usage_attempt` plus `object_id = attempt_id` and retains `usage_event_ref` only as correlation. Neither branch may reintroduce a top-level route special case or bypass typed object-route identity.
  - `resume_url?` and similar transport hints are not canonical persisted identity; persisted shell state and local destination defaults may be reused only when they do not violate current owner-doc integrity, routing, usage/evidence correlation, or runtime identity constraints.
**Rule:** Tool invocation correlation MUST be consistent:
- In normalized provider streams, every `tool_use` MUST have exactly one matching `tool_result` with the same `tool_use_id` (no orphan tool events).  
  ContractRef: ContractName:Plans/CLI_Bridged_Providers.md
- In persisted event streams, tool activity MUST be represented using the canonical tool event types (`tool.invoked`, `tool.denied`) and MUST include stable `run_id` + `thread_id` correlation.  
  ContractRef: ContractName:Contracts_V0.md

---

<a id="INV-002"></a>
