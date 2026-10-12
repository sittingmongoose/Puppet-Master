# Extension isolation for a diagram editor — investigator draft

## Status and recommendation

This is a research-backed proposal based on the brief and the exact plan copy released at the declared comparison point. It is not implementation work, a production security audit, or a claim that untrusted code has been run.

Keep the plan’s dedicated worker process, serialized selection snapshot, proposed patch, host validation and preview, stale-document handling, built-in fallback, timeout and package-hosting principles. Correct the central security premise: **a separate process contains many crashes and gives the host something it can terminate, but it does not by itself restrict file, network, device, IPC or process authority.** Before enabling third-party extensions, specify and test enforceable OS restrictions on both Windows and Linux. [WIN-APP] [BWRAP-README] [WSEC]

For the first prototype, keep one narrow, versioned extension contract and put each extension run behind a worker supervisor. Compare two backends against that contract: (1) a Wasmtime WebAssembly Component in a dedicated OS-restricted worker; (2) a native helper process with Windows AppContainer plus Job Object and Linux bubblewrap plus seccomp and, where supported, delegated cgroup limits. The Wasm candidate offers a portable guest boundary and explicit host imports, but Wasmtime and host calls remain part of the trusted computing base. The native candidate broadens language/toolchain choices but increases per-OS and per-distribution policy, packaging, compatibility, and support work. Do not select a backend until a small supported-language and target-OS prototype passes the proposed gates below. Never enable an extension without a verified sandbox on that OS; if setup fails, disable extensions and leave built-in commands usable.

The initial permission set should be: no direct extension filesystem, network, device, process-launch, or host-command access; the active selection is copied into a bounded, immutable snapshot only when the user invokes the extension; the optional file is opened by the host after a user selection and passed as bounded read-only content or a one-run read capability. A path string alone is not a permission boundary. A manifest may declare the extension’s requested capabilities for review, but the manifest cannot grant them. The host must enforce every grant through the available API surface and OS policy. No network API is exposed in the first version.

## Disposition of each released plan clause

### 1. Separate process, serialized selection snapshot, and document revision

**Disposition: keep, with a precise boundary statement.** A worker process moves loops, faults, and cancellation away from the UI thread and makes termination possible. The process itself does not control what the worker can access. Pair it with a capability-limited API and a platform sandbox before treating code as untrusted. [WIN-APP] [BWRAP-README] [WSEC]

The host should capture the selection and document revision before launching the run. Send a deep, immutable, size-bounded snapshot of only the selected objects and the minimum context needed for the transformation. Include schema/API version, stable object IDs, and the base document revision. Never give the worker a mutable document handle, raw in-process pointer, host credentials, or ambient paths.

### 2. Return a proposed patch; validate and preview before apply

**Disposition: keep and strengthen.** A transformation returns a proposal, not a document mutation. Parse under frame and byte limits; require the supported protocol version; validate the complete response before showing it. Reject unknown operations/fields, malformed or duplicate IDs, unknown references, forbidden object types, invalid/non-finite coordinates, excessive object counts, excessive nesting, invalid geometry, and any domain invariant violation. A path filter or a successful parse is not semantic validation.

Build the candidate on a detached copy. The first version should use the released plan’s conservative whole-document revision check: if the revision differs at commit time, apply nothing and prompt the user to rerun or explicitly review the result against the current diagram. Never silently rebase a possibly stale transform. A later version may allow rebasing only when every touched object and relevant relation still matches its captured precondition; that optimization needs explicit tests. Once a candidate passes every check and the user confirms the preview, commit it as one host-owned, undoable transaction. Any failure leaves the live diagram unchanged.

### 3. A changed revision prompts retry or explicit review; built-ins do not depend on extension startup

**Disposition: keep.** Make conflict states visible and recoverable. Do not automatically rerun extension code after a conflict: the result may be nondeterministic or may require another file/permission decision. Offer “Run again” and “Review proposal”; retain the proposal only if it can be safely checked against the current state. A corrupted or absent extension registry, worker launch error, or runtime crash must not delay or remove built-in commands. Register built-ins independently and load extensions as optional workers.

