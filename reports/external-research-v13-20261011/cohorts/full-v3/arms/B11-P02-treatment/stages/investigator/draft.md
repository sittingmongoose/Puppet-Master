# Component proposal — rehearsal cue-sheet revision synchronization

## Recommendation

Replace whole-sheet timestamp arbitration with a local-first, operation-aware cue document. Proposed native implementation: Automerge Rust 0.12.0, crash-safe local persistence on each laptop, and a modest authenticated team relay that stores/synchronizes the shared document. This fits the Rust app and exposes competing values for property conflicts; its heads/history support point-in-time publication. The recommendation remains contingent on the reconnect and workload validation below. If the chosen Rust SyncDoc path cannot pass the lost-message recovery case, evaluate Yrs 0.28.0 with a separate app-level conflict log [S01–S05, S11–S14](sources/index.md).

Editing and local saves work without a network. The relay is a sync peer, not the only copy and not a new chat service. Keep draft, relay-sync status, conflict status, and published revision as separate states.

## Released-plan clause dispositions

| Plan clause | Disposition | Reason |
|---|---|---|
| Ordered array of cue objects plus a comment list | **Correct.** Store cue entities by cue_id and keep ordering separate as cue IDs or placement records. Store comments by comment/message ID with cue_id. Update individual fields, not the whole array. | Fine-grained entity and ID-list edits combine better. Ordinary list operations do not define an atomic move [S08–S10]. |
| Random cue IDs, but comments refer to array position | **Keep stable random IDs; correct the comment anchor.** Store cue_id on every comment. Preserve it through reorder, serialization, export, and import. | An array position changes; an entity ID does not. A comment must follow its cue [S08, S15]. |
| Each laptop saves an editable snapshot and uploads on reconnect | **Keep local editing and relay; change sync to merge.** Persist a replica locally. Exchange CRDT changes through the relay; merge received history into the local replica. Snapshots may be recovery/import artifacts, not replacement instructions. | Replacing a local replica can lose offline edits. CRDT change replay is idempotent; the Rust sync session has a separate reliable-stream requirement [S01, S03, S05]. |
| Relay chooses between client/current sheet by last-edited timestamp and keeps a backup | **Reject timestamp winner; retain backup for recovery only.** Resolve using document causality and conflict candidates. Show edit times as context, never as proof of which concurrent edit is right. | Automerge’s same-field winner is operation-ID based, not wall-clock latest; competing values remain available [S02, S06]. The Rust relay must also recover its sync state after uncertain message loss [S03–S05]. |
| Receiving laptop replaces its local sheet with the relay copy | **Reject replacement.** Reconcile both histories and preserve local and relay-only work. | A replacement discards edits. The sync adapter must perform the native handshake and restart safely after a dropped message [S03, S05, S17]. |
| Show whole-sheet side-by-side and let coordinator choose | **Change default to issue-level decisions; keep whole-sheet diff as context.** Merge independent cues/fields. For same-field, overlapping-text, competing-move, or delete/edit conflicts, list every candidate with cue, field, author/time, and source context. Let a human select/edit a resolution and record which candidates it resolves. | Property alternatives are available through Rust get_all. Text/list convergence is not the same as a human semantic decision [S02, S06, S07, S10]. Who may resolve is an owner decision. |
| Publish marks current snapshot approved | **Keep explicit approval; make a new immutable publication record.** Capture document heads, materialize a canonical run-sheet projection, record revision ID, digest, schema version, approver, and time. Do not change this record when the draft changes; a new Publish creates a new ID. | Rust historical reads can materialize state at a specific head set [S02]. A read-only sync State is not authorization [S04]. |
| Viewers fetch “latest” online and cache offline | **Keep cached viewing; display exact version and freshness.** Show publication ID/time. Offline, say “cached [ID] — offline”; never claim it is latest. Offer a newer revision after reconnect and require an explicit switch. | A disconnected viewer cannot know a newer publication was issued. |
| Comments and assignments survive exports | **Keep and define a round-trip contract.** Structured export/import carries stable cue, role, comment, and publication IDs and references. Readable export keeps comments/roles grouped by cue. | Owner must decide which comments appear in the staff-facing approved sheet versus a rehearsal archive, plus redaction rules. Do not silently drop them [S08, S14]. |
| Save locally before success; retries may resend snapshots | **Keep local durability; split status feedback.** Show “saved on this device” only after durable local commit; show relay sync separately. Retry identical logical changes and merge/dedupe on receipt. After possible in-flight loss, reset/rebuild the Automerge peer State and handshake again, or atomically preserve the exact message/state pair until acknowledged. | apply_changes ignores previously applied changes, but SyncDoc assumes reliable in-order delivery. Issue #1284 demonstrates failure if a generated message is lost and stale State is reused [S01, S03–S05]. |
| Review concurrent work, stable references, restart/reconnect, publication identity; no always-online editing | **Accept as release requirements.** Proposed design and validations below cover them; no application test or deployment was run. | These are explicit brief obligations. Move/reconnect sources identify failure scenarios a release test must include [S05, S09–S10]. |

