# DX round 8 — retained recipe custody and explicit timestamp validation

Branch `plans/ea-w2-executor-20261104`; reviewed head `578ca65028307887448bb0c2280d095dc565bacc`; graded code/fixtures `8b50753c6213e706126fbd5c13a5e08212ed5de4`. The following report commit preserves those bytes. Final pushed head is copied to `drafts/DX/head.txt`. Prepared without admission. Native execution **NOT_RUN**.

## Review round 8: findings and responses

| Finding | Response and location | Verification |
|---|---|---|
| F15 | Fixed in `8b50753c6213`: `scripts/pm_executor_event_semantics.py:48` owns record-edition selection; authenticated append custody pins the complete original/body digest and original identities. SP-500..515 and CV-500..515 name the write-time rule. | All 128 unchanged predecessor originals, including all 64 former refusals, read under ordinary/replay-only policies; forged original/recipe/identity and unsupported/wrong-type edition claims reject. |
| S12-1 | Fixed in `8b50753c6213`: `scripts/pm_executor_event_semantics.py:251` and `:261` enforce grammar and Gregorian/time ranges without optional jsonschema format dependencies. | Every payload schema has valid seeds, calendar/range/separator/zone/leap/fraction/LF negatives and valid leap/fraction controls. Authenticated v0 spelling-only calendar history remains readable. |
| S12-2 | Fixed in `8b50753c6213`: `scripts/pm_executor_event_contracts.py:28` routes both backoff observations through `scripts/pm_executor_event_semantics.py:351` with the full UTC grammar. | Each clock is mutated independently from a valid ordered control; space/basic dates, missing zones, invalid ranges, empty fractions and LF refuse. Calendar/decoder duplicate removal is proved as a necessary named set. |
| F1–F14 | Earlier fixes retained. Only the 16 F13 unrepresentable-number source-hash observations were repaired to the actual authenticated old-body recipe; defect and rejection expectation stay unchanged. | Prior corpus prefix comparison, all 32 production family CLIs, original enum-only mutants and the full matrix. No guard weakened. |

**Jared-only retention question, unchanged:** Should `plan.decomposition_degraded` use `RP-OPERATIONAL-2555D@1.0.0` with an approved original durable decomposition-result terminal anchor, or `RP-AUTHORITY-INDEFINITE@1.0.0` as authority/source lineage? SP-506 remains `PENDING_RETENTION_DECISION`; no class, expiry, deletion behavior or anchor was selected.

## Stored-value rule inventory

`record_rules` alone selects numeric/format rules. `stored_rules` scopes that decision and restores it on every return/exception. New writes/current identity inputs use `executor-jcs-binary64-v1` with RFC8785 and exact finite binary64 integers; float aliases remain refused. Every retained original requires independently resolved custody. The static fixture catalogue models an authenticated Storage owner read, with recipe edition and original/body digest fixed outside the event/reader claims; native code must obtain this evidence from Storage. It is not a native allowlist, admission record or caller-extensible registry. Unknown retained provenance refuses. A reader cannot register an edition, downgrade a current write, or try an old hash after a failed current hash.

| Validation/hash path | Rule route |
|---|---|
| Current identity/idempotency/event IDs (`identity`) | `canonical` -> `record_rules`; current context by default. |
| Retained original custody and original identity (`validate_history`, `_validate_history`) | Authenticated original digest -> `record_rules`; the complete original is hashed and original stored IDs recomputed in that scoped edition. |
| Source-body digests (`validate_capture`) | `stored_digest(body, stored_sha256)` -> each source record's own authenticated recipe. |
| Dependency/evidence-list hashes and fresh read checks (`validate_dependencies`) | `stored_digest` per dependency; execution-context schema validation scopes that dependency's edition. |
| Capture numeric domains | Parent edition for metadata/payload; each stored body's own edition for body validation. A body hash cannot weaken metadata or current identity fields. |
| Typed joins and semantic equality (`same_value`) | `canonical` in the selected original/current edition; booleans never alias integers. |
| Logical inline/referenced payloads and pack bodies | `validate_payload_transport` checks the selected domain before unchanged exact MessagePack/BLAKE3 verification. |
| Payload schemas, source/score/retry clocks | `schema_validate`/`valid_timestamp`/`instant` use the selected format edition; current backoff observations also require the exact UTC grammar. |
| Append/retry trace body comparison | `digest` uses the current recipe for the trace's current-created rows; Storage metadata remains outside the caller semantic body. Retained compatibility reads use the separate scoped read path. |

The old integer recipe preserves exact decimal JSON integer bytes and old key ordering. Current RFC8785 bytes and the stricter input domain are unchanged. Both ordinary and replay-only originals keep their exact old bytes, IDs and source/dependency hashes. Format tightening likewise preserves then-valid v0 records; original semantic clock checks still apply where the old recipe required them.

## Family grades before and after

Counts are PASS / PARTIAL / ABSENT, against independent cycle 8. Membership stays ABSENT. Native NOT_RUN is unchanged.

