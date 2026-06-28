# Automated Testing System

> **Compliance:** This document follows `Plans/DRY_Rules.md` and uses PlanUnit metadata defined by `Plans/Plan_Document_System.md`. Naming: "Puppet Master" only.
> **PlanProfile:** New Plan Authoring Profile
> **Authority:** Canonical owner for automated test discovery, harness probing, test strategy, test binding, test receipts, visual/browser/device evidence policy, platform adapters, and test-gap blockers.

## 0. Scope

The Automated Testing System is the plans-to-code owner for platform-capability-discovery-first verification. It defines how Puppet Master discovers available test capabilities, probes project harnesses, binds tests to WorkNode request contracts, records test receipts, handles visual/browser/device evidence, and blocks completion when automated verification is missing.

This document is a contract and policy owner. It does not create WorkNodes, NodeSeeds, executable queues, final node manifests, product implementation files, dispatched GoalRuns, or production build tasks.

## 1. Ownership And Consumers

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

## 2. Canonical PlanUnits

### ATS-001 - Automated Testing System SSOT

```yaml
plan_unit_id: ATS-001
unit_type: requirement
status: accepted
owner_doc: Plans/Automated_Testing_System.md
canonical_text: >-
  Puppet Master has a first-class Automated Testing System that is platform-capability-discovery-first. It owns Test Capability Discovery, Test Harness Probe, Test Strategy v2, WorkNode test binding, Test Run Receipt, test oracle policy, platform adapter policy, visual/browser/device evidence policy, fallback policy, and test-gap blocker routing. Testing must not be a thin verificationCommand afterthought and must not be overfit to Slint; Slint is an example for Puppet Master itself while the system works for web, desktop GUI, mobile/device, backend/API, CLI, and library projects.
  The canonical report families are TestCapabilityReport, TestHarnessProbeReport, TestStrategy, and TestRunReceipt.
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
  - python3 scripts/pm-plans-verify.py validate-plans-to-code-handoff-schema
  - python3 scripts/pm-plans-verify.py validate-prd-planning-runtime-contracts
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
  TestCapabilityReport and TestHarnessProbeReport fields include online_research, automation_surface, requires_browser, requires_emulator, requires_display, requires_screenshot, verification_command, expected_artifacts, and flake_policy.
gui_related: false
gui_classification_reason: Discovery/probe records are backend test capability contracts, even when they discover GUI or browser tools.
depends_on: [ATS-001]
unblocks: [ATS-003, ATS-004]
acceptance_criteria:
  - Discovery records platform, framework/toolkit, local tools, app launch ability, browser/GUI/device/emulator automation, screenshots, logs, headless/headed support, project-native runners, and research needs.
  - Harness probes prove commands and adapters before they are bound to WorkNode requests.
  - Missing discovery evidence blocks test-ready status instead of guessing a runner.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py validate-plans-to-code-handoff-schema
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
  Test Strategy v2 binds each WorkNode request to required_capability_refs, required harnesses, generated or reused tests, generated_test_ids, reused_test_ids, completion commands, browser/session requirements, emulator requirements, visual evidence requirements, expected artifacts, flake policy, and test_gap_policy. The strategy must choose project-type-specific oracles: browser DOM, console, network, screenshot, and visual checks for web; launch, window, screenshot, and accessibility checks for desktop GUI; emulator/device logs and screenshots for mobile; API, contract, and database checks for backend work; exit, output, and filesystem checks for CLI work; and unit, property, and API contracts for libraries.
  TestStrategy records include test_level, generated_test_ids, reused_test_ids, browser_session_required, visual_evidence_required, test oracle, console/network, and contract tests where applicable.
gui_related: true
gui_classification_reason: WorkNode test bindings can require visible browser, GUI, device, screenshot, and visual evidence surfaces.
depends_on: [ATS-001, ATS-002]
unblocks: [PNC-013, EP-101]
acceptance_criteria:
  - WorkNode requests carry test_binding fields before execution readiness.
  - Test strategy chooses project-type-specific oracles rather than generic completion claims.
  - Visual/browser/device evidence requirements are explicit where user-visible behavior is under test.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py validate-plans-to-code-handoff-schema
  - python3 scripts/pm-plans-verify.py validate-prd-planning-runtime-contracts
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
  - "reused_test_ids"
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
  WorkNode completion cannot require human eyeballing. Tests, smoke checks, app launch, browser sessions, GUI/device sessions, screenshots, logs, and evidence capture run automatically where required. If Puppet Master cannot automatically verify a WorkNode after the compiler/runtime boundary is explicitly enabled, it must record a test capability blocker or deferred non-executable test-harness WorkNode request candidate rather than silently passing. For web projects, once the native product is built, Puppet Master built-in browser automation is the primary native web test automation path; Playwright can be optional, fallback, or project-native, not the native default.
  Automated completion means 100% automated verification with no human intervention for required browser/GUI/device sessions; Playwright optional remains fallback/project-native, and manual_only_acceptance_not_allowed blocks manual-only completion claims. TestRunReceipt records include receipt_id, test_strategy_ref, test_case_refs, generated_test_ids, reused_test_ids, verification_command, expected_artifacts, evidence_refs, visual_evidence_refs, flake_policy, and test_gap_policy.
gui_related: true
gui_classification_reason: Automated screenshots, browser sessions, GUI/device sessions, and visual evidence are user-visible verification surfaces.
depends_on: [ATS-001, ATS-002, ATS-003]
unblocks: [GRS-030, EP-101, RAP-029, T-159]
acceptance_criteria:
  - Human visual inspection is never a required completion criterion.
  - Missing automatic verification records a blocker or, after runtime enablement, a deferred non-executable test-harness WorkNode request candidate.
  - Browser/GUI/device screenshots and logs are captured automatically where required.
  - Native web testing prefers Puppet Master built-in browser automation once available, while Playwright remains optional, fallback, or project-native.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py validate-plans-to-code-handoff-schema
  - python3 scripts/pm-plans-verify.py validate-prd-planning-runtime-contracts
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
  - "TestRunReceipt"
  - "test_strategy_ref"
  - "reused_test_ids"
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

## 3. Contracts, Schemas, Events, Or Data Shapes

Automated testing contracts are represented in `Plans/plans_to_code_handoff.schema.json` as design-only `$defs` and artifact families, including `test_capability_report`, `test_harness_probe_report`, `test_strategy`, `test_case`, `test_run_receipt`, and `visual_evidence`. These names are schema definitions inside the single plans-to-code handoff schema draft; they are not separate runtime queues or emitted product artifacts.

Required automated-testing data shapes include project platform and framework/toolkit identity, local capability inventory, online research requirement, harness probe command and adapter results, required capability refs, generated or reused test IDs, browser/session requirements, visual evidence requirements, expected artifacts, flake policy, test oracle selection, and test-gap policy.

ContractRef: ContractName:Plans/plans_to_code_handoff.schema.json, ContractName:Plans/Contracts_V0.md

## 4. Integration Surfaces

Integration surfaces:
- `Plans/Plan_To_Node_Compilation.md` consumes capability and binding requirements while drafting future non-executable NodeSeed candidates, WorkGraph drafts, and WorkNode requests after the compiler contract exists.
- `Plans/Executor_Protocol.md` consumes test binding and receipt contracts at intake, dispatch, verification, repair, and certification boundaries.
- `Plans/Tools.md` owns concrete browser, GUI, device, CLI, and project-native test helpers.
- `Plans/Project_Output_Artifacts.md` and `Plans/Runtime_Artifacts_Panel.md` project test artifacts and evidence without becoming test policy owners.
- `Plans/FinalGUISpec.md` may show visible testing capability and evidence state, but it does not re-own automated-testing policy.

## 5. Validation And Acceptance

Acceptance for this owner doc is established by PlanUnit index validation, standard plan governance gates, the plans-to-code handoff schema, the PRD/planning runtime contract packet, and Executor intake contracts that reject missing required test bindings.

Safe current validators:
- `python3 scripts/pm-plan-index.py validate`
- `python3 scripts/pm-plans-verify.py run-gates`
- `python3 scripts/pm-plans-verify.py validate-plans-to-code-handoff-schema`
- `python3 scripts/pm-plans-verify.py validate-prd-planning-runtime-contracts`
- `python3 scripts/pm-shard-plans.py --check`

Current contract validators check TestCapabilityReport, TestHarnessProbeReport, TestStrategy, TestRunReceipt, visible evidence, and test-gap blocker shapes as schema contracts; executable test harness proof is required only after the runtime/compiler boundary is explicitly enabled.

## 6. Plan-To-Node Readiness

The Automated Testing System is ready as a contract source for future Plan-to-node compilation, but it does not make the compiler executable. Current node readiness remains `runtime_disabled` until `Plans/Plan_To_Node_Compilation.md` and a later explicit enablement allow runtime PlanCompile launch and node-artifact generation.

## 7. Deferred, Retired, Compatibility, And Non-Goals

Deferred:
- Executable project-native runner adapters remain implementation work after the compiler/runtime boundary is enabled.

Compatibility and non-goals:
- Slint is an example for Puppet Master itself, not the default test strategy for every user project.
- Playwright is optional, fallback, or project-native once Puppet Master's built-in browser automation exists.
- Manual-only visual acceptance is not an allowed completion substitute for required automated verification.
- This document does not create WorkNodes, NodeSeeds, executable queues, final node manifests, product implementation files, dispatched GoalRuns, or production build tasks.

## 8. Source Lineage And Governance

`Plans/Automated_Testing_System.md` was created from `pldg-20260617-001-plans-to-code-handoff` as a new top-level owner doc. It uses the New Plan Authoring Profile and must be registered in governance/sharding surfaces when governance is sealed for this compile. Ledger lineage remains source memory only; live PlanUnits below are canonical product prose.

### Compilation Coverage

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


## Ledger Compile Addendum - pldg-20260618-001-prd-planning-wizard

This addendum compiles source-lineage obligations from bootstrap ledger `pldg-20260618-001-prd-planning-wizard` into this existing owner or consumer doc. It does not create WorkNodes, NodeSeeds, executable queues, GoalRuns, implementation files, generated governance artifacts, or production build tasks.

### ATS-005 - Testing Defaults And Scoped Overrides

```yaml
plan_unit_id: ATS-005
unit_type: requirement
status: accepted
owner_doc: Plans/Automated_Testing_System.md
canonical_text: 'Automated testing and evidence collection are platform defaults for planned and executed work; Planning Wizard conversations refine requirements and constraints but do not casually disable the automated testing system. Disabling or restricting automated testing requires a durable testing_policy_override explicitly approved by the user for exact projects, PlanUnits, WorkNodes, capability classes, reasons, risks, approver_ref, approved_at_utc, evidence_refs, redaction_profile_ref, and expiration or reopen conditions. Affected work remains truthfully marked with an approved verification exception, such as completed_with_approved_verification_exception, and must never be represented as an automated test pass or full certification. Visible or headed-session verification cannot pass without interaction evidence, artifact evidence, and redaction disposition.'
gui_related: false
gui_classification_reason: Backend, planning, contract, governance, or workflow behavior rather than visual presentation.
depends_on: []
unblocks: []
acceptance_criteria:
- The live owner doc preserves every source atom listed in source_atom_ids without treating the ledger as canonical product prose.
- Exact tokens, negative constraints, owner hints, and accepted corrections remain available to future audits through this PlanUnit.
- No WorkNodes, NodeSeeds, executable queues, GoalRuns, implementation files, generated governance artifacts, or production build tasks are created by this compile.
- Testing Off or restricted testing records approver, scope, risk, evidence, redaction profile, expiration or reopen condition, and truthful exception result.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard
risk_class: owner_drift
reasoning_tier: standard
context_scope: ledger_to_plans_compile
implementation_surfaces:
- Plans/Automated_Testing_System.md
- Plans/Planning_Wizard.md
- Plans/Contracts_V0.md
- Plans/human-in-the-loop.md
- Plans/Executor_Protocol.md
node_compile_hint:
  mode: canonical_planunit_from_bootstrap_ledger
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260618-001-prd-planning-wizard:atom-0080
- pldg-20260618-001-prd-planning-wizard:atom-0081
- pldg-20260618-001-prd-planning-wizard:atom-0082
- Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard/source_shards/05-testing-and-visible-verification.md#SRC-TESTING
source_atom_ids:
- atom-0080
- atom-0081
- atom-0082
decision_refs:
- dec-0016
correction_refs:
- corr-0007
preserved_exact_tokens:
- automated testing is enabled by default
- testing_policy_override
- completed_with_approved_verification_exception
- approver_ref
- evidence_refs
- redaction_profile_ref
negative_constraints:
- Do not ask whether testing should exist as though no testing were the ordinary default.
- Do not infer an opt-out from casual conversation or a capability setting being unavailable.
- Do not convert an approved testing exception into test_passed or certified.
- Do not allow visible-session pass without evidence and redaction disposition.
owner_hints:
- Plans/Automated_Testing_System.md
- Plans/Planning_Wizard.md
- Plans/Contracts_V0.md
- Plans/human-in-the-loop.md
- Plans/Executor_Protocol.md
```

### ATS-006 - Official-Source Testing Research And Provenance

```yaml
plan_unit_id: ATS-006
unit_type: requirement
status: accepted
owner_doc: Plans/Automated_Testing_System.md
canonical_text: 'Plan Compile performs project-level discovery of existing runners, commands, harnesses, frameworks, environments, services, emulators, browsers, devices, credentials, and evidence surfaces before finalizing WorkNode-specific test bindings. Test Capability Discovery searches current official and primary sources for appropriate live testing, hot reload, live preview, browser automation, GUI automation, simulator, emulator, device, cloud, accessibility, performance, security, and project-native testing methods relevant to the technology stack. Online capability research records source URL or provider reference, publication or update time when available, retrieval time, tool and version, supported platform, license, cost, credential needs, installation scope, freshness, confidence, and selection rationale.'
gui_related: false
gui_classification_reason: Backend, planning, contract, governance, or workflow behavior rather than visual presentation.
depends_on: []
unblocks: []
acceptance_criteria:
- The live owner doc preserves every source atom listed in source_atom_ids without treating the ledger as canonical product prose.
- Exact tokens, negative constraints, owner hints, and accepted corrections remain available to future audits through this PlanUnit.
- No WorkNodes, NodeSeeds, executable queues, GoalRuns, implementation files, generated governance artifacts, or production build tasks are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard
risk_class: owner_drift
reasoning_tier: standard
context_scope: ledger_to_plans_compile
implementation_surfaces:
- Plans/Automated_Testing_System.md
- Plans/Plan_To_Node_Compilation.md
- Plans/Tools.md
- Plans/Permissions_System.md
- Plans/Project_Output_Artifacts.md
node_compile_hint:
  mode: canonical_planunit_from_bootstrap_ledger
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260618-001-prd-planning-wizard:atom-0083
- pldg-20260618-001-prd-planning-wizard:atom-0084
- pldg-20260618-001-prd-planning-wizard:atom-0085
- Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard/source_shards/05-testing-and-visible-verification.md#SRC-TESTING
source_atom_ids:
- atom-0083
- atom-0084
- atom-0085
decision_refs:
- dec-0017
correction_refs:
- corr-0013
preserved_exact_tokens:
- Test Capability Discovery
- project-level discovery
- official sources
- live testing
- hot reload
- live preview
- research provenance
- retrieval time
- selection rationale
negative_constraints:
- Do not rely solely on stale internal model knowledge for current tools, versions, setup methods, or platform availability.
owner_hints:
- Plans/Automated_Testing_System.md
- Plans/Plan_To_Node_Compilation.md
- Plans/Tools.md
- Plans/Permissions_System.md
- Plans/Project_Output_Artifacts.md
```

### ATS-007 - Authorized Test Tool Installation And Rollback

```yaml
plan_unit_id: ATS-007
unit_type: requirement
status: accepted
owner_doc: Plans/Automated_Testing_System.md
canonical_text: 'When an appropriate test, live-preview, hot-reload, browser, simulator, emulator, or support method is missing, the system may install or configure it within project-local or pre-authorized policy and must record commands, changes, receipts, rollback, and currentness. Global or privileged installation, paid services, license acceptance, account creation, credential use, device enrollment, or material external effects require applicable authority and may become a typed blocker rather than an unsafe silent install. Testing-tool installation and configuration writes use FileSafe/source-control safe points, bounded write surfaces, receipts, revalidation, and rollback so discovery cannot damage the user''s project or environment.'
gui_related: false
gui_classification_reason: Backend, planning, contract, governance, or workflow behavior rather than visual presentation.
depends_on: []
unblocks: []
acceptance_criteria:
- The live owner doc preserves every source atom listed in source_atom_ids without treating the ledger as canonical product prose.
- Exact tokens, negative constraints, owner hints, and accepted corrections remain available to future audits through this PlanUnit.
- No WorkNodes, NodeSeeds, executable queues, GoalRuns, implementation files, generated governance artifacts, or production build tasks are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard
risk_class: owner_drift
reasoning_tier: standard
context_scope: ledger_to_plans_compile
implementation_surfaces:
- Plans/Automated_Testing_System.md
- Plans/Executor_Protocol.md
- Plans/FileSafe.md
- Plans/Permissions_System.md
- Plans/human-in-the-loop.md
- Plans/WorktreeGitImprovement.md
node_compile_hint:
  mode: canonical_planunit_from_bootstrap_ledger
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260618-001-prd-planning-wizard:atom-0086
- pldg-20260618-001-prd-planning-wizard:atom-0087
- pldg-20260618-001-prd-planning-wizard:atom-0088
- Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard/source_shards/05-testing-and-visible-verification.md#SRC-TESTING
source_atom_ids:
- atom-0086
- atom-0087
- atom-0088
decision_refs:
- dec-0017
correction_refs:
- corr-0013
preserved_exact_tokens:
- install
- configure
- rollback
- privileged installation
- paid service
- license acceptance
- safe point
negative_constraints: []
owner_hints:
- Plans/Automated_Testing_System.md
- Plans/Executor_Protocol.md
- Plans/FileSafe.md
- Plans/Permissions_System.md
- Plans/human-in-the-loop.md
- Plans/WorktreeGitImprovement.md
```

### ATS-008 - Testing Capability Settings Model

```yaml
plan_unit_id: ATS-008
unit_type: requirement
status: accepted
owner_doc: Plans/Automated_Testing_System.md
canonical_text: 'Testing capability policy is configurable globally and per project, with project settings inheriting or overriding global values and the effective policy snapshot carried into Planning Wizard, Plan Compile, Executor, and Orchestrator. Each testing capability family supports Auto, On, and Off: Auto discovers and selects or installs within authority; On is required and blocks or asks for authority when unavailable; Off prohibits use and installation for that capability without implying a pass. Settings cover online capability research, automated installation, built-in browser, headed browser, visible browser automation, hot reload, live preview, desktop GUI testing, simulator or emulator, physical device, screenshot or visual comparison, accessibility, API or contract, database, console or network, performance, and security testing.'
gui_related: true
gui_classification_reason: Includes user-visible GUI/workspace/command/projection behavior.
depends_on: []
unblocks: []
acceptance_criteria:
- The live owner doc preserves every source atom listed in source_atom_ids without treating the ledger as canonical product prose.
- Exact tokens, negative constraints, owner hints, and accepted corrections remain available to future audits through this PlanUnit.
- No WorkNodes, NodeSeeds, executable queues, GoalRuns, implementation files, generated governance artifacts, or production build tasks are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard
risk_class: owner_drift
reasoning_tier: standard
context_scope: ledger_to_plans_compile
implementation_surfaces:
- Plans/Automated_Testing_System.md
- Plans/FinalGUISpec.md
- Plans/Multi-Account.md
- Plans/Contracts_V0.md
node_compile_hint:
  mode: canonical_planunit_from_bootstrap_ledger
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260618-001-prd-planning-wizard:atom-0089
- pldg-20260618-001-prd-planning-wizard:atom-0090
- pldg-20260618-001-prd-planning-wizard:atom-0091
- Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard/source_shards/05-testing-and-visible-verification.md#SRC-TESTING
source_atom_ids:
- atom-0089
- atom-0090
- atom-0091
decision_refs:
- dec-0018
correction_refs:
- corr-0015
preserved_exact_tokens:
- global settings
- per-project settings
- effective policy snapshot
- Auto
- 'On'
- 'Off'
- built-in browser
- visible browser automation
- hot reload
- simulator
- accessibility
- performance
- security
negative_constraints:
- Do not treat Off as successful verification.
owner_hints:
- Plans/Automated_Testing_System.md
- Plans/FinalGUISpec.md
- Plans/Multi-Account.md
- Plans/Contracts_V0.md
```

### ATS-009 - Visible Verification Sessions And Redaction

```yaml
plan_unit_id: ATS-009
unit_type: requirement
status: accepted
owner_doc: Plans/Automated_Testing_System.md
canonical_text: 'The default testing visibility policy is show_when_possible: when a meaningful headed or visual surface exists, expose the active test session rather than hiding all verification in background logs. For web work, open the built-in browser or headed browser view and visibly show navigation, clicks, form input, assertions, screenshots, console and network evidence, and pass/fail progression when supported. For Swift and other native work, show the appropriate live preview, hot-reload surface, simulator, emulator, device stream, application window, interaction trace, screenshots, and relevant logs when available and permitted. Users may collapse, detach, background, or leave a visible test session while automation continues; the system preserves session state and does not require the user to watch every action. When a live surface cannot be embedded, expose an Open or Watch action, snapshots, screenshot sequence, video
  or stream where supported, structured interaction timeline, logs, console and network traces, and evidence links. Visible testing, screenshots, video, logs, console, network traces, and artifacts apply secret and sensitive-data redaction before display or persistence.'
