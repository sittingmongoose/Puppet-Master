# Testing, Online Capability Discovery, Installation, and Visible Verification

## SRC-TESTING

Exact user requirements preserved:
- Plan Compile discovery must include methods found online, including current live testing and hot-reload options.
- Appropriate methods should be installed when missing and authorized.
- Testing should be shown where possible: the built-in browser visibly clicking around, or a live Swift/native app tester visibly exercising the application.
- Testing capabilities need settings that turn each capability on or off.
- Ordinary Planning Wizard conversation must not override the automated testing system.

The settled design adds current official-source research, project-level capability discovery before WorkNode binding, safe installation and rollback, global/per-project Auto-On-Off settings, visible sessions with fallbacks, redaction, and typed receipts. An explicit scoped override is the only testing opt-out and never creates a false pass.

## Accepted obligation inventory

### atom-0080: Automated testing is enabled by default

Automated testing and evidence collection are platform defaults for planned and executed work; Planning Wizard conversations refine requirements and constraints but do not casually disable the automated testing system.

- atom_type: `requirement`
- lane: `testing_policy`
- gui_related: `false`
- exact_tokens: ["automated testing is enabled by default"]
- negative_constraints: ["Do not ask whether testing should exist as though no testing were the ordinary default."]
- owner_hints: ["Plans/Automated_Testing_System.md", "Plans/Planning_Wizard.md"]

### atom-0081: Only explicit scoped override can restrict automated testing

Disabling or restricting automated testing requires a durable testing_policy_override explicitly approved by the user for exact projects, PlanUnits, WorkNodes, capability classes, reasons, risks, and reopen conditions.

- atom_type: `requirement`
- lane: `testing_policy`
- gui_related: `false`
- exact_tokens: ["testing_policy_override"]
- negative_constraints: ["Do not infer an opt-out from casual conversation or a capability setting being unavailable."]
- owner_hints: ["Plans/Automated_Testing_System.md", "Plans/Contracts_V0.md", "Plans/human-in-the-loop.md"]

### atom-0082: Testing overrides never become false passes

Affected work remains truthfully marked with an approved verification exception, such as completed_with_approved_verification_exception, and must never be represented as an automated test pass or full certification.

- atom_type: `requirement`
- lane: `testing_policy`
- gui_related: `false`
- exact_tokens: ["completed_with_approved_verification_exception"]
- negative_constraints: ["Do not convert an approved testing exception into test_passed or certified."]
- owner_hints: ["Plans/Automated_Testing_System.md", "Plans/Executor_Protocol.md", "Plans/Contracts_V0.md"]

### atom-0083: Discover project-local test capabilities before WorkNode binding

Plan Compile performs project-level discovery of existing runners, commands, harnesses, frameworks, environments, services, emulators, browsers, devices, credentials, and evidence surfaces before finalizing WorkNode-specific test bindings.

- atom_type: `requirement`
- lane: `testing_discovery`
- gui_related: `false`
- exact_tokens: ["Test Capability Discovery", "project-level discovery"]
- negative_constraints: []
- owner_hints: ["Plans/Automated_Testing_System.md", "Plans/Plan_To_Node_Compilation.md"]

### atom-0084: Research current testing methods online

Test Capability Discovery searches current official and primary sources for appropriate live testing, hot reload, live preview, browser automation, GUI automation, simulator, emulator, device, cloud, accessibility, performance, security, and project-native testing methods relevant to the technology stack.

- atom_type: `requirement`
- lane: `testing_discovery`
- gui_related: `false`
- exact_tokens: ["official sources", "live testing", "hot reload", "live preview"]
- negative_constraints: ["Do not rely solely on stale internal model knowledge for current tools, versions, setup methods, or platform availability."]
- owner_hints: ["Plans/Automated_Testing_System.md", "Plans/Tools.md", "Plans/Permissions_System.md"]

### atom-0085: Record online testing research provenance

Online capability research records source URL or provider reference, publication or update time when available, retrieval time, tool and version, supported platform, license, cost, credential needs, installation scope, freshness, confidence, and selection rationale.

- atom_type: `requirement`
- lane: `testing_discovery`
- gui_related: `false`
- exact_tokens: ["research provenance", "retrieval time", "selection rationale"]
- negative_constraints: []
- owner_hints: ["Plans/Automated_Testing_System.md", "Plans/Project_Output_Artifacts.md"]

