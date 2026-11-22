# Admission merge 3A: landing record

Stream E, PNC-019, 2026-11-21. Merge 3A lands the post-landing repairs to admission merge 2 on their own, as Jared chose on card E16-1. DG5's five Goal families are not part of it; they follow as their own merge.

## Landing note (merge 3A)

**What lands:**
- **Merge 3A content:** 145 family corrections under DL-2451 through DL-2595, each with its own Decision Log entry, DL-077 record revision and immutable correction witness under `reports/event-authority-20261116/admission-merge-3/corrections/`. Also DL-2450 (the FileSafe Application count bucket), DL-2597 (Case L-3: queue and tool histories outside a Project) and the two SafePoint corrections DL-2598 and DL-2599. Further changes:
  - the date-time snapshot rule and history rule;
  - the policy-scoped retention count checker;
  - the measured date-time exclusion re-pins.
- **Registry:** `Plans/event_family_registry.json` keeps its 518 families in the same order, at revision `2026-11-19.145`. No admission or grade verdict is added. DG5's five Goal families (`goal.cancelled`, `goal.updated`, `goal_run.cancelled`, `goal_run.certified`, `goal_run.started`) are unapplied: their rows equal merge 2's landing.
- **Reviewed head:** `75e1b89f76361213cf66d593dfbc93bbdbbadf9d` on `plans/ea-merge3-postfix-20261119`, kept by tag `archive/ea-merge3a-reviewed-75e1b89f76`.
- **Landed from:** the resolution head `bd9e90d25ddcd013ce76a7a9b97c947cf6b24c2b` on `plans/ea-merge3a-tib-resolve-20261121`, kept by tag `archive/ea-merge3a-resolve-bd9e90d25d`. It merges pm7-perf's scripts tool-issues batch (`b19f171724`) into the reviewed head. That batch and merge 3A both changed `scripts/pm-ea-admission-writer.py`: pm7-perf's T265 retention-subject check and merge 3A's finding-4 expansion.
  - **Writer:** `30739c8af3` runs T265's check on the citation as given before merge 3A's expansion, and again on the expanded quote.
  - **Date-time repin:** the head carries pm7-perf's date-time repin `bdb06e27d4`, with pm7-perf's consent. It repins the `Plans/event_number_recipe_corpus.json` exclusion at the scanner's own hash.
- **Lander:** `ea-land-merge3a`, holding the landing lock. T274, the landing-check fix this landing needs, landed first on its own as `main` `2b83b7143f`.
- **No reseal:** `Plans/Spec_Lock.json`, `Plans/.evidence/**` and `Plans/auto_decisions.jsonl` are unchanged.
- **Native execution:** NOT_RUN. Every result here is static contract, oracle or planning evidence.

### Reviews

| Review | Target | Verdict |
|---|---|---|
| GPT-6.2 Astra, reasoning max (final pair) | `75e1b89f76` | **LANDING_READY_WITH_NOTES** after T274 lands. 145 OK, 0 HOLD in DL-2451 to DL-2595; DL-2598 and DL-2599 pass. No REAL finding. T274 itself: LANDING_READY. |
| GPT-6.2 Sol, reasoning max (final pair) | `75e1b89f76` | 145 OK, 0 HOLD; DL-2598 and DL-2599 pass. Its only REAL item is that the landing checker then on `main` exited 2 on one closure-registry row it marks stale; T274 fixes that, and Sol judged T274 LANDING_READY. |
| Claude Opus 5.5, reasoning high (cheap recheck R3) | `d40290457b` | NOT_CLEAN, 8 OK, 0 HOLD, 2 REAL: the two SafePoint Application unions lacked their count citation. Fixed by DL-2598 and DL-2599. |
| Claude Opus 5.5, reasoning high (cheap recheck R3B) | `13684fdf6d` | **CLEAN_WITH_NOTES**, 0 REAL. Its Windows numeric run added 7 line-ending diagnostics. The Linux rerun matched the approved 35. |
| Claude Opus 5.5, reasoning high (resolution review) | `bd9e90d25d` | **CLEAN_WITH_NOTES**, no REAL finding. Notes below. |

Reports under `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/reviews/`, with their SHA-256:

| Report | SHA-256 |
|---|---|
| `MERGE3A-R3FINAL-astra62max/REVIEW.md` | `7de08b4a6ae51fb982c574cfcf576c5dbc58bb3d03a4a656cfb0cc4fe7f49410` |
| `MERGE3A-R3FINAL-sol62max/REVIEW.md` | `5ee8e26eaa229f705faaaaf6d262ec389b54784dfc72cef7fc33cf39d5f0fec4` |
| `MERGE3A-R3-opus55high/REVIEW.md` | `4b767a7ffcd1e4cb3f32ec541f19ef29390655a5e99cd63bcc798fa4305271e8` |
| `MERGE3A-R3B-opus55high/REVIEW.md` | `98995c78d9797e931312f58d44dec2cdc581e39fc541652140d32222ff00607f` |
| `MERGE3A-RESOLVE-opus55high/REVIEW.md` | `9a8eae1270c2261ad5385b6277cb58c00517dbca4b14e066411be1da745f5ca5` |

