# Tool batch 1: ledger witness and standalone use

**T9 and the witness part of T8 are fixed in `f2a7eb0c99c9959130606b34df0d5353426c6e31`, with the exemption finding from recheck cycle 4 fixed in the section at the end.** Branch: `plans/tools-batch1-20261105`, from `origin/main` at `451738fc0b869f5958d205e96b513af5290f7e5f`. Local verification passes; independent review is not claimed. The guard-tool portion was finished and pushed first at `dec0a57dce93238ab33452f6b7ca1c759435b587` on `plans/ea-guardtool-20261105`, then its prescribed worktree was removed.

## T9 — vacuous witness and held/retired tokens

**Location:** `scripts/pm-ledger-compile-witness.py`. **Cause:** absent `target_plan_unit_ids` skipped all owner/token/registry checks, yet the absence of findings became `pass`; every source token was otherwise mandatory, with no scoped disposition protocol.

**Fix:** zero checked owner registries now reports `vacuous` and exits 2. Only explicit `--allow-empty` permits a clean empty scope, with status `vacuous_allowed_by_--allow-empty`; findings remain blocking. Missing or ambiguous targeted units cannot silently disappear. Summary fields report declared targets and actual registries checked.

Reviewed exemptions live in the ledger's optional `records/compile_witness_exemptions.jsonl`. Each names the queue item, source atom, exact token, existing mapped owner units, `held` or `ledger_retired`, reason, reviewer and accepted ledger-record reference. The cited record must link that atom and list that token. Canonical path checks keep it inside `records/` and refuse self-certification through path aliases. Unknown, stale, duplicate/overlapping, unreviewed or malformed exemptions are input errors. Reviewers still verify the disposition's meaning and authority; structural validation is not a signature or semantic review.

The optional `atom_target_plan_unit_ids` map keeps each atom's evidence in its assigned owners. Exact-token evidence must be in one owner's body and that same owner's registry. Registry-only strings are excluded, including block lists. Exemptions leave active tokens, other owners, registry hygiene and changed-repair checks intact. Numeric PlanUnit prefixes are recognized in repairs. Invalid/unreadable Git bases fail as input errors rather than disappearing as missing base text.

The original GRS-027 ledger was checked read-only: **`vacuous`, exit 2, 0 targets / 0 repair records / 0 item tokens / 0 registries checked**. Its explicit empty override exits 0 with the flag named in its status. No actual ledger targets, atoms, review dispositions, owner prose or canon were changed in this tool task. A non-vacuous compile witness still requires the ledger owner to record the intended targets and reviewed dispositions.

## T8 — standalone README, command line and self-test

The witness is a flat two-file distribution: `pm-ledger-compile-witness.py` and `pm_ledger_compile_witness_traps.py`. `scripts/ledger-compile-witness/README.md` documents the format, files, Python/platform contract, standard-library dependency, Git requirements, stable commands, exits, reset-free scratch cleanup and reviewed exemption protocol. `--root` defaults to the caller's current directory. `--self-test` uses OS temporary storage; optional `--scratch` selects another generic parent.

```sh
python3 tools/pm-ledger-compile-witness.py ledgers/change-001 --root . --json
python3 tools/pm-ledger-compile-witness.py --self-test --json
```

The guard tool's corresponding README, `--scratch`, flat distribution and dependency setup are on its pushed branch. That separate result has **130/130 observations**, normal/optimized DG6B extracted proofs and **1,603 assertions**; see `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/GUARDTOOL/B-fix2/B-fix2.md` and its fingerprint manifest.

## Verification and scope

**42/42 witness regressions pass**, with identical normal/optimized JSON. Negative cases cover both empty queue forms, missing target units, non-exempt held/retired strings, invalid/stale/overlapping exemptions, canonical self-review and record-cone escape, still-required active tokens, registry-only strings, cross-owner borrowing, unchanged repairs, numeric prefixes, invalid bases and unknown atoms. Positive controls include nonempty coverage, explicit vacuity, reviewed held/retired tokens, per-atom targets and changed/new-unit repairs.

**63 evidence assertions pass.** An exact two-file copy runs the full self-test from another project directory with the program share denied by an audit hook. The generic scratch override passes and removes every synthetic project and local Git fixture. Temporary distributions and project directories are removed. Reproduction drivers and raw JSON remain outside the repository under the evidence path below.

Checks ran serially on Python 3.14.4/Linux with a 1 GiB address-space cap and fresh 6 GiB available-memory preflights. Git pack windows were limited per command for the large repository; no Git configuration was changed. Setup had 112 GB disk and 11 GiB available RAM. The supported interpreter/platform boundary and exercised versions are stated in the README. Python parsing and `git diff --check` pass.

Only the witness, its corpus helper, standalone README and these compact report companions change. No owner Markdown, live ledger, registry, Decision Log, Spec Lock, generated shards/index/evidence, `.gitignore`, main push, pm-mail or subagent work. No event-family or semantic compilation grade is claimed.

