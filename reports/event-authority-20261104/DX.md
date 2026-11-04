# DX-FIX6 — Current-reader custody, isolated enums and numeric representations

Branch: `plans/ea-w2-executor-20261104`. Reviewed head: `72444d93ee5af84f67101d4af718efbf1192b9ca`. Graded code/fixture head: `c56f378b88082a2bfc960d00cf3d8f611585add4`. The following report-only commit preserves those bytes; `drafts/DX/head.txt` records the final pushed head. Round 6 is the second and last authorized technical round after the extra round. Prepared without admission; native execution **NOT_RUN**.

**Outcome:** F1–F10 remain fixed. F11/F12/F13 are fixed in the finite static model. Every prior semantic source case is preserved exactly; only the two named prior shape cases changed. Existing histories gain explicit fresh body-read observations. No owner markdown, schema, registry, retention policy or generated governance artifact changed.

**Grades:** 159 PASS / 17 PARTIAL / 16 ABSENT → 175 PASS / 1 PARTIAL / 16 ABSENT. Fifteen families pass as prepared without admission. `plan.decomposition_degraded` retains `PENDING_RETENTION_DECISION` for Jared; all sixteen membership cells remain ABSENT.

## Review round 6: findings and responses

| Finding | Response at graded head | Verification |
|---|---|---|
| F1 | Fixed previously; retained. Original presence, mirror and actual/pre-attempt distinction. | 37/37 independent controls; all prior source cases unchanged. |
| F2 | Fixed previously; retained. Actual/normalized remediation generations and ceilings. | 8/8 controls; typed generation joins strengthen existing equality. |
| F3 | Fixed previously; retained. Classified retry budgets, provenance and original timing. | 6 original controls and 250 classified-policy controls match. |
| F4 | Fixed previously; retained. Integer priority bounds, boolean/fraction refusals. | 7 coherent source and 4 isolated schema controls match; original witnesses remain sensitive. |
| F5 | Fixed previously; retained. Compatibility-only current writes/retries refuse before effects. | All 48 fresh/retry/replay controls; retained replay-only history uses its own read route. |
| F6 | Fixed previously; retained. Exact MessagePack limit and SP-337 body custody. | All 208 transport corruption/custody controls and exact-size boundaries match. |
| F7 | Fixed previously; retained. Whole-string identifier/timestamp validation. | All 22 coherent LF positions and schema/trace controls remain refused. |
| F8 | Fixed previously; retained. Eager references and same-process resource freshness. | 64 complete-CLI missing-ref refusals; 16 valid-ref controls; 48 freshness controls; two proof-schema refusals. |
| F9 | Fixed previously; retained. Successor/post-state, policy, bool/hash and forged-history repairs. | Whole matrix and all prior 29 witnesses; exact original source cases retained. |
| F10 | Fixed previously; retained. Formerly unproved prerequisites and other guard sites. | 29/29 supplied witnesses and 22 trace-schema controls retain sensitivity; zero unproved sites. |
| F11 | Fixed (c56f378b88). Enum negatives rebuilt from valid failure seeds; inline copies, success absence and verify_pending facts coherent. Two enum/state sets removed from duplicate claims. | Each exact enum-only mutant makes the complete shape CLI fail with exactly its one authored negative accepted; restored production passes. |
| F12 | Fixed (c56f378b88). Authenticate original first; use current viewer plus separate fresh pack/dependency reads for each disclosure. Original lifecycle remains historical. | 82 current-only-reader positives and 82 one-viewer-change negatives, across both retained policies and every linked target; 128 fresh pack custody negatives. Removing just the fresh pack/dependency route exposes 160/50 negatives. |
| F13 / Astra 10 | Fixed (c56f378b88). Integer-domain validation precedes identities/digests; typed source equality refuses bool/int aliasing. No native numeric range or owner recipe is changed. | 448 permanent boundary cases cover 1, 1.0, 1e0, -0, 0, 0.0, 01. Forty-eight new source float/bool/revision negatives; 308 fresh numeric probes cover every numeric identity field. |
| N1 | Pre-existing integration item; unchanged. Runtime-vocabulary test expects the missing GUI phrase. | Nine tests, one failure. Both test and FinalGUISpec bytes equal origin/main. |
| N2 | Pre-existing shared-schema integration item; unchanged. Missing goal_body_custody.schema.json#/$defs/body_application_v1. | Relevant shared schema bytes equal main. Lane gate covers the sixteen payloads and proof schema, not the whole shared graph. |

