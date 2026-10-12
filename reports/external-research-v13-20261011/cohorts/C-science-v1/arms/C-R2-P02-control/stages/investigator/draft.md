# Investigator draft — C-P04 export-worker architecture

**Run/stage:** C-R2-P02-control / investigator  
**Brief:** C-P04 software planning brief  
**Released plan:** SHA-256 4272bc763dfb1c1f9373b33f7749cb9ee0422f6b3377bd9761ba1b5d37ebb48e; read only from this stage’s revealed-plan.md.  
**Discovery freeze:** SHA-256 2b9f9e9f9cd1ce540fb53d295a3e6d9f5e35c7dd947832807391256daca1973a; discovery.md was not edited after reveal.  
**Evidence index:** [sources/index.md](sources/index.md). Source IDs are stable; exact URLs, locators, access UTC, observed operations, conditions and applicability are in [source-map.json](source-map.json).

## Recommendation

Use a host-owned export transaction with a versioned manifest/protocol and one independently tracked job per export. Default to a separate native process for third-party or compatibility converters, launched with a read-only immutable snapshot and a private job staging directory. The host, not the converter, owns the requested destination, validates outputs after the entire worker process tree is stopped, and performs the transfer/commit. Add a WASM component path for converters that can target the chosen runtime and a deliberately narrow host API. Restrict in-process converters to trusted code or an explicit owner-approved compatibility case.

This is an architecture recommendation, not a plugin-runtime or converter selection. A process boundary isolates crashes and gives the host a termination target; it is not itself a filesystem sandbox or a memory limit. Enforcement must be reported per host/platform and per setting actually enabled. WASM narrows authority through imports and WASI preopens but its module-memory setting is not a cap on total runtime/host memory. An in-process converter has no hard fault or resource boundary.

## Disposition of released-plan clauses

### Clause 1 — declare capabilities, snapshot/temp paths, completion manifest, and promotion

> The provisional interface lets a converter declare supported inputs, output types, and a preset schema before admission. A worker receives a read-only document snapshot and a writable temporary directory. It returns a completion manifest listing generated paths and a status code. The draft would promote those paths to the destination when the converter exits successfully; inspect whether status and a path list establish the requested completeness and transfer properties.

**Disposition: retain and strengthen declarations and staging; reject success based only on exit status and listed paths.**

**Required correction:** worker status plus paths cannot establish completeness or transfer; the host must verify and commit. **Optional hardening:** signed package metadata, content digests, output quotas and independent format parsers. **Owner decision:** format validators and destination success semantics.

