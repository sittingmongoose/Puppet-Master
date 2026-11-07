# DG6B — Sweep part 2A: guard tables on the gated guard tool

Branch `plans/ea-w2-plugins-personas-github-20261104`; part 2A start `e0fe6998d81eae3b416f6c5d3436572e9dee3b33`; gated tool merge `4842b41e5a` (tool `004bdedd63`, eleven files, unchanged); implementation and evidence head **`4cc3643606ec666a7503b0015c7c50a1a99c7410`**; delivery head in the external `HEAD.txt`. No rebase onto main this round. Native execution: **NOT_RUN**.

**All 19 families keep 9 PASS / 2 PARTIAL / 1 ABSENT (171 / 38 / 19).** Part 2A closes S1 (guard tables on the shared tool). `positive_negative_oracles` stays PARTIAL because S2 (shared number rule) and S3 (timestamp formats) are part 2B; `retention` stays PARTIAL (PENDING_RETENTION_DECISION); membership stays ABSENT. Prepared READY: 0/19. Sol and Astra review the lane once, after part 2B.

## Sweep part 2A: findings and responses

| Item | Disposition and change | Where | Verify |
|---|---|---|---|
| **Take the gated tool** | Merged `004bdedd632d9463f3535190a6ed5772338cdce1` with `--no-ff` as `4842b41e5a`: exactly the eleven tool files, no conflict, none edited. | `scripts/pm_guard_isolation*.py`, `scripts/guard-isolation/README.md`, `Plans/guard_isolation_traps.json`, GUARDTOOL reports | `git diff --stat 4842b41e5a^1 4842b41e5a` lists 11 files; `git diff 4842b41e5a HEAD -- scripts/pm_guard_isolation.py scripts/pm_guard_isolation_dg6b_example.py` is empty. |
| **S1 — guard tables** (fixed, `94eb20e014`, `4cc3643606`) | Every product refusal of the checker is one named row in one of **76 phase tables (173 rows, at most seven each)**, reached only through `require()`. Derivation computes observations (schema error counts, canonical-byte digests via `digest_of`, recomputed identities and expected values) and decides nothing. Or-chains are one row per predicate; a later predicate that would also hold for an input an earlier row refuses carries the earlier rows' pass condition as applicability (retry RY02/RY03, reference RA02–RA04, Persona home PH02, update CAS UC01/UC02, creation CR04, override OO03, EJ07, PR02, PR08), so each defect has exactly one refusing row and the rows together refuse what the original chain refused. The DG6B example's seven retained-history flags are table `history_flags` unchanged in substance. The checker asserts each factory's require order and that no `raise` outside the table remains (harness `KeyError`/`AssertionError` only). | `scripts/pm-dg6b-event-contracts.py:31` (`TABLE_PHASES`), `:80` (`require`), `:98` (`table_order_errors`), `:115` (`refusal_sites`); row spec `scripts/pm-dg6b-table-generate.py`; generated `scripts/pm_dg6b_table_*.py` | `python3 scripts/pm-dg6b-table-generate.py scripts --check` (no stale or extra module); every family CLI `pass`. |
| **S1 — retired machinery** (fixed, `94eb20e014`) | Removed the AST/mutation proof `scripts/pm-dg6b-guard-proof.py` (its `guard_inventory`, `run_family`, cut grouping and reported inventory). Proof is now the gated tool over the tables. | — | `git show 94eb20e014 --stat` |
| **S1 — adapter and runner** (fixed, `73e9bb854e`) | `pm_dg6b_guard_suites` replays the complete checker per family under its recorder: each asserted negative (`expect_failure`: Probe corpus, fixture negatives, round-9 witnesses) supplies the observation of its first refusing phase, targeted at the refusing row; every passing evaluation outside a negative is a control. It re-runs every negative with only its refusing row cut (complete-boundary flip, lane evidence). `pm-dg6b-guard-tables.py` runs the tool once per (phase, family) and copies its credit. | `scripts/pm_dg6b_guard_suites.py:59` (`Collector`), `:116` (`collect`), `:245` (`suite_for`); `scripts/pm-dg6b-guard-tables.py` | `python3 scripts/pm-dg6b-guard-tables.py --family <f> --out <dir> --pool <collect dir>` (one process per family). |
| **Two-defect negatives the tool reported** (fixed, `e0de248c4a`) | The lane matrix reported the 42 `invalid_project_partition_*` stage fixtures (14 non-auth families × 3): each put the same invalid value in the source scope partition and the record partition, so PA01 and PA02 both refused. Each is now two single-defect cases, `/scope` and `/record`. No other negative refused two rows. | `Plans/dg6b_event_contract_fixtures.json` (`stage_cases`) | Lane matrix: 0 problems in every suite; tool: no masked negative. |
| **Missing negatives for unproved rows** (fixed, `94eb20e014`) | Before round 9, 484 row×family cells (75 distinct rows) and 10 of the 12 shared fence rows had no negative of their own. `pm_dg6b_round9_cases` adds one witness per row and family, each from a valid case of its own family with one source change (derived identities, keys and stored carriers re-derived), each asserted to be refused **by its own row** (`expect_failure(..., row=...)`): frozen Storage instance, redaction/scope kind/project/run/node/attempt envelope copies, record partition, payload types and original Server (relational helpers), retry from another Server, operation lookup ref, carrier ref digest/size, undecodable and schema-invalid decoded operations, request-scope schema and copy, Project home rules, every owner request/result/home copy, creation source, update CAS, empty-lineage override and `tier_id` owner, resolution lineage/field copies and carrier integrity, schema reference/metaschema fences and the eight preparation fences. While building them, the RR06 witness exposed a fault in the first draft of the restructure (payload and result field names collided, so the row compared a value with itself); it was fixed before the commit and the generator now refuses a self-join. | `scripts/pm_dg6b_round9_cases.py:41` (`family_cases`), `:142` (`persona_cases`), `:287` (`shared_cases`) | Every suite: `rows_without_negative` empty. |
| **Rows a family cannot reach** (declared, `73e9bb854e`) | Five rows are structurally unreachable on some families' own paths; their suites take one recorded negative of the same table from a named donor family, listed separately (35 cells): SC01 for the 13 non-Persona families (their closed source adapter embeds the same strict WorkflowScopeV2, so AS01 decides it); RY02 and OS01 for the 6 Persona families (the Persona scope key holds the Server, so equal event IDs imply equal keys; Persona identity reads the Server from the typed payload scope); PA01 and EJ07 for the 5 auth families (application scope fixes partition `app` and `project_id` null). | `scripts/pm_dg6b_guard_suites.py:189` (`BORROW`), `:207` (`borrow`) | Per-family table below (borrowed column); `summary.json` `borrowed` per suite. |
| **Clauses removed as already decided** (`94eb20e014`) | Not repeated because an earlier row decides the same predicate on the same values; each is commented in place: record_contract's second WorkflowScopeV2 pass without formats (SC01 runs it with formats); the operation carrier's schema_id/schema_version/event_type header join (OP01 and OG01 bind both copies to the same per-family constants); the operation and resolution carrier `media_type` joins (OP01/RT01 const plus TI03); the Persona request `scope` copy in the request loop (identical to PC02); override owner presence and override membership (persona.selected payload schema). No other refusal was removed. | `scripts/pm-dg6b-event-contracts.py:401`, `:407`, `:568`, `:590`, `:653`, `:874`; `scripts/pm-dg6b-table-generate.py:250`, `:256`, `:272`, `:421` | Reviewer check against the named schema clauses in `Plans/dg6b_event_contracts.schema.json`. |
| **Behaviour changes, none weaker** | A non-hex resolved body and trailing bytes after a MessagePack value used to crash (`ValueError`/`ExtraData` with no code); both now refuse `payload_ref_integrity`. The preparation operation binding compares canonical JSON text (exact typed) instead of Python equality. A metaschema-invalid selected schema now refuses `invalid_schema` instead of raising `SchemaError`; an unresolved reference refuses `unresolved_schema_ref` without the reference text appended. Within `persona_semantic`, writer is checked before access and the storage-instance copy before the other copies (same codes for every single defect). Unknown adapter kinds and fixture stages are harness `KeyError`s. | `scripts/pm-dg6b-event-contracts.py:278` (`resolve_schema_graph`), `:367` (`resolved_body`), `:381` (`decoded_body`), `:811` (`transport`), `:1079` (`preparation_contract`) | Every family CLI pass with unchanged expected codes. |
| **Astra-4 coherent bad positives** (re-run) | The seven coherent bad positives inserted as `append_valid` still make the unchanged family CLI exit nonzero, refused through a table row: plugin.hook.error payload_schema, plugin.hook.invoked payload_schema, persona.selected payload_schema, persona.created protected_identity, persona.deleted protected_identity, persona.imported protected_identity, persona.updated protected_identity. | external `verify/counterexample-cli.json` | 7/7 pass. |
| **S2 — shared number rule** | Part 2B (needs NUMRULE gates). | Listed below | — |
| **S3 — timestamp formats** | Part 2B. Interim only (below). | Listed below | — |

