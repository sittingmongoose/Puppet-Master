# Critique dispositions — I-ANCHOR-LUNA

I read and dispositioned the full required critique: verdict, eight actionable revisions, and coverage disposition. The critique is a required predecessor review, not an optional adoption list.

## Actionable revisions

| Critique item | Disposition |
|---|---|
| 1. Conditional component recommendation and concrete gate | **Adopted.** PouchDB 9.0.0 / CouchDB 3.5.2 remains a prototype candidate only. Name managed OS/browser, app lifecycle, builds, quota/storage policy, and test foreground recovery after process/device restart plus prolonged offline capture. Sources support IndexedDB as browser default, SQLite as separate plugin, and general CouchDB 3.x compatibility, not certification of this pair [S14, C09, F08]. |
| 2. Idempotency by operation | **Adopted.** Version canonical event bytes; hash event and exact photo bytes with SHA-256; server recomputes photo hashes. Same ID and same hashes is idempotent across concurrent delivery, paths, worker restart, and lost response. Different content under same ID is quarantined. Add concurrent duplicate and accepted-before-receipt crash tests. Pause/retry is not durable acknowledgment [S13, C10, F09]. |
| 3. Arrival versus causality | **Adopted.** Per-device sequence and server sequence only order local events/arrival. Parent links express causality; child-before-parent stays pending. Add varied-order projection assertion [S01–S02, C10]. |
| 4. Immutable photo versus deletion | **Adopted conditionally.** Prefer separately addressable photo records when per-photo redaction may be needed. If coupled to event, prove erasure across revisions, compaction, backups, and disconnected replicas first. Add tombstone/deny-reupload and stale-device retry test. Tombstone does not prove physical erasure [S06–S07, C04, F04–F05]. |
| 5. Server receipt privacy | **Adopted.** Keep private receipt details outside the crew-readable replicated database in a server store or authorized gateway. Test crew receipt mutation, supervisor read-only behavior, cross-scope reads, direct/replicated writes, and authenticated validation context [S05, S19, C02–C03, F02–F03]. |
| 6. Issue/fix/test/release trail | **Partly adopted; locator correction rejected on direct source evidence.** Retain #8456 → #8460, both commits, test behavior, and issue #5422 as 3.4.2 storage risk only. Do not say 8.0.0 visible release notes list #8460; rely on exact 9.0.0 bundle. Critic C06 says lines 3729–3795. Fresh direct GET of the exact raw pinned file, with the same complete-file SHA as S11, shows the test at 3899–3967. The predecessor #L3899 locator is supported; C06's range remains documented but is not adopted. F15 preserves the direct excerpt. Test was not run [S08–S12, S15, C05–C08, C14–C15, F06, F10–F15]. |
| 7. Mechanism distinctions | **Adopted and preserved.** Couch/Pouch replication, SQLite/PostgreSQL custom outbox, Automerge same-property conflicts, and ODK form workflow remain distinct with explicit limits. CRDT convergence does not decide safe status; ODK does not resolve shared-asset edits [S03–S04, S13–S18, C10–C13]. |
| 8. Proposed/executed boundary | **Adopted.** Keep eight validation groups proposed; add device matrix, idempotency/worker recovery, photo hash, stale deletion replay, receipt privacy, and causal reorder. Upstream test was inspected only. State plainly that no code, component, server, or test was run [S01, C06, F06–F15]. |

## Coverage disposition

- **Frozen plan:** retain all six corrections: mutable asset row → visit/event history; timestamp winner → explicit domain review; path → stable photo identity; POST/retry → replication or specified outbox; latest-only supervisor view → projection plus history; undefined auth/deletion/conflict/attachment/audit → release gates [S02].
- **Integrated brief:** retain primary evidence, materially different mechanisms, pinned code behavior, issue/fix/regression/release applicability, conflict handling, duplicate/reorder, retention/deletion, access, attachments, observable tests, analogue, affordable public components, and no permanent SaaS assumption [S01, S03–S19].
- **Useful discoveries:** retain ODK draft/finalize/send as optional workflow; Automerge as narrow free-text experiment; Pouch attachment regression as a reason for versioned adapter testing; CouchDB #5422 as a pinned-server benchmark trigger with unresolved 3.5.2 applicability [S15–S17, F10–F15].
- **Already covered:** researcher-v1 already had an event model, conditional stack recommendation, broad mechanism comparison, deletion/access questions, issue/fix/test path, eight validations, and eleven open questions. The final preserves and sharpens them; prior coverage does not excuse dropping new critique conditions.
- **Open choices:** all eleven remain: clients, offline envelope, merge semantics, approval/correction, identity/revocation, scope, retention/erasure, upload resumption, recovery, operator model, and tamper evidence. Public sources cannot settle them.
- **Product choices/status:** no user choice was supplied. Pouch/Couch remains a conditional proposal, not canon. No implementation, purchase, account action, or test result is claimed.

## Evidence boundary

The final uses only the declared INPUTS.md map and allowed public primary sources. S01–S19 and C01–C15 identities/locators remain unchanged. F01–F15 supplement them. The C06 locator conflict is explicit; the exact pinned raw bytes support the final's #L3899 locator.
