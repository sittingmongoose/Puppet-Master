# Azure DevOps correction landing — 2026-09-18

Branch `plans/azure-devops-corrections-20260918`, based on `4f5eda0d18a9deff2349b03ae573f0ffd706ed61`. Not landed on
`main`. The branch stops here for one blind form-driven review.

This landing carries two things: the **twenty-six corrections** the Azure DevOps candidate record of 2026-09-17
produced and its confirmation review of 2026-09-18 upheld, and the **seven decision-card answers** Jared gave on
2026-09-18, which land as `DL-059` to `DL-065` and the PlanUnits their owners hold.

## What a correction is here

A correction repairs a promise the Plans already make and adds nothing. Where a repair would have added a field, a
command or a surface, it was not landed as a correction: `TA-035` and `TA-036` were narrowed to prose and their
capability halves became cards, `TA-026` amends two acceptance criteria and its carrier became a card, and `TA-002`
was set aside as a card entirely. The seven cards are now answered, so each capability half is planned as a PlanUnit
under its owner — planned, not admitted: no command enters the central command set, the command catalog or
production wiring here.

## Counts

| | |
|---|---:|
| Corrections landed | **26** |
| … in the Azure owner or its own fixtures | 12 |
| … in the common forge contracts | 13 |
| … re-owned to `Plans/Forge_Integrations.md` | 1 |
| Propositions merged into those (two merges) | 7 → 2 |
| Decision-card answers landed | **7** |
| PlanUnits edited | 11 |
| PlanUnits created | 14 |
| Not landed | `TA-002` (a card), `NEW-01` (withdrawn) |

## The two things the confirmation review changed

**`NEW-01` is withdrawn.** The Part 1 record proposed dropping `null` from `repository_locator.project`, reading
that a `repository_binding` could carry an explicit null project and still validate against `ADO-001`'s "project is
mandatory". The review tested the shipped schema across all nine providers and found `repository_binding`'s
`allOf[0]` already narrows `project` to a non-empty string for `azure_devops` and `bitbucket_data_center`, so an
explicit null is already rejected for Azure. The proposed two-character change would have forced a project onto the
seven providers with no project layer and invalidated the shipped GitLab, Forgejo and Gitea positives. The base type
is unchanged. What survives is the fixture-coverage nicety the review allowed: one second Azure negative that nulls
the project rather than omitting it, so both mechanisms are exercised.

The standing check that produced that finding is carried through this landing: **for any claim about a field's
admissible values, enumerate every `allOf` branch that names it before concluding.** It is why the Azure-only
`provider_project_id` requirement was added as its own conditional rather than folded into the existing
Azure-and-Bitbucket one, and why the checks-command fence was split by binding kind rather than loosened.

**The lane convention, stated once.** A correction's lane is **where the defect lives, not where the repair
lands**. The two differ for three of the twenty-six, so counting the compile queue by `target_doc` gives a different
split and neither number is wrong: `AZ-20` (TA-026) is a common-lane defect whose repair amends ADO-003, `AZ-19`
(TA-025) is a common-lane defect whose repair amends SCS-016, and `AZ-26` (TA-042) is the single re-owned item,
counted outside both lanes, whose repair lands in the common lane's own document. **By lane: 12 Azure, 13 common,
1 re-owned. By `target_doc`: 13 Azure, 12 Forge, 1 Source Control.** Same twenty-six corrections.

**`TA-011` and `TA-042` are distinct and land in different places.** `TA-011` is a defect in the common *schema*,
`Plans/forge_integration_contracts.schema.json`, and is counted inside the thirteen common-lane items. `TA-042` is a
defect in `Plans/Forge_Integrations.md` the owner document, and is the single re-owned item counted outside both
lanes. They are not the same lane and are not conflated here.

## Files

| File | Contents |
|---|---|
| `verification.json` | Every correction by id with its promise and its repair, the seven card answers, the units edited and created, every check run with its result, the unenforced obligations, what was not landed, the reseal request and the cross-branch overlap |
| `evidence-receipts.json` | Receipts whose `use` fields say what each file actually supports, split into in-repository, out-of-repository and provider facts, plus an explicit `not_support` list and the three withdrawn claims |
| `currentness-before-edit.json` | The base commit, the hash of every edited file at that commit, and why no cited passage needed re-adjudication for drift |
| `derived-scope.json` | What was regenerated, which shard sets moved and which governance artifacts were not touched |
| `ledger-final.json` | The ledger validator's own report with its interpretation |

