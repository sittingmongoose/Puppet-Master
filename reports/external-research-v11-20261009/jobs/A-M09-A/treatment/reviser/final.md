# ER11 A-M09-A treatment reviser — Final (S09 plugin-workbench)

Self-contained planning deliverable for the S09 scope. Covers the exact brief
(O1–O6) and the exact revealed thin plan (P1–P6). Supersedes the research draft
on every point where the critique is accepted below; every criticism is
explicitly disposed (accept / amend / reject / retain uncertainty) on evidence,
not by automatic obedience. Predecessor identifiers index evidence only and
never replace material text: all load-bearing content is restated here in full
prose.

Scope: desktop workbench for librarians to import, clean and compare small
metadata collections. Third-party transformation extensions must be useful
without gaining unrestricted host access. Reproducible preview, undo, offline
export, future extension version upgrades.

Revealed thin plan (verbatim):
P1: Run extension scripts as child processes. P2: Pass the dataset path and
output directory as arguments. P3: A timeout limits each extension. P4: Store
output as the new dataset after success. P5: Load the newest extension version
automatically. P6: Test with a sample formatter.

Disposition vocabulary: already-covered, correction, optional enhancement,
user decision, rejected, uncertain.

Reviser independent check: full read of the exact brief, research
discovery.md, draft.md, research source-map.json, revealed-plan.md, critic
critique.md, critic source-map.json, all research excerpts S01–S12 and all
critic excerpts C01–C05 from the declared own-arm source roots, plus one
independent primary re-fetch (R01, Deno permissions reference, 2026-10-09T19:29Z,
excerpt in sources/). No runtime available; no witness sandbox used or claimed;
no nested agents. The independent fetch confirmed the one material finding (M1)
with stronger verbatim and overturned one minor demand (m1) on current primary
text; details in §2.

## 1. Exact per-P disposition

### P1 — Run extension scripts as child processes → CORRECTION (keep mechanism, add boundary + void rule + fail-closed)

Already-covered part: one process per extension run is the right isolation
mechanism and is retained. It matches the discovery recommendation (row
transforms in a deny-by-default child, L2-A3).

Correction: a child process alone is NOT a sandbox. Deno documents that its
`--allow-all` flag "disables the security sandbox entirely" and "has the same
security properties as running a script in Node.js (ie none)". The desktop
VS Code extension host is likewise described in discovery as a separate process
holding the user's full filesystem/network power — a stability boundary, not a
security boundary — but that VS Code half is retained here as an explicitly
hedged inference pending a direct primary citation (see m6; the P1 core claim
stands on the Deno primary alone). As stated, P1 lets a transform read
`~/.ssh`, exfiltrate the collection over the network, or encrypt user files,
all from its "child process".

Required corrections:
(a) Deny-by-default capability profile: no filesystem/network/env/subprocess
unless explicitly granted. Filesystem grants are path-scoped
(directory = subtree, comma-separated path lists); network grants are
host[:port] scoped; env grants name variables; deny entries override allow
entries; bare category grants are over-broad and full-allow is a documented
sandbox-off switch. Filesystem preopens follow the `--dir`/`--mapdir` preopen
shape (`--dir` verified; `--mapdir` provisional, see m2). Refused operations
surface a catchable capability error (Deno `NotCapable` shape).
(b) `run`/`ffi`-class grants VOID the sandbox (M1, accepted). Row-transform
manifests MUST NOT offer subprocess/FFI grants at all. Independently verified
verbatim: spawned subprocesses "run independently from the permissions granted
to the parent process", granting `--allow-run` "essentially invalidates the
Deno security sandbox", and "dynamic libraries are not run in a sandbox and
therefore do not have the same security restrictions". If a future capability
ever exposes subprocess/FFI, install-time approval text must state it voids
isolation for that execution path, and the affected run must be treated as
untrusted-host-equivalent, never as silently sandboxed. The web-runtime shape
(no subprocess at all) is the strongest posture here. The Wasmtime/F FI
analogues need the same statement verified against their own docs before build
(see PV-a); the Deno-shaped rule above is not provisional.
(c) No inherited secrets: scrubbed environment, neutral working directory, no
user token passthrough. Module-load defaults (statically-analyzed imports from
the entrypoint AND `node_modules/` contents are readable by default on the
current Deno page — both documented, see m1) are runtime facts, not grants the
workbench relies on for extension data access.
(d) Data crosses the boundary by least-privilege handle (see P2), never by
ambient host paths.
(e) Failure semantics: kill on violation with a capability error, partial
output discarded, violation logged against extension id+version. A CAUGHT
capability error fails the run unless a declared degraded path was pre-approved
(m7, accepted): catching `NotCapable` and continuing with silently reduced
behavior is forbidden; V1 asserts the run fails, not merely that the call
throws.

