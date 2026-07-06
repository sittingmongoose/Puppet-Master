# Shard 012: Ledger Compile Addendum - pldg-20260622-001-fff

Source: `Plans/Planning_Wizard.md`

Source lines: L1173-L1218

Source SHA256: `7985705efd82ad41a95b883fee67580fde2b51fb3218dd4fa672d79bfcd2c421`

---

## Ledger Compile Addendum - pldg-20260622-001-fff

### PWIZ-015 - Planning Wizard Source Picker Discovery Consumer

```yaml
plan_unit_id: PWIZ-015
unit_type: requirement
status: accepted
owner_doc: Plans/Planning_Wizard.md
canonical_text: >-
  Planning Wizard source/context pickers use DiscoveryService to find relevant project files for planning context without creating WorkNodes. Requests use planning_wizard_source_picker, planning_context intent, project/worktree or remote/SSH identity, policy_context, and file or content_candidate target kinds. Selected candidates preserve ranked provenance in Planning Context Capsules and expose stale, fallback, denied, hidden-by-policy, and no-results states in the picker. Selected sources are planning evidence only; later implementation still performs exact content verification before edits.
gui_related: true
gui_classification_reason: This is the Planning Wizard source/context picker GUI behavior.
depends_on: [F3-399, T-161, SP-217, F2-191]
unblocks: [ATS-011]
acceptance_criteria:
  - Planning Wizard source/context pickers route through DiscoveryService.
  - Selected candidate provenance is preserved in Planning Context Capsules.
  - Discovery selection does not create WorkNodes, NodeSeeds, executable queues, or implementation work.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - Future Planning Wizard source pick local/SSH tests.
  - Future policy-hidden source no-leak tests.
risk_class: planning_source_context_drift
reasoning_tier: standard
context_scope: planning_wizard_source_picker
implementation_surfaces: [Plans/Planning_Wizard.md, future Planning Wizard source picker]
node_compile_hint: {mode: planning_wizard_discovery_consumer, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - pldg-20260622-001-fff:atom-0027
  - pldg-20260622-001-fff:atom-0038
  - pldg-20260622-001-fff:atom-0044
  - pldg-20260622-001-fff:atom-0045
  - pldg-20260622-001-fff:atom-0059
  - pldg-20260622-001-fff:atom-0087
  - pldg-20260622-001-fff:atom-0088
  - pldg-20260622-001-fff:atom-0090
  - pldg-20260622-001-fff:state/consumer_conformance_matrix.json#planning_wizard_source_picker
source_atom_ids: [atom-0027, atom-0038, atom-0044, atom-0045, atom-0059, atom-0087, atom-0088, atom-0090]
preserved_exact_tokens: ["Planning Wizard", "planning_wizard_source_picker", "Planning Context Capsules", "planning_context", "content_candidate", "Chain Wizard", "no WorkNodes"]
negative_constraints:
  - Do not revive Chain Wizard terminology.
  - Do not create WorkNodes, NodeSeeds, executable queues, final node manifests, implementation files, or production build tasks from source selection.
  - Do not copy unbounded transcripts or unrelated source context.
owner_hints: [Plans/Planning_Wizard.md, Plans/FinalGUISpec.md, Plans/Tools.md, Plans/storage-plan.md]
```