gui_related: true
gui_classification_reason: Includes user-visible GUI/workspace/command/projection behavior.
depends_on: []
unblocks: []
acceptance_criteria:
- The live owner doc preserves every source atom listed in source_atom_ids without treating the ledger as canonical product prose.
- Exact tokens, negative constraints, owner hints, and accepted corrections remain available to future audits through this PlanUnit.
- No WorkNodes, NodeSeeds, executable queues, GoalRuns, implementation files, generated governance artifacts, or production build tasks are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard
risk_class: owner_drift
reasoning_tier: high
context_scope: ledger_to_plans_compile
implementation_surfaces:
- Plans/Automated_Testing_System.md
- Plans/Orchestrator_Page.md
- Plans/FinalGUISpec.md
- Plans/Runtime_Artifacts_Panel.md
- Plans/Permissions_System.md
node_compile_hint:
  mode: canonical_planunit_from_bootstrap_ledger
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260618-001-prd-planning-wizard:atom-0092
- pldg-20260618-001-prd-planning-wizard:atom-0093
- pldg-20260618-001-prd-planning-wizard:atom-0094
- pldg-20260618-001-prd-planning-wizard:atom-0095
- pldg-20260618-001-prd-planning-wizard:atom-0096
- pldg-20260618-001-prd-planning-wizard:atom-0097
- Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard/source_shards/05-testing-and-visible-verification.md#SRC-TESTING
source_atom_ids:
- atom-0092
- atom-0093
- atom-0094
- atom-0095
- atom-0096
- atom-0097
decision_refs:
- dec-0019
correction_refs:
- corr-0014
preserved_exact_tokens:
- show_when_possible
- built-in browser
- clicks
- form input
- assertions
- Swift
- live preview
- simulator
- emulator
- device stream
- collapse
- detach
- automation continues
- Open
- Watch
- interaction timeline
- redaction
negative_constraints:
- Do not expose credentials, tokens, personal data, or protected project content through visible testing.
owner_hints:
- Plans/Automated_Testing_System.md
- Plans/Orchestrator_Page.md
- Plans/FinalGUISpec.md
- Plans/Runtime_Artifacts_Panel.md
- Plans/Permissions_System.md
```

### ATS-010 - Test Capability, Session Receipts, And Revalidation

```yaml
plan_unit_id: ATS-010
unit_type: requirement
status: accepted
owner_doc: Plans/Automated_Testing_System.md
canonical_text: 'Discovery, research, selection, installation, harness probe, visible session, user interaction, test result, artifact, exception, and cleanup operations produce typed receipts linked to project, PlanCompileRun, GoalRun, WorkNode, attempt, capability, and source currentness. Provisioning Preflight confirms that selected test capabilities, installations, services, browsers, devices, simulators, credentials, and commands remain current and runnable immediately before WorkNode execution. Historical quotations, compatibility notes, vendor or third-party sources, generated lockfiles, and rules that mention TODO or stub terminology are not false positives, while empty functions, panic or unimplemented paths, placeholder returns, fake tests, and implement-later prose are blockers. The fixture suite covers duplicate PlanApproved delivery, restart during every activation step, greenfield Git, non-Git FileSafe, dirty repository, remote SSH,
  optional GitHub or PR, missing harness, testing override, plan revision during compile and execution, cancellation before and after mutation, missing parallel receipts, and a deliberately introduced incomplete item.'
