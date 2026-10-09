# ER11 B-08 treatment verifier — I08 (M15 v1)

Block B-08 / treatment / case I08 / method M15 v1 fresh-factored-verification-with-full-criticism / stage verifier.
Native route: muse. Resource version: 75-30-parallel20+15-25-v1.

Inputs read (exact, per input-map.json): brief `cases/I08/brief.md`,
`jobs/B-08/treatment/research/verification-questions.md`,
`jobs/B-08/treatment/research/revealed-plan.md`, plus own
`assignment.md` / `input-map.json`. Own stage-directory job metadata
(dispatch/freeze) observed for deadline/method context only.
NOT opened: investigator discovery/draft/source-map/index, critic output,
campaign/history/evaluator/counterpart material. No nested agents, no extra
workers. Primary sources independently chosen below. No witness runtime was
claimed; all checks are proposed, none executed. Usage/billing: unobserved (null).

Brief (I08) in one paragraph: school-district band instrument lending and
repair coordination across nine schools; two music staff plus a part-time
repair coordinator; teachers record urgent issues; $8,000 annual budget;
usable during summer with help desk closed; records need instrument id,
school, loan status, repair notes, expected return, caregiver contact on
delay; student details limited (many teachers see schedule; no grades or
discipline); large-print screens; family messages in two languages; repair
state (waiting-for-parts vs ready-for-pickup) unclear in binders; pilot one
room plus a few schools, expand only if handoffs clear; replacement approval
and direct caregiver reporting undecided; district sign-in may apply but no
funded integration.

Released plan (P1–P6): P1 track assignment, issue, repair state, expected
return, availability; P2 limit student/caregiver details to handoff-need
staff; P3 large-print friendly screens and two-language caregiver messages;
P4 pilot one room plus selected schools; P5 replacement approval and direct
caregiver reporting are district decisions; P6 sign-in/integration not funded.

Verification questions (neutral, answer-free, from investigator): Q1 NocoDB
self-hosted Community vs licensed-tier table/column/row access, teams, audit
logs, SSO, token default scope/expiry (P2); Q2 Snipe-IT hardware checkout and
checkin API accepted fields and file-upload attachment point (P1); Q3 ERPNext
v15.117.0 and v16.28.0 Asset Repair rules for fully depreciated assets,
capitalize-repair-cost editability, value/life effect (P1).

## Native Goal lifecycle (actual supported calls, no handwritten receipt)

- Objective (<=4000 chars, refers this assignment): `ER11 B-08 treatment
  verifier (I08, M15 v1): execute scientific assignment at
  .../jobs/B-08/treatment/verifier/assignment.md using exact input-map.json;
  independently verify 3 neutral questions (NocoDB access control/SSO/tokens;
  Snipe-IT checkout/checkin API + file-upload attachment; ERPNext v15.117.0 /
  v16.28.0 Asset Repair for fully depreciated assets) from brief +
  revealed-plan + primary sources only; save complete verification.md +
  independent source-map.json + sources/index before terminal completion.
  Deadline 2026-10-09T21:25:55Z.`
- Calls used: `create_goal` (returned active goal), `get_goal` (confirmed
  active), `report_progress` (10/45/75%), `update_goal(status=complete)` only
  AFTER this file plus `source-map.json` and `sources/index.md` are saved.
  Native completion and T3/dispatch completion are separate. Unavailable
  fields: UNKNOWN. Complete native answer may be exported verbatim as
  predeclared fallback; short status never replaces this file.

## Q1 — NocoDB Community vs licensed tiers for P2 (answer)

