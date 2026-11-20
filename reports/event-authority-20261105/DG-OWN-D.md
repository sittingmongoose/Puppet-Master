# DG-OWN-D — ten historical Goal readers

Branch `plans/ea-goal-own-d-20261105`, based exactly on `cfb7e550746c08a989bb41583286d72acc47e68d` (`origin/plans/ea-goal-depth-20261104`). Implementation head `bea730cca994dedd8811f0a8d030d68971fa95b3`; final checks and evidence are below. This is a drafting package, not a landing or admission.

O6 adds ten independent original-reader boundary contracts and ATS-1119's ten separate suites. C3-F2's four degradation flags now require `type(value) is bool`. All ten families remain **11/12**, with `positive_negative_oracles=PARTIAL` pending the assigned format, number/retained-recipe and guard-isolation sweep. Native execution is **NOT_RUN**. No actual original writer, historical instance or source installation is asserted by a TEST_ONLY positive.

## Units and merge boundaries

| Exact family | Added owner unit | Amended own reader | Existing semantic/schema owners | Before → after |
|---|---|---|---|---|
| `goal.child_status_changed` | SP-1140 | SP-271 | GRS-060 / CV-334 | 11/12 → 11/12 |
| `goal.degraded` | SP-1141 | SP-277 | GRS-061 / CV-335 | 11/12 → 11/12 |
| `goal.scheduled` | SP-1142 | SP-280 | GRS-062 / CV-336 | 11/12 → 11/12 |
| `goal.progressed` | SP-1143 | SP-300 | GRS-069 / CV-343 | 11/12 → 11/12 |
| `goal.replanned` | SP-1144 | SP-301 | GRS-070 / CV-344 | 11/12 → 11/12 |
| `goal.stopped` | SP-1145 | SP-302 | GRS-071 / CV-345 | 11/12 → 11/12 |
| `goal.verification_decided` | SP-1146 | SP-303 | GRS-072 / CV-346 | 11/12 → 11/12 |
| `goal.evidence_captured` | SP-1147 | SP-431 | GRS-205 / CV-424 | 11/12 → 11/12 |
| `goal.receipt_recorded` | SP-1148 | SP-432 | GRS-206 / CV-425 | 11/12 → 11/12 |
| `goal.tool_check_recorded` | SP-1149 | SP-433 | GRS-207 / CV-426 | 11/12 → 11/12 |

All SP additions/adoptions are in `Plans/storage-plan.md`. ATS-211 is amended and ATS-1119 is added in `Plans/Automated_Testing_System.md`. The final line ranges and exact check counts are appended below. These two owner files are shared with A–C; merge only the named own units and contiguous new blocks. Regenerate `_shards` and `.plan_index` after integration rather than merging generated bodies.

Only `scripts/pm_goal_history_reader_fixtures.py` is amended among existing scripts. It adds four separate `row/degraded_boolean/<flag>` predicates. The new code is isolated in `scripts/pm_goal_own_d_oracles.py` and `scripts/pm_goal_own_d_event_value_codec.py`; `scripts/pm_goal_oracle_common.py` and the other lanes' scripts are unchanged. `Plans/goal_degraded_history_contract_fixtures.json` adds four lawful boolean baselines and forty one-field wrong-type vectors. No `tests/` file is edited.

## Search, reuse and authority

The per-family search used the pinned base, not this package's newly authored prose: all tracked live top-level `Plans/*.md` and `Plans/*.json`, exact `Plans/event_payloads/goal_runtime/*.json` resources, production wiring in those inputs and `reports/event-authority-20260911/admission-records/*`. The external `per-family-search.json` preserves the exact path list and separate matched paths, lines and excerpts for each family. Source counts are 211 child-status, 162 degraded, 366 scheduled, 184 progressed, 178 replanned, 183 stopped, 175 verification, 151 evidence, 128 receipt and 114 tool-check matches. Matches are search evidence, not admissions.

