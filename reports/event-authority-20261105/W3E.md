# W3E — Server, Remote Access, Backup and restore; phase 1

Branch: `plans/ea-w3-server-remote-backup-20261105`. Base: `f9c5de6561dff0a53a48e530f2a5c6804a7e941d`. Final code head: `d6208c794e12dc54ed70893ac479a66c5444025b`. Reviewed phase-1 head: `fc141476bf5756ac06b77ac64690bb663bd17de0`.

**Outcome:** 20 prepared, 0 merged, 0 excluded, 0 stopped. All 20 retention assignments are `PENDING_RETENTION_DECISION`; none is admission-ready. Each family grades 9 PASS / 2 PARTIAL / 1 ABSENT: membership ABSENT; retention and criterion 12 PARTIAL. Native execution and phase-2 event oracles are NOT_RUN.

## Authority and premise checks

- **9.a A / DL-450:** `ANSWERS_E-CARDS-2_20261105.md` records Jared’s “i approve all of it”; the presented deck limits definition-writing to existing behavior, documented searches, reuse first and labelled new bindings. All 20 exact names occur in its appendix. This draft grants no feature, lifetime, deletion policy, admission or runtime permission.
- **Current owners:** Server §3.3, Remote Access §3.3, Backup §3.3 still list every exact name as non-emitting. The exact-name search found one live candidate citation for each, and no admitted alias or prior full contract. The frozen recount recommendations were not treated as current proof.
- **Retention premise does not transfer:** Card 1 G01 covers file/folder actions, G05 GitHub sign-in, G26 formatter/LSP/model signals. Those named populations exclude W3E. Deck 2 1.a concerns 13 named surviving routine signals; 1.b..1.g authorizes six exact no-project populations, also excluding W3E. The current `plans/ea-retention-cards2-20261105` Storage text was inspected: it explicitly forbids widening those buckets. Case L-3 supplies class minima and protections but does not classify each W3E event’s audit-versus-diagnostic role or authorize an app bucket. No G05 allowance was borrowed and no BackupRun was represented as a runtime run for Run year.
- **Current supersessions reused:** RAS-015 controls Server versus native-Client connector ownership and automatic private ingress; no old Serve or host-install mechanics were revived. SRV-004 retains exact candidate/generation and answered-pairing behavior. RAS-005 retains generate-only Caddy/NGINX/Traefik, existing-only NPM and person-held certificates. RAS-014 REMOTE-CODE-1 remains the accepted pre-build check; no link/code grammar was invented. BRS-005/006/031/033 retain v2 phases, independent destination/verification axes, background capture and paused restored work.

## Per-row outcomes and new bindings

| Exact family | Outcome | Own unit | Contracts | Storage | Retention |
|---|---|---|---|---|---|
| `backup.destination_changed` | prepared | `BRS-1400` | `CV-1400` | `SP-1400` | pending |
| `backup.state_changed` | prepared | `BRS-1401` | `CV-1401` | `SP-1401` | pending |
| `remote_access.private_endpoint_state_changed` | prepared | `RAS-1402` | `CV-1402` | `SP-1402` | pending |
| `remote_access.proxy_state_changed` | prepared | `RAS-1403` | `CV-1403` | `SP-1403` | pending |
| `remote_access.public_security_violation_detected` | prepared | `RAS-1404` | `CV-1404` | `SP-1404` | pending |
| `remote_access.remote_link_state_changed` | prepared | `RAS-1405` | `CV-1405` | `SP-1405` | pending |
| `remote_access.route_migration_state_changed` | prepared | `RAS-1406` | `CV-1406` | `SP-1406` | pending |
| `remote_access.route_preference_changed` | prepared | `RAS-1407` | `CV-1407` | `SP-1407` | pending |
| `remote_access.route_state_changed` | prepared | `RAS-1408` | `CV-1408` | `SP-1408` | pending |
| `remote_access.route_test_completed` | prepared | `RAS-1409` | `CV-1409` | `SP-1409` | pending |
| `restore.state_changed` | prepared | `BRS-1410` | `CV-1410` | `SP-1410` | pending |
| `server.catalog_changed` | prepared | `SRV-1411` | `CV-1411` | `SP-1411` | pending |
| `server.client_pairing_state_changed` | prepared | `SRV-1412` | `CV-1412` | `SP-1412` | pending |
| `server.client_revoked` | prepared | `SRV-1413` | `CV-1413` | `SP-1413` | pending |
| `server.client_trust_changed` | prepared | `SRV-1414` | `CV-1414` | `SP-1414` | pending |
| `server.connection_state_changed` | prepared | `SRV-1415` | `CV-1415` | `SP-1415` | pending |
| `server.discovery_expired` | prepared | `SRV-1416` | `CV-1416` | `SP-1416` | pending |
| `server.discovery_observed` | prepared | `SRV-1417` | `CV-1417` | `SP-1417` | pending |
| `server.endpoint_changed` | prepared | `SRV-1418` | `CV-1418` | `SP-1418` | pending |
| `server.identity_mismatch_detected` | prepared | `SRV-1419` | `CV-1419` | `SP-1419` | pending |

