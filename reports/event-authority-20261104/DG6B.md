# DG6B — review round 2, prepared without admission

Branch: `plans/ea-w2-plugins-personas-github-20261104`. Reviewed head: `cbdf6f207a6ec2beb96592617e36dfad5b9c367a`. Contract head assessed: `40ecf4877d9ff212320dd22b87c1c3a4ceac047c`. Worker: DG6B-FIX2, stream E, VM. Native execution is **NOT_RUN**.

All four Astra blocking findings are fixed. All 19 families now have **10 PASS / membership ABSENT / retention PARTIAL**, restoring the 58 cells lowered by the independent review. This is a self-grade of prepared contracts, not admission or native readiness. No family emits until its separate retention and admission gates close.

## Review round 2: findings and responses

- **B1 — fixed (`40ecf4877d9ff212320dd22b87c1c3a4ceac047c`).** All 19 application contracts now use CV-366 exactly: `application@1:{hex(server_id)}:{hex(owner_operation_id)}`. The genuine original Server and owner operation come from independent original-source custody, with no normalization or truncation. Application keys have 19..4111 characters for the declared scalar-ID bounds. Closed operation schemas distinguish application from Project keys; actual Server and selected replay policy are required fields. Event ID algorithms and Project key recipes are preserved; test storage IDs now use the same UUID as the adopted generic checkpoint. Every family tests old family:SHA256 keys, wrong Server, odd/uppercase hex, trailing LF and maximum four-byte Unicode identities. Location: `Plans/storage-plan.md:29515`; exact routes in CV-690/CV-691. Verify with the full checker and the 19 legacy-key / 19 trailing-LF mutation runs.
- **B2 — fixed (`40ecf4877d9ff212320dd22b87c1c3a4ceac047c`).** Every individual SP-670/SP-671/SP-672 subsection selects `replay_policy=dedupe_by_idempotency_key`; normal append/retry rejects `projector_replay_only` as `replay_only_not_appendable`. The oracle validates canonical pm.event.v0 2.0.0 EventRecords, original source/actor/account/Server/scope/receipt joins, original caller semantics and excluded Storage metadata. All eight plugin families have real encoded-Project positives; five auth families remain application-only; all six Personas retain real Project positives. Independent plugin source receipts prevent the exact eight review substitutions. SP-337 tests 16383/16384/16385 byte transport stages, BLAKE3/size/media/byte integrity and durable authorized refs; a schema-valid 16385-byte auth body passes referenced and fails inline. Generic nine-field durable-token storage joins reject mismatches and persisted snapshot IDs; anchored identifiers use absolute end guards, including borrowed checkpoint patterns, with LF negatives. Locations: `Plans/storage-plan.md:29517`, `scripts/pm-dg6b-event-contracts.py:279`, `scripts/pm-dg6b-event-contracts.py:365`. Verify stock full checker (19 rows, 83 positives, 475 negatives) and external full-checker mutations (105 required nonzero exits).
- **B3 — fixed (`40ecf4877d9ff212320dd22b87c1c3a4ceac047c`).** Selected payload, stored operation and frozen resolution permit only thread/run/node/attempt/actor override scope, tied to the corresponding actual runtime lineage. Metadata-only selection uses null scope/owner with no invented execution IDs; application/Project workflow scope is distinct. A coherent tier/tier_id source is rejected, even when payload, frozen body and resolution agree. Five actual lineage-owner positives and a coherent wrong-lineage negative run through the full checker; exact canonical requested/effective names and snapshot protections remain. Location: `Plans/Personas.md:3993`; closed selected/resolution schemas in `Plans/dg6b_event_contracts.schema.json`. The independent review-tier mutation now exits nonzero.
- **B4 — fixed (`40ecf4877d9ff212320dd22b87c1c3a4ceac047c`).** `source.writer_current` is the event-writer fence for every Persona, including export. The independent `definition_writer_current` models the definition-write lease. Export may read an authorized read-only source/Computer mirror with that lease false while its event writer is current; event writer withdrawal always refuses. Both the exact withdrawn-writer review mutation and a distinct read-only export positive run through the full checker. Location: `Plans/Personas.md:3921`; ATS-336 and the export fixture row carry the same independent fence.

No finding is disputed or stopped for Jared. No product choice was made. Retention assignment and family admission remain integration work.

## Family grades before and after

Before is the Astra re-grade, not the rejected prior self-grade. P=PASS, p=PARTIAL, C=CONFLICT, A=ABSENT. After is prepared depth only.

