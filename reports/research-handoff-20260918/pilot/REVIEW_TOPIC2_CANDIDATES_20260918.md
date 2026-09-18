# Azure DevOps candidate verdicts — confirmation review of the Part 1 record

I am an Opus 5 agent. I did not produce this record, ran no arm and did not adjudicate the union. Everything below
is read-only: I wrote nothing under `~/PM-Experiments/topic2-20260917/`, nothing under
`~/PM-Experiments/topic2-candidates-20260917/`, and nothing in `/mnt/Cursor/PuppetMaster`.

Reviewed: `~/PM-Experiments/topic2-candidates-20260917/` — `README.md`, `topic2-part1-verdicts.json`, `manifest.json`
(internal digest `14c0cbce5a70965e…`, confirmed) — produced from `BRIEF_TOPIC2_CANDIDATES_20260917.md` against the
union at `~/PM-Experiments/topic2-20260917/adjudication/topic2/`, whose bundle sits on
`research/topic2-adjudication-20260917` at `3fcfde3e3b`.

**One change: `NEW-01` must be withdrawn.** Everything else in the record I confirm.

---

## The one change

### NEW-01 — **withdraw**. The contradiction does not exist, and the proposed repair would be a regression.

NEW-01 states: "`repository_locator.project` is typed `{type: [string, null]}` while sitting in the required list, so
a `repository_binding` can carry an explicit null project today and still validate — a direct contradiction of
ADO-001 'Project is mandatory'." Its repair: "Drop null from the type. Two characters."

The premise about the base type is right. The conclusion is wrong, because `repository_binding` carries a conditional
the record did not reach:

```
$defs.repository_binding.allOf[0]
  if:   {"properties": {"provider": {"enum": ["azure_devops", "bitbucket_data_center"]}}}
  then: {"properties": {"repository_locator": {"properties": {"project": {"$ref": "#/$defs/non_empty_string"}}}}}
```

I tested it. Taking a valid `repository_binding` and setting `repository_locator.project` to `null`, then sweeping
the provider through all nine members of the `provider` enum:

| provider | `project: null` |
| --- | --- |
| `azure_devops` | **rejected** at `allOf/0/then/properties/repository_locator/properties/project/type` |
| `bitbucket_data_center` | **rejected**, same path |
| `github`, `gitlab`, `bitbucket_cloud`, `forgejo`, `gitea`, `generic_host`, `cursor_origin` | accepted |

So for Azure DevOps — the only provider ADO-001 governs — an explicit null project is already rejected today. ADO-001
is enforced. There is no contradiction to repair.

The proposed two-character repair would be actively harmful. Dropping `null` from the base type forces a project
string onto the seven providers that have no project layer between organization and repository, and would
immediately invalidate the shipped `provider_neutral_repository_binding` positive (provider `gitlab`) and the Forgejo
and Gitea positives in `forge_integration_contract_fixtures.json`. The nullable base plus the Azure/BDC narrowing is
not sloppiness; it is how the corpus says "project is mandatory where the provider has projects".

The record's supporting observation — that the shipped negative
`azure_devops_repository_cannot_drop_project_identity` omits the key rather than nulling it — is factually correct
and was a good instinct. But omission and nulling are caught by two different mechanisms, and both already work: the
omission fixture is rejected at `properties/repository_locator/required`, and a nulled project is rejected at the
conditional. A second negative that nulls the key would be a reasonable completeness addition to the Azure fixture
pack, and that is the most this observation supports. It is not a canon correction.

Worth saying plainly: this is the same reading error the record itself caught in the union's TA-007 claim — reading a
conditional's `properties` without checking what else constrains the field. There it read `properties` and correctly
noticed the missing `required`; here it read `properties` and missed the conditional. That symmetry is worth carrying
into Part 2 as a standing check: for any claim about a field's admissible values, enumerate every `allOf` branch that
mentions it before concluding.

**Effect on the counts:** 26 corrections to land stands unchanged, because NEW-01 was recorded as an additional
finding attached to TA-033, not as one of the 26. TA-033 itself is unaffected and I confirm it below.

---

## Verdict per candidate

All 32 union propositions, in the record's ranking order. "Confirm" means I accept the record's verdict; where I
tested the underlying claim mechanically I say so.

