# Shard 044: EP-217 — remediation.resolved prepared Event Authority contract

Source: `Plans/Executor_Protocol.md`

Source lines: L11394-L11496

Source SHA256: `1b64cf3b92f0eb966ae83022b7d781f1e1dab199aeaf625f405deae4b93dad33`

---

## EP-217 — remediation.resolved prepared Event Authority contract

Newly authored owner contract under DL-045, after the per-family search in reports/event-authority-20261104/DX.md. This unit governs only `remediation.resolved@1.0.0`, prepared without admission. `executor.remediation_resolved.emitter.v1@1.0.0` is the exact Executor emitter for this transition: active remediation child -> fixed, superseded, abandoned or replan_required with exact original parent/root/child joins; ceiling_exceeded is blocked-state evidence, not a current resolution.

The producer validates current Project ownership, graph/replan generation, original input and referenced immutable runtime/snapshot identities, permission and worktree baseline before preparing immutable payload bytes. Every present run/thread/node/attempt join must equal its actual owner record and EventRecord envelope; never derive Project from focus. Pre-attempt blocks omit attempt_id. Requested/effective model/account/persona and package/seam/lane/worktree identity are resolved through the existing immutable runtime snapshot or execution_unit_context reference, with its full current owner equality checks, never reconstructed from today's settings. Conditional evidence (verification/reviewer, auth scope, timeout/wait, safe-point and remediation lineage) is required whenever the underlying outcome has that feature; absence cannot suppress a real outcome discriminator.

Sequence is owner admission -> immutable dependency/body commit -> validate/append -> first receipt -> terminal publication and dependent dispatch. This exact family explicitly adopts SP-286 and CV-339 including strict stored full-value v2 resolution, SP-336/SP-347 durability classes and flush fences. Lost acknowledgement resolves original full value and first receipt, never guesses success or fabricates a second effect. A barrier required before execution uses the barrier-class append. Missing original full-value custody fences retries. This event is evidence of the transition; replay cannot perform its associated worker, retry, recovery or notification action.

Event ordering follows canonical local sequence; node events remain sequential and cross-node events eventual. The later Executor Event Dedup Key Sequence Fallback governs over the old timestamp tuple. event_sequence is reserved once for the logical transition, persisted in the original owner input/transition before append, monotonic within an attempt or (when no attempt exists) this run/node or pre-lock Project decomposition stream. Retry reloads the same sequence and semantic bytes; it cannot obtain another sequence to bypass dedupe. See SP-507 for the exact family identity and historical compatibility.

Family-local source predicate contract: The exact root/child is active, the referenced child is terminal and resolution evidence is durable; fixed additionally requires child success. Other current resolutions keep their existing owner meaning. The unpersisted normalized source proof for this exact family is closed at Plans/executor_event_source_proofs.schema.json#/$defs/remediation_resolved. Source facts are observations resolved from the actual canonical owner records named above under the same admission/read fence; caller-supplied booleans or fixture data never establish runtime authority. Source bindings must match every payload identity/snapshot ref, independently of envelope equality; only fields actually present are compared, with conditional presence governed above. Fixtures exercise each exact field mismatch, each invalid source state and each envelope mismatch independently. No new physical state or canonical lifecycle enum is created by these normalized reader predicates.

### remediation.resolved source-read and transition closure (pass two)

Newly authored technical owner contract under DL-045 after the independent per-family pass-two search in `reports/event-authority-20261104/DX.md`: `executor.remediation_resolved.source_adapter.v1@1.0.0` is the exact unpersisted source adapter for `remediation.resolved@1.0.0`. It is invoked by `executor.remediation_resolved.emitter.v1@1.0.0` while holding the existing Project/run writer-admission fence. It is not a physical value family, lifecycle owner, new command, or permission grant. The machine companion is this family's own `semantic_adapter` object in `Plans/executor_event_contracts.json`; no sibling supplies a source role, join or transition.

Read these exact owner roles under one coherent admission/read boundary, using original immutable record refs and revisions rather than caller truth flags:

| Local source-read slot | Canonical owner and source selection |
|---|---|
| `project` | Project_System current Project identity and Storage root; never focus or a display label. |
| `operation` | Executor original reserved transition input: immutable semantic observation, event_sequence, predecessor revision and original dependency refs. The same input is reloaded after a crash. |
| `run` | Executor original run/GoalRun and installed WorkGraph generation; retain original run/thread joins and replan generation. |
| `node` | EP-105 materialized WorkNodeRecord: payload node_id equals actual worknode_id, with original source_request_id, workgraph_id and revision. A request or legacy project_plan_node alone cannot satisfy this read. |
| `lineage` | Executor original remediation root/parent/child/generation record and current ceiling, classification and resolution evidence. |
| `parent_attempt` | Executor original parent attempt, independently looked up by remediation_parent_attempt_id; never inferred from the child. |
| `child_attempt` | Executor original admitted child attempt, independently looked up by child_attempt_id; never the parent attempt. |
| `root` | Executor original remediation root record, independently looked up by remediation_root_id. |

The earlier source_facts/source_bindings fixtures remain shape-only regressions; this pass-two adapter supplies the source-read and transition contract. The normalized read captures in `Plans/executor_event_semantic_fixtures.json` are static oracle inputs only. Native adapters must resolve and validate the complete existing owner records/schemas and their hashes, permissions and deletion fences; the captured join view does not replace a complete runtime snapshot or execution_unit_context schema. Every slot must match its actual source owner, exact Project/storage root, expected revision, body digest and required parent refs. Missing/unavailable originals refuse publication and retries; an empty substitute is forbidden. Payload/envelope Project, run, thread and attempt joins are exact when present. Project partition is `project~` plus unpadded base64url of UTF-8 Project ID (Storage Case L-5).

