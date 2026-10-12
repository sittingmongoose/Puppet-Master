# Independent critique — A-F01-A1

**Review scope.** This is the critic-stage review of the assigned brief and the single released plan, not a replacement proposal or implementation instruction. I read the complete brief, investigator discovery and draft, investigator source map and index, revealed plan, and plan-release record from the frozen paths in the input map. The released-plan hash recorded at reveal is `9415bac7a1feba432895879eaa283f75facac34896039a869facf5b620c1f8d4`; the draft hash read for this review is `b67e503f9a726765b65d730054f22bd65b892556c83d7fb8fd65e131b206b083`.

I independently checked the primary documentation for the consequential claims noted below and inspected the PouchDB issue, pull-request diff, changed IndexedDB code, regression-test source, and release notes. The source IDs used here retain their investigator-map identities; the critic-stage source map records my paths, locators, access times, and limits. I did not run application code or tests. No application repository, language, storage build, or caller/test path was supplied in the frozen inputs, so app-specific compatibility remains an external input.

## Assessment

The released plan correctly identifies a local store, journal, relay, removable-media fallback, conflict cards, and failure-oriented validation, but its arrival-order merge rule, local-revision-plus-author identity, and discard-on-ack assumption are unsafe for this offline case. The draft rejects those assumptions and substantially improves identity, causal history, tombstones, photo references, recoverability, operator explanations, alternatives, and validation. Its central direction is supported by the cited evidence, and it does not select an unsupported winning database or claim that proposed tests have been run.

The draft is close to a complete research proposal, but three design gates remain material before an implementation proposal can claim these guarantees: make device identity and cloned-store handling enforceable; define a minimum retention/recovery rule for the one-week offline case and unresolved branches; and define crash recovery across the database and any separately stored photo files included in a transfer. Package validation also needs an explicit import boundary. These are review findings, not a request to narrow the brief or choose a product from evidence that cannot choose one.

## Findings

### F-01 — Arrival order cannot define merge truth

**Classification: material wrong in the released plan; adequately corrected in the draft.**

The plan says the relay “accepts operations in arrival order” (revealed plan, paragraph 2). With offline branches and retries, arrival order can vary by device and transfer path; it is not evidence that one edit observed another. The draft correctly treats arrival counters as transport progress, uses causal parents/frontiers for the observed history, holds missing-parent operations pending, and requires the same result under all delivery permutations (draft, “Proposed operation and identity contract,” “Reconnection…,” and validation rows “Causality versus arrival”). CouchDB and PouchDB documentation confirms that offline peers can retain concurrent branches and expose conflict leaves; the transport does not turn one branch into the causal winner [CDB-01, PDB-01, PDB-02]. The draft’s rule is a proposal that still needs its listed order-permutation test; no such test ran here.

### F-02 — Local revision and author label are not operation identity

**Classification: material wrong in the released plan; materially improved but still material incomplete in the draft.**

The plan assumes a per-record laptop revision plus author label uniquely identifies an operation (revealed plan, paragraph 2). A per-record counter can fork or reset, and a label is not a uniqueness guarantee. The draft appropriately requires immutable operation IDs, installation identity, causal parents, a local sequence for diagnostics, stable IDs on retransmit, and quarantine for the same ID with different payload bytes (draft, “Proposed operation and identity contract”; plan-disposition table).

The remaining gap is the identity lifecycle. The draft says a clone used as a separate laptop must receive a new device-instance ID “before edits,” but specifies no enforced re-key step, clone detection, or safe recovery if both copies edit before either is re-keyed. The proposed test states the expected outcome without specifying the mechanism that makes it happen. Before treating collision safety as a guarantee, the implementation gate should define how a restored backup differs from a new independent replica, how cloning/reinstallation assigns identity, and how an already diverged clone is detected and quarantined. The exact encoding can remain a later engineering choice, but it cannot be an unowned implementation detail because it is central to preserving edits.

### F-03 — Acknowledgment is not a retention or deletion proof

**Classification: material wrong in the released plan; corrected in principle but material incomplete on retention bounds.**