### 4. Manifest declares file-read/network capabilities; first version passes a selected path and omits network APIs

**Disposition: correct.** Treat manifest declarations as a human-readable request and audit record, not as enforcement. In v1, expose no filesystem path, directory listing, network API, device, arbitrary host call, subprocess API, or installer API. A user gesture launches a run with the active selection snapshot. If that run needs a file, show the host’s file picker at that point, state that the extension receives the selected file’s contents for this operation, and give it read-only access for one run only. Enforce file-size and read-time limits in the host before sending bytes. Do not pass a path that lets the extension reopen siblings or resolve a symlink later. On Linux, document-portal grants can persist across sessions; use a nonpersistent grant or host-mediated bytes. The XDG FileChooser specification also states that type filters are usability hints and may not restrict what the backend permits. [XDG-FILE] [XDG-DOCS] [WIN-CAPS]

A future network capability would need an owner-approved use case, named scope (destination/service and direction), clear user-facing explanation, a separate allow decision, and matching enforcement on Windows and Linux. It is not part of this proposal’s v1. If no product requirement establishes a network use case, remove it from the capability list rather than presenting users with an unused permission.

### 5. Permission prompts per extension, locally remembered

**Disposition: refine and leave persistence as an owner decision.** The host should have an extension details page showing publisher, version, requested capabilities, and why each is needed. Ask for baseline selection access when the user enables/invokes the extension in a way that makes that access meaningful; do not grant background access merely because the extension is installed. Ask for optional file access at the moment of file selection and limit the grant to that operation. The user can decline and cancel or use a feature that does not need the file. Do not remember file or network grants in v1. A future remembered grant must state its exact scope and expiry and provide a visible revoke path.

If a package update requests a capability the installed version did not request, prompt again before switching versions. If declined, retain the previous version. Firefox’s optional permission and update prompts are a useful UI precedent for explaining a request at point of use and keeping the old version when new privileges are declined; they are not evidence of native desktop enforcement. [MOZ-PERM]

### 6. Timeouts, patch-size limits, worker termination, and worker-lifetime measurement

**Disposition: keep and extend.** Run all parsing and extension work off the UI thread. Have the supervisor enforce separate wall-time, CPU, memory, process-count, input-size, output-size, and host-call budgets. The precise numbers are owner decisions to be set from benchmarks and threat assumptions, not invented here. On cancellation, timeout, malformed protocol, or worker crash, terminate the entire worker process tree, discard its output, release file grants, and report that no changes were applied.

For Wasmtime, enable fuel explicitly, set a per-run budget, cap guest memories/tables/instances, cap all input/output and host API allocations, and use a cancellable async host-call path. Fuel starts disabled and epochs do not interrupt blocked host calls. Store resource limits do not bound all host allocations. Recent Wasmtime fixes show why runtime versions and every host interface need active maintenance: v49.0.2 fixed a Preview 0 polling fuel bypass, an unbounded default stream allocation, and a component async callback validation issue. Pin a patched release and require a documented update cadence. [WCONFIG] [WLIMIT] [WREL] [WFUEL] [WMEM]

For Windows, use AppContainer (or a tested narrower LPAC configuration) with only explicitly needed capabilities, and associate the worker tree with a Job Object configured for termination on supervisor close and resource limits. Do not permit breakaway or untracked children; verify the actual process tree and launch order. AppContainer has base-resource exceptions, so test the exact deployment mode rather than assuming default deny means no access. [WIN-LAUNCH] [WIN-APP] [WIN-JOB] [WIN-JOB-BASIC] [WIN-JOB-EXTENDED]

For Linux, construct a minimal bubblewrap namespace: mount only runtime files and the extension package read-only; provide a private bounded temporary area; unshare network, IPC, and PID namespaces; expose no home directory, D-Bus socket, broad /dev, host credentials, or writable host path; sanitize environment and inherited file descriptors; use seccomp to deny unneeded syscalls and prevent terminal injection. Apply --new-session if TIOCSTI is not filtered. Use cgroup v2 or a host-managed equivalent for CPU, memory, and process limits when available. Bubblewrap is policy plumbing, not the policy. Its own docs warn that every mount and option matters and that exposing a D-Bus socket can provide a route to host actions. If user namespaces, seccomp policy, or resource control cannot be established, do not start the worker. Linux kernel and namespace configuration varies; validate the supported distribution matrix. [BWRAP-README] [BWRAP-REL] [CGROUP] [FLATPAK-USERNS]

