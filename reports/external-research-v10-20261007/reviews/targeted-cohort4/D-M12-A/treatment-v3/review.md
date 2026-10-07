# Independent review of the frozen D-M12-A final

**Overall: FAIL — FULL_SCOPE_FAIL.** The exact final SHA-256 `f7068c5cf13266b787121bcb9f65fa97b2c270ca0f03f7acbc809815b899b1f1` matched before assessment. The review covers all 50 consequential claim checks and all six mapped primary sources, rather than stopping at one defect. Candidate bytes and existing grades were not modified.

A useful bounded mechanism survey that attempts all six obligations, but its sufficient/effectively-once recommendation omits essential persistence and deduplication conditions, misbinds outbox atomicity, overstates ordering/merge behavior, and incorrectly rejects all end-to-end exactly-once protocols as impossible.

The original brief has no selected sources. The source map and candidate index were treated as claims: all six source hashes, byte counts and the index hash matched, and the substantive mechanisms and limits were checked in the actual source bodies. Two bounded additional primary checks are retained with acquisition records.

## Assessment extent and limits

Every consequential assertion, recommendation, condition, alternative, lead and proposed-check statement in all 100 lines of this frozen final was evaluated against original brief and relevant primary passages, including surrounding governing conditions. All six mapped byte bodies were verified and inspected; index identity claims were checked against source content. Full scope here means the declared bounded diagnostic science, not unrelated MQTT chapters or unspecified future technologies.

There is no unassessed remainder in the declared science claim set. Historical failed fetches and original acquisition/grep execution are assessed as **unverifiable from retained evidence**, not accepted as independent proof. No application, downloaded source code, crash, load, battery, overflow or property tests were executed. The review is not exhaustive public discovery or a cover-to-cover audit of unrelated protocol chapters. M14 semantic/projection/preservation-view comparison is inapplicable: this is an M12 brief and no such views are mapped.

The frozen final contains eight numbered findings and 1086 whitespace-delimited words. The arm/method are visible in the paths, title and source-index content; the review is not fully arm-blind. No prior findings, reviews, predecessor artifacts, other cases/arms, campaign helpers or cost/winner information were read. The neutral repository Plans index and PDF tooling skill were read for startup/tool instructions only.

## Six axes

| Axis | Disposition | Assessment |
|---|---|---|
| 1. All required obligations | PARTIAL | All six are substantively attempted; mechanism diversity, assumption challenge, bounded eight findings and useful uncertainty are present. Initial durable capture and delayed replay safety remain incomplete. |
| 2. Consequential claims and full source conditions | FAIL | All consequential claims were checked. Replay guarantees omit governing conditions; impossible is overbroad; outbox and deterministic merge claims lose their mechanism boundaries. |
| 3. Bounded useful discovery, negative and optional yield | PASS | Six actual mechanism families and relevant analogies, useful non-expiry risk, mutation uncertainty, and bounded leads. No exhaustive claim. This axis credits discovery without validating the incorrect F3 rejection. |
| 4. Wrong rejection, correction or unjustified abstention | FAIL | End-to-end protocols are categorically rejected on an unjustified impossibility ground. Ack-evidence-plus-delete is promoted from possible bookkeeping to a necessary safety correction. F7/F8 uncertainty is justified rather than excessive abstention. |
| 5. Preservation, traceability, uncertainties and options | PARTIAL | Frozen source/record identities, the brief, F1-F8 ordering, options and uncertainty survive. Source references are traceable through index, but key lifetime/payload bindings, rollback conditions, order guarantees and winner-versus-merge semantics are lost. A minor payload-size drift is recorded separately. |
| 6. Proposed versus executed checks | PARTIAL | Runtime checks are honestly labeled proposed. Key naming is insufficient validation and the crash/property oracles need effect and projection definitions. Historical failed fetches and actual capture-command execution are only self-reported; the reviewer verified current bytes independently. |

## Obligation coverage

| Required obligation | Disposition | Evidence in final and remaining limit |
|---|---|---|
| 1. Address offline persistence and interrupted sync. | PARTIAL | F4, F5, F7: Local ack/delete persistence is covered, but initial enqueue, restart survival and storage durability conditions are omitted. |
| 2. Address acknowledgment/retry meaning under duplicate or delayed messages. | PARTIAL | F1, F2, F7: Duplicate/lost/delayed message risks are covered, but effect/dedup atomicity, replay horizon and stale acknowledgment/payload bindings are unspecified. |
| 3. Investigate distinct mechanism families and at least one relevant analogy beyond direct survey competitors. | PASS | F1, F2, F4, F5, F7: Primary text supports six families and relevant IoT/payments/cloud/database analogies. No direct survey competitor is required by the brief. |
| 4. Challenge a brief assumption when supported. | PASS | F2, F3, F4: The processed/ack-lost and durability counterexamples legitimately challenge the thin assumption; the overbroad F3 rejection is separately defective. |
| 5. Return at most eight distinct material findings, including useful negative discoveries or uncertainty. | PASS | F1, F2, F3, F4, F5, F6, F7, F8: Eight findings, useful F6 negative and F7/F8 uncertainty; overlap does not create a hidden ninth material finding. |
| 6. Give bounded proposed changes and discriminating validation, without claiming exhaustive discovery. | PASS_WITH_LIMITS | F1, F2, F3, F4, F5, F6, F7, F8: Within the requested module, every finding gives a proposed check and the discovery bound is explicit. Scientific deficiencies and incomplete oracles are separately recorded. |

## Material defects

### D01: Unconditional rejection of end-to-end exactly-once protocols

**material.** Candidate locator: final.md lines 39-42 and 94-96. Primary evidence: E01, E15.

F3 moves from retries alone and single-hop MQTT to an unconditioned no-retry-scheme/impossible claim; the alternatives section explicitly rejects end-to-end exactly-once protocols on that ground. Neither the mapped MQTT text nor an unstated two-generals failure model proves this universal rejection.

It removes a legitimate stateful/transactional mechanism family from consideration for the wrong reason. The primary RIFL paper demonstrates exactly-once RPC semantics with explicit durability, identity, client-state and retention conditions.

Do not reject the correct narrow heading or require RIFL adoption. Exactly-once effects do not imply exactly-once packets, unconditional liveness, or certainty after arbitrary client-state loss; unsuitable complexity/lease assumptions could justify a bounded practical rejection, but the candidate did not give that reason.

### D02: The replay-safe/effectively-once promise omits governing identity and deduplication conditions

**material.** Candidate locator: final.md lines 15-21, 31-37, 68-70 and 96-97. Primary evidence: E02, E03, E08, E14, E15.

