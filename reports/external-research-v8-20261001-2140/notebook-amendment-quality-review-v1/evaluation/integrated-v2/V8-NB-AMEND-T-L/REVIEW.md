# Independent frozen-output review — V8-NB-AMEND-T-L

**Disposition: FAILED_SCREEN.** This is a decisive source-quality rejection, with all unchecked coverage explicitly unassessed. It is not a full review pass or a numerical grade.

The actual final proposal is 50,479 bytes, SHA-256 `b5598d87e0786b3ac69243af1f93c6bb1538d24c65f026db54c27849bc20427a`. Its companion unresolved-leads artifact is 4,012 bytes, SHA-256 `53eb1a7b857ea9d5b4726bf7c4b3e0632e5a44feb69939c0b97431bab03b1dc0`. The source-quality assessment was frozen at **2026-10-03T04:14:18.608422Z**, before reading METHOD, TASK, manifests, the common scoring scope, initial proposal, critic, native metrics, or stage/closure receipts. The immutable originals and hashes are in `SOURCE_QUALITY_FREEZE.json`.

## Decisive verified defect

SQ-F1 affects final section 0.1 note 1, section 2's Git precedent, section 3.3, N3, and the F7b2 validation rationale. The proposal asserts that Git excludes equality at its rename threshold, so a pair at exactly 50% produces delete plus add and distinguishes Git from the prototype's inclusive rule. The same-version implementation contradicts that assertion.