The plan says acknowledgment permits discarding sent segments while explicitly leaving lost acknowledgments and reinstall/recovery unresolved (revealed plan, paragraph 2). The draft correctly rejects that rule: retries must be idempotent, a receiver acknowledges after durable import, a relay acknowledges only its own receipt, and source operations/deduplication remain available through a declared recovery horizon (draft, “Reconnection…,” plan-disposition table, and “Owner decisions”). This addresses the plan’s most dangerous data-loss assumption.

The one-week requirement needs a stated floor: a policy must retain enough source operations and deduplication information for at least the planned disconnected interval plus the time required to reconnect, discover, and complete transfer. The draft says a laptop offline for a week must still catch up, but leaves the horizon to an owner decision without tying that decision to the one-week bound. It should also explicitly say whether unresolved conflict branches are ineligible for pruning until a user resolves them; the draft promises recoverable unresolved branches in one place, then describes a recovery period and later pruning elsewhere. Resolved-history retention and unresolved-conflict retention need distinct rules. The exact longer-term archive period and retirement policy are honestly owner decisions.

### F-04 — Database atomicity does not cover optional external photo files

**Classification: material incomplete in the released plan; substantially improved but still material incomplete in the draft.**

The plan requires the save and journal append to “appear atomic” without choosing one transaction or a coordinated file protocol (revealed plan, paragraph 3). The draft improves this substantially: one embedded-store transaction should persist the operation, materialized view, causal frontier, and relevant local state; if that is unavailable, an explicit recovery protocol is a prerequisite. Its SQLite discussion is appropriately bounded: the Session Extension is build-dependent, requires declared primary keys, and coalesces repeated updates made in one session; SQLite’s crash-test VFS is not proof for the chosen laptop build or filesystem [SQL-01–SQL-03].

The draft also allows optional photo bytes in removable-media bundles while storing photo files outside the journal/database. Its “all-or-none local transaction” can make database rows atomic, but cannot by itself make an external file copy atomic with that database commit. The proposal should define the order and restart behavior for included files (for example, staged files, integrity verification, durable placement before committing references, and cleanup/recovery for an interrupted import) and test interruption at each boundary. The database-only save claim should remain distinct from the file-plus-database transfer claim. This matters even though photo bytes are reference-only by default: explicit inclusion is a supported path in both the draft and brief.

### F-05 — Import validation is stated as an outcome, not yet a bounded contract

**Classification: material incomplete.**

The draft requires versioned segments, checksums, schema validation, deduplication, and rejection of truncated or unsupported packages without partial database changes (draft, “Reconnection…” and validation rows “Lost acknowledgment…” and “Corrupt, unsupported or partial manual bundle”). That is a sound baseline. It does not yet define what package validation must reject before interpreting relative photo locators or staging files, how size/resource limits are enforced, or how an unknown schema and a repeated operation ID with changed contents interact during a batch. These details should be named as import-gate conditions and covered by tests; the checksum should be described as integrity detection, not proof of a trusted sender. The brief does not require a complete security model, so these remain design details rather than grounds to reduce the scope.

### F-06 — Recovery cards and user choices are materially improved

**Classification: material incomplete in the released plan; adequately addressed in the draft for a proposal.**

The plan promises a conflict card with an old value and both edits, and routes delete-versus-edit to review, but does not define delete-versus-photo choices or an explicit restore event. The draft gives the operator the common base and competing values, preserves source branches, supports postponement, treats delete as a tombstone, and makes restoration a new explicit operation. It separately handles delete-versus-photo, missing-file status, and non-automatic byte transfer, with plain-language operator messages (draft, “Conflict decisions…” and operator explanation). This honors the no-silent-resurrection and no-automatic-upload requirements. It also sensibly makes field merging conditional on known policy and commuting operations instead of asserting all different-field changes are always safe.

The proposal should preserve the distinction between “keep deleted,” “restore,” and “decide later” in any later UI design; no choice should silently discard the competing branch. The draft already says this. Whether a second person may approve a restore is correctly left to the group.

### F-07 — Alternatives and technical claims match the checked evidence

**Classification: no material wrong or unsupported claim found in the consequential claims independently checked.**

