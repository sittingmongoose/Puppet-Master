# I-METHOD-06 reviser proposed-change artifact

**Stage:** I-METHOD-06/treatment/reviser-v1  
**Input map:** /home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/jobs/I-METHOD-06/treatment/reviser-v1/input-map.json  
**Predecessors:** the exact researcher artifact/source-map and critic artifact/source-map listed in that input map.  
**Disposition:** complete revised proposal for the inherited O1–O6 and scoped plan sections. This is a plan, not an implementation, test, backup, restore, release, or readiness result.

## Conclusion

Retain the owner boundaries, independent capture/destination/verification/restore evidence, durable phase model, Restore as New identity allocation, and explicit refusal to infer recovery from a schema, hash, preview, copy command, or repository check alone.

Make incomplete source coverage an explicit failed or partial capture outcome even when the engine writes a snapshot from the accessible remainder. Keep that snapshot and destination attempt observable, but never make it a complete receipt, a last-known-good point, or a restore-tested recovery point on existence alone. The #4467 issue, fix, release and tagged implementation support the behavior; the inference that a mixed-source v0.19.0 run may leave a snapshot comes from its caller path plus the issue report, not from a test asserting persisted partial contents [R08–R13, R20–R21].

Keep each repository attempt separately evidenced. Distinct repository identities and receipts are the minimum contract reported for BRS-004; stronger physical or control-plane failure-domain separation remains a user threat/cost decision. A Restic copy is a candidate transfer, not a second destination’s verification or a restore drill [R06, R17–R18].

Treat verification as scoped evidence. Restic check --read-data reads all packs in the pack set it receives. With a snapshot filter, the checker loads the filtered trees and maps referenced blobs to their containing packs; without that filter, the read is repository-wide. Therefore a repository-wide read must not be labeled snapshot-scoped. For a snapshot-scoped full_data receipt, record the filter and establish that the filtered tree/reference set covers the selected snapshot; report the performed pack/object/byte coverage and errors [R05, R15–R16, R22].

Apply the shared BRS-023 recovery prerequisite to every mutating RestoreRun, including as_new, or state the exact authorized exception. This corrects the researcher draft, which limited it to destructive/in-place operations. The critique reports that frozen BRS-006 and BRS-023 say this; their cited original case files are outside the input map’s two admitted source directories, so this reviser did not read them. I adopt the correction conservatively, while marking direct owner-source confirmation as unresolved evidence before compilation or implementation.

## O1 — findings retained from bounded discovery

- Restic’s separate repositories and copy workflow do not establish independent failure domains. Different encryption keys may require reading and writing all data; interrupted copy progress and transfer cost remain options to validate [R06, R17–R18].
- Repository structure, pack reads, sample reads, and application recovery support different claims. Full repository reads can incur remote-read cost and still do not create a Puppet Master project, perform identity rewriting, or establish application usability [R05, R15–R16, R22].
- Issue #4467 reported that an inaccessible required source supplied by --files-from could be skipped while the remaining files were snapshotted and the old command returned success. The v0.19.0 fix changed mixed-source collection to return ErrInvalidSourceData while retaining accessible targets; runBackup marks that run unsuccessful, continues its backup path, and returns the incomplete-source error afterward. When no source remains, ErrNoSourceData ends collection without that partial-source path [R08–R13].
- The v0.19.0 integration and unit tests assert error results for mixed and all-missing paths. They do not assert that the mixed test persisted a snapshot or verify its contents. The “partial snapshot may exist” statement is a code-path inference supported by the issue report, not a test result. No test was run here [R08, R11–R13].
- At v0.19.1, filterExisting treats any Lstat error as skipped and reports incomplete/no-source outcomes. The captured TestFilterExistingUnreadable cases are ENOTDIR and an invalid NUL path, marked as regression coverage for #5667; they do not establish behavior for every permission or runtime-unreadability condition [R23–R26].
- AWS recovery guidance supports restore-to-new-location and content/integrity validation as an analogy. AWS Backup restore testing has service-specific resources, IAM, cleanup, scheduling, and cost; it is not a Puppet Master design prescription [R01–R03].
- Borg 1.4.5 distinguishes repository/archive checks from full data verification and warns about repair risk. No Borg implementation or compatibility investigation was done; it remains a later comparison option, not an endorsed engine [R04].

