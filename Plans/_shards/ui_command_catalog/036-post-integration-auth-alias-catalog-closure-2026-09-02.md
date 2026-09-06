# Shard 036: Post-Integration Auth Alias Catalog Closure - 2026-09-02

Source: `Plans/UI_Command_Catalog.md`

Source lines: L12289-L12333

Source SHA256: `48f2f431bc886525e5510bb8e41fad60dbbf4147bb6d4ee78cee4261da7f608d`

---

## Post-Integration Auth Alias Catalog Closure - 2026-09-02

The packet spellings `cmd.auth_session.resume`, `cmd.auth_session.submit_code`, and `cmd.credential.add` are compatibility inputs only. They normalize before availability, permission, policy, validation, dispatch, receipt, event, or persistence handling to `cmd.authentication.resume`, `cmd.auth_profile.submit_code`, and `cmd.credential_source.add` respectively. No source spelling receives a catalog-primary row, visible peer control, independent disabled state, handler, wiring row, persistence identity, or EventRecord. Existing GUI consumers continue to invoke and render only the canonical target and its exact owner-projected state.

| Packet/source spelling | Exact target | Sole future target handler | GUI and return behavior |
|---|---|---|---|
| `cmd.auth_session.resume` | `cmd.authentication.resume` | `handlers::authentication::resume` | Reuse the canonical authentication continuation control, disabled reason, protected handoff, and exact caller return. |
| `cmd.auth_session.submit_code` | `cmd.auth_profile.submit_code` | `handlers::multi_account::submit_code` | Reuse the canonical human-only code-submission control and return settlement; the alias carries no raw code in receipts or projections. |
| `cmd.credential.add` | `cmd.credential_source.add` | `handlers::credential_broker::source_add` | Reuse the canonical credential-source control and owner result; the alias grants no credential visibility or attachment authority. |

All three canonical targets remain `handler_unavailable` until source-hashed native evidence exists. Static normalization contracts and catalog prose prove no rendered control, dispatcher, handler execution, protected-auth completion, credential mutation, or runtime readiness.

### UCC-154 - Post-Integration Auth Alias Reverse Coverage

```yaml
plan_unit_id: UCC-154
unit_type: gui_command_catalog
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: >-
  The three SIR-033 packet spellings normalize before every gate to existing authentication, auth-profile, and credential-source commands; GUI surfaces expose only each canonical target's availability, disabled reason, protected interaction, receipt, and exact return, with no peer control or runtime claim.
gui_related: true
gui_classification_reason: This unit prevents compatibility spellings from producing duplicate or misleading controls in Settings, Onboarding, Doctor, and authentication/credential handoffs.
depends_on: [UCC-151, SIR-033]
unblocks: []
acceptance_criteria:
  - Each source spelling has exactly one canonical target and sole future handler, and normalization precedes availability, permission, policy, validation, dispatch, receipt, event, and persistence handling.
  - The source spellings receive no catalog-primary row, visible peer control, independent disabled state, production wiring row, persistence identity, or EventRecord.
  - Existing consumers preserve canonical target accessibility, keyboard/pointer parity, protected human-only interaction, currentness, and exact return behavior.
  - AuthBrowserSession content, raw codes, credentials, tokens, cookies, and provider errors never enter alias records, accessibility descriptions, receipts, or projections.
  - handler_unavailable and absent native normalization evidence remain explicit.
validation_surfaces: [Plans/shared_integration_runtime_expansion_contracts.schema.json, Plans/shared_integration_runtime_expansion_fixtures.json, Plans/touch_closure.json, Plans/Wiring_Matrix.production.exclusions.json, python3 scripts/pm-touch-closure-verify.py --json]
risk_class: duplicate_auth_or_credential_control_from_compatibility_alias
reasoning_tier: high
context_scope: post_integration_auth_alias_reverse_coverage
implementation_surfaces: [Plans/UI_Command_Catalog.md, Plans/Commands_System.md, Plans/touch_closure.json, Plans/Wiring_Matrix.production.exclusions.json]
node_compile_hint: {mode: static_alias_catalog_and_reverse_coverage_only, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - Plans/Shared_Integration_Runtime.md#SIR-033
  - source_ref:packet:PM_Forge_Backup_Tsnet_Post_Integration_Packet_2026-09-01/14_COMMAND_CONTRACTS.md:124-131
preserved_exact_tokens: [cmd.auth_session.resume, cmd.auth_session.submit_code, cmd.credential.add, cmd.authentication.resume, cmd.auth_profile.submit_code, cmd.credential_source.add, handler_unavailable]
negative_constraints:
  - Do not create alias-specific controls, handlers, availability, persistence, EventRecords, secret projections, or protected-browser access.
  - Do not claim rendered, dispatched, authenticated, credential-mutated, or runtime evidence from static catalog closure.
```
