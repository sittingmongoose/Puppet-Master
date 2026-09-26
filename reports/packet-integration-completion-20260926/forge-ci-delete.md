# Forge CI/delete closure — owner repair and integration handoff (2026-09-26)

Owner work item `forge-ci-delete`: closes the remaining Forge contract gaps from
[server-backup.md](../concept-packet-integration-20260926/server-backup.md) (G1 native-command gaps),
[project-recovery-owner.md](../concept-packet-integration-20260926/project-recovery-owner.md) (Delete Repository undispatched),
and the README Hosted-CI row, then repairs all six findings from the independent review
(`packet-integration-completion-20260926/reviews/forge-ci-delete.md`, verdict REPAIR).
Prose first in `Plans/Forge_Integrations.md` (FGI-021 batch), then schema, fixture,
and concept-source companions. Static contracts only: every route starts
`handler_unavailable` with `expected_event_types=[]`; no native handler, runtime, provider,
security, or readiness claim is made.

## Finding dispositions (all six closed)

| # | Review finding | Prose repair | Companion repair |
|---|---|---|---|
| 1 | Official UI origin equated with API host | §4.3 + FGI-021: handoff origin/route must equal the profile-approved official UI destination for the selected instance/tenant; UI origin may differ from normalized API/transport host; cross-instance/tenant/route substitution rejected; approved distinct web/API domains are not substitution | Report §Semantic handoff cites route-equality-only; fixtures carry opaque `allowed_origin_ref` with no host value |
| 2 | Settings destination admits null scope | §4.3 + batch text + FGI-021: `hosted_service_settings` requires non-null `hosted_setting_scope_ref` | Schema conditional requires it; positives fixed; missing/null negatives added |
| 3a | Run identity ambiguous (`pipeline_id` only) | Batch text + FGI-021: `pipeline_id` names the pipeline/definition, `automation_run_id` names the immutable SCS-016 AutomationRun; distinct fields, run never inferred; job stays optional | Schema requires `automation_run_id` on artifact download and artifacts destination; source metadata + fixtures updated |
| 3b | Cross-record binding only prose-shaped | New invariant paragraph + FGI-021 bullets: request→result→receipt equality of actual values is the admission gate; mismatched joins rejected while records stay structurally valid; HostedCI success carries binding ref+generation on result and receipt | New `hosted_ci_command_roundtrip` def with 3 linked positives + 22 semantic counterexamples; schema enforces binding retention on success |
| 4 | Capability mapping needs explicit rule | Batch text + FGI-021: `pipeline_artifacts` from current `artifact_read` + exact download/import authority; `secrets`/`variables` from respective admin write `ready` + current permission/capability; combined `secrets_variables` is ceiling only; unsupported routes to official fallback only | New `hosted_ci_capability_admission` def with 5 positives + 6 negatives (read-only admin, Bitbucket DC/no-CI, degraded matrix, FileSafe authority, denied permission) |
| 5/6 | First-card control vs narrowed command; generic Connect claims dispatch | §4.3 + batch text + FGI-021: third destination `automation_service_overview` preserves first-card `Open in <provider>` under the same command; generic Connect is setup navigation via ui.settings.route.open to Hosting Services, not a pipeline request or an existing-binding selection | Source bands + projection metadata model all three destinations; generic Connect carries ui-action only; remaining no-service controls stay preview-disabled non-requests |

Census unchanged: primary enum **52** (`Forge_Integrations.md` §3.1); common central
routes **49** (43 under FGI-010 plus 6 under FGI-021). No packet alias resurrected.
The retracted nested-`required` concern stays retracted: the download/import
disposition branches are untouched.

## Admitted commands (6)

| Command | Sole future handler | Receipt | Capability / target |
|---|---|---|---|
| `cmd.forge.repository.delete` | `handlers::forge::repository_delete` | DestructiveOperationReceipt | `repository` / `repository` |
| `cmd.forge.pipeline.artifact.download` | `handlers::forge::pipeline_artifact_download` | MutationReceipt | `pipeline_artifacts` / `pipeline_artifact` |
| `cmd.forge.pipeline.secret.set` | `handlers::forge::pipeline_secret_set` | MutationReceipt | `secrets` / `hosted_secret` |
| `cmd.forge.pipeline.secret.remove` | `handlers::forge::pipeline_secret_remove` | DestructiveOperationReceipt | `secrets` / `hosted_secret` |
| `cmd.forge.pipeline.variable.set` | `handlers::forge::pipeline_variable_set` | MutationReceipt | `variables` / `hosted_variable` |
| `cmd.forge.pipeline.variable.remove` | `handlers::forge::pipeline_variable_remove` | DestructiveOperationReceipt | `variables` / `hosted_variable` |

## Payload / result contracts

Schemas: `Plans/forge_integration_contracts.schema.json#/$defs/command_request`,
`command_result`, `command_receipt`, `command_error_record`, `command_availability`,
`permission_decision`, `confirmation`, `command_target`,
`hosted_ci_command_roundtrip`, `hosted_ci_capability_admission`.
Results distinguish the existing eight outcomes; `effect_unknown` keeps the
typed-error plus reconciliation-only retry rule (§3.3).

