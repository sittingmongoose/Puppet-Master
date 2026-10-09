# Navigable exact-byte source index (M07 treatment)

15 immutable captures, 761,029 bytes total. Verify: `sha256sum -c` against the hashes below,
or compare with `source-map.json` (same values). Upstream pages are mutable; these hashes pin
this capture. IDs never rebind.

| ID | File | Bytes | SHA-256 (prefix) | Navigate to |
|----|------|-------|------------------|-------------|
| S01 | S01-couchdb-conflicts.html | 79028 | 18adf909… | `grep -o "deterministically-chosen winner[^<]*"`; `_conflicts` sections; push/pull diagram |
| S02 | S02-powersync-sync-rules.md | 8599 | 15973485… | top deprecation notice; `bucket_definitions:` example; Parameters section |
| S03 | S03-pocketbase-api-rules.html | 48070 | 2449d93c… | `listRule…deleteRule`, `manageRule`; "locked"/empty/filter; 200/400/404/403 mapping |
| S04 | S04-pocketbase-intro.html | 24956 | d7c969a8… | `v0.40.5` download list (~12MB); `./pocketbase serve`; pre-v1 warning |
| S05 | S05-odk-central-users.html | 56821 | 8e4f003d… | `grep "two types of user"`; Web Users vs App Users sections |
| S06 | S06-odk-central-projects.html | 46278 | df0dcf2c… | `grep -i "form access"`; Form Access tab, per-form dropdown |
| S07 | S07-rxdb-couchdb.html | 70046 | 2e5be7b6… | `replicateCouchDB()` usage; Pros/Cons; `6 collections`; attachments exclusion |
| S08 | S08-odk-collect-offline-maps.html | 50755 | 2fb9ba0d… | `grep MBTiles`; offline layer file selection; distribution notes |
| S09 | S09-w3c-forms.html | 43236 | c82b6c34… | tutorial hub list: labels/grouping/instructions/validation/notifications/multi-page |
| S10 | S10-pb-changelog.md | 6970 | 2c058c70… | `grep "^## v"` → v0.40.0–v0.40.5; json/v2 warning; `_defensive=1`; #7799 |
| S11 | S11-garage-quickstart.html | 82359 | d9b4f5c4… | og:description "S3 object store…outside datacenters"; quick-start steps |
| S12 | S12-w3c-labels.html | 60135 | 3f7998ac… | `<label for="firstname">` etc.; `visuallyhidden` pattern |
| S13 | S13-odk-collect-intro.html | 36497 | 874bcf64… | `grep -i offline`; blank-form download; offline-maps link |
| S14 | S14-automerge.html | 75701 | 3dc4930f… | `<title>Automerge/Offline/Sync`; "sync engine…works offline, prevents conflicts" |
| S15 | S15-electric-intro.md | 71578 | 014fe345… | `<title>Electric Sync`; "Postgres, syncing…over HTTP"; Shapes (HTML body) |

Claim → source map (discovery.md): C1→S01; C2,C3→S03,S04; C4→S07; C5→S02; C6→S05,S06;
C7→S08,S13; C8→S09,S12; C9→S11 (+S04); E1→S02; E2→S10; E3→S07; candidates A→S05,S06,S08,S13;
B→S03,S04,S11; C→S02,S15,S07,S14.

Reviewer note (evidence-on-demand): expand beyond any excerpt above into the capture for
definitions, exceptions and callers. Never treat this index as the conclusion; the capture
bytes are the evidence. Cold re-fetch is charged and must record drift explicitly.
