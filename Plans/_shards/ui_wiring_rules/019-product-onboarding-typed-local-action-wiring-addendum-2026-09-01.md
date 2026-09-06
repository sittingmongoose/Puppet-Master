# Shard 019: Product Onboarding typed-local action wiring addendum - 2026-09-01

Source: `Plans/UI_Wiring_Rules.md`

Source lines: L960-L1065

Source SHA256: `b0c77ecbeb53ef195661544a2bf03d3adc352ca3524d3ccee5e53c5d101ce5d8`

---

## Product Onboarding typed-local action wiring addendum - 2026-09-01

Product Onboarding remains one bounded modal over the visible, input-blocked application. It does not become a routed page,
nested modal, substitute application frame, or browser-history surface. No browser/route Back or breadcrumb chrome is added;
the existing typed `ui.onboarding.back` control changes only the modal's bounded stage or owner-branch presentation.

The exact current typed-local action census is thirteen:
`ui.onboarding.start`, `ui.onboarding.next`, `ui.onboarding.back`, `ui.onboarding.close`, `ui.onboarding.skip`,
`ui.onboarding.defer`, `ui.onboarding.open_details`, `ui.onboarding.more_ways`,
`ui.onboarding.choose_simple_path`, `ui.onboarding.open_owner_flow`,
`ui.onboarding.run_automatic_preparation`, `ui.onboarding.choose_first_project`, and `ui.onboarding.finish`.
Every actionable control emits exactly one of these IDs. They are not `UICommand`s, catalog aliases, handler names,
EventRecords, or production-wiring rows.

Each action emits one closed `pm.product_onboarding.action_request.v1` carrying the action/session/stage identity,
expected revision, continuation generation, bounded choice, required `local_context`, optional owner route, actor,
idempotency key, source surface, and exact return-focus identity. `local_context` contains only normalized, secret-free
`intent`, optional `review_confirmation`, `scope`, `branch_kind`, `branch_step`, `selection_ref`, `target_ref`, `owner_operation_ref`,
`owner_branch_ref`, `expanded`, `start_tour`, and `recovery_condition`. It has `additionalProperties=false` semantics:
arbitrary keys, raw payload copies, free-form control payloads, and secret-bearing values are rejected and never logged or
persisted. It resolves to one `pm.product_onboarding.action_result.v1` carrying
`status=applied|disabled|rejected`, before/after stage, resulting session status, closed local effect, session-write flag,
optional continuation snapshot, ephemeral Details state, optional owner route/operation refs,
`production_receipt_ref=null` for local choreography, `owner_mutation_claimed=false`, exact error/disabled reason, focus
return, revision, and continuation generation. Disabled or rejected actions have `local_effect=none`, write no session or
continuation, dispatch no owner route, carry no production receipt, and remain keyboard/focus describable without
activating.

| Typed local action | Required local result boundary |
|---|---|
| `ui.onboarding.defer` | Before modal dismissal, durably write one resumable continuation snapshot preserving exact stage, selected path, active branch, bounded history, revision, continuation generation, initiating Client, and return-focus identity. It does not complete or skip the session and claims no owner mutation. |
| `ui.onboarding.close` | Dismiss the modal and restore initiating focus without marking the session completed, skipped, deferred, or any owner Ready. It does not silently cancel owner work. |
| `ui.onboarding.skip` | Record the explicit `skipped` session outcome without implying Onboarding-path completion or owner readiness. |
| `ui.onboarding.open_details` | Toggle one bounded same-stage Details disclosure ephemerally; write no `OnboardingSession`, launch no owner route/command, and return focus to the Details toggle. |
| `ui.onboarding.more_ways` | A stage disclosure uses `intent=toggle_setup_options`, `choice=other_setup_options|other_project_options`, matching `scope=setup_options|project_options`, and `branch_kind=null`. A branch-local disclosure/step/selection/consent update uses `intent=update_branch_state`, `choice=null`, a canonical non-null `branch_kind`, and only relevant normalized branch/selection/disclosure fields; its result is `disclosure_opened|disclosure_closed|branch_state_updated`. |
| `ui.onboarding.skip` | Whole-session Skip uses `intent=skip_product_onboarding`, `scope=product_onboarding`, `choice=null`, and returns `session_skipped` with skipped session status. Optional Project or Remote Access Skip uses `intent=skip_optional_scope`, `choice=skip_project|skip_remote_access`, matching `scope=first_project|remote_access` and `branch_kind=project|remote-access`, and returns `optional_scope_skipped` while the session stays active. |

