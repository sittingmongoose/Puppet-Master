# final.md — D-M12-A / protected_breadth_final-v3

Offline survey queue: photo metadata + short observations, synced on reconnect. Scope: only the
retry/acknowledgment + local-retention module. Assumption challenged: *"retrying each queued item
until acknowledged is sufficient."* Date: 2026-10-07. Sources: six public primary docs I selected
and froze under `sources/` (exact bytes, SHA-256, capture 20:12Z; identities in `sources/index.json`):
MQTT v5.0 OASIS standard (os, 2019); AWS Builders' Library "Timeouts, retries, and backoff with
jitter"; Stripe API "Idempotent requests"; PouchDB "Conflicts" guide; SQLite "Atomic Commit";
microservices.io "Transactional outbox". Markers: **[E]** executed check against frozen bytes,
**[I]** inference from them, **[P]** proposed test, not executed.

## Recommendation

Keep retry-until-ack as the transport loop, but it is not sufficient on its own. Add three things:
(1) a **commit-level acknowledgment** — an item is dropped from retry only when the server reports a
durable store, and that ack evidence is itself stored transactionally with the local delete;
(2) a **client-generated stable record ID** (UUID) honored server-side as a dedup key, so replays of
unacknowledged sends are idempotent;
(3) a **bounded, jittered retry policy** shared across the queue, and a retention policy that never
silently expires unsent records — storage pressure escalates to user-visible state instead.
Net effect: at-least-once delivery with an idempotent receiver, "effectively once" storage.

## Findings (8, each with disposition and validation)

**F1 — "Ack" is ambiguous: receipt vs durable commit. [I]** MQTT defines per-hop QoS handshakes:
QoS 1 PUBACK means "received"; QoS 2 uses a four-way flow for exactly-once transfer [E: QoS §4.3 in
frozen spec]. If the server acks on receipt into memory, retry stops while data is still losable to a
server crash. **Disposition: amended** — ack must mean committed, and the contract must say so.
Validation [P]: kill server between ack and disk write; replaying client must lose nothing.

**F2 — Duplicates are the normal outcome of retry-until-ack. [I]** If the server commits but the ack
is lost, the client replays a processed item; at-least-once makes this routine, not rare — MQTT's DUP
flag covers redelivery and a receiver of DUP=1 "cannot assume that it has seen" the message [E: grep
of frozen spec]. Without dedup the queue double-records observations. Stripe's Idempotency-Key header
shows the fix shape: a client-chosen stable key, replay-safe [E: header present]. **Disposition:
amended** — brief's assumption holds only for one transport hop, not end-to-end; add stable record ID
+ server dedup. Validation [P]: inject "processed, ack lost"; assert exactly one stored record.

**F3 — Exactly-once cannot be built from retries alone (negative discovery). [I]** No retry scheme
gives end-to-end exactly-once (two-generals); MQTT QoS 2 is a single-hop guarantee [E]. **Disposition:
accepted** — target effectively-once: at-least-once transport + idempotent receiver. Validation [P]:
review gate — every retry path must name its dedup key.

**F4 — Delete-on-ack is unsafe unless local "sent" state commits atomically. [I]** A crash between ack
and delete — or a torn delete on phone flash, whose power-failure behavior SQLite documents directly
[E: "power failure", "flash" in frozen doc] — resurrects the row, causing a duplicate send after
restart. The transactional-outbox pattern keeps state change and relay decision in one local
transaction [E: "atomic" present]. **Disposition: amended** — delete-after-ack must be transactional
with recorded ack evidence, or derive deletions from server state. Validation [P]: crash-injection at
each ack→delete step; no duplicate, no loss.

**F5 — Unbounded immediate retry harms the recovering network and the phone. [I]** Retry-each-item-
now against a just-recovered server is a self-inflicted retry storm; AWS prescribes exponential
backoff with jitter and retry budgets [E: source frozen; "jitter" matched]. Battery drain is the
local angle. **Disposition: accepted** — bounded backoff with jitter, shared queue-wide, plus a retry
budget. Validation [P]: 100-item backlog at 30% loss; attempt rate must stay under the budget cap.

**F6 — Silent local expiry is data loss; retention must fail loudly (negative discovery). [I]** A TTL
that quietly expires unsent observations destroys field data — worse than storage pressure. MQTT's
Message Expiry Interval is a broker-side TTL on undelivered messages — an analogy for expiring the
send attempt, never the record [E: term present]. **Disposition: accepted** — no silent record
expiry; size-bounded queue escalates visibly; only duplicate/superseded items may age out.
Validation [P]: overflow test: no record disappears without explicit user-visible action.

**F7 — Reconnect reorders records; safety depends on immutability. [I]** A backlog syncs in arbitrary
order; last-write-wins servers let a delayed old item overwrite newer state. PouchDB/CouchDB instead
surface conflicts with a deterministic winner [E: "deterministic algorithm" present]. **Disposition:
unresolved** — if queued records are immutable append-only events, reordering is benign and no change
is needed; if mutable, revision/conflict handling is required. A product decision the brief does not
settle. Validation [P]: property test — any delivery order of one backlog yields the same server state.

**F8 — Source-coverage gap on retention specifics (uncertainty). [E]** SQS dedup/retention pages were
unusable at capture (404 / JS stub) and CouchDB's replication spec failed DNS; retention guidance here
rests on MQTT expiry + SQLite + outbox only; attempts logged in `sources/index.json`. No frozen source
supports "retry-until-ack alone is sufficient" — all six add dedup, transactional state, or conflict
machinery. **Disposition: unresolved** — a coverage gap, not a refutation; findings are bounded, not
exhaustive. Validation [P]: re-capture on another network before treating retention advice as complete.

## Obligation coverage

1. Offline persistence + interrupted sync — F4, F5, F7.
2. Ack/retry meaning under duplicate or delayed messages — F1, F2, F7.
3. Distinct mechanism families + non-competitor analogy — six families: protocol QoS, idempotency
   keys, retry policy, offline-first replication, durable local commit, outbox; analogies from IoT
   pub/sub (MQTT), payments API (Stripe), cloud infrastructure (AWS), database replication (PouchDB).
4. Challenge a brief assumption — F2, F3, F4 (assumption insufficient end-to-end).
5. ≤8 material findings incl. negatives/uncertainty — negatives F3, F6; uncertainty F7, F8.
6. Bounded proposed changes + discriminating validation, no exhaustive-discovery claim — per-finding
   bounded change and validation above; F8 states the bound explicitly.

## Conditions, alternatives, uncertainty

Conditions: findings assume a phone-local queue over flaky cellular/wifi, a server whose storage is
authoritative, and record sizes of photos+short text. Alternatives considered: replacing retry with a
sync engine (PouchDB-style persistent local store + deterministic merge — heavier; suits mutable
records); exactly-once protocol end-to-end (rejected: impossible per F3). Optional leads not pursued:
broker-side expiry budgets, tombstone-based server dedup windows, resumable sync checkpoints. Key
uncertainties: F7's immutability question; F8's coverage gap; all validation tests are proposed, not
executed — executed work here is source selection, byte-freezing, hashing, and locator checks [E],
with mechanism claims being inference [I] from those primary texts.
