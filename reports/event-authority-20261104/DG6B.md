# DG6B — review round 3, prepared without admission

Branch: `plans/ea-w2-plugins-personas-github-20261104`. Input head: `1d515cc6776b48c48252c2a295186338ad98fd94`. Fixed contract head: `ce5bc08d29fb1e28e614182b66de2e2711860317`. Worker: **DG6B-FIX3**, stream E, VM. This is the third and final fix round; no additional review/delegate was started. Native execution: **NOT_RUN**.

Both Astra round-2 blockers are fixed. The prepared-contract self-grade is **190 PASS / 19 PARTIAL / 19 ABSENT / zero CONFLICT**, across nineteen independently checked families. Membership stays ABSENT, retention stays PARTIAL/PENDING_RETENTION_DECISION, and dispositions stay UNDISPOSITIONED. This does not admit a writer or certify native behavior.

## Review round 3: findings and responses

- **B1 — fixed (`ce5bc08d29fb1e28e614182b66de2e2711860317`).** Where: `scripts/pm-dg6b-event-contracts.py:18`, `resolve_schema_graph`, and ATS-335/336. Cause: fixture-driven instance validation never visited some reference branches. Fix: eager resolution of every `$ref` and `$dynamicRef` across the owned schema and four adopted resource documents, with correct resource base URIs and local-only resolution, before instance validation. All 408 stock refs resolve. Nineteen separate full-checker mutations put the exact review dangling ref under the uncovered operation-ID conditional; all exit nonzero with `unresolved_schema_ref`. Five more full-checker mutations put dangling refs in unused definitions, one per selected schema resource; all refuse. No existing check was removed or weakened.
- **B2 — fixed (`ce5bc08d29fb1e28e614182b66de2e2711860317`).** Where: SP-670/671/672's nineteen individually named physical-operation paragraphs, the nineteen operation schemas and existing storage-value rows/profiles, and `scripts/pm-dg6b-event-contracts.py:71` (`store_operation`) / `:86` (`operation_contract`). Cause: externalizing the EventRecord body left a 16,898-byte full operation in a 16,384-byte value. Fix: a closed physical union of the full logical operation and `{schema_id,schema_version,event_type,payload_ref}`; `payload_ref` is exactly `{blake3_id,byte_size,media_type}`, pointing to the complete canonical MessagePack operation, including payload and original effect receipt. Both physical alternatives are measured against 16,384 bytes. Resolve durable/access-authorized bytes, verify BLAKE3/size/media/canonical encoding, validate the closed logical schema, then compare all fields to independent frozen original custody. The exact review value is now a **259-byte reference**; the raw 16,898-byte value is explicitly refused. Full schema-valid logical-operation boundaries are 16,383 / 16,384 inline and 16,385 referenced, independent of the event-body limit. Every real positive operation in all nineteen families is measured; every family has inline/reference, reference-integrity, missing/durability/access, wrong payload/receipt and oversized-physical-value cases. All nineteen oversized full-process mutations refuse.
- **Standing check 10 — fixed (`ce5bc08d29fb1e28e614182b66de2e2711860317`).** Each exact consumer now distinguishes immutable at-write evidence from later live account/plugin/Persona/CAS/selection state. Retained valid-at-write positives survive changed live state. Current reader/access/redaction/body/withdrawal fences still apply; forged, withdrawn, unadmitted-at-write, inaccessible or deleted-body reads refuse. Frozen source flags describe original admission, never a current lease. This reuses existing consumers and retention/deletion owners; it creates no new reader or policy.

No finding is disputed or stopped for Jared. Pending retention and individual admission remain integration items; native persistence/credential/effect/backup proof remains NOT_RUN.

## Every standing check, every family

P = **pass** at the fixed contract head. F = **fixed (`ce5bc08d29fb`)**. No check is open. Each row has at least one independent negative for every check run through the complete CLI in a fresh process; every expected refusal requires both a nonzero exit and its expected error. The retained-history and Storage-metadata retry positives run in the stock full checker.

