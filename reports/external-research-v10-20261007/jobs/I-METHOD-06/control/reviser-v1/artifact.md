# Proposed change: Project snapshot, two repository copies, verification, and Restore as New

**Artifact type:** complete revised replacement proposal for the bounded I-METHOD-06 slice.  
**Status:** design proposal only. No canonical Plans, product code, repository, backup, restore, retention policy, or application state was changed. No tests or product checks were run.  
**Scope:** one Project; two destination attempts; one coherent capture; explicit verification evidence; and a proposed isolated Restore-as-New drill.  
**Review basis:** the exact supplied researcher artifact/source map, critic artifact/source map, and mapped captures copied under [sources/](sources/). No original case packet, parent history, other arm, assessor feedback, or new source was read.  
**Times and source operations:** recorded in [source-map.json](source-map.json).

## O1 — Authority, scope, and product boundaries

Plans/Backup_Restore_System.md remains the sole product owner for Project Backup, Full Server Backup, repositories and destination attempts, manifests, verification, test restore, retention, receipts, restore modes, and readiness. This proposal is limited to one Project and two destination attempts. Internal recovery points, Settings transfer, Project Move, Duplicate With History, and Full Server Backup remain distinct products. Storage retains physical persistence and internal recovery; Settings retains configuration transfer; Project Sync retains Move authority; credential and security owners retain custody and portability decisions. An engine observation does not change these owners or imply runtime readiness.

The proposal retains the inherited separation among saved files, durable recoverable editor buffers, dirty or uncommitted source, Git/Jujutsu operation state, and unavailable process-only memory. It does not manufacture a commit or JJ operation, claim process-only memory was backed up, or treat rebuildable indexes as portable authority. Source/code closure, exact compatibility, exclusions, and owner receipts remain explicit capture inputs.

## O2 — One coherent capture and immutable evidence

The Server-owned BackupCoordinator captures through one version-pinned BackupEngineAdapter; the engine is not another coordinator or canonical PM store. Storage supplies a CaptureBarrierService to flush/close the seglog boundary, export non-rebuildable redb consistently, pin replay watermarks and CAS manifests, and identify rebuildable Tantivy and declared projections. Freeze one staging generation only after the owner receipts agree, then release the application barrier before network upload. Do not copy open database/log files opportunistically or hold the barrier during remote transfer.

Use three distinct evidence objects:

1. **Immutable CaptureManifest.** It binds capture_set_id, exact Project and source Host/Environment, app/storage/engine/protocol compatibility, consistency vector and included generation references, each included relative path/object, family, size and digest, exclusions and reasons, source-code inclusion and Git/Jujutsu closure. It has one digest and never receives destination-specific IDs after capture.
2. **Append-only DestinationReceipt.** Each destination attempt records its own repository_id, snapshot_id when emitted, reference to the unchanged CaptureManifest digest, attempt/retry identity, process outcome, repository reconciliation, commit/promotability state, verification receipts, failure evidence and timestamps. A retry appends a new attempt receipt; it does not rewrite the other destination or the capture manifest.
3. **Optional operation envelope.** A join of the immutable manifest and the destination receipts may be published as a separately versioned and digested envelope. It is not a reason to mutate either underlying receipt.

The durable phase journal remains authoritative for restart/cancel convergence. The append-only destination receipt is authoritative for that attempt’s observed outcome and retry identity; restoration selects only the exact immutable snapshot named by an eligible destination receipt, never “latest.” If the journal, receipt, repository state, or their association is missing or contradictory, stop in a visible unresolved/failed state; do not synthesize success or retarget.

### Source completeness and saved-but-incomplete engine output