All payloads are separate closed files under `Plans/event_payloads/w3e/`. Each has its own closed original owner-fact manifest with fixed named evidence roles; the producer cannot supply its own required-slot list. Original before/after records reuse that family’s existing owner schema. Each event owns three newly prepared Storage values: canonical original source/pending/terminal custody, derived history rows and a filtered checkpoint. All 60 receive named physical file/group/16 KiB profiles.

| Family | Newly authored sole source method | Reused owner units |
|---|---|---|
| `backup.destination_changed` | `BackupCoordinator.destination_commit@1.0.0` | `BRS-004`, `BRS-018`, `BRS-032` |
| `backup.state_changed` | `BackupCoordinator.backup_phase_commit@1.0.0` | `BRS-005`, `BRS-007`, `BRS-017`, `BRS-031` |
| `remote_access.private_endpoint_state_changed` | `RemoteAccessRouteService.private_endpoint_commit@1.0.0` | `RAS-002`, `RAS-015` |
| `remote_access.proxy_state_changed` | `RemoteAccessRouteService.proxy_state_commit@1.0.0` | `RAS-005`, `RAS-007` |
| `remote_access.public_security_violation_detected` | `PublicIngressGuard.record_violation@1.0.0` | `RAS-004`, `RAS-007` |
| `remote_access.remote_link_state_changed` | `RemoteAccessRouteService.remote_link_state_commit@1.0.0` | `RAS-006`, `RAS-014` |
| `remote_access.route_migration_state_changed` | `RemoteAccessRouteService.migration_phase_commit@1.0.0` | `RAS-002` |
| `remote_access.route_preference_changed` | `RemoteAccessRouteService.preference_commit@1.0.0` | `RAS-002` |
| `remote_access.route_state_changed` | `RemoteAccessRouteService.route_state_commit@1.0.0` | `RAS-002`, `RAS-004`, `RAS-005`, `RAS-006`, `RAS-015` |
| `remote_access.route_test_completed` | `RemoteAccessRouteService.test_terminal_commit@1.0.0` | `RAS-002`, `RAS-005`, `RAS-007` |
| `restore.state_changed` | `BackupCoordinator.restore_phase_commit@1.0.0` | `BRS-006`, `BRS-007`, `BRS-019`, `BRS-023`, `BRS-033` |
| `server.catalog_changed` | `ServerCatalogService.catalog_commit@1.0.0` | `SRV-002`, `SRV-007`, `SRV-009` |
| `server.client_pairing_state_changed` | `ClientTrustRegistry.pairing_phase_commit@1.0.0` | `SRV-004`, `SRV-007` |
| `server.client_revoked` | `ClientTrustRegistry.revoke_commit@1.0.0` | `SRV-004`, `SRV-011` |
| `server.client_trust_changed` | `ClientTrustRegistry.trust_commit@1.0.0` | `SRV-004`, `SRV-011`, `SRV-016` |
| `server.connection_state_changed` | `ServerConnectionService.connection_state_commit@1.0.0` | `SRV-005`, `SRV-007` |
| `server.discovery_expired` | `ServerDiscoveryService.expiry_commit@1.0.0` | `SRV-003`, `SRV-007` |
| `server.discovery_observed` | `ServerDiscoveryService.observation_commit@1.0.0` | `SRV-002`, `SRV-003` |
| `server.endpoint_changed` | `ServerCatalogService.endpoint_commit@1.0.0` | `SRV-002`, `SRV-007` |
| `server.identity_mismatch_detected` | `ServerIdentityVerifier.mismatch_commit@1.0.0` | `SRV-002`, `SRV-004`, `SRV-007` |

