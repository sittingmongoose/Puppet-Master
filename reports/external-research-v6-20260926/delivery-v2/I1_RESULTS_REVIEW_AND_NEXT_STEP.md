I1 results review — fix the delivery interface before another research campaign
Reviewed commit: 3aadcea3e7be7e83f764107ba53d824b84575f65
Repository: sittingmongoose/Puppet-Master
Result: Accept I1 as closed with no quality pass. Do not promote the maintained implementation, retry I1, or infer that maintained findings or flash research are disproven. No new execution authorization is granted by this review.
Review scope and limits
This review inspected the published I1 result, numerical usage, Muse evaluation, zcode evaluator refusal, candidate metrics, selected mechanical audit records, and the actual maintained/evaluator prompts. The original candidate JSON, source corpus, complete acquisition traces and raw provider logs remain VM-only. Their path/hash pointers do not give this reviewer access to their contents.
One unchanged copy of offline-repair-v1/tools/delivery.py was recovered from the previously uploaded I1 sign-off archive and matched to its GitHub blob at this commit: d2c6f006818d7a3812e32bd03c3a394009b4de2d. Three synthetic CLI checks reproduced valid current/history separation, whole-document rejection after one missing comma, and whole-document rejection after a top-level snapshots_note. Those are the intended frozen validator behavior, not three newly discovered bugs. They do not reproduce the VM-only real carriers or verify their substantive content.
No model calls, native Goals, account probes, canonical changes, or remote writes were performed. This review does not claim to rerun the old 30-test suite or all publication checks. reproduce_review.py and review_checks.json document the actual local checks and arithmetic.
1. Findings supported by the published evidence
The proposed maintained implementation failed the deliverable requirement
Muse control took 760.3 native-reported seconds and produced a current report. Muse maintained took 1,122.3 seconds, reached native Goal completion, but its JSON did not parse. The Muse reviewer reports extra closing braces at finding-batch boundaries and no saved snapshots.
Zcode control took 1,416.5 seconds and produced a current report, but received no formal semantic grade. Zcode maintained ran to the time cap, with a receipt of 1,817.1 seconds including stop cleanup. Its JSON parsed, but the strict schema rejected a top-level snapshots_note.
For zcode, this is the first reported schema failure, not proof that removing that field would make the entire document valid or complete. Both maintained runs yielded a 130-byte diagnostic as their designated current artifact. Raw work remained in audit storage.
Rejecting those outputs was correct under the predeclared contract. Changing the schema, deleting a field, repairing braces, rendering a different answer, or regrading such an answer after the fact would not rescue I1. Derived copies can be used as clearly labeled development fixtures, never as replacement scored outputs.
The preservation hypothesis remains unresolved
The Muse reviewer found useful raw maintained material, including stronger label-association detail than the control, but that raw material was not the current deliverable and its full source support was not established. Its inventory of 15 raw findings is not 15 certified findings.
The control review reports 45 observation blocks with 30 retained, 12 narrowed, and 3 lost. The report explicitly warns that these are inventory dispositions, not an exhaustively verified supported-acquisition rate. Do not present 30/45 as a calibrated research-quality measure.
The maintained arm had no saved snapshots. Under the declared protocol its temporal preservation denominator was not_recoverable. This is a measurement failure in addition to serialization failure. Do not infer missing chronology from final prose.
Evaluation was incomplete and partly compromised
The zcode reviewer made one response and no tool calls: it refused to begin because the prompt explicitly said it was prepared for a future, separately authorized evaluation. Operator authorization existed, but the model-facing input did not convey the live authorization. This is evaluation non-execution, not a zcode semantic grade, quota stop, or inability to perform research.
The reviewing assistant previously approved that frozen prompt and missed the contradiction. It is an avoidable preparation/launch defect shared by the review process, not something to blame on the evaluator.
Muse's initial root glob crossed the prompt-defined first-view boundary. The returned listing exposed first-view filenames and an aggregate match count, not deferred filenames or contents. Initial judgments were written before explicit deferred reads and were not subsequently edited, according to the published audit. Retain the protocol breach and its limits; neither claim perfect independence nor assert an answer-key leak that the evidence does not show.
2. Economics
Calculated from selected fields in i1/USAGE.json:
Maintained versus control	Muse	zcode
Native elapsed time	+47.6%	+28.3%
Reported output tokens	+39.1%	+20.7%
Reported cumulative input	+47.5%	-23.9%
Exposed input minus cache-read counters	+37.3%	-0.18%