Evidence directory: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/TOOLS-BATCH1/`. `verify-batch1.py` reproduces the serial commands and checks the results; `commands.json` records exact commands, exits and resource readings.

| Evidence under that directory | SHA-256 |
|---|---|
| `self-test.json` | `c87e625b079835db2368759990f5e1ec3d04c27f30aefdd86cdc7e592b8a590b` |
| `self-test-optimized.json` | `c87e625b079835db2368759990f5e1ec3d04c27f30aefdd86cdc7e592b8a590b` |
| `grs027-current.json` | `1570f0ed294a48e4e9bb59ba08f0e23cd46aec2ad802d9ad827151aac7c719be` |
| `standalone-mount-denied.json` | `c87e625b079835db2368759990f5e1ec3d04c27f30aefdd86cdc7e592b8a590b` |
| `audit-results.json` | `d6c661cb679515a38a4a0fdc716450fe04bb7ca0d9711a610b877b5a2ac41f33` |
| `input-manifest.json` | `558a30681d5bb856e9515044f91512d020df57096d66e79f51129daa2756c863` |

## Batch 1, recheck cycle 4: findings and responses

**C4-T9-1 is fixed in `9c2bbc50aa1d17c2112a14e387260028581fdce8`; not disputed.** Base: `5acc0a68d1b946de6132806adcf5262df1eedb1d`. This section supersedes the exemption rules and the 42-regression count above. No independent review of this round is claimed.

| Finding | Location, cause and fix | Regression evidence |
|---|---|---|
| **C4-T9-1 — fixed** | `scripts/pm-ledger-compile-witness.py`, `token_exemptions`. The cited record was checked for acceptance, atom link and token mention, so an accepted record that kept the same token active could support a `ledger_retired` exemption. The cited accepted record now needs one structured `token_dispositions` entry (schema `pm.ledger_token_disposition.v1`) for the exemption's exact queue item, atom, token and target set. Its `held` or `ledger_retired` value must equal the exemption's. | Without a matching entry, with `active`, with a different value, or with another accepted record giving the same atom and token a different value on an overlapping target, the run is refused with exit 1 and a reason naming the case. |

**Disposition rules.** Conflict detection reads every accepted record in `records/**/*.jsonl`, across queue items, whenever an exemption exists. Non-accepted records do not count. An active disposition for a different owner, atom or token is not a conflict, and that other owner keeps its own requirement. A wider or narrower target set than the exemption's is refused as not exact. A malformed entry on any accepted record is an input error.

**Guard-tool figures above.** The T8 section's guard head and 130-observation count are from the earlier round. The current guard head is `07fefa83bddb397a2d41e132db4203a90e1b414d`, reported in its own `GUARDTOOL.md`.

**Human review stays required.** The README still says the checker verifies structure and agreement, not a reviewer's identity or the authority and meaning of the recorded decision. Anyone who can write the ledger can write an accepted disposition.

**Real ledgers.** No ledger has this new record yet and none was changed. GRS-027's `corr-0010` retires tokens only in prose, and that ledger has no targets or exemptions, so its result is unchanged. A repaired ledger that adds targets must add these entries before an exemption will pass.

### Rerun results

| Check | Result |
|---|---|
| **Self-test** | **68/68** in normal and optimized Python, with identical JSON. All 42 earlier regressions remain; their fixture gained the structured entry so the held and retired controls stay valid. 26 are new. |
| **Unit tests** | `tests/test_pm_ledger_compile_witness.py`: 7/7. |
| **Review driver `witness-adjacent.py`, path changed only** | Exemption off: exit 2 for all three rows. Exemption on: exit 1 for all three, because its fixture has only a flat `disposition` label and no scope. This includes the reproduced active false pass, which was exit 0. |
| **Same driver with the structured entry added** | `active` with an exemption: exit 1, "keeps this token active". `held` and `ledger_retired` with an exemption: exit 0, `pass`, 1 token exempted. Without an exemption: exit 2. |
| **GRS-027, read-only** | `vacuous`, exit 2, 0 targets. `--allow-empty`: exit 0, status names the flag. |
| **Standalone** | Flat two-file copy from another directory: 68/68 with the share denied by both the review's hook and the earlier one. The generic `--scratch` run also passes and leaves nothing behind. |
| **Evidence audit** | 113 assertions pass, including each new refusal's reason. |

**A disclosed change to the review driver's held and retired rows:** they exit 1 unchanged because the flat label has no scope, which the fix requires. The structured copy is the control; `witness-adjacent-structured.py` differs only by that entry and its output name.

**Resources and scope.** Commands ran serially on Python 3.14.4/Linux from scratch copies of the commit, with a 1 GiB address-space cap and a 6 GiB available-memory floor. Only the tool, its corpus helper, the standalone README and these report companions change. No owner Markdown, live ledger, registry, Decision Log, Spec Lock, `.evidence` or `.gitignore` edit, no `main` push, no pm-mail and no subagent.

Evidence directory: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/TOOLS-BATCH1/fix3/`.

| Evidence under that directory | SHA-256 |
|---|---|
| `self-test.json` | `589948c652dac0e229a8cdbc21ed2698cf9b28497aef1e8297978c30d598681a` |
| `self-test-optimized.json` | `589948c652dac0e229a8cdbc21ed2698cf9b28497aef1e8297978c30d598681a` |
| `B-cycle4/witness-adjacent.py` | `a772cba073fd8da9e4b7e6dcda62851f1540582e19d906f58f4230f523509d52` |
| `B-cycle4/witness-adjacent.json` | `eea0d1ac16a62ae253327ad4bc6e2156a619029a838d68e16b04eccfeff288e5` |
| `B-cycle4/witness-adjacent-structured.py` | `a4de0af3780a81577a7f605ee8f6e43fafe7af68aa700dacd713a02e3d34df55` |
| `B-cycle4/witness-adjacent-structured.json` | `ac9d2162e259bd1d8b6472da178ac89d9bfe7ffc852c75c2b4532c9446f95170` |
| `grs027-current.json` | `1570f0ed294a48e4e9bb59ba08f0e23cd46aec2ad802d9ad827151aac7c719be` |
| `grs027-explicit-empty.json` | `b6faea5d212dc0a421ee62659fa014c5b3eeea6df6486071be5c8c3f826b6636` |
| `standalone-denied-share.json` | `589948c652dac0e229a8cdbc21ed2698cf9b28497aef1e8297978c30d598681a` |
| `standalone-review-mount-denied.json` | `589948c652dac0e229a8cdbc21ed2698cf9b28497aef1e8297978c30d598681a` |
| `standalone-scratch.json` | `589948c652dac0e229a8cdbc21ed2698cf9b28497aef1e8297978c30d598681a` |
| `commands.json` | `1a9c309528ac3c045ee54d0c0ee9bfd15ef0cb7d9de515d4b1ccc9043ca0949c` |
| `input-manifest.json` | `c89319be719e3f87cabddf333515f10190f1a1712065797ff190d126a3fb51ad` |
| `audit-results.json` | `36cac8112de493d239fb2a150dc523d0f29f5b45804625be596746442cd47a38` |
| `verify-fix3.py` | `f84cb3080860af383a15e536bebad41f009b6de91423afa40c38cd284dd910d7` |
| `mount-denied.py` | `1ed68f01e252f4611337f8330028932d53cb72e3beba5e152f0627650bafd5fc` |
| `portability-driver.py` | `e22df2f2eca26cf0ec4078d791151e97fb7978e687a260616799a0a2ca5f8973` |

## Batch 1, Sol max cycle 6: findings and responses

