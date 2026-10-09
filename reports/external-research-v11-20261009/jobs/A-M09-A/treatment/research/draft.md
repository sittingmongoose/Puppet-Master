# ER11 A-M09-A treatment research — Draft (S09 plugin-workbench)

Self-contained planning deliverable for the S09 scope. Compares the exact revealed thin plan
(P1–P6) against pre-reveal discovery (frozen: discovery.md + source-map.json + sources/).
Later stages may correct this draft. Disposition vocabulary: already-covered, correction,
optional enhancement, user decision, rejected, uncertain.

Revealed thin plan (verbatim, via reveal-plan.py):
P1: Run extension scripts as child processes. P2: Pass the dataset path and output directory as
arguments. P3: A timeout limits each extension. P4: Store output as the new dataset after success.
P5: Load the newest extension version automatically. P6: Test with a sample formatter.

## 1. Exact per-P disposition

### P1 — Run extension scripts as child processes → CORRECTION (keep mechanism, add boundary)

Already-covered part: one process per extension run is the right isolation mechanism and matches
the discovery recommendation (row transforms in a deny-by-default child, L2-A3).
Correction: a child process alone is NOT a sandbox. The desktop VS Code extension host is a
separate process yet holds the user's full filesystem/network power — its process wall is a
stability boundary, not a security boundary — and Deno with --allow-all is documented as having
"the same security properties as running a script in Node.js (ie none)". So P1 as stated lets a
transform read ~/.ssh, exfiltrate the collection over the network, or encrypt the user's files,
all from its "child process". Required corrections:
(a) deny-by-default capability profile: no filesystem/network/env/subprocess except explicitly
declared and install-time-approved grants (Deno --allow-*/--deny-* shape; Wasmtime --dir/--mapdir
preopen shape); (b) no inherited secrets: scrubbed environment, neutral cwd, no user token
passthrough; (c) data crosses the boundary by least-privilege handle (see P2), never by ambient
host paths; (d) failure semantics: kill on violation with a capability error (Deno NotCapable
shape), partial output discarded, violation logged against extension id+version.

### P2 — Pass the dataset path and output directory as arguments → CORRECTION (least-privilege handles)

Correction: raw host paths confer ambient authority. An extension handed the live dataset path can
read sibling files, follow symlinks out of the granted tree (Deno checks the link location, so a
permitted dir containing a hostile symlink still exposes the target, with only /proc|/dev|/sys
and */environ specially guarded), and race the host's own writes; an output directory it shares
with other runs lets it clobber or read other outputs. Required corrections: (a) input is a
read-only snapshot (frozen copy with content hash, or a row stream over stdio), never the live
collection; (b) output is a fresh empty per-run scratch directory, promoted to a new dataset
version only after validation (see P4); (c) pass snapshot id + content hash + recipe context, not
just paths, so preview and replay are pinnable; (d) declare any extra input roots read-only in the
manifest and approve at install/update. The VS Code web-runtime shape is the model: guest code sees
only a mediated virtual filesystem through a host API, never host paths.

### P3 — A timeout limits each extension → CORRECTION (timeout kept, resource envelope added)

Already-covered part: bounding extension runtime is correct and retained.
Correction: a wall-clock timeout alone does not bound memory, CPU burn, fork bombs, disk fill, or
network use, and says nothing about units, scaling, or kill semantics. Required corrections:
(a) full resource envelope: wall timeout (seconds, stated per collection-size class, e.g. small
collections default with documented override) PLUS memory cap (MB) and, where the runtime supports
it, instruction fuel (Wasmtime fuel shape); (b) kill semantics: SIGKILL-equivalent on expiry, no
grace-period writes to the output dir after expiry; (c) partial output from a timed-out run is
discarded, never promoted; (d) timeout/fuel exhaustion recorded in the operation history as a
failed attempt (visible, re-runnable), not silent. Uncertain (see §5): exact default seconds —
depends on host runtime choice; must be set with units and a size-scaling rule before build.

### P4 — Store output as the new dataset after success → CORRECTION (versioned commit, not overwrite)

Correction: blind overwrite destroys undo, provenance, and privacy simultaneously. Discovery shows
the correct shape is OpenRefine's: history persisted WITH project data across restart and archive
re-import, operations extractable as a JSON recipe and re-appliable, replay conditional on
validation (3.10 validates column dependencies before applying operations), and project archives
carrying prior-step data with an explicit do-not-share-when-anonymizing caution. Required
corrections: (a) every successful run appends an operation record — extension id+version, host API
version, input snapshot hash, parameters, facet/filter state, exporter + per-column output mode —
and the prior dataset stays restorable (undo = walk back the record chain); (b) output validated
before commit (schema/column check; refuse-and-show-diff on mismatch, never silent coerce);
(c) preview and commit are distinct actions sharing one code path: preview names the full tuple
(snapshot id + recipe hash + facet/filter + exporter + column modes) so it is byte-reproducible;
(d) export offers "recipe-only share" (no row data) versus "archive share" (contains prior-step
data) with a privacy warning and confirm step.

