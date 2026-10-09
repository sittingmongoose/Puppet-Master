# Critique — plugin-workbench (S09), A-M09-A control/critic

Method M09 v1 analogical-outline-interviews, critic stage. Competent
conventional brief-led investigator's discovery + plan-comparison draft,
checked against fresh primary evidence. No candidate repair beyond the
assigned recipe; no premium evaluator access; no campaign/history/
counterpart read. Critic demands can themselves be invalid; each finding
states the evidence and the residual uncertainty.

## Inputs inspected (complete)

- Brief: `/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/cases/S09/brief.md`
  (sha256 846bc817…8ec28cea). Desktop workbench for librarians: import,
  clean, compare small metadata collections; third-party transforms useful
  without unrestricted host access; reproducible preview, undo, offline
  export, future extension upgrades. Obligations O1–O6.
- `control/research/draft.md` (18934 bytes, sha256 703602e0…113d8adb) —
  read whole.
- `control/research/discovery.md` (20262 bytes, sha256 2d3976a7…705654) —
  read whole. Hash matches the value draft.md says the reveal gate
  recorded, so the freeze claim is at least self-consistent.
- `control/research/revealed-plan.md` (344 bytes, sha256 66bed5d9…cc43a317)
  — read whole. Exact thin plan:
  P1: Run extension scripts as child processes.
  P2: Pass the dataset path and output directory as arguments.
  P3: A timeout limits each extension.
  P4: Store output as the new dataset after success.
  P5: Load the newest extension version automatically.
  P6: Test with a sample formatter.
- `control/research/source-map.json` (sha256 44b5f9e3…8f7f11883,
  [S01]–[S14]) + all 14 files in `control/research/sources/` + its
  `index.md` — read whole.
- Fresh independent evidence for this critique: [C01]–[C11] in
  `source-map.json` + `sources/`, fetched 2026-10-09T19:19–19:21Z.

No code was executed. No qualified sandbox exists in this environment, so
no witness runs were attempted and none are claimed. All fetches were
read-only GETs of public docs/RFCs/registry metadata.

## Overall verdict

The draft's direction is sound and none of its six P dispositions is
wholly wrong: P1–P4 are rightly corrected, P5 is rightly rejected as
stated, P6 is rightly expanded. Four of its load-bearing primary claims
re-verify cleanly against fresh fetches (Deno, isolated-vm, OpenRefine
history mechanics, VS Code engines, Tauri wording, BagIt structure,
Wasmtime `--dir` position sensitivity). But the draft overstates three
things and under-designs four, and one O3 end-state claim is factually
false as written:

1. vm2 is NOT "gone": both 404s are wrong-URL artifacts and the npm 403
   is bot-blocking; the registry serves vm2 3.12.2 with tarball now
   (material M1).
2. The OpenRefine "schema-version precedent" for the operation log is not
   evidenced: 3.6 shipped downloadable history JSON + a Java 11 floor,
   neither of which is a schema-version field (material M2).
3. "Refuse activation with a naming error" and "enforce engine range at
   every call" over-read the VS Code engines doc and conflate a compat
   check with the Workspace Trust security bypass (material M3).
4. Child-process network/file denial, atomic commit, determinism, and the
   compare flow are under-designed; several validations do not transfer
   across the three candidate boundaries (materials M4–M7).

Details below. Minor findings (wording, citation hygiene, non-blocking
gaps) are separated at the end. Nothing in this critique repairs the
candidate; it only judges it.

## Per-P dispositions

### P1 "Run extension scripts as child processes" — draft: CORRECTION + CONDITION. Critic: AGREE in substance, PARTIAL in mechanism.

The core correction stands: a bare child process inherits the user's
authority (files, network, env, subprocess) and is not a sandbox. Deno's
own doc confirms the shape of the missing controls: subprocess and
native-code grants bypass the JS-layer sandbox entirely [C01], so a
boundary that permits either by default is no boundary.

Three qualifications:

