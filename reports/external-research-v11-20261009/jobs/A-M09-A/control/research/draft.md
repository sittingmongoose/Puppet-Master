# Plan-comparison draft — plugin-workbench (S09), A-M09-A control/research

Self-contained planning deliverable for this scope (O4–O6). Later stages may
correct it. Discovery was frozen before the plan was seen: discovery.md
(20262 bytes, sha256 2d3976a7…705654) was hashed by the reveal gate at
2026-10-09T19:08:24Z (plan-reveal.json); nothing below rewrites it.
Primary-source evidence lives in source-map.json ([S01]–[S14]) and sources/;
this draft restates every claim it depends on so it reads standalone.

## Exact thin plan under comparison (quoted verbatim from revealed-plan.md)

> P1: Run extension scripts as child processes. P2: Pass the dataset path and
> output directory as arguments. P3: A timeout limits each extension. P4: Store
> output as the new dataset after success. P5: Load the newest extension
> version automatically. P6: Test with a sample formatter.

Overall assessment: the thin plan picks reasonable mechanisms (process
isolation, timeouts, success-gated writes, a sample test) but every clause
except P6's intent needs a security or reproducibility correction before it is
safe to build. None is accepted as stated.

## Per-P dispositions

### P1 — "Run extension scripts as child processes." → CORRECTION + CONDITION

Verdict: keep process separation as the outer layer, but a child process as
stated is NOT a sandbox: by default it inherits the user's full authority
(same files, network, environment, subprocess rights). Discovery found that
every sound boundary in real products is deny-by-default, while the one famous
allow-by-default model (VS Code extensions run with full user privileges, no
sandbox) has repeated trust-bypass reports, including a 2026 case where a
crafted package's self-declared trust support skipped the install-time check
entirely.

Retained: process isolation is still valuable (crash containment, OS-level
kill, no shared JS intrinsics to wrap — the exact failure mode that killed
vm2; see O3 in discovery).

Corrections required:

1. Least-privilege spawn: closed file descriptors, empty environment except
   declared variables, no network access unless the extension manifest
   declares it and the user approves, working directory restricted to a
   per-run scratch dir.
2. No subprocess/FFI for third-party code: Deno's own security documentation
   warns that run-subprocess and native-code permissions bypass the sandbox
   entirely (a child can re-launch itself unrestricted; native code issues
   syscalls past JS-layer enforcement). The workbench must treat "extension
   spawns programs / loads native code" as a privileged grant, never a
   default.
3. Named per-command grants (Tauri-style): the host exposes a small command
   surface (read cells, propose edit, request export) and each extension gets
   explicit named permissions per command, default-deny — not one ambient
   plugin API object.

Alternative (retained): instead of child processes per extension, embed a
WASM/WASI runtime or V8 isolates in the host process. WASI is deny-by-default
(no directories, env, args, or sockets until the host preopens them) and
Wasmtime's embed API offers deterministic fuel budgets, epoch preemption, and
memory reservation/guard sizing; V8 isolates offer per-extension memory limits
(128 MB default, 8 MB minimum — documented as a soft guideline an attacker can
exceed ~2–3x) with CPU/wall-time accounting in nanoseconds. Either removes
process-spawn overhead on desktop while keeping equivalent boundary
properties. Condition: if V8 isolates are chosen, accept Node-major lockstep
and the project's stated maintenance-mode status as adoption risks.

Rejected reading: "child process" with inherited stdio/env/cwd and no grants
model. That is P1 as literally written, and it grants every extension
unrestricted host access — the exact outcome the brief forbids.

### P2 — "Pass the dataset path and output directory as arguments." → CORRECTION (security)

Verdict: the intent (tell the extension where its input and output live) is
already-covered; the mechanism (raw host paths) must be corrected. A raw path
hands the extension ambient filesystem authority: it can read anything the
user can, follow symlinks out of the directory, and exfiltrate the collection.
Deno's model shows the fix shape: reads/writes denied by default, granted only
to scoped paths, with explicit deny overriding allow.

Corrections required:

