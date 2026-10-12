# Critique — independent review

## SCW-6 v1 selection (locked before new source retrieval or verdicts)

Selection order reflects consequentiality to durability, delete/photo recovery, and the source-backed alternative decisions. Ties follow the order claims appear in draft.md. The six claims below are exact draft sentences; the selected scope distinctions will not be replaced after results.

1. **SCW-01 — draft.md, Recommendation, paragraph 2.** “It can atomically update the event log, materialized observation, and local sequence in one transaction; WAL with FULL synchronization is the stronger documented SQLite setting for committed transactions at power-loss boundaries.” Selected because a mistaken reading of transaction atomicity or FULL’s power-loss scope would change the local durability recommendation.
2. **SCW-02 — draft.md, Alternatives and trade-offs, CouchDB row.** “PR 6129 fixed a delete/recreate attachment revision bug upstream, but merged main/notes do not prove the installed package contains it.” Selected for whether the delete/photo-related fix applies to an exact released server, which could change a candidate’s qualification.
3. **SCW-03 — draft.md, Per-clause disposition, Paragraph 2, conflict-card correction.** “Automerge is instructive here: ordinary property access selects a deterministic operation-ID winner while its conflict API exposes competing values, so a hidden/default read cannot stand for user approval.” Selected because changing the implementation-language/release scope could alter the CRDT alternative’s applicability.
4. **SCW-04 — draft.md, Complete brief coverage and proposed design, Local save and reconnect recovery.** “WAL is local to one host, and FULL synchronization affects local commit durability but cannot repair a filesystem/device that lies about flushes.” Selected because same-host versus multiple-laptop deployment is central to the architecture.
5. **SCW-05 — draft.md, Alternatives and trade-offs, CouchDB row.** “Ordinary reads hide losing leaves; revision history can be pruned; attachments may transfer; exact package version matters.” Selected because the default-versus-explicit conflict API and release scope affect whether CouchDB can preserve reviewable alternatives.
6. **SCW-06 — draft.md, Per-clause disposition, Paragraph 1, photo-reference correction.** “CouchDB attachment metadata/stubs do not imply that a replicator will avoid sending the bytes; configuration and document shape must enforce the no-automatic-upload rule.” Selected because document-attachment versus external-reference scope bears directly on the no-automatic-photo-transfer constraint.

This fixed list is the SCW sample only. The ordinary critique still covers all brief obligations and every exact plan disposition, including material scope risks beyond this cap.


## SCW records

### SCW-01 — SQLite transaction and power-loss setting

**Draft locator and exact sentence:** Recommendation, paragraph 2: “It can atomically update the event log, materialized observation, and local sequence in one transaction; WAL with FULL synchronization is the stronger documented SQLite setting for committed transactions at power-loss boundaries.”

**C:** A single SQLite transaction can atomically commit those logical rows, and WAL with synchronous=FULL syncs each commit for local power-loss durability, subject to the VFS/filesystem/device honoring sync.

**C* / selector delta:** “WAL with synchronous=NORMAL provides the same durability for a just-committed transaction after OS crash or power loss.” Changed only the synchronous-mode selector: FULL → NORMAL.

**Evidence and applicability:** S03, S04, S23. WAL docs say WAL+FULL syncs each commit; PRAGMA docs say NORMAL remains consistent but a committed transaction may roll back after system crash/power loss; SQLite’s hardware assumptions require working flush/sync. C **ENTAILS** under those conditions. C* **CONTRADICTS** the same evidence. SQLite one-database transaction atomicity does not cover a separate file protocol or attached databases as a set.

**Authentic excerpts:** S04: “A transaction committed in WAL mode with synchronous=NORMAL might roll back following a power loss or system crash.” S23: “SQLite assumes that the flush or fsync will not return until all pending write operations for the file that is being flushed have completed.” See those source IDs’ URLs, version scope, access window, and locators in source-map.json.

**Disposition:** Retain and qualify with the VFS/device condition, already stated later in the draft. Supported wording: one database transaction binds event, projection and sequence; WAL+FULL is the local durability baseline, but it cannot guarantee hardware behavior. This affects the brief’s power-loss recovery obligation.

### SCW-02 — CouchDB attachment fix release scope

**Draft locator and exact sentence:** Alternatives and trade-offs, CouchDB row: “PR 6129 fixed a delete/recreate attachment revision bug upstream, but merged main/notes do not prove the installed package contains it.”

**C:** The actual installed candidate is unidentified, so the consulted upstream evidence does not establish whether that deployed package contains the fix.

**C* / selector delta:** “The official upstream CouchDB 3.5.3 release includes the fix.” Changed only the version/package selector: unknown installed distribution → upstream 3.5.3 release.

