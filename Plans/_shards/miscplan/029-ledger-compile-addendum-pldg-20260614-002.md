# Shard 029: Ledger Compile Addendum - pldg-20260614-002

Source: `Plans/MiscPlan.md`

Source lines: L6342-L6384

Source SHA256: `e000b23c3e58fd317135ea6ee6b09b748cdffcb3ead602e933ae42367e00047e`

---

## Ledger Compile Addendum - pldg-20260614-002

### M-083 - Runner Platform Specs Skill Injection Contract

```yaml
plan_unit_id: M-083
unit_type: requirement
status: accepted
owner_doc: Plans/MiscPlan.md
canonical_text: >-
  Skills integration with runners is governed by a versioned `platform_specs` injection contract rather
  than a stub. For each provider runner, the contract records platform_id, runner_id/runtime_identity,
  skill/package identity, injection timing, capability/permission boundary, environment/secret boundary,
  compatibility matrix, failure/fallback behavior, audit/evidence refs, override policy, and owner
  approval path. `list_skills_for_agent` may inject skills only after those fields validate for the
  target runner.
gui_related: false
gui_classification_reason: Runner skill injection, capability, environment, and audit boundaries are backend/runtime contracts, not visual presentation.
depends_on: [M-082, MGAC-092, PS-113]
unblocks: []
acceptance_criteria:
  - Runner skill injection has a per-platform contract before skills are delivered to Cursor, Claude Code, OpenCode, Codex, GitHub Copilot, or Gemini runners.
  - Injection validates runtime identity, capability/permission, environment/secret, compatibility, fallback, audit/evidence, override, and owner approval fields.
  - Skills runner integration is not described as stubbed in live canonical prose.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260614-002-part-3-fable-cleanup
risk_class: runner_skill_injection_gap
reasoning_tier: high
context_scope: runner_platform_specs_skill_injection
implementation_surfaces: [Plans/MiscPlan.md, Plans/orchestrator-subagent-integration.md, Plans/Skills_System.md]
node_compile_hint: {mode: runner_platform_specs_skill_injection, create_worknodes: false}
source_lineage:
  - pldg-20260614-002-part-3-fable-cleanup:atom-0118
  - pldg-20260614-002-part-3-fable-cleanup:atom-0119
preserved_exact_tokens: ["per-platform skill injection for runners", "is stubbed", "platform_specs", "list_skills_for_agent", "Cursor", "Claude Code", "OpenCode", "Codex", "GitHub Copilot", "Gemini"]
negative_constraints:
  - Do not inject skills into a runner without validating the `platform_specs` injection contract.
  - Do not let skill injection bypass capability/permission, environment/secret, compatibility, fallback, audit/evidence, override, or owner approval boundaries.
owner_hints: [Plans/MiscPlan.md, Plans/orchestrator-subagent-integration.md, Plans/Skills_System.md]
```

<!-- FABLE_REMAINING_ACTION_PLAN_REPAIR_20260708_BEGIN -->