**Owner authority for F12:** SP-500..515 explicitly say: “At every read/disclosure/export recheck viewer access, Project/scope, lawful deletion, holds and source availability. Event retention grants no linked-body access or extra body lifetime.” Each family’s exact line is in `owner-access-evidence.json`. This decides current-reader access; no owner conflict or product choice was inferred. The original viewer is authenticated historical evidence. Fresh body permission lists can exclude that original viewer while permitting the current reader, and those reads accept.

**Jared-only cell, unchanged:** Should `plan.decomposition_degraded` use `RP-OPERATIONAL-2555D@1.0.0` as operational history with an approved original durable decomposition-result terminal anchor, or `RP-AUTHORITY-INDEFINITE@1.0.0` as authority/source lineage? SP-506 leaves both candidates and the proposed anchor unselected. No expiry, deletion behavior or anchor was selected.

## Family grades before and after

Counts are PASS / PARTIAL / ABSENT against the independent cycle-6 review. The oracle cell changes from PARTIAL to PASS in each family; normative cells are carried with exact current quotations. Native NOT_RUN is not converted into native clearance.

| Family | Before | After | Verdict |
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

**3741 authored negatives; 175 individual boundaries; two fresh-read routes. 662157 negative evaluations and 40710 trace evaluations.** There are 163 singleton-negative sites, one singleton trace-schema site, eleven duplicate-only sites, twenty necessary nonempty named sets, and zero unproved sites or guard/case instances. All eight additional trace mutations are detected. Every duplicate witness refuses when any member is restored. Two exact enum-keyword CLI proofs are separate from aggregated schema-call boundaries.

Each row deletes exactly one predicate/schema/parser boundary or one named duplicate set. No require-wide bypass is used. Every negative is actually rerun. Exact flip IDs are in `DX.guard-removal.json`; still-rejected IDs are the complete inventory minus each row’s flip IDs, with changed refusal reasons retained. Schema calls are aggregate boundaries, not a universal proof of every keyword. Thirty missing/invalid-field schema controls, four timestamp/schema/parser controls and 140 exact missing-object prerequisite outcomes remain explicitly distinguished from full-capture acceptance.

Matrix-only caches hold immutable fixture values and schemas and key every result by the exact encoder guard state. Fresh traces are not cached as immutable captures. Production CLIs, both exact enum mutations, route regressions and external-resource freshness tests run separately without those caches. No cache is part of production checker behavior.

