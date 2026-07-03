# Shard 048: Ledger Compile Addendum - pldg-20260622-001-fff

Source: `Plans/FinalGUISpec.md`

Source lines: L25615-L25666

Source SHA256: `9bc70c143cbbf4596814b3decd2231d7a4585f04d112d2729a6833bea987f113`

---

## Ledger Compile Addendum - pldg-20260622-001-fff

### F3-399 - Shared Discovery GUI States And Route Migration

```yaml
plan_unit_id: F3-399
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  GUI path/context discovery surfaces route through the shared DiscoveryService while preserving established user-facing names and shortcuts. Quick Open, command palette fuzzy search, Search path narrowing, Assistant Chat file mentions, File Manager type-ahead, Planning Wizard source picker, and PRD Builder source picker expose loading, indexing/warming, stale, fallback, denied, no-results, hidden-by-policy, disabled, unsupported, over-budget/backpressure, rank explanation, disclosed local sort/filter, settings, and reset states. GUI surfaces preserve DiscoveryService ranking order unless they disclose a local sort/filter, and coarse rank explanations may show path match, recent in this project, current context, stale cache, or fallback without exposing raw private frecency/query/open history or blocked path details.
gui_related: true
gui_classification_reason: This defines user-visible GUI states, controls, ranking presentation, and route migration.
depends_on: [T-160, T-161, T-163, CV-291, F2-191, SP-217]
unblocks: [ACD-423, UCC-099, F-072, PWIZ-015, PRDB-009, ATS-011]
acceptance_criteria:
  - GUI discovery surfaces preserve established command names and shortcuts.
  - Hidden-by-policy is distinct from ordinary no-results.
  - Local sort/filter behavior is disclosed when it changes visible order.
  - Rank explanations are coarse and no-leak.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - Future GUI/agent ranking parity tests.
  - Future GUI stale/fallback/denied/no-results/hidden-by-policy state tests.
risk_class: gui_discovery_route_drift
reasoning_tier: standard
context_scope: gui_discovery_surfaces
implementation_surfaces: [Plans/FinalGUISpec.md, Plans/UI_Command_Catalog.md, Plans/FileManager.md, Plans/assistant-chat-design.md, Plans/Planning_Wizard.md, Plans/PRD_Builder.md]
node_compile_hint: {mode: gui_discovery_consumer_contract, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - pldg-20260622-001-fff:atom-0013
  - pldg-20260622-001-fff:atom-0021
  - pldg-20260622-001-fff:atom-0044
  - pldg-20260622-001-fff:atom-0056
  - pldg-20260622-001-fff:atom-0059
  - pldg-20260622-001-fff:atom-0063
  - pldg-20260622-001-fff:atom-0078
  - pldg-20260622-001-fff:atom-0081
  - pldg-20260622-001-fff:atom-0084
  - pldg-20260622-001-fff:atom-0087
  - pldg-20260622-001-fff:atom-0089
  - pldg-20260622-001-fff:atom-0090
  - pldg-20260622-001-fff:atom-0093
  - pldg-20260622-001-fff:state/doc_impact_matrix.json#DIM-008
source_atom_ids: [atom-0013, atom-0021, atom-0044, atom-0056, atom-0059, atom-0063, atom-0078, atom-0081, atom-0084, atom-0087, atom-0089, atom-0090, atom-0093]
preserved_exact_tokens: ["Quick Open", "command palette fuzzy search", "Search path narrowing", "Assistant Chat file mentions", "File Manager type-ahead", "Planning Wizard source picker", "PRD Builder source picker", "hidden-by-policy", "over-budget/backpressure", "rank explanation", "local sort/filter disclosed"]
negative_constraints:
  - Do not conflate hidden-by-policy with ordinary no-results.
  - Do not rename established GUI commands or shortcuts as part of discovery routing.
  - Do not run an undisclosed second ranking pass that changes shared DiscoveryService order.
owner_hints: [Plans/FinalGUISpec.md, Plans/UI_Command_Catalog.md, Plans/FileManager.md, Plans/assistant-chat-design.md, Plans/Planning_Wizard.md, Plans/PRD_Builder.md]
```