Every method, payload, source manifest, operation/event identity, consumer/checkpoint and withdrawal binding is expressly labelled **newly authored owner contract**. They are methods of existing owners and existing history/status consumers, not new commands, features, UI surfaces, sibling contracts or live authority. CV-317/EventRecord, CV-339/SP-286 strict full-value first receipt, SP-236 bytes, SP-278 complete-source read tokens and SP-337 body references are adopted separately in each exact family. Application keys follow CV-366 verbatim. String-only event/operation identity preimages contain no locally encoded number or timestamp.

## Search evidence

`W3E-search.json` records the exact per-family scope, candidate hit and negative evidence at the base SHA. It searched **894** live Plans md/json/jsonl files, including nested payloads/schemas/fixtures, excluding generated/source-lineage pipeline directories. Every row has one current candidate hit; there is no registered family, existing event payload, exact producer/checkpoint, or family-specific custody/withdrawal contract to reuse. Existing domain schemas, commands, methods/roles, phase/state vocabularies and shared storage contracts were then inspected per family. No exclusion, merge or application record is asserted.

ID allocation search: `id-allocation-search.json` in the evidence directory checked all **528** fetched origin refs, **206** unique blobs of the six relevant prefix-owning documents; no assigned ID was occupied. It includes current origin/main. No Decision Log prefix was used.

## Oracle plan and check-11 boundary

`Plans/event_authority_w3e_oracle_plan.json` contains 20 separate plans, **876** runtime/owner guard plans and **7480** exact new-schema predicate sites. Each family lists its original positive scenario, per-guard single-defect negative, zero-new-effect expectation, field-specific domain predicates, schema boundary case recipes and fixed source evidence roles. External owner resource closure also requires full site inventory in phase 2.

Phase 1 writes **no event-oracle code**, independent number/timestamp parser or proof script. Phase 2 must rebase onto the lead’s reviewed NUMRULE + GUARDTOOL foundation, implement cases with those helpers, resolve every schema ref eagerly and prove each actual enforcement site. A duplicate set means the same field and predicate at multiple sites; unrelated predicates sharing a refusal/keyword remain separate. Negative copies/hashes/keys/post-state are kept coherent except the one target join. A logically implied schema predicate is not falsely claimed isolated: its actual sites and admissible one-defect fixture are settled by the phase-2 inventory. No check-11 proof or criterion-12 PASS is claimed now.

The plan covers first append, original retry, lost acknowledgement, every source/pending/append/receipt/terminal crash boundary, retained originals after live state or recipe changes, visibility/withdrawal, complete/empty/zero-match/degraded coverage, exact Storage-identity token joins, CAS/rebuild, >16 KiB full-value routes and coherent backup/restore. Failure outcomes include a substituted success negative.

## Standing-check and Astra defect inventory

