# Parent-expansion follow-up - 2026-09-16

Branch `plans/jj-graph-followup-20260916`, based on `a76f22a2f9`, the `main` that carries the landed F110
work. One commit. Not landed; it stops for review.

This closes the two design questions the F110 review raised and left for Jared, plus the cosmetic
indentation repair offered with them. `verification.json` is the machine record.

## The answers

Both questions were put to Jared together with the indentation offer, and he answered all three at once,
verbatim: **"1. no 2. yes 3. ok"**.

**1. May a producer truncate a parent list before it holds all thirty-two references? No.** Truncation is
reached, never chosen. A node either carries thirty-two parent references and marks itself truncated, or it
carries fewer and has no more parents, so a short list is a complete list. The schema already worked this
way, because the truncation conditional requires a truncated node to carry `minItems: 32`, so **no schema
change was needed**. What changed is that SCS-017 now states the rule where it can be read instead of
leaving it to be inferred from the bound.

**2. Should the expansion request echo the page's `expires_at_utc`? Yes.** The request's
`projection_currentness` gains `expires_at_utc` as a required field, keeping the page's own nullable
timestamp shape, so the request's currentness is now field for field identical to the page's `currentness`:
`state`, `projection_generation`, `observed_at_utc`, `expires_at_utc`. A consumer holding only the request
can see the freshness horizon without inferring anything about the page it came from. With that field
present, SCS-017's claim that the request is "fenced exactly as page continuation is" is literally true
rather than nearly true.

**3. The indentation repair.** The thirty entries this line of work added to
`Plans/source_control_contract_fixtures.json` had their opening brace at column zero instead of column
four. All thirty are re-indented. The change is whitespace only: `git diff -w` is empty, the file grew by
exactly 120 bytes, which is four spaces times thirty, and the parsed document is identical object for
object, asserted before the file was written.

`DL-053` was the highest Decision Log number on the base commit, so the answers are recorded as **DL-054**
in both sections of `Plans/Decision_Log.md`, and as answered questions **q-004** and **q-005** with event
**evt-007** in `pldg-20260916-001-jujutsu-continuation-corrections`, the ledger that raised the parent-bound
work. All five of that ledger's questions are now closed.

## What was deliberately not changed

`DL-052`'s prose enumerates the fences as "the same repository, workspace, backend and projection identity,
the same projection generation, and the same currentness rule". It never claimed the expiry instant, so it
was not made false by the gap and is not made truer by closing it; `DL-054` records the refinement instead.
The landed entry is left alone.

## Results

| check | result |
| --- | --- |
| `python3 scripts/pm-new-contracts-verify.py` before | pass, 0 findings, 1041 positive / 3378 negative |
| `python3 scripts/pm-new-contracts-verify.py` after | pass, 0 findings, 1041 positive / 3379 negative |
| `python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json` | pass, 98 docs, 2676 shards |
| `python3 scripts/pm-plan-index.py validate` | pass, 6651 PlanUnits, 25855 acceptance units |
| `python3 -m unittest tests.test_pm_source_control_effects tests.test_pm_source_control_response` | pass, 25 tests |
| `pm-bootstrap-ledger-validate.py` on ledger 001 | fail on the three pre-existing governance-coverage omissions only, 0 warnings; 7 events, 5 questions |
| `pm-bootstrap-ledger-validate.py` on ledger 002 | fail on the same three only, 0 warnings; unchanged by this branch |

The one new negative is the expansion request with its echoed horizon removed. No test changed, because the
tests cover the semantic branch and this commit does not touch it; `scripts/` is not in the diff at all.

## Claim boundary

Static schema, fixture, shard, index and ledger integrity only. No governance seal, no runtime or native
certification, no command admission, no readiness claim. The owner answer was relayed by the reviewer and is
not verifiable from inside this repository; it is cited by path and SHA-256.