### P2 — Pass the dataset path and output directory as arguments → CORRECTION (least-privilege handles)

Correction: raw host paths confer ambient authority. An extension handed the
live dataset path can read sibling files, follow symlinks out of the granted
tree (verified: Deno checks the link location, so a permitted directory
containing a hostile symlink still exposes the target, with only `/proc`,
`/dev`, `/sys` requiring `--allow-all` and `*/environ` requiring `--allow-env`
specially guarded; creating symlinks needs full non-path-scoped read+write),
and race the host's own writes. An output directory shared with other runs lets
it clobber or read other outputs. Note: P2's "output directory" could in
principle already be per-run; this final adopts the defensible worst-case
shared-dir reading, and per-run scratch is required regardless.

Required corrections: (a) input is a read-only snapshot (frozen copy with
content hash, or a row stream over stdio), never the live collection; (b)
output is a fresh empty per-run scratch directory, promoted to a new dataset
version only after validation (see P4); (c) pass snapshot id + content hash +
recipe context, not just paths, so preview and replay are pinnable; (d) declare
any extra input roots read-only in the manifest and approve at install/update.
The VS Code web-runtime shape is the model (verified: WebWorker sandbox, single
bundle, only the `require('vscode')` shim, no Node globals, workspace access
only via the mediated virtual filesystem API, web fetch with CORS only, no
child processes, runnable on desktop too): guest code sees only a mediated
view through a host API, never host paths.

### P3 — A timeout limits each extension → CORRECTION (timeout kept, resource envelope added)

Already-covered part: bounding extension runtime is correct and retained.

Correction: a wall-clock timeout alone does not bound memory, CPU burn, fork
bombs, disk fill, or network use, and says nothing about units, scaling, or
kill semantics. The documented disk carve-outs (localStorage, KV, caches, Blob
and module/network caches consume disk without explicit grants) strengthen —
not weaken — this correction.

Required corrections: (a) full resource envelope: wall timeout (seconds, stated
per collection-size class, small-collections default with documented override)
PLUS memory cap (MB) and, where the runtime supports it, instruction fuel
(Wasmtime fuel shape — provisional, see m2); (b) kill semantics:
SIGKILL-equivalent on expiry, no grace-period writes to the output dir after
expiry; (c) partial output from a timed-out run is discarded, never promoted;
(d) timeout/fuel exhaustion is recorded in the operation history as a failed
attempt (visible, re-runnable), not silent. Uncertain: exact default seconds
and MB — depends on host runtime choice (UD1); must be set with units and a
size-scaling rule before build (UD3).

### P4 — Store output as the new dataset after success → CORRECTION (versioned commit, not overwrite)

Correction: blind overwrite destroys undo, provenance, and privacy
simultaneously. The verified correct shape is OpenRefine's: history persisted
WITH project data across restart and archive re-import; operations extractable
as a JSON recipe and re-appliable; archives carrying prior-step data with an
explicit do-not-share-when-anonymizing caution (all verified verbatim, C04/R
predecessors). Column-dependency validation before applying operations (cited
at 3.10 from a release-note snippet) is provisional pending the release
note/commit (m4) but the correction does not depend on it.

Required corrections: (a) every successful run appends an operation record —
extension id+version, host API version, input snapshot hash, parameters,
facet/filter state, exporter + per-column output mode — and the prior dataset
stays restorable (undo = walk back the record chain); (b) output validated
before commit (schema/column check; refuse-and-show-diff on mismatch, never
silent coerce); (c) preview and commit are distinct actions sharing one code
path: preview names the FULL tuple — input snapshot id + operation recipe hash
+ facet/filter state + exporter + per-column output mode + extension id/version
+ host API version (F2; the version pins come from P5 and are part of the
tuple, not optional — m8 fix applied); anything less is not checkable and not
byte-reproducible; (d) export offers "recipe-only share" (no row data) versus
"archive share" (contains prior-step data) with a privacy warning and confirm
step.

