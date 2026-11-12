`PM_GOAL_AUDIT_WORKERS=1 python3 scripts/pm_goal_own_c3_w5_successor_oracles.py --output /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG-OWN-C/C3-W5/part2/successor-source-controls.json`

# C3-W5 part 2 — scoped import repaired; next exact blocker

**Family:** `goal_run.certified`. **Whole-root closure: BLOCKED — `W5-STORAGE-PROJECTION-NO-REFERENCE-EDITION`.** The explicitly selected successor repairs part 1's missing import. Complete CF-01..12 and P4..P8 semantic tuples remain NOT_RUN after the next stored-root prerequisite fails. Native execution remains NOT_RUN.

**Continuation:** branch `plans/ea-goal-own-c3-w5-20261105`, exact starting head `7335bf212c16db6ed804e9df7c51ae06a39b2f26`, fetched in `/home/sittingmongoose/src/PuppetMaster`, worktree `/home/sittingmongoose/pm-worktrees/c3-w5-p2`. The head SHA is supplied in the handoff. This report supersedes part 1's current blocker; part 1 remains historical evidence.

## Where

The newly authored, explicitly versioned source package is `Plans/goal_run_certified_consumer_contracts/source-package.v2/`. W5 selects its `selection.json`, `methods.json`, `imports.json`, `resource-realms.json` and `installed-profile.json`. Each of its twelve method entries explicitly names `pm.goal_run_certified.consumer_source.v2` and the selected import/resource paths. Original method names, complete argument roots, returns, effects and all entry/helper/final predicates are preserved.

The next blocker is in the unchanged original `Plans/goal_run_certified_consumer_contracts/schemas/consumer.v1.schema.json`: `$defs/StorageProjection` requires the complete `$defs/Projection`; its certified branch requires `$defs/CertifiedProjection.original_event`, the entire `$defs/TypedCertifiedEvent`. The record is closed and has no `original_event_ref` alternative. `physical-retention-install.json` and the existing Storage registry select this whole v5 row in `goal_run_projection.v5@<generation_id>`.

## Why

**The complete stored wrapper exceeds its mandatory limit while the Event itself fits.** SP-340 caps every redb value at 16 KiB and directs larger values to SP-337. The registry explicitly sets this derived family's `max_value_bytes` to **16,384**. SP-317 and the selected original P4/P5/P6 contract still require the entire original Event in the closed stored row.

The newly authored TEST_ONLY fixture uses 140 distinct references of 88 UTF-8 bytes each in the original v3 payload's `evidence_refs`. That original `ref_array` has unique string members and no `maxItems`; the original reference type has no smaller length bound. The whole original Event and complete original StorageProjection roots validate in their isolated selected banks. The exact hash-pinned original CV-339 MessagePack implementation measures:

| Complete value | Encoded bytes |
|---|---:|
| Inline payload, compact UTF-8 JSON | 13,451 |
| Inline payload, original MessagePack | 13,213 |
| Whole original-shaped Event | 13,927 |
| CertifiedProjection record | 18,480 |
| Complete StorageProjection redb value | **18,626** |
| Same wrapper with empty evidence inventory, size control | 6,024 |
| Actual family limit | **16,384** |

The original codec refuses the complete large row with `AdmissionRefused:encoded_size_cap`. Removing `original_event`, substituting an `original_event_ref`, or externalizing the original Event payload is rejected by the unchanged selected schemas. Shrinking a valid source's evidence inventory, omitting required fields, storing only part of the wrapper, raising the cap or casting a reference into an inline root would change the contract.

**Evidence boundary:** the fixture is a whole-schema and exact-codec representation counterexample. Its seed contains TEST_ONLY placeholder issuance fields. It is not an authenticated original issuance, complete native source graph, valid authority digest or CF/P semantic positive. The blocker is the missing representation for the admitted shape/size domain; a bounded shape fixture is not used to authenticate a source. There is no new bound limiting a genuine evidence inventory to make the frozen wrapper fit. The independent reproducer imports no worker checker and repeats the original-bank lookup, whole-root schema validation, exact-codec size refusal and reference-replacement refusal.

## How to fix

