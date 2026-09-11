# Shard 041: Cumulative v3 UI Command Catalog Dispositions and Re-use (2026-09-07)

Source: `Plans/UI_Command_Catalog.md`

Source lines: L12755-L12834

Source SHA256: `69f878743253f8b232830d8fbe19db0e79271ce2110dffce9f68f0a7fb5af31a`

---

## Cumulative v3 UI Command Catalog Dispositions and Re-use (2026-09-07)

This section incorporates the cumulative command catalog entries and exact reuse alignments in
accordance with APR-014, APR-019, and APR-023, reflecting `COMMAND_DISPOSITION.md`.

### 15. UI Command Catalog Dispositions and Exact Reuse Rules (APR-023)

- **Exact Command Reuse:**
  1. `cmd.bsd.set`: Sets BSD operational mode (Off / Auto / On).
  2. `cmd.bsd.configure`: Persists BSD policy, trigger sensitivity, catch-up, and cooldown.
  3. `cmd.bsd.workflow.configure`: Updates stage bindings across development stages.
  4. `cmd.bsd.finding.open`: Navigates to a specific BSD finding.
  5. `cmd.bsd.open_transcript`: Navigates to the BSD advisor transcript.
  6. `cmd.bsd.open_usage`: Navigates to BSD usage attribution.
  7. `cmd.collaboration.configure`: Configures collaborative workflow parameters.
  8. `cmd.collaboration.start`: Freezes active roster and launches collaborative execution.
  9. `cmd.chat.crew_auto.open_config`: Opens Crew Auto configuration.
  10. `cmd.chat.crew_auto.set`: Commits Crew Auto enablement via Settings transaction.
  11. `cmd.chat.plan.build`: Dispatches plan build. Uses `execution_topology: goal_driven | direct`
      discriminator payload; `cmd.chat.plan.build_as_goal` is prohibited.
  12. `cmd.chat.plan.schedule_build`: Schedules a future plan build at an exact timestamp.
  13. `cmd.chat.schedule_message`: Creates a scheduled chat prompt.
  14. `cmd.chat.schedule_message.update`: Atomically mutates a pending scheduled message.
  15. `cmd.chat.schedule_message.cancel`: Cancels and fences a scheduled message.
  16. `cmd.execution_window.create` / `.update` / `.cancel`: Manages execution window reservations.
  17. `cmd.runtime.quota_resume.set`: Sets quota auto-resume consent.
- **Local Presentation and Demo Separation:** Pure visual state toggles are classified as
  `LOCAL_PRESENTATION`. Replays, sample loaders, and test harnesses are classified as
  `CONCEPT_DEMO_ONLY` and prohibited from product catalog registration.

```yaml
plan_unit_id: UCC-159
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: >-
  The UI Command Catalog enforces exact canonical command reuse across Assistant, BSD, Collaboration,
  and Scheduling workflows (cmd.bsd.set, cmd.bsd.configure, cmd.bsd.workflow.configure, cmd.collaboration.configure,
  cmd.collaboration.start, cmd.chat.crew_auto.set, cmd.chat.plan.build with topology discriminator,
  cmd.chat.plan.schedule_build, cmd.chat.schedule_message, cmd.chat.schedule_message.update, cmd.chat.schedule_message.cancel,
  cmd.execution_window.create, cmd.execution_window.update, cmd.execution_window.cancel, cmd.runtime.quota_resume.set).
  Pure visual toggles remain LOCAL_PRESENTATION view state, and demo fixtures
  are classified as CONCEPT_DEMO_ONLY.
gui_related: true
gui_classification_reason: Governs UI command catalog entries, command schemas, and presentation boundaries.
depends_on: [UCC-158]
unblocks: []
acceptance_criteria:
  - Specified actions route to canonical command IDs without creating redundant parallel commands.
  - Plan build uses topology payload discriminator rather than a separate build_as_goal command.
  - Visual toggles are classified as LOCAL_PRESENTATION and demo fixtures as CONCEPT_DEMO_ONLY.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py run-gates
risk_class: command_catalog_duplication
reasoning_tier: high
context_scope: ui_command_catalog
implementation_surfaces:
  - Plans/UI_Command_Catalog.md
  - Plans/Commands_System.md
node_compile_hint:
  mode: command_catalog_specification
  create_worknodes: false
source_lineage:
  - APR-014
  - APR-019
  - APR-023
preserved_exact_tokens:
  - "cmd.chat.plan.build"
  - "cmd.bsd.configure"
  - "cmd.collaboration.start"
  - "CONCEPT_DEMO_ONLY"
  - "LOCAL_PRESENTATION"
negative_constraints:
  - Do not register cmd.chat.plan.build_as_goal.
  - Do not register demo fixtures as product commands.
owner_hints:
  - Plans/UI_Command_Catalog.md
```

ContractRef: ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/Commands_System.md
