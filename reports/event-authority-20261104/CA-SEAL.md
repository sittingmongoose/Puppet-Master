# CA-SEAL branch report: the DL-412 seal-check change, 2026-11-04

Branch `plans/ea-seal-check-multifamily-20261104`, from `origin/main` `5e37ffb616`. Worker CA-SEAL, stream E, agent task `claude-opus-5.5:ea-ca-seal-20261104`. Fix round 1 was done by worker CA-SEAL-FIX1, agent task `claude-opus-5.5:ea-ca-seal-fix1-20261104`. Fix round 2 was by CA-SEAL-FIX2 (Codex). Fix round 3 is by CA-SEAL-FIX3 (Codex). The stream lead `claude-opus-5.5:pm-ea-lead`, session `b29da1b5-9877-474f-8a4c-e7a57ab7f899`, made `616345d688`. The full change record is `seal-check-multifamily-step-amendment.md` beside this file.

## What this branch does

It makes exactly the change Jared approved in E-CARDS-1 item 4c, option B (DL-412): the frozen seal check now accepts an admission record that describes a truthful registry step that added several families at once, provided every family of that step has its own complete record naming the same step. Nothing else in the check changes.

| Commit | What |
|---|---|
| `e217c94c3b` | The validator (`190a86f2...` -> `bad3e7e8...`, CRLF), its spec section, the disposition-schema note and the DL-412 change receipt |
| `d67201e885` | The change record and this report (reviewed by Sol: NOT_READY, CA-SEAL-01 and CA-SEAL-02) |
| `e10fc5c840` | Fix round 1: the validator (`bad3e7e8...` -> `e4e988b7...`, CRLF), the spec's DL-412 section, and the receipt's validator pin and text |
| fix round 1, reports commit | The change record and this report, aligned with the fixed check |
| `9460959cc7` | Fix round 2: consistent step SHA interpretation (AS-01), spec and new receipt text/pin |
| fix round 2, reports commit | AS-02 procedural exclusions, same-landing patch requirement, rerun results and check-11 table |

## Families

None. This branch registers no family, writes no admission record, moves no registry checkpoint and grades nothing. There is no self-grade JSON. The three DL-300 families (`settings.layer.changed`, `approval.chat_tool_requested`, `approval.chat_tool_resolved`) get their records later, once each contract reaches 12 of 12.

## Newly authored bindings

None.

## Premise checks

| Item | Check | Result |
|---|---|---|
| DL-077's limit of one more change | DL-412 (pushed at `b6332f391a`) supersedes it for this third change only; the card text and Jared's answer file (`00bb608e...`) match | holds |
| The DL-077 record format the change extends | today's validator, receipt `dceb7f21...` and the four existing records | unchanged since `dfe148daad`; existing records pin `dceb7f21...` and stay valid |
| The three DL-300 families were added together | registry history | `102a7e99e8` appended all three (43 -> 46, label `2026-10-09.1` on both sides) and also changed eleven Goal rows; `5375bfd2a7` only relabeled to `2026-11-04.1`. Reported for the record writer; the check does not examine same-step row edits, before or after. |
| The sections the check pins are unchanged on the DL-412 branch | SHA-256 of DL-039, DL-040, DL-046, DL-077 and DL-094 at `origin/main` and `b6332f391a` | identical |
| The holding-bucket test may be edited | `git check-ignore -v tests/test_event_authority_holding_bucket.py` on `main` | not named; DL-413's line is only on `plans/ea-gitignore-ea-tests-20261104` (`66af5d0d67`). The test change is delivered as a patch, not committed. |

## Ids used

