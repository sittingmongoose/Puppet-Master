# v8 execution path — baseline, operator review required

Author clock: 2026-10-02 01:44:17 UTC. Prospective author ceiling: 30 minutes,
120 conservative response events, final 10 minutes reserved. No clock reset.
This is one new v8 boundary baseline, with at most two ordinary repair versions.
v7 is closed and immutable. No native Goal, candidate, canary or provider was
launched by the author. Offline tests launch only source-authenticated public
mechanical fixtures.

## Mechanism and scope

`make_plan.construct` makes an exact command, but never launches it. The operator
records an immutable original case/stage clock authority before work. One
absolute CLOCK_MONOTONIC deadline is the minimum of the original stage cap,
original case elapsed deadline and campaign native cutoff. Repeated/retried
work must reuse that original stage clock and caps. The case authority preserves
3600 elapsed, 5400 occupied and 300 outside-native ceilings (or smaller original
ceilings). Occupied and outside-native costs still require the operator's atomic
case/slot ledger; this adapter makes no whole-case cost qualification by itself.

Three static `deadline_gate` supervisors own independent kernel POSIX timers:
outer before systemd-run, service before bwrap bootstrap, namespace PID1 before
Python imports/admission/setup/metadata/runtime/waits/cleanup. All use the same
operator-bound absolute ancestry; the service/PID1 hard stop is three seconds
inside the inclusive deadline to reserve time for positive absence observation.
The gate stays the timer-owning process across fork and wait; it never execs away
its timer or disarms it. Every direct child receives kernel PDEATHSIG with an
immediate parent check. A required systemd transient user service owns the
bootstrap and full descendant cgroup. Its KillMode=control-group,
KillSignal=SIGKILL, SendSIGKILL=yes, TimeoutStopSec=1s and Restart=no remain fixed.
The relative RuntimeMaxSec is defense in depth, never the inclusive proof.

Supported bwrap --unshare-user --unshare-pid --as-pid-1 creates the sole native
process ownership namespace. Native descendants may create sessions or nested
namespaces but cannot move to ancestor PID namespaces. On PID1 death Linux
terminates every namespace descendant and rejects subsequent forks into the
namespace. No guessed PID/PGID, shared process scan or sibling kill is used.
The / bind and /dev view preserve host-side native application access; this is a
lifetime adapter, not a replacement privacy sandbox. The original bounded MCP
privacy boundary remains the sole model-visible tool boundary.

`entry.py` is already inside the armed PID namespace before reading any source,
clock/admission/configuration metadata. It requires independent acceptance of
this exact snapshot, validates all source/executable pins, verifies its PID1
parent and the gate's exported deadline, and writes positive own-cgroup
enrollment before invoking the exact old Z runtime. The single selected v8 route-assembly-v1/launch.py is invoked only after
its separate route snapshot and independent acceptance are hash-bound and every
public dependency is checked. Its fixed --config/--lease/--case-binding/--acceptance
ABI receives four exact host-only path/hash records. Entry crosschecks the lease
unit/deadlines/case authority and case birth/stage clock/caps/input paths/mode
against this original plan before invoking the assembler. That assembler owns the explicit new capture
server/mount, fresh HOME/controlled roots and prospective v8 native admission
ABI while reusing exact v7 engine/runtime source. The old productive-context
HOLD is not lifted by the old canary. No old canary claim may be rewritten.
A new counted v8 lifetime canary is labelled by `v8_stage_role` and is limited
to 480 seconds/64 responses, with native --mode canary. Integrated v8 stages use
--mode productive and require a SAME-new-boundary independent native-canary PASS
with explicit lifetime/Goal/privacy-inventory predicates. Offline proof alone
is insufficient. Native Goal Mode, GLM-5.3-Flash/max, native continuation/verifier and provider
retry behavior remain in the pinned v7 code. No semantic Sol tool enters this
candidate path. Host keys are never emitted or made model-visible by this code.

## Operator handoff

1. Independently review SNAPSHOT.json and write a host-only acceptance record
   with verdict accepted and snapshot_sha256. Bind its exact path/hash in each
   plan. Boundary acceptance alone does not authorize a native launch.
