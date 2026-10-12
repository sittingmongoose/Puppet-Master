# Critic source index — B11-P02-control

This index preserves the investigator’s stable source IDs and exact source-map identities. The critic opened the primary references below on 2026-10-12; conditions, locators, versions and applicability remain recorded in `../source-map.json`. No raw captures or executable code are stored here.

## Loro

- [S01 — List and MovableList](https://loro.dev/docs/tutorial/list): native move, deterministic concurrent move result, overhead; living docs with JS/WASM examples.
- [S02 — Cursor and stable positions](https://loro.dev/docs/tutorial/cursor): durable sequence/text locations, deletion replay and JS UTF-16 condition.
- [S03 — Sync](https://loro.dev/docs/tutorial/sync): same-update convergence, hidden regular child containers, import pending ranges.
- [S04 — Rust LoroDoc API, crate 1.16.2](https://docs.rs/loro/1.16.2/loro/struct.LoroDoc.html): containers, frontiers, import/export, storage boundary. Critic opened [docs.rs latest](https://docs.rs/loro/latest/loro/struct.LoroDoc.html), which reported loro 1.16.2; see source-map note.
- [S05 — PeerID management](https://loro.dev/docs/concepts/peerid_management): session IDs and safe reuse conditions.
- [S06 — Upstream release history](https://github.com/loro-dev/loro/releases): JS/WASM release version and package-specific fixes.
- [S07 — Issue #957](https://github.com/loro-dev/loro/issues/957), plus [PR #958](https://github.com/loro-dev/loro/pull/958): adapter-specific import lock-order report and fix.

## Alternatives

- [S08 — Automerge conflict semantics](https://automerge.org/docs/reference/documents/conflicts/): deterministic winner, inspectable alternatives, assignment clears conflict.
- [S09 — Automerge list/model guidance](https://automerge.org/docs/reference/documents/lists/): fine-grained list/entity updates.
- [S10 — Automerge Rust sync protocol](https://automerge.org/automerge/automerge/sync/index.html): reliable in-order stream assumption.
- [S11 — Yjs offline support](https://docs.yjs.dev/getting-started/allowing-offline-editing): IndexedDB browser provider and native-provider caveat.
- [S12 — Yjs relative positions](https://docs.yjs.dev/api/relative-positions): stable text locations and null resolution for deleted targets.
- [S13 — ShareDB introduction](https://share.github.io/sharedb/): Node server, OT plugins, database/history/offline features.
- [S14 — ShareDB reconnect example](https://share.github.io/sharedb/getting-started): reconnecting WebSocket disables closed-socket buffering.

## Use

See `../source-map.json` for source identities, release/version context, exact locators, access records, governing conditions, and applicability. Research supports a proposal only; no application witness was run.