| Guard (current line) | Negatives that flip | Negatives that stay rejected | Proof |
|---|---:|---:|---|
| `sem:95:require` (31) | 1 | 3740 | SINGLE_NEGATIVE |
| `sem:118:require` (35) | 1 | 3740 | SINGLE_NEGATIVE |
| `sem:150:require` (39) | 1 | 3740 | SINGLE_NEGATIVE |
| `sem:166:require` (43) | 4 | 3737 | SINGLE_NEGATIVE |
| `sem:179:require` (47) | 1 | 3740 | SINGLE_NEGATIVE |
| `sem:200:require` (51) | 1 | 3740 | SINGLE_NEGATIVE |
| `sem:205:require` (55) | 1 | 3740 | SINGLE_NEGATIVE |
| `sem:209:require` (59) | 3 | 3738 | SINGLE_NEGATIVE |
| `sem:268:require` (64) | 19 | 3722 | SINGLE_NEGATIVE |
| `sem:308:require` (68) | 1 | 3740 | SINGLE_NEGATIVE |
| `sem:319:require` (72) | 1 | 3740 | SINGLE_NEGATIVE |
| `sem:fix6:validate_canonical_domain:require:'canonical integer value domain'` (91) | 96 | 3645 | SINGLE_NEGATIVE |
| `sem:45:require` (120) | 1 | 3740 | SINGLE_NEGATIVE |
| `sem:82:require` (157) | 0 | 3741 | NAMED_DUPLICATE_SET |
| `sem:83:require` (158) | 0 | 3741 | NAMED_DUPLICATE_SET |
| `sem:historical-policy:require` (164) | 16 | 3725 | SINGLE_NEGATIVE |
| `sem:99:require` (180) | 48 | 3693 | SINGLE_NEGATIVE |
| `sem:109:require` (190) | 16 | 3725 | SINGLE_NEGATIVE |
| `sem:110:require` (191) | 49 | 3692 | SINGLE_NEGATIVE |
| `sem:112:require` (193) | 16 | 3725 | SINGLE_NEGATIVE |
| `sem:113:require` (194) | 1 | 3740 | SINGLE_NEGATIVE |
| `sem:115:require` (196) | 0 | 3741 | NAMED_DUPLICATE_SET |
| `sem:116:require` (197) | 32 | 3709 | SINGLE_NEGATIVE |
| `sem:120:require` (201) | 16 | 3725 | SINGLE_NEGATIVE |
| `sem:121:require` (202) | 48 | 3693 | SINGLE_NEGATIVE |
| `sem:122:require` (203) | 16 | 3725 | SINGLE_NEGATIVE |
| `sem:124:require` (205) | 16 | 3725 | SINGLE_NEGATIVE |
| `sem:125:require` (206) | 16 | 3725 | SINGLE_NEGATIVE |
| `sem:126:require` (207) | 48 | 3693 | SINGLE_NEGATIVE |
| `sem:127:require` (208) | 48 | 3693 | SINGLE_NEGATIVE |
| `sem:128:require` (209) | 48 | 3693 | SINGLE_NEGATIVE |
| `sem:129:require` (210) | 96 | 3645 | SINGLE_NEGATIVE |
| `sem:148:require` (229) | 1 | 3740 | SINGLE_NEGATIVE |
| `sem:158:require` (239) | 3 | 3738 | SINGLE_NEGATIVE |
| `sem:159:require` (240) | 3 | 3738 | SINGLE_NEGATIVE |
| `sem:160:require` (241) | 21 | 3720 | SINGLE_NEGATIVE |
| `sem:163:require` (244) | 2 | 3739 | SINGLE_NEGATIVE |
| `sem:165:require` (246) | 0 | 3741 | NAMED_DUPLICATE_SET |
| `sem:172:require` (253) | 1 | 3740 | SINGLE_NEGATIVE |
| `sem:173:require` (254) | 9 | 3732 | SINGLE_NEGATIVE |
| `sem:176:require` (257) | 6 | 3735 | SINGLE_NEGATIVE |
| `sem:180:require` (261) | 1 | 3740 | SINGLE_NEGATIVE |
| `sem:182:require` (263) | 18 | 3723 | SINGLE_NEGATIVE |
| `sem:183:require` (264) | 21 | 3720 | SINGLE_NEGATIVE |
| `sem:184:require` (265) | 21 | 3720 | SINGLE_NEGATIVE |
| `sem:186:require` (267) | 2 | 3739 | SINGLE_NEGATIVE |
| `sem:191:require` (272) | 3 | 3738 | SINGLE_NEGATIVE |
| `sem:211:require` (291) | 2 | 3739 | SINGLE_NEGATIVE |
| `sem:216:require` (296) | 1 | 3740 | SINGLE_NEGATIVE |
| `sem:218:require` (298) | 1 | 3740 | SINGLE_NEGATIVE |
| `sem:220:require` (300) | 45 | 3696 | SINGLE_NEGATIVE |
| `sem:222:require` (302) | 26 | 3715 | SINGLE_NEGATIVE |
| `sem:224:require` (304) | 2 | 3739 | SINGLE_NEGATIVE |
| `sem:226:require` (306) | 1 | 3740 | SINGLE_NEGATIVE |
| `sem:227:require` (307) | 1 | 3740 | SINGLE_NEGATIVE |
| `sem:232:require` (312) | 8 | 3733 | SINGLE_NEGATIVE |
| `sem:234:require` (314) | 2 | 3739 | SINGLE_NEGATIVE |
| `sem:244:schema` (324) | 15 | 3726 | SINGLE_NEGATIVE |
| `sem:248:require` (332) | 16 | 3725 | SINGLE_NEGATIVE |
| `sem:249:require` (333) | 16 | 3725 | SINGLE_NEGATIVE |
| `sem:251:require` (335) | 16 | 3725 | SINGLE_NEGATIVE |
| `sem:253:require` (337) | 32 | 3709 | SINGLE_NEGATIVE |
| `sem:254:require` (338) | 32 | 3709 | SINGLE_NEGATIVE |
| `sem:257:require` (341) | 43 | 3698 | SINGLE_NEGATIVE |
| `sem:262:require` (346) | 0 | 3741 | NAMED_DUPLICATE_SET |
| `sem:265:require` (349) | 4 | 3737 | SINGLE_NEGATIVE |
| `sem:267:require` (351) | 2 | 3739 | SINGLE_NEGATIVE |
| `sem:273:require` (357) | 4 | 3737 | SINGLE_NEGATIVE |
| `sem:274:require` (358) | 91 | 3650 | SINGLE_NEGATIVE |
| `sem:275:require` (359) | 91 | 3650 | SINGLE_NEGATIVE |
| `sem:276:require` (360) | 107 | 3634 | SINGLE_NEGATIVE |
| `sem:277:require` (361) | 20 | 3721 | SINGLE_NEGATIVE |
| `sem:278:require` (362) | 220 | 3521 | SINGLE_NEGATIVE |
| `sem:281:require` (365) | 0 | 3741 | NAMED_DUPLICATE_SET |
| `sem:283:require` (367) | 56 | 3685 | SINGLE_NEGATIVE |
| `sem:290:require` (374) | 2 | 3739 | SINGLE_NEGATIVE |
| `sem:295:require` (379) | 24 | 3717 | SINGLE_NEGATIVE |
| `sem:297:require` (381) | 12 | 3729 | SINGLE_NEGATIVE |
| `sem:301:require` (385) | 16 | 3725 | SINGLE_NEGATIVE |
| `sem:302:require` (386) | 16 | 3725 | SINGLE_NEGATIVE |
| `sem:303:require` (387) | 16 | 3725 | SINGLE_NEGATIVE |
| `sem:304:require` (388) | 16 | 3725 | SINGLE_NEGATIVE |
| `sem:309:require` (393) | 16 | 3725 | SINGLE_NEGATIVE |
| `sem:310:require` (394) | 16 | 3725 | SINGLE_NEGATIVE |
| `sem:311:require` (395) | 16 | 3725 | SINGLE_NEGATIVE |
| `sem:312:require` (396) | 16 | 3725 | SINGLE_NEGATIVE |
| `sem:314:require` (398) | 17 | 3724 | SINGLE_NEGATIVE |
| `sem:316:require` (400) | 36 | 3705 | SINGLE_NEGATIVE |
| `sem:349:require` (404) | 1 | 3740 | SINGLE_NEGATIVE |
| `sem:352:require` (407) | 0 | 3741 | NAMED_DUPLICATE_SET |
| `sem:354:require` (409) | 1 | 3740 | SINGLE_NEGATIVE |
| `sem:357:require` (412) | 1 | 3740 | SINGLE_NEGATIVE |
| `sem:358:require` (413) | 1 | 3740 | SINGLE_NEGATIVE |
| `sem:359:require` (414) | 2 | 3739 | SINGLE_NEGATIVE |
| `sem:363:require` (418) | 1 | 3740 | SINGLE_NEGATIVE |
| `sem:364:require` (419) | 2 | 3739 | SINGLE_NEGATIVE |
| `sem:365:require` (420) | 2 | 3739 | SINGLE_NEGATIVE |
| `sem:366:require` (421) | 2 | 3739 | SINGLE_NEGATIVE |
| `sem:367:require` (422) | 0 | 3741 | NAMED_DUPLICATE_SET |
| `sem:368:require` (423) | 4 | 3737 | SINGLE_NEGATIVE |
| `sem:369:require` (424) | 0 | 3741 | NAMED_DUPLICATE_SET |
| `sem:371:require` (426) | 1 | 3740 | SINGLE_NEGATIVE |
| `sem:380:require` (435) | 1 | 3740 | SINGLE_NEGATIVE |
| `sem:385:require` (440) | 1 | 3740 | SINGLE_NEGATIVE |
| `sem:386:require` (441) | 1 | 3740 | SINGLE_NEGATIVE |
| `sem:387:require` (442) | 1 | 3740 | SINGLE_NEGATIVE |
| `sem:390:require` (445) | 1 | 3740 | SINGLE_NEGATIVE |
| `sem:393:require` (448) | 1 | 3740 | SINGLE_NEGATIVE |
| `sem:395:require` (450) | 1 | 3740 | SINGLE_NEGATIVE |
| `sem:396:require` (451) | 1 | 3740 | SINGLE_NEGATIVE |
| `sem:397:require` (452) | 1 | 3740 | SINGLE_NEGATIVE |
| `sem:399:require` (454) | 1 | 3740 | SINGLE_NEGATIVE |
| `sem:401:require` (456) | 1 | 3740 | SINGLE_NEGATIVE |
| `sem:403:require` (458) | 128 | 3613 | SINGLE_NEGATIVE |
| `sem:320:require` (469) | 9 | 3732 | SINGLE_NEGATIVE |
| `sem:321:require` (470) | 20 | 3721 | SINGLE_NEGATIVE |
| `sem:322:require` (471) | 1 | 3740 | SINGLE_NEGATIVE |
| `sem:323:require` (472) | 29 | 3712 | SINGLE_NEGATIVE |
| `sem:324:require` (473) | 20 | 3721 | SINGLE_NEGATIVE |
| `sem:325:require` (474) | 60 | 3681 | SINGLE_NEGATIVE |
| `sem:329:schema` (478) | 1 | 3740 | SINGLE_NEGATIVE |
| `sem:334:require` (483) | 1 | 3740 | SINGLE_NEGATIVE |
| `sem:336:require` (485) | 50 | 3691 | SINGLE_NEGATIVE |
| `sem:338:require` (487) | 1 | 3740 | SINGLE_NEGATIVE |
| `sem:342:require` (491) | 11 | 3730 | SINGLE_NEGATIVE |
| `sem:421:require` (505) | 16 | 3725 | SINGLE_NEGATIVE |
| `sem:414:require` (509) | 32 | 3709 | SINGLE_NEGATIVE |
| `sem:415:require` (510) | 32 | 3709 | SINGLE_NEGATIVE |
| `sem:416:require` (511) | 32 | 3709 | SINGLE_NEGATIVE |
| `sem:417:require` (512) | 32 | 3709 | SINGLE_NEGATIVE |
| `sem:418:require` (513) | 32 | 3709 | SINGLE_NEGATIVE |
| `sem:419:require` (514) | 32 | 3709 | SINGLE_NEGATIVE |
| `sem:445:schema` (543) | 0 | 3741 | SINGLE_TRACE_SCHEMA |
| `shape:fix6:identity:require:'identity string/nonnegative integer domain'` (17) | 0 | 3741 | NAMED_DUPLICATE_SET |
| `shape:27:schema` (29) | 179 | 3562 | SINGLE_NEGATIVE |
| `shape:30:raise` (32) | 80 | 3661 | SINGLE_NEGATIVE |
| `shape:32:raise` (34) | 32 | 3709 | SINGLE_NEGATIVE |
| `shape:34:raise` (36) | 16 | 3725 | SINGLE_NEGATIVE |
| `shape:36:raise` (38) | 15 | 3726 | SINGLE_NEGATIVE |
| `shape:40:raise` (42) | 14 | 3727 | SINGLE_NEGATIVE |
| `shape:44:schema` (46) | 39 | 3702 | SINGLE_NEGATIVE |
| `shape:48:raise` (50) | 85 | 3656 | SINGLE_NEGATIVE |
| `shape:51:raise` (53) | 41 | 3700 | SINGLE_NEGATIVE |
| `shape:55:raise` (57) | 0 | 3741 | NAMED_DUPLICATE_SET |
| `shape:57:raise` (59) | 1 | 3740 | SINGLE_NEGATIVE |
| `shape:59:raise` (61) | 1 | 3740 | SINGLE_NEGATIVE |
| `shape:61:raise` (63) | 1 | 3740 | SINGLE_NEGATIVE |
| `shape:63:raise` (65) | 1 | 3740 | SINGLE_NEGATIVE |
| `shape:65:raise` (67) | 1 | 3740 | SINGLE_NEGATIVE |
| `shape:67:raise` (69) | 1 | 3740 | SINGLE_NEGATIVE |
| `shape:69:raise` (71) | 2 | 3739 | SINGLE_NEGATIVE |
| `shape:72:raise` (74) | 1 | 3740 | SINGLE_NEGATIVE |
| `shape:75:raise` (77) | 1 | 3740 | SINGLE_NEGATIVE |
| `shape:82:raise` (84) | 1 | 3740 | SINGLE_NEGATIVE |
| `shape:84:raise` (86) | 2 | 3739 | SINGLE_NEGATIVE |
| `shape:88:raise` (90) | 1 | 3740 | SINGLE_NEGATIVE |
| `shape:92:raise` (94) | 1 | 3740 | SINGLE_NEGATIVE |
| `numeric-json-parser` (None) | 64 | 3677 | SINGLE_NEGATIVE |
| `isolated-schema:attempt.completed` (None) | 3 | 3738 | SINGLE_NEGATIVE |
| `reference-admission` (33) | 112 | 3629 | SINGLE_NEGATIVE |
| `isolated-schema:attempt.started` (None) | 2 | 3739 | SINGLE_NEGATIVE |
| `isolated-schema:node.blocked` (None) | 2 | 3739 | SINGLE_NEGATIVE |
| `isolated-schema:node.completed` (None) | 2 | 3739 | SINGLE_NEGATIVE |
| `isolated-schema:node.started` (None) | 2 | 3739 | SINGLE_NEGATIVE |
| `isolated-schema:node.unblocked` (None) | 2 | 3739 | SINGLE_NEGATIVE |
| `isolated-schema:plan.decomposition_degraded` (None) | 2 | 3739 | SINGLE_NEGATIVE |
| `isolated-schema:remediation.resolved` (None) | 2 | 3739 | SINGLE_NEGATIVE |
| `isolated-schema:remediation.spawned` (None) | 2 | 3739 | SINGLE_NEGATIVE |
| `isolated-schema:run.completed` (None) | 2 | 3739 | SINGLE_NEGATIVE |
| `isolated-schema:run.graph_integrity_failed` (None) | 2 | 3739 | SINGLE_NEGATIVE |
| `isolated-schema:run.node_backoff_expired` (None) | 2 | 3739 | SINGLE_NEGATIVE |
| `isolated-schema:run.node_backoff_started` (None) | 3 | 3738 | SINGLE_NEGATIVE |
| `isolated-schema:run.node_ready` (None) | 3 | 3738 | SINGLE_NEGATIVE |
| `isolated-schema:run.node_retry_scheduled` (None) | 2 | 3739 | SINGLE_NEGATIVE |
| `isolated-schema:scheduler.pass` (None) | 5 | 3736 | SINGLE_NEGATIVE |
| fresh payload pack owner read | 160 | 3581 | SINGLE_ROUTE |
| fresh linked dependency owner reads | 50 | 3691 | SINGLE_ROUTE |
| Trace: idempotency body comparison | 16 changed | 214 unchanged | SINGLE_TRACE |
| Trace: original receipt dedupe | 80 changed | 150 unchanged | SINGLE_TRACE |
| Trace: writer cutoff | 16 changed | 214 unchanged | SINGLE_TRACE |
| Trace: reader cutoff | 16 changed | 214 unchanged | SINGLE_TRACE |
| Trace: current read token | 16 changed | 214 unchanged | SINGLE_TRACE |
| Trace: replay cannot mint original | 16 changed | 214 unchanged | SINGLE_TRACE |
| Trace: unavailable receipt refusal | 16 changed | 214 unchanged | SINGLE_TRACE |
| Trace: rebuild source custody | 16 changed | 214 unchanged | SINGLE_TRACE |