Every payload field below has this independently bound source read. Dot paths name normalized observations of those owners, not new physical keys:

| Payload field | Required owner-read equality |
|---|---|
| `schema_version` | `operation.body.schema_version` |
| `ts` | `operation.body.observed_at_utc` |
| `project_id` | `project.body.project_id` |
| `event_sequence` | `operation.body.event_sequence` |
| `run_id` | `run.body.run_id` |
| `node_id` | `node.body.worknode_id` |
| `child_attempt_id` | `lineage.body.child_attempt_id` |
| `remediation_root_id` | `lineage.body.remediation_root_id` |
| `remediation_parent_attempt_id` | `lineage.body.remediation_parent_attempt_id` |
| `remediation_generation` | `lineage.body.remediation_generation` |
| `replan_generation` | `run.body.replan_generation` |
| `finding_refs` | `operation.body.finding_refs` |
| `resolution` | `operation.body.resolution` |

Derive the complete original observation from every independently hashed owner-read equality in this table, including schema_version and the immutable first observation timestamp. An absent optional owner fact forbids inventing that field; an existing fact requires its field even when both the submitted payload and its capture mirror omit it. The mirror must equal that source-derived observation and is never its own presence authority. The original reserved observation determines conditional **presence as well as value**: schema optionality never permits omitting a real verification/reviewer, auth realm/missing scope, timeout/wait, safe-point restore, remediation or requested/effective snapshot fact. Require exact original payload bytes/observation, including first ts and sequence. Resolve every present `_ref`, `_snapshot_id`, safe_point_id and every evidence-list item through its existing owner; require exact scope/root, retained body/hash, fresh viewer authorization and lawful-deletion status. Runtime snapshot/execution context joins compare actual run/thread/node/attempt plus lane_id, package_id, seam_id, worktree_id, requested/effective account, requested_account_binding, operational_identity, approval_scope_key and permission_snapshot_id where the existing owner carries them. Requested/effective model, Persona, provider, mode/strategy and all resolution refs come from the whole immutable runtime owner, never current Settings. No ref is retrieval authority.

The lifecycle table for `remediation.resolved` is exhaustive for this prepared version. States are normalized reads of the existing owner lifecycle, not a new canonical enum. Every row additionally requires the exact source revision/parents, reserved event_sequence and all listed owner predicates; any other predecessor, successor, stale generation or conditional discriminator rejects.

| Before | Payload discriminator | After |
|---|---|---|
| `active` | `{"resolution": "fixed"}` | `fixed` |
| `active` | `{"resolution": "superseded"}` | `superseded` |
| `active` | `{"resolution": "abandoned"}` | `abandoned` |
| `active` | `{"resolution": "replan_required"}` | `replan_required` |

Owner predicates, independently evaluated from the source records: `lineage.body.child_terminal=settled`; `lineage.body.evidence_commit=durable`.

Independently join original parent, child and root records; child differs from parent. The joined lineage.body.remediation_generation equals the normalized lineage.body.generation and is itself compared directly with lineage.body.ceiling; checking a different generation cannot establish this ceiling. fixed requires child done; superseded/abandoned/replan_required retain their actual owner terminal evidence. Ceiling exceeded remains blocked-state evidence, never a new resolution enum.

Ordering barrier for `remediation.resolved`: admission -> immutable dependency commit -> immutable body commit -> append -> original first receipt -> owner revision CAS/post-state -> publication/dependent effects. Adopt **SP-286/CV-339 full-value v2** and SP-336/SP-347 durability, with the existing pre-execution barrier where required. The post-state revision is the expected original revision plus one and retains the same reserved sequence; a losing CAS publishes nothing. Original terminal/dispatch effect accounting is `{"remediation_resolutions": 1, "worker_dispatches": 0}`. This is an oracle accounting view, not new stored state. Replay performs zero new effects, reuses original semantic bytes and returns the first receipt/result. Crash recovery may reconcile the original committed operation after writer cutoff but cannot admit a new operation. Native transaction/flush/interleaving proof remains NOT_RUN.

```yaml
plan_unit_id: EP-217
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: remediation.resolved@1.0.0 has the exact family-local prepared contract
  in this unit, without Event Authority admission.
gui_related: false
depends_on:
- DL-045
- SP-278
- SP-286
unblocks: []
acceptance_criteria:
- remediation.resolved uses its own closed payload, immutable identity, source-backed
  reader and publication/withdrawal fences.
validation_surfaces:
- Plans/executor_event_contract_fixtures.json
- scripts/pm_executor_event_contracts.py
risk_class: unadmitted_or_duplicate_executor_effect
reasoning_tier: high
context_scope: event_authority_wave2_DX
implementation_surfaces:
- Plans/Executor_Protocol.md
node_compile_hint:
  mode: contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-045
preserved_exact_tokens:
- remediation.resolved
negative_constraints:
- No admission, runtime proof, retention choice, WorkNode or governance seal.
```

ContractRef: ContractName:Plans/Executor_Protocol.md#EP-217, ContractName:Plans/Contracts_V0.md#CV-507, ContractName:Plans/storage-plan.md#SP-507