A separately explicit versioned **projection representation and physical selection** must supply the missing SP-340/SP-337 route for `goal_run.certified`: original Event identity plus whole-value commitment and reference join, exact referenced bytes/media type/BLAKE3/size, pack durability before referencing publication, independent read/access/deletion/source-lifetime predicates, limits on every complete stored row/checkpoint/operation part, and rebuild/stage/CAS/cutover into the successor. Preserve original v5 bytes, selections and historical interpretation. The part 2 source-import edition changes no projection root or physical family and cannot inhabit a reference alternative the selected original schema does not contain. Extra owner prose, a transport object or a restamped original bank cannot supply that alternative.

This is a technical prerequisite, analogous to C3-W34's projection issue. No new retention, deletion, user-visible behavior, Event admission or Jared decision is chosen. The task's stop-at-the-next-exact-blocker outcome applies. No missing product answer is claimed.

## Import repair and preservation

**One added scoped rule**, modelled on the original coordinator's existing route, admits exactly:

- **Source realm:** `cancelled_native_consumer`.
- **Whole source:** `Plans/workflow_activation_contracts/schemas/native-worknode-source.v1.schema.json`, SHA-256 `92acbc346f2d066801b3c06f3975d06779c8bc637a02d5ef944466918f89bae1`.
- **Locations:** the eleven exact original `OriginalCompletionInput` reference locations, through only the two original file retrieval aliases. The other four HTTPS aliases gain no new route.
- **Target:** the original whole Handoff resource in `retained_original_d05`, SHA-256 `1b1cff7b32b90f22734e90f025c020a05f9145fbea82ce156cb2224611ce8d4d`, at the original file URI ending `completion-v4/inputs/Plans/plans_to_code_handoff.schema.json`.
- **Nested scope:** `retained_original_d05` throughout. No merged bank, ambient lookup, network retrieval or rewritten URI/reference.

The successor resource map is a byte-exact copy of the predecessor. All eighteen predecessor package files remain byte-exact against the continuation head, including original imports/map/methods/profile and original schema resources. Their old import/map hashes remain `d05f12ed624f2d50bd42659e5ee38670a7a88d24b1ec76a3415341c58fdf500e` and `37bbb87f92c86add8555e8f35498b4e609bd270fe38941396ff2fba72896ea66`. The unchanged predecessor still reproduces its 22 missing occurrences.

The successor installed profile commits all seventeen selected members, including its new import/map/method paths and supplemental contract. Its `source_package_edition` is new; the logical projector name remains the original schema-required `goal_run_started_cancelled_certified_projector.v1`, and its exact profile digest distinguishes this source edition. The native all-writers v7 profile is unchanged. New generations must bind the successor profile digest at birth and follow the original rebuild/staging/CAS/cutover contract; old generations are never relabelled. No installed native service, generation or source authority is asserted.

| Qualification | Resource occurrences | References | Explicit crossings | Unresolved |
|---|---:|---:|---:|---:|
| Original coordinator | 650 | 66,306 | 44 | 0 |
| Selected successor consumer | 1,006 | 101,708 | 272 | **0** |
| Preserved predecessor consumer | 1,006 | 101,708 | 250 | **22** |

These are full-resource reference counts, not semantic oracle cases. The seven existing frozen whole-resource location selections from part 1 remain unchanged at their original hashes.

## Oracles and exact suite disposition

**Complete-path positives: 0. Complete-path negatives: 0. New product guards: 0.** The package adds source-routing and representation prerequisite controls only. Its 22 positive scoped lookups and nine single-defect routing/import refusals are not counted as CF/P cases. The complete new source guard/negative inventory is exported in `successor-source-controls.json` for the shared isolation tool; no local guard-proof engine or blanket check-11 pass is supplied.

| Source guard | Negative ID |
|---|---|
| `scope/realm` | `W5-SOURCE-REFUSE-realm` |
| `scope/path` | `W5-SOURCE-REFUSE-path` |
| `scope/sha256` | `W5-SOURCE-REFUSE-sha256` |
| `scope/retrieval_uri` | `W5-SOURCE-REFUSE-retrieval_uri` |
| `scope/location` | `W5-SOURCE-REFUSE-location` |
| `scope/literal` | `W5-SOURCE-REFUSE-literal` |
| `scope/absolute` | `W5-SOURCE-REFUSE-absolute` |
| `scope/nested_resolution_realm` | `W5-SOURCE-REFUSE-nested_resolution_realm` |
| `scope/whole_target_sha256` | `W5-SOURCE-REFUSE-whole_target_sha256` |

The seven routing request controls alter one dispatch fact. The last two exercise the import-declaration seam with the actual retained target unchanged; no stale profile is submitted as a semantic tuple. Schema-seam reference refusals and the encoded-size counterexample are recorded separately from these guards. Every negative requires refusal; unexpected acceptance fails the checker.