None minted. The receipt and the record cite DL-412 (CA-DL's entry). The test patch uses `DL-999` only as a fixture decision entry inside its own temporary copy of the Decision Log; that string never enters `Plans/`.

## Checks from fix round 1

| Check | Exit | Result |
|---|---|---|
| The check before and after, 11 scenarios plus S7 (fix round 1 rerun) | 1 (the seal is expected to fail) | Only the approved behavior changed (field-by-field diffs in the change record). Every output is identical to the reviewed head's except the DL-412 receipt pin. |
| Old-versus-new differential over every existing record (fix round 1) | 0 | 1,812 + 1,808 + 4 + 24 comparisons and the `main()` pair: zero differences. On the reviewed head: 16 differences (the 4 X2 controls, and 12 legacy records given a step problem). |
| Sol review probes on the fixed check: 22 negatives, 4 malformed-claimant counterexamples, X1 and X2 `main()`, the 112-field legacy probe | 0 | Every step member is rejected in all 26 cases. X2 old and new are identical except the new pin. 112 of 112 are equal. |
| Sol review test matrix (main / branch / integration unpatched / integration patched) | 1, 1, 1, 0 | 34 tests with 2 failures; 34 with 41; 34 with 41; patched 57 tests OK |
| Patched holding-bucket test, integration tree | 0 | 57 tests OK (52 at the reviewed head) |
| Patched holding-bucket test, the reviewed head's check | 1 | 24 failures: the new tests catch CA-SEAL-01 and CA-SEAL-02 |
| Mutation check, 19 mutants | n/a | 19 of 19 caught (12 original, one retargeted; 7 new for the two findings) |
| Unpatched holding-bucket test, this branch | 1 | 41 failure entries: the fixtures lack the DL-412 receipt (the patch fixes it) |
| `test_pm_coordination_events` | 1 | 14 failure entries, the count Card 5 reports for `main` and the same 14 as round 0; same with the patched holding file in place |
| `test_pm_emit_only_event_boundaries` | 1 | 1 failure: registry prefix digest; the registry is untouched here |
| `test_pm_pnc019_currentness` | 1 | 1 failure: the same 22 pre-existing currentness source drifts as round 0, none in this branch's files |
| `pm-shard-plans.py --check` | 0 | pass |
| `pm-plan-index.py validate` | 0 | `status: pass` |
| `pm-plans-verify.py lint-path-refs` | 1 | 14 failures, all in `Plans/.plan_index/plan_units.jsonl` (untouched). These are round 0's 12, plus `BPM-009` and `DL-055` naming `.claude/CLAUDE.md`, which the fix worktree's sparse checkout (`Plans scripts reports tests`) leaves out. |

No `Plans/*.md` owner document changed, so no shard or index regeneration was needed. The tracked validator output receipt was never written: every run used a scratch tree.

## Historical review round 1: findings and responses

Review: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/reviews/CA-SEAL-sol/REVIEW.md` (Sol, NOT_READY at `d67201e885`). Both blocking findings are fixed. No finding is disputed and none needed Jared. Evidence: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-SEAL/` (fix round 1 at the top level, the reviewed round under `round0/`).

### CA-SEAL-01 (blocking): malformed extra claimants escaped the step conflict check

**Fixed in `e10fc5c840`.**

The cause was that conflict detection used `registry_step_states()`, which returns `None` when any revision, count or SHA-256 is malformed. A record naming the step's SHA-256 pair dropped out of the claimant set, and the members were admitted.

**What changed in the validator** (`e4e988b7...`):
- **`registry_step_claim` (line 270)** reads the `(before, after)` `sha256` pair from the two fields alone. It trims whitespace and lower-cases, and validates nothing else.
- **`registry_step_problems` (lines 286-318)** fails the step for every record whose pair matches, other than a listed member's own record (line 310).
- **Rejected files count.** `validate_post_august_admissions` keeps parseable record files rejected for their name or event type (line 422). They are claimants under their file name (line 311).
- **The claimant keeps exactly its own problems**, such as `registry_before`.

**What changed in the tests** (patch `fbe7bcd6...`):
- `test_a_malformed_record_naming_the_step_still_fails_the_step` (24 cases): one-family form and step form, with malformed revision, count and SHA-256, and with malformed lists;
- `test_any_other_record_file_naming_the_step_fails_the_step` (5 cases): misnamed, no event type, a second record of a member, malformed and misnamed, and a Known37 family;
- `test_main_rejects_a_step_named_by_a_malformed_record`: the review's X1 through `main()`.

**How to verify:**
- Run the review's `adversarial.py` on the fixed check: all 26 cases reject every step member, including the four counterexamples. X1's `main()` admits only `coordination.agent_registered`.
- Run the patched test against `bad3e7e8...`: it fails 24 entries.
- Mutants 13-16 and 19 are caught.

### CA-SEAL-02 (blocking): the DL-412 decision ban reached old-format records

**Fixed in `e10fc5c840`.**

**The tuple.** Lines 341-342 are again byte for byte DL-077's: `if match.group(1) in ("DL-077", "DL-078") or not named:`. DL-412 is barred only by `elif multi and match.group(1) == "DL-412":` (line 343), where `multi` means the record carries `registry_step_event_types`.

**A second change on the same boundary, beyond the finding's text.** The reviewed head also gave `registry_step_partial:<self>` to a one-family record naming a step's SHA-256 pair. That changed how a record without the field was judged whenever step records existed. The task's rule is that such a record "must be judged byte-for-byte as before". So that loop is removed. The conflict now fails the step (CA-SEAL-01's claimant rule), and the one-family record keeps exactly its DL-077 judgment. On the reviewed head's check the differential shows 12 differences from this loop, and zero on the fixed check.

**Tests:**
- `test_a_record_without_the_field_keeps_the_dl077_decision_rule`, the explicit legacy differential. A record without the field citing DL-412 is judged exactly like the same record citing `DL-998`, a fixture entry with DL-412's body: both have no problems. A step record citing DL-412 is barred. Records of either form citing DL-078 are barred. In `validate_post_august_admissions`, the legacy record citing DL-412 is admitted.
- `test_step_records_never_change_a_record_without_the_field`: 5 cases.
- `test_a_one_family_record_naming_the_step_fails_the_step_and_keeps_its_own_judgment`, which replaces the reviewed head's `..._fails_the_step_and_itself`.
- `test_dl412_is_not_a_family_decision_entry` keeps the multi-family self-citation negative.

