# DX-FIX5 — Executor guard witnesses and coherent negatives

Branch: `plans/ea-w2-executor-20261104`. Reviewed head: `d9c24f28305648a813aca9ea4ef2d39371bf49a8`. Graded code/fixture head: `2de4b3704aa75707f271a4d9467cfbd963491152`. A following report-only commit preserves these graded bytes; `drafts/DX/head.txt` records the final pushed head. This is round 5, the first of the two authorized technical rounds following the extra round. Prepared without admission; native execution remains **NOT_RUN**.

**Outcome:** F10/F11 are fixed in the finite static model. All 43 formerly unproved sites now have an authored witness, an exact prerequisite-predicate control, or a necessary named duplicate-set proof. All eight real-mask rows are repaired. The seven formerly unproved mask rows are resolved through exact prerequisite tests or complete equality proofs. The raw matrix retains same-defect rejections; those are reported below and are not relabelled full-capture acceptance.

**Grades:** 159 PASS / 17 PARTIAL / 16 ABSENT → 175 PASS / 1 PARTIAL / 16 ABSENT. Every membership cell remains ABSENT. `plan.decomposition_degraded` retention remains PARTIAL and `PENDING_RETENTION_DECISION`; no retention choice, anchor, expiry or deletion behavior was selected.

## Review round 5: findings and responses

| Finding | Response at 2de4b3704aa75707f271a4d9467cfbd963491152 | Verification |
|---|---|---|
| F1 | Fixed previously; retained. Complete original presence/mirror and real attempt/pre-attempt distinction remain. | 37/37 independent probes. Both reviewed source-mismatch-attempt_id episode-record witnesses are preserved exactly. |
| F2 | Fixed previously; retained. Actual/normalized remediation generation and ceilings remain bound. | 8/8 independent probes; source-join negatives now keep both normalized generations coherent. |
| F3 | Fixed previously; retained. Classified budgets, original failure identity, provenance and timing remain. | Six original probes, current classified-policy suite, and 24 named timed-policy sensitivity controls match. |
| F4 | Fixed previously; retained. Integer 0..100 bounds remain at both schema score positions and original scores. | Coherent schema/capture controls, physical boolean copies and unchanged hashes verified. |
| F5 | Fixed previously; retained. Current append/retry/replay refuse compatibility-only policy before effects/receipt return. | All 48 fresh/retry/replay traces still return replay_only_not_appendable. Read-only retained originals use a separate closed policy guard. |
| F6 | Fixed previously; retained. Exact MessagePack inline limit and addressed-body custody remain. | All sixteen families retain boundary/reference positives and independent corruption/custody controls. Media-domain cases agree in descriptor and pack; checksum cases retain the true logical bytes. |
| F7 | Fixed previously; retained. Exact-end timestamps and strict source clocks remain. | All original 22 coherent LF captures, isolated timestamp-schema controls and append traces still reject; timestamp/trace sensitivity matches 236/236. |
| F8 | Fixed previously; retained. Whole-document reference admission and resource freshness remain. | Both CLIs refuse every reachable/dormant missing-ref mutation; same-process resource controls and proof-schema refusals match. |
| F9 | Named repairs retained. Successor/post-state captures, scheduler bool, classified-policy controls and forged backoff-original timing remain coherent. | Removing only illegal successor makes exactly sixteen negatives accept and the complete CLI fail with exactly sixteen mismatches; other source negatives stay rejected. |
| F10 | Fixed. Authored all 29 supplied controls; extracted eleven unchanged prerequisite predicates; added loader, map-key, timezone, retry-domain/header controls and named equality/presence proofs. | Guard table, exact IDs, current source lines, restored-member tests and remaining rejection reasons are in DX.guard-removal.json and the pinned full matrix. |
| F11 | Fixed. Rebuilt the eight real-mask rows and resolved all seven unproved rows. Source mirrors authenticate original reads; owner/dependency copies agree; optional restore/wake cases use valid inactive/empty seeds. | Rebuilt source controls carry executable seed_changes/defect_changes; the full CLI validates the seed before its negative. All 181 source-join cases accept under precisely sem:281 + sem:283 with sem:301 active. |
| Astra class 3 | Fixed an additional finite-model defect found by the required own probe: history previously reached the writer-only policy refusal. Current-writer guards are unchanged. Historical validation accepts the retained current or replay-only policy and refuses foreign policy. | Sixteen before-refusals recorded; 128 permanent retained-policy/disclosure cases added, including valid replay-only history, foreign policy and six disclosure refusals per family. |
| N1 | Existing integration item, unchanged: the runtime-vocabulary test lacks the current GUI phrase. | FinalGUISpec and the named test are byte-identical to reviewed head; 9 tests, one known failure. |
| N2 | Existing shared-schema integration item, unchanged: execution_unit_context reaches missing goal_body_custody.schema.json#/$defs/body_application_v1 through shared application-workflow schemas. | DX's payload/proof reference gate is not a repository-wide shared-schema clearance. The supplied node.started dependency extra-property negative is now permanent. |

**Jared-only retention cell, unchanged:** Should `plan.decomposition_degraded` use `RP-OPERATIONAL-2555D@1.0.0` as operational history with an approved original durable decomposition-result terminal anchor, or `RP-AUTHORITY-INDEFINITE@1.0.0` as authority/source lineage? SP-506 retains both candidates and the proposed anchor unselected; stronger holds/custody remain.

## Family grades before and after

Counts are PASS / PARTIAL / ABSENT against cycle-5 independent review. All sixteen oracle cells become PASS for the finite static model. Fifteen families pass as prepared; decomposition retains its separate retention hold. Membership and native boundaries are unchanged.

| Family | Before P/~ /A | After P/~ /A | Verdict |
|---|---|---|---|
| `attempt.completed` | 10 / 1 / 1 | 11 / 0 / 1 | PASS_AS_PREPARED_WITHOUT_ADMISSION |
| `attempt.started` | 10 / 1 / 1 | 11 / 0 / 1 | PASS_AS_PREPARED_WITHOUT_ADMISSION |
| `node.blocked` | 10 / 1 / 1 | 11 / 0 / 1 | PASS_AS_PREPARED_WITHOUT_ADMISSION |
| `node.completed` | 10 / 1 / 1 | 11 / 0 / 1 | PASS_AS_PREPARED_WITHOUT_ADMISSION |
| `node.started` | 10 / 1 / 1 | 11 / 0 / 1 | PASS_AS_PREPARED_WITHOUT_ADMISSION |
| `node.unblocked` | 10 / 1 / 1 | 11 / 0 / 1 | PASS_AS_PREPARED_WITHOUT_ADMISSION |
| `plan.decomposition_degraded` | 9 / 2 / 1 | 10 / 1 / 1 | RETENTION_PENDING_JARED |
| `remediation.resolved` | 10 / 1 / 1 | 11 / 0 / 1 | PASS_AS_PREPARED_WITHOUT_ADMISSION |
| `remediation.spawned` | 10 / 1 / 1 | 11 / 0 / 1 | PASS_AS_PREPARED_WITHOUT_ADMISSION |
| `run.completed` | 10 / 1 / 1 | 11 / 0 / 1 | PASS_AS_PREPARED_WITHOUT_ADMISSION |
| `run.graph_integrity_failed` | 10 / 1 / 1 | 11 / 0 / 1 | PASS_AS_PREPARED_WITHOUT_ADMISSION |
| `run.node_backoff_expired` | 10 / 1 / 1 | 11 / 0 / 1 | PASS_AS_PREPARED_WITHOUT_ADMISSION |
| `run.node_backoff_started` | 10 / 1 / 1 | 11 / 0 / 1 | PASS_AS_PREPARED_WITHOUT_ADMISSION |
| `run.node_ready` | 10 / 1 / 1 | 11 / 0 / 1 | PASS_AS_PREPARED_WITHOUT_ADMISSION |
| `run.node_retry_scheduled` | 10 / 1 / 1 | 11 / 0 / 1 | PASS_AS_PREPARED_WITHOUT_ADMISSION |
| `scheduler.pass` | 10 / 1 / 1 | 11 / 0 / 1 | PASS_AS_PREPARED_WITHOUT_ADMISSION |