| Family | Before | After |
|---|---|---|
| `attempt.completed` | 10 / 1 / 1 | 11 / 0 / 1 |
| `attempt.started` | 10 / 1 / 1 | 11 / 0 / 1 |
| `node.blocked` | 10 / 1 / 1 | 11 / 0 / 1 |
| `node.completed` | 10 / 1 / 1 | 11 / 0 / 1 |
| `node.started` | 10 / 1 / 1 | 11 / 0 / 1 |
| `node.unblocked` | 10 / 1 / 1 | 11 / 0 / 1 |
| `plan.decomposition_degraded` | 9 / 2 / 1 | 10 / 1 / 1 |
| `remediation.resolved` | 10 / 1 / 1 | 11 / 0 / 1 |
| `remediation.spawned` | 10 / 1 / 1 | 11 / 0 / 1 |
| `run.completed` | 10 / 1 / 1 | 11 / 0 / 1 |
| `run.graph_integrity_failed` | 10 / 1 / 1 | 11 / 0 / 1 |
| `run.node_backoff_expired` | 10 / 1 / 1 | 11 / 0 / 1 |
| `run.node_backoff_started` | 10 / 1 / 1 | 11 / 0 / 1 |
| `run.node_ready` | 10 / 1 / 1 | 11 / 0 / 1 |
| `run.node_retry_scheduled` | 10 / 1 / 1 | 11 / 0 / 1 |
| `scheduler.pass` | 10 / 1 / 1 | 11 / 0 / 1 |

Overall **159 PASS / 17 PARTIAL / 16 ABSENT → 175 PASS / 1 PARTIAL / 16 ABSENT**. Fifteen families PASS_AS_PREPARED_WITHOUT_ADMISSION; decomposition retains its one retention hold.

## Whole-lane guard matrix

**185 sites × 10203 authored negatives = 1887555 single-site evaluations.** 22 necessary nonempty named sets; both fresh owner-read routes; all eight trace mutations detected. Zero unproved sites, zero unproved guard/case instances, zero unrelated flips. Every other negative actually reruns under each singleton/set. Every named witness rejects when any member is restored.

The AST harness retains exact site IDs, current lines, input hashes, flip IDs, still-rejected IDs/reasons and changed rejection paths. Format predicates and the calendar decoder are explicit additional sites. Aggregate schema boundaries include the nested guard path they actually executed; no schema keyword completeness is inferred. Existing exact prerequisite/schema proofs remain distinguished from full-capture acceptance. Matrix-only caches bind exact typed input snapshots, every affected guard state and the active per-record recipe; production CLIs and independent probes are uncached. Each family and each guard/set runs serially, with the 6 GB memory floor and no bypass. Initial diagnostic runs were stopped and replaced; only the final same-input run is reported here.

