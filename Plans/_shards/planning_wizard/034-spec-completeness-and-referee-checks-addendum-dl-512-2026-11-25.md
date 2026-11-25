# Shard 034: Spec completeness and referee checks addendum (DL-512, 2026-11-25)

Source: `Plans/Planning_Wizard.md`

Source lines: L4959-L5072

Source SHA256: `f34fac3bd5211bed5c9ef98ca9aada3a6ba250b880a03a37a894107b489d8199`

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
  At topic Ready (PWIZ-006) and again at final integration (PWIZ-007), a completeness check runs over every contract
  the plan defines: data shapes, events, commands, operations, stateful entities and requirements. It reports six
  kinds of finding: a named field without a type; an operation or command without its failure results; an entity
  whose state changes without a state machine that names its states, transitions, triggers and terminal states; a
  requirement without acceptance criteria or a validation surface; a pointer to a section, unit or artifact that does
  not resolve; and two statements that give the same value, name or enumeration differently. Code finds what the text
  structure shows (untyped fields in tables and schemas, unresolved pointers, conflicting enumerations and names)
  without a model call; the topic's planning model checks the rest against the same six kinds. Findings enter the
  bounded repair round of PWIZ-006 and PWIZ-028 as auto_resolvable or safe_default_with_assumption gaps; only product
  policy with no safe inference reaches the user, as a plain decision under PWIZ-012's gap classes. A topic is not
  Ready, and Approve And Build stays disabled, while a completeness finding is open, except an item recorded under
  PWIZ-012's user-approved incomplete-item rule.
gui_related: false
gui_classification_reason: Backend planning check; its findings reach the user only through existing plain decision cards.
depends_on: [DL-512, PWIZ-006, PWIZ-007, PWIZ-012, PWIZ-028]
unblocks: [PWIZ-111, PNC-038]
acceptance_criteria:
  - "The check runs at topic Ready and at final integration, and records each finding with its contract, its kind and its repair or decision."
  - "Untyped fields, unresolved pointers and conflicting enumerations or names are found by code without a model call."
  - "Findings are repaired inside the bounded repair round; none becomes a technical question to the user."
  - "Approve And Build is not enabled while a completeness finding is open, except a PWIZ-012 user-approved incomplete item."
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
risk_class: spec_gap_escape
reasoning_tier: high
context_scope: planning_spec_checks
implementation_surfaces: [Plans/Planning_Wizard.md, Plans/Automated_Testing_System.md]
node_compile_hint: {mode: canonical_planunit, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - Plans/Decision_Log.md#DL-512
  - "/mnt/Cursor/share/puppet-master/2026-11-04-program/streams/C-REPORT.md, section 'Open findings left for the canon owners' (thin specs: fields without types, missing failure results, retry rules, state machines and acceptance criteria)"
preserved_exact_tokens:
  - "completeness check"
  - "auto_resolvable"
  - "safe_default_with_assumption"
negative_constraints:
  - Do not ask the user a technical question to fill a completeness finding.
  - Do not add an unbounded audit loop; the check runs inside PWIZ-028's bounded acceptance.
  - Do not let the completeness check stand in for PWIZ-111's referee check on a risky contract.
owner_hints: [Plans/Planning_Wizard.md, Plans/Automated_Testing_System.md]
```

### PWIZ-111 - Referee Check For Risky Contracts While Planning

```yaml
plan_unit_id: PWIZ-111
unit_type: requirement
status: accepted
owner_doc: Plans/Planning_Wizard.md
canonical_text: >-
  A contract is risky when its owner has a lifecycle state machine (start, cancel, complete or similar), durable
  writes (storage, checkpoints, restore points or an event log), more than one writer (fencing or leases), or a
  security or permission boundary. For each risky contract the topic's planning model writes, with the plan, a
  referee: a small executable owner model that applies the contract's rules to an input and either accepts it or
  refuses it with a named code, plus one passing and one refusing example for each rule. Code then runs every example
  through the referee and, where the contract has a schema, generates further inputs that each break exactly one rule;
  each refusing input must be refused with its rule's code and each passing input accepted. A rule the referee does
  not enforce is a design finding: it goes to the bounded repair round of PWIZ-006 and PWIZ-028, and reaches the user
  only as a plain decision when fixing it is a product-policy choice. A rule that no single input can break without
  breaking another rule is recorded as a named gap, with the rules that catch it; it needs no written proof. The
  referee, its examples, the generated inputs, the outcomes and the named gaps are planning evidence that PNC-038
  turns into WorkNode fixtures. The check runs on the user's one model plus code: it never needs a second model, a
  two-reviewer proof or a technical question to the user. A contract that is not risky gets PWIZ-110's completeness
  check only.
gui_related: false
gui_classification_reason: Backend planning check; design findings reach the user only through existing plain decision cards.
depends_on: [DL-512, PWIZ-110, PWIZ-006, PWIZ-012, PWIZ-028]
unblocks: [PNC-038]
acceptance_criteria:
  - "Each risky contract is recorded with the property that made it risky."
  - "Each risky contract's referee refuses every rule's refusing input with that rule's named code and accepts every passing input, or the rule is a recorded design finding or named gap."
  - "Design findings are repaired or decided before the topic is Ready."
  - "Each named gap lists the rules that catch it."
  - "The check uses one model plus code and asks the user nothing technical."
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
risk_class: design_bug_escape
reasoning_tier: high
context_scope: planning_spec_checks
implementation_surfaces: [Plans/Planning_Wizard.md, Plans/Plan_To_Node_Compilation.md, Plans/Automated_Testing_System.md]
node_compile_hint: {mode: canonical_planunit, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - Plans/Decision_Log.md#DL-512
  - "/mnt/Cursor/share/puppet-master/2026-11-23-spec-check-placement/E-ANSWERS.md (stream E: kills, controls and named gaps for the Goal/Run families)"
  - "pm-mail 1125004841-a1d8 (pm-ea-lead, 2026-11-25): the four risk properties, and the smallest owner model a planning wizard needs"
preserved_exact_tokens:
  - "referee"
  - "named gap"
  - "lifecycle state machine"
  - "durable writes"
  - "more than one writer"
  - "security or permission boundary"
negative_constraints:
  - Do not require a second model, a two-reviewer proof or a technical user question for the referee check.
  - Do not record a rule the referee fails to enforce as a named gap; a named gap is only a rule no single input can isolate.
  - Do not count a named gap as a passing test.
owner_hints: [Plans/Planning_Wizard.md, Plans/Plan_To_Node_Compilation.md, Plans/Automated_Testing_System.md]
```

ContractRef: ContractName:Plans/Decision_Log.md#DL-512, ContractName:Plans/Planning_Wizard.md#PWIZ-006, ContractName:Plans/Planning_Wizard.md#PWIZ-007, ContractName:Plans/Planning_Wizard.md#PWIZ-012, ContractName:Plans/Planning_Wizard.md#PWIZ-028, ContractName:Plans/Plan_To_Node_Compilation.md#PNC-038
