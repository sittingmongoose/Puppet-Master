# Shard 013: Ledger Compile Addendum - pldg-20260618-001-prd-planning-wizard

Source: `Plans/Automated_Testing_System.md`

Source lines: L382-L797

Source SHA256: `cbf113bc3497116549e38ee16407505136466fca3596837cc3acbcfddb699533`

---

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
