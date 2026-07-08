# Shard 014: PlanUnits

Source: `Plans/Runtime_Artifacts_Panel.md`

Source lines: L408-L414

Source SHA256: `d7834b9c6349cd792fa28af8fa2e6eea81f2036eca8206259e7616576d2cb124`

---

## PlanUnits

### RAP-002 - Authority And Owner Preface

```yaml
{plan_unit_id: "RAP-002", unit_type: "requirement", status: "accepted", owner_doc: "Plans/Runtime_Artifacts_Panel.md", canonical_text: "Runtime_Artifacts_Panel.md is the Runtime Artifacts Panel SSOT and owner-section document; it preserves Puppet Master naming, deterministic defaults, required artifact envelope routing preference, and ContractRefs to Contracts, storage, usage, and Project Output Artifacts owners.", gui_related: true, gui_classification_reason: "This unit preserves user-visible GUI, UI, surface, workflow, or visual presentation requirements.", split_recommended: false, depends_on: ["PDS-003", "PDS-004", "PDS-005", "PNC-001", "CV-002", "SP-001", "UF-001"], unblocks: [], acceptance_criteria: ["RAP-002 remains addressable as a fine-grained Runtime Artifacts Panel PlanUnit with source-span coverage.", "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.", "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."], validation_surfaces: ["python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits", "python3 scripts/pm-plan-index.py validate"], risk_class: "owner_identity_drift", reasoning_tier: "standard", context_scope: "runtime_artifact_authority", implementation_surfaces: ["Plans/Runtime_Artifacts_Panel.md"], node_compile_hint: {mode: "runtime_artifacts_authority_preface", create_worknodes: false}, source_lineage: ["Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Runtime_Artifacts_Panel-S0001", "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Runtime_Artifacts_Panel-S0002", "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Runtime_Artifacts_Panel-S0006"], preserved_exact_tokens: ["Runtime Artifacts Panel — SSOT", "Canonical owner-section requirements", "Artifact envelope routing preference", "Puppet Master", "No open questions", "ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/storage-plan.md, ContractName:Plans/usage-feature.md, ContractName:Plans/Project_Output_Artifacts.md"], negative_constraints: [], preserved_contractrefs: ["ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/storage-plan.md, ContractName:Plans/usage-feature.md, ContractName:Plans/Project_Output_Artifacts.md"], compatibility_only_notes: [], stale_retired_dispositions: [], owner_hints: ["Plans/Runtime_Artifacts_Panel.md"]}
```
