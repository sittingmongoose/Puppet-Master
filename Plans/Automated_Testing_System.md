# Automated Testing System

> Compliance: This document follows `Plans/DRY_Rules.md` and uses PlanUnit metadata defined by `Plans/Plan_Document_System.md`. It is the canonical owner for automated test discovery, harness probing, test strategy, test binding, test receipts, visual/browser/device evidence policy, platform adapters, and test-gap blockers. It does not create WorkNodes, NodeSeeds, executable queues, final node manifests, product implementation files, dispatched GoalRuns, or production build tasks.

## Owner / Consumer Map

Primary owner:
- `Plans/Automated_Testing_System.md` owns test capability discovery, harness probing, test strategy generation, WorkNode test binding, test run receipts, test oracle policy, platform adapter policy, and automated-verification gap handling.

Consumers:
- `Plans/Plan_To_Node_Compilation.md` consumes test capability and test binding requirements while drafting non-executable NodeSeed candidates, WorkGraph drafts, and WorkNode requests.
- `Plans/Executor_Protocol.md` consumes test bindings and test receipts during Executor intake, dispatch, verification, repair, and completion certification.
- `Plans/Project_Output_Artifacts.md` and `Plans/Runtime_Artifacts_Panel.md` consume test artifacts, receipts, screenshots, logs, and visual/browser/device evidence.
- `Plans/Tools.md` owns concrete tool behavior for browser, GUI, device, CLI, and project-native testing helpers.
- `Plans/FinalGUISpec.md` consumes visible capability, evidence, and Settings placement without re-owning test policy.
- `Plans/Contracts_V0.md` owns shared envelope fields and schema references for receipts that cross runtime boundaries.

ContractRef: ContractName:Plans/Plan_To_Node_Compilation.md, ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Project_Output_Artifacts.md, ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/Tools.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Contracts_V0.md

## PlanUnits

### ATS-001 - Automated Testing System SSOT

```yaml
plan_unit_id: ATS-001
unit_type: requirement
status: accepted
owner_doc: Plans/Automated_Testing_System.md
canonical_text: >-
  Puppet Master has a first-class Automated Testing System that is platform-capability-discovery-first. It owns Test Capability Discovery, Test Harness Probe, Test Strategy v2, WorkNode test binding, Test Run Receipt, test oracle policy, platform adapter policy, visual/browser/device evidence policy, fallback policy, and test-gap blocker routing. Testing must not be a thin verificationCommand afterthought and must not be overfit to Slint; Slint is an example for Puppet Master itself while the system works for web, desktop GUI, mobile/device, backend/API, CLI, and library projects.
gui_related: false
gui_classification_reason: This unit defines backend/test policy and artifact contracts; GUI evidence is consumed but not itself the owner behavior.
depends_on: []
unblocks: [PNC-013, EP-101, POA-048, RAP-029, T-159]
acceptance_criteria:
  - Automated testing owns discovery, probe, strategy, binding, receipts, oracle, adapter, and gap policy as one system.
  - Project type and available automation determine the strategy before WorkNode completion can be certified.
  - Slint is documented as an example only, not the default focus for all user projects.
  - No WorkNodes, NodeSeeds, queues, implementation files, dispatched GoalRuns, or production build tasks are emitted by this doc.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py run-gates
  - future automated testing strategy validator
risk_class: unverifiable_completion
reasoning_tier: high
context_scope: plans_to_code_testing
implementation_surfaces: [Plans/Automated_Testing_System.md, Plans/plans_to_code_handoff.schema.json]
node_compile_hint: {mode: testing_contracts_only, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - pldg-20260617-001-plans-to-code-handoff:atom-0027
  - pldg-20260617-001-plans-to-code-handoff:atom-0030
  - pldg-20260617-001-plans-to-code-handoff:dec-0012
  - pldg-20260617-001-plans-to-code-handoff:dec-0014
  - pldg-20260617-001-plans-to-code-handoff:corr-0008
preserved_exact_tokens:
  - "Automated Testing System"
  - "TestCapabilityReport"
  - "TestHarnessProbeReport"
  - "TestStrategy"
  - "TestRunReceipt"
  - "platform-capability-discovery-first"
  - "Slint"
  - "example only"
negative_constraints:
  - Do not treat tests as a thin verificationCommand afterthought.
  - Do not hyper-focus automated testing around Slint.
owner_hints:
  - Plans/Automated_Testing_System.md
  - Plans/Project_Output_Artifacts.md
  - Plans/Executor_Protocol.md
  - Plans/Plan_To_Node_Compilation.md
```