## O2 — pinned code and governing context

The research candidate is Restic because the researcher reports BRS-017 names it as the reference encrypted snapshot/deduplication engine. The reproducible source pins are Restic v0.19.0 at commit 12875cc48ed34111f71fe94a24a47ad11660f3a4 and v0.19.1 at commit 6aa3a516ce654808a1f28f9fa21e9b7c8e6e90bf [R10–R11, R21, R23, R26]. They are investigation baselines, not a selected shipped binary or release admission.

The v0.19.0 backup code defines ErrInvalidSourceData and ErrNoSourceData, returns surviving targets with the incomplete-source error, and lets runBackup continue while retaining a non-success result. The check command’s full-read path passes all packs in its received set; when snapshot filtering is active, the checker maps referenced blobs to pack files. The copy implementation transfers snapshot data between repositories. These mechanisms do not supply PM’s multi-destination policy, project identity, Restore as New readiness, or release proof [R11, R15–R17].

## O3 — issue, fix, regression, release, applicability

1. **Issue:** #4467 describes a missing path in a --files-from list, remaining sources processed, and exit code 0 rather than the expected incomplete-source result [R08].
2. **Fix:** PR #5347 changed collection and backup result handling. Mixed inputs preserve accessible targets but report incomplete data; all-missing inputs have a no-source outcome [R09, R11–R13].
3. **Regression evidence:** the tagged tests assert ErrInvalidSourceData for mixed paths and ErrNoSourceData for all-missing paths. They are inspected source, not executed tests, and do not assert persisted partial contents [R12–R13].
4. **Release applicability:** the v0.19.0 release notes name #4467; the scripting documentation maps backup source-read failures to exit code 3; the captured tag resolution identifies the exact commit [R10–R11, R20–R21].
5. **Product consequence:** retain the engine snapshot ID and each destination’s result if a partial snapshot was produced; mark coverage incomplete, withhold complete/green/restore-tested claims, and protect the previous complete recovery point. A retry or remediation is a new evidence-bearing attempt and cannot rewrite the original result.
6. **Later boundary:** v0.19.1 source and the bounded test cases support the stated Lstat handling and those exact regression inputs only; they do not prove all possible unreadability behavior [R23–R26].

## Complete proposed replacement plan

### 1. Scope, authority, and claims

Design this slice for one Project, two destination bindings, source capture, verification, and Restore as New in an isolated recovery environment. Keep the four products and Project Move/Duplicate With History distinct. Retain Backup & Restore as product owner; Storage retains physical persistence, internal recovery, capture mechanics, flush/export/freeze and atomicity; Settings, Project Sync, Server, credential/security, FileSafe, commands/events, shared runtime, GUI, and release owners retain their stated authority. Rust + Slint remains the framework boundary. Do not expand this slice into Full Server recovery.

Use separate claims for captured, committed to destination A/B, structurally checked, sampled data read, full data read, and Restore as New drill passed. Each claim names the exact attempt, repository, immutable snapshot, requested and performed depth, and restore target when relevant. A project-scope drill does not prove Full Server recovery. A hash or manifest check is not a recovery claim.

### 2. One-project capture contract

Before capture, resolve one immutable Project scope, required source locations, included/excluded families, dirty/durable source closure, Storage-owned flush/export/freeze barrier, and consistency boundary. Record included generations and source coverage. Freeze immutable staging and release the application barrier before remote transfer. Do not copy open redb/seglog files opportunistically; follow Storage’s contract. Preserve source/environment mapping. An offline required source is waiting or partial, never a complete replacement for the last good point.

