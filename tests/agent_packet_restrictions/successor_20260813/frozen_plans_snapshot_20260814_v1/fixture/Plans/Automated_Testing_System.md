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

## GUI visible testing repair addendum (2026-07-02)

This addendum closes the visible testing UX defects from the PMConcept readiness report. It does not create WorkNodes, NodeSeeds, executable queues, implementation files, runtime dispatch, generated governance artifacts, or a governance seal.

Testing capability policy is implementation-ready only when the GUI exposes concrete controls and receipts, not merely policy prose. The production GUI must provide global and per-project rows for each capability family with inherited/effective state, `Auto`, `On`, `Off`, unavailable, blocked-needs-authority, and prohibited-by-policy projections. `Auto` may discover/select/install within authority; `On` blocks or asks for authority when unavailable; `Off` prohibits use and installation and never counts as successful verification.

The required command rows are `cmd.testing.capability_policy.set`, `cmd.testing.visibility_policy.set`, `cmd.testing.session.open`, `cmd.testing.session.watch`, `cmd.testing.session.background`, and `cmd.testing.session.redaction.inspect`. Each command must produce receipt evidence linked to the effective policy snapshot, visible-session identity, artifact/evidence refs, redaction profile, currentness/revalidation result, and fallback route when a visual surface cannot be embedded.

Visible testing projections must include `show_when_possible`, visible active, collapsed, detached, backgrounded, and non-embeddable states. Web evidence must show browser navigation, clicks, form input, assertions, screenshots, console, network, and pass/fail progression where supported. Native evidence must show Swift/live preview, hot reload, simulator, emulator, physical device stream, application window, interaction trace, screenshots, and logs where available and permitted.

Browser and GUI automation manifests must carry `browser_session_id`, PM-native browser runtime state, visibility state, Open/Watch state, `runtime_unavailable` remediation actions, PageRepresentation refs, screenshot/PDF/console/network artifact refs, and redaction manifest refs. `BrowserRuntimeService`, Browser Program, and Expert Browser Program are the only PM-owned browser automation/runtime identities. Negative fixtures cover no-browser/runtime-unavailable, hidden prompt-injection chips, redaction failure, no-network denial, SSRF/private-host denial, robots/fanout/depth denial, cache hit/miss/TTL, and partial crawl/research/source citation outcomes.
`python3 scripts/pm-plans-verify.py validate-web-capability-contracts` enforces the web capability contract surface: discriminated web/browser/research schema definitions, evidence branches, runtime/browser artifact payload fields, `/web fetch` parity, invocation provenance, prompt capability injection, plan-mode web visibility, retired `cmd.web.*` production exclusion, browser-unavailable coverage, security/cache/robots/citation tokens, and the Site Reader naming boundary.

Screenshots, videos, logs, console output, network traces, and artifact previews apply secret and sensitive-data redaction before display or persistence. Redaction failures block display/persistence until resolved or explicitly authorized by the owning policy; they do not silently downgrade evidence quality.

Acceptance coverage must prove effective-policy receipts, visible-session receipts, TestRunReceipt linkage, Open/Watch fallback behavior, background continuation, disabled reason projection, and redaction-before-display/persistence. PMConcept browser/terminal/testing demos are `concept_fixture_only` until those receipts and wiring rows exist.

## GUI web development and smoke-test workflow addendum (2026-07-07)

The Slint/WASM web GUI development workflow uses a trusted local daemon plus a static web route, fixture mode, browser automation smoke tests, screenshots/state capture, deterministic state hooks, and fast rebuild/reload loops. The test harness must prove daemon capability probes, pairing/origin/CSRF protections, degraded reasons when the daemon is absent or narrowed, screenshot and state-capture evidence, and reload behavior for the static web route. Production builds must not enable dev/test, MCP, live-preview, fixture, or browser automation controls unless explicit configuration enables the capability and records permission/audit receipts.

### ATS-023 - Slint WASM Web GUI Dev Preview And Smoke Tests

```yaml
plan_unit_id: ATS-023
unit_type: requirement
status: accepted
owner_doc: Plans/Automated_Testing_System.md
canonical_text: >-
  Slint/WASM web GUI development uses a trusted local daemon plus static web route, fixture mode, browser automation
  smoke test, screenshots/state-capture, deterministic state hooks, and fast rebuild/reload. Production builds must not
  enable dev/test, MCP, live-preview, fixture, or browser automation features unless explicit configuration enables the
  capability and records permission/audit receipts.
gui_related: true
gui_classification_reason: This unit defines user-visible web GUI development preview controls, screenshots, and smoke-test evidence.
depends_on:
- ATS-001
- ATS-003
- ATS-004
unblocks:
- F3-417
acceptance_criteria:
- The local daemon plus static web route workflow has fixture mode, browser automation smoke test, screenshots/state-capture, state hooks, and fast reload coverage.
- Smoke tests prove authenticated local origin or pairing, origin/CSRF protection, capability probe, degraded reason, and permission/audit receipt projection.
- Production builds keep dev/test, MCP, live-preview, fixture, and browser automation controls disabled unless explicit configuration enables the capability.
- No WorkNodes, NodeSeeds, executable queues, implementation files, runtime launches, or production build tasks are created by this spec.
validation_surfaces:
- python3 scripts/pm-gui-asset-policy.py
- python3 scripts/pm-plans-verify.py validate-gui-asset-policy
- python3 scripts/pm-plans-verify.py validate-implementation-readiness
- python3 scripts/pm-plans-verify.py run-gates
risk_class: web_gui_dev_test_authority_leak
reasoning_tier: high
context_scope: gui_platform_currentness_repair
implementation_surfaces:
- Plans/Automated_Testing_System.md
- Plans/FinalGUISpec.md
- Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: web_gui_dev_preview_smoke_tests
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/.audits/fable-20260706/currentness_check_report.json
- Plans/.audits/fable-20260706/buildability_repair_registry.jsonl:8
preserved_exact_tokens:
- "trusted local daemon"
- "static web route"
- "fixture mode"
- "browser automation smoke test"
- "screenshots/state-capture"
- "state hooks"
- "fast rebuild/reload"
negative_constraints:
- "Production builds must not enable dev/test/MCP/live-preview features unless explicitly configured."
- "Browser-only WASM must not claim direct OS authority."
owner_hints:
- Plans/Automated_Testing_System.md
- Plans/FinalGUISpec.md
- Plans/UI_Command_Catalog.md
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
  WorkNode completion cannot require human eyeballing. Tests, smoke checks, app launch, browser sessions, GUI/device sessions, screenshots, logs, and evidence capture run automatically where required. If Puppet Master cannot automatically verify a WorkNode after the compiler/runtime boundary is explicitly enabled, it must record a test capability blocker or deferred non-executable test-harness WorkNode request candidate rather than silently passing. For web projects, once the native product is built, Browser Program over the PM-native BrowserRuntimeService is the primary native web test automation path. A user Project's independent external browser-test suite may run only as an ordinary Project process and contribute generic Test Capture/artifact references; it never becomes a PM browser runtime, API, command, MCP route, port, facade, compatibility layer, package, or capture engine.
  Automated completion means 100% automated verification with no human intervention for required ordinary browser/GUI/device sessions, and manual_only_acceptance_not_allowed blocks manual-only completion claims. Protected AuthBrowserSession is intentionally outside automation: policy-boundary tests may prove that automation is denied, but neither a human authentication interaction nor absence of capture can be represented as an automated content oracle. TestRunReceipt records include receipt_id, test_strategy_ref, test_case_refs, generated_test_ids, reused_test_ids, verification_command, expected_artifacts, evidence_refs, visual_evidence_refs, flake_policy, and test_gap_policy.
gui_related: true
gui_classification_reason: Automated screenshots, browser sessions, GUI/device sessions, and visual evidence are user-visible verification surfaces.
depends_on: [ATS-001, ATS-002, ATS-003]
unblocks: [GRS-030, EP-101, RAP-029, T-159]
acceptance_criteria:
  - Human visual inspection is never a required completion criterion.
  - Missing automatic verification records a blocker or, after runtime enablement, a deferred non-executable test-harness WorkNode request candidate.
  - Browser/GUI/device screenshots and logs are captured automatically where required.
  - Native web testing uses Browser Program over BrowserRuntimeService; an independent user-Project browser suite remains an ordinary external process with generic artifacts.
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
  - "Browser Program"
  - "BrowserRuntimeService"
  - "generic external Project process"
negative_constraints:
  - Do not make manual visual inspection a required completion step.
  - Do not silently allow unverifiable WorkNodes.
  - Do not create or accept a PM browser runtime, facade, compatibility vocabulary, package, port, MCP route, command namespace, or capture engine derived from an external Project test framework.
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
- A user Project may run its independently declared external browser-test suite as a generic Project process and expose generic artifacts, but that suite is never a Puppet Master browser dependency or API surface.
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
  - python3 scripts/pm-plan-index.py validate
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

## Ledger Compile Addendum - pldg-20260630-001-feature-intake

This addendum compiles containerized-host testing adapter and receipt requirements. It does not create WorkNodes, NodeSeeds, executable queues, implementation files, runtime dispatch, generated governance artifacts, or production build tasks.

### ATS-019 - Containerized Host Adapter And TestRunReceipt Proof

```yaml
plan_unit_id: ATS-019
unit_type: requirement
status: accepted
owner_doc: Plans/Automated_Testing_System.md
canonical_text: >-
  Automated Testing consumes containerized hosts through Test Capability Discovery, Test Harness Probe, TestStrategy
  required_capability_refs, host_capability_ref, host_profile_id or host requirement shape, host preflight, host
  assignment, host instance launch, port/access URL refs, artifact/log expectations, evidence refs, visual evidence
  refs, cleanup/retention disposition, and blocker payloads. Compose scenarios are the primary ATS path for web app
  preview, dependency stack bring-up, and full E2E, with a broader containerized test host adapter family underneath
  for non-Compose and runtime-specific hosts. TestRunReceipt proves containerized execution with host_capability_ref,
  host_profile_id, host_instance_ref or host_instance_id, host_assignment_ref or host_assignment_id, runtime_family,
  runtime_context_ref, optional compose_scenario_ref, image/build refs, port/access URL refs, preflight receipt ref,
  launch receipt ref, harness probe receipt ref, cleanup receipt ref, retain-on-failure state, evidence refs, visual
  evidence refs, and blocker payload.
gui_related: false
gui_classification_reason: Test adapter and receipt proof fields are ATS/runtime contracts, not GUI visual presentation.
depends_on: [ATS-002, ATS-003, ATS-010, CV-303, CRAU-091, SP-226]
unblocks: [EP-109, RAP-042, F3-410]
acceptance_criteria:
  - Test Capability Discovery can detect containerized-host needs and candidate host families.
  - Test Harness Probe proves selected host profile/scenario launchability before test success can be claimed.
  - TestStrategy binds required_capability_refs plus host_profile_id or host requirement shape.
  - TestRunReceipt cannot certify success without host assignment, preflight, launch/execution, evidence, cleanup/retention, or explicit blocker refs.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - future containerized-host TestRunReceipt schema fixtures
  - future Compose-primary and non-Compose blocked adapter tests
risk_class: containerized_host_test_proof_gap
reasoning_tier: high
context_scope: automated_testing_containerized_hosts
implementation_surfaces:
  - Plans/Automated_Testing_System.md
  - future Test Capability Discovery
  - future TestRunReceipt schemas
node_compile_hint:
  mode: containerized_host_ats_adapter_receipt_proof
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0008
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0014
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0049
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0062
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0071
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0078
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/source_shards/implementation_readiness_hardening_20260701.json#ats_adapter_contract
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/source_shards/subagent_hardening_synthesis_20260701.json#ref-002-testrunreceipt-host-fields
source_atom_ids: [atom-0008, atom-0014, atom-0049, atom-0062, atom-0071, atom-0078]
decision_refs: [dec-0014, dec-0015]
preserved_exact_tokens:
  - "Test Capability Discovery"
  - "Test Harness Probe"
  - "TestStrategy"
  - "required_capability_refs"
  - "host_capability_ref"
  - "host_profile_id"
  - "host_preflight_receipt"
  - "host_assignment_id"
  - "host_instance_id"
  - "TestRunReceipt"
  - "Compose primary"
  - "broader containerized test host adapter family underneath"
  - "web app preview"
  - "dependency stack bring-up"
  - "full E2E environment"
  - "visual evidence refs"
  - "blocker payload"
negative_constraints:
  - Do not make Compose the only possible ATS path.
  - Do not treat a running container as test completion or success without ATS evidence and receipts.
  - Do not require human eyeballing for host/test completion.
  - Do not bind ATS truth to backend container ids.
owner_hints:
  - Plans/Automated_Testing_System.md
  - Plans/Containers_Registry_and_Unraid.md
  - Plans/Runtime_Artifacts_Panel.md
  - Plans/Executor_Protocol.md
  - Plans/Contracts_V0.md
  - Plans/storage-plan.md
```

## Ledger Compile Addendum - pldg-20260701-001-feature-intake

This addendum compiles first-run onboarding, Doctor/Health, Teacher handoff, and Planning Wizard landing acceptance coverage from bootstrap ledger `pldg-20260701-001-feature-intake`. It does not create WorkNodes, NodeSeeds, executable queues, implementation files, runtime dispatch, generated governance artifacts, or a governance seal.

### ATS-020 - First-Run Onboarding Doctor And Planning Wizard Acceptance Tests

```yaml
plan_unit_id: ATS-020
unit_type: validation_criterion
status: accepted
owner_doc: Plans/Automated_Testing_System.md
canonical_text: >-
  Automated acceptance coverage for the Doctor/onboarding rework includes the first-run four-screen sequence, accepted
  copy, skippable setup behavior, paid-provider-before-Free-Models sequencing, compact provider rows, Teacher handoff,
  structured `onboarding_setup_state`, Planning Wizard limited-state landing, and Doctor/Health no-false-green behavior.
  Tests cover setup completion, setup skip, provider setup failure, auth/logged-in-but-not-ready state, Free Models review
  and defer paths, Teacher copy with no provider route, and Health `Set up provider` return routing. Regression coverage
  also proves MCP/server degraded or unavailable rows remain visible in GUI/Doctor surfaces rather than being silently
  hidden after transient failure, and FileSafe initialization/readiness follows fail-closed owner canon rather than stale
  graceful-degradation wording.
gui_related: true
gui_classification_reason: Validates user-visible first-run screens, copy, row states, Teacher copy, Health states, and Planning Wizard landing presentation.
depends_on: [F3-411, MS-122, MA-066, ACD-431, UCC-106, CV-305, PWIZ-017, WM-041, T-088, T-089, MI-028, MI-029, F2-155]
unblocks: []
acceptance_criteria:
  - Tests verify the accepted screen order and exact first-run copy/action labels.
  - Tests verify `Skip for now` opens Planning Wizard in limited setup state and does not mark Health/Doctor Ready.
  - Tests verify the exact `Fee models` token and Free Models appear only after the paid-provider prompt and do not use recommendation/coding-strength language.
  - Tests verify `Connected` does not collapse logged-in/auth success into Ready without owner readiness proof.
  - Tests verify the Teacher handoff copy is visible and degraded provider state is named when no usable provider route exists.
  - Tests verify onboarding_setup_state contains the accepted minimum fields and excludes raw transcripts, credentials, secrets, and raw diagnostics.
  - Tests verify MCP/server unavailable rows and FileSafe fail-closed readiness remain visible Health/Doctor concerns when relevant.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - future first-run onboarding GUI acceptance fixture suite
  - future Doctor/Health no-false-green fixture suite
  - future onboarding_setup_state contract fixture
risk_class: first_run_acceptance_gap
reasoning_tier: high
context_scope: first_run_onboarding_doctor_acceptance
implementation_surfaces:
  - Plans/Automated_Testing_System.md
  - future onboarding/Health/Planning Wizard acceptance tests
node_compile_hint:
  mode: first_run_onboarding_acceptance_tests
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/ledgers/v2/pldg-20260701-001-feature-intake/records/design_atoms.jsonl:atom-0007
  - Plans/ledgers/v2/pldg-20260701-001-feature-intake/records/design_atoms.jsonl:atom-0008
  - Plans/ledgers/v2/pldg-20260701-001-feature-intake/records/design_atoms.jsonl:atom-0015
  - Plans/ledgers/v2/pldg-20260701-001-feature-intake/records/design_atoms.jsonl:atom-0016
  - Plans/ledgers/v2/pldg-20260701-001-feature-intake/records/design_atoms.jsonl:atom-0037
  - Plans/ledgers/v2/pldg-20260701-001-feature-intake/records/design_atoms.jsonl:atom-0038
  - Plans/ledgers/v2/pldg-20260701-001-feature-intake/records/design_atoms.jsonl:atom-0040
  - Plans/ledgers/v2/pldg-20260701-001-feature-intake/records/design_atoms.jsonl:atom-0041
  - Plans/ledgers/v2/pldg-20260701-001-feature-intake/records/design_atoms.jsonl:atom-0042
  - Plans/ledgers/v2/pldg-20260701-001-feature-intake/records/design_atoms.jsonl:atom-0043
  - Plans/ledgers/v2/pldg-20260701-001-feature-intake/records/design_atoms.jsonl:atom-0044
  - Plans/ledgers/v2/pldg-20260701-001-feature-intake/records/design_atoms.jsonl:atom-0045
  - Plans/ledgers/v2/pldg-20260701-001-feature-intake/records/design_atoms.jsonl:atom-0046
  - Plans/ledgers/v2/pldg-20260701-001-feature-intake/records/design_atoms.jsonl:atom-0047
  - Plans/ledgers/v2/pldg-20260701-001-feature-intake/source_shards/doctor_onboarding_plan_review_20260701.json
  - Plans/ledgers/v2/pldg-20260701-001-feature-intake/source_shards/assistant_provider_wizard_proposal_20260701.json
  - Plans/ledgers/v2/pldg-20260701-001-feature-intake/source_shards/user_accepts_provider_wizard_proposal_20260701.json
  - Plans/ledgers/v2/pldg-20260701-001-feature-intake/source_shards/onboarding_doctor_user_decisions_20260701.json
source_atom_ids: [atom-0007, atom-0008, atom-0015, atom-0016, atom-0037, atom-0038, atom-0040, atom-0041, atom-0042, atom-0043, atom-0044, atom-0045, atom-0046, atom-0047]
decision_refs: [dec-0003, dec-0004, dec-0005, dec-0006, dec-0007, dec-0008]
preserved_exact_tokens:
  - "Connect Puppet Master to an AI provider"
  - "Set up a paid provider"
  - "Optional: Free Models"
  - "Fee models"
  - "You are ready to plan"
  - "Skip for now"
  - "Provider setup is not finished"
  - "Need help later? Ask Assistant Chat for Teacher. Try: 'What does this mean?' or 'Show me how to use this page.' Teacher explains the current screen from chat."
  - "onboarding_setup_state"
  - "Connected"
  - "Needs sign-in"
  - "Could not connect"
  - "Ready"
  - "Needs setup"
  - "Needs attention"
  - "hide if server fails"
  - "fail-closed"
negative_constraints:
  - Do not call this feature acceptance-covered without screen order, skip state, Teacher copy, Free Models sequencing, and Doctor no-false-green tests.
  - Do not hide critical blockers just to make onboarding look simpler.
  - Do not treat `Connected` or `Logged in` as equivalent to Ready.
  - Do not silently hide MCP/server degraded or unavailable rows from GUI/Doctor surfaces.
  - Do not allow stale FileSafe graceful-degradation wording to permit disabled guards as Ready.
owner_hints:
  - Plans/Automated_Testing_System.md
  - Plans/FinalGUISpec.md
  - Plans/Planning_Wizard.md
  - Plans/assistant-chat-design.md
  - Plans/Contracts_V0.md
```

## Ledger Compile Addendum - pldg-20260703-001-feature-intake

This addendum compiles source-lineage obligations from bootstrap ledger `pldg-20260703-001-feature-intake` into this owner doc. The ledger remains source/planning memory; these PlanUnits are the live canonical evidence. This compile does not create WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or a governance seal.

### ATS-021 - P2-TRANSPORT-SOAK-TESTS

```yaml
plan_unit_id: ATS-021
unit_type: requirement
status: accepted
owner_doc: Plans/Automated_Testing_System.md
canonical_text: >-
  P2-TRANSPORT-SOAK-TESTS (P2) is compiled as canonical Puppet Master intent for Add WS/SSE/terminal/browser/device transport soak tests: Sleep/wake, reconnect, first-event timeout, large terminal output, high-frequency browser snapshots, and WebSocket fallback are covered.