gui_related: false
gui_classification_reason: Backend, planning, contract, governance, or workflow behavior rather than visual presentation.
depends_on: []
unblocks: []
acceptance_criteria:
- The live owner doc preserves every source atom listed in source_atom_ids without treating the ledger as canonical product prose.
- Exact tokens, negative constraints, owner hints, and accepted corrections remain available to future audits through this PlanUnit.
- No WorkNodes, NodeSeeds, executable queues, GoalRuns, implementation files, generated governance artifacts, or production build tasks are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard
risk_class: implementation_readiness
reasoning_tier: high
context_scope: ledger_to_plans_compile
implementation_surfaces:
- Plans/Automated_Testing_System.md
- Plans/Contracts_V0.md
- Plans/Project_Output_Artifacts.md
- Plans/Executor_Protocol.md
- Plans/Planning_Wizard.md
- Plans/Progression_Gates.md
- Plans/Plan_To_Node_Compilation.md
node_compile_hint:
  mode: canonical_planunit_from_bootstrap_ledger
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260618-001-prd-planning-wizard:atom-0098
- pldg-20260618-001-prd-planning-wizard:atom-0100
- pldg-20260618-001-prd-planning-wizard:atom-0138
- pldg-20260618-001-prd-planning-wizard:atom-0146
- Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard/source_shards/05-testing-and-visible-verification.md#SRC-TESTING
- Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard/source_shards/07-audit-readiness-and-safety.md#SRC-AUDIT
source_atom_ids:
- atom-0098
- atom-0100
- atom-0138
- atom-0146
decision_refs:
- dec-0028
correction_refs: []
preserved_exact_tokens:
- test capability receipt
- visible session receipt
- Provisioning Preflight
- harness revalidation
- context-aware
- duplicate PlanApproved
- dirty repository
- missing parallel receipts
- deliberately introduced incomplete item
negative_constraints: []
owner_hints:
- Plans/Automated_Testing_System.md
- Plans/Contracts_V0.md
- Plans/Project_Output_Artifacts.md
- Plans/Executor_Protocol.md
- Plans/Planning_Wizard.md
- Plans/Progression_Gates.md
- Plans/Plan_To_Node_Compilation.md
```

## Ledger Compile Addendum - pldg-20260622-001-fff

### ATS-011 - Discovery Testing And Consumer Conformance

```yaml
plan_unit_id: ATS-011
unit_type: validation_criterion
status: accepted
owner_doc: Plans/Automated_Testing_System.md
canonical_text: >-
  Automated_Testing_System owns validation for native DiscoveryService conformance, not service semantics. Tests cover ordinary no-exact-path bug-fix agent discovery, Builder orientation, Verifier exact-evidence follow-up, GUI/agent parity, every consumer conformance row, Assistant Chat discovery visibility on/off, SSH-backed discovery with no local checkout, remote/cache freshness, no local fallback, denied/hidden-by-policy no-leak behavior, root/home refusal, ignore and symlink policy, deterministic ranking, disabled/unsupported/backpressure/over-budget fallback receipts, frecency reset versus durable receipt retention, path identity versus display_path, cache migration/rebuild/discard behavior, scheduler dedupe/cancellation/fairness, and PlanUnit index discovery conformance without WorkNode creation.
