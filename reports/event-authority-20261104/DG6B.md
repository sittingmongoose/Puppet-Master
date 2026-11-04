# DG6B — review round 1 completed, prepared without admission

Branch: `plans/ea-w2-plugins-personas-github-20261104`. Reviewed head: `92c1c9ce7c7b79e451a5d668792a8f9b84388d02`. Contract head assessed: `4a09cd518f49f55d72cf80bd3388482d2a433ec4`; self-grade commit: `e2d1d2d7afd6bb505c7684074544663b3865ccc1`. The final report commit changes no contract. This is static specification work; native execution is **NOT_RUN**.

All **19/19** families now have ten PASS cells, membership ABSENT, retention PARTIAL. No family is emitting or admitted. All 19 dispositions are `UNDISPOSITIONED`, with `PREPARED_WITHOUT_ADMISSION` and prospective writer roles distinguished. RT still owns the exact retention assignment; separate Event Authority integration owns admission. No product question remains from Q1/Q2.

## Review round 1: findings and responses

- **B1 — fixed (`4a09cd518f49f55d72cf80bd3388482d2a433ec4`).** Q1 was an invalid stop based on UCC-147's historical summary. Verified current canon directly: P-060 at `Plans/Personas.md:3718`, No-project library creation at `Plans/Personas.md:227`, UCC-214 at `Plans/UI_Command_Catalog.md:18105`, CV-365 at `Plans/Contracts_V0.md:24018`, and selected create/delete/export/import/select/update request/result pointers in `Plans/projects_refresh_command_bindings.json`. Those per-command definitions already resolve through `persona_owner_request_v2`, `persona_owner_result_v2` and WorkflowScopeV2 in unchanged `Plans/shared_integration_runtime.schema.json`. Current canon decides Everywhere/settings-home library, read-only Computer mirrors, whole Project versions and real Server application scope with null Project joins. Six exact-family contracts now occupy P-120..125, each with its own SP-672 subsection, closed schema/value, source-result/receipt/identity/consumer/replay/withdrawal and positive/negative oracles. The adjacent historical command-summary precedence repair is at `Plans/UI_Command_Catalog.md:8553`; historical Project schema bytes remain unchanged. Verify with `python3 scripts/pm-dg6b-event-contracts.py` (19 pass) and `python3 scripts/pm-projects-refresh-contracts.py` (pass).
- **B2 — fixed (`4a09cd518f49f55d72cf80bd3388482d2a433ec4`).** Q2 was an invalid stop. Personas section 10 at `Plans/Personas.md:431` and Contracts runtime identity at `Plans/Contracts_V0.md:443` already mandate requested_persona/effective_persona, with `_id` names migration/source-lineage aliases only. The stale select summary now uses canonical naming. P-124 at `Plans/Personas.md:3957`, CV-691 at `Plans/Contracts_V0.md:24554` and the closed `persona_selected`/`persona_selected_resolution` schemas bind the selected v2 result's authenticated owner_result_ref to frozen original resolution and complete runtime snapshot refs/hashes. The pinned selected-whole command schema/source graph remain byte-identical; no hash restamping. No dual canonical fields or historical Settings recomputation. The full checker rejects `_id` aliases, missing frozen evidence, mismatched effective identity/snapshot, and No-project reach violations.
- **B3 — fixed (`e2d1d2d7afd6bb505c7684074544663b3865ccc1`).** The 13 `CURRENT_WRITER` dispositions were incorrect for unadmitted preparations. All 19 rows now use UNDISPOSITIONED with explicit prepared/non-emitting status and a separate prospective role. Membership/retention remain ABSENT/PARTIAL. Exact current quote ranges and file hashes were mechanically verified for every cell and disposition evidence. See `reports/event-authority-20261104/DG6B.self-grade.json:15` and `fix1/regrade-before-after.json`.
- **B4 — fixed (`f3a514b041d4d99ffd7036097d98ae8b6b8db312`).** PLUG-131 at `Plans/Plugins_System.md:4728` now explicitly adopts the existing hook restriction at `Plans/Plugins_System.md:624`: only pre_tool_invoke/pre_attempt_start/pre_node_dispatch may block. Closed payload and stored operation schemas reject observation-only hooks; fixtures and the full checker contain positives for all three allowed hooks and negatives for post_tool_invoke/post_attempt_complete. ATS-335 carries the same obligation. No observation hook gains runtime blocking authority.

## Family grades before and after

