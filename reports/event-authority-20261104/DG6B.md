# DG6B — review round 7, prepared without admission

Branch: `plans/ea-w2-plugins-personas-github-20261104`. Input: `6518f9106dc9f362a64bf0de579dd1b17b3979d5`. Fixed code/fixture commit: **`7df14a3015a78aadd39f360df4ea3049016cdbf5`**. Native execution: **NOT_RUN**. All eleven standing checks and all eleven Astra classes apply; this round began after both November 4 additions.

**C7-B1 is fixed by redesigning the oracle/proof path.** Nineteen families recover C12 PARTIAL → PASS: **171 PASS / 38 PARTIAL / 19 ABSENT → 190 PASS / 19 PARTIAL / 19 ABSENT**. Prepared gate: **0/19 → 19/19**. Membership remains ABSENT, retention PARTIAL / PENDING_RETENTION_DECISION, disposition UNDISPOSITIONED.

## Review round 7: findings and responses

| Finding | Where, cause and fix | Verification |
|---|---|---|
| **C7-B1 — fixed (`7df14a3015a78aadd39f360df4ea3049016cdbf5`)** | The old `schema_guard_proof` validated captured schema instances after dropping the append callback. Its nineteen inline integer/boolean cases retained stale source copies. `pm_dg6b_full_oracles.py` now derives copies, transport and identities from valid source models before testing. `complete_append_contract` supplies the complete append/retry/physical-operation path; retained readers retain their separate at-write policy. `pm-dg6b-guard-proof.py` re-invokes the entire callback for every exact keyword/runtime-location removal. Thirty-eight append/history C7 cases are coherent. | 3,262 complete-path guard negatives, 734 removal sets, 128,633 matrix evaluations; zero masked targets, unrelated flips or changed refusals. Nineteen fresh unmodified full checkers pass after restoration. |
| **C7-N1 — integration note retained** | This older lane lacks later main units, including DL-302. No PlanUnit or canonical Markdown changes in round 7. | Preserve later main units during integration; **22 unchanged failures; coverage passes, 7,447 PlanUnits retained.** |
| **C7-N2 — integration note retained** | The existing Storage profile baseline is outside this repair. No profile/registry row changes. | **41 unchanged missing-profile errors.** No unrelated repair or baseline refresh. |
| **C7-N3 — integration note retained** | No canonical Markdown changed, so no derived regeneration or clock restamping was required. | Shard verification runs read-only. |
| **C7-N4 — boundary retained** | Generic SP-278 generation/publication authentication and the unpatterned dataset name remain adopted native prerequisites. | Static full-path success grants neither whole-token authentication nor native admission. |

Implementation locations: `scripts/pm_dg6b_full_oracles.py:19` (`rebuild`), `scripts/pm_dg6b_full_oracles.py:144` (`family_probes`), `scripts/pm-dg6b-event-contracts.py:797` (`complete_append_contract`), `scripts/pm-dg6b-guard-proof.py:170` (`discover`), `scripts/pm-dg6b-guard-proof.py:209` (`run_family`).

No finding is disputed or stopped for Jared. No product, owner, retention or deletion choice is made.

## Rebuilt guard table and method

The shared constructor is used by both the normal family checker and the removal proof. Each proof input has an accepted pre-mutation control, a named source defect and an exported exact typed diff. Source payloads, frozen copies, owner request/result/resolution observations, event identities, keys and physical references are derived **before** the callback. Execution performs no repair and catches no refusal to continue.

A current callback validates original retry custody, the existing append path, caller-semantic retry comparison and physical operation custody in the family's checker order. A recovery callback runs the complete source append plus the actual physical recovery. Historical callbacks use the complete retained-reader path; current writer policy never reaches a historical original.

Runtime removal identifies **function and exact raise line**, not every occurrence of an error string. Schema removal edits exact keywords in the full validator definition, retaining other fields and constraints. The complete original callback then runs again. A second unrelated runtime guard or schema field fails discovery. Duplicate sets merge only when their exact enforcement sites overlap; a common diagnostic does not merge independent predicates. Examples include schema/type-shape/operation copies of one typed field, explicit boolean grants plus their schema types, the same current-writer policy at its repeated sites, and retry identity/semantic immutability.

Each family has an isolated oracle namespace and a full flip/stay matrix across all of its complete-path negatives. Other family namespaces remain unchanged. Every negative in the active family either flips for its own exact removal set or retains its exact stock refusal. Instance-validation results are never memoized. Only immutable schema construction, file parsing and meta-schema checks are cached. Source hashes are checked before/after; a fresh unmodified full checker then passes for that family.

**Table totals:** 734 family-scoped removal sets; 58 distinct runtime sites; 500 exact schema keyword locations; **3,262 complete-path negatives** and the same number of accepted pre-mutation controls; **390 named duplicate sets**; **128,633 full-callback evaluations**. Detached schema proof evaluations: **0**. Unexpected results: **0**.