gui_related: true
gui_classification_reason: This validates GUI parity, Assistant Chat visibility, visible degraded states, screenshots/receipts, and user-facing discovery surfaces.
depends_on: [T-160, T-161, T-162, T-163, CV-291, SP-217, SP-218, F2-191, PS-118, ACD-422, F3-399, OSI-429, EP-106, PNC-020, RAP-031]
unblocks: []
acceptance_criteria:
  - Each discovery consumer row has a validation scenario proving shared-substrate access and policy/freshness/fallback handling.
  - Performance budgets cover local warm query, GUI query, agent discover_paths, cold indexing, remote/SSH manifest query and refresh, watcher/reindex, cancellation, memory, disk, timeout, and over-budget fallback.
  - Tests prove denied/hidden candidates cannot leak through counts, selected ids, rank gaps, summaries, diagnostics, or receipts.
  - Tests prove no WorkNodes, NodeSeeds, executable queues, final node manifests, runtime launches, implementation files, or production build tasks are created by this compile/index lane.
validation_surfaces:
  - Future DiscoveryService conformance suite.
  - Future Assistant Chat visibility and toggle tests.
  - Future SSH/no-local-fallback tests.
  - Future PlanUnit index no-worknodes-created check.
risk_class: discovery_validation_gap
reasoning_tier: high
context_scope: discovery_conformance_testing
implementation_surfaces: [Plans/Automated_Testing_System.md, future discovery conformance tests, future GUI tests, future SSH tests]
node_compile_hint: {mode: validation_contract_only, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - pldg-20260622-001-fff:atom-0025
  - pldg-20260622-001-fff:atom-0028
  - pldg-20260622-001-fff:atom-0043
  - pldg-20260622-001-fff:atom-0044
  - pldg-20260622-001-fff:atom-0045
  - pldg-20260622-001-fff:atom-0055
  - pldg-20260622-001-fff:atom-0052
  - pldg-20260622-001-fff:atom-0059
  - pldg-20260622-001-fff:atom-0065
  - pldg-20260622-001-fff:atom-0068
  - pldg-20260622-001-fff:atom-0070
  - pldg-20260622-001-fff:atom-0071
  - pldg-20260622-001-fff:atom-0072
  - pldg-20260622-001-fff:atom-0074
  - pldg-20260622-001-fff:atom-0075
  - pldg-20260622-001-fff:atom-0077
  - pldg-20260622-001-fff:atom-0078
  - pldg-20260622-001-fff:atom-0079
  - pldg-20260622-001-fff:atom-0080
  - pldg-20260622-001-fff:atom-0081
  - pldg-20260622-001-fff:atom-0082
  - pldg-20260622-001-fff:atom-0083
  - pldg-20260622-001-fff:atom-0084
  - pldg-20260622-001-fff:atom-0085
  - pldg-20260622-001-fff:atom-0086
  - pldg-20260622-001-fff:atom-0087
  - pldg-20260622-001-fff:atom-0089
  - pldg-20260622-001-fff:atom-0090
  - pldg-20260622-001-fff:atom-0091
  - pldg-20260622-001-fff:atom-0092
  - pldg-20260622-001-fff:atom-0093
  - pldg-20260622-001-fff:atom-0094
  - pldg-20260622-001-fff:atom-0095
  - pldg-20260622-001-fff:state/precision_contract.json#validation_acceptance_cases
source_atom_ids: [atom-0025, atom-0028, atom-0043, atom-0044, atom-0045, atom-0052, atom-0055, atom-0059, atom-0065, atom-0068, atom-0070, atom-0071, atom-0072, atom-0074, atom-0075, atom-0077, atom-0078, atom-0079, atom-0080, atom-0081, atom-0082, atom-0083, atom-0084, atom-0085, atom-0086, atom-0087, atom-0089, atom-0090, atom-0091, atom-0092, atom-0093, atom-0094, atom-0095]
preserved_exact_tokens: ["no-exact-path bug fix", "Builder orientation", "Verifier exact-evidence follow-up", "SSH project with no local checkout", "denied/hidden-by-policy no-leak", "disabled/unsupported/backpressure/over-budget fallback receipts", "deterministic ranking", "GUI parity without silent re-sort", "Assistant Chat visibility on/off", "frecency reset versus durable receipt retention", "PlanUnit index describing discovery conformance without WorkNodes"]
negative_constraints:
  - Do not claim implementation-ready pass without denied, stale, fallback, SSH, GUI, and exact-verification cases.
  - Do not let tests treat DiscoveryService ranking as exact content verification.
owner_hints: [Plans/Automated_Testing_System.md, Plans/Tools.md, Plans/FinalGUISpec.md, Plans/assistant-chat-design.md, Plans/storage-plan.md]
```


## Ledger Compile Addendum - pldg-20260626-001-feature-name

This addendum compiles accepted source-lineage obligations from bootstrap ledger `pldg-20260626-001-feature-name` into this existing owner/consumer doc. It creates canonical PlanUnits only; it does not create WorkNodes, NodeSeeds, executable queues, final node manifests, implementation files, generated governance artifacts, or production build tasks.

### ATS-012 - History MVP Acceptance Tests

```yaml
plan_unit_id: ATS-012
unit_type: validation_criterion
status: accepted
owner_doc: Plans/Automated_Testing_System.md
canonical_text: History MVP tests cover current-project lock, approved-only default, All history expansion, Include
  archived as extra step, dense row schema, structured filter chips plus text search, Documents and Runs subviews,
  deep compare with rendered/source-lineage/manifest views, export selected rows/multi-select/filtered view with
  manifests and evidence/redaction profile, stale projection read-only warning, rebuild action, blocked authority-sensitive
  actions before rebuild, immutable source preservation, and no WorkNodes/NodeSeeds/executable queues created by
  compile/index.
gui_related: true
gui_classification_reason: Validates user-visible History tables, filters, compare/export actions, degraded states,
  and no-build boundary.
depends_on:
- OP-026
- OP-027
- SP-219
unblocks: []
acceptance_criteria:
- Live PlanUnit exists in the adjudicated owner doc with reciprocal ledger source_lineage.
- Exact source tokens, negative constraints, owner hints, and user corrections are preserved in PlanUnit metadata.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, implementation files, or production build tasks
  are created by this compile.
validation_surfaces:
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260626-001-feature-name
- python3 scripts/pm-plan-index.py validate
- git diff --check
risk_class: history_validation_gap
reasoning_tier: standard
context_scope: history_acceptance_tests
implementation_surfaces:
- Plans/Automated_Testing_System.md
- future History GUI and projection tests
node_compile_hint:
  mode: history_acceptance_tests
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260626-001-feature-name:atom-0065
- pldg-20260626-001-feature-name:atom-0066
- chat:history-pressure-test-request
- chat:history-pressure-test-defaults-answer
source_atom_ids:
- atom-0065
- atom-0066
decision_refs:
- dec-0011
- dec-0012
preserved_exact_tokens:
- acceptance tests
- current project
- Approved only
- All history
- Include archived
- Compare versions
- Export
- Rebuild
- 'yes'
- Before compile
- pressure-test
- remaining underspecified History surfaces
negative_constraints:
- Do not compile without acceptance coverage for project scoping, archive visibility, export/redaction, projection
  rebuild, and immutable-history behavior.
- Do not treat validator success as evidence that user-facing History workflows were tested.
- Do not treat this pressure-test as permission to write canonical Plans.
- Do not create Plans/.plan_index, WorkNodes, NodeSeeds, executable queues, Spec_Lock, shards, evidence, plan_graph,
  or auto_decisions.
- Do not compile without a future explicit compile request.
owner_hints:
- Plans/Automated_Testing_System.md
- Plans/Orchestrator_Page.md
- Plans/FinalGUISpec.md
- Plans/Permissions_System.md
- Plans/storage-plan.md
- Plans/UI_Command_Catalog.md
```

### ATS-013 - Vision Bridge MVP Acceptance Tests

```yaml
plan_unit_id: ATS-013
unit_type: validation_criterion
status: accepted
owner_doc: Plans/Automated_Testing_System.md
canonical_text: Vision bridge MVP tests cover automatic fallback for non-vision models, no bridge when native image
  input is reliable, manual rerun, deterministic source precedence, clipboard and recent OS screenshots in MVP,
  ambiguous screenshot picker, FileSafe project-file guard, disclosure popup reject/accept/always accept, scoped
  revocation, redaction blocking/override policy, fail-closed unavailable results for every degraded reason, structured
  prompt/output including uncertainty/OCR/limitations, cache invalidation and stale labels, provider retry/cost/reroute
  disclosure, and no guessing after failure.
gui_related: true
gui_classification_reason: Validates user-visible image/screenshot bridge workflows, permissions, artifacts, and
  degraded states.
depends_on:
- T-165
- PP-055
- PS-121
- ACD-425
unblocks: []
acceptance_criteria:
- Live PlanUnit exists in the adjudicated owner doc with reciprocal ledger source_lineage.
- Exact source tokens, negative constraints, owner hints, and user corrections are preserved in PlanUnit metadata.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, implementation files, or production build tasks
  are created by this compile.
validation_surfaces:
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260626-001-feature-name
- python3 scripts/pm-plan-index.py validate
- git diff --check
risk_class: vision_bridge_validation_gap
reasoning_tier: high
context_scope: vision_bridge_acceptance_tests
implementation_surfaces:
- Plans/Automated_Testing_System.md
- future vision bridge tests
node_compile_hint:
  mode: vision_bridge_acceptance_tests
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260626-001-feature-name:atom-0088
- chat:vision-pressure-test-request
- chat:vision-pressure-test-defaults-answer
source_atom_ids:
- atom-0088
decision_refs:
- dec-0016
- dec-0017
preserved_exact_tokens:
- acceptance tests
- automatic fallback
- native image-input routes
- manual rerun with a question
- reject/accept/always-accept
- revocation
- ambiguous recent screenshot
- provider unavailable/no-route
- cache hit/stale/rerun
- redaction blocked/allowed
- artifact/source lineage
- 'yes'
negative_constraints:
- Do not call the vision bridge implementation-ready without acceptance coverage for permission persistence, source
  ambiguity, failure/degraded states, cache invalidation, and artifact lineage.
- Do not let validator success stand in for testing user-visible image bridge workflows.
- Do not omit tests that prove non-vision models do not guess after bridge failure.
owner_hints:
- Plans/Automated_Testing_System.md
- Plans/Tools.md
- Plans/FinalGUISpec.md
- Plans/Runtime_Artifacts_Panel.md
- Plans/Permissions_System.md
- Plans/Media_Generation_and_Capabilities.md
```

### ATS-014 - Teach Teacher End To End Acceptance Tests

```yaml
plan_unit_id: ATS-014
unit_type: validation_criterion
status: accepted
owner_doc: Plans/Automated_Testing_System.md
canonical_text: Teach/Teacher tests cover help icon launching a new Teacher thread with current-surface context,
  /teach and natural-language summon/disambiguation, low-end model default and GUI setting states, requested/effective
  model disclosure, PM knowledge source disclosure, missing coverage callout, guided overlay happy path and degraded
  states, mutation confirmation, activity cards, memory capture save/cancel/scope/conflict/revoke/unlock, Teacher
  handoff, responsive/overflow/keyboard/screen-reader behavior, Teach Help/Glossary coverage, and a PM knowledge
  pressure test over PM concepts, workflows, settings, models, capabilities, permissions, history, artifacts, Personas,
  skills/plugins, Orchestrator behavior, and Teach memory.
gui_related: true
gui_classification_reason: Validates GUI/thread/help/source/model/memory/handoff behavior across Teach surfaces.
depends_on:
- ACD-426
- P-055
- MS-117
- PP-056
- F3-403
- G-026
- UCC-102
unblocks: []
acceptance_criteria:
- Live PlanUnit exists in the adjudicated owner doc with reciprocal ledger source_lineage.
- Exact source tokens, negative constraints, owner hints, and user corrections are preserved in PlanUnit metadata.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, implementation files, or production build tasks
  are created by this compile.
validation_surfaces:
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260626-001-feature-name
- python3 scripts/pm-plan-index.py validate
- git diff --check
risk_class: teach_validation_gap
reasoning_tier: high
context_scope: teach_teacher_acceptance_tests
implementation_surfaces:
- Plans/Automated_Testing_System.md
- future Teach/Teacher tests
node_compile_hint:
  mode: teach_teacher_acceptance_tests
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260626-001-feature-name:atom-0101
- pldg-20260626-001-feature-name:atom-0110
- pldg-20260626-001-feature-name:atom-0118
- pldg-20260626-001-feature-name:atom-0133
- pldg-20260626-001-feature-name:atom-0135
- pldg-20260626-001-feature-name:atom-0148
- pldg-20260626-001-feature-name:atom-0149
- chat:teacher-feature-initial-framing
- chat:teach-teacher-correction
- Plans/assistant-chat-design.md#6-Teach
- Plans/Personas.md#P-040---Teacher-Core-Persona
- chat:teach-visual-specificity-challenge
- chat:teach-help-glossary-rest-request
- Plans/Glossary.md
- chat:teach-gap-fill-correction
- q-0028
- chat:teach-bundle-accepted-pmconcept-reference
- chat:work-through-teach-gaps
- chat:collaboration-style-correction
- Plans/Personas.md#P-040-teacher-core-persona
source_atom_ids:
- atom-0101
- atom-0110
- atom-0118
- atom-0133
- atom-0135
- atom-0148
- atom-0149
decision_refs:
- dec-0018
- dec-0019
- dec-0020
- dec-0021
- dec-0022
- dec-0023
- dec-0024
correction_refs:
- corr-0002
- corr-0003
preserved_exact_tokens:
- acceptance tests
- default to a low end model
- setting too in the gui
- variety of phrases
- help icon
- new thread
- control the Gui
- PM documentation coverage
- tooltip
- new Teacher thread
- Sources used
- guided overlay
- activity cards
- desktop and mobile
- Teach help entries exist
- related-concept links resolve
- inline/context/full help
- Teacher cites
- missing-help callouts
- source-owner refs
- does not rename canonical terms
- coverage matrix
- one row per Teach entry
- inline help
- context help
- canonical help page
- Teacher citation
- owner source refs
- related concepts
- GUI surface(s)
- missing-state behavior
- no-help-needed
- ok lets work through all those
- all those
- gap map
- filled
- drafted
- open
- decision-needed
- implementation-ready
- help icon launch
- natural-language summon
- disambiguation
- Teach model Settings states
- requested/effective model disclosure
- source disclosure
- missing coverage callout
- mutation confirmation
- memory capture
- Teacher handoff
- responsive/accessibility
- PM knowledge pressure test
- PM concepts
- workflows
- settings
- models
- capabilities
- permissions
- history
- artifacts
- Personas
- skills/plugins
- Orchestrator behavior
- Teach memory
- missing coverage
- avoid guessing
- handoff
negative_constraints:
- Do not call Teach implementation-ready without tests for model default/settings, invocation routing, help-icon
  launch, knowledge substrate behavior, GUI control safety, and activity transparency.
- Do not rely only on Persona existence or Teach memory-capture tests to validate the whole Teach feature.
- Do not mark Teach visually implementation-ready without testing the actual help icon, Teacher thread, source disclosure,
  overlay, activity cards, and model setting states.
- Do not skip responsive/overflow checks for Teacher captions, cards, chips, or settings labels.
- Do not mark Help/Glossary support complete without concrete Teach help-entry coverage tests.
- Do not allow Teacher to cite missing or broken help-entry links as valid sources.
- Do not rely on a freeform list with no coverage matrix.
- Do not mark MVP complete with missing required Teach help rows.
- Do not accept no-help-needed dispositions without owner evidence.
- Do not claim Teach is ready from the Help/Glossary content pack alone.
- Do not treat a gap as closed until its behavior, UI state, source owner, failure mode, and validation are specified
  or explicitly dispositioned.
- Do not mark Teach implementation-ready without exercising the full path across chat, settings, help, guided GUI,
  memory, and handoff.
- Do not skip responsive, overflow, keyboard, or screen-reader checks for the guided overlay and Teacher thread.
- Do not certify Teacher on a small happy-path chat only.
- Do not let Teacher answer capability or settings questions without live/source-backed state.
- Do not treat missing coverage as a passing answer unless it is visibly disclosed and routed.
owner_hints:
- Plans/Automated_Testing_System.md
- Plans/assistant-chat-design.md
- Plans/FinalGUISpec.md
- Plans/UI_Command_Catalog.md
- Plans/Models_System.md
- Plans/Personas.md
- Plans/Tools.md
- Plans/Glossary.md
- Plans/Plan_Document_System.md
- Plans/Prompt_Pipeline.md
- Plans/Media_Generation_and_Capabilities.md
- Plans/Runtime_Artifacts_Panel.md
```

## Ledger Compile Addendum - pldg-20260627-001-feature-intake

This addendum compiles source-lineage obligations from bootstrap ledger `pldg-20260627-001-feature-intake` into Automated Testing owner canon. It does not create WorkNodes, NodeSeeds, executable queues, GoalRuns, implementation files, generated governance artifacts, or production build tasks.

### ATS-015 - Inline Visualizer V2 Acceptance Tests

```yaml
plan_unit_id: ATS-015
unit_type: validation_criterion
status: accepted
owner_doc: Plans/Automated_Testing_System.md
canonical_text: >-
  Inline visualizer v2 acceptance tests cover marker parsing for `visualize(title=...)`, `@@@VIZ-START`, and
  `@@@VIZ-END`; false-positive exclusion for tool_calls, reasoning, code_execution, Markdown code fences, and
  marker-like literal content; progressive render and zero-flicker finalization; serialized script execution;
  CV-300 bridge envelopes, return/error shapes, origin_nonce validation, bridge aliases `copyText`, `toast`,
  `saveState`, and `loadState`; question-flow omission of sendPrompt; Rust + Slint webview adapter mapping; sandbox
  denial for allow-same-origin, parent.document, parent localStorage, CDN, dynamic import, and unvetted network;
  PM visual token/accessibility states; pinned library allowlist behavior; reload/export; no secret leak; and
  localized feedback with audio off by default.
gui_related: true
gui_classification_reason: Validates visible inline visualizer rendering, feedback, accessibility, and degraded states.
depends_on: [ACD-427, CV-300, F3-404, SP-221, PS-123, RAP-037]
unblocks: []
acceptance_criteria:
  - Tests prove visual markers do not route from tool/reasoning/code execution or code-fence content.
  - Tests prove finalization avoids flicker/remount and preserves script-populated containers.
  - Tests prove bridge envelope origin/nonce, method schema, return/error, save/load quota, and native webview adapter mapping behavior.
  - Tests prove sandbox/network/library denials produce visible fallback states without leaks.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - future inline visualizer v2 fixture suite
risk_class: inline_visualizer_validation_gap
reasoning_tier: high
context_scope: inline_visualizer_v2_acceptance
implementation_surfaces:
  - Plans/Automated_Testing_System.md
  - future inline visualizer tests
node_compile_hint:
  mode: inline_visualizer_v2_acceptance_tests
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/state/inline_visualizer_v2_readiness_matrix.json:iv2-automated-tests
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/records/design_atoms.jsonl:atom-0088
source_atom_ids: [atom-0088]
preserved_exact_tokens:
  - "visualize(title=...)"
  - "@@@VIZ-START"
  - "@@@VIZ-END"
  - "tool_calls"
  - "reasoning"
  - "code_execution"
  - "copyText"
  - "toast"
  - "saveState"
  - "loadState"
  - "bridge_call_id"
  - "origin_nonce"
  - "Rust + Slint"
  - "webview"
  - "allow-same-origin"
  - "parent.document"
  - "parent localStorage"
negative_constraints:
  - Do not call inline visualizer v2 implementation-ready without sandbox, stream, bridge, fallback, reload, export, and no-leak tests.
  - Do not treat a happy-path static HTML render as sufficient visualizer coverage.
owner_hints:
  - Plans/Automated_Testing_System.md
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
  - Plans/Permissions_System.md
```

### ATS-016 - Notification Sound Delivery Acceptance Tests

```yaml
plan_unit_id: ATS-016
unit_type: validation_criterion
status: accepted
owner_doc: Plans/Automated_Testing_System.md
canonical_text: >-
  Notification and sound acceptance tests cover Settings > General > Notifications & Sounds rendering, destination
  CRUD/toggle/test, Slack, Discord, generic webhook, ntfy, Pushover, Telegram mocks, payload redaction, missing auth,
  provider error, 408/429/5xx/network retry behavior, malformed/revoked/missing/forbidden permanent failures, rate-limit
  mocks, idempotency, mention-policy denial, provider-specific profile validation, success receipt mocks, no-secret
  logs/receipts/exports, built-in sound catalog source/license/default-mapping checks, custom sound upload validation,
  sound preview local-only, explicit live test-send gating, PeonPing/OpenPeon import compatibility mapping, unknown
  manifest review, unsupported format rejection, and accessibility where sound is not the only carrier.
gui_related: true
gui_classification_reason: Validates visible settings, sound controls, preview/test-send, and notification copy behavior.
depends_on: [ACD-428, CV-298, F3-405, SP-222, PS-124, RAP-039, UCC-103, WM-039]
unblocks: []
acceptance_criteria:
  - Automated delivery tests use mocks by default; live sends require explicit user action and enabled destination.
  - Provider-specific Slack, Discord, generic webhook, ntfy, Pushover, and Telegram profile fields are validated through fixtures.
  - Built-in normal notification sound fixtures prove source/license/version/hash/default mapping metadata is present.
  - Secret material never appears in logs, receipts, screenshots, exports, or GUI previews.
  - Sound upload and imported pack tests enforce format, size, duration, path, decode, license, and compatibility boundaries.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - future notification and sound delivery fixture suite
risk_class: notification_validation_gap
reasoning_tier: high
context_scope: notifications_sounds_acceptance
implementation_surfaces:
  - Plans/Automated_Testing_System.md
  - future notification and sound tests
node_compile_hint:
  mode: notifications_sounds_acceptance_tests
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/state/notifications_sounds_readiness_matrix.json:notify-delivery-validation-no-secret-evidence
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/state/notifications_sounds_readiness_matrix.json:preview-test-send-accessibility
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/records/design_atoms.jsonl:atom-0069
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/records/design_atoms.jsonl:atom-0070
source_atom_ids: [atom-0069, atom-0070]
preserved_exact_tokens:
  - "Slack"
  - "Discord"
  - "generic webhook"
  - "ntfy"
  - "Pushover"
  - "Telegram"
  - "408"
  - "429"
  - "5xx"
  - "PeonPing"
  - "OpenPeon"
  - "test-send"
  - "preview local only"
  - "event_category"
  - "idempotency"
  - "source/license"
negative_constraints:
  - Do not use live external sends in automated tests unless explicitly enabled by user action.
  - Do not allow sound-only notification assertions for critical states.
  - Do not accept secret-bearing logs, receipts, screenshots, or exports as passing evidence.
owner_hints:
  - Plans/Automated_Testing_System.md
  - Plans/FinalGUISpec.md
  - Plans/Contracts_V0.md
  - Plans/Permissions_System.md
  - Plans/Runtime_Artifacts_Panel.md
```

### ATS-017 - Compact Now And Manual Compaction Acceptance Tests

```yaml
plan_unit_id: ATS-017
unit_type: validation_criterion
status: accepted
owner_doc: Plans/Automated_Testing_System.md
canonical_text: >-
  Compaction acceptance tests cover the chat context circle hover display for Usage, Tokens, Cost, and More Details;
  click reveal/selection of Compact Now before dispatch to `cmd.chat.compact_context`; `/compact` parity;
  context.compaction.started, context.compaction.completed, and context.compaction.failed or equivalent visible
  failure/degraded state; command-result statuses for already_running, cancelled, no_op, degraded, unavailable,
  retry_scheduled, completed, and failed; Prompt Pipeline
  compaction_immune handling; storage lineage proving manual Compact Now alone does not create new cache lineage; and
  stale Plans/newfeatures.md references remaining source-lineage only.
gui_related: true
gui_classification_reason: Validates visible chat context circle, Compact Now click, slash command behavior, and failure feedback.
depends_on: [ACD-177, ACD-414, F3-132, UF-011, UCC-060, WM-019, PP-016, PP-017, PP-019, PP-020, PP-025, SP-119]
unblocks: []
acceptance_criteria:
  - Compact Now click in the chat context circle is covered by GUI tests, not assumed from slash command support.
  - Tests prove context-circle click does not dispatch until the user chooses Compact Now.
  - Tests cover already_running, cancelled, no_op, degraded, unavailable, retry_scheduled, completed, and failed result states.
  - Failure/degraded compaction produces a visible user-facing state and event contract.
  - Manual Compact Now does not create a new cache lineage unless logical run lineage changes.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - future Compact Now manual compaction fixture suite
risk_class: compaction_manual_entrypoint_validation_gap
reasoning_tier: high
context_scope: manual_compaction_acceptance
implementation_surfaces:
  - Plans/Automated_Testing_System.md
  - future chat context circle tests
node_compile_hint:
  mode: compact_now_manual_compaction_acceptance_tests
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/state/compaction_compile_readiness_matrix.json:cmp-automated-testing-acceptance
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/state/compaction_compile_readiness_matrix.json:cmp-owner-cleanup-001
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/records/design_atoms.jsonl:atom-0053
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/records/design_atoms.jsonl:atom-0071
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/records/design_atoms.jsonl:atom-0072
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/records/design_atoms.jsonl:atom-0081
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/records/design_atoms.jsonl:atom-0090
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/records/design_atoms.jsonl:atom-0094
source_atom_ids: [atom-0053, atom-0071, atom-0072, atom-0081, atom-0090, atom-0094]
decision_refs: [dec-0015]
preserved_exact_tokens:
  - "Usage"
  - "Tokens"
  - "Cost"
  - "More Details"
  - "Compact Now"
  - "cmd.chat.compact_context"
  - "/compact"
  - "context.compaction.started"
  - "context.compaction.completed"
  - "context.compaction.failed"
  - "already_running"
  - "cancelled"
  - "no_op"
  - "retry_scheduled"
  - "compaction_immune"
  - "Plans/newfeatures.md"
negative_constraints:
  - Do not call compaction implementation-ready without testing the chat context circle Compact Now click.
  - Do not dispatch compaction from hover alone.
  - Do not revive Plans/newfeatures.md as a live owner for compaction.
owner_hints:
  - Plans/Automated_Testing_System.md
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
  - Plans/UI_Command_Catalog.md
```

### ATS-018 - DRY Method Route Toggle Receipt And Visibility Tests

```yaml
plan_unit_id: ATS-018
unit_type: validation_criterion
status: accepted
owner_doc: Plans/Automated_Testing_System.md
canonical_text: >-
  DRY Method acceptance tests cover default enabled behavior, user disabled_by_user toggle behavior, shared Instruction
  Bundle routing for Assistant, Interview, Orchestrator, delegated child-run, document-builder, and code-generation
  prompt routes, absence of shadow prompt-builder-local DRY prose, receipt fields and hashes, missing/stale rules
  visibility, exploratory caveat on unresolved owner/source routes, block/ask/open-item behavior for canonical or
  implementation-changing mutation, Settings command and wiring coverage for
  `cmd.settings.agent_rules.dry_method_default_guard.set`, exact user help copy, stale Orchestrator-local DRY prose
  retargeting, and no bypass of explicit user instructions, safety, secrets, source authority, governance, permissions,
  or source-control hygiene when DRY is off.
gui_related: true
gui_classification_reason: Validates user-visible DRY setting and disclosure states along with receipt and route behavior.
depends_on: [ACD-429, ARC-036, PP-057, DR-036, DP-063, CV-299, F3-406, SP-223, RAP-038, UCC-104, WM-040, OSI-430, ISI-019]
unblocks: []
acceptance_criteria:
  - DRY is default-on and user-disableable without weakening non-DRY authority boundaries.
  - The Settings command and wiring fixture proves the toggle writes only enabled or disabled_by_user and displays the exact explanatory copy.
  - All prompt routes consume one shared Instruction Bundle route.
  - Missing/stale/unresolved owner-source states are visible and policy-correct.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - future DRY Method route/static/integration test suite
risk_class: dry_method_validation_gap
reasoning_tier: high
context_scope: dry_method_acceptance
implementation_surfaces:
  - Plans/Automated_Testing_System.md
  - future DRY Method tests
node_compile_hint:
  mode: dry_method_route_toggle_receipt_visibility_tests
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/state/dry_method_compile_readiness_matrix.json:dry-app-default
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/state/dry_method_compile_readiness_matrix.json:dry-prompt-route-static-conformance
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/state/dry_method_compile_readiness_matrix.json:dry-fallback-disabled-boundary
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/state/dry_method_compile_readiness_matrix.json:dry-stale-owner-retarget
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/state/dry_method_defaults_matrix.json:dry-val-001
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/state/dry_method_defaults_matrix.json:dry-val-006
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/records/design_atoms.jsonl:atom-0054
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/records/design_atoms.jsonl:atom-0073
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/records/design_atoms.jsonl:atom-0074
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/records/design_atoms.jsonl:atom-0075
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/records/design_atoms.jsonl:atom-0076
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/records/design_atoms.jsonl:atom-0077
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/records/design_atoms.jsonl:atom-0083
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/records/design_atoms.jsonl:atom-0089
source_atom_ids: [atom-0054, atom-0073, atom-0074, atom-0075, atom-0076, atom-0077, atom-0083, atom-0089]
decision_refs: [dec-0016, dec-0017]
preserved_exact_tokens:
  - "enabled"
  - "disabled_by_user"
  - "Instruction Bundle"
  - "Assistant"
  - "Interview"
  - "Orchestrator"
  - "delegated child-run"
  - "document-builder"
  - "code-generation"
  - "shadow instruction sources"
  - "dry_method_effective_state"
  - "exploratory caveat"
  - "mutation blocked"
  - "cmd.settings.agent_rules.dry_method_default_guard.set"
  - "DRY Method is on by default. Turning it off disables only PM's default reuse-first guard; project/user instructions, safety, secrets, source authority, governance, permissions, and source-control rules still apply."
negative_constraints:
  - Do not make DRY opt-in by default.
  - Do not duplicate DRY prose into prompt builders.
  - Do not treat disabled DRY as permission to bypass explicit instructions, safety, secrets, source authority, governance, permissions, or source-control hygiene.
owner_hints:
  - Plans/Automated_Testing_System.md
  - Plans/agent-rules-context.md
  - Plans/Prompt_Pipeline.md
  - Plans/DRY_Rules.md
```