### atom-0086: Install missing testing methods within authority

When an appropriate test, live-preview, hot-reload, browser, simulator, emulator, or support method is missing, the system may install or configure it within project-local or pre-authorized policy and must record commands, changes, receipts, rollback, and currentness.

- atom_type: `requirement`
- lane: `testing_install`
- gui_related: `false`
- exact_tokens: ["install", "configure", "rollback"]
- negative_constraints: []
- owner_hints: ["Plans/Automated_Testing_System.md", "Plans/Executor_Protocol.md", "Plans/FileSafe.md", "Plans/Permissions_System.md"]

### atom-0087: Gate privileged, global, costly, licensed, or credentialed installs

Global or privileged installation, paid services, license acceptance, account creation, credential use, device enrollment, or material external effects require applicable authority and may become a typed blocker rather than an unsafe silent install.

- atom_type: `requirement`
- lane: `testing_install`
- gui_related: `false`
- exact_tokens: ["privileged installation", "paid service", "license acceptance"]
- negative_constraints: []
- owner_hints: ["Plans/Automated_Testing_System.md", "Plans/Permissions_System.md", "Plans/human-in-the-loop.md"]

### atom-0088: Protect installation changes with FileSafe and source control

Testing-tool installation and configuration writes use FileSafe/source-control safe points, bounded write surfaces, receipts, revalidation, and rollback so discovery cannot damage the user's project or environment.

- atom_type: `requirement`
- lane: `testing_install`
- gui_related: `false`
- exact_tokens: ["safe point", "rollback"]
- negative_constraints: []
- owner_hints: ["Plans/Automated_Testing_System.md", "Plans/FileSafe.md", "Plans/WorktreeGitImprovement.md"]

### atom-0089: Provide global and per-project testing capability settings

Testing capability policy is configurable globally and per project, with project settings inheriting or overriding global values and the effective policy snapshot carried into Planning Wizard, Plan Compile, Executor, and Orchestrator.

- atom_type: `requirement`
- lane: `testing_settings`
- gui_related: `true`
- exact_tokens: ["global settings", "per-project settings", "effective policy snapshot"]
- negative_constraints: []
- owner_hints: ["Plans/Automated_Testing_System.md", "Plans/FinalGUISpec.md", "Plans/Multi-Account.md"]

### atom-0090: Use Auto, On, and Off capability values

Each testing capability family supports Auto, On, and Off: Auto discovers and selects or installs within authority; On is required and blocks or asks for authority when unavailable; Off prohibits use and installation for that capability without implying a pass.

- atom_type: `requirement`
- lane: `testing_settings`
- gui_related: `true`
- exact_tokens: ["Auto", "On", "Off"]
- negative_constraints: ["Do not treat Off as successful verification."]
- owner_hints: ["Plans/Automated_Testing_System.md", "Plans/FinalGUISpec.md", "Plans/Contracts_V0.md"]

### atom-0091: Expose specific testing capability families

Settings cover online capability research, automated installation, built-in browser, headed browser, visible browser automation, hot reload, live preview, desktop GUI testing, simulator or emulator, physical device, screenshot or visual comparison, accessibility, API or contract, database, console or network, performance, and security testing.

- atom_type: `requirement`
- lane: `testing_settings`
- gui_related: `true`
- exact_tokens: ["built-in browser", "visible browser automation", "hot reload", "simulator", "accessibility", "performance", "security"]
- negative_constraints: []
- owner_hints: ["Plans/Automated_Testing_System.md", "Plans/FinalGUISpec.md"]

### atom-0092: Default to show testing when possible

The default testing visibility policy is show_when_possible: when a meaningful headed or visual surface exists, expose the active test session rather than hiding all verification in background logs.

- atom_type: `requirement`
- lane: `testing_visibility`
- gui_related: `true`
- exact_tokens: ["show_when_possible"]
- negative_constraints: []
- owner_hints: ["Plans/Automated_Testing_System.md", "Plans/Orchestrator_Page.md", "Plans/FinalGUISpec.md"]

### atom-0093: Show built-in browser interaction visibly

For web work, open the built-in browser or headed browser view and visibly show navigation, clicks, form input, assertions, screenshots, console and network evidence, and pass/fail progression when supported.

