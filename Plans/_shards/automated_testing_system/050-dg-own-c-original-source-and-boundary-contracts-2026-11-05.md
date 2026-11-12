# Shard 050: DG-OWN-C original source and boundary contracts (2026-11-05)

Source: `Plans/Automated_Testing_System.md`

Source lines: L7479-L7708

Source SHA256: `4817750890233cdabffc534e641092c029fff9a44ce0d0b376e1ef31ae6707e0`

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

The complete newly authored contract is `Plans/goal_own_c_contracts/protocol.md` (Goal update approval and complete original route oracles). Its schema roots are `Plans/goal_own_c_contracts/contracts.schema.json`; complete original source roots and methods remain selected in their original banks.

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

The complete newly authored contract is `Plans/goal_own_c_contracts/protocol.md` (Goal cancellation migration and three original route oracles). Its schema roots are `Plans/goal_own_c_contracts/contracts.schema.json`; complete original source roots and methods remain selected in their original banks.

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

ContractRef: ContractName:Plans/goal_run_projection_reference_contracts/certified.md