**Disputed:** none. **Stopped for Jared:** none. **IDs used:** zero new. No `Plans/*.md` changed, so no shard or index regeneration.

## Guard-table result

The gated tool ran **763 suites** (one per phase table per family, plus 4 shared-only tables): **1640/1640 row cells proved, 0 failed suites**, 2575 distinct single-row negatives (35 borrowed cells, declared above). 173 distinct rows in 76 tables. Lane matrix problems: 0. Collection findings: 0. Credit is the tool's own `rows[].proved`.

Each cut swaps one table row to always-pass; the tool runs every control and negative, checks the guard-call trace against the uncut baseline and runs a fresh restoration. Own negatives must be accepted after the cut ("flips"); every other negative must keep its exact refusal ("stays").

| Checker | Tables | Rows | Row cells proved | Unproved (reason) | Cut: own flips / own | Cut: stays | Unrelated changes | Masked | Borrowed cells |
|---|---:|---:|---:|---|---:|---:|---:|---:|---:|
| Shared fences: strict JSON, schema references, preparation | 4 | 12 | 12/12 | none | 12/12 | 28 | 0 | 0 | 0 |
| Schema occurrences (one row per validated subject) | 19 | 19 | 268/268 | none | 272/272 | 0 | 0 | 0 | 13 |
| `append_contract`: replay policy, retry | 2 | 5 | 95/95 | none | 283/283 | 528 | 0 | 0 | 6 |
| `record_contract`: grants, frozen source, scope, partition, identity, envelope, body, read token | 11 | 28 | 518/518 | none | 777/777 | 1777 | 0 | 0 | 16 |
| `semantic`: auth key scope, retry payload, hook block, cadence | 4 | 4 | 20/20 | none | 21/21 | 0 | 0 | 0 | 0 |
| SP-337 byte stages: inline, reference, integrity, operation and resolution carriers | 9 | 21 | 291/291 | none | 701/701 | 1746 | 0 | 0 | 0 |
| `history_contract`: retained flags, Storage join | 2 | 11 | 209/209 | none | 247/247 | 1140 | 0 | 0 | 0 |
| `persona_semantic`: Persona relational rules and owner copies | 25 | 73 | 227/227 | none | 262/262 | 727 | 0 | 0 | 0 |

