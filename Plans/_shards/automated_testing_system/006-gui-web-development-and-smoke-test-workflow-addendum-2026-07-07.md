# Shard 006: GUI web development and smoke-test workflow addendum (2026-07-07)

Source: `Plans/Automated_Testing_System.md`

Source lines: L111-L328

Source SHA256: `18f4feddbfd15e2f5063fe7d821aac7d37c050b7c597cc8532b94f4eb86ae557`

---

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
