# Shard 032: Cross-owner setup, restore, Server, pairing, and protected-auth wiring addendum - 2026-09-01

Source: `Plans/Wiring_Matrix.md`

Source lines: L4172-L4246

Source SHA256: `d108a46be70fbc2c9a91dc216f291f8238ed1201412f6582a4ad93a1ccad03f6`

---

## Cross-owner setup, restore, Server, pairing, and protected-auth wiring addendum - 2026-09-01

The production-intent matrix adds one row for each of the ten commands registered by CS-070/UCC-148 and
strengthens the existing Project and Authentication rows. These rows specify the required future native
route; they do not assert that a dispatcher, handler, persistence path, or native runtime currently exists.
Every new row is default-disabled with `handler_unavailable` until those executable surfaces and fresh
runtime evidence exist.

| Wiring row | Command | Specified target | Reverse GUI consumers | Effect/return |
|---|---|---|---|---|
| `catalog.source_control_repository_clone` | `cmd.source_control.repository.clone` | `handlers::source_control::repository_clone` | Onboarding first project; Settings SCM/Origin | Owner receipt plus exact caller return; no Project row until registration succeeds. |
| `catalog.jujutsu_git_clone` | `cmd.jujutsu.git.clone` | `handlers::jujutsu::git_clone` | Onboarding first project; Settings SCM/Origin | JJ operation receipt plus exact caller return. |
| `catalog.restore_preview` | `cmd.restore.preview` | `handlers::backup_restore::preview_restore` | Onboarding restore; Settings Backup/Restore; Doctor recovery | Read-only validation/preview receipt; no activation. |
| `catalog.server_connect` | `cmd.server.connect` | `handlers::server::connect` | Onboarding discovery; Settings Server; Doctor | Exact connect/reconnect/resume result and focus return. |
| `catalog.server_bootstrap_start` | `cmd.server.bootstrap.start` | `handlers::server::bootstrap_start` | Onboarding post-claim; Settings Server | Observable bootstrap receipt; unavailable without native handler. |
| `catalog.client_pair_start` | `cmd.client.pair.start` | `handlers::client_pairing::start` | Onboarding pairing; Settings paired clients | Pairing-run receipt; no trust grant. |
| `catalog.client_pair_approve` | `cmd.client.pair.approve` | `handlers::client_pairing::approve` | Settings pairing request; Onboarding return | Current-generation approval result. |
| `catalog.client_pair_reject` | `cmd.client.pair.reject` | `handlers::client_pairing::reject` | Settings pairing request; Onboarding return | Terminal refusal result. |
| `catalog.client_pair_cancel` | `cmd.client.pair.cancel` | `handlers::client_pairing::cancel` | Settings pairing progress; Onboarding return | Requester abort and cleanup result. |
| `catalog.client_revoke` | `cmd.client.revoke` | `handlers::client_trust::revoke` | Settings paired-client detail; Doctor remediation | Durable revocation receipt and exact return. |

The `catalog.project_new_local`, `catalog.project_add_existing`, and `catalog.project_open` rows use the
Project owner request/result schemas and preserve exact identity, currentness, receipt, and caller return
context. The `catalog.authentication_start|cancel|resume` rows retain their sole shared-runtime handlers
and additionally prove initiating active Client/session generation, same operation/revision, exact return
target, redacted timeout/cancel/success, and rejection of wrong-Client or stale-operation returns.

PMConcept7 is a concept consumer only. The bounded Product Onboarding modal maps standalone/container
post-claim work to `cmd.server.bootstrap.start`, pairing-method initiation to `cmd.client.pair.start`, known
Server connection to `cmd.server.connect`, ordinary Git and JJ clone to their distinct owners, and
protected-auth cancellation to `cmd.authentication.cancel`. The Settings/Doctor Server manager exposes
the five pairing/trust operations as separate controls. No browser interaction or action log satisfies the
native-handler evidence requirement.

ContractRef: ContractName:Plans/Commands_System.md#CS-070, ContractName:Plans/UI_Command_Catalog.md#UCC-148, ContractName:Plans/touch_closure.json

### WM-047 - Cross-owner production-intent and reverse-route closure

```yaml
plan_unit_id: WM-047
unit_type: wiring_contract
status: accepted
owner_doc: Plans/Wiring_Matrix.md
canonical_text: >-
  Ten owner-backed production-intent rows and six strengthened existing rows bind exact commands,
  request/results, specified targets, availability/disabled projections, receipt-only effects,
  accessibility, and every intended PMConcept7/Settings/Onboarding/Doctor reverse consumer. All missing
  native handlers remain truthfully unavailable; static wiring is not production execution evidence.
gui_related: true
gui_classification_reason: Governs visible setup, project, restore, Server, pairing, trust, and authentication control routing and exact focus return.
depends_on: [WM-046, CS-070, UCC-148]
unblocks: []
acceptance_criteria:
  - Exactly ten new production-intent rows exist with unique commands and keys, exact owner schemas, one specified target, selectors, disabled reasons, accessibility, tests, and reverse consumers.
  - The three Project and three Authentication rows are strengthened in place rather than duplicated.
  - Pairing start/approve/reject/cancel and Client trust revocation remain separate operations; reconnect/resume remain modes of cmd.server.connect.
  - Protected-auth return is fenced to the initiating active Client/session and exact operation/revision with no content exposure, capture, recording, persistence, or fallback navigation.
  - Product Onboarding modal close restores focus but does not cancel owner work; explicit cancellation uses the exact owner command.
  - Every row remains partial/default-disabled until its native handler and fresh runtime evidence exist, and no EventRecord is invented.
validation_surfaces: [Plans/Wiring_Matrix.production.json, Plans/Wiring_Matrix.schema.json, Plans/touch_closure.json, python3 scripts/pm-plans-verify.py validate-wiring-matrix, python3 scripts/pm-touch-closure-verify.py]
risk_class: missing_reverse_wiring_or_false_production_claim
reasoning_tier: high
context_scope: cross_owner_setup_wiring
implementation_surfaces: [Plans/Wiring_Matrix.md, Plans/Wiring_Matrix.production.json, Plans/UI_Command_Catalog.md, Plans/touch_closure.json, Concepts/pm7-tools/onboarding_cinematic_source.py, Concepts/pm7-tools/systems_integration_source.py]
node_compile_hint: {mode: cross_owner_production_intent_wiring, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - scratchpad/pm-integration-20260831/authority-repairs/central-owner-merge/merged-central-owner-delta-manifest.json
  - approved Parallel Canon, Settings, and PMConcept7 Integration Plan
preserved_exact_tokens: [catalog.source_control_repository_clone, catalog.jujutsu_git_clone, catalog.restore_preview, catalog.server_connect, catalog.server_bootstrap_start, catalog.client_pair_start, catalog.client_pair_approve, catalog.client_pair_reject, catalog.client_pair_cancel, catalog.client_revoke, handler_unavailable]
negative_constraints:
  - Do not claim native implementation from a production-intent row or handler string.
  - Do not add rejected aliases, false owner-local authentication commands, or an EventRecord family.
  - Do not omit exact return, accessibility, disabled reason, or reverse consumers.
owner_hints: [Plans/Wiring_Matrix.md, Plans/UI_Command_Catalog.md, Plans/Commands_System.md]
```