| Family | Before | After | Append + / - |
|---|---|---|---|
| `auth.github.authenticated` | 7 P / 3 p / 1 C / 1 A | 10 P / 1 p / 1 A | 4 / 24 |
| `auth.github.device_code.issued` | 7 P / 3 p / 1 C / 1 A | 10 P / 1 p / 1 A | 3 / 23 |
| `auth.github.disconnected` | 7 P / 3 p / 1 C / 1 A | 10 P / 1 p / 1 A | 3 / 23 |
| `auth.github.failed` | 7 P / 3 p / 1 C / 1 A | 10 P / 1 p / 1 A | 3 / 23 |
| `auth.github.token.polling` | 7 P / 3 p / 1 C / 1 A | 10 P / 1 p / 1 A | 3 / 23 |
| `plugin.hook.blocked` | 7 P / 3 p / 1 C / 1 A | 10 P / 1 p / 1 A | 7 / 26 |
| `plugin.hook.error` | 7 P / 3 p / 1 C / 1 A | 10 P / 1 p / 1 A | 4 / 26 |
| `plugin.hook.invoked` | 7 P / 3 p / 1 C / 1 A | 10 P / 1 p / 1 A | 4 / 26 |
| `plugin.load_failed` | 7 P / 3 p / 1 C / 1 A | 10 P / 1 p / 1 A | 4 / 26 |
| `plugin.loaded` | 7 P / 3 p / 1 C / 1 A | 10 P / 1 p / 1 A | 4 / 26 |
| `plugin.permission.override` | 7 P / 3 p / 1 C / 1 A | 10 P / 1 p / 1 A | 4 / 26 |
| `plugin.tool.collision` | 7 P / 3 p / 1 C / 1 A | 10 P / 1 p / 1 A | 4 / 26 |
| `plugin.tool.registered` | 7 P / 3 p / 1 C / 1 A | 10 P / 1 p / 1 A | 4 / 26 |
| `persona.created` | 7 P / 3 p / 1 C / 1 A | 10 P / 1 p / 1 A | 5 / 25 |
| `persona.deleted` | 7 P / 3 p / 1 C / 1 A | 10 P / 1 p / 1 A | 4 / 25 |
| `persona.exported` | 7 P / 3 p / 1 C / 1 A | 10 P / 1 p / 1 A | 5 / 25 |
| `persona.imported` | 7 P / 3 p / 1 C / 1 A | 10 P / 1 p / 1 A | 4 / 25 |
| `persona.selected` | 6 P / 4 p / 1 C / 1 A | 10 P / 1 p / 1 A | 10 / 26 |
| `persona.updated` | 7 P / 3 p / 1 C / 1 A | 10 P / 1 p / 1 A | 4 / 25 |

Aggregate before: **132 PASS, 58 PARTIAL, 19 CONFLICT, 19 ABSENT**; after: **190 PASS, 19 PARTIAL, 19 ABSENT, zero CONFLICT**. All dispositions remain UNDISPOSITIONED / PREPARED_WITHOUT_ADMISSION. Retention is PENDING_RETENTION_DECISION in every operation row. No registry bytes, retention policy, Decision Log entry or governance lock changed.

## Newly authored bindings, search and premise checks

Each of the nineteen exact-family append/retry/original-source bindings is a newly authored owner contract under DL-045's existing nineteen-name scope. The per-family search independently covered live top-level Plans Markdown/JSON/JSONL, the exact owner, selected command/schema resources, EventRecord, CV-366, SP-337 and SP-278. Existing owner behavior, Server/scope/operation custody, first receipt and generic consumer/checkpoint definitions were reused. The original family-specific replay selection and canonical application key were absent; the thirteen non-Persona fixture rows also lacked independent frozen source inputs. Full matches, negative counts and source hashes are in fix2/canon-search.json. No new feature, consumer, filtered projection, checkpoint owner, retention class or deletion policy is introduced.

Fetched origin/main `16acf7594a3fe8559af89491b895f440b314b99e` was checked directly: CV-366, EventRecord replay rules, Personas section 10, P-060, SP-337 and SP-278 are unchanged from the reviewed branch's reused definitions (six byte comparisons). No premise failed. Prior DL-045 authority and the selected owner behavior still apply; no additional historical answer is applied. Historical shared command/schema/source-graph resources remain byte-identical.

**IDs used:** no new PlanUnit IDs minted. Existing SP-670..672, CV-690..691, ATS-335..336 and P-122/P-124 are amended; the nineteen original family owner IDs remain GAAAF-077..081, PLUG-131..138 and P-120..125. No allocation beyond the lane blocks.

## Standing checks and verification

| Standing check | Result across all nineteen |
|---|---|
| Current-writer replay-only refusal | Exact replay_only_not_appendable negative per family; 19 independent full-run refusal mutations |
| Application idempotency | Exact CV-366 keys, real original Server/operation joins, complete UTF-8 bounds and negative legacy keys |
| Project partition | All 14 eligible families have project~ encoded positives; raw, project: and LF partitions refuse; five auth families refuse Project scope |
| SP-337 transport | All 19 exercise 16 KiB byte stages and authenticated reference integrity/durability; a schema-valid oversized full auth envelope also exercises both paths |
| Identifier LF | Owned schema absolute-end guards; borrowed checkpoint guards without modifying shared owner resources; payload/operation/token/key negatives |
| Retry comparison | Only caller-owned envelope semantics; Storage sequence/observed/persisted metadata changes preserve the digest; correlation change conflicts |
| Checkpoint storage identity | Every adopted durable-token positive joins the actual event payload/source storage UUID; both token and source-selection mismatches refuse |
| Negative exit oracle | 105 separate full-checker bad-positive mutations require nonzero exits and the expected error; unexpected success fails the harness |