**C6-W1, C6-W2 and C6-W3 are fixed in `6709b5891e9b709845a2d95d583ea697c2d4638f`; none is disputed.** Base: `d6b82adb1fd9d1aaf6ae0d7c5512c6dcafad4a8e`. This section supersedes the empty-coverage rules, the same-document duplicate behaviour and the 68-regression count above. No independent review of this round is claimed.

| Finding | Location, cause and fix | Regression evidence |
|---|---|---|
| **C6-W1 — fixed** | `scripts/pm-ledger-compile-witness.py`, `run`. Vacuity meant "no registry was checked", so one nominal target gave ordinary `pass` with nothing compiled. Coverage is now the atom-to-existing-owner mappings, reported as `atom_owner_mappings`. No mapping means `vacuous`, with `vacuity_reason` `no_owner_targets` or `no_atom_reaches_an_owner`, and only `--allow-empty` permits it. `records/design_atoms.jsonl` must exist, whatever the flag. | Targets with no source atoms and atoms all mapped to `[]`: exit 2. With the flag: exit 0, labelled, and findings still block. A missing atoms file: exit 1, with or without the flag. Partial scope stays `pass` and disclosed. Compiled atoms with empty token lists stay `pass`. |
| **C6-W2 — fixed** | `definitions_in`, `run`. `units_in` kept the first block per ID, so a duplicate in one document vanished before the uniqueness check. Every definition now keeps its path, form and lines until targeted uniqueness is validated. The first fence declaring a heading's own ID inside its section, deeper subheadings included, is its metadata. Any other heading or declaring fence is independent. | Duplicate headings, duplicate fences, a second fence under one heading, a fence in another section, a fence before its heading and a multi-ID fence: `ambiguous_owner_unit`, naming each place. Single-definition, subheading-metadata, cross-document and untargeted-duplicate controls hold. |
| **C6-W3 — fixed** | `UNIT_ID_FORM`. Owner IDs allowed any digit count and repair IDs needed three, so a repair of `AA-01` was silently dropped. All three extractors now share one grammar. Ledger candidate IDs such as `RT-01` have the same shape, so a short ID in a `Repairs` sentence counts only when it is a declared target or has a definition; others are disclosed under `unresolved_short_ids`. | Unchanged `AA-01` and `AA-1` repairs: exit 2. Changed `AA-01`: exit 0. A short ID that exists but is not targeted fires. An unresolved `RT-01` is disclosed and is no finding. |

**One exception to C6-W2: `DL-*` in one document.** `DL-*` units supply no owner evidence, and `Plans/Decision_Log.md` really does carry a log entry and a PlanUnit under 213 numbers. Failing those would raise false findings on three real ledgers that target decision units. Across documents they stay findings, as `DL-062` shows on the Azure ledger. The README states this. A reviewer may want to confirm it.

**A real duplicate the survey found.** `Plans/UI_Command_Catalog.md` defines `UCC-168` twice, at lines 14574 and 14588. No current ledger targets it, so no result changes. Owner Markdown is outside this task, so it is not fixed here.

**The unit text itself is unchanged.** A heading's text still ends at its first subheading, so a metadata fence under a subheading counts for uniqueness but not as registry evidence. That is existing behaviour, and 21 real units have this shape. This round did not change it.

### Rerun results

| Check | Result |
|---|---|
| **Self-test** | **103/103** in normal and optimized Python, with identical JSON. The 68 earlier regressions keep their order, expected results and witness rows, and 35 are new. |
| **New regressions on the base tool** | 27 of the 35 new regressions fail there, and all 68 earlier ones pass. |
| **Unit tests** | `tests/test_pm_ledger_compile_witness.py` passes. |
| **Review driver `witness-probes.py`, scratch path changed only** | All 20 fixtures are unchanged. The seven false passes now return their expected results: exit 2 `vacuous` twice, exit 1 `error`, exit 2 `findings` four times. The other 13 keep their results. |
| **`witness-adjacent.py` and its structured copy (cycle 5)** | All rows keep their exits and statuses. |
| **GRS-027, read-only** | `vacuous`, exit 2, `no_owner_targets`. `--allow-empty`: exit 0, status names the flag. |
| **Every real ledger, read-only, base tool versus this one** | Same status for all 39 entries (3 error, 11 findings, 5 no-queue, 2 pass, 18 vacuous), same configuration findings by kind and unit, same repair rows. No ledger changed. |
| **Standalone** | Flat two-file copy from another directory: 103/103 with program paths denied. The generic `--scratch` run also passes and leaves nothing behind. |
| **Evidence audit** | 366 assertions pass. |

**Limits.** A duplicate is found by ID form only: an ID the grammar does not match, or a heading above level 4, is not a definition, and it supplies no evidence either. A `Repairs` sentence naming no unit at all is still not a finding. Tokens, IDs and accepted labels do not establish semantic fidelity, so the README's human-review requirement stands. Only Python 3.14.4/Linux was exercised.

**Guard-tool figures above.** The current guard head is `df1306222bf9efe556bd34726a378177493e28ee`, reported in its own `GUARDTOOL.md`.

**Resources and scope.** Commands ran serially from scratch copies of the commit, with a 1 GiB address-space cap and a 6 GiB available-memory floor. Only the tool, its corpus helper, the standalone README and these report companions change. No owner Markdown, live ledger, registry, Decision Log, Spec Lock, `.evidence` or `.gitignore` edit, no `main` push, no pm-mail and no subagent.

Evidence directory: `/mnt/Cursor/archive/PuppetMaster-Evidence/event-authority-20261104/drafts/TOOLS-BATCH1/fix4/`.