### Necessary named sets

| Set | Exact guards removed | Necessary witnesses | Still rejected |
|---|---|---:|---:|
| compatibility-only append | `sem:82:require`, `sem:83:require` | 32 | 3709 |
| descriptor/logical/stored length | `sem:115:require`, `sem:122:require` | 16 | 3709 |
| original failed attempt identity | `sem:163:require`, `sem:165:require` | 1 | 3738 |
| unsupported timed Storage class | `sem:173:require`, `sem:222:require` | 18 | 3688 |
| same joined remediation ceiling | `sem:367:require`, `sem:369:require` | 2 | 3739 |
| node completion original state domain | `shape:44:schema`, `shape:55:raise` | 1 | 3701 |
| source score integer range domain | `sem:244:schema`, `sem:232:require` | 3 | 3715 |
| source score timestamp whole string | `sem:244:schema`, `sem:234:require` | 3 | 3721 |
| source timestamp timezone | `sem:148:require`, `sem:150:require` | 1 | 3738 |
| complete source equality | `sem:281:require`, `sem:283:require` | 197 | 3488 |
| attempt-backed blocked presence | `sem:262:require`, `sem:283:require`, `sem:352:require` | 4 | 3677 |
| attempt-backed unblocked presence | `sem:262:require`, `sem:283:require` | 4 | 3681 |
| original event value equality | `sem:109:require`, `sem:281:require`, `sem:283:require` | 16 | 3456 |
| original schema version equality/domain | `sem:244:schema`, `sem:281:require`, `sem:283:require` | 16 | 3439 |
| original required/extra field presence | `sem:244:schema`, `sem:283:require` | 18 | 3652 |
| shape generation required presence | `shape:27:schema`, `shape:36:raise` | 15 | 3532 |
| identity integer representation | `shape:fix6:identity:require:'identity string/nonnegative integer domain'`, `sem:fix6:validate_canonical_domain:require:'canonical integer value domain'` | 48 | 3597 |
| source integer representation | `sem:fix6:validate_canonical_domain:require:'canonical integer value domain'`, `sem:281:require`, `sem:283:require` | 16 | 3376 |
| shape score integer representation | `sem:99:require`, `shape:27:schema`, `sem:fix6:validate_canonical_domain:require:'canonical integer value domain'` | 2 | 3416 |
| source score integer representation | `sem:244:schema`, `sem:99:require`, `sem:232:require`, `sem:fix6:validate_canonical_domain:require:'canonical integer value domain'` | 1 | 3570 |

