# Shard 034: Spec completeness and referee checks addendum (DL-512, 2026-11-25)

Source: `Plans/Planning_Wizard.md`

Source lines: L4959-L5134

Source SHA256: `d8c7b3510ae4eaeccd8b1bcfa490de1273c32041c08ce8bf32e1994170ce522a`

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
  at final integration (PWIZ-007) it runs over every contract in the plan as part of PWIZ-011's Final Plan Pack audit. Contracts are the data shapes, events,
  commands, operations, stateful entities and requirements the plan defines. The check looks for six kinds of
  finding: a named field without a type; an operation or command without its failure results, each with a declared
  failure code; an entity whose state changes without a state machine that names its states, transitions, triggers
  and terminal states; a requirement without acceptance criteria or a validation surface; a pointer to a section, unit
  or artifact that does not resolve, including an operation or event without an interface binding (the callable
  surface it maps to: a route, command, function or storage port, and the observation surfaces through which its
  state and effects are read, written by the planning agent), or without an observation surface for a state or
  effect assertion its owner text states; and the same identifier declared with different types or enumeration members, or
  two statements that contradict each other. Code finds, without a model call, what structured declarations show:
  fields without types in tables and schemas, unresolved pointers, and one identifier declared with different types
  or enumeration members. These code-found findings are part of PWIZ-028's deterministic checks and must pass; a code-found finding passes as deferred only when its declaration carries an explicit gap marker (provenance gap with a
  gap_note), and it then reaches PNC-038 as a recorded gap. A gap marker documents the deferral for the completeness
  check only and carries no approval authority: PWIZ-012's zero-incomplete gate still governs approval of any required
  detail left unresolved. The
  PWIZ-006 Auditor agent, which may run on the same model as the topic, checks the rest, including names that drift
  and prose that contradicts itself. Its findings carry finding_level and repair_required like any review finding and
  go through PWIZ-028's one bounded repair round and affected-rows re-review. A non-blocking finding that remains
  afterwards is recorded as a PWIZ-028 open question on the plan with its PWIZ-012 gap class; it does not hold the
  topic out of Ready, and it reaches Plans/Plan_To_Node_Compilation.md#PNC-038 as a recorded gap on the affected
  contract. A blocking finding the re-review still finds is a typed blocker under PWIZ-006. A
  completeness finding takes one of the PWIZ-012 classes auto_resolvable, safe_default_with_assumption,
  defer_to_plan_compile or defer_to_worknode_system. It becomes requires_user_policy_decision only when the missing
  detail is a product-policy choice with no safe inference, and it then reaches the user as a plain decision; a
  technical detail never becomes a question for the user.
