# Reviser source index — D-R1-P04-control

This index points to the complete identity records in `../source-map.json`. IDs are carried without rebinding: R01–R18 originate in the investigator map; C01/C02 are critic-only sources. The reviser directly inspected C01 and the current Excalidraw reconciler; see `reviser_rechecks` in the JSON map for access UTC, mutable revision limit, locator, conditions, and observed operation. No full page copies or downloaded code are retained.

| ID | Source | Use in final |
|---|---|---|
| R01 | [W3C Web Annotation Data Model](https://www.w3.org/TR/annotation-model/) | Portable body/target/selector/state vocabulary; does not define mutable-layout selector migration or sync. |
| R02 | [Loro 1.0.0 release notes](https://loro.dev/changelog/v1.0.0-beta) | Maintained alternative/version context; not a product-policy guarantee. |
| R03 | [Loro JS API](https://loro.dev/docs/api/js) | Tree IDs, moves/deletes, concurrent-move and fractional-order caveats. |
| R04 | [Loro Tree tutorial](https://loro.dev/docs/tutorial/tree) | Causal tree events and subtree delete context. |
| R05 | [Loro shallow snapshots](https://loro.dev/docs/concepts/shallow_snapshots) | History trim, redaction, sync cutoff, and archive tradeoffs. |
| R06 | [Y.Doc API](https://docs.yjs.dev/api/y.doc) | Conditional garbage-collection control; inspected page does not establish a default. |
| R07 | [Yjs internal model notes](https://github.com/yjs/yjs/blob/main/INTERNALS.md) | Delete metadata and conditional collection; mutable `main`. |
| R08 | [Yjs releases](https://github.com/yjs/yjs/releases) | Stable v13 and v14 prerelease context at carried access. |
| R09 | [Yjs issue #741](https://github.com/yjs/yjs/issues/741) | Unverified deletion-heavy memory report; not a general benchmark. |
| R10 | [Automerge conflicts](https://automerge.org/docs/reference/documents/conflicts/) | Concurrent alternatives and deterministic operation-ID winner. |
| R11 | [Automerge merge rules](https://automerge.org/docs/reference/under-the-hood/merge-rules/) | Map/list convergence rules; not a deliberate product restore policy. |
| R12 | [Automerge Repo storage](https://automerge.org/docs/reference/under-the-hood/storage/) | Incremental storage and snapshot compaction behavior. |
| R13 | [Automerge glossary](https://automerge.org/docs/reference/glossary/) | History compaction, stale replica/common-ancestor limit. |
| R14 | [Automerge project blog](https://automerge.org/blog/) | Maintainer release context; not a pinned dependency evaluation. |
| R15 | [Excalidraw `reconcile.ts` on mutable master](https://github.com/excalidraw/excalidraw/blob/master/packages/excalidraw/data/reconcile.ts) | ID/version/nonce record selection, unmatched-local retention, ordering/repair; bounded comparison. |
| R16 | [Excalidraw collaboration caller on mutable master](https://github.com/excalidraw/excalidraw/blob/master/excalidraw-app/collab/Collab.tsx) | Caller post-processing and deleted-record flow; no comment intent model. |
| R17 | [Excalidraw issue #3795](https://github.com/excalidraw/excalidraw/issues/3795) | Closed import/version regression report; linked patch not reviewed. |
| R18 | [Excalidraw issue #11933](https://github.com/excalidraw/excalidraw/issues/11933) | Open reporter claim about remote index repair/version; unverified. |
| C01 | [Excalidraw reconciliation tests on mutable master](https://github.com/excalidraw/excalidraw/blob/master/packages/excalidraw/tests/data/reconcile.test.ts) | Directly inspected: selection, indices, swapped-input/repeated reconciliation, identical records; no comment-anchor intent. Not run. |
| C02 | [Loro issue #938](https://github.com/loro-dev/loro/issues/938) | Unverified redo/TreeID report; supports explicit application restore semantics only as a caution. |