## Whole-lane guard-removal proof

**3227 authored negatives; 172 sites; 160 singleton-negative sites plus one singleton trace-schema site; 11 duplicate-only sites covered by eight primary named sets; zero unproved sites.** Every negative is evaluated under every single-site deletion: **555044 evaluations**. All 230 traces are evaluated under each site: **39560 evaluations**. Eight additional trace mutants are detected. The 20 nonempty necessary named sets include supplemental schema/presence/type overlaps.

The table uses the review's stable site IDs and records the current source line separately. Removing a guard means disabling exactly that enumerated require/raise/schema boundary in memory, with lazy predicate evaluation and every other explicit guard active. No require-wide bypass is used. Every negative is rerun under every single-site mutant; every trace is also rerun. A schema call is an aggregated boundary, not proof for every schema keyword. The independent timestamp/schema and reference-mutation suites cover their specified boundaries separately.

Schemas, proofs and reference results are cached only for immutable matrix inputs. Production CLIs and same-process resource-freshness mutations run separately without that cache. Full-capture missing-object/parser exceptions remain recorded as exceptions. Their exact prerequisite predicate/schema refusals are tested before dependent indexing/parsing, as the review requests; those pure-boundary flips are explicitly distinguished from full-capture acceptance.

| Review site (current line) | Flipping negatives | Still rejected | Proof |
|---|---:|---:|---|
| `sem:95:require` (31) | 1 | 3226 | SINGLE_NEGATIVE |
| `sem:118:require` (35) | 1 | 3226 | SINGLE_NEGATIVE |
| `sem:150:require` (39) | 1 | 3226 | SINGLE_NEGATIVE |
| `sem:166:require` (43) | 4 | 3223 | SINGLE_NEGATIVE |
| `sem:179:require` (47) | 1 | 3226 | SINGLE_NEGATIVE |
| `sem:200:require` (51) | 1 | 3226 | SINGLE_NEGATIVE |
| `sem:205:require` (55) | 1 | 3226 | SINGLE_NEGATIVE |
| `sem:209:require` (59) | 3 | 3224 | SINGLE_NEGATIVE |
| `sem:268:require` (64) | 19 | 3208 | SINGLE_NEGATIVE |
| `sem:308:require` (68) | 1 | 3226 | SINGLE_NEGATIVE |
| `sem:319:require` (72) | 1 | 3226 | SINGLE_NEGATIVE |
| `sem:45:require` (93) | 1 | 3226 | SINGLE_NEGATIVE |
| `sem:82:require` (130) | 0 | 3227 | NAMED_DUPLICATE_SET |
| `sem:83:require` (131) | 0 | 3227 | NAMED_DUPLICATE_SET |
| `sem:historical-policy:require` (137) | 16 | 3211 | SINGLE_NEGATIVE |
| `sem:99:require` (153) | 0 | 3227 | NAMED_DUPLICATE_SET |
| `sem:109:require` (163) | 16 | 3211 | SINGLE_NEGATIVE |
| `sem:110:require` (164) | 49 | 3178 | SINGLE_NEGATIVE |
| `sem:112:require` (166) | 16 | 3211 | SINGLE_NEGATIVE |
| `sem:113:require` (167) | 1 | 3226 | SINGLE_NEGATIVE |
| `sem:115:require` (169) | 0 | 3227 | NAMED_DUPLICATE_SET |
| `sem:116:require` (170) | 32 | 3195 | SINGLE_NEGATIVE |
| `sem:120:require` (174) | 16 | 3211 | SINGLE_NEGATIVE |
| `sem:121:require` (175) | 48 | 3179 | SINGLE_NEGATIVE |
| `sem:122:require` (176) | 16 | 3211 | SINGLE_NEGATIVE |
| `sem:124:require` (178) | 16 | 3211 | SINGLE_NEGATIVE |
| `sem:125:require` (179) | 16 | 3211 | SINGLE_NEGATIVE |
| `sem:126:require` (180) | 16 | 3211 | SINGLE_NEGATIVE |
| `sem:127:require` (181) | 16 | 3211 | SINGLE_NEGATIVE |
| `sem:128:require` (182) | 16 | 3211 | SINGLE_NEGATIVE |
| `sem:129:require` (183) | 32 | 3195 | SINGLE_NEGATIVE |
| `sem:148:require` (202) | 1 | 3226 | SINGLE_NEGATIVE |
| `sem:158:require` (212) | 3 | 3224 | SINGLE_NEGATIVE |
| `sem:159:require` (213) | 3 | 3224 | SINGLE_NEGATIVE |
| `sem:160:require` (214) | 21 | 3206 | SINGLE_NEGATIVE |
| `sem:163:require` (217) | 2 | 3225 | SINGLE_NEGATIVE |
| `sem:165:require` (219) | 0 | 3227 | NAMED_DUPLICATE_SET |
| `sem:172:require` (226) | 1 | 3226 | SINGLE_NEGATIVE |
| `sem:173:require` (227) | 9 | 3218 | SINGLE_NEGATIVE |
| `sem:176:require` (230) | 6 | 3221 | SINGLE_NEGATIVE |
| `sem:180:require` (234) | 1 | 3226 | SINGLE_NEGATIVE |
| `sem:182:require` (236) | 18 | 3209 | SINGLE_NEGATIVE |
| `sem:183:require` (237) | 21 | 3206 | SINGLE_NEGATIVE |
| `sem:184:require` (238) | 21 | 3206 | SINGLE_NEGATIVE |
| `sem:186:require` (240) | 2 | 3225 | SINGLE_NEGATIVE |
| `sem:191:require` (245) | 3 | 3224 | SINGLE_NEGATIVE |
| `sem:211:require` (264) | 2 | 3225 | SINGLE_NEGATIVE |
| `sem:216:require` (269) | 1 | 3226 | SINGLE_NEGATIVE |
| `sem:218:require` (271) | 1 | 3226 | SINGLE_NEGATIVE |
| `sem:220:require` (273) | 45 | 3182 | SINGLE_NEGATIVE |
| `sem:222:require` (275) | 26 | 3201 | SINGLE_NEGATIVE |
| `sem:224:require` (277) | 2 | 3225 | SINGLE_NEGATIVE |
| `sem:226:require` (279) | 1 | 3226 | SINGLE_NEGATIVE |
| `sem:227:require` (280) | 1 | 3226 | SINGLE_NEGATIVE |
| `sem:232:require` (285) | 8 | 3219 | SINGLE_NEGATIVE |
| `sem:234:require` (287) | 2 | 3225 | SINGLE_NEGATIVE |
| `sem:244:schema` (297) | 15 | 3212 | SINGLE_NEGATIVE |
| `sem:248:require` (304) | 16 | 3211 | SINGLE_NEGATIVE |
| `sem:249:require` (305) | 16 | 3211 | SINGLE_NEGATIVE |
| `sem:251:require` (307) | 16 | 3211 | SINGLE_NEGATIVE |
| `sem:253:require` (309) | 32 | 3195 | SINGLE_NEGATIVE |
| `sem:254:require` (310) | 32 | 3195 | SINGLE_NEGATIVE |
| `sem:257:require` (313) | 43 | 3184 | SINGLE_NEGATIVE |
| `sem:262:require` (318) | 0 | 3227 | NAMED_DUPLICATE_SET |
| `sem:265:require` (321) | 4 | 3223 | SINGLE_NEGATIVE |
| `sem:267:require` (323) | 2 | 3225 | SINGLE_NEGATIVE |
| `sem:273:require` (329) | 4 | 3223 | SINGLE_NEGATIVE |
| `sem:274:require` (330) | 91 | 3136 | SINGLE_NEGATIVE |
| `sem:275:require` (331) | 91 | 3136 | SINGLE_NEGATIVE |
| `sem:276:require` (332) | 91 | 3136 | SINGLE_NEGATIVE |
| `sem:277:require` (333) | 20 | 3207 | SINGLE_NEGATIVE |
| `sem:278:require` (334) | 220 | 3007 | SINGLE_NEGATIVE |
| `sem:281:require` (337) | 0 | 3227 | NAMED_DUPLICATE_SET |
| `sem:283:require` (339) | 56 | 3171 | SINGLE_NEGATIVE |
| `sem:290:require` (346) | 2 | 3225 | SINGLE_NEGATIVE |
| `sem:295:require` (351) | 24 | 3203 | SINGLE_NEGATIVE |
| `sem:297:require` (353) | 12 | 3215 | SINGLE_NEGATIVE |
| `sem:301:require` (357) | 16 | 3211 | SINGLE_NEGATIVE |
| `sem:302:require` (358) | 16 | 3211 | SINGLE_NEGATIVE |
| `sem:303:require` (359) | 16 | 3211 | SINGLE_NEGATIVE |
| `sem:304:require` (360) | 16 | 3211 | SINGLE_NEGATIVE |
| `sem:309:require` (365) | 16 | 3211 | SINGLE_NEGATIVE |
| `sem:310:require` (366) | 16 | 3211 | SINGLE_NEGATIVE |
| `sem:311:require` (367) | 16 | 3211 | SINGLE_NEGATIVE |
| `sem:312:require` (368) | 16 | 3211 | SINGLE_NEGATIVE |
| `sem:314:require` (370) | 17 | 3210 | SINGLE_NEGATIVE |
| `sem:316:require` (372) | 36 | 3191 | SINGLE_NEGATIVE |
| `sem:320:require` (376) | 9 | 3218 | SINGLE_NEGATIVE |
| `sem:321:require` (377) | 20 | 3207 | SINGLE_NEGATIVE |
| `sem:322:require` (378) | 1 | 3226 | SINGLE_NEGATIVE |
| `sem:323:require` (379) | 29 | 3198 | SINGLE_NEGATIVE |
| `sem:324:require` (380) | 20 | 3207 | SINGLE_NEGATIVE |
| `sem:325:require` (381) | 20 | 3207 | SINGLE_NEGATIVE |
| `sem:329:schema` (385) | 1 | 3226 | SINGLE_NEGATIVE |
| `sem:334:require` (390) | 1 | 3226 | SINGLE_NEGATIVE |
| `sem:336:require` (392) | 50 | 3177 | SINGLE_NEGATIVE |
| `sem:338:require` (394) | 1 | 3226 | SINGLE_NEGATIVE |
| `sem:342:require` (398) | 1 | 3226 | SINGLE_NEGATIVE |
| `sem:349:require` (405) | 1 | 3226 | SINGLE_NEGATIVE |
| `sem:352:require` (408) | 0 | 3227 | NAMED_DUPLICATE_SET |
| `sem:354:require` (410) | 1 | 3226 | SINGLE_NEGATIVE |
| `sem:357:require` (413) | 1 | 3226 | SINGLE_NEGATIVE |
| `sem:358:require` (414) | 1 | 3226 | SINGLE_NEGATIVE |
| `sem:359:require` (415) | 2 | 3225 | SINGLE_NEGATIVE |
| `sem:363:require` (419) | 1 | 3226 | SINGLE_NEGATIVE |
| `sem:364:require` (420) | 2 | 3225 | SINGLE_NEGATIVE |
| `sem:365:require` (421) | 2 | 3225 | SINGLE_NEGATIVE |
| `sem:366:require` (422) | 2 | 3225 | SINGLE_NEGATIVE |
| `sem:367:require` (423) | 0 | 3227 | NAMED_DUPLICATE_SET |
| `sem:368:require` (424) | 4 | 3223 | SINGLE_NEGATIVE |
| `sem:369:require` (425) | 0 | 3227 | NAMED_DUPLICATE_SET |
| `sem:371:require` (427) | 1 | 3226 | SINGLE_NEGATIVE |
| `sem:380:require` (436) | 1 | 3226 | SINGLE_NEGATIVE |
| `sem:385:require` (441) | 1 | 3226 | SINGLE_NEGATIVE |
| `sem:386:require` (442) | 1 | 3226 | SINGLE_NEGATIVE |
| `sem:387:require` (443) | 1 | 3226 | SINGLE_NEGATIVE |
| `sem:390:require` (446) | 1 | 3226 | SINGLE_NEGATIVE |
| `sem:393:require` (449) | 1 | 3226 | SINGLE_NEGATIVE |
| `sem:395:require` (451) | 1 | 3226 | SINGLE_NEGATIVE |
| `sem:396:require` (452) | 1 | 3226 | SINGLE_NEGATIVE |
| `sem:397:require` (453) | 1 | 3226 | SINGLE_NEGATIVE |
| `sem:399:require` (455) | 1 | 3226 | SINGLE_NEGATIVE |
| `sem:401:require` (457) | 1 | 3226 | SINGLE_NEGATIVE |
| `sem:403:require` (459) | 128 | 3099 | SINGLE_NEGATIVE |
| `sem:414:require` (470) | 32 | 3195 | SINGLE_NEGATIVE |
| `sem:415:require` (471) | 32 | 3195 | SINGLE_NEGATIVE |
| `sem:416:require` (472) | 32 | 3195 | SINGLE_NEGATIVE |
| `sem:417:require` (473) | 32 | 3195 | SINGLE_NEGATIVE |
| `sem:418:require` (474) | 32 | 3195 | SINGLE_NEGATIVE |
| `sem:419:require` (475) | 32 | 3195 | SINGLE_NEGATIVE |
| `sem:421:require` (477) | 16 | 3211 | SINGLE_NEGATIVE |
| `sem:445:schema` (501) | 0 | 3227 | SINGLE_TRACE_SCHEMA |
| `shape:27:schema` (27) | 177 | 3050 | SINGLE_NEGATIVE |
| `shape:30:raise` (30) | 80 | 3147 | SINGLE_NEGATIVE |
| `shape:32:raise` (32) | 32 | 3195 | SINGLE_NEGATIVE |
| `shape:34:raise` (34) | 16 | 3211 | SINGLE_NEGATIVE |
| `shape:36:raise` (36) | 15 | 3212 | SINGLE_NEGATIVE |
| `shape:40:raise` (40) | 14 | 3213 | SINGLE_NEGATIVE |
| `shape:44:schema` (44) | 39 | 3188 | SINGLE_NEGATIVE |
| `shape:48:raise` (48) | 85 | 3142 | SINGLE_NEGATIVE |
| `shape:51:raise` (51) | 41 | 3186 | SINGLE_NEGATIVE |
| `shape:55:raise` (55) | 0 | 3227 | NAMED_DUPLICATE_SET |
| `shape:57:raise` (57) | 1 | 3226 | SINGLE_NEGATIVE |
| `shape:59:raise` (59) | 1 | 3226 | SINGLE_NEGATIVE |
| `shape:61:raise` (61) | 1 | 3226 | SINGLE_NEGATIVE |
| `shape:63:raise` (63) | 1 | 3226 | SINGLE_NEGATIVE |
| `shape:65:raise` (65) | 1 | 3226 | SINGLE_NEGATIVE |
| `shape:67:raise` (67) | 1 | 3226 | SINGLE_NEGATIVE |
| `shape:69:raise` (69) | 2 | 3225 | SINGLE_NEGATIVE |
| `shape:72:raise` (72) | 1 | 3226 | SINGLE_NEGATIVE |
| `shape:75:raise` (75) | 1 | 3226 | SINGLE_NEGATIVE |
| `shape:82:raise` (82) | 1 | 3226 | SINGLE_NEGATIVE |
| `shape:84:raise` (84) | 2 | 3225 | SINGLE_NEGATIVE |
| `shape:88:raise` (88) | 1 | 3226 | SINGLE_NEGATIVE |
| `shape:92:raise` (92) | 1 | 3226 | SINGLE_NEGATIVE |
| `isolated-schema:attempt.completed` (None) | 3 | 3224 | SINGLE_NEGATIVE |
| `reference-admission` (33) | 112 | 3115 | SINGLE_NEGATIVE |
| `isolated-schema:attempt.started` (None) | 2 | 3225 | SINGLE_NEGATIVE |
| `isolated-schema:node.blocked` (None) | 2 | 3225 | SINGLE_NEGATIVE |
| `isolated-schema:node.completed` (None) | 2 | 3225 | SINGLE_NEGATIVE |
| `isolated-schema:node.started` (None) | 2 | 3225 | SINGLE_NEGATIVE |
| `isolated-schema:node.unblocked` (None) | 2 | 3225 | SINGLE_NEGATIVE |
| `isolated-schema:plan.decomposition_degraded` (None) | 2 | 3225 | SINGLE_NEGATIVE |
| `isolated-schema:remediation.resolved` (None) | 2 | 3225 | SINGLE_NEGATIVE |
| `isolated-schema:remediation.spawned` (None) | 2 | 3225 | SINGLE_NEGATIVE |
| `isolated-schema:run.completed` (None) | 2 | 3225 | SINGLE_NEGATIVE |
| `isolated-schema:run.graph_integrity_failed` (None) | 2 | 3225 | SINGLE_NEGATIVE |
| `isolated-schema:run.node_backoff_expired` (None) | 2 | 3225 | SINGLE_NEGATIVE |
| `isolated-schema:run.node_backoff_started` (None) | 3 | 3224 | SINGLE_NEGATIVE |
| `isolated-schema:run.node_ready` (None) | 3 | 3224 | SINGLE_NEGATIVE |
| `isolated-schema:run.node_retry_scheduled` (None) | 2 | 3225 | SINGLE_NEGATIVE |
| `isolated-schema:scheduler.pass` (None) | 5 | 3222 | SINGLE_NEGATIVE |
| Trace: idempotency body comparison | 16 changed outputs/effects | 214 unchanged | SINGLE_TRACE_MUTATION |
| Trace: original receipt dedupe | 80 changed outputs/effects | 150 unchanged | SINGLE_TRACE_MUTATION |
| Trace: writer cutoff | 16 changed outputs/effects | 214 unchanged | SINGLE_TRACE_MUTATION |
| Trace: reader cutoff | 16 changed outputs/effects | 214 unchanged | SINGLE_TRACE_MUTATION |
| Trace: current read token | 16 changed outputs/effects | 214 unchanged | SINGLE_TRACE_MUTATION |
| Trace: replay cannot mint original | 16 changed outputs/effects | 214 unchanged | SINGLE_TRACE_MUTATION |
| Trace: unavailable receipt refusal | 16 changed outputs/effects | 214 unchanged | SINGLE_TRACE_MUTATION |
| Trace: rebuild source custody | 16 changed outputs/effects | 214 unchanged | SINGLE_TRACE_MUTATION |