| Guard (line) | Negatives that flip | Negatives still rejected | Proof |
|---|---:|---:|---|
| `sem:fix6:record_rules:require:'authenticated retained recipe binding'` (62) | 496 | 9707 | SINGLE_NEGATIVE |
| `sem:95:require` (105) | 1 | 10202 | SINGLE_NEGATIVE |
| `sem:118:require` (109) | 1 | 10202 | SINGLE_NEGATIVE |
| `sem:150:require` (113) | 1 | 10202 | SINGLE_NEGATIVE |
| `sem:166:require` (117) | 13 | 10190 | SINGLE_NEGATIVE |
| `sem:179:require` (121) | 10 | 10193 | SINGLE_NEGATIVE |
| `sem:200:require` (125) | 1 | 10202 | SINGLE_NEGATIVE |
| `sem:205:require` (129) | 1 | 10202 | SINGLE_NEGATIVE |
| `sem:209:require` (133) | 9 | 10194 | SINGLE_NEGATIVE |
| `sem:268:require` (139) | 19 | 10184 | SINGLE_NEGATIVE |
| `sem:308:require` (143) | 1 | 10202 | SINGLE_NEGATIVE |
| `sem:319:require` (147) | 1 | 10202 | SINGLE_NEGATIVE |
| `sem:fix6:validate_canonical_domain:require:'canonical integer value domain'` (178) | 116 | 10087 | SINGLE_NEGATIVE |
| `sem:fix6:validate_canonical_domain:require:'canonical exact binary64 integer'` (184) | 277 | 9926 | SINGLE_NEGATIVE |
| `sem:45:require` (221) | 1 | 10202 | SINGLE_NEGATIVE |
| `sem:fix6:valid_timestamp:format:'calendar validity'` (258) | 126 | 10077 | SINGLE_NEGATIVE |
| `sem:82:require` (276) | 0 | 10203 | NAMED_DUPLICATE_SET |
| `sem:83:require` (277) | 0 | 10203 | NAMED_DUPLICATE_SET |
| `sem:historical-policy:require` (283) | 16 | 10187 | SINGLE_NEGATIVE |
| `sem:99:require` (299) | 48 | 10155 | SINGLE_NEGATIVE |
| `sem:fix6:validate_payload_transport:require:'payload Storage string domain'` (306) | 320 | 9883 | SINGLE_NEGATIVE |
| `sem:109:require` (312) | 352 | 9851 | SINGLE_NEGATIVE |
| `sem:110:require` (313) | 49 | 10154 | SINGLE_NEGATIVE |
| `sem:112:require` (315) | 16 | 10187 | SINGLE_NEGATIVE |
| `sem:113:require` (316) | 1 | 10202 | SINGLE_NEGATIVE |
| `sem:115:require` (318) | 0 | 10203 | NAMED_DUPLICATE_SET |
| `sem:116:require` (319) | 32 | 10171 | SINGLE_NEGATIVE |
| `sem:120:require` (323) | 16 | 10187 | SINGLE_NEGATIVE |
| `sem:121:require` (324) | 48 | 10155 | SINGLE_NEGATIVE |
| `sem:122:require` (325) | 16 | 10187 | SINGLE_NEGATIVE |
| `sem:124:require` (327) | 16 | 10187 | SINGLE_NEGATIVE |
| `sem:125:require` (328) | 16 | 10187 | SINGLE_NEGATIVE |
| `sem:126:require` (329) | 48 | 10155 | SINGLE_NEGATIVE |
| `sem:127:require` (330) | 48 | 10155 | SINGLE_NEGATIVE |
| `sem:128:require` (331) | 48 | 10155 | SINGLE_NEGATIVE |
| `sem:129:require` (332) | 624 | 9579 | SINGLE_NEGATIVE |
| `sem:148:require` (352) | 11 | 10192 | SINGLE_NEGATIVE |
| `sem:fix6:instant:parser:'timestamp calendar parser'` (353) | 0 | 10203 | NAMED_DUPLICATE_SET |
| `sem:158:require` (362) | 3 | 10200 | SINGLE_NEGATIVE |
| `sem:159:require` (363) | 3 | 10200 | SINGLE_NEGATIVE |
| `sem:160:require` (364) | 21 | 10182 | SINGLE_NEGATIVE |
| `sem:163:require` (367) | 2 | 10201 | SINGLE_NEGATIVE |
| `sem:165:require` (369) | 0 | 10203 | NAMED_DUPLICATE_SET |
| `sem:172:require` (376) | 1 | 10202 | SINGLE_NEGATIVE |
| `sem:173:require` (377) | 9 | 10194 | SINGLE_NEGATIVE |
| `sem:176:require` (380) | 6 | 10197 | SINGLE_NEGATIVE |
| `sem:180:require` (384) | 1 | 10202 | SINGLE_NEGATIVE |
| `sem:182:require` (386) | 18 | 10185 | SINGLE_NEGATIVE |
| `sem:183:require` (387) | 21 | 10182 | SINGLE_NEGATIVE |
| `sem:184:require` (388) | 21 | 10182 | SINGLE_NEGATIVE |
| `sem:186:require` (390) | 2 | 10201 | SINGLE_NEGATIVE |
| `sem:191:require` (395) | 3 | 10200 | SINGLE_NEGATIVE |
| `sem:211:require` (414) | 2 | 10201 | SINGLE_NEGATIVE |
| `sem:216:require` (419) | 1 | 10202 | SINGLE_NEGATIVE |
| `sem:218:require` (421) | 1 | 10202 | SINGLE_NEGATIVE |
| `sem:220:require` (423) | 45 | 10158 | SINGLE_NEGATIVE |
| `sem:222:require` (425) | 26 | 10177 | SINGLE_NEGATIVE |
| `sem:224:require` (427) | 2 | 10201 | SINGLE_NEGATIVE |
| `sem:226:require` (429) | 1 | 10202 | SINGLE_NEGATIVE |
| `sem:227:require` (430) | 1 | 10202 | SINGLE_NEGATIVE |
| `sem:232:require` (435) | 8 | 10195 | SINGLE_NEGATIVE |
| `sem:234:require` (437) | 2 | 10201 | SINGLE_NEGATIVE |
| `sem:244:schema` (447) | 15 | 10188 | SINGLE_NEGATIVE |
| `sem:248:require` (455) | 16 | 10187 | SINGLE_NEGATIVE |
| `sem:249:require` (456) | 16 | 10187 | SINGLE_NEGATIVE |
| `sem:251:require` (458) | 16 | 10187 | SINGLE_NEGATIVE |
| `sem:253:require` (460) | 32 | 10171 | SINGLE_NEGATIVE |
| `sem:254:require` (461) | 32 | 10171 | SINGLE_NEGATIVE |
| `sem:257:require` (464) | 43 | 10160 | SINGLE_NEGATIVE |
| `sem:262:require` (469) | 0 | 10203 | NAMED_DUPLICATE_SET |
| `sem:265:require` (472) | 4 | 10199 | SINGLE_NEGATIVE |
| `sem:267:require` (474) | 2 | 10201 | SINGLE_NEGATIVE |
| `sem:fix6:validate_capture:require:'source ref ' + slot` (480) | 235 | 9968 | SINGLE_NEGATIVE |
| `sem:273:require` (481) | 4 | 10199 | SINGLE_NEGATIVE |
| `sem:274:require` (482) | 91 | 10112 | SINGLE_NEGATIVE |
| `sem:275:require` (483) | 91 | 10112 | SINGLE_NEGATIVE |
| `sem:276:require` (484) | 123 | 10080 | SINGLE_NEGATIVE |
| `sem:277:require` (487) | 20 | 10183 | SINGLE_NEGATIVE |
| `sem:278:require` (488) | 220 | 9983 | SINGLE_NEGATIVE |
| `sem:281:require` (491) | 0 | 10203 | NAMED_DUPLICATE_SET |
| `sem:283:require` (493) | 56 | 10147 | SINGLE_NEGATIVE |
| `sem:290:require` (500) | 2 | 10201 | SINGLE_NEGATIVE |
| `sem:295:require` (505) | 24 | 10179 | SINGLE_NEGATIVE |
| `sem:297:require` (507) | 12 | 10191 | SINGLE_NEGATIVE |
| `sem:301:require` (511) | 16 | 10187 | SINGLE_NEGATIVE |
| `sem:302:require` (512) | 16 | 10187 | SINGLE_NEGATIVE |
| `sem:303:require` (513) | 16 | 10187 | SINGLE_NEGATIVE |
| `sem:304:require` (514) | 16 | 10187 | SINGLE_NEGATIVE |
| `sem:309:require` (519) | 16 | 10187 | SINGLE_NEGATIVE |
| `sem:310:require` (520) | 16 | 10187 | SINGLE_NEGATIVE |
| `sem:311:require` (521) | 16 | 10187 | SINGLE_NEGATIVE |
| `sem:312:require` (522) | 16 | 10187 | SINGLE_NEGATIVE |
| `sem:314:require` (524) | 17 | 10186 | SINGLE_NEGATIVE |
| `sem:316:require` (526) | 36 | 10167 | SINGLE_NEGATIVE |
| `sem:349:require` (530) | 1 | 10202 | SINGLE_NEGATIVE |
| `sem:352:require` (533) | 0 | 10203 | NAMED_DUPLICATE_SET |
| `sem:354:require` (535) | 1 | 10202 | SINGLE_NEGATIVE |
| `sem:357:require` (538) | 17 | 10186 | SINGLE_NEGATIVE |
| `sem:358:require` (539) | 1 | 10202 | SINGLE_NEGATIVE |
| `sem:359:require` (540) | 2 | 10201 | SINGLE_NEGATIVE |
| `sem:363:require` (544) | 1 | 10202 | SINGLE_NEGATIVE |
| `sem:364:require` (545) | 2 | 10201 | SINGLE_NEGATIVE |
| `sem:365:require` (546) | 2 | 10201 | SINGLE_NEGATIVE |
| `sem:366:require` (547) | 2 | 10201 | SINGLE_NEGATIVE |
| `sem:367:require` (548) | 2 | 10201 | SINGLE_NEGATIVE |
| `sem:368:require` (550) | 4 | 10199 | SINGLE_NEGATIVE |
| `sem:369:require` (551) | 0 | 10203 | NAMED_DUPLICATE_SET |
| `sem:371:require` (553) | 1 | 10202 | SINGLE_NEGATIVE |
| `sem:380:require` (562) | 1 | 10202 | SINGLE_NEGATIVE |
| `sem:385:require` (567) | 1 | 10202 | SINGLE_NEGATIVE |
| `sem:386:require` (568) | 1 | 10202 | SINGLE_NEGATIVE |
| `sem:387:require` (569) | 1 | 10202 | SINGLE_NEGATIVE |
| `sem:390:require` (572) | 1 | 10202 | SINGLE_NEGATIVE |
| `sem:393:require` (575) | 1 | 10202 | SINGLE_NEGATIVE |
| `sem:fix6:validate_capture:require:'scheduler wake identity/clock types'` (577) | 23 | 10180 | SINGLE_NEGATIVE |
| `sem:395:require` (582) | 1 | 10202 | SINGLE_NEGATIVE |
| `sem:396:require` (583) | 1 | 10202 | SINGLE_NEGATIVE |
| `sem:397:require` (584) | 1 | 10202 | SINGLE_NEGATIVE |
| `sem:fix6:validate_capture:require:'scheduler recovered boolean'` (585) | 9 | 10194 | SINGLE_NEGATIVE |
| `sem:399:require` (587) | 1 | 10202 | SINGLE_NEGATIVE |
| `sem:401:require` (589) | 1 | 10202 | SINGLE_NEGATIVE |
| `sem:403:require` (591) | 128 | 10075 | SINGLE_NEGATIVE |
| `sem:320:require` (602) | 9 | 10194 | SINGLE_NEGATIVE |
| `sem:321:require` (603) | 20 | 10183 | SINGLE_NEGATIVE |
| `sem:322:require` (604) | 1 | 10202 | SINGLE_NEGATIVE |
| `sem:323:require` (605) | 29 | 10174 | SINGLE_NEGATIVE |
| `sem:324:require` (606) | 20 | 10183 | SINGLE_NEGATIVE |
| `sem:325:require` (607) | 720 | 9483 | SINGLE_NEGATIVE |
| `sem:329:schema` (612) | 1 | 10202 | SINGLE_NEGATIVE |
| `sem:334:require` (617) | 1 | 10202 | SINGLE_NEGATIVE |
| `sem:336:require` (619) | 50 | 10153 | SINGLE_NEGATIVE |
| `sem:338:require` (621) | 1 | 10202 | SINGLE_NEGATIVE |
| `sem:342:require` (625) | 176 | 10027 | SINGLE_NEGATIVE |
| `sem:421:require` (644) | 144 | 10059 | SINGLE_NEGATIVE |
| `sem:fix6:_validate_history:require:'retained original identity'` (647) | 16 | 10187 | SINGLE_NEGATIVE |
| `sem:414:require` (653) | 320 | 9883 | SINGLE_NEGATIVE |
| `sem:415:require` (654) | 320 | 9883 | SINGLE_NEGATIVE |
| `sem:416:require` (655) | 32 | 10171 | SINGLE_NEGATIVE |
| `sem:417:require` (656) | 384 | 9819 | SINGLE_NEGATIVE |
| `sem:418:require` (657) | 32 | 10171 | SINGLE_NEGATIVE |
| `sem:419:require` (658) | 32 | 10171 | SINGLE_NEGATIVE |
| `sem:445:schema` (687) | 0 | 10203 | SINGLE_TRACE_SCHEMA |
| `shape:fix6:identity:require:'identity declared field domain ' + field` (19) | 808 | 9395 | SINGLE_NEGATIVE |
| `shape:fix6:identity:require:'identity Storage string domain'` (22) | 160 | 10043 | SINGLE_NEGATIVE |
| `shape:27:schema` (33) | 179 | 10024 | SINGLE_NEGATIVE |
| `shape:30:raise` (36) | 800 | 9403 | SINGLE_NEGATIVE |
| `shape:32:raise` (38) | 320 | 9883 | SINGLE_NEGATIVE |
| `shape:34:raise` (40) | 16 | 10187 | SINGLE_NEGATIVE |
| `shape:36:raise` (42) | 15 | 10188 | SINGLE_NEGATIVE |
| `shape:40:raise` (46) | 14 | 10189 | SINGLE_NEGATIVE |
| `shape:44:schema` (50) | 39 | 10164 | SINGLE_NEGATIVE |
| `shape:48:raise` (54) | 85 | 10118 | SINGLE_NEGATIVE |
| `shape:51:raise` (57) | 41 | 10162 | SINGLE_NEGATIVE |
| `shape:55:raise` (61) | 0 | 10203 | NAMED_DUPLICATE_SET |
| `shape:57:raise` (63) | 10 | 10193 | SINGLE_NEGATIVE |
| `shape:59:raise` (65) | 1 | 10202 | SINGLE_NEGATIVE |
| `shape:61:raise` (67) | 1 | 10202 | SINGLE_NEGATIVE |
| `shape:63:raise` (69) | 10 | 10193 | SINGLE_NEGATIVE |
| `shape:65:raise` (71) | 10 | 10193 | SINGLE_NEGATIVE |
| `shape:67:raise` (73) | 1 | 10202 | SINGLE_NEGATIVE |
| `shape:69:raise` (75) | 2 | 10201 | SINGLE_NEGATIVE |
| `shape:72:raise` (78) | 1 | 10202 | SINGLE_NEGATIVE |
| `shape:75:raise` (81) | 1 | 10202 | SINGLE_NEGATIVE |
| `shape:82:raise` (88) | 1 | 10202 | SINGLE_NEGATIVE |
| `shape:84:raise` (90) | 2 | 10201 | SINGLE_NEGATIVE |
| `shape:88:raise` (94) | 1 | 10202 | SINGLE_NEGATIVE |
| `shape:92:raise` (98) | 1 | 10202 | SINGLE_NEGATIVE |
| `isolated-schema:attempt.completed` (None) | 29 | 10174 | SINGLE_NEGATIVE |
| `isolated-schema:attempt.started` (None) | 15 | 10188 | SINGLE_NEGATIVE |
| `isolated-schema:node.blocked` (None) | 15 | 10188 | SINGLE_NEGATIVE |
| `isolated-schema:node.completed` (None) | 15 | 10188 | SINGLE_NEGATIVE |
| `isolated-schema:node.started` (None) | 15 | 10188 | SINGLE_NEGATIVE |
| `isolated-schema:node.unblocked` (None) | 15 | 10188 | SINGLE_NEGATIVE |
| `isolated-schema:plan.decomposition_degraded` (None) | 15 | 10188 | SINGLE_NEGATIVE |
| `isolated-schema:remediation.resolved` (None) | 15 | 10188 | SINGLE_NEGATIVE |
| `isolated-schema:remediation.spawned` (None) | 15 | 10188 | SINGLE_NEGATIVE |
| `isolated-schema:run.completed` (None) | 15 | 10188 | SINGLE_NEGATIVE |
| `isolated-schema:run.graph_integrity_failed` (None) | 15 | 10188 | SINGLE_NEGATIVE |
| `isolated-schema:run.node_backoff_expired` (None) | 15 | 10188 | SINGLE_NEGATIVE |
| `isolated-schema:run.node_backoff_started` (None) | 29 | 10174 | SINGLE_NEGATIVE |
| `isolated-schema:run.node_ready` (None) | 16 | 10187 | SINGLE_NEGATIVE |
| `isolated-schema:run.node_retry_scheduled` (None) | 15 | 10188 | SINGLE_NEGATIVE |
| `isolated-schema:scheduler.pass` (None) | 18 | 10185 | SINGLE_NEGATIVE |
| `reference-admission` (33) | 112 | 10091 | SINGLE_NEGATIVE |
| `numeric-json-parser` (None) | 64 | 10139 | SINGLE_NEGATIVE |

