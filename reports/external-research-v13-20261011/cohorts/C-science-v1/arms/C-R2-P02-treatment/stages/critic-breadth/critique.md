# B06 Complementary Breadth Critique — C-R2-P02-treatment

**Scope.** Reviewed the released brief, complete frozen discovery and draft, investigator source map and index, revealed plan and release record. The draft is broad and substantially addresses the released clauses; this critique is limited to breadth, obligations, plan dispositions, alternatives, and missing mechanism families. It is not a replacement architecture recommendation, and no worker or application validation was run here.

**Frozen review basis (SHA-256).**

- `brief.md`: `b94bb075dcf8f4217efb6edbd4ce62f8cf149b969da555bbd169e730632f64f9`
- `discovery.md`: `fca2c3962786ae9c44b81e14ee1b2af4852f5888792742409acd4cbc85cd3692`
- `draft.md`: `1f6f0a7e8a46feec553687202b1d26a3273705133c5c5e2e1e85df0778e941cb`
- `source-map.json`: `3c96f8558f39619daa8e46db6844413ff18dea47a261e7a9336e45d86d09b467`
- `revealed-plan.md`: `4272bc763dfb1c1f9373b33f7749cb9ee0422f6b3377bd9761ba1b5d37ebb48e`
- `plan-reveal.json`: `b55ce686be5143585c0809c306b9574d52c7231564745912e9b89183a6b5046b`
- `sources/README.md`: `d4d4c4c01108eb525cfbc8ef4d24a4c72a060087f3315d0d54f6f7bec6afff4b`


## Overall assessment

The draft preserves the important plan dispositions: C1/C2/C5–C9 and C11–C16 are retained with concrete detail; C3 is strengthened; C4 and the compatible-version assumption in C10 are rejected; and process, WASI, and trusted in-process alternatives are compared without selecting a converter or runtime. It also keeps proposed witnesses distinct from checks actually run. The following gaps are material to the brief’s resource and isolation claims. The reviser should incorporate or explicitly leave them as host/product decisions, without weakening the draft’s existing cautions.

## Findings for the reviser

### CB-01 — Per-job scratch/output capacity has no concrete hard storage boundary (high)

**Where:** Draft C3/C5, “Isolation and host enforcement comparison,” “Fair admission and promotion policy” step 2, and “Platform enforcement probe.” The text calls for output-count/size quotas and per-job scratch-size budgets, but does not name an enforced storage-usage mechanism or bound all converter-writable temporary paths. A coordinator byte counter is useful validation; by itself it does not establish a filesystem-enforced cap on all temporary allocations or aggregate concurrent scratch use.

**Why it matters:** Third-party converters can exhaust the volume even while CPU and I/O rate limits are active. The Linux cgroup v2 source describes `io.max` as BPS/IOPS throttling, not a disk-space quota; its resource limits can also be overcommitted [S02]. Kernel XFS documentation describes project quota accounting and optional enforcement, but that is filesystem-specific and must be enabled/configured [B01]. The plan explicitly requires resource limits and temporary outputs, so `scratch-size` needs a host mechanism and an honest unsupported-host path.

**Disposition:** Specify a per-job hard scratch/output allocation where available (for example, a dedicated quota-backed scratch area); ensure all writable temp, sidecar, and staging paths are inside it; and state how aggregate scratch capacity is reserved. Record requested/applied/unsupported separately. On hosts/filesystems without an enforceable cap, either reject untrusted exports or label the weaker bounded-output policy as degraded under an owner-approved policy. Add validation for filling the quota, sparse/large writes and cleanup after kill, plus multiple jobs jointly exhausting scratch. Do not present `io.max` as a capacity cap.

### CB-02 — Per-job limits and a concurrency ceiling do not bound aggregate load (high)

**Where:** Draft C5/C6/C13 and the fair-admission steps. It proposes a host-wide worker-count ceiling, per-job CPU/memory/PID/scratch budgets, and reserving editing capacity, but it does not say that admission reserves those budgets against one shared export envelope. A fixed worker count can still launch several individually compliant memory- or I/O-heavy jobs together. FIFO/aging addresses order after admission; it does not protect editing or guarantee fair service when all slots consume the same bottleneck.