gui_related: true
gui_classification_reason: User-visible GUI, built-in terminal, accessibility, visual, multimodal, or desktop surface is directly implicated.
depends_on:
- PDS-003
- PNC-001
unblocks: []
acceptance_criteria:
- Sleep/wake, reconnect, first-event timeout, large terminal output, high-frequency browser snapshots, and WebSocket fallback are covered.
- No WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or governance seal outputs are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260703-001-feature-intake
- Sleep/wake, reconnect, first-event timeout, large terminal output, high-frequency browser snapshots, and WebSocket fallback are covered.
risk_class: p2_terminal_runtime_coverage
reasoning_tier: standard
context_scope: terminal_runtime
implementation_surfaces:
- Plans/Automated_Testing_System.md
node_compile_hint:
  mode: p2_transport_soak_tests
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260703-001-feature-intake:atom-0057
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/records/design_atoms.jsonl:atom-0057
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0053/P2-TRANSPORT-SOAK-TESTS@line=53
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0053/P2-TRANSPORT-SOAK-TESTS
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/01_FULL_SOURCE_PACKET.md
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/04_EVIDENCE_REGISTRY.json
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/raw_source_artifacts/pm_context_cache_websocket_backlog_2026-07-03.jsonl:17
source_atom_ids:
- atom-0057
external_atom_id: extrepo-20260703-0053
source_row_id: P2-TRANSPORT-SOAK-TESTS
priority: P2
finding_family: Add WS/SSE/terminal/browser/device transport soak tests
target_docs:
- Plans/Automated_Testing_System.md
owner_hints:
- Plans/Automated_Testing_System.md
preserved_exact_tokens:
- extrepo-20260703-0053
- P2-TRANSPORT-SOAK-TESTS
- P2
- Add WS/SSE/terminal/browser/device transport soak tests
negative_constraints: []
proposal_or_recommendation: Sleep/wake, reconnect, first-event timeout, large terminal output, high-frequency browser snapshots, and WebSocket fallback are covered.
compile_disposition: create_new_planunit
```

### ATS-022 - P1-TERMINAL-FUZZ-TRIPWIRE-CORPUS

```yaml
plan_unit_id: ATS-022
unit_type: requirement
status: accepted
owner_doc: Plans/Automated_Testing_System.md
canonical_text: >-
  P1-TERMINAL-FUZZ-TRIPWIRE-CORPUS (P1) is compiled as canonical Puppet Master intent for Terminal parser/rendering fuzzing, replay corpora, error injection, and giant-output recordings: Imported external-repo finding extrepo-20260703-0082 / P1-TERMINAL-FUZZ-TRIPWIRE-CORPUS (P1). The preserved PM gap/delta is: Terminal Protocol Matrix covers cases to support, but needs a permanent terminal replay/fuzz/error-injection corpus and receipts. The observed external-repo signal remains source-lineage evidence: Ghostty 1.3.0 reports AFL++ fuzzing of the terminal escape parser/VT stream processor, terminal recordings over 4GB, renderer lock improvements, and Tripwire error-injection testing. | tmux issue surface still shows TUI rendering/layout/crash regressions in panes.