| Named duplicate set | Guards removed | Necessary witnesses | Still rejected |
|---|---|---:|---:|
| compatibility-only append | `sem:82:require`, `sem:83:require` | 32 | 10171 |
| descriptor/logical/stored length | `sem:115:require`, `sem:122:require` | 16 | 10171 |
| original failed attempt identity | `sem:163:require`, `sem:165:require` | 1 | 10200 |
| unsupported timed Storage class | `sem:173:require`, `sem:222:require` | 18 | 10150 |
| same joined remediation ceiling | `sem:367:require`, `sem:369:require` | 2 | 10199 |
| node completion original state domain | `shape:44:schema`, `shape:55:raise` | 1 | 10163 |
| source score integer range domain | `sem:244:schema`, `sem:232:require` | 3 | 10177 |
| source score timestamp whole string | `sem:244:schema`, `sem:234:require` | 3 | 10183 |
| source timestamp timezone | `sem:148:require`, `sem:150:require` | 1 | 10190 |
| complete source equality | `sem:281:require`, `sem:283:require` | 197 | 9950 |
| attempt-backed blocked presence | `sem:262:require`, `sem:283:require`, `sem:352:require` | 4 | 10139 |
| attempt-backed unblocked presence | `sem:262:require`, `sem:283:require` | 4 | 10143 |
| original event value equality | `sem:109:require`, `sem:281:require`, `sem:283:require` | 16 | 9582 |
| original schema version equality/domain | `sem:244:schema`, `sem:281:require`, `sem:283:require` | 16 | 9901 |
| original required/extra field presence | `sem:244:schema`, `sem:283:require` | 18 | 10114 |
| shape generation required presence | `shape:27:schema`, `shape:36:raise` | 15 | 9994 |
| identity integer representation | `shape:fix6:identity:require:'identity declared field domain ' + field`, `sem:fix6:validate_canonical_domain:require:'canonical integer value domain'` | 68 | 9211 |
| shape score integer representation | `sem:99:require`, `shape:27:schema`, `sem:fix6:validate_canonical_domain:require:'canonical integer value domain'` | 2 | 9858 |
| source score integer representation | `sem:244:schema`, `sem:99:require`, `sem:232:require`, `sem:fix6:validate_canonical_domain:require:'canonical integer value domain'` | 1 | 10012 |
| whole clock grammar/decoder | `sem:148:require`, `sem:fix6:instant:parser:'timestamp calendar parser'` | 13 | 10179 |
| timestamp calendar duplicate format/parser | `sem:fix6:valid_timestamp:format:'calendar validity'`, `sem:fix6:instant:parser:'timestamp calendar parser'` | 8 | 10069 |
| shape timestamp schema/grammar/decoder | `shape:27:schema`, `sem:148:require`, `sem:fix6:instant:parser:'timestamp calendar parser'` | 1 | 9999 |

