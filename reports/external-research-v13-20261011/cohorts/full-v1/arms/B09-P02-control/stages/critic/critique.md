# Independent critic review — B09-P02-control

**Stage:** critic  
**Reviewed:** admitted brief; exact released plan; investigator discovery, draft, source map, plan reveal, and sources index.  
**Assessment:** The draft is a careful, research-backed proposal and broadly covers the brief. I found no material factual error in its central Windows Job Object, Linux cgroup v2, SQLite WAL, or Tokio semaphore descriptions. It needs clearer shutdown handling and a more precise fairness guarantee before it can serve as a complete design proposal. The SQLite release-history record also needs correction. This critique identifies issues and uncertainty; it does not write or repair a final.

## Scope and review record

The brief does not name a target application, repository, runtime, or test suite. The investigator correctly says that app-specific source, caller, and test inspection was therefore unavailable. The revealed plan was read from the mapped path and its SHA-256 and byte count match the one-time reveal record: 80356345baad2274724e5dfc67de202b988f3a5a87bec342e6946c35438d70e3, 2,391 bytes. The frozen discovery digest also matches its reveal record.

I independently checked the primary evidence governing consequential platform and persistence claims; my source records are C01–C09 in the accompanying source map and index. Those checks support the draft’s stated conditions: Windows job membership/descendant exceptions, close-kill and committed-memory semantics; Linux cgroup accounting, high/max behavior and delegated ownership; SQLite’s WAL operating limits, fix history and synchronous-mode tradeoff; Tokio FIFO/head-of-line behavior; and VS Code’s cancellation/progress API as a precedent only. The direct evidence does not select product defaults or settle fairness policy.

No target-app source or test could be identified from the brief. No code, tests, workload, crash test, or platform capability test was run in this critic stage. Draft validation remains proposed validation.

## Findings

### F01 — Material incomplete: shutdown and worker reaping

**Locator:** released plan P2, sentence 3; draft P2.3; “Corrected lifecycle contract — Restart” and “Start.”

The plan says that host shutdown records queued work and stops owned workers. The draft specifies recovery at the next startup—marking unresolved attempts, reconciling an old process group, fencing its generation, and avoiding unsafe duplicate retries—but never gives the host-shutdown sequence itself. Its lifecycle list has Start, Cancel, Publish, and Restart, with no Shutdown step.

**Why it matters:** Restart safety depends on whether an old worker is stopped, still running, or demonstrably gone before any retry. A startup-only rule leaves unclear what happens to an owned worker while the host is exiting, how long shutdown waits, and how an OS boundary is cleaned up. This is an implementation-relevant gap in the plan’s stated behavior, not a reason to reduce scope.

**Evidence and disposition:** Windows documentation says KILL_ON_JOB_CLOSE terminates job members only when the last job handle closes; assignment, inheritance and breakaway conditions still govern membership (C01, C02). Linux cgroup management is restricted to the owned/delegated subtree, with single-writer ownership; mere cgroup membership is not itself a described host-shutdown policy (C03, C04). Add a proposed shutdown sequence: stop admission, persist each transition, signal owned workers, wait for an owner-set grace period, force-stop only a verified task boundary, and leave unresolved work recovery-required until the previous worker is confirmed gone. Keep the grace period and supported cleanup capabilities as owner/platform decisions.

### F02 — Material incomplete: fairness guarantee is not yet operationally defined

**Locator:** released plan P1, sentences 2–3, and P3, sentence 3; draft P1.2, P3.3, “Fairness candidate,” and open owner decisions 1–2.

The draft correctly distinguishes admission turns from service time and names round robin, class weighting, lookahead, and age promotion as candidates. However, “a small configurable number” of skipped jobs plus an undefined “aging/barrier rule” does not yet define the condition that ends bypass or the strongest promise made to a waiting job. The prose says that aging prevents indefinite skipping, but gives no rule or bound that would make this true for an individual job under continuous arrivals and resource-blocked work.

**Assessment:** This is an inference from the draft’s underspecified candidate policy, not evidence that round robin itself is unsuitable. The draft properly leaves a fairness metric to the owner; it should also state which policy property is being proposed for prototype and avoid promising starvation prevention until the barrier/aging rule is explicit and validated.