| Evidence under that directory | SHA-256 |
|---|---|
| `self-test.json` | `5942885c5df67fefbde5d2e7705b15cef546bfe0cf5266034c268ac21ca26ce7` |
| `self-test-optimized.json` | `5942885c5df67fefbde5d2e7705b15cef546bfe0cf5266034c268ac21ca26ce7` |
| `cycle6/reviewlib.py` | `96248cb6b2f2a2ec0a9eb6539068944e63a6a464cc688c24fc09d848f74610f3` |
| `cycle6/witness-probes.py` | `c93efeb6e04a6c8bdebd95d8d63606d35aef014bf076b221854bd9c2c94daf5d` |
| `cycle6/witness-probes.json` | `04a905829093d3c029a9088cb917a17b3b3f20409864a06345fdd2ff885f9a65` |
| `cycle6/standalone.py` | `66f44773dd486448dfb0918cc1f1b18e29faa2c5e55fdbd2605c32d9b2160216` |
| `cycle5/witness-adjacent.json` | `8354c858baa5b7df1ccaf1bbf038bcf1c342238a1e7d8c70a7b3b8961ce9fd28` |
| `cycle5/witness-adjacent-structured.json` | `4b6552d25089d592adeaa369fda08ca8a11b113952cafd3868b5b737dd6227ec` |
| `grs027-current.json` | `1789c7ee18d39f14d2ff5da87caac97853b1ac1055f2b21f0970f3ca9ef3d2a7` |
| `grs027-explicit-empty.json` | `edf4fa14a520af774caebd9218bb960193a4e2e7eeb11f24894e1c46f5c5670c` |
| `standalone-witness.json` | `5942885c5df67fefbde5d2e7705b15cef546bfe0cf5266034c268ac21ca26ce7` |
| `standalone-scratch.json` | `5942885c5df67fefbde5d2e7705b15cef546bfe0cf5266034c268ac21ca26ce7` |
| `new-regressions-on-base-tool.json` | `526b8e9afa02c3f7922af76eaf7019cdcb14f6ad1ab6ba666f387eaaa193cd4e` |
| `real-ledgers.json` | `9cd143b32fb4112a33656ea05daa3ba397e98cb9b12ccb4d3197653353226586` |
| `real-ledgers-base-tool.json` | `d652f29ddabb68908fe8a4b9551dec7a5068eff62c9c7e1b4edcc3a4b59cfc06` |
| `commands.json` | `e48e230f46767d113317efb948b831dd5a3afed1fa949a482867fc4ece22ccd1` |
| `input-manifest.json` | `efe695f7f012198a61957dc57bf83eacf5b9501cdbd98308f573aae382a4a5a8` |
| `audit-results.json` | `d11a2e618ee429c2a5be18fe606976fe41408dabf96a26e397d47d263be4b40d` |
| `verify-fix4.py` | `4c1b9eea0a05407d614c4ad99bc21287fecb47c9cbd1914fb5d5406eb02d6cb5` |
| `ledger-scan.py` | `a218afbf4db43ae084d1d3626d5cdb2de390bf22b7f3217f0d41f92d53452047` |
| `prepare-report.py` | `66da6dd2bc9d22838973e0facadfd01828c76843111452f671e72bbe9e423dcd` |

## Batch 1, Opus pre-check cycle 7: findings and responses

**W7-1 to W7-4 are fixed in `266482160bc860da29a0b6632edcb63bfbbcaa7d`; none is disputed.** Base: `9e95b3fc3844ec725fbecde8c3ed74ff9d50e0e5`. The pre-check found no blocking witness defect; these were its nonblocking notes, done now as the brief asks. This section supersedes the `DL-*` exception, short-ID and definition-form behaviour and the 103-regression count above. No independent review of this round is claimed.

| Note | Location, cause and fix | Regression evidence |
|---|---|---|
| **W7-1 — fixed** | `scripts/pm-ledger-compile-witness.py`, `run`. The same-document `DL-*` exception was silent, and the repair witness compared only a unit's first definition, so a PlanUnit-only repair under a reused decision number was reported unchanged. Every same-document repeat of a targeted or repaired `DL-*` unit is now listed in `repeated_decision_units`, with each definition's lines and title. `titles_differ` is true when the titles still differ after case, punctuation and a trailing reference list are removed. A repair now compares every definition with the base, fires only when none changed, and names the changed ones in `changed_occurrences`. | A reused number with two titles is disclosed with `titles_differ` true; a log entry and its title-cased PlanUnit give false. A PlanUnit-only change is a repair (exit 0; exit 2 at the base) naming occurrence 2. A log-only change names occurrence 1. No change still fires. |
| **W7-2 — fixed** | `run`, repair witness. An unresolved repair ID with fewer than three digits was only disclosed. Now an ID that resolves to no unit is set aside only when it is one of the ledger's own candidate IDs (record headings and correction `finding_id`s), at any digit count, under `unresolved_candidate_ids` (also kept as `unresolved_short_ids`). Any other unresolved ID stays named, is listed under `named_but_unresolved` and fires as not targeted. | Nonexistent `AA-99` and `ZZ-9`: exit 2, as `AA-999` already was (exit 0 at the base). `RT-01` and a three-digit correction `finding_id` stay set aside. |
| **W7-3 — fixed** | `definitions_in`, `unsupported_forms`. Quoted `plan_unit_id` values and `~~~` fences are recognised as definitions, so they count as duplicates or as a heading's own metadata. A separator-less heading, a level 1, 5 or 6 heading, or a `plan_unit_id` line the grammar cannot read or that sits outside a fence, naming a targeted or repaired owner ID, is refused as `unsupported_owner_definition_form` before any pass. Longer identifiers (`AA-001.2`) and `DL-*` IDs are not refused: decision units supply no owner evidence, and three real addendum headings such as `## DL-059 to DL-065 Accepted ... Addendum` name decisions without defining them. | Double- and single-quoted fences and a `~~~` fence: `ambiguous_owner_unit` (exit 0 at the base). The four unsupported forms: exit 2 naming the form and line (exit 0 at the base). Quoted and `~~~` own-metadata, dotted-sub-ID and decision-addendum controls pass. |
| **W7-4 — fixed** | `definitions_in`, `registry`. A heading's own metadata fence under a deeper subheading counted for uniqueness but was outside the unit text, so its registry was never checked. That fence is now part of the unit's text, and every registry in a unit is read, not only the first. | A ghost entry in that fence fires registry hygiene (exit 0 at the base). A registry that lives only in that fence now supplies the token's registry evidence (exit 2 at the base). |

### Rerun results

Each command ran serially from scratch copies of the commits, with a 1 GiB address-space cap and a 6 GiB available-memory floor, on Python 3.14.4/Linux. Every review driver of cycles 5 to 7 ran against both the base and this tool from its own copy, changed only in its hard-coded tool or scratch path.