## All eleven standing checks

| Check | How ruled out |
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
| 10 | Authenticated write-time numeric/format editions preserve ordinary and replay-only retained records; all 128 predecessor controls read, and forgeries refuse. |
| 11 | Whole 185-site matrix, necessary named sets and both fresh routes; exact schema/prerequisite scope remains explicit. |

## Every Astra class

| Item | Own mutation and result |
|---|---|
| 1 forged/contradictory values | Forged source digest, original mirror, retained original and stored identity reject; coherent controls accept. |
| 2 Storage metadata | Forged reserved/post-state sequence rejects; metadata-only retry returns the original receipt and one effect. |
| 3 historical direction | All 128 predecessor controls accept with unchanged custody; forged, withdrawn, unavailable, deleted and foreign disclosure values reject. |
| 4 one field read two ways | Upper-case digests, bool/int aliases and alternate recipe claims refuse. A body commitment selects one recipe before validation/hashing. |
| 5 dormant refs | An unvisited dangling anyOf reference refuses for every family; whole lane payload/proof graph is checked eagerly. Shared N2 is not cleared. |
| 6 every stored part | Full MessagePack bytes and referenced pack custody measured; same oversized body refuses inline. Native full envelope/receipt codecs remain NOT_RUN. |
| 7 custody on every path | Foreign family/Project/Storage and independent current-reader dependency denials refuse; removing either fresh route exposes its own negatives. |
| 8 masked negatives | Whole-lane singleton/set/restoration proof. Sixteen newly exposed F13 source-hash observations were repaired, then the entire matrix restarted. |
| 9 truthful grades | All 192 cells have mechanically revalidated current quotations. Membership ABSENT, decomposition retention PARTIAL, native NOT_RUN remain explicit. |
| 10 numeric spelling | Independent ECMAScript goldens, exact representable boundaries/unrepresentable neighbours, floats/exponents/negative zero/invalid lexical form and full bad-serializer CLI mutation. |
| 10a no historical tightening | Authenticated per-original/per-body edition selection; all 64 former refusals now read. Forged weaker/unsupported/wrong-type recipe claims and originals refuse; old-format retained positives remain readable. |
| 11 exact types | All prior 3,828 type fixtures plus new recipe selector type negatives; string booleans/numbers, null, arrays, nested objects, substring grants and inline aliases refuse. |
| 12 enforced formats | Standalone schema calendar negatives, every top-level/nested formatted payload route and independently mutated backoff clocks; leap/fraction controls, grammar/range/LF negatives, explicit calendar/decoder sensitivity. |