The ledger is `Plans/ledgers/v2/pldg-20260918-001-azure-devops-corrections`, registered in
`Plans/ledgers/v2/ledger_registry.json`.

## Checks

All deterministic checks pass except the ledger validator's three governance-coverage errors, which are the
pre-existing omissions for the owner documents this wave edits and are the designated Plans agent's reseal rather
than ordinary work. The compile witness passes on all three witnesses against `origin/main`: every findings record
targets the units it names and each of them differs from base, all fifty-two exact tokens reach an owning unit's
prose and its registry, and no unit the compile targets carries a registry entry absent from its own text.

One pre-existing break was repaired: `tests/test_pm_forge_provider_fixture_gate.py` asserted 30 contract pairs and
26 schema sources while `scripts/pm-new-contracts-verify.py` on `origin/main` sets 31. It has failed on `main` since
`ca7d5f4ff6` added the External Research pair. This branch touches that file, so the assertion was corrected.

## What this does not establish

No provider was contacted. Every Azure fact restated here is a documentation or reference-client reading recorded in
a frozen research cache and re-found by the Part 1 record, with the locus in `evidence-receipts.json`. Nothing here
establishes that an Azure adapter exists or works, and nothing here is a governance seal or a readiness admission.

**The inherited limit, stated plainly.** The union rests on five compare documents covering five of 115 or more
discovered leads. It supports per-defect claims anchored to passages; it does not support a recall estimate for
`Plans/Azure_DevOps_Integration.md`. Whole PlanUnits — `ADO-004` builds and pipelines, `ADO-005` Settings placement
and migration, most of `ADO-001`'s container hierarchy — were never compared by either arm. **Twenty-six is a lower
bound with an unknown and probably large remainder.** Jared queued the second pass as its own run rather than
blocking this landing; it is open question `q-017`.

One consequence is worth saying twice: `TA-038`'s repair amends the fixture promise rather than writing the
fixtures, so `ADO-001` (its TFVC container-recognition criterion only), `ADO-003`, `ADO-005`, `ADO-006` and
`ADO-007` carry acceptance criteria that no fixture can currently falsify. Each of those units says so in its own
validation surfaces, and `q-019` tracks the work. The five planning units the card answers created — `SCS-023`,
`F3-561`, `FGI-018`, `FGI-019` and `FGI-020` — are in the same position for a different reason: the addendum that
carries them admits no typed schema variant, so no schema or fixture pack holds their shapes. Each says
"no validator surface in this landing" rather than naming a file that cannot fail, and `q-020` tracks it.

## Review cycle 1

A blind form-driven review of `7380013f04` returned **fix then land**: 1 blocking, 9 should-fix, 3 notes, 1
withdrawn. All fourteen are applied in one fix commit, no amend. The per-finding disposition is in
`verification.json` under `review_cycles`. Three are worth naming here.

**R-11** was the one with blast radius beyond this branch: `ledger_registry.json` had been rewritten with sorted
keys, turning a one-entry addition into a 185-line diff across nine other threads' entries. It is restored to the
file's own serialization — 26 added lines and one changed timestamp.

**R-01** was the blocking one, and it was the same defect `AZ-01` exists to repair: `ADO-001` named a TFVC negative
fixture that did not exist. A real TFVC negative is now written — a profile declaring a near-miss spelling instead of
the enrolled `tfvc_container_unsupported` is rejected by the closed vocabulary — and the claim is amended to say that
**container recognition** itself has no fixture, because the corpus carries no container shape to present one in.

**R-04 and R-06** were both obligations this landing stated and did not enforce. Both are now enforced rather than
recorded as unenforced: `gate_record` requires its three URL fields so omission cannot evade the rule, and
`review_revision` rejects `stale_head_changed` paired with a cause that moved no head — which is precisely the false
report `AZ-11` exists to stop.
