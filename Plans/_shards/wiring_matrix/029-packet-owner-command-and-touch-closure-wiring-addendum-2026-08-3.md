# Shard 029: Packet-owner command and Touch Closure wiring addendum - 2026-08-31

Source: `Plans/Wiring_Matrix.md`

Source lines: L3988-L4061

Source SHA256: `c54cc869d5c77961e7c9cd6707cb055129e493b1f75313fcf6e8a07539fe21a3`

---

## Packet-owner command and Touch Closure wiring addendum - 2026-08-31

The Settings/Onboarding/Doctor/Server/WAN/Backup/Browser/Capture/SCM/Forge/plugin/performance wave uses `Plans/touch_closure.json` as its bidirectional coverage register and `Plans/Wiring_Matrix.production.json` as the production-intent row set. Each canonical command has one catalog entry and one sole handler target, while every GUI-required command has every intended visible consumer enumerated in reverse. Typed local UI actions use the same availability, disabled-reason, accessibility, return-route, and evidence discipline but do not receive fictitious domain handlers or EventRecords.

Current Product Onboarding consumes PWIZ-021's exact thirteen typed local actions and v2 main/connect-existing/deferred stage definitions. It adds no semantic command or production-wiring row. Draft choices and Settings copy previews remain uncommitted; the narrow owner-issued read-only/selected-source-auth exception is checked against actual owner inputs. PJCT-007 owns the one exact Review-bound Project commit chain. Paid-provider setup then Free Models consume that real Project, and explicit paid Skip still offers Free Models. WM-041 carries the reverse-wiring obligations; the roster and phase contract are not duplicated here.

The actions consume `pm.product_onboarding.action_request.v2` -> `pm.product_onboarding.action_result.v2` from the owner schema, including closed phase-gated `local_context`, applied/disabled/rejected results, zero dispatch/write on disabled or rejected outcomes, and no local production receipt. SSYS-036 owns draft copy preview/rebind; MACS-005 owns first-time selected-source sign-in; PJCT-007 owns actual Project commit binding; MS-122 owns post-commit Free Models. Exact durable bounded draft, phase, Project binding and focus continuation follow PWIZ-021/SP-252. Close never completes, Back never undoes/repeats commit, Defer retains the exact continuation, and Details stays ephemeral and owner-command-free. A selected owner route consumes the existing sole owner handler and gains reverse consumers without a wrapper command. The predecessor `cmd.onboarding.first_run.open`, `cmd.onboarding.provider_setup.open`, `cmd.onboarding.provider_setup.use_provider`, `cmd.onboarding.skip_to_planning_wizard`, `cmd.onboarding.free_models.review`, `cmd.onboarding.free_models.defer`, `cmd.onboarding.review_setup`, `cmd.onboarding.open_planning_wizard`, `cmd.onboarding.free_models.refresh`, `cmd.onboarding.free_models.retry`, and `cmd.onboarding.free_models.setup` spellings are source-lineage-only: none is a production row or compatibility alias. The separate packet candidates `cmd.onboarding.back`, `cmd.onboarding.cancel`, `cmd.onboarding.continue`, `cmd.onboarding.defer`, `cmd.onboarding.finish`, `cmd.onboarding.open_details`, `cmd.onboarding.resume`, and `cmd.onboarding.skip` are source-lineage candidate tokens only and are rejected as commands, aliases, and handlers because typed local `ui.onboarding.*` actions own their semantics.

Current Guided Tour consumes the v3 owner schema's eleven typed local actions, including `ui.guided_tour.show_me`, in exact `chat_teacher` -> `workspace` -> `planning_wizard` order. Teacher selection, local send, and same-answer ELI5 reuse `cmd.persona.select`, `cmd.chat.send`, and `cmd.chat.eli5.set`; panel docking, workspace layout, and widget practice retain their existing owners and command identities. Try it and Show Me share mounted handlers and observed predicates. Planning receives at least half of meaningful actions and dwell and includes genuine answer editing. Skip restores captured state; Finish restores by default or keeps layout only on explicit selection through `ui.guided_tour.finish`, removes practice content, and lands on the real Planning Wizard with the committed Project and no auto-start. Safe close/reload requires owner-revalidated checkpoint and original restoration references, not an ephemeral-only session or an invented baseline. `ui.guided_tour.restore_layout`, `ui.guided_tour.keep_layout`, and `ui.guided_tour.toggle_reduced_motion` remain retired action IDs; explicit Keep is a finish disposition and Reduced Motion remains Settings-owned. Touch Closure adds reverse consumers without duplicate catalog/production rows, and records missing machine/native/durable evidence as partial rather than runtime closure.

The retired Settings spellings `cmd.settings.open_notifications`, `cmd.settings.category.reset`, and `cmd.settings.suggestion.dismiss` are likewise source-lineage-only and are neither production rows nor compatibility aliases. Exact Settings navigation uses `cmd.settings.open`; reset and dismissal compose `cmd.settings.transaction.preview` plus `cmd.settings.transaction.apply`.

Rows whose Rust/native dispatcher, owner handler, persistence adapter, or runtime receipt does not exist remain `planned`/`partial` with explicit evidence requirements. PMConcept7 action logs, fixture adapters, schemas, and browser verifiers are concept/static evidence only. Event candidates stay `receipt_only_no_eventrecord_pending_event_authority` unless their individual family is admitted into `Plans/event_family_registry.json` with a closed payload contract.

ContractRef: ContractName:Plans/touch_closure.json, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/Commands_System.md, ContractName:Plans/event_family_registry.json

### WM-046 - Bidirectional Touch Closure and production-intent wiring

