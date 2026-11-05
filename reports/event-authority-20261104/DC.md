# Lane DC — review round 1

Branch `plans/ea-collab-prep-20261104`; reviewed head `53e7b3abcd326f21bede067843344b7e62b0f059`; fixed code/Plans head `461db81bf4f5299fe80c14ab8c4a65835be6cdb6`. The following report/self-grade commit changes reports only.

**Result:** B1–B8 and S1–S3 are fixed in this preparation branch. All 18 families have 10 PASS, 1 PARTIAL (pending retention-policy object) and 1 ABSENT (membership). Static preparation only: zero admissions; native execution stays NOT_RUN. No Decision Log entry, event registry append, governance reseal or new test file.

## Review round 1: findings and responses

All fixes below are in `461db81bf4f5299fe80c14ab8c4a65835be6cdb6`. Locations refer to that committed tree. Each family's separately authored CWR/CV/SP/ATS units adopt shared mechanics; sibling evidence does not replace them.

| Finding | Where | Why it broke | Fix and verification |
|---|---|---|---|
| B1 — fixed | `Plans/storage-plan.md:29537` | Recovery depended on an unmaterialized prepared owner fact; app adoption was deferred. | 36 closed scope/family holders freeze original typed records, body, metadata and identities; Review packs and participant namespace mappings retain original custody. Nine new physical families include the canonical holder. Existing app wrappers/codecs/editions commit in the same canonical transaction. Source keys, instance/write epoch, hashes, original owner currentness, actual roster/requiredness, state and settled output joins have positive/negative probes. Backup/restore adopts original first-receipt resolve.v2. |
| B2 — fixed | `Plans/storage-plan.md:29547` | Eight derived physical identities were unregistered. | Eight independent MessagePack/key/schema/writer/retention/rebuild rows plus exact keyed composition. Census 344→353, materialized 320→329, later-feature 273→282. Exact stricter SP-278 token exemption preserves every original structural/secret guard; arbitrary/renamed/open/string tokens still fail. Storage validation has only four pending-policy references. |
| B3 — fixed | `Plans/Contracts_V0.md:24484` | Inline-only validation accepted oversize bodies and rejected legal payload references. | SP-337 BLAKE3/size/media-type addressing; durable resolved bytes must be canonical JSON and pass identical family checks. Exact 16,384/16,385 boundaries, large roster/recipient/target/constraint arrays, wrong/missing reference bytes, and complete stored-value encoded-size inventory. No new redb value cap. |
| B4 — fixed | `Plans/collaboration_event_payloads.schema.json:7` | Python `$` accepted final LF. | True-end lexical guards, fixed identifier/hash lengths and UUID/cursor/token/timestamp checks; both scopes, every present payload scalar, projection string leaf and nested source fields have isolated LF/type probes. |
| B5 — fixed | `scripts/pm_collaboration_events.py:502` | The selected family was not compared with EventRecord.event_type. | Every family/scope has sibling and unknown-family negatives. |
| B6 — fixed | `scripts/pm_collaboration_events.py:614` | Shape-only validation missed checkpoint joins. | Actual Storage instance, encoded partition, all nine token fields, admitted set, retained/examined bounds, inclusive cursor generation/sequence/frame offsets and original event identity/edition/write epoch are joined to independent capture; coherent populated and empty positives. Native token authentication remains NOT_RUN. |
| B7 — fixed | `scripts/pm_collaboration_events.py:1911` | Required negatives, eager optional-reference resolution, historical matrix and guard-removal proof were absent; several refusals were masked. | Per-family/scope replay-only writer negatives, transitive local-only reference closure, retained compatibility history versus forged/withdrawn/missing originals, failure-exit self-test, frozen valid/refusal pre-states and whole-lane decision/schema/integrity mutation table below. All oracles stay in scripts. |
| B8 — fixed | `Plans/storage-plan.md:30113` | Completion trusted the caller's slot list. | Frozen original-definition requiredness is captured independently and retained in run state. Completion must match it and recorded waivers, close attempts and match the recorded Plan/artifact outputs. A failed required member cannot disappear through `required_slot_ids=[]`; explicit Chat Room End still completes without an invented waiver action. |
| S1 — fixed | `Plans/Collaborative_Workflows.md:3771` | Assigned CW prefix collided with chain-wizard's namespace. | CWR-105..123 replace the lane's old prefix everywhere live. chain-wizard.md is byte-unchanged. |
| S2 — fixed | `Plans/Collaborative_Workflows.md:3780` | Open item 10 ignored Jared's later answer. | E-CARDS-1 item 1c A / DL-404: run, participant, transcript, proposal and finding records in both scopes follow their chat; attached vote/disposition custody follows its owner. Immediate tombstone, unheld 24h active/30d backup purge; holds postpone purge without disclosure. Replaces app one-year rule. Shared artifacts/original receipts retain independent custody. Historical DL-092 quotation is unchanged. Open item 10 retired. |
| S3 — fixed | `scripts/pm_collaboration_events.py:1353` | A new test-module permission was treated as necessary. | Every added oracle and mutation runner is in this script; no test file is added or edited. |
| S4 — preserved | `Plans/storage-plan.md:29563` | Static preparation cannot prove native execution or governance. | All native obligations remain NOT_RUN; no event registry/admission/Decision Log/governance/frozen-validator edit. |

## Authority, bindings and premise checks

DL-090's bounded technical-binding authority still applies to these same 17 names, one shared runtime/four protocols; DL-091 supplies the eighteenth `collaboration.failed`. Existing CWR-045/CV-366 application kinds/roles remain intact. No new feature, command, state, retention choice or user interaction is selected. DL-092's event-chat lifetime still holds under DL-292. The separately recorded E-CARDS-1 1c A replaces the former unresolved record-lifetime premise; the historical DL-092 quotation is preserved. DL-087 retirement still prohibits aliases/backfill.

**Search evidence:** `DC-binding-search.md` retains each family's literal/token/CamelCase/family/schema search and scoped negative evidence, plus the round-one source-holder/key/schema search. Existing owner record types and SP-351 app keys/codecs are reused unchanged. The new canonical `collaboration_prepared_source` holder/key/table, its 36 scoped source definitions, exact keyed projection composition and additional source joins are newly authored owner contracts under DL-090 in SP-460 and each SP-461..478 unit. No source binding is inferred from a sibling.

**Reused owners:** SP-278 nine-field durable token/frontier; SP-286/CV-339 `storage.first_append_receipt.resolve.v2`; SP-336 sync grouping; SP-337 payload packs; CV-366 application idempotency and ordered source roles; BRS-033 coherent backup; existing typed CollaborativeDefinition/Run/ParticipantSpec/Disposition/Message/Proposal/Vote/Finding/ReviewTargetPack and app schema editions. The new typed-snapshot byte hash remains separate from original owner-issued currentness.

## Family grades before and after

Before is the independent Sol re-grade at `53e7b3abcd326f21bede067843344b7e62b0f059`, rather than the superseded original self-grade (162 PASS / 36 PARTIAL / 18 ABSENT). Criteria follow the twelve-cell rubric; native NOT_RUN is separate.

| Family | Units CWR / CV / SP / ATS | Before P/Q/A | After P/Q/A |
|---|---|---|---|
| `collaboration.created` | CWR-106 / CV-461 / SP-461 / ATS-231 | 5 / 6 / 1 | 10 / 1 / 1 |
| `collaboration.started` | CWR-107 / CV-462 / SP-462 / ATS-232 | 5 / 6 / 1 | 10 / 1 / 1 |
| `collaboration.paused` | CWR-108 / CV-463 / SP-463 / ATS-233 | 5 / 6 / 1 | 10 / 1 / 1 |
| `collaboration.resumed` | CWR-109 / CV-464 / SP-464 / ATS-234 | 5 / 6 / 1 | 10 / 1 / 1 |
| `collaboration.cancelled` | CWR-110 / CV-465 / SP-465 / ATS-235 | 5 / 6 / 1 | 10 / 1 / 1 |
| `collaboration.completed` | CWR-111 / CV-466 / SP-466 / ATS-236 | 4 / 7 / 1 | 10 / 1 / 1 |
| `collaboration.failed` | CWR-112 / CV-467 / SP-467 / ATS-237 | 5 / 6 / 1 | 10 / 1 / 1 |
| `collaboration.participant_started` | CWR-113 / CV-468 / SP-468 / ATS-238 | 5 / 6 / 1 | 10 / 1 / 1 |
| `collaboration.participant_completed` | CWR-114 / CV-469 / SP-469 / ATS-239 | 5 / 6 / 1 | 10 / 1 / 1 |
| `collaboration.message_added` | CWR-115 / CV-470 / SP-470 / ATS-240 | 5 / 6 / 1 | 10 / 1 / 1 |
| `collaboration.artifact_added` | CWR-116 / CV-471 / SP-471 / ATS-241 | 5 / 6 / 1 | 10 / 1 / 1 |
| `collaboration.configuration_changed` | CWR-117 / CV-472 / SP-472 / ATS-242 | 5 / 6 / 1 | 10 / 1 / 1 |
| `brainstorm.proposal_added` | CWR-118 / CV-473 / SP-473 / ATS-243 | 5 / 6 / 1 | 10 / 1 / 1 |
| `brainstorm.vote_added` | CWR-119 / CV-474 / SP-474 / ATS-244 | 5 / 6 / 1 | 10 / 1 / 1 |
| `brainstorm.plan_synthesized` | CWR-120 / CV-475 / SP-475 / ATS-245 | 5 / 6 / 1 | 10 / 1 / 1 |
| `review.finding_added` | CWR-121 / CV-476 / SP-476 / ATS-246 | 5 / 6 / 1 | 10 / 1 / 1 |
| `review.finding_dispositioned` | CWR-122 / CV-477 / SP-477 / ATS-247 | 5 / 6 / 1 | 10 / 1 / 1 |
| `review.artifact_finalized` | CWR-123 / CV-478 / SP-478 / ATS-248 | 5 / 6 / 1 | 10 / 1 / 1 |

**Totals:** 89 PASS / 109 PARTIAL / 18 ABSENT → 180 PASS / 18 PARTIAL / 18 ABSENT. Producer/source, schema, identity, checkpoint/consumer and oracle cells close; completed transitions also close. Retention remains PARTIAL pending its policy object; membership remains ABSENT until individual admissions. The exact current evidence quotes and file/line hashes are in `DC-selfgrade.json`.

## Standing checks and Astra probes

| Check | Evidence and result |
|---|---|
| 1 replay-only current writes | Every family in both scopes refuses it. Historical-only validation is a separate mode and accepts retained replay-only originals. |
| 2 app idempotency | Exact CV-366 application@1:hex(server):hex(owner_operation_id), tested for all 18. |
| 3 project partition | Project positives use project~base64url_no_pad; source and checkpoint joins independently re-encode it. |
| 4 payload store | Exact size boundary plus all four large arrays; resolved size/BLAKE3/type/canonical bytes and complete stored-part size inventory. |
| 5 trailing LF | True-end patterns and exact fixed lengths; scalar/nested/array and both-edition LF negatives. |
| 6 semantic-only retry | Body-only digest; changing Storage-assigned sequence/observed/persisted metadata preserves prepared validation and digest. Frozen caller metadata remains independently bound. |
| 7 checkpoint coherence | Populated/empty positives; independent instance/token/partition/coverage/cursor/event negatives. |
| 8 failure exit | Self-test injects one failure and requires CLI exit 1; success exit is rejected. |
| 9 every reference | Eager transitive local-only closure, including optional and conditional paths never visited by positives. Dangling optional parent_run_id ref fails. |
| 10 historical originals | Retained valid originals survive changed live run/revision/epoch; compatibility replay-only originals accepted; forged/withdrawn/not-retained originals refused. |
| 11 guard proof | Complete table below: exact in-memory guard/group removal, own negatives flip, all other layer negatives retain their unchanged rejection witness; no installed rule is weakened. |

Astra classes: independently captured original identities/currentness/roster/output facts reject coherent caller forgeries; snapshot byte hashes and semantic digests are recomputed. Assigned Storage metadata is excluded from semantic identity and checkpoint metadata joins independently captured controls. Type guards reject string booleans/numbers, nulls, arrays and nested objects. Numeric vectors cover 1/1.0/1e0, -0/-0.0, illegal 01, fractions, large exact integers and nonfinite forms; equivalent admitted numeric forms keep all family/scope identities and digests equal. Complete EventRecord/source/projection/checkpoint encoded sizes are reported, with no invented redb size cap. Custody checks precede prepared candidate use and original recovery; the retained reader never reaches the current-writer replay guard. These are synthetic/static probes; native source authentication, durable storage, frame/token verification and execution remain NOT_RUN.

## Verification

- **checker.json:** `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DC/fix1/checker.json`, SHA-256 `f3506e73e6bbfdfddfb5fbdc665018e58b3cae22957b9d17e2961029f7c91c53`.
- **self-test.json:** `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DC/fix1/self-test.json`, SHA-256 `e74b3f23725bf84ac14e4124b8795e115860b671aeae9b06af540067bbce16a6`.
- **shards-generate.json:** `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DC/fix1/shards-generate.json`, SHA-256 `e761a36e74b89b08efde4b957b4b4e1450e667c8a86d851168696b24560db79f`.
- **index-generate.json:** `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DC/fix1/index-generate.json`, SHA-256 `1dd8ee9893985ec52bc836f9d9bc7c29d334a5f08a3c72e3460f51bc5baec226`.
- **shards-check.json:** `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DC/fix1/shards-check.json`, SHA-256 `7cf91cf260a3b16ea46f61eeab3869624a20e70056cbfa0b72c30ed3f377c49d`.
- **index-validate-base.json:** `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DC/fix1/index-validate-base.json`, SHA-256 `17c696d5669298866a819218236471a004a0e002ff6664d395b21cb849de73f3`.
- **index-validate-current-main.json:** `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DC/fix1/index-validate-current-main.json`, SHA-256 `9affad6323a9a2de26c566d50684d922291abca5f45e904b4d59e93ad7b0aab8`.
- **index-baseline-context.json:** `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DC/fix1/index-baseline-context.json`, SHA-256 `b9d535220660a4e64c9a09abd3306ce78b710b2f41f18ac44e0ed712ccf0b4f0`.
- **storage-bindings-check.json:** `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DC/fix1/storage-bindings-check.json`, SHA-256 `39dad48179569f785f979c5eac66330802a18e7f1627e246f9d93054d0477ba2`.
- **currentness-copy.json:** `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DC/fix1/currentness-copy.json`, SHA-256 `da0c956cfefce235326d18225ff3d69b9bec89b3b7514e1d83f928c340bb10c8`.
- **scope-check.json:** `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DC/fix1/scope-check.json`, SHA-256 `6b5dc64b038c0012b51a0985e700db5edbfe99d9a3e05273ce7738ae357744c7`.
- **source-binding-search.json:** `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DC/fix1/source-binding-search.json`, SHA-256 `e779990ef27f563d32ef5ef96b81bd566141b318a35dd5e1c5a6aa24606022f5`.
- **guard-removal-initial.json:** `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DC/fix1/guard-removal-initial.json`, SHA-256 `ff1056b954530bebe9314e8d2fdc4903b6c7967c73a95fdd8795a88cfc4ae038`.
- **corrected-proof-rows.json:** `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DC/fix1/corrected-proof-rows.json`, SHA-256 `8ebb526c8ab050e12e0aad205f499c351657de02d769203730fa54e2adc1f025`.
- **guard-removal.json:** `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DC/fix1/guard-removal.json`, SHA-256 `6fbd3502cd13aa0d22951be3a8a9b7695c0d7b5f1df6c31fd6744377ad0c744f`.

Checker, self-test, shard generation/check, index generation and branch-base index validation exited 0 with top-level pass. The final ordinary index validation against concurrently advanced origin/main exits 1: 21 untouched legacy decision-ledger format errors plus DL-302 absent from this older branch. Its coverage/acceptance counts still pass. The unchanged checker passes against original merge base be4766513ff71776346fc73b84f2542990f955af using isolated temporary bare Git metadata and the same worktree; no shared ref is changed. Both results and the baseline context are retained. This is integration drift, not a repair to foreign Decision Log/ledger files in this lane. Storage registry validation reports exactly four unknown-policy references: three existing app source rows and the new prepared-source row; every one waits for the separate RP-CHAT-THREAD-LIFETIME landing. The currentness edition copy has 15/15 identical files. Regeneration changes only the three edited Markdown shard groups and the edited Storage value registry group; the Collaborative Workflows owner is not sharded. Full landing/reseal checks are not claimed from this sparse preparation worktree.

## Remaining integration items

1. Materialize/integrate the already decided Chat retention-policy object and successor mechanics on the assigned Storage branch; no new lifetime question.
2. Integrate the 18 prepared event rows later, one family per admission, with the existing DL-096 authority lineage, closed-world admission guards and required independent reviews. No admission here.
3. Reconcile Commands_System's approved eighteenth name/count mechanically in its owner lane; no unit minted outside this lane's allocation.
4. Reconcile overlapping Storage census pins when combining branches; no test file changed here. Native producer/append/projector/reader/CAS/token/durability/deletion/restore proofs remain NOT_RUN.
5. Reconcile the advanced-main index baseline at integration: origin/main moved to bc399e19742ddc6afd1a1cb1d77a33845341d565 during the fix. This pinned branch has not deleted DL-302; it predates that added unit. Its 21 triggered legacy ledger-format errors are outside this lane. Branch-base validation passes; no foreign source is edited.
6. Request the assigned governance reseal after landing. This branch leaves expected governance staleness and does not refresh locks/evidence.

Former open items 2/3/4/5/8/10 are retired by this round (source binding, physical registrations, prefix, test-module request, app adoption, record lifetime). No finding is disputed or stopped for Jared.

**IDs used:** CWR-105..123, CV-460..478, SP-460..478, ATS-230..248. No OSI, new DL, event-family admission or WorkNode ID. chain-wizard's CW namespace is untouched.

## Whole-lane guard-removal table

**Result:** 3319 rows: 116 decision, 3135 schema, 68 integrity. Zero masked negatives; zero unexpected changes; every row has flipping negatives. Read-only gate proof only, excluding native decode/commit/authentication.

**Run provenance:** the initial full matrix at `9d1804bf76dc65688e40cfe90082c389e583f33c` exited 1 with three masked rows. The final cumulative table refreshes all 116 decision rows, the two affected shared-type groups and all three registry-membership integrity rows. It retains 3,198 passing rows whose schemas, fixtures, readiness code and checker targets did not change. The complete Plans tree is byte-identical to that initial code commit. The two shared-type rows name the nullable oneOf exclusivity duplicates; only in those in-memory mutants is exclusivity removed while preserving every branch constraint. Imported canonical owner schemas remain unchanged. The registry check now distinguishes an actually missing row from a present mismatched row. The parent output, corrected rows and exact input/code hashes are retained in the proof_runs record; no second full-matrix execution is claimed.

Schema rows name every assertion removed in a logical invariant/duplicate group (for example a regex and its exact-length constraint). Required fields, including Review target_pack_ref and target_hashes, are separate rules. Scope-conditioned constraints use explicit known discriminator domains, preventing an unrelated fallback from masking a removed guard. Nullable disjoint alternatives retain equivalent accepted languages. The unchanged installation retains all guards.

The complete negative IDs are in the SHA-bound `guard-removal.json` manifests above. `dN`, `sN`, `iN` below mean the one-based Nth decision/schema/integrity manifest entry. A range denotes every index inclusively. `D`, `S`, `I` mean the whole corresponding manifest; `\ F` is its complement after removing that row’s flipping set. The complement count and SHA-256 are independently recorded in the JSON. Unchanged control-flow/schema assertions on unchanged values are rejection witnesses; affected cases are reevaluated. Thus each row specifies both exact sets without copying thousands of unchanged IDs.

| Guard / named duplicate group | Negatives that flip | Negatives that stay rejected |
|---|---|---|
| `payload_rejection:229:valid_utc_datetime` | d16, d97, d195, d319, d387, d476, d1036, d1100, d1156, d1269, d1435, d1519, d1638, d1673, d1776, d1823, d2969, d3033 | D \ F (3069) |
| `payload_rejection:231:identity_recipe` | d17, d98, d196, d320, d388, d477, d1037, d1101, d1157, d1270, d1436, d1520, d1639, d1674, d1777, d1824, d1913, d1937, d1962, d1987, d2012, d2037, d2062, d2086, d2111, d2135, d2161, d2186, d2211, d2237, d2264, d2290, d2317, d2341, d2366, d2391, d2417, d2442, d2467, d2491, d2516, d2540, d2565, d2589, d2614, d2639, d2665, d2691, d2718, d2744, d2770, d2794, d2818, d2842, d2866, d2890, d2970, d3034 | D \ F (3029) |
| `payload_rejection:233:revision_rule` | d391 | D \ F (3086) |
| `payload_rejection:235:review_counts` | d95 | D \ F (3086) |
| `retention_rejection:483:retention_missing` | d1874 | D \ F (3086) |
| `retention_rejection:487:retention_values` | d1870–d1873, d1875–d1877 | D \ F (3080) |
| `envelope_rejection:504:event_record_schema` | d239, d253, d278, d625, d636, d647, d658, d669, d680, d691, d702, d713, d724, d735, d746, d757, d768, d779, d790, d801, d812, d823, d834, d845, d856, d867, d878, d889, d900, d911, d922, d933, d944, d955, d966, d977, d988, d999, d1010 | D \ F (3048) |
| `envelope_rejection:506:event_type` | d631–d632, d642–d643, d653–d654, d664–d665, d675–d676, d686–d687, d697–d698, d708–d709, d719–d720, d730–d731, d741–d742, d752–d753, d763–d764, d774–d775, d785–d786, d796–d797, d807–d808, d818–d819, d829–d830, d840–d841, d851–d852, d862–d863, d873–d874, d884–d885, d895–d896, d906–d907, d917–d918, d928–d929, d939–d940, d950–d951, d961–d962, d972–d973, d983–d984, d994–d995, d1005–d1006, d1016–d1017 | D \ F (3015) |
| `envelope_rejection:511:scope_kind` | d615–d616 | D \ F (3085) |
| `envelope_rejection:513:redaction_profile` | d617 | D \ F (3086) |
| `envelope_rejection:515:replay_policy` | d618, d629, d640, d651, d662, d673, d684, d695, d706, d717, d728, d739, d750, d761, d772, d783, d794, d805, d816, d827, d838, d849, d860, d871, d882, d893, d904, d915, d926, d937, d948, d959, d970, d981, d992, d1003, d1014 | D \ F (3050) |
| `envelope_rejection:517:node_join` | d614 | D \ F (3086) |
| `envelope_rejection:520:attempt_join` | d610 | D \ F (3086) |
| `envelope_rejection:522:payload_envelope_identity` | d532, d537, d542, d547, d552, d557, d562, d567, d572, d577, d582, d587, d592, d597, d602, d607, d613, d619, d622, d1023 | D \ F (3067) |
| `envelope_rejection:525:payload_schema_id` | d530, d534–d535, d539–d540, d544–d545, d549–d550, d554–d555, d559–d560, d564–d565, d569–d570, d574–d575, d579–d580, d584–d585, d589–d590, d594–d595, d599–d600, d604–d605, d609, d620, d624, d1021, d1025 | D \ F (3051) |
| `envelope_rejection:527:occurred_at_join` | d531, d536, d541, d546, d551, d556, d561, d566, d571, d576, d581, d586, d591, d596, d601, d606, d621, d1022 | D \ F (3069) |
| `envelope_rejection:529:identity_recipe` | d533, d538, d543, d548, d553, d558, d563, d568, d573, d578, d583, d588, d593, d598, d603, d608, d611, d623, d1024 | D \ F (3068) |
| `envelope_rejection:531:payload` | d628, d639, d650, d661, d672, d683, d694, d705, d716, d727, d738, d749, d760, d771, d782, d793, d804, d815, d826, d837, d848, d859, d870, d881, d892, d903, d914, d925, d936, d947, d958, d969, d980, d991, d1002, d1013 | D \ F (3051) |
| `representation_rejection:537:inline_limit` | d182, d290–d292, d514–d518, d1203 | D \ F (3077) |
| `representation_rejection:539:reference_inline_body` | d521, d612 | D \ F (3085) |
| `reference_rejection:546:reference_format` | d519 | D \ F (3086) |
| `reference_rejection:548:reference_missing` | d522, d627, d638, d649, d660, d671, d682, d693, d704, d715, d726, d737, d748, d759, d770, d781, d792, d803, d814, d825, d836, d847, d858, d869, d880, d891, d902, d913, d924, d935, d946, d957, d968, d979, d990, d1001, d1012 | D \ F (3050) |
| `reference_rejection:552:reference_size` | d523, d635, d646, d657, d668, d679, d690, d701, d712, d723, d734, d745, d756, d767, d778, d789, d800, d811, d822, d833, d844, d855, d866, d877, d888, d899, d910, d921, d932, d943, d954, d965, d976, d987, d998, d1009, d1020 | D \ F (3050) |
| `reference_rejection:554:reference_hash` | d520, d634, d645, d656, d667, d678, d689, d700, d711, d722, d733, d744, d755, d766, d777, d788, d799, d810, d821, d832, d843, d854, d865, d876, d887, d898, d909, d920, d931, d942, d953, d964, d975, d986, d997, d1008, d1019 | D \ F (3050) |
| `reference_rejection:559:reference_json` | d1812 | D \ F (3086) |
| `reference_rejection:561:reference_canonical` | d1811 | D \ F (3086) |
| `checkpoint_rejection:620:checkpoint_instance` | d242, d256, d267, d281 | D \ F (3083) |
| `checkpoint_rejection:622:checkpoint_partition` | d257, d268, d282 | D \ F (3084) |
| `checkpoint_rejection:626:checkpoint_token` | d244–d250, d258–d264, d269–d275, d283–d289 | D \ F (3059) |
| `checkpoint_rejection:628:checkpoint_admitted` | d237, d251, d265, d276 | D \ F (3083) |
| `checkpoint_rejection:631:checkpoint_coverage` | d240–d241, d254–d255, d279–d280 | D \ F (3081) |
| `checkpoint_rejection:635:checkpoint_cursor` | d238, d252, d277 | D \ F (3084) |
| `checkpoint_rejection:637:checkpoint_event` | d239, d253, d278 | D \ F (3084) |
| `checkpoint_rejection:639:checkpoint_cursor` | d266 | D \ F (3086) |
| `historical_rejection:646:historical_withdrawn` | d633, d644, d655, d666, d677, d688, d699, d710, d721, d732, d743, d754, d765, d776, d787, d798, d809, d820, d831, d842, d853, d864, d875, d886, d897, d908, d919, d930, d941, d952, d963, d974, d985, d996, d1007, d1018 | D \ F (3051) |
| `historical_rejection:648:historical_not_retained` | d630, d641, d652, d663, d674, d685, d696, d707, d718, d729, d740, d751, d762, d773, d784, d795, d806, d817, d828, d839, d850, d861, d872, d883, d894, d905, d916, d927, d938, d949, d960, d971, d982, d993, d1004, d1015 | D \ F (3051) |
| `historical_rejection:650:historical_forged` | d626, d637, d648, d659, d670, d681, d692, d703, d714, d725, d736, d747, d758, d769, d780, d791, d802, d813, d824, d835, d846, d857, d868, d879, d890, d901, d912, d923, d934, d945, d956, d967, d978, d989, d1000, d1011 | D \ F (3051) |
| `source_rejection:665:source_context_missing` | d1904, d1928, d1952, d1977, d2002, d2027, d2053, d2077, d2102, d2126, d2151, d2176, d2202, d2228, d2255, d2281, d2308, d2332, d2357, d2382, d2408, d2433, d2458, d2482, d2507, d2531, d2556, d2580, d2605, d2630, d2656, d2682, d2709, d2735, d2761, d2785, d2809, d2833, d2857, d2881 | D \ F (3047) |
| `source_rejection:668:source_instance` | d1919, d1943, d1968, d1993, d2018, d2043, d2068, d2092, d2117, d2141, d2167, d2192, d2219, d2245, d2272, d2298, d2323, d2347, d2373, d2398, d2423, d2448, d2473, d2497, d2522, d2546, d2571, d2595, d2621, d2646, d2673, d2699, d2724, d2750, d2776, d2800, d2824, d2848, d2872, d2896 | D \ F (3047) |
| `source_rejection:670:source_epoch` | d1915, d1939, d1964, d1989, d2014, d2039, d2064, d2088, d2113, d2137, d2163, d2188, d2213, d2239, d2266, d2292, d2319, d2343, d2369, d2394, d2419, d2444, d2469, d2493, d2518, d2542, d2567, d2591, d2617, d2642, d2668, d2694, d2720, d2746, d2772, d2796, d2820, d2844, d2868, d2892 | D \ F (3047) |
| `source_rejection:672:source_key` | d1920, d1944, d1969, d1994, d2019, d2044, d2069, d2093, d2118, d2142, d2168, d2193, d2220, d2246, d2273, d2299, d2324, d2348, d2374, d2399, d2424, d2449, d2474, d2498, d2523, d2547, d2572, d2596, d2622, d2647, d2674, d2700, d2726, d2752, d2777, d2801, d2825, d2849, d2873, d2897 | D \ F (3047) |
| `source_rejection:674:source_partition` | d1917, d1941, d1966, d1991, d2016, d2041, d2066, d2090, d2115, d2139, d2165, d2190, d2217, d2243, d2270, d2296, d2321, d2345, d2371, d2396, d2421, d2446, d2471, d2495, d2520, d2544, d2569, d2593, d2619, d2644, d2671, d2697, d2722, d2748, d2774, d2798, d2822, d2846, d2870, d2894 | D \ F (3047) |
| `source_rejection:676:source_operation` | d1910, d1934, d1958, d1983, d2008, d2033, d2059, d2083, d2108, d2132, d2158, d2183, d2208, d2234, d2261, d2287, d2314, d2338, d2363, d2388, d2414, d2439, d2464, d2488, d2513, d2537, d2562, d2586, d2611, d2636, d2662, d2688, d2715, d2741, d2767, d2791, d2815, d2839, d2863, d2887 | D \ F (3047) |
| `source_rejection:678:source_event_id` | d1901, d1925, d1949, d1974, d1999, d2024, d2050, d2074, d2099, d2123, d2148, d2173, d2199, d2225, d2252, d2278, d2305, d2329, d2354, d2379, d2405, d2430, d2455, d2479, d2504, d2528, d2553, d2577, d2602, d2627, d2653, d2679, d2706, d2732, d2758, d2782, d2806, d2830, d2854, d2878 | D \ F (3047) |
| `source_rejection:680:source_digest` | d1918, d1942, d1967, d1992, d2017, d2042, d2067, d2091, d2116, d2140, d2166, d2191, d2218, d2244, d2271, d2297, d2322, d2346, d2372, d2397, d2422, d2447, d2472, d2496, d2521, d2545, d2570, d2594, d2620, d2645, d2672, d2698, d2723, d2749, d2775, d2799, d2823, d2847, d2871, d2895 | D \ F (3047) |
| `source_rejection:682:source_record_digest` | d1907, d1912, d1931, d1936, d1955, d1960, d1980, d1985, d2005, d2010, d2030, d2035, d2056, d2061, d2080, d2085, d2105, d2110, d2129, d2134, d2154, d2160, d2179, d2185, d2205, d2210, d2231, d2236, d2258, d2263, d2284, d2289, d2311, d2316, d2335, d2340, d2360, d2365, d2385, d2390, d2411, d2416, d2436, d2441, d2461, d2466, d2485, d2490, d2510, d2515, d2534, d2539, d2559, d2564, d2583, d2588, d2608, d2613, d2633, d2638, d2659, d2664, d2685, d2690, d2712, d2717, d2738, d2743, d2764, d2769, d2788, d2793, d2812, d2817, d2836, d2841, d2860, d2865, d2884, d2889 | D \ F (3007) |
| `source_rejection:684:source_record_ref` | d1906, d1911, d1930, d1935, d1954, d1959, d1979, d1984, d2004, d2009, d2029, d2034, d2055, d2060, d2079, d2084, d2104, d2109, d2128, d2133, d2153, d2159, d2178, d2184, d2204, d2209, d2230, d2235, d2257, d2262, d2283, d2288, d2310, d2315, d2334, d2339, d2359, d2364, d2384, d2389, d2410, d2415, d2435, d2440, d2460, d2465, d2484, d2489, d2509, d2514, d2533, d2538, d2558, d2563, d2582, d2587, d2607, d2612, d2632, d2637, d2658, d2663, d2684, d2689, d2711, d2716, d2737, d2742, d2763, d2768, d2787, d2792, d2811, d2816, d2835, d2840, d2859, d2864, d2883, d2888 | D \ F (3007) |
| `source_rejection:692:source_record_identity` | d1905, d1914, d1929, d1938, d1953, d1963, d1978, d1988, d2003, d2013, d2028, d2038, d2054, d2063, d2078, d2087, d2103, d2112, d2127, d2136, d2152, d2162, d2177, d2187, d2203, d2212, d2229, d2238, d2256, d2265, d2282, d2291, d2309, d2318, d2333, d2342, d2358, d2367, d2383, d2392, d2409, d2418, d2434, d2443, d2459, d2468, d2483, d2492, d2508, d2517, d2532, d2541, d2557, d2566, d2581, d2590, d2606, d2615, d2631, d2640, d2657, d2666, d2683, d2692, d2710, d2719, d2736, d2745, d2762, d2771, d2786, d2795, d2810, d2819, d2834, d2843, d2858, d2867, d2882, d2891 | D \ F (3007) |
| `source_rejection:695:source_record_state` | d2368, d2393, d2616, d2641, d2667, d2693 | D \ F (3081) |
| `source_rejection:697:source_envelope_metadata` | d1903, d1927, d1951, d1976, d2001, d2026, d2052, d2076, d2101, d2125, d2150, d2175, d2201, d2227, d2254, d2280, d2307, d2331, d2356, d2381, d2407, d2432, d2457, d2481, d2506, d2530, d2555, d2579, d2604, d2629, d2655, d2681, d2708, d2734, d2760, d2784, d2808, d2832, d2856, d2880 | D \ F (3047) |
| `source_rejection:699:source_output_refs` | d2157, d2182 | D \ F (3085) |
| `source_rejection:701:source_attempt` | d2400, d2425, d2701, d2727 | D \ F (3083) |
| `source_rejection:705:source_waiver` | d2725, d2751 | D \ F (3085) |
| `source_rejection:709:source_participant_identity` | d1961, d1986, d2011, d2036 | D \ F (3083) |
| `source_rejection:713:source_review_pack` | d2670, d2696 | D \ F (3085) |
| `source_rejection:717:source_application_context` | d1896, d2045, d2094, d2143, d2194, d2247, d2300, d2349, d2450, d2499, d2548, d2597, d2648, d2753 | D \ F (3073) |
| `source_rejection:719:source_required_slots` | d1909, d1916, d1933, d1940, d1957, d1965, d1982, d1990, d2007, d2015, d2032, d2040, d2058, d2065, d2082, d2089, d2107, d2114, d2131, d2138, d2156, d2164, d2181, d2189, d2207, d2214–d2215, d2233, d2240–d2241, d2260, d2267–d2268, d2286, d2293–d2294, d2313, d2320, d2337, d2344, d2362, d2370, d2387, d2395, d2413, d2420, d2438, d2445, d2463, d2470, d2487, d2494, d2512, d2519, d2536, d2543, d2561, d2568, d2585, d2592, d2610, d2618, d2635, d2643, d2661, d2669, d2687, d2695, d2714, d2721, d2740, d2747, d2766, d2773, d2790, d2797, d2814, d2821, d2838, d2845, d2862, d2869, d2886, d2893 | D \ F (3003) |
| `source_rejection:721:source_currentness` | d1899, d1923, d1947, d1972, d1997, d2022, d2048, d2072, d2097, d2121, d2146, d2171, d2197, d2223, d2250, d2276, d2303, d2327, d2352, d2377, d2403, d2428, d2453, d2477, d2502, d2526, d2551, d2575, d2600, d2625, d2651, d2677, d2704, d2730, d2756, d2780, d2804, d2828, d2852, d2876 | D \ F (3047) |
| `source_rejection:725:source_slot_roster` | d1908, d1932, d1956, d1981, d2006, d2031, d2057, d2081, d2106, d2130, d2155, d2180, d2206, d2216, d2232, d2242, d2259, d2269, d2285, d2295, d2312, d2336, d2361, d2386, d2412, d2437, d2462, d2486, d2511, d2535, d2560, d2584, d2609, d2634, d2660, d2686, d2713, d2739, d2765, d2789, d2813, d2837, d2861, d2885 | D \ F (3043) |
| `source_rejection:727:source_payload` | d1913, d1937, d1962, d1987, d2012, d2037, d2062, d2086, d2111, d2135, d2161, d2186, d2211, d2237, d2264, d2290, d2317, d2341, d2366, d2391, d2417, d2442, d2467, d2491, d2516, d2540, d2565, d2589, d2614, d2639, d2665, d2691, d2718, d2744, d2770, d2794, d2818, d2842, d2866, d2890 | D \ F (3047) |
| `prepared_event_rejection:739:prepared_body` | d1897, d1921, d1945, d1970, d1995, d2020, d2046, d2070, d2095, d2119, d2144, d2169, d2195, d2221, d2248, d2274, d2301, d2325, d2350, d2375, d2401, d2426, d2451, d2475, d2500, d2524, d2549, d2573, d2598, d2623, d2649, d2675, d2702, d2728, d2754, d2778, d2802, d2826, d2850, d2874 | D \ F (3047) |
| `prepared_event_rejection:741:prepared_envelope_metadata` | d1900, d1924, d1948, d1973, d1998, d2023, d2049, d2073, d2098, d2122, d2147, d2172, d2198, d2224, d2251, d2277, d2304, d2328, d2353, d2378, d2404, d2429, d2454, d2478, d2503, d2527, d2552, d2576, d2601, d2626, d2652, d2678, d2705, d2731, d2757, d2781, d2805, d2829, d2853, d2877 | D \ F (3047) |
| `admission_rejection:973:idempotency_conflict` | d164, d167, d176, d181, d507, d512, d526, d1231, d1879, d1881, d1894 | D \ F (3076) |
| `admission_rejection:976:quarantined` | d1087–d1088, d1233 | D \ F (3084) |
| `transition_rejection:993:conflict:already_created` | d527, d1232 | D \ F (3085) |
| `transition_rejection:997:conflict:definition_not_recorded` | d524, d1235 | D \ F (3085) |
| `transition_rejection:1000:conflict:lineage_mismatch` | d1236 | D \ F (3086) |
| `transition_rejection:1004:conflict:already_started` | d1234 | D \ F (3086) |
| `transition_rejection:1006:conflict:stale_definition_revision` | d1230 | D \ F (3086) |
| `transition_rejection:1011:conflict:run_not_started` | d1, d1238, d1596 | D \ F (3084) |
| `transition_rejection:1015:conflict:lineage_mismatch` | d2, d169–d170, d1242 | D \ F (3083) |
| `transition_rejection:1019:conflict:already_terminal` | d510, d525, d1241, d1256, d1598, d1889, d1895 | D \ F (3080) |
| `transition_rejection:1023:conflict:stale_definition_revision` | d528, d1240 | D \ F (3085) |
| `family_rejection:1034:conflict:run_state_invalid` | d1222, d1599–d1600 | D \ F (3084) |
| `family_rejection:1036:conflict:stale_lifecycle_seq` | d1237, d1602 | D \ F (3085) |
| `family_rejection:1038:conflict:open_attempts` | d509, d1239, d1597, d1893 | D \ F (3083) |
| `family_rejection:1041:conflict:required_slot_set_mismatch` | d1223 | D \ F (3086) |
| `family_rejection:1043:conflict:waived_slot_set_mismatch` | d1224 | D \ F (3086) |
| `family_rejection:1045:conflict:unresolved_required_slots` | d354, d1226 | D \ F (3085) |
| `family_rejection:1047:conflict:missing_output` | d175, d1255, d1878 | D \ F (3084) |
| `family_rejection:1049:conflict:output_refs_mismatch` | d356–d357 | D \ F (3085) |
| `family_rejection:1053:conflict:run_state_invalid` | d1209, d1601 | D \ F (3085) |
| `family_rejection:1058:conflict:slot_not_in_roster` | d529, d1210 | D \ F (3085) |
| `family_rejection:1060:conflict:attempt_already_started` | d166, d1208 | D \ F (3085) |
| `family_rejection:1062:conflict:stale_assignment_revision` | d1211 | D \ F (3086) |
| `family_rejection:1069:conflict:unknown_attempt` | d165, d1213 | D \ F (3085) |
| `family_rejection:1071:conflict:attempt_already_closed` | d168, d1212 | D \ F (3085) |
| `family_rejection:1074:conflict:slot_not_in_roster` | d1207 | D \ F (3086) |
| `family_rejection:1076:conflict:attempt_already_closed` | d1206 | D \ F (3086) |
| `family_rejection:1078:conflict:waiver_not_recorded` | d355, d1225 | D \ F (3085) |
| `family_rejection:1081:conflict:message_already_written` | d513, d1204 | D \ F (3085) |
| `family_rejection:1083:conflict:sequence_gap` | d511, d1205 | D \ F (3085) |
| `family_rejection:1086:conflict:slot_not_in_roster` | d1228 | D \ F (3086) |
| `family_rejection:1089:conflict:unknown_attempt` | d1227 | D \ F (3086) |
| `family_rejection:1092:conflict:artifact_already_added` | d508, d1229 | D \ F (3085) |
| `family_rejection:1095:conflict:unknown_proposal` | d171, d1216 | D \ F (3085) |
| `family_rejection:1098:conflict:unknown_attempt` | d174, d1220 | D \ F (3085) |
| `family_rejection:1102:conflict:not_core_participant` | d180, d1221 | D \ F (3085) |
| `family_rejection:1104:conflict:proposal_already_added` | d178, d1219 | D \ F (3085) |
| `family_rejection:1107:conflict:wonderer_cannot_vote` | d172, d1217 | D \ F (3085) |
| `family_rejection:1109:conflict:attempt_not_current` | d173, d1215 | D \ F (3085) |
| `family_rejection:1111:conflict:vote_already_added` | d179, d1214 | D \ F (3085) |
| `family_rejection:1114:conflict:already_synthesized` | d177, d1218 | D \ F (3085) |
| `family_rejection:1117:conflict:target_hash_mismatch` | d1245, d1890 | D \ F (3085) |
| `family_rejection:1119:conflict:slot_not_in_roster` | d1244, d1891 | D \ F (3085) |
| `family_rejection:1121:conflict:finding_already_added` | d1243, d1883 | D \ F (3085) |
| `family_rejection:1125:conflict:unknown_finding` | d1251, d1892 | D \ F (3085) |
| `family_rejection:1128:conflict:already_dispositioned` | d1250, d1882 | D \ F (3085) |
| `family_rejection:1130:conflict:target_hash_mismatch` | d1252 | D \ F (3086) |
| `family_rejection:1133:conflict:already_finalized` | d1246, d1888 | D \ F (3085) |
| `family_rejection:1135:conflict:findings_not_dispositioned` | d1248, d1880 | D \ F (3085) |
| `family_rejection:1137:conflict:artifact_not_added` | d1247, d1884 | D \ F (3085) |
| `family_rejection:1139:conflict:target_hash_mismatch` | d1249 | D \ F (3086) |
| `family_rejection:1141:conflict:partial_not_accepted` | d1253, d1885–d1886 | D \ F (3084) |
| `family_rejection:1143:conflict:stale_not_accepted` | d1254, d1887 | D \ F (3085) |
| `read_token_rejection:1583:read_token_exemption` | d1806–d1810 | D \ F (3082) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_created:additionalProperties` | s663, s17230 | S \ F (20306) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_created:required:definition_revision` | s635, s17247 | S \ F (20306) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/identifier:type` | s36, s134, s217, s504, s569, s653, s679–s680, s691–s692, s694–s695, s716–s717, s719–s720, s725–s726, s737–s738, s740–s741, s755–s756, s764–s765, s767–s768, s770–s771, s779–s780, s782–s783, s828–s829, s846–s847, s858–s859, s861–s862, s894–s895, s924–s925, s936–s937, s939–s940, s970–s971, s979–s980, s988–s989, s991–s992, s1015–s1016, s1030–s1031, s1033–s1034, s1036–s1037, s1067–s1068, s1079–s1080, s1085–s1086, s1088–s1089, s1100–s1101, s1103–s1104, s1133–s1134, s1136–s1137, s1151–s1152, s1154–s1155, s1163–s1164, s1181–s1182, s1184–s1185, s1206–s1207, s1218–s1219, s1221–s1222, s1224–s1225, s1230–s1231, s1248–s1249, s1251–s1252, s1272–s1273, s1275–s1276, s1287–s1288, s1290–s1291, s1296–s1297, s1299–s1300, s1323–s1324, s1330–s1331, s1342–s1343, s1345–s1346, s1351–s1352, s1354–s1355, s1378–s1379, s1384–s1385, s1387–s1388, s1399–s1400, s1402–s1403, s1405–s1406, s1436–s1437, s1442–s1443, s1451–s1452, s1454–s1455, s1478–s1479, s1490–s1491, s1496–s1497, s1499–s1500, s1508–s1509, s1511–s1512, s1523–s1524, s1536–s1537, s1548–s1549, s1554–s1555, s1557–s1558, s1566–s1567, s1569–s1570, s1581–s1582, s1587–s1588, s1605–s1606, s1611–s1612, s1614–s1615, s1638–s1639, s1641–s1642, s1660–s1661, s1669–s1670, s1675–s1676, s1678–s1679, s1702–s1703, s1705–s1706, s1717–s1718, s1732–s1733, s1744–s1745, s1747–s1748, s1750–s1751, s1769–s1770, s1781–s1782, s1790–s1791, s1793–s1794, s1799–s1800, s1802–s1803, s1814–s1815, s1817–s1818, s1820–s1821, s1838–s1839, s1841–s1842, s1853–s1854, s1862–s1863, s1868–s1869, s1871–s1872, s1874–s1875, s1877–s1878, s1883–s1884, s1886–s1887, s1889–s1890, s1913–s1914, s1926–s1927, s1929–s1930, s1947–s1948, s1950–s1951, s1953–s1954, s1977–s1978, s1980–s1981, s1992–s1993, s2013–s2014, s2016–s2017, s2019–s2020, s2037–s2038, s2053–s2054, s2059–s2060, s2068–s2069, s2071–s2072, s2074–s2075, s2092–s2093, s2095–s2096, s2113–s2114, s2116–s2117, s2119–s2120, s2122–s2123, s2125–s2126, s2128–s2129, s2131–s2132, s2162–s2163, s2168–s2169, s2171–s2172, s2174–s2175, s2198–s2199, s2210–s2211, s2213–s2214, s2216–s2217, s2219–s2220, s2243–s2244, s2259–s2260, s2265–s2266, s2268–s2269, s2271–s2272, s2274–s2275, s2298–s2299, s2304–s2305, s2319–s2320, s2331–s2332, s2337–s2338, s2340–s2341, s2355–s2356, s2359–s2360, s2374–s2375, s2377–s2378, s2383–s2384, s2389–s2390, s2392–s2393, s2407–s2408, s2410–s2411, s2413–s2414, s2428–s2429, s2431–s2432, s2434–s2435, s2465–s2466, s2471–s2472, s2474–s2475, s2477–s2478, s2498–s2499, s2513–s2514, s2562–s2563, s2565–s2566, s2584–s2585, s2587–s2588, s2606–s2607, s2609–s2610, s2628–s2629, s2631–s2632, s3199–s3200, s3202–s3203, s3220–s3221, s3239–s3240, s3248–s3249, s3251–s3252, s3254–s3255, s3257–s3258, s3263–s3264, s3278–s3279, s3281–s3282, s3299–s3300, s3305–s3306, s3326–s3327, s3347–s3348, s3353–s3354, s3356–s3357, s3368–s3369, s3380–s3381, s3387–s3388, s3396–s3397, s3399–s3400, s3402–s3403, s3408–s3409, s3414–s3415, s3417–s3418, s3429–s3430, s3441–s3442, s3447–s3448, s3450–s3451, s3459–s3460, s3462–s3463, s3473–s3476, s3495–s3502, s3544–s3551, s3558–s3561, s3580–s3587, s3612–s3615, s3628–s3631, s3638–s3641, s3660–s3667, s3709–s3716, s3723–s3726, s3745–s3752, s3777–s3780, s3793–s3796, s3803–s3806, s3825–s3832, s3874–s3881, s3888–s3891, s3910–s3917, s3942–s3945, s3958–s3965, s3972–s3975, s3994–s4001, s4043–s4054, s4067–s4074, s4163–s4166, s4189–s4192, s4211–s4218, s4278–s4281, s4328–s4331, s4350–s4357, s4446–s4449, s4472–s4475, s4494–s4501, s4561–s4564, s4611–s4614, s4633–s4640, s4729–s4732, s4755–s4758, s4777–s4784, s4844–s4847, s4895–s4898, s4917–s4924, s5013–s5016, s5040–s5043, s5062–s5069, s5129–s5132, s5145–s5148, s5161–s5168, s5205–s5208, s5233–s5236, s5249–s5256, s5310–s5313, s5326–s5329, s5342–s5349, s5392–s5395, s5420–s5423, s5436–s5443, s5503–s5506, s5519–s5530, s5600–s5603, s5610–s5613, s5619–s5626, s5680–s5683, s5707–s5710, s5716–s5723, s5799–s5802, s5809–s5812, s5818–s5825, s5873–s5876, s5900–s5903, s5909–s5916, s5986–s5989, s5996–s5999, s6005–s6012, s6060–s6063, s6087–s6090, s6096–s6103, s6173–s6176, s6183–s6186, s6220–s6227, s6286–s6297, s6326–s6333, s6370–s6373, s6391–s6398, s6427–s6434, s6493–s6504, s6533–s6540, s6577–s6580, s6598–s6605, s6634–s6641, s6700–s6711, s6739–s6746, s6783–s6786, s6804–s6807, s6835–s6842, s6901–s6908, s6937–s6944, s6981–s6984, s7002–s7009, s7038–s7045, s7104–s7115, s7122–s7129, s7200–s7207, s7214–s7221, s7270–s7273, s7291–s7294, s7301–s7308, s7379–s7386, s7393–s7400, s7449–s7452, s7470–s7473, s7480–s7487, s7558–s7565, s7572–s7579, s7650–s7665, s7725–s7728, s7735–s7746, s7795–s7798, s7817–s7828, s7894–s7897, s7904–s7915, s7958–s7961, s7980–s7991, s8051–s8054, s8061–s8072, s8115–s8118, s8137–s8148, s8208–s8211, s8218–s8221, s8228–s8235, s8248–s8255, s8297–s8300, s8313–s8316, s8323–s8330, s8343–s8350, s8375–s8378, s8403–s8406, s8413–s8420, s8433–s8440, s8482–s8485, s8498–s8501, s8508–s8515, s8528–s8535, s8560–s8563, s8588–s8591, s8598–s8605, s8618–s8625, s8667–s8670, s8683–s8686, s8693–s8700, s8743–s8750, s8786–s8789, s8796–s8799, s8806–s8813, s8856–s8863, s8882–s8885, s8904–s8907, s8914–s8921, s8964–s8971, s9007–s9010, s9017–s9020, s9027–s9034, s9077–s9084, s9103–s9106, s9125–s9128, s9135–s9142, s9185–s9192, s9228–s9231, s9238–s9241, s9253–s9264, s9317–s9320, s9333–s9340, s9352–s9355, s9362–s9373, s9404–s9407, s9425–s9428, s9441–s9444, s9456–s9459, s9466–s9477, s9530–s9533, s9546–s9553, s9571–s9582, s9613–s9616, s9634–s9637, s9650–s9653, s9671–s9682, s9735–s9738, s9751–s9758, s9776–s9787, s9818–s9821, s9839–s9842, s9855–s9858, s9876–s9887, s9940–s9943, s9956–s9963, s9981–s9992, s10023–s10026, s10032–s10035, s10048–s10051, s10064–s10067, s10085–s10096, s10137–s10140, s10153–s10156, s10169–s10176, s10194–s10205, s10236–s10239, s10257–s10260, s10273–s10276, s10294–s10305, s10358–s10361, s10374–s10381, s10394–s10405, s10448–s10451, s10474–s10481, s10488–s10499, s10542–s10549, s10567–s10570, s10577–s10588, s10631–s10634, s10657–s10664, s10671–s10682, s10737–s10744, s10762–s10765, s10772–s10783, s10838–s10841, s10864–s10871, s10878–s10889, s10932–s10939, s10957–s10960, s10967–s10978, s11021–s11024, s11047–s11054, s11061–s11068, s11117–s11124, s11142–s11145, s11152–s11159, s11208–s11211, s11234–s11241, s11248–s11255, s11298–s11305, s11323–s11326, s11345–s11352, s11395–s11398, s11421–s11428, s11453–s11464, s11495–s11498, s11527–s11530, s11537–s11540, s11553–s11564, s11595–s11602, s11632–s11635, s11648–s11659, s11690–s11693, s11722–s11725, s11732–s11735, s11748–s11759, s11790–s11797, s11827–s11830, s11843–s11854, s11885–s11888, s11917–s11920, s11927–s11930, s11943–s11958, s11989–s11996, s12008–s12011, s12030–s12033, s12046–s12061, s12092–s12095, s12112–s12115, s12128–s12131, s12138–s12149, s12209–s12212, s12219–s12230, s12290–s12293, s12300–s12311, s12354–s12357, s12376–s12387, s12447–s12450, s12457–s12468, s12511–s12514, s12533–s12544, s12604–s12607, s12614–s12629, s12672–s12675, s12705–s12708, s12715–s12730, s12773–s12776, s12783–s12786, s12811–s12826, s12869–s12872, s12902–s12905, s12912–s12927, s12970–s12973, s12980–s12983, s13008–s13023, s13066–s13069, s13099–s13102, s13109–s13124, s13167–s13170, s13177–s13180, s13205–s13208, s13215–s13226, s13269–s13272, s13302–s13305, s13312–s13315, s13328–s13331, s13337–s13344, s13369–s13372, s13378–s13381, s13406–s13413, s13420–s13423, s13429–s13436, s13461–s13472, s13497–s13500, s13507–s13510, s13516–s13523, s13548–s13551, s13557–s13560, s13585–s13592, s13599–s13602, s13608–s13615, s13640–s13651, s13676–s13679, s13686–s13689, s13695–s13702, s13727–s13730, s13736–s13739, s13764–s13779, s13839–s13842, s13849–s13860, s13897–s13900, s13925–s13936, s13996–s13999, s14006–s14017, s14077–s14080, s14087–s14098, s14135–s14138, s14163–s14174, s14234–s14237, s14244–s14247, s14254–s14261, s14327–s14330, s14343–s14346, s14353–s14360, s14373–s14376, s14401–s14404, s14441–s14444, s14451–s14458, s14471–s14474, s14528–s14531, s14544–s14547, s14554–s14565, s14608–s14611, s14648–s14651, s14658–s14669, s14741–s14744, s14757–s14760, s14767–s14774, s14817–s14820, s14857–s14860, s14867–s14874, s14946–s14949, s14962–s14965, s14972–s14979, s15016–s15019, s15056–s15059, s15066–s15073, s15139–s15142, s15155–s15158, s15165–s15172, s15209–s15212, s15261–s15264, s15271–s15278, s15344–s15347, s15372–s15379, s15386–s15393, s15429–s15432, s15444–s15447, s15460–s15471, s15478–s15481, s15488–s15495, s15531–s15534, s15541–s15548, s15561–s15568, s15575–s15578, s15585–s15592, s15628–s15631, s15643–s15646, s15659–s15670, s15677–s15680, s15687–s15694, s15730–s15733, s15740–s15747, s15760–s15767, s15774–s15777, s15784–s15791, s15827–s15830, s15842–s15845, s15858–s15869, s15918, s15967, s16022, s16115, s16257, s16356, s16459, s16497, s16600, s16657, s17263, s19520–s19521, s19524–s19525, s19535–s19536, s19539–s19540, s19550–s19551, s19554–s19555, s19565–s19566, s19569–s19570, s19580–s19581, s19584–s19585, s19595–s19596, s19599–s19600, s19610–s19611, s19614–s19615, s19625–s19626, s19629–s19630, s19640–s19641, s19644–s19645, s19655–s19656, s19659–s19660, s19670–s19671, s19674–s19675, s19685–s19686, s19689–s19690, s19700–s19701, s19704–s19705, s19715–s19716, s19719–s19720, s19730–s19731, s19734–s19735, s19745–s19746, s19749–s19750, s19760–s19761, s19764–s19765, s19775–s19776, s19779–s19780, s19790–s19791, s19794–s19795, s19805–s19806, s19809–s19810, s19820–s19821, s19824–s19825, s19835–s19836, s19839–s19840, s19850–s19851, s19854–s19855, s19865–s19866, s19869–s19870, s19880–s19881, s19884–s19885, s19895–s19896, s19899–s19900, s19910–s19911, s19914–s19915, s19925–s19926, s19929–s19930, s19940–s19941, s19944–s19945, s19955–s19956, s19959–s19960, s19970–s19971, s19974–s19975, s19985–s19986, s19989–s19990, s20000–s20001, s20004–s20005, s20015–s20016, s20019–s20020, s20030–s20031, s20034–s20035, s20045–s20046, s20049–s20050, s20060–s20061, s20064–s20065, s20075–s20076, s20079–s20080, s20090–s20091, s20094–s20095, s20105–s20106, s20109–s20110, s20202, s20295 | S \ F (17033) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_created_application/properties/project_id:type` | s617, s1328, s7178–s7182, s7357–s7361, s7536–s7540, s7628–s7632, s17217 | S \ F (20285) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/utc_timestamp:lexical` | s2, s15–s16, s26, s37, s47, s58, s69, s85, s93, s99, s109, s119, s129, s140, s150, s169, s181, s189, s198, s200, s209, s463, s473, s481, s488, s492, s499, s507, s514, s520, s531, s540, s550–s551, s560, s572, s580, s591, s600, s611, s620, s628, s636, s639, s647, s656, s675, s721, s802, s881, s932, s984, s1038, s1105, s1177, s1244, s1304, s1359, s1413, s1462, s1492, s1550, s1631, s1695, s1795, s1864, s1900, s1964, s2055, s2109, s2151, s2194, s2261, s2315, s2327, s2379, s2455, s2500, s3241, s3319, s3349, s3410, s3471–s3472, s3556–s3557, s3636–s3637, s3721–s3722, s3801–s3802, s3886–s3887, s3970–s3971, s4115–s4116, s4259–s4260, s4398–s4399, s4542–s4543, s4681–s4682, s4825–s4826, s4965–s4966, s5060–s5061, s5159–s5160, s5247–s5248, s5340–s5341, s5434–s5435, s5535–s5536, s5637–s5638, s5734–s5735, s5830–s5831, s5921–s5922, s6017–s6018, s6108–s6109, s6218–s6219, s6324–s6325, s6425–s6426, s6531–s6532, s6632–s6633, s6737–s6738, s6833–s6834, s6935–s6936, s7036–s7037, s7140–s7141, s7232–s7233, s7319–s7320, s7411–s7412, s7498–s7499, s7590–s7591, s7682–s7683, s7763–s7764, s7845–s7846, s7932–s7933, s8008–s8009, s8089–s8090, s8165–s8166, s8226–s8227, s8321–s8322, s8411–s8412, s8506–s8507, s8596–s8597, s8735–s8736, s8848–s8849, s8956–s8957, s9069–s9070, s9177–s9178, s9345–s9346, s9449–s9450, s9558–s9559, s9658–s9659, s9763–s9764, s9863–s9864, s9968–s9969, s10072–s10073, s10181–s10182, s10281–s10282, s10386–s10387, s10428–s10429, s10522–s10523, s10611–s10612, s10711–s10712, s10812–s10813, s10912–s10913, s11001–s11002, s11091–s11092, s11182–s11183, s11278–s11279, s11375–s11376, s11535–s11536, s11630–s11631, s11730–s11731, s11825–s11826, s11925–s11926, s12028–s12029, s12136–s12137, s12190–s12191, s12271–s12272, s12352–s12353, s12428–s12429, s12509–s12510, s12585–s12586, s12713–s12714, s12809–s12810, s12910–s12911, s13006–s13007, s13107–s13108, s13203–s13204, s13310–s13311, s13326–s13327, s13418–s13419, s13505–s13506, s13597–s13598, s13684–s13685, s13825–s13826, s13905–s13906, s13982–s13983, s14063–s14064, s14143–s14144, s14220–s14221, s14335–s14336, s14433–s14434, s14536–s14537, s14640–s14641, s14749–s14750, s14849–s14850, s14954–s14955, s15048–s15049, s15147–s15148, s15241–s15242, s15352–s15353, s15384–s15385, s15486–s15487, s15583–s15584, s15685–s15686, s15782–s15783, s15879, s15890, s15898, s15903, s15907, s15914, s15922, s15929, s15935, s15948–s15949, s15958, s15969, s15978, s15992, s16001, s16006, s16016, s16028, s16038, s16067, s16071, s16083, s16094, s16104, s16114, s16125, s16135, s16146, s16156, s16167, s16177, s16184, s16195, s16205, s16217, s16228, s16236, s16242, s16252, s16263, s16272, s16282, s16293, s16326, s16333, s16343, s16354, s16366, s16377, s16391, s16404, s16411, s16420, s16430, s16438, s16442, s16448, s16456, s16470, s16475, s16485, s16495, s16506, s16516, s16527, s16537, s16540, s16553, s16564, s16576, s16578, s16589, s16634, s16640, s16647, s16654, s16663, s16674, s16681, s17235, s20118, s20129, s20139, s20149, s20159, s20169, s20178, s20183, s20191, s20200, s20210, s20220, s20230, s20245, s20247, s20259, s20272, s20284 | S \ F (19872) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/sha256_hex:lexical` | s8, s13, s22, s32, s43, s53, s64, s75, s84, s91, s98, s108, s118, s128, s139, s149, s173, s178, s184, s192, s204, s213, s464, s474, s482, s486, s493, s500, s508, s515, s524, s530, s535, s544, s555, s564, s576, s584, s595, s604, s612, s621, s629, s634, s640, s648, s657, s696, s742, s790, s836, s869, s914, s944, s996, s1044, s1111, s1189, s1256, s1307, s1362, s1407, s1456, s1501, s1541, s1559, s1598, s1622, s1662, s1686, s1725, s1752, s1822, s1891, s1955, s1997, s2003, s2021, s2076, s2136, s2179, s2221, s2276, s2342, s2394, s2439, s2482, s3204, s3283, s3328, s3337, s3361, s3422, s3507–s3508, s3592–s3593, s3672–s3673, s3757–s3758, s3837–s3838, s3922–s3923, s4006–s4007, s4091–s4092, s4235–s4236, s4374–s4375, s4518–s4519, s4657–s4658, s4801–s4802, s4941–s4942, s5080–s5081, s5173–s5174, s5261–s5262, s5360–s5361, s5454–s5455, s5547–s5548, s5649–s5650, s5746–s5747, s5842–s5843, s5933–s5934, s6029–s6030, s6120–s6121, s6238–s6239, s6344–s6345, s6445–s6446, s6551–s6552, s6652–s6653, s6757–s6758, s6853–s6854, s6955–s6956, s7056–s7057, s7146–s7147, s7238–s7239, s7325–s7326, s7417–s7418, s7504–s7505, s7596–s7597, s7670–s7671, s7751–s7752, s7833–s7834, s7920–s7921, s7996–s7997, s8077–s8078, s8153–s8154, s8240–s8241, s8335–s8336, s8425–s8426, s8520–s8521, s8610–s8611, s8717–s8718, s8830–s8831, s8938–s8939, s9051–s9052, s9159–s9160, s9269–s9270, s9378–s9379, s9482–s9483, s9587–s9588, s9687–s9688, s9792–s9793, s9892–s9893, s9997–s9998, s10101–s10102, s10210–s10211, s10310–s10311, s10410–s10411, s10504–s10505, s10593–s10594, s10687–s10688, s10788–s10789, s10894–s10895, s10983–s10984, s11073–s11074, s11164–s11165, s11260–s11261, s11337–s11338, s11357–s11358, s11439–s11440, s11469–s11470, s11569–s11570, s11664–s11665, s11764–s11765, s11859–s11860, s11963–s11964, s12066–s12067, s12160–s12161, s12241–s12242, s12322–s12323, s12398–s12399, s12479–s12480, s12555–s12556, s12634–s12635, s12735–s12736, s12831–s12832, s12932–s12933, s13028–s13029, s13129–s13130, s13231–s13232, s13349–s13350, s13441–s13442, s13528–s13529, s13620–s13621, s13707–s13708, s13790–s13791, s13871–s13872, s13947–s13948, s14028–s14029, s14109–s14110, s14185–s14186, s14266–s14267, s14365–s14366, s14463–s14464, s14570–s14571, s14674–s14675, s14785–s14786, s14885–s14886, s14984–s14985, s15078–s15079, s15177–s15178, s15283–s15284, s15404–s15405, s15506–s15507, s15603–s15604, s15705–s15706, s15802–s15803, s15878, s15884, s15889, s15897, s15906, s15913, s15921, s15928, s15938, s15945, s15952, s15961, s15972, s15981, s15987, s15991, s15999, s16005, s16015, s16027, s16037, s16062, s16069, s16078, s16089, s16099, s16109, s16120, s16130, s16141, s16151, s16162, s16172, s16182, s16193, s16203, s16210, s16214, s16225, s16240, s16250, s16261, s16270, s16280, s16288, s16291, s16299, s16320, s16329, s16337, s16348, s16360, s16371, s16384, s16397, s16409, s16418, s16423, s16428, s16436, s16446, s16454, s16465, s16473, s16480, s16490, s16501, s16511, s16522, s16532, s16544, s16552, s16557, s16568, s16582, s16593, s16632, s16638, s16644, s16652, s16661, s16671, s16679, s17238–s17239, s20113, s20123, s20133, s20144, s20154, s20164, s20173, s20181, s20186, s20195, s20205, s20215, s20233, s20243, s20250, s20262, s20275, s20287 | S \ F (19854) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_started:additionalProperties` | s19387, s20228 | S \ F (20306) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_started:required:lifecycle_seq` | s19398, s20182 | S \ F (20306) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_started_application/properties/project_id:type` | s3225, s14298–s14302, s14499–s14503, s14712–s14716, s14917–s14921, s15110–s15114, s15315–s15319, s19354, s20120 | S \ F (20275) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_paused:additionalProperties` | s16461, s17759 | S \ F (20306) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_paused:required:lifecycle_seq` | s16441, s17771 | S \ F (20306) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_paused_application/properties/project_id:type` | s2154, s12192–s12196, s12273–s12277, s12430–s12434, s12587–s12591, s16414, s17750 | S \ F (20285) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_resumed:additionalProperties` | s16667, s17965 | S \ F (20306) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_resumed:required:lifecycle_seq` | s16639, s17977 | S \ F (20306) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_resumed_application/properties/project_id:type` | s2454, s13816–s13820, s13973–s13977, s14054–s14058, s14211–s14215, s16637, s17955 | S \ F (20285) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_cancelled:additionalProperties` | s218, s16925 | S \ F (20306) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_cancelled:required:lifecycle_seq` | s197, s16940 | S \ F (20306) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_cancelled_application/properties/project_id:type` | s177, s962, s5112–s5116, s5293–s5297, s5486–s5490, s16909 | S \ F (20290) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_completed:additionalProperties` | s519, s17068 | S \ F (20306) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_completed:required:lifecycle_seq` | s487, s17082 | S \ F (20306) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_completed_application/properties/project_id:type` | s468, s1065, s5578–s5582, s5777–s5781, s5964–s5968, s6151–s6155, s17045 | S \ F (20285) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_failed:additionalProperties` | s15934, s17315 | S \ F (20306) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_failed:required:lifecycle_seq` | s15886, s17329 | S \ F (20306) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_failed_application/properties/project_id:type` | s1428, s7708–s7712, s7877–s7881, s8034–s8038, s8191–s8195, s15883, s17306 | S \ F (20285) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_started:additionalProperties` | s16379, s17710 | S \ F (20306) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_started:required:participant_slot_id` | s16331, s17722 | S \ F (20306) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_started_application/properties/project_id:type` | s2039, s11499–s11503, s11694–s11698, s11889–s11893, s12096–s12100, s16328, s17693 | S \ F (20285) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_completed:additionalProperties` | s16258, s17619 | S \ F (20306) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_completed:required:participant_slot_id` | s16235, s17634 | S \ F (20306) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_completed_application/properties/project_id:type` | s1915, s10452–s10456, s10635–s10639, s10842–s10846, s11025–s11029, s11212–s11216, s11399–s11403, s16189, s17598 | S \ F (20275) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_message_added:additionalProperties` | s16157, s17545 | S \ F (20306) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_message_added:required:collaboration_message_id` | s16070, s17547 | S \ F (20306) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_message_added_application/properties/project_id:type` | s1767, s9295–s9299, s9508–s9512, s9713–s9717, s9918–s9922, s10127–s10131, s10336–s10340, s16068, s17523 | S \ F (20275) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_artifact_added:additionalProperties` | s57, s16734 | S \ F (20306) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_artifact_added:required:artifact_ref` | s14, s16732 | S \ F (20306) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_artifact_added_application/properties/project_id:type` | s12, s708, s3527–s3531, s3692–s3696, s3857–s3861, s4026–s4030, s16722 | S \ F (20285) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_configuration_changed:additionalProperties` | s589, s17165 | S \ F (20306) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_configuration_changed:required:definition_revision` | s549, s17170 | S \ F (20306) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_configuration_changed_application/properties/project_id:type` | s529, s1204, s6264–s6268, s6471–s6475, s6678–s6682, s6879–s6883, s7082–s7086, s17140 | S \ F (20280) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_proposal_added:additionalProperties` | s16602, s17889 | S \ F (20306) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_proposal_added:required:proposal_id` | s16575, s17903 | S \ F (20306) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_proposal_added_application/properties/project_id:type` | s2357, s13373–s13377, s13552–s13556, s13731–s13735, s16551, s17873 | S \ F (20290) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_vote_added:additionalProperties` | s19467, s20296 | S \ F (20306) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_vote_added:required:vote_id` | s19493, s20244 | S \ F (20306) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_vote_added_application/properties/project_id:type` | s3385, s15439–s15443, s15638–s15642, s15837–s15841, s19451, s20241 | S \ F (20290) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_plan_synthesized:additionalProperties` | s16518, s17820 | S \ F (20306) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_plan_synthesized:required:assistant_plan_id` | s16474, s17819 | S \ F (20306) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_plan_synthesized_application/properties/project_id:type` | s2248, s12682–s12686, s12879–s12883, s13076–s13080, s13279–s13283, s16472, s17808 | S \ F (20285) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_added:additionalProperties` | s15968, s17375 | S \ F (20306) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_added:required:finding_id` | s15946, s17382 | S \ F (20306) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_added_application/properties/project_id:type` | s1528, s8280–s8284, s8465–s8469, s8650–s8654, s15944, s17362 | S \ F (20290) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_dispositioned:additionalProperties` | s16023, s17446 | S \ F (20306) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_dispositioned:required:finding_id` | s16000, s17464 | S \ F (20306) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_dispositioned_application/properties/project_id:type` | s1652, s8769–s8773, s8990–s8994, s9211–s9215, s15998, s17434 | S \ F (20290) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized:additionalProperties` | s156, s16808 | S \ F (20306) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized:required:artifact_ref` | s92, s16806 | S \ F (20306) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized_application/properties/project_id:type` | s90, s814, s4134–s4138, s4417–s4421, s4700–s4704, s4984–s4988, s16781 | S \ F (20285) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_created/properties/definition_revision:const` | s662, s1368–s1370, s7246–s7251, s7425–s7430, s17248 | S \ F (20291) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_started/properties/lifecycle_seq:const` | s3295–s3297, s14389–s14394, s14590–s14595, s14805–s14810, s15004–s15009, s15197–s15202, s19399, s20226 | S \ F (20273) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_started/allOf/0/then:required:crew_auto_revision` | s19378, s20180 | S \ F (20306) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_started/allOf/4/then:not` | s20225 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_started/allOf/2/then:required:assistant_plan_id` | s20161 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_started/allOf/3/then:required:target_pack_ref` | s19422, s20224 | S \ F (20306) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_started/properties/state_after:enum` | s3322–s3324, s14435–s14440, s14642–s14647, s14851–s14856, s15050–s15055, s15243–s15248, s19414, s20227 | S \ F (20273) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_paused/properties/lifecycle_seq:minimum` | s16460, s17772 | S \ F (20306) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_paused/properties/state_before:enum` | s2206–s2208, s12370–s12375, s12527–s12532, s16424, s17781 | S \ F (20291) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_resumed/properties/state_after:enum` | s2509–s2511, s13919–s13924, s14157–s14162, s16666, s17987 | S \ F (20291) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_cancelled/allOf/1/then:not` | s196 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_cancelled/allOf/0/then:required:command_instance_ref` | s219, s16928 | S \ F (20306) |
| `schema:Plans/collaborative_workflows_contracts.schema.json#/$defs/stop_reason:enum` | s179, s975–s977, s1026–s1028, s5139–s5144, s5227–s5232, s5320–s5325, s5414–s5419, s5513–s5518, s16918, s16921, s16951 | S \ F (20268) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_completed/allOf/0/then/properties/kind:const` | s469 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_completed/allOf/1/then/allOf/1/properties/state_before:enum` | s489 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_failed/properties/failure_reason:enum` | s1465–s1467, s7765–s7770, s7934–s7939, s8091–s8096, s15885, s15933, s17324 | S \ F (20284) |
| `schema:Plans/collaborative_workflows_contracts.schema.json#/$defs/additive_role_kind:enum` | s2006–s2008, s2061–s2063, s11441–s11446, s11541–s11546, s11636–s11641, s11736–s11741, s11831–s11836, s11931–s11936, s12034–s12039, s16302, s16316, s16330, s17652, s17705 | S \ F (20255) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_started:required:attempt_id` | s16332, s17709 | S \ F (20306) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_completed/allOf/0/then:not` | s16277 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_completed/allOf/3/then:required:outcome_reason` | s16233, s17609 | S \ F (20306) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_completed/allOf/2/then:required:waiver_actor_ref` | s16300, s17645 | S \ F (20306) |
| `schema:Plans/collaborative_workflows_contracts.schema.json#/$defs/participant_outcome:enum` | s1909–s1911, s1973–s1975, s10442–s10447, s10536–s10541, s10625–s10630, s10725–s10730, s10826–s10831, s10926–s10931, s11015–s11020, s11105–s11110, s11196–s11201, s11292–s11297, s11389–s11394, s16234, s16304, s16315, s17608, s17612, s17633, s17644, s17648, s17673 | S \ F (20227) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_message_added/properties/sequence:minimum` | s16136, s17570 | S \ F (20306) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_message_added/allOf/0/then:not` | s16178 | S \ F (20307) |
| `schema:Plans/collaborative_workflows_contracts.schema.json#/$defs/message_type:enum` | s1764–s1766, s1834–s1836, s9289–s9294, s9398–s9403, s9502–s9507, s9607–s9612, s9707–s9712, s9812–s9817, s9912–s9917, s10017–s10022, s10121–s10126, s10230–s10235, s10330–s10335, s16072, s17558 | S \ F (20234) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/non_secret_ref:lexical` | s1, s4–s5, s18–s19, s28–s29, s39–s40, s49–s50, s60–s61, s71–s72, s80–s81, s88, s94–s95, s102, s104–s105, s112, s114–s115, s122, s124–s125, s132, s135–s136, s143, s145–s146, s153, s168, s172, s180, s188, s199, s203, s208, s212, s472, s480, s523, s534, s543, s554, s563, s575, s583, s594, s603, s613, s622, s630, s641, s649, s658, s684, s687, s730, s733, s772, s775, s842, s851, s854, s920, s929, s941, s981, s993, s1059, s1093, s1096, s1126, s1186, s1253, s1310, s1365, s1444, s1447, s1513, s1571, s1607, s1643, s1671, s1707, s1734, s1740, s1804, s1810, s1897, s1931, s1937, s1961, s1994, s2000, s2027, s2040, s2082, s2097, s2133, s2176, s2239, s2294, s2361, s2415, s2436, s2479, s3226, s3229, s3307, s3310, s3334, s3343, s3404, s3464, s3487–s3488, s3493–s3494, s3572–s3573, s3578–s3579, s3652–s3653, s3658–s3659, s3737–s3738, s3743–s3744, s3817–s3818, s3823–s3824, s3902–s3903, s3908–s3909, s3986–s3987, s3992–s3993, s4059–s4060, s4065–s4066, s4187–s4188, s4203–s4204, s4209–s4210, s4326–s4327, s4342–s4343, s4348–s4349, s4470–s4471, s4486–s4487, s4492–s4493, s4609–s4610, s4625–s4626, s4631–s4632, s4753–s4754, s4769–s4770, s4775–s4776, s4893–s4894, s4909–s4910, s4915–s4916, s5038–s5039, s5054–s5055, s5074–s5075, s5153–s5154, s5241–s5242, s5334–s5335, s5354–s5355, s5428–s5429, s5448–s5449, s5631–s5632, s5728–s5729, s6232–s6233, s6338–s6339, s6439–s6440, s6545–s6546, s6646–s6647, s6751–s6752, s6847–s6848, s6949–s6950, s7050–s7051, s7152–s7153, s7244–s7245, s7331–s7332, s7423–s7424, s7510–s7511, s7602–s7603, s7775–s7776, s7857–s7858, s8260–s8261, s8355–s8356, s8445–s8446, s8540–s8541, s8630–s8631, s8691–s8692, s8755–s8756, s8804–s8805, s8868–s8869, s8912–s8913, s8976–s8977, s9025–s9026, s9089–s9090, s9133–s9134, s9197–s9198, s9251–s9252, s9360–s9361, s9464–s9465, s9569–s9570, s9669–s9670, s9774–s9775, s9874–s9875, s9979–s9980, s10083–s10084, s10192–s10193, s10292–s10293, s10422–s10423, s10516–s10517, s10605–s10606, s10699–s10700, s10705–s10706, s10800–s10801, s10806–s10807, s10906–s10907, s10995–s10996, s11085–s11086, s11176–s11177, s11272–s11273, s11331–s11332, s11369–s11370, s11433–s11434, s11481–s11482, s11508–s11509, s11581–s11582, s11607–s11608, s11676–s11677, s11703–s11704, s11776–s11777, s11802–s11803, s11871–s11872, s11898–s11899, s11975–s11976, s12001–s12002, s12078–s12079, s12105–s12106, s12154–s12155, s12235–s12236, s12316–s12317, s12392–s12393, s12473–s12474, s12549–s12550, s12670–s12671, s12771–s12772, s12867–s12868, s12968–s12969, s13064–s13065, s13165–s13166, s13267–s13268, s13386–s13387, s13477–s13478, s13565–s13566, s13656–s13657, s13744–s13745, s13784–s13785, s13865–s13866, s13941–s13942, s14022–s14023, s14103–s14104, s14179–s14180, s14307–s14308, s14313–s14314, s14409–s14410, s14415–s14416, s14508–s14509, s14514–s14515, s14616–s14617, s14622–s14623, s14721–s14722, s14727–s14728, s14825–s14826, s14831–s14832, s14926–s14927, s14932–s14933, s15024–s15025, s15030–s15031, s15119–s15120, s15125–s15126, s15217–s15218, s15223–s15224, s15259–s15260, s15324–s15325, s15330–s15331, s15370–s15371, s15476–s15477, s15573–s15574, s15675–s15676, s15772–s15773, s15874–s15875, s15891, s15899, s15940, s15954, s15963, s15974, s15983, s15988, s15994, s16002, s16008, s16012, s16018, s16024, s16030, s16034, s16040, s16058, s16074, s16085, s16095, s16105, s16116, s16126, s16137, s16147, s16158, s16168, s16183, s16194, s16204, s16215–s16216, s16226–s16227, s16241, s16251, s16262, s16271, s16281, s16287, s16292, s16298, s16321, s16324, s16338, s16342, s16349, s16352, s16361, s16365, s16372, s16375, s16385, s16389, s16398, s16401, s16408, s16417, s16427, s16435, s16445, s16453, s16467, s16482, s16492, s16503, s16513, s16524, s16534, s16548, s16562, s16572, s16587, s16597, s16631, s16643, s16651, s16660, s16670, s16678, s17242–s17244, s20115–s20116, s20127–s20128, s20136–s20137, s20147–s20148, s20156–s20157, s20167–s20168, s20175–s20176, s20189–s20190, s20197–s20198, s20208–s20209, s20211, s20217–s20218, s20221, s20240, s20257, s20269, s20282, s20294 | S \ F (19734) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_configuration_changed/properties/definition_revision:minimum` | s571, s17171 | S \ F (20306) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_configuration_changed/allOf/1/then/properties/change_kinds:minItems` | s570, s6299, s6515, s6919, s17158 | S \ F (20303) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_configuration_changed/allOf/0/then/allOf/0:not` | s588 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/reconfigure_change_kind:enum` | s590, s1168–s1170, s1235–s1237 | S \ F (20301) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_proposal_added/properties/kind:const` | s2403–s2405, s13455–s13460, s13634–s13639, s16577, s17900 | S \ F (20291) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_proposal_added/properties/proposal_round:minimum` | s16601, s17906 | S \ F (20306) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_vote_added/properties/confidence:maximum` | s20242 | S \ F (20307) |
| `schema:Plans/collaborative_workflows_contracts.schema.json#/$defs/vote_position:enum` | s3382–s3384, s3443–s3445, s15433–s15438, s15535–s15540, s15632–s15637, s15734–s15739, s15831–s15836, s19485, s20270, s20301 | S \ F (20269) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_plan_synthesized/properties/kind:const` | s2288–s2290, s12755–s12760, s12952–s12957, s13149–s13154, s16476, s17834 | S \ F (20285) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_plan_synthesized/properties/tie_resolution:enum` | s2321–s2323, s13209–s13214, s16539, s17853 | S \ F (20297) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_added/properties/originating_reviewer_ids:minItems` | s8369, s8554, s15947, s17391 | S \ F (20304) |
| `schema:Plans/collaborative_workflows_contracts.schema.json#/$defs/review_disposition:enum` | s1628–s1630, s1692–s1694, s8725–s8730, s8838–s8843, s8946–s8951, s9059–s9064, s9167–s9172, s16044, s16047, s17459, s17488 | S \ F (20268) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized/allOf/0/then/properties/requested_reviewer_count:const` | s155, s16859 | S \ F (20306) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_started/allOf/3/then:required:target_hashes` | s19419, s20223 | S \ F (20306) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_completed/allOf/2/then:required:waiver_currentness_hash` | s16301, s17646 | S \ F (20306) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/identifier:lexical` | s3, s6–s7, s10–s11, s17, s20–s21, s24–s25, s27, s30–s31, s34–s35, s38, s41–s42, s45–s46, s48, s51–s52, s55–s56, s59, s62–s63, s66–s68, s70, s73–s74, s77–s79, s82–s83, s87, s89, s96–s97, s101, s103, s106–s107, s111, s113, s116–s117, s121, s123, s126–s127, s131, s133, s137–s138, s142, s144, s147–s148, s152, s154, s170–s171, s175–s176, s182–s183, s186–s187, s190–s191, s194–s195, s201–s202, s206–s207, s210–s211, s215–s216, s461–s462, s466–s467, s470–s471, s476–s479, s484–s485, s490–s491, s495–s498, s502–s503, s505–s506, s510–s513, s517–s518, s521–s522, s526–s528, s532–s533, s537–s539, s541–s542, s546–s548, s552–s553, s557–s559, s561–s562, s566–s568, s573–s574, s578–s579, s581–s582, s586–s587, s592–s593, s597–s599, s601–s602, s606–s610, s615–s616, s618–s619, s624–s627, s632–s633, s637–s638, s643–s646, s651–s652, s654–s655, s660–s661, s678, s690, s693, s715, s718, s724, s736, s739, s754, s763, s766, s769, s778, s781, s827, s845, s857, s860, s893, s923, s935, s938, s969, s978, s987, s990, s1014, s1029, s1032, s1035, s1066, s1078, s1084, s1087, s1099, s1102, s1132, s1135, s1150, s1153, s1162, s1180, s1183, s1205, s1217, s1220, s1223, s1229, s1247, s1250, s1271, s1274, s1286, s1289, s1295, s1298, s1322, s1329, s1341, s1344, s1350, s1353, s1377, s1383, s1386, s1398, s1401, s1404, s1435, s1441, s1450, s1453, s1477, s1489, s1495, s1498, s1507, s1510, s1522, s1535, s1547, s1553, s1556, s1565, s1568, s1580, s1586, s1604, s1610, s1613, s1637, s1640, s1659, s1668, s1674, s1677, s1701, s1704, s1716, s1731, s1743, s1746, s1749, s1768, s1780, s1789, s1792, s1798, s1801, s1813, s1816, s1819, s1837, s1840, s1852, s1861, s1867, s1870, s1873, s1876, s1882, s1885, s1888, s1912, s1925, s1928, s1946, s1949, s1952, s1976, s1979, s1991, s2012, s2015, s2018, s2036, s2052, s2058, s2067, s2070, s2073, s2091, s2094, s2112, s2115, s2118, s2121, s2124, s2127, s2130, s2161, s2167, s2170, s2173, s2197, s2209, s2212, s2215, s2218, s2242, s2258, s2264, s2267, s2270, s2273, s2297, s2303, s2318, s2330, s2336, s2339, s2354, s2358, s2373, s2376, s2382, s2388, s2391, s2406, s2409, s2412, s2427, s2430, s2433, s2464, s2470, s2473, s2476, s2497, s2512, s2561, s2564, s2583, s2586, s2605, s2608, s2627, s2630, s3198, s3201, s3219, s3238, s3247, s3250, s3253, s3256, s3262, s3277, s3280, s3298, s3304, s3325, s3346, s3352, s3355, s3367, s3379, s3386, s3395, s3398, s3401, s3407, s3413, s3416, s3428, s3440, s3446, s3449, s3458, s3461, s15876–s15877, s15881–s15882, s15887–s15888, s15893–s15896, s15901–s15902, s15904–s15905, s15909–s15912, s15916–s15917, s15919–s15920, s15924–s15927, s15931–s15932, s15936–s15937, s15939, s15942–s15943, s15950–s15951, s15953, s15956–s15957, s15959–s15960, s15962, s15965–s15966, s15970–s15971, s15973, s15976–s15977, s15979–s15980, s15982, s15985–s15986, s15989–s15990, s15993, s15996–s15997, s16003–s16004, s16007, s16010–s16011, s16013–s16014, s16017, s16020–s16021, s16025–s16026, s16029, s16032–s16033, s16035–s16036, s16039, s16042–s16043, s16059–s16061, s16064–s16066, s16073, s16075–s16077, s16080–s16082, s16084, s16086–s16088, s16091–s16093, s16096–s16098, s16101–s16103, s16106–s16108, s16111–s16113, s16117–s16119, s16122–s16124, s16127–s16129, s16132–s16134, s16138–s16140, s16143–s16145, s16148–s16150, s16153–s16155, s16159–s16161, s16164–s16166, s16169–s16171, s16174–s16176, s16179–s16181, s16186–s16188, s16190–s16192, s16197–s16202, s16207–s16209, s16211–s16213, s16219–s16224, s16230–s16232, s16237–s16239, s16244–s16249, s16254–s16256, s16259–s16260, s16265–s16269, s16274–s16276, s16278–s16279, s16284–s16286, s16289–s16290, s16295–s16297, s16317–s16319, s16323, s16325, s16327, s16334–s16336, s16340–s16341, s16344–s16347, s16351, s16353, s16355, s16357–s16359, s16363–s16364, s16367–s16370, s16374, s16376, s16378, s16380–s16383, s16387–s16388, s16390, s16392–s16396, s16400, s16402–s16403, s16405–s16407, s16412–s16413, s16415–s16416, s16421–s16422, s16425–s16426, s16431–s16434, s16439–s16440, s16443–s16444, s16449–s16452, s16457–s16458, s16462–s16464, s16468–s16469, s16471, s16477–s16479, s16483–s16484, s16486–s16489, s16493–s16494, s16496, s16498–s16500, s16504–s16505, s16507–s16510, s16514–s16515, s16517, s16519–s16521, s16525–s16526, s16528–s16531, s16535–s16536, s16538, s16541–s16543, s16546–s16547, s16549–s16550, s16554–s16556, s16559–s16561, s16563, s16565–s16567, s16570–s16571, s16573–s16574, s16579–s16581, s16584–s16586, s16588, s16590–s16592, s16595–s16596, s16598–s16599, s16629–s16630, s16635–s16636, s16641–s16642, s16646, s16648–s16650, s16655–s16656, s16658–s16659, s16664–s16665, s16668–s16669, s16673, s16675–s16677, s16682–s16683, s17259–s17261, s19522, s19537, s19552, s19567, s19582, s19597, s19612, s19627, s19642, s19657, s19672, s19687, s19702, s19717, s19732, s19747, s19762, s19777, s19792, s19807, s19822, s19837, s19852, s19867, s19882, s19897, s19912, s19927, s19942, s19957, s19972, s19987, s20002, s20017, s20032, s20047, s20062, s20077, s20092, s20107, s20111–s20112, s20117, s20119, s20121–s20122, s20124, s20126, s20130–s20132, s20134, s20138, s20140–s20143, s20146, s20150–s20153, s20158, s20160, s20162–s20163, s20166, s20170–s20172, s20177, s20179, s20184–s20185, s20188, s20192–s20194, s20199, s20201, s20203–s20204, s20207, s20212–s20214, s20219, s20222, s20229, s20231–s20232, s20235–s20239, s20246, s20248–s20249, s20252–s20256, s20258, s20260–s20261, s20264–s20268, s20271, s20273–s20274, s20277–s20281, s20283, s20285–s20286, s20289–s20293 | S \ F (19388) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_created/properties/idempotency_key:lexical` | s623, s642, s1371, s7256–s7257, s7435–s7436, s17249 | S \ F (20300) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_created_application/properties/idempotency_key:lexical` | s614, s631, s650, s659, s1316, s7164–s7165, s7343–s7344, s7522–s7523, s7614–s7615, s17207 | S \ F (20294) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_started/properties/idempotency_key:lexical` | s3289, s14381–s14382, s14582–s14583, s14797–s14798, s14996–s14997, s15189–s15190, s19394, s20125, s20145, s20165, s20187, s20206 | S \ F (20291) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_started_application/properties/idempotency_key:lexical` | s3210, s14278–s14279, s14479–s14480, s14686–s14687, s14897–s14898, s15090–s15091, s15295–s15296, s19342, s20114, s20135, s20155, s20174, s20196, s20216 | S \ F (20288) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_paused/properties/idempotency_key:lexical` | s2185, s12334–s12335, s12491–s12492, s16429, s16447, s17767 | S \ F (20300) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_paused_application/properties/idempotency_key:lexical` | s2142, s12172–s12173, s12253–s12254, s12410–s12411, s12567–s12568, s16410, s16419, s16437, s16455, s17741 | S \ F (20294) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_resumed/properties/idempotency_key:lexical` | s2488, s13883–s13884, s14121–s14122, s16645, s16672, s17973 | S \ F (20300) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_resumed_application/properties/idempotency_key:lexical` | s2445, s13802–s13803, s13959–s13960, s14040–s14041, s14197–s14198, s16633, s16653, s16662, s16680, s17947 | S \ F (20294) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_cancelled/properties/idempotency_key:lexical` | s185, s205, s1005, s5191–s5192, s5378–s5379, s16936 | S \ F (20300) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_cancelled_application/properties/idempotency_key:lexical` | s174, s193, s214, s953, s5098–s5099, s5279–s5280, s5472–s5473, s16901 | S \ F (20297) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_completed/properties/idempotency_key:lexical` | s475, s494, s509, s1117, s5661–s5662, s5854–s5855, s6041–s6042, s17078 | S \ F (20297) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_completed_application/properties/idempotency_key:lexical` | s465, s483, s501, s516, s1050, s5559–s5560, s5758–s5759, s5945–s5946, s6132–s6133, s17035 | S \ F (20294) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_failed/properties/idempotency_key:lexical` | s1468, s7781–s7782, s7944–s7945, s8101–s8102, s15892, s15908, s15923, s17325 | S \ F (20297) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_failed_application/properties/idempotency_key:lexical` | s1419, s7694–s7695, s7863–s7864, s8020–s8021, s8177–s8178, s15880, s15900, s15915, s15930, s17298 | S \ F (20294) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_started/properties/idempotency_key:lexical` | s2085, s11587–s11588, s11782–s11783, s11981–s11982, s16339, s16362, s16386, s17718 | S \ F (20297) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_started_application/properties/idempotency_key:lexical` | s2030, s11487–s11488, s11682–s11683, s11877–s11878, s12084–s12085, s16322, s16350, s16373, s16399, s17687 | S \ F (20294) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_completed/properties/idempotency_key:lexical` | s1967, s10528–s10529, s10717–s10718, s10918–s10919, s11097–s11098, s11284–s11285, s16196, s16218, s16243, s16264, s16283, s17628 | S \ F (20291) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_completed_application/properties/idempotency_key:lexical` | s1903, s10434–s10435, s10617–s10618, s10818–s10819, s11007–s11008, s11188–s11189, s11381–s11382, s16185, s16206, s16229, s16253, s16273, s16294, s17591 | S \ F (20288) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_message_added/properties/idempotency_key:lexical` | s1828, s9390–s9391, s9599–s9600, s9804–s9805, s10009–s10010, s10222–s10223, s16079, s16100, s16121, s16142, s16163, s17553 | S \ F (20291) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_message_added_application/properties/idempotency_key:lexical` | s1758, s9281–s9282, s9494–s9495, s9699–s9700, s9904–s9905, s10113–s10114, s10322–s10323, s16063, s16090, s16110, s16131, s16152, s16173, s17517 | S \ F (20288) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_artifact_added/properties/idempotency_key:lexical` | s23, s44, s65, s748, s3604–s3605, s3769–s3770, s3934–s3935, s16741 | S \ F (20297) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_artifact_added_application/properties/idempotency_key:lexical` | s9, s33, s54, s76, s702, s3519–s3520, s3684–s3685, s3849–s3850, s4018–s4019, s16717 | S \ F (20294) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_configuration_changed/properties/idempotency_key:lexical` | s536, s556, s577, s596, s1262, s6356–s6357, s6563–s6564, s6769–s6770, s6967–s6968, s17173 | S \ F (20294) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_configuration_changed_application/properties/idempotency_key:lexical` | s525, s545, s565, s585, s605, s1195, s6250–s6251, s6457–s6458, s6664–s6665, s6865–s6866, s7068–s7069, s17132 | S \ F (20291) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_proposal_added/properties/idempotency_key:lexical` | s2400, s13453–s13454, s13632–s13633, s16558, s16583, s17896 | S \ F (20300) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_proposal_added_application/properties/idempotency_key:lexical` | s2348, s13361–s13362, s13540–s13541, s13719–s13720, s16545, s16569, s16594, s17866 | S \ F (20297) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_vote_added/properties/idempotency_key:lexical` | s3434, s15523–s15524, s15722–s15723, s19478, s20251, s20276 | S \ F (20300) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_vote_added_application/properties/idempotency_key:lexical` | s3373, s15421–s15422, s15620–s15621, s15819–s15820, s19443, s20234, s20263, s20288 | S \ F (20297) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_plan_synthesized/properties/idempotency_key:lexical` | s2285, s12753–s12754, s12950–s12951, s13147–s13148, s16481, s16502, s16523, s17830 | S \ F (20297) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_plan_synthesized_application/properties/idempotency_key:lexical` | s2230, s12652–s12653, s12849–s12850, s13046–s13047, s13249–s13250, s16466, s16491, s16512, s16533, s17794 | S \ F (20294) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_added/properties/idempotency_key:lexical` | s1574, s8361–s8362, s8546–s8547, s15955, s15975, s17385 | S \ F (20300) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_added_application/properties/idempotency_key:lexical` | s1516, s8266–s8267, s8451–s8452, s8636–s8637, s15941, s15964, s15984, s17351 | S \ F (20297) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_dispositioned/properties/idempotency_key:lexical` | s1710, s8874–s8875, s9095–s9096, s16009, s16031, s17467 | S \ F (20300) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_dispositioned_application/properties/idempotency_key:lexical` | s1646, s8761–s8762, s8982–s8983, s9203–s9204, s15995, s16019, s16041, s17428 | S \ F (20297) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized/properties/idempotency_key:lexical` | s100, s120, s141, s884, s4265–s4266, s4548–s4549, s4831–s4832, s16828 | S \ F (20297) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized_application/properties/idempotency_key:lexical` | s86, s110, s130, s151, s805, s4121–s4122, s4404–s4405, s4687–s4688, s4971–s4972, s16773 | S \ F (20294) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_created:required:schema_version` | s17268 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_created/properties/schema_version:const` | s1392–s1394, s7279–s7284, s7458–s7463, s17269 | S \ F (20292) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_created:required:scope_kind` | s17270 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_created/properties/scope_kind:const` | s1395–s1397, s7285–s7290, s7464–s7469, s17271 | S \ F (20292) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_created:required:project_id` | s17262 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_created:required:thread_id` | s17272 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_created:required:collaboration_id` | s17231 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_created:required:collaboration_run_id` | s17232 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_created:required:kind` | s17252 | S \ F (20307) |
| `schema:Plans/collaborative_workflows_contracts.schema.json#/$defs/collaboration_kind:enum` | s666, s705–s707, s751–s753, s956–s958, s1008–s1010, s1053–s1055, s1120–s1122, s1198–s1200, s1265–s1267, s1319–s1321, s1374–s1376, s1422–s1424, s1471–s1473, s1761–s1763, s1831–s1833, s1906–s1908, s1970–s1972, s2033–s2035, s2088–s2090, s2145–s2147, s2188–s2190, s2448–s2450, s2491–s2493, s3213–s3215, s3292–s3294, s3521–s3526, s3606–s3611, s3686–s3691, s3771–s3776, s3851–s3856, s3936–s3941, s4020–s4025, s5100–s5105, s5193–s5198, s5281–s5286, s5380–s5385, s5474–s5479, s5561–s5566, s5856–s5861, s5947–s5952, s6043–s6048, s6134–s6139, s6252–s6257, s6358–s6363, s6459–s6464, s6565–s6570, s6666–s6671, s6771–s6776, s6867–s6872, s6969–s6974, s7070–s7075, s7166–s7171, s7258–s7263, s7345–s7350, s7437–s7442, s7524–s7529, s7616–s7621, s7696–s7701, s7783–s7788, s7865–s7870, s7946–s7951, s8022–s8027, s8103–s8108, s8179–s8184, s9283–s9288, s9392–s9397, s9496–s9501, s9601–s9606, s9701–s9706, s9806–s9811, s9906–s9911, s10011–s10016, s10115–s10120, s10224–s10229, s10324–s10329, s10436–s10441, s10530–s10535, s10619–s10624, s10719–s10724, s10820–s10825, s10920–s10925, s11009–s11014, s11099–s11104, s11190–s11195, s11286–s11291, s11383–s11388, s11489–s11494, s11589–s11594, s11684–s11689, s11784–s11789, s11879–s11884, s11983–s11988, s12086–s12091, s12174–s12179, s12255–s12260, s12336–s12341, s12412–s12417, s12493–s12498, s12569–s12574, s13804–s13809, s13885–s13890, s13961–s13966, s14042–s14047, s14123–s14128, s14199–s14204, s14280–s14285, s14383–s14388, s14481–s14486, s14799–s14804, s14899–s14904, s14998–s15003, s15092–s15097, s15191–s15196, s15297–s15302, s16687, s17253, s19417, s19424 | S \ F (19697) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_created:required:created_at_utc` | s17236 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/utc_timestamp:type` | s676–s677, s722–s723, s803–s804, s882–s883, s933–s934, s985–s986, s1039–s1040, s1106–s1107, s1178–s1179, s1245–s1246, s1305–s1306, s1360–s1361, s1414–s1415, s1463–s1464, s1493–s1494, s1551–s1552, s1632–s1633, s1696–s1697, s1796–s1797, s1865–s1866, s1901–s1902, s1965–s1966, s2056–s2057, s2110–s2111, s2152–s2153, s2195–s2196, s2262–s2263, s2316–s2317, s2328–s2329, s2380–s2381, s2456–s2457, s2501–s2502, s3242–s3243, s3320–s3321, s3350–s3351, s3411–s3412, s3467–s3470, s3552–s3555, s3632–s3635, s3717–s3720, s3797–s3800, s3882–s3885, s3966–s3969, s4111–s4114, s4255–s4258, s4394–s4397, s4538–s4541, s4677–s4680, s4821–s4824, s4961–s4964, s5056–s5059, s5155–s5158, s5243–s5246, s5336–s5339, s5430–s5433, s5531–s5534, s5633–s5636, s5730–s5733, s5826–s5829, s5917–s5920, s6013–s6016, s6104–s6107, s6214–s6217, s6320–s6323, s6421–s6424, s6527–s6530, s6628–s6631, s6733–s6736, s6829–s6832, s6931–s6934, s7032–s7035, s7136–s7139, s7228–s7231, s7315–s7318, s7407–s7410, s7494–s7497, s7586–s7589, s7678–s7681, s7759–s7762, s7841–s7844, s7928–s7931, s8004–s8007, s8085–s8088, s8161–s8164, s8222–s8225, s8317–s8320, s8407–s8410, s8502–s8505, s8592–s8595, s8731–s8734, s8844–s8847, s8952–s8955, s9065–s9068, s9173–s9176, s9341–s9344, s9445–s9448, s9554–s9557, s9654–s9657, s9759–s9762, s9859–s9862, s9964–s9967, s10068–s10071, s10177–s10180, s10277–s10280, s10382–s10385, s10424–s10427, s10518–s10521, s10607–s10610, s10707–s10710, s10808–s10811, s10908–s10911, s10997–s11000, s11087–s11090, s11178–s11181, s11274–s11277, s11371–s11374, s11531–s11534, s11626–s11629, s11726–s11729, s11821–s11824, s11921–s11924, s12024–s12027, s12132–s12135, s12186–s12189, s12267–s12270, s12348–s12351, s12424–s12427, s12505–s12508, s12581–s12584, s12709–s12712, s12805–s12808, s12906–s12909, s13002–s13005, s13103–s13106, s13199–s13202, s13306–s13309, s13322–s13325, s13414–s13417, s13501–s13504, s13593–s13596, s13680–s13683, s13821–s13824, s13901–s13904, s13978–s13981, s14059–s14062, s14139–s14142, s14216–s14219, s14331–s14334, s14429–s14432, s14532–s14535, s14636–s14639, s14745–s14748, s14845–s14848, s14950–s14953, s15044–s15047, s15143–s15146, s15237–s15240, s15348–s15351, s15380–s15383, s15482–s15485, s15579–s15582, s15681–s15684, s15778–s15781, s17237 | S \ F (19727) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_created:required:admission_source` | s17228 | S \ F (20307) |
| `schema:Plans/collaborative_workflows_contracts.schema.json#/$defs/admission_source:enum` | s1292–s1294, s1347–s1349, s3195–s3197, s3274–s3276, s7116–s7121, s7208–s7213, s7295–s7300, s7387–s7392, s7474–s7479, s7566–s7571, s14248–s14253, s14347–s14352, s14445–s14450, s14548–s14553, s14652–s14657, s14761–s14766, s14861–s14866, s14966–s14971, s15060–s15065, s15159–s15164, s15265–s15270, s16684, s17229, s19377, s19382 | S \ F (20190) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_created:required:participant_slot_ids` | s17256 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_created/properties/participant_slot_ids:type` | s1380–s1382, s7265–s7269, s7444–s7448, s17257 | S \ F (20294) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_created/properties/participant_slot_ids:minItems` | s7264, s7443, s17255 | S \ F (20305) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_created/properties/participant_slot_ids:uniqueItems` | s17254 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_created/properties/participant_slot_ids:maxItems` | s17258 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_created:required:coordinator_kind` | s17233 | S \ F (20307) |
| `schema:Plans/collaborative_workflows_contracts.schema.json#/$defs/coordinator_kind:enum` | s1301–s1303, s1356–s1358, s7130–s7135, s7222–s7227, s7309–s7314, s7401–s7406, s7488–s7493, s7580–s7585, s17234 | S \ F (20265) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_created:required:definition_record_ref` | s17245 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/non_secret_ref:type` | s685–s686, s688–s689, s731–s732, s734–s735, s773–s774, s776–s777, s843–s844, s852–s853, s855–s856, s921–s922, s930–s931, s942–s943, s982–s983, s994–s995, s1060–s1061, s1094–s1095, s1097–s1098, s1127–s1128, s1187–s1188, s1254–s1255, s1311–s1312, s1366–s1367, s1445–s1446, s1448–s1449, s1514–s1515, s1572–s1573, s1608–s1609, s1644–s1645, s1672–s1673, s1708–s1709, s1735–s1736, s1741–s1742, s1805–s1806, s1811–s1812, s1898–s1899, s1932–s1933, s1938–s1939, s1962–s1963, s1995–s1996, s2001–s2002, s2028–s2029, s2041–s2042, s2083–s2084, s2098–s2099, s2134–s2135, s2177–s2178, s2240–s2241, s2295–s2296, s2362–s2363, s2416–s2417, s2437–s2438, s2480–s2481, s3227–s3228, s3230–s3231, s3308–s3309, s3311–s3312, s3335–s3336, s3344–s3345, s3405–s3406, s3465–s3466, s3483–s3486, s3489–s3492, s3568–s3571, s3574–s3577, s3648–s3651, s3654–s3657, s3733–s3736, s3739–s3742, s3813–s3816, s3819–s3822, s3898–s3901, s3904–s3907, s3982–s3985, s3988–s3991, s4055–s4058, s4061–s4064, s4183–s4186, s4199–s4202, s4205–s4208, s4322–s4325, s4338–s4341, s4344–s4347, s4466–s4469, s4482–s4485, s4488–s4491, s4605–s4608, s4621–s4624, s4627–s4630, s4749–s4752, s4765–s4768, s4771–s4774, s4889–s4892, s4905–s4908, s4911–s4914, s5034–s5037, s5050–s5053, s5070–s5073, s5149–s5152, s5237–s5240, s5330–s5333, s5350–s5353, s5424–s5427, s5444–s5447, s5627–s5630, s5724–s5727, s6228–s6231, s6334–s6337, s6435–s6438, s6541–s6544, s6642–s6645, s6747–s6750, s6843–s6846, s6945–s6948, s7046–s7049, s7148–s7151, s7240–s7243, s7327–s7330, s7419–s7422, s7506–s7509, s7598–s7601, s7771–s7774, s7853–s7856, s8256–s8259, s8351–s8354, s8441–s8444, s8536–s8539, s8626–s8629, s8687–s8690, s8751–s8754, s8800–s8803, s8864–s8867, s8908–s8911, s8972–s8975, s9021–s9024, s9085–s9088, s9129–s9132, s9193–s9196, s9247–s9250, s9356–s9359, s9460–s9463, s9565–s9568, s9665–s9668, s9770–s9773, s9870–s9873, s9975–s9978, s10079–s10082, s10188–s10191, s10288–s10291, s10418–s10421, s10512–s10515, s10601–s10604, s10695–s10698, s10701–s10704, s10796–s10799, s10802–s10805, s10902–s10905, s10991–s10994, s11081–s11084, s11172–s11175, s11268–s11271, s11327–s11330, s11365–s11368, s11429–s11432, s11477–s11480, s11504–s11507, s11577–s11580, s11603–s11606, s11672–s11675, s11699–s11702, s11772–s11775, s11798–s11801, s11867–s11870, s11894–s11897, s11971–s11974, s11997–s12000, s12074–s12077, s12101–s12104, s12150–s12153, s12231–s12234, s12312–s12315, s12388–s12391, s12469–s12472, s12545–s12548, s12666–s12669, s12767–s12770, s12863–s12866, s12964–s12967, s13060–s13063, s13161–s13164, s13263–s13266, s13382–s13385, s13473–s13476, s13561–s13564, s13652–s13655, s13740–s13743, s13780–s13783, s13861–s13864, s13937–s13940, s14018–s14021, s14099–s14102, s14175–s14178, s14303–s14306, s14309–s14312, s14405–s14408, s14411–s14414, s14504–s14507, s14510–s14513, s14612–s14615, s14618–s14621, s14717–s14720, s14723–s14726, s14821–s14824, s14827–s14830, s14922–s14925, s14928–s14931, s15020–s15023, s15026–s15029, s15115–s15118, s15121–s15124, s15213–s15216, s15219–s15222, s15255–s15258, s15320–s15323, s15326–s15329, s15366–s15369, s15472–s15475, s15569–s15572, s15671–s15674, s15768–s15771, s15870–s15873, s17246 | S \ F (19507) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_created:required:currentness_hash` | s17240 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/sha256_hex:type` | s697–s698, s743–s744, s791–s792, s837–s838, s870–s871, s915–s916, s945–s946, s997–s998, s1045–s1046, s1112–s1113, s1190–s1191, s1257–s1258, s1308–s1309, s1363–s1364, s1408–s1409, s1457–s1458, s1502–s1503, s1542–s1543, s1560–s1561, s1599–s1600, s1623–s1624, s1663–s1664, s1687–s1688, s1726–s1727, s1753–s1754, s1823–s1824, s1892–s1893, s1956–s1957, s1998–s1999, s2004–s2005, s2022–s2023, s2077–s2078, s2137–s2138, s2180–s2181, s2222–s2223, s2277–s2278, s2343–s2344, s2395–s2396, s2440–s2441, s2483–s2484, s3205–s3206, s3284–s3285, s3329–s3330, s3338–s3339, s3362–s3363, s3423–s3424, s3503–s3506, s3588–s3591, s3668–s3671, s3753–s3756, s3833–s3836, s3918–s3921, s4002–s4005, s4087–s4090, s4231–s4234, s4370–s4373, s4514–s4517, s4653–s4656, s4797–s4800, s4937–s4940, s5076–s5079, s5169–s5172, s5257–s5260, s5356–s5359, s5450–s5453, s5543–s5546, s5645–s5648, s5742–s5745, s5838–s5841, s5929–s5932, s6025–s6028, s6116–s6119, s6234–s6237, s6340–s6343, s6441–s6444, s6547–s6550, s6648–s6651, s6753–s6756, s6849–s6852, s6951–s6954, s7052–s7055, s7142–s7145, s7234–s7237, s7321–s7324, s7413–s7416, s7500–s7503, s7592–s7595, s7666–s7669, s7747–s7750, s7829–s7832, s7916–s7919, s7992–s7995, s8073–s8076, s8149–s8152, s8236–s8239, s8331–s8334, s8421–s8424, s8516–s8519, s8606–s8609, s8713–s8716, s8826–s8829, s8934–s8937, s9047–s9050, s9155–s9158, s9265–s9268, s9374–s9377, s9478–s9481, s9583–s9586, s9683–s9686, s9788–s9791, s9888–s9891, s9993–s9996, s10097–s10100, s10206–s10209, s10306–s10309, s10406–s10409, s10500–s10503, s10589–s10592, s10683–s10686, s10784–s10787, s10890–s10893, s10979–s10982, s11069–s11072, s11160–s11163, s11256–s11259, s11333–s11336, s11353–s11356, s11435–s11438, s11465–s11468, s11565–s11568, s11660–s11663, s11760–s11763, s11855–s11858, s11959–s11962, s12062–s12065, s12156–s12159, s12237–s12240, s12318–s12321, s12394–s12397, s12475–s12478, s12551–s12554, s12630–s12633, s12731–s12734, s12827–s12830, s12928–s12931, s13024–s13027, s13125–s13128, s13227–s13230, s13345–s13348, s13437–s13440, s13524–s13527, s13616–s13619, s13703–s13706, s13786–s13789, s13867–s13870, s13943–s13946, s14024–s14027, s14105–s14108, s14181–s14184, s14262–s14265, s14361–s14364, s14459–s14462, s14566–s14569, s14670–s14673, s14781–s14784, s14881–s14884, s14980–s14983, s15074–s15077, s15173–s15176, s15279–s15282, s15400–s15403, s15502–s15505, s15599–s15602, s15701–s15704, s15798–s15801, s17241 | S \ F (19699) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_created:required:idempotency_key` | s17250 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_created/properties/idempotency_key:type` | s1372–s1373, s7252–s7255, s7431–s7434, s17251 | S \ F (20297) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_created:required:required_slot_ids` | s17265 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_created/properties/required_slot_ids:type` | s1389–s1391, s7274–s7278, s7453–s7457, s17266 | S \ F (20294) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_created/properties/required_slot_ids:uniqueItems` | s17264 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_created/properties/required_slot_ids:maxItems` | s17267 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_created_application:required:schema_version` | s17222 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_created_application/properties/schema_version:const` | s1335–s1337, s7188–s7193, s7367–s7372, s7546–s7551, s7638–s7643, s17223 | S \ F (20280) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_created_application:required:scope_kind` | s17224 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_created_application/properties/scope_kind:const` | s1338–s1340, s7194–s7199, s7373–s7378, s7552–s7557, s7644–s7649, s17225 | S \ F (20280) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_created_application:required:project_id` | s17216 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_created_application:required:server_id` | s17226 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_created_application:required:thread_id` | s17227 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_created_application:required:collaboration_id` | s17199 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_created_application:required:collaboration_run_id` | s17200 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_created_application:required:kind` | s17210 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_created_application:required:definition_revision` | s17205 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_created_application/properties/definition_revision:const` | s1313–s1315, s7154–s7159, s7333–s7338, s7512–s7517, s7604–s7609, s17206 | S \ F (20280) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_created_application:required:created_at_utc` | s17202 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_created_application:required:admission_source` | s17197 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_created_application:required:participant_slot_ids` | s17213 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_created_application/properties/participant_slot_ids:type` | s1325–s1327, s7173–s7177, s7352–s7356, s7531–s7535, s7623–s7627, s17214 | S \ F (20284) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_created_application/properties/participant_slot_ids:minItems` | s7172, s7351, s7530, s7622, s17212 | S \ F (20303) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_created_application/properties/participant_slot_ids:uniqueItems` | s17211 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_created_application/properties/participant_slot_ids:maxItems` | s17215 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_created_application:required:coordinator_kind` | s17201 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_created_application:required:definition_record_ref` | s17204 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_created_application:required:currentness_hash` | s17203 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_created_application:required:idempotency_key` | s17208 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_created_application/properties/idempotency_key:type` | s1317–s1318, s7160–s7163, s7339–s7342, s7518–s7521, s7610–s7613, s17209 | S \ F (20289) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_created_application:required:required_slot_ids` | s17219 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_created_application/properties/required_slot_ids:type` | s1332–s1334, s7183–s7187, s7362–s7366, s7541–s7545, s7633–s7637, s17220 | S \ F (20284) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_created_application/properties/required_slot_ids:uniqueItems` | s17218 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_created_application/properties/required_slot_ids:maxItems` | s17221 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_created_application:additionalProperties` | s17198 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_started:required:schema_version` | s19408 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_started/properties/schema_version:const` | s3313–s3315, s14417–s14422, s14624–s14629, s14833–s14838, s15032–s15037, s15225–s15230, s19409 | S \ F (20274) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_started:required:scope_kind` | s19410 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_started/properties/scope_kind:const` | s3316–s3318, s14423–s14428, s14630–s14635, s14839–s14844, s15038–s15043, s15231–s15236, s19411 | S \ F (20274) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_started:required:project_id` | s19405 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_started:required:thread_id` | s19415 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_started:required:collaboration_id` | s19388 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_started:required:collaboration_run_id` | s19389 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_started:required:kind` | s19397, s19416 | S \ F (20306) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_started:required:definition_revision` | s19391 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_started/properties/definition_revision:type` | s3286–s3288, s14367–s14372, s14572–s14577, s14787–s14792, s14986–s14991, s15179–s15184, s19393 | S \ F (20274) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_started/properties/definition_revision:minimum` | s19392 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_started:required:started_at_utc` | s19412 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_started:required:admission_source` | s19376, s19386 | S \ F (20306) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_started:required:participant_slot_ids` | s19402 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_started/properties/participant_slot_ids:type` | s3301–s3303, s14396–s14400, s14597–s14601, s14812–s14816, s15011–s15015, s15204–s15208, s19403 | S \ F (20279) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_started/properties/participant_slot_ids:minItems` | s14395, s14596, s14811, s15010, s15203, s19401 | S \ F (20302) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_started/properties/participant_slot_ids:uniqueItems` | s19400 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_started/properties/participant_slot_ids:maxItems` | s19404 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_started:required:state_after` | s19413 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_started:required:requested_effective_snapshot_ref` | s19406 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_started:required:run_record_ref` | s19407 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_started:required:currentness_hash` | s19390 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_started:required:idempotency_key` | s19395 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_started/properties/idempotency_key:type` | s3290–s3291, s14377–s14380, s14578–s14581, s14793–s14796, s14992–s14995, s15185–s15188, s19396 | S \ F (20285) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_started_application:required:schema_version` | s19357 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_started_application/properties/schema_version:const` | s3232–s3234, s14315–s14320, s14516–s14521, s14729–s14734, s14934–s14939, s15127–s15132, s15332–s15337, s19358 | S \ F (20268) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_started_application:required:scope_kind` | s19359 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_started_application/properties/scope_kind:const` | s3235–s3237, s14321–s14326, s14522–s14527, s14735–s14740, s14940–s14945, s15133–s15138, s15338–s15343, s19360 | S \ F (20268) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_started_application:required:project_id` | s19353 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_started_application:required:server_id` | s19361 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_started_application:required:thread_id` | s19365 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_started_application:required:collaboration_id` | s19336 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_started_application:required:collaboration_run_id` | s19337 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_started_application:required:kind` | s19345, s19423 | S \ F (20306) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_started_application:required:definition_revision` | s19339 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_started_application/properties/definition_revision:type` | s3207–s3209, s14268–s14273, s14465–s14470, s14676–s14681, s14887–s14892, s15080–s15085, s15285–s15290, s19341 | S \ F (20268) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_started_application/properties/definition_revision:minimum` | s19340 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_started_application:required:lifecycle_seq` | s19346 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_started_application/properties/lifecycle_seq:const` | s3216–s3218, s14286–s14291, s14487–s14492, s14694–s14699, s14905–s14910, s15098–s15103, s15303–s15308, s19347 | S \ F (20268) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_started_application:required:started_at_utc` | s19362 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_started_application:required:admission_source` | s19334, s19381 | S \ F (20306) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_started_application:required:participant_slot_ids` | s19350 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_started_application/properties/participant_slot_ids:type` | s3222–s3224, s14293–s14297, s14494–s14498, s14701–s14705, s14912–s14916, s15105–s15109, s15310–s15314, s19351 | S \ F (20274) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_started_application/properties/participant_slot_ids:minItems` | s14292, s14493, s14700, s14911, s15104, s15309, s19349 | S \ F (20301) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_started_application/properties/participant_slot_ids:uniqueItems` | s19348 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_started_application/properties/participant_slot_ids:maxItems` | s19352 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_started_application:required:state_after` | s19363 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_started_application/properties/state_after:enum` | s3244–s3246, s14337–s14342, s14538–s14543, s14751–s14756, s14956–s14961, s15149–s15154, s15354–s15359, s19364 | S \ F (20268) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_started_application:required:requested_effective_snapshot_ref` | s19355 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_started_application:required:run_record_ref` | s19356 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_started_application:required:currentness_hash` | s19338 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_started_application:required:idempotency_key` | s19343 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_started_application/properties/idempotency_key:type` | s3211–s3212, s14274–s14277, s14475–s14478, s14682–s14685, s14893–s14896, s15086–s15089, s15291–s15294, s19344 | S \ F (20281) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_started_application:additionalProperties` | s19335 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_paused:required:schema_version` | s17776 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_paused/properties/schema_version:const` | s2200–s2202, s12358–s12363, s12515–s12520, s17777 | S \ F (20292) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_paused:required:scope_kind` | s17778 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_paused/properties/scope_kind:const` | s2203–s2205, s12364–s12369, s12521–s12526, s17779 | S \ F (20292) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_paused:required:project_id` | s17775 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_paused:required:thread_id` | s17782 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_paused:required:collaboration_id` | s17760 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_paused:required:collaboration_run_id` | s17761 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_paused:required:kind` | s17770 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_paused:required:definition_revision` | s17764 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_paused/properties/definition_revision:type` | s2182–s2184, s12324–s12329, s12481–s12486, s17766 | S \ F (20292) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_paused/properties/definition_revision:minimum` | s17765 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_paused/properties/lifecycle_seq:type` | s2191–s2193, s12342–s12347, s12499–s12504, s17773 | S \ F (20292) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_paused:required:paused_at_utc` | s17774 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_paused:required:state_before` | s17780 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_paused:required:command_instance_ref` | s17762 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_paused:required:currentness_hash` | s17763 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_paused:required:idempotency_key` | s17768 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_paused/properties/idempotency_key:type` | s2186–s2187, s12330–s12333, s12487–s12490, s17769 | S \ F (20297) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_paused_application:required:schema_version` | s17751 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_paused_application/properties/schema_version:const` | s2155–s2157, s12197–s12202, s12278–s12283, s12435–s12440, s12592–s12597, s17752 | S \ F (20280) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_paused_application:required:scope_kind` | s17753 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_paused_application/properties/scope_kind:const` | s2158–s2160, s12203–s12208, s12284–s12289, s12441–s12446, s12598–s12603, s17754 | S \ F (20280) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_paused_application:required:project_id` | s17749 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_paused_application:required:server_id` | s17755 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_paused_application:required:thread_id` | s17758 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_paused_application:required:collaboration_id` | s17734 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_paused_application:required:collaboration_run_id` | s17735 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_paused_application:required:kind` | s17744 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_paused_application:required:definition_revision` | s17738 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_paused_application/properties/definition_revision:type` | s2139–s2141, s12162–s12167, s12243–s12248, s12400–s12405, s12557–s12562, s17740 | S \ F (20280) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_paused_application/properties/definition_revision:minimum` | s17739 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_paused_application:required:lifecycle_seq` | s17745 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_paused_application/properties/lifecycle_seq:type` | s2148–s2150, s12180–s12185, s12261–s12266, s12418–s12423, s12575–s12580, s17747 | S \ F (20280) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_paused_application/properties/lifecycle_seq:minimum` | s17746 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_paused_application:required:paused_at_utc` | s17748 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_paused_application:required:state_before` | s17756 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_paused_application/properties/state_before:enum` | s2164–s2166, s12213–s12218, s12294–s12299, s12451–s12456, s12608–s12613, s17757 | S \ F (20280) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_paused_application:required:command_instance_ref` | s17736 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_paused_application:required:currentness_hash` | s17737 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_paused_application:required:idempotency_key` | s17742 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_paused_application/properties/idempotency_key:type` | s2143–s2144, s12168–s12171, s12249–s12252, s12406–s12409, s12563–s12566, s17743 | S \ F (20289) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_paused_application:additionalProperties` | s17733 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_resumed:required:schema_version` | s17982 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_resumed/properties/schema_version:const` | s2503–s2505, s13907–s13912, s14145–s14150, s17983 | S \ F (20292) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_resumed:required:scope_kind` | s17984 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_resumed/properties/scope_kind:const` | s2506–s2508, s13913–s13918, s14151–s14156, s17985 | S \ F (20292) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_resumed:required:project_id` | s17980 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_resumed:required:thread_id` | s17988 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_resumed:required:collaboration_id` | s17966 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_resumed:required:collaboration_run_id` | s17967 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_resumed:required:kind` | s17976 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_resumed:required:definition_revision` | s17970 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_resumed/properties/definition_revision:type` | s2485–s2487, s13873–s13878, s14111–s14116, s17972 | S \ F (20292) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_resumed/properties/definition_revision:minimum` | s17971 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_resumed/properties/lifecycle_seq:type` | s2494–s2496, s13891–s13896, s14129–s14134, s17979 | S \ F (20292) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_resumed/properties/lifecycle_seq:minimum` | s17978 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_resumed:required:resumed_at_utc` | s17981 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_resumed:required:state_after` | s17986 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_resumed:required:command_instance_ref` | s17968 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_resumed:required:currentness_hash` | s17969 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_resumed:required:idempotency_key` | s17974 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_resumed/properties/idempotency_key:type` | s2489–s2490, s13879–s13882, s14117–s14120, s17975 | S \ F (20297) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_resumed_application:required:schema_version` | s17957 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_resumed_application/properties/schema_version:const` | s2458–s2460, s13827–s13832, s13984–s13989, s14065–s14070, s14222–s14227, s17958 | S \ F (20280) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_resumed_application:required:scope_kind` | s17959 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_resumed_application/properties/scope_kind:const` | s2461–s2463, s13833–s13838, s13990–s13995, s14071–s14076, s14228–s14233, s17960 | S \ F (20280) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_resumed_application:required:project_id` | s17954 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_resumed_application:required:server_id` | s17961 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_resumed_application:required:thread_id` | s17964 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_resumed_application:required:collaboration_id` | s17940 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_resumed_application:required:collaboration_run_id` | s17941 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_resumed_application:required:kind` | s17950 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_resumed_application:required:definition_revision` | s17944 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_resumed_application/properties/definition_revision:type` | s2442–s2444, s13792–s13797, s13949–s13954, s14030–s14035, s14187–s14192, s17946 | S \ F (20280) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_resumed_application/properties/definition_revision:minimum` | s17945 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_resumed_application:required:lifecycle_seq` | s17951 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_resumed_application/properties/lifecycle_seq:type` | s2451–s2453, s13810–s13815, s13967–s13972, s14048–s14053, s14205–s14210, s17953 | S \ F (20280) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_resumed_application/properties/lifecycle_seq:minimum` | s17952 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_resumed_application:required:resumed_at_utc` | s17956 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_resumed_application:required:state_after` | s17962 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_resumed_application/properties/state_after:enum` | s2467–s2469, s13843–s13848, s14000–s14005, s14081–s14086, s14238–s14243, s17963 | S \ F (20280) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_resumed_application:required:command_instance_ref` | s17942 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_resumed_application:required:currentness_hash` | s17943 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_resumed_application:required:idempotency_key` | s17948 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_resumed_application/properties/idempotency_key:type` | s2446–s2447, s13798–s13801, s13955–s13958, s14036–s14039, s14193–s14196, s17949 | S \ F (20289) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_resumed_application:additionalProperties` | s17939 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_cancelled:required:schema_version` | s16944 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_cancelled/properties/schema_version:const` | s1017–s1019, s5209–s5214, s5396–s5401, s16945 | S \ F (20292) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_cancelled:required:scope_kind` | s16946 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_cancelled/properties/scope_kind:const` | s1020–s1022, s5215–s5220, s5402–s5407, s16947 | S \ F (20292) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_cancelled:required:project_id` | s16943 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_cancelled:required:thread_id` | s16952 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_cancelled:required:collaboration_id` | s16926 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_cancelled:required:collaboration_run_id` | s16927 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_cancelled:required:kind` | s16939 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_cancelled:required:definition_revision` | s16930 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_cancelled/properties/definition_revision:type` | s999–s1001, s5175–s5180, s5362–s5367, s16932 | S \ F (20292) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_cancelled/properties/definition_revision:minimum` | s16931 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_cancelled/properties/lifecycle_seq:type` | s1011–s1013, s5199–s5204, s5386–s5391, s16942 | S \ F (20292) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_cancelled/properties/lifecycle_seq:minimum` | s16941 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_cancelled:required:cancelled_at_utc` | s16924 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_cancelled:required:stop_reason` | s16920, s16950 | S \ F (20306) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_cancelled:required:state_before` | s16948 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_cancelled/properties/state_before:enum` | s1023–s1025, s5221–s5226, s5408–s5413, s16949 | S \ F (20292) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_cancelled:required:fenced_attempt_count` | s16933 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_cancelled/properties/fenced_attempt_count:type` | s1002–s1004, s5181–s5186, s5368–s5373, s16935 | S \ F (20292) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_cancelled/properties/fenced_attempt_count:minimum` | s16934 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_cancelled:required:cancellation_receipt_ref` | s16923 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_cancelled:required:currentness_hash` | s16929 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_cancelled:required:idempotency_key` | s16937 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_cancelled/properties/idempotency_key:type` | s1006–s1007, s5187–s5190, s5374–s5377, s16938 | S \ F (20297) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_cancelled_application:required:schema_version` | s16910 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_cancelled_application/properties/schema_version:const` | s963–s965, s5117–s5122, s5298–s5303, s5491–s5496, s16911 | S \ F (20286) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_cancelled_application:required:scope_kind` | s16912 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_cancelled_application/properties/scope_kind:const` | s966–s968, s5123–s5128, s5304–s5309, s5497–s5502, s16913 | S \ F (20286) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_cancelled_application:required:project_id` | s16908 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_cancelled_application:required:server_id` | s16914 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_cancelled_application:required:thread_id` | s16919 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_cancelled_application:required:collaboration_id` | s16891 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_cancelled_application:required:collaboration_run_id` | s16892 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_cancelled_application:required:kind` | s16904 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_cancelled_application:required:definition_revision` | s16895 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_cancelled_application/properties/definition_revision:type` | s947–s949, s5082–s5087, s5263–s5268, s5456–s5461, s16897 | S \ F (20286) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_cancelled_application/properties/definition_revision:minimum` | s16896 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_cancelled_application:required:lifecycle_seq` | s16905 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_cancelled_application/properties/lifecycle_seq:type` | s959–s961, s5106–s5111, s5287–s5292, s5480–s5485, s16907 | S \ F (20286) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_cancelled_application/properties/lifecycle_seq:minimum` | s16906 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_cancelled_application:required:cancelled_at_utc` | s16889 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_cancelled_application:required:stop_reason` | s16917, s16922 | S \ F (20306) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_cancelled_application:required:state_before` | s16915 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_cancelled_application/properties/state_before:enum` | s972–s974, s5133–s5138, s5314–s5319, s5507–s5512, s16916 | S \ F (20286) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_cancelled_application/allOf/0/then:required:command_instance_ref` | s16893 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_cancelled_application:required:fenced_attempt_count` | s16898 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_cancelled_application/properties/fenced_attempt_count:type` | s950–s952, s5088–s5093, s5269–s5274, s5462–s5467, s16900 | S \ F (20286) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_cancelled_application/properties/fenced_attempt_count:minimum` | s16899 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_cancelled_application:required:cancellation_receipt_ref` | s16888 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_cancelled_application:required:currentness_hash` | s16894 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_cancelled_application:required:idempotency_key` | s16902 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_cancelled_application/properties/idempotency_key:type` | s954–s955, s5094–s5097, s5275–s5278, s5468–s5471, s16903 | S \ F (20293) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_cancelled_application:additionalProperties` | s16890 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_completed:required:schema_version` | s17090 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_completed/properties/schema_version:const` | s1141–s1143, s5689–s5694, s5882–s5887, s6069–s6074, s17091 | S \ F (20286) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_completed:required:scope_kind` | s17092 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_completed/properties/scope_kind:const` | s1144–s1146, s5695–s5700, s5888–s5893, s6075–s6080, s17093 | S \ F (20286) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_completed:required:project_id` | s17087 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_completed:required:thread_id` | s17096 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_completed:required:collaboration_id` | s17069 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_completed:required:collaboration_run_id` | s17070 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_completed:required:kind` | s17081 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_completed:required:definition_revision` | s17075 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_completed/properties/definition_revision:type` | s1114–s1116, s5651–s5656, s5844–s5849, s6031–s6036, s17077 | S \ F (20286) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_completed/properties/definition_revision:minimum` | s17076 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_completed/properties/lifecycle_seq:type` | s1123–s1125, s5669–s5674, s5862–s5867, s6049–s6054, s17084 | S \ F (20286) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_completed/properties/lifecycle_seq:minimum` | s17083 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_completed:required:completed_at_utc` | s17071 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_completed:required:completion_trigger` | s17059, s17072 | S \ F (20306) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_completed/properties/completion_trigger:enum` | s1108–s1110, s5639–s5644, s5832–s5837, s6019–s6024, s17060, s17073 | S \ F (20285) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_completed:required:state_before` | s17094 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_completed/allOf/1/then/allOf/1/properties/state_before:enum;Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_completed/properties/state_before:enum` | s489, s1147–s1149, s5701–s5706, s5894–s5899, s6081–s6086, s17062, s17095 | S \ F (20284) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_completed:required:required_slot_ids` | s17088 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_completed/properties/required_slot_ids:type` | s1138–s1140, s5684–s5688, s5877–s5881, s6064–s6068, s17089 | S \ F (20289) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_completed:required:waived_slot_ids` | s17097 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_completed/properties/waived_slot_ids:type` | s1156–s1158, s5711–s5715, s5904–s5908, s6091–s6095, s17098 | S \ F (20289) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_completed:required:output_refs` | s17085 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_completed/properties/output_refs:type` | s1129–s1131, s5675–s5679, s5868–s5872, s6055–s6059, s17086 | S \ F (20289) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_completed:required:currentness_hash` | s17074 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_completed:required:idempotency_key` | s17079 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_completed/properties/idempotency_key:type` | s1118–s1119, s5657–s5660, s5850–s5853, s6037–s6040, s17080 | S \ F (20293) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_completed_application:required:schema_version` | s17048 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_completed_application/properties/schema_version:const` | s1072–s1074, s5588–s5593, s5787–s5792, s5974–s5979, s6161–s6166, s17049 | S \ F (20280) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_completed_application:required:scope_kind` | s17050 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_completed_application/properties/scope_kind:const` | s1075–s1077, s5594–s5599, s5793–s5798, s5980–s5985, s6167–s6172, s17051 | S \ F (20280) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_completed_application:required:project_id` | s17044 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_completed_application:required:server_id` | s17052 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_completed_application:required:thread_id` | s17055 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_completed_application:required:collaboration_id` | s17026 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_completed_application:required:collaboration_run_id` | s17027 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_completed_application:required:kind` | s17038 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_completed_application:required:definition_revision` | s17032 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_completed_application/properties/definition_revision:type` | s1047–s1049, s5549–s5554, s5748–s5753, s5935–s5940, s6122–s6127, s17034 | S \ F (20280) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_completed_application/properties/definition_revision:minimum` | s17033 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_completed_application:required:lifecycle_seq` | s17039 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_completed_application/properties/lifecycle_seq:type` | s1056–s1058, s5567–s5572, s5766–s5771, s5953–s5958, s6140–s6145, s17041 | S \ F (20280) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_completed_application/properties/lifecycle_seq:minimum` | s17040 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_completed_application:required:completed_at_utc` | s17028 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_completed_application:required:completion_trigger` | s17029, s17064 | S \ F (20306) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_completed_application/properties/completion_trigger:enum` | s1041–s1043, s5537–s5542, s5736–s5741, s5923–s5928, s6110–s6115, s17030, s17065 | S \ F (20279) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_completed_application:required:state_before` | s17053 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_completed_application/allOf/1/then/allOf/1/properties/state_before:enum;Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_completed_application/properties/state_before:enum` | s1081–s1083, s5604–s5609, s5803–s5808, s5990–s5995, s6177–s6182, s17054, s17067 | S \ F (20279) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_completed_application:required:required_slot_ids` | s17046 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_completed_application/properties/required_slot_ids:type` | s1069–s1071, s5583–s5587, s5782–s5786, s5969–s5973, s6156–s6160, s17047 | S \ F (20284) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_completed_application:required:waived_slot_ids` | s17056 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_completed_application/properties/waived_slot_ids:type` | s1090–s1092, s5614–s5618, s5813–s5817, s6000–s6004, s6187–s6191, s17057 | S \ F (20284) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_completed_application:required:output_refs` | s17042 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_completed_application/properties/output_refs:type` | s1062–s1064, s5573–s5577, s5772–s5776, s5959–s5963, s6146–s6150, s17043 | S \ F (20284) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_completed_application:required:currentness_hash` | s17031 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_completed_application:required:idempotency_key` | s17036 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_completed_application/properties/idempotency_key:type` | s1051–s1052, s5555–s5558, s5754–s5757, s5941–s5944, s6128–s6131, s17037 | S \ F (20289) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_completed_application:additionalProperties` | s17025 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_failed:required:schema_version` | s17333 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_failed/properties/schema_version:const` | s1480–s1482, s7799–s7804, s7962–s7967, s8119–s8124, s17334 | S \ F (20286) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_failed:required:scope_kind` | s17335 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_failed/properties/scope_kind:const` | s1483–s1485, s7805–s7810, s7968–s7973, s8125–s8130, s17336 | S \ F (20286) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_failed:required:project_id` | s17332 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_failed:required:thread_id` | s17339 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_failed:required:collaboration_id` | s17316 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_failed:required:collaboration_run_id` | s17317 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_failed:required:kind` | s17328 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_failed:required:definition_revision` | s17319 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_failed/properties/definition_revision:type` | s1459–s1461, s7753–s7758, s7922–s7927, s8079–s8084, s17321 | S \ F (20286) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_failed/properties/definition_revision:minimum` | s17320 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_failed/properties/lifecycle_seq:type` | s1474–s1476, s7789–s7794, s7952–s7957, s8109–s8114, s17331 | S \ F (20286) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_failed/properties/lifecycle_seq:minimum` | s17330 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_failed:required:failed_at_utc` | s17322 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_failed:required:failure_reason` | s17323 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_failed:required:state_before` | s17337 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_failed/properties/state_before:enum` | s1486–s1488, s7811–s7816, s7974–s7979, s8131–s8136, s17338 | S \ F (20286) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_failed:required:currentness_hash` | s17318 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_failed:required:idempotency_key` | s17326 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_failed/properties/idempotency_key:type` | s1469–s1470, s7777–s7780, s7940–s7943, s8097–s8100, s17327 | S \ F (20293) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_failed_application:required:schema_version` | s17307 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_failed_application/properties/schema_version:const` | s1429–s1431, s7713–s7718, s7882–s7887, s8039–s8044, s8196–s8201, s17308 | S \ F (20280) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_failed_application:required:scope_kind` | s17309 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_failed_application/properties/scope_kind:const` | s1432–s1434, s7719–s7724, s7888–s7893, s8045–s8050, s8202–s8207, s17310 | S \ F (20280) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_failed_application:required:project_id` | s17305 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_failed_application:required:server_id` | s17311 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_failed_application:required:thread_id` | s17314 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_failed_application:required:collaboration_id` | s17289 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_failed_application:required:collaboration_run_id` | s17290 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_failed_application:required:kind` | s17301 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_failed_application:required:definition_revision` | s17292 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_failed_application/properties/definition_revision:type` | s1410–s1412, s7672–s7677, s7835–s7840, s7998–s8003, s8155–s8160, s17294 | S \ F (20280) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_failed_application/properties/definition_revision:minimum` | s17293 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_failed_application:required:lifecycle_seq` | s17302 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_failed_application/properties/lifecycle_seq:type` | s1425–s1427, s7702–s7707, s7871–s7876, s8028–s8033, s8185–s8190, s17304 | S \ F (20280) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_failed_application/properties/lifecycle_seq:minimum` | s17303 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_failed_application:required:failed_at_utc` | s17295 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_failed_application:required:failure_reason` | s17296 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_failed_application/properties/failure_reason:enum` | s1416–s1418, s7684–s7689, s7847–s7852, s8010–s8015, s8167–s8172, s17297 | S \ F (20280) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_failed_application:required:state_before` | s17312 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_failed_application/properties/state_before:enum` | s1438–s1440, s7729–s7734, s7898–s7903, s8055–s8060, s8212–s8217, s17313 | S \ F (20280) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_failed_application:required:currentness_hash` | s17291 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_failed_application:required:idempotency_key` | s17299 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_failed_application/properties/idempotency_key:type` | s1420–s1421, s7690–s7693, s7859–s7862, s8016–s8019, s8173–s8176, s17300 | S \ F (20289) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_failed_application:additionalProperties` | s17288 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_started:required:schema_version` | s17727 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_started/properties/schema_version:const` | s2103–s2105, s11614–s11619, s11809–s11814, s12012–s12017, s17728 | S \ F (20286) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_started:required:scope_kind` | s17729 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_started/properties/scope_kind:const` | s2106–s2108, s11620–s11625, s11815–s11820, s12018–s12023, s17730 | S \ F (20286) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_started:required:project_id` | s17723 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_started:required:thread_id` | s17732 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_started:required:collaboration_id` | s17711 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_started:required:collaboration_run_id` | s17712 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_started:required:kind` | s17721 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_started:required:definition_revision` | s17714 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_started/properties/definition_revision:type` | s2079–s2081, s11571–s11576, s11766–s11771, s11965–s11970, s17716 | S \ F (20286) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_started/properties/definition_revision:minimum` | s17715 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_started:required:started_at_utc` | s17731 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_started:required:assignment_revision` | s17706 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_started/properties/assignment_revision:type` | s2064–s2066, s11547–s11552, s11742–s11747, s11937–s11942, s17708 | S \ F (20286) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_started/properties/assignment_revision:minimum` | s17707 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_started:required:additive_role_kind` | s17704 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_started:required:required` | s17725 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_started/properties/required:type` | s2100–s2102, s11609–s11613, s11804–s11808, s12003–s12007, s17726 | S \ F (20289) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_started:required:requested_identity_ref` | s17724 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_started:required:effective_identity_ref` | s17717 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_started:required:currentness_hash` | s17713 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_started:required:idempotency_key` | s17719 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_started/properties/idempotency_key:type` | s2086–s2087, s11583–s11586, s11778–s11781, s11977–s11980, s17720 | S \ F (20293) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_started_application:required:schema_version` | s17697 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_started_application/properties/schema_version:const` | s2046–s2048, s11515–s11520, s11710–s11715, s11905–s11910, s12116–s12121, s17698 | S \ F (20280) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_started_application:required:scope_kind` | s17699 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_started_application/properties/scope_kind:const` | s2049–s2051, s11521–s11526, s11716–s11721, s11911–s11916, s12122–s12127, s17700 | S \ F (20280) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_started_application:required:project_id` | s17692 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_started_application:required:server_id` | s17701 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_started_application:required:thread_id` | s17703 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_started_application:required:collaboration_id` | s17680 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_started_application:required:collaboration_run_id` | s17681 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_started_application:required:kind` | s17690 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_started_application:required:definition_revision` | s17683 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_started_application/properties/definition_revision:type` | s2024–s2026, s11471–s11476, s11666–s11671, s11861–s11866, s12068–s12073, s17685 | S \ F (20280) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_started_application/properties/definition_revision:minimum` | s17684 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_started_application:required:started_at_utc` | s17702 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_started_application:required:participant_slot_id` | s17691 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_started_application:required:assignment_revision` | s17675 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_started_application/properties/assignment_revision:type` | s2009–s2011, s11447–s11452, s11642–s11647, s11837–s11842, s12040–s12045, s17677 | S \ F (20280) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_started_application/properties/assignment_revision:minimum` | s17676 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_started_application:required:attempt_id` | s17678 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_started_application:required:additive_role_kind` | s17674 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_started_application:required:required` | s17695 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_started_application/properties/required:type` | s2043–s2045, s11510–s11514, s11705–s11709, s11900–s11904, s12107–s12111, s17696 | S \ F (20284) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_started_application:required:requested_identity_ref` | s17694 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_started_application:required:effective_identity_ref` | s17686 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_started_application:required:currentness_hash` | s17682 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_started_application:required:idempotency_key` | s17688 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_started_application/properties/idempotency_key:type` | s2031–s2032, s11483–s11486, s11678–s11681, s11873–s11876, s12080–s12083, s17689 | S \ F (20289) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_started_application:additionalProperties` | s17679 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_completed:required:schema_version` | s17638 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_completed/properties/schema_version:const` | s1985–s1987, s10555–s10560, s10750–s10755, s10945–s10950, s11130–s11135, s11311–s11316, s17639 | S \ F (20274) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_completed:required:scope_kind` | s17640 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_completed/properties/scope_kind:const` | s1988–s1990, s10561–s10566, s10756–s10761, s10951–s10956, s11136–s11141, s11317–s11322, s17641 | S \ F (20274) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_completed:required:project_id` | s17635 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_completed:required:thread_id` | s17642 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_completed:required:collaboration_id` | s17620 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_completed:required:collaboration_run_id` | s17621 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_completed:required:kind` | s17631 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_completed:required:definition_revision` | s17623 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_completed/properties/definition_revision:type` | s1958–s1960, s10506–s10511, s10689–s10694, s10896–s10901, s11075–s11080, s11262–s11267, s17625 | S \ F (20274) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_completed/properties/definition_revision:minimum` | s17624 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_completed:required:finished_at_utc` | s17627 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_completed:required:assignment_revision` | s17615 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_completed/properties/assignment_revision:type` | s1943–s1945, s10482–s10487, s10665–s10670, s10872–s10877, s11055–s11060, s11242–s11247, s17617 | S \ F (20274) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_completed/properties/assignment_revision:minimum` | s17616 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_completed/allOf/1/then:required:attempt_id` | s17618 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_completed:required:outcome` | s17607, s17632, s17643 | S \ F (20305) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_completed:required:required` | s17636 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_completed/properties/required:type` | s1982–s1984, s10550–s10554, s10745–s10749, s10940–s10944, s11125–s11129, s11306–s11310, s17637 | S \ F (20279) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_completed:required:disposition_record_ref` | s17626 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_completed:required:currentness_hash` | s17622 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_completed:required:idempotency_key` | s17629 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_completed/properties/idempotency_key:type` | s1968–s1969, s10524–s10527, s10713–s10716, s10914–s10917, s11093–s11096, s11280–s11283, s17630 | S \ F (20285) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_completed_application:required:schema_version` | s17601 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_completed_application/properties/schema_version:const` | s1919–s1921, s10462–s10467, s10645–s10650, s10852–s10857, s11035–s11040, s11222–s11227, s11409–s11414, s17602 | S \ F (20268) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_completed_application:required:scope_kind` | s17603 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_completed_application/properties/scope_kind:const` | s1922–s1924, s10468–s10473, s10651–s10656, s10858–s10863, s11041–s11046, s11228–s11233, s11415–s11420, s17604 | S \ F (20268) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_completed_application:required:project_id` | s17597 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_completed_application:required:server_id` | s17605 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_completed_application:required:thread_id` | s17606 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_completed_application:required:collaboration_id` | s17583 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_completed_application:required:collaboration_run_id` | s17584 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_completed_application:required:kind` | s17594 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_completed_application:required:definition_revision` | s17586 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_completed_application/properties/definition_revision:type` | s1894–s1896, s10412–s10417, s10595–s10600, s10790–s10795, s10985–s10990, s11166–s11171, s11359–s11364, s17588 | S \ F (20268) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_completed_application/properties/definition_revision:minimum` | s17587 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_completed_application:required:finished_at_utc` | s17590 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_completed_application:required:participant_slot_id` | s17596 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_completed_application:required:assignment_revision` | s17578 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_completed_application/properties/assignment_revision:type` | s1879–s1881, s10388–s10393, s10571–s10576, s10766–s10771, s10961–s10966, s11146–s11151, s11339–s11344, s17580 | S \ F (20268) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_completed_application/properties/assignment_revision:minimum` | s17579 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_completed_application/allOf/1/then:required:attempt_id` | s17581 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_completed_application:required:outcome` | s17595, s17611, s17647 | S \ F (20305) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_completed_application:required:required` | s17599 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_completed_application/properties/required:type` | s1916–s1918, s10457–s10461, s10640–s10644, s10847–s10851, s11030–s11034, s11217–s11221, s11404–s11408, s17600 | S \ F (20274) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_completed_application:required:disposition_record_ref` | s17589 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_completed_application:required:currentness_hash` | s17585 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_completed_application:required:idempotency_key` | s17592 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_completed_application/properties/idempotency_key:type` | s1904–s1905, s10430–s10433, s10613–s10616, s10814–s10817, s11003–s11006, s11184–s11187, s11377–s11380, s17593 | S \ F (20281) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_completed_application:additionalProperties` | s17582 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_message_added:required:schema_version` | s17562 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_message_added/properties/schema_version:const` | s1846–s1848, s9413–s9418, s9622–s9627, s9827–s9832, s10036–s10041, s10245–s10250, s17563 | S \ F (20274) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_message_added:required:scope_kind` | s17564 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_message_added/properties/scope_kind:const` | s1849–s1851, s9419–s9424, s9628–s9633, s9833–s9838, s10042–s10047, s10251–s10256, s17565 | S \ F (20274) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_message_added:required:project_id` | s17559 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_message_added:required:thread_id` | s17572 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_message_added:required:collaboration_id` | s17546 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_message_added:required:collaboration_run_id` | s17548 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_message_added:required:kind` | s17556 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_message_added:required:definition_revision` | s17550 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_message_added/properties/definition_revision:type` | s1825–s1827, s9380–s9385, s9589–s9594, s9794–s9799, s9999–s10004, s10212–s10217, s17552 | S \ F (20274) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_message_added/properties/definition_revision:minimum` | s17551 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_message_added:required:written_at_utc` | s17573 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_message_added:required:sequence` | s17569 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_message_added/properties/sequence:type` | s1858–s1860, s9435–s9440, s9644–s9649, s9849–s9854, s10058–s10063, s10267–s10272, s17571 | S \ F (20274) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_message_added:required:sender_kind` | s17567 | S \ F (20307) |
| `schema:Plans/collaborative_workflows_contracts.schema.json#/$defs/sender_kind:enum` | s158, s681–s683, s727–s729, s1783–s1785, s1855–s1857, s3477–s3482, s3562–s3567, s3642–s3647, s3727–s3732, s3807–s3812, s3892–s3897, s3976–s3981, s9321–s9326, s9429–s9434, s9534–s9539, s9638–s9643, s9739–s9744, s9843–s9848, s9944–s9949, s10052–s10057, s10157–s10162, s10261–s10266, s10362–s10367, s17568 | S \ F (20186) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_message_added:required:sender_id` | s17566 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_message_added:required:message_type` | s17557 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_message_added:required:recipient_ids` | s17560 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_message_added/properties/recipient_ids:type` | s1843–s1845, s9408–s9412, s9617–s9621, s9822–s9826, s10027–s10031, s10240–s10244, s17561 | S \ F (20279) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_message_added:required:body_ref` | s17544 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_message_added:required:attachment_refs` | s17542 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_message_added/properties/attachment_refs:type` | s1807–s1809, s9347–s9351, s9560–s9564, s9765–s9769, s9970–s9974, s10183–s10187, s17543 | S \ F (20279) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_message_added:required:currentness_hash` | s17549 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_message_added:required:idempotency_key` | s17554 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_message_added/properties/idempotency_key:type` | s1829–s1830, s9386–s9389, s9595–s9598, s9800–s9803, s10005–s10008, s10218–s10221, s17555 | S \ F (20285) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_message_added_application:required:schema_version` | s17526 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_message_added_application/properties/schema_version:const` | s1774–s1776, s9305–s9310, s9518–s9523, s9723–s9728, s9928–s9933, s10141–s10146, s10346–s10351, s17527 | S \ F (20268) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_message_added_application:required:scope_kind` | s17528 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_message_added_application/properties/scope_kind:const` | s1777–s1779, s9311–s9316, s9524–s9529, s9729–s9734, s9934–s9939, s10147–s10152, s10352–s10357, s17529 | S \ F (20268) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_message_added_application:required:project_id` | s17522 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_message_added_application:required:server_id` | s17535 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_message_added_application:required:thread_id` | s17536 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_message_added_application:required:collaboration_id` | s17510 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_message_added_application:required:collaboration_run_id` | s17512 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_message_added_application:required:kind` | s17520 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_message_added_application:required:definition_revision` | s17514 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_message_added_application/properties/definition_revision:type` | s1755–s1757, s9271–s9276, s9484–s9489, s9689–s9694, s9894–s9899, s10103–s10108, s10312–s10317, s17516 | S \ F (20268) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_message_added_application/properties/definition_revision:minimum` | s17515 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_message_added_application:required:written_at_utc` | s17537 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_message_added_application:required:collaboration_message_id` | s17511 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_message_added_application:required:sequence` | s17532 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_message_added_application/properties/sequence:type` | s1786–s1788, s9327–s9332, s9540–s9545, s9745–s9750, s9950–s9955, s10163–s10168, s10368–s10373, s17534 | S \ F (20268) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_message_added_application/properties/sequence:minimum` | s17533 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_message_added_application:required:sender_kind` | s17531 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_message_added_application:required:sender_id` | s17530 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_message_added_application:required:message_type` | s17521 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_message_added_application:required:recipient_ids` | s17524 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_message_added_application/properties/recipient_ids:type` | s1771–s1773, s9300–s9304, s9513–s9517, s9718–s9722, s9923–s9927, s10132–s10136, s10341–s10345, s17525 | S \ F (20274) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_message_added_application:required:body_ref` | s17508 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_message_added_application:required:attachment_refs` | s17506 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_message_added_application/properties/attachment_refs:type` | s1737–s1739, s9242–s9246, s9451–s9455, s9660–s9664, s9865–s9869, s10074–s10078, s10283–s10287, s17507 | S \ F (20274) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_message_added_application:required:currentness_hash` | s17513 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_message_added_application:required:idempotency_key` | s17518 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_message_added_application/properties/idempotency_key:type` | s1759–s1760, s9277–s9280, s9490–s9493, s9695–s9698, s9900–s9903, s10109–s10112, s10318–s10321, s17519 | S \ F (20281) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_message_added_application:additionalProperties` | s17509 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_artifact_added:required:schema_version` | s16746 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_artifact_added/properties/schema_version:const` | s757–s759, s3616–s3621, s3781–s3786, s3946–s3951, s16747 | S \ F (20286) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_artifact_added:required:scope_kind` | s16748 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_artifact_added/properties/scope_kind:const` | s760–s762, s3622–s3627, s3787–s3792, s3952–s3957, s16749 | S \ F (20286) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_artifact_added:required:project_id` | s16745 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_artifact_added:required:thread_id` | s16750 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_artifact_added:required:collaboration_id` | s16735 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_artifact_added:required:collaboration_run_id` | s16736 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_artifact_added:required:kind` | s16744 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_artifact_added:required:definition_revision` | s16738 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_artifact_added/properties/definition_revision:type` | s745–s747, s3594–s3599, s3759–s3764, s3924–s3929, s16740 | S \ F (20286) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_artifact_added/properties/definition_revision:minimum` | s16739 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_artifact_added:required:added_at_utc` | s16729 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_artifact_added:required:artifact_version_ref` | s16733 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_artifact_added:required:added_by_kind` | s16731 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_artifact_added:required:added_by_id` | s16730 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_artifact_added:required:currentness_hash` | s16737 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_artifact_added:required:idempotency_key` | s16742 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_artifact_added/properties/idempotency_key:type` | s749–s750, s3600–s3603, s3765–s3768, s3930–s3933, s16743 | S \ F (20293) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_artifact_added_application:required:schema_version` | s16723 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_artifact_added_application/properties/schema_version:const` | s709–s711, s3532–s3537, s3697–s3702, s3862–s3867, s4031–s4036, s16724 | S \ F (20280) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_artifact_added_application:required:scope_kind` | s16725 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_artifact_added_application/properties/scope_kind:const` | s712–s714, s3538–s3543, s3703–s3708, s3868–s3873, s4037–s4042, s16726 | S \ F (20280) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_artifact_added_application:required:project_id` | s16721 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_artifact_added_application:required:server_id` | s16727 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_artifact_added_application:required:thread_id` | s16728 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_artifact_added_application:required:collaboration_id` | s16711 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_artifact_added_application:required:collaboration_run_id` | s16712 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_artifact_added_application:required:kind` | s16720 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_artifact_added_application:required:definition_revision` | s16714 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_artifact_added_application/properties/definition_revision:type` | s699–s701, s3509–s3514, s3674–s3679, s3839–s3844, s4008–s4013, s16716 | S \ F (20280) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_artifact_added_application/properties/definition_revision:minimum` | s16715 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_artifact_added_application:required:added_at_utc` | s16705 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_artifact_added_application:required:artifact_ref` | s16708 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_artifact_added_application:required:artifact_version_ref` | s16709 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_artifact_added_application:required:added_by_kind` | s16707 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_artifact_added_application:required:added_by_id` | s16706 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_artifact_added_application:required:currentness_hash` | s16713 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_artifact_added_application:required:idempotency_key` | s16718 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_artifact_added_application/properties/idempotency_key:type` | s703–s704, s3515–s3518, s3680–s3683, s3845–s3848, s4014–s4017, s16719 | S \ F (20289) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_artifact_added_application:additionalProperties` | s16710 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_configuration_changed:required:schema_version` | s17185 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_configuration_changed/properties/schema_version:const` | s1280–s1282, s6379–s6384, s6586–s6591, s6792–s6797, s6990–s6995, s17186 | S \ F (20280) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_configuration_changed:required:scope_kind` | s17187 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_configuration_changed/properties/scope_kind:const` | s1283–s1285, s6385–s6390, s6592–s6597, s6798–s6803, s6996–s7001, s17188 | S \ F (20280) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_configuration_changed:required:project_id` | s17180 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_configuration_changed:required:thread_id` | s17190 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_configuration_changed:required:collaboration_id` | s17166 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_configuration_changed:required:collaboration_run_id` | s17167 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_configuration_changed:required:kind` | s17176 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_configuration_changed/properties/definition_revision:type` | s1259–s1261, s6346–s6351, s6553–s6558, s6759–s6764, s6957–s6962, s17172 | S \ F (20280) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_configuration_changed:required:previous_definition_revision` | s17177 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_configuration_changed/properties/previous_definition_revision:type` | s1268–s1270, s6364–s6369, s6571–s6576, s6777–s6782, s6975–s6980, s17179 | S \ F (20280) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_configuration_changed/properties/previous_definition_revision:minimum` | s17178 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_configuration_changed:required:changed_at_utc` | s17164 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_configuration_changed:required:change_source` | s17162, s17192 | S \ F (20306) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_configuration_changed/properties/change_source:enum` | s1241–s1243, s6314–s6319, s6521–s6526, s6727–s6732, s6925–s6930, s17163, s17193 | S \ F (20279) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_configuration_changed:required:change_kinds` | s17159 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_configuration_changed/properties/change_kinds:type` | s1238–s1240, s6309–s6313, s6516–s6520, s6722–s6726, s6920–s6924, s17160 | S \ F (20284) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_configuration_changed/properties/change_kinds:maxItems;Plans/collaboration_event_payloads.schema.json#/$defs/reconfigure_change_kind:enum` | s590, s1168–s1170, s1235–s1237, s17161 | S \ F (20300) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_configuration_changed:required:affected_slot_ids` | s17155 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_configuration_changed/properties/affected_slot_ids:type` | s1232–s1234, s6304–s6308, s6510–s6514, s6717–s6721, s6914–s6918, s17156 | S \ F (20284) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_configuration_changed/properties/affected_slot_ids:uniqueItems` | s17154 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_configuration_changed/properties/affected_slot_ids:maxItems` | s17157 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_configuration_changed:required:accept_stale_target` | s17152 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_configuration_changed/properties/accept_stale_target:type` | s1226–s1228, s6298, s6300–s6303, s6505–s6509, s6909–s6913, s17153 | S \ F (20289) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_configuration_changed:required:command_instance_ref` | s17168 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_configuration_changed/allOf/2/then:required:system_message_id` | s17189 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_configuration_changed:required:currentness_hash` | s17169 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_configuration_changed:required:idempotency_key` | s17174 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_configuration_changed/properties/idempotency_key:type` | s1263–s1264, s6352–s6355, s6559–s6562, s6765–s6768, s6963–s6966, s17175 | S \ F (20289) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_configuration_changed:required:required_slot_ids` | s17182 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_configuration_changed/properties/required_slot_ids:type` | s1277–s1279, s6374–s6378, s6581–s6585, s6787–s6791, s6985–s6989, s17183 | S \ F (20284) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_configuration_changed/properties/required_slot_ids:uniqueItems` | s17181 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_configuration_changed/properties/required_slot_ids:maxItems` | s17184 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_configuration_changed_application:required:schema_version` | s17145 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_configuration_changed_application/properties/schema_version:const` | s1211–s1213, s6274–s6279, s6481–s6486, s6688–s6693, s6889–s6894, s7092–s7097, s17146 | S \ F (20274) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_configuration_changed_application:required:scope_kind` | s17147 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_configuration_changed_application/properties/scope_kind:const` | s1214–s1216, s6280–s6285, s6487–s6492, s6694–s6699, s6895–s6900, s7098–s7103, s17148 | S \ F (20274) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_configuration_changed_application:required:project_id` | s17139 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_configuration_changed_application:required:server_id` | s17149 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_configuration_changed_application:required:thread_id` | s17151 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_configuration_changed_application:required:collaboration_id` | s17125 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_configuration_changed_application:required:collaboration_run_id` | s17126 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_configuration_changed_application:required:kind` | s17135 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_configuration_changed_application:required:definition_revision` | s17129 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_configuration_changed_application/properties/definition_revision:type` | s1192–s1194, s6240–s6245, s6447–s6452, s6654–s6659, s6855–s6860, s7058–s7063, s17131 | S \ F (20274) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_configuration_changed_application/properties/definition_revision:minimum` | s17130 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_configuration_changed_application:required:previous_definition_revision` | s17136 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_configuration_changed_application/properties/previous_definition_revision:type` | s1201–s1203, s6258–s6263, s6465–s6470, s6672–s6677, s6873–s6878, s7076–s7081, s17138 | S \ F (20274) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_configuration_changed_application/properties/previous_definition_revision:minimum` | s17137 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_configuration_changed_application:required:changed_at_utc` | s17123 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_configuration_changed_application:required:change_source` | s17121, s17195 | S \ F (20306) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_configuration_changed_application/properties/change_source:enum` | s1174–s1176, s6208–s6213, s6415–s6420, s6622–s6627, s6823–s6828, s7026–s7031, s17122, s17196 | S \ F (20273) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_configuration_changed_application:required:change_kinds` | s17118 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_configuration_changed_application/properties/change_kinds:type` | s1171–s1173, s6203–s6207, s6410–s6414, s6617–s6621, s6818–s6822, s7021–s7025, s17119 | S \ F (20279) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_configuration_changed_application/allOf/1/then/properties/change_kinds:minItems` | s6202, s6400, s6616, s7020, s17117 | S \ F (20303) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_configuration_changed_application/properties/change_kinds:maxItems;Plans/collaboration_event_payloads.schema.json#/$defs/reconfigure_change_kind:enum` | s590, s1168–s1170, s1235–s1237, s17120 | S \ F (20300) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_configuration_changed_application:required:affected_slot_ids` | s17114 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_configuration_changed_application/properties/affected_slot_ids:type` | s1165–s1167, s6197–s6201, s6405–s6409, s6611–s6615, s6813–s6817, s7015–s7019, s17115 | S \ F (20279) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_configuration_changed_application/properties/affected_slot_ids:uniqueItems` | s17113 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_configuration_changed_application/properties/affected_slot_ids:maxItems` | s17116 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_configuration_changed_application:required:accept_stale_target` | s17111 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_configuration_changed_application/properties/accept_stale_target:type` | s1159–s1161, s6192–s6196, s6399, s6401–s6404, s6606–s6610, s7010–s7014, s17112 | S \ F (20284) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_configuration_changed_application:required:command_instance_ref` | s17127 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_configuration_changed_application/allOf/2/then:required:system_message_id` | s17150 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_configuration_changed_application:required:currentness_hash` | s17128 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_configuration_changed_application:required:idempotency_key` | s17133 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_configuration_changed_application/properties/idempotency_key:type` | s1196–s1197, s6246–s6249, s6453–s6456, s6660–s6663, s6861–s6864, s7064–s7067, s17134 | S \ F (20285) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_configuration_changed_application:required:required_slot_ids` | s17142 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_configuration_changed_application/properties/required_slot_ids:type` | s1208–s1210, s6269–s6273, s6476–s6480, s6683–s6687, s6884–s6888, s7087–s7091, s17143 | S \ F (20279) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_configuration_changed_application/properties/required_slot_ids:uniqueItems` | s17141 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_configuration_changed_application/properties/required_slot_ids:maxItems` | s17144 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_configuration_changed_application:additionalProperties` | s17124 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_proposal_added:required:schema_version` | s17908 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_proposal_added/properties/schema_version:const` | s2421–s2423, s13485–s13490, s13664–s13669, s17909 | S \ F (20292) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_proposal_added:required:scope_kind` | s17910 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_proposal_added/properties/scope_kind:const` | s2424–s2426, s13491–s13496, s13670–s13675, s17911 | S \ F (20292) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_proposal_added:required:project_id` | s17902 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_proposal_added:required:thread_id` | s17912 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_proposal_added:required:collaboration_id` | s17890 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_proposal_added:required:collaboration_run_id` | s17891 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_proposal_added:required:kind` | s17899 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_proposal_added:required:definition_revision` | s17893 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_proposal_added/properties/definition_revision:type` | s2397–s2399, s13443–s13448, s13622–s13627, s17895 | S \ F (20292) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_proposal_added/properties/definition_revision:minimum` | s17894 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_proposal_added:required:added_at_utc` | s17885 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_proposal_added:required:participant_slot_id` | s17901 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_proposal_added:required:attempt_id` | s17886 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_proposal_added:required:proposal_round` | s17905 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_proposal_added/properties/proposal_round:type` | s2418–s2420, s13479–s13484, s13658–s13663, s17907 | S \ F (20292) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_proposal_added:required:blind_round` | s17887 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_proposal_added/properties/blind_round:type` | s2385–s2387, s13424–s13428, s13603–s13607, s17888 | S \ F (20294) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_proposal_added:required:proposal_record_ref` | s17904 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_proposal_added:required:currentness_hash` | s17892 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_proposal_added:required:idempotency_key` | s17897 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_proposal_added/properties/idempotency_key:type` | s2401–s2402, s13449–s13452, s13628–s13631, s17898 | S \ F (20297) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_proposal_added_application:required:schema_version` | s17879 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_proposal_added_application/properties/schema_version:const` | s2367–s2369, s13394–s13399, s13573–s13578, s13752–s13757, s17880 | S \ F (20286) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_proposal_added_application:required:scope_kind` | s17881 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_proposal_added_application/properties/scope_kind:const` | s2370–s2372, s13400–s13405, s13579–s13584, s13758–s13763, s17882 | S \ F (20286) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_proposal_added_application:required:project_id` | s17872 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_proposal_added_application:required:server_id` | s17883 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_proposal_added_application:required:thread_id` | s17884 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_proposal_added_application:required:collaboration_id` | s17860 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_proposal_added_application:required:collaboration_run_id` | s17861 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_proposal_added_application:required:kind` | s17869 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_proposal_added_application/properties/kind:const` | s2351–s2353, s13363–s13368, s13542–s13547, s13721–s13726, s17870 | S \ F (20286) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_proposal_added_application:required:definition_revision` | s17863 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_proposal_added_application/properties/definition_revision:type` | s2345–s2347, s13351–s13356, s13530–s13535, s13709–s13714, s17865 | S \ F (20286) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_proposal_added_application/properties/definition_revision:minimum` | s17864 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_proposal_added_application:required:added_at_utc` | s17855 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_proposal_added_application:required:proposal_id` | s17874 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_proposal_added_application:required:participant_slot_id` | s17871 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_proposal_added_application:required:attempt_id` | s17856 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_proposal_added_application:required:proposal_round` | s17876 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_proposal_added_application/properties/proposal_round:type` | s2364–s2366, s13388–s13393, s13567–s13572, s13746–s13751, s17878 | S \ F (20286) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_proposal_added_application/properties/proposal_round:minimum` | s17877 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_proposal_added_application:required:blind_round` | s17857 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_proposal_added_application/properties/blind_round:type` | s2333–s2335, s13332–s13336, s13511–s13515, s13690–s13694, s17858 | S \ F (20289) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_proposal_added_application:required:proposal_record_ref` | s17875 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_proposal_added_application:required:currentness_hash` | s17862 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_proposal_added_application:required:idempotency_key` | s17867 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_proposal_added_application/properties/idempotency_key:type` | s2349–s2350, s13357–s13360, s13536–s13539, s13715–s13718, s17868 | S \ F (20293) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_proposal_added_application:additionalProperties` | s17859 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_vote_added:required:schema_version` | s19488 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_vote_added/properties/schema_version:const` | s3452–s3454, s15549–s15554, s15748–s15753, s19489 | S \ F (20292) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_vote_added:required:scope_kind` | s19490 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_vote_added/properties/scope_kind:const` | s3455–s3457, s15555–s15560, s15754–s15759, s19491 | S \ F (20292) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_vote_added:required:project_id` | s19486 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_vote_added:required:thread_id` | s19492 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_vote_added:required:collaboration_id` | s19468 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_vote_added:required:collaboration_run_id` | s19469 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_vote_added:required:kind` | s19481 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_vote_added/properties/kind:const` | s3437–s3439, s15525–s15530, s15724–s15729, s19482 | S \ F (20292) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_vote_added:required:definition_revision` | s19473 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_vote_added/properties/definition_revision:type` | s3425–s3427, s15508–s15513, s15707–s15712, s19475 | S \ F (20292) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_vote_added/properties/definition_revision:minimum` | s19474 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_vote_added:required:cast_at_utc` | s19466 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_vote_added:required:proposal_id` | s19487 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_vote_added:required:participant_slot_id` | s19483 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_vote_added:required:attempt_id` | s19465 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_vote_added:required:position` | s19484 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_vote_added:required:confidence` | s19470 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_vote_added/properties/confidence:type` | s3419–s3421, s15496–s15501, s15695–s15700, s19471 | S \ F (20292) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_vote_added:required:hard_constraint_conflict_ids` | s19476 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_vote_added/properties/hard_constraint_conflict_ids:type` | s3431–s3433, s15514–s15518, s15713–s15717, s19477 | S \ F (20294) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_vote_added:required:vote_record_ref` | s19494 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_vote_added:required:currentness_hash` | s19472 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_vote_added:required:idempotency_key` | s19479 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_vote_added/properties/idempotency_key:type` | s3435–s3436, s15519–s15522, s15718–s15721, s19480 | S \ F (20297) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_vote_added_application:required:schema_version` | s19453 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_vote_added_application/properties/schema_version:const` | s3389–s3391, s15448–s15453, s15647–s15652, s15846–s15851, s19454 | S \ F (20286) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_vote_added_application:required:scope_kind` | s19455 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_vote_added_application/properties/scope_kind:const` | s3392–s3394, s15454–s15459, s15653–s15658, s15852–s15857, s19456 | S \ F (20286) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_vote_added_application:required:project_id` | s19450 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_vote_added_application:required:server_id` | s19457 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_vote_added_application:required:thread_id` | s19458 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_vote_added_application:required:collaboration_id` | s19433 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_vote_added_application:required:collaboration_run_id` | s19434 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_vote_added_application:required:kind` | s19446 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_vote_added_application/properties/kind:const` | s3376–s3378, s15423–s15428, s15622–s15627, s15821–s15826, s19447 | S \ F (20286) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_vote_added_application:required:definition_revision` | s19438 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_vote_added_application/properties/definition_revision:type` | s3364–s3366, s15406–s15411, s15605–s15610, s15804–s15809, s19440 | S \ F (20286) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_vote_added_application/properties/definition_revision:minimum` | s19439 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_vote_added_application:required:cast_at_utc` | s19431 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_vote_added_application:required:vote_id` | s19459 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_vote_added_application:required:proposal_id` | s19452 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_vote_added_application:required:participant_slot_id` | s19448 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_vote_added_application:required:attempt_id` | s19430 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_vote_added_application:required:position` | s19449 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_vote_added_application:required:confidence` | s19435 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_vote_added_application/properties/confidence:type` | s3358–s3360, s15394–s15399, s15593–s15598, s15792–s15797, s19436 | S \ F (20286) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_vote_added_application:required:hard_constraint_conflict_ids` | s19441 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_vote_added_application/properties/hard_constraint_conflict_ids:type` | s3370–s3372, s15412–s15416, s15611–s15615, s15810–s15814, s19442 | S \ F (20289) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_vote_added_application:required:vote_record_ref` | s19460 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_vote_added_application:required:currentness_hash` | s19437 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_vote_added_application:required:idempotency_key` | s19444 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_vote_added_application/properties/idempotency_key:type` | s3374–s3375, s15417–s15420, s15616–s15619, s15815–s15818, s19445 | S \ F (20293) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_vote_added_application:additionalProperties` | s19432 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_plan_synthesized:required:schema_version` | s17847 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_plan_synthesized/properties/schema_version:const` | s2309–s2311, s12793–s12798, s12990–s12995, s13187–s13192, s17848 | S \ F (20286) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_plan_synthesized:required:scope_kind` | s17849 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_plan_synthesized/properties/scope_kind:const` | s2312–s2314, s12799–s12804, s12996–s13001, s13193–s13198, s17850 | S \ F (20286) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_plan_synthesized:required:project_id` | s17843 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_plan_synthesized:required:thread_id` | s17852 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_plan_synthesized:required:collaboration_id` | s17821 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_plan_synthesized:required:collaboration_run_id` | s17822 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_plan_synthesized:required:kind` | s17833 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_plan_synthesized:required:definition_revision` | s17824 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_plan_synthesized/properties/definition_revision:type` | s2279–s2281, s12737–s12742, s12934–s12939, s13131–s13136, s17826 | S \ F (20286) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_plan_synthesized/properties/definition_revision:minimum` | s17825 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_plan_synthesized:required:synthesized_at_utc` | s17851 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_plan_synthesized:required:plan_version` | s17840 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_plan_synthesized/properties/plan_version:type` | s2300–s2302, s12777–s12782, s12974–s12979, s13171–s13176, s17842 | S \ F (20286) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_plan_synthesized/properties/plan_version:minimum` | s17841 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_plan_synthesized:required:plan_hash` | s17839 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_plan_synthesized:required:plan_create_receipt_ref` | s17838 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_plan_synthesized:required:dissent_count` | s17827 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_plan_synthesized/properties/dissent_count:type` | s2282–s2284, s12743–s12748, s12940–s12945, s13137–s13142, s17829 | S \ F (20286) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_plan_synthesized/properties/dissent_count:minimum` | s17828 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_plan_synthesized:required:rejected_alternative_count` | s17844 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_plan_synthesized/properties/rejected_alternative_count:type` | s2306–s2308, s12787–s12792, s12984–s12989, s13181–s13186, s17846 | S \ F (20286) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_plan_synthesized/properties/rejected_alternative_count:minimum` | s17845 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_plan_synthesized:required:lead_count` | s17835 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_plan_synthesized/properties/lead_count:type` | s2291–s2293, s12761–s12766, s12958–s12963, s13155–s13160, s17837 | S \ F (20286) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_plan_synthesized/properties/lead_count:minimum` | s17836 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_plan_synthesized:required:currentness_hash` | s17823 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_plan_synthesized:required:idempotency_key` | s17831 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_plan_synthesized/properties/idempotency_key:type` | s2286–s2287, s12749–s12752, s12946–s12949, s13143–s13146, s17832 | S \ F (20293) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_plan_synthesized_application:required:schema_version` | s17812 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_plan_synthesized_application/properties/schema_version:const` | s2252–s2254, s12693–s12698, s12890–s12895, s13087–s13092, s13290–s13295, s17813 | S \ F (20280) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_plan_synthesized_application:required:scope_kind` | s17814 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_plan_synthesized_application/properties/scope_kind:const` | s2255–s2257, s12699–s12704, s12896–s12901, s13093–s13098, s13296–s13301, s17815 | S \ F (20280) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_plan_synthesized_application:required:project_id` | s17807 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_plan_synthesized_application:required:server_id` | s17816 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_plan_synthesized_application:required:thread_id` | s17818 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_plan_synthesized_application:required:collaboration_id` | s17785 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_plan_synthesized_application:required:collaboration_run_id` | s17786 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_plan_synthesized_application:required:kind` | s17797 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_plan_synthesized_application/properties/kind:const` | s2233–s2235, s12654–s12659, s12851–s12856, s13048–s13053, s13251–s13256, s17798 | S \ F (20280) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_plan_synthesized_application:required:definition_revision` | s17788 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_plan_synthesized_application/properties/definition_revision:type` | s2224–s2226, s12636–s12641, s12833–s12838, s13030–s13035, s13233–s13238, s17790 | S \ F (20280) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_plan_synthesized_application/properties/definition_revision:minimum` | s17789 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_plan_synthesized_application:required:synthesized_at_utc` | s17817 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_plan_synthesized_application:required:assistant_plan_id` | s17783 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_plan_synthesized_application:required:plan_version` | s17804 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_plan_synthesized_application/properties/plan_version:type` | s2245–s2247, s12676–s12681, s12873–s12878, s13070–s13075, s13273–s13278, s17806 | S \ F (20280) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_plan_synthesized_application/properties/plan_version:minimum` | s17805 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_plan_synthesized_application:required:plan_hash` | s17803 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_plan_synthesized_application:required:plan_create_receipt_ref` | s17802 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_plan_synthesized_application:required:dissent_count` | s17791 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_plan_synthesized_application/properties/dissent_count:type` | s2227–s2229, s12642–s12647, s12839–s12844, s13036–s13041, s13239–s13244, s17793 | S \ F (20280) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_plan_synthesized_application/properties/dissent_count:minimum` | s17792 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_plan_synthesized_application:required:rejected_alternative_count` | s17809 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_plan_synthesized_application/properties/rejected_alternative_count:type` | s2249–s2251, s12687–s12692, s12884–s12889, s13081–s13086, s13284–s13289, s17811 | S \ F (20280) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_plan_synthesized_application/properties/rejected_alternative_count:minimum` | s17810 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_plan_synthesized_application:required:lead_count` | s17799 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_plan_synthesized_application/properties/lead_count:type` | s2236–s2238, s12660–s12665, s12857–s12862, s13054–s13059, s13257–s13262, s17801 | S \ F (20280) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_plan_synthesized_application/properties/lead_count:minimum` | s17800 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_plan_synthesized_application:required:currentness_hash` | s17787 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_plan_synthesized_application:required:idempotency_key` | s17795 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_plan_synthesized_application/properties/idempotency_key:type` | s2231–s2232, s12648–s12651, s12845–s12848, s13042–s13045, s13245–s13248, s17796 | S \ F (20289) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_plan_synthesized_application:additionalProperties` | s17784 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_added:required:schema_version` | s17396 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_added/properties/schema_version:const` | s1589–s1591, s8379–s8384, s8564–s8569, s17397 | S \ F (20292) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_added:required:scope_kind` | s17398 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_added/properties/scope_kind:const` | s1592–s1594, s8385–s8390, s8570–s8575, s17399 | S \ F (20292) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_added:required:project_id` | s17395 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_added:required:thread_id` | s17406 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_added:required:collaboration_id` | s17376 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_added:required:collaboration_run_id` | s17377 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_added:required:kind` | s17388 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_added/properties/kind:const` | s1577–s1579, s8363–s8368, s8548–s8553, s17389 | S \ F (20292) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_added:required:definition_revision` | s17379 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_added/properties/definition_revision:type` | s1562–s1564, s8337–s8342, s8522–s8527, s17381 | S \ F (20292) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_added/properties/definition_revision:minimum` | s17380 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_added:required:added_at_utc` | s17374 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_added:required:finding_key` | s17383 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_added:required:severity` | s17400 | S \ F (20307) |
| `schema:Plans/collaborative_workflows_contracts.schema.json#/$defs/review_severity:enum` | s1538–s1540, s1595–s1597, s8301–s8306, s8391–s8396, s8486–s8491, s8576–s8581, s8671–s8676, s16055, s17401 | S \ F (20270) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_added:required:originating_reviewer_ids` | s17392 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_added/properties/originating_reviewer_ids:type` | s1583–s1585, s8370–s8374, s8555–s8559, s17393 | S \ F (20294) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_added/properties/originating_reviewer_ids:uniqueItems` | s17390 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_added/properties/originating_reviewer_ids:maxItems` | s17394 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_added:required:target_hashes` | s17403 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_added/properties/target_hashes:type` | s1601–s1603, s8398–s8402, s8583–s8587, s17404 | S \ F (20294) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_added/properties/target_hashes:minItems` | s8397, s8582, s17402 | S \ F (20305) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_added/properties/target_hashes:maxItems` | s17405 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_added:required:finding_record_ref` | s17384 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_added:required:currentness_hash` | s17378 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_added:required:idempotency_key` | s17386 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_added/properties/idempotency_key:type` | s1575–s1576, s8357–s8360, s8542–s8545, s17387 | S \ F (20297) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_added_application:required:schema_version` | s17363 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_added_application/properties/schema_version:const` | s1529–s1531, s8285–s8290, s8470–s8475, s8655–s8660, s17364 | S \ F (20286) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_added_application:required:scope_kind` | s17365 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_added_application/properties/scope_kind:const` | s1532–s1534, s8291–s8296, s8476–s8481, s8661–s8666, s17366 | S \ F (20286) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_added_application:required:project_id` | s17361 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_added_application:required:server_id` | s17367 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_added_application:required:thread_id` | s17373 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_added_application:required:collaboration_id` | s17342 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_added_application:required:collaboration_run_id` | s17343 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_added_application:required:kind` | s17354 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_added_application/properties/kind:const` | s1519–s1521, s8268–s8273, s8453–s8458, s8638–s8643, s17355 | S \ F (20286) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_added_application:required:definition_revision` | s17345 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_added_application/properties/definition_revision:type` | s1504–s1506, s8242–s8247, s8427–s8432, s8612–s8617, s17347 | S \ F (20286) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_added_application/properties/definition_revision:minimum` | s17346 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_added_application:required:added_at_utc` | s17340 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_added_application:required:finding_id` | s17348 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_added_application:required:finding_key` | s17349 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_added_application:required:severity` | s17368 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_added_application:required:originating_reviewer_ids` | s17358 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_added_application/properties/originating_reviewer_ids:type` | s1525–s1527, s8275–s8279, s8460–s8464, s8645–s8649, s17359 | S \ F (20289) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_added_application/properties/originating_reviewer_ids:minItems` | s8274, s8459, s8644, s17357 | S \ F (20304) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_added_application/properties/originating_reviewer_ids:uniqueItems` | s17356 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_added_application/properties/originating_reviewer_ids:maxItems` | s17360 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_added_application:required:target_hashes` | s17370 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_added_application/properties/target_hashes:type` | s1544–s1546, s8308–s8312, s8493–s8497, s8678–s8682, s17371 | S \ F (20289) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_added_application/properties/target_hashes:minItems` | s8307, s8492, s8677, s17369 | S \ F (20304) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_added_application/properties/target_hashes:maxItems` | s17372 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_added_application:required:finding_record_ref` | s17350 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_added_application:required:currentness_hash` | s17344 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_added_application:required:idempotency_key` | s17352 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_added_application/properties/idempotency_key:type` | s1517–s1518, s8262–s8265, s8447–s8450, s8632–s8635, s17353 | S \ F (20293) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_added_application:additionalProperties` | s17341 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_dispositioned:required:schema_version` | s17473 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_dispositioned/properties/schema_version:const` | s1719–s1721, s8886–s8891, s9107–s9112, s17474 | S \ F (20292) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_dispositioned:required:scope_kind` | s17475 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_dispositioned/properties/scope_kind:const` | s1722–s1724, s8892–s8897, s9113–s9118, s17476 | S \ F (20292) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_dispositioned:required:project_id` | s17472 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_dispositioned:required:thread_id` | s17481 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_dispositioned:required:collaboration_id` | s17447 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_dispositioned:required:collaboration_run_id` | s17448 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_dispositioned:required:kind` | s17470 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_dispositioned/properties/kind:const` | s1713–s1715, s8876–s8881, s9097–s9102, s17471 | S \ F (20292) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_dispositioned:required:definition_revision` | s17455 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_dispositioned/properties/definition_revision:type` | s1689–s1691, s8832–s8837, s9053–s9058, s17457 | S \ F (20292) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_dispositioned/properties/definition_revision:minimum` | s17456 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_dispositioned:required:dispositioned_at_utc` | s17460 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_dispositioned:required:finding_key` | s17465 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_dispositioned:required:disposition` | s17458 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_dispositioned:required:confidence` | s17449 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_dispositioned/properties/confidence:type` | s1680–s1682, s8814–s8819, s9035–s9040, s17450 | S \ F (20292) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_dispositioned:required:counted_vote_count` | s17451 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_dispositioned/properties/counted_vote_count:type` | s1683–s1685, s8820–s8825, s9041–s9046, s17453 | S \ F (20292) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_dispositioned/properties/counted_vote_count:minimum` | s17452 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_dispositioned:required:dissent_count` | s17461 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_dispositioned/properties/dissent_count:type` | s1698–s1700, s8850–s8855, s9071–s9076, s17463 | S \ F (20292) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_dispositioned/properties/dissent_count:minimum` | s17462 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_dispositioned:required:target_hashes` | s17478 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_dispositioned/properties/target_hashes:type` | s1728–s1730, s8899–s8903, s9120–s9124, s17479 | S \ F (20294) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_dispositioned/properties/target_hashes:minItems` | s8898, s9119, s17477 | S \ F (20305) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_dispositioned/properties/target_hashes:maxItems` | s17480 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_dispositioned:required:adjudicator_ref` | s17445 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_dispositioned:required:finding_record_ref` | s17466 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_dispositioned:required:currentness_hash` | s17454 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_dispositioned:required:idempotency_key` | s17468 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_dispositioned/properties/idempotency_key:type` | s1711–s1712, s8870–s8873, s9091–s9094, s17469 | S \ F (20297) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_dispositioned_application:required:schema_version` | s17435 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_dispositioned_application/properties/schema_version:const` | s1653–s1655, s8774–s8779, s8995–s9000, s9216–s9221, s17436 | S \ F (20286) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_dispositioned_application:required:scope_kind` | s17437 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_dispositioned_application/properties/scope_kind:const` | s1656–s1658, s8780–s8785, s9001–s9006, s9222–s9227, s17438 | S \ F (20286) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_dispositioned_application:required:project_id` | s17433 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_dispositioned_application:required:server_id` | s17439 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_dispositioned_application:required:thread_id` | s17444 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_dispositioned_application:required:collaboration_id` | s17409 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_dispositioned_application:required:collaboration_run_id` | s17410 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_dispositioned_application:required:kind` | s17431 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_dispositioned_application/properties/kind:const` | s1649–s1651, s8763–s8768, s8984–s8989, s9205–s9210, s17432 | S \ F (20286) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_dispositioned_application:required:definition_revision` | s17417 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_dispositioned_application/properties/definition_revision:type` | s1625–s1627, s8719–s8724, s8940–s8945, s9161–s9166, s17419 | S \ F (20286) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_dispositioned_application/properties/definition_revision:minimum` | s17418 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_dispositioned_application:required:dispositioned_at_utc` | s17421 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_dispositioned_application:required:finding_id` | s17425 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_dispositioned_application:required:finding_key` | s17426 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_dispositioned_application:required:disposition` | s17420 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_dispositioned_application:required:confidence` | s17411 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_dispositioned_application/properties/confidence:type` | s1616–s1618, s8701–s8706, s8922–s8927, s9143–s9148, s17412 | S \ F (20286) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_dispositioned_application:required:counted_vote_count` | s17413 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_dispositioned_application/properties/counted_vote_count:type` | s1619–s1621, s8707–s8712, s8928–s8933, s9149–s9154, s17415 | S \ F (20286) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_dispositioned_application/properties/counted_vote_count:minimum` | s17414 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_dispositioned_application:required:dissent_count` | s17422 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_dispositioned_application/properties/dissent_count:type` | s1634–s1636, s8737–s8742, s8958–s8963, s9179–s9184, s17424 | S \ F (20286) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_dispositioned_application/properties/dissent_count:minimum` | s17423 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_dispositioned_application:required:target_hashes` | s17441 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_dispositioned_application/properties/target_hashes:type` | s1665–s1667, s8791–s8795, s9012–s9016, s9233–s9237, s17442 | S \ F (20289) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_dispositioned_application/properties/target_hashes:minItems` | s8790, s9011, s9232, s17440 | S \ F (20304) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_dispositioned_application/properties/target_hashes:maxItems` | s17443 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_dispositioned_application:required:adjudicator_ref` | s17407 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_dispositioned_application:required:finding_record_ref` | s17427 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_dispositioned_application:required:currentness_hash` | s17416 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_dispositioned_application:required:idempotency_key` | s17429 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_dispositioned_application/properties/idempotency_key:type` | s1647–s1648, s8757–s8760, s8978–s8981, s9199–s9202, s17430 | S \ F (20293) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_dispositioned_application:additionalProperties` | s17408 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized:required:schema_version` | s16842 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized/properties/schema_version:const` | s902–s904, s4294–s4299, s4577–s4582, s4860–s4865, s16843 | S \ F (20286) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized:required:scope_kind` | s16844 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized/properties/scope_kind:const` | s905–s907, s4300–s4305, s4583–s4588, s4866–s4871, s16845 | S \ F (20286) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized:required:project_id` | s16835 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized:required:thread_id` | s16855 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized:required:collaboration_id` | s16809 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized:required:collaboration_run_id` | s16810 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized:required:kind` | s16831 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized/properties/kind:const` | s887–s889, s4267–s4272, s4550–s4555, s4833–s4838, s16832 | S \ F (20286) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized:required:definition_revision` | s16818 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized/properties/definition_revision:type` | s872–s874, s4237–s4242, s4520–s4525, s4803–s4808, s16820 | S \ F (20286) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized/properties/definition_revision:minimum` | s16819 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized:required:finalized_at_utc` | s16827 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized:required:artifact_version_ref` | s16807 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized:required:target_pack_ref` | s16854 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized:required:target_hashes` | s16851 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized/properties/target_hashes:type` | s917–s919, s4317–s4321, s4600–s4604, s4884–s4888, s16852 | S \ F (20289) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized/properties/target_hashes:minItems` | s4316, s4599, s4883, s16850 | S \ F (20304) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized/properties/target_hashes:maxItems` | s16853 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized:required:requested_reviewer_count` | s16839 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized/properties/requested_reviewer_count:type` | s899–s901, s4288–s4293, s4571–s4576, s16841 | S \ F (20292) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized/allOf/1/then/properties/requested_reviewer_count:minimum;Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized/properties/requested_reviewer_count:minimum` | s4873, s16840 | S \ F (20306) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized:required:completed_reviewer_count` | s16811 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized/properties/completed_reviewer_count:type` | s863–s865, s4219–s4224, s4502–s4507, s4785–s4790, s16813 | S \ F (20286) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized/properties/completed_reviewer_count:minimum` | s16812 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized:required:failed_reviewer_count` | s16824 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized/properties/failed_reviewer_count:type` | s878–s880, s4249–s4254, s4532–s4537, s4815–s4820, s16826 | S \ F (20286) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized/properties/failed_reviewer_count:minimum` | s16825 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized:required:single_reviewer` | s16846, s16862 | S \ F (20306) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized/properties/single_reviewer:type` | s908–s910, s4306–s4310, s4589–s4593, s4872, s4874–s4877, s16847, s16863 | S \ F (20288) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized:required:partial_coverage_accepted` | s16833 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized/properties/partial_coverage_accepted:type` | s890–s892, s4273–s4277, s4556–s4560, s4839–s4843, s16834 | S \ F (20289) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized:required:stale_target_accepted` | s16848 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized/properties/stale_target_accepted:type` | s911–s913, s4311–s4315, s4594–s4598, s4878–s4882, s16849 | S \ F (20289) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized:required:confirmed_count` | s16814 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized/properties/confirmed_count:type` | s866–s868, s4225–s4230, s4508–s4513, s4791–s4796, s16816 | S \ F (20286) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized/properties/confirmed_count:minimum` | s16815 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized:required:rejected_count` | s16836 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized/properties/rejected_count:type` | s896–s898, s4282–s4287, s4565–s4570, s4848–s4853, s16838 | S \ F (20286) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized/properties/rejected_count:minimum` | s16837 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized:required:duplicate_count` | s16821 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized/properties/duplicate_count:type` | s875–s877, s4243–s4248, s4526–s4531, s4809–s4814, s16823 | S \ F (20286) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized/properties/duplicate_count:minimum` | s16822 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized:required:uncertain_count` | s16856 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized/properties/uncertain_count:type` | s926–s928, s4332–s4337, s4615–s4620, s4899–s4904, s16858 | S \ F (20286) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized/properties/uncertain_count:minimum` | s16857 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized:required:currentness_hash` | s16817 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized:required:idempotency_key` | s16829 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized/properties/idempotency_key:type` | s885–s886, s4261–s4264, s4544–s4547, s4827–s4830, s16830 | S \ F (20293) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized_application:required:schema_version` | s16788 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized_application/properties/schema_version:const` | s821–s823, s4151–s4156, s4434–s4439, s4717–s4722, s5001–s5006, s16789 | S \ F (20280) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized_application:required:scope_kind` | s16790 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized_application/properties/scope_kind:const` | s824–s826, s4157–s4162, s4440–s4445, s4723–s4728, s5007–s5012, s16791 | S \ F (20280) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized_application:required:project_id` | s16780 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized_application:required:server_id` | s16792 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized_application:required:thread_id` | s16802 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized_application:required:collaboration_id` | s16754 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized_application:required:collaboration_run_id` | s16755 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized_application:required:kind` | s16776 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized_application/properties/kind:const` | s808–s810, s4123–s4128, s4406–s4411, s4689–s4694, s4973–s4978, s16777 | S \ F (20280) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized_application:required:definition_revision` | s16763 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized_application/properties/definition_revision:type` | s793–s795, s4093–s4098, s4376–s4381, s4659–s4664, s4943–s4948, s16765 | S \ F (20280) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized_application/properties/definition_revision:minimum` | s16764 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized_application:required:finalized_at_utc` | s16772 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized_application:required:artifact_ref` | s16751 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized_application:required:artifact_version_ref` | s16752 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized_application:required:target_pack_ref` | s16801 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized_application:required:target_hashes` | s16798 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized_application/properties/target_hashes:type` | s839–s841, s4178–s4182, s4461–s4465, s4744–s4748, s5029–s5033, s16799 | S \ F (20284) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized_application/properties/target_hashes:minItems` | s4177, s4460, s4743, s5028, s16797 | S \ F (20303) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized_application/properties/target_hashes:maxItems` | s16800 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized_application:required:requested_reviewer_count` | s16785 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized_application/properties/requested_reviewer_count:type` | s818–s820, s4145–s4150, s4428–s4433, s4711–s4716, s16787 | S \ F (20286) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized_application/allOf/1/then/properties/requested_reviewer_count:minimum;Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized_application/properties/requested_reviewer_count:minimum` | s5018, s16786 | S \ F (20306) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized_application:required:completed_reviewer_count` | s16756 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized_application/properties/completed_reviewer_count:type` | s784–s786, s4075–s4080, s4358–s4363, s4641–s4646, s4925–s4930, s16758 | S \ F (20280) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized_application/properties/completed_reviewer_count:minimum` | s16757 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized_application:required:failed_reviewer_count` | s16769 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized_application/properties/failed_reviewer_count:type` | s799–s801, s4105–s4110, s4388–s4393, s4671–s4676, s4955–s4960, s16771 | S \ F (20280) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized_application/properties/failed_reviewer_count:minimum` | s16770 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized_application:required:single_reviewer` | s16793, s16867 | S \ F (20306) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized_application/properties/single_reviewer:type` | s830–s832, s4167–s4171, s4450–s4454, s4733–s4737, s5017, s5019–s5022, s16794, s16868 | S \ F (20283) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized_application:required:partial_coverage_accepted` | s16778 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized_application/properties/partial_coverage_accepted:type` | s811–s813, s4129–s4133, s4412–s4416, s4695–s4699, s4979–s4983, s16779 | S \ F (20284) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized_application:required:stale_target_accepted` | s16795 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized_application/properties/stale_target_accepted:type` | s833–s835, s4172–s4176, s4455–s4459, s4738–s4742, s5023–s5027, s16796 | S \ F (20284) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized_application:required:confirmed_count` | s16759 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized_application/properties/confirmed_count:type` | s787–s789, s4081–s4086, s4364–s4369, s4647–s4652, s4931–s4936, s16761 | S \ F (20280) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized_application/properties/confirmed_count:minimum` | s16760 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized_application:required:rejected_count` | s16782 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized_application/properties/rejected_count:type` | s815–s817, s4139–s4144, s4422–s4427, s4705–s4710, s4989–s4994, s16784 | S \ F (20280) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized_application/properties/rejected_count:minimum` | s16783 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized_application:required:duplicate_count` | s16766 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized_application/properties/duplicate_count:type` | s796–s798, s4099–s4104, s4382–s4387, s4665–s4670, s4949–s4954, s16768 | S \ F (20280) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized_application/properties/duplicate_count:minimum` | s16767 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized_application:required:uncertain_count` | s16803 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized_application/properties/uncertain_count:type` | s848–s850, s4193–s4198, s4476–s4481, s4759–s4764, s5044–s5049, s16805 | S \ F (20280) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized_application/properties/uncertain_count:minimum` | s16804 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized_application:required:currentness_hash` | s16762 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized_application:required:idempotency_key` | s16774 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized_application/properties/idempotency_key:type` | s806–s807, s4117–s4120, s4400–s4403, s4683–s4686, s4967–s4970, s16775 | S \ F (20289) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized_application:additionalProperties` | s16753 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_started/properties/target_hashes:type` | s3331–s3333, s15250–s15254, s19420 | S \ F (20299) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_started/properties/target_hashes:minItems` | s15249, s19418 | S \ F (20306) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_started/properties/target_hashes:maxItems` | s19421 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_started/properties/crew_auto_revision:type` | s3268–s3270, s14775–s14780, s19380 | S \ F (20298) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_started/properties/crew_auto_revision:minimum` | s19379 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_started/allOf/2/then/properties/kind:const;Plans/collaborative_workflows_contracts.schema.json#/$defs/collaboration_kind:enum` | s666, s705–s707, s751–s753, s956–s958, s1008–s1010, s1053–s1055, s1120–s1122, s1198–s1200, s1265–s1267, s1319–s1321, s1374–s1376, s1422–s1424, s1471–s1473, s1761–s1763, s1831–s1833, s1906–s1908, s1970–s1972, s2033–s2035, s2088–s2090, s2145–s2147, s2188–s2190, s2448–s2450, s2491–s2493, s3213–s3215, s3292–s3294, s3521–s3526, s3606–s3611, s3686–s3691, s3771–s3776, s3851–s3856, s3936–s3941, s4020–s4025, s5100–s5105, s5193–s5198, s5281–s5286, s5380–s5385, s5474–s5479, s5561–s5566, s5856–s5861, s5947–s5952, s6043–s6048, s6134–s6139, s6252–s6257, s6358–s6363, s6459–s6464, s6565–s6570, s6666–s6671, s6771–s6776, s6867–s6872, s6969–s6974, s7070–s7075, s7166–s7171, s7258–s7263, s7345–s7350, s7437–s7442, s7524–s7529, s7616–s7621, s7696–s7701, s7783–s7788, s7865–s7870, s7946–s7951, s8022–s8027, s8103–s8108, s8179–s8184, s9283–s9288, s9392–s9397, s9496–s9501, s9601–s9606, s9701–s9706, s9806–s9811, s9906–s9911, s10011–s10016, s10115–s10120, s10224–s10229, s10324–s10329, s10436–s10441, s10530–s10535, s10619–s10624, s10719–s10724, s10820–s10825, s10920–s10925, s11009–s11014, s11099–s11104, s11190–s11195, s11286–s11291, s11383–s11388, s11489–s11494, s11589–s11594, s11684–s11689, s11784–s11789, s11879–s11884, s11983–s11988, s12086–s12091, s12174–s12179, s12255–s12260, s12336–s12341, s12412–s12417, s12493–s12498, s12569–s12574, s13804–s13809, s13885–s13890, s13961–s13966, s14042–s14047, s14123–s14128, s14199–s14204, s14280–s14285, s14383–s14388, s14481–s14486, s14584–s14589, s14799–s14804, s14899–s14904, s14998–s15003, s15092–s15097, s15191–s15196, s15297–s15302, s16687, s17253, s19367, s19417, s19424 | S \ F (19690) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_started/allOf/1/else:not;Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_started/allOf/2/then:required:assistant_plan_id` | s19366, s20161 | S \ F (20306) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_started/allOf/1/then:required:plan_version` | s19368 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_started/properties/plan_version:type` | s3259–s3261, s14602–s14607, s19370 | S \ F (20298) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_started/properties/plan_version:minimum` | s19369 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_completed/allOf/0/then/properties/kind:const;Plans/collaborative_workflows_contracts.schema.json#/$defs/collaboration_kind:enum` | s469, s666, s705–s707, s751–s753, s956–s958, s1008–s1010, s1053–s1055, s1120–s1122, s1198–s1200, s1265–s1267, s1319–s1321, s1374–s1376, s1422–s1424, s1471–s1473, s1761–s1763, s1831–s1833, s1906–s1908, s1970–s1972, s2033–s2035, s2088–s2090, s2145–s2147, s2188–s2190, s2448–s2450, s2491–s2493, s3213–s3215, s3292–s3294, s3521–s3526, s3606–s3611, s3686–s3691, s3771–s3776, s3851–s3856, s3936–s3941, s4020–s4025, s5100–s5105, s5193–s5198, s5281–s5286, s5380–s5385, s5474–s5479, s5561–s5566, s5663–s5668, s5856–s5861, s5947–s5952, s6043–s6048, s6134–s6139, s6252–s6257, s6358–s6363, s6459–s6464, s6565–s6570, s6666–s6671, s6771–s6776, s6867–s6872, s6969–s6974, s7070–s7075, s7166–s7171, s7258–s7263, s7345–s7350, s7437–s7442, s7524–s7529, s7616–s7621, s7696–s7701, s7783–s7788, s7865–s7870, s7946–s7951, s8022–s8027, s8103–s8108, s8179–s8184, s9283–s9288, s9392–s9397, s9496–s9501, s9601–s9606, s9701–s9706, s9806–s9811, s9906–s9911, s10011–s10016, s10115–s10120, s10224–s10229, s10324–s10329, s10436–s10441, s10530–s10535, s10619–s10624, s10719–s10724, s10820–s10825, s10920–s10925, s11009–s11014, s11099–s11104, s11190–s11195, s11286–s11291, s11383–s11388, s11489–s11494, s11589–s11594, s11684–s11689, s11784–s11789, s11879–s11884, s11983–s11988, s12086–s12091, s12174–s12179, s12255–s12260, s12336–s12341, s12412–s12417, s12493–s12498, s12569–s12574, s13804–s13809, s13885–s13890, s13961–s13966, s14042–s14047, s14123–s14128, s14199–s14204, s14280–s14285, s14383–s14388, s14481–s14486, s14799–s14804, s14899–s14904, s14998–s15003, s15092–s15097, s15191–s15196, s15297–s15302, s16687, s17061, s17253, s19417, s19424 | S \ F (19689) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_completed/properties/state_before:enum` | s5701–s5706, s17062 | S \ F (20301) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_completed/allOf/0/then:required:command_instance_ref` | s17058 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_completed/properties/required_slot_ids:uniqueItems` | s17101 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_completed/properties/required_slot_ids:maxItems` | s17102 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_completed/properties/waived_slot_ids:uniqueItems` | s17103 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_completed/properties/waived_slot_ids:maxItems` | s17104 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_completed/properties/output_refs:uniqueItems` | s17099 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_completed/properties/output_refs:maxItems` | s17100 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_completed/properties/outcome_reason:enum` | s1934–s1936, s10731–s10736, s11111–s11116, s17610 | S \ F (20292) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_message_added/properties/recipient_ids:uniqueItems` | s17574 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_message_added/properties/recipient_ids:maxItems` | s17575 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_message_added/properties/attachment_refs:uniqueItems` | s17538 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_message_added/properties/attachment_refs:maxItems` | s17539 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_configuration_changed/allOf/0/then/allOf/1/properties/accept_stale_target:const;Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_configuration_changed/properties/accept_stale_target:type` | s1226–s1228, s6298, s6300–s6303, s6505–s6509, s6712–s6716, s6909–s6913, s17153, s17191 | S \ F (20283) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_vote_added/properties/hard_constraint_conflict_ids:uniqueItems` | s19461 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_vote_added/properties/hard_constraint_conflict_ids:maxItems` | s19462 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized/allOf/0/then/properties/requested_reviewer_count:const;Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized/properties/requested_reviewer_count:type` | s155, s899–s901, s4288–s4293, s4571–s4576, s4854–s4859, s16841, s16859, s16861 | S \ F (20283) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized/allOf/0/then/properties/requested_reviewer_count:const;Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized/properties/requested_reviewer_count:minimum` | s155, s16859–s16860 | S \ F (20305) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_started_application/allOf/3/then:required:target_pack_ref` | s19429 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_started_application/allOf/3/then:required:target_hashes` | s19426 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_started_application/properties/target_hashes:type` | s3340–s3342, s15361–s15365, s19427 | S \ F (20299) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_started_application/properties/target_hashes:minItems` | s15360, s19425 | S \ F (20306) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_started_application/properties/target_hashes:maxItems` | s19428 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_started_application/allOf/0/then:required:crew_auto_revision` | s19383 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_started_application/properties/crew_auto_revision:type` | s3271–s3273, s14875–s14880, s19385 | S \ F (20298) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_started_application/properties/crew_auto_revision:minimum` | s19384 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_started_application/allOf/2/then/properties/kind:const;Plans/collaborative_workflows_contracts.schema.json#/$defs/collaboration_kind:enum` | s666, s705–s707, s751–s753, s956–s958, s1008–s1010, s1053–s1055, s1120–s1122, s1198–s1200, s1265–s1267, s1319–s1321, s1374–s1376, s1422–s1424, s1471–s1473, s1761–s1763, s1831–s1833, s1906–s1908, s1970–s1972, s2033–s2035, s2088–s2090, s2145–s2147, s2188–s2190, s2448–s2450, s2491–s2493, s3213–s3215, s3292–s3294, s3521–s3526, s3606–s3611, s3686–s3691, s3771–s3776, s3851–s3856, s3936–s3941, s4020–s4025, s5100–s5105, s5193–s5198, s5281–s5286, s5380–s5385, s5474–s5479, s5561–s5566, s5856–s5861, s5947–s5952, s6043–s6048, s6134–s6139, s6252–s6257, s6358–s6363, s6459–s6464, s6565–s6570, s6666–s6671, s6771–s6776, s6867–s6872, s6969–s6974, s7070–s7075, s7166–s7171, s7258–s7263, s7345–s7350, s7437–s7442, s7524–s7529, s7616–s7621, s7696–s7701, s7783–s7788, s7865–s7870, s7946–s7951, s8022–s8027, s8103–s8108, s8179–s8184, s9283–s9288, s9392–s9397, s9496–s9501, s9601–s9606, s9701–s9706, s9806–s9811, s9906–s9911, s10011–s10016, s10115–s10120, s10224–s10229, s10324–s10329, s10436–s10441, s10530–s10535, s10619–s10624, s10719–s10724, s10820–s10825, s10920–s10925, s11009–s11014, s11099–s11104, s11190–s11195, s11286–s11291, s11383–s11388, s11489–s11494, s11589–s11594, s11684–s11689, s11784–s11789, s11879–s11884, s11983–s11988, s12086–s12091, s12174–s12179, s12255–s12260, s12336–s12341, s12412–s12417, s12493–s12498, s12569–s12574, s13804–s13809, s13885–s13890, s13961–s13966, s14042–s14047, s14123–s14128, s14199–s14204, s14280–s14285, s14383–s14388, s14481–s14486, s14688–s14693, s14799–s14804, s14899–s14904, s14998–s15003, s15092–s15097, s15191–s15196, s15297–s15302, s16687, s17253, s19372, s19417, s19424 | S \ F (19690) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_started_application/allOf/1/else:not;Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_started_application/allOf/2/then:required:assistant_plan_id` | s19371 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_started_application/allOf/1/then:required:plan_version` | s19373 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_started_application/properties/plan_version:type` | s3265–s3267, s14706–s14711, s19375 | S \ F (20298) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_started_application/properties/plan_version:minimum` | s19374 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_completed_application/allOf/0/then/properties/kind:const;Plans/collaborative_workflows_contracts.schema.json#/$defs/collaboration_kind:enum` | s666, s705–s707, s751–s753, s956–s958, s1008–s1010, s1053–s1055, s1120–s1122, s1198–s1200, s1265–s1267, s1319–s1321, s1374–s1376, s1422–s1424, s1471–s1473, s1761–s1763, s1831–s1833, s1906–s1908, s1970–s1972, s2033–s2035, s2088–s2090, s2145–s2147, s2188–s2190, s2448–s2450, s2491–s2493, s3213–s3215, s3292–s3294, s3521–s3526, s3606–s3611, s3686–s3691, s3771–s3776, s3851–s3856, s3936–s3941, s4020–s4025, s5100–s5105, s5193–s5198, s5281–s5286, s5380–s5385, s5474–s5479, s5561–s5566, s5760–s5765, s5856–s5861, s5947–s5952, s6043–s6048, s6134–s6139, s6252–s6257, s6358–s6363, s6459–s6464, s6565–s6570, s6666–s6671, s6771–s6776, s6867–s6872, s6969–s6974, s7070–s7075, s7166–s7171, s7258–s7263, s7345–s7350, s7437–s7442, s7524–s7529, s7616–s7621, s7696–s7701, s7783–s7788, s7865–s7870, s7946–s7951, s8022–s8027, s8103–s8108, s8179–s8184, s9283–s9288, s9392–s9397, s9496–s9501, s9601–s9606, s9701–s9706, s9806–s9811, s9906–s9911, s10011–s10016, s10115–s10120, s10224–s10229, s10324–s10329, s10436–s10441, s10530–s10535, s10619–s10624, s10719–s10724, s10820–s10825, s10920–s10925, s11009–s11014, s11099–s11104, s11190–s11195, s11286–s11291, s11383–s11388, s11489–s11494, s11589–s11594, s11684–s11689, s11784–s11789, s11879–s11884, s11983–s11988, s12086–s12091, s12174–s12179, s12255–s12260, s12336–s12341, s12412–s12417, s12493–s12498, s12569–s12574, s13804–s13809, s13885–s13890, s13961–s13966, s14042–s14047, s14123–s14128, s14199–s14204, s14280–s14285, s14383–s14388, s14481–s14486, s14799–s14804, s14899–s14904, s14998–s15003, s15092–s15097, s15191–s15196, s15297–s15302, s16687, s17066, s17253, s19417, s19424 | S \ F (19690) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_completed_application/properties/state_before:enum` | s5803–s5808, s17067 | S \ F (20301) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_completed_application/allOf/0/then:required:command_instance_ref` | s17063 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_completed_application/properties/required_slot_ids:uniqueItems` | s17107 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_completed_application/properties/required_slot_ids:maxItems` | s17108 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_completed_application/properties/waived_slot_ids:uniqueItems` | s17109 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_completed_application/properties/waived_slot_ids:maxItems` | s17110 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_completed_application/properties/output_refs:uniqueItems` | s17105 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_completed_application/properties/output_refs:maxItems` | s17106 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_completed_application/allOf/3/then:required:outcome_reason` | s17613 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_completed_application/properties/outcome_reason:enum` | s1940–s1942, s10832–s10837, s11202–s11207, s17614 | S \ F (20292) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_completed_application/allOf/2/then:required:waiver_actor_ref` | s17649 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_completed_application/allOf/2/then:required:waiver_currentness_hash` | s17650 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_message_added_application/properties/recipient_ids:uniqueItems` | s17576 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_message_added_application/properties/recipient_ids:maxItems` | s17577 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_message_added_application/properties/attachment_refs:uniqueItems` | s17540 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_message_added_application/properties/attachment_refs:maxItems` | s17541 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_configuration_changed_application/allOf/0/then/allOf/1/properties/accept_stale_target:const;Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_configuration_changed_application/properties/accept_stale_target:type` | s1159–s1161, s6192–s6196, s6399, s6401–s6404, s6606–s6610, s6808–s6812, s7010–s7014, s17112, s17194 | S \ F (20278) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_vote_added_application/properties/hard_constraint_conflict_ids:uniqueItems` | s19463 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_vote_added_application/properties/hard_constraint_conflict_ids:maxItems` | s19464 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_plan_synthesized_application/properties/tie_resolution:enum` | s2324–s2326, s13316–s13321, s17854 | S \ F (20298) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized_application/allOf/0/then/properties/requested_reviewer_count:const;Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized_application/properties/requested_reviewer_count:type` | s818–s820, s4145–s4150, s4428–s4433, s4711–s4716, s4995–s5000, s16787, s16864, s16866 | S \ F (20278) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized_application/allOf/0/then/properties/requested_reviewer_count:const;Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized_application/properties/requested_reviewer_count:minimum` | s16864–s16865 | S \ F (20306) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized_application/allOf/0/then/properties/requested_reviewer_count:const` | s16864 | S \ F (20307) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/checkpoint:required:schema_id` | s16997 | S \ F (20307) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/checkpoint/properties/schema_id:const` | s260, s314, s364, s451, s16998 | S \ F (20303) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/checkpoint:required:schema_version` | s16999 | S \ F (20307) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/checkpoint/properties/schema_version:const` | s261, s315, s365, s452, s17000 | S \ F (20303) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/checkpoint:required:publication_id` | s16992 | S \ F (20307) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/id:type` | s16984, s16993, s17662 | S \ F (20305) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/id:lexical` | s157, s162–s163, s258, s309, s312, s359, s362, s410, s413, s435, s438, s450, s664, s668–s670, s674, s16046, s16049–s16051, s16303, s16307, s16309–s16311, s16604, s16606–s16608, s16615, s16623, s16685–s16686, s16690–s16694, s16702, s16980–s16982, s16989–s16991, s20298–s20300, s20302–s20303, s20307 | S \ F (20255) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/checkpoint:required:storage_instance_id` | s17013 | S \ F (20307) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/checkpoint/properties/storage_instance_id:type` | s17014 | S \ F (20307) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/checkpoint/properties/storage_instance_id:lexical` | s267, s321, s369, s458, s17011–s17012 | S \ F (20302) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/checkpoint:required:scope_kind` | s16954, s17001 | S \ F (20306) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/checkpoint/properties/scope_kind:enum` | s262, s316, s366, s453, s16955, s17002 | S \ F (20302) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/checkpoint:required:scope_partition` | s17004 | S \ F (20307) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/checkpoint/properties/scope_partition:type` | s17005 | S \ F (20307) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/checkpoint/allOf/5/then/properties/scope_partition:lexical` | s317, s367, s454, s17003 | S \ F (20304) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/checkpoint:required:project_id` | s16983 | S \ F (20307) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/checkpoint:required:projector_id` | s16985 | S \ F (20307) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/checkpoint/properties/projector_id:const` | s256, s310, s360, s411, s16986 | S \ F (20303) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/checkpoint:required:projector_version` | s16987 | S \ F (20307) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/checkpoint/properties/projector_version:const` | s257, s311, s361, s412, s16988 | S \ F (20303) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/checkpoint:required:admitted_event_types` | s16960 | S \ F (20307) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/checkpoint/properties/admitted_event_types:type` | s16961 | S \ F (20307) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/checkpoint/properties/admitted_event_types:minItems` | s16959 | S \ F (20307) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/checkpoint/properties/admitted_event_types:maxItems;Plans/collaboration_projection_contracts.schema.json#/$defs/checkpoint/properties/admitted_event_types:uniqueItems` | s16958 | S \ F (20307) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/checkpoint/properties/admitted_event_types:maxItems;Plans/collaboration_projection_contracts.schema.json#/$defs/checkpoint/properties/admitted_event_types/items:enum` | s220–s237, s273–s290, s323–s340, s373–s391, s16962 | S \ F (20234) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/checkpoint:required:index_read_token` | s16974 | S \ F (20307) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/durable_read_token:type` | s16975 | S \ F (20307) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/checkpoint:required:first_retained_sequence_id` | s16966 | S \ F (20307) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/checkpoint/allOf/6/then/properties/first_retained_sequence_id:type` | s16968 | S \ F (20307) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/checkpoint/allOf/6/then/properties/first_retained_sequence_id:type;Plans/collaboration_projection_contracts.schema.json#/$defs/checkpoint/properties/first_retained_sequence_id:type` | s16968–s16969 | S \ F (20306) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/checkpoint/properties/first_retained_sequence_id:minimum` | s16967 | S \ F (20307) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/checkpoint:required:index_through_sequence_id` | s16976 | S \ F (20307) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/checkpoint/allOf/6/then/properties/index_through_sequence_id:type` | s16978 | S \ F (20307) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/checkpoint/allOf/6/then/properties/index_through_sequence_id:type;Plans/collaboration_projection_contracts.schema.json#/$defs/checkpoint/properties/index_through_sequence_id:type` | s16978–s16979 | S \ F (20306) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/checkpoint/properties/index_through_sequence_id:minimum` | s16977 | S \ F (20307) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/checkpoint:required:source_cursor` | s17006, s17022 | S \ F (20306) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/checkpoint/allOf/4/then/properties/first_retained_sequence_id:type;Plans/collaboration_projection_contracts.schema.json#/$defs/checkpoint/allOf/4/then/properties/index_through_sequence_id:type` | s272, s17007 | S \ F (20306) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/generic_source_cursor:anyOf` | s264–s265, s318–s319, s444–s445, s455–s456, s17008, s17023 | S \ F (20298) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/checkpoint:required:filter_complete` | s16964 | S \ F (20307) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/checkpoint/allOf/1/then/properties/filter_complete:const;Plans/collaboration_projection_contracts.schema.json#/$defs/checkpoint/properties/filter_complete:type` | s271, s16965 | S \ F (20306) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/checkpoint:required:state` | s17009 | S \ F (20307) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/checkpoint/properties/state:enum` | s266, s320, s368, s457, s17010 | S \ F (20303) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/checkpoint:required:health` | s16970 | S \ F (20307) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/checkpoint/allOf/1/then/properties/health:const;Plans/collaboration_projection_contracts.schema.json#/$defs/checkpoint/properties/health:enum` | s238, s291, s341, s392, s16971 | S \ F (20303) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/checkpoint:required:updated_at_utc` | s17016 | S \ F (20307) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/timestamp:type` | s460, s17017 | S \ F (20306) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/timestamp:lexical` | s259, s268, s313, s322, s363, s370, s414, s439, s448–s449, s459, s16698, s17015 | S \ F (20295) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/checkpoint:required:withdrawn_at_utc` | s17018 | S \ F (20307) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/checkpoint/allOf/1/then/properties/withdrawn_at_utc:type;Plans/collaboration_projection_contracts.schema.json#/$defs/checkpoint/properties/withdrawn_at_utc:anyOf` | s17019 | S \ F (20307) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/checkpoint:required:published_at_utc` | s16994 | S \ F (20307) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/checkpoint:required:hold_refs` | s16972 | S \ F (20307) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/checkpoint/properties/hold_refs:type` | s16973 | S \ F (20307) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/checkpoint:required:retired_generations` | s16995 | S \ F (20307) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/checkpoint/properties/retired_generations:type` | s16996 | S \ F (20307) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/checkpoint:additionalProperties` | s16963 | S \ F (20307) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/checkpoint/allOf/0/then/properties/scope_partition:const;Plans/collaboration_projection_contracts.schema.json#/$defs/checkpoint/properties/scope_partition:type` | s263, s269, s16956–s16957, s17005 | S \ F (20303) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/checkpoint/allOf/0/then/properties/scope_partition:const` | s263, s269, s16956 | S \ F (20305) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/checkpoint/allOf/0/then/properties/project_id:type` | s270, s16953 | S \ F (20306) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/checkpoint/properties/retired_generations:maxItems` | s372, s17024 | S \ F (20306) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/checkpoint/allOf/4/then/properties/first_retained_sequence_id:type;Plans/collaboration_projection_contracts.schema.json#/$defs/checkpoint/properties/first_retained_sequence_id:type` | s17020 | S \ F (20307) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/checkpoint/allOf/4/then/properties/index_through_sequence_id:type;Plans/collaboration_projection_contracts.schema.json#/$defs/checkpoint/properties/index_through_sequence_id:type` | s272, s17021 | S \ F (20306) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/run_projection:required:schema_id` | s18019 | S \ F (20307) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/run_projection/properties/schema_id:const` | s16695, s18020 | S \ F (20306) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/run_projection:required:schema_version` | s18021 | S \ F (20307) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/run_projection/properties/schema_version:const` | s16696, s18022 | S \ F (20306) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/run_projection:required:publication_id` | s18014 | S \ F (20307) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/run_projection:required:scope_partition` | s18024 | S \ F (20307) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/scope_partition:lexical` | s166, s673, s16054, s16314, s16611, s16697, s18023, s20306 | S \ F (20300) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/run_projection:required:collaboration_run_id` | s17995 | S \ F (20307) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/run_projection:required:collaboration_id` | s17994 | S \ F (20307) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/run_projection:required:kind` | s18001 | S \ F (20307) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/run_projection:required:thread_id` | s18033 | S \ F (20307) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/run_projection:required:definition_revision` | s17996 | S \ F (20307) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/run_projection/properties/definition_revision:type` | s17998 | S \ F (20307) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/run_projection/properties/definition_revision:minimum` | s17997 | S \ F (20307) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/run_projection:required:admission_source` | s17989 | S \ F (20307) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/run_projection:required:roster_slot_ids` | s18017 | S \ F (20307) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/run_projection/properties/roster_slot_ids:type` | s18018 | S \ F (20307) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/run_projection/properties/roster_slot_ids:minItems` | s18016 | S \ F (20307) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/run_projection/properties/roster_slot_ids:uniqueItems` | s18015 | S \ F (20307) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/run_projection:required:target_hashes` | s18029 | S \ F (20307) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/run_projection/properties/target_hashes:type` | s18030 | S \ F (20307) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/run_projection:required:lifecycle_status` | s18012 | S \ F (20307) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/run_projection/properties/lifecycle_status:enum` | s16689, s16704, s18013 | S \ F (20305) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/run_projection:required:lifecycle_seq` | s18009 | S \ F (20307) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/run_projection/properties/lifecycle_seq:type` | s18011 | S \ F (20307) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/run_projection/properties/lifecycle_seq:minimum` | s18010 | S \ F (20307) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/run_projection:required:terminal` | s18031 | S \ F (20307) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/run_projection/properties/terminal:anyOf` | s16698–s16701, s18032 | S \ F (20303) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/run_projection:required:last_message_sequence` | s18006 | S \ F (20307) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/run_projection/properties/last_message_sequence:type` | s18008 | S \ F (20307) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/run_projection/properties/last_message_sequence:minimum` | s18007 | S \ F (20307) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/run_projection:required:artifact_count` | s17990 | S \ F (20307) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/run_projection/properties/artifact_count:type` | s17992 | S \ F (20307) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/run_projection/properties/artifact_count:minimum` | s17991 | S \ F (20307) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/run_projection:required:finalized_artifact_version_ref` | s17999 | S \ F (20307) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/run_projection/properties/finalized_artifact_version_ref:anyOf` | s18000 | S \ F (20307) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/run_projection:required:synthesized_plan` | s18027 | S \ F (20307) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/run_projection/properties/synthesized_plan:anyOf` | s18028 | S \ F (20307) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/run_projection:required:waived_slot_ids` | s18034 | S \ F (20307) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/run_projection/properties/waived_slot_ids:type` | s18035 | S \ F (20307) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/run_projection:required:stale_target_accepted` | s18025 | S \ F (20307) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/run_projection/properties/stale_target_accepted:type` | s18026 | S \ F (20307) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/run_projection:required:last_applied_event_id` | s18004 | S \ F (20307) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/event_id:type` | s17490, s18005 | S \ F (20306) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/event_id:lexical` | s159, s665, s667, s16045, s16048, s16305–s16306, s16308, s16603, s16605, s16688, s16700, s18002–s18003, s20297 | S \ F (20293) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/run_projection:additionalProperties` | s16703, s17993 | S \ F (20306) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/participant_projection:required:schema_id` | s17667 | S \ F (20307) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/participant_projection/properties/schema_id:const` | s16312, s17668 | S \ F (20306) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/participant_projection:required:schema_version` | s17669 | S \ F (20307) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/participant_projection/properties/schema_version:const` | s16313, s17670 | S \ F (20306) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/participant_projection:required:publication_id` | s17664 | S \ F (20307) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/participant_projection:required:scope_partition` | s17671 | S \ F (20307) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/participant_projection:required:collaboration_run_id` | s17659 | S \ F (20307) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/participant_projection:required:participant_slot_id` | s17663 | S \ F (20307) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/participant_projection:required:additive_role_kind` | s17651 | S \ F (20307) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/participant_projection/properties/additive_role_kind:anyOf` | s16302, s16316, s17652 | S \ F (20305) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/participant_projection:required:required` | s17665 | S \ F (20307) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/participant_projection/properties/required:type` | s17666 | S \ F (20307) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/participant_projection:required:assignment_revision` | s17653 | S \ F (20307) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/participant_projection/properties/assignment_revision:type` | s17655 | S \ F (20307) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/participant_projection/properties/assignment_revision:minimum` | s17654 | S \ F (20307) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/participant_projection:required:attempts` | s17656 | S \ F (20307) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/participant_projection/properties/attempts:type` | s17657 | S \ F (20307) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/participant_projection:required:slot_outcome` | s17672 | S \ F (20307) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/participant_projection/properties/slot_outcome:anyOf` | s16315, s17673 | S \ F (20306) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/participant_projection:required:last_message_id` | s17661 | S \ F (20307) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/participant_projection/properties/last_message_id:anyOf` | s16309, s17662 | S \ F (20306) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/participant_projection:required:last_applied_event_id` | s17660 | S \ F (20307) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/participant_projection:additionalProperties` | s17658 | S \ F (20307) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/definition_projection:required:schema_id` | s17282 | S \ F (20307) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/definition_projection/properties/schema_id:const` | s671, s17283 | S \ F (20306) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/definition_projection:required:schema_version` | s17284 | S \ F (20307) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/definition_projection/properties/schema_version:const` | s672, s17285 | S \ F (20306) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/definition_projection:required:publication_id` | s17281 | S \ F (20307) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/definition_projection:required:scope_partition` | s17286 | S \ F (20307) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/definition_projection:required:collaboration_id` | s17274 | S \ F (20307) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/definition_projection:required:kind` | s17276 | S \ F (20307) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/definition_projection:required:thread_id` | s17287 | S \ F (20307) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/definition_projection:required:latest_definition_revision` | s17278 | S \ F (20307) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/definition_projection/properties/latest_definition_revision:type` | s17280 | S \ F (20307) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/definition_projection/properties/latest_definition_revision:minimum` | s17279 | S \ F (20307) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/definition_projection:required:created_event_id` | s17275 | S \ F (20307) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/definition_projection:required:last_applied_event_id` | s17277 | S \ F (20307) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/definition_projection:additionalProperties` | s17273 | S \ F (20307) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/artifact_projection:required:schema_id` | s16883 | S \ F (20307) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/artifact_projection/properties/schema_id:const` | s164, s16884 | S \ F (20306) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/artifact_projection:required:schema_version` | s16885 | S \ F (20307) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/artifact_projection/properties/schema_version:const` | s165, s16886 | S \ F (20306) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/artifact_projection:required:publication_id` | s16882 | S \ F (20307) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/artifact_projection:required:scope_partition` | s16887 | S \ F (20307) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/artifact_projection:required:collaboration_run_id` | s16879 | S \ F (20307) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/artifact_projection:required:artifact_ref` | s16875 | S \ F (20307) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/non_secret_ref:type` | s16876, s18000 | S \ F (20306) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/non_secret_ref:lexical` | s160–s161, s167, s16872–s16874 | S \ F (20302) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/artifact_projection:required:artifact_version_ref` | s16877 | S \ F (20307) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/artifact_projection:required:added_by_kind` | s16870 | S \ F (20307) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/artifact_projection:required:added_by_id` | s16869 | S \ F (20307) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/artifact_projection:required:added_event_id` | s16871 | S \ F (20307) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/artifact_projection:required:finalized` | s16880 | S \ F (20307) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/artifact_projection/properties/finalized:type` | s16881 | S \ F (20307) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/artifact_projection:additionalProperties` | s16878 | S \ F (20307) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/proposal_projection:required:schema_id` | s17931 | S \ F (20307) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/proposal_projection/properties/schema_id:const` | s16609, s17932 | S \ F (20306) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/proposal_projection:required:schema_version` | s17933 | S \ F (20307) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/proposal_projection/properties/schema_version:const` | s16610, s17934 | S \ F (20306) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/proposal_projection:required:publication_id` | s17930 | S \ F (20307) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/proposal_projection:required:scope_partition` | s17935 | S \ F (20307) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/proposal_projection:required:collaboration_run_id` | s17920 | S \ F (20307) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/proposal_projection:required:proposal_id` | s17926 | S \ F (20307) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/proposal_projection:required:participant_slot_id` | s17925 | S \ F (20307) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/proposal_projection:required:proposal_round` | s17927 | S \ F (20307) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/proposal_projection/properties/proposal_round:type` | s17929 | S \ F (20307) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/proposal_projection/properties/proposal_round:minimum` | s17928 | S \ F (20307) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/proposal_projection:required:blind_round` | s17917 | S \ F (20307) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/proposal_projection/properties/blind_round:type` | s17918 | S \ F (20307) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/proposal_projection:required:support_count` | s17936 | S \ F (20307) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/proposal_projection/properties/support_count:type` | s17938 | S \ F (20307) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/proposal_projection/properties/support_count:minimum` | s17937 | S \ F (20307) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/proposal_projection:required:oppose_count` | s17922 | S \ F (20307) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/proposal_projection/properties/oppose_count:type` | s17924 | S \ F (20307) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/proposal_projection/properties/oppose_count:minimum` | s17923 | S \ F (20307) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/proposal_projection:required:abstain_count` | s17913 | S \ F (20307) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/proposal_projection/properties/abstain_count:type` | s17915 | S \ F (20307) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/proposal_projection/properties/abstain_count:minimum` | s17914 | S \ F (20307) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/proposal_projection:required:added_event_id` | s17916 | S \ F (20307) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/proposal_projection:required:last_applied_event_id` | s17921 | S \ F (20307) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/proposal_projection:additionalProperties` | s16612, s17919 | S \ F (20306) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/vote_projection:required:schema_id` | s19505 | S \ F (20307) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/vote_projection/properties/schema_id:const` | s19506, s20304 | S \ F (20306) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/vote_projection:required:schema_version` | s19507 | S \ F (20307) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/vote_projection/properties/schema_version:const` | s19508, s20305 | S \ F (20306) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/vote_projection:required:publication_id` | s19504 | S \ F (20307) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/vote_projection:required:scope_partition` | s19509 | S \ F (20307) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/vote_projection:required:collaboration_run_id` | s19498 | S \ F (20307) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/vote_projection:required:vote_id` | s19510 | S \ F (20307) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/vote_projection:required:proposal_id` | s19503 | S \ F (20307) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/vote_projection:required:participant_slot_id` | s19501 | S \ F (20307) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/vote_projection:required:attempt_id` | s19496 | S \ F (20307) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/vote_projection:required:position` | s19502 | S \ F (20307) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/vote_projection:required:counted` | s19499 | S \ F (20307) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/vote_projection/properties/counted:type` | s19500 | S \ F (20307) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/vote_projection:required:added_event_id` | s19495 | S \ F (20307) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/vote_projection:additionalProperties` | s19497, s20308 | S \ F (20306) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/finding_projection:required:schema_id` | s17497 | S \ F (20307) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/finding_projection/properties/schema_id:const` | s16052, s17498 | S \ F (20306) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/finding_projection:required:schema_version` | s17499 | S \ F (20307) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/finding_projection/properties/schema_version:const` | s16053, s17500 | S \ F (20306) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/finding_projection:required:publication_id` | s17496 | S \ F (20307) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/finding_projection:required:scope_partition` | s17501 | S \ F (20307) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/finding_projection:required:collaboration_run_id` | s17484 | S \ F (20307) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/finding_projection:required:finding_id` | s17494 | S \ F (20307) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/finding_projection:required:finding_key` | s17495 | S \ F (20307) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/finding_projection:required:severity` | s17502 | S \ F (20307) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/finding_projection:required:target_hashes` | s17504 | S \ F (20307) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/finding_projection/properties/target_hashes:type` | s17505 | S \ F (20307) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/finding_projection/properties/target_hashes:minItems` | s17503 | S \ F (20307) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/finding_projection:required:disposition` | s17487 | S \ F (20307) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/finding_projection/properties/disposition:anyOf` | s16047, s17488 | S \ F (20306) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/finding_projection:required:confidence` | s17485 | S \ F (20307) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/finding_projection/properties/confidence:type` | s17486 | S \ F (20307) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/finding_projection:required:dissent_count` | s17491 | S \ F (20307) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/finding_projection/properties/dissent_count:type` | s17493 | S \ F (20307) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/finding_projection/properties/dissent_count:minimum` | s17492 | S \ F (20307) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/finding_projection:required:added_event_id` | s17482 | S \ F (20307) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/finding_projection:required:dispositioned_event_id` | s17489 | S \ F (20307) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/finding_projection/properties/dispositioned_event_id:anyOf` | s16048, s17490 | S \ F (20306) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/finding_projection:additionalProperties` | s16057, s17483 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_created_project:required:schema_id` | s18595 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_created_project/properties/schema_id:const` | s18596 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_created_project:required:schema_version` | s18597 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_created_project/properties/schema_version:const` | s18598 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_created_project:required:storage_instance_id` | s18610 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_created_project/properties/storage_instance_id:type` | s18611 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_created_project/properties/storage_instance_id:lexical` | s18608–s18609 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_created_project:required:recovery_epoch` | s18592 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_created_project/properties/recovery_epoch:type` | s18594 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_created_project/properties/recovery_epoch:minimum` | s18593 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_created_project:required:scope_partition` | s18600 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_created_project/properties/scope_partition:type` | s18601 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_created_project/properties/scope_partition:lexical` | s18599 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_created_project:required:event_type` | s18582 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_created_project/properties/event_type:const` | s18583 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_created_project:required:owner_record_ref` | s18590 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_created_project:required:owner_record` | s18588 | S \ F (20307) |
| `schema:Plans/collaborative_workflows_contracts.schema.json#/$defs/CollaborativeDefinition:type` | s18589 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_created_project:required:owner_record_sha256` | s18591 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_created_project:required:slot_requirements` | s18606 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_created_project/properties/slot_requirements:type` | s18607 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_created_project/properties/slot_requirements:uniqueItems` | s18605 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_created_project:required:semantic_body` | s18602 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_created:type` | s18603 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_created_project:required:semantic_sha256` | s18604 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_created_project:required:owner_operation_id` | s18586 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_created_project/properties/owner_operation_id:type` | s18587 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_created_project/properties/owner_operation_id:lexical` | s18584–s18585 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_created_project:required:event_id` | s18580 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_created_project/properties/event_id:type` | s18581 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_created_project/properties/event_id:lexical` | s18578–s18579 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_created_project:additionalProperties` | s18575 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_created_application:required:schema_id` | s18558 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_created_application/properties/schema_id:const` | s18559 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_created_application:required:schema_version` | s18560 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_created_application/properties/schema_version:const` | s18561 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_created_application:required:storage_instance_id` | s18573 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_created_application/properties/storage_instance_id:type` | s18574 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_created_application/properties/storage_instance_id:lexical` | s18571–s18572 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_created_application:required:recovery_epoch` | s18555 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_created_application/properties/recovery_epoch:type` | s18557 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_created_application/properties/recovery_epoch:minimum` | s18556 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_created_application:required:scope_partition` | s18563 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_created_application/properties/scope_partition:type` | s18564 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_created_application/properties/scope_partition:lexical` | s18562 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_created_application:required:event_type` | s18545 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_created_application/properties/event_type:const` | s18546 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_created_application:required:owner_record_ref` | s18553 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_created_application:required:owner_record` | s18551 | S \ F (20307) |
| `schema:Plans/application_workflow_contracts.schema.json#/$defs/CollaborationDefinitionApplicationV1:type` | s18552 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_created_application:required:owner_record_sha256` | s18554 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_created_application:required:slot_requirements` | s18569 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_created_application/properties/slot_requirements:type` | s18570 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_created_application/properties/slot_requirements:uniqueItems` | s18568 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_created_application:required:semantic_body` | s18565 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_created_application:type` | s18566 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_created_application:required:semantic_sha256` | s18567 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_created_application:required:owner_operation_id` | s18549 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_created_application/properties/owner_operation_id:type` | s18550 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_created_application/properties/owner_operation_id:lexical` | s18547–s18548 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_created_application:required:event_id` | s18543 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_created_application/properties/event_id:type` | s18544 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_created_application/properties/event_id:lexical` | s18541–s18542 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_created_application:additionalProperties` | s18538 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_started_project:required:schema_id` | s19094 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_started_project/properties/schema_id:const` | s19095 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_started_project:required:schema_version` | s19096 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_started_project/properties/schema_version:const` | s19097 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_started_project:required:storage_instance_id` | s19109 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_started_project/properties/storage_instance_id:type` | s19110 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_started_project/properties/storage_instance_id:lexical` | s19107–s19108 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_started_project:required:recovery_epoch` | s19091 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_started_project/properties/recovery_epoch:type` | s19093 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_started_project/properties/recovery_epoch:minimum` | s19092 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_started_project:required:scope_partition` | s19099 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_started_project/properties/scope_partition:type` | s19100 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_started_project/properties/scope_partition:lexical` | s19098 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_started_project:required:event_type` | s19081 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_started_project/properties/event_type:const` | s19082 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_started_project:required:owner_record_ref` | s19089 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_started_project:required:owner_record` | s19087 | S \ F (20307) |
| `schema:Plans/collaborative_workflows_contracts.schema.json#/$defs/CollaborativeRun:type` | s19088 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_started_project:required:owner_record_sha256` | s19090 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_started_project:required:slot_requirements` | s19105 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_started_project/properties/slot_requirements:type` | s19106 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_started_project/properties/slot_requirements:uniqueItems` | s19104 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_started_project:required:semantic_body` | s19101 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_started:type` | s19102 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_started_project:required:semantic_sha256` | s19103 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_started_project:required:owner_operation_id` | s19085 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_started_project/properties/owner_operation_id:type` | s19086 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_started_project/properties/owner_operation_id:lexical` | s19083–s19084 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_started_project:required:event_id` | s19079 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_started_project/properties/event_id:type` | s19080 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_started_project/properties/event_id:lexical` | s19077–s19078 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_started_project:additionalProperties` | s19074 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_started_application:required:schema_id` | s19057 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_started_application/properties/schema_id:const` | s19058 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_started_application:required:schema_version` | s19059 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_started_application/properties/schema_version:const` | s19060 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_started_application:required:storage_instance_id` | s19072 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_started_application/properties/storage_instance_id:type` | s19073 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_started_application/properties/storage_instance_id:lexical` | s19070–s19071 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_started_application:required:recovery_epoch` | s19054 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_started_application/properties/recovery_epoch:type` | s19056 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_started_application/properties/recovery_epoch:minimum` | s19055 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_started_application:required:scope_partition` | s19062 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_started_application/properties/scope_partition:type` | s19063 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_started_application/properties/scope_partition:lexical` | s19061 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_started_application:required:event_type` | s19044 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_started_application/properties/event_type:const` | s19045 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_started_application:required:owner_record_ref` | s19052 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_started_application:required:owner_record` | s19050 | S \ F (20307) |
| `schema:Plans/application_workflow_contracts.schema.json#/$defs/CollaborationRunApplicationV1:type` | s19051 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_started_application:required:owner_record_sha256` | s19053 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_started_application:required:slot_requirements` | s19068 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_started_application/properties/slot_requirements:type` | s19069 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_started_application/properties/slot_requirements:uniqueItems` | s19067 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_started_application:required:semantic_body` | s19064 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_started_application:type` | s19065 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_started_application:required:semantic_sha256` | s19066 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_started_application:required:owner_operation_id` | s19048 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_started_application/properties/owner_operation_id:type` | s19049 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_started_application/properties/owner_operation_id:lexical` | s19046–s19047 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_started_application:required:event_id` | s19042 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_started_application/properties/event_id:type` | s19043 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_started_application/properties/event_id:lexical` | s19040–s19041 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_started_application:additionalProperties` | s19037 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_paused_project:required:schema_id` | s18951 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_paused_project/properties/schema_id:const` | s18952 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_paused_project:required:schema_version` | s18953 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_paused_project/properties/schema_version:const` | s18954 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_paused_project:required:storage_instance_id` | s18965 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_paused_project/properties/storage_instance_id:type` | s18966 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_paused_project/properties/storage_instance_id:lexical` | s18963–s18964 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_paused_project:required:recovery_epoch` | s18948 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_paused_project/properties/recovery_epoch:type` | s18950 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_paused_project/properties/recovery_epoch:minimum` | s18949 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_paused_project:required:scope_partition` | s18956 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_paused_project/properties/scope_partition:type` | s18957 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_paused_project/properties/scope_partition:lexical` | s18955 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_paused_project:required:event_type` | s18939 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_paused_project/properties/event_type:const` | s18940 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_paused_project:required:owner_record_ref` | s18946 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_paused_project:required:owner_record` | s18945 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_paused_project:required:owner_record_sha256` | s18947 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_paused_project:required:slot_requirements` | s18961 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_paused_project/properties/slot_requirements:type` | s18962 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_paused_project:required:semantic_body` | s18958 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_paused:type` | s18959 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_paused_project:required:semantic_sha256` | s18960 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_paused_project:required:owner_operation_id` | s18943 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_paused_project/properties/owner_operation_id:type` | s18944 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_paused_project/properties/owner_operation_id:lexical` | s18941–s18942 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_paused_project:required:event_id` | s18937 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_paused_project/properties/event_id:type` | s18938 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_paused_project/properties/event_id:lexical` | s18935–s18936 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_paused_project:additionalProperties` | s18932 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_paused_application:required:schema_id` | s18916 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_paused_application/properties/schema_id:const` | s18917 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_paused_application:required:schema_version` | s18918 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_paused_application/properties/schema_version:const` | s18919 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_paused_application:required:storage_instance_id` | s18930 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_paused_application/properties/storage_instance_id:type` | s18931 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_paused_application/properties/storage_instance_id:lexical` | s18928–s18929 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_paused_application:required:recovery_epoch` | s18913 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_paused_application/properties/recovery_epoch:type` | s18915 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_paused_application/properties/recovery_epoch:minimum` | s18914 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_paused_application:required:scope_partition` | s18921 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_paused_application/properties/scope_partition:type` | s18922 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_paused_application/properties/scope_partition:lexical` | s18920 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_paused_application:required:event_type` | s18904 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_paused_application/properties/event_type:const` | s18905 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_paused_application:required:owner_record_ref` | s18911 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_paused_application:required:owner_record` | s18910 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_paused_application:required:owner_record_sha256` | s18912 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_paused_application:required:slot_requirements` | s18926 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_paused_application/properties/slot_requirements:type` | s18927 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_paused_application:required:semantic_body` | s18923 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_paused_application:type` | s18924 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_paused_application:required:semantic_sha256` | s18925 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_paused_application:required:owner_operation_id` | s18908 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_paused_application/properties/owner_operation_id:type` | s18909 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_paused_application/properties/owner_operation_id:lexical` | s18906–s18907 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_paused_application:required:event_id` | s18902 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_paused_application/properties/event_id:type` | s18903 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_paused_application/properties/event_id:lexical` | s18900–s18901 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_paused_application:additionalProperties` | s18897 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_resumed_project:required:schema_id` | s19021 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_resumed_project/properties/schema_id:const` | s19022 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_resumed_project:required:schema_version` | s19023 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_resumed_project/properties/schema_version:const` | s19024 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_resumed_project:required:storage_instance_id` | s19035 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_resumed_project/properties/storage_instance_id:type` | s19036 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_resumed_project/properties/storage_instance_id:lexical` | s19033–s19034 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_resumed_project:required:recovery_epoch` | s19018 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_resumed_project/properties/recovery_epoch:type` | s19020 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_resumed_project/properties/recovery_epoch:minimum` | s19019 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_resumed_project:required:scope_partition` | s19026 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_resumed_project/properties/scope_partition:type` | s19027 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_resumed_project/properties/scope_partition:lexical` | s19025 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_resumed_project:required:event_type` | s19009 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_resumed_project/properties/event_type:const` | s19010 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_resumed_project:required:owner_record_ref` | s19016 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_resumed_project:required:owner_record` | s19015 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_resumed_project:required:owner_record_sha256` | s19017 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_resumed_project:required:slot_requirements` | s19031 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_resumed_project/properties/slot_requirements:type` | s19032 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_resumed_project:required:semantic_body` | s19028 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_resumed:type` | s19029 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_resumed_project:required:semantic_sha256` | s19030 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_resumed_project:required:owner_operation_id` | s19013 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_resumed_project/properties/owner_operation_id:type` | s19014 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_resumed_project/properties/owner_operation_id:lexical` | s19011–s19012 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_resumed_project:required:event_id` | s19007 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_resumed_project/properties/event_id:type` | s19008 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_resumed_project/properties/event_id:lexical` | s19005–s19006 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_resumed_project:additionalProperties` | s19002 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_resumed_application:required:schema_id` | s18986 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_resumed_application/properties/schema_id:const` | s18987 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_resumed_application:required:schema_version` | s18988 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_resumed_application/properties/schema_version:const` | s18989 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_resumed_application:required:storage_instance_id` | s19000 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_resumed_application/properties/storage_instance_id:type` | s19001 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_resumed_application/properties/storage_instance_id:lexical` | s18998–s18999 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_resumed_application:required:recovery_epoch` | s18983 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_resumed_application/properties/recovery_epoch:type` | s18985 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_resumed_application/properties/recovery_epoch:minimum` | s18984 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_resumed_application:required:scope_partition` | s18991 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_resumed_application/properties/scope_partition:type` | s18992 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_resumed_application/properties/scope_partition:lexical` | s18990 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_resumed_application:required:event_type` | s18974 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_resumed_application/properties/event_type:const` | s18975 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_resumed_application:required:owner_record_ref` | s18981 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_resumed_application:required:owner_record` | s18980 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_resumed_application:required:owner_record_sha256` | s18982 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_resumed_application:required:slot_requirements` | s18996 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_resumed_application/properties/slot_requirements:type` | s18997 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_resumed_application:required:semantic_body` | s18993 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_resumed_application:type` | s18994 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_resumed_application:required:semantic_sha256` | s18995 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_resumed_application:required:owner_operation_id` | s18978 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_resumed_application/properties/owner_operation_id:type` | s18979 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_resumed_application/properties/owner_operation_id:lexical` | s18976–s18977 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_resumed_application:required:event_id` | s18972 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_resumed_application/properties/event_id:type` | s18973 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_resumed_application/properties/event_id:lexical` | s18970–s18971 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_resumed_application:additionalProperties` | s18967 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_cancelled_project:required:schema_id` | s18380 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_cancelled_project/properties/schema_id:const` | s18381 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_cancelled_project:required:schema_version` | s18382 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_cancelled_project/properties/schema_version:const` | s18383 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_cancelled_project:required:storage_instance_id` | s18394 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_cancelled_project/properties/storage_instance_id:type` | s18395 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_cancelled_project/properties/storage_instance_id:lexical` | s18392–s18393 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_cancelled_project:required:recovery_epoch` | s18377 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_cancelled_project/properties/recovery_epoch:type` | s18379 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_cancelled_project/properties/recovery_epoch:minimum` | s18378 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_cancelled_project:required:scope_partition` | s18385 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_cancelled_project/properties/scope_partition:type` | s18386 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_cancelled_project/properties/scope_partition:lexical` | s18384 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_cancelled_project:required:event_type` | s18368 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_cancelled_project/properties/event_type:const` | s18369 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_cancelled_project:required:owner_record_ref` | s18375 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_cancelled_project:required:owner_record` | s18374 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_cancelled_project:required:owner_record_sha256` | s18376 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_cancelled_project:required:slot_requirements` | s18390 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_cancelled_project/properties/slot_requirements:type` | s18391 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_cancelled_project:required:semantic_body` | s18387 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_cancelled:type` | s18388 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_cancelled_project:required:semantic_sha256` | s18389 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_cancelled_project:required:owner_operation_id` | s18372 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_cancelled_project/properties/owner_operation_id:type` | s18373 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_cancelled_project/properties/owner_operation_id:lexical` | s18370–s18371 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_cancelled_project:required:event_id` | s18366 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_cancelled_project/properties/event_id:type` | s18367 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_cancelled_project/properties/event_id:lexical` | s18364–s18365 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_cancelled_project:additionalProperties` | s18361 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_cancelled_application:required:schema_id` | s18345 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_cancelled_application/properties/schema_id:const` | s18346 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_cancelled_application:required:schema_version` | s18347 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_cancelled_application/properties/schema_version:const` | s18348 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_cancelled_application:required:storage_instance_id` | s18359 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_cancelled_application/properties/storage_instance_id:type` | s18360 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_cancelled_application/properties/storage_instance_id:lexical` | s18357–s18358 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_cancelled_application:required:recovery_epoch` | s18342 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_cancelled_application/properties/recovery_epoch:type` | s18344 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_cancelled_application/properties/recovery_epoch:minimum` | s18343 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_cancelled_application:required:scope_partition` | s18350 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_cancelled_application/properties/scope_partition:type` | s18351 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_cancelled_application/properties/scope_partition:lexical` | s18349 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_cancelled_application:required:event_type` | s18333 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_cancelled_application/properties/event_type:const` | s18334 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_cancelled_application:required:owner_record_ref` | s18340 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_cancelled_application:required:owner_record` | s18339 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_cancelled_application:required:owner_record_sha256` | s18341 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_cancelled_application:required:slot_requirements` | s18355 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_cancelled_application/properties/slot_requirements:type` | s18356 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_cancelled_application:required:semantic_body` | s18352 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_cancelled_application:type` | s18353 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_cancelled_application:required:semantic_sha256` | s18354 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_cancelled_application:required:owner_operation_id` | s18337 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_cancelled_application/properties/owner_operation_id:type` | s18338 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_cancelled_application/properties/owner_operation_id:lexical` | s18335–s18336 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_cancelled_application:required:event_id` | s18331 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_cancelled_application/properties/event_id:type` | s18332 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_cancelled_application/properties/event_id:lexical` | s18329–s18330 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_cancelled_application:additionalProperties` | s18326 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_completed_project:required:schema_id` | s18450 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_completed_project/properties/schema_id:const` | s18451 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_completed_project:required:schema_version` | s18452 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_completed_project/properties/schema_version:const` | s18453 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_completed_project:required:storage_instance_id` | s18464 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_completed_project/properties/storage_instance_id:type` | s18465 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_completed_project/properties/storage_instance_id:lexical` | s18462–s18463 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_completed_project:required:recovery_epoch` | s18447 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_completed_project/properties/recovery_epoch:type` | s18449 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_completed_project/properties/recovery_epoch:minimum` | s18448 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_completed_project:required:scope_partition` | s18455 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_completed_project/properties/scope_partition:type` | s18456 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_completed_project/properties/scope_partition:lexical` | s18454 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_completed_project:required:event_type` | s18438 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_completed_project/properties/event_type:const` | s18439 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_completed_project:required:owner_record_ref` | s18445 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_completed_project:required:owner_record` | s18444 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_completed_project:required:owner_record_sha256` | s18446 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_completed_project:required:slot_requirements` | s18460 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_completed_project/properties/slot_requirements:type` | s18461 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_completed_project:required:semantic_body` | s18457 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_completed:type` | s18458 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_completed_project:required:semantic_sha256` | s18459 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_completed_project:required:owner_operation_id` | s18442 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_completed_project/properties/owner_operation_id:type` | s18443 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_completed_project/properties/owner_operation_id:lexical` | s18440–s18441 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_completed_project:required:event_id` | s18436 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_completed_project/properties/event_id:type` | s18437 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_completed_project/properties/event_id:lexical` | s18434–s18435 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_completed_project:additionalProperties` | s18431 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_completed_application:required:schema_id` | s18415 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_completed_application/properties/schema_id:const` | s18416 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_completed_application:required:schema_version` | s18417 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_completed_application/properties/schema_version:const` | s18418 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_completed_application:required:storage_instance_id` | s18429 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_completed_application/properties/storage_instance_id:type` | s18430 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_completed_application/properties/storage_instance_id:lexical` | s18427–s18428 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_completed_application:required:recovery_epoch` | s18412 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_completed_application/properties/recovery_epoch:type` | s18414 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_completed_application/properties/recovery_epoch:minimum` | s18413 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_completed_application:required:scope_partition` | s18420 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_completed_application/properties/scope_partition:type` | s18421 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_completed_application/properties/scope_partition:lexical` | s18419 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_completed_application:required:event_type` | s18403 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_completed_application/properties/event_type:const` | s18404 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_completed_application:required:owner_record_ref` | s18410 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_completed_application:required:owner_record` | s18409 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_completed_application:required:owner_record_sha256` | s18411 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_completed_application:required:slot_requirements` | s18425 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_completed_application/properties/slot_requirements:type` | s18426 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_completed_application:required:semantic_body` | s18422 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_completed_application:type` | s18423 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_completed_application:required:semantic_sha256` | s18424 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_completed_application:required:owner_operation_id` | s18407 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_completed_application/properties/owner_operation_id:type` | s18408 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_completed_application/properties/owner_operation_id:lexical` | s18405–s18406 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_completed_application:required:event_id` | s18401 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_completed_application/properties/event_id:type` | s18402 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_completed_application/properties/event_id:lexical` | s18399–s18400 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_completed_application:additionalProperties` | s18396 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_failed_project:required:schema_id` | s18666 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_failed_project/properties/schema_id:const` | s18667 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_failed_project:required:schema_version` | s18668 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_failed_project/properties/schema_version:const` | s18669 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_failed_project:required:storage_instance_id` | s18680 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_failed_project/properties/storage_instance_id:type` | s18681 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_failed_project/properties/storage_instance_id:lexical` | s18678–s18679 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_failed_project:required:recovery_epoch` | s18663 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_failed_project/properties/recovery_epoch:type` | s18665 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_failed_project/properties/recovery_epoch:minimum` | s18664 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_failed_project:required:scope_partition` | s18671 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_failed_project/properties/scope_partition:type` | s18672 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_failed_project/properties/scope_partition:lexical` | s18670 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_failed_project:required:event_type` | s18654 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_failed_project/properties/event_type:const` | s18655 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_failed_project:required:owner_record_ref` | s18661 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_failed_project:required:owner_record` | s18660 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_failed_project:required:owner_record_sha256` | s18662 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_failed_project:required:slot_requirements` | s18676 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_failed_project/properties/slot_requirements:type` | s18677 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_failed_project:required:semantic_body` | s18673 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_failed:type` | s18674 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_failed_project:required:semantic_sha256` | s18675 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_failed_project:required:owner_operation_id` | s18658 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_failed_project/properties/owner_operation_id:type` | s18659 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_failed_project/properties/owner_operation_id:lexical` | s18656–s18657 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_failed_project:required:event_id` | s18652 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_failed_project/properties/event_id:type` | s18653 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_failed_project/properties/event_id:lexical` | s18650–s18651 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_failed_project:additionalProperties` | s18647 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_failed_application:required:schema_id` | s18631 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_failed_application/properties/schema_id:const` | s18632 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_failed_application:required:schema_version` | s18633 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_failed_application/properties/schema_version:const` | s18634 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_failed_application:required:storage_instance_id` | s18645 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_failed_application/properties/storage_instance_id:type` | s18646 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_failed_application/properties/storage_instance_id:lexical` | s18643–s18644 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_failed_application:required:recovery_epoch` | s18628 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_failed_application/properties/recovery_epoch:type` | s18630 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_failed_application/properties/recovery_epoch:minimum` | s18629 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_failed_application:required:scope_partition` | s18636 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_failed_application/properties/scope_partition:type` | s18637 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_failed_application/properties/scope_partition:lexical` | s18635 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_failed_application:required:event_type` | s18619 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_failed_application/properties/event_type:const` | s18620 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_failed_application:required:owner_record_ref` | s18626 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_failed_application:required:owner_record` | s18625 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_failed_application:required:owner_record_sha256` | s18627 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_failed_application:required:slot_requirements` | s18641 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_failed_application/properties/slot_requirements:type` | s18642 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_failed_application:required:semantic_body` | s18638 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_failed_application:type` | s18639 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_failed_application:required:semantic_sha256` | s18640 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_failed_application:required:owner_operation_id` | s18623 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_failed_application/properties/owner_operation_id:type` | s18624 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_failed_application/properties/owner_operation_id:lexical` | s18621–s18622 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_failed_application:required:event_id` | s18617 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_failed_application/properties/event_id:type` | s18618 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_failed_application/properties/event_id:lexical` | s18615–s18616 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_failed_application:additionalProperties` | s18612 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_started_project:required:schema_id` | s18881 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_started_project/properties/schema_id:const` | s18882 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_started_project:required:schema_version` | s18883 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_started_project/properties/schema_version:const` | s18884 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_started_project:required:storage_instance_id` | s18895 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_started_project/properties/storage_instance_id:type` | s18896 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_started_project/properties/storage_instance_id:lexical` | s18893–s18894 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_started_project:required:recovery_epoch` | s18878 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_started_project/properties/recovery_epoch:type` | s18880 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_started_project/properties/recovery_epoch:minimum` | s18879 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_started_project:required:scope_partition` | s18886 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_started_project/properties/scope_partition:type` | s18887 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_started_project/properties/scope_partition:lexical` | s18885 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_started_project:required:event_type` | s18868 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_started_project/properties/event_type:const` | s18869 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_started_project:required:owner_record_ref` | s18876 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_started_project:required:owner_record` | s18874 | S \ F (20307) |
| `schema:Plans/collaborative_workflows_contracts.schema.json#/$defs/ParticipantSpec:type` | s18875 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_started_project:required:owner_record_sha256` | s18877 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_started_project:required:slot_requirements` | s18891 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_started_project/properties/slot_requirements:type` | s18892 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_started_project:required:semantic_body` | s18888 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_started:type` | s18889 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_started_project:required:semantic_sha256` | s18890 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_started_project:required:owner_operation_id` | s18872 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_started_project/properties/owner_operation_id:type` | s18873 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_started_project/properties/owner_operation_id:lexical` | s18870–s18871 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_started_project:required:event_id` | s18866 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_started_project/properties/event_id:type` | s18867 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_started_project/properties/event_id:lexical` | s18864–s18865 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_started_project:additionalProperties` | s18861 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_started_application:required:schema_id` | s18845 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_started_application/properties/schema_id:const` | s18846 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_started_application:required:schema_version` | s18847 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_started_application/properties/schema_version:const` | s18848 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_started_application:required:storage_instance_id` | s18859 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_started_application/properties/storage_instance_id:type` | s18860 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_started_application/properties/storage_instance_id:lexical` | s18857–s18858 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_started_application:required:recovery_epoch` | s18842 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_started_application/properties/recovery_epoch:type` | s18844 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_started_application/properties/recovery_epoch:minimum` | s18843 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_started_application:required:scope_partition` | s18850 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_started_application/properties/scope_partition:type` | s18851 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_started_application/properties/scope_partition:lexical` | s18849 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_started_application:required:event_type` | s18832 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_started_application/properties/event_type:const` | s18833 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_started_application:required:owner_record_ref` | s18840 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_started_application:required:owner_record` | s18838 | S \ F (20307) |
| `schema:Plans/application_workflow_contracts.schema.json#/$defs/CollaborationParticipantApplicationV1:type` | s18839 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_started_application:required:owner_record_sha256` | s18841 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_started_application:required:slot_requirements` | s18855 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_started_application/properties/slot_requirements:type` | s18856 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_started_application:required:semantic_body` | s18852 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_started_application:type` | s18853 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_started_application:required:semantic_sha256` | s18854 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_started_application:required:owner_operation_id` | s18836 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_started_application/properties/owner_operation_id:type` | s18837 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_started_application/properties/owner_operation_id:lexical` | s18834–s18835 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_started_application:required:event_id` | s18830 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_started_application/properties/event_id:type` | s18831 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_started_application/properties/event_id:lexical` | s18828–s18829 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_started_application:additionalProperties` | s18825 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_completed_project:required:schema_id` | s18809 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_completed_project/properties/schema_id:const` | s18810 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_completed_project:required:schema_version` | s18811 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_completed_project/properties/schema_version:const` | s18812 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_completed_project:required:storage_instance_id` | s18823 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_completed_project/properties/storage_instance_id:type` | s18824 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_completed_project/properties/storage_instance_id:lexical` | s18821–s18822 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_completed_project:required:recovery_epoch` | s18806 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_completed_project/properties/recovery_epoch:type` | s18808 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_completed_project/properties/recovery_epoch:minimum` | s18807 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_completed_project:required:scope_partition` | s18814 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_completed_project/properties/scope_partition:type` | s18815 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_completed_project/properties/scope_partition:lexical` | s18813 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_completed_project:required:event_type` | s18796 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_completed_project/properties/event_type:const` | s18797 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_completed_project:required:owner_record_ref` | s18804 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_completed_project:required:owner_record` | s18802 | S \ F (20307) |
| `schema:Plans/collaborative_workflows_contracts.schema.json#/$defs/ParticipantDisposition:type` | s18803 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_completed_project:required:owner_record_sha256` | s18805 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_completed_project:required:slot_requirements` | s18819 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_completed_project/properties/slot_requirements:type` | s18820 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_completed_project:required:semantic_body` | s18816 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_completed:type;Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_completed/allOf/0/then:not` | s16277, s18817 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_completed_project:required:semantic_sha256` | s18818 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_completed_project:required:owner_operation_id` | s18800 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_completed_project/properties/owner_operation_id:type` | s18801 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_completed_project/properties/owner_operation_id:lexical` | s18798–s18799 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_completed_project:required:event_id` | s18794 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_completed_project/properties/event_id:type` | s18795 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_completed_project/properties/event_id:lexical` | s18792–s18793 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_completed_project:additionalProperties` | s18789 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_completed_application:required:schema_id` | s18773 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_completed_application/properties/schema_id:const` | s18774 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_completed_application:required:schema_version` | s18775 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_completed_application/properties/schema_version:const` | s18776 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_completed_application:required:storage_instance_id` | s18787 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_completed_application/properties/storage_instance_id:type` | s18788 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_completed_application/properties/storage_instance_id:lexical` | s18785–s18786 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_completed_application:required:recovery_epoch` | s18770 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_completed_application/properties/recovery_epoch:type` | s18772 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_completed_application/properties/recovery_epoch:minimum` | s18771 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_completed_application:required:scope_partition` | s18778 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_completed_application/properties/scope_partition:type` | s18779 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_completed_application/properties/scope_partition:lexical` | s18777 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_completed_application:required:event_type` | s18761 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_completed_application/properties/event_type:const` | s18762 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_completed_application:required:owner_record_ref` | s18768 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_completed_application:required:owner_record` | s18767 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_completed_application:required:owner_record_sha256` | s18769 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_completed_application:required:slot_requirements` | s18783 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_completed_application/properties/slot_requirements:type` | s18784 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_completed_application:required:semantic_body` | s18780 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_completed_application:type;Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_participant_completed_application/allOf/0/then:not` | s18781 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_completed_application:required:semantic_sha256` | s18782 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_completed_application:required:owner_operation_id` | s18765 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_completed_application/properties/owner_operation_id:type` | s18766 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_completed_application/properties/owner_operation_id:lexical` | s18763–s18764 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_completed_application:required:event_id` | s18759 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_completed_application/properties/event_id:type` | s18760 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_completed_application/properties/event_id:lexical` | s18757–s18758 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_completed_application:additionalProperties` | s18754 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_message_added_project:required:schema_id` | s18738 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_message_added_project/properties/schema_id:const` | s18739 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_message_added_project:required:schema_version` | s18740 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_message_added_project/properties/schema_version:const` | s18741 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_message_added_project:required:storage_instance_id` | s18752 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_message_added_project/properties/storage_instance_id:type` | s18753 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_message_added_project/properties/storage_instance_id:lexical` | s18750–s18751 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_message_added_project:required:recovery_epoch` | s18735 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_message_added_project/properties/recovery_epoch:type` | s18737 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_message_added_project/properties/recovery_epoch:minimum` | s18736 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_message_added_project:required:scope_partition` | s18743 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_message_added_project/properties/scope_partition:type` | s18744 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_message_added_project/properties/scope_partition:lexical` | s18742 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_message_added_project:required:event_type` | s18725 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_message_added_project/properties/event_type:const` | s18726 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_message_added_project:required:owner_record_ref` | s18733 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_message_added_project:required:owner_record` | s18731 | S \ F (20307) |
| `schema:Plans/collaborative_workflows_contracts.schema.json#/$defs/CollaborationMessage:type` | s18732 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_message_added_project:required:owner_record_sha256` | s18734 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_message_added_project:required:slot_requirements` | s18748 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_message_added_project/properties/slot_requirements:type` | s18749 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_message_added_project:required:semantic_body` | s18745 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_message_added:type;Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_message_added/allOf/0/then:not` | s16178, s18746 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_message_added_project:required:semantic_sha256` | s18747 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_message_added_project:required:owner_operation_id` | s18729 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_message_added_project/properties/owner_operation_id:type` | s18730 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_message_added_project/properties/owner_operation_id:lexical` | s18727–s18728 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_message_added_project:required:event_id` | s18723 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_message_added_project/properties/event_id:type` | s18724 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_message_added_project/properties/event_id:lexical` | s18721–s18722 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_message_added_project:additionalProperties` | s18718 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_message_added_application:required:schema_id` | s18702 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_message_added_application/properties/schema_id:const` | s18703 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_message_added_application:required:schema_version` | s18704 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_message_added_application/properties/schema_version:const` | s18705 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_message_added_application:required:storage_instance_id` | s18716 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_message_added_application/properties/storage_instance_id:type` | s18717 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_message_added_application/properties/storage_instance_id:lexical` | s18714–s18715 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_message_added_application:required:recovery_epoch` | s18699 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_message_added_application/properties/recovery_epoch:type` | s18701 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_message_added_application/properties/recovery_epoch:minimum` | s18700 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_message_added_application:required:scope_partition` | s18707 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_message_added_application/properties/scope_partition:type` | s18708 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_message_added_application/properties/scope_partition:lexical` | s18706 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_message_added_application:required:event_type` | s18689 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_message_added_application/properties/event_type:const` | s18690 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_message_added_application:required:owner_record_ref` | s18697 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_message_added_application:required:owner_record` | s18695 | S \ F (20307) |
| `schema:Plans/application_workflow_contracts.schema.json#/$defs/CollaborationMessageApplicationV1:type` | s18696 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_message_added_application:required:owner_record_sha256` | s18698 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_message_added_application:required:slot_requirements` | s18712 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_message_added_application/properties/slot_requirements:type` | s18713 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_message_added_application:required:semantic_body` | s18709 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_message_added_application:type;Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_message_added_application/allOf/0/then:not` | s18710 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_message_added_application:required:semantic_sha256` | s18711 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_message_added_application:required:owner_operation_id` | s18693 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_message_added_application/properties/owner_operation_id:type` | s18694 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_message_added_application/properties/owner_operation_id:lexical` | s18691–s18692 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_message_added_application:required:event_id` | s18687 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_message_added_application/properties/event_id:type` | s18688 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_message_added_application/properties/event_id:lexical` | s18685–s18686 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_message_added_application:additionalProperties` | s18682 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_artifact_added_project:required:schema_id` | s18310 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_artifact_added_project/properties/schema_id:const` | s18311 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_artifact_added_project:required:schema_version` | s18312 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_artifact_added_project/properties/schema_version:const` | s18313 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_artifact_added_project:required:storage_instance_id` | s18324 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_artifact_added_project/properties/storage_instance_id:type` | s18325 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_artifact_added_project/properties/storage_instance_id:lexical` | s18322–s18323 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_artifact_added_project:required:recovery_epoch` | s18307 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_artifact_added_project/properties/recovery_epoch:type` | s18309 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_artifact_added_project/properties/recovery_epoch:minimum` | s18308 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_artifact_added_project:required:scope_partition` | s18315 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_artifact_added_project/properties/scope_partition:type` | s18316 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_artifact_added_project/properties/scope_partition:lexical` | s18314 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_artifact_added_project:required:event_type` | s18298 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_artifact_added_project/properties/event_type:const` | s18299 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_artifact_added_project:required:owner_record_ref` | s18305 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_artifact_added_project:required:owner_record` | s18304 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_artifact_added_project:required:owner_record_sha256` | s18306 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_artifact_added_project:required:slot_requirements` | s18320 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_artifact_added_project/properties/slot_requirements:type` | s18321 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_artifact_added_project:required:semantic_body` | s18317 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_artifact_added:type` | s18318 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_artifact_added_project:required:semantic_sha256` | s18319 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_artifact_added_project:required:owner_operation_id` | s18302 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_artifact_added_project/properties/owner_operation_id:type` | s18303 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_artifact_added_project/properties/owner_operation_id:lexical` | s18300–s18301 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_artifact_added_project:required:event_id` | s18296 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_artifact_added_project/properties/event_id:type` | s18297 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_artifact_added_project/properties/event_id:lexical` | s18294–s18295 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_artifact_added_project:additionalProperties` | s18291 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_artifact_added_application:required:schema_id` | s18275 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_artifact_added_application/properties/schema_id:const` | s18276 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_artifact_added_application:required:schema_version` | s18277 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_artifact_added_application/properties/schema_version:const` | s18278 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_artifact_added_application:required:storage_instance_id` | s18289 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_artifact_added_application/properties/storage_instance_id:type` | s18290 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_artifact_added_application/properties/storage_instance_id:lexical` | s18287–s18288 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_artifact_added_application:required:recovery_epoch` | s18272 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_artifact_added_application/properties/recovery_epoch:type` | s18274 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_artifact_added_application/properties/recovery_epoch:minimum` | s18273 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_artifact_added_application:required:scope_partition` | s18280 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_artifact_added_application/properties/scope_partition:type` | s18281 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_artifact_added_application/properties/scope_partition:lexical` | s18279 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_artifact_added_application:required:event_type` | s18263 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_artifact_added_application/properties/event_type:const` | s18264 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_artifact_added_application:required:owner_record_ref` | s18270 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_artifact_added_application:required:owner_record` | s18269 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_artifact_added_application:required:owner_record_sha256` | s18271 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_artifact_added_application:required:slot_requirements` | s18285 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_artifact_added_application/properties/slot_requirements:type` | s18286 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_artifact_added_application:required:semantic_body` | s18282 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_artifact_added_application:type` | s18283 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_artifact_added_application:required:semantic_sha256` | s18284 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_artifact_added_application:required:owner_operation_id` | s18267 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_artifact_added_application/properties/owner_operation_id:type` | s18268 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_artifact_added_application/properties/owner_operation_id:lexical` | s18265–s18266 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_artifact_added_application:required:event_id` | s18261 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_artifact_added_application/properties/event_id:type` | s18262 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_artifact_added_application/properties/event_id:lexical` | s18259–s18260 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_artifact_added_application:additionalProperties` | s18256 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_configuration_changed_project:required:schema_id` | s18521 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_configuration_changed_project/properties/schema_id:const` | s18522 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_configuration_changed_project:required:schema_version` | s18523 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_configuration_changed_project/properties/schema_version:const` | s18524 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_configuration_changed_project:required:storage_instance_id` | s18536 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_configuration_changed_project/properties/storage_instance_id:type` | s18537 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_configuration_changed_project/properties/storage_instance_id:lexical` | s18534–s18535 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_configuration_changed_project:required:recovery_epoch` | s18518 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_configuration_changed_project/properties/recovery_epoch:type` | s18520 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_configuration_changed_project/properties/recovery_epoch:minimum` | s18519 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_configuration_changed_project:required:scope_partition` | s18526 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_configuration_changed_project/properties/scope_partition:type` | s18527 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_configuration_changed_project/properties/scope_partition:lexical` | s18525 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_configuration_changed_project:required:event_type` | s18509 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_configuration_changed_project/properties/event_type:const` | s18510 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_configuration_changed_project:required:owner_record_ref` | s18516 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_configuration_changed_project:required:owner_record` | s18515 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_configuration_changed_project:required:owner_record_sha256` | s18517 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_configuration_changed_project:required:slot_requirements` | s18532 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_configuration_changed_project/properties/slot_requirements:type` | s18533 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_configuration_changed_project/properties/slot_requirements:uniqueItems` | s18531 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_configuration_changed_project:required:semantic_body` | s18528 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_configuration_changed:type;Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_configuration_changed/allOf/0/then/allOf/0:not` | s588, s18529 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_configuration_changed_project:required:semantic_sha256` | s18530 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_configuration_changed_project:required:owner_operation_id` | s18513 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_configuration_changed_project/properties/owner_operation_id:type` | s18514 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_configuration_changed_project/properties/owner_operation_id:lexical` | s18511–s18512 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_configuration_changed_project:required:event_id` | s18507 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_configuration_changed_project/properties/event_id:type` | s18508 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_configuration_changed_project/properties/event_id:lexical` | s18505–s18506 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_configuration_changed_project:additionalProperties` | s18502 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_configuration_changed_application:required:schema_id` | s18485 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_configuration_changed_application/properties/schema_id:const` | s18486 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_configuration_changed_application:required:schema_version` | s18487 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_configuration_changed_application/properties/schema_version:const` | s18488 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_configuration_changed_application:required:storage_instance_id` | s18500 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_configuration_changed_application/properties/storage_instance_id:type` | s18501 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_configuration_changed_application/properties/storage_instance_id:lexical` | s18498–s18499 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_configuration_changed_application:required:recovery_epoch` | s18482 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_configuration_changed_application/properties/recovery_epoch:type` | s18484 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_configuration_changed_application/properties/recovery_epoch:minimum` | s18483 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_configuration_changed_application:required:scope_partition` | s18490 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_configuration_changed_application/properties/scope_partition:type` | s18491 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_configuration_changed_application/properties/scope_partition:lexical` | s18489 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_configuration_changed_application:required:event_type` | s18473 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_configuration_changed_application/properties/event_type:const` | s18474 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_configuration_changed_application:required:owner_record_ref` | s18480 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_configuration_changed_application:required:owner_record` | s18479 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_configuration_changed_application:required:owner_record_sha256` | s18481 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_configuration_changed_application:required:slot_requirements` | s18496 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_configuration_changed_application/properties/slot_requirements:type` | s18497 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_configuration_changed_application/properties/slot_requirements:uniqueItems` | s18495 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_configuration_changed_application:required:semantic_body` | s18492 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_configuration_changed_application:type;Plans/collaboration_event_payloads.schema.json#/$defs/collaboration_configuration_changed_application/allOf/0/then/allOf/0:not` | s18493 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_configuration_changed_application:required:semantic_sha256` | s18494 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_configuration_changed_application:required:owner_operation_id` | s18477 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_configuration_changed_application/properties/owner_operation_id:type` | s18478 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_configuration_changed_application/properties/owner_operation_id:lexical` | s18475–s18476 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_configuration_changed_application:required:event_id` | s18471 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_configuration_changed_application/properties/event_id:type` | s18472 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_configuration_changed_application/properties/event_id:lexical` | s18469–s18470 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_configuration_changed_application:additionalProperties` | s18466 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_proposal_added_project:required:schema_id` | s18165 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_proposal_added_project/properties/schema_id:const` | s18166 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_proposal_added_project:required:schema_version` | s18167 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_proposal_added_project/properties/schema_version:const` | s18168 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_proposal_added_project:required:storage_instance_id` | s18179 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_proposal_added_project/properties/storage_instance_id:type` | s18180 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_proposal_added_project/properties/storage_instance_id:lexical` | s18177–s18178 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_proposal_added_project:required:recovery_epoch` | s18162 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_proposal_added_project/properties/recovery_epoch:type` | s18164 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_proposal_added_project/properties/recovery_epoch:minimum` | s18163 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_proposal_added_project:required:scope_partition` | s18170 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_proposal_added_project/properties/scope_partition:type` | s18171 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_proposal_added_project/properties/scope_partition:lexical` | s18169 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_proposal_added_project:required:event_type` | s18150 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_proposal_added_project/properties/event_type:const` | s18151 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_proposal_added_project:required:owner_record_ref` | s18158 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_proposal_added_project:required:owner_record` | s18156 | S \ F (20307) |
| `schema:Plans/collaborative_workflows_contracts.schema.json#/$defs/BrainstormProposal:type` | s18157 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_proposal_added_project:required:owner_record_sha256` | s18159 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_proposal_added_project:required:slot_requirements` | s18175 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_proposal_added_project/properties/slot_requirements:type` | s18176 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_proposal_added_project:required:semantic_body` | s18172 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_proposal_added:type` | s18173 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_proposal_added_project:required:semantic_sha256` | s18174 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_proposal_added_project:required:owner_operation_id` | s18154 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_proposal_added_project/properties/owner_operation_id:type` | s18155 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_proposal_added_project/properties/owner_operation_id:lexical` | s18152–s18153 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_proposal_added_project:required:event_id` | s18148 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_proposal_added_project/properties/event_id:type` | s18149 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_proposal_added_project/properties/event_id:lexical` | s18146–s18147 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_proposal_added_project:additionalProperties` | s18143 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_proposal_added_application:required:schema_id` | s18127 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_proposal_added_application/properties/schema_id:const` | s18128 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_proposal_added_application:required:schema_version` | s18129 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_proposal_added_application/properties/schema_version:const` | s18130 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_proposal_added_application:required:storage_instance_id` | s18141 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_proposal_added_application/properties/storage_instance_id:type` | s18142 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_proposal_added_application/properties/storage_instance_id:lexical` | s18139–s18140 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_proposal_added_application:required:recovery_epoch` | s18124 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_proposal_added_application/properties/recovery_epoch:type` | s18126 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_proposal_added_application/properties/recovery_epoch:minimum` | s18125 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_proposal_added_application:required:scope_partition` | s18132 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_proposal_added_application/properties/scope_partition:type` | s18133 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_proposal_added_application/properties/scope_partition:lexical` | s18131 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_proposal_added_application:required:event_type` | s18113 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_proposal_added_application/properties/event_type:const` | s18114 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_proposal_added_application:required:owner_record_ref` | s18120 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_proposal_added_application:required:owner_record` | s18119 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_proposal_added_application:required:owner_record_sha256` | s18121 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_proposal_added_application:required:slot_requirements` | s18137 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_proposal_added_application/properties/slot_requirements:type` | s18138 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_proposal_added_application:required:semantic_body` | s18134 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_proposal_added_application:type` | s18135 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_proposal_added_application:required:semantic_sha256` | s18136 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_proposal_added_application:required:owner_operation_id` | s18117 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_proposal_added_application/properties/owner_operation_id:type` | s18118 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_proposal_added_application/properties/owner_operation_id:lexical` | s18115–s18116 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_proposal_added_application:required:event_id` | s18111 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_proposal_added_application/properties/event_id:type` | s18112 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_proposal_added_application/properties/event_id:lexical` | s18109–s18110 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_proposal_added_application:additionalProperties` | s18106 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_vote_added_project:required:schema_id` | s18240 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_vote_added_project/properties/schema_id:const` | s18241 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_vote_added_project:required:schema_version` | s18242 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_vote_added_project/properties/schema_version:const` | s18243 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_vote_added_project:required:storage_instance_id` | s18254 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_vote_added_project/properties/storage_instance_id:type` | s18255 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_vote_added_project/properties/storage_instance_id:lexical` | s18252–s18253 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_vote_added_project:required:recovery_epoch` | s18237 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_vote_added_project/properties/recovery_epoch:type` | s18239 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_vote_added_project/properties/recovery_epoch:minimum` | s18238 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_vote_added_project:required:scope_partition` | s18245 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_vote_added_project/properties/scope_partition:type` | s18246 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_vote_added_project/properties/scope_partition:lexical` | s18244 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_vote_added_project:required:event_type` | s18225 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_vote_added_project/properties/event_type:const` | s18226 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_vote_added_project:required:owner_record_ref` | s18233 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_vote_added_project:required:owner_record` | s18231 | S \ F (20307) |
| `schema:Plans/collaborative_workflows_contracts.schema.json#/$defs/BrainstormVote:type` | s18232 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_vote_added_project:required:owner_record_sha256` | s18234 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_vote_added_project:required:slot_requirements` | s18250 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_vote_added_project/properties/slot_requirements:type` | s18251 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_vote_added_project:required:semantic_body` | s18247 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_vote_added:type` | s18248 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_vote_added_project:required:semantic_sha256` | s18249 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_vote_added_project:required:owner_operation_id` | s18229 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_vote_added_project/properties/owner_operation_id:type` | s18230 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_vote_added_project/properties/owner_operation_id:lexical` | s18227–s18228 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_vote_added_project:required:event_id` | s18223 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_vote_added_project/properties/event_id:type` | s18224 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_vote_added_project/properties/event_id:lexical` | s18221–s18222 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_vote_added_project:additionalProperties` | s18218 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_vote_added_application:required:schema_id` | s18202 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_vote_added_application/properties/schema_id:const` | s18203 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_vote_added_application:required:schema_version` | s18204 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_vote_added_application/properties/schema_version:const` | s18205 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_vote_added_application:required:storage_instance_id` | s18216 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_vote_added_application/properties/storage_instance_id:type` | s18217 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_vote_added_application/properties/storage_instance_id:lexical` | s18214–s18215 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_vote_added_application:required:recovery_epoch` | s18199 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_vote_added_application/properties/recovery_epoch:type` | s18201 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_vote_added_application/properties/recovery_epoch:minimum` | s18200 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_vote_added_application:required:scope_partition` | s18207 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_vote_added_application/properties/scope_partition:type` | s18208 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_vote_added_application/properties/scope_partition:lexical` | s18206 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_vote_added_application:required:event_type` | s18188 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_vote_added_application/properties/event_type:const` | s18189 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_vote_added_application:required:owner_record_ref` | s18195 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_vote_added_application:required:owner_record` | s18194 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_vote_added_application:required:owner_record_sha256` | s18196 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_vote_added_application:required:slot_requirements` | s18212 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_vote_added_application/properties/slot_requirements:type` | s18213 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_vote_added_application:required:semantic_body` | s18209 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_vote_added_application:type` | s18210 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_vote_added_application:required:semantic_sha256` | s18211 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_vote_added_application:required:owner_operation_id` | s18192 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_vote_added_application/properties/owner_operation_id:type` | s18193 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_vote_added_application/properties/owner_operation_id:lexical` | s18190–s18191 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_vote_added_application:required:event_id` | s18186 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_vote_added_application/properties/event_id:type` | s18187 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_vote_added_application/properties/event_id:lexical` | s18184–s18185 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_vote_added_application:additionalProperties` | s18181 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_plan_synthesized_project:required:schema_id` | s18090 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_plan_synthesized_project/properties/schema_id:const` | s18091 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_plan_synthesized_project:required:schema_version` | s18092 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_plan_synthesized_project/properties/schema_version:const` | s18093 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_plan_synthesized_project:required:storage_instance_id` | s18104 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_plan_synthesized_project/properties/storage_instance_id:type` | s18105 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_plan_synthesized_project/properties/storage_instance_id:lexical` | s18102–s18103 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_plan_synthesized_project:required:recovery_epoch` | s18087 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_plan_synthesized_project/properties/recovery_epoch:type` | s18089 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_plan_synthesized_project/properties/recovery_epoch:minimum` | s18088 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_plan_synthesized_project:required:scope_partition` | s18095 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_plan_synthesized_project/properties/scope_partition:type` | s18096 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_plan_synthesized_project/properties/scope_partition:lexical` | s18094 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_plan_synthesized_project:required:event_type` | s18078 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_plan_synthesized_project/properties/event_type:const` | s18079 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_plan_synthesized_project:required:owner_record_ref` | s18085 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_plan_synthesized_project:required:owner_record` | s18084 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_plan_synthesized_project:required:owner_record_sha256` | s18086 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_plan_synthesized_project:required:slot_requirements` | s18100 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_plan_synthesized_project/properties/slot_requirements:type` | s18101 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_plan_synthesized_project:required:semantic_body` | s18097 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_plan_synthesized:type` | s18098 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_plan_synthesized_project:required:semantic_sha256` | s18099 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_plan_synthesized_project:required:owner_operation_id` | s18082 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_plan_synthesized_project/properties/owner_operation_id:type` | s18083 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_plan_synthesized_project/properties/owner_operation_id:lexical` | s18080–s18081 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_plan_synthesized_project:required:event_id` | s18076 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_plan_synthesized_project/properties/event_id:type` | s18077 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_plan_synthesized_project/properties/event_id:lexical` | s18074–s18075 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_plan_synthesized_project:additionalProperties` | s18071 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_plan_synthesized_application:required:schema_id` | s18055 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_plan_synthesized_application/properties/schema_id:const` | s18056 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_plan_synthesized_application:required:schema_version` | s18057 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_plan_synthesized_application/properties/schema_version:const` | s18058 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_plan_synthesized_application:required:storage_instance_id` | s18069 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_plan_synthesized_application/properties/storage_instance_id:type` | s18070 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_plan_synthesized_application/properties/storage_instance_id:lexical` | s18067–s18068 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_plan_synthesized_application:required:recovery_epoch` | s18052 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_plan_synthesized_application/properties/recovery_epoch:type` | s18054 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_plan_synthesized_application/properties/recovery_epoch:minimum` | s18053 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_plan_synthesized_application:required:scope_partition` | s18060 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_plan_synthesized_application/properties/scope_partition:type` | s18061 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_plan_synthesized_application/properties/scope_partition:lexical` | s18059 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_plan_synthesized_application:required:event_type` | s18043 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_plan_synthesized_application/properties/event_type:const` | s18044 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_plan_synthesized_application:required:owner_record_ref` | s18050 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_plan_synthesized_application:required:owner_record` | s18049 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_plan_synthesized_application:required:owner_record_sha256` | s18051 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_plan_synthesized_application:required:slot_requirements` | s18065 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_plan_synthesized_application/properties/slot_requirements:type` | s18066 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_plan_synthesized_application:required:semantic_body` | s18062 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/brainstorm_plan_synthesized_application:type` | s18063 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_plan_synthesized_application:required:semantic_sha256` | s18064 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_plan_synthesized_application:required:owner_operation_id` | s18047 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_plan_synthesized_application/properties/owner_operation_id:type` | s18048 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_plan_synthesized_application/properties/owner_operation_id:lexical` | s18045–s18046 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_plan_synthesized_application:required:event_id` | s18041 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_plan_synthesized_application/properties/event_id:type` | s18042 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_plan_synthesized_application/properties/event_id:lexical` | s18039–s18040 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_plan_synthesized_application:additionalProperties` | s18036 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_added_project:required:schema_id` | s19248 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_added_project/properties/schema_id:const` | s19249 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_added_project:required:schema_version` | s19250 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_added_project/properties/schema_version:const` | s19251 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_added_project:required:storage_instance_id` | s19262 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_added_project/properties/storage_instance_id:type` | s19263 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_added_project/properties/storage_instance_id:lexical` | s19260–s19261 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_added_project:required:recovery_epoch` | s19245 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_added_project/properties/recovery_epoch:type` | s19247 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_added_project/properties/recovery_epoch:minimum` | s19246 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_added_project:required:scope_partition` | s19253 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_added_project/properties/scope_partition:type` | s19254 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_added_project/properties/scope_partition:lexical` | s19252 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_added_project:required:event_type` | s19235 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_added_project/properties/event_type:const` | s19236 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_added_project:required:owner_record_ref` | s19243 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_added_project:required:owner_record` | s19241 | S \ F (20307) |
| `schema:Plans/collaborative_workflows_contracts.schema.json#/$defs/ReviewFinding:type` | s19242 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_added_project:required:owner_record_sha256` | s19244 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_added_project:required:slot_requirements` | s19258 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_added_project/properties/slot_requirements:type` | s19259 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_added_project:required:semantic_body` | s19255 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_added:type` | s19256 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_added_project:required:semantic_sha256` | s19257 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_added_project:required:owner_operation_id` | s19239 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_added_project/properties/owner_operation_id:type` | s19240 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_added_project/properties/owner_operation_id:lexical` | s19237–s19238 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_added_project:required:event_id` | s19233 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_added_project/properties/event_id:type` | s19234 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_added_project/properties/event_id:lexical` | s19231–s19232 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_added_project:additionalProperties` | s19228 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_added_application:required:schema_id` | s19212 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_added_application/properties/schema_id:const` | s19213 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_added_application:required:schema_version` | s19214 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_added_application/properties/schema_version:const` | s19215 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_added_application:required:storage_instance_id` | s19226 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_added_application/properties/storage_instance_id:type` | s19227 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_added_application/properties/storage_instance_id:lexical` | s19224–s19225 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_added_application:required:recovery_epoch` | s19209 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_added_application/properties/recovery_epoch:type` | s19211 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_added_application/properties/recovery_epoch:minimum` | s19210 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_added_application:required:scope_partition` | s19217 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_added_application/properties/scope_partition:type` | s19218 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_added_application/properties/scope_partition:lexical` | s19216 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_added_application:required:event_type` | s19200 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_added_application/properties/event_type:const` | s19201 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_added_application:required:owner_record_ref` | s19207 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_added_application:required:owner_record` | s19206 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_added_application:required:owner_record_sha256` | s19208 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_added_application:required:slot_requirements` | s19222 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_added_application/properties/slot_requirements:type` | s19223 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_added_application:required:semantic_body` | s19219 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_added_application:type` | s19220 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_added_application:required:semantic_sha256` | s19221 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_added_application:required:owner_operation_id` | s19204 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_added_application/properties/owner_operation_id:type` | s19205 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_added_application/properties/owner_operation_id:lexical` | s19202–s19203 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_added_application:required:event_id` | s19198 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_added_application/properties/event_id:type` | s19199 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_added_application/properties/event_id:lexical` | s19196–s19197 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_added_application:additionalProperties` | s19193 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_dispositioned_project:required:schema_id` | s19318 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_dispositioned_project/properties/schema_id:const` | s19319 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_dispositioned_project:required:schema_version` | s19320 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_dispositioned_project/properties/schema_version:const` | s19321 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_dispositioned_project:required:storage_instance_id` | s19332 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_dispositioned_project/properties/storage_instance_id:type` | s19333 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_dispositioned_project/properties/storage_instance_id:lexical` | s19330–s19331 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_dispositioned_project:required:recovery_epoch` | s19315 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_dispositioned_project/properties/recovery_epoch:type` | s19317 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_dispositioned_project/properties/recovery_epoch:minimum` | s19316 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_dispositioned_project:required:scope_partition` | s19323 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_dispositioned_project/properties/scope_partition:type` | s19324 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_dispositioned_project/properties/scope_partition:lexical` | s19322 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_dispositioned_project:required:event_type` | s19306 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_dispositioned_project/properties/event_type:const` | s19307 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_dispositioned_project:required:owner_record_ref` | s19313 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_dispositioned_project:required:owner_record` | s19312 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_dispositioned_project:required:owner_record_sha256` | s19314 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_dispositioned_project:required:slot_requirements` | s19328 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_dispositioned_project/properties/slot_requirements:type` | s19329 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_dispositioned_project:required:semantic_body` | s19325 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_dispositioned:type` | s19326 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_dispositioned_project:required:semantic_sha256` | s19327 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_dispositioned_project:required:owner_operation_id` | s19310 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_dispositioned_project/properties/owner_operation_id:type` | s19311 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_dispositioned_project/properties/owner_operation_id:lexical` | s19308–s19309 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_dispositioned_project:required:event_id` | s19304 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_dispositioned_project/properties/event_id:type` | s19305 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_dispositioned_project/properties/event_id:lexical` | s19302–s19303 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_dispositioned_project:additionalProperties` | s19299 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_dispositioned_application:required:schema_id` | s19283 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_dispositioned_application/properties/schema_id:const` | s19284 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_dispositioned_application:required:schema_version` | s19285 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_dispositioned_application/properties/schema_version:const` | s19286 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_dispositioned_application:required:storage_instance_id` | s19297 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_dispositioned_application/properties/storage_instance_id:type` | s19298 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_dispositioned_application/properties/storage_instance_id:lexical` | s19295–s19296 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_dispositioned_application:required:recovery_epoch` | s19280 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_dispositioned_application/properties/recovery_epoch:type` | s19282 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_dispositioned_application/properties/recovery_epoch:minimum` | s19281 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_dispositioned_application:required:scope_partition` | s19288 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_dispositioned_application/properties/scope_partition:type` | s19289 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_dispositioned_application/properties/scope_partition:lexical` | s19287 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_dispositioned_application:required:event_type` | s19271 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_dispositioned_application/properties/event_type:const` | s19272 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_dispositioned_application:required:owner_record_ref` | s19278 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_dispositioned_application:required:owner_record` | s19277 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_dispositioned_application:required:owner_record_sha256` | s19279 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_dispositioned_application:required:slot_requirements` | s19293 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_dispositioned_application/properties/slot_requirements:type` | s19294 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_dispositioned_application:required:semantic_body` | s19290 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_finding_dispositioned_application:type` | s19291 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_dispositioned_application:required:semantic_sha256` | s19292 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_dispositioned_application:required:owner_operation_id` | s19275 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_dispositioned_application/properties/owner_operation_id:type` | s19276 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_dispositioned_application/properties/owner_operation_id:lexical` | s19273–s19274 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_dispositioned_application:required:event_id` | s19269 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_dispositioned_application/properties/event_id:type` | s19270 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_dispositioned_application/properties/event_id:lexical` | s19267–s19268 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_dispositioned_application:additionalProperties` | s19264 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_artifact_finalized_project:required:schema_id` | s19177 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_artifact_finalized_project/properties/schema_id:const` | s19178 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_artifact_finalized_project:required:schema_version` | s19179 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_artifact_finalized_project/properties/schema_version:const` | s19180 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_artifact_finalized_project:required:storage_instance_id` | s19191 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_artifact_finalized_project/properties/storage_instance_id:type` | s19192 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_artifact_finalized_project/properties/storage_instance_id:lexical` | s19189–s19190 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_artifact_finalized_project:required:recovery_epoch` | s19174 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_artifact_finalized_project/properties/recovery_epoch:type` | s19176 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_artifact_finalized_project/properties/recovery_epoch:minimum` | s19175 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_artifact_finalized_project:required:scope_partition` | s19182 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_artifact_finalized_project/properties/scope_partition:type` | s19183 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_artifact_finalized_project/properties/scope_partition:lexical` | s19181 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_artifact_finalized_project:required:event_type` | s19165 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_artifact_finalized_project/properties/event_type:const` | s19166 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_artifact_finalized_project:required:owner_record_ref` | s19172 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_artifact_finalized_project:required:owner_record` | s19171 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_artifact_finalized_project:required:owner_record_sha256` | s19173 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_artifact_finalized_project:required:slot_requirements` | s19187 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_artifact_finalized_project/properties/slot_requirements:type` | s19188 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_artifact_finalized_project:required:semantic_body` | s19184 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized:type` | s19185 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_artifact_finalized_project:required:semantic_sha256` | s19186 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_artifact_finalized_project:required:owner_operation_id` | s19169 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_artifact_finalized_project/properties/owner_operation_id:type` | s19170 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_artifact_finalized_project/properties/owner_operation_id:lexical` | s19167–s19168 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_artifact_finalized_project:required:event_id` | s19163 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_artifact_finalized_project/properties/event_id:type` | s19164 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_artifact_finalized_project/properties/event_id:lexical` | s19161–s19162 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_artifact_finalized_project:additionalProperties` | s19158 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_artifact_finalized_application:required:schema_id` | s19142 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_artifact_finalized_application/properties/schema_id:const` | s19143 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_artifact_finalized_application:required:schema_version` | s19144 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_artifact_finalized_application/properties/schema_version:const` | s19145 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_artifact_finalized_application:required:storage_instance_id` | s19156 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_artifact_finalized_application/properties/storage_instance_id:type` | s19157 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_artifact_finalized_application/properties/storage_instance_id:lexical` | s19154–s19155 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_artifact_finalized_application:required:recovery_epoch` | s19139 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_artifact_finalized_application/properties/recovery_epoch:type` | s19141 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_artifact_finalized_application/properties/recovery_epoch:minimum` | s19140 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_artifact_finalized_application:required:scope_partition` | s19147 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_artifact_finalized_application/properties/scope_partition:type` | s19148 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_artifact_finalized_application/properties/scope_partition:lexical` | s19146 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_artifact_finalized_application:required:event_type` | s19130 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_artifact_finalized_application/properties/event_type:const` | s19131 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_artifact_finalized_application:required:owner_record_ref` | s19137 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_artifact_finalized_application:required:owner_record` | s19136 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_artifact_finalized_application:required:owner_record_sha256` | s19138 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_artifact_finalized_application:required:slot_requirements` | s19152 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_artifact_finalized_application/properties/slot_requirements:type` | s19153 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_artifact_finalized_application:required:semantic_body` | s19149 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized_application:type` | s19150 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_artifact_finalized_application:required:semantic_sha256` | s19151 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_artifact_finalized_application:required:owner_operation_id` | s19134 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_artifact_finalized_application/properties/owner_operation_id:type` | s19135 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_artifact_finalized_application/properties/owner_operation_id:lexical` | s19132–s19133 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_artifact_finalized_application:required:event_id` | s19128 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_artifact_finalized_application/properties/event_id:type` | s19129 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_artifact_finalized_application/properties/event_id:lexical` | s19126–s19127 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_artifact_finalized_application:additionalProperties` | s19123 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_proposal_added_project:required:participant_identity` | s18160 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_proposal_added_project/properties/participant_identity:type` | s2582, s18161 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_proposal_added_application:required:participant_identity` | s18122 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_proposal_added_application/properties/participant_identity:type` | s2560, s18123 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_vote_added_project:required:participant_identity` | s18235 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_vote_added_project/properties/participant_identity:type` | s2626, s18236 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_vote_added_application:required:participant_identity` | s18197 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_vote_added_application/properties/participant_identity:type` | s2604, s18198 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_started_project/allOf/0/then:required:review_target_pack` | s19117 | S \ F (20307) |
| `schema:Plans/collaborative_workflows_contracts.schema.json#/$defs/ReviewTargetPack:type` | s3012, s3053, s19114, s19118 | S \ F (20304) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_started_application/allOf/0/then:required:review_target_pack` | s19113 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_created_project:required:envelope_metadata` | s18576 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_created_project/properties/envelope_metadata:type` | s2778, s18577 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_created_application:required:envelope_metadata` | s18539 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_created_application/properties/envelope_metadata:type` | s2763, s18540 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_started_project:required:envelope_metadata` | s19075, s19115 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_started_project/properties/envelope_metadata:type` | s2988, s3044, s19076, s19116 | S \ F (20304) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_started_application:required:envelope_metadata` | s19038, s19111 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_started_application/properties/envelope_metadata:type` | s2973, s3003, s19039, s19112 | S \ F (20304) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_paused_project:required:envelope_metadata` | s18933 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_paused_project/properties/envelope_metadata:type` | s2928, s18934 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_paused_application:required:envelope_metadata` | s18898 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_paused_application/properties/envelope_metadata:type` | s2913, s18899 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_resumed_project:required:envelope_metadata` | s19003 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_resumed_project/properties/envelope_metadata:type` | s2958, s19004 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_resumed_application:required:envelope_metadata` | s18968 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_resumed_application/properties/envelope_metadata:type` | s2943, s18969 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_cancelled_project:required:envelope_metadata` | s18362 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_cancelled_project/properties/envelope_metadata:type` | s2688, s18363 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_cancelled_application:required:envelope_metadata` | s18327 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_cancelled_application/properties/envelope_metadata:type` | s2673, s18328 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_completed_project:required:envelope_metadata` | s18432 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_completed_project/properties/envelope_metadata:type` | s2718, s18433 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_completed_application:required:envelope_metadata` | s18397 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_completed_application/properties/envelope_metadata:type` | s2703, s18398 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_failed_project:required:envelope_metadata` | s18648 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_failed_project/properties/envelope_metadata:type` | s2808, s18649 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_failed_application:required:envelope_metadata` | s18613 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_failed_application/properties/envelope_metadata:type` | s2793, s18614 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_started_project:required:envelope_metadata` | s18862 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_started_project/properties/envelope_metadata:type` | s2898, s18863 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_started_application:required:envelope_metadata` | s18826 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_started_application/properties/envelope_metadata:type` | s2883, s18827 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_completed_project:required:envelope_metadata` | s18790, s19121 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_completed_project/properties/envelope_metadata:type` | s2868, s3100, s18791, s19122 | S \ F (20304) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_completed_application:required:envelope_metadata` | s18755, s19119 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_completed_application/properties/envelope_metadata:type` | s2853, s3085, s18756, s19120 | S \ F (20304) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_message_added_project:required:envelope_metadata` | s18719 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_message_added_project/properties/envelope_metadata:type` | s2838, s18720 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_message_added_application:required:envelope_metadata` | s18683 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_message_added_application/properties/envelope_metadata:type` | s2823, s18684 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_artifact_added_project:required:envelope_metadata` | s18292 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_artifact_added_project/properties/envelope_metadata:type` | s2658, s18293 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_artifact_added_application:required:envelope_metadata` | s18257 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_artifact_added_application/properties/envelope_metadata:type` | s2643, s18258 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_configuration_changed_project:required:envelope_metadata` | s18503 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_configuration_changed_project/properties/envelope_metadata:type` | s2748, s18504 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_configuration_changed_application:required:envelope_metadata` | s18467 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_configuration_changed_application/properties/envelope_metadata:type` | s2733, s18468 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_proposal_added_project:required:envelope_metadata` | s18144 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_proposal_added_project/properties/envelope_metadata:type` | s2577, s18145 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_proposal_added_application:required:envelope_metadata` | s18107 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_proposal_added_application/properties/envelope_metadata:type` | s2555, s18108 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_vote_added_project:required:envelope_metadata` | s18219 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_vote_added_project/properties/envelope_metadata:type` | s2621, s18220 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_vote_added_application:required:envelope_metadata` | s18182 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_vote_added_application/properties/envelope_metadata:type` | s2599, s18183 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_plan_synthesized_project:required:envelope_metadata` | s18072 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_plan_synthesized_project/properties/envelope_metadata:type` | s2540, s18073 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_plan_synthesized_application:required:envelope_metadata` | s18037 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_plan_synthesized_application/properties/envelope_metadata:type` | s2525, s18038 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_added_project:required:envelope_metadata` | s19229 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_added_project/properties/envelope_metadata:type` | s3160, s19230 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_added_application:required:envelope_metadata` | s19194 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_added_application/properties/envelope_metadata:type` | s3145, s19195 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_dispositioned_project:required:envelope_metadata` | s19300 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_dispositioned_project/properties/envelope_metadata:type` | s3190, s19301 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_dispositioned_application:required:envelope_metadata` | s19265 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_dispositioned_application/properties/envelope_metadata:type` | s3175, s19266 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_artifact_finalized_project:required:envelope_metadata` | s19159 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_artifact_finalized_project/properties/envelope_metadata:type` | s3130, s19160 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_artifact_finalized_application:required:envelope_metadata` | s19124 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_artifact_finalized_application/properties/envelope_metadata:type` | s3115, s19125 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_created_project/properties/envelope_metadata/properties/actor_ref:type` | s2769–s2770 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_created_project/properties/envelope_metadata/properties/actor_ref:lexical` | s2768 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_created_project/properties/envelope_metadata/properties/correlation_id:type` | s2774–s2775 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_created_project/properties/envelope_metadata/properties/correlation_id:lexical` | s2773 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_created_project/properties/envelope_metadata/properties/causation_event_id:anyOf` | s2771–s2772 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_created_project/properties/envelope_metadata/properties/parent_event_id:anyOf` | s2779–s2780 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_created_project/properties/envelope_metadata/properties/requested_account_ref:anyOf` | s2781–s2782 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_created_project/properties/envelope_metadata/properties/effective_account_ref:anyOf` | s2776–s2777 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_created_application/properties/envelope_metadata/properties/actor_ref:type` | s2754–s2755 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_created_application/properties/envelope_metadata/properties/actor_ref:lexical` | s2753 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_created_application/properties/envelope_metadata/properties/correlation_id:type` | s2759–s2760 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_created_application/properties/envelope_metadata/properties/correlation_id:lexical` | s2758 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_created_application/properties/envelope_metadata/properties/causation_event_id:anyOf` | s2756–s2757 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_created_application/properties/envelope_metadata/properties/parent_event_id:anyOf` | s2764–s2765 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_created_application/properties/envelope_metadata/properties/requested_account_ref:anyOf` | s2766–s2767 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_created_application/properties/envelope_metadata/properties/effective_account_ref:anyOf` | s2761–s2762 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_started_project/properties/envelope_metadata/properties/actor_ref:type` | s2979–s2980, s3035–s3036 | S \ F (20304) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_started_project/properties/envelope_metadata/properties/actor_ref:lexical` | s2978, s3034 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_started_project/properties/envelope_metadata/properties/correlation_id:type` | s2984–s2985, s3040–s3041 | S \ F (20304) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_started_project/properties/envelope_metadata/properties/correlation_id:lexical` | s2983, s3039 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_started_project/properties/envelope_metadata/properties/causation_event_id:anyOf` | s2981–s2982, s3037–s3038 | S \ F (20304) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_started_project/properties/envelope_metadata/properties/parent_event_id:anyOf` | s2989–s2990, s3045–s3046 | S \ F (20304) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_started_project/properties/envelope_metadata/properties/requested_account_ref:anyOf` | s2991–s2992, s3047–s3048 | S \ F (20304) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_started_project/properties/envelope_metadata/properties/effective_account_ref:anyOf` | s2986–s2987, s3042–s3043 | S \ F (20304) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_started_application/properties/envelope_metadata/properties/actor_ref:type` | s2964–s2965, s2994–s2995 | S \ F (20304) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_started_application/properties/envelope_metadata/properties/actor_ref:lexical` | s2963, s2993 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_started_application/properties/envelope_metadata/properties/correlation_id:type` | s2969–s2970, s2999–s3000 | S \ F (20304) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_started_application/properties/envelope_metadata/properties/correlation_id:lexical` | s2968, s2998 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_started_application/properties/envelope_metadata/properties/causation_event_id:anyOf` | s2966–s2967, s2996–s2997 | S \ F (20304) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_started_application/properties/envelope_metadata/properties/parent_event_id:anyOf` | s2974–s2975, s3004–s3005 | S \ F (20304) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_started_application/properties/envelope_metadata/properties/requested_account_ref:anyOf` | s2976–s2977, s3006–s3007 | S \ F (20304) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_started_application/properties/envelope_metadata/properties/effective_account_ref:anyOf` | s2971–s2972, s3001–s3002 | S \ F (20304) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_paused_project/properties/envelope_metadata/properties/actor_ref:type` | s2919–s2920 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_paused_project/properties/envelope_metadata/properties/actor_ref:lexical` | s2918 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_paused_project/properties/envelope_metadata/properties/correlation_id:type` | s2924–s2925 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_paused_project/properties/envelope_metadata/properties/correlation_id:lexical` | s2923 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_paused_project/properties/envelope_metadata/properties/causation_event_id:anyOf` | s2921–s2922 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_paused_project/properties/envelope_metadata/properties/parent_event_id:anyOf` | s2929–s2930 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_paused_project/properties/envelope_metadata/properties/requested_account_ref:anyOf` | s2931–s2932 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_paused_project/properties/envelope_metadata/properties/effective_account_ref:anyOf` | s2926–s2927 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_paused_application/properties/envelope_metadata/properties/actor_ref:type` | s2904–s2905 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_paused_application/properties/envelope_metadata/properties/actor_ref:lexical` | s2903 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_paused_application/properties/envelope_metadata/properties/correlation_id:type` | s2909–s2910 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_paused_application/properties/envelope_metadata/properties/correlation_id:lexical` | s2908 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_paused_application/properties/envelope_metadata/properties/causation_event_id:anyOf` | s2906–s2907 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_paused_application/properties/envelope_metadata/properties/parent_event_id:anyOf` | s2914–s2915 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_paused_application/properties/envelope_metadata/properties/requested_account_ref:anyOf` | s2916–s2917 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_paused_application/properties/envelope_metadata/properties/effective_account_ref:anyOf` | s2911–s2912 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_resumed_project/properties/envelope_metadata/properties/actor_ref:type` | s2949–s2950 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_resumed_project/properties/envelope_metadata/properties/actor_ref:lexical` | s2948 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_resumed_project/properties/envelope_metadata/properties/correlation_id:type` | s2954–s2955 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_resumed_project/properties/envelope_metadata/properties/correlation_id:lexical` | s2953 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_resumed_project/properties/envelope_metadata/properties/causation_event_id:anyOf` | s2951–s2952 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_resumed_project/properties/envelope_metadata/properties/parent_event_id:anyOf` | s2959–s2960 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_resumed_project/properties/envelope_metadata/properties/requested_account_ref:anyOf` | s2961–s2962 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_resumed_project/properties/envelope_metadata/properties/effective_account_ref:anyOf` | s2956–s2957 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_resumed_application/properties/envelope_metadata/properties/actor_ref:type` | s2934–s2935 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_resumed_application/properties/envelope_metadata/properties/actor_ref:lexical` | s2933 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_resumed_application/properties/envelope_metadata/properties/correlation_id:type` | s2939–s2940 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_resumed_application/properties/envelope_metadata/properties/correlation_id:lexical` | s2938 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_resumed_application/properties/envelope_metadata/properties/causation_event_id:anyOf` | s2936–s2937 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_resumed_application/properties/envelope_metadata/properties/parent_event_id:anyOf` | s2944–s2945 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_resumed_application/properties/envelope_metadata/properties/requested_account_ref:anyOf` | s2946–s2947 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_resumed_application/properties/envelope_metadata/properties/effective_account_ref:anyOf` | s2941–s2942 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_cancelled_project/properties/envelope_metadata/properties/actor_ref:type` | s2679–s2680 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_cancelled_project/properties/envelope_metadata/properties/actor_ref:lexical` | s2678 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_cancelled_project/properties/envelope_metadata/properties/correlation_id:type` | s2684–s2685 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_cancelled_project/properties/envelope_metadata/properties/correlation_id:lexical` | s2683 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_cancelled_project/properties/envelope_metadata/properties/causation_event_id:anyOf` | s2681–s2682 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_cancelled_project/properties/envelope_metadata/properties/parent_event_id:anyOf` | s2689–s2690 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_cancelled_project/properties/envelope_metadata/properties/requested_account_ref:anyOf` | s2691–s2692 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_cancelled_project/properties/envelope_metadata/properties/effective_account_ref:anyOf` | s2686–s2687 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_cancelled_application/properties/envelope_metadata/properties/actor_ref:type` | s2664–s2665 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_cancelled_application/properties/envelope_metadata/properties/actor_ref:lexical` | s2663 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_cancelled_application/properties/envelope_metadata/properties/correlation_id:type` | s2669–s2670 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_cancelled_application/properties/envelope_metadata/properties/correlation_id:lexical` | s2668 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_cancelled_application/properties/envelope_metadata/properties/causation_event_id:anyOf` | s2666–s2667 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_cancelled_application/properties/envelope_metadata/properties/parent_event_id:anyOf` | s2674–s2675 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_cancelled_application/properties/envelope_metadata/properties/requested_account_ref:anyOf` | s2676–s2677 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_cancelled_application/properties/envelope_metadata/properties/effective_account_ref:anyOf` | s2671–s2672 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_completed_project/properties/envelope_metadata/properties/actor_ref:type` | s2709–s2710 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_completed_project/properties/envelope_metadata/properties/actor_ref:lexical` | s2708 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_completed_project/properties/envelope_metadata/properties/correlation_id:type` | s2714–s2715 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_completed_project/properties/envelope_metadata/properties/correlation_id:lexical` | s2713 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_completed_project/properties/envelope_metadata/properties/causation_event_id:anyOf` | s2711–s2712 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_completed_project/properties/envelope_metadata/properties/parent_event_id:anyOf` | s2719–s2720 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_completed_project/properties/envelope_metadata/properties/requested_account_ref:anyOf` | s2721–s2722 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_completed_project/properties/envelope_metadata/properties/effective_account_ref:anyOf` | s2716–s2717 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_completed_application/properties/envelope_metadata/properties/actor_ref:type` | s2694–s2695 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_completed_application/properties/envelope_metadata/properties/actor_ref:lexical` | s2693 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_completed_application/properties/envelope_metadata/properties/correlation_id:type` | s2699–s2700 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_completed_application/properties/envelope_metadata/properties/correlation_id:lexical` | s2698 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_completed_application/properties/envelope_metadata/properties/causation_event_id:anyOf` | s2696–s2697 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_completed_application/properties/envelope_metadata/properties/parent_event_id:anyOf` | s2704–s2705 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_completed_application/properties/envelope_metadata/properties/requested_account_ref:anyOf` | s2706–s2707 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_completed_application/properties/envelope_metadata/properties/effective_account_ref:anyOf` | s2701–s2702 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_failed_project/properties/envelope_metadata/properties/actor_ref:type` | s2799–s2800 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_failed_project/properties/envelope_metadata/properties/actor_ref:lexical` | s2798 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_failed_project/properties/envelope_metadata/properties/correlation_id:type` | s2804–s2805 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_failed_project/properties/envelope_metadata/properties/correlation_id:lexical` | s2803 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_failed_project/properties/envelope_metadata/properties/causation_event_id:anyOf` | s2801–s2802 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_failed_project/properties/envelope_metadata/properties/parent_event_id:anyOf` | s2809–s2810 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_failed_project/properties/envelope_metadata/properties/requested_account_ref:anyOf` | s2811–s2812 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_failed_project/properties/envelope_metadata/properties/effective_account_ref:anyOf` | s2806–s2807 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_failed_application/properties/envelope_metadata/properties/actor_ref:type` | s2784–s2785 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_failed_application/properties/envelope_metadata/properties/actor_ref:lexical` | s2783 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_failed_application/properties/envelope_metadata/properties/correlation_id:type` | s2789–s2790 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_failed_application/properties/envelope_metadata/properties/correlation_id:lexical` | s2788 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_failed_application/properties/envelope_metadata/properties/causation_event_id:anyOf` | s2786–s2787 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_failed_application/properties/envelope_metadata/properties/parent_event_id:anyOf` | s2794–s2795 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_failed_application/properties/envelope_metadata/properties/requested_account_ref:anyOf` | s2796–s2797 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_failed_application/properties/envelope_metadata/properties/effective_account_ref:anyOf` | s2791–s2792 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_started_project/properties/envelope_metadata/properties/actor_ref:type` | s2889–s2890 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_started_project/properties/envelope_metadata/properties/actor_ref:lexical` | s2888 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_started_project/properties/envelope_metadata/properties/correlation_id:type` | s2894–s2895 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_started_project/properties/envelope_metadata/properties/correlation_id:lexical` | s2893 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_started_project/properties/envelope_metadata/properties/causation_event_id:anyOf` | s2891–s2892 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_started_project/properties/envelope_metadata/properties/parent_event_id:anyOf` | s2899–s2900 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_started_project/properties/envelope_metadata/properties/requested_account_ref:anyOf` | s2901–s2902 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_started_project/properties/envelope_metadata/properties/effective_account_ref:anyOf` | s2896–s2897 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_started_application/properties/envelope_metadata/properties/actor_ref:type` | s2874–s2875 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_started_application/properties/envelope_metadata/properties/actor_ref:lexical` | s2873 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_started_application/properties/envelope_metadata/properties/correlation_id:type` | s2879–s2880 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_started_application/properties/envelope_metadata/properties/correlation_id:lexical` | s2878 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_started_application/properties/envelope_metadata/properties/causation_event_id:anyOf` | s2876–s2877 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_started_application/properties/envelope_metadata/properties/parent_event_id:anyOf` | s2884–s2885 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_started_application/properties/envelope_metadata/properties/requested_account_ref:anyOf` | s2886–s2887 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_started_application/properties/envelope_metadata/properties/effective_account_ref:anyOf` | s2881–s2882 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_completed_project/properties/envelope_metadata/properties/actor_ref:type` | s2859–s2860, s3091–s3092 | S \ F (20304) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_completed_project/properties/envelope_metadata/properties/actor_ref:lexical` | s2858, s3090 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_completed_project/properties/envelope_metadata/properties/correlation_id:type` | s2864–s2865, s3096–s3097 | S \ F (20304) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_completed_project/properties/envelope_metadata/properties/correlation_id:lexical` | s2863, s3095 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_completed_project/properties/envelope_metadata/properties/causation_event_id:anyOf` | s2861–s2862, s3093–s3094 | S \ F (20304) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_completed_project/properties/envelope_metadata/properties/parent_event_id:anyOf` | s2869–s2870, s3101–s3102 | S \ F (20304) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_completed_project/properties/envelope_metadata/properties/requested_account_ref:anyOf` | s2871–s2872, s3103–s3104 | S \ F (20304) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_completed_project/properties/envelope_metadata/properties/effective_account_ref:anyOf` | s2866–s2867, s3098–s3099 | S \ F (20304) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_completed_application/properties/envelope_metadata/properties/actor_ref:type` | s2844–s2845, s3076–s3077 | S \ F (20304) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_completed_application/properties/envelope_metadata/properties/actor_ref:lexical` | s2843, s3075 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_completed_application/properties/envelope_metadata/properties/correlation_id:type` | s2849–s2850, s3081–s3082 | S \ F (20304) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_completed_application/properties/envelope_metadata/properties/correlation_id:lexical` | s2848, s3080 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_completed_application/properties/envelope_metadata/properties/causation_event_id:anyOf` | s2846–s2847, s3078–s3079 | S \ F (20304) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_completed_application/properties/envelope_metadata/properties/parent_event_id:anyOf` | s2854–s2855, s3086–s3087 | S \ F (20304) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_completed_application/properties/envelope_metadata/properties/requested_account_ref:anyOf` | s2856–s2857, s3088–s3089 | S \ F (20304) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_completed_application/properties/envelope_metadata/properties/effective_account_ref:anyOf` | s2851–s2852, s3083–s3084 | S \ F (20304) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_message_added_project/properties/envelope_metadata/properties/actor_ref:type` | s2829–s2830 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_message_added_project/properties/envelope_metadata/properties/actor_ref:lexical` | s2828 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_message_added_project/properties/envelope_metadata/properties/correlation_id:type` | s2834–s2835 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_message_added_project/properties/envelope_metadata/properties/correlation_id:lexical` | s2833 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_message_added_project/properties/envelope_metadata/properties/causation_event_id:anyOf` | s2831–s2832 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_message_added_project/properties/envelope_metadata/properties/parent_event_id:anyOf` | s2839–s2840 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_message_added_project/properties/envelope_metadata/properties/requested_account_ref:anyOf` | s2841–s2842 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_message_added_project/properties/envelope_metadata/properties/effective_account_ref:anyOf` | s2836–s2837 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_message_added_application/properties/envelope_metadata/properties/actor_ref:type` | s2814–s2815 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_message_added_application/properties/envelope_metadata/properties/actor_ref:lexical` | s2813 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_message_added_application/properties/envelope_metadata/properties/correlation_id:type` | s2819–s2820 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_message_added_application/properties/envelope_metadata/properties/correlation_id:lexical` | s2818 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_message_added_application/properties/envelope_metadata/properties/causation_event_id:anyOf` | s2816–s2817 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_message_added_application/properties/envelope_metadata/properties/parent_event_id:anyOf` | s2824–s2825 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_message_added_application/properties/envelope_metadata/properties/requested_account_ref:anyOf` | s2826–s2827 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_message_added_application/properties/envelope_metadata/properties/effective_account_ref:anyOf` | s2821–s2822 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_artifact_added_project/properties/envelope_metadata/properties/actor_ref:type` | s2649–s2650 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_artifact_added_project/properties/envelope_metadata/properties/actor_ref:lexical` | s2648 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_artifact_added_project/properties/envelope_metadata/properties/correlation_id:type` | s2654–s2655 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_artifact_added_project/properties/envelope_metadata/properties/correlation_id:lexical` | s2653 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_artifact_added_project/properties/envelope_metadata/properties/causation_event_id:anyOf` | s2651–s2652 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_artifact_added_project/properties/envelope_metadata/properties/parent_event_id:anyOf` | s2659–s2660 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_artifact_added_project/properties/envelope_metadata/properties/requested_account_ref:anyOf` | s2661–s2662 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_artifact_added_project/properties/envelope_metadata/properties/effective_account_ref:anyOf` | s2656–s2657 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_artifact_added_application/properties/envelope_metadata/properties/actor_ref:type` | s2634–s2635 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_artifact_added_application/properties/envelope_metadata/properties/actor_ref:lexical` | s2633 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_artifact_added_application/properties/envelope_metadata/properties/correlation_id:type` | s2639–s2640 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_artifact_added_application/properties/envelope_metadata/properties/correlation_id:lexical` | s2638 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_artifact_added_application/properties/envelope_metadata/properties/causation_event_id:anyOf` | s2636–s2637 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_artifact_added_application/properties/envelope_metadata/properties/parent_event_id:anyOf` | s2644–s2645 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_artifact_added_application/properties/envelope_metadata/properties/requested_account_ref:anyOf` | s2646–s2647 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_artifact_added_application/properties/envelope_metadata/properties/effective_account_ref:anyOf` | s2641–s2642 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_configuration_changed_project/properties/envelope_metadata/properties/actor_ref:type` | s2739–s2740 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_configuration_changed_project/properties/envelope_metadata/properties/actor_ref:lexical` | s2738 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_configuration_changed_project/properties/envelope_metadata/properties/correlation_id:type` | s2744–s2745 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_configuration_changed_project/properties/envelope_metadata/properties/correlation_id:lexical` | s2743 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_configuration_changed_project/properties/envelope_metadata/properties/causation_event_id:anyOf` | s2741–s2742 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_configuration_changed_project/properties/envelope_metadata/properties/parent_event_id:anyOf` | s2749–s2750 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_configuration_changed_project/properties/envelope_metadata/properties/requested_account_ref:anyOf` | s2751–s2752 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_configuration_changed_project/properties/envelope_metadata/properties/effective_account_ref:anyOf` | s2746–s2747 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_configuration_changed_application/properties/envelope_metadata/properties/actor_ref:type` | s2724–s2725 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_configuration_changed_application/properties/envelope_metadata/properties/actor_ref:lexical` | s2723 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_configuration_changed_application/properties/envelope_metadata/properties/correlation_id:type` | s2729–s2730 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_configuration_changed_application/properties/envelope_metadata/properties/correlation_id:lexical` | s2728 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_configuration_changed_application/properties/envelope_metadata/properties/causation_event_id:anyOf` | s2726–s2727 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_configuration_changed_application/properties/envelope_metadata/properties/parent_event_id:anyOf` | s2734–s2735 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_configuration_changed_application/properties/envelope_metadata/properties/requested_account_ref:anyOf` | s2736–s2737 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_configuration_changed_application/properties/envelope_metadata/properties/effective_account_ref:anyOf` | s2731–s2732 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_proposal_added_project/properties/envelope_metadata/properties/actor_ref:type` | s2568–s2569 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_proposal_added_project/properties/envelope_metadata/properties/actor_ref:lexical` | s2567 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_proposal_added_project/properties/envelope_metadata/properties/correlation_id:type` | s2573–s2574 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_proposal_added_project/properties/envelope_metadata/properties/correlation_id:lexical` | s2572 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_proposal_added_project/properties/envelope_metadata/properties/causation_event_id:anyOf` | s2570–s2571 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_proposal_added_project/properties/envelope_metadata/properties/parent_event_id:anyOf` | s2578–s2579 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_proposal_added_project/properties/envelope_metadata/properties/requested_account_ref:anyOf` | s2580–s2581 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_proposal_added_project/properties/envelope_metadata/properties/effective_account_ref:anyOf` | s2575–s2576 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_proposal_added_application/properties/envelope_metadata/properties/actor_ref:type` | s2546–s2547 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_proposal_added_application/properties/envelope_metadata/properties/actor_ref:lexical` | s2545 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_proposal_added_application/properties/envelope_metadata/properties/correlation_id:type` | s2551–s2552 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_proposal_added_application/properties/envelope_metadata/properties/correlation_id:lexical` | s2550 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_proposal_added_application/properties/envelope_metadata/properties/causation_event_id:anyOf` | s2548–s2549 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_proposal_added_application/properties/envelope_metadata/properties/parent_event_id:anyOf` | s2556–s2557 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_proposal_added_application/properties/envelope_metadata/properties/requested_account_ref:anyOf` | s2558–s2559 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_proposal_added_application/properties/envelope_metadata/properties/effective_account_ref:anyOf` | s2553–s2554 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_vote_added_project/properties/envelope_metadata/properties/actor_ref:type` | s2612–s2613 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_vote_added_project/properties/envelope_metadata/properties/actor_ref:lexical` | s2611 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_vote_added_project/properties/envelope_metadata/properties/correlation_id:type` | s2617–s2618 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_vote_added_project/properties/envelope_metadata/properties/correlation_id:lexical` | s2616 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_vote_added_project/properties/envelope_metadata/properties/causation_event_id:anyOf` | s2614–s2615 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_vote_added_project/properties/envelope_metadata/properties/parent_event_id:anyOf` | s2622–s2623 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_vote_added_project/properties/envelope_metadata/properties/requested_account_ref:anyOf` | s2624–s2625 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_vote_added_project/properties/envelope_metadata/properties/effective_account_ref:anyOf` | s2619–s2620 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_vote_added_application/properties/envelope_metadata/properties/actor_ref:type` | s2590–s2591 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_vote_added_application/properties/envelope_metadata/properties/actor_ref:lexical` | s2589 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_vote_added_application/properties/envelope_metadata/properties/correlation_id:type` | s2595–s2596 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_vote_added_application/properties/envelope_metadata/properties/correlation_id:lexical` | s2594 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_vote_added_application/properties/envelope_metadata/properties/causation_event_id:anyOf` | s2592–s2593 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_vote_added_application/properties/envelope_metadata/properties/parent_event_id:anyOf` | s2600–s2601 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_vote_added_application/properties/envelope_metadata/properties/requested_account_ref:anyOf` | s2602–s2603 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_vote_added_application/properties/envelope_metadata/properties/effective_account_ref:anyOf` | s2597–s2598 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_plan_synthesized_project/properties/envelope_metadata/properties/actor_ref:type` | s2531–s2532 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_plan_synthesized_project/properties/envelope_metadata/properties/actor_ref:lexical` | s2530 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_plan_synthesized_project/properties/envelope_metadata/properties/correlation_id:type` | s2536–s2537 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_plan_synthesized_project/properties/envelope_metadata/properties/correlation_id:lexical` | s2535 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_plan_synthesized_project/properties/envelope_metadata/properties/causation_event_id:anyOf` | s2533–s2534 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_plan_synthesized_project/properties/envelope_metadata/properties/parent_event_id:anyOf` | s2541–s2542 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_plan_synthesized_project/properties/envelope_metadata/properties/requested_account_ref:anyOf` | s2543–s2544 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_plan_synthesized_project/properties/envelope_metadata/properties/effective_account_ref:anyOf` | s2538–s2539 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_plan_synthesized_application/properties/envelope_metadata/properties/actor_ref:type` | s2516–s2517 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_plan_synthesized_application/properties/envelope_metadata/properties/actor_ref:lexical` | s2515 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_plan_synthesized_application/properties/envelope_metadata/properties/correlation_id:type` | s2521–s2522 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_plan_synthesized_application/properties/envelope_metadata/properties/correlation_id:lexical` | s2520 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_plan_synthesized_application/properties/envelope_metadata/properties/causation_event_id:anyOf` | s2518–s2519 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_plan_synthesized_application/properties/envelope_metadata/properties/parent_event_id:anyOf` | s2526–s2527 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_plan_synthesized_application/properties/envelope_metadata/properties/requested_account_ref:anyOf` | s2528–s2529 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_plan_synthesized_application/properties/envelope_metadata/properties/effective_account_ref:anyOf` | s2523–s2524 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_added_project/properties/envelope_metadata/properties/actor_ref:type` | s3151–s3152 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_added_project/properties/envelope_metadata/properties/actor_ref:lexical` | s3150 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_added_project/properties/envelope_metadata/properties/correlation_id:type` | s3156–s3157 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_added_project/properties/envelope_metadata/properties/correlation_id:lexical` | s3155 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_added_project/properties/envelope_metadata/properties/causation_event_id:anyOf` | s3153–s3154 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_added_project/properties/envelope_metadata/properties/parent_event_id:anyOf` | s3161–s3162 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_added_project/properties/envelope_metadata/properties/requested_account_ref:anyOf` | s3163–s3164 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_added_project/properties/envelope_metadata/properties/effective_account_ref:anyOf` | s3158–s3159 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_added_application/properties/envelope_metadata/properties/actor_ref:type` | s3136–s3137 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_added_application/properties/envelope_metadata/properties/actor_ref:lexical` | s3135 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_added_application/properties/envelope_metadata/properties/correlation_id:type` | s3141–s3142 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_added_application/properties/envelope_metadata/properties/correlation_id:lexical` | s3140 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_added_application/properties/envelope_metadata/properties/causation_event_id:anyOf` | s3138–s3139 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_added_application/properties/envelope_metadata/properties/parent_event_id:anyOf` | s3146–s3147 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_added_application/properties/envelope_metadata/properties/requested_account_ref:anyOf` | s3148–s3149 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_added_application/properties/envelope_metadata/properties/effective_account_ref:anyOf` | s3143–s3144 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_dispositioned_project/properties/envelope_metadata/properties/actor_ref:type` | s3181–s3182 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_dispositioned_project/properties/envelope_metadata/properties/actor_ref:lexical` | s3180 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_dispositioned_project/properties/envelope_metadata/properties/correlation_id:type` | s3186–s3187 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_dispositioned_project/properties/envelope_metadata/properties/correlation_id:lexical` | s3185 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_dispositioned_project/properties/envelope_metadata/properties/causation_event_id:anyOf` | s3183–s3184 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_dispositioned_project/properties/envelope_metadata/properties/parent_event_id:anyOf` | s3191–s3192 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_dispositioned_project/properties/envelope_metadata/properties/requested_account_ref:anyOf` | s3193–s3194 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_dispositioned_project/properties/envelope_metadata/properties/effective_account_ref:anyOf` | s3188–s3189 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_dispositioned_application/properties/envelope_metadata/properties/actor_ref:type` | s3166–s3167 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_dispositioned_application/properties/envelope_metadata/properties/actor_ref:lexical` | s3165 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_dispositioned_application/properties/envelope_metadata/properties/correlation_id:type` | s3171–s3172 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_dispositioned_application/properties/envelope_metadata/properties/correlation_id:lexical` | s3170 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_dispositioned_application/properties/envelope_metadata/properties/causation_event_id:anyOf` | s3168–s3169 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_dispositioned_application/properties/envelope_metadata/properties/parent_event_id:anyOf` | s3176–s3177 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_dispositioned_application/properties/envelope_metadata/properties/requested_account_ref:anyOf` | s3178–s3179 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_dispositioned_application/properties/envelope_metadata/properties/effective_account_ref:anyOf` | s3173–s3174 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_artifact_finalized_project/properties/envelope_metadata/properties/actor_ref:type` | s3121–s3122 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_artifact_finalized_project/properties/envelope_metadata/properties/actor_ref:lexical` | s3120 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_artifact_finalized_project/properties/envelope_metadata/properties/correlation_id:type` | s3126–s3127 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_artifact_finalized_project/properties/envelope_metadata/properties/correlation_id:lexical` | s3125 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_artifact_finalized_project/properties/envelope_metadata/properties/causation_event_id:anyOf` | s3123–s3124 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_artifact_finalized_project/properties/envelope_metadata/properties/parent_event_id:anyOf` | s3131–s3132 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_artifact_finalized_project/properties/envelope_metadata/properties/requested_account_ref:anyOf` | s3133–s3134 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_artifact_finalized_project/properties/envelope_metadata/properties/effective_account_ref:anyOf` | s3128–s3129 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_artifact_finalized_application/properties/envelope_metadata/properties/actor_ref:type` | s3106–s3107 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_artifact_finalized_application/properties/envelope_metadata/properties/actor_ref:lexical` | s3105 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_artifact_finalized_application/properties/envelope_metadata/properties/correlation_id:type` | s3111–s3112 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_artifact_finalized_application/properties/envelope_metadata/properties/correlation_id:lexical` | s3110 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_artifact_finalized_application/properties/envelope_metadata/properties/causation_event_id:anyOf` | s3108–s3109 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_artifact_finalized_application/properties/envelope_metadata/properties/parent_event_id:anyOf` | s3116–s3117 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_artifact_finalized_application/properties/envelope_metadata/properties/requested_account_ref:anyOf` | s3118–s3119 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_artifact_finalized_application/properties/envelope_metadata/properties/effective_account_ref:anyOf` | s3113–s3114 | S \ F (20306) |
| `schema:Plans/collaborative_workflows_contracts.schema.json#/$defs/ReviewTargetPack/properties/schema_id:const` | s3015–s3017, s3056–s3058 | S \ F (20302) |
| `schema:Plans/collaborative_workflows_contracts.schema.json#/$defs/ReviewTargetPack/properties/schema_version:const` | s3018–s3020, s3059–s3061 | S \ F (20302) |
| `schema:Plans/collaborative_workflows_contracts.schema.json#/$defs/non_empty_string:type;Plans/collaborative_workflows_contracts.schema.json#/$defs/ParticipantSpec/properties/requested_provider_id:oneOf_exclusivity;Plans/collaborative_workflows_contracts.schema.json#/$defs/ParticipantSpec/properties/requested_account_id:oneOf_exclusivity;Plans/collaborative_workflows_contracts.schema.json#/$defs/ParticipantSpec/properties/requested_model_id:oneOf_exclusivity;Plans/collaborative_workflows_contracts.schema.json#/$defs/ParticipantSpec/properties/requested_persona_id/allOf/0:oneOf_exclusivity;Plans/collaborative_workflows_contracts.schema.json#/$defs/ParticipantSpec/properties/requested_tool_profile_id:oneOf_exclusivity;Plans/collaborative_workflows_contracts.schema.json#/$defs/CollaborativeRun/properties/parent_run_id:oneOf_exclusivity;Plans/collaborative_workflows_contracts.schema.json#/$defs/CollaborativeRun/properties/assistant_plan_id:oneOf_exclusivity;Plans/collaborative_workflows_contracts.schema.json#/$defs/CollaborativeRun/properties/goal_id:oneOf_exclusivity;Plans/collaborative_workflows_contracts.schema.json#/$defs/CollaborativeRun/properties/coordinator_run_ref:oneOf_exclusivity;Plans/collaborative_workflows_contracts.schema.json#/$defs/CollaborationMessage/properties/reply_to:oneOf_exclusivity;Plans/collaborative_workflows_contracts.schema.json#/$defs/ReviewFinding/properties/proposed_remediation:oneOf_exclusivity;Plans/collaborative_workflows_contracts.schema.json#/$defs/ParticipantDisposition/properties/attempt_id:oneOf_exclusivity;Plans/collaborative_workflows_contracts.schema.json#/$defs/ParticipantDisposition/properties/effective_identity:oneOf_exclusivity;Plans/collaborative_workflows_contracts.schema.json#/$defs/preset_row/properties/requested_model_id:oneOf_exclusivity;Plans/collaborative_workflows_contracts.schema.json#/$defs/preset_row/properties/requested_persona_id/allOf/0:oneOf_exclusivity;Plans/collaborative_workflows_contracts.schema.json#/$defs/CollaborationConfigureRequest/properties/causation_id:oneOf_exclusivity;Plans/collaborative_workflows_contracts.schema.json#/$defs/CollaborationConfigureRequest/properties/seed_definition_ref:oneOf_exclusivity;Plans/collaborative_workflows_contracts.schema.json#/$defs/CollaborationConfigureResult/properties/observable_work_ref:oneOf_exclusivity;Plans/collaborative_workflows_contracts.schema.json#/$defs/CollaborationConfigureResult/properties/replay_of:oneOf_exclusivity;Plans/collaborative_workflows_contracts.schema.json#/$defs/CollaborationConfigureResult/properties/collaboration_id:oneOf_exclusivity;Plans/collaborative_workflows_contracts.schema.json#/$defs/CollaborationStartRequest/properties/causation_id:oneOf_exclusivity;Plans/collaborative_workflows_contracts.schema.json#/$defs/CollaborationStartResult/properties/observable_work_ref:oneOf_exclusivity;Plans/collaborative_workflows_contracts.schema.json#/$defs/CollaborationStartResult/properties/replay_of:oneOf_exclusivity;Plans/collaborative_workflows_contracts.schema.json#/$defs/CollaborationStartResult/properties/collaboration_run_id:oneOf_exclusivity;Plans/collaborative_workflows_contracts.schema.json#/$defs/CollaborationStartResult/properties/requested_effective_snapshot_ref:oneOf_exclusivity;Plans/collaborative_workflows_contracts.schema.json#/$defs/CollaborationPauseRequest/properties/causation_id:oneOf_exclusivity;Plans/collaborative_workflows_contracts.schema.json#/$defs/CollaborationPauseResult/properties/observable_work_ref:oneOf_exclusivity;Plans/collaborative_workflows_contracts.schema.json#/$defs/CollaborationPauseResult/properties/replay_of:oneOf_exclusivity;Plans/collaborative_workflows_contracts.schema.json#/$defs/CollaborationResumeRequest/properties/causation_id:oneOf_exclusivity;Plans/collaborative_workflows_contracts.schema.json#/$defs/CollaborationResumeResult/properties/observable_work_ref:oneOf_exclusivity;Plans/collaborative_workflows_contracts.schema.json#/$defs/CollaborationResumeResult/properties/replay_of:oneOf_exclusivity;Plans/collaborative_workflows_contracts.schema.json#/$defs/CollaborationCancelRequest/properties/causation_id:oneOf_exclusivity;Plans/collaborative_workflows_contracts.schema.json#/$defs/CollaborationCancelResult/properties/observable_work_ref:oneOf_exclusivity;Plans/collaborative_workflows_contracts.schema.json#/$defs/CollaborationCancelResult/properties/replay_of:oneOf_exclusivity;Plans/collaborative_workflows_contracts.schema.json#/$defs/CollaborationMessageRequest/properties/causation_id:oneOf_exclusivity;Plans/collaborative_workflows_contracts.schema.json#/$defs/CollaborationMessageRequest/properties/reply_to:oneOf_exclusivity;Plans/collaborative_workflows_contracts.schema.json#/$defs/CollaborationMessageResult/properties/observable_work_ref:oneOf_exclusivity;Plans/collaborative_workflows_contracts.schema.json#/$defs/CollaborationMessageResult/properties/replay_of:oneOf_exclusivity;Plans/collaborative_workflows_contracts.schema.json#/$defs/CollaborationMessageResult/properties/collaboration_message_id:oneOf_exclusivity;Plans/collaborative_workflows_contracts.schema.json#/$defs/CollaborationExportRequest/properties/causation_id:oneOf_exclusivity;Plans/collaborative_workflows_contracts.schema.json#/$defs/CollaborationExportResult/properties/observable_work_ref:oneOf_exclusivity;Plans/collaborative_workflows_contracts.schema.json#/$defs/CollaborationExportResult/properties/replay_of:oneOf_exclusivity;Plans/collaborative_workflows_contracts.schema.json#/$defs/CollaborationExportResult/properties/export_ref:oneOf_exclusivity;Plans/collaborative_workflows_contracts.schema.json#/$defs/CollaborationReconfigureRequest/properties/causation_id:oneOf_exclusivity;Plans/collaborative_workflows_contracts.schema.json#/$defs/CollaborationReconfigureResult/properties/observable_work_ref:oneOf_exclusivity;Plans/collaborative_workflows_contracts.schema.json#/$defs/CollaborationReconfigureResult/properties/replay_of:oneOf_exclusivity;Plans/collaborative_workflows_contracts.schema.json#/$defs/CollaborationReconfigureResult/properties/system_message_id:oneOf_exclusivity;Plans/collaborative_workflows_contracts.schema.json#/$defs/BrainstormRoundRequest/properties/causation_id:oneOf_exclusivity;Plans/collaborative_workflows_contracts.schema.json#/$defs/BrainstormRoundResult/properties/observable_work_ref:oneOf_exclusivity;Plans/collaborative_workflows_contracts.schema.json#/$defs/BrainstormRoundResult/properties/replay_of:oneOf_exclusivity;Plans/collaborative_workflows_contracts.schema.json#/$defs/BrainstormSynthesisRequest/properties/causation_id:oneOf_exclusivity;Plans/collaborative_workflows_contracts.schema.json#/$defs/AssistantPlanCreateResult/properties/observable_work_ref:oneOf_exclusivity;Plans/collaborative_workflows_contracts.schema.json#/$defs/AssistantPlanCreateResult/properties/replay_of:oneOf_exclusivity;Plans/collaborative_workflows_contracts.schema.json#/$defs/AssistantPlanCreateResult/properties/assistant_plan_id:oneOf_exclusivity;Plans/collaborative_workflows_contracts.schema.json#/$defs/BrainstormLeadResearchRequest/properties/causation_id:oneOf_exclusivity;Plans/collaborative_workflows_contracts.schema.json#/$defs/BrainstormLeadResearchResult/properties/observable_work_ref:oneOf_exclusivity;Plans/collaborative_workflows_contracts.schema.json#/$defs/BrainstormLeadResearchResult/properties/replay_of:oneOf_exclusivity;Plans/collaborative_workflows_contracts.schema.json#/$defs/ReviewCreateTodosRequest/properties/causation_id:oneOf_exclusivity;Plans/collaborative_workflows_contracts.schema.json#/$defs/ReviewCreateTodosResult/properties/observable_work_ref:oneOf_exclusivity;Plans/collaborative_workflows_contracts.schema.json#/$defs/ReviewCreateTodosResult/properties/replay_of:oneOf_exclusivity;Plans/collaborative_workflows_contracts.schema.json#/$defs/ReviewSendFindingsRequest/properties/causation_id:oneOf_exclusivity;Plans/collaborative_workflows_contracts.schema.json#/$defs/ComposerBufferResult/properties/observable_work_ref:oneOf_exclusivity;Plans/collaborative_workflows_contracts.schema.json#/$defs/ComposerBufferResult/properties/replay_of:oneOf_exclusivity;Plans/collaborative_workflows_contracts.schema.json#/$defs/ComposerBufferResult/properties/composer_buffer_ref:oneOf_exclusivity;Plans/collaborative_workflows_contracts.schema.json#/$defs/ReviewRunAgainRequest/properties/causation_id:oneOf_exclusivity;Plans/collaborative_workflows_contracts.schema.json#/$defs/ChatRoomRoundRequest/properties/causation_id:oneOf_exclusivity;Plans/collaborative_workflows_contracts.schema.json#/$defs/ChatRoomRoundResult/properties/observable_work_ref:oneOf_exclusivity;Plans/collaborative_workflows_contracts.schema.json#/$defs/ChatRoomRoundResult/properties/replay_of:oneOf_exclusivity;Plans/collaborative_workflows_contracts.schema.json#/$defs/ChatRoomSummarizeRequest/properties/causation_id:oneOf_exclusivity;Plans/collaborative_workflows_contracts.schema.json#/$defs/ArtifactResult/properties/observable_work_ref:oneOf_exclusivity;Plans/collaborative_workflows_contracts.schema.json#/$defs/ArtifactResult/properties/replay_of:oneOf_exclusivity;Plans/collaborative_workflows_contracts.schema.json#/$defs/ArtifactResult/properties/artifact_ref:oneOf_exclusivity;Plans/collaborative_workflows_contracts.schema.json#/$defs/ChatRoomPromotePlanRequest/properties/causation_id:oneOf_exclusivity;Plans/collaborative_workflows_contracts.schema.json#/$defs/ChatRoomPromotePlanResult/properties/observable_work_ref:oneOf_exclusivity;Plans/collaborative_workflows_contracts.schema.json#/$defs/ChatRoomPromotePlanResult/properties/replay_of:oneOf_exclusivity;Plans/collaborative_workflows_contracts.schema.json#/$defs/ChatRoomPromotePlanResult/properties/assistant_plan_id:oneOf_exclusivity;Plans/collaborative_workflows_contracts.schema.json#/$defs/ChatRoomPromotePlanResult/properties/owner_reason:oneOf_exclusivity;Plans/collaborative_workflows_contracts.schema.json#/$defs/ChatRoomPromoteTodoRequest/properties/causation_id:oneOf_exclusivity;Plans/collaborative_workflows_contracts.schema.json#/$defs/ChatRoomPromoteTodoResult/properties/observable_work_ref:oneOf_exclusivity;Plans/collaborative_workflows_contracts.schema.json#/$defs/ChatRoomPromoteTodoResult/properties/replay_of:oneOf_exclusivity;Plans/collaborative_workflows_contracts.schema.json#/$defs/ChatRoomPromoteTodoResult/properties/todo_ref:oneOf_exclusivity;Plans/collaborative_workflows_contracts.schema.json#/$defs/ChatRoomPromoteTodoResult/properties/owner_reason:oneOf_exclusivity;Plans/collaborative_workflows_contracts.schema.json#/$defs/ChatRoomPromoteGoalRequest/properties/causation_id:oneOf_exclusivity;Plans/collaborative_workflows_contracts.schema.json#/$defs/ChatRoomPromoteGoalResult/properties/observable_work_ref:oneOf_exclusivity;Plans/collaborative_workflows_contracts.schema.json#/$defs/ChatRoomPromoteGoalResult/properties/replay_of:oneOf_exclusivity;Plans/collaborative_workflows_contracts.schema.json#/$defs/ChatRoomPromoteGoalResult/properties/goal_id:oneOf_exclusivity;Plans/collaborative_workflows_contracts.schema.json#/$defs/ChatRoomPromoteGoalResult/properties/owner_reason:oneOf_exclusivity;Plans/collaborative_workflows_contracts.schema.json#/$defs/ChatRoomEndRequest/properties/causation_id:oneOf_exclusivity;Plans/collaborative_workflows_contracts.schema.json#/$defs/ChatRoomEndResult/properties/observable_work_ref:oneOf_exclusivity;Plans/collaborative_workflows_contracts.schema.json#/$defs/ChatRoomEndResult/properties/replay_of:oneOf_exclusivity;Plans/collaborative_workflows_contracts.schema.json#/$defs/CrewAutoSetRequest/properties/causation_id:oneOf_exclusivity;Plans/collaborative_workflows_contracts.schema.json#/$defs/CrewAutoSetResult/properties/observable_work_ref:oneOf_exclusivity;Plans/collaborative_workflows_contracts.schema.json#/$defs/CrewAutoSetResult/properties/replay_of:oneOf_exclusivity;Plans/collaborative_workflows_contracts.schema.json#/$defs/CrewAutoSetResult/properties/settings_transaction_ref:oneOf_exclusivity;Plans/collaborative_workflows_contracts.schema.json#/$defs/WondererPass/properties/requested_by:oneOf_exclusivity;Plans/collaborative_workflows_contracts.schema.json#/$defs/WondererLead/properties/disposed_by:oneOf_exclusivity;Plans/collaborative_workflows_contracts.schema.json#/$defs/CollaborationLeadResearchRequest/properties/causation_id:oneOf_exclusivity;Plans/collaborative_workflows_contracts.schema.json#/$defs/CollaborationLeadResearchResult/properties/observable_work_ref:oneOf_exclusivity;Plans/collaborative_workflows_contracts.schema.json#/$defs/CollaborationLeadResearchResult/properties/replay_of:oneOf_exclusivity` | s3013–s3014, s3054–s3055 | S \ F (20304) |
| `schema:Plans/collaborative_workflows_contracts.schema.json#/$defs/review_target_kind:enum` | s3024–s3026, s3065–s3067 | S \ F (20302) |
| `schema:Plans/collaborative_workflows_contracts.schema.json#/$defs/ReviewTargetPack/properties/target_refs:type` | s3027–s3028, s3068–s3069 | S \ F (20304) |
| `schema:Plans/collaborative_workflows_contracts.schema.json#/$defs/ReviewTargetPack/properties/target_refs:minItems` | s3029, s3070 | S \ F (20306) |
| `schema:Plans/collaborative_workflows_contracts.schema.json#/$defs/ReviewTargetPack/properties/target_hashes:type` | s3021–s3022, s3062–s3063 | S \ F (20304) |
| `schema:Plans/collaborative_workflows_contracts.schema.json#/$defs/ReviewTargetPack/properties/target_hashes:minItems` | s3023, s3064 | S \ F (20306) |
| `schema:Plans/collaborative_workflows_contracts.schema.json#/$defs/ReviewTargetPack/properties/user_constraint_refs:type` | s3032–s3033, s3073–s3074 | S \ F (20304) |
| `schema:Plans/collaborative_workflows_contracts.schema.json#/$defs/ReviewTargetPack/properties/acceptance_refs:type` | s3008–s3009, s3049–s3050 | S \ F (20304) |
| `schema:Plans/collaborative_workflows_contracts.schema.json#/$defs/ReviewTargetPack/properties/test_build_evidence_refs:type` | s3030–s3031, s3071–s3072 | S \ F (20304) |
| `schema:Plans/collaborative_workflows_contracts.schema.json#/$defs/utc_timestamp:type;Plans/collaborative_workflows_contracts.schema.json#/$defs/CollaborativeRun/properties/completed_at:oneOf_exclusivity` | s3010–s3011, s3051–s3052 | S \ F (20304) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized/allOf/1/then/properties/requested_reviewer_count:minimum` | s4873 | S \ F (20307) |
| `schema:Plans/collaboration_event_payloads.schema.json#/$defs/review_artifact_finalized_application/allOf/1/then/properties/requested_reviewer_count:minimum` | s5018 | S \ F (20307) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/run_projection:required:required_slot_ids` | s16624 | S \ F (20307) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/run_projection/properties/required_slot_ids:type` | s16621, s16625–s16628 | S \ F (20303) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/run_projection/properties/required_slot_ids:uniqueItems` | s16622 | S \ F (20307) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/definition_projection:required:required_slot_ids` | s16616 | S \ F (20307) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/definition_projection/properties/required_slot_ids:type` | s16613, s16617–s16620 | S \ F (20303) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/definition_projection/properties/required_slot_ids:uniqueItems` | s16614 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_created_project/properties/slot_requirements/items:required:slot_id` | s19748 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_created_project/properties/slot_requirements/items/properties/required:type` | s19737–s19739, s19741–s19744 | S \ F (20301) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_created_project/properties/slot_requirements/items:required:required` | s19740 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_created_project/properties/slot_requirements/items:additionalProperties` | s19736 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_created_application/properties/slot_requirements/items:required:slot_id` | s19733 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_created_application/properties/slot_requirements/items/properties/required:type` | s19722–s19724, s19726–s19729 | S \ F (20301) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_created_application/properties/slot_requirements/items:required:required` | s19725 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_created_application/properties/slot_requirements/items:additionalProperties` | s19721 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_started_project/properties/slot_requirements/items:required:slot_id` | s19958, s19988 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_started_project/properties/slot_requirements/items/properties/required:type` | s19947–s19949, s19951–s19954, s19977–s19979, s19981–s19984 | S \ F (20294) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_started_project/properties/slot_requirements/items:required:required` | s19950, s19980 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_started_project/properties/slot_requirements/items:additionalProperties` | s19946, s19976 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_started_application/properties/slot_requirements/items:required:slot_id` | s19943, s19973 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_started_application/properties/slot_requirements/items/properties/required:type` | s19932–s19934, s19936–s19939, s19962–s19964, s19966–s19969 | S \ F (20294) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_started_application/properties/slot_requirements/items:required:required` | s19935, s19965 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_started_application/properties/slot_requirements/items:additionalProperties` | s19931, s19961 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_paused_project/properties/slot_requirements/items:required:slot_id` | s19898 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_paused_project/properties/slot_requirements/items/properties/required:type` | s19887–s19889, s19891–s19894 | S \ F (20301) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_paused_project/properties/slot_requirements/items:required:required` | s19890 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_paused_project/properties/slot_requirements/items:additionalProperties` | s19886 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_paused_application/properties/slot_requirements/items:required:slot_id` | s19883 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_paused_application/properties/slot_requirements/items/properties/required:type` | s19872–s19874, s19876–s19879 | S \ F (20301) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_paused_application/properties/slot_requirements/items:required:required` | s19875 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_paused_application/properties/slot_requirements/items:additionalProperties` | s19871 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_resumed_project/properties/slot_requirements/items:required:slot_id` | s19928 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_resumed_project/properties/slot_requirements/items/properties/required:type` | s19917–s19919, s19921–s19924 | S \ F (20301) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_resumed_project/properties/slot_requirements/items:required:required` | s19920 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_resumed_project/properties/slot_requirements/items:additionalProperties` | s19916 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_resumed_application/properties/slot_requirements/items:required:slot_id` | s19913 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_resumed_application/properties/slot_requirements/items/properties/required:type` | s19902–s19904, s19906–s19909 | S \ F (20301) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_resumed_application/properties/slot_requirements/items:required:required` | s19905 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_resumed_application/properties/slot_requirements/items:additionalProperties` | s19901 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_cancelled_project/properties/slot_requirements/items:required:slot_id` | s19658 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_cancelled_project/properties/slot_requirements/items/properties/required:type` | s19647–s19649, s19651–s19654 | S \ F (20301) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_cancelled_project/properties/slot_requirements/items:required:required` | s19650 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_cancelled_project/properties/slot_requirements/items:additionalProperties` | s19646 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_cancelled_application/properties/slot_requirements/items:required:slot_id` | s19643 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_cancelled_application/properties/slot_requirements/items/properties/required:type` | s19632–s19634, s19636–s19639 | S \ F (20301) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_cancelled_application/properties/slot_requirements/items:required:required` | s19635 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_cancelled_application/properties/slot_requirements/items:additionalProperties` | s19631 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_completed_project/properties/slot_requirements/items:required:slot_id` | s19688 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_completed_project/properties/slot_requirements/items/properties/required:type` | s19677–s19679, s19681–s19684 | S \ F (20301) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_completed_project/properties/slot_requirements/items:required:required` | s19680 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_completed_project/properties/slot_requirements/items:additionalProperties` | s19676 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_completed_application/properties/slot_requirements/items:required:slot_id` | s19673 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_completed_application/properties/slot_requirements/items/properties/required:type` | s19662–s19664, s19666–s19669 | S \ F (20301) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_completed_application/properties/slot_requirements/items:required:required` | s19665 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_completed_application/properties/slot_requirements/items:additionalProperties` | s19661 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_failed_project/properties/slot_requirements/items:required:slot_id` | s19778 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_failed_project/properties/slot_requirements/items/properties/required:type` | s19767–s19769, s19771–s19774 | S \ F (20301) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_failed_project/properties/slot_requirements/items:required:required` | s19770 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_failed_project/properties/slot_requirements/items:additionalProperties` | s19766 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_failed_application/properties/slot_requirements/items:required:slot_id` | s19763 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_failed_application/properties/slot_requirements/items/properties/required:type` | s19752–s19754, s19756–s19759 | S \ F (20301) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_failed_application/properties/slot_requirements/items:required:required` | s19755 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_failed_application/properties/slot_requirements/items:additionalProperties` | s19751 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_started_project/properties/slot_requirements/items:required:slot_id` | s19868 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_started_project/properties/slot_requirements/items/properties/required:type` | s19857–s19859, s19861–s19864 | S \ F (20301) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_started_project/properties/slot_requirements/items:required:required` | s19860 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_started_project/properties/slot_requirements/items:additionalProperties` | s19856 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_started_application/properties/slot_requirements/items:required:slot_id` | s19853 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_started_application/properties/slot_requirements/items/properties/required:type` | s19842–s19844, s19846–s19849 | S \ F (20301) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_started_application/properties/slot_requirements/items:required:required` | s19845 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_started_application/properties/slot_requirements/items:additionalProperties` | s19841 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_completed_project/properties/slot_requirements/items:required:slot_id` | s19838, s20018 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_completed_project/properties/slot_requirements/items/properties/required:type` | s19827–s19829, s19831–s19834, s20007–s20009, s20011–s20014 | S \ F (20294) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_completed_project/properties/slot_requirements/items:required:required` | s19830, s20010 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_completed_project/properties/slot_requirements/items:additionalProperties` | s19826, s20006 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_completed_application/properties/slot_requirements/items:required:slot_id` | s19823, s20003 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_completed_application/properties/slot_requirements/items/properties/required:type` | s19812–s19814, s19816–s19819, s19992–s19994, s19996–s19999 | S \ F (20294) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_completed_application/properties/slot_requirements/items:required:required` | s19815, s19995 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_participant_completed_application/properties/slot_requirements/items:additionalProperties` | s19811, s19991 | S \ F (20306) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_message_added_project/properties/slot_requirements/items:required:slot_id` | s19808 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_message_added_project/properties/slot_requirements/items/properties/required:type` | s19797–s19799, s19801–s19804 | S \ F (20301) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_message_added_project/properties/slot_requirements/items:required:required` | s19800 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_message_added_project/properties/slot_requirements/items:additionalProperties` | s19796 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_message_added_application/properties/slot_requirements/items:required:slot_id` | s19793 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_message_added_application/properties/slot_requirements/items/properties/required:type` | s19782–s19784, s19786–s19789 | S \ F (20301) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_message_added_application/properties/slot_requirements/items:required:required` | s19785 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_message_added_application/properties/slot_requirements/items:additionalProperties` | s19781 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_artifact_added_project/properties/slot_requirements/items:required:slot_id` | s19628 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_artifact_added_project/properties/slot_requirements/items/properties/required:type` | s19617–s19619, s19621–s19624 | S \ F (20301) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_artifact_added_project/properties/slot_requirements/items:required:required` | s19620 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_artifact_added_project/properties/slot_requirements/items:additionalProperties` | s19616 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_artifact_added_application/properties/slot_requirements/items:required:slot_id` | s19613 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_artifact_added_application/properties/slot_requirements/items/properties/required:type` | s19602–s19604, s19606–s19609 | S \ F (20301) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_artifact_added_application/properties/slot_requirements/items:required:required` | s19605 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_artifact_added_application/properties/slot_requirements/items:additionalProperties` | s19601 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_configuration_changed_project/properties/slot_requirements/items:required:slot_id` | s19718 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_configuration_changed_project/properties/slot_requirements/items/properties/required:type` | s19707–s19709, s19711–s19714 | S \ F (20301) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_configuration_changed_project/properties/slot_requirements/items:required:required` | s19710 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_configuration_changed_project/properties/slot_requirements/items:additionalProperties` | s19706 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_configuration_changed_application/properties/slot_requirements/items:required:slot_id` | s19703 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_configuration_changed_application/properties/slot_requirements/items/properties/required:type` | s19692–s19694, s19696–s19699 | S \ F (20301) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_configuration_changed_application/properties/slot_requirements/items:required:required` | s19695 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/collaboration_configuration_changed_application/properties/slot_requirements/items:additionalProperties` | s19691 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_proposal_added_project/properties/slot_requirements/items:required:slot_id` | s19568 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_proposal_added_project/properties/slot_requirements/items/properties/required:type` | s19557–s19559, s19561–s19564 | S \ F (20301) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_proposal_added_project/properties/slot_requirements/items:required:required` | s19560 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_proposal_added_project/properties/slot_requirements/items:additionalProperties` | s19556 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_proposal_added_application/properties/slot_requirements/items:required:slot_id` | s19553 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_proposal_added_application/properties/slot_requirements/items/properties/required:type` | s19542–s19544, s19546–s19549 | S \ F (20301) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_proposal_added_application/properties/slot_requirements/items:required:required` | s19545 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_proposal_added_application/properties/slot_requirements/items:additionalProperties` | s19541 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_vote_added_project/properties/slot_requirements/items:required:slot_id` | s19598 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_vote_added_project/properties/slot_requirements/items/properties/required:type` | s19587–s19589, s19591–s19594 | S \ F (20301) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_vote_added_project/properties/slot_requirements/items:required:required` | s19590 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_vote_added_project/properties/slot_requirements/items:additionalProperties` | s19586 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_vote_added_application/properties/slot_requirements/items:required:slot_id` | s19583 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_vote_added_application/properties/slot_requirements/items/properties/required:type` | s19572–s19574, s19576–s19579 | S \ F (20301) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_vote_added_application/properties/slot_requirements/items:required:required` | s19575 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_vote_added_application/properties/slot_requirements/items:additionalProperties` | s19571 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_plan_synthesized_project/properties/slot_requirements/items:required:slot_id` | s19538 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_plan_synthesized_project/properties/slot_requirements/items/properties/required:type` | s19527–s19529, s19531–s19534 | S \ F (20301) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_plan_synthesized_project/properties/slot_requirements/items:required:required` | s19530 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_plan_synthesized_project/properties/slot_requirements/items:additionalProperties` | s19526 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_plan_synthesized_application/properties/slot_requirements/items:required:slot_id` | s19523 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_plan_synthesized_application/properties/slot_requirements/items/properties/required:type` | s19512–s19514, s19516–s19519 | S \ F (20301) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_plan_synthesized_application/properties/slot_requirements/items:required:required` | s19515 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/brainstorm_plan_synthesized_application/properties/slot_requirements/items:additionalProperties` | s19511 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_added_project/properties/slot_requirements/items:required:slot_id` | s20078 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_added_project/properties/slot_requirements/items/properties/required:type` | s20067–s20069, s20071–s20074 | S \ F (20301) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_added_project/properties/slot_requirements/items:required:required` | s20070 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_added_project/properties/slot_requirements/items:additionalProperties` | s20066 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_added_application/properties/slot_requirements/items:required:slot_id` | s20063 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_added_application/properties/slot_requirements/items/properties/required:type` | s20052–s20054, s20056–s20059 | S \ F (20301) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_added_application/properties/slot_requirements/items:required:required` | s20055 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_added_application/properties/slot_requirements/items:additionalProperties` | s20051 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_dispositioned_project/properties/slot_requirements/items:required:slot_id` | s20108 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_dispositioned_project/properties/slot_requirements/items/properties/required:type` | s20097–s20099, s20101–s20104 | S \ F (20301) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_dispositioned_project/properties/slot_requirements/items:required:required` | s20100 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_dispositioned_project/properties/slot_requirements/items:additionalProperties` | s20096 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_dispositioned_application/properties/slot_requirements/items:required:slot_id` | s20093 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_dispositioned_application/properties/slot_requirements/items/properties/required:type` | s20082–s20084, s20086–s20089 | S \ F (20301) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_dispositioned_application/properties/slot_requirements/items:required:required` | s20085 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_finding_dispositioned_application/properties/slot_requirements/items:additionalProperties` | s20081 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_artifact_finalized_project/properties/slot_requirements/items:required:slot_id` | s20048 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_artifact_finalized_project/properties/slot_requirements/items/properties/required:type` | s20037–s20039, s20041–s20044 | S \ F (20301) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_artifact_finalized_project/properties/slot_requirements/items:required:required` | s20040 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_artifact_finalized_project/properties/slot_requirements/items:additionalProperties` | s20036 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_artifact_finalized_application/properties/slot_requirements/items:required:slot_id` | s20033 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_artifact_finalized_application/properties/slot_requirements/items/properties/required:type` | s20022–s20024, s20026–s20029 | S \ F (20301) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_artifact_finalized_application/properties/slot_requirements/items:required:required` | s20025 | S \ F (20307) |
| `schema:Plans/collaboration_prepared_sources.schema.json#/$defs/review_artifact_finalized_application/properties/slot_requirements/items:additionalProperties` | s20021 | S \ F (20307) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/durable_read_token:additionalProperties` | s371 | S \ F (20307) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/checkpoint/allOf/1/then/properties/filter_complete:const` | s271 | S \ F (20307) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/checkpoint/properties/admitted_event_types/items:enum` | s220–s237, s273–s290, s323–s340, s373–s391 | S \ F (20235) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/checkpoint/allOf/4/then/properties/index_through_sequence_id:type` | s272 | S \ F (20307) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/durable_read_token/properties/storage_instance_id:lexical` | s255, s308, s358, s409, s434 | S \ F (20303) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/durable_read_token/properties/checkpoint_key:lexical` | s239, s292, s342, s393, s418 | S \ F (20303) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/durable_read_token/properties/checkpoint_ref:lexical` | s240, s293, s343, s394, s419 | S \ F (20303) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/durable_read_token/properties/generation_id:lexical` | s243, s296, s346, s397, s422 | S \ F (20303) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/durable_read_token/properties/generation_anchor_sha256:lexical` | s242, s295, s345, s396, s421 | S \ F (20303) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/durable_read_token/properties/frontier_sha256:lexical` | s241, s294, s344, s395, s420 | S \ F (20303) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/durable_read_token/properties/index_dataset_name:lexical` | s244, s297, s347, s398, s423 | S \ F (20303) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/durable_read_token/properties/source_selection/properties/storage_instance_id:lexical` | s254, s307, s357, s408, s433 | S \ F (20303) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/durable_read_token/properties/source_selection/properties/current_ref:const` | s246, s299, s349, s400, s425 | S \ F (20303) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/durable_read_token/properties/source_selection/properties/current_bytes_sha256:lexical` | s245, s298, s348, s399, s424 | S \ F (20303) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/durable_read_token/properties/source_selection/properties/manifest_ref:const` | s250, s303, s353, s404, s429 | S \ F (20303) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/durable_read_token/properties/source_selection/properties/manifest_bytes_sha256:lexical` | s249, s302, s352, s403, s428 | S \ F (20303) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/durable_read_token/properties/source_selection/properties/manifest_survivor_prefix_sha256:lexical` | s251, s304, s354, s405, s430 | S \ F (20303) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/durable_read_token/properties/source_selection/properties/retained_inventory_sha256:lexical` | s252, s305, s355, s406, s431 | S \ F (20303) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/durable_read_token/properties/source_selection/properties/durable_watermarks_sha256:lexical` | s247, s300, s350, s401, s426 | S \ F (20303) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/durable_read_token/properties/source_selection/properties/excluded_ranges_sha256:lexical` | s248, s301, s351, s402, s427 | S \ F (20303) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/durable_read_token/properties/source_selection/properties/retired_inputs_sha256:lexical` | s253, s306, s356, s407, s432 | S \ F (20303) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/checkpoint_core/properties/schema_id:const` | s440 | S \ F (20307) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/checkpoint_core/properties/schema_version:const` | s441 | S \ F (20307) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/checkpoint_core/properties/storage_instance_id:lexical` | s447 | S \ F (20307) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/checkpoint_core/properties/scope_kind:enum` | s442 | S \ F (20307) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/checkpoint_core/allOf/5/then/properties/scope_partition:lexical` | s443 | S \ F (20307) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/checkpoint_core/properties/projector_id:const` | s436 | S \ F (20307) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/checkpoint_core/properties/projector_version:const` | s437 | S \ F (20307) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/checkpoint_core/properties/admitted_event_types/items:enum` | s415–s416 | S \ F (20306) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/checkpoint_core/properties/state:enum;Plans/collaboration_projection_contracts.schema.json#/$defs/retired_generation/properties/checkpoint_core/allOf/1/properties/state:const` | s446 | S \ F (20307) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/checkpoint_core/properties/health:enum` | s417 | S \ F (20307) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/checkpoint_core/properties/withdrawn_at_utc:anyOf;Plans/collaboration_projection_contracts.schema.json#/$defs/timestamp:lexical` | s259, s268, s313, s322, s363, s370, s414, s439, s448–s449, s459, s16698, s17015 | S \ F (20295) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/attempt_item/properties/outcome:anyOf` | s16304 | S \ F (20307) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/attempt_item/properties/outcome_event_id:anyOf` | s16305 | S \ F (20307) |
| `schema:Plans/collaboration_projection_contracts.schema.json#/$defs/sha256_hex:lexical` | s16056 | S \ F (20307) |
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