**Evidence and scope:** Linux cgroup v2 explicitly permits child limits to be overcommitted; `cpu.weight` distributes cycles among active children, and `io.max` is a throughput limit [S02]. Those mechanisms alone do not prove the application-level total budget or preserve a reserved interactive share.

**Disposition:** Add a coordinator-owned resource-admission budget (at minimum memory, CPU/service share, process count, scratch capacity and device I/O policy) with a reserved editing envelope. Admit only when the job’s policy maximum fits the remaining export budget, or state a deliberate overcommit policy and its failure mode; do not trust a converter’s self-reported estimate as its enforceable maximum. Then apply the fair queue to jobs waiting for compatible resource slots. Extend the concurrent small/large witness to combine many individually in-limit jobs, continuous arrivals, memory pressure and I/O pressure while measuring editing responsiveness and starvation. Keep numerical SLOs as owner decisions unless set.

### CB-03 — macOS privilege-separation alternative is named but not evaluated (medium)

**Where:** Draft’s native-process option mentions Apple’s preference for XPC, but the option table and validation matrix do not compare an XPC service/broker with a directly launched per-export helper. Current Apple documentation says a helper started through `Process` inherits the sandbox of its parent, while XPC services can have different entitlements [B02, B03]. Apple’s XPC overview describes launchd-managed services and a per-client process/lifetime model [B02].

**Why it matters:** This is a useful host-specific isolation design: an XPC broker may let a host-owned helper receive only a snapshot handle and scratch capability instead of the editor’s broader static entitlements. It may also be a poor fit for dynamically installed third-party executables or strict per-export teardown; the current draft does not adjudicate that trade-off. The source evidence does not establish per-converter CPU, memory, or disk quotas.

**Disposition:** Add a short macOS sub-option or an explicit rejection: assess whether XPC is only a broker around separately installed converters or the converter process itself; cover entitlement separation, selected-file/snapshot handoff, service lifetime, cancellation of one job, and the absence of a general resource quota in the reviewed material. Keep per-export process supervision and the degraded-mode decision explicit. Add a witness that verifies actual helper entitlements and file access rather than inferring them from the parent app.

## Lower-priority follow-ups

- The draft correctly leaves signing/admission policy open. Preserve that owner decision, while stating that the coordinator must bind a manifest to the exact executable/package it verifies and must not treat a self-declared digest or capability list as authenticated truth. A release/update can otherwise swap what the saved preset identity names.
- The validation matrix should include scratch-space enforcement and aggregate overcommit, not only per-worker excess output and a general CPU/memory/path probe. Mark each witness proposed; none was run in this critic stage.
- Do not infer a finite queue-wait guarantee from aging alone. The draft already notes the need for bounded service and leaves a numeric target open; retain that limitation and test repeated arrivals with jobs that have heterogeneous resource needs.

## Coverage already adequate; retain

The draft covers the full provisional plan rather than only the security concerns: extension/capability discovery before document exposure; a versioned protocol and preset/schema identity; snapshot and output isolation; progress separate from completion; per-job cancellation and descendant teardown; host-dependent cgroup, Job Object, AppContainer, Landlock, App Sandbox and WASI controls; destination verification and transfer semantics; semantic converter-upgrade risk using Pandoc history; and the requested hanging, excess-output, failed-transfer, small/large concurrency and upgrade witnesses. The explicit distinction between evidence reviewed, checks run, and future validation is appropriate. These should remain intact while adding the findings above.

## Research performed in this critic stage

Read the permitted frozen package and reopened the cited Linux cgroup v2 documentation for the overcommit and I/O semantics. Consulted the Linux kernel XFS documentation and current Apple XPC/Process documentation for the additional mechanism-family findings. Pages that require JavaScript exposed only an indexed documentation summary in the browser; that access limitation is recorded in `source-map.json`. No converter, downloaded code, app, or synthetic witness was executed.
