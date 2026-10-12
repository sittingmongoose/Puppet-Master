# Independent critic review — Cancelable local document-preview jobs

Run: B12-P02-treatment. Stage: critic.

## Review basis and boundary

I reviewed the released brief, complete investigator discovery and draft, investigator source map and navigable source index, revealed plan, and plan-reveal record identified by this stage's input map. The plan-reveal record binds the released plan to SHA-256 \`246e56cbd6e35d3d4c150efd760897150d477c2349a987c5c9686606dcbdc008\` and discovery to \`fdd54c796eac4490185af28ca3c007eddfd86561824f3f526f524f72e25a136f\`. Source IDs S01–S16 are retained unchanged; this review adds S17 for an independently checked Rayon API page. Direct source checks and their conditions are recorded in \`source-map.json\` and \`sources/index.md\`.

This is a critique only. I did not edit the investigator's proposal, author a replacement, run downloaded code, build or deploy an application, run an executable witness, or execute application tests or benchmarks.

## Overall assessment

The proposal is substantially responsive to the brief and improves every material clause in the tentative plan. It gives a coherent request/coordinator/handler/cache/UI contract, distinguishes cache identity from view generation, treats cancellation as asynchronous, scopes resource controls beyond thread count, and separates executed research from proposed application validation. I found no material claim that is plainly false.

The main correctness gap is that the source revision used to key a result is not explicitly bound to the exact bytes the handler read. A second important matter is honestly unresolved: the brief disallows assuming every parser is trusted, while the supported OS and available per-user isolation mechanisms are unknown. Two smaller evidence/provenance points are below. Numeric budgets and handler-specific capabilities are properly left for owner input.

## Findings

### C1 — Material incomplete: bind rendering to a source revision

**Draft locator:** Recommendation; Request identity and submission; Lifecycle, cancellation, and recovery; Cache, restart, and persistence. **Plan clauses:** P07 and P08.

The draft says to include a source revision or fingerprint in the cache key, revalidate the source before publication, and accept a displayed result only when its revision and selection generation still match. Those are the right guards, but the integration contract does not say how the revision is guaranteed to describe the bytes actually consumed by the handler. A path may change after fingerprinting and before the child opens it, or while rendering. A pre-publication stat can also fail to distinguish edits when the chosen metadata has coarse resolution or is restored. The draft identifies external-file revision semantics as an open fact, but the behavior when the library cannot supply a stable revision remains unspecified.

This matters because an otherwise successful render could be stored under one revision while depicting another. The Freedesktop standard verifies URI/mtime and optionally size, yet explicitly warns that second-resolution mtime collisions can produce the wrong thumbnail; GNOME likewise uses URI and modification-time metadata. See S07–S08. This is an inference about the race in the proposed contract, not a claim that those desktop implementations promise stronger identity.

Before implementation, the library/handler boundary needs an explicit revision guarantee: for example, a stable library revision, immutable snapshot/open-handle semantics, or a revalidation rule that discards a result when the consumed bytes cannot be tied to the recorded revision. The brief allows owner-specific facts to remain open, so this is a material completeness condition rather than a reason to reject the overall direction.

### C2 — Honestly unresolved external input: security boundary for untrusted handlers

**Draft locator:** Recommendation, paragraph 2; Lifecycle, cancellation, and recovery; Open owner decisions, item 1. **Plan clauses:** P04 and P13; brief constraint: do not assume every parser is trusted and do not require a privileged machine-wide service.

The draft accurately says that a child process contains many crashes but is not by itself a sandbox, and asks whether per-user parser isolation is required. That is a useful and truthful distinction. The brief's untrusted-parser constraint means this cannot be silently treated as settled by choosing a child process: a child running as the application user may still have access to user files or network resources. The required OS/minimum versions, handler set, and availability of suitable unprivileged controls are not supplied, so this is honestly unresolved external input. The contract should retain an explicit per-handler trust/isolation decision, including the behavior when a requested isolation mechanism is unavailable.

S05 documents that Rust Child::kill targets the direct child and that dropping Child does not wait or terminate it. S06 documents Windows Job Object process grouping and resource controls, along with breakaway and OS-version caveats; these controls do not alone define parser access policy. S14 is a narrowly scoped Node worker_threads issue that illustrates a thread's shared crash domain, not evidence of a universal parser vulnerability.

### C3 — Unsupported in the investigator's carried evidence: Rayon comparison

**Draft locator:** Evidence and alternatives table, “Worker execution”; discovery, “Mechanisms and alternatives found.”

The statement that Rayon’s standard work-stealing pool does not itself define the app’s visible-versus-import admission policy is a reasonable design inference, but the investigator source map does not include a Rayon source. My independent check, S17, confirms the documented thread-pool and work-stealing model; the absence of an app-specific priority-lane policy is an inference from that API surface, not a direct Rayon guarantee. Label it as an inference or cite the checked primary page in the proposal's own source index.

### C4 — Minor wording/provenance: PDF.js worker_threads history

**Draft locator:** Relevant implementation history and applicability, final bullet; Evidence and alternatives table, “Fault boundary.” **Source:** S14.

