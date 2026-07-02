# Shard 011: Ledger Compile Addendum - pldg-20260622-001-fff

Source: `Plans/UI_Command_Catalog.md`

Source lines: L6998-L7040

Source SHA256: `74dd10ebe04ed651d00c997e89f269957c527d284c25cd0798d03edc59f10ca2`

---

## Ledger Compile Addendum - pldg-20260622-001-fff

### UCC-099 - Discovery-Routed Search And Picker Command Compatibility

```yaml
plan_unit_id: UCC-099
unit_type: constraint
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: >-
  UI command catalog compatibility preserves existing GUI command names and shortcuts while path/context discovery routes through DiscoveryService. Quick Open, command palette fuzzy file search, Search path narrowing, Assistant Chat file mentions, File Manager type-ahead, Planning Wizard source picker, and PRD Builder source picker do not require a parallel cmd.discovery.* GUI command family. cmd.search.* remains Search/content command canon, and DiscoveryService is the path/context routing substrate for compatible surfaces. Discovery/frecency reset controls require storage/search settings owner reconciliation before adding new command IDs.
gui_related: true
gui_classification_reason: This is user-visible command naming, shortcut, and command routing compatibility.
depends_on: [F3-399, SP-217, T-160]
unblocks: [ATS-011]
acceptance_criteria:
  - Existing GUI command names and shortcuts remain stable.
  - No parallel cmd.discovery.* command family is introduced without a separate owner decision.
  - Search/content commands remain owned by the Search/content lane, not DiscoveryService.
validation_surfaces:
  - Future UI command catalog compatibility review.
  - Future GUI route migration tests.
risk_class: ui_command_compatibility_drift
reasoning_tier: standard
context_scope: gui_command_catalog
implementation_surfaces: [Plans/UI_Command_Catalog.md, future command registry]
node_compile_hint: {mode: ui_command_compatibility, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - pldg-20260622-001-fff:atom-0056
  - pldg-20260622-001-fff:atom-0063
  - pldg-20260622-001-fff:atom-0066
  - pldg-20260622-001-fff:atom-0078
  - pldg-20260622-001-fff:atom-0080
  - pldg-20260622-001-fff:atom-0081
  - pldg-20260622-001-fff:atom-0087
  - pldg-20260622-001-fff:atom-0090
source_atom_ids: [atom-0056, atom-0063, atom-0066, atom-0078, atom-0080, atom-0081, atom-0087, atom-0090]
preserved_exact_tokens: ["Quick Open", "command palette fuzzy file search", "Search path narrowing", "Assistant Chat file mentions", "File Manager type-ahead", "cmd.search.*", "cmd.discovery.*", "DiscoveryService", "frecency reset"]
negative_constraints:
  - Do not rename existing GUI commands or add a parallel cmd.discovery.* GUI family in this compile.
  - Do not let command aliases create a second discovery canon.
owner_hints: [Plans/UI_Command_Catalog.md, Plans/FinalGUISpec.md, Plans/storage-plan.md]
```