## Checks and limits

```json
{
  "source_transition_cases": 2887,
  "receipt_replay_withdrawal_traces": 230,
  "source_score_domain_cases": 16,
  "isolated_schema_cases": 326,
  "schema_reference_cases": 208,
  "historical_read_cases": 1345,
  "numeric_boundary_cases": 2060,
  "exact_type_cases": 3828,
  "shared_helpers_per_family_process": 56,
  "shared_goldens_per_family_process": 21,
  "shape_cases": 766
}
```

| Check | Exit |
|---|---:|
| astra-attempt.completed | 0 |
| boundaries-attempt.completed | 0 |
| astra-attempt.started | 0 |
| boundaries-attempt.started | 0 |
| astra-node.blocked | 0 |
| boundaries-node.blocked | 0 |
| astra-node.completed | 0 |
| boundaries-node.completed | 0 |
| astra-node.started | 0 |
| boundaries-node.started | 0 |
| astra-node.unblocked | 0 |
| boundaries-node.unblocked | 0 |
| astra-plan.decomposition_degraded | 0 |
| boundaries-plan.decomposition_degraded | 0 |
| astra-remediation.resolved | 0 |
| boundaries-remediation.resolved | 0 |
| astra-remediation.spawned | 0 |
| boundaries-remediation.spawned | 0 |
| astra-run.completed | 0 |
| boundaries-run.completed | 0 |
| astra-run.graph_integrity_failed | 0 |
| boundaries-run.graph_integrity_failed | 0 |
| astra-run.node_backoff_expired | 0 |
| boundaries-run.node_backoff_expired | 0 |
| astra-run.node_backoff_started | 0 |
| boundaries-run.node_backoff_started | 0 |
| astra-run.node_ready | 0 |
| boundaries-run.node_ready | 0 |
| astra-run.node_retry_scheduled | 0 |
| boundaries-run.node_retry_scheduled | 0 |
| astra-scheduler.pass | 0 |
| boundaries-scheduler.pass | 0 |
| boundaries-helpers | 0 |
| independent-own | 0 |
| format-routes | 0 |
| enum-proofs | 0 |
| shards-generate | 0 |
| index-generate | 0 |
| shards-check | 0 |
| index-validate | 1 |
| event-index-tests | 0 |
| runtime-vocabulary-tests | 1 |
| diff-check | 0 |