Short answer: on self-hosted Community (unlicensed), none of the
finer-grained P2 controls in the question are available: no table record
permissions, no table visibility control, no field (column) permissions, no
record-level security, no workspace teams, no workspace audit logs, no
SAML/OIDC SSO configuration, and no granular/expiring API-token controls
(tokens are all-resources, never expire). Each of these is gated to a
licensed self-hosted plan: table record permissions and field permissions at
Business+; table visibility at Scale/Enterprise; record-level security,
workspace teams (and org teams), and workspace audit logs at Scale+; SSO at
Business (workspace) / Enterprise (org) licensed; granular token scope plus
expiry at Business+. Even where available, table permissions govern
create/delete only (not record visibility) and field permissions govern edit
only (not visibility); only record-level security hides rows, and it is
Scale+ only. So a Community-only P2 design cannot rely on hiding
columns/rows in one shared table; it must separate sensitive data (separate
private project/base, fewer members, API-side redaction) or buy a license.

### Governing definitions and defaults

- Hierarchy and roles [S01]: Organization (Enterprise only) → Workspace →
  Base/Project. Roles Owner, Creator, Editor, Commenter, Viewer, No Access,
  plus Inherit. Project role overrides workspace role; explicit individual
  role beats team role at the same level (five-step effective-role
  resolution). Exactly one Owner per workspace/project; Owner assignable only
  to individuals, never to teams. Private projects require explicit invite;
  workspace role does not grant access.
- Table Visibility [S02]: who can find/open a table: Creators & up, Editors &
  up, Specific users or teams, Everyone (default: every table visible to
  everyone in the project). Evaluated before record permissions; hidden table
  excluded from listing APIs/automations/scripts/extensions. Only Project
  Owners configure it.
- Table Record Permissions [S02]: who can create records and who can delete
  records: Editors & up (default), Creators & up, Specific users or teams,
  Nobody. Applies to APIs and shared-form creation too.
- Field (column) permissions [S03]: who can EDIT values in one field:
  Editors & up (default), Creators & up, Specific users (members or teams
  with Editor+), Nobody. Applies to APIs and shared forms. Excludes
  calculated/system types (Formula, Rollup, Lookup, Created By/At, Last
  Updated By/At, Button, QR, Barcode). LTAR edit governed by source-table
  field only.
- Record-level security [S04]: filter-based scoped policies (Role/User/Team
  subjects; team scope Self-only or Self-and-descendants default) plus one
  optional Default Policy (Show all / Deny all / Condition). No policies =
  all records visible (same as Show all). Only Owners and Creators configure.
  Dynamic values (current user id/email/name, my teams, members of my teams)
  evaluated per signed-in user. Configurable per table.
- Teams [S05]: Workspace Teams (single workspace, managed Workspace sidebar
  > Teams) and Organization Teams (whole org, managed Admin Panel > Teams).
  Sub-teams nest to 4 levels; record/table/field permissions flow down.
  Creator becomes first Team Owner; always ≥1 owner.
- Audit logs [S06]: workspace-level time-stamped record (user, timestamp,
  project, event, IP; details panel adds OS/browser, full JSON payload).
  Only workspace owners can open Settings > Audits. Logged categories:
  Data (incl. export), User & Auth, Workspace, Project, Table, Field, View,
  Shared View, Webhook, Source, Integration, Dashboard, Widget, Script,
  Workflow, NocoDocs, Permission, RLS, Record Template, Date Dependency, API
  Token, Snapshot, Team, SCIM (Enterprise), Airtable Import, Org Users
  (self-hosted). Filters: user, project, event, range (24H/week/month/year/
  custom/all-time). Record-level change history is a separate per-record
  Record audit view.
- SSO [S07]: email+password default; 2FA optional; Google OAuth, SAML 2.0
  (Okta/Auth0/Ping/Azure AD/Keycloak guides), OIDC (Okta/Auth0/Ping/Azure
  AD), SCIM 2.0 (Okta, Entra ID). Business plan config at workspace
  Settings > SSO; Enterprise config in Admin Panel / Account Settings.
  Cloud requires domain verification (only verified-domain emails via SSO);
  on-premise skips domain verification. Self-hosted-only setting `Allow
  email & password sign-in alongside SSO`, default off (SSO hides password
  form; double-click logo reveals fallback). After SSO enforcement, only
  tokens created in an SSO-authenticated session work for that workspace;
  pre-SSO tokens must be regenerated; disabling SSO does not auto-revoke.
  SCIM available Enterprise only (Cloud and self-hosted).