gui_related: true
gui_classification_reason: User-visible GUI, built-in terminal, accessibility, visual, multimodal, or desktop surface is directly implicated.
depends_on:
- PDS-003
- PNC-001
unblocks: []
acceptance_criteria:
- PM stores minimized terminal replay fixtures for parser bugs, shell markers, giant outputs, unicode/graphemes, bracketed paste, OSC, tmux/zellij/ssh panes, and CLI agents.
- Terminal parser has fuzz tests, chunk-splitting tests, and replay snapshots that compare parse tree, accessible mirror, scrollback, and painted viewport.
- Renderer/scrollback locks are budgeted; oversized recordings degrade with receipts instead of freezing UI.
- No WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or governance seal outputs are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260703-001-feature-intake
- PM stores minimized terminal replay fixtures for parser bugs, shell markers, giant outputs, unicode/graphemes, bracketed paste, OSC, tmux/zellij/ssh panes, and CLI agents.
- Terminal parser has fuzz tests, chunk-splitting tests, and replay snapshots that compare parse tree, accessible mirror, scrollback, and painted viewport.
- Renderer/scrollback locks are budgeted; oversized recordings degrade with receipts instead of freezing UI.
risk_class: p1_terminal_runtime_hardening
reasoning_tier: standard
context_scope: terminal_runtime
implementation_surfaces:
- Plans/Automated_Testing_System.md
node_compile_hint:
  mode: p1_terminal_fuzz_tripwire_corpus
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260703-001-feature-intake:atom-0086
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/records/design_atoms.jsonl:atom-0086
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0082/P1-TERMINAL-FUZZ-TRIPWIRE-CORPUS@line=82
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0082/P1-TERMINAL-FUZZ-TRIPWIRE-CORPUS
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/01_FULL_SOURCE_PACKET.md
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/04_EVIDENCE_REGISTRY.json
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/raw_source_artifacts/pm_final_external_repo_closure_backlog_2026-07-03.jsonl:9
source_atom_ids:
- atom-0086
external_atom_id: extrepo-20260703-0082
source_row_id: P1-TERMINAL-FUZZ-TRIPWIRE-CORPUS
priority: P1
finding_family: Terminal parser/rendering fuzzing, replay corpora, error injection, and giant-output recordings
target_docs:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Automated_Testing_System.md
- Runtime_Artifacts_Panel.md
- Contracts_V0.md
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Automated_Testing_System.md
- Runtime_Artifacts_Panel.md
- Contracts_V0.md
preserved_exact_tokens:
- extrepo-20260703-0082
- P1-TERMINAL-FUZZ-TRIPWIRE-CORPUS
- P1
- Terminal parser/rendering fuzzing, replay corpora, error injection, and giant-output recordings
negative_constraints: []
observed_signal: Ghostty 1.3.0 reports AFL++ fuzzing of the terminal escape parser/VT stream processor, terminal recordings over 4GB, renderer lock improvements, and Tripwire error-injection testing. | tmux issue surface still shows TUI rendering/layout/crash regressions in panes.
pm_gap_or_delta: Terminal Protocol Matrix covers cases to support, but needs a permanent terminal replay/fuzz/error-injection corpus and receipts.
relationship_to_prior_reports: Adds test strategy to prior terminal requirements.
compile_disposition: create_new_planunit
```

## Case L Durable-State Acceptance Fixture Contract - 2026-07-17

Status: `accepted` specification only. No fixture in this section is claimed executed merely because it is named, parsed, or linked.

This section is the Automated Testing System consumer for the approved Case L durable-state owner contracts. It owns fixture orchestration, fault-injection coverage, deterministic oracle evaluation, and linked `TestRunReceipt` evidence. It does not own storage algorithms, EventRecord envelopes, restore outcomes, FileSafe equality, SCM baseline effects, migration receipts, retention policy values, or release admission. Those remain with `Plans/storage-plan.md`, `Plans/Contracts_V0.md`, `Plans/event_record.schema.json`, `Plans/FileSafe.md`, `Plans/WorktreeGitImprovement.md`, `Plans/Executor_Protocol.md`, `Plans/storage_value_registry.json`, and `Plans/Release_Supply_Chain.md`.

Each Case L fixture manifest and linked receipt records the exact fixture ID, owner-contract refs/revisions, app/store/EventRecord/registry versions, setup and fault boundary, expected closed outcome, required negative assertions, before/after semantic and byte digests where applicable, observed outcome, evidence/log/artifact refs, adapter/platform, and freshness. An unavailable adapter or absent fixture is `blocked`, not pass. `skipped` or `inconclusive` cannot satisfy a required oracle. Re-running the same bytes/state must produce the same owner-defined result where determinism is required.

### Migration, compatibility, canonical-redb recovery, and store backup/restore

| Fixture | Required oracle |
| --- | --- |
| `FX-L001-REDB-AHEAD` | One-ahead redb enters `blocked_newer_store`; no writer/projector/migration starts; target bytes are identical before/after. |
| `FX-L001-SEGLOG-AHEAD` | One-ahead seglog header/generation has the same blocked/no-mutation result. |
| `FX-L001-EVENT-AHEAD` | A future EventRecord halts before the record with unavailable projection health and pinned last-supported sequence; no skip, quarantine, append, or rewrite. |
| `FX-L001-DOWNGRADE-WRITES` | Only a compatible whole-boundary backup is offered; post-backup writes produce exact `post_backup_writes_will_be_lost` disclosure before restore. |
| `FX-L002-CRASH-AFTER-BACKUP` | Restart reconciles the durable journal and never ordinary-opens mixed state. |
| `FX-L002-CRASH-MID-STEP` | Kill at every step boundary resumes/restores idempotently and produces exactly one terminal migration receipt. |
| `FX-L002-CRASH-BEFORE-STAMP` | Pre-stamp mixed versions exist only under the active journal and restore before ordinary open after interruption. |
| `FX-L002-CRASH-AFTER-STAMP` | Restart re-verifies then commits or restores without blindly replaying committed steps. |
| `FX-L002-VERIFY-CORRUPT` | Corrupt migrated output fails full verification, protects the pre-migration backup, and permits only one automatic restore attempt. |
| `FX-L002-RECEIPT-ROUNDTRIP` | Exactly one terminal `pm.storage_value.migration_receipt.v1` identity exists and reads back every RSC-008 field, including both `store_transitions[]` and `family_transitions[]`; `rollback_result` is present on every receipt and may be null, while `verification_result` and `terminal_status` match the expected terminal state. |
| `FX-L003-CORRUPT-META` | Continuity evidence plus missing meta is never first run and never reinitializes the store. |
| `FX-L003-CORRUPT-FAMILY` | Each canonical non-rebuildable family routes to verified backup and exact loss disclosure. For `executor_intake_report` and `attempt_receipt`, exact canonical records and a durable verified Storage recovery boundary are required before ordinary Executor revalidation may admit completion or dispatch; EventRecords, runtime/audit projections, UI state, summaries, and worker/controller claims cannot reconstruct success, and unavailable or corrupt authority remains blocked or unknown. |
| `FX-L003-FRESH-BASELINE` | Verified baseline exists before first mutation-capable startup; baseline failure blocks mutation. |
| `FX-L016-ACTIVE-WRITE` | Quiesced active-load backup restores one manifest boundary with exact hashes, consistent redb/seglog/checkpoints, and rebuilt disposable projections. |
| `FX-L016-NEWER-BACKUP` | Newer-version backup is refused before mutation and current bytes remain unchanged. |
| `FX-L016-KILL-RESTORE` | Kill at every store-promotion boundary; restart converges to the fully original or fully restored verified store set, never a mixed ordinary-open state. |
| `FX-L025-PREV-MAJOR-ALIAS` | N-1 alias copy-forwards once, proves semantic equality, removes the live residual only after verification, and is idempotent on rerun. |
| `FX-L025-TOO-OLD` | N-2 without an explicit edge blocks without best-effort mutation. |
| `FX-L032-NOSPACE` | One byte below required space records exact values/reason and performs no backup or mutation; before/after target hashes match. |
| `FX-L032-PROGRESS-INTERRUPT` | Journal phases/step counts are monotonic; cancellation closes after preflight; the exact interruption copy is `Keep Puppet Master open. If interrupted, recovery will resume on the next launch.`; force-cancel/try-anyway remain absent; restart displays/resumes the journal-derived recovery phase. |
| `MIGRATION-COMMAND-INVENTORY-001` | Startup exposes read-only metadata diagnostics, state-valid retry/update/compatible-backup/quit actions, and offline journaled restore only; generic live verify/repair/salvage, Doctor mutation, store editing, bypass tokens, or retry actions that mutate bytes are absent. |

### Seglog durability and restart convergence

The exact fixture inventory is `SEG-FX-001`, `SEG-FX-002`, `SEG-FX-003`, `SEG-FX-004`, `SEG-FX-005`, `SEG-FX-006`, `SEG-FX-007`, `SEG-FX-008`, `SEG-FX-009`, `SEG-FX-010`, `SEG-FX-011`, `SEG-FX-012`, `SEG-FX-013`, `SEG-FX-014`, `SEG-FX-015`, `SEG-FX-016`, `SEG-FX-017`, and `SEG-FX-018`. The exact global-oracle inventory is `SEG-OR-001`, `SEG-OR-002`, `SEG-OR-003`, `SEG-OR-004`, `SEG-OR-005`, `SEG-OR-006`, `SEG-OR-007`, `SEG-OR-008`, `SEG-OR-009`, `SEG-OR-010`, `SEG-OR-011`, and `SEG-OR-012`. They are required without renaming or weakening. The suite covers payload/framing/header bit flips; active and closed segments; valid/unprovable resynchronization; acknowledged watermark loss; frame/segment/manifest/directory barrier faults; mutation-gating safe-point/checkpoint/approval power cuts; sequence-lease crash boundaries; checkpoint/survivor reconciliation; rotation/truncation/compaction/janitor restart cuts; disclosure precision; and stale checklist/pointer rejection.

The global result must prove deterministic survivors and recovery IDs, no success before both append barriers plus directory durability, no mutation without a surviving synced prerequisite receipt, no sequence reuse, exactly one manifest-selected active generation after recovery, unchanged closed-source hashes, sequence/event rather than timestamp checkpoint truth, degraded projection health when canon has a hole, idempotent recovery events, exact/bounded/unknown disclosure fidelity, and live pointer/checklist fidelity.

### Storage I/O, aggregate lock/viewer, root continuity, and fallback

| Fixture | Required oracle |
| --- | --- |
| `STIO-001-CLOSED-CLASS` | Inject every closed storage-I/O class at seglog, redb, checkpoint, safe-point, rotation, migration/backup, JSONL, and Tantivy writes; observe the exact class, retry count, and final access mode. |
| `STIO-002-SAFEPOINT-ENOSPC` | ENOSPC during the pre-attempt safe point causes no project mutation, external side effect, or attempt dispatch. |
| `STIO-003-CHECKPOINT-ENOSPC` | ENOSPC after projection/before checkpoint keeps the old checkpoint; restart replays deterministically and no false freshness is acknowledged. |
| `STIO-004-APPEND-ENOSPC` | Failed seglog append is not acknowledged, later appends are rejected, existing verified records remain readable, and no memory-buffered event appears after recovery. |
| `STIO-005-RECOVERY-PROBE` | Explicit retry revalidates identity/version/integrity/lock/checkpoint before writer mode; outage/recovery times remain distinct and blocked attempts do not auto-resume. |
| `STIO-006-RECOVERY-FAIL` | Failed recovery probe retains viewer/blocked posture and the owned writer lock. |
| `LOCK-001-LIVE` | Live lock yields a non-writer frozen viewer with zero writer components. |
| `LOCK-002-STALE-DIAGNOSTIC` | Heartbeat older than 10 seconds never authorizes takeover while the OS lock is held. |
| `LOCK-003-STALE-OWNER-FREE-OS` | New process acquires the free OS lock first, replaces diagnostics atomically, and becomes the sole writer. |
| `LOCK-004-INDETERMINATE` | Invalid/missing owner diagnostics plus held OS lock produces `lock_indeterminate`, never forced takeover. |
| `LOCK-005-ADAPTER-RACE` | Unix `flock` and Windows `LockFileEx` two-process races produce exactly one writer and no loser writer handle. |
| `LOCK-006-VIEWER-INVENTORY` | Every command/direct handler is allowed or disabled; mutation bypass returns `storage_read_only`; no presentation-only gate exists. |
| `LOCK-007-REFRESH-PROMOTE` | Manual refresh remains coherent and write-free; promotion closes readers and reruns every startup gate; a newer store remains under L-001 refusal. |
| `ROOT-001-EMPTY-OVERRIDE` | Known populated root plus empty override creates no new store and identifies the prior instance. |
| `ROOT-002-REMOVED-OVERRIDE` | Bootstrap binding prevents silent default-root initialization when a populated override disappears. |
| `ROOT-003-IDENTITY-MISMATCH` | Another instance, markerless bytes, or corrupt/missing manifest routes to explicit block/recovery without mutating either candidate or reinitializing schema version. |
| `ROOT-004-RELOCATION-CRASH` | Kill at every relocation step opens the last verified binding or blocks; source stays recoverable and no empty product appears. |
| `ROOT-005-CROSS-VOLUME` | Destination validation precedes binding change and no cross-filesystem atomic-rename assumption is made. |
| `ROOT-006-MISSING-OR-AMBIGUOUS` | Missing bound volume or multiple lineage candidates blocks for explicit action; precedence alone never mutates a candidate. |
| `FALLBACK-001-DETERMINISTIC-ROOT` | All canonical stores and the aggregate lock move together under the deterministic fallback; unsafe bootstrap root refuses fallback. |
| `FALLBACK-002-TWO-HOST-DIVERGENCE` | A changed base closes the second host's writes and cannot auto-merge or overwrite either store. |
| `FALLBACK-003-RETURN-CRASH` | Unchanged-base return at every cut selects the last verified store or blocks with no lost fallback. |
| `FALLBACK-004-EXPLICIT-DISPOSITION` | Keep-logical and fork-local-as-new preserve unimported lineage exactly and never mutate the unselected store. |
| `FALLBACK-005-UNSTABLE-CAPTURE` | Corrupt/changing logical-root capture admits no fallback write and stays viewer/blocked. |

### EventRecord 2.0 scope, compatibility, legacy normalization, dedupe, and replay

| Fixture | Required oracle |
| --- | --- |
| `EVT2-SCOPE-001` | Application events require `scope_kind=application` and `project_id=null`; project events require `scope_kind=project` and non-empty project ID; both persist/index in the exact partition without a fake project. |
| `EVT2-SCOPE-NEG-001` | Application+project ID, project+null, missing/unknown scope, unregistered family policy, and a project sentinel are rejected/quarantined before append with no checkpoint advance. |
| `EVT2-LEGACY-GOLDEN-001` | Two runs, process restart, another locale/timezone, and two independent implementations use UTC RFC 3339 with nine fractional digits plus registered extensions/identity pointers and emit byte-identical RFC 8785 JSON, canonical MessagePack, IDs, timestamps, migration object, index row, and one projection effect from the same EventEnvelopeV1 input/context. |
| `EVT2-LEGACY-QUARANTINE-001` | Header/envelope or project conflicts, invalid time, unregistered alias, missing payload schema, and unhandled secrets quarantine with the exact reason and no checkpoint advance. |
| `EVT2-LEGACY-IMMUTABLE-001` | Legacy normalization changes neither source segment hash, append count, nor tail sequence; v2 index rebuild returns the same row/projection. |
| `EVT2-DEDUPE-001` | Global event-ID and scoped idempotency duplicates return the original only for the same semantic digest; different digest conflicts; lifetime remains longer than ordinary TTL. |
| `EVT2-DEDUPE-CRASH-001` | Crash after seglog append/before dedupe-index update catches up on restart; retry returns the original locator and canonical append count remains one; failed catch-up appends nothing. |
| `EVT2-REPLAY-ONLY-001` | Normal append rejects `projector_replay_only` without mutation; compatibility replay commits each owned rebuildable projection/checkpoint once and every tool/network/notification/scheduler/outbox/usage/command/append side-effect spy stays zero. |
| `EVT2-INDEX-001` | `event_record_index.v2:{scope_partition}:{sequence_id_20}:{event_id}` uses `app` or reversible project partition plus zero-padded unsigned sequence; key/value scope mismatch is corruption and rebuild returns exact rows. |
| `EVT2-VERSION-001` | V1 then V2 generations replay in stable sequence; a reader lacking V2 refuses even read-only inspection instead of a partial view; a 1.0 reader/writer performs no mutation on V2; a V2 writer never emits V1 or rewrites legacy/V1 on ordinary open. |

#### K37 retained-inline restore and seglog EventRecord oracles

Every oracle in this subsection is `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION`. It is planned/static acceptance prose, not executed evidence. For each of `restore_point.applied`, `restore_point.created`, `restore_point.deleted`, `restore_point.expired`, and `seglog.event_appended`, a positive must use the exact registered family/event pair, inline schema `$id`, structured retention ref, EventRecord `pm.event.v0@2.0.0`, and owner scope. Project rows require a non-empty envelope project ID byte-equal to the payload project ID. `seglog.event_appended` inherits the referenced event's application/project partition. The outer event discriminator and payload-schema ID must equal the selected row. Same identity/digest returns the original durable result with one append; a different digest is `idempotency_conflict`; unavailable dedupe proof is `dedupe_unavailable`; `projector_replay_only` produces no canonical or external side effect. Wrong discriminator/schema/version/scope, missing or extra fields, wrong type, empty required identity/ref/item, illegal const/enum, invalid RFC 3339 time, unknown alias/policy/owner, unhandled secret, or unprovable join rejects or quarantines. Every negative/refusal has zero append and zero checkpoint advance; it also has zero owner mutation, projection effect, dispatch, and destructive action.

`restore_point.applied` planned/static oracle set:

- **First branched:** the exact closed twelve-field payload has `schema_version=1.0.0`, persisted `result=branched`, non-empty identities/refs/target IDs, equal lowercase 64-hex expected/observed hashes, valid `applied_at_utc`, matching project envelope, and creates exactly one target thread/branch pair and one event.
- **Replay:** the same `application_id` and application intent returns the recorded `branched` result and exact target pair with zero new branch and zero new event.
- **Project and source joins:** envelope/payload project, outer event/schema, expected/observed hash, source thread/branch, and restore-point identity all agree; first execution and replay preserve source thread, conversation branch, worktree, files, Git/index, queue, runtime safe points, and restore-point lifecycle.
- **Persisted negatives:** reject `result=refused|failed|other`, missing result, missing/empty target ID, missing/empty source/application/restore/project identity, malformed or unequal hash, wrong version/time, extra property, envelope mismatch, changed replay target, duplicate append/branch, source mutation, or restore-point consumption/transition.
- **Refused command result:** exactly `refused`, no target IDs, event-count delta zero, no source or restore-point mutation; replay returns the same no-event result.
- **Failed command result:** exactly `failed`, no target IDs, event-count delta zero, no source or restore-point mutation; replay returns the same no-event result. Any event for refused/failed first execution or replay is a hard failure.

`restore_point.created` planned/static oracle set:

- `RSC-P01` — Exact required payload, const `1.0.0`, non-empty identities/refs/hash, RFC 3339 creation time, const `available`, project equality, and arrays of non-empty strings may emit exactly one event only after the immutable record is durable.
- `RSC-P02` — Absent `safe_point_id` and present non-empty `safe_point_id` both validate; the latter is lineage only and causes no file/worktree mutation.
- `RSC-P03` — Same create identity/digest returns the original record/event result with no duplicate append.
- `RSC-N01` — Missing/extra field, wrong version/status/type, empty scalar, invalid time, bad array item, unresolved ref, record-ref/hash mismatch, project mismatch, unknown policy, or secret rejects/quarantines with no append or checkpoint advance.
- `RSC-N02` — Same identity with different content returns `idempotency_conflict`; no overwrite, second record/event, or checkpoint movement.
- `RSC-N03` — Unavailable family/schema, permission, or writer posture creates no record and no event.

`restore_point.deleted` planned/static oracle set:

- `RSD-P01` — One exact-hash unprotected `available` record with permission/writer/hold/ref authority transitions once to `deleted`; `prior_hash` identifies the pre-transition record.
- `RSD-P02` — Replay returns the recorded terminal result with no duplicate append.
- `RSD-N01` — Malformed payload, wrong version/status, empty ID/ref/hash/reason, invalid time, project/actor conflict, unresolved ref, unknown policy, or secret rejects/quarantines with record and checkpoint unchanged.
- `RSD-N02` — Protected, held, stale-hash, already-terminal/non-available, permission-denied, viewer/blocked, in-flight, source-lineage-required, or storage-preflight failure remains `available`, clears no hold, and appends nothing.
- `RSD-N03` — Replay produces no second append; same identity/different digest conflicts without mutation.

`restore_point.expired` planned/static oracle set:

- `RSE-P01` — One `available` fully eligible record at or after inclusive `reference_release + 7,776,000 seconds`, with no overriding ref, exact row/payload policy equality, prior-hash equality, at least one non-empty release-evidence ref, and valid occurrence time transitions once to `expired`.
- `RSE-P02` — Count pressure selects only the oldest eligible record at `2,048/project` and retains the required hash summary.
- `RSE-N01` — Malformed payload, wrong version/status, empty ID/hash/evidence, empty evidence array, invalid time, project/policy mismatch, unknown policy, unresolved evidence, or secret rejects/quarantines with no append or checkpoint advance.
- `RSE-N02` — Before the inclusive boundary, still held/referenced/protected, non-available, or unprovable eligibility preserves the record and performs no expiry/destructive action.
- `RSE-N03` — Policy inference from prefix/name/path/mtime/timestamp/array position/similar family fails closed with no expiry append or checkpoint advance.

`seglog.event_appended` planned/static oracle set:

- `SEA-P01` — After the referenced canonical frame and manifest watermark are synchronized, one observability payload with non-negative matching sequence, exact matching event type, resolvable event/segment refs, valid time, optional non-empty writer, and inherited scope validates against the schema and append receipt.
- `SEA-P02` — Retention resolves exactly to `RP-SEGLOG-7D@1.0.0`: creation anchor, 604,800 seconds, 500,000/instance, oldest-eligible eviction, hold protection, and compact expiry.
- `SEA-N01` — Negative/non-integer sequence, invalid type grammar, empty/unresolved ref, invalid time, empty writer, extra field, or secret rejects/quarantines without observability append or checkpoint movement.
- `SEA-N02` — Type/sequence/segment receipt mismatch or inherited-scope mismatch rejects; no partition is fabricated.
- `SEA-N03` — Missing/mismatched policy, held eviction, premature expiry, or physical-metadata inference grants no compaction/destructive eligibility.
- `SEA-N04` — Substituting the observability row for its referenced canonical event is rejected; the referenced event remains authoritative.

#### Case L exact static fixture and verifier registration

The committed static oracle for `EVT2-LEGACY-GOLDEN-001`, `EVT2-LEGACY-QUARANTINE-001`, and `EVT2-LEGACY-IMMUTABLE-001` is exactly `tests/fixtures/event_record/legacy_normalization/golden/event_envelope_v1_to_event_record_v2.json`. Its machine authorities are `Plans/event_family_registry.json`, `Plans/event_family_registry.schema.json`, `Plans/event_record.schema.json`, and the `event_record_index` row in `Plans/storage_value_registry.json`. Runtime-artifact schema coverage uses exactly `tests/fixtures/runtime_artifacts/golden/runtime_artifact_fixtures.json`, `Plans/runtime_artifact_envelope.schema.json`, the 19 `Plans/runtime_artifact_<type>.schema.json` files, and `Plans/runtime_artifact_restore_point.schema.json` as the unchanged dedicated restore-point authority.

Targeted static commands are:

```text
python3 scripts/pm-plans-verify.py validate-runtime-artifact-schemas
python3 scripts/pm-plans-verify.py validate-case-l-non-event-materialization
python3 scripts/pm-implementation-readiness.py self-test
python3 scripts/pm-implementation-readiness.py validate
python3 scripts/pm-plans-verify.py validate-implementation-readiness
```

`validate-case-l-non-event-materialization` is a static owner/consumer oracle for only the approved `PD-PROBE-L011-01 A/A/A/A/A`, `PD-PROBE-L020-01 A/A/A`, `PD-PROBE-L032-01 A`, and mechanical `PGF-010` materialization. Its pass result cannot close an EventRecord denominator/depth obligation and cannot certify runtime behavior, buildability, governance, PNC-019, or Case L.

The L-032 oracle loads `Plans/storage_recovery_contracts.schema.json` as Draft 2020-12 and requires exactly `migration_preflight_result` and `migration_progress_snapshot`. Its in-memory suite has six named positives and fourteen named negatives. Positives cover ready at the exact free-space boundary, blocked one byte below with `blocked_insufficient_space`, the ten-percent reserve branch, cancellable preflight, non-cancellable applying with paired bytes, and committed progress linked to the sole `pm.storage_value.migration_receipt.v1` terminal receipt. Negatives cover wrong outcome/reason pairings, both wrong free-space comparisons, both arithmetic formulas, an unknown phase, unpaired or overrun bytes, overrun steps, post-preflight cancellation, ETA, percentage, and committed-without-receipt. The assertion evaluator uses integer ceiling arithmetic for `reserve_bytes = max(268435456, ceil(0.10 * (backup_bytes + staging_bytes)))`, exact addition for `required_free_bytes`, `0 <= completed_steps <= total_steps`, and `0 <= bytes_done <= bytes_total` when paired bytes are present. It also compares `migration_receipt.value_schema.properties.preflight_result` to the sidecar definition after recursively removing only `$comment`; no other keyword or value is ignored. `migration_receipt` remains the only migration storage family and sole terminal durable query authority. `migration_progress_snapshot` is journal-derived, is not a receipt or storage family, and must not be registered as an EventRecord family.

The L-011 static oracle loads the live `Approved fallback-divergence disposition owner contract` from Storage and the live `Storage fallback divergence command envelopes` from Contracts, then requires owner equality in the Catalog, Commands System, and exactly one production row at each of `storage.fallback.keep_logical_root`, `storage.fallback.fork_new_instance`, and `storage.fallback.export_both`; `cmd.storage.fallback.resolve_divergence` is rejected. The complete Args-schema and ownership/result cells of each of the three primary Catalog rows must equal the closed owner declaration, not merely contain selected markers: `StorageFallbackDispositionRequest` has the common fields `command_id`, `idempotency_key`, `actor_ref`, `confirmation`, and all eight explicit CAS components; keep/fork admit only those 12 fields, while export admits only those 12 plus `destination_ref` and `encryption_key_ref`. An added or wrong-variant field in any primary row fails closed even when the later shared prose block remains correct. Commands System must state the exact storage/Contracts-owned request/result relationship and Catalog registration/consumer-only boundary; catalog ownership is invalid. The exact confirmations are `retain_fallback_and_select_logical`, `create_inactive_candidate_without_switch`, and `encrypt_exact_bytes_and_retain_sources`; `confirmation_strength` is not a substitute, and request-side `manifest_ref`, result variants, receipts, or custody fields fail closed. Every row must also preserve the lowercase 64-hex rule, a distinct sole storage handler, command-envelope replay identity, both-root retention, and receipt-only/no-EventRecord effects.

The same oracle requires each complete production `acceptance_checks[0]` request declaration to equal its owner-derived grammar exactly. It does not stop at the first semicolon or use a finite forbidden-field blacklist as proof of closure, so an appended field-bearing suffix or analogous unknown extra on any of the three rows fails closed. It also requires the closed 16-field `StorageFallbackDispositionResult` with only `applied | replayed | refused | failed_recoverable`; `candidate_binding` and `export_custody` are required-present nullable fields. Keep success changes only the governed active binding and has both variants null. Fork success returns only the closed inactive candidate, keeps `export_custody=null`, and leaves the active binding unchanged. Export success keeps `candidate_binding=null`, leaves active binding and both source heads unchanged, and carries `manifest_ref` only inside the closed output `export_custody`; refused/failed variants are null and cannot claim binding change, cleanup, or custody verification. The Contracts owner list for `StorageFallbackResolutionReceipt` must equal exactly all 26 required fields from `receipt_id` through `completed_at_utc`, with nullable variant fields required-present. The receipt remains the sole durable audit artifact and no EventRecord is permitted. Missing/duplicate reverse coverage, shared/wrong handlers, a generic receipt placeholder, an event effect, any receipt-field omission, missing or extra request/result fields, wrong command confirmation, active-binding mutation, lossy export, or source-root cleanup fails the static oracle.

The L-020 static oracle scans exactly the nine current command surfaces—UI Command Catalog, production Wiring Matrix, UI Wiring Rules, Commands System, Assistant Chat, Final GUI, Worktree Git Improvement, Executor Protocol, and Orchestrator Page—and requires zero `retry_scope`. The canonical runtime command, Orchestrator wrapper, and compatibility alias must have one production row each, the same `handlers::runtime::restore_safe_point_then_retry`, `safe_point.restored`, event effect, state/disabled projections, idempotency, result, and admission contract. Wrapper and alias accept the same canonical fields plus optional `permission_snapshot_id`; admission validates it against current permission state, consumes it, and applies the identical deterministic transform before the sole handler. A peer Orchestrator handler, wrapper-only field reaching runtime, receipt-only/no-event peer path, mismatched effect, or divergent admission fails closed.

The `PGF-010` static oracle derives command existence from the live catalog and reverse coverage from the live production matrix. `cmd.chat.branch_from_restore` must resolve only to `handlers::chat::branch_from_restore`; result is closed to `branched | refused | failed`; only first `branched` returns target IDs and emits exactly one `restore_point.applied`; replay returns the same result/target IDs without duplicate emission; refused/failed return no target IDs and no event. First execution and replay preserve source thread, source conversation branch, worktree, files, Git/index state, queue, and runtime safe points. UI Wiring Rules must keep the ghost-command check live-derived from current normative references, catalog membership, and production handler/reverse coverage; a stale example list cannot satisfy it.

`self-test` must recompute both positive legacy normalizations, canonical JSON and MessagePack bytes, generation-qualified index rows, projection digests/counts, source immutability/deltas, the complete named quarantine matrix, the L-032 six-positive/fourteen-negative matrix, and the L-011 owner-equality negative matrix. L-011 mutations must reject missing reverse wiring, shared/wrong handlers, `confirmation_strength`, missing and wrong command confirmation, missing `actor_ref`, every missing CAS position, export request `manifest_ref`, request-side custody, each retired success token `kept_logical_root | fork_candidate_created | exported`, an omitted required result field, non-null wrong variants, fork/export active-binding changes, a generic receipt placeholder, and an invented EventRecord. In addition, it must reject an unknown extra in each complete primary Catalog Args cell, the exact catalog-owned Commands regression, an appended unknown request suffix in each of the three complete production request declarations, and omission of every one of the 26 `StorageFallbackResolutionReceipt` fields in turn, including `completed_at_utc`. Existing L-020 retry/effect divergence, `PGF-010` event/ghost drift, and comment-only versus semantic registry mutations remain mandatory. `validate` and its wrapper remain fail-closed while `event_denominator_unresolved`, event-family contract-depth obligations, Spec Lock hashes, generated currentness, or PNC-019 executable authority are unresolved. A red result caused by those named residuals is truthful; removing the residual, accepting an unknown family, registering a wildcard/default family, or treating an open `{}` payload/item schema as depth-complete is not an allowed repair.

The historical Known-37 event-family slice is a **KNOWN-KERNEL STATIC contract-depth set at 37/37**: each row in that bounded slice has an exact owner-routed payload contract, closed required spine and applicable enums/conditions, retention authority, and planned positive/negative/replay/quarantine oracles at canonical Plans surfaces. The live registry is revision `2026-08-04.1` with 39 rows; the two later rows do not retroactively enlarge the Known-37 assignment. July Event Authority evidence records the 37-row slice plus at least 248 confirmed persisted-unregistered families, at least 40 unresolved exact rows, and 68 excluded rows. It proves only a source-dated persisted floor of at least 285 with denominator status `UNKNOWN_OPEN`; bulk registration is forbidden and fresh reconciliation is required. The bound external-custody inputs are `EA-27_PRODUCER_UNION_AND_DENOMINATOR.json` (SHA-256 `644c6d0bc913eaed62f41e231fdb7e04f55d270549fcdede73a0869994111e47`; `union_rows_sha256=aa9c365904788eba74df73bb1b5eecaae903a6aa167e0514b7937198aa0dbf4d`) and `EA-29_TERMINAL_FINDINGS_RESIDUALS_CONTRACT_DEPTH_REPAIR_AND_WAVE1_CHECKPOINT.md` (SHA-256 `17820aef1b498acf2e5165bee106171ff1ef35a1b23fa67d0cc23e291a8ed7bf`) under `PuppetMaster-AssuranceLab` custody. Static prose/schema presence is not fixture execution, validator or gate success, shard or generated-governance currentness, runtime behavior, harness evidence, certification, buildability, Case L closure, or denominator completion. Unknown/unregistered events still quarantine without checkpoint advance.

These checks are static plan/schema/fixture evidence. The PNC-019 harness must run the non-event validator before constructing a harness result or writing a receipt, then stop fail-closed on the live EventRecord denominator/depth critical. Updating its source-consumer and preflight shape is not a harness execution, runtime lifecycle result, certification receipt, buildability proof, or Case L finding closure.

### Exact-replace restore, truthful envelopes, and SCM boundaries

| Fixture | Required oracle |
| --- | --- |
| `RSP-ATOMIC-001` | Kill after every multi-path operation; restart ends at exact target, exact rollback, or fenced recovery-required, and the outcome matches the proven digest. |
| `RSP-ATOMIC-002` | Apply failure plus verified rollback emits only `restore_failed`; post digest equals pre/admission digest. |
| `RSP-ATOMIC-003` | Concurrent third state is not overwritten; `restore_recovery_required` persists and dispatch remains fenced. |
| `RSP-EQUAL-001` | Complete manifest/SCM equality emits `restore_skipped` with zero target-path mutations. |
| `RSP-INTEGRITY-001` / `RSP-INTEGRITY-002` | Corrupt manifest or missing/corrupt blob emits `restore_refused` plus exact reason before mutation; admission digest is unchanged. |
| `RSP-INTEGRITY-003` | Post-apply mismatch verifies rollback and `restore_failed` or remains recovery-required; never `restored_clean`. |
| `RSP-SCOPE-001` | Tracked, staged, unstaged, untracked, explicitly mutation-scoped ignored, symlink, executable, and submodule cases include/exclude and round-trip exactly within the FileSafe manifest boundary. |
| `RSP-BASELINE-001` | `safe_point` exact-replaces only the named worktree/branch, restores captured pre-attempt dirty state, and admits exactly one successor attempt after durable proof. |
| `RSP-BASELINE-002` | `historical_commit` uses a full immutable commit OID to create a distinct clean worktree; dirty source bytes/index/branch/ownership remain unchanged. |
| `RSP-BASELINE-003` | `worktree_head` validates exact full HEAD plus state digest and explicit dirt confirmation with zero SCM/file mutation. |
| `RSP-BASELINE-004` | Unknown target, missing conditional field, moving/abbreviated ref, missing/non-commit OID, identity mismatch, or digest drift refuses with no substitution or successor attempt. |
| `RSP-RETENTION-001` through `RSP-RETENTION-003` | Open recovery holds outlive ordinary retention; release permits only later owner cleanup; missing/corrupt recovery material preserves local work and never falsely resolves. |
| `RSP-KEY-001`, `RSP-REGISTRY-001`, `RSP-REGISTRY-002` | Only canonical `sp:` writes exist; aliases resolve uniquely or fail closed; required split rows are materialized and a deferred/bundled launch dependency is rejected. |
| `RSP-RP-001` through `RSP-RP-004` | Conversation restore points branch to a new thread/branch, preserve the source thread/worktree/files, apply `RP-RESTOREPOINT-90D-AFTER-RELEASE@1.0.0` with its exact release boundary/cap/oldest-eligible/overriding-ref rules, and refuse stale/corrupt input without filesystem restore. Create/apply/delete and replay/refusal/failure leave Executor attempt, successor-attempt, runtime-safe-point, worktree/file, and dispatch state unchanged; no retention timer or expiry transition is Executor-owned. |
| `RSP-CMD-001` / `RSP-CHAT-001` | Command IDs/conditional fields/wiring are singular and complete; multi-file Chat revert has the same FileSafe transaction truth and does not rewind the conversation. |

The exact restore inventory is `RSP-ATOMIC-001`, `RSP-ATOMIC-002`, `RSP-ATOMIC-003`, `RSP-EQUAL-001`, `RSP-INTEGRITY-001`, `RSP-INTEGRITY-002`, `RSP-INTEGRITY-003`, `RSP-SCOPE-001`, `RSP-RETENTION-001`, `RSP-RETENTION-002`, `RSP-RETENTION-003`, `RSP-KEY-001`, `RSP-REGISTRY-001`, `RSP-REGISTRY-002`, `RSP-BASELINE-001`, `RSP-BASELINE-002`, `RSP-BASELINE-003`, `RSP-BASELINE-004`, `RSP-RP-001`, `RSP-RP-002`, `RSP-RP-003`, `RSP-RP-004`, `RSP-CMD-001`, and `RSP-CHAT-001`.

### Retention, anchors, compaction, deletion, quarantine, and maintenance exclusion

- `RET-001-expiry-boundary`, `RET-002-cardinality-tie`, `RET-003-hold-set-clear`, `RET-004-unknown-policy`, `RET-005-janitor-resume`, and `RET-006-settings-minimum` prove inclusive expiry, deterministic count ties, hold set/clear, fail-safe unknown policy, journal restart cursor, and reject-not-clamp settings minima.
- `ANCHOR-001-old-open-block`, `ANCHOR-002-release`, `ANCHOR-003-multiple-anchors`, `ANCHOR-004-snapshot-missing`, and `ANCHOR-005-atomic-publish` prove blocked recovery survival, exact release conditions, unioned anchors, truthful `recovery_unavailable`, and no half-published blocked episode/anchor.
- `CMP-001-retained-set`, `CMP-002-index-checkpoint`, `CMP-003-projection-rebuild`, `CMP-004-crash-phases`, `CMP-005-maintenance-exclusion`, and `CMP-006-backup-pin` prove the exact retained set and unchanged semantic IDs, index/checkpoint translation, shadow projection swap, phase-driven crash recovery with one `CURRENT` generation, maintenance-lease exclusion, and pre-migration backup pinning.

#### K37 compaction lifecycle event owner oracles (K37-CMP-OC-001)

Every `K37-CMP-P01..P13` and `K37-CMP-N01..N15` oracle is `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION`. `CMP-004-crash-phases` is the crash-cut consumer anchor. Prose registration does not mean passed; Storage remains the semantic owner.

- `K37-CMP-P01` — Matching survivor digest and complete semantic map select `translate_by_semantic_identity`; every entry preserves sequence/event identity, target refs are current, retired refs are absent, and checkpoint advance waits for verification.
- `K37-CMP-P02` — Mismatch or unprovable translation selects `invalidate_and_rebuild`; affected rows invalidate and rebuild from the nearest matching survivor checkpoint or first retained event, with no interim advance.
- `K37-CMP-P03` — Complete verified target shadow plus synchronized target `CURRENT` selects `activate_verified_target_shadow`; target generation activates once and pending state clears once.
- `K37-CMP-P04` — Unprovable/nonexistent shadow selects `rebuild_from_survivors`; affected derived state is discarded and rebuilt over the authoritative target survivor set before publication or checkpoint advance.
- `K37-CMP-P05` — Each action member traverses exactly `preparing -> building -> verified -> commit_pending -> committed -> finalized` with every predecessor postcondition, target proof, survivor/removal map, and action/phase join established and closed-source hashes unchanged.
- `K37-CMP-P06` — Failure from `preparing|building|verified|commit_pending` with unchanged source `CURRENT` reaches only `failed`, carries non-empty reason, preserves source authority, and publishes no target/checkpoint/projection.
- `K37-CMP-P07` — Publication ambiguity from each nonterminal ordinary phase reaches `recovery_required`, carries non-empty reason, preserves both sides, and keeps mutation/maintenance/projector/checkpoint fences active.
- `K37-CMP-P08` — Crash after target `CURRENT` and before activation/finalization converges on the same identity through `recovery_required -> committed -> finalized` with one target and no duplicate physical/event effect.
- `K37-CMP-P09` — Proof that `CURRENT` never left the valid source converges `recovery_required -> failed`, preserves source authority, and leaves immutable failed history.
- `K37-CMP-P10` — Crash at every builder, artifact, pending-generation, `CURRENT`, activation, pending-clear, finalization, and next-active cut yields exactly one `CURRENT` generation and never selects by mtime/filename.
- `K37-CMP-P11` — `recovery_required|failed` require one non-empty `failure_reason`; the six ordinary phases forbid it; no peer evidence property is admitted.
- `K37-CMP-P12` — Identical transition replay after restart returns the original durable result with append count/effect one; terminal failure retry uses a new `compaction_id` only after every current gate revalidates.
- `K37-CMP-P13` — Compaction raced against migration, restore, salvage, and backup-boundary capture admits exactly one lock/lease holder; refusal emits no lifecycle success event or overlapping write.
- `K37-CMP-N01` — Reject unknown, empty, alias, case variant, generic, packet-007, or third action-domain member; analogy grants no compatibility.
- `K37-CMP-N02` — Reject semantic translation without matching survivor digest and complete unambiguous sequence/event mapping, including timestamp/physical-ref derivation.
- `K37-CMP-N03` — Reject target-shadow activation before complete target proof/target `CURRENT`, with source `CURRENT`, or with shadow/index/checkpoint/removal-map disagreement.
- `K37-CMP-N04` — Reject skipped, reversed, same-state-as-new, unlisted, or terminal outgoing edges, including direct recovery finalization, committed failure, and edges from terminal states.
- `K37-CMP-N05` — Reject `failed` without proven unchanged pre-`CURRENT` source authority; ambiguous or possibly post-`CURRENT` failure is `recovery_required`.
- `K37-CMP-N06` — Reject recovery egress without exact source-failure or verified-target-commit proof and reject fence clearing while unresolved.
- `K37-CMP-N07` — Reject missing/empty/null exceptional reason, reason on an ordinary phase, or a new evidence field.
- `K37-CMP-N08` — Reject source mutation, active-segment inclusion, wrong target generation, changed semantic bytes/identity/order/hash/gaps, early source deletion, or retired physical refs.
- `K37-CMP-N09` — Reject mtime, filename, newest-looking directory, advisory index, projection freshness, or event order as visibility authority; synchronized `CURRENT` alone selects.
- `K37-CMP-N10` — Reject stale policy revision/hash, unresolved refs, ineligible held/live/backup/rollback source, missing lock/lease, or competing owner; no success append.
- `K37-CMP-N11` — Different digest for one identity returns `idempotency_conflict`; unavailable proof returns `dedupe_unavailable`; neither appends, projects, advances, dispatches, or mutates.
- `K37-CMP-N12` — Reject replay that repeats physical effect, semantic append, checkpoint advance, dispatch, or namespace mutation.
- `K37-CMP-N13` — Reject raw secret/credential/token/path/machine identity/event content or unregistered redaction transform.
- `K37-CMP-N14` — Reject treating action selection as applied before the phase predicate; early/exceptional/failed rows cannot activate, publish, clear pending, or delete source.
- `K37-CMP-N15` — Reject reuse of terminal identity for a new attempt; same digest returns original, different digest conflicts, and a new attempt uses a new identity after revalidation.

Every `K37-CMP-N01..N15` rejection has zero append, zero owner mutation, zero projection effect, zero checkpoint advance, zero command/tool/provider/network dispatch, and zero source/target namespace mutation.

- `DEL-001-thread`, `DEL-002-held-thread`, `DEL-003-shared-project-seglog`, and `DEL-004-backup-restore` prove immediate logical hide, held purge disclosure, cross-project isolation, the 24-hour purge contract, content-free tombstone retention, and tombstone replay preventing deleted content from reappearing after backup restore.
- `Q-001-gui-reset`, `Q-002-critical-invalid`, `Q-003-derived-rebuild`, `Q-004-recovery-migration`, `Q-005-quarantine-cap`, `Q-006-raw-export-redaction`, and `Q-007-corrupt-quarantine` prove raw-byte custody before reset/migration, critical-family fail-closed behavior, derived rebuild, CAS-published recovery, no unresolved critical cap eviction, routine-export redaction, and quarantine-integrity refusal.

#### K37 deletion lifecycle event owner oracles (K37-DEL-OC-001)

Every case in this subsection is `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION`; it is planned/static acceptance prose and never a runtime, fixture, gate, or certification claim.

Shared envelope admission for the four Storage rows is exact. `storage.compaction_lifecycle_changed` requires application scope and envelope `project_id=null`. For deletion, retention hold, and quarantine, absent payload `project_id` requires application scope with envelope `project_id=null`; a present non-empty payload `project_id` requires project scope and byte-equal envelope project ID. Empty, sentinel, multiple, conflicting, or unprovable candidates quarantine before append with no checkpoint advance. In every row, outer `event_type`, `payload_schema_id`, inline `$id`, family revision, structured retention ref, replay identity, and registered redaction posture must join exactly.

Positive cases require:

- application scope with payload project ID absent, envelope `project_id=null`, exact row/schema/version/retention, and required spine;
- project scope with the same non-empty project ID in payload/envelope and one scope partition;
- ordinary thread deletion `requested -> logically_hidden`, immediate ordinary projection removal, content-free tombstone preservation, and eligible unheld purge through owner compaction within the 24-hour contract;
- held deletion `logically_hidden -> held`, disclosure of current blockers, and no purge until owner-cleared holds plus complete revalidation;
- `purge_pending` both without generation and with a non-negative integer generation, never as visibility or success authority;
- terminal `purge_pending -> purged` only after verified committed successor authority, with required non-negative generation matching the durable deletion record;
- each admitted `requested|logically_hidden|purge_pending -> failed` carrying non-empty reason, no generation, fencing, and no success claim;
- retry after failure with the same `deletion_id` and existing deletion-operation idempotency identity, after revalidating holds, tombstone, scope, storage writer, and purge/compaction authority;
- backup restore replaying tombstones before visibility so deleted content does not reappear; and
- identical replay returning the original result with append count one and no duplicate purge/projection effect.

Negative/zero-effect cases require:

- reject/quarantine missing/extra/wrong schema, version, type, enum, empty ID/ref/item, duplicate hold item, invalid deadline, or other malformed payload;
- quarantine application+project ID, project+missing/null/mismatched payload project ID, unknown scope, sentinel, or conflicting candidates with no scope substitution;
- reject negative, fractional, string, or null event generation; generation outside `purge_pending|purged`; missing generation for `purged`; missing/empty failure reason for `failed`; or failure reason on any other state;
- reject `held -> failed|purged`, purge while blockers remain, `purged -> *`, or any unlisted edge while preserving the prior valid state;
- refuse direct UI/command/segment purge, missing tombstone, unverified/uncommitted generation, newest-by-mtime authority, ambiguous/cross-project reachability, or path/name/time/focus/order scope inference;
- refuse/quarantine viewer/blocked storage, missing writer, unavailable maintenance/compaction/family/schema/retention authority, or unavailable dedupe proof;
- return `idempotency_conflict` for one identity with a different digest;
- reject raw secret/credential/token/password/API key/OAuth/local path/deleted content in event or tombstone; and
- fail backup restore that exposes deleted content before tombstone replay.

Every deletion rejection/refusal has zero new append, zero owner-state mutation, zero projection effect, zero checkpoint advance, zero purge/compaction dispatch, and zero hold clear.

#### K37 retention-hold lifecycle event owner oracles

All are `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION`. Positives cover application/project set and clear through protected `cmd.storage.legal_hold.manage`, matching optional project identity, exact actor/reason/semantic scope/target policy/anchor/affected refs/receipt, one scoped event, and union composition of multiple holds. Clearing one hold never clears another and holds never clear automatically. Row retention remains `RP-AUTHORITY-INDEFINITE@1.0.0` even when payload `policy_ref` names a finite held-target policy.

Negatives reject malformed schema/version/scope, empty ref/item, duplicate affected ref, unknown action, policy/row conflation, unauthorized or missing actor/reason/expected state, missing writer/family, scope conflict, automatic clear, clearing another hold, refusal, and replay duplication. Each has zero append, zero owner mutation, zero projection effect, zero checkpoint advance, zero dispatch, and zero unauthorized hold set/clear.

#### K37 value-quarantine lifecycle event owner oracles

All are `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION`. Positives cover each admitted risk/state pair and legal edge: `detected -> secured`; `secured -> migrated|restored|recovery_blocked`, plus `reset_to_default` only for `Q-RESETTABLE` and `rebuilt` only for `Q-DERIVED|Q-MIRROR`; and resolved `migrated|rebuilt|reset_to_default|restored -> purged`. Exact `raw.bin`, custody manifest, and append-only recovery receipt synchronize before live-key mutation. Unknown schema/upgrader remains `recovery_blocked`; unresolved `Q-CRITICAL` remains indefinite and cap pressure blocks new mutation-capable writes.

Negatives reject direct detected-to-resolution, resolution before secured, critical reset/rebuild, class-invalid reset/rebuild, `recovery_blocked -> purged`, transition out of `purged`, purge without resolved custody/hold authority, cap eviction, missing/empty raw custody hash/ref, schema identity conflict, illegal risk/state pair, project/scope conflict, raw secret/content in the event, defaulting unknown content, refusal, and replay duplication. Each has zero append, zero live-value mutation, zero projection effect, zero checkpoint advance, zero dispatch, and zero unauthorized purge/hold action.

Migration, compaction, store restore, salvage, and backup-boundary capture must be raced in both orders. Exactly one maintenance lease holder proceeds; the second operation receives the owner-defined refusal and no overlapping canonical write occurs. Kill/restart cases must use the storage-owned phase tables and must never pick authority by mtime, filename, or newest-looking directory.

### Required-MVP storage-family registry routing

- `REGISTRY-MVP-001` asserts exactly one materialized machine row, canonical key, closed value schema, owner/producer/consumer, migration, recovery, retention, and redaction disposition for every storage-owner-required MVP family, including `migration_receipt`, `editor_buffer_recovery_state`, `editor_workspace_state`, `hotreload_state`, `onboarding_state`, safe-point/restore transaction/restore point, EventRecord dedupe/index/checkpoint, and hold/anchor/maintenance/quarantine/deletion families.
- `REGISTRY-MVP-002` separates current-key cases from compatibility cases. First-launch, valid-current-row, and corrupt-current-row oracles use the canonical keys `editor_state.v1:{project_id}:{file_path_hash}`, `editor_workspace_state.v1:{project_id}`, `hotreload_state.v1:{project_id}`, and `onboarding_state.v1:{project_id}`. `editor_buffer_recovery_state` uses the per-file canonical key and has no compatibility alias or copy-forward case. Coordinator-owned old-key copy-forward cases are exactly `editor_state:v1:{project_id}` for `editor_workspace_state`, `hotreload_state:v1:{project_id}` for `hotreload_state`, and `onboarding:v1` for `onboarding_state`; the global onboarding alias fails closed when project identity is ambiguous. All compatibility aliases are read-only and never receive new writes.
- `REGISTRY-MVP-NEG-001` removes or defers each launch-critical family and falsifies recovery/retention metadata in turn; validation and mutation admission fail closed, and no prose key template or bundled multi-owner row substitutes for machine authority.

### Mandatory negative acceptance

No Case L suite passes if any of the following occurs: incompatible/preflight refusal mutates target bytes; a half-migrated or mixed-restored store ordinary-opens; a canonical redb family is reported recovered by projection rebuild; a committed migration lacks verification/receipt read-back; a future EventRecord is skipped or rewritten; legacy normalization appends or changes source bytes; replay-only causes external/canonical side effects; `restored_clean` lacks target equality; `restore_failed` lacks rollback equality; exact restore emits `restored_with_conflicts`; a third-party SCM state is overwritten; a moving/abbreviated ref substitutes for an immutable OID; cleanup deletes held/anchored/referenced authority; compaction rewrites closed source bytes or selects by mtime; Executor accepts completion or dispatch from EventRecords, projections, UI state, summaries, or worker/controller claims while `executor_intake_report` or `attempt_receipt` is corrupt, unavailable, or not restored behind a durable verified Storage recovery boundary; a conversation restore-point create/apply/delete path creates or reuses an Executor attempt, successor attempt, runtime safe point, worktree/file/repository/index mutation, worker/scheduler dispatch, or Executor-owned retention timer; or schema/plan/fixture registration is reported as executed runtime proof.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md#EventRecord, ContractName:Plans/event_record.schema.json, ContractName:Plans/FileSafe.md, ContractName:Plans/WorktreeGitImprovement.md, ContractName:Plans/Executor_Protocol.md, ContractName:Plans/storage_value_registry.json, ContractName:Plans/Release_Supply_Chain.md, DecisionID:PD-RSP-01, DecisionID:PD-RSP-07, DecisionID:PD-L015-03

### ATS-024 - Case L Durable-State Fault, Compatibility, Restore, And Retention Fixtures

```yaml
plan_unit_id: ATS-024
unit_type: requirement
status: accepted
owner_doc: Plans/Automated_Testing_System.md
canonical_text: >-
  Automated Testing executes the approved Case L migration, newer-store, mandatory-backup, crash/restart,
  seglog durability, storage-I/O, lock/viewer, root/fallback, EventRecord 2.0 and legacy-normalization,
  exact-replace restore, SCM-baseline, retention/anchor/compaction/deletion/quarantine, and
  maintenance-exclusion fixtures against their canonical owners. Every positive outcome and negative
  no-mutation/no-false-success oracle is receipt-backed; fixture registration, schema validity,
  skipped/inconclusive results, and owner prose never substitute for execution.
