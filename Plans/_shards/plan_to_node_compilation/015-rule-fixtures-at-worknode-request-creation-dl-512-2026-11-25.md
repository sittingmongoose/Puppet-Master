# Shard 015: Rule fixtures at WorkNode request creation (DL-512, 2026-11-25)

Source: `Plans/Plan_To_Node_Compilation.md`

Source lines: L2169-L2311

Source SHA256: `f16e399a1ca5963755feeb094846c534517369525a1b3ac9127da5c6afc3a77f`

---

## Rule fixtures at WorkNode request creation (DL-512, 2026-11-25)

### PNC-038 - Rule Fixtures Bound At WorkNode Request Creation

```yaml
plan_unit_id: PNC-038
unit_type: requirement
status: accepted
owner_doc: Plans/Plan_To_Node_Compilation.md
canonical_text: >-
  When PlanCompile drafts WorkNodeRequest records (PNC-013), every rule of every contract reaches a node as tests in
  that node's test_binding. A node's contracts are the contracts its source_plan_unit_ids and
  source_acceptance_unit_ids reach through an owner_reference or consumer_reference edge (PNC-016). Each rule's test target is fixed during WorkGraph construction (PNC-016), before WorkNodeRequest construction, so
  that any ordering edge the target needs is part of the graph that is validated. A rule whose enforcement one node's
  source_acceptance_unit_ids own binds to that node. A rule whose enforcement is split across several nodes, or that no
  single node owns, binds to one fixture owner designated among the nodes whose source units hold the contract's
  owner_reference, and that node's completion must follow every node that implements a part the rule's fixtures
  exercise (every owner_reference node when no node's source units own the rule): the designated node is the one the
  graph already orders after all of them, or, when none is, the one the companion's deterministic tie-break names, to whose required_before_completion WorkGraph construction then adds each of the others. Those fixtures count
  toward the designated node's completion only when they ran against a build that includes the completed outputs of
  every node they exercise and their TestRunReceipt names those outputs; a pass on an earlier or partial build never
  counts (Plans/Automated_Testing_System.md#ATS-401). A rule whose enforcement lies
  outside the compile's write scope, as when the compile reaches its contract only through consumer_reference edges, is
  verified rather than rebuilt: each node in the compile that reaches the contract carries the rule's full required
  coverage as this unit defines it, listing in reused_test_ids each required case and assertion that the enforcing
  owner's current tests already cover for the plan version the compile consumes, binding generated fixtures that run
  against that owner's built surfaces for every required case or assertion those tests miss, and recording a test gap
  with its normal disposition for any it cannot produce or run; a failure of any of these is routed to that owner
  through a successor plan (PNC-015), never repaired inside the receiving node's write scope. A
  rule left without a lawful target, because the edges it needs would create a cycle or break the graph's phase order
  or no node in the compile can receive it, goes through the WorkGraph construction stage's repair route (PNC-016),
  and if repair gives it no target, compile certification fails closed with a finding naming the rule. A contract's rules are its schema rules (the contract's effective validation assertions as Plans/Planning_Wizard.md#PWIZ-111 defines them, with each member of
  a required list or other per-member constraint as its own rule and that member part of the refusal's identity), its
  declared failure results and its acceptance criteria, and each kind of rule gets its own tests. A schema rule gets at least two payload fixtures: a payload the whole contract refuses because of that rule alone, by the companion's attribution, expected to be
  refused, and
  a payload that passes, expected to be accepted; for an assertion an if selects, the passing payloads include one
  on each route the contract distinguishes and, wherever the contract admits one, a contrasting accepted control: the
  refusing payload with the selector switched to a route that does not select the assertion, and with any routing
  fields that route requires, still breaking the assertion and expected to be accepted. A declared failure result gets two behaviour fixtures: an input that
  meets its failing condition, expected to be refused with that failure's code, and the same input without the failing
  condition, expected to be accepted. A behavioural acceptance criterion (one with an input and an observable outcome)
  gets one behaviour fixture for each input condition it lists, each carrying the criterion's state and effect
  assertions and asserting the outcome the criterion states on its input or sequence: a refusal where the
  criterion prescribes one, otherwise the stated result, compared so that a wrong result fails (a duplicate delivery
  that must return the existing identity fails when another identity comes back). Any other acceptance criterion
  (a latency gate, a visual or browser check, an artifact that must not exist) binds its ATS-003 oracle as its test.
  No contract is exempt from schema fixtures because its acceptance criteria use other oracles. The compile model writes
  behaviour fixtures; each cites the exact span it comes from and keeps an immutable reference to that span in the
  approved plan version, and code checks it against the schema and the declared failure codes before it binds. Risky
  contracts add the cases of the planning referee check (Plans/Planning_Wizard.md#PWIZ-111). A fixture's expected
  outcome comes only from the approved contract: accepted with any stated result, or refused with the declared failure code and, when several rules share that
  code, the validator's error path (with the member for a per-member rule) that names the rule; every expected state comes from the owner-stated state and
  effect assertions. A referee case binds only when the
  approved contract states its expected outcome; a case where the referee and the contract disagree, or where the
  contract states no outcome, stays a design finding or gap evidence and never becomes a fixture, and the outcome the
  referee observed is recorded beside the case but never used as an expectation. A payload fixture record holds a
  fixture id, the contract ref, the rule id, the payload and its expected outcome; a behaviour fixture record holds the same fields with an input (a prior owner state plus an operation or event,
  or a short sequence) in place of the payload, its span reference, and the owner-stated state and effect assertions
  that apply to either polarity, each read through a declared observation surface (Plans/Planning_Wizard.md#PWIZ-110);
  a missing observation surface that already has a carried PWIZ-110 completeness finding keeps that disposition and is
  carried once, as a completeness gap, while one first found at compile time is an assertion test gap. Fixtures are listed in generated_test_ids (Plans/Automated_Testing_System.md#ATS-003); a bound oracle is listed in
  generated_test_ids, or in reused_test_ids when it is an existing test. Each rule ends in exactly one disposition: its required tests bound;
  for a schema rule whose refusing payload cannot be isolated, the passing payload bound together with a named gap
  evidenced to the standard of Plans/Planning_Wizard.md#PWIZ-111 (code-established coverage of the rule by its catching rules, found by the bounded isolation search PWIZ-111
  defines, with the same generators and stopping condition at compile time), whether
  the planning check or PlanCompile's own code produced that evidence, as the disposition of the refusal, binding a recorded multi-rule input
  as a regression fixture only where the approved contract determines the refusal for that exact input, and never with
  single-rule coverage credit; or a test gap for each required test that is missing because it could not be
  produced, failed its pre-bind check, or has no automatic route. A PWIZ-111 budget test gap whose rule PlanCompile then
  covers with bound required tests stays as planning evidence only. A bound fixture with a missing assertion keeps the rule's disposition as bound, and that assertion's test gap
  still applies at completion. A test gap is a recorded-gap record holding the rule id, the missing test or the
  missing assertion of a bound fixture, the reason, evidence refs, catching rules and its
  test_gap_policy, which PlanCompile sets under ATS-004 from what is actually missing, never from the planning
  check's search result alone: block_completion when the test or assertion itself is missing and an automatic route
  could run it (as when an isolation search ended on collisions against a runnable validator), and
  defer_non_executable_harness_candidate, recorded with its test-harness WorkNode request candidate, only when that
  automatic route is what is missing; allow_with_disposition and not_applicable are never used for a rule's required
  test. A deferred harness candidate keeps the rule's required verification open: the node is not marked complete on
  it until the harness work lets the test run and pass (Plans/Executor_Protocol.md#EP-101). A completeness or design finding carried as a recorded gap (Plans/Planning_Wizard.md#PWIZ-110 and #PWIZ-111) keeps
  its PWIZ-012 gap class and is resolved under that class, outside the test-gap policies above; when the build resolves
  the missing detail, the resulting rule's tests bind through the successor plan (PNC-015). When a contract changes after approval, the successor plan reruns its PWIZ-110 and PWIZ-111 checks
  and regenerates its tests, and the PlanDiffImpactReport (Plans/Executor_Protocol.md#EP-102) classifies each consuming
  node, with changed tests counting as an impact. The test_binding, test_case and test_run_receipt definitions in Plans/plans_to_code_handoff.schema.json do not yet
  carry payload fixture, behaviour fixture or recorded-gap records, or per-test outcomes with references to each
  recorded gap and its policy; that schema change is a required companion change before any compile uses this unit,
  it also fixes the per-keyword candidate generators and named-gap coverage conditions PWIZ-111 relies on, the fixture-owner tie-break and how a split rule's run receives
  the completed outputs it exercises, and its
  validation scenarios include a pattern rule and a length bound whose isolating witness must bind, a required list whose members each need their own refusal, a discriminated oneOf whose per-branch required member must bind an isolated refusal, a branch switch the contract
  accepts and a branch switch refused only by an independent assertion (neither credited to the branch's rule), a negation, a conditional selector whose contrasting accepted control must be accepted (an assertion applied on
  every route fails it), a refusal that must preserve state, and a replay that must return the right value without repeating its effect, and one case for each graph shape: a rule
  one node owns, a rule split across two parallel owner candidates with a fixture pass on an early or stale build that must not
  count, a rule enforced outside the compile's write scope with full, partial and no current owner coverage, and a rule
  with no lawful target. This unit specifies the binding
  only; it emits no NodeSeeds, WorkNodes, executable queues or build tasks.
gui_related: false
gui_classification_reason: Defines how compile artifacts carry test fixtures; no visual presentation.
depends_on: [DL-512, PNC-013, PNC-015, PNC-016, EP-101, EP-102, PWIZ-110, PWIZ-111, ATS-003, ATS-004]
unblocks: [ATS-401]
acceptance_criteria:
  - "Every rule of every contract gets a test target fixed at WorkGraph construction: the one node that owns its enforcement; a designated fixture owner whose completion follows every node its fixtures exercise; or, for a rule enforced outside the compile's write scope, each node in the compile that reaches its contract, with the rule's full required coverage: the enforcing owner's current tests for the cases and assertions they cover in reused_test_ids, generated fixtures run against that owner's built surfaces for the rest, and a test gap for any it cannot produce or run; a split rule's fixtures count only when run on a build with the completed outputs of every node they exercise, named in their receipt; a rule with no lawful target goes through the stage's repair route and otherwise fails certification closed."
  - "Every rule ends in exactly one disposition: its required tests bound; a passing payload with a named gap evidenced to PWIZ-111's standard, by the planning check or by PlanCompile, for an unisolatable schema refusal; or a test gap for each required test that could not be produced, failed its pre-bind check, or has no automatic route."
  - "A schema rule's required tests are a refusing and a passing payload fixture, and for an assertion an if selects also a passing payload on each route the contract distinguishes and, wherever the contract admits one, a contrasting accepted control that still breaks the assertion on a route that does not select it; a declared failure result's are a refusing input and its passing neighbour; a behavioural criterion's is one fixture per input condition it lists, each asserting its stated outcome so that a wrong result fails; any other criterion's is its ATS-003 oracle; no contract is exempt from schema fixtures; each member of a required list or other per-member constraint is its own rule with its own refusing fixture."
  - "Every behaviour fixture carries the owner-stated state and effect assertions for its polarity, each read through a declared observation surface; where a surface is missing, the carried PWIZ-110 completeness gap stands, or an assertion test gap if the gap was first found at compile time."
  - "Every expected outcome comes from the approved contract; a referee case that disagrees with the contract or lacks a contract outcome never binds, and observed planning outcomes are kept only as evidence."
  - "Every behaviour fixture cites its source span, passes the schema and declared-failure-code check before it binds, and keeps an immutable reference to that span in the approved plan version."
  - "A named-gap regression input binds only where the approved contract determines its refusal, and never with single-rule coverage credit."
  - "A test gap's test_gap_policy is set by PlanCompile from what is actually missing: block_completion when an automatic route exists for the missing test or assertion, defer_non_executable_harness_candidate only when the route itself is missing, and a deferred candidate keeps the rule's verification open under EP-101; allow_with_disposition and not_applicable are never used for a rule's required test."
  - "A contract change after approval reruns its checks in the successor plan and regenerates its tests, and the PlanDiffImpactReport classifies every consuming node."
  - "The handoff schema change for payload fixture, behaviour fixture and recorded-gap records, and for per-test outcomes in test_run_receipt, is a recorded companion change, required before any compile uses this unit; it also fixes the per-keyword candidate generators, the named-gap coverage conditions, the effective-assertion definitions and refusal attribution for applicators, the per-member identity, the fixture-owner tie-break and how a split rule's run receives the completed outputs it exercises, with the
  pattern, length-bound, required-member, discriminated-oneOf, branch-switch, independent-assertion, negation,
  conditional-selector contrasting-control, state-preserving refusal and replay scenarios, and one scenario for each graph shape (a single owner, split parallel owners with an early or stale-build pass that must not count, enforcement outside the write scope with full, partial and no current owner coverage, and no lawful target)."
  - "A carried completeness or design gap keeps its PWIZ-012 class and is resolved under that class, not under the test-gap policies."
  - "No NodeSeeds, WorkNodes, executable queues, final node manifests, production build tasks, implementation files or source code are created by this PlanUnit."
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-plans-verify.py validate-plans-to-code-handoff-schema
  - python3 scripts/pm-plans-verify.py validate-prd-planning-runtime-contracts
risk_class: weak_test_oracle
reasoning_tier: high
context_scope: worknode_test_binding
implementation_surfaces: [Plans/Plan_To_Node_Compilation.md, Plans/Automated_Testing_System.md, Plans/plans_to_code_handoff.schema.json]
node_compile_hint: {mode: worknode_test_binding_contract, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - Plans/Decision_Log.md#DL-512
  - "pm-mail 1125004841-a1d8 (pm-ea-lead, 2026-11-25): a credited kill is a negative fixture and its control a positive one; per-rule fixtures for the other families must come from the WorkNode compiler, the builder or the tooling"
preserved_exact_tokens:
  - "payload fixture"
  - "behaviour fixture"
  - "recorded-gap record"
  - "generated_test_ids"
  - "test_gap_policy"
  - "required_before_completion"
  - "PlanDiffImpactReport"
negative_constraints:
  - Do not count a named gap, a test gap or a rule without its required tests as passing.
  - Do not use an outcome the referee observed as a fixture's expected outcome; only the approved contract sets expectations.
  - Do not exempt a contract's schema rules from payload fixtures, and do not invent an opposite-polarity test for a behavioural criterion that prescribes none.
  - Do not give a rule's required test the test_gap_policy allow_with_disposition or not_applicable.
  - Do not create WorkNodes, NodeSeeds or build tasks from this unit.
owner_hints: [Plans/Plan_To_Node_Compilation.md, Plans/Automated_Testing_System.md, Plans/Planning_Wizard.md, Plans/Executor_Protocol.md]
```

ContractRef: ContractName:Plans/Decision_Log.md#DL-512, ContractName:Plans/Plan_To_Node_Compilation.md#PNC-013, ContractName:Plans/Plan_To_Node_Compilation.md#PNC-015, ContractName:Plans/Plan_To_Node_Compilation.md#PNC-016, ContractName:Plans/Executor_Protocol.md#EP-101, ContractName:Plans/Executor_Protocol.md#EP-102, ContractName:Plans/Planning_Wizard.md#PWIZ-110, ContractName:Plans/Planning_Wizard.md#PWIZ-111, ContractName:Plans/Automated_Testing_System.md#ATS-003, ContractName:Plans/Automated_Testing_System.md#ATS-004