1. Pass capabilities, not paths: the extension sees at most a preopened
   scratch root (WASI-style mapping, e.g. host scratch dir mounted as the
   guest's only visible directory) or receives the dataset over stdin/a pipe
   in batches and returns rows over stdout/a pipe.
2. Deliver input read-only where possible; accept output only inside the
   granted directory; resolve symlinks and confine `..` at the host, not by
   asking the extension to behave.
3. Pure transforms get zero filesystem grants: "extension works with zero
   grants" is the conformance baseline — a transform that needs host file
   access to do pure row math is over-privileged by construction.

Condition: raw paths-as-arguments may be retained ONLY for first-party,
fully-trusted extensions, explicitly marked as such in the manifest, and
documented as a user-visible trust decision. Third-party code never gets this.

### P3 — "A timeout limits each extension." → ALREADY-COVERED intent + CORRECTION in mechanism

Verdict: time-bounding is the right instinct, but a lone wall-clock timeout is
insufficient and its enforcement is underspecified. It does not bound memory
growth, CPU burn within the window, disk fill, fork/subprocess abuse, or
partial-write corruption; and "timeout" that merely stops waiting (leaving the
child running) is not a limit at all.

Corrections required:

1. Three-dimensional budgets: (a) wall/CPU time with true preemption
   (kill the child / epoch-interrupt the guest — Wasmtime's epoch mechanism
   exists precisely for runaway guests; deterministic fuel budgets are the
   stricter option for reproducible previews); (b) memory cap; (c) output-size
   cap. Report which budget fired — silent kills are undebuggable for
   librarians.
2. Preview must always terminate: the timeout/preemption path is exercised by
   the conformance suite (infinite loop, exponential growth), not assumed.
3. Soft-vs-hard knowledge: V8 isolate memory limits are documented
   approximations (~2–3x exceedable); WASM fuel is exact. Choose the
   enforcement whose strength matches the threat model (buggy vs malicious
   extensions — see Uncertainty U2).

### P4 — "Store output as the new dataset after success." → CORRECTION (data integrity)

Verdict: bare overwrite-on-success destroys provenance, breaks undo, and
trusts the exit code as proof of correctness. "Success" of the process is not
success of the transformation.

Corrections required (operation-log design, proven by OpenRefine, the closest
real analog — an offline-first local data-cleaning workbench used in
library-adjacent work):

1. Validate before commit: output must parse against the expected schema/shape
   (row count sanity, column contract, encoding) before it becomes anything.
   Commit rule: exit 0 AND output validates AND write committed atomically.
2. Never overwrite in place: each run appends a new dataset version; the
   operation log records extension ID + pinned version + input hash + output
   hash + timestamp.
3. Undo is a step pointer over the append-only log (OpenRefine semantics:
   step 0 is project creation and cannot be undone; clicking an earlier step
   undoes in order with later steps redoable; a new operation while redo steps
   are pending erases them; position shown as m/n). Durability default to
   copy: autosave every few minutes and on clean exit; history travels with
   exported project archives.
4. Reproducible preview = dry-run of the log prefix producing a human-readable
   diff (rows added/removed/changed, before/after cells) WITHOUT committing;
   the committed run must produce byte-identical output to the approved
   preview given identical inputs.

### P5 — "Load the newest extension version automatically." → REJECTED as stated; replaced with gated upgrade

Verdict: rejected. Silent auto-newest breaks the brief's own reproducibility
promise (yesterday's recipe replays differently today with no record of what
changed), admits compromised or breaking updates with no consent, and ignores
host/extension compatibility entirely.

Replacement (retained findings combined):

1. Pin per project: a lockfile records extension ID + exact version + content
   hash; replay uses the pinned set, always.
2. Mandatory engine range in each extension manifest (VS Code `engines` model:
   required field, cannot be `*`, e.g. minimum host version). The host refuses
   to ACTIVATE — not merely to install — anything outside its supported range,
   with a naming error. Enforcement must happen at every activation/call, not
   only at install: the 2026 Workspace Trust bypass showed install-time-only
   branching on self-declared manifest flags is defeatable.
3. Version the operation-log schema separately from extension versions
   (OpenRefine precedent: the JSON recipe is a compatibility promise; its 3.6
   release made history JSON directly downloadable and raised the runtime
   floor). Old recipes replay on new hosts through declared migrations or
   refuse with a clear message — never silently reinterpret.
4. Upgrades are an explicit user action with changelog + re-preview of
   affected collections before commit.

User decision (optional enhancement): an opt-in "auto-update within
semver-compatible range" setting is permissible, but the default MUST be OFF
for a librarian reproducibility tool, and even opted-in updates must be
recorded in the project history with before/after versions.

### P6 — "Test with a sample formatter." → ALREADY-COVERED intent, INSUFFICIENT scope → must expand

Verdict: a happy-path sample is the right first test and is retained as case
#1, but one sample cannot discriminate any property the brief requires
(boundary, budgets, undo, offline, upgrades). Promoted to a conformance suite:

- Happy path: sample formatter transforms a small collection; byte-expected
  output; exercises preview → approve → commit → undo → redo.
- Hostile samples (must fail closed with typed, catchable errors): read
  outside grant (`/etc/passwd`), socket connect, symlink/`..` escape, fork or
  subprocess spawn, infinite loop, memory hog, oversized output.
- Contract samples: invalid output schema, nonzero exit, budget exceeded,
  malformed manifest, engine-range mismatch (must refuse activation cleanly).
- Lifecycle samples: replay a v1 recipe after a v2 extension release (must use
  pinned v1); export with network disabled and re-verify on a second machine;
  dependency that probes permissions at import time vs run time (documents the
  static-graph exemption behavior for JS-based extensions).

## Retained discovery findings (brief obligations O1–O3, condensed for builders)

- F1 (boundaries): use a deny-by-default runtime boundary — WASI preopens,
  Deno-style scoped flags, or V8 isolates — never same-process JS wrapping.
  Node's `vm` module is explicitly "not a security mechanism"; vm2 (the
  wrapper-based standard) was deprecated ~June 2023 after a treadmill of
  sandbox-escape CVEs (e.g. Promise-callback sanitization bypass fixed in
  3.10.2, then follow-on incomplete-fix and Node-24+/26/V8-14.6 escapes up to
  CVSS 9.9), both known repo URLs returned 404 at access time, and downstream
  auditors now say "remove entirely."