- API tokens [S08]: two types. Fine-grained (scoped to projects + 8
  permission categories; all new integrations) vs Legacy (org-wide, full
  creator role; deprecated for creation). Intersection model (token only
  restricts role), deny-by-default per category, show-once string stored as
  SHA-256. New-token defaults (where controls exist): Records Read & write,
  Tables Read, Fields Read, others None; minimum one category; Access starts
  All resources (All vs Add-a-project); Expiry options 7/30/60/90 days,
  1 year (default), Custom date, No expiration. Security guidance: shortest
  expiry (90 days suggested), least privilege, scope to projects, rotate,
  disable-before-delete. Auth via `xc-token` or `Authorization: Bearer`
  (equivalent). Legacy tokens never expire, deletable any time; creation
  disabled on Cloud/licensed (transitional `NC_ALLOW_LEGACY_API_TOKENS=true`
  for licensed self-hosted); V1 API creation remains for backward compat on
  Community/unlicensed.

### Plan gating (self-hosted Community vs licensed; Cloud for reference)

| Capability | Self-hosted Community (unlicensed) | Licensed self-hosted | Cloud (reference) |
|---|---|---|---|
| Table Record Permissions (create/delete) | NOT available | Business+ | Plus+ |
| Table Visibility (who sees table) | NOT available | Scale and Enterprise | Business+ |
| Field permissions (who edits column) | NOT available | Business+ | Plus+ |
| Record-level security (who sees which rows) | NOT available | Scale+ | Scale+ |
| Workspace Teams | NOT available | Scale+ | Business+ |
| Organization Teams / org roles | NOT available | Scale+ teams; Enterprise org roles | Enterprise |
| Workspace audit logs | NOT available | Scale+ | Scale+ |
| SAML/OIDC SSO | NOT available (reach sales; Business/Enterprise config) | Business (workspace) / Enterprise (org); SCIM Enterprise only | Business/Enterprise; domain verification required |
| Granular token scope + expiry | All-resources + never expire (controls hidden) | Business+ | All plans |
| Legacy token creation | V1 API backward-compat creation still works | Disabled (transitional env flag) | Disabled |

Docs currency: tokens/table/field/RLS/teams/audit pages `Last updated:
2026-10-09`; auth page `2026-10-03`; pricing observed 2026-10-09. NocoDB docs
are mutable; gating sentences quoted verbatim in sources/ are the governing
evidence at access time 2026-10-09T21:12–21:14Z.

### Exceptions and leak paths that matter for P2

- Table permissions do not control record visibility; field permissions do
  not control field visibility. Hiding editing is not hiding data.
- Hidden tables still leak through relational display values, Lookup/Rollup
  values, and link/unlink from the source table (Editor+); linked record
  shows as Private Table/View but values remain.
- Shared projects/views expose only `Everyone` tables; duplicating a project
  copies only tables the duplicator can see (formulas on hidden relations
  can break).
- RLS without a Default Policy leaves unmatched users on Show all; forgetting
  Deny-all default silently exposes all rows. RLS filters can use Created
  by/modified system fields unavailable to normal view filters.
- Token cannot exceed creator role; an over-privileged creator plus
  All-resources Community token is full org access with no expiry.
- SSO-enforced workspace silently invalidates pre-SSO tokens (must
  regenerate after SSO sign-in); tokens keep working after SSO disabled.

### Version/release applicability

NocoDB is fair-code with continuous Cloud/docs updates and licensed
self-hosted plans (Business/Scale/Enterprise) distinct from Community
Edition. No pinned self-hosted version number is stated on these docs pages;
applicability is by plan/license, not by semver. Verify the instance license
in Admin Panel / billing before relying on any gated control.

### Discriminating counterexample / proposed check (not executed)