### ATS-002 - Test Capability Discovery And Harness Probe

```yaml
plan_unit_id: ATS-002
unit_type: requirement
status: accepted
owner_doc: Plans/Automated_Testing_System.md
canonical_text: >-
  Test Capability Discovery must run before test generation or execution. It detects project_platform, framework/toolkit, local_capabilities, installed tools, app launch ability, browser automation, GUI automation, device/emulator automation, screenshot support, logs, headless/headed support, project-native test runners, and whether current official testing options need online research. Test Harness Probe records runnable verification commands, required adapters, expected artifacts, flake policy, and gaps before Executor treats a WorkNode request as test-ready.
gui_related: false
gui_classification_reason: Discovery/probe records are backend test capability contracts, even when they discover GUI or browser tools.
depends_on: [ATS-001]
unblocks: [ATS-003, ATS-004]
acceptance_criteria:
  - Discovery records platform, framework/toolkit, local tools, app launch ability, browser/GUI/device/emulator automation, screenshots, logs, headless/headed support, project-native runners, and research needs.
  - Harness probes prove commands and adapters before they are bound to WorkNode requests.
  - Missing discovery evidence blocks test-ready status instead of guessing a runner.
validation_surfaces:
  - future TestCapabilityReport schema validation
  - future TestHarnessProbeReport schema validation
risk_class: false_test_capability
reasoning_tier: high
context_scope: automated_test_discovery
implementation_surfaces: [Plans/Automated_Testing_System.md, Plans/plans_to_code_handoff.schema.json]
node_compile_hint: {mode: test_capability_discovery_contract, create_worknodes: false}
source_lineage:
  - pldg-20260617-001-plans-to-code-handoff:atom-0028
  - pldg-20260617-001-plans-to-code-handoff:dec-0012
preserved_exact_tokens:
  - "Test Capability Discovery"
  - "project_platform"
  - "framework/toolkit"
  - "browser automation"
  - "emulator"
  - "official testing options"
negative_constraints:
  - Do not infer test capability from project language alone.
owner_hints:
  - Plans/Automated_Testing_System.md
  - Plans/Tools.md
  - Plans/Project_Output_Artifacts.md
```

### ATS-003 - Test Strategy V2 And WorkNode Test Binding

```yaml
plan_unit_id: ATS-003
unit_type: requirement
status: accepted
owner_doc: Plans/Automated_Testing_System.md
canonical_text: >-
  Test Strategy v2 binds each WorkNode request to required_capability_refs, required harnesses, generated or reused tests, completion commands, browser/session requirements, emulator requirements, visual evidence requirements, expected artifacts, flake policy, and test_gap_policy. The strategy must choose project-type-specific oracles: browser DOM, console, network, screenshot, and visual checks for web; launch, window, screenshot, and accessibility checks for desktop GUI; emulator/device logs and screenshots for mobile; API, contract, and database checks for backend work; exit, output, and filesystem checks for CLI work; and unit, property, and API contracts for libraries.
gui_related: true
gui_classification_reason: WorkNode test bindings can require visible browser, GUI, device, screenshot, and visual evidence surfaces.
depends_on: [ATS-001, ATS-002]
unblocks: [PNC-013, EP-101]
acceptance_criteria:
  - WorkNode requests carry test_binding fields before execution readiness.
  - Test strategy chooses project-type-specific oracles rather than generic completion claims.
  - Visual/browser/device evidence requirements are explicit where user-visible behavior is under test.
validation_surfaces:
  - future TestStrategy schema validation
  - future WorkNode request intake validation
risk_class: weak_test_oracle
reasoning_tier: high
context_scope: worknode_test_binding
implementation_surfaces: [Plans/Automated_Testing_System.md, Plans/Plan_To_Node_Compilation.md, Plans/Executor_Protocol.md, Plans/plans_to_code_handoff.schema.json]
node_compile_hint: {mode: worknode_test_binding_contract, create_worknodes: false}
source_lineage:
  - pldg-20260617-001-plans-to-code-handoff:atom-0032
  - pldg-20260617-001-plans-to-code-handoff:atom-0033
  - pldg-20260617-001-plans-to-code-handoff:dec-0012
preserved_exact_tokens:
  - "test_binding"
  - "required_capability_refs"
  - "generated_test_ids"
  - "browser_session_required"
  - "visual_evidence_required"
  - "test_gap_policy"
  - "test oracle"
  - "browser DOM"
  - "console/network"
  - "visual checks"
  - "emulator"
  - "contract tests"
negative_constraints:
  - Do not certify WorkNode completion from worker prose when required test bindings are absent.
owner_hints:
  - Plans/Automated_Testing_System.md
  - Plans/Plan_To_Node_Compilation.md
  - Plans/Executor_Protocol.md
```