| Requirement | Phase-1 treatment |
|---|---|
| Contradictory identities/digests | Owner-authenticated complete source snapshots; every duplicated join checked; recompute from actual held bytes. Domain negatives select one join or predicate. |
| Storage-assigned metadata | CV-317 semantic exclusions kept exact; receipt/sequence/time must resolve Storage’s own record. |
| Historical/current separation | Current replay-only append refused. Genuine retained original uses authenticated original recipe and no current writer gate; current access/deletion/withdrawal still apply. |
| Consistent types/representations | Exact type checks and full-string guards planned; no trimming, coercion or default current recipe. |
| Eager references | Phase-1 shape check resolves all 115 reachable targets including unvisited source/checkpoint branches. Phase 2 expands actual runtime assertion inventory. |
| Every stored part <=16 KiB | All 60 profiles bound. Original source/result/semantic input/payload use SP-337 refs; large checkpoint has a complete body_ref branch. Ref-only oversize refuses. |
| Custody on every path | Each owner adopts source/pending/first-full-value-result custody before retry/recovery/publication. Fixed evidence roles prevent caller-defined slot sets. |
| Single-defect negatives | 876 semantic plans plus field/predicate schema inventory; dependent fields repaired. Actual guard-removal proof awaits shared tool. |
| Honest grades | Membership ABSENT; retention and oracle PARTIAL. Static shape validation is not event or native execution. |
| Number domains / 10a | No new 2^53 caps or number code. Existing schema and SP-236/CV-317/CV-366/CV-339 domains remain separate; shared qualification and authenticated old recipes planned. |
| Wrong types | Planned string-bool/number, null, arrays, nested objects and int/float distinctions. |
| Timestamp formats | Existing owner profiles, CV-253 persisted UTC Z versus general RFC3339; malformed date/zone/LF and owner-allowed leap/fraction/old-recipe cases planned via shared helper. |

These rows describe normative safeguards and **planned** mutations. Only schema shape/reference/lexical smoke validation has executed; phase 1 does not claim every behavioral defect has been ruled out.

## Open retention questions

No row is stopped for a non-retention product choice. The one permitted open cell remains retention. Exact questions:

