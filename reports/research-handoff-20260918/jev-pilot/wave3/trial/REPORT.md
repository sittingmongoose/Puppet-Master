# Applied trial (replay): Jev preservation warnings on a real ledger-to-Plan compile, 2026-09-17

Written 11:55 UTC by the pilot lead. Protocol: `wave3/trial/PROTOCOL.md`. Inputs, warnings, packets, per-agent outputs and scores are under `wave3/trial/`. Nothing in the repository was edited; every repository read was `git show` of committed revisions. Authorised by Jared on 2026-09-17 ("unlimited budget, just work") after the independent review recommended this trial shape.

## The item
The continuation-4 corrections ledger (`pldg-20260917-001`, 13 corrections + 3 owner decisions) was compiled by another thread into JJI-003, JJI-006, JJI-008, SCS-005, SCS-014, SCS-015, SCS-017 and DL-056..058 between 04:33 and 05:31 UTC, landed on main at 05:39, independently reviewed, and the review's four notes were applied at 11:18 (verdict "land; no blocking finding, no should-fix finding"). Base 2a92905501; draft v0 49037e5215 (as the review saw it); reviewed v1 1828c4871f. This is a replay on landed work: the draft was saved before any warning existed, which satisfies the "save before warnings" rule, but the writer's live behaviour and calendar time were not observed.

## What ran
1. Jev warnings on v0 with the frozen P2 question pair and fixed rule, in three constructions: (A) existing obligations through the edit, base to draft, per edited unit (the validated direction); (B2) each ledger atom's summary, negative constraints and exact tokens against the draft's target units (same questions, new direction, not validated); (C3/N3) the authorization shard's sentences and negative constraints against the decision records. Jev cost for the whole trial: $0.048.
2. Two deterministic witnesses, no model: findings-record "repairs X and Y" claims against the compile queue's target units and the units actually edited; each atom's exact tokens against the owner unit's prose and its `preserved_exact_tokens` registry.
3. Two blind Opus reviewers (A, B) on v0 with the ledger records, shards and base/draft text, no Jev output.
4. Two Opus writer arms on v0: "scoped" (20 warnings: the validated direction plus present-only flags) and "full" (104 warnings: everything the fixed rule raised in all three constructions, 4 near-duplicates excluded in scoring), each deciding real / intentional / false per warning and repairing units.
5. An Opus matcher mapping every reviewer finding to the other reviewer, to the real review's notes, and to the warnings.
6. A third blind reviewer (C) on the full arm's repaired draft, same packet form, no knowledge of warnings or repairs.

## Results

### Validated direction (existing obligations through the edit)
98 qualifiers over 8 units (7 edited): 0 real losses, 1 false warning caused by the sentence splitter gluing a YAML key to a criterion (the criterion is present verbatim). The real review likewise found no base-to-draft preservation loss. The rule behaves on real edits as it did on the synthetic ones.

### The blind reviews versus the real review
| reviewer | findings | severity | verdict |
|---|---|---|---|
| real landed review | 4 applied notes + 2 recorded | no should-fix | land |
| blind A | 19 | 1 blocking, 12 should-fix, 6 notes | fix_then_land |
| blind B | 19 | 13 should-fix, 6 notes | fix_then_land |

The matcher paired 34 of the 38 blind findings into 17 shared issues; only one blind finding (B-17, a missing hash on a citation) coincides with a real-review note (N6). Mechanical checks confirm the substantive shared findings: JJI-008 still carries the "where required" qualifier the correction was raised to remove; the prose names the shared version block `toolchain_identity` three times and never `native_toolchain_identity`; SCS-015 lacks DL-056's safe next action `inspect`; SCS-014 never names `gc_fence_covered_paths`; JJI-006 carries the recovery floor only in a validation note. Five findings records name a unit as repaired that the compile queue never targeted (SCS-014 three times, JJI-004, SCS-015). Of 79 atom-token by target-unit pairs, 35 tokens reach the owner prose and 3 the owner's `preserved_exact_tokens` registry (JJI-008 only); 21 tokens exist only in the schema and fixture additions.

The real review's one loss-type note (DL-058 dropped the third sentence of Jared's verbatim answer) originated upstream: the ledger's own authorization shard carries the truncated quote, so no ledger-to-plan check of any kind could see it. Preservation checks must sit at the point of transcription, not only at compile.

