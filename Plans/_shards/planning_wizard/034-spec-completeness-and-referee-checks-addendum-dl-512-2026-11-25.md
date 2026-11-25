# Shard 034: Spec completeness and referee checks addendum (DL-512, 2026-11-25)

Source: `Plans/Planning_Wizard.md`

Source lines: L4959-L5098

Source SHA256: `0d913b07eb9880f4abc434bd04e0e2f03a5c9b035fc22dce79d71f9395b264b3`

---

## Spec completeness and referee checks addendum (DL-512, 2026-11-25)

Jared chose on 2026-11-24 that spec checks run while planning and when WorkNodes are made (DL-512). Build tests check
code against the plan; they cannot find a plan's own gaps or design bugs, so the Planning Wizard checks the plan
itself before Approve And Build.

### PWIZ-110 - Spec Completeness Check While Planning

```yaml
plan_unit_id: PWIZ-110
unit_type: requirement
status: accepted
owner_doc: Plans/Planning_Wizard.md
canonical_text: >-
  Before a topic becomes Ready, as part of the PWIZ-006 audit, a completeness check runs over the topic's contracts;
  at final integration (PWIZ-007) it runs over every contract in the plan. Contracts are the data shapes, events,
  commands, operations, stateful entities and requirements the plan defines. The check looks for six kinds of
  finding: a named field without a type; an operation or command without its failure results, each with a declared
  failure code; an entity whose state changes without a state machine that names its states, transitions, triggers
  and terminal states; a requirement without acceptance criteria or a validation surface; a pointer to a section, unit
  or artifact that does not resolve; and the same identifier declared with different types or enumeration members, or
  two statements that contradict each other. Code finds, without a model call, what structured declarations show:
  fields without types in tables and schemas, unresolved pointers, and one identifier declared with different types
  or enumeration members. These code-found findings are part of PWIZ-028's deterministic checks and must pass. The
  PWIZ-006 Auditor agent, which may run on the same model as the topic, checks the rest, including names that drift
  and prose that contradicts itself. Its findings carry finding_level and repair_required like any review finding and
  go through PWIZ-028's one bounded repair round and affected-rows re-review. A finding that remains afterwards is
  recorded as a PWIZ-028 open question on the plan with its PWIZ-012 gap class; it does not hold the topic out of
  Ready, and it reaches Plans/Plan_To_Node_Compilation.md#PNC-038 as a recorded gap on the affected contract. A
  completeness finding takes one of the PWIZ-012 classes auto_resolvable, safe_default_with_assumption,
  defer_to_plan_compile or defer_to_worknode_system. It becomes requires_user_policy_decision only when the missing
  detail is a product-policy choice with no safe inference, and it then reaches the user as a plain decision; a
  technical detail never becomes a question for the user.
gui_related: false
gui_classification_reason: Backend planning check; its findings reach the user only through existing plain decision cards.
depends_on: [DL-512, PWIZ-005, PWIZ-006, PWIZ-007, PWIZ-012, PWIZ-028]
unblocks: [PWIZ-111, PNC-038]
acceptance_criteria:
  - "The check runs over the topic's contracts before the topic becomes Ready and over every contract at final integration, and records each finding with its contract, kind, PWIZ-012 gap class, finding_level and outcome."
  - "Fields without types in structured declarations, unresolved pointers, and one identifier declared with different types or enumeration members are found by code without a model call, and must pass as PWIZ-028 deterministic checks."
  - "Auditor-found findings go through PWIZ-028's bounded round; any left are recorded as open questions and as recorded gaps for PNC-038, and do not hold the topic out of Ready."
  - "No completeness finding becomes a technical question to the user; only a product-policy gap reaches the user, as a plain decision."
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
risk_class: spec_gap_escape
reasoning_tier: high
context_scope: planning_spec_checks
implementation_surfaces: [Plans/Planning_Wizard.md, Plans/Plan_To_Node_Compilation.md, Plans/Automated_Testing_System.md]
node_compile_hint: {mode: accepted_planning_only, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - Plans/Decision_Log.md#DL-512
  - "/mnt/Cursor/share/puppet-master/2026-11-04-program/streams/C-REPORT.md, section 'Open findings left for the canon owners' (thin specs: fields without types, missing failure results, retry rules, state machines and acceptance criteria; contradictions and drift)"
preserved_exact_tokens:
  - "completeness check"
  - "finding_level"
  - "repair_required"
  - "auto_resolvable"
  - "safe_default_with_assumption"
  - "requires_user_policy_decision"
negative_constraints:
  - Do not ask the user a technical question to fill a completeness finding.
  - Do not add repair rounds beyond PWIZ-028's bounded acceptance, and do not hold a topic out of Ready over a recorded non-blocking open question.
  - Do not let the completeness check stand in for PWIZ-111's referee check on a risky contract.
owner_hints: [Plans/Planning_Wizard.md, Plans/Plan_To_Node_Compilation.md, Plans/Automated_Testing_System.md]
```

### PWIZ-111 - Referee Check For Risky Contracts While Planning

