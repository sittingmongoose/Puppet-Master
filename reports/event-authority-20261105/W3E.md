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


## Wave 3 phase 2: findings and responses

Task: `lanes/W3-P2.md` (stream E, 2026-11-13), worker for lane W3E, with the lead's quality bar (guard rows are the checker's real predicates; at least ten checker mutations; owner keywords kept; every timestamp through `pm_event_datetime`; shared integer calls; retained reads proved by store snapshots; join rows and distinct-value copy witnesses). Start: `origin/plans/ea-w3-server-remote-backup-20261105` at `1a2cb7264d` (fetched first in `/home/sittingmongoose/src/PuppetMaster`), sparse local worktree `/home/sittingmongoose/pm-worktrees/w3e-p2` (`Plans scripts reports`). No rebase. Heavy commands ran one at a time as long-jobs under `systemd-run --user --scope -p MemoryMax=2G -p MemorySwapMax=0`, each started with at least 12 GiB available. No pm-mail, subagents or browsers; `main` was not pushed. Membership stays ABSENT and native execution NOT_RUN: everything below is synthetic oracle evidence.

### Gated foundations

| Merge | Commit | Parents | Result |
|---|---|---|---|
| Guard tool `004bdedd632d9463f3535190a6ed5772338cdce1` (`--no-ff`) | `09216c3e1c` | `1a2cb7264d`, `004bdedd63` | 11 files, no conflict, none edited. |
| NUMRULE head `58c2816ff33365384d4039553f5efdb5370930e6` (`--no-ff`) | `696f21ebed` | `09216c3e1c`, `58c2816ff3` | 163 conflicts, all in `Plans/_shards/{contracts_v0,storage-plan}` and `Plans/.plan_index`; resolved by `pm-shard-plans --generate`, `pm-plan-index generate` (the 15-file currentness edition copied in first, SHA-256 identical to the shared checkout's) and `pm-shard-plans --check` (pass, 3,161 shards). No other path conflicted; no NUMRULE file edited. |

Verify: `git diff 004bdedd63 HEAD -- scripts/pm_guard_isolation.py scripts/pm_guard_isolation_traps.py Plans/guard_isolation_traps.json scripts/guard-isolation/README.md scripts/pm_guard_isolation_dg6b_example.py` and `git diff 58c2816ff3 HEAD -- scripts/pm_event_numbers.py scripts/pm_event_numbers_corpus.py scripts/pm_event_datetime.py scripts/pm_event_datetime_inventory.py scripts/pm_event_datetime_exclusions.json Plans/event_number_recipe_corpus.json Plans/event_datetime_inventory.json` are both empty.

### What phase 2 built

Phase 1 delivered owner contracts and an oracle plan only. Phase 2 writes the lane's executable oracles, on W3F's file layout (one checker, a table generator, generated `pm_w3e_table_*.py` modules, a tool runner) but with predicates that are the checker's own comparisons, as W3I fix 2 established (W3F's rows only read a precomputed boolean).

| Part | Path | What it is |
|---|---|---|
| Complete checker | `scripts/pm_w3e_event_oracles.py` | One case model for all twenty families over five boundaries: `append` (current writer, the owner-issued source manifest, payload joins, CV-339/SP-286 first-receipt custody, the SP-14xx custody value, SP-337 pack), `retry` (CV-317 producer-digest comparison, sealed original receipt), `derived` (history row and checkpoint, inline and SP-337 `body_ref` routes), `withdrawal` (scenario model) and `retained` (SP-1101 through the shared `RetainedDispatcher`). `evaluate` (`:2735`) refuses only through the table predicates, in table order; a negative must refuse at exactly its own row and nowhere else (`check_controls_and_negatives`). |
| Guard tables | `scripts/pm_w3e_table_*.py` (60 modules), generator `scripts/pm-w3e-table-generate.py` | 305 rows, at most eight per table. Each predicate is its row's template over projected inputs: the presented value and the independent reference it must equal (the owner-issued manifest, the owner's held state, Storage's own record, a recomputed identity), or a shared helper's own result where the rule is that helper. `applies` carries the row's families and gates derived from the case, never from table results. |
| Cases | built in code (`build_controls` `:2782`, `build_negatives` `:3003`, `build_retained_negatives` `:3670`, `timestamp_witnesses` `:3994`) | 307 complete positives and 19,405 single-defect negatives. Each negative starts from a named positive, changes one input, and refreshes only Storage-derived copies (`resync`); the owner's independent state is refreshed only where the defect is "the owner genuinely issued this" (`reissue`, `:1003`). |
| Tool runner | `scripts/pm-w3e-guard-proof.py` | W3I's runner: `collect` replays every case through the complete checker and projects it into every table of its boundary; `run` gives each table its own gated-tool process. |
| Mutation runner | `scripts/pm-w3e-mutations.py` | 42 exact source edits of the checker, one guard each; the suite (regenerate tables, complete checker with `--fail-fast`) must fail for every one. |

**Complete checker** (`python3 scripts/pm_w3e_event_oracles.py`): exit 0, `"status": "pass"`: 305 rows in 60 tables (298 with single-defect witnesses, 7 entailed), 307 controls and 19,405 negatives (append 13,861; retry 280; derived 4,300; withdrawal 160; retained 804), each refused at exactly its own row and nowhere else; every `$ref` reachable from the twenty payload schemas, the EventRecord and the receipt `custody_v2` resolved eagerly (counts in the output); the shared number corpus through the complete checker: 260 route runs, 0 disagreements, 0 raised.

### Item responses