### Named duplicate sets

| Named set | Exact review sites removed | Necessary witnesses | Purpose |
|---|---|---:|---|
| compatibility-only append | `sem:82:require`, `sem:83:require` | 32 | Primary proof for zero-flip sites |
| descriptor/logical/stored length | `sem:115:require`, `sem:122:require` | 16 | Primary proof for zero-flip sites |
| original failed attempt identity | `sem:163:require`, `sem:165:require` | 1 | Primary proof for zero-flip sites |
| unsupported timed Storage class | `sem:173:require`, `sem:222:require` | 18 | Supplemental same-field overlap |
| same joined remediation ceiling | `sem:367:require`, `sem:369:require` | 2 | Primary proof for zero-flip sites |
| node completion original state domain | `shape:44:schema`, `shape:55:raise` | 1 | Primary proof for zero-flip sites |
| shape score integer domain | `sem:99:require`, `shape:27:schema` | 2 | Primary proof for zero-flip sites |
| source score integer domain | `sem:244:schema`, `sem:99:require`, `sem:232:require` | 1 | Supplemental same-field overlap |
| source score integer range domain | `sem:244:schema`, `sem:232:require` | 3 | Supplemental same-field overlap |
| source score timestamp whole string | `sem:244:schema`, `sem:234:require` | 3 | Supplemental same-field overlap |
| source timestamp timezone | `sem:148:require`, `sem:150:require` | 1 | Supplemental same-field overlap |
| complete source equality | `sem:281:require`, `sem:283:require` | 181 | Primary proof for zero-flip sites |
| attempt-backed blocked presence | `sem:262:require`, `sem:283:require`, `sem:352:require` | 4 | Primary proof for zero-flip sites |
| attempt-backed unblocked presence | `sem:262:require`, `sem:283:require` | 4 | Supplemental same-field overlap |
| original event value equality | `sem:109:require`, `sem:281:require`, `sem:283:require` | 16 | Supplemental same-field overlap |
| original schema version equality/domain | `sem:244:schema`, `sem:281:require`, `sem:283:require` | 16 | Supplemental same-field overlap |
| original required/extra field presence | `sem:244:schema`, `sem:283:require` | 18 | Supplemental same-field overlap |
| shape generation required presence | `shape:27:schema`, `shape:36:raise` | 15 | Supplemental same-field overlap |
| shape terminal outcome domain | `shape:27:schema`, `shape:72:raise` | 1 | Supplemental same-field overlap |
| shape node outcome/state domain | `shape:27:schema`, `shape:55:raise` | 1 | Supplemental same-field overlap |

