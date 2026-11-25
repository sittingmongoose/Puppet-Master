# Shard 034: Spec completeness and referee checks addendum (DL-512, 2026-11-25)

Source: `Plans/Planning_Wizard.md`

Source lines: L4959-L5162

Source SHA256: `9d8097795717f3ddfcdfff522a18b3886835752a09a513bdfb109f547751a158`

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
  failure code, or a declared failure of an operation, command or event whose contract leaves undecidable, on any of
  its callable surfaces, whether its passing neighbour, as Plans/Plan_To_Node_Compilation.md#PNC-038 defines it, is
  accepted, a failure for which the approved outcomes establish the evidenced limit that definition names not being
  flagged (PNC-038 carries it as a recorded gap in place of the missing passing neighbour); an entity whose state changes without a state machine that names its states, transitions, triggers
  and terminal states, or whose state machine leaves the outcome of a named state and operation pair unstated; a requirement without acceptance criteria or a validation surface; a pointer to a section, unit
  or artifact that does not resolve, including an operation or event without an interface binding (the callable
  surface it maps to: a route, command, function or storage port, and the observation surfaces through which its
  state and effects are read, written by the planning agent), or without an observation surface for a state or
  effect assertion its owner text states; and the same identifier declared with incompatible types or enumeration members for overlapping cases, or
  two statements that contradict each other. Code finds, without a model call, what structured declarations show:
  fields without types in tables and schemas, unresolved pointers, and one identifier declared with incompatible types
  or enumeration members for overlapping cases, where one identifier is one named contract, type, enumeration, event, command or state, or one
  field path of one contract, including a field the plan declares to be the same as another by reference or explicit
  pointer; same-named fields of distinct contracts are not a code-found finding, and the Auditor judges them as possible
  drift. Declared unions, mutually exclusive routes or conditional branches, and versioned definitions are judged within
  their own scope, a selector predicate is read as a selector, and where code cannot establish that two declarations
  apply to overlapping cases, or that they are incompatible, the pair goes to the Auditor instead of failing the check. These code-found findings are part of PWIZ-028's deterministic checks and must pass; a code-found finding passes as deferred only when its declaration carries an explicit gap marker (provenance gap with a
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
  technical detail never becomes a question for the user. A pointer is an unresolved-pointer finding only when its
  target is confirmed absent: a lookup stopped at an existing access or authority gate (such as a changed SSH host key
  awaiting the approval its own contract requires) keeps the PWIZ-012 class or typed blocker that gate defines
  (requires_external_credential, requires_user_risk_acceptance or an infrastructure blocker), goes through that gate's
  existing owner, and is retried once access returns.
