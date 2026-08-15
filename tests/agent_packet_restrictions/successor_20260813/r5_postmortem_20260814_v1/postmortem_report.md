# R5 deterministic subject-failure postmortem

Status: `COMPLETE_EVIDENCE_ANALYSIS_NO_NEW_SUBJECT_OR_PROVIDER_CALLS`

This postmortem preserves the R5 matrix terminal. None of the three first-attempt failures is converted into a pass.

## Executive finding

R5 exposed two distinct weak-model boundaries:

1. The two medium S10B failures are materially similar, not independent. Both routes received the identical 74,503-byte packet, reproduced all 18 decisions and all eight supported edges, then selected the same unsupported tension candidate `B-T03`. Their outputs differ only in ordering. This is evidence that the combined S10B work unit and its underdefined tension-filtering instruction are not conservatively weak-model-safe at that admitted load.
2. The xhigh S50 failure is not accumulated-context overload. S50 ran in a fresh projectless task with a 12,404-byte packet bound only to exact S45A and S45B envelopes. It chose one wrong authority value out of eight: it changed `worknodes_from_wizard` from boolean `false` to the explicit distractor string `after_static_validation`. That is a localized cross-authority synthesis error in a mixed-objective work unit.

All three raw task finals equal their stored capture payloads byte-for-byte. Read-only deterministic scorer replays returned the same three `FAIL` results with rc=1. No tool calls, delegations, or user-input requests occurred in the subject tasks.

## Exact typed diffs

### R5-F01 — GPT-5.4 mini medium, S10B

Only `$.selected_tension_ids` differs.

```json
expected: ["B-T02","B-T01"]
observed: ["B-T01","B-T02","B-T03"]
```

- Membership error: added `B-T03`; nothing expected is missing.
- Ordering error: `B-T01` and `B-T02` are reversed relative to candidate order, and `B-T03` is moved to the end.
- Expected meaning: `B-T02` is the frozen 77/61 versus stale 76/60 projection conflict; `B-T01` is planning-complete language versus separately unproven runtime buildability.
- Observed meaning: the model additionally treated the false equivalence between mutable ledger state and immutable ApprovedPlanPack authority as a real unresolved tension.
- Exact score: actual `1266c931fde3d046fbd4df6bbc4ad70a25e07be626ab5880fa1f38de4becfd3c` / 2,807 bytes; expected `c1d5ad37f8e9d9f3384d41aed50ddc8f0e639f0b9c4a03322ef91bfd2dbddfdf` / 2,799 bytes.

### R5-F02 — GPT-5.6 Luna medium, S10B

Only `$.selected_tension_ids` differs.

```json
expected: ["B-T02","B-T01"]
observed: ["B-T03","B-T02","B-T01"]
```

- Membership error: added `B-T03`; nothing expected is missing.
- Ordering behavior: the model preserved the complete candidate order but failed to filter the unsupported first candidate.
- Exact score: actual `043e39b0223f8818d80905d6d8e23701a45075194380c0cb9dfb3d8164de849e` / 2,807 bytes; expected `c1d5ad37f8e9d9f3384d41aed50ddc8f0e639f0b9c4a03322ef91bfd2dbddfdf` / 2,799 bytes.

The common outcome-determinative error is identical set membership: both selected `{B-T01,B-T02,B-T03}`. The differing order makes the raw outputs nonidentical, but it does not make the failures independent.

### R5-F03 — GPT-5.4 mini xhigh, S50

Only `$.authority_matrix[5].value` differs.

```json
expected type/value: boolean false
observed type/value: string "after_static_validation"
id/label: I06 / worknodes_from_wizard
```

The immediately admitted S45B predecessor says `B09.choice="no"` and `B13.choice="indexes_and_readiness_only_no_runtime_nodes"`. Static validation does not transfer WorkNode-creation authority to Planning Wizard. The observed value therefore strengthens authority in direct conflict with both predecessor evidence and the prompt's `Do not strengthen ... authority` instruction.

Exact score: actual `1816526d084d493f8b105b93517e41fb73c86b3e13ef57bca69b47795c2fe293` / 2,165 bytes; expected `f9045a15edc593311255524515da87e5d4582721405533385f1a541212e72c15` / 2,145 bytes.

## Transition from the preceding passes

Both medium routes passed S10A exactly before failing S10B. S10A and S10B each contain 18 decision items and the same three-candidate pattern: a false candidate first, followed by two real tensions. The important transition is admitted workload:

| Measure | S10A | S10B | Increase |
|---|---:|---:|---:|
| Packet payload bytes | 52,848 | 74,503 | 40.98% |
| Capsule storage bytes | 51,204 | 72,807 | 42.19% |
| Source records | 16 | 20 | 25.00% |
| Excerpt characters | 35,441 | 55,035 | 55.29% |
| Edge candidates | 8 | 10 | 25.00% |

On S10A both routes correctly excluded false `A-T03` and returned `["A-T01","A-T02"]`. On S10B both retained false `B-T03`. GPT-5.4 mini xhigh passed the identical S10B packet, which rules out packet corruption and makes the capability-by-load/work-unit interaction the strongest explanation.

For the xhigh route, S40A, S40B, S45A, and S45B all reopen byte-exact to their oracles. S50 was a new task, not a continuation, and its 12,404-byte packet was far smaller than the passing 77,304-byte S30B and 77,802-byte S40B packets. The late failure therefore reflects synthesis shape rather than accumulated conversation or raw byte load: S50 simultaneously asks for eight authority resolutions, eight edge classifications, tension concatenation, finding propagation, hashes, and exact serialization. Several authority rows, including I06, were already deterministic facts in the predecessors and should not have been re-inferred by the subject.