Every named-set witness accepts with exactly that set removed and rejects again when any member is restored. No third guard is silently disabled. Supplemental sets account for same-field schema/type/time/presence overlap; the complete results retain every acceptance, including negatives exposed by smaller subsets, and every unchanged rejection. Empty candidate sets are not counted as proof.

The raw table retains **510 secondary guard-case rejections**: **336** have an irreducible named duplicate-set proof, **140** are the same absent object with its exact production prerequisite predicate independently exposed, **30** are schema-required/invalid fields followed by a dereference/parser of that same field, and **4** are the same LF timestamp rejected by schema, source predicate and parser. The latter 34 have exact pure-schema refusal proofs. **Zero unproved instances and zero remaining compound-defect masks are claimed in this bounded inventory.** This does not claim that deleting one guard makes every missing-object full capture execute successfully.

The eight real-mask repairs are: coherent ready/selected float and range copies; matching wrong descriptor/pack media for the media-domain negative; correct logical bytes under only a wrong fingerprint/address; null Project tested in its isolated schema rather than stale Project joins; attempt-field omission with the genuine owner attempt retained; top-level envelope-only and owner-record-only additions to genuine pre-attempt seeds; optional anchor omission with restore inactive; optional wake omission with truly empty coalesced original wakes. Missing packs, missing refresh, missing source slots, missing lifecycle selection and missing dependencies use the same production prerequisite predicates before their dependent dereferences. The six source-equality cases involving permission, remediation generation and retry attempt identity also keep every independent owner/dependency copy coherent.

## All eleven standing checks, all sixteen families

| Family | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| `attempt.completed` | P | N/A Project-only | P | P | P | P | P (event root) | N/A process | P | P | P (bounded) |
| `attempt.started` | P | N/A Project-only | P | P | P | P | P (event root) | N/A process | P | P | P (bounded) |
| `node.blocked` | P | N/A Project-only | P | P | P | P | P (event root) | N/A process | P | P | P (bounded) |
| `node.completed` | P | N/A Project-only | P | P | P | P | P (event root) | N/A process | P | P | P (bounded) |
| `node.started` | P | N/A Project-only | P | P | P | P | P (event root) | N/A process | P | P | P (bounded) |
| `node.unblocked` | P | N/A Project-only | P | P | P | P | P (event root) | N/A process | P | P | P (bounded) |
| `plan.decomposition_degraded` | P | N/A Project-only | P | P | P | P | P (event root) | N/A process | P | P | P (bounded) |
| `remediation.resolved` | P | N/A Project-only | P | P | P | P | P (event root) | N/A process | P | P | P (bounded) |
| `remediation.spawned` | P | N/A Project-only | P | P | P | P | P (event root) | N/A process | P | P | P (bounded) |
| `run.completed` | P | N/A Project-only | P | P | P | P | P (event root) | N/A process | P | P | P (bounded) |
| `run.graph_integrity_failed` | P | N/A Project-only | P | P | P | P | P (event root) | N/A process | P | P | P (bounded) |
| `run.node_backoff_expired` | P | N/A Project-only | P | P | P | P | P (event root) | N/A process | P | P | P (bounded) |
| `run.node_backoff_started` | P | N/A Project-only | P | P | P | P | P (event root) | N/A process | P | P | P (bounded) |
| `run.node_ready` | P | N/A Project-only | P | P | P | P | P (event root) | N/A process | P | P | P (bounded) |
| `run.node_retry_scheduled` | P | N/A Project-only | P | P | P | P | P (event root) | N/A process | P | P | P (bounded) |
| `scheduler.pass` | P | N/A Project-only | P | P | P | P | P (event root) | N/A process | P | P | P (bounded) |