- **Supported:** A declarative, non-executing descriptor should list converter ID/publisher, package version and digest, protocol version, supported input/output identifiers, required/optional capabilities, preset schema version and worker entry point. Keep a stable ID separate from display name. The descriptor is discovery evidence, not a security or behavior proof. Discover in app-managed extension roots or explicitly registered user-selected locations; do not execute candidates during discovery or grant them broad home-directory access. VS Code’s extension manifest is an example of declarative identity, compatibility and contributions, not a worker isolation model. Pandoc’s format list and explicit writer option show why the host should enumerate or confirm formats and pass the requested output format explicitly rather than infer it from a filename. [S01](sources/index.md#source-s01), [S12](sources/index.md#source-s12)

- **Retain with a contract:** Freeze a document snapshot before the job can start; expose it read-only and isolate every job’s staging directory. The worker may write only there. Use root-relative output names, validate they remain inside the staging root, reject unsafe traversal and unapproved links, and enforce per-file and total-output quotas.

- **Correct the completion contract:** The manifest should identify exact expected outputs (relative path, requested format/media type, byte length and digest; optionally a format-specific validation result). The host must wait for the full tracked process tree to exit or be terminated, then independently verify each listed path exists, is the expected file type, stays within quota, and matches declared bytes/digest. Reject missing outputs, mismatched bytes, malformed manifests, unsafe paths, and structurally invalid outputs where a validator exists. A worker-provided status and path list are only claims. A zero exit code does not prove semantic completeness; a digest proves byte identity, not correctness. Pandoc’s release history records an ODF expansion that could exhaust memory, a style cycle that could loop forever, and silent content-loss fixes. Those defects make independent limits and format-level validation material, but do not prove any one validator detects every failure. [S02](sources/index.md#source-s02)

- **Reject:** Do not promote files merely because the main process exits successfully. A child that escaped tracking could still mutate staging; an incomplete/truncated output can have a successful exit; the converter may claim paths that do not exist; successful staging does not mean destination transfer succeeded.

- **Two-phase promotion:** Keep final destination writes host-owned. Validate staging first. Then use a destination-side temporary write and verify copied bytes before commit; use atomic replacement only when that destination supports it. Linux rename provides atomic replacement on supported same-filesystem moves, but cross-mount moves return EXDEV. Atomic name replacement is not proof of semantic completeness or remote persistence. For cloud/provider destinations, define success as the provider’s strongest available acknowledged operation, and report if durability/atomicity cannot be established. Do not claim cross-platform atomicity from Linux behavior. [S11](sources/index.md#source-s11)

- **Owner decision:** Define supported output validators and what “complete” means for each format; define success semantics for local, network, removable and provider-backed destinations. No generic byte-level rule proves semantic correctness for arbitrary converter output.

### Clause 2 — process isolation, timeout/memory, progress, responsiveness, cancellation

> Each converter would run in a separate process with a wall-clock timeout and a configurable memory allowance. The host would accept progress messages on a bounded channel and keep editing responsive by limiting concurrent workers. Cancellation would first request cooperation and then terminate a worker after a short grace period. The implementation must distinguish requested policy from actual enforcement, including child processes, partial files, and platform differences.

**Disposition: retain per-export process isolation, but make timeouts, memory, descendants, progress and terminal states explicit and conditional.**

**Required correction:** distinguish requested limits from observed enforcement; track child processes and partial files; keep cancel requested separate from cancelled; do not promise editor responsiveness from a worker count alone. **Optional hardening:** coalesce progress, retain bounded diagnostic logs, and add per-job CPU/temp quotas. **Owner decision:** supported OS matrix, grace period and numerical budgets.

- **Worker boundary:** One process tree per export is the recommended compatibility default. Keep per-job request IDs, staging paths, logs, quota accounting and state so one crash or cancel cannot damage another export. Capture and bound stdout/stderr. Do not assume a same-user process has restricted filesystem or network access; launch with the narrowest OS permissions available. macOS App Sandbox is entitlement/user-grant based; user-selected URLs are security-scoped, and helper behavior must be configured. The documented sandbox behavior is not a general third-party memory cap. [S08](sources/index.md#source-s08), [S10](sources/index.md#source-s10)

- **Timeout:** Implement an application monotonic wall-clock deadline. The initial cooperative cancel is followed after a configured grace period by termination of the complete job process tree, then a wait/reap phase. A Windows Job Object job-time limit counts user-mode execution time, so it is not a wall-clock replacement. Mark the job cancelled only after tracked workers/descendants are gone and the host has quarantined or removed that job’s partial outputs. If destination commit has already crossed its defined commit point, resolve the cancel race as completed or committed-with-warning, not as a fictional rollback. [S03](sources/index.md#source-s03), [S08](sources/index.md#source-s08), [S13](sources/index.md#source-s13)

- **Actual memory enforcement:** Replace a single universal “memory allowance” claim with requested policy plus observed enforcement. On supported Linux hosts, attach the process tree to a cgroup v2 before it can allocate and configure memory.max; account for cgroup availability, permissions and ancestor policy. The documented default is max and the kernel notes limits can be exceeded temporarily and accounting is not completely watertight. On Windows, enable the appropriate Job Object process/job committed-memory flags and test child containment; limits are not automatic. On a Wasmtime path, set the runtime’s linear-memory limit explicitly, while separately budgeting runtime/host RSS and host calls. Its documented default is unlimited and the cap applies per linear memory. On macOS, do not claim a generic hard memory cap based on App Sandbox. If an OS cannot enforce the requested cap, show that the policy is best-effort or decline that mode according to a product decision. [S05](sources/index.md#source-s05), [S07](sources/index.md#source-s07), [S09](sources/index.md#source-s09), [S10](sources/index.md#source-s10), [S13](sources/index.md#source-s13)

- **Descendants:** On Windows, Job Objects normally associate CreateProcess children unless breakaway is enabled, and nested jobs depend on OS version. On Linux, attach the complete subtree to its cgroup before untrusted work can fork; cgroups are effective only for attached tasks. For any host, test escape/breakaway/spawn paths and report uncontained configurations. No platform-neutral process API alone proves all descendants are contained. [S07](sources/index.md#source-s07), [S08](sources/index.md#source-s08), [S13](sources/index.md#source-s13)

- **Error propagation:** Keep the worker’s protocol result separate from host-observed process and OS outcomes. Return stable error classes for unsupported capability, launch failure, nonzero exit/crash, timeout/cancel, resource limit, malformed protocol, output verification and destination transfer. Preserve bounded stderr/diagnostics and include the phase and job ID; do not let worker-supplied text or status override host verification. Where configured, retain OS limit notifications/counters as evidence. [S03](sources/index.md#source-s03), [S07](sources/index.md#source-s07), [S13](sources/index.md#source-s13)

- **Progress:** Use per-job progress tokens and a bounded message size/rate. Keep progress independent from cancel/control messages. If the UI falls behind, coalesce or drop superseded progress updates instead of blocking the worker or losing a terminal result. Validate message shape, monotonic counters when provided, and terminal ordering. LSP 3.17 is precedent for tokenized progress and cancellation; it still requires a response for a cancelled request and does not assert that the underlying work has stopped. The converter protocol must define acknowledgment and host escalation. [S03](sources/index.md#source-s03)

- **Responsiveness:** A worker-count cap is necessary but insufficient. Conversion must never run on the UI thread. Reserve interactive capacity, cap aggregate worker CPU/memory/temp space, and use OS CPU weights/caps only where actually supported. Linux cpu.weight is a relative share among eligible active tasks and cpu.max is a bandwidth cap; Windows job CPU rate is a cap and may suspend job threads until the next interval. Neither promises a fixed editing latency. [S07](sources/index.md#source-s07), [S09](sources/index.md#source-s09)

- **WASM alternative:** A component can expose a typed WIT world and receive only explicit WASI preopens. This is a better authority boundary for converters that can target the runtime, but still requires host-call deadlines, aggregate runtime memory controls, output quotas and an exact runtime/version support matrix. It is an alternative, not a guarantee that native third-party programs are sandboxed. [S04](sources/index.md#source-s04), [S05](sources/index.md#source-s05), [S06](sources/index.md#source-s06)

- **Status correction:** Keep queued, preflight, running, cancel-requested, verifying, transferring, succeeded, failed and cancelled distinct. A terminal succeeded state is written only after host verification and destination commit. A cancellation request is not a cancellation result. A short grace period is a policy value requiring owner choice and measurement.

### Clause 3 — preset version/configuration and compatibility-range assumption

> Presets would store the converter identifier, version, and configuration. The draft assumes a compatible version range can safely reuse an old preset. Research capability negotiation, schema migration, and explicit user review as alternatives to silent reinterpretation.

**Disposition: retain identity/version/configuration; reject the assumption that a compatible version range means preset semantics are unchanged.**

**Required correction:** changed converter code or schema must not reinterpret a saved preset silently. **Optional improvement:** preserve the original payload and provide a migration preview/history. **Owner decision:** exact pin, verified compatible update range, and which migrations require review.

- Store stable converter ID and publisher, exact package version and content digest, worker protocol version, preset schema version, and canonical parameter payload. Preserve the original saved representation and the version that interpreted it.
- Treat an update as compatible only if the converter declares a migration/compatibility contract for that preset schema and the host verifies the new converter advertises every required capability. A protocol/API compatibility range does not specify whether an old setting keeps the same meaning.
- On schema change, run a versioned, deterministic migration on a copy; record old/new versions and migration result. Show review/confirmation when migration is lossy, ambiguous, newly unsupported, or changes output-affecting defaults. Keep the original preset recoverable. Do not silently rewrite it.
- Pandoc 3.12.1 adds FODT while changing/fixing reader and writer behavior; its release record is evidence that product versions can change supported outputs and conversion results. WIT package names support explicit SemVer, and VS Code extension metadata declares version/host compatibility; neither mechanism alone guarantees saved-configuration semantics. [S02](sources/index.md#source-s02), [S04](sources/index.md#source-s04), [S12](sources/index.md#source-s12)
- **Owner decision:** Choose whether a preset pins an exact build by default, what verified upgrade range is allowed, and which schema migrations may run without a prompt. Given the requirement that interpretation must not silently change, default to exact identity/digest pinning and explicit review for a changed output-affecting build.

### Clause 4 — fair admission/promotion, evidence-backed dispositions, validation witnesses

> Recommend fair admission and promotion rules, with evidence-backed dispositions for the proposed completion protocol, cancellation path, and resource accounting. Propose witnesses for a hanging converter, excess output, failed destination transfer, concurrent small and large exports, and converter upgrades. Label any witnesses executed during research and their actual enforcement domain; do not claim tests of our future host.

**Disposition: use two-phase output promotion plus an age-aware fair scheduler; proposed validation only.**

**Required correction:** successful process exit is not the publication point, and a concurrency cap alone is not a starvation or responsiveness policy. **Optional improvement:** queue wait/latency telemetry and regression thresholds. **Owner decision:** service targets, resource numbers and commit semantics for non-atomic destinations.

- **Admission:** Central scheduler with global and per-converter active-job limits; admission checks capability, snapshot readiness, destination access (where safely testable), disk budget and policy support before starting a converter. Reject unsupported required capabilities before work.
- **Fairness:** Use a bounded fair-share queue with aging and per-job resource accounting. Reserve capacity for interactive editing and prevent a stream of large jobs from continuously bypassing an older small job. Pure FIFO can leave a small job behind repeated long work; strict priority can starve exports; unknown durations make shortest-job-first a hint rather than a guarantee. An age boost or explicit admission slot gives bounded queue progress. Do not choose numerical worker/CPU/memory limits until supported platforms and responsiveness targets are decided and measured.
- **Promotion:** Treat publication to destination as a transaction: private staging → process-tree stop → manifest/path/format/length/hash validation → destination-side temporary transfer → destination verification → atomic/available commit → succeeded. On failure, do not mark success; clean up the private stage and any destination-side temporary object without replacing a prior valid target when the destination allows rollback. Where rollback/atomic replacement is unavailable, expose the weaker guarantee and owner-approved semantics. [S11](sources/index.md#source-s11)
- **Alternatives:** Native subprocesses favor legacy compatibility and crash containment; WASM offers narrower imports/preopens when converters can target the runtime; cooperative in-process APIs reduce overhead but share memory/crash/cancellation fate. Recommend subprocess as the interoperability baseline, WASM as an explicit opt-in path, and in-process only for trusted owner-controlled converters. No runtime/product is selected.
- **Research checks executed:** None. I read primary documentation and release history; I did not install or run a real converter, compile/download public code, execute a synthetic converter, configure a sandbox, or test the future host. Each witness below is a proposal.

| Proposed witness | Setup and pass condition | Enforcement domain / boundary | Status |
|---|---|---|---|
| Hanging converter and child | Disposable worker blocks, ignores cooperative cancel and spawns a child. After grace, host kills/reaps the tracked tree, does not publish partial files, preserves the source snapshot and a sibling export. Repeat with breakaway/escape attempt. | Host watchdog plus configured Windows Job/cgroup/process-tree mechanism. Observe OS-specific containment; infer no cross-platform guarantee. | Proposed; not run |
| Excess output / memory | Worker writes beyond per-file, per-job and disk quotas and allocates past requested memory cap. Host contains it, records which limit fired, rejects output and preserves editor/sibling jobs. | Host byte quota; Linux cgroup memory.max; Windows job committed-memory flags; Wasmtime per-linear-memory cap. Measure separately. | Proposed; not run |
| Exit 0 with incomplete manifest | Return success with missing path, truncated file, wrong hash/format, traversal path and malformed manifest. None reaches destination or reports success. | Host-side independent path/digest/format validation after worker tree is stopped. | Proposed; not run |
| Failed destination transfer | Inject failure during copy/commit, including after N bytes; existing target remains unchanged when supported, temporary output is removed/quarantined, terminal status is failed/retryable and not succeeded. Test same-volume, cross-volume and provider destinations separately. | Host transfer/commit logic and destination adapter; Linux rename evidence applies only to same-filesystem rename. | Proposed; not run |
| Small and large concurrent jobs | Repeatedly enqueue long/large jobs ahead of a small job while editing. Check oldest-job wait bounds, no starvation, progress, bounded resources and measured editing latency against owner-set target. | Queue/scheduler and OS CPU limits on each supported host; Linux weights and Windows rate caps do not by themselves prove latency. | Proposed; not run |
| Converter upgrade and preset | Save preset under build/schema N; install candidate with changed defaults, output capability or schema. Old preset retains meaning unless explicit migration is applied/reviewed; missing required capability rejects before execution. | Discovery/version/digest/schema negotiation and migration; Pandoc release history motivates regression corpus, not a test of this host. | Proposed; not run |
| Progress/cancel race | Flood progress while canceling; UI remains responsive, progress is coalesced, one terminal state wins, and no late worker writes alter canceled staging. | Bounded host protocol channel plus worker termination and stage cleanup. LSP is a protocol precedent only. | Proposed; not run |

## Brief obligation crosswalk

| Original obligation | Disposition |
|---|---|
| Extension discovery and capability negotiation | Declarative identity/version/capabilities; no candidate execution for discovery; validate manifest and worker handshake before work; reject unsupported required capabilities. |
| Isolation and converter crashes/hangs | Separate process tree per export as default; WASM alternative; in-process limited to trusted code; OS enforcement conditional. |
| Progress and cancellation | Per-job progress channel, independent control path; cooperative cancel then tree termination/reap; no success or cancellation inferred from process exit alone. |
| Fair resource use and editor responsiveness | Bounded fair-share admission, aging, per-job budgets and interactive reserve; measure rather than claim responsiveness from worker cap alone. |
| Input snapshot protection and sibling exports | Immutable read-only job snapshot and unique stage/accounting per export; cancel one job only. |
| Output completeness and transfer | Host verifies all declared files and destination transfer/commit; status/path list alone rejected; report atomicity/durability limits. |
| Preset interpretation across updates | Exact converter/schema identity and digest; explicit migrations/review; compatible range alone rejected as semantic guarantee. |
| Process/runtime/in-process alternatives | Process baseline, opt-in WASM for compatible modules, cooperative in-process only for trusted/approved code; no runtime/product selected. |
| Filesystem/temp/resource/error/platform behavior | Staging and destination separation; cgroup/Job/WASI/app-sandbox conditions recorded; requested policy separated from actual enforcement; protocol/OS errors surfaced. |
| Validation plan and actual checks | Seven concrete witnesses proposed above; none executed and no future-host test is claimed. |

## Open or owner-resolved items

1. Minimum supported OS versions and behavior when memory, CPU, process-tree or filesystem containment cannot be enforced.
2. Converter trust/distribution model, package signing/update channel, and allowed discovery roots.
3. Per-format output validators and the precise supported meaning of “complete.”
4. Default wall timeout, cancellation grace, CPU/memory/process/temp/output budgets and editing responsiveness target.
5. Destination contract for network/cloud providers, including what acknowledgment is enough for “transferred” and whether a prior target must survive partial failure.
6. Preset update policy: exact digest pinning, reviewed migrations, and when user confirmation is required.
7. Whether the project will support a WASM converter ABI and which runtime/spec versions are pinned.
8. Whether any first-party converter may run in-process, and the explicit trust/impact boundary for that exception.

These are product/platform owner decisions; the evidence supports constraints and alternatives but does not choose unsupported platform targets or quota numbers.