**Evidence and applicability:** S18 and S20. PR 6129 merged as 83a487b on 2026-09-25 and describes attachment revision position 1 instead of 3 on document recreation. The official 3.5.x notes place the fix under the Version 3.5.3 section and say same-name recreated attachments then replicate. C **UNDETERMINED** because the deployed package is unspecified. C* **ENTAILS** for the upstream 3.5.3 release; the notes do not identify any locally deployed package.

**Authentic excerpts:** S18: “They were left at 1- when they should be at 3-” S20: “Attachments re-created with the same name will now replicate from source to target.” Source identities and locators are in source-map.json.

**Disposition:** Qualify the unresolved deployment. Supported wording: the upstream 3.5.3 release notes include the fix; pin the exact distribution/build and reproduce delete/recreate replication before selecting it. This affects the exact-plan delete/photo candidate qualification.

### SCW-03 — Automerge conflict behavior across language surfaces

**Draft locator and exact sentence:** Per-clause disposition, Paragraph 2: “Automerge is instructive here: ordinary property access selects a deterministic operation-ID winner while its conflict API exposes competing values, so a hidden/default read cannot stand for user approval.”

**C:** In the inspected JavaScript v3.4.1 surface, a conflicting property read returns a deterministic value and getConflicts exposes competing values.

**C* / selector delta:** “The Rust Automerge/Autosurgeon surface has the same default-read and conflict-enumeration behavior.” Changed only implementation surface: tagged JavaScript package → Rust mapping/API.

**Evidence and applicability:** S07–S08 show deterministic selection and conflict enumeration in docs and the tagged JavaScript source; S11 identifies Autosurgeon as a Rust mapping library but does not pin its version or establish parity. C **ENTAILS** for the inspected JS surface. C* **UNDETERMINED**; JS behavior does not establish Rust binding behavior.

**Authentic excerpts:** S08: “one value arbitrarily (but deterministically, any two nodes who have the same set of changes will choose the same value)”. S07: “Although only one of the concurrently written values shows up in the object, the other values are not lost.” Source identities and locators are in source-map.json.

**Disposition:** Retain the JS observation and qualify Rust as an unverified candidate, as the draft already does. Do not infer a Rust defect. Prototype the actual Rust API before relying on it. This affects the fair comparison of the CRDT option.

### SCW-04 — WAL deployment topology

**Draft locator and exact sentence:** Complete brief coverage, Local save and reconnect recovery: “WAL is local to one host, and FULL synchronization affects local commit durability but cannot repair a filesystem/device that lies about flushes.”

**C:** Processes using one WAL database must be on the same host; WAL is not a shared network-filesystem protocol for the three laptops.

**C* / selector delta:** “Processes on different laptops can safely share one WAL database over a network filesystem.” Changed only topology: same host → multiple hosts.

**Evidence and applicability:** S03, especially the WAL limitations and shared-memory explanation, plus S23 for sync assumptions. C **ENTAILS**. C* **CONTRADICTS**. The laptops can still exchange application packages or use a separate relay.

**Authentic excerpt:** S03: “All processes using a database must be on the same host computer; WAL does not work over a network filesystem.” Source identity and locator are in source-map.json.

**Disposition:** Retain. The sentence applies to a shared-file deployment and does not rule out SQLite as a laptop-local store. It affects transport architecture and the brief’s week-offline/manual-transfer requirements.

### SCW-05 — CouchDB default conflict response versus explicit conflict APIs

**Draft locator and exact sentence:** Alternatives and trade-offs, CouchDB row: “Ordinary reads hide losing leaves; revision history can be pruned; attachments may transfer; exact package version matters.”

**C:** A basic document GET returns only the deterministic winning revision and does not signal other conflicting leaves.

**C* / selector delta:** “A document GET with conflicts=true returns all losing leaf document bodies.” Changed only the API selector: basic GET → GET with conflicts=true.

**Evidence and applicability:** S14, conflict-handling sections on basic GET, conflicts=true, open_revs and compaction. C **ENTAILS**. C* **CONTRADICTS**: conflicts=true adds losing revision IDs; open_revs=all is needed to retrieve leaf bodies. Compaction/pruning can also limit old body availability.

**Authentic excerpt:** S14: “The basic GET /{db}/{docid} operation will not show you any information about conflicts. You see only the deterministically-chosen winner.” The conflicts=true response and open_revs examples are at the same cited locator in source-map.json.