| Family | 1 Replay | 2 App key | 3 Project | 4 Size/ref | 5 LF | 6 Retry | 7 Token | 8 Exit | 9 Refs | 10 History |
|---|---|---|---|---|---|---|---|---|---|---|
| `auth.github.authenticated` | P | P | P | F | P | P | P | P | F | F |
| `auth.github.device_code.issued` | P | P | P | F | P | P | P | P | F | F |
| `auth.github.disconnected` | P | P | P | F | P | P | P | P | F | F |
| `auth.github.failed` | P | P | P | F | P | P | P | P | F | F |
| `auth.github.token.polling` | P | P | P | F | P | P | P | P | F | F |
| `plugin.hook.blocked` | P | P | P | F | P | P | P | P | F | F |
| `plugin.hook.error` | P | P | P | F | P | P | P | P | F | F |
| `plugin.hook.invoked` | P | P | P | F | P | P | P | P | F | F |
| `plugin.load_failed` | P | P | P | F | P | P | P | P | F | F |
| `plugin.loaded` | P | P | P | F | P | P | P | P | F | F |
| `plugin.permission.override` | P | P | P | F | P | P | P | P | F | F |
| `plugin.tool.collision` | P | P | P | F | P | P | P | P | F | F |
| `plugin.tool.registered` | P | P | P | F | P | P | P | P | F | F |
| `persona.created` | P | P | P | F | P | P | P | P | F | F |
| `persona.deleted` | P | P | P | F | P | P | P | P | F | F |
| `persona.exported` | P | P | P | F | P | P | P | P | F | F |
| `persona.imported` | P | P | P | F | P | P | P | P | F | F |
| `persona.selected` | P | P | P | F | P | P | P | P | F | F |
| `persona.updated` | P | P | P | F | P | P | P | P | F | F |

Checks: (1) replay-only current append refusal; (2) exact CV-366 application keys and genuine original Server; (3) encoded project~ positives/raw/colon/LF negatives for fourteen eligible families, Project refusal for five auth families; (4) SP-337 event and physical-operation limits/authenticated refs; (5) trailing-LF refusal; (6) caller semantics conflict, Storage metadata ignored; (7) token and source-selection storage UUID joins; (8) accepted records cannot certify a failure; (9) all references resolve regardless of visited branch; (10) retained immutable history remains independent of current live state while forged/withdrawn reads refuse.

## Earlier findings replayed

| Review / finding | Replayed regression and result |
|---|---|
| Cycle 1 B1 | All six Persona rows have genuine No-project library and encoded-Project positives; removing each exact prepared family independently fails the complete checker. Current P-060/UCC-214/v2 source routes are preserved. |
| Cycle 1 B2 | Both requested_persona_id and effective_persona_id alias-positive mutations fail; canonical requested_persona/effective_persona and frozen resolution remain. |
| Cycle 1 B3 | CURRENT_WRITER disposition mutations fail for all nineteen, including all thirteen originally prepared families; UNDISPOSITIONED preparation remains distinct from emission. |
| Cycle 1 B4 | Both coherent Block-shaped post_tool_invoke and post_attempt_complete mutations fail; three execution-flow pre-hooks retain positives. |
| Astra round 1 B1 | Legacy application keys and wrong original Server keys fail in all nineteen; full UTF-8 boundary positives remain. |
| Astra round 1 B2 | Replay-only append, Project partition, event/operation refs and all eight exact unrelated-plugin-receipt substitutions fail. Genuine original receipts remain independent inputs. |
| Astra round 1 B3 | Coherent frozen-source tier/tier_id mutation fails; five actual override-lineage positives remain, and coherent wrong-run owner refuses. |
| Astra round 1 B4 | Withdrawn event-writer positives fail, including persona.exported; authorized read-only Computer-mirror export with no definition-write lease passes independently. |

## Family grades before and after

Before uses Astra round 2's independent grade. P=PASS, p=PARTIAL, A=ABSENT. Every after row retains membership A and retention p; its other ten criteria pass at prepared static-contract depth.