1. Compatibility-only current writes reject in captures, shapes and fresh/retry/replay traces before new effects or receipt return. Historical compatibility uses only the read route.
2. Every family is Project-only. The isolated null-Project negative tests the schema domain alone. The valid CV-366 application spelling is not a new supported identity recipe for these families.
3. Positive Project captures use encoded project~ partitions; raw Project IDs reject.
4. Exactly 16,384 encoded bytes remain inline; 16,385 reject; valid larger bodies use SP-337 references. Address, length, normalized bytes, media, logical body and each custody fence are tested independently.
5. All 22 timestamp positions reject trailing LF through exact-end schemas and strict original-clock checks; source score tests cover their own timestamps.
6. Storage-assigned sequence/observation/persistence metadata does not alter the caller semantic digest or original receipt. A changed original caller timestamp conflicts.
7. Every foreign event/source Storage identity rejects. Actual persisted SP-278 checkpoint/CAS/token execution remains NOT_RUN; the finite trace token is unpersisted model state.
8. These families do not own subprocess exit contracts. Closed payloads reject injected exit_code=0; no process-success oracle is fabricated.
9. Every lane payload/proof reference resolves eagerly, including unvisited branches and external-resource freshness. Shared-schema N2 remains separately reported.
10. Retained originals are validated against their pinned original source, not later live state. Compatibility-only retained history accepts; forged, withdrawn, deleted, unavailable, unauthorized and foreign history rejects with zero canonical effects.
11. Full single-site and necessary named-set results are reported with exact IDs and remaining rejection reasons; prerequisite/schema-only proofs are marked as such.

## What Astra keeps finding — own probes for every family

| Class | Probe and result; scope |
|---|---|
| 1. Forged/contradictory inputs | Arbitrary operation digest and contradictory original mirror reject for all sixteen. Source and dependency hashes are recomputed; identity/scope joins remain active. All 181 equality negatives now isolate their exact duplicate pair. Native EventRecord identity/codec verification is NOT_RUN, not inferred from a capture. |
| 2. Storage metadata trusted from payload | Altering the Storage reservation copy and injecting caller sequence_id both reject; metadata-only retries return the original receipt with one effect. The complete native Storage receipt codec remains NOT_RUN. |
| 3. Historical readers in either direction | Current and replay-only retained originals accept through the read route. Current-writer use of the same replay-only original rejects. Withdrawal and forged original custody reject; the permanent historical/disclosure cases also cover deletion, availability, authorization, Project and Storage. |
| 4. One field read two ways | Integer, uppercase and space-prefixed source digests all reject. Scheduler boolean/fraction/range representations and LF timestamps retain their independent domain tests. No trimming or normalization admits an alternate digest representation. |
| 5. Unvisited unresolved refs | A fresh dormant missing-definition mutation rejects for each family's full-document gate; complete CLI and same-process external-resource tests cover reachability-independent admission. N2 is not hidden by that lane-scoped claim. |
| 6. Partial size limits | Each family's 18,000-byte own-probe logical body is measured as MessagePack and compared with actual retained pack bytes; its referenced inline body is empty. The same large body inline rejects. SP-500..515 each explicitly adopt SP-337 and contain no contradictory always-null rule. Captured original owner reads are unpersisted test data, not newly authored stored operation values; their native codecs/transport remain the existing owners' NOT_RUN obligations. |
| 7. Custody on every path | Wrong event family and foreign Storage owner reads reject per family. Original start/failure/policy reads remain checked for retry/timer transitions, original receipt custody governs replay/rebuild, and retained-source hashes plus fresh disclosure fences govern history. Actual concurrent native custody remains NOT_RUN. |
| 8. Masked negatives | Coherent valid seeds, recomputed hashes, original observation mirrors and necessary duplicate sets replace stale-copy masks. The whole-lane table preserves exact exceptions and any remaining rejection; it does not call all multi-guard refusals duplicates. |
| 9. Overstated grades | Grades follow the bounded static evidence below. Membership remains ABSENT, decomposition retention remains PARTIAL, and native EventRecord/receipt codecs, actual complete owner reads, durability/crash/restore, real checkpoints/CAS/source translation and deletion/withdrawal concurrency remain NOT_RUN. |

`astra-classes.json` records 336 own-probe/scope rows across all sixteen families. Matrix and grading evidence supply classes 8/9; no unsupported native clearance is claimed.

## Checks, scope and evidence

| Check | Exit / result |
|---|---|
| Full shape/identity/reference CLI | 0 / pass; 664 / 80 / 208 |
| Full semantic CLI | 0 / pass; 2297 source / 230 traces / 16 scores / 38 schemas / 208 refs / 272 histories / 32 helpers |
| Full guard matrix | 0 / 172 sites; 555044 negative + 39560 trace evaluations; all 8 additional trace mutations detected |
| Necessary named duplicate-set experiments | 0 / 20 proved sets; 8 primary sets cover all 11 duplicate-only sites |
| Pure schema refusal controls | 0 / 34 exact boundary proofs; full-capture exceptions retained |
| Independent F1-F7 and standing 1-8 | 0 / 908 of 908 match |
| Independent complete-CLI injection | 0 / 2981 source / 364 traces; other suites retained |
| F9 named sensitivity recheck | 0 / exactly 16 successor mismatches; 24 timed-policy controls; physical bool and forged-original check match |
| History/reference regression | 0 / 576 of 576 match |
| Timestamp/schema/trace sensitivity | 0 / 236 of 236 target outcomes exposed |
| Reachable/dormant reference CLI probes | 0 / 64 expected refusals; 16 resolving controls |
| External resource freshness/proof-schema CLI probes | 0 / 48 freshness outcomes; two expected proof-schema refusals |
| Astra own probes | 0 / 336 rows across 16 families |
| Event-index tests | 0 / 14 pass |
| Runtime-vocabulary tests | 1 / one pre-existing GUI phrase failure, 9 tests |
| Shard check / plan-index validate | 0 / parsed top-level pass; readiness blocked |
| Predicate/scope/quotation audit | 0 / 128 original require predicates retained verbatim; shape validate AST unchanged; 340 exact quotations |

No owner markdown changed in this round, so no shard/index regeneration is required. Read-only shard and parsed top-level index validation pass. Readiness remains blocked_runtime_certification_incomplete. All fifteen ignored currentness files were copied and hash-matched before validation. No unrelated derived body changed.

The predicate audit confirms all 128 original non-main require conditions remain verbatim, and the shape validate function's AST is unchanged. Eleven prerequisite expressions moved into callable helpers used on the same production paths; no guard was weakened. The sole new policy predicate is the closed historical-reader domain. Complete CLIs also execute the positive seed checks for repaired negatives. Original owner prose, schemas, registry, policy catalog, value registry, Decision Log, frozen validator, .gitignore, tests, Spec Lock, auto decisions and generated governance artifacts are unchanged from the reviewed head.

**IDs used:** EP-210..225, CV-500..515, SP-500..515, ATS-250..257 — **56 existing PlanUnit IDs, zero minted**. No new producer, consumer, projector, checkpoint, persisted family, retention policy or identity binding. No pm-mail, subagent, admission, registry append, Decision Log entry, landing lock, main push or reseal.

Initial resources: 11 GB available RAM and 115 GB free disk; later checks remained above the 6 GB / 50 GB stops. The worktree is sparse and removed after the final push. The reused reviewer injection harness initially stopped at its dependency-extraction-only 1 GB workspace assertion before running the CLI. This sparse worktree contains 3.3 GB of canonical Plans; the harness now bounds temporary growth below 500 MB while retaining the 50 GB free-disk stop. No product validation changed for that adjustment. Temporary schema/fixture mutations are restored exactly; uncited progress/injection scratch is deleted. Reproduction scripts and cited raw evidence stay outside the repository.

Key retained evidence (absolute path plus SHA-256):

- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DX/fix5/guard-matrix.json` — `6e3b2e2227aefd541c41be5b1fc597c63ba8fe9364b903a2ec6df028088a1aaa`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DX/fix5/duplicate-proofs.json` — `a6107b0be8949b5463ffb83aa20d2fb10715d2bd57bdbb01effeea8118dd58fe`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DX/fix5/guard-assessment.json` — `020ac75644cd9c995d070c4d60c6c7e46464972124a1ab3624a2e6368e9f60eb`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DX/fix5/boundary-refusals.json` — `b8e5d385fc949672d6c864adfb62d84d20e9652650d61994a4070e00a048f3c7`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DX/fix5/input-manifest.json` — `ee2a0f2232c6379658b45053f35085d185746712c0e5405644c82ef6f3bb7547`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DX/fix5/fixture-repairs.json` — `ce5c10b9ede48113a582a36c3f01646acdfb467d661cb939c6c5ca038c45664e`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DX/fix5/equality-copy-repairs.json` — `77af86792b6093c72c0782dfda89cf1480d8c8dbb6d6f5ee67cdd3edfd303c30`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DX/fix5/history-policy-before.json` — `f5c76ce9f5481346f5639881a9817a4bd144d1287902a692c40b35c7af7ebc48`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DX/fix5/astra-classes.json` — `9b2d0bd6241977f598c74e9ddc59cbc293a0c55c37e277ff58bb1cb212950402`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DX/fix5/preserved-regressions.json` — `9b12b1c3d472589bce8b8fb0f00d529343ac36b2410e3e51d0acfe985d55545c`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DX/fix5/scope-audit.json` — `9fc1b3489f104585cf40a298de431051841f029e244dee3d77929129e0694388`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DX/fix5/quote-audit.json` — `58cfc85f916dbfa057a3f4b30b3a34e68d8f9487e16faf253325afeee887ccc9`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DX/fix5/final-regressions.json` — `37fb37048c77fe351eead59069efe5666f32ea1a0a78987eebd5abdce19bcece`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DX/fix5/probes-cycle5.json` — `8c81fc5a420f109ce25e1649ac3e230ececa42b50a7e17b26880ecbbc5f8bc30`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DX/fix5/injected-check-cycle5.json` — `307801c8098462b31e90b744768699bd7c27e88d2c99ccbbf57c3d769688a3ef`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DX/fix5/f9-repair-cycle5.json` — `e121f302418b9fbe520d7c7499e0f59ba4c3f297c301139327400d1f30c7d77c`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DX/fix5/history-refs-cycle5.json` — `e37b4c7085f1a7554f9a7c65057957388faee9e726d0d584ba4412b6f692fb65`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DX/fix5/trace-schema-cycle5.json` — `cb7b178c812c1c234ee4d36f095964a2d142a4854e6ea5f75a2137f8b95da56b`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DX/fix5/refs-cycle5.json` — `ec1f0eea24e8f3ed09fdb5e5c0166852d796b7a6bbed9250dc031b9e80ab1895`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DX/fix5/ref-resource-cycle5.json` — `1a7459b9164ef66f458c0b2938f4c9202d5a03774aa2304ebb81c871bdcc2441`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DX/fix5/semantics.json` — `4f31bce3b650d3972165a9271605ead34015567e774233a30596834b9215a4c7`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DX/fix5/contracts.json` — `12fe0dab18949d5c4d6d22de7367d5046db097f14f1be8706545b0fa3d9564a1`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DX/fix5/shards.json` — `4a1c09a582f61dc63e15de67ebc4b6bd3d7834c23b8b6cce5bea75870d8f7a53`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DX/fix5/index.json` — `1569f69465ace7559d5eb93ce30b7c97b41f9364676b1129eb152242a305707b`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DX/fix5/currentness.json` — `ca2d5e7006f07aa13dd0c118f82ffcb29c20a655a7145631160f9516461e7c3c`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DX/fix5/reproduction-scripts.json` — `0e51970d7e56a2933661797a41243b8cfa79b5fdb6bbbb342f432d0c3e266307`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DX/fix5/event-index.log` — `1f230ea5ebd24f240c8dc1c95a45ddc5aac7a4bb74f44f45af3a3a5ac8c742b1`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DX/fix5/runtime-vocabulary.log` — `660ca496c98744377ddbea23949cbe0084d5349dd2aa8c1d07e14d5b02a45cf1`.

## Original contract binding/search lineage

The earlier per-family searches and newly authored bindings below are retained as source lineage. Their earlier grades are superseded by this round. Every owner document is unchanged from the reviewed head.

### First-pass independent binding searches

Each row below independently searched all live top-level Plans markdown/JSON before writing. Generated shards, ledger source memory and historical audits were excluded as authority. The search captured every exact-name hit with its source line/text. Existing EventRecord, runtime snapshot/execution context, Case L-5 dedupe, SP-278 generic index and SP-286/CV-339 full-value receipt contracts are reused. No family borrows a sibling identity. New emitter/reader/version and hash recipe are labeled newly authored owner contracts. No new projector/checkpoint ID, physical family or retention policy was created.

