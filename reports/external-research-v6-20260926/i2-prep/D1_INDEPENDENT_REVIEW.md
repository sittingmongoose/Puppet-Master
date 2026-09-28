Delivery v2 / D1 independent review and next step
Reviewed commit: 9a345ce3377e7a412fa32884d709f5379360740b.
Repository: sittingmongoose/Puppet-Master.
Report root: reports/external-research-v6-20260926/delivery-v2/.
Decision
Retain delivery v2. D1 remains closed with its original outcomes: Muse 15/15;
zcode 14/15 and structural_checks_passed: false. Neither is a semantic research
qualification, and the pair is not retrospectively a two-app pass.
The named zcode miss is a limitation of the global lexical criterion, not evidence
that the host restored the superseded Alpha assertion. Make a small prospective
criterion amendment and offline regression, then prepare the next bounded research
comparison. Do not erase legitimate source provenance, rescore D1, or buy another
D1 pair just to change the displayed score. No new host implementation blocker was
found within this limited review; this is not exhaustive security certification.
This note authorizes no candidate/evaluator run, retry, approval creation, or
production change. Any future inference needs its separately authorized new freeze.
Evidence and verification scope
The reviewer read the published results, D1 spec, actual zcode current report,
native audit summaries for both apps, task prompts, and the three new host modules.
Local copies of delivery_store.py, evaluator_launch.py, run_delivery_check.py,
the pinned prior delivery.py, the exact zcode current report, and four other reused
source/test files match their published SHA-256 identities (nine files total).
Executed offline:
- 10 new independent probe groups: all pass. These exercise the unchanged host code,
  its frozen lexical predicate, synthetic record/revision failures, and a mocked
  evaluator dispatch callback.
- 30 unchanged reused portable tests: all pass.
The reported 52 new agent-authored tests were inspected in part but were NOT rerun
as a complete suite here. Do not describe this review as independently reproducing
52 + 30. Raw native logs, payload snapshots and the full VM lab remain unavailable;
the native audit summaries are reviewed evidence, not a private-log reproduction.
No native app, model, provider, evaluator, or account call was made in this review.
No original D1 output or score was changed.
Reproduce the independent checks:
PYTHONDONTWRITEBYTECODE=1 python3 reproduce_review.py
PYTHONDONTWRITEBYTECODE=1 python3 -m unittest discover \
  -s source/offline-repair-v1/tools -p 'test*.py' -v
The probe fixture is synthetic development material, not an OME answer or a
reconstruction of unsupplied native payloads. The published zcode Markdown is an
exact byte-checked copy of the real current report; it is inspected, not rewritten.
What is genuinely better
The unit of structural acceptance is now a whole coherent finding, rather than
one project-sized JSON document. Native file tools submit a payload and ready
marker. The host snapshots them and returns structural feedback during the same
Goal. It assigns IDs/revisions, serializes JSON and renders current/history views.
The native audit summaries report all four payloads and markers saved, all feedback
read, a rejected Alpha update withholding Alpha without erasing the independent
red-mode record, and a corrected Alpha submitted within the original Goal. The
local probes confirm the corresponding host behavior and snapshot-before-receipt
ordering in synthetic executions.
This addresses the I1 failure mode where a single syntax error or unsupported
whole-document field removed every finding from the designated report. It does
not prove substantive discovery, logical correctness, completeness, or general
self-correction. D1 deliberately prescribed the error, the expected rejection,
and the correction; it was a scripted protocol exercise.
Marker criterion: preserve history boundaries, not token disappearance
The actual frozen check in tools/run_delivery_check.py::structural_checks is:
"ALPHA_V2" in current and "ALPHA_V1" not in current and "ALPHA_PENDING" not in current
In the exact published zcode current report, the only ALPHA_V1 occurrence is in
F0002_NON_FINDING, identifying the source scope as “revisions 1–2, markers
ALPHA_V1/ALPHA_V2”. It is not the current Alpha assertion. Alpha's current assertion
uses ALPHA_V2 and 3 units. ALPHA_PENDING is absent. The native audit traces the
reference to the original independent red-mode submission, not a host fallback.
The invented source explicitly contains both revision identifiers. Accurately
identifying that source should not, by itself, constitute restoring stale canon.
The independent non-finding remains a current proposition about the source's scope;
its source identifiers should not be deleted merely because an older identifier
also appears in historical evidence.
Two offline probes establish why the global predicate is a poor proxy:
1. The unchanged store correctly projects the latest Alpha and unchanged independent
   record, but the predicate fails when the independent record accurately references
   both source versions.
2. A deliberately wrong synthetic latest Alpha can say “Alpha reports 2 units”
   without the old marker, while ALPHA_V2 appears in source metadata; the lexical
   predicate passes. This is not a claim that the actual zcode answer did this.
Thus the old predicate is neither a reliable test of active meaning nor a complete
lineage check. Preserve its historical outcome, but do not use it as the gate for
all future research reports.
Prospective criterion
Freeze a new rule before any future run. Distinguish:
- Record lineage/projection: every displayed current field comes from the
  latest accepted record for that identity; an invalid latest update withholds
  that identity instead of silently restoring an older one.
- Unchanged independent records: remain byte/field faithful to their own latest
  accepted record, including legitimate source references.
- History separation: superseded raw record bodies and rejected attempts stay
  in audit/history unless current, explicitly scoped content intentionally cites
  source material. Do not silently scrub model text to satisfy a marker scan.