The Restic 0.18.1 issue #5667 reports a Windows malformed-path case with an empty saved snapshot. The merged #21852 fix appears in release v0.19.1. In the pinned v0.19.1 caller, all inaccessible targets return before repository open, while a mixed accessible/inaccessible input can continue through snapshot creation and then report ErrInvalidSourceData. The shipped TestFilterExistingUnreadable covers helper behavior for ENOTDIR and an embedded NUL, including all-invalid and mixed lists; it is not an end-to-end repository-write test. Therefore neither a snapshot ID nor a process status by itself proves a complete PM capture. [Research S01–S05; critic P01–P05]

For a mixed-source incomplete outcome, reconcile the process result with repository state. Preserve an emitted engine ID as failed/incomplete evidence, but mark it non-promotable: it cannot replace the last complete recovery point, satisfy a two-copy completion claim, or enter ordinary restore selection as a verified copy. Retain it quarantined or otherwise inaccessible to normal restore selection until existing retention/hold rules and an owner-approved cleanup policy safely dispose of it. Do not delete it by inference. The all-inaccessible path and mixed path are separate cases; do not generalize the first path’s no-repository-open behavior to the second.

The exact incomplete-mixed case needs a PM adapter fixture that observes both the repository write and the returned error, then verifies non-promotion and retry of only the failed destination while the other destination remains intact. The supplied upstream helper test is not that fixture, and neither test has been run here.

## O3 — Two destination attempts and truthful outcome

Build both attempts from the same frozen capture generation and bind each to a separate Project repository. The bounded default proposal is a separately reported engine operation for each destination from that staging generation; this avoids a hidden read dependency on the first repository. Restic repository copy remains an option if owners accept its read/upload bandwidth, possible egress cost and deduplication tradeoff; it still needs a distinct destination receipt and verification. Rclone copy may be considered only as a bounded transport after an adapter proves identity, integrity, atomic publication, and resumable partial-write behavior. It is not a PM snapshot or completion receipt. Reject rclone sync against a live Project Vault because it makes the destination match the source and may delete destination-only content. [Research S08, S14–S15]

Each destination has its own attempt state, lock, retention/prune authority, snapshot identity, error and evidence. Failure of one cannot erase, downgrade, or turn the other green. If the product decision is that both commits are mandatory for this bounded operation, two committed snapshots from the same capture set are required; one success and one failure is partial, and retry is scoped to the failed destination. Whether two commits are a mandatory operation terminal remains an owner decision, not a settled product choice in this proposal. Whatever policy is chosen must display the two per-destination states and must never represent one committed copy as two.

Two repository IDs establish separate repository authority, not separate disaster or compromise fate. Record material correlation dimensions for disclosure: administrator/account and credential authority, provider/control plane, region/site, network path, and online/offline or tested immutable protection. These are proposed disclosure fields, not an independence threshold. Until the owner sets a minimum threshold and the adapter has evidence that meets it, the user-facing state is “two repository copies; independence limited/unknown,” with known shared or unknown domains named. No badge or receipt may infer independence from paths, buckets, credentials, or successful upload alone. An offline/immutable destination remains an option; no provider or Object Lock capability is selected or certified here. [Research S17]

## O4 — Verification choice and claim ladder

Every verify dispatch binds one immutable backup_id and snapshot_id to an explicit direct depth or current owner-resolved verification plan, plus a typed admission for that exact target, scope, permission/currentness, cost class and expiry. Producers present the depth/plan choice on every route. The owner revalidates it and does not retarget “latest,” adopt a superseded plan, or silently narrow scope. Receipts preserve requested depth and performed scope; a pass requires a match. A canceled or stopped-early full read remains failed with evidence. Only cmd.backup.test_restore may issue a restore-drill receipt.

Keep these distinct evidence levels:

