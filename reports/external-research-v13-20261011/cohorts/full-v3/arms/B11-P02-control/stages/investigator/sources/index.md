# Evidence index

This is a bounded, navigable index for the investigator-stage source IDs in ../source-map.json. IDs are stable within this stage and are not reused for different sources. Each source-map entry records the exact URL, release/version or unpinned-doc status, locator, UTC access stamp, observed operation, governing condition/default/exception, and applicability. The links below are primary product docs, Rust API/source docs, and upstream issue/release history. No raw captures or downloaded code are included.

## Loro (leading native Rust fit to evaluate)

- [S01 — List vs MovableList](https://loro.dev/docs/tutorial/list): concurrent move behavior, uniqueness/convergence, overhead.
- [S02 — Cursor and stable positions](https://loro.dev/docs/tutorial/cursor): stable sequence/text positions and comment ranges.
- [S03 — Sync](https://loro.dev/docs/tutorial/sync): update exchange, convergence conditions, missing dependencies, child-container identity.
- [S04 — Rust LoroDoc API, crate 1.16.2](https://docs.rs/loro/1.16.2/loro/struct.LoroDoc.html); [Rust source around LoroMovableList](https://docs.rs/loro/1.16.2/src/loro/lib.rs.html#3339): native API, import/export, frontiers, storage/transport boundary.
- [S05 — PeerID management](https://loro.dev/docs/concepts/peerid_management): per-session unique writer IDs.
- [S06 — Upstream release history](https://github.com/loro-dev/loro/releases): package/version distinction, failure atomicity and compatibility notes.
- [S07 — Import-time lock-order issue #957](https://github.com/loro-dev/loro/issues/957) and [linked fix PR #958](https://github.com/loro-dev/loro/pull/958): adapter-specific real incident.

## Alternatives

- [S08 — Automerge conflict semantics](https://automerge.org/docs/reference/documents/conflicts/).
- [S09 — Automerge fine-grained list/model guidance](https://automerge.org/docs/reference/documents/lists/).
- [S10 — Automerge Rust sync protocol](https://automerge.org/automerge/automerge/sync/index.html).
- [S11 — Yjs offline persistence](https://docs.yjs.dev/getting-started/allowing-offline-editing).
- [S12 — Yjs relative positions](https://docs.yjs.dev/api/relative-positions).
- [S13 — ShareDB server/OT model](https://share.github.io/sharedb/).
- [S14 — ShareDB reconnect queue behavior](https://share.github.io/sharedb/getting-started).

## Use

Read findings in discovery.md by bracketed source ID, then consult source-map.json for the exact locator and applicability. The research is not a product implementation or executed concurrency test.