Per family (every phase table the family reaches; shared witnesses of the same table ride with each family):

| Family | Suites | Row cells proved | Own-witness cells | Borrowed cells | Distinct negatives | Failed suites |
|---|---:|---:|---:|---:|---:|---|
| `auth.github.authenticated` | 36 | 74/74 | 71 | 3 | 115 | none |
| `auth.github.device_code.issued` | 36 | 74/74 | 71 | 3 | 110 | none |
| `auth.github.disconnected` | 36 | 74/74 | 71 | 3 | 110 | none |
| `auth.github.failed` | 36 | 74/74 | 71 | 3 | 110 | none |
| `auth.github.token.polling` | 37 | 75/75 | 72 | 3 | 111 | none |
| `persona.created` | 49 | 113/113 | 111 | 2 | 168 | none |
| `persona.deleted` | 51 | 109/109 | 107 | 2 | 165 | none |
| `persona.exported` | 46 | 102/102 | 100 | 2 | 149 | none |
| `persona.imported` | 51 | 111/111 | 109 | 2 | 165 | none |
| `persona.selected` | 58 | 132/132 | 130 | 2 | 209 | none |
| `persona.updated` | 50 | 113/113 | 111 | 2 | 167 | none |
| `plugin.hook.blocked` | 35 | 73/73 | 72 | 1 | 122 | none |
| `plugin.hook.error` | 34 | 72/72 | 71 | 1 | 136 | none |
| `plugin.hook.invoked` | 34 | 72/72 | 71 | 1 | 136 | none |
| `plugin.load_failed` | 34 | 72/72 | 71 | 1 | 118 | none |
| `plugin.loaded` | 34 | 72/72 | 71 | 1 | 118 | none |
| `plugin.permission.override` | 34 | 72/72 | 71 | 1 | 118 | none |
| `plugin.tool.collision` | 34 | 72/72 | 71 | 1 | 118 | none |
| `plugin.tool.registered` | 34 | 72/72 | 71 | 1 | 118 | none |
| `shared` (JSON, references, preparation) | 4 | 12/12 | 12 | 0 | 12 | none |

Every row of every table and its per-family cut result are in the per-suite tool reports (`tool/<family>/<phase>__<family>.json`, gzipped when over 20 KB) and `aggregate.json` under the evidence directory.

**Phase boundary.** Tables are extracted observation boundaries (tool boundary `synthetic`). The complete path is the full checker, which reaches every refusal through the same rows. As lane evidence beyond the tool, each negative was re-run through its whole call with only its refusing row cut: of 10362 negative calls (the 12 shared fence witnesses re-run in each of the 19 family passes), 6320 are accepted. The rest are refused later by a distinct invariant that watches the same source fact: a wrong-typed flag cut at its adapter row is also not exactly True/False (SG01/SG02, HF01–HF07, HS01, RA03/RA04, DW01, PM01/PM02, PF01, PK01, PV01, PX01); a payload refused by PS01 is the same invalid body inline (EP01, PJ01); a physical operation refused by OP01 still differs from the decoded or expected operation (OG01, OF01/OF02, OJ01); an owner-schema defect also breaks a copy join (PC01, QK03, QK09, RR04, RR07); direct relational-helper probes reach identity and retry rows (ID01, SO01, SS01); and a cut adapter row leaves derivation reading a wrong-typed field (`derivation_requires_cut_row`). Counts per cut row are in `verify/flips.json.gz`. None reaches another row of its own table, so each stays a single-row negative for the tool.

