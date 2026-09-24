# Step 8: the remaining source work, scoped, 2026-09-24

This is a plan document only. It covers the two items of Step 8 that are still open after the 8(a) assessment, the 8(d) anchors and the first 8(c) branch:
- the second half of 8(c), which makes the Browser-created v2 checkpoint the current definition;
- 8(b), which compiles the reviewed external source packages into canon.

Nothing here edits canon or starts package work. Jared decides the 8(b) go on the coordinator's sizing. Part 1 needs the coordinator's go, and it can land only after the landing-check exports repair.

A third, small item turned up while scoping. It is ready on its own branch, `fix/ea-compaction-pm7-validator-20260924`. It clears the one stated reason for `context.compaction.completed`'s PARTIAL oracle cell: `scripts/pm-validate-pm7-gui-fixtures.py` still forbade the admitted family. The branch edits a script and its test only, so it can land without the exports repair. See its report, `step-08-compaction-pm7-validator-20260924.md`.

## Part 1. 8(c), second half: make the Browser-created v2 checkpoint the current definition

**Where it stands.** The first half is on `plans/ea-browser-pair-sp286-20260924` (`2df56dd8a9`, in blind review). It adopts SP-286/CV-339 by name for both Browser producers, which answers the producer gap of `browser.workspace.created` and `browser.workspace.reset`. Once it lands, reset has nothing left short of PASS. Created keeps two PARTIAL cells, consumers and oracles, for one reason: its v2 checkpoint successor, which adopts SP-278 with the nine-field DL-076 token, is still `conditional_not_admitted`, and canon keeps v1 as the current route (`Plans/Section15_MVP_Promoted_Features_Spec.md` 11519; `Plans/storage-plan.md` 19854-19855 and SP-266 acceptance criterion 6).

**What canon needs so that v2 is the specified current definition.** SP-266's conditional subsection states the conditions: a closed registered schema, explicit reader and admission revisions, and native migration, source, permission and crash proofs before activation (`storage-plan.md` 19990-19991). The native proofs stay NOT_RUN and do not lower a grade. One branch, the existing `plans/ea-browser-created-v2-current-20260924`, would change:

| Surface | Change |
|---|---|
| `Plans/storage_value_registry.json` | The `browser_workspace_created_index_checkpoint` row moves to the v2 writer, with the same family and key. Its value schema, `value_schema_id`, `schema_version` 2.0.0 and field lists come from `Plans/browser_workspace_created_checkpoint_v2.schema.json#/$defs/checkpoint`. The producer becomes `storage.browser_workspace_created_index.v2@2.0.0` and the consumer `browser.workspace_inventory.created.v2@2.0.0`. The migration text states the StorageMigrationCoordinator handoff SP-266 already defines, and an explicit retained v1 reader is used only to authenticate the handoff preimage, following the `restore_point_retention_summary` registered-read precedent. The family count stays 294, so the readiness census pin does not move. The file is Spec-Locked, so its hash goes stale until the reseal. |
| The v2 schema | `x-pm-definition-status`, and the binding's `definition_status`, move from `conditional_not_admitted` to the current `newly_authored_owner_contract`. Its read-only resolver views are unchanged. |
| `Plans/browser_event_admission.json` row 0 | `authority_contract_ref` points to the v2 schema's `x-pm-event-authority-binding`. The event family registry row does not change: `pm-browser-event-admission.py` requires only the admission row, semantic owner and payload schema refs in its `source_refs`. No PNC-019 checkpoint approval is needed. The row's extra reference to the v1 binding stays, as compatibility custody, until the next registry revision that needs approval anyway, as with the certified anchors in 8(d). |
| Section 15 and SMPFS-167 | The conditional subsection and acceptance criterion 5 say the v2 reader is the specified current route. Installation stays a native StorageMigrationCoordinator step. v1 is compatibility custody, authenticated only at handoff. |
| `storage-plan.md`: SP-266 and section 2.3.1 | The v2 subsection, SP-266's `canonical_text` and criterion 6 say the same. The SP-278 read-token rule in section 2.3.1 adds the created checkpoint to the stored checkpoint values it lists (four today). |
| Scripts and tests | `scripts/pm_browser_workspace_created.py`: `binding_failures` and `expected_storage_family` pin the v1 binding and registry row exactly, and move to v2 with a v1 handoff check. `scripts/pm_browser_workspace_created_v2.py`: its reported status. `scripts/pm-implementation-readiness.py`: the created checkpoint joins the self-test's `read_token_families`. `tests/test_pm_browser_workspace_created.py`: the conditional assertions invert, and the v1 tests become handoff and compatibility tests. |

