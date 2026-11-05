# DX-FIX7 — RFC8785 bytes and exact typed admission

Branch: `plans/ea-w2-executor-20261104`. Reviewed head: `141bc8edfc5196be62ba5caf6290978cd2bab50e`. Graded code/fixture head: `11673e1c4ae65f3b8b88de548c0a8f877e1c62c1`. A following report-only commit preserves these bytes; `drafts/DX/head.txt` names the final pushed head. Prepared without admission. Native execution **NOT_RUN**.

**Outcome:** F1–F12 retain their passing authored regressions. F13 and F14 are fixed in the finite static model. Fifteen families self-grade PASS_AS_PREPARED_WITHOUT_ADMISSION. `plan.decomposition_degraded` keeps its Jared-only retention hold; all sixteen membership cells remain ABSENT.

## Review round 7: findings and responses

| Finding | Response | Verification |
|---|---|---|
| F1 | Retained PASS from `141bc8edfc`: original presence/mirror. | All original F1–F12 fixture values remain intact; production family CLIs and the whole matrix rerun. |
| F2 | Retained PASS from `141bc8edfc`: remediation generations. | All original F1–F12 fixture values remain intact; production family CLIs and the whole matrix rerun. |
| F3 | Retained PASS from `141bc8edfc`: classified retries and original timing. | All original F1–F12 fixture values remain intact; production family CLIs and the whole matrix rerun. |
| F4 | Retained PASS from `141bc8edfc`: integer scheduler priorities. | All original F1–F12 fixture values remain intact; production family CLIs and the whole matrix rerun. |
| F5 | Retained PASS from `141bc8edfc`: replay-only append refusal. | All original F1–F12 fixture values remain intact; production family CLIs and the whole matrix rerun. |
| F6 | Retained PASS from `141bc8edfc`: SP-337 transport/custody. | All original F1–F12 fixture values remain intact; production family CLIs and the whole matrix rerun. |
| F7 | Retained PASS from `141bc8edfc`: whole-string identifiers/timestamps. | All original F1–F12 fixture values remain intact; production family CLIs and the whole matrix rerun. |
| F8 | Retained PASS from `141bc8edfc`: eager lane refs and resource freshness. | All original F1–F12 fixture values remain intact; production family CLIs and the whole matrix rerun. |
| F9 | Retained PASS from `141bc8edfc`: successor/policy/history controls. | All original F1–F12 fixture values remain intact; production family CLIs and the whole matrix rerun. |
| F10 | Retained PASS from `141bc8edfc`: prerequisite and guard witnesses. | All original F1–F12 fixture values remain intact; production family CLIs and the whole matrix rerun. |
| F11 | Retained PASS from `141bc8edfc`: isolated enum negatives. | All original F1–F12 fixture values remain intact; production family CLIs and the whole matrix rerun. |
| F12 | Retained PASS from `141bc8edfc`: fresh current-reader authorization. | All original F1–F12 fixture values remain intact; production family CLIs and the whole matrix rerun. |
| F13 | Fixed at `11673e1c4a`. `scripts/pm_executor_event_semantics.py:78` uses RFC8785 serialization; the exact finite binary64 domain is checked before hashing. `scripts/pm_executor_event_contracts.py:13` keeps the owner-selected formula. | Literal ECMAScript byte/hash goldens; complete inline/referenced captures; ±(2^53−1), ±2^53, ±2^60 and unrepresentable neighbours. The former JSON serializer fails a full production family CLI. |
| F14 | Fixed at `11673e1c4a`. `scripts/pm_executor_event_semantics.py:119`, `:212`, `:348`, `:539` and `scripts/pm_executor_event_contracts.py:13` enforce typed values before interpreting them. | String booleans/numbers, null, arrays, nested objects, mixed grant members, inline bool/int aliases, identity fields, Storage/source references, action grants and wake clocks/identities. |

F13 preserves the owner's RFC8785 recipe in SP-500..515. Exactly representable `2^60` remains valid and emits `1152921504606847000`; unrepresentable integers refuse before identity/digest construction. No numeric maximum or owner prose was changed. The recipe follows [RFC8785 number serialization](https://www.rfc-editor.org/rfc/rfc8785.html#section-3.2.2.3) and its input representation requirement. The pure MessagePack byte helper is a separate transport codec. Both actual inline and referenced validation routes apply canonical-domain admission.

