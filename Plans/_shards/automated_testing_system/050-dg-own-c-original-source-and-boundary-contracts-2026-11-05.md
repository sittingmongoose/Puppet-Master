# Shard 050: DG-OWN-C original source and boundary contracts (2026-11-05)

Source: `Plans/Automated_Testing_System.md`

Source lines: L7479-L7791

Source SHA256: `ca893c8befbad14cb9a27733152cf36806e803618966df3555d914f81f010e31`

---

## DG-OWN-C original source and boundary contracts (2026-11-05)

### ATS-1116 - Goal update approval and complete original route oracles

```yaml
plan_unit_id: ATS-1116
unit_type: owner_boundary
status: accepted
owner_doc: Plans/Automated_Testing_System.md
canonical_text: Newly authored owner contract under DL-045. For exactly goal.updated, U1-U7 and W1 define independent
  original provider capture/decision resolution, direct Save and approved agent mutation, full source/body/first-event/terminal
  recovery, current body/history versus retained event/input/audit/replay and every private helper/final fence.
  The executable scripts/pm_goal_own_c_oracles.py has bounded new-provider and five-family custody cases and
  lists every new guard/negative; full original inherited-root cases remain mandatory before claiming PASS.
  No local guard-removal engine is added.
gui_related: false
gui_classification_reason: Defines original source custody, identity, recovery or testing boundaries without
  changing visual presentation.
depends_on:
- ATS-210
- CV-1130
unblocks: []
acceptance_criteria:
- Independently acquire complete original owner sources before helpers and recheck complete sources and entire
  candidate after the last helper at each own effect or disclosure.
- Preserve genuine earlier effects, original receipts and immutable replay; missing or unknown authority stays
  unavailable.
- Use exact own-family source, scope, selected schema realm and existing retention; no registry admission,
  native runtime or governance proof.
validation_surfaces:
- python3 scripts/pm_goal_dg_u_oracles.py --output <result.json> --guards <guards.json>
- Plans/goal_own_c_contracts/dg-u-corpus.v1.json
- Plans/goal_own_c_contracts/dg-u-successor-v4/selection.json
- python3 scripts/pm_goal_own_c3_w12a_p2_oracles.py --captures <raw-evidence-directory> --output <result.json>
- Plans/goal_own_c_contracts/w12a-corpus.v2.json
- Plans/goal_own_c_contracts/w12a-successor-v3/protocol.md
- python3 scripts/pm_goal_own_c3_w12a_oracles.py --captures <raw-evidence-directory> --output <result.json>
- Plans/goal_own_c_contracts/w12a-corpus.v1.json
- python3 scripts/pm_goal_own_c3_w12_successor_oracles.py
- Plans/goal_own_c_contracts/w12-successor-v2/approved-agent-source.v2.json
- python3 scripts/pm_goal_own_c_source_oracles.py
- Plans/goal_own_c_contracts/source-witness-inputs.json
- scripts/pm_goal_own_c_oracles.py
- Plans/goal_own_c_contracts/protocol.md
risk_class: forged_original_authority_or_lost_pending_effect
reasoning_tier: high
context_scope: dg_own_c_20261105
implementation_surfaces:
- Plans/Automated_Testing_System.md
- Plans/goal_own_c_contracts/contracts.schema.json
- Plans/goal_own_c_contracts/protocol.md
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-045
- /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/reviews/DG-sol/REVIEW-cycle3.md#work-the-drafting-lead-can-assign-under-dl-045
negative_constraints:
- No new approval policy, cancellation lifecycle, retention/deletion policy or application goal_run.stopped
  edition.
- No source capability, runtime installation, full oracle PASS, Event Authority or WorkNode from a test adapter.
```

The complete newly authored contract is `Plans/goal_own_c_contracts/protocol.md` (Goal update approval and complete original route oracles). Its schema roots are `Plans/goal_own_c_contracts/contracts.schema.json`; the original source roots and historical banks stay byte-exact, while C3-W12 part 2 explicitly selects the versioned source/bank successors named in that protocol. C3-W12a part 2 selects its newly authored current physical/source edition and exact remaining obligations through `Plans/goal_own_c_contracts/w12a-corpus.v2.json` and `Plans/goal_own_c_contracts/w12a-successor-v3/protocol.md`; the v1 corpus and its JSON selection remain history. A bounded whole-corpus assertion pass returns exit 2 while W1 closure is incomplete. No full W1 PASS follows from these captures. DG-U (2026-11-11) explicitly selects the newly authored TEST_ONLY composition `pm.goal.updated.dg_u.composition.v4` through `Plans/goal_own_c_contracts/dg-u-successor-v4/selection.json` and its corpus `Plans/goal_own_c_contracts/dg-u-corpus.v1.json`, built on the shared TEST_ONLY owner adapters; `scripts/pm_goal_dg_u_oracles.py` runs the complete U1-U5 cases, the U3 child-process fault matrix and the per-boundary fence matrix, exits 0 only when every case passes and 1 on any failure or accepted negative, and writes the guard-to-negative inventory for the shared guard-isolation sweep. The earlier corpora and packages stay history. Native evidence stays NOT_RUN and is a separate claim; a planning PASS must never read as native proof.