1. **Captured:** owner barrier and coverage manifest identify the immutable Project generation and exclusions.
2. **Committed:** a destination receipt binds its immutable snapshot/commit ID to the manifest digest. This says nothing about later readability.
3. **Structural:** engine repository/index/snapshot/tree/reference checks pass for the admitted target. It does not read every data pack or prove application restore.
4. **Sampled data:** record exact selection, algorithm, inventory identity, and packs/files actually read. This is partial data-read evidence and never “full verification.” A Restic n/t schedule may claim complete coverage only over one fixed, identified pack inventory. Store its inventory generation/digest in every partition receipt; if the inventory changes, invalidate the coverage claim and start again against the new inventory. Percentage/size selection is random and does not guarantee eventual complete coverage.
5. **Full data:** the pinned engine reads all admitted data packs for the selected repository/snapshot scope. Restic check defaults to structural checks; --read-data reads all data and --read-data-subset reads a subset. Record bytes/pack scope, engine version, destination, snapshot, time and errors. This is repository-format/data-read evidence, not PM importability or external-credential readiness.
6. **Restore as New drill:** a separately executed PM import of the exact immutable snapshot into an isolated recovery target, with a fresh Project ID, all identity-bearing references rewritten, staged and post-restore checks passed, and expected durable content opened after declared derived indexes rebuild. Keep environment, build/protocol versions, target prerequisite, source snapshot, checks and failures in its own receipt. A pass for one destination does not confer a pass on the other.

Restic’s versioned docs support the structural/full/subset distinction and say repeated random subsets are not a deterministic full-coverage claim. Kopia documents structural/blob availability separately from downloading, decrypting and decompressing data, and its file verification/restore options are alternatives only. The captured Kopia 0.15.0 ENOSPC issue is historical and does not establish a current defect. Borg 1.4.5 documents full-data verification at significant cost; repair is separate and potentially lossy. None of these alternatives proves PM identity rewrite, compatibility or app readiness. Do not select Kopia or Borg for this slice on this evidence. [Research S06–S13; critic P06–P08]

## O5 — Restore as New, with the existing recovery prerequisite

The recovery operator selects one snapshot_id from one destination, not “latest”; validates destination/Kit trust and capability; authenticates and unlocks through protected Recovery Key submission; loads the encrypted manifest; reviews coverage, compatibility, excluded secrets, cost/retrieval constraints and missing source/auth readiness; then produces a RestorePreviewReceipt and obtains approval. Preview/browse content stays untrusted and cannot execute or escape its sandbox.

The proposed drill uses a disposable isolated recovery Server/workspace with a fresh namespace and no automatic source-network, agent, hook, macro, credential or external-service access. Stage in quarantine; check staged hashes, schema/storage compatibility, path/identity mappings and Project-ID non-collision; rewrite every identity-bearing reference; rebuild declared derived indexes from canonical restored bytes; post-verify actual load/read/use; report external reattachment and sign-in separately. Activate only inside the isolated new Project through atomic or journaled recoverable boundaries. Refusal or failure leaves the live Project untouched. Test each destination separately; a two-destination recovery claim requires a passing drill from both.

**Blocking condition:** retain the normal BRS-023 verified target recovery-point prerequisite for this drill. A fresh empty disposable target may have no prior receipt. Until the owner defines evidence that satisfies the existing prerequisite for that exact target, the drill is not described as executable and cannot produce a passed recovery claim. Do not invent a “nothing to recover” receipt, silently waive the prerequisite, or use emergency consent as a shortcut. The narrowly scoped BRS-023 alternative remains only verified unavailability plus current explicit human consent bound to this restore/mode/target/preview/approval/idempotency; consent does not create a recovery point or rollback capability.

Browse, compare, verify, download, extract and archive retrieval remain separate non-mutating operations. Existing in_place, selective, and server_full modes and the Settings strategy are retained by reference; this proposal adds no mode and does not expand Full Server implementation design. NIST SP 800-34 Rev. 1 supports testing recovery on an alternate platform from backup media and documenting outcomes/lessons; it does not certify PM or resolve the BRS-023 prerequisite. CISA supports offline encrypted backups and recurring availability/integrity testing; it does not select a destination family. [Research S16–S18]

## O6 — Completion, readiness, and validation