### P5 — Load the newest extension version automatically → REJECTED as stated; replaced by pinned upgrades (user decision)

Rejected: silent auto-upgrade is the reproducibility enemy. It would silently
change the meaning of saved recipes and previews. The rejection follows from
the brief's reproducible-preview requirement plus the verified minimum-host-gate
pattern (`engines.vscode` minimum-host gate + versioned API, where old hosts
refuse new extensions instead of running them wrongly) and is therefore
overdetermined: the OpenRefine 3.2 org.json→Jackson forced-migration anecdote
and the runtime library-pinning note are honestly snippet-level and stay
provisional (m3) — the rejection does not need them and must not harden them
into a build assumption.

Replacement (user decision): (a) every saved recipe/preview pins extension
id+version AND host API version; (b) updates install side-by-side; the pinned
version stays runnable until the user re-pins; (c) upgrade is an explicit user
action showing capability-diff (new permissions requested), compat result, and
a diff preview of golden outputs; replay across a major API bump without re-pin
is refused, never silently rewritten. Optional enhancement (not required):
auto-CHECK with user notification (badge "v2 available"), which preserves
offline-first while keeping users informed — check-on-explicit-action only,
never background silent fetch.

### P6 — Test with a sample formatter → ALREADY-COVERED direction, INSUFFICIENT alone → CORRECTION via discriminating suite

Already-covered part: a sample formatter as first smoke test is retained (T0) —
it exercises the end-to-end path (install → run → preview → commit → export).

Correction: one happy-path sample cannot discriminate any of the brief's hard
requirements (sandbox, determinism, migration, privacy, offline). It stays as
smoke test T0; the plan must add the discriminating validations in §7
(V1–V7), each with pass/fail teeth: sandbox escape attempts must fail closed
(including the M1 void case and the m7 fail-closed assertion); the fixed full
tuple must yield byte-identical preview; version bump without re-pin must
refuse; golden pairs gate install/upgrade; nbsp/unicode merge must not corrupt;
offline exports must equal online exports; recipe-only share must contain no
row data.

## 2. Criticism adjudication (every finding disposed on evidence)

Method: each demand was checked against the cited predecessor excerpt and,
for the material finding and the wording correction, against the reviser's own
independent primary fetch (R01). "Overturned by" conditions from the critique
were treated as live.

