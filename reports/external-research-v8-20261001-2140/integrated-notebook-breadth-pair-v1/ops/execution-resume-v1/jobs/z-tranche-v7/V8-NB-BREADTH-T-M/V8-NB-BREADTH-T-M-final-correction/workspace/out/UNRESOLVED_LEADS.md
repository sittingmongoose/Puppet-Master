# UNRESOLVED LEADS — V8-NB-BREADTH-T-M, final-correction stage (consequential dependencies/uncertainty only)

Supersedes `inputs/UNRESOLVED_LEADS.md`. L5 is rewritten because this stage's captures
(`out/FINAL_PROPOSAL.md` §1 F1/F2) proved its prior claim false; the other leads are unchanged in
substance and re-verified where this stage could.

- **L1 — nbdime license text (consequential if option 1 is ever revisited).** The captured
  repository metadata records license [verbatim excerpt omitted; original artifact/source locator retained]/NOASSERTION for jupyter/nbdime (re-observed in this
  stage's PR #566 capture, F8, base-repo record). No stage of this case has read the LICENSE file,
  so the practical terms for borrowing code (vs. re-implementing the documented tier semantics as
  we propose) remain unresolved. Not load-bearing for the recommended nbformat-only path; resolve
  before any nbdime code reuse.
- **L2 — open upstream failures in the precedent component.** nbdime issue #597 (merge resolves
  conflict by deleting cells on both sides; reproduced on 3.1.0) and #787 (nbdiff-web stalls on
  particular input at 4.0.2) were open at the research/critique stages' captures (2026-10-03).
  This stage did not re-fetch them; they motivate the don't-depend-on-nbdime recommendation. If
  both are fixed upstream, re-evaluate the tradeoff in `out/FINAL_PROPOSAL.md` §6.
- **L3 — rename-similarity threshold calibration.** The optional R2 rule needs a θ default; the
  git analogy confirms bounded, configurable rename detection (v2.9.0 RelNotes; `diff.renames`,
  `diff.renameLimit` at v2.42.0, quoted with its [verbatim excerpt omitted; original artifact/source locator retained] hedge in F9) but no stage
  captured git's similarity-index percentage documentation, so no git numeric default is asserted.
  Calibrate θ on the fixture set during implementation; keep R1 (exact hash) the default.
- **L4 — manifest capture-time correctness is trusted, not verifiable.** Rename inference and
  untracked classification read the manifests as ground truth. If a capture tool mislabels
  tracked/untracked or hashes the wrong bytes, observations inherit the error. A future capture-side
  self-check (hash-on-write) would close this; out of scope here.
- **L5 — REWRITTEN (was false): nbformat API/behavior drift around cell-id repair.** The prior lead
  claimed [verbatim excerpt omitted; original artifact/source locator retained]. This stage verified the opposite:
  nbformat **5.11.0** [verbatim excerpt omitted; original artifact/source locator retained] and "Refactor
  validation to separate deprecated kwarg handling [#439]" (F1), with the new surface confirmed in
  code at v5.11.1 (F2: public `validate` without repair kwargs; `_validate` keyword-only
  `repair_duplicate_cell_ids=True` default; `isvalid()` = no-repair path with an internal
  non-mutation assertion) and the old deprecated surface confirmed at v5.10.4 (F5). Current state
  encoded in the plan: pin `nbformat==5.11.1`; rely only on `{isvalid, normalize, get_validator,
  reader.get_version}`; never pass repair kwargs to `validate()` (TypeError ≥5.11.0); treat
  `reads()`/plain `validate()` as mutating (in-memory id repair at both pinned versions, F2–F4).
  Residual risk: a future nbformat could make `MissingIDFieldWarning` a hard error (the warning
  text still says [verbatim excerpt omitted; original artifact/source locator retained], unlanded at 5.11.1, F2),
  or change `isvalid`/`normalize` semantics; if so, the N1 input classes and the pin must be
  revisited.
- **L6 — future-minor semantics are library-mediated.** The [verbatim excerpt omitted; original artifact/source locator retained] relaxation
  (relax `additionalProperties`, admit unrecognized cells/outputs) is nbformat implementation
  behavior, verified present and unchanged at both v5.10.4 and v5.11.1 (F2, F5), not a format
  guarantee; a minimal non-nbformat reimplementation (e.g. for packaging) must re-derive it from
  the JEP/schema only, with loss of certainty.
- **L7 — NEW (minor): nbformat validator backend variance.** The nbformat changelog documents an
  optional `fastjsonschema` backend selected via the `NBFORMAT_VALIDATOR` environment variable
  (entry 5.0.8, F1). Schema semantics relied on here are backend-independent, but error-message
  specifics and iteration details may differ between the `jsonschema` and `fastjsonschema`
  backends. The implementation stage should pin/assert the backend it tests against; no stage has
  measured the difference.