The manifest records Project/source identity, application/storage/engine/protocol versions, compatibility range, coverage/exclusions, consistency boundary, object-relative paths, byte sizes/digests, encryption/security references, immutable snapshot ID, capture time, and parent/incremental relationship, consistent with the researcher’s BRS-004/BRS-017 comparison. Absolute source paths do not become portable object authority. Secrets are excluded by default; only an owner-authorized portable envelope/reference may be included.

If a required source is absent, unreadable, raced, or outside the consistency fence, preserve exact failure evidence and any observed partial snapshot. Map the result to partial/failed under the owner contract and emit no complete BackupReceipt. Do not promote that snapshot to last-known-good or a recovery prerequisite until it independently satisfies the selected policy. The Restic error alone does not prove PM source closure; the adapter must map PM’s declared required sources and engine outcome into capture state and per-destination evidence.

### 3. Two separately tracked destination attempts

Bind two distinct BackupRepositoryBindings and destination attempts to the same frozen staging generation/snapshot intent. Each attempt stores its repository ID, immutable engine snapshot ID, upload/commit state, failure, verification evidence, timestamp, and receipt. Failure, retry, missing endpoint, or success at one destination cannot erase or green the other. Do not use a scalar “two copies succeeded” flag.

The reported BRS-004 floor is distinct repository authority/identity and separately tracked write/verify outcomes with independently addressable recovery copies. A shared destination, bucket, account, credential, or RecoverySet does not merge repository authority, locks, retention, corruption fate, or recovery identity. That floor does not establish stronger physical/control-plane independence. Preserve the open choice among separate repositories only; separate credentials/delete authority; or distinct account/provider/region/offline media, based on user threat/cost needs and adapter capability. Distinct IDs alone do not prove the stronger tier.

Use Restic copy only as a candidate transfer. Decide between independent engine backups and repository-to-repository copy based on measured upload window, key model, and throughput. If copy is selected, record source/destination IDs, interruption/resume outcome, and read/write cost, then verify the destination independently. Completion of copy is not full-data verification or restore proof [R06, R17–R18].

### 4. Verification selection and evidence

Every request names one immutable backup/snapshot and uses explicit owner-typed depth/admission as the researcher reports for BRS-030. Present work/cost before dispatch; an initial structural offer is a UI presentation, never an implicit request default. Bind requested depth, effective scope, target currentness, permission, cost class, plan revision if used, admission expiry, and destination attempt. Reject stale, substituted, expired, or silently narrowed requests.

- **structural:** repository/index/manifest structure and object references; it does not attest that every data byte is readable.
- **sampled_data:** an explicit subset; the receipt names that subset and limits its conclusion to that coverage.
- **full_data:** read the selected snapshot’s data through a supported full-read path; record repository, exact snapshot, scope/filter, packs/objects/bytes covered, and errors. With Restic, --read-data reads every pack in its received set. A snapshot-filtered check can map selected snapshot tree references to containing packs; an unfiltered check is repository-wide. Do not call repository-wide evidence snapshot-scoped. For snapshot scope, prove the selected tree/reference mapping and report the actual pack-level coverage [R05, R15–R16, R22].
- **isolated_restore_drill:** a separate operation and receipt. Restore a selected immutable snapshot into a disposable isolated PM environment as a new Project and run the chosen data/compatibility checks. Never derive it from cmd.backup.verify or inherit it from another snapshot/repository.

A pass requires performed scope equal to requested scope. A partial full-data read fails with its errors/quarantine evidence. Destination A’s verification does not attest to B. Prior receipts remain bound to their inputs; new verification is new evidence, not retroactive inference.

### 5. Restore as New workflow

Select one repository and immutable snapshot, unlock through the protected Recovery Key route, show exact source coverage and compatibility, and review a RestorePreviewReceipt before approval. Use a fresh isolated recovery environment with no active workspace, agents, hooks/macros, or untrusted restored content executing. Allocate a collision-checked new project_id; rewrite every identity-bearing reference through PM restore ownership; stage in quarantine; verify paths, hashes, schema, and storage compatibility; resolve missing source locations, credentials, and supported secrets as explicit reattachment states; then activate at Storage’s atomic/recoverable boundary and rebuild derived indexes from canonical restored bytes.