- atom_type: `requirement`
- lane: `testing_visibility`
- gui_related: `true`
- exact_tokens: ["built-in browser", "clicks", "form input", "assertions"]
- negative_constraints: []
- owner_hints: ["Plans/Automated_Testing_System.md", "Plans/Orchestrator_Page.md", "Plans/FinalGUISpec.md"]

### atom-0094: Show live native and Swift application testing

For Swift and other native work, show the appropriate live preview, hot-reload surface, simulator, emulator, device stream, application window, interaction trace, screenshots, and relevant logs when available and permitted.

- atom_type: `requirement`
- lane: `testing_visibility`
- gui_related: `true`
- exact_tokens: ["Swift", "live preview", "simulator", "emulator", "device stream"]
- negative_constraints: []
- owner_hints: ["Plans/Automated_Testing_System.md", "Plans/Orchestrator_Page.md", "Plans/FinalGUISpec.md"]

### atom-0095: Visible testing must not block automation

Users may collapse, detach, background, or leave a visible test session while automation continues; the system preserves session state and does not require the user to watch every action.

- atom_type: `requirement`
- lane: `testing_visibility`
- gui_related: `true`
- exact_tokens: ["collapse", "detach", "automation continues"]
- negative_constraints: []
- owner_hints: ["Plans/Automated_Testing_System.md", "Plans/Orchestrator_Page.md"]

### atom-0096: Provide fallbacks when live embedding is impossible

When a live surface cannot be embedded, expose an Open or Watch action, snapshots, screenshot sequence, video or stream where supported, structured interaction timeline, logs, console and network traces, and evidence links.

- atom_type: `requirement`
- lane: `testing_visibility`
- gui_related: `true`
- exact_tokens: ["Open", "Watch", "interaction timeline"]
- negative_constraints: []
- owner_hints: ["Plans/Automated_Testing_System.md", "Plans/Orchestrator_Page.md", "Plans/Runtime_Artifacts_Panel.md"]

### atom-0097: Redact sensitive data from visible testing

Visible testing, screenshots, video, logs, console, network traces, and artifacts apply secret and sensitive-data redaction before display or persistence.

- atom_type: `requirement`
- lane: `testing_visibility`
- gui_related: `true`
- exact_tokens: ["redaction"]
- negative_constraints: ["Do not expose credentials, tokens, personal data, or protected project content through visible testing."]
- owner_hints: ["Plans/Automated_Testing_System.md", "Plans/Permissions_System.md", "Plans/Runtime_Artifacts_Panel.md"]

### atom-0098: Persist test capability and session receipts

Discovery, research, selection, installation, harness probe, visible session, user interaction, test result, artifact, exception, and cleanup operations produce typed receipts linked to project, PlanCompileRun, GoalRun, WorkNode, attempt, capability, and source currentness.

- atom_type: `requirement`
- lane: `testing_receipts`
- gui_related: `false`
- exact_tokens: ["test capability receipt", "visible session receipt"]
- negative_constraints: []
- owner_hints: ["Plans/Automated_Testing_System.md", "Plans/Contracts_V0.md", "Plans/Project_Output_Artifacts.md"]

### atom-0099: Testing topic captures constraints without replacing automation

The Planning Wizard Testing topic asks about existing commands, frameworks, required environments, credentials or services, evidence expectations, exclusions, risk areas, accessibility, performance, security, and manual validation needs, then passes them to the automated testing system.

- atom_type: `requirement`
- lane: `testing_topic`
- gui_related: `false`
- exact_tokens: ["Testing topic", "evidence expectations"]
- negative_constraints: ["Do not let topic chat replace Test Capability Discovery or the automated test planner."]
- owner_hints: ["Plans/Planning_Wizard.md", "Plans/Automated_Testing_System.md"]

### atom-0100: Executor revalidates the selected harness before execution

Provisioning Preflight confirms that selected test capabilities, installations, services, browsers, devices, simulators, credentials, and commands remain current and runnable immediately before WorkNode execution.

- atom_type: `requirement`
- lane: `testing_revalidation`
- gui_related: `false`
- exact_tokens: ["Provisioning Preflight", "harness revalidation"]
- negative_constraints: []
- owner_hints: ["Plans/Automated_Testing_System.md", "Plans/Executor_Protocol.md"]