P = PASS; A = ABSENT; p = PARTIAL. Every after row is ten P, A for membership, p for retention. This is prepared depth, not complete normative admission.

| Family | Before review fix | Current owner | After |
|---|---|---|---|
| `auth.github.authenticated` | 10 P / 1 A / 1 p | `GAAAF-077` | 10 P / 1 A / 1 p |
| `auth.github.device_code.issued` | 10 P / 1 A / 1 p | `GAAAF-078` | 10 P / 1 A / 1 p |
| `auth.github.disconnected` | 10 P / 1 A / 1 p | `GAAAF-079` | 10 P / 1 A / 1 p |
| `auth.github.failed` | 10 P / 1 A / 1 p | `GAAAF-080` | 10 P / 1 A / 1 p |
| `auth.github.token.polling` | 10 P / 1 A / 1 p | `GAAAF-081` | 10 P / 1 A / 1 p |
| `plugin.hook.blocked` | 10 P / 1 A / 1 p | `PLUG-131` | 10 P / 1 A / 1 p |
| `plugin.hook.error` | 10 P / 1 A / 1 p | `PLUG-132` | 10 P / 1 A / 1 p |
| `plugin.hook.invoked` | 10 P / 1 A / 1 p | `PLUG-133` | 10 P / 1 A / 1 p |
| `plugin.load_failed` | 10 P / 1 A / 1 p | `PLUG-134` | 10 P / 1 A / 1 p |
| `plugin.loaded` | 10 P / 1 A / 1 p | `PLUG-135` | 10 P / 1 A / 1 p |
| `plugin.permission.override` | 10 P / 1 A / 1 p | `PLUG-136` | 10 P / 1 A / 1 p |
| `plugin.tool.collision` | 10 P / 1 A / 1 p | `PLUG-137` | 10 P / 1 A / 1 p |
| `plugin.tool.registered` | 10 P / 1 A / 1 p | `PLUG-138` | 10 P / 1 A / 1 p |
| `persona.created` | Stopped Q1 | `P-120` | 10 P / 1 A / 1 p |
| `persona.deleted` | Stopped Q1 | `P-121` | 10 P / 1 A / 1 p |
| `persona.exported` | Stopped Q1 | `P-122` | 10 P / 1 A / 1 p |
| `persona.imported` | Stopped Q1 | `P-123` | 10 P / 1 A / 1 p |
| `persona.selected` | Stopped Q1/Q2 | `P-124` | 10 P / 1 A / 1 p |
| `persona.updated` | Stopped Q1 | `P-125` | 10 P / 1 A / 1 p |

Aggregate cells before: 130 PASS, 43 ABSENT, 25 PARTIAL, 30 CONFLICT. After: **190 PASS, 19 ABSENT, 19 PARTIAL, zero CONFLICT**. Six earlier Persona CONFLICT stops are replaced by current-canon technical contracts. The 13 earlier preparations retain their twelve cell grades. Native execution remains NOT_RUN for every family.

## Newly authored bindings and per-family search evidence

DL-045 explicitly includes all 19 exact names; the current feature/name/scope premises were re-read. Current P-060, UCC-214, CV-365, selected per-command v2 definitions and canonical runtime identity are reused; generic first-receipt custody and index/checkpoint definitions are adopted by name. No sibling binding supplies any family's contract.

For each of the six Persona families independently, the search covered live top-level `Plans/*.md`, `*.json`, `*.jsonl`, then exact semantic/command/schema owners and SP-278/SP-286/CV-339/SP-291/SP-336/storage_value_registry. Existing source behavior and selected command editions were found. Each exact event payload definition, operation key and named consumer had zero pre-draft definition matches. The full per-family matches, queries, negative counts, selected routes, source hashes and search head are in the pinned `fix1/persona-canon-search.json`. The earlier 13-family `canon-search.json` and `base-source-hashes.json` remain the original evidence; their conclusions were rechecked, not inferred from the survey.

| Family | Exact new producer binding (existing handler) | New consumer/version | New operation value |
|---|---|---|---|
| `persona.created` | `handlers::persona::create / handlers::persona::duplicate (distinct-ID route)` | `consumer.persona_created.history@1.0.0` | `persona_created_operation.v1` |
| `persona.deleted` | `handlers::persona::delete` | `consumer.persona_deleted.history@1.0.0` | `persona_deleted_operation.v1` |
| `persona.exported` | `handlers::persona::export` | `consumer.persona_exported.history@1.0.0` | `persona_exported_operation.v1` |
| `persona.imported` | `handlers::persona::import` | `consumer.persona_imported.history@1.0.0` | `persona_imported_operation.v1` |
| `persona.selected` | `handlers::persona::select` | `consumer.persona_selected.history@1.0.0` | `persona_selected_operation.v1` |
| `persona.updated` | `handlers::persona::update` | `consumer.persona_updated.history@1.0.0` | `persona_updated_operation.v1` |