| Finding | Disposition | Evidence and change |
|---|---|---|
| M1: `run`/`ffi` grants void isolation (add to P1/F1/V1/UD1) | ACCEPT (material) | Independently CONFIRMED with stronger verbatim (R01): children "run independently from the permissions granted to the parent process"; `--allow-run` "essentially invalidates the Deno security sandbox"; "dynamic libraries are not run in a sandbox". Draft P1(a) readable as granting subprocess/FFI inside the sandbox was a genuine hole. Change applied: P1(b), F1, V1, UD1 updated; manifests MUST NOT offer run/ffi; any future exposure voids isolation explicitly. Wasmtime/web-runtime analogues flagged for own-docs verification in PV-a. |
| m1: correct `node_modules` default-read wording | REJECT the demanded correction; AMEND wording to state both defaults | Reviser fetch OVERTURNS the critic's negative on current primary text (R01): the page documents BOTH "All files that are imported from the entrypoint module in a way that they can be statically analyzed are allowed to be read by default" AND "Files inside of a `node_modules/` directory are allowed to be read by default." The predecessor S07 claim the critic called wrong is correct on the current page; the critic's "no such carveout" (3 hits all the subtree example) does not match the fetched text — either mutable drift between the critic window (19:20Z) and the reviser fetch (19:29Z) or a grep miss. Either way the current primary text governs and is quoted in sources/. Change applied: final states both defaults (P1(c)); neither is relied on for extension data access. No disposition impact (rejected category either way). Build refs must pin the doc access date. |
| m2: `--mapdir`/fuel/WASI-network provisional | ACCEPT | Critic negative accepted at face value (confirmed items `--dir`/arg-order/`--invoke`/instantiation-failure/`serve`-since-18; zero hits for `--mapdir`/fuel, no network-grant statement; predecessor already flagged the network line secondary). No contradicting evidence offered. Change applied: P1(a)/P3(a) keep the hedged shapes ("`--dir`/`--mapdir` preopen shape", "where the runtime supports it"); PV-a extended to `wasmtime run --help` / fuel docs / WASI-socket reference before build. |
| m3: Jackson-breakage + pinning snippet-level | ACCEPT | S11 evidence honestly flagged (wiki page name unresolved; README/search snippets). Rejection is overdetermined (brief repro requirement + verified engines-gate pattern). Change applied: anecdote fenced as provisional in P5/F4; must cite release notes/commit before hardening; no build assumption. |
| m4: 3.10 column validation release-note-level | ACCEPT | Cited via search snippet, not a fetched page. P4 stands on verified history/JSON/caution. Change applied: version-specific validation claim provisional in P4/L1 lineage; confirm release note/commit in PV-a. |
| m5: #5581 commit-level details not re-verified | ACCEPT | Issue level verified (title, body, repro, Chromium-only note, Closed, #5584, milestone 3.7, labels); commit `4d7571d`, message, close date, DOM-readback quotation predecessor-recorded only (critic page truncated). Change applied: O3 chain stands at issue level; hash/message/date/quote provisional until the PR/commit page is fetched (PV-a); build docs must not cite the hash until then. |
| m6: desktop-host full-power needs direct citation | ACCEPT as hedge | Inference from the A2 contrast is honestly marked as such in discovery. P1 core stands on the Deno primary alone. Change applied: VS Code half explicitly hedged in P1; cite-or-hedge (extension-host/capabilities docs stating desktop API power) added to PV-a. No disposition change. |
| m7: fail-closed handling for caught `NotCapable` | ACCEPT | Error shape verified; catchability noted. A catch-and-continue-degraded path would silently void the boundary the same way M1 does. Change applied: P1(e) requires run failure on caught capability error unless a declared degraded path was pre-approved; V1 asserts run failure, not mere throw. |
| m8: P4 tuple drops version pins | ACCEPT (editorial) | Genuine cross-reference gap: §1 P4(c) short tuple vs F2 full tuple. Change applied: P4(c) names the full F2 tuple including extension id/version + host API version and points at F2/P5. |
| m9: recon timeout "microseconds 180000" suspect | ACCEPT | 180 ms is implausible for a network timeout; likely ms or a misread pref; sits in a rejected (non-obligation) category so impact is nil. Change applied: the value is DROPPED as fact and not carried forward; other O2 defaults (autosave minutes, port, facet/clustering limits) carried only as excerpt-level examples, not load-bearing. Verify-or-drop applied before carrying the table forward. |
| m10: missing durability/autosave condition | ACCEPT | Discovery records the 5-minute autosave loss bound; draft §3 never states the workbench's own rule. Change applied: new condition C6 — every completed run persists its run record with the dataset; the crash-loss bound is stated in the plan (exact bound deferred to user decision/prototype calibration if not derivable). |
| m11: S10/S12 fencing correct; keep fenced | ACCEPT | Catmandu Fix syntax (metacpan challenged; snippet-level) and VSIX layout/install (secondary snippets) honestly flagged; PV-a gates S11/S12. Change applied: fencing retained; V4's install/upgrade golden gate and any offline-bundle format work stay provisional until primary confirm; no new reliance on S12 beyond the draft's hedges. |
| m12: trust-excerpt reliance + count nits | ACCEPT in substance | S03 (trust tri-state) and S05 (engines gate) at excerpt level accepted at low risk (verbatim schema excerpts, consistent use). E3 freeze/`plan-reveal.json` outside critic evidence (no reason to doubt). Counts: S00–S12 is 13 IDs, not 12; P6's retained smoke test counts as already-covered. Change applied: PV-a extended to S03/S05 primary confirm; counts corrected in this final (§7–§8); freeze mechanics restated as the research-stage record, not re-verified by the reviser. |

Result: all six P dispositions STAND (with the qualifications above); no false
correction, false rejection, or omitted must-correct defect beyond M1/m7,
both now incorporated. No critic demand was obeyed without checking: m1 was
overturned on fresh primary text, and M1 was strengthened by it.

