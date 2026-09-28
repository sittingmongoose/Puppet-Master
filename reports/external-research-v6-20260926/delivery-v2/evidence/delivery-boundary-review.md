# Delivery-v2 offline boundary review

Bounded development test/audit by the requested native GPT-6 Sol/high helper; effective identity remains unconfirmed absent independent runtime metadata. This is not formal semantic grading, native interface qualification, research-quality measurement or execution approval. Only the new test module and this evidence note are owned by this helper; core repairs were made by the parent.

All test inputs are synthetic/minimized development fixtures. They are not exact reproductions of the frozen I1 carriers or scored replacement answers. No candidate/model/account calls, source/key review, frozen edits, Git mutation or application launch occurred.

## Requirements exercised

The tests use `Store(workspace, archive)` and the intended payload/request/receipt paths. A receipt interception verifies that raw snapshot bytes, marker snapshot and persisted state exist before per-attempt feedback is written. Parse/schema errors remain invalid and raw bytes survive: malformed fences, unknown/duplicate/missing/empty fields, missing revision reason, invalid request/unknown finding, failed payload write, and oversized submitted bytes. A valid record remains `VALID_UNVERIFIED`, with semantic validation explicitly not performed.

Host-generated finding/part identities survive revisions. One final regression verifies revision counts include invalid attempts, untouched part IDs/bodies remain stable, assertion text replacement is listed, and a later assertion-to-non-finding revision records the removed/added part IDs and title change. Raw/history records survive; the last parsed record is a mechanical diff basis only and never a current fallback. Quotes, paths, indentation and fenced code (including a heading inside code) remain exact in current JSON; Markdown uses the pinned renderer's blockquote framing without changing the body text. Conditions, source/plan fit, uncertainty and UNEXECUTED validation proposals stay attached. Non-findings use their declared type. Guards make calls to the review assembler, absence regex search or absence-packet validator fail the test; the successful path calls the existing current projector/renderer instead.

With independent valid findings A and B, an invalid latest revision of A removes A from asserted current content and leaves an explicit incomplete A disposition; B remains visible. A's superseded and rejected prose stay out of current Markdown, while their raw snapshots/history remain in audit storage. A corrected later attempt reuses A's host identity and retains every previous attempt. Missing old or current snapshots and corrupt current marker snapshots block overall completion; missing old bytes are never reconstructed. Changed/reused submissions and removed acknowledged requests visibly invalidate current state. Pending/unsubmitted bytes block live completion and are retained at close; post-close polling rejects further processing.

## Concrete review findings and parent repairs

Initial inspection found four required boundary gaps: removed acknowledged markers escaped an iterdir-only audit; marker snapshots lacked history/current integrity checks; invalid names/unknown identities discarded available payload bytes before archival; pending payloads could coexist with a live complete claim. The parent repaired these and the regression tests pass.

The parent repaired the follow-up oversized unsubmitted preservation and failed/oversized marker handling gaps, verified by three additional regressions. A failed marker must still bind an identifiable revision to its finding and retain its available payload, so an old accepted version cannot silently stand in for the invalid latest revision. Oversized regular marker bytes must remain audit evidence while rejected structurally. Nonregular markers must be refused without following them.

## Final observed result and identities

Helper rerun: `python3 -m unittest discover -s delivery-v2/tools -p test_delivery_store.py -v` from the lab base. **24 tests passed**, exit 0, reported 0.240 seconds. The three added preservation regressions failed against the previous core and pass against the final parent repair. No outstanding defect was found within these tested requirements. This helper did not rerun the evaluator-launch tests or frozen v1 suite; the parent previously reported a separate 35-test delivery-v2 aggregate before the final bookkeeping regression in `delivery-v2/evidence/offline-tests.log`.

| File | SHA-256 at helper rerun |
|---|---|
| `delivery-v2/tools/delivery_store.py` | `81364fd1a4040ba457dd04779d096709c3524bee8704a2c8f453fb18264c85c7` |
| `delivery-v2/tools/test_delivery_store.py` | `af6e060486a4ccf72eb8621f49474ce4b60b7fea57d0d9e7837086f043c712a2` |
| `delivery-v2/evidence/fixture-provenance.json` | `56b3f4907c0e7e7ffc8e7484cff599daaa6b41b76388bbc0e4460c362a47eedf` |
| `delivery-v2/evidence/native-route.md` | `5fffe3866d517a25dfdd7c14f5a6eaad16769922d88eccd6aaf51df154aed5f3` |
| Frozen `offline-repair-v1/tools/delivery.py` dependency | `e1c7ea2e32bd00ef2606b5974b690a4537b6b200fd3c4e620880ae430b9ebe59` |

All relative paths above use lab base `/home/sittingmongoose/PM-Experiments/external-research-v6-20260926/`. The final core pins/checks the frozen dependency hash at lines 15-18. It checks prior acknowledged paths at lines 143-155, captures raw payloads before identity/marker validation at lines 169-214, persists state before receipts at lines 217-219, checks both current and historical snapshot kinds at lines 244-261, blocks pending inputs at lines 262-266, and preserves surviving unsubmitted regular bytes at close at lines 295-307. The current projection/renderer reuse is at lines 273-293. These pointers refer to the core digest above.


## Limits of the evidence

These checks establish synchronous file/state-before-feedback ordering, not power-loss durability, crash recovery, hostile-file race resistance, OS isolation, native receipt polling visibility or semantic truth. Append-only submissions are a protocol obligation corroborated later by native traces; unit tests cannot rule out overwritten-before-observation bytes. Required source/plan prose is retained as unverified investigator material. The validator does not certify citations or whether a proposal's prose describes real execution. Structural completeness always remains unverified. V-FOLLOWON-1 remains deferred and outside this interface; no follow-on verifier qualification is claimed.