Each new family independently defines its exact v1 closed payload and stored operation, original source/result/readback custody, compact-JSON/SHA-256 event identity, explicit SP-286/CV-339/SP-291/SP-336 adoption, transition barriers, current authorization/deletion/redaction, coherent restore, compatibility and writer/reader withdrawal. Scope keys are compact JSON `[server_id, scope_partition]` from the original selected WorkflowScopeV2 request, preserving the real owning Server even in application scope. Source operation IDs are durably allocated before effect and recovered from original custody. No source effect is replayed.

Each named consumer independently adopts SP-278 and reuses `projector.storage.event_record_index@1.0.0`, `event_record_index.v2@eig_<generation>` and `event_record_index_checkpoint`; it introduces no additional filtered projection/checkpoint. Persisted tokens are DL-076's nine-field durable projection, with no persisted redb_snapshot_id. `persona_selected_resolution` is closed frozen source evidence referenced by the existing authenticated owner result, not a new command or generic result-root edition.

The earlier 13 producer/consumer/operation bindings remain those in GAAAF-077..081, PLUG-131..138 and the individual SP-670/671 subsections, with B4's exact hook restriction. Their consumers remain `consumer.<exact_name_with_underscores>.history@1.0.0` and operations `<exact_name_with_underscores>_operation.v1`. No operation/profile row outside the hook clarification or six new Persona rows changed.

## Retention, premise checks and open items

All 19 histories and operation values carry `PENDING_RETENTION_DECISION`. Candidate classes are the existing Case L-3 audit/receipt authority, non-authority security diagnostics and ordinary telemetry at storage-plan.md:17399–17417. No class, lifetime, cardinality or deletion rule was selected. Linked bodies and the generic index/checkpoint retain their existing policies. Pending remains materially incomplete and blocks activation.

- DL-045's technical-authoring scope and reserved product decisions remain current. Q1/Q2 failed only because the prior search missed current selected scope and canonical identity; no new owner answer is needed.
- DL-076 still requires nine durable token fields and excludes live redb_snapshot_id; every consumer explicitly adopts it.
- DL-270's SP-336 sync amendment is adopted with current first-receipt custody; superseded extra-sync ordering is not restored.
- No old retention answer was applied or extended. RT assignment, later admission and native proof remain open integration work.
- Auth multi-cohort census pins are unchanged. No exclusion/application record, registry append, admission, Decision Log, governance/frozen-validator edit or main push occurred.

## IDs and shared-file hunks

New: **P-120..P-125, SP-672, CV-691, ATS-336**. Existing lane IDs retained: SP-670/671, CV-690, ATS-335, GAAAF-077..081, PLUG-131..138; B4 edits PLUG-131 and ATS-335. The new owner IDs start 60 above main's P-060. Every fetched origin branch was scanned before allocation; all new IDs were free and shared IDs stay inside the assigned blocks. `fix1/id-scan.json` records maxima and collision-free candidates.

Shared additions: SP-672 has six separate complete family subsections; CV-691 has six exact routes and the frozen-resolution proof; ATS-336 has six family oracle obligations; storage_value_registry appends six operation/profile rows. UCC-147 gets a narrow historical-summary precedence/naming correction. Existing shared rows are neither reordered nor reflowed. The B4 hook payload/value enum is tightened. Shards and index are regenerated, never hand-edited; changed shard owners are confined to the edited source documents/registry. Currentness edition's 15 copied files hash-match the shared source before generation. No governance lock/evidence/graph hash is refreshed.

## Checks