## 3. Retained findings (restated in full)

- F1 Sandbox shape (as amended by M1/m1/m7): deny-by-default child with
  explicit capability grants is the only observed shape satisfying "useful
  without unrestricted host access". Concretely: no fs/net/env/subprocess
  unless granted; fs grants path-scoped with directory=subtree; net grants
  host[:port] scoped; env grants name variables; deny overrides allow;
  full-allow is a documented sandbox-off switch. `run`/`ffi`-class grants are
  NOT grantable sandbox capabilities: granting them voids isolation for that
  execution path (children run independently of parent permissions; libraries
  are not run in a sandbox) and must be labelled as such if ever exposed;
  row-transform manifests offer neither. A caught capability error fails the
  run unless a declared degraded path was pre-approved. Module-load defaults
  (statically-analyzed entrypoint imports; `node_modules/` readable) are
  documented runtime facts, not workbench grants. Declarative trust gating
  (true/false/limited + withheld workspace settings + isTrusted API,
  defaulting to disabled when undeclared) is a valuable UX layer but is not
  isolation and must never be presented as such.
- F2 Reproducibility tuple: preview/replay is defined by (input snapshot id +
  operation recipe hash + facet/filter state + exporter + per-column output
  modes + extension id/version + host API version). Anything less is not
  checkable. The version pins are part of the tuple.
- F3 History model: operation history persisted with project data;
  restart-safe; archive-portable (.tar.gz with history, without view state);
  recipe extractable as JSON and re-appliable subject to validation (exact
  version-gate of the validation rule provisional, m4); archives leak
  prior-step data (privacy gate required).
- F4 Failure modes to regression-test: UI-path data corruption (cluster-merge
  nbsp rewrite, Chromium-only — issue-level verified; commit/message/date
  provisional, m5 — caused by reading merged values back from rendered DOM
  instead of the model; fixed by not inserting nbsp into committed values);
  recipe-apply fragility across renamed/missing columns (validation-shape fix;
  version citation provisional); host-upgrade extension breakage
  (org.json→Jackson migration anecdote provisional, m3 — retained as a caution,
  not a build assumption).
- F5 Script-recipe alternative: Catmandu Fix (per-record transform scripts over
  Importer→Fix→Exporter/Store streaming, MARC/MODS/JSON/CSV, built by/for
  librarians; syntax at snippet level, metacpan challenged, m11) is a
  materially different authoring model from GUI-history recipes: hand-authorable,
  diffable, version-controllable. The workbench keeps both: canonical JSON
  recipe with a human-readable projection (exact grammar a user decision).
- F6 Offline-first with explicit online moments: core
  import/clean/compare/preview/undo/export works with no network; network
  appears only as a declared capability (named hosts) and as an explicit user
  action (fetch update, authorized upload), degrading to explicit error
  otherwise.

## 4. Conditions and constraints (original + discovered)

- C1 Third-party transforms must be useful but bounded (brief) — enforced by
  F1, tested by V1 (including the void case).
- C2 Small metadata collections, librarian users (brief) — UX must not require
  CLI fluency; capability prompts and privacy warnings in plain language;
  script view optional, never required.
- C3 Reproducible preview, undo, offline export, version upgrades (brief) —
  enforced by F2–F4, F6.
- C4 No silent data change anywhere: no silent replay across versions (P5), no
  silent coercion on commit (P4), no silent auto-update (P5), no view-state
  masquerading as data (F3), no silent degraded continue on caught capability
  errors (P1(e)).
- C5 Privacy: prior-step data never leaves the machine without an explicit
  warned action (F3, V7).
- C6 Durability (added, m10): every completed run persists its run record with
  the dataset; the crash-loss bound (what survives a crash between runs) is
  stated in the plan; the exact bound (autosave cadence vs commit-only) is
  deferred to user decision/prototype calibration if not derivable from further
  doc reads.

## 5. Alternatives retained (not chosen, not discarded)

- ALT-A Trusted in-process extensions (OpenRefine Java shape): simplest to
  build, richest API access — violates C1 (host-process privileges, no
  boundary). Retained only if the brief's sandbox clause is ever relaxed by
  user decision; currently NOT recommended. Rejection as a C1-satisfying shape
  upheld.
