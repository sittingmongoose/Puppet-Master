# Navigable exact-byte source index (M07 treatment/critic)

15 immutable captures re-verified byte-identical from `../research/sources/`
(761,029 bytes total). Verify: `cd` here and `sha256sum -c` against the hashes
below, or compare with `../critic/source-map.json` (same values) and
`../research/source-map.json` (same bytes+SHA-256). Upstream pages are mutable;
these hashes pin these bytes. IDs S01–S15 never rebind. No cold re-fetch in the
critic stage; no drift observed.

| ID | File | Bytes | SHA-256 (prefix) | Navigate to (critic on-demand locators) |
|----|------|-------|------------------|------------------------------------------|
| S01 | S01-couchdb-conflicts.html | 79028 | 18adf909… | `deterministically-chosen winner`; `_conflicts` sections; winner-only views feed — arbiter for P2/M1/C1 |
| S02 | S02-powersync-sync-rules.md | 8599 | 15973485… | top Legacy/deprecation notice; `bucket_definitions:` example; Parameters; `powersync migrate sync-rules`; no-scope-change invariant — arbiter for C5/E1/M2/m5; note: no conflict/offline-write/Sync-Streams semantics in scope |
| S03 | S03-pocketbase-api-rules.html | 48070 | 2449d93c… | `listRule…deleteRule`, `manageRule`; locked/empty/filter; `200 empty items` / `400` / `404` / `403` mapping — arbiter for P5/C2/V4 |
| S04 | S04-pocketbase-intro.html | 24956 | d7c969a8… | `v0.40.5` downloads (~11–12MB zip); `./pocketbase serve`; pre-v1 `NOT recommended` warning — arbiter for C3/P1 |
| S05 | S05-odk-central-users.html | 56821 | 8e4f003d… | `two types of user accounts`; Web Users vs App Users — arbiter for C6/P5 |
| S06 | S06-odk-central-projects.html | 46278 | df0dcf2c… | `Form Access` tab; per-form per-App-User dropdown — arbiter for C6/P5; note: no install/ops/Entities scope |
| S07 | S07-rxdb-couchdb.html | 70046 | 2e5be7b6… | `replicateCouchDB()`; checkpoint-not-official-protocol rationale; Pros/Cons; `6 collections in parallel`; attachments exclusion; newest-only + during-replication conflicts — arbiter for P2/P3/C4/E3 |
| S08 | S08-odk-collect-offline-maps.html | 50755 | 2fb9ba0d… | `MBTiles format`; offline-layer file selection; per-project import/send distribution — arbiter for C7 |
| S09 | S09-w3c-forms.html | 43236 | c82b6c34… | hub list: labels/grouping/instructions/validation/`Notifications`/`Multi-page Forms` — arbiter for C8/P4/V6 |
| S10 | S10-pb-changelog.md | 6970 | 2c058c70… | `^## v` v0.40.0–v0.40.5; `encoding/json/v2` + do-not-push-blindly warning; `_defensive=1`; #7799 backup-lock fix — arbiter for E2/C3/V8 |
| S11 | S11-garage-quickstart.html | 82359 | d9b4f5c4… | `S3 object store so reliable you can run it outside datacenters`; quick-start — arbiter for C9-positioning only (M6: no hash/EXIF/queue scope) |
| S12 | S12-w3c-labels.html | 60135 | 3f7998ac… | `<label for="firstname">`; `visuallyhidden` pattern — arbiter for C8/P4/V6 |
| S13 | S13-odk-collect-intro.html | 36497 | 874bcf64… | blank-form download; offline capture; offline-maps link — arbiter for C7/P1 |
| S14 | S14-automerge.html | 75701 | 3dc4930f… | `sync engine for multiplayer apps that works offline, prevents conflicts`; offline queuing prose — homepage positioning only (M1/M7: no merge/server/auth/photo/ops scope) |
| S15 | S15-electric-intro.md | 71578 | 014fe345… | `Postgres, syncing data into local clients over HTTP`; Shapes primitive — intro only (M1/M7: no conflict/offline-write scope; body is HTML despite `.md` suffix) |

Claim → source map (critique.md): P1→S04,S07,S13 (+m1 gap); P2→S01,S07
(M1: not S02/S14/S15); P3→S07,S11 (M6 gaps); P4→S09,S12,S01; P5→S02,S03,S05,S06;
P6→S10,S02,S07; C1→S01; C2,C3→S03,S04; C4→S07; C5→S02 (M2 gap); C6→S05,S06;
C7→S08,S13; C8→S09,S12; C9→S11 (+M6 gaps); E1→S02; E2→S10; E3→S07.

Reviewer note (evidence-on-demand): expand beyond any excerpt above into the
capture bytes for definitions, exceptions, and callers. Never treat this index
as the conclusion; the capture bytes are the evidence.
