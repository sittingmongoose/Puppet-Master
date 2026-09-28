A1-M results review — native result annotation boundary
Decision
Keep A1-M closed as FAIL / INCOMPLETE. CHANGES_REQUESTED_NATIVE_RESULT_ADAPTER_ONLY.
Reviewed publication: f250bb8acd0ccf882d47813ed811195285bfd90c.
Approved implementation used by A1-M: 655fa669c71fa9832df479a16efd3b54f425dd08.
Repository: sittingmongoose/Puppet-Master.
Experiment root: reports/external-research-v6-20260926/.
This review recommends a bounded offline compatibility repair. It does not authorize a retry, replacement, new native check, evaluator, account probe, research campaign, or canonical edit. I2 remains closed, its zcode originals remain unstarted, and V-FOLLOWON-1 remains OPEN.
Evidence reviewed and independently reproduced
Read the current publication's a1-m/RESULTS.md, checks/failure.json, checks/structural-audit.json, PUBLICATION.json, MANIFEST.json, operator/run_a1.py, and the frozen reader's result handling.
The local unchanged native reader matches Git blob 500f7f132770859c87ed28db6af55d62faa3a542 and the published SHA-256 83dac66a29bc0778ed0edfa134fd04db03eda34602e5c80d5938c17c4dc2fd38.
Ran the existing changed-boundary suite unchanged: 36/36 passed. Ran eight additional characterization tests, all of which reproduced their stated expectations. In particular, all six published annotated result strings are rejected by the unchanged reader. The synthetic test templates reconstruct the published templates and match all six published 1,194-byte template hashes. The event envelopes are synthetic; they are not a replay of private native journals.
An OK characterization result means the frozen implementation's behavior reproduced, not that the native experiment passed or a proposed repair is validated. No production source was patched. All 12 supporting source/test/fixture files copied from the previous uploaded review bundle remain byte-unchanged after execution.
Raw native logs, original pending snapshots, and the VM's 464-file preservation comparison were not independently replayed or rehashed here. No provider, native Goal, reviewer, or account calls occurred. No independent research-quality grade was attempted.
1. What happened
The publication records six successful payload Writes in one call batch. For each, requested contents, live bytes, and retained pending bytes match the template. A native result is shaped as:
wrote 1194 bytes to <exact absolute payload path>; note: near-duplicate sibling <filename> exists in this directory — verify this new file is intended
CompletionReader._result() requires equality with the entire bare sentence:
expected = f"wrote {operation['content_bytes']} bytes to {operation['path']}"
if result.get('text') != expected:
    raise ValueError('native write result path/byte-count mismatch')
The appended native-tool annotation therefore faults the reader even though the header's path and count match. The host stops at the first payload-result batch. No markers, acknowledgements, independent seventh finding, or revisions occur.
This is an unhandled result variant in the adapter. It is not evidence that the model changed source bytes, that marker readiness still races, or that maintained research is ineffective. The failed check also does not demonstrate that the marker race is fixed live: that part of the sequence was never reached.
The previous technical review should have challenged the closed-string assumption. A bound native lifecycle and exact data verification should not be conflated with byte-identical human-readable explanatory prose.
2. Required repair — exact operation facts, separately retained advisory text
Keep completion correlation, operation ordering, exact data verification, and snapshot-before-ack. Change only result interpretation at the observed Muse adapter boundary.
The prospective contract should distinguish:
- Operation evidence: bound session/run/call/task/effect, successful terminal, expected result identity, exact path and UTF-8 byte count, matching submitted/live/snapshot hashes, and payload completion before marker start.
- Native advisory text: preserved verbatim with the operation and available for inspection, but not treated as payload corruption merely because it extends the human-facing success sentence.
For this patch, accept the plain success form and the evidenced near-duplicate-sibling form using an unambiguous exact success header and explicit annotation boundary. Apply the same result interpretation to payload and marker Writes; do not special-case only the first six payload paths. Do not grant all arbitrary trailing text a success exemption. Failed terminal events, contradictory statuses, missing identities, wrong counts/paths, and mismatched bytes must still prevent acceptance. Unknown result variants should be reported as such rather than mislabeled as a proven byte/path mismatch.
A plain startswith(expected) is insufficient: a different filename such as <expected-path>.other also passes that check. The review's synthetic probe demonstrates this. Do not strip punctuation, normalize paths loosely, search for the word wrote anywhere, or truncate the native record before preserving it.
A recognized near-duplicate note is not a source finding or instruction to rewrite the templates. It must not be suppressed by making the fixtures less alike. The issue is how the receiver interprets a completed native operation, not whether the experiment can avoid provoking a legitimate tool annotation.
Do not invent a structured provider field that this actual native route does not expose. Use the existing call/lifecycle/result information. This does not require a new transport, Goal engine, global message schema, or another research-model stage.
3. Close the gap offline using captured evidence
Use a fresh successor module/archive; preserve the rejected source and results unchanged.
Required focused evidence:
1. Parse the actual stopped A1-M journal read-only with the patched reader. It should recover the six completed payload proofs without the suffix fault. It must still report zero marker submissions and zero acknowledgements, because those operations never happened. Do not instantiate a mutating Store against the original workspace or synthesize missing operations into this replay.
2. Exercise plain and annotated results with the same reader-to-Store path, using clearly labeled synthetic subsequent markers and preserved byte hashes. These are integration regressions, not rescued A1 results.
3. Keep negatives for wrong path, path-prefix lookalikes, wrong byte count, failed terminal despite success-shaped prose, missing result, mismatched filesystem bytes, true mutation, and duplicate notifications.
4. Reuse the existing interleaving, latest-revision, pending/cancellation, snapshot, and idle-publication tests. Do not rebuild those mechanisms.
5. Examine distinct result forms already present in the existing stopped local logs. This is bounded local parsing, not permission for new account/model probes or a general vendor-protocol research project.
The proposed change is not qualified by this review; these are closure criteria for the implementing agent. Keep evidence-backed distinctions between raw-log replay, synthetic regression, and future live integration.
4. Two reporting fixes that do not require new inference
Incorrect expected-prefix field
a1-m/checks/failure.json renders frozen_reader_expected_result with a relative a1-m-20260928/ws/... path. The reader actually binds an absolute workspace/path. As printed, result_has_matching_prefix: false therefore does not establish a path mismatch.
Using the actual absolute path, every published result has the expected completion header plus the note; whole-string equality remains false. The independent probes check both facts. Append an erratum or successor diagnostic using the actual binding; do not replace the frozen failure record. This correction does not change A1-M's outcome or root cause.
Cascading audit failures
The automatic audit raises a KeyError for the absent acknowledgement and then multiple dependent AttributeErrors. These are not separate proof that lineage, overlap, or independent preservation were exercised and found wrong. Keep the overall failed/incomplete result; prospectively give dependent checks an explicit not-reached or unavailable status while retaining the root error. A zero-ack fixture can validate this offline. No broad audit framework is needed.
5. Time and process efficiency
From the published timing record:
Interval	Seconds
Staging through execution, cleanup, freeze, automatic audit	41.323
Pre-execution orchestration, including inspection and one-use operator/audit construction	464.246
End of automatic check to first push confirmation	357.287
Goal start to first push confirmation	862.856