Every mutating RestoreRun mode, including as_new, must satisfy the BRS-023 verified target recovery prerequisite or its exact authorized, verified-unavailability/human-consent exception, as reported by the critic from BRS-006/BRS-023. Isolation and preservation of the source Project do not substitute for it. Consent is not a recovery point and grants no rollback capability. The source files behind this reported requirement were not opened in this bounded pass because their original case path is outside the input-map source directories; direct owner-source confirmation remains open.

Run post-restore checks that read representative critical Project data and validate selected data-level criteria. Record manifest/snapshot/repository/destination, new Project ID, compatibility versions, included/excluded sources, checks run, result/errors, timing, and whether indexes were rebuilt. The drill proves only that immutable snapshot on that repository/environment/check set. It does not prove all snapshots, production readiness, Full Server recovery, or future availability. Restic extraction is a lower-level file mechanism; it does not supply PM identity, path remapping, readiness, activation, or rollback policy [R01, R03, R07, R19].

### 6. Durable state, receipts, and operations

Keep the reported BRS-005 lifecycle and independent axes: capture completeness; destination A/B attempt; verification depth/scope; isolated restore result. Journal every phase and source/destination transition. On restart, converge to resume/complete/partial/failed/quarantine/recovery_required from durable evidence only. Missing journal, disappearing destination, process loss, or unknown command outcome remains unknown/not-run. Cancellation cannot delete the last verified generation. Preserve ObservableWork, outbox, leases, phase-aware cancel, cost/resource admission, and shared-owner behavior without parallel owners.

Destination success requires its own committed immutable snapshot and engine evidence. Full backup success requires declared sources and every required destination. Verification/drill badges attach to the exact snapshot and destination. Retention protects the last complete verified/recovery-tested generation under selected policy. Repair/prune is separately authorized and previewed; do not repair on first verification failure or delete/overwrite the source during a drill.

### 7. Proposed acceptance evidence for this slice

These are future checks, not results from this reviser:

1. Deterministic one-Project fixture with complete/excluded families, relative paths, digests, and version/consistency metadata.
2. Required source unavailable before/during capture; race/dirty source; mixed accessible/missing paths; verify partial snapshot remains partial and prior complete point remains protected.
3. Destination A success/B failure, reverse failure, retry, process loss after upload/commit, and reopened immutable IDs; no scalar green state or inherited receipt.
4. Structural, sampled, full-data, stale-admission, wrong-target, requested/performed downgrade, expiry, and interrupted-read cases.
5. Separate restore drills from each destination if both are claimed recoverable; bind one immutable snapshot, allocate a new Project ID, reject collisions/unsafe paths, leave source/repositories untouched, rebuild derived state, and validate selected critical data.
6. Crash/restart and destination disappearance at every journaled transition; no false complete, verify, drill, rollback, or resume.
7. Measure runtime/cost for the selected depth, transfer, and restore drill; do not infer RPO/RTO from source code or one benchmark.
8. Security/permission/secret closure, accessibility, native/web parity, and shared-owner command/event/wiring lanes before a readiness claim.

## Exact frozen-plan comparison and dispositions

The inherited input has no separately keyed P-numbered decisions. The comparison below preserves each named unit, choice, alternative, and negative constraint reported in the researcher draft and critique; it does not invent P identifiers.