The 588 secondary refusal instances classify as 414 necessary same-defect named-set witnesses, 140 exact missing-object predicate proofs, 30 pure schema boundaries and four timestamp/schema/parser boundaries. Zero are unproved. The two former enum/state pairs are rejected classifications, not reused evidence: the repaired negatives now flip under their enum rule alone.

## All eleven standing checks

| Check | Result and scope for all sixteen families |
|---|---|
| 1 — replay-only | Current writer/capture and all fresh/retry/replay traces refuse projector_replay_only before effects or receipt return. Retained read route accepts it. |
| 2 — application key | Project-only families refuse application scope, including a valid CV-366 application spelling. No application identity recipe is invented. |
| 3 — Project partition | Positive captures use project~ plus unpadded base64url UTF-8 Project ID. Raw Project ID negatives reject. |
| 4 — inline/ref | Exact 16,384 inline boundary accepts, 16,385 rejects; larger bodies use SP-337. Encoded logical, pack and inline parts are measured. |
| 5 — trailing LF | Original exact-end identifier/timestamp schemas and all 22 coherent source timestamp negatives remain effective. |
| 6 — retries | Only original caller semantic bytes affect idempotency comparison. Storage-assigned metadata-only retries return one original receipt/effect. |
| 7 — Storage/checkpoint | Foreign event/source roots reject. SP-278 nine-field durable-token ownership is preserved; actual native checkpoint/CAS remains NOT_RUN. |
| 8 — exit status | No subprocess-exit family here. Closed schemas reject exit_code=0; no process-success oracle is fabricated. |
| 9 — references | Lane payload/proof graph resolves eagerly, including dormant refs and changing external resources. N2 remains a shared-graph integration note. |
| 10 — retained history | Original custody/lifecycle stays historical; fresh event, pack and every dependency disclosure authorize today’s reader. Forged/withdrawn/deleted/foreign reads refuse. |
| 11 — isolation | Whole inventory rerun under every individual/named-set mutant. Each repaired/new disclosure negative validates its positive seed; exact enum mutants expose their own negatives. |