- (M4) "No network access unless the manifest declares it" is not
  enforceable by spawn options alone on a desktop. Denying network to a
  child process needs OS machinery (Linux network namespace/seccomp +
  netfilter, macOS sandbox profile, Windows firewall/AppContainer/job
  restrictions), each with its own packaging and privilege story. The
  draft prices "locked-down child" as one option among three without
  naming any OS mechanism. The condition is necessary but not sufficient
  as specified; as written it risks a builder implementing
  `env -i` + closed FDs and believing the network is denied.
- Tauri-style "named per-command grants" govern frontend-webview → Rust
  commands [C06], not child-process syscalls. The analogy transfers as
  "small explicit host surface, default-deny", which is valid, but the
  draft's wording ("each extension gets explicit named permissions per
  command") suggests the Tauri permission file directly confines a child
  process. It does not. The enforcement point for a child is the
  supervisor + OS policy, not the Tauri capability file.
- "Either [WASM/WASI or V8 isolates] removes process-spawn overhead
  while keeping equivalent boundary properties" overclaims equivalence.
  A V8 isolate shares the host process (soft ~2–3x-exceedable memory
  guideline [C03], host-process fate on OOM/native crash, side-channel
  surface); a WASM guest has linear-memory confinement but host calls
  must still be budgeted explicitly; a child has OS fault isolation but
  ambient inheritance by default. These are three different risk
  profiles, not equivalent ones. The draft's own U5 admits no zero-risk
  option, which partly covers this, but the "equivalent" sentence should
  be struck.

No false rejection: rejecting bare-inheritance P1 is correct and
required by the brief ("without gaining unrestricted host access").

### P2 "Pass the dataset path and output directory as arguments" — draft: CORRECTION (security). Critic: AGREE, with two gaps.

Raw host paths do hand ambient authority to the extension, and the
Deno shape (deny by default, scoped grants, `--deny-*` wins over
`--allow-*`, catchable `NotCapable` [C01]) plus WASI preopens (host-side
`--dir` grants, position-sensitive, guest sees only granted roots [C08])
support the capability direction. The zero-grant baseline for pure
transforms is the right conformance default.

- (M4, shared with P1) "Resolve symlinks and confine `..` at the host"
  is correct but TOCTOU-naive if the extension keeps direct filesystem
  access: path-string checks race renames. Confinement needs
  handle-based access (open dir FD + `openat`, or a preopened WASI root
  the guest cannot escape) rather than string canonicalization per call.
  The pipe alternative (dataset over stdin, rows back over stdout)
  avoids this but needs framing/encoding/size/deadlock design the draft
  does not give.
- The "raw paths ONLY for first-party, fully-trusted" condition should
  be narrower: even first-party code benefits from the same capability
  path (defense in depth against traversal bugs and against a trusted
  extension later loading an untrusted dependency). A carve-out that
  reintroduces ambient paths for anyone keeps the exact code path the
  hostile suite must then exempt. Prefer: same boundary for all, with
  first-party manifests allowed broader (audited) grants — not a
  different mechanism.

No false correction: P2-as-written must not ship for third-party code.

### P3 "A timeout limits each extension" — draft: ALREADY-COVERED intent + CORRECTION. Critic: AGREE.

A lone wall-clock timeout that merely stops waiting is indeed not a
limit, and time alone does not bound memory, CPU burn, disk fill, fork
abuse, or partial writes. The three-budget replacement (time with true
preemption, memory cap, output-size cap, named fired budget) is the
right shape. Wasmtime documents fuel (deterministic instruction budgets)
and epoch interruption (wall-clock preemption) plus stack/memory
reservation/guard sizing on the embed `Config` surface [C09-note: draft
cites v51.0.0-dev docs; stable at access is v49.0.2 — see minor m3],
and isolated-vm documents CPU/wall time in nanoseconds with a soft
memory guideline [C03]. The soft-vs-hard distinction the draft draws
(V8 approximation vs WASM fuel exactness) is faithful to the sources.

Two applicability notes (folded into M6/M7 rather than separate
rejections):

