# final.md — D-M12-A/control/normal_research_final-v3

Module recommendation for the offline retry/acknowledgment and local-retention module of a field-survey tool that queues photo metadata and short observations on phones and syncs when connectivity returns. Scope is this module only; not a whole-survey application. Conditions: brief-only open discovery, sources selected during work and frozen byte-exact under `sources/` (URLs, versions, capture times, SHA-256 in `sources/index.json`, verified by `sources/checksums.txt`); captures at 2026-10-07, identities listed at the end. Labels: [E] executed check, [P] proposed test, [I] inference applied to the tool, which the brief does not name or make inspectable.

## Bottom line

Retry-until-acknowledged is necessary but not sufficient. Keep the queue, but bind three mechanisms to it: a client-generated idempotency key per item, an explicit durable-acknowledgment contract, and bounded retention with surfaced failure. All three are small, local changes to this module.

## Findings (8)

**F1 — "Acknowledged" has at least three meanings; the wrong one loses data.** [E on sources; I on tool] MQTT 5.0 acknowledgments (PUBACK/PUBREC/PUBREL/PUBCOMP, §4.3) confirm only hop-by-hop arrival, and DTN separates them explicitly: with custody transfer "the responsibility for reliable delivery of the bundle … may move among one or more 'custodians'" (RFC 4838 §3.10/4.2). Transport ack ≠ durable commit ≠ final delivery — a distinction the DTN analogy family (beyond direct survey competitors) makes explicit. If the sandbox server acknowledges on receipt and crashes before persisting, a client that deletes on ack silently loses observations. The ack point must be defined as durable commit.

**F2 — Duplicates are a normal outcome of retry-until-ack, not an edge case.** [E] Standard queues "ensure at-least-once message delivery, but … more than one copy of a message might be delivered, and messages may occasionally arrive out of order" (AWS SQS Developer Guide, Standard queues); RabbitMQ redelivers requeued messages that were never positively acknowledged (RabbitMQ docs, Confirms). When an ack is lost or delayed, the sender cannot distinguish "delivery failed" from "ack failed," so retrying until acknowledged *guarantees* duplicates. The brief assumption is therefore amended, not accepted: retry-until-ack alone is insufficient. (Assumption challenge, obligation 4.)

**F3 — Deduplication is a solved pattern: idempotency key plus idempotent consumer.** [E] A crashed publisher "will publish the message again … a message consumer must be idempotent, perhaps by tracking the IDs of the messages that it has already processed" (microservices.io, Transactional Outbox); HTTP formalizes the same property: "the … effect for … multiple identical requests … is the same as the effect for a single such request" (RFC 9110 §9.2.2). Client-generated UUID per queued item, deduped server-side, is the direct analogue.

**F4 — Negative discovery: mature protocols *bound* re-sending instead of hot-looping.** [E] MQTT 5.0 forbids re-sending a PUBLISH once its PUBREL is sent ([MQTT-4.3.3-6]) and requires re-sent packets to preserve original order (§4.4). Unbounded per-item retry loops inside a session are not what acked protocols do; retry should be reconnect-driven with a bounded in-flight window.

**F5 — Interrupted sync: per-item queues checkpoint naturally, but items must be atomic.** [E on source; I on tool] CouchDB replication keeps a Replication Log with Checkpoints so resumed replication "finds common ancestry" instead of resending everything (CouchDB 3.5 Replication Protocol, §2.4). A per-item queue with per-item ack is already checkpointed at item granularity; the real interruption risk is a non-atomic item — photo blob plus metadata sent separately can half-complete. Items should complete as a unit or resume at part granularity.

**F6 — Retention must be bounded and failures visible — the mail-queue analogy.** [E] SMTP senders (second analogy family) retry transient failures retry transient failures at intervals of at least 30 minutes and give up after "at least 4-5 days," returning the mail (RFC 5321 §4.5.4.1); MQTT 5.0 likewise carries a Message-expiry property (§4.3.3 context). Retry forever and storage grows with stale items; discard silently and data is lost invisibly. Queue items need a max age/attempt count and a visible failed state.

**F7 — Delayed and reordered arrivals force capture-time semantics and merge honesty.** [E] SQS states out-of-order arrival plainly (F2), and CouchDB's replication "Replication and conflict model" retains conflicting siblings rather than overwriting silently (§2.3). Server-side timestamps are unreliable under delayed sync; use client capture timestamps and a defined conflict behavior (defined last-writer-wins per field, or retain conflicts like CouchDB).

**F8 — Negative/uncertainty: end-to-end exactly-once is not a transport property here.** [E/I] The broker docs treat duplicates as routine (F2), so exactly-once exists only where the consumer dedups (F3). Unresolved: where the current sandbox actually acknowledges (receipt vs durable commit) is unknowable from the brief, and the conflict policy for edited observations is a product decision neither source settles. These gate the retention policy choice.

## Bounded proposed changes (module only)

1. Add a client-generated idempotency key (UUID) to every queued item; server keeps a seen-key store (F3).
2. Define the ack contract: server acknowledges only after durable commit; client deletes only on that ack; item states queued → in-flight → acked (F1, F5).
3. Cap retention by age and attempts; overflow moves items to a visible "failed" state with user notice — the bounce analogue (F6).
4. Reconnect-driven retry with ordered, bounded in-flight sends; atomic or part-resumable items (F4, F5).

## Discriminating validation (proposed, not executed here)

- T1 [P] Inject ack loss; assert server-side exactly one record per key survives (tests F2/F3).
- T2 [P] Crash the server between receive and commit; assert the client still holds the item and re-sends (detects ack-before-durability, F1).
- T3 [P] Age an item past the cap; assert it surfaces as failed, never silently discarded (F6).
- T4 [P] Kill sync mid-batch and resume; assert only unacked items are sent (F5).

## Dispositions

Accepted: F2, F3, F5, F6, F7 mechanisms. Amended: the brief assumption "retrying each queued item until acknowledged is sufficient" (F1–F4). Rejected: adopting a full sync engine or CRDT stack now (outside this module); unbounded in-session retry loops (F4). Unresolved: sandbox ack-point location, observation-edit conflict policy (F8).

## Uncertainty

The tool's internals are not inspectable from the brief; findings F1/F5/F7 map mechanisms onto an unnamed implementation by inference [I]. Sources are protocol and infrastructure documents, not survey-tool code; behavior claims are theirs, risk mappings are mine. Discovery was bounded by time and reachability (failed routes recorded in `sources/index.json`, e.g., Kafka's site renders content only in JS); this is not exhaustive.

## Sources (frozen, hashed in sources/checksums.txt)

MQTT Version 5.0 — OASIS Standard, 07 March 2019; AWS SQS Developer Guide, Standard queues (current at capture 2026-10-07); RabbitMQ documentation, Confirms (current at capture); microservices.io, Transactional Outbox pattern (current at capture); Apache CouchDB 3.5 documentation, Replication Protocol; RFC 9110 (June 2022, STD 97); RFC 5321 (October 2008); RFC 4838 (April 2007).
