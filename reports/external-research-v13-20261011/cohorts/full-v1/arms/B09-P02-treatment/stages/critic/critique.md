# Independent critic review — B09-P02-treatment

## Review disposition

The investigator package is a careful, scope-appropriate proposal. It covers the brief's core safety and product obligations, compares the revealed plan paragraph by paragraph, keeps proposed validation separate from executed work, and does not pretend to know the unnamed host application. I found no material wrong claim in the consequential platform evidence I rechecked. I found two material incomplete points that should be carried into the fresh revision: the manual override's behavior in capability-limited mode, and process containment at worker startup / against breakaway descendants. Neither calls for reducing the brief's scope or treating the draft as an implementation.

The classification terms below distinguish decision-level omissions from external inputs the sources cannot answer. This is a critique, not a final design or authority to change the draft.

## Material incomplete

### MI-1 — Make the manual override capability-specific

**Locator:** draft.md, Clause-by-clause disposition P4; Proposed task lifecycle and UI behavior; Validation plan item 9.

The proposal gives a one-time Run this task next action that can bypass normal order and a soft estimate gate while keeping the host floor and enforced worker caps. Later it says not to offer a soft-guard bypass on an unbounded worker without an owner-approved risk policy. Those statements can be reconciled, but the user-visible behavior is not decided for the Linux no-delegation fallback or any Windows Job Object assignment failure.

The revised proposal should state a small capability matrix: (a) where a worker hard limit is active, whether the action may bypass only queue order or also the soft admission reservation; (b) where the worker has no enforced cap, whether the action is order-only; and (c) what consequence and queued-job delay the user sees. The host floor should remain non-bypassable in every mode. Keep a broader soft-memory override as an explicit owner decision unless the owner accepts its failure/pressure risk. This is needed to make the requested useful override actionable without implying an absent hard limit. The Linux distinction is supported by S02; the Windows distinction by S03 and S04.

### MI-2 — Establish containment before extension code can escape the boundary

**Locator:** draft.md, Recommendation; Clause-by-clause disposition P7; Validation plan items 3 and 4.

The proposal correctly calls out Windows job assignment failures, Linux delegated cgroups, process-group fallback, descendants, and task-owned termination. The consequential guarantee still needs a launch-time rule. On Linux, a child inherits the parent's current cgroup when it is forked, but moving the parent later does not move existing descendants (S02, process organization section). Therefore, merely migrating a worker after launch can leave already-started children outside the task cgroup. On Windows, child processes normally inherit job association, while breakaway flags may let them escape if the job permits it; assignment and nesting restrictions are conditional (S04). A process group is a cleanup aid, not a containment guarantee against code able to detach.

Specify that the host must place the worker inside the selected boundary before extension work can spawn descendants, and must configure/verify that breakaway cannot defeat the boundary where a hard job boundary is promised. A launch failure should refuse a task that requires that guarantee or report an explicitly weaker mode. Add tests for a child spawned before/at assignment and for permitted/denied breakaway. Until the extension trust model is known, do not present the process-group fallback as a security sandbox. This is a material implementation precondition for the draft's cancellation, descendant accounting, and no-unrelated-process promises.

## Exact plan disposition audit

| Revealed plan paragraph | Draft disposition | Critic finding |
|---|---|---|
| 1: host-owned queue records, interactive reserved slot, per-extension cap, wait view/cancel/priority override | P1 accepts and adds identity, snapshots, generations and manifests; P2 compares reserved vs work-conserving lanes; P3 adds active/backlog caps; P4 changes staff priority to a user action | Good comparison and fair-turn caveat. MI-1 remains open for override capability behavior. |
| 2: estimates summed against budget, estimates assumed conservative, worker process restrictions unresolved, shutdown/restart state | P5 rejects estimate-only admission; P6 distinguishes measurement, Windows commit limits and Linux delegated cgroups; P7 proposes capability probes; P8 adds durable interruption, checkpoints and generations | Correctly rejects the unsafe estimate assumption. MI-2 is required to make the worker boundary real at launch. No numeric memory or count default is asserted. |
| 3: staging plus completion record, cancellation then termination, cancel/publish and interactive starvation unspecified | P9 adds private staging/manifest publication and recovery; P10 adds cooperative cancel and task-owned termination; P11 serializes cancel/publish and bounds interactive preference; P12 preserves no pay/admin requirement; P13 expands proposed validation | Strong resolution. The draft says cancellation before publishing fences the generation and publication exposes only committed manifests. Keep cross-resource crash validation because a journal transaction cannot make separate report files atomic. |
| No experiment; compare admission/fairness; provisional; resolve assumptions from primary evidence; no deployment | P14-P18 preserve no-run status, alternatives, unresolved product facts, provisional state and no-deployment scope | Accurately carried through. None of the proposed phases or tests is described as performed. |