- Synthetic task content: check the specified new Alpha value/condition in
  the designated current proposition, with known negative fixtures. Do not infer
  semantic success from a marker anywhere in the report.
At minimum test a legitimate old-version citation, a true stale Alpha fallback,
an invalid latest update with an unaffected independent record, and a missing
necessary condition. Also include a stale-rule assertion embedded in a field called
source_fit or condition: field names must not provide a blanket semantic exemption.
For a general research case, semantic source/version applicability remains reviewer
work; a structural validator does not prove it.
Do not change D1's outputs, criteria, result JSON or published score. Store the new
criterion and analysis as prospective work, with separate identity and tests.
Evaluator composition
The new gate binds the task hash, blinded assignment/workspace and finite limits
to live host authorization; its message explicitly states that execution is now
authorized. This addresses the earlier task-only wording that caused a reviewer
to refuse an already-authorized evaluation.
The gate passed local authorized/unauthorized and callback-failure probes. This
is offline composition evidence, not a completed native evaluation. Its comments
correctly disclose instance-local consumption: the future trusted launcher must
use existing durable run accounting and retain the instance over the admitted
schedule. Do not interpret constructing a new gate object as renewed permission.
No new authorization service or native evaluator smoke call is required here.
Use the composed message at actual dispatch, not the task file by itself. Inspect
that composed input offline and preserve its identity. Keep the scoped first-view
instructions and the existing honest prompt-only chronology limitation.
Efficiency and scope
The reported native checks used 18 + 17 = 35 parent responses and 258.2 + 219.6 =
477.8 seconds (7m57.8s). Muse also reports ten reminder-child attempts with unknown
tokens. Zcode lacks a usage delta for one of seventeen requests. Dollar/subscription
cost is not established.
The user's roughly 36-minute outer Goal figure covers a different work envelope.
The available report does not allocate every minute or make it a recurring per-topic
production cost. Do not call 477.8 seconds a research latency or the residual a
measured orchestration-only tax.
There is real potential per-record overhead: payload Write, marker Write and
receipt Read are at least three tool operations before optional status polling.
Several operations may share a response where the native protocol permits; do not
translate tool count directly into model turns or extrapolate the scripted D1
runtime linearly to a full project. Measure actual calls/tokens, validation waits,
host work and final quality in the research workload.
Do not silently carry D1-specific 16-attempt or 16-KiB limits into the next research
claim as universally suitable. Declare finite research capacities prospectively,
count initial writes AND revisions/invalid attempts, and preserve honest incomplete
outcomes at limits. Never truncate material findings to hide a cap. No increased
allowance is authorized by this review.
Next step
1. Make the small prospective criterion/test amendment, preserving D1. No host or
   Goal redesign is needed for that change.
2. Prepare a new bounded investigator comparison using the now-exercised delivery
   path. Keep the requested applications/models and legitimate matched input corpus.
   Declare whether the treatment includes both maintained findings and structural
   feedback; do not later claim that it isolated representation alone. Record the
   control's feedback policy explicitly.
3. Measure source-supported acquisition, temporal preservation, structural delivery,
   output validity and full time/usage separately. The truth check is not a rendering
   check. Retain proposed validation as UNEXECUTED and current uncertainty as current.
4. Predeclare evaluator admission for diagnostic-only failures: no need to buy a
   premium semantic assessment of an empty invalid-carrier report merely to conclude
   that delivery failed. Keep failed attempts in all experiment accounting; no
   replacement candidates or hidden best-of selection. A separately justified raw-
   output semantic diagnosis is a different expenditure, not automatic.
5. Freeze and publish preparation, then obtain the separate new-run approval. Do not
   rerun D1 just to get two 15/15 labels when only the scoring rule changed.
Keep Codex/Astra xhigh orchestration and Sol high/medium development helpers. Candidate
research stays Muse Code / Muse 1.3 Contributor Max and zcode / GLM 5.3 Flash Max.
Formal semantic evaluation remains independent Opus 5.5 requested xhigh after freeze
and actual authorization. Preserve requested/observed distinctions.
V-FOLLOWON-1 remains OPEN and outside this investigator/delivery work. R1b Block 2,
I1 retries, follow-on verifier use, canon/governance changes and WorkNodes remain
unauthorized. No real PM plan repair is a prerequisite.
Published source pointers
All paths below are under the report root at the reviewed commit:
- RESULTS.md, D1_SPEC.md, README.md: scope, fixed result and reproduction limits.
- runs/zcode/store/current.md: exact lexical failure location and current Alpha.
- tools/delivery_store.py: per-finding parsing, snapshots, latest-state projection.
- tools/run_delivery_check.py: actual frozen lexical predicate and D1-only limits.
- tools/evaluator_launch.py, prompts/evaluator-task.txt: composed authorization.
- prompts/delivery-check.txt, fixtures/SYNTHETIC.txt: scripted task and source.
- evidence/d1-{muse,zcode}-native-audit.md: published native sequence/identity summaries.
- evidence/d1-usage.md: counters and uncertainties.
- PUBLISHED_MANIFEST.json: byte identities used by this review.
Entry point: https://github.com/sittingmongoose/Puppet-Master/blob/9a345ce3377e7a412fa32884d709f5379360740b/reports/external-research-v6-20260926/delivery-v2/RESULTS.md