I1-1 technical sign-off
Verdict: APPROVED_FOR_I1 — technical readiness only.
Reviewed commit: 4a664731f46b2480de899b6b950d20350101fe16
Repository: sittingmongoose/Puppet-Master
Package: reports/external-research-v6-20260926/offline-repair-v1/
Review date: September 27, 2026
The named current-report/history boundary and acquisition-inventory requirements are closed for the bounded I1 investigator experiment. No further preparation redesign is requested. This sign-off is not a user spending authorization, a research-quality pass, or a qualification of the follow-on flash verifier. I1 remains pending the user's separate go and the existing launch-time checks. R1b Block 2 remains unauthorized.
What was independently checked
The GitHub package was read at the exact commit above. The review covered the README, I1 amendment, current projection and staging code, test modules, prospective carrier instructions for both arms, evaluator instructions, NEXT_TRIAL, proposal, independent development report, and published hash manifest. Five local source/test files match their Git blob identities and the SHA-256 values in the current published manifest.
- 30 unchanged portable tests passed: the original 26 plus the four I1 amendment tests.
- Four additional closure-probe groups passed, including the original previous-review history-exposure fixture.
- The inspected source files were hash-checked before and after the closure probes.
- No provider calls, candidate runs, formal evaluations, account probes, native Goals, approvals, commits, pushes, or canonical changes occurred during this review.
The original VM corpus, live runtime pins, evaluator keys, check_preparation.py, 62 historical runner regressions, and 3,403-file lab preservation comparison were not independently rerun here. They remain VM-side or historical evidence. The development review's separate execution of four amendment tests is reported in its document; this review reran all 30 portable tests rather than counting the two executions as extra tests.
Closed requirements
1. Current report versus history
delivery.py::project_current selects the current finding identities, titles, typed parts, text, and evidence without copying revision history. render_current displays that current material while retaining UNVERIFIED status and UNEXECUTED proposal labels. Conditions, implications, uncertainty, source fit, plan fit, and non-findings are not discarded merely because they are not empirical assertions.
The render-current command retains full audit Markdown/JSON and exact raw draft bytes as separate outputs. A malformed input produces a generic current-view error rather than echoing historical payload into the initial evaluator view.
The original synthetic marker that previously appeared in the final-first report now remains absent from current Markdown and JSON and present in the audit. A second probe checked all eight part types, source fields, multiline content, and projection independence from mutation of the original object.
2. Both arms and first-view staging
The control prompt now requires a current-only authored out/draft.md, with history and revisions elsewhere. The maintained prompt separates current parts from historical revisions and instructs the host to render only current content.
stage_i1.py copies the two designated reports byte-for-byte under first_view/results/X1/current.md and X2/current.md. Explicitly mapped acquisition artifacts are copied under deferred/, with path/hash inventory records. The synthetic closure probe verified exact current bytes, separate historical text, correct inventory hashes, and refusal to reuse populated result directories.
This does not prove semantic cleanliness of future candidate-authored prose. If the control includes historical content despite its prompt, preserve and report that contamination; do not silently rewrite it or award a clean first-view boundary.
3. Acquisition inventory and preservation measurement
The amended evaluator prompt and proposal define the acquisition inventory from actually saved chronological observations, qualifying blocks, revisions, snapshots, and current records. Existing write traces may corroborate chronology. Unsaved earlier discoveries are not reconstructed from a polished final answer.
The two outcomes are correctly separated:
- Mechanical render fidelity: current frozen records to current report, or exact authored control report to its copied final.
- Temporal semantic preservation: source-supported material actually recorded during investigation to the final report, distinguishing legitimate correction/supersession, accidental narrowing/loss, contradiction, and visible uncertainty.
Missing necessary early records are reported as not_recoverable, with the observable subset and chronology limits. A renderer copying its own final input cannot establish temporal preservation. A partial lead is not silently counted as a fully established finding.
Reviewer chronology: accepted with the stated limitation
The first-view and deferred directories remain readable within the same evaluator workspace. The evaluator is instructed to assess only current reports and fixed source/key inputs first, save initial judgments, then inspect deferred acquisitions without rewriting those initial judgments. Later corrections are separately labelled errata.
This is prompt-controlled chronology, not filesystem isolation or a host-enforced mid-run lock. For this bounded diagnostic, that disclosed limitation does not require another preparation cycle. Existing read/write traces should be used as specified to report early access, later judgment edits, or unavailable chronology. Contaminated or unobservable ordering cannot support a claim of clean staged independence. This sign-off does not turn the prompt rule into an enforced boundary.
What remains outside this sign-off
V-FOLLOWON-1 remains OPEN and NOT QUALIFIED FOR FOLLOW-ON VERIFIER USE. The overbroad absence matcher can still confuse missing-input conditions and unsupported-input test proposals with source-absence assertions. The amendment correctly leaves this issue outside I1's execution graph. Do not invoke the review assembly path as a flash verifier in I1, and do not treat this sign-off as closure of that defect.
The existing runner, native Goal adapters, model identity configuration, source acquisition effectiveness, and semantic grading reliability have not been recertified here. There is no end-to-end quality or speed result yet.
Approved technical scope
Retain the frozen I1 design:
Order	Assignment	Application/model	Effort
1	I1-M-control	Muse Code / Muse 1.3 Contributor	Max
2	I1-M-maintained	Same	Max
3	I1-Z-maintained	zcode / GLM 5.3 Flash	Max
4	I1-Z-control	Same	Max