The package mostly scopes this example correctly: the report concerns Windows Node worker_threads, and it warns against generalizing to Web Workers or all parsers. Tighten the attribution around “6.x is fixed.” The reporter's no-fault results cover specified 6.0.227 and 6.3.289 runs on one Windows host; the maintainer says Node worker_threads are unsupported and calls the issue already fixed, but the page does not establish a maintainer-verified fix or universal behavior across machines. The result is useful implementation history only at that scope.

## Released-plan clause review

| Clause | Critic disposition |
| --- | --- |
| P01 — FIFO queue, two worker slots | Correctly changes FIFO to bounded visible/import lanes and treats two workers as a measured starting point. No universal worker count is claimed. |
| P02 — cancel older request for same document | Correctly narrows supersession to a request/presentation target and uses non-reused request IDs, one-way cancellation, and selection generations. |
| P03 — check cancellation between pages | Correctly expands checkpoints and adds deadlines; it says non-cooperative work cannot be hard-stopped in-process and should use a process boundary or be unsuitable. |
| P04 — ask child to exit; wait for both slots | Correctly replaces unbounded shutdown with stop-admission, grace, termination, and reap. Platform process-tree and parent-crash policy remain OS-specific and unresolved. |
| P05 — front-insert visible, append imports | Correctly rejects strict priority and proposes weighted service plus aging/coalescing. The ratio and a numeric starvation/latency bound remain owner decisions, as the draft says. |
| P06 — retry twice | Correctly replaces unconditional retries with classified, bounded transient retries and excludes deterministic failures, stale work, cancellation, and resource rejection. |
| P07 — path and mtime cache key | Correctly rejects this as sufficient identity and adds source/profile/handler dimensions. C1 remains for binding that revision to consumed bytes. |
| P08 — any success writes; UI checks selection | Correctly requires validation and separate cache-publication and UI-generation guards. C1 remains for external-source revision races. |
| P09 — page fraction or activity | Correctly keeps unknown totals indeterminate and proposes phase-aware, sequenced progress. S10 confirms PDF.js can report NaN percentage without a total. |
| P10 — persist and resume queued renders | Correctly leaves render jobs transient and has the durable import owner reissue idempotent work. The owner's persistence boundary remains open. |
| P11 — rename temporary output on success | Correctly retains temp-then-publish with size/type/source checks and calls for OS/filesystem validation rather than asserting universal behavior. |
| P12 — review identity, fairness, recovery, restart | Covered by the proposed request, scheduler, lifecycle, cache, and validation contracts. |
| P13 — responsive, local, unprivileged, truthful progress | The local/no-upload/no-GPU/no-machine-service constraints are preserved. Slint event-loop handoff is supported by S01. Parser access isolation remains C2. |

## Original-brief obligation check

- **Identity and stale previews:** Strong separation of request ID, document/source revision, cache key, and visible selection generation; C1 is the unresolved end-to-end revision binding.
- **Priority, fairness, and resource bounds:** Both demand classes, admission/backpressure, worker and per-handler bounds, memory/pixel/input/output/disk limits, deadlines, no-progress watchdog, and retry caps are addressed. Numeric policies require owner workload/platform facts.
- **Cancellation, shutdown, crash and stalled jobs:** Request-scoped cooperative cancellation, terminal outcomes, child supervision, forced stop/reap, and watchdogs are proposed. Hard stop is not promised for non-cooperative in-process handlers.
- **Cache validity and restart:** Complete profile identity, validated temp publication, evictable completed cache entries, transient work queue, and import-owner reconciliation are addressed. C1 and import-owner facts remain.
- **Progress:** Sequenced phases and meaningful optional units/fractions avoid false percentages; implementation validation is proposed, not run.
- **Mechanisms and implementation history:** Tokio, std channels, child processes/Windows Job Objects, desktop thumbnailing, PDF.js cancellation and worker history, SQLite, and Rayon are compared. S17 supplements the Rayon evidence; the PDF.js history is scoped.
- **Constraints and alternatives:** The proposal stays local and unprivileged, does not require GPU or upload, and contrasts threads/pools/processes, scheduling policies, cancellation styles, and file/SQLite caches. C2 preserves the open security-policy decision.
- **Validation and actual work:** The seven validation groups in the investigator draft are explicitly proposed. The recorded executed work is source research and the plan reveal; no product build, runtime witness, application test, or benchmark is claimed as run.
- **User-specific facts:** Platforms, formats/handler versions, revision semantics, budgets, fairness targets, durable-import ownership, sandbox availability, and cache policy are explicitly listed as open decisions.

## Native Goal lifecycle record

The one frozen native Goal was activated before reading case input; the exact activation response is preserved in \`native-goal-active.json\`, and the exact-goal binding guard passed. Source/session provenance and native activation/completion timestamps are UNKNOWN wherever the exposed responses do not provide them. This critique and source evidence are saved before completing that same Goal; its exact completion response is preserved separately in \`native-goal-terminal.json\`.

## Executed versus proposed

For this critic stage, I opened the primary documentation, specifications, and implementation-history pages enumerated in the critic \`source-map.json\). The investigator's build, runtime, application tests, and performance benchmarks were not run by this critic. The validation list above remains proposed work.
