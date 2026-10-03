# UNRESOLVED LEADS — V8-NB-BREADTH-T-M (consequential dependencies/uncertainty only)

- **L1 — nbdime license text (consequential if option 1 is ever revisited).** The captured
  repository metadata records license [verbatim excerpt omitted; original artifact/source locator retained]/NOASSERTION for jupyter/nbdime. This stage did not
  read the LICENSE file, so the practical terms for borrowing code (vs. re-implementing the
  documented tier semantics as we propose) are unresolved. Not load-bearing for the recommended
  nbformat-only path; resolve before any nbdime code reuse.
- **L2 — open upstream failures in the precedent component.** nbdime issue #597 (merge resolves
  conflict by deleting cells on both sides; reproduced on 3.1.0) and #787 (nbdiff-web stalls on
  particular input at 4.0.2) were open at capture time (2026-10-03). They motivate the
  don't-depend-on-nbdime recommendation; if both are fixed upstream, the tradeoff in
  `PROPOSAL.md` §6 should be re-evaluated.
- **L3 — rename-similarity threshold calibration.** The optional R2 rule needs a θ default; the
  git analogy confirms bounded, configurable rename detection (v2.9.0 RelNotes; `diff.renames`,
  `diff.renameLimit` in v2.42.0 config doc) but this stage did not capture git's similarity-index
  percentage documentation, so no git numeric default is asserted. Calibrate θ on the fixture set
  during implementation; keep R1 (exact hash) the default.
- **L4 — manifest capture-time correctness is trusted, not verifiable.** Rename inference and
  untracked classification read the manifests as ground truth. If a capture tool mislabels
  tracked/untracked or hashes the wrong bytes, observations inherit the error. A future capture-side
  self-check (hash-on-write) would close this; out of scope here.
- **L5 — nbformat behavior drift after v5.10.4.** Evidence is pinned to tag v5.10.4 (validator.py,
  4.5 schema) plus the `main` changelog (latest line 5.11.1, Aug 2026, no cell-id semantic changes
  listed since 5.7.2's [verbatim excerpt omitted; original artifact/source locator retained]). If a later nbformat makes
  MissingIDFieldWarning a hard error (the warning text itself says "will become a hard error in
  future nbformat versions"), the N1 unsupported-input list must be revisited.
- **L6 — future-minor semantics are library-mediated.** The [verbatim excerpt omitted; original artifact/source locator retained] relaxation
  (relax `additionalProperties`, admit unrecognized cells/outputs) is nbformat implementation
  behavior (v5.10.4 validator.py), not a format guarantee; a minimal non-nbformat reimplementation
  (e.g. for packaging) must re-derive it from the JEP/schema only with loss of certainty.