**Shared tool limits met.** One module per table, at most seven rows, each prescanned from its text before use. The only `NonGuard` is the `return g.Case(table, check, context)` plumbing return. The first full run found one static stop: CR06 used `list.count` on a list display, which the purity scan does not certify; it is now one chained comparison (`4cc3643606`), and the evidence run is at that head.

**What Astra keeps finding, probed for part 2A.** (1) Identities and digests are recomputed in derivation and compared by rows (ID01, IK01, TI01, OF05, RF05, OJ01, RJ01); forged copies are the negatives. (2) Storage sequence and times stay outside `semantic_record`; RY03 compares the caller semantic digest, HS04 the full canonical record bytes against the independent Storage record. (3) `history_contract` has no replay-policy row, so retained replay-only history stays readable; withdrawn, foreign and forged history refuse at HF/HS rows. (4) Every former `same_value` join is a `digest_of` exact-typed-bytes comparison; joins that used `!=` keep it. (5) R02 walks every `$ref` including unused definitions; the new dangling-definition witness refuses. (6) Inline body (IS01), physical operation (OV01) and resolution (RZ01) sizes are measured in canonical bytes. (7) Retry validates the original first; operation recovery runs the complete append first; history validates the original record and Storage. (8) Masked negatives: tool `masked` empty on every row; complete-boundary flips reported above. (9) The oracle cell stays PARTIAL. (11) Wrong-type flags refuse at their adapter rows before any truth-value row; integers are exact `int`. (10, 10a, 12) are part 2B.

**Timestamp fields — interim only.** My own review of the timestamp fields is interim only (pm7-build, 2026-11-05 16:50Z); it is not a certification. DG6B passes an explicit `date-time` checker (`utc_datetime`) at every schema occurrence that has timestamps. A probe of it at this head: it accepts `2026-11-04T12:00:00Z`, fractional seconds and lowercase `t`; it refuses lowercase `z`, `+00:00`, a missing zone, a space separator, a trailing LF, `2026-02-30`, `23:59:60` and non-strings; **it accepts `24:00:00Z`** (Python 3.14 `fromisoformat` reads it as the next midnight). Part 2A adds no date-time rule and changes no timestamp field.

## Part 2B items

- **S2 — shared number rule (CV-1100/1101, SP-1100/1101, shared helper).** `scripts/pm-dg6b-event-contracts.py:158` (JSON Schema `integer` redefined as exact `int`), `:455`–`:458` (`identity` preimage: `revision` through `json.dumps`), `:909` (record digest through `rfc8785.dumps`, the 2**53 semantic-digest question), `:127` `digest_of` over `binding_bytes` (`scripts/pm_event_index_binding.py:51`–`:53`: uint64 range, floats unencodable; Storage uint64 boundaries), `:486` (cadence `previous + 5`); tables `scripts/pm_dg6b_table_persona_update_cas.py:36` (UC06 order), `pm_dg6b_table_persona_delete_cas.py:16` (DC01), `pm_dg6b_table_retry.py:16`–`:24` (RY01–RY03), `pm_dg6b_table_cadence.py:16` (CD01); witnesses `scripts/pm_dg6b_full_oracles.py:47`–`:48` (`rebuild` preimage) and `:265`–`:268` (decimal/exponent `producer_sequence_id`); owner identity paragraphs `Plans/storage-plan.md:29624` (SP-670, one per family thereafter), SP-671 at `:29736`, SP-672 at `:29949`.
- **S2 — authenticated at-write recipe selection for history.** `scripts/pm-dg6b-event-contracts.py:417` `history_contract` validates a retained original with the current recipes (`record_contract`); no recorded recipe edition selects them (item 10a).
- **S3 — timestamp formats (interim only, above).** `scripts/pm-dg6b-event-contracts.py:488`–`:495` (`FORMAT`, `utc_datetime`: lowercase `t` and `24:00:00Z` accepted; retained `+00:00` and lowercase-`z` spellings refused regardless of their at-write recipe); `Plans/event_record.schema.json:212` (`date-time` for occurred/observed/persisted); the 40 `date-time` occurrences in `Plans/dg6b_event_contracts.schema.json` (every family `ts`); `scripts/pm_dg6b_table_envelope_a.py:24` (EJ03 joins `occurred_at_utc` to `ts` by string, spelling-sensitive); `scripts/pm-dg6b-event-contracts.py:1003` (retry Storage-time fixture values).

## Family grades before and after

P=PASS, Q=PARTIAL, A=ABSENT. Before is the part 1 self-grade at `e0fe6998d8`; after is this part 2A self-grade. Every cell is carried; `positive_negative_oracles` cites the tables and states the proved cells.

