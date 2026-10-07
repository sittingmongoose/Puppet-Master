# I-METHOD-06 researcher proposed-change artifact

**Stage:** `I-METHOD-06/treatment/research-v1`  
**Input map:** `/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/jobs/I-METHOD-06/treatment/research-v1/input-map.json`  
**Disposition:** bounded research deliverable complete; O5 remains pending a fresh same-family critic. This is a proposed plan, not a build, test, backup, restore, release, or readiness claim.

## Research conclusion

The supplied owner slice already has a strong safety model: product ownership stays separate; a project backup and each destination attempt have distinct state; capture, repository verification, and isolated restore are independent evidence; Restore as New allocates a new project identity; phases persist; and schemas or previews do not prove recovery. Keep those choices.

The most useful concrete addition is an explicit rule for incomplete capture. Restic issue #4467 documents a real failure in which a missing required path could still produce a snapshot while the command returned success. Its fix changed the result to an incomplete-backup error, but it still stores the accessible remainder. The plan must therefore preserve both facts: a partial snapshot may exist, and that snapshot cannot become a complete/verified success just because the engine wrote it or one destination received it. See the issue, patch, release, and tagged implementation/test evidence in [R08–R13].

Second, describe the two copies as two separately evidenced repository attempts, then make the required failure-domain meaning an explicit product decision. Two repo IDs or two locators alone do not prove independence from shared credentials, account control, provider, region, host, or physical medium. Restic's cross-repository `copy` mechanism is useful, but it writes snapshots to another repository and may have to read and write all data when encryption keys differ; the command's completion is not the product's full-data verify receipt or Restore as New drill [R06, R17, R18].

Finally, make recovery evidence user-readable as a ladder. Structural checks, full data reads, and a restore drill support different claims. A hash or `check --read-data` can support repository integrity, but recovery confidence needs an isolated restore of an immutable snapshot into a new project identity and meaningful post-restore reads/checks. AWS's recovery guidance explicitly calls for restore to a new location followed by content/integrity validation; its product-specific restore tests also separate job completion from independent validation [R02, R03]. Restic's restore command extracts files to a target; it does not provide Puppet Master's identity rewrite, compatibility/readiness decisions, or safe activation semantics [R07, R19].

## Research and source-backed findings

### O1 — discovery from the user need

- **Restic, the named engine candidate:** separate repositories and snapshot-copy workflow are real mechanisms, not proof of two independent failure domains. Cross-key copy can require a full source read and destination write. Copy is resumable, but an interruption can lose recent progress. Treat each configured repository as its own attempt, then verify that destination independently [R06, R17, R18].
- **Integrity is not recoverability:** restic `check` normally checks repository/index/metadata structure; `--read-data` asks it to read every data pack. The full read is costly and still does not create a running Puppet Master project, exercise the `as_new` identity rewrite, or establish application usability [R05, R15, R16, R22].
- **Backup exit status matters, but is not enough:** issue #4467 reported a missing path from `--files-from`; a snapshot of remaining files was saved although the command returned success. PR #5347 added an incomplete-source result and tests for mixed existing/missing and all-missing targets; restic 0.19.0 release notes include the fix [R08–R13]. At v0.19.0 the backup command marks the run unsuccessful when target collection reports incomplete data, still executes the snapshot for remaining targets, and returns `ErrInvalidSourceData` after writing it. That is exactly why PM must not translate “snapshot exists” into “capture complete.”
- **A later boundary case remains informative:** v0.19.1 `filterExisting` treats inaccessible paths as skipped and incomplete/no-source outcomes; `TestFilterExistingUnreadable` explicitly labels its cases as a regression test for #5667. The supplied captures establish the code and test at tag v0.19.1, not that this agent ran them [R23–R26].
- **Analogy, not adoption:** AWS recommends restore tests to a new location, explicit content validation, and time measurement. AWS Backup restore testing runs restore jobs against recovery points and exposes validation results, but it is tied to AWS resource types, IAM, scheduled jobs, cleanup, and service behavior; it is not a Puppet Master implementation recommendation [R02, R03].
- **Alternative:** Borg 1.4.5 separates repository/segment checks from archive checks and offers `--verify-data` for a full decrypt/decompress/content check; it warns that repair can lose data and recommends protecting the repository before repair. This reinforces explicit depth and repair boundaries. No Borg code or compatibility investigation was performed, so it remains an option for a later engine comparison, not an endorsed replacement [R04].