- **Delete** (PJCT-007 recovery route): exact provider/variant/host/account/`repo_id`/
  provider-repository/locator/binding-generation; `verified_create_result_ref` +
  `verified_create_receipt_ref` proving the created remote (result ref joins the
  create result's `operation_id`, receipt ref joins the create receipt's `receipt_id`);
  `remote_side_effect` permission, human actor, GUI invocation; fresh target-bound
  human confirmation. Never automatic rollback, resume cleanup,
  speculative-while-unknown, provider-scope reuse, or source-sign-in authorized.
- **Artifact download** (AutomationBinding-scoped): provider pipeline/definition
  (`pipeline_id`) plus explicit immutable run (`automation_run_id`), job where the
  provider names jobs, provider artifact, SCS-016 `RemoteArtifact` record, expected
  SHA-256 digest; explicit `artifact_disposition: download | import`; download needs
  a FileSafe destination, import needs an artifact-import handoff (never both, never
  neither); `local_mutation` permission, confirmation, `ObservableWork`.
  Never auto-executes. `release_assets` capability and `release_asset` targets never
  authorize or substitute for it, and vice versa.
- **Secret set/remove, variable set/remove** (AutomationBinding-scoped): exact setting
  name plus settings scope ref; `remote_side_effect` permission, confirmation.
  Secret set carries a one-use protected human-broker ref and no inline bytes;
  both secret ops are human-actor, GUI-invoked. No request, result, receipt, log,
  agent payload, or fixture carries secret values, and none are returned.
  `variable_value` stays ordinary non-secret configuration.
- **Official destinations**: `cmd.forge.pipeline.open_in_browser` requires
  `official_destination_kind` with three values preserving three selected controls:
  `automation_run_artifacts` (definition + immutable run; `Open artifacts in service`),
  `hosted_service_settings` (non-null scope, no run; `Open service settings`),
  `automation_service_overview` (binding + approved route, no run/scope; first-card
  `Open in <provider>`). Every destination carries the exact automation binding and
  the profile-approved UI origin/route for the selected instance/tenant. Absent
  native capability yields the corresponding explicit official-service fallback per
  the already-decided FGI-015 rule — no new product choice, no speculative routes.

GitHub Actions (Current Branch / Workflows / Settings) consumes these generic
commands with GitHub nouns inside the generic `repository_automation` shell; no
provider peer namespace is created.

## Permission / currentness gates (all six)

Current binding/catalog/API evidence, `mutation_safety=verified`, direct
execution-time revalidation, effective `authority` role, `allow` permission
snapshot, idempotency, target-bound confirmation, `available` state. Delete and
secret ops additionally pin human actor (delete and secrets) and GUI invocation.
Capability admission: `pipeline_artifacts` from current `artifact_read` plus exact
download/import authority; `secrets`/`variables` from their admin area write `ready`
plus current permission/capability; combined `secrets_variables` is ceiling only.

## Manager / surface routes (for consumer owners; not edited here)

- Source Control → Hosting Services: recovery Delete Repository entry point (PJCT-007).
- `repository_automation` / Actions & Pipelines: artifact download/import, secrets/
  variables links, three official-service destinations with exact disabled reasons.
- GitHub Actions Settings: hosted admin mutations with GitHub nouns (consumer).
- Project recovery routes: Open Repository (existing open_in_browser) unchanged;
  Delete dispatches only the new delete contract with verified-create refs.

## Fixture cases

Valid: 106 (94 prior + 12 new — overview-destination request, artifact success
result + receipt, 3 linked roundtrips, 5 admission records, 1 read-only admin surface).
Invalid: 166 (147 prior + 19 new — scope missing/null, run missing/null/smuggled
×6, overview/smuggled scope ×3, result/receipt binding retention ×4, admission
×6). `semantic_counterexamples`: 22 structurally-valid join-wrong cases (see handoff).

## Central admissions handoff (other owners; nothing edited here)

- **Commands_System** (other worker): register the 6 IDs with the request/result/
  error/availability family, `handler_unavailable`, `expected_event_types=[]`.
- **UI_Command_Catalog / Wiring_Matrix.production.json / touch_closure.json**:
  one production-intent row per command with the sole future handler above; three
  distinct `pipeline.open_in_browser` destination bindings (artifacts run vs
  service settings vs service overview); reverse GUI coverage without synthetic controls.
- **Event Authority / storage-plan**: no admission — event refs stay empty; no new
  storage family (receipts only).
- **Project_System** (§3.1.1, other worker): its "46-command Forge catalog"
  reference is now stale (52); Delete route may cite FGI-021.

## Semantic handoff (for the script worker; scripts not edited here)

