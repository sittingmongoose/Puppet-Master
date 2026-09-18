# Continuation-4 candidate answers (Jared, 2026-09-17)

Seven questions from the Part 1 record `~/PM-Experiments/c4-candidates-20260917/ADJUDICATION_PART1.md`, put to Jared with the reviewer's recommendations. Jared's answer, verbatim: "I agree with all 7 of your recommendations. You can do all the next steps. You can use Opus 5 max for your strong model."

The seven, as asked and as answered (each answer = the recommendation Jared agreed with):

1. Verification depth (records C4C-01 + C4G-01): the behavioural rule in JJI-008 plus an `object_verification_depth` field on the restore receipt that `$ref`s Backup's existing `integrity_verification_level` enum, so it is falsifiable by a fixture.
2. Divergent changes (C4H-05): extend the frozen `graph_states` list in `Plans/final_gui_interaction_contracts.schema.json` with `divergent`, and mint a new typed reason code rather than reusing the undefined `invalid_target_identity`.
3. Version identity (C4D-01, C4U-02): one shared version-identity block serving both the closure records and the certification profile, on JJI-022's pattern.
4. Machine-local store entries (C4C-03): land the three obligations now; carry the enumerated entry list as an open ledger question pending a source audit of jj internals.
5. Semantic gate: the `source_control_contracts` / `jujutsu_integration_contracts` semantic-gate branch in `scripts/pm-new-contracts-verify.py` is authorized for the relational halves of records 5, 7, 11 and 13. This is the only scripts edit authorized by this answer.
6. Product choices (C4M-04, C4G-03): present C4G-03 together with the deferred diff/merge-editor save-surface cluster (C4D-04, C4M-03, C4G-02) as one decision card; C4M-04 (bookmark sync vocabulary) as its own card.
7. C4D-02: confirmed rejected as inside continuation 3's marker-only conflict rejection.

Also authorized: "all the next steps" from the summary page (land the corrections; the lead-prioritization experiment; source verification as a standing adjudication step; hybrid configuration as the reference), and Opus 5 at max effort as the strong model for experiments.