| Check | Result |
|---|---|
| **Self-test** | **126/126** in normal and optimized Python, with identical JSON. The 103 earlier regressions keep their order, expectations and results, and 23 are new. |
| **New regressions on the base tool** | All 103 earlier ones pass there. 18 of the 23 new ones fail: 10 were false passes (exit 0 where a finding is due), 3 false findings (exit 2 on a correct repair or registry), and 5 need the new disclosure fields. The other 5 are controls on which both tools agree. |
| **Unit tests** | `tests/test_pm_ledger_compile_witness.py` passes. |
| **Pre-check driver `witness_adjacent.py` (cycle 7)** | 36 rows. Exactly the eight rows the notes name change: the separator-less heading, the level-5 heading, the quoted and `~~~` fences, the subheading ghost registry and the nonexistent two- and one-digit repair IDs now exit 2; the PlanUnit-only repair now exits 0. The reused-number row stays exit 0 and is now disclosed. The other 28 rows keep their exits and statuses. |
| **`witness-probes.py` (cycle 6), `witness-adjacent.py` and its structured copy (cycle 5)** | All 20 and all 6 and 6 fixtures keep their exits and statuses. |
| **GRS-027, read-only** | `vacuous`, exit 2, `no_owner_targets`. `--allow-empty`: exit 0, status names the flag. |
| **Every real ledger, read-only, base tool versus this one** | Same status for all 39 entries (18 vacuous, 11 findings, 5 no-queue, 3 error, 2 pass), same configuration findings by kind and unit, same repair rows and every earlier summary field equal. No ledger changed. New disclosure: 24 same-document decision repeats across 3 ledgers, 5 of them with titles that still differ after normalisation. |
| **Standalone** | Flat two-file copy from another directory, with program paths denied and with the share, the source clone and both worktree roots denied under `python3 -I`: 126/126, 0 denied-path attempts. The generic `--scratch` run also passes. |
| **Evidence audit** | 863 assertions pass. |

**Limits.**
- **Titles are text.** `titles_differ` compares normalised titles; whether two titles name one decision is a human judgement, and the witness only shows them. Of the real repeats, the differing ones are paraphrases of one decision in the ledgers checked.
- **Forms are found by ID shape.** A heading or declaration that names an owner ID in a shape the grammar does not match at all is still neither a definition nor refused. A `Repairs` sentence naming no unit at all is still not a finding.
- **Semantic fidelity is not checked.** Tokens, IDs and accepted labels do not establish it, so the README's human-review requirement stands. Only Python 3.14.4/Linux was exercised.

**Guard-tool figures above.** The current guard head is `7bcf23d4d527e6e31a55dd36d9e71d096584a6e9`, reported in its own `GUARDTOOL.md`.

**Resources and scope.** Only the tool, its corpus helper, the standalone README and these report companions change. No owner Markdown, live ledger, registry, Decision Log, Spec Lock, `.evidence` or `.gitignore` edit, no `main` push, no pm-mail and no subagent.

Evidence directory: `/mnt/Cursor/archive/PuppetMaster-Evidence/event-authority-20261104/drafts/TOOLS-BATCH1/fix5/`.

| Evidence under that directory | SHA-256 |
|---|---|
| `self-test.json` | `00ac992a9595f398f240a30ae0da5ca9ced6d8652b76bb8c04811ea5c18314ed` |
| `self-test-optimized.json` | `00ac992a9595f398f240a30ae0da5ca9ced6d8652b76bb8c04811ea5c18314ed` |
| `new-regressions-on-base-tool.json` | `aadb260e0066df476497286c7b3548ccb7789b060fec7fb450ec9b861cc485a4` |
| `audit-results.json` | `bda1087696320edcc198fe643e4dcdd7aa719cd83cb74c1421917517b47d3060` |
| `commands.json` | `1d1223c77da46d74b64a6921509d07626b6ef8ee6e7912ec2164fa5f7d043806` |
| `new/cycle5/witness-adjacent.json` | `dd6d615c98932423a51f589e5b99bf2d695eb7fe2b0dcddda2fee6e9eddde3b2` |
| `new/cycle5/witness-adjacent-structured.json` | `500574784b56eca9d458c2384828922180ae8bb27c82150b3421b2a8d053c4ea` |
| `new/cycle6/witness-probes.json` | `953fc6438c0fbd6d6bc2673fe0fbf089587527a7beb931ea44ea7a632480cf28` |
| `new/cycle7/witness-adjacent.json` | `26f528279761c27ba8293c082e661a5b93614b5021f68bdd37a4c4ba7a103719` |
| `base/cycle5/witness-adjacent.json` | `8354c858baa5b7df1ccaf1bbf038bcf1c342238a1e7d8c70a7b3b8961ce9fd28` |
| `base/cycle5/witness-adjacent-structured.json` | `4b6552d25089d592adeaa369fda08ca8a11b113952cafd3868b5b737dd6227ec` |
| `base/cycle6/witness-probes.json` | `04a905829093d3c029a9088cb917a17b3b3f20409864a06345fdd2ff885f9a65` |
| `base/cycle7/witness-adjacent.json` | `3a544ca69c413431d96e6c214ddfef2fca4ad785906ba3610f61e5b32938c7e4` |
| `new/real-ledgers.json` | `b9c05e2549a9f0a56049adf7c67350d5569c83ea7473a1e382499ff028e08065` |
| `base/real-ledgers.json` | `9cd143b32fb4112a33656ea05daa3ba397e98cb9b12ccb4d3197653353226586` |
| `standalone-witness.json` | `00ac992a9595f398f240a30ae0da5ca9ced6d8652b76bb8c04811ea5c18314ed` |
| `standalone-strict-witness.json` | `00ac992a9595f398f240a30ae0da5ca9ced6d8652b76bb8c04811ea5c18314ed` |
| `standalone-scratch.json` | `00ac992a9595f398f240a30ae0da5ca9ced6d8652b76bb8c04811ea5c18314ed` |
| `grs027-current.json` | `f68f216b44be8ad7f0b6d618b04232e1f38eee8726024bd3f454d32787762680` |
| `grs027-explicit-empty.json` | `b5012fc47f06d2d404f04506d3b5d959083f554eb8dbe36c555b0b60fbc1933b` |
| `verify-witness.py` | `6151d0213e02380167ae021a7958daf10006ea94582ce5df0244fd43d82e5a30` |
| `audit-witness.py` | `0768029b3f718fe87fbe26ffa526ddaa4c12c1543ef177dc0bca3f67b3336129` |
| `prepare-witness-report.py` | `42a15df80a25554218a5bae83b412bb1a2488bb4f9d5b021ac90745932549af6` |

