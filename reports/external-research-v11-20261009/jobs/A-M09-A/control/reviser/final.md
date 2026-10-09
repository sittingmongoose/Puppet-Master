# Final — plugin-workbench (S09), A-M09-A control/reviser

Method M09 v1 analogical-outline-interviews, reviser stage. Competent
conventional brief-led investigator's corrected plan-comparison final.
Self-contained: every claim it depends on is restated here; predecessor
IDs supplement but never replace material text.

Inputs inspected in full: brief (`cases/S09/brief.md`, sha256
846bc817…8ec28cea); `control/research/draft.md` (18934 bytes, sha256
703602e0…113d8adb); `control/research/discovery.md` (20262 bytes, sha256
2d3976a7…705654 — matches the hash the draft says the reveal gate
recorded at 2026-10-09T19:08:24Z, so the freeze claim is self-consistent);
`control/research/revealed-plan.md` (344 bytes, sha256 66bed5d9…cc43a317);
`control/research/source-map.json` (sha256 44b5f9e3…8f7f11883,
[S01]–[S14]) plus all 14 files in `control/research/sources/` and its
index; `control/critic/critique.md` (whole) plus `control/critic/
source-map.json` ([C01]–[C11]) and its 11 source files. Fresh independent
evidence for this revision: [R01]–[R04] in `source-map.json` + `sources/`,
fetched 2026-10-09T19:28–19:29Z. No campaign/history/evaluator/counterpart
material read. No code executed; no qualified sandbox exists, so no witness
runs attempted or claimed. All fetches were read-only GETs/HEADs of public
docs/registry metadata.

Brief in one line: desktop workbench for librarians to import, clean and
compare small metadata collections; third-party transformation extensions
useful without unrestricted host access; reproducible preview, undo,
offline export, future extension upgrades required. Obligations O1–O6.

## Exact thin plan under comparison (quoted verbatim from revealed-plan.md)

> P1: Run extension scripts as child processes. P2: Pass the dataset path and
> output directory as arguments. P3: A timeout limits each extension. P4: Store
> output as the new dataset after success. P5: Load the newest extension
> version automatically. P6: Test with a sample formatter.

Overall assessment: the thin plan's instincts (process separation, telling
the extension where data lives, time-bounding, success-gating, testing)
are reasonable, but P1–P4 need security or integrity corrections before
they are safe to build, P5 as stated contradicts the brief's own
reproducibility promise and must be replaced with gated upgrade, and P6's
intent is right but its scope must grow into a conformance suite. None of
P1–P6 is accepted as literally written. The critic agreed with all six
dispositions in substance; this final accepts all seven material findings
(M1–M7) and all five minor findings (m1–m5), with the amendments and
residual uncertainties recorded in the adjudication inventory. Corrected
design conclusions are below; nothing here repairs the brief, only the plan.

## Per-P dispositions (O4)

### P1 — "Run extension scripts as child processes." → CORRECTION + CONDITION

Verdict: keep process separation as one candidate outer layer, but a child
process as stated is NOT a sandbox: by default it inherits the user's full
authority (same files, network, environment, subprocess rights). Every
sound boundary surveyed is deny-by-default; the one famous
allow-by-default model (VS Code extensions run with full user privileges,
no sandbox) has repeated trust-bypass reports. Reject the literal reading
(inherited stdio/env/cwd, no grants model): it grants every extension
unrestricted host access, the exact outcome the brief forbids.

Retained: process isolation is still valuable (crash containment, OS-level
kill, no shared JS intrinsics to wrap — the failure mode behind the vm2
collapse chain; see O3).

Corrections required:

1. Least-privilege spawn: closed file descriptors, empty environment except
   declared variables, working directory restricted to a per-run scratch
   dir, no subprocess/FFI for third-party code. Deno's own security
   documentation warns that run-subprocess and native-code permissions
   bypass the sandbox entirely (a child can re-launch itself unrestricted;
   native code issues syscalls past JS-layer enforcement). "Extension
   spawns programs / loads native code" is therefore a privileged grant,
   never a default. (Critic M4 accepted: spawn options alone are necessary
   but not sufficient — see OS mechanisms below.)