- Fuel determinism covers guest instructions; host-function costs must
  be charged explicitly by the embedder or a transform can hide work in
  host calls. "Deterministic fuel budgets are the stricter option for
  reproducible previews" is true only with host-call accounting.
- For the child-process candidate, "report which budget fired" requires
  supervisor-side accounting (cgroup/rss sampling, wall timer, output
  byte counting, signal/exit interpretation). Exit codes and signals
  alone do not distinguish OOM from timeout from crash. The draft
  states the requirement but not the mechanism; builders should not
  discover this at integration time.

### P4 "Store output as the new dataset after success" — draft: CORRECTION (data integrity). Critic: AGREE in direction, PARTIAL in precedent and completeness.

Bare overwrite-on-success does destroy provenance, break undo, and
mistake exit 0 for transformation correctness. The operation-log
replacement (validate-before-commit, append-only versions, undo pointer,
dry-run preview with byte-identical commit) is well chosen, and the
OpenRefine mechanics it cites re-verify: step 0 is creation and cannot
be undone; moving back then operating erases the greyed redo tail;
position shown as m/n; Extract encodes the prefix as JSON; autosave and
offline local-server posture confirmed [C04].

- (M2, shared with P5) The "proven by OpenRefine" framing is one step
  too strong in two places. First, OpenRefine's step-0-pinned semantics
  fit a project-creation model; whether *import* should be un-undoable
  in the workbench (mis-imported file is a plausible librarian error) is
  a product decision, not a precedent entailment. Second, "history
  travels with exported project archives" describes OpenRefine's
  project tar archives, while the draft's export is a BagIt package
  [C07]; the draft does not say whether these are one artifact or two
  (internal durability format vs interchange format) and what history
  subset each carries. Copying the pointer semantics is fine; copying
  them without the import-undo and two-artifact decisions is incomplete.
- (M5) Three load-bearing requirements are named but not designed:
  atomic commit (needs write-temp + rename + fsync file-and-dir on each
  desktop OS, plus crash-recovery for a torn rename); storage growth
  (append-only versions of "small" collections still need compaction/GC
  and quota behavior); byte-identical preview-vs-commit (needs a
  determinism obligation on extensions — no wall-clock/random/hash-order
  dependence — plus canonical serialization for comparison: JSON key
  order, CSV newline/encoding, float formatting). Without these, "exit 0
  AND validates AND committed atomically" is a slogan, not a rule.

No false correction: P4-as-written must not ship.

### P5 "Load the newest extension version automatically" — draft: REJECTED as stated, replaced with gated upgrade. Critic: AGREE with the rejection, DISAGREE with two replacement details (M2, M3).

Silent auto-newest does break the brief's reproducibility promise and
admits breaking/compromised updates without consent or record. Pinning
per project (ID + exact version + content hash), a mandatory engine
range, and explicit upgrade-with-re-preview are the right replacement
shape. The VS Code engines citation re-verifies: `engines` is required,
must contain at least `vscode`, cannot be `*`, e.g. `^0.10.5` as a
minimum host version [C05].