### P5 — Load the newest extension version automatically → REJECTED as stated; replaced by pinned upgrades (user decision)

Rejected: silent auto-upgrade is the reproducibility enemy. Observed breakage: OpenRefine 3.2
swapped org.json for Jackson and forced most extensions to migrate; extensions are pinned to host
library versions at runtime; the safe pattern is VS Code's engines.vscode minimum-host gate plus
versioned API, where old hosts refuse new extensions instead of running them wrongly. Auto-load-
newest would silently change the meaning of saved recipes and previews. Replacement (user
decision): (a) every saved recipe/preview pins extension id+version AND host API version;
(b) updates install side-by-side; the pinned version stays runnable until the user re-pins;
(c) upgrade is an explicit user action showing capability-diff (new permissions requested),
compat result, and a diff preview of golden outputs; replay across a major API bump without
re-pin is refused, never silently rewritten. Optional enhancement (not required): auto-CHECK with
user notification (badge "v2 available"), which preserves offline-first while keeping users
informed — check-on-explicit-action only, never background silent fetch.

### P6 — Test with a sample formatter → ALREADY-COVERED direction, INSUFFICIENT alone → CORRECTION via discriminating suite

Already-covered part: a sample formatter as first smoke test is retained — it exercises the
end-to-end path (install → run → preview → commit → export).
Correction: one happy-path sample cannot discriminate any of the brief's hard requirements
(sandbox, determinism, migration, privacy, offline). It stays as smoke test T0; the plan must add
the discriminating validations in §6 (V1–V7), each with pass/fail teeth: sandbox escape attempts
must fail closed; fixed tuple must yield byte-identical preview; version bump without re-pin must
refuse; golden pairs gate install/upgrade; nbsp/unicode merge must not corrupt; offline exports
must equal online exports; recipe-only share must contain no row data.

## 2. Retained findings (from frozen discovery, restated in full)

- F1 Sandbox shape: deny-by-default child with explicit capability grants is the only observed
  shape satisfying "useful without unrestricted host access". Concretely: no fs/net/env/subprocess
  unless granted; fs grants are path-scoped with directory=subtree; net grants are host[:port]
  scoped; deny overrides allow; full-allow is a documented sandbox-off switch. Declarative trust
  gating (true/false/limited + withheld workspace settings + isTrusted API, defaulting to disabled
  when undeclared) is a valuable UX layer but is not isolation and must never be presented as such.
- F2 Reproducibility tuple: preview/replay is defined by (input snapshot id + operation recipe
  hash + facet/filter state + exporter + per-column output modes + extension id/version + host
  API version). Anything less is not checkable.
- F3 History model: operation history persisted with project data; restart-safe; archive-portable
  (.tar.gz with history, without view state); recipe extractable as JSON and re-appliable subject
  to validation; archives leak prior-step data (privacy gate required).
- F4 Failure modes to regression-test: UI-path data corruption (cluster-merge nbsp rewrite,
  Chromium-only, caused by reading merged values back from rendered DOM instead of the model;
  fixed by not inserting nbsp into committed values); recipe-apply fragility across
  renamed/missing columns (fixed by pre-apply dependency validation); host-upgrade extension
  breakage (org.json→Jackson migration).
- F5 Script-recipe alternative: Catmandu Fix (per-record transform scripts over
  Importer→Fix→Exporter/Store streaming, MARC/MODS/JSON/CSV, built by/for librarians) is a
  materially different authoring model from GUI-history recipes: hand-authorable, diffable,
  version-controllable. The workbench should keep both: canonical JSON recipe with a human-readable
  projection.
- F6 Offline-first with explicit online moments: core import/clean/compare/preview/undo/export
  works with no network; network appears only as a declared capability (named hosts) and as an
  explicit user action (fetch update, authorized upload), degrading to explicit error otherwise.

## 3. Conditions and constraints (original + discovered)

- C1 Third-party transforms must be useful but bounded (brief) — enforced by F1, tested by V1.
- C2 Small metadata collections, librarian users (brief) — UX must not require CLI fluency;
  capability prompts and privacy warnings in plain language; script view optional, never required.
- C3 Reproducible preview, undo, offline export, version upgrades (brief) — enforced by F2–F4, F6.
- C4 No silent data change anywhere: no silent replay across versions (P5), no silent coercion on
  commit (P4), no silent auto-update (P5), no view-state masquerading as data (F3).
- C5 Privacy: prior-step data never leaves the machine without an explicit warned action (F3, V7).

## 4. Alternatives retained (not chosen, not discarded)

- ALT-A Trusted in-process extensions (OpenRefine Java shape): simplest to build, richest API
  access — violates C1 (host-process privileges, no boundary). Retained only if the brief's
  sandbox clause is ever relaxed by user decision; currently NOT recommended.
- ALT-B Declarative-trust gating only (desktop trust shape): cheap, good UX — violates C1 alone
  (gates activation, does not bound running code). Retained as a UX layer OVER the sandbox (F1).
- ALT-C Recommended: deny-by-default capability sandbox (Deno/Wasmtime/web-runtime shape) + pinned
  recipes + golden-pair gates. Satisfies C1–C5.