F14 uses exact booleans, typed lists/members, typed inline equality and each identity field's declared string/nonnegative-integer domain. Source metadata copies stay coherent in negatives. Source hashes are rebuilt only when the source body changes. Sixteen earlier F13 float-alias cases replace their old Python `.0` authoring digest with the proper RFC bytes; their original defect and expectation remain. Every other previously supplied source case, all old shape cases, baselines, traces and histories are preserved by `preservation.json`.

**Jared-only question, unchanged:** Should `plan.decomposition_degraded` use `RP-OPERATIONAL-2555D@1.0.0` as operational history with an approved original durable decomposition-result terminal anchor, or `RP-AUTHORITY-INDEFINITE@1.0.0` as authority/source lineage? SP-506 leaves both candidates and the proposed anchor unselected. No expiry, deletion behavior or anchor was selected.

## Family grades before and after

Counts are PASS / PARTIAL / ABSENT against independent cycle 7. The oracle cell upgrades from PARTIAL to PASS; current normative quotations are revalidated. Native NOT_RUN remains.

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

Overall: **159 PASS / 17 PARTIAL / 16 ABSENT → 175 PASS / 1 PARTIAL / 16 ABSENT**.

## Whole-lane guard-removal proof

**181 sites × 9307 authored negative instances = 1684567 evaluations**; 41630 site/trace evaluations. Both fresh owner-read routes add 18614 negative and 460 trace evaluations. 19 necessary nonempty named sets; all eight additional trace mutations are detected. Zero unproved sites, zero unproved guard/case instances, zero unrelated flips.

Each exact predicate/schema/parser boundary or named duplicate set is removed alone. Every other negative actually reruns. Every named witness refuses when any member is restored. Schema calls are aggregate boundaries; exact missing-object/schema prerequisite proofs are distinguished from full-capture acceptance. All flip IDs and changed rejection reasons remain in the hashed external matrix. Still-rejected IDs are the complete negative inventory minus each row's flip IDs, preserving duplicate authored instances. Stable AST IDs retain the review harness namespace; current lines and input hashes bind this round.

Memory is bounded by a separate process for each family, with no parallel verification in the final run. `free -g` gates each job; guard/set loops sample the equivalent MemAvailable value and pause under 6 GiB. Matrix-only caches use pristine schema results and exact immutable input/snapshot keys, including every affected encoder guard state. Changed values or guard states cannot reuse an old result. Production CLIs, the wrong-serializer CLI and own probes are uncached. `cache-control-comparison.json` reproduces the first family's complete cases, rows, reasons, traces and code hashes across the cache refinement with zero differences. The scheduler-only recovery-seed repair changes the whole fixture-file hash; the archived prior corpus and exact first-family/shared-input comparison preserve that distinction.

