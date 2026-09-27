# Central command admission — seven primaries (project recovery + Forge delete/CI)

Final integration status and current evidence are in README.md and validation.md. Producer handoff sections below retain intermediate counts and next steps for lineage; they are not the remaining-work list.

Date: 2026-09-26. Central-companion scope only: `Plans/UI_Command_Catalog.md`,
`Plans/Wiring_Matrix.production.json`, `Plans/Wiring_Matrix.md`,
`Plans/touch_closure.json`, `Plans/DRY_Rules.md`, and this report. Owner
contracts in `Plans/Project_System.md#PJCT-007` and
`Plans/Forge_Integrations.md#FGI-021` are consumed as-is; no owner file is
touched here. Static companions only: no native handler, dispatcher, runtime,
provider, EventRecord, visual, or readiness proof is claimed. All seven rows
stay `handler_unavailable` with `expected_event_types=[]` until source-hashed
native evidence exists.

## 1. Admitted primaries

One Project recovery command plus the exact six-command FGI-021 set. Sole
targets are taken verbatim from the owner tables (`x-project-recovery-command-contract`
for Project, the FGI-021 batch table for Forge).

| Command | Sole future handler | Owner | Request -> result | Error / permission | Catalog | Production row | Touch row |
|---|---|---|---|---|---|---|---|
| `cmd.project.resume_creation` | `handlers::project::resume_creation` | PJCT-007 | `project_action_request` -> `project_action_result` (+ `creation_recovery_resume_binding` / `project_creation_recovery_context`) | result-carried outcome + `permission_decision` via snapshot | UCC-165 table | `catalog.project_resume_creation` | `TOUCH-PJCT-011` / `TCP-PROJECT` |
| `cmd.forge.repository.delete` | `handlers::forge::repository_delete` | FGI-021 | `command_request` -> `command_result` | `command_error_record` / `permission_decision` | UCC-165 table | `catalog.forge_repository_delete` | `TOUCH-FGI-047` / `TCP-FORGE` |
| `cmd.forge.pipeline.artifact.download` | `handlers::forge::pipeline_artifact_download` | FGI-021 | `command_request` -> `command_result` | `command_error_record` / `permission_decision` | UCC-165 table | `catalog.forge_pipeline_artifact_download` | `TOUCH-FGI-048` / `TCP-FORGE` |
| `cmd.forge.pipeline.secret.set` | `handlers::forge::pipeline_secret_set` | FGI-021 | `command_request` -> `command_result` | `command_error_record` / `permission_decision` | UCC-165 table | `catalog.forge_pipeline_secret_set` | `TOUCH-FGI-049` / `TCP-FORGE` |
| `cmd.forge.pipeline.secret.remove` | `handlers::forge::pipeline_secret_remove` | FGI-021 | `command_request` -> `command_result` | `command_error_record` / `permission_decision` | UCC-165 table | `catalog.forge_pipeline_secret_remove` | `TOUCH-FGI-050` / `TCP-FORGE` |
| `cmd.forge.pipeline.variable.set` | `handlers::forge::pipeline_variable_set` | FGI-021 | `command_request` -> `command_result` | `command_error_record` / `permission_decision` | UCC-165 table | `catalog.forge_pipeline_variable_set` | `TOUCH-FGI-051` / `TCP-FORGE` |
| `cmd.forge.pipeline.variable.remove` | `handlers::forge::pipeline_variable_remove` | FGI-021 | `command_request` -> `command_result` | `command_error_record` / `permission_decision` | UCC-165 table | `catalog.forge_pipeline_variable_remove` | `TOUCH-FGI-052` / `TCP-FORGE` |

Schema pointers: Project refs live in
`Plans/project_system_contracts.schema.json#/$defs/...`; Forge refs in
`Plans/forge_integration_contracts.schema.json#/$defs/...` (plus
`command_currentness` and `confirmation` for currentness/confirmation gates).
Every production row inherits the root `response_contract_ref`
(`Plans/ui_command_response.schema.json`) while the owner typed result stays
the separate effect truth per UCC-164/UIW-023/CV-333. Permission,
currentness, confirmation, the one-use protected human-broker ref (secret
set), `ObservableWork` (async creation/artifact paths), FileSafe/artifact-import
disposition, and exact return are named per row; wording stays provider-neutral
and no provider literal appears in any generic Forge row.

## 2. Updated existing rows

- `catalog.forge_pipeline_open_in_browser` keeps its FGI-010 binding and adds
  the FGI-021 exact `official_destination_kind`: `automation_run_artifacts`
  binds the exact automation run behind `Open artifacts in service`;
  `hosted_service_settings` binds the exact service settings scope behind
  `Open service settings` with no run identity. The allowed origin resolves
  from the provider instance profile `web_base_url`, which may differ from
  the API host `api_root`; run and settings identities are never conflated.
- Recovery reverse consumers reuse Forge owner routes: Continue Setup ->
  `cmd.project.resume_creation`; Open Repository -> existing
  `cmd.forge.repository.open_in_browser` (verified binding only); Delete
  Repository -> `cmd.forge.repository.delete`. Neither open nor delete is
  Project-local mutation.
- `TCP-PROJECT`: availability/return/trigger text extended for the resume
  join. `TCP-FORGE`: `FGI-021` added to requirement refs; census updated to
  52 primaries / 49 common central routes (43 FGI-010 + 6 FGI-021);
  availability/trigger text extended for delete/CI gates. No new profile was
  needed; all seven Touch rows use `action_kind=command`, `partial`.

## 3. Intentional denominator deltas (validator worker applies)

| Registry | Before | After | Delta |
|---|---|---|---|
| Touch rows | 643 | 650 | +7 (`TOUCH-PJCT-011`, `TOUCH-FGI-047`..`052`) |
| Touch profiles | 133 | 133 | +0 (existing profiles updated) |
| Excluded tokens | 58 | 58 | +0 |
| Alias bindings | 65 | 65 | +0 |
| Production entries | 1142 | 1149 | +7 (one per command; open_in_browser updated in place) |

The next validator worker updates
`scripts/pm-touch-closure-verify.py#exact_resolved_denominators` and
`tests/test_pm_touch_closure_source.py` (rows/profiles asserts) plus any
expected-inventory entries; those files are untouched here. New companion
units: `UCC-165` (catalog), `WM-058` (wiring prose), and the dated DRY
boundary addendum under DR-040/DR-041. `Plans/UI_Wiring_Rules.md` needed no
edit: UIW-023 already covers central response separation generically.

## 4. Remaining companion seams (explicitly not closed)

- Commands & Shortcuts local action census: still in repair; no rows admitted
  here. A later task admits them.
- `Plans/Commands_System.md` companion registration for the seven IDs (not in
  central-companion scope).
- Settings and onboarding companion updates under closure item
  `central-admission` (not in this file's owned scope).
- Owner-side consumers: Planning Wizard recovery projection, Final GUI
  delete/CI surfaces, Forge owner report in this directory (producer still
  running).
- Shard/index regeneration and landing checks (landing scope); native
  handler/dispatcher evidence; Event Authority admission for any future event.

## 5. Checks run

Narrow checks only (sibling schemas still changing; no whole validators):
JSON parses; new/updated production entries validate against
`Plans/Wiring_Matrix.schema.json` required fields and patterns; new Touch rows
match the row schema and resolve to existing profiles; the 13 `cmd.*` tokens
in the new catalog section each have a production row or exclusion and all 7
new production commands appear in the catalog (bidirectional); no provider
literal in the new/updated generic Forge rows; counts verified as in §3.