When `ui.onboarding.open_owner_flow` or another owner-launch action is available, its typed route/intent dispatches only
the target owner's existing canonical command and sole handler and returns through the revisioned continuation. Product
Onboarding receives no generic mutation handler. The packet candidate tokens `cmd.onboarding.back`,
`cmd.onboarding.cancel`, `cmd.onboarding.continue`, `cmd.onboarding.defer`, `cmd.onboarding.finish`,
`cmd.onboarding.open_details`, `cmd.onboarding.resume`, and `cmd.onboarding.skip` are source-lineage candidate tokens only
and are rejected as commands, aliases, handlers, and production rows because the typed local `ui.onboarding.*` actions
own those semantics. This is separate from UCC-106's eleven retained provider-first command-era tokens, whose count and
lineage remain unchanged.

Schema/fixture validation, transform assertions, the generated-artifact static gate, and
`Concepts/pm7-tools/verify/onboarding_cinematic.mjs` cover vocabulary, markup, request/result, required closed
secret-free `local_context`, ambiguous/missing/additional/raw/secret-bearing-context rejection, both `more_ways`
variants, both global/optional `skip` variants, disabled/rejected, modal/focus, durable defer, explicit Skip,
non-completing Close, and ephemeral Details behavior at their declared
evidence layers. They do not prove a native Slint controller, native Storage binding, dispatcher/handler execution,
production persistence, runtime behavior, accessibility certification, motion quality, or visual acceptance.

ContractRef: ContractName:Plans/Planning_Wizard.md#PWIZ-021, ContractName:Plans/Planning_Wizard.md#PWIZ-022, ContractName:Plans/UI_Command_Catalog.md#UCC-106, ContractName:Plans/Wiring_Matrix.md#WM-041, SchemaID:pm.product_onboarding.action_request.v1, SchemaID:pm.product_onboarding.action_result.v1

### UIW-015 - Product Onboarding typed-local request/result closure