| Required facets | Current result |
|---|---|
| CF-01..03 | Complete semantic tuples NOT_RUN; no structural specimen is promoted to original authority |
| CF-04 | Eager full-bank reference prerequisite resolved for the selected successor; complete birth/profile tuple NOT_RUN |
| CF-05..09 | Complete chronology/append/commit/release/source/inspection tuples NOT_RUN |
| CF-10..11 | Blocked by the complete mandatory stored-row representation; no reducer/publication/cutover success claimed |
| CF-12 | Complete lifetime/restore tuple NOT_RUN |
| P4..P7 | Complete original prefix/row/checkpoint/CAS/current-disclosure tuples blocked at the stored-root prerequisite |
| P8 | Complete original lifetime tuple NOT_RUN; no source hold or archive is added |

The unchanged component suites freshly pass: 355 cases (46 positive, 309 negative) and 293 cases (112 positive, 181 negative), with their inherited partial scope. They do not close this blocker. Original numbers/formats/retained-recipe and guard-isolation sweep items remain separate. No new serializer, number cap or format tightening is introduced; the only size threshold tested is the existing SP-340/registry value.

## Search, authority and premise checks

Read the lane brief and both addenda, shared drafting/fix rules, part 1 report and independent reproducer, both DG-OWN-C reports, and Sol's cycle-3 O4/O5/O7 package. Rechecked this exact family's GRS-084/085, SP-316/317, CV-352, EP-124, ATS-057, W5 and its original method/resource/import/physical/profile packages. Reused the coordinator's original retained-Handoff route. The original consumer has no allowed missing crossing in its 206 explicit imports or inherited two-realm route. The selected certified StorageProjection has no reference branch; the selected physical row and registry still point at that closed root. No sibling projection root is substituted.

DL-045's technical-binding premise remains the same current certified family and existing behavior. DL-270's current SP-337/SP-340 source confirms the payload route and whole redb limit, while SP-317 still names the complete original projection. No old Decision Log answer is extended, no changed premise is silently applied, and no product conflict is decided. Application `goal_run.stopped` and the lead's already assigned 7.a remain outside this task.

## Twelve-criterion self-grade

| Criterion | Part 1 | Part 2 |
|---|---|---|
| Membership/version | PASS | PASS |
| Owner document | PASS | PASS |
| Producer | PASS | PASS |
| Closed payload | PASS | PASS |
| Scope/identity | PASS | PASS |
| Replay/idempotency | PASS | PASS |
| Retention | PASS | PASS |
| Redaction/custody | PASS | PASS |
| Transitions | PASS | PASS |
| Consumers/checkpoints | PARTIAL | PARTIAL — import repaired; stored projection route missing |
| Compatibility/withdrawal | PASS | PASS |
| Positive/negative oracles | PARTIAL | PARTIAL — exact prerequisite stop |

**10/12 → 10/12.** The self-grade is `DG-OWN-C3-W5-part2-self-grade.json`; all carried evidence is checked against this tree, with new evidence for the selected successor and next blocker. No cell rises for reference qualification, shape controls or native NOT_RUN.

## Units, shared hunks and boundaries

**PlanUnits added/amended: none. IDs used: none.** Existing GRS-1134/SP-1136/ATS-1118 adopt W5 by its protocol; this package changes only W5's explicit source selection and adds its versioned companion/preconditions. ATS-1118 itself is unchanged. The allotted C3-W5 IDs remain unused.

Shared-file hunks, relative to the continuation head:

- **`Plans/goal_own_c_contracts/protocol.md`:** new lines 71–72, wholly inside W5, explicit successor and exact blocker.
- **`Plans/goal_own_c_contracts/suites.json`:** lines 117 and 121 select the new resource/method maps; lines 133–148 add W5-only source-edition/history/closure metadata.

Machine-readable ranges are in `DG-OWN-C3-W5-part2-merge-ranges.json`. New companion files are wholly under this family's `source-package.v2/`; the only script amendment is C3-W5's own part 1 script, plus its new successor script. No other worker's source, common oracle, Event registry, admission, Decision Log, retention policy, original schema/bank/profile, Spec Lock, evidence bundle, baseline, migration or governance seal is edited. No main push, pm-mail or subagent is used.

<!-- checks-and-evidence -->

## Checks and evidence