Raw per-family search: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DX/binding-search.json`, SHA-256 `5c17e252b884e1f4ac1d574f73f06a9648d49ba78901729586091c2a4ee91578`.

### `attempt.completed`

Search: 12 exact-name hits; partial-contract evidence: Plans/Contracts_V0.md:2753, Plans/Contracts_V0.md:15232, Plans/Contracts_V0.md:15241, Plans/Contracts_V0.md:15259, Plans/Decision_Log.md:579. Current semantic minima were read independently, including the March addenda, current taxonomy, July sequence fallback and current snapshot naming closure.
Inspected exact-name hits do not define this family's versioned operating reader with complete SP-278 adoption, exact identity hash recipe and withdrawal fences. Existing semantic minima and shared index/receipt contracts are reused; the new family-specific binding below is newly authored under DL-045, not inferred from run.started.
New emitter: `executor.attempt_completed.emitter.v1@1.0.0`. New operating consumer: `executor.attempt_completed.history_reader.v1@1.0.0`. New identity input order: `["project_id", "run_id", "node_id", "attempt_id", "event_sequence"]`; exact RFC8785/hash recipe in SP-500. Transition: active_attempt -> terminal_attempt; terminal outcome must have success=true or failure_class, never both; retry/backoff evidence is not a second dispatch.

### `attempt.started`

Search: 16 exact-name hits; partial-contract evidence: Plans/Contracts_V0.md:508, Plans/Contracts_V0.md:522, Plans/Contracts_V0.md:2741, Plans/Contracts_V0.md:15181, Plans/Contracts_V0.md:15191, Plans/Contracts_V0.md:15209, Plans/Decision_Log.md:579. Current semantic minima were read independently, including the March addenda, current taxonomy, July sequence fallback and current snapshot naming closure.
Inspected exact-name hits do not define this family's versioned operating reader with complete SP-278 adoption, exact identity hash recipe and withdrawal fences. Existing semantic minima and shared index/receipt contracts are reused; the new family-specific binding below is newly authored under DL-045, not inferred from run.started.
New emitter: `executor.attempt_started.emitter.v1@1.0.0`. New operating consumer: `executor.attempt_started.history_reader.v1@1.0.0`. New identity input order: `["project_id", "run_id", "node_id", "attempt_id", "event_sequence"]`; exact RFC8785/hash recipe in SP-501. Transition: admitted candidate -> started attempt; frozen permission/model/runtime snapshots and exact worktree baseline are durable before the barrier; increment policy counters once before worker spawn.

### `node.blocked`

Search: 39 exact-name hits; partial-contract evidence: Plans/Contracts_V0.md:598, Plans/Contracts_V0.md:712, Plans/Contracts_V0.md:2453, Plans/Contracts_V0.md:2455, Plans/Contracts_V0.md:2459, Plans/Contracts_V0.md:2762, Plans/Contracts_V0.md:2814. Current semantic minima were read independently, including the March addenda, current taxonomy, July sequence fallback and current snapshot naming closure.
Inspected exact-name hits do not define this family's versioned operating reader with complete SP-278 adoption, exact identity hash recipe and withdrawal fences. Existing semantic minima and shared index/receipt contracts are reused; the new family-specific binding below is newly authored under DL-045, not inferred from run.started.
New emitter: `executor.node_blocked.emitter.v1@1.0.0`. New operating consumer: `executor.node_blocked.history_reader.v1@1.0.0`. New identity input order: `["project_id", "run_id", "node_id", "blocked_sequence", "event_sequence"]`; exact RFC8785/hash recipe in SP-502. Transition: eligible node -> blocked episode; mint blocked_sequence once per actual episode under node CAS. Before an attempt exists omit attempt_id. Required restore anchors and snapshot refs publish atomically with the block, never fabricate a prior attempt.

### `node.completed`

Search: 4 exact-name hits; partial-contract evidence: Plans/Contracts_V0.md:940, Plans/Contracts_V0.md:7072, Plans/Contracts_V0.md:7104, Plans/Decision_Log.md:579. Current semantic minima were read independently, including the March addenda, current taxonomy, July sequence fallback and current snapshot naming closure.
Inspected exact-name hits do not define this family's versioned operating reader with complete SP-278 adoption, exact identity hash recipe and withdrawal fences. Existing semantic minima and shared index/receipt contracts are reused; the new family-specific binding below is newly authored under DL-045, not inferred from run.started.
New emitter: `executor.node_completed.emitter.v1@1.0.0`. New operating consumer: `executor.node_completed.history_reader.v1@1.0.0`. New identity input order: `["project_id", "run_id", "node_id", "attempt_id", "event_sequence"]`; exact RFC8785/hash recipe in SP-503. Transition: verified -> done or verify_pending -> failed; preserve verifier and packaging evidence. Removing a node from the ready set cannot complete it.

### `node.started`

Search: 4 exact-name hits; partial-contract evidence: Plans/Contracts_V0.md:939, Plans/Contracts_V0.md:7072, Plans/Contracts_V0.md:7103, Plans/Decision_Log.md:579. Current semantic minima were read independently, including the March addenda, current taxonomy, July sequence fallback and current snapshot naming closure.
Inspected exact-name hits do not define this family's versioned operating reader with complete SP-278 adoption, exact identity hash recipe and withdrawal fences. Existing semantic minima and shared index/receipt contracts are reused; the new family-specific binding below is newly authored under DL-045, not inferred from run.started.
New emitter: `executor.node_started.emitter.v1@1.0.0`. New operating consumer: `executor.node_started.history_reader.v1@1.0.0`. New identity input order: `["project_id", "run_id", "node_id", "attempt_id", "event_sequence"]`; exact RFC8785/hash recipe in SP-504. Transition: queued -> in_progress after admitted readiness and frozen actual attempt; a ready event alone cannot start a node.

### `node.unblocked`

Search: 55 exact-name hits; partial-contract evidence: Plans/Contracts_V0.md:598, Plans/Contracts_V0.md:921, Plans/Contracts_V0.md:2478, Plans/Contracts_V0.md:2480, Plans/Contracts_V0.md:2491, Plans/Contracts_V0.md:2815, Plans/Contracts_V0.md:14271. Current semantic minima were read independently, including the March addenda, current taxonomy, July sequence fallback and current snapshot naming closure.
Inspected exact-name hits do not define this family's versioned operating reader with complete SP-278 adoption, exact identity hash recipe and withdrawal fences. Existing semantic minima and shared index/receipt contracts are reused; the new family-specific binding below is newly authored under DL-045, not inferred from run.started.
New emitter: `executor.node_unblocked.emitter.v1@1.0.0`. New operating consumer: `executor.node_unblocked.history_reader.v1@1.0.0`. New identity input order: `["project_id", "run_id", "node_id", "blocked_sequence", "event_sequence"]`; exact RFC8785/hash recipe in SP-505. Transition: matching unresolved blocked episode -> resolved; require the exact ordered action/current prerequisite and durable recovery result. No stale approval and no safe-point anchor release before its owner terminal result.

### `plan.decomposition_degraded`

Search: 12 exact-name hits; partial-contract evidence: Plans/Contracts_V0.md:2665, Plans/Contracts_V0.md:2709, Plans/Contracts_V0.md:14819, Plans/Contracts_V0.md:14828, Plans/Contracts_V0.md:14843, Plans/Contracts_V0.md:15040, Plans/Contracts_V0.md:15049. Current semantic minima were read independently, including the March addenda, current taxonomy, July sequence fallback and current snapshot naming closure.
Inspected exact-name hits do not define this family's versioned operating reader with complete SP-278 adoption, exact identity hash recipe and withdrawal fences. Existing semantic minima and shared index/receipt contracts are reused; the new family-specific binding below is newly authored under DL-045, not inferred from run.started.
New emitter: `executor.plan_decomposition_degraded.emitter.v1@1.0.0`. New operating consumer: `executor.plan_decomposition_degraded.history_reader.v1@1.0.0`. New identity input order: `["project_id", "source_stage", "event_sequence"]`; exact RFC8785/hash recipe in SP-506. Transition: pre-lock decomposition -> degraded pre-lock shape; graph_locked=true rejects. Shapes are redacted bounded shape descriptors, not plan bodies; evidence_ref resolves the original evidence.

### `remediation.resolved`

Search: 45 exact-name hits; partial-contract evidence: Plans/Contracts_V0.md:417, Plans/Contracts_V0.md:500, Plans/Contracts_V0.md:540, Plans/Contracts_V0.md:778, Plans/Contracts_V0.md:2643, Plans/Contracts_V0.md:2646, Plans/Contracts_V0.md:2657. Current semantic minima were read independently, including the March addenda, current taxonomy, July sequence fallback and current snapshot naming closure.
Inspected exact-name hits do not define this family's versioned operating reader with complete SP-278 adoption, exact identity hash recipe and withdrawal fences. Existing semantic minima and shared index/receipt contracts are reused; the new family-specific binding below is newly authored under DL-045, not inferred from run.started.
New emitter: `executor.remediation_resolved.emitter.v1@1.0.0`. New operating consumer: `executor.remediation_resolved.history_reader.v1@1.0.0`. New identity input order: `["project_id", "run_id", "node_id", "child_attempt_id", "remediation_root_id", "remediation_generation", "event_sequence"]`; exact RFC8785/hash recipe in SP-507. Transition: active remediation child -> fixed, superseded, abandoned or replan_required with exact original parent/root/child joins; ceiling_exceeded is blocked-state evidence, not a current resolution.

### `remediation.spawned`

Search: 33 exact-name hits; partial-contract evidence: Plans/Contracts_V0.md:2626, Plans/Contracts_V0.md:2628, Plans/Contracts_V0.md:2630, Plans/Contracts_V0.md:2784, Plans/Contracts_V0.md:2816, Plans/Contracts_V0.md:14697, Plans/Contracts_V0.md:14706. Current semantic minima were read independently, including the March addenda, current taxonomy, July sequence fallback and current snapshot naming closure.
Inspected exact-name hits do not define this family's versioned operating reader with complete SP-278 adoption, exact identity hash recipe and withdrawal fences. Existing semantic minima and shared index/receipt contracts are reused; the new family-specific binding below is newly authored under DL-045, not inferred from run.started.
New emitter: `executor.remediation_spawned.emitter.v1@1.0.0`. New operating consumer: `executor.remediation_spawned.history_reader.v1@1.0.0`. New identity input order: `["project_id", "run_id", "node_id", "child_attempt_id", "remediation_root_id", "remediation_generation", "event_sequence"]`; exact RFC8785/hash recipe in SP-508. Transition: classified failed parent -> admitted remediation child, within existing generation/ceiling policy; append lineage before child dispatch; child_attempt_id is the child attempt identity, never the parent.

### `run.completed`

Search: 47 exact-name hits; partial-contract evidence: Plans/Contracts_V0.md:938, Plans/Contracts_V0.md:2366, Plans/Contracts_V0.md:7072, Plans/Contracts_V0.md:7102, Plans/Contracts_V0.md:13479, Plans/Contracts_V0.md:13489, Plans/Contracts_V0.md:13507. Current semantic minima were read independently, including the March addenda, current taxonomy, July sequence fallback and current snapshot naming closure.
Inspected exact-name hits do not define this family's versioned operating reader with complete SP-278 adoption, exact identity hash recipe and withdrawal fences. Existing semantic minima and shared index/receipt contracts are reused; the new family-specific binding below is newly authored under DL-045, not inferred from run.started.
New emitter: `executor.run_completed.emitter.v1@1.0.0`. New operating consumer: `executor.run_completed.history_reader.v1@1.0.0`. New identity input order: `["project_id", "run_id", "event_sequence"]`; exact RFC8785/hash recipe in SP-509. Transition: active run -> owner-declared terminal result only after all required Document Set packaging audits pass and in-flight work is reconciled. Canonical usage remains usage.event; optional usage_ref resolves the UF-085 snapshot; no legacy inline token tuple.

### `run.graph_integrity_failed`

Search: 8 exact-name hits; partial-contract evidence: Plans/Contracts_V0.md:2675, Plans/Contracts_V0.md:14863, Plans/Contracts_V0.md:14871, Plans/Contracts_V0.md:14886, Plans/Decision_Log.md:579. Current semantic minima were read independently, including the March addenda, current taxonomy, July sequence fallback and current snapshot naming closure.
Inspected exact-name hits do not define this family's versioned operating reader with complete SP-278 adoption, exact identity hash recipe and withdrawal fences. Existing semantic minima and shared index/receipt contracts are reused; the new family-specific binding below is newly authored under DL-045, not inferred from run.started.
New emitter: `executor.run_graph_integrity_failed.emitter.v1@1.0.0`. New operating consumer: `executor.run_graph_integrity_failed.history_reader.v1@1.0.0`. New identity input order: `["project_id", "run_id", "event_sequence"]`; exact RFC8785/hash recipe in SP-510. Transition: active graph validation -> integrity failure and replan path; never convert locked graph corruption into pre-lock decomposition degradation or blind retry.

### `run.node_backoff_expired`

Search: 7 exact-name hits; partial-contract evidence: Plans/Contracts_V0.md:2507, Plans/Contracts_V0.md:14363, Plans/Contracts_V0.md:14371, Plans/Contracts_V0.md:14387, Plans/Decision_Log.md:579. Current semantic minima were read independently, including the March addenda, current taxonomy, July sequence fallback and current snapshot naming closure.
Inspected exact-name hits do not define this family's versioned operating reader with complete SP-278 adoption, exact identity hash recipe and withdrawal fences. Existing semantic minima and shared index/receipt contracts are reused; the new family-specific binding below is newly authored under DL-045, not inferred from run.started.
New emitter: `executor.run_node_backoff_expired.emitter.v1@1.0.0`. New operating consumer: `executor.run_node_backoff_expired.history_reader.v1@1.0.0`. New identity input order: `["project_id", "run_id", "node_id", "attempt_id", "event_sequence"]`; exact RFC8785/hash recipe in SP-511. Transition: matching active backoff -> elapsed wake only at or after durable backoff_until_utc; no attempt dispatch or success inferred from timer expiry.

### `run.node_backoff_started`

Search: 7 exact-name hits; partial-contract evidence: Plans/Contracts_V0.md:2497, Plans/Contracts_V0.md:14320, Plans/Contracts_V0.md:14328, Plans/Contracts_V0.md:14344, Plans/Decision_Log.md:579. Current semantic minima were read independently, including the March addenda, current taxonomy, July sequence fallback and current snapshot naming closure.
Inspected exact-name hits do not define this family's versioned operating reader with complete SP-278 adoption, exact identity hash recipe and withdrawal fences. Existing semantic minima and shared index/receipt contracts are reused; the new family-specific binding below is newly authored under DL-045, not inferred from run.started.
New emitter: `executor.run_node_backoff_started.emitter.v1@1.0.0`. New operating consumer: `executor.run_node_backoff_started.history_reader.v1@1.0.0`. New identity input order: `["project_id", "run_id", "node_id", "attempt_id", "event_sequence"]`; exact RFC8785/hash recipe in SP-512. Transition: classified retryable failure -> scheduled backoff with existing per-error budgets; no retry of graph_integrity, verification_failed or reviewer_findings; timer never converts to terminal success.

### `run.node_ready`

Search: 5 exact-name hits; partial-contract evidence: Plans/Contracts_V0.md:2444, Plans/Contracts_V0.md:14127, Plans/Contracts_V0.md:14135, Plans/Contracts_V0.md:14151, Plans/Decision_Log.md:579. Current semantic minima were read independently, including the March addenda, current taxonomy, July sequence fallback and current snapshot naming closure.
Inspected exact-name hits do not define this family's versioned operating reader with complete SP-278 adoption, exact identity hash recipe and withdrawal fences. Existing semantic minima and shared index/receipt contracts are reused; the new family-specific binding below is newly authored under DL-045, not inferred from run.started.
New emitter: `executor.run_node_ready.emitter.v1@1.0.0`. New operating consumer: `executor.run_node_ready.history_reader.v1@1.0.0`. New identity input order: `["project_id", "run_id", "node_id", "event_sequence"]`; exact RFC8785/hash recipe in SP-513. Transition: not ready -> dependency-satisfying ready; all blockers resolve and current graph/Spec Lock/capacity requirements pass. Preserve ready_since_utc while continuously ready, do not dispatch from this event.

### `run.node_retry_scheduled`

Search: 7 exact-name hits; partial-contract evidence: Plans/Contracts_V0.md:2515, Plans/Contracts_V0.md:14406, Plans/Contracts_V0.md:14415, Plans/Contracts_V0.md:14431, Plans/Decision_Log.md:579. Current semantic minima were read independently, including the March addenda, current taxonomy, July sequence fallback and current snapshot naming closure.
Inspected exact-name hits do not define this family's versioned operating reader with complete SP-278 adoption, exact identity hash recipe and withdrawal fences. Existing semantic minima and shared index/receipt contracts are reused; the new family-specific binding below is newly authored under DL-045, not inferred from run.started.
New emitter: `executor.run_node_retry_scheduled.emitter.v1@1.0.0`. New operating consumer: `executor.run_node_retry_scheduled.history_reader.v1@1.0.0`. New identity input order: `["project_id", "run_id", "node_id", "prior_attempt_id", "event_sequence"]`; exact RFC8785/hash recipe in SP-514. Transition: classified prior attempt -> scheduled successor admission under the existing retry budget; preserve prior identity, verify safe-point/worktree and refresh permission before any distinct successor attempt.

### `scheduler.pass`

Search: 71 exact-name hits; partial-contract evidence: Plans/Contracts_V0.md:540, Plans/Contracts_V0.md:712, Plans/Contracts_V0.md:2418, Plans/Contracts_V0.md:2423, Plans/Contracts_V0.md:2425, Plans/Contracts_V0.md:2732, Plans/Contracts_V0.md:2740. Current semantic minima were read independently, including the March addenda, current taxonomy, July sequence fallback and current snapshot naming closure.
Inspected exact-name hits do not define this family's versioned operating reader with complete SP-278 adoption, exact identity hash recipe and withdrawal fences. Existing semantic minima and shared index/receipt contracts are reused; the new family-specific binding below is newly authored under DL-045, not inferred from run.started.
New emitter: `executor.scheduler_pass.emitter.v1@1.0.0`. New operating consumer: `executor.scheduler_pass.history_reader.v1@1.0.0`. New identity input order: `["project_id", "run_id", "scheduler_pass_id", "event_sequence"]`; exact RFC8785/hash recipe in SP-515. Transition: one pending wake set -> one scored pass, before dispatch; first recovery wake is startup_recovered. Select at most available_slots using the canonical score order, retain every nonselected ready node and its exclusion reason. Legacy non_selected is import-only.


## Pass-two evidence receipts

- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DX/pass2-binding-search.json` — SHA-256 `bf22655fd256e6ec4e3cfbfde40da9b90cc84f4b487573365a8d41184a9b7600`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DX/pass2-id-search.json` — SHA-256 `c329cfa01802d3529a337baac0205a34824ec84317f0fe899a70af7b6c096400`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DX/pass2-currentness-sha256.log` — SHA-256 `7861f231de81ca0ce756a9b27d297e2c5f2700a7f7a000697492191912f685e1`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DX/pass2-runtime-baseline.json` — SHA-256 `abac3b4abdee0293aebdb2863521002a67ce5f5eaf1a7694e90518f8df898e1b`.
