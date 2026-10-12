# Critic source index — D-R1-P04-control

All entries below retain the investigator’s R identifiers and original URLs. C01 and C02 are separate critic-only sources; they do not replace an R identifier. Access batch completed 2026-10-12 04:34 UTC. Sources were inspected as research data; no downloaded code was run and no source-page copies were retained.

| ID | Source | Critic use |
|---|---|---|
| R01 | [W3C Web Annotation Data Model](https://www.w3.org/TR/annotation-model/) | Confirms body/target/selector interchange scope and that the data model does not prescribe synchronization. |
| R03 | [Loro JavaScript API](https://loro.dev/docs/api/js) | Checks TreeID, deleted-state query, concurrent move and ordering caveats. |
| R04 | [Loro Tree tutorial](https://loro.dev/docs/tutorial/tree) | Checks causal tree diffs, subtree-delete event, and fractional-index caveat. |
| R05 | [Loro shallow snapshots](https://loro.dev/docs/concepts/shallow_snapshots) | Checks history trimming, redaction, sync cutoff and archive implications. |
| R06 | [Y.Doc API](https://docs.yjs.dev/api/y.doc) | Checks the GC control and avoids inferring an undocumented default. |
| R07 | [Yjs internal model notes](https://github.com/yjs/yjs/blob/main/INTERNALS.md) | Checks deletion metadata and conditional content collection. |
| R10 | [Automerge conflict documentation](https://automerge.org/docs/reference/documents/conflicts/) | Checks conflict alternatives and operation-ID winner ordering. |
| R11 | [Automerge merge rules](https://automerge.org/docs/reference/under-the-hood/merge-rules/) | Checks concurrent map delete/set and list element-ID rules. |
| R12 | [Automerge Repo storage](https://automerge.org/docs/reference/under-the-hood/storage/) | Checks snapshot/incremental persistence and concurrent compaction behavior. |
| R13 | [Automerge glossary](https://automerge.org/docs/reference/glossary/) | Checks history compaction and common-ancestor sync limitation. |
| R15 | [Excalidraw reconcileElements](https://github.com/excalidraw/excalidraw/blob/master/packages/excalidraw/data/reconcile.ts) | Checks current ID/version/nonce selection, unmatched local retention and index repair. |
| R16 | [Excalidraw collaboration caller](https://github.com/excalidraw/excalidraw/blob/master/excalidraw-app/collab/Collab.tsx) | Checks the reconciliation caller, deleted records and version bump flow. |
| R17 | [Excalidraw issue 3795](https://github.com/excalidraw/excalidraw/issues/3795) | Confirms closed issue and reported import ID/version regression; patch not reviewed. |
| R18 | [Excalidraw issue 11933](https://github.com/excalidraw/excalidraw/issues/11933) | Confirms open reporter status and reported remote index-healing regression; not executed. |
| C01 | [Excalidraw reconciliation tests](https://github.com/excalidraw/excalidraw/blob/master/packages/excalidraw/tests/data/reconcile.test.ts) | Identifies existing merge/order/convergence tests and the gap in comment-anchor semantics. |
| C02 | [Loro issue 938](https://github.com/loro-dev/loro/issues/938) | Supplemental unverified report about redo and a recreated TreeID; not treated as confirmed behavior. |

The carried entries R02 (Loro release notes), R08 (Yjs releases), and R14 (Automerge release blog) were not independently reopened in this critic stage. Their identities remain unchanged in the investigator source map and are not used to support a new critic finding.