| Unit or choice | Disposition | Treatment in this revision |
|---|---|---|
| Copied owner scope and non-goals | Already covered by the copied owner slice; retain and narrowly define the two-copy case | Keep Project vs Full Server, internal recovery, Settings transfer, Move, Duplicate With History, source-code inclusion, secret custody, adapters, and release gates distinct. BRS-017/BRS-019 and non_goals.md remain the reported basis; public sources do not authorize changing owner boundaries. |
| BRS-001 authority and four-product separation | Retain | Keep sole Backup & Restore product ownership, retained owners, and no readiness inference. Add no owner/component. |
| BRS-004 destinations/policy/manifest/retention/verification | Retain; clarify independence | Preserve distinct repository bindings, attempt receipts, path/size/hash/scope, protected generations, and no false partial success. Shared bucket/account/credential need not merge repository authority but may be a shared failure domain. Keep stronger control-plane/physical independence as an explicit product choice. A destination B receipt cannot inherit A evidence. |
| BRS-005 phases, fence, crash convergence, independent axes | Retain; add source-failure mapping | Keep named phases, journal, cancellation, disappearance, last-good protection, and independent completeness/upload/verify/drill axes. Add adapter handling for surviving data plus incomplete status; do not infer PM source-closure compliance from Restic’s exit code. |
| BRS-006 restore modes, preview, quarantine, identity rewrite, rebuild | Retain; narrow this slice to as_new | Preserve four modes, separate read/delivery operations, staged compatibility checks, owner boundaries, and truthful rollback. Apply the shared BRS-023 prerequisite to as_new too, subject to the direct-source evidence limitation above. |
| BRS-010 acceptance/proof boundary | Retain; add the focused future checks above | Keep broad acceptance lanes and explicit not_run; static evidence is not runtime readiness. AWS only supports an analogy for separate content reads/time measurement. |
| BRS-017 Restic/reference architecture and capture barrier | Already covered; retain and defer production engine/version selection | Keep one coordinator/adapter, Restic reference, per-Project repository, staging/barrier, remote upload after release, source closure, rclone transport limit, and no custom crypto/live sync. v0.19.0/v0.19.1 are research pins, not the selected binary or release gate. |
| BRS-019 browse/restore safety and durable outcomes | Already covered; retain | Keep immutable snapshot selection, untrusted read-only browsing, no code execution, FileSafe, separate receipt axes, isolated endpoint, governor/outbox/lease/cost ownership. Add one-Project as_new evidence and no source mutation. |
| BRS-023 phase-local recovery prerequisite and consent | Retain and apply to every mutating mode | Do not loosen consent or describe it as rollback/recovery. The critic’s correction governs this proposal; direct frozen-source confirmation remains unresolved within this input boundary. |
| BRS-030 depth admission and receipt truth | Retain; clarify full-data scope | Preserve explicit depth/plan/admission, immutable target, expiry, permission/currentness/cost match, no fallback/narrowing, and separate test_restore receipt. Name whether Restic evidence is repository-wide or snapshot-filtered and prove the coverage actually performed. |
| Eleven destination families; new-policy 7/4/6 seed; schedules; RPO/RTO; auth; crypto admission; compatibility | Uncertain/deferred | No supplied evidence supports importing provider capability claims, choosing cadence, changing fixed seed, or asserting SLA/RPO/RTO. Make no product promise from analog tools. |
| Rejected non-goals: live replication/failover; remote backend as canonical PM state; silent installs/auth; default raw credentials; destructive operations from static plans | Rejected as product changes; retain as exclusions | No finding reopens them. Repair/restore remains separately authorized; no infrastructure or account is touched. |

## Alternatives, options, and unresolved product decisions

1. **Copy topology:** independent backup to both destinations or repository-to-repository copy. Choose based on upload window, key/credential model, and measured throughput. If copy is selected, bind IDs, test interruption/resume and read/write cost, and verify each destination. Do not assume identical keys or chunking [R06, R17–R18].
2. **Independence level:** separate repositories only; separate credentials/delete authority; or distinct account/provider/region/offline control plane. Public captures cannot choose the user’s threat model.
3. **Verification cadence/depth:** select policy for structural, sampled, or full-data checks and who approves/pays cost. Keep depth explicit and bounded. Automatic test-restore cadence remains deferred.
4. **Recovery drill criterion:** select Project data and post-restore operations that demonstrate usability, plus isolated environment dependencies/credential posture. Do not silently authenticate, install tools, restore secrets, or connect to production.
5. **Source coverage:** Storage/source owners must settle editor buffers, external workspaces, dirty files, Git/JJ closure, and source-host states. This slice cannot certify cross-owner contracts.
6. **Version/platform admission:** release owners select and test the actual Restic binary, provenance/SBOM, licensing, platform/backend matrix, compatibility/migration, and upgrade/rollback. A signed source tag is not proof a binary was reproduced, admitted, installed, or shipped.
7. **Borg:** retain as future comparison only if Restic fails adapter, security, platform, or measured-cost needs. No replacement decision now [R04].

