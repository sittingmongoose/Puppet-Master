# Shard 056: DL-270 command entries (2026-10-31)

Source: `Plans/UI_Command_Catalog.md`

Source lines: L20134-L20246

Source SHA256: `3dd60bf41e7a99264fdbf885f984c8cfad55eb9ca3a966f59ff03c1fb9b6dc1b`

---

## DL-270 command entries (2026-10-31)

| Command ID | Label | Args | command_kind | Availability | Confirmation | Disabled reasons | Owner | Sole future handler | Result |
|---|---|---|---|---|---|---|---|---|---|
| `cmd.chat.load_older` | Load 50 older | `{ thread_id, before_page_ref }` | `shell_view` | selection (`older_pages_present`) | none | `stale_projection`, `degraded` | chat | `handlers::chat::load_older` | One sealed page of at most 50 items and 256 KiB, appended above the loaded window; `loaded`, `no_older_pages` or `unavailable`. Read-only: no thread mutation and no persisted event, only a no-persist command receipt. A missing or rebuilding page store shows the degraded state; it never falls back to replaying events. |

Command-line dispositions (no catalog ID; SP-339 owns the verbs and their read semantics, Release_Supply_Chain owns packaging):

| Verb | Disposition | In-app counterpart |
|---|---|---|
| `pm db dump` | Command-line read of a store family from a read-only snapshot | Record inspector via `cmd.storage.open_value` |
| `pm inspect` | Command-line read of one record or value | Record inspector via `cmd.storage.open_value` |
| `pm tail` | Command-line follow of appended records | None required |
| `pm export` (JSONL or JSON on request; optional `--sqlite`, SP-342) | Command-line read; writes only the output it names | None; `cmd.chat.export`, `cmd.usage.export` and the backup commands keep their own rows |

All four apply the Permissions_System default masking and redaction profile. Flag names and exit codes are SP-339's to fix.

ContractRef: ContractName:Plans/Decision_Log.md#DL-270, ContractName:Plans/storage-plan.md#SP-338, ContractName:Plans/storage-plan.md#SP-339, ContractName:Plans/assistant-chat-design.md#ACD-242, ContractName:Plans/Commands_System.md#CS-107


### UCC-213 — Free Models route disable command

```yaml
plan_unit_id: UCC-213
unit_type: command_contract
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: 'UCC-213. DL-272 Free Models Turn off is cmd.free_models.route.disable, a canonical domain_action
  with sole future handler handlers::models::disable_free_route. It resolves route_id, underlying_provider_id
  and policy_scope_ref against the current Models catalog and policy, preserving actor_id, origin, idempotency_key,
  catalog_generation and expected_generation. Display labels or a caller success flag are not owner identity.
  Availability requires a known eligible target and owner/permission/writer/currentness proof; missing handler
  stays handler_unavailable. The owner changes only that route’s future eligibility, preserving credentials,
  account identities, other routes, top-10 order and in-flight snapshots (EP-107). A replay is idempotent.
  A successful/already-disabled result names the same route/provider/scope, resulting generation and receipt;
  refusal carries its closed reason and no accepted change. No new EventRecord family, secret field or credential-revoke
  command is admitted. Request/result/fixtures live in Plans/free_models_route_contracts.schema.json and Plans/free_models_route_contract_fixtures.json.
  Only the actual Models owner effect and receipt prove an accepted policy change. Catalog row: label Turn
  off; command_kind domain_action; availability selection (route_exists); confirmation none; disabled reasons
  handler_unavailable, stale_projection, permission_denied, read_only, degraded. Normalization kind canonical,
  alias_of_command_id null. It is a route policy action, not a generic provider disable or account disconnect.


  Current projects-refresh contract: Exactly five Settings primaries consume offered level/key, the single
  resolver, per-setting CAS, exact owner readback and return. All chats/All editors/All terminals uses Everywhere.
  Human rows edit their origin; agent edits use SSYS-065. Library things retain their home/reach/whole Project
  versions and sole owner. Computer installations, credentials and protected source trust never travel in copy.
  Origin-word/Details/Changed/Varies menus are local. Commands & Shortcuts retains exactly eight commands.*
  local owner actions through handlers::commands::apply_local_action, not cmd.commands.custom.*. The exact
  consumer contract is UCC-214/WM-100 and Plans/projects_refresh_command_bindings.json. Historical schema/hash/replay
  resources and all unrelated PM7 service/FO-22/motion/auth/identity clauses remain as specified; unavailable
  handlers remain handler_unavailable.'
gui_related: true
gui_classification_reason: Defines user-visible setup/feedback or its exact owner-routed control.
split_recommended: false
depends_on:
- DL-272
- MS-121
- MA-045
unblocks: []
acceptance_criteria:
- 'DL-272 Free Models Turn off is cmd.free_models.route.disable, a canonical domain_action with sole future
  handler handlers::models::disable_free_route. It resolves route_id, underlying_provider_id and policy_scope_ref
  against the current Models catalog and policy, preserving actor_id, origin, idempotency_key, catalog_generation
  and expected_generation. Display labels or a caller success flag are not owner identity. Availability requires
  a known eligible target and owner/permission/writer/currentness proof; missing handler stays handler_unavailable.
  The owner changes only that route’s future eligibility, preserving credentials, account identities, other
  routes, top-10 order and in-flight snapshots (EP-107). A replay is idempotent. A successful/already-disabled
  result names the same route/provider/scope, resulting generation and receipt; refusal carries its closed
  reason and no accepted change. No new EventRecord family, secret field or credential-revoke command is admitted.
  Request/result/fixtures live in Plans/free_models_route_contracts.schema.json and Plans/free_models_route_contract_fixtures.json.
  Only the actual Models owner effect and receipt prove an accepted policy change. Catalog row: label Turn
  off; command_kind domain_action; availability selection (route_exists); confirmation none; disabled reasons
  handler_unavailable, stale_projection, permission_denied, read_only, degraded. Normalization kind canonical,
  alias_of_command_id null. It is a route policy action, not a generic provider disable or account disconnect.'
- Validate application versus actual Project-target cases, original exact Project replay, stale scope/preview/permission/Stop/return
  refusal and the exact command/local/tool binding from UCC-214; no native/event/governance proof follows from
  static closure.
validation_surfaces:
- python3 scripts/pm7-canon-check.py
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
risk_class: owner_identity_and_truthful_feedback
reasoning_tier: high
context_scope: pm7_footage_review_20261101
implementation_surfaces:
- Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: planning_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Lead BATCH-FOOTAGE-REVIEW.md, 2026-11-01
- Concepts/onboarding/opus-5.5 at7d2dd568be76874ff8b4d3e82bad3701226d248c (source lineage only)
- source_ref:chat:2026-11-03-projects-pass2-approved
preserved_exact_tokens:
- UCC-213
- cmd.free_models.route.disable
negative_constraints:
- Do not infer native handlers, trust, success, credential authority or governance readiness from a concept
  or static fixture.
- Do not replace a required real target with focus, a synthetic Project, an empty identity or borrowed app/source
  authority.
owner_hints:
- Plans/UI_Command_Catalog.md
```


| Command ID | Label | command_kind | Availability | Confirmation | Owner | Sole future handler |
|---|---|---|---|---|---|---|
| `cmd.free_models.route.disable` | Turn off | `domain_action` | selection (`route_exists`) | none | Models, MS-121 / CS-108 | `handlers::models::disable_free_route` |

ContractRef: ContractName:Plans/Models_System.md#MS-121, ContractName:Plans/Commands_System.md#CS-108, ContractName:Plans/Wiring_Matrix.md#WM-099
