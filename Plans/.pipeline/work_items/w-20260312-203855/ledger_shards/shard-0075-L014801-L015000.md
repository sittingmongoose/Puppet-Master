  - shell/navigation language that still lets deep-link behavior live outside a shared route contract
  - stale page and tab assumptions around `Tiers` and widgetized Orchestrator surfaces
- The GUI spec still treats:
  - `resume_url` as a strong standalone deep-link mechanism
  - `Tiers` as a primary page/tab concept
  - Orchestrator widget tabs broadly enough to conflict with the newer `Progress`-only widget composition rule

### Impacted docs
- Primary adoption docs:
  - `Plans/UI_Command_Catalog.md`
  - `Plans/FinalGUISpec.md`

### Contradictions / gaps surfaced
- The command catalog still uses `layout/UI state only` for actions that now have canonical object routing meaning.
- `cmd.panel.switch` is currently overloaded: it mixes pure shell-state switching with contextual object targeting in one args shape.
- `FinalGUISpec.md` still gives `resume_url` more concrete ownership than generic navigation.
- `FinalGUISpec.md` still preserves `Tiers` as both a page concept and a settings grouping label, which will keep reintroducing stale vocabulary.
- The GUI spec’s widget appendix still speaks broadly about Orchestrator widget tabs even though the rewrite direction is:
  - `Progress` widget-composed
  - `Seams`, `Node Graph`, `Evidence`, `History`, and `Ledger` native

### Candidate fixes to carry forward
- In `Plans/UI_Command_Catalog.md`:
  - classify commands as `shell_view`, `navigation_wrapper`, or `domain_action`
  - reclassify worktree selection and thread Usage focus/open as navigation wrappers
  - keep `cmd.panel.switch` pure shell-facing and move object targeting through routed wrappers or normalized route args
- In `Plans/FinalGUISpec.md`:
  - consume `route_target` semantics instead of letting `resume_url` stand as a stronger ad hoc primitive
  - replace stale `Tiers` primary-surface language with the rewrite Orchestrator tab model
  - narrow widget-composition language so only `Progress` is widget-composed inside Orchestrator

### Do-not-forget details
- The catalog structure is not the problem. The command meaning labels are.
- `FinalGUISpec.md` is still a major drift amplifier because it combines shell, page taxonomy, widget, and deep-link language in one doc.

## Research Progress - 2026-03-17 - Wiring, matrix, and evidence normalization limits

### Targeted docs read
- `Plans/UI_Wiring_Rules.md`
- `Plans/Wiring_Matrix.schema.json`
- `Plans/Wiring_Matrix.md`
- `Plans/evidence.schema.json`
- `Plans/Progression_Gates.md`

### Key findings
- The wiring layer is still built around a simple command-binding contract:
  - `ui_element_id`
  - `ui_command_id`
  - `handler_location`
  - `expected_event_types`
- That is enough for direct command dispatch verification, but it does not encode:
  - wrapper normalization
  - deprecated alias mapping
  - route/open contract consumption
  - command classification such as `shell_view` versus `navigation_wrapper`
- `Plans/Wiring_Matrix.schema.json` currently has no fields for command-kind or normalization metadata.
- `Plans/evidence.schema.json` is also too generic to express route/wrapper verification cleanly:
  - `checks[]` only gives `name`, `result`, `details`, and `contract_refs`
  - there is no structured place for wrapper target, alias target, route-payload validation result, or canonical-contract normalization evidence
- `Plans/Progression_Gates.md` and `UI_Wiring_Rules.md` still assume command verification is:
  - schema validation
  - command coverage
  - handler resolution
  - expected event emission
  - unknown-command rejection

### Impacted docs
- Primary owner docs:
  - `Plans/UI_Wiring_Rules.md`
  - `Plans/Wiring_Matrix.schema.json`
  - `Plans/evidence.schema.json`
  - `Plans/Progression_Gates.md`
- Strong adjacent consumer:
  - `Plans/UI_Command_Catalog.md`

### Contradictions / gaps surfaced
- The routing rewrite requires stable wrapper commands that normalize to shared contracts, but the wiring model still treats every command as either direct or UI-only.
- The matrix schema cannot represent “this command is a wrapper over canonical route/open semantics” without smuggling that meaning into prose.
- The evidence schema cannot carry structured normalization proof, so GATE-010 can only verify flat dispatch behavior unless its proof shape expands.

### Candidate fixes to carry forward
- Keep normalization metadata owned by the command-definition side, not by wiring rows.
- Extend the wiring/gate model so it can consume catalog metadata for:
  - `command_kind`
  - normalization kind
  - canonical target contract
- Keep the matrix row itself relatively small; let it reference a command that already carries normalization meaning.
- Extend evidence checks enough to record structured normalization verification instead of only free-form details text.

### Do-not-forget details
- The matrix schema limitation and the evidence schema limitation are different problems.
- The clean fix is catalog-owned normalization metadata consumed by wiring/gates, not a second routing schema inside the matrix.

## Research Progress - 2026-03-17 - Spec-integrity defects in routing-adjacent docs

### Targeted docs read
- `Plans/Crosswalk.md`
- `Plans/usage-feature.md`
- `Plans/FinalGUISpec.md`
- `Plans/Orchestrator_Page.md`