**How to verify:**
- Run the review's `legacy_probe.py` on the fixed check: old and new problems are both `[]`, and old and new `main()` both admit `coordination.agent_registered`. The output receipts differ only in `multi_family_step_receipt_sha256`. 112 of 112 mutations are equal.
- Run `differential.py`: zero differences.
- Mutants 8, 17 and 18 are caught.

### Note 3: landing prerequisites

**No change; they stay open items 1-3.** The receipt is committed with `lander_task: null`, as before. Its `authority_section_sha256` (`95375f19...`, DL-412 at `b6332f391a`) and `prior_receipt` pin are unchanged. Only `validator_after_sha256` and the text of `record_contract_change`, `changes` and `does_not_relax` changed. The receipt's SHA-256 is `afef45e2...` -> `6c749a74...`.

### Families, grades and ids

**Families.** None. This branch grades no family, before or after.

**Ids.** None minted. `DL-998` is a fixture-only decision entry inside the test's temporary Decision Log copy, beside the existing fixture-only `DL-999`. Neither enters `Plans/`.

### Round-1 checks

All runs used scratch trees; no checkout's tracked output receipt was written.

| Run | Result |
|---|---|
| **S1-S7, C1-C5** | All exit 1. Output identical to round 0 except the DL-412 receipt pin, in S4, S7, C2, C4 and C5. |
| **Differential**, fixed check | 0 differences |
| **Differential**, reviewed head | 16 differences |
| **Review probes** | 26 of 26 reject; X2 identical; 112 of 112 equal |
| **Patched tests** | 57 OK |
| **Mutants** | 19 of 19 caught |
| **Repository suites** | Same as round 0: coordination 14, emit-only 1, pnc019 1 (22 drifts), shard check pass, index validate pass. lint-path-refs as in the checks table. |

## Open items

1. **The lander fills `lander_task`.** Do this at landing by running the receipt writer with `--lander` on the tree that carries DL-412 (command in the change record). Until then the check fails closed on the receipt.
2. **Landing order.** The branch lands after `plans/ea-cards1-answers-20261104` (DL-412).
3. **The test patch.** It lands as a separate commit in the same landing as the validator, after DL-413's `.gitignore` line (`66af5d0d67`) is on `main`. Without it the holding-bucket test fails 41 entries instead of today's 2.
4. **The DL-300 records.** The record writer chooses and documents the truthful step. The commit that appended the three rows is `102a7e99e8`, and that step also changed eleven Goal rows.
5. **Reviews.** Sol 6.1 max then Astra max, before landing and right after. The author (CA-SEAL, `claude-opus-5.5:ea-ca-seal-20261104`), the actual lander, CA-SEAL-FIX1 (`claude-opus-5.5:ea-ca-seal-fix1-20261104`), CA-SEAL-FIX2, CA-SEAL-FIX3 (Codex), the stream lead `claude-opus-5.5:pm-ea-lead` (session `b29da1b5-9877-474f-8a4c-e7a57ab7f899`, responsible for `616345d688`), and every other fix worker are procedurally excluded from applying the seal.
6. **The seal exclusion is procedural.** The receipt's checked `seal_applier_forbidden_tasks` remains exactly the author and lander. Its validator guard is unchanged. The seal applier must separately enforce the full participant exclusion above.

## Historical review round 2: findings and responses