Raw index validation is reported by its top-level status, never a nested pass. N1 is the prior runtime-vocabulary missing Skia phrase assertion; N2 is the prior shared execution-context dangling goal-body reference, outside this lane's whole-schema admission surface. N3 is the older branch/newer-main legacy-ledger and DL-302 index integration mismatch. The actual final logs and integration proof preserve nonzero results; no baseline, governance artifact or unrelated owner was repaired to turn them green. Native Storage/checkpoint/CAS/restore/withdrawal execution and full native wire receipts remain NOT_RUN.

Owner amendments affect only CV-500..515 and SP-500..515; their derived shards/index are regenerated with all fifteen currentness inputs SHA-256 matched. Earlier source/shape/type cases, traces, baselines and histories are preserved, except the documented sixteen source-hash coherence repairs. New recipe labels are technical write-time provenance bindings under existing DL-045 scope, not a new product feature, payload version or persisted family. No registry append, admission, Decision Log, governance reseal, retention selection or test-file edit occurred. No subagent/browser/server was started. One read-only mailbox query preceded loading the no-mail brief; no further mailbox use or messages occurred.

**IDs used:** EP-210..225, CV-500..515, SP-500..515, ATS-250..257: 56 existing PlanUnit IDs; zero minted.

## Evidence

Every path below is external raw evidence with SHA-256. The executable harness and complete evidence manifest remain beside it. Final deliverable copies overwrite `drafts/DX/DX.*`.