2. Bind an immutable clock authority file containing the exact `clock` object
   accepted by make_plan.construct. Supply a unique stage_id, exact selected v8
   method/admission and separately accepted route snapshot evidence and all original caps. Output a plan to
   a regular host-only path with no symlink ancestry.
3. Invoke the plan's exact command through the authorized operator, without
   changing argv, deadline, native caps or retry ancestry. Native output stays
   outside the candidate workspace. Entry's enrollment path is adjacent to the
   host-only plan and may not be reused; failed versions and costs stay retained.
4. After the command finishes, call observe.observe with its enrollment, exact
   own unit name and original deadline. It reads only that positively enrolled
   cgroup. Positive cgroup populated=0 or removal must be observed AFTER the full
   read and at or before the inclusive deadline. Missing enrollment, blocked
   observation, late observation, live groups or missing native receipts remain
   unqualified; occupied costs stay held until positively safe quiescence. The
   original service/PID1 timers remain the cleanup path if the outer client dies.
5. Review actual native activation/continuation/completion, exact allowed tool
   inventory, privacy, source-acquisition receipts and ordinary native receipts
   separately. Forced shutdown cannot fabricate a complete Goal or quality pass.

All preparation, admission, retries, service startup and cleanup belong to the
original stage/case/campaign accounting. After positively observed native
quiescence, immutable copy/hash/render/accounting work may be outside this native
proof interval, but its elapsed/occupied/overhead cost is still charged.

## Build and tests

Build: `/usr/bin/gcc -std=c11 -O2 -Wall -Wextra -Werror -static -o deadline_gate deadline_gate.c`
from this directory. Exact compiler, Python, bwrap, systemd-run and systemctl
executables are pinned in SNAPSHOT.json. Local host has systemd 257 user manager
and cgroup v2. Pin/review after rebuilding because the executable hash is part
of the accepted boundary. Python uses -I -B; no generated bytecode is trusted.

Author tests: `python3 -B tests/test_offline.py`. Tests cover actual kernel stop
through the complete ownership stack, startup/enrollment stalls, FIFO metadata
stall, ignored SIGINT/SIGTERM, setsid descendants, late bootstrap, expired
admission, original clock/cap retries, and late absence rejection. Independent
checker separately covers service bootstrap, outer SIGKILL, surviving sibling,
positive cgroup enrollment and late entry. No candidate/native calls are tests.

A deliberately standalone bwrap --block-fd fixture (bypassing REQUIRED systemd
ownership) timed out before namespace setup. Preserve that failure; the full
service cgroup closes that bootstrap gap. PDEATHSIG alone is insufficient across
user-namespace credential changes. The production path never permits bypassing
the service. This is a test-scope finding, not a qualified native result.

These are ordinary Linux process controls, not hard-real-time guarantees against
kernel/storage failure. Actual observation after the deadline always fails
closed and retains held costs rather than claiming retroactive qualification.

Primary mechanism references: [Linux PID namespaces](https://man7.org/linux/man-pages/man7/pid_namespaces.7.html),
[POSIX timers](https://man7.org/linux/man-pages/man2/timer_create.2.html), installed
systemd.kill(5), systemd.service(5), systemd-run(1), bwrap --help. The Linux manual
specifies namespace-init death and rejected subsequent forks; POSIX timers are
not inherited through fork and are deleted on exec, hence separate supervisors.

## Capture integration

The selected assembler's snapshot/acceptance must explicitly pin the prospective
v8 acquisition-capture server/mount as an integration delta. No old privacy
closure claim substitutes for this review. The lifetime adapter adds no semantic
model tool and never silently replaces a v7 file. Actual acquisition remains
unestablished until positive public URL/body/range-delivery host receipts exist.

Repair1 preserves the rejected baseline observer: supplying a later deadline
against an expired enrolled cgroup could qualify late absence. The observer now
requires the exact enrollment deadline/schema/types; the failed checker record
and baseline source remain under versions/baseline-v1. No old clock was reset.

Repair2 preserves repair1's frozen dc96856f5913541b24b1709caf6a473c14464f5dac1e2d9efcede280bbc13914 source: assembly crosschecks used argv/expected_mode before assignment and would fail startup. Those exact native argument/type/cap/mode checks now occur before the crosschecks. No behavior/cap/clock was weakened. This is the final permitted ordinary execution repair.