Thus 821.533 seconds of that particular 862.856-second interval were outside automatic execution/audit. This is development and publication overhead for this diagnostic, not recurring production research cost or a token-billing calculation. The user-reported 15m37s full Goal is a different endpoint from first push confirmation.
Publication confirmation occurred 398.609 seconds after the run clock began. The earlier actual push finish was unmeasured. Keep the report's conclusion: broader workflow completion within 390 seconds was not established. Do not retrospectively claim compliance or erase the distinction.
Before the next authorized check, reuse and parameterize this existing operator/audit where practical instead of authoring another one-use pair. Fix its no-ack reporting path as above. Keep a compact deterministic result and an explicit clock contract. Prospectively identify the start and end of execution/staging/cleanup/audit and record publication and total orchestration separately; any change to an authorized scope boundary must be explicit, not a retroactive accounting maneuver. Do not increase model or whole-check ceilings merely to hide manual preparation/reporting work.
The earlier 781 polls/0.745 seconds and 19 publications were measured before successful acknowledgement. They are not a successful native idle-after-ack test, and they do not support a controlled speedup claim.
6. Next live decision
No live work is authorized here. After the bounded offline closure, propose one newly named Muse batched check under separate approval. Preserve the same 300-second/48-parent-response native limits, nine-submission task shape, and explicit 90-second host reserve rather than purchasing another research campaign. Keep a new root and do not reuse A1's spent authorization. No automatic replacement on failure or inconclusive marker overlap.
The goal remains to reach the actual marker/acknowledgement/revision sequence using the repaired native adapter. Only a later successful live check can qualify that demonstrated route. It does not qualify zcode, source truth, research quality, the later verifier, or whole-project economics.
Roles remain Codex/Astra xhigh orchestration and Sol high/medium development assistance. Candidates remain Muse Code Contributor Max and zcode GLM-5.3-Flash Max when separately authorized; the immediate repair has no candidate or premium-evaluator calls. Do not modify canonical plans, governance or WorkNodes.
Review artifacts
- probe_annotated_results.py: eight characterization tests; original six result forms are matched to published template hashes.
- probes.log: executed characterization results.
- published-36-tests.log: unchanged boundary suite.
- timing-recomputed.json: source-derived timing arithmetic and limitations.
- source-identities.json: hashes for unchanged local source copies.
- source/: sources carried forward from the previous uploaded sign-off bundle, not a repaired implementation.
Source pointers
At f250bb8acd0ccf882d47813ed811195285bfd90c, all relative to reports/external-research-v6-20260926/:
- a1-m/RESULTS.md
- a1-m/checks/failure.json
- a1-m/checks/structural-audit.json
- a1-m/PUBLICATION.json
- a1-m/MANIFEST.json
- a1-m/operator/run_a1.py
- ack-boundary-v1/tools/native_completion.py, particularly _effect, _result, proof_for, and pair_proof
The source-derived observations above are separate from the prospective engineering recommendations. No new research findings have been inferred from these structural artifacts.