| Family | Before | After | Max logical / physical positive operation bytes |
|---|---|---|---|
| `auth.github.authenticated` | 8 P / 3 p / 1 A | 10 P / 1 p / 1 A | 16898 / 16384 |
| `auth.github.device_code.issued` | 9 P / 2 p / 1 A | 10 P / 1 p / 1 A | 6989 / 6989 |
| `auth.github.disconnected` | 9 P / 2 p / 1 A | 10 P / 1 p / 1 A | 6969 / 6969 |
| `auth.github.failed` | 9 P / 2 p / 1 A | 10 P / 1 p / 1 A | 6913 / 6913 |
| `auth.github.token.polling` | 9 P / 2 p / 1 A | 10 P / 1 p / 1 A | 6970 / 6970 |
| `plugin.hook.blocked` | 9 P / 2 p / 1 A | 10 P / 1 p / 1 A | 6901 / 6901 |
| `plugin.hook.error` | 9 P / 2 p / 1 A | 10 P / 1 p / 1 A | 6907 / 6907 |
| `plugin.hook.invoked` | 9 P / 2 p / 1 A | 10 P / 1 p / 1 A | 6882 / 6882 |
| `plugin.load_failed` | 9 P / 2 p / 1 A | 10 P / 1 p / 1 A | 6893 / 6893 |
| `plugin.loaded` | 9 P / 2 p / 1 A | 10 P / 1 p / 1 A | 6907 / 6907 |
| `plugin.permission.override` | 9 P / 2 p / 1 A | 10 P / 1 p / 1 A | 6924 / 6924 |
| `plugin.tool.collision` | 9 P / 2 p / 1 A | 10 P / 1 p / 1 A | 6914 / 6914 |
| `plugin.tool.registered` | 9 P / 2 p / 1 A | 10 P / 1 p / 1 A | 6883 / 6883 |
| `persona.created` | 9 P / 2 p / 1 A | 10 P / 1 p / 1 A | 9463 / 9463 |
| `persona.deleted` | 9 P / 2 p / 1 A | 10 P / 1 p / 1 A | 9463 / 9463 |
| `persona.exported` | 9 P / 2 p / 1 A | 10 P / 1 p / 1 A | 9498 / 9498 |
| `persona.imported` | 9 P / 2 p / 1 A | 10 P / 1 p / 1 A | 9584 / 9584 |
| `persona.selected` | 9 P / 2 p / 1 A | 10 P / 1 p / 1 A | 9898 / 9898 |
| `persona.updated` | 9 P / 2 p / 1 A | 10 P / 1 p / 1 A | 9538 / 9538 |

Aggregate: **170 PASS / 39 PARTIAL / 19 ABSENT before → 190 PASS / 19 PARTIAL / 19 ABSENT after**. No CONFLICT. Evidence in the self-grade is re-located and re-hashed against the fixed contract tree; matching citations alone do not prove native execution.

## Bindings, premises, IDs and scope

Each family's newly authored physical-operation representation and immutable-at-write history oracle is individually stated inside its existing exact SP-670/671/672 subsection and ATS-335/336 row. Per-family search scope and negative evidence are in canon-search.json: all live top-level Plans Markdown/JSON/JSONL at the input head, reusing SP-337/SP-340, original operation/receipt custody and the exact existing consumer. There was no closed operation-reference alternative or separate frozen/live history oracle. No new feature, consumer, filtered projector, checkpoint identity, retention class or deletion choice was made. The existing operation identity and original full-value first-AppendReceipt contract remain unchanged.

Current origin/main at the initial fetch is 16acf7594a3fe8559af89491b895f440b314b99e. Exact fenced-unit comparisons for SP-337, SP-340, SP-278, CV-366, P-060, DL-045 and DL-076 are byte-identical. No historical decision premise failed. All nineteen remain inside DL-045's existing scope.

**IDs used:** zero new IDs minted. Amended existing SP-670..672 and ATS-335..336. Existing exact-family owners GAAAF-077..081, PLUG-131..138 and P-120..125, and route IDs CV-690..691, remain unchanged. All 26 existing lane IDs are retained.

Only six source paths change this round: Plans/storage-plan.md (nineteen exact physical/read bindings), Plans/Automated_Testing_System.md (nineteen exact oracle rows), Plans/dg6b_event_contracts.schema.json, Plans/dg6b_event_contract_fixtures.json, Plans/storage_value_registry.json (nineteen existing rows/profile notes), and scripts/pm-dg6b-event-contracts.py. Generated shard owners are exactly automated_testing_system, storage-plan and storage_value_registry. Index files are regenerated by the official script with all fifteen currentness files hash-matched first. Shared-file edits are confined to SP-670/671/672, ATS-335/336, and the existing nineteen operation rows/profiles; no shared existing owner is reflowed.

No event registry append, admission, Decision Log entry, Spec Lock, auto_decisions, governance evidence, frozen validator, test file, .gitignore, landing lock, main push, mailbox or subagent was used. Initial checks: 17 GB RAM available, 115 GB root disk free; later checks remained above 6 GB RAM and 50 GB disk. The required sparse detached DG6B-fix3 worktree is removed after pushing the report. No temporary branch is created.

## Verification