| Command/check | Exit | Result |
|---|---:|---|
| `python3 scripts/pm-dg6b-event-contracts.py` | 0 | 19 families PASS; no admission |
| `python3 scripts/pm-projects-refresh-contracts.py` | 0 | 707 cases; 602 static semantic expectations; source graph PASS |
| `python3 -m unittest discover -s tests -p test_pm_primary_command_catalog.py` | 0 | 19 tests PASS |
| `python3 scripts/pm-github-project-integration.py` | 0 | PASS; admitted_events=0 |
| `python3 scripts/pm-shard-plans.py --generate --config Plans/sharding_config.json` | 0 | PASS |
| `python3 scripts/pm-plan-index.py generate` | 0 | Top-level status=pass |
| `python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json` | 0 | PASS |
| `python3 scripts/pm-plan-index.py validate` | 0 | Parsed top-level status=pass |
| `python3 scripts/pm-storage-profile-check.py` | 1 | Identical 41 pre-existing missing-profile errors; zero added |
| Six new storage rows against registry JSON Schema | 0 | PASS |
| Full DG6B schema meta-validation | 0 | PASS |
| Quote/range/file-hash and disposition verification | 0 | All 19 rows / all 12 cells PASS |
| Unrelated definitions/rows/profiles/pins preservation | 0 | PASS |
| `git diff --check` | 0 | PASS |

No check was weakened. B4 adds its observation-hook negatives; B1/B2 add family-specific source/scope/home/CAS/frozen-resolution negatives and run them through the full checker. Schema/source-graph, registry and command tests are static only. Native crash/receipt/backup/GUI proof remains NOT_RUN. The fixed branch was pushed after each logical commit; this round takes no landing lock and never lands or pushes main.

## Evidence and handoff

- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6B/fix1/persona-canon-search.json` — SHA-256 `5ce6dc75026a50fe11216729a66dcdf5b140583c3514c838433640af4de75ab7`
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6B/fix1/id-scan.json` — SHA-256 `423da811b8ab1c3b4bc82d40531aa6eecbad5a71b25f906e7a047d26a1f4258a`
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6B/fix1/currentness-sha256.json` — SHA-256 `bff89fc88c53bba8f8f10d8c971bbaafcf44533863363b102767089c02d89e9f`
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6B/fix1/contracts-check.json` — SHA-256 `59bed2768407ce45280791dcb6a4787228ef8e39c60750038599b3fd991f97e2`
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6B/fix1/projects-refresh-check.json` — SHA-256 `4962cbe4d503cfbd8b08d838876e64f23c66baf537e1e65923b9061220f6c5b0`
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6B/fix1/github-integration-check.json` — SHA-256 `d6370eef47f2855ff7d3d37acba01579b929f056779c82f58c2fe300215dd9a9`
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6B/fix1/primary-command-tests.txt` — SHA-256 `11103e3d35eec7764f949a5e70dd9302f5f6996442820cf852aa5caf83285f80`
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6B/fix1/generation-exits.json` — SHA-256 `9ce690335ecebd06cd3f08b2d9c096b0b3a7a535c528acc72bbf44b864a71e14`
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6B/fix1/index-validate.json` — SHA-256 `d6dc809202cfef0749ce6e19a65f337d76167483a6698f28bc740df19815c36f`
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6B/fix1/storage-profile-check.json` — SHA-256 `20d617a35312ae64ad5334a8c80d12c87d9e059c9974f737c1242b7474faa7ca`
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6B/fix1/persona-storage-rows-schema.json` — SHA-256 `7851c2c9ec94fecf841b3d49120fc9513c782dce1ad5cc716d99d9df280b17f5`
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6B/fix1/scope-preservation-check.json` — SHA-256 `b83580e7da2fed3868b620224d3def708c41ff9e2ae182fec614284edac92752`
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6B/fix1/regrade-before-after.json` — SHA-256 `8814dd7c56246e98112e0c8507c46d88dfae9c00d8c0a6ed20d9109bf37642c4`
- Prior evidence: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6B/canon-search.json` — SHA-256 `fbe65c695f3a6ef9b1c1e79d47ceee064aed54d402aba9f204dc3e6246d809c1`
- Prior evidence: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6B/base-source-hashes.json` — SHA-256 `56a8ce3109a7bc72045d65222cf1eedbbb3f02ac47a7324a9a9d6d7ee9baeff5`
- Prior evidence: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6B/storage-profile-baseline.json` — SHA-256 `89d47858adcab797033a9feca549351641cfb6a2f6ee5da75a2c62082b3d450b`

Report and self-grade are copied to `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6B/`; fix-round check outputs are under `fix1/`. The sparse fix worktree `/home/sittingmongoose/pm-worktrees/DG6B-fix1` is removed after the final report push. The earlier DG6B worktree belongs to the lead and is untouched. All four findings are fixed; no stopped owner question remains. Retention and admission remain separate integration gates.
