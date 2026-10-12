# Independent critic — B11-P02-treatment

## Review scope and overall assessment

I reviewed the original brief, the complete investigator discovery and draft, the released plan and reveal record, the investigator source map, and its carried source index. I independently checked the consequential Automerge 0.12.0 claims against its versioned Rust API/source, and checked the official Automerge conflict, list, text, and merge-rule documentation, the Rust lost-message issue, the move-CRDT paper record, the current Yrs release record, and the Automerge repository documentation. Source conditions and limits are indexed in [sources/index.md](sources/index.md); C-series IDs are new critic records and do not rebind the investigator's S-series IDs.

The draft correctly rejects timestamp arbitration and local replacement, preserves disconnected editing, changes positional comments to cue IDs, and separates approved publications from a changing draft. Its recommendation remains a conditional component proposal, which fits the brief. It preserves the no-always-online, no-enterprise-account, no-new-chat, unknown-cue-count, and no-deployment constraints. I found no material wrong correction to the released plan and no demand to reduce scope.

The proposal is not yet complete enough to treat the key safety properties as specified. The main gaps are: how conflict candidates are reliably attributed to crew members, how concurrent cue moves become one intelligible order, and which persisted state/acknowledgement rule makes reconnect safe under uncertain message loss. These are material incompleteness findings, not evidence that the recommended CRDT cannot work. Keep the stated validations as future work; none of them has been run.

## Disposition review of every released-plan clause

| Released-plan clause | Draft disposition | Critic assessment |
|---|---|---|
| Ordered array of cue objects and a comment list | Change to cue entities keyed by ID, separate ordering, and comments keyed by their own IDs with cue_id | Correct direction. Fine-grained entities and a separate ID list fit Automerge's guidance. The proposal still needs a tested order/move policy (M2). |
| Random cue IDs, comments point at array positions | Keep stable random IDs; point comments at cue_id | Correct. A row number is not identity. The tombstone behavior for deleted cues is a useful explicit safeguard. Identity collision/migration details remain implementation inputs, not a reason to keep positional anchors. |
| Each laptop saves an editable snapshot and uploads on reconnect | Keep local edits; exchange and merge replica history through a relay | Correct. A snapshot must not be treated as a replacement command. The exact wire/state recovery contract remains open (M3). |
| Relay chooses newer timestamp and keeps other snapshot as backup | Reject timestamp winner; retain backup for recovery | Correct. Current Rust conflict inspection exposes alternatives; the official conflict guide says the visible concurrent-property winner is deterministic by operation ID, not wall-clock time. Device time can remain context only. |
| Receiver replaces local sheet with relay copy | Reject replacement and reconcile histories | Correct and necessary to preserve device-local work. Do not call a relay snapshot authoritative over a disconnected replica. |
| Whole-sheet side-by-side with coordinator choice | Make issue-level decisions the default and retain whole-sheet comparison as context | Correct and useful. The candidate list must show authenticated authorship and the UI must not imply that CRDT convergence itself decided a semantic timing conflict (M1, M4). |
| Publish marks current snapshot approved | Capture heads, materialize that historical state, and store a new immutable publication record | Correct boundary. The draft appropriately separates the published artifact and the editable draft and says a read-only sync mode is not authorization. Atomic storage, approver authorization, and canonical digest rules remain proposed implementation details. |
| Viewers fetch “latest” online and cache offline | Display publication ID/time and cached/offline status; offer a newer revision after reconnect | Correct. A disconnected viewer cannot know it has the latest publication. |
| Comments and assignments survive exports | Carry stable references through structured round-trip; group them by cue in readable exports | Correct direction. Which comments appear in the staff publication and redaction/export rules are honestly left to owners. Test that import/export retains cue, role, comment, and publication references. |
| Local save precedes success; retries may resend snapshots | Split local-save and relay-sync feedback; use idempotent changes and recover uncertain sync state | Correct intent, but the message-level recovery rule is not yet concrete enough to implement (M3). Applying duplicate document changes idempotently does not establish that a stateful sync message can be safely regenerated or replayed. |
| Review concurrent work, references, restart/reconnect, publication identity; no always-online editing | Accept as release requirements and list proposed validations | Scope is retained. The validations are appropriately labeled “not run”; actual counts remain unknown but are included as a measurement input. |

## Findings

### M1 — Conflict-candidate authorship is not guaranteed by the proposal

**Classification:** material incomplete.  
**Locators:** draft, “Proposed data and interaction model / Stable cues, order, text, comments” and “Offline persistence and relay recovery”; discovery, “Initial account after the ordinary research pass.”

The conflict UI promises each value with its author, but the draft does not carry forward a concrete authorship rule from discovery. In Automerge Rust 0.12.0, author metadata is optional; the versioned API says a change has no author unless one is set. The candidate values returned by get_all are paired with operation IDs, so the UI also needs the document history's operation/actor-to-author mapping and a trusted mapping from authenticated crew identity to author ID. The discovery mentions mapping authenticated identities to metadata, which is good research, but the draft should preserve that as a required invariant rather than assume an author is present. Without it, an intelligible human decision can degrade to unattributed alternatives. See critic source C01/C02 and investigator source S02/S06.