Two independent Opus 5.5 reviewers at requested xhigh follow, one per application pair. Codex/Astra xhigh remains the temporary experiment orchestrator, with the previously authorized Sol high/medium development helpers—not substitute candidate researchers or formal graders.
Caps remain unchanged: 1,800 seconds and 160 responses per investigator; 2,700 seconds and 160 responses per evaluator; four investigators and two evaluators; serial execution; 12,600 seconds maximum scheduled model span within a 14,400-second phase ceiling; no retry or replacement slots. These are experiment ceilings, not product latency targets. Keep existing quota, receipt, failure-precedence, corpus, freeze, and incomplete-output rules.
No R1b reruns, Block 2, extra investigators, additional model families, premium candidate assistance, live discovery expansion, canonical repair, WorkNodes, or follow-on flash verifier is authorized by this review.
How the result should be interpreted
I1 tests whether maintained complete findings improve investigator acquisition/report production compared with observations followed by a separately written draft. Judge source-supported acquisition, temporal preservation, adverse findings, and actual time/usage together. Do not reward copying unsupported text or merely enlarging the report. One matched pair per application on this familiar fixed-source development case cannot establish reliability, autonomous live-source discovery, or whole-project production economics.
A promising component result still requires later, separately authorized evaluation through a qualified flash verifier before an end-to-end claim. An inconclusive or failed result should remain visible without additional best-of attempts.
Reproduction
From this review bundle:
PYTHONDONTWRITEBYTECODE=1 python3 -m unittest discover -s source/tools -p 'test*.py' -v
PYTHONDONTWRITEBYTECODE=1 python3 reproduce_closure.py
portable-tests.log, closure-results.json, and source_hashes.json contain the local outcomes and exact file identities. All probes use synthetic data; the original P1 fixture is copied unchanged from the prior review bundle. The source copies are review evidence, not a production patch.
Source references
All paths below are relative to the package at the pinned commit:
- README.md, I1_AMENDMENT.md: scope, reported checks, historical limitations.
- tools/delivery.py: current projection and separate raw/audit outputs.
- tools/stage_i1.py: report/deferred copy boundaries and inventory.
- tools/test_i1_projection.py: four published amendment regressions.
- prompts/control-carrier.txt, prompts/maintained-carrier.txt: prospective output contracts.
- prompts/evaluator-i1.txt: saved initial judgments, deferred acquisition inspection, and separated metrics.
- NEXT_TRIAL.md, proposal.json: frozen assignments, caps, disabled launch, and follow-on exclusion.
- PUBLISHED_MANIFEST.json: current publication hashes.
- I1_INDEPENDENT_DEVELOPMENT_REVIEW.md: the prior bounded Sol review and its own stated limits.
Next action: obtain the user's separate I1 run approval and execute the existing bounded comparison after normal launch-time checks. No further I1-1 repair is requested.