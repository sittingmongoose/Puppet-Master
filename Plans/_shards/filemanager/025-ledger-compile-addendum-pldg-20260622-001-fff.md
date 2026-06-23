# Shard 025: Ledger Compile Addendum - pldg-20260622-001-fff

Source: `Plans/FileManager.md`

Source lines: L4438-L4479

Source SHA256: `b8d70c0cf158febde60c6aa84a50f9eb865d3f45474e6710a5c569c70e3d0b4d`

---

## Ledger Compile Addendum - pldg-20260622-001-fff

### F-072 - File Manager Type-Ahead Discovery Consumer

```yaml
plan_unit_id: F-072
unit_type: requirement
status: accepted
owner_doc: Plans/FileManager.md
canonical_text: >-
  File Manager type-ahead and editor file navigation delegate fuzzy/frecency file and directory ranking to DiscoveryService. File Manager shows policy-safe file/directory candidates with stale, fallback, remote, SSH, denied, hidden-by-policy, or no-results state where relevant, preserves DiscoveryService order unless a local filter is disclosed, and remains a navigation consumer rather than semantic/content search or exact verification owner.
gui_related: true
gui_classification_reason: This is File Manager type-ahead and visible navigation candidate behavior.
depends_on: [F3-399, T-160, F2-191]
unblocks: [ATS-011]
acceptance_criteria:
  - File Manager type-ahead uses DiscoveryService for fuzzy/frecency path candidates.
  - Hidden paths are absent without leaking blocked names or counts.
  - Local filters are disclosed when they refine visible results.
validation_surfaces:
  - Future File Manager type-ahead discovery tests.
  - Future remote/SSH file navigation no-leak tests.
risk_class: filemanager_discovery_consumer_drift
reasoning_tier: standard
context_scope: file_manager_navigation
implementation_surfaces: [Plans/FileManager.md, future File Manager type-ahead UI]
node_compile_hint: {mode: filemanager_discovery_consumer, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - pldg-20260622-001-fff:atom-0013
  - pldg-20260622-001-fff:atom-0021
  - pldg-20260622-001-fff:atom-0056
  - pldg-20260622-001-fff:atom-0059
  - pldg-20260622-001-fff:atom-0087
  - pldg-20260622-001-fff:atom-0090
  - pldg-20260622-001-fff:state/consumer_conformance_matrix.json#file_manager_typeahead
source_atom_ids: [atom-0013, atom-0021, atom-0056, atom-0059, atom-0087, atom-0090]
preserved_exact_tokens: ["File Manager type-ahead", "file_manager", "fuzzy/frecency ranking", "policy-safe labels", "remote/SSH file navigation", "hidden path no-leak", "local filter disclosure"]
negative_constraints:
  - Do not bypass worktree/remote identity boundaries.
  - Do not make File Manager the content-search or exact-verification owner.
owner_hints: [Plans/FileManager.md, Plans/FinalGUISpec.md, Plans/Tools.md]
```
