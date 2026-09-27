# Independent offline delivery boundary review

2026-09-27. Development review only; not a formal research-quality grade or a candidate/evaluator run. No OME-Zarr answers were supplied to candidates. No paid calls, probes, approvals, or pushes were made.

## Result

The current `tools/delivery.py` passes 26 synthetic tests: 14 implementation-owner tests and 12 independent tests in `tools/test_independent_boundaries.py` (`python3 -m unittest discover -s offline-repair-v1/tools -p 'test*.py' -v`). The independent tests cover complete finding rendering; condition, implication, validation proposal and uncertainty preservation; explicit keep/replace; missing, duplicate and unknown IDs/actions; `not_a_claim` rejection; visible original and challenge after unsupported removal; negative claims in reasons, replacements, additions, non-findings and titles; search-only and inconclusive absence; issue-title-only leads; unexpected top-level additions; and malformed JSON with raw fail-visible retention.

Two defects found during this review were repaired by the implementation owner and retested:

1. A new `non_finding` saying `No matching local entry exists` initially became `REVIEWED_VERIFIER_ASSERTION` without a bounded absence packet. The current matcher and explicit non-finding check hold it unresolved.
2. A top-level `review.additions` string initially disappeared without diagnostics while original findings became reviewed. The current assembler preserves unsupported review fields in diagnostics and unresolved output; unexpected draft fields fail visibly.

The helper keeps a validation proposal typed and labelled **UNEXECUTED PROPOSAL** under keep or same-type replace. Omitting one part's decision or supplying conflicting/unknown decisions holds the entire finding unresolved. It displays an attempted rejection alongside the original when the rejection lacks required support. A direct source or Plan citation is structurally required for reviewed keep/replace/remove; title, search result, or secondary summary alone cannot pass that gate. A bounded absence packet needs direct context and direct source evidence; an `inconclusive` packet cannot support an asserted negative claim.

These are structural checks. A citation can be irrelevant, a replacement can narrow meaning within the same typed part, and a proposed test can be weak. The assembler cannot determine those facts. The downstream reviewer must compare every asserted part, including conditions and proposals, with source context; `truth_validation` remains `not_established_by_assembler`. Finding titles are headings and may express meaning; negative titles receive a bounded-absence gate, but other title semantics still require human review. Draft-only output is marked `UNVERIFIED`, including honest uncertainties. The final renderer indents JSON diagnostics and history as literal text, keeping raw carrier prose visible without turning it into Markdown headings. The schema now clarifies that keeping a typed uncertainty preserves the open question; it does not resolve it.

## Trial boundary review

`prompts/investigator-control.txt` and `prompts/investigator-maintained.txt` contain byte-identical `prompts/common.txt` prefixes and their respective carrier suffixes. The common text bars live sources, other models, external workspace access and source-text instructions; it gives both arms the same generic source-authority, bounded-absence and unexecuted-proposal rules. The proposal's workspace allowlist and exclusion policy, rather than the common prompt text, bar known answers from candidate workspaces. The maintained carrier is longer (5,786 bytes total prompt versus 3,596 for control) because it specifies the typed record format and revision snapshots. The proposal correctly names the combined record-maintenance/report-production policy as the treatment. The report format can reveal treatment to reviewers; `NEXT_TRIAL.md` and `prompts/evaluator-i1.txt` require final-report judgments to be saved before upstream records are opened and require partial unblinding to be reported.

`NEXT_TRIAL.md` and `proposal.json` describe four serial candidate slots (1,800 seconds and 160 responses each) and two fresh evaluator slots (2,700 seconds and 160 responses each), a 14,400-second phase wall ceiling, 300 host seconds per slot, no retries or replacement slots, and a later flash-verifier comparison outside I1. The proposal is marked `PREPARED_UNAUTHORIZED`, `launch_enabled: false`, and `authorized_schedules: []`. Prompt text contains no reference IDs or case-answer clues in candidate arms. The evaluator prompt distinguishes proposed checks from executed tests, whole-reference status from facet losses, and acquisition from preservation. It also states that the existing runner checks JSON parseability and file existence only; semantic completeness remains evaluator work.

The read-only `python3 offline-repair-v1/check_preparation.py` returned `ok: true`, zero errors, 129 manifest files and `calls_made: 0`. It checked original input and reused dependency pins, candidate prompt composition, authorization flags and cap arithmetic. Its own output correctly disclaims launch authorization and semantic quality proof.

The design has one pair per app, no replication, and a familiar development case. Its specified analysis is descriptive; it cannot establish reliability or an end-to-end verifier improvement. The planned host renderer changes presentation as part of the treatment, so format and prompt length remain visible treatment differences rather than controlled-away nuisance variables. These limitations are disclosed in the trial proposal.

## Reviewed file identities

SHA-256 at this review: `tools/delivery.py` `02a91a53155ea5b6c4ed0ad6e2a2c5caa0b3c07d5cae73a70468142d39cd2750`; `tools/SCHEMA.md` `8a389f06804934d9d30323c55b8d1623d666923a45c92ef44bc370f5f356e68d`; independent tests `6acb5fff8fd0600ea75768c19d3e69659955efafc93caeef91c055504836dc15`; `NEXT_TRIAL.md` `1d4520163dc38a8d85369849c5a4f8e99f6f54b318ffdcb24a1dc604391708ec`; `proposal.json` `59ea1c3eeadde03c576278639435990222d660d476c2fb4339067c955dbea6fc`.

The parent requested GPT-6 Sol at high reasoning for this tracer. Its effective model and effort are not independently observable in this context, so this review makes no effective-setting claim.