### M2 — Move intents are recorded, but the proposal does not define the order-resolution algorithm

**Classification:** material incomplete.  
**Locators:** draft, “Proposed data and interaction model / Stable cues, order, text, comments” and “Validation proposals,” test 3; plan disposition rows 1 and 6.

The draft correctly avoids claiming that a move-aware CRDT algorithm is shipped. Its proposed move record (cue ID, source/destination neighbors, base heads, actor, time) is useful evidence, but it does not define how active placements are materialized when several moves overlap, the destination neighbor is concurrently deleted or moved, or concurrent edits produce a cycle/duplicate placement. Test 3 covers same-cue moves, move versus delete, and list endpoints, but not multi-cue cycles or a move whose neighbor disappears/changes. The versioned Rust transaction surface inspected provides insert/delete/splice operations and no documented atomic cue-move contract; the official list rules describe inserts by predecessor element and warn that some reverse insertions do not preserve insertion order. The paper presents an algorithm and says integration into Automerge was planned; it is not a released API. Therefore the human review queue and publication block are sound requirements, but the proposal still needs a deterministic provisional-order rule and complete candidate-resolution behavior. See C03–C06; investigator S08–S10.

### M3 — Change idempotence and stateful sync-message recovery need separate contracts

**Classification:** material incomplete.  
**Locators:** draft, “Released-plan clause dispositions,” snapshot/retry rows; “Offline persistence and relay recovery”; validation proposal 4.

Automerge Rust 0.12.0 says apply_changes ignores an already-applied change, but the Rust sync maintainer says the sync protocol requires a reliable in-order stream and its peer State must be reset if a message could have been dropped. The draft recognizes this distinction and proposes either resetting/rebuilding peer State or atomically retaining the exact message/state pair. The remaining omission is the durable boundary: it does not say which side owns which State, what the relay durably stores before acknowledging, what survives a client/relay crash, or how both sides resume after uncertainty. “Retry identical logical changes” must not be read as permission to generate a fresh stateful sync message from stale State. The issue reproduction and maintainer response support the hazard, not a tested relay or proof that either proposed recovery path works in this application. Validation proposal 4 is appropriate but remains unrun. See C01, C07, and C08; investigator S01/S03–S05.

### M4 — Resolution behavior under a new concurrent candidate needs a stated rule

**Classification:** material incomplete.  
**Locators:** draft, “Proposed data and interaction model / Stable cues, order, text, comments” and “Alternatives and trade-offs.”

The draft says a person can select or edit a resolution and record the candidates it resolves, which is a good starting point. It does not say what happens when a new concurrent write arrives after the displayed candidate set was reviewed, whether a resolution closes only the exact candidate IDs it observed, or whether publication remains blocked until the newly merged candidate is reviewed. For safety, a resolution should name the candidate operations/revision context it covers; a later candidate should reopen review. This is an application rule, not a guarantee supplied by deterministic CRDT merge. The proposed same-field test should include that race. See C02/C09.

## Other assessment and boundaries

- **Text and timing notes:** The proposal correctly treats text merge as editing operations, not wholesale stale-value replacement, and calls the Rust/Slint adapter and overlap detector proposed work. The official text guide is JavaScript documentation; its frequency guidance is not proof that this adapter or semantic-overlap detector works. Keep the overlap cases in validation.
- **Comments and deletion:** cue_id anchors survive reorder; the tombstone/deleted-cue display avoids silently retargeting a thread. Restore/archive behavior is explicitly left open, an acceptable owner input.
- **Publication and viewers:** Capturing heads and reading at those heads is supported by the Rust API. A publication ID, digest, approver, time, and separate immutable record meet the plan's boundary at proposal level. Read-only sync is correctly not presented as authorization. The exact canonical byte encoding, transactional persistence, relay ACL, and authorized approver remain future implementation decisions.
- **Alternatives and implementation history:** Automerge and Yrs are plausible Rust candidates; central locks, manual whole-sheet branching, and a custom operation log are real alternatives, though their comparison is brief. The move paper is accurately treated as research rather than a released feature; the Rust issue is correctly scoped as an open version-unspecified report rather than proof every release fails. I independently confirmed the Yrs 0.28.0 release record, but the Yrs 0.28.0 API pages in the investigator map were not independently available through this review route; preserve those claims as source-map-backed, not newly revalidated here.
- **Checks actually run:** The investigator distinguishes proposed validation from executed work and reports no application tests, benchmarks, or deployment. The plan-reveal record carries a one-shot flag and hashes, but the actual helper execution and the investigator's native Goal receipt are not among the frozen inputs. I cannot independently verify those two process claims without reading an unlisted path; classify them as honestly unresolved external input, not as disproven. The native Goal for this critic stage is separately captured in native-goal-active.json after the exact binding guard passed.
- **No material wrong or unsupported product correction found.** The material issues above are specification gaps in the proposal. This critique does not repair or replace the investigator's draft.

## Required next review focus

The fresh reviser should address M1–M4 without shrinking the brief: define trusted author attribution; spell out move and placement resolution; state exact durable recovery/acknowledgement behavior for stateful sync; and ensure a resolution applies only to the candidate set it observed. Keep the existing publication, export, offline, and scale validations marked proposed until actually executed.