Counterexample: put caregiver phone + student name in one `Loans` table on
Community, set field permission `Nobody` (if following a licensed-tier
guide), and invite all nine schools' teachers as Editors. On Community the
control does not exist; even on a licensed plan it would only block editing,
not viewing — every teacher still reads every phone number. P2 fails.
Proposed check (needs a licensed staging instance + Community instance; no
runtime available here): (1) on Community, confirm table/field/RLS/teams/
audits/SSO/token-expiry controls absent or hidden and token is
all-resources/never-expire; (2) on licensed Scale+, create `Loans` (public
columns) + `Contacts` (private table, Specific users or teams = repair
coordinator + assigned school staff), add RLS scoped policy `school =
dynamic my-teams` with Default Deny all, verify a teacher from school A
cannot list school B rows via UI and via scoped token (`Records: Read` on
`Loans` only returns 403 on `Contacts`), and confirm workspace audit shows
the denied/allowed reads and exports; (3) enable SSO, confirm pre-SSO token
fails on the enforced workspace and post-SSO token succeeds.

### Uncertainty

- Google OAuth plan gating on self-hosted is not explicitly stated on the
  SSO overview page; SAML/OIDC SSO gating (Business/Enterprise, sales) is
  explicit. Do not treat Google login as proof of full SSO availability.
- Pricing-page seat/record/API limits were observed but truncated in fetch;
  only the docs gating sentences above are relied on.
- Record-audit (per-record history) availability vs workspace audit logs was
  not separately gated in the fetched pages; assume per-record history may
  exist where workspace audit does not, and verify on the instance.

## Q2 — Snipe-IT hardware checkout/checkin API + file uploads (answer)

Short answer: at Snipe-IT v8.8.0 / master (Sept–Oct 2026), hardware checkout
and checkin are text-only APIs with no file/image parameter. Checkout accepts
target selectors + status/dates/note/name/requestable; checkin accepts
note/name/location/status/checkin_at/clear_name. File upload is a separate
API (`POST {object_type}/{id}/files`, e.g. hardware/assets) that creates a
NEW `uploaded` action-log entry on the asset via `logUpload`, not an
attachment on the checkout/checkin entry. Audit is the discriminating
contrast: only audit accepts `file.0`/`image` and stores the filename ON the
audit log entry. Open issue #19174 (2026-06-11, still open at access) confirms
this gap and requests per-event checkout/checkin attachments. For P1, repair
photos/notes cannot be natively pinned to a specific loan/return event via
these two endpoints today; the honest interim is a separate `uploaded` entry
with a cross-referencing note, or model-mapped custom fields, not a
checkout-time attachment.

### Checkout — governing interface

- Routes [S10]: `POST /api/v1/hardware/{id}/checkout`,
  `POST /api/v1/hardware/bytag/{any}/checkout` (same hardened path;
  by-tag resolves asset_tag then calls checkout).
- Validation [S09] (`AssetCheckoutRequest`, `prepareForValidation` infers
  `checkout_to_type`): `assigned_user` XOR `assigned_asset` XOR
  `assigned_location` (each numeric/nullable, `required_without_all` +
  `prohibits` the other two, `exists_undeleted` — soft-deleted targets
  rejected with 422 before mutation); `checkout_to_type` required in
  asset,location,user; `status_id` nullable, must exist with
  `deployable=1`; `checkout_at` nullable date; `expected_checkin` nullable
  date; `requestable` nullable boolean; `note` required|string ONLY when
  setting `require_checkinout_notes` is on, otherwise no rule.
- Controller behavior [S11] (`AssetsController@checkout`): authorizes
  checkout (class + instance), rejects unavailable assets, resolves target
  unscoped then rejects trashed targets (`deleted_at`), applies `status_id`
  if filled, applies `requestable` only if `has()` (preserves existing
  otherwise), derives `location_id` from target (target location, or asset
  location, or location id), reads `checkout_at` (default now),
  `expected_checkin` (default null), `note` (default null), `name`
  (`has('name')` ? input : preserve existing), then DB transaction:
  `lockForUpdate` + re-check `availableForCheckout()` (concurrency guard;
  mirrors consumables GHSA-x4g2-87xc-m5jm) then
  `Asset::checkOut(target, user, checkout_at, expected_checkin, note, name,
  location_id)`.