Each family already has its own named `storage.goal_<family>_history_read.v1@1.0.0` binding (child-status uses `storage.goal_child_status_history_read.v1@1.0.0`), own GRS/CV disposition, closed answer, historical payload and SP-339 inspection consumer. These are reused individually. SP-420 already binds the first-receipt plus accepted-at-issue owner/approved-checkpoint pair. The search establishes no demonstrated writer/checkpoint admitting an original instance of these exact historical versions, and no pre-existing complete six-boundary integration suite for them. Membership, minima, a schema root or a wiring expectation supplies neither missing fact.

The eleven new PlanUnits are explicitly labelled **newly authored owner contracts under DL-045**. No new reader identifier/version, producer, projector, family checkpoint, stored row or public method is introduced. The six oracle method names identify entry, resolver, row validator, answer builder, inspection and disclosure roles; they are not new product commands. Every family independently adopts SP-420 and SP-339 through its own amended SP unit and new contract. No sibling's contract supplies another family's authority.

ID audit: 528 origin refs, 2,620 distinct top-level owner-document blobs, no collisions for SP-1140..1149 or ATS-1119..1121. The audit runs `git grep` per ref and reuses results for identical immutable blobs. Only **SP-1140..1149 and ATS-1119** are used. ATS-1120/1121 and all other prefixes in this allocation remain unused.

## Premises checked in both directions

- **DL-045:** its exact Goal scope includes these names and permits missing technical bindings for existing behavior after individual searches. Current GRS/CV/SP text still has the same historical-only interpretation and existing bounded lookup. No feature, retention/deletion, registry or admission authority is inferred.
- **DL-079 / Card 3 A:** current GRS-048/049/052/064 and GRS-205..207 retain the transfer of evidence, receipts and checks to the actual Workflow owners. The three Goal record events remain history-only in both scopes. Current CV-366/DL-300 selector membership still does not admit their application producers. O11's already-approved unused-app selector withdrawal remains integration work, not a fresh product question.
- **Original versus present:** lawful authentic originals remain readable after today's writer retirement, live-state change or absent active Goal. Present access/deletion/hold, installed reader and current source/frontier remain mandatory. A new forbidden append cannot become lawful history by surviving in seglog or by presenting equal checkpoint/owner claims. Missing member 2 keeps the six unavailable readers unavailable and the four unresolved readers unresolved only when generic raw disclosure is independently permitted.
- **Retention and compatibility:** original source/receipt and index assignments remain `RP-AUTHORITY-INDEFINITE@1.0.0` and `RP-EVENT-INDEX-SOURCE@1.0.0`. Referenced content keeps its own owner policy. Retained v1 receipts are read without invented v2 commitments; original v2/schema resources, legacy routes and original bytes are unchanged. The selected source cursor may move under authentic translation; original receipt coordinates do not move with it.

No failed product premise or new owner conflict was established. The already reserved application Stop question 7.a is outside this lane and is neither answered nor asked again. O10's current Replan source/wiring remains separate; this package never dispatches historical `goal.replanned`.

## Oracle design and guard handoff

The new module uses independently supplied complete TEST_ONLY logical owner records: source value/bytes/cursor/watermark, original full receipt custody, accepted-at-issue edition and approved checkpoint, original runtime/predecessor/reference/fact records, current token/fence and reference content. It resolves/compares those actual logical values rather than accepting `admitted=true` or matching two caller claims. Source-adapter authenticity, native CURRENT/manifest handling, physical group issuance, redb/sync/locking and a real historical source remain native **NOT_RUN**, as in SP-278/SP-286's existing synthetic contract fixtures.

At every independently callable boundary, the suite mutates every candidate leaf before entry and after the last returning helper, and every relevant actual owner/source/fence leaf after that helper. It also tests missing/foreign original source, missing own reference roles, coherent forged owner/checkpoint claims, full receipt/value commitments, physical cursor/CRC/watermark mismatches, relocation and later nonmatching append. Current Goal/writer state is deliberately separate from the read-authority fence; after-helper changes to it are positive cases, while access/source/reader changes still invalidate the answer. A candidate answer/template is never retained as owner authority: all eight answer fields are independently constructed, including unavailable answers with an actually absent source.

