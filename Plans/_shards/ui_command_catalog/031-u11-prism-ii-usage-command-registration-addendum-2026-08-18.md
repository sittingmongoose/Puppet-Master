# Shard 031: u11 Prism II Usage Command Registration Addendum - 2026-08-18

Source: `Plans/UI_Command_Catalog.md`

Source lines: L11528-L11639

Source SHA256: `48f2f431bc886525e5510bb8e41fad60dbbf4147bb6d4ee78cee4261da7f608d`

---

## u11 Prism II Usage Command Registration Addendum - 2026-08-18

This addendum registers the one new canonical command the u11 Prism II Usage concept establishes, records
the candidate it rejects, and binds the concept's Settings destinations to the canonical Settings deep-link
identity. It creates no WorkNodes, NodeSeeds, executable queues, implementation files, runtime artifacts,
production build tasks, final manifests, or PNC-019 receipts.

The concept reuses existing catalog rows wherever an owner contract already covers the action:
`cmd.usage.refresh` and `cmd.usage.export` (UCC-116), `cmd.nav.open_usage_subject` (UCC-109),
`cmd.nav.open_subject`, `cmd.provider.switch_route` and `cmd.account.select_profile` (UCC-116), the thread
context detail family, and the `cmd.widget.*` layout family. Only the row below is new.

### New command ID

| Command ID | Typed arguments and effect | Owner |
|---|---|---|
| `cmd.usage.forecast.request` | Usage forecast request envelope in, labelled forecast projection out; receipt/projection effect with no declared event family; state selector `state.commands.usage_forecast_request.availability` and disabled reasons `stale_projection`, `capability_unavailable`, `target_missing`, `permission_required`, `policy_denied`; handler `handlers::usage::request_forecast` | `Plans/Commands_System.md` CS-067 |

The id is legal as written. `Plans/UI_Command_Catalog.md` UCC-006 sets the canonical shape as lowercase,
dot-separated, `cmd.`-prefixed with no segment cap, and `Plans/Wiring_Matrix.schema.json` enforces an
unbounded dotted pattern; the shared-runtime command-name normalization boundary in `Plans/DRY_Rules.md` is
a dedup and owner-routing disposition table, not a segment-count rule, and it normalizes *toward* longer ids
in two of its own rows. Hundreds of certified catalog rows already carry three or more segments.

### Rejected candidate

| Token | Disposition | Canonical target and notes |
|---|---|---|
| `cmd.provider.usage.open_management` | rejected candidate; not registered and no alias | Provider/account/panel aggregate details are local projections and dispatch nothing. Provider setup or management opens the owning Settings destination through `cmd.settings.open`; this rejected token does not normalize to `cmd.nav.open_usage_subject` or any other command. The token is recorded in `Plans/Wiring_Matrix.production.exclusions.json` and must receive neither a primary production wiring row nor an alias. |

### Settings destination identity

Usage never owns a Settings value. A Usage affordance that would change one deep-links to the owning
Settings surface through the existing `cmd.settings.open` row, whose canonical envelope is
`pm.settings_route_request.v1` and whose production-intent row is `catalog.settings_open`. The provider
setup/management destination uses `target_type=setting` and
`setting_id=ai.accounts.provider-connections` from `Plans/settings_inventory.json`. The former
`open(category, focusSettingId)` envelope and the concept's manager/section/focus-reason vocabulary are
superseded inputs; they must migrate before dispatch and carry no primary catalog standing.

ContractRef: ContractName:Plans/Commands_System.md, ContractName:Plans/Wiring_Matrix.md, ContractName:Plans/settings_inventory.json, ContractName:Plans/FinalGUISpec.md

### UCC-146 - Usage Forecast Command Registration And Settings Destination Identity

