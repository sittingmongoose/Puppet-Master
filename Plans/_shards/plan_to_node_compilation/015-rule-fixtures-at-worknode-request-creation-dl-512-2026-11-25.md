# Shard 015: Rule fixtures at WorkNode request creation (DL-512, 2026-11-25)

Source: `Plans/Plan_To_Node_Compilation.md`

Source lines: L2169-L2474

Source SHA256: `d1e55ac18e8a2c0b1716b12f81ab159d1f2f9a127643bea96c8999463801c79c`

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
  owner_reference, and that node's completion must follow every other node that implements a part the rule's
  fixtures exercise (every other owner_reference node when no node's source units own the rule). The companion's
  deterministic designation rule picks it among the candidates for which those ordering edges keep the graph acyclic
  and in phase order, preferring a candidate the graph already orders after all of them, and WorkGraph construction
  adds to its required_before_completion every such node not already ordered before it; when no candidate qualifies,
  the rule has no lawful target. The same ordering holds whichever node a rule binds to: its completion must follow every other node in the
  compile that implements a surface the rule's fixtures exercise, a prior state reached through another node's
  operation included, WorkGraph construction adding each such node not already ordered before it to its
  required_before_completion, a single owner whose added edges would leave the graph cyclic or out of phase order
  having no lawful target, and an exercised surface enforced outside the write scope being reached in the exact owner
  build the node resolves, as the verification route below states. Those fixtures count toward the bound node's
  completion only when they ran against its final build together with the completed outputs of every other node they
  exercise, all named in their TestRunReceipt; a pass on an earlier or partial build never counts
  (Plans/Automated_Testing_System.md#ATS-401). Write-scope membership and the execution target are fixed per rule
  surface at WorkGraph construction, so one rule can have surfaces on both sides: a surface enforced inside the write
  scope follows the owner and split-output ordering above, and a surface enforced outside it follows the verification
  route below. A rule surface whose enforcement lies
  outside the compile's write scope, as when the compile reaches its contract only through consumer_reference edges, is
  verified rather than rebuilt: each node in the compile that reaches the contract binds that surface's required tests
  exactly as this unit produces them for a rule inside the write scope, for the plan version the compile consumes,
  and runs them directly against the enforcing owner's built surfaces, in the exact owner build or deployment the
  receiving node resolves for the work being certified, through a generated or independently checked adapter and never
  through the receiving node's own code (for a run-time value route, its certified invocation does so, while each
  prerequisite step keeps its own surface's rules); each surface ends in the same dispositions, and the owner's existing tests never
  stand in for a required case. A run counts, for either outcome, only when its TestRunReceipt binds the immutable
  identity of the owner build it ran against and that identity matches the owner dependency the receiving node's final
  build resolves; a refusal counts only when that owner build produced it, a run against any other owner build never
  counts, a changed owner dependency needs a fresh run, and a node with no automatic route to that exact build records
  a test gap whose test_gap_policy PlanCompile sets as this unit states below, except that a gap whose missing
  piece is the owner build itself is block_completion and names that build. A failing test keeps the receiving node incomplete until a valid run of it passes:
  an adapter or harness fault goes through the test-harness repair route (Plans/Executor_Protocol.md#EP-101 and
  #EP-102) and the test reruns, while a failure that reproduces directly against that same owner build is an
  enforcement defect of that owner and goes to it through a successor plan (PNC-015). No change to the receiving node's own code can satisfy such a test; a change to which owner build it resolves only
  changes the build the test must run against and needs a fresh run, and that build must implement the plan version the
  compile consumes. A change to an approved fixture or its expectation likewise arrives only through a successor
  plan. A
  rule left without a lawful target, because the edges it needs would create a cycle or break the graph's phase order
  or no node in the compile can receive it, goes through the WorkGraph construction stage's repair route (PNC-016),
  and if repair gives it no target, compile certification fails closed with a finding naming the rule. A contract's rules are its schema rules (the contract's effective validation assertions as Plans/Planning_Wizard.md#PWIZ-111 defines them, with each member of
  a required list or other per-member constraint as its own rule and that member part of the refusal's identity), its
  declared failure results and its acceptance criteria, and each kind of rule gets its own tests. A schema rule gets one payload fixture for each polarity the approved contract makes possible for its effective
  assertion, so that together they fail a validator that drops the rule, wherever dropping it can change the approved outcome, or rejects every valid value of the active field, and, with the contrasting control below, one that applies an if-selected assertion on a route its selector does not select (the companion's validation scenarios fix that fault set): a refusing payload the whole contract refuses because of that rule alone, by the companion's
  attribution, expected to be refused, and a passing payload that reaches and satisfies that same assertion in the
  same applicable branch or route, keeping the intended field or branch active (an optional field present), expected
  to be accepted; the passing polarity counts as impossible only on recorded code evidence that no accepted input reaches and satisfies the assertion in its branch (as with a false subschema), and the refusing polarity only on recorded code evidence of a kind the companion defines and validates (such as catching rules that always refuse every violation first, which is a named gap, a selector that guarantees the assertion, or a deletion that changes no approved outcome); where the bounded search records code evidence that no attributable refusal demonstrates the assertion's deletion, a recorded deletion witness, a payload whose whole-contract outcome changes when just that assertion is deleted, bound with its original approved outcome (accepted, or refused by an enclosing wrapper), is the rule's required test for the refusing polarity and earns deletion-detection credit, never refusal credit; any other impossible polarity needs no fixture and earns no credit, a polarity missing without that evidence or witness is a test gap, and the companion fixes the evidence kinds and the proof method; for an assertion an if selects, the passing payloads include one on each
  route that can accept a payload under the whole approved contract (a route the contract requires to accept but for
  which no valid case exists keeps its finding or test gap) and, as an additional case, wherever the contract admits one, a contrasting accepted control: an input that breaks the assertion on a route that does not select it, with any routing fields that route requires, expected to be accepted; it reuses a selector-switched refusing payload where that payload is valid on the other route, and is otherwise generated separately. A declared failure result gets two behaviour fixtures: an input that
  meets its failing condition, expected to be refused with that failure's code, and its passing neighbour, expected to be accepted, defined once here and used wherever this unit names it. The failure's route is fixed by the selectors the approved contract uses to choose outcomes (such as a declared mode, version, discriminator or selector), and an evidenced limit cites, with their codes and spans, the approved refusal outcomes, schema refusals and the failure's own among them, whose conditions code checks
  together cover every input on a route or surface. Where the failure's route admits an accepted call, the neighbour is an approved accepted call on that route: it keeps those selectors, removes the failing condition and keeps the rest of the refusing input wherever that is
  accepted, and otherwise changes only the further inputs, coupled fields or prior state that acceptance on that route
  requires, recording each with the approved rule or invariant that requires it; where code establishes that every accepted
  call on that route still meets the failing condition because an approved earlier success shadows the failure there (a
  replay or no-op), the neighbour is that bound success with its effect assertions instead. Where an evidenced limit shows that the route admits none and the surface accepts a call on another route, the neighbour is that approved accepted alternate, keeping every other input the alternate admits and changing only what its approved input requires, with the route's limit recorded; this holds however the route is closed: by a failing condition that names its selector alone, as a retired version's may, by one that adds predicates every valid input on the route meets, or by other approved refusals covering the inputs it leaves. Only where an evidenced limit shows that a surface the contract does not declare refusal-only admits no accepted call on any route does the refusal bind alone there, with that limit recorded, and where the approved contract establishes none of these, that surface is silent on acceptance as stated below. The companion fixes how the selectors are identified, how an evidenced limit's coverage is checked and how the
  neighbour's further changes and, where several routes accept, its alternate are chosen deterministically, and any separately required successful route binds under its own approved expectation; on a surface the contract declares refusal-only, the refusing fixture binds with its stated effect
  assertions and the record states why an accepted call is outside the contract, while a lawful control on a distinct
  surface keeps its own binding. When code establishes that earlier approved outcomes on a surface, one alone or several together, cover every
  input meeting a declared failure's condition before that failure can be reached (as when a schema bound always
  refuses first, two ordered checks split the failing inputs between them, or a binding answers a repeat with a stated
  no-op success), the declared failure is a shadowed refusal on that surface: its reachable outcomes bind as the
  contract actually produces them, one input for each earlier outcome that first catches some input meeting the
  condition, each expected with that outcome's code or stated success and its stated effects, its passing neighbour as
  defined above still binds (where that definition leaves the refusal alone, the shadowed outcomes bind alone with
  their effect assertions and the evidenced limit), and the shadowed result is recorded with that coverage evidence
  and the reason the inner refusal cannot be reached there, and earns no independent coverage credit. Shadowing is judged per declared surface: a
  separately declared owner surface that can reach the original result binds that result's own required tests under
  the ordinary disposition and gap policy. A search that ends without that coverage evidence leaves a test gap. Where the owner contract forbids automated
  access to an action (a human-only action), the missing automatic route is an owner prohibition, not a missing
  harness: any rule whose required test would have to invoke that action to observe its expected result, whether an accepted
  call, a declared failure's passing neighbour or a refusal inside the action, takes the human-only disposition there: the automated boundary and lifecycle checks the owner permits
  (such as the outer refusal of automated access and redacted lifecycle observations) are that surface's required
  tests, each bound and recorded with exactly what it proves, and the human interaction, with any result only it can
  reach, stays outside automated coverage. A plan that
  requires stronger proof than the owner permits is a PWIZ-110 contradiction finding carrying its existing PWIZ-012
  class; when planning missed it, PlanCompile records a finding naming the affected rule, its surface and the approved span that requires the
  prohibited proof, and fails certification closed,
  as for a rule with no lawful target, never assigning a class itself. A behavioural acceptance criterion (one with an input and an observable outcome)
  gets one behaviour fixture for each input condition it lists, each carrying the criterion's state and effect
  assertions and asserting the outcome the criterion states on its input or sequence: a refusal where the
  criterion prescribes one, otherwise the stated result, compared so that a wrong result fails (a duplicate delivery
  that must return the existing identity fails when another identity comes back). Any other acceptance criterion
  (a latency gate, a visual or browser check, an artifact that must not exist) binds its ATS-003 oracle as its test. A
  criterion that mixes both routes each stated obligation to a test that can verify it: its input-and-outcome
  obligations to behaviour fixtures and its measured ones, such as latency percentiles, to its ATS-003 oracle, one
  existing oracle covering several obligations when its evidence verifies all of them, and measured release assertions
  staying with the build.
  No contract is exempt from schema fixtures because its acceptance criteria use other oracles. The compile model writes
  behaviour fixtures; each cites the exact span it comes from and keeps an immutable reference to that span in the
  approved plan version, and before it binds, code validates the fixture record, confirms that its input has the schema result the approved
  contract specifies for the case (valid where the case expects the operation to reach the owner's own checks, and
  refused with that refusal's identity where the case expects an earlier schema refusal, as a shadowed refusal does),
  and checks its expected code against the declared failure codes. Risky
  contracts add the cases of the planning referee check (Plans/Planning_Wizard.md#PWIZ-111). A fixture's expected
  outcome comes only from the approved contract and holds only what its bound surface's approved contract exposes:
  accepted with any stated result, or refused with the declared failure code and, when several schema rules share that
  code, the validator's error path (with the member for a per-member rule) that names the rule wherever that surface
  exposes it, a schema refusal reached early in a behaviour fixture included; every schema fixture records its
  isolated assertion, member and reference-validator path as provenance, never as an expectation its surface cannot
  report, and where a surface's exposed diagnostics cannot tell apart rules that share a code, its fixture certifies
  the shared refusal there with that coverage limit recorded, the rule's isolation being credited only on a bound
  surface that exposes the path, such as its built validator; a deletion witness keeps its target assertion's id for deletion-detection
  credit while its expected diagnostic is the one the approved contract actually reports, an enclosing wrapper's path
  included; an owner's semantic refusal is identified by its declared code together with
  the isolated case's state and effect assertions and any diagnostic its approved interface exposes, never by a
  validator path; every expected state comes from the owner-stated state and
  effect assertions. A referee case binds only when the
  approved contract states its expected outcome; a case where the referee and the contract disagree, or where the
  contract states no outcome, stays a design finding or gap evidence and never becomes a fixture, and the outcome the
  referee observed is recorded beside the case but never used as an expectation. A payload fixture record holds a
  fixture id, the contract ref, the rule id, the surface it certifies, the payload and its expected outcome; a behaviour fixture record holds the same fields with an input (a prior owner state plus an operation or event,
  or a short sequence) in place of the payload, its span reference, and the owner-stated state and effect assertions
  that apply to either polarity; a payload fixture bound to an owner operation or event surface carries, the same
  way, the owner-stated state and effect assertions that apply to its payload's outcome there (such as a validation
  refusal that must leave owner state unchanged), and where a valid payload needs a value only the build issues at run
  time (such as a cursor the same session issues, or the run a Start issues before a Pause), the fixture binds through the companion's run-time value route
  instead of a literal, with the same schema cases and dispositions a literal payload would have: an immutable recipe,
  written, cited and checked before binding like a behaviour fixture, whose later step uses a value an earlier step
  returned; the exact payload after substitution must pass the approved reference check for the case's polarity and
  attribution before the bound surface's verdict earns credit; each step keeps its own surface's build, scope and
  access rules, so an out-of-scope invocation reaches the exact owner build directly while an in-scope prerequisite
  runs in the node's final build; and a missing output or a failed reference check leaves the fixture unsatisfied,
  while a recipe with no lawful route is a recorded test gap, while a validator-bound fixture run through a declared consuming
  operation is judged on the validator's verdict alone, that operation's effects staying with its own fixtures; each such assertion is read through a declared observation surface
  (Plans/Planning_Wizard.md#PWIZ-110);
  a missing observation surface that already has a carried PWIZ-110 completeness finding keeps that disposition and is
  carried once, as a completeness gap, while one first found at compile time is an assertion test gap. Fixtures are listed in generated_test_ids (Plans/Automated_Testing_System.md#ATS-003); a bound oracle is listed in
  generated_test_ids, or in reused_test_ids when it is an existing test. A rule's surfaces are fixed by its kind: a declared failure result's are the callable surfaces in the interface
  bindings of the operations or events that declare it; a schema rule has one, its data shape's built validator (a
  declared consuming operation may be its run route, as Plans/Automated_Testing_System.md#ATS-401 allows), plus any
  owner surface on which the contract declares that shape's validation separately; a behavioural criterion's is the
  surface its input names; and an ATS-003 oracle criterion has one. No rule needs an accepted case on a surface the
  contract declares refusal-only. Only a declared failure result's callable surface that the contract does not declare refusal-only can be silent
  on acceptance: when
  its approved contract establishes on that surface none of the passing neighbour's cases defined above (an accepted call on the failure's route, an accepted alternate with the route's evidenced limit, or the surface's evidenced limit), that is the PWIZ-110
  completeness finding for an operation without its failure results, carried as a recorded gap that stands in for the
  missing neighbour while the refusing fixture still binds; a silent surface first found at compile time is a
  block_completion test gap for the missing neighbour naming that surface, and PlanCompile never assigns a PWIZ-012
  class itself. A schema rule, a behavioural criterion or an ATS-003 oracle criterion whose required tests are bound
  satisfies its disposition through them and needs no operation-level accepted call beyond them, and no completeness
  gap. Each rule ends in exactly one
  disposition on each of its surfaces, every surface's outcome and gaps counting toward the receiving node's completion
  for that rule, with coverage credit local to that surface: its required tests bound; on a surface whose owner forbids automated access, the human-only disposition, its
  permitted boundary and lifecycle checks bound as that surface's required tests; for a shadowed refusal, its reachable outcomes
  bound, with its passing neighbour as defined above, and the recorded coverage evidence;
  for a schema rule whose refusing payload cannot be isolated, its passing payload where one is required bound
  together with a named gap
  evidenced to the standard of Plans/Planning_Wizard.md#PWIZ-111 (code-established coverage of the rule by its catching rules, found by the bounded isolation search PWIZ-111
  defines, with the same generators and stopping condition at compile time), whether
  the planning check or PlanCompile's own code produced that evidence, as the disposition of the refusal, binding a recorded multi-rule input
  as a regression fixture only where the approved contract determines the refusal for that exact input, and never with
  single-rule coverage credit; or a test gap for each required test that is missing because it could not be
  produced, failed its pre-bind check, or has no automatic route. A PWIZ-111 budget test gap whose rule PlanCompile then
  covers with bound required tests stays as planning evidence only. A bound fixture with a missing assertion keeps the rule's disposition as bound, and that assertion's test gap
  still applies at completion. A writer-order family that PWIZ-111 listed by one bounded gap record keeps that record as planning evidence;
  PlanCompile carries at most one recorded-gap record for the part of the family still unbound after the cases it
  binds, naming that remainder and the tested representatives, with its own test_gap_policy, clears it when nothing
  remains, and that record keeps the node incomplete for the remaining coverage exactly as any other test gap under
  its policy does. A test gap is a recorded-gap record holding the rule id, the missing test or the
  missing assertion of a bound fixture, the reason, evidence refs, catching rules and its
  test_gap_policy, which PlanCompile sets under ATS-004 from what is actually missing, never from the planning
  check's search result alone: block_completion when the test or assertion itself is missing and an automatic route
  could run it (as when an isolation search ended on collisions against a runnable validator), and
  defer_non_executable_harness_candidate, recorded with its test-harness WorkNode request candidate, only when that
  automatic route is what is missing and the owner permits one; allow_with_disposition and not_applicable are never used for a rule's required
  test. A deferred harness candidate keeps the rule's required verification open: the node is not marked complete on
  it until the harness work lets the test run and pass (Plans/Executor_Protocol.md#EP-101). A completeness or design finding carried as a recorded gap (Plans/Planning_Wizard.md#PWIZ-110 and #PWIZ-111) keeps
  its PWIZ-012 gap class and is resolved under that class, outside the test-gap policies above; when the build resolves
  the missing detail, the resulting rule's tests bind through the successor plan (PNC-015). When a contract, or a resolved dependency its checks or tests use, changes after approval, the successor plan
  reruns its PWIZ-110 and PWIZ-111 checks
  and regenerates its tests, and the PlanDiffImpactReport (Plans/Executor_Protocol.md#EP-102) classifies each consuming
  node, with changed tests counting as an impact. The test_binding, test_case and test_run_receipt definitions in Plans/plans_to_code_handoff.schema.json do not yet
  carry payload fixture, behaviour fixture or recorded-gap records, or per-test outcomes with references to each
  recorded gap and its policy; that schema change is a required companion change before any compile uses this unit,
  it also fixes the per-keyword candidate generators and named-gap coverage conditions PWIZ-111 relies on, the fixture-owner designation rule and the TestRunReceipt fields that name a cross-node fixture's build inputs (a
  split rule's included) and an out-of-scope run's owner build, the run-time value route's recipe form, substitution and receipt evidence, the applicable-route selector identification, the evidenced-limit coverage check, the deterministic choice of a passing neighbour (its changes beyond the failing condition and its alternate where several routes accept), the impossibility evidence kinds and their proof method, and its
  validation scenarios include a pattern rule and a length bound whose isolating witness must bind, a required list whose members each need their own refusal, a discriminated oneOf whose per-branch required member
  must bind an isolated refusal paired with a passing control in the same branch, so that a validator rejecting the
  otherwise valid matching branch fails that control, an active assertion whose declared alternate arm lies outside
  the enclosing shape's scope, that arm's own rules ending as named gaps on the enclosing const's code-established
  coverage with no passing payload, an assertion its selector guarantees on every input of its branch, with an
  accepted route control and no refusal, a false subschema whose only possible polarity is refusal, a oneOf arm whose constant's deletion only an accepted
  input from another arm can detect, a deletion-inert oneOf-arm rule that keeps its same-branch passing fixture with no refusing fixture, witness or
  gap, a oneOf arm where one payload's second match leaves the whole outcome unchanged, in which the same-branch passing control binds, the unchanged payload earns no witness credit, and, where the bounded search records code evidence that no attributable refusal demonstrates the deletion, a payload whose whole-contract outcome changes with the assertion deleted binds as the witness with its approved outcome, with no refusing fixture or test gap, a rule where a deletion
  witness and an attributable refusal coexist and the refusal must bind, a deletion detectable only through a wrapper refusal, bound as a witness with its approved
  outcome, a contrasting control that needs a different tested value from the isolated refusal and is generated
  separately, a human-only action bound by the automated boundary and lifecycle checks its owner
  permits, a human-only action whose only required outcome is a refusal inside it, a named shape that admits no valid input at all whose
  refusal is found from a directly constructed negative candidate, a branch switch the contract
  accepts and a branch switch refused only by an independent assertion (neither credited to the branch's rule), a negation, an optional field whose passing control must carry a valid value so that a validator rejecting every
  present value fails it, two independent semantic guards that share one declared code on a schema-valid input, a
  conditional selector whose contrasting accepted control must be accepted (an assertion applied on
  every route fails it), a refusal that must preserve state, and a replay that must return the right value without repeating its effect, and one case for each graph shape: a rule
  one node owns, a rule split across two parallel owner candidates with a fixture pass on an early or stale build that must not
  count, a rule enforced outside the compile's write scope whose existing owner tests, including one refusal that breaks
  two members at once, must not stand in for its required cases, and whose refusal a check added in the receiving
  node's code must not satisfy, and a run against a different owner build that produces the expected refusal but
  must not count, a split rule for which an implementing node and a later integration node both
  qualify, a candidate whose added edges would create a cycle, a rule
  with no lawful target, a declared failure that an earlier schema refusal shadows, whose case must bind, reach the built owner's validation and earn no independent
  coverage credit, and an absent owner build tested beside an existing owner build that lacks an automatic test route, a refusal-only
  surface certified by an executed denial with zero-effect evidence that still blocks when the refusal is missing or
  fails, a shadowed pair bound on one surface beside an ordinary test gap on a second surface, a shadowed failure on a
  refusal-only surface, a rule bound to both the standalone validator and a separately declared operation, where the operation still
  gives the approved result while the standalone validator is broken and the node must fail completion, a local
  operation beside a read-only standalone validator, where a passing receipt from a stale validator build leaves the
  node incomplete, a surface that admits no accepted call on any route, whose declared failure binds its refusal with
  the surface's evidenced limit, a shadowed failure on a closed route of a surface that accepts another route, where the neighbour is
  that accepted alternate and a build refusing every route with the earlier check's code must fail, a failure whose
  condition repeats its route's selector,
  where a cross-mode control would pass a faulty build and the neighbour keeps the selector, a retired version whose
  condition is its selector alone and one whose condition adds a payload predicate every schema-valid call on that
  version meets, where in both the neighbour switches to an accepted version and a build refusing every version with
  that code must fail, a closed legacy route whose inputs several refusal codes cover together, where the neighbour
  likewise switches to an accepted route, a failure whose only lawful refusing input also meets a later failure's
  condition, in its payload (a schema admitting only (0,0), (1,0) and (1,1), refused ZERO_X when x is 0 and then
  ZERO_Y when y is 0) or in its prior state (a missing record that cannot be ready), where the accepted same-route
  call changing both binds as the neighbour with those changes recorded, a payload refusal on an owner operation whose
  diagnostic matches while a forbidden append breaks the owner's unchanged-state assertion, which must fail
  completion, a failure shadowed on an outer surface by two ordered checks together (NEGATIVE for -1 and ZERO for 0
  before an inner NON_POSITIVE), whose reachable refusals bind with their own codes while the inner surface's own
  fixture still runs, a reader whose closed failure reply cannot carry the path of two schema rules sharing its code,
  where both isolated inputs bind with the complete reply and the coverage limit while the paths stay provenance,
  an append surface the contract declares refusal-only (a current writer whose every append, equal retries included,
  is prohibited), whose refusal and effect checks bind with no passing-neighbour gap while the historical reader keeps
  its own control, a reader whose valid cursor exists only as an output of the same session, bound through the
  run-time value route, where a malformed issued cursor that draws the expected shared refusal code for the wrong
  reason earns no credit, a close operation whose idempotent binding answers an
  already-closed record with a no-op success that binds with its no-write effect while the strict binding keeps its
  ALREADY_CLOSED fixture, a replay binding with no accepted fresh call, whose replay success is the neighbour beside a
  binding that can return the inner refusal, a Pause payload bound through the run-time value route after a fresh
  Start that issues its run identity and current revision, with Start and Pause in different nodes so that a Pause run
  before Start's completed output is in does not count and the receipt names that output, and a Start in scope before
  a pinned out-of-scope Pause owner, and a data
  shape consumed by two operations, one of them refusal-only, that gets one schema
  disposition and no blocking gap, a latency oracle that binds and runs with no operation-level accepted call and
  no completeness gap, and a surface silent on acceptance both carried from planning and first found at compile
  time.
  This unit specifies the binding
  only; it emits no NodeSeeds, WorkNodes, executable queues or build tasks.
gui_related: false
gui_classification_reason: Defines how compile artifacts carry test fixtures; no visual presentation.
depends_on: [DL-512, PNC-013, PNC-015, PNC-016, EP-101, EP-102, PWIZ-110, PWIZ-111, ATS-003, ATS-004]
unblocks: [ATS-401]
acceptance_criteria:
  - "Every rule of every contract gets a test target fixed at WorkGraph construction: the one node that owns its enforcement; a designated fixture owner, picked by the companion's deterministic rule among candidates whose added edges keep the graph lawful, whose completion follows every other node its fixtures exercise; or, for a rule surface enforced outside the compile's write scope, each node in the compile that reaches its contract, with the required tests and dispositions an in-scope rule gets, run against the enforcing owner's built surfaces, and no existing owner test standing in for a required case; whichever node a rule binds to, its completion follows every other node in the compile that implements a surface its fixtures exercise (a prior state reached through another node's operation included), and its fixtures count only when run on its final build with those nodes' completed outputs, all named in their receipt; a rule with no lawful target goes through the stage's repair route and otherwise fails certification closed."
  - "A test for a rule surface enforced outside the write scope runs directly against the exact owner build the receiving node resolves, never through the receiving node's code; a run counts only when its receipt binds that build's identity and it matches the receiving node's final owner dependency, a refusal only when that build produced it, and a changed owner dependency needs a fresh run; a failing test keeps the receiving node incomplete until a valid run passes, an adapter or harness fault is repaired through the test-harness route and the test reruns, and a failure that reproduces against the owner's surface waits for the owner's successor plan."
  - "Every rule ends in exactly one disposition on each of its surfaces as its kind fixes them (a declared failure's callable surfaces, a schema rule's built validator plus any separately declared validation surface, a behavioural criterion's named input surface, an oracle criterion's single one): its required tests bound; on a surface whose owner forbids automated access, the human-only disposition with its permitted boundary and lifecycle checks bound as that surface's required tests; for a declared failure that earlier approved outcomes, alone or together, always intercept on a surface (a stated no-op success included), its reachable outcomes bound, with its passing neighbour as defined above, and with code-established coverage evidence and no independent coverage credit for the shadowed result, while any other declared surface that reaches the original result binds that result's own required tests; a named gap evidenced to PWIZ-111's standard, by the planning check or by PlanCompile, for an unisolatable schema refusal, with its passing payload where one is required; or a test gap for each required test that could not be produced, failed its pre-bind check, or has no automatic route. Every surface's outcome and gaps count toward the receiving node's completion for that rule, with credit local to that surface; no rule needs an accepted case on a refusal-only surface; only a declared failure's callable surface can be silent on acceptance, as a carried completeness gap or, when first found at compile time, a block_completion test gap naming the surface; and a bound schema, behavioural or oracle test needs no operation-level accepted call beyond its own required tests."
  - "A schema rule's required tests are one payload for each polarity the approved contract makes possible (a refusal caused by that rule alone, and a passing payload that reaches and satisfies the same assertion in the same applicable branch), a passing payload excused only on recorded code evidence that no accepted input reaches and satisfies the assertion, and a refusing payload only on (recorded code evidence of a kind the companion defines (such as a named gap, a selector that guarantees the assertion, or a deletion that changes no approved outcome), or, where the bounded search records code evidence that no attributable refusal demonstrates the deletion, a recorded deletion witness whose whole-contract outcome changes when just that assertion is deleted, bound with its original approved outcome, which is then its required test), and for an assertion an if selects also a passing payload on each route that can accept a payload under the whole approved contract and, wherever the contract admits one, a contrasting accepted control that still breaks the assertion on a route that does not select it; a declared failure result's are a refusing input and its passing neighbour as defined above, or, only where that definition binds the refusal alone, the refusing input with the surface's evidenced limit recorded, or, on a surface the contract declares refusal-only, the refusing input with its stated effect assertions; or, on a surface the contract leaves silent, the refusing input with the carried completeness gap, or a block_completion test gap when first found at compile time, in place of the neighbour; a behavioural criterion's is one fixture per input condition it lists, each asserting its stated outcome so that a wrong result fails; any other criterion's is its ATS-003 oracle, and a mixed criterion routes each stated obligation to a test that can verify it; no contract is exempt from schema fixtures; each member of a required list or other per-member constraint that stays per-member after the companion's attribution is its own rule, with its own refusing fixture wherever that polarity is possible; on a surface whose owner forbids automated access, any required test that would have to invoke the prohibited action is the owner's permitted boundary and lifecycle checks, and a plan demanding stronger proof is a PWIZ-110 contradiction finding at planning or, when planning missed it, a closed compile failure naming the rule, surface and span."
  - "Every behaviour fixture, and every payload fixture bound to an owner operation or event surface, carries the owner-stated state and effect assertions that apply to its polarity or outcome there, each read through a declared observation surface; where a surface is missing, the carried PWIZ-110 completeness gap stands, or an assertion test gap if the gap was first found at compile time."
  - "Every expected outcome comes from the approved contract and expects only diagnostics the bound surface's approved contract exposes, a schema fixture's isolated assertion, member and reference-validator path otherwise kept as provenance with the coverage limit recorded; a referee case that disagrees with the contract or lacks a contract outcome never binds, and observed planning outcomes are kept only as evidence."
  - "Every behaviour fixture cites its source span and keeps an immutable reference to that span in the approved plan version; before it binds, code validates the fixture record, confirms that its input has the schema result the approved contract specifies for the case, an expected earlier schema refusal included, and checks its expected code against the declared failure codes."
  - "Every generated payload and behaviour fixture names the surface it binds to, and the fixtures for two separately declared surfaces of one rule stay distinguishable in the emitted bindings."
  - "A named-gap regression input binds only where the approved contract determines its refusal, and never with single-rule coverage credit."
  - "A bounded writer-order record from planning is narrowed at compile time to at most one gap for the still-unbound remainder and cleared when none remains; a test gap's test_gap_policy is set by PlanCompile from what is actually missing: block_completion when an automatic route exists for the missing test or assertion, defer_non_executable_harness_candidate only when the route itself is missing, a missing owner build always block_completion naming that build and never a harness candidate, and a deferred candidate keeps the rule's verification open under EP-101; allow_with_disposition and not_applicable are never used for a rule's required test."
  - "A change after approval to a contract or to a resolved dependency its checks or tests use reruns its checks in the successor plan and regenerates its tests, and the PlanDiffImpactReport classifies every consuming node."
  - "The handoff schema change for payload fixture, behaviour fixture and recorded-gap records, and for per-test outcomes in test_run_receipt, is a recorded companion change, required before any compile uses this unit; it also fixes the per-keyword candidate generators, the named-gap coverage conditions, the effective-assertion definitions and refusal attribution for applicators, the per-member identity, the fixture-owner designation rule, the TestRunReceipt fields that name a cross-node fixture's build inputs (a split rule's included) and an out-of-scope run's owner build, the run-time value route's recipe form, substitution and receipt evidence, the applicable-route selector identification, the evidenced-limit coverage check, the deterministic choice of a passing neighbour (its changes beyond the failing condition and its alternate where several routes accept), the impossibility evidence kinds and their proof method, with the
  pattern, length-bound, required-member, discriminated-oneOf same-branch control, out-of-scope alternate arm, selector-guaranteed assertion, false subschema, a named shape with no valid input whose refusal binds from a directly constructed negative candidate, a oneOf arm deletion caught by another arm's accepted input, a deletion-inert oneOf-arm rule keeping its passing fixture with no refusing fixture, deletion witness or test gap, a second match leaving one payload's whole outcome unchanged, in which the same-branch passing control binds, the unchanged payload earns no witness credit, and, where the bounded search records code evidence that no attributable refusal demonstrates the deletion, a payload whose whole-contract outcome changes with the assertion deleted binds as the witness with its approved outcome, with no refusing fixture or test gap, a witness beside an attributable refusal where the refusal binds, a wrapper-refusal witness bound with its approved outcome, a separately generated contrasting control, a human-only action bound by its permitted checks, a human-only action whose only required outcome is a refusal inside it, branch-switch, independent-assertion, negation,
  conditional-selector contrasting-control, optional-field passing-control, shared-code semantic-guard, state-preserving refusal and replay scenarios, and one scenario for each graph shape (a single owner, split parallel owners with an early or stale-build pass that must not count, enforcement outside the write scope whose existing owner tests must not stand in for its required cases and whose refusal the receiving node's own check or a different owner build must not satisfy, an integration node that also qualifies as fixture owner, a candidate whose edges would create a cycle, no lawful target, a shadowed declared failure, an absent owner build, a refusal-only surface, a rule bound to both the standalone validator and a separately declared operation where the separately declared operation keeps giving the approved result while the broken standalone validator fails its bound test and completion, a shadowed pair beside a gap on a second surface, a shadowed failure on a refusal-only surface, a shape consumed by a refusal-only operation, a latency oracle with no accepted call and no gap, a silent surface carried and first found at compile time, a local operation beside a read-only standalone validator whose stale-build receipt leaves the node incomplete, a surface with no accepted call on any route bound with its evidenced limit, a shadowed failure on a closed route whose neighbour is the surface's accepted alternate, a failure condition that repeats its route selector, a retired version whose condition is its selector alone or adds a predicate every valid call on that version meets, a closed route covered by several refusal codes whose neighbour is an accepted alternate route, a refusing input or prior state that meets two failures' conditions whose neighbour changes both on the same route, a payload refusal on an owner operation whose forbidden append fails completion, a failure shadowed by two earlier checks together, a closed reply that cannot carry the path of two rules sharing its code, a refusal-only append surface that binds with no passing-neighbour gap, a payload needing a session-issued cursor, where a malformed issued cursor earns no credit, an idempotent no-op that shadows an inner refusal on one binding, a replay success that is its route's only accepted call, a Pause payload after a Start in another node, where a run before Start's output is in does not count and the receipt names it, and a Start in scope before a pinned out-of-scope Pause)."
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
  - Do not count a named gap, a test gap or a rule without its required tests as passing; on a surface whose owner forbids automated access, the permitted boundary and lifecycle checks are its required tests.
  - Do not use an outcome the referee observed as a fixture's expected outcome; only the approved contract sets expectations.
  - Do not exempt a contract's schema rules from their required schema cases, bound as payload fixtures or through
    the run-time value route, and do not invent an opposite-polarity test for a behavioural criterion that prescribes none.
  - Do not give a rule's required test the test_gap_policy allow_with_disposition or not_applicable.
  - Do not create WorkNodes, NodeSeeds or build tasks from this unit.
owner_hints: [Plans/Plan_To_Node_Compilation.md, Plans/Automated_Testing_System.md, Plans/Planning_Wizard.md, Plans/Executor_Protocol.md]
```

ContractRef: ContractName:Plans/Decision_Log.md#DL-512, ContractName:Plans/Plan_To_Node_Compilation.md#PNC-013, ContractName:Plans/Plan_To_Node_Compilation.md#PNC-015, ContractName:Plans/Plan_To_Node_Compilation.md#PNC-016, ContractName:Plans/Executor_Protocol.md#EP-101, ContractName:Plans/Executor_Protocol.md#EP-102, ContractName:Plans/Planning_Wizard.md#PWIZ-110, ContractName:Plans/Planning_Wizard.md#PWIZ-111, ContractName:Plans/Automated_Testing_System.md#ATS-003, ContractName:Plans/Automated_Testing_System.md#ATS-004