**Checks.**
- The Browser created, reset and admission test modules.
- `pm-browser-event-admission.py`.
- `pm-implementation-readiness.py validate` and `self-test`.
- `pm-plan-index.py validate` and the shard check, with the currentness edition present.
- A regraded depth row for `browser.workspace.created`.

**Authority.** DL-046: Browser technical bindings and individual admission landings. The admission condition is SP-266's own. No product question is expected, and no event family registry row changes.

**Landing.** It edits `storage-plan.md`, whose plan-sharding evidence rows exceed the print cap, so it waits for the landing-check exports repair. Its reseal request covers:
- the Spec Lock entries of `storage_value_registry.json`, `storage-plan.md` and Section 15;
- their evidence bundle rows;
- the readiness report;
- the currentness edition.

**Estimate.** One branch: about 3 to 5 agent-hours, plus one blind review cycle of about an hour. Roughly 300,000 to 500,000 output tokens in all. The main risks:
- the retained-v1-reader representation in the registry, which may need a readiness rule and self-tests of its own;
- the size of the v1 validator and test rewrite.

**What it closes.** After both halves, both Browser families are complete in canon (12 of 12). Their DL-077 admission records then pass once they are re-pinned to a regraded depth assessment. That leaves `context.compaction.completed`'s oracle cell as the only post-August depth gap. That cell is blocked by the PM7 GUI validator, which sits under `Concepts/`, outside this agent's scope.

## Part 2. 8(b): compiling the reviewed external source packages into canon

**Status.** This part is a plan only. No package work starts until Jared gives his go; the coordinator has already sized the work for him. The map below comes from a read-only survey of every package directory and review, run on 2026-09-24 against `main` `3ce6eb882c`.

**What it gates.** From the Step 8(a) assessment:
- **Replan v8** would give `goal_run.replanned` a current writer, and possibly `goal_run.blocked` and `goal_run.stopped` as well; together these three families have 27 non-PASS cells. GRS-085's mandatory projection halts on those rows today. DL-080 makes the three families current events, with replanned after the Replan source work, so the package is required work. DL-080 does not schedule it.
- **Original capture for restore-point corruption** gates eight cells of `restore_point.corrupt` and the oracle cell of `restore_point.created`.

### What exists

Nothing in either group has been compiled into canon, and neither group has a compile-ready canonical draft package, the kind the certified-family integration was applied from (`f6350caf27`). Sizes are apparent bytes; the share compresses them on disk.

**Group A: the Replan v8 Workflow source.** It holds 11 directories, 6,005 files and 831 MB.

| Package | Latest edition (manifest SHA-256) | Review record |
|---|---|---|
| `goal-replan-combined-source-20260921`: the `pm.executor.workflow_source.all_writers.v8` combined source (4,688 files) | v3 `9ed8ba4f825939cc59b37941aafe1068be7ed2d6ada87c0e3b8eaa3b5225896e`, with 1,580 members | v1: structural pass, but the phase and root reviews required a correction. v2: not accepted, with two new gaps. v3: independent PASS (`c9271320b89f...`) and root acceptance (`dc58f7d28fe0...`), both bounded to the two fixes. Currentness PASS; placement CONDITIONAL (`c7213eb4fb11...`, compared against `4a72aa12`, which is not an ancestor of `main`) |
| `goal-run-replanned-source-contract-20260920-relocated-20260921`: the standalone `goal_run.replanned` source (1,259 files) | v3 `eb4441c1c0a9...`, imported whole into the combined source | Root PASS for its narrow repairs; the prebirth-composition gap stays open |
| Scope adjudication with its addendum; phase, root, Stop and currentness reviews; relocation receipt | as listed | They record the gap and its correction (below) |

What the v8 source proposes:
- 19 whole schema roots, 5 new methods (among them `owner.executor.native.revoke_run_execution.v1` and its reader), successor declarations for 323 method occurrences, four operative protocols with `STOP-PROTOCOL.md` rules R01 to R12, and 35 proposed physical Storage families. Its installed-contract digest is `2d69459c...`.
- It pins `Executor_Protocol.md`, `Goal_Runtime_System.md`, `Contracts_V0.md`, `storage-plan.md`, `Crosswalk.md`, `Plan_To_Node_Compilation.md`, `00-plans-index.md` and three contract directories.
- It states that the v7 consumers are not cast to v8. Four consumer-adoption items are declared out of scope (`SEPARATE_EXTERNAL_CONSUMER_ADOPTION_REQUIRED_NOT_ADMITTED`), and no package authors them.