Evidence/content and artifact hashes are recomputed from actual TEST_ONLY bytes. Large referenced original source-contract bodies use SP-337 BLAKE3/size/media-type checks and retain references; no new top-level EventRecord `payload_ref` codec or over-limit current inline write is invented. The original full-value commitment reuses CV-339's tuple and an unchanged copy of the existing frozen SP-286 `event_value_codec.py`, SHA-256 `3a0c53aadadd0b6df21e9aca1063531c0fd31a8ffce9a35eccb009c93871d92d`, from `/home/sittingmongoose/PM-Experiments/event-authority-step08-first-receipt-full-value-20260912/v3/event_value_codec.py`. This is reuse of the existing physical recipe, not a new number serializer or cap.

Family-specific positives include the declared original child outcome/receipt branches; all seven degradation reasons plus tier, repeated-risk, exception and approval cases; scheduling recovery and all declared reason/action/priority cases; the four exact progress pairs and repeat/artifact evidence; all seven Replan actions; four Stop boundaries and materially new repeated Stop; passed/failed/blocked verification and Strong third-repeat adjudication; original evidence currentness/spans; receipt exception/rejection/blocking/complete dependency sets; and tool result/permission branches. Every branch remains TEST_ONLY and grants no current action.

The four flag baselines keep the semantic predicates satisfiable: Lightweight isolates required-check/mutation flag types, and genuine exception/approval arrays keep those flags independent of their semantic requirements. Each flag has `0`, `1`, empty string, `"false"`, `"0"`, null, empty/nonempty arrays, empty/nested objects as wrong-type vectors. The full new boundary model repeats these with coherent original owner copies so a source-copy mismatch cannot mask the type guard.

The full external oracle output lists each observed guard with every rejecting negative ID. Its compact branch inventory and final artifact hashes are recorded below. It is a handoff to `scripts/pm_guard_isolation.py`, not a new private proof engine. C3-F1/C3-F3 remain assigned sweep items. A green legacy guard-removal table is not asserted to establish independent exhaustive predicate inventory or lawful duplicate cuts.

## Astra and standing-check disposition

| Item | Authored probe / boundary and limit |
|---|---|
| 1 — forged inputs | Candidate/source/original leaf mutations, coherent forged checkpoint/writer, independently resolved full receipts, reference sets and source bytes. No caller flag establishes original admission. |
| 2 — Storage metadata | Complete physical original-value commitments and exact candidate/source comparisons include sequence/timestamps/receipt fields; semantic digest still excludes only CV-339's Storage-assigned fields. |
| 3 — history in both directions | Retired/unavailable writer, four live Goal states and no active Goal, including after-helper changes, remain readable. Missing/withdrawn/foreign source and changed access/reader/source fences refuse. |
| 4 — one field read two ways | Pure final typed comparison preserves booleans and physical float observations; the four modeled degradation flags have explicit type witnesses. General number-domain adoption remains O12/S2. |
| 5 — refs | Eager complete-resource resolution is reused; unchanged DG suites include unused dangling-reference refusal. No frozen resource is rewritten. |
| 6 — size | Large referenced source bytes verify complete BLAKE3/size/media metadata. Existing source-owner codecs/limits remain authoritative; no current inline-limit gate is applied retroactively to history. |
| 7 — custody | Every public oracle boundary repeats original pair/source/reference checks and final candidate/current fence. Missing custody yields the family's own closed disposition and cannot cause a write/checkpoint. |
| 8 — masked negatives | Candidate mutations change one independent leaf. Coupled source changes keep receipt/value/CRC/size mirrors coherent where required. New guards and their negative IDs are supplied to the shared isolation sweep. |
| 9 — grades | All ten remain 11/12, oracle PARTIAL. No upgrade for a large green bounded model or native NOT_RUN. |
| 10 / 10a | Existing physical codec reused verbatim; retained v1 receipt and original-value cases preserved. Actual complete old-recipe/number-domain dispatch remains O12/S2, not declared cleared here. |
| 11 — types | All four named degradation facts are actual booleans; forty wrong-type source vectors and complete-boundary repetitions are new. Existing payload/schema tests remain enabled. |
| 12 — formats | S1 remains the cross-lane format sweep; the existing common UUID/UTC checker is not changed in this lane. |