| Exact family | Before → after |
|---|---|
| `auth.github.authenticated` | 9P / 2Q / 1A → 9P / 2Q / 1A |
| `auth.github.device_code.issued` | 9P / 2Q / 1A → 9P / 2Q / 1A |
| `auth.github.disconnected` | 9P / 2Q / 1A → 9P / 2Q / 1A |
| `auth.github.failed` | 9P / 2Q / 1A → 9P / 2Q / 1A |
| `auth.github.token.polling` | 9P / 2Q / 1A → 9P / 2Q / 1A |
| `persona.created` | 9P / 2Q / 1A → 9P / 2Q / 1A |
| `persona.deleted` | 9P / 2Q / 1A → 9P / 2Q / 1A |
| `persona.exported` | 9P / 2Q / 1A → 9P / 2Q / 1A |
| `persona.imported` | 9P / 2Q / 1A → 9P / 2Q / 1A |
| `persona.selected` | 9P / 2Q / 1A → 9P / 2Q / 1A |
| `persona.updated` | 9P / 2Q / 1A → 9P / 2Q / 1A |
| `plugin.hook.blocked` | 9P / 2Q / 1A → 9P / 2Q / 1A |
| `plugin.hook.error` | 9P / 2Q / 1A → 9P / 2Q / 1A |
| `plugin.hook.invoked` | 9P / 2Q / 1A → 9P / 2Q / 1A |
| `plugin.load_failed` | 9P / 2Q / 1A → 9P / 2Q / 1A |
| `plugin.loaded` | 9P / 2Q / 1A → 9P / 2Q / 1A |
| `plugin.permission.override` | 9P / 2Q / 1A → 9P / 2Q / 1A |
| `plugin.tool.collision` | 9P / 2Q / 1A → 9P / 2Q / 1A |
| `plugin.tool.registered` | 9P / 2Q / 1A → 9P / 2Q / 1A |

171 PASS / 38 PARTIAL / 19 ABSENT / 0 CONFLICT → the same totals. Every cited quote was re-verified at its line in this tree; the two quotes the restructure removed (`def same_value`, the inline protected-ID test) now cite `digest_of` and row PM03.

## Commands and evidence