- Model [S14] (`Asset::checkOut`): sets `expected_checkin` (if given),
  `last_checkout`, `name`, `assignedTo`, `location_id`; saves; fires
  `CheckoutableCheckedOut` event (writes checkout action log with note);
  increments `checkout_counter`. No file handling anywhere in this path.
- Defaults: target required (exactly one); `checkout_to_type` inferred but
  validated; dates null/now; note null unless instance requires it; name
  preserved unless sent; requestable preserved unless sent; location derived
  from target.

### Checkin — governing interface

- Routes [S10]: `POST /api/v1/hardware/{id}/checkin`,
  `POST /api/v1/hardware/bytag/{any}/checkin`, body-based
  `checkinbytag`/`checkin_key`+`checkin_by_field` lookup (serial gated on
  `unique_serial`) falling back to `asset_tag`.
- No FormRequest; plain `Request` [S11] (`AssetsController@checkin`).
  Accepted/observed inputs: `note` (passed to `CheckoutableCheckedIn`
  event; no required rule in code), `name` (`clear_name=='1'` clears,
  else `has('name')` sets), `location_id` (if filled, overrides return to
  `rtd_location_id`; `update_default_location` truthy also rewrites
  `rtd_location_id`), `status_id` (if filled, set as-is; no deployable
  constraint observed in checkin code), `checkin_at` (if filled,
  `Y-m-d` + current time; sets `action_date` override when not today).
  Fixed effects: `expected_checkin=null`, `last_checkin=now`,
  `assignedTo` disassociated, `accepted=null`, location reset to RTD
  (unless overridden), license seats unassigned, pending checkout
  acceptances for the asset deleted, child assets assigned to this asset
  moved to the new location. Returns already-checked-in error when no
  `assignedTo`.
- No file/image parameter in checkin code; no validation file rule.

### File uploads — where they attach

- Routes [S10] (since v8.1.17): `GET {object_type}/{id}/files` (list),
  `GET {object_type}/{id}/files/{file_id}` (show),
  `POST {object_type}/{id}/files` (upload),
  `DELETE {object_type}/{id}/files/{file_id}/delete`,
  where object_type includes accessories|audits|assets|components|
  consumables|hardware|licenses|locations|maintenances|models|suppliers|
  users|companies|departments.
- Controller [S12] (`UploadedFilesController@store`): authorizes
  `manageFiles` (stricter than read `files`); requires multipart `file[]`;
  per file `handleFile(storagePath, prefix-id, file)` then
  `$object->logUpload(filename, notes)`; returns the new `uploaded`
  action-log rows via transformer. `notes` becomes the upload-entry note.
- Linkage [S13] (`Loggable::logUpload`): creates a NEW `Actionlog` with
  `item_type`/`item_id` = the asset, `filename`, `note`, `action_date` now,
  `action_type='uploaded'`. It does not take a checkout/checkin log id and
  does not mutate the checkout/checkin entry. Listing files queries the
  asset's `uploads()` relation (the `uploaded` entries), sortable by
  id/filename/action_type/action_date/note/created_at.
- Contrast — audit accepts files, checkout/checkin do not [S11]: the audit
  path checks `$request->hasFile('file.0')` (legacy `image` aliased in
  `UploadFileRequest`), stores via `handleFile(Audits, 'audit-id', file)`,
  and passes `$file_name` into `logAudit(note, location, file_name)` so the
  filename renders ON the audit history entry. No equivalent exists in
  checkout/checkin.
