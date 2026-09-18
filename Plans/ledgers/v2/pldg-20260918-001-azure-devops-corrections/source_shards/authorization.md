# Authorization and scope

This ledger compiles the twenty-six corrections the Azure DevOps candidate record of 2026-09-17 produced and the
confirmation review of 2026-09-18 upheld, together with the seven Azure decision-card answers Jared gave on the same
day. The authorization is an attributed summary written by the compiling agent; it is not a verbatim user quote,
except where a question record quotes Jared's answer exactly and cites the relayed file by path and SHA-256. Every
such relay is agent-relayed; it is not verifiable from inside this repository.

Jared answered nine Azure candidate recommendations and all seven decision cards on 2026-09-18, verbatim "agree",
recorded in `/mnt/Cursor/PM-Experiments/research-audit-native-20260907/process-pilot-20260908/ANSWERS_20260918.md`,
SHA-256 `1f3ba7531118088f61b3d09554d09498e53797bc93ce128f9032c529fa35f3b4` as read on 2026-09-18. The cards themselves
are `/mnt/Cursor/PM-Experiments/research-audit-native-20260907/process-pilot-20260908/AZURE_DECISION_CARDS_20260918.html`,
SHA-256 `7379920aee612156224e5bd770b8d099e9e588760c0aeee573af10f45a65de29`. The nine candidate answers are recorded as
`q-008` to `q-016` and the seven card answers as `q-001` to `q-007`; the cards land as DL-059 to DL-065.

The twenty-six split twelve in the Azure owner or its own fixtures, thirteen in the common forge contracts, and one
re-owned out of the Azure lane into `Plans/Forge_Integrations.md`. Two merges fold seven propositions into two
corrections: `C-CHECKS-BINDING` from TA-022, TA-023 and TA-024, and `C-CHECKS-CARRIER` from TA-018 to TA-021.

**The lane is where the defect lives, not where the repair lands**, and the two differ for three items, so counting
the compile queue by `target_doc` gives a different split. Stated once, so neither number reads as an error:

- `AZ-20` (TA-026) is a common-lane defect: the forge contracts have forty-six definitions and not one is a vote, an
  approval or a reviewer. Its repair amends ADO-003, so its `target_doc` is the Azure owner.
- `AZ-19` (TA-025) is a common-lane defect in the Check carrier. Its repair amends SCS-016, so its `target_doc` is
  `Plans/Source_Control_System.md`, the only correction with that target.
- `AZ-26` (TA-042) is the one re-owned item and is counted outside both lanes. Its `target_doc` is
  `Plans/Forge_Integrations.md`, which is also the common lane's document, so by `target_doc` it is
  indistinguishable from a common-lane item.

By lane the split is 12 Azure, 13 common, 1 re-owned. By `target_doc` it is 13 Azure, 12 Forge, 1 Source Control.
Both describe the same twenty-six corrections.

Every proposition here repairs an existing promise. TA-002 named a real defect whose minimal repair adds a field and
a product decision, so the Part 1 record reclassified it to a decision card and it is not landed. NEW-01 was an
additional finding the Part 1 record raised on its own authority; the confirmation review withdrew it, because
`repository_binding`'s `allOf[0]` already narrows `repository_locator.project` to a non-empty string for
`azure_devops` and `bitbucket_data_center`, so an explicit null project is already rejected for Azure. The base type
is unchanged and the observation survives only as the second Azure negative fixture the review allowed.

The inherited limit is carried forward unchanged: the union rests on five compare documents covering five of 115 or
more discovered leads. It supports per-defect claims anchored to passages; it does not support a recall estimate for
`Plans/Azure_DevOps_Integration.md`. Whole PlanUnits, including ADO-004 builds and pipelines, ADO-005 Settings
placement and migration, and most of ADO-001's container hierarchy, were never compared by either arm. Twenty-six
corrections is a lower bound with an unknown and probably large remainder, and the second pass is queued as its own
run rather than blocking this landing.

- Do not add a command, handler, event or field beyond what a correction repairs or an answer names.
- Do not claim runtime, native adapter, provider access, security, performance or readiness evidence from these
  static contracts.
- Do not change `Plans/Spec_Lock.json`, evidence bundles, the plan graph, `auto_decisions.jsonl`, WorkNodes or
  NodeSeeds.
- Do not drop `null` from `repository_locator.project`; NEW-01 is withdrawn and the base type stays nullable.
- Do not land TA-002 as a correction; it is a decision card.
- Do not write the Azure review, policy and check fixtures under this authorization. TA-038 amends the promise to
  what exists, and `q-019` tracks the work.
- Do not plan the branch-policy read as a PlanUnit; DL-059 defers it rather than declining it.
- Do not join the Azure evaluations and status lists on an inferred key; `q-018` tracks the missing one.
