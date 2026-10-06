# ER9 minimal candidate tools

This prospective v1.3 adds trusted operator-only `resource_profile_path=None` to
`mcp_configs` and `execute`; it adds no candidate tool argument or tool name.
The optional profile uses a byte-identical pinned copy of Luna's trusted
`resource_slice.py` reader (SHA-256
`22d1cac0d12720de9d14ecef1f35e849b80c6f81a523296b023b298abaeee790`).
Luna's prospective complete-profile route requires an explicit profile; generic
backward-compatible tests without one make no private-aggregate placement claim.
Profiles must stay outside all candidate file namespaces and are never mounted
inside the code sandbox. Original stop time clamps the service and execution
deadline; there is no refreshed clock.

For a supplied profile, systemd-run assigns the sandbox to the exact private
`er9mem<32 lowercase hexadecimal digits>.slice`. A trusted host gate runs before
Bubblewrap and candidate bootstrap. It checks its exact own cgroup, the live
2304 MiB aggregate MemoryMax/Swap0, and the live 256 MiB sandbox MemoryMax/Swap0
in both systemd and cgroup-v2 kernel files. It writes `resource_placement.json`
before executing the unchanged sandbox command. Gate failure leaves code
UNEXECUTED. The result preserves that placement witness after service collection
and the aggregate's after-execution memory/OOM events where observable. Shared
aggregate events are not silently attributed to this one sandbox. OOM/nonzero
executions retain their real elapsed/exit/resource receipts and costs.

This directory owns sandbox placement only. The route owner separately verifies
outer worker 768 MiB, native 768 MiB, source MCP 256 MiB and execution adapter
256 MiB, all under the same 2304 MiB private slice, before native inference. Local
placement tests do not claim complete route fit or alter active jobs. Existing
source/body/file/stdout/CPU/task/runtime/network limits and the five APIs are
unchanged. `test_resource.py` covers rejected names/caps/modes/symlinks/private
namespaces, operator-only config, actual positive placement, and negative live
parent-cap acknowledgement preventing candidate bootstrap.

This prospective v1.2 additionally fixes execution MCP stdio framing: nonblocking
os.read feeds an explicit bounded newline buffer, avoiding buffered-read-ahead
behind selector readiness. Coalesced initialized notifications and following
requests now drain while stdin remains open. The original absolute deadline and
EOF behavior remain enforced. Source MCP's direct readline loop is unchanged;
it has no corresponding selector/read-ahead defect. `test_framing.py` exercises
coalesced and fragmented frames, real execution/receipt/cgroup cleanup, source
catalog/read compatibility, original deadline and controller EOF. Existing
v1/v1.1 failures and pins remain immutable. No tool/API/resource access expanded.

This immutable prospective v1.1 fixes only trusted-host user-manager environment
selection and cleanup receipt classification. All systemctl calls now select the
same explicit local user bus as systemd-run. Query failure is QUERY_UNAVAILABLE,
never unit-absence evidence. Successful not-found/inactive/empty-ControlGroup
responses classify a collected unit as absent; loaded inactive units also require
an empty or unpopulated cgroup. Full stop/query facts are retained. Bubblewrap,
candidate code/data, mounts, resource limits and source capture are unchanged.
The original v1 canary002 result and source pins remain immutable; its supplemental
cleanup erratum records the later exact-unit observation and reproduction.

This directory supplies generic mechanics. It contains no campaign-case finding,
source interpretation, evaluator answer, or premium-authored candidate witness.
An execution example is ordinary arithmetic, arrays, JSON, strings or a tiny
candidate-authored function; all claim-specific code and expected values must come
from the candidate. The tool can contradict the claim when the candidate designs
an independent check. Repeating an erroneous formula does not validate it.

## Trusted host admission

Import `config.py`, then call:

```python
mcp_configs(workspace, capture_dir=None, evidence_dir=None,
            deadline_monotonic_ns=None, execution_enabled=False,
            public_get=False)
```

The returned `mcp_servers` entries are the supported command/args/env objects for
the native route; `tool_allowlist` is the exact admitted-name list. Set native
host shell, file, web, installer and evaluator-data tools unavailable. Every stage
uses its own case input/output scope and receipt stores. Launch these trusted MCP
services as host siblings; nested Bubblewrap fails the current host's supported
AppArmor namespace permissions. Existing ER8 `route-recovery-v2/broker_exec.py`
is the separately pinned private Unix UID/cgroup-authenticated bridge precedent
for a route which needs sibling stdio forwarding. This directory supplies no TCP
bridge or provider credential proxy.

`pm_boundary` mounts only `inputs/`, `TASK.md`, `out/`, public captures and its
private operation receipts. It does not mount the case root, `.zcode`, provider
HOME, native transcript, evaluator directory or filesystem root. Task artifacts
must use `out/...`; prospective prompts using `output/...` must be mapped or
rewritten before freeze/launch. Read/write tools cannot read receipt metadata or
write anywhere except exclusive new files beneath `out/`. The operator must not
put credentials or evaluator answers in candidate inputs. Configurable capture
and evidence stores must be disjoint from each other and candidate inputs/out.