gui_related: false
gui_classification_reason: This unit owns automated backend durability, compatibility, fault-injection, and receipt evidence rather than presentation.
depends_on: [ATS-001, ATS-003, ATS-004]
unblocks: [RSC-009]
acceptance_criteria:
  - FX-L001-*, FX-L002-*, FX-L003-*, FX-L016-*, FX-L025-*, and FX-L032-* prove exact refusal, migration, receipt, backup, restore, compatibility, and disk/progress outcomes with byte-digest evidence.
  - Migration command-inventory evidence proves diagnostics/retry are read-only gates and exposes no generic live repair/salvage/Doctor mutation, bypass, post-preflight force-cancel, or try-anyway path.
  - SEG-FX-001..018 plus SEG-OR-001..012 prove barrier durability, survivor determinism, sequence nonreuse, crash convergence, closed immutability, checkpoint/projection truth, and disclosure fidelity.
  - STIO, LOCK, ROOT, and FALLBACK fixtures prove exact retry/failure posture, one OS-authoritative writer, mutation-proof viewer behavior, continuity/relocation recovery, and no automatic divergent-store merge or overwrite.
  - EventRecord 2.0 fixtures prove closed scope pairs, exact v2 lookup keys, byte-identical in-memory-only legacy normalization, lifetime dedupe/catch-up, strict V1/V2 reader compatibility, and replay-only side-effect isolation.
  - RSP fixture families prove exact target/rollback equality, truthful restore envelopes, restart fencing, canonical safe-point identity, SCM baseline effects, source preservation, and Chat parity.
  - RET, ANCHOR, CMP, DEL, and Q fixtures consume the named K37 retained-inline owner-oracle subsections and prove both compaction action domains, the complete ordinary/exceptional graph, exactly one CURRENT-selected generation, retention/hold/cleanup behavior, deletion aftermath, quarantine custody, envelope/scope joins, replay idempotency, and the no-append/zero-effect posture with owner-backed evidence.
  - REGISTRY-MVP fixtures prove complete machine routing for every required family and reject missing, deferred, bundled, or false recovery/retention authority.
  - Missing, blocked, skipped, inconclusive, stale, or merely schema-valid evidence cannot satisfy a required oracle or release gate.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - future Case L durable-state fixture adapter and TestRunReceipt suite
risk_class: case_l_durable_state_false_positive_oracle
reasoning_tier: high
context_scope: case_l_migration_restore_eventrecord_retention_testing
implementation_surfaces:
  - Plans/Automated_Testing_System.md
  - Plans/storage-plan.md
  - Plans/Contracts_V0.md
  - Plans/event_record.schema.json
  - Plans/FileSafe.md
  - Plans/WorktreeGitImprovement.md
  - Plans/Executor_Protocol.md
  - Plans/storage_value_registry.json
  - Plans/Release_Supply_Chain.md
node_compile_hint:
  mode: case_l_durable_state_fixture_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Case-L:L-001..L-033
  - Case-L:PD-L-01..PD-L-06
  - Case-L:EVT-01..EVT-07
  - Case-L:PD-RSP-01..PD-RSP-09
  - Case-L:PD-L005-01..PD-L033-03
  - Case-L:SEG-D-001..SEG-D-029
  - PuppetMaster-AssuranceLab/orchestration-2026-07-17/phase2-case-L/CASE_L_APPROVAL_2026-07-17.md
  - PuppetMaster-AssuranceLab/orchestration-2026-07-17/phase2-case-L/planning/CONSUMER_PROPAGATION_MAP.md
preserved_exact_tokens:
  - "blocked_newer_store"
  - "projector_replay_only"
  - "restore_refused"
  - "restore_recovery_required"
  - "historical_commit_oid"
  - "expected_state_sha256"
  - "CURRENT"
  - "recovery_unavailable"
negative_constraints:
  - Do not redefine owner algorithms, enums, keys, retention values, receipt schemas, or SCM effects in testing.
  - Do not report restored_clean without target equality or restore_failed without rollback equality.
  - Do not treat green parsers, validators, registered fixtures, or unexecuted receipts as runtime, closure, buildability, certification, or completeness proof.
owner_hints:
  - Plans/Automated_Testing_System.md
  - Plans/storage-plan.md
  - Plans/FileSafe.md
