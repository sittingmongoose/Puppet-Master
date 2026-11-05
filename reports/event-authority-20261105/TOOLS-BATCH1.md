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