```yaml
plan_unit_id: UIW-015
unit_type: wiring_contract
status: accepted
owner_doc: Plans/UI_Wiring_Rules.md
canonical_text: >-
  Product Onboarding exposes exactly thirteen typed local ui.onboarding.* actions through the closed action-request and
  action-result envelopes. Every control has one action, accessible availability/disabled behavior, deterministic local
  result and focus return, and an owner route only where the action explicitly launches the existing owner command.
  Every request includes closed normalized secret-free local_context, and more_ways/skip variants are disambiguated by
  exact intent, scope, choice, branch, and result-effect combinations rather than arbitrary control payload.
  Defer durably preserves exact continuation, Close is a non-completion dismissal, Skip records a skipped session, and
  Details is ephemeral/same-stage/non-persistent/owner-command-free. No cmd.onboarding.* command, alias, handler,
  EventRecord, production row, full-page route, or breadcrumb chrome is created.
gui_related: true
gui_classification_reason: Defines the visible modal controls, activation/result behavior, disabled presentation, focus return, and Details disclosure.
split_recommended: false
depends_on: [PWIZ-021, PWIZ-022, UCC-106, WM-041, UIW-013]
unblocks: []
acceptance_criteria:
  - The exact action census is the thirteen named ui.onboarding.* IDs, and every authored control carries exactly one typed local action.
  - Every request/result validates against pm.product_onboarding.action_request.v1 and pm.product_onboarding.action_result.v1 with closed applied, disabled, and rejected outcomes.
  - local_context is required and closed to intent, scope, branch_kind, branch_step, selection_ref, target_ref, owner_operation_ref, owner_branch_ref, expanded, start_tour, and recovery_condition; missing/additional/arbitrary/raw/secret-bearing context is rejected.
  - more_ways stage disclosure and branch-local state updates cannot normalize into each other, and whole-session Skip cannot normalize into optional Project/Remote-Access Skip; exact request fields and result effects/statuses prove the selected variant.
  - Disabled/rejected results have no local effect, write, continuation, owner route, owner operation, or production receipt and expose exact accessible reasons.
  - Defer persists exact stage/path/branch/history/revision/continuation/initiating-Client/focus return before dismissal; Close does not complete; Skip is explicitly skipped; Details remains same-stage and ephemeral.
  - The eight named packet candidate cmd.onboarding.* tokens are source-lineage only and receive no command, alias, handler, or production row; UCC-106's eleven retired command-era tokens retain their separate lineage count.
  - The flow stays a bounded modal with no route-history or breadcrumb chrome, and no static/browser evidence is treated as native or runtime proof.
validation_surfaces: [Plans/product_onboarding_contracts.schema.json, Plans/product_onboarding_contract_fixtures.json, Concepts/pm7-tools/onboarding_cinematic_source.py, Concepts/pm7-tools/verify/onboarding_cinematic.mjs, future native Product Onboarding request/result and accessibility fixtures]
risk_class: onboarding_local_action_or_result_wiring_drift
reasoning_tier: high
context_scope: product_onboarding_typed_local_request_result
implementation_surfaces: [Plans/UI_Wiring_Rules.md, Plans/Planning_Wizard.md, Plans/UI_Command_Catalog.md, Plans/Wiring_Matrix.md, Plans/product_onboarding_contracts.schema.json, Concepts/pm7-tools/onboarding_cinematic_source.py]
node_compile_hint: {mode: product_onboarding_local_action_wiring, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - approved current Product Onboarding source/schema reconciliation
  - Plans/Planning_Wizard.md#PWIZ-021
  - Plans/product_onboarding_contracts.schema.json
preserved_exact_tokens: [ui.onboarding.start, ui.onboarding.next, ui.onboarding.back, ui.onboarding.close, ui.onboarding.skip, ui.onboarding.defer, ui.onboarding.open_details, ui.onboarding.more_ways, ui.onboarding.choose_simple_path, ui.onboarding.open_owner_flow, ui.onboarding.run_automatic_preparation, ui.onboarding.choose_first_project, ui.onboarding.finish, pm.product_onboarding.action_request.v1, pm.product_onboarding.action_result.v1, local_context, skip_product_onboarding, skip_optional_scope, toggle_setup_options, update_branch_state, session_skipped, optional_scope_skipped, cmd.onboarding.back, cmd.onboarding.cancel, cmd.onboarding.continue, cmd.onboarding.defer, cmd.onboarding.finish, cmd.onboarding.open_details, cmd.onboarding.resume, cmd.onboarding.skip]
negative_constraints:
  - Do not register, alias, normalize, wire, or assign handlers to packet candidate cmd.onboarding.* tokens.
  - Do not fabricate an owner mutation, production receipt, EventRecord, or durable write from local Details or a disabled/rejected result.
  - Do not conflate Close, Skip, Defer, Finish, or Ready state.
  - Do not accept open-ended local_context, arbitrary/raw payload copies, secret-bearing values, or ambiguous more_ways/skip combinations.
  - Do not turn Product Onboarding into a page, nested modal, route-history surface, or breadcrumb flow.
  - Do not claim native Slint, Storage, dispatcher, handler, runtime, accessibility, motion, or visual proof from schemas, fixtures, static assertions, or browser checks.
owner_hints: [Plans/UI_Wiring_Rules.md, Plans/Planning_Wizard.md, Plans/UI_Command_Catalog.md, Plans/Wiring_Matrix.md]
```