- Corroboration [S15]: issue grokability/snipe-it#19174 `Feature Request:
  Photo/file attachment support on checkout and checkin action log entries
  via API` (open; created 2026-06-11) states current checkout/checkin accept
  only text fields and the upload endpoint attaches globally to the asset,
  not to a specific event; proposes multipart on checkout/checkin or
  `POST /api/v1/actionlogs/{id}/uploads`; workaround is immediate upload
  with manual note (e.g. `Checkout condition photo – 2026-06-11`), which
  loses linkage under frequent checkouts. Note: the issue body writes the
  upload path as `POST /api/v1/hardware/{id}/uploads`; current code routes
  show `POST {object_type}/{id}/files`. Treat `/uploads` as stale shorthand
  or Cloud-alias wording; the functional claim (global, not per-event) is
  confirmed by code.

### Version/release applicability

Latest release observed: Snipe-IT v8.8.0 (tag, published
2026-09-30T19:14:30Z; requires PHP ≥8.2, 8.4+ recommended). Code excerpts are
master snapshots fetched 2026-10-09T21:13Z; mutable drift possible, but the
checkout/checkin/file route shape plus the open feature request jointly pin
current applicable behavior. File API debuted v8.1.17.

### P1 consequence (correction vs compatible vs optional)

- A plan clause requiring a photo/note pinned to a specific checkout or
  checkin event via these two endpoints is not natively implementable today
  (verified gap, not proof of impossibility of the workflow). Compatible
  implementations: (a) separate `uploaded` entry immediately after
  checkout/checkin with a note cross-referencing event id/date/user —
  timestamped but not linked; (b) asset custom fields included on
  checkin/checkout forms (model fieldset `customFieldsForCheckinCheckout`
  path exists on the model; API-checkout wiring not confirmed in this
  excerpt — verify before relying); (c) external store keyed by action-log
  id. Optional alternative: extend the API per #19174 (multipart on
  checkout/checkin or actionlog upload endpoint). No destructive plan
  correction is warranted; P1 tracking (assignment/issue/repair-state/
  expected-return/availability) itself is unaffected — only per-event
  attachment placement is constrained.

### Discriminating counterexample / proposed check (not executed)

Counterexample: `POST /api/v1/hardware/42/checkout` with
`checkout_to_type=user&assigned_user=7&expected_checkin=2026-10-20&note=...`
plus a multipart `file` part succeeds on text fields and silently ignores
(or rejects, depending on request filtering) the file — no filename appears
on the resulting checkout action-log row, while `POST
.../hardware/42/files` with the same file creates a separate `uploaded` row.
Proposed check (needs a staging Snipe-IT with API token; no runtime here):
(1) checkout with text fields, capture action-log id; (2) attempt checkout
with multipart file, re-read the checkout entry — assert no filename; (3)
upload via files endpoint with `notes=checkout <id> condition`, assert a new
`uploaded` entry with filename and no back-pointer to the checkout id; (4)
audit with `file.0`, assert filename ON the audit entry (positive control).

### Uncertainty

- Web-UI checkout/checkin forms may accept attachments where the API does
  not; only the API path was verified.
- `customFieldsForCheckinCheckout` model support for fieldset values was
  observed on the model but its invocation from the API checkout path was not
  confirmed in the excerpt; treat API custom-field write-through as
  unverified.
- `/uploads` vs `/files` path wording differs between the issue and current
  routes; verify the exact upload path on the target instance version.

## Q3 — ERPNext Asset Repair for fully depreciated assets (answer)

Short answer: in BOTH v15.117.0 and v16.28.0, Asset Repair creation for fully
depreciated assets is ALLOWED for expense tracking; `Capitalize Repair Cost`
is forced off and read-only, and the repair does not increase asset value or
useful life. Server-side `validate_asset()` zeroes `capitalize_repair_cost`
and `increase_in_asset_life` whenever `asset.get_status() == 'Fully
Depreciated'`; the form JS additionally marks `capitalize_repair_cost`
read-only when the Asset status is Fully Depreciated; an Asset Repair entry
point is present on the Asset form in both versions. Sold/Scrapped assets
remain unrepairable. For P1, repairing old (fully depreciated) band
instruments is a compatible expense-tracking implementation, not an inherent
incompatibility; only value/life uplift is (correctly) disabled.