Standing checks 1–3 retain both-scope writer refusal before new/equal-retry dedupe, exact registered scope, and encoded `project~` partitions. Checks 4–7 preserve original source-owner size/recipe, exact identities, semantic digest field ownership and actual token/Storage joins. Checker failures use nonzero exit status; eager refs and historical refusal/acceptance are retained. Check 11's proof machinery is explicitly handed to the shared tool.

## Verification and remaining work

All commands below ran serially with `PM_GOAL_AUDIT_WORKERS=1`. The resource runner pauses a child group below 6 GB, rechecks every two minutes, resumes at 7 GB, and stops only after 45 continuous minutes below 6 GB. Memory pauses recovered. Initial worktree creation had 93 GB free disk and 11 GB available RAM; no additional worker, worktree or browser was created. No aggregate governance check, reseal, registry/admission/Decision Log edit, main push, pm-mail, subagent or native/browser execution is claimed.

The merge must retain the shared sweep items S1, O12/S2 and C3-F1/C3-F3. Currentness/governance staleness is for the authorized integration/reseal workflow, not repaired by this drafting lane. Existing canonical membership is carried; TEST_ONLY original admission is absent from the real repository. The per-family twelve-cell re-grade is beside this report.


## Final serial verification

| Check | Exit | Result |
|---|---:|---|
| `history` | 0 | pass; 6,187 cases / 6,072 negatives / 654 legacy removal rows; no global isolation clearance claimed |
| `own-d-final` | 0 | pass; 51,670 cases / 2,250 positives / 49,420 negatives / 114 observed rejecting guards; existing full-value vector pass |
| `positive-smoke` | 0 | pass; 690 complete branch positives; subset of the full suite, not added to its count |
| `current-writers` | 0 | pass; 931 cases / 861 negatives / 143 legacy removal rows; no global isolation clearance claimed |
| `stop-block` | 0 | pass; 478 cases / 427 negatives / 90 legacy removal rows; no global isolation clearance claimed |
| `lifecycle` | 0 | pass; 514 cases / 487 negatives / 104 legacy removal rows; no global isolation clearance claimed |
| `copy-currentness` | 0 | 15 copied files SHA-256 match; exact snapshot archived |
| `shard-generate-final` | 0 | pass; 99 source documents / 3,094 shards; only the two edited owner documents have changed derived files |
| `index-generate-final` | 0 | completed |
| `shard-check-final` | 0 | pass; 99 source documents / 3,094 shards; only the two edited owner documents have changed derived files |
| `index-validate` | 1 | top-level fail; 22 pre-existing C3-N1 failures; coverage pass; 7,466 PlanUnits / 30,080 acceptance units; readiness remains blocked_runtime_certification_incomplete |
| `emit-only` | 1 | 12/13 tests pass; frozen first-40 registry prefix mismatch also present at the pinned base; not repaired in this lane |
| `attribution` | 0 | pass attribution only; registry, Decision Log, test and emit-only module are byte-identical to pinned base |
| `lineage` | 0 | pass; unchanged Goal lineage self-test |
| `python-compile` | 0 | completed |
| `diff-check` | 0 | completed |
| `grade-citations` | 0 | pass; 10 families / 120 cells / 300 exact current citations; predecessor span-hash convention retained |

The ordinary index command was not made green by changing a baseline: all 21 malformed legacy-ledger records plus `DL-302` missing relative to the ahead `origin/main` are the same C3-N1 class, and `Plans/Decision_Log.md` is byte-identical to the pinned base. No new structural/index failure appears. Integration must rebase/rerun the unmodified validator; this package deliberately retains the requested pinned base.

The emit-only mismatch is independently attributed, not waived or restamped. Both pinned-base and current registry yield `2fe49c025e4db8adc9183a3f32c393333c203f375d9a047cc7a98d48c6f8776e` for the first forty rows through the unchanged digest function; the unchanged test expects `a27cf49b63d364ae0d6d6f62b0ebc8d3ebe9e66df6de8e58814d099194d81050`. Registry SHA-256 is `443ae71d7e6326c3673a409f63950b9f33713c67f43c256fed6efa1c0d03a653`. No registry/test/frozen prefix is changed.