Measure cold start, steady-state run time, selection serialization, large-document IPC, memory overhead, and cancellation on target hardware before deciding between a short-lived worker per transform and a persistent worker. Start with one short-lived worker per run because it limits retained state and makes revocation/termination straightforward. A persistent worker is optional only after reset/isolation behavior is demonstrated and the performance gain is material.

### 7. Host-owned package extraction and proposed validation

**Disposition: keep and add update integrity and recovery behavior.** The host may parse and unpack a declarative package format; it must never execute an extension-supplied installer, pre/post-install script, shell command, or plugin code during installation/update. Bound archive size, file count, path depth, and total expanded bytes; reject absolute/traversal paths, unsafe links, duplicate manifest names, and incompatible runtime/API versions. Validate the manifest and package before enabling it. Prefer signed package metadata and a content digest anchored to an explicit publisher key/trust policy. A signature identifies publisher/integrity under that key; it does not prove that code is benign.

Stage each update as an immutable versioned directory. Verify and validate it before an atomic switch. Keep the last known-good version and roll back on startup/health-check failure. A missing, invalid, or declined update leaves the previous version available. Capability changes require re-consent. Do not grant the updated package access to selected files from an earlier run.

The plan’s validation cases are **proposed**, not checks already run. Extend them as listed in “Validation plan” below. Upstream tests and advisories were inspected as design evidence; none of those suites were run in this task.

### 8. Provisional draft, primary evidence, and no deployment/audit claim

**Disposition: satisfy.** The proposal distinguishes enforceable platform behavior from product decisions and from future validation. This stage read the brief, primary platform/runtime/standard documentation, Wasmtime source, Wasmtime advisories/releases, bubblewrap source and tests, and the Flatpak caller example. It did not inspect an application host repository because the brief selects no host product or language. No untrusted extension was installed or executed; no app sandbox was launched; no production audit was performed. The evidence index and source map give exact URLs, observed locators, version/commit where surfaced, access UTC windows, conditions, and applicability. [sources/index.md](sources/index.md) [source-map.json](source-map.json)

## Coverage status: already covered, rejected, and uncertain

- **Already covered by the released plan:** a separate worker, serialized selection input, proposal-before-apply, host validation and preview, revision-conflict handling, built-in fallback, timeout and size controls, worker lifetime measurement, host-owned package extraction, and proposed validation. The dispositions above retain these elements and add implementation boundaries.
- **Rejected for the stated untrusted-extension use case:** an in-process native plugin or unrestricted script; treating a worker process, manifest declaration, successful parse, picker filter, package signature, or runtime sandbox alone as complete security; passing a bare path as a file permission; and any unsandboxed fallback when OS policy setup fails.
- **Uncertain pending evidence or owner choice:** which host/guest languages and OS versions to support; whether WASI Component tooling covers author languages the product needs; exact resource quotas and acceptable startup cost; whether any network use case exists; permission persistence; publisher trust/update policy; and whether per-object conflict rebasing is safe. These remain prototype gates or owner decisions, not assumptions.
- **Optional follow-up improvements, not v1 requirements:** narrowly scoped network access if a concrete need is approved; per-object rebasing after dependency-aware conflict tests; persistent workers only after reset isolation and measured benefit; shared-memory IPC only after profiling; and a browser/remote model only if its extra runtime and service burden is justified.

## Alternatives and development burden