### Governing rules (both versions)

- Allowed: repair for Fully Depreciated assets [S16][S17] (release notes,
  both published 2026-07-15): `Allows Asset Repair records to be created for
  assets that are fully depreciated and adds an "Asset Repair" button on the
  Asset form. For these repairs, Capitalize Repair Cost cannot be edited and
  the repair does not add to the asset's value or life.` PR lineage:
  #55276 (develop, merged 2026-07-12; issue: fully depreciated assets may
  still be actively used, need expense recording without value increase)
  → backport #57110 to version-15 (merged 2026-07-13) and #57077 to v16.
- Server enforcement [S18][S19]: `validate()` → `validate_asset()`:
  `if asset_doc.status in ("Sold","Scrapped"): throw "cannot be repaired"`;
  `if asset_doc.get_status() == "Fully Depreciated":
  self.capitalize_repair_cost = 0; self.increase_in_asset_life = 0`.
  Identical in v15 (lines ~79–88) and v16 (lines ~72–81). `get_status()` [S22]
  derives Fully Depreciated from depreciation data (value after depreciation
  vs expected, finance books, docstatus), unaffected by the transient
  `Out of Order` status that `update_status()` writes while repair is
  Pending — so the zeroing cannot be dodged by the repair's own status flip.
- UI guard [S20][S21] (both versions, `asset_repair.js` refresh): when
  `frm.doc.asset` is set, `frappe.db.get_value("Asset", asset, "status")`
  then `set_df_property("capitalize_repair_cost","read_only",
  status==="Fully Depreciated")`. UX layer only; server corrects any lag or
  API-set value. (Review note on #55276 observes the JS reads stored status
  while Python uses derived `get_status()` and the field can lag until next
  save — server remains authoritative.)
- No value/life effect when forced off [S18][S19]: capitalization path runs
  only `if self.get("capitalize_repair_cost")`: `increase_asset_value()`
  (`total_asset_cost`/`additional_asset_cost` increment),
  `make_gl_entries()`, and (if `calculate_depreciation` and
  `increase_in_asset_life`) `modify_depreciation_schedule()` /
  `set_increase_in_asset_life()` (v16). With both forced to 0, none of these
  run; repair cost remains expense/stock-consumption tracking only.
