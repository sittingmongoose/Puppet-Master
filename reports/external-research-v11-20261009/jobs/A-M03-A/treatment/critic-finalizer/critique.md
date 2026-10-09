# M03 Critic-Finalizer Critique — S03 lab-notebooks (fresh independent review)

Role: fresh independent critic-finalizer. Inspected, in full: brief (`cases/S03/brief.md`),
`treatment/research/draft.md`, `treatment/research/discovery.md`,
`treatment/research/source-map.json` + `treatment/research/sources/` (exec-sandbox, env-repro,
review-export, wasm-provenance, index), `treatment/research/revealed-plan.md`, and
`treatment/research/critique.md` (prior-critic demands assessed below, none taken on authority).
Deliberately did NOT read `treatment/research/final.md` (not a declared predecessor).
Independently re-fetched two governing primary sources (nbclient execution docs, renv lockfile
anatomy) on 2026-10-09; see own `source-map.json` + `sources/`. No containers built, no notebooks
executed, no sandbox invoked; no execution claimed.

Revealed thin plan (exact, from revealed-plan.md):
P1: Store notebooks in Git. P2: Run each notebook in a Docker container using the latest
dependencies. P3: Capture stdout and HTML as proof. P4: Resolve data URLs at execution time.
P5: Show a green reproduction badge when exit code is zero. P6: Add collaborative annotations later.

## Verdict

The draft's core judgments are sound: reject P2-latest, P4-live-URLs, P5-exit-only, P6-later;
require locks + sandboxing + data pinning + full badge gate; demote WASM to preview. No false
correction or false rejection found (see §False-rejection audit). But the draft has 8 material
gaps, 3 of which the prior critique missed (F2 expected-hash origin, F5 Rmd/Qmd execution path,
F8 authorship operationalization), plus 1 prior-critic demand that needs amendment (F4 sandbox
tiering). All are fixable in final.md from existing evidence + explicit uncertainty.

## Material findings (must be resolved in final)

