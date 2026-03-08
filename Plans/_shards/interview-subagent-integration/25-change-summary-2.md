## Change Summary

- 2026-02-26: Added capability introspection and media-generation gating requirements (new section before Adaptive Interview Phases). SSOT: `Plans/Media_Generation_and_Capabilities.md`.
- 2026-02-23: Added user-project artifact contract requiring `.puppet-master/project/...` outputs and canonical sharded plan graph handling.
- 2026-02-23: Added `interview.artifact.generated` payload contract for full-content/chunked seglog artifact persistence.
- 2026-02-23: Added execution-critical shard-node field requirements and deterministic node ID constraints.
- 2026-02-23: Added explicit auto-decisions output path `.puppet-master/project/auto_decisions.jsonl` and SSOT link to `Plans/Project_Output_Artifacts.md`.
- 2026-02-23: Updated user-project artifact set to include `contracts/index.json`, optional `glossary.md`, execution evidence outputs, and node `tool_policy_mode` + stable `ProjectContract:*` references (per `Plans/Project_Output_Artifacts.md`).
- 2026-02-23: Added cross-plan alignment section requiring adaptive phase selection and Contract Layer generation via contract fragments + deterministic Contract Unification Pass (referencing chain-wizard + Project_Output_Artifacts SSOT).
- 2026-02-24: Added `requirements-quality-reviewer` cross-phase subagent persona (Quality Review category in Cross-Phase Subagents); added §5.5 Requirements Quality Reviewer Trigger Rule with deterministic two-trigger invocation order, 2-iteration autofill loop cap, and Autofill-First Rule; added quality gate bullet to §2) Contract Layer output generation. ContractRef: `Plans/chain-wizard-flexibility.md`, `SchemaID:pm.requirements_quality_report.schema.v1`.
