# Shard 032: Goal body currentness and history

Source: `Plans/Goal_Runtime_System.md`

Source lines: L5861-L5947

Source SHA256: `d47d2c6751e64a671b5d4d6e5545b86dfd30f91ab7159eea2d13c79e4530cdca`

---

## Goal body currentness and history

GRS-064 owns accepted Goal body/revision/origin semantics, their local canonical codec and hash recipes, and the shared native body mutation/read interfaces. SP-287 owns the five physical families, versioned storage envelopes, transaction/backup/deletion mechanics and physical admission. DL-047 governs content lifetime. This is the shared body prerequisite for already specified Goal behavior under DL-045; each Goal event and staged producer still needs its own complete original input, action, SIR, event and receipt contract. It does not close all twenty-one Goal events or confer Workflow certification/exception semantics.

### Exact semantic records and hidden custody

`Plans/goal_body_custody.schema.json#/$defs/body` preserves the exact eleven-field `GoalRecordV2` (`pm.goal.record.v2`); `#/$defs/revision` preserves the exact nine-field `GoalRevisionRecord` (`pm.goal.revision.v2`); `#/$defs/origin` preserves the seven existing hidden `pm.goal.origin_lineage.v1` fields. No schema/retention/guard property is inserted into those semantic records. The separate SP-287 physical envelopes carry storage version metadata outside `record` and do not become visible or semantic Goal fields.

The Goal remains text, not a title, phase, plan, child tree, budget, attachment manifest or role cast. Its lifecycle stays exactly `active | paused | blocked | completed`. Cancellation associates the original cancellation receipt and removes the active projection; it is never a fifth state. Existing registered command boundaries and actual completion predicates remain unchanged.

`origin_kind` is exactly `user_request | agent_created_at_user_request | plan_build | internal_workflow`. Record the actual accepted origin and source-message/context refs; never infer them from objective text. `plan_build` requires its genuine `bound_plan_ref`; `internal_workflow` requires its genuine `owning_workflow_ref`; non-applicable refs are null. This minimal accepted replay lineage does not revive the older route/child/agent graph and does not freeze or retain referenced bodies under a new policy.

`#/$defs/control` is hidden `pm.goal.body_control.v1`: it joins actual Storage instance, Project/thread/Goal, current body key and semantic byte hash, current ordinary revision/currentness, latest accepted objective revision/hash/origin key, monotonic `control_epoch`, optional original `cancellation_receipt_ref` and one optional pending reservation. It authenticates physical joins and serializes access; the body still supplies currentness. It is not a Goal field, workflow queue or second lifecycle.

`#/$defs/receipt` is `pm.goal.body_mutation_receipt.v1`, the content-free original body-transaction result. It records operation/intent identity, original owner/authority refs, original prior/current revision and currentness, accepted objective revision/hash when written, and original commit time. It proves only a body commit. It is not an `AppendReceipt`, SIR `CommandOutcomeRecord`, `UICommandResponse`, cancellation/completion/certification receipt or generic command replay substitute. Those independently owned contracts remain required where the actual caller requires them.

### Exact Goal codec and semantic hashes

The local qualification `pm.goal.canonical_json.v1` uses the existing registry encoding `json_canonical` without adding or redefining a global encoding enum. Encode UTF-8 JSON with ASCII property names in ascending order, compact `,` and `:` separators and no insignificant whitespace. Arrays preserve order. Strings preserve exact Unicode scalar values and whitespace without normalization, trimming, case folding or translation. Escape quote and backslash; use the JSON short escapes `\b`, `\f`, `\n`, `\r`, `\t` for those control characters and lowercase four-hex-digit `\u00xx` for the remaining U+0000–U+001F controls. Other scalar characters remain literal UTF-8. Booleans/null are lowercase JSON literals. Integer values use exact canonical decimal spelling, with no leading zeroes, plus sign, fractional part, exponent or negative zero. Schema constraints still apply to each integer field. Integers are mathematically exact with no binary64 rounding or additional fixed-width ceiling.