- CouchDB’s normal read hides conflicts behind a deterministic winner; callers must request conflict metadata and fetch leaves, while compaction discards non-leaf bodies and pruning bounds revision history [CDB-01]. The draft describes these limits and does not treat a winner as a resolved result.
- PouchDB’s own guides describe local-to-local replication, live retry after disconnection, concurrent branches, and revision-associated binary attachments [PDB-01–PDB-03]. The attachment bug chain is specific and well bounded: issue #8456 describes an IndexedDB replication case where a reference could be associated with a revision that did not carry the attachment; PR #8460 changed the code to check the written revision and added an integration test; the official release notes list #8460 in 7.3.0 [PDB-04–PDB-06]. I inspected the diff/test source but did not execute it. This supports a regression-test scenario, not an assertion that this proposal or any selected adapter passes.
- SQLite’s Session Extension has the primary-key/build-flag constraints and coalesces multiple updates in one session; patchsets omit old values and cannot detect data conflicts. The crash-test documentation describes simulated partial/out-of-order writes and explicitly leaves platform/filesystem/flush behavior as a condition [SQL-01–SQL-03]. The draft’s comparison does not overstate those results as target-platform proof.
- Automerge’s conflict API exposes losing concurrent values, but ordinary property reads choose a deterministic value and a later assignment clears the conflict; map deletion concurrent with a set leaves the set value [AM-01, AM-02]. Its explicit record tombstone warning is therefore relevant. The storage/compaction description is a reason to pin and inspect the selected binding and retention behavior, not proof of a seasonal archive [AM-03].
- RxDB documents a custom backend protocol, offline resume, and a default conflict handler that drops fork state in favor of master; the draft correctly requires a custom loss-preserving policy for this case [RX-01].

These sources are alternative-specific and mostly unversioned documentation, not evidence of compatibility with the survey application. The draft states that limit and does not declare a universal winning product.

### F-08 — App integration and policy remain external inputs

**Classification: honestly unresolved external input.**

The brief says the desktop application exists, but the input map supplies no application repository, caller/test paths, language, selected store, or shipped SQLite build. The plan itself leaves the transaction boundary unresolved. Therefore neither this critic nor the investigator could verify the current app API or inspect app callers. The draft correctly makes application inventory its first integration step and leaves the storage choice, author-label workflow, notes policy, digest format, restore authorization, office-LAN use, photo sizes, connection speeds, and service levels open. These are not answers that the cited database documentation can supply.

### F-09 — Validation is proposed, not reported as run

**Classification: no misrepresentation found.**

The investigator states that no code, functional, performance, or crash-recovery tests were run. Its validation matrix is explicitly proposed. I likewise ran no code or tests. The suggested duplicate/out-of-order delivery, delete/edit/photo, lost-ack, corrupt-package, power-loss, retention, scale, and operator-comprehension scenarios are appropriate for the brief. The matrix should add the identity-lifecycle and external-photo staging cases identified above. The 50,000-observation figure is correctly treated as a sizing input, not a demonstrated capacity claim.

## Brief and plan coverage

The draft preserves all fixed brief constraints: three offline laptops and a week without connectivity; up to 50,000 observations as a benchmark input; photos outside normal synchronization; no required hosted account; no wall-clock winner; no silent resurrection; and manual transfer when the network is unavailable. It proposes a local relay as optional and removable-media transfer as supported. Its sequence gates identity/durability before convenient merge behavior and pilot sizing. It does not mandate a language, database, note-merge policy, photo size, or connection speed.

The exact plan dispositions are generally faithful: retain the logical journal/view roles, relay and manual package route, display timestamps, explicit attachment selection, user review, staged implementation, and proposed validation; correct arrival-order truth, weak identity, discard-on-ack, and under-specified atomicity; and keep truly owner-dependent choices open. The draft does not silently downgrade the manual-transfer or delete/photo obligations. Its process/deadline text is correctly treated as a boundary, not product behavior.

## Review disposition

Accept the draft’s architecture and evidence framing as a strong proposal basis, subject to closing F-02 through F-05 before implementation commitments or safety claims. In the next revision, require an enforceable identity/clone lifecycle, a retention floor tied to the one-week offline requirement with unresolved branches protected, and a crash-safe protocol for optional external photo files. Define the import validation boundary and expand those failure tests. Keep actual app-store selection and policy choices open until the application and field group provide the missing inputs. No final product prose or implementation was written by this critic.
