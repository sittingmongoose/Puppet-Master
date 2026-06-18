# Audit, Repair, Readiness, and Zero-Incomplete Policy

## SRC-AUDIT

The current product audit model is Goal Runtime plus Auditor agents and durable audit/repair/closure records. Topic and final Plan Pack audits are separate. Broad audits must use many bounded read-only specialists in parallel, with controller-owned writes and assignment/result evidence.

Exact user rule preserved: “No stubs or TODOs AT ALL!” This also covers TBDs, placeholders, empty required sections, fake acceptance, mock production behavior, and deferred implementation detail. Only an exact durable user-approved exception may pass. The gate runs at Planning approval, Plan Compile certification, WorkNode completion, and Goal completion.

Implementation readiness is proven by complete contracts and a clean-room Approve And Build-to-first-queued-WorkNode fixture with duplicate, restart, repository, testing, cancellation, revision, parallelism, and deliberate-incomplete-content cases.

## Accepted obligation inventory

### atom-0130: Use product-native audit, repair, re-audit loops

Planning Wizard uses current Goal Runtime and Auditor-based AuditCycle, AuditFinding, RepairAttempt, AuditClosure, and CertificationReceipt records rather than superseded experimental workflow machinery.

- atom_type: `requirement`
- lane: `audit_architecture`
- gui_related: `false`
- exact_tokens: ["AuditCycle", "AuditFinding", "RepairAttempt", "AuditClosure", "CertificationReceipt"]
- negative_constraints: ["Do not make superseded experimental pipeline artifacts part of the product audit architecture."]
- owner_hints: ["Plans/Planning_Wizard.md", "Plans/Goal_Runtime_System.md", "Plans/Contracts_V0.md"]

### atom-0131: Run topic and final audit scopes separately

Every Topic Plan Draft receives a scoped fidelity audit/repair loop, and the integrated Final Plan Pack receives a separate broad multi-specialist audit/repair loop before user review and approval.

- atom_type: `requirement`
- lane: `audit_architecture`
- gui_related: `false`
- exact_tokens: ["topic audit", "final audit"]
- negative_constraints: []
- owner_hints: ["Plans/Planning_Wizard.md"]

### atom-0132: Final audit covers semantic and mechanical completeness

Final Plan Pack audit covers PRD and ledger fidelity, exact details, unsupported inventions, owner and consumer placement, cross-topic conflicts, implementation readiness, testing readiness, security/data/permissions consistency, repository currentness, source lineage, schemas, mechanics, and future compile readiness.

- atom_type: `requirement`
- lane: `final_audit`
- gui_related: `false`
- exact_tokens: ["semantic fidelity", "implementation readiness", "source lineage"]
- negative_constraints: []
- owner_hints: ["Plans/Planning_Wizard.md", "Plans/Plan_Document_System.md", "Plans/Plan_To_Node_Compilation.md"]

### atom-0133: Use mandatory parallel specialist audits

The final audit controller must launch multiple bounded read-only specialist agents in parallel for distinct defect families, persist assignments and results, reduce findings, run bounded repairs, and re-audit until all findings are durably closed or a true typed blocker remains.

- atom_type: `requirement`
- lane: `final_audit`
- gui_related: `false`
- exact_tokens: ["multiple bounded read-only specialist agents in parallel", "durably closed"]
- negative_constraints: ["Do not certify a broad final audit performed by one agent when parallel specialist review is required."]
- owner_hints: ["Plans/Planning_Wizard.md", "Plans/Goal_Runtime_System.md", "Plans/Contracts_V0.md"]

### atom-0134: Persist closure-aware product audit records

Audit findings have stable finding keys, source and artifact hashes, closure status, evidence, reason, repair attempts, and reopen conditions so unchanged closed findings become previously closed rather than recurring forever.

- atom_type: `requirement`
- lane: `audit_closure`
- gui_related: `false`
- exact_tokens: ["finding_key", "previously_closed", "reopen conditions"]
- negative_constraints: []
- owner_hints: ["Plans/Planning_Wizard.md", "Plans/Contracts_V0.md", "Plans/storage-plan.md"]

