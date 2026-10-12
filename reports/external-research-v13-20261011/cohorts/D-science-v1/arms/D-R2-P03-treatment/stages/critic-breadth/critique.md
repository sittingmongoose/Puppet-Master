# Complementary breadth critique — D-P07

**Run / stage:** D-R2-P03-treatment · critic-breadth  
**Reviewed:** the released `revealed-plan.md`, full investigator `discovery.md` and `draft.md`, `plan-reveal.json`, `plan-reveal.json` lineage hash, and the investigator source index/map. I opened the cited primary-source pages for the sync, transaction, SQLite recovery, CouchDB, and CRDT claims, then independently checked the additional alternatives below.  
**Released plan identity:** SHA-256 `ab4e366c681798f8e7de0480f19a8cce2bad747ed2be59608d3e0fee99174493`; released 2026-10-12T04:25:26.108Z.  
**Scope:** breadth and missing mechanism families; no final plan authored.

## Overall judgment

The investigator draft covers the brief's central product obligations with useful specificity: draft versus immutable published snapshots; disjoint descriptive fields versus constrained assignments; a server decision boundary for qualifications, overlap, dependencies and swaps; revision-scoped supervisor approval; stale worker requests and explicit rebase; version-pinned notification/export records; local recovery; and a separate list of proposed checks. I found no reason to reverse its clause dispositions.

The alternative set is not yet broad across sync protocols. It centers on CRUD upload queues, relational custom sync, document revision replication, and CRDT text. Add a short conditional comparison of operation replay and checkpointed local-document replication, plus a read-path-only Postgres option. This makes the design space clearer without changing the provisional PowerSync direction or implying a product selection before platform, backend and hosting constraints are known.

## Findings and proposed additions

### 1. Add operation replay as a distinct alternative

The draft recommends modeling swaps as domain commands, but its concrete sync examples are predominantly row CRUD operations. Replicache is a useful contrasting protocol to evaluate if a browser/JavaScript client is in scope: clients persist named mutations and apply them optimistically; the server reruns them against authoritative state; unconfirmed mutations are replayed on a newer server base. Its ordered per-client sequence and transaction semantics differ from shipping a row patch and resolving field conflicts later. (S20)

The server must commit a mutation's domain effects and the corresponding `lastMutationID` atomically. A permanent rejection must still be marked processed; otherwise that mutation is retried and can block later mutations from the same client. Preserve the rejected command and reason in application state while advancing the protocol sequence, and distinguish that terminal business rejection from retryable infrastructure failure. (S21)

**Disposition:** optional candidate, platform-gated. Add a paragraph to “Alternatives and conditions” and one proposed test: reject a stale/invalid swap, confirm the rejection remains reviewable and version-pinned, then verify a subsequent queued command progresses after the rejection acknowledgement. Also exercise duplicate push/retry, effect-plus-ack atomicity, and client rebase. This does not make client replay authoritative approval: the server still validates role, base revision, qualification and schedule invariants. A target browser/JavaScript stack is not specified, so do not rank it above the current candidate.

### 2. Distinguish document replication from command replay

RxDB documents a checkpointed pull/push protocol at the collection/document level. A push supplies the client's assumed master state and fork state; the conflict handler resolves on the client, and the default behavior replaces the fork with the server state. That provides a maintained local-document replication family beyond CouchDB revision trees and the PowerSync CRUD queue. (S22)

**Disposition:** optional candidate, platform and transaction-boundary gated. If included, say that a per-document conflict callback does not establish atomicity across the two assignments in a swap or validate a roster-wide invariant. Keep the backend command that accepts/rejects a swap atomic across affected records; test that concurrent multi-document changes never leave a half swap, even with duplicate delivery and checkpoint recovery. The reviewed RxDB page does not prove or disprove every possible cross-document transaction configuration, so the plan should state this as a qualification question rather than a categorical product limitation.

### 3. Record a read-path-only option accurately

Electric Sync's current overview describes a Postgres read-path engine that sends Shapes to local clients over HTTP and points to application-API patterns for writes. It could be considered for distributing versioned published snapshots or query-scoped reads, paired with a separate app-owned command queue for offline proposals. It does not by itself meet the offline write/reconnect requirement described in the brief. (S23)

**Disposition:** optional architecture boundary, not a full sync alternative. If added, keep snapshot/read synchronization separate from write authority, explicitly scope offline retention and authorization, and do not imply that a local write will be durably queued or accepted by Electric. A client/server trace should verify read convergence, permission filtering, and the separate proposal-queue behavior.

## Coverage and remaining breadth checks

| Brief obligation | Investigator draft coverage | Breadth note |
|---|---|---|
| Published schedule distinct from working draft | Explicit immutable publication ID/hash and current pointer | Covered. Keep the snapshot as the authority for downstream version references. |
| Concurrent overlap and swaps preserve both intents for review | Domain command, expected version, conflict record and explicit rebase | Covered in proposal. Add operation-replay rejection/continuation trace if that family remains in the candidate set. |
| Qualification/dependency policy | Server-side validation and owner-defined rules | Covered as mechanism and uncertainty; keep center rules as unresolved assumptions until named owners define them. |
| Approval and publish boundary | Authenticated supervisor event tied to exact revision/hash; atomic publish/outbox | Covered. Keep authorization distinct from sync filtering, as the draft does. |
| Request's observed version; notification/export history | Immutable publication references, outbox/delivery state, correction rather than recall | Covered. The existing note to define cancellation of queued notifications is a legitimate owner decision. |
| Change explanation | Deterministic diff before republish | Covered; retain this as explanatory evidence, not approval authority. |
| Local persistence and repair | SQLite transaction/WAL/FK caveats and recovery proposals | Covered; do not generalize a SQLite native test to every selected client adapter. |
| Maintained mechanisms, callers/tests and repair history | PowerSync SDK release/connector/issue/changelog; PostgreSQL, SQLite, CouchDB and Automerge sources | Good evidence for the PowerSync path. A case-specific application repository is not supplied, so no target callers exist to inspect. Add SDK caller/repair review only after a client/backend candidate is chosen; keep the #48 adaptation a proposed test, not a result. |

The added alternatives do not change the current conclusion that no technology is selected. The brief leaves client platform, existing backend, hosting, identity provider, offline duration, data-retention and budget constraints unspecified. Exact package support, current release, sync visibility/auth filtering, multi-row transaction behavior and queue rejection semantics remain selection gates.

## Validation record

**Executed in this critic stage:** read the supplied brief and all listed investigator artifacts; reviewed the released plan against the whole draft; opened official primary pages cited by the investigator and the additional Replicache, RxDB and Electric pages listed in `source-map.json`.

**Not executed:** no code, synthetic trace, multi-client test, permissions test, crash/recovery test, product acceptance, account, roster, notification service or deployment. The tests suggested above are proposals only. Source identities S01–S19 are copied unchanged from the investigator map; S20–S23 are this critic's additional source records.