```

## FABLE Deferred Action Concrete Repair Addendum - 2026-07-08

This addendum is canonical automated-testing spec text for deferred non-runtime FABLE rows. It creates no WorkNodes, NodeSeeds, executable queues, runtime artifacts, implementation files, production build tasks, final manifests, or PNC-019 receipts, and it does not mark `buildability_gate_passed` true.

### Test Adapter Interface And TestRunReceipt

Repairs row `sfk-fa0b68afddc10ec875a0b183`.

`TestAdapterInvocation` fields are `invocation_id`, `adapter_id`, `test_kind`, `target_ref`, `command_ref?`, `input_artifact_refs[]`, `timeout_ms`, `permission_snapshot_id?`, and `created_at_utc`.

`TestRunReceipt` fields are `test_run_id`, `adapter_id`, `test_kind`, `target_ref`, `started_at_utc`, `ended_at_utc`, `status`, `passed_count`, `failed_count`, `skipped_count`, `error_count`, `log_artifact_refs[]`, `visual_artifact_refs[]`, `coverage_ref?`, `failure_refs[]`, and `schema_version`.

`status` values are `queued`, `running`, `passed`, `failed`, `cancelled`, `blocked`, and `inconclusive`.

### GUI Result Surfacing

Repairs row `sfk-bd4e3c4facbc54e0a68a60c8`.

Testing GUI commands are `cmd.testing.open_panel`, `cmd.testing.watch_run`, `cmd.testing.cancel_run`, `cmd.testing.open_receipt`, `cmd.testing.open_failure`, and `cmd.testing.export_bundle`.

Panel layout contains `run_list`, `active_run_detail`, `failure_list`, `artifact_preview`, and `redaction_notice`. Button states derive from `TestRunReceipt.status`: watch enabled for `queued|running`; cancel enabled for `queued|running`; open receipt enabled for any terminal state; export bundle enabled when `log_artifact_refs[]` or `visual_artifact_refs[]` is non-empty.

### Runtime Disabled To Enabled Trigger

Repairs row `sfk-a86063e06fec52acf396acb6`.

Testing remains runtime-disabled until all of the following are true: a target adapter is configured, the target capability probe returns `available`, permission snapshot is current, required fixtures exist, and the test invocation can produce a `TestRunReceipt` without claiming PNC-019 lifecycle certification. The transition event is `testing.runtime_enabled_for_adapter` with fields `adapter_id`, `project_id`, `capability_probe_ref`, `permission_snapshot_id`, `enabled_at_utc`, and `reason_code`.

<!-- FABLE_REMAINING_ACTION_PLAN_REPAIR_20260708_BEGIN -->
## FABLE Remaining Action Plan Repair Notes (2026-07-08)

This owner note closes or dispositions non-runtime rows from `Plans/.audits/fable-20260706/fable_remaining_action_plan.jsonl` that route to this file. It is product prose/spec hygiene only: it creates no WorkNodes, NodeSeeds, queues, runtime artifacts, implementation files, production build tasks, final manifests, or PNC-019 receipts, and it does not mark `buildability_gate_passed` true.

- `registry_line 331` (explicitly_deferred; source line 1126; `sfk-fa0b68afddc10ec875a0b183`): Explicitly deferred: closing this row requires a dedicated owner-doc/schema/detail lane beyond safe non-runtime hygiene; no buildability or runtime proof is claimed here. Source summary: - [CRITICAL] whole doc: every ATS PlanUnit is prose pointing at generic validators no concrete IPC schema, adapter interface, or `TestRunReceipt` file format anywhere.
- `registry_line 332` (explicitly_deferred; source line 1127; `sfk-bd4e3c4facbc54e0a68a60c8`): Explicitly deferred: closing this row requires a dedicated owner-doc/schema/detail lane beyond safe non-runtime hygiene; no buildability or runtime proof is claimed here. Source summary: - [CRITICAL] whole doc: zero GUI wiring despite steer explicitly asking for GUI result surfacing no command IDs, panel layout, or button states for watching/viewing test results.
- `registry_line 333` (explicitly_deferred; source line 1128; `sfk-a86063e06fec52acf396acb6`): Explicitly deferred: closing this row requires a dedicated owner-doc/schema/detail lane beyond safe non-runtime hygiene; no buildability or runtime proof is claimed here. Source summary: - [HIGH] 6 (L279-281): entire document is gated behind an undefined future "runtime_disabled enabled" event with no trigger criteria.

<!-- FABLE_REMAINING_ACTION_PLAN_REPAIR_20260708_END -->

## Known-37 owner-oracle materialization and execution-status ledger - 2026-07-18

This is canonical acceptance/test-spec prose. `STATICALLY_MATERIALIZED` means the closed Plans contract exists and was checked structurally in this transaction; it is not a fixture, runtime, gate, harness, or certification pass. Every behavioral acceptance case remains `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION`; no unchanged checker demonstrated execution of those cases here.

### Static materialization accounting

- `K37-STATIC-01` — `STATICALLY_MATERIALIZED` — The exact 31 authorized new JSON paths exist and parse; the 21 Goal roots and nine standalone schemas are Draft 2020-12 meta-valid; the catalog data validates.
- `K37-STATIC-02` — `STATICALLY_MATERIALIZED` — All 21 Goal roots are self-contained, closed, select their exact event const and schema ID, and carry mechanically identical common definitions.
- `K37-STATIC-03` — `STATICALLY_MATERIALIZED` — The historical Known-37 event-family slice validates at 2.0.0 / 2026-07-18.2 / RET-K37-ASSIGNMENT-001@1.0.0; exactly 37 rows in that bounded slice have revision 2.0.0 and the 23/4/5/3/1/1 retention distribution. This is not a currentness claim for the live 39-row revision `2026-08-04.1`.
- `K37-STATIC-04` — `STATICALLY_MATERIALIZED` — The storage registry validates against the unchanged schema, has exactly 24 policy IDs, and contains the exact requested_effective_runtime and recovery_unavailable_resolution_receipt rows once in both required-family arrays.
- `K37-STATIC-05` — `STATICALLY_MATERIALIZED` — The seven governed v1 reader definitions are byte-semantic deep-equals of the prior active inline definitions, while the seven active roots are v2 writer-only registry selections.
- `K37-STATIC-06` — `STATICALLY_MATERIALIZED` — The two recovery commands each have one exact wiring row, sole runtime handler, typed request/result reference, receipt effect, empty expected-event set, and blocked-state admission prose.
- `K37-STATIC-07` — `STATICALLY_MATERIALIZED` — The retained-inline remaining-nine row schemas and their owner/consumer clauses form a 37/37 historical KNOWN-KERNEL STATIC contract-depth account; the source-dated at-least-248 confirmed persisted-unregistered floor, at-least-40 unresolved exact rows, 68 exclusions, and `UNKNOWN_OPEN` complete denominator remain explicit residuals, and no runtime, fixture, gate, shard, harness, certification, buildability, or closure result is inferred.

### Goal Runtime v2 event acceptance oracles

- `EA-UND-0001-GOAL-POS` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Append a permission block with exact permission evidence, ordered action IDs containing `request_approval`, and matching CAS; projection becomes `blocked` and exposes the exact cause/safe action.
- `EA-UND-0001-GOAL-NEG` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Reject unknown blocker/reason/action, missing cause/scope, action set not containing next action, generic `try_anyway`, or block from a terminal state.
- `EA-UND-0002-GOAL-POS` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Cancel a running mutated Goal only after referenced settlements are durable; projection becomes terminal `cancelled`.
- `EA-UND-0002-GOAL-NEG` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Reject `mutation_started=false` with rollback refs, true with empty settlement refs, missing cancellation scope, or cancellation of terminal Goal.
- `EA-UND-0003-GOAL-POS` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Record a child `running->completed` edge with receipt ref; parent revision advances while parent status remains unchanged.
- `EA-UND-0003-GOAL-NEG` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Reject equal/unknown child states, completed child without receipt, illegal child edge, or any attempt to set parent completion in this payload.
- `EA-UND-0004-GOAL-POS` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — From `verifying`, validate canonical completion receipt, exhaustive satisfied/not-applicable criteria, passing/waived validators, then commit `completed`.
- `EA-UND-0004-GOAL-NEG` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Reject missing/corrupt receipt, unsatisfied/deferred criterion, failed/blocked/unwaived skipped validator, worker claim, projection substitute, or wrong source state.
- `EA-UND-0005-GOAL-POS` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Create previously absent Goal at revision 1 with verified control-envelope hash, non-empty criteria, exact scope/budget/model policy; projection is `created`.
- `EA-UND-0005-GOAL-NEG` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Reject expected revision, revision other than 1, duplicate Goal ID, hash mismatch, null optional, unknown enum, or write scope without authority evidence.
- `EA-UND-0006-GOAL-POS` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Record a standard-tier no-mutation optional-check degradation with risks/actions and exception evidence; projection is `degraded`, not success.
- `EA-UND-0006-GOAL-NEG` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Reject empty risks/actions, strong-tier required-check degradation, missing exception/approval proof, degradation from a fenced/terminal state, or any completion claim.
- `EA-UND-0007-GOAL-POS` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Capture current source evidence with valid span/hash and matching outer/inner redaction; evidence index advances while state is preserved.
- `EA-UND-0007-GOAL-NEG` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Reject wrong hash syntax, invalid locator branch, artifact snapshot without snapshot ref, raw secret, redaction mismatch, unknown currentness used as proof, or any retention value invented by fallback.
- `EA-UND-0008-GOAL-POS` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Append `scheduled->running` with a non-empty task delta and artifact hashes; second identical fingerprint includes repeat count/marker and remains visible.
- `EA-UND-0008-GOAL-NEG` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Reject disallowed state pair, empty task delta, repeat>=2 without marker, marker with repeat<2, stale status_before, or use of progressed to claim blocked/completed.
- `EA-UND-0009-GOAL-POS` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Record a validated verification or completion receipt with complete child/WorkNode refs and passing outputs; state remains unchanged.
- `EA-UND-0009-GOAL-NEG` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Reject missing receipt, invalid certifier enum, certified decision with failed output, exception without approval, incomplete declared dependency receipts, or treating receipt-recorded as Goal completion.
- `EA-UND-0010-GOAL-POS` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Replan running Goal for scope reduction, decide every affected child, preserve only revalidated evidence, and commit `running` at the new revision.
- `EA-UND-0010-GOAL-NEG` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Reject new revision mismatch, missing/extra child decision, unknown interruption/action, stale evidence, terminal/limit source, or child steering without referenced disposition.
- `EA-UND-0011-GOAL-POS` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Schedule a created Goal with `dispatch`, due eligibility, queue, budget snapshot, writer storage, current permission, and resolved recovery truth.
- `EA-UND-0011-GOAL-NEG` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Reject dispatch without queue/due time/admission evidence, unknown priority/reason/action, stale CAS, viewer/blocked storage, unknown recovery, or scheduling a terminal Goal.
- `EA-UND-0012-GOAL-POS` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Stop a running Goal at a validated safe point after durable child/tool settlement, with `resumable=true`; projection is fenced `stopped`.
- `EA-UND-0012-GOAL-NEG` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Reject resumable without safe point, before-mutation with settlements, unsettled after-mutation as resumable, unknown stop reason/boundary, or treating stop as cancellation/completion.
- `EA-UND-0013-GOAL-POS` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Record a permission check `blocked/approval_required` by output/log refs and block evidence; state is preserved pending named block event.
- `EA-UND-0013-GOAL-NEG` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Reject embedded tool output/secret, failed/unknown without log, approval-required without evidence, deny+passed, unknown check enum, or direct state mutation.
- `EA-UND-0014-GOAL-POS` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Apply one exact scope delta with previous/new revision relation, mark affected child stale, and fence dispatch pending replan.
- `EA-UND-0014-GOAL-NEG` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Reject zero deltas, revision mismatch, child in active and stale sets, malformed delta branch, update during verifying/terminal, or implicit child re-steer.
- `EA-UND-0015-GOAL-POS` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Record passed verification with cycle ID, verifier, closures, no findings/risks; projection is `verifying` and still awaits completion event.
- `EA-UND-0015-GOAL-NEG` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Reject no cycle ID, passed with findings/risks, failed without finding, blocked without risk/block evidence, third repeated strong failure without adjudicator, or implicit completion.
- `EA-UND-0016-GOAL-POS` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Block a running GoalRun with validated block receipt, preserved work, exact scope and owner-valid action set; projection becomes `blocked`.
- `EA-UND-0016-GOAL-NEG` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Reject missing receipt, empty actions, invalid recovery action, preserved mutation omitted, blocked update with no new evidence, or block from terminal/stopped run.
- `EA-UND-0017-GOAL-POS` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Cancel a running mutated GoalRun after durable settlement/rollback evidence; projection becomes terminal `cancelled`.
- `EA-UND-0017-GOAL-NEG` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Reject activation-aborted with mutation, false mutation with refs, true mutation without settlement, terminal source, or settlement self-report without referenced record.
- `EA-UND-0018-GOAL-POS` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — From `verifying`, validate certification receipt, complete WorkNode receipts, passing/waived validators, empty risks, and commit `certified`.
- `EA-UND-0018-GOAL-NEG` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Reject worker/projection claim, missing receipt, incomplete WorkNode refs, certified with risks, exception without risk+approval, failed validator, or wrong source state.
- `EA-UND-0019-GOAL-POS` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Replan failed-verification run to a distinct WorkGraph, increment generation, disposition every affected node, and commit `repairing`.
- `EA-UND-0019-GOAL-NEG` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Reject same graph refs, skipped generation, unpaired affected node, unknown disposition/action, ready/terminal source, or WorkNode dispatch from this event itself.
- `EA-UND-0020-GOAL-POS` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — At `start_event_pending`, validate activation receipt and exact accepted active requests, append once, then atomically expose `active/running`. Alias `GoalRunStarted` normalizes with evidence.
- `EA-UND-0020-GOAL-NEG` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Reject partial/mixed required set, mutation requests under read-only mode, missing authority/identity/budget/storage proof, `BuildStarted`, duplicate with different digest, or any pre-append dispatch/charge.
- `EA-UND-0021-GOAL-POS` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Stop a running GoalRun with settled children and validated safe point; projection becomes fenced resumable `stopped`.
- `EA-UND-0021-GOAL-NEG` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Reject resumable without safe point/current admission evidence, unsettled child work, unknown reason, terminal source, or silent resume without new valid replan revision.

### Goal Runtime common outcomes

- `GOAL-COMMON-01` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Wrong/missing row schema ID, wrong event const, extra property, null in non-null field, unknown enum, malformed conditional branch => Reject validation; append nothing.
- `GOAL-COMMON-02` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Outer/inner project, account, actor, correlation, causation, event type, schema, run, or optional thread join conflict => Reject `identity_mismatch`; append nothing.
- `GOAL-COMMON-03` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Missing foreign ref or referenced record fails its owner schema/currentness check => Reject `unresolved_reference`; append nothing.
- `GOAL-COMMON-04` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Stale `expected_goal_revision` => Return `revision_conflict`; append and projection unchanged.
- `GOAL-COMMON-05` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Duplicate same identity/digest => Return original durable result; no second append/transition/side effect.
- `GOAL-COMMON-06` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Duplicate same identity/different digest => Return `idempotency_conflict`; append and projection unchanged.
- `GOAL-COMMON-07` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Dedupe proof unavailable => Return `dedupe_unavailable`; append nothing, schedule nothing, certify nothing.
- `GOAL-COMMON-08` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Unknown event/schema/version or unsupported EventRecord reader => Quarantine/refuse live projection without checkpoint advance; no best-effort history.
- `GOAL-COMMON-09` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Raw or unhandled secret => Reject before append; no redaction transform is used to legitimize the write.
- `GOAL-COMMON-10` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Illegal lifecycle edge or terminal-state mutation => Reject `illegal_transition`; append nothing.
- `GOAL-COMMON-11` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Storage `viewer` => Frozen historical read only at one proven high-water mark; no producer, scheduler, projector writer, receipt writer, permission action, provider call, or durable/external mutation.
- `GOAL-COMMON-12` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Storage/root/integrity/recovery truth unknown => Goal/GoalRun is blocked or remains unknown; no mutation/certification. A disposable survivor projection may be `degraded` only with explicit recovery provenance and never as receipt authority.
- `GOAL-COMMON-13` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Permission denial/approval required => Named `goal.blocked`/`goal_run.blocked`, exact permission evidence and actions; never failed or complete; approval cannot widen a Storage/FileSafe block.
- `GOAL-COMMON-14` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Verifier unavailable => Lightweight may degrade with receipt/evidence; standard only if no mutation/required check affected; strong blocks. Never silently certifies.
- `GOAL-COMMON-15` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Unknown consequential choice outside `EA-DEV-K37-001` => Record `SAME_CLASS_BLOCKER` and stop before choosing.

### Known-37 retention assignment acceptance matrix (RET-K37-ASSIGNMENT-001@1.0.0)

- `P1` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — **Catalog topology:** exactly one active catalog exists at `storage_value_registry.json#/retention_policies`; baseline 21 plus the three exact additions equals 24 unique IDs.
- `P2` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — **Schema closure:** the event-family registry root requires `RET-K37-ASSIGNMENT-001@1.0.0`; every family requires the closed three-field ref; additional ref fields fail.
- `P3` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — **Historical Known-37 set equality:** obligation IDs are exactly `EA-UND-0001-RET..EA-UND-0037-RET`; application IDs are exactly `EA-PA-0001..0037`; every accepted event/family pair occurs once; assignment counts are exactly `23+4+5+3+1+1=37`. This oracle does not claim equality with the live 39-row registry.
- `P4` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — **Referential equality:** every ref resolves to exactly one policy record at version `1.0.0`; all record fields equal §3 or existing accepted canon.
- `P5` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — **Runtime fixture:** `run.started`, `goal_run.started`, and `goal_run.replanned` resolve to 31,536,000 seconds after `run_completion`, 1,000,000/run plus 5,000,000/project, hold protection, successor compaction.
- `P6` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — **Seglog fixture:** `seglog.event_appended` resolves to 604,800 seconds from creation, 500,000/instance, and compact-only expired unheld rows.
- `P7` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — **Restore fixture:** all five `restore_point.*` rows resolve to the project-resolvable release-anchored policy; `restore_point.expired.payload.retention_policy_ref` equals its row policy ID.
- `P8` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — **Authority fixture:** blocked, receipt, audit, certification, deletion-tombstone, hold, integrity, and quarantine rows assigned indefinite cannot be count-evicted under pressure.
- `P9` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — **Migration fixture:** exact source revision migrates once, leaves EventRecord bytes/identity unchanged, creates one existing-family migration receipt, and a rerun returns the recorded terminal result without rebinding or semantic duplication.
- `N1` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Reject a missing ref; a scalar ref; an extra ref property; unknown catalog ID; unknown policy ID; wrong policy version; duplicate policy record; or duplicate event assignment.
- `N2` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Reject `RP-DELIVERY-365D` for any runtime row: its terminal-transition anchor and 100,000/project ceiling are non-equivalent.
- `N3` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Reject `RP-SAFEPOINT-90D-AFTER-RELEASE` for the five restore-point rows: their payloads do not require a run identity, so its 64/run primary cap is not deterministically enforceable.
- `N4` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Reject any TTL, anchor, count scope/limit, overflow, hold, or expiry mismatch against the exact record.
- `N5` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Reject policy inference from `goal.*`, `goal_run.*`, `restore_point.*`, `storage.*`, event/family name, producer, owner, filename, key, mtime, payload timestamp, array position, or a similar existing family.
- `N6` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Reject an unapproved outside-kernel event, missing known row, extra row, changed family ID, changed semantic owner, or event-type alias as assignment-set membership.
- `N7` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Reject held-row eviction; count eviction of indefinite authority; expiry before inclusive `anchor + ttl`; or compaction while a legal, recovery, preserved/recent-run, live-ref, backup, rollback, or maintenance anchor remains.
- `N8` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Reject payload/row conflation: `storage.retention_hold_changed.payload.policy_ref` cannot replace the row ref; `goal.evidence_captured` payload policy cannot shorten the row policy; `restore_point.expired` cannot acknowledge a mismatched payload policy.
- `N9` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Reject a same-revision ref mutation, same-version policy rewrite, historical Known-37 migration without exact source currentness/backup/receipt, partial Known-37 publication, or a blocked/rolled-back migration exposed as current. This does not authorize publication of the live 39-row registry as complete.
- `N10` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Any unknown, stale, conflicting, non-equivalent, or unprovable case quarantines without checkpoint advance and blocks destructive eligibility. Conservative indefinite preservation is a failure posture, not a fabricated successful ref.

`P6` and `P7` consume the full row-local planned/static catalogs registered under **K37 retained-inline restore and seglog EventRecord oracles**: the `RSC-*`, `RSD-*`, `RSE-*`, and `SEA-*` sets plus the `restore_point.applied` first/replay/refused/failed/source-preservation cases. Retention lookup alone cannot satisfy their payload, envelope, transition, replay, no-append, or zero-effect obligations, and none is executable or passed by this prose registration.

### Platform capability positive and negative oracles

- `CAP-POS-001 catalog ref resolves` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Active catalog revision `1` contains one cited active entry; the complete `PlatformCapabilityRef` resolves uniquely and schema validation passes.
- `CAP-POS-002 live precedence` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Valid live evidence says `supports_available`, valid provider/static evidence says `supports_unavailable`; result is `effective_state=available`, `degradation_reason=none`, `resolution_source=live_runtime_discovery`, while all three refs remain in precedence order.
- `CAP-POS-003 provider fallback` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Live evidence is absent because the entry does not require/produce it, valid provider evidence says `supports_degraded`; result is `degraded`, `provider_policy_limited`, selected provider ref.
- `CAP-POS-004 static fallback` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — No higher allowed source exists and valid static evidence says `supports_degraded`; result is `degraded`, `static_baseline_only`, selected baseline ref.
- `CAP-POS-005 explicit negative` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Selected live evidence says `supports_unavailable`; result is `unavailable`, `runtime_absent`, never `unknown`.
- `CAP-POS-006 not requested` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — `requested_state=not_requested` yields only `effective_state=not_evaluated`, `degradation_reason=none`, null selection fields, and an empty evidence array.
- `CAP-POS-007 deterministic bytes` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Two evaluations with byte-identical frozen catalog and evidence inputs produce identical sorted evidence, payload canonical JSON, and EventRecord producer semantic digest.
- `CAP-POS-008 historical replay` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — An event referencing a known superseded immutable revision validates and replays against that revision without recomputation against the active revision.
- `CAP-POS-009 admitted legacy alias` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — One owner-approved `capability_key` alias and complete typed evidence sidecar normalize to the exact v2 ref/payload and record migration provenance.
- `CAP-POS-010 scope identities` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Application evaluation persists outer `project_id=null`; project evaluation persists its one exact project ID; neither duplicates the field inside the payload.
- `CAP-NEG-001 open capability identity` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — raw `capability_key`, display name, unknown ID, or missing catalog tuple used instead of `capability_ref`
- `CAP-NEG-002 stale new-write revision` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — new evaluation begins with a superseded, retired, missing, or mutated catalog revision
- `CAP-NEG-003 unknown requested/effective token` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — provider/model `supported`, legacy boolean/string, `unknown`, or any value outside the two target enums
- `CAP-NEG-004 illegal state pair` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — `not_requested/available`, `required/not_evaluated`, or any nonlisted requested/effective pair
- `CAP-NEG-005 illegal reason product` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — `available/runtime_partial`, `degraded/none`, or reason/source mismatch
- `CAP-NEG-006 insufficient unavailable proof` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — `effective_state=unavailable` with missing evidence or a selected finding other than `supports_unavailable`
- `CAP-NEG-007 evidence ref mismatch` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — provider source paired with runtime receipt, duplicate source kind, selected ref absent from the array, or wrong subject/revision
- `CAP-NEG-008 stale or unverified evidence` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — provider/model `stale|unverified`, mutable local path, missing source revision, or current-time substitution
- `CAP-NEG-009 raw secret` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — token, credential, OAuth value, account root, or other secret-bearing evidence content instead of a ref
- `CAP-NEG-010 same-source owner conflict` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — two live receipts disagree for the same subject and frozen revision
- `CAP-NEG-011 legacy analogy` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — value imported from retired `platform_specs`, fixture-only data, or provider/model enum without registered owner mapping
- `CAP-NEG-012 ambiguous migration` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — absent requested string, unknown alias, raw legacy evidence string without typed sidecar, or payload/outer identity disagreement
- `CAP-NEG-013 extra or omitted field` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — any additional payload/catalog/ref property or omission of a required nullable field
- `CAP-NEG-014 scope conflict` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — application scope with non-null project, project scope without a project, or conflicting outer/payload legacy project identities

### Restore-point corruption owner oracles