### Key findings
- Several routing-adjacent docs now have plain spec-integrity defects in addition to stale model assumptions.
- `Plans/Crosswalk.md` has duplicated section numbering:
  - `3.13` is used for both `RunGraphView` and `DocumentInlineNotes`
  - `3.14` is used for both `OrchestratorPage` and `TargetedRevisionPass`
- `Plans/usage-feature.md` duplicates the entire `Cost_usage runtime artifact and Show in Ledger / Show in Usage` section back-to-back.
- `Plans/FinalGUISpec.md` still has stale top-level structure for `Tiers`:
  - page table entry
  - section `7.7 Tiers`
  - settings grouping language
- `Plans/Orchestrator_Page.md` still hardcodes:
  - `Tab 2: Tiers`
  - `orchestrator:tiers`
  - mapping from `FinalGUISpec section 7.7`

### Impacted docs
- Primary spec-integrity docs:
  - `Plans/Crosswalk.md`
  - `Plans/usage-feature.md`
  - `Plans/FinalGUISpec.md`
  - `Plans/Orchestrator_Page.md`

### Contradictions / gaps surfaced
- Some of the current drift is not only conceptual. The docs also contain duplicate headings and repeated sections that will make future reconciliation ambiguous even after the design is settled.
- `Crosswalk.md` is especially risky because duplicate numbering weakens its role as a precedence document.
- `usage-feature.md` duplication risks divergent edits during reconciliation.

### Candidate fixes to carry forward
- Treat duplicate numbering and repeated sections as first-class reconciliation tasks, not cosmetic cleanup.
- Repair `Crosswalk.md` numbering before using it as the owner boundary doc for route/open primitives.
- Collapse the duplicated `cost_usage` section in `usage-feature.md` during the same pass that normalizes Usage routing.
- Remove stale `Tiers` page/tab structures from `FinalGUISpec.md` and `Orchestrator_Page.md` in the same reconciliation tranche so they do not keep cross-referencing each other.

### Do-not-forget details
- These are spec-integrity failures, not open design questions.
- They should be fixed in the same pass as the surrounding owner-consumer reconciliation, not deferred as cleanup trivia.

## Research Progress - 2026-03-17 - `resume_url` transport versus shadow-routing contract

### Targeted docs read
- `Plans/Contracts_V0.md`
- `Plans/storage-plan.md`
- `Plans/FinalGUISpec.md`
- `Plans/assistant-chat-design.md`
- `Plans/chain-wizard-flexibility.md`

### Key findings
- `resume_url` is still acting as a shadow routing primitive in multiple docs instead of being treated as serialized transport for canonical route identity.
- The strongest conflict is inside `Plans/Contracts_V0.md` itself:
  - the `wizard.blocked` minimum payload earlier in the file requires `resume_url`
  - a later addendum says `wizard.blocked` carries `resume_url?`
- `Plans/storage-plan.md` continues that ambiguity:
  - blocked-thread and wizard projection families still carry `resume_url?`
- `Plans/FinalGUISpec.md` still treats the deep-link URL as a first-class behavioral object:
  - concrete `puppet-master://wizard/...` format
  - dashboard/thread Resume Wizard behavior defined directly in terms of `resume_url`
- `Plans/chain-wizard-flexibility.md` also still defines `resume_url` as the deep-link to the blocked wizard step.
- `Plans/assistant-chat-design.md` is already closer to the correct boundary for blocked runtime flows:
  - resume/retry controls must map to canonical runtime actions
  - chat must not invent thread-local resume paths

### Impacted docs
- Primary owner-gap docs:
  - `Plans/Contracts_V0.md`
  - `Plans/storage-plan.md`
- Strong stale consumers:
  - `Plans/FinalGUISpec.md`
  - `Plans/chain-wizard-flexibility.md`
- Strong aligned adjacent consumer:
  - `Plans/assistant-chat-design.md`

### Contradictions / gaps surfaced
- `resume_url` is still being used as if it were canonical navigation identity instead of serialized transport.
- Owner docs currently disagree on whether `resume_url` is required or merely carried when present.
- Wizard-blocked flows and thread-blocked flows are both using `resume_url`, but the broader route/open rewrite now requires those flows to normalize through canonical object and scope identity first.

### Candidate fixes to carry forward
- Treat `resume_url` as serialized transport only.
- Make canonical route/object identity primary in owner docs.
- Keep wizard/thread blocked records on:
  - `wizard_id`
  - `wizard_step`
  - `thread_id`
  - blocked/runtime identity where applicable
- Let `resume_url` be a derived serialized field from the canonical route contract, not the stronger source of truth.
- Reconcile the required-versus-carried contradiction for `resume_url` in `Contracts_V0.md` and `storage-plan.md`.

### Do-not-forget details
- This seam is now an owner-doc contradiction, not just a GUI wording issue.
- `assistant-chat-design.md` already contains the right anti-bypass rule for blocked runtime resumes.

## Research Progress - 2026-03-17 - Ref-family split: inspection refs versus navigation refs

### Targeted docs read
- `Plans/Contracts_V0.md`
- `Plans/storage-plan.md`
- `Plans/Runtime_Artifacts_Panel.md`
- `Plans/assistant-chat-design.md`
- `Plans/Orchestrator_Page.md`