Heavy checkers ran one at a time with at least 10 GB available (the tool MemoryGate paused below 10; each step waited below 11). PM7 work was not waited on or touched. Commits: `4842b41e5a` (tool merge), `e0de248c4a`, `94eb20e014`, `73e9bb854e`, `4cc3643606`, then the report commit. Evidence: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6B/sweep-p2a/` (SHA-256 of every file in `MANIFEST.json`).

| Command | Exit | Outcome |
|---|---:|---|
| `git merge --no-ff 004bdedd63` | 0 | clean; 11 tool files |
| `python3 scripts/pm-dg6b-table-generate.py scripts --check` | 0 | 76 phases, 173 rows, no stale or extra module |
| `python3 scripts/pm-dg6b-event-contracts.py --family <f>` ×19 (head `4cc3643606`) | 0 ×19 | 19/19 `pass`, 11.2–20.6 s, peak RSS 150 MB (`verify/checker/`) |
| `python3 scripts/pm-dg6b-guard-tables.py --family <f> --out tool/<f> --pool pool` ×19, then `--family shared` | 0 ×20 | 763 suites `PASS`; `tool/<family>/summary.json`, `aggregate.json` |
| collect pass `--collect-only --no-flips` ×19 (donor pool) | 1 ×19 | expected: without the pool the declared borrowed rows have no negative |
| counterexample CLIs (`verify/counterexample-cli.json`) | 0 | 7/7 refused through a table row |
| complete-boundary flips (`verify/flips.json.gz`, lane evidence) | 0 | 10362 negative calls: 6320 accepted, 4042 refused later (reasons above) |
| `python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json` | 0 | `pass`, 3139 shards, 0 failures |
| `python3 scripts/pm-plan-index.py validate` (origin/main `5cbb92a5aa`) | 1 | top-level `fail`, 30 failures: 21 `plan_unit_removal_ledger_invalid` in existing ledgers (carried from part 1) and 9 `plan_unit_removed_without_ledger_decision` for DL-333, DL-335..340, DL-349 and UCC-230, which main added after this branch's base; none names a DG6B file. Integration rebase owns them. |

---

# DG6B — Sweep part 1 (earlier report, unchanged): prepared without admission

Branch: `plans/ea-w2-plugins-personas-github-20261104`. Input: `5cc7c461d08d993c0aa4c0bdeb6ccd4e98131468`. Rebased main: `e42ce235b4711325ced818c777f070c3ee0d7952`. Fix commit: **`9c10e2c4b17cb1263b88825a81b0a305ecfcb8f0`**. Native execution: **NOT_RUN**.

**B1, B2 and B3 are fixed in part 1. All nineteen family checkers pass. No family is READY: the shared number rule, guard-table tool and subsequent Sol/Astra reviews remain required.** Membership stays ABSENT, retention PARTIAL / PENDING_RETENTION_DECISION, disposition UNDISPOSITIONED.

## Sweep part 1: findings and responses

| Item | Response / exact location | How to verify |
|---|---|---|
| **Deck 2 — none assigned** | No product answer is extended. Landed DL-045 (`Plans/Decision_Log.md:560`) limits technical definitions to “already specified behavior”; landed DL-400 (`:4390`) requires three batch landings with review. These remain boundaries, not new decisions. | `owner-premises.json`; no Decision Log or registry diff from rebased main. |
| **B1 — fixed (`9c10e2c4b17cb1263b88825a81b0a305ecfcb8f0`)** | `scripts/pm_dg6b_full_oracles.py:259` and `:369` add separate requested/effective account negatives for every family. Only one EventRecord account changes; retained Storage bytes authenticate that exact envelope. Existing product comparisons remain intact. | Nineteen full CLIs; 38 single-comparison removals flip only their own append/history pair, keep every other corpus negative at its original refusal and make the formerly surviving full suite fail. `account-regressions.json`. |
| **B2 — fixed (`9c10e2c4b17cb1263b88825a81b0a305ecfcb8f0`)** | `Plans/dg6b_event_contracts.schema.json:1854` / `:7546`; payload/operation enums and selected logical/inline frozen-resolution enums bind 18 existing hook spellings and seven selection sources. The three stored-operation registry copies match. Invalid `tool.before`/`manual` inputs and every dependent byte/digest/size copy are repaired. | Full CLIs for hook.error, hook.invoked and selected; two coherent unknown/retired values plus five wrong types per family. All 18 hook spellings and seven sources have append and exact-byte retained positives. The three original bad-positive CLIs exit 1. |
| **B3 — fixed (`9c10e2c4b17cb1263b88825a81b0a305ecfcb8f0`)** | `scripts/pm-dg6b-event-contracts.py:15` / `:383` verifies the original target against section 6’s nine protected core IDs independently of `protected_id=false`. Update’s source identity changes coherently with its target. | Four mutation families × nine complete protected-ID negatives; removing only that guard accepts each target while protected=true still refuses. Four original coherent assistant bad-positive CLIs exit 1. Protected selection/export and their retained originals remain positive controls. |

No item is disputed or stopped for a new Jared choice. No new hook, selection source, reserved-ID policy, command, retention assignment or PlanUnit ID is introduced.

## Family grades before and after

Before is Astra 4, which supersedes the round-8 author/Sol 9 claims. P=PASS, p=PARTIAL, A=ABSENT. C4/C9 recover nine cells. C12 remains PARTIAL in all nineteen pending complete shared isolation, even though the concrete B1 missing negatives now exist.

| Family | Before | After | Complete negative cases | Prepared state |
|---|---|---|---:|---|
| `auth.github.authenticated` | 9 P / 2 p / 1 A | 9 P / 2 p / 1 A | 168 | NOT_READY — part 2 |
| `auth.github.device_code.issued` | 9 P / 2 p / 1 A | 9 P / 2 p / 1 A | 165 | NOT_READY — part 2 |
| `auth.github.disconnected` | 9 P / 2 p / 1 A | 9 P / 2 p / 1 A | 165 | NOT_READY — part 2 |
| `auth.github.failed` | 9 P / 2 p / 1 A | 9 P / 2 p / 1 A | 165 | NOT_READY — part 2 |
| `auth.github.token.polling` | 9 P / 2 p / 1 A | 9 P / 2 p / 1 A | 166 | NOT_READY — part 2 |
| `plugin.hook.blocked` | 9 P / 2 p / 1 A | 9 P / 2 p / 1 A | 168 | NOT_READY — part 2 |
| `plugin.hook.error` | 7 P / 4 p / 1 A | 9 P / 2 p / 1 A | 173 | NOT_READY — part 2 |
| `plugin.hook.invoked` | 7 P / 4 p / 1 A | 9 P / 2 p / 1 A | 173 | NOT_READY — part 2 |
| `plugin.load_failed` | 9 P / 2 p / 1 A | 9 P / 2 p / 1 A | 166 | NOT_READY — part 2 |
| `plugin.loaded` | 9 P / 2 p / 1 A | 9 P / 2 p / 1 A | 166 | NOT_READY — part 2 |
| `plugin.permission.override` | 9 P / 2 p / 1 A | 9 P / 2 p / 1 A | 166 | NOT_READY — part 2 |
| `plugin.tool.collision` | 9 P / 2 p / 1 A | 9 P / 2 p / 1 A | 166 | NOT_READY — part 2 |
| `plugin.tool.registered` | 9 P / 2 p / 1 A | 9 P / 2 p / 1 A | 166 | NOT_READY — part 2 |
| `persona.created` | 8 P / 3 p / 1 A | 9 P / 2 p / 1 A | 224 | NOT_READY — part 2 |
| `persona.deleted` | 8 P / 3 p / 1 A | 9 P / 2 p / 1 A | 228 | NOT_READY — part 2 |
| `persona.exported` | 9 P / 2 p / 1 A | 9 P / 2 p / 1 A | 211 | NOT_READY — part 2 |
| `persona.imported` | 8 P / 3 p / 1 A | 9 P / 2 p / 1 A | 229 | NOT_READY — part 2 |
| `persona.selected` | 8 P / 3 p / 1 A | 9 P / 2 p / 1 A | 239 | NOT_READY — part 2 |
| `persona.updated` | 8 P / 3 p / 1 A | 9 P / 2 p / 1 A | 227 | NOT_READY — part 2 |

**Totals: 162 PASS / 47 PARTIAL / 19 ABSENT → 171 PASS / 38 PARTIAL / 19 ABSENT. Prepared READY: 0/19 → 0/19.** All self-grade source quotes, line ranges and hashes are refreshed against the rebased source tree.

## B1 guard-removal table

Each row represents two independent predicates, never one duplicate set. For requested_account_ref and effective_account_ref separately, `account_custody/FIELD` and `history_account_custody/FIELD` flip. The other account’s two negatives and every other `family_probes` negative keep their exact stock refusal. The original full CLI corpus also detects either removal. This is a focused replay of Astra’s B1 experiment, not a complete assertion inventory.

| Family | Requested-account targets flip | Effective-account targets flip | Other negatives staying rejected per cut |
|---|---:|---:|---:|
| `auth.github.authenticated` | 2 | 2 | 166 |
| `auth.github.device_code.issued` | 2 | 2 | 163 |
| `auth.github.disconnected` | 2 | 2 | 163 |
| `auth.github.failed` | 2 | 2 | 163 |
| `auth.github.token.polling` | 2 | 2 | 164 |
| `plugin.hook.blocked` | 2 | 2 | 166 |
| `plugin.hook.error` | 2 | 2 | 171 |
| `plugin.hook.invoked` | 2 | 2 | 171 |
| `plugin.load_failed` | 2 | 2 | 164 |
| `plugin.loaded` | 2 | 2 | 164 |
| `plugin.permission.override` | 2 | 2 | 164 |
| `plugin.tool.collision` | 2 | 2 | 164 |
| `plugin.tool.registered` | 2 | 2 | 164 |
| `persona.created` | 2 | 2 | 222 |
| `persona.deleted` | 2 | 2 | 226 |
| `persona.exported` | 2 | 2 | 209 |
| `persona.imported` | 2 | 2 | 227 |
| `persona.selected` | 2 | 2 | 237 |
| `persona.updated` | 2 | 2 | 225 |

The pre-sweep `DG6B.guard-removal-summary.json` and earlier tables are historical evidence of their pinned corpus only. The local proof script is byte-identical to the reviewed head; its completeness claims are not carried forward. Whole-lane inventory and per-site duplicate proof remain S1.

## Part 2 items

1. **S1 — proof machinery / shared tool:** `scripts/pm-dg6b-guard-proof.py:36` (`guard_inventory`, still unused), `:395` (`run_family`), `:419–426` (cut grouping), `:479–508` (reported inventory). Adopt the accepted shared `pm_guard_isolation.py`, expose named guard predicates/tables and reconcile every production/schema assertion with its witness. DG6B is the port’s worked example; no checker restructuring or local proof-engine repair was attempted here.

2. **S2 — number domains and historical recipes:** `scripts/pm-dg6b-event-contracts.py:298`, `:786`, `:260`; `scripts/pm_dg6b_full_oracles.py:50–55`; each SP-670/671/672 identity paragraph. Adopt NUMRULE CV-1100/1101, SP-1100/1101 and the shared helper after acceptance. Cover 2**53 semantic-digest mismatch, JSON number spellings, Storage uint64 boundaries and unforgeable at-write recipe choice. Add no local number cap/serializer; do not cap Storage at 2**53, normalize physical floats or erase signed zero.

3. **S3 — formats and retained spellings:** `scripts/pm-dg6b-event-contracts.py:337` / `:260`, EventRecord date_time_string and every family ts. Bind allowed UTC spellings and authenticated at-write format recipe; preserve exact retained `+00:00` and lowercase-z bytes when their original recipe permits them. Keep malformed/forged alternatives refused. Existing narrowing remains explicitly open; historical bytes are not normalized.

## Verification and integration

19 complete family CLIs pass, exercising **3531** complete negatives. The focused B1 replay checks 38 comparison removals and 76 flipping targets, with unchanged complements and 38 detected weakened full suites. B3 covers 36 protected targets. All seven original Astra coherent bad-positive CLIs now exit 1. These counts overlap and are not added as independent coverage.

| Check | Exit | Result |
|---|---:|---|
| `astra4-regressions` | 0 | see output |
| `shard-generate` | 0 | pass |
| `index-generate` | 0 | pass |
| `shard-check` | 0 | pass |
| `index-validate` | 0 | pass |
| `projects-refresh` | 0 | pass |
| `github-integration` | 0 | pass |
| `primary-command-catalog` | 0 | see output |
| `storage-profile` | 1 | fail; 41 reported errors |
| `diff-check` | 0 | see output |

Shard regeneration changes only the lane’s eight canonical owners: automated_testing_system, contracts_v0, github_api_auth_and_flows, personas, plugins_system, storage-plan, storage_value_registry, ui_command_catalog. Conflicted generated snapshots were discarded during the rebase and regenerated once from final canon; no shard/index was hand-merged. The copied ignored currentness edition has 15 byte/hash-verified files. Index validation’s actual status is recorded above; no global governance PASS or seal is claimed. Storage-profile errors are compared with the same checker reading only the pinned-main registry; the ordered error lists match exactly.

Main advanced during checking to `d5ec2f70c0d69c469796eea9b9cfdae30f281f42`; its only delta from the actual rebase pin is the upstream plan-migration snapshot and landing baseline. No owner, schema, fixture, registry or checker changed. Those governance paths are not edited or refreshed by this lane.

Existing source/frame/token native authentication, native CAS/crash/restart execution, admission and pending retention remain separate obligations. No governance baseline, Spec Lock, evidence bundle, frozen validator, registry admission, Decision Log or test-file edit was made.

Only `persona_semantic` changes among the production checker’s 51 functions. Identity, physical encoding, history and timestamp functions are unchanged. Recurring classes 1–9/11/12 remain covered by the full stock suites; B1 adds custody coverage, B2 closes owner-domain contradictions, and B3 closes protected-ID classification. Numeric/format recipe issues and complete independence proof remain S2/S3/S1 rather than being labelled closed.

## Authority, IDs, resources and evidence

No newly authored binding in this sweep. The nineteen existing exact DL-045 preparations, their own semantic/Storage units, consumer names, per-family searches and original premise evidence remain in branch history and DG6B.authority-audit.json at its recorded historical input. Rebase preserves current main, including Persona P-060/UCC wording. Current hook catalog/alias, Persona source enum, protected-ID and DL-045/DL-400 premises are rechecked in owner-premises.json.

**New IDs: zero.** Whole-lane IDs remain GAAAF-077..081, PLUG-131..138, P-120..125, SP-670..672, CV-690..691 and ATS-335..336 (26). The two briefing memory files were absent at their named Nas1 paths; no allocation was needed, and currentness copying/hash verification was performed directly.

Initial Nas1 resources: 11 GB available RAM, 495 GB free disk. All checker starts preserve the 6 GB RAM floor. Checks run serially within this worker; heavy index/proof jobs wait for other heavy checkers. Small peer checks may run concurrently. The initial conservative wait was narrowed after observing 30 MB peer checks; the memory floor was never lowered. No mail, subagent, main push, landing lock, browser or server. The worktree and temporary environment are removed after the lane push.

Retained evidence: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6B/sweep-p1/`. Reproduction scripts and dependency versions are retained there; recreate the literal worktree at this branch to replay. Raw outputs remain outside the repository; only this report, refreshed self-grade and compact checks summary are committed.