- (M3) "The host refuses to ACTIVATE — not merely to install —
  anything outside its supported range, with a naming error" is
  unsubstantiated in both halves. The engines doc states the compat
  declaration mechanism, not the enforcement point (install vs
  activation vs every call) and not any "naming error" — that phrase
  appears nowhere in the cited source and names no UX the draft defines
  (dialog text? error code? log line?). Further, the justification
  ("the 2026 Workspace Trust bypass showed install-time-only branching
  on self-declared manifest flags is defeatable") conflates two
  different mechanisms: Workspace Trust is a *security* gate over
  untrusted folders (enforcement-point critique: valid), while an
  engine range is a *compatibility* declaration (threat model: crash or
  misbehavior from API skew, not privilege escalation). Enforcing a
  compat range "at every activation/call" may be reasonable as
  defense-in-depth, but the bypass report does not entail it, and the
  draft does not price the cost (range check per transform call vs per
  activation vs per install). The enforcement point should be: refuse
  install AND refuse activation with a named, user-readable compat
  error; per-call rechecks only if extensions can hot-update without
  re-activation.
- (M2) "Version the operation-log schema separately … (OpenRefine
  precedent: the JSON recipe is a compatibility promise; its 3.6
  release made history JSON directly downloadable and raised the
  runtime floor)" claims a precedent the evidence does not show. 3.6
  did make history JSON downloadable (#4498) and did raise the floor
  to Java 11 [C11] — but neither is a schema-version field, and the
  cited sources show no `schemaVersion`/`recipeVersion` member or
  migration table. Versioning the log schema is still good advice, but
  it is the draft's own design conclusion, not an OpenRefine
  precedent. Present it as such.
- Lockfile "content hash" needs a canonical-bytes definition (hash of
  what: the shipped WASM bytes? the VSIX/zip? the extracted dir? with
  what normalization?), plus a distribution story: how pins and hashes
  are obtained securely (registry signing? side-loaded trust-on-first-use?).
  The draft is silent on distribution/signing (see Omissions).

The rejection itself is not false: P5-as-stated contradicts the brief
and must not ship. The user-decision carve-out (opt-in semver auto-update,
default OFF, recorded in history) is correctly scoped.

### P6 "Test with a sample formatter" — draft: ALREADY-COVERED intent, INSUFFICIENT scope, expand to conformance suite. Critic: AGREE.

A happy-path sample is the right first test and proves nothing about
boundaries, budgets, undo, offline, or upgrades. Promotion to hostile +
contract + lifecycle samples is correct and proportionate to the brief.
The "dependency probes permissions at import vs run time" lifecycle case
correctly reflects the Deno static-graph exemption (initial static
graph loads without permission checks; non-literal dynamic imports are
runtime-checked [C01]).

Applicability caveat (M6): the suite as specified is boundary-generic in
wording but Deno-shaped in failure modes ("must fail closed with typed,
catchable errors", `NotCapable`-equivalent). For the child-process
candidate the failure mode is exit/signal/stderr, not a catchable
exception; for WASM it is a trap; V6 (import-vs-run) applies only to a
JS-module runtime. Each sample needs per-boundary expected signals, or
the suite will be un-runnable as specified against two of the three
candidate boundaries.

## Discovery and alternatives (O1–O3)

O1 breadth is good for the scope: WASM/WASI capabilities, Deno flags,
V8 isolates, the vm negative result, OpenRefine history, VS Code
engines/trust, Tauri permissions, Zotero corpus shape, BagIt export —
each maps to a brief requirement, and the "retain alternatives with
conditions" discipline is honored (notably the unresolved
isolates-vs-WASM fork with adoption risks on both sides).

- WASI/Deno/isolates core claims re-verify [C01][C03][C08]. Genuinely
  missing alternatives are second-order for this scope (OS sandboxes:
  Bubblewrap/sandbox-exec/AppContainer; no-code transform DSLs such as
  GREL/JsonLogic; signed-update frameworks such as TUF) — worth one
  sentence in a revision, not a material omission at this product size.
- The vm negative result stands: Node documents `node:vm` as "not a
  security mechanism — do not use it to run untrusted code" [C02].
- Zotero (snippet-observed [S13]) is the weakest O1 leg: entry-point
  names and corpus shape are asserted from search snippets without a
  fetched primary page. The draft uses it only for "social shape …
  inside the app's trust domain … pair with a real boundary", which is
  appropriately hedged — but a revision should either fetch the
  translator docs or demote this to an illustrative aside. Minor (m4).
- Tauri wording re-verifies verbatim ("Permissions are descriptions of
  explicit privileges of commands") [C06], but the predecessor admits
  deep command-scope syntax was not pulled [S07]. The draft's reliance
  is appropriately shallow (posture + pattern, not syntax), so this is
  citation hygiene, not a factual error. Minor (m4).

O2 table: the ten rows re-verify on every point this critic re-checked
(Deno defaults/scoping/deny-wins/bypass perms/static-graph [C01];
isolated-vm 128 MB default / 8 MB min / ~2–3x soft / ns CPU+wall /
Node lockstep / `--no-node-snapshot` / maintenance mode [C03];
OpenRefine steps/autosave/Extract [C04]; engines required/no-`*` [C05];
Tauri default-deny posture [C06]; BagIt required elements and
complete-vs-valid [C07]; Wasmtime `--dir` position sensitivity [C08]).
The cross-cutting "every sound boundary is deny-by-default" induction
is fair on the surveyed set. Two transfer gaps belong here rather than
in O2's accuracy: Tauri-permissions→child-process and
NotCapable→trap/exit-signal, both covered under M4/M6.

O3 chain 1 (vm2) is where the draft fails factually:

- (M1) End-state "gone" is false. Both GitHub 404s reproduce at
  re-check (2026-10-09T19:20:26Z), BUT the live npm registry serves
  `vm2@3.12.2` with acomplete packument, tarball, and repository
  `git+https://github.com/patriksimek/vm2.git` [C10]. The 404'd owner
  `patriksletmo` is not the registry-recorded owner `patriksimek`
  (one-letter difference: letmo vs simek); the 404s are consistent
  with fetching the wrong owner URL (plus an unconfirmed successor
  path `vm2js/vm2`), not with deletion. The npmjs.com 403 also
  reproduces — to a plain `curl -I` without browser headers — while
  the registry API returns 200 to a plain GET with an Accept header;
  the 403 is bot-mitigation on the website, not package removal.
  Corroborating internal tension: the draft simultaneously reports
  "3.11.5 is the FINAL release" (flow-wiser snippet [S10]) and
  "update to 3.12.1 or later" (CVE-2026-93605 [S14]) plus 3.11.6 in
  CVE-2026-92948's affected range — a package with 3.12.x releases
  cannot have ended at 3.11.5. The deprecation-treadmill *direction*
  (June 2023 deprecation reports, wrapper-escape pattern, migrate-to-
  isolates guidance) is multiply attested and the draft's design
  conclusion (never build on same-process JS wrapping) remains correct
  and independently supported by [C02][C03]; but "both known repo URLs
  returned 404 … downstream auditors now say remove entirely" as proof
  of disappearance must be retracted and replaced with: repo URLs
  unverified (owner mismatch), registry live at 3.12.2 on 2026-10-09,
  deprecation status to be re-verified against the registry `deprecated`
  field / packument `time` (the `/latest` doc alone carries no
  `deprecated` string) before any publication.
- CVE specifics (CVE-2026-22709 Promise-sanitization bypass fixed in
  3.10.2; CVE-2026-92937 incomplete fix; CVE-2026-92948 `node:test`
  allowlist bypass CVSS 9.9; CVE-2026-92944/92956 V8-14.6 protector
  staleness; CVE-2026-100721 path-prefix; CVE-2026-93605
  child_process RCE) are all snippet-observed without NVD/CVE-page
  verification — a limitation the predecessor states honestly ([S14],
  draft U6) and this critic did not have time to close per-CVE. For an
  internal plan comparison the multi-reporter directional evidence
  suffices for the "treadmill" conclusion; for anything published
  outside the experiment each CVE needs its NVD/advisory page. No
  false correction arises from this: the draft already demands
  re-verification (U6). Minor (m1).

O3 chain 2 (Workspace Trust bypass) is snippet-observed ([S06]) and the
draft leans on it for a cross-mechanism enforcement conclusion (see M3).
The bypass *pattern* (self-declared manifest support + install-time-only
branching) is plausible and the "enforce at call time" lesson is sound
for *capability* grants — but the draft applies it to *version-range*
enforcement without a threat model. Downgrade from "showed … is
defeatable" (as a general premise) to "reportedly showed … for trust
gates; verify against the primary report before extending to compat
gates". Material only via M3; the chain itself is minor (m1).

O3 chain 3 (OpenRefine 3.6) re-verifies on both facts (Java 11 floor;
downloadable history JSON #4498) against the primary release page
[C11]. The absence/inapplicability notes (no WASI/Deno escape chain in
scope; no workbench history since greenfield; usage/billing null) are
honest. Usage/billing for this critic's sources is likewise null (all
public docs/RFCs/registry metadata, no billing surface).

## Omissions (brief-relevant, not covered or under-covered)

- O-a (compare flow): the brief's third verb is "compare small metadata
  collections", but the draft designs preview-diff (before/after one
  transform) and never a two-collection compare (two-input transforms,
  join/diff entry points, compare UI). A transform API shaped only as
  `transform(rows) -> rows` cannot express compare. Material (M7).
- O-b (librarian grant UX): deny-by-default plus per-extension grants
  implies permission prompts for non-programmers. The draft never
  designs the prompt surface (what the librarian sees, when approval is
  per-use vs per-project, how "request export / request network" reads
  to a non-technical user, consent fatigue). For this user population
  the grant UX is load-bearing, not polish. Material (M7).
- O-c (distribution/signing): pins + content hashes assume a secure
  distribution channel. No registry/marketplace/side-load story, no
  signature verification, no offline-install story (can a librarian
  install or update an extension with no network? what is cached?).
  Material (M7).
- O-d (malicious output): the boundary analysis covers malicious *code*
  reaching the host, but not malicious *output* reaching the librarian
  or the next tool: CSV/formula injection in exports, HTML/JS in
  preview rendering (XSS via crafted cells), malicious filenames in
  BagIt tags. Preview rendering and export encoding need an
  output-sanitization rule. Material (M7).
- O-e (second-order, minor): no performance envelope for "small"
  (U3 correctly carried); no accessibility/i18n note for diff/undo UX;
  no extension crash-loop UX (poison project that fails every load).
  Minor (m5).

## Validation applicability (O6)

The executed-vs-proposed split is honest (read-only fetches, statuses
recorded, no runtime claimed) and matches this critic's own position.
The seven proposed validations are discriminating in intent, but three
applicability repairs are needed:

- (M6) Per-boundary expected signals: V1 (typed catchable error) and
  V2 (named fired budget) must specify the signal per candidate —
  Deno `NotCapable` / trap / exit-code+supervisor-accounting — or the
  suite cannot run against the child and WASM candidates as written.
- V3 (byte-compare round-trip) needs canonical serialization (JSON key
  order, CSV dialect, float/encoding rules) plus a determinism
  obligation on extensions; V4 (BagIt re-verify on a second machine)
  should name the verifier (e.g. a BagIt validation tool + manifest
  algorithm, SHA-512 per the draft's F5) rather than "independently
  re-verify". Fold into M5/M6.
- V7 (CI on every boundary change) should trigger on *runtime* releases
  too (the vm2 lesson is that each V8/Node release can re-open a
  wrapper boundary; the same holds for Wasmtime/V8 bumps under a
  WASM/isolate boundary): pin the runtime matrix and re-run V1–V6 per
  runtime version, not only per boundary-code change. Minor-but-sharp
  (m2).

No validation is claimed executed that was not; no invented run exists
to retract. The "no runtime available is honest" standard (O6) is met.

## Findings inventory

Material (must fix before build; each blocks on correctness,
security, or runnability):

- M1 (false end-state): retract vm2 "gone" (wrong-owner 404s + website
  403 misread as deletion; registry live at 3.12.2 [C10]); reconcile
  "FINAL 3.11.5" against 3.12.x evidence; re-verify deprecation from
  the packument before publication. Design conclusion (no JS-wrapper
  boundary) stands on [C02][C03].
- M2 (false precedent): demote OpenRefine "schema-version precedent"
  to author proposal; 3.6 evidence shows downloadable JSON + Java 11
  floor [C11], not a schema-version field. Separately decide import-undo
  and internal-archive-vs-BagIt-export artifact split.
- M3 (over-read enforcement): replace "refuse activation with a naming
  error" + "enforce engine range at every call" with: refuse install
  AND activation with a named user-readable compat error; per-call
  rechecks only under hot-update; do not cite the trust bypass for a
  compat gate without the primary report.
- M4 (under-specified denial): name the OS mechanism for child
  network/file denial per desktop OS (or drop "locked-down child" to a
  non-goal); replace path-string `..`/symlink checks with handle-based
  confinement; design the stdin/stdout batch transport (framing,
  encoding, limits, deadlock) or drop it.
- M5 (under-specified commit): specify atomic commit (temp+rename+fsync
  per OS + crash recovery), version retention/GC/quota, canonical
  serialization, and the extension determinism obligation behind
  "byte-identical preview".
- M6 (validation transfer): give V1/V2/V6 per-boundary expected signals
  (exception vs trap vs exit+accounting); scope V6 to JS runtimes; name
  the V4 verifier.
- M7 (brief gaps): design the compare flow (two-input API + UI), the
  librarian grant-prompt UX, distribution/signing + offline install,
  and output sanitization (formula/XSS/filename).

Minor (should fix in a revision; none blocks the direction):

- m1 (citation depth): per-CVE NVD/advisory verification and primary
  Workspace-Trust-bypass fetch outstanding — already disclosed (draft
  U6, [S14]/[S06]); required only before external publication.
- m2 (V7 trigger): run the hostile suite per runtime release in the
  pinned matrix, not only per boundary-code change.
- m3 (version hygiene): re-cite Wasmtime embed surface against stable
  (v49.0.2 at access [C09]) rather than v51.0.0-dev docs [S11]; confirm
  `consume_fuel`/`epoch_interruption`/guard-size names on stable.
- m4 (thin legs): fetch primary pages for Zotero translator docs and
  Tauri command-scope syntax, or demote both to illustrative asides.
- m5 (second-order gaps): performance envelope for "small", crash-loop
  UX, accessibility/i18n of diff/undo.

## Uncertainty carried (agreed + amended)

- U1 (host stack) / U2 (threat model) / U3 ("small") / U4 (network
  reconciliation): agreed as carried; the draft's choice to price the
  malicious case is reasonable for third-party code, but the
  grant-prompt UX (O-b) must then be designed for it — "assume
  malicious" without a usable consent surface just moves the failure.
- U5 (no zero-risk boundary): agreed; amend "equivalent boundary
  properties" (P1) to three distinct risk profiles.
- U6 (snippet-observed CVEs): agreed; this critique adds the registry
  correction (M1) and the per-CVE NVD requirement (m1), plus the
  trust-bypass primary-fetch requirement (M3/m1).
- New U7 (vm2 repo canonical URL): the registry-recorded repo is
  `patriksimek/vm2` [C10]; the 404'd `patriksletmo/vm2` and
  `vm2js/vm2` URLs are unverified as "known" locations. Do not assert
  deletion, rename, or succession without resolving the owner
  mismatch (possible confusable: letmo/simek) against the packument
  `repository` + `time` fields and a fetched repo page.
- New U8 (engine enforcement UX): "naming error" is undefined; the
  compat-refusal UX (message, code, recovery path for pinned projects)
  is undesigned.

## What the draft got right (retained without change)

- Deny-by-default posture and zero-grant baseline; Deno bypass-perm
  treatment (run/FFI as privileged grants) [C01].
- Operation log unifying undo + reproducible preview + recipe sharing;
  OpenRefine pointer/Extract/autosave mechanics [C04].
- Silent auto-update rejection with pinned lockfile + explicit
  upgrade-with-re-preview; engines-required direction [C05][C11].
- Happy-path-to-conformance-suite promotion for P6, including the
  static-graph lifecycle probe for JS runtimes [C01].
- Honest executed/proposed split with no claimed runs.

*Critic: A-M09-A control/critic, 2026-10-09. Predecessors: draft.md
703602e0…113d8adb, discovery.md 2d3976a7…705654, revealed-plan.md
66bed5d9f…cc43a317, research source-map.json 44b5f9e3…8f7f11883;
brief 846bc817…8ec28cea. Fresh evidence [C01]–[C11] per source-map.json.*
