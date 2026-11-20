# CA-SEAL branch report: the DL-412 seal-check change, 2026-11-04

**Current status, CA-SEAL-FIX8: C7-01 strict bridge parsing repaired; fresh verification is recorded in review round 8 below.** Landing still requires the final lander receipt and the exact DL-412-only Spec Lock entry from claude-projects-refresh in the same landing. FIX6’s stop and earlier results below are historical.

Branch `plans/ea-seal-check-multifamily-20261104`, from `origin/main` `5e37ffb616`. Worker CA-SEAL, stream E, agent task `claude-opus-5.5:ea-ca-seal-20261104`. Fix round 1 was done by worker CA-SEAL-FIX1, agent task `claude-opus-5.5:ea-ca-seal-fix1-20261104`. Fix round 2 was by CA-SEAL-FIX2 (Codex). Fix round 3 was by CA-SEAL-FIX3 (Codex). Fix round 4 was by CA-SEAL-FIX4 (Codex). Fix round 5 is by CA-SEAL-FIX5 (Codex). Fix round 6 investigation and stop are by CA-SEAL-FIX6 (Codex). Fix round 7 is by CA-SEAL-FIX7 (Codex). The stream lead `claude-opus-5.5:pm-ea-lead`, session `b29da1b5-9877-474f-8a4c-e7a57ab7f899`, made `616345d688`. The full change record is `seal-check-multifamily-step-amendment.md` beside this file.

## Current FIX8 parsing contract and B′ landing contract

**Current FIX8 pins:** validator `319f6bffddb07a36e633fd949146e4ce9149819ea5e817b13897a74314163a91`; pending new receipt `7d57ebde79f1b5ddc5acb224d16c0133bad924259677758b1d02adbbcd2f5882`. The pending receipt still has a null lander and is not the final landing anchor.

CA-SEAL-FIX7 implements pm7-build's 2026-11-05 ruling, mail `1105012742-e2fc`, within the approved card 4c B / DL-412 change. It supersedes FIX6's stopped proposal, including the proposed DL-077 anchor. **Only the DL-412 receipt gets a new Spec Lock entry.** DL-077 keeps its existing admission-record pins and gets no new anchor.

The August trust model anchors the DL-077 receipt only through existing record pins. The new DL-412 receipt has none until the DL-300 step records land. The reseal therefore supplies its byte anchor in `Plans/Spec_Lock.json`, `canonical_ssot_hashes.files`, at the same landing as this change. This worker does not edit that file.

The bridge strictly parses Spec Lock and the DL-412 receipt as UTF-8 JSON objects before selecting an anchor: duplicate keys at any depth and `NaN`, `Infinity`, `-Infinity` are refused; BOM, trailing garbage, non-object roots and wrong selected-field types fail closed. The lock requires an object `canonical_ssot_hashes`, an array `files`, exactly one object entry at the exact receipt path, and a canonical lowercase 64-hex string `sha256` matching the complete receipt bytes. Any failure means the anchor is absent; the bridge presents the live hash to the original DL-077 predicate. The shared legacy JSON reader and full DL-412 semantic predicate are unchanged.

Outside DL-077's unchanged predicate, the bridge presents the trusted DL-077 after-hash only when all three byte conditions hold:

1. The live validator SHA-256 equals DL-412's `validator_after_sha256`.
2. Exactly one Spec Lock entry has path `reports/event-authority-20261104/seal-check-multifamily-step-receipt.json`, and its `sha256` equals SHA-256 of that receipt's complete bytes. Missing, wrong-hash, duplicate and elsewhere-path entries fail closed.
3. DL-412's `validator_before_sha256` equals DL-077's `validator_after_sha256`.

Otherwise the original predicate receives the live hash, emits its original mismatch diagnostic and returns its original null old receipt pin. Legacy admission and holding both fail closed. DL-412's full authority/identity/lander/prior-byte semantic predicate remains separate and affects only the new pin and step records. A fixture with a matching trusted anchor can therefore isolate an unrelated semantic fault without changing C4's old judgments. Changing receipt bytes under an unchanged anchor is an integrity fault even if those bytes are semantically valid. A non-null new semantic pin alone does not authorize legacy admission or holding.

**Preserved history:** no August list, August fingerprint, freeze digest, earlier receipt or existing record moved. FIX8 refreshes only the new receipt's `validator_after_sha256` pin and aligns its descriptive bridge/exclusion text. Every other pin, identity, null lander, checked author/list and false flag remains unchanged. The old receipt predicate, its diagnostic order and its return pin remain unchanged. The new receipt text now states the exact byte anchor and strict parser contract; no existing receipt is rewritten.

**Detection boundary:** with trusted Spec Lock bytes and this enforcing code intact, the bridge detects modified executable/receipt bytes, invented matching receipt links, absent/ambiguous anchors and broken before-links. It does not authenticate Git history, independently prove historical registry states or inspect same-step edits of existing rows. It cannot detect an actor rewriting both the trusted anchor and the receipt/executable together, or removing the enforcing code. Git history and independent procedural review remain necessary.

**Landing order, assembled as one landing with no unanchored interval on main:**

1. DL-412 is on main; DL-413's named test allowance must also be present before the fixture patch is committed.
2. The actual lander runs `python3 -I write_multifamily_receipt.py <landing-tree> --lander <actual-lander-task>`. This fills `lander_task` and its matching checked list and pins the actual validator and DL-412 section on that tree.
3. The reseal worker, **claude-projects-refresh**, adds exactly the entry below for SHA-256 of the final receipt bytes from step 2, in the same landing that lands this change. It adds no DL-077 entry.
4. Apply the supplied fixture patch as its own commit in that same landing. Its synthetic trees include a matching fixture Spec Lock; deliberate anchor/forgery controls retain or corrupt that fixture anchor explicitly.
5. Land the validator, final receipt, exact reseal entry and separate fixture commit together, with the required Sol/Astra reviews before and after. **Until that entry exists, legacy admission and holding fail closed on this tree; this is why they must land together.** No seal, admission or landing is performed by this worker.

Exact entry template for `canonical_ssot_hashes.files` (the reseal computes the SHA from the final receipt at landing; the pending receipt digest is not a substitute):

```json
{
  "path": "reports/event-authority-20261104/seal-check-multifamily-step-receipt.json",
  "sha256": "<SHA-256 of final receipt bytes after write_multifamily_receipt.py fills lander_task>"
}
```

Any later receipt rewrite needs its exact Spec Lock entry refreshed through the authorized reseal and any observing step-record pins refreshed. The procedural seal-applier exclusion includes **CA-SEAL-FIX8 (Codex)** in addition to the author, actual lander, FIX1–FIX7, the named stream lead/session and every other fix worker. The checked receipt list remains exactly author and lander.

## What this branch does

It implements E-CARDS-1 item 4c, option B (DL-412): an admission record can describe a truthful registry step that added several families at once, provided every family has its own complete record naming that step. FIX7 adds the approved exact DL-412 receipt anchor to FIX5's live byte-link bridge, repairing C6-01 without moving the separate semantic predicate into DL-077. The current ruling and landing contract above supersede the historical FIX6 stop.

| Commit | What |
|---|---|
| `e217c94c3b` | The validator (`190a86f2...` -> `bad3e7e8...`, CRLF), its spec section, the disposition-schema note and the DL-412 change receipt |
| `d67201e885` | The change record and this report (reviewed by Sol: NOT_READY, CA-SEAL-01 and CA-SEAL-02) |
| `e10fc5c840` | Fix round 1: the validator (`bad3e7e8...` -> `e4e988b7...`, CRLF), the spec's DL-412 section, and the receipt's validator pin and text |
| fix round 1, reports commit | The change record and this report, aligned with the fixed check |
| `9460959cc7` | Fix round 2: consistent step SHA interpretation (AS-01), spec and new receipt text/pin |
| fix round 2, reports commit | AS-02 procedural exclusions, same-landing patch requirement, rerun results and check-11 table |
| `4fa959c17f` | Fix round 5: live validator SHA-256 on every observer call; two byte-chain links verified before preserving the DL-077 pin |
| `cf6c055d4b` | Fix round 4: preserve the original DL-077 receipt predicate and return pins; separately check the full DL-412 receipt for steps; retain exact decimal/exponent numeric claim text |

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

1. **The lander fills `lander_task`.** Do this at landing by running the receipt writer with `--lander` on the tree that carries DL-412 (command in the change record). Until then multi-family step records fail closed on the new receipt; legacy admission and holding retain their original judgment only on a tree with the exact matching Spec Lock anchor and both validator byte links intact. Missing or broken anchors or byte-chain inputs fail closed with the original DL-077 message.
2. **Landing order.** The branch lands after `plans/ea-cards1-answers-20261104` (DL-412).
3. **The test patch.** It lands as a separate commit in the same landing as the validator, after DL-413's `.gitignore` line (`66af5d0d67`) is on `main`. Without it the holding-bucket test fails 41 entries instead of today's 2.
4. **The DL-300 records.** The record writer chooses and documents the truthful step. The commit that appended the three rows is `102a7e99e8`, and that step also changed eleven Goal rows.
5. **Reviews.** Sol 6.1 max then Astra max, before landing and right after. The author (CA-SEAL, `claude-opus-5.5:ea-ca-seal-20261104`), the actual lander, CA-SEAL-FIX1 (`claude-opus-5.5:ea-ca-seal-fix1-20261104`), CA-SEAL-FIX2, CA-SEAL-FIX3, CA-SEAL-FIX4, CA-SEAL-FIX5 (Codex), CA-SEAL-FIX6 (Codex), CA-SEAL-FIX7 (Codex), CA-SEAL-FIX8 (Codex), the stream lead `claude-opus-5.5:pm-ea-lead` (session `b29da1b5-9877-474f-8a4c-e7a57ab7f899`, responsible for `616345d688`), and every other fix worker are procedurally excluded from applying the seal.
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

## Historical review round 3: Astra findings and responses (CA-SEAL-FIX3)

Review: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/reviews/CA-SEAL-sol/REVIEW-astra-2.md`, NOT_READY at `e4d8ad23ee7a9d9d57b841779ee17bcd6dc434b7`. The earlier `REVIEW-astra.md` and both evidence probes were also read. **AS2-01 and AS2-02 are fixed in `27f3912208`.** Nothing is disputed or stopped for Jared. This round is historical; round 4 below repairs C4-01/C4-02 and states the current behavior.

**AS2-01 — Where:** validator `strict_step_record` (line 272), `registry_step_record_scan` (line 323), and `registry_step_problems` (line 338). **Cause:** last-key-wins JSON loading erased conflicting keys before claim discovery. **Fix:** on the multi-family path every record-directory entry is read again using a duplicate-rejecting loader at every object depth, with decoded-key equality, strict JSON constants, object roots, exact registry state types and canonical lowercase 64-hex SHA strings. Duplicate members and duplicate foreign/rejected-file claimants fail the whole affected step, naming the file. The original `load_json` and no-field judgment are untouched.

**AS2-02 — Where:** the same scanner, recursive `registry_step_claim` (line 306), and the multi-only SHA-type condition in `admission_record_problems`. **Cause:** flat extraction discarded nested, Unicode, scalar/container and rejected-file claims. **Fix:** unreadable, ambiguous or noncanonical files invalidate every step they could touch, conservatively all steps when disambiguation is impossible. Expected before/after SHA positions are canonical even inside nested claims. A strictly read foreign record mentioning either digest anywhere in keys or values fails that step; discovery traverses containers and recognizes case, whitespace, Unicode decimal/fullwidth/mathematical digits and numeric scalar text. Discovery normalization never accepts a noncanonical member hash. Inspection that exceeds recursion capacity also fails closed. Only a listed member's own strictly read matching file is exempt.

A record without `registry_step_event_types` keeps exactly DL-077's original record problems, admission and ordering, including numeric SHA acceptance and its DL-077/DL-078 decision exclusion. Malformed legacy records can invalidate multi-family steps without acquiring any new problem themselves. The new receipt alone refreshes its current-validator pin; authority/card/source/prior pins, identities, null lander, checked forbidden list and false flags are unchanged. Descriptive receipt/spec text matches the code. CA-SEAL-FIX3 joins the full procedural seal-applier exclusion in both documents; the checked author/lander predicate is unchanged.

### Round-3 verification (superseded by round 4)

| Check | Result |
|---|---|
| Final patched holding-bucket suite | Exit 0; **68 methods pass**. The patch remains external pending DL-413, as a separate commit in the same landing as the validator. |
| New class probes on reviewed `e4d8ad23ee` | Exit 1; seven new methods produce **97 failure entries**, so the patch catches the reviewed defects. |
| Astra parser probes | All ten reproduced through admission and main: valid control accepts three; every negative rejects every member and names its file. |
| Astra broader probe | 112 scenarios; complete truthful 43→46 step accepted, all 111 mutations reject all step members. |
| Existing-record differential | 1,732 helper + 1,732 admission + 1,732 coexistence comparisons, zero differences. |
| Raw-JSON legacy differential | 304 comparisons over all four existing records, with and without step records; duplicate/escaped keys, nested claims, Unicode literals, arrays, NaN and malformed hashes; zero differences. **5,500 record comparisons total.** |
| Every unchanged fixture | 34 methods retain the same two pre-existing failures and no errors; all 125 helper outcomes match. 113 diagnostics are exact after temporary-path normalization; 12 differ in receipt-chain diagnostics/returned pin. Those differences were outside DL-412 scope and are repaired in fix round 4 below. |
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

### Round-3 pins and handoff (historical)

Validator SHA-256: `74897e17da4d330e835e0d196acd8c2af6761f9fe209cec1b7689d88b7d8adf6`. New receipt SHA-256: `b1b3e8cbdba25fae91def156c661017184b0cb632e1bc36a0f7cf4e0fe566fd4`. Fixture patch SHA-256: `54037cce41156d8c4a91b3832084c203a697d6dfb809dc75906cde1c32dbcc29`.

Evidence: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-SEAL/fix3/results/fix3-summary.json`, SHA-256 `5ecc849eb160a2ac06a6d63843b361803fed2e2c614fd3531432bb7f97f3483c`; full guard matrix `fix3/results/guard-matrix.json`, SHA-256 `40c079be9feead3c2735e08ffe58537409024f8de1281c59103691643d04cdfd`. Reproduction helpers, raw differential results, probe results and logs are under `fix3/`, pinned by its `SHA256SUMS`. The current patch and landing receipt writer are also copied to the top-level evidence bundle.

**Ids used:** no ids minted; DL-412 is cited authority, DL-998/DL-999 remain fixture-only. **Bindings:** none. **Family grades:** N/A → N/A; no self-grade JSON applies. The DL-412/DL-413 landing prerequisites, actual lander receipt, and ordered Sol/Astra reviews before and after landing remain open. No admission, registry append, seal, main push, pm-mail or subagent occurred.

## Historical review round 4: findings and responses (CA-SEAL-FIX4)