| Guard (line) | Negatives that flip | Negatives still rejected | Proof |
|---|---:|---:|---|
| `sem:95:require` (33) | 1 | 9306 | SINGLE_NEGATIVE |
| `sem:118:require` (37) | 1 | 9306 | SINGLE_NEGATIVE |
| `sem:150:require` (41) | 1 | 9306 | SINGLE_NEGATIVE |
| `sem:166:require` (45) | 13 | 9294 | SINGLE_NEGATIVE |
| `sem:179:require` (49) | 10 | 9297 | SINGLE_NEGATIVE |
| `sem:200:require` (53) | 1 | 9306 | SINGLE_NEGATIVE |
| `sem:205:require` (57) | 1 | 9306 | SINGLE_NEGATIVE |
| `sem:209:require` (61) | 9 | 9298 | SINGLE_NEGATIVE |
| `sem:268:require` (67) | 19 | 9288 | SINGLE_NEGATIVE |
| `sem:308:require` (71) | 1 | 9306 | SINGLE_NEGATIVE |
| `sem:319:require` (75) | 1 | 9306 | SINGLE_NEGATIVE |
| `sem:fix6:validate_canonical_domain:require:'canonical integer value domain'` (104) | 116 | 9191 | SINGLE_NEGATIVE |
| `sem:fix6:validate_canonical_domain:require:'canonical exact binary64 integer'` (110) | 277 | 9030 | SINGLE_NEGATIVE |
| `sem:45:require` (147) | 1 | 9306 | SINGLE_NEGATIVE |
| `sem:82:require` (184) | 0 | 9307 | NAMED_DUPLICATE_SET |
| `sem:83:require` (185) | 0 | 9307 | NAMED_DUPLICATE_SET |
| `sem:historical-policy:require` (191) | 16 | 9291 | SINGLE_NEGATIVE |
| `sem:99:require` (207) | 48 | 9259 | SINGLE_NEGATIVE |
| `sem:fix6:validate_payload_transport:require:'payload Storage string domain'` (214) | 320 | 8987 | SINGLE_NEGATIVE |
| `sem:109:require` (220) | 352 | 8955 | SINGLE_NEGATIVE |
| `sem:110:require` (221) | 49 | 9258 | SINGLE_NEGATIVE |
| `sem:112:require` (223) | 16 | 9291 | SINGLE_NEGATIVE |
| `sem:113:require` (224) | 1 | 9306 | SINGLE_NEGATIVE |
| `sem:115:require` (226) | 0 | 9307 | NAMED_DUPLICATE_SET |
| `sem:116:require` (227) | 32 | 9275 | SINGLE_NEGATIVE |
| `sem:120:require` (231) | 16 | 9291 | SINGLE_NEGATIVE |
| `sem:121:require` (232) | 48 | 9259 | SINGLE_NEGATIVE |
| `sem:122:require` (233) | 16 | 9291 | SINGLE_NEGATIVE |
| `sem:124:require` (235) | 16 | 9291 | SINGLE_NEGATIVE |
| `sem:125:require` (236) | 16 | 9291 | SINGLE_NEGATIVE |
| `sem:126:require` (237) | 48 | 9259 | SINGLE_NEGATIVE |
| `sem:127:require` (238) | 48 | 9259 | SINGLE_NEGATIVE |
| `sem:128:require` (239) | 48 | 9259 | SINGLE_NEGATIVE |
| `sem:129:require` (240) | 624 | 8683 | SINGLE_NEGATIVE |
| `sem:148:require` (260) | 1 | 9306 | SINGLE_NEGATIVE |
| `sem:158:require` (270) | 3 | 9304 | SINGLE_NEGATIVE |
| `sem:159:require` (271) | 3 | 9304 | SINGLE_NEGATIVE |
| `sem:160:require` (272) | 21 | 9286 | SINGLE_NEGATIVE |
| `sem:163:require` (275) | 2 | 9305 | SINGLE_NEGATIVE |
| `sem:165:require` (277) | 0 | 9307 | NAMED_DUPLICATE_SET |
| `sem:172:require` (284) | 1 | 9306 | SINGLE_NEGATIVE |
| `sem:173:require` (285) | 9 | 9298 | SINGLE_NEGATIVE |
| `sem:176:require` (288) | 6 | 9301 | SINGLE_NEGATIVE |
| `sem:180:require` (292) | 1 | 9306 | SINGLE_NEGATIVE |
| `sem:182:require` (294) | 18 | 9289 | SINGLE_NEGATIVE |
| `sem:183:require` (295) | 21 | 9286 | SINGLE_NEGATIVE |
| `sem:184:require` (296) | 21 | 9286 | SINGLE_NEGATIVE |
| `sem:186:require` (298) | 2 | 9305 | SINGLE_NEGATIVE |
| `sem:191:require` (303) | 3 | 9304 | SINGLE_NEGATIVE |
| `sem:211:require` (322) | 2 | 9305 | SINGLE_NEGATIVE |
| `sem:216:require` (327) | 1 | 9306 | SINGLE_NEGATIVE |
| `sem:218:require` (329) | 1 | 9306 | SINGLE_NEGATIVE |
| `sem:220:require` (331) | 45 | 9262 | SINGLE_NEGATIVE |
| `sem:222:require` (333) | 26 | 9281 | SINGLE_NEGATIVE |
| `sem:224:require` (335) | 2 | 9305 | SINGLE_NEGATIVE |
| `sem:226:require` (337) | 1 | 9306 | SINGLE_NEGATIVE |
| `sem:227:require` (338) | 1 | 9306 | SINGLE_NEGATIVE |
| `sem:232:require` (343) | 8 | 9299 | SINGLE_NEGATIVE |
| `sem:234:require` (345) | 2 | 9305 | SINGLE_NEGATIVE |
| `sem:244:schema` (355) | 15 | 9292 | SINGLE_NEGATIVE |
| `sem:248:require` (363) | 16 | 9291 | SINGLE_NEGATIVE |
| `sem:249:require` (364) | 16 | 9291 | SINGLE_NEGATIVE |
| `sem:251:require` (366) | 16 | 9291 | SINGLE_NEGATIVE |
| `sem:253:require` (368) | 32 | 9275 | SINGLE_NEGATIVE |
| `sem:254:require` (369) | 32 | 9275 | SINGLE_NEGATIVE |
| `sem:257:require` (372) | 43 | 9264 | SINGLE_NEGATIVE |
| `sem:262:require` (377) | 0 | 9307 | NAMED_DUPLICATE_SET |
| `sem:265:require` (380) | 4 | 9303 | SINGLE_NEGATIVE |
| `sem:267:require` (382) | 2 | 9305 | SINGLE_NEGATIVE |
| `sem:fix6:validate_capture:require:'source ref ' + slot` (388) | 235 | 9072 | SINGLE_NEGATIVE |
| `sem:273:require` (389) | 4 | 9303 | SINGLE_NEGATIVE |
| `sem:274:require` (390) | 91 | 9216 | SINGLE_NEGATIVE |
| `sem:275:require` (391) | 91 | 9216 | SINGLE_NEGATIVE |
| `sem:276:require` (392) | 123 | 9184 | SINGLE_NEGATIVE |
| `sem:277:require` (395) | 20 | 9287 | SINGLE_NEGATIVE |
| `sem:278:require` (396) | 220 | 9087 | SINGLE_NEGATIVE |
| `sem:281:require` (399) | 0 | 9307 | NAMED_DUPLICATE_SET |
| `sem:283:require` (401) | 56 | 9251 | SINGLE_NEGATIVE |
| `sem:290:require` (408) | 2 | 9305 | SINGLE_NEGATIVE |
| `sem:295:require` (413) | 24 | 9283 | SINGLE_NEGATIVE |
| `sem:297:require` (415) | 12 | 9295 | SINGLE_NEGATIVE |
| `sem:301:require` (419) | 16 | 9291 | SINGLE_NEGATIVE |
| `sem:302:require` (420) | 16 | 9291 | SINGLE_NEGATIVE |
| `sem:303:require` (421) | 16 | 9291 | SINGLE_NEGATIVE |
| `sem:304:require` (422) | 16 | 9291 | SINGLE_NEGATIVE |
| `sem:309:require` (427) | 16 | 9291 | SINGLE_NEGATIVE |
| `sem:310:require` (428) | 16 | 9291 | SINGLE_NEGATIVE |
| `sem:311:require` (429) | 16 | 9291 | SINGLE_NEGATIVE |
| `sem:312:require` (430) | 16 | 9291 | SINGLE_NEGATIVE |
| `sem:314:require` (432) | 17 | 9290 | SINGLE_NEGATIVE |
| `sem:316:require` (434) | 36 | 9271 | SINGLE_NEGATIVE |
| `sem:349:require` (438) | 1 | 9306 | SINGLE_NEGATIVE |
| `sem:352:require` (441) | 0 | 9307 | NAMED_DUPLICATE_SET |
| `sem:354:require` (443) | 1 | 9306 | SINGLE_NEGATIVE |
| `sem:357:require` (446) | 17 | 9290 | SINGLE_NEGATIVE |
| `sem:358:require` (447) | 1 | 9306 | SINGLE_NEGATIVE |
| `sem:359:require` (448) | 2 | 9305 | SINGLE_NEGATIVE |
| `sem:363:require` (452) | 1 | 9306 | SINGLE_NEGATIVE |
| `sem:364:require` (453) | 2 | 9305 | SINGLE_NEGATIVE |
| `sem:365:require` (454) | 2 | 9305 | SINGLE_NEGATIVE |
| `sem:366:require` (455) | 2 | 9305 | SINGLE_NEGATIVE |
| `sem:367:require` (456) | 2 | 9305 | SINGLE_NEGATIVE |
| `sem:368:require` (458) | 4 | 9303 | SINGLE_NEGATIVE |
| `sem:369:require` (459) | 0 | 9307 | NAMED_DUPLICATE_SET |
| `sem:371:require` (461) | 1 | 9306 | SINGLE_NEGATIVE |
| `sem:380:require` (470) | 1 | 9306 | SINGLE_NEGATIVE |
| `sem:385:require` (475) | 1 | 9306 | SINGLE_NEGATIVE |
| `sem:386:require` (476) | 1 | 9306 | SINGLE_NEGATIVE |
| `sem:387:require` (477) | 1 | 9306 | SINGLE_NEGATIVE |
| `sem:390:require` (480) | 1 | 9306 | SINGLE_NEGATIVE |
| `sem:393:require` (483) | 1 | 9306 | SINGLE_NEGATIVE |
| `sem:fix6:validate_capture:require:'scheduler wake identity/clock types'` (485) | 23 | 9284 | SINGLE_NEGATIVE |
| `sem:395:require` (490) | 1 | 9306 | SINGLE_NEGATIVE |
| `sem:396:require` (491) | 1 | 9306 | SINGLE_NEGATIVE |
| `sem:397:require` (492) | 1 | 9306 | SINGLE_NEGATIVE |
| `sem:fix6:validate_capture:require:'scheduler recovered boolean'` (493) | 9 | 9298 | SINGLE_NEGATIVE |
| `sem:399:require` (495) | 1 | 9306 | SINGLE_NEGATIVE |
| `sem:401:require` (497) | 1 | 9306 | SINGLE_NEGATIVE |
| `sem:403:require` (499) | 128 | 9179 | SINGLE_NEGATIVE |
| `sem:320:require` (510) | 9 | 9298 | SINGLE_NEGATIVE |
| `sem:321:require` (511) | 20 | 9287 | SINGLE_NEGATIVE |
| `sem:322:require` (512) | 1 | 9306 | SINGLE_NEGATIVE |
| `sem:323:require` (513) | 29 | 9278 | SINGLE_NEGATIVE |
| `sem:324:require` (514) | 20 | 9287 | SINGLE_NEGATIVE |
| `sem:325:require` (515) | 720 | 8587 | SINGLE_NEGATIVE |
| `sem:329:schema` (519) | 1 | 9306 | SINGLE_NEGATIVE |
| `sem:334:require` (524) | 1 | 9306 | SINGLE_NEGATIVE |
| `sem:336:require` (526) | 50 | 9257 | SINGLE_NEGATIVE |
| `sem:338:require` (528) | 1 | 9306 | SINGLE_NEGATIVE |
| `sem:342:require` (532) | 176 | 9131 | SINGLE_NEGATIVE |
| `sem:421:require` (546) | 16 | 9291 | SINGLE_NEGATIVE |
| `sem:414:require` (550) | 320 | 8987 | SINGLE_NEGATIVE |
| `sem:415:require` (551) | 320 | 8987 | SINGLE_NEGATIVE |
| `sem:416:require` (552) | 32 | 9275 | SINGLE_NEGATIVE |
| `sem:417:require` (553) | 384 | 8923 | SINGLE_NEGATIVE |
| `sem:418:require` (554) | 32 | 9275 | SINGLE_NEGATIVE |
| `sem:419:require` (555) | 32 | 9275 | SINGLE_NEGATIVE |
| `sem:445:schema` (584) | 0 | 9307 | SINGLE_TRACE_SCHEMA |
| `shape:fix6:identity:require:'identity declared field domain ' + field` (19) | 808 | 8499 | SINGLE_NEGATIVE |
| `shape:fix6:identity:require:'identity Storage string domain'` (22) | 160 | 9147 | SINGLE_NEGATIVE |
| `shape:27:schema` (33) | 179 | 9128 | SINGLE_NEGATIVE |
| `shape:30:raise` (36) | 800 | 8507 | SINGLE_NEGATIVE |
| `shape:32:raise` (38) | 320 | 8987 | SINGLE_NEGATIVE |
| `shape:34:raise` (40) | 16 | 9291 | SINGLE_NEGATIVE |
| `shape:36:raise` (42) | 15 | 9292 | SINGLE_NEGATIVE |
| `shape:40:raise` (46) | 14 | 9293 | SINGLE_NEGATIVE |
| `shape:44:schema` (50) | 39 | 9268 | SINGLE_NEGATIVE |
| `shape:48:raise` (54) | 85 | 9222 | SINGLE_NEGATIVE |
| `shape:51:raise` (57) | 41 | 9266 | SINGLE_NEGATIVE |
| `shape:55:raise` (61) | 0 | 9307 | NAMED_DUPLICATE_SET |
| `shape:57:raise` (63) | 10 | 9297 | SINGLE_NEGATIVE |
| `shape:59:raise` (65) | 1 | 9306 | SINGLE_NEGATIVE |
| `shape:61:raise` (67) | 1 | 9306 | SINGLE_NEGATIVE |
| `shape:63:raise` (69) | 10 | 9297 | SINGLE_NEGATIVE |
| `shape:65:raise` (71) | 10 | 9297 | SINGLE_NEGATIVE |
| `shape:67:raise` (73) | 1 | 9306 | SINGLE_NEGATIVE |
| `shape:69:raise` (75) | 2 | 9305 | SINGLE_NEGATIVE |
| `shape:72:raise` (78) | 1 | 9306 | SINGLE_NEGATIVE |
| `shape:75:raise` (81) | 1 | 9306 | SINGLE_NEGATIVE |
| `shape:82:raise` (88) | 1 | 9306 | SINGLE_NEGATIVE |
| `shape:84:raise` (90) | 2 | 9305 | SINGLE_NEGATIVE |
| `shape:88:raise` (94) | 1 | 9306 | SINGLE_NEGATIVE |
| `shape:92:raise` (98) | 1 | 9306 | SINGLE_NEGATIVE |
| `isolated-schema:attempt.completed` (None) | 3 | 9304 | SINGLE_NEGATIVE |
| `isolated-schema:attempt.started` (None) | 2 | 9305 | SINGLE_NEGATIVE |
| `isolated-schema:node.blocked` (None) | 2 | 9305 | SINGLE_NEGATIVE |
| `isolated-schema:node.completed` (None) | 2 | 9305 | SINGLE_NEGATIVE |
| `isolated-schema:node.started` (None) | 2 | 9305 | SINGLE_NEGATIVE |
| `isolated-schema:node.unblocked` (None) | 2 | 9305 | SINGLE_NEGATIVE |
| `isolated-schema:plan.decomposition_degraded` (None) | 2 | 9305 | SINGLE_NEGATIVE |
| `isolated-schema:remediation.resolved` (None) | 2 | 9305 | SINGLE_NEGATIVE |
| `isolated-schema:remediation.spawned` (None) | 2 | 9305 | SINGLE_NEGATIVE |
| `isolated-schema:run.completed` (None) | 2 | 9305 | SINGLE_NEGATIVE |
| `isolated-schema:run.graph_integrity_failed` (None) | 2 | 9305 | SINGLE_NEGATIVE |
| `isolated-schema:run.node_backoff_expired` (None) | 2 | 9305 | SINGLE_NEGATIVE |
| `isolated-schema:run.node_backoff_started` (None) | 3 | 9304 | SINGLE_NEGATIVE |
| `isolated-schema:run.node_ready` (None) | 3 | 9304 | SINGLE_NEGATIVE |
| `isolated-schema:run.node_retry_scheduled` (None) | 2 | 9305 | SINGLE_NEGATIVE |
| `isolated-schema:scheduler.pass` (None) | 5 | 9302 | SINGLE_NEGATIVE |
| `reference-admission` (33) | 112 | 9195 | SINGLE_NEGATIVE |
| `numeric-json-parser` (None) | 64 | 9243 | SINGLE_NEGATIVE |