| # | verdict recorded | mine | basis |
| --- | --- | --- | --- |
| TA-038 | correction to land | **confirm — tested** | Azure fixture file holds exactly two `provider_adapter_profile` positives and one negative; the forge pack's only `review_revision` is `review-revision:mr-14:v3` (provider gitlab) while its azure_devops `pipeline_projection` points at `review-revision:azure-pr-8:v2`, which does not exist |
| TA-008 | correction to land | **confirm — tested** | neither Azure profile's `required_capabilities` (`repository, review, checks, transport`) nor `optional_capabilities` contains `review_versions`; the token appears nowhere in either profile |
| TA-010 | correction to land | **confirm — tested** | same, for `repository_policy`; `checks` IS declared in both, which is exactly why `repository_policy` being absent is a distinct gap |
| TA-022 | correction to land (merged) | confirm | see the merge section |
| TA-023 | correction to land (merged) | confirm | " |
| TA-024 | correction to land (merged) | confirm | " |
| TA-018 | correction to land (merged) | confirm | " |
| TA-019 | correction to land (merged) | confirm | " |
| TA-020 | correction to land (merged) | confirm | " |
| TA-021 | correction to land (merged) | confirm | " |
| TA-034 | correction to land | **confirm — tested** | `TFVC` occurs 0 times in `Plans/Azure_DevOps_Integration.md`, 2 times in `Forge_Integrations.md`, 6 in `forge_backup_tsnet_acceptance.json` — required elsewhere, never mentioned by the owner |
| TA-001 | correction to land | confirm | promise and internal inconsistency both on main; provider leg verified as PV-03/PV-04 |
| TA-005 | correction to land | confirm | `review_revision` is `additionalProperties:false` with no completeness field; truncation conventions verified as PV-06/PV-08 |
| TA-007 | correction to land, restated | **confirm — tested** | see the union corrections |
| TA-035 | correction to land | confirm | |
| TA-003 | correction to land | confirm | |
| TA-004 | correction to land | confirm | |
| TA-009 | correction to land | confirm | |
| TA-011 | correction to land, restated and re-lanes | **confirm — tested** | see the union corrections |
| TA-012 | correction to land | confirm | |
| TA-013 | correction to land | confirm | |
| TA-016 | correction to land | confirm | |
| TA-017 | correction to land, citation corrected | **confirm — tested** | see the union corrections |
| TA-025 | correction to land | confirm | |
| TA-026 | correction to land | confirm | |
| TA-029 | correction to land | confirm | |
| TA-030 | correction to land | confirm | |
| TA-032 | correction to land | confirm | |
| TA-033 | correction to land | **confirm — tested** | the repository carries both `repository_slug` and a required `provider_repository_id`; the project carries only a name, and `provider_project_id` returns zero files corpus-wide, while the policy artifact template needs `{projectId}` |
| TA-036 | correction to land | confirm | |
| TA-042 | correction to land, re-owned out of Azure | **confirm — tested** | `provider_matrix_profile` has exactly 14 properties, all 14 required, `additionalProperties:false`, and not one of FGI-015's seven named facts is among them; `provider_adapter_profile.auth_methods` is a flat enum array; the criterion is verbatim at `Plans/Forge_Integrations.md:880` |
| TA-002 | reclassified — decision card | **confirm** | see below |
| NEW-01 | new correction | **CHANGE — withdraw** | see above |

Arithmetic checks out: 32 examined, 31 correction-shaped, 1 reclassified; two merges fold 7 into 2, so 31 − 5 = **26
to land**. Lane split: 12 in the Azure owner or its fixtures, 13 in the common forge contracts, 1 re-owned — 26. I
counted the table independently and reached the same three numbers.

---

## The three union corrections

All three are right, and I reproduced each one mechanically on current `main`.

**FALSE-01 (TA-007) — confirmed.** The union claimed `command_target` "already requires
`left_review_revision_ref` AND `right_review_revision_ref`" for `cmd.forge.review.version.compare`. The branch is
`$defs.command_request.allOf[8]`, and its `then` is exactly:

```json
{"properties": {"target": {"properties": {"left_review_revision_ref": {"$ref": "#/$defs/non_secret_ref"},
                                          "right_review_revision_ref": {"$ref": "#/$defs/non_secret_ref"}}}}}
```

The string `required` does not occur anywhere in that branch. The union's claim is false as written; the record's
weaker restatement — the corpus carries both fields and the compare conditional names them — is exactly right, and
its consequence (the defect now rests on the FGI-004 promise alone, and the contradiction sentence must be rewritten
before landing) follows.

**FALSE-02 (TA-011) — confirmed, and the record understates it.** `disabled_reason_code` has exactly 54 members and
`error_code` exactly 58, matching the record's counts. `missing_scope` is in both. `pipeline_disabled` is in neither
and does not occur anywhere in the forge schema. So the union's "which ARE enum members" is false for one of its two
examples.

