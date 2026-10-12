# Independent critic review — B11-P02-control

## Scope and overall assessment

Reviewed the released brief, the frozen discovery and full investigator draft, the source map/index, and the released-plan text and reveal record named by the input map. The reveal hashes match: discovery `fef9c87c00a0d9c4ab9ca63fe8454d08fd6153606d9cf30c042711018bfd0e52`; revealed plan `4131b95dae344ad0f1db60b7cd96bb1b12bdd05940bf686f776d0830d8cf9f1b`. I independently opened the primary references listed below and checked the major mechanism claims. I found no material wrong correction to the released plan. The proposal covers the brief and is appropriately conditional about Loro, relay, publication authority, and unexecuted validation. It should remain a proposal; this review does not authorize or write a final implementation.

Two material gaps remain in the proposed behavior/acceptance boundary: make local durability guarantees explicitly app-owned, and specify/test conflict lifecycle for deletion and move races. Neither changes the brief’s scope or requires choosing a different candidate now.

## Exact released-plan disposition audit

| Released-plan clause | Draft disposition | Critic assessment |
|---|---|---|
| Ordered array of cue objects plus comment list | Separate MovableList of cue IDs, entity records, and comment records | **Change is supported.** Stable entities avoid using list position as identity. Loro documents that delete+insert move simulation can duplicate the logical element under concurrent edits; MovableList’s native move converges deterministically, which still does not preserve both human intents [S01]. |
| Random cue IDs, comments keyed by array position | Retain IDs; anchor by cue ID; tombstone/re-anchor explicitly | **Correction is required and well reasoned.** Indexes shift. For text-range comments, stable cursors/relative positions are a separate optional mechanism with deletion/performance conditions [S02, S12]. |
| Local editable snapshots, relay uploads on reconnect | Keep local-first editing and optional relay; exchange updates plus checkpoints | **Direction is supported.** Update exchange and app-owned storage are consistent with Loro’s documented boundary [S03, S04]. The relay remains an architectural proposal, not a supplied library feature. |
| Relay picks newer wall-clock timestamp and keeps other snapshot as backup | Reject timestamp merge; retain timestamps as metadata and backups for recovery | **Reject is correct.** Inference from disconnected edits: wall-clock order cannot establish causal order. The draft labels it as inference and retains both candidates. |
| Receiver replaces its local sheet with relay copy | Reject; import into existing replica and recover missing dependencies | **Reject is correct.** Loro reports pending causal ranges; a replica with pending dependencies must not be called synchronized [S03, S04]. |
| Whole-sheet comparison and coordinator chooses one whole copy | Per-entity/field decisions, optional whole-sheet context | **Improves preservation.** It fits the brief’s intelligible human decision requirement while retaining independent edits. Decision authority is properly left to the owner. |
| Publish marks current snapshot approved; viewers fetch latest and cache | Immutable release artifact, visible identity, pinned run selection/update prompt | **Change is supported.** A content hash identifies bytes but does not authorize an approver; draft keeps that distinction. Owner must decide authority, emergency override, and whether a rehearsal follows latest or pins a named release. |
| Comments and role assignments survive export | Retain, define schema, round-trip test; comment visibility left open | **Retain with appropriate open question.** The brief does not say whether discussion comments appear on stage-facing exports. |
| Local save before success; retries may resend snapshot | Retain save ordering; use durable outbox and idempotent update retries | **Direction is sound**, with the durability clarification in C-01 below. |
| Review preservation, publication identity, restart/reconnect | Retain as acceptance criteria; unverified | **Correct status.** No executable witness is claimed; the matrix is proposed. |
| Publication deliberate, conflicts understandable, editing works offline | Retain as product constraints | **Correct and in scope.** A modest relay is allowed; no always-online editor or chat product is introduced. |
| Timestamp/backup scheme is assessment proposal, not verified guarantee | Retain status, reject as merge correctness | **Correct.** The draft does not claim it was tested. |

## Findings

### C-01 — Material incomplete: distinguish CRDT commit from durable local save

**Locators:** “Local save, reconnect, relay, and recovery,” step 1; “Actually executed”; recovery validation bullets.

The draft requires a local document and durable outbox before success feedback and proposes a transactional database or atomic append/snapshot scheme. That is a good implementation direction, but it should explicitly state that a Loro document commit is not a durable ACID storage transaction. The Rust API says Loro is a pure library and leaves storage/loading/synchronization to the app; it also says its transaction grouping has no rollback or isolation [S04]. Acceptance must cover the application database/file flush boundary, atomic association of document update and outbox entry, and crash recovery at each boundary. This is clarification of an important brief obligation, not evidence that the current proposal already implements durability.