Reject duplicate keys, extra fields, malformed UTF-8, surrogate code points, non-integer numbers and noncanonical serialized alternatives. Decoding includes exact canonical re-encoding equality; syntactically valid but differently escaped/ordered/spaced bytes are not this codec. All property names in these closed records are ASCII. This restricted codec is not general JCS, MessagePack or an alternate EventRecord digest.

Use lowercase SHA-256 for the following NEW Goal semantic hashes. Domain suffix `\n` below denotes one actual LF byte, not the two literal characters backslash and n:

| Value | Exact hash input |
|---|---|
| `currentness_hash` | UTF-8 `pm.goal.currentness.v1` plus LF, then canonical JSON of the other ten semantic body fields, excluding only `currentness_hash`. |
| `revision_hash` | UTF-8 `pm.goal.objective_revision.v1` plus LF, then canonical JSON of the other eight semantic revision fields, excluding only `revision_hash`. |
| Control `body_sha256` | Complete canonical JSON semantic body bytes, including `currentness_hash`, without a domain prefix. |
| Pending `intent_sha256` | UTF-8 `pm.goal.body_intent.v1` plus LF, then canonical JSON of every pending field except `intent_sha256`, including full afterimage, actual origin/authority and captured owner/stop/CAS facts. |
| Start `intent_sha256` | UTF-8 `pm.goal.body_start.v1` plus LF, then canonical JSON of exactly `{body, revision, origin}` containing the original accepted semantic records. |

These recipes target semantic `record` bytes, never the enclosing physical storage wrapper. Physical wrapper bytes/schema/version/origin are separately verified by SP-287. Pending intent is immutable for one reservation; recovery cannot refresh its captured fields under the same digest. Existing EventRecord/producer/receipt digest recipes remain unchanged. Pre-existing currentness/revision strings need explicit codec migration/adoption; readers do not reinterpret them as the new hashes.

The objective writer limit is exactly 4,000 Unicode scalar values, implementing the existing approximately 4,000-character convention. Preserve every accepted scalar and whitespace; overflow uses existing `objective_too_long`, never truncation. Surrogates reject. An oversized source record quarantines for owner review during migration. The existing field type remains string; this contract adds no nonempty-text requirement.

### One shared native mutation owner

`owner.goal.body.mutation@1.0.0` is the only native body mutation interface. Start, direct/approved objective update, metadata/lifecycle change, `active_run_ref`, cancellation custody, receipt association and any later GoalRun completion integration use the same exact Goal key, native Goal Runtime owner predicates and Storage transaction/lock. No public arbitrary write-JSON interface exists. A per-run expected revision, caller guard or process-local mutex cannot substitute for the shared body/control CAS. Every existing writer path must be explicitly adopted or remain disabled before activation.

Start authenticates existing explicit creation authority, exact original text/source origin, actual Project/thread ownership and visibility, current owner/registration/install/backup posture and ordinary writer authority. It atomically inserts semantic body revision 1, accepted objective revision 1, actual origin revision 1, hidden control and original narrow body receipt with absent-key CAS. Existing global Goal identity rules remain with the Goal owner; a foreign existing key is never overwritten. Start's narrow body commit does not alone establish success for a command requiring its separate creation receipt or event.

Update authenticates the current canonical body/control and complete accepted-history head/origin; exact expected ordinary revision/currentness; actual owner/permission/stop/deletion facts; no cancellation; and no conflicting reservation. Per-operation lifecycle or caller evidence predicates remain mandatory. The writer cannot change `goal_id`, `project_id`, `thread_id` or `created_at`; `updated_at` cannot precede creation or the prior update.

A direct Goal Activity Detail Save is the original accepted change, has `change_source = user_direct`, `source_message_id = null`, `approval_id = null`, and requires no second dialog. It is permitted in active, paused or blocked; completed rejects. An active Goal uses accepted replacement text only at its next continuation boundary, without mutating a turn already in flight. Initial creation may preserve its actual originating message and does not use the direct-edit null rule to erase genuine creation lineage.