`pm_execution` is a trusted Python MCP adapter on the host. It never executes
candidate Python in that host process. It accepts **only** a code string plus
optional JSON value `data`. It starts a randomly named systemd user service and
a fresh Bubblewrap empty-root mount/user/PID/network namespace. Runtime mounts
`/usr`, `/lib`, `/lib64` are read-only as in the existing mechanical boundary;
only code, data and trusted bootstrap are separately mounted read-only. No case
inputs, outputs, receipts, host HOME, credentials, socket, network, evaluator
files or package-install destination are mounted. The Python interpreter uses
`-I -S -B`, so user site/import paths are disabled. No AST blacklist is used as
a security claim. Candidate code has the standard library and can write only to
its disposable sandbox filesystem. No third-party package environment is admitted
in v1; if later needed it requires its own isolated pins and prospective admission.

Each execution has 5 seconds of service wall time, 3 seconds of CPU per process,
256 MiB cgroup memory with swap disabled, 16 cgroup tasks, 256 MiB per-process
address space, 64 file descriptors, 1 MiB per-file size, no core dumps, and
32 KiB retained stdout/stderr each. Descendant processes share the memory/task
cgroup and are killed when namespace PID1 exits or the owned service is stopped.
The adapter targets only its assigned unit. It records the post-stop unit state;
`cleanup_confirmed=false` must not be promoted to completed/quiescent evidence.
Execution requests are additionally bounded by the stage deadline when supplied.
The route's external stage supervisor remains responsible for whole-session and
source-MCP termination; the source helper's inherited limits are per-operation.

Candidate call (generic illustration, not a case answer):

```json
{"code":"import json; print(json.dumps([x*x for x in data]))","data":[2,3,5]}
```

Tool names are `mcp__pm_boundary__read_file`,
`mcp__pm_boundary__write_file`, `mcp__pm_boundary__mechanical`, optional
`mcp__pm_boundary__public_https_get`, and treatment-enabled
`mcp__pm_execution__python_execute`. The only configured difference between
execution-off and execution-on is the additional execution server/name, keeping
public retrieval and artifact tools constant when access is not the factor.

## Public retrieval is a separate mechanical path

`source_capture/{boundary.py,tool_server.py}` are byte-identical copies of the
trusted ER8 source-capture-v1 code, also selected by ER8 route-recovery-v2.
Their old campaigns/grades/admissions do not carry forward as current native
qualification. Upstream paths and SHA-256 identities are in `SOURCE_PINS.json`.

`public_https_get({"url":"https://..."})` permits candidate-chosen public HTTPS,
including public unauthenticated GitHub REST repository/search/tree/issue APIs,
raw primary-source files, and official public search/documentation pages. This
is an access class, not a predetermined evaluator source list. Native candidates
can discover sources from a blank brief by choosing their own public queries and
following public responses. No search inference, ranking, findings or sources
are authored here; the response is only captured data. Public endpoints may
rate-limit unauthenticated requests; a 4xx response is retained as that status.

Every DNS result must be global unicast; connections pin a checked IP and TLS
authenticates the public host. Every redirect is independently rechecked. No
supplied cookies, auth, headers, proxy, body, credentials or alternate port are
allowed. The source service is the network-enabled trusted mechanical path;
the Python execution namespace has no network. Bodies are content-addressed
with exact raw SHA-256 and URL/status/version/completeness metadata. A 512 KiB
retained-prefix cap and 32 KiB initial delivery are explicit; more text can be
read in bounded ranges. Truncated captures are not full-source evidence.

Archive extraction and repository installers are **not admitted** in this v1.
Binary archives are captured as raw data without extraction/decompression; their
text replacement view is not a faithful archive input. Use public textual tree
and raw-file endpoints for source investigation. Thus archive path traversal,
links and installer side effects cannot cross the host extraction boundary.

## Receipts and execution labels

Each execution has immutable host-created code/data/bootstrap/request/stdout/
stderr/result files in `evidence_dir/executions/exec-*`. Inputs, runtime binaries,
implementation, output bytes, UTC/elapsed time, exit, caps and post-stop state are
recorded. `stderr-observed.bin` retains the trusted bootstrap start prefix;
`stderr.bin` and its returned hash describe candidate-visible stderr after that
prefix is stripped. `bootstrap_started=false` is **UNEXECUTED**, not execution
credit. The actor is fixed by trusted config, not supplied as a tool argument:
candidate runs are `executed by candidate`; independently invoked evaluator runs
are `executed only by evaluator`. Plans without a matching receipt remain
`proposed/UNEXECUTED`. Real route/tool use still requires frontend/native receipts.
Host tool receipts prove execution/transport facts, not comprehension, semantic
correctness, whole-application behavior or independent expectations. Time and
randomness remain available, so deterministic witness logic is candidate-owned.

## Targeted verification

Run `python3 -B test_tools.py` and
`python3 -B source_capture/test_source_capture.py` from this directory.
The first tests real local sandbox arithmetic/arrays/strings/functions, JSON,
host sentinel/env/process/network isolation, read-only mounts and ephemeral
writes, exit/error/actor labels, memory/CPU/process/wall/output limits, deadline,
post-stop inactivity, configuration scope and rejected arguments. The inherited
14 source tests cover pinned DNS/TLS, redirect rejection, immutable capture,
bounded incomplete/binary delivery, traversal/symlink/hardlink/private paths,
receipts and actual local empty-root MCP RPC. Tests make no provider/model calls.
Verification status/pins are in `VERIFICATION.json` and `SOURCE_PINS.json`.
Native candidate canaries and scored uses are route owners' separate admissions.