**Group B: original capture for restore-point corruption.** The "79 packages" figure counts names: 77 `restore-corrupt-*` directories and 2 loose files. Adding the one `restore-applied-corrupt-*` directory gives 78 directories:
- 42 subject directories and 36 review directories;
- 124 version subdirectories, 122 of them with a manifest;
- about 42 subjects in 8 clusters;
- 10,342 files and 2.42 GB in all.

Only 19 editions are actual source proposals; the rest are maps or research, usable as evidence only. They cover four open roles, and "full D1 is not passed" refers to these four:

| Role | Addressed by (latest accepted editions) | Still missing |
|---|---|---|
| ORIGIN-01, original capture and introduction | ORIGIN v2 `b9defb57...` with DEF01 v4 `e1bfb5e7...`, DEF02 v1 `74b76dc9...`, DEF03 v2 `f15de1f1...` and DEF04 v4 `ca22f5e2...`; composition v1 `6edc37c8...` with its vocabulary addendum `cb28a7a7...` | Raw capture acquisition and native execution. Closure-map row D1-06 is unsupplied. DEF03 has root review only |
| HISTORICAL-01, historical authentication | none | Entirely unsupplied |
| MATERIAL-01, referenced material | Material v3 `5f6a5a91...` and scope v2 `ffbf7ac1...`; the Chat stack (Chat source v1 `36f29f05...`, message-commit v3 `e5dc9d03...`); capture selection v2 `80b3eac2...`; L01 v2 `548ca5c9...`; L07 B1 `c2677897...` | The total material reader (C3) and the positive fourth-reason witness (C4); first-send custody and branch birth; Step 9 admission of `chat.message` (L02); an unpresented product question, the A3 scope-owner-boundary draft |
| DOWNSTREAM-01, downstream publication | lifecycle v4 `a5a07c03...` | Complete C0 to C3 closure; closure-map rows D1-07 (current status and corrupt transition) and D1-11 (evidence carrier and event) |
| D1 lower layers | detection v1 `efb1e194...`; shared adoption v1 `9aa23b8b...` with its routing addendum; storage adoption `794ee2cd...`; admission v1 `6d63b7c2...` with its count addendum; startup handoff `c24dc08a...` | ADM-R01, R02 and R07 are open. Two accepted packages both define D1-01 to D1-03, and neither says which supersedes the other |

### The known pending-Stop source gap

**The 2026-09-21 adjudication** (`step-08-replan-stop-and-corrupt-scope-20260921.md`):

> "The independent Replan phase review and root review found a concrete missing pending-Stop source route: the existing native cancellation issuer is the correct owner of the required run cancellation result and origin, but its complete lower input/candidate/participant/phase contract has not been admitted for this pending case. The original source author is preparing a fresh correction; frozen v1 is unchanged."

The root review names the issuer `owner.executor.native.record_cancellation.v1` and calls it "dependency-only until a separate lifecycle/source contract admits it".

**The correction came the same day, in two rounds.**
- **v2.** Not accepted. Two finite phase gaps remained: `S-FIRST-STOP-ACQUISITION` and `S-READBACK-RELEASED-IDLE`.
- **v3.** Accepted by an independent review and by root, bounded to those two fixes. It does not activate the native cancellation issuer. It adds a separate, limited, typed Executor capability, `owner.executor.native.revoke_run_execution.v1`, whose native implementation and registration have not run. Its status says `"full_original_cancellation": "SEPARATE_DEPENDENCY_NOT_SUPPLIED_BY_LIMITED_REVOCATION"`.

**What root still lists as open:**
- canonical placement and semantic re-adjudication of the changed pins;
- complete positive data and native lifecycle instances;
- full original cancellation (D06) evidence;
- whole-family depth and the landing gates.

The 09-23 takeover and the 09-24 assessment still list "the Replan Stop route" as remaining. At source level the gap is closed. What remains is canonical placement and the full-cancellation dependency.

### Proposed branches

The estimates are indicative. On the certified-family precedent, authoring and review took about a day, and the landing gates took two more.

Every branch below except A0 and B0 edits `storage-plan.md`, `Goal_Runtime_System.md` or `Executor_Protocol.md`. Their plan-sharding rows exceed the landing check's print cap, so those branches land only after the exports repair.