### What the warnings anticipated (matcher's judgment)
| finding type | findings | anticipated directly | partially | not at all |
|---|---|---|---|---|
| preservation loss | 8 | 7 | 0 | 1 |
| ledger obligation not carried | 14 | 8 | 0 | 6 |
| naming or reference | 4 | 2 | 0 | 2 |
| record or receipt | 5 | 0 | 4 | 1 |
| scope or count inconsistency | 7 | 0 | 5 | 2 |
| all | 38 | 17 | 9 | 12 |

Every direct anticipation came from the ledger-to-plan construction under the unscoped fixed rule, that is, from warnings my "scoped" packet had removed on the assumption that a token present in the schema was present enough. The ledger contract expects exact tokens in the owner unit, so that scoping was wrong and the unscoped set was right. Six of the twelve unanticipated findings are the "named as repaired but never edited" class, which the repairs-versus-targets witness catches with no model. The remaining six (a gate-rule wording, a this-unit misattribution, a DL-056 miscount, a missing citation hash) are reviewer work.

### Writer arms
| arm | warnings | real | intentional | false | units repaired |
|---|---|---|---|---|---|
| scoped | 20 | 0 | 2 | 18 | 0 |
| full | 104 | 23 | 5 | 76 | 6 (109 changed lines) |

The full arm's 23 real losses are all exact-token and naming anchoring gaps the reviewers had also raised (the `native_toolchain_identity` rename, `graph_states` and its append rule in SCS-017, the pointer-resolution, store-entry, closure-expansion and blocker tokens in JJI-008, the writer-path tokens in SCS-014, the two disclosure fields in DL-057, the fenced artifacts in DL-058). The 76 false warnings are mostly the "weakened" question misfiring in the summary-to-plan direction and writer-process prohibitions a plan never restates; the writer dismissed each with a quote at about 1,750 tokens per warning.

### Audit after repairs (reviewer C on the full arm's draft)
| draft | reviewer | findings | should-fix or blocking | notes |
|---|---|---|---|---|
| v0 | A | 19 | 13 | 6 |
| v0 | B | 19 | 13 | 6 |
| v0 after the full arm's 6 repairs | C | 14 | 6 | 8 |

Reviewer C no longer raises the `toolchain_identity` naming defect, the `graph_states` omission in SCS-017, or the JJI-008 and SCS-014 token-anchoring gaps (mechanically: the bare name occurs 0 times and `native_toolchain_identity` 
is now in the prose; `graph_states` is in SCS-017). It still raises what the warnings never reached or the writer did not repair: the five "named as repaired but never edited" records (SCS-015 split, SCS-014 isolation and sanitization, JJI-004), the surviving "where required" qualifier in JJI-008, the missing `inspect` in SCS-015 and `gc_fence_covered_paths` in SCS-014, the DL-057 field count and the DL-058 seventh question. Reviewer variance is bounded by A and B's 17 shared issues, so the drop from 13 to 6 should-fix findings is mostly the repairs, not the reviewer.

### Cost of the strong-model work in this trial
Opus sub-agent tokens: reviewer A 155,838; reviewer B 156,378; writer scoped 127,228; writer full 182,542; matcher 110,107; reviewer C 162,315; total 894,408. Jev: $0.048. For comparison, the real compile thread's review is unmetered here.

## Read-out
1. With the full arm's repairs applied, a fresh blind audit's should-fix count fell from 13 to 6; what remained is the class the deterministic witness owns plus three items the writer left standing. On this real item the cheap layer (Jev warnings in the ledger-to-plan direction plus two deterministic witnesses) would have surfaced 23 of the 38 issues two independent strong-model reviewers later found, before any expensive review, at a false-warning burden of about three dismissals per real finding. The landed review found none of them.
2. The validated preservation direction was clean here; the value on this item came from the direction the pilot had not validated. That direction's precision is poor under the fixed rule and needs its own rule; "present" alone plus the deterministic token witness is the obvious next candidate.
3. The two deterministic witnesses should land in the ledger compile tooling first: repairs-versus-targets and exact-tokens-in-owner-prose-and-registry. They cost nothing and cover the bookkeeping class entirely.
4. The trial does not measure calendar time or live writer behaviour, and one item is feasibility evidence, not a guarantee.
5. By-product for the continuation-4 thread: the landed compile carries the gaps listed above. Nothing was changed here; the finding files are `wave3/trial/packets/reviewer-{a,b}/findings.jsonl` and the full writer's proposed repairs are `wave3/trial/packets/writer-full/repaired_blocks.jsonl`, for that thread's owner to judge.