### F1. R-version assert missing from build/badge gate (P2) — AGREE with prior C1, hardened
Evidence: renv.lock records `R.Version`, but `renv::restore()` reinstalls package versions; it
does not install or switch R itself (S11; independently re-verified CF02: snapshot/restore page
describes package reinstall, no R-version enforcement; S19 "tracks, but doesn't help with, version
of R"). The draft lists "base-image digest or rig" as the R pin and "R/Python versions verified"
in the badge gate, but names no assert/record step. A green R reproduction can therefore pass on
the wrong R. Fix: build gate runs `R --version`, asserts equality with lockfile `R.Version`,
records both in provenance; badge green requires the assert to have passed.

### F2. "Artifact hash matches expected" is undefined on first reproduction (P5) — NEW
The draft's badge gate requires artifact-hash match but never says where the expected hash comes
from. For a review service the rerun itself produces the artifact; on first reproduction there is
no baseline unless the author submitted claimed outputs. As written the gate is unimplementable.
Fix (pick one as default, retain the other as option): (a) ingest author's claimed executed
notebook + artifact SHA-256 at submission; green compares rerun bytes to claimed hashes
(mismatch = `HASH_MISMATCH`, still informative); (b) where no claim exists, badge max amber
(`NO_REFERENCE`) or run twice and compare (determinism check, still amber unless policy says
otherwise). Final must define the reference origin; prior critique missed this.

### F3. Selected-result selector undefined (P2/P3/P5) — AGREE with prior C3
Draft asserts "selected-result output cell exists + hash matches" without defining how the
selected result is named. Two runs can both be "green" on different results. Fix: define
`result-selector` = cell tag(s) + Papermill parameter set + parameter hash + named artifact
path(s); record it in RO-Crate and the badge payload; output-presence assert keys off it.

### F4. Sandbox tier ordering overclaims; prior C2 MUST needs amendment (P2/P5)
Two problems. (1) Draft ranks "bubblewrap/nsjail fallback, never silent runc", implying
runc < bubblewrap/nsjail. In fact a hardened runc profile (cap-drop, no-new-privs, read-only,
no-net, seccomp/AppArmor, userns, PIDs/memory/CPU caps) is a real container boundary roughly
comparable to bubblewrap (both userns/seccomp-based); gVisor adds a user-space kernel above
both. The draft's ordering is not evidence-backed. Correct tiers: T0 gVisor runsc / microVM
(Kata/Firecracker where offered); T1 hardened runc named profile; T2 bubblewrap/nsjail
single-host. (2) Prior C2 demands "only runsc may show green" as unconditional MUST. That is
defensible as the default for untrusted uploads but overrides the draft's own retained user
decision (gVisor-required vs weaker-with-downgrade). Disposition: accept C2 as DEFAULT (T0
required for green; T1/T2 max amber with tier label), retain an explicit labeled deployer
override (documented risk acceptance, badge shows tier + override flag), never silent.

### F5. .Rmd/.Qmd execution path unspecified (P2/P3) — NEW
Brief arrivals are "mixed Python/R projects"; draft ingest accepts .ipynb/.qmd/.Rmd, but the
entire execution/verification path is .ipynb-only (Papermill/nbclient timeouts, injected
parameters, IOPub guard). .Rmd executes via rmarkdown/knitr under an R engine and .qmd via
`quarto render` — different timeout/cap/parameter/provenance surfaces than nbclient.
Prior critique missed this. Fix: per-format execution table (ipynb→Papermill; Rmd→Rscript
render with wall-clock timeout + sessionInfo capture; qmd→quarto render with timeout), each
with its output-presence rule, or an explicit scope decision (normalize via jupytext to .ipynb
first). Final states the decision; unsupported formats yield `FORMAT_UNSUPPORTED`, never a
silent skip.

### F6. Data safe default must be manifest-first (P4) — AGREE with prior C8
Draft names bundle-vs-manifest as a user decision without a default. For unknown license/size
the only safe default is manifest + verified-fetch script; bundle bytes only when license
permits and size fits. Never block review on missing bytes without a clear red/amber reason
(`DATA_LICENSE_UNKNOWN`, `DATA_FETCH_FAILED`). Prior critique missed nothing here; accept.

### F7. Badge failure taxonomy missing (P5) — AGREE with prior C7, extended
Draft names the gate but not machine-readable reason codes. Add minimal enum mapped to
validations, extended with F2/F5 codes: `TIMEOUT`, `OOM_LIMIT`, `OUTPUT_MISSING`,
`HASH_MISMATCH`, `NO_REFERENCE`, `PIN_MISSING` (env), `R_VERSION_MISMATCH`,
`DATA_HASH_MISMATCH`, `DATA_LICENSE_UNKNOWN`, `WEAK_SANDBOX` (amber cap),
`OFFLINE_EXPORT_FAILED`, `FORMAT_UNSUPPORTED`, `PARAM_MISMATCH`. Accept prior C7; enum above
supersedes any shorter list.

### F8. "Preserve authorship" never operationalized (P6/brief) — NEW, low-material
Brief requires authorship preservation; draft repeats the phrase without defining the record.
Fix: authorship record = ingest Git author identity + notebook `metadata.authors` (where
present) + review-comment author IDs; carried into RO-Crate (`author`/`contributor` properties)
and the offline bundle; export validation asserts its presence. Small fix, required for the
brief's explicit constraint.

## Minor findings (fix in final with a sentence each)

- m1. ReviewNB vendor-claim caveat (AGREE prior C4): discovery correctly marks team list and
  free-for-OSS as vendor claims; final must carry "vendor claim, not independently verified"
  wherever ReviewNB is recommended.
- m2. Offline wording (AGREE prior C5): no flag implies offline; only a network-disabled open
  with zero observed requests passes; article HTML and reveal.js tested separately (S07 #9404).
- m3. WASM never sets badge (AGREE prior C6): state decisive ecology blockers (no
  threads/multiprocessing/sockets, CORS-bound fetches, R/Python runtime split, CDN dependence)
  and the rule that WASM preview MUST NOT set badge state.
- m4. Resource bootstrap defaults (PARTIAL on prior C9): prior C9 demands "conservative
  starting defaults". Requiring an explicit-cap + recorded-actuals mechanism is valid; any
  specific numbers are NOT evidence-based and must be labeled illustrative placeholders,
  explicitly untuned, never recommendations. Final provides the mechanism + labeled placeholders.
- m5. Git LFS omission: discovery retains DataLad/DVC/DOI-manifest but never mentions Git LFS,
  the most common small-group large-file path. Final notes it as considered: acceptable for
  byte transport, declined as the provenance story (no run provenance/nesting); may coexist.
- m6. Marimo "deterministic" wording: reactive dataflow gives dependency-ordered execution with
  no hidden out-of-order state; data-dependent control flow can still vary. Soften
  "deterministic" to "dependency-ordered, no hidden out-of-order state".
- m7. Quarto rename direction: `embed-resources` succeeding `self-contained` is correctly stated
  (S06); keep, no change.
- m8. Timeout distinction verified: draft correctly separates Papermill `start_timeout` (kernel
  startup) from nbclient per-cell `timeout` (CF01/S01 default 30 s, `None`/`-1` disables);
  forbidding unlimited is correct for this service. No change.
- m9. O3 chain-A caveat: the IOPub warn-and-continue→error characterization is faithful to the
  cited release note (S17), but it is a release-note summary, not a verified issue/CVE number.
  Final labels it as such and keeps the output-presence assert regardless.
- m10. V8 "3× runs" label: three runs under fixed caps is a smoke/envelope check, not a
  statistical guarantee. Label it smoke; no design change.

## False-rejection / false-correction audit (all P dispositions checked)

- P1 "Git alone suffices" rejected: stands. Plain `git diff` on .ipynb JSON is unreviewable;
  nbdime content-aware diff/merge (S04) is the evidenced correction. O4 label
  PARTIAL/CORRECTION+ENHANCEMENT stands.
- P2 "latest dependencies" rejected: stands. Unpinned solves are non-reproducible by
  construction; conda-lock solveless install (S10) + renv.lock (S11/CF02) + R pin are evidenced.
  "Each notebook"→selected-result narrowing stands: brief says "a selected result".
- P3 "stdout+HTML as proof" corrected: stands. Silent-output-loss class (S17) makes presence
  checks necessary; RO-Crate provenance (S14) is the evidenced upgrade.
- P4 execution-time URL resolution rejected: stands. Mutable + unpinned + incompatible with
  `--network=none` sandboxing and offline export; DataLad/SHA-DOI pinning (S15) evidenced.
- P5 exit-code-only green rejected: stands. Exit 0 is necessary, not sufficient, given F2 and
  the S17 failure class.
- P6 "later" rejected: stands. Brief explicitly requires authorship and annotations; deferral
  contradicts the brief.
- No draft correction found to be false; no valid P subclause found wrongly rejected.

## Prior-critique (research/critique.md C1–C9) assessment

- C1 → F1 ACCEPTED (R-version assert). C2 → F4 ACCEPTED-WITH-AMENDMENT (tier ordering
  corrected; MUST becomes labeled default + explicit override). C3 → F3 ACCEPTED
  (result-selector). C4 → m1 ACCEPTED. C5 → m2 ACCEPTED. C6 → m3 ACCEPTED. C7 → F7 ACCEPTED
  (enum extended). C8 → F6 ACCEPTED. C9 → m4 PARTIAL (mechanism required; numbers illustrative
  only). No prior demand rejected outright; none accepted on authority — each re-verified above.

## Preservation requirements for final.md

All six P dispositions with O4 labels; all rejected subclauses stay rejected; alternatives
(server tiers vs WASM preview vs no-exec review; DataLad vs DVC vs manifest (+LFS note); Marimo
vs Jupyter; Quarto vs nbconvert; SaaS vs self-hosted comments); conditions, constraints,
disagreement, uncertainty; all 10 proposed validations with executed-vs-proposed separation and
no claimed execution; source grounding S01–S19 (research) + CF01–CF02 (this stage);
usage/billing null; no silent rebind.