- **`backup.destination_changed`:** For backup.destination_changed, which history class, expiry anchor, counting scope/cap/overflow and explicit deletion rule apply to its Server-owned application records with no Project? The G01 analogy is not an exact-name grant; existing original receipts and source records keep their own policies.
- **`backup.state_changed`:** For backup.state_changed, which history class, expiry anchor, counting scope/cap/overflow and explicit deletion rule apply to its Project and Full Server/application records? The G05 analogy is not an exact-name grant; existing original receipts and source records keep their own policies.
- **`remote_access.private_endpoint_state_changed`:** For remote_access.private_endpoint_state_changed, which history class, expiry anchor, counting scope/cap/overflow and explicit deletion rule apply to its Server-owned application records with no Project? The G26 analogy is not an exact-name grant; existing original receipts and source records keep their own policies.
- **`remote_access.proxy_state_changed`:** For remote_access.proxy_state_changed, which history class, expiry anchor, counting scope/cap/overflow and explicit deletion rule apply to its Server-owned application records with no Project? The G26 analogy is not an exact-name grant; existing original receipts and source records keep their own policies.
- **`remote_access.public_security_violation_detected`:** For remote_access.public_security_violation_detected, which history class, expiry anchor, counting scope/cap/overflow and explicit deletion rule apply to its Server-owned application records with no Project? The G05 analogy is not an exact-name grant; existing original receipts and source records keep their own policies.
- **`remote_access.remote_link_state_changed`:** For remote_access.remote_link_state_changed, which history class, expiry anchor, counting scope/cap/overflow and explicit deletion rule apply to its Server-owned application records with no Project? The G26 analogy is not an exact-name grant; existing original receipts and source records keep their own policies.
- **`remote_access.route_migration_state_changed`:** For remote_access.route_migration_state_changed, which history class, expiry anchor, counting scope/cap/overflow and explicit deletion rule apply to its Server-owned application records with no Project? The G26 analogy is not an exact-name grant; existing original receipts and source records keep their own policies.
- **`remote_access.route_preference_changed`:** For remote_access.route_preference_changed, which history class, expiry anchor, counting scope/cap/overflow and explicit deletion rule apply to its Server-owned application records with no Project? The G01 analogy is not an exact-name grant; existing original receipts and source records keep their own policies.
- **`remote_access.route_state_changed`:** For remote_access.route_state_changed, which history class, expiry anchor, counting scope/cap/overflow and explicit deletion rule apply to its Server-owned application records with no Project? The G26 analogy is not an exact-name grant; existing original receipts and source records keep their own policies.
- **`remote_access.route_test_completed`:** For remote_access.route_test_completed, which history class, expiry anchor, counting scope/cap/overflow and explicit deletion rule apply to its Server-owned application records with no Project? The G26 analogy is not an exact-name grant; existing original receipts and source records keep their own policies.
- **`restore.state_changed`:** For restore.state_changed, which history class, expiry anchor, counting scope/cap/overflow and explicit deletion rule apply to its Project and Full Server/application records? The G05 analogy is not an exact-name grant; existing original receipts and source records keep their own policies.
- **`server.catalog_changed`:** For server.catalog_changed, which history class, expiry anchor, counting scope/cap/overflow and explicit deletion rule apply to its Server-owned application records with no Project? The G01 analogy is not an exact-name grant; existing original receipts and source records keep their own policies.
- **`server.client_pairing_state_changed`:** For server.client_pairing_state_changed, which history class, expiry anchor, counting scope/cap/overflow and explicit deletion rule apply to its Server-owned application records with no Project? The G05 analogy is not an exact-name grant; existing original receipts and source records keep their own policies.
- **`server.client_revoked`:** For server.client_revoked, which history class, expiry anchor, counting scope/cap/overflow and explicit deletion rule apply to its Server-owned application records with no Project? The G05 analogy is not an exact-name grant; existing original receipts and source records keep their own policies.
- **`server.client_trust_changed`:** For server.client_trust_changed, which history class, expiry anchor, counting scope/cap/overflow and explicit deletion rule apply to its Server-owned application records with no Project? The G05 analogy is not an exact-name grant; existing original receipts and source records keep their own policies.
- **`server.connection_state_changed`:** For server.connection_state_changed, which history class, expiry anchor, counting scope/cap/overflow and explicit deletion rule apply to its Server-owned application records with no Project? The G26 analogy is not an exact-name grant; existing original receipts and source records keep their own policies.
- **`server.discovery_expired`:** For server.discovery_expired, which history class, expiry anchor, counting scope/cap/overflow and explicit deletion rule apply to its Server-owned application records with no Project? The G26 analogy is not an exact-name grant; existing original receipts and source records keep their own policies.
- **`server.discovery_observed`:** For server.discovery_observed, which history class, expiry anchor, counting scope/cap/overflow and explicit deletion rule apply to its Server-owned application records with no Project? The G26 analogy is not an exact-name grant; existing original receipts and source records keep their own policies.
- **`server.endpoint_changed`:** For server.endpoint_changed, which history class, expiry anchor, counting scope/cap/overflow and explicit deletion rule apply to its Server-owned application records with no Project? The G01 analogy is not an exact-name grant; existing original receipts and source records keep their own policies.
- **`server.identity_mismatch_detected`:** For server.identity_mismatch_detected, which history class, expiry anchor, counting scope/cap/overflow and explicit deletion rule apply to its Server-owned application records with no Project? The G05 analogy is not an exact-name grant; existing original receipts and source records keep their own policies.

## Owner investigations

W3E was assigned no outside-name or continuity investigation. Per-family owner verification found all twenty names still distinct candidates. No owner conflict requiring a new feature/behavior choice was found.

## Shared-file hunks and IDs

All existing owner text is preserved. The three semantic owners add new units at the end of their governing candidate subsection; shared Contracts, Storage and Automated Testing append new units without rewriting old units. Storage registry adds only new family and profile members. Ordinary diff alignment may match repeated JSON lines, but pre-existing rows/profiles are checked structurally unchanged.

