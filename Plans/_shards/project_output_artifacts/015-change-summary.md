# Shard 015: Change Summary

Source: `Plans/Project_Output_Artifacts.md`

Source lines: L810-L823

Source SHA256: `cfb34cb80de7add6d66d68e4bbe80ecb8b243a9038d4a4f696eb1298c4324241`

---

## Change Summary

- 2026-02-27: Updated §2.3 to declare `.docset/` canonical packaging convention and pointer stub behavior for large Markdown/text artifacts; re-asserted plan graph sharded JSON contract unchanged. Cross-ref: `Plans/Document_Packaging_Policy.md §7`.
- 2026-02-25: Added required derived verification contract for `.puppet-master/project/traceability/requirements_quality_report.json` (schema: `pm.requirements_quality_report.schema.v1`), added optional derived `.puppet-master/project/quickstart.md` contract, added deterministic quickstart generation/validation rules, aligned requirements coverage generation rules with `Plans/requirements_coverage.schema.json` (`orphaned_node_requirement_refs[].reason` sentinel and schema-aligned `uncovered_acceptance[]` semantics), updated validator acceptance checks, and clarified certification-cycle write-protection interaction (requirements/plan protected; quickstart may be regenerated as derived output).
- 2026-07-24: Added §11 Traceability outputs (requirements_coverage.json + requirements_coverage.md under `.puppet-master/project/traceability/`); added item 9 in §2 required artifact set; added `traceability/` to §2.1 staging tree; added `requirements_coverage_json` and `requirements_coverage_md` `artifact_type` values to §8.2; added acceptance criterion item 10 in §9. ContractRefs: SchemaID:pm.requirements_coverage.schema.v1, SchemaID:pm.project-plan-node.v1, SchemaID:pm.acceptance_manifest.schema.v1, Gate:GATE-011.
- 2026-06-18: Retired fixed Pass 1 / Pass 2 / Pass 3 model settings for validation reports; provider/model parity now points to the single Auditor validation loop setting resolved at sweep start.
- 2026-02-25: Hardened validation sweep acceptance contracts: added provider/model-to-settings linkage later superseded by the single Auditor validation loop, deterministic/headless sweep provenance requirement, post-loop artifact finality requirement, and fixed `unresolved_findings[]` naming in the certification-cycle write-protection invariant.
- 2026-02-25: Added legacy `validation_pass_report` artifact typing in §8.2 and the former §10 validation-pass artifact lineage section, including execution-bridge lineage and validation-sweep acceptance requirements. This title is now superseded by Auditor cycle report lineage, with validation-pass rows retained only as compatibility mirrors.
- 2026-02-24: Locked decision: user-project plan graph is **sharded-only**; canonical entrypoint is `.puppet-master/project/plan_graph/index.json`; monolithic export (if materialized) lives at `.puppet-master/project/plan_graph/exports/plan_graph.monolithic.json`.
- 2026-02-24: Marked `.puppet-master/project/plan_graph/exports/plan_graph.monolithic.json` as an **optional, non-canonical** derived export (may be generated, but must not be required; path was previously `.puppet-master/project/plan_graph.json`).
- 2026-02-24: Replaced this document to be the canonical SSOT for user-project **Project Plan Package** outputs under `.puppet-master/project/**`.
- 2026-02-24: Defined seglog canonical persistence as the source of truth (filesystem is staging/export/cache only) with required artifact-event fields.
- 2026-02-24: Tightened DRY rules: node shards reference `ProjectContract:*`; acceptance manifest references node IDs + contract refs; repeated prose must point to contract pack canon.
- 2026-02-24: Aligned terminology/field names with existing schemas in `Plans/` (graph index/node, contracts index, acceptance manifest, auto decisions).