- ALT-D Recipe authoring: GUI-history-derived JSON (OpenRefine) vs hand-authored Fix scripts
  (Catmandu) vs hybrid (recommended: canonical JSON + readable projection, F5).

## 5. Optional capabilities and user decisions

User decisions (need Jared/product call, not derivable from research):
- UD1 Host runtime for the workbench shell and sandbox (options: Tauri + sidecar sandbox,
  Electron + utility-process sandbox, native + Wasmtime/Deno sidecar). Research constrains the
  shape (F1) but does not pick the stack.
- UD2 Recipe grammar: canonical JSON field set + human-readable projection syntax (ALT-D hybrid
  endorsed, exact grammar open).
- UD3 Default timeout seconds + memory MB per collection-size class (P3 uncertain values).
- UD4 Distribution channel: OS/store-signed bundles vs direct download (determines which
  supply-chain controls exist; the workbench itself runs no malware-scan infrastructure).
Optional capabilities (explicitly NOT in scope unless chosen): reconciliation/Wikidata-style
network services; Google Sheets/Drive upload + OAuth; multi-project tabs; proposed-API staging
cadence; FFI/subprocess for extensions; extension-to-extension calls.

## 6. Validations: executed vs proposed (discriminating)

Executed this run (doc/code-read checks only; no runtime available; no witness sandbox used):
- E1 Fetched and excerpted 12 sources (S00–S12) with locators and access timestamps; excerpts in
  sources/. No runtime, no downloaded executables, no installs.
- E2 Answer-conditioned inquiry chains completed in all four lenses (L1–L4) with irrelevant
  analogy categories explicitly rejected; criticism pass C1–C5 applied (trust≠sandbox rejected,
  history-only revised, offline-vs-versions revised, recipe-format held open, VSIX flagged).
- E3 Plan reveal performed exactly once via the declared gate after discovery freeze; discovery
  not rewritten after reveal (frozen sha recorded in plan-reveal.json).
Proposed (none executed; each discriminates a requirement; all runnable offline except where noted):
- V1 Sandbox escape: transform attempts host-file read, socket open, scratch-escape write → must
  fail with capability error; same transform on granted paths succeeds. Discriminates F1 from C1
  theatre. (Needs runtime.)
- V2 Replay determinism: fixed F2 tuple ⇒ byte-identical preview across runs and restart; mutated
  facet state visibly changes preview. Discriminates F2 from history-only claims.
- V3 Version-bump refusal: recipe pinned to v1 replays; after v2 install, replay without re-pin
  refused or diff-previewed, never silently rewritten. Discriminates P5 replacement from auto-load.
- V4 Golden-pair gate: per-transform golden input→output runs on install/upgrade and offline;
  failure blocks activation with diff shown. Discriminates tested lifecycle from install-and-hope.
- V5 UI-readback regression (from #5581): merge options containing spaces/nbsp/lookalike unicode
  commit model values, not DOM text; unselected characters bit-identical. Discriminates model-commit
  from render-readback. (Needs UI harness; run on Chromium AND Firefox given the browser split.)
- V6 Offline parity: offline-capable exports byte-identical with network on vs off; network-needing
  transforms error explicitly. Discriminates F6 from accidental-online.
- V7 Archive privacy gate: recipe-only share contains zero row bytes; archive share requires
  warned confirm. Discriminates C5 from naive dump.
- PV-a Primary-confirm pass: verify S12 (VSIX layout/install/engines semantics) and S11 (exact
  extension-authoring API surface) against primary docs/source before build; until then both stay
  provisional.

## 7. Uncertainty register

- U1 Exact sandbox runtime (UD1) undecided — affects P3 values, V1 mechanics, packaging.
- U2 Recipe grammar (UD2) open — affects F5 implementation, V2 byte-compare scope.
- U3 S11/S12 provisional (PV-a) — flagged in source-map; must not harden into build assumptions.
- U4 No VS Code CVE/bypass chain verified this run — trust-layer threats cited at doc level only.
- U5 Performance envelope for "small" collections unmeasured (no runtime) — P3 size classes need
  calibration data from a prototype.

## 8. Obligation closure (O1–O6)

O1: unfamiliar tools found beyond the thin plan — OpenRefine (workflow), VS Code web runtime +
Workspace Trust (packaging/trust), Deno permissions + Wasmtime/WASI (sandbox), Catmandu Fix
(script-recipe alternative). O2: consequential defaults/limits captured with units/types
(§2 F1–F3, discovery §4). O3: primary issue→fix→release chain #5581→#5584→3.7 with commit +
browser note, plus Jackson-migration and column-validation supporting chains; gaps (U4, U3)
stated. O4: exact per-P disposition in §1 (2 already-covered-partly, 5 corrected, 1 rejected with
replacement, P3 values uncertain). O5: alternatives/conditions/disagreement/uncertainty retained
above in full prose, not ID references. O6: executed (E1–E3) separated from proposed (V1–V7, PV-a);
no runtime available stated honestly; scope kept to this small product brief.