The generic token tests exercise the adopted storage-identity boundary, not native source/publication validity. Byte-stage boundary inputs are synthetic before family dispatch; the schema-valid oversized auth envelope separately proves that transport is wired into append validation. Static fixture booleans do not admit native writers. Native crash/receipt/sync/backup/access enforcement remains NOT_RUN.

| Command/check | Exit | Result |
|---|---:|---|
| `python3 scripts/pm-dg6b-event-contracts.py` | 0 | pass; 19 families / 83 positive envelopes / 475 negative envelopes |
| `python3 full-checker-mutations.py (external evidence harness)` | 0 | pass; 105 expected nonzero checker exits, zero unexpected success |
| `python3 scripts/pm-projects-refresh-contracts.py` | 0 | pass; selected Persona command/source graph unchanged |
| `python3 scripts/pm-github-project-integration.py` | 0 | pass; zero admitted events |
| `python3 -m unittest discover -s tests -p test_pm_primary_command_catalog.py` | 0 | 19 tests OK |
| `python3 scripts/pm-shard-plans.py --generate --config Plans/sharding_config.json` | 0 | top-level pass; edited owners only |
| `python3 scripts/pm-plan-index.py generate` | 0 | parsed top-level pass |
| `python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json` | 0 | top-level pass |
| `python3 scripts/pm-plan-index.py validate` | 0 | parsed top-level pass; native readiness remains blocked |
| `python3 scripts/pm-storage-profile-check.py` | 1 | same 41 pre-existing errors; byte-identical result to fix1 |
| `DG6B schema / 19 storage rows / unchanged policies and protected files` | 0 | pass |
| `Current-main premise comparison` | 0 | six canonical reused bindings byte-identical |
| `git diff --check` | 0 | pass |

The storage-profile exit 1 is byte-identical to the prior 41-error baseline; no profile rule was relaxed. No checker rule was weakened. All original negative cases remain enforced. Source changes this round are four Markdown owners (Storage, Contracts, Personas, Testing), the DG6B schema/fixtures, nineteen existing operation value schemas, and the DG6B checker. Generated shard owners match exactly those four documents plus storage_value_registry; all index changes come from the generator. The 15 ignored currentness files were copied and SHA-256 verified before generation. No tests, admission records, registry rows, Decision Log, frozen validators, Spec Lock, auto-decisions or governance evidence were edited.

## Evidence and handoff

All paths below are under `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6B/fix2/`:

- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6B/fix2/checks-manifest.json` — SHA-256 `41bcf63828921348b78603e6117c7563a6452f3f0d97e2e0a420f6d344214343`
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6B/fix2/canon-search.json` — SHA-256 `15480fb2a7e557c8de121d501ffa019c8be9696a4571be3ad4bb0e9e254e5c53`
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6B/fix2/premise-currentness.json` — SHA-256 `e79861a4e8d5368f801d6bd3ea851179e557dc3c2096d1aba090e384e1ee8153`
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6B/fix2/currentness-copy.json` — SHA-256 `ca2d5e7006f07aa13dd0c118f82ffcb29c20a655a7145631160f9516461e7c3c`
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6B/fix2/checker.json` — SHA-256 `4548c6cdb874847b1991ec0913e811cfd732538802e95bbd0aba8a8e6b095794`
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6B/fix2/full-checker-mutations.py` — SHA-256 `015375be719821f4a1263334528f6b25c49bd9c3054700a9b28f2a60851c4397`
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6B/fix2/full-checker-mutations.json` — SHA-256 `b754bcdf9a6d4679dbe86d080770d6a894d1162b15e290ca65dd54afb45cadef`
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6B/fix2/schema-scope-preservation.json` — SHA-256 `538d7dd59828763e44f0154a9c8333eee929a8f47ae6bade49c5ce6d1710e9d8`
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6B/fix2/regrade-before-after.json` — SHA-256 `cd572803155359eb93dab60ab1e600bc4618f8d49d0acbf343209ba925e4e885`
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6B/fix2/index-validate.json` — SHA-256 `338b3f56dec49f3e6dbddbdb0ce2318c4b9d7744e55d46a3562c79694137c6e8`
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6B/fix2/shards-check.json` — SHA-256 `33cb9b8c10db2203344cc688318f015820d90975f38191273efde494a722c738`
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6B/fix2/storage-profile.json` — SHA-256 `20d617a35312ae64ad5334a8c80d12c87d9e059c9974f737c1242b7474faa7ca`

- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6B/fix2/self-grade-validation.json` — SHA-256 `9c78ca71741ee956c2aa332f773be880290c0c142b7dd7ac2dcf56565fc1c540`

Report and self-grade are copied to the DG6B drafts root. Both commits are pushed to the lane branch. The required sparse fix worktree is removed after the report push; no main push, landing lock, admission or governance seal occurs. The lead's earlier worktrees are untouched. Open integration items: retention assignment, individual admission and native proof only.
