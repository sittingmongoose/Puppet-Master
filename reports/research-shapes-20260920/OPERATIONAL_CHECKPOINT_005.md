# Operational checkpoint 005

Recorded observation (UTC): `2026-09-21T05:20:06.724452+00:00`. This provisional reports-only bundle is not landed; the observation describes that instant only.

The fourth slot (`R-c1b39b04e92a73f97285`) remained running with a known native process live, no sealed packet and no score lock. Three of sixteen scores were locked. No fifth launch was authorized. [Checkpoint 004](BLIND_SCORE_CHECKPOINT_004.md) and all earlier reports remain historical.

An external usage import was rejected before save because a raw cumulative-counter reset caused distinct later events to reuse earlier numerical ranges. The private operational auditor established the separate epochs from raw counter decreases and event positions, independently of the desired comparator result. This rejection caused no native or account hold and no native retry.

The approved recovery changed only historical comparison metadata, preserving the true native session hash in `native_session_identity`. Original captures, receipt IDs, measurement keys, token categories, charges, source/event bindings and prior import bindings remained preserved. The exact rejected capture was then imported once through the unchanged frozen importer, retaining its validation and deduplication checks. The original fourth attempt and concurrent native state were preserved under the existing budget lock.

Unknown external usage remains unknown. Known captured plus reserved usage was within the cap at application; this does not establish absolute accounting completeness. The after-state digest describes the application snapshot, not an indefinitely fixed live budget. A future reset requires its own proof and approval; no blanket exception or new slot authorization follows.

Root reviewed the blind-safe records and verified hashes without parsing private proof or accounting contents. The designated private auditor verified raw accounting and preservation claims. This checkpoint reports no private usage counts, costs, clocks or configuration labels and makes no semantic result claim.

[The JSON checkpoint](operational-checkpoint-005.json) preserves the bounded assertions. [The hash manifest](operational-checkpoint-005.manifest.json) distinguishes reviewed blind-safe records from private artifacts verified by hash only. Publication on the reports branch is separate from landing on main.
