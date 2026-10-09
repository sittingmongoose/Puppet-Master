# Retained evidence index — critic stage (A-M08-A, control, M08)

Bounded permitted evidence retained during independent verification. Each file is a verbatim snapshot of a fetched primary source; hashes below are authoritative for this stage. Source IDs refer to `../source-map.json` (critic stage) — research-stage IDs S1–S10 live in `../research/source-map.json` (not duplicated here; no rebind).

| File | Source ID | What it evidences | sha256 |
|---|---|---|---|
| `verify-timefold-provider-v1.6.0.java` | C3 | v1.6.0 provider: balance constraint ABSENT, HardSoftScore, 111 lines (`wc -l`) | `0ea6b00515ffbc3d43a6048ea1a9f5b02e7467a065cc4b7c86ff6b07f897a33e` |
| `verify-timefold-provider-v2.0.0.java` | C4 | v2.0.0 restructured path: balance constraint PRESENT, byte-identical to stable | `c59fa688ce725ed41976749c2e9d3935c239da315bebe2b39280624e632226a4` |
| `verify-timefold-provider-v2.2.0.java` | C5 | v2.2.0 restructured path: same content persists through v2.x | `c59fa688ce725ed41976749c2e9d3935c239da315bebe2b39280624e632226a4` |
| `verify-volunteerhub-home-20261009T2135Z.html` | C11 | Live home page state at 21:36Z; bot-UA 404 vs browser-UA 200 observation; 'Advanced Permissions'/'waitlist' phrases | `b6c0710ecdc1e5ea8d31e98c9855d0b7846ca309292dd86f7834ffd7bfbbe892` |
| `verify-volunteerhub-scheduling-20261009T2135Z.html` | C12 | Live scheduling page state; all research S3 quoted phrases greppable | `8977c47d4f9873d6508119cf731d5beb733fed9ecbc25c50207e65f977063185` |

Not retained (fetch-only, recorded in source-map.json): GitHub API responses (C6–C10, JSON metadata, reproducible by re-query; commit SHAs quoted in locators), OR-Tools page (C13), CiviVolunteer docs pages (C14–C15), negative-result lookups (C16). Research-stage retained files under `../research/sources/` were re-verified byte-identical and are cited as C1/C2 without duplication.

Verification method per file: `curl -s -o <file> -w '%{http_code}'` (browser User-Agent for the two HTML snapshots), then `sha256sum`. Re-derive any verdict in `../critique.md` / `../verification.md` by re-hashing these files.
