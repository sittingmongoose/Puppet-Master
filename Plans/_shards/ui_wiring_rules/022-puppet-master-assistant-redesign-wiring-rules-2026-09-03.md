# Shard 022: Puppet Master Assistant Redesign Wiring Rules - 2026-09-03

Source: `Plans/UI_Wiring_Rules.md`

Source lines: L1136-L1201

Source SHA256: `bb2048d39770ab3c8ab6bf24519c89ba8660de407a4bab5525e780f23cfec60a`

---

## Puppet Master Assistant Redesign Wiring Rules - 2026-09-03

The Assistant redesign adds fifty-five production-intent wiring rows under the `assistant_redesign.*` element namespace. The following rules govern them and any later row in the same families.

**One producer, one command, one handler.** Every mutating Assistant control names exactly one registered command ID and exactly one sole future target handler. A control that cannot name a registered command renders disabled with `command_not_registered`. A page-local action ID, an alias, a fixture, a client timer, or a toast may never stand in for an unregistered command, and a successful-looking receipt may never be produced by the surface itself.

**View-local intents are declared, not disguised.** Three rows carry a view-local or owner-internal effect rather than a user-facing command: composer text entry updating the `ComposerBuffer`, parent To-Do expansion, and Plan view switching between Rich Text and Markdown. Each is declared explicitly as `(view-local intent)` in its wiring row. A view-local intent must not emit a domain event, must not write a `TodoTransition`, and must not be presented in the catalog as a command.

**Availability and disabled reason come from the owner.** Every row reads `state.assistant_redesign.<selector>.availability` and `state.assistant_redesign.<selector>.disabled_reason` from its semantic owner before dispatch. A surface that cannot read the owner projection renders the control disabled rather than optimistic, and it announces the exact owner reason rather than a generic one.

**Negative paths are part of the wiring row.** Each row declares the specific thing it must not do — no Draft UI, no direct Plan edit, no bulk To-Do completion, no unrelated composer text on a component send, no auto-resume after a manual stop, no provider-native state read back as canonical. A wiring row whose negative path is not asserted by a test is not closed.

**Manual stop outranks every automatic producer.** Any row whose producer is a schedule, an execution window, a quota resume, Crew Auto, Goal continuation, or a provider retry must re-check the latched `user_stop_epoch` immediately before dispatch and abort with the exact failed clause when it has moved.

**Read-only advisors are never in the mutation path.** Back Seat Driver rows produce advice records and projections only. No BSD row may be a precondition of a primary-flow row, and no primary-flow row may read BSD health to decide whether it may proceed.

**Exact-version targets revalidate.** Any row that dispatches against a Plan, a message snapshot, or a frozen review target carries the exact version and hash, revalidates immediately before dispatch, and aborts rather than rebinding to a newer target.

### UIW-018 - Assistant Redesign Row Discipline And Declared View-Local Intents

```yaml
plan_unit_id: UIW-018
unit_type: wiring_rule
status: accepted
owner_doc: Plans/UI_Wiring_Rules.md
canonical_text: >-
  Every Assistant redesign wiring row names one producer, one registered command ID, and one sole future target handler, reads its owner availability and exact disabled reason from the declared state selectors before dispatch, and renders disabled with command_not_registered when no registered command exists. A row carrying a view-local or owner-internal effect rather than a user-facing command is declared explicitly as a view-local intent, emits no domain event, writes no transition record, and receives no catalog command row. Each row declares its specific negative path and is not closed until a test asserts it. A row whose producer is a schedule, window, quota resume, Crew Auto, Goal continuation, or provider retry re-checks the latched user_stop_epoch immediately before dispatch and aborts with the exact failed clause when it has moved. Back Seat Driver rows produce advice records and projections only and may never be a precondition of a primary-flow row. Rows dispatching against a Plan, message snapshot, or frozen review target carry the exact version and hash, revalidate immediately before dispatch, and abort rather than rebinding.
gui_related: true
gui_classification_reason: These rules govern how every Assistant control resolves availability, dispatch, and disabled state.
depends_on: [UIW-017]
unblocks: []
acceptance_criteria:
  - Every row names one command or is declared a view-local intent.
  - No page-local action, alias, fixture, timer, or toast simulates a registered command.
  - Every declared negative path has an asserting test.
  - Automatic producers re-check the stop epoch immediately before dispatch.
  - No primary-flow row depends on BSD health.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py validate-wiring-matrix
  - python3 scripts/pm-plans-verify.py run-gates
risk_class: simulated_command_success_or_undeclared_local_action
reasoning_tier: high
context_scope: assistant_redesign_wiring_rules
implementation_surfaces:
  - Plans/UI_Wiring_Rules.md
  - Plans/Wiring_Matrix.production.json
  - Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: static_wiring_rule_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - pm-assistant-implementation-2026-09-02-recovered:machine/wiring.json
  - pm-assistant-implementation-2026-09-02-recovered:05_GUI_WIRING_MATRIX.md
  - pm-assistant-implementation-2026-09-02-recovered:DRY-004
preserved_exact_tokens:
  - "command_not_registered"
  - "handler_unavailable"
  - "user_stop_epoch"
negative_constraints:
  - Do not let a view-local intent emit a domain event or a transition record.
  - Do not make a primary-flow row depend on Back Seat Driver.
  - Do not rebind an exact-version dispatch to a newer target.
owner_hints:
  - Plans/UI_Wiring_Rules.md
```