Astra review: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/reviews/CA-SEAL-sol/REVIEW-astra.md`, NOT_READY at `616345d688`. Both findings are fixed. None is disputed or stopped for Jared. This round changes exactly five paths from that head: the validator, its audit spec, the new DL-412 receipt, this report and the amendment. No test is committed before DL-413's allowance; the fixture patch remains a separate commit required in the same landing.

### AS-01 (blocking): fixed in `9460959cc7`

**Where.** `Plans/.audits/event-authority-2026-08-12/independent-validator/pm_event_authority_independent_validator.py:266`, `:281`, `:283`, `:365`; spec `INDEPENDENT_EA_VALIDATOR_SPEC.md:96`.

**Cause.** Record validation accepts a 64-digit JSON integer via `str(value)`, but step states kept it raw and claimant detection discarded it. Equivalent integer/string hashes could therefore hide a foreign record, including one rejected for its filename or event type.

**Fix.** Step states stringify the SHA exactly as record validation does. Claims stringify it before the existing strip/lower normalization. The step-only before/after equality test uses that same representation, so equal hashes cannot differ only by JSON type. The one-family branch, its raw equality/type handling and its DL-077/DL-078 decision exclusion remain byte-for-byte unchanged; no step problem is added to a no-field record.

**Tests.** The fixture patch adds three methods (60 total): five passing string/integer member controls, 80 foreign controls (all 16 member/claimant before/after type combinations × valid, misnamed, missing event type, numeric event type and Known37 claimant), and three normalized-equal-hash negatives. Each foreign case runs both admission and `main()`, rejects every step member and retains the legacy claimant's own judgment. Symbolic hashes use 7/8, avoiding pre-existing fixture pairs. The three methods produce 78 failures against the reviewed `e4e988b7...` validator after its scratch receipt is re-pinned, and pass after the repair. The old record's acceptance of numeric fields is deliberately preserved.

### AS-02 (should fix): fixed in this reports commit, with receipt note in `9460959cc7`

**Where.** Open items 3, 5 and 6 above; amendment's opening seal exclusion and Landing notes. The complete exclusion names author, actual lander, CA-SEAL-FIX1, CA-SEAL-FIX2, stream lead `claude-opus-5.5:pm-ea-lead` (session `b29da1b5-9877-474f-8a4c-e7a57ab7f899`, responsible for `616345d688`) and every other fix worker. This is procedural. The validator's checked forbidden-task predicate is unchanged and still requires exactly author and lander. The patch must be a separate commit in the same landing, after DL-413's allowance is on main.

### Round-2 validation

All execution used local scratch trees, never the checkout's tracked validator output receipt. The authority is the pinned `b6332f391a` Decision Log in test fixtures; it is not applied to this branch.

| Check | Exit/result |
|---|---|
| S1-S7, C1-C5 | All 12 exit 1 as expected; C4 admits the three complete members, C5 admits none of them. S2/S4 and C1/C2 differ only in the new receipt pin; S4/S7 are identical. |
| Patched holding-bucket suite | Exit 0; 60 tests pass. |
| Sol adversarial and legacy probes | Exit 0; all 26 negatives reject every step member; X1 and X2 rerun; 112/112 legacy comparisons equal. |
| Astra isolated numeric probe | Exit 0; string/no-claim control admits all three; string/string, string/integer, integer/string and integer/integer foreign claims reject all three through admission and main. |
| Original differential, every existing record | Exit 0; A=1,812, B=1,808, X2=4, C=24; zero differences. The two main outputs differ only in generation time and the new input pin. |
| Astra full live-record differential | Exit 0; 492 cases × two comparisons × all four records = 3,936 comparisons, zero differences. |
| Additional numeric legacy differential | Exit 0; 128 mixed-type/equal-hash cases across all four legacy records, 256 comparisons, zero differences, including coexistence with step records. |
| All 34 unchanged fixture methods | Same two pre-existing failures, no errors. Of 279 helper comparisons, 267 are exact and 12 differ only in receipt-chain failure diagnostics/receipt return; acceptance outcomes all match. |
| Original 19 mutation variants plus four AS-01 variants | 23/23 caught, each re-pinned to its own validator bytes. New variants discard numeric claims, retain raw step hashes, retain raw step equality, or discard numeric rejected-file claims. |
| Check 11 | 29 semantic guard variants × 45 isolated negatives = 1,305 cells, plus baseline and main corroboration. Every intended negative flips and every other negative retains rejection for its own defect. |
| Shard check / index validate | Both exit 0, top-level `status: pass`; 99 sources, 3,092 shards; 7,421 PlanUnits. |
| Protected scope / whitespace | Five-path allowlist verified; CRLF preserved. `git -c core.whitespace=cr-at-eol diff --check` passes. No derived owner source changed; no regeneration or governance refresh. |

### Check 11: guard, flipped negatives, other negatives still rejected

Each fixture starts valid and changes one semantic input; assessment/receipt pins and other observing copies are updated. A malformed claimant is a defect of the step's exclusivity claim: disabling that guard must admit the otherwise complete members even while the claimant remains rejected for its own unrelated malformed field. For per-record decision and implementation-pin guards, the defective record is the rejection target. The sibling-completeness guard's target is the complete peers; the defective member still fails its own depth guard. This avoids calling a changed sibling outcome a pass of the defective record.

The before-pin chain is one invariant observed twice. Its scratch variant weakens both equality comparisons while still calling `post_august_validator_pin()`, so every other receipt/authority guard continues to execute. The shared-description variant groups list and state equality; the narrower state variant is also tested separately. Structural parser checks and the frozen non-DL-412 rules stay intact. Full issue lists and exact retained-negative names are in the machine table below.

| Guard weakened in scratch | Its negatives that start to pass | Other negatives still rejected for their own defect |
|---|---|---|
| `foreign` | `foreign-Known37`, `foreign-malformed`, `foreign-newline`, `foreign-numeric-claimant`, `foreign-numeric-members`, `foreign-numeric-rejected`, `foreign-ordinary`, `foreign-rejected`, `foreign-upper` | 36 of 45 |
| `missing` | `missing-member` | 44 of 45 |
| `states` | `same-states-counts`, `same-states-registry_after-revision`, `same-states-registry_after-sha256`, `same-states-registry_before-revision`, `same-states-registry_before-sha256` | 40 of 45 |
| `same-description` | `same-list-and-states`, `same-states-counts`, `same-states-registry_after-revision`, `same-states-registry_after-sha256`, `same-states-registry_before-revision`, `same-states-registry_before-sha256` | 39 of 45 |
| `count` | `count-padded`, `count-short` | 43 of 45 |
| `different-hashes` | `equal-hashes`, `equal-hashes-mixed` | 43 of 45 |
| `sorted-unique` | `shape-duplicate`, `shape-unsorted` | 43 of 45 |
| `all-or-none` | `member-incomplete` | 44 of 45 |
| `step-pin` | `step-receipt-pin` | 44 of 45 |
| `decision-DL412` | `decision-DL412` | 44 of 45 |
| `receipt-schema_id` | `receipt-schema_id` | 44 of 45 |
| `receipt-authority_ref` | `receipt-authority_ref` | 44 of 45 |
| `receipt-authority_section_sha256` | `receipt-authority_section_sha256` | 44 of 45 |
| `receipt-validator_before_sha256` | `receipt-validator_before_sha256` | 44 of 45 |
| `receipt-validator_after_sha256` | `receipt-validator_after_sha256` | 44 of 45 |
| `receipt-record_dir` | `receipt-record_dir` | 44 of 45 |
| `receipt-record_schema_id` | `receipt-record_schema_id` | 44 of 45 |
| `receipt-author_task` | `receipt-author_task` | 44 of 45 |
| `receipt-seal_authorized` | `receipt-seal_authorized` | 44 of 45 |
| `receipt-admission_authorized` | `receipt-admission_authorized` | 44 of 45 |
| `receipt-contract_depth_complete` | `receipt-contract_depth_complete` | 44 of 45 |
| `receipt-prior-path` | `receipt-prior-path` | 44 of 45 |
| `receipt-prior-sha256` | `receipt-prior-sha256` | 44 of 45 |
| `receipt-lander-and-list` | `receipt-forbidden`, `receipt-lander-''`, `receipt-lander-None` | 42 of 45 |
| `authority-tokens` | `authority-token-0`, `authority-token-1`, `authority-token-2`, `authority-token-3` | 41 of 45 |
| `numeric-claim` | `foreign-numeric-claimant`, `foreign-numeric-rejected` | 43 of 45 |
| `numeric-state` | `foreign-numeric-members` | 44 of 45 |
| `numeric-equality` | `equal-hashes-mixed` | 44 of 45 |
| `rejected-numeric-claim` | `foreign-numeric-rejected` | 44 of 45 |

Evidence: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-SEAL/fix2/results/guard-matrix.json`, SHA-256 `dda0e1656dd2b51f3bb036c3560cd587452ce6990627c133de2b936adf4104b4`.