| Named duplicate set | Guards removed | Necessary witnesses | Still rejected |
|---|---|---:|---:|
| compatibility-only append | `sem:82:require`, `sem:83:require` | 32 | 9275 |
| descriptor/logical/stored length | `sem:115:require`, `sem:122:require` | 16 | 9275 |
| original failed attempt identity | `sem:163:require`, `sem:165:require` | 1 | 9304 |
| unsupported timed Storage class | `sem:173:require`, `sem:222:require` | 18 | 9254 |
| same joined remediation ceiling | `sem:367:require`, `sem:369:require` | 2 | 9303 |
| node completion original state domain | `shape:44:schema`, `shape:55:raise` | 1 | 9267 |
| source score integer range domain | `sem:244:schema`, `sem:232:require` | 3 | 9281 |
| source score timestamp whole string | `sem:244:schema`, `sem:234:require` | 3 | 9287 |
| source timestamp timezone | `sem:148:require`, `sem:150:require` | 1 | 9304 |
| complete source equality | `sem:281:require`, `sem:283:require` | 197 | 9054 |
| attempt-backed blocked presence | `sem:262:require`, `sem:283:require`, `sem:352:require` | 4 | 9243 |
| attempt-backed unblocked presence | `sem:262:require`, `sem:283:require` | 4 | 9247 |
| original event value equality | `sem:109:require`, `sem:281:require`, `sem:283:require` | 16 | 8686 |
| original schema version equality/domain | `sem:244:schema`, `sem:281:require`, `sem:283:require` | 16 | 9005 |
| original required/extra field presence | `sem:244:schema`, `sem:283:require` | 18 | 9218 |
| shape generation required presence | `shape:27:schema`, `shape:36:raise` | 15 | 9098 |
| identity integer representation | `shape:fix6:identity:require:'identity declared field domain ' + field`, `sem:fix6:validate_canonical_domain:require:'canonical integer value domain'` | 68 | 8315 |
| shape score integer representation | `sem:99:require`, `shape:27:schema`, `sem:fix6:validate_canonical_domain:require:'canonical integer value domain'` | 2 | 8962 |
| source score integer representation | `sem:244:schema`, `sem:99:require`, `sem:232:require`, `sem:fix6:validate_canonical_domain:require:'canonical integer value domain'` | 1 | 9116 |