- ALT-B Declarative-trust gating only (desktop trust shape): cheap, good UX —
  violates C1 alone (gates activation, does not bound running code). Retained
  as a UX layer OVER the sandbox (F1). Rejection as a C1-satisfying shape
  upheld.
- ALT-C Recommended: deny-by-default capability sandbox (Deno/Wasmtime/
  web-runtime shape, with the M1 void rule) + pinned recipes + golden-pair
  gates. Satisfies C1–C6. Upheld as the only retained C1-satisfying shape.
- ALT-D Recipe authoring: GUI-history-derived JSON (OpenRefine) vs
  hand-authored Fix scripts (Catmandu, snippet-level) vs hybrid (recommended:
  canonical JSON + readable projection, F5; exact grammar open).

## 6. Optional capabilities and user decisions

User decisions (need product call, not derivable from research):
- UD1 Host runtime for the workbench shell and sandbox (options: Tauri +
  sidecar sandbox, Electron + utility-process sandbox, native +
  Wasmtime/Deno sidecar). Research constrains the shape (F1 including the M1
  void rule) but does not pick the stack. Pre-build probes still owed: one
  doc-read each on OS-native sandboxes (macOS seatbelt/profile, Linux
  bubblewrap/namespaces, Windows AppContainer) and desktop updater frameworks
  (Sparkle/Tauri updater) — additive breadth, no disposition depends on them
  (PV-b).
- UD2 Recipe grammar: canonical JSON field set + human-readable projection
  syntax (ALT-D hybrid endorsed, exact grammar open; Fix-syntax half stays
  provisional until primary confirm).
- UD3 Default timeout seconds + memory MB per collection-size class (P3
  uncertain values; fuel availability per m2 affects the envelope).
- UD4 Distribution channel: OS/store-signed bundles vs direct download
  (determines which supply-chain controls exist; the workbench itself runs no
  malware-scan infrastructure; offline-bundle format provisional until PV-a).
- UD5 (from C6/m10, folded into UD1/UD3 if preferred): durability bound —
  commit-only persistence vs autosave cadence and its crash-loss window.
Optional capabilities (explicitly NOT in scope unless chosen):
reconciliation/Wikidata-style network services; Google Sheets/Drive upload +
OAuth; multi-project tabs; proposed-API staging cadence; FFI/subprocess for
extensions (forbidden by default under M1 — exposing either is a void-isolation
decision, not an ordinary capability); extension-to-extension calls.

## 7. Validations: executed vs proposed (discriminating)

Executed this run (doc/code-read checks only; no runtime available; no witness
sandbox used):
- E1 Research stage (record, not re-verified by the reviser): 13 sources
  (S00–S12) fetched and excerpted with locators and access timestamps;
  excerpts in the research sources root. No runtime, no downloaded
  executables, no installs. (Count corrected per m12.)
- E2 Research stage (record): answer-conditioned inquiry chains completed in
  all four lenses (L1–L4) with irrelevant analogy categories explicitly
  rejected; criticism pass C1–C5 applied (trust≠sandbox rejected, history-only
  revised, offline-vs-versions revised, recipe-format held open, VSIX flagged).
- E3 Research stage (record): plan reveal performed exactly once via the
  declared gate after discovery freeze; discovery not rewritten after reveal
  (freeze mechanics per the research-stage record; outside reviser
  re-verification, m12).
