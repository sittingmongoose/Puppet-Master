# DG6B — review round 8, prepared without admission

Branch: `plans/ea-w2-plugins-personas-github-20261104`. Input: `0c92d2e91ed2a34391d16b7796de7883c190a2a0`. Fix commit: **`ff6d98d8740eff0df68a44f5d4eca0894c4fdf41`**. Native execution: **NOT_RUN**.

**C8-B1 and C8-B2 are fixed.** All nineteen C12 cells recover PARTIAL → PASS against the cycle-8 independent review: **171 PASS / 38 PARTIAL / 19 ABSENT → 190 PASS / 19 PARTIAL / 19 ABSENT**. Prepared gate: **0/19 → 19/19**. Membership remains ABSENT, retention PARTIAL / `PENDING_RETENTION_DECISION`, disposition UNDISPOSITIONED.

## Review round 8: findings and responses

| Finding | Where, why and fix | Verification |
|---|---|---|
| **C8-B1 — fixed (`ff6d98d8740eff0df68a44f5d4eca0894c4fdf41`)** | `scripts/pm_dg6b_full_oracles.py:191`: deletion's revision negative also changed its independent caller CAS precondition. The removed/result revision now changes alone; `expected_owner_revision` and its payload/request/frozen/inline copies stay integer. A second complete-path target changes only that precondition's type. | `persona.deleted:coherent_python_equal_bool/revision` and `persona.deleted:coherent_python_equal_bool/expected_owner_revision` flip under separate cuts; each peer stays refused. Every repeated type site has remove-one/retain-one proof. |
| **C8-B2 — fixed (`ff6d98d8740eff0df68a44f5d4eca0894c4fdf41`)** | `scripts/pm-dg6b-guard-proof.py:419`: intersection merging erased independent predicates. Groups now use exactly equal predicate cuts. `scripts/pm-dg6b-guard-proof.py:82` splits compound runtime clauses, boolean type/value, tuple comparisons, source-reference fields and keyed custody comparisons. Multi-field schema keywords keep their peers; nullable type alternatives are one allowed-domain site, never two duplicate sites. | 1467 guards; 3,398 complete negatives; 585 duplicate sets; **0 unproved**. 266,192 full complement evaluations; 9,032 duplicate-site evaluations across 1527 sites; all nineteen retained-string + authenticity-denial probes refuse. |

Neither finding is disputed or stopped for Jared. Production checker predicates, physical codec, schemas, fixtures and owner prose are byte-identical to the input. No new number cap or serializer is introduced.

## Guard-removal table and independence

Reproduce from the fix tree, one family at a time (repeat with every exact family name below):

```sh
python3 scripts/pm-dg6b-event-contracts.py --family persona.deleted
python3 scripts/pm-dg6b-guard-proof.py --family persona.deleted --output /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6B/fix8/recheck-persona-deleted.json
```

[DG6B.guard-removal-summary.json](DG6B.guard-removal-summary.json) names every guard, exact runtime clause/schema cut, flipping target, complement selector, logical defect and per-site duplicate proof. The full table records every complement ID, stock refusal, accepted control and exact typed input diff:

- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6B/fix8/guard-removal-full.json.gz` — SHA-256 `85f911e800ef4bd6665bf03b76fd581e13a3e80100bf66e42275f0f49dba4272`; decompressed SHA-256 `56936a103e409f05ab51ef9b1f8b152f4aa11bf77da83e616acc7273a9957134`.

Each negative runs the entire append, retry, recovery or retained-history callback. No captured-instance validator, stage bypass, caught-refusal continuation, instance result cache or detached proof is used. Only immutable schema construction/parsing is cached. Raw and instrumented stock refusals agree for every target. Every mutant reruns every designated negative in its family. Its own targets accept; every other target retains its exact stock refusal. A new raw full family checker passes after restoration. Inputs are hash-pinned before and after each family.

A duplicate set represents one input invariant at repeated sites. Removing each one site alone leaves its target rejected; retaining only that site also rejects it; removing all sites accepts it. The table exports the exact site and all target outcomes for both partial cuts. Intersections do not union sets.

History's `retained`, `authentic`, `admitted_when_written`, reader/withdrawal and access/deletion predicates have separate type and value controls. Boolean type removal retains opposite-boolean refusal. Sol's combined `retained="false"` plus `authentic=false` probe still refuses as `historical_provenance` under the retained-type cut in all nineteen families. It is supplementary two-defect evidence, never counted as a single-defect target.

Malformed general key syntax, a well-formed key of the wrong scope, a valid foreign key, forbidden auth Project scope and an empty original Server have independent cuts. Conditional patterns retain peer restrictions. Server nonempty cuts retain CR/LF refusal. Replay-only denial stays separate from other unsupported current policies. A source partition negative leaves the independently valid physical partition intact. Persona import source fields each get a one-field negative. These restrictions prevent the earlier merged rows from returning through broader schema or runtime sites.

## Family grades and complete matrix

Before is cycle 8's independent grade. P=PASS, p=PARTIAL, A=ABSENT. Only C12 changes. All after grades describe static preparation, never admission or native certification.

| Family | Before | After | Negatives | Guards | Duplicate sets | Matrix evaluations |
|---|---|---|---:|---:|---:|---:|
| `auth.github.authenticated` | 9 P / 2 p / 1 A | 10 P / 1 p / 1 A | 164 | 73 | 29 | 11,972 |
| `auth.github.device_code.issued` | 9 P / 2 p / 1 A | 10 P / 1 p / 1 A | 161 | 71 | 29 | 11,431 |
| `auth.github.disconnected` | 9 P / 2 p / 1 A | 10 P / 1 p / 1 A | 161 | 71 | 29 | 11,431 |
| `auth.github.failed` | 9 P / 2 p / 1 A | 10 P / 1 p / 1 A | 161 | 71 | 29 | 11,431 |
| `auth.github.token.polling` | 9 P / 2 p / 1 A | 10 P / 1 p / 1 A | 162 | 72 | 29 | 11,664 |
| `plugin.hook.blocked` | 9 P / 2 p / 1 A | 10 P / 1 p / 1 A | 164 | 73 | 29 | 11,972 |
| `plugin.hook.error` | 9 P / 2 p / 1 A | 10 P / 1 p / 1 A | 162 | 72 | 28 | 11,664 |
| `plugin.hook.invoked` | 9 P / 2 p / 1 A | 10 P / 1 p / 1 A | 162 | 72 | 28 | 11,664 |
| `plugin.load_failed` | 9 P / 2 p / 1 A | 10 P / 1 p / 1 A | 162 | 72 | 28 | 11,664 |
| `plugin.loaded` | 9 P / 2 p / 1 A | 10 P / 1 p / 1 A | 162 | 72 | 28 | 11,664 |
| `plugin.permission.override` | 9 P / 2 p / 1 A | 10 P / 1 p / 1 A | 162 | 72 | 28 | 11,664 |
| `plugin.tool.collision` | 9 P / 2 p / 1 A | 10 P / 1 p / 1 A | 162 | 72 | 28 | 11,664 |
| `plugin.tool.registered` | 9 P / 2 p / 1 A | 10 P / 1 p / 1 A | 162 | 72 | 28 | 11,664 |
| `persona.created` | 9 P / 2 p / 1 A | 10 P / 1 p / 1 A | 211 | 86 | 34 | 18,146 |
| `persona.deleted` | 9 P / 2 p / 1 A | 10 P / 1 p / 1 A | 215 | 89 | 37 | 19,135 |
| `persona.exported` | 9 P / 2 p / 1 A | 10 P / 1 p / 1 A | 207 | 82 | 31 | 16,974 |
| `persona.imported` | 9 P / 2 p / 1 A | 10 P / 1 p / 1 A | 216 | 90 | 36 | 19,440 |
| `persona.selected` | 9 P / 2 p / 1 A | 10 P / 1 p / 1 A | 228 | 97 | 42 | 22,116 |
| `persona.updated` | 9 P / 2 p / 1 A | 10 P / 1 p / 1 A | 214 | 88 | 35 | 18,832 |

## Earlier findings and standing controls

All eleven standing checks pass in their static scope. All Astra classes were rechecked. The following overlapping suites are reported separately; their counts are not added to the guard matrix.

| Earlier finding/control | Round-8 result |
|---|---|
| Sol C1 B1/B2/B4; Astra 1 B3/B4 | Six Persona preparations, canonical names, actual scope/home/mirror/protected/CAS/reach boundaries, real lineage and hook pre/post behavior rerun in owner/scope and pattern suites. |
| Sol C1 B3 | Nineteen individual CURRENT_WRITER disposition substitutions refuse; no admission or current-writer claim added. |
| Astra 1 B1/B2; standing 1–9 | CV-366 UTF-8/max/malformed keys, source/receipt/envelope joins, encoded Project cases, byte boundaries, independently sized complete values, custody and checkpoint mismatches, failure-exit controls and dormant refs rerun. General runner: 726 probes, 57 required exit-1 processes. Its 42 old diagnostic changes match cycle 8 exactly; no acceptance. |
| Astra 2 B1/B2; Sol C4 B1 | Exact uncovered conditional refs refuse; old 1189 negatives stay refused. Old synthetic size masks remain separate from actual byte-stage proof. The obsolete mixed-operation-plus-ref heuristic still exits 1 as a diagnostic; complete bounded wrappers and authenticated recovery pass. |
| Sol C5 B1/B2 | Exact 57 Storage substitutions refuse; matching independently selected originals and nineteen replay-only retained originals pass. Current append/retry still refuse replay-only. |
| Astra 3 B1/B2/B3/S2 | 274 direct controls; four required malformed-positive process exits; 118 original individual-keyword controls. Exact giant resolution/event/operation physical sizing and corrupt/inaccessible/non-durable references rerun. |
| Astra 3 S1 | Whole-branch authority audit unchanged; source pins reverified. Canonical sources, premise/application pairs and six historical report pins retained. |
| Sol C7 B1; C8 B1/B2 | Complete callbacks retained. Independent deletion types, per-predicate cuts and site-by-site duplicate proofs now discharge check 11 for all nineteen. |
| Pattern/owner scope | 2597 pattern/Persona checks; 58 owner/scope checks; zero failures. |
| Own invariants / standing types | 1528 invariant probes and 2399 complete standing/type probes; zero failures. 76 separate required exit-1 typed-positive processes. |
| Astra 10/10a/11/12 | Numeric/history/format and coherent-copy regressions rerun. Existing integer encoding, at-write policy selection and exact retained timestamp bytes stay unchanged; wrong types/forged recipe or Storage claims refuse. Number-domain adoption remains the shared sweep's job. No new lane-local range or serializer. |

Forged identity/digest/frozen joins refuse; Storage metadata remains independently bound; history survives later live changes while forged/withdrawn/deleted originals refuse; types stay exact; every stock schema ref resolves eagerly; complete stored parts stay bounded; retry/recovery validates original custody. Existing number-domain outcomes, including the inherited RFC 8785 integer-domain refusals in `record_contract` and the coherent-number replay, are retained for the shared CV-1100/SP-1100/SP-1101 sweep. They are not changed or claimed as a new lane-local number rule. Existing native owner/frame and generic SP-278 generation/publication authentication prerequisites remain unexecuted.

## Authority, bindings and IDs

The whole-branch authority record is unchanged: [DG6B.authority-audit.json](DG6B.authority-audit.json), SHA-256 `ecbbf476bde5d41437637cfd526549ffbaa29cdb140eceb7bff7196b4faf4038`. Per-family current-canon searches, negative evidence, exact reused definitions, newly authored bindings and DL-045/DL-076 premise/application pairs remain intact. This round adds no owner binding or product decision and does not claim a rebase onto newer main.

| Family | New semantic / Storage owner | Existing behavior citation; exact-family search hits | New consumer |
|---|---|---|---|
| `auth.github.authenticated` | `GAAAF-077` / `SP-670` | `Plans/GitHub_API_Auth_and_Flows.md:70`; 8 hits | `consumer.auth_github_authenticated.history@1.0.0` |
| `auth.github.device_code.issued` | `GAAAF-078` / `SP-670` | `Plans/GitHub_API_Auth_and_Flows.md:67`; 8 hits | `consumer.auth_github_device_code_issued.history@1.0.0` |
| `auth.github.disconnected` | `GAAAF-079` / `SP-670` | `Plans/GitHub_API_Auth_and_Flows.md:17`; 7 hits | `consumer.auth_github_disconnected.history@1.0.0` |
| `auth.github.failed` | `GAAAF-080` / `SP-670` | `Plans/GitHub_API_Auth_and_Flows.md:74`; 8 hits | `consumer.auth_github_failed.history@1.0.0` |
| `auth.github.token.polling` | `GAAAF-081` / `SP-670` | `Plans/GitHub_API_Auth_and_Flows.md:68`; 8 hits | `consumer.auth_github_token_polling.history@1.0.0` |
| `plugin.hook.blocked` | `PLUG-131` / `SP-671` | `Plans/Plugins_System.md:462`; 8 hits | `consumer.plugin_hook_blocked.history@1.0.0` |
| `plugin.hook.error` | `PLUG-132` / `SP-671` | `Plans/Plugins_System.md:461`; 4 hits | `consumer.plugin_hook_error.history@1.0.0` |
| `plugin.hook.invoked` | `PLUG-133` / `SP-671` | `Plans/Plugins_System.md:460`; 5 hits | `consumer.plugin_hook_invoked.history@1.0.0` |
| `plugin.load_failed` | `PLUG-134` / `SP-671` | `Plans/Plugins_System.md:459`; 7 hits | `consumer.plugin_load_failed.history@1.0.0` |
| `plugin.loaded` | `PLUG-135` / `SP-671` | `Plans/Plugins_System.md:458`; 5 hits | `consumer.plugin_loaded.history@1.0.0` |
| `plugin.permission.override` | `PLUG-136` / `SP-671` | `Plans/Plugins_System.md:243`; 9 hits | `consumer.plugin_permission_override.history@1.0.0` |
| `plugin.tool.collision` | `PLUG-137` / `SP-671` | `Plans/Plugins_System.md:465`; 4 hits | `consumer.plugin_tool_collision.history@1.0.0` |
| `plugin.tool.registered` | `PLUG-138` / `SP-671` | `Plans/Plugins_System.md:464`; 4 hits | `consumer.plugin_tool_registered.history@1.0.0` |
| `persona.created` | `P-120` / `SP-672` | `Plans/Personas.md:82`; 11 hits | `consumer.persona_created.history@1.0.0` |
| `persona.deleted` | `P-121` / `SP-672` | `Plans/Personas.md:82`; 6 hits | `consumer.persona_deleted.history@1.0.0` |
| `persona.exported` | `P-122` / `SP-672` | `Plans/Personas.md:82`; 6 hits | `consumer.persona_exported.history@1.0.0` |
| `persona.imported` | `P-123` / `SP-672` | `Plans/Personas.md:82`; 6 hits | `consumer.persona_imported.history@1.0.0` |
| `persona.selected` | `P-124` / `SP-672` | `Plans/Personas.md:82`; 6 hits | `consumer.persona_selected.history@1.0.0` |
| `persona.updated` | `P-125` / `SP-672` | `Plans/Personas.md:82`; 6 hits | `consumer.persona_updated.history@1.0.0` |


**IDs used on the whole branch:** GAAAF-077..081, PLUG-131..138, P-120..125, SP-670..672, CV-690..691, ATS-335..336 (**26**). **Minted in round 8: zero.**

## Verification, integration and retained evidence

Nineteen family checkers, nineteen full matrices and nineteen restored raw family checkers pass, serially. Disk availability was 92 GB and available RAM 8 GB before worktree creation; every checker enforces the 6 GB floor. Interrupted attempts that stopped below that floor are excluded; only complete reruns are counted. The interruption log is retained in `fix8/resource-interruptions.json`. Fifteen currentness files were copied and hash-verified. No canonical Markdown changed, so no derived regeneration or clock restamping was required; shard verification remains read-only.

Index validation: top-level **fail, 23 errors**, coverage passes and 7,447 PlanUnits remain. Storage profiles: **41 missing-profile errors**. Storage matches the reviewed 41-error baseline. Index retains all 22 reviewed failures and adds one `stale_generated_index_artifact` for `Plans/.plan_index/node_readiness_report.json`; the copied ignored currentness edition differs from round 7. The exact difference and currentness hashes are in `fix8/integration-notes.json`. This is recorded as integration staleness; no readiness artifact or governance lock is regenerated. Preserve newer main text during integration. No governance artifact, baseline, admission/registry row, Decision Log, test file or native implementation changes. No mail, subagent, main push, landing, browser or server was used.

All round-8 reproduction scripts and results live under `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6B/fix8/`. Earlier round-7 report, self-grade, table and evidence remain under `fix7/`. The report, self-grade and summary table are copied to the DG6B drafts root; the compressed complete table is copied there as well. The worker worktree is removed with a literal path after its branch is pushed.