| Alternative | Isolation and failure behavior | Permissions/data exchange | Team/platform cost | Disposition |
|---|---|---|---|---|
| In-process native plugin or unrestricted scripting | Shares host address space and can block/corrupt/crash host state; ordinary module loading is not a security boundary. | Usually broad host API/OS authority unless separately constrained. | Lowest initial startup/IPC work; high risk and host-language/ABI coupling. | Reject for third-party untrusted code. |
| Wasmtime Component Model inside dedicated worker | Wasm bounds guest memory accesses and has no ambient OS I/O; imports are the capability surface. A Wasmtime/runtime or embedding bug can still escape the Wasm boundary, and resource/host-call limits require configuration. The OS-restricted worker adds crash and runtime-escape containment. | WIT can define typed imports/exports; expose only snapshot, optional one-run file content, and patch result. | Cross-language potential; SDK and component toolchains are uneven. Rust/C and other compiler targets must be proven; WASI 0.2 remains broadly targeted while 0.3 support is uneven. | Strong candidate if the needed author languages and packaging work; test a patched runtime and layered OS policy first. [WSEC] [WCONFIG] [WASI-REL] [WIT] |
| Native helper in AppContainer / bubblewrap worker | OS policy can restrict files/network/resources and process trees. The kernel, launcher, profile, inherited handles, mounted paths, syscalls, and distribution configuration become trusted. Process separation without these controls is only a crash boundary. | Private inherited pipes/handles; host file broker passes only selected content. | Broad language choice but two platform launchers, different kernel/version requirements, distribution probing, packaging and support burden. | Viable alternative when WASI toolchains exclude a target language; fail closed on unsupported systems. [WIN-APP] [WIN-LAUNCH] [WIN-JOB] [BWRAP-README] [CGROUP] |
| Browser-style or remote extension model | Could provide stronger managed isolation, but would add a browser/remote-service runtime, host bridge, and possibly network dependency not present in the brief. | Existing browser permission concepts are an analogy, not a direct desktop API. | Additional distribution/update and offline-support burden. | Not selected for this proposal; revisit only if a concrete product need outweighs the new runtime/service. |

The released plan calls for a serialized snapshot and patch. For a native worker, use a private inherited stdin/stdout pipe or named pipe with explicit framing and no listening TCP port. JSON-RPC 2.0 is transport-agnostic and gives request IDs and error responses; it does not define byte-stream framing. Define a length-prefixed, bounded message frame, one transformation request at a time, and require a response. Avoid JSON-RPC notifications because they cannot report errors, and avoid batches until ordering, concurrency, and idempotency are specified; JSON-RPC permits concurrent batch handling and out-of-order responses. [JSONRPC]

For Wasm, WIT provides typed interfaces, but it describes the contract rather than behavior. Specify the same domain-level object/patch rules and version policy independently of transport. Do not build both IPC and WIT adapters in the first prototype unless the comparative test needs them; if both are pursued, run one shared set of schema fixtures and conformance tests through each adapter. Defer shared-memory/zero-copy exchange until measurements show serialized transfer is a bottleneck; it raises memory ownership, aliasing, ABI, and lifetime complexity.

## Permissions and user-facing behavior

- **What the user sees before enabling:** publisher name/key status, package version, supported editor/API version, the fact that the extension can read the objects they select when invoked, and any extra requested capability in concrete language. “Needs access to your selected diagram objects to calculate this layout” is more useful than a sandbox term.
- **When a file is needed:** show a host-owned picker and name the selected file in the prompt. Explain: “This extension will receive read-only contents of this file for this operation. It cannot browse its folder.” Buttons: “Allow once” and “Cancel”. Never persist this grant by default. The extension cannot choose an arbitrary path.
- **Network:** no network calls or endpoints in v1. A manifest request for network is rejected/incompatible until an owner approves a scoped design and matching enforcement.
- **Failure:** display the extension name, a plain-language reason, and “Your diagram was not changed,” with “Try again”, “Disable extension”, and “Details”. Example timeout copy: “Layout Helper stopped responding. No changes were applied. Try again or disable this extension.” Keep stack traces and sandbox/platform diagnostics in a user-accessible details/log view, not as the only message.
- **Permission/update change:** an update that adds permissions remains staged until the user approves; declining keeps the old version enabled. Provide a one-click disable/revoke option and a visible list of stored grants. Do not silently carry file grants to another version.
- **Built-in commands:** report extension availability separately from the diagram editor’s own command status. Extension startup failure must not block built-in command registration or document open/save.

## Proposed protocol and transaction