## All eleven standing checks

| Check | Result for all sixteen families |
|---|---|
| 1 | Current capture/shape/fresh/retry/replay projector_replay_only refusal; retained read route separate. |
| 2 | Project-only contracts reject application scope; no application key recipe authored. |
| 3 | Encoded project~ unpadded base64url partition in positives; raw-ID negatives refuse. |
| 4 | Exact 16,384/16,385 and large SP-337 references; measured logical/pack parts and custody. |
| 5 | Whole-string identifier/timestamp checks and independent schema/parser controls retained. |
| 6 | Caller semantic body only; Storage metadata-only retries retain one original receipt/effect. |
| 7 | Storage/source joins and typed identities; SP-278 nine-field token adopted; native CAS NOT_RUN. |
| 8 | No subprocess-exit family; closed schemas refuse injected success exit_code=0. |
| 9 | Every lane payload/proof ref eagerly checked, including dormant refs; shared N2 remains. |
| 10 | Immutable then-valid originals; current typed grants, availability, access/deletion/withdrawal fences. |
| 11 | Whole 181-site matrix and named necessary sets; both fresh routes; exact prerequisite/schema scope explicit. |

## What Astra keeps finding — all eleven classes

| Item | Own mutation and result |
|---|---|
| 1 forged/contradictory inputs | Forged source digest and contradictory original observation refuse; valid owner captures accept. |
| 2 Storage metadata | Forged post-state reservation refuses; metadata-only retry returns one original receipt/effect. |
| 3 historical direction | Valid retained lifecycle accepts; forged custody, withdrawal/unavailability and wrong-type disclosure flags refuse. Both retained policies remain in the permanent suite. |
| 4 one field read two ways | Upper-case source digests refuse; typed inline and identity domains prevent alternate numeric/type interpretations. |
| 5 dormant refs | Own unvisited anyOf/dangling-ref mutation refuses for every payload schema; lane graph checks and all reference fixtures pass. |
| 6 every stored part | Measured complete MessagePack body and referenced pack; the same large body refuses inline. Full native envelope/receipt codecs remain NOT_RUN. |
| 7 custody on every path | Foreign family/Project custody and independent fresh dependency denials refuse; both fresh read-route deletions expose their own negatives. |
| 8 masked negatives | Whole exact-site matrix, all necessary-member restoration tests, prerequisite/schema proofs and cache-control reproduction. |
| 9 truthful grades | All 192 cells regraded; exact current source quotations checked. Membership ABSENT and decomposition retention PARTIAL remain. |
| 10 numbers written two ways | Literal Node/ECMAScript goldens; representable binary64 boundaries, unrepresentable neighbours, alternate spellings and a failing former-serializer full CLI. |
| 11 confused types | Permanent exact-type cases plus own string-boolean, substring-grant, inline alias and direct identity mutations. Grant lists validate every member. |

