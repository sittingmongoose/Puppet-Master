# Reviser evidence index — B11-P02-control

This index follows stable source IDs from the investigator package. Full identity, release/version, exact locator, access time, observed operation, governing condition/default/exception, and applicability are recorded in [source-map.json](../source-map.json). S01–S14 retain their predecessor identities; reviewer observations are overlays, not source rebinding. S15 is the Rust API page directly observed during this revision.

## Loro candidate

- [S01 — List and MovableList](https://loro.dev/docs/tutorial/list): concurrent move behavior, deterministic convergence, and MovableList overhead.
- [S02 — Cursor and stable positions](https://loro.dev/docs/tutorial/cursor): stable text/list positions, deletion history replay, and optional range comments.
- [S03 — Sync](https://loro.dev/docs/tutorial/sync): update convergence conditions, pending dependencies, and child-container identity.
- [S04 — Version-pinned Rust LoroDoc API (loro 1.16.2)](https://docs.rs/loro/1.16.2/loro/struct.LoroDoc.html): original source identity; the exact-version URL could not be opened by the browser tool in this revision.
- [S05 — PeerID management](https://loro.dev/docs/concepts/peerid_management): writer/session identity.
- [S06 — Upstream Loro release history](https://github.com/loro-dev/loro/releases): JS/WASM release/version distinction and package-specific fixes.
- [S07 — Import lock-order issue #957](https://github.com/loro-dev/loro/issues/957) and [fix PR #958](https://github.com/loro-dev/loro/pull/958): Node/WebRTC adapter incident and reported fix.
- [S15 — Rust LoroDoc API page observed in this revision](https://docs.rs/loro/latest/loro/struct.LoroDoc.html): page identifies Rust crate loro 1.16.2; confirms caller-owned storage/loading/sync and non-ACID commit semantics. This is the URL directly opened for the current recheck.

## Alternatives

- [S08 — Automerge conflict semantics](https://automerge.org/docs/reference/documents/conflicts/): deterministic read winner and inspectable alternatives.
- [S09 — Automerge list/model guidance](https://automerge.org/docs/reference/documents/lists/): fine-grained entity/list changes.
- [S10 — Automerge Rust sync protocol](https://automerge.org/automerge/automerge/sync/index.html): reliable in-order stream assumption.
- [S11 — Yjs offline support](https://docs.yjs.dev/getting-started/allowing-offline-editing): browser IndexedDB persistence and provider scope.
- [S12 — Yjs relative positions](https://docs.yjs.dev/api/relative-positions): stable text positions and missing/deleted-target result.
- [S13 — ShareDB introduction](https://share.github.io/sharedb/): Node server/client, OT types, history, and reconnection claims.
- [S14 — ShareDB reconnect example](https://share.github.io/sharedb/getting-started): closed-socket queue behavior.

No raw pages, downloaded code, or executable witnesses are stored. The proposal distinguishes executed source review from future validation; no application, concurrency, durability, UI, or relay test was run.

