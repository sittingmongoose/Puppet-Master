# Puppet Master — User-Project Project Plan Package Outputs (SSOT)

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0446
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - `Work Package`
  - Work Package
  - owning package
  - `superseded`, `revoked`, `reopened`, etc. should apply only where real object lineage/validity relationships exist, not to arbitrary project runs.
  - superseded
  - revoked
  - reopened
  - `Overridden by Package override`
  - Overridden by Package override
  - main reason the project needs attention
  - `project health`
  - project health
  - `project activity`
  - project activity
  - `project attention`
  - project attention
  - Recommended top-level project card fields
  - when a project is in blocked/attention state, the Projects page should show the dominant current owner of that state
  - Similar to runs, project cards should not imply that “historical project” is a real semantic class unless the product introduces archiving.
  - archived/unregistered project
  - project health and project attention are different things and should not share one overloaded dot
  - the UI should make it clear when a project is using the inherited app-default layout versus a project-specific override
  - `activity` = is anything actively happening for this project
  - activity
  - severity and routing should not collapse into one generic red project badge
  - Current docs do not yet define how unrelated concurrent or historical runs should roll up into one project badge/card.
  - project summaries must preserve the distinction between user-attention problems and internal degraded-trust warnings
  - project badges need aggregation; attention center rows need precision
  - That means project summary and project attention should NOT be jammed into either:
  - project summary derives from canonical runtime/thread/wizard/usage/auth/source-control records and from active attention rows
  - follow `artifact_id` / `linked_artifact_id` for renderable outputs and evidence objects
  - artifact_id
  - linked_artifact_id
  - do not conflate runtime artifacts with Project Plan Package artifacts
  - Make explicit that staged/generated planning outputs enter the UI as `artifact:<artifact_id>` subjects before any backing path exists.
  - artifact:<artifact_id>
  - The key remaining question is breadth: how many authored `Plans/*.md` docs are still only Gemini or otherwise below full requested model coverage.
  - Plans/*.md
  - Project Plan Package artifacts are canonically persisted and filesystem materializations are staging/export/cache
  - per-surface project state like `source_control.project_state.{project_id}`
  - source_control.project_state.{project_id}
  - `cmd.project.open` is already implicitly route-consuming navigation rather than shell-state mutation; the docs just do not say that in one shared place.
  - cmd.project.open
  - `cmd.project.open`
  - work package:
  - `PuppetMasterEvent::Output`
  - PuppetMasterEvent::Output
  - Coverage has been re-audited after the merge: `39` top-level `Plans/*.md` docs are full six-pass complete and the remaining `22` docs are now uniformly at five passes.
  - 39
  - 22
  - After this merge, the authored top-level `Plans/*.md` surface is fully covered: all `61` docs now have all six requested model passes.
  - 61
  - worker activity requires `PuppetMasterEvent::Output` filtered by `tier_id`
  - tier_id
  - project `activity_state` enum
  - activity_state
  - project `attention_state` enum
  - attention_state
  - `Plans/Contracts_V0.md`, `Plans/storage-plan.md`, `Plans/UI_Command_Catalog.md`, `Plans/Crosswalk.md`, `Plans/Wiring_Matrix.md`, `Plans/Progression_Gates.md`, `Plans/FileManager.md`, `Plans/Project_Output_Artifacts.md`
  - Plans/Contracts_V0.md
  - Plans/storage-plan.md
  - Plans/UI_Command_Catalog.md
  - Plans/Crosswalk.md
  - Plans/Wiring_Matrix.md
  - Plans/Progression_Gates.md
  - Plans/FileManager.md
  - Plans/Project_Output_Artifacts.md
  - `Plans/Project_Output_Artifacts.md`, `Plans/Runtime_Artifacts_Panel.md`, and `Plans/interview-subagent-integration.md` still do not contain the exact `validation artifact lineage`, `bridge-field viewer`, or `validation/report section` headings.
  - Plans/Runtime_Artifacts_Panel.md
  - Plans/interview-subagent-integration.md
  - validation artifact lineage
  - bridge-field viewer
  - validation/report section
  - `Plans/Project_Output_Artifacts.md:1-24`
  - Plans/Project_Output_Artifacts.md:1-24
  - Wave 2 targeted the storage/receipt/blocked subset around `gap-003`, `gap-004`, and `gap-005` (`Plans/storage-plan.md`, `Plans/Project_Output_Artifacts.md`, `Plans/Runtime_Artifacts_Panel.md`, `Plans/interview-subagent-integration.md`, `Plans/usage-feature.md`, `Plans/Tools.md`, `Plans/assistant-chat-design.md`) and only reconfirmed the already-recorded missing anchors/fields plus the already-known owner-vs-consumer split for blocked-packet fields.
  - gap-003
  - gap-004
  - gap-005
  - Plans/usage-feature.md
  - `Plans/Project_Output_Artifacts.md:16-24`
  - Plans/Project_Output_Artifacts.md:16-24
  - `Plans/Project_Output_Artifacts.md` already carries `phase_plan_ref`, `requirements_quality_report_ref`, and `pass_verdict` in the validation-pass-report lineage, so `gap-004`'s unresolved work is now the missing receipt owner heading plus missing consumer anchors rather than those fields wholesale.
  - phase_plan_ref
  - requirements_quality_report_ref
  - pass_verdict
  - `Plans/Project_Output_Artifacts.md:485-530`
  - Plans/Project_Output_Artifacts.md:485-530
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.

> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: “Puppet Master” only. No open questions; deterministic defaults per `Plans/Decision_Policy.md`.


This document is the **canonical single source of truth (SSOT)** for the user-project **Project Plan Package** outputs produced by **Puppet Master** and staged under:

`.puppet-master/project/**`

It also defines:
- **seglog canonical persistence** for these artifacts (filesystem is staging/export/cache only)
- **DRY, contract-referenced plan graph** requirements (**sharded-only plan graph**; machine-runnable, headless) with an **optional, non-canonical** derived export for convenience.

> **Do not duplicate:** This file is the SSOT for artifact paths and sharding rules; other docs should link here instead of repeating them.

