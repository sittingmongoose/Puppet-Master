# B-DISC-G-01 — bounded discovery

## Four mechanisms to compare

1. **Operational transformation (OT) behind the relay.** ShareDB documents a server that coordinates and commits edits, advertises offline change syncing and historic versions, and delegates operation transformation to a registered OT type. This fits a relay that is available intermittently if clients can retain pending operations and the chosen type can rebase them against the relay’s accepted order. ShareDB itself does not specify that text transform: its default is `json0`, and a different type must be registered on both client and server. The boundary to probe is a long offline interval containing deletes, adjacent inserts, and undo; the docs establish the feature category, not queue limits or note-text semantics. [S5][S6]

2. **Sequence CRDT with automatic merge.** Automerge’s text API represents strings as collaborative text; its example merges a concurrent insertion with a replacement/deletion, while its conflict guide says concurrent character insertions/deletions are retained and same-position insertions receive a consistent order. Yjs offers another sequence-CRDT implementation: its binary updates can be applied in any order or more than once, and state vectors can request missing changes. These capabilities directly fit offline edits. The costs are retained history and deletion metadata: Automerge describes compact storage that can hold every edit and later compression; Yjs warns that merging update blobs does not garbage-collect deleted content. Yjs says the document must be loaded to reduce size. For Automerge, infrequent whole-text `updateText` calls may merge poorly; prefer per-keystroke updates or explicit splices. Neither retrieved source establishes the desired undo behavior for this product. [S1][S2][S3]

3. **Base-relative three-way text merge (diff3).** Keep the common base and both edited versions. Git’s `merge-file` combines disjoint changes; when both sides touch a common line segment, it emits conflict markers for a person to resolve, with options that can favor one side or union both. This makes “ask on conflict” inspectable and requires no persistent per-character CRDT state. Its boundary is line-oriented overlap: small edits on the same line may be presented together, while a changed or missing base prevents a trustworthy three-way comparison. Marker resolution and later undo are product behavior to define, not guarantees of the command. [S7]

4. **Revision branches with explicit adoption or merge.** Preserve each device’s disconnected revision as a separate child of the shared snapshot; on reconnect, offer both histories for choosing one revision or constructing a new merge revision. Automerge documents a commit history and Git records base/each side for unresolved merges; these are implementation precedents, not proof of a ready-made note workflow. It is explainable and preserves alternatives only while both revisions remain retained, but it puts more decision work on users and makes storage grow with branches. A full-version choice can discard the other side from the visible note unless the losing branch remains accessible. [S3][S7]

## Tradeoffs and implementation leads

| Mechanism | Typical convergence | Retained state and undo | Main boundary |
|---|---|---|---|
| OT / ShareDB | Relay orders and transforms ops | Server versions/history; undo unspecified | Offline queue and text OT type need validation |
| Sequence CRDT / Automerge or Yjs | Deterministic merge without live relay | Operation/update history; deletion cleanup matters; undo unspecified here | Storage growth and same-location semantics |
| Diff3 / Git merge-file | Automatic only for non-overlapping base-relative edits | Base plus two versions; undo is application-defined | Same-line/overlapping edits become manual conflicts |
| Revision branches | Human chooses or merges versions | Keeps alternatives/history until pruned | More user decisions and branch-retention cost |

**Two inspectable implementation leads.** (1) Automerge: its `Text`, `Conflicts`, and `Concepts` docs expose splice behavior, deterministic conflict inspection, repository sync, and history/compression. (2) Yjs: `Document Updates` exposes update/state-vector APIs and the deleted-content cleanup caveat. Inspect the implementation and undo API before assuming its cross-device undo semantics. ShareDB remains the OT example used to ground the shortlist; its text OT type is not selected. [S1][S2][S3][S4][S5][S6]

**Historical/version lead.** The Git `merge-file` manual identifies its behavior as a minimal RCS-merge clone and carries version-history entries from 2.6.7 (2017) through 2.54.0 (2026); the selector reports 2.55.0–2.56.0 without manual changes. Compare the chosen shipped Git/RCS-style algorithm’s behavior on repeated lines and same-line edits before treating diff3 as a stable baseline. No local Git binary was run. [S7]

## Discriminating questions and next step

1. **What does “preserve every edit” mean when one device deletes the character another device edits or anchors an insertion to?** Make a tiny shared base such as `AB`; offline, have one device insert between the characters while the other deletes or replaces `B`; reconnect in both orders. Record visible text, retained alternatives, and whether the result is identical.
2. **What must undo mean after synchronization?** Have A insert a phrase, B add a separate phrase, sync, then A undo once. Decide whether only A’s insertion should disappear, whether B’s text must survive, and whether redo remains meaningful after another remote edit. No retrieved project page settles this product policy.
3. **What recovery window and storage ceiling matter?** On a 20 KB note, repeatedly edit and delete offline, then sync a client that has been absent for a long interval. Measure persisted bytes before/after compaction and verify that the stale client still converges. This distinguishes compacted current state from retained causal/history data.

No implementation, package, or local probe was run. These are proposed tests, not executed checks. Unresolved evidence includes cross-device undo, exact deletion/compaction behavior for the chosen release, and real retained-byte growth under the product’s edit pattern. Next, prototype the three operation traces above against Automerge and one alternative (Yjs or a selected ShareDB text OT type), then ask the product owner to choose automatic preservation versus explicit conflict review before selecting a default. No universal winner follows from this brief.

## Sources

See [`source-map.json`](source-map.json) for source locators, versions, conditions, applicability, retrieval method, and executed versus proposed checks. Saved bounded notes are in [`sources/evidence.md`](sources/evidence.md).