The operation record exposes capture completeness, each destination commit, integrity depth, and isolated restore-test state independently. “Two copies committed” requires two destination receipts that identify committed snapshots from the same capture set. “Integrity checked” states structural, sampled or full-data scope per snapshot. “Recovered successfully” requires the separate Restore-as-New drill and its post-restore checks. “Ready” follows the retained owners’ source, credential and compatibility classifications. A static plan, manifest, hash list, engine exit status, receipt schema or concept UI is not runtime or recovery proof. Never inherit verification or drill evidence across snapshots/destinations; never run repair automatically during verification.

Later authorized implementation validation proposals (none ran in this stage):

1. **Source completeness:** accessible roots yield complete capture; all inaccessible roots yield no snapshot/commit; a mixed required-root case can yield engine output plus explicit incomplete/error, never a green or promotable result. Cover malformed Windows paths, ENOTDIR, permission denial, offline/disappearing sources and mid-read failure.
2. **Barrier and generation:** inject Project mutation, redb transaction, seglog append, replay watermark movement, CAS update, move/removal and editor-buffer changes at each boundary. Verify the exact generations recorded; upload only immutable staging after barrier release; no live database file is copied.
3. **Two destinations:** in temporary repositories, cover both succeed, either fails before upload, mid-write or after commit, and process death around the commit marker. Preserve each attempt and retry only the failed one. Validate disclosure of actual shared/unknown domains, but do not claim independence until the owner threshold exists.
4. **Verification depth:** for each immutable snapshot exercise structural, sampled and full-data admission. Corrupt manifest/tree/reference and data-pack cases separately. Record actual sampled packs and the fixed inventory ID for each deterministic partition; invalidate old partitions on inventory change. Cancellation, resource failure, stale admission, target mismatch and requested/performed mismatch remain failed; no target switch or automatic repair.
5. **Restore as New:** conditional on owner resolution of the BRS-023 empty-target prerequisite. Then drill each destination in a fresh isolated target with new Project ID; test collisions, reference rewrites, FileSafe path/Unicode/traversal/case conflicts, excluded secrets, missing source/auth states, compatibility, full content read, derived rebuild, app-open invariants and post-restore receipt. Inject failures at quarantine, staging, activation and receipt publication; demonstrate live Project untouched and rollback only when a real recovery point exists.
6. **Evidence/readiness:** schema-positive/negative fixtures, receipt joins, holds and per-destination state; separate fresh backup/restore/restart drills before readiness. Mark unavailable lanes not_run with named risk. Static schema/validator success never advances runtime readiness.

No tests, product build, backup, restore, repository repair, retention change, security/accessibility/parity/performance check, or application validation ran here. Upstream PR-reported checks remain PR-reported and were not run by this stage.

## Complete comparison with the inherited frozen slice