### O2 — pinned code and governing context

The selected consequential component is restic's backup command because BRS-017 names restic as the reference encrypted snapshot/dedup engine, and completeness of the captured source directly controls the user's requested recovery claim. The immutable source pins are:

- restic `v0.19.0`, commit `12875cc48ed34111f71fe94a24a47ad11660f3a4`; the release tag is signed/verified on the release page, and release notes name #4467 [R10, R21].
- restic `v0.19.1`, commit `6aa3a516ce654808a1f28f9fa21e9b7c8e6e90bf`, used to confirm retained behavior and the later inaccessible-path regression test [R23–R26].

At v0.19.0, `cmd/restic/cmd_backup.go` defines `ErrInvalidSourceData` and `ErrNoSourceData`, implements `filterExisting`, and returns its result through `collectTargets` (source lines 168–194, 395–454). `runBackup` treats incomplete target collection as a non-success, continues with remaining targets, and returns `ErrInvalidSourceData` after snapshot creation (486–515, 695–706). This caller/definition pair governs the practical behavior; the adapter must preserve it as partial evidence, not discard it or promote the written snapshot [R11]. `TestCollectTargets` covers a mixed existing/non-existing input; `TestBackupNonExistingFile` covers mixed and all-missing inputs (test source lines 16–77 and 260–287). The PR patch shows these tests and the implementation changes [R09, R12, R13].

For the separate verification claim, `cmd/restic/cmd_check.go` exposes `--read-data` and the `runCheck`/`buildPacksFilter` path; `internal/checker/checker.go` checks tree references and delegates full pack reads. The implementation distinguishes structural traversal from a requested full read [R15, R16]. `cmd/restic/cmd_copy.go` opens source with a read lock and destination with an append lock, selects snapshots, copies missing blobs, then saves snapshot metadata; this is a transfer mechanism, not PM's multi-attempt policy or restore validation [R17]. Source-map entries contain exact symbol anchors and line ranges.

### O3 — issue, fix, regression, release, applicability

1. **Issue:** restic #4467 was opened 2023-09-14. The reporter reproduced `backup --files-from` with a path that simulated a disconnected NFS share; the remaining files were processed and a snapshot was saved, but the process returned exit code 0 rather than the documented incomplete result 3 [R08]. This is directly pertinent to required capture coverage and truthful completion.
2. **Fix:** linked PR #5347 changed source target filtering/backup result handling so that incomplete target sets produce an error status. The patch series also adjusts the integration test and adds a mixed-path target test [R09].
3. **Regression evidence:** the tagged v0.19.0 unit test asserts `ErrInvalidSourceData` when one of two targets is absent. The integration test checks mixed and all-missing paths. These are source-present tests; this researcher did not execute them [R12, R13].
4. **Release applicability:** v0.19.0 release notes explicitly list #4467, and the exact tagged source implements the fix [R10, R11]. The v0.19.1 source/test capture retains the incomplete result and includes an additional inaccessible-path regression case for #5667 [R23–R26]. The evidence is release applicability, not a claim about any Puppet Master binary or shipped deployment.
5. **Product consequence:** the error result alone cannot be treated as “nothing was written.” Preserve the resulting engine snapshot ID and per-destination state, mark source coverage incomplete, block complete/green/restore-tested status, and keep the previous complete recovery point protected. Retry or remediation may be proposed, but it cannot silently rewrite the original attempt's evidence.

## Proposed replacement plan sections

### 1. Scope, authority, and explicit claims

Design only one Project, two destination bindings, source capture, verification, and Restore as New in an isolated recovery environment. Keep the four products and Project Move/Duplicate With History separate. `Plans/Backup_Restore_System.md` remains the product owner; Storage retains physical persistence, internal recovery, capture mechanics, and atomicity; Settings, Project Sync, Server, credential/security, FileSafe, commands/events, shared runtime, GUI, and release owners retain their stated authority. Rust + Slint remains the product framework boundary.

