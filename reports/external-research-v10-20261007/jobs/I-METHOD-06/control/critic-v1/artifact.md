# Fresh critic: I-METHOD-06 research proposal

**Reviewed artifact:** control/research-v1/artifact.md and its complete source-map.json.  
**Review scope:** the full case brief and frozen plan, INPUTS.md, every admitted source copy, and independent checks against pinned public Restic sources.  
**Disposition:** preserve the proposal’s boundaries and most of its evidence model. The final reviser should resolve the material corrections below and keep the named owner decisions open. This is a critique, not a rewritten plan or product approval.

**First useful finding saved:** 2026-10-07T20:33:40Z.  
**Complete critic artifact recorded:** pending metadata finalization.  
**Evidence index:** [source-map.json](source-map.json); independent primary captures are in [sources/](sources/).

## Findings to preserve

1. The proposal correctly keeps Backup/Restore as the product owner while preserving Storage, Settings, Project Move, credentials/security, and shared runtime boundaries. The bounded work stays at one Project, two destination attempts, capture/verification, and Restore as New. It does not revive Iced, broaden into Full Server implementation, or promote research to runtime readiness.

2. The central Restic history is real and applicable. Issue #5667 documents a restic 0.18.1 Windows malformed-path case that saved a snapshot with zero files. PR #21852 merged commit 8d7679c on 2026-06-21; v0.19.1 release notes list the fix. At pinned commit 6aa3a516ce654808a1f28f9fa21e9b7c8e6e90bf, filterExisting skips paths when Lstat fails. When all specified paths fail, collectTargets returns ErrNoSourceData and runBackup returns before opening the repository. For a mixed accessible/inaccessible list, runBackup continues, calls the archiver, emits/finishes the snapshot, and then returns ErrInvalidSourceData. The candidate’s warning that a snapshot ID is not proof of complete capture is therefore essential. Sources: [issue #5667](sources/restic-5667-issue.html), [PR #21852](sources/restic-pr-21852.html), [v0.19.1 release](sources/restic-v0.19.1-release.html), [pinned backup caller](sources/restic-6aa3-cmd_backup.go).

3. The PR’s TestFilterExistingUnreadable is useful regression evidence for helper behavior: it covers an ENOTDIR path and an embedded NUL path, with all-invalid and mixed inputs. It is not an end-to-end test that observes a real repository snapshot write or the Windows quoting reproduction. Keep the proposal’s statement that the test was inspected rather than run; narrow any implication that this test alone proves the complete backup outcome. [Pinned test](sources/restic-6aa3-cmd_backup_test.go).

4. The verification ladder is well separated. Pinned Restic documentation and code distinguish the default structural check from reading all data and from subset reads. The n/t subset is a partition of the repository pack set for that run; percentage and size selections are random and explicitly do not guarantee eventual full coverage. The proposal correctly keeps an engine check separate from a PM restore drill and from application readiness. [Pinned check command](sources/restic-6aa3-cmd_check.go), [checker implementation](sources/restic-6aa3-checker.go), [versioned documentation](sources/restic-6aa3-working_with_repos.rst).

5. Keep the cautious treatment of Kopia, Borg, rclone, Restic copy, CISA, and NIST. The candidate labels documentation-only or historical evidence as such, does not choose an unexamined engine, and presents cost, cadence, immutability, and provider capability as unresolved. Preserve that restraint.

## Corrections and evidence needed before the final proposal

### 1. Separate the immutable capture digest from later destination receipts

The draft first says one capture generation has an immutable manifest digest, then says that manifest binds destination-specific snapshot references “as they become known.” Appending repository/snapshot IDs after each upload changes the hashed manifest and conflicts with immutability.

Keep one immutable capture manifest containing the capture_set_id, exact generation, inclusion/exclusion coverage, and content identities. Record each destination’s repository_id, snapshot_id, commit/verification state, and errors in a separate append-only destination receipt that references the unchanged capture-manifest digest. If a final envelope joins those receipts, give that envelope its own digest/version. State exactly which object is authoritative for retry and restore selection. This can preserve the proposal’s shared-generation design without making the manifest mutate.

### 2. Define PM handling for a saved-but-incomplete Restic snapshot

The pinned caller confirms a mixed-source run can write a snapshot and return ErrInvalidSourceData afterward (cmd_backup.go around lines 455–481 and 642–661). “Preserve the partial/error outcome per destination” and “never green” are directionally right but do not yet say whether this physical snapshot is committed, promotable, selectable, or retention-protected.

Require the adapter to reconcile both process outcome and repository state. A snapshot emitted on an incomplete/error outcome must not replace the last complete recovery point, satisfy the two-copy terminal, or enter ordinary restore selection as a verified copy. Record its immutable engine ID as failed/incomplete evidence; quarantine or otherwise make it non-promotable, and define safe cleanup under existing retention/hold rules. The adapter must not infer success from either an emitted ID or the process result alone. Add a fixture for this exact case, including retry of only the failed destination while preserving the other destination.