ContractRef: ContractName:Plans/goal_own_c_contracts/protocol.md, ContractName:Plans/goal_own_c_contracts/contracts.schema.json

### ATS-1117 - Goal cancellation migration and three original route oracles

```yaml
plan_unit_id: ATS-1117
unit_type: owner_boundary
status: accepted
owner_doc: Plans/Automated_Testing_System.md
canonical_text: Newly authored owner contract under DL-045. For exactly goal.cancelled, M1-M9 and W2 define
  complete old Stop/association/pending/effect/receipt mapping, atomic enrollment/recovery/withdrawal and separate
  no-association, bound Plan and Workflow whole-value producer/current-inspection/immutable replay cases. Every
  missing, foreign, forged, stale, contradictory, unknown or changed-after-helper source is refused for its
  own defect; all dependent copies/hashes/keys stay coherent. Preserve earlier genuine effects. New adapter
  evidence is bounded; full inherited-root instantiation stays required.
gui_related: false
gui_classification_reason: Defines original source custody, identity, recovery or testing boundaries without
  changing visual presentation.
depends_on:
- ATS-210
- CV-1131
unblocks: []
acceptance_criteria:
- Independently acquire complete original owner sources before helpers and recheck complete sources and entire
  candidate after the last helper at each own effect or disclosure.
- Preserve genuine earlier effects, original receipts and immutable replay; missing or unknown authority stays
  unavailable.
- Use exact own-family source, scope, selected schema realm and existing retention; no registry admission,
  native runtime or governance proof.
validation_surfaces:
- python3 scripts/pm_goal_own_c3_w12b_oracles.py
- Plans/goal_own_c_contracts/w12b-corpus-v1/coverage.json
- python3 scripts/pm_goal_dg_ca_oracles.py
- Plans/goal_own_c_contracts/dg-ca-corpus-v1/coverage.json
- python3 scripts/pm_goal_dg_ca3_oracles.py
- python3 scripts/pm_goal_own_c3_w12_successor_oracles.py
- Plans/goal_own_c_contracts/w12-successor-v2/cancel-methods.v2.json
- python3 scripts/pm_goal_own_c_source_oracles.py
- Plans/goal_own_c_contracts/source-witness-inputs.json
- scripts/pm_goal_own_c_oracles.py
- Plans/goal_own_c_contracts/protocol.md
- python3 scripts/pm_goal_dg_cb_oracles.py
- Plans/goal_own_c_contracts/dg-cb-corpus-v1/coverage.json
risk_class: forged_original_authority_or_lost_pending_effect
reasoning_tier: high
context_scope: dg_own_c_20261105
implementation_surfaces:
- Plans/Automated_Testing_System.md
- Plans/goal_own_c_contracts/contracts.schema.json
- Plans/goal_own_c_contracts/protocol.md
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-045
- /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/reviews/DG-sol/REVIEW-cycle3.md#work-the-drafting-lead-can-assign-under-dl-045
negative_constraints:
- No new approval policy, cancellation lifecycle, retention/deletion policy or application goal_run.stopped
  edition.
- No source capability, runtime installation, full oracle PASS, Event Authority or WorkNode from a test adapter.
```

