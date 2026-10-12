# Source index — D-R1-P04-treatment critic

This index preserves the investigator source IDs and adds separately named critic verification records. Full URL, version/commit, locator, access UTC, observed operation, governing condition/default/exception, and applicability are in source-map.json. Investigator records were carried without rebinding; every critic recheck names its carried ID in rechecks_source_id.

## Candidate mechanisms and governing behavior

- LORO-RUST-TREE-1.16.2 — [https://docs.rs/loro/1.16.2/loro/struct.LoroTree.html](https://docs.rs/loro/1.16.2/loro/struct.LoroTree.html)
- LORO-TREE-DOC-CURRENT — [https://www.loro.dev/docs/tutorial/tree](https://www.loro.dev/docs/tutorial/tree)
- LORO-MOVABLE-TREE-ARTICLE-2024 — [https://www.loro.dev/blog/movable-tree](https://www.loro.dev/blog/movable-tree)
- LORO-RELEASE-JS-1.16.4 — [https://github.com/loro-dev/loro/releases](https://github.com/loro-dev/loro/releases)
- AUTOMERGE-RUST-0.12 — [https://docs.rs/automerge/latest/automerge/](https://docs.rs/automerge/latest/automerge/)
- AUTOMERGE-DATA-CURRENT — [https://automerge.org/docs/reference/documents/](https://automerge.org/docs/reference/documents/)
- AUTOMERGE-CONFLICT-CURRENT — [https://automerge.org/docs/reference/documents/conflicts/](https://automerge.org/docs/reference/documents/conflicts/)
- AUTOMERGE-MAP-MERGE-CURRENT — [https://automerge.org/docs/reference/under-the-hood/merge-rules/](https://automerge.org/docs/reference/under-the-hood/merge-rules/)
- AUTOMERGE-HISTORY-MODEL-CURRENT — [https://automerge.org/docs/cookbook/modeling-data/](https://automerge.org/docs/cookbook/modeling-data/)
- YJS-RELATIVE-POSITION-CURRENT — [https://docs.yjs.dev/api/relative-positions](https://docs.yjs.dev/api/relative-positions)
- YJS-GC-INTERNALS-MAIN — [https://github.com/yjs/yjs/blob/main/INTERNALS.md](https://github.com/yjs/yjs/blob/main/INTERNALS.md)
- YRS-STICKY-INDEX-0.28 — [https://docs.rs/yrs/latest/yrs/struct.StickyIndex.html](https://docs.rs/yrs/latest/yrs/struct.StickyIndex.html)
- YRS-DOC-OPTIONS-0.28 — [https://docs.rs/yrs/latest/yrs/doc/struct.Options.html](https://docs.rs/yrs/latest/yrs/doc/struct.Options.html)
- YRS-DELETE-SET-ISSUE-607 — [https://github.com/y-crdt/y-crdt/issues/607](https://github.com/y-crdt/y-crdt/issues/607)
- YRS-DELETE-SET-PR-614 — [https://github.com/y-crdt/y-crdt/pull/614/files](https://github.com/y-crdt/y-crdt/pull/614/files)
- YJS-RELATIVE-UNDO-ISSUE-657 — [https://github.com/yjs/yjs/issues/657](https://github.com/yjs/yjs/issues/657)
- PYCRDT-STICKY-UTF16-ISSUE-382 — [https://github.com/y-crdt/pycrdt/issues/382](https://github.com/y-crdt/pycrdt/issues/382)
- YCRDT-REPO-CALLERS-MAIN — [https://github.com/y-crdt/y-crdt](https://github.com/y-crdt/y-crdt)

## Critic primary-source checks

- CRITIC-LORO-RUST-TREE-1.16.2 rechecks LORO-RUST-TREE-1.16.2 — [https://docs.rs/loro/1.16.2/loro/struct.LoroTree.html](https://docs.rs/loro/1.16.2/loro/struct.LoroTree.html)
- CRITIC-LORO-MOVABLE-TREE-ARTICLE-2024 rechecks LORO-MOVABLE-TREE-ARTICLE-2024 — [https://www.loro.dev/blog/movable-tree](https://www.loro.dev/blog/movable-tree)
- CRITIC-LORO-RELEASE-JS-1.16.4 rechecks LORO-RELEASE-JS-1.16.4 — [https://github.com/loro-dev/loro/releases](https://github.com/loro-dev/loro/releases)
- CRITIC-AUTOMERGE-CONFLICT-CURRENT rechecks AUTOMERGE-CONFLICT-CURRENT — [https://automerge.org/docs/reference/documents/conflicts/](https://automerge.org/docs/reference/documents/conflicts/)
- CRITIC-AUTOMERGE-MAP-MERGE-CURRENT rechecks AUTOMERGE-MAP-MERGE-CURRENT — [https://automerge.org/docs/reference/under-the-hood/merge-rules/](https://automerge.org/docs/reference/under-the-hood/merge-rules/)
- CRITIC-AUTOMERGE-HISTORY-MODEL-CURRENT rechecks AUTOMERGE-HISTORY-MODEL-CURRENT — [https://automerge.org/docs/cookbook/modeling-data/](https://automerge.org/docs/cookbook/modeling-data/)
- CRITIC-YRS-STICKY-INDEX-0.28 rechecks YRS-STICKY-INDEX-0.28 — [https://docs.rs/yrs/latest/yrs/struct.StickyIndex.html](https://docs.rs/yrs/latest/yrs/struct.StickyIndex.html)
- CRITIC-YRS-DOC-OPTIONS-0.28 rechecks YRS-DOC-OPTIONS-0.28 — [https://docs.rs/yrs/latest/yrs/doc/struct.Options.html](https://docs.rs/yrs/latest/yrs/doc/struct.Options.html)
- CRITIC-YJS-RELATIVE-POSITION-CURRENT rechecks YJS-RELATIVE-POSITION-CURRENT — [https://docs.yjs.dev/api/relative-positions](https://docs.yjs.dev/api/relative-positions)
- CRITIC-YJS-GC-INTERNALS-MAIN rechecks YJS-GC-INTERNALS-MAIN — [https://github.com/yjs/yjs/blob/main/INTERNALS.md](https://github.com/yjs/yjs/blob/main/INTERNALS.md)
- CRITIC-YRS-DELETE-SET-ISSUE-607 rechecks YRS-DELETE-SET-ISSUE-607 — [https://github.com/y-crdt/y-crdt/issues/607](https://github.com/y-crdt/y-crdt/issues/607)
- CRITIC-YRS-DELETE-SET-PR-614 rechecks YRS-DELETE-SET-PR-614 — [https://github.com/y-crdt/y-crdt/pull/614](https://github.com/y-crdt/y-crdt/pull/614)
- CRITIC-YJS-RELATIVE-UNDO-ISSUE-657 rechecks YJS-RELATIVE-UNDO-ISSUE-657 — [https://github.com/yjs/yjs/issues/657](https://github.com/yjs/yjs/issues/657)
- CRITIC-PYCRDT-STICKY-UTF16-ISSUE-382 rechecks PYCRDT-STICKY-UTF16-ISSUE-382 — [https://github.com/y-crdt/pycrdt/issues/382](https://github.com/y-crdt/pycrdt/issues/382)

## Evidence boundary

Source pages, upstream issue histories, and a regression-test diff were inspected. No downloaded code, test, merge experiment, build, live collaboration, permission validation, account, or usability study was run. Proposed component checks in final.md are not results.
