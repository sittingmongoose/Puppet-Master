# ER9 independent output evaluation, v1

This protocol implements ER9 handoff §§7–9. It is evaluation infrastructure, not a case answer or a scored result. The case owner supplies the exact brief, declared obligations, eligible source access and designated final artifacts; no evaluator source list or semantic answer is supplied to candidates.

## Dispatch and ownership

- Dispatch one fresh, independent GPT 6.1 Sol xhigh evaluator for one coherent output or matched pair. Record requested and observed model/effort separately. Use targeted Max adjudication only for a specific unresolved source/semantic dispute. Do not use majority votes or recursive review teams.
- The coordinator fills `DISPATCH_TEMPLATE.json` before dispatch, using anonymous aliases and exact paths plus SHA-256 pins. Include the actual common task, coverage map, source-access rules, final output and cited source/witness artifacts. A matched pair gets one common obligation map and the same predeclared important screen checks. Anonymous output order is allocated by the coordinator and recorded in a sealed sidecar.
- The evaluator writes only inside its assigned result directory. Candidate workspaces, running jobs and answers remain untouched. The evaluator may retrieve public primary sources and create private expected-truth notes or executable counterexamples after the candidate output freeze. Keep those notes out of candidate inputs and locked confirmation blocks.
- `report.json` and `REVIEW.md` are the deliverables. Pin the received task/output bytes and save `current_output_judgment.json` before opening method/history/economics. The final report references this immutable snapshot and separates later evidence.
- Evaluators receive finite scope and time limits with reserved capacity for full coverage. A screen budget cannot certify a complete output. Scope/budget changes after a running review starts require a separately declared continuation; preserve the first result and consumed cost. A timeout is partial evaluation, not automatic candidate failure.

## Blinding

Blind treatment/control labels, family/model, costs, prior grades and method-uptake history where practical. Do not blind the task, legitimate source access or final artifact contract. Redact incidental paths and provider headers mechanically without editing substantive output. Keep original hashes and alias mappings in a coordinator-only sidecar. If prose, filenames, receipt formats or tool descriptions reveal hints, disclose the exact hint and whether identity became known. Never claim perfect blinding from anonymous filenames alone.

Phase 1 uses the designated current outputs, shared task obligations and anonymous evidence needed to verify their claims. Phase 2 opens necessary stage/history receipts to assess method uptake, candidate execution and any history-dependent preservation obligations. Economics are reported separately after the Phase 1 judgment is saved. Neither phase converts evaluator work into candidate work. New evidence that changes an earlier judgment requires a dated additive erratum, not a silent rewrite.

## Eight dimensions and actual obligations

1. Required question/plan-obligation coverage.
2. Correct source interpretation, versions, conditions, normative force and implementation applicability.
3. Justified inference, component choice and consequences for the plan.
4. Discovery quality: verified useful novelty, alternatives, relevant failures and breadth.
5. Correctness and scope of executed witnesses and proposed validation.
6. Supported semantic preservation and absence of new consequential errors.
7. Honest uncertainty, scope/refusal behavior and unresolved critical dependencies.
8. Reproducible final delivery plus separately reported cost and execution evidence.

Use the case map to expand these dimensions into actual obligations. Record each obligation and consequential current claim as complete, partial or unassessed, and its supported/contradicted/unresolved finding. These dimensions have no weights or aggregate numeric score. A dimension may be not applicable only with a case-grounded reason; it cannot hide an actual requirement. If an essential task, source pin or obligation is missing, report that boundary and continue independent checks that remain possible.

Inventory the current final's consequential factual claims, technical choices, purported executions and critical dependencies. Verify the important causal support, not only citation existence. A consequence is material when it can change a selected design, requirement, safety/correctness condition, implementation feasibility or claimed experiment outcome. Keep useful supported claims and correct uncertainty in the report so blanket rejection receives no credit.

## Source and witness procedure

Prefer actual primary documentation, original papers, pinned implementation source and issue/fix/regression artifacts. Read enough surrounding context to establish version, branch, preconditions, defaults, coordinate/unit conventions and normative force. A current page is not evidence of an older version without a version match. Issue comments are leads unless corroborated; an issue alone does not establish that a release has a fix. Preserve locators and retrieval dates, plus permitted local capture paths/hashes when available. A hash demonstrates identity, not semantic correctness.

Separate external facts, source-backed engineering inferences, optional product choices, proposed validation and open questions. Do not demand adoption of every discovery or treat an explicitly optional choice as a false fact. Confirm that claimed novelty is useful against the supplied brief or frozen plan; link counts alone do not establish discovery quality.

For every decisive witness distinguish `candidate_executed`, `evaluator_executed` and `proposed_unexecuted`. Check code/pins, inputs, expected-value justification, stdout/stderr/exit and relevant limitations. A receipt proves a run, not comprehension. A copied erroneous formula checking itself is not an independent expectation. An extracted function's behavior proves only its isolated scope. Evaluator execution can substantiate a defect, but cannot repair a missing candidate execution obligation. Proposed validation may be useful without being empirical evidence.

## Decisions

- **PASS:** every actual declared obligation and every consequential current claim is independently assessed; complete coverage is documented; no consequential unsupported assertion or unsupported critical dependency remains in the selected design; remaining uncertainty is correctly scoped. Any required history-dependent assessment must also be complete. Unknown economic counters limit economics, not an otherwise demonstrated semantic result.
- **FAIL:** at least one source-grounded consequential error, omission, false rejection or unmet required obligation establishes failure. Use defect IDs, concrete severity/rationale, exact output locators and evidence. An early failed screen is a legitimate FAIL with partial coverage; mark the remainder unassessed and do not claim a full audit.
- **HOLD:** no decisive failure established, but necessary evidence or critical dependency remains unresolved, or coverage is incomplete. Report the exact unassessed remainder. HOLD is not PASS.
- **NOT_EVALUATED:** no candidate artifact has been judged. Not-run/route-blocked work retains its execution status separately and is not a quality failure.

`screen_fail` and `full_case` are assessment modes, not alternate quality thresholds. Before an early screen ends, perform the common predeclared checks in both arms unless a specific missing artifact makes one impossible; disclose that asymmetry. Two FAILs do not imply equal quality. Report check-level repairs, detections, new errors and false rejections, and supported findings/opportunities actually delivered. Do not infer stable speed or general superiority from one pair.

## Report boundary

The reviewer reports current-output semantics first, then candidate method uptake/execution and economics after unblinding. Publication, later development and recipe selection belong to the coordinator. Fresh holdout truth notes remain evaluator-only until the locked block is over. Findings may guide a declared later development version, never alter a frozen original or leak into a locked candidate.