The plan may claim “captured,” “committed to destination A/B,” “structurally checked,” “sampled data read,” “full data read,” or “Restore as New drill passed” only with evidence for that exact attempt, repository, immutable snapshot, request depth, and restore-test target. These are separate claims. A project-scope drill is not a Full Server recovery claim. A source hash or manifest check alone is not a recovery claim.

### 2. One-project capture contract

Before capture, resolve one immutable project scope, required source locations, selected included/excluded families, dirty/durable source closure, Storage-owned flush/export/freeze barrier, and the agreed consistency boundary. Record the exact included generations and source coverage. Freeze immutable staging and release the application barrier before remote transfer. Do not copy open redb/seglog files opportunistically; follow the Storage owner's flush/export/freeze contract for those sources. Preserve exact source/environment mapping and report offline required sources as waiting or partial, never as a complete replacement for the last good point.

The manifest records project/source identity, application/storage/engine/protocol versions, compatibility range, source coverage and exclusions, consistency boundary, object-relative paths, byte sizes/digests, encryption/security references, immutable snapshot ID, capture timestamps, and parent/incremental relationship, consistent with BRS-004/BRS-017. No absolute source path becomes portable object authority. Secrets remain excluded by default; only an owner-authorized portable envelope/reference may be included.

If any required source is absent, unreadable, raced, or outside the declared consistency fence, preserve both the observed partial snapshot (if any) and the exact failed source evidence. Terminal state is `partial`/`failed` according to the owner contract, and no complete `BackupReceipt` is emitted. The incomplete snapshot is not eligible as the last-known-good point or as a recovery prerequisite until it independently satisfies the chosen policy.

### 3. Two independently tracked destination attempts

Bind two distinct `BackupRepositoryBinding`s and destination attempts to the same frozen staging generation/snapshot intent. Each attempt stores its own repository ID, immutable engine snapshot ID, upload/commit state, failure, verification evidence, timestamp, and receipt. A failure, retry, missing endpoint, or success at one destination cannot erase or turn the other attempt green. Never use a scalar “two copies succeeded” flag without joining both exact attempts.

**Required minimum:** distinct repository authority/identity and separately tracked write/verify outcomes, with independently addressable recovery copies. **Product choice still needed:** how strong “independent copies” must be. Options are (a) separate repositories only; (b) separate repositories plus distinct credentials and delete authority; or (c) distinct accounts/providers/regions or offline media for a stronger control-plane/fault-domain separation. The default must be selected explicitly from user threat/cost needs and adapter capability evidence. Shared bucket/account/credential does not merge authority, but it may still be a shared failure domain.

Use Restic `copy` only as a candidate transfer mechanism. Decide whether each repository receives an independent engine backup or one repository is copied from another; if copy is used, record source-to-destination IDs and transfer outcome, and test different-key full read/write cost. After transfer, verify the destination repository separately. A completed `copy` command is not full-data verification or restore proof [R06, R17, R18].

### 4. Verification selection and evidence

Every verification request names one immutable `backup_id`/`snapshot_id` and uses explicit owner-typed depth/admission as BRS-030 requires. Present the work/cost before dispatch; an initial structural offer is a UI presentation only and never an implicit request default. Bind requested depth, effective scope, target currentness, permission, cost class, plan revision if used, admission expiry, and exact destination attempt. Reject stale, substituted, expired, or silently narrowed requests.

- `structural`: repository/index/manifest structure and object references; this does not attest that every data byte can be read.
- `sampled_data`: an explicit selected subset; receipt names the subset and limits the conclusion to that coverage.
- `full_data`: read all selected snapshot data through the pinned engine's supported full-read path; result names the repository, exact snapshot, bytes/objects covered, and errors. With restic, `check --read-data` reads every pack; its cost and remote-read behavior must be presented [R05, R15, R16, R22].
- `isolated_restore_drill`: separate operation and receipt from verification. Restore a selected immutable snapshot into a disposable isolated PM environment, as a new Project, and run the chosen data/compatibility checks. Never derive this result from `cmd.backup.verify` or inherit it from a different snapshot/repository.

A passed receipt requires performed scope equal requested scope. A partial full-data read remains failed with its errors/quarantine evidence. Verification of destination A cannot attest to destination B. Keep all prior receipts bound to their exact inputs; new verification is new evidence, not retroactive inference.