Review: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/reviews/CA-SEAL-sol/REVIEW-cycle4.md`, NOT_READY at `29885ae83ee9e31439804cb2e83f008d958ea7e5`. All three findings are fixed; none is disputed or stopped for Jared. Only DL-412 card 4c B is implemented. The code/spec/new-receipt fix is `cf6c055d4b51c07f7ffaf7b9ddd02a0bdbf8d150`; this report commit supplies C4-03 and the complete evidence record. No additional check change is approved or claimed.

### Findings

- **C4-01 — fixed in `cf6c055d4b`. Where:** validator `strict_step_record`, lines 270–307. **Cause:** decimal/exponent JSON tokens became rounded binary floats before recursive claim discovery. **Fix:** the strict reader's float subclass retains the exact numeric token for `str()` discovery while retaining ordinary float equality for the matching own-file exemption. Numeric registry SHA fields still fail the exact canonical-string checks. DL-077's reader is untouched. Canonical own string 7/8 members plus a foreign complete no-field record isolate integer, `.0`, `e0`, `.5`, overflow, `E+0`, `.0e-0` and quoted forms through admission and main. Nine actual CLI scenarios include the original five controls and four additional numeric forms; only the no-claim positive admits the three members. The foreign no-field record retains its own original problems. The six new C4 methods expose 18 failure entries on the reviewed validator after scratch-only re-pinning, and all pass on the fixed validator.
- **C4-02 — fixed in `cf6c055d4b`. Where:** `post_august_receipt_state` line 169, `post_august_validator_pin` line 238, `validate_post_august_admissions` line 471 (separate call at 512), and main's new input-pin observer at 1917. **Cause:** the complete new receipt predicate interrupted the old predicate at its validator comparison. **Fix:** observe the frozen DL-077 validator hash `190a86f23e06362bdb98e27eb23268c9691db46cc41bc9f97e1fbb6bde1abc20`, independently of the new receipt, at the original predicate position. The complete old predicate AST matches after replacing only that byte observer and removing docstrings; ordering, messages and returned DL-077 receipt hash match. Full new authority/current/prior-byte/identity integrity runs separately for step records and adds only their own errors. The review's 125 paired calls now have 125 exact normalized results. All twelve specific controls are in the external fixture patch. Row 3 again returns all seven ordered issues and `77503469f57314fac6c5c72856297b00a0b63d497576d9337e2728866e1d4aba`. Notes-only and repinned-record full CLI controls preserve holding and coordination admission exactly. The twelve earlier differences were outside DL-412 scope; every claim calling them authorized has been removed.
- **C4-03 — fixed in this report commit. Where:** amendment's “Every place that pins the validator's bytes” table, DL-412 row. **Cause:** a historical round-2 hash remained in the current table. **Fix:** the current table now uses `48ab44d79d097ec921dceeb7830c267afa1aaaf0ed871e1cf10912cbf3c8f782`; historical pins remain explicitly historical. The report, amendment, spec and receipt describe the implemented boundary. Both procedural seal-applier exclusions name CA-SEAL-FIX4; the receipt's checked list remains exactly author and lander.

### Full old/new compatibility differential

Every existing live record is covered: `browser.workspace.created`, `browser.workspace.reset`, `context.compaction.completed`, `coordination.agent_registered`. The old validator is the exact frozen DL-077 file (`190a86f2...`); no old receipt or production record is re-stamped. Returned values, issue text and order, admitted sets and old receipt pins are compared. Temporary fixture root paths are normalized. Full CLI comparisons additionally omit generation time and only the single added `multi_family_step_receipt_sha256` field. Coexistence comparisons select original no-field judgments while the approved step behavior is checked separately.

| Comparison group | Paired calls compared | Differences |
|---|---:|---:|
| `astra2_existing_records_helper` | 1,732 | 0 |
| `astra2_existing_records_admission` | 1,732 | 0 |
| `astra2_existing_records_with_steps` | 1,732 | 0 |
| `raw_existing_records_with_and_without_steps` | 472 | 0 |
| `original_125_paired_admission_holding_calls` | 125 | 0 |
| `legacy_only_full_cli_pairs` | 108 | 0 |
| `sol_original_legacy_mutations` | 112 | 0 |
| `sol_extended_existing_records` | 5,880 | 0 |
| `astra_original_existing_records` | 3,936 | 0 |
| `astra_original_fixture_helpers` | 283 | 0 |
| `cycle3_raw_legacy` | 1,112 | 0 |
| `numeric_legacy_with_steps` | 256 | 0 |
| **Total** | **17,480** | **0** |

The 125 calls come from all 34 original fixture methods, unchanged except supplying the new receipt to the new-side fixture. Both retain the same two pre-existing failures and no errors. The separate Astra trace compares all 283 record/admission/holding helper calls exactly. Its historical 279-call trace now visits four additional per-record calls under notes-only receipt tampering, restoring the old path rather than returning the new chain error early. The 108 paired full CLI cases execute 216 real validators and compare fresh output receipts and stdout: baseline; all nine DL-077 admission-receipt mutations; notes-only and repinned notes; absent/unreadable and wrong-type new receipts; six values for each of fourteen new-receipt fields; missing DL-412; and scalar/container/deep new receipt roots. Legacy holding, outcomes, diagnostic order and every old pin match in all cases. Only the added new pin can differ. These are comparisons of complete outputs, not a projection that hides changed old diagnostics.

### Verification and earlier-review replay

| Check | Result |
|---|---|
| Final external fixture patch / complete test file | Patch applies cleanly and produces the supplied complete file; **74 methods pass**, exit 0. Six new C4 methods produce **18 failure entries** against reviewed `74897e17...` bytes (scratch current pin refreshed), proving sensitivity. |
| Original Sol scenarios/adversarial/legacy/sensitivity/writer/numeric CLI | Rerun. All 26 original negatives reject the step; X1/X2 and 112 legacy mutations pass their expectations; writer equivalence holds. S1–S7/C1–C5 real CLIs all exit 1 for unrelated unfinished-seal checks. S3/S5/S6 now preserve the old coordination admission and holding judgment, with new pin null. C4 admits the three complete synthetic members; C5 rejects them when one is 11/12. |
| Sol extended sweep | 5,880 legacy comparisons match; all 880 malformed and 296 foreign/rejected claimants reject every step member. Its five old pair-only positive expectations remain superseded by the earlier either-digest/uncertainty rule: different before, different after, reversed endpoints, missing before hash, missing after hash. Original exit 1/result is retained; none is a legacy difference or a negative escape. |
| New receipt probes | All 74 malformed new receipt cases and four further chain/current-byte checks reject; writer byte identity holds. The full new semantic predicate must remain separate from DL-077 (C4-02). The actual executable-byte assertion was also retargeted in this round; C5-01 found that this removed coverage of a real legacy integrity regression. Round 5 restores that assertion on DL-077 and adds byte-only controls; only unrelated semantic-field coupling is obsolete. Both the initial recorder exit and the corrected successful result are retained. |
| Astra original / cycle-2 / cycle-3 / cycle-4 probes | Numeric, nested, duplicate (both orders and escaped keys), Unicode, arbitrary-depth and raw/coexistence probes rerun. Ten parser scenarios pass; the complete true 43→46 step passes and all 111 mutations reject. Cycle-4's own 58-case recorder is retained, including exploratory nested revision/count observations. Every actual numeric CLI uses the final validator SHA-256. |
| Check 11 | **43 variants × 86 isolated negatives = 3,698 cells**. All expected flips match; all other negatives retain an exact baseline rejection reason. Baseline negatives are corroborated through main. |
| Shards / PlanUnit index | Both exit 0; `status: pass`, 99 sources / 3,092 shards and 7,421 PlanUnits. Fifteen ignored currentness input files were copied byte-for-byte from the share. No indexed owner source changed, so no regeneration or governance refresh is required. |
| Scope / frozen predicate / line endings | Only five fix-round paths change; the branch contribution remains exactly its six original paths. All other original function ASTs match; the old receipt predicate matches apart from its byte observer/docstring. All 1,992 validator lines retain CRLF. Whitespace check passes. Protected artifacts, old receipts, existing records, registry and generated files are unchanged. |

Historical FIX4 result, superseded for missing byte-chain input by FIX5: the original 34-method suite retained its two baseline failures on the unpatched branch as well as the original validator; it no longer acquires 41 failures merely from the new receipt dependency. The same-landing fixture patch requirement remains, to carry the multi-family and compatibility coverage. No full run-gates, governance audit, migration/landing check or unrelated runtime suite is claimed. No synthetic PASS row is a real family grade or seal pass.

### Check 11: guard, negatives that flip, negatives that stay rejected

Each case starts valid and changes one semantic input. Observational receipt/assessment pins are refreshed. The complete step peers are the target for sibling incompleteness; per-record receipt/decision cases target the defective record. The legacy frozen-pin case starts with valid no-field records and changes only DL-077's after pin, refreshing their observing implementation pins. It proves the original validator hash is still required. The receipt before-pin guard is now standalone; it no longer has a duplicate observation inside DL-077. Root/object-state and canonical-member checks intentionally duplicate one another and are weakened together in the named variants, as before. Every retained negative's exact baseline-reason intersection and every accepted target are recorded in the matrix.

| Guard weakened in scratch | Negatives that start to pass | All other negatives retain a baseline reason |
|---|---|---:|
| `foreign` | `canonical-boolean`, `canonical-nested`, `canonical-number`, `canonical-unicode`, `canonical-uppercase`, `canonical-whitespace`, `deep-uninspectable-claim`, `duplicate-foreign`, `duplicate-member`, `foreign-Known37`, `foreign-malformed`, `foreign-newline`, `foreign-numeric-claimant`, `foreign-numeric-rejected`, `foreign-ordinary`, `foreign-rejected`, `foreign-upper`, `mention-exact-number-.0`, `mention-exact-number-.0e-0`, `mention-exact-number-.5`, `mention-exact-number-E+0`, `mention-exact-number-e0`, `mention-exact-number-e9999`, `mention-key-registry_after`, `mention-key-registry_before`, `mention-nested-registry_after`, `mention-nested-registry_before`, `mention-numeric-registry_after`, `mention-numeric-registry_before`, `mention-quoted-number-.0`, `mention-quoted-number-.0e-0`, `mention-quoted-number-.5`, `mention-quoted-number-E+0`, `mention-quoted-number-e0`, `mention-quoted-number-e9999`, `mention-space-registry_after`, `mention-space-registry_before`, `mention-unicode-registry_after`, `mention-unicode-registry_before`, `mention-upper-registry_after`, `mention-upper-registry_before`, `mention-value-registry_after`, `mention-value-registry_before`, `nested-noncanonical-side`, `non-json-constant`, `non-json-file`, `outer-array`, `unreadable-json`, `unreadable-utf8` | 37 of 86 |
| `missing` | `missing-member` | 85 of 86 |
| `states` | `same-states-counts`, `same-states-registry_after-revision`, `same-states-registry_after-sha256`, `same-states-registry_before-revision`, `same-states-registry_before-sha256` | 81 of 86 |
| `same-description` | `same-list-and-states`, `same-states-counts`, `same-states-registry_after-revision`, `same-states-registry_after-sha256`, `same-states-registry_before-revision`, `same-states-registry_before-sha256` | 80 of 86 |
| `count` | `count-padded`, `count-short` | 84 of 86 |
| `different-hashes` | `equal-hashes` | 85 of 86 |
| `sorted-unique` | `shape-duplicate`, `shape-unsorted` | 84 of 86 |
| `all-or-none` | `member-incomplete` | 85 of 86 |
| `step-pin` | `step-receipt-pin` | 85 of 86 |
| `decision-DL412` | `decision-DL412` | 85 of 86 |
| `receipt-schema_id` | `receipt-schema_id` | 85 of 86 |
| `receipt-authority_ref` | `receipt-authority_ref` | 85 of 86 |
| `receipt-authority_section_sha256` | `receipt-authority_section_sha256` | 85 of 86 |
| `receipt-validator_before_sha256` | `receipt-validator_before_sha256` | 85 of 86 |
| `receipt-validator_after_sha256` | `receipt-validator_after_sha256` | 85 of 86 |
| `receipt-record_dir` | `receipt-record_dir` | 85 of 86 |
| `receipt-record_schema_id` | `receipt-record_schema_id` | 85 of 86 |
| `receipt-author_task` | `receipt-author_task` | 85 of 86 |
| `receipt-seal_authorized` | `receipt-seal_authorized` | 85 of 86 |
| `receipt-admission_authorized` | `receipt-admission_authorized` | 85 of 86 |
| `receipt-contract_depth_complete` | `receipt-contract_depth_complete` | 85 of 86 |
| `receipt-prior-path` | `receipt-prior-path` | 85 of 86 |
| `receipt-prior-sha256` | `receipt-prior-sha256` | 85 of 86 |
| `receipt-lander-and-list` | `receipt-forbidden`, `receipt-lander-''`, `receipt-lander-None` | 83 of 86 |
| `authority-tokens` | `authority-token-0`, `authority-token-1`, `authority-token-2`, `authority-token-3` | 82 of 86 |
| `duplicates` | `duplicate-foreign`, `duplicate-member` | 84 of 86 |
| `constants` | `non-json-constant` | 85 of 86 |
| `root-shape` | `canonical-boolean`, `canonical-nested`, `canonical-number`, `canonical-unicode`, `canonical-uppercase`, `canonical-whitespace`, `outer-array` | 79 of 86 |
| `canonical-scan` | `canonical-boolean`, `canonical-nested`, `canonical-number`, `canonical-unicode`, `canonical-uppercase`, `canonical-whitespace` | 80 of 86 |
| `uncertainty` | `canonical-boolean`, `canonical-nested`, `canonical-number`, `canonical-unicode`, `canonical-uppercase`, `canonical-whitespace`, `duplicate-foreign`, `duplicate-member`, `foreign-malformed`, `foreign-newline`, `foreign-numeric-claimant`, `foreign-numeric-rejected`, `foreign-upper`, `nested-noncanonical-side`, `non-json-constant`, `outer-array`, `unreadable-json`, `unreadable-utf8` | 68 of 86 |
| `recursive-claims` | `deep-uninspectable-claim`, `foreign-Known37`, `foreign-ordinary`, `foreign-rejected`, `mention-exact-number-.0`, `mention-exact-number-.0e-0`, `mention-exact-number-.5`, `mention-exact-number-E+0`, `mention-exact-number-e0`, `mention-exact-number-e9999`, `mention-key-registry_after`, `mention-key-registry_before`, `mention-nested-registry_after`, `mention-nested-registry_before`, `mention-numeric-registry_after`, `mention-numeric-registry_before`, `mention-quoted-number-.0`, `mention-quoted-number-.0e-0`, `mention-quoted-number-.5`, `mention-quoted-number-E+0`, `mention-quoted-number-e0`, `mention-quoted-number-e9999`, `mention-space-registry_after`, `mention-space-registry_before`, `mention-unicode-registry_after`, `mention-unicode-registry_before`, `mention-upper-registry_after`, `mention-upper-registry_before`, `mention-value-registry_after`, `mention-value-registry_before`, `non-json-file` | 55 of 86 |
| `all-files` | `non-json-file` | 85 of 86 |
| `canonical-members-paired` | `canonical-member`, `canonical-number` | 84 of 86 |
| `claim-object-keys` | `mention-key-registry_after`, `mention-key-registry_before` | 84 of 86 |
| `claim-list-values` | `deep-uninspectable-claim`, `mention-nested-registry_after`, `mention-nested-registry_before` | 83 of 86 |
| `claim-case` | `mention-upper-registry_after`, `mention-upper-registry_before` | 84 of 86 |
| `claim-whitespace` | `mention-space-registry_after`, `mention-space-registry_before` | 84 of 86 |
| `claim-unicode-decimal` | `mention-unicode-registry_after`, `mention-unicode-registry_before` | 84 of 86 |
| `deep-claim` | `deep-uninspectable-claim` | 85 of 86 |
| `nested-canonical` | `nested-noncanonical-side` | 85 of 86 |
| `exact-number-tokens` | `mention-exact-number-.0`, `mention-exact-number-.0e-0`, `mention-exact-number-.5`, `mention-exact-number-E+0`, `mention-exact-number-e0`, `mention-exact-number-e9999` | 80 of 86 |
| `step-receipt-application` | `authority-token-0`, `authority-token-1`, `authority-token-2`, `authority-token-3`, `receipt-admission_authorized`, `receipt-author_task`, `receipt-authority_ref`, `receipt-authority_section_sha256`, `receipt-contract_depth_complete`, `receipt-forbidden`, `receipt-lander-''`, `receipt-lander-None`, `receipt-prior-path`, `receipt-prior-sha256`, `receipt-record_dir`, `receipt-record_schema_id`, `receipt-schema_id`, `receipt-seal_authorized`, `receipt-validator_after_sha256`, `receipt-validator_before_sha256` | 66 of 86 |
| `legacy-frozen-validator-pin` | `legacy-frozen-validator-pin` | 85 of 86 |

### Astra recurring-defect sweep and standing checks

| Item | Evidence / applicability |
|---|---|
| 1. Forged or contradictory identities/hashes | Member lists/states/counts, live-row/decision/depth pins and all receipt identity/hash predicates are exercised by the suite, the 112 scenarios and guard matrix. Real registry history hashes remain review evidence; this checker does not authenticate historical Git states. |
| 2. Storage-assigned metadata | N/A: no runtime Storage payload or metadata contract changes. |
| 3. Historical/current-reader crossover | All no-field old/new comparisons, receipt faults, notes-only/repinned CLI cases and coexistence controls match. No new current-writer guard reaches legacy records. |
| 4. Multiple interpretations | Canonical SHA types plus recursive claim scanning retain exact decimal/exponent tokens; ordinary numeric metadata does not invalidate the matching own-file exemption. |
| 5. Dangling references | No schema or `$ref` is added or changed. |
| 6. Partial size limits | N/A: no stored event body, externalization or size policy changes. |
| 7. Custody on every path | Full DL-412 integrity is enforced for step admissions. Removing its moved application admits exactly its 20 authority/receipt negatives. The old DL-077 predicate and holding path remain independent and intact. |
| 8. Masked negatives | Full guard table above, named duplicates, source-pin refreshes and retained rejection reasons. |
| 9. Unsupported grades | N/A → N/A. No family, native behavior or seal is graded by this work. |
| 10. Numeric alternate forms | Integer, `.0`, `e0`, fractional, overflow, signed exponent and quoted controls run through admission/main/real CLI. Numeric SHA fields are refused on the multi-family path; the legacy reader's existing numeric behavior is preserved. |
| 11. Type confusion | Wrong booleans, strings, nulls, arrays, objects, non-object roots and malformed/nested values are covered by the suite and mutation grids. No coercion of a step member's SHA into canonical acceptance is allowed. |

Standing runtime checks 1–4, 6–7 and 10 are outside this planning-checker change. Check 5 uses full-match SHA checks and trailing-LF negatives; check 8 verifies admitted sets, named failures, fresh CLI receipts and stdout rather than accepting exit 1 alone; check 9 adds no schema refs; check 11 is proved above.

### Pins, evidence and handoff

Validator SHA-256: `48ab44d79d097ec921dceeb7830c267afa1aaaf0ed871e1cf10912cbf3c8f782`. New pending receipt SHA-256: `bcdbc6f6c468aacc98a3a6b66c7b084ad1a3ceeaae86fdef4d0059c50fa5fafd`. Fixture patch SHA-256: `2d8a52894f1dc4724dbecf5ad477a4fd131f5eea5c0ee53cdc6bdc55d80268f7`. Only the new receipt's current-validator pin is refreshed; every other pin, authority/source/card reference, identity, null lander, checked author/lander list and false flag is preserved. Descriptive receipt/spec text is aligned.

Evidence root: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-SEAL/fix4/`. Summary `results/fix4-summary.json`: SHA-256 `3a01ce4e242e9cd5b1196b50a29334f3bacb24b547c1328c2a6adcc414dbb091`. Complete guard table `results/guard-matrix.json`: SHA-256 `ed93bc767e4335c9a1dd8ecac492b73a351c6a1572f4b1975a150492596d33be`. The bundle retains replay sources, original nonzero/superseded expectations, final results and the full fixture file/patch; `SHA256SUMS` pins them. Runtime scratch trees are excluded and removed after copying the evidence. Setup-only scratch path/allowlist and obsolete probe-assertion corrections changed no production rule.