- `EA-OC-004-POS-01` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — An `available` same-project record with two unequal valid record hashes, no referenced-material fields, matching `record_hash_comparison` evidence, and no extras validates and emits exactly one `record_hash_mismatch` event with `status=corrupt`.
- `EA-OC-004-POS-02` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Present hashable record bytes with `expected_hash=null`, valid `observed_hash`, a reproducible decode/schema failure, no referenced-material fields, and matching `record_decode_failure` evidence validate and emit exactly one `unreadable_record` event.
- `EA-OC-004-POS-03` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — A valid `available` record with equal record hashes, one present canonical material ref, all four material comparison fields, at least one unequal comparison pair, and matching integrity evidence validates and emits exactly one `corrupt_referenced_material` event.
- `EA-OC-004-POS-04` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — A valid `available` record with equal record hashes, one present canonical material ref, no material comparison fields, and matching scope evidence proving the item is outside supported scope validates and emits exactly one `unsupported_content_scope` event.
- `EA-OC-004-POS-05` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Re-delivery under the same Contracts-owned EventRecord identity and same semantic digest returns the original append result and creates no second semantic event; same identity with a different digest is `idempotency_conflict`.
- `EA-OC-004-POS-06` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — `MIG-RESTORE-POINT-CORRUPT-PAYLOAD-001@1.0.0` selects the exact local v1-reader pointer for a frozen `/1.0.0` `record_hash_mismatch`, `corrupt_referenced_material`, or `unsupported_content_scope` payload and, with exactly one immutable identity-matching evidence result satisfying section 7.1, produces the exact root-`#` `/2.0.0` compatibility value for the same event identity while the v1 source bytes and semantic event count remain unchanged.
- `EA-OC-004-NEG-01` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Missing canonical restore-point record produces no corrupt event and no corrupt state claim.
- `EA-OC-004-NEG-02` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Valid record with a ref whose target is absent produces no corrupt event; it stays on the separate missing/unavailable path and the record remains `available`.
- `EA-OC-004-NEG-03` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — `reason_code=missing_material`, any fifth token, any generic string, or any alias is rejected/quarantined.
- `EA-OC-004-NEG-04` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Remove each required field once; add each forbidden field once; replace each non-null field with null once. Every case is rejected without append/checkpoint advance.
- `EA-OC-004-NEG-05` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Swap any `evidence_kind` between reason rows, use an unresolved/stale evidence ref, or make evidence identity disagree with project/restore/material identity. Every case is rejected/quarantined.
- `EA-OC-004-NEG-06` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Use equal record hashes for mismatch, unequal record hashes for a referenced-material branch, or equal material hashes and lengths for corrupt material. Every case is rejected as a wrong branch.
- `EA-OC-004-NEG-07` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Use a wrong project, non-`available` record, ambiguous ref, unknown `referenced_material_field`, or additional payload property. Every case is rejected.
- `EA-OC-004-NEG-08` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Put raw record/material bytes, secret data, credential values, local absolute paths, or an unhandled secret inside the event/evidence ref. Every case is rejected/quarantined.
- `EA-OC-004-NEG-09` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Simultaneously make the record hash mismatch and decode fail; the result must be `record_hash_mismatch`, proving the fixed precedence. Simultaneously corrupt referenced material and make it unsupported; the result must be `corrupt_referenced_material`.
- `EA-OC-004-NEG-10` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Make record/material availability or integrity indeterminate through I/O failure. The result is unknown/quarantined, not missing, unreadable, or corrupt.
- `EA-OC-004-NEG-11` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Attempt a new `/1.0.0` write; mutate the frozen v1 object; alias v1 to v2; use any carrier path, pointer, schema ID, or upgrader identity other than section 3.1; upgrade without exactly one identity-matching immutable evidence result; map a v1 `unreadable_record` while its string `expected_hash` is asserted as trustworthy; omit any v2-required value; retain duplicate inline/ref schemas; or publish the payload successor outside packet 002's complete registry/family-revision transaction. Every case quarantines with `reason=restore_point_corrupt_v1_upgrade_unresolvable` without append or checkpoint advance.

### run.started owner oracles

- `RUN-P01` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Exact no-fallback regular start. A regular run with no explicit strategy request, legal `none` overlay, matching requested/effective platform/model/Persona, a valid account pair, and a complete matching snapshot appends one event with `requested_strategy = null`, `strategy = hte`, and `strategy_resolution_reason = regular_hte_default`.
- `RUN-P02` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Regular DAE allowed. A regular run with `requested_strategy = dae` and snapshot evidence `dae_allowed == true` appends one event with `strategy = dae` and `regular_dae_allowed`.
- `RUN-P03` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Regular DAE deterministic fallback. A regular run with requested DAE and owner evidence `dae_allowed != true` appends one event with `strategy = hte`, `regular_dae_disallowed`, and unchanged requested DAE truth.
- `RUN-P04` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Yolo DAE. A yolo run with a DAE-capable effective platform appends one event with `strategy = dae` and `yolo_requires_dae`.
- `RUN-P05` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Provider/model/account/Persona fallback. An admitted run with unequal requested/effective joins appends only when the complete snapshot contains owner-valid deterministic evidence for every difference and the inline joins match the resolved snapshot exactly.
- `RUN-P06` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Non-account-backed route. A valid server/profile-backed route appends with both account ID keys present and `null`, while account binding/auth evidence remains in the complete snapshot.
- `RUN-P07` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Replay. Re-delivery of the same semantic start under the same scoped idempotency identity returns/reuses the existing event and preserves one durable start.
- `RUN-P08` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Envelope equality. A project/run/thread/time/account-ref instance whose repetitions and resolutions all agree appends and projects without normalization changes.
- `RUN-P09` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Machine target resolution. A full `pm.requested_effective_runtime@1.0.0` record whose key equals `snapshot_ref`, project partition and ID parse exactly, digest recomputes, every owner ref resolves, and every inline value agrees validates under both the standalone schema and the identical storage-registry value schema.
- `RUN-P10` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Historical stability. After current mode, model, account, provider, or Persona settings change, replay of the event resolves the original stored key and returns the original snapshot bytes and joins; no current value appears in the historical result.
- `RUN-P11` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Governed legacy upgrade. A frozen v1 payload with a section-4 ref to an already-complete immutable target upgrades through `MIG-RUN-STARTED-PAYLOAD-001@1.0.0` to the exact v2 replay representation, preserves source bytes and EventRecord identity, records migration lineage, and does not append another semantic start.
- `RUN-P12` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Coordinated row. The current `event-family-run-started` row is accepted only with packet-002 family/registry revision and retention ref plus packet-005 `/2.0.0` payload schema ref in the same transaction.

### Recovery-unavailable owner-oracle contract

- `P01` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Pre-attempt event: a valid event omits `attempt_id`; its anchor stores `attempt_id = null`; its reason is one exact enum member; its action array equals one exact section-5 array; local work is true and all refs resolve.
- `P02` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Post-attempt event: a valid event requires one non-empty `attempt_id` equal across blocked episode, event, anchor, request, result, and receipt.
- `P03` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Reason coverage: one canonical case for each of the five reason values validates; changing only the reason to an unknown value fails.
- `P04` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Ordering: every admitted list starts `open_details`, then `locate_and_verify_recovery`, then `replan`; conditional fresh attempt appears only between replan and abandonment; `abandon_recovery` is last.
- `P05` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Locate success: current identity/member plus a FileSafe-normalized source and exact owner verification produces `applied`, a committed receipt, `released/resolved`, verified refs/hash/evidence, and no cleanup.
- `P06` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Locate replay: byte-identical request and idempotency key returns the original result/receipt and performs no second release.
- `P07` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Replan release: release occurs only after the existing replan is current-member admitted and durably recorded, with `resolved`.
- `P08` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Fresh successor: conditional membership appears only with all existing isolated baseline preconditions; release waits for a distinct durable successor/baseline receipt and uses `superseded_with_verified_successor`.
- `P09` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Abandon success: current explicit user authority, exact confirmation, preserved-work acknowledgement, and committed receipt produce `released/abandoned_by_user`, with `cleanup_performed = false`.
- `P10` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — UI projection: every GUI/chat/graph/orchestrator consumer renders the exact ordered array and dispatches through the one catalog mapping; the shared UI response points to the domain result and owner receipt.

### run.started negative oracles

- `RUN-N01` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Reject a missing or empty `requested_effective_snapshot_ref`, an unresolvable target, or a compatibility/thin target that lacks any required requested/effective domain.
- `RUN-N02` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Reject inline/snapshot mismatch for any mode, overlay, strategy, platform, model, account, Persona, project, run, thread, or time value.
- `RUN-N03` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Reject omitted required nullable keys; `requested_strategy`, `requested_account_id`, and `effective_account_id` must be present even when `null`.
- `RUN-N04` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Reject `null` for every non-null field and reject empty strings for every ID/ref.
- `RUN-N05` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Reject a fifth runtime mode, eighth overlay, third strategy, seventh strategy-reason token, unknown alias, extra property, or generic free-string reason.
- `RUN-N06` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Reject `requested_strategy = dae` in ask/plan and reject `requested_strategy = hte` in yolo.
- `RUN-N07` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — For yolo with `dae_allowed != true`, fail before provider spawn with `yolo_requires_dae_provider`; assert that no `run.started` event exists.
- `RUN-N08` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Reject any mode/overlay pair outside section 5.2, including debug with ask/plan and plan/deep_plan with regular/yolo.
- `RUN-N09` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Reject an unexplained unequal runtime-mode or overlay pair.
- `RUN-N10` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Reject an unequal platform/model/account/Persona pair without owner-valid evidence in the complete snapshot.
- `RUN-N11` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Reject noncanonical model display labels, provider-native account labels as account IDs, and `_persona_id` field aliases.
- `RUN-N12` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Reject a non-account-backed route with either account ID non-null, and reject an account-backed admitted run with `effective_account_id = null`.
- `RUN-N13` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Reject payload/envelope project, run, thread, timestamp, or account-ref disagreement; do not repair either side.
- `RUN-N14` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Reject raw secrets/auth values/local paths in either inline fields or the referenced snapshot.
- `RUN-N15` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Reject a second append for the same semantic start; quarantine an idempotency-key reuse with a different semantic digest.
- `RUN-N16` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Reject fixture-only values or current-settings replay reconstruction not attested by an owner/source derivation.
- `RUN-N17` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Reject a target with the wrong schema path, `$id`, `schema_id`, `schema_version`, key prefix, project partition, snapshot ID grammar, digest grammar, digest value, or key/ref equality; reject a same-key different-byte write as `requested_effective_runtime_identity_conflict`.
- `RUN-N18` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Reject a target missing any required-present field or any of the six owner refs; reject syntactically present but historically unresolvable owner refs, a missing storage-registry registration, a thin `execution_unit_context`, or a ref that resolves only by filesystem/current-project discovery.
- `RUN-N19` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Reject reconstruction or backfill from current settings, current provider/model catalogs, current account choice, current Persona, or current runtime policy after target loss; report historical unavailability and quarantine instead.
- `RUN-N20` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Reject new writes using payload `/1.0.0`, a v1 payload with invented defaults, an in-place v1 rewrite, or a v1 upgrade without an exact complete section-4 target; use `run_started_v1_upgrade_unresolvable` and do not advance projection.
- `RUN-N21` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — Reject a packet-002/005 split row: v2 family with v1 payload, v2 payload with family revision 1.0.0 or missing retention ref, duplicate embedded and referenced payload schemas, or any payload schema ID/ref mismatch.

### Recovery-unavailable negative oracles

- `N01` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — pre-attempt event/request/result with any `attempt_id`, including null or synthesized text;
- `N02` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — post-attempt event/request/result missing `attempt_id`, carrying null/empty, or disagreeing with the current prior attempt;
- `N03` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — unknown or missing reason; wrong reason-to-current-event equality; or promotion of `state_changed`, `safe_point_missing`, `baseline_stale`, or another nearby token;
- `N04` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — empty/duplicate/unordered action list, absent current membership, or any forbidden member;
- `N05` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — `start_fresh_attempt` membership without a fully satisfiable isolated non-safe-point target contract;
- `N06` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — restore or ordinary retry while the anchor is `recovery_unavailable`;
- `N07` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — stale blocked sequence, anchor, snapshot set, reason, permission, or projection;
- `N08` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — raw path/raw bytes/moving ref as `recovery_source_ref`, or owner verification with missing identity/equality evidence;
- `N09` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — locate result claiming applied with uncommitted/missing receipt, no verified hash/evidence, a non-null reason, or a non-released anchor;
- `N10` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — abandonment without actor-bound durable confirmation, exact confirmation constant, preserved-work acknowledgement, current membership, or committed receipt;
- `N11` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — abandonment mapped to `abort_run`, cleanup, deletion, worktree detachment, or a higher-level terminal state;
- `N12` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — conflicting reuse of an idempotency key or replay that changes result, receipt, release reason, actor, source, or snapshot refs;
- `N13` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — failed/refused/unknown domain result projected as UI success;
- `N14` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — age, exit, archive, run completion, worktree unbinding, compaction, retention pressure, or cleanup releasing the anchor;
- `N15` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — any new EventRecord family, generic `*.command_applied` event, FileSafe-local command namespace, or second handler.


### Storage boot, integrity, and recovery owner oracles

- `BR-P01` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — all six enum members validate in otherwise conforming fixtures and map one-to-one to the six approved semantic classes.
- `BR-P02` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — two input permutations normalize to identical ordered arrays and the same `recovery_set_id`; the persisted payload is already canonical.
- `BR-P03` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — same-episode retry returns the byte-equivalent prior result/EventRecord and append count remains one.
- `BR-P04` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — a later episode with the exact same semantic work set has a higher epoch, new set ID, and direct `repeat_of` to the earliest event.
- `BR-P05` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — a final active-segment ref resolves to the manifest row/hash and projector admission occurs only after reconciliation and durable barrier append.
- `BR-N01` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — unknown, generic repair/salvage, maintenance-enum-only, duplicate, empty, unsorted, or more-than-bound items reject.
- `BR-N02` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — negative generation/epoch, noncanonical decimal, malformed segment ref, `opening` presented as writable final state, or ref/hash/manifest mismatch rejects.
- `BR-N03` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — no integrity/recovery evidence, a kind not attested by evidence/journal, or a referenced result from another storage instance rejects.
- `BR-N04` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — same set ID/different input is conflict; same-episode duplicate append rejects; later exact repeat without `repeat_of`, with a chain, or pointing anywhere but the earliest matching event rejects.
- `BR-N05` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — CRC/range, survivor, recovery-aftermath, or disclosure fields attributed to this event reject; projector/mutation admission before durable convergence rejects.
- `IN-P01` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — seeded bit flips at prefix, header, payload, segment, manifest, watermark, and sequence boundaries yield the exact corresponding token only after the required evidence verifies.
- `IN-P02` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — a header-CRC mismatch includes both uint32 CRCs, exact byte precision, no event refs, and reproducible offsets.
- `IN-P03` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — a payload-CRC mismatch with verified header identity may use `exact_event` and carries matching byte, one-sequence, and event-ref evidence.
- `IN-P04` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — no later candidate produces `unknown_segment_remainder`, EOF as `next_good_offset`, the exact remainder byte tuple, no invented sequence/event identity, and a conservative watermark relation.
- `IN-P05` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — identical evidence and content-addressed report return the same `integrity_id` and original event.
- `IN-N01` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — unknown/alias failure, segment, watermark, or precision member rejects; similarly named maintenance enums are not aliases.
- `IN-N02` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — lone CRC, out-of-range CRC, CRC on a forbidden class, impossible offsets, empty/reversed range, unsorted/duplicate refs, or precision/field mismatch rejects.
- `IN-N03` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — header failure with event refs, exact-event precision without verified frame identity, or fabricated advisory-index identity rejects.
- `IN-N04` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — possible acknowledged loss labeled wholly-above, manifest overriding disagreeing bytes, or unknown remainder converted to exact/bounded proof rejects and blocks mutation.
- `IN-N05` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — recovery action, survivor, receipt, disclosure, `repeat_of`, or projector/checkpoint effect attributed to detection rejects.
- `RA-P01` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — each six-action fixture validates only its exact matrix row, exact checkpoint/projection pair, integrity-link rule, and disclosure value.
- `RA-P02` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — truncation changes length/hash exactly to the verified prefix, records the exact tail range, stays wholly above watermark, and preserves the verified checkpoint.
- `RA-P03` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — proven exclusion leaves bytes unchanged, changes manifest authority, records exact ranges/gaps, yields the reproducible survivor digest, and forces derived-state rebuild.
- `RA-P04` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — verified backup restore round-trips hashes/length/boundary evidence and sets disclosure from the exact rollback-loss condition.
- `RA-P05` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — identical canonical recovery input returns the original receipt/event with one physical effect and one semantic append.
- `RA-P06` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — barrier receipt and event append precede any permitted projector resume/rebuild or mutation admission.
- `RA-N01` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — unknown/alias action, checkpoint, or projection member; forbidden action/aftermath combination; generic repair/salvage; or maintenance-enum substitution rejects.
- `RA-N02` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — missing/mismatched integrity link, adoption carrying a link, truncation not wholly above watermark, block action with changed bytes/manifest, or exclusion with unknown precision rejects.
- `RA-N03` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — noncanonical, overlapping, reversed, duplicate, or over-bound ranges/gaps; recovery use of `retention_compaction`; false hash/length; or unverifiable survivor rejects.
- `RA-N04` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — missing/unsynced/circular self-append receipt, receipt/result mismatch, suppressed required disclosure, or backup-loss disclosure false rejects.
- `RA-N05` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — same recovery ID/different canonical input is conflict; retry with a second physical effect/event rejects; third-state crash ambiguity blocks.
- `RA-N06` — `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION` — projector start/checkpoint advance before convergence, mutation on possible acknowledged loss, fabricated event identity, or advisory index/mtime override rejects.

Deterministic replay, fail-closed quarantine, no checkpoint advance, no duplicate semantic effect, no raw-secret admission, and no authority promotion remain required wherever named above. Static materialization is never substituted for execution evidence.

## Cozy Shelves Panel Reconciliation Addendum - 2026-07-27

This addendum closes the Testing-surface spec gaps exposed by the winning Cozy Shelves left-rail concept (`Concepts/rail-concepts/QwenRailConcepts/c2-cozy-shelves.html` and `c2-cozy-shelves-files.html`, source lineage only; no concept HTML, CSS, or class names are copied into spec). It follows the FABLE addendum pattern of this document: prose intent, then new PlanUnits. No existing PlanUnit block, preserved exact token, canonical text, or retired bridge is edited; supersession is expressed only through the new units' explicit amendment notes. Four things are adjudicated here: (1) the two `cmd.testing.*` command families are reconciled with the UI Command Catalog's Cozy Shelves addendum (UCC-134) - the run-scoped family is canon for runs, the session-scoped family stays a distinct live canon, and the newly minted `cmd.testing.quarantine` / `cmd.testing.quarantine.release` rows are registered as consumed here; (2) the three divergent TestRunReceipt field inventories (ATS-004, ATS-019 host fields, FABLE file format) are merged into one canonical field table of which all three prior inventories become views; (3) the receipt `status` enum gains `skipped` as a first-class distinct status that is never counted as pass, and `blocked` is adjudicated non-terminal with explicit watch/cancel gating; (4) the Testing rail panel gets a presentation contract binding the five FABLE regions to the shared unified expander row contract (owned outside this document by the GUI spec surface; referenced, never re-owned here) and restating the receipt-honesty invariants. The implementation base is the c2 concept files patched in place, and the rail width envelope is 240px minimum / 480px maximum / 280px default with 220px as a test-only adversarial width (user decision 2026-07-27). This addendum does not create WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks.

### Merged TestRunReceipt field schema

The canonical TestRunReceipt is the union below. The ATS-004 inventory, the ATS-019 containerized-host inventory, and the FABLE file format (Test Adapter Interface And TestRunReceipt, 2026-07-08) are henceforth three views of this one schema: none is edited, none is retired, and no view may be cited as the complete schema. `visual_evidence_refs[]` is the canonical spelling; `visual_artifact_refs[]` is the recorded FABLE-file-format compatibility spelling of the same field. `receipt_id` (receipt identity) and `test_run_id` (run identity) are distinct fields and both are required.

| Field | Presence | Source view | Notes |
|---|---|---|---|
| `test_run_id` | required | FABLE file format | run identity |
| `receipt_id` | required | ATS-004 | receipt identity, distinct from `test_run_id` |
| `adapter_id` | required | FABLE file format | |
| `test_kind` | required | FABLE file format | |
| `target_ref` | required | FABLE file format | |
| `started_at_utc` | required | FABLE file format | |
| `ended_at_utc` | required, null until terminal | FABLE file format | null while `queued`, `running`, or `blocked` |
| `status` | required | FABLE file format | enum per ATS-027 below |
| `passed_count` / `failed_count` / `skipped_count` / `error_count` | required | FABLE file format | on `cancelled` these carry the partial counts observed before cancellation |
| `log_artifact_refs[]` | required, may be empty | FABLE file format | |
| `visual_evidence_refs[]` | required, may be empty | ATS-004 / ATS-019 | `visual_artifact_refs[]` is the FABLE compatibility spelling |
| `coverage_ref` | optional | FABLE file format | |
| `failure_refs[]` | required, may be empty | FABLE file format | |
| `schema_version` | required | FABLE file format | |
| `test_strategy_ref` | required | ATS-004 | |
| `test_case_refs` | required | ATS-004 | |
| `generated_test_ids` / `reused_test_ids` | required, may be empty | ATS-004 | |
| `verification_command` | required | ATS-004 | |
| `expected_artifacts` | required | ATS-004 | |
| `evidence_refs` | required | ATS-004 | |
| `flake_policy` | required | ATS-004 | |
| `test_gap_policy` | required | ATS-004 | |
| `host_capability_ref` | required when containerized host used | ATS-019 | |
| `host_profile_id` | required when containerized host used | ATS-019 | or host requirement shape |
| `host_instance_ref` or `host_instance_id` | required when containerized host used | ATS-019 | |
| `host_assignment_ref` or `host_assignment_id` | required when containerized host used | ATS-019 | |
| `runtime_family` | required when containerized host used | ATS-019 | |
| `runtime_context_ref` | required when containerized host used | ATS-019 | |
| `compose_scenario_ref` | optional | ATS-019 | |
| image/build refs | required when containerized host used | ATS-019 | |
| port/access URL refs | required when containerized host used | ATS-019 | |
| preflight receipt ref | required when containerized host used | ATS-019 | |
| launch receipt ref | required when containerized host used | ATS-019 | |
| harness probe receipt ref | required when containerized host used | ATS-019 | |
| cleanup receipt ref | required when containerized host used | ATS-019 | also the artifact-disposition carrier for `cancelled` runs |
| retain-on-failure state | required when containerized host used | ATS-019 | |
| blocker payload | required when blocked | ATS-019 | `blocked_reason_code` plus ordered `allowed_action_ids[]` |

