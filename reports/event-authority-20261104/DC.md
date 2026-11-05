# Lane DC — review round 2

Branch `plans/ea-collab-prep-20261104`; reviewed head `d6f7d7cd788313d613cc5341f2c295e82467cf56`; tested code/Plans head `8af041e0188a09b38b55b6f1159b5c0ca04c8cb1`. The following report commit changes reports only.

All four round-two findings are fixed. All eighteen families have 10 PASS / 1 PARTIAL / 1 ABSENT normative cells. Membership stays ABSENT and the already decided Chat policy object remains a separate integration dependency. Native execution stays NOT_RUN. No family is admitted and no Decision Log, governance lock or frozen validator is changed.

## Review round 2: findings and responses

| Finding | Response and verification |
|---|---|
| C2-B1 — fixed in `24b574281753fd772abfb045458680efb054c4e4` | SP-460/CWR-105/CV-460 and source_fact_rejection recompute field-level joins: exact committed state, full ordered roster, nested instance/Server/thread, native currentness, optional requiredness, original attempt, vote constraints, actual artifact custody, original Plan output versus launching Plan, and Review reviewer/target/count evidence. Remaining owner-control fields have an exact independently captured field set. Contradictory positives are repaired; full prepared-event negatives and valid counterparts cover both scopes. |
| C2-B2 — fixed in `24b574281753fd772abfb045458680efb054c4e4` | Four explicit StorageApplicationV2 wrapper successors preserve every original V1 definition and logical record. Complete MessagePack wrapper size is checked separately from the EventRecord body. Each wrapper has exact 16,384/16,385-byte tests, a valid SP-337 reference counterpart, missing/forged pack negatives and type-preserving resolved-record equality. The inventory includes all stored parts. |
| Sweep 10 / SW-1 — fixed in `24b574281753fd772abfb045458680efb054c4e4` | Lossless decimal/exponent decoding precedes binary64; unsafe pre-rounded integral floats refuse. Admitted equivalent values share operation/event/key/semantic/snapshot commitments. Legal per-family vectors cover safe-integer boundaries, large exponents and negative zero; malformed, nonfinite and lossy decimals refuse. Source reference revisions use the same number recipe. Existing owner/MessagePack float domains remain distinct. |
| Sweep 11 / SW-2 — fixed in `24b574281753fd772abfb045458680efb054c4e4` | Historical withdrawn/retained controls require exact booleans; retention controls require exact native types; epochs and original source slots are typed before use. Type-preserving comparisons distinguish boolean and number values. String booleans/numbers, null, arrays and objects have isolated negatives, including referenced original records. |

No finding is disputed or stopped for Jared. Earlier B1–B8, S1–S3, CWR-105..123 and E-CARDS-1 1c A remain in force. Existing payload, transition, checkpoint and original schema cases are preserved; only the earlier inline-plus-reference negative gains its missing matching pack witness. All oracles remain in the existing script.

## Family grades before and after

Before is the binding cycle-2 independent review. P/Q/A mean PASS/PARTIAL/ABSENT; these are normative grades, not native readiness.

| Family | Units CWR / CV / SP / ATS | Before P/Q/A | After P/Q/A |
|---|---|---|---|
| `collaboration.created` | CWR-106 / CV-461 / SP-461 / ATS-231 | 7 / 4 / 1 | 10 / 1 / 1 |
| `collaboration.started` | CWR-107 / CV-462 / SP-462 / ATS-232 | 7 / 4 / 1 | 10 / 1 / 1 |
| `collaboration.paused` | CWR-108 / CV-463 / SP-463 / ATS-233 | 7 / 4 / 1 | 10 / 1 / 1 |
| `collaboration.resumed` | CWR-109 / CV-464 / SP-464 / ATS-234 | 7 / 4 / 1 | 10 / 1 / 1 |
| `collaboration.cancelled` | CWR-110 / CV-465 / SP-465 / ATS-235 | 7 / 4 / 1 | 10 / 1 / 1 |
| `collaboration.completed` | CWR-111 / CV-466 / SP-466 / ATS-236 | 7 / 4 / 1 | 10 / 1 / 1 |
| `collaboration.failed` | CWR-112 / CV-467 / SP-467 / ATS-237 | 7 / 4 / 1 | 10 / 1 / 1 |
| `collaboration.participant_started` | CWR-113 / CV-468 / SP-468 / ATS-238 | 7 / 4 / 1 | 10 / 1 / 1 |
| `collaboration.participant_completed` | CWR-114 / CV-469 / SP-469 / ATS-239 | 8 / 3 / 1 | 10 / 1 / 1 |
| `collaboration.message_added` | CWR-115 / CV-470 / SP-470 / ATS-240 | 7 / 4 / 1 | 10 / 1 / 1 |
| `collaboration.artifact_added` | CWR-116 / CV-471 / SP-471 / ATS-241 | 7 / 4 / 1 | 10 / 1 / 1 |
| `collaboration.configuration_changed` | CWR-117 / CV-472 / SP-472 / ATS-242 | 7 / 4 / 1 | 10 / 1 / 1 |
| `brainstorm.proposal_added` | CWR-118 / CV-473 / SP-473 / ATS-243 | 7 / 4 / 1 | 10 / 1 / 1 |
| `brainstorm.vote_added` | CWR-119 / CV-474 / SP-474 / ATS-244 | 7 / 4 / 1 | 10 / 1 / 1 |
| `brainstorm.plan_synthesized` | CWR-120 / CV-475 / SP-475 / ATS-245 | 7 / 4 / 1 | 10 / 1 / 1 |
| `review.finding_added` | CWR-121 / CV-476 / SP-476 / ATS-246 | 7 / 4 / 1 | 10 / 1 / 1 |
| `review.finding_dispositioned` | CWR-122 / CV-477 / SP-477 / ATS-247 | 7 / 4 / 1 | 10 / 1 / 1 |
| `review.artifact_finalized` | CWR-123 / CV-478 / SP-478 / ATS-248 | 7 / 4 / 1 | 10 / 1 / 1 |

**Totals:** 127 PASS / 71 PARTIAL / 18 ABSENT → 180 PASS / 18 PARTIAL / 18 ABSENT. Producer and oracle cells close for all eighteen; scope/identity closes for the seventeen changed cells. The self-grade has mechanically refreshed exact quotes and line/file hashes. No grade penalty or clearance is inferred solely from native NOT_RUN.

## Eleven standing checks and Astra classes

| # | Standing check | How the Astra class is ruled out |
|---|---|---|
| 1 | Every current writer refuses replay-only; retained compatibility originals use the historical path. | Forged identities/digests are recomputed; copied owner facts join exact independent original controls and typed fields, with full-path mutation negatives. |
| 2 | All 18 application keys use exact CV-366 server/operation hex encoding. | Assigned Storage metadata is excluded from semantic digests and checked against original Storage records on historical/checkpoint paths; current prepared metadata-only positives retain the same semantic identity. |
| 3 | All project positives use encoded project~ partitions. | Retained originals survive live state/revision/epoch changes and replay-only compatibility; withdrawn, foreign or forged originals refuse. |
| 4 | Event body and complete application wrapper have independent size/reference boundaries. | One canonical interpretation is used for all new identity/digest/reference recipes; boolean/number equality and case/space/LF variants are refused at the relevant gates. |
| 5 | True-end/fixed-length identifier guards reject trailing LF. | Every reference in the four lane schema roots, four new wrapper roots and their transitive closure resolves eagerly. An unvisited wrapper-ref mutation fails validation and CLI exit checks. Four unrelated pre-existing Goal references found in a whole-common-file audit are integration items below. |
| 6 | Semantic-only retries exclude assigned metadata. | Complete encoded EventRecords, source holders, projections/checkpoints, required wrappers and packs are inventoried. Each SP-351 wrapper independently routes its record above 16 KiB through SP-337; externalizing only the event cannot conceal it. No new cap is invented for other values. |
| 7 | Checkpoints join actual instance/token/partition/coverage/cursor/event controls. | Every prepared path first checks original source custody and the required app wrapper; attempt, requiredness, Plan, artifact and Review custody have isolated negatives. Native authentication is NOT_RUN. |
| 8 | Both injected contract failure and unvisited-ref failure require CLI exit 1. | Fresh guard removal uses the unchanged real evaluation entry points, no helper substitution. Schema gates use their actual validators; affected cases rerun and all complements retain exact unchanged rejection witnesses. |
| 9 | Every owned reference resolves, including unvisited branches. | PASS cells cite exact own units and current static results; membership remains ABSENT and retention PARTIAL. |
| 10 | Historical readers use original write epoch and captured record. | Large integer/decimal/exponent forms are lossless; safe-boundary, negative-zero, leading-zero, nonfinite, unsafe-float and lossy-decimal vectors cover identity and digest paths. |
| 11 | Every fresh guard/group has flips; all other negatives retain their own refusal. | Exact boolean/integer/collection controls and canonical type-preserving fact comparisons reject string booleans/numbers, nulls, arrays and nested objects in full source/historical/wrapper paths. |

The schema dependency index is an optimization of the pre-existing unchanged-assertion witness: each negative is validated first; every error and nested error is indexed by its exact schema node/keyword/member. Every case potentially affected by a removal is reevaluated. Cases outside that index retain the identical assertion, value and rejection reason. No test or guard is disabled in the installed checker.

The app source and physical wrapper intentionally repeat the same instance/Server/thread identity invariant; the table names their duplicate pair and removes both. Nullable oneOf exclusions retain their named pre-existing duplicate groups. No unnamed non-flipping row or unrelated pair is accepted.

## Verification and integration limits

- **Target checker:** PASS; 18 prepared, zero admitted, zero failures.
- **Self-test:** PASS; 14 scenarios, including full baseline and two required failing-CLI exits.
- **Independent mutations:** PASS; 498 source, history, hash/type, numeric and wrapper mutations.
- **Storage registry helper:** Exactly four existing pending RP-CHAT-THREAD-LIFETIME references; no other failures.
- **Shard generation and check:** Both exit 0 / PASS; only the three edited Markdown groups and Storage registry group change.
- **Index generation:** Exit 0; top-level PASS.
- **Index validation:** Exit 1; top-level FAIL: 21 unchanged legacy-ledger errors and absent DL-302 from advanced origin/main. No touched source causes a new failure.
- **Currentness edition:** 15 copied files match the share by SHA-256, rechecked at generation.
- **Scope audit:** PASS; protected paths unchanged, original application definitions and earlier cases preserved.
- **Guard proof:** PASS; 3429 fresh rows: 128 decision, 3233 schema, 68 integrity. Frozen input hashes match across three sequential phases; all complement hashes verify. Zero masked negatives, zero unexpected changes, no prior-round rows reused.
- **Infrastructure:** An earlier combined process exited 143 without a reusable table; a schema attempt stopped at the memory floor. Those incomplete attempts contribute no rows. The final resource controller pauses between guards until at least 6 GB is available.

The broader shared-application audit found four dangling references in untouched Goal definitions (`Goal_storage_body_application_v1`, `Goal_ApplicationGoalOperationV1` and their physical wrappers), pointing to absent goal_body_custody definitions. The same targets are absent at the reviewed base and fetched main. No error is filtered from a collaborative root: the lane retains every original root and explicitly adds all four owned V2 wrapper roots, rather than claiming ownership of unrelated Goal contracts.

Retained original application wrapper definitions are equal as JSON values to both the reviewed head and fetched main. All earlier payload/transition/checkpoint/schema cases are unchanged. SP-351 policy-object materialization, advanced-main index drift, overlapping Storage census pins and the foreign Goal references remain integration work. No full governance/reseal or native claim is made.

**IDs used:** CWR-105..123, CV-460..478, SP-460..478, ATS-230..248; no new plan-unit, OSI, Decision Log, event-admission or WorkNode ID. Newly authored physical successor IDs are pm.storage_value.collaboration_{definition,run,participant,transcript}.application.v2, each at 2.0.0, under SP-460/CV-460.

## Evidence

- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DC/fix2/checker.json`, SHA-256 `29a66157f4e8389d049272088bdb797951219d76c8775b5ce775d27cc76427d5`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DC/fix2/currentness-copy.json`, SHA-256 `1b765b9ac2ab42d60576eba5c1f1edd03454965e434717497da8cbcf32c009bf`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DC/fix2/guard-decision.json`, SHA-256 `f8e94f4b3e8d729a68d0d417b1332335c5153ec4cfed25c75793900fd56e2a56`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DC/fix2/guard-integrity.json`, SHA-256 `9bed9916e61a524aafd34a9d2538a249c94a1d29bc5fe9c3b041af413223c15c`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DC/fix2/guard-removal.json`, SHA-256 `fe689bf7a05a7870acced3f9a5e81f078469b22f0c07acf3386ad5b49b791b2a`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DC/fix2/guard-schema.json`, SHA-256 `ef4c50a92f7cade2fd6f720f56f6a3e846085511496cf44278a0d50c078ed327`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DC/fix2/index-generate.json`, SHA-256 `5a7e4dd1a08418b755a99ae0e791b8478346a8e46ed3f3c1580ad982fd9d9bf5`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DC/fix2/index-validate.json`, SHA-256 `0f3cae4a5b3663e067639cd33015db83510173b4496f666d1359d2184612906f`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DC/fix2/manual-audit.json`, SHA-256 `bae3ce0667dffbdec6389c16f52e6a5276694495b8b06abe58862ea3a3228ac5`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DC/fix2/quote-audit.json`, SHA-256 `49191d888863e33e75dee20725c8c10ef52da115333e94e34a41b76209143333`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DC/fix2/scope-audit.json`, SHA-256 `761e51fb9f3d74cfd1f6a02fc24dbfc5a368c6e21deca7aaca86bfbb986661b3`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DC/fix2/self-test.json`, SHA-256 `9805ae9e721c31cc3978feda436bc61496e32f471851e5ec708da5c2c6a29992`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DC/fix2/shards-check.json`, SHA-256 `690c106320c8ef4735fd3ac7d81ce83128b3915f241b93724f8704951acd2624`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DC/fix2/shards-generate.json`, SHA-256 `c4bae894aa28f45e22df9ad49c591ad5b05c4d8026a98103c58571d091b0f3d1`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DC/fix2/shared-application-reference-audit.json`, SHA-256 `40d7c5541115eba3ffe22a724d2bf3872ce6a27b708be06c22e2a1126cd9c22d`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DC/fix2/storage-check.json`, SHA-256 `a3fbfcdff9fd5891c74908bca0986c332c88f843cf04bd2a310055a47315a56c`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DC/fix2/verification.json`, SHA-256 `e2d9fc25815036112080db8468f49be011dfcdda122ef5b520be3623959dcdb2`.

## Whole-lane guard-removal table

Fresh result: **3429 PASS rows** (128 decision, 3233 schema, 68 integrity); zero masked negatives, zero unexpected changes, zero retained rows from an earlier run.

dN/sN/iN denote one-based entries in the sorted decision/schema/integrity manifests of guard-removal.json. D/S/I are those complete manifests. Each complement has its independently recorded count and SHA-256. Every row below names its exact flips and every negative that stays rejected through that complement.

| Guard / named duplicate group | Negatives that flip | Negatives that stay rejected |
|---|---|---|
| `payload_rejection:276:epoch_type` | d629–d638, d678–d687, d727–d736, d776–d785, d825–d834, d874–d883, d923–d932, d972–d981, d1021–d1030, d1070–d1079, d1119–d1128, d1168–d1177, d1217–d1226, d1266–d1275, d1315–d1324, d1364–d1373, d1413–d1422, d1462–d1471, d1511–d1520, d1560–d1569, d1609–d1618, d1658–d1667, d1707–d1716, d1756–d1765, d1805–d1814, d1854–d1863, d1903–d1912, d1952–d1961, d2001–d2010, d2050–d2059, d2099–d2108, d2148–d2157, d2197–d2206, d2246–d2255, d2295–d2304, d2344–d2353 | D \ F (6914) |
| `payload_rejection:278:valid_utc_datetime` | d16, d97, d195, d319, d387, d476, d2404, d2468, d2524, d2637, d2803, d2887, d3006, d3041, d3144, d3246, d7156, d7220 | D \ F (7256) |
| `payload_rejection:280:identity_recipe` | d17, d98, d196, d320, d388, d477, d2405, d2469, d2525, d2638, d2804, d2888, d3007, d3042, d3145, d3247, d3336, d3436, d3530, d3617, d3704, d3793, d3882, d3978, d4068, d4165, d4257, d4354, d4444, d4557, d4652, d4765, d4857, d4952, d5041, d5142, d5234, d5319, d5404, d5500, d5587, d5682, d5771, d5866, d5955, d6060, d6156, d6261, d6360, d6448, d6536, d6643, d6743, d6831, d6919, d7010, d7157, d7221 | D \ F (7216) |
| `payload_rejection:282:revision_rule` | d391 | D \ F (7273) |
| `payload_rejection:284:review_counts` | d95 | D \ F (7273) |
| `retention_rejection:533:retention_missing` | d3297 | D \ F (7273) |
| `retention_rejection:537:retention_values` | d3174–d3228, d3293–d3296, d3298–d3300 | D \ F (7212) |
| `envelope_rejection:554:event_record_schema` | d239, d253, d278, d625, d674, d723, d772, d821, d870, d919, d968, d1017, d1066, d1115, d1164, d1213, d1262, d1311, d1360, d1409, d1458, d1507, d1556, d1605, d1654, d1703, d1752, d1801, d1850, d1899, d1948, d1997, d2046, d2095, d2144, d2193, d2242, d2291, d2340 | D \ F (7235) |
| `envelope_rejection:556:event_type` | d669–d670, d718–d719, d767–d768, d816–d817, d865–d866, d914–d915, d963–d964, d1012–d1013, d1061–d1062, d1110–d1111, d1159–d1160, d1208–d1209, d1257–d1258, d1306–d1307, d1355–d1356, d1404–d1405, d1453–d1454, d1502–d1503, d1551–d1552, d1600–d1601, d1649–d1650, d1698–d1699, d1747–d1748, d1796–d1797, d1845–d1846, d1894–d1895, d1943–d1944, d1992–d1993, d2041–d2042, d2090–d2091, d2139–d2140, d2188–d2189, d2237–d2238, d2286–d2287, d2335–d2336, d2384–d2385 | D \ F (7202) |
| `envelope_rejection:562:scope_kind` | d615–d616 | D \ F (7272) |
| `envelope_rejection:564:redaction_profile` | d617 | D \ F (7273) |
| `envelope_rejection:566:replay_policy` | d618, d667, d716, d765, d814, d863, d912, d961, d1010, d1059, d1108, d1157, d1206, d1255, d1304, d1353, d1402, d1451, d1500, d1549, d1598, d1647, d1696, d1745, d1794, d1843, d1892, d1941, d1990, d2039, d2088, d2137, d2186, d2235, d2284, d2333, d2382 | D \ F (7237) |
| `envelope_rejection:568:node_join` | d614 | D \ F (7273) |
| `envelope_rejection:571:attempt_join` | d610 | D \ F (7273) |
| `envelope_rejection:573:payload_envelope_identity` | d532, d537, d542, d547, d552, d557, d562, d567, d572, d577, d582, d587, d592, d597, d602, d607, d613, d619, d622, d2391 | D \ F (7254) |
| `envelope_rejection:576:payload_schema_id` | d530, d534–d535, d539–d540, d544–d545, d549–d550, d554–d555, d559–d560, d564–d565, d569–d570, d574–d575, d579–d580, d584–d585, d589–d590, d594–d595, d599–d600, d604–d605, d609, d620, d624, d2389, d2393 | D \ F (7238) |
| `envelope_rejection:578:occurred_at_join` | d531, d536, d541, d546, d551, d556, d561, d566, d571, d576, d581, d586, d591, d596, d601, d606, d621, d2390 | D \ F (7256) |
| `envelope_rejection:580:identity_recipe` | d533, d538, d543, d548, d553, d558, d563, d568, d573, d578, d583, d588, d593, d598, d603, d608, d611, d623, d2392 | D \ F (7255) |
| `envelope_rejection:582:payload` | d628, d677, d726, d775, d824, d873, d922, d971, d1020, d1069, d1118, d1167, d1216, d1265, d1314, d1363, d1412, d1461, d1510, d1559, d1608, d1657, d1706, d1755, d1804, d1853, d1902, d1951, d2000, d2049, d2098, d2147, d2196, d2245, d2294, d2343 | D \ F (7238) |
| `representation_rejection:588:inline_limit` | d182, d290–d292, d514–d518, d2571 | D \ F (7264) |
| `representation_rejection:590:reference_inline_body` | d521, d612 | D \ F (7272) |
| `reference_rejection:597:reference_format` | d519 | D \ F (7273) |
| `reference_rejection:599:reference_missing` | d522, d627, d676, d725, d774, d823, d872, d921, d970, d1019, d1068, d1117, d1166, d1215, d1264, d1313, d1362, d1411, d1460, d1509, d1558, d1607, d1656, d1705, d1754, d1803, d1852, d1901, d1950, d1999, d2048, d2097, d2146, d2195, d2244, d2293, d2342, d4655, d5044, d5407, d5958 | D \ F (7233) |
| `reference_rejection:603:reference_size` | d523, d673, d722, d771, d820, d869, d918, d967, d1016, d1065, d1114, d1163, d1212, d1261, d1310, d1359, d1408, d1457, d1506, d1555, d1604, d1653, d1702, d1751, d1800, d1849, d1898, d1947, d1996, d2045, d2094, d2143, d2192, d2241, d2290, d2339, d2388 | D \ F (7237) |
| `reference_rejection:605:reference_hash` | d520, d672, d721, d770, d819, d868, d917, d966, d1015, d1064, d1113, d1162, d1211, d1260, d1309, d1358, d1407, d1456, d1505, d1554, d1603, d1652, d1701, d1750, d1799, d1848, d1897, d1946, d1995, d2044, d2093, d2142, d2191, d2240, d2289, d2338, d2387, d4654, d5043, d5406, d5957 | D \ F (7233) |
| `reference_rejection:610:reference_json` | d3235 | D \ F (7273) |
| `reference_rejection:612:reference_canonical` | d3234 | D \ F (7273) |
| `checkpoint_rejection:679:checkpoint_instance` | d242, d256, d267, d281 | D \ F (7270) |
| `checkpoint_rejection:681:checkpoint_partition` | d257, d268, d282 | D \ F (7271) |
| `checkpoint_rejection:685:checkpoint_token` | d244–d250, d258–d264, d269–d275, d283–d289 | D \ F (7246) |
| `checkpoint_rejection:687:checkpoint_admitted` | d237, d251, d265, d276 | D \ F (7270) |
| `checkpoint_rejection:690:checkpoint_coverage` | d240–d241, d254–d255, d279–d280 | D \ F (7268) |
| `checkpoint_rejection:694:checkpoint_cursor` | d238, d252, d277 | D \ F (7271) |
| `checkpoint_rejection:696:checkpoint_event` | d239, d253, d278 | D \ F (7271) |
| `checkpoint_rejection:698:checkpoint_cursor` | d266 | D \ F (7273) |
| `historical_rejection:710:historical_withdrawn` | d657–d666, d671, d706–d715, d720, d755–d764, d769, d804–d813, d818, d853–d862, d867, d902–d911, d916, d951–d960, d965, d1000–d1009, d1014, d1049–d1058, d1063, d1098–d1107, d1112, d1147–d1156, d1161, d1196–d1205, d1210, d1245–d1254, d1259, d1294–d1303, d1308, d1343–d1352, d1357, d1392–d1401, d1406, d1441–d1450, d1455, d1490–d1499, d1504, d1539–d1548, d1553, d1588–d1597, d1602, d1637–d1646, d1651, d1686–d1695, d1700, d1735–d1744, d1749, d1784–d1793, d1798, d1833–d1842, d1847, d1882–d1891, d1896, d1931–d1940, d1945, d1980–d1989, d1994, d2029–d2038, d2043, d2078–d2087, d2092, d2127–d2136, d2141, d2176–d2185, d2190, d2225–d2234, d2239, d2274–d2283, d2288, d2323–d2332, d2337, d2372–d2381, d2386 | D \ F (6878) |
| `historical_rejection:712:historical_not_retained` | d647–d656, d668, d696–d705, d717, d745–d754, d766, d794–d803, d815, d843–d852, d864, d892–d901, d913, d941–d950, d962, d990–d999, d1011, d1039–d1048, d1060, d1088–d1097, d1109, d1137–d1146, d1158, d1186–d1195, d1207, d1235–d1244, d1256, d1284–d1293, d1305, d1333–d1342, d1354, d1382–d1391, d1403, d1431–d1440, d1452, d1480–d1489, d1501, d1529–d1538, d1550, d1578–d1587, d1599, d1627–d1636, d1648, d1676–d1685, d1697, d1725–d1734, d1746, d1774–d1783, d1795, d1823–d1832, d1844, d1872–d1881, d1893, d1921–d1930, d1942, d1970–d1979, d1991, d2019–d2028, d2040, d2068–d2077, d2089, d2117–d2126, d2138, d2166–d2175, d2187, d2215–d2224, d2236, d2264–d2273, d2285, d2313–d2322, d2334, d2362–d2371, d2383 | D \ F (6878) |
| `historical_rejection:714:historical_epoch_type` | d639–d646, d688–d695, d737–d744, d786–d793, d835–d842, d884–d891, d933–d940, d982–d989, d1031–d1038, d1080–d1087, d1129–d1136, d1178–d1185, d1227–d1234, d1276–d1283, d1325–d1332, d1374–d1381, d1423–d1430, d1472–d1479, d1521–d1528, d1570–d1577, d1619–d1626, d1668–d1675, d1717–d1724, d1766–d1773, d1815–d1822, d1864–d1871, d1913–d1920, d1962–d1969, d2011–d2018, d2060–d2067, d2109–d2116, d2158–d2165, d2207–d2214, d2256–d2263, d2305–d2312, d2354–d2361 | D \ F (6986) |
| `historical_rejection:716:historical_forged` | d626, d675, d724, d773, d822, d871, d920, d969, d1018, d1067, d1116, d1165, d1214, d1263, d1312, d1361, d1410, d1459, d1508, d1557, d1606, d1655, d1704, d1753, d1802, d1851, d1900, d1949, d1998, d2047, d2096, d2145, d2194, d2243, d2292, d2341 | D \ F (7238) |
| `source_rejection:731:source_family` | d3325, d3425, d3518, d3605, d3692, d3781, d3871, d3967, d4057, d4154, d4245, d4342, d4433, d4546, d4641, d4754, d4846, d4941, d5030, d5131, d5223, d5308, d5393, d5489, d5576, d5671, d5760, d5855, d5944, d6049, d6145, d6250, d6349, d6437, d6525, d6632, d6732, d6820, d6908, d6999 | D \ F (7234) |
| `source_rejection:736:source_context_missing` | d3327, d3351–d3358, d3427, d3448–d3455, d3520, d3535–d3542, d3607, d3622–d3629, d3694, d3710–d3717, d3783, d3799–d3806, d3873, d3893–d3900, d3969, d3986–d3993, d4059, d4080–d4087, d4156, d4174–d4181, d4247, d4268–d4275, d4344, d4362–d4369, d4435, d4463–d4470, d4548, d4568–d4575, d4643, d4671–d4678, d4756, d4773–d4780, d4848, d4867–d4874, d4943, d4959–d4966, d5032, d5056–d5063, d5133, d5151–d5158, d5225, d5237–d5244, d5310, d5322–d5329, d5395, d5415–d5422, d5491, d5505–d5512, d5578, d5597–d5604, d5673, d5689–d5696, d5762, d5780–d5787, d5857, d5872–d5879, d5946, d5973–d5980, d6051, d6072–d6079, d6147, d6173–d6180, d6252, d6275–d6282, d6351, d6365–d6372, d6439, d6453–d6460, d6527, d6558–d6565, d6634, d6662–d6669, d6734, d6750–d6757, d6822, d6838–d6845, d6910, d6929–d6936, d7001, d7020–d7027 | D \ F (6914) |
| `source_fact_rejection:751:source_instance` | d3418, d3511, d3598, d3685, d3774, d3863, d3960, d4049, d4147, d4237, d4335, d4425, d4539, d4633, d4747, d4838, d4934, d5022, d5124, d5215, d5300, d5385, d5482, d5568, d5664, d5752, d5848, d5936, d6042, d6137, d6243, d6341, d6428, d6516, d6625, d6725, d6813, d6901, d6992, d7083 | D \ F (7234) |
| `source_fact_rejection:753:source_epoch` | d3401–d3408, d3414, d3498–d3505, d3507, d3585–d3592, d3594, d3672–d3679, d3681, d3760–d3767, d3770, d3849–d3856, d3859, d3943–d3950, d3956, d4036–d4043, d4045, d4130–d4137, d4143, d4224–d4231, d4233, d4318–d4325, d4331, d4412–d4419, d4421, d4513–d4520, d4533, d4618–d4625, d4627, d4721–d4728, d4741, d4823–d4830, d4832, d4917–d4924, d4930, d5009–d5016, d5018, d5106–d5113, d5120, d5201–d5208, d5211, d5287–d5294, d5296, d5372–d5379, d5381, d5465–d5472, d5478, d5555–d5562, d5564, d5647–d5654, d5660, d5739–d5746, d5748, d5830–d5837, d5844, d5922–d5929, d5932, d6023–d6030, d6038, d6122–d6129, d6133, d6223–d6230, d6238, d6325–d6332, d6336, d6415–d6422, d6424, d6503–d6510, d6512, d6608–d6615, d6621, d6712–d6719, d6721, d6800–d6807, d6809, d6888–d6895, d6897, d6979–d6986, d6988, d7070–d7077, d7079 | D \ F (6914) |
| `source_fact_rejection:755:source_key` | d3419, d3512, d3599, d3686, d3775, d3864, d3961, d4050, d4148, d4238, d4336, d4426, d4540, d4634, d4748, d4839, d4935, d5023, d5125, d5216, d5301, d5386, d5483, d5569, d5665, d5753, d5849, d5937, d6043, d6138, d6244, d6342, d6430, d6518, d6626, d6726, d6814, d6902, d6993, d7084 | D \ F (7234) |
| `source_fact_rejection:757:source_partition` | d3416, d3509, d3596, d3683, d3772, d3861, d3958, d4047, d4145, d4235, d4333, d4423, d4537, d4631, d4745, d4836, d4932, d5020, d5122, d5213, d5298, d5383, d5480, d5566, d5662, d5750, d5846, d5934, d6040, d6135, d6241, d6339, d6426, d6514, d6623, d6723, d6811, d6899, d6990, d7081 | D \ F (7234) |
| `source_fact_rejection:759:source_operation` | d3333, d3433, d3526, d3613, d3700, d3789, d3879, d3975, d4065, d4162, d4254, d4351, d4441, d4554, d4649, d4762, d4854, d4949, d5038, d5139, d5231, d5316, d5401, d5497, d5584, d5679, d5768, d5863, d5952, d6057, d6153, d6258, d6357, d6445, d6533, d6640, d6740, d6828, d6916, d7007 | D \ F (7234) |
| `source_fact_rejection:761:source_event_id` | d3324, d3424, d3517, d3604, d3691, d3780, d3870, d3966, d4056, d4153, d4244, d4341, d4432, d4545, d4640, d4753, d4845, d4940, d5029, d5130, d5222, d5307, d5392, d5488, d5575, d5670, d5759, d5854, d5943, d6048, d6144, d6249, d6348, d6436, d6524, d6631, d6731, d6819, d6907, d6998 | D \ F (7234) |
| `source_fact_rejection:763:source_digest` | d3417, d3510, d3597, d3684, d3773, d3862, d3959, d4048, d4146, d4236, d4334, d4424, d4538, d4632, d4746, d4837, d4933, d5021, d5123, d5214, d5299, d5384, d5481, d5567, d5663, d5751, d5847, d5935, d6041, d6136, d6242, d6340, d6427, d6515, d6624, d6724, d6812, d6900, d6991, d7082 | D \ F (7234) |
| `source_fact_rejection:765:source_record_digest` | d3330, d3335, d3430, d3435, d3523, d3528, d3610, d3615, d3697, d3702, d3786, d3791, d3876, d3881, d3972, d3977, d4062, d4067, d4159, d4164, d4250, d4256, d4347, d4353, d4438, d4443, d4551, d4556, d4646, d4651, d4759, d4764, d4851, d4856, d4946, d4951, d5035, d5040, d5136, d5141, d5228, d5233, d5313, d5318, d5398, d5403, d5494, d5499, d5581, d5586, d5676, d5681, d5765, d5770, d5860, d5865, d5949, d5954, d6054, d6059, d6150, d6155, d6255, d6260, d6354, d6359, d6442, d6447, d6530, d6535, d6637, d6642, d6737, d6742, d6825, d6830, d6913, d6918, d7004, d7009 | D \ F (7194) |
| `source_fact_rejection:767:source_record_ref` | d3329, d3334, d3429, d3434, d3522, d3527, d3609, d3614, d3696, d3701, d3785, d3790, d3875, d3880, d3971, d3976, d4061, d4066, d4158, d4163, d4249, d4255, d4346, d4352, d4437, d4442, d4550, d4555, d4645, d4650, d4758, d4763, d4850, d4855, d4945, d4950, d5034, d5039, d5135, d5140, d5227, d5232, d5312, d5317, d5397, d5402, d5493, d5498, d5580, d5585, d5675, d5680, d5764, d5769, d5859, d5864, d5948, d5953, d6053, d6058, d6149, d6154, d6254, d6259, d6353, d6358, d6441, d6446, d6529, d6534, d6636, d6641, d6736, d6741, d6824, d6829, d6912, d6917, d7003, d7008 | D \ F (7194) |
| `source_fact_rejection:776:source_record_identity` | d3328, d3340–d3343, d3359–d3366, d3413, d3428, d3437–d3440, d3456–d3463, d3506, d3521, d3531–d3532, d3543–d3550, d3593, d3608, d3618–d3619, d3630–d3637, d3680, d3695, d3705–d3708, d3718–d3725, d3769, d3784, d3794–d3797, d3807–d3814, d3858, d3874, d3887–d3890, d3901–d3908, d3955, d3970, d3980–d3983, d3994–d4001, d4044, d4060, d4072–d4075, d4088–d4095, d4142, d4157, d4166–d4169, d4182–d4189, d4232, d4248, d4261–d4264, d4276–d4283, d4330, d4345, d4355–d4358, d4370–d4377, d4420, d4436, d4454–d4455, d4471–d4478, d4532, d4549, d4558–d4560, d4576–d4583, d4626, d4644, d4665–d4667, d4679–d4686, d4740, d4757, d4766–d4769, d4781–d4788, d4831, d4849, d4861–d4864, d4875–d4882, d4929, d4944, d4953–d4956, d4967–d4974, d5017, d5033, d5048–d5055, d5064–d5071, d5118, d5134, d5143–d5150, d5159–d5166, d5209, d5226, d5245–d5252, d5295, d5311, d5330–d5337, d5380, d5396, d5411, d5423–d5430, d5477, d5492, d5501, d5513–d5520, d5563, d5579, d5591–d5594, d5605–d5612, d5659, d5674, d5683–d5686, d5697–d5704, d5747, d5763, d5775–d5778, d5788–d5795, d5843, d5858, d5867–d5870, d5880–d5887, d5931, d5947, d5962–d5970, d5981–d5988, d6036, d6052, d6061–d6069, d6080–d6087, d6131, d6148, d6160–d6168, d6181–d6188, d6236, d6253, d6262–d6270, d6283–d6290, d6334, d6352, d6373–d6380, d6423, d6440, d6461–d6468, d6511, d6528, d6541–d6544, d6566–d6573, d6620, d6635, d6645–d6648, d6670–d6677, d6720, d6735, d6744–d6747, d6758–d6765, d6808, d6823, d6832–d6835, d6846–d6853, d6896, d6911, d6920–d6923, d6937–d6944, d6987, d7002, d7011–d7014, d7028–d7035, d7078 | D \ F (6716) |
| `source_fact_rejection:779:source_record_state` | d5119, d5210, d5838, d5930, d6031, d6037, d6130, d6132, d6231, d6237, d6333, d6335 | D \ F (7262) |
| `source_fact_rejection:781:source_envelope_metadata` | d3326, d3367–d3374, d3426, d3464–d3471, d3519, d3551–d3558, d3606, d3638–d3645, d3693, d3726–d3733, d3782, d3815–d3822, d3872, d3909–d3916, d3968, d4002–d4009, d4058, d4096–d4103, d4155, d4190–d4197, d4246, d4284–d4291, d4343, d4378–d4385, d4434, d4479–d4486, d4547, d4584–d4591, d4642, d4687–d4694, d4755, d4789–d4796, d4847, d4883–d4890, d4942, d4975–d4982, d5031, d5072–d5079, d5132, d5167–d5174, d5224, d5253–d5260, d5309, d5338–d5345, d5394, d5431–d5438, d5490, d5521–d5528, d5577, d5613–d5620, d5672, d5705–d5712, d5761, d5796–d5803, d5856, d5888–d5895, d5945, d5989–d5996, d6050, d6088–d6095, d6146, d6189–d6196, d6251, d6291–d6298, d6350, d6381–d6388, d6438, d6469–d6476, d6526, d6574–d6581, d6633, d6678–d6685, d6733, d6766–d6773, d6821, d6854–d6861, d6909, d6945–d6952, d7000, d7036–d7043 | D \ F (6914) |
| `source_fact_rejection:783:source_output_refs` | d4253, d4350 | D \ F (7272) |
| `source_fact_rejection:785:source_attempt` | d5217, d5302, d6343, d6431 | D \ F (7270) |
| `source_fact_rejection:789:source_waiver` | d6429, d6517 | D \ F (7272) |
| `source_fact_rejection:793:source_participant_identity` | d3529, d3616, d3703, d3792 | D \ F (7270) |
| `source_fact_rejection:797:source_review_pack` | d6240, d6338 | D \ F (7272) |
| `source_fact_rejection:802:source_required_slots` | d3332, d3392–d3400, d3415, d3432, d3489–d3497, d3508, d3525, d3576–d3584, d3595, d3612, d3663–d3671, d3682, d3699, d3751–d3759, d3771, d3788, d3840–d3848, d3860, d3878, d3934–d3942, d3957, d3974, d4027–d4035, d4046, d4064, d4121–d4129, d4144, d4161, d4215–d4223, d4234, d4252, d4309–d4317, d4332, d4349, d4403–d4411, d4422, d4440, d4504–d4512, d4534–d4535, d4553, d4609–d4617, d4628–d4629, d4648, d4712–d4720, d4742–d4743, d4761, d4814–d4822, d4833–d4834, d4853, d4908–d4916, d4931, d4948, d5000–d5008, d5019, d5037, d5097–d5105, d5121, d5138, d5192–d5200, d5212, d5230, d5236, d5278–d5286, d5297, d5315, d5321, d5363–d5371, d5382, d5400, d5414, d5456–d5464, d5479, d5496, d5504, d5546–d5554, d5565, d5583, d5638–d5646, d5661, d5678, d5730–d5738, d5749, d5767, d5821–d5829, d5845, d5862, d5913–d5921, d5933, d5951, d6014–d6022, d6039, d6056, d6113–d6121, d6134, d6152, d6214–d6222, d6239, d6257, d6316–d6324, d6337, d6356, d6364, d6406–d6414, d6425, d6444, d6452, d6494–d6502, d6513, d6532, d6599–d6607, d6622, d6639, d6703–d6711, d6722, d6739, d6791–d6799, d6810, d6827, d6879–d6887, d6898, d6915, d6970–d6978, d6989, d7006, d7061–d7069, d7080 | D \ F (6824) |
| `source_fact_rejection:804:source_currentness` | d3322, d3422, d3515, d3602, d3689, d3778, d3868, d3964, d4054, d4151, d4242, d4339, d4430, d4543, d4638, d4751, d4843, d4938, d5027, d5128, d5220, d5235, d5305, d5320, d5390, d5486, d5573, d5668, d5757, d5852, d5941, d6046, d6142, d6247, d6346, d6361, d6434, d6449, d6522, d6629, d6729, d6817, d6905, d6996 | D \ F (7230) |
| `source_fact_rejection:808:source_slot_roster` | d3331, d3383–d3391, d3431, d3480–d3488, d3524, d3567–d3575, d3611, d3654–d3662, d3698, d3742–d3750, d3787, d3831–d3839, d3877, d3925–d3933, d3973, d4018–d4026, d4063, d4112–d4120, d4160, d4206–d4214, d4251, d4300–d4308, d4348, d4394–d4402, d4439, d4495–d4503, d4536, d4552, d4600–d4608, d4630, d4647, d4669–d4670, d4703–d4711, d4744, d4760, d4771–d4772, d4805–d4813, d4835, d4852, d4899–d4907, d4947, d4991–d4999, d5036, d5088–d5096, d5137, d5183–d5191, d5229, d5269–d5277, d5314, d5354–d5362, d5399, d5447–d5455, d5495, d5537–d5545, d5582, d5629–d5637, d5677, d5721–d5729, d5766, d5812–d5820, d5861, d5904–d5912, d5950, d5971–d5972, d6005–d6013, d6055, d6070–d6071, d6104–d6112, d6151, d6171–d6172, d6205–d6213, d6256, d6273–d6274, d6307–d6315, d6355, d6397–d6405, d6443, d6485–d6493, d6531, d6590–d6598, d6638, d6694–d6702, d6738, d6782–d6790, d6826, d6870–d6878, d6914, d6961–d6969, d7005, d7052–d7060 | D \ F (6858) |
| `source_fact_rejection:810:source_producer_attempt` | d3534, d3621, d3709, d3798 | D \ F (7270) |
| `source_fact_rejection:812:source_vote_constraints` | d3768, d3857 | D \ F (7272) |
| `source_fact_rejection:814:source_plan_result` | d3347–d3350, d3444–d3447 | D \ F (7266) |
| `source_fact_rejection:816:source_artifact_custody` | d3886, d3979, d6540, d6644 | D \ F (7270) |
| `source_fact_rejection:818:source_review_targets` | d6748–d6749, d6836–d6837, d6927–d6928, d7018–d7019 | D \ F (7266) |
| `source_fact_rejection:820:source_review_counts` | d6925–d6926, d7016–d7017 | D \ F (7270) |
| `source_fact_rejection:822:source_owner_facts` | d3344–d3346, d3375–d3382, d3441–d3443, d3472–d3479, d3533, d3559–d3566, d3620, d3646–d3653, d3734–d3741, d3823–d3830, d3891–d3892, d3917–d3924, d3984–d3985, d4010–d4017, d4076–d4079, d4104–d4111, d4170–d4173, d4198–d4205, d4265–d4267, d4292–d4299, d4359–d4361, d4386–d4393, d4456–d4462, d4487–d4494, d4561–d4567, d4592–d4599, d4668, d4695–d4702, d4770, d4797–d4804, d4865–d4866, d4891–d4898, d4957–d4958, d4983–d4990, d5080–d5087, d5175–d5182, d5261–d5268, d5346–d5353, d5412–d5413, d5439–d5446, d5502–d5503, d5529–d5536, d5595–d5596, d5621–d5628, d5687–d5688, d5713–d5720, d5779, d5804–d5811, d5871, d5896–d5903, d5997–d6004, d6096–d6103, d6169–d6170, d6197–d6204, d6271–d6272, d6299–d6306, d6362–d6363, d6389–d6396, d6450–d6451, d6477–d6484, d6545–d6557, d6582–d6589, d6649–d6661, d6686–d6693, d6774–d6781, d6862–d6869, d6924, d6953–d6960, d7015, d7044–d7051 | D \ F (6862) |
| `source_fact_rejection:824:source_payload` | d3336, d3436, d3530, d3617, d3704, d3793, d3882, d3978, d4068, d4165, d4257, d4354, d4444, d4557, d4652, d4765, d4857, d4952, d5041, d5142, d5234, d5319, d5404, d5500, d5587, d5682, d5771, d5866, d5955, d6060, d6156, d6261, d6360, d6448, d6536, d6643, d6743, d6831, d6919, d7010 | D \ F (7234) |
| `prepared_event_rejection:838:prepared_body` | d3320, d3420, d3513, d3600, d3687, d3776, d3866, d3962, d4052, d4149, d4240, d4337, d4428, d4541, d4636, d4749, d4841, d4936, d5025, d5126, d5218, d5303, d5388, d5484, d5571, d5666, d5755, d5850, d5939, d6044, d6140, d6245, d6344, d6432, d6520, d6627, d6727, d6815, d6903, d6994 | D \ F (7234) |
| `prepared_event_rejection:840:prepared_envelope_metadata` | d3323, d3423, d3516, d3603, d3690, d3779, d3869, d3965, d4055, d4152, d4243, d4340, d4431, d4544, d4639, d4752, d4844, d4939, d5028, d5129, d5221, d5306, d5391, d5487, d5574, d5669, d5758, d5853, d5942, d6047, d6143, d6248, d6347, d6435, d6523, d6630, d6730, d6818, d6906, d6997 | D \ F (7234) |
| `application_wrapper_rejection:898:application_wrapper_limit` | d4653, d5042, d5405, d5956 | D \ F (7270) |
| `application_wrapper_rejection:907:application_wrapper_record` | d3411, d3953, d4140, d4328, d4523, d4525–d4531, d4731, d4733–d4739, d4927, d5116, d5475, d5657, d5841, d6034, d6234, d6618 | D \ F (7246) |
| `admission_rejection:1142:idempotency_conflict` | d164, d167, d176, d181, d507, d512, d526, d2599, d3302, d3304, d3317 | D \ F (7263) |
| `admission_rejection:1145:quarantined` | d2455–d2456, d2601 | D \ F (7271) |
| `transition_rejection:1162:conflict:already_created` | d527, d2600 | D \ F (7272) |
| `transition_rejection:1166:conflict:definition_not_recorded` | d524, d2603 | D \ F (7272) |
| `transition_rejection:1169:conflict:lineage_mismatch` | d2604 | D \ F (7273) |
| `transition_rejection:1173:conflict:already_started` | d2602 | D \ F (7273) |
| `transition_rejection:1175:conflict:stale_definition_revision` | d2598 | D \ F (7273) |
| `transition_rejection:1180:conflict:run_not_started` | d1, d2606, d2964 | D \ F (7271) |
| `transition_rejection:1184:conflict:lineage_mismatch` | d2, d169–d170, d2610 | D \ F (7270) |
| `transition_rejection:1188:conflict:already_terminal` | d510, d525, d2609, d2624, d2966, d3312, d3318 | D \ F (7267) |
| `transition_rejection:1192:conflict:stale_definition_revision` | d528, d2608 | D \ F (7272) |
| `family_rejection:1203:conflict:run_state_invalid` | d2590, d2967–d2968 | D \ F (7271) |
| `family_rejection:1205:conflict:stale_lifecycle_seq` | d2605, d2970 | D \ F (7272) |
| `family_rejection:1207:conflict:open_attempts` | d509, d2607, d2965, d3316 | D \ F (7270) |
| `family_rejection:1210:conflict:required_slot_set_mismatch` | d2591 | D \ F (7273) |
| `family_rejection:1212:conflict:waived_slot_set_mismatch` | d2592 | D \ F (7273) |
| `family_rejection:1214:conflict:unresolved_required_slots` | d354, d2594 | D \ F (7272) |
| `family_rejection:1216:conflict:missing_output` | d175, d2623, d3301 | D \ F (7271) |
| `family_rejection:1218:conflict:output_refs_mismatch` | d356–d357 | D \ F (7272) |
| `family_rejection:1222:conflict:run_state_invalid` | d2577, d2969 | D \ F (7272) |
| `family_rejection:1227:conflict:slot_not_in_roster` | d529, d2578 | D \ F (7272) |
| `family_rejection:1229:conflict:attempt_already_started` | d166, d2576 | D \ F (7272) |
| `family_rejection:1231:conflict:stale_assignment_revision` | d2579 | D \ F (7273) |
| `family_rejection:1238:conflict:unknown_attempt` | d165, d2581 | D \ F (7272) |
| `family_rejection:1240:conflict:attempt_already_closed` | d168, d2580 | D \ F (7272) |
| `family_rejection:1243:conflict:slot_not_in_roster` | d2575 | D \ F (7273) |
| `family_rejection:1245:conflict:attempt_already_closed` | d2574 | D \ F (7273) |
| `family_rejection:1247:conflict:waiver_not_recorded` | d355, d2593 | D \ F (7272) |
| `family_rejection:1250:conflict:message_already_written` | d513, d2572 | D \ F (7272) |
| `family_rejection:1252:conflict:sequence_gap` | d511, d2573 | D \ F (7272) |
| `family_rejection:1255:conflict:slot_not_in_roster` | d2596 | D \ F (7273) |
| `family_rejection:1258:conflict:unknown_attempt` | d2595 | D \ F (7273) |
| `family_rejection:1261:conflict:artifact_already_added` | d508, d2597 | D \ F (7272) |
| `family_rejection:1264:conflict:unknown_proposal` | d171, d2584 | D \ F (7272) |
| `family_rejection:1267:conflict:unknown_attempt` | d174, d2588 | D \ F (7272) |
| `family_rejection:1271:conflict:not_core_participant` | d180, d2589 | D \ F (7272) |
| `family_rejection:1273:conflict:proposal_already_added` | d178, d2587 | D \ F (7272) |
| `family_rejection:1276:conflict:wonderer_cannot_vote` | d172, d2585 | D \ F (7272) |
| `family_rejection:1278:conflict:attempt_not_current` | d173, d2583 | D \ F (7272) |
| `family_rejection:1280:conflict:vote_already_added` | d179, d2582 | D \ F (7272) |
| `family_rejection:1283:conflict:already_synthesized` | d177, d2586 | D \ F (7272) |
| `family_rejection:1286:conflict:target_hash_mismatch` | d2613, d3313 | D \ F (7272) |
| `family_rejection:1288:conflict:slot_not_in_roster` | d2612, d3314 | D \ F (7272) |
| `family_rejection:1290:conflict:finding_already_added` | d2611, d3306 | D \ F (7272) |
| `family_rejection:1294:conflict:unknown_finding` | d2619, d3315 | D \ F (7272) |
| `family_rejection:1297:conflict:already_dispositioned` | d2618, d3305 | D \ F (7272) |
| `family_rejection:1299:conflict:target_hash_mismatch` | d2620 | D \ F (7273) |
| `family_rejection:1302:conflict:already_finalized` | d2614, d3311 | D \ F (7272) |
| `family_rejection:1304:conflict:findings_not_dispositioned` | d2616, d3303 | D \ F (7272) |
| `family_rejection:1306:conflict:artifact_not_added` | d2615, d3307 | D \ F (7272) |
| `family_rejection:1308:conflict:target_hash_mismatch` | d2617 | D \ F (7273) |
| `family_rejection:1310:conflict:partial_not_accepted` | d2621, d3308–d3309 | D \ F (7271) |
| `family_rejection:1312:conflict:stale_not_accepted` | d2622, d3310 | D \ F (7272) |
| `read_token_rejection:1975:read_token_exemption` | d3229–d3233 | D \ F (7269) |
| `source_fact_rejection:800:source_application_context;application_wrapper_rejection:910:application_wrapper_identity` | d3319, d3337–d3339, d3409, d3865, d3883–d3885, d3951, d4051, d4069–d4071, d4138, d4239, d4258–d4260, d4326, d4427, d4445–d4453, d4521, d4635, d4656–d4664, d4729, d4840, d4858–d4860, d4925, d5024, d5045–d5047, d5114, d5387, d5408–d5410, d5473, d5570, d5588–d5590, d5655, d5754, d5772–d5774, d5839, d5938, d5959–d5961, d6032, d6139, d6157–d6159, d6232, d6519, d6537–d6539, d6616 | D \ F (7192) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_created:additionalProperties` | s664, s17739 | S \ F (20883) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_created:required:definition_revision` | s636, s17756 | S \ F (20883) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/identifier:type` | s36, s134, s217, s505, s570, s654, s680–s681, s692–s693, s695–s696, s717–s718, s720–s721, s726–s727, s738–s739, s741–s742, s756–s757, s765–s766, s768–s769, s771–s772, s780–s781, s783–s784, s829–s830, s847–s848, s859–s860, s862–s863, s895–s896, s925–s926, s937–s938, s940–s941, s971–s972, s980–s981, s989–s990, s992–s993, s1016–s1017, s1031–s1032, s1034–s1035, s1037–s1038, s1068–s1069, s1080–s1081, s1086–s1087, s1089–s1090, s1101–s1102, s1104–s1105, s1134–s1135, s1137–s1138, s1152–s1153, s1155–s1156, s1164–s1165, s1182–s1183, s1185–s1186, s1207–s1208, s1219–s1220, s1222–s1223, s1225–s1226, s1231–s1232, s1249–s1250, s1252–s1253, s1273–s1274, s1276–s1277, s1288–s1289, s1291–s1292, s1297–s1298, s1300–s1301, s1324–s1325, s1331–s1332, s1343–s1344, s1346–s1347, s1352–s1353, s1355–s1356, s1379–s1380, s1385–s1386, s1388–s1389, s1400–s1401, s1403–s1404, s1406–s1407, s1437–s1438, s1443–s1444, s1452–s1453, s1455–s1456, s1479–s1480, s1491–s1492, s1497–s1498, s1500–s1501, s1509–s1510, s1512–s1513, s1524–s1525, s1537–s1538, s1549–s1550, s1555–s1556, s1558–s1559, s1567–s1568, s1570–s1571, s1582–s1583, s1588–s1589, s1606–s1607, s1612–s1613, s1615–s1616, s1639–s1640, s1642–s1643, s1661–s1662, s1670–s1671, s1676–s1677, s1679–s1680, s1703–s1704, s1706–s1707, s1718–s1719, s1733–s1734, s1745–s1746, s1748–s1749, s1751–s1752, s1770–s1771, s1782–s1783, s1791–s1792, s1794–s1795, s1800–s1801, s1803–s1804, s1815–s1816, s1818–s1819, s1821–s1822, s1839–s1840, s1842–s1843, s1854–s1855, s1863–s1864, s1869–s1870, s1872–s1873, s1875–s1876, s1878–s1879, s1884–s1885, s1887–s1888, s1890–s1891, s1914–s1915, s1927–s1928, s1930–s1931, s1948–s1949, s1951–s1952, s1954–s1955, s1978–s1979, s1981–s1982, s1993–s1994, s2014–s2015, s2017–s2018, s2020–s2021, s2038–s2039, s2054–s2055, s2060–s2061, s2069–s2070, s2072–s2073, s2075–s2076, s2093–s2094, s2096–s2097, s2114–s2115, s2117–s2118, s2120–s2121, s2123–s2124, s2126–s2127, s2129–s2130, s2132–s2133, s2163–s2164, s2169–s2170, s2172–s2173, s2175–s2176, s2199–s2200, s2211–s2212, s2214–s2215, s2217–s2218, s2220–s2221, s2244–s2245, s2260–s2261, s2266–s2267, s2269–s2270, s2272–s2273, s2275–s2276, s2299–s2300, s2305–s2306, s2320–s2321, s2332–s2333, s2338–s2339, s2341–s2342, s2356–s2357, s2360–s2361, s2375–s2376, s2378–s2379, s2384–s2385, s2390–s2391, s2393–s2394, s2408–s2409, s2411–s2412, s2414–s2415, s2429–s2430, s2432–s2433, s2435–s2436, s2466–s2467, s2472–s2473, s2475–s2476, s2478–s2479, s2499–s2500, s2514–s2515, s2563–s2564, s2566–s2567, s2585–s2586, s2588–s2589, s2607–s2608, s2610–s2611, s2629–s2630, s2632–s2633, s3200–s3201, s3203–s3204, s3221–s3222, s3240–s3241, s3249–s3250, s3252–s3253, s3255–s3256, s3258–s3259, s3264–s3265, s3279–s3280, s3282–s3283, s3300–s3301, s3306–s3307, s3327–s3328, s3348–s3349, s3354–s3355, s3357–s3358, s3369–s3370, s3381–s3382, s3388–s3389, s3397–s3398, s3400–s3401, s3403–s3404, s3409–s3410, s3415–s3416, s3418–s3419, s3430–s3431, s3442–s3443, s3448–s3449, s3451–s3452, s3460–s3461, s3463–s3464, s3474–s3477, s3496–s3503, s3545–s3552, s3559–s3562, s3581–s3588, s3613–s3616, s3629–s3632, s3639–s3642, s3661–s3668, s3710–s3717, s3724–s3727, s3746–s3753, s3778–s3781, s3794–s3797, s3804–s3807, s3826–s3833, s3875–s3882, s3889–s3892, s3911–s3918, s3943–s3946, s3959–s3966, s3973–s3976, s3995–s4002, s4044–s4055, s4068–s4075, s4164–s4167, s4190–s4193, s4212–s4219, s4279–s4282, s4329–s4332, s4351–s4358, s4447–s4450, s4473–s4476, s4495–s4502, s4562–s4565, s4612–s4615, s4634–s4641, s4730–s4733, s4756–s4759, s4778–s4785, s4845–s4848, s4896–s4899, s4918–s4925, s5014–s5017, s5041–s5044, s5063–s5070, s5130–s5133, s5146–s5149, s5162–s5169, s5206–s5209, s5234–s5237, s5250–s5257, s5311–s5314, s5327–s5330, s5343–s5350, s5393–s5396, s5421–s5424, s5437–s5444, s5504–s5507, s5520–s5531, s5601–s5604, s5611–s5614, s5620–s5627, s5681–s5684, s5708–s5711, s5717–s5724, s5800–s5803, s5810–s5813, s5819–s5826, s5874–s5877, s5901–s5904, s5910–s5917, s5987–s5990, s5997–s6000, s6006–s6013, s6061–s6064, s6088–s6091, s6097–s6104, s6174–s6177, s6184–s6187, s6221–s6228, s6287–s6298, s6327–s6334, s6371–s6374, s6392–s6399, s6428–s6435, s6494–s6505, s6534–s6541, s6578–s6581, s6599–s6606, s6635–s6642, s6701–s6712, s6740–s6747, s6784–s6787, s6805–s6808, s6836–s6843, s6902–s6909, s6938–s6945, s6982–s6985, s7003–s7010, s7039–s7046, s7105–s7116, s7123–s7130, s7201–s7208, s7215–s7222, s7271–s7274, s7292–s7295, s7302–s7309, s7380–s7387, s7394–s7401, s7450–s7453, s7471–s7474, s7481–s7488, s7559–s7566, s7573–s7580, s7651–s7666, s7726–s7729, s7736–s7747, s7796–s7799, s7818–s7829, s7895–s7898, s7905–s7916, s7959–s7962, s7981–s7992, s8052–s8055, s8062–s8073, s8116–s8119, s8138–s8149, s8209–s8212, s8219–s8222, s8229–s8236, s8249–s8256, s8298–s8301, s8314–s8317, s8324–s8331, s8344–s8351, s8376–s8379, s8404–s8407, s8414–s8421, s8434–s8441, s8483–s8486, s8499–s8502, s8509–s8516, s8529–s8536, s8561–s8564, s8589–s8592, s8599–s8606, s8619–s8626, s8668–s8671, s8684–s8687, s8694–s8701, s8744–s8751, s8787–s8790, s8797–s8800, s8807–s8814, s8857–s8864, s8883–s8886, s8905–s8908, s8915–s8922, s8965–s8972, s9008–s9011, s9018–s9021, s9028–s9035, s9078–s9085, s9104–s9107, s9126–s9129, s9136–s9143, s9186–s9193, s9229–s9232, s9239–s9242, s9254–s9265, s9318–s9321, s9334–s9341, s9353–s9356, s9363–s9374, s9405–s9408, s9426–s9429, s9442–s9445, s9457–s9460, s9467–s9478, s9531–s9534, s9547–s9554, s9572–s9583, s9614–s9617, s9635–s9638, s9651–s9654, s9672–s9683, s9736–s9739, s9752–s9759, s9777–s9788, s9819–s9822, s9840–s9843, s9856–s9859, s9877–s9888, s9941–s9944, s9957–s9964, s9982–s9993, s10024–s10027, s10033–s10036, s10049–s10052, s10065–s10068, s10086–s10097, s10138–s10141, s10154–s10157, s10170–s10177, s10195–s10206, s10237–s10240, s10258–s10261, s10274–s10277, s10295–s10306, s10359–s10362, s10375–s10382, s10395–s10406, s10449–s10452, s10475–s10482, s10489–s10500, s10543–s10550, s10568–s10571, s10578–s10589, s10632–s10635, s10658–s10665, s10672–s10683, s10738–s10745, s10763–s10766, s10773–s10784, s10839–s10842, s10865–s10872, s10879–s10890, s10933–s10940, s10958–s10961, s10968–s10979, s11022–s11025, s11048–s11055, s11062–s11069, s11118–s11125, s11143–s11146, s11153–s11160, s11209–s11212, s11235–s11242, s11249–s11256, s11299–s11306, s11324–s11327, s11346–s11353, s11396–s11399, s11422–s11429, s11454–s11465, s11496–s11499, s11528–s11531, s11538–s11541, s11554–s11565, s11596–s11603, s11633–s11636, s11649–s11660, s11691–s11694, s11723–s11726, s11733–s11736, s11749–s11760, s11791–s11798, s11828–s11831, s11844–s11855, s11886–s11889, s11918–s11921, s11928–s11931, s11944–s11959, s11990–s11997, s12009–s12012, s12031–s12034, s12047–s12062, s12093–s12096, s12113–s12116, s12129–s12132, s12139–s12150, s12210–s12213, s12220–s12231, s12291–s12294, s12301–s12312, s12355–s12358, s12377–s12388, s12448–s12451, s12458–s12469, s12512–s12515, s12534–s12545, s12605–s12608, s12615–s12630, s12673–s12676, s12706–s12709, s12716–s12731, s12774–s12777, s12784–s12787, s12812–s12827, s12870–s12873, s12903–s12906, s12913–s12928, s12971–s12974, s12981–s12984, s13009–s13024, s13067–s13070, s13100–s13103, s13110–s13125, s13168–s13171, s13178–s13181, s13206–s13209, s13216–s13227, s13270–s13273, s13303–s13306, s13313–s13316, s13329–s13332, s13338–s13345, s13370–s13373, s13379–s13382, s13407–s13414, s13421–s13424, s13430–s13437, s13462–s13473, s13498–s13501, s13508–s13511, s13517–s13524, s13549–s13552, s13558–s13561, s13586–s13593, s13600–s13603, s13609–s13616, s13641–s13652, s13677–s13680, s13687–s13690, s13696–s13703, s13728–s13731, s13737–s13740, s13765–s13780, s13840–s13843, s13850–s13861, s13898–s13901, s13926–s13937, s13997–s14000, s14007–s14018, s14078–s14081, s14088–s14099, s14136–s14139, s14164–s14175, s14235–s14238, s14245–s14248, s14255–s14262, s14328–s14331, s14344–s14347, s14354–s14361, s14374–s14377, s14402–s14405, s14442–s14445, s14452–s14459, s14472–s14475, s14529–s14532, s14545–s14548, s14555–s14566, s14609–s14612, s14649–s14652, s14659–s14670, s14742–s14745, s14758–s14761, s14768–s14775, s14818–s14821, s14858–s14861, s14868–s14875, s14947–s14950, s14963–s14966, s14973–s14980, s15017–s15020, s15057–s15060, s15067–s15074, s15140–s15143, s15156–s15159, s15166–s15173, s15210–s15213, s15262–s15265, s15272–s15279, s15345–s15348, s15373–s15380, s15387–s15394, s15430–s15433, s15445–s15448, s15461–s15472, s15479–s15482, s15489–s15496, s15532–s15535, s15542–s15549, s15562–s15569, s15576–s15579, s15586–s15593, s15629–s15632, s15644–s15647, s15660–s15671, s15678–s15681, s15688–s15695, s15731–s15734, s15741–s15748, s15761–s15768, s15775–s15778, s15785–s15792, s15828–s15831, s15843–s15846, s15859–s15870, s15955, s16004, s16059, s16152, s16294, s16393, s16496, s16534, s16637, s17166, s17772, s20097–s20098, s20101–s20102, s20112–s20113, s20116–s20117, s20127–s20128, s20131–s20132, s20142–s20143, s20146–s20147, s20157–s20158, s20161–s20162, s20172–s20173, s20176–s20177, s20187–s20188, s20191–s20192, s20202–s20203, s20206–s20207, s20217–s20218, s20221–s20222, s20232–s20233, s20236–s20237, s20247–s20248, s20251–s20252, s20262–s20263, s20266–s20267, s20277–s20278, s20281–s20282, s20292–s20293, s20296–s20297, s20307–s20308, s20311–s20312, s20322–s20323, s20326–s20327, s20337–s20338, s20341–s20342, s20352–s20353, s20356–s20357, s20367–s20368, s20371–s20372, s20382–s20383, s20386–s20387, s20397–s20398, s20401–s20402, s20412–s20413, s20416–s20417, s20427–s20428, s20431–s20432, s20442–s20443, s20446–s20447, s20457–s20458, s20461–s20462, s20472–s20473, s20476–s20477, s20487–s20488, s20491–s20492, s20502–s20503, s20506–s20507, s20517–s20518, s20521–s20522, s20532–s20533, s20536–s20537, s20547–s20548, s20551–s20552, s20562–s20563, s20566–s20567, s20577–s20578, s20581–s20582, s20592–s20593, s20596–s20597, s20607–s20608, s20611–s20612, s20622–s20623, s20626–s20627, s20637–s20638, s20641–s20642, s20652–s20653, s20656–s20657, s20667–s20668, s20671–s20672, s20682–s20683, s20686–s20687, s20779, s20872 | S \ F (17610) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_created_application/properties/project_id:type` | s618, s1329, s7179–s7183, s7358–s7362, s7537–s7541, s7629–s7633, s17726 | S \ F (20862) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/utc_timestamp:lexical` | s2, s15–s16, s26, s37, s47, s58, s69, s85, s93, s99, s109, s119, s129, s140, s150, s169, s181, s189, s198, s200, s209, s464, s474, s482, s489, s493, s500, s508, s515, s521, s532, s541, s551–s552, s561, s573, s581, s592, s601, s612, s621, s629, s637, s640, s648, s657, s676, s722, s803, s882, s933, s985, s1039, s1106, s1178, s1245, s1305, s1360, s1414, s1463, s1493, s1551, s1632, s1696, s1796, s1865, s1901, s1965, s2056, s2110, s2152, s2195, s2262, s2316, s2328, s2380, s2456, s2501, s3242, s3320, s3350, s3411, s3472–s3473, s3557–s3558, s3637–s3638, s3722–s3723, s3802–s3803, s3887–s3888, s3971–s3972, s4116–s4117, s4260–s4261, s4399–s4400, s4543–s4544, s4682–s4683, s4826–s4827, s4966–s4967, s5061–s5062, s5160–s5161, s5248–s5249, s5341–s5342, s5435–s5436, s5536–s5537, s5638–s5639, s5735–s5736, s5831–s5832, s5922–s5923, s6018–s6019, s6109–s6110, s6219–s6220, s6325–s6326, s6426–s6427, s6532–s6533, s6633–s6634, s6738–s6739, s6834–s6835, s6936–s6937, s7037–s7038, s7141–s7142, s7233–s7234, s7320–s7321, s7412–s7413, s7499–s7500, s7591–s7592, s7683–s7684, s7764–s7765, s7846–s7847, s7933–s7934, s8009–s8010, s8090–s8091, s8166–s8167, s8227–s8228, s8322–s8323, s8412–s8413, s8507–s8508, s8597–s8598, s8736–s8737, s8849–s8850, s8957–s8958, s9070–s9071, s9178–s9179, s9346–s9347, s9450–s9451, s9559–s9560, s9659–s9660, s9764–s9765, s9864–s9865, s9969–s9970, s10073–s10074, s10182–s10183, s10282–s10283, s10387–s10388, s10429–s10430, s10523–s10524, s10612–s10613, s10712–s10713, s10813–s10814, s10913–s10914, s11002–s11003, s11092–s11093, s11183–s11184, s11279–s11280, s11376–s11377, s11536–s11537, s11631–s11632, s11731–s11732, s11826–s11827, s11926–s11927, s12029–s12030, s12137–s12138, s12191–s12192, s12272–s12273, s12353–s12354, s12429–s12430, s12510–s12511, s12586–s12587, s12714–s12715, s12810–s12811, s12911–s12912, s13007–s13008, s13108–s13109, s13204–s13205, s13311–s13312, s13327–s13328, s13419–s13420, s13506–s13507, s13598–s13599, s13685–s13686, s13826–s13827, s13906–s13907, s13983–s13984, s14064–s14065, s14144–s14145, s14221–s14222, s14336–s14337, s14434–s14435, s14537–s14538, s14641–s14642, s14750–s14751, s14850–s14851, s14955–s14956, s15049–s15050, s15148–s15149, s15242–s15243, s15353–s15354, s15385–s15386, s15487–s15488, s15584–s15585, s15686–s15687, s15783–s15784, s15916, s15927, s15935, s15940, s15944, s15951, s15959, s15966, s15972, s15985–s15986, s15995, s16006, s16015, s16029, s16038, s16043, s16053, s16065, s16075, s16104, s16108, s16120, s16131, s16141, s16151, s16162, s16172, s16183, s16193, s16204, s16214, s16221, s16232, s16242, s16254, s16265, s16273, s16279, s16289, s16300, s16309, s16319, s16330, s16363, s16370, s16380, s16391, s16403, s16414, s16428, s16441, s16448, s16457, s16467, s16475, s16479, s16485, s16493, s16507, s16512, s16522, s16532, s16543, s16553, s16564, s16574, s16577, s16590, s16601, s16613, s16615, s16626, s17143, s17149, s17156, s17163, s17172, s17183, s17190, s17744, s20695, s20706, s20716, s20726, s20736, s20746, s20755, s20760, s20768, s20777, s20787, s20797, s20807, s20822, s20824, s20836, s20849, s20861 | S \ F (20449) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/sha256_hex:lexical` | s8, s13, s22, s32, s43, s53, s64, s75, s84, s91, s98, s108, s118, s128, s139, s149, s173, s178, s184, s192, s204, s213, s465, s475, s483, s487, s494, s501, s509, s516, s525, s531, s536, s545, s556, s565, s577, s585, s596, s605, s613, s622, s630, s635, s641, s649, s658, s697, s743, s791, s837, s870, s915, s945, s997, s1045, s1112, s1190, s1257, s1308, s1363, s1408, s1457, s1502, s1542, s1560, s1599, s1623, s1663, s1687, s1726, s1753, s1823, s1892, s1956, s1998, s2004, s2022, s2077, s2137, s2180, s2222, s2277, s2343, s2395, s2440, s2483, s3205, s3284, s3329, s3338, s3362, s3423, s3508–s3509, s3593–s3594, s3673–s3674, s3758–s3759, s3838–s3839, s3923–s3924, s4007–s4008, s4092–s4093, s4236–s4237, s4375–s4376, s4519–s4520, s4658–s4659, s4802–s4803, s4942–s4943, s5081–s5082, s5174–s5175, s5262–s5263, s5361–s5362, s5455–s5456, s5548–s5549, s5650–s5651, s5747–s5748, s5843–s5844, s5934–s5935, s6030–s6031, s6121–s6122, s6239–s6240, s6345–s6346, s6446–s6447, s6552–s6553, s6653–s6654, s6758–s6759, s6854–s6855, s6956–s6957, s7057–s7058, s7147–s7148, s7239–s7240, s7326–s7327, s7418–s7419, s7505–s7506, s7597–s7598, s7671–s7672, s7752–s7753, s7834–s7835, s7921–s7922, s7997–s7998, s8078–s8079, s8154–s8155, s8241–s8242, s8336–s8337, s8426–s8427, s8521–s8522, s8611–s8612, s8718–s8719, s8831–s8832, s8939–s8940, s9052–s9053, s9160–s9161, s9270–s9271, s9379–s9380, s9483–s9484, s9588–s9589, s9688–s9689, s9793–s9794, s9893–s9894, s9998–s9999, s10102–s10103, s10211–s10212, s10311–s10312, s10411–s10412, s10505–s10506, s10594–s10595, s10688–s10689, s10789–s10790, s10895–s10896, s10984–s10985, s11074–s11075, s11165–s11166, s11261–s11262, s11338–s11339, s11358–s11359, s11440–s11441, s11470–s11471, s11570–s11571, s11665–s11666, s11765–s11766, s11860–s11861, s11964–s11965, s12067–s12068, s12161–s12162, s12242–s12243, s12323–s12324, s12399–s12400, s12480–s12481, s12556–s12557, s12635–s12636, s12736–s12737, s12832–s12833, s12933–s12934, s13029–s13030, s13130–s13131, s13232–s13233, s13350–s13351, s13442–s13443, s13529–s13530, s13621–s13622, s13708–s13709, s13791–s13792, s13872–s13873, s13948–s13949, s14029–s14030, s14110–s14111, s14186–s14187, s14267–s14268, s14366–s14367, s14464–s14465, s14571–s14572, s14675–s14676, s14786–s14787, s14886–s14887, s14985–s14986, s15079–s15080, s15178–s15179, s15284–s15285, s15405–s15406, s15507–s15508, s15604–s15605, s15706–s15707, s15803–s15804, s15915, s15921, s15926, s15934, s15943, s15950, s15958, s15965, s15975, s15982, s15989, s15998, s16009, s16018, s16024, s16028, s16036, s16042, s16052, s16064, s16074, s16099, s16106, s16115, s16126, s16136, s16146, s16157, s16167, s16178, s16188, s16199, s16209, s16219, s16230, s16240, s16247, s16251, s16262, s16277, s16287, s16298, s16307, s16317, s16325, s16328, s16336, s16357, s16366, s16374, s16385, s16397, s16408, s16421, s16434, s16446, s16455, s16460, s16465, s16473, s16483, s16491, s16502, s16510, s16517, s16527, s16538, s16548, s16559, s16569, s16581, s16589, s16594, s16605, s16619, s16630, s17141, s17147, s17153, s17161, s17170, s17180, s17188, s17747–s17748, s20690, s20700, s20710, s20721, s20731, s20741, s20750, s20758, s20763, s20772, s20782, s20792, s20810, s20820, s20827, s20839, s20852, s20864 | S \ F (20431) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_started:additionalProperties` | s19896, s20805 | S \ F (20883) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_started:required:lifecycle_seq` | s19907, s20759 | S \ F (20883) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_started_application/properties/project_id:type` | s3226, s14299–s14303, s14500–s14504, s14713–s14717, s14918–s14922, s15111–s15115, s15316–s15320, s19863, s20697 | S \ F (20852) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_paused:additionalProperties` | s16498, s18268 | S \ F (20883) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_paused:required:lifecycle_seq` | s16478, s18280 | S \ F (20883) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_paused_application/properties/project_id:type` | s2155, s12193–s12197, s12274–s12278, s12431–s12435, s12588–s12592, s16451, s18259 | S \ F (20862) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_resumed:additionalProperties` | s17176, s18474 | S \ F (20883) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_resumed:required:lifecycle_seq` | s17148, s18486 | S \ F (20883) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_resumed_application/properties/project_id:type` | s2455, s13817–s13821, s13974–s13978, s14055–s14059, s14212–s14216, s17146, s18464 | S \ F (20862) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_cancelled:additionalProperties` | s218, s17434 | S \ F (20883) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_cancelled:required:lifecycle_seq` | s197, s17449 | S \ F (20883) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_cancelled_application/properties/project_id:type` | s177, s963, s5113–s5117, s5294–s5298, s5487–s5491, s17418 | S \ F (20867) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_completed:additionalProperties` | s520, s17577 | S \ F (20883) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_completed:required:lifecycle_seq` | s488, s17591 | S \ F (20883) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_completed_application/properties/project_id:type` | s469, s1066, s5579–s5583, s5778–s5782, s5965–s5969, s6152–s6156, s17554 | S \ F (20862) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_failed:additionalProperties` | s15971, s17824 | S \ F (20883) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_failed:required:lifecycle_seq` | s15923, s17838 | S \ F (20883) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_failed_application/properties/project_id:type` | s1429, s7709–s7713, s7878–s7882, s8035–s8039, s8192–s8196, s15920, s17815 | S \ F (20862) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_started:additionalProperties` | s16416, s18219 | S \ F (20883) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_started:required:participant_slot_id` | s16368, s18231 | S \ F (20883) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_started_application/properties/project_id:type` | s2040, s11500–s11504, s11695–s11699, s11890–s11894, s12097–s12101, s16365, s18202 | S \ F (20862) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_completed:additionalProperties` | s16295, s18128 | S \ F (20883) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_completed:required:participant_slot_id` | s16272, s18143 | S \ F (20883) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_completed_application/properties/project_id:type` | s1916, s10453–s10457, s10636–s10640, s10843–s10847, s11026–s11030, s11213–s11217, s11400–s11404, s16226, s18107 | S \ F (20852) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_message_added:additionalProperties` | s16194, s18054 | S \ F (20883) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_message_added:required:collaboration_message_id` | s16107, s18056 | S \ F (20883) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_message_added_application/properties/project_id:type` | s1768, s9296–s9300, s9509–s9513, s9714–s9718, s9919–s9923, s10128–s10132, s10337–s10341, s16105, s18032 | S \ F (20852) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_artifact_added:additionalProperties` | s57, s17243 | S \ F (20883) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_artifact_added:required:artifact_ref` | s14, s17241 | S \ F (20883) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_artifact_added_application/properties/project_id:type` | s12, s709, s3528–s3532, s3693–s3697, s3858–s3862, s4027–s4031, s17231 | S \ F (20862) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_configuration_changed:additionalProperties` | s590, s17674 | S \ F (20883) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_configuration_changed:required:definition_revision` | s550, s17679 | S \ F (20883) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_configuration_changed_application/properties/project_id:type` | s530, s1205, s6265–s6269, s6472–s6476, s6679–s6683, s6880–s6884, s7083–s7087, s17649 | S \ F (20857) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_proposal_added:additionalProperties` | s16639, s18398 | S \ F (20883) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_proposal_added:required:proposal_id` | s16612, s18412 | S \ F (20883) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_proposal_added_application/properties/project_id:type` | s2358, s13374–s13378, s13553–s13557, s13732–s13736, s16588, s18382 | S \ F (20867) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_vote_added:additionalProperties` | s19976, s20873 | S \ F (20883) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_vote_added:required:vote_id` | s20002, s20821 | S \ F (20883) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_vote_added_application/properties/project_id:type` | s3386, s15440–s15444, s15639–s15643, s15838–s15842, s19960, s20818 | S \ F (20867) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_plan_synthesized:additionalProperties` | s16555, s18329 | S \ F (20883) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_plan_synthesized:required:assistant_plan_id` | s16511, s18328 | S \ F (20883) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_plan_synthesized_application/properties/project_id:type` | s2249, s12683–s12687, s12880–s12884, s13077–s13081, s13280–s13284, s16509, s18317 | S \ F (20862) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_added:additionalProperties` | s16005, s17884 | S \ F (20883) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_added:required:finding_id` | s15983, s17891 | S \ F (20883) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_added_application/properties/project_id:type` | s1529, s8281–s8285, s8466–s8470, s8651–s8655, s15981, s17871 | S \ F (20867) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_dispositioned:additionalProperties` | s16060, s17955 | S \ F (20883) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_dispositioned:required:finding_id` | s16037, s17973 | S \ F (20883) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_dispositioned_application/properties/project_id:type` | s1653, s8770–s8774, s8991–s8995, s9212–s9216, s16035, s17943 | S \ F (20867) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized:additionalProperties` | s156, s17317 | S \ F (20883) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized:required:artifact_ref` | s92, s17315 | S \ F (20883) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized_application/properties/project_id:type` | s90, s815, s4135–s4139, s4418–s4422, s4701–s4705, s4985–s4989, s17290 | S \ F (20862) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_created/properties/definition_revision:const` | s663, s1369–s1371, s7247–s7252, s7426–s7431, s17757 | S \ F (20868) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_started/properties/lifecycle_seq:const` | s3296–s3298, s14390–s14395, s14591–s14596, s14806–s14811, s15005–s15010, s15198–s15203, s19908, s20803 | S \ F (20850) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_started/allOf/0/then:required:crew_auto_revision` | s19887, s20757 | S \ F (20883) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_started/allOf/4/then:not` | s20802 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_started/allOf/2/then:required:assistant_plan_id` | s20738 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_started/allOf/3/then:required:target_pack_ref` | s19931, s20801 | S \ F (20883) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_started/properties/state_after:enum` | s3323–s3325, s14436–s14441, s14643–s14648, s14852–s14857, s15051–s15056, s15244–s15249, s19923, s20804 | S \ F (20850) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_paused/properties/lifecycle_seq:minimum` | s16497, s18281 | S \ F (20883) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_paused/properties/state_before:enum` | s2207–s2209, s12371–s12376, s12528–s12533, s16461, s18290 | S \ F (20868) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_resumed/properties/state_after:enum` | s2510–s2512, s13920–s13925, s14158–s14163, s17175, s18496 | S \ F (20868) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_cancelled/allOf/1/then:not` | s196 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_cancelled/allOf/0/then:required:command_instance_ref` | s219, s17437 | S \ F (20883) |
| `schema:Plans/collaborative_workflows_contracts.schema.json#/$defs/stop_reason:enum` | s179, s976–s978, s1027–s1029, s5140–s5145, s5228–s5233, s5321–s5326, s5415–s5420, s5514–s5519, s17427, s17430, s17460 | S \ F (20845) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_completed/allOf/0/then/properties/kind:const` | s470 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_completed/allOf/1/then/allOf/1/properties/state_before:enum` | s490 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_failed/properties/failure_reason:enum` | s1466–s1468, s7766–s7771, s7935–s7940, s8092–s8097, s15922, s15970, s17833 | S \ F (20861) |
| `schema:Plans/collaborative_workflows_contracts.schema.json#/$defs/additive_role_kind:enum` | s2007–s2009, s2062–s2064, s11442–s11447, s11542–s11547, s11637–s11642, s11737–s11742, s11832–s11837, s11932–s11937, s12035–s12040, s16339, s16353, s16367, s18161, s18214 | S \ F (20832) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_started:required:attempt_id` | s16369, s18218 | S \ F (20883) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_completed/allOf/0/then:not` | s16314 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_completed/allOf/3/then:required:outcome_reason` | s16270, s18118 | S \ F (20883) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_completed/allOf/2/then:required:waiver_actor_ref` | s16337, s18154 | S \ F (20883) |
| `schema:Plans/collaborative_workflows_contracts.schema.json#/$defs/participant_outcome:enum` | s1910–s1912, s1974–s1976, s10443–s10448, s10537–s10542, s10626–s10631, s10726–s10731, s10827–s10832, s10927–s10932, s11016–s11021, s11106–s11111, s11197–s11202, s11293–s11298, s11390–s11395, s16271, s16341, s16352, s18117, s18121, s18142, s18153, s18157, s18182 | S \ F (20804) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_message_added/properties/sequence:minimum` | s16173, s18079 | S \ F (20883) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_message_added/allOf/0/then:not` | s16215 | S \ F (20884) |
| `schema:Plans/collaborative_workflows_contracts.schema.json#/$defs/message_type:enum` | s1765–s1767, s1835–s1837, s9290–s9295, s9399–s9404, s9503–s9508, s9608–s9613, s9708–s9713, s9813–s9818, s9913–s9918, s10018–s10023, s10122–s10127, s10231–s10236, s10331–s10336, s16109, s18067 | S \ F (20811) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/non_secret_ref:lexical` | s1, s4–s5, s18–s19, s28–s29, s39–s40, s49–s50, s60–s61, s71–s72, s80–s81, s88, s94–s95, s102, s104–s105, s112, s114–s115, s122, s124–s125, s132, s135–s136, s143, s145–s146, s153, s168, s172, s180, s188, s199, s203, s208, s212, s473, s481, s524, s535, s544, s555, s564, s576, s584, s595, s604, s614, s623, s631, s642, s650, s659, s685, s688, s731, s734, s773, s776, s843, s852, s855, s921, s930, s942, s982, s994, s1060, s1094, s1097, s1127, s1187, s1254, s1311, s1366, s1445, s1448, s1514, s1572, s1608, s1644, s1672, s1708, s1735, s1741, s1805, s1811, s1898, s1932, s1938, s1962, s1995, s2001, s2028, s2041, s2083, s2098, s2134, s2177, s2240, s2295, s2362, s2416, s2437, s2480, s3227, s3230, s3308, s3311, s3335, s3344, s3405, s3465, s3488–s3489, s3494–s3495, s3573–s3574, s3579–s3580, s3653–s3654, s3659–s3660, s3738–s3739, s3744–s3745, s3818–s3819, s3824–s3825, s3903–s3904, s3909–s3910, s3987–s3988, s3993–s3994, s4060–s4061, s4066–s4067, s4188–s4189, s4204–s4205, s4210–s4211, s4327–s4328, s4343–s4344, s4349–s4350, s4471–s4472, s4487–s4488, s4493–s4494, s4610–s4611, s4626–s4627, s4632–s4633, s4754–s4755, s4770–s4771, s4776–s4777, s4894–s4895, s4910–s4911, s4916–s4917, s5039–s5040, s5055–s5056, s5075–s5076, s5154–s5155, s5242–s5243, s5335–s5336, s5355–s5356, s5429–s5430, s5449–s5450, s5632–s5633, s5729–s5730, s6233–s6234, s6339–s6340, s6440–s6441, s6546–s6547, s6647–s6648, s6752–s6753, s6848–s6849, s6950–s6951, s7051–s7052, s7153–s7154, s7245–s7246, s7332–s7333, s7424–s7425, s7511–s7512, s7603–s7604, s7776–s7777, s7858–s7859, s8261–s8262, s8356–s8357, s8446–s8447, s8541–s8542, s8631–s8632, s8692–s8693, s8756–s8757, s8805–s8806, s8869–s8870, s8913–s8914, s8977–s8978, s9026–s9027, s9090–s9091, s9134–s9135, s9198–s9199, s9252–s9253, s9361–s9362, s9465–s9466, s9570–s9571, s9670–s9671, s9775–s9776, s9875–s9876, s9980–s9981, s10084–s10085, s10193–s10194, s10293–s10294, s10423–s10424, s10517–s10518, s10606–s10607, s10700–s10701, s10706–s10707, s10801–s10802, s10807–s10808, s10907–s10908, s10996–s10997, s11086–s11087, s11177–s11178, s11273–s11274, s11332–s11333, s11370–s11371, s11434–s11435, s11482–s11483, s11509–s11510, s11582–s11583, s11608–s11609, s11677–s11678, s11704–s11705, s11777–s11778, s11803–s11804, s11872–s11873, s11899–s11900, s11976–s11977, s12002–s12003, s12079–s12080, s12106–s12107, s12155–s12156, s12236–s12237, s12317–s12318, s12393–s12394, s12474–s12475, s12550–s12551, s12671–s12672, s12772–s12773, s12868–s12869, s12969–s12970, s13065–s13066, s13166–s13167, s13268–s13269, s13387–s13388, s13478–s13479, s13566–s13567, s13657–s13658, s13745–s13746, s13785–s13786, s13866–s13867, s13942–s13943, s14023–s14024, s14104–s14105, s14180–s14181, s14308–s14309, s14314–s14315, s14410–s14411, s14416–s14417, s14509–s14510, s14515–s14516, s14617–s14618, s14623–s14624, s14722–s14723, s14728–s14729, s14826–s14827, s14832–s14833, s14927–s14928, s14933–s14934, s15025–s15026, s15031–s15032, s15120–s15121, s15126–s15127, s15218–s15219, s15224–s15225, s15260–s15261, s15325–s15326, s15331–s15332, s15371–s15372, s15477–s15478, s15574–s15575, s15676–s15677, s15773–s15774, s15875–s15876, s15928, s15936, s15977, s15991, s16000, s16011, s16020, s16025, s16031, s16039, s16045, s16049, s16055, s16061, s16067, s16071, s16077, s16095, s16111, s16122, s16132, s16142, s16153, s16163, s16174, s16184, s16195, s16205, s16220, s16231, s16241, s16252–s16253, s16263–s16264, s16278, s16288, s16299, s16308, s16318, s16324, s16329, s16335, s16358, s16361, s16375, s16379, s16386, s16389, s16398, s16402, s16409, s16412, s16422, s16426, s16435, s16438, s16445, s16454, s16464, s16472, s16482, s16490, s16504, s16519, s16529, s16540, s16550, s16561, s16571, s16585, s16599, s16609, s16624, s16634, s17140, s17152, s17160, s17169, s17179, s17187, s17751–s17753, s20692–s20693, s20704–s20705, s20713–s20714, s20724–s20725, s20733–s20734, s20744–s20745, s20752–s20753, s20766–s20767, s20774–s20775, s20785–s20786, s20788, s20794–s20795, s20798, s20817, s20834, s20846, s20859, s20871 | S \ F (20311) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_configuration_changed/properties/definition_revision:minimum` | s572, s17680 | S \ F (20883) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_configuration_changed/allOf/1/then/properties/change_kinds:minItems` | s571, s6300, s6516, s6920, s17667 | S \ F (20880) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_configuration_changed/allOf/0/then/allOf/0:not` | s589 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/reconfigure_change_kind:enum` | s591, s1169–s1171, s1236–s1238 | S \ F (20878) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_proposal_added/properties/kind:const` | s2404–s2406, s13456–s13461, s13635–s13640, s16614, s18409 | S \ F (20868) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_proposal_added/properties/proposal_round:minimum` | s16638, s18415 | S \ F (20883) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_vote_added/properties/confidence:maximum` | s20819 | S \ F (20884) |
| `schema:Plans/collaborative_workflows_contracts.schema.json#/$defs/vote_position:enum` | s3383–s3385, s3444–s3446, s15434–s15439, s15536–s15541, s15633–s15638, s15735–s15740, s15832–s15837, s19994, s20847, s20878 | S \ F (20846) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_plan_synthesized/properties/kind:const` | s2289–s2291, s12756–s12761, s12953–s12958, s13150–s13155, s16513, s18343 | S \ F (20862) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_plan_synthesized/properties/tie_resolution:enum` | s2322–s2324, s13210–s13215, s16576, s18362 | S \ F (20874) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_added/properties/originating_reviewer_ids:minItems` | s8370, s8555, s15984, s17900 | S \ F (20881) |
| `schema:Plans/collaborative_workflows_contracts.schema.json#/$defs/review_disposition:enum` | s1629–s1631, s1693–s1695, s8726–s8731, s8839–s8844, s8947–s8952, s9060–s9065, s9168–s9173, s16081, s16084, s17968, s17997 | S \ F (20845) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized/allOf/0/then/properties/requested_reviewer_count:const` | s155, s17368 | S \ F (20883) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_started/allOf/3/then:required:target_hashes` | s19928, s20800 | S \ F (20883) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_completed/allOf/2/then:required:waiver_currentness_hash` | s16338, s18155 | S \ F (20883) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/identifier:lexical` | s3, s6–s7, s10–s11, s17, s20–s21, s24–s25, s27, s30–s31, s34–s35, s38, s41–s42, s45–s46, s48, s51–s52, s55–s56, s59, s62–s63, s66–s68, s70, s73–s74, s77–s79, s82–s83, s87, s89, s96–s97, s101, s103, s106–s107, s111, s113, s116–s117, s121, s123, s126–s127, s131, s133, s137–s138, s142, s144, s147–s148, s152, s154, s170–s171, s175–s176, s182–s183, s186–s187, s190–s191, s194–s195, s201–s202, s206–s207, s210–s211, s215–s216, s462–s463, s467–s468, s471–s472, s477–s480, s485–s486, s491–s492, s496–s499, s503–s504, s506–s507, s511–s514, s518–s519, s522–s523, s527–s529, s533–s534, s538–s540, s542–s543, s547–s549, s553–s554, s558–s560, s562–s563, s567–s569, s574–s575, s579–s580, s582–s583, s587–s588, s593–s594, s598–s600, s602–s603, s607–s611, s616–s617, s619–s620, s625–s628, s633–s634, s638–s639, s644–s647, s652–s653, s655–s656, s661–s662, s679, s691, s694, s716, s719, s725, s737, s740, s755, s764, s767, s770, s779, s782, s828, s846, s858, s861, s894, s924, s936, s939, s970, s979, s988, s991, s1015, s1030, s1033, s1036, s1067, s1079, s1085, s1088, s1100, s1103, s1133, s1136, s1151, s1154, s1163, s1181, s1184, s1206, s1218, s1221, s1224, s1230, s1248, s1251, s1272, s1275, s1287, s1290, s1296, s1299, s1323, s1330, s1342, s1345, s1351, s1354, s1378, s1384, s1387, s1399, s1402, s1405, s1436, s1442, s1451, s1454, s1478, s1490, s1496, s1499, s1508, s1511, s1523, s1536, s1548, s1554, s1557, s1566, s1569, s1581, s1587, s1605, s1611, s1614, s1638, s1641, s1660, s1669, s1675, s1678, s1702, s1705, s1717, s1732, s1744, s1747, s1750, s1769, s1781, s1790, s1793, s1799, s1802, s1814, s1817, s1820, s1838, s1841, s1853, s1862, s1868, s1871, s1874, s1877, s1883, s1886, s1889, s1913, s1926, s1929, s1947, s1950, s1953, s1977, s1980, s1992, s2013, s2016, s2019, s2037, s2053, s2059, s2068, s2071, s2074, s2092, s2095, s2113, s2116, s2119, s2122, s2125, s2128, s2131, s2162, s2168, s2171, s2174, s2198, s2210, s2213, s2216, s2219, s2243, s2259, s2265, s2268, s2271, s2274, s2298, s2304, s2319, s2331, s2337, s2340, s2355, s2359, s2374, s2377, s2383, s2389, s2392, s2407, s2410, s2413, s2428, s2431, s2434, s2465, s2471, s2474, s2477, s2498, s2513, s2562, s2565, s2584, s2587, s2606, s2609, s2628, s2631, s3199, s3202, s3220, s3239, s3248, s3251, s3254, s3257, s3263, s3278, s3281, s3299, s3305, s3326, s3347, s3353, s3356, s3368, s3380, s3387, s3396, s3399, s3402, s3408, s3414, s3417, s3429, s3441, s3447, s3450, s3459, s3462, s15913–s15914, s15918–s15919, s15924–s15925, s15930–s15933, s15938–s15939, s15941–s15942, s15946–s15949, s15953–s15954, s15956–s15957, s15961–s15964, s15968–s15969, s15973–s15974, s15976, s15979–s15980, s15987–s15988, s15990, s15993–s15994, s15996–s15997, s15999, s16002–s16003, s16007–s16008, s16010, s16013–s16014, s16016–s16017, s16019, s16022–s16023, s16026–s16027, s16030, s16033–s16034, s16040–s16041, s16044, s16047–s16048, s16050–s16051, s16054, s16057–s16058, s16062–s16063, s16066, s16069–s16070, s16072–s16073, s16076, s16079–s16080, s16096–s16098, s16101–s16103, s16110, s16112–s16114, s16117–s16119, s16121, s16123–s16125, s16128–s16130, s16133–s16135, s16138–s16140, s16143–s16145, s16148–s16150, s16154–s16156, s16159–s16161, s16164–s16166, s16169–s16171, s16175–s16177, s16180–s16182, s16185–s16187, s16190–s16192, s16196–s16198, s16201–s16203, s16206–s16208, s16211–s16213, s16216–s16218, s16223–s16225, s16227–s16229, s16234–s16239, s16244–s16246, s16248–s16250, s16256–s16261, s16267–s16269, s16274–s16276, s16281–s16286, s16291–s16293, s16296–s16297, s16302–s16306, s16311–s16313, s16315–s16316, s16321–s16323, s16326–s16327, s16332–s16334, s16354–s16356, s16360, s16362, s16364, s16371–s16373, s16377–s16378, s16381–s16384, s16388, s16390, s16392, s16394–s16396, s16400–s16401, s16404–s16407, s16411, s16413, s16415, s16417–s16420, s16424–s16425, s16427, s16429–s16433, s16437, s16439–s16440, s16442–s16444, s16449–s16450, s16452–s16453, s16458–s16459, s16462–s16463, s16468–s16471, s16476–s16477, s16480–s16481, s16486–s16489, s16494–s16495, s16499–s16501, s16505–s16506, s16508, s16514–s16516, s16520–s16521, s16523–s16526, s16530–s16531, s16533, s16535–s16537, s16541–s16542, s16544–s16547, s16551–s16552, s16554, s16556–s16558, s16562–s16563, s16565–s16568, s16572–s16573, s16575, s16578–s16580, s16583–s16584, s16586–s16587, s16591–s16593, s16596–s16598, s16600, s16602–s16604, s16607–s16608, s16610–s16611, s16616–s16618, s16621–s16623, s16625, s16627–s16629, s16632–s16633, s16635–s16636, s17138–s17139, s17144–s17145, s17150–s17151, s17155, s17157–s17159, s17164–s17165, s17167–s17168, s17173–s17174, s17177–s17178, s17182, s17184–s17186, s17191–s17192, s17768–s17770, s20099, s20114, s20129, s20144, s20159, s20174, s20189, s20204, s20219, s20234, s20249, s20264, s20279, s20294, s20309, s20324, s20339, s20354, s20369, s20384, s20399, s20414, s20429, s20444, s20459, s20474, s20489, s20504, s20519, s20534, s20549, s20564, s20579, s20594, s20609, s20624, s20639, s20654, s20669, s20684, s20688–s20689, s20694, s20696, s20698–s20699, s20701, s20703, s20707–s20709, s20711, s20715, s20717–s20720, s20723, s20727–s20730, s20735, s20737, s20739–s20740, s20743, s20747–s20749, s20754, s20756, s20761–s20762, s20765, s20769–s20771, s20776, s20778, s20780–s20781, s20784, s20789–s20791, s20796, s20799, s20806, s20808–s20809, s20812–s20816, s20823, s20825–s20826, s20829–s20833, s20835, s20837–s20838, s20841–s20845, s20848, s20850–s20851, s20854–s20858, s20860, s20862–s20863, s20866–s20870 | S \ F (19965) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_created/properties/idempotency_key:lexical` | s624, s643, s1372, s7257–s7258, s7436–s7437, s17758 | S \ F (20877) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_created_application/properties/idempotency_key:lexical` | s615, s632, s651, s660, s1317, s7165–s7166, s7344–s7345, s7523–s7524, s7615–s7616, s17716 | S \ F (20871) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_started/properties/idempotency_key:lexical` | s3290, s14382–s14383, s14583–s14584, s14798–s14799, s14997–s14998, s15190–s15191, s19903, s20702, s20722, s20742, s20764, s20783 | S \ F (20868) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_started_application/properties/idempotency_key:lexical` | s3211, s14279–s14280, s14480–s14481, s14687–s14688, s14898–s14899, s15091–s15092, s15296–s15297, s19851, s20691, s20712, s20732, s20751, s20773, s20793 | S \ F (20865) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_paused/properties/idempotency_key:lexical` | s2186, s12335–s12336, s12492–s12493, s16466, s16484, s18276 | S \ F (20877) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_paused_application/properties/idempotency_key:lexical` | s2143, s12173–s12174, s12254–s12255, s12411–s12412, s12568–s12569, s16447, s16456, s16474, s16492, s18250 | S \ F (20871) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_resumed/properties/idempotency_key:lexical` | s2489, s13884–s13885, s14122–s14123, s17154, s17181, s18482 | S \ F (20877) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_resumed_application/properties/idempotency_key:lexical` | s2446, s13803–s13804, s13960–s13961, s14041–s14042, s14198–s14199, s17142, s17162, s17171, s17189, s18456 | S \ F (20871) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_cancelled/properties/idempotency_key:lexical` | s185, s205, s1006, s5192–s5193, s5379–s5380, s17445 | S \ F (20877) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_cancelled_application/properties/idempotency_key:lexical` | s174, s193, s214, s954, s5099–s5100, s5280–s5281, s5473–s5474, s17410 | S \ F (20874) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_completed/properties/idempotency_key:lexical` | s476, s495, s510, s1118, s5662–s5663, s5855–s5856, s6042–s6043, s17587 | S \ F (20874) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_completed_application/properties/idempotency_key:lexical` | s466, s484, s502, s517, s1051, s5560–s5561, s5759–s5760, s5946–s5947, s6133–s6134, s17544 | S \ F (20871) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_failed/properties/idempotency_key:lexical` | s1469, s7782–s7783, s7945–s7946, s8102–s8103, s15929, s15945, s15960, s17834 | S \ F (20874) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_failed_application/properties/idempotency_key:lexical` | s1420, s7695–s7696, s7864–s7865, s8021–s8022, s8178–s8179, s15917, s15937, s15952, s15967, s17807 | S \ F (20871) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_started/properties/idempotency_key:lexical` | s2086, s11588–s11589, s11783–s11784, s11982–s11983, s16376, s16399, s16423, s18227 | S \ F (20874) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_started_application/properties/idempotency_key:lexical` | s2031, s11488–s11489, s11683–s11684, s11878–s11879, s12085–s12086, s16359, s16387, s16410, s16436, s18196 | S \ F (20871) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_completed/properties/idempotency_key:lexical` | s1968, s10529–s10530, s10718–s10719, s10919–s10920, s11098–s11099, s11285–s11286, s16233, s16255, s16280, s16301, s16320, s18137 | S \ F (20868) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_completed_application/properties/idempotency_key:lexical` | s1904, s10435–s10436, s10618–s10619, s10819–s10820, s11008–s11009, s11189–s11190, s11382–s11383, s16222, s16243, s16266, s16290, s16310, s16331, s18100 | S \ F (20865) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_message_added/properties/idempotency_key:lexical` | s1829, s9391–s9392, s9600–s9601, s9805–s9806, s10010–s10011, s10223–s10224, s16116, s16137, s16158, s16179, s16200, s18062 | S \ F (20868) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_message_added_application/properties/idempotency_key:lexical` | s1759, s9282–s9283, s9495–s9496, s9700–s9701, s9905–s9906, s10114–s10115, s10323–s10324, s16100, s16127, s16147, s16168, s16189, s16210, s18026 | S \ F (20865) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_artifact_added/properties/idempotency_key:lexical` | s23, s44, s65, s749, s3605–s3606, s3770–s3771, s3935–s3936, s17250 | S \ F (20874) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_artifact_added_application/properties/idempotency_key:lexical` | s9, s33, s54, s76, s703, s3520–s3521, s3685–s3686, s3850–s3851, s4019–s4020, s17226 | S \ F (20871) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_configuration_changed/properties/idempotency_key:lexical` | s537, s557, s578, s597, s1263, s6357–s6358, s6564–s6565, s6770–s6771, s6968–s6969, s17682 | S \ F (20871) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_configuration_changed_application/properties/idempotency_key:lexical` | s526, s546, s566, s586, s606, s1196, s6251–s6252, s6458–s6459, s6665–s6666, s6866–s6867, s7069–s7070, s17641 | S \ F (20868) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_proposal_added/properties/idempotency_key:lexical` | s2401, s13454–s13455, s13633–s13634, s16595, s16620, s18405 | S \ F (20877) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_proposal_added_application/properties/idempotency_key:lexical` | s2349, s13362–s13363, s13541–s13542, s13720–s13721, s16582, s16606, s16631, s18375 | S \ F (20874) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_vote_added/properties/idempotency_key:lexical` | s3435, s15524–s15525, s15723–s15724, s19987, s20828, s20853 | S \ F (20877) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_vote_added_application/properties/idempotency_key:lexical` | s3374, s15422–s15423, s15621–s15622, s15820–s15821, s19952, s20811, s20840, s20865 | S \ F (20874) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_plan_synthesized/properties/idempotency_key:lexical` | s2286, s12754–s12755, s12951–s12952, s13148–s13149, s16518, s16539, s16560, s18339 | S \ F (20874) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_plan_synthesized_application/properties/idempotency_key:lexical` | s2231, s12653–s12654, s12850–s12851, s13047–s13048, s13250–s13251, s16503, s16528, s16549, s16570, s18303 | S \ F (20871) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_added/properties/idempotency_key:lexical` | s1575, s8362–s8363, s8547–s8548, s15992, s16012, s17894 | S \ F (20877) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_added_application/properties/idempotency_key:lexical` | s1517, s8267–s8268, s8452–s8453, s8637–s8638, s15978, s16001, s16021, s17860 | S \ F (20874) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_dispositioned/properties/idempotency_key:lexical` | s1711, s8875–s8876, s9096–s9097, s16046, s16068, s17976 | S \ F (20877) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_dispositioned_application/properties/idempotency_key:lexical` | s1647, s8762–s8763, s8983–s8984, s9204–s9205, s16032, s16056, s16078, s17937 | S \ F (20874) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized/properties/idempotency_key:lexical` | s100, s120, s141, s885, s4266–s4267, s4549–s4550, s4832–s4833, s17337 | S \ F (20874) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized_application/properties/idempotency_key:lexical` | s86, s110, s130, s151, s806, s4122–s4123, s4405–s4406, s4688–s4689, s4972–s4973, s17282 | S \ F (20871) |
| `schema:Plans/event_record.schema.json#/:additionalProperties` | s15877–s15912 | S \ F (20849) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_created:oneOf` | s20044, s20047 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_started:oneOf` | s20070, s20073–s20074, s20077 | S \ F (20881) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_paused:oneOf` | s20062, s20065 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_resumed:oneOf` | s20066, s20069 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_cancelled:oneOf` | s20032, s20035 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_completed:oneOf` | s20036, s20039 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_failed:oneOf` | s20048, s20051 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_started:oneOf` | s20058, s20061 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_completed:oneOf` | s20056–s20057, s20078–s20079 | S \ F (20881) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_message_added:oneOf` | s20052, s20055 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_artifact_added:oneOf` | s20028, s20031 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_configuration_changed:oneOf` | s20040, s20043 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_proposal_added:oneOf` | s20024–s20025 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_vote_added:oneOf` | s20026–s20027 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_plan_synthesized:oneOf` | s20020, s20023 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_added:oneOf` | s20084–s20085 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_dispositioned:oneOf` | s20086–s20087 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_artifact_finalized:oneOf` | s20080, s20083 | S \ F (20883) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/checkpoint/allOf/0/then/properties/scope_partition:const` | s263, s269–s270, s17465 | S \ F (20881) |
| `schema:Plans/application_workflow_contracts.schema.json#/$defs/CollaborationDefinitionStorageApplicationV2:type` | s20041, s20045 | S \ F (20883) |
| `schema:Plans/application_workflow_contracts.schema.json#/$defs/CollaborationDefinitionStorageApplicationV2/properties/record:anyOf` | s16658–s16659, s20042, s20046 | S \ F (20881) |
| `schema:Plans/application_workflow_contracts.schema.json#/$defs/CollaborationRunStorageApplicationV2:type` | s20021, s20029, s20033, s20037, s20049, s20063, s20067, s20071, s20075, s20081 | S \ F (20875) |
| `schema:Plans/application_workflow_contracts.schema.json#/$defs/CollaborationRunStorageApplicationV2/properties/record:anyOf` | s16894–s16895, s20022, s20030, s20034, s20038, s20050, s20064, s20068, s20072, s20076, s20082 | S \ F (20873) |
| `schema:Plans/application_workflow_contracts.schema.json#/$defs/CollaborationParticipantStorageApplicationV2:type` | s20059 | S \ F (20884) |
| `schema:Plans/application_workflow_contracts.schema.json#/$defs/CollaborationParticipantStorageApplicationV2/properties/record:anyOf` | s16776–s16777, s20060 | S \ F (20882) |
| `schema:Plans/application_workflow_contracts.schema.json#/$defs/CollaborationTranscriptStorageApplicationV2:type` | s20053 | S \ F (20884) |
| `schema:Plans/application_workflow_contracts.schema.json#/$defs/CollaborationTranscriptStorageApplicationV2/properties/record:anyOf` | s17012–s17013, s20054 | S \ F (20882) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_created:required:schema_version` | s17777 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_created/properties/schema_version:const` | s1393–s1395, s7280–s7285, s7459–s7464, s17778 | S \ F (20869) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_created:required:scope_kind` | s17779 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_created/properties/scope_kind:const` | s1396–s1398, s7286–s7291, s7465–s7470, s17780 | S \ F (20869) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_created:required:project_id` | s17771 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_created:required:thread_id` | s17781 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_created:required:collaboration_id` | s17740 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_created:required:collaboration_run_id` | s17741 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_created:required:kind` | s17761 | S \ F (20884) |
| `schema:Plans/collaborative_workflows_contracts.schema.json#/$defs/collaboration_kind:enum` | s667, s706–s708, s752–s754, s957–s959, s1009–s1011, s1054–s1056, s1121–s1123, s1199–s1201, s1266–s1268, s1320–s1322, s1375–s1377, s1423–s1425, s1472–s1474, s1762–s1764, s1832–s1834, s1907–s1909, s1971–s1973, s2034–s2036, s2089–s2091, s2146–s2148, s2189–s2191, s2449–s2451, s2492–s2494, s3214–s3216, s3293–s3295, s3522–s3527, s3607–s3612, s3687–s3692, s3772–s3777, s3852–s3857, s3937–s3942, s4021–s4026, s5101–s5106, s5194–s5199, s5282–s5287, s5381–s5386, s5475–s5480, s5562–s5567, s5857–s5862, s5948–s5953, s6044–s6049, s6135–s6140, s6253–s6258, s6359–s6364, s6460–s6465, s6566–s6571, s6667–s6672, s6772–s6777, s6868–s6873, s6970–s6975, s7071–s7076, s7167–s7172, s7259–s7264, s7346–s7351, s7438–s7443, s7525–s7530, s7617–s7622, s7697–s7702, s7784–s7789, s7866–s7871, s7947–s7952, s8023–s8028, s8104–s8109, s8180–s8185, s9284–s9289, s9393–s9398, s9497–s9502, s9602–s9607, s9702–s9707, s9807–s9812, s9907–s9912, s10012–s10017, s10116–s10121, s10225–s10230, s10325–s10330, s10437–s10442, s10531–s10536, s10620–s10625, s10720–s10725, s10821–s10826, s10921–s10926, s11010–s11015, s11100–s11105, s11191–s11196, s11287–s11292, s11384–s11389, s11490–s11495, s11590–s11595, s11685–s11690, s11785–s11790, s11880–s11885, s11984–s11989, s12087–s12092, s12175–s12180, s12256–s12261, s12337–s12342, s12413–s12418, s12494–s12499, s12570–s12575, s13805–s13810, s13886–s13891, s13962–s13967, s14043–s14048, s14124–s14129, s14200–s14205, s14281–s14286, s14384–s14389, s14482–s14487, s14800–s14805, s14900–s14905, s14999–s15004, s15093–s15098, s15192–s15197, s15298–s15303, s17196, s17762, s19926, s19933 | S \ F (20274) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_created:required:created_at_utc` | s17745 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/utc_timestamp:type` | s677–s678, s723–s724, s804–s805, s883–s884, s934–s935, s986–s987, s1040–s1041, s1107–s1108, s1179–s1180, s1246–s1247, s1306–s1307, s1361–s1362, s1415–s1416, s1464–s1465, s1494–s1495, s1552–s1553, s1633–s1634, s1697–s1698, s1797–s1798, s1866–s1867, s1902–s1903, s1966–s1967, s2057–s2058, s2111–s2112, s2153–s2154, s2196–s2197, s2263–s2264, s2317–s2318, s2329–s2330, s2381–s2382, s2457–s2458, s2502–s2503, s3243–s3244, s3321–s3322, s3351–s3352, s3412–s3413, s3468–s3471, s3553–s3556, s3633–s3636, s3718–s3721, s3798–s3801, s3883–s3886, s3967–s3970, s4112–s4115, s4256–s4259, s4395–s4398, s4539–s4542, s4678–s4681, s4822–s4825, s4962–s4965, s5057–s5060, s5156–s5159, s5244–s5247, s5337–s5340, s5431–s5434, s5532–s5535, s5634–s5637, s5731–s5734, s5827–s5830, s5918–s5921, s6014–s6017, s6105–s6108, s6215–s6218, s6321–s6324, s6422–s6425, s6528–s6531, s6629–s6632, s6734–s6737, s6830–s6833, s6932–s6935, s7033–s7036, s7137–s7140, s7229–s7232, s7316–s7319, s7408–s7411, s7495–s7498, s7587–s7590, s7679–s7682, s7760–s7763, s7842–s7845, s7929–s7932, s8005–s8008, s8086–s8089, s8162–s8165, s8223–s8226, s8318–s8321, s8408–s8411, s8503–s8506, s8593–s8596, s8732–s8735, s8845–s8848, s8953–s8956, s9066–s9069, s9174–s9177, s9342–s9345, s9446–s9449, s9555–s9558, s9655–s9658, s9760–s9763, s9860–s9863, s9965–s9968, s10069–s10072, s10178–s10181, s10278–s10281, s10383–s10386, s10425–s10428, s10519–s10522, s10608–s10611, s10708–s10711, s10809–s10812, s10909–s10912, s10998–s11001, s11088–s11091, s11179–s11182, s11275–s11278, s11372–s11375, s11532–s11535, s11627–s11630, s11727–s11730, s11822–s11825, s11922–s11925, s12025–s12028, s12133–s12136, s12187–s12190, s12268–s12271, s12349–s12352, s12425–s12428, s12506–s12509, s12582–s12585, s12710–s12713, s12806–s12809, s12907–s12910, s13003–s13006, s13104–s13107, s13200–s13203, s13307–s13310, s13323–s13326, s13415–s13418, s13502–s13505, s13594–s13597, s13681–s13684, s13822–s13825, s13902–s13905, s13979–s13982, s14060–s14063, s14140–s14143, s14217–s14220, s14332–s14335, s14430–s14433, s14533–s14536, s14637–s14640, s14746–s14749, s14846–s14849, s14951–s14954, s15045–s15048, s15144–s15147, s15238–s15241, s15349–s15352, s15381–s15384, s15483–s15486, s15580–s15583, s15682–s15685, s15779–s15782, s17746 | S \ F (20304) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_created:required:admission_source` | s17737 | S \ F (20884) |
| `schema:Plans/collaborative_workflows_contracts.schema.json#/$defs/admission_source:enum` | s1293–s1295, s1348–s1350, s3196–s3198, s3275–s3277, s7117–s7122, s7209–s7214, s7296–s7301, s7388–s7393, s7475–s7480, s7567–s7572, s14249–s14254, s14348–s14353, s14446–s14451, s14549–s14554, s14653–s14658, s14762–s14767, s14862–s14867, s14967–s14972, s15061–s15066, s15160–s15165, s15266–s15271, s17193, s17738, s19886, s19891 | S \ F (20767) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_created:required:participant_slot_ids` | s17765 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_created/properties/participant_slot_ids:type` | s1381–s1383, s7266–s7270, s7445–s7449, s17766 | S \ F (20871) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_created/properties/participant_slot_ids:minItems` | s7265, s7444, s17764 | S \ F (20882) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_created/properties/participant_slot_ids:uniqueItems` | s17763 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_created/properties/participant_slot_ids:maxItems` | s17767 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_created:required:coordinator_kind` | s17742 | S \ F (20884) |
| `schema:Plans/collaborative_workflows_contracts.schema.json#/$defs/coordinator_kind:enum` | s1302–s1304, s1357–s1359, s7131–s7136, s7223–s7228, s7310–s7315, s7402–s7407, s7489–s7494, s7581–s7586, s17743 | S \ F (20842) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_created:required:definition_record_ref` | s17754 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/non_secret_ref:type` | s686–s687, s689–s690, s732–s733, s735–s736, s774–s775, s777–s778, s844–s845, s853–s854, s856–s857, s922–s923, s931–s932, s943–s944, s983–s984, s995–s996, s1061–s1062, s1095–s1096, s1098–s1099, s1128–s1129, s1188–s1189, s1255–s1256, s1312–s1313, s1367–s1368, s1446–s1447, s1449–s1450, s1515–s1516, s1573–s1574, s1609–s1610, s1645–s1646, s1673–s1674, s1709–s1710, s1736–s1737, s1742–s1743, s1806–s1807, s1812–s1813, s1899–s1900, s1933–s1934, s1939–s1940, s1963–s1964, s1996–s1997, s2002–s2003, s2029–s2030, s2042–s2043, s2084–s2085, s2099–s2100, s2135–s2136, s2178–s2179, s2241–s2242, s2296–s2297, s2363–s2364, s2417–s2418, s2438–s2439, s2481–s2482, s3228–s3229, s3231–s3232, s3309–s3310, s3312–s3313, s3336–s3337, s3345–s3346, s3406–s3407, s3466–s3467, s3484–s3487, s3490–s3493, s3569–s3572, s3575–s3578, s3649–s3652, s3655–s3658, s3734–s3737, s3740–s3743, s3814–s3817, s3820–s3823, s3899–s3902, s3905–s3908, s3983–s3986, s3989–s3992, s4056–s4059, s4062–s4065, s4184–s4187, s4200–s4203, s4206–s4209, s4323–s4326, s4339–s4342, s4345–s4348, s4467–s4470, s4483–s4486, s4489–s4492, s4606–s4609, s4622–s4625, s4628–s4631, s4750–s4753, s4766–s4769, s4772–s4775, s4890–s4893, s4906–s4909, s4912–s4915, s5035–s5038, s5051–s5054, s5071–s5074, s5150–s5153, s5238–s5241, s5331–s5334, s5351–s5354, s5425–s5428, s5445–s5448, s5628–s5631, s5725–s5728, s6229–s6232, s6335–s6338, s6436–s6439, s6542–s6545, s6643–s6646, s6748–s6751, s6844–s6847, s6946–s6949, s7047–s7050, s7149–s7152, s7241–s7244, s7328–s7331, s7420–s7423, s7507–s7510, s7599–s7602, s7772–s7775, s7854–s7857, s8257–s8260, s8352–s8355, s8442–s8445, s8537–s8540, s8627–s8630, s8688–s8691, s8752–s8755, s8801–s8804, s8865–s8868, s8909–s8912, s8973–s8976, s9022–s9025, s9086–s9089, s9130–s9133, s9194–s9197, s9248–s9251, s9357–s9360, s9461–s9464, s9566–s9569, s9666–s9669, s9771–s9774, s9871–s9874, s9976–s9979, s10080–s10083, s10189–s10192, s10289–s10292, s10419–s10422, s10513–s10516, s10602–s10605, s10696–s10699, s10702–s10705, s10797–s10800, s10803–s10806, s10903–s10906, s10992–s10995, s11082–s11085, s11173–s11176, s11269–s11272, s11328–s11331, s11366–s11369, s11430–s11433, s11478–s11481, s11505–s11508, s11578–s11581, s11604–s11607, s11673–s11676, s11700–s11703, s11773–s11776, s11799–s11802, s11868–s11871, s11895–s11898, s11972–s11975, s11998–s12001, s12075–s12078, s12102–s12105, s12151–s12154, s12232–s12235, s12313–s12316, s12389–s12392, s12470–s12473, s12546–s12549, s12667–s12670, s12768–s12771, s12864–s12867, s12965–s12968, s13061–s13064, s13162–s13165, s13264–s13267, s13383–s13386, s13474–s13477, s13562–s13565, s13653–s13656, s13741–s13744, s13781–s13784, s13862–s13865, s13938–s13941, s14019–s14022, s14100–s14103, s14176–s14179, s14304–s14307, s14310–s14313, s14406–s14409, s14412–s14415, s14505–s14508, s14511–s14514, s14613–s14616, s14619–s14622, s14718–s14721, s14724–s14727, s14822–s14825, s14828–s14831, s14923–s14926, s14929–s14932, s15021–s15024, s15027–s15030, s15116–s15119, s15122–s15125, s15214–s15217, s15220–s15223, s15256–s15259, s15321–s15324, s15327–s15330, s15367–s15370, s15473–s15476, s15570–s15573, s15672–s15675, s15769–s15772, s15871–s15874, s17755 | S \ F (20084) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_created:required:currentness_hash` | s17749 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/sha256_hex:type` | s698–s699, s744–s745, s792–s793, s838–s839, s871–s872, s916–s917, s946–s947, s998–s999, s1046–s1047, s1113–s1114, s1191–s1192, s1258–s1259, s1309–s1310, s1364–s1365, s1409–s1410, s1458–s1459, s1503–s1504, s1543–s1544, s1561–s1562, s1600–s1601, s1624–s1625, s1664–s1665, s1688–s1689, s1727–s1728, s1754–s1755, s1824–s1825, s1893–s1894, s1957–s1958, s1999–s2000, s2005–s2006, s2023–s2024, s2078–s2079, s2138–s2139, s2181–s2182, s2223–s2224, s2278–s2279, s2344–s2345, s2396–s2397, s2441–s2442, s2484–s2485, s3206–s3207, s3285–s3286, s3330–s3331, s3339–s3340, s3363–s3364, s3424–s3425, s3504–s3507, s3589–s3592, s3669–s3672, s3754–s3757, s3834–s3837, s3919–s3922, s4003–s4006, s4088–s4091, s4232–s4235, s4371–s4374, s4515–s4518, s4654–s4657, s4798–s4801, s4938–s4941, s5077–s5080, s5170–s5173, s5258–s5261, s5357–s5360, s5451–s5454, s5544–s5547, s5646–s5649, s5743–s5746, s5839–s5842, s5930–s5933, s6026–s6029, s6117–s6120, s6235–s6238, s6341–s6344, s6442–s6445, s6548–s6551, s6649–s6652, s6754–s6757, s6850–s6853, s6952–s6955, s7053–s7056, s7143–s7146, s7235–s7238, s7322–s7325, s7414–s7417, s7501–s7504, s7593–s7596, s7667–s7670, s7748–s7751, s7830–s7833, s7917–s7920, s7993–s7996, s8074–s8077, s8150–s8153, s8237–s8240, s8332–s8335, s8422–s8425, s8517–s8520, s8607–s8610, s8714–s8717, s8827–s8830, s8935–s8938, s9048–s9051, s9156–s9159, s9266–s9269, s9375–s9378, s9479–s9482, s9584–s9587, s9684–s9687, s9789–s9792, s9889–s9892, s9994–s9997, s10098–s10101, s10207–s10210, s10307–s10310, s10407–s10410, s10501–s10504, s10590–s10593, s10684–s10687, s10785–s10788, s10891–s10894, s10980–s10983, s11070–s11073, s11161–s11164, s11257–s11260, s11334–s11337, s11354–s11357, s11436–s11439, s11466–s11469, s11566–s11569, s11661–s11664, s11761–s11764, s11856–s11859, s11960–s11963, s12063–s12066, s12157–s12160, s12238–s12241, s12319–s12322, s12395–s12398, s12476–s12479, s12552–s12555, s12631–s12634, s12732–s12735, s12828–s12831, s12929–s12932, s13025–s13028, s13126–s13129, s13228–s13231, s13346–s13349, s13438–s13441, s13525–s13528, s13617–s13620, s13704–s13707, s13787–s13790, s13868–s13871, s13944–s13947, s14025–s14028, s14106–s14109, s14182–s14185, s14263–s14266, s14362–s14365, s14460–s14463, s14567–s14570, s14671–s14674, s14782–s14785, s14882–s14885, s14981–s14984, s15075–s15078, s15174–s15177, s15280–s15283, s15401–s15404, s15503–s15506, s15600–s15603, s15702–s15705, s15799–s15802, s17750 | S \ F (20276) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_created:required:idempotency_key` | s17759 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_created/properties/idempotency_key:type` | s1373–s1374, s7253–s7256, s7432–s7435, s17760 | S \ F (20874) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_created:required:required_slot_ids` | s17774 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_created/properties/required_slot_ids:type` | s1390–s1392, s7275–s7279, s7454–s7458, s17775 | S \ F (20871) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_created/properties/required_slot_ids:uniqueItems` | s17773 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_created/properties/required_slot_ids:maxItems` | s17776 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_created_application:required:schema_version` | s17731 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_created_application/properties/schema_version:const` | s1336–s1338, s7189–s7194, s7368–s7373, s7547–s7552, s7639–s7644, s17732 | S \ F (20857) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_created_application:required:scope_kind` | s17733 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_created_application/properties/scope_kind:const` | s1339–s1341, s7195–s7200, s7374–s7379, s7553–s7558, s7645–s7650, s17734 | S \ F (20857) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_created_application:required:project_id` | s17725 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_created_application:required:server_id` | s17735 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_created_application:required:thread_id` | s17736 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_created_application:required:collaboration_id` | s17708 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_created_application:required:collaboration_run_id` | s17709 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_created_application:required:kind` | s17719 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_created_application:required:definition_revision` | s17714 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_created_application/properties/definition_revision:const` | s1314–s1316, s7155–s7160, s7334–s7339, s7513–s7518, s7605–s7610, s17715 | S \ F (20857) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_created_application:required:created_at_utc` | s17711 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_created_application:required:admission_source` | s17706 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_created_application:required:participant_slot_ids` | s17722 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_created_application/properties/participant_slot_ids:type` | s1326–s1328, s7174–s7178, s7353–s7357, s7532–s7536, s7624–s7628, s17723 | S \ F (20861) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_created_application/properties/participant_slot_ids:minItems` | s7173, s7352, s7531, s7623, s17721 | S \ F (20880) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_created_application/properties/participant_slot_ids:uniqueItems` | s17720 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_created_application/properties/participant_slot_ids:maxItems` | s17724 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_created_application:required:coordinator_kind` | s17710 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_created_application:required:definition_record_ref` | s17713 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_created_application:required:currentness_hash` | s17712 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_created_application:required:idempotency_key` | s17717 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_created_application/properties/idempotency_key:type` | s1318–s1319, s7161–s7164, s7340–s7343, s7519–s7522, s7611–s7614, s17718 | S \ F (20866) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_created_application:required:required_slot_ids` | s17728 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_created_application/properties/required_slot_ids:type` | s1333–s1335, s7184–s7188, s7363–s7367, s7542–s7546, s7634–s7638, s17729 | S \ F (20861) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_created_application/properties/required_slot_ids:uniqueItems` | s17727 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_created_application/properties/required_slot_ids:maxItems` | s17730 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_created_application:additionalProperties` | s17707 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_started:required:schema_version` | s19917 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_started/properties/schema_version:const` | s3314–s3316, s14418–s14423, s14625–s14630, s14834–s14839, s15033–s15038, s15226–s15231, s19918 | S \ F (20851) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_started:required:scope_kind` | s19919 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_started/properties/scope_kind:const` | s3317–s3319, s14424–s14429, s14631–s14636, s14840–s14845, s15039–s15044, s15232–s15237, s19920 | S \ F (20851) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_started:required:project_id` | s19914 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_started:required:thread_id` | s19924 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_started:required:collaboration_id` | s19897 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_started:required:collaboration_run_id` | s19898 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_started:required:kind` | s19906, s19925 | S \ F (20883) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_started:required:definition_revision` | s19900 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_started/properties/definition_revision:type` | s3287–s3289, s14368–s14373, s14573–s14578, s14788–s14793, s14987–s14992, s15180–s15185, s19902 | S \ F (20851) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_started/properties/definition_revision:minimum` | s19901 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_started:required:started_at_utc` | s19921 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_started:required:admission_source` | s19885, s19895 | S \ F (20883) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_started:required:participant_slot_ids` | s19911 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_started/properties/participant_slot_ids:type` | s3302–s3304, s14397–s14401, s14598–s14602, s14813–s14817, s15012–s15016, s15205–s15209, s19912 | S \ F (20856) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_started/properties/participant_slot_ids:minItems` | s14396, s14597, s14812, s15011, s15204, s19910 | S \ F (20879) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_started/properties/participant_slot_ids:uniqueItems` | s19909 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_started/properties/participant_slot_ids:maxItems` | s19913 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_started:required:state_after` | s19922 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_started:required:requested_effective_snapshot_ref` | s19915 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_started:required:run_record_ref` | s19916 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_started:required:currentness_hash` | s19899 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_started:required:idempotency_key` | s19904 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_started/properties/idempotency_key:type` | s3291–s3292, s14378–s14381, s14579–s14582, s14794–s14797, s14993–s14996, s15186–s15189, s19905 | S \ F (20862) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_started_application:required:schema_version` | s19866 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_started_application/properties/schema_version:const` | s3233–s3235, s14316–s14321, s14517–s14522, s14730–s14735, s14935–s14940, s15128–s15133, s15333–s15338, s19867 | S \ F (20845) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_started_application:required:scope_kind` | s19868 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_started_application/properties/scope_kind:const` | s3236–s3238, s14322–s14327, s14523–s14528, s14736–s14741, s14941–s14946, s15134–s15139, s15339–s15344, s19869 | S \ F (20845) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_started_application:required:project_id` | s19862 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_started_application:required:server_id` | s19870 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_started_application:required:thread_id` | s19874 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_started_application:required:collaboration_id` | s19845 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_started_application:required:collaboration_run_id` | s19846 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_started_application:required:kind` | s19854, s19932 | S \ F (20883) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_started_application:required:definition_revision` | s19848 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_started_application/properties/definition_revision:type` | s3208–s3210, s14269–s14274, s14466–s14471, s14677–s14682, s14888–s14893, s15081–s15086, s15286–s15291, s19850 | S \ F (20845) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_started_application/properties/definition_revision:minimum` | s19849 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_started_application:required:lifecycle_seq` | s19855 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_started_application/properties/lifecycle_seq:const` | s3217–s3219, s14287–s14292, s14488–s14493, s14695–s14700, s14906–s14911, s15099–s15104, s15304–s15309, s19856 | S \ F (20845) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_started_application:required:started_at_utc` | s19871 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_started_application:required:admission_source` | s19843, s19890 | S \ F (20883) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_started_application:required:participant_slot_ids` | s19859 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_started_application/properties/participant_slot_ids:type` | s3223–s3225, s14294–s14298, s14495–s14499, s14702–s14706, s14913–s14917, s15106–s15110, s15311–s15315, s19860 | S \ F (20851) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_started_application/properties/participant_slot_ids:minItems` | s14293, s14494, s14701, s14912, s15105, s15310, s19858 | S \ F (20878) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_started_application/properties/participant_slot_ids:uniqueItems` | s19857 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_started_application/properties/participant_slot_ids:maxItems` | s19861 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_started_application:required:state_after` | s19872 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_started_application/properties/state_after:enum` | s3245–s3247, s14338–s14343, s14539–s14544, s14752–s14757, s14957–s14962, s15150–s15155, s15355–s15360, s19873 | S \ F (20845) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_started_application:required:requested_effective_snapshot_ref` | s19864 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_started_application:required:run_record_ref` | s19865 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_started_application:required:currentness_hash` | s19847 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_started_application:required:idempotency_key` | s19852 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_started_application/properties/idempotency_key:type` | s3212–s3213, s14275–s14278, s14476–s14479, s14683–s14686, s14894–s14897, s15087–s15090, s15292–s15295, s19853 | S \ F (20858) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_started_application:additionalProperties` | s19844 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_paused:required:schema_version` | s18285 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_paused/properties/schema_version:const` | s2201–s2203, s12359–s12364, s12516–s12521, s18286 | S \ F (20869) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_paused:required:scope_kind` | s18287 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_paused/properties/scope_kind:const` | s2204–s2206, s12365–s12370, s12522–s12527, s18288 | S \ F (20869) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_paused:required:project_id` | s18284 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_paused:required:thread_id` | s18291 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_paused:required:collaboration_id` | s18269 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_paused:required:collaboration_run_id` | s18270 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_paused:required:kind` | s18279 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_paused:required:definition_revision` | s18273 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_paused/properties/definition_revision:type` | s2183–s2185, s12325–s12330, s12482–s12487, s18275 | S \ F (20869) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_paused/properties/definition_revision:minimum` | s18274 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_paused/properties/lifecycle_seq:type` | s2192–s2194, s12343–s12348, s12500–s12505, s18282 | S \ F (20869) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_paused:required:paused_at_utc` | s18283 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_paused:required:state_before` | s18289 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_paused:required:command_instance_ref` | s18271 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_paused:required:currentness_hash` | s18272 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_paused:required:idempotency_key` | s18277 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_paused/properties/idempotency_key:type` | s2187–s2188, s12331–s12334, s12488–s12491, s18278 | S \ F (20874) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_paused_application:required:schema_version` | s18260 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_paused_application/properties/schema_version:const` | s2156–s2158, s12198–s12203, s12279–s12284, s12436–s12441, s12593–s12598, s18261 | S \ F (20857) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_paused_application:required:scope_kind` | s18262 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_paused_application/properties/scope_kind:const` | s2159–s2161, s12204–s12209, s12285–s12290, s12442–s12447, s12599–s12604, s18263 | S \ F (20857) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_paused_application:required:project_id` | s18258 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_paused_application:required:server_id` | s18264 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_paused_application:required:thread_id` | s18267 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_paused_application:required:collaboration_id` | s18243 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_paused_application:required:collaboration_run_id` | s18244 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_paused_application:required:kind` | s18253 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_paused_application:required:definition_revision` | s18247 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_paused_application/properties/definition_revision:type` | s2140–s2142, s12163–s12168, s12244–s12249, s12401–s12406, s12558–s12563, s18249 | S \ F (20857) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_paused_application/properties/definition_revision:minimum` | s18248 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_paused_application:required:lifecycle_seq` | s18254 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_paused_application/properties/lifecycle_seq:type` | s2149–s2151, s12181–s12186, s12262–s12267, s12419–s12424, s12576–s12581, s18256 | S \ F (20857) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_paused_application/properties/lifecycle_seq:minimum` | s18255 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_paused_application:required:paused_at_utc` | s18257 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_paused_application:required:state_before` | s18265 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_paused_application/properties/state_before:enum` | s2165–s2167, s12214–s12219, s12295–s12300, s12452–s12457, s12609–s12614, s18266 | S \ F (20857) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_paused_application:required:command_instance_ref` | s18245 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_paused_application:required:currentness_hash` | s18246 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_paused_application:required:idempotency_key` | s18251 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_paused_application/properties/idempotency_key:type` | s2144–s2145, s12169–s12172, s12250–s12253, s12407–s12410, s12564–s12567, s18252 | S \ F (20866) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_paused_application:additionalProperties` | s18242 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_resumed:required:schema_version` | s18491 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_resumed/properties/schema_version:const` | s2504–s2506, s13908–s13913, s14146–s14151, s18492 | S \ F (20869) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_resumed:required:scope_kind` | s18493 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_resumed/properties/scope_kind:const` | s2507–s2509, s13914–s13919, s14152–s14157, s18494 | S \ F (20869) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_resumed:required:project_id` | s18489 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_resumed:required:thread_id` | s18497 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_resumed:required:collaboration_id` | s18475 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_resumed:required:collaboration_run_id` | s18476 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_resumed:required:kind` | s18485 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_resumed:required:definition_revision` | s18479 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_resumed/properties/definition_revision:type` | s2486–s2488, s13874–s13879, s14112–s14117, s18481 | S \ F (20869) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_resumed/properties/definition_revision:minimum` | s18480 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_resumed/properties/lifecycle_seq:type` | s2495–s2497, s13892–s13897, s14130–s14135, s18488 | S \ F (20869) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_resumed/properties/lifecycle_seq:minimum` | s18487 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_resumed:required:resumed_at_utc` | s18490 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_resumed:required:state_after` | s18495 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_resumed:required:command_instance_ref` | s18477 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_resumed:required:currentness_hash` | s18478 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_resumed:required:idempotency_key` | s18483 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_resumed/properties/idempotency_key:type` | s2490–s2491, s13880–s13883, s14118–s14121, s18484 | S \ F (20874) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_resumed_application:required:schema_version` | s18466 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_resumed_application/properties/schema_version:const` | s2459–s2461, s13828–s13833, s13985–s13990, s14066–s14071, s14223–s14228, s18467 | S \ F (20857) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_resumed_application:required:scope_kind` | s18468 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_resumed_application/properties/scope_kind:const` | s2462–s2464, s13834–s13839, s13991–s13996, s14072–s14077, s14229–s14234, s18469 | S \ F (20857) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_resumed_application:required:project_id` | s18463 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_resumed_application:required:server_id` | s18470 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_resumed_application:required:thread_id` | s18473 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_resumed_application:required:collaboration_id` | s18449 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_resumed_application:required:collaboration_run_id` | s18450 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_resumed_application:required:kind` | s18459 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_resumed_application:required:definition_revision` | s18453 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_resumed_application/properties/definition_revision:type` | s2443–s2445, s13793–s13798, s13950–s13955, s14031–s14036, s14188–s14193, s18455 | S \ F (20857) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_resumed_application/properties/definition_revision:minimum` | s18454 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_resumed_application:required:lifecycle_seq` | s18460 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_resumed_application/properties/lifecycle_seq:type` | s2452–s2454, s13811–s13816, s13968–s13973, s14049–s14054, s14206–s14211, s18462 | S \ F (20857) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_resumed_application/properties/lifecycle_seq:minimum` | s18461 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_resumed_application:required:resumed_at_utc` | s18465 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_resumed_application:required:state_after` | s18471 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_resumed_application/properties/state_after:enum` | s2468–s2470, s13844–s13849, s14001–s14006, s14082–s14087, s14239–s14244, s18472 | S \ F (20857) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_resumed_application:required:command_instance_ref` | s18451 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_resumed_application:required:currentness_hash` | s18452 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_resumed_application:required:idempotency_key` | s18457 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_resumed_application/properties/idempotency_key:type` | s2447–s2448, s13799–s13802, s13956–s13959, s14037–s14040, s14194–s14197, s18458 | S \ F (20866) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_resumed_application:additionalProperties` | s18448 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_cancelled:required:schema_version` | s17453 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_cancelled/properties/schema_version:const` | s1018–s1020, s5210–s5215, s5397–s5402, s17454 | S \ F (20869) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_cancelled:required:scope_kind` | s17455 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_cancelled/properties/scope_kind:const` | s1021–s1023, s5216–s5221, s5403–s5408, s17456 | S \ F (20869) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_cancelled:required:project_id` | s17452 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_cancelled:required:thread_id` | s17461 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_cancelled:required:collaboration_id` | s17435 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_cancelled:required:collaboration_run_id` | s17436 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_cancelled:required:kind` | s17448 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_cancelled:required:definition_revision` | s17439 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_cancelled/properties/definition_revision:type` | s1000–s1002, s5176–s5181, s5363–s5368, s17441 | S \ F (20869) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_cancelled/properties/definition_revision:minimum` | s17440 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_cancelled/properties/lifecycle_seq:type` | s1012–s1014, s5200–s5205, s5387–s5392, s17451 | S \ F (20869) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_cancelled/properties/lifecycle_seq:minimum` | s17450 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_cancelled:required:cancelled_at_utc` | s17433 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_cancelled:required:stop_reason` | s17429, s17459 | S \ F (20883) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_cancelled:required:state_before` | s17457 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_cancelled/properties/state_before:enum` | s1024–s1026, s5222–s5227, s5409–s5414, s17458 | S \ F (20869) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_cancelled:required:fenced_attempt_count` | s17442 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_cancelled/properties/fenced_attempt_count:type` | s1003–s1005, s5182–s5187, s5369–s5374, s17444 | S \ F (20869) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_cancelled/properties/fenced_attempt_count:minimum` | s17443 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_cancelled:required:cancellation_receipt_ref` | s17432 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_cancelled:required:currentness_hash` | s17438 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_cancelled:required:idempotency_key` | s17446 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_cancelled/properties/idempotency_key:type` | s1007–s1008, s5188–s5191, s5375–s5378, s17447 | S \ F (20874) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_cancelled_application:required:schema_version` | s17419 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_cancelled_application/properties/schema_version:const` | s964–s966, s5118–s5123, s5299–s5304, s5492–s5497, s17420 | S \ F (20863) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_cancelled_application:required:scope_kind` | s17421 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_cancelled_application/properties/scope_kind:const` | s967–s969, s5124–s5129, s5305–s5310, s5498–s5503, s17422 | S \ F (20863) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_cancelled_application:required:project_id` | s17417 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_cancelled_application:required:server_id` | s17423 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_cancelled_application:required:thread_id` | s17428 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_cancelled_application:required:collaboration_id` | s17400 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_cancelled_application:required:collaboration_run_id` | s17401 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_cancelled_application:required:kind` | s17413 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_cancelled_application:required:definition_revision` | s17404 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_cancelled_application/properties/definition_revision:type` | s948–s950, s5083–s5088, s5264–s5269, s5457–s5462, s17406 | S \ F (20863) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_cancelled_application/properties/definition_revision:minimum` | s17405 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_cancelled_application:required:lifecycle_seq` | s17414 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_cancelled_application/properties/lifecycle_seq:type` | s960–s962, s5107–s5112, s5288–s5293, s5481–s5486, s17416 | S \ F (20863) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_cancelled_application/properties/lifecycle_seq:minimum` | s17415 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_cancelled_application:required:cancelled_at_utc` | s17398 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_cancelled_application:required:stop_reason` | s17426, s17431 | S \ F (20883) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_cancelled_application:required:state_before` | s17424 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_cancelled_application/properties/state_before:enum` | s973–s975, s5134–s5139, s5315–s5320, s5508–s5513, s17425 | S \ F (20863) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_cancelled_application/allOf/0/then:required:command_instance_ref` | s17402 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_cancelled_application:required:fenced_attempt_count` | s17407 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_cancelled_application/properties/fenced_attempt_count:type` | s951–s953, s5089–s5094, s5270–s5275, s5463–s5468, s17409 | S \ F (20863) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_cancelled_application/properties/fenced_attempt_count:minimum` | s17408 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_cancelled_application:required:cancellation_receipt_ref` | s17397 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_cancelled_application:required:currentness_hash` | s17403 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_cancelled_application:required:idempotency_key` | s17411 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_cancelled_application/properties/idempotency_key:type` | s955–s956, s5095–s5098, s5276–s5279, s5469–s5472, s17412 | S \ F (20870) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_cancelled_application:additionalProperties` | s17399 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_completed:required:schema_version` | s17599 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_completed/properties/schema_version:const` | s1142–s1144, s5690–s5695, s5883–s5888, s6070–s6075, s17600 | S \ F (20863) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_completed:required:scope_kind` | s17601 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_completed/properties/scope_kind:const` | s1145–s1147, s5696–s5701, s5889–s5894, s6076–s6081, s17602 | S \ F (20863) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_completed:required:project_id` | s17596 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_completed:required:thread_id` | s17605 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_completed:required:collaboration_id` | s17578 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_completed:required:collaboration_run_id` | s17579 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_completed:required:kind` | s17590 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_completed:required:definition_revision` | s17584 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_completed/properties/definition_revision:type` | s1115–s1117, s5652–s5657, s5845–s5850, s6032–s6037, s17586 | S \ F (20863) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_completed/properties/definition_revision:minimum` | s17585 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_completed/properties/lifecycle_seq:type` | s1124–s1126, s5670–s5675, s5863–s5868, s6050–s6055, s17593 | S \ F (20863) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_completed/properties/lifecycle_seq:minimum` | s17592 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_completed:required:completed_at_utc` | s17580 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_completed:required:completion_trigger` | s17568, s17581 | S \ F (20883) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_completed/properties/completion_trigger:enum` | s1109–s1111, s5640–s5645, s5833–s5838, s6020–s6025, s17569, s17582 | S \ F (20862) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_completed:required:state_before` | s17603 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_completed/allOf/1/then/allOf/1/properties/state_before:enum;Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_completed/properties/state_before:enum` | s490, s1148–s1150, s5702–s5707, s5895–s5900, s6082–s6087, s17571, s17604 | S \ F (20861) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_completed:required:required_slot_ids` | s17597 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_completed/properties/required_slot_ids:type` | s1139–s1141, s5685–s5689, s5878–s5882, s6065–s6069, s17598 | S \ F (20866) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_completed:required:waived_slot_ids` | s17606 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_completed/properties/waived_slot_ids:type` | s1157–s1159, s5712–s5716, s5905–s5909, s6092–s6096, s17607 | S \ F (20866) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_completed:required:output_refs` | s17594 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_completed/properties/output_refs:type` | s1130–s1132, s5676–s5680, s5869–s5873, s6056–s6060, s17595 | S \ F (20866) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_completed:required:currentness_hash` | s17583 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_completed:required:idempotency_key` | s17588 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_completed/properties/idempotency_key:type` | s1119–s1120, s5658–s5661, s5851–s5854, s6038–s6041, s17589 | S \ F (20870) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_completed_application:required:schema_version` | s17557 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_completed_application/properties/schema_version:const` | s1073–s1075, s5589–s5594, s5788–s5793, s5975–s5980, s6162–s6167, s17558 | S \ F (20857) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_completed_application:required:scope_kind` | s17559 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_completed_application/properties/scope_kind:const` | s1076–s1078, s5595–s5600, s5794–s5799, s5981–s5986, s6168–s6173, s17560 | S \ F (20857) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_completed_application:required:project_id` | s17553 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_completed_application:required:server_id` | s17561 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_completed_application:required:thread_id` | s17564 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_completed_application:required:collaboration_id` | s17535 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_completed_application:required:collaboration_run_id` | s17536 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_completed_application:required:kind` | s17547 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_completed_application:required:definition_revision` | s17541 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_completed_application/properties/definition_revision:type` | s1048–s1050, s5550–s5555, s5749–s5754, s5936–s5941, s6123–s6128, s17543 | S \ F (20857) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_completed_application/properties/definition_revision:minimum` | s17542 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_completed_application:required:lifecycle_seq` | s17548 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_completed_application/properties/lifecycle_seq:type` | s1057–s1059, s5568–s5573, s5767–s5772, s5954–s5959, s6141–s6146, s17550 | S \ F (20857) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_completed_application/properties/lifecycle_seq:minimum` | s17549 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_completed_application:required:completed_at_utc` | s17537 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_completed_application:required:completion_trigger` | s17538, s17573 | S \ F (20883) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_completed_application/properties/completion_trigger:enum` | s1042–s1044, s5538–s5543, s5737–s5742, s5924–s5929, s6111–s6116, s17539, s17574 | S \ F (20856) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_completed_application:required:state_before` | s17562 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_completed_application/allOf/1/then/allOf/1/properties/state_before:enum;Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_completed_application/properties/state_before:enum` | s1082–s1084, s5605–s5610, s5804–s5809, s5991–s5996, s6178–s6183, s17563, s17576 | S \ F (20856) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_completed_application:required:required_slot_ids` | s17555 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_completed_application/properties/required_slot_ids:type` | s1070–s1072, s5584–s5588, s5783–s5787, s5970–s5974, s6157–s6161, s17556 | S \ F (20861) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_completed_application:required:waived_slot_ids` | s17565 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_completed_application/properties/waived_slot_ids:type` | s1091–s1093, s5615–s5619, s5814–s5818, s6001–s6005, s6188–s6192, s17566 | S \ F (20861) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_completed_application:required:output_refs` | s17551 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_completed_application/properties/output_refs:type` | s1063–s1065, s5574–s5578, s5773–s5777, s5960–s5964, s6147–s6151, s17552 | S \ F (20861) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_completed_application:required:currentness_hash` | s17540 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_completed_application:required:idempotency_key` | s17545 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_completed_application/properties/idempotency_key:type` | s1052–s1053, s5556–s5559, s5755–s5758, s5942–s5945, s6129–s6132, s17546 | S \ F (20866) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_completed_application:additionalProperties` | s17534 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_failed:required:schema_version` | s17842 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_failed/properties/schema_version:const` | s1481–s1483, s7800–s7805, s7963–s7968, s8120–s8125, s17843 | S \ F (20863) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_failed:required:scope_kind` | s17844 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_failed/properties/scope_kind:const` | s1484–s1486, s7806–s7811, s7969–s7974, s8126–s8131, s17845 | S \ F (20863) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_failed:required:project_id` | s17841 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_failed:required:thread_id` | s17848 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_failed:required:collaboration_id` | s17825 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_failed:required:collaboration_run_id` | s17826 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_failed:required:kind` | s17837 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_failed:required:definition_revision` | s17828 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_failed/properties/definition_revision:type` | s1460–s1462, s7754–s7759, s7923–s7928, s8080–s8085, s17830 | S \ F (20863) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_failed/properties/definition_revision:minimum` | s17829 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_failed/properties/lifecycle_seq:type` | s1475–s1477, s7790–s7795, s7953–s7958, s8110–s8115, s17840 | S \ F (20863) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_failed/properties/lifecycle_seq:minimum` | s17839 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_failed:required:failed_at_utc` | s17831 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_failed:required:failure_reason` | s17832 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_failed:required:state_before` | s17846 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_failed/properties/state_before:enum` | s1487–s1489, s7812–s7817, s7975–s7980, s8132–s8137, s17847 | S \ F (20863) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_failed:required:currentness_hash` | s17827 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_failed:required:idempotency_key` | s17835 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_failed/properties/idempotency_key:type` | s1470–s1471, s7778–s7781, s7941–s7944, s8098–s8101, s17836 | S \ F (20870) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_failed_application:required:schema_version` | s17816 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_failed_application/properties/schema_version:const` | s1430–s1432, s7714–s7719, s7883–s7888, s8040–s8045, s8197–s8202, s17817 | S \ F (20857) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_failed_application:required:scope_kind` | s17818 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_failed_application/properties/scope_kind:const` | s1433–s1435, s7720–s7725, s7889–s7894, s8046–s8051, s8203–s8208, s17819 | S \ F (20857) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_failed_application:required:project_id` | s17814 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_failed_application:required:server_id` | s17820 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_failed_application:required:thread_id` | s17823 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_failed_application:required:collaboration_id` | s17798 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_failed_application:required:collaboration_run_id` | s17799 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_failed_application:required:kind` | s17810 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_failed_application:required:definition_revision` | s17801 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_failed_application/properties/definition_revision:type` | s1411–s1413, s7673–s7678, s7836–s7841, s7999–s8004, s8156–s8161, s17803 | S \ F (20857) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_failed_application/properties/definition_revision:minimum` | s17802 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_failed_application:required:lifecycle_seq` | s17811 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_failed_application/properties/lifecycle_seq:type` | s1426–s1428, s7703–s7708, s7872–s7877, s8029–s8034, s8186–s8191, s17813 | S \ F (20857) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_failed_application/properties/lifecycle_seq:minimum` | s17812 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_failed_application:required:failed_at_utc` | s17804 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_failed_application:required:failure_reason` | s17805 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_failed_application/properties/failure_reason:enum` | s1417–s1419, s7685–s7690, s7848–s7853, s8011–s8016, s8168–s8173, s17806 | S \ F (20857) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_failed_application:required:state_before` | s17821 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_failed_application/properties/state_before:enum` | s1439–s1441, s7730–s7735, s7899–s7904, s8056–s8061, s8213–s8218, s17822 | S \ F (20857) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_failed_application:required:currentness_hash` | s17800 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_failed_application:required:idempotency_key` | s17808 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_failed_application/properties/idempotency_key:type` | s1421–s1422, s7691–s7694, s7860–s7863, s8017–s8020, s8174–s8177, s17809 | S \ F (20866) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_failed_application:additionalProperties` | s17797 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_started:required:schema_version` | s18236 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_started/properties/schema_version:const` | s2104–s2106, s11615–s11620, s11810–s11815, s12013–s12018, s18237 | S \ F (20863) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_started:required:scope_kind` | s18238 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_started/properties/scope_kind:const` | s2107–s2109, s11621–s11626, s11816–s11821, s12019–s12024, s18239 | S \ F (20863) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_started:required:project_id` | s18232 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_started:required:thread_id` | s18241 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_started:required:collaboration_id` | s18220 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_started:required:collaboration_run_id` | s18221 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_started:required:kind` | s18230 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_started:required:definition_revision` | s18223 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_started/properties/definition_revision:type` | s2080–s2082, s11572–s11577, s11767–s11772, s11966–s11971, s18225 | S \ F (20863) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_started/properties/definition_revision:minimum` | s18224 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_started:required:started_at_utc` | s18240 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_started:required:assignment_revision` | s18215 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_started/properties/assignment_revision:type` | s2065–s2067, s11548–s11553, s11743–s11748, s11938–s11943, s18217 | S \ F (20863) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_started/properties/assignment_revision:minimum` | s18216 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_started:required:additive_role_kind` | s18213 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_started:required:required` | s18234 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_started/properties/required:type` | s2101–s2103, s11610–s11614, s11805–s11809, s12004–s12008, s18235 | S \ F (20866) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_started:required:requested_identity_ref` | s18233 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_started:required:effective_identity_ref` | s18226 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_started:required:currentness_hash` | s18222 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_started:required:idempotency_key` | s18228 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_started/properties/idempotency_key:type` | s2087–s2088, s11584–s11587, s11779–s11782, s11978–s11981, s18229 | S \ F (20870) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_started_application:required:schema_version` | s18206 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_started_application/properties/schema_version:const` | s2047–s2049, s11516–s11521, s11711–s11716, s11906–s11911, s12117–s12122, s18207 | S \ F (20857) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_started_application:required:scope_kind` | s18208 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_started_application/properties/scope_kind:const` | s2050–s2052, s11522–s11527, s11717–s11722, s11912–s11917, s12123–s12128, s18209 | S \ F (20857) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_started_application:required:project_id` | s18201 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_started_application:required:server_id` | s18210 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_started_application:required:thread_id` | s18212 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_started_application:required:collaboration_id` | s18189 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_started_application:required:collaboration_run_id` | s18190 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_started_application:required:kind` | s18199 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_started_application:required:definition_revision` | s18192 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_started_application/properties/definition_revision:type` | s2025–s2027, s11472–s11477, s11667–s11672, s11862–s11867, s12069–s12074, s18194 | S \ F (20857) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_started_application/properties/definition_revision:minimum` | s18193 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_started_application:required:started_at_utc` | s18211 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_started_application:required:participant_slot_id` | s18200 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_started_application:required:assignment_revision` | s18184 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_started_application/properties/assignment_revision:type` | s2010–s2012, s11448–s11453, s11643–s11648, s11838–s11843, s12041–s12046, s18186 | S \ F (20857) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_started_application/properties/assignment_revision:minimum` | s18185 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_started_application:required:attempt_id` | s18187 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_started_application:required:additive_role_kind` | s18183 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_started_application:required:required` | s18204 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_started_application/properties/required:type` | s2044–s2046, s11511–s11515, s11706–s11710, s11901–s11905, s12108–s12112, s18205 | S \ F (20861) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_started_application:required:requested_identity_ref` | s18203 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_started_application:required:effective_identity_ref` | s18195 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_started_application:required:currentness_hash` | s18191 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_started_application:required:idempotency_key` | s18197 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_started_application/properties/idempotency_key:type` | s2032–s2033, s11484–s11487, s11679–s11682, s11874–s11877, s12081–s12084, s18198 | S \ F (20866) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_started_application:additionalProperties` | s18188 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_completed:required:schema_version` | s18147 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_completed/properties/schema_version:const` | s1986–s1988, s10556–s10561, s10751–s10756, s10946–s10951, s11131–s11136, s11312–s11317, s18148 | S \ F (20851) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_completed:required:scope_kind` | s18149 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_completed/properties/scope_kind:const` | s1989–s1991, s10562–s10567, s10757–s10762, s10952–s10957, s11137–s11142, s11318–s11323, s18150 | S \ F (20851) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_completed:required:project_id` | s18144 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_completed:required:thread_id` | s18151 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_completed:required:collaboration_id` | s18129 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_completed:required:collaboration_run_id` | s18130 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_completed:required:kind` | s18140 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_completed:required:definition_revision` | s18132 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_completed/properties/definition_revision:type` | s1959–s1961, s10507–s10512, s10690–s10695, s10897–s10902, s11076–s11081, s11263–s11268, s18134 | S \ F (20851) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_completed/properties/definition_revision:minimum` | s18133 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_completed:required:finished_at_utc` | s18136 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_completed:required:assignment_revision` | s18124 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_completed/properties/assignment_revision:type` | s1944–s1946, s10483–s10488, s10666–s10671, s10873–s10878, s11056–s11061, s11243–s11248, s18126 | S \ F (20851) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_completed/properties/assignment_revision:minimum` | s18125 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_completed/allOf/1/then:required:attempt_id` | s18127 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_completed:required:outcome` | s18116, s18141, s18152 | S \ F (20882) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_completed:required:required` | s18145 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_completed/properties/required:type` | s1983–s1985, s10551–s10555, s10746–s10750, s10941–s10945, s11126–s11130, s11307–s11311, s18146 | S \ F (20856) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_completed:required:disposition_record_ref` | s18135 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_completed:required:currentness_hash` | s18131 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_completed:required:idempotency_key` | s18138 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_completed/properties/idempotency_key:type` | s1969–s1970, s10525–s10528, s10714–s10717, s10915–s10918, s11094–s11097, s11281–s11284, s18139 | S \ F (20862) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_completed_application:required:schema_version` | s18110 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_completed_application/properties/schema_version:const` | s1920–s1922, s10463–s10468, s10646–s10651, s10853–s10858, s11036–s11041, s11223–s11228, s11410–s11415, s18111 | S \ F (20845) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_completed_application:required:scope_kind` | s18112 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_completed_application/properties/scope_kind:const` | s1923–s1925, s10469–s10474, s10652–s10657, s10859–s10864, s11042–s11047, s11229–s11234, s11416–s11421, s18113 | S \ F (20845) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_completed_application:required:project_id` | s18106 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_completed_application:required:server_id` | s18114 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_completed_application:required:thread_id` | s18115 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_completed_application:required:collaboration_id` | s18092 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_completed_application:required:collaboration_run_id` | s18093 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_completed_application:required:kind` | s18103 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_completed_application:required:definition_revision` | s18095 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_completed_application/properties/definition_revision:type` | s1895–s1897, s10413–s10418, s10596–s10601, s10791–s10796, s10986–s10991, s11167–s11172, s11360–s11365, s18097 | S \ F (20845) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_completed_application/properties/definition_revision:minimum` | s18096 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_completed_application:required:finished_at_utc` | s18099 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_completed_application:required:participant_slot_id` | s18105 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_completed_application:required:assignment_revision` | s18087 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_completed_application/properties/assignment_revision:type` | s1880–s1882, s10389–s10394, s10572–s10577, s10767–s10772, s10962–s10967, s11147–s11152, s11340–s11345, s18089 | S \ F (20845) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_completed_application/properties/assignment_revision:minimum` | s18088 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_completed_application/allOf/1/then:required:attempt_id` | s18090 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_completed_application:required:outcome` | s18104, s18120, s18156 | S \ F (20882) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_completed_application:required:required` | s18108 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_completed_application/properties/required:type` | s1917–s1919, s10458–s10462, s10641–s10645, s10848–s10852, s11031–s11035, s11218–s11222, s11405–s11409, s18109 | S \ F (20851) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_completed_application:required:disposition_record_ref` | s18098 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_completed_application:required:currentness_hash` | s18094 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_completed_application:required:idempotency_key` | s18101 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_completed_application/properties/idempotency_key:type` | s1905–s1906, s10431–s10434, s10614–s10617, s10815–s10818, s11004–s11007, s11185–s11188, s11378–s11381, s18102 | S \ F (20858) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_completed_application:additionalProperties` | s18091 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_message_added:required:schema_version` | s18071 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_message_added/properties/schema_version:const` | s1847–s1849, s9414–s9419, s9623–s9628, s9828–s9833, s10037–s10042, s10246–s10251, s18072 | S \ F (20851) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_message_added:required:scope_kind` | s18073 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_message_added/properties/scope_kind:const` | s1850–s1852, s9420–s9425, s9629–s9634, s9834–s9839, s10043–s10048, s10252–s10257, s18074 | S \ F (20851) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_message_added:required:project_id` | s18068 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_message_added:required:thread_id` | s18081 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_message_added:required:collaboration_id` | s18055 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_message_added:required:collaboration_run_id` | s18057 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_message_added:required:kind` | s18065 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_message_added:required:definition_revision` | s18059 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_message_added/properties/definition_revision:type` | s1826–s1828, s9381–s9386, s9590–s9595, s9795–s9800, s10000–s10005, s10213–s10218, s18061 | S \ F (20851) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_message_added/properties/definition_revision:minimum` | s18060 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_message_added:required:written_at_utc` | s18082 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_message_added:required:sequence` | s18078 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_message_added/properties/sequence:type` | s1859–s1861, s9436–s9441, s9645–s9650, s9850–s9855, s10059–s10064, s10268–s10273, s18080 | S \ F (20851) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_message_added:required:sender_kind` | s18076 | S \ F (20884) |
| `schema:Plans/collaborative_workflows_contracts.schema.json#/$defs/sender_kind:enum` | s158, s682–s684, s728–s730, s1784–s1786, s1856–s1858, s3478–s3483, s3563–s3568, s3643–s3648, s3728–s3733, s3808–s3813, s3893–s3898, s3977–s3982, s9322–s9327, s9430–s9435, s9535–s9540, s9639–s9644, s9740–s9745, s9844–s9849, s9945–s9950, s10053–s10058, s10158–s10163, s10262–s10267, s10363–s10368, s18077 | S \ F (20763) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_message_added:required:sender_id` | s18075 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_message_added:required:message_type` | s18066 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_message_added:required:recipient_ids` | s18069 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_message_added/properties/recipient_ids:type` | s1844–s1846, s9409–s9413, s9618–s9622, s9823–s9827, s10028–s10032, s10241–s10245, s18070 | S \ F (20856) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_message_added:required:body_ref` | s18053 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_message_added:required:attachment_refs` | s18051 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_message_added/properties/attachment_refs:type` | s1808–s1810, s9348–s9352, s9561–s9565, s9766–s9770, s9971–s9975, s10184–s10188, s18052 | S \ F (20856) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_message_added:required:currentness_hash` | s18058 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_message_added:required:idempotency_key` | s18063 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_message_added/properties/idempotency_key:type` | s1830–s1831, s9387–s9390, s9596–s9599, s9801–s9804, s10006–s10009, s10219–s10222, s18064 | S \ F (20862) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_message_added_application:required:schema_version` | s18035 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_message_added_application/properties/schema_version:const` | s1775–s1777, s9306–s9311, s9519–s9524, s9724–s9729, s9929–s9934, s10142–s10147, s10347–s10352, s18036 | S \ F (20845) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_message_added_application:required:scope_kind` | s18037 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_message_added_application/properties/scope_kind:const` | s1778–s1780, s9312–s9317, s9525–s9530, s9730–s9735, s9935–s9940, s10148–s10153, s10353–s10358, s18038 | S \ F (20845) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_message_added_application:required:project_id` | s18031 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_message_added_application:required:server_id` | s18044 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_message_added_application:required:thread_id` | s18045 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_message_added_application:required:collaboration_id` | s18019 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_message_added_application:required:collaboration_run_id` | s18021 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_message_added_application:required:kind` | s18029 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_message_added_application:required:definition_revision` | s18023 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_message_added_application/properties/definition_revision:type` | s1756–s1758, s9272–s9277, s9485–s9490, s9690–s9695, s9895–s9900, s10104–s10109, s10313–s10318, s18025 | S \ F (20845) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_message_added_application/properties/definition_revision:minimum` | s18024 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_message_added_application:required:written_at_utc` | s18046 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_message_added_application:required:collaboration_message_id` | s18020 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_message_added_application:required:sequence` | s18041 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_message_added_application/properties/sequence:type` | s1787–s1789, s9328–s9333, s9541–s9546, s9746–s9751, s9951–s9956, s10164–s10169, s10369–s10374, s18043 | S \ F (20845) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_message_added_application/properties/sequence:minimum` | s18042 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_message_added_application:required:sender_kind` | s18040 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_message_added_application:required:sender_id` | s18039 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_message_added_application:required:message_type` | s18030 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_message_added_application:required:recipient_ids` | s18033 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_message_added_application/properties/recipient_ids:type` | s1772–s1774, s9301–s9305, s9514–s9518, s9719–s9723, s9924–s9928, s10133–s10137, s10342–s10346, s18034 | S \ F (20851) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_message_added_application:required:body_ref` | s18017 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_message_added_application:required:attachment_refs` | s18015 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_message_added_application/properties/attachment_refs:type` | s1738–s1740, s9243–s9247, s9452–s9456, s9661–s9665, s9866–s9870, s10075–s10079, s10284–s10288, s18016 | S \ F (20851) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_message_added_application:required:currentness_hash` | s18022 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_message_added_application:required:idempotency_key` | s18027 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_message_added_application/properties/idempotency_key:type` | s1760–s1761, s9278–s9281, s9491–s9494, s9696–s9699, s9901–s9904, s10110–s10113, s10319–s10322, s18028 | S \ F (20858) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_message_added_application:additionalProperties` | s18018 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_artifact_added:required:schema_version` | s17255 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_artifact_added/properties/schema_version:const` | s758–s760, s3617–s3622, s3782–s3787, s3947–s3952, s17256 | S \ F (20863) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_artifact_added:required:scope_kind` | s17257 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_artifact_added/properties/scope_kind:const` | s761–s763, s3623–s3628, s3788–s3793, s3953–s3958, s17258 | S \ F (20863) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_artifact_added:required:project_id` | s17254 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_artifact_added:required:thread_id` | s17259 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_artifact_added:required:collaboration_id` | s17244 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_artifact_added:required:collaboration_run_id` | s17245 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_artifact_added:required:kind` | s17253 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_artifact_added:required:definition_revision` | s17247 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_artifact_added/properties/definition_revision:type` | s746–s748, s3595–s3600, s3760–s3765, s3925–s3930, s17249 | S \ F (20863) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_artifact_added/properties/definition_revision:minimum` | s17248 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_artifact_added:required:added_at_utc` | s17238 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_artifact_added:required:artifact_version_ref` | s17242 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_artifact_added:required:added_by_kind` | s17240 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_artifact_added:required:added_by_id` | s17239 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_artifact_added:required:currentness_hash` | s17246 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_artifact_added:required:idempotency_key` | s17251 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_artifact_added/properties/idempotency_key:type` | s750–s751, s3601–s3604, s3766–s3769, s3931–s3934, s17252 | S \ F (20870) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_artifact_added_application:required:schema_version` | s17232 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_artifact_added_application/properties/schema_version:const` | s710–s712, s3533–s3538, s3698–s3703, s3863–s3868, s4032–s4037, s17233 | S \ F (20857) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_artifact_added_application:required:scope_kind` | s17234 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_artifact_added_application/properties/scope_kind:const` | s713–s715, s3539–s3544, s3704–s3709, s3869–s3874, s4038–s4043, s17235 | S \ F (20857) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_artifact_added_application:required:project_id` | s17230 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_artifact_added_application:required:server_id` | s17236 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_artifact_added_application:required:thread_id` | s17237 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_artifact_added_application:required:collaboration_id` | s17220 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_artifact_added_application:required:collaboration_run_id` | s17221 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_artifact_added_application:required:kind` | s17229 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_artifact_added_application:required:definition_revision` | s17223 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_artifact_added_application/properties/definition_revision:type` | s700–s702, s3510–s3515, s3675–s3680, s3840–s3845, s4009–s4014, s17225 | S \ F (20857) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_artifact_added_application/properties/definition_revision:minimum` | s17224 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_artifact_added_application:required:added_at_utc` | s17214 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_artifact_added_application:required:artifact_ref` | s17217 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_artifact_added_application:required:artifact_version_ref` | s17218 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_artifact_added_application:required:added_by_kind` | s17216 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_artifact_added_application:required:added_by_id` | s17215 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_artifact_added_application:required:currentness_hash` | s17222 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_artifact_added_application:required:idempotency_key` | s17227 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_artifact_added_application/properties/idempotency_key:type` | s704–s705, s3516–s3519, s3681–s3684, s3846–s3849, s4015–s4018, s17228 | S \ F (20866) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_artifact_added_application:additionalProperties` | s17219 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_configuration_changed:required:schema_version` | s17694 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_configuration_changed/properties/schema_version:const` | s1281–s1283, s6380–s6385, s6587–s6592, s6793–s6798, s6991–s6996, s17695 | S \ F (20857) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_configuration_changed:required:scope_kind` | s17696 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_configuration_changed/properties/scope_kind:const` | s1284–s1286, s6386–s6391, s6593–s6598, s6799–s6804, s6997–s7002, s17697 | S \ F (20857) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_configuration_changed:required:project_id` | s17689 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_configuration_changed:required:thread_id` | s17699 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_configuration_changed:required:collaboration_id` | s17675 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_configuration_changed:required:collaboration_run_id` | s17676 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_configuration_changed:required:kind` | s17685 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_configuration_changed/properties/definition_revision:type` | s1260–s1262, s6347–s6352, s6554–s6559, s6760–s6765, s6958–s6963, s17681 | S \ F (20857) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_configuration_changed:required:previous_definition_revision` | s17686 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_configuration_changed/properties/previous_definition_revision:type` | s1269–s1271, s6365–s6370, s6572–s6577, s6778–s6783, s6976–s6981, s17688 | S \ F (20857) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_configuration_changed/properties/previous_definition_revision:minimum` | s17687 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_configuration_changed:required:changed_at_utc` | s17673 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_configuration_changed:required:change_source` | s17671, s17701 | S \ F (20883) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_configuration_changed/properties/change_source:enum` | s1242–s1244, s6315–s6320, s6522–s6527, s6728–s6733, s6926–s6931, s17672, s17702 | S \ F (20856) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_configuration_changed:required:change_kinds` | s17668 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_configuration_changed/properties/change_kinds:type` | s1239–s1241, s6310–s6314, s6517–s6521, s6723–s6727, s6921–s6925, s17669 | S \ F (20861) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_configuration_changed/properties/change_kinds:maxItems;Plans/collaboration_event_payloads.schema.json#/$defs/reconfigure_change_kind:enum` | s591, s1169–s1171, s1236–s1238, s17670 | S \ F (20877) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_configuration_changed:required:affected_slot_ids` | s17664 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_configuration_changed/properties/affected_slot_ids:type` | s1233–s1235, s6305–s6309, s6511–s6515, s6718–s6722, s6915–s6919, s17665 | S \ F (20861) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_configuration_changed/properties/affected_slot_ids:uniqueItems` | s17663 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_configuration_changed/properties/affected_slot_ids:maxItems` | s17666 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_configuration_changed:required:accept_stale_target` | s17661 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_configuration_changed/properties/accept_stale_target:type` | s1227–s1229, s6299, s6301–s6304, s6506–s6510, s6910–s6914, s17662 | S \ F (20866) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_configuration_changed:required:command_instance_ref` | s17677 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_configuration_changed/allOf/2/then:required:system_message_id` | s17698 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_configuration_changed:required:currentness_hash` | s17678 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_configuration_changed:required:idempotency_key` | s17683 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_configuration_changed/properties/idempotency_key:type` | s1264–s1265, s6353–s6356, s6560–s6563, s6766–s6769, s6964–s6967, s17684 | S \ F (20866) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_configuration_changed:required:required_slot_ids` | s17691 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_configuration_changed/properties/required_slot_ids:type` | s1278–s1280, s6375–s6379, s6582–s6586, s6788–s6792, s6986–s6990, s17692 | S \ F (20861) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_configuration_changed/properties/required_slot_ids:uniqueItems` | s17690 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_configuration_changed/properties/required_slot_ids:maxItems` | s17693 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_configuration_changed_application:required:schema_version` | s17654 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_configuration_changed_application/properties/schema_version:const` | s1212–s1214, s6275–s6280, s6482–s6487, s6689–s6694, s6890–s6895, s7093–s7098, s17655 | S \ F (20851) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_configuration_changed_application:required:scope_kind` | s17656 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_configuration_changed_application/properties/scope_kind:const` | s1215–s1217, s6281–s6286, s6488–s6493, s6695–s6700, s6896–s6901, s7099–s7104, s17657 | S \ F (20851) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_configuration_changed_application:required:project_id` | s17648 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_configuration_changed_application:required:server_id` | s17658 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_configuration_changed_application:required:thread_id` | s17660 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_configuration_changed_application:required:collaboration_id` | s17634 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_configuration_changed_application:required:collaboration_run_id` | s17635 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_configuration_changed_application:required:kind` | s17644 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_configuration_changed_application:required:definition_revision` | s17638 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_configuration_changed_application/properties/definition_revision:type` | s1193–s1195, s6241–s6246, s6448–s6453, s6655–s6660, s6856–s6861, s7059–s7064, s17640 | S \ F (20851) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_configuration_changed_application/properties/definition_revision:minimum` | s17639 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_configuration_changed_application:required:previous_definition_revision` | s17645 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_configuration_changed_application/properties/previous_definition_revision:type` | s1202–s1204, s6259–s6264, s6466–s6471, s6673–s6678, s6874–s6879, s7077–s7082, s17647 | S \ F (20851) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_configuration_changed_application/properties/previous_definition_revision:minimum` | s17646 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_configuration_changed_application:required:changed_at_utc` | s17632 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_configuration_changed_application:required:change_source` | s17630, s17704 | S \ F (20883) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_configuration_changed_application/properties/change_source:enum` | s1175–s1177, s6209–s6214, s6416–s6421, s6623–s6628, s6824–s6829, s7027–s7032, s17631, s17705 | S \ F (20850) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_configuration_changed_application:required:change_kinds` | s17627 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_configuration_changed_application/properties/change_kinds:type` | s1172–s1174, s6204–s6208, s6411–s6415, s6618–s6622, s6819–s6823, s7022–s7026, s17628 | S \ F (20856) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_configuration_changed_application/allOf/1/then/properties/change_kinds:minItems` | s6203, s6401, s6617, s7021, s17626 | S \ F (20880) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_configuration_changed_application/properties/change_kinds:maxItems;Plans/collaboration_event_payloads.schema.json#/$defs/reconfigure_change_kind:enum` | s591, s1169–s1171, s1236–s1238, s17629 | S \ F (20877) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_configuration_changed_application:required:affected_slot_ids` | s17623 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_configuration_changed_application/properties/affected_slot_ids:type` | s1166–s1168, s6198–s6202, s6406–s6410, s6612–s6616, s6814–s6818, s7016–s7020, s17624 | S \ F (20856) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_configuration_changed_application/properties/affected_slot_ids:uniqueItems` | s17622 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_configuration_changed_application/properties/affected_slot_ids:maxItems` | s17625 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_configuration_changed_application:required:accept_stale_target` | s17620 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_configuration_changed_application/properties/accept_stale_target:type` | s1160–s1162, s6193–s6197, s6400, s6402–s6405, s6607–s6611, s7011–s7015, s17621 | S \ F (20861) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_configuration_changed_application:required:command_instance_ref` | s17636 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_configuration_changed_application/allOf/2/then:required:system_message_id` | s17659 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_configuration_changed_application:required:currentness_hash` | s17637 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_configuration_changed_application:required:idempotency_key` | s17642 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_configuration_changed_application/properties/idempotency_key:type` | s1197–s1198, s6247–s6250, s6454–s6457, s6661–s6664, s6862–s6865, s7065–s7068, s17643 | S \ F (20862) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_configuration_changed_application:required:required_slot_ids` | s17651 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_configuration_changed_application/properties/required_slot_ids:type` | s1209–s1211, s6270–s6274, s6477–s6481, s6684–s6688, s6885–s6889, s7088–s7092, s17652 | S \ F (20856) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_configuration_changed_application/properties/required_slot_ids:uniqueItems` | s17650 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_configuration_changed_application/properties/required_slot_ids:maxItems` | s17653 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_configuration_changed_application:additionalProperties` | s17633 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_proposal_added:required:schema_version` | s18417 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_proposal_added/properties/schema_version:const` | s2422–s2424, s13486–s13491, s13665–s13670, s18418 | S \ F (20869) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_proposal_added:required:scope_kind` | s18419 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_proposal_added/properties/scope_kind:const` | s2425–s2427, s13492–s13497, s13671–s13676, s18420 | S \ F (20869) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_proposal_added:required:project_id` | s18411 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_proposal_added:required:thread_id` | s18421 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_proposal_added:required:collaboration_id` | s18399 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_proposal_added:required:collaboration_run_id` | s18400 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_proposal_added:required:kind` | s18408 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_proposal_added:required:definition_revision` | s18402 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_proposal_added/properties/definition_revision:type` | s2398–s2400, s13444–s13449, s13623–s13628, s18404 | S \ F (20869) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_proposal_added/properties/definition_revision:minimum` | s18403 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_proposal_added:required:added_at_utc` | s18394 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_proposal_added:required:participant_slot_id` | s18410 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_proposal_added:required:attempt_id` | s18395 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_proposal_added:required:proposal_round` | s18414 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_proposal_added/properties/proposal_round:type` | s2419–s2421, s13480–s13485, s13659–s13664, s18416 | S \ F (20869) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_proposal_added:required:blind_round` | s18396 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_proposal_added/properties/blind_round:type` | s2386–s2388, s13425–s13429, s13604–s13608, s18397 | S \ F (20871) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_proposal_added:required:proposal_record_ref` | s18413 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_proposal_added:required:currentness_hash` | s18401 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_proposal_added:required:idempotency_key` | s18406 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_proposal_added/properties/idempotency_key:type` | s2402–s2403, s13450–s13453, s13629–s13632, s18407 | S \ F (20874) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_proposal_added_application:required:schema_version` | s18388 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_proposal_added_application/properties/schema_version:const` | s2368–s2370, s13395–s13400, s13574–s13579, s13753–s13758, s18389 | S \ F (20863) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_proposal_added_application:required:scope_kind` | s18390 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_proposal_added_application/properties/scope_kind:const` | s2371–s2373, s13401–s13406, s13580–s13585, s13759–s13764, s18391 | S \ F (20863) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_proposal_added_application:required:project_id` | s18381 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_proposal_added_application:required:server_id` | s18392 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_proposal_added_application:required:thread_id` | s18393 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_proposal_added_application:required:collaboration_id` | s18369 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_proposal_added_application:required:collaboration_run_id` | s18370 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_proposal_added_application:required:kind` | s18378 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_proposal_added_application/properties/kind:const` | s2352–s2354, s13364–s13369, s13543–s13548, s13722–s13727, s18379 | S \ F (20863) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_proposal_added_application:required:definition_revision` | s18372 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_proposal_added_application/properties/definition_revision:type` | s2346–s2348, s13352–s13357, s13531–s13536, s13710–s13715, s18374 | S \ F (20863) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_proposal_added_application/properties/definition_revision:minimum` | s18373 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_proposal_added_application:required:added_at_utc` | s18364 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_proposal_added_application:required:proposal_id` | s18383 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_proposal_added_application:required:participant_slot_id` | s18380 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_proposal_added_application:required:attempt_id` | s18365 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_proposal_added_application:required:proposal_round` | s18385 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_proposal_added_application/properties/proposal_round:type` | s2365–s2367, s13389–s13394, s13568–s13573, s13747–s13752, s18387 | S \ F (20863) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_proposal_added_application/properties/proposal_round:minimum` | s18386 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_proposal_added_application:required:blind_round` | s18366 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_proposal_added_application/properties/blind_round:type` | s2334–s2336, s13333–s13337, s13512–s13516, s13691–s13695, s18367 | S \ F (20866) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_proposal_added_application:required:proposal_record_ref` | s18384 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_proposal_added_application:required:currentness_hash` | s18371 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_proposal_added_application:required:idempotency_key` | s18376 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_proposal_added_application/properties/idempotency_key:type` | s2350–s2351, s13358–s13361, s13537–s13540, s13716–s13719, s18377 | S \ F (20870) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_proposal_added_application:additionalProperties` | s18368 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_vote_added:required:schema_version` | s19997 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_vote_added/properties/schema_version:const` | s3453–s3455, s15550–s15555, s15749–s15754, s19998 | S \ F (20869) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_vote_added:required:scope_kind` | s19999 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_vote_added/properties/scope_kind:const` | s3456–s3458, s15556–s15561, s15755–s15760, s20000 | S \ F (20869) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_vote_added:required:project_id` | s19995 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_vote_added:required:thread_id` | s20001 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_vote_added:required:collaboration_id` | s19977 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_vote_added:required:collaboration_run_id` | s19978 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_vote_added:required:kind` | s19990 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_vote_added/properties/kind:const` | s3438–s3440, s15526–s15531, s15725–s15730, s19991 | S \ F (20869) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_vote_added:required:definition_revision` | s19982 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_vote_added/properties/definition_revision:type` | s3426–s3428, s15509–s15514, s15708–s15713, s19984 | S \ F (20869) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_vote_added/properties/definition_revision:minimum` | s19983 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_vote_added:required:cast_at_utc` | s19975 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_vote_added:required:proposal_id` | s19996 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_vote_added:required:participant_slot_id` | s19992 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_vote_added:required:attempt_id` | s19974 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_vote_added:required:position` | s19993 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_vote_added:required:confidence` | s19979 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_vote_added/properties/confidence:type` | s3420–s3422, s15497–s15502, s15696–s15701, s19980 | S \ F (20869) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_vote_added:required:hard_constraint_conflict_ids` | s19985 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_vote_added/properties/hard_constraint_conflict_ids:type` | s3432–s3434, s15515–s15519, s15714–s15718, s19986 | S \ F (20871) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_vote_added:required:vote_record_ref` | s20003 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_vote_added:required:currentness_hash` | s19981 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_vote_added:required:idempotency_key` | s19988 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_vote_added/properties/idempotency_key:type` | s3436–s3437, s15520–s15523, s15719–s15722, s19989 | S \ F (20874) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_vote_added_application:required:schema_version` | s19962 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_vote_added_application/properties/schema_version:const` | s3390–s3392, s15449–s15454, s15648–s15653, s15847–s15852, s19963 | S \ F (20863) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_vote_added_application:required:scope_kind` | s19964 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_vote_added_application/properties/scope_kind:const` | s3393–s3395, s15455–s15460, s15654–s15659, s15853–s15858, s19965 | S \ F (20863) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_vote_added_application:required:project_id` | s19959 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_vote_added_application:required:server_id` | s19966 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_vote_added_application:required:thread_id` | s19967 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_vote_added_application:required:collaboration_id` | s19942 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_vote_added_application:required:collaboration_run_id` | s19943 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_vote_added_application:required:kind` | s19955 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_vote_added_application/properties/kind:const` | s3377–s3379, s15424–s15429, s15623–s15628, s15822–s15827, s19956 | S \ F (20863) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_vote_added_application:required:definition_revision` | s19947 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_vote_added_application/properties/definition_revision:type` | s3365–s3367, s15407–s15412, s15606–s15611, s15805–s15810, s19949 | S \ F (20863) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_vote_added_application/properties/definition_revision:minimum` | s19948 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_vote_added_application:required:cast_at_utc` | s19940 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_vote_added_application:required:vote_id` | s19968 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_vote_added_application:required:proposal_id` | s19961 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_vote_added_application:required:participant_slot_id` | s19957 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_vote_added_application:required:attempt_id` | s19939 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_vote_added_application:required:position` | s19958 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_vote_added_application:required:confidence` | s19944 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_vote_added_application/properties/confidence:type` | s3359–s3361, s15395–s15400, s15594–s15599, s15793–s15798, s19945 | S \ F (20863) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_vote_added_application:required:hard_constraint_conflict_ids` | s19950 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_vote_added_application/properties/hard_constraint_conflict_ids:type` | s3371–s3373, s15413–s15417, s15612–s15616, s15811–s15815, s19951 | S \ F (20866) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_vote_added_application:required:vote_record_ref` | s19969 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_vote_added_application:required:currentness_hash` | s19946 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_vote_added_application:required:idempotency_key` | s19953 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_vote_added_application/properties/idempotency_key:type` | s3375–s3376, s15418–s15421, s15617–s15620, s15816–s15819, s19954 | S \ F (20870) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_vote_added_application:additionalProperties` | s19941 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_plan_synthesized:required:schema_version` | s18356 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_plan_synthesized/properties/schema_version:const` | s2310–s2312, s12794–s12799, s12991–s12996, s13188–s13193, s18357 | S \ F (20863) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_plan_synthesized:required:scope_kind` | s18358 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_plan_synthesized/properties/scope_kind:const` | s2313–s2315, s12800–s12805, s12997–s13002, s13194–s13199, s18359 | S \ F (20863) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_plan_synthesized:required:project_id` | s18352 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_plan_synthesized:required:thread_id` | s18361 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_plan_synthesized:required:collaboration_id` | s18330 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_plan_synthesized:required:collaboration_run_id` | s18331 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_plan_synthesized:required:kind` | s18342 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_plan_synthesized:required:definition_revision` | s18333 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_plan_synthesized/properties/definition_revision:type` | s2280–s2282, s12738–s12743, s12935–s12940, s13132–s13137, s18335 | S \ F (20863) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_plan_synthesized/properties/definition_revision:minimum` | s18334 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_plan_synthesized:required:synthesized_at_utc` | s18360 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_plan_synthesized:required:plan_version` | s18349 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_plan_synthesized/properties/plan_version:type` | s2301–s2303, s12778–s12783, s12975–s12980, s13172–s13177, s18351 | S \ F (20863) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_plan_synthesized/properties/plan_version:minimum` | s18350 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_plan_synthesized:required:plan_hash` | s18348 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_plan_synthesized:required:plan_create_receipt_ref` | s18347 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_plan_synthesized:required:dissent_count` | s18336 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_plan_synthesized/properties/dissent_count:type` | s2283–s2285, s12744–s12749, s12941–s12946, s13138–s13143, s18338 | S \ F (20863) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_plan_synthesized/properties/dissent_count:minimum` | s18337 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_plan_synthesized:required:rejected_alternative_count` | s18353 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_plan_synthesized/properties/rejected_alternative_count:type` | s2307–s2309, s12788–s12793, s12985–s12990, s13182–s13187, s18355 | S \ F (20863) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_plan_synthesized/properties/rejected_alternative_count:minimum` | s18354 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_plan_synthesized:required:lead_count` | s18344 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_plan_synthesized/properties/lead_count:type` | s2292–s2294, s12762–s12767, s12959–s12964, s13156–s13161, s18346 | S \ F (20863) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_plan_synthesized/properties/lead_count:minimum` | s18345 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_plan_synthesized:required:currentness_hash` | s18332 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_plan_synthesized:required:idempotency_key` | s18340 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_plan_synthesized/properties/idempotency_key:type` | s2287–s2288, s12750–s12753, s12947–s12950, s13144–s13147, s18341 | S \ F (20870) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_plan_synthesized_application:required:schema_version` | s18321 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_plan_synthesized_application/properties/schema_version:const` | s2253–s2255, s12694–s12699, s12891–s12896, s13088–s13093, s13291–s13296, s18322 | S \ F (20857) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_plan_synthesized_application:required:scope_kind` | s18323 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_plan_synthesized_application/properties/scope_kind:const` | s2256–s2258, s12700–s12705, s12897–s12902, s13094–s13099, s13297–s13302, s18324 | S \ F (20857) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_plan_synthesized_application:required:project_id` | s18316 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_plan_synthesized_application:required:server_id` | s18325 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_plan_synthesized_application:required:thread_id` | s18327 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_plan_synthesized_application:required:collaboration_id` | s18294 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_plan_synthesized_application:required:collaboration_run_id` | s18295 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_plan_synthesized_application:required:kind` | s18306 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_plan_synthesized_application/properties/kind:const` | s2234–s2236, s12655–s12660, s12852–s12857, s13049–s13054, s13252–s13257, s18307 | S \ F (20857) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_plan_synthesized_application:required:definition_revision` | s18297 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_plan_synthesized_application/properties/definition_revision:type` | s2225–s2227, s12637–s12642, s12834–s12839, s13031–s13036, s13234–s13239, s18299 | S \ F (20857) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_plan_synthesized_application/properties/definition_revision:minimum` | s18298 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_plan_synthesized_application:required:synthesized_at_utc` | s18326 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_plan_synthesized_application:required:assistant_plan_id` | s18292 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_plan_synthesized_application:required:plan_version` | s18313 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_plan_synthesized_application/properties/plan_version:type` | s2246–s2248, s12677–s12682, s12874–s12879, s13071–s13076, s13274–s13279, s18315 | S \ F (20857) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_plan_synthesized_application/properties/plan_version:minimum` | s18314 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_plan_synthesized_application:required:plan_hash` | s18312 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_plan_synthesized_application:required:plan_create_receipt_ref` | s18311 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_plan_synthesized_application:required:dissent_count` | s18300 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_plan_synthesized_application/properties/dissent_count:type` | s2228–s2230, s12643–s12648, s12840–s12845, s13037–s13042, s13240–s13245, s18302 | S \ F (20857) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_plan_synthesized_application/properties/dissent_count:minimum` | s18301 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_plan_synthesized_application:required:rejected_alternative_count` | s18318 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_plan_synthesized_application/properties/rejected_alternative_count:type` | s2250–s2252, s12688–s12693, s12885–s12890, s13082–s13087, s13285–s13290, s18320 | S \ F (20857) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_plan_synthesized_application/properties/rejected_alternative_count:minimum` | s18319 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_plan_synthesized_application:required:lead_count` | s18308 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_plan_synthesized_application/properties/lead_count:type` | s2237–s2239, s12661–s12666, s12858–s12863, s13055–s13060, s13258–s13263, s18310 | S \ F (20857) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_plan_synthesized_application/properties/lead_count:minimum` | s18309 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_plan_synthesized_application:required:currentness_hash` | s18296 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_plan_synthesized_application:required:idempotency_key` | s18304 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_plan_synthesized_application/properties/idempotency_key:type` | s2232–s2233, s12649–s12652, s12846–s12849, s13043–s13046, s13246–s13249, s18305 | S \ F (20866) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_plan_synthesized_application:additionalProperties` | s18293 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_added:required:schema_version` | s17905 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_added/properties/schema_version:const` | s1590–s1592, s8380–s8385, s8565–s8570, s17906 | S \ F (20869) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_added:required:scope_kind` | s17907 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_added/properties/scope_kind:const` | s1593–s1595, s8386–s8391, s8571–s8576, s17908 | S \ F (20869) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_added:required:project_id` | s17904 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_added:required:thread_id` | s17915 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_added:required:collaboration_id` | s17885 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_added:required:collaboration_run_id` | s17886 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_added:required:kind` | s17897 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_added/properties/kind:const` | s1578–s1580, s8364–s8369, s8549–s8554, s17898 | S \ F (20869) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_added:required:definition_revision` | s17888 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_added/properties/definition_revision:type` | s1563–s1565, s8338–s8343, s8523–s8528, s17890 | S \ F (20869) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_added/properties/definition_revision:minimum` | s17889 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_added:required:added_at_utc` | s17883 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_added:required:finding_key` | s17892 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_added:required:severity` | s17909 | S \ F (20884) |
| `schema:Plans/collaborative_workflows_contracts.schema.json#/$defs/review_severity:enum` | s1539–s1541, s1596–s1598, s8302–s8307, s8392–s8397, s8487–s8492, s8577–s8582, s8672–s8677, s16092, s17910 | S \ F (20847) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_added:required:originating_reviewer_ids` | s17901 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_added/properties/originating_reviewer_ids:type` | s1584–s1586, s8371–s8375, s8556–s8560, s17902 | S \ F (20871) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_added/properties/originating_reviewer_ids:uniqueItems` | s17899 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_added/properties/originating_reviewer_ids:maxItems` | s17903 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_added:required:target_hashes` | s17912 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_added/properties/target_hashes:type` | s1602–s1604, s8399–s8403, s8584–s8588, s17913 | S \ F (20871) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_added/properties/target_hashes:minItems` | s8398, s8583, s17911 | S \ F (20882) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_added/properties/target_hashes:maxItems` | s17914 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_added:required:finding_record_ref` | s17893 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_added:required:currentness_hash` | s17887 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_added:required:idempotency_key` | s17895 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_added/properties/idempotency_key:type` | s1576–s1577, s8358–s8361, s8543–s8546, s17896 | S \ F (20874) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_added_application:required:schema_version` | s17872 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_added_application/properties/schema_version:const` | s1530–s1532, s8286–s8291, s8471–s8476, s8656–s8661, s17873 | S \ F (20863) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_added_application:required:scope_kind` | s17874 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_added_application/properties/scope_kind:const` | s1533–s1535, s8292–s8297, s8477–s8482, s8662–s8667, s17875 | S \ F (20863) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_added_application:required:project_id` | s17870 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_added_application:required:server_id` | s17876 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_added_application:required:thread_id` | s17882 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_added_application:required:collaboration_id` | s17851 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_added_application:required:collaboration_run_id` | s17852 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_added_application:required:kind` | s17863 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_added_application/properties/kind:const` | s1520–s1522, s8269–s8274, s8454–s8459, s8639–s8644, s17864 | S \ F (20863) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_added_application:required:definition_revision` | s17854 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_added_application/properties/definition_revision:type` | s1505–s1507, s8243–s8248, s8428–s8433, s8613–s8618, s17856 | S \ F (20863) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_added_application/properties/definition_revision:minimum` | s17855 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_added_application:required:added_at_utc` | s17849 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_added_application:required:finding_id` | s17857 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_added_application:required:finding_key` | s17858 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_added_application:required:severity` | s17877 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_added_application:required:originating_reviewer_ids` | s17867 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_added_application/properties/originating_reviewer_ids:type` | s1526–s1528, s8276–s8280, s8461–s8465, s8646–s8650, s17868 | S \ F (20866) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_added_application/properties/originating_reviewer_ids:minItems` | s8275, s8460, s8645, s17866 | S \ F (20881) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_added_application/properties/originating_reviewer_ids:uniqueItems` | s17865 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_added_application/properties/originating_reviewer_ids:maxItems` | s17869 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_added_application:required:target_hashes` | s17879 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_added_application/properties/target_hashes:type` | s1545–s1547, s8309–s8313, s8494–s8498, s8679–s8683, s17880 | S \ F (20866) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_added_application/properties/target_hashes:minItems` | s8308, s8493, s8678, s17878 | S \ F (20881) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_added_application/properties/target_hashes:maxItems` | s17881 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_added_application:required:finding_record_ref` | s17859 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_added_application:required:currentness_hash` | s17853 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_added_application:required:idempotency_key` | s17861 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_added_application/properties/idempotency_key:type` | s1518–s1519, s8263–s8266, s8448–s8451, s8633–s8636, s17862 | S \ F (20870) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_added_application:additionalProperties` | s17850 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_dispositioned:required:schema_version` | s17982 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_dispositioned/properties/schema_version:const` | s1720–s1722, s8887–s8892, s9108–s9113, s17983 | S \ F (20869) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_dispositioned:required:scope_kind` | s17984 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_dispositioned/properties/scope_kind:const` | s1723–s1725, s8893–s8898, s9114–s9119, s17985 | S \ F (20869) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_dispositioned:required:project_id` | s17981 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_dispositioned:required:thread_id` | s17990 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_dispositioned:required:collaboration_id` | s17956 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_dispositioned:required:collaboration_run_id` | s17957 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_dispositioned:required:kind` | s17979 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_dispositioned/properties/kind:const` | s1714–s1716, s8877–s8882, s9098–s9103, s17980 | S \ F (20869) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_dispositioned:required:definition_revision` | s17964 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_dispositioned/properties/definition_revision:type` | s1690–s1692, s8833–s8838, s9054–s9059, s17966 | S \ F (20869) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_dispositioned/properties/definition_revision:minimum` | s17965 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_dispositioned:required:dispositioned_at_utc` | s17969 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_dispositioned:required:finding_key` | s17974 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_dispositioned:required:disposition` | s17967 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_dispositioned:required:confidence` | s17958 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_dispositioned/properties/confidence:type` | s1681–s1683, s8815–s8820, s9036–s9041, s17959 | S \ F (20869) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_dispositioned:required:counted_vote_count` | s17960 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_dispositioned/properties/counted_vote_count:type` | s1684–s1686, s8821–s8826, s9042–s9047, s17962 | S \ F (20869) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_dispositioned/properties/counted_vote_count:minimum` | s17961 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_dispositioned:required:dissent_count` | s17970 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_dispositioned/properties/dissent_count:type` | s1699–s1701, s8851–s8856, s9072–s9077, s17972 | S \ F (20869) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_dispositioned/properties/dissent_count:minimum` | s17971 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_dispositioned:required:target_hashes` | s17987 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_dispositioned/properties/target_hashes:type` | s1729–s1731, s8900–s8904, s9121–s9125, s17988 | S \ F (20871) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_dispositioned/properties/target_hashes:minItems` | s8899, s9120, s17986 | S \ F (20882) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_dispositioned/properties/target_hashes:maxItems` | s17989 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_dispositioned:required:adjudicator_ref` | s17954 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_dispositioned:required:finding_record_ref` | s17975 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_dispositioned:required:currentness_hash` | s17963 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_dispositioned:required:idempotency_key` | s17977 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_dispositioned/properties/idempotency_key:type` | s1712–s1713, s8871–s8874, s9092–s9095, s17978 | S \ F (20874) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_dispositioned_application:required:schema_version` | s17944 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_dispositioned_application/properties/schema_version:const` | s1654–s1656, s8775–s8780, s8996–s9001, s9217–s9222, s17945 | S \ F (20863) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_dispositioned_application:required:scope_kind` | s17946 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_dispositioned_application/properties/scope_kind:const` | s1657–s1659, s8781–s8786, s9002–s9007, s9223–s9228, s17947 | S \ F (20863) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_dispositioned_application:required:project_id` | s17942 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_dispositioned_application:required:server_id` | s17948 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_dispositioned_application:required:thread_id` | s17953 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_dispositioned_application:required:collaboration_id` | s17918 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_dispositioned_application:required:collaboration_run_id` | s17919 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_dispositioned_application:required:kind` | s17940 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_dispositioned_application/properties/kind:const` | s1650–s1652, s8764–s8769, s8985–s8990, s9206–s9211, s17941 | S \ F (20863) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_dispositioned_application:required:definition_revision` | s17926 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_dispositioned_application/properties/definition_revision:type` | s1626–s1628, s8720–s8725, s8941–s8946, s9162–s9167, s17928 | S \ F (20863) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_dispositioned_application/properties/definition_revision:minimum` | s17927 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_dispositioned_application:required:dispositioned_at_utc` | s17930 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_dispositioned_application:required:finding_id` | s17934 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_dispositioned_application:required:finding_key` | s17935 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_dispositioned_application:required:disposition` | s17929 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_dispositioned_application:required:confidence` | s17920 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_dispositioned_application/properties/confidence:type` | s1617–s1619, s8702–s8707, s8923–s8928, s9144–s9149, s17921 | S \ F (20863) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_dispositioned_application:required:counted_vote_count` | s17922 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_dispositioned_application/properties/counted_vote_count:type` | s1620–s1622, s8708–s8713, s8929–s8934, s9150–s9155, s17924 | S \ F (20863) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_dispositioned_application/properties/counted_vote_count:minimum` | s17923 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_dispositioned_application:required:dissent_count` | s17931 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_dispositioned_application/properties/dissent_count:type` | s1635–s1637, s8738–s8743, s8959–s8964, s9180–s9185, s17933 | S \ F (20863) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_dispositioned_application/properties/dissent_count:minimum` | s17932 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_dispositioned_application:required:target_hashes` | s17950 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_dispositioned_application/properties/target_hashes:type` | s1666–s1668, s8792–s8796, s9013–s9017, s9234–s9238, s17951 | S \ F (20866) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_dispositioned_application/properties/target_hashes:minItems` | s8791, s9012, s9233, s17949 | S \ F (20881) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_dispositioned_application/properties/target_hashes:maxItems` | s17952 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_dispositioned_application:required:adjudicator_ref` | s17916 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_dispositioned_application:required:finding_record_ref` | s17936 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_dispositioned_application:required:currentness_hash` | s17925 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_dispositioned_application:required:idempotency_key` | s17938 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_dispositioned_application/properties/idempotency_key:type` | s1648–s1649, s8758–s8761, s8979–s8982, s9200–s9203, s17939 | S \ F (20870) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_dispositioned_application:additionalProperties` | s17917 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized:required:schema_version` | s17351 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized/properties/schema_version:const` | s903–s905, s4295–s4300, s4578–s4583, s4861–s4866, s17352 | S \ F (20863) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized:required:scope_kind` | s17353 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized/properties/scope_kind:const` | s906–s908, s4301–s4306, s4584–s4589, s4867–s4872, s17354 | S \ F (20863) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized:required:project_id` | s17344 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized:required:thread_id` | s17364 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized:required:collaboration_id` | s17318 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized:required:collaboration_run_id` | s17319 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized:required:kind` | s17340 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized/properties/kind:const` | s888–s890, s4268–s4273, s4551–s4556, s4834–s4839, s17341 | S \ F (20863) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized:required:definition_revision` | s17327 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized/properties/definition_revision:type` | s873–s875, s4238–s4243, s4521–s4526, s4804–s4809, s17329 | S \ F (20863) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized/properties/definition_revision:minimum` | s17328 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized:required:finalized_at_utc` | s17336 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized:required:artifact_version_ref` | s17316 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized:required:target_pack_ref` | s17363 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized:required:target_hashes` | s17360 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized/properties/target_hashes:type` | s918–s920, s4318–s4322, s4601–s4605, s4885–s4889, s17361 | S \ F (20866) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized/properties/target_hashes:minItems` | s4317, s4600, s4884, s17359 | S \ F (20881) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized/properties/target_hashes:maxItems` | s17362 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized:required:requested_reviewer_count` | s17348 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized/properties/requested_reviewer_count:type` | s900–s902, s4289–s4294, s4572–s4577, s17350 | S \ F (20869) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized/allOf/1/then/properties/requested_reviewer_count:minimum;Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized/properties/requested_reviewer_count:minimum` | s4874, s17349 | S \ F (20883) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized:required:completed_reviewer_count` | s17320 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized/properties/completed_reviewer_count:type` | s864–s866, s4220–s4225, s4503–s4508, s4786–s4791, s17322 | S \ F (20863) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized/properties/completed_reviewer_count:minimum` | s17321 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized:required:failed_reviewer_count` | s17333 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized/properties/failed_reviewer_count:type` | s879–s881, s4250–s4255, s4533–s4538, s4816–s4821, s17335 | S \ F (20863) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized/properties/failed_reviewer_count:minimum` | s17334 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized:required:single_reviewer` | s17355, s17371 | S \ F (20883) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized/properties/single_reviewer:type` | s909–s911, s4307–s4311, s4590–s4594, s4873, s4875–s4878, s17356, s17372 | S \ F (20865) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized:required:partial_coverage_accepted` | s17342 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized/properties/partial_coverage_accepted:type` | s891–s893, s4274–s4278, s4557–s4561, s4840–s4844, s17343 | S \ F (20866) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized:required:stale_target_accepted` | s17357 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized/properties/stale_target_accepted:type` | s912–s914, s4312–s4316, s4595–s4599, s4879–s4883, s17358 | S \ F (20866) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized:required:confirmed_count` | s17323 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized/properties/confirmed_count:type` | s867–s869, s4226–s4231, s4509–s4514, s4792–s4797, s17325 | S \ F (20863) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized/properties/confirmed_count:minimum` | s17324 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized:required:rejected_count` | s17345 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized/properties/rejected_count:type` | s897–s899, s4283–s4288, s4566–s4571, s4849–s4854, s17347 | S \ F (20863) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized/properties/rejected_count:minimum` | s17346 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized:required:duplicate_count` | s17330 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized/properties/duplicate_count:type` | s876–s878, s4244–s4249, s4527–s4532, s4810–s4815, s17332 | S \ F (20863) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized/properties/duplicate_count:minimum` | s17331 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized:required:uncertain_count` | s17365 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized/properties/uncertain_count:type` | s927–s929, s4333–s4338, s4616–s4621, s4900–s4905, s17367 | S \ F (20863) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized/properties/uncertain_count:minimum` | s17366 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized:required:currentness_hash` | s17326 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized:required:idempotency_key` | s17338 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized/properties/idempotency_key:type` | s886–s887, s4262–s4265, s4545–s4548, s4828–s4831, s17339 | S \ F (20870) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized_application:required:schema_version` | s17297 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized_application/properties/schema_version:const` | s822–s824, s4152–s4157, s4435–s4440, s4718–s4723, s5002–s5007, s17298 | S \ F (20857) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized_application:required:scope_kind` | s17299 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized_application/properties/scope_kind:const` | s825–s827, s4158–s4163, s4441–s4446, s4724–s4729, s5008–s5013, s17300 | S \ F (20857) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized_application:required:project_id` | s17289 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized_application:required:server_id` | s17301 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized_application:required:thread_id` | s17311 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized_application:required:collaboration_id` | s17263 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized_application:required:collaboration_run_id` | s17264 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized_application:required:kind` | s17285 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized_application/properties/kind:const` | s809–s811, s4124–s4129, s4407–s4412, s4690–s4695, s4974–s4979, s17286 | S \ F (20857) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized_application:required:definition_revision` | s17272 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized_application/properties/definition_revision:type` | s794–s796, s4094–s4099, s4377–s4382, s4660–s4665, s4944–s4949, s17274 | S \ F (20857) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized_application/properties/definition_revision:minimum` | s17273 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized_application:required:finalized_at_utc` | s17281 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized_application:required:artifact_ref` | s17260 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized_application:required:artifact_version_ref` | s17261 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized_application:required:target_pack_ref` | s17310 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized_application:required:target_hashes` | s17307 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized_application/properties/target_hashes:type` | s840–s842, s4179–s4183, s4462–s4466, s4745–s4749, s5030–s5034, s17308 | S \ F (20861) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized_application/properties/target_hashes:minItems` | s4178, s4461, s4744, s5029, s17306 | S \ F (20880) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized_application/properties/target_hashes:maxItems` | s17309 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized_application:required:requested_reviewer_count` | s17294 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized_application/properties/requested_reviewer_count:type` | s819–s821, s4146–s4151, s4429–s4434, s4712–s4717, s17296 | S \ F (20863) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized_application/allOf/1/then/properties/requested_reviewer_count:minimum;Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized_application/properties/requested_reviewer_count:minimum` | s5019, s17295 | S \ F (20883) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized_application:required:completed_reviewer_count` | s17265 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized_application/properties/completed_reviewer_count:type` | s785–s787, s4076–s4081, s4359–s4364, s4642–s4647, s4926–s4931, s17267 | S \ F (20857) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized_application/properties/completed_reviewer_count:minimum` | s17266 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized_application:required:failed_reviewer_count` | s17278 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized_application/properties/failed_reviewer_count:type` | s800–s802, s4106–s4111, s4389–s4394, s4672–s4677, s4956–s4961, s17280 | S \ F (20857) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized_application/properties/failed_reviewer_count:minimum` | s17279 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized_application:required:single_reviewer` | s17302, s17376 | S \ F (20883) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized_application/properties/single_reviewer:type` | s831–s833, s4168–s4172, s4451–s4455, s4734–s4738, s5018, s5020–s5023, s17303, s17377 | S \ F (20860) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized_application:required:partial_coverage_accepted` | s17287 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized_application/properties/partial_coverage_accepted:type` | s812–s814, s4130–s4134, s4413–s4417, s4696–s4700, s4980–s4984, s17288 | S \ F (20861) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized_application:required:stale_target_accepted` | s17304 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized_application/properties/stale_target_accepted:type` | s834–s836, s4173–s4177, s4456–s4460, s4739–s4743, s5024–s5028, s17305 | S \ F (20861) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized_application:required:confirmed_count` | s17268 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized_application/properties/confirmed_count:type` | s788–s790, s4082–s4087, s4365–s4370, s4648–s4653, s4932–s4937, s17270 | S \ F (20857) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized_application/properties/confirmed_count:minimum` | s17269 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized_application:required:rejected_count` | s17291 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized_application/properties/rejected_count:type` | s816–s818, s4140–s4145, s4423–s4428, s4706–s4711, s4990–s4995, s17293 | S \ F (20857) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized_application/properties/rejected_count:minimum` | s17292 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized_application:required:duplicate_count` | s17275 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized_application/properties/duplicate_count:type` | s797–s799, s4100–s4105, s4383–s4388, s4666–s4671, s4950–s4955, s17277 | S \ F (20857) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized_application/properties/duplicate_count:minimum` | s17276 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized_application:required:uncertain_count` | s17312 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized_application/properties/uncertain_count:type` | s849–s851, s4194–s4199, s4477–s4482, s4760–s4765, s5045–s5050, s17314 | S \ F (20857) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized_application/properties/uncertain_count:minimum` | s17313 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized_application:required:currentness_hash` | s17271 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized_application:required:idempotency_key` | s17283 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized_application/properties/idempotency_key:type` | s807–s808, s4118–s4121, s4401–s4404, s4684–s4687, s4968–s4971, s17284 | S \ F (20866) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized_application:additionalProperties` | s17262 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_started/properties/target_hashes:type` | s3332–s3334, s15251–s15255, s19929 | S \ F (20876) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_started/properties/target_hashes:minItems` | s15250, s19927 | S \ F (20883) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_started/properties/target_hashes:maxItems` | s19930 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_started/properties/crew_auto_revision:type` | s3269–s3271, s14776–s14781, s19889 | S \ F (20875) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_started/properties/crew_auto_revision:minimum` | s19888 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_started/allOf/2/then/properties/kind:const;Plans/collaborative_workflows_contracts.schema.json#/$defs/collaboration_kind:enum` | s667, s706–s708, s752–s754, s957–s959, s1009–s1011, s1054–s1056, s1121–s1123, s1199–s1201, s1266–s1268, s1320–s1322, s1375–s1377, s1423–s1425, s1472–s1474, s1762–s1764, s1832–s1834, s1907–s1909, s1971–s1973, s2034–s2036, s2089–s2091, s2146–s2148, s2189–s2191, s2449–s2451, s2492–s2494, s3214–s3216, s3293–s3295, s3522–s3527, s3607–s3612, s3687–s3692, s3772–s3777, s3852–s3857, s3937–s3942, s4021–s4026, s5101–s5106, s5194–s5199, s5282–s5287, s5381–s5386, s5475–s5480, s5562–s5567, s5857–s5862, s5948–s5953, s6044–s6049, s6135–s6140, s6253–s6258, s6359–s6364, s6460–s6465, s6566–s6571, s6667–s6672, s6772–s6777, s6868–s6873, s6970–s6975, s7071–s7076, s7167–s7172, s7259–s7264, s7346–s7351, s7438–s7443, s7525–s7530, s7617–s7622, s7697–s7702, s7784–s7789, s7866–s7871, s7947–s7952, s8023–s8028, s8104–s8109, s8180–s8185, s9284–s9289, s9393–s9398, s9497–s9502, s9602–s9607, s9702–s9707, s9807–s9812, s9907–s9912, s10012–s10017, s10116–s10121, s10225–s10230, s10325–s10330, s10437–s10442, s10531–s10536, s10620–s10625, s10720–s10725, s10821–s10826, s10921–s10926, s11010–s11015, s11100–s11105, s11191–s11196, s11287–s11292, s11384–s11389, s11490–s11495, s11590–s11595, s11685–s11690, s11785–s11790, s11880–s11885, s11984–s11989, s12087–s12092, s12175–s12180, s12256–s12261, s12337–s12342, s12413–s12418, s12494–s12499, s12570–s12575, s13805–s13810, s13886–s13891, s13962–s13967, s14043–s14048, s14124–s14129, s14200–s14205, s14281–s14286, s14384–s14389, s14482–s14487, s14585–s14590, s14800–s14805, s14900–s14905, s14999–s15004, s15093–s15098, s15192–s15197, s15298–s15303, s17196, s17762, s19876, s19926, s19933 | S \ F (20267) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_started/allOf/1/else:not;Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_started/allOf/2/then:required:assistant_plan_id` | s19875, s20738 | S \ F (20883) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_started/allOf/1/then:required:plan_version` | s19877 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_started/properties/plan_version:type` | s3260–s3262, s14603–s14608, s19879 | S \ F (20875) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_started/properties/plan_version:minimum` | s19878 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_completed/allOf/0/then/properties/kind:const;Plans/collaborative_workflows_contracts.schema.json#/$defs/collaboration_kind:enum` | s470, s667, s706–s708, s752–s754, s957–s959, s1009–s1011, s1054–s1056, s1121–s1123, s1199–s1201, s1266–s1268, s1320–s1322, s1375–s1377, s1423–s1425, s1472–s1474, s1762–s1764, s1832–s1834, s1907–s1909, s1971–s1973, s2034–s2036, s2089–s2091, s2146–s2148, s2189–s2191, s2449–s2451, s2492–s2494, s3214–s3216, s3293–s3295, s3522–s3527, s3607–s3612, s3687–s3692, s3772–s3777, s3852–s3857, s3937–s3942, s4021–s4026, s5101–s5106, s5194–s5199, s5282–s5287, s5381–s5386, s5475–s5480, s5562–s5567, s5664–s5669, s5857–s5862, s5948–s5953, s6044–s6049, s6135–s6140, s6253–s6258, s6359–s6364, s6460–s6465, s6566–s6571, s6667–s6672, s6772–s6777, s6868–s6873, s6970–s6975, s7071–s7076, s7167–s7172, s7259–s7264, s7346–s7351, s7438–s7443, s7525–s7530, s7617–s7622, s7697–s7702, s7784–s7789, s7866–s7871, s7947–s7952, s8023–s8028, s8104–s8109, s8180–s8185, s9284–s9289, s9393–s9398, s9497–s9502, s9602–s9607, s9702–s9707, s9807–s9812, s9907–s9912, s10012–s10017, s10116–s10121, s10225–s10230, s10325–s10330, s10437–s10442, s10531–s10536, s10620–s10625, s10720–s10725, s10821–s10826, s10921–s10926, s11010–s11015, s11100–s11105, s11191–s11196, s11287–s11292, s11384–s11389, s11490–s11495, s11590–s11595, s11685–s11690, s11785–s11790, s11880–s11885, s11984–s11989, s12087–s12092, s12175–s12180, s12256–s12261, s12337–s12342, s12413–s12418, s12494–s12499, s12570–s12575, s13805–s13810, s13886–s13891, s13962–s13967, s14043–s14048, s14124–s14129, s14200–s14205, s14281–s14286, s14384–s14389, s14482–s14487, s14800–s14805, s14900–s14905, s14999–s15004, s15093–s15098, s15192–s15197, s15298–s15303, s17196, s17570, s17762, s19926, s19933 | S \ F (20266) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_completed/properties/state_before:enum` | s5702–s5707, s17571 | S \ F (20878) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_completed/allOf/0/then:required:command_instance_ref` | s17567 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_completed/properties/required_slot_ids:uniqueItems` | s17610 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_completed/properties/required_slot_ids:maxItems` | s17611 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_completed/properties/waived_slot_ids:uniqueItems` | s17612 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_completed/properties/waived_slot_ids:maxItems` | s17613 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_completed/properties/output_refs:uniqueItems` | s17608 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_completed/properties/output_refs:maxItems` | s17609 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_completed/properties/outcome_reason:enum` | s1935–s1937, s10732–s10737, s11112–s11117, s18119 | S \ F (20869) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_message_added/properties/recipient_ids:uniqueItems` | s18083 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_message_added/properties/recipient_ids:maxItems` | s18084 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_message_added/properties/attachment_refs:uniqueItems` | s18047 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_message_added/properties/attachment_refs:maxItems` | s18048 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_configuration_changed/allOf/0/then/allOf/1/properties/accept_stale_target:const;Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_configuration_changed/properties/accept_stale_target:type` | s1227–s1229, s6299, s6301–s6304, s6506–s6510, s6713–s6717, s6910–s6914, s17662, s17700 | S \ F (20860) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_vote_added/properties/hard_constraint_conflict_ids:uniqueItems` | s19970 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_vote_added/properties/hard_constraint_conflict_ids:maxItems` | s19971 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized/allOf/0/then/properties/requested_reviewer_count:const;Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized/properties/requested_reviewer_count:type` | s155, s900–s902, s4289–s4294, s4572–s4577, s4855–s4860, s17350, s17368, s17370 | S \ F (20860) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized/allOf/0/then/properties/requested_reviewer_count:const;Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized/properties/requested_reviewer_count:minimum` | s155, s17368–s17369 | S \ F (20882) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_started_application/allOf/3/then:required:target_pack_ref` | s19938 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_started_application/allOf/3/then:required:target_hashes` | s19935 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_started_application/properties/target_hashes:type` | s3341–s3343, s15362–s15366, s19936 | S \ F (20876) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_started_application/properties/target_hashes:minItems` | s15361, s19934 | S \ F (20883) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_started_application/properties/target_hashes:maxItems` | s19937 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_started_application/allOf/0/then:required:crew_auto_revision` | s19892 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_started_application/properties/crew_auto_revision:type` | s3272–s3274, s14876–s14881, s19894 | S \ F (20875) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_started_application/properties/crew_auto_revision:minimum` | s19893 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_started_application/allOf/2/then/properties/kind:const;Plans/collaborative_workflows_contracts.schema.json#/$defs/collaboration_kind:enum` | s667, s706–s708, s752–s754, s957–s959, s1009–s1011, s1054–s1056, s1121–s1123, s1199–s1201, s1266–s1268, s1320–s1322, s1375–s1377, s1423–s1425, s1472–s1474, s1762–s1764, s1832–s1834, s1907–s1909, s1971–s1973, s2034–s2036, s2089–s2091, s2146–s2148, s2189–s2191, s2449–s2451, s2492–s2494, s3214–s3216, s3293–s3295, s3522–s3527, s3607–s3612, s3687–s3692, s3772–s3777, s3852–s3857, s3937–s3942, s4021–s4026, s5101–s5106, s5194–s5199, s5282–s5287, s5381–s5386, s5475–s5480, s5562–s5567, s5857–s5862, s5948–s5953, s6044–s6049, s6135–s6140, s6253–s6258, s6359–s6364, s6460–s6465, s6566–s6571, s6667–s6672, s6772–s6777, s6868–s6873, s6970–s6975, s7071–s7076, s7167–s7172, s7259–s7264, s7346–s7351, s7438–s7443, s7525–s7530, s7617–s7622, s7697–s7702, s7784–s7789, s7866–s7871, s7947–s7952, s8023–s8028, s8104–s8109, s8180–s8185, s9284–s9289, s9393–s9398, s9497–s9502, s9602–s9607, s9702–s9707, s9807–s9812, s9907–s9912, s10012–s10017, s10116–s10121, s10225–s10230, s10325–s10330, s10437–s10442, s10531–s10536, s10620–s10625, s10720–s10725, s10821–s10826, s10921–s10926, s11010–s11015, s11100–s11105, s11191–s11196, s11287–s11292, s11384–s11389, s11490–s11495, s11590–s11595, s11685–s11690, s11785–s11790, s11880–s11885, s11984–s11989, s12087–s12092, s12175–s12180, s12256–s12261, s12337–s12342, s12413–s12418, s12494–s12499, s12570–s12575, s13805–s13810, s13886–s13891, s13962–s13967, s14043–s14048, s14124–s14129, s14200–s14205, s14281–s14286, s14384–s14389, s14482–s14487, s14689–s14694, s14800–s14805, s14900–s14905, s14999–s15004, s15093–s15098, s15192–s15197, s15298–s15303, s17196, s17762, s19881, s19926, s19933 | S \ F (20267) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_started_application/allOf/1/else:not;Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_started_application/allOf/2/then:required:assistant_plan_id` | s19880 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_started_application/allOf/1/then:required:plan_version` | s19882 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_started_application/properties/plan_version:type` | s3266–s3268, s14707–s14712, s19884 | S \ F (20875) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_started_application/properties/plan_version:minimum` | s19883 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_completed_application/allOf/0/then/properties/kind:const;Plans/collaborative_workflows_contracts.schema.json#/$defs/collaboration_kind:enum` | s667, s706–s708, s752–s754, s957–s959, s1009–s1011, s1054–s1056, s1121–s1123, s1199–s1201, s1266–s1268, s1320–s1322, s1375–s1377, s1423–s1425, s1472–s1474, s1762–s1764, s1832–s1834, s1907–s1909, s1971–s1973, s2034–s2036, s2089–s2091, s2146–s2148, s2189–s2191, s2449–s2451, s2492–s2494, s3214–s3216, s3293–s3295, s3522–s3527, s3607–s3612, s3687–s3692, s3772–s3777, s3852–s3857, s3937–s3942, s4021–s4026, s5101–s5106, s5194–s5199, s5282–s5287, s5381–s5386, s5475–s5480, s5562–s5567, s5761–s5766, s5857–s5862, s5948–s5953, s6044–s6049, s6135–s6140, s6253–s6258, s6359–s6364, s6460–s6465, s6566–s6571, s6667–s6672, s6772–s6777, s6868–s6873, s6970–s6975, s7071–s7076, s7167–s7172, s7259–s7264, s7346–s7351, s7438–s7443, s7525–s7530, s7617–s7622, s7697–s7702, s7784–s7789, s7866–s7871, s7947–s7952, s8023–s8028, s8104–s8109, s8180–s8185, s9284–s9289, s9393–s9398, s9497–s9502, s9602–s9607, s9702–s9707, s9807–s9812, s9907–s9912, s10012–s10017, s10116–s10121, s10225–s10230, s10325–s10330, s10437–s10442, s10531–s10536, s10620–s10625, s10720–s10725, s10821–s10826, s10921–s10926, s11010–s11015, s11100–s11105, s11191–s11196, s11287–s11292, s11384–s11389, s11490–s11495, s11590–s11595, s11685–s11690, s11785–s11790, s11880–s11885, s11984–s11989, s12087–s12092, s12175–s12180, s12256–s12261, s12337–s12342, s12413–s12418, s12494–s12499, s12570–s12575, s13805–s13810, s13886–s13891, s13962–s13967, s14043–s14048, s14124–s14129, s14200–s14205, s14281–s14286, s14384–s14389, s14482–s14487, s14800–s14805, s14900–s14905, s14999–s15004, s15093–s15098, s15192–s15197, s15298–s15303, s17196, s17575, s17762, s19926, s19933 | S \ F (20267) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_completed_application/properties/state_before:enum` | s5804–s5809, s17576 | S \ F (20878) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_completed_application/allOf/0/then:required:command_instance_ref` | s17572 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_completed_application/properties/required_slot_ids:uniqueItems` | s17616 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_completed_application/properties/required_slot_ids:maxItems` | s17617 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_completed_application/properties/waived_slot_ids:uniqueItems` | s17618 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_completed_application/properties/waived_slot_ids:maxItems` | s17619 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_completed_application/properties/output_refs:uniqueItems` | s17614 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_completed_application/properties/output_refs:maxItems` | s17615 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_completed_application/allOf/3/then:required:outcome_reason` | s18122 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_completed_application/properties/outcome_reason:enum` | s1941–s1943, s10833–s10838, s11203–s11208, s18123 | S \ F (20869) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_completed_application/allOf/2/then:required:waiver_actor_ref` | s18158 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_completed_application/allOf/2/then:required:waiver_currentness_hash` | s18159 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_message_added_application/properties/recipient_ids:uniqueItems` | s18085 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_message_added_application/properties/recipient_ids:maxItems` | s18086 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_message_added_application/properties/attachment_refs:uniqueItems` | s18049 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_message_added_application/properties/attachment_refs:maxItems` | s18050 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_configuration_changed_application/allOf/0/then/allOf/1/properties/accept_stale_target:const;Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_configuration_changed_application/properties/accept_stale_target:type` | s1160–s1162, s6193–s6197, s6400, s6402–s6405, s6607–s6611, s6809–s6813, s7011–s7015, s17621, s17703 | S \ F (20855) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_vote_added_application/properties/hard_constraint_conflict_ids:uniqueItems` | s19972 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_vote_added_application/properties/hard_constraint_conflict_ids:maxItems` | s19973 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_plan_synthesized_application/properties/tie_resolution:enum` | s2325–s2327, s13317–s13322, s18363 | S \ F (20875) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized_application/allOf/0/then/properties/requested_reviewer_count:const;Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized_application/properties/requested_reviewer_count:type` | s819–s821, s4146–s4151, s4429–s4434, s4712–s4717, s4996–s5001, s17296, s17373, s17375 | S \ F (20855) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized_application/allOf/0/then/properties/requested_reviewer_count:const;Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized_application/properties/requested_reviewer_count:minimum` | s17373–s17374 | S \ F (20883) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized_application/allOf/0/then/properties/requested_reviewer_count:const` | s17373 | S \ F (20884) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/checkpoint:required:schema_id` | s17506 | S \ F (20884) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/checkpoint/properties/schema_id:const` | s260, s315, s365, s452, s17507 | S \ F (20880) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/checkpoint:required:schema_version` | s17508 | S \ F (20884) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/checkpoint/properties/schema_version:const` | s261, s316, s366, s453, s17509 | S \ F (20880) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/checkpoint:required:publication_id` | s17501 | S \ F (20884) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/id:type` | s17493, s17502, s18171 | S \ F (20882) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/id:lexical` | s157, s162–s163, s258, s310, s313, s360, s363, s411, s414, s436, s439, s451, s665, s669–s671, s675, s16083, s16086–s16088, s16340, s16344, s16346–s16348, s16641, s16643–s16645, s17124, s17132, s17194–s17195, s17199–s17203, s17211, s17489–s17491, s17498–s17500, s20875–s20877, s20879–s20880, s20884 | S \ F (20832) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/checkpoint:required:storage_instance_id` | s17522 | S \ F (20884) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/checkpoint/properties/storage_instance_id:type` | s17523 | S \ F (20884) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/checkpoint/properties/storage_instance_id:lexical` | s267, s322, s370, s459, s17520–s17521 | S \ F (20879) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/checkpoint:required:scope_kind` | s17463, s17510 | S \ F (20883) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/checkpoint/properties/scope_kind:enum` | s262, s317, s367, s454, s17464, s17511 | S \ F (20879) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/checkpoint:required:scope_partition` | s17513 | S \ F (20884) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/checkpoint/properties/scope_partition:type` | s17514 | S \ F (20884) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/checkpoint/allOf/5/then/properties/scope_partition:lexical` | s318, s368, s455, s17512 | S \ F (20881) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/checkpoint:required:project_id` | s17492 | S \ F (20884) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/checkpoint:required:projector_id` | s17494 | S \ F (20884) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/checkpoint/properties/projector_id:const` | s256, s311, s361, s412, s17495 | S \ F (20880) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/checkpoint:required:projector_version` | s17496 | S \ F (20884) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/checkpoint/properties/projector_version:const` | s257, s312, s362, s413, s17497 | S \ F (20880) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/checkpoint:required:admitted_event_types` | s17469 | S \ F (20884) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/checkpoint/properties/admitted_event_types:type` | s17470 | S \ F (20884) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/checkpoint/properties/admitted_event_types:minItems` | s17468 | S \ F (20884) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/checkpoint/properties/admitted_event_types:maxItems;Plans/collaboration_projection_contracts.schema.json#/$defs/checkpoint/properties/admitted_event_types:uniqueItems` | s17467 | S \ F (20884) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/checkpoint/properties/admitted_event_types:maxItems;Plans/collaboration_projection_contracts.schema.json#/$defs/checkpoint/properties/admitted_event_types/items:enum` | s220–s237, s274–s291, s324–s341, s374–s392, s17471 | S \ F (20811) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/checkpoint:required:index_read_token` | s17483 | S \ F (20884) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/durable_read_token:type` | s17484 | S \ F (20884) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/checkpoint:required:first_retained_sequence_id` | s17475 | S \ F (20884) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/checkpoint/allOf/6/then/properties/first_retained_sequence_id:type` | s17477 | S \ F (20884) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/checkpoint/allOf/6/then/properties/first_retained_sequence_id:type;Plans/collaboration_projection_contracts.schema.json#/$defs/checkpoint/properties/first_retained_sequence_id:type` | s17477–s17478 | S \ F (20883) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/checkpoint/properties/first_retained_sequence_id:minimum` | s17476 | S \ F (20884) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/checkpoint:required:index_through_sequence_id` | s17485 | S \ F (20884) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/checkpoint/allOf/6/then/properties/index_through_sequence_id:type` | s17487 | S \ F (20884) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/checkpoint/allOf/6/then/properties/index_through_sequence_id:type;Plans/collaboration_projection_contracts.schema.json#/$defs/checkpoint/properties/index_through_sequence_id:type` | s17487–s17488 | S \ F (20883) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/checkpoint/properties/index_through_sequence_id:minimum` | s17486 | S \ F (20884) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/checkpoint:required:source_cursor` | s17515, s17531 | S \ F (20883) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/checkpoint/allOf/4/then/properties/first_retained_sequence_id:type;Plans/collaboration_projection_contracts.schema.json#/$defs/checkpoint/allOf/4/then/properties/index_through_sequence_id:type` | s273, s17516 | S \ F (20883) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/generic_source_cursor:anyOf` | s264–s265, s319–s320, s445–s446, s456–s457, s17517, s17532 | S \ F (20875) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/checkpoint:required:filter_complete` | s17473 | S \ F (20884) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/checkpoint/allOf/1/then/properties/filter_complete:const;Plans/collaboration_projection_contracts.schema.json#/$defs/checkpoint/properties/filter_complete:type` | s272, s17474 | S \ F (20883) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/checkpoint:required:state` | s17518 | S \ F (20884) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/checkpoint/properties/state:enum` | s266, s321, s369, s458, s17519 | S \ F (20880) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/checkpoint:required:health` | s17479 | S \ F (20884) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/checkpoint/allOf/1/then/properties/health:const;Plans/collaboration_projection_contracts.schema.json#/$defs/checkpoint/properties/health:enum` | s238, s292, s342, s393, s17480 | S \ F (20880) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/checkpoint:required:updated_at_utc` | s17525 | S \ F (20884) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/timestamp:type` | s461, s17526 | S \ F (20883) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/timestamp:lexical` | s259, s268, s314, s323, s364, s371, s415, s440, s449–s450, s460, s17207, s17524 | S \ F (20872) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/checkpoint:required:withdrawn_at_utc` | s17527 | S \ F (20884) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/checkpoint/allOf/1/then/properties/withdrawn_at_utc:type;Plans/collaboration_projection_contracts.schema.json#/$defs/checkpoint/properties/withdrawn_at_utc:anyOf` | s17528 | S \ F (20884) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/checkpoint:required:published_at_utc` | s17503 | S \ F (20884) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/checkpoint:required:hold_refs` | s17481 | S \ F (20884) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/checkpoint/properties/hold_refs:type` | s17482 | S \ F (20884) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/checkpoint:required:retired_generations` | s17504 | S \ F (20884) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/checkpoint/properties/retired_generations:type` | s17505 | S \ F (20884) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/checkpoint:additionalProperties` | s17472 | S \ F (20884) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/checkpoint/allOf/0/then/properties/scope_partition:const;Plans/collaboration_projection_contracts.schema.json#/$defs/checkpoint/properties/scope_partition:type` | s263, s269–s270, s17465–s17466, s17514 | S \ F (20879) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/checkpoint/allOf/0/then/properties/project_id:type` | s271, s17462 | S \ F (20883) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/checkpoint/properties/retired_generations:maxItems` | s373, s17533 | S \ F (20883) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/checkpoint/allOf/4/then/properties/first_retained_sequence_id:type;Plans/collaboration_projection_contracts.schema.json#/$defs/checkpoint/properties/first_retained_sequence_id:type` | s17529 | S \ F (20884) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/checkpoint/allOf/4/then/properties/index_through_sequence_id:type;Plans/collaboration_projection_contracts.schema.json#/$defs/checkpoint/properties/index_through_sequence_id:type` | s273, s17530 | S \ F (20883) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/run_projection:required:schema_id` | s18528 | S \ F (20884) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/run_projection/properties/schema_id:const` | s17204, s18529 | S \ F (20883) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/run_projection:required:schema_version` | s18530 | S \ F (20884) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/run_projection/properties/schema_version:const` | s17205, s18531 | S \ F (20883) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/run_projection:required:publication_id` | s18523 | S \ F (20884) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/run_projection:required:scope_partition` | s18533 | S \ F (20884) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/scope_partition:lexical` | s166, s674, s16091, s16351, s16648, s17206, s18532, s20883 | S \ F (20877) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/run_projection:required:collaboration_run_id` | s18504 | S \ F (20884) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/run_projection:required:collaboration_id` | s18503 | S \ F (20884) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/run_projection:required:kind` | s18510 | S \ F (20884) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/run_projection:required:thread_id` | s18542 | S \ F (20884) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/run_projection:required:definition_revision` | s18505 | S \ F (20884) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/run_projection/properties/definition_revision:type` | s18507 | S \ F (20884) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/run_projection/properties/definition_revision:minimum` | s18506 | S \ F (20884) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/run_projection:required:admission_source` | s18498 | S \ F (20884) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/run_projection:required:roster_slot_ids` | s18526 | S \ F (20884) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/run_projection/properties/roster_slot_ids:type` | s18527 | S \ F (20884) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/run_projection/properties/roster_slot_ids:minItems` | s18525 | S \ F (20884) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/run_projection/properties/roster_slot_ids:uniqueItems` | s18524 | S \ F (20884) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/run_projection:required:target_hashes` | s18538 | S \ F (20884) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/run_projection/properties/target_hashes:type` | s18539 | S \ F (20884) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/run_projection:required:lifecycle_status` | s18521 | S \ F (20884) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/run_projection/properties/lifecycle_status:enum` | s17198, s17213, s18522 | S \ F (20882) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/run_projection:required:lifecycle_seq` | s18518 | S \ F (20884) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/run_projection/properties/lifecycle_seq:type` | s18520 | S \ F (20884) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/run_projection/properties/lifecycle_seq:minimum` | s18519 | S \ F (20884) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/run_projection:required:terminal` | s18540 | S \ F (20884) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/run_projection/properties/terminal:anyOf` | s17207–s17210, s18541 | S \ F (20880) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/run_projection:required:last_message_sequence` | s18515 | S \ F (20884) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/run_projection/properties/last_message_sequence:type` | s18517 | S \ F (20884) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/run_projection/properties/last_message_sequence:minimum` | s18516 | S \ F (20884) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/run_projection:required:artifact_count` | s18499 | S \ F (20884) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/run_projection/properties/artifact_count:type` | s18501 | S \ F (20884) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/run_projection/properties/artifact_count:minimum` | s18500 | S \ F (20884) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/run_projection:required:finalized_artifact_version_ref` | s18508 | S \ F (20884) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/run_projection/properties/finalized_artifact_version_ref:anyOf` | s18509 | S \ F (20884) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/run_projection:required:synthesized_plan` | s18536 | S \ F (20884) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/run_projection/properties/synthesized_plan:anyOf` | s18537 | S \ F (20884) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/run_projection:required:waived_slot_ids` | s18543 | S \ F (20884) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/run_projection/properties/waived_slot_ids:type` | s18544 | S \ F (20884) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/run_projection:required:stale_target_accepted` | s18534 | S \ F (20884) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/run_projection/properties/stale_target_accepted:type` | s18535 | S \ F (20884) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/run_projection:required:last_applied_event_id` | s18513 | S \ F (20884) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/event_id:type` | s17999, s18514 | S \ F (20883) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/event_id:lexical` | s159, s666, s668, s16082, s16085, s16342–s16343, s16345, s16640, s16642, s17197, s17209, s18511–s18512, s20874 | S \ F (20870) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/run_projection:additionalProperties` | s17212, s18502 | S \ F (20883) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/participant_projection:required:schema_id` | s18176 | S \ F (20884) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/participant_projection/properties/schema_id:const` | s16349, s18177 | S \ F (20883) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/participant_projection:required:schema_version` | s18178 | S \ F (20884) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/participant_projection/properties/schema_version:const` | s16350, s18179 | S \ F (20883) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/participant_projection:required:publication_id` | s18173 | S \ F (20884) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/participant_projection:required:scope_partition` | s18180 | S \ F (20884) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/participant_projection:required:collaboration_run_id` | s18168 | S \ F (20884) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/participant_projection:required:participant_slot_id` | s18172 | S \ F (20884) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/participant_projection:required:additive_role_kind` | s18160 | S \ F (20884) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/participant_projection/properties/additive_role_kind:anyOf` | s16339, s16353, s18161 | S \ F (20882) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/participant_projection:required:required` | s18174 | S \ F (20884) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/participant_projection/properties/required:type` | s18175 | S \ F (20884) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/participant_projection:required:assignment_revision` | s18162 | S \ F (20884) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/participant_projection/properties/assignment_revision:type` | s18164 | S \ F (20884) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/participant_projection/properties/assignment_revision:minimum` | s18163 | S \ F (20884) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/participant_projection:required:attempts` | s18165 | S \ F (20884) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/participant_projection/properties/attempts:type` | s18166 | S \ F (20884) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/participant_projection:required:slot_outcome` | s18181 | S \ F (20884) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/participant_projection/properties/slot_outcome:anyOf` | s16352, s18182 | S \ F (20883) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/participant_projection:required:last_message_id` | s18170 | S \ F (20884) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/participant_projection/properties/last_message_id:anyOf` | s16346, s18171 | S \ F (20883) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/participant_projection:required:last_applied_event_id` | s18169 | S \ F (20884) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/participant_projection:additionalProperties` | s18167 | S \ F (20884) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/definition_projection:required:schema_id` | s17791 | S \ F (20884) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/definition_projection/properties/schema_id:const` | s672, s17792 | S \ F (20883) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/definition_projection:required:schema_version` | s17793 | S \ F (20884) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/definition_projection/properties/schema_version:const` | s673, s17794 | S \ F (20883) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/definition_projection:required:publication_id` | s17790 | S \ F (20884) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/definition_projection:required:scope_partition` | s17795 | S \ F (20884) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/definition_projection:required:collaboration_id` | s17783 | S \ F (20884) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/definition_projection:required:kind` | s17785 | S \ F (20884) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/definition_projection:required:thread_id` | s17796 | S \ F (20884) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/definition_projection:required:latest_definition_revision` | s17787 | S \ F (20884) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/definition_projection/properties/latest_definition_revision:type` | s17789 | S \ F (20884) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/definition_projection/properties/latest_definition_revision:minimum` | s17788 | S \ F (20884) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/definition_projection:required:created_event_id` | s17784 | S \ F (20884) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/definition_projection:required:last_applied_event_id` | s17786 | S \ F (20884) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/definition_projection:additionalProperties` | s17782 | S \ F (20884) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/artifact_projection:required:schema_id` | s17392 | S \ F (20884) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/artifact_projection/properties/schema_id:const` | s164, s17393 | S \ F (20883) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/artifact_projection:required:schema_version` | s17394 | S \ F (20884) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/artifact_projection/properties/schema_version:const` | s165, s17395 | S \ F (20883) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/artifact_projection:required:publication_id` | s17391 | S \ F (20884) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/artifact_projection:required:scope_partition` | s17396 | S \ F (20884) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/artifact_projection:required:collaboration_run_id` | s17388 | S \ F (20884) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/artifact_projection:required:artifact_ref` | s17384 | S \ F (20884) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/non_secret_ref:type` | s17385, s18509 | S \ F (20883) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/non_secret_ref:lexical` | s160–s161, s167, s17381–s17383 | S \ F (20879) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/artifact_projection:required:artifact_version_ref` | s17386 | S \ F (20884) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/artifact_projection:required:added_by_kind` | s17379 | S \ F (20884) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/artifact_projection:required:added_by_id` | s17378 | S \ F (20884) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/artifact_projection:required:added_event_id` | s17380 | S \ F (20884) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/artifact_projection:required:finalized` | s17389 | S \ F (20884) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/artifact_projection/properties/finalized:type` | s17390 | S \ F (20884) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/artifact_projection:additionalProperties` | s17387 | S \ F (20884) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/proposal_projection:required:schema_id` | s18440 | S \ F (20884) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/proposal_projection/properties/schema_id:const` | s16646, s18441 | S \ F (20883) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/proposal_projection:required:schema_version` | s18442 | S \ F (20884) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/proposal_projection/properties/schema_version:const` | s16647, s18443 | S \ F (20883) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/proposal_projection:required:publication_id` | s18439 | S \ F (20884) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/proposal_projection:required:scope_partition` | s18444 | S \ F (20884) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/proposal_projection:required:collaboration_run_id` | s18429 | S \ F (20884) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/proposal_projection:required:proposal_id` | s18435 | S \ F (20884) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/proposal_projection:required:participant_slot_id` | s18434 | S \ F (20884) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/proposal_projection:required:proposal_round` | s18436 | S \ F (20884) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/proposal_projection/properties/proposal_round:type` | s18438 | S \ F (20884) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/proposal_projection/properties/proposal_round:minimum` | s18437 | S \ F (20884) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/proposal_projection:required:blind_round` | s18426 | S \ F (20884) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/proposal_projection/properties/blind_round:type` | s18427 | S \ F (20884) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/proposal_projection:required:support_count` | s18445 | S \ F (20884) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/proposal_projection/properties/support_count:type` | s18447 | S \ F (20884) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/proposal_projection/properties/support_count:minimum` | s18446 | S \ F (20884) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/proposal_projection:required:oppose_count` | s18431 | S \ F (20884) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/proposal_projection/properties/oppose_count:type` | s18433 | S \ F (20884) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/proposal_projection/properties/oppose_count:minimum` | s18432 | S \ F (20884) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/proposal_projection:required:abstain_count` | s18422 | S \ F (20884) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/proposal_projection/properties/abstain_count:type` | s18424 | S \ F (20884) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/proposal_projection/properties/abstain_count:minimum` | s18423 | S \ F (20884) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/proposal_projection:required:added_event_id` | s18425 | S \ F (20884) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/proposal_projection:required:last_applied_event_id` | s18430 | S \ F (20884) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/proposal_projection:additionalProperties` | s16649, s18428 | S \ F (20883) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/vote_projection:required:schema_id` | s20014 | S \ F (20884) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/vote_projection/properties/schema_id:const` | s20015, s20881 | S \ F (20883) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/vote_projection:required:schema_version` | s20016 | S \ F (20884) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/vote_projection/properties/schema_version:const` | s20017, s20882 | S \ F (20883) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/vote_projection:required:publication_id` | s20013 | S \ F (20884) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/vote_projection:required:scope_partition` | s20018 | S \ F (20884) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/vote_projection:required:collaboration_run_id` | s20007 | S \ F (20884) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/vote_projection:required:vote_id` | s20019 | S \ F (20884) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/vote_projection:required:proposal_id` | s20012 | S \ F (20884) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/vote_projection:required:participant_slot_id` | s20010 | S \ F (20884) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/vote_projection:required:attempt_id` | s20005 | S \ F (20884) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/vote_projection:required:position` | s20011 | S \ F (20884) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/vote_projection:required:counted` | s20008 | S \ F (20884) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/vote_projection/properties/counted:type` | s20009 | S \ F (20884) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/vote_projection:required:added_event_id` | s20004 | S \ F (20884) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/vote_projection:additionalProperties` | s20006, s20885 | S \ F (20883) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/finding_projection:required:schema_id` | s18006 | S \ F (20884) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/finding_projection/properties/schema_id:const` | s16089, s18007 | S \ F (20883) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/finding_projection:required:schema_version` | s18008 | S \ F (20884) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/finding_projection/properties/schema_version:const` | s16090, s18009 | S \ F (20883) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/finding_projection:required:publication_id` | s18005 | S \ F (20884) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/finding_projection:required:scope_partition` | s18010 | S \ F (20884) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/finding_projection:required:collaboration_run_id` | s17993 | S \ F (20884) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/finding_projection:required:finding_id` | s18003 | S \ F (20884) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/finding_projection:required:finding_key` | s18004 | S \ F (20884) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/finding_projection:required:severity` | s18011 | S \ F (20884) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/finding_projection:required:target_hashes` | s18013 | S \ F (20884) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/finding_projection/properties/target_hashes:type` | s18014 | S \ F (20884) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/finding_projection/properties/target_hashes:minItems` | s18012 | S \ F (20884) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/finding_projection:required:disposition` | s17996 | S \ F (20884) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/finding_projection/properties/disposition:anyOf` | s16084, s17997 | S \ F (20883) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/finding_projection:required:confidence` | s17994 | S \ F (20884) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/finding_projection/properties/confidence:type` | s17995 | S \ F (20884) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/finding_projection:required:dissent_count` | s18000 | S \ F (20884) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/finding_projection/properties/dissent_count:type` | s18002 | S \ F (20884) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/finding_projection/properties/dissent_count:minimum` | s18001 | S \ F (20884) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/finding_projection:required:added_event_id` | s17991 | S \ F (20884) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/finding_projection:required:dispositioned_event_id` | s17998 | S \ F (20884) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/finding_projection/properties/dispositioned_event_id:anyOf` | s16085, s17999 | S \ F (20883) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/finding_projection:additionalProperties` | s16094, s17992 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_created_project:required:schema_id` | s19104 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_created_project/properties/schema_id:const` | s19105 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_created_project:required:schema_version` | s19106 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_created_project/properties/schema_version:const` | s19107 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_created_project:required:storage_instance_id` | s19119 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_created_project/properties/storage_instance_id:type` | s19120 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_created_project/properties/storage_instance_id:lexical` | s19117–s19118 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_created_project:required:recovery_epoch` | s19101 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_created_project/properties/recovery_epoch:type` | s19103 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_created_project/properties/recovery_epoch:minimum` | s19102 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_created_project:required:scope_partition` | s19109 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_created_project/properties/scope_partition:type` | s19110 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_created_project/properties/scope_partition:lexical` | s19108 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_created_project:required:event_type` | s19091 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_created_project/properties/event_type:const` | s19092 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_created_project:required:owner_record_ref` | s19099 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_created_project:required:owner_record` | s19097 | S \ F (20884) |
| `schema:Plans/collaborative_workflows_contracts.schema.json#/$defs/CollaborativeDefinition:type` | s19098 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_created_project:required:owner_record_sha256` | s19100 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_created_project:required:slot_requirements` | s19115 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_created_project/properties/slot_requirements:type` | s19116 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_created_project/properties/slot_requirements:uniqueItems` | s19114 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_created_project:required:semantic_body` | s19111 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_created:type` | s19112 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_created_project:required:semantic_sha256` | s19113 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_created_project:required:owner_operation_id` | s19095 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_created_project/properties/owner_operation_id:type` | s19096 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_created_project/properties/owner_operation_id:lexical` | s19093–s19094 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_created_project:required:event_id` | s19089 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_created_project/properties/event_id:type` | s19090 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_created_project/properties/event_id:lexical` | s19087–s19088 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_created_project:additionalProperties` | s19084, s20047 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_created_application:required:schema_id` | s19067 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_created_application/properties/schema_id:const` | s19068 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_created_application:required:schema_version` | s19069 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_created_application/properties/schema_version:const` | s19070 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_created_application:required:storage_instance_id` | s19082 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_created_application/properties/storage_instance_id:type` | s19083 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_created_application/properties/storage_instance_id:lexical` | s19080–s19081 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_created_application:required:recovery_epoch` | s19064 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_created_application/properties/recovery_epoch:type` | s19066 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_created_application/properties/recovery_epoch:minimum` | s19065 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_created_application:required:scope_partition` | s19072 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_created_application/properties/scope_partition:type` | s19073 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_created_application/properties/scope_partition:lexical` | s19071 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_created_application:required:event_type` | s19054 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_created_application/properties/event_type:const` | s19055 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_created_application:required:owner_record_ref` | s19062 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_created_application:required:owner_record` | s19060 | S \ F (20884) |
| `schema:Plans/application_workflow_contracts.schema.json#/$defs/CollaborationDefinitionApplicationV1:type` | s19061 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_created_application:required:owner_record_sha256` | s19063 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_created_application:required:slot_requirements` | s19078 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_created_application/properties/slot_requirements:type` | s19079 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_created_application/properties/slot_requirements:uniqueItems` | s19077 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_created_application:required:semantic_body` | s19074 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_created_application:type` | s19075 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_created_application:required:semantic_sha256` | s19076 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_created_application:required:owner_operation_id` | s19058 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_created_application/properties/owner_operation_id:type` | s19059 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_created_application/properties/owner_operation_id:lexical` | s19056–s19057 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_created_application:required:event_id` | s19052 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_created_application/properties/event_id:type` | s19053 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_created_application/properties/event_id:lexical` | s19050–s19051 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_created_application:additionalProperties` | s19047, s20044 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_started_project:required:schema_id` | s19603 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_started_project/properties/schema_id:const` | s19604 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_started_project:required:schema_version` | s19605 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_started_project/properties/schema_version:const` | s19606 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_started_project:required:storage_instance_id` | s19618 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_started_project/properties/storage_instance_id:type` | s19619 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_started_project/properties/storage_instance_id:lexical` | s19616–s19617 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_started_project:required:recovery_epoch` | s19600 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_started_project/properties/recovery_epoch:type` | s19602 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_started_project/properties/recovery_epoch:minimum` | s19601 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_started_project:required:scope_partition` | s19608 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_started_project/properties/scope_partition:type` | s19609 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_started_project/properties/scope_partition:lexical` | s19607 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_started_project:required:event_type` | s19590 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_started_project/properties/event_type:const` | s19591 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_started_project:required:owner_record_ref` | s19598 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_started_project:required:owner_record` | s19596 | S \ F (20884) |
| `schema:Plans/collaborative_workflows_contracts.schema.json#/$defs/CollaborativeRun:type` | s19597 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_started_project:required:owner_record_sha256` | s19599 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_started_project:required:slot_requirements` | s19614 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_started_project/properties/slot_requirements:type` | s19615 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_started_project/properties/slot_requirements:uniqueItems` | s19613 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_started_project:required:semantic_body` | s19610 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_started:type` | s19611 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_started_project:required:semantic_sha256` | s19612 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_started_project:required:owner_operation_id` | s19594 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_started_project/properties/owner_operation_id:type` | s19595 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_started_project/properties/owner_operation_id:lexical` | s19592–s19593 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_started_project:required:event_id` | s19588 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_started_project/properties/event_id:type` | s19589 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_started_project/properties/event_id:lexical` | s19586–s19587 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_started_project:additionalProperties` | s19583, s20073, s20077 | S \ F (20882) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_started_application:required:schema_id` | s19566 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_started_application/properties/schema_id:const` | s19567 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_started_application:required:schema_version` | s19568 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_started_application/properties/schema_version:const` | s19569 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_started_application:required:storage_instance_id` | s19581 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_started_application/properties/storage_instance_id:type` | s19582 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_started_application/properties/storage_instance_id:lexical` | s19579–s19580 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_started_application:required:recovery_epoch` | s19563 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_started_application/properties/recovery_epoch:type` | s19565 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_started_application/properties/recovery_epoch:minimum` | s19564 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_started_application:required:scope_partition` | s19571 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_started_application/properties/scope_partition:type` | s19572 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_started_application/properties/scope_partition:lexical` | s19570 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_started_application:required:event_type` | s19553 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_started_application/properties/event_type:const` | s19554 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_started_application:required:owner_record_ref` | s19561 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_started_application:required:owner_record` | s19559 | S \ F (20884) |
| `schema:Plans/application_workflow_contracts.schema.json#/$defs/CollaborationRunApplicationV1:type` | s19560 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_started_application:required:owner_record_sha256` | s19562 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_started_application:required:slot_requirements` | s19577 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_started_application/properties/slot_requirements:type` | s19578 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_started_application/properties/slot_requirements:uniqueItems` | s19576 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_started_application:required:semantic_body` | s19573 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_started_application:type` | s19574 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_started_application:required:semantic_sha256` | s19575 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_started_application:required:owner_operation_id` | s19557 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_started_application/properties/owner_operation_id:type` | s19558 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_started_application/properties/owner_operation_id:lexical` | s19555–s19556 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_started_application:required:event_id` | s19551 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_started_application/properties/event_id:type` | s19552 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_started_application/properties/event_id:lexical` | s19549–s19550 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_started_application:additionalProperties` | s19546, s20070, s20074 | S \ F (20882) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_paused_project:required:schema_id` | s19460 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_paused_project/properties/schema_id:const` | s19461 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_paused_project:required:schema_version` | s19462 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_paused_project/properties/schema_version:const` | s19463 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_paused_project:required:storage_instance_id` | s19474 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_paused_project/properties/storage_instance_id:type` | s19475 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_paused_project/properties/storage_instance_id:lexical` | s19472–s19473 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_paused_project:required:recovery_epoch` | s19457 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_paused_project/properties/recovery_epoch:type` | s19459 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_paused_project/properties/recovery_epoch:minimum` | s19458 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_paused_project:required:scope_partition` | s19465 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_paused_project/properties/scope_partition:type` | s19466 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_paused_project/properties/scope_partition:lexical` | s19464 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_paused_project:required:event_type` | s19448 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_paused_project/properties/event_type:const` | s19449 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_paused_project:required:owner_record_ref` | s19455 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_paused_project:required:owner_record` | s19454 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_paused_project:required:owner_record_sha256` | s19456 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_paused_project:required:slot_requirements` | s19470 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_paused_project/properties/slot_requirements:type` | s19471 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_paused_project:required:semantic_body` | s19467 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_paused:type` | s19468 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_paused_project:required:semantic_sha256` | s19469 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_paused_project:required:owner_operation_id` | s19452 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_paused_project/properties/owner_operation_id:type` | s19453 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_paused_project/properties/owner_operation_id:lexical` | s19450–s19451 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_paused_project:required:event_id` | s19446 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_paused_project/properties/event_id:type` | s19447 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_paused_project/properties/event_id:lexical` | s19444–s19445 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_paused_project:additionalProperties` | s19441, s20065 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_paused_application:required:schema_id` | s19425 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_paused_application/properties/schema_id:const` | s19426 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_paused_application:required:schema_version` | s19427 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_paused_application/properties/schema_version:const` | s19428 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_paused_application:required:storage_instance_id` | s19439 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_paused_application/properties/storage_instance_id:type` | s19440 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_paused_application/properties/storage_instance_id:lexical` | s19437–s19438 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_paused_application:required:recovery_epoch` | s19422 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_paused_application/properties/recovery_epoch:type` | s19424 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_paused_application/properties/recovery_epoch:minimum` | s19423 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_paused_application:required:scope_partition` | s19430 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_paused_application/properties/scope_partition:type` | s19431 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_paused_application/properties/scope_partition:lexical` | s19429 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_paused_application:required:event_type` | s19413 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_paused_application/properties/event_type:const` | s19414 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_paused_application:required:owner_record_ref` | s19420 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_paused_application:required:owner_record` | s19419 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_paused_application:required:owner_record_sha256` | s19421 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_paused_application:required:slot_requirements` | s19435 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_paused_application/properties/slot_requirements:type` | s19436 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_paused_application:required:semantic_body` | s19432 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_paused_application:type` | s19433 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_paused_application:required:semantic_sha256` | s19434 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_paused_application:required:owner_operation_id` | s19417 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_paused_application/properties/owner_operation_id:type` | s19418 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_paused_application/properties/owner_operation_id:lexical` | s19415–s19416 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_paused_application:required:event_id` | s19411 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_paused_application/properties/event_id:type` | s19412 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_paused_application/properties/event_id:lexical` | s19409–s19410 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_paused_application:additionalProperties` | s19406, s20062 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_resumed_project:required:schema_id` | s19530 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_resumed_project/properties/schema_id:const` | s19531 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_resumed_project:required:schema_version` | s19532 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_resumed_project/properties/schema_version:const` | s19533 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_resumed_project:required:storage_instance_id` | s19544 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_resumed_project/properties/storage_instance_id:type` | s19545 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_resumed_project/properties/storage_instance_id:lexical` | s19542–s19543 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_resumed_project:required:recovery_epoch` | s19527 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_resumed_project/properties/recovery_epoch:type` | s19529 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_resumed_project/properties/recovery_epoch:minimum` | s19528 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_resumed_project:required:scope_partition` | s19535 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_resumed_project/properties/scope_partition:type` | s19536 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_resumed_project/properties/scope_partition:lexical` | s19534 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_resumed_project:required:event_type` | s19518 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_resumed_project/properties/event_type:const` | s19519 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_resumed_project:required:owner_record_ref` | s19525 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_resumed_project:required:owner_record` | s19524 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_resumed_project:required:owner_record_sha256` | s19526 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_resumed_project:required:slot_requirements` | s19540 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_resumed_project/properties/slot_requirements:type` | s19541 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_resumed_project:required:semantic_body` | s19537 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_resumed:type` | s19538 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_resumed_project:required:semantic_sha256` | s19539 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_resumed_project:required:owner_operation_id` | s19522 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_resumed_project/properties/owner_operation_id:type` | s19523 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_resumed_project/properties/owner_operation_id:lexical` | s19520–s19521 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_resumed_project:required:event_id` | s19516 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_resumed_project/properties/event_id:type` | s19517 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_resumed_project/properties/event_id:lexical` | s19514–s19515 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_resumed_project:additionalProperties` | s19511, s20069 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_resumed_application:required:schema_id` | s19495 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_resumed_application/properties/schema_id:const` | s19496 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_resumed_application:required:schema_version` | s19497 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_resumed_application/properties/schema_version:const` | s19498 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_resumed_application:required:storage_instance_id` | s19509 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_resumed_application/properties/storage_instance_id:type` | s19510 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_resumed_application/properties/storage_instance_id:lexical` | s19507–s19508 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_resumed_application:required:recovery_epoch` | s19492 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_resumed_application/properties/recovery_epoch:type` | s19494 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_resumed_application/properties/recovery_epoch:minimum` | s19493 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_resumed_application:required:scope_partition` | s19500 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_resumed_application/properties/scope_partition:type` | s19501 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_resumed_application/properties/scope_partition:lexical` | s19499 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_resumed_application:required:event_type` | s19483 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_resumed_application/properties/event_type:const` | s19484 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_resumed_application:required:owner_record_ref` | s19490 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_resumed_application:required:owner_record` | s19489 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_resumed_application:required:owner_record_sha256` | s19491 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_resumed_application:required:slot_requirements` | s19505 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_resumed_application/properties/slot_requirements:type` | s19506 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_resumed_application:required:semantic_body` | s19502 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_resumed_application:type` | s19503 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_resumed_application:required:semantic_sha256` | s19504 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_resumed_application:required:owner_operation_id` | s19487 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_resumed_application/properties/owner_operation_id:type` | s19488 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_resumed_application/properties/owner_operation_id:lexical` | s19485–s19486 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_resumed_application:required:event_id` | s19481 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_resumed_application/properties/event_id:type` | s19482 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_resumed_application/properties/event_id:lexical` | s19479–s19480 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_resumed_application:additionalProperties` | s19476, s20066 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_cancelled_project:required:schema_id` | s18889 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_cancelled_project/properties/schema_id:const` | s18890 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_cancelled_project:required:schema_version` | s18891 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_cancelled_project/properties/schema_version:const` | s18892 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_cancelled_project:required:storage_instance_id` | s18903 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_cancelled_project/properties/storage_instance_id:type` | s18904 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_cancelled_project/properties/storage_instance_id:lexical` | s18901–s18902 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_cancelled_project:required:recovery_epoch` | s18886 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_cancelled_project/properties/recovery_epoch:type` | s18888 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_cancelled_project/properties/recovery_epoch:minimum` | s18887 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_cancelled_project:required:scope_partition` | s18894 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_cancelled_project/properties/scope_partition:type` | s18895 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_cancelled_project/properties/scope_partition:lexical` | s18893 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_cancelled_project:required:event_type` | s18877 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_cancelled_project/properties/event_type:const` | s18878 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_cancelled_project:required:owner_record_ref` | s18884 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_cancelled_project:required:owner_record` | s18883 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_cancelled_project:required:owner_record_sha256` | s18885 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_cancelled_project:required:slot_requirements` | s18899 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_cancelled_project/properties/slot_requirements:type` | s18900 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_cancelled_project:required:semantic_body` | s18896 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_cancelled:type` | s18897 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_cancelled_project:required:semantic_sha256` | s18898 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_cancelled_project:required:owner_operation_id` | s18881 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_cancelled_project/properties/owner_operation_id:type` | s18882 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_cancelled_project/properties/owner_operation_id:lexical` | s18879–s18880 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_cancelled_project:required:event_id` | s18875 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_cancelled_project/properties/event_id:type` | s18876 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_cancelled_project/properties/event_id:lexical` | s18873–s18874 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_cancelled_project:additionalProperties` | s18870, s20035 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_cancelled_application:required:schema_id` | s18854 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_cancelled_application/properties/schema_id:const` | s18855 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_cancelled_application:required:schema_version` | s18856 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_cancelled_application/properties/schema_version:const` | s18857 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_cancelled_application:required:storage_instance_id` | s18868 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_cancelled_application/properties/storage_instance_id:type` | s18869 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_cancelled_application/properties/storage_instance_id:lexical` | s18866–s18867 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_cancelled_application:required:recovery_epoch` | s18851 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_cancelled_application/properties/recovery_epoch:type` | s18853 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_cancelled_application/properties/recovery_epoch:minimum` | s18852 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_cancelled_application:required:scope_partition` | s18859 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_cancelled_application/properties/scope_partition:type` | s18860 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_cancelled_application/properties/scope_partition:lexical` | s18858 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_cancelled_application:required:event_type` | s18842 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_cancelled_application/properties/event_type:const` | s18843 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_cancelled_application:required:owner_record_ref` | s18849 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_cancelled_application:required:owner_record` | s18848 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_cancelled_application:required:owner_record_sha256` | s18850 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_cancelled_application:required:slot_requirements` | s18864 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_cancelled_application/properties/slot_requirements:type` | s18865 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_cancelled_application:required:semantic_body` | s18861 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_cancelled_application:type` | s18862 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_cancelled_application:required:semantic_sha256` | s18863 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_cancelled_application:required:owner_operation_id` | s18846 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_cancelled_application/properties/owner_operation_id:type` | s18847 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_cancelled_application/properties/owner_operation_id:lexical` | s18844–s18845 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_cancelled_application:required:event_id` | s18840 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_cancelled_application/properties/event_id:type` | s18841 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_cancelled_application/properties/event_id:lexical` | s18838–s18839 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_cancelled_application:additionalProperties` | s18835, s20032 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_completed_project:required:schema_id` | s18959 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_completed_project/properties/schema_id:const` | s18960 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_completed_project:required:schema_version` | s18961 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_completed_project/properties/schema_version:const` | s18962 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_completed_project:required:storage_instance_id` | s18973 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_completed_project/properties/storage_instance_id:type` | s18974 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_completed_project/properties/storage_instance_id:lexical` | s18971–s18972 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_completed_project:required:recovery_epoch` | s18956 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_completed_project/properties/recovery_epoch:type` | s18958 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_completed_project/properties/recovery_epoch:minimum` | s18957 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_completed_project:required:scope_partition` | s18964 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_completed_project/properties/scope_partition:type` | s18965 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_completed_project/properties/scope_partition:lexical` | s18963 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_completed_project:required:event_type` | s18947 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_completed_project/properties/event_type:const` | s18948 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_completed_project:required:owner_record_ref` | s18954 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_completed_project:required:owner_record` | s18953 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_completed_project:required:owner_record_sha256` | s18955 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_completed_project:required:slot_requirements` | s18969 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_completed_project/properties/slot_requirements:type` | s18970 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_completed_project:required:semantic_body` | s18966 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_completed:type` | s18967 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_completed_project:required:semantic_sha256` | s18968 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_completed_project:required:owner_operation_id` | s18951 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_completed_project/properties/owner_operation_id:type` | s18952 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_completed_project/properties/owner_operation_id:lexical` | s18949–s18950 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_completed_project:required:event_id` | s18945 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_completed_project/properties/event_id:type` | s18946 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_completed_project/properties/event_id:lexical` | s18943–s18944 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_completed_project:additionalProperties` | s18940, s20039 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_completed_application:required:schema_id` | s18924 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_completed_application/properties/schema_id:const` | s18925 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_completed_application:required:schema_version` | s18926 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_completed_application/properties/schema_version:const` | s18927 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_completed_application:required:storage_instance_id` | s18938 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_completed_application/properties/storage_instance_id:type` | s18939 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_completed_application/properties/storage_instance_id:lexical` | s18936–s18937 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_completed_application:required:recovery_epoch` | s18921 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_completed_application/properties/recovery_epoch:type` | s18923 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_completed_application/properties/recovery_epoch:minimum` | s18922 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_completed_application:required:scope_partition` | s18929 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_completed_application/properties/scope_partition:type` | s18930 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_completed_application/properties/scope_partition:lexical` | s18928 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_completed_application:required:event_type` | s18912 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_completed_application/properties/event_type:const` | s18913 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_completed_application:required:owner_record_ref` | s18919 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_completed_application:required:owner_record` | s18918 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_completed_application:required:owner_record_sha256` | s18920 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_completed_application:required:slot_requirements` | s18934 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_completed_application/properties/slot_requirements:type` | s18935 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_completed_application:required:semantic_body` | s18931 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_completed_application:type` | s18932 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_completed_application:required:semantic_sha256` | s18933 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_completed_application:required:owner_operation_id` | s18916 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_completed_application/properties/owner_operation_id:type` | s18917 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_completed_application/properties/owner_operation_id:lexical` | s18914–s18915 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_completed_application:required:event_id` | s18910 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_completed_application/properties/event_id:type` | s18911 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_completed_application/properties/event_id:lexical` | s18908–s18909 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_completed_application:additionalProperties` | s18905, s20036 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_failed_project:required:schema_id` | s19175 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_failed_project/properties/schema_id:const` | s19176 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_failed_project:required:schema_version` | s19177 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_failed_project/properties/schema_version:const` | s19178 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_failed_project:required:storage_instance_id` | s19189 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_failed_project/properties/storage_instance_id:type` | s19190 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_failed_project/properties/storage_instance_id:lexical` | s19187–s19188 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_failed_project:required:recovery_epoch` | s19172 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_failed_project/properties/recovery_epoch:type` | s19174 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_failed_project/properties/recovery_epoch:minimum` | s19173 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_failed_project:required:scope_partition` | s19180 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_failed_project/properties/scope_partition:type` | s19181 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_failed_project/properties/scope_partition:lexical` | s19179 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_failed_project:required:event_type` | s19163 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_failed_project/properties/event_type:const` | s19164 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_failed_project:required:owner_record_ref` | s19170 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_failed_project:required:owner_record` | s19169 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_failed_project:required:owner_record_sha256` | s19171 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_failed_project:required:slot_requirements` | s19185 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_failed_project/properties/slot_requirements:type` | s19186 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_failed_project:required:semantic_body` | s19182 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_failed:type` | s19183 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_failed_project:required:semantic_sha256` | s19184 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_failed_project:required:owner_operation_id` | s19167 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_failed_project/properties/owner_operation_id:type` | s19168 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_failed_project/properties/owner_operation_id:lexical` | s19165–s19166 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_failed_project:required:event_id` | s19161 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_failed_project/properties/event_id:type` | s19162 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_failed_project/properties/event_id:lexical` | s19159–s19160 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_failed_project:additionalProperties` | s19156, s20051 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_failed_application:required:schema_id` | s19140 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_failed_application/properties/schema_id:const` | s19141 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_failed_application:required:schema_version` | s19142 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_failed_application/properties/schema_version:const` | s19143 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_failed_application:required:storage_instance_id` | s19154 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_failed_application/properties/storage_instance_id:type` | s19155 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_failed_application/properties/storage_instance_id:lexical` | s19152–s19153 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_failed_application:required:recovery_epoch` | s19137 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_failed_application/properties/recovery_epoch:type` | s19139 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_failed_application/properties/recovery_epoch:minimum` | s19138 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_failed_application:required:scope_partition` | s19145 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_failed_application/properties/scope_partition:type` | s19146 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_failed_application/properties/scope_partition:lexical` | s19144 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_failed_application:required:event_type` | s19128 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_failed_application/properties/event_type:const` | s19129 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_failed_application:required:owner_record_ref` | s19135 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_failed_application:required:owner_record` | s19134 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_failed_application:required:owner_record_sha256` | s19136 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_failed_application:required:slot_requirements` | s19150 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_failed_application/properties/slot_requirements:type` | s19151 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_failed_application:required:semantic_body` | s19147 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_failed_application:type` | s19148 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_failed_application:required:semantic_sha256` | s19149 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_failed_application:required:owner_operation_id` | s19132 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_failed_application/properties/owner_operation_id:type` | s19133 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_failed_application/properties/owner_operation_id:lexical` | s19130–s19131 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_failed_application:required:event_id` | s19126 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_failed_application/properties/event_id:type` | s19127 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_failed_application/properties/event_id:lexical` | s19124–s19125 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_failed_application:additionalProperties` | s19121, s20048 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_started_project:required:schema_id` | s19390 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_started_project/properties/schema_id:const` | s19391 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_started_project:required:schema_version` | s19392 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_started_project/properties/schema_version:const` | s19393 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_started_project:required:storage_instance_id` | s19404 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_started_project/properties/storage_instance_id:type` | s19405 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_started_project/properties/storage_instance_id:lexical` | s19402–s19403 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_started_project:required:recovery_epoch` | s19387 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_started_project/properties/recovery_epoch:type` | s19389 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_started_project/properties/recovery_epoch:minimum` | s19388 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_started_project:required:scope_partition` | s19395 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_started_project/properties/scope_partition:type` | s19396 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_started_project/properties/scope_partition:lexical` | s19394 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_started_project:required:event_type` | s19377 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_started_project/properties/event_type:const` | s19378 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_started_project:required:owner_record_ref` | s19385 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_started_project:required:owner_record` | s19383 | S \ F (20884) |
| `schema:Plans/collaborative_workflows_contracts.schema.json#/$defs/ParticipantSpec:type` | s19384 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_started_project:required:owner_record_sha256` | s19386 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_started_project:required:slot_requirements` | s19400 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_started_project/properties/slot_requirements:type` | s19401 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_started_project:required:semantic_body` | s19397 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_started:type` | s19398 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_started_project:required:semantic_sha256` | s19399 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_started_project:required:owner_operation_id` | s19381 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_started_project/properties/owner_operation_id:type` | s19382 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_started_project/properties/owner_operation_id:lexical` | s19379–s19380 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_started_project:required:event_id` | s19375 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_started_project/properties/event_id:type` | s19376 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_started_project/properties/event_id:lexical` | s19373–s19374 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_started_project:additionalProperties` | s19370, s20061 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_started_application:required:schema_id` | s19354 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_started_application/properties/schema_id:const` | s19355 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_started_application:required:schema_version` | s19356 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_started_application/properties/schema_version:const` | s19357 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_started_application:required:storage_instance_id` | s19368 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_started_application/properties/storage_instance_id:type` | s19369 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_started_application/properties/storage_instance_id:lexical` | s19366–s19367 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_started_application:required:recovery_epoch` | s19351 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_started_application/properties/recovery_epoch:type` | s19353 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_started_application/properties/recovery_epoch:minimum` | s19352 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_started_application:required:scope_partition` | s19359 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_started_application/properties/scope_partition:type` | s19360 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_started_application/properties/scope_partition:lexical` | s19358 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_started_application:required:event_type` | s19341 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_started_application/properties/event_type:const` | s19342 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_started_application:required:owner_record_ref` | s19349 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_started_application:required:owner_record` | s19347 | S \ F (20884) |
| `schema:Plans/application_workflow_contracts.schema.json#/$defs/CollaborationParticipantApplicationV1:type` | s19348 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_started_application:required:owner_record_sha256` | s19350 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_started_application:required:slot_requirements` | s19364 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_started_application/properties/slot_requirements:type` | s19365 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_started_application:required:semantic_body` | s19361 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_started_application:type` | s19362 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_started_application:required:semantic_sha256` | s19363 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_started_application:required:owner_operation_id` | s19345 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_started_application/properties/owner_operation_id:type` | s19346 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_started_application/properties/owner_operation_id:lexical` | s19343–s19344 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_started_application:required:event_id` | s19339 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_started_application/properties/event_id:type` | s19340 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_started_application/properties/event_id:lexical` | s19337–s19338 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_started_application:additionalProperties` | s19334, s20058 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_completed_project:required:schema_id` | s19318 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_completed_project/properties/schema_id:const` | s19319 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_completed_project:required:schema_version` | s19320 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_completed_project/properties/schema_version:const` | s19321 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_completed_project:required:storage_instance_id` | s19332 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_completed_project/properties/storage_instance_id:type` | s19333 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_completed_project/properties/storage_instance_id:lexical` | s19330–s19331 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_completed_project:required:recovery_epoch` | s19315 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_completed_project/properties/recovery_epoch:type` | s19317 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_completed_project/properties/recovery_epoch:minimum` | s19316 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_completed_project:required:scope_partition` | s19323 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_completed_project/properties/scope_partition:type` | s19324 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_completed_project/properties/scope_partition:lexical` | s19322 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_completed_project:required:event_type` | s19305 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_completed_project/properties/event_type:const` | s19306 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_completed_project:required:owner_record_ref` | s19313 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_completed_project:required:owner_record` | s19311 | S \ F (20884) |
| `schema:Plans/collaborative_workflows_contracts.schema.json#/$defs/ParticipantDisposition:type` | s19312 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_completed_project:required:owner_record_sha256` | s19314 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_completed_project:required:slot_requirements` | s19328 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_completed_project/properties/slot_requirements:type` | s19329 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_completed_project:required:semantic_body` | s19325 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_completed:type;Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_completed/allOf/0/then:not` | s16314, s19326 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_completed_project:required:semantic_sha256` | s19327 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_completed_project:required:owner_operation_id` | s19309 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_completed_project/properties/owner_operation_id:type` | s19310 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_completed_project/properties/owner_operation_id:lexical` | s19307–s19308 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_completed_project:required:event_id` | s19303 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_completed_project/properties/event_id:type` | s19304 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_completed_project/properties/event_id:lexical` | s19301–s19302 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_completed_project:additionalProperties` | s19298, s20057, s20079 | S \ F (20882) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_completed_application:required:schema_id` | s19282 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_completed_application/properties/schema_id:const` | s19283 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_completed_application:required:schema_version` | s19284 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_completed_application/properties/schema_version:const` | s19285 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_completed_application:required:storage_instance_id` | s19296 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_completed_application/properties/storage_instance_id:type` | s19297 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_completed_application/properties/storage_instance_id:lexical` | s19294–s19295 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_completed_application:required:recovery_epoch` | s19279 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_completed_application/properties/recovery_epoch:type` | s19281 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_completed_application/properties/recovery_epoch:minimum` | s19280 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_completed_application:required:scope_partition` | s19287 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_completed_application/properties/scope_partition:type` | s19288 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_completed_application/properties/scope_partition:lexical` | s19286 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_completed_application:required:event_type` | s19270 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_completed_application/properties/event_type:const` | s19271 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_completed_application:required:owner_record_ref` | s19277 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_completed_application:required:owner_record` | s19276 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_completed_application:required:owner_record_sha256` | s19278 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_completed_application:required:slot_requirements` | s19292 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_completed_application/properties/slot_requirements:type` | s19293 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_completed_application:required:semantic_body` | s19289 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_completed_application:type;Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_completed_application/allOf/0/then:not` | s19290 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_completed_application:required:semantic_sha256` | s19291 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_completed_application:required:owner_operation_id` | s19274 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_completed_application/properties/owner_operation_id:type` | s19275 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_completed_application/properties/owner_operation_id:lexical` | s19272–s19273 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_completed_application:required:event_id` | s19268 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_completed_application/properties/event_id:type` | s19269 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_completed_application/properties/event_id:lexical` | s19266–s19267 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_completed_application:additionalProperties` | s19263, s20056, s20078 | S \ F (20882) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_message_added_project:required:schema_id` | s19247 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_message_added_project/properties/schema_id:const` | s19248 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_message_added_project:required:schema_version` | s19249 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_message_added_project/properties/schema_version:const` | s19250 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_message_added_project:required:storage_instance_id` | s19261 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_message_added_project/properties/storage_instance_id:type` | s19262 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_message_added_project/properties/storage_instance_id:lexical` | s19259–s19260 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_message_added_project:required:recovery_epoch` | s19244 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_message_added_project/properties/recovery_epoch:type` | s19246 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_message_added_project/properties/recovery_epoch:minimum` | s19245 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_message_added_project:required:scope_partition` | s19252 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_message_added_project/properties/scope_partition:type` | s19253 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_message_added_project/properties/scope_partition:lexical` | s19251 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_message_added_project:required:event_type` | s19234 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_message_added_project/properties/event_type:const` | s19235 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_message_added_project:required:owner_record_ref` | s19242 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_message_added_project:required:owner_record` | s19240 | S \ F (20884) |
| `schema:Plans/collaborative_workflows_contracts.schema.json#/$defs/CollaborationMessage:type` | s19241 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_message_added_project:required:owner_record_sha256` | s19243 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_message_added_project:required:slot_requirements` | s19257 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_message_added_project/properties/slot_requirements:type` | s19258 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_message_added_project:required:semantic_body` | s19254 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_message_added:type;Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_message_added/allOf/0/then:not` | s16215, s19255 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_message_added_project:required:semantic_sha256` | s19256 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_message_added_project:required:owner_operation_id` | s19238 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_message_added_project/properties/owner_operation_id:type` | s19239 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_message_added_project/properties/owner_operation_id:lexical` | s19236–s19237 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_message_added_project:required:event_id` | s19232 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_message_added_project/properties/event_id:type` | s19233 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_message_added_project/properties/event_id:lexical` | s19230–s19231 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_message_added_project:additionalProperties` | s19227, s20055 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_message_added_application:required:schema_id` | s19211 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_message_added_application/properties/schema_id:const` | s19212 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_message_added_application:required:schema_version` | s19213 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_message_added_application/properties/schema_version:const` | s19214 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_message_added_application:required:storage_instance_id` | s19225 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_message_added_application/properties/storage_instance_id:type` | s19226 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_message_added_application/properties/storage_instance_id:lexical` | s19223–s19224 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_message_added_application:required:recovery_epoch` | s19208 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_message_added_application/properties/recovery_epoch:type` | s19210 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_message_added_application/properties/recovery_epoch:minimum` | s19209 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_message_added_application:required:scope_partition` | s19216 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_message_added_application/properties/scope_partition:type` | s19217 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_message_added_application/properties/scope_partition:lexical` | s19215 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_message_added_application:required:event_type` | s19198 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_message_added_application/properties/event_type:const` | s19199 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_message_added_application:required:owner_record_ref` | s19206 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_message_added_application:required:owner_record` | s19204 | S \ F (20884) |
| `schema:Plans/application_workflow_contracts.schema.json#/$defs/CollaborationMessageApplicationV1:type` | s19205 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_message_added_application:required:owner_record_sha256` | s19207 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_message_added_application:required:slot_requirements` | s19221 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_message_added_application/properties/slot_requirements:type` | s19222 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_message_added_application:required:semantic_body` | s19218 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_message_added_application:type;Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_message_added_application/allOf/0/then:not` | s19219 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_message_added_application:required:semantic_sha256` | s19220 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_message_added_application:required:owner_operation_id` | s19202 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_message_added_application/properties/owner_operation_id:type` | s19203 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_message_added_application/properties/owner_operation_id:lexical` | s19200–s19201 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_message_added_application:required:event_id` | s19196 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_message_added_application/properties/event_id:type` | s19197 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_message_added_application/properties/event_id:lexical` | s19194–s19195 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_message_added_application:additionalProperties` | s19191, s20052 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_artifact_added_project:required:schema_id` | s18819 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_artifact_added_project/properties/schema_id:const` | s18820 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_artifact_added_project:required:schema_version` | s18821 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_artifact_added_project/properties/schema_version:const` | s18822 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_artifact_added_project:required:storage_instance_id` | s18833 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_artifact_added_project/properties/storage_instance_id:type` | s18834 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_artifact_added_project/properties/storage_instance_id:lexical` | s18831–s18832 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_artifact_added_project:required:recovery_epoch` | s18816 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_artifact_added_project/properties/recovery_epoch:type` | s18818 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_artifact_added_project/properties/recovery_epoch:minimum` | s18817 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_artifact_added_project:required:scope_partition` | s18824 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_artifact_added_project/properties/scope_partition:type` | s18825 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_artifact_added_project/properties/scope_partition:lexical` | s18823 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_artifact_added_project:required:event_type` | s18807 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_artifact_added_project/properties/event_type:const` | s18808 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_artifact_added_project:required:owner_record_ref` | s18814 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_artifact_added_project:required:owner_record` | s18813 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_artifact_added_project:required:owner_record_sha256` | s18815 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_artifact_added_project:required:slot_requirements` | s18829 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_artifact_added_project/properties/slot_requirements:type` | s18830 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_artifact_added_project:required:semantic_body` | s18826 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_artifact_added:type` | s18827 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_artifact_added_project:required:semantic_sha256` | s18828 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_artifact_added_project:required:owner_operation_id` | s18811 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_artifact_added_project/properties/owner_operation_id:type` | s18812 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_artifact_added_project/properties/owner_operation_id:lexical` | s18809–s18810 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_artifact_added_project:required:event_id` | s18805 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_artifact_added_project/properties/event_id:type` | s18806 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_artifact_added_project/properties/event_id:lexical` | s18803–s18804 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_artifact_added_project:additionalProperties` | s18800, s20031 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_artifact_added_application:required:schema_id` | s18784 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_artifact_added_application/properties/schema_id:const` | s18785 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_artifact_added_application:required:schema_version` | s18786 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_artifact_added_application/properties/schema_version:const` | s18787 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_artifact_added_application:required:storage_instance_id` | s18798 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_artifact_added_application/properties/storage_instance_id:type` | s18799 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_artifact_added_application/properties/storage_instance_id:lexical` | s18796–s18797 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_artifact_added_application:required:recovery_epoch` | s18781 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_artifact_added_application/properties/recovery_epoch:type` | s18783 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_artifact_added_application/properties/recovery_epoch:minimum` | s18782 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_artifact_added_application:required:scope_partition` | s18789 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_artifact_added_application/properties/scope_partition:type` | s18790 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_artifact_added_application/properties/scope_partition:lexical` | s18788 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_artifact_added_application:required:event_type` | s18772 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_artifact_added_application/properties/event_type:const` | s18773 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_artifact_added_application:required:owner_record_ref` | s18779 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_artifact_added_application:required:owner_record` | s18778 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_artifact_added_application:required:owner_record_sha256` | s18780 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_artifact_added_application:required:slot_requirements` | s18794 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_artifact_added_application/properties/slot_requirements:type` | s18795 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_artifact_added_application:required:semantic_body` | s18791 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_artifact_added_application:type` | s18792 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_artifact_added_application:required:semantic_sha256` | s18793 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_artifact_added_application:required:owner_operation_id` | s18776 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_artifact_added_application/properties/owner_operation_id:type` | s18777 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_artifact_added_application/properties/owner_operation_id:lexical` | s18774–s18775 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_artifact_added_application:required:event_id` | s18770 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_artifact_added_application/properties/event_id:type` | s18771 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_artifact_added_application/properties/event_id:lexical` | s18768–s18769 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_artifact_added_application:additionalProperties` | s18765, s20028 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_configuration_changed_project:required:schema_id` | s19030 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_configuration_changed_project/properties/schema_id:const` | s19031 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_configuration_changed_project:required:schema_version` | s19032 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_configuration_changed_project/properties/schema_version:const` | s19033 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_configuration_changed_project:required:storage_instance_id` | s19045 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_configuration_changed_project/properties/storage_instance_id:type` | s19046 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_configuration_changed_project/properties/storage_instance_id:lexical` | s19043–s19044 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_configuration_changed_project:required:recovery_epoch` | s19027 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_configuration_changed_project/properties/recovery_epoch:type` | s19029 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_configuration_changed_project/properties/recovery_epoch:minimum` | s19028 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_configuration_changed_project:required:scope_partition` | s19035 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_configuration_changed_project/properties/scope_partition:type` | s19036 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_configuration_changed_project/properties/scope_partition:lexical` | s19034 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_configuration_changed_project:required:event_type` | s19018 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_configuration_changed_project/properties/event_type:const` | s19019 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_configuration_changed_project:required:owner_record_ref` | s19025 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_configuration_changed_project:required:owner_record` | s19024 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_configuration_changed_project:required:owner_record_sha256` | s19026 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_configuration_changed_project:required:slot_requirements` | s19041 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_configuration_changed_project/properties/slot_requirements:type` | s19042 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_configuration_changed_project/properties/slot_requirements:uniqueItems` | s19040 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_configuration_changed_project:required:semantic_body` | s19037 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_configuration_changed:type;Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_configuration_changed/allOf/0/then/allOf/0:not` | s589, s19038 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_configuration_changed_project:required:semantic_sha256` | s19039 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_configuration_changed_project:required:owner_operation_id` | s19022 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_configuration_changed_project/properties/owner_operation_id:type` | s19023 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_configuration_changed_project/properties/owner_operation_id:lexical` | s19020–s19021 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_configuration_changed_project:required:event_id` | s19016 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_configuration_changed_project/properties/event_id:type` | s19017 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_configuration_changed_project/properties/event_id:lexical` | s19014–s19015 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_configuration_changed_project:additionalProperties` | s19011, s20043 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_configuration_changed_application:required:schema_id` | s18994 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_configuration_changed_application/properties/schema_id:const` | s18995 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_configuration_changed_application:required:schema_version` | s18996 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_configuration_changed_application/properties/schema_version:const` | s18997 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_configuration_changed_application:required:storage_instance_id` | s19009 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_configuration_changed_application/properties/storage_instance_id:type` | s19010 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_configuration_changed_application/properties/storage_instance_id:lexical` | s19007–s19008 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_configuration_changed_application:required:recovery_epoch` | s18991 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_configuration_changed_application/properties/recovery_epoch:type` | s18993 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_configuration_changed_application/properties/recovery_epoch:minimum` | s18992 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_configuration_changed_application:required:scope_partition` | s18999 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_configuration_changed_application/properties/scope_partition:type` | s19000 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_configuration_changed_application/properties/scope_partition:lexical` | s18998 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_configuration_changed_application:required:event_type` | s18982 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_configuration_changed_application/properties/event_type:const` | s18983 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_configuration_changed_application:required:owner_record_ref` | s18989 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_configuration_changed_application:required:owner_record` | s18988 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_configuration_changed_application:required:owner_record_sha256` | s18990 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_configuration_changed_application:required:slot_requirements` | s19005 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_configuration_changed_application/properties/slot_requirements:type` | s19006 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_configuration_changed_application/properties/slot_requirements:uniqueItems` | s19004 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_configuration_changed_application:required:semantic_body` | s19001 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_configuration_changed_application:type;Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_configuration_changed_application/allOf/0/then/allOf/0:not` | s19002 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_configuration_changed_application:required:semantic_sha256` | s19003 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_configuration_changed_application:required:owner_operation_id` | s18986 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_configuration_changed_application/properties/owner_operation_id:type` | s18987 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_configuration_changed_application/properties/owner_operation_id:lexical` | s18984–s18985 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_configuration_changed_application:required:event_id` | s18980 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_configuration_changed_application/properties/event_id:type` | s18981 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_configuration_changed_application/properties/event_id:lexical` | s18978–s18979 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_configuration_changed_application:additionalProperties` | s18975, s20040 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_proposal_added_project:required:schema_id` | s18674 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_proposal_added_project/properties/schema_id:const` | s18675 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_proposal_added_project:required:schema_version` | s18676 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_proposal_added_project/properties/schema_version:const` | s18677 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_proposal_added_project:required:storage_instance_id` | s18688 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_proposal_added_project/properties/storage_instance_id:type` | s18689 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_proposal_added_project/properties/storage_instance_id:lexical` | s18686–s18687 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_proposal_added_project:required:recovery_epoch` | s18671 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_proposal_added_project/properties/recovery_epoch:type` | s18673 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_proposal_added_project/properties/recovery_epoch:minimum` | s18672 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_proposal_added_project:required:scope_partition` | s18679 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_proposal_added_project/properties/scope_partition:type` | s18680 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_proposal_added_project/properties/scope_partition:lexical` | s18678 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_proposal_added_project:required:event_type` | s18659 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_proposal_added_project/properties/event_type:const` | s18660 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_proposal_added_project:required:owner_record_ref` | s18667 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_proposal_added_project:required:owner_record` | s18665 | S \ F (20884) |
| `schema:Plans/collaborative_workflows_contracts.schema.json#/$defs/BrainstormProposal:type` | s18666 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_proposal_added_project:required:owner_record_sha256` | s18668 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_proposal_added_project:required:slot_requirements` | s18684 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_proposal_added_project/properties/slot_requirements:type` | s18685 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_proposal_added_project:required:semantic_body` | s18681 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_proposal_added:type` | s18682 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_proposal_added_project:required:semantic_sha256` | s18683 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_proposal_added_project:required:owner_operation_id` | s18663 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_proposal_added_project/properties/owner_operation_id:type` | s18664 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_proposal_added_project/properties/owner_operation_id:lexical` | s18661–s18662 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_proposal_added_project:required:event_id` | s18657 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_proposal_added_project/properties/event_id:type` | s18658 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_proposal_added_project/properties/event_id:lexical` | s18655–s18656 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_proposal_added_project:additionalProperties` | s18652, s20025 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_proposal_added_application:required:schema_id` | s18636 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_proposal_added_application/properties/schema_id:const` | s18637 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_proposal_added_application:required:schema_version` | s18638 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_proposal_added_application/properties/schema_version:const` | s18639 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_proposal_added_application:required:storage_instance_id` | s18650 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_proposal_added_application/properties/storage_instance_id:type` | s18651 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_proposal_added_application/properties/storage_instance_id:lexical` | s18648–s18649 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_proposal_added_application:required:recovery_epoch` | s18633 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_proposal_added_application/properties/recovery_epoch:type` | s18635 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_proposal_added_application/properties/recovery_epoch:minimum` | s18634 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_proposal_added_application:required:scope_partition` | s18641 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_proposal_added_application/properties/scope_partition:type` | s18642 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_proposal_added_application/properties/scope_partition:lexical` | s18640 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_proposal_added_application:required:event_type` | s18622 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_proposal_added_application/properties/event_type:const` | s18623 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_proposal_added_application:required:owner_record_ref` | s18629 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_proposal_added_application:required:owner_record` | s18628 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_proposal_added_application:required:owner_record_sha256` | s18630 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_proposal_added_application:required:slot_requirements` | s18646 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_proposal_added_application/properties/slot_requirements:type` | s18647 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_proposal_added_application:required:semantic_body` | s18643 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_proposal_added_application:type` | s18644 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_proposal_added_application:required:semantic_sha256` | s18645 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_proposal_added_application:required:owner_operation_id` | s18626 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_proposal_added_application/properties/owner_operation_id:type` | s18627 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_proposal_added_application/properties/owner_operation_id:lexical` | s18624–s18625 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_proposal_added_application:required:event_id` | s18620 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_proposal_added_application/properties/event_id:type` | s18621 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_proposal_added_application/properties/event_id:lexical` | s18618–s18619 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_proposal_added_application:additionalProperties` | s18615, s20024 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_vote_added_project:required:schema_id` | s18749 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_vote_added_project/properties/schema_id:const` | s18750 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_vote_added_project:required:schema_version` | s18751 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_vote_added_project/properties/schema_version:const` | s18752 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_vote_added_project:required:storage_instance_id` | s18763 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_vote_added_project/properties/storage_instance_id:type` | s18764 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_vote_added_project/properties/storage_instance_id:lexical` | s18761–s18762 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_vote_added_project:required:recovery_epoch` | s18746 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_vote_added_project/properties/recovery_epoch:type` | s18748 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_vote_added_project/properties/recovery_epoch:minimum` | s18747 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_vote_added_project:required:scope_partition` | s18754 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_vote_added_project/properties/scope_partition:type` | s18755 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_vote_added_project/properties/scope_partition:lexical` | s18753 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_vote_added_project:required:event_type` | s18734 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_vote_added_project/properties/event_type:const` | s18735 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_vote_added_project:required:owner_record_ref` | s18742 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_vote_added_project:required:owner_record` | s18740 | S \ F (20884) |
| `schema:Plans/collaborative_workflows_contracts.schema.json#/$defs/BrainstormVote:type` | s18741 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_vote_added_project:required:owner_record_sha256` | s18743 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_vote_added_project:required:slot_requirements` | s18759 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_vote_added_project/properties/slot_requirements:type` | s18760 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_vote_added_project:required:semantic_body` | s18756 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_vote_added:type` | s18757 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_vote_added_project:required:semantic_sha256` | s18758 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_vote_added_project:required:owner_operation_id` | s18738 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_vote_added_project/properties/owner_operation_id:type` | s18739 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_vote_added_project/properties/owner_operation_id:lexical` | s18736–s18737 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_vote_added_project:required:event_id` | s18732 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_vote_added_project/properties/event_id:type` | s18733 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_vote_added_project/properties/event_id:lexical` | s18730–s18731 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_vote_added_project:additionalProperties` | s18727, s20027 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_vote_added_application:required:schema_id` | s18711 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_vote_added_application/properties/schema_id:const` | s18712 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_vote_added_application:required:schema_version` | s18713 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_vote_added_application/properties/schema_version:const` | s18714 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_vote_added_application:required:storage_instance_id` | s18725 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_vote_added_application/properties/storage_instance_id:type` | s18726 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_vote_added_application/properties/storage_instance_id:lexical` | s18723–s18724 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_vote_added_application:required:recovery_epoch` | s18708 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_vote_added_application/properties/recovery_epoch:type` | s18710 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_vote_added_application/properties/recovery_epoch:minimum` | s18709 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_vote_added_application:required:scope_partition` | s18716 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_vote_added_application/properties/scope_partition:type` | s18717 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_vote_added_application/properties/scope_partition:lexical` | s18715 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_vote_added_application:required:event_type` | s18697 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_vote_added_application/properties/event_type:const` | s18698 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_vote_added_application:required:owner_record_ref` | s18704 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_vote_added_application:required:owner_record` | s18703 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_vote_added_application:required:owner_record_sha256` | s18705 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_vote_added_application:required:slot_requirements` | s18721 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_vote_added_application/properties/slot_requirements:type` | s18722 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_vote_added_application:required:semantic_body` | s18718 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_vote_added_application:type` | s18719 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_vote_added_application:required:semantic_sha256` | s18720 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_vote_added_application:required:owner_operation_id` | s18701 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_vote_added_application/properties/owner_operation_id:type` | s18702 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_vote_added_application/properties/owner_operation_id:lexical` | s18699–s18700 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_vote_added_application:required:event_id` | s18695 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_vote_added_application/properties/event_id:type` | s18696 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_vote_added_application/properties/event_id:lexical` | s18693–s18694 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_vote_added_application:additionalProperties` | s18690, s20026 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_plan_synthesized_project:required:schema_id` | s18599 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_plan_synthesized_project/properties/schema_id:const` | s18600 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_plan_synthesized_project:required:schema_version` | s18601 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_plan_synthesized_project/properties/schema_version:const` | s18602 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_plan_synthesized_project:required:storage_instance_id` | s18613 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_plan_synthesized_project/properties/storage_instance_id:type` | s18614 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_plan_synthesized_project/properties/storage_instance_id:lexical` | s18611–s18612 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_plan_synthesized_project:required:recovery_epoch` | s18596 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_plan_synthesized_project/properties/recovery_epoch:type` | s18598 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_plan_synthesized_project/properties/recovery_epoch:minimum` | s18597 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_plan_synthesized_project:required:scope_partition` | s18604 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_plan_synthesized_project/properties/scope_partition:type` | s18605 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_plan_synthesized_project/properties/scope_partition:lexical` | s18603 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_plan_synthesized_project:required:event_type` | s18587 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_plan_synthesized_project/properties/event_type:const` | s18588 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_plan_synthesized_project:required:owner_record_ref` | s18594 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_plan_synthesized_project:required:owner_record` | s18593 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_plan_synthesized_project:required:owner_record_sha256` | s18595 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_plan_synthesized_project:required:slot_requirements` | s18609 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_plan_synthesized_project/properties/slot_requirements:type` | s18610 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_plan_synthesized_project:required:semantic_body` | s18606 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_plan_synthesized:type` | s18607 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_plan_synthesized_project:required:semantic_sha256` | s18608 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_plan_synthesized_project:required:owner_operation_id` | s18591 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_plan_synthesized_project/properties/owner_operation_id:type` | s18592 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_plan_synthesized_project/properties/owner_operation_id:lexical` | s18589–s18590 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_plan_synthesized_project:required:event_id` | s18585 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_plan_synthesized_project/properties/event_id:type` | s18586 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_plan_synthesized_project/properties/event_id:lexical` | s18583–s18584 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_plan_synthesized_project:additionalProperties` | s18580, s20023 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_plan_synthesized_application:required:schema_id` | s18564 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_plan_synthesized_application/properties/schema_id:const` | s18565 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_plan_synthesized_application:required:schema_version` | s18566 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_plan_synthesized_application/properties/schema_version:const` | s18567 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_plan_synthesized_application:required:storage_instance_id` | s18578 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_plan_synthesized_application/properties/storage_instance_id:type` | s18579 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_plan_synthesized_application/properties/storage_instance_id:lexical` | s18576–s18577 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_plan_synthesized_application:required:recovery_epoch` | s18561 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_plan_synthesized_application/properties/recovery_epoch:type` | s18563 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_plan_synthesized_application/properties/recovery_epoch:minimum` | s18562 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_plan_synthesized_application:required:scope_partition` | s18569 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_plan_synthesized_application/properties/scope_partition:type` | s18570 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_plan_synthesized_application/properties/scope_partition:lexical` | s18568 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_plan_synthesized_application:required:event_type` | s18552 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_plan_synthesized_application/properties/event_type:const` | s18553 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_plan_synthesized_application:required:owner_record_ref` | s18559 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_plan_synthesized_application:required:owner_record` | s18558 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_plan_synthesized_application:required:owner_record_sha256` | s18560 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_plan_synthesized_application:required:slot_requirements` | s18574 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_plan_synthesized_application/properties/slot_requirements:type` | s18575 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_plan_synthesized_application:required:semantic_body` | s18571 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_plan_synthesized_application:type` | s18572 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_plan_synthesized_application:required:semantic_sha256` | s18573 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_plan_synthesized_application:required:owner_operation_id` | s18556 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_plan_synthesized_application/properties/owner_operation_id:type` | s18557 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_plan_synthesized_application/properties/owner_operation_id:lexical` | s18554–s18555 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_plan_synthesized_application:required:event_id` | s18550 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_plan_synthesized_application/properties/event_id:type` | s18551 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_plan_synthesized_application/properties/event_id:lexical` | s18548–s18549 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_plan_synthesized_application:additionalProperties` | s18545, s20020 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_added_project:required:schema_id` | s19757 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_added_project/properties/schema_id:const` | s19758 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_added_project:required:schema_version` | s19759 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_added_project/properties/schema_version:const` | s19760 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_added_project:required:storage_instance_id` | s19771 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_added_project/properties/storage_instance_id:type` | s19772 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_added_project/properties/storage_instance_id:lexical` | s19769–s19770 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_added_project:required:recovery_epoch` | s19754 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_added_project/properties/recovery_epoch:type` | s19756 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_added_project/properties/recovery_epoch:minimum` | s19755 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_added_project:required:scope_partition` | s19762 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_added_project/properties/scope_partition:type` | s19763 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_added_project/properties/scope_partition:lexical` | s19761 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_added_project:required:event_type` | s19744 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_added_project/properties/event_type:const` | s19745 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_added_project:required:owner_record_ref` | s19752 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_added_project:required:owner_record` | s19750 | S \ F (20884) |
| `schema:Plans/collaborative_workflows_contracts.schema.json#/$defs/ReviewFinding:type` | s19751 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_added_project:required:owner_record_sha256` | s19753 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_added_project:required:slot_requirements` | s19767 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_added_project/properties/slot_requirements:type` | s19768 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_added_project:required:semantic_body` | s19764 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_added:type` | s19765 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_added_project:required:semantic_sha256` | s19766 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_added_project:required:owner_operation_id` | s19748 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_added_project/properties/owner_operation_id:type` | s19749 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_added_project/properties/owner_operation_id:lexical` | s19746–s19747 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_added_project:required:event_id` | s19742 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_added_project/properties/event_id:type` | s19743 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_added_project/properties/event_id:lexical` | s19740–s19741 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_added_project:additionalProperties` | s19737, s20085 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_added_application:required:schema_id` | s19721 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_added_application/properties/schema_id:const` | s19722 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_added_application:required:schema_version` | s19723 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_added_application/properties/schema_version:const` | s19724 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_added_application:required:storage_instance_id` | s19735 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_added_application/properties/storage_instance_id:type` | s19736 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_added_application/properties/storage_instance_id:lexical` | s19733–s19734 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_added_application:required:recovery_epoch` | s19718 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_added_application/properties/recovery_epoch:type` | s19720 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_added_application/properties/recovery_epoch:minimum` | s19719 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_added_application:required:scope_partition` | s19726 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_added_application/properties/scope_partition:type` | s19727 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_added_application/properties/scope_partition:lexical` | s19725 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_added_application:required:event_type` | s19709 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_added_application/properties/event_type:const` | s19710 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_added_application:required:owner_record_ref` | s19716 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_added_application:required:owner_record` | s19715 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_added_application:required:owner_record_sha256` | s19717 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_added_application:required:slot_requirements` | s19731 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_added_application/properties/slot_requirements:type` | s19732 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_added_application:required:semantic_body` | s19728 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_added_application:type` | s19729 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_added_application:required:semantic_sha256` | s19730 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_added_application:required:owner_operation_id` | s19713 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_added_application/properties/owner_operation_id:type` | s19714 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_added_application/properties/owner_operation_id:lexical` | s19711–s19712 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_added_application:required:event_id` | s19707 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_added_application/properties/event_id:type` | s19708 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_added_application/properties/event_id:lexical` | s19705–s19706 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_added_application:additionalProperties` | s19702, s20084 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_dispositioned_project:required:schema_id` | s19827 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_dispositioned_project/properties/schema_id:const` | s19828 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_dispositioned_project:required:schema_version` | s19829 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_dispositioned_project/properties/schema_version:const` | s19830 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_dispositioned_project:required:storage_instance_id` | s19841 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_dispositioned_project/properties/storage_instance_id:type` | s19842 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_dispositioned_project/properties/storage_instance_id:lexical` | s19839–s19840 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_dispositioned_project:required:recovery_epoch` | s19824 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_dispositioned_project/properties/recovery_epoch:type` | s19826 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_dispositioned_project/properties/recovery_epoch:minimum` | s19825 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_dispositioned_project:required:scope_partition` | s19832 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_dispositioned_project/properties/scope_partition:type` | s19833 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_dispositioned_project/properties/scope_partition:lexical` | s19831 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_dispositioned_project:required:event_type` | s19815 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_dispositioned_project/properties/event_type:const` | s19816 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_dispositioned_project:required:owner_record_ref` | s19822 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_dispositioned_project:required:owner_record` | s19821 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_dispositioned_project:required:owner_record_sha256` | s19823 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_dispositioned_project:required:slot_requirements` | s19837 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_dispositioned_project/properties/slot_requirements:type` | s19838 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_dispositioned_project:required:semantic_body` | s19834 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_dispositioned:type` | s19835 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_dispositioned_project:required:semantic_sha256` | s19836 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_dispositioned_project:required:owner_operation_id` | s19819 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_dispositioned_project/properties/owner_operation_id:type` | s19820 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_dispositioned_project/properties/owner_operation_id:lexical` | s19817–s19818 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_dispositioned_project:required:event_id` | s19813 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_dispositioned_project/properties/event_id:type` | s19814 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_dispositioned_project/properties/event_id:lexical` | s19811–s19812 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_dispositioned_project:additionalProperties` | s19808, s20087 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_dispositioned_application:required:schema_id` | s19792 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_dispositioned_application/properties/schema_id:const` | s19793 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_dispositioned_application:required:schema_version` | s19794 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_dispositioned_application/properties/schema_version:const` | s19795 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_dispositioned_application:required:storage_instance_id` | s19806 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_dispositioned_application/properties/storage_instance_id:type` | s19807 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_dispositioned_application/properties/storage_instance_id:lexical` | s19804–s19805 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_dispositioned_application:required:recovery_epoch` | s19789 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_dispositioned_application/properties/recovery_epoch:type` | s19791 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_dispositioned_application/properties/recovery_epoch:minimum` | s19790 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_dispositioned_application:required:scope_partition` | s19797 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_dispositioned_application/properties/scope_partition:type` | s19798 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_dispositioned_application/properties/scope_partition:lexical` | s19796 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_dispositioned_application:required:event_type` | s19780 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_dispositioned_application/properties/event_type:const` | s19781 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_dispositioned_application:required:owner_record_ref` | s19787 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_dispositioned_application:required:owner_record` | s19786 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_dispositioned_application:required:owner_record_sha256` | s19788 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_dispositioned_application:required:slot_requirements` | s19802 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_dispositioned_application/properties/slot_requirements:type` | s19803 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_dispositioned_application:required:semantic_body` | s19799 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_dispositioned_application:type` | s19800 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_dispositioned_application:required:semantic_sha256` | s19801 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_dispositioned_application:required:owner_operation_id` | s19784 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_dispositioned_application/properties/owner_operation_id:type` | s19785 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_dispositioned_application/properties/owner_operation_id:lexical` | s19782–s19783 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_dispositioned_application:required:event_id` | s19778 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_dispositioned_application/properties/event_id:type` | s19779 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_dispositioned_application/properties/event_id:lexical` | s19776–s19777 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_dispositioned_application:additionalProperties` | s19773, s20086 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_artifact_finalized_project:required:schema_id` | s19686 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_artifact_finalized_project/properties/schema_id:const` | s19687 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_artifact_finalized_project:required:schema_version` | s19688 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_artifact_finalized_project/properties/schema_version:const` | s19689 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_artifact_finalized_project:required:storage_instance_id` | s19700 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_artifact_finalized_project/properties/storage_instance_id:type` | s19701 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_artifact_finalized_project/properties/storage_instance_id:lexical` | s19698–s19699 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_artifact_finalized_project:required:recovery_epoch` | s19683 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_artifact_finalized_project/properties/recovery_epoch:type` | s19685 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_artifact_finalized_project/properties/recovery_epoch:minimum` | s19684 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_artifact_finalized_project:required:scope_partition` | s19691 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_artifact_finalized_project/properties/scope_partition:type` | s19692 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_artifact_finalized_project/properties/scope_partition:lexical` | s19690 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_artifact_finalized_project:required:event_type` | s19674 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_artifact_finalized_project/properties/event_type:const` | s19675 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_artifact_finalized_project:required:owner_record_ref` | s19681 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_artifact_finalized_project:required:owner_record` | s19680 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_artifact_finalized_project:required:owner_record_sha256` | s19682 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_artifact_finalized_project:required:slot_requirements` | s19696 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_artifact_finalized_project/properties/slot_requirements:type` | s19697 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_artifact_finalized_project:required:semantic_body` | s19693 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized:type` | s19694 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_artifact_finalized_project:required:semantic_sha256` | s19695 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_artifact_finalized_project:required:owner_operation_id` | s19678 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_artifact_finalized_project/properties/owner_operation_id:type` | s19679 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_artifact_finalized_project/properties/owner_operation_id:lexical` | s19676–s19677 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_artifact_finalized_project:required:event_id` | s19672 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_artifact_finalized_project/properties/event_id:type` | s19673 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_artifact_finalized_project/properties/event_id:lexical` | s19670–s19671 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_artifact_finalized_project:additionalProperties` | s19667, s20083 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_artifact_finalized_application:required:schema_id` | s19651 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_artifact_finalized_application/properties/schema_id:const` | s19652 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_artifact_finalized_application:required:schema_version` | s19653 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_artifact_finalized_application/properties/schema_version:const` | s19654 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_artifact_finalized_application:required:storage_instance_id` | s19665 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_artifact_finalized_application/properties/storage_instance_id:type` | s19666 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_artifact_finalized_application/properties/storage_instance_id:lexical` | s19663–s19664 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_artifact_finalized_application:required:recovery_epoch` | s19648 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_artifact_finalized_application/properties/recovery_epoch:type` | s19650 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_artifact_finalized_application/properties/recovery_epoch:minimum` | s19649 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_artifact_finalized_application:required:scope_partition` | s19656 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_artifact_finalized_application/properties/scope_partition:type` | s19657 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_artifact_finalized_application/properties/scope_partition:lexical` | s19655 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_artifact_finalized_application:required:event_type` | s19639 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_artifact_finalized_application/properties/event_type:const` | s19640 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_artifact_finalized_application:required:owner_record_ref` | s19646 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_artifact_finalized_application:required:owner_record` | s19645 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_artifact_finalized_application:required:owner_record_sha256` | s19647 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_artifact_finalized_application:required:slot_requirements` | s19661 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_artifact_finalized_application/properties/slot_requirements:type` | s19662 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_artifact_finalized_application:required:semantic_body` | s19658 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized_application:type` | s19659 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_artifact_finalized_application:required:semantic_sha256` | s19660 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_artifact_finalized_application:required:owner_operation_id` | s19643 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_artifact_finalized_application/properties/owner_operation_id:type` | s19644 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_artifact_finalized_application/properties/owner_operation_id:lexical` | s19641–s19642 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_artifact_finalized_application:required:event_id` | s19637 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_artifact_finalized_application/properties/event_id:type` | s19638 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_artifact_finalized_application/properties/event_id:lexical` | s19635–s19636 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_artifact_finalized_application:additionalProperties` | s19632, s20080 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_proposal_added_project:required:participant_identity` | s18669 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_proposal_added_project/properties/participant_identity:type` | s2583, s18670 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_proposal_added_application:required:participant_identity` | s18631 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_proposal_added_application/properties/participant_identity:type` | s2561, s18632 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_vote_added_project:required:participant_identity` | s18744 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_vote_added_project/properties/participant_identity:type` | s2627, s18745 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_vote_added_application:required:participant_identity` | s18706 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_vote_added_application/properties/participant_identity:type` | s2605, s18707 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_started_project/allOf/0/then:required:review_target_pack` | s19626 | S \ F (20884) |
| `schema:Plans/collaborative_workflows_contracts.schema.json#/$defs/ReviewTargetPack:type` | s3013, s3054, s19623, s19627 | S \ F (20881) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_started_application/allOf/0/then:required:review_target_pack` | s19622 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_created_project:required:envelope_metadata` | s19085 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_created_project/properties/envelope_metadata:type` | s2779, s19086 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_created_application:required:envelope_metadata` | s19048 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_created_application/properties/envelope_metadata:type` | s2764, s19049 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_started_project:required:envelope_metadata` | s19584, s19624 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_started_project/properties/envelope_metadata:type` | s2989, s3045, s19585, s19625 | S \ F (20881) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_started_application:required:envelope_metadata` | s19547, s19620 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_started_application/properties/envelope_metadata:type` | s2974, s3004, s19548, s19621 | S \ F (20881) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_paused_project:required:envelope_metadata` | s19442 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_paused_project/properties/envelope_metadata:type` | s2929, s19443 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_paused_application:required:envelope_metadata` | s19407 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_paused_application/properties/envelope_metadata:type` | s2914, s19408 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_resumed_project:required:envelope_metadata` | s19512 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_resumed_project/properties/envelope_metadata:type` | s2959, s19513 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_resumed_application:required:envelope_metadata` | s19477 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_resumed_application/properties/envelope_metadata:type` | s2944, s19478 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_cancelled_project:required:envelope_metadata` | s18871 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_cancelled_project/properties/envelope_metadata:type` | s2689, s18872 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_cancelled_application:required:envelope_metadata` | s18836 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_cancelled_application/properties/envelope_metadata:type` | s2674, s18837 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_completed_project:required:envelope_metadata` | s18941 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_completed_project/properties/envelope_metadata:type` | s2719, s18942 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_completed_application:required:envelope_metadata` | s18906 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_completed_application/properties/envelope_metadata:type` | s2704, s18907 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_failed_project:required:envelope_metadata` | s19157 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_failed_project/properties/envelope_metadata:type` | s2809, s19158 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_failed_application:required:envelope_metadata` | s19122 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_failed_application/properties/envelope_metadata:type` | s2794, s19123 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_started_project:required:envelope_metadata` | s19371 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_started_project/properties/envelope_metadata:type` | s2899, s19372 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_started_application:required:envelope_metadata` | s19335 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_started_application/properties/envelope_metadata:type` | s2884, s19336 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_completed_project:required:envelope_metadata` | s19299, s19630 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_completed_project/properties/envelope_metadata:type` | s2869, s3101, s19300, s19631 | S \ F (20881) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_completed_application:required:envelope_metadata` | s19264, s19628 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_completed_application/properties/envelope_metadata:type` | s2854, s3086, s19265, s19629 | S \ F (20881) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_message_added_project:required:envelope_metadata` | s19228 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_message_added_project/properties/envelope_metadata:type` | s2839, s19229 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_message_added_application:required:envelope_metadata` | s19192 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_message_added_application/properties/envelope_metadata:type` | s2824, s19193 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_artifact_added_project:required:envelope_metadata` | s18801 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_artifact_added_project/properties/envelope_metadata:type` | s2659, s18802 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_artifact_added_application:required:envelope_metadata` | s18766 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_artifact_added_application/properties/envelope_metadata:type` | s2644, s18767 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_configuration_changed_project:required:envelope_metadata` | s19012 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_configuration_changed_project/properties/envelope_metadata:type` | s2749, s19013 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_configuration_changed_application:required:envelope_metadata` | s18976 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_configuration_changed_application/properties/envelope_metadata:type` | s2734, s18977 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_proposal_added_project:required:envelope_metadata` | s18653 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_proposal_added_project/properties/envelope_metadata:type` | s2578, s18654 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_proposal_added_application:required:envelope_metadata` | s18616 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_proposal_added_application/properties/envelope_metadata:type` | s2556, s18617 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_vote_added_project:required:envelope_metadata` | s18728 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_vote_added_project/properties/envelope_metadata:type` | s2622, s18729 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_vote_added_application:required:envelope_metadata` | s18691 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_vote_added_application/properties/envelope_metadata:type` | s2600, s18692 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_plan_synthesized_project:required:envelope_metadata` | s18581 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_plan_synthesized_project/properties/envelope_metadata:type` | s2541, s18582 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_plan_synthesized_application:required:envelope_metadata` | s18546 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_plan_synthesized_application/properties/envelope_metadata:type` | s2526, s18547 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_added_project:required:envelope_metadata` | s19738 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_added_project/properties/envelope_metadata:type` | s3161, s19739 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_added_application:required:envelope_metadata` | s19703 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_added_application/properties/envelope_metadata:type` | s3146, s19704 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_dispositioned_project:required:envelope_metadata` | s19809 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_dispositioned_project/properties/envelope_metadata:type` | s3191, s19810 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_dispositioned_application:required:envelope_metadata` | s19774 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_dispositioned_application/properties/envelope_metadata:type` | s3176, s19775 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_artifact_finalized_project:required:envelope_metadata` | s19668 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_artifact_finalized_project/properties/envelope_metadata:type` | s3131, s19669 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_artifact_finalized_application:required:envelope_metadata` | s19633 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_artifact_finalized_application/properties/envelope_metadata:type` | s3116, s19634 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_created_project/properties/envelope_metadata/properties/actor_ref:type` | s2770–s2771 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_created_project/properties/envelope_metadata/properties/actor_ref:lexical` | s2769 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_created_project/properties/envelope_metadata/properties/correlation_id:type` | s2775–s2776 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_created_project/properties/envelope_metadata/properties/correlation_id:lexical` | s2774 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_created_project/properties/envelope_metadata/properties/causation_event_id:anyOf` | s2772–s2773 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_created_project/properties/envelope_metadata/properties/parent_event_id:anyOf` | s2780–s2781 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_created_project/properties/envelope_metadata/properties/requested_account_ref:anyOf` | s2782–s2783 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_created_project/properties/envelope_metadata/properties/effective_account_ref:anyOf` | s2777–s2778 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_created_application/properties/envelope_metadata/properties/actor_ref:type` | s2755–s2756 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_created_application/properties/envelope_metadata/properties/actor_ref:lexical` | s2754 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_created_application/properties/envelope_metadata/properties/correlation_id:type` | s2760–s2761 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_created_application/properties/envelope_metadata/properties/correlation_id:lexical` | s2759 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_created_application/properties/envelope_metadata/properties/causation_event_id:anyOf` | s2757–s2758 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_created_application/properties/envelope_metadata/properties/parent_event_id:anyOf` | s2765–s2766 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_created_application/properties/envelope_metadata/properties/requested_account_ref:anyOf` | s2767–s2768 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_created_application/properties/envelope_metadata/properties/effective_account_ref:anyOf` | s2762–s2763 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_started_project/properties/envelope_metadata/properties/actor_ref:type` | s2980–s2981, s3036–s3037 | S \ F (20881) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_started_project/properties/envelope_metadata/properties/actor_ref:lexical` | s2979, s3035 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_started_project/properties/envelope_metadata/properties/correlation_id:type` | s2985–s2986, s3041–s3042 | S \ F (20881) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_started_project/properties/envelope_metadata/properties/correlation_id:lexical` | s2984, s3040 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_started_project/properties/envelope_metadata/properties/causation_event_id:anyOf` | s2982–s2983, s3038–s3039 | S \ F (20881) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_started_project/properties/envelope_metadata/properties/parent_event_id:anyOf` | s2990–s2991, s3046–s3047 | S \ F (20881) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_started_project/properties/envelope_metadata/properties/requested_account_ref:anyOf` | s2992–s2993, s3048–s3049 | S \ F (20881) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_started_project/properties/envelope_metadata/properties/effective_account_ref:anyOf` | s2987–s2988, s3043–s3044 | S \ F (20881) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_started_application/properties/envelope_metadata/properties/actor_ref:type` | s2965–s2966, s2995–s2996 | S \ F (20881) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_started_application/properties/envelope_metadata/properties/actor_ref:lexical` | s2964, s2994 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_started_application/properties/envelope_metadata/properties/correlation_id:type` | s2970–s2971, s3000–s3001 | S \ F (20881) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_started_application/properties/envelope_metadata/properties/correlation_id:lexical` | s2969, s2999 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_started_application/properties/envelope_metadata/properties/causation_event_id:anyOf` | s2967–s2968, s2997–s2998 | S \ F (20881) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_started_application/properties/envelope_metadata/properties/parent_event_id:anyOf` | s2975–s2976, s3005–s3006 | S \ F (20881) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_started_application/properties/envelope_metadata/properties/requested_account_ref:anyOf` | s2977–s2978, s3007–s3008 | S \ F (20881) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_started_application/properties/envelope_metadata/properties/effective_account_ref:anyOf` | s2972–s2973, s3002–s3003 | S \ F (20881) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_paused_project/properties/envelope_metadata/properties/actor_ref:type` | s2920–s2921 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_paused_project/properties/envelope_metadata/properties/actor_ref:lexical` | s2919 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_paused_project/properties/envelope_metadata/properties/correlation_id:type` | s2925–s2926 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_paused_project/properties/envelope_metadata/properties/correlation_id:lexical` | s2924 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_paused_project/properties/envelope_metadata/properties/causation_event_id:anyOf` | s2922–s2923 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_paused_project/properties/envelope_metadata/properties/parent_event_id:anyOf` | s2930–s2931 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_paused_project/properties/envelope_metadata/properties/requested_account_ref:anyOf` | s2932–s2933 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_paused_project/properties/envelope_metadata/properties/effective_account_ref:anyOf` | s2927–s2928 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_paused_application/properties/envelope_metadata/properties/actor_ref:type` | s2905–s2906 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_paused_application/properties/envelope_metadata/properties/actor_ref:lexical` | s2904 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_paused_application/properties/envelope_metadata/properties/correlation_id:type` | s2910–s2911 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_paused_application/properties/envelope_metadata/properties/correlation_id:lexical` | s2909 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_paused_application/properties/envelope_metadata/properties/causation_event_id:anyOf` | s2907–s2908 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_paused_application/properties/envelope_metadata/properties/parent_event_id:anyOf` | s2915–s2916 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_paused_application/properties/envelope_metadata/properties/requested_account_ref:anyOf` | s2917–s2918 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_paused_application/properties/envelope_metadata/properties/effective_account_ref:anyOf` | s2912–s2913 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_resumed_project/properties/envelope_metadata/properties/actor_ref:type` | s2950–s2951 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_resumed_project/properties/envelope_metadata/properties/actor_ref:lexical` | s2949 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_resumed_project/properties/envelope_metadata/properties/correlation_id:type` | s2955–s2956 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_resumed_project/properties/envelope_metadata/properties/correlation_id:lexical` | s2954 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_resumed_project/properties/envelope_metadata/properties/causation_event_id:anyOf` | s2952–s2953 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_resumed_project/properties/envelope_metadata/properties/parent_event_id:anyOf` | s2960–s2961 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_resumed_project/properties/envelope_metadata/properties/requested_account_ref:anyOf` | s2962–s2963 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_resumed_project/properties/envelope_metadata/properties/effective_account_ref:anyOf` | s2957–s2958 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_resumed_application/properties/envelope_metadata/properties/actor_ref:type` | s2935–s2936 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_resumed_application/properties/envelope_metadata/properties/actor_ref:lexical` | s2934 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_resumed_application/properties/envelope_metadata/properties/correlation_id:type` | s2940–s2941 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_resumed_application/properties/envelope_metadata/properties/correlation_id:lexical` | s2939 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_resumed_application/properties/envelope_metadata/properties/causation_event_id:anyOf` | s2937–s2938 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_resumed_application/properties/envelope_metadata/properties/parent_event_id:anyOf` | s2945–s2946 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_resumed_application/properties/envelope_metadata/properties/requested_account_ref:anyOf` | s2947–s2948 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_resumed_application/properties/envelope_metadata/properties/effective_account_ref:anyOf` | s2942–s2943 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_cancelled_project/properties/envelope_metadata/properties/actor_ref:type` | s2680–s2681 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_cancelled_project/properties/envelope_metadata/properties/actor_ref:lexical` | s2679 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_cancelled_project/properties/envelope_metadata/properties/correlation_id:type` | s2685–s2686 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_cancelled_project/properties/envelope_metadata/properties/correlation_id:lexical` | s2684 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_cancelled_project/properties/envelope_metadata/properties/causation_event_id:anyOf` | s2682–s2683 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_cancelled_project/properties/envelope_metadata/properties/parent_event_id:anyOf` | s2690–s2691 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_cancelled_project/properties/envelope_metadata/properties/requested_account_ref:anyOf` | s2692–s2693 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_cancelled_project/properties/envelope_metadata/properties/effective_account_ref:anyOf` | s2687–s2688 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_cancelled_application/properties/envelope_metadata/properties/actor_ref:type` | s2665–s2666 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_cancelled_application/properties/envelope_metadata/properties/actor_ref:lexical` | s2664 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_cancelled_application/properties/envelope_metadata/properties/correlation_id:type` | s2670–s2671 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_cancelled_application/properties/envelope_metadata/properties/correlation_id:lexical` | s2669 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_cancelled_application/properties/envelope_metadata/properties/causation_event_id:anyOf` | s2667–s2668 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_cancelled_application/properties/envelope_metadata/properties/parent_event_id:anyOf` | s2675–s2676 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_cancelled_application/properties/envelope_metadata/properties/requested_account_ref:anyOf` | s2677–s2678 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_cancelled_application/properties/envelope_metadata/properties/effective_account_ref:anyOf` | s2672–s2673 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_completed_project/properties/envelope_metadata/properties/actor_ref:type` | s2710–s2711 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_completed_project/properties/envelope_metadata/properties/actor_ref:lexical` | s2709 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_completed_project/properties/envelope_metadata/properties/correlation_id:type` | s2715–s2716 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_completed_project/properties/envelope_metadata/properties/correlation_id:lexical` | s2714 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_completed_project/properties/envelope_metadata/properties/causation_event_id:anyOf` | s2712–s2713 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_completed_project/properties/envelope_metadata/properties/parent_event_id:anyOf` | s2720–s2721 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_completed_project/properties/envelope_metadata/properties/requested_account_ref:anyOf` | s2722–s2723 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_completed_project/properties/envelope_metadata/properties/effective_account_ref:anyOf` | s2717–s2718 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_completed_application/properties/envelope_metadata/properties/actor_ref:type` | s2695–s2696 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_completed_application/properties/envelope_metadata/properties/actor_ref:lexical` | s2694 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_completed_application/properties/envelope_metadata/properties/correlation_id:type` | s2700–s2701 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_completed_application/properties/envelope_metadata/properties/correlation_id:lexical` | s2699 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_completed_application/properties/envelope_metadata/properties/causation_event_id:anyOf` | s2697–s2698 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_completed_application/properties/envelope_metadata/properties/parent_event_id:anyOf` | s2705–s2706 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_completed_application/properties/envelope_metadata/properties/requested_account_ref:anyOf` | s2707–s2708 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_completed_application/properties/envelope_metadata/properties/effective_account_ref:anyOf` | s2702–s2703 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_failed_project/properties/envelope_metadata/properties/actor_ref:type` | s2800–s2801 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_failed_project/properties/envelope_metadata/properties/actor_ref:lexical` | s2799 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_failed_project/properties/envelope_metadata/properties/correlation_id:type` | s2805–s2806 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_failed_project/properties/envelope_metadata/properties/correlation_id:lexical` | s2804 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_failed_project/properties/envelope_metadata/properties/causation_event_id:anyOf` | s2802–s2803 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_failed_project/properties/envelope_metadata/properties/parent_event_id:anyOf` | s2810–s2811 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_failed_project/properties/envelope_metadata/properties/requested_account_ref:anyOf` | s2812–s2813 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_failed_project/properties/envelope_metadata/properties/effective_account_ref:anyOf` | s2807–s2808 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_failed_application/properties/envelope_metadata/properties/actor_ref:type` | s2785–s2786 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_failed_application/properties/envelope_metadata/properties/actor_ref:lexical` | s2784 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_failed_application/properties/envelope_metadata/properties/correlation_id:type` | s2790–s2791 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_failed_application/properties/envelope_metadata/properties/correlation_id:lexical` | s2789 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_failed_application/properties/envelope_metadata/properties/causation_event_id:anyOf` | s2787–s2788 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_failed_application/properties/envelope_metadata/properties/parent_event_id:anyOf` | s2795–s2796 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_failed_application/properties/envelope_metadata/properties/requested_account_ref:anyOf` | s2797–s2798 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_failed_application/properties/envelope_metadata/properties/effective_account_ref:anyOf` | s2792–s2793 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_started_project/properties/envelope_metadata/properties/actor_ref:type` | s2890–s2891 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_started_project/properties/envelope_metadata/properties/actor_ref:lexical` | s2889 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_started_project/properties/envelope_metadata/properties/correlation_id:type` | s2895–s2896 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_started_project/properties/envelope_metadata/properties/correlation_id:lexical` | s2894 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_started_project/properties/envelope_metadata/properties/causation_event_id:anyOf` | s2892–s2893 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_started_project/properties/envelope_metadata/properties/parent_event_id:anyOf` | s2900–s2901 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_started_project/properties/envelope_metadata/properties/requested_account_ref:anyOf` | s2902–s2903 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_started_project/properties/envelope_metadata/properties/effective_account_ref:anyOf` | s2897–s2898 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_started_application/properties/envelope_metadata/properties/actor_ref:type` | s2875–s2876 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_started_application/properties/envelope_metadata/properties/actor_ref:lexical` | s2874 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_started_application/properties/envelope_metadata/properties/correlation_id:type` | s2880–s2881 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_started_application/properties/envelope_metadata/properties/correlation_id:lexical` | s2879 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_started_application/properties/envelope_metadata/properties/causation_event_id:anyOf` | s2877–s2878 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_started_application/properties/envelope_metadata/properties/parent_event_id:anyOf` | s2885–s2886 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_started_application/properties/envelope_metadata/properties/requested_account_ref:anyOf` | s2887–s2888 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_started_application/properties/envelope_metadata/properties/effective_account_ref:anyOf` | s2882–s2883 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_completed_project/properties/envelope_metadata/properties/actor_ref:type` | s2860–s2861, s3092–s3093 | S \ F (20881) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_completed_project/properties/envelope_metadata/properties/actor_ref:lexical` | s2859, s3091 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_completed_project/properties/envelope_metadata/properties/correlation_id:type` | s2865–s2866, s3097–s3098 | S \ F (20881) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_completed_project/properties/envelope_metadata/properties/correlation_id:lexical` | s2864, s3096 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_completed_project/properties/envelope_metadata/properties/causation_event_id:anyOf` | s2862–s2863, s3094–s3095 | S \ F (20881) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_completed_project/properties/envelope_metadata/properties/parent_event_id:anyOf` | s2870–s2871, s3102–s3103 | S \ F (20881) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_completed_project/properties/envelope_metadata/properties/requested_account_ref:anyOf` | s2872–s2873, s3104–s3105 | S \ F (20881) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_completed_project/properties/envelope_metadata/properties/effective_account_ref:anyOf` | s2867–s2868, s3099–s3100 | S \ F (20881) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_completed_application/properties/envelope_metadata/properties/actor_ref:type` | s2845–s2846, s3077–s3078 | S \ F (20881) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_completed_application/properties/envelope_metadata/properties/actor_ref:lexical` | s2844, s3076 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_completed_application/properties/envelope_metadata/properties/correlation_id:type` | s2850–s2851, s3082–s3083 | S \ F (20881) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_completed_application/properties/envelope_metadata/properties/correlation_id:lexical` | s2849, s3081 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_completed_application/properties/envelope_metadata/properties/causation_event_id:anyOf` | s2847–s2848, s3079–s3080 | S \ F (20881) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_completed_application/properties/envelope_metadata/properties/parent_event_id:anyOf` | s2855–s2856, s3087–s3088 | S \ F (20881) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_completed_application/properties/envelope_metadata/properties/requested_account_ref:anyOf` | s2857–s2858, s3089–s3090 | S \ F (20881) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_completed_application/properties/envelope_metadata/properties/effective_account_ref:anyOf` | s2852–s2853, s3084–s3085 | S \ F (20881) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_message_added_project/properties/envelope_metadata/properties/actor_ref:type` | s2830–s2831 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_message_added_project/properties/envelope_metadata/properties/actor_ref:lexical` | s2829 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_message_added_project/properties/envelope_metadata/properties/correlation_id:type` | s2835–s2836 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_message_added_project/properties/envelope_metadata/properties/correlation_id:lexical` | s2834 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_message_added_project/properties/envelope_metadata/properties/causation_event_id:anyOf` | s2832–s2833 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_message_added_project/properties/envelope_metadata/properties/parent_event_id:anyOf` | s2840–s2841 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_message_added_project/properties/envelope_metadata/properties/requested_account_ref:anyOf` | s2842–s2843 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_message_added_project/properties/envelope_metadata/properties/effective_account_ref:anyOf` | s2837–s2838 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_message_added_application/properties/envelope_metadata/properties/actor_ref:type` | s2815–s2816 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_message_added_application/properties/envelope_metadata/properties/actor_ref:lexical` | s2814 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_message_added_application/properties/envelope_metadata/properties/correlation_id:type` | s2820–s2821 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_message_added_application/properties/envelope_metadata/properties/correlation_id:lexical` | s2819 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_message_added_application/properties/envelope_metadata/properties/causation_event_id:anyOf` | s2817–s2818 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_message_added_application/properties/envelope_metadata/properties/parent_event_id:anyOf` | s2825–s2826 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_message_added_application/properties/envelope_metadata/properties/requested_account_ref:anyOf` | s2827–s2828 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_message_added_application/properties/envelope_metadata/properties/effective_account_ref:anyOf` | s2822–s2823 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_artifact_added_project/properties/envelope_metadata/properties/actor_ref:type` | s2650–s2651 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_artifact_added_project/properties/envelope_metadata/properties/actor_ref:lexical` | s2649 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_artifact_added_project/properties/envelope_metadata/properties/correlation_id:type` | s2655–s2656 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_artifact_added_project/properties/envelope_metadata/properties/correlation_id:lexical` | s2654 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_artifact_added_project/properties/envelope_metadata/properties/causation_event_id:anyOf` | s2652–s2653 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_artifact_added_project/properties/envelope_metadata/properties/parent_event_id:anyOf` | s2660–s2661 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_artifact_added_project/properties/envelope_metadata/properties/requested_account_ref:anyOf` | s2662–s2663 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_artifact_added_project/properties/envelope_metadata/properties/effective_account_ref:anyOf` | s2657–s2658 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_artifact_added_application/properties/envelope_metadata/properties/actor_ref:type` | s2635–s2636 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_artifact_added_application/properties/envelope_metadata/properties/actor_ref:lexical` | s2634 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_artifact_added_application/properties/envelope_metadata/properties/correlation_id:type` | s2640–s2641 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_artifact_added_application/properties/envelope_metadata/properties/correlation_id:lexical` | s2639 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_artifact_added_application/properties/envelope_metadata/properties/causation_event_id:anyOf` | s2637–s2638 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_artifact_added_application/properties/envelope_metadata/properties/parent_event_id:anyOf` | s2645–s2646 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_artifact_added_application/properties/envelope_metadata/properties/requested_account_ref:anyOf` | s2647–s2648 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_artifact_added_application/properties/envelope_metadata/properties/effective_account_ref:anyOf` | s2642–s2643 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_configuration_changed_project/properties/envelope_metadata/properties/actor_ref:type` | s2740–s2741 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_configuration_changed_project/properties/envelope_metadata/properties/actor_ref:lexical` | s2739 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_configuration_changed_project/properties/envelope_metadata/properties/correlation_id:type` | s2745–s2746 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_configuration_changed_project/properties/envelope_metadata/properties/correlation_id:lexical` | s2744 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_configuration_changed_project/properties/envelope_metadata/properties/causation_event_id:anyOf` | s2742–s2743 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_configuration_changed_project/properties/envelope_metadata/properties/parent_event_id:anyOf` | s2750–s2751 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_configuration_changed_project/properties/envelope_metadata/properties/requested_account_ref:anyOf` | s2752–s2753 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_configuration_changed_project/properties/envelope_metadata/properties/effective_account_ref:anyOf` | s2747–s2748 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_configuration_changed_application/properties/envelope_metadata/properties/actor_ref:type` | s2725–s2726 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_configuration_changed_application/properties/envelope_metadata/properties/actor_ref:lexical` | s2724 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_configuration_changed_application/properties/envelope_metadata/properties/correlation_id:type` | s2730–s2731 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_configuration_changed_application/properties/envelope_metadata/properties/correlation_id:lexical` | s2729 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_configuration_changed_application/properties/envelope_metadata/properties/causation_event_id:anyOf` | s2727–s2728 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_configuration_changed_application/properties/envelope_metadata/properties/parent_event_id:anyOf` | s2735–s2736 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_configuration_changed_application/properties/envelope_metadata/properties/requested_account_ref:anyOf` | s2737–s2738 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_configuration_changed_application/properties/envelope_metadata/properties/effective_account_ref:anyOf` | s2732–s2733 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_proposal_added_project/properties/envelope_metadata/properties/actor_ref:type` | s2569–s2570 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_proposal_added_project/properties/envelope_metadata/properties/actor_ref:lexical` | s2568 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_proposal_added_project/properties/envelope_metadata/properties/correlation_id:type` | s2574–s2575 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_proposal_added_project/properties/envelope_metadata/properties/correlation_id:lexical` | s2573 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_proposal_added_project/properties/envelope_metadata/properties/causation_event_id:anyOf` | s2571–s2572 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_proposal_added_project/properties/envelope_metadata/properties/parent_event_id:anyOf` | s2579–s2580 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_proposal_added_project/properties/envelope_metadata/properties/requested_account_ref:anyOf` | s2581–s2582 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_proposal_added_project/properties/envelope_metadata/properties/effective_account_ref:anyOf` | s2576–s2577 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_proposal_added_application/properties/envelope_metadata/properties/actor_ref:type` | s2547–s2548 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_proposal_added_application/properties/envelope_metadata/properties/actor_ref:lexical` | s2546 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_proposal_added_application/properties/envelope_metadata/properties/correlation_id:type` | s2552–s2553 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_proposal_added_application/properties/envelope_metadata/properties/correlation_id:lexical` | s2551 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_proposal_added_application/properties/envelope_metadata/properties/causation_event_id:anyOf` | s2549–s2550 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_proposal_added_application/properties/envelope_metadata/properties/parent_event_id:anyOf` | s2557–s2558 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_proposal_added_application/properties/envelope_metadata/properties/requested_account_ref:anyOf` | s2559–s2560 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_proposal_added_application/properties/envelope_metadata/properties/effective_account_ref:anyOf` | s2554–s2555 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_vote_added_project/properties/envelope_metadata/properties/actor_ref:type` | s2613–s2614 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_vote_added_project/properties/envelope_metadata/properties/actor_ref:lexical` | s2612 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_vote_added_project/properties/envelope_metadata/properties/correlation_id:type` | s2618–s2619 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_vote_added_project/properties/envelope_metadata/properties/correlation_id:lexical` | s2617 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_vote_added_project/properties/envelope_metadata/properties/causation_event_id:anyOf` | s2615–s2616 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_vote_added_project/properties/envelope_metadata/properties/parent_event_id:anyOf` | s2623–s2624 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_vote_added_project/properties/envelope_metadata/properties/requested_account_ref:anyOf` | s2625–s2626 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_vote_added_project/properties/envelope_metadata/properties/effective_account_ref:anyOf` | s2620–s2621 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_vote_added_application/properties/envelope_metadata/properties/actor_ref:type` | s2591–s2592 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_vote_added_application/properties/envelope_metadata/properties/actor_ref:lexical` | s2590 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_vote_added_application/properties/envelope_metadata/properties/correlation_id:type` | s2596–s2597 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_vote_added_application/properties/envelope_metadata/properties/correlation_id:lexical` | s2595 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_vote_added_application/properties/envelope_metadata/properties/causation_event_id:anyOf` | s2593–s2594 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_vote_added_application/properties/envelope_metadata/properties/parent_event_id:anyOf` | s2601–s2602 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_vote_added_application/properties/envelope_metadata/properties/requested_account_ref:anyOf` | s2603–s2604 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_vote_added_application/properties/envelope_metadata/properties/effective_account_ref:anyOf` | s2598–s2599 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_plan_synthesized_project/properties/envelope_metadata/properties/actor_ref:type` | s2532–s2533 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_plan_synthesized_project/properties/envelope_metadata/properties/actor_ref:lexical` | s2531 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_plan_synthesized_project/properties/envelope_metadata/properties/correlation_id:type` | s2537–s2538 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_plan_synthesized_project/properties/envelope_metadata/properties/correlation_id:lexical` | s2536 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_plan_synthesized_project/properties/envelope_metadata/properties/causation_event_id:anyOf` | s2534–s2535 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_plan_synthesized_project/properties/envelope_metadata/properties/parent_event_id:anyOf` | s2542–s2543 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_plan_synthesized_project/properties/envelope_metadata/properties/requested_account_ref:anyOf` | s2544–s2545 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_plan_synthesized_project/properties/envelope_metadata/properties/effective_account_ref:anyOf` | s2539–s2540 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_plan_synthesized_application/properties/envelope_metadata/properties/actor_ref:type` | s2517–s2518 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_plan_synthesized_application/properties/envelope_metadata/properties/actor_ref:lexical` | s2516 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_plan_synthesized_application/properties/envelope_metadata/properties/correlation_id:type` | s2522–s2523 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_plan_synthesized_application/properties/envelope_metadata/properties/correlation_id:lexical` | s2521 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_plan_synthesized_application/properties/envelope_metadata/properties/causation_event_id:anyOf` | s2519–s2520 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_plan_synthesized_application/properties/envelope_metadata/properties/parent_event_id:anyOf` | s2527–s2528 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_plan_synthesized_application/properties/envelope_metadata/properties/requested_account_ref:anyOf` | s2529–s2530 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_plan_synthesized_application/properties/envelope_metadata/properties/effective_account_ref:anyOf` | s2524–s2525 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_added_project/properties/envelope_metadata/properties/actor_ref:type` | s3152–s3153 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_added_project/properties/envelope_metadata/properties/actor_ref:lexical` | s3151 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_added_project/properties/envelope_metadata/properties/correlation_id:type` | s3157–s3158 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_added_project/properties/envelope_metadata/properties/correlation_id:lexical` | s3156 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_added_project/properties/envelope_metadata/properties/causation_event_id:anyOf` | s3154–s3155 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_added_project/properties/envelope_metadata/properties/parent_event_id:anyOf` | s3162–s3163 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_added_project/properties/envelope_metadata/properties/requested_account_ref:anyOf` | s3164–s3165 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_added_project/properties/envelope_metadata/properties/effective_account_ref:anyOf` | s3159–s3160 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_added_application/properties/envelope_metadata/properties/actor_ref:type` | s3137–s3138 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_added_application/properties/envelope_metadata/properties/actor_ref:lexical` | s3136 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_added_application/properties/envelope_metadata/properties/correlation_id:type` | s3142–s3143 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_added_application/properties/envelope_metadata/properties/correlation_id:lexical` | s3141 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_added_application/properties/envelope_metadata/properties/causation_event_id:anyOf` | s3139–s3140 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_added_application/properties/envelope_metadata/properties/parent_event_id:anyOf` | s3147–s3148 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_added_application/properties/envelope_metadata/properties/requested_account_ref:anyOf` | s3149–s3150 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_added_application/properties/envelope_metadata/properties/effective_account_ref:anyOf` | s3144–s3145 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_dispositioned_project/properties/envelope_metadata/properties/actor_ref:type` | s3182–s3183 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_dispositioned_project/properties/envelope_metadata/properties/actor_ref:lexical` | s3181 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_dispositioned_project/properties/envelope_metadata/properties/correlation_id:type` | s3187–s3188 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_dispositioned_project/properties/envelope_metadata/properties/correlation_id:lexical` | s3186 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_dispositioned_project/properties/envelope_metadata/properties/causation_event_id:anyOf` | s3184–s3185 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_dispositioned_project/properties/envelope_metadata/properties/parent_event_id:anyOf` | s3192–s3193 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_dispositioned_project/properties/envelope_metadata/properties/requested_account_ref:anyOf` | s3194–s3195 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_dispositioned_project/properties/envelope_metadata/properties/effective_account_ref:anyOf` | s3189–s3190 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_dispositioned_application/properties/envelope_metadata/properties/actor_ref:type` | s3167–s3168 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_dispositioned_application/properties/envelope_metadata/properties/actor_ref:lexical` | s3166 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_dispositioned_application/properties/envelope_metadata/properties/correlation_id:type` | s3172–s3173 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_dispositioned_application/properties/envelope_metadata/properties/correlation_id:lexical` | s3171 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_dispositioned_application/properties/envelope_metadata/properties/causation_event_id:anyOf` | s3169–s3170 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_dispositioned_application/properties/envelope_metadata/properties/parent_event_id:anyOf` | s3177–s3178 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_dispositioned_application/properties/envelope_metadata/properties/requested_account_ref:anyOf` | s3179–s3180 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_dispositioned_application/properties/envelope_metadata/properties/effective_account_ref:anyOf` | s3174–s3175 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_artifact_finalized_project/properties/envelope_metadata/properties/actor_ref:type` | s3122–s3123 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_artifact_finalized_project/properties/envelope_metadata/properties/actor_ref:lexical` | s3121 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_artifact_finalized_project/properties/envelope_metadata/properties/correlation_id:type` | s3127–s3128 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_artifact_finalized_project/properties/envelope_metadata/properties/correlation_id:lexical` | s3126 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_artifact_finalized_project/properties/envelope_metadata/properties/causation_event_id:anyOf` | s3124–s3125 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_artifact_finalized_project/properties/envelope_metadata/properties/parent_event_id:anyOf` | s3132–s3133 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_artifact_finalized_project/properties/envelope_metadata/properties/requested_account_ref:anyOf` | s3134–s3135 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_artifact_finalized_project/properties/envelope_metadata/properties/effective_account_ref:anyOf` | s3129–s3130 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_artifact_finalized_application/properties/envelope_metadata/properties/actor_ref:type` | s3107–s3108 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_artifact_finalized_application/properties/envelope_metadata/properties/actor_ref:lexical` | s3106 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_artifact_finalized_application/properties/envelope_metadata/properties/correlation_id:type` | s3112–s3113 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_artifact_finalized_application/properties/envelope_metadata/properties/correlation_id:lexical` | s3111 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_artifact_finalized_application/properties/envelope_metadata/properties/causation_event_id:anyOf` | s3109–s3110 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_artifact_finalized_application/properties/envelope_metadata/properties/parent_event_id:anyOf` | s3117–s3118 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_artifact_finalized_application/properties/envelope_metadata/properties/requested_account_ref:anyOf` | s3119–s3120 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_artifact_finalized_application/properties/envelope_metadata/properties/effective_account_ref:anyOf` | s3114–s3115 | S \ F (20883) |
| `schema:Plans/collaborative_workflows_contracts.schema.json#/$defs/ReviewTargetPack/properties/schema_id:const` | s3016–s3018, s3057–s3059 | S \ F (20879) |
| `schema:Plans/collaborative_workflows_contracts.schema.json#/$defs/ReviewTargetPack/properties/schema_version:const` | s3019–s3021, s3060–s3062 | S \ F (20879) |
| `schema:Plans/collaborative_workflows_contracts.schema.json#/$defs/non_empty_string:type;Plans/collaborative_workflows_contracts.schema.json#/$defs/ParticipantSpec/properties/requested_provider_id:oneOf_exclusivity;Plans/collaborative_workflows_contracts.schema.json#/$defs/ParticipantSpec/properties/requested_account_id:oneOf_exclusivity;Plans/collaborative_workflows_contracts.schema.json#/$defs/ParticipantSpec/properties/requested_model_id:oneOf_exclusivity;Plans/collaborative_workflows_contracts.schema.json#/$defs/ParticipantSpec/properties/requested_persona_id/allOf/0:oneOf_exclusivity;Plans/collaborative_workflows_contracts.schema.json#/$defs/ParticipantSpec/properties/requested_tool_profile_id:oneOf_exclusivity;Plans/collaborative_workflows_contracts.schema.json#/$defs/CollaborativeRun/properties/parent_run_id:oneOf_exclusivity;Plans/collaborative_workflows_contracts.schema.json#/$defs/CollaborativeRun/properties/assistant_plan_id:oneOf_exclusivity;Plans/collaborative_workflows_contracts.schema.json#/$defs/CollaborativeRun/properties/goal_id:oneOf_exclusivity;Plans/collaborative_workflows_contracts.schema.json#/$defs/CollaborativeRun/properties/coordinator_run_ref:oneOf_exclusivity;Plans/collaborative_workflows_contracts.schema.json#/$defs/CollaborationMessage/properties/reply_to:oneOf_exclusivity;Plans/collaborative_workflows_contracts.schema.json#/$defs/ReviewFinding/properties/proposed_remediation:oneOf_exclusivity;Plans/collaborative_workflows_contracts.schema.json#/$defs/ParticipantDisposition/properties/attempt_id:oneOf_exclusivity;Plans/collaborative_workflows_contracts.schema.json#/$defs/ParticipantDisposition/properties/effective_identity:oneOf_exclusivity;Plans/collaborative_workflows_contracts.schema.json#/$defs/preset_row/properties/requested_model_id:oneOf_exclusivity;Plans/collaborative_workflows_contracts.schema.json#/$defs/preset_row/properties/requested_persona_id/allOf/0:oneOf_exclusivity;Plans/collaborative_workflows_contracts.schema.json#/$defs/CollaborationConfigureRequest/properties/causation_id:oneOf_exclusivity;Plans/collaborative_workflows_contracts.schema.json#/$defs/CollaborationConfigureRequest/properties/seed_definition_ref:oneOf_exclusivity;Plans/collaborative_workflows_contracts.schema.json#/$defs/CollaborationConfigureResult/properties/observable_work_ref:oneOf_exclusivity;Plans/collaborative_workflows_contracts.schema.json#/$defs/CollaborationConfigureResult/properties/replay_of:oneOf_exclusivity;Plans/collaborative_workflows_contracts.schema.json#/$defs/CollaborationConfigureResult/properties/collaboration_id:oneOf_exclusivity;Plans/collaborative_workflows_contracts.schema.json#/$defs/CollaborationStartRequest/properties/causation_id:oneOf_exclusivity;Plans/collaborative_workflows_contracts.schema.json#/$defs/CollaborationStartResult/properties/observable_work_ref:oneOf_exclusivity;Plans/collaborative_workflows_contracts.schema.json#/$defs/CollaborationStartResult/properties/replay_of:oneOf_exclusivity;Plans/collaborative_workflows_contracts.schema.json#/$defs/CollaborationStartResult/properties/collaboration_run_id:oneOf_exclusivity;Plans/collaborative_workflows_contracts.schema.json#/$defs/CollaborationStartResult/properties/requested_effective_snapshot_ref:oneOf_exclusivity;Plans/collaborative_workflows_contracts.schema.json#/$defs/CollaborationPauseRequest/properties/causation_id:oneOf_exclusivity;Plans/collaborative_workflows_contracts.schema.json#/$defs/CollaborationPauseResult/properties/observable_work_ref:oneOf_exclusivity;Plans/collaborative_workflows_contracts.schema.json#/$defs/CollaborationPauseResult/properties/replay_of:oneOf_exclusivity;Plans/collaborative_workflows_contracts.schema.json#/$defs/CollaborationResumeRequest/properties/causation_id:oneOf_exclusivity;Plans/collaborative_workflows_contracts.schema.json#/$defs/CollaborationResumeResult/properties/observable_work_ref:oneOf_exclusivity;Plans/collaborative_workflows_contracts.schema.json#/$defs/CollaborationResumeResult/properties/replay_of:oneOf_exclusivity;Plans/collaborative_workflows_contracts.schema.json#/$defs/CollaborationCancelRequest/properties/causation_id:oneOf_exclusivity;Plans/collaborative_workflows_contracts.schema.json#/$defs/CollaborationCancelResult/properties/observable_work_ref:oneOf_exclusivity;Plans/collaborative_workflows_contracts.schema.json#/$defs/CollaborationCancelResult/properties/replay_of:oneOf_exclusivity;Plans/collaborative_workflows_contracts.schema.json#/$defs/CollaborationMessageRequest/properties/causation_id:oneOf_exclusivity;Plans/collaborative_workflows_contracts.schema.json#/$defs/CollaborationMessageRequest/properties/reply_to:oneOf_exclusivity;Plans/collaborative_workflows_contracts.schema.json#/$defs/CollaborationMessageResult/properties/observable_work_ref:oneOf_exclusivity;Plans/collaborative_workflows_contracts.schema.json#/$defs/CollaborationMessageResult/properties/replay_of:oneOf_exclusivity;Plans/collaborative_workflows_contracts.schema.json#/$defs/CollaborationMessageResult/properties/collaboration_message_id:oneOf_exclusivity;Plans/collaborative_workflows_contracts.schema.json#/$defs/CollaborationExportRequest/properties/causation_id:oneOf_exclusivity;Plans/collaborative_workflows_contracts.schema.json#/$defs/CollaborationExportResult/properties/observable_work_ref:oneOf_exclusivity;Plans/collaborative_workflows_contracts.schema.json#/$defs/CollaborationExportResult/properties/replay_of:oneOf_exclusivity;Plans/collaborative_workflows_contracts.schema.json#/$defs/CollaborationExportResult/properties/export_ref:oneOf_exclusivity;Plans/collaborative_workflows_contracts.schema.json#/$defs/CollaborationReconfigureRequest/properties/causation_id:oneOf_exclusivity;Plans/collaborative_workflows_contracts.schema.json#/$defs/CollaborationReconfigureResult/properties/observable_work_ref:oneOf_exclusivity;Plans/collaborative_workflows_contracts.schema.json#/$defs/CollaborationReconfigureResult/properties/replay_of:oneOf_exclusivity;Plans/collaborative_workflows_contracts.schema.json#/$defs/CollaborationReconfigureResult/properties/system_message_id:oneOf_exclusivity;Plans/collaborative_workflows_contracts.schema.json#/$defs/BrainstormRoundRequest/properties/causation_id:oneOf_exclusivity;Plans/collaborative_workflows_contracts.schema.json#/$defs/BrainstormRoundResult/properties/observable_work_ref:oneOf_exclusivity;Plans/collaborative_workflows_contracts.schema.json#/$defs/BrainstormRoundResult/properties/replay_of:oneOf_exclusivity;Plans/collaborative_workflows_contracts.schema.json#/$defs/BrainstormSynthesisRequest/properties/causation_id:oneOf_exclusivity;Plans/collaborative_workflows_contracts.schema.json#/$defs/AssistantPlanCreateResult/properties/observable_work_ref:oneOf_exclusivity;Plans/collaborative_workflows_contracts.schema.json#/$defs/AssistantPlanCreateResult/properties/replay_of:oneOf_exclusivity;Plans/collaborative_workflows_contracts.schema.json#/$defs/AssistantPlanCreateResult/properties/assistant_plan_id:oneOf_exclusivity;Plans/collaborative_workflows_contracts.schema.json#/$defs/BrainstormLeadResearchRequest/properties/causation_id:oneOf_exclusivity;Plans/collaborative_workflows_contracts.schema.json#/$defs/BrainstormLeadResearchResult/properties/observable_work_ref:oneOf_exclusivity;Plans/collaborative_workflows_contracts.schema.json#/$defs/BrainstormLeadResearchResult/properties/replay_of:oneOf_exclusivity;Plans/collaborative_workflows_contracts.schema.json#/$defs/ReviewCreateTodosRequest/properties/causation_id:oneOf_exclusivity;Plans/collaborative_workflows_contracts.schema.json#/$defs/ReviewCreateTodosResult/properties/observable_work_ref:oneOf_exclusivity;Plans/collaborative_workflows_contracts.schema.json#/$defs/ReviewCreateTodosResult/properties/replay_of:oneOf_exclusivity;Plans/collaborative_workflows_contracts.schema.json#/$defs/ReviewSendFindingsRequest/properties/causation_id:oneOf_exclusivity;Plans/collaborative_workflows_contracts.schema.json#/$defs/ComposerBufferResult/properties/observable_work_ref:oneOf_exclusivity;Plans/collaborative_workflows_contracts.schema.json#/$defs/ComposerBufferResult/properties/replay_of:oneOf_exclusivity;Plans/collaborative_workflows_contracts.schema.json#/$defs/ComposerBufferResult/properties/composer_buffer_ref:oneOf_exclusivity;Plans/collaborative_workflows_contracts.schema.json#/$defs/ReviewRunAgainRequest/properties/causation_id:oneOf_exclusivity;Plans/collaborative_workflows_contracts.schema.json#/$defs/ChatRoomRoundRequest/properties/causation_id:oneOf_exclusivity;Plans/collaborative_workflows_contracts.schema.json#/$defs/ChatRoomRoundResult/properties/observable_work_ref:oneOf_exclusivity;Plans/collaborative_workflows_contracts.schema.json#/$defs/ChatRoomRoundResult/properties/replay_of:oneOf_exclusivity;Plans/collaborative_workflows_contracts.schema.json#/$defs/ChatRoomSummarizeRequest/properties/causation_id:oneOf_exclusivity;Plans/collaborative_workflows_contracts.schema.json#/$defs/ArtifactResult/properties/observable_work_ref:oneOf_exclusivity;Plans/collaborative_workflows_contracts.schema.json#/$defs/ArtifactResult/properties/replay_of:oneOf_exclusivity;Plans/collaborative_workflows_contracts.schema.json#/$defs/ArtifactResult/properties/artifact_ref:oneOf_exclusivity;Plans/collaborative_workflows_contracts.schema.json#/$defs/ChatRoomPromotePlanRequest/properties/causation_id:oneOf_exclusivity;Plans/collaborative_workflows_contracts.schema.json#/$defs/ChatRoomPromotePlanResult/properties/observable_work_ref:oneOf_exclusivity;Plans/collaborative_workflows_contracts.schema.json#/$defs/ChatRoomPromotePlanResult/properties/replay_of:oneOf_exclusivity;Plans/collaborative_workflows_contracts.schema.json#/$defs/ChatRoomPromotePlanResult/properties/assistant_plan_id:oneOf_exclusivity;Plans/collaborative_workflows_contracts.schema.json#/$defs/ChatRoomPromotePlanResult/properties/owner_reason:oneOf_exclusivity;Plans/collaborative_workflows_contracts.schema.json#/$defs/ChatRoomPromoteTodoRequest/properties/causation_id:oneOf_exclusivity;Plans/collaborative_workflows_contracts.schema.json#/$defs/ChatRoomPromoteTodoResult/properties/observable_work_ref:oneOf_exclusivity;Plans/collaborative_workflows_contracts.schema.json#/$defs/ChatRoomPromoteTodoResult/properties/replay_of:oneOf_exclusivity;Plans/collaborative_workflows_contracts.schema.json#/$defs/ChatRoomPromoteTodoResult/properties/todo_ref:oneOf_exclusivity;Plans/collaborative_workflows_contracts.schema.json#/$defs/ChatRoomPromoteTodoResult/properties/owner_reason:oneOf_exclusivity;Plans/collaborative_workflows_contracts.schema.json#/$defs/ChatRoomPromoteGoalRequest/properties/causation_id:oneOf_exclusivity;Plans/collaborative_workflows_contracts.schema.json#/$defs/ChatRoomPromoteGoalResult/properties/observable_work_ref:oneOf_exclusivity;Plans/collaborative_workflows_contracts.schema.json#/$defs/ChatRoomPromoteGoalResult/properties/replay_of:oneOf_exclusivity;Plans/collaborative_workflows_contracts.schema.json#/$defs/ChatRoomPromoteGoalResult/properties/goal_id:oneOf_exclusivity;Plans/collaborative_workflows_contracts.schema.json#/$defs/ChatRoomPromoteGoalResult/properties/owner_reason:oneOf_exclusivity;Plans/collaborative_workflows_contracts.schema.json#/$defs/ChatRoomEndRequest/properties/causation_id:oneOf_exclusivity;Plans/collaborative_workflows_contracts.schema.json#/$defs/ChatRoomEndResult/properties/observable_work_ref:oneOf_exclusivity;Plans/collaborative_workflows_contracts.schema.json#/$defs/ChatRoomEndResult/properties/replay_of:oneOf_exclusivity;Plans/collaborative_workflows_contracts.schema.json#/$defs/CrewAutoSetRequest/properties/causation_id:oneOf_exclusivity;Plans/collaborative_workflows_contracts.schema.json#/$defs/CrewAutoSetResult/properties/observable_work_ref:oneOf_exclusivity;Plans/collaborative_workflows_contracts.schema.json#/$defs/CrewAutoSetResult/properties/replay_of:oneOf_exclusivity;Plans/collaborative_workflows_contracts.schema.json#/$defs/CrewAutoSetResult/properties/settings_transaction_ref:oneOf_exclusivity;Plans/collaborative_workflows_contracts.schema.json#/$defs/WondererPass/properties/requested_by:oneOf_exclusivity;Plans/collaborative_workflows_contracts.schema.json#/$defs/WondererLead/properties/disposed_by:oneOf_exclusivity;Plans/collaborative_workflows_contracts.schema.json#/$defs/CollaborationLeadResearchRequest/properties/causation_id:oneOf_exclusivity;Plans/collaborative_workflows_contracts.schema.json#/$defs/CollaborationLeadResearchResult/properties/observable_work_ref:oneOf_exclusivity;Plans/collaborative_workflows_contracts.schema.json#/$defs/CollaborationLeadResearchResult/properties/replay_of:oneOf_exclusivity` | s3014–s3015, s3055–s3056 | S \ F (20881) |
| `schema:Plans/collaborative_workflows_contracts.schema.json#/$defs/review_target_kind:enum` | s3025–s3027, s3066–s3068 | S \ F (20879) |
| `schema:Plans/collaborative_workflows_contracts.schema.json#/$defs/ReviewTargetPack/properties/target_refs:type` | s3028–s3029, s3069–s3070 | S \ F (20881) |
| `schema:Plans/collaborative_workflows_contracts.schema.json#/$defs/ReviewTargetPack/properties/target_refs:minItems` | s3030, s3071 | S \ F (20883) |
| `schema:Plans/collaborative_workflows_contracts.schema.json#/$defs/ReviewTargetPack/properties/target_hashes:type` | s3022–s3023, s3063–s3064 | S \ F (20881) |
| `schema:Plans/collaborative_workflows_contracts.schema.json#/$defs/ReviewTargetPack/properties/target_hashes:minItems` | s3024, s3065 | S \ F (20883) |
| `schema:Plans/collaborative_workflows_contracts.schema.json#/$defs/ReviewTargetPack/properties/user_constraint_refs:type` | s3033–s3034, s3074–s3075 | S \ F (20881) |
| `schema:Plans/collaborative_workflows_contracts.schema.json#/$defs/ReviewTargetPack/properties/acceptance_refs:type` | s3009–s3010, s3050–s3051 | S \ F (20881) |
| `schema:Plans/collaborative_workflows_contracts.schema.json#/$defs/ReviewTargetPack/properties/test_build_evidence_refs:type` | s3031–s3032, s3072–s3073 | S \ F (20881) |
| `schema:Plans/collaborative_workflows_contracts.schema.json#/$defs/utc_timestamp:type;Plans/collaborative_workflows_contracts.schema.json#/$defs/CollaborativeRun/properties/completed_at:oneOf_exclusivity` | s3011–s3012, s3052–s3053 | S \ F (20881) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized/allOf/1/then/properties/requested_reviewer_count:minimum` | s4874 | S \ F (20884) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized_application/allOf/1/then/properties/requested_reviewer_count:minimum` | s5019 | S \ F (20884) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/run_projection:required:required_slot_ids` | s17133 | S \ F (20884) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/run_projection/properties/required_slot_ids:type` | s17130, s17134–s17137 | S \ F (20880) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/run_projection/properties/required_slot_ids:uniqueItems` | s17131 | S \ F (20884) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/definition_projection:required:required_slot_ids` | s17125 | S \ F (20884) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/definition_projection/properties/required_slot_ids:type` | s17122, s17126–s17129 | S \ F (20880) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/definition_projection/properties/required_slot_ids:uniqueItems` | s17123 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_created_project/properties/slot_requirements/items:required:slot_id` | s20325 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_created_project/properties/slot_requirements/items/properties/required:type` | s20314–s20316, s20318–s20321 | S \ F (20878) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_created_project/properties/slot_requirements/items:required:required` | s20317 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_created_project/properties/slot_requirements/items:additionalProperties` | s20313 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_created_application/properties/slot_requirements/items:required:slot_id` | s20310 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_created_application/properties/slot_requirements/items/properties/required:type` | s20299–s20301, s20303–s20306 | S \ F (20878) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_created_application/properties/slot_requirements/items:required:required` | s20302 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_created_application/properties/slot_requirements/items:additionalProperties` | s20298 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_started_project/properties/slot_requirements/items:required:slot_id` | s20535, s20565 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_started_project/properties/slot_requirements/items/properties/required:type` | s20524–s20526, s20528–s20531, s20554–s20556, s20558–s20561 | S \ F (20871) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_started_project/properties/slot_requirements/items:required:required` | s20527, s20557 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_started_project/properties/slot_requirements/items:additionalProperties` | s20523, s20553 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_started_application/properties/slot_requirements/items:required:slot_id` | s20520, s20550 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_started_application/properties/slot_requirements/items/properties/required:type` | s20509–s20511, s20513–s20516, s20539–s20541, s20543–s20546 | S \ F (20871) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_started_application/properties/slot_requirements/items:required:required` | s20512, s20542 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_started_application/properties/slot_requirements/items:additionalProperties` | s20508, s20538 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_paused_project/properties/slot_requirements/items:required:slot_id` | s20475 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_paused_project/properties/slot_requirements/items/properties/required:type` | s20464–s20466, s20468–s20471 | S \ F (20878) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_paused_project/properties/slot_requirements/items:required:required` | s20467 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_paused_project/properties/slot_requirements/items:additionalProperties` | s20463 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_paused_application/properties/slot_requirements/items:required:slot_id` | s20460 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_paused_application/properties/slot_requirements/items/properties/required:type` | s20449–s20451, s20453–s20456 | S \ F (20878) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_paused_application/properties/slot_requirements/items:required:required` | s20452 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_paused_application/properties/slot_requirements/items:additionalProperties` | s20448 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_resumed_project/properties/slot_requirements/items:required:slot_id` | s20505 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_resumed_project/properties/slot_requirements/items/properties/required:type` | s20494–s20496, s20498–s20501 | S \ F (20878) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_resumed_project/properties/slot_requirements/items:required:required` | s20497 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_resumed_project/properties/slot_requirements/items:additionalProperties` | s20493 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_resumed_application/properties/slot_requirements/items:required:slot_id` | s20490 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_resumed_application/properties/slot_requirements/items/properties/required:type` | s20479–s20481, s20483–s20486 | S \ F (20878) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_resumed_application/properties/slot_requirements/items:required:required` | s20482 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_resumed_application/properties/slot_requirements/items:additionalProperties` | s20478 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_cancelled_project/properties/slot_requirements/items:required:slot_id` | s20235 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_cancelled_project/properties/slot_requirements/items/properties/required:type` | s20224–s20226, s20228–s20231 | S \ F (20878) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_cancelled_project/properties/slot_requirements/items:required:required` | s20227 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_cancelled_project/properties/slot_requirements/items:additionalProperties` | s20223 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_cancelled_application/properties/slot_requirements/items:required:slot_id` | s20220 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_cancelled_application/properties/slot_requirements/items/properties/required:type` | s20209–s20211, s20213–s20216 | S \ F (20878) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_cancelled_application/properties/slot_requirements/items:required:required` | s20212 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_cancelled_application/properties/slot_requirements/items:additionalProperties` | s20208 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_completed_project/properties/slot_requirements/items:required:slot_id` | s20265 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_completed_project/properties/slot_requirements/items/properties/required:type` | s20254–s20256, s20258–s20261 | S \ F (20878) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_completed_project/properties/slot_requirements/items:required:required` | s20257 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_completed_project/properties/slot_requirements/items:additionalProperties` | s20253 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_completed_application/properties/slot_requirements/items:required:slot_id` | s20250 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_completed_application/properties/slot_requirements/items/properties/required:type` | s20239–s20241, s20243–s20246 | S \ F (20878) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_completed_application/properties/slot_requirements/items:required:required` | s20242 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_completed_application/properties/slot_requirements/items:additionalProperties` | s20238 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_failed_project/properties/slot_requirements/items:required:slot_id` | s20355 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_failed_project/properties/slot_requirements/items/properties/required:type` | s20344–s20346, s20348–s20351 | S \ F (20878) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_failed_project/properties/slot_requirements/items:required:required` | s20347 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_failed_project/properties/slot_requirements/items:additionalProperties` | s20343 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_failed_application/properties/slot_requirements/items:required:slot_id` | s20340 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_failed_application/properties/slot_requirements/items/properties/required:type` | s20329–s20331, s20333–s20336 | S \ F (20878) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_failed_application/properties/slot_requirements/items:required:required` | s20332 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_failed_application/properties/slot_requirements/items:additionalProperties` | s20328 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_started_project/properties/slot_requirements/items:required:slot_id` | s20445 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_started_project/properties/slot_requirements/items/properties/required:type` | s20434–s20436, s20438–s20441 | S \ F (20878) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_started_project/properties/slot_requirements/items:required:required` | s20437 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_started_project/properties/slot_requirements/items:additionalProperties` | s20433 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_started_application/properties/slot_requirements/items:required:slot_id` | s20430 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_started_application/properties/slot_requirements/items/properties/required:type` | s20419–s20421, s20423–s20426 | S \ F (20878) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_started_application/properties/slot_requirements/items:required:required` | s20422 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_started_application/properties/slot_requirements/items:additionalProperties` | s20418 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_completed_project/properties/slot_requirements/items:required:slot_id` | s20415, s20595 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_completed_project/properties/slot_requirements/items/properties/required:type` | s20404–s20406, s20408–s20411, s20584–s20586, s20588–s20591 | S \ F (20871) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_completed_project/properties/slot_requirements/items:required:required` | s20407, s20587 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_completed_project/properties/slot_requirements/items:additionalProperties` | s20403, s20583 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_completed_application/properties/slot_requirements/items:required:slot_id` | s20400, s20580 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_completed_application/properties/slot_requirements/items/properties/required:type` | s20389–s20391, s20393–s20396, s20569–s20571, s20573–s20576 | S \ F (20871) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_completed_application/properties/slot_requirements/items:required:required` | s20392, s20572 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_completed_application/properties/slot_requirements/items:additionalProperties` | s20388, s20568 | S \ F (20883) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_message_added_project/properties/slot_requirements/items:required:slot_id` | s20385 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_message_added_project/properties/slot_requirements/items/properties/required:type` | s20374–s20376, s20378–s20381 | S \ F (20878) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_message_added_project/properties/slot_requirements/items:required:required` | s20377 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_message_added_project/properties/slot_requirements/items:additionalProperties` | s20373 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_message_added_application/properties/slot_requirements/items:required:slot_id` | s20370 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_message_added_application/properties/slot_requirements/items/properties/required:type` | s20359–s20361, s20363–s20366 | S \ F (20878) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_message_added_application/properties/slot_requirements/items:required:required` | s20362 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_message_added_application/properties/slot_requirements/items:additionalProperties` | s20358 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_artifact_added_project/properties/slot_requirements/items:required:slot_id` | s20205 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_artifact_added_project/properties/slot_requirements/items/properties/required:type` | s20194–s20196, s20198–s20201 | S \ F (20878) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_artifact_added_project/properties/slot_requirements/items:required:required` | s20197 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_artifact_added_project/properties/slot_requirements/items:additionalProperties` | s20193 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_artifact_added_application/properties/slot_requirements/items:required:slot_id` | s20190 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_artifact_added_application/properties/slot_requirements/items/properties/required:type` | s20179–s20181, s20183–s20186 | S \ F (20878) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_artifact_added_application/properties/slot_requirements/items:required:required` | s20182 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_artifact_added_application/properties/slot_requirements/items:additionalProperties` | s20178 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_configuration_changed_project/properties/slot_requirements/items:required:slot_id` | s20295 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_configuration_changed_project/properties/slot_requirements/items/properties/required:type` | s20284–s20286, s20288–s20291 | S \ F (20878) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_configuration_changed_project/properties/slot_requirements/items:required:required` | s20287 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_configuration_changed_project/properties/slot_requirements/items:additionalProperties` | s20283 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_configuration_changed_application/properties/slot_requirements/items:required:slot_id` | s20280 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_configuration_changed_application/properties/slot_requirements/items/properties/required:type` | s20269–s20271, s20273–s20276 | S \ F (20878) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_configuration_changed_application/properties/slot_requirements/items:required:required` | s20272 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_configuration_changed_application/properties/slot_requirements/items:additionalProperties` | s20268 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_proposal_added_project/properties/slot_requirements/items:required:slot_id` | s20145 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_proposal_added_project/properties/slot_requirements/items/properties/required:type` | s20134–s20136, s20138–s20141 | S \ F (20878) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_proposal_added_project/properties/slot_requirements/items:required:required` | s20137 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_proposal_added_project/properties/slot_requirements/items:additionalProperties` | s20133 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_proposal_added_application/properties/slot_requirements/items:required:slot_id` | s20130 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_proposal_added_application/properties/slot_requirements/items/properties/required:type` | s20119–s20121, s20123–s20126 | S \ F (20878) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_proposal_added_application/properties/slot_requirements/items:required:required` | s20122 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_proposal_added_application/properties/slot_requirements/items:additionalProperties` | s20118 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_vote_added_project/properties/slot_requirements/items:required:slot_id` | s20175 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_vote_added_project/properties/slot_requirements/items/properties/required:type` | s20164–s20166, s20168–s20171 | S \ F (20878) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_vote_added_project/properties/slot_requirements/items:required:required` | s20167 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_vote_added_project/properties/slot_requirements/items:additionalProperties` | s20163 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_vote_added_application/properties/slot_requirements/items:required:slot_id` | s20160 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_vote_added_application/properties/slot_requirements/items/properties/required:type` | s20149–s20151, s20153–s20156 | S \ F (20878) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_vote_added_application/properties/slot_requirements/items:required:required` | s20152 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_vote_added_application/properties/slot_requirements/items:additionalProperties` | s20148 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_plan_synthesized_project/properties/slot_requirements/items:required:slot_id` | s20115 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_plan_synthesized_project/properties/slot_requirements/items/properties/required:type` | s20104–s20106, s20108–s20111 | S \ F (20878) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_plan_synthesized_project/properties/slot_requirements/items:required:required` | s20107 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_plan_synthesized_project/properties/slot_requirements/items:additionalProperties` | s20103 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_plan_synthesized_application/properties/slot_requirements/items:required:slot_id` | s20100 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_plan_synthesized_application/properties/slot_requirements/items/properties/required:type` | s20089–s20091, s20093–s20096 | S \ F (20878) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_plan_synthesized_application/properties/slot_requirements/items:required:required` | s20092 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_plan_synthesized_application/properties/slot_requirements/items:additionalProperties` | s20088 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_added_project/properties/slot_requirements/items:required:slot_id` | s20655 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_added_project/properties/slot_requirements/items/properties/required:type` | s20644–s20646, s20648–s20651 | S \ F (20878) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_added_project/properties/slot_requirements/items:required:required` | s20647 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_added_project/properties/slot_requirements/items:additionalProperties` | s20643 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_added_application/properties/slot_requirements/items:required:slot_id` | s20640 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_added_application/properties/slot_requirements/items/properties/required:type` | s20629–s20631, s20633–s20636 | S \ F (20878) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_added_application/properties/slot_requirements/items:required:required` | s20632 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_added_application/properties/slot_requirements/items:additionalProperties` | s20628 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_dispositioned_project/properties/slot_requirements/items:required:slot_id` | s20685 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_dispositioned_project/properties/slot_requirements/items/properties/required:type` | s20674–s20676, s20678–s20681 | S \ F (20878) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_dispositioned_project/properties/slot_requirements/items:required:required` | s20677 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_dispositioned_project/properties/slot_requirements/items:additionalProperties` | s20673 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_dispositioned_application/properties/slot_requirements/items:required:slot_id` | s20670 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_dispositioned_application/properties/slot_requirements/items/properties/required:type` | s20659–s20661, s20663–s20666 | S \ F (20878) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_dispositioned_application/properties/slot_requirements/items:required:required` | s20662 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_dispositioned_application/properties/slot_requirements/items:additionalProperties` | s20658 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_artifact_finalized_project/properties/slot_requirements/items:required:slot_id` | s20625 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_artifact_finalized_project/properties/slot_requirements/items/properties/required:type` | s20614–s20616, s20618–s20621 | S \ F (20878) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_artifact_finalized_project/properties/slot_requirements/items:required:required` | s20617 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_artifact_finalized_project/properties/slot_requirements/items:additionalProperties` | s20613 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_artifact_finalized_application/properties/slot_requirements/items:required:slot_id` | s20610 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_artifact_finalized_application/properties/slot_requirements/items/properties/required:type` | s20599–s20601, s20603–s20606 | S \ F (20878) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_artifact_finalized_application/properties/slot_requirements/items:required:required` | s20602 | S \ F (20884) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_artifact_finalized_application/properties/slot_requirements/items:additionalProperties` | s20598 | S \ F (20884) |
| `schema:Plans/application_workflow_contracts.schema.json#/$defs/CollaborationDefinitionStorageApplicationV2:additionalProperties` | s16650, s16709 | S \ F (20883) |
| `schema:Plans/application_workflow_contracts.schema.json#/$defs/CollaborationDefinitionStorageApplicationV2:required:schema_id` | s16668, s16727 | S \ F (20883) |
| `schema:Plans/application_workflow_contracts.schema.json#/$defs/CollaborationDefinitionStorageApplicationV2:required:schema_version` | s16677, s16736 | S \ F (20883) |
| `schema:Plans/application_workflow_contracts.schema.json#/$defs/CollaborationDefinitionStorageApplicationV2:required:storage_instance_id` | s16702, s16761 | S \ F (20883) |
| `schema:Plans/application_workflow_contracts.schema.json#/$defs/CollaborationDefinitionStorageApplicationV2:required:server_id` | s16695, s16754 | S \ F (20883) |
| `schema:Plans/application_workflow_contracts.schema.json#/$defs/CollaborationDefinitionStorageApplicationV2:required:scope` | s16686, s16745 | S \ F (20883) |
| `schema:Plans/application_workflow_contracts.schema.json#/$defs/CollaborationDefinitionStorageApplicationV2:required:record` | s16651, s16710 | S \ F (20883) |
| `schema:Plans/application_workflow_contracts.schema.json#/$defs/CollaborationDefinitionStorageApplicationV2:required:record_ref` | s16660, s16718 | S \ F (20883) |
| `schema:Plans/application_workflow_contracts.schema.json#/$defs/CollaborationDefinitionStorageApplicationV2/properties/schema_id:const` | s16669–s16676, s16728–s16735 | S \ F (20869) |
| `schema:Plans/application_workflow_contracts.schema.json#/$defs/CollaborationDefinitionStorageApplicationV2/properties/schema_version:const` | s16678–s16685, s16737–s16744 | S \ F (20869) |
| `schema:Plans/application_workflow_contracts.schema.json#/$defs/CollaborationDefinitionStorageApplicationV2/properties/storage_instance_id:type` | s16703–s16708, s16762–s16767 | S \ F (20873) |
| `schema:Plans/application_workflow_contracts.schema.json#/$defs/CollaborationDefinitionStorageApplicationV2/properties/server_id:type` | s16696–s16701, s16755–s16760 | S \ F (20873) |
| `schema:Plans/shared_integration_runtime.schema.json#/$defs/WorkflowScopeV2:type` | s16687–s16692, s16746–s16751, s16805–s16810, s16864–s16869, s16923–s16928, s16982–s16987, s17041–s17046, s17100–s17105 | S \ F (20837) |
| `schema:Plans/shared_integration_runtime.schema.json#/$defs/WorkflowScopeV2:required:named_plan_id;Plans/shared_integration_runtime.schema.json#/$defs/WorkflowScopeV2:required:project_home_server_id;Plans/shared_integration_runtime.schema.json#/$defs/WorkflowScopeV2:required:project_id;Plans/shared_integration_runtime.schema.json#/$defs/WorkflowScopeV2:required:schema_id;Plans/shared_integration_runtime.schema.json#/$defs/WorkflowScopeV2:required:schema_version;Plans/shared_integration_runtime.schema.json#/$defs/WorkflowScopeV2:required:scope_kind;Plans/shared_integration_runtime.schema.json#/$defs/WorkflowScopeV2:required:scope_partition;Plans/shared_integration_runtime.schema.json#/$defs/WorkflowScopeV2:required:server_id` | s16693, s16752, s16811, s16870, s16929, s16988, s17047, s17106 | S \ F (20877) |
| `schema:Plans/shared_integration_runtime.schema.json#/$defs/WorkflowScopeV2:additionalProperties;Plans/shared_integration_runtime.schema.json#/$defs/WorkflowScopeV2:required:named_plan_id;Plans/shared_integration_runtime.schema.json#/$defs/WorkflowScopeV2:required:project_home_server_id;Plans/shared_integration_runtime.schema.json#/$defs/WorkflowScopeV2:required:project_id;Plans/shared_integration_runtime.schema.json#/$defs/WorkflowScopeV2:required:schema_id;Plans/shared_integration_runtime.schema.json#/$defs/WorkflowScopeV2:required:schema_version;Plans/shared_integration_runtime.schema.json#/$defs/WorkflowScopeV2:required:scope_kind;Plans/shared_integration_runtime.schema.json#/$defs/WorkflowScopeV2:required:scope_partition;Plans/shared_integration_runtime.schema.json#/$defs/WorkflowScopeV2:required:server_id` | s16693–s16694, s16752–s16753, s16811–s16812, s16870–s16871, s16929–s16930, s16988–s16989, s17047–s17048, s17106–s17107 | S \ F (20869) |
| `schema:Plans/application_workflow_contracts.schema.json#/$defs/CollaborationDefinitionStorageApplicationV2/allOf/0/then/properties/record:type;Plans/application_workflow_contracts.schema.json#/$defs/CollaborationDefinitionStorageApplicationV2/properties/record:anyOf` | s16652–s16659, s16723, s20042, s20046 | S \ F (20874) |
| `schema:Plans/application_workflow_contracts.schema.json#/$defs/CollaborationDefinitionStorageApplicationV2/allOf/0/then/properties/record:type` | s16656, s16723 | S \ F (20883) |
| `schema:Plans/application_workflow_contracts.schema.json#/$defs/CollaborationDefinitionStorageApplicationV2/allOf/1/then/properties/record:type;Plans/application_workflow_contracts.schema.json#/$defs/CollaborationDefinitionStorageApplicationV2/properties/record_ref:anyOf` | s16661–s16667, s16719–s16722, s16724–s16726 | S \ F (20871) |
| `schema:Plans/application_workflow_contracts.schema.json#/$defs/CollaborationDefinitionStorageApplicationV2/properties/record_ref:anyOf` | s16663–s16667, s16719–s16722, s16724–s16726 | S \ F (20873) |
| `schema:Plans/application_workflow_contracts.schema.json#/$defs/CollaborationDefinitionStorageApplicationV2/allOf/1/then/properties/record:type;Plans/application_workflow_contracts.schema.json#/$defs/CollaborationDefinitionStorageApplicationV2/properties/record:anyOf` | s16658–s16659, s16711–s16717, s20042, s20046 | S \ F (20874) |
| `schema:Plans/application_workflow_contracts.schema.json#/$defs/CollaborationRunStorageApplicationV2:additionalProperties` | s16886, s16945 | S \ F (20883) |
| `schema:Plans/application_workflow_contracts.schema.json#/$defs/CollaborationRunStorageApplicationV2:required:schema_id` | s16904, s16963 | S \ F (20883) |
| `schema:Plans/application_workflow_contracts.schema.json#/$defs/CollaborationRunStorageApplicationV2:required:schema_version` | s16913, s16972 | S \ F (20883) |
| `schema:Plans/application_workflow_contracts.schema.json#/$defs/CollaborationRunStorageApplicationV2:required:storage_instance_id` | s16938, s16997 | S \ F (20883) |
| `schema:Plans/application_workflow_contracts.schema.json#/$defs/CollaborationRunStorageApplicationV2:required:server_id` | s16931, s16990 | S \ F (20883) |
| `schema:Plans/application_workflow_contracts.schema.json#/$defs/CollaborationRunStorageApplicationV2:required:scope` | s16922, s16981 | S \ F (20883) |
| `schema:Plans/application_workflow_contracts.schema.json#/$defs/CollaborationRunStorageApplicationV2:required:record` | s16887, s16946 | S \ F (20883) |
| `schema:Plans/application_workflow_contracts.schema.json#/$defs/CollaborationRunStorageApplicationV2:required:record_ref` | s16896, s16954 | S \ F (20883) |
| `schema:Plans/application_workflow_contracts.schema.json#/$defs/CollaborationRunStorageApplicationV2/properties/schema_id:const` | s16905–s16912, s16964–s16971 | S \ F (20869) |
| `schema:Plans/application_workflow_contracts.schema.json#/$defs/CollaborationRunStorageApplicationV2/properties/schema_version:const` | s16914–s16921, s16973–s16980 | S \ F (20869) |
| `schema:Plans/application_workflow_contracts.schema.json#/$defs/CollaborationRunStorageApplicationV2/properties/storage_instance_id:type` | s16939–s16944, s16998–s17003 | S \ F (20873) |
| `schema:Plans/application_workflow_contracts.schema.json#/$defs/CollaborationRunStorageApplicationV2/properties/server_id:type` | s16932–s16937, s16991–s16996 | S \ F (20873) |
| `schema:Plans/application_workflow_contracts.schema.json#/$defs/CollaborationRunStorageApplicationV2/allOf/0/then/properties/record:type;Plans/application_workflow_contracts.schema.json#/$defs/CollaborationRunStorageApplicationV2/properties/record:anyOf` | s16888–s16895, s16959, s20022, s20030, s20034, s20038, s20050, s20064, s20068, s20072, s20076, s20082 | S \ F (20866) |
| `schema:Plans/application_workflow_contracts.schema.json#/$defs/CollaborationRunStorageApplicationV2/allOf/0/then/properties/record:type` | s16892, s16959 | S \ F (20883) |
| `schema:Plans/application_workflow_contracts.schema.json#/$defs/CollaborationRunStorageApplicationV2/allOf/1/then/properties/record:type;Plans/application_workflow_contracts.schema.json#/$defs/CollaborationRunStorageApplicationV2/properties/record_ref:anyOf` | s16897–s16903, s16955–s16958, s16960–s16962 | S \ F (20871) |
| `schema:Plans/application_workflow_contracts.schema.json#/$defs/CollaborationRunStorageApplicationV2/properties/record_ref:anyOf` | s16899–s16903, s16955–s16958, s16960–s16962 | S \ F (20873) |
| `schema:Plans/application_workflow_contracts.schema.json#/$defs/CollaborationRunStorageApplicationV2/allOf/1/then/properties/record:type;Plans/application_workflow_contracts.schema.json#/$defs/CollaborationRunStorageApplicationV2/properties/record:anyOf` | s16894–s16895, s16947–s16953, s20022, s20030, s20034, s20038, s20050, s20064, s20068, s20072, s20076, s20082 | S \ F (20866) |
| `schema:Plans/application_workflow_contracts.schema.json#/$defs/CollaborationParticipantStorageApplicationV2:additionalProperties` | s16768, s16827 | S \ F (20883) |
| `schema:Plans/application_workflow_contracts.schema.json#/$defs/CollaborationParticipantStorageApplicationV2:required:schema_id` | s16786, s16845 | S \ F (20883) |
| `schema:Plans/application_workflow_contracts.schema.json#/$defs/CollaborationParticipantStorageApplicationV2:required:schema_version` | s16795, s16854 | S \ F (20883) |
| `schema:Plans/application_workflow_contracts.schema.json#/$defs/CollaborationParticipantStorageApplicationV2:required:storage_instance_id` | s16820, s16879 | S \ F (20883) |
| `schema:Plans/application_workflow_contracts.schema.json#/$defs/CollaborationParticipantStorageApplicationV2:required:server_id` | s16813, s16872 | S \ F (20883) |
| `schema:Plans/application_workflow_contracts.schema.json#/$defs/CollaborationParticipantStorageApplicationV2:required:scope` | s16804, s16863 | S \ F (20883) |
| `schema:Plans/application_workflow_contracts.schema.json#/$defs/CollaborationParticipantStorageApplicationV2:required:record` | s16769, s16828 | S \ F (20883) |
| `schema:Plans/application_workflow_contracts.schema.json#/$defs/CollaborationParticipantStorageApplicationV2:required:record_ref` | s16778, s16836 | S \ F (20883) |
| `schema:Plans/application_workflow_contracts.schema.json#/$defs/CollaborationParticipantStorageApplicationV2/properties/schema_id:const` | s16787–s16794, s16846–s16853 | S \ F (20869) |
| `schema:Plans/application_workflow_contracts.schema.json#/$defs/CollaborationParticipantStorageApplicationV2/properties/schema_version:const` | s16796–s16803, s16855–s16862 | S \ F (20869) |
| `schema:Plans/application_workflow_contracts.schema.json#/$defs/CollaborationParticipantStorageApplicationV2/properties/storage_instance_id:type` | s16821–s16826, s16880–s16885 | S \ F (20873) |
| `schema:Plans/application_workflow_contracts.schema.json#/$defs/CollaborationParticipantStorageApplicationV2/properties/server_id:type` | s16814–s16819, s16873–s16878 | S \ F (20873) |
| `schema:Plans/application_workflow_contracts.schema.json#/$defs/CollaborationParticipantStorageApplicationV2/allOf/0/then/properties/record:type;Plans/application_workflow_contracts.schema.json#/$defs/CollaborationParticipantStorageApplicationV2/properties/record:anyOf` | s16770–s16777, s16841, s20060 | S \ F (20875) |
| `schema:Plans/application_workflow_contracts.schema.json#/$defs/CollaborationParticipantStorageApplicationV2/allOf/0/then/properties/record:type` | s16774, s16841 | S \ F (20883) |
| `schema:Plans/application_workflow_contracts.schema.json#/$defs/CollaborationParticipantStorageApplicationV2/allOf/1/then/properties/record:type;Plans/application_workflow_contracts.schema.json#/$defs/CollaborationParticipantStorageApplicationV2/properties/record_ref:anyOf` | s16779–s16785, s16837–s16840, s16842–s16844 | S \ F (20871) |
| `schema:Plans/application_workflow_contracts.schema.json#/$defs/CollaborationParticipantStorageApplicationV2/properties/record_ref:anyOf` | s16781–s16785, s16837–s16840, s16842–s16844 | S \ F (20873) |
| `schema:Plans/application_workflow_contracts.schema.json#/$defs/CollaborationParticipantStorageApplicationV2/allOf/1/then/properties/record:type;Plans/application_workflow_contracts.schema.json#/$defs/CollaborationParticipantStorageApplicationV2/properties/record:anyOf` | s16776–s16777, s16829–s16835, s20060 | S \ F (20875) |
| `schema:Plans/application_workflow_contracts.schema.json#/$defs/CollaborationTranscriptStorageApplicationV2:additionalProperties` | s17004, s17063 | S \ F (20883) |
| `schema:Plans/application_workflow_contracts.schema.json#/$defs/CollaborationTranscriptStorageApplicationV2:required:schema_id` | s17022, s17081 | S \ F (20883) |
| `schema:Plans/application_workflow_contracts.schema.json#/$defs/CollaborationTranscriptStorageApplicationV2:required:schema_version` | s17031, s17090 | S \ F (20883) |
| `schema:Plans/application_workflow_contracts.schema.json#/$defs/CollaborationTranscriptStorageApplicationV2:required:storage_instance_id` | s17056, s17115 | S \ F (20883) |
| `schema:Plans/application_workflow_contracts.schema.json#/$defs/CollaborationTranscriptStorageApplicationV2:required:server_id` | s17049, s17108 | S \ F (20883) |
| `schema:Plans/application_workflow_contracts.schema.json#/$defs/CollaborationTranscriptStorageApplicationV2:required:scope` | s17040, s17099 | S \ F (20883) |
| `schema:Plans/application_workflow_contracts.schema.json#/$defs/CollaborationTranscriptStorageApplicationV2:required:record` | s17005, s17064 | S \ F (20883) |
| `schema:Plans/application_workflow_contracts.schema.json#/$defs/CollaborationTranscriptStorageApplicationV2:required:record_ref` | s17014, s17072 | S \ F (20883) |
| `schema:Plans/application_workflow_contracts.schema.json#/$defs/CollaborationTranscriptStorageApplicationV2/properties/schema_id:const` | s17023–s17030, s17082–s17089 | S \ F (20869) |
| `schema:Plans/application_workflow_contracts.schema.json#/$defs/CollaborationTranscriptStorageApplicationV2/properties/schema_version:const` | s17032–s17039, s17091–s17098 | S \ F (20869) |
| `schema:Plans/application_workflow_contracts.schema.json#/$defs/CollaborationTranscriptStorageApplicationV2/properties/storage_instance_id:type` | s17057–s17062, s17116–s17121 | S \ F (20873) |
| `schema:Plans/application_workflow_contracts.schema.json#/$defs/CollaborationTranscriptStorageApplicationV2/properties/server_id:type` | s17050–s17055, s17109–s17114 | S \ F (20873) |
| `schema:Plans/application_workflow_contracts.schema.json#/$defs/CollaborationTranscriptStorageApplicationV2/allOf/0/then/properties/record:type;Plans/application_workflow_contracts.schema.json#/$defs/CollaborationTranscriptStorageApplicationV2/properties/record:anyOf` | s17006–s17013, s17077, s20054 | S \ F (20875) |
| `schema:Plans/application_workflow_contracts.schema.json#/$defs/CollaborationTranscriptStorageApplicationV2/allOf/0/then/properties/record:type` | s17010, s17077 | S \ F (20883) |
| `schema:Plans/application_workflow_contracts.schema.json#/$defs/CollaborationTranscriptStorageApplicationV2/allOf/1/then/properties/record:type;Plans/application_workflow_contracts.schema.json#/$defs/CollaborationTranscriptStorageApplicationV2/properties/record_ref:anyOf` | s17015–s17021, s17073–s17076, s17078–s17080 | S \ F (20871) |
| `schema:Plans/application_workflow_contracts.schema.json#/$defs/CollaborationTranscriptStorageApplicationV2/properties/record_ref:anyOf` | s17017–s17021, s17073–s17076, s17078–s17080 | S \ F (20873) |
| `schema:Plans/application_workflow_contracts.schema.json#/$defs/CollaborationTranscriptStorageApplicationV2/allOf/1/then/properties/record:type;Plans/application_workflow_contracts.schema.json#/$defs/CollaborationTranscriptStorageApplicationV2/properties/record:anyOf` | s17012–s17013, s17065–s17071, s20054 | S \ F (20875) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/durable_read_token:additionalProperties` | s372 | S \ F (20884) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/checkpoint/allOf/1/then/properties/filter_complete:const` | s272 | S \ F (20884) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/checkpoint/properties/admitted_event_types/items:enum` | s220–s237, s274–s291, s324–s341, s374–s392 | S \ F (20812) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/checkpoint/allOf/4/then/properties/index_through_sequence_id:type` | s273 | S \ F (20884) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/durable_read_token/properties/storage_instance_id:lexical` | s255, s309, s359, s410, s435 | S \ F (20880) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/durable_read_token/properties/checkpoint_key:lexical` | s239, s293, s343, s394, s419 | S \ F (20880) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/durable_read_token/properties/checkpoint_ref:lexical` | s240, s294, s344, s395, s420 | S \ F (20880) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/durable_read_token/properties/generation_id:lexical` | s243, s297, s347, s398, s423 | S \ F (20880) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/durable_read_token/properties/generation_anchor_sha256:lexical` | s242, s296, s346, s397, s422 | S \ F (20880) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/durable_read_token/properties/frontier_sha256:lexical` | s241, s295, s345, s396, s421 | S \ F (20880) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/durable_read_token/properties/index_dataset_name:lexical` | s244, s298, s348, s399, s424 | S \ F (20880) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/durable_read_token/properties/source_selection/properties/storage_instance_id:lexical` | s254, s308, s358, s409, s434 | S \ F (20880) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/durable_read_token/properties/source_selection/properties/current_ref:const` | s246, s300, s350, s401, s426 | S \ F (20880) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/durable_read_token/properties/source_selection/properties/current_bytes_sha256:lexical` | s245, s299, s349, s400, s425 | S \ F (20880) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/durable_read_token/properties/source_selection/properties/manifest_ref:const` | s250, s304, s354, s405, s430 | S \ F (20880) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/durable_read_token/properties/source_selection/properties/manifest_bytes_sha256:lexical` | s249, s303, s353, s404, s429 | S \ F (20880) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/durable_read_token/properties/source_selection/properties/manifest_survivor_prefix_sha256:lexical` | s251, s305, s355, s406, s431 | S \ F (20880) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/durable_read_token/properties/source_selection/properties/retained_inventory_sha256:lexical` | s252, s306, s356, s407, s432 | S \ F (20880) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/durable_read_token/properties/source_selection/properties/durable_watermarks_sha256:lexical` | s247, s301, s351, s402, s427 | S \ F (20880) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/durable_read_token/properties/source_selection/properties/excluded_ranges_sha256:lexical` | s248, s302, s352, s403, s428 | S \ F (20880) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/durable_read_token/properties/source_selection/properties/retired_inputs_sha256:lexical` | s253, s307, s357, s408, s433 | S \ F (20880) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/checkpoint_core/properties/schema_id:const` | s441 | S \ F (20884) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/checkpoint_core/properties/schema_version:const` | s442 | S \ F (20884) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/checkpoint_core/properties/storage_instance_id:lexical` | s448 | S \ F (20884) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/checkpoint_core/properties/scope_kind:enum` | s443 | S \ F (20884) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/checkpoint_core/allOf/5/then/properties/scope_partition:lexical` | s444 | S \ F (20884) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/checkpoint_core/properties/projector_id:const` | s437 | S \ F (20884) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/checkpoint_core/properties/projector_version:const` | s438 | S \ F (20884) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/checkpoint_core/properties/admitted_event_types/items:enum` | s416–s417 | S \ F (20883) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/checkpoint_core/properties/state:enum;Plans/collaboration_projection_contracts.schema.json#/$defs/retired_generation/properties/checkpoint_core/allOf/1/properties/state:const` | s447 | S \ F (20884) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/checkpoint_core/properties/health:enum` | s418 | S \ F (20884) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/checkpoint_core/properties/withdrawn_at_utc:anyOf;Plans/collaboration_projection_contracts.schema.json#/$defs/timestamp:lexical` | s259, s268, s314, s323, s364, s371, s415, s440, s449–s450, s460, s17207, s17524 | S \ F (20872) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/attempt_item/properties/outcome:anyOf` | s16341 | S \ F (20884) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/attempt_item/properties/outcome_event_id:anyOf` | s16342 | S \ F (20884) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/sha256_hex:lexical` | s16093 | S \ F (20884) |
| `integrity:payload_schema_failures:payload_defs` | i35 | I \ F (67) |
| `integrity:payload_schema_failures:payload_schema_id` | i36 | I \ F (67) |
| `integrity:payload_schema_failures:payload_closed` | i34 | I \ F (67) |
| `integrity:payload_schema_failures:required_without_property` | i53 | I \ F (67) |
| `integrity:payload_schema_failures:null_admitted` | i28 | I \ F (67) |
| `integrity:payload_schema_failures:family_timestamp_required` | i16 | I \ F (67) |
| `integrity:payload_schema_failures:subject_field_missing` | i62 | I \ F (67) |
| `integrity:payload_schema_failures:kind_constant` | i21 | I \ F (67) |
| `integrity:payload_schema_failures:reconfigure_change_kind_copy` | i49 | I \ F (67) |
| `integrity:payload_schema_failures:reason_enum_is_section_11_without_cancelled` | i48 | I \ F (67) |
| `integrity:payload_schema_failures:state_subset_of_run_state` | i61 | I \ F (67) |
| `integrity:projection_schema_failures:durable_read_token_copy_differs_from_coordination` | i12 | I \ F (67) |
| `integrity:projection_schema_failures:redb_snapshot_id_storable` | i50 | I \ F (67) |
| `integrity:projection_schema_failures:checkpoint_admitted_types` | i9 | I \ F (67) |
| `integrity:projection_schema_failures:binding_families` | i6 | I \ F (67) |
| `integrity:projection_schema_failures:binding_units` | i8 | I \ F (67) |
| `integrity:projection_schema_failures:binding_source` | i7 | I \ F (67) |
| `integrity:projection_schema_failures:projection_closed` | i46 | I \ F (67) |
| `integrity:projection_schema_failures:binding_adoptions` | i5 | I \ F (67) |
| `integrity:projection_schema_failures:durable_token_not_nine_field_projection` | i13 | I \ F (67) |
| `integrity:owner_unit_failures:owner_unit_missing` | i33 | I \ F (67) |
| `integrity:owner_unit_failures:owner_unit_does_not_name_family` | i32 | I \ F (67) |
| `integrity:owner_unit_failures:section_13_name_missing` | i58 | I \ F (67) |
| `integrity:ledger_failures:ledger_schema` | i23 | I \ F (67) |
| `integrity:ledger_failures:ledger_order` | i22 | I \ F (67) |
| `integrity:ledger_failures:registry_row_schema` | i51 | I \ F (67) |
| `integrity:ledger_failures:registry_row_sha256` | i52 | I \ F (67) |
| `integrity:ledger_failures:row_identity` | i55 | I \ F (67) |
| `integrity:ledger_failures:owner_anchors` | i31 | I \ F (67) |
| `integrity:ledger_failures:payload_schema_ref_resolves` | i37 | I \ F (67) |
| `integrity:ledger_failures:scope_editions` | i57 | I \ F (67) |
| `integrity:ledger_failures:producer_admission` | i45 | I \ F (67) |
| `integrity:ledger_failures:edition_retention_differs` | i14 | I \ F (67) |
| `integrity:ledger_failures:retention_policy_ref` | i54 | I \ F (67) |
| `integrity:ledger_failures:no_alias` | i27 | I \ F (67) |
| `integrity:ledger_failures:row_source_ref_to_ledger` | i56 | I \ F (67) |
| `integrity:ledger_failures:validation_case_ids_unknown` | i68 | I \ F (67) |
| `integrity:ledger_failures:admitted_without_authority_ref` | i3 | I \ F (67) |
| `integrity:registry_membership_failures:prepared_family_in_registry` | i43 | I \ F (67) |
| `integrity:registry_membership_failures:admitted_ledger_row_missing_from_registry` | i1 | I \ F (67) |
| `integrity:registry_membership_failures:admitted_row_differs_from_prepared` | i2 | I \ F (67) |
| `integrity:reference_failures:unresolved_ref` | i66 | I \ F (67) |
| `integrity:physical_binding_failures:physical_binding` | i38 | I \ F (67) |
| `integrity:physical_binding_failures:physical_recovery` | i40 | I \ F (67) |
| `integrity:physical_binding_failures:source_physical_binding` | i60 | I \ F (67) |
| `integrity:physical_binding_failures:physical_keyed_composition` | i39 | I \ F (67) |
| `integrity:fixture_report:numeric_canonical` | i29 | I \ F (67) |
| `integrity:fixture_report:numeric_identity` | i30 | I \ F (67) |
| `integrity:fixture_report:positive_payload` | i41 | I \ F (67) |
| `integrity:fixture_report:negative_payload_layer` | i25 | I \ F (67) |
| `integrity:fixture_report:valid_event` | i67 | I \ F (67) |
| `integrity:fixture_report:invalid_event_join` | i19 | I \ F (67) |
| `integrity:fixture_report:identity_vector` | i18 | I \ F (67) |
| `integrity:fixture_report:new_epoch_reuses_key` | i26 | I \ F (67) |
| `integrity:fixture_report:transition` | i63 | I \ F (67) |
| `integrity:fixture_report:final_state` | i17 | I \ F (67) |
| `integrity:fixture_report:transition_case` | i64 | I \ F (67) |
| `integrity:fixture_report:transition_valid_counterpart` | i65 | I \ F (67) |
| `integrity:fixture_report:prepared_source` | i44 | I \ F (67) |
| `integrity:fixture_report:prepared_event` | i42 | I \ F (67) |
| `integrity:fixture_report:checkpoint_semantics` | i10 | I \ F (67) |
| `integrity:fixture_report:projection_value` | i47 | I \ F (67) |
| `integrity:fixture_report:invalid_projection_value_accepted` | i20 | I \ F (67) |
| `integrity:fixture_report:family_case_floor` | i15 | I \ F (67) |
| `integrity:fixture_report:native_status` | i24 | I \ F (67) |
| `integrity:fixture_report:sequence_payload_invalid` | i59 | I \ F (67) |
| `integrity:ats_failures:ats_case_ids` | i4 | I \ F (67) |
| `integrity:probe_failures:contract_probe` | i11 | I \ F (67) |