### ATS-004 - Automated Evidence And Test Gap Blockers

```yaml
plan_unit_id: ATS-004
unit_type: requirement
status: accepted
owner_doc: Plans/Automated_Testing_System.md
canonical_text: >-
  WorkNode completion cannot require human eyeballing. Tests, smoke checks, app launch, browser sessions, GUI/device sessions, screenshots, logs, and evidence capture run automatically where required. If Puppet Master cannot automatically verify a WorkNode, it must create a test capability blocker or a test-harness WorkNode request rather than silently passing. For web projects, once the native product is built, Puppet Master built-in browser automation is the primary native web test automation path; Playwright can be optional, fallback, or project-native, not the native default.
gui_related: true
gui_classification_reason: Automated screenshots, browser sessions, GUI/device sessions, and visual evidence are user-visible verification surfaces.
depends_on: [ATS-001, ATS-002, ATS-003]
unblocks: [GRS-030, EP-101, RAP-029, T-159]
acceptance_criteria:
  - Human visual inspection is never a required completion criterion.
  - Missing automatic verification creates a blocker or a test-harness WorkNode request.
  - Browser/GUI/device screenshots and logs are captured automatically where required.
  - Native web testing prefers Puppet Master built-in browser automation once available, while Playwright remains optional, fallback, or project-native.
validation_surfaces:
  - future TestRunReceipt schema validation
  - future test-gap blocker validation
risk_class: manual_only_completion
reasoning_tier: high
context_scope: automated_verification_gaps
implementation_surfaces: [Plans/Automated_Testing_System.md, Plans/Runtime_Artifacts_Panel.md, Plans/Tools.md, Plans/plans_to_code_handoff.schema.json]
node_compile_hint: {mode: automated_evidence_and_gap_policy, create_worknodes: false}
source_lineage:
  - pldg-20260617-001-plans-to-code-handoff:atom-0029
  - pldg-20260617-001-plans-to-code-handoff:atom-0031
  - pldg-20260617-001-plans-to-code-handoff:atom-0034
  - pldg-20260617-001-plans-to-code-handoff:dec-0013
  - pldg-20260617-001-plans-to-code-handoff:dec-0014
preserved_exact_tokens:
  - "100% automated"
  - "no human intervention"
  - "browser/GUI/device sessions"
  - "screenshots"
  - "test capability blocker"
  - "test-harness WorkNode"
  - "manual_only_acceptance_not_allowed"
  - "Puppet Master built-in browser automation"
  - "Playwright optional"
negative_constraints:
  - Do not make manual visual inspection a required completion step.
  - Do not silently allow unverifiable WorkNodes.
  - Do not default native Puppet Master web testing to Playwright when the built-in browser can do it.
owner_hints:
  - Plans/Automated_Testing_System.md
  - Plans/Executor_Protocol.md
  - Plans/Runtime_Artifacts_Panel.md
  - Plans/Tools.md
```

## Compilation Coverage

| Ledger atom | Disposition |
| --- | --- |
| pldg-20260617-001-plans-to-code-handoff:atom-0027 | ATS-001 |
| pldg-20260617-001-plans-to-code-handoff:atom-0028 | ATS-002 |
| pldg-20260617-001-plans-to-code-handoff:atom-0029 | ATS-004 |
| pldg-20260617-001-plans-to-code-handoff:atom-0030 | ATS-001 |
| pldg-20260617-001-plans-to-code-handoff:atom-0031 | ATS-004 |
| pldg-20260617-001-plans-to-code-handoff:atom-0032 | ATS-003 |
| pldg-20260617-001-plans-to-code-handoff:atom-0033 | ATS-003 |
| pldg-20260617-001-plans-to-code-handoff:atom-0034 | ATS-004 |

ContractRef: ContractName:Plans/Automated_Testing_System.md