## Proposed data and interaction model

### Stable cues, order, text, comments

Use one versioned collaboration document per sheet. Store cue records by generated cue_id; each carries timing value/note, role assignments, text, and a deletion/tombstone marker. Keep order as a separate sequence of cue IDs or placements. Never infer identity from row, cue label, or timing. Keep cue IDs stable across edits and exports.

A comment/message has its own ID and cue_id, author, timestamp, body, and optional reply-to ID. Reordering changes only placement, so comments stay on the same cue. If a cue is deleted, preserve a tombstone and visibly keep its thread attached to a deleted-cue entry; never retarget it to the row that inherited the old index. The exact restore/archive policy is for the owner.

Store move intents separately: move_id, cue_id, from/to neighbor IDs, base heads, actor, time. If one cue is concurrently moved to different destinations, retain both intents and mark order unresolved. Present both destinations, allow other edits to continue, and block approval until a resolution names the candidate move IDs and selected destination. The preview order is provisional. The 2024 move-aware CRDT paper motivates this check but does not prove a released Automerge move API [S09–S10].

For independent scalar edits such as role or time, combine disjoint fields and query all same-property conflict values. Display every value and its author, with a human keep/edit-combined action. Do not present the deterministic winner as approved. Use actual text insert/delete operations rather than replacing stale note snapshots. Disjoint text edits may merge; when concurrent edits overlap a timing instruction, compare both variants against their common heads, show an inline diff, and ask a person to accept or edit a combined text. The Rust editor adapter and overlap detector are proposed application work; test them. Append-only comment replies merge as separate IDs; simultaneous edits to an existing comment use the same conflict flow [S02, S06–S07].

### Offline persistence and relay recovery

Each laptop durably saves the local document after a change and before local-save feedback. On startup, load that local document even if the relay is unavailable. Use an ordered WebSocket/TCP connection for relay sync. The relay stores received changes before acknowledging them and holds a per-client sync state. Local edits remain available during relay outages.

If a connection breaks after a sync message could have been dropped, do not reuse that uncertain Automerge State: reset/recreate per-peer state and reconcile from persisted replicas. Alternatively, atomically store and resend the exact generated message with its matching State. Test both against issue #1284. Keep retry bounded; do not mark a change delivered before durable relay storage. Automerge-repo documents a storage/network adapter pattern in JavaScript, not an off-the-shelf Slint/Rust repository implementation; the Rust app needs its own small persistence/transport adapter [S03–S05, S16–S17].

The UI separates “saved locally,” “sync pending,” “synced,” “needs decision,” and “published.” A local save must not imply relay sync or approval. A retry resends the same operation IDs so duplicate delivery is harmless.

### Approval, viewers, exports

Keep the collaborative draft and published records in separate stores/paths. Publish performs schema/time/role checks, requires publication-relevant conflicts resolved, captures current heads, materializes a canonical projection at those heads, computes a digest, and atomically writes a new immutable publication record. It includes revision ID, sheet ID, schema version, content digest, approved time, and authorized approver. Later edits affect only the draft. Publish again explicitly to create a new record; retain prior approved IDs.