Development iterations found and repaired two schema-only Replan positives with inconsistent full-original revision/CAS, a draft original-cursor equality that needed authenticated relocation, and an overly broad fence that included unrelated present Goal/writer state. Final source construction also handles actually absent source and derives all eight answer fields without trusting an answer template. These superseded iteration outputs are excluded from final grading; the full final suite above was run after these changes. A final Markdown whitespace fix changed no oracle/schema/fixture bytes and was followed by full regeneration, shard/index validation and a passing whitespace check.

## Exact final source ranges for integration

| Addition / amendment | Path and final line |
|---|---|
| SP-1140 | `Plans/storage-plan.md:30431` |
| SP-1141 | `Plans/storage-plan.md:30479` |
| SP-1142 | `Plans/storage-plan.md:30527` |
| SP-1143 | `Plans/storage-plan.md:30575` |
| SP-1144 | `Plans/storage-plan.md:30623` |
| SP-1145 | `Plans/storage-plan.md:30671` |
| SP-1146 | `Plans/storage-plan.md:30719` |
| SP-1147 | `Plans/storage-plan.md:30767` |
| SP-1148 | `Plans/storage-plan.md:30815` |
| SP-1149 | `Plans/storage-plan.md:30863` |
| ATS-211 | `Plans/Automated_Testing_System.md:7304` |
| ATS-1119 | `Plans/Automated_Testing_System.md:7476` |
| goal.child_status_changed own-reader adoption | `Plans/storage-plan.md:20827` |
| goal.degraded own-reader adoption | `Plans/storage-plan.md:21014` |
| goal.scheduled own-reader adoption | `Plans/storage-plan.md:21198` |
| goal.progressed own-reader adoption | `Plans/storage-plan.md:24898` |
| goal.replanned own-reader adoption | `Plans/storage-plan.md:25008` |
| goal.stopped own-reader adoption | `Plans/storage-plan.md:25118` |
| goal.verification_decided own-reader adoption | `Plans/storage-plan.md:25228` |
| goal.evidence_captured own-reader adoption | `Plans/storage-plan.md:30301` |
| goal.receipt_recorded own-reader adoption | `Plans/storage-plan.md:30364` |
| goal.tool_check_recorded own-reader adoption | `Plans/storage-plan.md:30426` |

New blocks are contiguous at the end of the governing files. A–C should preserve all listed adoption paragraphs while merging their own units. `scripts/pm_goal_history_reader_fixtures.py:106-107` is the only existing-script change; all other new oracle code remains isolated. No common-helper merge is needed. `Plans/goal_degraded_history_contract_fixtures.json` is shared only if another lane also changes that exact fixture bank. Derived `_shards` and `.plan_index` are regenerated after the combined owner merge.

## Shared-file ranges and new boolean sensitivity

- `Plans/storage-plan.md:30429-30909`: contiguous SP-1140..1149 addition. The ten one-line existing-reader adoptions are located individually in the preceding table; no shared SP-278/SP-286/SP-339/SP-420 body is amended.
- `Plans/Automated_Testing_System.md:7312` and `:7332`: ATS-211 canonical-text and validation-surface amendments; `:7473-7541`: the contiguous ATS-1119 block.
- `scripts/pm_goal_history_reader_fixtures.py:106-107`: the four exact boolean predicates. `Plans/goal_degraded_history_contract_fixtures.json:7897-9734`: four positive bases and forty one-field negatives.
- New isolated files are `scripts/pm_goal_own_d_oracles.py:1-932` and the verbatim codec `scripts/pm_goal_own_d_event_value_codec.py:1-204`. Other existing scripts and the other lanes' units are read-only.

The four new code predicates have direct single-site sensitivity in the fresh historical command. Each removal below flips exactly its ten wrong-type negatives; all 6,062 other negatives remain rejected. This narrow result does not clear the legacy machinery's broader C3-F1/C3-F3 sweep obligation.

| Actual removed predicate | Own negatives flip | Others stay rejected | Masked |
|---|---:|---:|---:|
| `row/degraded_boolean/exception_required` | 10 | 6,062 | 0 |
| `row/degraded_boolean/mutation_affected` | 10 | 6,062 | 0 |
| `row/degraded_boolean/required_check_affected` | 10 | 6,062 | 0 |
| `row/degraded_boolean/risk_accepted` | 10 | 6,062 | 0 |