A transformation request contains a protocol version, request ID, extension ID/version, base document revision, selected-object records, and explicit bounded context. A file input, if selected by the user, is represented as a single read-only byte payload or brokered handle with a maximum size and one-run lifetime. Do not include filesystem paths, home-directory state, network settings, credentials, or a writable document object.

A response contains the matching request ID and either a structured extension error or a patch proposal. Each operation has an allowed operation name, target ID (for edits), expected base value/revision (for compare-and-swap), and typed values. Add operations use host-reserved IDs or temporary IDs that the host remaps; the host checks every reference and collision before preview. Reject NaN/infinity, unknown units/coordinates, unbounded strings/binary data, over-deep structures, duplicates, missing IDs, and unsupported schema/API versions. Treat extension log/error strings as untrusted display text and cap/escape them.

The host checks current revision again immediately before commit. On any mismatch or invalid operation, discard the whole patch. The initial whole-document revision rule may reject a nonconflicting edit, but it has simple safe semantics. A later per-object merge can accept unrelated edits only if the targeted objects and all transform dependencies still match, with the user seeing the resulting preview. The host applies all approved operations to an isolated candidate, validates diagram invariants, and atomically commits one undo step. The preview itself never mutates the active document.

## Host-owned install and update workflow

1. Accept a declarative archive only through a host-controlled source/import flow. Verify digest/signature against the configured publisher trust policy; show unknown/untrusted publishers explicitly.
2. Parse manifest under strict size limits. Verify declared entry point, API compatibility, permissions, version, and package structure; reject scripts/hooks/installers and unsafe archive entries.
3. Stage to a versioned immutable location. Do not load or execute the extension during extraction or validation.
4. Show capabilities and publisher identity before first activation. Read-only selection access is tied to an explicit invocation; optional file access is per operation.
5. For updates, verify and stage before switch. If invalid, incompatible, or requesting new authority that is declined, keep the old version. Switch atomically and preserve one last-known-good version for rollback.
6. Offer disable/uninstall and grant revocation through the host. Trust-store ownership, signing-key recovery/rotation, revocation feeds, and offline package policy remain product-owner decisions.

## Phased integration and validation plan

Everything below is **proposed validation**. None of these product checks have been executed.

### Phase 0 — Decide the contract and support envelope

- Specify the minimal invocation, snapshot, patch operations, revision semantics, manifest fields, error envelope, and version-compatibility rules.
- Choose the minimum Windows versions and exact AppContainer/LPAC policy; choose Linux distributions/kernel/user-namespace/cgroup support or an explicit feature-probe policy.
- Pick an initial resource budget policy from benchmarks and UX expectations. Set bounds for transform wall time, CPU, worker memory/process count, snapshot bytes, selected-file bytes, patch bytes, object count, and concurrent workers.
- Select publisher/signature roots and policy for manual/offline packages, update checks, key rotation/revocation, rollback, and remembered permission grants.
- Survey at least two viable plugin languages, build the same example under WASI 0.2 and the candidate native-helper packages, and record toolchain/support costs. Do not promise all languages from a single WebAssembly specification.
- Decide whether selection reading is granted implicitly only during explicit invocation or also needs an enable-time acknowledgement; no background selection observer is proposed.

### Phase 1 — Pure contract and host transaction prototype

- Use a trusted test fixture/mock worker only. Exercise snapshot versioning and patch validation without installing third-party code.
- Test valid adds/edits; invalid and unknown operations; duplicate, stale, missing, or colliding IDs; non-finite values; malformed JSON/WIT values; unknown versions; oversized/deep payloads; dangling references; invalid geometry; and host invariant failures.
- Test a long-running run while the user edits the same and unrelated objects. Confirm the live document is unchanged until explicit approval, any stale revision follows the chosen conflict rule, and a successful patch is one undoable transaction.
- Confirm every failure returns an understandable status and no partial object update.

### Phase 2 — Comparative execution prototypes on supported systems