| File | New unit/member ranges |
|---|---|
| `Plans/Server_System.md` | SRV-1411, SRV-1412, SRV-1413, SRV-1414, SRV-1415, SRV-1416, SRV-1417, SRV-1418, SRV-1419; declarations at lines 1058..2548 |
| `Plans/Remote_Access_System.md` | RAS-1402, RAS-1403, RAS-1404, RAS-1405, RAS-1406, RAS-1407, RAS-1408, RAS-1409; declarations at lines 676..1985 |
| `Plans/Backup_Restore_System.md` | BRS-1400, BRS-1401, BRS-1410; declarations at lines 813..1196 |
| `Plans/Contracts_V0.md` | CV-1400, CV-1401, CV-1402, CV-1403, CV-1404, CV-1405, CV-1406, CV-1407, CV-1408, CV-1409, CV-1410, CV-1411, CV-1412, CV-1413, CV-1414, CV-1415, CV-1416, CV-1417, CV-1418, CV-1419; declarations at lines 24477..25672 |
| `Plans/storage-plan.md` | SP-1400, SP-1401, SP-1402, SP-1403, SP-1404, SP-1405, SP-1406, SP-1407, SP-1408, SP-1409, SP-1410, SP-1411, SP-1412, SP-1413, SP-1414, SP-1415, SP-1416, SP-1417, SP-1418, SP-1419; declarations at lines 29485..31154 |
| `Plans/Automated_Testing_System.md` | ATS-1240, ATS-1241; declarations at lines 7245..7303 |
| `Plans/storage_value_registry.json` | 60 `w3e_*_{custody,history,checkpoint}` members plus matching `storage_profile.family_profiles` members; no existing row/profile change. |

IDs: **CV-1400..1419**, **SP-1400..1419**, **BRS-1400, BRS-1401, BRS-1410**, **RAS-1402..1409**, **SRV-1411..1419**, **ATS-1240..1241**. No ids outside the assigned blocks.

## Initial phase-1 checks and handoff

| Check | Exit | Result |
|---|---:|---|
| `shards-check` | 0 | PASS |
| `index-validate` | 0 | PASS |
| `storage-profile` | 1 | PRE_EXISTING_41_PROFILE_GAPS |
| `new-contracts` | 0 | PASS |
| `backup-verify-depth` | 0 | PASS |
| `server-command-gap` | 0 | PASS |
| `phase1-shape-check` | 0 | PASS |
| `index-generate` | 0 | PASS |
| `shards-generate` | 0 | PASS |
| `whitespace` | 0 | PASS |

Storage profile has exactly the same 41 missing-profile errors as base, verified in `storage-profile-baseline.json`; none names a new W3E row. No unrelated profile was repaired. Final shard/index generation and validation, eager schema reference validation, inherited contract suite, backup-depth, Server command-gap and whitespace checks passed. The contract suite paused under 6 GiB and resumed only at 7 GiB; checks ran sequentially. `W3E-checks.json` pins command, exit, top-level status and each external output SHA-256. No Event Authority oracle code executed.

Derived shards/index are regenerated with the SHA-256-matched 15-file currentness edition. Governance locks/evidence are not resealed. The branch is for integration by the lead; main is not pushed. W3E worktree removal follows the final push.

## Evidence path and fingerprints

- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/W3E/search-evidence.json`; SHA-256 `f3515ab946f54df5951dfda484aa04904bce6180a1fac496c4402508dd25fcb1`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/W3E/id-allocation-search.json`; SHA-256 `b3b74de0bfc11a217353048243b60ba7c6242577422757f475bb10032f9e12cf`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/W3E/currentness-copy-sha256.json`; SHA-256 `1fe8307e86348f10e15129c9ce4b6941fd7e4a1f3605abc1a499603f18e22df6`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/W3E/phase1-shape-check.json`; SHA-256 `793e0be365aef00f096a551cd407bd3d82d233aaee8c0d859bbcd63405bcdbac`.