The final row is not full spend. Muse child tokens are unavailable; zcode control lacks a delta for one of 42 requests, and the maintained run was capped. Cumulative cached input is not unique context or subscription debit. These observations do not isolate the cost of JSON, history, research breadth or any other component.
Four candidate assignments total 5,116.2 seconds (85.3 minutes); the two evaluator invocations total 724.8 seconds (12.1 minutes). Their sum is 5,841 seconds (97 minutes 21 seconds), not a measurement of full project/development wall time. The shorter evaluation total includes a reviewer that did no grading and another with unassessed scope; it is not an evaluation efficiency win.
Neither maintained run delivered a valid report, so no useful same-quality speedup exists in these samples. Increasing time caps is not the demonstrated remedy: Muse completed with bad syntax before the cap, and zcode's last saved output also violated the schema.
3. Main design correction: research is not a JSON endurance test
The maintained prompt asks a model to accumulate a large document, maintain globally unique finding/part IDs, preserve previous whole records and revision history, save separate snapshots, and emit a coherent current report. It forbids shell use and tells the investigator not to run the renderer. The declared path validates only after termination; it provides no usable pre-freeze structural feedback mechanism.
This makes the failure domain the entire report. It also assigns the model substantial bookkeeping that the host could perform. An offline validator rejecting malformed fixtures demonstrates rejection behavior; it does not demonstrate that the native app can reliably author the carrier.
Preferred bounded candidate for the next development phase
Keep complete semantic findings, but use a small independently valid record as the write unit. One coherent finding per file or existing structured native submission is sufficient; this is not one model task per finding. Preserve necessary relationships and whole-finding context.
Use a small fixed draft shape and reuse the existing field meanings. Prefer a supported native structured operation when one already exists. Otherwise use simple per-finding files and a narrowly permitted structural checker. Confirm the actual app/tool route locally; do not assume a particular CLI can expose a custom tool and do not build a new Goal engine or provider transport to make it happen.
The host should handle serialization where possible, stable record/revision bookkeeping, byte snapshots and current/audit projections. A model should supply substantive claims, conditions, implications, source locators, proposed validation and uncertainty, not repeatedly regenerate audit history.
Provide structural feedback within the same live native Goal and its declared budget: parse error location, unknown field, duplicate identity, missing required field, or failed write. This is not semantic help and must not reveal sources, key answers, reference IDs, or grading advice. Log every correction and its cost. No fresh best-of retry, premium repair, silent host correction, or post-freeze rescue is permitted.
A bad record must remain explicit and must prevent an overall complete/pass claim. It need not erase valid independent records. If a revision of an existing finding is invalid, surface that pending/invalid revision; do not silently present the old version as the accepted latest result. Keep stale, current, unresolved and invalid states distinct without adding a large new lifecycle system.
Do not merely ignore all unknown fields. A snapshots_note may contain information about missing history; raw bytes and diagnostics must survive. Any permitted metadata/extension field must be designed prospectively and must not become a route for hiding conditions or unexamined substantive claims.
Keep the next implementation narrow
Reuse the working drivers, caps, receipt handling, corpus boundaries and current/history splitter. Do not rebuild the framework, add a new database, expand the models, or change canonical PM files. Leave V-FOLLOWON-1 open and outside the experiment until a later verifier integration is separately authorized.
4. Fix evaluator launch semantics explicitly
Separate the immutable evaluation task from a small, actual launch envelope. Before dispatch, host-side checks must establish a real user approval for the exact finite schedule; only then may the native user message state that this specific evaluation is authorized now.
The envelope should carry the blinded evaluation identifier, allowed workspace, task-spec hash, limits and permitted outputs. Keep model/treatment labels, economics, answer keys beyond the already authorized evaluator reference, and expected outcomes out of it. Record the composed input hash where available; do not claim provider-received payload proof when the driver does not expose it.
A prospective task spec can require a valid launch envelope. It should not simultaneously instruct an authorized worker that the current message is merely preparation and gives no permission to begin. Do not forge approval, inject authority through source files, or tell agents to ignore safeguards.
Test approved and unapproved composition offline, including the final worker-facing text. File hashes alone cannot detect a semantically contradictory instruction.
Retain the current/history split. Scope the first commands to the named current-view paths; avoid a reflex root-wide glob. Prompt-only sequencing remains a disclosed diagnostic limitation. Do not add a new access-control service as a prerequisite. If strict independence becomes a qualification requirement later, enforce that narrower requirement then rather than claiming it now.
5. Do not buy another full campaign to discover an interface defect
Recommended sequence, not spending authorization:
1. Offline, on the VM: retain immutable I1 failures; create clearly labeled derived or minimized structural fixtures from them. Exercise the receiving/validation interface, current/history projection, complete validation proposals, history capture, unknown-field and interrupted-write handling, and authorization-message composition. Share minimal code/fixtures that can be published without corpus/key leakage; do not publish raw provider transcripts to compensate for missing compact evidence.
2. Separately authorized native delivery check: one short synthetic assignment per requested app using its real native /goal and the proposed carrier/checker. Include an initial finding, a revision with code/quotes and conditions, an UNEXECUTED proposal, uncertainty, and a non-finding. Check actual saved history and current output mechanically. This is a small new development trial, not an I1 retry or research-quality benchmark. No premium full-corpus grader is necessary to count files or verify structural acceptance.
3. Only after a usable interface is demonstrated: propose the next research comparison at a new freeze. Preserve the same research obligations and meaningful quality bar. Any common structural-feedback capability should be declared consistently across the comparison; treat differences in representation/feedback policy as part of the treatment, not an isolated proof about syntax.
4. Only after a promising investigator result: repair/qualify the later flash verifier and evaluate the full pipeline. Autonomous discovery and held-out cases remain later qualification requirements.
Predeclare whether an invalid current report triggers only deterministic delivery-failure accounting or a specifically budgeted semantic diagnosis. Do not automatically buy a full premium comparison of an empty diagnostic. All attempts must remain in the denominator and failures remain failures; skipping a redundant grade is not permission to discard failed trials or replace slots.
6. What remains unchanged
- Orchestration: Codex Astra xhigh; Sol high/medium for appropriately bounded development.
- Research candidates: Muse Code Muse 1.3 Contributor Max and zcode GLM 5.3 Flash Max; same native applications, not substitutions through another CLI.
- Formal semantic evaluation: independent Opus 5.5 requested xhigh when separately authorized; requested and observed settings stay distinct.
- Native /goal is settled. Fresh candidate assignments and clean inputs remain.
- No premium case-specific help to scored flash candidates.
- Sandbox-only, TEST_ONLY_NEVER_PROMOTE; no canonical repairs, governance landings, WorkNodes or unrelated planning optimization.
- I1 and R1b Block 1 remain frozen. R1b Block 2 remains unauthorized.
- No new run, replacement evaluation, or account usage probe is authorized by this review.
Source map
All paths are repository-relative at the reviewed commit.
- I1_RESULTS.md: declared outcomes, failures, chronology and limitations.
- reports/external-research-v6-20260926/i1/USAGE.json: exposed usage and time counters.
- reports/external-research-v6-20260926/i1/eval/I1-REV-M/review.md: semantic findings and incomplete coverage; no raw-carrier reproduction claimed here.
- reports/external-research-v6-20260926/i1/eval/I1-REV-Z/terminal-response.md: explicit authorization-based non-execution.
- reports/external-research-v6-20260926/i1/runs/I1-M-maintained/metrics.json: native completion, one frozen output and ten write/edit operations.
- reports/external-research-v6-20260926/i1/runs/I1-Z-maintained/render.json: schema rejection and 94,978-byte raw-draft identity.
- reports/external-research-v6-20260926/i1/runs/I1-Z-maintained/EVIDENCE.json: scope of published copies and VM-only raw evidence.
- reports/external-research-v6-20260926/i1/checks/execution-boundary-audit.json: runtime/prompt identities, observed execution boundaries.
- reports/external-research-v6-20260926/i1/checks/final-investigator-and-staging-audit.json: output, corpus and staging identity checks, not semantic grades.
- reports/external-research-v6-20260926/offline-repair-v1/prompts/investigator-maintained.txt: actual authoring requirements and no-renderer instruction.
- reports/external-research-v6-20260926/offline-repair-v1/prompts/evaluator-i1.txt: actual pre-authorization wording and first-view sequence.
- reports/external-research-v6-20260926/offline-repair-v1/tools/delivery.py: frozen whole-document validation/projection behavior.
The next objective is not to weaken correctness. It is to stop making a punctuation error or misplaced metadata erase an entire otherwise inspectable research attempt, and to stop assigning work to evaluators with contradictory launch instructions.