- F2 (operations): extensions contribute declarative, serializable operations
  to an append-only log — this single mechanism delivers undo, reproducible
  preview, and recipe sharing (OpenRefine: Extract…/Apply JSON, step-0-pinned
  history, autosave).
- F3 (trust): enforce grants at call time (Tauri per-command permissions,
  capability handles); never trust extension self-declarations at install only
  (VS Code bypass lesson).
- F4 (upgrades): two independent gates — manifest engine range + operation-log
  schema version — with per-project pinning.
- F5 (export): offline export as a self-verifying BagIt package (RFC 8493,
  authored by CDL/Stanford/LoC staff): `bagit.txt` + `data/` + per-file
  checksum manifests (omit `fetch.txt` for offline), plus provenance tags
  recording workbench version, extension pins, and operation-log hash;
  validity means checksums verify, not just files present.
- F6 (ecosystem shape): many tiny single-format transforms with symmetric
  import/export entry points and per-translator tests (Zotero translator
  corpus model) — inside the app's trust domain technically, bounded by F1.
- F7 (original constraints preserved): librarian users (non-programmers need
  readable diffs, m/n undo position, named errors — never silent kills or hash
  dumps); small collections (streaming batches only if "small" turns out to
  mean 100k+ rows); desktop + offline-first (no network dependency for core
  flows; controlled-vocabulary reconciliation over the network, if wanted, is
  an explicitly granted exception).

## Disagreement recorded

- With the thin plan's P5: discovery evidence (reproducibility requirement +
  engine-range precedent + supply-chain reality) contradicts silent
  auto-update; the draft sides with the brief over the plan.
- With any "just use the fastest JS sandbox" reading of P1: the vm2 collapse
  chain contradicts wrapper-based isolation; the draft requires a real
  boundary or a trusted-authors-only product decision (escalated below).
- Within discovery: V8 isolates vs WASM/WASI as the preferred boundary is
  genuinely unresolved (isolates are easier for JS extensions but soft-limited
  and maintenance-mode; WASM is harder-capped but a bigger authoring lift).
  Both are carried as alternatives with the discriminating validations below.

## Optional capabilities and user decisions (for Jared / later stages)

- D1 (user decision): threat model — buggy-but-benign vs actively malicious
  extensions? Malicious demands the hard boundary (WASM fuel/preopens or
  locked-down child with no-subprocess/no-FFI); benign-buggy could accept
  isolates + soft limits. The draft prices the malicious case.
