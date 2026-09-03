# Shard 018: Server command-gap owner closure - application update lifecycle (2026-09-01)

Source: `Plans/Release_Supply_Chain.md`

Source lines: L1147-L1187

Source SHA256: `118be1d006503d8868bd2c1f8a80b1ca1c2c3f80417be9090296bb82770d777c`

---

## Server command-gap owner closure - application update lifecycle (2026-09-01)

`ApplicationUpdateService` owns one DRY closed family in `Plans/release_update_contracts.schema.json` for `cmd.update.app.automatic.set_enabled`, `cmd.update.app.cancel_download`, `cmd.update.app.check`, `cmd.update.app.download`, `cmd.update.app.install_restart`, `cmd.update.app.remind_later`, and `cmd.update.app.rollback`. Their sole future handlers are `handlers::application_update::automatic_set_enabled`, `::cancel_download`, `::check`, `::download`, `::install_restart`, `::remind_later`, and `::rollback`. All remain `handler_unavailable` until full central registration, permission/FileSafe routing, named native handler evidence, production wiring, and receipt-or-admitted-event disposition exist.

The exact consumers are Settings > Updates, the bottom Update Available item, Server permanent web UI, and Doctor. Source tokens `cmd.update.app.open_details`, `cmd.update.app.open_logs`, and `cmd.update.app.open_release_notes` are retained only as the adjudicated spellings for `ui.update.app.open_details`, `ui.update.app.open_logs`, and `ui.update.app.open_release_notes`; these are bounded, redacted, lazy local actions with no semantic-domain handler and no domain EventRecord. Automatic update is one simple enabled toggle with no user schedule and never disables manual checks. Check is coalesced, cached, and policy-bounded. Download verifies content, signing, channel, target, compatibility, and artifact hash before retention and cannot activate. Cancel affects only the exact in-progress unverified/verified download operation and never deletes the active generation. Install/restart requires verified artifact and provenance, safe quiescence, recovery boundary, migration preflight, exact install-source owner, restart journal, post-verification, and rollback target. Remind later only defers attention under a bounded policy. Rollback targets a verified retained compatible generation or reports `recovery_required`.

Idempotency and operation/update/catalog generations prevent duplicate or racing check/download/install/rollback effects. Restart converges from the durable update journal; partial install, migration, restart, or verification never becomes success. Exact initiating surface/route/focus/generation is restored or `caller_unavailable` is reported. Requests, results, receipts, logs, notes, and projections contain hashes and non-secret refs only—never signing keys, update credentials, raw tokens, protected authentication state, or unrestricted filesystem paths.

### RSC-014 - Application Update Command And Local-Projection Closure

```yaml
plan_unit_id: RSC-014
unit_type: requirement
status: accepted
owner_doc: Plans/Release_Supply_Chain.md
canonical_text: >-
  ApplicationUpdateService owns seven exact automatic-toggle, cancel, check, download, install/restart, remind-later,
  and rollback commands through one closed family plus three presentation-only local actions. Every command remains
  handler_unavailable until its named sole handler and complete integration exist; verified provenance, recovery,
  generation, restart, rollback, exact-return, and secret-exclusion gates fail closed.
gui_related: true
gui_classification_reason: Update lifecycle and local details/logs/release-notes projections are visible in four named consumers.
depends_on: [RSC-008, RSC-009, RSC-013]
unblocks: []
acceptance_criteria:
  - The schema and fixtures cover exactly seven command IDs and three local actions with the named handlers and consumers.
  - Local actions have no domain handler or EventRecord and expose bounded redacted content only.
  - Fixtures cover coalescing, cache, download verification, cancel scope, safe install/restart, migration, post-verify, retained rollback, duplicate/race, restart recovery, permission, FileSafe, exact return, and secret negatives.
  - Static validation never claims an update was downloaded, installed, restarted, verified, or rolled back.
validation_surfaces: [Plans/release_update_contracts.schema.json, Plans/release_update_contract_fixtures.json, focused Server owner-bundle-A validator]
risk_class: application_update_unverified_activation_or_false_success
reasoning_tier: high
context_scope: server_command_gap_application_update
implementation_surfaces: [Plans/Release_Supply_Chain.md, Plans/release_update_contracts.schema.json, future ApplicationUpdateService handler]
node_compile_hint: {mode: application_update_contract_only, create_worknodes: false, create_nodeseeds: false}
source_lineage: [source_ref:server-command-gap-adjudication:rows-157-166]
negative_constraints:
  - Do not expose a user-defined schedule or disable manual checks through the automatic toggle.
  - Do not activate an unverified download or treat partial restart/migration as success.
  - Do not create domain handlers or EventRecords for local details, logs, or release-notes actions.
```