## Checks and limits

| Check | Result |
|---|---|
| Shape / identity / refs | All 16 per-family CLIs exit 0; 744 shape / 80 identity-replay cases. |
| Semantic production CLIs | All 16 exit 0; source_transition_cases=2887, receipt_replay_withdrawal_traces=230, source_score_domain_cases=16, isolated_schema_cases=38, schema_reference_cases=208, historical_read_cases=564, numeric_boundary_cases=2060, exact_type_cases=3828, shared_canonical_goldens=21, shared_helper_cases=56. Shared helper/golden suites repeat per family. |
| Guard matrix / sets / routes / cache control | All sequential jobs exit 0; exact summary above. |
| Independent own probes / schema prerequisites | All per-family jobs exit 0; expected refusals and bad-serializer CLI exit 1 are recorded separately. |
| Shards / top-level index | Shards exit 0. Index exits 1, top-level fail: 22 pre-existing unrelated findings (N3); coverage passes. Ignored currentness inputs are copied and SHA-256 matched. |
| Event-index tests | Exit 0; 14 tests. |
| Runtime vocabulary | Exit 1; existing N1 Skia phrase assertion. |
| Whitespace / preservation / quotations | Pass; only the sixteen named old F13 authoring digests changed. |

N1 is the existing runtime-vocabulary assertion; N2 is the existing shared execution-context dangling `goal_body_custody.schema.json#/$defs/body_application_v1`. N3 is the full-tree index result: 21 legacy decision-ledger input errors and DL-302 present in newer origin/main but absent on this older draft. Every named ledger/Decision Log input and the index validator is byte-identical to the starting head; no indexed owner, ledger or index file changed. `index-integration-proof.json` preserves the actual exit 1 and top-level fail. These unrelated paths are not repaired by this DX worker. No GUI owner, runtime-vocabulary test or shared goal schema was edited, and no shared-graph clearance is claimed. Native owner reads, complete EventRecord/receipt codecs, Storage/checkpoint/CAS/source translation, crash/restore and concurrent withdrawal/deletion remain NOT_RUN. Existing runtime readiness is not upgraded.