- Build one Wasmtime worker prototype and one native helper prototype for every target OS/language combination under consideration. Run them from the actual packaged host process, not only from a developer terminal.
- **Windows proposal:** create worker suspended if needed to attach policy before execution; launch in AppContainer/LPAC with minimal capabilities; attach Job Object resource limits and kill-on-close; deny/track child process creation and breakaway; test inherited-handle list and private IPC.
- **Linux proposal:** run bubblewrap with an explicit minimal filesystem, sanitized environment, private temp, unshared network/IPC/PID, no host home/D-Bus, seccomp, and new-session or TIOCSTI denial. Probe user namespaces and namespace setup; apply delegated cgroup v2 limits when available. Ensure the package/runtime path is read-only and optional file access uses only a one-run brokered byte stream/fd.
- Test negative access attempts against unrelated files/directories, sibling files, symlinks, host IPC/D-Bus, host network and loopback, sockets, devices, environment secrets, parent PID/processes, and child process escape. Test positive only for selection input, explicitly selected file, and returned patch.
- Test infinite CPU loop, memory growth, many allocations/handles, blocked host calls, giant/malicious IPC, stdout/stderr flooding, worker crash, child process, cancellation and host restart. Verify UI remains responsive and entire worker tree stops.
- Test systems where OS policy setup is denied/unavailable. Verify extension execution is refused with a clear message and built-in commands continue to work; no unsandboxed fallback.
- Measure cold start, repeated start, serialization/deserialization cost, large selections, throughput, and memory. Decide per-run versus persistent worker only from measured results and prove persistent state reset if chosen.

### Phase 3 — Permission, file, and update workflows

- Test user denial/cancel, repeated requests, app restart, revocation, package update requesting fewer/same/more permissions, unknown publisher/key, bad signature/hash, corrupt archive, traversal links, decompression bomb, incompatible API, rollback, and old-version retention after decline.
- Test file selection on Windows and supported Linux desktops. Verify picker filters are not trusted for enforcement; enforce size/type/content limits after the host opens the file. Ensure the extension sees no unintended path or sibling, cannot reopen the file after the run, and receives no file data after cancel.
- Test permission text with people who have not read the architecture: can they tell which diagram/file data leaves the host and for how long, and can they predict what denial does?
- Test that install/update never runs extension-supplied code and that package removal cleans grants and worker state.

### Phase 4 — Limited opt-in and release gate

- Pilot only on OS configurations whose controls passed the negative-access and resource-limit matrix. Keep the extension catalog/user choice separate from built-in functionality. Monitor crashes, timeouts, invalid outputs, sandbox-setup failures, and update rollbacks without collecting diagram contents.
- Re-run compatibility/security regressions against every runtime and OS-policy update. Pin the tested Wasmtime and bubblewrap versions; include advisory review and upgrade criteria. Consider independent security review before broad distribution; this is a recommendation, not an audit performed in this task.
- Do not describe the architecture as audited or secure by process separation alone. Document the residual risk from OS kernel/runtime vulnerabilities, host API bugs, parser bugs, misconfigured policies, update trust roots, and user-approved data disclosure.

## Proposed, executed, and unresolved

| Category | Record |
|---|---|
| Proposed | All UI, protocol, transaction, install/update, cross-OS, negative-access, loop/crash, and compatibility checks in Phase 1–4. |
| Executed in this stage | Read the exact brief and then the released plan copy; retrieved and read the primary docs/source/advisory/release records linked by stable source IDs; read upstream test code without running it; ran the declared single-use plan reveal helper; activated one native Goal and passed its exact receipt through the binding guard. |
| Not executed | No untrusted extension or archive installed/executed; no product implementation or local host repo test; no Windows AppContainer, Linux bubblewrap, cgroup, Wasmtime, or IPC sandbox test; no performance benchmark; no production audit. |
| Owner decisions | Host/guest languages; supported Windows and Linux matrix; initial CPU/memory/time/payload quotas; permission persistence and text; publisher identity/trust/revocation; update channel/offline policy; whether to retain a native backend; conflict policy beyond conservative whole-document revision check; error/support lifecycle. |

## Sources

Use [sources/index.md](sources/index.md) to navigate primary documentation, tagged source code/tests, advisories, the release matrix, and standards. [source-map.json](source-map.json) preserves the exact source URL, release/commit where visible, locator, UTC access window, observed operation, condition/default/exception, and applicability for each stable ID.