- D2 (user decision): host stack — Rust, Tauri, or Electron/Node? Rust favors
  Wasmtime embedding; Node favors isolates/Deno; Tauri gives the desktop
  capability model for free. Unresolved pre-reveal and still open.
- D3 (user decision, default OFF): opt-in semver-compatible auto-update (P5).
- D4 (optional capability): network reconciliation against controlled
  vocabularies (OpenRefine-style), as a per-extension declared + per-use
  approved grant. Default: fully offline.
- D5 (optional capability): recipe sharing (export/import operation JSON
  across librarians) with pinned-extension warnings when the recipient lacks
  the exact versions.
- D6 (optional capability): extension dependency auditing (lockfile + audit
  for the static-graph exemption window in any JS-based runtime).

## Uncertainty carried forward

- U1: host stack unknown → boundary cost ranking is conditional (see D2).
- U2: threat model ambiguous in the brief ("without gaining unrestricted host
  access" admits buggy-vs-malicious readings) → draft assumes malicious.
- U3: "small" collections unquantified → batch/streaming architecture undecided.
- U4: network reconciliation in or out of scope → default offline, D4 optional.
- U5: no zero-risk boundary exists (isolates maintenance-mode; WASM
  component-model churn; child-process ambient inheritance) → residual risk
  accepted and monitored via V-notes below, not eliminated.
- U6: CVE details for the vm2 chain are snippet-observed, not NVD-verified;
  the direction (collapse → deprecation → removal guidance) is corroborated by
  four independent downstream reporters, but exact CVSS text should be
  re-verified before publication outside this experiment.

## Validations: executed vs proposed (O6)

Executed (read-only; no runtime was available, no qualified sandbox exists, no
code was run, and no run is claimed): fetched and quoted public primary
sources (Deno security doc, Node v26.11.1 vm doc, isolated-vm main README,
OpenRefine manual, VS Code manifest reference, Tauri permissions, RFC 8493,
Wasmtime CLI + Config API docs); recorded HTTP statuses including the vm2
404s and npm 403; cross-checked the deprecation across independent reporters.

Proposed — discriminating, build-phase, each names what it discriminates:

- V1 boundary denial: transform attempts file read outside grant, socket
  connect, `..`/symlink escape. Must fail closed with a typed catchable error
  (e.g. Deno `NotCapable`-equivalent). Discriminates capability enforcement
  from path-prefix checks and from no boundary (P1/P2 as literally written
  FAIL this — that is the point).
- V2 preview termination: infinite-loop and exponential-growth extensions.
  Host must preempt within the advertised budget and name the fired budget.
  Discriminates soft (V8 ~2–3x memory guideline) vs hard (WASM fuel/epoch,
  child kill) enforcement.
- V3 recipe round-trip: extract operation JSON, replay into a fresh
  collection, byte-compare; then replay after an extension minor release (must
  use pinned version). Discriminates schema-version + pinning discipline from
  silent reinterpretation.
- V4 offline export verify: produce the BagIt export with networking
  disabled; independently re-verify manifests + provenance on a second
  machine. Discriminates genuine offline capability from "usually offline."
- V5 upgrade refusal: extension declaring a newer engine range than the host
  must be refused activation with a naming error — not crash, not half-load.
  Discriminates activation-time vs install-time-only enforcement.
- V6 supply-chain probe: test extension whose dependency attempts a gated
  call at import time vs run time; confirm and document static-graph exemption
  handling. JS-runtime-specific.
- V7 hostile_formatter suite: run the P6 hostile/contract/lifecycle samples in
  CI on every boundary change. Discriminates regressions in V1–V6 (the vm2
  lesson: each runtime release can re-open a wrapper boundary; only a
  re-run suite catches it).

## Build order implied by this draft

1. Operation log + schema-versioned JSON + undo pointer + preview-diff (no
   extensions yet; the sample formatter is first-party code).
2. One real boundary (WASM or isolates or locked-down child) with zero-grant
   baseline + V1/V2 suite green.
3. Manifest with mandatory engine range + per-project pinning + activation
   refusal (V5).
4. BagIt offline export with provenance (V4).
5. Recipe extract/apply + upgrade flow with re-preview (V3).
6. Hostile conformance suite in CI (V7); then open to third-party authors.
