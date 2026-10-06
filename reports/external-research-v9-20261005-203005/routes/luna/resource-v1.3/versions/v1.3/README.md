This prospective Luna resource version keeps exact GPT-6 Luna/max, the admitted client-dynamic tool binding, original wall clock, native completion-tail policy v1.1 and exact owned-unit quiet policy v1.2. It changes only complete-job resource accounting and placement. Old attempts and live runtimes remain unchanged. No native Goal or inference test was performed for this version. Research fit under these limits is UNKNOWN; every OOM or resource failure remains a charged attempt.

The aggregate kernel `memory.max` is 2415919104 bytes (2304 MiB), with `memory.swap.max=0`. A fresh private `er9mem<32 hex>.slice` contains every retained component: outer worker/controllers/guards/waiting launch helpers 805306368 bytes; native Codex 805306368; source MCP adapter 268435456; execution MCP adapter 268435456; each execution sandbox 268435456. The aggregate is authoritative even if sandbox calls overlap. The sandbox limit is per sandbox; it is not a pooled 256 MiB promise. Short allocation and launch requests finish before inference and remain in the shared protected ops control plane. No retained per-job helper may remain outside the private aggregate.

Ops records the original monotonic birth BEFORE allocation/preparation and runs:

```
python3 dev/luna-route/resource_slice.py allocate \
  --label JOB --birth-monotonic-ns ORIGINAL_NS --max-seconds FINITE_SECONDS \
  --out FRESH_PRIVATE_PROFILE_JSON
```

The exclusive mode-600 profile contains exact private slice identity, actual systemd/kernel aggregate limits, original birth/total stop and component caps. The allocator does not launch a candidate. Ops must verify the selected immutable profile/reader pins and launch its new outer worker with `--slice=<profile.slice_unit>`, `MemoryMax=805306368`, `MemorySwapMax=0`, `KillMode=control-group` and a RuntimeMax computed from the SAME original total stop, without adding a fresh clock or extra 45 seconds. Allocation failures consume their elapsed preparation cost. A fresh allocation/profile must never be reused after an attempted launch.

The stage CLI is the v1.2 interface plus mandatory `--resource-profile ABS_PROFILE_JSON`; `--birth-monotonic-ns` must equal the profile birth and `--max-seconds` must establish the same profile total stop. The stage rejects execution outside the actual outer worker cgroup, and verifies actual native/source/adapter unit caps and retained helper PID placement before `thread/goal/set` or `turn/start`. Tool configuration carries the profile to the trusted execution server, whose gate verifies the sandbox before executing bwrap; the profile is not mounted into candidate tools. Allowed tool inventory still follows execution_enabled/public_get (four or five tools as prepared), with no added candidate capability.

The route's `mechanical_route_pass` also requires no observed aggregate OOM, original deadline, native completion and all original owned-runtime quiet checks. Stage quiet does not imply the outer worker has exited or the aggregate is released. The new ops wrapper must freeze required artifacts and finish under the original total stop, preserve any interrupted-tail receipt and failures, then exit. External ops calls:

```
python3 dev/luna-route/resource_slice.py release \
  --profile ABS_PROFILE_JSON --out FRESH_RELEASE_JSON
```

Release snapshots aggregate memory peak/events before stopping ONLY the exact allocated slice and requires recursive `cgroup.events populated=0` (or slice cgroup absent), plus inactive/failed unit state. Ops retains the resource permit until this positive release proof. Outer-worker OOM/no result/timeout is a resource/operational failure, never a successful native completion. OOM counters and systemd Result/MemoryPeak supplement cost/status; they do not grade source quality.

Admission remains ops-owned. Select this version only for wholly unstarted symmetric pairs or expressly declared new lineages. Keep the 3 GiB host reserve and all outstanding owned reservations. The full declared per-job hard bound is 2359296 KiB. An available margin of 3 GiB admits no positive candidate budget. No sibling/global profile/resource intervention is part of this version.

Replay requires the previously admitted trusted Codex executable and inherited route-local controls. The positive source closure excludes private HOME/auth, proprietary generated schema/catalog/vendor files and raw native/candidate/evaluator output. Published synthetic regression receipts contain no model payloads. The seven route resource regressions prove actual caps/placement, overlap containment, wrong-cap/placement/profile rejection, deadline/controller EOF cleanup, exact recursive observer, and a genuine tiny synthetic aggregate OOM. They establish containment, not research fit.

An additional real tool-relay integration test ran entirely inside the actual outer worker slice. It verified the source and execution adapters plus all retained helpers, exact five-tool inventory and four-tool control configuration, successful confined TASK.md read and Python stdout42, pre-bootstrap sandbox cap/placement, original owned PID/cgroup quiet, and external aggregate release. Its native-shaped resource test process was only a local sleeping Python child: Codex was never launched and no model/thread/Goal existed.
