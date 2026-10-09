# Sources index — ER11 B-08 treatment verifier (I08)

Independent primary sources only. IDs immutable (S01–S26); see
`../source-map.json` for exact URL / version / locator / access timestamp /
observed operation. All files below live in this `sources/` directory.
Access window: 2026-10-09T21:12–21:14Z.

## Q1 — NocoDB (P2)

- S01 roles & permissions → [nocodb-roles-and-permissions.md](nocodb-roles-and-permissions.md)
  — Org (Enterprise-only) → Workspace → Base; Owner/Creator/Editor/Commenter/
  Viewer/No Access/Inherit; project-over-workspace; effective-role resolution.
- S02 table permissions → [nocodb-table-permissions.md](nocodb-table-permissions.md)
  — Visibility (default Everyone) + Record Permissions (create/delete, default
  Editors & up); Availability: record perms Cloud Plus+/self-hosted
  Business+, visibility Cloud Business+/self-hosted Scale+Enterprise.
- S03 field permissions → [nocodb-field-permissions.md](nocodb-field-permissions.md)
  — Edit-only per column (default Editors & up); Availability: Cloud Plus+/
  self-hosted Business+.
- S04 record-level security → [nocodb-record-level-security.md](nocodb-record-level-security.md)
  — Filter-based scoped policies + optional Default (Show/Deny/Condition);
  Availability: Cloud Scale+/self-hosted Scale+.
- S05 teams → [nocodb-teams.md](nocodb-teams.md) — Workspace vs Org teams,
  4-level nesting; Availability: workspace Cloud Business+/self-hosted
  Scale+, org Cloud Enterprise/self-hosted Scale+.
- S06 workspace audit → [nocodb-workspace-audit.md](nocodb-workspace-audit.md)
  — Owners-only log (user/time/project/event/IP + JSON); Availability: Cloud
  Scale+/self-hosted Scale+.
- S07 auth & SSO → [nocodb-authentication-sso.md](nocodb-authentication-sso.md)
  — Google OAuth, SAML, OIDC, SCIM (Enterprise-only); Business workspace /
  Enterprise org config; Cloud domain verification, on-premise skips.
- S08 API tokens → [nocodb-api-tokens.md](nocodb-api-tokens.md) — Fine-grained
  vs legacy; granular scope/expiry on Cloud all plans + licensed self-hosted
  Business+; Community = all-resources + never expire.

## Q2 — Snipe-IT (P1)

- S09 checkout validation → [snipe-AssetCheckoutRequest.php](snipe-AssetCheckoutRequest.php)
  — XOR target, checkout_to_type, deployable status, dates, conditional note.
- S10 routes (excerpt) → [snipe-api-routes-excerpt.php](snipe-api-routes-excerpt.php)
  — hardware checkout/checkin (+bytag) and `{object_type}/{id}/files` API.
- S11 checkout/checkin/audit (excerpt) → [snipe-AssetsController-excerpt.php](snipe-AssetsController-excerpt.php)
  — Text-only checkout/checkin; audit alone takes `file.0`.
- S12 file upload (excerpt) → [snipe-UploadedFilesController-excerpt.php](snipe-UploadedFilesController-excerpt.php)
  — `POST files`: multipart `file[]` + `notes` → `logUpload` per file.
- S13 upload linkage (excerpt) → [snipe-Loggable-logUpload-excerpt.php](snipe-Loggable-logUpload-excerpt.php)
  — New `uploaded` Actionlog on asset; no checkout/checkin linkage.
- S14 checkout model (excerpt) → [snipe-Asset-checkOut-excerpt.php](snipe-Asset-checkOut-excerpt.php)
  — `Asset::checkOut` effects + `CheckoutableCheckedOut` event.
- S15 issue #19174 → [snipe-issue-19174-body.md](snipe-issue-19174-body.md)
  (+ [snipe-issue-19174.json](snipe-issue-19174.json)) — Open request confirming
  text-only checkout/checkin and global (not per-event) uploads.

Release anchor: Snipe-IT v8.8.0 (published 2026-09-30T19:14:30Z); code excerpts
are master snapshots at access time (mutable drift noted in source-map).

## Q3 — ERPNext (P1)

- S16 v15.117.0 release → [erpnext-v15.117.0-release-excerpt.md](erpnext-v15.117.0-release-excerpt.md)
- S17 v16.28.0 release → [erpnext-v16.28.0-release-excerpt.md](erpnext-v16.28.0-release-excerpt.md)
  — Both: fully-depreciated repairs allowed + button; capitalize locked; no
  value/life addition.
- S18 v15 repair logic → [erpnext-v15.117.0-asset_repair.py](erpnext-v15.117.0-asset_repair.py)
- S19 v16 repair logic → [erpnext-v16.28.0-asset_repair.py](erpnext-v16.28.0-asset_repair.py)
  — `validate_asset()` zeroes capitalize + life for Fully Depreciated.
- S20 v15 repair form → [erpnext-v15.117.0-asset_repair.js](erpnext-v15.117.0-asset_repair.js)
- S21 v16 repair form → [erpnext-v16.28.0-asset_repair.js](erpnext-v16.28.0-asset_repair.js)
  — Read-only guard on `capitalize_repair_cost`.
- S22 derived status (observed, not retained) — `asset.py get_status()` at tag
  v15.117.0; robust to `Out of Order` override.
- S23 v15 Asset button (excerpt) → [erpnext-v15.117.0-asset.js-excerpt.js](erpnext-v15.117.0-asset.js-excerpt.js)
- S24 v16 Asset button (excerpt) → [erpnext-v16.28.0-asset.js-excerpt.js](erpnext-v16.28.0-asset.js-excerpt.js)
- S25 original PR → [erpnext-PR-55276-body.md](erpnext-PR-55276-body.md)
  (+ [erpnext-PR-55276.json](erpnext-PR-55276.json))
- S26 v15 backport → [erpnext-PR-57110.json](erpnext-PR-57110.json)

Tags v15.117.0 and v16.28.0 (both published 2026-07-15) are stable/pinned.

## How to navigate

Start at [../verification.md](../verification.md) (answers + uncertainty +
proposed checks), confirm each claim's `[Snn]` locator in
[../source-map.json](../source-map.json), then open the retained file above.