## What Astra keeps finding — all ten classes

| Class | Own mutation and result |
|---|---|
| 1 — forged/contradictory | 198 fresh controls forge source digests/parents or contradict the original mirror; all refuse, valid seeds accept. |
| 2 — Storage metadata | 48 fresh controls cover forged reservation, injected persisted time and metadata-only retries. Refusals or original-receipt/one-effect results match. |
| 3 — history direction | 272 fresh current/replay-only lifecycle, forged-custody and disclosure controls match; 564 permanent historical cases and later-live writer refusals pass. |
| 4 — representation | 64 fresh integer/uppercase/space/LF digest mutations refuse. Typed canonical source comparisons also distinguish boolean from integer. |
| 5 — dormant refs | Sixteen fresh unvisited anyOf/dangling mutations refuse. Full CLI and same-process resource probes retain F8. |
| 6 — every stored part | 48 fresh large-ref/inline/measurement controls agree on complete MessagePack pack bytes and empty referenced inline body. No new stored operation value or owner prose contradiction. |
| 7 — every custody path | 403 fresh wrong-family/root and current-only-reader/access/deletion/scope/root probes match. Original and current snapshots are independent. Native concurrency remains NOT_RUN. |
| 8 — masked negatives | Complete guard matrix, necessary member-restoration tests, two exact enum rules and both fresh-read call deletions pass. Prerequisite/schema-only scope stays explicit. |
| 9 — grades | All 192 cells regraded from independent cycle 6. Every quotation checked against current text. Membership remains ABSENT; decomposition retention PARTIAL; native NOT_RUN preserved. |
| 10 — numbers two ways | 308 fresh probes cover each numeric identity field, 1/1.0/1e0/-0/0/0.0/01 and coherent original-source float splits. Floats refuse, -0 parses/canonicalizes exactly as 0, 01 fails JSON parsing; no double identity/digest. Forty-eight permanent source float/bool/revision negatives and 448 boundary cases pass. |