2. OS-enforced network/file denial per desktop OS (M4 repair; the draft
   priced "locked-down child" without naming any mechanism, which risked a
   builder shipping `env -i` + closed FDs and believing the network was
   denied):
   - Linux: run the child in a network namespace without external routes
     (or with an egress proxy that default-denies), plus a Landlock/
     seccomp file-access policy confining it to the scratch dir, enforced
     by the supervisor before exec. Needs unprivileged-user-namespace
     support in packaging; where unavailable, fall back to a
     default-deny egress firewall rule for the child UID.
   - macOS: apply a `sandbox-exec`-style profile (deny default, allow
     read/write only under the scratch dir, deny network outbound unless
     the manifest declares it and the user approves). Profile ships with
     the app; Seatbelt is the enforcement point, not spawn flags.
   - Windows: run the child in an AppContainer (or job object + restricted
     token where containers are unavailable) with capabilities limited to
     the scratch dir, plus a Windows Firewall block rule for the child.
   If any target OS cannot carry its mechanism in the shipped packaging,
   the locked-down child is a non-goal on that OS and extensions there
   run only under the WASM/WASI or V8-isolate boundary.
3. Small explicit host surface, default-deny (Tauri pattern, correctly
   scoped): the host exposes a few commands (read cells, propose edit,
   request export) and each extension gets named grants per command.
   Correction of the draft's wording (critic P1 accepted): Tauri
   permissions govern frontend-webview → Rust commands, not child-process
   syscalls. The analogy transfers as "small explicit surface,
   default-deny". The enforcement point for a child is the supervisor +
   OS policy above, not a Tauri capability file.

Alternatives (retained, no longer "equivalent" — the draft's equivalence
sentence is struck per the critic; these are three distinct risk
profiles):

- (a) WASM/WASI guest in the host process: deny-by-default (no
  directories, env, args, or sockets until the host preopens them);
  linear-memory confinement; Wasmtime embed surface offers deterministic
  fuel budgets, epoch preemption, stack/memory reservation and guard
  sizing (re-cited against stable v49.0.2, published 2026-10-02 [R04];
  method names `consume_fuel`/`epoch_interruption`/guard-size were
  observed on v51.0.0-dev docs and must be confirmed on stable before
  build — residual uncertainty, m3). Host-call costs must be charged
  explicitly or transforms hide work in host calls (critic P3 note
  accepted). Authoring lift is the cost.
- (b) V8 isolates (`isolated-vm`): per-extension memory limit (default
  128 MB, minimum 8 MB, documented as a soft guideline a determined
  attacker can exceed ~2–3x), CPU/wall time in nanoseconds, structured
  transfer across the boundary. Shares the host process (host-process
  fate on OOM/native crash, side-channel surface). Adoption risks:
  Node-major lockstep (Node 22 → ivm 5.x/4.x, Node 24 → 6.x/5.x,
  Node 26 → 7.x; odd Node versions unsupported; Node ≥ 20 requires
  `--no-node-snapshot`) and explicit maintenance-mode status. Easiest
  for JS extensions, softest cap.
