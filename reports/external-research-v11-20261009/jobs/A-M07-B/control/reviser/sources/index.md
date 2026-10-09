# Sources index — A-M07-B control/reviser (navigable)

Evidence root: `sources/` (this directory). Map: `../source-map.json`.
This revision fetched no new URLs; all material claims ground in the
complete own-arm captured evidence below, cited by immutable IDs under
their own maps (never remapped, never rebound).

## Own files (this stage)

| File | Content |
|------|---------|
| `verification-log.md` | Independent re-read record: every predecessor file and excerpt checked, per-criticism grounding notes |

## Research captured evidence (S01–S15)

Root: `../../research/sources/` — map: `../../research/source-map.json`
(access window 2026-10-09T19:31–19:34Z).

| ID | File | Source |
|----|------|--------|
| S01 | `S01-getodk-home.md` | ODK home — offline field-stack loop, form features, export connections |
| S02 | `S02-odk-central-install.md` | ODK Central install/manage nav (users/projects/forms/submissions/entities, encryption, audit, backup, upgrade) |
| S03 | `S03-odk-entities-intro.md` | ODK Entities longitudinal records |
| S04 | `S04-odk-offline-maps.md` | ODK offline maps + Collect ops (QR/adb provisioning) |
| S05 | `S05-powersync-overview.md` | PowerSync overview + SDK/DB matrix (Kotlin SDK, sync rules/streams) |
| S06 | `S06-powersync-update-conflicts.md` | PowerSync PUT/PATCH/DELETE, idempotency, simplest-backend LWW, deletes-win |
| S07 | `S07-powersync-custom-conflicts.md` | PowerSync CrudEntry + custom policies (dead-letter pattern; truncated capture) |
| S08 | `S08-powersync-attachments.md` | PowerSync attachments deprecation + metadata/provider pattern (E1) |
| S09 | `S09-pocketbase-intro.md` | PocketBase v0.40.5 page chrome + pre-1.0 warning |
| S10 | `S10-pocketbase-files.md` | PocketBase file defaults (~5MB, ~10-char suffix; S3 setting secondhand) |
| S11 | `S11-pocketbase-production.md` | PocketBase single-binary TLS/systemd runbook |
| S12 | `S12-pouchdb-conflicts.md` | PouchDB 409/upsert contract (v9.0.0 site chrome) |
| S13 | `S13-couchdb-replication.md` | CouchDB push/pull, deterministic winner, hidden losers |
| S14 | `S14-w3c-forms.md` | W3C accessible-forms tutorial index (7-subpage scope) |
| S15 | `S15-pocketbase-changelog.md` | PocketBase changelog process evidence (rows unquoted, drift explicit) |

## Critic re-verification evidence (C01–C08)

Root: `../../critic/sources/` — map: `../../critic/source-map.json`
(access window 2026-10-09T19:41–19:42Z). 5/8 byte-size matches, 1× 12-byte
drift (mutable docs), 1× transfer-encoding difference; all verbatim claims
confirmed accurate.

| ID | File | Source |
|----|------|--------|
| C01 | `C01-powersync-update-conflicts.md` | PowerSync op model, idempotency, simplest-backend LWW, deletes-win, escape hatch |
| C02 | `C02-pocketbase-files.md` | PocketBase ~5MB default + ~10-char suffix (S3 not re-verified) |
| C03 | `C03-pocketbase-intro.md` | PocketBase pre-1.0 production warning at full strength |
| C04 | `C04-pouchdb-conflicts.md` | PouchDB 409 contract + upsert pattern |
| C05 | `C05-couchdb-conflicts.md` | CouchDB arbitrary-but-deterministic (non-LWW) winner, hidden losers |
| C06 | `C06-w3c-forms.md` | W3C forms index + index-only limit |
| C07 | `C07-odk-entities-central.md` | ODK nav-level existence + ODK Cloud managed banner + behavior gaps |
| C08 | `C08-powersync-attachments.md` | Attachments deprecation + metadata/provider pattern, PowerSync-only scope |

Unobserved in all stages (honest gaps, see final.md section 7): Android
platform docs; W3C subpage rule content; ODK review/permission/backup/sizing
behavior; managed-hosting terms and export parity; PocketBase S3 setting
page; MinIO/Garage server docs; KoboToolbox/QField/Electric/k3s specifics;
coordinator throughput/taxonomy. Usage/billing: null everywhere. No witness
executed (no qualified sandbox); checks proposed honestly in final.md.