The fresh mutation artifact contains **1,357 matched rows**. Classes 8/9 are additionally supported by the full matrix and quotation/grade audits. This is a finite integer-domain fixture adapter, not certification of a native RFC8785/full EventRecord codec or a new numeric product limit.

## Checks and limits

| Check | Exit / result |
|---|---|
| Shape / identity / ref CLI | 0; 664 / 80 / 208 |
| Semantic CLI | 0; 2345 sources / 230 traces / 564 histories / 448 numeric / 16 scores / 38 isolated schemas / 208 refs / 32 helpers |
| Independent full-CLI injection | 0; 3029 sources / 364 traces; other suites retained |
| Retained independent F1–F7 / standing 1–8 | 0; 908/908 |
| Whole matrix / route matrix / necessary sets | 0; zero unproved sites/instances; exact counts above |
| Exact enum and fresh-route full CLIs | 0 for restored production; expected failures with exactly one enum keyword or fresh route removed |
| Prior reviewer witnesses | 0; 29/29 isolated; 22 trace-schema controls |
| Whole-CLI references / external resource freshness | 0; 64 expected refusals, 16 valid controls, 48 freshness outcomes, two proof-schema refusals |
| Shard check / parsed top-level index validate | 0 / pass; 99 docs, 7477 units, 29988 acceptance units; readiness blocked_runtime_certification_incomplete |
| Event-index tests / runtime vocabulary | 0, 14/14 / 1, unchanged N1 (9 tests, one failure) |
| Whitespace / source-preservation audits | 0; only two old shape fixtures rebuilt; all 2297 old source cases retained; old require boundaries retained or strengthened |