- (c) Locked-down child (this P-clause's corrected form): OS fault
  isolation, ambient inheritance by default so every grant above is
  load-bearing, highest per-spawn overhead.

Condition: the builder picks ONE boundary first (build order §1–2) and
carries the other two as documented alternatives with the discriminating
validations V1/V2. Threat model prices the malicious case (user decision
D1 may narrow to buggy-but-benign with an explicit risk acceptance).

### P2 — "Pass the dataset path and output directory as arguments." → CORRECTION (security)

Verdict: the intent (tell the extension where its input and output live)
is already-covered; the mechanism (raw host paths) must be corrected. A
raw path hands ambient filesystem authority: read anything the user can,
follow symlinks out of the directory, exfiltrate the collection. Deno's
model shows the fix shape: reads/writes denied by default, granted only
to scoped paths, explicit deny overriding allow, refused operations
throwing a catchable `NotCapable`-style error.

Corrections required:

1. Pass capabilities, not paths: the extension sees at most a preopened
   scratch root (WASI-style: host scratch dir mounted as the guest's only
   visible directory) or receives the dataset over a pipe in batches and
   returns rows over a pipe. Pure transforms get zero filesystem grants:
   "extension works with zero grants" is the conformance baseline.
2. Handle-based confinement, not path-string checks (M4 repair): "resolve
   symlinks and confine `..` at the host" is TOCTOU-naive if the extension
   keeps direct filesystem access, because path-string checks race
   renames. Confinement is by handle: supervisor opens the scratch-dir
   file descriptor and the child resolves everything with `openat` under
   it (or the guest lives under a preopened WASI root it cannot escape).
   Deliver input read-only where possible; accept output only inside the
   granted directory.
3. Batch transport design (M4 repair; the draft named "stdin/stdout" with
   no framing): length-prefixed JSON batches over the pipe, UTF-8,
   canonical serialization per M5; limits: max 8 MB per message, max
   100k rows per batch, max 512 MB total per run (tunable; exceeding the
   cap fires the output-size budget with a named error); deadlock rule:
   host reads and writes on separate threads with a bounded queue, never
   blocking a write on a pending read; malformed frame fails the run
   closed with a typed error. If the builder does not implement this
   transport, the pipe alternative is dropped and only the preopened-dir
   form ships.

Condition (narrowed per the critic; the draft's first-party carve-out is
amended): there is NO ambient-path mechanism for anyone. Same boundary
for all extensions; first-party manifests may declare broader (audited)
grants, never a different mechanism. This keeps the hostile suite
exemption-free and defends trusted code against traversal bugs and
later-added untrusted dependencies. Raw host paths as arguments are
rejected for third-party code unconditionally.

### P3 — "A timeout limits each extension." → ALREADY-COVERED intent + CORRECTION in mechanism

Verdict: time-bounding is the right instinct, but a lone wall-clock
timeout is insufficient and its enforcement was underspecified. It does
not bound memory growth, CPU burn within the window, disk fill,
fork/subprocess abuse, or partial-write corruption; and a "timeout" that
merely stops waiting while the child keeps running is not a limit.

Replacement (three-dimensional budgets, all preempting, all named):

1. Time with true preemption: kill the child / epoch-interrupt the guest.
   Wasmtime's epoch mechanism exists for runaway guests; deterministic
   fuel budgets are the stricter option for reproducible previews, valid
   only with host-call accounting (fuel covers guest instructions; the
   embedder charges host-function costs explicitly).
2. Memory cap (per-boundary strength honored: V8 soft guideline vs WASM
   fuel/epoch hard caps vs child cgroup/rss supervision).
3. Output-size cap (bytes + row counts; see P2 limits).
4. Report which budget fired — silent kills are undebuggable for
   librarians. For the child candidate this needs supervisor-side
   accounting (cgroup/rss sampling, wall timer, output byte counting,
   signal/exit interpretation): exit codes and signals alone do not
   distinguish OOM from timeout from crash (critic P3 note accepted;
   builders must not discover this at integration time).
5. Preview must always terminate: the preemption path is exercised by the
   conformance suite (infinite loop, exponential growth), not assumed.

### P4 — "Store output as the new dataset after success." → CORRECTION (data integrity)

Verdict: bare overwrite-on-success destroys provenance, breaks undo, and
trusts the exit code as proof of correctness. Process success is not
transformation success.

Replacement (operation-log design; OpenRefine is the closest real analog
— an offline-first local data-cleaning workbench used in
library-adjacent work — but the "proven by" framing is amended per M2;
see below):

1. Validate before commit: output must parse against the expected
   schema/shape (row-count sanity, column contract, encoding) before it
   becomes anything. Commit rule: exit 0 AND output validates AND write
   committed atomically.
2. Never overwrite in place: each run appends a new dataset version; the
   operation log records extension ID + pinned version + input hash +
   output hash + timestamp.
3. Undo is a step pointer over the append-only log with OpenRefine's
   re-verified mechanics: ordered steps, moving back then operating erases
   the greyed redo tail, position shown as m/n, new recipes encoded as
   JSON and replayable (Extract…/Apply JSON), autosave every few minutes
   and on clean exit.
4. Reproducible preview = dry-run of the log prefix producing a
   human-readable diff (rows added/removed/changed, before/after cells)
   WITHOUT committing; the committed run must produce byte-identical
   output to the approved preview given identical inputs, under the
   determinism obligation in M5.

M2 amendments (accepted):

- Step-0 precedent: OpenRefine pins step 0 (project creation) as
  un-undoable. Whether *import* should be un-undoable in the workbench is
  a product decision, not a precedent entailment: a mis-imported file is
  a plausible librarian error. Decision: import IS undoable (undoing it
  returns the collection to the pre-import state); only workbench-level
  project creation is pinned. Recorded as product decision D7.
- Two-artifact split: OpenRefine's "history travels with exported project
  archives" describes its internal project tar archives, while this
  design's interchange export is a BagIt package. These are TWO artifacts:
  (a) internal project archive (full operation log + dataset versions +
  pins, autosaved, travels with the project); (b) BagIt interchange
  export (payload + checksums + provenance subset: workbench version,
  extension ID/version/hash pins, operation-log hash — not the full
  version history). Recorded as product decision D8.

M5 repairs (accepted; the draft named but did not design these):

- Atomic commit: write output to a temp file in the same directory +
  fsync the file + atomic rename over the target name + fsync the
  containing directory, on each desktop OS (Windows: `MoveFileEx` with
  replace-existing + flush semantics; POSIX: `rename` + fsync file and
  dir). Crash recovery: on startup, delete orphan temp files, detect a
  torn rename by the absence of the log's commit marker, and roll the
  step pointer back to the last committed entry; never present a
  half-committed version as current.
- Retention/GC/quota: append-only versions are retained per project up to
  a quota (default 1 GB or 200 versions, whichever first; user-raisable).
  Past quota the host compacts: it keeps every commit marker and hash
  (provenance is never GC'd) but may drop intermediate dataset blobs
  older than the last N versions after re-materialization is verified by
  replay; dropping blobs without verified replay is forbidden. Quota
  breach surfaces as a user-readable warning with a one-click compact,
  never a silent stall.
- Canonical serialization (behind "byte-identical preview"): JSON with
  sorted keys, UTF-8, LF newlines, no insignificant whitespace; CSV with
  a fixed dialect (comma, quote-minimal, LF, UTF-8 with explicit
  header row); floats formatted by a fixed rule (shortest round-trip
  decimal). Byte-compare runs on canonical bytes.
- Extension determinism obligation: extensions must not depend on
  wall-clock time, randomness without a host-supplied seed, hash-iteration
  order, or network responses for transform output; the manifest declares
  `deterministic: true` to be preview-eligible, and the host supplies
  seed/time as explicit inputs where needed. Non-declared extensions may
  run but their outputs are marked non-reproducible and excluded from
  byte-identical guarantees.

### P5 — "Load the newest extension version automatically." → REJECTED as stated; replaced with gated upgrade

Verdict: rejected. Silent auto-newest breaks the brief's own
reproducibility promise (yesterday's recipe replays differently today
with no record), admits compromised or breaking updates without consent,
and ignores host/extension compatibility. The VS Code engines citation
re-verifies in the draft's favor on the declaration mechanism: `engines`
is a required object containing at least the `vscode` key, cannot be
`*`, e.g. `^0.10.5` declaring minimum host version 0.10.5 [R02].

Replacement (retained shape, repaired details):

1. Pin per project: a lockfile records extension ID + exact version +
   content hash; replay uses the pinned set always. Content hash =
   SHA-256 over the exact shipped bytes the host executes (the WASM
   module bytes, or the extension bundle zip as distributed), with the
   hashed artifact named in the lockfile; no directory-tree hashing
   without a canonical packing rule. Distribution: pins and hashes are
   obtained over the signed channel in M7 (registry signature or
   side-loaded trust-on-first-use with a recorded fingerprint); an
   unsigned pin change refuses replay with a user-readable error.
2. Mandatory engine range in each extension manifest (VS Code model).
   Enforcement point (M3 repair, replacing "refuse activation with a
   naming error" and "enforce at every call"): the host refuses INSTALL
   and refuses ACTIVATION of anything outside its supported range, both
   with the same named, user-readable compat error — message text ("This
   extension needs Workbench 2.x, but this is 1.4; update Workbench or
   install extension 1.y"), stable error code (`ERR_ENGINE_RANGE`), a log
   line with extension ID + declared range + host version, and a recovery
   path (offer the newest compatible pinned version or a safe rollback).
   Per-call rechecks only if extensions can hot-update without
   re-activation; otherwise per-install + per-activation is sufficient and
   priced accordingly. The 2026 Workspace Trust bypass report is NOT cited
   for this compat gate: trust is a security gate over untrusted folders
   while an engine range is a compatibility declaration (threat: crash or
   misbehavior from API skew, not privilege escalation). The bypass
   pattern (self-declared manifest support + install-time-only branching)
   remains the justification for enforcing *capability* grants at every
   call (P1/P2), where it belongs. The bypass itself is downgraded to
   "reportedly showed … for trust gates" until the primary report is
   fetched (m1).
3. Version the operation-log schema separately from extension versions —
   as this design's own conclusion, NOT an OpenRefine precedent (M2
   repair): OpenRefine 3.6 shipped downloadable history JSON (#4498) and a
   Java 11 floor [R03]; neither is a schema-version field and no
   `schemaVersion`/migration member was found on the release page. The
   workbench log therefore carries its own `logSchemaVersion` plus a
   host-min-version gate from day one; old recipes replay on new hosts
   through declared migrations or refuse with a clear message — never
   silent reinterpretation.
4. Upgrades are an explicit user action with changelog + re-preview of
   affected collections before commit.

User decision (optional enhancement, retained): opt-in "auto-update
within semver-compatible range", default OFF for a librarian
reproducibility tool; even opted-in updates are recorded in project
history with before/after versions (D3).

### P6 — "Test with a sample formatter." → ALREADY-COVERED intent, INSUFFICIENT scope → must expand

Verdict: a happy-path sample is the right first test and is retained as
case #1, but one sample cannot discriminate any property the brief
requires (boundary, budgets, undo, offline, upgrades). Promoted to a
conformance suite (expected signals per boundary per M6; see O6):

- Happy path: sample formatter transforms a small collection;
  byte-expected output; exercises preview → approve → commit → undo →
  redo, plus compare-flow (two-input diff/join, M7) once designed.
- Hostile samples (must fail closed): read outside grant, socket
  connect, symlink/`..` escape, fork/subprocess spawn, infinite loop,
  memory hog, oversized output.
- Contract samples: invalid output schema, nonzero exit, budget
  exceeded, malformed manifest, engine-range mismatch (must refuse with
  the named compat error, not crash or half-load).
- Lifecycle samples: replay a v1 recipe after a v2 extension release
  (must use pinned v1); export with network disabled and re-verify on a
  second machine; dependency probing permissions at import vs run time
  (JS runtimes only — documents the static-graph exemption; M6 scoping
  accepted).

## Retained discovery (O1–O3, condensed for builders, corrected)

F1 (boundaries): use a deny-by-default runtime boundary — WASI preopens,
Deno-style scoped flags, or V8 isolates — never same-process JS wrapping.
Node's `vm` module is explicitly "not a security mechanism — do not use
it to run untrusted code". The vm2 chain (O3, corrected) shows the
wrapper treadmill; both successor options carry the risks priced in P1.

F2 (operations): extensions contribute declarative, serializable
operations to an append-only log — this single mechanism delivers undo,
reproducible preview, and recipe sharing (OpenRefine mechanics:
Extract/Apply JSON, greyed-tail pointer, autosave).

F3 (trust): enforce capability grants at call time; never trust
extension self-declarations at install only. The trust-bypass lesson is
retained for capability gates, not compat gates (M3).

F4 (upgrades): two independent gates — manifest engine range + the
workbench's own operation-log schema version — with per-project pinning
(ID + exact version + content hash over defined bytes).

F5 (export): offline export as a self-verifying BagIt package (RFC 8493,
by CDL/Stanford/LoC staff): `bagit.txt` + `data/` + per-file checksum
manifests (SHA-512; omit `fetch.txt` for offline), plus provenance tags
recording workbench version, extension pins, and operation-log hash.
Valid means checksums verify, not just files present. This is the
interchange artifact (D8); the internal project archive is separate.

F6 (ecosystem shape, demoted to illustrative aside per m4): a corpus of
many tiny single-format transforms with symmetric import/export entry
points and per-translator tests is an attractive social shape, but the
translator entry-point names were asserted from search snippets without
a fetched primary page. Retained only as an aside pending a primary
fetch; inside the trust domain technically, bounded by F1 regardless.

F7 (original constraints preserved): librarian users (readable diffs,
m/n undo position, named errors — never silent kills or hash dumps);
small collections (streaming batches only if "small" means 100k+ rows;
performance envelope in m5); desktop + offline-first (no network
dependency for core flows; network reconciliation, if wanted, is an
explicitly granted exception).

Second-order alternatives noted but not load-bearing at this product
size (critic O1, retained as one sentence): OS sandboxes
(Bubblewrap/sandbox-exec/AppContainer — now partly absorbed into P1's OS
mechanisms), no-code transform DSLs (GREL/JsonLogic), signed-update
frameworks (TUF — absorbed into M7 distribution).

O2 governing details (ten rows, all re-verified where re-checked):
WASI preopens deny all with `--dir host[:guest]` mappings and
unforgeable handles (position-sensitive); Wasmtime fuel/epoch off unless
configured (fuel units, epoch ticks, byte memory settings; trap on
exhaustion); Deno flags default to no I/O with path/host/env scoping
and `--deny-*` winning over `--allow-*`, refused operations throwing
catchable `NotCapable`, static module graph loading without permission
checks while non-literal dynamic imports are runtime-checked; Deno
run/FFI bypassing the sandbox entirely; Node `vm` offering no boundary;
isolated-vm defaulting to 128 MB (min 8, ~2–3x soft) with CPU/wall
nanoseconds and Node-major lockstep plus maintenance-mode risk;
OpenRefine history autosaving (5 min + clean exit) with ordered steps
and m/n position; VS Code engines required without `*`; Tauri default-deny
named per-command grants over webview→Rust commands; BagIt checksums
mandatory for validity with complete ≠ valid. Cross-cutting induction
retained: every sound boundary surveyed is deny-by-default.

O3 chains (corrected):

- Chain 1 (vm2, M1 retraction applied): the directional account (June
  2023 deprecation reports, Promise-sanitization bypass fixed in 3.10.2,
  incomplete-fix and Node-24+/26/V8-14.6 follow-ons up to CVSS 9.9, advice
  to migrate to isolates/locked-down workers) remains multiply attested
  and the design conclusion (never build on same-process JS wrapping)
  stands on the Node `vm` doc and isolated-vm evidence. The END-STATE
  "gone" claim is RETRACTED: both GitHub 404s were wrong-URL artifacts
  (404'd owner `patriksletmo` vs registry-recorded `patriksimek`, one
  letter apart; the correct `github.com/patriksimek/vm2` returns HTTP
  200 [R01]), the npmjs.com 403 is website bot-mitigation while the
  registry API returns HTTP 200, and the registry serves vm2 3.12.2 with
  tarball (published 2026-09-08) [R01]. "3.11.5 is FINAL" is irreconcilable
  with 3.12.1 (2026-09-03) and 3.12.2 (2026-09-08) and is retracted.
  Deprecation status: the full packument carries NO `deprecated` string
  [R01], so deprecation is reported-not-confirmed and must not be asserted
  from the registry; per-CVE NVD/advisory verification remains
  outstanding (m1/U6). For internal plan comparison the directional
  evidence suffices; for external publication each CVE needs its
  NVD/advisory page.
- Chain 2 (Workspace Trust bypass, downgraded per M3/m1): a 2026 report
  reportedly demonstrated install-path branching on self-declared
  untrusted-workspace support that never fires for a crafted local
  package, executing with full user privileges. Snippet-observed; primary
  report not fetched. Retained as the justification for call-time
  capability enforcement only.
- Chain 3 (OpenRefine 3.6, re-verified [R03]): Java 11 floor and
  downloadable history JSON (#4498) confirmed on the primary release
  page; no schema-version field, migration table, or `schemaVersion`
  member found. Absence/inapplicability notes retained: no WASI/Deno
  escape chain in scope (search scope, not invulnerability); no workbench
  history (greenfield); usage/billing null for all sources (public
  docs/RFCs/repos/registry metadata, no billing surface).

## O4 comparison summary

| P clause | Disposition | Kind |
|---|---|---|
| P1 child processes | Keep separation, add OS + grant boundary; pick 1 of 3 profiles | Correction + condition |
| P2 paths as arguments | Capabilities/handles/pipes, never raw paths | Correction (security) |
| P3 timeout | Three preempting budgets with named fired budget | Already-covered intent + correction |
| P4 overwrite on success | Operation log + validate + atomic commit + undo pointer | Correction (integrity) |
| P5 auto-newest | Pin + engine range + log-schema version + explicit upgrade | Rejected as stated → gated upgrade |
| P6 sample formatter | Happy path retained as case #1 of a conformance suite | Already-covered intent, insufficient scope |

Already-covered: P2 intent, P3 intent, P6 intent. Rejected readings:
bare-inheritance child (P1), raw paths for third-party code (P2),
overwrite-on-success (P4), silent auto-newest (P5). Uncertain: boundary
choice (isolates vs WASM vs child — carried with discriminating
validations), host stack, exact threat-model edge, "small" scale,
network-reconciliation scope (U1–U5 below).

## Retained alternatives, disagreement, and uncertainty (O5)

### Disagreement recorded

- With the thin plan's P5: reproducibility + engine-range precedent +
  supply-chain reality contradict silent auto-update; this final sides
  with the brief over the plan (critic concurs).
- With any "fastest JS sandbox" reading of P1: the wrapper collapse
  chain contradicts wrapper-based isolation; this final requires a real
  boundary or a trusted-authors-only product decision (D1).
- Within discovery: isolates vs WASM vs locked-down child genuinely
  unresolved; carried as three distinct risk profiles (equivalence
  claim struck) with V1/V2 discriminating.
- With the draft's two over-reads (M2/M3): OpenRefine precedent and
  naming-error/every-call enforcement amended as above; the critic is
  upheld against the draft on both.

### Optional capabilities and user decisions (O5, continued)

- D1 (user decision): threat model — buggy-but-benign vs actively
  malicious extensions. This final prices malicious. Benign-buggy could
  accept isolates + soft limits with explicit risk acceptance.
- D2 (user decision): host stack — Rust, Tauri, or Electron/Node. Rust
  favors Wasmtime embedding; Node favors isolates/Deno; Tauri gives the
  desktop capability model. Still open.
- D3 (user decision, default OFF): opt-in semver-compatible auto-update.
- D4 (optional): network reconciliation against controlled vocabularies
  as a declared + per-use approved grant. Default fully offline.
- D5 (optional): recipe sharing (export/import operation JSON) with
  pinned-extension warnings when the recipient lacks exact versions.
- D6 (optional): extension dependency auditing (lockfile + audit for the
  static-graph exemption window in JS runtimes).
- D7 (product decision, new from M2): import is undoable; only project
  creation is pinned.
- D8 (product decision, new from M2): two artifacts — internal project
  archive (full log + versions + pins) vs BagIt interchange export
  (payload + checksums + provenance subset).
- D9 (new from M7): compare flow, grant UX, distribution, and output
  sanitization ship in the designs below (not deferred):
  - Compare: transform API gains two-input entry points
    (`compare(leftRows, rightRows) -> diffRows`, `join/compare` UI
    showing row-level added/removed/changed with provenance of which
    input each row came from); one-input `transform(rows) -> rows`
    remains for clean steps. Preview-diff (before/after one transform)
    and collection-compare (two collections) share the diff renderer.
  - Grant UX for librarians: plain-language prompts ("Extension
    'MARC fixer' wants to: read files in [project folder] (needed for
    import). Allow? [Only this project] [Every time ask]"),
    per-project memory with per-use re-approval for network/export,
    a "why" line per grant, and a quiet mode where zero-grant
    transforms never prompt. Consent fatigue is a release blocker:
    the suite counts prompts per standard recipe and fails above
    the budget (max 3 per project setup).
  - Distribution/signing + offline install: one registry with signed
    bundles (signature over the hashed bytes in P5; TUF-shaped roles
    acceptable but not mandated); side-loaded bundles install
    trust-on-first-use with the fingerprint shown and recorded; the
    host caches pinned bundles per project so install, replay, and
    upgrade-rollback work fully offline; offline update = import a
    signed bundle file.
  - Output sanitization: preview rendering escapes cell HTML/JS (no
    raw HTML from data; XSS via crafted cells is a P1-class bug);
    CSV exports neutralize formula injection (prefix `=+-@` cells
    per standard practice and document it); BagIt tag filenames are
    sanitized (no traversal, no control characters, bounded length).

### Uncertainty carried forward (O5, continued)

- U1 host stack unknown → boundary cost ranking conditional (D2).
- U2 threat model ambiguous → priced malicious (D1).
- U3 "small" unquantified → streaming undecided; envelope (m5): design
  target ≤ 100k rows / ≤ 512 MB per collection in memory-light batches;
  beyond that the host must stream (P2 transport already batch-shaped).
  Crash-loop UX (m5): a project that fails every load opens in safe mode
  (extensions disabled, log intact, one-click disable of the suspect
  extension). Diff/undo a11y/i18n (m5): diffs expose a text table + bard
  names for screen readers; all user strings localizable from day one.
- U4 network reconciliation scope → default offline, D4 optional.
- U5 no zero-risk boundary → three risk profiles accepted and monitored
  via V-notes, not eliminated.
- U6 CVE/trust-bypass primaries outstanding → re-verify before external
  publication (m1); internal directional use disclosed.
- U7 (vm2 repo URL) RESOLVED by [R01]: canonical owner is `patriksimek`
  (registry `repository` + HTTP 200 on the repo page); `patriksletmo`
  and `vm2js` URLs are wrong/unverified, not evidence of deletion.
- U8 (engine enforcement UX) DESIGNED in P5 above (message + code + log +
  recovery path); residual: exact dialog copy awaits usability review.

## Validations: executed vs proposed (O6)

Executed (read-only; no runtime available, no qualified sandbox, no code
run, none claimed): fetched and quoted public primaries (Deno security,
Node v26.11.1 `vm` doc, isolated-vm README + package 7.0.1, OpenRefine
manual + 3.6.0 release page, VS Code manifest reference, Tauri v2
permissions, RFC 8493, Wasmtime CLI + Config API surface, npm registry
`/latest` + packument for vm2, GitHub latest-release API for Wasmtime);
recorded HTTP statuses including the corrected vm2 200/404/403 pattern;
cross-checked deprecation/claims across independent reporters; verified
absences (no `deprecated` string in vm2 packument, no "naming error" or
enforcement-point wording in the engines doc, no schema-version member
on the 3.6 page).

Proposed — discriminating, build-phase, per-boundary signals (M6):

- V1 boundary denial: transform attempts file read outside grant, socket
  connect, `..`/symlink escape. Must fail closed with the per-boundary
  signal: Deno/JS `NotCapable`-equivalent typed catchable error; WASM
  trap with a named reason; child exit-nonzero/signal plus
  supervisor-accounted record naming the violated grant. Discriminates
  capability enforcement from path-prefix checks and from no boundary
  (P1/P2 literal FAIL — the point).
- V2 preview termination: infinite-loop and exponential-growth
  extensions. Host must preempt within budget and name the fired budget:
  isolate via CPU/wall accounting + soft-limit termination; WASM via
  fuel exhaustion trap / epoch interruption; child via supervisor kill
  (wall timer + rss sampling + output byte count). Discriminates soft
  vs hard enforcement.
- V3 recipe round-trip: extract operation JSON, replay into a fresh
  collection, byte-compare canonical bytes; replay after an extension
  minor release (must use pinned v1). Needs M5 canonical serialization
  + determinism obligation. Discriminates schema-version + pinning
  discipline from silent reinterpretation.
- V4 offline export verify: produce the BagIt export with networking
  disabled; re-verify with a named verifier (a BagIt validation tool
  checking SHA-512 manifests + provenance tags) on a second machine.
  Discriminates genuine offline capability from "usually offline".
- V5 upgrade refusal: extension declaring a newer engine range than the
  host must be refused at install AND activation with the named compat
  error (`ERR_ENGINE_RANGE` + message + recovery path) — not crash or
  half-load. Discriminates install+activation enforcement from
  install-only.
- V6 supply-chain probe (JS runtimes only): test extension whose
  dependency attempts a gated call at import vs run time; confirm and
  document static-graph exemption handling.
- V7 hostile suite in CI: run V1–V6 on every boundary-code change AND
  every runtime release in the pinned matrix (Wasmtime/V8/Node bumps —
  the vm2 lesson; m2 accepted), plus the formula/XSS/filename output
  probes (M7) and the prompt-count budget (D9).

## Criticism adjudication inventory (explicit)

Material:

- M1 vm2 "gone" end-state — ACCEPTED. Retracted and replaced with
  registry-live 3.12.2 + owner-mismatch + 403-bot-blocking account,
  verified independently [R01]; "FINAL 3.11.5" retracted against 3.12.1/
  3.12.2 timestamps; deprecation downgraded to reported-not-confirmed
  (packument has no `deprecated` string). Design conclusion (no
  wrapper boundary) retained on independent legs. No rejection implied.
- M2 OpenRefine schema-version precedent — ACCEPTED. Demoted to author
  proposal; 3.6 page confirms only downloadable JSON + Java 11 [R03].
  Import-undo (D7) and two-artifact split (D8) decided above.
- M3 naming-error/every-call over-read — ACCEPTED. Replaced with
  install+activation refusal + named compat error + hot-update-only
  per-call rechecks; trust-bypass citation confined to capability gates
  and downgraded to "reportedly" pending the primary report.
- M4 under-specified denial — ACCEPTED. OS mechanisms per OS (or
  non-goal fallback), handle-based confinement, batch transport design,
  Tauri-scope correction, and equivalence-claim retraction all applied.
- M5 under-specified commit — ACCEPTED. Atomic commit, retention/GC/
  quota, canonical serialization, and determinism obligation specified.
- M6 validation transfer — ACCEPTED. Per-boundary signals for V1/V2,
  V6 scoped to JS, V4 verifier named, V3 canonicalization required.
- M7 brief gaps — ACCEPTED. Compare flow, grant UX, distribution/
  signing + offline install, and output sanitization designed (D9).

Minor:

- m1 citation depth (per-CVE NVD + bypass primary) — ACCEPTED as an
  open limitation (U6); required only before external publication.
- m2 V7 per-runtime-release trigger — ACCEPTED and added to V7.
- m3 Wasmtime stable re-cite — ACCEPTED: stable is v49.0.2 (2026-10-02)
  [R04]; method-name confirmation on stable remains a pre-build check.
- m4 thin legs (Zotero + Tauri syntax) — ACCEPTED: Zotero demoted to
  illustrative aside; Tauri reliance kept shallow (posture + pattern).
- m5 second-order gaps — ACCEPTED: envelope (≤100k rows / ≤512 MB),
  crash-loop safe mode, diff/undo a11y/i18n notes added.

No criticism was rejected outright; every M/m above changed the final.
P1–P6 dispositions from the draft are retained in substance with the
mechanism repairs above. The draft's correct core (deny-by-default,
zero-grant baseline, operation log, pinning + gated upgrade,
conformance-suite promotion, honest executed/proposed split) is
preserved without change.

## Build order implied by this final

1. Operation log + own schema version + undo pointer + preview-diff +
   compare entry points (sample formatter first-party; D7/D8).
2. One real boundary with zero-grant baseline + V1/V2 green, including
   the M4 OS/transport and M5 commit/determinism designs.
3. Manifest (mandatory engine range) + lockfile pinning + install and
   activation refusal with the named compat error (V5); grant UX (D9).
4. BagIt offline export with provenance + named verifier (V4); output
   sanitization (D9).
5. Recipe extract/apply + explicit upgrade with re-preview (V3);
   distribution/signing + offline install (D9).
6. Hostile conformance suite in CI per boundary change and runtime
   release (V7); then open to third-party authors.

*Reviser: A-M09-A control/reviser, 2026-10-09. Predecessor hashes:
brief 846bc817…8ec28cea; draft 703602e0…113d8adb; discovery
2d3976a7…705654; revealed-plan 66bed5d9…cc43a317; research source-map
44b5f9e3…8f7f11883. Fresh evidence [R01]–[R04] per source-map.json.
Usage/billing: null (no billing surface observed).*