## Tool batch 2 (TOOL-ISSUES T32-T36): findings and responses

**C8-W1, C8-W2 and C8-W3 are fixed; none is disputed.** Base: `570100dabcf2b0354910c2d359e2667bce71b8ad`. Both shape findings were hypothetical (no instance in the real owner documents); a false pass on a real ledger blocks, and none changed.

| Finding | Location, cause and fix | Regression evidence |
|---|---|---|
| **C8-W1 — fixed** | `scripts/pm-ledger-compile-witness.py` (`unit_head`, `any_head`, `INDENTED_UNIT_HEAD`, `INDENTED_ID_HEAD`, `SETEXT_UNDER`, `unsupported_forms`). Headings were anchored at column 0 with no wrapper, so `   ## AA-001 — Again`, `## **AA-001** — …` and a setext heading naming a target were neither definitions nor refused. An ATX heading may now be indented up to three spaces and its ID wrapped in `**ID**`, `__ID__` or `[ID]`: it is the same heading, so a second one is a duplicate. Indented and wrapped forms are read only outside fences; column-0 headings keep their reading everywhere, so no real result moves. A setext heading (a paragraph over an `===` or `---` underline) that names a targeted ID is refused as `setext_heading`; a list item or block quote over `---` is a thematic break, and YAML front matter is skipped. | `tb2-indented-heading-duplicate-is-a-definition`, `-bold-wrapped-…`, `-underscore-wrapped-…`, `-bracket-wrapped-…`, `tb2-setext-equals-heading-is-refused`, `tb2-setext-dash-heading-is-refused`: all six exit 0 (pass) on the base tool and are caught now. Controls: `tb2-indented-heading-inside-fence-control`, `tb2-four-space-heading-is-code-control`, `tb2-list-item-over-thematic-break-control`. |
| **C8-W2 — fixed** | `fences_in`, `FENCE_OPEN`, `unit_head`, `any_head`. A fence closed on any line starting with the same three characters, at any indentation, info string or not, and a heading line inside a fence counted as a heading definition, which is what gave the cycle-8 four-backtick fixture its false `ambiguous_owner_unit`. Fences now follow CommonMark: an opener of three or more backticks or tildes indented at most three spaces (a backtick opener's info holds no backtick); a closer of the same character, at least as long, indented at most three spaces, with only spaces after it; an unclosed fence runs to the end. A heading line inside a fence is code, never a definition (a fenced `plan_unit_id` line still is a declaration). | `tb2-closer-with-info-string-does-not-close`, `tb2-shorter-closer-does-not-close` (both refused at the base too, as `plan_unit_id_outside_fence`; now the fence is read whole and the second definition is the finding), `tb2-four-space-fence-is-not-a-fence` (at the base a second definition; now indented code, so its `plan_unit_id` line is outside any fence). Controls: `tb2-longer-fence-holds-a-shorter-one-control`, `tb2-heading-inside-longer-fence-is-code-control` (a false `ambiguous_owner_unit` at the base). |
| **C8-W3 — documented** | `scripts/ledger-compile-witness/README.md`. A `plan_unit_id: AA-001  # comment` line inside a fence is refused as `unparsed_plan_unit_id_line`; the README says so and to put the comment on its own line. The heading and fence rules above are documented there too. | Existing `unparsed-plan-unit-id-line-is-refused`. |

### Rerun results

| Check | Result |
|---|---|
| **Regressions** | **140/140**, exit 0 (126 at the base plus 14 new). `-O` gives byte-identical JSON. `unittest` 7/7. On the base tool the corpus gives 130/140: the 6 C8-W1 shapes falsely pass there, the 3 C8-W2 shapes fail closed with another form, and the heading-in-fence control gives a false finding; the other 4 controls pass on both. |
| **Real ledgers** | All 39 from `origin/main` `0adb197992` (`Plans/ledgers/v2` plus the 96 top-level Plans documents), read-only, base and new witness: **byte-identical scan output** (18 vacuous, 11 findings, 5 no-queue, 3 input errors, 2 pass; configuration findings, W1 rows, W2 and W3 firings). |
| **Whole owner corpus** | Every top-level Plans document with every ID it names targeted: 7,783 definitions, identical `definitions_in` and `unsupported_forms` in all 96 documents. One fence list changes: `FileSafe.md`, where an 8-space-indented ``` line inside a Rust code block used to close the outer fence at line 1256; the outer fence now runs to its real closer at 1270. No definition or refusal changes. |
| **Cycle-7 driver** | `witness_adjacent.py`: 36 rows, unchanged from cycle 8. |
| **Cycle-8 shape probe** | `witness_c8.py`, 8 shapes: the bold, bracket, indented and setext duplicates now exit 2 (exit 0 in cycle 8); the four-backtick fence with an inner closer and heading now exits 0 (a false finding in cycle 8); the indented stray fence, the trailing YAML comment and the two-space fence keep their result. |
| **Standalone, mount denied** | Flat copy (tool and trap helper) under `python3 -I` with the share, the source clone and both worktree roots denied: exit 0, 140/140, 0 denied attempts. |

**Scope.** Witness, trap helper, README and this report. No owner Markdown, registry, Decision Log, Spec Lock, generated shard, index or evidence, `.gitignore`, `main` push, pm-mail or subagent.

Evidence directory: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/TOOLS-BATCH2/witness/` (the scan drivers and their runs).

| Evidence under that directory | SHA-256 |
|---|---|
| `ledgers-base.json` | `92c6a1ed52e7f899fc496f8abf9f8c5baf07b35f959045c6fbdd816c0f6ae3bb` |
| `ledger_scan.py` | `fe8f4b10d840523309f04505dfcd21244cd6d3a16155796ffbabb0f17536dccf` |
| `ledgers-new2.json` | `92c6a1ed52e7f899fc496f8abf9f8c5baf07b35f959045c6fbdd816c0f6ae3bb` |
| `standalone-witness.err` | `0876f7431a3c8f94330d5186b2277cb3165907c88d87ee0338b1cb2d833fa497` |
| `witness-corpus2.json` | `e50fa2909b66a84dddd1a38e031c89032c347f0e1fc94d6c2aa23b8260d17791` |
| `witness_corpus.py` | `37c855086c9710785988ffa814cde872e55c40d1b242b243d4b6924c93192201` |
| `witness-newcases-on-base.json` | `2a92469d3feb79d20ebd1f54871ad3a9be3f656a6b526971758954b73ee7984f` |
| `witness-st-final.json` | `1d1f34369d881ea1999e31b38561f603d52acdf3cccacf33176606be5f57243e` |

## Tool batch 3: findings and responses

**TOOLBATCH2 pre-check finding 4 is fixed; nothing is disputed.** Base: `2a16722ca4`. Fix: `616c08e5b8` on `plans/tools-batch1-20261105`. The finding is HYPOTHETICAL: none of these shapes occurs in a real Plans document, before or after.

| Finding | Location, cause and fix | Evidence |
|---|---|---|
| **4: CommonMark containers and HTML blocks — fixed** | `blocks_in`, `list_item_column`, `container_heading`, `fences_in`, `definitions_in`, `unsupported_forms`. The witness read fences without list items and had no HTML blocks: a list-item fence closed by a column-0 fence line, and a unit heading inside an HTML block or comment, made phantom units (the false-pass direction); a heading after a list-item fence was missed; a heading inside a list or blockquote was neither parsed nor refused. Now fences and HTML blocks are read in document order: a fence opened in a list item (on its marker line or a continuation line) is indented relative to the item's content column and ends with the item, at the first line indented less than that column; when that line is a fence closer (a closer less indented than its item), CommonMark opens a new fence there and the form is refused as `list_fence_closer_outdented` if the lines after it name a target. An HTML block (CommonMark's seven kinds, from its start to its end condition) holds no fence or heading, and a unit heading inside one is refused as `heading_in_html_block`. A unit heading in a blockquote or a list item is refused as `heading_in_blockquote` or `heading_in_list_item`. | The pre-check's 27 shapes against markdown-it-py 3.0.0's commonmark preset: 6 mismatches on the base, **0 now** (`shapes-base.txt`, `shapes-fix.txt`). 10 new regressions, 7 refusals and 3 controls (`tb3-*`); on the base 5 refusals pass falsely and 2 give an unrelated ambiguity finding (`newcases-on-base.json`). |