No Plans markdown changed, so no shard/index regeneration is needed. All fifteen ignored currentness inputs were copied and SHA-256 matched before index validation. No unrelated derived body changed. Frozen validator, registry, Decision Log, retention catalog, value registry, .gitignore, tests, Spec Lock, auto decisions and governance artifacts are unchanged.

**IDs used:** EP-210..225, CV-500..515, SP-500..515, ATS-250..257 — 56 existing PlanUnit IDs, **zero minted**. No new producer, consumer, projector, checkpoint, persisted family, retention policy or identity binding. No pm-mail, subagent, admission, registry append, Decision Log entry, landing lock, main push or reseal.

Initial resources were 10 GB available RAM and 116 GB free disk; subsequent samples remained above the 6 GB / 50 GB stop. The worktree is sparse and removed after the final push. Matrix/probe reproduction scripts remain outside the repository. Temporary guard experiments never persist altered checker/schema behavior; schema/fixture byte restoration is checked. Reconstructible injection inputs and uncited progress logs are removed. No browser or server was started.

## Evidence

Paths below are accompanied by SHA-256. `DX.checks.json` records the remaining evidence. The harness’s inherited revision fields refer to the starting head with a modified worktree; `input-manifest.json` pins the exact final graded bytes and supersedes that descriptive parent label.

- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DX/fix6/guard-matrix-cycle6.json` — `0816a80f392b399a79fe9266cf6dc7d6653e7a80b940cdfcb7da97b1661828a7`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DX/fix6/route-matrix.json` — `5316a6103ec7ff133c8bfe33db65494b035fc13242f1a63ca6366905b4af35c0`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DX/fix6/duplicate-proofs-cycle6.json` — `0929357864d77847c6fb1bc7eaa6f05605887b0dbb4c48ad2e7772472931567e`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DX/fix6/numeric-duplicate-proofs.json` — `705e570a82a73ff1caecd63e59468dd0078f026aed377c790c96d6fc38cfc28c`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DX/fix6/guard-assessment-cycle6.json` — `7c9abf27cd6530feb45344e0cb4156aff79121111e978a92d424a5b01eccca19`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DX/fix6/enum-proofs.json` — `de402560cdd4bbd2968ac4a7685abb7c31e3ac9b783147ea99d40fb092db211a`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DX/fix6/fresh-route-proofs.json` — `0c1323ea8cdab4ba4618050f245cc9d99d0d8c815ca747f4e065e840869889db`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DX/fix6/astra-classes.json` — `ba3edfc668d04b603bf335712b5586f325c37a1f2cdc362157c582240a348599`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DX/fix6/quote-audit.json` — `f67fe69e6853b043327349e72ddc03a01e69f7724b355ed4656dab2c9bf639f4`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DX/fix6/owner-access-evidence.json` — `6dea5fb50dff89932bd0ac94253d1d346f02545750cd8f3cab87f25033cb315b`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DX/fix6/predicate-and-baseline-audit.json` — `2d38df7580ef1a97a0e3c9d1767537f1ca0b0e3f7161e8552a8de623da386ff6`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DX/fix6/probes-cycle6.json` — `8ba3c0c5247b88449395c2baef9db5fb3ba7bae82da6d9d2fe6c7524c2da6d64`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DX/fix6/injected-check-cycle6.json` — `430af95576fb6e9496bcb5897d8b4bec866ee8330255f706aa86ce0b4f3717e1`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DX/fix6/refs-cycle6.json` — `3dee8900a8cba772f371aa101c6f18a9722282502d33dd60e64d933333238296`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DX/fix6/ref-resource-cycle6.json` — `205ab03a8c0f77128e9dfdf9cc934dddb1f057efb18a01d8c9807a431d9209c0`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DX/fix6/boundary-refusals-cycle6.json` — `b8e5d385fc949672d6c864adfb62d84d20e9652650d61994a4070e00a048f3c7`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DX/fix6/new-witnesses-cycle6.json` — `36ee668079b1073e05d158c268374e7733373dcb84000b4868e333a7b309e2c8`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DX/fix6/currentness.json` — `d509feb987c108bc388c76e45560986cd3536255c35eb914a76f07977b982e84`.

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