### ATS-025 - Testing Command Family Adjudication And Quarantine Consumption

```yaml
plan_unit_id: ATS-025
unit_type: requirement
status: accepted
owner_doc: Plans/Automated_Testing_System.md
canonical_text: >-
  The run-scoped family cmd.testing.run, cmd.testing.watch_run, cmd.testing.cancel_run, cmd.testing.open_receipt,
  cmd.testing.open_failure, cmd.testing.export_bundle, and cmd.testing.open_panel is the canonical command surface
  for test runs. The session-scoped family cmd.testing.session.open, cmd.testing.session.watch,
  cmd.testing.session.background, and cmd.testing.session.redaction.inspect is a distinct live canon for visible
  test sessions per the 2026-07-02 addendum. Both families stay live, neither aliases the other, and watch_run
  versus session.watch is a scope split, not a duplication - this mirrors and consumes UI_Command_Catalog UCC-134
  rather than re-adjudicating it. cmd.testing.quarantine and cmd.testing.quarantine.release (minted by UCC-134,
  two-step confirmation) are registered here as consumed commands: quarantine is a state mutation over test
  identity, not a run action; it produces its own receipt, changes counting only through the flaky counting
  policy of ATS-028, never deletes or edits any TestRunReceipt, and releases only through its paired command.
  Rerun and rerun-failed-only are affordances over cmd.testing.run carrying rerun_of_receipt_ref and failed_only
  selection arguments; no new command id is minted by this document.
gui_related: true
gui_classification_reason: Adjudicates the user-visible Testing command families and quarantine controls consumed by the Testing rail panel.
depends_on: [ATS-009, ATS-010, UCC-134]
unblocks: [ATS-028]
acceptance_criteria:
  - No alias metadata links the run-scoped and session-scoped testing families, and both remain live.
  - cmd.testing.quarantine and cmd.testing.quarantine.release produce separate receipts, mutate test identity state only, and never delete or mutate TestRunReceipt records.
  - Rerun and rerun-failed-only dispatch through cmd.testing.run with rerun_of_receipt_ref and failed_only arguments rather than new command ids.
  - No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-plans-verify.py validate-wiring-matrix
risk_class: testing_command_family_drift
reasoning_tier: standard
context_scope: cozy_shelves_testing_command_adjudication
implementation_surfaces:
  - Plans/Automated_Testing_System.md
  - Plans/UI_Command_Catalog.md
  - Plans/Wiring_Matrix.md
node_compile_hint:
  mode: cozy_shelves_testing_command_adjudication
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Concepts/rail-concepts/QwenRailConcepts/c2-cozy-shelves.html (Cozy Shelves concept; source-lineage-only)"
  - "Plans/UI_Command_Catalog.md (UCC-134, Cozy Shelves Panel Reconciliation Addendum - 2026-07-27)"
  - "Plans/Automated_Testing_System.md (GUI visible testing repair addendum 2026-07-02; FABLE GUI Result Surfacing 2026-07-08)"
preserved_exact_tokens:
  - "cmd.testing.run"
  - "cmd.testing.watch_run"
  - "cmd.testing.session.watch"
  - "cmd.testing.quarantine"
  - "cmd.testing.quarantine.release"
  - "rerun_of_receipt_ref"
  - "failed_only"
negative_constraints:
  - Do not alias run-scoped testing commands to session-scoped ones or collapse the two families.
  - Do not let quarantine or release delete, edit, or reinterpret any existing TestRunReceipt.
  - Do not mint new cmd.* ids in this document; command minting authority stays with UI_Command_Catalog.md.
owner_hints:
  - Plans/Automated_Testing_System.md
  - Plans/UI_Command_Catalog.md
```

### ATS-026 - Merged Canonical TestRunReceipt Field Schema

```yaml
plan_unit_id: ATS-026
unit_type: requirement
status: accepted
owner_doc: Plans/Automated_Testing_System.md
canonical_text: >-
  The merged TestRunReceipt field table in this addendum is the one canonical TestRunReceipt schema: the union of
  the ATS-004 inventory (receipt_id, test_strategy_ref, test_case_refs, generated_test_ids, reused_test_ids,
  verification_command, expected_artifacts, evidence_refs, visual_evidence_refs, flake_policy, test_gap_policy),
  the ATS-019 containerized-host inventory, and the FABLE file format (test_run_id, adapter_id, test_kind,
  target_ref, started_at_utc, ended_at_utc, status, counts, log_artifact_refs, visual_artifact_refs, coverage_ref,
  failure_refs, schema_version). Amendment note: this supersedes-by-extension the three prior inventories, which
  remain unedited and accurate as views of the merged schema; no prior inventory may be cited as complete.
  receipt_id and test_run_id are distinct required identities. visual_evidence_refs is canonical and
  visual_artifact_refs is its recorded FABLE compatibility spelling. Host fields are required exactly when a
  containerized host is used. A cancelled receipt carries the partial passed/failed/skipped/error counts observed
  before cancellation plus the artifact disposition through the cleanup/retention receipt ref; cancellation
  deletes no receipts and no artifacts outside recorded retention policy.
gui_related: false
gui_classification_reason: This unit owns the receipt data schema; presentation of the receipt belongs to ATS-028.
depends_on: [ATS-004, ATS-019]
unblocks: [ATS-027, ATS-028]
acceptance_criteria:
  - Schema fixtures validate the full merged field table, including presence rules (required, required-when-containerized, required-when-blocked, null-until-terminal) for every field.
  - A receipt satisfying only one prior inventory fails validation whenever the run context requires fields from another view.
  - Cancelled receipts prove partial counts plus artifact disposition, and prove that no receipt or retained artifact was deleted by cancellation.
  - No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - future merged TestRunReceipt schema fixtures
risk_class: test_run_receipt_schema_divergence
reasoning_tier: high
context_scope: cozy_shelves_testrunreceipt_merge
implementation_surfaces:
  - Plans/Automated_Testing_System.md
  - Plans/Contracts_V0.md
  - Plans/Runtime_Artifacts_Panel.md
node_compile_hint:
  mode: cozy_shelves_testrunreceipt_merged_schema
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Automated_Testing_System.md (ATS-004; ATS-019; FABLE Test Adapter Interface And TestRunReceipt 2026-07-08)"
  - "Concepts/rail-concepts/QwenRailConcepts/c2-cozy-shelves.html (Cozy Shelves concept; source-lineage-only)"
preserved_exact_tokens:
  - "TestRunReceipt"
  - "test_run_id"
  - "receipt_id"
  - "test_strategy_ref"
  - "flake_policy"
  - "test_gap_policy"
  - "host_capability_ref"
  - "visual_evidence_refs"
  - "schema_version"
negative_constraints:
  - Do not edit, retire, or fork the three prior inventories; they remain views of the merged schema.
  - Do not allow any single prior view to be cited as the complete TestRunReceipt schema.
  - Do not let cancellation delete receipts or bypass recorded retention disposition.
owner_hints:
  - Plans/Automated_Testing_System.md
  - Plans/Contracts_V0.md
```

### ATS-027 - TestRunReceipt Status Enum Skipped And Blocked Adjudication

```yaml
plan_unit_id: ATS-027
unit_type: requirement
status: accepted
owner_doc: Plans/Automated_Testing_System.md
canonical_text: >-
  The TestRunReceipt status enum is queued, running, passed, failed, skipped, cancelled, blocked, and
  inconclusive. Amendment note: this supersedes-by-extension the FABLE 2026-07-08 status list by adding skipped
  as a first-class distinct status; the FABLE list is not edited. skipped is never counted as, rendered as, or
  aggregated into pass at any level - run, row, rollup, or gate - and a skipped run never satisfies a required
  oracle, matching the existing fail-closed posture. Terminal statuses are exactly passed, failed, skipped,
  cancelled, and inconclusive. blocked is non-terminal: a blocked run keeps watch enabled (view-only), keeps
  cancel enabled subject to permission, does not enable open_receipt terminal affordances, carries the blocker
  payload (blocked_reason_code plus ordered allowed_action_ids[]), and resolves only by transitioning to running,
  cancelled, or another terminal status. blocked is never failed and never pass.
gui_related: true
gui_classification_reason: Status enum membership and terminality directly gate the watch, cancel, and open-receipt affordances users see.
depends_on: [ATS-026]
unblocks: [ATS-028]
acceptance_criteria:
  - Enum fixtures accept exactly the eight members and reject aliases, unknown members, and skipped-as-pass aggregation at every rollup level.
  - Blocked-run fixtures prove watch and cancel remain enabled, terminal-only affordances remain disabled, and the blocker payload carries blocked_reason_code plus ordered allowed_action_ids[].
  - Transition fixtures prove blocked resolves only to running, cancelled, or a terminal status, and that no terminal state transitions further.
  - No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - future merged TestRunReceipt schema fixtures
risk_class: test_status_false_positive
reasoning_tier: high
context_scope: cozy_shelves_test_status_enum
implementation_surfaces:
  - Plans/Automated_Testing_System.md
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: cozy_shelves_test_status_adjudication
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Automated_Testing_System.md (FABLE Test Adapter Interface And TestRunReceipt 2026-07-08; Case L skipped/inconclusive posture)"
  - "Concepts/rail-concepts/QwenRailConcepts/c2-cozy-shelves.html (Cozy Shelves concept; source-lineage-only)"
preserved_exact_tokens:
  - "skipped"
  - "blocked"
  - "inconclusive"
  - "blocked_reason_code"
  - "allowed_action_ids"
negative_constraints:
  - Do not count, render, or aggregate skipped as pass anywhere.
  - Do not treat blocked as terminal, as failed, or as pass.
  - Do not enable terminal-only affordances for a blocked run.
owner_hints:
  - Plans/Automated_Testing_System.md
  - Plans/UI_Command_Catalog.md
```

### ATS-028 - Testing Rail Panel Presentation And Receipt Honesty Contract

```yaml
plan_unit_id: ATS-028
unit_type: requirement
status: accepted
owner_doc: Plans/Automated_Testing_System.md
canonical_text: >-
  The Testing rail panel renders the regions run_list, active_run_detail, failure_list, artifact_preview, and
  redaction_notice inside the rail width envelope of 240px minimum, 480px maximum, 280px default, with 220px as a
  test-only adversarial width (user decision 2026-07-27). Every run row and failure row binds to the shared
  unified expander row contract owned outside this document: collapsed by default, header as a single accessible
  button with aria-expanded, body slot order kv-facts then status-detail then blocked-reason-detail then actions
  then overflow, roughly 200px body cap with internal scroll, blocked reasons always visible outside the
  collapsible body, and destructive actions routed through the shared confirm surface. All row and button states
  derive from TestRunReceipt.status per ATS-027; no panel-local run state is invented. Receipt-honesty
  invariants: receipts are marked stale/retired and visually dimmed when relevant files change after the run or
  when the receipt is rehydrated after app restart, and stale green is visually distinct from fresh green;
  errored (error_count from harness/compile/setup failure) renders distinct from failed and ranks above failed in
  rollups using severity order running > errored > failed > queued > passed > skipped; a run in which zero tests
  executed renders as a warning-state receipt and never green; completed_with_approved_verification_exception
  never renders as passed. Rerun and rerun-failed-only affordances appear on terminal receipts per ATS-025 and
  are hidden or disabled with reason while a run is queued, running, or blocked. Flaky tests show n/m attempt
  badges and a passed-with-flaky-count summary, governed by an explicit flaky counting-policy setting whose
  default never hides flakiness; repeated flaky results feed the cmd.testing.quarantine suggestion flow.
  Cancelled runs render their partial counts plus artifact disposition from the receipt. The panel is a
  projection/consumer only: it cites, never re-owns, the visible-session surface (ATS-009), artifact presentation
  (Runtime_Artifacts_Panel.md), and the expander contract owner.
gui_related: true
gui_classification_reason: This unit defines the visible Testing panel regions, expander binding, status rendering, and honesty invariants.
depends_on: [ATS-025, ATS-026, ATS-027, ATS-009]
unblocks: []
acceptance_criteria:
  - The five regions render within the 240/480/280 envelope without horizontal overflow, and the 220px adversarial fixture degrades without hiding blocked reasons or the redaction_notice.
  - Expander fixtures prove collapsed-by-default rows, single-button aria-expanded headers, the canonical body slot order, the body cap with internal scroll, and blocked reasons outside the collapsible body.
  - Honesty fixtures prove stale/retired dimming after file change and app restart, errored-distinct-from-failed rendering and severity ranking, zero-tests-ran warning never green, and approved-exception never rendered as passed.
  - Flaky fixtures prove n/m attempt badges, passed-with-flaky-count summaries, counting-policy setting effect, and the quarantine suggestion flow; cancelled fixtures prove partial counts plus artifact disposition rendering.
  - Rerun fixtures prove rerun and rerun-failed-only appear only on terminal receipts and carry disabled reasons otherwise.
  - No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-plans-verify.py validate-wiring-matrix
compatibility_only_notes:
  - "Slint compatibility: panel surfaces are opaque precomputed surfaces; no arbitrary-content backdrop blur, no SVG filters, color math precomputed; glass appears only as pre-blurred wallpaper."
risk_class: testing_panel_receipt_honesty_gap
reasoning_tier: high
context_scope: cozy_shelves_testing_panel_presentation
implementation_surfaces:
  - Plans/Automated_Testing_System.md
  - Plans/UI_Command_Catalog.md
  - Plans/Runtime_Artifacts_Panel.md
  - Plans/Wiring_Matrix.md
node_compile_hint:
  mode: cozy_shelves_testing_panel_presentation
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Concepts/rail-concepts/QwenRailConcepts/c2-cozy-shelves.html (Cozy Shelves concept; source-lineage-only)"
  - "Plans/Automated_Testing_System.md (FABLE GUI Result Surfacing 2026-07-08; ATS-009 visible sessions and redaction)"
  - "user decision 2026-07-27 (rail width envelope 240/480/280, 220 test-only)"
preserved_exact_tokens:
  - "run_list"
  - "active_run_detail"
  - "failure_list"
  - "artifact_preview"
  - "redaction_notice"
  - "completed_with_approved_verification_exception"
  - "blocked_reason_code"
  - "allowed_action_ids"
negative_constraints:
  - Do not invent panel-local run states; all states derive from TestRunReceipt.status.
  - Do not render skipped, blocked, zero-tests-ran, stale, or approved-exception receipts as green or passed.
  - Do not re-own the visible-session surface, artifact presentation, or the unified expander contract; cite their owners.
  - Do not copy concept HTML, CSS, or class names into spec or production surfaces.
owner_hints:
  - Plans/Automated_Testing_System.md
  - Plans/UI_Command_Catalog.md
  - Plans/Runtime_Artifacts_Panel.md
```

## PMConcept7 Home Workspace test contract — 2026-08-04

Amended 2026-08-12 — the matrix must assert observable geometry, not dispatch counts. Two
Home defects shipped green because their fixtures asserted only that one command was
emitted, or only that a global "last opened file" marker was set. Every fixture that
covers a visible outcome now asserts that outcome: a resize fixture asserts the rendered
surface box changed on both sides of the gesture and treats a commit that moves zero
pixels as a failure; a move fixture asserts a lifted item, a placeholder seated in the
target host, and a neighbour's transform-free layout position changing before any drop;
an open-in-panel fixture asserts the rendered buffer and the tab, in all four panels; a
collapse fixture asserts the panel height on both sides of the toggle and that the control
stays visible and hit-testable on the collapsed strip.

Case set changes: the target-picker drop-rail cases are retired with the rail, and their
coverage moves to drags over the live layout plus an outer-edge-band case for a dock that
is currently empty. The per-surface `Move or dock` menu-inventory case is replaced by a
grab-handle case that proves one handle per eligible surface, an accessible name, keyboard
pick-up/move/drop reaching every host with one command and one persist, and the polite
live region. Loss of pointer capture is removed as a cancellation vector; Escape, pointer
cancellation and window blur remain. New coverage: editor tab drag-reorder surviving a
re-render, the width-aware overflow chip in every open panel including panels opened on
demand, the contact-aware tab silhouette's flush-contact and independent left/right corner
states, and dashboard widget reorder and grid-snap resize.

The Home Workspace live matrix is a required GUI/runtime fixture family, not a
visual-only smoke test. It covers panel/browser/File Manager paths; movement,
docking, floating, resize, cancellation, lost capture, Escape/blur, and reduced
motion; terminal section/workgroup limits and identity preservation; reload,
corruption, migration, and off-screen recovery; one-command/one-persist semantic
commit behavior; and zero console/page errors. The visual matrix captures
`1024x768`, `1280x800`, `1600x900`, and `2200x1200` in default, all-open,
edge-docked, and floating layouts, with all eight themes for all-open, Friendly
Dark and Glass Light across all layouts, plus reduced-motion captures.

The required cross-product is exactly 72 deterministic fresh-context cases:
eight themes by four viewports with all surfaces open (32), Friendly Dark and
Glass Light by four additional layouts by four viewports (32), and both anchor
themes by reduced motion by four viewports (8). Additional layouts are default,
edge-docked, floating, and terminal-max. Listeners for console and page errors are
installed before navigation, non-loopback requests are blocked, storage/theme/motion
state is seeded deterministically, and each case records geometry, identity, and
runtime errors. A direct headful pass additionally checks perceived no-jump pickup,
reflow, glow/recovery, scrolling, real blur, keyboard/focus, clipping, popup
fallback, and cursor cleanup.

Each fixture records the layout revision before and after the gesture, command
count, persistence count, stable surface identities, and any disabled reason. A
cancelled or rejected gesture must prove byte-equivalent model restoration and zero
semantic dispatch/persist. Identity fixtures prove no duplicate buffer, browser
session, chat identity, terminal session, or PTY. Screenshots are evidence only
when paired with the live harness result and page/console error log.

### ATS-029 - Home Workspace Executable Certification Matrix

```yaml
plan_unit_id: ATS-029
unit_type: requirement
status: accepted
owner_doc: Plans/Automated_Testing_System.md
canonical_text: Home Workspace certification combines source-hashed control-to-command coverage, live visible interaction tests, persistence and fault-injection tests, stable-identity lifecycle tests, zero browser errors, and an exact 72-case visual matrix plus a direct headful pass.
gui_related: true
gui_classification_reason: The verification exercises and captures user-visible Home behavior across themes, sizes, layouts, motion, menus, gestures, and failures.
split_recommended: false
depends_on: [ATS-028, F3-501, F3-502, F3-503, UIW-010, SP-245]
unblocks: []
acceptance_criteria:
- All four editor and Browser targets and all four File Manager targets are exercised through visible production controls, and each asserts the rendered buffer rather than a dispatch count or a global marker.
- Every surface host route, resizer, cancellation path, terminal cap, popup fallback, corruption variant, migration, write failure, reload, and second clean reload is executable; host routes are exercised through the grab handle by pointer and by keyboard, and resizers assert changed rendered geometry.
- Fifth pane and fifth section rejection are visibly disabled with exact reasons and zero dispatch.
- The visual matrix contains exactly 72 deterministic fresh-context captures and has zero major overlap, clipping, false controls, console errors, page errors, or focus/cursor residue.
- "Amended 2026-08-13: the live matrix additionally carries the topbar_reset_layout_row, chat_popout_stays_in_canvas, grip_corner_hit_target_and_zorder, boot_never_floating, and dead_space_self_heal fixtures; the compact-menu fixture asserts four rows including Reset Layout; the drag fixture asserts the placeholder follows the pointer at the pickup-time footprint without jitter; and the resize fixture asserts adjacent-pair symmetry, post-commit stability, and floating height via the corner handle. The 72-case visual matrix is structurally unchanged."
- A fresh second pipeline build is byte-identical to Concepts/PMConcept7.html and all PM7/static/Plans/governance gates pass in disposable shadows.
validation_surfaces:
- node Concepts/pm7-tools/verify/home_workspace_matrix.mjs
- node Concepts/pm7-tools/verify/smoke.mjs
- python3 scripts/pm-plans-verify.py run-gates
- python3 scripts/pm-plan-index.py validate
risk_class: false_green_home_certification
reasoning_tier: standard
context_scope: home_live_certification
implementation_surfaces: [Plans/Automated_Testing_System.md, Concepts/pm7-tools/verify/home_workspace_matrix.mjs]
node_compile_hint:
  mode: home_executable_matrix
  create_worknodes: false
source_lineage:
- PMConcept7_Home_Workspace_Audit_Packet_v1/audit/05_LIVE_VISUAL_TEST_PROTOCOL.md
preserved_exact_tokens: [72, zero console errors, second clean reload, byte-identical]
negative_constraints:
- Do not substitute an internal API for a missing visible production control.
- Do not count screenshots or declarative wiring rows alone as test proof.
compatibility_only_notes: []
stale_retired_dispositions:
- The prior 15-check 34-shot Home harness is retired as certification authority.
- "Amended 2026-08-12: fixtures that assert only command/persist counts are retired as sufficient evidence for a visible outcome; the drop-rail target fixtures and the per-surface Move or dock menu-inventory fixture are retired with the affordances they covered; loss of pointer capture is retired as a cancellation vector."
- "Amended 2026-08-13: the window-exit-floats drag fixture branch is retired with the behavior it covered (window exit is now invalid_target); the three-row compact-menu assertion and the reset-forbidden regex are retired with the four-row menu; any fixture that accepts a floating surface at boot is retired (boot demotes floating to last_docked_host)."
owner_hints: [Plans/Automated_Testing_System.md, Plans/UI_Wiring_Rules.md]
```