**Disposition:** Keep the ordinary-read claim and add this API distinction wherever CouchDB review is described. A review card showing values must fetch the revision bodies and handle missing/pruned revisions. This is **material incomplete** for the candidate’s conflict-review path, though it does not reverse the draft’s recommendation to evaluate CouchDB only with explicit tests.

### SCW-06 — Embedded attachments versus external references

**Draft locator and exact sentence:** Per-clause disposition, Paragraph 1, photo-reference correction: “CouchDB attachment metadata/stubs do not imply that a replicator will avoid sending the bytes; configuration and document shape must enforce the no-automatic-upload rule.”

**C:** A stub is metadata-only in an ordinary response, but CouchDB replication can transfer bytes for attachments belonging to replicated documents; stubs alone do not promise that replication omits content.

**C* / selector delta:** “A CouchDB replicated document containing only an external photo-reference field necessarily causes CouchDB to fetch and send the referenced photo bytes.” Changed only media representation: CouchDB attachment → external reference field.

**Evidence and applicability:** S16 and S22. The document API distinguishes metadata/stubs from requested content; the replication protocol describes document-plus-attachment transfer. C **ENTAILS**. C* **UNDETERMINED**: the CouchDB protocol sources do not establish that a replicator follows application-level external references.

**Authentic excerpts:** S16: “summary of the attachments associated with the document, but not the attachment data itself.” S22: “The Document ALWAYS goes before its attachments.” Source identities and locators are in source-map.json.

**Disposition:** Retain and scope to embedded CouchDB attachments. If an external URI is stored without an attachment, application code must still avoid fetching/uploading it automatically. This protects the brief’s opt-in media-transfer constraint.

## Ordinary critique: brief coverage and research quality

### Original brief obligations

| Obligation | Assessment |
|---|---|
| Three laptops, up to a week disconnected; 50,000 observations; unknown photo size/speed | **Retained.** The draft does not invent capacity or transfer-time guarantees and proposes parameterized benchmarking. |
| Site ID, note, confidence, and separately stored photo links | **Retained.** Stable observation IDs are separated from site IDs and paths; references have per-device availability and missing media does not erase an observation. |
| Durable local edits, replay, and recovery from power loss during save/reconnect | **Retained and strengthened.** Event/projection/sequence and import cursor are transaction-bound; acknowledgement, replay, backup, and crash-boundary cases are proposed. Hardware/filesystem guarantees are qualified. |
| Competing offline edits, identity, conflict representation, and explicit review | **Retained.** Causal context, operation IDs, alternatives, tombstones, and resolution events avoid treating a transport winner as consent. The CouchDB body-fetch detail in SCW-05 should be added. |
| Delete plus photo-add must not silently resurrect | **Retained.** Tombstone plus pending/unlinked photo reference, explicit restore, and no implicit observation recreation satisfy the hard condition. |
| No hosted account, no automatic photo upload, no wall-clock winner | **Retained.** Local relay/manual exchange remain options; photo bytes are separately selected; timestamps are informational. CouchDB’s attachment exception is properly qualified. |
| Manual transfer option, bounded integration sequence, failure-oriented validation | **Retained.** A shared idempotent package is a required fallback; proposed scenarios cover repeated/reordered/partial import, identity reset, storage failures, and one-week lag. |
| Research-backed proposal; distinguish proposed validation from performed work | **Mostly retained.** No app tests, crash tests, benchmarks or executable witness are claimed. Upstream PR CI is attributed to upstream. |
| Explore primary documentation, relevant repository code/callers/tests, and issue-to-fix/release history where consequential | **Material incomplete / honestly unresolved external input.** The package sources and upstream fix history are useful, but the allowed packet does not identify or include the existing survey application's repository, callers, schema or test suite. The draft lists engine/language/OS as owner questions but does not explicitly state that current-app integration paths were not inspected. Before a product recommendation is treated as integration-ready, obtain the app repository and inspect save/read paths, current IDs and photo references, callers, migrations, and existing tests. This reviewer did not read outside the input map. |

### Released-plan disposition review