### 5. Restore as New workflow for this slice

The user selects a specific repository and immutable snapshot, unlocks through the protected Recovery Key route, sees exact project/source coverage and compatibility, and reviews a `RestorePreviewReceipt` before approval. The destination is a fresh, isolated recovery environment with no active workspace, agents, hooks/macros, or untrusted restored content executing. Allocate a collision-checked new `project_id`; rewrite every identity-bearing reference through the owning restore logic; stage in quarantine; verify staged paths/hashes/schema/storage compatibility; resolve missing source locations, credentials, and supported secrets as explicit reattachment states; then activate at the storage owner's atomic/recoverable boundary and rebuild derived indexes from canonical restored bytes.

Run post-restore checks that read representative critical project data and validate the selected data-level criteria. Record exact manifest/snapshot/repository/destination, newly allocated project ID, compatibility versions, included/excluded sources, checks run, result, errors, timing, and whether indexes were rebuilt. The test proves only this immutable snapshot on this repository under this environment and check set. Do not claim all snapshots recover, production readiness, Full Server recovery, or future availability from one drill. Restic's file extraction target is a useful lower-level mechanism; it does not supply PM project identity, path remapping, readiness, activation, or rollback policy [R01, R03, R07, R19].

Before any destructive/in-place operation, retain the BRS-023 verified target recovery receipt or its narrowly authorized, verified-unavailability/human-consent alternative. Consent is not a recovery point and grants no rollback capability. This slice's `as_new` test should normally use the ordinary isolated target and never activate over the source Project.

### 6. Durable state, receipts, and operational behavior

Keep the BRS-005 lifecycle and independent state axes: capture completeness; destination A/B attempt state; verification depth/scope; isolated restore-test result. Journal every phase and source/destination transition. On restart, converge to resume/complete/partial/failed/quarantine/recovery_required from durable evidence only. Missing journal, disappearing destination, process loss, or unknown command outcome stays unknown/not-run; cancellation cannot delete the last verified generation. Preserve `ObservableWork`, outbox, leases, phase-aware cancel, cost/resource admission, and shared-owner behavior without adding parallel owners.

A destination success requires its own committed immutable snapshot and engine evidence. A full backup result requires the declared sources and all required destinations. Verification and drill badges attach to the exact snapshot and destination. Retention protects the last complete verified/recovery-tested generation according to the user's selected policy; repair/prune is separately authorized and previewed. Do not repair on first verification failure or silently delete/overwrite the source during testing.

### 7. Acceptance evidence for the one-project/two-destination slice

A future implementation review should require, at minimum:

1. deterministic one-project fixture with complete and explicitly excluded families, relative paths, digests, and version/consistency metadata;
2. required source unavailable before and during capture; race/dirty source; mixed accessible/missing paths; confirm partial snapshot remains partial and prior complete recovery point remains protected;
3. destination A success/B failure, reverse failure, retry, process loss after upload/commit, and re-opened immutable IDs; no scalar green state and no inherited receipt;
4. structural, sampled, full-data, stale-admission, wrong-target, requested/performed downgrade, expiry, and interrupted read tests;
5. separately selected restore drills from each destination, if the product claims both are recoverable; each binds one immutable snapshot, allocates a new project ID, rejects collisions and unsafe paths, leaves original project/repositories untouched, rebuilds derived state, and validates selected critical data;
6. crash/restart and destination disappearance at every journaled transition; no false complete, verify, drill, rollback, or resume;
7. measured runtime and cost for the selected depth, transfer, and restore drill; never infer supported RPO/RTO from code or a single benchmark;
8. security/permission/secret closure, accessibility, native/web parity, and shared-owner command/event/wiring lanes before any readiness claim.

These are proposals only. The campaign may authorize its own isolated sandbox checks later. No command/test, real backup, restore, deletion, or runtime operation was executed in this researcher stage.

## Exact frozen-plan decision comparison

The input contains no separately keyed `P1`/`P2` decision IDs. I therefore retain every explicit choice/alternative/negative constraint in the scoped owner texts by their actual PlanUnit IDs and do not fabricate P identifiers.