JSON Schema cannot express cross-record equality; the rules below compare actual
values. Implemented per-record codes in `scripts/pm_packet_integration_semantics.py`
are acknowledged, not duplicated: `forge_binding_generation_stale`,
`forge_confirmation_target_mismatch`, `forge_delete_missing_verified_create`,
`forge_artifact_run_identity_incomplete`, `forge_artifact_disposition_mismatch`,
`forge_secret_scope_missing`, `forge_secret_broker_missing`,
`forge_secret_broker_misrouted`, `forge_secret_inline_value_present`,
`forge_variable_value_secret_like`, `forge_official_destination_binding_invalid`,
`forge_browser_handoff_route_mismatch`, `forge_effect_unknown_not_reconciliation_only`,
`forge_error_retry_misrouted`, `forge_pack_census_gap`,
`forge_pack_census_unevaluable_schema_invalid`, `forge_pack_secret_broker_reused`.
All owned positives pass them; the census and broker one-use checks report no findings.

New cross-record rules to implement (each returns its code on violation):

Roundtrip joins (`hosted_ci_command_roundtrip`): `forge_roundtrip_command_mismatch`
(roundtrip/request/result/receipt `command_id` equal; delete create-evidence is
`repository.create`), `forge_roundtrip_command_instance_mismatch`,
`forge_roundtrip_operation_mismatch` (result↔receipt), `forge_roundtrip_receipt_ref_mismatch`
(`result.receipt_ref == receipt.receipt_id`), `forge_roundtrip_provider_mismatch`,
`forge_roundtrip_service_instance_mismatch` (`normalized_host` equal across request
and both bindings), `forge_roundtrip_repository_binding_mismatch`
(refs equal `repository_binding.binding_id`),
`forge_roundtrip_binding_generation_mismatch`, `forge_roundtrip_automation_binding_mismatch`,
`forge_roundtrip_automation_generation_mismatch`, `forge_roundtrip_account_mismatch`,
`forge_roundtrip_repo_mismatch`, `forge_roundtrip_artifact_target_mismatch`
(artifact `result.target_ref == request.target.remote_artifact_record_ref`),
`forge_roundtrip_digest_mismatch` (`request.target.expected_digest` equals the
SCS-016 RemoteArtifact record digest; record side is SCS-owned),
`forge_roundtrip_run_identity_not_definition` (`automation_run_id != pipeline_id`),
`forge_roundtrip_run_binding_mismatch` (run belongs to the request's automation
binding; existence is SCS-owned), `forge_roundtrip_setting_scope_mismatch`
(secret/variable `result.target_ref == request.target.hosted_setting_scope_ref`),
`forge_roundtrip_verified_create_result_mismatch` (delete ref equals the create
result's `operation_id`, create succeeded), `forge_roundtrip_verified_create_receipt_mismatch`
(delete ref equals the create receipt's `receipt_id` equals the create result's
`receipt_ref`, same provider/binding/generation), `forge_roundtrip_secret_value_leak`
(secret tripwire over unpatterned roundtrip string fields).
Availability: `forge_availability_unsupported_native_fallback` (`unsupported` offers
only the official-service fallback action, never a native mutation).
Dispatcher-owned (not a static forge rule): `forge_handoff_origin_not_allowlisted_for_instance`
(origin+route must be the profile-approved UI destination for the selected
instance/tenant; static side is the implemented route-equality check).

Consumption: `semantic_counterexamples` in the owned fixtures file holds 22 cases
with `definition`, `base_valid`, `patch`/`remove` (repo `dotted_patch`/`remove_paths`
mechanics), `violated_rules`, `note`, and optional `cross_owner_evidence`
(SCS-side digest for the digest rule). Every case is schema-valid today (verified);
each must trip exactly its listed new code(s) once implemented. Two cases already
trip implemented codes (`secret_like_variable_value` →
`forge_variable_value_secret_like`; `handoff_route_substitution` →
`forge_browser_handoff_route_mismatch`). No const-true attestation flag exists in
any definition; authority comes only from these value comparisons.

Observed (not owned, not fixed): the pre-existing
`command_request_forge_connection_reauthorize_protected_auth_browser` positive
trips `forge_browser_handoff_route_mismatch` under the new wired rule (target route
null with a `protected_auth_browser` handoff carrying a route). Owned by the
protected-auth batch + script worker to adjudicate.

## Verification (targeted; no full validator while siblings change)

- Owned schema is Draft 2020-12 valid; owned pair: 106 positives valid, 166
  negatives rejected, 22 semantic cases structurally valid (`/tmp/forge_owned_verify.py`).
- Script-worker's per-record gate + census + broker one-use over the owned pair:
  no findings on owned cases (one pre-existing protected-auth observation above).
- Roundtrip positives self-check join equality by construction.
- Concept source: `py_compile` clean, `node --check` clean, 54/54 concept refs match
  the owner `non_secret_ref` pattern, render probes pass for all six services plus
  generic (see `hosted-ci-consumer.md` §8), command-id effect set unchanged (7 ids).
- No shard/index/governance regeneration, commits, pushes, or branch changes made.
