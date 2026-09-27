# Hosted-CI official destinations — concept consumer (FGI-021, repaired)

Date: 2026-09-26. Owner scope: this lane owns exactly two paths —
`Concepts/pm7-tools/forge_backup_post_integration_source.py` and this report.
This delivery repairs the six independent-review findings on the concept-projection
half of the open G1 rows for `cmd.forge.pipeline.artifact.download` and the four
`cmd.forge.pipeline.secret/variable` mutations from
`reports/concept-packet-integration-20260926/server-backup.md`
(which remains the prior prose record; this report supersedes only the
"selected source already offers preview-disabled `Open ...` through
`cmd.forge.pipeline.open_in_browser`" status, not its review history).
This revision additionally repairs two independently reviewed current-source
defects: the generic `Connect automation` setup route and the Origin
automation-binding fixture (see §2). All three official destination kinds are
preserved; all other producer edits are byte-preserved.

Static concept contracts only. No native handler, runtime, provider,
recovery-execution, visual, or readiness proof is claimed. Every control below
stays `owner_unavailable_concept_preview` / `handler_unavailable` until native
contracts land with source-hashed evidence.

## 1. Owner-surface verdict: spec + companions COMPLETE; joins await the script gate

Read at this worktree revision before implementing:

- `Plans/Forge_Integrations.md` §4.3 plus `FGI-021`: `cmd.forge.pipeline.open_in_browser`
  carries exact `official_destination_kind` with three values —
  `automation_run_artifacts` binds definition + immutable run behind `Open artifacts
  in service`, `hosted_service_settings` binds a non-null scope with no run behind
  `Open service settings`, and `automation_service_overview` binds the selected
  service overview with no run/scope behind first-card `Open in <provider>`.
  Handoff origin/route equals the profile-approved UI destination for the selected
  instance/tenant and is never equated with the normalized API/transport host.
  Capability-absent fallback to the corresponding official-service destination is
  already decided by `FGI-015`, not a new product choice.
- `Plans/forge_integration_contracts.schema.json`
  `#/$defs/command_target/properties/official_destination_kind`: enum of all three
  kinds, with per-destination conditionals requiring the run/scope identities and
  forbidding smuggled ones; `pipeline_id` (definition) and `automation_run_id`
  (immutable run) are distinct; HostedCI success results/receipts retain their
  automation binding ref + generation. New `hosted_ci_command_roundtrip` and
  `hosted_ci_capability_admission` definitions carry the join evidence.
- `Plans/forge_integration_contract_fixtures.json`: 106 positives (overview request,
  artifact success result + receipt, 3 linked roundtrips, 5 admission records,
  read-only admin surface), 166 negatives (scope/run/overview/admission/binding
  retention), and 22 structurally-valid semantic counterexamples with exact
  violated-rule names for the script worker.
- `Plans/FinalGUISpec.md#F3-529`: provider-native automation nouns, artifacts distinct
  from PM outputs and Backup exports with explicit import/download and never
  auto-executing, secrets/variables read/write gated with official external fallback.

Correction to the prior revision: "Owner-surface COMPLETE" overclaimed the joins.
Completion here means actual spec + companions; request→result→receipt equality is
still proven only when the script gate implements the handoff rules, and the native
handler remains unavailable. Nothing in this lane was blocked on missing owner surface.

## 2. What changed (exact bands)

All edits are inside `Concepts/pm7-tools/forge_backup_post_integration_source.py`.
No other file touched. The prior producer work (three destination kinds,
run/scope identity, first-card overview, generic non-request rule) is preserved;
every pre-existing display field and label is byte-identical. This revision makes
two reviewed repairs:

Repair A — generic `Connect automation` setup route. The button wrongly carried
`ui.repository_automation.binding.select` with `concept_local_controller_available`:
under F3-529 that action only chooses among two or more already-authorized bindings,
and no click handler claimed the button, so it looked available but did nothing.
It now carries the genuine existing Settings navigation local action
`ui.settings.route.open` with `available`, `data-domain="source"`,
`data-workspace="source-manager"` (the Source Control Code Services tab — the
concept home of owner "Source Control → Hosting Services", whose default tab is
Code Services), plus `data-action="navigate"` and a `data-pm7-open-hosting-services`
hook. A new `openHostingServices()` in the T46F controller mirrors the proven
`openBackup()` pattern (click the Settings tab, then
`PM12_KIMI.navigate('source','source-manager')`), and the T46F document click
listener handles the hook. This route was chosen after reading the actual
navigation code: the Settings `dispatchAction` `navigate` case exists but its
document listener ignores events outside the Settings surface
(`PM7_SETTINGS_TOME.ownsEvent` gate), so a side-panel button needs the T46F
controller's own handler — exactly what `openBackup()` already proves.
No command id, no destination kind, no refs; it dispatches no pipeline request.
The provider `<select>` keeps `ui.repository_automation.binding.select`, which is
its correct F3-529 use (choosing presentation among candidates).

Repair B — Origin automation binding. The fixture display says GitHub-owned
mirror work (`Origin mirror → GitHub PR #128`, `Checks supplied by GitHub`) yet
bound `provider: cursor_origin`, `service_kind: external_ci`, and Origin
instance/binding/run/route/scope refs. That contradicts FGI-014
(`Plans/Forge_Integrations.md` lines 878–879: GitHub-owned mirror workflows,
issues, checks, secrets, settings, and history stay GitHub-owned) and
`Plans/Cursor_Origin_Integration.md` line 46 (GitHub-inbound mode consumes GitHub
owners; Origin cannot independently ingest those domains). The exact automation
binding for these checks is the connected GitHub service binding with GitHub
official UI plus an independent Origin repository binding — and no exact GitHub
binding (service/instance/account/run) exists in fixture truth, so per the repair
directive the Origin destinations are left unavailable rather than fabricated:
the eleven binding fields are removed from the `origin` entry (display fields
byte-identical; `githubOwnedChecks:true` plus
`unavailableReason:'github_automation_binding_unavailable'` mark it), and
`renderProvider` gates all three `open_in_browser` controls on
`bound = !generic && !!p.automationBindingRef`. Under `origin`, `Open connected
service`, `Open artifacts in service`, and `Open service settings` now render as
concept previews with the honest reason, no destination kind, and no refs — not
valid requests. Refresh, Run, Open job/logs, Retry, and Review gate are unchanged
plain concept previews.

`POST_INTEGRATION_SCRIPT` band (script `pm7-t46f-forge-backup-js`):

- Five bound entries (`gitlab`, `azure`, `bitbucket`, `forgejo`, `gitea`) keep all
  eleven binding fields byte-identical. The `origin` entry keeps all display fields
  byte-identical and drops its eleven fabricated binding fields. The `generic`
  entry is byte-identical (no binding fields at all).
- `openInBrowserAttrs(kind, p)` is byte-identical: the artifacts branch emits
  `data-official-destination-kind="automation_run_artifacts"` with
  `data-pipeline-id`, `data-automation-run-id`, the artifacts route ref, and no scope
  ref; the settings branch emits `data-official-destination-kind="hosted_service_settings"`
  with `data-hosted-setting-scope-ref`, the settings route ref, and no
  `data-pipeline-id`, `data-automation-run-id`, or `data-job-id`; the overview branch
  emits `data-official-destination-kind="automation_service_overview"` with the
  overview route ref and no run/scope/job/pipeline identity. All branches carry
  `data-provider`, `data-service-kind`, `data-instance-ref`,
  `data-automation-binding-ref`, `data-allowed-origin-ref`, and a
  `data-pm-hover-label/detail` pair stating concept-preview-only, the decided-fallback
  meaning where applicable, and that the button does not open a browser page.
- `renderProvider` first card: the five bound services render `Open in <provider>` →
  `openInBrowserAttrs('automation_service_overview', p)` on the one existing
  `cmd.forge.pipeline.open_in_browser` command (labels unchanged). Under `origin`,
  `Open connected service` renders with `github_automation_binding_unavailable`
  and no attrs. Under `generic`, `Connect automation` is the Settings-route setup
  intent described above.
- `renderProvider` third card (`Artifacts, deployments, and settings`): the five
  bound services render `Open artifacts in service` →
  `openInBrowserAttrs('automation_run_artifacts', p)` and `Open service settings` →
  `openInBrowserAttrs('hosted_service_settings', p)` on the one existing
  `cmd.forge.pipeline.open_in_browser` command. Under `origin`, both render with
  `github_automation_binding_unavailable` and no attrs; Review gate stays a plain
  preview. Under `generic`, the six remaining provider-view controls (Open
  job/logs, Retry, Open artifacts in service, Review gate, Open service settings)
  render with the exact reason `automation_service_not_configured` and no
  destination kind or refs; they are explicitly not valid requests.

`CONTRACT_DATA` band (script `pm7-t46f-contracts`): all pre-existing keys
byte-identical except the two repaired rules. `pipeline_open_in_browser` keeps the
three destinations (requires/forbids/run-identity), the artifacts
`automation_run_id` requirement, the settings run forbids, the
`first_card_overview` entry, and the preview-disabled non-request rule; the
`origin` row leaves `provider_bindings` for a new `origin_unavailable` entry
(reason, null kind, no refs, not valid requests, FGI-014/Cursor_Origin rationale);
`binding_choices` drops the `cursor_origin via external_ci` claim; and
`generic_no_service.setup_intent` becomes `ui.settings.route.open` / `available` /
`source` / `source-manager` with the working-handler detail.

`apply()` band: the three one-call-site-per-kind guards and the
`data-automation-run-id` guard are unchanged; `automationRunId`/`overviewRouteRef`
census moves from seven to six each (five bound entries + one use); the stale
`binding.select` setup-route guard is replaced by four guards (zero `binding.select`
in the script band, one setup hook pair, one `ui.settings.route.open`, one
`navigate('source','source-manager')`); and six fabrication guards assert no
`cursor_origin`/`external_ci` in either band plus the Origin marker/reason/contract
entries. The no-navigation guard is untouched.

## 3. Routes

Single route surface: `panel-git` (`repository_automation` occupant) → provider view
(`#pm7AutomationProviderView`) → first/third card → existing command
`cmd.forge.pipeline.open_in_browser`, distinguished only by typed target metadata,
plus the generic setup intent:

| Visible control (label unchanged) | `official_destination_kind` | Binds | Forbids |
|---|---|---|---|
| `Open in <provider>` (first card) | `automation_service_overview` | provider, service kind, instance ref, automation-binding ref, allowed-origin ref, overview route ref | `pipeline_id`, `automation_run_id`, `job_id`, `hosted_setting_scope_ref` |
| `Open artifacts in service` | `automation_run_artifacts` | provider, service kind, instance ref, automation-binding ref, `pipeline_id`, exact `automation_run_id`, allowed-origin ref, artifacts route ref; `job_id` optional when a job row is selected | `hosted_setting_scope_ref` |
| `Open service settings` | `hosted_service_settings` | provider, service kind, instance ref, automation-binding ref, exact `hosted_setting_scope_ref`, allowed-origin ref, settings route ref | `pipeline_id`, `automation_run_id`, `job_id` |
| `Connect automation` (generic) | none (setup intent) | nothing; `ui.settings.route.open` + `available` + `source`/`source-manager` with working T46F click handler | all destination fields, refs, and command ids |
| `Open connected service` / `Open artifacts in service` / `Open service settings` (origin) | none (unavailable) | nothing; `github_automation_binding_unavailable` (GitHub-owned checks, no exact fixture binding) | all destination fields, refs |

Native availability on all three destinations stays `handler_unavailable`
(`data-availability="owner_unavailable_concept_preview"`); metadata/fixture inspection
distinguishes the destinations without claiming any external page was opened.
No new visible buttons were added: the three kinds preserve three selected controls.

## 4. Provider/instance bindings

| Service key | `provider` | `service_kind` | Concept refs |
|---|---|---|---|
| `gitlab` | `gitlab` | `gitlab_pipelines` | `concept:{instance,automation-binding,allowed-origin}:gitlab:alpha`, `concept:pipeline:gitlab:991`, `concept:automation-run:gitlab:991`, per-destination route + scope refs |
| `azure` | `azure_devops` | `azure_pipelines` | same shape, `azure` / `...:20260901-17` |
| `bitbucket` | `bitbucket_cloud` | `bitbucket_pipelines` | same shape, `bitbucket` / `...:418` |
| `forgejo` | `forgejo` | `forgejo_actions` | same shape, `forgejo` / `...:214` |
| `gitea` | `gitea` | `gitea_actions` | same shape, `gitea` / `...:81` |
| `origin` | none (unavailable) | none (unavailable) | none — GitHub-owned checks; exact GitHub binding has no fixture, so no refs are emitted |
| `generic` | none | none | none — setup intent, no refs |

One binding choice is recorded in the projection, not asserted as probe truth:
Bitbucket Pipelines reads as `bitbucket_cloud` (Data Center has no Pipelines).
Instance variants (Services vs Server, Cloud vs self-managed) stay owner/probe
truth. The prior `origin → cursor_origin via external_ci` claim is removed: the
Origin-mirror checks are GitHub-owned (FGI-014; Cursor_Origin Integration §1.2),
their exact binding is the connected GitHub binding with GitHub official UI plus
an independent Origin repository binding, and no such exact binding exists in
fixture truth — so the Origin destinations stay unavailable with
`github_automation_binding_unavailable` instead of carrying fabricated refs. All
45 ref tokens (five bound services × nine) validate against the owner
`non_secret_ref` pattern. The first-card `Open in <provider>` shortcut is the
modeled overview destination; no adjudication is pending.

## 5. Official UI origin vs API host

The allowed UI origin travels only as the opaque `allowed_origin_ref`, resolved by the
profile-allowlisted dispatcher for the exact instance/tenant; the concept asserts no
host value and no equality between the UI origin and `normalized_host` (the
github.com UI vs api.github.com API split is the illustrative case). The owner prose
error is repaired alongside: origin/route must equal the profile-approved destination,
and cross-instance/tenant/route substitution is rejected. Audit proves it:
neither literal band contains `github.com`, `api.github.com`, `gitlab.com`,
`https://`, `http://`, or any other host/URL literal.

## 6. Native-capability fallback mirror (owner lane)

- Artifact download/import: owner lane `cmd.forge.pipeline.artifact.download` with
  explicit `download`/`import` disposition; until native capability exists, this concept
  offers the `automation_run_artifacts` destination for the exact run — the FGI-015
  decided fallback, restated in the button hover detail.
- Secret/variable mutation: owner lane `cmd.forge.pipeline.secret.set/remove` and
  `cmd.forge.pipeline.variable.set/remove`; until native capability exists, this
  concept offers the `hosted_service_settings` destination for the exact scope — same
  decided fallback. The `Secrets: Names only · values never displayed` row is
  byte-preserved; no secret, password, token, or key material appears in state, refs,
  hover copy, or the projection (audited, §8).
- Service overview: first-card `Open in <provider>` offers the
  `automation_service_overview` destination for the exact service — same command,
  no fabricated run or scope.
- No new visible controls were added: the designer-selected labels, cards, kv rows,
  and panel structure render byte-identical; only invisible `data-*` metadata changed.

## 7. Generic no-service rule

`Connect automation` is a setup/local navigation intent with no configured service:
genuine Settings-route metadata (`ui.settings.route.open`, `available`,
`source`/`source-manager`) with a working T46F click handler, no command id, no
destination kind, no refs, and it dispatches no pipeline request. The six remaining
provider-view controls stay preview-disabled with the exact pre-existing reason
`automation_service_not_configured`, carry no `official_destination_kind` and no
refs, fabricate no run, scope, or origin, and do not count as valid requests. The
`No definitions are fabricated` boundary and its `apply()` guard are untouched.
Under `origin`, the three `open_in_browser` destinations stay preview-disabled with
`github_automation_binding_unavailable` for the same no-fabrication reason: the
GitHub-owned checks have no exact GitHub fixture binding to carry.

## 8. Validation tests (read-only; /tmp probes, kept for re-runs)

- Static band audit — 21 PASS / 0 FAIL: `automationRunId`/`overviewRouteRef`
  census at six each (five bound entries + one use); one
  `data-automation-run-id` emitter; zero `binding.select` in the script band;
  setup hook pair + one `ui.settings.route.open` + one
  `navigate('source','source-manager')`; no `cursor_origin`/`external_ci` in
  either band; Origin marker/reason/contract entries present; one
  `openInBrowserAttrs` call site per kind (×3); all three kinds present; no
  navigation/API tokens (`window.open`, `location.href`, `fetch(`,
  `XMLHttpRequest`); provider `<select>` keeps its correct `binding.select`;
  45 `concept:` refs (5 × 9) all match the owner `non_secret_ref` shape; all
  five bound entries carry all eleven binding fields; `origin` carries zero
  binding fields with display intact.
- `/tmp/t46f_repair_extract.py` + `/tmp/t46f_repair_harness.js` —
  `node --check` clean; 92 PASS / 0 FAIL executing the real T46F script under a
  DOM stub: a synthetic click on the setup hook opens the Settings tab and calls
  `PM12_KIMI.navigate('source','source-manager')`; each of the five bound
  services renders exactly one button per destination kind with
  run/scope/binding/origin/route inclusion and exclusion per kind; `origin`
  renders zero kinds, zero refs, exactly three
  `github_automation_binding_unavailable` controls, and intact labels with no
  `Origin Actions`; `generic` renders zero kinds, zero refs, a command-free
  `Connect automation` setup button with the Settings route + hook, exactly six
  `automation_service_not_configured` controls, and intact labels;
  `CONTRACT_DATA` parses as JSON with the exact projection shape (3
  destinations, 5 bindings, setup intent, non-request rule, overview entry,
  origin-unavailable entry); `cmd.*` id set in the band identical to before
  (7 ids — effect delta stable).
- `python3 -m py_compile` clean. No browser probing and no published/generated
  HTML was touched; the narrow repin after sources settle belongs to root alone.
  Only the two owned paths were edited; sibling worktree edits belong to
  concurrent workers and were not touched.

## 9. Handoff — no base/pin edits made

`POST_INTEGRATION_SCRIPT` and `CONTRACT_DATA` feed the T46F pinned base; the narrow
repin after sources settle belongs to root alone and was deliberately not performed
here. Likewise untouched by design: generated HTML, shards, plan index, governance
artifacts, catalog/wiring/central admission, commits, branches, and pushes.
Final integration handoff (owner + concept): `forge-ci-delete.md` in this directory.