```yaml
plan_unit_id: WM-046
unit_type: requirement
status: accepted
owner_doc: Plans/Wiring_Matrix.md
canonical_text: >-
  Every touched canonical command has exactly one catalog identity, one request/result/error/availability/permission
  contract, one sole owner-handler route, one production-intent wiring row, and reverse coverage to every intended GUI
  consumer. Every touched local UI action has a typed action contract, accessibility and disabled behavior, exact return,
  and reverse consumer coverage without a false domain handler. The hash-bound SSYS-023 packet disposition registry is
  transitive input: canonical replacements require rows, typed local actions require rows, and retired or rejected packet
  spellings remain non-actionable. Missing native dispatch, handler, persistence, event admission, or runtime receipt
  remains explicitly planned or partial; schemas, fixtures, PMConcept7 simulations, and browser evidence cannot satisfy
  those dimensions.
gui_related: true
gui_classification_reason: Connects every touched visible control and command to handlers, consumers, responses, and evidence.
split_recommended: false
depends_on: [WM-045, DR-040, UIW-013, SSYS-023]
unblocks: []
acceptance_criteria:
  - Commands, handlers, and GUI consumers are each complete in both directions with no duplicate primary ID or owner.
  - Typed local actions carry availability, disabled reason, accessibility, and exact-return evidence without fictitious runtime command rows.
  - "Product Onboarding exposes exactly the thirteen `ui.onboarding.*` typed local actions and routes owner work through existing owner commands/handlers; no `cmd.onboarding.*` production row, compatibility alias, generic handler, or EventRecord is admitted."
  - "Product Onboarding consumes the PWIZ-021 v2 stage/phase definitions and thirteen local actions: bounded draft and explicit Settings preview, narrowly admitted precommit read/source authentication, PJCT-007 exact Review commit, actual Project-bound paid-provider then Free Models setup, and non-replaying phase-safe continuation. Existing owner rows enumerate these reverse consumers without changing command/handler rosters."
  - "Every Product Onboarding request carries the closed normalized secret-free local_context; more_ways and skip variants are exact and non-ambiguous, and arbitrary/raw/secret-bearing context is rejected."
  - "Guided Tour consumes the v3 owner schema's eleven typed local actions in Chat/Teacher, workspace, Planning Wizard order; the shared Show Me path, Persona/Chat commands, panel/workspace/widget practice, safe checkpoint, default restoration or explicit Keep, and final real-Wizard handoff have exact reverse consumers without duplicate domain owners or production rows. Missing machine/native/durable proof remains partial."
  - "The packet candidates `cmd.onboarding.back`, `cmd.onboarding.cancel`, `cmd.onboarding.continue`, `cmd.onboarding.defer`, `cmd.onboarding.finish`, `cmd.onboarding.open_details`, `cmd.onboarding.resume`, and `cmd.onboarding.skip` are source-lineage only and rejected as commands, aliases, and handlers."
  - "`cmd.settings.open_notifications`, `cmd.settings.category.reset`, and `cmd.settings.suggestion.dismiss` remain source-lineage-only and appear as neither production rows nor compatibility aliases."
  - "The exact seven local actions `settings.search.focus`, `settings.search.result.activate`, `settings.category.select`, `settings.subcategory.select`, `settings.setting.focus`, `settings.scope.details.open`, and `settings.provider.installation.select` have Touch Closure rows and no domain handlers."
  - "The named projections `settings.manager.teacher-help`, `settings.manager.project-search-index`, and `settings.manager.dry-method` have presentation rows, while their four owner commands retain their existing sole owner routes and reverse consumers."
  - The 80-token Settings registry retains the exact 41/7/1/31 disposition partition, and no replacement spelling, retired bakeoff token, or rejected token becomes a command or alias.
  - Orphan controls, commands without handlers, handlers without commands, missing reverse consumers, duplicate IDs, stale PlanRefs, and incomplete Touch Closure rows fail gates.
  - Event effects remain receipt-only unless individually admitted by Event Authority.
  - Concept, static, browser, native-runtime, visual, motion, accessibility, performance, and readiness evidence classes remain separate.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py validate-wiring-matrix
  - python3 scripts/pm-touch-closure-verify.py
  - python3 scripts/pm-plan-index.py validate
risk_class: one_way_or_false_production_wiring
reasoning_tier: high
context_scope: packet_owner_touch_closure_wiring
implementation_surfaces: [Plans/Wiring_Matrix.md, Plans/Wiring_Matrix.production.json, Plans/Wiring_Matrix.production.exclusions.json, Plans/touch_closure.json]
node_compile_hint: {mode: touch_closure_wiring, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - approved Parallel Canon, Settings, and PMConcept7 Integration Plan
  - scratchpad/approval-gated-touch-closure-packet-custody-20260831-001/central-contract-map/central-contract-map.json
  - scratchpad/pm-integration-20260831/audits/settings-owner-closure/settings-owner-central-delta-proposal.json
preserved_exact_tokens: [planned, partial, receipt_only_no_eventrecord_pending_event_authority, "ui.onboarding.*", cmd.settings.open, cmd.settings.transaction.preview, cmd.settings.transaction.apply]
negative_constraints:
  - Do not claim production wiring from PMConcept7 or browser evidence.
  - Do not assign two handlers or owners to one primary command.
  - Do not admit an EventRecord family through a wiring row.
  - Do not omit reverse GUI coverage for a GUI-required command.
  - "Do not normalize a predecessor `cmd.onboarding.*` or retired Settings spelling into a production row or compatibility alias."
owner_hints: [Plans/Wiring_Matrix.md, Plans/UI_Command_Catalog.md, Plans/Commands_System.md]
```