An agent proposal requires the existing explicit user instruction to change the Goal and stays read-only until the approval host resolves a still-valid approval bound to this exact Goal, prior revision/currentness and exact proposed text. Request, denial, expiry or stale approval is not acceptance. Approved acceptance carries `agent_proposed_user_approved`, genuine nonnull `approval_id` and actual source-message evidence. Memory, compaction, model/Persona/provider changes, summaries and BSD advice have no body-writing authority.

### Accepted history and ordinary revision gaps

Every body mutation increments the single ordinary revision `n -> n+1`. An accepted objective write adds exactly one immutable objective revision at `n+1` and its exact corresponding admitted origin. Revision text equals the new body text; `change_source`, source-message/approval IDs and original accepted lineage come from actual source/Goal-owner evidence. A missing accepted lineage fences the write. Neither serializer nor body writer fabricates refs or copies old origin as a generic replacement template.

`prior_revision_hash` points to the latest accepted objective revision, even when metadata changes created ordinary revision gaps. Metadata-only updates preserve objective text, latest accepted objective revision/hash and all existing history/origin bytes, writing no fake objective revision or third change source. For example, ordinary body revision 4 can have latest accepted objective revision 2; the next accepted objective write is revision 5 pointing to revision 2's hash. Reading history never fills 3 or 4 with invented objective changes.

Initial accepted history is revision 1 with null predecessor. Later accepted members form a complete ordered chain with strictly increasing ordinary revisions, nondecreasing acceptance times and no duplicate/missing accepted member. Control identifies the current accepted head; current body objective equals that head's exact text. Each origin is bound to its actual accepted revision; no extra or foreign origin is adopted. Prior accepted records remain byte-identical.

### Durable reservation and final commit

For a separately staged producer, the same control carries one closed `#/$defs/pending`: `operation_id`, `owner_ref`, `owner_epoch`, `operation_kind`, `expected_revision`, `expected_currentness_hash`, `expected_stop_epoch`, `intent_sha256`, `after_record`, `accepted_revision`, `origin`, `original_change_authority_ref`, `external_authority_ref`. `operation_kind` is exactly `objective_update | metadata_update`. Objective update has both accepted revision and origin plus the actual original change-authority ref; metadata has neither and null change-authority ref. The producer's genuine external authority ref is separate; a direct atomic body write uses null. Proposed text/afterimage in a pending row is not current body or accepted history.

The separately staged producer must independently retain its complete original input/result/event authority before relying on this reservation. A reference's spelling does not prove that authority. Validate all before/after/approval/scope/identity predicates at admission. Reserve under native maintenance/shared Goal CAS, incrementing `control_epoch` while preserving the current body/history. A second owner/operation cannot overwrite it. Same operation plus identical intent resolves the same reservation or original receipt; changed intent conflicts.

Terminal commit captures the entire actual reserved control preimage, including nonnull pending and its `control_epoch`, then compares that whole preimage immediately before writing. It does not compare the older empty control or only `operation_id`. Recheck the complete original Goal-owner accepted-change/lineage predicate, still-valid approval where required, independently resolved external producer predicate, cancellation, owner/stop epochs, shared body/control CAS and all current Storage/access/deletion facts at the final write boundary. Atomically commit after-record, optional accepted revision/origin, updated control with reservation cleared and the original narrow body receipt.

Before reserve, a crash has no effect. After reserve, complete pending identity/afterimage and original accepted lineage survive. After commit, replay returns the original body receipt without reapplying. Unknown external effects stay pending/fenced until the exact producer resolves them; timeout or missing acknowledgement is not rollback authority. No partial body/history/control/receipt publication is allowed.

On restart, the original Goal owner may explicitly resolve captured original acceptance facts from genuinely admitted pending canonical control: exact original change-authority ref, revision/source metadata, origin, frozen afterimage and original CAS. This uses that pending row's authenticated native admission, not a recreated UI message or a new grant inferred from text. It does not itself accept history, emit an event or commit. Current approval, Goal state, owner/cancellation/stop, external effects, current access/Storage facts and whole pending preimage must still pass. Missing/foreign/unadmitted pending custody cannot use this recovery route. Late revocation/disappearance during an in-flight commit rejects; the writer does not silently invoke recovery inside that commit to replace lost authority.