| Frozen choice or unit | Disposition | Proposed treatment / evidence |
|---|---|---|
| Copied owner scope and non-goals | Retain; add a narrow operational definition for the requested two-copy case | Keep project vs full-server, internal recovery, Settings transfer, Project Move, Duplicate With History, source-code inclusion, secret custody, adapters, and release gates distinct. Deep design stays one Project/two destinations/verify/as_new; no Full Server implementation expansion. BRS-017/BRS-019 and `non_goals.md` already cover most of this precisely. Public sources do not authorize changing those owner boundaries. |
| BRS-001 authority and four-product separation | Retain | Sole backup/restore product owner, exact retained owners, no collapse, no readiness inference. Add no new owner/component. |
| BRS-004 destination/policy/manifest/retention/verification | Retain; supported clarification | Preserve distinct repository bindings, attempt receipts, path/size/hash/scope, protected generations, no false partial success. Add explicit user-selected strength for “independent” copies and a requirement that destination B verification cannot inherit A evidence. Restic copy mechanics demonstrate why the adapter's transfer and subsequent verify are separate [R06, R17]. |
| BRS-005 phases, fence, crash convergence, independent axes | Retain; necessary operational elaboration | Keep all named phases, journal, cancellation, disappearance, prior last-good protection, and independent completeness/upload/verify/drill axes. Add a missing/unreadable required-source terminal rule and a test for “partial snapshot written but error returned,” based on #4467 and its regression test [R08–R13]. |
| BRS-006 restore modes, preview, quarantine, identity rewrite, rebuild | Retain; narrow this slice to `as_new` | Preserve four modes, separate read/delivery operations, staged compatibility checks, owners, and truthful rollback. Keep `project_id` allocation and all reference rewrites inside PM restore ownership; Restic's `--target` only extracts files [R07, R19]. |
| BRS-010 acceptance and proof boundary | Retain; add the numbered focused acceptance evidence above | Keep broad acceptance lanes and explicit `not_run`; do not imply static proof/runtime readiness. AWS supports separate content reads and time measurement after a test restore, but does not justify an application-level claim [R03]. |
| BRS-017 Restic/reference architecture, capture barrier, repositories | Retain; keep production engine/version selection deferred | Retain one coordinator/one adapter, Restic reference, per-project repository, staging/barrier, remote upload after release, source closure, rclone transport limit, no custom crypto/live sync. Research pins v0.19.0 and v0.19.1 are reproducible investigation baselines, not the chosen shipped binary or a replacement release gate. `copy` can transfer between repositories; different encryption keys can require a full read/write and copy alone is not verification [R06, R17, R18]. |
| BRS-019 browse/restore safety, durable outcomes, locks/leases, retention | Retain | Keep immutable snapshot selection, untrusted read-only browsing, no code execution, FileSafe, separate receipt axes, isolated recovery endpoint, governor/outbox/lease/cost ownership. Add one-project `as_new` drill evidence and no source mutation. AWS provides an analogy for new-location restore/validation and highlights service-specific cleanup/cost/permission boundaries [R01–R03]. |
| BRS-023 phase-local recovery prerequisite and consent | Retain exactly | Do not loosen consent or call it rollback/recovery. Routine `as_new` test uses a separate disposable target; any later destructive mode still consumes the exact prerequisite. |
| BRS-030 explicit depth admission and receipt truth | Retain exactly; make GUI/operator disclosure concrete | Explicit depth/plan/admission, immutable target, expiry, permission/currentness/cost match, no fallback/narrowing, separate drill command. Restic and Borg implementations/docs support presenting structural versus full read cost and limits; neither supports a silent “verified” default [R04–R05, R15–R16]. |
| Eleven destination families, new-policy 7/4/6 seed, schedules, RPO/RTO, auth, crypto admission, compatibility | Keep deferred | No source supports importing provider capability claims, choosing a cadence, changing fixed seed, or asserting SLA/RPO/RTO. Make no product promise from analog tools. |
| Rejected non-goals: live replication/failover, remote backend as canonical PM state, silent installs/auth, default raw credentials, destructive operations from static plans | Retain | No finding warrants reopening them. Repair/restore remains separately authorized; no infrastructure or account was touched. |

## Alternatives, options, unresolved product decisions