| Item | Disposition and change | Commit, path:line | Verify |
|---|---|---|---|
| **S1** (review `reviews/W3E-sol/REVIEW-phase1.md:109`): inherited stable IDs, fingerprints and copied hash patterns accept a trailing LF; generic-token uuid `format` unenforced | **Closed.** Owner schemas are validated in full with the shared format checker; a full-consumption row per subject validates the same owner schemas with each anchored, non-negated pattern's final `$` read as `\Z` (`_strict` `:142`, `STRICT_REGISTRY` `:160`): `append_payload_full_consumption`, `append_source_full_consumption`, `append_receipt_full_consumption`, `append_custody_full_consumption`, `history_full_consumption`, `checkpoint_full_consumption`, `checkpoint_body_full_consumption`, `frozen_payload_full_consumption`. The two token uuid sites have their own rows (`checkpoint_uuid_storage_instance_id`, `checkpoint_uuid_source_selection`; `UUID_RE` `:217`). Every string leaf of every subject has a trailing-LF witness, kept only when the owner schema or its strict copy refuses it, at the row that does. | `01fe68ec23` | checker pass; e.g. negatives `payload server_id trailing LF` → `append_payload_full_consumption`, `manifest after_record/expected_fingerprint trailing LF` → `append_source_full_consumption` |
| **S2** (`:111`): adopt NUMRULE and `pm_guard_isolation.py`, per-predicate cuts | **Closed.** Both gated commits merged; numbers and timestamps through the shared calls (sections below); guard rows proved by the gated tool (section below). | `09216c3e1c`, `696f21ebed`, `01fe68ec23` | tool and checker results below |
| **New, found by phase 2: history `source_custody_ref` narrowed** | The payload's `source_custody_ref` admits 2,048 characters, but each family's `$defs/history.source_custody_ref`, the history row's copy of it, admitted 256, so a valid original with a longer custody reference could not be projected (the class of phase-1 F2). **Fixed:** the twenty history definitions and their twenty `Plans/storage_value_registry.json` mirrors now take 2,048; all 60 W3E registry value schemas still equal their payload definitions; controls `append-longref:*` and `derived-longref:*` carry a 2,048-character reference through append and history. | `6dccbfacc2` | checker pass (307 controls) |
| **New, found by phase 2: no row owned the CV-317 producer-route refusal** | An owner-valid payload integer above 2^53 (no schema maximum) cannot pass the shared producer route; the owner units say such an event "refuses before new event effects without narrowing the source schema", but no row owned it (the shared corpus found it). **Fixed:** row `append_producer_route` (`:1956`); receipt and custody rows wait for it (`producer_ok`). Witnesses: `2^53+1`, `2^60` and uint64 max copied from the owner record into the payload, per family with an unconstrained after-record slot. | `01fe68ec23` | corpus 0 disagreements |
| **Contract gap recorded, not fixed: payload fields with no owner_fact source** | Nine payload fields in six families name a value the source manifest does not carry: `remote_access.public_security_violation_detected` `server_endpoint_id`, `violated_control`; `remote_access.remote_link_state_changed` `remote_route_id`, `provider_ref`; `remote_access.route_migration_state_changed` `migration_receipt_ref`; `restore.state_changed` `restore_receipt_ref`; `server.catalog_changed` `catalog_ref`; `server.endpoint_changed` `endpoint_ref`, `prior_endpoint_ref`. They are schema-checked only (`UNJOINED` `:615`). Closing them needs an owner_fact source field or role for each value, which is owner contract work for the next W3E round. | n/a | `summary.unjoined_payload_fields` in the checker output |
| **Carried phase-1 items** | N1 was fixed in phase 1 (`d6208c794e`); no other open item in `reviews/W3E-sol/REVIEW-phase1.md`. W3-P2 step 6 names no W3E-specific item. | | |

### Guard-table result (gated tool `004bdedd63`, credited exactly as reported)