| Evidence path (under sweep-p1) | SHA-256 |
|---|---|
| `input-pins.json` | `981b1d5c44d898fb1f53903b43ca3634379ed7da927b08313e76b3e574357b63` |
| `family-checks.json` | `2dd8731bf9d4dc307ff642c888d74e6d24b2bad403ae14addff5aa76fa9a7b6a` |
| `account-regressions.json` | `393fef51b0d084e6e026982e67e69407de34a9baab412385039dcdd1c437632b` |
| `protected-regressions.json` | `2289b260d5172429569c2c8fff70e8a344e32723c8b73e16de856591b65ede94` |
| `counterexample-cli.json` | `7fb8eb3be79a450be26d5793a5e24e182195cec81bed85024ec8a1d6ef2ee67d` |
| `owner-premises.json` | `4059454d0db663145f4abde139523c4cbcaa5e3b9cab33e40cf5f1a71cbdb705` |
| `preservation.json` | `67e85ab20b865c476aa5d32f7ed0b7c2e52e4f72761bacc5ca9395849dc3c03a` |
| `derived-scope.json` | `f20746fca7cf330b12c985867d066261b14fa0c52e88b3d440ed23a644f03c51` |
| `verification.json` | `d28ed981f4036e173f497e1789770a49fe2bb583d1e059412f932bdc650596b8` |
| `storage-profile-baseline.json` | `bd2670420bad9104c197c4bd30395cfd2335c43150c277f7bad52b6e600d0582` |
| `grade-transition.json` | `eb5ebeafc6064ad7a697d0b618285588c4a0d1e8af67f9cc59ea84407fd2ad80` |