| Frozen decision/reference | Disposition | Revised proposal |
|---|---|---|
| BRS-001, Backup_Restore_System.md lines 61–95: sole owner; four products; Move/Duplicate boundaries | **Already covered; retain.** | Keep the inherited owner and product split. No engine finding transfers storage, Settings, Move, credential, command/event or GUI ownership. |
| BRS-004, lines 181–225: destination profiles, independent Project repositories, policy/manifest, attempts, retention protection | **Retain and clarify.** | Preserve the contract; separate immutable capture digest from append-only destination receipts. Disclose material failure-domain correlation. Independence threshold and whether both attempts are mandatory remain owner decisions. |
| BRS-005, lines 227–268: phases, capture consistency, evidence axes, journal, restart/cancel, no false success | **Retain and strengthen.** | Preserve phase/journal and partial-write protections. Reconcile process outcome with repository state; mixed-source emitted snapshot is failed, incomplete and non-promotable. Add the PM adapter fixture; no claim it ran. |
| BRS-006, lines 270–311: four mutating modes; browse/retrieve separation; preview/quarantine; approval; recovery prerequisite; as_new rewrite | **Already covered; retain, drill conditional.** | Keep all four modes and identity rewrite. Apply a separate isolated drill to each selected snapshot. BRS-023 blocks calling the fresh empty-target drill executable/passed until its prerequisite is resolved. |
| BRS-010, lines 444–482: broad acceptance matrix; static artifacts do not establish readiness | **Retain; add cases.** | Add mixed-source non-promotion, two-destination partial failure, immutable inventory-bound partitions and conditional independent restore drills to later runtime validation. Keep all existing security, accessibility, parity, performance and readiness lanes separate. |
| BRS-017, lines 966–1007: one coordinator/adapter; Restic reference; per-Project repo; barrier/staging; source vs derived state; bounded rclone; no live sync | **Retain; qualify candidate.** | Keep one coordinator, barrier, immutable staging and no live rclone sync. Restic v0.19.1 is a researched baseline only, not an implementation pin. Provenance, SBOM, license, platform support, compatibility, security, update and rollback gates remain open. No second engine is selected. |
| BRS-019, lines 1053–1104: safe destination/Kit order; immutable snapshot selection; untrusted browse; preview; FileSafe; external endpoint; durable controls/shared owners | **Retain and clarify.** | Preserve safe order, immutable selection, untrusted preview, FileSafe and owner approvals. Display per-copy correlation and drill evidence; do not infer independence, use “latest,” auto-authenticate, trust scripts, or claim cross-filesystem activation atomic. |
| BRS-023, lines 1146–1184: phase-local evidence; target recovery prerequisite; narrow consent; no fabricated rollback | **Already covered; retain without relaxation.** | Keep the normal prerequisite and exact consent limits. Empty-target proof is an owner blocker for the proposed drill; no bypass is introduced. |
| BRS-030, lines 1776–1831: direct depth/plan, admission/currentness/cost, no silent downgrade, requested/performed match, drill receipt only from test_restore | **Already covered; retain and add inventory identity.** | Preserve all binding semantics. Record fixed pack inventory identity and actual selected/read packs; engine verification never becomes PM drill evidence. |
| Copied scope_and_owners.md lines 1–58 and non_goals.md lines 1–12 | **Already covered; retain.** | Preserve all eleven destination families and daily 7/4/6 seed; concrete version/provider capabilities, schedule vocabulary, RPO/RTO, cadence, OAuth and crypto admission remain downstream. Preserve secret exclusions, no silent install/path selection, no automatic writable multi-Server failover, no live database replication, and no production retention/deletion/restore authority from Plans. |

The table carries forward the exact references recorded by the researcher; the allowed input boundary did not include the owner documents themselves, so their current text and line spans were not independently re-opened in this stage.

## Criticism and disagreement disposition