| Branch | Compiles from | Edits | Prerequisites and blocking gaps | Estimate |
|---|---|---|---|---|
| **A0**: v8 currentness and placement re-adjudication (no canon edit) | combined source v3 against `main` | an external review package | none; four v8-pinned owner files differ from the reviewed base | half an agent-day, about 150K to 250K output tokens, including review |
| **A1**: install `all_writers.v8`, with the Replan Stop route | combined source v3 (with Replan v3 and certified-coordinator v2); first a new canonical-draft package, independently and root reviewed | a new contract directory next to the certified coordinator's; new EP, GRS, CV, SP and ATS units; `storage_value_registry.json` (35 proposed families); `00-plans-index.md` | A0. Full original cancellation (D06) has no package; the seven positive-route obligations stay NOT_RUN | 1.5 to 2.5 agent-days, about 0.8M to 1.2M tokens |
| **A2**: consumer adoption from v7 to v8 | nothing yet; its four adoption items must be authored first | the certified, started and cancelled consumer directories; a new replanned consumer; a GRS-085 successor; projection families | A1 | 1 to 1.5 agent-days, about 0.5M to 0.8M tokens |
| **A3**: the DL-080 current contracts | owner work | `event_family_registry.json` rows (this changes the registry hash, so Jared's checkpoint approval is needed, or the DL-078 route if they go through Step 9), payload successors, `Goal_Runtime_System.md`, `Orchestrator_Page.md`, `storage-plan.md` | stopped and blocked can go first; replanned needs A1 and A2 | about half a day to one day per contract |
| **B0**: re-pin currentness for the 19 source editions | the editions against `main` | external | most editions pin bases that are not ancestors of `main`, and the pinned owner files have grown since | half an agent-day |
| **B1**: ORIGIN | ORIGIN v2, DEF01 to DEF04 and the composition with its addendum | `storage-plan.md` (SP-285, SP-286, SP-292, SP-293), `Backup_Restore_System.md` (BRS-003 to BRS-009, BRS-023), `storage_recovery_contracts.schema.json`, the retained-creation read schemas, ACD-465 | B0. DEF03 lacks an independent review. Two receipt contradictions in the migration schema need a decision (a validator change is not authorized). Raw capture is incomplete | 1.5 to 2 agent-days |
| **B2**: D1 lower adoption and admission | detection, shared adoption, storage adoption, admission and startup handoff | `storage-plan.md` (SP-278, SP-286, SP-291 to SP-295), CV-339, `FileSafe.md`, ACD units, the Boot original-source schema | B1. D1-06 has no source; ADM-R01, R02 and R07 are open; the D1-01 to D1-03 overlap must be reconciled | about 1 agent-day |
| **B3** to **B6**: Chat source and pre-B1 capture; MATERIAL; lifecycle and corrupt publication; the complete `restore_point.corrupt` family | the remaining editions | Chat, command, FileManager, Storage and FileSafe owners | Blocked on sources that do not exist: L02 needs Step 9's `chat.message` admission; L03 to L07; the C3 reader and C4 witness; C0 to C3 closure; HISTORICAL-01. Also blocked on two product questions (the A3 scope boundary, and a retention classification for evidence) | not estimable until the missing sources are authored |

### Recommendation

1. **Group A is the part that can be compiled.** Take A0, then A1, then A2, with A3's stopped and blocked contracts able to go first. This is the route DL-080 already committed to. It is about 3.5 to 5.5 agent-days, and it waits for the exports repair.
2. **Do not compile Group B until its missing roles have sources.** In particular HISTORICAL-01, D1-06 and the C-series have none. The certified-family precedent compiled a complete, reviewed family, not a partial one. Whether partial, conditional sources should ever be compiled into canon is a process question for the coordinator. B0 to B2 could go first if a partial compile is wanted. Until then `restore_point.corrupt` keeps its eight non-PASS cells.
3. **The two Group B product questions go to Jared as cards when that work is scheduled, not now.** They are the scope-owner boundary (the A3 draft) and the retention classification for corruption evidence.

### Open uncertainties

- v8 has no whole-package acceptance. Each review is bounded: structural, phase and root, Stop v3 only, and a currentness census whose placement verdict is conditional.
- Several pins live under `/home/sittingmongoose/PM-Experiments/`. The Replan v1 to v3 reviews, the prebirth plan and certified-v2 are among them, and the Replan stable path works only through a symlink on this host.
- Root-only reviews: DEF02, DEF03, and the L02 to L08, inspection, startup and branch-selection maps.
- The pending question that the A3 draft is queued behind, B01, could not be identified.