Instruction/decision sources read: WAVE3.md; BRIEF-DRAFT.md; WAVE2.md; both answer records and presented decks; INTEGRATION-NOTES.md; rubric; repository .claude/CLAUDE.md; plan-ID/currentness memory notes; live owner/schema/envelope/Storage text. The raw search/diagnostic artifacts remain outside the repository.

`W3E-shared-hunks.json` records every shared-file hunk range at the code commit. `W3E-inputs.json` pins instruction/decision sources and the shape-check helper. Candidate retention classes and exact Case L-3 citations are recorded per family in `W3E-outcomes.json` and the owner units. Destination/endpoint create/update/remove cases explicitly preserve absent after-records and the last original fenced removal generation.

Evidence: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/W3E/checks-final.json`; SHA-256 `daeb2fb98732a65e865221d701edebe8a3aba514331d1e2de5f81e08fc8d600d`.

Evidence: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/W3E/storage-profile-baseline.json`; SHA-256 `601f32b39f808409f82fc422423583ca73512c05a1fb51d89808b70cb22d02e5`.

Evidence: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/W3E/check-phase1.py`; SHA-256 `4b47f56072227912f632a35921f04355d606d4d115a4679011d57a34d09bbf16`.


## Phase-1 review round 1: findings and responses

Reviewed head: `fc141476bf5756ac06b77ac64690bb663bd17de0`. Fix commit: `d6208c794e12dc54ed70893ac479a66c5444025b`. This round changes only F1/F2 schemas, their Storage mirrors, the affected oracle plans (including N1), the Storage registry’s regenerated shards, index generation timestamps and the edited registry’s expected hash in the existing PNC-019 staleness diagnostic, and this report/self-grade/check record. All twenty exact retention questions and `PENDING_RETENTION_DECISION` assignments remain unchanged. No IDs were minted; existing IDs remain those listed above.

- **F1 — fixed (`d6208c794e12dc54ed70893ac479a66c5444025b`).** Where: Backup payload `scope_partition` at lines 193, 353 and 482; Restore at lines 201, 361 and 490, plus the six exact Storage registry mirrors. Why: a 256-character limit refused the canonical 350-character partition of a valid 256-character Project ID. Fix: remove that independent character cap and validate exactly `app` or a nonempty canonical unpadded base64url `project~` partition, including final-bit and full-consumption checks. The existing exact original/envelope/key/value joins, source-ID domain and SP-340 entire-value 16 KiB limit remain required. The schema checks lexical partition shape; phase 2 verifies actual UTF-8/source encoding and semantic joins through the existing owner recipes. Static probes exercise complete custody/history/checkpoint values and registry mirrors with every owner-valid ASCII ID length 3..256, the explicit longest `project:` ID and application scope; raw IDs, empty/malformed/padded suffixes, nonzero final bits and trailing LF refuse at the selected field.
- **F2 — fixed (`d6208c794e12dc54ed70893ac479a66c5444025b`).** Where: `backup_state_changed.schema.json:107` / `:110`, `restore_state_changed.schema.json:118`, `remote_access_proxy_state_changed.schema.json:66`, `remote_access_route_migration_state_changed.schema.json:90`. Why: the five copied fields narrowed the original owner's 512-character domain to 256. Fix: reference each exact original owner-record field, preserving its lexical domain and nullability. Complete original-record and payload probes pass at 1, 256, 257, 300, 511 and 512 characters; 513 characters, empty/prohibited references and wrong types refuse at that field. Nullable fields keep null; `journal_ref` still refuses null. The resolved SP-337 body keeps the same logical schema and exact reference joins.
- **N1 — fixed with F1/F2.** Each Backup/Restore plan explicitly names Project and Full Server/application append, same-original retry/lost acknowledgement, retained history, custody recovery and checkpoint advance/restart. The longest encoded Project partition and original-reference boundary positives are explicit. Boundary negatives target one source-ID, partition grammar, whole stored-byte limit, reference domain or exact join at a time, with other copies/keys/digests coherent. Imported predicate sites are inventoried in phase 2 rather than retaining obsolete copied-field length sites.
- **S1 — retained for the shared format sweep.** Inherited stable-ID/fingerprint patterns (including `server_identity_mismatch_detected.properties.expected_fingerprint`), copied token hash patterns and generic-token UUID `format` still need the planned shared full-consumption/format enforcement. Existing `format_fullmatch` negatives remain. Schema-only PASS does not close this sweep item.
- **S2 — retained for phase 2.** Adopt the reviewed NUMRULE and shared `pm_guard_isolation.py` foundation under ATS-1241. No lane-local number/format code, caps, serializer or proof script was added. There is no W3E behavioral checker in phase 1, so no guard-removal proof or criterion-12 PASS is claimed. The whole-lane guard inventory and single-defect recipes remain planned.

### Re-grade at the fix commit

| Family | Reviewed grade (PASS/PARTIAL/CONFLICT/ABSENT) | After fix |
|---|---|---|
| `backup.state_changed` | 6 / 4 / 1 / 1 | 9 / 2 / 0 / 1 |
| `restore.state_changed` | 6 / 4 / 1 / 1 | 9 / 2 / 0 / 1 |
| `remote_access.proxy_state_changed` | 8 / 2 / 1 / 1 | 9 / 2 / 0 / 1 |
| `remote_access.route_migration_state_changed` | 8 / 2 / 1 / 1 | 9 / 2 / 0 / 1 |

C4 returns from CONFLICT to PASS for all four. C5/C10 return from PARTIAL to PASS for Backup/Restore. These grades cover the normative phase-1 contract and corrected schema domains only. The other sixteen families' grades are unchanged; all twenty retain C1 ABSENT and C7/C12 PARTIAL. Outcome remains 20 prepared, 0 merged, 0 excluded, 0 stopped; none is admission-ready. The original self-grade's eight disputed cells are corrected against the review here, with the review's before/after recorded explicitly.

### Round-1 verification

| Check | Exit | Result |
|---|---:|---|
| `schema-boundary-probes` | 0 | PASS |
| `phase1-shape-check` | 0 | PASS |
| `shards-generate` | 0 | PASS |
| `index-generate` | 0 | PASS |
| `shards-check` | 0 | PASS |
| `index-validate` | 0 | PASS |
| `storage-profile` | 1 | PRE_EXISTING_41_PROFILE_GAPS |
| `new-contracts` | 0 | PASS |
| `backup-verify-depth` | 0 | PASS |
| `server-command-gap` | 0 | PASS |
| `whitespace` | 0 | PASS |
| `scope-audit` | 0 | PASS |

Checks ran sequentially with the under-6 GiB pause / at-least-7 GiB resume gate and two-minute paused rechecks. The 40 inherited contract pairs passed 1,658 positive and 4,021 negative cases. Storage diagnostics are byte-for-byte structurally identical to the reviewed head: exactly 41 pre-existing missing profiles, none W3E. All six edited Storage value schemas match their payload definitions. The 696 changed shard files all belong to the edited Storage registry; index changes are limited to generated timestamps and that registry’s expected hash in a pre-existing PNC-019 staleness diagnostic. The index was regenerated and validated again after the final byte-preserving formatting cleanup. No governance reseal occurred.

- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/W3E/fix1/checks-fix1.json`; SHA-256 `d9aa6867ce128271990de689d37f1702e1d3d170d2e2729c0709e9ffdfcaa3f8`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/W3E/fix1/schema-boundary-probes.json`; SHA-256 `7ba982082cf3d2ec8ab7135607ae30d14f348a96548f73712f7a349ff4771c61`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/W3E/fix1/scope-audit.json`; SHA-256 `5afffce5ee6f00e07be1bf5a4b3d3986de11562c56a095e721821c685fbfc6c0`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/W3E/fix1/currentness-copy-sha256.json`; SHA-256 `b72623c6887c9cb3b53eb0da0baf1e1b8c0b5d46fe116d4f25746361bbe73b8b`.