At [Git v2.43.0 diffcore-rename.c](https://raw.githubusercontent.com/git/git/v2.43.0/diffcore-rename.c), [verbatim source span omitted; original locators retained] rejects candidates whose score is below the threshold; equality reaches the rename-recording branch when the destination and source remain eligible. See captured file lines 1138–1152. The basename route likewise skips below-threshold scores, then records eligible pairs, lines 1032–1042. The implementation's score is based on copied source bytes and maximum file size, lines 193–210; the prototype's SequenceMatcher line ratio is a different metric. Equal numeric percentages from those two metrics cannot themselves establish equivalent test inputs.

The [same-tag option documentation](https://raw.githubusercontent.com/git/git/v2.43.0/Documentation/diff-options.txt), lines 580–590, uses strict-sounding wording in its 90% example and documents exact-only detection at 100%. That prose is real. It does not justify elevating the example wording into the proposal's unconditional executable outcome at equality, especially against the implementation. The false source-backed correction supplies a consequential N3 explanation and the F7b2 failure oracle. This prevents whole-case PASS.

Independent primary capture hashes:

- `diffcore-rename.c`: `a462b6cff4edd08606aa0079483adc1e51b912dc9759d76c1d459ed5c56581d0`
- `Documentation/diff-options.txt`: `c7b3566f63b7869c0d73738c0edc3fdbd4c02872281a995a1c3c34c94241fab8`

This ruling is primary-source inspection plus evaluator inference from the code path. No Git fixture, candidate test, upstream test suite, renderer check, or similarity arithmetic was executed. Raw independent primary bodies are restricted to this evaluator's [verbatim source span omitted; original locators retained] directory; published records provide URL, SHA-256 and exact line/JSON locators without full bodies or source quotations.

## Coverage and evaluation limits

Q1 and Q2 have a partial verified error; Q3 is unassessed. N3 has a partial verified error; N1, N2, N4 and N5 are unassessed as complete obligations. The 18 descriptive semantic-facet slots remain unassessed with numeric null. The postfreeze coverage crosswalk identifies where SQ-F1 matters without converting unchecked facets into scores. All canonical and local aggregate numeric grades are null. The shared scope supplies no canonical 18-facet weights; evaluator descriptive names are not comparable canonical grades.

The final artifact visibly addresses the brief and exposes unresolved leads, but neither visible coverage nor host completion proves every consequential claim correct. No judgment of remaining consequential dependencies, alternative quality, or whole-history research completeness is implied by this early screen.

Identity blindness was limited: the task and filename exposed this case, final-correction role, candidate family/model binding and planning-lineage suffix; the proposal exposed its correction context. Method identity and cost were deliberately withheld until source quality froze. No other arm, prior evaluator, private account context, live ledger, native conversation, raw stream, tool argument, SDK/profile/auth state, Git operation or canonical Plans content was used.

## Postfreeze method and preservation audit

The revealed method is [verbatim source span omitted; original locators retained], method id C-A. The actual critic artifact has an explicit Q1–Q3/N1–N5 assessment, three ranked amendments A1–A3 with affected passages, concrete replacements, support and proposed discriminating checks, plus additional notes and unresolved obligations. It is an amendment critique, and the final stage produces a complete final proposal. This establishes output structure. Trace-level method uptake is **INDETERMINATE**; self-reports and transport metadata do not prove actual semantic source checking.

The initial proposal, critic inputs and final inputs match their admitted actual-output hashes. Bounded artifact comparison found no obvious loss of necessary current-proposal content: saved-state contract and limits, field separation, identity ambiguity, manifest edits and tracked fallback, selected-state recovery, component comparison, tradeoff, issue/fix/test narrative and proposed validations remain. A1 changes P2; A2 replaces the inadequate name-collision assumption with path/collision refusals; A3 reattributes a quote; the no-repair path and similarity formula become explicit. False earlier material is not required to survive.

The erroneous strict Git-boundary explanation originates in the critic's additional note 1 and is applied repeatedly in the final artifact. This is a new truth defect, separately recorded from preservation. Five fresh correction-stage source capture records are timestamped around 03:50Z, supporting fresh retrieval; they do not prove comprehension. All proposed validations remain labeled unexecuted.

## Postfreeze operation, provenance and cost

The admitted receipts establish three distinct, fresh native target sessions with activation observed, complete status and wrapper return code 0. Positive enrollment/absence records close each owned native unit/cgroup; held stage actors, the case supervisor and the finalizer close with return code 0 and absent owned groups. The final global receipt has the required SHA-256 `debdc1dd70d8cfc085aab3a7625d456d6b275258d4d85dd738e15440938e5c6f`. Same existing subscription account and NativeZ/GLM5.3FlashMax binding are root-attested; credentials and private ledger were not inspected. The L suffix is planning lineage only.

The explicit updated timing manifest supplies 1,200/1,200/900-second stage caps. Older method/task 600-second wording is historical; no clock was reset. Evaluator-derived inclusive stage durations to the latest admitted close/absence/charge clock are 697.876555944, 806.083485429 and 503.532425417 seconds. All fit the updated caps. The global receipt records 2,008.53208353 seconds of case wall, 2,007.836809873581 seconds of occupied stage leases, and 5.168064165 seconds outside nonoverlapping native intervals. The case fits 3,600-second wall and 5,400-second occupied caps. There were 28 responses, summed analytically from stage scalars.

Only positively hashed, explicitly admitted output lower-bound scalars are reported: research 28,407; critic 37,028; correction 31,949. Their evaluator-derived sum is **97,384 observed output-token lower bound**. Full input/output/reasoning/cache/total usage and money remain **UNKNOWN**. These lower bounds are not complete usage, billable cost, efficiency grades or evidence of quality.

Admitted capture JSON hashes and operation-receipt hashes match their public freezes. Positive host capture and source/range metadata exist for every stage. Their witness scope is tool-server stdout emission; frontend source receipt and semantic acquisition remain **UNKNOWN**. No candidate capture [verbatim source span omitted; original locators retained], arbitrary delivery record, private nested context or native history was exported.

The original evaluator birth is epoch [verbatim source span omitted; original locators retained]; the hard deadline remains [verbatim source span omitted; original locators retained], including all preparation, reading, waits, verification and writing. The actual inclusive evaluator end and final publication hashes are recorded in `FREEZE.json`. No pair winner, isolated method effect, efficiency advantage or holdout inference follows from operational completion or this failed screen.
