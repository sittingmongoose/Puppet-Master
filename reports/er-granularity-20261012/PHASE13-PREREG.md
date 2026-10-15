# Phase 13 pre-registration (before any candidate work, 2026-10-13)

Identical shape to PHASE12-PREREG with exactly two process changes, each
traced to a Phase 12 root cause:
1. **Clause-driven slice matrix.** Slice questions are generated per plan
   clause (× the 2–3 bundle sources most relevant to that clause), plus
   per-source durability/limits questions. The matrix is written host-side
   before slicing and archived; coverage is measured per clause.
2. **Host-rendered quotes.** Slices and integration cite chunk IDs only;
   the integrator writes the final with `[Q:CHUNK-ID]` placeholders and is
   forbidden from typing quote text. A host script renders placeholders to
   verbatim chunk excerpts after integration; repairs may not alter
   rendered quote spans (host verifies every rendered quote byte-for-byte
   against its chunk before freeze).

Everything else carries over: held-out caseB (local search over agent
history; brief/plan hashes in p13/FREEZE.txt); flash discovery (Luna
names-only + library angle, DeepSeek **thinking=max** donor angle + dry
round — the effort change is itself logged here as part of the design,
per DS-MAX-AB); mechanical shortlist (plan-core engine forced in, as
Phase 12 deviation 1, here pre-declared); gold-free skeleton (Luna) +
skeleton adversary (DeepSeek); critic panel one-file-per-context (GLM
hunter, DeepSeek entailment + dual adversary); ≤3 bounded repairs with
host diff audit; Sol premium arm (discovery metric + records/final on the
same bundle, 2 contexts); gold authored by Sol only after both finals
freeze; **grading by Astra 6 Max ×2 blind** (no Claude accounts per
Jared's instruction; Astra authored neither gold nor candidates).
Success: flash zero confirmed material errors (host-adjudicated) and
diagnostic ≥ Sol−5. Deviations logged, never absorbed.