## Runtime Integration Acceptance Matrices - 2026-08-13

These matrices consume `RuntimeResourceGovernor`, `ObservableWork`, `LeaseCoordinator`, `OperationalAwarenessService`, `DebugSessionRecord`, `EvalSessionRecord`, and the exact `ExecutionHostId` / `ExecutionEnvironmentId` topology identities from `Plans/Shared_Integration_Runtime.md`. They define required future executable coverage. Their presence in Plans, a generated index, a schema, or a passing mechanical governance check is not runtime evidence and must not be reported as feature completion, certification, or a test pass.

### ATS-030 - DAP DebugSession Lifecycle And Event-Ordering Matrix

```yaml
plan_unit_id: ATS-030
unit_type: validation_criterion
status: accepted
owner_doc: Plans/Automated_Testing_System.md
canonical_text: >-
  The classical DAP debugger is verified as a typed durable DebugSession resource. Coverage spans launch and
  attach; breakpoints; continue, pause, and step; threads, stack, scopes, and variables; evaluate; modules,
  sources, disassembly, and memory; output; disconnect; terminate; restart and cleanup. Every case binds the
  session to its Project, ExecutionHostId, ExecutionEnvironmentId, SourceLocationId, owner, policy snapshot,
  DebugSessionRecord, LeaseId and generation, adapter
  capability generation, logs, artifacts, and cleanup disposition. Event waiters are installed before an
  operation that can immediately emit stopped, output, exited, or terminated, so a stop event arriving in the
  same transport read as continue or step is not missed. Classical lifecycle and mutation cases dispatch only
  through the existing cmd.run_debug.* family; cmd.debug.* remains the assistant-investigation family and is
  never accepted as a DAP alias.
gui_related: false
gui_classification_reason: This unit owns an executable debugger contract matrix rather than debugger surface layout or presentation.
depends_on: [ATS-010]
unblocks: []
acceptance_criteria:
  - Positive fixtures cover every typed operation family and preserve DebugSessionRecord, ExecutionHostId, ExecutionEnvironmentId, SourceLocationId, owner, LeaseId/generation/epoch, adapter generation, policy, log, artifact, and cleanup lineage.
  - Race fixtures emit stopped or terminated in the same transport read as continue, step, launch, attach, or terminate and prove waiter-before-operation ordering with no lost or double-consumed event.
  - Lease expiry, owner-epoch change, adapter crash, host disconnect, restart, cancellation, and cleanup fixtures reject late mutation and retain truthful terminal or recovery-required state.
  - Command-routing fixtures accept the existing cmd.run_debug.* classical family and reject every attempt to dispatch a DAP operation through cmd.debug.*.
  - Passing Plan/index validation proves only matrix structure; executable adapter, transport, failure, and restart fixtures are required before any runtime pass claim.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - future DAP DebugSession protocol and event-ordering fixture matrix
  - future DebugSession lease-expiry, crash, restart, and cleanup integration matrix
risk_class: false_dap_lifecycle_proof
reasoning_tier: high
context_scope: dap_debugsession_acceptance
implementation_surfaces: [Plans/Automated_Testing_System.md, Plans/Commands_System.md, Plans/Shared_Integration_Runtime.md]
node_compile_hint: {mode: dap_debugsession_matrix_only, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/04_LSP_DAP_EVAL_MCP_BROWSER_AND_WORKTREES.md
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/09_TEST_MIGRATION_AND_ACCEPTANCE_MATRIX.md
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/reference/T3_OMP_COMPLETE_SOURCE_REVIEW.md
preserved_exact_tokens: [DebugSessionRecord, DebugSessionBroker, cmd.run_debug.*, cmd.debug.*, waiter-before-operation, ExecutionHostId, ExecutionEnvironmentId, SourceLocationId]
negative_constraints:
  - Do not mint, alias, or re-own command ids in this testing owner.
  - Do not route classical DAP work through the assistant-investigation cmd.debug.* family.
  - Do not infer event-ordering, crash recovery, or cleanup proof from a schema or mock-only happy path.
owner_hints: [Plans/Automated_Testing_System.md, Plans/Commands_System.md, Plans/Shared_Integration_Runtime.md]
```

### ATS-031 - Persistent EvalSession Acceptance And Policy Matrix

```yaml
plan_unit_id: ATS-031
unit_type: validation_criterion
status: accepted
owner_doc: Plans/Automated_Testing_System.md
canonical_text: >-
  Persistent EvalSession acceptance covers product-approved sandboxed Python, JavaScript, Ruby, and Julia
  kernels with retained variables, streaming output, structured results, bounded artifact spills, restart, and
  cleanup. Each session is explicitly scoped to Project, Goal or run, worktree when present, ExecutionHostId,
  ExecutionEnvironmentId, SourceLocationId, owner, EvalSessionRecord, LeaseId, runtime installation, policy
  snapshot, and artifact root; there is no hidden global kernel.
  Policy fixtures separate local-compute time from external wait time, pause idle-time accounting only while a
  permitted PM-owned nested tool or agent call is outstanding, then resume accounting. Nested access requires
  explicit policy and an independently issued single-use ProviderDispatchAdmissionReceipt; it remains within
  FileSafe, permission, credential, network, recursion, provider-budget,
  package-install, CPU, memory, wall-time, idle-time, output-byte, and artifact-byte limits.
gui_related: false
gui_classification_reason: This unit validates sandboxed evaluator lifecycle, accounting, and policy rather than a visible evaluation UI.
depends_on: [ATS-010]
unblocks: []
acceptance_criteria:
  - Language fixtures prove session-scoped variable retention, ordered streaming output, bounded structured results and spills, and no state sharing across Project, worktree, owner, or kernel identity.
  - Timeout fixtures prove local compute consumes the applicable budget, permitted external wait pauses only the idle clock, and the clock resumes after the nested call returns, fails, times out, or is cancelled.
  - Denial fixtures cover absent, expired, changed-byte, changed-route, changed-account, or already-consumed ProviderDispatchAdmissionReceipt; recursive-call limit; provider-budget exhaustion; filesystem/credential/network denial; package-install denial; artifact/output overflow; CPU/memory limit; and policy revocation.
  - Crash, restart, cancellation, lease loss, and cleanup fixtures prove stale kernel work cannot publish results and that retained artifacts receive an explicit disposition.
  - Passing Plan/index validation proves only matrix structure; executable sandbox, resource-pressure, nested-call, and isolation fixtures are required before any runtime pass claim.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - future EvalSession language, isolation, limit, nested-call, crash, and cleanup matrix
risk_class: eval_policy_escape_or_false_proof
reasoning_tier: high
context_scope: persistent_evalsession_acceptance
implementation_surfaces: [Plans/Automated_Testing_System.md, Plans/Shared_Integration_Runtime.md, Plans/FileSafe.md, Plans/Permissions_System.md]
node_compile_hint: {mode: evalsession_matrix_only, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/04_LSP_DAP_EVAL_MCP_BROWSER_AND_WORKTREES.md
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/09_TEST_MIGRATION_AND_ACCEPTANCE_MATRIX.md
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/reference/T3_OMP_COMPLETE_SOURCE_REVIEW.md
preserved_exact_tokens: [EvalSessionRecord, EvalSessionBroker, ProviderDispatchAdmissionReceipt, Python, JavaScript, Ruby, Julia, no hidden global kernel, local compute, external wait]
negative_constraints:
  - Do not treat DAP frame evaluation and persistent EvalSession kernels as the same lifecycle.
  - Do not pause CPU, wall, recursion, provider, output, or artifact limits merely because idle-time accounting is paused during a permitted external wait.
  - Do not make nested tool or agent authority implicit or inheritable; each provider dispatch independently consumes a valid ProviderDispatchAdmissionReceipt.
owner_hints: [Plans/Automated_Testing_System.md, Plans/Shared_Integration_Runtime.md, Plans/FileSafe.md, Plans/Permissions_System.md]
```

### ATS-032 - Test And Debug Lease And Operational Awareness Consumption Matrix

```yaml
plan_unit_id: ATS-032
unit_type: validation_criterion
status: accepted
owner_doc: Plans/Automated_Testing_System.md
canonical_text: >-
  Automated testing and classical debugging consume, and do not re-own, Shared Integration Runtime resource
  leases and OperationalAwarenessService projections. Admission fixtures bind test runs, DebugSessions, browser
  pages, devices, adapters, processes, ports, and Host capacity to the authoritative Project, Plan or Goal, run,
  attempt, agent, ExecutionHostId, ExecutionEnvironmentId, holder, epoch, lease generation, policy, and
  ObservableWorkId. OperationalAwarenessService receives compact typed state, wait reason, freshness, expiry,
  pressure, disabled reason,
  cleanup state, and artifact/log refs; raw registries, secrets, transcripts, page bodies, stacks, variables, or
  captures are not injected into prompts. Host-local enforcement rejects stale or infeasible allocations even
  when a coordinator previously proposed them.
gui_related: false
gui_classification_reason: This unit validates backend admission, fencing, and compact awareness projection contracts.
depends_on: [ATS-010, ATS-030, ATS-031]
unblocks: []
acceptance_criteria:
  - Admission fixtures prove test and debug work cannot start without the applicable live lease and Host/Environment capacity decision.
  - Expiry, renewal race, owner-epoch change, generation change, host disconnect, pressure downgrade, and restart fixtures reject stale work and keep cleanup/recovery observable.
  - Awareness fixtures cover current, partial, stale, unavailable, and conflicted with source cursors and observed time; they expose compact typed identity, phase, wait, pressure, disabled reason, and refs while proving no raw registry, secret, transcript, page body, stack, variable, or capture enters prompt context.
  - Windows plus WSL and host plus container or Kubernetes child fixtures share the physical parent budget rather than double-counting capacity.
  - Passing Plan/index validation proves only matrix structure; executable distributed-enforcement and stale-lease fixtures are required before any runtime pass claim.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - future test/debug resource-lease and host-enforcement matrix
  - future Operational Awareness compact-projection and no-raw-prompt-injection matrix
risk_class: stale_test_debug_lease_or_awareness_leak
reasoning_tier: high
context_scope: test_debug_shared_runtime_consumption
implementation_surfaces: [Plans/Automated_Testing_System.md, Plans/Shared_Integration_Runtime.md]
node_compile_hint: {mode: test_debug_lease_awareness_matrix_only, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/05_BSD_TIME_TRAVEL_GOAL_AND_OPERATIONAL_AWARENESS.md
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/09_TEST_MIGRATION_AND_ACCEPTANCE_MATRIX.md
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/reference/02_FULL_THREAD_CURRENT_DECISION_REGISTER.md
preserved_exact_tokens: [OperationalAwarenessService, RuntimeResourceGovernor, ObservableWorkId, LeaseCoordinator, LeaseId, ExecutionHostId, ExecutionEnvironmentId]
negative_constraints:
  - Do not define a testing-local or debugging-local global resource governor, lease authority, or awareness registry.
  - Do not interpret queued, waiting, admitted, degraded, or lease-held as test success.
  - Do not inject raw operational registries into prompts.
owner_hints: [Plans/Automated_Testing_System.md, Plans/Shared_Integration_Runtime.md]
```

### ATS-033 - PM-Native Browser Program And Protected AuthBrowserSession Matrix

```yaml
plan_unit_id: ATS-033
unit_type: validation_criterion
status: accepted
owner_doc: Plans/Automated_Testing_System.md
canonical_text: >-
  Browser acceptance uses only the PM-native BrowserRuntimeService, BrowserWorkspace, BrowserPage,
  BrowserAction, Browser Program, and Expert Browser Program contracts. Ordinary BrowserSessions may be used by
  humans or agents under explicit policy and may produce policy-allowed generic Test Capture evidence. A
  protected AuthBrowserSession is human-only, ephemeral, domain-restricted, and redacted. It exposes zero
  access to agents, tools, Back Seat Driver (BSD), recorders, DOM or PageRepresentation extraction, screenshots,
  console, network capture, or storage-state export. Tests may observe only permitted lifecycle and denial
  metadata outside the protected boundary; they may not inspect protected page content or convert a human auth
  interaction into automated evidence.
gui_related: true
gui_classification_reason: The matrix validates visible Browser Program behavior and the human-only protected authentication surface.
depends_on: [ATS-009, ATS-010]
unblocks: []
acceptance_criteria:
  - Ordinary-session fixtures cover named Browser Program actions, Expert Browser Program policy gates, requested/effective runtime disclosure, redaction, visibility, background continuation, artifacts, and cleanup.
  - Protected-session fixtures prove human-only creation and interaction, explicit domain allowlist enforcement, ephemeral teardown, redacted exterior metadata, and zero agent/tool/BSD/recorder/DOM/PageRepresentation/screenshot/console/network/storage-state access.
  - Cross-domain navigation, redirect, popup, download, file upload, deep link, clipboard, external protocol, certificate error, and permission prompt fixtures block or require the exact human decision allowed by policy without broadening the domain grant.
  - Restart, crash, disconnect, expiry, and presumed-success fixtures prove AuthBrowserSession never silently resumes, persists content, exports state, or auto-closes as successful without explicit allowed flow evidence.
  - Passing Plan/index validation or ordinary-browser tests is not proof of the protected boundary; executable negative probes at every agent/tool/BSD/capture interface are required.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - future PM-native Browser Program and Expert Browser Program action matrix
  - future protected AuthBrowserSession human-only and zero-capture negative matrix
risk_class: protected_auth_browser_exposure
reasoning_tier: high
context_scope: pm_native_browser_auth_acceptance
implementation_surfaces: [Plans/Automated_Testing_System.md, Plans/Section15_MVP_Promoted_Features_Spec.md, Plans/Shared_Integration_Runtime.md, Plans/Permissions_System.md]
node_compile_hint: {mode: browser_auth_boundary_matrix_only, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/04_LSP_DAP_EVAL_MCP_BROWSER_AND_WORKTREES.md
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/09_TEST_MIGRATION_AND_ACCEPTANCE_MATRIX.md
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/reference/BROWSER_TERMINOLOGY_FINAL_CORRECTION.md
preserved_exact_tokens: [BrowserRuntimeService, Browser Program, Expert Browser Program, AuthBrowserSession, human-only, ephemeral, domain-restricted, BSD]
negative_constraints:
  - Do not expose protected AuthBrowserSession content, state, or controls to an agent, tool, BSD, recorder, DOM/PageRepresentation reader, screenshotter, console reader, or network observer.
  - Do not use a protected authentication interaction as an automated content oracle or capture source.
  - Do not weaken the protected boundary because an ordinary BrowserSession supports automation or evidence capture.
owner_hints: [Plans/Automated_Testing_System.md, Plans/Section15_MVP_Promoted_Features_Spec.md, Plans/Shared_Integration_Runtime.md, Plans/Permissions_System.md]
```

### ATS-034 - Multi-Agent BrowserWorkspace Fencing Matrix

```yaml
plan_unit_id: ATS-034
unit_type: validation_criterion
status: accepted
owner_doc: Plans/Automated_Testing_System.md
canonical_text: >-
  Concurrent browser testing isolates each agent or task in a policy-compatible BrowserWorkspace and dedicated
  BrowserPage unless an explicit read-only observation contract applies. Each action carries Server, Host,
  Environment, Project, Plan, Goal, run, attempt, agent, operation, BrowserSession, BrowserWorkspace,
  BrowserPage, BrowserControllerLease generation, expected PageGeneration, and sequence. Exactly one mutating
  controller lease may be valid for a BrowserPage PageGeneration; navigation advances PageGeneration and fences
  every late action. Read-only observers never gain mutation authority, and users' PM web-client tabs, ordinary
  browsing, workspace previews, and protected AuthBrowserSessions are not agent test workspaces.
gui_related: true
gui_classification_reason: This unit validates concurrently visible/watchable browser pages and their interaction ownership.
depends_on: [ATS-032, ATS-033]
unblocks: []
acceptance_criteria:
  - Concurrent-agent fixtures prove separate storage/profile, proxy, locale, device, extension, permission, download, artifact, log, and cleanup scope where policy requires isolation.
  - Same-page mutation races prove exactly one live BrowserControllerLease per PageGeneration, deterministic loser behavior, and no duplicate or reordered mutation.
  - Navigation, redirect, reload, crash, restore, controller handoff, lease renewal, and owner-epoch fixtures advance or validate PageGeneration and reject late actions.
  - Observer fixtures prove read-only viewing cannot click, type, navigate, grant permissions, alter storage, or acquire controller authority implicitly.
  - Passing a single-agent happy path or producing screenshots does not prove concurrency isolation; executable races and stale-generation probes are required.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - future BrowserWorkspace isolation and BrowserControllerLease race matrix
risk_class: cross_agent_browser_mutation_or_state_bleed
reasoning_tier: high
context_scope: multi_agent_browser_fencing
implementation_surfaces: [Plans/Automated_Testing_System.md, Plans/Section15_MVP_Promoted_Features_Spec.md, Plans/Shared_Integration_Runtime.md]
node_compile_hint: {mode: multi_agent_browser_fencing_matrix_only, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/04_LSP_DAP_EVAL_MCP_BROWSER_AND_WORKTREES.md
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/09_TEST_MIGRATION_AND_ACCEPTANCE_MATRIX.md
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/reference/02_FULL_THREAD_CURRENT_DECISION_REGISTER.md
preserved_exact_tokens: [BrowserWorkspace, BrowserPage, BrowserControllerLease, PageGeneration, one mutating controller lease per page generation]
negative_constraints:
  - Do not share a mutable BrowserWorkspace or BrowserPage across agents by default.
  - Do not infer mutation authority from focus, visibility, tab selection, or read-only observation.
  - Do not accept a stale lease generation, owner epoch, PageGeneration, or action sequence.
owner_hints: [Plans/Automated_Testing_System.md, Plans/Section15_MVP_Promoted_Features_Spec.md, Plans/Shared_Integration_Runtime.md]
```

### ATS-035 - PM Browser Dependency Prohibition And External Project Test Exception

```yaml
plan_unit_id: ATS-035
unit_type: constraint
status: accepted
owner_doc: Plans/Automated_Testing_System.md
canonical_text: >-
  Puppet Master has no PM-owned Playwright runtime, browser backend, facade, compatibility vocabulary or
  namespace, package dependency, server or exposed port, MCP route, command or alias, support bundle, Doctor or
  Settings capability, or capture engine. PM-native capture remains BrowserRuntimeService, compositor,
  frame-stream, platform, device, or remote-adapter based. A user Project may independently declare and run a
  Playwright suite under Project tooling policy as a generic external Project command/process; Puppet Master may ingest only
  generic Test Capture and artifact references attributed to that Project process. The external suite does not
  define Browser Program, gain browser ownership, inherit a protected AuthBrowserSession, or create any PM API,
  facade, compatibility promise, MCP surface, command family, port, package, or capture dependency.
gui_related: false
gui_classification_reason: This unit is a runtime/dependency and external-process boundary, not visible browser presentation.
depends_on: [ATS-033]
unblocks: []
acceptance_criteria:
  - PM-owned dependency, package, command, MCP, port, Settings, Doctor, support-bundle, capability-label, schema, receipt, and capture-engine scans find no prohibited implementation or compatibility surface.
  - A fixture user Project with its own suite can run that suite through the generic external Project command/process path and attach generic Test Capture/artifact refs with explicit external Project attribution.
  - Negative fixtures prove the external process cannot acquire PM BrowserWorkspace, BrowserControllerLease, AuthBrowserSession, credential, profile, or internal browser transport authority merely because its artifacts are ingested.
  - The external Project exception is not a fallback for BrowserRuntimeService and cannot satisfy a PM-native Browser Program conformance test.
  - Text search alone is not runtime proof; dependency graph, process/port inventory, command/catalog/MCP registration, Settings/Doctor, artifact lineage, and authority-boundary fixtures are all required.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - future PM browser dependency and registration negative scan
  - future generic external Project command/process and artifact-lineage fixture
risk_class: forbidden_browser_compatibility_dependency
reasoning_tier: high
context_scope: pm_browser_dependency_prohibition
implementation_surfaces: [Plans/Automated_Testing_System.md, Plans/Section15_MVP_Promoted_Features_Spec.md]
node_compile_hint: {mode: browser_dependency_prohibition_matrix_only, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/SOURCE_AND_PRECEDENCE_MAP.md
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/reference/BROWSER_TERMINOLOGY_FINAL_CORRECTION.md
preserved_exact_tokens: [PM-native Browser Program API, generic Test Capture, external Project test activity]
negative_constraints:
  - Do not implement, expose, label, or imply a PM Playwright runtime, facade, compatibility layer, package, port, MCP route, command, or capture engine.
  - Do not promote an external Project dependency into Puppet Master installation, capability, onboarding, Settings, Doctor, support, or browser ownership.
  - Do not claim the absence scan or external-process fixture proves all Browser Program behavior.
owner_hints: [Plans/Automated_Testing_System.md, Plans/Section15_MVP_Promoted_Features_Spec.md]
```
