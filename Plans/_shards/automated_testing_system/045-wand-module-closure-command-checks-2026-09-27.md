# Shard 045: Wand module closure command checks — 2026-09-27

Source: `Plans/Automated_Testing_System.md`

Source lines: L5745-L5814

Source SHA256: `20e59008631ae2c3a0122f373805405bd484d41f8d39b97737b9d6e68f8ad7b7`

---

## Wand module closure command checks — 2026-09-27

This section holds ATS-066, the static command-layer checks for the two command identities and the ELI5 wiring that the wand-module closure wave added (UI_Command_Catalog UCC-174 and UCC-175, Commands_System CS-087 and CDRY-023, Wiring_Matrix WM-064).

### ATS-066 - Closure-Wave Command Identity And Wiring Checks

These are static checks at the command layer for the closure-wave rows (UCC-174, UCC-175, CS-087, CDRY-023, WM-064). They read the catalog, the production wiring, its exclusions and the contract schemas. The runtime behaviour belongs to the owners' own acceptance units: ATS-064 for the pause, and the ELI5 owner's unit for switching and the extra reply. These checks prove neither behaviour.

```yaml
plan_unit_id: ATS-066
unit_type: validation_criterion
status: accepted
owner_doc: Plans/Automated_Testing_System.md
canonical_text: >-
  The static command checks prove the closure-wave identities against the catalog, the production
  wiring, its exclusions and the contract schemas. cmd.chat.eli5.explain_reply and
  cmd.runtime.automation_pause.set are each registered exactly once, name one sole handler and one
  request and result pair, and have exactly one candidate exclusion and no production wiring entry
  until admission. assistant.redesign.w_051.chat_eli5_set is raised by exactly eli5_sheet and
  composer, never by the wand row, and ELI5ThreadOverrideRequest admits exactly on, off and inherit.
  No wiring entry names an automatic producer for cmd.runtime.automation_pause.set, and
  AutomationPauseSetRequest carries paused. No identity exists for cmd.runtime.automation_stop.set, an
  ELI5 inherit command, a project-level ELI5 command or live helper text. Every census control marked
  New resolves to a registered UCC-171 or UCC-174 row. These are static checks only; every command
  stays handler_unavailable, and the runtime proof that a switch never writes a second reply, that
  Explain this reply simply writes one, and that only the user clears the pause is NOT_RUN here.
gui_related: true
gui_classification_reason: "Checks the command identities and producer surfaces behind the visible ELI5 sheet, ELI5 dot, Explain this reply simply action and Pause all automations switch."
split_recommended: false
depends_on: [UCC-174, UCC-175, CS-087, CDRY-023, WM-064]
unblocks: []
acceptance_criteria:
  - "Each listed identity, surface and value check fails when its row, exclusion, surface list or enum is changed."
  - "No check is reported as handler, runtime or readiness evidence."
validation_surfaces:
  - python3 scripts/pm-plans-verify.py validate-wiring-matrix
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: static_fixture_or_false_execution_claim
reasoning_tier: medium
context_scope: assistant_wand_module_commands
implementation_surfaces:
  - Plans/Automated_Testing_System.md
  - Plans/Wiring_Matrix.production.json
  - Plans/Wiring_Matrix.production.exclusions.json
node_compile_hint:
  mode: static_contract_fixture_gate_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/UI_Command_Catalog.md#UCC-174"
  - "Plans/Commands_System.md#CS-087"
  - "Plans/Decision_Log.md#DL-126, #DL-136"
  - "Plans/ledgers/v2/pldg-20260927-006-wand-command-census/records/design_atoms.jsonl"
preserved_exact_tokens:
  - "cmd.chat.eli5.explain_reply"
  - "cmd.runtime.automation_pause.set"
  - "assistant.redesign.w_051.chat_eli5_set"
  - "ELI5ThreadOverrideRequest"
  - "AutomationPauseSetRequest"
  - "cmd.runtime.automation_stop.set"
  - "NOT_RUN"
negative_constraints:
  - "Do not report these static checks as proof of the pause, the ELI5 switch or the extra reply at runtime."
  - "Do not add an automatic producer or a second ELI5 wiring entry to make a check pass."
owner_hints:
  - Plans/Automated_Testing_System.md
```

ContractRef: ContractName:Plans/UI_Command_Catalog.md#UCC-174, ContractName:Plans/Commands_System.md#CS-087, ContractName:Plans/Wiring_Matrix.md#WM-064, ContractName:Plans/Automated_Testing_System.md#ATS-064