Stage viewers read only an approved record, never the draft. Their view and printed output identify the approval. An offline client shows its cached publication ID and offline status. On reconnect, it can display a newer approved ID for the operator to select. Automerge read-only sync mode may help with directionality, but relay permissions and approval checks must be enforced separately [S02, S04].

Define a versioned structured export with cue IDs, order/placements, timing/notes, role assignments, comments with cue_id, schema version, and publication ID when applicable. Test round-trip import. A readable export can use cue labels while retaining stable IDs as metadata and grouping roles/comments under each cue. Export format, comment inclusion in the staff view, and redaction are owner decisions.

## Alternatives and trade-offs

- **Yrs 0.28.0:** Direct Rust/Yjs-compatible updates, duplicate and out-of-order update handling, and StickyIndex text anchors. Its documented concurrent map rule selects a deterministic winner by ClientID, so the cue app still needs its own conflict log and decision UI. Prefer it if cross-interop/out-of-order update behavior outweighs Automerge’s direct Rust multi-value property inspection; test unique persistent ClientID behavior and release regressions [S11–S15].
- **Custom operation log:** Can make cue moves and conflict resolutions domain-specific, but the app must build deduplication, causal replay, text merging, history, and recovery. Too much bespoke machinery for the first proposal.
- **Central lock or whole-sheet branching:** A lock may fit serialized editing; a whole-sheet choice may be useful for rollback. Neither should be the normal sync path when multiple disconnected editors must preserve independent work.

## Owner decisions and unknowns

- Which roles can resolve conflicts and publish; is a coordinator actually assigned?
- Are times relative cue offsets or wall-clock timestamps? What precision and display zone?
- Are comments cue-level only, or can they quote a range inside text?
- What happens when cues/comments are deleted, restored, or archived?
- Which comments/assignments belong in staff publication versus rehearsal-only exports?
- What export formats, redaction rules, local cache lifetime, and history retention are required?
- Where may the relay run, what rehearsal network is available, and how are members authenticated?
- Actual cue counts, sheet size, history size, backup/recovery window, and old-client/schema compatibility remain unknown and require measurement/decision.

## Validation proposals — not run

1. **Independent offline edits:** Two devices start from a common sheet. Disconnect, edit different cues/fields, reorder separate cues, add comments, close/reopen one app, then reconnect. Verify both changes survive, stable comment anchors resolve correctly, and replicas converge.
2. **Same-field conflicts:** Concurrently edit the same role/time and verify all candidates remain visible, provisional winner is labeled, human resolution references them, and replicas converge.
3. **Text and move conflicts:** Test disjoint and overlapping offline text edits; same-cue moves to different neighbors; move versus delete; insert at the first/last positions. Verify merge versus review behavior, no silent duplicate/cycle/wrong cue anchor, and publication blocks until resolved.
4. **Lost message/restart:** Reproduce Rust issue #1284 by generating but losing a message, making another conflicting edit, and reconnecting. Test peer-State reset and exact-message/state persistence separately, including crashes before send, after relay persistence but before ack, and after ack. Require loop termination, convergence, and preserved candidates.
5. **Publication isolation:** Publish P1 at captured heads, modify the draft, and verify P1 identity/digest/bytes remain unchanged. Publish P2 only after explicit approval. Confirm offline viewers see cached ID/status and read-only access cannot mutate publication data.
6. **Export round trip:** Reorder cues and include roles/comments/tombstones; export/import and compare every stable ID and reference in both structured and readable formats.
7. **Scale and recovery:** With representative actual cue count and realistic history, measure local save/load, relay storage, reconnect time, message volume, and forced-interruption recovery. Verify agreed backup, retention, and deleted-history policy.

## Checks actually run

- One native Goal was activated before reading the brief; its complete response was saved and passed the exact binding guard.
- The one-shot reveal helper ran once. It recorded discovery SHA-256 0ef61e7f021740c3d1b440a9503388a2f8226f4c6f8f51b10a2bf4166bd29e7e and released-plan SHA-256 4131b95dae344ad0f1db60b7cd96bb1b12bdd05940bf686f776d0830d8cf9f1b.
- Primary docs, APIs, release records, and issues were reviewed. No app code, downloaded code, tests, benchmark, or deployment was run.