### C-02 — Material incomplete: define conflict/tombstone lifecycle and race coverage

**Locators:** “Intent and resolution records”; “For conflict classification”; “Local save…” steps 3–6; proposed validation, “Concurrent edits” and “Invariants.”

The per-edit operation IDs/frontiers and resolution references are a useful app-owned layer, and the draft correctly refuses to treat a deterministic Loro winner as approval [S01, S03]. But the behavior remains conceptual where incompatible operations interact with entity lifetime. Add explicit cases and expected resolution states for concurrent delete-versus-edit, delete-versus-move, cue revival/recreation, and comment creation against cue deletion. Ensure conflict creation and resolution records are idempotent under duplicate/reordered imports and cannot be lost when either replica has already materialized the deterministic view. Current validation covers deletion of a commented cue and concurrent moves/text/scalars, but does not state these delete/edit and revival expectations. The brief makes preserving useful work and never silently redirecting a comment central.

### C-03 — Unsupported as an adoption conclusion; acceptable as a prototype hypothesis

**Locators:** Recommendation (“strongest fit found”); Alternatives table; proposed validation.

The evidence supports Loro as a plausible Rust candidate: its versioned Rust API exposes MovableList, history/frontiers, import/export and pending status, while leaving transport/storage to the app [S04]. The decisive concurrent-move example and most cited behavior on the Loro tutorial site are JS/WASM examples [S01, S03]. The draft discloses this and proposes a pinned Rust witness, so no correction is needed for an exploratory prototype. “Strongest fit” is not yet a verified comparative result: the alternatives review is a useful shortlist, not a head-to-head Rust/Slint comparison or performance/adapter evaluation. Keep the choice explicitly provisional until the proposed witness and target-app checks run.

## Discovery, evidence quality, alternatives, and validation

Stable cue identity, separate order/entity storage, durable comment IDs, and cue-ID anchors address the plan’s positional-reference failure. Text-range anchoring is explicitly optional and correctly described as a different requirement from cue anchoring. Convergence is separated from intent and UI conflict resolution. The draft appropriately identifies Loro’s regular-child-container identity hazard and recommends unique entity IDs / mergeable construction [S03].

The Loro issue history is used with good scope control: issue #957 reports a specific loro-crdt 1.11.1 Node/WebRTC adapter workload, and PR #958 changed op-count locking and added regression coverage. The draft does not call it a current Rust-native defect. It also distinguishes the JS/WASM loro-crdt 1.16.4 release from the Rust crate API at 1.16.2 [S06, S07]. This is a relevant implementation lesson, not a reason to reject the candidate.

Alternatives are useful and materially connected to the brief: Automerge conflict inspection and reliable in-order sync assumptions; Yjs offline storage and relative text positions; ShareDB’s server/OT model and its reconnect example disabling closed-socket buffering; and a hand-built log as a costly fallback [S08–S14]. The comparison identifies integration costs rather than treating any library as a complete product. ShareDB is server-dependent but not ruled out by fiat. None of these sources supplies the required approval workflow.

The draft preserves the team relay as optional transport/storage and identifies authentication, membership, encryption, backup, retention, offline duration, and operating responsibility as owner/IT decisions. It does not assume cue counts; it correctly keeps them as sizing inputs. Other honest external inputs include team/device scale, comments’ range/reply semantics, stage-export visibility, adjudicator/publisher authority, emergency override, release selection, semantic duplicate cues, role constraints, and schema migration.

Executed evidence is stated separately from future validation. The investigator’s report says its release helper and structural checks ran but no implementation witness, deployment, or concurrency/recovery test ran. In this critic stage I verified the two frozen hashes and inspected official source pages; I did not run app code or an executable concurrency witness. The proposed validation covers replica convergence, retries/missing dependencies, crashes, publication freezing, PeerID policy, size/offline envelope, and usability. Extend it with C-01/C-02 cases before using it as an acceptance matrix.

## Source/provenance notes

The critic source map carries forward all investigator IDs S01–S14 without changing their URLs or identity fields. I independently checked S01–S14 against the official pages/code history indexed in `sources/index.md`; checked records and conditions are overlaid in `source-map.json`. The current docs.rs LoroDoc page opened as `/loro/latest` and identified Rust crate loro 1.16.2; the explicit 1.16.2 URL recorded by the investigator was not directly accessible in the web tool. The versioned release history remains separately scoped to the JS/WASM package. No raw page captures or code were saved.