Stable UUID plus server dedup is a valid direction, but the promised net effect never binds the operation to its payload/revision and successful durable receipt, never states atomic durable coupling of dedup state to the stored effect, and never sets a replay/retention horizon or fences stale retries. Tombstone-based dedup windows are relegated to optional leads. The mapped Stripe body, beyond the checked header, already supplies key expiry, parameter mismatch, cached-error, concurrent-request and method conditions.

After a processed request and lost acknowledgment, a phone can stay offline longer than a dedup cache retains the key and create a duplicate on replay. If the same record ID is reused for a revised payload, a delayed acknowledgment or key hit can retire a change never stored. Separately committed effect and dedup state can duplicate an effect or suppress a missing one after a server crash.

These are conditional counterexamples, not claims about a nonexistent implementation. A durable unique record key plus immutable payload may satisfy the condition without a separate dedup table. Stripe 24 hours is not a required custom-server setting; it is the captured analogy limitation that must not disappear. No full authentication subsystem or global app redesign is demanded.

### D03: Offline capture durability is left outside the allegedly sufficient additions

**material.** Candidate locator: final.md lines 14-21, 44-50 and obligation mapping at line 81. Primary evidence: E05, E11, E12, E13.

The sole concrete local transaction requirement concerns acknowledgment/deletion, after a send. There is no durable enqueue/ID/payload-before-local-acceptance or before-transmission condition, no restart invariant for pending records, and no stated storage/journal/flush assumptions. The mapped outbox source puts the original durable intent at enqueue; MQTT directly supplies a nonvolatile-before-send example. SQLite does not make an uncommitted enqueue survive by merely calling a later delete transactional.

A field observation marked queued in memory can vanish on phone crash before sync even when every later server ack, dedup check, and local delete is correct. This is within the explicitly required offline persistence module and is not caught by tests only at ack-to-delete steps.

If the sandbox queue already supplies these guarantees, the recommendation can rely on them as explicit preconditions rather than require replacing its database. No SQLite adoption or exact pragma is prescribed. The defect is the missing governing contract/validation, not an assertion that a running phone currently loses records.

### D04: Outbox atomicity is moved to the wrong boundary and the crash oracle conflates sends with effects

**material.** Candidate locator: final.md lines 44-50; recommendation at lines 15-16. Primary evidence: E12, E13.

The outbox source atomically stores state change plus outgoing intent, while the relay remains separate and expressly can replay. F4 treats state/relay decision as a single local transaction and declares delete-on-ack unsafe unless ack evidence commits with it. Such a transaction is a possible bookkeeping choice, but it neither spans receipt of the remote ack nor makes replay impossible. The no duplicate oracle is undefined despite the finding describing duplicate sends.

Kill the phone after receiving an ack but before beginning or committing the local ack/delete transaction: the pending row remains and can be resent. Adding an ack-evidence table does not remove that window. Conversely a single durable queue-row deletion plus an idempotent server may be safe without separate ack evidence. As stated the proposed test can reject a safe at-least-once design or pass without checking the server effect.

Read no duplicate charitably as no duplicate stored observation and the core crash test becomes useful. The review does not reject transactional bookkeeping; it identifies the unsupported mandatory condition, incorrect source binding, and need to distinguish allowed repeat sends from forbidden repeat effects.

### D05: Ordering and replication options lose source conditions and semantic distinctions

**material.** Candidate locator: final.md lines 65-70 and 94-96. Primary evidence: E06, E09, E10, E13.

A reconnect is presented as inherently arbitrary-order, although the mapped MQTT and outbox sources contain explicit ordering contracts/options. PouchDB deterministic winner is then summarized as deterministic merge in the alternatives; choosing a convergent arbitrary branch is not semantically merging edits. Immutability alone is also insufficient for arbitrary-order equivalence without an order-independent set/projection condition.

The reader could unnecessarily require revision machinery for a transport that already serializes a given stream, or adopt a sync engine thinking concurrent field edits merge automatically. A property test comparing every server state for every delivery order can reject an intentionally ordered projection or miss a losing branch if it reads only the default winner.

Reordering and conflicting mutable records are valid risks to investigate, and leaving the brief unresolved is correct. The missing qualification is may reorder depending on the transport/concurrency, with explicit conflict enumeration/resolution and logical projection semantics. No entire synchronization engine is required.

## Findings retained as useful

The durable application-ack direction, stable operation IDs, retry amplification/backoff/jitter, visible unsent-record retention, and mutability uncertainty are useful. The narrow proposition that bare retries alone do not establish exactly-once effects is correct. F6 gives a useful negative discovery independently of F3; F7 and F8 explicitly avoid an exhaustive answer claim. The review does not prescribe adopting any of the cited systems.

F7 remains an unresolved product assumption. F8 remains a bounded acquisition gap, with failed-fetch history self-reported. Broker expiry and resumable checkpoints remain unpursued leads. A tombstone implementation can remain optional, while an explicit deduplication lifetime/stale-replay rule is necessary for the stated replay-safety guarantee.

## Source evidence and exact locators

Each evidence ID below binds an inspected primary source to its exact frozen hash and locators. `review-text` line numbers refer to deterministic reviewer extracts retained in `sources/`; section names and normative IDs locate the primary document itself. Source facts and review inferences are distinguished in each claim check.

### E01 — mqtt-v5.0-os.html