1. **Copy topology:** independent backup to both destinations vs Restic repository-to-repository copy. Choose based on upload window, key/credential model, and measured throughput. If copy is chosen, pin source/destination IDs, exercise interruption/resume, read/write costs, then verify each destination. Do not imply identical keys or chunking by default [R06, R17, R18].
2. **Independence level:** choose separate repositories only, separate credentials/delete authority, or a distinct account/provider/region/offline control plane. Public code cannot decide the user's required threat model.
3. **Verification cadence/depth:** decide which policy needs structural, sampled, or full-data verification and who pays/approves cost. Keep requested depth explicit and cost-bounded. Optional automatic test-restore cadence remains deferred in the copied owner slice.
4. **Recovery drill criterion:** choose the specific project data and post-restore operations that demonstrate usability, plus the isolated environment's dependency/credential posture. Do not silently authenticate, install tools, restore secrets, or connect the restored Project to production.
5. **Source coverage:** Storage/source owners must settle which editor buffers, external workspaces, dirty files, Git/JJ closure, and source-host states are durably capturable. This slice cannot certify those cross-owner contracts beyond their cited requirement.
6. **Version/platform admission:** release owners must select and test the actual Restic binary, licensing/provenance/SBOM, platform and backend matrix, compatibility/migration, and upgrade/rollback. Source at a signed tag is not proof that a binary was reproduced, admitted, installed, or shipped.
7. **Borg:** retain as a possible future comparison only if Restic fails the adapter contract, security review, platform coverage, or measured operational cost. It is not a plan change now [R04].

**Uncertainty:** the frozen copy omits adjacent Storage, FileSafe, credential/security, command/event, release, and shared-runtime owner documents. I record those as dependencies and do not infer whole-project satisfaction. Public sources cannot establish the user's threat model, desired independence tier, exact capture set, or validation oracle. No availability, RPO/RTO, safety certification, or shipped behavior is inferred.

## O1–O6 disposition and critic handoff

- **O1:** complete — independently discovered Restic, AWS, and Borg mechanisms/limits from the user need before opening `plan.md`; useful negative findings are retained.
- **O2:** complete — immutable source pins, actual definitions/callers, check/copy code, and exact source locators are in `source-map.json`.
- **O3:** complete — #4467 → #5347 → regression tests → v0.19.0 release; later v0.19.1 code/test applicability is bounded and not overclaimed.
- **O4:** complete — every in-scope PlanUnit plus scope/non-goals is dispositioned above. No standalone P-numbered decisions were present to identify.
- **O5:** **pending** — no candidate-critic response was supplied or obtained. The fresh same-family critic should first try to invalidate the recommendation by checking the #4467 code/version/release trace, partial-snapshot implication, two-copy independence requirement, and the no-false-recovery claim; then reserve coverage for the other decisions and source breadth. Preserve any disagreement or open objection; do not synthesize a critique here.
- **O6:** complete for researcher handoff — the replacement sections above are coherent and implementable as a proposed plan; the final coordinator stage must preserve critic dispositions and perform amendment-first local repair/checks for every consequential changed claim/dependency before the full final artifact.

## Procedure, checks, and accounting

Declared bundle procedure: bounded issue/fix/regression/release implementation trace; critic checks recommendation-invalidating dependencies first while retaining lower-risk/breadth coverage; finalization is amendment-first, then checks every consequential changed claim and affected dependency before the full final. No isolated causal claim is made for the bundle.

**Executed in this researcher stage:** read the admitted brief, dispatch config, input map, frozen plan, all named in-scope copies/context; made public web searches/opens/finds; saved immutable public source bytes; read captured source code/tests/docs and resolved Restic tags with read-only `git ls-remote`.  
**Not executed:** no downloaded code, tests, application build, backup, restore, destination check, destructive operation, credential use, network service operation, or repository/canon change. Source code test assertions are inspected evidence, not test results.  
**No application built claim.**

`source-map.json` records exact capture paths/URLs/times, source versions/locators, discovery operation counts, and the observed native Goal counter snapshot. The first useful saved primary-source evidence is the v0.19.0 backup implementation capture; complete artifact/draft save time is recorded after this file is written. Input/cache/generated/reasoning/billing counters remain null where unobserved; aggregate Goal tokens/time are kept separate. The host is responsible for source-byte hashes.