### Rerun results

| Check | `2a16722ca4` | Now |
|---|---|---|
| Self-test | 140/140 | **150/150**; the standalone flat copy with the share and worktrees denied: 150/150, 0 denied attempts |
| Real ledgers (`ledger_scan.py`, all 39) | vacuous 18, findings 11, no-queue 5, error 3, pass 2 | **identical**, row by row (`ledgers-fix.json` = `ledgers-base.json`) |
| Every Plans Markdown file of the branch (3,607, ledgers and evidence left out) | witness and CommonMark agree on 14,943 unit headings | **the same**: 0 phantom, 0 missed, 0 setext (`docs-fix-full.json` = `docs-base-full.json`) |

Evidence: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/TOOLS-BATCH3/witness/`.

| File | SHA-256 |
|---|---|
| `shapes.json` (the pre-check's) | `605a3ec529d957562b6020191a9b6eb17b405bb5951d443e4cec293af180334f` |
| `shapes-base.txt` | `8d44f3c9ab9cbc4e04d3135fed5e852fef00f02463c8b65040a6893172557aba` |
| `shapes-fix.txt` | `74e26d0841b1e6f8a4608a62e103e24bda3ff56f97d3d58a11bbb3ab75fb18cc` |
| `newcases-on-base.json` | `e9af86ec1aa6e42b7c3ffde1dfda0f2de36bf4fc248ce070c7929dc05c69c15b` |
| `ledgers-fix.json`, `ledgers-base.json` | `6721d5ebb48e3a61c489bccf6b7b2ed36f25ea77c6a39e1e6621a65380fbced6` |
| `docs-fix-full.json`, `docs-base-full.json` | `227846cbf3a7183fdb96d317c4c17293be916acdac68598c456a99d71d8986b4` |

## Tool batch 4: findings and responses

**REVIEW-etools-tb3-opus findings 3 to 6 (TOOLBATCH4 T62) are fixed; nothing is disputed.** Base: `253cc695fe`. Fix: `87524d99f7` on `plans/tools-batch1-20261105`. Every finding is HYPOTHETICAL: none of the shapes occurs in a real Plans document, before or after.

| Finding | Location, cause and fix | Evidence |
|---|---|---|
| **3: three phantom unit headings, one new on the base — fixed** | `list_item_column`, `blocks_in`. (a) A line indented less than an item's content column after a blank line ends the item, as CommonMark says; the walk back now tracks the least indentation seen after a blank line and returns no item when it falls short (`f-list-ended-by-underindent-then-fence`, the one `616c08e5b8` made new). (b) The `paragraph` state is set only by paragraph text: a thematic break, an indented-code line outside a paragraph, a fence closer and an HTML block leave no paragraph open, so a lone tag line after them starts a kind-7 HTML block (`h7-after-thematic-break`, `h7-after-indented-code`). | Traps `tb4-underindented-line-after-blank-ends-the-item`, `tb4-html-tag-after-thematic-break-is-raw-html`, `tb4-html-tag-after-indented-code-is-raw-html`. |
| **4: three CommonMark unit headings neither read nor refused — fixed** | `_indent`, `QUOTE_MARK`, `list_item_column`. Tabs now count to 4-column stops before any indentation arithmetic, and `>` followed by a tab is read as CommonMark reads it, so `>\t## …` and a tab-indented heading in a list item are seen; both are then refused (`heading_in_blockquote`, `heading_in_list_item`), as every heading in a container is. A lazy continuation line at column 0 no longer stops the walk back, so an item fence after it stays an item fence and the real heading it hides is read (`f-list-lazy-then-fence`). | Traps `tb4-heading-after-quote-and-tab-is-refused`, `tb4-tab-indented-heading-in-list-item-is-refused`, `tb4-lazy-line-keeps-the-item-fence`. |
| **5: an HTML end condition on the start line was searched only after the start marker — fixed** | `blocks_in`, the `HTML_ENDED` loop. The end condition is searched on the whole start line, as markdown-it-py does, so `<!-->`, `<!--->` and `<?>` end on their own line. | Traps `tb4-empty-comment-ends-on-its-start-line`, `tb4-processing-instruction-ends-on-its-start-line`. |
| **6: text inside an HTML block counted as unit prose — fixed** | `prose()`. HTML-block lines that `blocks_in` finds are dropped from the text tokens are matched against, so a token only inside `<!-- … -->` no longer passes witness 2 or 3. | Trap `tb4-token-only-in-html-comment-is-not-prose`; control `tb4-token-in-prose-beside-a-comment-control` (a token in prose next to a comment still credits). |