[DG6B.guard-removal-summary.json](DG6B.guard-removal-summary.json) is the rebuilt table: each row names removed sites/keywords, every flipping negative and its exact stay complement. The full table includes every explicit stay ID and every valid-control diff:

- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6B/fix7/guard-removal-full.json.gz` — SHA-256 `e1b6f91418b29329fdcc93c8d4c189c016190ee9a3cd9e4a73e5140f181cfbf3`; decompressed SHA-256 `614e45977ce443282b4398e2947822a4f2ec41b07f30092a0ffde785e99757ad`.

Earlier schema/byte/helper boundary checks and adversarial malformed-copy regressions remain supplementary evidence. Their counts are not used as independent guard proof. The former detached schema matrix and its 392 boundary-set claim are superseded.

## Family grades and matrix counts

P=PASS, p=PARTIAL, A=ABSENT. Before is cycle 7's independent grade; only C12 changes. Every after grade is prepared static evidence, not admission or runtime certification.

| Family | Before | After | Complete negatives | Guard sets | Duplicate sets | Full evaluations |
|---|---|---|---:|---:|---:|---:|
| `auth.github.authenticated` | 9 P / 2 p / 1 A | 10 P / 1 p / 1 A | 157 | 36 | 19 | 5,652 |
| `auth.github.device_code.issued` | 9 P / 2 p / 1 A | 10 P / 1 p / 1 A | 154 | 34 | 19 | 5,236 |
| `auth.github.disconnected` | 9 P / 2 p / 1 A | 10 P / 1 p / 1 A | 154 | 34 | 19 | 5,236 |
| `auth.github.failed` | 9 P / 2 p / 1 A | 10 P / 1 p / 1 A | 154 | 34 | 19 | 5,236 |
| `auth.github.token.polling` | 9 P / 2 p / 1 A | 10 P / 1 p / 1 A | 155 | 35 | 19 | 5,425 |
| `plugin.hook.blocked` | 9 P / 2 p / 1 A | 10 P / 1 p / 1 A | 157 | 36 | 20 | 5,652 |
| `plugin.hook.error` | 9 P / 2 p / 1 A | 10 P / 1 p / 1 A | 155 | 35 | 19 | 5,425 |
| `plugin.hook.invoked` | 9 P / 2 p / 1 A | 10 P / 1 p / 1 A | 155 | 35 | 19 | 5,425 |
| `plugin.load_failed` | 9 P / 2 p / 1 A | 10 P / 1 p / 1 A | 155 | 35 | 19 | 5,425 |
| `plugin.loaded` | 9 P / 2 p / 1 A | 10 P / 1 p / 1 A | 155 | 35 | 19 | 5,425 |
| `plugin.permission.override` | 9 P / 2 p / 1 A | 10 P / 1 p / 1 A | 155 | 35 | 19 | 5,425 |
| `plugin.tool.collision` | 9 P / 2 p / 1 A | 10 P / 1 p / 1 A | 155 | 35 | 19 | 5,425 |
| `plugin.tool.registered` | 9 P / 2 p / 1 A | 10 P / 1 p / 1 A | 155 | 35 | 19 | 5,425 |
| `persona.created` | 9 P / 2 p / 1 A | 10 P / 1 p / 1 A | 204 | 46 | 23 | 9,384 |
| `persona.deleted` | 9 P / 2 p / 1 A | 10 P / 1 p / 1 A | 207 | 46 | 25 | 9,522 |
| `persona.exported` | 9 P / 2 p / 1 A | 10 P / 1 p / 1 A | 200 | 45 | 20 | 9,000 |
| `persona.imported` | 9 P / 2 p / 1 A | 10 P / 1 p / 1 A | 207 | 46 | 25 | 9,522 |
| `persona.selected` | 9 P / 2 p / 1 A | 10 P / 1 p / 1 A | 221 | 51 | 25 | 11,271 |
| `persona.updated` | 9 P / 2 p / 1 A | 10 P / 1 p / 1 A | 207 | 46 | 24 | 9,522 |

## Standing checks and Astra classes

| Check/class | Fresh verification and preserved boundary |
|---|---|
| **Standing 1–3** | Every family refuses current/retry replay-only, reconstructs complete CV-366 application keys, and preserves encoded Project positives or the five auth Project refusals. |
| **Standing 4–5 / Astra 6** | Complete event bodies, operations and selected resolutions are measured independently; real oversized-inline/referenced controls and patterned LF refusals remain. The independent run measures 91 positive stored-part sets. |
| **Standing 6–7 / Astra 2** | Metadata-only retries preserve caller semantics; independent historical Storage sequence/time substitutions refuse and matching independently selected records pass. UUID/checkpoint/source joins refuse substitutions. |
| **Standing 8–9 / Astra 5** | An accepted complete append cannot satisfy a failure oracle; wrong reasons also fail. Dormant `$ref`/`$dynamicRef` controls refuse during complete preflight, and all 408 stock refs resolve. |
| **Standing 10 / Astra 3** | All retained-policy and compatibility positives survive later live-state changes. Withdrawn, forged, unadmitted, inaccessible and deleted originals still refuse. |
| **Standing 11 / Astra 8** | The table above reruns complete callbacks for exact keyword/runtime-site mutants. All C7 integer/boolean targets flip with only their named duplicate enforcers removed; custody joins stay enabled. |
| **Astra 1, 4, 7** | Forged IDs/families/frozen source copies refuse. Complete retry validates its original; operation/resolution recovery validates original-result custody and typed byte equality. Native owner/frame authentication remains upstream. |
| **Astra 9** | C12's recovery is based on the rebuilt full-callback table. Membership, pending retention and native NOT_RUN are preserved. Current source citations are checked by exact text. |
| **Astra 10 — rechecked all nineteen** | Decimal/exponent integer aliases and leading-zero input refuse. Signed zero has the same accepted integer/bytes/digest as zero. Genuine nullable/integer alternatives are explicitly accepted controls. |
| **Astra 11 — rechecked all nineteen** | String booleans/numbers, null, arrays, nested objects, boolean/integer aliases and actual inline-body type changes refuse at the typed complete path. Source/history/Storage/resolved boolean duplicate sets expose their own targets. Four malformed-positive CLI forms per family produce **76 required exit-1 refusals**, never a successful negative exit. |

Independent current run: **2,399 stock complete-path/standing/type probes**, zero failures. CLI form results and exact refusal tails are in `cli-types.json`. These overlapping regression counts are not added to the guard-matrix count.

## Earlier fixes, authority and IDs

Preservation against `6518f9106dc9f362a64bf0de579dd1b17b3979d5` verifies **38 documented C7 case repairs**, with every other fixture entry unchanged. **47 original predicate/helper functions** are AST-identical; only the existing `run`/`check_append_contract` harnesses change, plus new complete-path helpers. Production payload/operation schemas, all owner prose and the whole-branch authority audit remain byte-identical. This retains all prior B1/B2/B3, S1/S2, custody, replay, reference, size, source/owner and historical fixes.

The authority audit remains [DG6B.authority-audit.json](DG6B.authority-audit.json), SHA-256 `ecbbf476bde5d41437637cfd526549ffbaa29cdb140eceb7bff7196b4faf4038`. Its per-family current-canon searches, negative evidence, exact reused definitions, newly authored bindings and DL-045/DL-076 premise/application pairs remain intact. No new binding or decision is applied in this round. Current integration must retain newer main text; this repair does not claim a rebase.

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

**IDs used on the whole branch:** GAAAF-077..081, PLUG-131..138, P-120..125, SP-670..672, CV-690..691, ATS-335..336 (**26**). **Minted in round 7: zero.**

## Commands, scope and evidence

The serial command log records 19 normal family checks and 19 full guard matrices, all exit 0; every matrix also restores and runs a fresh complete normal checker. `--family <exact-name>` is supported by both tools. No parallel checker jobs or subagents were used. Resource checks enforce the 6 GB available-memory floor; initial worktree creation passed the 50 GB disk rule. Fifteen ignored currentness files were copied and hash-verified for index verification.

| Additional command/check | Exit |
|---|---:|
| `standing-types` | 0 |
| `cli-types` | 0 |
| `preservation` | 0 |
| `projects-refresh` | 0 |
| `github-integration` | 0 |
| `primary-catalog` | 0 |
| `shard-check` | 0 |
| `index-validate` | 1 |
| `storage-profiles` | 1 |
| `diff-check` | 0 |
| `preservation-type-exact` | 0 |

Index validation returns top-level **fail with 22 failures** (coverage passes; 7,447 PlanUnits); Storage profiles return **fail with 41 missing-profile errors**. Both match the cycle-7 input findings. These remain integration items; raw outputs and summaries are retained in `integration-notes.json`. The preservation audit was rerun with typed JSON comparison after ordinary Python equality merged five boolean/integer differences; its exact final count is 38 documented case repairs. No validator, baseline, generated evidence, shard/index, registry/admission, Decision Log, Spec Lock, auto-decisions or governance lock is changed. No new test file or native implementation is added. No main push or landing is performed. Initial read-only mailbox queries preceded reading the no-mail lane brief; no registration, send, reply or later mailbox use occurred.

Evidence/reproduction directory: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6B/fix7/`. `serial-commands.json`, `extra-commands.json`, `standing-types.json`, `cli-types.json`, `preservation.json` and the full guard table are pinned by the final manifest. The report and self-grade are copied to the DG6B drafts root. The worker worktree is removed after its pushed result is recorded.