The all-inaccessible path is different: the pinned caller returns before repository open. Do not generalize that no-write property to mixed inputs. The exact helper regression test does not exercise a full archive write, so the proposed PM-side test must.

### 3. Keep “independent” provisional until a product threshold exists

The failure-domain list (account/admin/credential authority, provider/control plane, region/site, network, offline or tested immutable protection) is a useful disclosure proposal, but it is not evidence that two repositories actually fail independently and the brief/owner slice supplies no minimum separation threshold. Preserve the draft’s open product choice. Until the owner selects a threshold and destination evidence can establish it, label the outcome “two repository copies; independence limited/unknown” with named shared or unknown domains. Distinct repository IDs prove separate repository authority only. Do not turn the proposed dimensions into a release criterion by implication.

### 4. Treat the empty isolated target’s BRS-023 prerequisite as a blocking decision

The proposal correctly refuses to silently waive BRS-023, but a new disposable empty Restore-as-New target may have no prior recovery point to receipt. Until the owner defines what valid evidence satisfies the existing prerequisite for that exact test target, the drill cannot be described as executable or as evidence that the recovery claim has passed. Keep this as a blocking design question; do not invent a “nothing to recover” receipt or use the emergency-consent alternative as a shortcut. The later validation proposal must remain conditional on this adjudication.

### 5. Strengthen evidence for user-need-led discovery and subset coverage

The candidate compares every in-scope unit (BRS-001/004/005/006/010/017/019/023/030), and its alternatives section is useful. However, the draft/source-map list URLs, access times, and aggregate operation counts without the discovery queries or a compact problem-led sequence. The brief explicitly requires open discovery from the user need before narrowing to plan comparison. Add a short trace linking the initial recovery questions to the independently found mechanisms/alternatives, source, finding, and later plan disposition. This is an evidence gap, not proof that discovery did not happen.

For any multi-run Restic n/t coverage claim, bind the partitions to a fixed, identified pack inventory (or inventory generation/digest); Restic’s documentation divides the current repository pack set on each invocation. If the inventory changes between runs, old partition passes do not establish current complete coverage. The draft already says a fixed inventory is needed; make the inventory identity and invalidation rule explicit.

## Full frozen-plan comparison

- **BRS-001:** Preserve the sole-owner and four-product separation; no correction.
- **BRS-004:** Add per-destination identity and disclose failure-domain correlation. Keep the independence threshold unresolved; repository separation alone is not disaster-fate separation.
- **BRS-005:** Preserve independent capture, commit, verification, and drill axes, durable phase journal, and partial status. Add the saved-but-incomplete engine snapshot rule so output and exit status cannot produce false completion.
- **BRS-006:** Preserve exactly the four restore modes and the Restore-as-New identity rewrite, quarantine, post-restore checks, and truthful rollback. The isolated target still needs a BRS-023-compliant prerequisite.
- **BRS-010:** The proposed crash, source, two-destination, verification, and restore cases are useful additions. They remain proposals only; no product test ran.
- **BRS-017:** Preserve one coordinator/adapter, one version-pinned engine, the storage barrier, immutable staging, owner boundaries, and no live rclone sync. Treat v0.19.1 as researched evidence, not an implementation pin. Add the immutable-manifest/append-only-receipt split and the explicit partial-snapshot outcome.
- **BRS-019:** Preserve immutable snapshot selection, trusted recovery ordering, untrusted preview content, isolation, FileSafe and owner approval. Do not claim the target drill can pass until its recovery prerequisite is resolved.
- **BRS-023:** Preserve the normal prerequisite and exact consent limits without relaxation. The empty-target proof remains unresolved and blocks the proposed drill.
- **BRS-030:** Preserve explicit depth/admission/currentness/cost binding and requested-versus-performed receipt truth. Bind any partition schedule to an identified inventory. Structural/full/sampled engine results never become Restore-as-New evidence.

## Disagreement and unresolved objections

I agree with the candidate’s Restic source interpretation and its boundary between engine verification and PM recoverability. I disagree with any reading that the current draft already defines a stable manifest digest while destination references are appended, or that two repository IDs alone answer “independent copies.” I also consider the BRS-023 empty-target question a blocking prerequisite, not a routine later validation detail.

The following decisions remain with product/owner review: minimum failure-domain separation and the user-facing claim; whether two successful commits are mandatory for this bounded flow; acceptable evidence for a pristine isolated test target under BRS-023; and whether an incomplete engine snapshot is retained quarantined or safely removed under existing retention policy. No issue-history evidence examined here chooses those product policies.

## Execution and limits

Independent primary-source retrieval was read-only. No tests, product code, backup, restore, retention action, or canonical Plans operation ran. The cited Restic upstream checks are PR-reported checks, not tests executed by this critic. The critique does not claim a Puppet Master build, integration, or recoverability result.

**Source operations:** recorded in source-map.json. Native Goal aggregate counters are recorded there separately from distinct counters, which remain null/unknown where the native API did not expose them.