On `253cc695fe` the 9 refusal traps fail (8 pass with no finding, `tb4-underindented-line-after-blank-ends-the-item` gives the wrong status) and the control passes (`newcases-on-base.json`). **Soundness:** nothing widens. The lazy-continuation rule makes the walk pass column-0 lines that CommonMark continues the item with; it can only turn a top-level fence the base read into the item fence CommonMark reads, and the trap above shows the heading that fence hid is now read, not credited away.

### Rerun results

| Check | `253cc695fe` | Now |
|---|---|---|
| Self-test | 150/150 (151/160 with the new traps) | **160/160** |
| The review's shapes (`shapes-tb3.json`, 57) against markdown-it-py 3.0.0's commonmark preset | 16 mismatches | **0 read differently**; 2 headings CommonMark renders are refused (`q-tab-heading`: `heading_in_blockquote`, `l-heading-tab-continuation`: `heading_in_list_item`), as every container heading is |
| Real ledgers (`ledger_scan.py`, all 39) | 39 rows (`ledgers-base.json`) | **identical**, row by row (`ledgers-fix.json` = `ledgers-base.json`) |
| The 110 Plans docs (`cm_docs110.py`) | not rerun (the review's replay: 7,652, 0 phantom, 0 missed) | witness and CommonMark agree on **7,652** unit headings: 0 phantom, 0 missed, 0 setext; 69 HTML blocks each, all comments; 0 tab-led container headings |

Evidence: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/TOOLS-BATCH4/witness/`.

| File | SHA-256 |
|---|---|
| `shapes-tb3.json` | `9316f33fb7944f924baa9435277d593c1edc2b42e99939ba34cfc1fb3aa4a6de` |
| `shapes-base.txt` | `e502e11121faa5ea2345dc7273160a09db8cb49cb3144929c03e5e11aa43e182` |
| `shapes-fix.txt` | `2ca5a3773d0c441a21d15df8c64b38571e53db6965a9e90f30c6498802873d87` |
| `newcases-on-base.json` | `41c341f2e6b7414922ba12a5871e5ae89ec7040ba443ccbe660b3f7d08813996` |
| `ledgers-fix.json`, `ledgers-base.json` | `6721d5ebb48e3a61c489bccf6b7b2ed36f25ea77c6a39e1e6621a65380fbced6` |
| `docs110-fix.txt` | `fde193d50d1840de53bd03e6d0c2778e54ccc1862134de8c6be87565833f628d` |

## Tool batch 5: findings and responses

**TOOLBATCH4 pre-check finding 3 (TOOLBATCH5 T86) is fixed; nothing is disputed.** Base: `86de8bb6d0`. Fix: `d9b60107c7` on `plans/tools-batch1-20261105`. HYPOTHETICAL: constructed documents only; no real Plans document holds the shape, before or after.

| Finding | Location, cause and fix | Evidence |
|---|---|---|
| **3: seven phantom unit headings, new on `86de8bb6d0` — fixed** | `list_item_column` and the new `_item_paragraph_open`. T62's lazy-continuation rule continued a list item past a column-0 line after any non-blank line; CommonMark continues only open paragraph text. After indented code, an ATX heading, a fence closer, an empty item marker, a setext underline, an HTML-block line or a thematic break inside the item, a column-0 line ends the list, so an item-indented fence after it is top-level and the unit heading inside it is code. Each column-0 line the walk passes must now follow open paragraph text of the item, read by a forward pass over the item's lines with the CommonMark block rules. | Traps `tb5-column0-line-after-{indented-code,atx-heading,fence-closer,empty-item,setext-underline,html-block,thematic-break}-in-item-ends-the-list`; control `tb5-column0-line-after-paragraph-text-keeps-the-item-fence`. |

On `86de8bb6d0` the seven traps fail (161/168) and the control passes (`selftest-base-86de8bb6d0-with-tb5-traps.txt`). **Soundness:** this narrows the T62 rule only. A column-0 line now continues an item only after open paragraph text, which is every continuation the T62 rule made that CommonMark also makes; the two shapes where batch 4 credited the token to the unit above (`lazy-after-atx-in-item`, `lazy-after-setext-in-item`) go back to the base's reading, a credit mismatch beside no phantom.

### Rerun results

| Check | `86de8bb6d0` | Now |
|---|---|---|
| Self-test | 160/160 (161/168 with the new traps) | **168/168** |
| The review's 50 shapes (`shapes-tb4.json`) against markdown-it-py 3.0.0's commonmark preset | 11 mismatches, 8 phantom (7 new) | **6 mismatches, 1 phantom**: the seven gone; left are finding 4's pre-existing shapes (`under-nested-outer-continues-fence-at-2` missed, `h7-after-link-ref-def` phantom, two comment-in-container credits) and the two credit-only shapes above |
| TB3's 57 shapes (`shapes-tb3.json`) | 2 mismatches (credit only), 0 phantom | **the same**, byte for byte (`shapes-tb3-t86.txt` = TB4's `shapes-fix.txt`) |
| Real ledgers (`ledger_scan.py`, all 39) | `ledgers-fix.json` | **byte-identical** (`6721d5eb…`) |
| The 110 Plans docs (`cm_docs110.py`) | 7,652 agree | **7,652** unit headings agree: 0 phantom, 0 missed, 0 setext; 69 HTML blocks each (the output is byte-identical to TB4's, `fde193d5…`) |

Not done here: finding 4 (pre-existing, not in T86's row). Evidence: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/TOOLS-BATCH5/witness/` (`SHA256SUMS`).
