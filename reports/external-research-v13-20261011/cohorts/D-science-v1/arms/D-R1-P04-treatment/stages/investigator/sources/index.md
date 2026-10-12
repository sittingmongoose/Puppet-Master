# Source index — D-R1-P04-treatment investigator

Use this index to navigate stable source IDs. Each linked record's exact version/commit, locator, access timestamp, observed operation, governing condition, and applicability are preserved in [`source-map.json`](../source-map.json). Source IDs are immutable here; a new source version needs a new ID rather than silently changing a URL or pin.

## Candidate mechanisms

- Loro Rust tree API, version 1.16.2: [`LORO-RUST-TREE-1.16.2`](https://docs.rs/loro/1.16.2/loro/struct.LoroTree.html)
- Loro tree tutorial: [`LORO-TREE-DOC-CURRENT`](https://www.loro.dev/docs/tutorial/tree)
- Loro maintainer’s movable-tree analysis: [`LORO-MOVABLE-TREE-ARTICLE-2024`](https://www.loro.dev/blog/movable-tree)
- Loro JS release history, 1.16.4/commit 45708d0: [`LORO-RELEASE-JS-1.16.4`](https://github.com/loro-dev/loro/releases)
- Automerge Rust crate, version 0.12.0: [`AUTOMERGE-RUST-0.12`](https://docs.rs/automerge/latest/automerge/)
- Automerge data model: [`AUTOMERGE-DATA-CURRENT`](https://automerge.org/docs/reference/documents/)
- Automerge conflicts: [`AUTOMERGE-CONFLICT-CURRENT`](https://automerge.org/docs/reference/documents/conflicts/)
- Automerge map/list merge rules: [`AUTOMERGE-MAP-MERGE-CURRENT`](https://automerge.org/docs/reference/under-the-hood/merge-rules/)
- Automerge history/retention: [`AUTOMERGE-HISTORY-MODEL-CURRENT`](https://automerge.org/docs/cookbook/modeling-data/)
- Yjs relative positions: [`YJS-RELATIVE-POSITION-CURRENT`](https://docs.yjs.dev/api/relative-positions)
- Yjs tombstone/GC internals: [`YJS-GC-INTERNALS-MAIN`](https://github.com/yjs/yjs/blob/main/INTERNALS.md)
- Yrs Rust StickyIndex API, version 0.28.0: [`YRS-STICKY-INDEX-0.28`](https://docs.rs/yrs/latest/yrs/struct.StickyIndex.html)
- Yrs GC/offset defaults, version 0.28.0: [`YRS-DOC-OPTIONS-0.28`](https://docs.rs/yrs/latest/yrs/doc/struct.Options.html)
- Yrs repository callers and test surfaces: [`YCRDT-REPO-CALLERS-MAIN`](https://github.com/y-crdt/y-crdt)

## Public issue and regression history

- Yrs 0.25.0 nested delete-set failure: [`YRS-DELETE-SET-ISSUE-607`](https://github.com/y-crdt/y-crdt/issues/607)
- Merged fix and regression tests, commit 48b1a7b: [`YRS-DELETE-SET-PR-614`](https://github.com/y-crdt/y-crdt/pull/614/files)
- Yjs relative-position/undo issue; fixed per maintainer in 13.6.21: [`YJS-RELATIVE-UNDO-ISSUE-657`](https://github.com/yjs/yjs/issues/657)
- pycrdt wrapper UTF-16 StickyIndex issue: [`PYCRDT-STICKY-UTF16-ISSUE-382`](https://github.com/y-crdt/pycrdt/issues/382)

## Evidence limits

All source material was read as web documentation, upstream release/issue pages, or repository API/reference pages. No downloaded snippet was executed; no local merge experiments, permission validation, usability study, or live-collaboration test was performed. Regression reproductions were inspected but not run. Product tests proposed in `draft.md` remain proposals.
