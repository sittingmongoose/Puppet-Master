# Sources index

Bounded source notes for the investigator stage. The machine-readable identity records are in [source-map.json](../source-map.json). Notes are paraphrases and locators, not full page copies. Access timestamps below are UTC. Source IDs are stable for this stage and must not be silently rebound.

## Automerge Rust core and data model
### S01 — Automerge Rust core API
- Source: [primary page](https://docs.rs/automerge/0.12.0/automerge/struct.Automerge.html)
- Version/identity: Rust crate automerge 0.12.0; docs.rs versioned page. Source commit not inspected.
- Accessed: 2026-10-12T01:04:02Z
- Locator: Automerge methods: apply_changes, save, get_heads, set_author; current crate page identifies 0.12.0.
- Observed behavior: apply_changes is idempotent for already-applied changes. save serializes the entirety of a document in compact form. An Author must be set; otherwise Change::author is None.
- Condition and applicability: Idempotence applies to replaying identical changes. A missing author is allowed by default. save is a full-document save, not a transport or durable-write guarantee. Directly applicable to a Rust+Slint client as the document core. The app still owns local crash-safe persistence, relay authentication, and mapping authenticated crew identities to author metadata.

### S02 — Automerge Rust ReadDoc conflict and history API
- Source: [primary page](https://docs.rs/automerge/0.12.0/automerge/trait.ReadDoc.html)
- Version/identity: Rust crate automerge 0.12.0.
- Accessed: 2026-10-12T01:07:04Z
- Locator: get_all/get_all_at at trait methods; *_at description and get_cursor methods.
- Observed behavior: get_all returns all values and operation IDs for a property; get_all_at and other *_at methods read a historical state at ChangeHash heads. get_cursor creates a stable address within a list or text sequence; movement policy handles a referenced item later being removed.
- Condition and applicability: Historical reads need the chosen head set. A cursor addresses a sequence position, not a cue entity; if its referenced item is removed, the MoveCursor policy matters. Use get_all for field-level conflict candidates and *_at for approved revision materialization. Cue-level comments should still store cue_id; cursors are only a possible optional text-range anchor.

### S03 — Automerge Rust sync protocol
- Source: [primary page](https://docs.rs/automerge/0.12.0/automerge/sync/index.html)
- Version/identity: Rust crate automerge 0.12.0.
- Accessed: 2026-10-12T01:04:02Z
- Locator: Sync Protocol opening and example loop.
- Observed behavior: Each peer maintains a State per peer. The initiator generates the first message, the receiver applies it and generates a reply, and peers exchange messages until neither generates another.
- Condition and applicability: The documented protocol assumes a reliable in-order stream. This is a protocol requirement; after possible loss, the prior state is unsafe to reuse without recovery. A WebSocket/TCP relay can provide ordered delivery within a connection, but the app must detect disconnect uncertainty and reset/reconcile session state. The reference loop is guidance, not a tested relay.

### S04 — Automerge Rust sync State
- Source: [primary page](https://docs.rs/automerge/0.12.0/automerge/sync/struct.State.html)
- Version/identity: Rust crate automerge 0.12.0.
- Accessed: 2026-10-12T01:06:27Z
- Locator: State::encode/decode, new_read_only, read_only and set_read_only descriptions.
- Observed behavior: State can be encoded and decoded for reuse with the same peer. A read-only State ignores incoming changes while continuing to send its local changes.
- Condition and applicability: Read-only is directional protocol behavior, not a data-store ACL. Persist state only while the peer/session relationship remains valid; if a message could have been lost, issue #1284 and the maintainer require reset. Can help construct a publish-only client/relay path, but approval records and relay authorization must be separately enforced.

### S05 — Rust sync lost-message issue #1284
- Source: [primary page](https://github.com/automerge/automerge/issues/1284)
- Version/identity: Issue opened 2026-02-13; no target crate version named in the issue. Open, no assignee or linked fix/PR visible at 2026-10-12T01:05:53Z.
- Accessed: 2026-10-12T01:05:53Z
- Locator: Issue reproduction steps for offline-generated message and reconnect (lines 243–268); maintainer reply (lines 273–284).
- Observed behavior: Reporter demonstrates that generating then dropping an unsent sync message before an offline conflicting edit can make reconnect synchronization loop indefinitely; keeping the exact unsent message avoids that reproduction. Maintainer says the protocol requires reliable in-order delivery and sync state must be reset if a message may have been dropped.
- Condition and applicability: The issue is open; it is not evidence that every release fails or that JavaScript has the same behavior. The maintainer explains the required recovery contract but does not supply an application relay implementation. Direct Rust reconnect risk. Persist local document first; on uncertain disconnect reset/rebuild sync State or preserve the exact in-flight message/state pair; test the reproduction against the selected crate and adapter.

### S06 — Automerge conflict behavior (language-neutral behavior described in JS docs)
- Source: [primary page](https://automerge.org/docs/reference/documents/conflicts/)
- Version/identity: Unversioned current project documentation, accessed 2026-10-12. Rust API cross-check is S02 (0.12.0).
- Accessed: 2026-10-12T01:04:02Z
- Locator: Concurrent map assignment example and explanation of getConflicts / multi-value register.
- Observed behavior: Independent edits to different fields combine. Concurrent writes to one property expose a deterministic visible winner and retain all values for a conflict query. Winner ordering is operation-ID based, not wall-clock latest.
- Condition and applicability: This page uses the JavaScript getConflicts name and is not Rust API syntax; Rust get_all is documented separately. A later causally dependent assignment resolves the prior property conflict. Supports a human decision panel for same-field candidates, provided Rust UI uses get_all and explicitly records a user resolution rather than presenting the deterministic winner as approval.

### S07 — Automerge collaborative text behavior
- Source: [primary page](https://automerge.org/docs/reference/documents/text/)
- Version/identity: Unversioned current project documentation; code examples are JavaScript.
- Accessed: 2026-10-12T01:06:27Z
- Locator: Collaborative text editing, splice/updateText, frequency caveat.
- Observed behavior: Collaborative strings are text sequences. Fine-grained splice edits merge concurrently; updateText can derive changes from a full input value but works best when called frequently, while less frequent whole-value diffs may merge poorly.
- Condition and applicability: This is a JavaScript UI guide. The native Rust text transaction/update methods and Slint event mapping must be confirmed before implementation. Cue notes/comments need actual text operations, not blind whole-value replacements. Even a converged text sequence may need a human readability review for overlapping/offline replacements.

### S08 — Automerge fine-grained lists and history/size guidance
- Source: [primary page](https://automerge.org/docs/reference/documents/lists/)
- Version/identity: Unversioned current project documentation; current page reviewed 2026-10-12. Related history/performance locator: https://automerge.org/docs/cookbook/modeling-data/.
- Accessed: 2026-10-12T01:06:27Z
- Locator: List guide entity-map + ID-list pattern (around lines 116–134); Modeling Data Performance section (around lines 163–168).
- Observed behavior: The docs advise updating fine-grained entity fields and ID lists instead of replacing an entire nested object. Documents keep their entire change history by default, and the docs recommend workload-specific measurements.
- Condition and applicability: The list examples are JavaScript but illustrate Automerge's data model. History retention means deleted values may remain in the document history unless a separate retention/compaction policy is established. Store cue objects by stable ID and order IDs separately. Unknown cue counts require a later storage/load/sync benchmark and explicit privacy/history retention policy.

### S09 — Move-aware JSON CRDT research
- Source: [primary page](https://arxiv.org/abs/2311.14007v2)
- Version/identity: Da and Kleppmann, arXiv v2 last revised 2024-03-19; PaPoC 2024 paper, DOI 10.1145/3642976.3653030. Research publication, not a crate release.
- Accessed: 2026-10-12T01:04:34Z
- Locator: Abstract and introduction: concurrent moves, duplicate/cycle hazard, proposed algorithm and planned Automerge integration.
- Observed behavior: The paper introduces a move operation for JSON CRDTs to handle concurrent move/non-move edits, and explicitly describes the algorithm as planned for Automerge integration.
- Condition and applicability: This is a research algorithm, not evidence of an Automerge release/API. The scope includes maps/lists and concurrent tree interactions; application-specific semantics still require testing. Relevant to cue reorder anomalies. Treat as design evidence motivating explicit same-cue move decisions, not as a selectable shipped library feature.

### S10 — Automerge merge rules for list operations
- Source: [primary page](https://automerge.org/docs/reference/under-the-hood/merge-rules/)
- Version/identity: Unversioned current Automerge project documentation; accessed 2026-10-12.
- Accessed: 2026-10-12T01:04:40Z
- Locator: List merge rules, especially item IDs/references and caveat on reverse multi-item insertion.
- Observed behavior: List writes/deletes refer to element IDs and inserts to a predecessor element; concurrent inserts are deterministically ordered. The docs describe cases where insertion order is not preserved (especially reverse insertion).
- Condition and applicability: The page explains list operations, not a high-level atomic move command. Its JavaScript examples do not replace Rust API/version checks. A reorder action cannot assume list CRDT order always equals intent. Record move intent and detect same-cue concurrent destinations; preserve both for review.

## Yrs/Yjs alternative
### S11 — Yrs release history
- Source: [primary page](https://github.com/y-crdt/y-crdt/releases)
- Version/identity: v0.28.0 released 2026-09-17 at commit 23b7f56; v0.27.3 commit ac476a4.
- Accessed: 2026-10-12T01:04:02Z
- Locator: v0.28.0 release record and v0.27.3 fixes.
- Observed behavior: v0.27.3 fixed inserting at index 0 missing the right-side neighbor and sticky-index right association. v0.28.0 is the later release (commit 23b7f56).
- Condition and applicability: The v0.27.3 bug fix is version-specific historical evidence; v0.28.0 is later. It does not establish absence of other ordering bugs. Insertion-at-head and stable-anchor regressions deserve explicit boundary tests if Yrs is chosen; pin the release rather than relying on an unversioned docs page.

### S12 — Yrs Rust update application
- Source: [primary page](https://docs.rs/yrs/0.28.0/yrs/struct.TransactionMut.html)
- Version/identity: Rust crate yrs 0.28.0; release commit recorded at S11.
- Accessed: 2026-10-12T01:06:27Z
- Locator: encode_update and apply_update; duplicate-block and pending-update descriptions.
- Observed behavior: Document updates are idempotent and commutative; duplicate blocks are ignored; out-of-order updates whose predecessors are absent are stashed until prerequisites arrive.
- Condition and applicability: All replicas still need the same updates eventually. Stashing does not recover a permanently lost update without retry/reconciliation. Strong alternative for retry/out-of-order binary updates in a Rust app, but does not itself expose the app-specific human conflict queue or publication boundary.

### S13 — Yrs document, map conflicts, and shared types
- Source: [primary page](https://docs.rs/yrs/0.28.0/yrs/)
- Version/identity: Rust crate yrs 0.28.0.
- Accessed: 2026-10-12T01:07:04Z
- Locator: Document sync examples and Other shared types: ClientID uniqueness, ArrayRef/MapRef behavior.
- Observed behavior: The doc describes StateVector/diff or update observers for peer synchronization. Client IDs must be unique per active peer. Array concurrent same-position insertions resolve in deterministic order; concurrent MapRef assignments prioritize higher ClientID.
- Condition and applicability: Duplicate active client IDs can corrupt document state. The documented map rule says how a visible winner is chosen; it does not establish that the app has a human-facing loser/conflict workflow. Use a unique persistent device/client identity if Yrs is selected. Add a separate conflict-intent representation/UI; don't equate deterministic tie-breaking with human review.

### S14 — Yrs stable text anchors
- Source: [primary page](https://docs.rs/yrs/0.28.0/yrs/struct.StickyIndex.html)
- Version/identity: Rust crate yrs 0.28.0.
- Accessed: 2026-10-12T01:07:04Z
- Locator: StickyIndex description, serialization traits, get_offset, empty-collection scope.
- Observed behavior: StickyIndex refers to a content block rather than a fixed numeric offset and can be encoded/serialized; the resolved offset changes when content is inserted before it.
- Condition and applicability: An empty collection has no block ID to reference, and a resolved offset is only valid at that current document state. It is a text/sequence anchor, not a cue's stable entity identity. Useful only if comments are later anchored to a range inside text; cue-level comment records should use cue_id.

### S15 — Yjs shared-type movement caveat
- Source: [primary page](https://docs.yjs.dev/getting-started/working-with-shared-types)
- Version/identity: Unversioned official Yjs documentation; access date 2026-10-12.
- Accessed: 2026-10-12T01:04:02Z
- Locator: Caveats section: integrated shared type cannot be moved to a different position.
- Observed behavior: An integrated shared type cannot be integrated into another document position; copy it if another position is required.
- Condition and applicability: This is the Yjs guide, not a standalone guarantee about every Yrs application API; Yrs 0.28.0 has its own preliminary/integrated type rules in S13. Keep stable cue records separate from the order sequence; moving list entries should move IDs/placements rather than reuse a nested shared object.

## Storage and network alternatives
### S16 — Automerge Repo storage/network plumbing
- Source: [primary page](https://automerge.org/docs/reference/repositories/)
- Version/identity: Unversioned current documentation; examples use @automerge/automerge-repo JavaScript packages.
- Accessed: 2026-10-12T01:04:02Z
- Locator: Repository entry point and StorageAdapter/NetworkAdapter example.
- Observed behavior: Repo composes local StorageAdapters with zero or more NetworkAdapters; the example uses a WebSocket server and filesystem adapter.
- Condition and applicability: This documented Repo API is for JavaScript. The public tutorial relay is explicitly demo-only, not private or production reliable (Network Sync page). Useful architecture precedent for separating storage and transport, but does not remove the need for Rust storage/relay implementation and does not authorize a public demo server for rehearsal data.

### S17 — Automerge sync handshake documentation correction, issue #945
- Source: [primary page](https://github.com/automerge/automerge/issues/945)
- Version/identity: JavaScript issue filed against @automerge/automerge 2.2.4, reproduced on 2.2.8; closed; collaborator response 2024-08-23.
- Accessed: 2026-10-12T01:07:04Z
- Locator: Collaborator response correcting receiveSyncMessage documentation; working send/receive loop.
- Observed behavior: The receiver must call generateSyncMessage after receiveSyncMessage to decide whether a response remains; the old docs mistakenly implied receive returned a new message. A working loop was posted and confirmed.
- Condition and applicability: This was a JavaScript API/docs mismatch, not proof of a current Rust API defect. Rust 0.12.0's sync module provides its own current typed example. Historical warning for hand-written protocol adapters: implement and test the exact native-version handshake instead of porting stale examples.