## Classification

| Case | Primary labels | Contributing labels | Excluded as causes |
|---|---|---|---|
| mini medium S10B | model instruction omission/misread; genuinely incorrect semantic result | PromptCapsule ambiguity or excessive instruction load; work unit too large or mixed-objective | insufficient admitted context; upstream artifact defect; controller/harness/process influence |
| Luna medium S10B | model instruction omission/misread; genuinely incorrect semantic result | PromptCapsule ambiguity or excessive instruction load; work unit too large or mixed-objective | insufficient admitted context; upstream artifact defect; controller/harness/process influence |
| mini xhigh S50 | model instruction omission/misread; genuinely incorrect semantic result | PromptCapsule authority-scope ambiguity; work unit too large or mixed-objective | excessive raw context; insufficient admitted context; upstream artifact defect; controller/harness/process influence |

The response schema/scorer has a latent weakness but did not cause these outcomes. `selected_tension_ids` is set-like yet exact order is scored, and the schema does not type `I06.value`. However, both S10B responses also contain a genuinely unsupported member, and S50 contains a genuinely wrong authority value and type. All three remain failures under a semantic scorer.

## Six preserved controller/process failures

| Sequence | Failure | Effect on subject interpretation |
|---:|---|---|
| 1 | Outer apply-patch serializer rejected a valid trailing-LF S10A packet operation. | None: no subject call or artifact existed; deterministic storage was repeated with identical bytes. |
| 2 | Alpha S10B creation receipt contained a transcribed 62-character packet hash. | None: the same already-created task was retained; the actual prompt and final output bind the correct packet. |
| 3 | Outer wrapper treated Bravo S10B's valid rc1 `FAIL` as an exception. | None: the immutable output was already captured; only deterministic score acceptance was repeated, and this postmortem reproduced the same fail. |
| 4 | Harness incorrectly required globally unique `host_id` values. | None: only host uniqueness was removed; task/thread uniqueness and all W10 prompts and outputs were retained without reruns. |
| 5 | S30A scorer invocation omitted required S10A ancestor arguments. | None: the call, capture, and receipt stayed fixed; only deterministic scoring was repeated. |
| 6 | Controller attempted to reconstruct the already-existing S30A receipt. | None: create-once validation rejected it and no artifact changed. |

These are real process-quality findings and remain failures. They neither explain nor excuse the three subject errors.

## Smallest justified changes

1. Split S10B tension classification from the otherwise successful decision/edge synthesis. Admit only the three candidates plus compact, already-derived decision evidence. Require one typed verdict and supporting decision IDs per candidate. Define a real tension generically as independently supported claims that remain in conflict; a contradicted assertion is `unsupported_claim`. Derive selected IDs and ordering deterministically.
2. Stop asking S50 to re-infer direct authority projections. Build authority rows deterministically from keyed predecessor decisions, especially B09/B13 to I06. Keep the model for genuinely cross-topic edges/conflicts. If a subject authority step remains, separate it from edge/tension work, declare per-item value types, and require source decision IDs.
3. Add stage-specific field types and semantic scoring, then deterministically canonicalize order before byte comparison. Preserve the historical failures; do not retroactively rescore them.

These changes must not contain literals such as `exclude B-T03` or `I06=false`. Guard against frozen-answer tuning with permuted IDs/options, unsupported candidates in different positions, meaning-equivalent distractors, and an unseen holdout topic/integration fixture generated from a declarative hidden key.

## Minimal later retest

Fix-isolation gate, once new bytes are frozen:

- Revised S10B: GPT-5.4 mini xhigh, GPT-5.4 mini medium, and GPT-5.6 Luna medium. Xhigh is required because it passed the old S10B and the approach changed.
- Revised S50 authority/integration unit: GPT-5.4 mini xhigh against the exact unchanged S45A/S45B semantic inputs.
- Retest S10A on all three only if a shared S10 template, reducer, oracle, or scorer changes. A stage-B-only change with byte-identical S10A inputs does not invalidate S10A.

If those cells pass first attempt, continue the exact causal descendants:

- Alpha after S50: S55 -> S60P/S60C/S60K -> S70 -> S80 -> S90.
- Bravo and Charlie after S10B: S20A/S20B -> S30A/S30B -> S40A/S40B -> S45A/S45B -> revised S50 -> S55 -> S60P/S60C/S60K -> S70 -> S80 -> S90.

If any changed cell emits different canonical payload bytes, regenerate and retest every causal descendant. No diagnostic subset alone proves the full Planning Wizard audit process or production weak-model safety.

## Evidence and claim boundary

- `evidence_manifest.json` binds the exact frozen packets, oracles, captures, receipts, predecessors, wave terminals, and prior matrix terminal.
- `typed_failure_diffs.json` records the machine-readable paths, meanings, raw/capture equality, scorer replays, and transition metrics.
- `failure_classification.json` records all requested labels and the six process-failure dispositions.
- `retest_recommendation.json` records the prospective architecture and exact invalidation/retest paths.

This is deterministic analysis of an unfinished throwaway frozen fixture. It makes no current-Plans, completeness, production-enforcement, release-readiness, safety-certification, external-audit, or Plan-compile claim.