### Pins, evidence, grades and ids

Validator SHA-256: `fb551b066c138be4a198ed1c875edff4a71c7932631db90d1e102ba43ce8a303`. New receipt SHA-256: `bd04156a9052c04cfa13787678b6e654066b79821ad85eeecd2cd516d643d732`. Only its current-validator pin is refreshed; its before pin, authority/source/card pins, prior-receipt pin, null lander, checked forbidden list and false flags remain unchanged. Descriptive receipt text matches the code and records the procedural exclusion. Earlier receipts and existing records are untouched.

Fixture patch: `fix2/test-patch/test_event_authority_holding_bucket.dl412.patch`, SHA-256 `a0c70aec676fb95bda2c18c0fe5ad273a56062c193603c79378bdd6a7d18dcdb`. It applies to the unchanged tracked test; the full patched file is beside it. Landing writer: `scripts/write_multifamily_receipt.py` at the top of the evidence bundle, also under `fix2/scripts/`, aligned with the committed receipt text.

Compact run summary: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-SEAL/fix2/results/fix2-summary.json`, SHA-256 `a93e8ab5732a4c9d39060c660533ffc6872cc8837164539aecbcb0741ceb1c5a`. It pins the detailed differential, numeric, guard and mutation results. Scratch helpers preserve each reviewer's probe logic with only local roots, validator/receipt overlays and the fixture-patch pin changed. Setup corrections (missing scratch temp directory, CRLF whitespace handling, source-section selection and scratch-mutation syntax/evaluation order) were fixed in the harness before these retained results; they changed no production rule. The currentness copy's 15 file hashes match despite unsupported permission-preservation metadata on the source share.

**Family grades before → after:** N/A → N/A; no families are admitted or graded, no self-grade JSON applies. **Bindings:** none. **Ids minted:** none; DL-998 and DL-999 remain fixture-only. DL-412 is cited as the existing authority, not authored here. Landing prerequisites remain the DL-412/DL-413 dependencies, real lander receipt and ordered pre/post reviews. No seal is applied.

## Review round 3: Astra findings and responses (CA-SEAL-FIX3)

Review: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/reviews/CA-SEAL-sol/REVIEW-astra-2.md`, NOT_READY at `e4d8ad23ee7a9d9d57b841779ee17bcd6dc434b7`. The earlier `REVIEW-astra.md` and both evidence probes were also read. **AS2-01 and AS2-02 are fixed in `27f3912208`.** Nothing is disputed or stopped for Jared. Earlier round results above are historical; this section states the current behavior.