- `/mnt/Cursor/archive/PuppetMaster-Evidence/event-authority-20261104/drafts/DX/fix8/guard-assessment.json` — `1cc2345df717481cac264a9ae62e8f5d00c70f5394ff44235f84be8bcb0357d0`.
- `/mnt/Cursor/archive/PuppetMaster-Evidence/event-authority-20261104/drafts/DX/fix8/guard-matrix.json` — `6131a0377d7b89d4e7f888c48b24387388d9fb84ad94c4b9e45f92415745fca3`.
- `/mnt/Cursor/archive/PuppetMaster-Evidence/event-authority-20261104/drafts/DX/fix8/duplicate-proofs.json` — `04eab95ac74b75116c58b9f6ea02dd4e4b7503696c2ac24eae52b1cd00c5ef44`.
- `/mnt/Cursor/archive/PuppetMaster-Evidence/event-authority-20261104/drafts/DX/fix8/guard-table.md` — `cea3d0df73eb4cb337d96cc52eac624f4cd314aa580d2441d13149fea22922f3`.
- `/mnt/Cursor/archive/PuppetMaster-Evidence/event-authority-20261104/drafts/DX/fix8/family-jobs.json` — `45d80dfcd98f33652605d3f65b7f1892505cb5de3aa80f088e306c8a40d5a679`.
- `/mnt/Cursor/archive/PuppetMaster-Evidence/event-authority-20261104/drafts/DX/fix8/final-checks.json` — `3670f7d4e35ef59b8302f902aaf925a55b649d99415f67866547a68acf0a0fef`.
- `/mnt/Cursor/archive/PuppetMaster-Evidence/event-authority-20261104/drafts/DX/fix8/own-fixed.json` — `e25556b0e8fd03b4da8f2a2dcef7de84bc805f69e0e6e0dbbf5255403310a63e`.
- `/mnt/Cursor/archive/PuppetMaster-Evidence/event-authority-20261104/drafts/DX/fix8/preservation.json` — `3d6349cfa5ad05597fcf8626538d67de510117c51adddf72fdc5ec460509a9a4`.
- `/mnt/Cursor/archive/PuppetMaster-Evidence/event-authority-20261104/drafts/DX/fix8/number-custody-repair.json` — `d76afaf7e6a71a8930beab4f02933dacbaae5797aec0a55f769718fdc02622e4`.
- `/mnt/Cursor/archive/PuppetMaster-Evidence/event-authority-20261104/drafts/DX/fix8/quote-audit.json` — `7150741f2030487a2df96956b29fbff0308c9bb934301b6a4921a0884cdfd95a`.
- `/mnt/Cursor/archive/PuppetMaster-Evidence/event-authority-20261104/drafts/DX/fix8/currentness.json` — `b72623c6887c9cb3b53eb0da0baf1e1b8c0b5d46fe116d4f25746361bbe73b8b`.
- `/mnt/Cursor/archive/PuppetMaster-Evidence/event-authority-20261104/drafts/DX/fix8/clock-isolation-repair.json` — `6ed4c39c929ddf7c51f3c65314f8fd233d8e33ea5a29e71ee5023afb4898b4b6`.
- `/mnt/Cursor/archive/PuppetMaster-Evidence/event-authority-20261104/drafts/DX/fix8/additional-jobs.json` — `8f31f5aa8f6c5ea159f408cfb987578017d5920dc0b63b0764786e5a229218f0`.
- `/mnt/Cursor/archive/PuppetMaster-Evidence/event-authority-20261104/drafts/DX/fix8/format-routes.json` — `dc66721f5c528b435f720514f151ba1d9fc2282f0cdfc9b7b30f66642218a284`.
- `/mnt/Cursor/archive/PuppetMaster-Evidence/event-authority-20261104/drafts/DX/fix8/index-integration-proof.json` — `8d299ed6a0416388c25d36a9d010f1c67fbb359dfc999469b4b927abbcf0a8a1`.

## Original contract binding/search lineage

The earlier per-family searches and newly authored bindings below are retained as source lineage. Their earlier grades are superseded by this round. The original binding searches remain source lineage; CV-500..515 and SP-500..515 receive this round’s numeric/format amendments.

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

## Reproduction manifest

- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DX/fix8/input-manifest.json` — `6a633fbbca1df7e3f227f2323a11551cab98793843940e158486568d48d08219`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DX/fix8/evidence-manifest.json` — `8c9715868b241ef43df1d7ceb0a03518f7e42ece043fe2bfdb1e629f9a382827`.

Memory-floor pauses occurred during the final run and resumed only after recovery to 6 GB. The added schema/grammar/decoder set reran the complete negative inventory for every family after the singleton matrix; no product input or singleton predicate changed. Owner hash staleness is left for the assigned governance reseal after integration.