**Resolution review notes:**
- **N1:** 124 of merge 3A's 207 expanded retention citations will take T265's narrower `quote_scope`, the family's own assignment paragraph, at the next evidence refresh with the merged writer. The committed bytes are unchanged and no check reads that field.
- **N2:** 15 objects merge 3A touched are re-pin-only maintenance of merge-2 citations already on E's T265 reissue list: line shifts and file hashes, with path, unit and quote unchanged. No merge 3A-authored citation is refused.
- **N3:** numbers-only is 583/583 at the resolution head. The resolution worker's report gives 580/580, which is merge 3A alone; the 3 added cases are T150 and T151 from pm7-perf's batch.
- **Context:** `main`'s own date-time gate was red at `39efb1fcaf`, with 525 failures beginning with an exclusion that cited a pruned snapshot. The resolution head's repin brings it to 524 nodes, 0 unclassified, 0 failures.

### Jared's decisions

| Decision | Jared's words | Source |
|---|---|---|
| EA-P1 A | "Add each once its definition passes every check" (signed, Status tab, Nov 14) | `decision-answers/ANSWERS_EA-P_20261114.md` (SHA-256 `8f8c89d237c83fa265aa2baeebd041b657e757014a3a806aff451efb6641f1ac`) |
| E13-1 B | "One review (Sol 6.2 max), then land; Astra right after landing"; his word in chat: "B" | `decision-answers/ANSWERS_E-CARDS-13_20261118.md` (`72bce9f4066f119d331d562e7136e3239f836340a1c78068fe8d6991fbb7e59e`) |
| E15-1 A, recorded as DL-2450 | In chat, quoting option A ("their own whole-app allowance: 7 years, 2,000,000 records, with new ones refused when it's full"): "this" | `decision-answers/ANSWERS_E-CARDS-15_20261119.md` (`9c8e2bcbdc952a74f3ed9828d6d07004934f3da4f1fe3f836b2c4a6b6f2f2404`) |
| E16-1 A | "Land the repairs on their own as soon as they pass review" (signed, Status tab, 2026-11-20T13:38:31.347Z) | `decision-answers/ANSWERS_E-CARDS-16_20261120.md` (`ab1d8e2159c43546b8cdb91a9d3a9bf24b9f5af448278b6872335af033c4fcc8`) |
| E17-1 A, recorded as DL-2597 | "Each history gets its own whole-app limit" (signed, Status tab, 2026-11-20T20:26:03.747Z, no added words) | signed answer `vm.pm-ea-lead--E17-1`; copy at `drafts/PNC019/merge3-postfix/evidence/deep-pair-r3/dt-signed-answer.json` (`8251b2e7cb72156bb289ca8fdf1bdd3ffe7c22b8509b786ffe129f6dafd24298`) |

### Merge of newer `main`

The resolution head merged `main` `39efb1fcaf`. Since then `main` moved six commits to `b33b3c34c7`:
- `2b83b7143f`: T274, the landing-check fix;
- `134bbcfbd9` and `67c571f0cd`: C's T273 audit-closure checker batch (T282 to T285);
- `508625739e` and `b3a0ccaa74`: short delta part 1, four re-audit rows and the regenerated audit status index;
- `b33b3c34c7`: the plan-migration snapshot `pds-20261121-004` and the landing-check baseline.

- **Merge:** `git merge --no-ff b33b3c34c7` into `bd9e90d25d`, as `4904c0d625`.
- **Conflicts:** none. No file changed on both sides outside the derived paths.
- **Regeneration:** first the 15-file currentness edition `Plans/.audits/event-authority-2026-08-13-currentness/` was copied in from the shared checkout, SHA-256 identical. Then `pm-shard-plans.py --generate`, `pm-plan-index.py generate` and `pm-shard-plans.py --check`, which passed with 99 sources. The index generate rewrote only `generated_at_utc` in `coverage_report.json`, `dependencies.json`, `doc_cards.json` and `node_readiness_report.json`; those were restored. No shard changed.

