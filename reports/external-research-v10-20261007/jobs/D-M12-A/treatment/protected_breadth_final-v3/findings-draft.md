# Findings draft — D-M12-A protected_breadth_final-v3 (ticket 3)

Assumption under challenge: "retrying each queued item until acknowledged is sufficient."
Grounding: six frozen primary sources in sources/ (see index.json). [E] = executed check
against frozen bytes; [I] = inference from those sources; [P] = proposed (not executed).

## Findings (8)

**F1. "Ack" is ambiguous — receipt-ack and durable-commit-ack are different contract points. [I]**
MQTT defines per-hop QoS handshakes where QoS 1 PUBACK means "received" and QoS 2 uses a
four-way flow for exactly-once transfer (§4.3) [E: QoS sections + "4.3" present]. If the
survey server acks on receipt into memory, retry-until-ack stops while data is still losable
to a server crash. Disposition: **amended** — retry must target an explicitly durable
acknowledgment (acked only after the record is committed server-side).
Proposed change (bounded): define/require commit-ack semantics; nothing else changes.
Validation [P]: kill server between ack and disk write; replay client must not lose data.

**F2. Duplicate delivery is the normal outcome of retry-until-ack, not an edge case. [I]**
At-least-once plus ack loss after server commit forces replay: server processed and forgot
nothing, client never learned. MQTT's DUP flag exists exactly for redelivery and the spec
says a receiver of DUP=1 "cannot assume that it has seen" the message [E: grep match].
Without dedup, the queue double-records observations. Disposition: **amended** — the brief's
assumption holds only for a transport hop, not end-to-end; add a client-generated stable
record ID checked server-side (Stripe Idempotency-Key pattern [E: header present in source]).
Validation [P]: inject "process succeeds, ack lost" fault; assert one stored record.

**F3. Exactly-once cannot be built from retries alone (negative discovery). [I]**
Two-generals: no retry scheme yields exactly-once end-to-end; MQTT QoS2's exactly-once is a
single-hop transfer guarantee, not end-to-end [E: QoS2 flow text present]. Disposition:
**accepted** — target "effectively once" = at-least-once transport + idempotent receiver.
Validation [P]: code-review gate: any new retry path must name its dedup key.

**F4. Delete-on-ack is unsafe unless the local "sent" state is committed atomically. [I]**
If the local retention step deletes the queued row upon receiving ack, a crash between ack
and delete (or a torn delete on flash — SQLite documents power-failure behavior and flash
storage explicitly [E: "power failure", "flash" present]) can resurrect the row → duplicate
send after restart. Transactional outbox pattern: state change and relay decision are one
local transaction [E: "atomic" present]. Disposition: **amended** — delete-after-ack must be
transactional with recorded ack evidence, or derive deletions from server state.
Validation [P]: crash-injection at every step of ack→delete; no duplicate, no loss.

**F5. Unbounded immediate retry harms the recovering network and the phone. [I]**
Retry-each-item-until-acked with no pacing, against a flaky link and a server that just
recovered, is a self-inflicted retry storm; AWS Builders' Library prescribes exponential
backoff with jitter and retry budgets [E: source present; "jitter" matched]. Battery cost on
phones is the local-retention angle. Disposition: **accepted** — bounded backoff with jitter,
shared across the queue, plus a retry budget.
Validation [P]: measure attempt rate under 100-item backlog + 30% packet loss; must stay
within budget cap.

**F6. Silent local expiry is data loss; retention caps must fail loudly (negative discovery). [I]**
Any TTL that silently expires unsent observations destroys field data — for a survey tool
this is worse than storage pressure. MQTT's Message Expiry Interval is a broker-side TTL for
undelivered messages — useful analogy for "expire the send attempt," never the record [E:
"Message Expiry Interval" present]. Disposition: **accepted** — retention policy: no silent
record expiry; size-bounded queues escalate to user-visible state, optionally expire only
duplicate/superseded items.
Validation [P]: test: fill queue past cap; assert no record disappears without explicit
user-visible action.

**F7. Reconnect reorders/delays records; safety depends on record immutability. [I]**
A backlog syncs in arbitrary order; if the server applies last-write-wins over
observations, a delayed old item can overwrite newer state. PouchDB/CouchDB instead surface
conflicts with a deterministic winner algorithm [E: "deterministic algorithm" present].
Disposition: **unresolved** — if queued survey records are immutable append-only events,
reordering is benign and no change is needed; if they are mutable, revision/conflict
handling is required. This is a product decision the brief does not settle.
Validation [P]: property test: any delivery order of the same backlog yields the same server
state.

**F8. Source-coverage gap on retention specifics (uncertainty / negative discovery). [E]**
SQS dedup/retention vendor pages were unusable at capture time (404 / JS stub) and the
CouchDB protocol spec failed DNS, so retention guidance rests on MQTT expiry + SQLite +
outbox sources only; captured attempts logged in sources/index.json. No source found
supports "retry-until-ack alone is sufficient" — all six add dedup, transactional state, or
conflict machinery. Disposition: **unresolved** (coverage gap, not a mechanism refutation).
Validation [P]: re-capture under a different network before treating retention advice as
complete.

## Obligation coverage checklist
1. Offline persistence + interrupted sync → F4, F5, F7 ✔
2. Ack/retry meaning under duplicate/delayed messages → F1, F2, F7 ✔
3. Distinct mechanism families + ≥1 non-competitor analogy → six families (protocol QoS,
   idempotency keys, retry policy, offline-first replication, durable local commit, outbox);
   analogies: IoT pub/sub (MQTT), payments API (Stripe), cloud infra (AWS), DB replication
   (PouchDB) ✔
4. Challenge a brief assumption when supported → F2, F3, F4 ✔
5. ≤8 material findings incl. negatives/uncertainty → 8 findings; negatives F3, F6, F8 ✔
6. Bounded proposed changes + discriminating validation, no exhaustiveness claim → per-finding
   bounded change + validation; F8/F7 carry explicit non-exhaustiveness ✔

Executed vs proposed: [E] locator greps against frozen bytes (DUP flag, QoS/4.3, Message
Expiry, Idempotency-Key, power failure/flash, atomic, deterministic algorithm, jitter) and
capture attempts; [P] all fault-injection tests are proposed, none executed here.