gui_related: false
gui_classification_reason: Backend planning check; its findings reach the user only through existing plain decision cards.
depends_on: [DL-512, PWIZ-006, PWIZ-007, PWIZ-011, PWIZ-012, PWIZ-028]
unblocks: [PWIZ-111, PNC-038]
acceptance_criteria:
  - "The check runs over the topic's contracts before the topic becomes Ready and over every contract at final integration, and records each finding with its contract, kind, PWIZ-012 gap class, finding_level and outcome."
  - "Fields without types in structured declarations, unresolved pointers, and one identifier declared with different types or enumeration members are found by code without a model call, and must pass as PWIZ-028 deterministic checks."
  - "Auditor-found findings go through PWIZ-028's bounded round; non-blocking ones left are recorded as open questions and as recorded gaps for PNC-038 and do not hold the topic out of Ready, and a blocking one left is a PWIZ-006 typed blocker."
  - "Every operation or event has an interface binding that resolves, including an observation surface for every owner-stated state or effect assertion, or a completeness finding of the pointer kind."
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
  or a security or permission boundary under which the owner's rules differ by caller beyond plain authentication.
  The check runs before a topic becomes Ready and reruns for contracts that final integration changes. For each risky
  contract the topic's planning agent
  writes a referee from the owner's behaviour text, meaning its operations, states, transitions and declared failure
  results. The referee is a small executable owner model whose input is a prior owner state plus one operation or
  event, or a short sequence of them, and whose output is the resulting state, any returned result and the observable effects, or a refusal with one of the
  contract's declared failure codes together with the state and effects that remain after it. The referee's state marks which parts survive a cut or restart. A rule whose refusal has no
  declared failure code is a PWIZ-110 finding; a declared validation code shared by several rules is enough when the validator's error path, together with the
  member for a per-member rule, names the rule, and each case records that expected identity. The rules under test are the contract's schema rules and its behavioural acceptance criteria (those with an input
  and an observable outcome), sourced separately from the referee; shape checks get an acceptance-only passing case,
  and criteria without an input and an outcome (latency gates, visual checks) keep their ATS-003 oracles. Each schema rule gets at least one passing and one refusing case, and for an assertion an if selects the passing
  cases include one on each route the contract distinguishes and, wherever the contract admits one, a contrasting
  accepted control: the refusing input with the selector switched to a route that does not select the assertion, and
  with any routing fields that route requires, still breaking the assertion and expected to be accepted; each behavioural acceptance criterion gets a case for each input condition it lists, asserting the outcome it
  states and carrying its state and effect assertions (a refusal only where it prescribes one, otherwise its stated resulting state or
  returned result); and each
  risk property gets its matching cases: every state-machine transition and at
  least one illegal transition from each state; a write, a cut and a reopen; a stale writer after a fencing change;
  and a caller denied without permission. Where the contract has a schema, code also generates refusing inputs for its schema rules and credits them only as the
  search below describes; inputs that break several rules stay admissible as named-gap evidence. Each case carries its outcome (accepted with any stated result, or refused with its rule's code) and, for either
  polarity, every state and effect assertion the owner text states, such as a refusal that must leave the record,
  lifecycle and hold unchanged and append nothing, or a replay that must return the existing result without repeating
  its effect; the referee checks every assertion, and a required assertion with no observation surface is a PWIZ-110 completeness finding. When the
  referee and a rule disagree, the owner text decides: a referee that departs from the owner text is repaired, and owner
  text that lacks the check is a design finding. Design findings carry finding_level and repair_required and go through PWIZ-028's bounded round; a non-blocking one
  that remains afterwards is recorded as an open question and reaches PNC-038 as a recorded gap, a blocking one that
  remains is a typed blocker under PWIZ-006, and either reaches the user only as a plain decision when fixing it is a
  product-policy choice. A rule is a
  named gap only after a bounded isolation search, over the contract's schema rules, which are its effective validation assertions as the companion defines them: by
  default one keyword at one location, each member of a required list or other per-member constraint as its own rule, a
  not as one negative assertion whatever its subschema holds, with no per-member splitting inside it (accepted on a
  non-match, refused on a match), and an if as a selector of its then or
  else assertions rather than a rule of its own. Starting from a valid control, code runs the rule's bounded candidate
  generator and binds a refusal as soon as the whole contract refuses an input because of that rule alone, as the
  companion's attribution of the validator's output shows; a wrapper error counts as that cause only when the wrapper
  refused through the rule's own failure; the rule is a named gap only when code establishes that its catching rules cover every violation of it (for example, a type restriction whose sibling enumeration admits only that type), each recorded input refused by the catching rules with their own codes and recorded; a search that ends on collisions without that coverage leaves a test gap for the missing refusing case, carrying
  the exhausted search with its recorded inputs and codes as evidence, whose test_gap_policy PlanCompile sets from what
  is actually missing (Plans/Plan_To_Node_Compilation.md#PNC-038). An input the contract accepts through another branch, or refuses only because of an independent assertion, is never
  credited to a branch's rule. A keyword the companion does not support ends only in a binding or a test gap, never in a named gap. The candidate generator and the coverage condition for each supported keyword, with their validation scenarios, are fixed in the companion change that Plans/Plan_To_Node_Compilation.md#PNC-038 names, together with the effective-assertion definitions, the refusal attribution for oneOf, anyOf, not and if/then/else,
  and how a per-member rule's member is read,
  and the planning check and PlanCompile use the same generators and stopping condition. Each risky contract has a budget the planning run sets,
  200 generated inputs or 10 minutes of machine time by default, whichever comes first; the required cases run first
  and count against it, and rules not reached within it are listed as test gaps for PNC-038, never as named gaps. The referee, its cases, the generated inputs, the observed outcomes, the named gaps and the test gaps are planning
  evidence. Plans/Plan_To_Node_Compilation.md#PNC-038 binds as WorkNode fixtures only the cases whose expected outcome
  the approved contract states; an observed outcome is never a fixture's expectation. The
  check runs with the models the planning run already uses plus code: it never requires an additional independent
  model, a two-reviewer proof or a technical question to the user. A contract that is not risky gets PWIZ-110's
  completeness check and PNC-038's generated fixtures.
gui_related: false
gui_classification_reason: Backend planning check; design findings reach the user only through existing plain decision cards.
depends_on: [DL-512, PWIZ-110, PWIZ-006, PWIZ-007, PWIZ-011, PWIZ-012, PWIZ-028]
unblocks: [PNC-038]
acceptance_criteria:
  - "Each risky contract is recorded with the property that made it risky; plain create, read, update and delete persistence, or plain authentication, alone does not make a contract risky."
  - "The check runs before a topic becomes Ready and reruns for contracts that final integration changes."
  - "Referee inputs are a prior state plus an operation or event, or a short sequence, and the cases cover every state-machine transition with an illegal transition from each state, a write-cut-reopen case, a stale-writer case and a denied-caller case wherever the matching property applies."
  - "Refusal codes are the contract's declared failure codes; a generated input is credited to a rule only when the whole contract refuses it because of that rule, by the companion's attribution, while multi-rule inputs remain admissible as named-gap evidence."
  - "A named gap rests on code-established coverage of the rule by its catching rules, with the recorded inputs and codes; a search that ends on collisions without that coverage is a test gap; each member of a required list or other per-member constraint is its own rule with its own refusal; a refusal is credited to a rule only when the whole contract refuses the input because of that rule, by the companion's attribution."
  - "Every case checks its outcome and every owner-stated state and effect assertion through a declared observation surface, for either polarity."
  - "An assertion an if selects has a passing case on each route the contract distinguishes and, wherever the contract admits one, a contrasting accepted control that still breaks it on a route that does not select it."
  - "The budget ends at whichever limit comes first, required cases run first, and rules not reached within it are listed as test gaps, never as named gaps."
  - "Design findings follow PWIZ-028's bounded round; non-blocking leftovers are open questions and recorded gaps that do not hold the topic out of Ready, and a blocking leftover is a PWIZ-006 typed blocker."
  - "Referee cases cover schema rules and behavioural acceptance criteria only; other criteria keep their ATS-003 oracles."
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

ContractRef: ContractName:Plans/Decision_Log.md#DL-512, ContractName:Plans/Planning_Wizard.md#PWIZ-006, ContractName:Plans/Planning_Wizard.md#PWIZ-007, ContractName:Plans/Planning_Wizard.md#PWIZ-011, ContractName:Plans/Planning_Wizard.md#PWIZ-012, ContractName:Plans/Planning_Wizard.md#PWIZ-028, ContractName:Plans/Plan_To_Node_Compilation.md#PNC-038