## Brief-scope audit

- **Fairness and burst isolation:** Extension-keyed round robin, active and backlog caps, explicit backpressure, bounded interactive preference, aging, and the reserved-slot alternative address one-extension bursts. The draft correctly limits the guarantee to dispatch opportunities: equal starts do not mean equal CPU, duration, or memory, and a non-preemptive task can block. It does not choose numeric bounds without measurements.
- **Resource control:** Separate worker count from memory admission; combine measured task-class reservations and current host pressure with a protected UI/host floor and hysteresis. Declared values are advisory. The Windows commit-charge caveat and Linux memory.high versus memory.max/delegation distinction are correct in the cited primary docs (S02-S04). The planned estimate matrix covers false, absent, stale and understated values.
- **Cancellation, progress, and restart:** Queued cancel, durable cancel-requested, cooperative signal, measured grace, task-owned forced termination, indeterminate progress, interrupted-on-restart, conditional checkpoint resume and generation fencing are all present. The reference VS Code API and source show that a progress cancel reaches a cooperative cancellation token and that the callback promise still controls completion; they do not establish forced termination (S07-S09). The draft does not overstate them.
- **Publication integrity:** Private staging, complete manifest validation, host-only catalog publication, visible distinction between partial and committed results, reconciliation, and cancellation fencing address the brief's central no-late-publication rule. The journal/filesystem boundary remains correctly identified as requiring crash validation rather than presumed atomicity (S11, S13).
- **Manual override:** Acknowledges user impact and uncertainty, protects the host floor, avoids pay weighting and does not invent a staff role. MI-1 is the only unresolved product behavior that should be made explicit before this is a complete proposal.
- **Feasible alternatives and measurements:** Global FIFO/priority, extension round robin, DRR analogy, bounded interactive preference, reserved capacity, and three execution boundaries are compared. DRR is carefully marked as a packet-flow analogy, not a job or memory guarantee (S01). Required measurements include OS/task memory, estimation error, worker and snapshot costs, queue wait/fairness, cancellation, responsiveness, restart and storage. Defaults remain open for sound reasons.
- **Phasing and validation:** The five phases and nine validation groups match the requested proposal scope. Burst, underreporting, worker failure, cancellation/publication races, restarts, low-memory systems, partial artifacts and manual override are covered. They are proposals only; no repository, target-app, load or acceptance test was run by this critic.

## Evidence review and limitations

I independently reopened the Linux kernel cgroup v2 documentation, Microsoft Job Object references, VS Code progress API/source/issue, and SQLite WAL/transaction/release-history pages. S02 is especially clear that memory.high throttles without invoking OOM, memory.max is the hard limit but may be exceeded temporarily, delegation depends on permissions, and tracked memory is not fully watertight. S03 states the Windows process/job limits concern virtual memory that can be committed and are independent; S04 states assignment rights, nested-job and older-Windows conditions; S05 states last-handle close behavior for kill-on-close. The proposal preserves those qualifications.

The VS Code issue cited as S10 is labeled testplan-item, describes a manual test procedure, and was closed completed; it is not evidence that this critic or the target application ran a test. S11/S12 support the WAL reset bug's affected/fixed release versions and the date-bounded SQLite release note; S13 describes SQLite's single-transaction crash guarantees. None establishes that the unnamed target bundles SQLite or that a database transaction commits report files atomically. These source limitations are kept in the revised source map.

The brief does not name a repository, application, language/runtime, minimum OS versions, extension trust policy, document-access contract, installed SQLite version, or user-role model. The draft identifies these as owner inputs rather than fabricating target callers or tests. That is an honestly unresolved external input, not a defect to fill with a guessed product. The predecessor's source index records a bounded first-party evidence set; the critic source map retains S01-S13 without changing their identities and records which records this review independently checked.

## Classification summary

- **Material wrong:** none found in the consequential claims checked.
- **Material incomplete:** MI-1 override behavior across hard-cap and best-effort modes; MI-2 containment must be established before worker code can spawn or escape descendants.
- **Unsupported:** none that the recommendation depends on. S01's PDF was text-extraction limited in the predecessor record, but the draft uses it only for a qualified analogy.
- **Minor locator/wording:** none requiring correction. Keep moving VS Code source references explicitly date-bounded / branch-moving as the draft already does.
- **Honestly unresolved external input:** target app/repository, exact OS floor, runtime and trust model, safe document capability, current persistence/version, role authorization, and numeric product targets.

The package is ready for a fresh complete revision that addresses MI-1 and MI-2 while preserving all original brief obligations and the exact revealed plan. This critic did not edit or repair the investigator draft.