## Final per-family oracle counts

| Family | Positive | Negative | Total | Grade before → after |
|---|---:|---:|---:|---|
| `goal.child_status_changed` | 210 | 4,738 | 4,948 | 11/12 → 11/12 |
| `goal.degraded` | 258 | 5,158 | 5,416 | 11/12 → 11/12 |
| `goal.scheduled` | 312 | 4,978 | 5,290 | 11/12 → 11/12 |
| `goal.progressed` | 216 | 5,062 | 5,278 | 11/12 → 11/12 |
| `goal.replanned` | 222 | 4,864 | 5,086 | 11/12 → 11/12 |
| `goal.stopped` | 210 | 5,062 | 5,272 | 11/12 → 11/12 |
| `goal.verification_decided` | 192 | 4,996 | 5,188 | 11/12 → 11/12 |
| `goal.evidence_captured` | 216 | 4,900 | 5,116 | 11/12 → 11/12 |
| `goal.receipt_recorded` | 204 | 4,882 | 5,086 | 11/12 → 11/12 |
| `goal.tool_check_recorded` | 210 | 4,780 | 4,990 | 11/12 → 11/12 |

The twelve-cell vector is `PASS PASS PASS PASS PASS PASS PASS PASS PASS PASS PASS PARTIAL` for each family, in the rubric order. `DG-OWN-D-self-grade.json` records every cell against the implementation tree. `DG-OWN-D-oracles.json` is the compact guard-to-negative handoff; full IDs are in the external inventory and full final corpus below.

## Retained external evidence

The complete command/output/hash manifest is `reports/event-authority-20261105/DG-OWN-D-evidence.json`. The following retained artifacts pin the noncanonical source memory and full oracle evidence by path plus SHA-256:

| Artifact | SHA-256 |
|---|---|
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG-OWN-D/id-audit.json` | `825431b26f2c4232eac4c9ca46c9ddbf18eb1f5b139d475054df733b998cf084` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG-OWN-D/per-family-search.json` | `380d0e02e9c9e6ad3cdff182e820622a52d2c84d832090c8972a12b9a5f4118c` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG-OWN-D/source-search-summary.json` | `511a6829433a1ed44f53a03eb9f191b84e94c85c2d0edd8ba8f1d77c1538b483` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG-OWN-D/currentness-sha256.json` | `5c99f673f4396a206bc852dafe6ba4c976ec1cb26b3a3ce75cdad69d6e4db75a` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG-OWN-D/currentness-inputs.tar.gz` | `b6ae0785ab267cda51dbe1d805601050fb14e0be264fc4c7d16375f2093cb243` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG-OWN-D/own-d-guard-negative-inventory.json` | `b60072b7bf6df60a1fdb687a2b1139ae8b8e67455f145cfbdf246af815d0a31b` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG-OWN-D/run-serial.py` | `8101e5efa832a0cab6cc2333accb3cb07ec3d9dc8809bca40f40c1c337d42df2` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG-OWN-D/attribute-checks.py` | `b5a21c6fa0067c8e949a3660abe5422ddc0d44e2b18ffe83314c0c6e6df1d575` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG-OWN-D/own-d-final.json.gz` | `971554f570ac2a7b106cbb40b716f6c47c13e29ffee05d358f6fb69dfe36f73a` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG-OWN-D/history-guard-table.json.gz` | `1ff4c5734eb53e54859a46a9b8c070f3dd0b898aefa97e2fa905e2427ceffd4c` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG-OWN-D/current-writers-guard-table.json.gz` | `8b15e67b993820fd698c21ad6042edde84416bcf99a5ff8b1a70237b622728cb` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG-OWN-D/stop-block-guard-table.json.gz` | `6f76134c4f453953f811e76ee885ff3618e18179c390b2ad05d581961a4330d6` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG-OWN-D/lifecycle-guard-table.json.gz` | `2f39d4ce14db285b6a0c6c0ac1e67c8b4e49778c48922d684600ccf534008162` |
