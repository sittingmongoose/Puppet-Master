# Shard 003: INV-001 -- Tool correlation integrity (normalized streams + persisted events)

Source: `Plans/Architecture_Invariants.md`

Source lines: L25-L77

Source SHA256: `6f883fb60e510b7c00faba9208e8a0702690c2df24d96a4294dc6f33d861634b`

---

## INV-001 -- Tool correlation integrity (normalized streams + persisted events)


  ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Executor_Protocol.md, Primitive:RuntimeIdentity
  - attempt_id
  - it still leaves no normalized path for account-switch, pressure/confidence, or actor-class disclosure
  - Add a versioned correlation block to bridged-provider normalized events and require actor/thread/attempt/lineage refs there.
  - likely owners for canonical correlation blocks, switch/pressure episodes, and blocked/approval identity linkage
  - any run-start/runtime snapshot events that already carry requested/effective auth-account fields
  - canonical `thread_id` remains PM correlation
  - thread_id
  - Add a versioned stream/provider correlation block for actor/attempt/account/trust metadata.
  - they are useful correlation fields
  - No durable approver identity is defined on approval/rejection events yet.
  - `tier_id` can still survive as a human-readable grouping label, but it should stop acting like the canonical execution correlation key.
  - tier_id
  - align project-artifact events to EventRecord-level identity,
  - requested/effective provider/model/auth/account disclosure fields by ref or normalized snapshot
  - args should carry a normalized subject/route target
  - `correlation_id` still lacks an explicit trace-through requirement into persisted dispatch/domain events.
  - correlation_id
  - The subject-first behavior is present in practice, but still looks like a set of special-case prose pockets instead of one normalized identity rule.
  - new producers/docs should emit the canonical normalized target model
  - Add explicit migration notes when replacing raw local IDs with normalized `subject_id` or `object_kind/object_id` forms.
  - subject_id
  - object_kind/object_id
  - otherwise it should reuse persisted shell state and local destination defaults
  - MUST NOT reuse persisted state when doing so would:
  ContractRef: ContractName:Plans/Contracts_V0.md, Primitive:RouteTarget, Primitive:OpenSubject
  - `usage_event_ref` still appears as a special-case route concept in some docs instead of being normalized into `object_kind = usage_event`.
  - usage_event_ref
  - object_kind = usage_event
  - `usage_event_ref` still reads like a direct route field in some docs rather than a normalized object identity.
  - but they still carry `resume_url?`, which keeps navigation transport inside persisted state as if it were canonical identity
  - resume_url?
  - tier-start validation/persona/QA events
  - tier-keyed usage/evidence correlation
  - 1. owner-doc integrity and routing
  - `tier_id` worker-output correlation
  - Reconciliation should treat this as an owner-doc integrity stack, not three isolated docs:
  - `Run_Graph_View.md` and `usage-feature.md` still reinforce each other through `tier_id`, which keeps the old usage/evidence/runtime correlation alive.
  - Run_Graph_View.md
  - usage-feature.md
  - Route-aware schema/gate/evidence extensions remain incomplete relative to the ledger's normalized routing model.
**Rule:** Tool invocation correlation MUST be consistent:
- In normalized provider streams, every `tool_use` MUST have exactly one matching `tool_result` with the same `tool_use_id` (no orphan tool events).  
  ContractRef: ContractName:Plans/CLI_Bridged_Providers.md
- In persisted event streams, tool activity MUST be represented using the canonical tool event types (`tool.invoked`, `tool.denied`) and MUST include stable `run_id` + `thread_id` correlation.  
  ContractRef: ContractName:Contracts_V0.md

---

<a id="INV-002"></a>
