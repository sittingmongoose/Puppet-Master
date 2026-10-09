# ER11 A-M09-A treatment critic — Critique (S09 plugin-workbench)

Critic stage, method M09 v1. Inspected in full: own-arm `discovery.md`, `draft.md`,
`source-map.json` (S00–S12), `revealed-plan.md`, the exact brief (O1–O6), all 12 predecessor
source excerpts in the declared source root, plus independently re-fetched primary pages
C01–C05 (see `source-map.json` + `sources/index.md`). No campaign/history/evaluator/counterpart
read, no nested agents, no runtime (doc/code-read checks only; no witness sandbox used or
claimed). Access window (critic fetches): 2026-10-09T19:20–19:22Z.

## 1. Verdict

- **All six P dispositions STAND.** No false correction, false rejection, or omitted
  must-correct defect found. Consequential load-bearing facts re-verified against primary
  sources (C01–C05).
- **Material findings: 1** (M1: `run`/`ffi` grants void isolation — a requirement the draft's
  P1 correction must add; affects manifest design and UD1).
- **Minor findings: 12** (m1–m12: evidence-grade qualifications, unconfirmed details, nits).
  None overturns a disposition; several mark draft claims provisional pending primary confirm.
- Critic demands below can themselves be invalid; each finding states its evidence, its
  uncertainty, and what would overturn it.

## 2. Method compliance (M09 v1 analogical-outline-interviews)

Followed. TWO analogous real taxonomies retrieved (A1 OpenRefine workbench, A2 VS Code
extension host/marketplace); FOUR distinct inquiry lenses derived with L1 as the required
original-user-obligations lens; grounded answer-conditioned chains in every lens (each Q2/Q3
visibly conditions on the preceding sourced answer); irrelevant analogy categories explicitly
rejected per lens; one-investigator doc-read posture (no runtime claimed); ordinary full
criticism and revision pass recorded (C1–C5, including two genuine reversals: trust≠sandbox,
history-only→full-tuple). L2's conditioned pivot to Deno/Wasmtime deny-by-default is a
legitimate analogy-gap move, not scope creep: neither primary analogue workbench provides the
brief's "useful without unrestricted host access" shape.

## 3. Independent verification summary (critic C-sources vs draft claims)

| Draft load-bearing claim | Critic source | Result |
|---|---|---|
| Deno `--allow-all` = sandbox off, Node-equivalent (none) | C01 verbatim | CONFIRMED |
| Symlink checks link location; hostile symlink in granted dir exposes target | C01 verbatim | CONFIRMED |
| `/proc`\|`/dev`\|`/sys` need `--allow-all`; `*/environ` needs `--allow-env` | C01 verbatim | CONFIRMED |
| Deny overrides allow; `NotCapable` error shape | C01 | CONFIRMED |
| Disk carve-outs without permission (localStorage/KV/caches/Blob) | C01 | CONFIRMED |
| Web runtime: WebWorker, single bundle, `require('vscode')` shim only, no Node globals, `vscode.workspace.fs`, fetch+CORS, no child processes, runs on desktop too | C02 verbatim | CONFIRMED |
| #5581 nbsp-via-hyperlink bug, Chromium-only, Closed, #5584, milestone 3.7 | C03 | CONFIRMED at issue level; commit level not re-verified (m5) |
| View-vs-dataset export; per-column recon modes; `.tar.gz` + verbatim confidential-prior-data caution; JSON recipe extract/re-apply | C04 verbatim | CONFIRMED |
| Wasmtime WASI auto-hook + instantiation failure; `--dir`; arg-order rule; `--invoke`; `serve` since 18 | C05 | CONFIRMED |
| Wasmtime `--mapdir`, fuel metering, WASI network-grant scoping | C05 negatives | NOT FOUND on page → provisional (m2) |
| `node_modules` readable by default | C01 negative | NOT FOUND; actual default is statically-analyzed imports → correct wording (m1) |
| Desktop Node host = full user power, process wall is stability-only | no critic source | Inference from contrast, no direct primary citation → cite-or-hedge (m6) |
| Jackson migration, runtime lib-pinning, 3.10 column validation, commit 4d7571d, Fix syntax, VSIX layout | S09/S10/S11/S12 excerpts | Excerpt/snippet level only → provisional as flagged (m3–m5, m11) |