**Evidence and disposition:** Tokio’s fair semaphore grants permits by request order, and a large acquire_many request can head-block a smaller acquire; that API behavior does not answer extension-level admission fairness (C08). The DRR-to-job transfer is already labeled an analogy in the investigator package and is not a substitute for the missing product rule. Add a concrete testable candidate rule (including what happens when the oldest job cannot fit the current memory/worker state), identify the measured thresholds, and separately state whether the promise concerns an extension’s next start opportunity, each job’s eventual start, or service/completion time.

### F03 — Minor locator/wording: SQLite release-history record is stale

**Locator:** investigator source-map.json, S12; draft “Embedded queue candidate.”

S12 says the live SQLite release page showed 3.53.4, dated July 24, as the top release at 2026-10-12 00:41:49Z. The official release history records SQLite 3.54.0 on 2026-10-09, so 3.53.4 was not the top release at that recorded access time (C07). This is a source-record/currentness error. It does not change the draft’s substantive WAL recommendation: the official WAL page says the reset bug is fixed in 3.51.3 and later, and the draft already requires checking the application’s actual bundled build (C05, C07).

Correct the “top release” metadata before this source map is reused. Do not infer the target application’s bundled SQLite version from the current upstream release.

### F04 — Unsupported as an empirical rule, but properly presented as a candidate

**Locator:** draft “Memory candidate.”

The reservation formula—maximum of a class baseline and a confidence-adjusted estimate—is not established by the cited sources or by measurements in this assignment. The draft calls it a candidate, distinguishes declared, host-estimated, and observed values, lists the needed measurements, and proposes error tests. I do not treat this as a false source claim. Preserve that framing and test the formula against underreported, missing, stale, and adversarial declarations on each OS before turning it into a default or guarantee.

### F05 — Honestly unresolved external input: target application contracts

**Locator:** brief (no target named); discovery scope; draft “Open owner decisions.”

The host’s existing extension identity model, input snapshot contract, caller behavior, worker runtime, actual SQLite build, and supported OS configurations cannot be established from the brief or upstream reference projects. The investigator accurately discloses this limit. Resolve those items against the actual host and measured workload when that input is available; do not present Tokio or VS Code as the unnamed application’s implementation.

## Plan-disposition cross-check

| Released-plan area | Critic disposition |
|---|---|
| P1 queue record, classes, extension cap, wait reason and user control | Addressed. The draft adds durable identity/generation, independent queue bounds, wait reasons and queued/running cancellation. Staff/user authority for promotion remains an owner decision. |
| P2 estimate budget, worker boundary and restart | Strong corrections to trusting declared estimates and equating slots with memory bounds. Conditional Windows/Linux enforcement and fallback are accurately qualified. Add the shutdown/reaping sequence in F01. |
| P3 staged output, cancellation race, fairness, hard constraints and validation | Fencing/publication order is a reasoned host design, not a database/filesystem atomicity claim. Payment/admin/process-ownership constraints are preserved. Validation is clearly proposed, not run. Clarify the per-job fairness property in F02. |
| Provisional proposal and comparison scope | Preserved. The draft compares feasible fairness and execution boundaries without authorizing implementation or deployment. |

The draft covers the original obligations for queue ownership, variable memory, cancellation, progress, restart, visible wait reasons, partial versus complete reports, safe publication, both desktop OS families, no administrator requirement, no payment priority, no unrelated-process termination, manual override consequences, alternatives, measurements, phased integration, and failure/load validation. Its unresolved numeric defaults and owner policy choices are appropriately not invented.

## Critic execution and Goal record

The actual native Goal was activated before reading case/source input; the exact create response is preserved in native-goal-active.json and native-goal-create.json, and the exact-objective binding guard passed. The directly observed response reports the Goal as active and contains its thread ID, objective, status, token/time fields, and created/updated epoch fields. Provenance and independent timestamp freshness are UNKNOWN beyond that response and the checker. This critique and source map are saved before completing that same Goal. No replacement Goal was created.