Run at `01fe68ec23`/`ae6901138c` (`python3 -B scripts/pm-w3e-guard-proof.py collect --out <dir>` then `run --out <dir>`, one long-job, inside the 2 GiB no-swap scope; the tool's MemoryGate paused below 10 GiB). Tool SHA-256 `e8038992eabbe067c8bcba8d48824b97fbb6b5b7e69cbfe28a669f939a96c0b8`, byte-identical to `004bdedd63`. **Collection** replayed every case through the complete checker: 267 controls and 19,405 negatives, **0 collection findings, 0 lane-matrix problems**; the only rows without a negative are the seven entailed rows. Each table got its boundary's real controls (up to six) and up to four distinct negatives per row (the projections of cases whose single refusal is that row, interleaved across families). **The tool then ran once per table with a negative: 53 runs, all `PASS`; 298 of 298 provable rows proved; 0 masked negatives; no failure kinds.** Each cut swapped one row to always-pass, ran every control and negative, compared the guard-call trace with the uncut baseline and ran a fresh restoration. Every report's `static.files` is exactly its own table module, and every table module the tool certified is byte-identical at the final head (SHA-256 recorded in each report, rechecked: 53 of 53 match; the one table module regenerated afterwards is the entailed `history_size`, whose docstring proof carries the new computed bound). The history-domain fix (`6dccbfacc2`) added controls and widened a schema the tables do not read; no predicate changed. Total tool time 3,218 s serial. Summary and per-table reports: `drafts/W3E/phase2/guard/`.

| Table group | Tables (run / PASS) | Rows | Proved | Entailed | Tool negatives / controls | Evaluations | Cut: own flips | Cut: stays | Masked |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| `append_admission` | 1 (1 / 1) | 4 | 4 | 0 | 13 / 6 | 247 | 13 | 39 | 0 |
| `append_numbers` | 1 (1 / 1) | 2 | 2 | 0 | 3 / 2 | 35 | 3 | 3 | 0 |
| `append_slots` | 2 (2 / 2) | 11 | 11 | 0 | 22 / 10 | 650 | 22 | 124 | 0 |
| `append_envelope` | 1 (1 / 1) | 6 | 6 | 0 | 24 / 6 | 570 | 24 | 120 | 0 |
| `append_links` | 1 (1 / 1) | 4 | 4 | 0 | 4 / 2 | 78 | 4 | 12 | 0 |
| `append_storage` | 1 (1 / 1) | 4 | 4 | 0 | 16 / 6 | 286 | 16 | 48 | 0 |
| `append_payload` | 1 (1 / 1) | 8 | 8 | 0 | 30 / 6 | 900 | 30 | 210 | 0 |
| `entailed_scope_kind` | 1 (0 / 0) | 1 | 0 | 1 | 0 / 0 | 0 | 0 | 0 | 0 |
| `append_source` | 1 (1 / 1) | 8 | 8 | 0 | 32 / 6 | 950 | 32 | 224 | 0 |
| `append_source_scope` | 1 (1 / 1) | 6 | 6 | 0 | 22 / 6 | 532 | 22 | 110 | 0 |
| `entailed_source_scope_kind` | 1 (0 / 0) | 1 | 0 | 1 | 0 / 0 | 0 | 0 | 0 | 0 |
| `append_source_state` | 1 (1 / 1) | 3 | 3 | 0 | 12 / 6 | 180 | 12 | 24 | 0 |
| `append_join` | 9 (9 / 9) | 71 | 71 | 0 | 208 / 54 | 6,469 | 208 | 1435 | 0 |
| `append_domain` | 3 (3 / 3) | 16 | 16 | 0 | 18 / 14 | 695 | 18 | 111 | 0 |
| `append_receipt_slots` | 1 (1 / 1) | 7 | 7 | 0 | 15 / 2 | 374 | 15 | 90 | 0 |
| `append_receipt_join` | 2 (2 / 2) | 12 | 12 | 0 | 35 / 8 | 1,003 | 35 | 229 | 0 |
| `append_receipt_custody` | 1 (1 / 1) | 7 | 7 | 0 | 28 / 6 | 748 | 28 | 168 | 0 |
| `entailed_receipt_ack_profile` | 1 (0 / 0) | 1 | 0 | 1 | 0 / 0 | 0 | 0 | 0 | 0 |
| `append_custody` | 1 (1 / 1) | 3 | 3 | 0 | 6 / 2 | 80 | 6 | 12 | 0 |
| `append_custody_join` | 2 (2 / 2) | 12 | 12 | 0 | 48 / 12 | 1,236 | 48 | 272 | 0 |
| `append_custody_digest` | 1 (1 / 1) | 1 | 1 | 0 | 4 / 6 | 40 | 4 | 0 | 0 |
| `append_body` | 2 (2 / 2) | 8 | 8 | 0 | 23 / 12 | 488 | 23 | 80 | 0 |
| `entailed_inline_limit` | 1 (0 / 0) | 1 | 0 | 1 | 0 / 0 | 0 | 0 | 0 | 0 |
| `entailed_custody_size` | 1 (0 / 0) | 1 | 0 | 1 | 0 / 0 | 0 | 0 | 0 | 0 |
| `retry` | 2 (2 / 2) | 10 | 10 | 0 | 29 / 12 | 710 | 29 | 134 | 0 |
| `history` | 1 (1 / 1) | 4 | 4 | 0 | 8 / 1 | 117 | 8 | 24 | 0 |
| `history_join` | 2 (2 / 2) | 9 | 9 | 0 | 36 / 12 | 990 | 36 | 224 | 0 |
| `entailed_history_size` | 1 (0 / 0) | 1 | 0 | 1 | 0 / 0 | 0 | 0 | 0 | 0 |
| `checkpoint` | 2 (2 / 2) | 14 | 14 | 0 | 43 / 12 | 1,261 | 43 | 275 | 0 |
| `checkpoint_slots` | 2 (2 / 2) | 9 | 9 | 0 | 18 / 4 | 466 | 18 | 112 | 0 |
| `checkpoint_uuid` | 1 (1 / 1) | 2 | 2 | 0 | 2 / 2 | 28 | 2 | 2 | 0 |
| `checkpoint_token` | 2 (2 / 2) | 9 | 9 | 0 | 12 / 8 | 353 | 12 | 56 | 0 |
| `checkpoint_cursor` | 1 (1 / 1) | 6 | 6 | 0 | 24 / 6 | 570 | 24 | 120 | 0 |
| `checkpoint_publication` | 1 (1 / 1) | 5 | 5 | 0 | 20 / 6 | 416 | 20 | 80 | 0 |
| `withdrawal` | 1 (1 / 1) | 6 | 6 | 0 | 8 / 1 | 171 | 8 | 40 | 0 |
| `retained_dispatch` | 1 (1 / 1) | 8 | 8 | 0 | 8 / 2 | 250 | 8 | 56 | 0 |
| `retained_frozen` | 3 (3 / 3) | 17 | 17 | 0 | 62 / 18 | 1,442 | 62 | 290 | 0 |
| `retained_effects` | 1 (1 / 1) | 6 | 6 | 0 | 24 / 6 | 570 | 24 | 120 | 0 |
| `entailed_retained_resolved` | 1 (0 / 0) | 1 | 0 | 1 | 0 / 0 | 0 | 0 | 0 | 0 |
| **Total** | 60 (53 / 53) | 305 | 298 | 7 | 857 / 262 | 22,905 | 857 | 4,844 | 0 |



**Unproved rows: each alone in its own table, with the proof (generated into the table module's docstring and recorded in `ENTAILED`).**

| Row | Rows that always refuse first | Proof |
|---|---|---|
| `append_inline_limit` | `append_payload_schema` | `max_encoded_bytes` (`:2298`) bounds every one of the twenty closed payload schemas below 16,384 SP-236 bytes (largest 14,724, `restore.state_changed`; asserted when the module loads). The row is gated on `pay_ok`, so a larger inline body is refused first by `append_payload_schema`. W3E has no owner-valid payload above 16 KiB; the SP-337 route is exercised by the `pack:*` controls. |
| `append_custody_size` | `append_custody_schema`, `append_custody_scope_partition` | Every `$defs/custody` is bounded below 16,384 bytes (largest 11,353); its one unbounded member, the Backup/Restore `scope_partition`, is charged 1,379 bytes because the row applies only when it equals the case partition, which `append_partition` joins to the encoded payload `project_id` (at most 256 characters). |
| `history_size` | `history_schema`, `history_scope_partition` | Every `$defs/history` is bounded below 16,384 bytes (largest 15,225, after the 2,048-character `source_custody_ref` fix), the partition charged as above. |
| `append_scope_kind` | `append_project` | The EventRecord `allOf` and every payload schema tie `scope_kind` to `project_id`; the row applies only when the envelope and payload `project_id` are equal, which forces equal scope kinds. |
| `append_source_scope_kind` | `append_source_project` | The owner_fact schema ties `scope_kind` to `project_id` the same way; the row applies only when the payload and manifest `project_id` are equal. |
| `append_receipt_ack_profile` | `append_receipt_schema` | The single receipt-profile switch `RECEIPT_ACK_PROFILE` (`:87`) is `EVENT_RECORD` while Jared decides the AppendReceipt profile; `append_receipt_schema` already applies `format_checker(profile=EVENT_RECORD)` to `acknowledged_at_utc` and gates this row. Setting the switch to `STORAGE_UTC_Z` makes this row reachable with no other change. |
| `retained_resolved` | every `retained_dispatch` row, every `frozen_*` row, `retained_no_current_gate` | The shared dispatcher's own reasons each have a row; `_custody_from_sealed` (`:1133`) turns every shared-constructor refusal (`scripts/pm_event_numbers.py:442-485`) into `sealed_receipt_malformed`, which has its row; `frozen_components` raises no `Refusal`. The full proof, with line spans computed from the source at load, is in `scripts/pm_w3e_table_entailed_retained_resolved.py`. Witnesses for the constructor cases (recipe member `7`, recipe member `None`, `resource_manifest_sha256` `zz`, binding `server_id` `7`, binding `project_id` on an application binding, binding `project_id` `7` in Project scope) all refuse at `retained_receipt_wellformed`. |

**Implied sites** (schema sites left out of the tables because a named row always refuses first): none beyond the seven rows above. Every other owner-schema keyword (pattern, format, not, allOf, oneOf, const, enum, required, additionalProperties, min/max) stays in validation at the subject's schema row, with witnesses generated from each subject's own leaves (`subject_site_negatives` `:2913`).

### Mutation proof

`python3 scripts/pm-w3e-mutations.py --scratch <dir> --json <file>`: each mutation edits one guard of the checker in a scratch tree (shared modules and `Plans/` linked read-only), regenerates the tables and runs the complete checker with `--fail-fast`. **All 42 mutations are killed** on the final checker (`83e26562d3`; baseline suite clean, exit 0). They cut 41 different rows or row groups: identity, scope, the owner-issuance check, per-role evidence, writer fence, predecessor currentness, four owner-domain predicates, payload slot bounds, the Storage-time profile, receipt/custody/history/token/cursor joins, uuid and full-consumption restorations, the publication CAS, the inline wrapper limit, every retained-read property (ambiguous and missing receipts, no receipt on read, the instrumented gate, the caller override through the shared dispatcher, the dispatcher verdict, frozen identity and full consumption), the owner record allOf, the shared date-time format checker, the payload `not` keyword and the `eq` template's type check. One earlier run of the same list killed 41 of 42: W41 survived because the generated schema negatives took their expected row from the same in-memory schema copy the mutation weakened; the fixture oracle now loads its own owner-schema copy (`83e26562d3`), and the final run kills W41.

| # | Guard weakened or deleted | Row | Result | First failure the suite reported |
|---|---|---|---|---|
| W1 | Storage partition compared with itself | `append_partition` | killed | negative `append_partition` (backup.destination_changed, wrong Storage partition): accepted |
| W2 | event_id compared with itself | `append_event_id` | killed | negative `append_event_id` (backup.destination_changed, supplied event_id digest (Storage stored it under that id)): accepted |
| W3 | owner issuance check compares the manifest digest with itself | `append_source_authentic` | killed | negative `append_source_authentic` (backup.destination_changed, substituted manifest recipe (not owner-issued)): accepted |
| W4 | genuine-role check reads only the first role | `append_roles_genuine` | killed | negative `append_roles_genuine` (backup.destination_changed, substituted reviewed_locator): accepted |
| W5 | writer fence compared with itself | `append_writer_fence` | killed | negative `append_writer_fence` (backup.destination_changed, stale writer lease): accepted |
| W6 | predecessor currentness compared with itself | `append_before_current` | killed | negative `append_before_current` (backup.destination_changed, the predecessor is no longer the owner's current record): accepted |
| W7 | revocation generation rule compared with itself | `dom_revoked_generation` | killed | negative `dom_revoked_generation` (server.client_revoked, effective generation is previous plus two): accepted |
| W8 | revoked sessions compared with themselves (caller set trusted) | `dom_revoked_sessions` | killed | negative `dom_revoked_sessions` (server.client_revoked, an active session at the fence is not terminated): accepted |
| W9 | Catalog revision floor lowered by one (equal accepted) | `dom_catalog_increases` | killed | negative `dom_catalog_increases` (server.catalog_changed, changed Catalog keeps the prior revision): accepted |
| W10 | payload integer slots lose their owner minimum | `append_slot_*` | killed | negative `append_slot_destination_generation` (backup.destination_changed, destination_generation below the owner minimum 0): accepted |
| W11 | Storage observed time checked on the event_record profile | `append_observed_utc_z` | killed | negative `append_observed_utc_z` (backup.destination_changed, observed_at_utc +00:00): accepted |
| W12 | first-receipt joins read the receipt itself | `append_receipt_*` | killed | negative `append_receipt_event_id` (backup.destination_changed, receipt event_id differs from Storage's record): accepted |
| W13 | custody joins read the custody itself | `append_custody_*` | killed | negative `append_custody_storage_instance_id` (backup.destination_changed, custody storage_instance_id '7c1e2a94-3b5d-4f60-8a71-92b3c): accepted |
| W14 | history joins read the history itself | `history_*` | killed | negative `history_storage_instance_id` (backup.destination_changed, history storage_instance_id '7c1e2a94-3b5d-4f60-8a71-92b3c): accepted |
| W15 | durable token joins read the token itself | `checkpoint_token_*` | killed | negative `checkpoint_token_storage_instance_id` (backup.destination_changed, token storage_instance_id is not Storage's): accepted |
| W16 | uuid restoration accepts any string | `checkpoint_uuid_*` | killed | negative `checkpoint_uuid_storage_instance_id` (backup.destination_changed, token storage_instance_id trailing brace (accepted by the js): checkpoint_token_storage_instance_id |
| W17 | publication revision compared with itself | `checkpoint_revision_cas` | killed | negative `checkpoint_revision_cas` (backup.destination_changed, publication revision skips one): accepted |
| W18 | inline wrapper limit doubled | `checkpoint_inline_size` | killed | negative `checkpoint_inline_size` (backup.destination_changed, inline wrapper above 16 KiB (body must take body_ref)): accepted |
| W19 | owner: ambiguous-receipt refusal removed | `retained_receipt_unique` | killed | negative `retained_receipt_unique` (backup.destination_changed, ambiguous receipt): accepted |
| W20 | no-receipt-on-read compares the store snapshot with itself | `retained_no_receipt_creation` | killed | negative `retained_no_receipt_creation` (backup.destination_changed, owner writes an access receipt while reading (seen only by t): accepted |
| W21 | current-gate instrumentation removed | `retained_no_current_gate` | killed | negative `retained_no_current_gate` (backup.destination_changed, frozen verifier runs the current writer gate (seen only by t): accepted |
| W22 | caller override no longer passed to the shared dispatcher | `retained_recipe_override` | killed | negative `retained_recipe_override` (backup.destination_changed, caller recipe override (through resolve(recipe_override=...)): accepted |
| W23 | installed frozen verifier always returns True | `retained_dispatcher_verdict` | killed | negative `frozen_decodes` (backup.destination_changed, sealed record bytes corrupt): frozen_decodes, retained_dispatcher_verdict |
| W24 | frozen identity compared with itself | `frozen_identity` | killed | negative `frozen_identity` (backup.destination_changed, original sealed under a forged event_id (consistent everywhe): accepted |
| W25 | frozen payload full consumption skipped | `frozen_payload_full_consumption` | killed | negative `frozen_payload_full_consumption` (backup.destination_changed, original payload server_id with a trailing LF (the anchored ): accepted |
| W26 | full-consumption copy validates with the stock registry (trailing LF accepted) | `append_payload_full_consumption` | killed | negative `append_payload_full_consumption` (backup.destination_changed, payload server_id trailing LF): append_writer_server, append_source_server, append_record_server |
| W27 | owner schema keyword dropped: the owner records lose their allOf | `append_source_schema` | killed | negative `append_source_schema` (backup.state_changed, manifest after_record/destination_attempts/0/remote_snapshot): accepted |
| W28 | owner schemas validated without the shared date-time format checker | `append_source_schema` | killed | negative `append_envelope_schema` (backup.destination_changed, observed_at_utc missing zone): append_observed_utc_z |
| W29 | record Server compared with itself | `append_record_server` | killed | negative `append_record_server` (backup.destination_changed, original record of another Server): accepted |
| W30 | payload joins read the before record for after-record fields | `append_join_*` | killed | negative `append_before_subject` (backup.state_changed, predecessor of another subject): append_before_subject, append_join_backup_run_id |
| W31 | source custody ref compared with itself | `append_source_custody_ref` | killed | negative `append_source_custody_ref` (backup.destination_changed, payload names another original's custody): accepted |
| W32 | writer Server compared with itself | `append_writer_server` | killed | negative `append_writer_server` (backup.destination_changed, payload Server is not the actual writing Server): accepted |
| W33 | retry semantic comparison never applies | `retry_semantic` | killed | negative `retry_semantic` (backup.destination_changed, same identity, different semantic body (backup_destination_i): accepted |
| W34 | Storage metadata joins read the event itself | `append_storage_*` | killed | negative `append_storage_event_id` (backup.destination_changed, Storage record names another event): accepted |
| W35 | inclusive-restart cursor joins read the cursor itself | `checkpoint_cursor_*` | killed | negative `checkpoint_cursor_segment_generation` (backup.destination_changed, cursor segment_generation is not Storage's frame): accepted |
| W36 | expected fingerprint not recomputed from the held material | `dom_mismatch_expected_material` | killed | negative `dom_mismatch_expected_material` (server.identity_mismatch_detected, expected digest does not derive from the held expected key): accepted |
| W37 | receipt slots use an unbounded current_integer instead of storage_uint64 | `append_receipt_slot_*` | killed | negative `append_receipt_slot_sequence_id` (backup.destination_changed, receipt sequence_id 2**64): accepted |
| W38 | event physical encoding skips the payload | `append_event_physical` | killed | negative `append_event_physical` (backup.destination_changed, payload extra member 2**64): accepted |
| W39 | owner ignores original_ref (returns any sealed row) | `retained_receipt_present` | killed | negative `retained_receipt_present` (backup.destination_changed, missing receipt: the store holds only another original's rec): retained_binding |
| W40 | eq template drops its type check (True == 1, 1.0 == 1) | `eq rows` | killed | negative `withdrawal_once` (backup.destination_changed, boolean count): accepted |
| W41 | payload schema keyword dropped: payload `not` control-character rule removed | `append_payload_schema` | killed | negative `append_payload_schema` (backup.destination_changed, payload owner_operation_id trailing LF): append_payload_full_consumption |
| W42 | public-route test security rule never applies | `dom_test_public_security` | killed | negative `dom_test_public_security` (remote_access.route_test_completed, passed public test with failed public security): accepted |

Killed 42 of 42 (baseline clean: True).


### Numbers

Shared calls (CV-1100/SP-1100; `scripts/pm_w3e_event_oracles.py`):

| Slot or route | Shared call | Row |
|---|---|---|
| Storage `sequence_id` (event) | `storage_uint64` | `append_sequence_uint64` |
| Whole event, manifest, receipt custody, custody, history, checkpoint, retry candidate | `storage_value_bytes(EVENT_VALUE)` (an out-of-range integer anywhere is a code, never a raise) | `append_event_physical`, `append_source_physical`, `append_receipt_physical`, `append_custody_physical`, `history_physical`, `checkpoint_physical`, `retry_event_physical` |
| Every payload integer slot (eleven names across the families: generations, revisions, Catalog revisions) | `current_integer(value, minimum=<schema minimum>, maximum=<schema maximum>)`, no lane bound (`PAYLOAD_SLOTS` `:915`) | `append_slot_<name>` |
| CV-317 producer projection (append, retry) | `producer_semantic_digest` | `append_producer_route`, `append_receipt_custody_producer_semantic_digest`, `append_custody_semantic_digest`, `retry_semantic`, `frozen_receipt_semantic` |
| AppendReceipt slots (`sequence_id`, `segment_generation`, `byte_offset`, `durable_end_offset`, `manifest_generation`) | `storage_uint64` | `append_receipt_slot_*` |
| History `sequence_id`; checkpoint body slots (publication revision, frontier revision, selection generations/epoch, cursor offsets and sequence) | `storage_uint64` | `history_slot_sequence`, `checkpoint_slot_*` |
| Checkpoint `body_ref.byte_size` | `current_integer(minimum=1)` | `checkpoint_ref_byte_size` |
| CV-339 full value, SP-337 payload pack and checkpoint body | `full_value_commitment`, `verify_payload_bytes`, `decode_storage_value` | `append_receipt_full_value`, `append_pack_*`, `checkpoint_body_decodes` |
| Retained originals | `RetainedDispatcher`, `RecipeTuple`, `OriginalBinding`, `OriginalCustody`, `FrozenRecipe` | `retained_dispatch` and `frozen_*` rows |

The W3E identity recipes (owner operation, `w3e@1:` event id, CV-366 `application@1`/`project@1` key) hash exact UTF-8 strings and serialize no number or timestamp, so no `qualified_jcs` preimage exists in this lane.

Results:
- **Shared self-test:** `python3 scripts/pm_event_numbers.py --self-test --scope numbers` exit 0, `"status": "pass"` (276 positives, 304 negatives, 0 failures).
- **Shared corpus through the complete checker** (`corpus_number_checks` `:3954`): 260 route runs (65 shared spellings x 4 routes): 60 accepted, 108 refused, 92 refused at load, 0 raised, 0 disagreements. Two routes per family pair: every raw spelling enters through the checker's own `loads_current_json` at Storage's `sequence_id` and at a payload integer slot (the owner record carries the same value), then runs the complete append boundary; the expectation is composed only from the shared helpers (`loads_current_json`, `storage_value_bytes`, `storage_uint64`/`current_integer`, `producer_semantic_digest`).
- **The 4,400-digit integer:** checked at every route. `10**4399` and `-10**4399` as the event `sequence_id`, a payload extra member, a payload string slot, every payload integer slot, the manifest (after-record integer), the receipt slots and group digest, the custody value, the history `sequence_id` and extra member, the inline checkpoint body, and the retry candidate are each refused with a code at the row named; nothing raised (`"raised": 0` in the corpus totals, and the complete checker treats any exception as a failure).

**Fixture expectations the shared rule decides** (W3E had no earlier executable fixtures; these are the inputs a stock-schema reading alone would accept):

| Input | Stock JSON Schema | Shared rule | Refusing row |
|---|---|---|---|
| Integral float (`5.0`) at a payload integer slot | accepted as integer | `current_integer` refuses (`integer_type`) | `append_slot_<name>` |
| `True` or `"7"` at a payload integer slot | refused by type | `current_integer` refuses first | `append_slot_<name>` |
| Owner-valid `2^53+1`, `2^60`, uint64 max at a payload slot | accepted (no maximum) | `producer_semantic_digest` refuses (`jcs_binary64`/`jcs_decimal`) | `append_producer_route` |
| `2^64` at `sequence_id` or a receipt slot | accepted (no maximum) | `storage_uint64` refuses (`integer_range`) | `append_sequence_uint64`, `append_receipt_slot_*` |
| `10**4399` anywhere in a stored value | message formatting would raise | `storage_value_bytes` refuses (`physical_integer_range`) before any schema runs | the subject's physical row |
| `1.0`, `1e0`, `-0.0` raw tokens | not reached | `loads_current_json` keeps the float kind; `current_integer`/`storage_uint64` refuse | corpus routes |

### Timestamps

Every W3E timestamp field, re-derived from the schemas on every run (`timestamp_inventory` `:3837`; a declared date-time field with no covering check fails the run). The timestamp review is no longer interim.

| Field | Owner and profile | Shared check |
|---|---|---|
| EventRecord `occurred_at_utc` (append, retry, retained) | CV-317/CV-1101, `event_record` | `format_checker(EVENT_RECORD)` in `append_envelope_schema`, `retry_envelope_schema`, `frozen_envelope_schema`; positives `retained-offset:*` (lowercase `t`, `+02:00`, a 12-digit fraction); negatives 30 February, empty fraction |
| EventRecord `observed_at_utc`, `persisted_at_utc` | CV-253 Storage-assigned, `storage_utc_z` over the broad format | `append_envelope_schema` (format) + `append_observed_utc_z`/`append_persisted_utc_z` (`date_time(..., STORAGE_UTC_Z)`), `frozen_observed_utc_z`/`frozen_persisted_utc_z`; joins to Storage's record `append_storage_observed`/`_persisted`; negatives missing zone, trailing LF, hour 24, space, false leap second, day 31, `+24:00`, `+00:00`, `-00:00`, lowercase `z`, `+02:00` |
| CV-339 AppendReceipt `acknowledged_at_utc` | its schema says `format: date-time` and no owner text binds a profile: `RECEIPT_ACK_PROFILE` (`:87`) is `event_record` for now, a single switch pending Jared | `format_checker(EVENT_RECORD)` in `append_receipt_schema` and `frozen_receipt_schema`; entailed `append_receipt_ack_profile` applies the switch; join `append_receipt_acknowledged_at_utc`; negatives `garbage`, missing zone, trailing LF, 30 February |
| Owner-record timestamps inside the source manifest (before and after records), per family: `backup.destination_changed` `created_at_utc`, `updated_at_utc`; `backup.state_changed` `destination_attempts/*/started_at_utc`, `destination_attempts/*/terminal_at_utc`, `destination_attempts/*/updated_at_utc`, `phase_journal/last_reconciled_at_utc`, `started_at_utc`, `terminal_at_utc`, `updated_at_utc`; `remote_access.private_endpoint_state_changed` `observed_at_utc`; `remote_access.proxy_state_changed` `created_at_utc`, `persisted_at`, `updated_at_utc`; `remote_access.public_security_violation_detected` `updated_at_utc`; `remote_access.remote_link_state_changed` `updated_at_utc`; `remote_access.route_migration_state_changed` `currentness_checked_at_utc`, `persisted_at`, `started_at_utc`, `terminal_at_utc`, `updated_at_utc`; `remote_access.route_preference_changed` `created_at_utc`, `persisted_at`, `updated_at_utc`; `remote_access.route_state_changed` `created_at_utc`, `persisted_at`, `updated_at_utc`; `remote_access.route_test_completed` `completed_at_utc`, `started_at_utc`; `restore.state_changed` `emergency_recovery_consent/expires_at_utc`, `emergency_recovery_consent/issued_at_utc`, `emergency_recovery_consent/validated_at_utc`, `phase_journal/last_reconciled_at_utc`, `started_at_utc`, `terminal_at_utc`, `updated_at_utc`; `server.catalog_changed` `updated_at_utc`; `server.client_pairing_state_changed` `expires_at_utc`, `started_at_utc`, `terminal_at_utc`; `server.client_revoked` `revoked_at_utc`; `server.client_trust_changed` `expires_at_utc`, `issued_at_utc`, `revoked_at_utc`; `server.connection_state_changed` `observed_at_utc`; `server.discovery_expired` `expires_at_utc`, `observed_at_utc`; `server.discovery_observed` `expires_at_utc`, `observed_at_utc`; `server.endpoint_changed` `updated_at_utc`; `server.identity_mismatch_detected` `updated_at_utc` (each in both `before_record` and `after_record`) | owner_schema (RFC 3339 `date-time`; other-owner observations in `Plans/event_datetime_inventory.json`) | `format_checker(EVENT_RECORD)` inside `append_source_schema` (the full owner record schemas through the closed registry); witnesses at every instance the controls carry as a string: 30 February (`timestamp_witnesses`), trailing LF, `7`, `null` |
| Payload, custody, history, checkpoint, checkpoint body | none (no `date-time` declaration; re-derived each run) | n/a |

Nullable owner-record timestamps that every control carries as `null` (for example `backup_run.terminal_at_utc` before completion, `restore_run.emergency_recovery_consent`) are checked by the same format rule when present, but have no malformed-string witness of their own.

**Date-time inventory gate** (`python3 scripts/pm_event_datetime_inventory.py`, whole `Plans/` tree): exit 1, `"status": "fail"`, 233 nodes, 0 unclassified nodes, 79 failure rows. 59 are not W3E files: 34 `Plans/.plan_index` unclassified containers and 2 stale scan exclusions (the index regenerated after the NUMRULE merge), 19 `Plans/.plan_migration` and 4 in the ignored currentness edition copied in for index generation (the T198 class). The other 20 are `unreadable_mentioning_container` rows, one per W3E owner unit (`Plans/Server_System.md` 9, `Plans/Remote_Access_System.md` 8, `Plans/Backup_Restore_System.md` 3): each unit's YAML fence mentions `observed_at_utc`/`persisted_at_utc` in prose ("sequence_id, observed_at_utc and persisted_at_utc come only from Storage"), present since phase 1 (`696f21ebed` has the same two mentions in BRS-1400), and the gate reads fences as JSON. They declare no timestamp field. They are recorded for the batch-3 integration refresh as cited prose exclusions. Under SWEEP-P2B addendum 2 the inventory and exclusions are NUMRULE files and are not edited in a lane tree; the lane uses the shared `date_time` predicate with the explicit profile per field and does not call `datetime_validator`. The lane commits no fixture data file (cases are built in code), so no lane file joins the gate's universe.

### Retained reads (batch 2 fix 1, built in from the start)

- **Selection only from the sealed receipt for that exact original** (`SealedReceiptOwner` `:1153`): the owner looks up `original_ref` in Storage's sealed store; the recipe comes only from that row and goes through the shared `RetainedDispatcher` with the frozen map installed outside the request (`resolve_retained` `:1292`). No Store default, fallback or probing.
- **Missing or ambiguous receipts** keep the bytes and return unavailable: empty store and a store holding only another original's receipt under that original's own ref → `original_receipt_missing` (`retained_receipt_present`); two receipts → `original_receipt_ambiguous` (`retained_receipt_unique`); another original's receipt under this ref → `original_binding` (`retained_binding`); a malformed row or a member the shared constructors refuse → `sealed_receipt_malformed`; an unknown recipe → `recipe_unknown`.
- **No receipt is created while reading:** the sealed store is snapshotted before and after `resolve` (`retained_no_receipt_creation`); a faulty owner that writes an access receipt is refused there and nowhere else. **The current writer gate never runs:** `current_append_policy` is instrumented during the read (`retained_no_current_gate`).
- **Caller override** goes through `resolve(recipe_override=...)`, so the shared dispatcher's own `caller_recipe_override` refusal is exercised.
- **The dispatcher's own verdict is observed:** `retained_dispatcher_verdict` requires the dispatcher to refuse `original_verification` exactly when a frozen component fails; a verifier that rejects a genuine original is refused there.
- **Wrongly typed sealed members** refuse at the named row `retained_receipt_wellformed` (six witnesses per family), never at the catch-all.
- **History in both directions:** `retained-live:*` reads after the live admission, writer lease and permission, the owner's issuance record and its current/settled records all changed, and still verifies; `compatibility:*` reads a retained `projector_replay_only` original; forged identity/key/commitment/result/receipt originals are refused at their frozen rows; withdrawn family/original refused.
- **New-write selection stays separate:** append reads no sealed receipt.

### Retention cells

All twenty cells are bound to landed decisions; none stays pending and no question goes to Jared. The decisions name each family exactly in E-CARDS-3 Appendix A (`decision-answers/E-CARDS-3.as-presented-a7d00c73.md:495-677`), and the Storage third-sitting assignment on `main` lists them (`Plans/storage-plan.md:17636-17672` at `origin/main` `564ed6a467`). Card 1 (DL-401), deck 2 (DL-415..DL-452) and deck 4 (DL-500..DL-509) name none of these families.

| Families | Decision | Policy |
|---|---|---|
| `backup.destination_changed`, `remote_access.route_preference_changed`, `server.catalog_changed`, `server.client_revoked`, `server.client_trust_changed`, `server.endpoint_changed` | DL-453 (item 1.a A) | `RP-AUTHORITY-INDEFINITE@1.0.0`, application editions, no new count allowance |
| `remote_access.private_endpoint_state_changed`, `remote_access.proxy_state_changed`, `remote_access.remote_link_state_changed`, `remote_access.route_state_changed`, `server.connection_state_changed`, `server.discovery_expired`, `server.discovery_observed` | DL-454 (item 2.a A) | `RP-ROUTINE-OBSERVATION-APPLICATION-90D@1.0.0` (`app:routine_observation`) |
| `remote_access.public_security_violation_detected`, `remote_access.route_migration_state_changed`, `remote_access.route_test_completed`, `server.client_pairing_state_changed`, `server.identity_mismatch_detected` | DL-455 (item 3.a A) | `RP-OPERATIONAL-SECURITY-APPLICATION-2555D@1.0.0` (`app:operational_security`) |
| `backup.state_changed`, `restore.state_changed` | DL-455 (item 3.a A) | Project editions `RP-OPERATIONAL-2555D@1.0.0` with Storage's Project first-save anchor adapter; application editions `RP-OPERATIONAL-SECURITY-APPLICATION-2555D@1.0.0` |

Owner text: each family's SRV/RAS/BRS unit, CV unit and SP unit (`ae6901138c`). Integration item: `RP-ROUTINE-OBSERVATION-APPLICATION-90D@1.0.0` and `RP-OPERATIONAL-SECURITY-APPLICATION-2555D@1.0.0` are on `main` but not on this unrebased branch, so the sixty Storage registry value rows keep `retention_policy_ref` `PENDING_RETENTION_DECISION` until the batch-3 rebase brings the policy objects; the SP units say so.

### What Astra keeps finding: how each was ruled out

1. **Forged or contradictory inputs:** identities and keys are recomputed (`append_event_id`, `append_idempotency_key`, `append_owner_operation`); the manifest must be the owner-issued one (`append_source_authentic`), its roles the owner's genuine evidence role by role (`append_roles_genuine`), its before/after records the owner's current and settled state; fingerprints recomputed from held identity material (`dom_mismatch_*`).
2. **Storage-assigned metadata:** event `event_id`, `sequence_id`, observed/persisted times and all eleven receipt fields join Storage's own record; the retry comparison excludes them (`retry-storage-meta:*` positives).
3. **Historical readers:** `retained-live`, `compatibility` and `retained-offset` positives; forged, withdrawn and other-original records refused; no current-writer row reaches a retained original (instrumented gate).
4. **One field read two ways:** strict typed equality (`eq` template checks the type first; mutation W40 proves it matters); trailing LF refused by the full-consumption rows.
5. **Unresolved references:** `eager_refs` (`:190`) resolves every `$ref` reachable from each payload schema, the EventRecord and the receipt `custody_v2`, transitively and including unvisited branches (counts in the checker output).
6. **Size limits:** inline payload (entailed, proof above), custody and history (entailed), the entire checkpoint wrapper (`checkpoint_inline_size`, a genuine 17 KB body taking `body_ref` in `derived-large:*`), SP-337 pack and body bytes.
7. **Custody on every path:** first-receipt custody and the SP-14xx custody value on append; the sealed original on retry and every retained read.
8. **Masked negatives:** every negative must refuse at exactly its row; the tool's matrix and cut/restore runs re-check every table.
9. **Grades:** criterion 12 stays PARTIAL with its gaps listed below.
10. **Numbers written two ways:** integer slots take only exact integers (`5.0`, `True`, `"7"` refused); `-0`/`01` never parse.
11. **Types confused:** string booleans, integers for booleans, integers/null/arrays/objects at every string leaf (generated per subject).
12. **Formats skipped:** date-time through the shared checker; uuid restored at its own rows.
10a. **Tightened rules and history:** retained originals verify under their sealed `w3e@1` recipe; a caller cannot select one. W3E has a single edition, so there is no older-recipe positive to build.

### Grades before and after

Per family, cells PASS / PARTIAL / ABSENT. Re-graded at `83e26562d3` (Plans unchanged since `6dccbfacc2`); every evidence quote in `reports/event-authority-20261105/W3E-self-grade.json` was re-pinned and re-checked at its current line and file hash (218 existing quotes moved and re-pinned, 0 missing; 60 new quotes for the retention and criterion-12 cells, each an exact line).

| Family | Before (phase-1 round 1) | After (phase 2) | Cells that changed |
|---|---|---|---|
| `backup.destination_changed` | 9 / 2 / 1 | 10 / 1 / 1 | 7 retention: PARTIAL -> PASS (DL-453); 12 oracles stays PARTIAL with the gaps below |
| `backup.state_changed` | 9 / 2 / 1 | 10 / 1 / 1 | 7 retention: PARTIAL -> PASS (DL-455); 12 oracles stays PARTIAL with the gaps below |
| `remote_access.private_endpoint_state_changed` | 9 / 2 / 1 | 10 / 1 / 1 | 7 retention: PARTIAL -> PASS (DL-454); 12 oracles stays PARTIAL with the gaps below |
| `remote_access.proxy_state_changed` | 9 / 2 / 1 | 10 / 1 / 1 | 7 retention: PARTIAL -> PASS (DL-454); 12 oracles stays PARTIAL with the gaps below |
| `remote_access.public_security_violation_detected` | 9 / 2 / 1 | 10 / 1 / 1 | 7 retention: PARTIAL -> PASS (DL-455); 12 oracles stays PARTIAL with the gaps below |
| `remote_access.remote_link_state_changed` | 9 / 2 / 1 | 10 / 1 / 1 | 7 retention: PARTIAL -> PASS (DL-454); 12 oracles stays PARTIAL with the gaps below |
| `remote_access.route_migration_state_changed` | 9 / 2 / 1 | 10 / 1 / 1 | 7 retention: PARTIAL -> PASS (DL-455); 12 oracles stays PARTIAL with the gaps below |
| `remote_access.route_preference_changed` | 9 / 2 / 1 | 10 / 1 / 1 | 7 retention: PARTIAL -> PASS (DL-453); 12 oracles stays PARTIAL with the gaps below |
| `remote_access.route_state_changed` | 9 / 2 / 1 | 10 / 1 / 1 | 7 retention: PARTIAL -> PASS (DL-454); 12 oracles stays PARTIAL with the gaps below |
| `remote_access.route_test_completed` | 9 / 2 / 1 | 10 / 1 / 1 | 7 retention: PARTIAL -> PASS (DL-455); 12 oracles stays PARTIAL with the gaps below |
| `restore.state_changed` | 9 / 2 / 1 | 10 / 1 / 1 | 7 retention: PARTIAL -> PASS (DL-455); 12 oracles stays PARTIAL with the gaps below |
| `server.catalog_changed` | 9 / 2 / 1 | 10 / 1 / 1 | 7 retention: PARTIAL -> PASS (DL-453); 12 oracles stays PARTIAL with the gaps below |
| `server.client_pairing_state_changed` | 9 / 2 / 1 | 10 / 1 / 1 | 7 retention: PARTIAL -> PASS (DL-455); 12 oracles stays PARTIAL with the gaps below |
| `server.client_revoked` | 9 / 2 / 1 | 10 / 1 / 1 | 7 retention: PARTIAL -> PASS (DL-453); 12 oracles stays PARTIAL with the gaps below |
| `server.client_trust_changed` | 9 / 2 / 1 | 10 / 1 / 1 | 7 retention: PARTIAL -> PASS (DL-453); 12 oracles stays PARTIAL with the gaps below |
| `server.connection_state_changed` | 9 / 2 / 1 | 10 / 1 / 1 | 7 retention: PARTIAL -> PASS (DL-454); 12 oracles stays PARTIAL with the gaps below |
| `server.discovery_expired` | 9 / 2 / 1 | 10 / 1 / 1 | 7 retention: PARTIAL -> PASS (DL-454); 12 oracles stays PARTIAL with the gaps below |
| `server.discovery_observed` | 9 / 2 / 1 | 10 / 1 / 1 | 7 retention: PARTIAL -> PASS (DL-454); 12 oracles stays PARTIAL with the gaps below |
| `server.endpoint_changed` | 9 / 2 / 1 | 10 / 1 / 1 | 7 retention: PARTIAL -> PASS (DL-453); 12 oracles stays PARTIAL with the gaps below |
| `server.identity_mismatch_detected` | 9 / 2 / 1 | 10 / 1 / 1 | 7 retention: PARTIAL -> PASS (DL-455); 12 oracles stays PARTIAL with the gaps below |

**Why:** retention (7) was PARTIAL only because no decision named these families; DL-453/454/455 now do and the owner text binds them. **Criterion 12 (oracles) stays PARTIAL**, honestly: executable oracles and tool-proved guard rows now exist, but (a) the nine payload fields above have no owner_fact source and are schema-checked only; (b) of the plan's owner-domain predicates, those the owner record schemas already decide are witnessed at `append_source_schema` (`OWNER_SCHEMA_DOMAIN` `:3558`), 16 have their own rows (`dom_*`, witnesses in `DOMAIN_WITNESSES` `:3601`), and the rest are not modelled (for example `backup.destination_changed` "use_existing never initializes a repository", `server.discovery_expired` clock-reaches-expiry, `server.connection_state_changed` resume-needs-durable-cursor, the Restore activation chain beyond its schema); (c) admission, dedupe catch-up, CAS/atomic commit, withdrawal and rebuild are scenario-flag rows; (d) coherent backup/restore capture and source-frame relocation are not built; native execution NOT_RUN.

### Checks at the phase-2 head

Logs and summaries are in `drafts/W3E/phase2/` with `SHA256SUMS`. Each heavy command ran as a long-job inside `systemd-run --user --scope -p MemoryMax=2G -p MemorySwapMax=0`, started at 12 GiB or more available.

| Command | Head | Exit | Result |
|---|---|---:|---|
| `python3 scripts/pm_w3e_event_oracles.py --json <file>` | `83e26562d3` (scripts as committed; the entailed table docstring regenerated after) | 0 | `pass`: 305 rows, 60 tables, 307 controls, 19,405 negatives, 0 failures; corpus 0 disagreements, 0 raised |
| `python3 scripts/pm-w3e-table-generate.py --check` | `83e26562d3` | 0 | 60 tables, 305 rows, 7 entailed; nothing stale or extra |
| `python3 -B scripts/pm-w3e-guard-proof.py collect` then `run` | `ae6901138c` | 0 | 53/53 runs PASS, 298/298 provable rows proved, 0 masked; 0 collection findings |
| `python3 -B scripts/pm-w3e-mutations.py --scratch <dir> --json <file>` | `83e26562d3` | 0 | 42 of 42 killed; baseline clean |
| `python3 scripts/pm_event_numbers.py --self-test --scope numbers` | `83e26562d3` | 0 | `pass`: 276 positives, 304 negatives, 0 failures |
| `python3 scripts/pm_event_datetime_inventory.py` (whole `Plans/`) | `83e26562d3` | 1 | `fail`, 79 rows; see Timestamps (none is a new phase-2 node) |
| `python3 scripts/pm-shard-plans.py --generate`, `pm-plan-index.py generate`, `pm-shard-plans.py --check` (15-file currentness edition copied in, SHA-256 identical) | `ae6901138c`, `6dccbfacc2` | 0 | `pass`, 3,161 shards; only contracts_v0, storage-plan, automated_testing_system and storage_value_registry shards and the index changed; 7,488 units |
| `python3 scripts/pm-plan-index.py validate`, `origin/main` pinned to the NUMRULE merge `696f21ebed` in a scratch shared clone (currentness edition copied in) | `83e26562d3` | 0 | `pass`, 0 failures, 7,488 units, 30,147 acceptance units |
| `git diff --check 1a2cb7264d HEAD -- Plans scripts reports` | `83e26562d3` | 0 | no whitespace errors |