**AS2-01 — Where:** validator `strict_step_record` (line 272), `registry_step_record_scan` (line 323), and `registry_step_problems` (line 338). **Cause:** last-key-wins JSON loading erased conflicting keys before claim discovery. **Fix:** on the multi-family path every record-directory entry is read again using a duplicate-rejecting loader at every object depth, with decoded-key equality, strict JSON constants, object roots, exact registry state types and canonical lowercase 64-hex SHA strings. Duplicate members and duplicate foreign/rejected-file claimants fail the whole affected step, naming the file. The original `load_json` and no-field judgment are untouched.

**AS2-02 — Where:** the same scanner, recursive `registry_step_claim` (line 306), and the multi-only SHA-type condition in `admission_record_problems`. **Cause:** flat extraction discarded nested, Unicode, scalar/container and rejected-file claims. **Fix:** unreadable, ambiguous or noncanonical files invalidate every step they could touch, conservatively all steps when disambiguation is impossible. Expected before/after SHA positions are canonical even inside nested claims. A strictly read foreign record mentioning either digest anywhere in keys or values fails that step; discovery traverses containers and recognizes case, whitespace, Unicode decimal/fullwidth/mathematical digits and numeric scalar text. Discovery normalization never accepts a noncanonical member hash. Inspection that exceeds recursion capacity also fails closed. Only a listed member's own strictly read matching file is exempt.

A record without `registry_step_event_types` keeps exactly DL-077's original record problems, admission and ordering, including numeric SHA acceptance and its DL-077/DL-078 decision exclusion. Malformed legacy records can invalidate multi-family steps without acquiring any new problem themselves. The new receipt alone refreshes its current-validator pin; authority/card/source/prior pins, identities, null lander, checked forbidden list and false flags are unchanged. Descriptive receipt/spec text matches the code. CA-SEAL-FIX3 joins the full procedural seal-applier exclusion in both documents; the checked author/lander predicate is unchanged.

### Current verification

| Check | Result |
|---|---|
| Final patched holding-bucket suite | Exit 0; **68 methods pass**. The patch remains external pending DL-413, as a separate commit in the same landing as the validator. |
| New class probes on reviewed `e4d8ad23ee` | Exit 1; seven new methods produce **97 failure entries**, so the patch catches the reviewed defects. |
| Astra parser probes | All ten reproduced through admission and main: valid control accepts three; every negative rejects every member and names its file. |
| Astra broader probe | 112 scenarios; complete truthful 43→46 step accepted, all 111 mutations reject all step members. |
| Existing-record differential | 1,732 helper + 1,732 admission + 1,732 coexistence comparisons, zero differences. |
| Raw-JSON legacy differential | 304 comparisons over all four existing records, with and without step records; duplicate/escaped keys, nested claims, Unicode literals, arrays, NaN and malformed hashes; zero differences. **5,500 record comparisons total.** |
| Every unchanged fixture | 34 methods retain the same two pre-existing failures and no errors; all 125 helper outcomes match. 113 diagnostics are exact after temporary-path normalization; 12 differ only in authorized receipt-chain diagnostics/returned pin. This is not a claim of byte-identical tampered-receipt diagnostics. |
| Old/new main on existing records | Both exit 1; outputs equal after removing generation time and the new authorized receipt input pin. |
| Check 11 | **40 semantic guard variants × 73 isolated negatives = 2920 cells**; all intended flips and retained baseline rejection reasons verified. |
| Shards / index | Both exit 0; top-level `status: pass`; no owner-source regeneration or governance refresh required. |
| Scope / AST / whitespace | Only five approved paths differ from the reviewed head; CRLF preserved. All unrelated function ASTs match the reviewed validator; only the original four authorized observers differ from frozen DL-077. Protected artifacts and existing receipts/records are untouched; diff check passes. |

The fixtures cover duplicates at root/side/hash/step/depth/metadata levels in both orders; member and rejected-file copies; nested hash/side claims, Unicode/fullwidth/Arabic/mathematical digits, uppercase, whitespace and trailing LF, integers/floats/booleans/null/arrays, non-JSON constants, invalid UTF-8/JSON, directories and non-JSON extensions. Two disjoint complete steps pass; an unreadable file rejects both steps; either shared digest rejects the conflicting steps.

### Check 11: full lane guard-removal table

Each case starts from a valid fixture. Observing receipt/assessment pins are refreshed when their source changes. The canonical-member case first establishes a valid string 7/8 step and changes only one member's representation. Canonical foreign negatives use unrelated digests so the recursive claim guard cannot mask their parser defect. Every unflipped negative retains at least one exact baseline rejection reason; the machine table records those intersections and all issues. Baseline negatives are corroborated through main.

