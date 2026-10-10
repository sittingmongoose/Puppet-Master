# Shard 041: Collaborative Workflows static contract family — 2026-09-27

Source: `Plans/Automated_Testing_System.md`

Source lines: L5437-L5530

Source SHA256: `6dafd1db8537fab7df8c76a3003bec2d0b39ba27c6a40e58919b04c3174607b6`

---

## Collaborative Workflows static contract family — 2026-09-27

### ATS-062 - Collaborative Workflows Static Contract Family Registration

```yaml
plan_unit_id: ATS-062
unit_type: validation_criterion
status: accepted
owner_doc: Plans/Automated_Testing_System.md
canonical_text: >-
  Plans/collaborative_workflows_contracts.schema.json and
  Plans/collaborative_workflows_contract_fixtures.json retain the Collaborative Workflows static
  contract family for Plans/Collaborative_Workflows.md, under the schema path that Commands_System.md
  already names for every collaborative command: the section 12 records (CollaborativeDefinition,
  ParticipantSpec, CollaborativeRun, CollaborationMessage, QuestionBank, BrainstormProposal,
  BrainstormVote, ReviewTargetPack, ReviewFinding), the participant disposition of PART-001..006, the
  completion projection of CWR-029, the participant activity projection of CWR-030 with its
  live_message_id, the helper message in progress of Plans/Executor_Protocol.md EP-129 (DL-137), the
  team preset of CWR-039, and the request and result of every collaborative command, including
  cmd.chat_room.end and cmd.brainstorm.research_lead (CWR-031, DL-130) and ComposerBufferResult. It
  originally shipped 95 positive fixtures and 116 negative fixtures. The DL-138 companion edition
  contains 98 positive fixtures and 128 negative fixtures, each negative mutating one named positive
  so that it fails for one named constraint. The negatives prove that a definition cannot store a substitution policy,
  carry another kind's fields, give Review a specialist or give Grill Me a Persona; that a Crew
  Auto admission cannot omit its crew_auto_revision and cmd.collaboration.start cannot admit Build
  With Crew; that a run carries stop_reason exactly when it is cancelled, from the closed set of
  CWR-029, and a run stopped at its limit cannot settle failed; that a Review start cannot omit or silently swap its target; that configure cannot
  return a run and a refused start cannot return one; that a refusal cannot omit its typed error or
  claim work; that reconfigure cannot leave a run completed and End discussion cannot settle
  cancelled; that a completion projection cannot be clean with an attention reason, cannot use
  limit_reached, and maps accept_partial, finish_stale and restart_on_current only to their
  commands; that only needs_you carries a decision; that an activity projection cannot hold
  streamed text or keep live_message_id once done or failed; that a message in progress cannot be a
  user or system message, cannot lack a participant's slot and attempt, and cannot carry text, a
  sequence or recipients; that a coordinator activity row has its run reference even without a
  participant row; that Send Findings cannot send, that its taught_rule_check source carries the
  saved reply_message_id and missed_teaching_refs without Review identifiers, and that its result
  records typed lineage only in metadata; that a substantiated lead cannot lack evidence; that CrewAutoSetRequest cannot omit its scope or name one
  outside project | thread (Plans/Collaborative_Workflows.md CWR-038), that scope project comes only from the
  Crew Auto sheet and carries the rules and the team, and that scope thread comes only from a chat's
  check and carries neither; that turning Crew Auto on for the project, from the Crew Auto sheet,
  cannot succeed without its project Settings transaction, while a chat's own Crew Auto check sets
  only that chat's override and cannot claim a project Settings transaction; and that the Crew Auto
  settings route, opened from the multi-agent menu, the Crew sheet or the crew_auto_receipt note,
  comes from no other surface and never turns Crew Auto on. Fields that still wait on an owner answer recorded as an open
  ledger question are not admitted. The pair is registered in the closed CONTRACT_PAIRS manifest of
  scripts/pm-new-contracts-verify.py, which owns that manifest's cardinality, and runs as the named
  subcheck validate-new-contracts in pm-plans-verify.py run-gates and audit-governance. This is
  static schema and fixture evidence only: no writer, storage key, EventRecord, native handler or
  production wiring is admitted, every command stays handler_unavailable, and runtime, provider,
  recovery, security, visual and performance proof remains NOT_RUN.
gui_related: true
gui_classification_reason: The retained shapes are what the collaboration sheets, run cards, run view and Crew Auto menu dispatch and read, which is a GUI obligation even though the surface contract is owned by Collaborative_Workflows.md.
split_recommended: false
depends_on: [ATS-046, CWR-029, CWR-030, CWR-031, CWR-038, EP-129]
unblocks: []
acceptance_criteria:
  - Every positive fixture validates against its named definition; every negative fixture is rejected.
  - Each negative fixture names the single constraint it must fail and the product rule behind it.
  - The authored CONTRACT_PAIRS cardinality matches EXPECTED_CONTRACT_PAIR_COUNT with the pair present exactly once.
  - No fixture success object is reported as handler, runtime, provider or readiness evidence.
validation_surfaces:
  - Plans/collaborative_workflows_contracts.schema.json
  - Plans/collaborative_workflows_contract_fixtures.json
  - python3 scripts/pm-new-contracts-verify.py
  - python3 scripts/pm-plans-verify.py validate-new-contracts
  - python3 scripts/pm-plans-verify.py run-gates
risk_class: static_fixture_or_false_execution_claim
reasoning_tier: high
context_scope: collaborative_workflows_static_contracts
implementation_surfaces: [Plans/Automated_Testing_System.md, Plans/collaborative_workflows_contracts.schema.json, Plans/collaborative_workflows_contract_fixtures.json, scripts/pm-new-contracts-verify.py]
node_compile_hint: {mode: static_contract_fixture_gate_only, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - Plans/Collaborative_Workflows.md#CWR-018
  - Plans/Commands_System.md#CS-085
  - Plans/Executor_Protocol.md#EP-129
  - Plans/Decision_Log.md#DL-137
  - Plans/Collaborative_Workflows.md#CWR-038
  - Plans/Decision_Log.md#DL-120
  - Plans/Decision_Log.md#DL-131
  - Plans/Decision_Log.md#DL-135
  - Plans/ledgers/v2/pldg-20260927-001-wand-collab-workflows/events.jsonl
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/IMPACT-REGISTER.md sha256:71227f8edda108ed849256d909ff12f859f98bef58202ef988f9d3b4e4f8d493 B-CW-29 (the companion task of ledger pldg-20260927-001-wand-collab-workflows, events evt-010, evt-019 and evt-023)"
preserved_exact_tokens: ["validate-new-contracts", "CONTRACT_PAIRS", "NOT_RUN", "116 negative fixtures", "static schema and fixture evidence only", "project Settings transaction"]
negative_constraints:
  - Do not infer runtime, provider, recovery, security, visual or performance results from fixture validation.
  - Do not add schemas or fixture pairs to the gate through an ambient glob.
  - Do not convert static validation into execution evidence, a registered command or a readiness unlock.
  - Do not admit a field or enum member that waits on an open owner question.
  - Do not restore a literal CONTRACT_PAIRS cardinality to this gate registration; that denominator belongs to scripts/pm-new-contracts-verify.py.
owner_hints: [Plans/Automated_Testing_System.md]
```

ContractRef: ContractName:Plans/Automated_Testing_System.md, ContractName:Plans/Collaborative_Workflows.md, ContractName:Plans/Commands_System.md#CS-085