### atom-0135: Controller is sole writer during audit repair

Audit and repair subagents inspect, classify, compare, and propose; the Planning Run controller or assigned canonical artifact owner performs serialized writes, updates closures, and issues certification.

- atom_type: `requirement`
- lane: `audit_closure`
- gui_related: `false`
- exact_tokens: ["sole writer", "serialized writes"]
- negative_constraints: ["Do not allow parallel repair subagents to race canonical Plan writes."]
- owner_hints: ["Plans/Planning_Wizard.md", "Plans/Goal_Runtime_System.md"]

### atom-0136: Approved plans contain zero unapproved incomplete content

Before Approve And Build, active first-party Plans and the ApprovedPlanPack contain zero unresolved stubs, TODOs, TBDs, FIXMEs used as deferred work, placeholders, empty required sections, fake acceptance criteria, mock production behavior, or deferred implementation details.

- atom_type: `negative_constraint`
- lane: `zero_incomplete`
- gui_related: `false`
- exact_tokens: ["zero", "stubs", "TODOs", "TBDs", "placeholders"]
- negative_constraints: ["No stubs or TODOs at all unless the user explicitly approves the exact item."]
- owner_hints: ["Plans/Planning_Wizard.md", "Plans/Plan_Document_System.md", "Plans/Progression_Gates.md"]

### atom-0137: Apply zero-incomplete validation at four boundaries

A context-aware incomplete-content validator runs at Planning Wizard approval, Plan Compile certification, WorkNode completion, and Goal completion across active Plans, compile artifacts, first-party code, tests, generated outputs, and delivery artifacts.

- atom_type: `requirement`
- lane: `zero_incomplete`
- gui_related: `false`
- exact_tokens: ["Planning Wizard approval", "Plan Compile certification", "WorkNode completion", "Goal completion"]
- negative_constraints: []
- owner_hints: ["Plans/Planning_Wizard.md", "Plans/Plan_To_Node_Compilation.md", "Plans/Executor_Protocol.md", "Plans/Progression_Gates.md"]

### atom-0138: Incomplete-content detection is context-aware

Historical quotations, compatibility notes, vendor or third-party sources, generated lockfiles, and rules that mention TODO or stub terminology are not false positives, while empty functions, panic or unimplemented paths, placeholder returns, fake tests, and implement-later prose are blockers.

- atom_type: `requirement`
- lane: `zero_incomplete`
- gui_related: `false`
- exact_tokens: ["context-aware"]
- negative_constraints: []
- owner_hints: ["Plans/Planning_Wizard.md", "Plans/Automated_Testing_System.md", "Plans/Progression_Gates.md"]

### atom-0139: Exceptions are exact and durable

The only permitted incomplete item is a user_approved_incomplete_item naming the exact artifact and span, reason, risk, approver, downstream disposition, expiration or reopen condition, and evidence; broad permission to leave TODOs is invalid.

- atom_type: `requirement`
- lane: `zero_incomplete`
- gui_related: `false`
- exact_tokens: ["user_approved_incomplete_item"]
- negative_constraints: ["Do not accept a broad 'allow TODOs' exception."]
- owner_hints: ["Plans/Contracts_V0.md", "Plans/human-in-the-loop.md", "Plans/Progression_Gates.md"]

### atom-0140: Define Planning Wizard compile readiness

Planning is compile-ready only when all required topics are Ready or explicitly excluded, ledgers are synchronized, topic plans compiled and audited, invalidations resolved, final integration and final audit completed, testing requirements captured, project context current, source lineage complete, zero-incomplete gate passed, and immutable ApprovedPlanPack can be created.

- atom_type: `requirement`
- lane: `readiness`
- gui_related: `false`
- exact_tokens: ["compile-ready"]
- negative_constraints: []
- owner_hints: ["Plans/Planning_Wizard.md", "Plans/Progression_Gates.md"]

### atom-0141: Implementation-ready plans specify executable detail

