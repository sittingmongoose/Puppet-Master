# Discovery: offline two-user plain-text convergence (ER12-B-DISC-G-01)

Case: ER12-B-DISC-G-01-FRESH. Scope: conflict/convergence for one plain-text note (at most 20 KB) on two intermittently connected devices, incl. retained-history costs and undo; excludes rich text, permissions, networking, UI. Evidence: five primary pages, four publishers (Yjs, ShareDB, Fraser, GNU); details in source-map.json. [S#] = source record; (inference) = my conclusion, not a source statement.

## Shortlist (mechanism-diverse)

1. CRDT text with automatic merge (Yjs-style). Each replica holds the full CRDT; Yjs "exposes its internal CRDT model as shared data types", changes "automatically merge without merge conflicts", and "the order in which document updates are applied doesn't matter" [S1]. No central server is needed for conflict resolution [S1], so it is the direct fit for "preserve every edit automatically". History cost: CRDT metadata and deleted-character markers accumulate until compacted; small in absolute terms at 20 KB but unbounded relative to note size without a compaction policy (inference; exact overhead not measured here). Undo: Yjs ships a selective UndoManager pushing reverse operations onto undo/redo stacks, scoped by trackedOrigins and merged within a captureTimeout of 500 ms by default [S5]; per-device undo stays explainable, while undo-after-remote-edits needs product rules (inference). Failure boundary: metadata growth without compaction, and same-position concurrent inserts that interleave deterministically but surprisingly (inference).

2. Operational Transformation with a coordinating server (ShareDB-style). Clients submit operations while a Node server coordinates and commits edits, with conflict management "handled through Operational Transformation (OT)" [S2]. Documented: offline change syncing upon reconnection and access to historic document versions [S2]. History cost: the retained operation log plus snapshots or versions, growing with edit volume (inference). Undo: classically an inverse operation transformed against everything committed after it, which may not restore exact prior text after remote edits (inference; undo semantics are not covered on the fetched page). Failure boundary: commit ordering needs a reachable coordinator, so long relay blackouts widen the queued-operation window; event-passing systems are "not naturally convergent" [S3], and "one lost edit may cause subsequent edits to be applied incorrectly" [S3].

3. Differential synchronization with shadow copies (Fraser 2009). Each side diffs its live text against a Common Shadow, exchanges patches, then copies live text over the shadow, repeating symmetrically [S3]; it targets "responsive collaborative editing across an unreliable network" [S3]. History cost: roughly two extra full-text copies (the shadow pair) per sync relationship plus in-flight diffs, trivial at 20 KB (inference from the shadow mechanism). Undo: no special undo object exists; undo is just another edit round, which is simple but loses "this was an undo" information (inference). Failure boundary: overlapping concurrent edits to the same region depend on patch-application heuristics and can misplace text, and cycles assume the devices eventually reconnect (inference).

4. Three-way merge on reconnect with user-resolved conflicts (diff3-style). Retain the last common base plus both edited versions; merge non-overlapping changes automatically and mark overlaps with conflict markers ("<<<<<<<" / ">>>>>>>" lines) for the user to resolve [S4]. This directly implements "ask for conflict resolution". History cost: base plus two tips (about 3x note size, trivial at 20 KB) plus whatever version chain is kept (inference). Undo: coarse revert-to-version unless an edit log is added (inference). Failure boundary: any same-region overlap escalates to the user, and merge-based sync is half-duplex: "as long as one is typing, no changes are arriving" [S3]; textually clean merges can still be semantically wrong (inference).

## Implementation leads (inspectable)

A. Yjs (docs.yjs.dev; the docs name the Yjs README and yjs-demos repository as the best sources [S1]). Inspect Y.Text update encoding/merge and UndoManager options; network-agnostic providers suit an intermittent relay (inference).

B. ShareDB (share.github.io/sharedb; GitHub share/sharedb linked from the docs [S2]). Inspect OT type plugins, offline sync on reconnect, and the document-history API.

## Historical/version lead

C. GNU diffutils three-way-merge lineage: "Comparing and Merging Files" for Diffutils 3.12 (12 January 2025), FSF copyright 1992-2025, covering diff, diff3, sdiff, cmp, and patch [S4]. diff3 merge/marker semantics have been stable for decades: a fixed, reviewable contract (inference).

## Tradeoff comparison

| Mechanism | Offline behavior | History (20KB) | Undo | Conflict UX | Characteristic failure |
|---|---|---|---|---|---|
| CRDT (Yjs) | Full local editing; merge on contact | Metadata + deleted markers; needs compaction | Selective, origin-scoped reverse ops | None (automatic) | Metadata growth; surprising interleave |
| OT (ShareDB) | Queue ops; server commits | Op log + versions; grows with edits | Inverse op; fragile after remote edits | Rare (server orders) | Coordinator dependence; fork on lost op |
| Diffsync | Edit freely; shadow cycles on contact | Shadows, ~2x text | Undo-as-edit; no undo identity | None (patch decides) | Same-region overlap misplacement |
| 3-way merge | Edit freely; merge on reconnect | Base+tips, ~3x text | Coarse revert | User resolves overlaps | Overlap always escalates; half-duplex |

## Discriminating questions and prospective tests

T1. Same-offset insert test: both devices insert different words at offset 0 while offline, then reconnect. Each mechanism resolves it differently (interleave, commit order, patch, conflict flag). Which outcome is explainable in one sentence? Decides auto-merge vs ask-user.

T2. Undo-after-remote-edit test: A deletes a sentence while B inserts inside it, then A undoes. Record the surviving text per mechanism. Decides undo scope rules.

T3. Blackout soak: seven days of dual-side offline edits; measure retained-history bytes per mechanism against the 20 KB note. Decides retention and compaction policy.

## Capabilities versus product choices

Auto-merge (options 1-3) vs surface-overlaps (option 4), undo granularity (keystroke/word/checkpoint), and retention length are product choices; no mechanism removes them (inference).

## Uncertainty and next step

Unresolved: measured history bytes per mechanism; Yjs compaction (not on fetched pages); OT undo exactness here. Next step: run T1-T3 against Yjs and a diff-match-patch diffsync sketch within one day, then fix retention/undo rules. No universal winner inferred; the tests select.