- E4 Critic stage (record): 5 independent primary fetches with keyword-grep
  verification (C01–C05), full read of all declared predecessors and all 13
  research excerpts. Honest negatives recorded (fuel/`--mapdir`, commit-level
  #5581).
- E5 Reviser stage (this run): full read of the exact brief, both predecessors'
  complete texts and excerpts, plus one independent primary re-fetch (R01,
  Deno permissions, 2026-10-09T19:29Z) with keyword verification confirming
  M1 (`run independently`, `essentially invalidates the Deno security
  sandbox`, FFI `not run in a sandbox`), the `--allow-all`/Node-equivalence,
  deny precedence, symlink link-location rule with `/proc|/dev|/sys` +
  environ guards, `NotCapable`, and BOTH module defaults (statically-analyzed
  imports and `node_modules/`). Consequential changes (P1/F1/V1/UD1 via M1;
  O2 wording via m1) independently checked; affected dependencies traced
  (V1 void case + fail-closed assertion; PV-a extensions). No runtime; no
  witness sandbox; usage/billing unobserved (null).
Proposed (none executed; each discriminates a requirement; all runnable offline
except where noted):
- V1 Sandbox escape (as amended by M1/m7): transform attempts host-file read,
  socket open, scratch-escape write → must fail with capability error AND the
  run must fail (caught-error-degraded-continue forbidden unless a degraded
  path was pre-approved); same transform on granted paths succeeds. Void case:
  a transform granted `run`/FFI-class power is treated as
  untrusted-host-equivalent and its "sandboxed" claim refused. Discriminates
  F1 from C1 theatre. (Needs runtime.)
- V2 Replay determinism: fixed FULL F2 tuple ⇒ byte-identical preview across
  runs and restart; mutated facet state visibly changes preview. Discriminates
  F2 from history-only claims.
- V3 Version-bump refusal: recipe pinned to v1 replays; after v2 install,
  replay without re-pin refused or diff-previewed, never silently rewritten.
  Discriminates P5 replacement from auto-load.
- V4 Golden-pair gate (provisional until PV-a, m11): per-transform golden
  input→output runs on install/upgrade and offline; failure blocks activation
  with diff shown. Discriminates tested lifecycle from install-and-hope.
- V5 UI-readback regression (from #5581, issue-level): merge options containing
  spaces/nbsp/lookalike unicode commit model values, not DOM text; unselected
  characters bit-identical. Run on Chromium AND Firefox given the verified
  browser split. Discriminates model-commit from render-readback. (Needs UI
  harness.)
- V6 Offline parity: offline-capable exports byte-identical with network on vs
  off; network-needing transforms error explicitly. Discriminates F6 from
  accidental-online.
- V7 Archive privacy gate: recipe-only share contains zero row bytes; archive
  share requires warned confirm. Discriminates C5 from naive dump.
- PV-a Primary-confirm pass (extended: S11/S12 + m2 fuel/`--mapdir`/WASI-socket
  + m4 release note/commit + m5 PR/commit page + m6 desktop-host power + m12
  S03/S05): verify each provisional against primary docs/source before build;
  until then all stay provisional and no new reliance is added.
- PV-b Breadth probes (additive, from critic §7): one doc-read each on
  OS-native sandboxes and desktop updater frameworks for UD1/UD4. Not O1 gaps.

## 8. Uncertainty register

- U1 Exact sandbox runtime (UD1) undecided — affects P3 values, V1 mechanics,
  packaging; M1 constrains but does not pick the stack.
- U2 Recipe grammar (UD2) open — affects F5 implementation, V2 byte-compare
  scope.
- U3 Provisional evidence (PV-a): S11/S12 packaging/extension guides; fuel/
  `--mapdir`/WASI-network scoping (m2); Jackson anecdote (m3); 3.10 validation
  version pin (m4); #5581 commit/message/date/quote (m5); desktop-host power
  direct citation (m6); S03/S05 primary confirm (m12). Must not harden into
  build assumptions.
- U4 No VS Code CVE/bypass chain verified — trust-layer threats cited at doc
  level only.
- U5 Performance envelope for "small" collections unmeasured (no runtime) —
  P3 size classes and the C6 durability bound need prototype calibration data.
- U6 Doc mutable drift observed: the critic's `node_modules` negative (19:20Z)
  vs the reviser's positive on the same URL (19:29Z, quoted verbatim in
  sources/). Build references must pin access dates; the R01 text governs for
  this final.

## 9. Method compliance (M09 v1 analogical-outline-interviews)

TWO analogous real workflows/product feature taxonomies retrieved: A1
OpenRefine librarian/data-cleaning workbench (local server, project store,
history-as-JSON-recipe, facets/clustering, view-vs-dataset exporters, project
archives with history, in-process Java extensions, offline core with explicit
network moments); A2 VS Code extension host + marketplace (manifest packaging,
engines minimum-host gate, desktop Node host vs WebWorker web host, workspace
trust tri-state + runtime API, VSIX offline bundles, supply-chain controls).
FOUR distinct inquiry lenses derived: L1 original user obligations (required,
brief-led); L2 sandbox & capability boundaries (from the A1-vs-A2 gap neither
workbench closes alone — the conditioned pivot to Deno/Wasmtime
deny-by-default is a legitimate analogy-gap move); L3 reproducibility/
provenance/migration (from A1 history/recipe/archive mechanics); L4
distribution/lifecycle/failure handling (from A2 packaging/trust/update plus
A1 release history). Grounded answer-conditioned follow-up inquiry conducted
in each lens (each later question visibly uses the preceding sourced answer;
chains L1-Q1→A1→Q2→A2→Q3, L2, L3, L4 as recorded in discovery and preserved via
F1–F6/V1–V7 above). Irrelevant analogy categories explicitly rejected per lens
(L1: reconciliation/Wikidata services, Sheets/Drive upload+OAuth, multi-project
tabs, language/debug contribution points except packaging patterns; L2: KV/
caches/localStorage carve-outs, FFI/subprocess-for-extensions, Wasmtime
serve/proxy hosting, remote/SSH host placement; L3: autosave tuning, heap
sizing, Drive upload, proposed-API cadence as heavyweight; L4: marketplace
scanning/verification/allow-lists as designed subsystems, multi-tab
concurrency, recon-service re-adding). One investigator context, same
tools/time; no added scouts or search cap. Obligations and discovered
alternatives mapped to lens/evidence (L1→F2/F3/P4/V2/V5/V7; L2→F1/P1/P2/V1;
L3→F2/F3/P4/P5/V2/V3; L4→P5/V3/V4/V6 + O3 chains). Ordinary full criticism and
revision applied at research (C1–C5 with two genuine reversals), critic
(M1/m1–m12), and reviser (§2) stages.

## 10. Obligation closure (O1–O6)

O1: unfamiliar tools found beyond the thin plan — OpenRefine (workflow), VS
Code web runtime + Workspace Trust (packaging/trust), Deno permissions +
Wasmtime/WASI (sandbox), Catmandu Fix (script-recipe alternative, snippet
level). Additive breadth probes (OS sandboxes, updater frameworks) noted in
PV-b, not O1 gaps. O2: consequential defaults/limits captured with units/types
(F1–F3: path-subtree, host[:port], var names, deny precedence, symlink rules,
web-runtime limits, export/history semantics; both module defaults stated;
suspect recon-microseconds value dropped; remainder carried at the verified
evidence grade). O3: primary issue→fix→release chain #5581→#5584→3.7 at issue
level with Chromium-only note (commit-level provisional, m5), plus
provisionally-fenced Jackson-migration and column-validation supporting chains;
gaps (U4, U3) stated. O4: exact per-P disposition in §1 (P1–P4 corrections,
P5 rejected-as-stated with pinned-upgrade replacement as user decision, P6
retained smoke test + suite correction; P3 values uncertain; already-covered
parts credited for P1/P3/P6). O5: alternatives/conditions/disagreement/
uncertainty retained above in full prose (§§3–6, §8), not ID references; the
offline-vs-upgrades disagreement retained with its resolution (versioned
offline bundles + explicit online check, never silent auto-update). O6:
executed (E1–E5) separated from proposed (V1–V7, PV-a, PV-b); no runtime
available stated honestly at every stage; scope kept to this small product
brief.

## 11. Evidence and lifecycle notes

Access windows: research 2026-10-09T19:08–19:24Z (S00–S12); critic
2026-10-09T19:20–19:22Z (C00–C05); reviser independent fetch 2026-10-09T19:29Z
(R01) plus predecessor reads 2026-10-09T19:28–19:31Z. Reviser source-map.json
holds the R-series provenance (exact URL, version-as-fetched, locator, access
timestamp, observed operations); sources/ holds the bounded R01 verbatim
excerpts with a navigable index; predecessor S/C excerpts were read in place
in the declared source roots and are restated — never merely cited — wherever
load-bearing. Source IDs immutable; no silent rebind; mutable web docs flagged;
stable released code preferred where relevant (closed issue + milestone for the
O3 chain). Usage/billing unobserved: null. No premium evaluator access; no
campaign/history/evaluator/counterpart read; no Git/repo/canon edits. The
science in this file plus source-map.json and sources/ was saved before native
Goal terminal completion; native/T3 completion is separate.