- **Paragraph 1 — transactional store plus separate append-only journal:** Correctly retains the two logical duties while rejecting two unrelated writes as atomic. Identity epoch, sequence, operation ID, and causal context address the plan’s author-label/revision-number weakness. SQLite Session remains an optional row-delta mechanism, not a domain audit log. No material error found.
- **Paragraph 1 — operator-selected photo directory, relative links and hashes:** Correctly preserves separate bytes and explicit transfer, and identifies portability, filename reuse, missing-file, and manifest gaps. The claim that hashes detect change but do not assure availability is sound. CouchDB stub/replication distinction is scoped in SCW-06. No material error found.
- **Paragraph 1 — LAN relay plus removable-media fallback:** Correctly keeps both as transports and makes the removable package resumable/idempotent; it does not make a hosted account mandatory. A relay’s local durability and required replica set remain owner decisions. No material error found.
- **Paragraph 1 — no hosted account:** Correctly preserved as a hard constraint; optional local setup does not become a hosted-account prerequisite. No material error found.
- **Paragraph 2 — relay arrival order:** Correctly rejected as semantic order; event causality and replay policy are more appropriate.
- **Paragraph 2 — revision mismatch card:** Correctly treats mismatch as a stale-base signal rather than a complete conflict detector; card content and all alternatives are improved. For CouchDB, fetch conflict bodies as SCW-05 describes.
- **Paragraph 2 — nonoverlapping merge and delete-versus-edit review:** Correctly conditions field merge on causal independence and expands review to delete/photo-add. Explicit tombstone-linked restore meets the no-resurrection constraint.
- **Paragraph 2 — local revision numbers plus author label; discard on ack:** Correctly rejects both without an epoch/unique event identity and durable, replica-aware acknowledgement/retention semantics.
- **Paragraph 2 — unresolved reinstall/lost-ack/interrupted-transfer behavior:** Correctly converts these into explicit engineering obligations and restart tests; keeping duplicate imports idempotent is consistent with the brief.
- **Paragraph 2 — wall clock:** Correctly retains display-only use and forbids winner selection.
- **Paragraph 3 — atomic save/append:** Correctly turns “should appear atomic” into a testable all-or-none transaction invariant, with explicit local SQLite caveat.
- **Paragraph 3 — no selected database transaction or file protocol; explicit attachment copy:** Correctly keeps engine choice open while specifying the media staging/reference boundary. The proposed SQLite backup API is a snapshot, not merge.
- **Paragraph 3 — retention setting and recovery unspecified:** Correctly withholds a user-facing retention control pending recovery rules; season horizon, legal/archive needs, and replica acknowledgements remain owner choices.
- **Paragraph 3 — duplicate replay, interrupted saves, delete/photo reconnect, copied-store restore:** Correctly expands the proposed suite and labels it unexecuted.
- **Paragraph 3 — no checks run:** Status is accurately separated: source research occurred, but local application tests, crash tests and benchmarks did not.
- **Paragraph 3 — settle identity/durability before convenience merge:** Correctly orders product semantics and recovery before production merge behavior. Exploratory prototypes in the sequence are not a product commitment.
- **Paragraph 4 — provisional, evidence-resolved, no deployment:** Correctly preserves proposal-only status and leaves data-ownership questions open.

### Issue classifications and open inputs

- **Material incomplete:** CouchDB review-path detail: conflicts=true lists losing revision IDs, while open_revs=all is needed to retrieve bodies; see SCW-05 and S14.
- **Material incomplete / honestly unresolved external input:** Existing application repository, callers, schema, and tests were not identified in the allowed packet. Record this limitation explicitly and resolve it before integration commitments.
- **Minor locator/wording:** Investigator S13 says Automerge issue #889 was “observed Open.” Direct GitHub inspection during this critic stage shows it Closed and converted to a discussion by 2026-09-10; the report itself names @automerge/automerge 2.1.11. This stale status does not establish behavior in tagged 3.4.1 and does not change the draft’s version caveat. Correct the critic’s source annotation; do not silently rewrite the investigator record.
- **Minor locator/wording:** Official CouchDB 3.5.x release notes put PR 6129 under Version 3.5.3. Be explicit that this establishes the upstream 3.5.3 release’s inclusion, while the actual packaged/deployed candidate remains unknown.
- **No material wrong correction found.** The SQLite, Automerge, CouchDB, and manual-bundle alternatives remain feasible but conditional; the draft does not falsely declare a winning product.
- **Other honestly unresolved owner inputs:** Editable/immutable fields, duplicate-observation semantics, restore identity, media path portability, retained history horizon and replica set, acceptable LAN availability, OS/filesystem, language/engine, and representative media/throughput. These cannot be settled from primary product documentation.

## Validation and preservation status

The proposed checks are not executed checks. This critic stage ran no application test suite, executable witness, crash injection, benchmark, or local prototype. Primary documentation, tagged source, issue reports, and upstream release/PR history were read for this review. The input plan-reveal.json byte counts and SHA-256 values match discovery.md and revealed-plan.md exactly; the draft quotes the released-plan clauses with dispositions. It retains the full brief’s no-hosting, opt-in-photo, no-wall-clock-winner, manual-transfer, and no-silent-resurrection constraints. Required outputs are this critique and the separate critic source map/index; no final proposal is authored or repaired here.
