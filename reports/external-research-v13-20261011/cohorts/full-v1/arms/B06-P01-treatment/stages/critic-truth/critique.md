# Critic truth review — B06-P01-treatment

Stage: critic-truth. Review target: the complete investigator package listed in `input-map.json`, including the brief, discovery, draft, released plan and reveal metadata, source index, and source map. I independently checked the consequential OS/runtime claims below against the cited primary documentation. No implementation, sandbox, extension, or product validation was run.

## Overall assessment

The investigator’s central correction is sound: a worker process is useful for responsiveness and termination but is not itself an authority boundary; the host must constrain APIs and enforce OS policy. The plan’s snapshot → proposed patch → whole-response validation → preview → atomic transaction flow also preserves the brief’s no-silent-overwrite requirement. File selection, update consent, failure copy, and proposed-versus-executed validation are handled conservatively. The Wasmtime v49.0.2 release notes corroborate the three runtime-fix examples named in the draft, and bubblewrap’s own README explicitly assigns the boundary to the argument-construction layer.

I found no source-backed reason to reverse the recommendation or to reject either comparison candidate. Before the reviser treats the draft as complete, make the following conditions explicit so that user-facing and process-tree guarantees do not exceed the documented mechanisms.

## Findings

### CT-01 — Say that neither fuel nor epochs interrupts a blocked host call

**Priority: high precision correction.** In “Timeouts, patch-size limits, worker termination, and worker-lifetime measurement,” the draft says to use a cancellable async host-call path, then says “Fuel starts disabled and epochs do not interrupt blocked host calls.” Wasmtime’s v49.0.2 configuration comments say both epochs **and fuel** do not handle guest code blocked in a host call; waking or timing out an indefinitely blocking host call is left to the embedder (WCONFIG, lines 3488–3503).

Suggested wording: “Neither fuel nor epoch interruption stops a guest blocked in a host call; every host import needs its own bounded, cancellable operation, and cancellation must reach the worker supervisor.” Keep the planned blocked-host-call validation. This matters to the brief’s responsiveness guarantee even when the Wasm instruction budget is configured correctly.

### CT-02 — Scope Windows “no filesystem access” to the enforced boundary

The draft’s capability model says “no direct extension filesystem” and later describes AppContainer with only explicit capabilities. The platform page distinguishes file behavior: read-write access can be granted to specific files, read-only access is “less restricted,” and an AppContainer always has access to memory-resident files created for that container (WIN-APP, lines 39–41). The draft does acknowledge base-resource exceptions, which is directionally correct; make clear that “no direct filesystem access” means no extension API/path grant and is a target to verify for the actual launch/package mode, not a fact inferred from an empty capability list.

Keep the proposed negative-access matrix, and explicitly include enumeration/read attempts against unrelated user files, container-local files, inherited handles, and any host/worker temporary paths on every supported Windows configuration. If those tests fail, do not enable that configuration. The existing fail-closed rule is appropriate.

### CT-03 — Qualify the Windows process-tree guarantee with Job Object conditions

The draft says to terminate the entire worker tree, configure kill-on-close, and verify process-tree/launch order. The Job Objects page confirms ordinary `CreateProcess` children join their parent’s job by default, but documents an exception: children created through `Win32_Process.Create` are not associated by default. It also says kill-on-close terminates processes when the **last** job handle closes, and breakaway flags change tracking behavior (WIN-JOB, lines 42–55, 86–95).

Retain the proposed Job Object approach, but add those conditions to the Windows validation: deny or account for alternate process creation paths; control which process can inherit/duplicate a job handle; verify the supervisor’s last-handle/explicit-termination behavior; and confirm the supported Windows/job nesting setup. The draft already says no breakaway and tests child processes; these details close the remaining gap in “entire worker tree.” Job Objects are lifecycle/resource controls, while AppContainer remains the authority boundary.

### CT-04 — Treat “bounded temporary area” as a separately enforced limit

The Linux paragraph asks for a “private bounded temporary area.” Bubblewrap’s README describes a fresh mount namespace and says the boundary depends entirely on the arguments supplied; it documents namespaces, mounts, and seccomp but does not establish a storage quota from the namespace itself (BWRAP-README, lines 208–211, 233–261). Keep this as a requirement, but name how it will be enforced and tested on the chosen Linux stack. In particular, verify both memory-backed temporary storage exhaustion and writable disk paths; a cgroup memory/process limit or a private mount alone should not be described as a disk quota. The draft’s fail-closed and distribution-probing principles remain sound.

### CT-05 — Keep selected-file assurance copy conditional on the tested OS policy

The draft correctly rejects passing a bare path and notes that XDG chooser filters are usability aids, not access control (XDG-FILE, lines 143–153). The Documents portal also has an explicit persistent/nonpersistent flag and exposes an allowed document through a sandbox filesystem (XDG-DOCS, lines 94–102, 125–150). The draft’s one-run bytes/brokered-read approach and Phase 2/3 sibling, symlink, cancel, and post-run tests address these facts.

The example promise “It cannot browse its folder” should ship only for configurations that pass those tests and that do not leak a selected path, portal grant, or inherited file descriptor. Until then, phrase this as intended v1 behavior, not an observed guarantee. A host-mediated byte payload is the simpler cross-platform interpretation of the desired one-operation disclosure.

## Correctly preserved / no correction requested

- The separate process is described as crash/termination containment, not complete isolation; the draft pairs it with capabilities and platform controls.
- Wasmtime fuel is explicitly enabled, guest/store quotas are complemented with host allocation limits, and the two cited v49.0.2 fixes plus callback validation issue match the release notes (WCONFIG, WLIMIT, WREL).
- Bubblewrap is treated as policy plumbing, with mount/D-Bus and TIOCSTI caveats and explicit namespace/seccomp setup, consistent with its README.
- JSON-RPC is not mistaken for stream framing; request/response is preferred and batches/notifications are deferred.
- Whole-document revision checking is conservative but accurately labeled as such; the final commit rechecks the revision and applies all-or-nothing. Per-object rebasing is left behind explicit dependency tests.
- User decisions (platform/language matrix, quotas, persistence, trust roots, and update policy) remain open rather than being fabricated as source facts.
- The proposal distinguishes upstream materials read from tests actually run. No product source, sandbox, extension, or performance test was examined or claimed by this critic.

The reviser should carry CT-01 through CT-05 into the next complete review; none changes the comparison outcome on current evidence.