| Critic item | Disposition in this rewrite |
|---|---|
| Preserve owner boundaries, bounded scope and no readiness promotion | **Agree; retained in O1 and O6.** |
| Restic #5667/#21852/v0.19.1 history and mixed-source caller semantics | **Agree with the supplied critic’s interpretation; retained in O2, with source-map support.** |
| Helper regression test is not an end-to-end repository write / Windows reproduction | **Agree; stated explicitly, with a PM adapter fixture proposed but not run.** |
| Structural/full/subset verification is distinct from PM restore | **Agree; retained in O4.** |
| Kopia, Borg, rclone, copy, CISA and NIST should stay cautious/documentation-level | **Agree; alternatives remain optional, bounded and non-selecting.** |
| P1: immutable capture digest conflicts with destination IDs appended later | **Accept correction.** CaptureManifest is immutable and capture-only; per-destination state is append-only receipt; any join envelope has a separate digest/version. Receipt/journal roles for retry and exact restore selection are stated in O2. |
| P2: incomplete Restic snapshot needs explicit promotion, restore and cleanup behavior | **Accept correction.** Reconcile process and repository; keep emitted ID only as failed evidence; no replacement, two-copy completion or ordinary restore selection; quarantine pending safe owner-governed cleanup. The PM write/error fixture is proposed, not executed. |
| P3: failure-domain dimensions do not establish a threshold | **Accept correction.** Fields are disclosure only. Label independence limited/unknown until an owner threshold and matching evidence exist. |
| P4: fresh empty target under BRS-023 is blocking | **Accept correction.** No execution or passed drill claim until the owner defines compliant evidence; no invented receipt or consent shortcut. |
| P5: discovery trace and partition coverage need more precision | **Accept with limitation.** O4 binds n/t receipts to a fixed inventory ID and invalidates them after inventory change. The trace below is explicitly reconstructed from supplied evidence, not a historical query log: exact user-need query strings were not present in the supplied source map, so none are invented. |
| Critic disagreement that repository IDs prove independence, that the manifest was stable, or that empty-target validation could be routine | **Resolve in critic’s favor as described above.** |
| Remaining objections: failure-domain threshold, mandatory-two-copy policy, acceptable empty-target proof, and incomplete-snapshot cleanup policy | **Remain open to the product/owner.** The proposal does not settle these decisions or claim a passed drill. |

## Problem-led evidence trace and alternatives

This is a trace from the recovery questions represented in the supplied proposal, mapped to captured evidence and plan dispositions. It is not a reconstruction of exact search strings or chronology.

| Recovery question | Captured evidence and finding | Plan disposition |
|---|---|---|
| Can a backup report a saved snapshot without a complete source set? | Restic issue/PR/release and pinned caller sources S01–S05; critic captures P01–P05. All inaccessible and mixed accessible/inaccessible paths differ; a mixed path can write before returning incomplete-source error. The helper test is not an end-to-end write test. | O2: receipt reconciliation, non-promotion and a future PM fixture. |
| Does engine integrity checking prove all bytes or PM recovery? | Restic command/checker/versioned docs S06–S08 and P06–P08 distinguish structure, full reads and subsets; deterministic partitions are only meaningful over the same pack inventory. | O4: explicit evidence ladder and inventory identity. |
| Are other mechanisms plausible without selecting them? | Kopia consistency/verify docs and historical issue S10–S12; Borg check docs S13; Restic copy docs S08. | Keep as alternatives only; no second engine or unexamined current defect claim. |
| Is a file transport enough, and can sync remove destination-only data? | rclone copy/sync captures S14–S15. | Copy only a bounded transport after adapter proof; reject live sync. |
| What supports offline copies and an alternate-environment recovery exercise? | CISA guide S16–S17 and NIST SP 800-34 Rev. 1 S18. | Support optional protected copy and documented recovery exercises; neither supplies a PM acceptance threshold or satisfies BRS-023. |

## Remaining owner choices and limits

1. Select the minimum destination failure-domain separation and user-facing claim.
2. Decide whether two successful commits are mandatory for this bounded flow.
3. Choose destination families and whether one must be offline/immutable; establish adapter capability and security evidence.
4. Decide separate uploads from immutable staging versus Restic copy after measuring bandwidth, egress, recovery independence and retry cost.
5. Pin an implementation engine/release only after provenance, SBOM, license, platform, compatibility, security and update/rollback gates. v0.19.1 is the examined research baseline.
6. Set verification admission costs and sampled/full-data/Restore-as-New cadence using real workload and destination costs.
7. Define BRS-023-compliant evidence for a fresh empty isolated test target before claiming the proposed drill is executable.
8. Confirm identity/reference rewrite coverage and app-level restoration invariants with Project/Storage owners; the cross-referenced owner contracts were outside the permitted read set.
9. Decide safe quarantine cleanup for incomplete engine snapshots under existing retention/hold rules.

No second critique of this rewrite was run. The supplied critic’s findings and objections have all been dispositioned above; explicitly open owner choices remain open rather than silently resolved.