### Stop, cancellation and external result boundaries

Manual Stop/Pause/Cancel retains priority. The genuine host stop epoch is independently durable and invalidates continuation dispatch immediately even while a reservation exists; body reservation cannot suppress Stop. A stale captured stop epoch is never refreshed into success. Resolving evidence association cannot itself resume or complete the Goal. A continuation/completion effect rechecks the latest stop epoch and its owning caller's completion evidence.

Pure body CAS requires neither a pre-existing first `AppendReceipt` nor SIR result: its narrow body receipt is part of the same atomic transaction. A producer whose own protocol requires an external receipt must independently prove it before terminal body commit. This shared reservation does not resolve that producer's unknown-effect protocol, return a UI success on its behalf or certify completion.

A reservation may clear through its owner only after proving no irreversible dependent effect needs reconciliation. Clearing is not event or receipt rollback. After authentic confirmed no-effect rollback, the producer's durable resolution terminates that original operation; retries resolve the original disposition and cannot reuse its identity for a fresh mutation. A new authorized operation after coherent restore/resolution has a new identity and revalidates current authority. Missing body receipt, empty slot or timestamp alone never proves rollback.

Cancellation uses the original Goal cancellation receipt under the shared fence and records its reference in control. The body keeps its four-state schema, accepted history remains readable while the thread is retained, and future continuation is prohibited. Cancellation is not thread deletion and creates no synthetic paused/cancelled state or fabricated cancellation receipt.

### Current body/history and independent receipt readers

The exact readers are `reader.goal.body@1.0.0`, `reader.goal.objective_history@1.0.0` and `reader.goal.body_mutation_receipt@1.0.0`. These are canonical native readers, not EventRecord projectors or checkpoints. They use SP-287 actual selected Storage/family/version/migration/backup origin and coherent physical snapshots, then validate these semantic record/hash/chain joins. Current body/history additionally require current Project/thread permissions and deletion/hold/owner/stop fences. At one final held disclosure/commit boundary, recheck semantic source currentness/bytes, selected physical row origin/bytes and every covered owner fact, or prove a native lease spanning all of them still valid. Separate earlier checks and a generic snapshot token are insufficient. The same joint final native boundary also covers physical synchronization/admission, backup capture/restore, tombstone filtering and physical purge under their actual owner predicates. Receipt-only audit covers its own current audit and receipt-custody facts without requiring ordinary body visibility.

Current read returns the old committed body while pending, with a separate pending/unavailable mutation disposition; it never publishes the afterimage as current. An ordinary viewer posture may permit reads, but a changed posture invalidates a captured lease and mutation always needs current writer admission. Later accepted-history reads do not reacquire original commands, old admission snapshots, source generations or original approval, and do not rerun an action. Current authorization to disclose differs from original acceptance. Native selected-store/origin authentication cannot be replaced by guessed/repaired matching hashes.

The independent receipt reader accepts exactly `#/$defs/receipt_read_request`: its reader binding plus Storage instance, Project, Goal, operation and intent identity. It resolves the admitted immutable canonical receipt at its exact physical key, validates original schema/codec/hash/origin and current app/Project/audit permission. It does not require a present body or ordinary thread visibility; thread deletion never waives those audit permissions. Before disclosure, recheck receipt identity/bytes and current receipt registration/install/migration/backup/access facts or their covering lease. A later body commit cannot re-seal a changed old receipt. After lawful body purge the receipt returns original body-commit facts only, no current availability claim or objective/history bytes, and creates no body hold.

Event traversal remains separately gated by that exact family's adopted SP-278 full source/currentness/checkpoint binding. These readers neither borrow another Goal/GoalRun checkpoint nor imply event traversal coverage. Workflow `accepted` never aliases `certified_with_approved_exception`; body transaction evidence supplies no certification exception.