Unresolved evidence and choices: the direct BRS-006/BRS-023 frozen-source bytes are outside the admitted source directories; the exact threat model, capture closure, drill oracle, cadence/cost, and version/platform matrix remain owner decisions. The source maps do not contain a timestamped search-to-plan chronology, so the researcher’s report that discovery preceded comparison remains a process report, not independently established fact. There is no comparative performance/platform experiment. No availability, RPO/RTO, safety certification, or shipped behavior is inferred.

## O1–O6 and every critic objection

| Item | Disposition |
|---|---|
| O1 discovery | Complete as inherited bounded research. Retain Restic, AWS, Borg mechanisms and negative findings; add no broad discovery. |
| O2 code/context | Complete for admitted source copies and fixed pins. Keep Restic version selection deferred and the BRS owner-source limitation explicit. |
| O3 issue/fix/regression/release | Complete with limits: partial snapshot is a control-flow inference plus issue report; tagged tests assert errors only; release/source pins do not prove PM deployment. |
| O4 plan comparison | Complete: all named units, choices, alternatives, and rejected/deferred decisions above are dispositioned. No P-numbered identifiers are fabricated. |
| O5 critic response | Complete: apply the shared prerequisite to as_new; scope full-data receipts to the actual Restic pack set; correct the partial-write test wording; narrow v0.19.1 unreadability coverage. |
| O6 final proposed plan | Complete as a coherent full replacement. No build, test, backup, restore, service, or runtime operation was executed. |

**Critic 1 — BRS-023 for every mutating restore:** agree and apply to as_new. The cited original case files were not opened because they are outside the input-map source directories; source confirmation remains unresolved. The source-project-safe isolated target does not waive the prerequisite.

**Critic 2 — full-data pack scope:** agree. A filtered check maps filtered snapshot trees and referenced blobs to packs; an unfiltered read is repository-wide. Receipts must describe actual scope and may not claim snapshot scope without the mapping.

**Issue/fix/regression evidence limit:** agree. The mixed-source partial-write conclusion is code-path inference plus the issue capture; the tests do not prove persisted partial contents. Keep “may exist,” not “the test proves it exists.”

**v0.19.1 unreadable-path wording:** agree. State Lstat errors are skipped by the captured code; the named test only exercises ENOTDIR and invalid-NUL cases. Do not generalize to every unreadability condition.

**Plan comparison (scope/BRS-001, BRS-004, BRS-005, BRS-006/BRS-023, BRS-010, BRS-017, BRS-019, BRS-030, deferred and rejected choices):** agree with the critic’s retain/defer dispositions. Preserve BRS-004’s distinct repository authority as the floor while leaving stronger fault-domain separation open; add the BRS-005 source-to-state adapter mapping; retain proposed-only acceptance evidence; keep release admission/version decisions deferred; and keep the BRS-030 scope correction.

**Discovery breadth and chronology:** agree with the limitation. Preserve the negative findings; report chronology only as the researcher’s account because the handoff has no timestamped search-to-plan sequence. No new query or comparative performance claim was added.

**Open choices and validation/accounting:** preserve the independence tier, copy topology, depth/cadence/cost, drill oracle/environment, source closure, and version/platform admission as unresolved. Proposed future checks remain proposals. No tests/build/backup/restore/destination check/application operation/new public query/canon edit/destructive action was performed in this reviser.

**Procedure:** retain the declared bounded issue/fix/regression/release trace, invalidation-first critique, amendment-first correction, and consequential-claim/dependency review as a bundle-level diagnostic. No isolated causal claim is made.