| Command / suite | Exit | Result |
|---|---:|---|
| python3 scripts/pm-dg6b-event-contracts.py | 0 | top-level pass; 19 families, 408 refs, 86 append positives, 475 append negatives, 233 operation cases, 171 history cases and 95 retry cases |
| full-checker-mutations.py | 0 | 395 independent expected nonzero CLI exits; zero unexpected success |
| owner-scope-mutations.py | 0 | 58/58 independent owner/scope probes |
| identifier-audit.py | 0 | 266/266 payload, operation and reference identifier LF probes |
| history-live-state-audit | 0 | seven later live-state flags independently changed for each of nineteen retained originals |
| python3 scripts/pm-projects-refresh-contracts.py | 0 | top-level pass |
| python3 scripts/pm-github-project-integration.py | 0 | top-level pass; no admission |
| python3 -m unittest discover -s tests -p test_pm_primary_command_catalog.py | 0 | 19 tests OK |
| python3 scripts/pm-shard-plans.py --generate --config Plans/sharding_config.json | 0 | pass; only the three edited source owners |
| python3 scripts/pm-plan-index.py generate | 0 | parsed top-level pass |
| python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json | 0 | parsed top-level pass |
| python3 scripts/pm-plan-index.py validate | 0 | parsed top-level pass |
| python3 scripts/pm-storage-profile-check.py | 1 | byte-identical to round-2's 41-error baseline; no new error |
| Self-grade citations / source preservation / git diff --check | 0 | exact quotations/hashes and protected/base-row preservation verified |

Repository-wide governance reseal/landing gates and native execution are not claimed. Index timestamps are generator-owned; generated files were not hand-edited.

## Retained evidence

All evidence below is outside the repository. Each path is relative to `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6B/fix3/`:

- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6B/fix3/checks-manifest.json` — SHA-256 `7134c63b69151e3398ffee4bccfc2a50df193b8b6159e6276c26aaaaf9f18716`
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6B/fix3/full-checker-mutations.py` — SHA-256 `206837cd1d53e2ea11dcd8cb8dce97fd9429a65502c7dec0c3c078129de689fa`
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6B/fix3/full-checker-mutations.json` — SHA-256 `a903e6d30424dfe045939c2c6d9a34ec0da5db1daf53626725203d40144a8e7b`
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6B/fix3/standing-checks-per-family.json` — SHA-256 `da6a9cf54f4f6b8bcbd0f01f0bb5f053078a3e8d621a005804367dfd15740092`
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6B/fix3/operation-sizes.json` — SHA-256 `160b86b272242dd471bcbed3b0d73cdded974244d7065c8974dec8d1dfb1459a`
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6B/fix3/canon-search.json` — SHA-256 `f8bb1ba4b1130456810564cce4698dd522bf272f18931a76495196df4b7ef328`
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6B/fix3/premise-currentness.json` — SHA-256 `aa19ccbd1bc92536940ebaf77a571f0ad92dd5793f6126ed86c9e6870fe46a6e`
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6B/fix3/currentness-copy.json` — SHA-256 `ca2d5e7006f07aa13dd0c118f82ffcb29c20a655a7145631160f9516461e7c3c`
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6B/fix3/checker.json` — SHA-256 `b04beaea9b92f2433100c78d5833bd50e309505325b15d536fdfa0a31706f647`
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6B/fix3/owner-scope-mutations.py` — SHA-256 `c3f962d14a14da73a8f60a2fb3df94d73ce3335cb3ecef3e50c6e04936c6b8f9`
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6B/fix3/owner-scope-mutations.json` — SHA-256 `4893ba2df883b3551c629107dcaa5f2decd0d3fed75ffa78db6e4c994583e59e`
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6B/fix3/identifier-audit.py` — SHA-256 `db84293f9434aa90e3fa33cf92fd7083286862662b33f67d7324945208143c41`
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6B/fix3/identifier-audit.json` — SHA-256 `c4f05a563c94d63dddf39b886f027d414c1896f5a2d8e79e019015d5c61534fc`
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6B/fix3/history-live-state-audit.json` — SHA-256 `b232dade10193a7e6f41fc2b51f94dc72cc87bbd336d705b967b80e703424243`
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6B/fix3/shards-check.json` — SHA-256 `93fdbc49c3bee9277b2bcbadece09c3b4782b55a969b0f896dfc1b9661049c20`
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6B/fix3/index-validate.json` — SHA-256 `320e66d703d9e38ee3e26acea19959b4da3e59cd8985009cff57ee5256982c4d`
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6B/fix3/self-grade-validation.json` — SHA-256 `86878ed2707a8f7911309122d400cd62915b2efe44c99b61a94fa859d8cfbe42`
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6B/fix3/scope-preservation.json` — SHA-256 `b7e0f3b15078a7eccd0fd7b57192124543edc1421dbcae7b9d6482ae8a99019c`

Report and self-grade are copied to the DG6B drafts root and pushed. Open integration items: retention assignment, per-family admission and native proof. This lane starts no further fix/review cycle.