Implementation readiness requires behavior, actors and identity, data and state transitions, edge and failure cases, permissions, currentness and idempotency, UI commands and states where applicable, adapters and side effects, validation surfaces, acceptance evidence, dependencies, and handoff contracts.

- atom_type: `requirement`
- lane: `readiness`
- gui_related: `false`
- exact_tokens: ["behavior", "state transitions", "failure cases", "idempotency", "acceptance evidence"]
- negative_constraints: []
- owner_hints: ["Plans/Planning_Wizard.md", "Plans/Plan_Document_System.md"]

### atom-0142: Unsupported claims block certification

Every material plan and compile claim must trace to an Approved PRD Pack, user planning answer, accepted Planning Amendment, repository fact, reference artifact, explicit system policy, or recorded assumption; unsupported invented claims are audit defects.

- atom_type: `requirement`
- lane: `readiness`
- gui_related: `false`
- exact_tokens: ["traceability", "unsupported claim"]
- negative_constraints: ["Do not certify invented planning details with no source or explicit assumption."]
- owner_hints: ["Plans/Planning_Wizard.md", "Plans/Plan_Document_System.md", "Plans/Plan_To_Node_Compilation.md"]

### atom-0143: Use a typed blocker taxonomy

Classify gaps as auto_resolvable, safe_default_with_assumption, defer_to_plan_compile, defer_to_worknode_system, requires_user_policy_decision, requires_user_risk_acceptance, requires_external_credential, or true infrastructure/runtime blocker.

- atom_type: `requirement`
- lane: `blockers`
- gui_related: `false`
- exact_tokens: ["auto_resolvable", "safe_default_with_assumption", "requires_user_risk_acceptance"]
- negative_constraints: []
- owner_hints: ["Plans/Planning_Wizard.md", "Plans/human-in-the-loop.md", "Plans/Goal_Runtime_System.md"]

### atom-0144: User decisions remain exceptional

Only product policy with no safe inference, material risk acceptance, destructive or irreversible operations, credentials or permissions, legal/compliance authority, or irreconcilable user preference conflicts may block for user decision.

- atom_type: `requirement`
- lane: `blockers`
- gui_related: `false`
- exact_tokens: ["exceptional user decision"]
- negative_constraints: ["Do not block on ordinary details that safe defaults, evidence, or downstream stages can resolve."]
- owner_hints: ["Plans/Planning_Wizard.md", "Plans/human-in-the-loop.md"]

### atom-0145: Require a clean-room end-to-end fixture

Implementation readiness of the complete pipeline requires a clean-room fixture proving Approve And Build creates exactly one PlanCompileRun, executes mandatory parallel stages, certifies a complete WorkGraph and WorkNodeRequests, passes Executor intake/provisioning, atomically creates GoalRun and WorkNodes, queues an entrypoint, and appears in Orchestrator.

- atom_type: `requirement`
- lane: `certification`
- gui_related: `false`
- exact_tokens: ["clean-room fixture", "exactly one PlanCompileRun", "entrypoint queued"]
- negative_constraints: []
- owner_hints: ["Plans/Planning_Wizard.md", "Plans/Plan_To_Node_Compilation.md", "Plans/Executor_Protocol.md", "Plans/Orchestrator_Page.md"]

### atom-0146: Exercise critical recovery fixtures

The fixture suite covers duplicate PlanApproved delivery, restart during every activation step, greenfield Git, non-Git FileSafe, dirty repository, remote SSH, optional GitHub or PR, missing harness, testing override, plan revision during compile and execution, cancellation before and after mutation, missing parallel receipts, and a deliberately introduced incomplete item.

- atom_type: `requirement`
- lane: `certification`
- gui_related: `false`
- exact_tokens: ["duplicate PlanApproved", "dirty repository", "missing parallel receipts", "deliberately introduced incomplete item"]
- negative_constraints: []
- owner_hints: ["Plans/Plan_To_Node_Compilation.md", "Plans/Automated_Testing_System.md", "Plans/Executor_Protocol.md"]