Primary: `/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/jobs/D-M12-A/treatment/protected_breadth_final-v3/sources/mqtt-v5.0-os.html`; SHA-256 `e5d96188f36c6e36d5aa019b4aa99074de4159ee462996371688ddd39ead20a4`; [official/author source](https://docs.oasis-open.org/mqtt/mqtt/v5.0/os/mqtt-v5.0-os.html).

Locators: Title/version block, 07 March 2019, OASIS Standard; reviewer text lines 1-110; §4.3, lines 6275-6284; §4.3.1-4.3.3, lines 6285-6420.

Source facts: The dated OS edition defines QoS 0 at most once, QoS 1 at least once, and QoS 2 exactly once for an application-message transfer from one sender to one receiver. Outbound subscription QoS can differ from inbound QoS. QoS 2 uses PUBLISH, PUBREC, PUBREL, PUBCOMP.

Limits: This is protocol delivery, not proof of durable survey-database commit or global end-to-end effects. QoS depends on retained session state and the protocol assumptions, not an unconditional crash-proof promise.

### E02 — mqtt-v5.0-os.html

Primary: `/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/jobs/D-M12-A/treatment/protected_breadth_final-v3/sources/mqtt-v5.0-os.html`; SHA-256 `e5d96188f36c6e36d5aa019b4aa99074de4159ee462996371688ddd39ead20a4`; [official/author source](https://docs.oasis-open.org/mqtt/mqtt/v5.0/os/mqtt-v5.0-os.html).

Locators: §4.3.2, MQTT-4.3.2-4/-5, lines 6335-6361; §3.4.2.1 Table 3-4, lines 4127-4184; §4.4 MQTT-4.4.0-2, lines 6428-6430.

Source facts: A successful PUBACK accepts ownership and need not wait for onward application delivery. PUBACK can also carry rejection reasons, including not authorized, quota exceeded, and invalid payload. A PUBACK/PUBREC reason code >=0x80 terminates protocol retransmission of the corresponding PUBLISH.

Limits: PUBACK is not merely an unqualified received bit; successful ownership and negative acknowledgment must be distinguished. A protocol acknowledgment is not evidence that an authoritative application record was durably stored.

### E03 — mqtt-v5.0-os.html

Primary: `/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/jobs/D-M12-A/treatment/protected_breadth_final-v3/sources/mqtt-v5.0-os.html`; SHA-256 `e5d96188f36c6e36d5aa019b4aa99074de4159ee462996371688ddd39ead20a4`; [official/author source](https://docs.oasis-open.org/mqtt/mqtt/v5.0/os/mqtt-v5.0-os.html).

Locators: §3.3.1.1 DUP, MQTT-3.3.1-1/-2/-3, lines 3493-3520; §2.2.1 Packet Identifier, MQTT-2.2.1-3/-4/-5, lines 1565-1589; §4.3.2 MQTT-4.3.2-5, lines 6340-6343.

Source facts: DUP=1 flags a possible retransmission; the receiver need not have seen the earlier packet. An application message can repeat with DUP=0 and a different packet identifier. Two-byte packet identifiers are scoped to the session/direction and can be reused after the corresponding acknowledgment; acknowledgment packets bind to the original packet ID.

Limits: DUP and packet IDs are not stable application record identities. This supports application-level identity, not a measured assertion that duplicate observations occur at a particular frequency.

### E04 — mqtt-v5.0-os.html

Primary: `/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/jobs/D-M12-A/treatment/protected_breadth_final-v3/sources/mqtt-v5.0-os.html`; SHA-256 `e5d96188f36c6e36d5aa019b4aa99074de4159ee462996371688ddd39ead20a4`; [official/author source](https://docs.oasis-open.org/mqtt/mqtt/v5.0/os/mqtt-v5.0-os.html).

Locators: §3.3.2.3.3 Message Expiry Interval, MQTT-3.3.2-5/-6, lines 3675-3690; §4.3.3 MQTT-4.3.3-7/-13, lines 6391-6392 and 6419-6420.

Source facts: Message Expiry Interval is a four-byte integer lifetime in seconds. If expired before the server starts onward delivery, the server must delete that subscriber copy; if absent the application message does not expire. Forwarded expiry subtracts server waiting time. QoS 2 acknowledgment processing has separate expiry rules.

Limits: This governs broker/subscriber copies, not a phone-local survey retention policy. Keeping the authoritative record while expiring an attempt is an application design inference, not the MQTT rule itself.

### E05 — mqtt-v5.0-os.html

Primary: `/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/jobs/D-M12-A/treatment/protected_breadth_final-v3/sources/mqtt-v5.0-os.html`; SHA-256 `e5d96188f36c6e36d5aa019b4aa99074de4159ee462996371688ddd39ead20a4`; [official/author source](https://docs.oasis-open.org/mqtt/mqtt/v5.0/os/mqtt-v5.0-os.html).

Locators: §3.1.2.11.2 Session Expiry Interval, MQTT-3.1.2-23, lines 2369-2422; §4.1-4.1.2, MQTT-4.1.0-1/-2, lines 6185-6248; §4.4 MQTT-4.4.0-1, lines 6421-6427.

Source facts: Session expiry defaults to zero when omitted; nonzero expiry retains state after disconnection, while 0xFFFFFFFF means no expiry. Reconnect replay requires Clean Start=0 and an existing session, with original packet IDs. Other MQTT retransmission times are prohibited. Administrative policies or failures can lose stored session state. The payment example writes all data to nonvolatile memory before transmission.

Limits: MQTT retry rules cannot be copied wholesale into a generic immediate/timer retry loop. Long offline interruptions can outlast session retention, and session storage is not inherently durable local capture storage.

### E06 — mqtt-v5.0-os.html

Primary: `/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/jobs/D-M12-A/treatment/protected_breadth_final-v3/sources/mqtt-v5.0-os.html`; SHA-256 `e5d96188f36c6e36d5aa019b4aa99074de4159ee462996371688ddd39ead20a4`; [official/author source](https://docs.oasis-open.org/mqtt/mqtt/v5.0/os/mqtt-v5.0-os.html).

Locators: §4.2, lines 6249-6274; §4.6 MQTT-4.6.0-1/-5/-6, lines 6471-6515.

Source facts: MQTT assumes an ordered lossless byte stream. Resends preserve original send order. Non-shared subscriptions use ordered topics by default, for messages from the same client at the same QoS. QoS 1 duplicates can interleave, but setting both endpoints Receive Maximum=1 prevents an earlier message arriving after a later one even on reconnect.

Limits: Reconnect does not inherently imply arbitrary order. Ordering guarantees have sender/topic/QoS/subscription/flow conditions and do not supply order across unrelated clients or arbitrary application transports.

### E07 — aws-retries-jitter.html

Primary: `/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/jobs/D-M12-A/treatment/protected_breadth_final-v3/sources/aws-retries-jitter.html`; SHA-256 `bff72c61f7dae855aeb35bb2834b2ac9839390f86d1132ab1ae1fb722e729def`; [official/author source](https://aws.amazon.com/builders-library/timeouts-retries-and-backoff-with-jitter/).

Locators: Visible title/author/canonical metadata; reviewer lines 28-37; Timeouts, lines 48-57; Retries and backoff, lines 58-66; Jitter and Conclusion, lines 67-75.

Source facts: The frozen response identifies AWS Builder Center, author Marc (AWS employee), published 12 June 2026 and modified 15 June 2026, with a builder.aws.com canonical URL. It describes capped exponential backoff, limited retries, a single retry layer, local token-bucket limits, and jitter. Side-effecting APIs require idempotency. Timeout choices must account for network latency and covered DNS/TLS work; client errors generally will not improve with identical retries, with an eventual-consistency caveat.

Limits: The article is design guidance, not a normative prescription for this phone queue or a measured battery result. Retry-budget terminology is a reasonable summary of token-bucket/attempt limits. This is a living/reprinted document, not a release pin for any chosen SDK.

### E08 — stripe-idempotency.html

Primary: `/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/jobs/D-M12-A/treatment/protected_breadth_final-v3/sources/stripe-idempotency.html`; SHA-256 `a93f0ffb31a6adcc917168ac576201bc7946276322921e932d0357ee6ef95150`; [official/author source](https://docs.stripe.com/api/idempotent_requests).

Locators: Idempotent requests, reviewer lines 145-160; Visible API selector, reviewer line 140: 2026-09-30.endive.

Source facts: Clients provide a unique key (V4 UUID suggested; maximum 255 characters). Stripe replays the first status/body, including 500 errors. Keys may be pruned after at least 24 hours, after which reuse creates a new request. Reused keys must match original parameters. Validation failures and concurrent execution conflicts are not saved until endpoint execution begins. Keys apply to POST; they have no effect on GET/DELETE, which are already idempotent.

Limits: A stable key alone is not an unlimited offline replay guarantee. The captured reference exposes 2026-09-30.endive but no survey-server/API adoption is declared. Stripe retention/method rules are limits of the analogy, not defaults that must be imposed on the custom survey service.

### E09 — pouchdb-conflicts.html

Primary: `/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/jobs/D-M12-A/treatment/protected_breadth_final-v3/sources/pouchdb-conflicts.html`; SHA-256 `57609df8ae2496a0315c814e04d6e34455ebba6ceef737ba15de470a33c771e0`; [official/author source](https://pouchdb.com/guides/conflicts.html).

Locators: Guide Conflicts; Two types of conflicts and Upsert, lines 26-62; Eventual conflicts, lines 63-98; Visible download banner, line 8: v9.0.0.

Source facts: The guide says PouchDB implements CouchDB replication. Immediate conflicts are 409s on revision-sensitive operations; delta/upsert retry can handle suitable changes. Concurrent offline branches get an arbitrary deterministic winner, not a semantic merge. Replication history preserves losing branches; conflicts:true exposes _conflicts, rev retrieves losers, and explicit removal/new revision resolves them. Equal revision history assumes completed replication.

Limits: The default winner can hide a losing branch unless queried. Conflict resolution is application-controlled. The v9.0.0 download banner does not prove the living guide is a release-pinned specification, and the unavailable CouchDB protocol is not independently validated by this guide.

### E10 — pouchdb-conflicts.html

Primary: `/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/jobs/D-M12-A/treatment/protected_breadth_final-v3/sources/pouchdb-conflicts.html`; SHA-256 `57609df8ae2496a0315c814e04d6e34455ebba6ceef737ba15de470a33c771e0`; [official/author source](https://pouchdb.com/guides/conflicts.html).

Locators: Accountants do not use erasers, lines 99-107.

Source facts: The append-only alternative creates new delta documents rather than updating/removing existing documents. Its balance example computes a sum of immutable changes.

Limits: The example supports an order-independent set/commutative projection when IDs are distinct. Immutability alone does not prove that every arrival-order-sensitive application state or ordered event projection is equivalent; timestamp uniqueness in the example is not adopted as a universally safe key generator.

### E11 — sqlite-atomiccommit.html

Primary: `/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/jobs/D-M12-A/treatment/protected_breadth_final-v3/sources/sqlite-atomiccommit.html`; SHA-256 `5a5be7b660217c9408c8a81eaf2faa2d08832ed3790f895a0a713916ad856ea1`; [official/author source](https://www.sqlite.org/atomiccommit.html).

Locators: Introduction, lines 70-95; Hardware Assumptions, lines 96-219; §6.2, lines 713-738; Last-update marker, line 1122: 2026-04-21 10:28:59Z.

Source facts: Atomic commit applies all changes in one transaction or none. The described algorithm is rollback-journal mode, not WAL. Writes can remain in volatile OS cache and be reordered, so fsync/flush ordering and filesystem/VFS assumptions matter. The page discusses FULL versus NORMAL synchronous behavior, powersafe-overwrite defaults since 3.7.9, and historical 3.3.14/3.5.0 implementation details.

Limits: Atomicity alone is not unconditional power-loss durability on arbitrary phone flash or arbitrary settings. No installed SQLite version, VFS, journaling/synchronous mode, phone OS, or hardware configuration is supplied; historical details are not current runtime pins.

### E12 — sqlite-atomiccommit.html

Primary: `/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/jobs/D-M12-A/treatment/protected_breadth_final-v3/sources/sqlite-atomiccommit.html`; SHA-256 `5a5be7b660217c9408c8a81eaf2faa2d08832ed3790f895a0a713916ad856ea1`; [official/author source](https://www.sqlite.org/atomiccommit.html).

Locators: §3.5-3.11, lines 298-428; §4 Rollback, lines 451-537; §5.2, lines 573-600; §8 and §9.2-9.5, lines 967-992 and 1030-1103.

Source facts: The rollback journal is flushed before database writes; database changes are flushed before the commit point. A crash before commit rolls back the transaction; a crash after commit preserves it under the stated assumptions. synchronous=OFF or journal_mode=MEMORY compromise power-loss integrity. Crash tests simulate incomplete/reordered writes and reopen/check all-or-none consistency; broken flushes or missing hot journals can defeat recovery.

Limits: The source explains how to avoid torn logical transactions, not that every transactional delete resurrects a row. Process-kill tests alone do not cover power-loss/write-cache behavior, and an uncommitted enqueue can legitimately vanish after rollback unless local acceptance waits for durable commit.

### E13 — transactional-outbox.html

Primary: `/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/jobs/D-M12-A/treatment/protected_breadth_final-v3/sources/transactional-outbox.html`; SHA-256 `7b9d9b224d9b985bf03d581dcdef5c94a21f49a93f3ac1e74c6bc2104a48b3eb`; [official/author source](https://microservices.io/patterns/data/transactional-outbox.html).

Locators: Context, Problem and Forces, lines 18-40; Solution and Result context, lines 41-67; Creator attribution, lines 76-78.

Source facts: The author defines a transaction that stores the outbound message together with business-state mutation, followed by a separate relay. State commit and outbound publication are coupled through durable intent; ordering for same-aggregate updates is a force. The relay can crash after publication but before recording it, publish again on restart, and therefore needs an idempotent consumer, possibly tracking message IDs.

Limits: The outbox transaction is the state-plus-message enqueue boundary; it does not atomically include remote delivery or a phone receiving a remote acknowledgment. Atomic local acknowledgment/deletion cannot eliminate the network-to-local-commit crash window.

### E14 — external-aws-idempotent-apis.html

Primary: `/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/reviews/targeted-cohort4/D-M12-A/treatment-v3/sources/external-aws-idempotent-apis.html`; SHA-256 `c9cbf74baf969017bf7305cfc9b15923e63636ea1de931bdd5fdecb575f1da04`; [official/author source](https://aws.amazon.com/builders-library/making-retries-safe-with-idempotent-APIs/).

Locators: Making retries safe with idempotent APIs, Malcolm Featonby; Reducing client complexity, lines 171-178; Retries and semantic equivalence, lines 179-181 and 225; Late arriving requests, lines 226-269; Same client request ID, different intent, lines 270-272.

Source facts: AWS describes caller-scoped request IDs; recording the token and all mutations must be one ACID operation. Replays should have semantically equivalent outcomes. The deduplication lifetime varies with service/resource and must account for late requests. Same key with different parameters returns a validation error, supported by retained request parameters.

Limits: Additional reviewer source, not part of the candidate corpus and not a required new technology. Service-specific EC2 lifetime policy does not define a universal phone offline horizon. This validates relevant missing conditions, not a demand to use AWS.

### E15 — external-rifl.pdf

Primary: `/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/reviews/targeted-cohort4/D-M12-A/treatment-v3/sources/external-rifl.pdf`; SHA-256 `f609f9508beaf936027f31428a8f06dc86d8201faadc5b340ffead7706863969`; [official/author source](https://web.stanford.edu/~ouster/cgi-bin/papers/rifl.pdf).

Locators: Lee et al., Implementing Linearizability at Large Scale and Low Latency, SOSP 2015, DOI 10.1145/2815400.2815416; title/abstract PDF page 1; §2 end and §3, PDF page 3; §3 continuation and Figures 3-5, PDF page 4; §4.1-4.2, PDF page 5; §9, PDF pages 14-15.

Source facts: RIFL gives conditional exactly-once RPC semantics using stable request identity, atomic durable result-plus-effect records, retry rendezvous, and safe garbage collection. It assumes automatic retries, clients that retain required state, and reliable server metadata. Leases fence stale retries after reclamation and can report an ambiguous result after a partition. Section 9 discusses client state loss and layers, including client-visible identities/reconciliation at the ultimate boundary.

Limits: This does not promise delivery under arbitrary permanent failure or erase human/client uncertainty. Its datacenter/lease design is not an automatic recommendation for offline phones. It demonstrates that rejecting all end-to-end exactly-once protocols as impossible is too broad; the narrower claim that bare retries are insufficient remains correct.

## Versions and acquisition limits

- **mqtt-v5.0-os.html**: MQTT Version 5.0, OASIS Standard, 07 March 2019. Dated OS protocol edition, not an implementation pin. Corrected reviewer extraction to declared windows-1252; primary bytes unchanged.
- **aws-retries-jitter.html**: AWS Builder Center article, author Marc, AWS employee; published 2026-06-12, modified 2026-06-15. Frozen response canonical URL is https://builder.aws.com/content/3EumjoZascWd1oZiEgL8ORlv3qE/timeouts-retries-and-backoff-with-jitter. Original requested AWS URL and capture time are index claims; living/reprinted edition.
- **stripe-idempotency.html**: Stripe API Reference Idempotent requests; visible selector 2026-09-30.endive. Living rendered reference; selector is observed document context, not a surveyed server release or universal key lifetime.
- **pouchdb-conflicts.html**: PouchDB Conflicts guide; visible download v9.0.0. Download banner is not a versioned replication-spec identity; CouchDB source protocol remains uncaptured.
- **sqlite-atomiccommit.html**: Atomic Commit In SQLite; page updated 2026-04-21T10:28:59Z. Rollback-mode explanation; historical 3.3.14/3.5.0/3.7.9 discussion is not a installed-library pin. WAL needs separate mechanism evidence if chosen.
- **transactional-outbox.html**: Chris Richardson, Pattern: Transactional outbox. Living author-owned pattern, no release number or normative survey-app adoption.
- **external-aws-idempotent-apis.html**: Malcolm Featonby, Making retries safe with idempotent APIs, Amazon Builders Library. Reviewer additional live HTML capture; qualitative idempotency conditions only, not EC2 adoption.
- **external-rifl.pdf**: Lee et al., SOSP 2015; DOI 10.1145/2815400.2815416; PDF metadata modified 2015-09-18. 16-page author-hosted PDF; reviewed relevant abstract, §§2-4.2 and §9, with pages 3-4 visually inspected. No RAMCloud code execution or phone suitability claim.

The six original acquisition times (20:12:06Z–20:12:28Z) are candidate-index claims. Their preserved bytes are independently hash-verified. The additional sources have actual reviewer URL, status, headers, timestamps, byte counts and SHA-256 in `sources/additional-primary-captures.json`. Live-page identities do not pin a production implementation release. MQTT extraction uses its declared windows-1252 encoding; this corrected an initial lossy UTF-8 extract without changing primary bytes.

## Every consequential claim/check disposition

This catalogue includes recommendations, source assertions, governing assumptions, negatives, options, optional leads and execution claims. A supported direction does not count as implementation proof.

### C01 — Six selected public primary identities and exact frozen bytes; capture at 20:12Z

Candidate: lines 5-10 and 99-100. Kind: source_fact_or_inference. **VERIFIED_WITH_PROVENANCE_LIMITS**. Evidence: E01, E07, E08, E09, E11, E13.

All six primary hashes/byte counts and the mapped source-index hash match. Titles/content identify the stated sources. The original manifest selects none. Capture timestamps/tool execution are self-reported, not independently authenticated by preserved request receipts. All six byte bodies, not merely index rows, were examined for their consequential mechanisms.

### C02 — Module scope is phone-local offline photo metadata and short observations; later record sizes of photos+short text

Candidate: lines 3-5 and 93-94. Kind: brief_condition. **PARTLY_SUPPORTED**. Evidence: original brief, frozen final or frozen index; no independent historical receipt.

Brief supports offline phones, photo metadata and observations. An authoritative server and flaky link are declared assumptions. Full photo-sized records are not supplied; the final condition drifts from metadata to photos. No numeric size limit depends on it, so this is a minor scope observation, not a decisive defect.

### C03 — Retry until ack is insufficient by itself

Candidate: lines 14 and 25-50. Kind: source_fact_or_inference. **SUPPORTED**. Evidence: E02, E05, E07, E08, E12, E13.

Lost responses can leave processed work ambiguous; local state can fail before a send. The bounded assumption challenge is warranted without claiming any current implementation is broken.

### C04 — Only an authoritative durable-commit ack should retire a pending record

Candidate: lines 15-16 and 27-29. Kind: source_fact_or_inference. **SUPPORTED_DIRECTION_INCOMPLETE_CONTRACT**. Evidence: E02, E03, E14, E15. Defects: D02.

Sound application requirement, not an MQTT durability guarantee. Define successful outcome and bind it to the intended immutable operation/payload or revision; a delayed receipt for an earlier change must not retire a newer change. Failure PUBACK is not success.

### C05 — Ack evidence must be stored transactionally with local deletion

Candidate: lines 15-16 and 48-50. Kind: source_fact_or_inference. **OVERSTATED_NECESSITY**. Evidence: E12, E13. Defects: D04.

A valid optional local-state design, but not proven necessary when a durable delete and idempotent receiver suffice. It cannot atomically include network ack receipt or prevent all resends.

### C06 — Stable client UUID honored by server provides idempotent replay

Candidate: lines 17-18 and 35-37. Kind: source_fact_or_inference. **SUPPORTED_ONLY_WITH_MISSING_CONDITIONS**. Evidence: E03, E08, E14, E15. Defects: D02.

UUID key direction is sound. Persist the same operation ID/payload across restarts, enforce same-intent binding, atomically store effect/result/dedup identity, and define retention/fencing for late replay. A header occurrence alone does not establish these semantics.

### C07 — Bounded backoff with jitter shared across the queue and a retry budget

Candidate: lines 19-20 and 55-56. Kind: source_fact_or_inference. **SUPPORTED_DESIGN_INFERENCE**. Evidence: E07.

AWS describes capped exponential backoff, token-bucket limiting, and avoiding stacked retries. A queue-wide scheduler is a reasonable adaptation; the source does not specify its phone parameters. Budget exhaustion should pause retained work rather than erase it; failure-classification and retry resumption require a contract.

### C08 — No silent unsent-record expiry; storage pressure visible

Candidate: lines 19-20 and 58-63. Kind: proposed_product_policy. **SUPPORTED_PRODUCT_CHOICE**. Evidence: E04, E05, E11.

For valuable unsent field records, silent TTL removal is data loss. A visible retention/backpressure choice is bounded and useful. This is a value/design inference, not a broker requirement or proof that a finite store can accept unlimited observations.

### C09 — Net effect is at-least-once delivery and effectively-once storage

Candidate: line 21. Kind: source_fact_or_inference. **CONDITIONAL_PROMISE_NOT_ESTABLISHED**. Evidence: E05, E08, E11, E13, E14, E15. Defects: D02, D03.

At-least-once progress needs eventual usable connectivity, an accepting service, retained pending work and resumed retries. Effectively-once storage needs durable effect/identity coupling and a valid replay horizon. These are not supplied by the three additions as written.

### C10 — QoS 1 PUBACK means received

Candidate: lines 25-27. Kind: source_fact_or_inference. **QUALIFIED_SUPPORT**. Evidence: E02.

On success it means accepted ownership; it need not mean onward delivery or durable application commit. The successful-path shorthand supports the intended distinction, but it omits negative reasons and is not a universal ack definition.

### C11 — MQTT QoS 2 has four-way exactly-once transfer; guarantee is single hop

Candidate: lines 26-27 and 40. Kind: source_fact_or_inference. **SUPPORTED_WITH_PROTOCOL_CONDITIONS**. Evidence: E01, E05.

The four packet exchange and one-sender/one-receiver scope are verified. Retained session state and expiry/continuation rules constrain reconnect; none of this proves survey storage durability.

### C12 — Memory-only receipt ack may stop retry and then lose data on server crash

Candidate: lines 27-28. Kind: source_fact_or_inference. **SUPPORTED_CONDITIONAL_COUNTEREXAMPLE**. Evidence: E02, E05, E12, E13.

Logically follows if the ack stops retry before the authoritative effect becomes durable. MQTT even distinguishes volatile-meter and nonvolatile-payment choices. No measured server behavior is claimed.

### C13 — Kill server between ack and write; no loss

Candidate: line 29. Kind: proposed_check. **PROPOSED_DISCRIMINATING_CHECK_WITH_ORACLE_LIMIT**. Evidence: E02, E12.

This is a useful negative control for premature ack. The safe contract should never expose a successful durable ack before durable write. Observe both local pending state and recovered authoritative records; a client which already trusts the bad ack is not guaranteed to replay. No test was run.

### C14 — Processed item with lost ack gets replayed and can double-record without dedup

Candidate: lines 31-34. Kind: source_fact_or_inference. **SUPPORTED_COUNTEREXAMPLE**. Evidence: E03, E07, E13.

The outbox source explicitly describes publish-then-crash-then-republish. Duplicates are an expected possibility, not proof of their frequency in this survey tool.

### C15 — Duplicates are routine rather than rare

Candidate: lines 31-32. Kind: source_fact_or_inference. **PLAUSIBLE_UNQUANTIFIED_INFERENCE**. Evidence: E03, E13.

Allowed and unsurprising under at-least-once replay. The sources do not measure how often this phone scenario duplicates work; read as a semantic risk, not a probability estimate.

### C16 — DUP=1 receiver cannot assume it previously saw the message

Candidate: lines 33-34. Kind: source_fact_or_inference. **SUPPORTED**. Evidence: E03.

Exact source statement verified. DUP=0 can also repeat a logical application message; using a stable application UUID rather than this flag is therefore the correct direction.

### C17 — Stripe Idempotency-Key demonstrates replay-safe client keys

Candidate: lines 34-35. Kind: source_fact_or_inference. **SUPPORTED_ANALOGY_WITH_MATERIAL_LIMITS_OMITTED**. Evidence: E08. Defects: D02.

The header/example and full body are present. Replay safety is conditional on key retention and identical parameters; cached 500 responses, validation/concurrency exceptions and POST-only acceptance are in the frozen text. The exposed API selector is 2026-09-30.endive. The 24-hour pruning limit is directly relevant to offline delayed replay.

### C18 — Brief assumption holds only for one transport hop, not end-to-end

Candidate: lines 36-37. Kind: source_fact_or_inference. **OVERGENERALIZED_SHORTHAND**. Evidence: E01, E05, E13.

MQTT guarantee is per-hop and replay alone does not provide global durable effects. The brief never defines the ack as a protocol-hop ack, so it is better to specify missing application conditions rather than assert a one-hop sufficiency theorem.

### C19 — Processed/ack-lost injection must leave exactly one stored record

Candidate: line 37. Kind: proposed_check. **PROPOSED_USEFUL_CHECK**. Evidence: E13, E14, E15.

A discriminating test for the identified risk. Also cover concurrent replay and restart at effect/identity commits and beyond dedup retention; one happy injection is not full proof. Nothing was executed.

### C20 — Exactly-once effects cannot be obtained by bare retries alone

Candidate: line 39. Kind: source_fact_or_inference. **SUPPORTED**. Evidence: E03, E13, E15.

Without stable intent and durable duplicate/result handling, an uncertain result can be executed again. This narrower heading is retained as useful negative discovery.

### C21 — No retry scheme or end-to-end exactly-once protocol can work; two-generals

Candidate: line 40 and line 96. Kind: source_fact_or_inference. **UNJUSTIFIED_UNCONDITIONAL_REJECTION**. Evidence: E01, E15. Defects: D01.

Single-hop MQTT does not establish this universal impossibility. RIFL supplies a conditional stateful protocol with exactly-once RPC semantics. Arbitrary permanent failure or lost client state prevents unconditional progress/knowledge, but that failure model is not stated here.

### C22 — Every retry path naming a dedup key is discriminating validation for F3

Candidate: line 42. Kind: proposed_check. **NECESSARY_BUT_INSUFFICIENT_STATIC_GATE**. Evidence: E08, E14, E15.

Names alone do not validate durable effect/identity coupling, same-intent semantics or replay horizon. The gate is proposed and can catch missing keys, but cannot substantiate effectively-once storage.

### C23 — Crash between ack and local delete causes a duplicate send after restart

Candidate: lines 44-46. Kind: source_fact_or_inference. **SUPPORTED_POSSIBILITY**. Evidence: E12, E13.

If deletion has not committed, the pending row can remain and be resent. It need not resurrect after a completed durable transaction; replay is compatible with safe idempotent effects.

### C24 — Torn phone-flash delete resurrects the row; SQLite documents flash/power failure

Candidate: lines 45-46. Kind: source_fact_or_inference. **PARTLY_SUPPORTED_CONDITIONAL_INFERENCE**. Evidence: E11, E12. Defects: D03, D04.

The words and failure mechanisms occur. Correct transactional recovery produces all-or-none state under stated assumptions; bad settings/hardware can cause corruption as well as rollback. Neither SQLite presence nor the word flash proves a row-resurrection outcome.

### C25 — Transactional outbox keeps state change and relay decision in one local transaction

Candidate: lines 47-48. Kind: source_fact_or_inference. **MISBOUND_SOURCE_MECHANISM**. Evidence: E13. Defects: D03, D04.

The primary solution couples business state with the outgoing message, and then a separate relay may republish. It does not make remote delivery or received ack atomic with local bookkeeping.

### C26 — Alternatively derive local deletions from server state

Candidate: lines 49-50. Kind: proposed_option. **CONDITIONAL_PROPOSED_OPTION**. Evidence: E14, E15. Defects: D02.

Can be sound when a query yields authoritative, durable evidence for the same operation/payload/version. A current server state or old receipt without identity binding is insufficient. The query/consistency contract is not specified.

### C27 — Crash each ack-to-delete step; no duplicate and no loss

Candidate: line 50. Kind: proposed_check. **AMBIGUOUS_PROPOSED_ORACLE**. Evidence: E12, E13. Defects: D04.

Duplicates on the wire remain possible before local receipt commits. No duplicate stored effect is the appropriate idempotency oracle. Local all-or-none recovery and no acknowledged-record loss need distinct observations. No crash injection was performed.

### C28 — Immediate queue retries can storm a recovering service/network

Candidate: lines 52-54. Kind: source_fact_or_inference. **SUPPORTED_RISK_INFERENCE**. Evidence: E07.

AWS supports retry amplification, synchronized bursts and delayed recovery. Harm is contingent on overload/correlation, not inevitable after every reconnect.

### C29 — AWS prescribes exponential backoff, jitter and retry budgets

Candidate: lines 53-55. Kind: source_fact_or_inference. **SUPPORTED_SUMMARY_WITH_AUTHORITY_LIMIT**. Evidence: E07.

Frozen body describes these mechanisms including capped delays, attempt limits and local token buckets, even though retry budget need not occur literally. It is author guidance and context-specific tradeoffs, not a universal mandate or phone SDK default.

### C30 — Retry churn drains phone battery

Candidate: line 54. Kind: source_fact_or_inference. **PLAUSIBLE_UNMEASURED_INFERENCE**. Evidence: E07.

Extra network/CPU work is a reasonable phone-side hypothesis, not a measured claim from this AWS article. Its inference marking is appropriate; no power figure is asserted.

### C31 — 100 items at 30% loss must respect budget cap

Candidate: line 56. Kind: proposed_check. **PROPOSED_USEFUL_BUT_NOT_COMPLETE_CHECK**. Evidence: E07.

Example workload and loss rate are chosen test parameters, not source facts. Define cap units/window and queue retry scheduling; test synchronized clients too if assessing jitter. Rate control alone does not prove delivery or fair retained-work resumption.

### C32 — Silent TTL removal of unsent observations loses data and is worse than pressure

Candidate: lines 58-59. Kind: inference_and_product_choice. **SUPPORTED_LOGIC_AND_VALUE_CHOICE**. Evidence: E04, E05.

Deleting the only retained unsent record loses it; prioritizing preservation over silent expiry is a declared product choice. A finite queue must expose refusal/backpressure or explicit disposition rather than assume endless capacity.

### C33 — MQTT expiry is a broker TTL on undelivered copies, analogy for attempt not record

Candidate: lines 60-61. Kind: source_fact_or_inference. **SUPPORTED_WITH_LIMITS**. Evidence: E04.

Server/subscriber copy expiry, seconds unit, no-expiry default and remaining-time propagation are checked. The preservation of the original survey record is the candidate application inference; MQTT actually deletes a copy, not merely a timer.

### C34 — Only duplicate or superseded items may age out

Candidate: line 62. Kind: proposed_product_policy. **CONDITIONAL_PRODUCT_POLICY_NOT_FULLY_DEFINED**. Evidence: E08, E09, E13. Defects: D02, D05.

The terms need proof of safe equivalence/durable replacement. A losing conflict branch is not automatically redundant, and a dedup tombstone is not an expendable duplicate while late replay remains possible. The no-silent-expiry policy is useful but not a complete reclamation contract.

### C35 — Overflow test must show no silent disappearance

Candidate: line 63. Kind: proposed_check. **PROPOSED_USEFUL_CHECK**. Evidence: E05, E11.

A discriminating retention check. Include storage-full enqueue failure, restarted pending data and visible rejection/explicit deletion; no overflow test was run.

### C36 — Reconnect makes backlog arbitrary-order

Candidate: lines 65-66. Kind: source_fact_or_inference. **OVERGENERALIZED_RISK**. Evidence: E06, E13. Defects: D05.

Possible for the unspecified concurrent application transport, not inherent to reconnect. MQTT has ordering defaults/resend rules and a Receive Maximum=1 option; outbox requires same-aggregate order. The brief fixes no chosen transport.

### C37 — Last-write-wins lets delayed old data overwrite newer state

Candidate: line 66. Kind: source_fact_or_inference. **CONDITIONAL_INFERENCE**. Evidence: E09, E15. Defects: D05.

Correct if latest means arrival/write order. Timestamp/version-based LWW may reject the older logical update; the candidate does not specify this condition. Duplicate re-execution can also overwrite an intervening write as the RIFL example illustrates.

### C38 — PouchDB/CouchDB surfaces conflicts with a deterministic winner

Candidate: lines 66-67. Kind: source_fact_or_inference. **SUPPORTED_WITH_DISCLOSURE_CONDITIONS**. Evidence: E09. Defects: D05.

Deterministic arbitrary winner is verified; explicit conflicts:true and losing-revision retrieval are necessary to surface full conflict information. Replication completion conditions the same-history statement. This is not automatic semantic merge.

### C39 — Immutable append-only records make reordering benign; mutable records need revision/conflict handling

Candidate: lines 68-69. Kind: source_fact_or_inference. **USEFUL_UNCERTAINTY_WITH_MISSING_PROJECTION_CONDITION**. Evidence: E10, E13. Defects: D05.

For an append-only logical set and order-independent projection, yes. Immutability alone does not make an arrival-sequence projection commutative. Mutability is not settled by the brief and remains correctly unresolved.

### C40 — Any order of one backlog yields the same server state

Candidate: line 70. Kind: proposed_check. **PROPOSED_CHECK_NEEDS_SEMANTIC_ORACLE**. Evidence: E09, E10. Defects: D05.

Compare the intended record set and resolved projection with declared order/conflict semantics, not arbitrary physical storage/arrival history. The test is useful for a chosen order-independent contract; it is not valid for every legitimate ordered model. No property test was run.

### C41 — SQS 404/JS stub and CouchDB DNS failed at capture; attempts logged in index

Candidate: lines 72-74. Kind: historical_execution_claim. **SELF_REPORTED_HISTORY_NOT_INDEPENDENTLY_VERIFIABLE**. Evidence: original brief, frozen final or frozen index; no independent historical receipt.

The frozen index contains those four failure records. Discarded response bodies, status/redirect receipts and DNS logs are not in the declared retained set. Matching their index text does not verify actual historical failures. No current re-fetch can establish what happened at 20:12Z. This is a provenance limit, not a finding of fabrication.

### C42 — Retention guidance relies only on MQTT, SQLite and outbox; no source supports bare retries as sufficient; all six add mechanisms

Candidate: lines 74-77. Kind: source_fact_or_inference. **QUALIFIED_SUPPORT_WITH_MISSED_AVAILABLE_CONDITION**. Evidence: E01, E04, E07, E08, E09, E11, E13. Defects: D02.

The examined sources do not establish sufficiency of bare retries for the survey. Absence in this bounded corpus is not exhaustive refutation, as F8 correctly says. Stripe already contains directly relevant dedup-retention limits, so the gap cannot excuse overlooking the frozen 24-hour pruning condition.

### C43 — Recapture elsewhere before calling retention advice complete

Candidate: line 77. Kind: proposed_check. **REASONABLE_PROPOSED_FOLLOWUP_WITH_LIMIT**. Evidence: original brief, frozen final or frozen index; no independent historical receipt.

A bounded unresolved source lead, not a requirement to keep searching until an unknown answer key is found. Different-network retrieval could improve future coverage, but would not authenticate historical failure claims. The reviewer did not recapture these failed URLs.

### C44 — Offline persistence coverage plus six distinct mechanism families/non-competitor analogies

Candidate: lines 81-85. Kind: source_fact_or_inference. **FAMILIES_VERIFIED_PERSISTENCE_COVERAGE_PARTIAL**. Evidence: E01, E07, E08, E09, E11, E13. Defects: D03.

Six distinct families are grounded in actual primary text: QoS, retry control, request identity, revision conflicts, atomic local storage and transactional outbox. IoT, payments, cloud and replication analogies are relevant. Ack/delete is local persistence work but does not cover initial durable offline capture.

### C45 — Assumption challenge is supported

Candidate: line 86. Kind: source_fact_or_inference. **SUPPORTED**. Evidence: E03, E07, E13.

Lost acknowledgment/duplicate-effect and capture-durability mechanisms warrant challenging sufficiency. The challenge need not rely on the overly broad impossibility claim in F3.

### C46 — At most eight distinct material findings with negative discoveries and uncertainty

Candidate: line 87 and Findings headings. Kind: output_structure. **SATISFIED**. Evidence: original brief, frozen final or frozen index; no independent historical receipt.

Exactly F1-F8; 1086 whitespace-delimited words, within the stated soft 1100 ceiling by this count. F2/F3 and F1/F4 overlap but examine distinct identity/guarantee and server/local boundaries. F6 is a useful negative, F7/F8 explicit uncertainties. F3 contains D01 but is not the only negative.

### C47 — Bounded changes/tests and no exhaustive claim

Candidate: lines 88-89. Kind: output_structure. **SATISFIED_WITH_SUBSTANTIVE_LIMITS**. Evidence: original brief, frozen final or frozen index; no independent historical receipt.

No whole survey application is designed. Each finding has a proposed check; F8 explicitly bounds discovery. Some oracles cannot establish the promised effect and core missing conditions remain. These are reviewed separately, not an allegation of hidden execution.

### C48 — PouchDB sync engine with persistent store and deterministic merge is a heavier alternative for mutable records

Candidate: lines 94-96. Kind: proposed_option_and_inference. **PARTLY_SUPPORTED_OPTION_MISCHARACTERIZED**. Evidence: E09, E10. Defects: D05.

Revision-tree replication and application-controlled resolution are real alternatives. Automatic deterministic semantic merge is not demonstrated; default winner is arbitrary and explicit resolution preserves losing revisions. Heavier is an unmeasured design judgment, not a benchmark.

### C49 — Optional broker expiry budgets, dedup tombstone windows and resumable checkpoints

Candidate: lines 96-97. Kind: optional_leads. **LEADS_PRESERVED_NOT_IMPLEMENTED**. Evidence: E04, E08, E13, E15. Defects: D02.

These are explicitly unpursued leads, with no assertion that an implementation exists. Broker expiry/checkpoints may stay optional; dedup lifetime/fencing is a correctness condition whenever replay-safe effects are promised, though a particular tombstone mechanism is optional.

### C50 — Mutability and source coverage unresolved; runtime checks all proposed, source/hash/locator work executed

Candidate: lines 98-100. Kind: execution_and_uncertainty. **PROPOSAL_EXECUTION_BOUNDARY_MOSTLY_CLEAR**. Evidence: E01, E07, E08, E09, E11, E13.

The candidate does not claim to have run crash/load/property/overflow tests. Current hash and source-locator properties are independently reproduced by this reviewer; original capture/grep commands and discarded failures are not authenticated by the index alone. No unjustified abstention on the whole module; the two open uncertainties are preserved.

## Provenance and delivery

This is the first fresh review of this exact frozen version under rootreviewcarrier-v2. No native Goal, receipt engineering, candidate feedback, delegation, or additional children were created. Output is advisory review only; no repository/canon/governance/WorkNode/global configuration or third-party service writes occurred. The final response returns these artifacts to the T3 review carrier. Timings and observable operations are in `timings.json`; unavailable native counters and billing remain null.

Minor observations: failed acquisition history is not independently evidenced by its index entries; the final conditions briefly drift from photo metadata to photos. Neither is used to invent an implementation failure.
