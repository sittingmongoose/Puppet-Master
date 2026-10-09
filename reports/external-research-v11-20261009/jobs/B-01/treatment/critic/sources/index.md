# Source index — B-01 treatment critic

Access time for the web observations below: 2026-10-09 19:59 UTC. Pages were searched and opened through the web tool; locator details refer to the official page sections/line ranges returned by that observation. “Commit unavailable” means the primary page did not expose a commit hash in the accessed view; URLs and release/issue identifiers therefore remain the binding identities, with no silent rebinding. These are bounded notes, not full-page copies.

## S01 — CouchDB consistency and replicated conflicts

Apache CouchDB 3.5 stable docs, `intro/consistency.html` and `intro/overview.html`. The intro says replication is incremental and CouchDB is eventually consistent; simultaneous changes are retained as conflict branches and all databases deterministically choose the same winner, while application owners decide whether/how to merge. The protocol is for intermittently connected databases, not a global reservation lock. Locator: consistency section “Eventual Consistency”; overview, sections 1.1.6–1.1.6.2. Commit unavailable on docs rendering.

## S02 — CouchDB app design under replication

Apache CouchDB 3.5 stable docs, `best-practices/documents.html`, section 4.1.4, especially lines 20–34 and the following examples. The docs explicitly warn that replication and conflict flags are not the whole story for user-expected behavior. Used to avoid assuming a generic DB conflict algorithm defines ferry booking rules. Commit unavailable.

## S03 — CouchDB replication protocol and interruption behavior

Apache CouchDB 3.5 docs, `replication/intro.html` (3.5.1 page) and `replication/protocol.html` (protocol version 3). Replication is source/target incremental sync, continuous jobs wait for changes, and the protocol is built over HTTP and expects unstable networks, delays, losses and retries. Locators: sections 2.1.1/2.1.3 and 2.4.1–2.4.4. Commit unavailable.

## S04 — PouchDB browser-local replication and conflict handling

PouchDB official guides, `guides/replication.html` and `guides/conflicts.html`. The guides describe local PouchDB and remote CouchDB instances, multi-master sync, deterministic winner behavior with revision branches retained, and app-owned resolution. Used as a candidate architecture only; browser storage behavior and deployment details still need testing. Pages do not expose a numbered version/commit.

## S05 — Firestore offline cache and transaction limits

Google Firebase official docs, `firestore/manage-data/enable-offline` and `firestore/manage-data/transactions`. The docs say Android, Apple, and web are supported; clients read/write/query cached data; local writes sync later; same-document multiple changes use last-write-wins; cached query results may be stale/incomplete; transactions fail while offline. Locators: offline persistence lines 450–459, cache state 656–675 / 804–814, queued writes 857–869; transaction behavior lines 459–467. Documentation is rolling, no source commit exposed. Current product/version semantics should be rechecked at procurement.

## S06 — SQLite changesets

SQLite official `sessionintro.html`. Session Extension captures DB table changes and applies changesets to same-schema/compatible-baseline DBs, has declared-primary-key requirements, excludes virtual tables, is disabled by default at build time, and calls an application conflict handler for data/constraint conflicts. Locators: sections 1.1–1.3, 2.2–2.3, and 3.2. Page last-updated stamp observed as 2025-05-31; source commit unavailable.

## S07 — CouchDB upgrade issue and later release marker

Apache CouchDB GitHub issue #5879, opened 2026-02-03 for 3.5.1. Observed status: open / needs-triage. Reporter conditions: upgrade from 3.4.2, OTP 26, ~8 GB nodes, large shard/database counts, compaction or shard movement; reports memory/process growth and possible OOM/outage. This is user-reported issue evidence, not a confirmed general defect or verified fix. Apache CouchDB website reports 3.5.2 dated 2026-05-19. Release notes/issue cross-check did not establish whether 3.5.2 fixes #5879. Issue ID and release page are stable identifiers; commit unavailable.

## Navigation by claim

- Incremental replication, disconnected peers, deterministic conflict branches: S01, S03, S04.
- Business conflict semantics remain app-owned: S01, S02, S04.
- Firestore offline behavior and its limits: S05.
- SQLite as lower-level changeset primitive: S06.
- Maintenance/release caution: S07.

## Not established by these sources

No source here establishes ferry-specific capacity rules, legal accessibility/privacy obligations, quoted price, vendor SLA, data residency, local kiosk/tablet persistence lifetime, exact browser storage quotas, or a tested integration. Those remain discovery or procurement questions.

## Critic corroboration and alternative mechanisms

The independent critic reopened core supplier claims and RxDB evolution evidence; bounded notes are in [critic-evidence.md](critic-evidence.md). See [source-map.json](../source-map.json) for exact IDs, URLs, version/commit, locators and operation trail.

- C01–C06 corroborate the predecessor’s Compass, Access One Voyage, Zaui, FerryCloud, WSF workflow, and published page dates without treating vendor copy as a test.
- C07–C10 corroborate RxDB’s pinned conflict defaults and a narrow peer-reconnect issue/fix/release chain.
- S04–S06 add PouchDB browser replication, Firestore cached offline reads/queued writes/last-write-wins/offline-transaction limit, and SQLite Session changesets as distinct mechanisms. These are technical alternatives, not evidence of operator fit.
- S07 adds an open CouchDB 3.5.1 upgrade report. It is scoped to high shard/database counts and compaction; the later 3.5.2 release was not shown to fix the report.

## Relation / condition / release graph for the critic

- **Terminals disconnected → each can only reason from its own local state.** CouchDB explicitly permits disconnected replicas to write independently and replicate later; that preserves local availability but yields eventual, not common, state (S01, S03). A per-document conflict is observable; two distinct reservation IDs for the same limited capacity may not be. Thus local availability does not establish globally unique booking confirmation.
- **Central authority → final confirmation waits for the authority.** Firestore queues offline writes, but offline transactions fail; its cache may be stale or incomplete (S05). Therefore an offline pending queue can preserve intent, but it cannot claim an offline atomic capacity check.
- **Preallocated quotas → offline confirmation remains bounded** only if the sum of allotments never exceeds actual vessel capacity and an offline terminal cannot consume another terminal’s share. This follows from the case’s partition and inventory constraints; it is a proposed business rule to validate, not a source-provided database feature.
- **SQLite changeset → compatible relational changes can be recorded and applied,** provided schema/baseline and primary-key requirements are met; transport, idempotence, duplicate handling and business conflict decisions remain application responsibilities (S06).
- **Issue/fix/release chain:** CouchDB #5879 reports a 3.5.1 upgrade problem under high shard/database and compaction conditions; a later 3.5.2 release marker exists, but no fix relationship was established (S07). RxDB #5342 reports one dropped-peer stall, a reconnect fix/test commit and beta.42 note, a small post-fix divergence report, then v15.0.0's WebRTC out-of-beta status (C08–C10). These sources justify workload-specific qualification; neither supplies a ferry reliability estimate.
