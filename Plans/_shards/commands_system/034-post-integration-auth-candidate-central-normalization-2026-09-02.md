# Shard 034: Post-Integration Auth Candidate Central Normalization - 2026-09-02

Source: `Plans/Commands_System.md`

Source lines: L5764-L5809

Source SHA256: `fda89aac8b3d6c391f15e7011082e08ccbe2db214c3b73b2dab1bf16d0f6194b`

---

## Post-Integration Auth Candidate Central Normalization - 2026-09-02

SIR-033 already owns the typed normalization records for these three packet candidates. The central command registry therefore registers no new primary command and creates no alias-specific handler, availability record, production wiring row, persistence identity, or EventRecord.

| Packet/source spelling | Exact target | Sole future target handler | Central disposition |
|---|---|---|---|
| `cmd.auth_session.resume` | `cmd.authentication.resume` | `handlers::authentication::resume` | Normalize before every gate; preserve source identity only as compatibility provenance. |
| `cmd.auth_session.submit_code` | `cmd.auth_profile.submit_code` | `handlers::multi_account::submit_code` | Normalize before every gate; submitted code remains in the protected owner channel and never enters alias metadata. |
| `cmd.credential.add` | `cmd.credential_source.add` | `handlers::credential_broker::source_add` | Normalize before every gate; credential material and attachments remain with the credential owner. |

The canonical targets retain their existing typed requests, results, errors, availability, permissions, and sole future handlers. They remain `handler_unavailable`, and `expected_event_types=[]` remains exact until native dispatcher/handler evidence and Event Authority admission exist.

### CS-076 - Post-Integration Auth Candidate Normalization

```yaml
plan_unit_id: CS-076
unit_type: command_registry
status: accepted
owner_doc: Plans/Commands_System.md
canonical_text: >-
  SIR-033's three post-integration source spellings normalize before every gate to existing authentication, auth-profile, and credential-source commands; the central registry adds no primary, peer handler, independent wiring, persistence identity, or EventRecord.
gui_related: false
gui_classification_reason: This is central pre-dispatch identity normalization; GUI consumers remain attached to the canonical target commands through UCC-154.
depends_on: [CS-073, SIR-033]
unblocks: [UCC-154]
acceptance_criteria:
  - cmd.auth_session.resume maps only to cmd.authentication.resume and handlers::authentication::resume.
  - cmd.auth_session.submit_code maps only to cmd.auth_profile.submit_code and handlers::multi_account::submit_code.
  - cmd.credential.add maps only to cmd.credential_source.add and handlers::credential_broker::source_add.
  - Normalization precedes schema selection, availability, currentness, permission, policy, validation, dispatch, receipt, event, and persistence handling.
  - The three source spellings remain unregistered and receive no peer availability, handler, production wiring row, persistence identity, EventRecord, secret payload, or protected-browser authority.
  - Canonical targets remain handler_unavailable and event-silent with "expected_event_types=[]" until executable proof and Event Authority exist.
validation_surfaces: [Plans/shared_integration_runtime_expansion_contracts.schema.json, Plans/shared_integration_runtime_expansion_fixtures.json, Plans/UI_Command_Catalog.md, Plans/touch_closure.json, Plans/Wiring_Matrix.production.exclusions.json, python3 scripts/pm-touch-closure-verify.py --json]
risk_class: duplicate_auth_handler_or_secret_bearing_compatibility_route
reasoning_tier: high
context_scope: post_integration_auth_candidate_central_normalization
implementation_surfaces: [Plans/Commands_System.md, Plans/UI_Command_Catalog.md, Plans/touch_closure.json, Plans/Wiring_Matrix.production.exclusions.json]
node_compile_hint: {mode: static_alias_normalization_only, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - Plans/Shared_Integration_Runtime.md#SIR-033
  - source_ref:packet:PM_Forge_Backup_Tsnet_Post_Integration_Packet_2026-09-01/14_COMMAND_CONTRACTS.md:124-131
preserved_exact_tokens: [cmd.auth_session.resume, cmd.auth_session.submit_code, cmd.credential.add, cmd.authentication.resume, cmd.auth_profile.submit_code, cmd.credential_source.add, handler_unavailable, "expected_event_types=[]"]
negative_constraints:
  - Do not register the packet source spellings or create peer handlers, wiring, persistence, events, secrets, or protected-session access.
  - Do not infer native normalization, dispatch, handler, authentication, credential mutation, or runtime readiness from static contracts.
```
