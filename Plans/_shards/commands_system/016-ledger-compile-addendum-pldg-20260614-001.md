# Shard 016: Ledger Compile Addendum - pldg-20260614-001

Source: `Plans/Commands_System.md`

Source lines: L3435-L3525

Source SHA256: `f7aaca1cd05a7cdfbf63169869b4c53407c80cebe0b27e7437e4f8111a1c8255`

---

## Ledger Compile Addendum - pldg-20260614-001

### CS-050 - Duplicate Section Seven Recovery Compile Addendum

```yaml
plan_unit_id: CS-050
unit_type: constraint
status: accepted
owner_doc: Plans/Commands_System.md
canonical_text: >-
  Commands_System duplicate Section 7 headings are structural anchor defects. Recovery should preserve command semantics and existing command
  PlanUnits while assigning one canonical Section 7 anchor and demoting duplicate heading text to compatibility/source-lineage where needed.
gui_related: false
gui_classification_reason: Command document section numbering is structural documentation cleanup, not GUI presentation.
depends_on: [CS-001]
unblocks: []
acceptance_criteria:
  - There is one canonical Section 7 command-system anchor after cleanup.
  - Existing command identifiers and command-owner refs are not renamed by heading repair.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - manual heading/anchor review
risk_class: command_anchor_ambiguity
reasoning_tier: low
context_scope: commands_doc_structure
implementation_surfaces: [Plans/Commands_System.md]
node_compile_hint: {mode: structural_heading_recovery, create_worknodes: false}
source_lineage:
  - pldg-20260614-001-part-2-cleanup-fable-audit:atom-0020
  - pldg-20260614-001-part-2-cleanup-fable-audit:atom-0035
  - pldg-20260614-001-part-2-cleanup-fable-audit:atom-0036
  - pldg-20260614-001-part-2-cleanup-fable-audit:atom-0039
preserved_exact_tokens: ["Commands_System has two \"## 7\" sections", "command-owner"]
negative_constraints:
  - Do not change command semantics during heading repair.
owner_hints: [Plans/Commands_System.md]
```

### CS-051 - Goal Slash Reservation And Override Boundary

```yaml
plan_unit_id: CS-051
unit_type: requirement
status: accepted
owner_doc: Plans/Commands_System.md
canonical_text: >-
  Commands_System reserves `/goal` and `/goal again` as Assistant Chat built-in slash commands. `/goal` resolves to `cmd.chat.goal.start`; `/goal again` resolves to `cmd.chat.goal.update`. User Commands and `override_builtin` cannot override these Goal Mode slash commands.
gui_related: false
gui_classification_reason: Slash-command reservation and override policy are command registry behavior, not visual presentation.
depends_on:
  - CS-037
  - CS-039
  - UCC-096
unblocks: []
acceptance_criteria:
  - "`/goal` and `/goal again` are present in the reserved Assistant Chat slash-command set."
  - "`/goal` maps to `cmd.chat.goal.start`."
  - "`/goal again` maps to `cmd.chat.goal.update`."
  - User Commands cannot override these reserved Goal Mode slash commands.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - future command registry validation
risk_class: goal_slash_override_drift
reasoning_tier: standard
context_scope: reserved_slash_commands
implementation_surfaces:
  - Plans/Commands_System.md
  - Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: goal_slash_reservation
  create_worknodes: false
source_lineage:
  - pldg-20260616-001-goal-runtime-system:atom-0017
  - pldg-20260616-001-goal-runtime-system:atom-0024
  - pldg-20260616-001-goal-runtime-system:atom-0025
  - pldg-20260616-001-goal-runtime-system:atom-0030
  - pldg-20260616-001-goal-runtime-system:dec-0008
  - source_ref:audit-20260616-006-goal-runtime-system:SR-018
preserved_exact_tokens:
  - "/goal"
  - "/goal again"
  - "cmd.chat.goal.start"
  - "cmd.chat.goal.update"
  - "override_builtin"
negative_constraints:
  - Do not allow User Commands to override `/goal` or `/goal again`.
  - Do not make Commands_System the semantic owner for Goal Runtime lifecycle behavior.
owner_hints:
  - Plans/Commands_System.md
  - Plans/UI_Command_Catalog.md
```