Intentional duplicate observations are weakened together: `receipt-validator_before_sha256` is the two-direction receipt bridge; `root-shape` pairs the object-root rule with state-object validation; `canonical-members-paired` removes the same exact-string constraint in the own-record helper and step-state/strict-loader path. A step case flips when a previously refused target member becomes accepted; the machine table identifies the exact accepted targets. Removing broad exclusivity or directory uncertainty can expose complete peers while a duplicated own-file guard still refuses the ambiguous member. `member-incomplete` targets its complete peers, and per-record receipt/decision cases target the defective record. No unrelated guard is used to hide a negative.

| Guard weakened in scratch | Negatives that start to pass | Other negatives retain a baseline rejection reason |
|---|---|---|
| `foreign` | `canonical-boolean`, `canonical-nested`, `canonical-number`, `canonical-unicode`, `canonical-uppercase`, `canonical-whitespace`, `deep-uninspectable-claim`, `duplicate-foreign`, `duplicate-member`, `foreign-Known37`, `foreign-malformed`, `foreign-newline`, `foreign-numeric-claimant`, `foreign-numeric-rejected`, `foreign-ordinary`, `foreign-rejected`, `foreign-upper`, `mention-key-registry_after`, `mention-key-registry_before`, `mention-nested-registry_after`, `mention-nested-registry_before`, `mention-numeric-registry_after`, `mention-numeric-registry_before`, `mention-space-registry_after`, `mention-space-registry_before`, `mention-unicode-registry_after`, `mention-unicode-registry_before`, `mention-upper-registry_after`, `mention-upper-registry_before`, `mention-value-registry_after`, `mention-value-registry_before`, `nested-noncanonical-side`, `non-json-constant`, `non-json-file`, `outer-array`, `unreadable-json`, `unreadable-utf8` | 36 of 73 |
| `missing` | `missing-member` | 72 of 73 |
| `states` | `same-states-counts`, `same-states-registry_after-revision`, `same-states-registry_after-sha256`, `same-states-registry_before-revision`, `same-states-registry_before-sha256` | 68 of 73 |
| `same-description` | `same-list-and-states`, `same-states-counts`, `same-states-registry_after-revision`, `same-states-registry_after-sha256`, `same-states-registry_before-revision`, `same-states-registry_before-sha256` | 67 of 73 |
| `count` | `count-padded`, `count-short` | 71 of 73 |
| `different-hashes` | `equal-hashes` | 72 of 73 |
| `sorted-unique` | `shape-duplicate`, `shape-unsorted` | 71 of 73 |
| `all-or-none` | `member-incomplete` | 72 of 73 |
| `step-pin` | `step-receipt-pin` | 72 of 73 |
| `decision-DL412` | `decision-DL412` | 72 of 73 |
| `receipt-schema_id` | `receipt-schema_id` | 72 of 73 |
| `receipt-authority_ref` | `receipt-authority_ref` | 72 of 73 |
| `receipt-authority_section_sha256` | `receipt-authority_section_sha256` | 72 of 73 |
| `receipt-validator_before_sha256` | `receipt-validator_before_sha256` | 72 of 73 |
| `receipt-validator_after_sha256` | `receipt-validator_after_sha256` | 72 of 73 |
| `receipt-record_dir` | `receipt-record_dir` | 72 of 73 |
| `receipt-record_schema_id` | `receipt-record_schema_id` | 72 of 73 |
| `receipt-author_task` | `receipt-author_task` | 72 of 73 |
| `receipt-seal_authorized` | `receipt-seal_authorized` | 72 of 73 |
| `receipt-admission_authorized` | `receipt-admission_authorized` | 72 of 73 |
| `receipt-contract_depth_complete` | `receipt-contract_depth_complete` | 72 of 73 |
| `receipt-prior-path` | `receipt-prior-path` | 72 of 73 |
| `receipt-prior-sha256` | `receipt-prior-sha256` | 72 of 73 |
| `receipt-lander-and-list` | `receipt-forbidden`, `receipt-lander-''`, `receipt-lander-None` | 70 of 73 |
| `authority-tokens` | `authority-token-0`, `authority-token-1`, `authority-token-2`, `authority-token-3` | 69 of 73 |
| `duplicates` | `duplicate-foreign`, `duplicate-member` | 71 of 73 |
| `constants` | `non-json-constant` | 72 of 73 |
| `root-shape` | `canonical-boolean`, `canonical-nested`, `canonical-number`, `canonical-unicode`, `canonical-uppercase`, `canonical-whitespace`, `outer-array` | 66 of 73 |
| `canonical-scan` | `canonical-boolean`, `canonical-nested`, `canonical-number`, `canonical-unicode`, `canonical-uppercase`, `canonical-whitespace` | 67 of 73 |
| `uncertainty` | `canonical-boolean`, `canonical-nested`, `canonical-number`, `canonical-unicode`, `canonical-uppercase`, `canonical-whitespace`, `duplicate-foreign`, `duplicate-member`, `foreign-malformed`, `foreign-newline`, `foreign-numeric-claimant`, `foreign-numeric-rejected`, `foreign-upper`, `nested-noncanonical-side`, `non-json-constant`, `outer-array`, `unreadable-json`, `unreadable-utf8` | 55 of 73 |
| `recursive-claims` | `deep-uninspectable-claim`, `foreign-Known37`, `foreign-ordinary`, `foreign-rejected`, `mention-key-registry_after`, `mention-key-registry_before`, `mention-nested-registry_after`, `mention-nested-registry_before`, `mention-numeric-registry_after`, `mention-numeric-registry_before`, `mention-space-registry_after`, `mention-space-registry_before`, `mention-unicode-registry_after`, `mention-unicode-registry_before`, `mention-upper-registry_after`, `mention-upper-registry_before`, `mention-value-registry_after`, `mention-value-registry_before`, `non-json-file` | 54 of 73 |
| `all-files` | `non-json-file` | 72 of 73 |
| `canonical-members-paired` | `canonical-member`, `canonical-number` | 71 of 73 |
| `claim-object-keys` | `mention-key-registry_after`, `mention-key-registry_before` | 71 of 73 |
| `claim-list-values` | `deep-uninspectable-claim`, `mention-nested-registry_after`, `mention-nested-registry_before` | 70 of 73 |
| `claim-case` | `mention-upper-registry_after`, `mention-upper-registry_before` | 71 of 73 |
| `claim-whitespace` | `mention-space-registry_after`, `mention-space-registry_before` | 71 of 73 |
| `claim-unicode-decimal` | `mention-unicode-registry_after`, `mention-unicode-registry_before` | 71 of 73 |
| `deep-claim` | `deep-uninspectable-claim` | 72 of 73 |
| `nested-canonical` | `nested-noncanonical-side` | 72 of 73 |