| Check | Exit | Result |
|---|---:|---|
| Selected successor eager whole-bank qualification | 0 | Zero unresolved references; full semantic tuples not run |
| Preserved predecessor qualification | 2 | Original 22 missing occurrences still reproduced |
| Successor source/size precondition | 2 | 22 scoped positives / 9 source refusals pass; next representation blocker detected |
| Independent reproducer | 0 | Import repair and exact next blocker independently reproduced |
| Unchanged DG-OWN-C component suite | 0 | 355 cases, 46 positive / 309 negative; inherited partial scope |
| Unchanged DG-OWN-C source suite | 0 | 293 cases, 112 positive / 181 negative; inherited partial scope |
| Original lineage self-test | 0 | Pass |
| Shard generate / check | 0 / 0 | Zero shard changes |
| Index generate | 0 | Top-level pass; both JSONL indexes byte-identical; four generation timestamps only |
| Index validate | 1 | Top-level fail; exact same 23 recorded baseline failures, zero new failures |
| Script compilation / final citation and diff QA | 0 | Pass |

The index failures are the 21 existing legacy-ledger errors plus main-ahead DL-302 and PLS-025. Their complete failure set was compared to DG-OWN-C part 2's retained output, not waived or replaced. No ledger, Decision Log, baseline or retention rule was rewritten. Unneeded generated timestamp changes were reverted; no derived artifact is committed. The fifteen-file currentness edition was copied coherently and SHA-256 verified before generation; its exact input archive is retained. Generators ran serially after the other worker's repository checks finished. All sampled available RAM stayed above 6 GB; no process belonging to another worker was changed.

**Not run after the exact prerequisite stop:** the four long inherited DG guard-removal audits, complete CF/P execution, aggregate governance gates, admission and native execution. Their bounded inherited results cannot repair this complete original stored-root gap; no old heavy-check result is asserted as fresh. No PlanUnit was changed and no shard or JSONL row changed.

**Stopped product question:** none. **Next technical action:** explicitly version the certified stored projection and physical selection to supply the complete SP-337 route under SP-340, then rerun this precondition and the whole original CF/P corpus.

Retained directory: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG-OWN-C/C3-W5/part2/`. This report, self-grade, shared merge ranges and check outputs are copied there. Exact evidence:

| Artifact | SHA-256 |
|---|---|
| `successor-bank-precondition.json` | `d356e62f3eb45b235d710e43a712a9a711e38aab5dcfb05a6fcd1a4f11ed2c81` |
| `predecessor-bank-precondition.json` | `1f075464eebe63ea1cb3d4f5d546648826b8dda66c38fd6941b1d29712236ac1` |
| `successor-source-controls.json` | `48b750afd149fdaea5ea6479e8a56a2c83e656d56268db25e7ecc251b256338e` |
| `independent-reproducer.py` | `77db4e8029361b2a04109a2f34615f93791de72ac2846918318a9bc265c333ff` |
| `independent-reproducer.json` | `59f853682fb3b463e2e1b85c9cc5a6a04867d8669fdf8b678cc37c77bd91312a` |
| `predecessor-preservation.json` | `0074a653358da38f078b743489e6699d870ac9429b7cab0bddadaa0c137f791f` |
| `component-checks.json` | `6aa144d007f256ccdd9980e387e9e840611b200266746fa69c19f5edaace77ac` |
| `own-c.json` | `e65caaa8e76ee1e85b556d6685b5548a45197c01b01d640318ff48c21075aba6` |
| `own-c-source.json` | `112478ab319904486665ed703772b8438423149818f851cf6f4bccdb9877258a` |
| `derived-checks.json` | `e967fe2039e62bd006e323d23eefc4bd475138ac634e679e166f1cf8e9c84749` |
| `derived-scope.json` | `3c9eccba09440d2e2e4d66a04e341d1aa49b02f8258b4c9cb31d034287813c54` |
| `index-baseline-comparison.json` | `38a0a5316f85c134e989e604cc54ddb477cf7c6e7cb7349a5d7fa76331ae1e79` |
| `currentness-copy.json` | `5d6e849910451229f70968c5b21c2f47b202d8085a2112b870ea733f75166d09` |
| `currentness-inputs.tar.gz` | `9a78170af6805b4ec0fd1ed9654dc45c1a14638c6b303194032e60c0a86f8990` |
| `final-qa.json` | `591f49a7fc046542effbea85f239c8ac1ba99f2f6958f6199063506d44edd6ed` |