No owner markdown changed; no shard/index regeneration is required. No generated body, registry, admission, Decision Log, value registry, retention catalog, .gitignore, frozen validator, Spec Lock, auto decisions or governance evidence was edited. The brief's two named local memory files were unavailable on this machine; assigned blocks and current branch evidence were read instead. One read-only mailbox query occurred before the no-mail brief was loaded; no mail was sent. Diagnostic cancellation briefly overlapped two small processes; they were stopped, and every final verification job is recorded sequentially. No subagent, browser or server was started.

**IDs used:** EP-210..225, CV-500..515, SP-500..515, ATS-250..257 — 56 existing PlanUnit IDs; **zero minted**. No new technical product binding, producer, consumer, checkpoint, persisted family, retention policy or identity formula.

## Evidence

Paths below include SHA-256. The full input manifest and executable reproduction harness are retained outside the repository. Uncited diagnostics and temporary dependencies/worktree are removed after the final push. The report-only commit does not change graded code or fixture bytes.

- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DX/fix7/guard-matrix.json` — `82fc7f7e1ba63ec6a82a6701a0f5bf6f160aec4508d9f7c4df6318ceab36b5be`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DX/fix7/duplicate-proofs.json` — `f8d63cb1f8174253c9b83f3029582f796b58b9749e59f3d5cf393de83e589769`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DX/fix7/guard-assessment.json` — `5e1d69bd91e075bbd1366e1724de27e83e08ff58d3c9552044ebd1afbdb4556a`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DX/fix7/guard-table.md` — `426f7212d52f82fa039964e5762ea0aacca1c7a97c59d1290d247f88c23c8d5c`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DX/fix7/cache-control-comparison.json` — `8106b5880a09b745b0e751484cd558579f5484a2f6742a1d43aa1433a451168c`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DX/fix7/preservation.json` — `0c784f98e826a7039ca9151d4295f436324d9c8f60ac4c367760fc323416f714`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DX/fix7/quote-audit.json` — `4f935299a7da8092433e6a6786972c9ada5ef11536b6751191dd3d7e54f3b478`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DX/fix7/family-jobs.json` — `3b1a85600f338d58cb31f2dbb97081ffcceaa2d995b6fef913c54f9e8f557603`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DX/fix7/final-checks.json` — `14e2fbbe5a458816aee9476f9796ca5b0c50c82135e15d8e659bc64d06cea597`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DX/fix7/currentness.json` — `d509feb987c108bc388c76e45560986cd3536255c35eb914a76f07977b982e84`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DX/fix7/index-integration-proof.json` — `6518512edef1ec546a6be66d8e685b9a5e605b9000a67c4b2b919a26793b4e4c`.

- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DX/fix7/input-manifest.json` — `ce21794a2f723789a8fbdf44aceabb02f34f31b4d822db584f023d346a3560f1`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DX/fix7/evidence-manifest.json` — `b20d32288c17f820d74463315358b9b8c1af5115b0a3028c5c3ada1a0a99c352`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DX/fix7/README.md` — `3c48d28dd504a96b8f6f2dc2deacc847db49849e22c3557e1612385fe3dae132`.

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