### Astra recurring-defect sweep

| Class | Evidence / applicability |
|---|---|
| Forged/contradictory identity and hashes | Member state/list/count, live-row/decision/depth pins, receipt authority and prior pins are covered by the suite and matrix; real registry hashes are read from pinned Git history in Astra's probe. |
| Storage-assigned metadata | Not applicable: this change reads planning admission records, not runtime event payloads or Storage metadata. |
| Historical/current-reader crossover | No-field helper/aggregator/raw-file/coexistence differential and all original fixtures preserve DL-077 judgments. |
| Multiple interpretations | Strict parser/type/canonical checks plus recursive either-digest probes cover the entire requested representation class. |
| Dangling schema refs | No schema or `$ref` is added or changed. |
| Partial size limits | No event body, payload externalization or storage-size rule changes. |
| Custody on every path | Prior/current validator and receipt bridge, authority tokens and implementation pins are tested through the full admission checker. |
| Masked negatives | Guard table above, named duplicate pairs and retained baseline-reason intersections. |
| Unsupported grades | Family grades **N/A → N/A**. No family, admission, native behavior or seal is graded/passed by this work. |

Standing runtime checks 1–4, 6–7 and 10 are outside this checker-only change; their contracts are untouched. Standing check 5 is covered by exact full-match SHA guards and trailing-LF negatives; check 8 uses admitted sets and main's admission failures rather than treating unrelated seal exit 1 as sufficient; check 9 adds no references; check 11 is proved above.

### Current pins and handoff

Validator SHA-256: `74897e17da4d330e835e0d196acd8c2af6761f9fe209cec1b7689d88b7d8adf6`. New receipt SHA-256: `b1b3e8cbdba25fae91def156c661017184b0cb632e1bc36a0f7cf4e0fe566fd4`. Fixture patch SHA-256: `54037cce41156d8c4a91b3832084c203a697d6dfb809dc75906cde1c32dbcc29`.

Evidence: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-SEAL/fix3/results/fix3-summary.json`, SHA-256 `5ecc849eb160a2ac06a6d63843b361803fed2e2c614fd3531432bb7f97f3483c`; full guard matrix `fix3/results/guard-matrix.json`, SHA-256 `40c079be9feead3c2735e08ffe58537409024f8de1281c59103691643d04cdfd`. Reproduction helpers, raw differential results, probe results and logs are under `fix3/`, pinned by its `SHA256SUMS`. The current patch and landing receipt writer are also copied to the top-level evidence bundle.

**Ids used:** no ids minted; DL-412 is cited authority, DL-998/DL-999 remain fixture-only. **Bindings:** none. **Family grades:** N/A → N/A; no self-grade JSON applies. The DL-412/DL-413 landing prerequisites, actual lander receipt, and ordered Sol/Astra reviews before and after landing remain open. No admission, registry append, seal, main push, pm-mail or subagent occurred.
