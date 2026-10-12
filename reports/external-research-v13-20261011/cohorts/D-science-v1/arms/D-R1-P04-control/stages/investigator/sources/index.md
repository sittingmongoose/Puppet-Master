# Sources index — D-R1-P04-control investigator

Primary research retrieval batch completed 2026-10-12T04:22:44Z. Records in `../source-map.json` preserve exact URLs, version/commit limits, locator, observed behavior, conditions, and applicability. This index contains brief paraphrases only; external pages remain the source of truth.

| ID | Source | Use |
|---|---|---|
| R01 | [Web Annotation Data Model (W3C Recommendation)](https://www.w3.org/TR/annotation-model/) | Useful export/interchange structure for review thread body, target, selected region, and captured state; insufficient by itself for stable object identity or offline reconciliation. |
| R02 | [Loro v1.0.0 release notes](https://loro.dev/changelog/v1.0.0-beta) | A maintained alternative worth evaluating for movable hierarchical grouping and history, without selecting it for the proposed component. |
| R03 | [Loro JavaScript API Reference](https://loro.dev/docs/api/js) | Potential layout operation substrate; preserve a separate application object UUID and comment lineage, and test group/delete semantics against the selected version. |
| R04 | [Loro Tree tutorial](https://loro.dev/docs/tutorial/tree) | Useful for grouping/ungrouping event interpretation, but group membership alone cannot determine whether a thread should move to a group or remain on its original child. |
| R05 | [Loro shallow snapshots](https://loro.dev/docs/concepts/shallow_snapshots) | Demonstrates that history retention, storage growth, sync cutoffs, and privacy are coupled decisions; keep compact comment-context snapshots separately and disclose retention/archives. |
| R06 | [Y.Doc API](https://docs.yjs.dev/api/y.doc) | If comments or anchor evidence are stored inside a Y.Doc, garbage-collection settings directly affect whether deleted target context survives; keep required review history in a separately governed structure. |
| R07 | [Yjs internal model notes](https://github.com/yjs/yjs/blob/main/INTERNALS.md) | Do not expect library tombstones alone to explain a review thread. Record app-level deletion actor/time/frontier/meaning only if policy and privacy permit, and keep comment records independent of GC-pruned content. |
| R08 | [Yjs releases](https://github.com/yjs/yjs/releases) | Use as version context for Yjs evidence; do not build a behavior claim from a stale v13.6.27 issue alone. |
| R09 | [Yjs issue #741: tombstone memory report](https://github.com/yjs/yjs/issues/741) | Treat retained deletion context as a measurable storage/memory risk and benchmark synthetic history volume; do not assume tombstones are free. |
| R10 | [Automerge conflict documentation](https://automerge.org/docs/reference/documents/conflicts/) | Preserve conflict alternatives and provenance for consequential anchor resolution; do not convert a mechanical winner into silent reattachment. |
| R11 | [Automerge merge rules](https://automerge.org/docs/reference/under-the-hood/merge-rules/) | Keep “layout replica convergence” separate from “review intent”; use application-level deletion/tombstone state and explicit undo/restore events. |
| R12 | [Automerge repository storage](https://automerge.org/docs/reference/under-the-hood/storage/) | A useful storage option, but application-level tombstones, anchor context, and export retention still need a bounded policy. |
| R13 | [Automerge glossary: history compaction](https://automerge.org/docs/reference/glossary/) | Retention/privacy decisions must specify replica cutover, archive policy, and behavior for stale offline peers. |
| R14 | [Automerge project blog/current releases](https://automerge.org/blog/) | Evidence that maintained collaboration mechanisms include a core CRDT plus optional repository layer; compare both layers and their operational responsibilities. |
| R15 | [Excalidraw reconcileElements implementation](https://github.com/excalidraw/excalidraw/blob/master/packages/excalidraw/data/reconcile.ts) | Concrete whiteboard caller/test surface to study; use as comparative behavior and regression-test inspiration, not as the proposal’s selected merge engine. |
| R16 | [Excalidraw collaboration caller](https://github.com/excalidraw/excalidraw/blob/master/excalidraw-app/collab/Collab.tsx) | Shows deletion/tombstone state and caller post-processing are part of reconciliation, so a component must define its persistence and caller contract. |
| R17 | [Excalidraw issue #3795: import resets ID/version](https://github.com/excalidraw/excalidraw/issues/3795) | Strong regression-test precedent: imported/recreated data must not make an old object appear current or silently defeat a delete; identical appearance does not establish identity. |
| R18 | [Excalidraw issue #11933: remote index healing/version report](https://github.com/excalidraw/excalidraw/issues/11933) | Treat as an integration hazard to test at the remote repair boundary, not a verified defect or a reason to reject the upstream library. |

No full webpage copies or downloaded code were retained. Issue reports are explicitly distinguished from maintainer-verified behavior in the source map.