```yaml
plan_unit_id: UCC-146
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: >-
  The catalog registers exactly one new canonical Usage command, cmd.usage.forecast.request, with typed
  request and result references, a state selector, a closed disabled-reason set, one sole handler, and a
  receipt or projection effect that carries the missing-event-registration disposition while the Event
  Authority denominator remains UNKNOWN_OPEN. Its dotted shape is legal under UCC-006, which sets no segment
  cap and is machine-enforced by an unbounded dotted pattern. cmd.provider.usage.open_management is
  adjudicated as a rejected candidate with no alias: provider, account, and presentation-panel aggregate
  details are local projections that dispatch no UICommand, while provider setup or management reuses
  cmd.settings.open. It receives no primary row and is recorded as an excluded token. Usage-initiated
  Settings navigation registers no new command: it reuses cmd.settings.open with the typed setting target
  ai.accounts.provider-connections from the canonical Settings inventory, and the concept's earlier
  category/focusSettingId, manager, section, and focus-reason destination vocabulary is superseded and must
  migrate before dispatch.
gui_related: true
gui_classification_reason: Catalog metadata governs the visible label, availability, disabled announcement, handler dispatch, and accessible activation of the Usage forecast affordance and the Usage-to-Settings deep link.
depends_on: [UCC-006, UCC-109, UCC-116, CS-067, UF-092]
unblocks: []
acceptance_criteria:
  - cmd.usage.forecast.request has typed request and result references, a state selector, a closed disabled-reason set, a sole handler, and normalization metadata, and is the only new canonical id in this addendum.
  - Its effect is receipt or projection only and carries the missing-event-registration disposition; no event family is named while the Event Authority denominator remains UNKNOWN_OPEN.
  - Provider/account/presentation-panel aggregate details remain local and dispatch no UICommand; cmd.provider.usage.open_management receives no primary catalog row and no alias, and is recorded only as an excluded token.
  - Every provider setup or management destination resolves to cmd.settings.open with target_type setting and setting_id ai.accounts.provider-connections from the canonical Settings inventory.
  - Superseded destination vocabulary is accepted only by an explicit pre-dispatch migrator and never appears as primary catalog metadata.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py validate-wiring-matrix
  - python3 scripts/pm-plan-index.py validate
  - future Usage forecast dispatcher, disabled-reason, and deep-link fixtures
risk_class: catalog_command_or_deep_link_identity_drift
reasoning_tier: high
context_scope: usage_command_catalog_registration
implementation_surfaces:
  - Plans/UI_Command_Catalog.md
  - Plans/Commands_System.md
  - Plans/Wiring_Matrix.md
  - Plans/Wiring_Matrix.production.exclusions.json
  - Plans/settings_inventory.json
node_compile_hint:
  mode: usage_command_catalog_registration
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Concepts/usage-concepts/QwenUsageConcept/u11-prism.html (u11 Prism II Usage concept; source-lineage-only)"
  - Concepts/usage-concepts/PM_Usage_Independent_Audit_2026-08-17/handoff/HANDOFF_CORRECTIONS.md
  - Concepts/usage-concepts/PM_Usage_Independent_Audit_2026-08-17/handoff/PORT_HANDOFF_PLANS_ROUTE.md
preserved_exact_tokens:
  - cmd.usage.forecast.request
  - cmd.provider.usage.open_management
  - cmd.nav.open_usage_subject
  - cmd.settings.open
  - catalog.settings_open
  - missing_event_registration
  - UNKNOWN_OPEN
negative_constraints:
  - Do not give the rejected candidate a primary catalog or production wiring row.
  - Do not alias or normalize cmd.provider.usage.open_management to cmd.nav.open_usage_subject or any other command.
  - Do not name or emit an event family for the new command while the Event Authority denominator remains UNKNOWN_OPEN.
  - Do not mint a Usage-specific Settings navigation command; reuse the canonical Settings deep-link identity.
  - Do not restore the retired manager, section, or focus-reason destination vocabulary as catalog metadata.
owner_hints:
  - Plans/UI_Command_Catalog.md
  - Plans/Commands_System.md
  - Plans/FinalGUISpec.md
```