gui_related: false
gui_classification_reason: Backend planning check; its findings reach the user only through existing plain decision cards.
depends_on: [DL-512, PWIZ-006, PWIZ-007, PWIZ-011, PWIZ-012, PWIZ-028]
unblocks: [PWIZ-111, PNC-038]
acceptance_criteria:
  - "The check runs over the topic's contracts before the topic becomes Ready and over every contract at final integration, and records each finding with its contract, kind, PWIZ-012 gap class, finding_level and outcome."
  - "Fields without types in structured declarations, unresolved pointers, and one identifier (one named contract, type, enumeration, event, command or state, or one field path of one contract, including a field declared the same as another by reference or pointer) declared with incompatible types or enumeration members for overlapping cases are found by code without a model call, and must pass as PWIZ-028 deterministic checks; same-named fields of distinct contracts are left to the Auditor as possible drift; a lawful conditional pair, such as a terminal route's null target beside a continuing route's stage name, passes, a genuine same-scope conflict fails, and uncertain overlap, or established overlap with unresolved type or enumeration-member compatibility, goes to the Auditor."
  - "Auditor-found findings go through PWIZ-028's bounded round; non-blocking ones left are recorded as open questions and as recorded gaps for PNC-038 and do not hold the topic out of Ready, and a blocking one left is a PWIZ-006 typed blocker."
  - "Every operation or event has an interface binding that resolves, including an observation surface for every owner-stated state or effect assertion, or a completeness finding of the pointer kind when the binding or surface is confirmed missing; a lookup blocked at an existing access or authority gate keeps that gate's class or blocker and is retried once access returns."
  - "No completeness finding becomes a technical question to the user; only a product-policy gap reaches the user, as a plain decision; a lookup stopped at an access or authority gate keeps that gate's PWIZ-012 class or typed blocker and is retried once access returns, never recorded as an unresolved pointer."
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
  The check runs before a topic becomes Ready and reruns for a risky contract when final integration changes its own
  declaration or any resolved dependency its referee or cases use, such as a referenced owner schema behind a
  byte-identical consumer declaration; the dependencies come from PWIZ-005's impact propagation and PWIZ-007's
  integration dependency computation, and the rerun stays within PWIZ-028's bounded review. For each risky
  contract the topic's planning agent
  writes a referee from the owner's behaviour text, meaning its operations, states, transitions and declared failure
  results. The referee is a small executable owner model whose input is a prior owner state plus one operation or
  event, or a short sequence of them, and whose output is the resulting state, any returned result and the observable effects, or a refusal with one of the
  contract's declared failure codes together with the state and effects that remain after it. The referee's state marks which parts survive a cut or restart. A rule whose refusal has no
  declared failure code is a PWIZ-110 finding; a declared validation code shared by several rules is enough when the validator's error path, together with the
  member for a per-member rule, names the rule, and each case records that expected identity. The rules under test are the contract's schema rules and its behavioural acceptance criteria (those with an input
  and an observable outcome), sourced separately from the referee; shape checks get an acceptance-only passing case,
  and criteria without an input and an outcome (latency gates, visual checks) keep their ATS-003 oracles. Each schema rule gets a case for each polarity the approved contract makes possible for its effective assertion,
  so that together they fail a validator that drops the rule, wherever dropping it can change the approved outcome, or rejects every valid value of the active field, and, with the contrasting control below, one that applies an if-selected assertion on a route its selector does not select (the companion's validation scenarios fix that fault set): a refusing case and a passing case that reaches and satisfies the same assertion in the same applicable branch
  or route; the passing polarity counts as impossible only on recorded code evidence that no accepted input reaches and satisfies the assertion in its branch (as with a false subschema), and the refusing polarity only on recorded code evidence of a kind the companion defines and validates (such as catching rules that always refuse every violation first, which is a named gap, a selector that guarantees the assertion, or a deletion that changes no approved outcome); where the bounded search records code evidence that no attributable refusal demonstrates the assertion's deletion, a recorded deletion witness, a payload whose whole-contract outcome changes when just that assertion is deleted, bound with its original approved outcome (accepted, or refused by an enclosing wrapper), is the rule's required test for the refusing polarity and earns deletion-detection credit, never refusal credit; any other impossible polarity needs no fixture and earns no credit, a polarity missing without that evidence or witness is a test gap, and the companion fixes the evidence kinds and the proof method; for an assertion an if selects
  the passing cases include one on each route that can accept a payload under the whole approved contract (a route the
  contract requires to accept but for which no valid case exists keeps its finding or test gap) and, wherever the contract admits one, a contrasting accepted control: an input that breaks the assertion on a route that does not select it, with any routing fields that route requires, expected to be accepted; it reuses a selector-switched refusing input where that payload is valid on the other route, and is otherwise generated separately; each behavioural acceptance criterion gets a case for each input condition it lists, asserting the outcome it
  states and carrying its state and effect assertions (a refusal only where it prescribes one, otherwise its stated resulting state or
  returned result), a mixed criterion's specified outcomes getting cases while its measured obligations keep its
  ATS-003 oracle; and each
  risk property gets its matching cases: every state-machine transition and at
  least one illegal transition from each state wherever a declared operation or sequence can produce one (a state whose
  closed transition table is total records its covered state and operation pairs instead, and an unspecified
  transition is that PWIZ-110 state-machine finding, or a design finding when the referee first meets it); a write, a cut and a reopen; for more than one writer, a stale writer after
  a fencing change where the contract fences writers, otherwise the writer orders the owner's concurrency guarantee
  requires, each with its exact stated result (for pairwise commutativity such as a set union, both orders of each
  required pair), and where a larger required family exceeds the budget, one bounded gap record names the untested set
  and the tested representatives while that coverage stays open; and for a permission boundary, a caller denied without permission where the
  contract denies the action, otherwise each caller's exact visible result (such as a filtered list). Where the contract has a schema, code also generates refusing inputs for its schema rules and credits them only as the
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
  else assertions rather than a rule of its own. Starting from a valid control where the contract admits one, or, where code establishes that the target admits
  no passing input, from a directly constructed negative candidate held to the same whole-contract refusal and
  attribution checks, code runs the rule's bounded candidate
  generator and binds a refusal as soon as the whole contract refuses an input because of that rule alone, as the
  companion's attribution of the validator's output shows; a wrapper error counts as that cause only when the wrapper
  refused through the rule's own failure; the rule is a named gap only when code establishes that its catching rules cover every violation of it (for example, a type restriction whose sibling enumeration admits only that type), each recorded input refused by the catching rules with their own codes and recorded; a search that ends with neither an attributable refusal, recorded impossibility evidence nor a recorded deletion
  witness leaves a test gap for the missing refusing case, carrying
  the exhausted search with its recorded inputs and codes as evidence, whose test_gap_policy PlanCompile sets from what
  is actually missing (Plans/Plan_To_Node_Compilation.md#PNC-038). An input the contract accepts through another branch, or refuses only because of an independent assertion, never
  earns refusal credit for a branch's rule, though a recorded deletion witness earns deletion-detection credit. A keyword the companion does not support ends only in a binding or a test gap, never in a named gap. The candidate generator and the coverage condition for each supported keyword, with their validation scenarios, are fixed in the companion change that Plans/Plan_To_Node_Compilation.md#PNC-038 names, together with the effective-assertion definitions, the refusal attribution for oneOf, anyOf, not and if/then/else,
  and how a per-member rule's member is read,
  and the planning check and PlanCompile use the same generators and stopping condition. Each risky contract has a budget the planning run sets,
  200 generated inputs or 10 minutes of machine time by default, whichever comes first; the required cases run first
  and count against it, and every required case left unrun at the limit, including the remaining cases of a rule the run had started, is
  listed under its rule as a test gap for PNC-038 (a writer-order family over the budget listed by its one bounded gap
  record), never as a named gap. The referee, its cases, the generated inputs, the observed outcomes, the named gaps and the test gaps are planning
  evidence. Plans/Plan_To_Node_Compilation.md#PNC-038 binds as WorkNode fixtures only the cases whose expected outcome
  the approved contract states; an observed outcome is never a fixture's expectation. The
  check runs with the models the planning run already uses plus code: it never requires an additional independent
  model, a two-reviewer proof or a technical question to the user. A contract that is not risky gets PWIZ-110's
  completeness check and PNC-038's generated fixtures.
gui_related: false
gui_classification_reason: Backend planning check; design findings reach the user only through existing plain decision cards.
depends_on: [DL-512, PWIZ-110, PWIZ-005, PWIZ-006, PWIZ-007, PWIZ-011, PWIZ-012, PWIZ-028]
unblocks: [PNC-038]
acceptance_criteria:
  - "Each risky contract is recorded with the property that made it risky; plain create, read, update and delete persistence, or plain authentication, alone does not make a contract risky."
  - "The check runs before a topic becomes Ready and reruns when final integration changes the contract's own declaration or a resolved dependency its referee or cases use, a referenced owner change behind a byte-identical consumer declaration included."
  - "Referee inputs are a prior state plus an operation or event, or a short sequence, and the cases cover every state-machine transition with an illegal transition from each state wherever a declared operation or sequence can produce one, a total transition table recording its covered pairs instead, a write-cut-reopen case, and for writers and permissions the cases the owner's own mechanism defines (a stale fenced writer or the writer orders the owner's concurrency guarantee requires, with one bounded gap record for an untested larger family; a denied caller or each caller's exact visible result) wherever the matching property applies."
  - "Refusal codes are the contract's declared failure codes; a generated input earns refusal credit for a rule only when the whole contract refuses it because of that rule, by the companion's attribution, while multi-rule inputs remain admissible as named-gap evidence."
  - "A named gap rests on code-established coverage of the rule by its catching rules, with the recorded inputs and codes; a search that ends with neither an attributable refusal, recorded impossibility evidence nor a recorded deletion witness is a test gap, and a witness earns deletion-detection credit, never refusal credit; each member of a required list or other per-member constraint that stays per-member after the companion's attribution (not one inside a not, which is one assertion) is its own rule under the same polarity rule: its own refusal wherever that polarity is possible, otherwise its recorded evidence (recorded code evidence of a kind the companion defines (such as a named gap, a selector that guarantees the assertion, or a deletion that changes no approved outcome), or, where the bounded search records code evidence that no attributable refusal demonstrates the deletion, a recorded deletion witness whose whole-contract outcome changes when just that assertion is deleted, bound with its original approved outcome, which is then its required test); a refusal is credited to a rule only when the whole contract refuses the input because of that rule, by the companion's attribution."
  - "Every case checks its outcome and every owner-stated state and effect assertion through a declared observation surface, for either polarity."
  - "A schema rule has a case for each polarity the approved contract makes possible, its passing case reaching and satisfying the same effective assertion in the same applicable branch of the assertion, a passing case being excused only on recorded code evidence that no accepted input reaches and satisfies the assertion, and a refusing case only on code-established evidence recorded with the rule (recorded code evidence of a kind the companion defines (such as a named gap, a selector that guarantees the assertion, or a deletion that changes no approved outcome), or, where the bounded search records code evidence that no attributable refusal demonstrates the deletion, a recorded deletion witness whose whole-contract outcome changes when just that assertion is deleted, bound with its original approved outcome, which is then its required test); an assertion an if selects has a passing case on each route that can accept a payload under the whole approved contract and, wherever the contract admits one, a contrasting accepted control that still breaks it on a route that does not select it."
  - "The budget ends at whichever limit comes first, required cases run first, and every required case left unrun at the limit, including the rest of a rule whose cases were partly run (as when the budget ends between two required cases of one rule), is listed under its rule as a test gap, a writer-order family over the budget by its one bounded gap record, never as a named gap."
  - "Design findings follow PWIZ-028's bounded round; non-blocking leftovers are open questions and recorded gaps that do not hold the topic out of Ready, and a blocking leftover is a PWIZ-006 typed blocker."
  - "Referee cases cover schema rules and behavioural acceptance criteria only; other criteria keep their ATS-003 oracles, and a mixed criterion's measured obligations keep its oracle while its specified outcomes get referee cases."
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

ContractRef: ContractName:Plans/Decision_Log.md#DL-512, ContractName:Plans/Planning_Wizard.md#PWIZ-005, ContractName:Plans/Planning_Wizard.md#PWIZ-006, ContractName:Plans/Planning_Wizard.md#PWIZ-007, ContractName:Plans/Planning_Wizard.md#PWIZ-011, ContractName:Plans/Planning_Wizard.md#PWIZ-012, ContractName:Plans/Planning_Wizard.md#PWIZ-028, ContractName:Plans/Plan_To_Node_Compilation.md#PNC-038