## Addendum 12:06 UTC: the two next steps, executed
1. Deterministic witnesses landed on branch `fix/ledger-compile-witnesses-20260917` (commit bb6ae93ab7, pushed): `scripts/pm-ledger-compile-witness.py`, its unit test, and a first-run bundle under `reports/ledger-compile-witness-20260917/`. On the continuation-4 ledger as it stands on main the witness fires on 5 of 11 findings records and, under the union rule (a token must reach at least one of its item's owner units; corrected at 12:09 after a one-atom, fourteen-unit compile showed the per-unit rule over-fired), on 22 of 56 atom tokens missing from every owner unit's prose (all 22 present only in schema or fixture companions) and 53 of 56 missing from every owner registry. On the External Research canon compile (`pldg-20260917-002`, a new owner document with 14 new units plus 4 consumer units, landed by another thread at 12:0x on local main) the same witness finds 0 of 21 tokens missing and has no findings records to check; there were no edited existing units, so the validated preservation direction had nothing to examine. The branch waits for the shared checkout's main to be pushed by the thread currently landing there before it is fast-forwarded.
2. Step-2 dry run (`wave3/trial/ledger_warnings.py`, present-only question plus the witnesses, no "weakened" question): on the landed compile it raises 86 warnings, of which 81 come from the two deterministic witnesses and 5 from the model question, and all 5 model warnings are writer-process prohibitions that a plan never restates (labelled as such by a regex). On this item the model question adds nothing the witnesses do not already catch; the ledger-to-plan direction is a job for the witnesses, with the model left for what remains after them. This is one item and is not a validation.

## Addendum 12:32 UTC: landing, and a second real item (External Research canon compile)
Landing: the witness branch was fast-forwarded onto main and pushed at a6fb1ba5e8 after the other thread's landing reached origin; shard checks passed in the worktree and the shared checkout; the three repository-wide checks reported 13 failing gates, none naming a file the branch touches (Spec Lock, evidence, plan-graph, migration and readiness staleness from today's canon landings plus the pre-existing packet-restriction JSON failures); the worktree was removed and the branch deleted.

Second item: `pldg-20260917-002-external-research-canon` (a new owner document with 14 units plus 4 consumer units), compiled by the goal-3 thread, reviewed independently (6 should-fix, 2 notes, all applied), landed on main at c9bf2d24e1. Two blind reviewer pairs: one on the draft as the landed review saw it (07f4cb7cc1), one on the draft after the review's fixes.

| pair | findings | shared issues | overlap with the landed review | anticipated by the token witness |
|---|---|---|---|---|
| pre-review draft (A 19: 2 blocking, 8 should-fix, 9 notes; B 20: 11 should-fix, 9 notes) | 39 | 11 | 1 (S3, the ungrounded pricing sentence) | 1 direct, 7 partial |
| post-review draft (A 24: 1 blocking, 16 should-fix, 7 notes; B 19: 1 blocking, 14 should-fix, 4 notes) | 43 | 14 | 7 land on the landed review's own fixes (S1 left ERS-005's registry declaring the response set it now forbids restating; S4 named the shared files outside compiled_plan_outputs; N2 labelled the evidence row but not the units' lineage; S2 reworked ATS-054's constraints without the registration-only clause) | 0 direct, 3 partial |

On this capability compile the validated preservation direction had nothing to check (no existing unit was edited) and witnesses 1 and 2 were clean (34 item tokens, 0 missing from every owner prose, 3 to 4 unregistered), so what the blind reviewers found was beyond the cheap layer: ungrounded frequency and pricing claims stated as canon, a fifth owner document outside the authorisation's scope, consumer units compiled as bare blocks without headings, stripped citation prefixes, a narrowed negative constraint ("colored border bars" to "colored status bars"), and registry entries that name strings the unit text does not contain. That last class is deterministic and became witness 3 (registry hygiene: every `preserved_exact_tokens` entry must occur in its own unit's text): 12 such entries on the pre-review draft, 16 after the landed review's fix to ERS-005 removed the enumerated fields but left their tokens registered; the continuation-4 owners carry 10 that predate that compile. Witness 3 landed on main at 4f5eda0d18 at 12:47 UTC under the same landing rule (seven tests pass; 13 gates fail in the shared checkout, none naming the branch's files).

Read-out for the reviewer instrument: on both items two blind Opus reviewers agree with each other on most of what they raise (17 of 19 and 11 to 14 shared issues) and overlap the landed reviews on one issue each, while the landed reviews concentrated on hashes, counts, scope and form. Both instruments find real things; they find different things, and neither is complete.