```yaml
plan_unit_id: PWIZ-111
unit_type: requirement
status: accepted
owner_doc: Plans/Planning_Wizard.md
canonical_text: >-
  A contract is risky when its owner has a lifecycle state machine (start, cancel, complete or similar); writes whose
  correctness depends on ordering, idempotency, restore or recovery, such as checkpoints, restore points or an event
  log (plain create, read, update and delete persistence does not count); more than one writer (fencing or leases);
  or a security or permission boundary that refuses some callers. For each risky contract the topic's planning agent
  writes a referee from the owner's behaviour text, meaning its operations, states, transitions and declared failure
  results. The referee is a small executable owner model whose input is a prior owner state plus one operation or
  event, or a short sequence of them, and whose output is the resulting state or a refusal with one of the contract's
  declared failure codes. A rule whose refusal has no declared failure code is a PWIZ-110 finding. The rules under test
  are the contract's schema rules and acceptance criteria, sourced separately from the referee. Each rule gets one
  passing and one refusing case, and each risk property its matching cases: every state-machine transition and at
  least one illegal transition from each state; a write, a cut and a reopen; a stale writer after a fencing change;
  and a caller denied without permission. Where the contract has a schema, code also generates inputs that each break
  exactly one rule, and the schema validator, not the referee, confirms that each breaks only that rule. Each refusing
  case must be refused with its rule's code, and each passing case accepted with the expected resulting state. When the
  referee and a rule disagree, the owner text decides: a referee that departs from the owner text is repaired, and owner
  text that lacks the check is a design finding. Design findings carry finding_level and repair_required and go
  through PWIZ-028's bounded round; one that remains afterwards is recorded as an open question, reaches PNC-038 as a
  recorded gap, and reaches the user only as a plain decision when fixing it is a product-policy choice. A rule is a
  named gap only with code evidence: the generator tried single-rule breaks of that rule, every one also broke another
  rule, and the listed catching rules refused each such input with their own codes; those inputs are recorded. Without
  that evidence the rule is a design finding or a test gap. Each risky contract has a budget the planning run sets,
  200 generated inputs or 10 minutes of machine time by default; rules not reached within it are listed as test gaps
  for PNC-038, never as named gaps. The referee, its cases, the generated inputs, the outcomes, the named gaps and the
  test gaps are planning evidence that Plans/Plan_To_Node_Compilation.md#PNC-038 turns into WorkNode fixtures. The
  check runs with the models the planning run already uses plus code: it never requires an additional independent
  model, a two-reviewer proof or a technical question to the user. A contract that is not risky gets PWIZ-110's
  completeness check and PNC-038's generated fixtures.
gui_related: false
gui_classification_reason: Backend planning check; design findings reach the user only through existing plain decision cards.
depends_on: [DL-512, PWIZ-110, PWIZ-006, PWIZ-012, PWIZ-028]
unblocks: [PNC-038]
acceptance_criteria:
  - "Each risky contract is recorded with the property that made it risky; plain create, read, update and delete persistence alone does not make a contract risky."
  - "Referee inputs are a prior state plus an operation or event, or a short sequence, and the cases cover every state-machine transition with an illegal transition from each state, a write-cut-reopen case, a stale-writer case and a denied-caller case wherever the matching property applies."
  - "Refusal codes are the contract's declared failure codes, and the schema validator confirms that each generated input breaks exactly one rule."
  - "Each named gap carries recorded inputs showing that every single-rule break of it also broke another rule, which refused it with its own code."
  - "Rules not reached within the budget are listed as test gaps, never as named gaps."
  - "Design findings follow PWIZ-028's bounded round; leftovers are open questions and recorded gaps and do not hold the topic out of Ready."
  - "The check needs no additional independent model, no two-reviewer proof and no technical user question."
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
risk_class: design_bug_escape
reasoning_tier: high
context_scope: planning_spec_checks
implementation_surfaces: [Plans/Planning_Wizard.md, Plans/Plan_To_Node_Compilation.md, Plans/Automated_Testing_System.md]
node_compile_hint: {mode: accepted_planning_only, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - Plans/Decision_Log.md#DL-512
  - "/mnt/Cursor/share/puppet-master/2026-11-23-spec-check-placement/E-ANSWERS.md (stream E: kills, controls and named gaps for the Goal/Run families; its three product findings were sequence bugs)"
  - "pm-mail 1125004841-a1d8 (pm-ea-lead, 2026-11-25): the four risk properties, and the smallest owner model a planning wizard needs"
preserved_exact_tokens:
  - "referee"
  - "named gap"
  - "test gap"
  - "lifecycle state machine"
  - "more than one writer"
  - "declared failure code"
negative_constraints:
  - Do not require an additional independent model, a two-reviewer proof or a technical user question for the referee check.
  - Do not build the referee from the rules it is tested against; build it from the owner's behaviour text.
  - Do not record a rule as a named gap without the code evidence this unit requires; an unreached or unenforced rule is a test gap or a design finding.
  - Do not count a named gap or a test gap as a passing test.
owner_hints: [Plans/Planning_Wizard.md, Plans/Plan_To_Node_Compilation.md, Plans/Automated_Testing_System.md]
```

ContractRef: ContractName:Plans/Decision_Log.md#DL-512, ContractName:Plans/Planning_Wizard.md#PWIZ-005, ContractName:Plans/Planning_Wizard.md#PWIZ-006, ContractName:Plans/Planning_Wizard.md#PWIZ-007, ContractName:Plans/Planning_Wizard.md#PWIZ-012, ContractName:Plans/Planning_Wizard.md#PWIZ-028, ContractName:Plans/Plan_To_Node_Compilation.md#PNC-038