The record says "at least two of three non-Azure declarations are also off-enum". I checked every
`unsupported_reason_codes` declaration in the corpus against the union of both enums, and the true picture is
stronger: **every non-empty declaration has at least one off-enum code** — Azure (`organization_access_denied`,
`project_access_denied`, `policy_scope_missing`), Bitbucket (`workspace_access_denied`, `plan_limit`,
`pipeline_disabled`; and on Data Center `host_not_in_signed_catalog`, `license_limit`,
`pipelines_not_a_data_center_capability`), GitLab (`tier_limit`, `license_tier_limit`,
`dedicated_release_unsupported`, `host_not_in_signed_catalog`) and Cursor/Origin (all three). The field is
`{"type": "array", "items": {"$ref": "#/$defs/non_empty_string"}}` — genuinely unchecked. The record's conservative
phrasing is not an error, but whoever lands this should know the defect is universal, which reinforces its
conclusion that the repair belongs in the common schema rather than the Azure owner.

**CITE-01 (TA-017) — confirmed.** The DL-054 flag-and-cursor tokens are at `Plans/Source_Control_System.md:1114-1123`
(`parent_refs_truncated`, `parent_expansion_cursor_ref`), `:1167` (`preserved_exact_tokens`) and `:1172` (the "Do not
present a truncated parent list as complete" negative constraint), and in `Plans/Decision_Log.md` at `:3760-3761` and
`:3844` — every line number the record gives. The union's cited `:1085-1094` lands in SCS-017's canonical text and
header, about 29 lines early. Substance holds, citation corrected.

---

## The two merges

**`C-CHECKS-BINDING` (TA-022 + TA-023 + TA-024) — confirm.** All three turn on one missing thing: a declaration of
*what a check row's status is bound to*. TA-022 is the contract demanding a head-OID key Azure's evaluations endpoint
cannot accept; TA-023 is the corpus being unable to say which of two families a row came from, one revision-bound
(per-iteration statuses, released at api-version 7.1) and one review-bound (policy evaluations, which cannot be
head-scoped at all); TA-024 is the head OID being the wrong key even when present, because Azure evaluates the merge
and the evaluation Context carries `lastMergeCommitId` / `lastMergeSourceCommitId` / `lastMergeTargetCommitId`. One
repair — a declared binding kind per row, plus the merge triple instead of a head fence for the review-bound family —
closes all three. Same defect.

**`C-CHECKS-CARRIER` (TA-018 to TA-021) — confirm.** All four are missing fields on the same absent object: TA-018 the
carrier itself (`pipeline_projection.checks` is an array of opaque refs and the `Check` record_kind is specified but
unexercised by any fixture), TA-019 the required-versus-advisory field on it, TA-020 the status vocabulary and
forbidden-mapping rule, TA-021 the source-enum field that keeps `GitStatusState.notApplicable` (bypasses the
requirement) apart from `PolicyEvaluationStatus.notApplicable` (does not apply). Four edits to one record. Same
defect.

One observation for Part 2, not a change: the two clusters are adjacent — BINDING is about what a status refers to,
CARRIER about the record existing with the right fields — and a lander may well find they are one contract change in
practice. Keeping them separate is the more granular and honest split; the count is not inflated either way.

---

## The reclassification

**TA-002 — confirm.** The defect is real and its provider basis is verified (PV-01: `IterationReason` is bit-valued
with `Push = 0` and exactly seven values; PV-02: the reference client's accumulator is
`if (resultPart) { result |= resultPart; }`, so an unrecognised name contributes nothing and the result stays
`0 = Push`). But the minimal repair is to persist a raw provider cause verbatim on a closed
`additionalProperties:false` record and to decide what an unmappable cause renders as. That adds a field and a
product decision, which is more than repairing a promise. Setting it aside for a card is the conservative and correct
call, and the record names its dependency on TA-004 so the card arrives with its context.

---

## Cross-provider ownership

**TA-042 — confirm the re-owning.** FGI-015 acceptance criterion 3 is a `Plans/Forge_Integrations.md` criterion
(verbatim at `:880`), and the two schemas that cannot satisfy it are the *common* provider-profile schemas, not
anything Azure-specific. The record's instruction — "RE-OWNED: this is not an Azure defect … The Azure thread should
not land it" — is right, and it is the only item counted outside both lanes.

**TA-011 — confirm the re-laning, with one wording caution.** The defect is cross-provider, as proven above, and the
record lands it in `Plans/forge_integration_contracts.schema.json` rather than the Azure owner. Note that this is the
common *schema*, not `Plans/Forge_Integrations.md` the owner document; TA-011 is counted inside the 13 common-forge
items and TA-042 alone is the "re-owned" one. Both are out of the Azure lane, which is the substantive point, but the
two are not in the same place and a Part 2 brief should not conflate them.

---

## Provider-fact source verification

The record carries 22 verifications (PV-01 to PV-22) with file-and-line loci. I sampled ten, spread across both arms
and six different jobs, and checked the claimed tokens at the cited lines. **Ten of ten verified.**

| id | locus | result |
| --- | --- | --- |
| PV-01 | arm-s / J0014-reconcile / S00009:3107-3115 | `IterationReason { Push = 0, ForcePush = 1, Create = 2, Rebase = 4, Unknown = 8, Retarget = 16, ResolveConflicts = 32 }` verbatim |
| PV-02 | arm-s / J0014-reconcile / S00010:273-291 | `if (resultPart) { result |= resultPart; }` verbatim |
| PV-05 | arm-s / J0007-implementation / S00034:524-526 | "expires the current policy status" present |
| PV-08 | arm-s / J0015-compare / S00041:100 | the 100,000-file iteration limit present |
| PV-11 | arm-s / J0016-compare / S00094:500-503 | `autoCompleteIgnoreConfigIds` and `isBlocking` present |
| PV-12 | arm-h2 / J0020-compare / S00031:214-263 | `artifactId` and `notApplicable` present |
| PV-13 | arm-h2 / J0020-compare / S00041:48 | "Bypasses policy requirement" present |
| PV-19 | arm-s / J0016-compare / S00094:225 | "If MergeStrategy is not set to any value, a no-FF merge will be created if SquashMerge == false" verbatim |
| PV-20 | arm-h2 / J0020-compare / S00044:33-34 | "only build policies perform any action" present |
| PV-22 | arm-s / J0015-compare / S00041:27 | the Services / Server / Server 2022 banner present |

PV-19 is the basis of the sixth top candidate (the merge command selecting no-fast-forward by omission) and PV-01 and
PV-02 are the basis of the TA-002 reclassification; all three are verbatim, not paraphrased.

---

## Integrity

**The manifest verifies.** Eleven files, every SHA-256 and byte count matching what is on disk, internal digest
`14c0cbce5a70965e…` as stated.

**Canon was read at the tip, not at a stale commit.** The record says it read canon on
`4f5eda0d18a9deff2349b03ae573f0ffd706ed61`. That commit is current `origin/main`, and a descendant of the
`a6162b559b` the brief named as the floor. I hashed all **13** cited canon files against that commit: **13 of 13
match**. So every "verified on main" in the record was verified against the same bytes I read.

**Arm evidence rehashes.** The manifest's `arm_evidence_rehashed` list carries per-file hashes with
`matches_union: true`; the files I sampled are present and readable at the cited loci.

**No canon was edited.** No file under `/mnt/Cursor/PuppetMaster` differs, no branch was created for this work, and
the adjudication bundle branch `research/topic2-adjudication-20260917` at `3fcfde3e3b` is not merged to main — it
remains a bundle branch, which is correct for Part 1.

One honest caveat on my own read-only claim: while I was sampling the arm caches, an unrelated background process
wrote `arm-s/accounting/global_allowance.json` and `arm-h2/accounting/global_allowance.json` (mtimes 00:29:18, sixteen
seconds before I checked). Those are the harness's own allowance ledgers. My operations on that tree were `sed -n`,
`grep` and Python `read_text()` against `sources/*/text.txt` only; I did not write them, and nothing under
`topic2-candidates-20260917` changed at all.

**The inherited limit is carried.** The record repeats, in its own `inherited_limit` field, that the union rests on
five compare documents covering five of 115+ discovered leads and supports per-defect claims anchored to passages,
not a recall estimate for the document. That is the honest framing and it survives into the verdict record, which is
what the brief asked.

---

## Notes

**N1. A one-line count nit.** The record says the Azure fixture file is "73 lines"; it is 74 by line count (73 by
`wc -l` on a file ending in a newline). Immaterial to the finding, which turns on the file holding exactly two
profiles and one negative — that part is exact.

**N2. TA-011's phrasing is conservative relative to the facts.** "At least two of three non-Azure declarations" is
true but understates a defect that reaches every provider with a non-empty list. Strengthening it costs nothing and
makes the common-schema landing easier to justify.

**N3. Carry the conditional-sweep check into Part 2.** NEW-01 failed because a field's admissible values were read
from `properties` alone. Both this record and the union made a version of that error in opposite directions. A
mechanical sweep — for every claim about a field, enumerate every `allOf` branch that names it — would have caught
both, and is cheap to run.

---

## Verdict

**Confirm the list, with one change: withdraw `NEW-01`.**

The record is careful work. It caught three real errors in the union — two false supporting claims and a citation
nearly thirty lines off — and in each case kept the finding alive on its true basis rather than either swallowing the
error or discarding the defect. It re-owned one item out of the Azure lane and re-laned another, set aside the one
proposition whose minimal repair is a product decision, and merged seven propositions into two defects that are
genuinely single defects. Every mechanical claim I tested — eight of the propositions plus all three union
corrections — held exactly, and ten of twenty-two provider facts verified verbatim at their cited loci across both
arms. The manifest, the canon hashes and the read-only discipline all check out.

The one item it added on its own authority is the one that does not survive. `NEW-01` should be struck from the
record, with the asymmetry it noticed — `project` nullable where its two sibling locator fields are not — kept as an
observation, and the suggestion of a second Azure negative that nulls rather than omits the key carried forward as a
fixture-coverage nicety rather than a correction.

**26 corrections to land, unchanged** (12 Azure owner or fixtures, 13 common forge contracts, 1 re-owned), plus
TA-002 as a decision card. Part 2 may proceed on that list.

---

## Commands run

| command | result |
| --- | --- |
| `python3` verification of `manifest.json` against disk | 11 files, 0 mismatches; internal digest `14c0cbce5a70965e…` confirmed |
| `git merge-base --is-ancestor` on `4f5eda0d18` and `a6162b559b` | the record's canon commit is current `origin/main` and a descendant of the brief's floor |
| `python3` hash of all 13 cited canon files at that commit | 13 of 13 match the record |
| `python3` read of `topic2-part1-verdicts.json` counts, merges, verdicts | 32 examined, 31 corrections, 1 reclassified, 2 merges → 26; lane split 12 / 13 / 1 recounted independently |
| `python3` walk of `command_request.allOf` for review-revision refs | `allOf[8]` declares both refs, no `required` anywhere in the branch — FALSE-01 confirmed |
| `python3` membership test of `disabled_reason_code` (54) and `error_code` (58) | `missing_scope` in both, `pipeline_disabled` in neither and absent from the schema — FALSE-02 confirmed |
| `git grep` + `python3` over every `unsupported_reason_codes` declaration | every non-empty declaration carries off-enum codes; defect is universal, not "two of three" |
| `git show` + `grep -n` for the DL-054 tokens | `Source_Control_System.md:1114-1123, :1167, :1172`; `Decision_Log.md:3760-3761, :3844` — CITE-01 confirmed |
| `jsonschema` validation of `repository_binding` with `project: null` across all nine providers | rejected for `azure_devops` and `bitbucket_data_center`, accepted for the other seven — **NEW-01 refuted** |
| `jsonschema` validation of the shipped omission negative | rejected at `properties/repository_locator/required`, as the record says |
| `python3` inspection of `repository_binding.allOf[0]` | the Azure/BDC conditional narrowing `project` to `non_empty_string` |
| `python3` count of the Azure fixture pack and the forge review fixtures | two profiles, one negative; sole `review_revision` is gitlab; azure `pipeline_projection` points at a non-existent revision — TA-038 confirmed |
| `python3` read of both Azure profiles' capability lists | neither declares `review_versions` or `repository_policy`; both declare `checks` — TA-008 and TA-010 confirmed |
| `git show` + `count('TFVC')` across three files | 0 in the Azure owner, 2 in `Forge_Integrations.md`, 6 in the acceptance packet — TA-034 confirmed |
| `python3` inspection of `provider_matrix_profile` and `auth_methods`, and `grep` for FGI-015 | 14 properties all required, none of the seven facts; criterion verbatim at `Forge_Integrations.md:880` — TA-042 confirmed |
| `python3` inspection of `repository_locator` and a corpus search for `provider_project_id` | slug plus required `provider_repository_id` for the repository, name only for the project — TA-033 confirmed |
| `sed`/`grep` sampling of ten provider facts across both arms and six jobs | 10 of 10 verified; PV-01, PV-02 and PV-19 printed verbatim |
| `git status`, `git branch -a`, `git merge-base --is-ancestor 3fcfde3e3b origin/main` | no canon edited, no branch created, the bundle branch is not on main |