**Family grades before → after:** N/A → N/A; no self-grade JSON applies. **Ids used:** no ids minted; DL-412 is cited authority, DL-998/DL-999 remain fixture-only. **Bindings:** none. **Open integration work:** DL-412/DL-413 dependencies, the actual lander and matching receipt list, the fixture patch as its own commit in the same landing, and ordered Sol/Astra reviews before and after landing. CA-SEAL-FIX4 joins the full procedural seal exclusion in both documents; the checked list is unchanged. No admission, registry append, seal, main push, pm-mail or subagent occurred.

## Review round 5: findings and responses (CA-SEAL-FIX5)

Review: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/reviews/CA-SEAL-sol/REVIEW-cycle5.md`, NOT_READY at `66280444b913235ab0a242c3884f403cc14cbfdd`. **C5-01 is fixed in `4fa959c17fb979b2b8bab34da40eb27b52293187`.** No finding is disputed or stopped for Jared. This report is the verification and handoff companion, not a landing or seal.

**Where:** `Plans/.audits/event-authority-2026-08-12/independent-validator/pm_event_authority_independent_validator.py:238` (`post_august_validator_pin`); spec's DL-412 note at line 96; the new receipt's byte-chain description. **Cause:** the observer returned a historical constant without hashing the executing file, allowing changed bytes on legacy-only runs. **Fix:** hash the live executable on every observer call; require live SHA-256 == DL-412 `validator_after_sha256` and DL-412 `validator_before_sha256` == DL-077 `validator_after_sha256`. Only when both links match, present the frozen DL-077 after-hash to its original predicate. On a broken/missing/unreadable/non-object byte-chain input, present the live hash. The original predicate then emits its original error and null returned receipt pin. Its full AST is unchanged from the reviewed head; all other original functions are unchanged. Full DL-412 semantic/authority/identity/prior-byte/lander checks remain separate for step records. No unrelated receipt field is consulted by the bridge.

**Jared's FIX5 clarification:** use the exact guard and report integrity rejections separately. Missing or altered DL-412 input, a broken before/after hash or changed executable must fail closed as the intended effect of the **single new input pin**. Every intact-byte-chain parity pair, the 125-call trace and all twelve C4 controls must remain exact. The new byte-pin failures are not an additional legacy behavior change. The change record, spec and receipt now state that boundary.

### Full differential and the twelve C4 controls

All **17,480** pairs were rerun, including **125/125 exact** admission/holding calls and **12/12 exact** C4 controls, also equal to cycle 5's recorded original values. **17,457 pairs are exact; 23 are the intended new-pin integrity rejections below; unexpected differences: 0.** All intact-byte-chain legacy pairs are exact. Issue text, list order, admitted sets, stdout, exit status and old returned pins are compared. Only temporary roots, CLI generation time and the one added `multi_family_step_receipt_sha256` field are normalized/omitted; coexistence projections select the no-field results while step behavior is separately checked. Both original 34-method traces retain the same two pre-existing failures and no errors. The twelve controls are a subset of the 125.

| Comparison group | Paired calls | Exact | Intended integrity rejections |
|---|---:|---:|---:|
| `astra2_existing_records_helper` | 1,732 | 1,732 | 0 |
| `astra2_existing_records_admission` | 1,732 | 1,732 | 0 |
| `astra2_existing_records_with_steps` | 1,732 | 1,732 | 0 |
| `raw_existing_records_with_and_without_steps` | 472 | 472 | 0 |
| `original_125_paired_admission_holding_calls` | 125 | 125 | 0 |
| `legacy_only_full_cli_pairs` | 108 | 85 | 23 |
| `sol_original_legacy_mutations` | 112 | 112 | 0 |
| `sol_extended_existing_records` | 5,880 | 5,880 | 0 |
| `astra_original_existing_records` | 3,936 | 3,936 | 0 |
| `astra_original_fixture_helpers` | 283 | 283 | 0 |
| `cycle3_raw_legacy` | 1,112 | 1,112 | 0 |
| `numeric_legacy_with_steps` | 256 | 256 | 0 |
| **Total** | **17,480** | **17,457** | **23** |

### Each intended receipt-fault rejection

The 108 paired CLI cases execute 216 real validators. Exactly these **23** controls now reject. Each changes only the named new receipt input or byte-link value; all records, old receipts, authority and executable bytes otherwise remain at the valid baseline. For every row, the complete new output equals the actual original DL-077 validator's equivalent altered-executable output, after the same allowed normalization. Both old admission and holding error messages, the empty admitted set and the null DL-077 pin match. No other receipt-fault control changes a legacy result: the remaining 85 CLI pairs are exact, including unrelated authority/identity/lander/prior-byte faults, notes-only and repinned old notes.

| Receipt-fault control | Only cause | Exact admission message | Exact holding message |
|---|---|---|---|
| `new-receipt-missing` | DL-412 byte-chain input missing/unreadable/non-object | `post-August amendment receipt invalid: post-August amendment receipt identity, authority or hash mismatch` | `holding authority/receipt invalid: post-August amendment receipt identity, authority or hash mismatch` |
| `new-receipt-unreadable` | DL-412 byte-chain input missing/unreadable/non-object | `post-August amendment receipt invalid: post-August amendment receipt identity, authority or hash mismatch` | `holding authority/receipt invalid: post-August amendment receipt identity, authority or hash mismatch` |
| `new:validator_before_sha256:None` | DL-412 validator_before_sha256 fails its byte-link equality | `post-August amendment receipt invalid: post-August amendment receipt identity, authority or hash mismatch` | `holding authority/receipt invalid: post-August amendment receipt identity, authority or hash mismatch` |
| `new:validator_before_sha256:False` | DL-412 validator_before_sha256 fails its byte-link equality | `post-August amendment receipt invalid: post-August amendment receipt identity, authority or hash mismatch` | `holding authority/receipt invalid: post-August amendment receipt identity, authority or hash mismatch` |
| `new:validator_before_sha256:{}` | DL-412 validator_before_sha256 fails its byte-link equality | `post-August amendment receipt invalid: post-August amendment receipt identity, authority or hash mismatch` | `holding authority/receipt invalid: post-August amendment receipt identity, authority or hash mismatch` |
| `new:validator_before_sha256:[]` | DL-412 validator_before_sha256 fails its byte-link equality | `post-August amendment receipt invalid: post-August amendment receipt identity, authority or hash mismatch` | `holding authority/receipt invalid: post-August amendment receipt identity, authority or hash mismatch` |
| `new:validator_before_sha256:0` | DL-412 validator_before_sha256 fails its byte-link equality | `post-August amendment receipt invalid: post-August amendment receipt identity, authority or hash mismatch` | `holding authority/receipt invalid: post-August amendment receipt identity, authority or hash mismatch` |
| `new:validator_before_sha256:'wrong'` | DL-412 validator_before_sha256 fails its byte-link equality | `post-August amendment receipt invalid: post-August amendment receipt identity, authority or hash mismatch` | `holding authority/receipt invalid: post-August amendment receipt identity, authority or hash mismatch` |
| `new:validator_after_sha256:None` | DL-412 validator_after_sha256 fails its byte-link equality | `post-August amendment receipt invalid: post-August amendment receipt identity, authority or hash mismatch` | `holding authority/receipt invalid: post-August amendment receipt identity, authority or hash mismatch` |
| `new:validator_after_sha256:False` | DL-412 validator_after_sha256 fails its byte-link equality | `post-August amendment receipt invalid: post-August amendment receipt identity, authority or hash mismatch` | `holding authority/receipt invalid: post-August amendment receipt identity, authority or hash mismatch` |
| `new:validator_after_sha256:{}` | DL-412 validator_after_sha256 fails its byte-link equality | `post-August amendment receipt invalid: post-August amendment receipt identity, authority or hash mismatch` | `holding authority/receipt invalid: post-August amendment receipt identity, authority or hash mismatch` |
| `new:validator_after_sha256:[]` | DL-412 validator_after_sha256 fails its byte-link equality | `post-August amendment receipt invalid: post-August amendment receipt identity, authority or hash mismatch` | `holding authority/receipt invalid: post-August amendment receipt identity, authority or hash mismatch` |
| `new:validator_after_sha256:0` | DL-412 validator_after_sha256 fails its byte-link equality | `post-August amendment receipt invalid: post-August amendment receipt identity, authority or hash mismatch` | `holding authority/receipt invalid: post-August amendment receipt identity, authority or hash mismatch` |
| `new:validator_after_sha256:'wrong'` | DL-412 validator_after_sha256 fails its byte-link equality | `post-August amendment receipt invalid: post-August amendment receipt identity, authority or hash mismatch` | `holding authority/receipt invalid: post-August amendment receipt identity, authority or hash mismatch` |
| `new-root:b'null'` | DL-412 byte-chain input missing/unreadable/non-object | `post-August amendment receipt invalid: post-August amendment receipt identity, authority or hash mismatch` | `holding authority/receipt invalid: post-August amendment receipt identity, authority or hash mismatch` |
| `new-root:b'false'` | DL-412 byte-chain input missing/unreadable/non-object | `post-August amendment receipt invalid: post-August amendment receipt identity, authority or hash mismatch` | `holding authority/receipt invalid: post-August amendment receipt identity, authority or hash mismatch` |
| `new-root:b'true'` | DL-412 byte-chain input missing/unreadable/non-object | `post-August amendment receipt invalid: post-August amendment receipt identity, authority or hash mismatch` | `holding authority/receipt invalid: post-August amendment receipt identity, authority or hash mismatch` |
| `new-root:b'0'` | DL-412 byte-chain input missing/unreadable/non-object | `post-August amendment receipt invalid: post-August amendment receipt identity, authority or hash mismatch` | `holding authority/receipt invalid: post-August amendment receipt identity, authority or hash mismatch` |
| `new-root:b'1.0'` | DL-412 byte-chain input missing/unreadable/non-object | `post-August amendment receipt invalid: post-August amendment receipt identity, authority or hash mismatch` | `holding authority/receipt invalid: post-August amendment receipt identity, authority or hash mismatch` |
| `new-root:b'1e0'` | DL-412 byte-chain input missing/unreadable/non-object | `post-August amendment receipt invalid: post-August amendment receipt identity, authority or hash mismatch` | `holding authority/receipt invalid: post-August amendment receipt identity, authority or hash mismatch` |
| `new-root:b'"false"'` | DL-412 byte-chain input missing/unreadable/non-object | `post-August amendment receipt invalid: post-August amendment receipt identity, authority or hash mismatch` | `holding authority/receipt invalid: post-August amendment receipt identity, authority or hash mismatch` |
| `new-root:b'[]'` | DL-412 byte-chain input missing/unreadable/non-object | `post-August amendment receipt invalid: post-August amendment receipt identity, authority or hash mismatch` | `holding authority/receipt invalid: post-August amendment receipt identity, authority or hash mismatch` |
| `new-root:b'{"nested":[[[[[[[[[[[[[[[[[[[['` | DL-412 byte-chain input missing/unreadable/non-object | `post-August amendment receipt invalid: post-August amendment receipt identity, authority or hash mismatch` | `holding authority/receipt invalid: post-August amendment receipt identity, authority or hash mismatch` |

### Executable-byte controls, tests and earlier-review probes

The original byte-only comment and appended-CRLF controls were retained through the **actual CLI**, plus a one-byte shebang-comment change and additional appended bytes. Each begins with a fully valid DL-412 receipt; no receipt or admission-record pin is refreshed after changing the executable. The old and new validators each run baseline plus all four controls (10 actual CLIs): baseline admits coordination and validates holding; every byte mutation admits no post-August family, fails holding and returns a null DL-077 receipt pin, with the exact messages above and identical failures. The original receipt probe's actual-executable assertion is restored on `post_august_receipt_state()` and passes. A forged new before/after pin is tested independently with otherwise valid bytes; missing, unreadable, scalar/container and wrong-type inputs also reject. Restore/re-mutate controls prove the observer is live rather than cached. Tests additionally show unrelated new semantic faults preserve legacy judgments.

| Verification | Exit / result |
|---|---|
| Final external fixture patch / full test file | Dry-run and apply exit 0; full file equals supplied file. **79 methods pass**, exit 0, including five new C5 methods. The test file remains external because DL-413's allowance is not on this branch. |
| Isolated live byte-pin type/representation sweep | Exit 0; **24** single-field controls cover missing, uppercase, whitespace/LF, string booleans/numbers, exact booleans/numbers, null, arrays and nested objects; every restore reproduces its valid legacy baseline exactly. |
| New C5 test sensitivity against reviewed constant validator | Exit 1; **31 failure entries** across the five-method run. The unrelated-semantic control still passes. Scratch receipt current pin alone is refreshed for this sensitivity run. |
| Original Sol scenarios, adversarial, legacy, sensitivity, writer and numeric CLIs | Rerun, recorder exits 0. All 26 original claimant negatives reject every member; X1/X2, S1–S7/C1–C5 and writer byte equality checked. S5 now has the intended missing-input rejection. C4 accepts exactly the three complete synthetic members; C5 rejects them when one is 11/12. |
| Sol extended sweep | **5,880** legacy comparisons exact; **880 + 296 = 1,176** malformed/foreign claimants reject every member. Original exit 1 retained solely for five superseded pair-only positive expectations (different/reversed/missing endpoint); no legacy difference or negative escape. |
| Original receipt probe / final classified probe | The original actual-byte assertion passes. Original aggregate exits 1 because it wrongly requires every unrelated semantic fault to break DL-077. The final probe changes only that aggregate expectation: the ten before/after-field faults reject DL-077, the other 64 do not; all 74 reject the full new predicate, and all four additional byte/prior checks pass; writer byte equality holds. Final exit 0. |
| Astra original, Astra-2, cycle-3, cycle-4 and cycle-5 probes | Replayed. Original numeric matrices, all ten parser scenarios, true 43→46 positive plus 111 negatives, 122 representation scenarios, 1,112 raw and 256 coexistence pairs, 58-case own recorder, nine float CLIs, notes/repinned-notes CLIs and 17 cycle-5 numeric CLIs complete. Ordinary and negative-zero metadata controls keep the valid step; malformed numeric SHA/foreign claims reject every member. |
| Check 11 | **46 variants × 99 negatives = 4,554 cells**; every expected flip matches, every other negative retains its own exact baseline rejection reason. Every baseline negative is corroborated through main. Named duplicate guards are paired as below. |
| Shards | Exit 0: **99 sources / 3,092 shards**, pass. |
| PlanUnit index | Exit 1, top-level **fail**: 21 pre-existing ledger-shape errors and missing DL-302 relative to newly fetched origin/main (22 total). Every named file, the index JSONL and checker are byte-identical to the reviewed head; 7,421 PlanUnits / 29,932 acceptance units remain. These unrelated findings are reported, not repaired. All 15 ignored currentness files match the share. |
| Scope / line endings | Five fix-round paths only; only `post_august_validator_pin` changes AST from the reviewed head. All **2,001** validator lines retain CRLF; whitespace check passes. Protected files, all old receipts/records, registry, generated shards/index and governance artifacts are unchanged. |

No owner `Plans/*.md` source changed, so no derived regeneration or governance refresh applies. No run-gates, governance audit, migration snapshot or landing check is claimed. Full-repository index findings do not become a family grade. The unpatched 34-method suite without the new byte input still fails closed; the same-landing patch supplies it. Synthetic PASS rows are fixtures only.

### Check 11: whole lane, including live executable integrity

Every case starts valid and changes one semantic defect. Observing assessment/receipt/record pins are refreshed except in the deliberate live-byte negatives, where unchanged receipt bytes are the premise. The historical DL-077 after-pin negative refreshes the new receipt's observing before-pin and old record pins, so it is not masked by a second byte-link defect. Each new executable negative uses its own scratch module file; production bytes are untouched. Removing the whole byte bridge also removes its fail-closed parser/object-access observations together.

**Named duplicate pairs:** `receipt-validator_before_sha256` and `bridge-before-hash` each remove both the bridge before-link and its full step-receipt duplicate. `receipt-validator_after_sha256` and `bridge-live-hash` each remove the live-byte equality and its full step-receipt duplicate. `bridge-all-links` removes the byte bridge plus both step byte-link duplicates. Existing root/state/canonical duplicates remain paired as in earlier rounds. The separate `step-receipt-application` variant still leaves byte-link faults rejected by the byte bridge, while its 18 unrelated authority/receipt negatives flip. The machine matrix lists every retained negative and its baseline-reason intersection; the final column below denotes the complement of each listed flip set.

| Guard weakened in scratch | Negatives that start to pass | Other negatives retaining their own baseline rejection |
|---|---|---:|
| `foreign` | `canonical-boolean`, `canonical-nested`, `canonical-number`, `canonical-unicode`, `canonical-uppercase`, `canonical-whitespace`, `deep-uninspectable-claim`, `duplicate-foreign`, `duplicate-member`, `foreign-Known37`, `foreign-malformed`, `foreign-newline`, `foreign-numeric-claimant`, `foreign-numeric-rejected`, `foreign-ordinary`, `foreign-rejected`, `foreign-upper`, `mention-exact-number-.0`, `mention-exact-number-.0e-0`, `mention-exact-number-.5`, `mention-exact-number-E+0`, `mention-exact-number-e0`, `mention-exact-number-e9999`, `mention-key-registry_after`, `mention-key-registry_before`, `mention-nested-registry_after`, `mention-nested-registry_before`, `mention-numeric-registry_after`, `mention-numeric-registry_before`, `mention-quoted-number-.0`, `mention-quoted-number-.0e-0`, `mention-quoted-number-.5`, `mention-quoted-number-E+0`, `mention-quoted-number-e0`, `mention-quoted-number-e9999`, `mention-space-registry_after`, `mention-space-registry_before`, `mention-unicode-registry_after`, `mention-unicode-registry_before`, `mention-upper-registry_after`, `mention-upper-registry_before`, `mention-value-registry_after`, `mention-value-registry_before`, `nested-noncanonical-side`, `non-json-constant`, `non-json-file`, `outer-array`, `unreadable-json`, `unreadable-utf8` | 50 of 99 |
| `missing` | `missing-member` | 98 of 99 |
| `states` | `same-states-counts`, `same-states-registry_after-revision`, `same-states-registry_after-sha256`, `same-states-registry_before-revision`, `same-states-registry_before-sha256` | 94 of 99 |
| `same-description` | `same-list-and-states`, `same-states-counts`, `same-states-registry_after-revision`, `same-states-registry_after-sha256`, `same-states-registry_before-revision`, `same-states-registry_before-sha256` | 93 of 99 |
| `count` | `count-padded`, `count-short` | 97 of 99 |
| `different-hashes` | `equal-hashes` | 98 of 99 |
| `sorted-unique` | `shape-duplicate`, `shape-unsorted` | 97 of 99 |
| `all-or-none` | `member-incomplete` | 98 of 99 |
| `step-pin` | `step-receipt-pin` | 98 of 99 |
| `decision-DL412` | `decision-DL412` | 98 of 99 |
| `receipt-schema_id` | `receipt-schema_id` | 98 of 99 |
| `receipt-authority_ref` | `receipt-authority_ref` | 98 of 99 |
| `receipt-authority_section_sha256` | `receipt-authority_section_sha256` | 98 of 99 |
| `receipt-validator_before_sha256` | `legacy-byte-before`, `receipt-validator_before_sha256` | 97 of 99 |
| `receipt-validator_after_sha256` | `legacy-byte-after`, `live-byte-appended-bytes`, `live-byte-comment`, `live-byte-crlf`, `live-byte-one-byte`, `receipt-validator_after_sha256` | 93 of 99 |
| `receipt-record_dir` | `receipt-record_dir` | 98 of 99 |
| `receipt-record_schema_id` | `receipt-record_schema_id` | 98 of 99 |
| `receipt-author_task` | `receipt-author_task` | 98 of 99 |
| `receipt-seal_authorized` | `receipt-seal_authorized` | 98 of 99 |
| `receipt-admission_authorized` | `receipt-admission_authorized` | 98 of 99 |
| `receipt-contract_depth_complete` | `receipt-contract_depth_complete` | 98 of 99 |
| `receipt-prior-path` | `receipt-prior-path` | 98 of 99 |
| `receipt-prior-sha256` | `receipt-prior-sha256` | 98 of 99 |
| `receipt-lander-and-list` | `receipt-forbidden`, `receipt-lander-''`, `receipt-lander-None` | 96 of 99 |
| `authority-tokens` | `authority-token-0`, `authority-token-1`, `authority-token-2`, `authority-token-3` | 95 of 99 |
| `duplicates` | `duplicate-foreign`, `duplicate-member` | 97 of 99 |
| `constants` | `non-json-constant` | 98 of 99 |
| `root-shape` | `canonical-boolean`, `canonical-nested`, `canonical-number`, `canonical-unicode`, `canonical-uppercase`, `canonical-whitespace`, `outer-array` | 92 of 99 |
| `canonical-scan` | `canonical-boolean`, `canonical-nested`, `canonical-number`, `canonical-unicode`, `canonical-uppercase`, `canonical-whitespace` | 93 of 99 |
| `uncertainty` | `canonical-boolean`, `canonical-nested`, `canonical-number`, `canonical-unicode`, `canonical-uppercase`, `canonical-whitespace`, `duplicate-foreign`, `duplicate-member`, `foreign-malformed`, `foreign-newline`, `foreign-numeric-claimant`, `foreign-numeric-rejected`, `foreign-upper`, `nested-noncanonical-side`, `non-json-constant`, `outer-array`, `unreadable-json`, `unreadable-utf8` | 81 of 99 |
| `recursive-claims` | `deep-uninspectable-claim`, `foreign-Known37`, `foreign-ordinary`, `foreign-rejected`, `mention-exact-number-.0`, `mention-exact-number-.0e-0`, `mention-exact-number-.5`, `mention-exact-number-E+0`, `mention-exact-number-e0`, `mention-exact-number-e9999`, `mention-key-registry_after`, `mention-key-registry_before`, `mention-nested-registry_after`, `mention-nested-registry_before`, `mention-numeric-registry_after`, `mention-numeric-registry_before`, `mention-quoted-number-.0`, `mention-quoted-number-.0e-0`, `mention-quoted-number-.5`, `mention-quoted-number-E+0`, `mention-quoted-number-e0`, `mention-quoted-number-e9999`, `mention-space-registry_after`, `mention-space-registry_before`, `mention-unicode-registry_after`, `mention-unicode-registry_before`, `mention-upper-registry_after`, `mention-upper-registry_before`, `mention-value-registry_after`, `mention-value-registry_before`, `non-json-file` | 68 of 99 |
| `all-files` | `non-json-file` | 98 of 99 |
| `canonical-members-paired` | `canonical-member`, `canonical-number` | 97 of 99 |
| `claim-object-keys` | `mention-key-registry_after`, `mention-key-registry_before` | 97 of 99 |
| `claim-list-values` | `deep-uninspectable-claim`, `mention-nested-registry_after`, `mention-nested-registry_before` | 96 of 99 |
| `claim-case` | `mention-upper-registry_after`, `mention-upper-registry_before` | 97 of 99 |
| `claim-whitespace` | `mention-space-registry_after`, `mention-space-registry_before` | 97 of 99 |
| `claim-unicode-decimal` | `mention-unicode-registry_after`, `mention-unicode-registry_before` | 97 of 99 |
| `deep-claim` | `deep-uninspectable-claim` | 98 of 99 |
| `nested-canonical` | `nested-noncanonical-side` | 98 of 99 |
| `exact-number-tokens` | `mention-exact-number-.0`, `mention-exact-number-.0e-0`, `mention-exact-number-.5`, `mention-exact-number-E+0`, `mention-exact-number-e0`, `mention-exact-number-e9999` | 93 of 99 |
| `step-receipt-application` | `authority-token-0`, `authority-token-1`, `authority-token-2`, `authority-token-3`, `receipt-admission_authorized`, `receipt-author_task`, `receipt-authority_ref`, `receipt-authority_section_sha256`, `receipt-contract_depth_complete`, `receipt-forbidden`, `receipt-lander-''`, `receipt-lander-None`, `receipt-prior-path`, `receipt-prior-sha256`, `receipt-record_dir`, `receipt-record_schema_id`, `receipt-schema_id`, `receipt-seal_authorized` | 81 of 99 |
| `legacy-frozen-validator-pin` | `legacy-frozen-validator-pin` | 98 of 99 |
| `bridge-live-hash` | `legacy-byte-after`, `live-byte-appended-bytes`, `live-byte-comment`, `live-byte-crlf`, `live-byte-one-byte`, `receipt-validator_after_sha256` | 93 of 99 |
| `bridge-before-hash` | `legacy-byte-before`, `receipt-validator_before_sha256` | 97 of 99 |
| `bridge-all-links` | `legacy-byte-after`, `legacy-byte-before`, `legacy-byte-receipt-array`, `legacy-byte-receipt-boolean`, `legacy-byte-receipt-missing`, `legacy-byte-receipt-null`, `legacy-byte-receipt-number`, `legacy-byte-receipt-string`, `legacy-byte-receipt-unreadable`, `live-byte-appended-bytes`, `live-byte-comment`, `live-byte-crlf`, `live-byte-one-byte`, `receipt-validator_after_sha256`, `receipt-validator_before_sha256` | 84 of 99 |

### Astra recurring-defect sweep and standing checks

| Item | Current evidence |
|---|---|
| 1. Forged/contradictory identities or hashes | Own validator bytes are recomputed live; missing/forged before/after pins and byte changes reject with the old predicate. Complete member/state/count, row/assessment/decision and new receipt mutations remain covered by the full lane matrix and replays. Historical registry truth remains the unchanged history-review obligation. |
| 2. Storage metadata | N/A: no runtime Storage metadata or payload contract changes. |
| 3. Historical/live-state crossover | All intact-byte-chain no-field pairs are exact; only the explicitly authorized input-pin faults reject, and each equals the original altered-bytes result. |
| 4. Multiple field interpretations | Exact SHA equality against a live hash rejects wrong types, containers, casing/whitespace and altered strings; the earlier strict members/recursive numeric claim rules are unchanged and rerun. |
| 5. Unresolved schema references | No schema or `$ref` is added or changed. |
| 6. Partial size limits | N/A: no stored event body or size policy changes. |
| 7. Custody on every path | Legacy admission and holding both reach the live two-link observer. Steps additionally require the unchanged full semantic receipt predicate. Main, module and actual CLI paths are covered. |
| 8. Masked negatives | Complete 4,554-cell matrix; named byte-link duplicates removed together; all other rejection reasons retained. |
| 9. Unsupported grades | N/A → N/A. No family, seal or runtime behavior is graded. |
| 10. Alternate numeric forms | Original integer/decimal/exponent/negative-zero/overflow/quoted-member and foreign-claim probes rerun; numeric SHA fields remain noncanonical for steps. New byte-pin numeric values fail equality without coercion. |
| 11. Confused types | Nulls, boolean/string booleans, numbers/string numbers, arrays, objects and malformed/deep receipt roots covered. New semantic fields are never interpreted by the byte bridge. |

Standing checks 1–4, 6–7 and 10 concern runtime family contracts outside this task. Check 5 retains full-match/trailing-LF negatives; check 8 asserts real admitted sets, fresh CLI outputs, failure messages and old pins rather than relying on exit 1; check 9 adds no references; check 11 is proved for the whole lane above.

### Pins, evidence and handoff

Validator SHA-256: `0cb2bd07a500d4314c678c0ee0cd1eae267accfb5a02e3f686f5210f92dd80d6`. Pending new receipt SHA-256: `ee9ce3a023d9cc35111e5cd209ea511f2f572307fff876524c6c6e584f66ed9a`. Fixture patch SHA-256: `a3de006aff67f53067a0a63ea00d5b4b08cedc743a755a4130f303cb86d5ec81`. Only the new receipt's `validator_after_sha256` pin is refreshed; every other pin, authority/source/card reference, identity, null lander, checked author-only pending list and false flag is preserved. Descriptive receipt/spec text is aligned. CA-SEAL-FIX5 is explicitly procedurally excluded in **both** documents and the receipt note; the checked author/lander predicate is unchanged.

Evidence: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-SEAL/fix5/`. Summary `results/fix5-summary.json`, SHA-256 `cca4d108363e554afa78a4d0e0ae159b22321a6e843444bed9e087e5798d79ae`; full guard matrix `results/guard-matrix.json`, SHA-256 `7a608297446ef60ef031ec0b49b6e041f9cf6314c67815accec5b7818f3bfbc3`; integrity controls `results/integrity-rejections.json`, SHA-256 `fd40d98bdac9cc061339872a6ba4a042cdfa94ba3abd8c07db0fd3c843f7d8d2`. Replay sources, exact traces, full CLI receipts, original nonzero/superseded expectations and final logs are retained with a manifest. One guard preparation run was stopped to pair the newly duplicated byte guards before the final full run; its partial output is not a verification count. Initial new-test setup assertions were corrected before the successful 79-method run; production code did not change. Raw scratch trees and the requested worktree are removed after the result is pushed and evidence copied.

**Family grades before → after:** N/A → N/A; no self-grade JSON applies. **Ids used:** none minted; DL-412 is cited authority and DL-998/DL-999 remain fixture-only. **New bindings:** none. **Open integration work:** DL-412/DL-413 dependencies, actual lander and matching receipt list, the fixture patch as its own commit in the same landing, ordered Sol/Astra pre/post reviews and landing checks. No admission, registry append, seal, main push, pm-mail or subagent occurred.

## Review round 6: findings and responses (CA-SEAL-FIX6)

**C6-01 — STOPPED FOR THE LEAD / NOT_READY.** No finding is disputed or fixed in this round. The complete investigation and stop question are in `seal-check-multifamily-step-amendment.md`, round 6, and copied to `drafts/CA-SEAL/fix6/STOP-QUESTION.md`. This documentation commit changes only these two reports and explicitly excludes CA-SEAL-FIX6 from applying the seal.

**Where:** validator `Plans/.audits/event-authority-2026-08-12/independent-validator/pm_event_authority_independent_validator.py:249`. **Cause:** both bridge hash operands come from an editable, unauthenticated DL-412 receipt; even its complete semantic predicate accepts a matching altered-executable after-hash. **Required fix:** independently authenticate the complete receipt before presenting DL-077's historical after-hash, while preserving the approved old predicate and compatibility controls. There is no independent protected anchor to reuse today.

### Anchor investigation before code changes

- **Existing receipt pin:** all four admission records under `reports/event-authority-20260911/admission-records/` pin the unchanged DL-077 receipt at line 5; branch validator `:406` checks that byte hash. This is cross-file consistency while the records remain fixed.
- **Executable pin:** DL-077 receipt `reports/event-authority-20260911/step-10-post-august-admission-receipt.json:24` pins the old executable; main validator `:165` compares it to live bytes. Holding reaches Step 3's older after-pin through DL-077. No independent receipt authentication occurs.
- **Protected files:** the entire 101-entry `Plans/Spec_Lock.json:3` list and all 737 rows of `Plans/.audits/_semantic_closure_registry.jsonl` contain none of the relevant paths/hashes. Branch and fetched main `fb441b27fd75440e14115fb382b15a5258ad7ea3` are byte-identical for both. Whole tracked `.evidence` and script searches also find no such anchor. The August freeze/output receipt contains no validator/amendment byte pin.
- **Same-commit isolation:** four fresh old-validator CLIs show that altered executable bytes plus changing only DL-077's after-hash restore holding validity. Unchanged record pins still block admission. There is no hidden protected anchor preventing this holding forgery.

The change record gives every source path:line, complete negative-search evidence, the exact proposed common Spec Lock entries for the reviewed bytes and the required final-receipt rehash. Those entries are proposals only; no protected file is edited or resealed.

### Stop question and effect on main

**For the lead:** Can a separately authorized common receipt anchor be arranged at the same landing boundary, with no unanchored main interval, and can the compatibility boundary be resolved for intact-byte DL-412 semantic faults? The requested full-receipt eligibility rule rejects cases the exact C4 controls preserve, including stale prior-receipt bytes after notes-only edits. Merely evaluating the full predicate elsewhere does not remove that conflict.

Requiring a missing protected anchor would make otherwise intact legacy admission empty, holding invalid and the DL-077 returned pin null from landing until reseal. That changes intact-chain behavior and is outside the approved boundary. Accepting a missing anchor would retain C6-01. With no existing common anchor, choosing another authority or relaxing the preserved controls requires the lead's ruling. This stop follows the user's explicit conditional stop instruction.

### Fresh checks and their limits

| Check | Round-6 result |
|---|---|
| Complete branch/main anchor inventory | Read-only, successful; no independent common anchor. |
| Cycle-6 forged-receipt recorder | Fourteen fresh actual CLIs, all expected unfinished-seal exit 1. Three combined attacks still restore legacy admission and holding; the full-receipt forgery also restores the new pin. Original receipt/record bytes asserted unchanged. |
| DL-077 trust-model isolation | Four additional actual CLIs; baseline/change/after-repin/restore prove the limited old-chain protection described above. |
| Original differential and C4 controls | **Not rerun after the stop.** Historical independently reviewed result only: 17,480 pairs / 17,457 exact / 23 intended rejections / zero unexpected differences; 125/125 and 12/12 exact. That corpus omits C6-01 and is not a FIX6 pass. |
| Check 11 and earlier-review probes | No guards or executable bytes change; no new matrix or full probe replay claimed. C6-01 remains blocking. |
| Scope and text | Exactly two report paths; both exclusions name CA-SEAL-FIX6. Validator/spec/receipt and every protected artifact remain unchanged. Whitespace and explicit scope checks run before the documentation commit. |

The current check detects unrepinned byte changes and inconsistent links, but not an altered executable with a matching forged DL-412 receipt. A protected receipt hash would authenticate every receipt field and its validator pin only while the enforcing code and anchor remain trusted. An actor able to rewrite the validator, the receipt, DL-412's text and the anchor together is outside any in-repo check; deleting the enforcement from the executing program likewise requires code/history review.

**Unchanged validator SHA-256:** `0cb2bd07a500d4314c678c0ee0cd1eae267accfb5a02e3f686f5210f92dd80d6`. **Unchanged new receipt SHA-256:** `ee9ce3a023d9cc35111e5cd209ea511f2f572307fff876524c6c6e584f66ed9a`. No new validator SHA-256 exists. No spec/receipt description is updated to claim an unimplemented repair; the current NOT_READY status supersedes FIX5's broader authentication claims.

Evidence: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-SEAL/fix6/`. Anchor inventory SHA-256 `5bb76c4f051379f720571cfc53828bb910c0cdf00418a0ff90c2f81239e2cb01`; forged recorder result `6275381bf0dbb25480a06cc4d774d6335fd7820ada02d3abc07179d501684232`; old-anchor isolation result `e8ebbee3c8a11172b74a3349bc2b08ee321340f288abc94023014705e5209f35`; exact proposed reviewed-head anchor entries `0d0fa20c4a7e24be3ac0da316712026717c5d2eb8c78d07b80988468f1466678`. Scripts, fresh CLI outputs, stop question and report copies are retained with `SHA256SUMS`.

**Family grades before → after:** N/A → N/A; no self-grade JSON applies. **Ids used:** none minted; DL-412 is existing authority. **Bindings:** none. **Open:** C6-01, common-anchor/compatibility ruling and all previous landing prerequisites. No admission, seal, main push, protected edit, pm-mail or subagent occurred. Scratch and `/home/sittingmongoose/pm-worktrees/ca-seal-fix6` are removed after the documentation-only result is pushed and copied.

## Review round 7: findings and responses (CA-SEAL-FIX7)

**C6-01 — fixed in `5c44eaf593704fce8bf6a213b8e64ddbb32297eb`.** No finding is disputed or stopped for Jared. This implements the DL-412-only anchor ruling (`pm7-build`, 2026-11-05, mail `1105012742-e2fc`), not FIX6's historical two-receipt proposal. The branch awaits independent review and its coordinated landing dependencies; this is no admission, seal or main landing.

**Where:** `post_august_validator_pin`, validator lines 238–264; the audit spec's DL-412 paragraph; this report and the change record's current landing contract. **Cause:** two editable hash fields let a fabricated new receipt bridge altered executable bytes to the historical DL-077 pin. **Fix:** require the complete new receipt bytes to match exactly one exact-path Spec Lock entry before either legacy caller can receive the trusted old hash. Live executable and before-link checks remain. All byte conditions are outside DL-077's unchanged predicate. Its semantics, ordering, error messages and returned receipt pin stay intact; the separate new receipt semantic observer is unchanged.

Only that bridge function changes AST from `4e3765ab003c9d2802b7b6a3277c6d1e444e3d55`. All 2,010 validator lines retain CRLF. Only `validator_after_sha256` changes in the new receipt; its other bytes and every old receipt/record pin stay fixed. The audit spec gains the exact anchor condition. The two reports document the ruling and evidence. No top-level owner source or generated artifact changes; no regeneration or governance refresh is performed. Scope audit checks 268 protected files byte-for-byte and the exact five-path fix allowlist. Spec Lock remains unedited.

### Differential on the anchored tree

**17,480 pairs: 17,457 exact; 23 intended integrity rejections; zero unexpected differences.** All 125 admission/holding calls and all twelve C4 controls are exact, including their previously recorded old returned values. Each original 34-method trace retains the same two inherited failures and no errors. The twelve controls are a subset of the 125.

The old side uses the frozen DL-077 validator (`190a86f2...`) and unchanged old receipts. The new side supplies the DL-412 receipt and its synthetic exact Spec Lock anchor. Named semantic mutations refresh their observing fixture anchor so they isolate semantics. The actual forgery and anchor-negative controls hold their trusted baseline anchor fixed. This fixture authority is explicit: none of these synthetic entries changes repository Spec Lock or authorizes a real receipt.

The comparison checks ordered diagnostics, returned old pins, admitted sets, CLI stdout and exits. Only temporary roots, CLI generation time and the single added `multi_family_step_receipt_sha256` output field are normalized/omitted. Coexistence comparisons select no-field judgments; separate positive/negative controls cover step admission.

| Group | Pairs | Exact | Intended rejections |
|---|---:|---:|---:|
| `astra2_existing_records_helper` | 1,732 | 1,732 | 0 |
| `astra2_existing_records_admission` | 1,732 | 1,732 | 0 |
| `astra2_existing_records_with_steps` | 1,732 | 1,732 | 0 |
| `raw_existing_records_with_and_without_steps` | 472 | 472 | 0 |
| `original_125_paired_admission_holding_calls` | 125 | 125 | 0 |
| `legacy_only_full_cli_pairs` | 108 | 85 | 23 |
| `sol_original_legacy_mutations` | 112 | 112 | 0 |
| `sol_extended_existing_records` | 5,880 | 5,880 | 0 |
| `astra_original_existing_records` | 3,936 | 3,936 | 0 |
| `astra_original_fixture_helpers` | 283 | 283 | 0 |
| `cycle3_raw_legacy` | 1,112 | 1,112 | 0 |
| `numeric_legacy_with_steps` | 256 | 256 | 0 |
| **Total** | **17,480** | **17,457** | **23** |

The 108 paired CLI cases execute 216 real validators. All 23 differences are individually retained in `integrity-rejections.json`: missing/unreadable receipt, six wrong values for each before/after link, eight scalar/container roots and the over-recursive root. Every complete new output equals the original validator's actual altered-executable rejection after the permitted normalization. Admission is empty, holding invalid and the old pin null. Exactly the original mismatch messages occur; no unrelated rejection is substituted. The other 85 pairs remain exact, including semantic-only faults under a matching fixture anchor and notes-only/repinned old receipt controls.

### C6 forged-receipt and anchor controls

The unchanged cycle-6 attack construction was rerun through fourteen actual CLIs, seven cases per validator. Each case asserts unchanged DL-077 receipt and all four existing record bytes. A trusted baseline new receipt is anchored once before the sequence; that anchor never changes during an attack. Baseline and restore admit coordination and validate holding. Comment-only and all three combined attacks now admit nothing, fail holding and return a null old pin with the exact old mismatch diagnostics.

| Altered executable control | Old validator | FIX7 anchored validator |
|---|---|---|
| Inert comment only | rejects | rejects |
| Comment + entire two-field forged receipt | rejects | rejects |
| Comment + full-shaped forged schema/authority/author/prior receipt | rejects | rejects |
| Comment + otherwise intact full receipt with its after-pin repinned | rejects | rejects |

The last attack may still obtain a non-null **new semantic pin** because its semantic fields and live after-link agree. That pin alone grants no legacy eligibility: the unchanged trusted anchor rejects its modified receipt bytes. The pristine-executable/two-field receipt also fails FIX7's unchanged baseline anchor. These supplemental controls are outside the 17,480 original pairs.

Twenty further actual CLI controls cover baseline/restore, missing file/entry, wrong hash, duplicate entry, entry pointing elsewhere, casing/LF/type faults, malformed and wrongly shaped lock inputs, a receipt byte edit, and three explicitly anchored unrelated semantic faults. All expected outcomes pass. Forty-one additional path/hash/root type and numeric controls reject; each same-module restore exactly reproduces its baseline. An unrelated Spec Lock entry alongside the single exact receipt entry is accepted.

The updated external fixture patch passes **82 methods**, exit 0, with no replay helper imported. Its three new FIX7 methods yield **13 failures** against the prior validator with its scratch after-pin refreshed, proving sensitivity. Patch dry-run/application and full-file equality pass. The patch is not committed to the currently unallowed test path; it remains its own required commit in the same landing, after DL-413's allowance.

### Check 11

**50 variants × 113 isolated negatives = 5,650 passing cells**, plus all baseline negatives corroborated through `main()`. Every variant has its exact expected flip set, and every other negative retains at least one exact baseline rejection reason. Receipt, assessment and synthetic Spec Lock observational copies are refreshed for semantic cases. Anchor-integrity cases deliberately preserve the trusted anchor; their only failing byte condition is that anchor observation.

Existing named duplicate pairs remain: bridge/full-step before-link and live-after-link comparisons, root/state object rules, and canonical-member checks. `anchor-required` removes the single anchor observation's lookup/shape/cardinality/hash-access defenses together for absence/malformed-source controls; removing cardinality alone would merely stop at the same absent entry's hash access. The narrower exact-path, uniqueness and receipt-byte hash variants independently prove those new guards. The broad `bridge-all-links` case removes the entire byte bridge and its named step-link duplicates. No production guard is left weakened.

| Guard weakened in scratch | Negatives that flip | All other negatives retain a baseline reason |
|---|---|---:|
| `foreign` | `canonical-boolean`, `canonical-nested`, `canonical-number`, `canonical-unicode`, `canonical-uppercase`, `canonical-whitespace`, `deep-uninspectable-claim`, `duplicate-foreign`, `duplicate-member`, `foreign-Known37`, `foreign-malformed`, `foreign-newline`, `foreign-numeric-claimant`, `foreign-numeric-rejected`, `foreign-ordinary`, `foreign-rejected`, `foreign-upper`, `mention-exact-number-.0`, `mention-exact-number-.0e-0`, `mention-exact-number-.5`, `mention-exact-number-E+0`, `mention-exact-number-e0`, `mention-exact-number-e9999`, `mention-key-registry_after`, `mention-key-registry_before`, `mention-nested-registry_after`, `mention-nested-registry_before`, `mention-numeric-registry_after`, `mention-numeric-registry_before`, `mention-quoted-number-.0`, `mention-quoted-number-.0e-0`, `mention-quoted-number-.5`, `mention-quoted-number-E+0`, `mention-quoted-number-e0`, `mention-quoted-number-e9999`, `mention-space-registry_after`, `mention-space-registry_before`, `mention-unicode-registry_after`, `mention-unicode-registry_before`, `mention-upper-registry_after`, `mention-upper-registry_before`, `mention-value-registry_after`, `mention-value-registry_before`, `nested-noncanonical-side`, `non-json-constant`, `non-json-file`, `outer-array`, `unreadable-json`, `unreadable-utf8` | 64 of 113 |
| `missing` | `missing-member` | 112 of 113 |
| `states` | `same-states-counts`, `same-states-registry_after-revision`, `same-states-registry_after-sha256`, `same-states-registry_before-revision`, `same-states-registry_before-sha256` | 108 of 113 |
| `same-description` | `same-list-and-states`, `same-states-counts`, `same-states-registry_after-revision`, `same-states-registry_after-sha256`, `same-states-registry_before-revision`, `same-states-registry_before-sha256` | 107 of 113 |
| `count` | `count-padded`, `count-short` | 111 of 113 |
| `different-hashes` | `equal-hashes` | 112 of 113 |
| `sorted-unique` | `shape-duplicate`, `shape-unsorted` | 111 of 113 |
| `all-or-none` | `member-incomplete` | 112 of 113 |
| `step-pin` | `step-receipt-pin` | 112 of 113 |
| `decision-DL412` | `decision-DL412` | 112 of 113 |
| `receipt-schema_id` | `receipt-schema_id` | 112 of 113 |
| `receipt-authority_ref` | `receipt-authority_ref` | 112 of 113 |
| `receipt-authority_section_sha256` | `receipt-authority_section_sha256` | 112 of 113 |
| `receipt-validator_before_sha256` | `legacy-byte-before`, `receipt-validator_before_sha256` | 111 of 113 |
| `receipt-validator_after_sha256` | `legacy-byte-after`, `live-byte-appended-bytes`, `live-byte-comment`, `live-byte-crlf`, `live-byte-one-byte`, `receipt-validator_after_sha256` | 107 of 113 |
| `receipt-record_dir` | `receipt-record_dir` | 112 of 113 |
| `receipt-record_schema_id` | `receipt-record_schema_id` | 112 of 113 |
| `receipt-author_task` | `receipt-author_task` | 112 of 113 |
| `receipt-seal_authorized` | `receipt-seal_authorized` | 112 of 113 |
| `receipt-admission_authorized` | `receipt-admission_authorized` | 112 of 113 |
| `receipt-contract_depth_complete` | `receipt-contract_depth_complete` | 112 of 113 |
| `receipt-prior-path` | `receipt-prior-path` | 112 of 113 |
| `receipt-prior-sha256` | `receipt-prior-sha256` | 112 of 113 |
| `receipt-lander-and-list` | `receipt-forbidden`, `receipt-lander-''`, `receipt-lander-None` | 110 of 113 |
| `authority-tokens` | `authority-token-0`, `authority-token-1`, `authority-token-2`, `authority-token-3` | 109 of 113 |
| `duplicates` | `duplicate-foreign`, `duplicate-member` | 111 of 113 |
| `constants` | `non-json-constant` | 112 of 113 |
| `root-shape` | `canonical-boolean`, `canonical-nested`, `canonical-number`, `canonical-unicode`, `canonical-uppercase`, `canonical-whitespace`, `outer-array` | 106 of 113 |
| `canonical-scan` | `canonical-boolean`, `canonical-nested`, `canonical-number`, `canonical-unicode`, `canonical-uppercase`, `canonical-whitespace` | 107 of 113 |
| `uncertainty` | `canonical-boolean`, `canonical-nested`, `canonical-number`, `canonical-unicode`, `canonical-uppercase`, `canonical-whitespace`, `duplicate-foreign`, `duplicate-member`, `foreign-malformed`, `foreign-newline`, `foreign-numeric-claimant`, `foreign-numeric-rejected`, `foreign-upper`, `nested-noncanonical-side`, `non-json-constant`, `outer-array`, `unreadable-json`, `unreadable-utf8` | 95 of 113 |
| `recursive-claims` | `deep-uninspectable-claim`, `foreign-Known37`, `foreign-ordinary`, `foreign-rejected`, `mention-exact-number-.0`, `mention-exact-number-.0e-0`, `mention-exact-number-.5`, `mention-exact-number-E+0`, `mention-exact-number-e0`, `mention-exact-number-e9999`, `mention-key-registry_after`, `mention-key-registry_before`, `mention-nested-registry_after`, `mention-nested-registry_before`, `mention-numeric-registry_after`, `mention-numeric-registry_before`, `mention-quoted-number-.0`, `mention-quoted-number-.0e-0`, `mention-quoted-number-.5`, `mention-quoted-number-E+0`, `mention-quoted-number-e0`, `mention-quoted-number-e9999`, `mention-space-registry_after`, `mention-space-registry_before`, `mention-unicode-registry_after`, `mention-unicode-registry_before`, `mention-upper-registry_after`, `mention-upper-registry_before`, `mention-value-registry_after`, `mention-value-registry_before`, `non-json-file` | 82 of 113 |
| `all-files` | `non-json-file` | 112 of 113 |
| `canonical-members-paired` | `canonical-member`, `canonical-number` | 111 of 113 |
| `claim-object-keys` | `mention-key-registry_after`, `mention-key-registry_before` | 111 of 113 |
| `claim-list-values` | `deep-uninspectable-claim`, `mention-nested-registry_after`, `mention-nested-registry_before` | 110 of 113 |
| `claim-case` | `mention-upper-registry_after`, `mention-upper-registry_before` | 111 of 113 |
| `claim-whitespace` | `mention-space-registry_after`, `mention-space-registry_before` | 111 of 113 |
| `claim-unicode-decimal` | `mention-unicode-registry_after`, `mention-unicode-registry_before` | 111 of 113 |
| `deep-claim` | `deep-uninspectable-claim` | 112 of 113 |
| `nested-canonical` | `nested-noncanonical-side` | 112 of 113 |
| `exact-number-tokens` | `mention-exact-number-.0`, `mention-exact-number-.0e-0`, `mention-exact-number-.5`, `mention-exact-number-E+0`, `mention-exact-number-e0`, `mention-exact-number-e9999` | 107 of 113 |
| `step-receipt-application` | `authority-token-0`, `authority-token-1`, `authority-token-2`, `authority-token-3`, `receipt-admission_authorized`, `receipt-author_task`, `receipt-authority_ref`, `receipt-authority_section_sha256`, `receipt-contract_depth_complete`, `receipt-forbidden`, `receipt-lander-''`, `receipt-lander-None`, `receipt-prior-path`, `receipt-prior-sha256`, `receipt-record_dir`, `receipt-record_schema_id`, `receipt-schema_id`, `receipt-seal_authorized` | 95 of 113 |
| `legacy-frozen-validator-pin` | `legacy-frozen-validator-pin` | 112 of 113 |
| `bridge-live-hash` | `legacy-byte-after`, `live-byte-appended-bytes`, `live-byte-comment`, `live-byte-crlf`, `live-byte-one-byte`, `receipt-validator_after_sha256` | 107 of 113 |
| `bridge-before-hash` | `legacy-byte-before`, `receipt-validator_before_sha256` | 111 of 113 |
| `bridge-all-links` | `anchor-duplicate`, `anchor-elsewhere`, `anchor-entry`, `anchor-files`, `anchor-forged-full`, `anchor-malformed`, `anchor-missing-entry`, `anchor-missing-file`, `anchor-repinned-full`, `anchor-root`, `anchor-ssot`, `anchor-stale-bytes`, `anchor-two-field`, `anchor-wrong-hash`, `legacy-byte-after`, `legacy-byte-before`, `legacy-byte-receipt-array`, `legacy-byte-receipt-boolean`, `legacy-byte-receipt-missing`, `legacy-byte-receipt-null`, `legacy-byte-receipt-number`, `legacy-byte-receipt-string`, `legacy-byte-receipt-unreadable`, `live-byte-appended-bytes`, `live-byte-comment`, `live-byte-crlf`, `live-byte-one-byte`, `receipt-validator_after_sha256`, `receipt-validator_before_sha256` | 84 of 113 |
| `anchor-exact-path` | `anchor-elsewhere` | 112 of 113 |
| `anchor-unique` | `anchor-duplicate` | 112 of 113 |
| `anchor-receipt-hash` | `anchor-forged-full`, `anchor-repinned-full`, `anchor-stale-bytes`, `anchor-two-field`, `anchor-wrong-hash` | 108 of 113 |
| `anchor-required` | `anchor-duplicate`, `anchor-elsewhere`, `anchor-entry`, `anchor-files`, `anchor-forged-full`, `anchor-malformed`, `anchor-missing-entry`, `anchor-missing-file`, `anchor-repinned-full`, `anchor-root`, `anchor-ssot`, `anchor-stale-bytes`, `anchor-two-field`, `anchor-wrong-hash` | 99 of 113 |

### Recurring-defect sweep and remaining checks

| Item | Current evidence / limit |
|---|---|
| 1. Forged/contradictory inputs | All cycle-6 combined attacks reject under the unchanged trusted anchor; original state/list/row/depth/decision mutations rerun. The checker still does not prove historical registry truth. |
| 2. Storage metadata | No runtime Storage-assigned fields are added or changed. |
| 3. Historical reader behavior | Anchored intact-chain differential, all 125 calls and all twelve C4 controls are exact. |
| 4. Multiple interpretations | Exact path/hash equality with no coercion; upper-case, whitespace/LF, numeric and container controls reject. Existing strict member and recursive claim interpretations rerun. |
| 5. Schema refs | No schema or `$ref` is added or changed. |
| 6. Size limits | No event payload, stored-body size or externalization policy changes. |
| 7. Custody paths | Both legacy admission and holding call the anchored live bridge. Actual CLI, module, baseline/restore and step controls cover these paths. |
| 8. Masked negatives | Full 5,650-cell matrix, named duplicate groups, observed-pin refreshes and retained baseline reasons. |
| 9. Grade evidence | N/A → N/A; no family, runtime implementation or seal is graded. |
| 10. Numeric forms | `.0`, `e0`, fractional, overflow, signed exponent and quoted foreign claims rerun; raw `1`, `1.0`, `1e0`, `-0` and invalid `01` lock roots reject. No numeric hash/path is coerced into a string. |
| 11. Types | Null, booleans, string booleans/numbers, numeric types, arrays, objects, malformed/nested lock shapes and missing/duplicated entries are covered. |

Standing runtime checks 1–4, 6–7 and 10 concern family contracts outside this narrow checker change. Check 5 retains full-match and trailing-LF refusals; check 8 asserts admitted sets/holding/errors/pins rather than accepting an unrelated seal exit 1; check 9 adds no refs; check 11 is proved above.

| Verification | Result |
|---|---|
| Original Sol replay | Scenarios, all 26 claimant negatives, writer/sensitivity/numeric and legacy probes complete. Extended 5,880 comparisons exact; 880 malformed + 296 foreign/rejected step claimants refuse the step. The five superseded pair-only positive expectations still yield their original nonzero aggregate result. |
| New receipt classification | All 74 full new-predicate negatives reject; ten byte-link faults reject the old predicate, 64 unrelated semantic faults under matching fixture anchors preserve it; four extra chain/current-byte checks and writer byte identity pass. The two historical aggregate coupling assertions remain intentionally nonzero. |
| Astra and representation replay | 112 step scenarios (one complete true step accepted, all 111 mutations reject), ten parser scenarios, 122 representation cases, 1,112 raw legacy comparisons and 256 numeric coexistence comparisons complete. Original numeric/notes/current-byte actual CLIs rerun. |
| Repository shards | Exit 0: 99 sources, 3,092 shards, no failures. |
| PlanUnit index validation | Exit 1, top-level `status: fail`, 23 failures: 21 inherited ledger-shape errors, main-only DL-302, and readiness staleness from the absent ignored currentness edition. Every named input equals the requested pre-fix head; none names a changed path. This is not reported as a pass. |
| Syntax/scope/line endings | Only the bridge changes AST; five fix-round paths; all 2,010 lines CRLF; only the new receipt's after-pin changes; 268 protected files byte-identical; whitespace check passes. |

Replay setup issues are retained openly: the first original trace lacked an anchor because its temporary roots were outside the synthetic fixture helper's scratch root; the corrected fresh trace is 125/125 exact. An in-process replay's automatic fixture anchoring interfered with four new tests that intentionally preserve a stale anchor; standalone 82-method execution passes, and the three affected methods pass in a separate isolated invocation. One raw replay initially stopped on a fixture copy-order collision; deferring synthetic anchoring until copy completion corrected the harness and the full 1,112 comparisons then completed. These were fixture preparation fixes; production validator bytes never changed after `5c44eaf593`. No partial run supplies a compatibility count.

No full run-gates, governance audit, migration/landing check or reseal is claimed. Initial resources were 83 GB free disk and 15 GB available RAM; later checks remained above the 50 GB/6 GB stop thresholds. No pm-mail, subagent, admission record, Decision Log entry, registry append, main push, protected-file change or governance refresh occurred. The scratch trees and requested sparse worktree are removed after the pushed handoff and evidence copy.

### Pins and evidence

Evidence root: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-SEAL/fix7`. The manifest pins replay sources, exact outputs, fixture patch/full file and check logs.

| Artifact | SHA-256 |
|---|---|
| `fix7-summary.json` | `20a297626a333c017820e7906011882c553d1740e13d3adbe726782def54226c` |
| `differential-summary.json` | `04953363e1415d694131d63a54b4bb19c245f2e5151d30f7ee781abb7457884d` |
| `twelve-controls.json` | `99bc7286cff8579964fecd0e5ff5b17f9dede01b2a8dca87e75d43b37d9a3822` |
| `integrity-rejections.json` | `19dd8f5e7226b59404ce4dc0f622ae68a7dcc48b7a39b18c9d7aca500fcdf09b` |
| `forged-receipt-results.json` | `d8704276dd9a4a15cbb2eb550096cfc2d815bcd68e70850c25454539c535441d` |
| `anchor-cli-results.json` | `fb2b221408e54922f8d396b64a6cd31684b44e78f09716d725e7511eab5bcd3c` |
| `anchor-types-results.json` | `fe780d363e8f05010a7910d416cbcdd31b9af9e6cc61a460de1d22e34357be56` |
| `guards/results/guard-matrix.json` | `e09c85393e8851a52410e4234d42f9d077ae8829af6d5367d67208157b6aee4a` |
| `scope-audit.json` | `a718e61907a2d7c5fca70dc072e7facfe91a0e2511d63dfd2d337bc98e583c1c` |
| `repository-checks.json` | `386306c7bc3cc20f905c3b955bab0c00012d71caed35fb083e34569088e68aee` |
| `test-patch/test_event_authority_holding_bucket.dl412.patch` | `c502e0b27a253f0aeab55ed1d94fdbfe3d18b0cbb18117fc2c9ab0646ddbba11` |

**New validator SHA-256:** `743ca664bf8bff3482185c76c01345b6b4d30178b5c9574978868592da5f3dc6`. **Pending new receipt SHA-256:** `713ae2743ebb3a02d7500cd23c136e914d1ae0adc5f9cb5ebd8ef6d110c7d855`. The latter is not the landing Spec Lock value: `lander_task` is still null, and the reseal hashes the final receipt after the lander writer runs. Only the DL-412 entry template in the current landing contract is authorized; no DL-077 anchor is added.

**Family grades before → after:** N/A → N/A. **Ids used:** none minted; existing DL-412 authority only; DL-998/DL-999 remain fixtures. **Bindings:** none. **Open integration:** independent Sol/Astra review before/after landing, DL-412 and DL-413 prerequisites, actual lander/writer, claude-projects-refresh's exact final receipt anchor and the fixture patch as a separate commit in the same landing. Until the entry exists, legacy admission and holding fail closed on this tree. CA-SEAL-FIX7 is procedurally barred from applying the seal in both documents; the checked author/lander list remains unchanged.

## Review round 8: findings and responses (CA-SEAL-FIX8)

**C7-01 — FIXED in `d44f187e38827765d9e0735364d206d72257539f`.** No finding is disputed or stopped for a new product choice. Independent review and the existing coordinated landing prerequisites remain outstanding.

**Where:** `Plans/.audits/event-authority-2026-08-12/independent-validator/pm_event_authority_independent_validator.py:244`–`:282`, the audit spec's DL-412 paragraph, the new receipt's descriptive bridge text, and both current landing contracts. **Cause:** the shared permissive JSON reader collapsed duplicate keys and accepted non-JSON constants before the unique-anchor test, preserving legacy eligibility for malformed anchors. **Fix:** a bridge-local reader uses `object_pairs_hook` to refuse duplicates at every depth and a raising `parse_constant` for `NaN`, `Infinity`, `-Infinity`, reads UTF-8 without BOM removal, requires an exact object root, and leaves JSON syntax/trailing-data rejection enabled. Both Spec Lock and the DL-412 receipt use it on this path. Selected anchor containers have exact native JSON types; exactly one exact-path entry must contain a canonical lowercase 64-hex string matching the receipt's complete bytes. Parse/type/shape/hash failure presents the live executable hash through the existing fallback. Admission and holding retain DL-077's exact original mismatch diagnostics and null old pin.

Only `post_august_validator_pin` changes function AST against the requested head `58b574bb7099fbfa7f1a353112f71fb1bd3bf5f9`. All 2,030 validator lines retain CRLF. The shared `load_json`, original `post_august_receipt_state`, full new semantic predicate and all record logic are unchanged. The new receipt refreshes only its validator after-pin; its descriptive `prior_receipt.note`, `changes` and `notes` now state the strict byte-anchor contract and FIX8 exclusion. Every other pin/identity/flag, null lander and checked author list is preserved. The exact five-path fix scope and 1,464 protected files verify byte-for-byte, including Spec Lock, `.evidence`, August inputs, fingerprints, freeze, old receipts, records, registry, `.gitignore` and auto-decisions. This worker edits none of those protected inputs.

### Fresh anchored differential and forged receipts

**17,480 pairs: 17,457 exact, 23 intended integrity rejections, zero unexpected differences.** All **125/125 paired admission/holding calls** and **12/12 C4 controls** are exact. Normalization remains limited to scratch roots, output generation time and the single new `multi_family_step_receipt_sha256` field. Ordered diagnostics, admitted sets, holding values, old returned pins, CLI stdout and exits are preserved. The same 23 new-receipt byte-link faults each equal the full actual old-validator altered-executable rejection after permitted normalization; the remaining 85/108 full-CLI pairs are exact.

The old side uses frozen DL-077 bytes and unchanged historical receipts. New semantic fixture mutations receive matching explicit synthetic anchors to isolate their named field; anchor/forgery attacks hold their baseline trusted anchor unchanged. No synthetic entry is written to repository Spec Lock. All **14 forged-receipt CLIs** pass their expected eligibility assertions; every combined altered-executable/forged-receipt attack rejects. The prior **20 anchor CLIs**, **41 type/path/hash cases with 41 exact restores**, **24 isolated byte-link controls**, same-import baseline/change/restore/rechange/restore and four old-chain isolation CLIs pass.

| Differential group | Pairs | Exact | Intended rejections |
|---|---:|---:|---:|
| `astra2_existing_records_helper` | 1,732 | 1,732 | 0 |
| `astra2_existing_records_admission` | 1,732 | 1,732 | 0 |
| `astra2_existing_records_with_steps` | 1,732 | 1,732 | 0 |
| `raw_existing_records_with_and_without_steps` | 472 | 472 | 0 |
| `original_125_paired_admission_holding_calls` | 125 | 125 | 0 |
| `legacy_only_full_cli_pairs` | 108 | 85 | 23 |
| `sol_original_legacy_mutations` | 112 | 112 | 0 |
| `sol_extended_existing_records` | 5,880 | 5,880 | 0 |
| `astra_original_existing_records` | 3,936 | 3,936 | 0 |
| `astra_original_fixture_helpers` | 283 | 283 | 0 |
| `cycle3_raw_legacy` | 1,112 | 1,112 | 0 |
| `numeric_legacy_with_steps` | 256 | 256 | 0 |

### Strict parsing through the actual CLI

The review's exact **16 controls** rerun: three positive controls preserve admission/holding, all thirteen malformed controls reject, including all seven formerly false eligibilities. The broader corpus has **77 actual CLI controls: four positives, 73 rejections**. Sixty-five are isolated negatives; eight deliberately reproduce the review's contradictory duplicate orders. The latter remain compound controls when their last duplicate value also violates an anchor condition; they are not represented as single-guard proofs. The isolated identical/irrelevant-key duplicates prove duplicate rejection without a second defective anchor value.

Coverage includes duplicate keys at the root, inside `canonical_ssot_hashes`, inside the entry (`path` and `sha256`), arbitrary nested objects/arrays, and receipt before/after fields; both orders of the review's contradictory keys; all three non-JSON constants at root/deep-object/deep-array positions on **both inputs**; BOM, trailing garbage, a second root, invalid UTF-8, broken JSON, null/array/boolean/integer/float/string roots; canonical hash case/LF/space/type faults; baseline/full-real-lock/restore and legal text/whitespace positives. Constant-looking and duplicate-looking text inside a JSON string remains legal.

Each malformed receipt control installs an exact anchor for those raw receipt bytes so a stale hash cannot mask its parser defect. Every invocation asserts unchanged executable, old receipts, all four old records and their assessments; the CLI must exit 1, admit nothing, make holding invalid, return a null old pin and produce both exact original mismatch issue lists. The overall seal is unfinished for unrelated existing reasons, so exit 1 alone is never treated as rejection evidence.

The external fixture patch now passes **83 methods**, standalone `python3 -I -B`, exit 0. Its added actual-CLI strict-input method produces **28 expected subtest failures against reviewed FIX7** after refreshing only the scratch validator after-pin. Patch dry-run, application and resulting full-file equality pass. The repository test file is still excluded by `.gitignore:50`, so neither it nor `.gitignore` is edited here. The updated patch remains a separate required commit at the same authorized landing after DL-413.

### Check 11: new guards and complete lane

**Eight strict-parser variants × 77 actual CLI controls = 616 calls.** All exact flip sets and retained rejections pass. The table names deliberate duplicate defenses; removing an outer type check alone flips nothing because its old required-field/anchor guards still refuse the same root. The paired mutations remove those root-dependent refusals only for that root type, preserving all unrelated guards. Canonical hash type/grammar likewise intentionally duplicates computed-byte equality.

| Guard / named duplicate | Negatives that flip | Other negatives retained |
|---|---|---:|
| `baseline` | Original strict bridge; zero malformed eligibility (0 flips) | 73 |
| `duplicates-off` | Duplicate-key hook removed: 12 isolated duplicates plus four last-valid review compounds (16 flips) | 57 |
| `constants-off` | Raising constant hook removed: three constants × three positions × both inputs (18 flips) | 55 |
| `hash-format-off` | Exact string/grammar removed alone; computed-byte equality is the named duplicate (0 flips) | 73 |
| `hash-format-and-equality-off` | Canonical type/grammar plus computed-byte equality removed together: all eleven hash faults (11 flips) | 62 |
| `root-type-off` | Strict root check removed alone; old receipt/anchor absence defenses are the named duplicates (0 flips) | 73 |
| `lock-root-paired` | Strict root plus root-dependent unique/hash anchor refusals removed together: seven lock roots (7 flips) | 66 |
| `receipt-root-paired` | Strict root plus old receipt-object/before/after required-field refusals removed together: seven receipt roots (7 flips) | 66 |

The exact case lists are in `strict-guard-matrix.json`, with complete CLI outcomes in `strict-parsing-results.json`. BOM/trailing-data/UTF-8/broken-JSON refusal remains the existing JSON decoder behavior and stays rejected under every targeted guard removal.

The whole existing lane is freshly reproved: **50 variants × 113 negatives = 5,650 cells**, plus all baseline negatives corroborated through `main()`. Every expected flip set matches exactly; every other negative retains an exact baseline rejection reason. The only harness adaptations for the new bridge update its source span and include the new canonical hash duplicate in complete-anchor removal. Receipt, record and synthetic anchor observational copies are refreshed for semantic mutations; anchor attacks preserve their trusted bytes.

| Whole-lane guard | Negatives that flip | Other negatives retained |
|---|---|---:|
| `foreign` | `canonical-boolean`, `canonical-nested`, `canonical-number`, `canonical-unicode`, `canonical-uppercase`, `canonical-whitespace`, `deep-uninspectable-claim`, `duplicate-foreign`, `duplicate-member`, `foreign-Known37`, `foreign-malformed`, `foreign-newline`, `foreign-numeric-claimant`, `foreign-numeric-rejected`, `foreign-ordinary`, `foreign-rejected`, `foreign-upper`, `mention-exact-number-.0`, `mention-exact-number-.0e-0`, `mention-exact-number-.5`, `mention-exact-number-E+0`, `mention-exact-number-e0`, `mention-exact-number-e9999`, `mention-key-registry_after`, `mention-key-registry_before`, `mention-nested-registry_after`, `mention-nested-registry_before`, `mention-numeric-registry_after`, `mention-numeric-registry_before`, `mention-quoted-number-.0`, `mention-quoted-number-.0e-0`, `mention-quoted-number-.5`, `mention-quoted-number-E+0`, `mention-quoted-number-e0`, `mention-quoted-number-e9999`, `mention-space-registry_after`, `mention-space-registry_before`, `mention-unicode-registry_after`, `mention-unicode-registry_before`, `mention-upper-registry_after`, `mention-upper-registry_before`, `mention-value-registry_after`, `mention-value-registry_before`, `nested-noncanonical-side`, `non-json-constant`, `non-json-file`, `outer-array`, `unreadable-json`, `unreadable-utf8` | 64 |
| `missing` | `missing-member` | 112 |
| `states` | `same-states-counts`, `same-states-registry_after-revision`, `same-states-registry_after-sha256`, `same-states-registry_before-revision`, `same-states-registry_before-sha256` | 108 |
| `same-description` | `same-list-and-states`, `same-states-counts`, `same-states-registry_after-revision`, `same-states-registry_after-sha256`, `same-states-registry_before-revision`, `same-states-registry_before-sha256` | 107 |
| `count` | `count-padded`, `count-short` | 111 |
| `different-hashes` | `equal-hashes` | 112 |
| `sorted-unique` | `shape-duplicate`, `shape-unsorted` | 111 |
| `all-or-none` | `member-incomplete` | 112 |
| `step-pin` | `step-receipt-pin` | 112 |
| `decision-DL412` | `decision-DL412` | 112 |
| `receipt-schema_id` | `receipt-schema_id` | 112 |
| `receipt-authority_ref` | `receipt-authority_ref` | 112 |
| `receipt-authority_section_sha256` | `receipt-authority_section_sha256` | 112 |
| `receipt-validator_before_sha256` | `legacy-byte-before`, `receipt-validator_before_sha256` | 111 |
| `receipt-validator_after_sha256` | `legacy-byte-after`, `live-byte-appended-bytes`, `live-byte-comment`, `live-byte-crlf`, `live-byte-one-byte`, `receipt-validator_after_sha256` | 107 |
| `receipt-record_dir` | `receipt-record_dir` | 112 |
| `receipt-record_schema_id` | `receipt-record_schema_id` | 112 |
| `receipt-author_task` | `receipt-author_task` | 112 |
| `receipt-seal_authorized` | `receipt-seal_authorized` | 112 |
| `receipt-admission_authorized` | `receipt-admission_authorized` | 112 |
| `receipt-contract_depth_complete` | `receipt-contract_depth_complete` | 112 |
| `receipt-prior-path` | `receipt-prior-path` | 112 |
| `receipt-prior-sha256` | `receipt-prior-sha256` | 112 |
| `receipt-lander-and-list` | `receipt-forbidden`, `receipt-lander-''`, `receipt-lander-None` | 110 |
| `authority-tokens` | `authority-token-0`, `authority-token-1`, `authority-token-2`, `authority-token-3` | 109 |
| `duplicates` | `duplicate-foreign`, `duplicate-member` | 111 |
| `constants` | `non-json-constant` | 112 |
| `root-shape` | `canonical-boolean`, `canonical-nested`, `canonical-number`, `canonical-unicode`, `canonical-uppercase`, `canonical-whitespace`, `outer-array` | 106 |
| `canonical-scan` | `canonical-boolean`, `canonical-nested`, `canonical-number`, `canonical-unicode`, `canonical-uppercase`, `canonical-whitespace` | 107 |
| `uncertainty` | `canonical-boolean`, `canonical-nested`, `canonical-number`, `canonical-unicode`, `canonical-uppercase`, `canonical-whitespace`, `duplicate-foreign`, `duplicate-member`, `foreign-malformed`, `foreign-newline`, `foreign-numeric-claimant`, `foreign-numeric-rejected`, `foreign-upper`, `nested-noncanonical-side`, `non-json-constant`, `outer-array`, `unreadable-json`, `unreadable-utf8` | 95 |
| `recursive-claims` | `deep-uninspectable-claim`, `foreign-Known37`, `foreign-ordinary`, `foreign-rejected`, `mention-exact-number-.0`, `mention-exact-number-.0e-0`, `mention-exact-number-.5`, `mention-exact-number-E+0`, `mention-exact-number-e0`, `mention-exact-number-e9999`, `mention-key-registry_after`, `mention-key-registry_before`, `mention-nested-registry_after`, `mention-nested-registry_before`, `mention-numeric-registry_after`, `mention-numeric-registry_before`, `mention-quoted-number-.0`, `mention-quoted-number-.0e-0`, `mention-quoted-number-.5`, `mention-quoted-number-E+0`, `mention-quoted-number-e0`, `mention-quoted-number-e9999`, `mention-space-registry_after`, `mention-space-registry_before`, `mention-unicode-registry_after`, `mention-unicode-registry_before`, `mention-upper-registry_after`, `mention-upper-registry_before`, `mention-value-registry_after`, `mention-value-registry_before`, `non-json-file` | 82 |
| `all-files` | `non-json-file` | 112 |
| `canonical-members-paired` | `canonical-member`, `canonical-number` | 111 |
| `claim-object-keys` | `mention-key-registry_after`, `mention-key-registry_before` | 111 |
| `claim-list-values` | `deep-uninspectable-claim`, `mention-nested-registry_after`, `mention-nested-registry_before` | 110 |
| `claim-case` | `mention-upper-registry_after`, `mention-upper-registry_before` | 111 |
| `claim-whitespace` | `mention-space-registry_after`, `mention-space-registry_before` | 111 |
| `claim-unicode-decimal` | `mention-unicode-registry_after`, `mention-unicode-registry_before` | 111 |
| `deep-claim` | `deep-uninspectable-claim` | 112 |
| `nested-canonical` | `nested-noncanonical-side` | 112 |
| `exact-number-tokens` | `mention-exact-number-.0`, `mention-exact-number-.0e-0`, `mention-exact-number-.5`, `mention-exact-number-E+0`, `mention-exact-number-e0`, `mention-exact-number-e9999` | 107 |
| `step-receipt-application` | `authority-token-0`, `authority-token-1`, `authority-token-2`, `authority-token-3`, `receipt-admission_authorized`, `receipt-author_task`, `receipt-authority_ref`, `receipt-authority_section_sha256`, `receipt-contract_depth_complete`, `receipt-forbidden`, `receipt-lander-''`, `receipt-lander-None`, `receipt-prior-path`, `receipt-prior-sha256`, `receipt-record_dir`, `receipt-record_schema_id`, `receipt-schema_id`, `receipt-seal_authorized` | 95 |
| `legacy-frozen-validator-pin` | `legacy-frozen-validator-pin` | 112 |
| `bridge-live-hash` | `legacy-byte-after`, `live-byte-appended-bytes`, `live-byte-comment`, `live-byte-crlf`, `live-byte-one-byte`, `receipt-validator_after_sha256` | 107 |
| `bridge-before-hash` | `legacy-byte-before`, `receipt-validator_before_sha256` | 111 |
| `bridge-all-links` | `anchor-duplicate`, `anchor-elsewhere`, `anchor-entry`, `anchor-files`, `anchor-forged-full`, `anchor-malformed`, `anchor-missing-entry`, `anchor-missing-file`, `anchor-repinned-full`, `anchor-root`, `anchor-ssot`, `anchor-stale-bytes`, `anchor-two-field`, `anchor-wrong-hash`, `legacy-byte-after`, `legacy-byte-before`, `legacy-byte-receipt-array`, `legacy-byte-receipt-boolean`, `legacy-byte-receipt-missing`, `legacy-byte-receipt-null`, `legacy-byte-receipt-number`, `legacy-byte-receipt-string`, `legacy-byte-receipt-unreadable`, `live-byte-appended-bytes`, `live-byte-comment`, `live-byte-crlf`, `live-byte-one-byte`, `receipt-validator_after_sha256`, `receipt-validator_before_sha256` | 84 |
| `anchor-exact-path` | `anchor-elsewhere` | 112 |
| `anchor-unique` | `anchor-duplicate` | 112 |
| `anchor-receipt-hash` | `anchor-forged-full`, `anchor-repinned-full`, `anchor-stale-bytes`, `anchor-two-field`, `anchor-wrong-hash` | 108 |
| `anchor-required` | `anchor-duplicate`, `anchor-elsewhere`, `anchor-entry`, `anchor-files`, `anchor-forged-full`, `anchor-malformed`, `anchor-missing-entry`, `anchor-missing-file`, `anchor-repinned-full`, `anchor-root`, `anchor-ssot`, `anchor-stale-bytes`, `anchor-two-field`, `anchor-wrong-hash` | 99 |

### Recurring-defect sweep, resources and derived checks

| Astra item | Fresh evidence / boundary |
|---|---|
| 1. Forged identities/hashes | Fourteen forged-receipt CLIs, anchored receipt-byte edits and exact hash faults reject; live executable and complete receipt bytes are recomputed. |
| 2. Storage-assigned metadata | N/A; this task changes no runtime event/payload contract. |
| 3. Historical reader crossover | The anchored 17,480-pair replay preserves every intact legacy judgment; only the 23 listed integrity differences occur. |
| 4. One field read two ways | Duplicate-key orders on both inputs refuse before anchor selection; strict native types and canonical hash equality remain consistent. |
| 5. Unresolved schema refs | No schema or `$ref` added or changed. |
| 6. Partial size limits | N/A; no stored body or size policy changes. |
| 7. Custody on every path | Admission, holding, actual CLI and same-import live-byte mutation/restores exercise the bridge. Full step semantics remain separate. |
| 8. Masked negatives | The complete 5,650-cell lane matrix plus 616 actual parser-variant CLIs prove isolated flips and named duplicates; review compounds are labelled. |
| 9. Unsupported grades | Family grades N/A → N/A; synthetic fixtures grant no real admission, depth or seal. |
| 10. Alternate numbers | Original numeric/raw/coexistence and claimant matrices rerun; numeric hash values and scalar roots reject without coercion. |
| 11. Type confusion | Null, booleans/string booleans, integers/floats/string numbers, arrays and objects reject where selected types require object/array/hash string. |
| 12. Silently skipped formats | The anchor uses explicit lowercase full-match grammar with LF/case/space negatives; this bridge adds no jsonschema format dependency. |

Standing checks 1–4, 6–7 and 10 govern runtime family contracts outside this task. Existing exact-length/full-match and raw/numeric tests remain; failure oracles assert observed eligibility, diagnostics and old pins; no new schema reference is introduced. Standing check 11 is proved above.

Derived verification ran in an isolated scratch tree with the 15-file ignored currentness edition copied and byte-verified. Shard check: **PASS, 99 sources / 3,092 shards**. All **3,290** shard files regenerate byte-identically. Both index JSONL files are byte-identical and four index JSON files differ only by generation time. Direct index CLI: **exit 1, top-level status fail, 22 inherited/main-only findings**; every named input is unchanged from the prior review. No generated file is committed or edited in this branch. No full repository gate, governance audit, migration or landing check is claimed by this bounded fix.

Initial resources were 18 GB available RAM and 78 GB free disk; sparse worktree creation followed the successful ≥50 GB disk check. Runtime resource samples, exact command exits and compact replay outputs are retained. No subagent, pm-mail, browser or server was started. Raw runtime/extracted trees and the literal requested worktree are removed after branch push and evidence export. The first extended-Sol replay stopped at an inherited hard-coded FIX7 byte hash before producing any corpus result. Only that harness expectation was updated to the new measured SHA; the complete corpus was rerun, and the initial abort contributes no count. Both logs and the exact adaptation are retained. Historical obsolete aggregate assertions retain their nonzero results in the logs: the two contradictory receipt aggregates and five superseded pair-only positives are not counted as passing assertions.

### Pins, evidence and remaining landing work

**Validator SHA-256:** `319f6bffddb07a36e633fd949146e4ce9149819ea5e817b13897a74314163a91`. **Pending new receipt SHA-256:** `7d57ebde79f1b5ddc5acb224d16c0133bad924259677758b1d02adbbcd2f5882`. Only its validator after-pin is refreshed. The latter digest is **not** the final Spec Lock anchor: the actual lander must first fill the receipt, then claude-projects-refresh hashes those final bytes for the sole exact DL-412 entry at the same landing. No DL-077 anchor is added.

Evidence root: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-SEAL/fix8/`. `README.md` documents replay, fixed versus observing anchors, obsolete expectations and cleanup. `SHA256SUMS` inventories retained sources, exact raw inputs, outputs and logs.

| Evidence | SHA-256 |
|---|---|
| `fix8-summary.json` | `5dcafa6e4c3a581e6a6609a84256c3c275b4df9b7720c86ad40096ef6e3f60ed` |
| `fix8-scope.json` | `b597b7f37dde03796dd1c7d35c5d5a197f497f98e04495b8634e5b7aec39f23c` |
| `differential-summary.json` | `04953363e1415d694131d63a54b4bb19c245f2e5151d30f7ee781abb7457884d` |
| `twelve-controls.json` | `99bc7286cff8579964fecd0e5ff5b17f9dede01b2a8dca87e75d43b37d9a3822` |
| `integrity-rejections.json` | `19dd8f5e7226b59404ce4dc0f622ae68a7dcc48b7a39b18c9d7aca500fcdf09b` |
| `forged-receipt-results.json` | `a06541650266ba0b6004aa09f959006f89a4b65b7a7b8465e384700319f0dd63` |
| `strict-parsing-results.json` | `ba70e973a0977c7410387d4092f3939ce0b5b5577bc613de47302020e00711a3` |
| `strict-guard-matrix.json` | `74f0040bcdb15e645acab864a6a711b378d0c88d2642ecffd25d40a8a5a4df39` |
| `own-anchor-parser-results.json` | `dee89bab41ad6c12ceaf6d5e67c6f5d1ccf5b6b9e6899132be358b34d41be88d` |
| `guards/results/guard-matrix.json` | `e09c85393e8851a52410e4234d42f9d077ae8829af6d5367d67208157b6aee4a` |
| `test-patch/test_event_authority_holding_bucket.dl412.patch` | `9d28d425bd628a9c44f9d6fb25b7a3a5e4dbd09513956b6c8c1f7600a3009a81` |
| `fix8-test-sensitivity.json` | `3922211d87332496e1b0aee6d2a85e0578cb81aeb5ab96d6e8425000330ab6a1` |
| `index-cli.json` | `70bd02bb3c9741b45099f55dec5e587de481999e4eaa0719d8df8dc9ad1b5a71` |

**Family grades before → after:** N/A → N/A; no self-grade JSON applies. **Ids used:** none minted; DL-412 is existing authority; DL-998/DL-999 remain fixture-only. **New bindings:** none. **Open integration:** Sol/Astra independent reviews before and after landing, DL-412/DL-413 dependencies, actual lander/writer, sole final-byte receipt anchor from claude-projects-refresh, updated fixture patch as a separate commit at that same landing, and prescribed landing checks. Until the exact entry exists, legacy admission and holding fail closed on this branch. The literal preparation head cannot be merged unchanged.

CA-SEAL-FIX8 joins the procedural seal-applier exclusion in both documents and in the new receipt note. The checked receipt list remains exactly author and lander. This task performs no admission, registry append, seal, main push or governance refresh.