- Entry point: v15 `asset.js` shows `Repair Asset` (Manage) for submitted
  assets without a Fully-Depreciated gate in the excerpt — PR #57110 notes
  `the asset.js change from #55276 is not needed here — version-15 already
  shows the Repair Asset button for all submitted assets` [S23]. v16
  `asset.js` shows `Asset Repair` (Create) normally plus an explicit
  `if (status === "Fully Depreciated")` branch adding `Asset Repair`
  (Actions) [S24]. (Contrast: v16.2.0 had REMOVED the button for fully
  depreciated assets via #52026; the July 2026 change reverses that.)
- Still blocked: Sold and Scrapped (throw in both versions). Pending repair
  flips Asset status to `Out of Order`; on completion/cancel
  `set_status()` restores derived status.

### Version applicability

- v15.117.0: tag release published 2026-07-15T02:28:34Z; verified files
  `erpnext/assets/doctype/asset_repair/asset_repair.py`,
  `asset_repair.js`, `erpnext/assets/doctype/asset/asset.js` at tag
  v15.117.0 (stable, pinned).
- v16.28.0: tag release published 2026-07-15T02:24:56Z; same three files at
  tag v16.28.0 (stable, pinned). v16 repair also has multi-invoice child
  table (`invoices`) vs v15 single `purchase_invoice` — unrelated to the
  fully-depreciated rule, which is identical.
- Pre-July-2026 behavior differs (fully depreciated repairs blocked /
  button removed); do not back-apply this answer to older minor versions.

### P1 consequence

Repairing fully depreciated instruments for expense tracking is expressly
supported; treat any plan clause as compatible. Only a clause demanding
capitalization or life extension on a fully depreciated instrument would need
correction — and the correction is narrow (expense-only for those assets),
not destructive to P1 repair handling as a whole. Stock-item consumption
code path still runs when `stock_consumption` is set (quantity decrease +
  cost tracking) even with capitalization forced off; value increment is what
is suppressed. (Whether sites should allow stock consumption on fully
depreciated repairs is a policy choice; code does not forbid it.)

### Discriminating counterexample / proposed check (not executed)

Counterexample: open Asset Repair for a Fully Depreciated asset, set
`capitalize_repair_cost=1` and `increase_in_asset_life=12` via API (bypassing
read-only JS), submit. Server `validate_asset()` resets both to 0; on submit
no capitalization GL entry is created, `total_asset_cost` is unchanged, and
no new depreciation schedule is generated — while the same payload on a
Submitted (not fully depreciated) asset capitalizes normally. Attempting the
same on a Sold/Scrapped asset throws `cannot be repaired` in both versions.
Proposed check (needs an ERPNext v15.117.0 and v16.28.0 staging site; no
runtime here): (1) create fully depreciated asset (or depreciate to zero),
assert `get_status()=='Fully Depreciated'`; (2) create repair via form —
assert `capitalize_repair_cost` read-only; (3) create via API with
capitalize=1/life=12 — assert stored 0/0 after validate; (4) submit with
repair_cost>0 — assert asset value/schedule unchanged and expense (not
capital) postings; (5) assert Sold/Scrapped throws; (6) assert Repair/Asset
Repair button visible on Fully Depreciated Asset form in both versions.

### Uncertainty

- v16 `validate_purchase_invoices` (multi-invoice, unallocated-cost guards)
  vs v15 single-invoice validation differ in surrounding code; the
  fully-depreciated zeroing is identical, but invoice-edge behavior should be
  tested per version.
- `Out of Order` interplay: derived-status check is robust, but sites
  scripting on stored `status` (like the JS does) can see transient values;
  rely on `get_status()` server-side.
- F jurisdiction/accounting treatment (expense vs capital policy) is outside
  this code verification; the code only enforces the no-uplift mechanic.

## Executed vs proposed work

- Executed: independent primary-source reads (docs pages as Markdown + GitHub
  raw code at pinned tags / master snapshots + release/PR/issue API records),
  excerpt retention in `sources/`, this report, `source-map.json`,
  `sources/index.md`. No code executed, no staging instance, no witness run.
- Proposed (each with positive control where noted): NocoDB Community-vs-
  licensed matrix check (§Q1); Snipe-IT checkout/checkin-file negative test
  with audit positive control (§Q2); ERPNext fully-depreciated zeroing test
  across both tags with non-depreciated positive control (§Q3).
- No arbitrary output cap applied; scope preserved per assignment.

## Source IDs (immutable; see source-map.json for exact locators)

S01 roles/permissions · S02 table permissions · S03 field permissions · S04
record-level security · S05 teams · S06 workspace audit · S07 auth/SSO · S08
API tokens · S09 AssetCheckoutRequest · S10 api routes · S11
AssetsController checkout/checkin/audit · S12 UploadedFilesController · S13
Loggable.logUpload · S14 Asset.checkOut · S15 issue #19174 · S16
v15.117.0 release · S17 v16.28.0 release · S18 v15 asset_repair.py · S19 v16
asset_repair.py · S20 v15 asset_repair.js · S21 v16 asset_repair.js · S22 v15
asset.py get_status · S23 v15 asset.js button · S24 v16 asset.js button · S25
PR #55276 · S26 PR #57110. No silent rebind; mutable docs/code snapshots
carry access timestamps; pinned ERPNext tags are stable.
