# Breadth critique — B06-P01-treatment

Stage: critic-breadth  
Review basis: the complete brief, investigator discovery and draft, released plan and reveal record, investigator source map/index, and the governing primary sources listed in this critic's source map. This is a breadth review; detailed source truth/applicability is for the complementary critic. No final proposal is written here.

## Overall assessment

The draft covers all eight released-plan clauses with explicit dispositions and carries the brief’s major requirements through the proposal: optional selected-file access, capability and UI behavior, whole-result validation and preview, stale-revision handling, built-in fallback, update integrity/rollback, resource controls, cross-platform failure behavior, alternatives, phased validation, and a clear boundary between proposed and executed checks. The original plan’s risky path-grant and process-equals-security premises receive direct treatment. It also identifies that no target editor or host repository was supplied rather than inventing product code.

Two comparative details would make the scope complete and easier to adjudicate. A remaining host-specific evidence gap should stay an explicit condition on later integration recommendations.

## Findings

### CB-01 — Add in-process Wasmtime as an execution comparator
**Priority: medium; comparison completeness.**

The alternatives table contrasts in-process native/unrestricted script, Wasmtime inside a dedicated OS-restricted worker, native sandboxed helpers, and browser/remote execution. It omits embedding a Wasmtime component in the editor process. The tagged Wasmtime security guide describes WebAssembly’s checked linear-memory accesses and explicit imports as its sandbox model (CRIT-WSEC). That makes in-process Wasm a real design point distinct from unrestricted native modules: it avoids worker-launch and IPC costs, while preserving guest-memory isolation at the Wasm layer.

Add a row or a short explicit rejection. Compare startup/serialization cost and host-language integration against the shared-process failure/resource boundary: a runtime defect can affect the editor process, host calls still need bounds/cancellation, and a guest that consumes process resources can harm responsiveness. The source describes Wasmtime’s design and mitigations, not immunity from runtime or embedder defects. Given the brief’s responsiveness and crash requirements, the likely disposition is to keep the runtime in a separately killable worker, but make that choice visible as a comparison rather than letting “Wasm” imply process isolation. This is a completeness request, not a claim that in-process Wasmtime satisfies the brief.

### CB-02 — Make the data-exchange comparison explicit
**Priority: medium; comparison completeness.**

The draft discusses private pipes/named pipes with framed messages, JSON-RPC, WIT, and deferred shared memory, but these alternatives are not compared together. Add a compact comparison of (a) framed serialized request/response over private anonymous pipes or platform handles, (b) typed WIT calls/resources for a component, and (c) shared-memory exchange only if profiling supports its added complexity. State the portability and small-team tooling burden, framing/backpressure and size-limit needs, and the lifetime/aliasing cost for shared memory. JSON-RPC’s own spec distinguishes request IDs and responses from notifications, which have no error response (CRIT-JSONRPC); WIT supplies typed interface constructs but does not define the host’s domain invariants or grant authority (CRIT-WIT).

Also state plainly that message format or transport is not the isolation boundary: the worker/OS policy and narrowly exposed host API determine access. This would satisfy the brief’s request to compare exchange alternatives and their actual limits without duplicating the security architecture.

### CB-03 — Keep host-code research as a named integration gate
**Priority: medium; scope limitation, acknowledged by the investigator.**

The brief asks for repository code, callers/tests, and release or issue history where consequential. The supplied brief does not name an editor or repository, and the investigator correctly reports that no application host code was inspected. Keep that limitation attached to the recommendation: before choosing integration details, identify the actual product/repository and inspect its selection model, revision/undo transaction path, command registration, extension callers/tests, and packaging/update path. The current generic proposals for stable IDs, whole-document revision checks, preview, and independent built-in registration are design hypotheses until matched to that host. Do not speculate about a repository that was not supplied.

## Coverage already strong

No breadth finding is raised for permissions, optional-file consent, network omission in v1, conflict/no-partial-apply semantics, package extraction/update rollback, fail-closed sandbox setup, or staged validation; these are covered in the investigator draft. Preserve its separation of recommendations from executed checks and its statement that no untrusted extension was installed or run.