**Preservation proof,** at blob level with rename detection off and deletions included. Evidence: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/landing/merge3a-20261121/merge-final/`.

| Against | Set | Result |
|---|---|---|
| resolution head `bd9e90d25d` | 976 non-derived paths it changed against its base `39efb1fcaf` | 976 equal |
| resolution head `bd9e90d25d` | 26 non-derived paths `main` changed since `39efb1fcaf` | 26 equal `main` |
| resolution head `bd9e90d25d` | derived paths | every one equals one side; none equals neither |
| reviewed head `75e1b89f76` | 976 non-derived paths it changed against its base `a45c1a0362` | 972 equal. Two are clean three-way merges with `main`'s change: `pm_event_datetime_mutations.json` and `pm_event_datetime_selfcheck.py`. Two differ by the resolution: `scripts/pm-ea-admission-writer.py` (the composition above) and `scripts/pm_event_datetime_exclusions.json` (one row, the `bdb06e27d4` repin). |

The 145 corrections, DL-2450, DL-2597, DL-2598 and DL-2599 are intact at the new head, against the reviewed head:

| Artifact | Result |
|---|---|
| Registry | file bytes equal; 518 families, same order, revision `2026-11-19.145` |
| Decision Log entries DL-2450, DL-2451 to DL-2595, DL-2597 to DL-2599 | 149 present, 149 equal (section text); file bytes equal |
| DL-077 records the branch changed | 299 present, 299 equal |
| Merge-2 depth and revision files the branch changed | 299 and 8, all equal |
| Correction witnesses (`admission-merge-3/`) | 147 present, 147 equal |
| DG5's five Goal families | rows equal merge 3A's base and merge 2's landing `10ba97e699`: unapplied |
| `Plans/Settings_System.md`, `Plans/settings_inventory.json` | equal `main` (P's Settings batch) |

### Checks at the merged head

Each check below was re-run on the merged head `4904c0d625`, with the command APPLY's report used. The date-time gate and the numeric runs used a clean clone that holds only tracked files plus the 15-file currentness edition, as APPLY's runs did. The other checks ran in the full landing worktree. Evidence: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/landing/merge3a-20261121/checks-final/` and `dtnum-final/`.

| Check | Command | At the merged head | APPLY at `75e1b89f76` |
|---|---|---|---|
| Shards | `pm-shard-plans.py --check --config Plans/sharding_config.json` | pass, 99 documents | pass |
| Index | `pm-plan-index.py validate`; `pm-plan-index.py generate` | validate passes; regenerating changes 4 files in `generated_at_utc` only | the same |
| Retention | `pm-ea-retention-citation-check.py --self-test` | 299 families, 0 gaps, 0 findings; 10 standing negatives killed; 929 controls, the 20 survivors all "restore complete received retention cell" | 299/0, 10, 929, 20 |
| Owner sweep | `pm-ea-owner-sweep.py --self-test` | 299 families, 0 findings | 299/0 |
| Date-time gate | `pm_event_datetime_inventory.py` | pass: 524 nodes, 0 unclassified, 0 failures. `pds-20261121-003` and `pds-20261121-004`, both runs `current_run.json` lists, each have 115 fresh, 151 history and 0 refused copies | 524/0/0 |
| Numbers only | `pm_event_numbers.py --self-test --scope numbers` | 583/583, 0 failures | 580/580 (+3: T150, T151) |
| All-scope numbers | `pm_event_numbers.py --self-test --scope all` | raw exit 1: 13,629/13,629 cases; exactly the 35 approved diagnostics; all 1,430 reference results, all 29 approved snapshot keys true; 288 date-time nodes | 13,626; 35; 1,459 checks |
| Frozen check | the independent validator, with `PM_EA_RECOUNT_SOURCE_MAP` set to `drafts/CA-SEAL2/resume/source-locations.json` | admits 479 post-August families, the same as merge 2's landing; its one error is the recorded `fresh_census_denominator_not_closed`. Its receipt was restored after the run | merge 2: 479, the same error |

**Differences from APPLY, all from pm7-perf's batch:**
- **Cases:** the 3 added cases are `payload-crlf-original-id` and `payload-crlf-normalized-id` (T150) and `jcs-current-1e-9999` (T151).
- **Checks:** the 3 added checks, all true, are `datetime_eventrecord_comma_fraction_refused`, `datetime_unit_composition_terminal_z_diagnostics` and `datetime_nested_preloaded_terminal_z_diagnostics`.
- **Unchanged:** no case, diagnostic or check was removed or changed. These match the resolution review's results.
- **Where they ran:** in the full worktree the date-time gate refuses with `scan_exclusions_invalid`, because it reads the ignored PNG inputs the landing check needs. That is why the date-time and numeric runs use the clean clone.

### What comes after

- **Landing check** at this note's commit, in a clean full local worktree, against the fetched `origin/main` SHA, then the fast-forward and push of `main`.
- **Follow-up:** `pm-plan-migration.py snapshot-current` and `pm-landing-check.py --record-baseline` as one commit. Then the date-time gate again on that tree.
- **Reseal request:** the governance staleness the landing check reports goes to Jared in `/mnt/Cursor/share/puppet-master/2026-11-04-program/streams/E-RESEAL-MERGE3A.md`, with both final reviews' reseal requests. The reseal is a separately assigned task, not this landing's.
