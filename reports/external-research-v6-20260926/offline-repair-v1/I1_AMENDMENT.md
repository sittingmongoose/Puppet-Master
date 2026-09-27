# I1-1 closure — offline amendment, ready for run decision

The current-report/history and acquisition-inventory amendment requested against
`cdedeb74792c651dcd0e8e275ae3b026b14ae4a7` is implemented. This is development
evidence only. I1 has not run; its four investigator assignments and two formal
Opus 5.5 xhigh reviews still require a separate user go. R1b Block 2 remains
unauthorized. The original external review is preserved in `I1_REVIEW_REQUEST.md`.

## Changes and evidence

| Review requirement | Amendment | Evidence |
|---|---|---|
| Current-only report, complete current substance | `project_current`/`render_current` retain current typed parts, uncertainty, UNEXECUTED proposals and source provenance. Superseded history is excluded. | `tools/delivery.py`; projection and CLI tests in `tools/test_i1_projection.py` |
| Preserve audit/history separately | Required audit Markdown/JSON and exact raw draft outputs; snapshots and reasons remain deferred. Invalid current input yields a generic diagnostic without echoing historical payload. | `render-current`; CLI and invalid-carrier tests |
| Correct both arms prospectively | Control saves history separately from its exact authored current report; maintained saves revisions/snapshots separately from current records. Both carrier prompts are frozen before inference. | `prompts/investigator-{control,maintained}.txt` |
| First judgments precede acquisition disclosure | Staging copies only designated current reports under `first_view/results`; the existing workflow supplies case/key. Enumerated acquisition artifacts go under `deferred`, with a path/hash inventory. | `tools/stage_i1.py`; staged sentinel regression; `prompts/evaluator-i1.txt` |
| Honest evaluation boundary | Same two reviewer assignments and same readable workspace. Initial judgments are saved/fixed before deferred reads by prompt instruction; there is no filesystem barrier or host-enforced mid-run lock. Trace gaps and contamination must be disclosed. | `NEXT_TRIAL.md`; `proposal.json` |
| Temporal acquisition inventory | Control observations/history/snapshots/current; maintained chronological snapshots/raw revision history/current; existing native write traces only as corroboration. Earliest actually saved supported substance is the basis. | `proposal.json: acquisition_inventory`; evaluator prompt |
| Separate preservation endpoints | Mechanical current-record-to-render fidelity is separate from temporal semantic preservation. Legitimate correction/supersession is separate from loss; missing early records yield `not_recoverable`. | `proposal.json: preservation_endpoints`; evaluator prompt |

The sentinel appears only in superseded synthetic history. Tests require it to
be absent from current Markdown/JSON and the first-view package, while present
in the audit/raw records. Current uncertainty and proposed validation remain in
the current report. Staging also refuses reused or stray result files, unsafe
destinations and empty acquisition mappings; a nested deferred path named
`first_view` must stay classified as deferred. The helper copies artifacts; it
does not semantically cleanse an authored report or prove an inventory complete.

The independent Sol/high development review found no remaining I1-1 blocker
within its bounded scope. It is published as `I1_INDEPENDENT_DEVELOPMENT_REVIEW.md`.
It is not a substitute for the separately authorized formal Opus evaluations.

## Verification and preservation

All 30 portable tests pass: the unchanged original 26 plus four amendment tests.
The four amendment tests were also run by the independent development reviewer.
`I1_AMENDMENT_VALIDATION.json` records exact commands, results, source identities
and VM-only log path/hash pointers. The read-only preparation check verifies
129 original corpus files, unchanged driver/runtime pins, prompt composition,
finite capacity and disabled launch. No missing input was reconstructed.

The model assignments, schedule, caps, case identity, driver/runtime hashes,
candidate access rules and stop rules match the reviewed proposal. Existing
verifier decision functions and absence matcher remain unchanged. The two old
test modules, common instructions and future verifier prompt remain byte-identical.
The 62 historical runner regressions and original 3,403-file inventory comparison
are retained historical evidence; this amendment does not claim to rerun them.
Frozen R1/R1b reports, scores, runners and keys are not edited.

`I1_AMENDMENT_MANIFEST.json` freezes the affected lab files and this amendment's
evidence. `I1_AMENDMENT.diff` is an incremental lab-layout patch against the
published reviewed version. The original `MANIFEST.sha256.json`, `PATCH.diff`,
`CHECKPOINT.md`, development review and validation report remain historical.
`PUBLISHED_MANIFEST.json` binds every file actually available in the GitHub
package, distinguishing the original freeze from this amendment. Raw logs,
corpus, keys and run workspaces stay on the VM.

## Deferred issue and checkpoint

`V-FOLLOWON-1` is OPEN: **NOT QUALIFIED FOR FOLLOW-ON VERIFIER USE**. The broad
absence matcher can block ordinary missing-input conditions and unsupported-input
test proposals. It is outside I1's execution graph, not an additional I1 gate,
and has not been fixed here. See `FOLLOW_ON_VERIFIER_STATUS.md`. The review's
reproduction bundle was not attached; its `reproduce_review.py` was not rerun.

Next trial remains one matched pair per app, four serial investigator assignments
at most 1,800 seconds/160 responses each and two independent Opus reviews at most
2,700 seconds/160 responses each. Total scheduled model allowance is 12,600 seconds,
within a 14,400-second phase ceiling. These are experimental ceilings, not a normal
user latency target. No retries, replacement slots or automatic follow-on calls.

This amendment used Astra orchestration and the already explicitly configured
GPT-6 Sol/high implementation and independent development helpers. Development
usage stays separate; amendment token/cost totals and effective model settings
are not independently observed. The earlier reported 526,376 tokens/16m46s is
historical development accounting, not this amendment or recurring research cost.
Candidate calls, formal evaluation calls, account probes and new launch approvals
are zero. GitHub publication is covered by the user's existing visibility request.
Stop after publication, ready for a separate new-run decision.