## 4. Material findings

### M1 — P1 correction must state that `run`/`ffi`-class grants VOID the sandbox (requirement addition)

Evidence: C01 confirms subprocesses spawned under `--allow-run` "run independently from the
permissions granted to the parent process" and FFI/dlopen libraries "are not run in a sandbox."
The draft's P1 correction (a) allows "no filesystem/network/env/subprocess except explicitly
declared and install-time-approved grants," which a reader could take to mean subprocess/FFI
are grantable capabilities inside the sandbox. They are not: granting them punctures the
boundary for that child/library.
Demand: amend P1(a) and the F1 sandbox shape — row-transform manifests MUST NOT offer
subprocess/FFI grants at all; if a future capability ever does, install-time approval text must
say it voids isolation for that execution path, and V1 must cover the void case (a transform
granted `run` must be treated as untrusted-host-equivalent, never silently sandboxed).
Uncertainty: low. Applies to the Deno-shaped implementation; the Wasmtime/web-runtime shapes
need the analogous statement verified against their own subprocess/FFI-equivalent docs (the
web runtime has no subprocess at all — C02 — which is the strongest posture).
Overturned by: a primary source showing granted children inherit the parent sandbox (contrary
to C01's explicit statement).

## 5. Minor findings (evidence-grade; no disposition change)

- **m1 — Correct the `node_modules` default-read wording.** Predecessor S07 excerpt claims files
  under `node_modules/` are readable by default; C01 finds no such carveout — the documented
  default is statically-analyzed imports from the entrypoint. Fix the discovery wording; no
  disposition impact (the carveout family was already rejected for this brief).
- **m2 — Mark `--mapdir`, Wasmtime fuel, and WASI network-grant scoping provisional.** C05
  confirms `--dir`/arg-order/`--invoke`/instantiation-failure/`serve`-since-18 but has zero hits
  for `--mapdir`/`fuel` and no network-grant statement (predecessor already flagged the network
  line as secondary). P1/P3 cite these shapes; keep them hedged ("`--dir`/`--mapdir` preopen
  shape," "where the runtime supports it") and confirm via `wasmtime run --help` / fuel docs /
  WASI-socket reference before build (fold into PV-a).
- **m3 — P5's Jackson-breakage + runtime-pinning evidence is snippet-level.** The 3.2
  org.json→Jackson forced-migration note and the rdf-transform lib-override note come from
  search/README snippets (S11, honestly flagged; the `Writing-Extensions` page itself 404'd).
  The P5 rejection does NOT depend on them — it follows from the brief's reproducibility
  requirement plus the verified `engines.vscode` minimum-host gate pattern — but the breakage
  anecdote must stay provisional (cite release notes/commit) and must not harden into a build
  assumption.
- **m4 — 3.10 column-dependency validation is release-note-level.** P4/L1 cite it via search
  snippet, not a fetched page. P4's correction stands on verified history/JSON/caution (C04);
  keep the version-specific validation claim provisional pending the release note/commit.
- **m5 — #5581 commit-level details not re-verified.** C03 confirms title, body, repro,
  Chromium-only note, Closed state, #5584 link, milestone 3.7, labels. Commit `4d7571d`,
  its message, the Jan-26-2023 close date, and the wetneb DOM-readback quotation are
  predecessor-recorded only (page truncated in critic window). O3 chain stands; confirm at the
  PR/commit page before citing hashes in build docs.
- **m6 — Desktop-host full-power claim needs a direct primary citation.** "Desktop Node
  extension host holds full user power; the process wall is stability, not security" is inferred
  from the A2 contrast (discovery is honest about this). The P1 core claim stands on C01 alone
  (a child without capability grants = ambient authority), but before build, cite-or-hedge the
  VS Code half (candidate: extension-host / capabilities docs stating desktop API power).
- **m7 — Specify fail-closed handling for caught `NotCapable`.** C01 confirms the error shape;
  predecessor notes it is catchable. A transform could catch and continue degraded. Add to P1(d):
  a caught capability error fails the run unless a declared degraded path was pre-approved;
  V1 should assert the run fails, not merely that the call throws.
- **m8 — P4's preview-tuple sentence drops the version pins.** §1 P4(c) names
  snapshot+recipe+facet/filter+exporter+column-modes; F2 correctly adds extension id/version +
  host API version (P5's pins). Cross-reference fix only: point P4(c) at F2/P5 so no reader
  builds the short tuple.
- **m9 — O2 unit nits: recon timeout "microseconds 180000" is suspect** (180 ms is implausibly
  short for a network timeout; likely ms or a misread pref). It sits in a rejected category
  (reconciliation is a non-obligation), so impact is nil — but verify-or-drop before carrying
  the table forward. Other O2 defaults (autosave 5 min, port 3333, facet 2000, clustering 5000)
  were verified at excerpt level only; low consequence as cited (examples, not load-bearing).
- **m10 — Draft omits a durability/autosave condition.** Discovery records OpenRefine's
  5-minute autosave bounding loss; draft §3 conditions cover sandbox/repro/privacy but never say
  whether workbench runs persist on completion/crash. Add one condition line (persist run record
  on completion; state crash-loss bound) or explicitly defer it as a user decision.
- **m11 — S10/S12 provisional handling is correct; keep it fenced.** Catmandu Fix syntax
  (metacpan challenged; snippet-level) and VSIX layout/install mechanics (secondary snippets)
  are honestly flagged and PV-a gates S11/S12. Critic agrees — but V4's "golden pair runs on
  install/upgrade" and any offline-bundle format work must stay provisional until the primary
  confirm lands; no new reliance on S12 beyond what the draft already hedges.
- **m12 — Trust-excerpt reliance + process/count nits.** S03 (trust tri-state) and S05
  (engines gate) were verified at excerpt level, not independently re-fetched in the critic
  window — accepted at low risk given verbatim schema excerpts and consistent use, but a
  pre-build primary-confirm pass should include them. Trivia, no action beyond noting: E3's
  freeze/`plan-reveal.json` claim is outside the critic's declared evidence (not verified,
  no reason to doubt); "12 sources (S00–S12)" counts 13 IDs; §8's "2 already-covered-partly"
  undercounts if P6's retained smoke test counts (it does).

## 6. Per-P disposition review (all STAND)

- **P1 child processes → CORRECTION (add boundary): STANDS.** "Child alone ≠ sandbox" is
  confirmed by C01's `--allow-all`/Node-equivalence statement; corrections (a)–(d) are
  necessary and sufficient in shape. Qualifications: add M1 (run/ffi void), m6 (cite desktop
  half), m7 (caught-NotCapable fails run).
- **P2 paths-as-arguments → CORRECTION (least-privilege handles): STANDS.** Symlink analysis
  confirmed verbatim by C01 including the `/proc|/dev|/sys` + environ guards; snapshot +
  per-run scratch + promote-after-validation follows; web-runtime model confirmed by C02. Note:
  P2's "output directory" could in principle already be per-run — the draft's shared-dir
  reading is the defensible worst-case interpretation, and per-run scratch is required
  regardless. No change.
- **P3 timeout → CORRECTION (envelope added): STANDS.** Timeout-insufficiency (memory/fork/disk/
  net/units/kill-semantics) is correct; uncertain default values honestly reserved to UD3/U1.
  Qualification: m2 (fuel/`--mapdir` provisional). The C01 disk carve-outs (KV/localStorage/
  caches consume disk without grants) further strengthen — not weaken — this correction.
- **P4 overwrite-on-success → CORRECTION (versioned commit): STANDS.** Verified end to end by
  C04: history-with-data, `.tar.gz` archive, JSON recipe extract/re-apply, verbatim
  do-not-share-when-anonymizing caution. Qualifications: m4 (3.10 validation provisional),
  m8 (tuple cross-ref), m10 (durability condition).
- **P5 auto-load-newest → REJECTED-as-stated + pinned upgrades: STANDS.** Silent auto-upgrade
  contradicts the brief's reproducible-preview requirement; the pinned/side-by-side/explicit-
  re-pin replacement with capability-diff + golden-diff preview is the right shape, consistent
  with the verified minimum-host-gate pattern. The "rejected mechanism vs retained upgrades
  goal" split is coherent. Qualification: m3 (breakage anecdote provisional; rejection is
  overdetermined and does not need it).
- **P6 sample formatter → retained smoke test + discriminating suite: STANDS.**
  Happy-path-only insufficiency is correctly judged; V1–V7 each discriminate a distinct brief
  requirement, and V5's Chromium+Firefox clause correctly follows the verified browser split
  (C03). V1 should absorb M1/m7 (void-case + fail-closed assertion).

No P clause is under-corrected (all hard requirements get teeth) or over-corrected (no
correction invents brief-foreign obligations; online services, OAuth upload, multi-project
tabs, and FFI/subprocess-for-extensions stay explicitly optional/rejected).

## 7. Alternatives, omissions, and false-rejection check

- ALT-A (in-process) / ALT-B (trust-gating-only) rejections as C1-satisfying shapes: UPHELD.
  Trust gates activation (S03 excerpts, accepted per m12); only a real sandbox bounds running
  code (C01/C02). Neither rejection is false.
- ALT-C recommendation (deny-by-default sandbox + pinned recipes + golden gates): UPHELD as
  the only retained shape satisfying C1–C5. M1 tightens it; it does not replace it.
- ALT-D recipe hybrid (canonical JSON + readable projection): UPHELD as open/endorsed; exact
  grammar rightly left to UD2 (m11 keeps the Fix-syntax half provisional).
- Genuine breadth omissions (minor, not O1 failures — O1 requires discovery beyond the thin
  plan, not exhaustion): OS-native sandboxes (macOS seatbelt/profile, Linux bubblewrap/
  namespaces, Windows AppContainer) and desktop updater frameworks (Sparkle/Tauri updater)
  were not investigated; both are directly relevant to UD1/UD4 and should get one doc-read
  probe each pre-build. No disposition depends on them today.

## 8. Obligation-closure review (O1–O6)

- O1 (unfamiliar tools/approaches): SATISFIED — OpenRefine workflow, VS Code web runtime +
  trust, Deno/Wasmtime sandbox shapes, Catmandu script-recipe alternative; MarcEdit honestly
  not claimed. Breadth note in §7 is additive, not a gap failing O1.
- O2 (consequential behavior/defaults/limits): SATISFIED with m1/m2/m9 corrections — scoping
  units (path-subtree, host[:port], var names), deny precedence, symlink rules, web-runtime
  limits, and export/history semantics verified; provisional items fenced.
- O3 (issue/fix/release chain): SATISFIED — primary #5581→#5584→3.7 chain verified at issue
  level (C03) with an honest commit-level residual (m5); supporting chains flagged at the
  right evidence grade; U4/VSIX gaps honestly stated.
- O4 (per-P comparison with exact disposition vocabulary): SATISFIED — all six P clauses
  disposed in exact vocabulary with already-covered/correction/rejected/uncertain/user-decision
  distinctions; §6 upholds each.
- O5 (retain alternatives/conditions/disagreement/uncertainty in full prose): SATISFIED —
  §§2–5 restate content in prose (IDs index, never replace); offline-vs-upgrades disagreement
  retained with its resolution; uncertainties registered, not buried.
- O6 (discriminating validations, executed vs proposed): SATISFIED — E1–E3 separated from
  V1–V7+PV-a; no-runtime honesty explicit; scope kept to the small-brief envelope. V1
  tightened by M1/m7; PV-a correctly fences S11/S12 (extend to m2/m6/m12 per §5).

## 9. Critic uncertainty register

- U-C1: S03/S05/S06 accepted at excerpt level (m12) — low risk, confirm pre-build.
- U-C2: Exact sandbox runtime still UD1-open (draft U1, agreed) — M1/m2 constrain but do not
  pick the stack.
- U-C3: No VS Code bypass/CVE chain (draft U4, agreed) — trust-layer threats stay doc-level.
- U-C4: `plan-reveal.json` freeze mechanics outside critic evidence (m12) — process note only.
- U-C5: No runtime/witness available to critic either — all findings are doc/code-read grade;
  V1–V7 remain the executable arbiter.

## 10. Lifecycle notes

Executed checks (critic run): 5 independent primary fetches with keyword-grep verification
(C01–C05), full read of all declared predecessors and all 12 research excerpts. Proposed, not
executed: PV-a primary-confirm pass (extended per §5), V1–V7 (need runtime/UI harness), OS-
sandbox/updater doc probes (§7). Usage/billing unobserved: null. No premium evaluator access
used; no candidate repair performed — findings are demands with evidence, for the next stage
to adjudicate.