The complete newly authored contract is `Plans/goal_own_c_contracts/protocol.md` (Goal cancellation migration and three original route oracles). Its schema roots are `Plans/goal_own_c_contracts/contracts.schema.json`; the original source roots and historical banks stay byte-exact, while C3-W12 part 2 explicitly selects the versioned source/bank successors named in that protocol. C3-W12b adds explicitly bounded no-association migration/cancellation witnesses and a per-method remaining inventory. Its complete inherited W2 tuple coverage remains NOT_COMPLETE. DG-CA (2026-11-11) executes the C1 authenticated no-association route as a complete TEST_ONLY original path on the shared owner adapters, with child-process crash cuts of its Event protocol, and maps every inherited method row in `Plans/goal_own_c_contracts/dg-ca-corpus-v1/coverage.json`; on 2026-11-12 it adds the complete bound-Plan route (C2) and the SP-305/SP-310 assignment admission with a newly authored SP-337 reference successor for the over-cap assignment audit; DG-CA3 (2026-11-12) executes the Workflow route (C3: Workflow Stop, D05 aggregation derived from the effect owners' complete inventory, positive D06 with its own `goal_run.cancelled` or terminal preservation, `workflow_settled` settlement, late Storage assignment and the original Goal append, control and terminal) and the C4 SP-313 v2 private inspection with every lower source route independently callable, over a lane-local TEST_ONLY SP-278 index read source. native evidence stays NOT_RUN and is a separate claim; a planning PASS must never read as native proof.

DG-CB (2026-11-12) executes C5 and C6 of M1-M9 as complete TEST_ONLY original paths on the shared owner adapters: the six pre-enrollment owners' issued source images are captured under an all-writer exclusion and authenticated byte for byte, every derived join is checked field by field (unavailable for missing or unsupported data, `blocked_unresolved` for unknown or contradictory effects), and enrollment, recovery, replay, withdrawal and reinstall run as single test-owner Storage transactions with child-process crash cuts. Its per-method map is `Plans/goal_own_c_contracts/dg-cb-corpus-v1/coverage.json`. native evidence stays NOT_RUN and is a separate claim; a planning PASS must never read as native proof.

ContractRef: ContractName:Plans/goal_own_c_contracts/protocol.md, ContractName:Plans/goal_own_c_contracts/contracts.schema.json

### ATS-1118 - Three exact GoalRun producer and projector oracle suites

```yaml
plan_unit_id: ATS-1118
unit_type: owner_boundary
status: accepted
owner_doc: Plans/Automated_Testing_System.md
canonical_text: Newly authored owner contract under DL-045. Separate W3 goal_run.started, W4 goal_run.cancelled
  and W5 goal_run.certified suites adopt original Start, positive D06 and v7/prepare.v2 coordinator identity/append/commit/release
  respectively. Each owns its full schema-realm tuple, actual original source and first receipt, global prefix,
  full row/checkpoint/token/CAS/stage/cutover, retained/current and withdrawal tests. Certified includes every
  ATS-057 CF-01..12 and passive P4-P8 obligation. The executable adapter reports bounded dispatch/custody/final-fence
  coverage separately from full original native-root specimens; native remains NOT_RUN and no full oracle grade
  follows from table-only checks.
gui_related: false
gui_classification_reason: Defines original source custody, identity, recovery or testing boundaries without
  changing visual presentation.
depends_on:
- ATS-210
- ATS-057
- EP-1130
- EP-1131
- EP-1132
unblocks: []
acceptance_criteria:
- Independently acquire complete original owner sources before helpers and recheck complete sources and entire
  candidate after the last helper at each own effect or disclosure.
- Preserve genuine earlier effects, original receipts and immutable replay; missing or unknown authority stays
  unavailable.
- Use exact own-family source, scope, selected schema realm and existing retention; no registry admission,
  native runtime or governance proof.
validation_surfaces:
- scripts/pm_goal_own_c_oracles.py
- Plans/goal_own_c_contracts/protocol.md
risk_class: forged_original_authority_or_lost_pending_effect
reasoning_tier: high
context_scope: dg_own_c_20261105
implementation_surfaces:
- Plans/Automated_Testing_System.md
- Plans/goal_own_c_contracts/contracts.schema.json
- Plans/goal_own_c_contracts/protocol.md
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-045
- /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/reviews/DG-sol/REVIEW-cycle3.md#work-the-drafting-lead-can-assign-under-dl-045
negative_constraints:
- No new approval policy, cancellation lifecycle, retention/deletion policy or application goal_run.stopped
  edition.
- No source capability, runtime installation, full oracle PASS, Event Authority or WorkNode from a test adapter.
```

The complete newly authored contract is `Plans/goal_own_c_contracts/protocol.md` (Three exact GoalRun producer and projector oracle suites). Its schema roots are `Plans/goal_own_c_contracts/contracts.schema.json`; complete original source roots and methods remain selected in their original banks.

ContractRef: ContractName:Plans/goal_own_c_contracts/protocol.md, ContractName:Plans/goal_own_c_contracts/contracts.schema.json

### ATS-1120 - W3 and W4 original-path reference successor qualification

```yaml
plan_unit_id: ATS-1120
unit_type: owner_boundary
status: accepted
owner_doc: Plans/Automated_Testing_System.md
canonical_text: >-
  Newly authored owner contract under DL-045 and C3-W34 part-2 technical ruling. The started and cancelled contracts are separately authored and independently selected; no family borrows a sibling source. SP-311/SP-312 whole Event identity, original whole-value commitment and SP-337 payload references are joined to actual original custody. Every complete stored row, checkpoint and operation is measured at 16 KiB; oversized metadata and checkpoint contents use separately verified pack references. Original banks, schemas, URIs, hashes, Event selectors, producer editions and historical bytes remain unchanged. Rebuild into a fresh isolated successor generation with full original sources and atomic fenced row/checkpoint publication and cutover; never rewrite old rows in place. Pack durability, access and source lifetime are independently rechecked at every helper and final boundary. Native remains NOT_RUN. ATS-1120 requires complete original-path W3/W4 or an exact technical blocker, never closure from schema specimens.
gui_related: false
gui_classification_reason: Internal source custody and stored representation; no visual presentation.
split_recommended: false
depends_on: [ATS-1118]
unblocks: []
acceptance_criteria:
- Full original value reconstruction and original source predicates apply before every effect or disclosure.
- Old whole bytes remain unchanged and all new stored parts and operations respect 16 KiB.
- An incomplete original-root corpus remains explicitly blocked; native execution is NOT_RUN.
validation_surfaces:
- Plans/goal_run_projection_reference_contracts/started.md
- Plans/goal_run_projection_reference_contracts/started.v1.schema.json
- Plans/goal_run_projection_reference_contracts/started.physical.json
- Plans/goal_run_projection_reference_contracts/started.resources.json
- Plans/goal_run_projection_reference_contracts/started.methods.json
- Plans/goal_run_projection_reference_contracts/cancelled.md
- Plans/goal_run_projection_reference_contracts/cancelled.v1.schema.json
- Plans/goal_run_projection_reference_contracts/cancelled.physical.json
- Plans/goal_run_projection_reference_contracts/cancelled.resources.json
- Plans/goal_run_projection_reference_contracts/cancelled.methods.json
- scripts/pm_goal_own_c3_w34_reference_oracles.py
risk_class: projection_reference_or_original_source_substitution
reasoning_tier: high
context_scope: c3_w34_reference_successor
implementation_surfaces:
- Plans/goal_run_projection_reference_contracts/started.md
- Plans/goal_run_projection_reference_contracts/started.v1.schema.json
- Plans/goal_run_projection_reference_contracts/started.physical.json
- Plans/goal_run_projection_reference_contracts/started.resources.json
- Plans/goal_run_projection_reference_contracts/started.methods.json
- Plans/goal_run_projection_reference_contracts/cancelled.md
- Plans/goal_run_projection_reference_contracts/cancelled.v1.schema.json
- Plans/goal_run_projection_reference_contracts/cancelled.physical.json
- Plans/goal_run_projection_reference_contracts/cancelled.resources.json
- Plans/goal_run_projection_reference_contracts/cancelled.methods.json
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-045
- Plans/storage-plan.md#SP-311
- Plans/storage-plan.md#SP-312
- Plans/storage-plan.md#SP-337
negative_constraints:
- No event registry change, admission, original-source hash restamping or new retention policy.
- No in-place rewrite, source-lifetime extension, action authority or native proof from a projection.
```


### ATS-1121 - Certified reference successor and full original tuple acceptance

```yaml
plan_unit_id: ATS-1121
unit_type: requirement
status: accepted
owner_doc: Plans/Automated_Testing_System.md
canonical_text: 'Newly authored acceptance contract for exactly goal_run.certified, selecting Plans/goal_run_projection_reference_contracts/certified.md
  and scripts/pm_goal_own_c3_w5_projection_oracles.py for the derived representation prerequisite. Measure
  and round-trip complete inline, event_reference, record_reference, inline checkpoint and referenced checkpoint
  using the pinned original codec and isolated original banks. Reject wrong identity/commitment, physical key/dataset/Storage,
  byte-size/media/hash/corrupt/trailing/missing/inaccessible/undurable/foreign pack and over-limit whole operations.
  Export each new guard and one-defect negative for the shared isolation sweep; no local proof engine. Component
  success does not close W5: ATS-057 CF-01..12 and P4..P8 still require complete original v7/prepare.v2 coordinator,
  producer, native, Standard, D01, generic-prefix, private source/guard, row/checkpoint/CAS/crash/cutover/lifetime
  tuples against this explicit successor. Retained lawful history and current disclosure stay separate. Keep
  native execution NOT_RUN and whole-suite closure NOT_COMPLETE until the entire original-path corpus passes.'
gui_related: false
gui_classification_reason: Defines original source custody, derived physical representation and acceptance,
  without visual presentation.
depends_on:
- ATS-057
- GRS-1138
- SP-1139
- CV-1137
unblocks: []
acceptance_criteria:
- Preserve all complete original source, scope, custody, phase and lifetime predicates through explicit successor
  selection.
- Measure complete stored values and operations; rebuild and atomically cut over without rewriting predecessors.
- Report representation components separately from complete original semantic tuples and native NOT_RUN.
validation_surfaces:
- scripts/pm_goal_own_c3_w5_projection_oracles.py
- Plans/goal_run_projection_reference_contracts/certified.md
risk_class: original_source_custody_or_reference_representation_drift
reasoning_tier: high
context_scope: dg_own_c3_w5_part3_20261105
implementation_surfaces:
- Plans/Automated_Testing_System.md
- Plans/goal_run_projection_reference_contracts/certified.v1.schema.json
- Plans/goal_run_projection_reference_contracts/certified.methods.json
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-045
- /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/lanes/DG-OWN-C3.md#part-3-for-c3-w34-split-and-c3-w5
negative_constraints:
- No Event registry admission, changed original bank/hash/header, retention/deletion policy, native installation
  or governance seal.
- No full oracle PASS from schema, size or source-shaped component controls.
```

Amended 2026-11-11 (DG-CF1, DL-045; newly authored TEST_ONLY selection for exactly goal_run.certified CF-01, CF-02, CF-03, CF-04 and CF-05): these five groups select `scripts/pm_goal_dg_cf1_oracles.py`, its owners `scripts/pm_goal_dg_cf1_world.py` and its whole-root composer `scripts/pm_goal_dg_cf1_compose.py`, on the shared TEST_ONLY owner adapters of `Plans/goal_own_c_contracts/protocol.md` (Shared TEST_ONLY owner adapters), and adopt the adapter's CF-01 demonstration `scripts/pm_goal_test_demo_cf01.py` unchanged. One ordered original path runs per case and registered test owners perform every modeled issuance from their own execution; Storage assigns sequences, times and transaction identifiers. CF-04 reads the actual all_writers.v7 descriptor bytes, verifies every member's whole bytes and size, the producer_source.v2 subprofile digest, the v6 predecessor bytes, the acyclic digest DAG and the sorted-key compact descriptor digest, refuses merged or network-fallback realms and eagerly resolves every realm including the scoped historical Handoff route, before any birth; each method argument is validated in the exact realm `methods.json` declares. CF-05 derives the whole OriginalBirthArgument and the native birth first, the compact Birth selecting it second and the epoch-zero empty Control selecting Birth third, and coissues them in one Storage transaction under key absence with a final Goal, Stop and binding guard after every helper; the WorkflowBirthPublication result is validated whole. CF-03 executes Start, each required WorkNode's attempt lifecycle and progress, provisional success (optionally verifying), each with its D01 update, head and origin; the final decision owner evaluates G1-G8 and Document Packaging from the native store, the Standard owner captures the whole DurableStandardRead in its own transaction, the native owner acquires the whole OriginalCertificationSource and CurrentWorkflowSource, and prepare_certified returns the whole CertificationCandidateResult (provisional_success or verifying to certified, revision +1, Goal unchanged). CF-02 assignment, invocation, resolver, reference, causal and Storage partition/route owners issue their whole producer-realm roots; every structured original inside them is bytes the registered issuer holds, recorded by a Storage issuance transaction, and identity and producer preparation recheck live assignment, native, Goal and Standard sources after every returning helper and before return. CF-01 derives IdentityInput and IdentityResult by I0/I1 over those whole roots with an independent LP, K and E recomputation, then prepares WholeProducerSource (P9 equal to the issued identity), the whole 25-field producer, the v3 payload and the producer submission, appends through Storage and checks lost-acknowledgement and equal retries. Every negative starts from the valid path and changes one invariant with dependent copies coherent. These whole roots are the inputs the CF-06..CF-09 and P7 selection consumes at the DG merge. native evidence stays NOT_RUN and is a separate claim; a planning PASS must never read as native proof.

Amended 2026-11-11 (DG-CF2, DL-045; newly authored TEST_ONLY selection for exactly goal_run.certified CF-06, CF-07, CF-08, CF-09 and P7): these five groups select `scripts/pm_goal_dg_cf2_oracles.py`, its coordinator world `scripts/pm_goal_dg_cf2_world.py`, native participants `scripts/pm_goal_dg_cf2_native.py` and readers `scripts/pm_goal_dg_cf2_consumer.py`, on the shared TEST_ONLY owner adapters of `Plans/goal_own_c_contracts/protocol.md` (Shared TEST_ONLY owner adapters). Registered test owners perform every modeled issuance from their own execution; Storage assigns sequences, times, transaction identifiers and seeds; each compact coordinator record, Event, first custody, full-value result, durable group, Standard receipt and capture origin, native Standard result and origin, and D01 update, head, lineage origin and current pointer is validated against its whole root in its original isolated realm. CF-06 runs F5a pre-append admission against the actual complete pre-append Storage source, F5b frame then CURRENT/manifest barriers, F5c original first custody for every member of the actual durable group (including an unrelated scope's member) and F5d EventPhase plus the held return, with exact same-operation retry, Storage dedupe of an equal retry, altered-retry conflict, replay-only refusal and a real child-process interruption matrix (fresh-process classification, refused re-entry). CF-07 publishes the native and D01 afterimages and compact Commit/Origin/Control in one Storage transaction, keeps current certification fenced until readback and Release, and classifies every cut passively without completing it. CF-08 acquires `owner.storage.certified_event.read_guard.v1` at each participant entry and final boundary and applies the Q3 supplement at every declared participant-method occurrence. CF-09 keeps retained metadata, full Event inspection, historical and current reads separate. P7 requires the fresh coordinator read_current tuple, the released guard, exact equality with the complete current generic prefix and a final fence after the last helper. Every negative starts from the valid path and changes one invariant with dependent copies coherent. The whole native current-source roots (OriginalCertificationSource, the current member of PublishedWorkflow, CertificationCandidateResult), CurrentGoalArgument and WholeProducerSource stay inputs composed by their own owners (CF-02/CF-03, S1, the Goal binding owners); this selection does not author them. native evidence stays NOT_RUN and is a separate claim; a planning PASS must never read as native proof.

DG-CF3 amendment (2026-11-11, newly authored, TEST_ONLY): for exactly F0, CF-10, CF-11, CF-12, P4, P5, P6 and P8 this unit also selects `scripts/pm_goal_dg_cf3_oracles.py` with its owner world `scripts/pm_goal_dg_cf3_world.py`, combined consumer and lower Storage publisher `scripts/pm_goal_dg_cf3_projector.py` and backup/restore driver `scripts/pm_goal_dg_cf3_restore.py`, on the shared TEST_ONLY adapters and this explicit successor. Registered test owners issue the started, positive cancelled and certified originals (certified identity and producer through the adapter CF-01 owners, barrier first custody, joint native/D01/coordinator commit, later Release); Storage assigns sequences, times, seeds, transaction ids and first custody. The bounded reducer validates every frame, custody row and registered family of the whole global prefix before any off-run no-op, applies the started/cancelled/certified branch predicates against the exact stored originals of the same snapshot, halts before unsupported same-run rows, second terminals, Start after terminal and certification without a scanned Start or an authenticated expired-Start survivor gap. The lower publisher alone rederives every row form, key (K(s) unpadded base64url), anchor, frontier, coverage and lifecycle change with the Storage-issued transaction id and time, verifies every pack, reruns its final predicate after the last helper and commits row plus checkpoint in one Storage transaction; real child-process cuts and fresh-process re-entry cover stage, advance, pack ordering and cutover. RP-PROJECTION-3GEN is enforced with actual hold authority, and restore authenticates one coherent original-authority unit, enforces current tombstones and rebuilds derived state from retained source under BRS-031. Each negative changes one thing with coherent copies and refuses with its own code; guards and their negatives are exported for the shared isolation sweep. Native, D01, Standard and coordinator records here are compact TEST_ONLY owner records whose whole roots are composed by the sibling CF-02/CF-03/CF-07 owners at the DG merge. native evidence stays NOT_RUN and is a separate claim; a planning PASS must never read as native proof.

ContractRef: ContractName:Plans/goal_run_projection_reference_contracts/certified.md
