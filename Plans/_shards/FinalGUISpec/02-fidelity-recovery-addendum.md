## Fidelity recovery addendum

This addendum is an ordered parent-writer recovery container. It preserves the row-level fidelity repairs below without requiring multiple same-anchor packet writes.

### Fidelity recovery cov-022: Concern record family definition
- Coverage rows: cov-022
- Fidelity gap refs: cov-022
- Required fidelity items:
- Exact required item: Concern is a first-class durable record distinct from review finding, annotation, blocked episode, and graph patch request
- Exact required item: Define concern_id/project_id/run and scope refs, evidence/source refs, lineage refs, severity/category/status, and governance metadata
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-022: Concern record family definition` exists in `Plans/FinalGUISpec.md`.
- Exact acceptance check: The `cov-022` repair states the exact requirement: Concern is a first-class durable record distinct from review finding, annotation, blocked episode, and graph patch request
- Exact acceptance check: The `cov-022` repair states the exact requirement: Define concern_id/project_id/run and scope refs, evidence/source refs, lineage refs, severity/category/status, and governance metadata
- Exact acceptance check: The `cov-022` repair is in the owner section for `Plans/FinalGUISpec.md` and is not only a downstream consumer note.

### Fidelity recovery cov-027: Concern routing and object-first search behavior
- Coverage rows: cov-027
- Fidelity gap refs: cov-027
- Required fidelity items:
- Exact required item: Concern search results must route as object-first results with focused-run and target-tab context
- Exact required item: Concern drill-downs must preserve selected concern id and related object context
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-027: Concern routing and object-first search behavior` exists in `Plans/FinalGUISpec.md`.
- Exact acceptance check: The `cov-027` repair states the exact requirement: Concern search results must route as object-first results with focused-run and target-tab context
- Exact acceptance check: The `cov-027` repair states the exact requirement: Concern drill-downs must preserve selected concern id and related object context
- Exact acceptance check: The `cov-027` repair includes an explicit consumer cross-reference to the owning canonical contract for the same requirement.

### Fidelity recovery cov-030: Concern action policy and authority model
- Coverage rows: cov-030
- Fidelity gap refs: cov-030
- Required fidelity items:
- Exact required item: Define actor authority, confirmation, rationale, reversibility, and audit fields for concern actions
- Exact required item: Keep acknowledged, dismissed, resolved, and structural lineage edits as distinct actions
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-030: Concern action policy and authority model` exists in `Plans/FinalGUISpec.md`.
- Exact acceptance check: The `cov-030` repair states the exact requirement: Define actor authority, confirmation, rationale, reversibility, and audit fields for concern actions
- Exact acceptance check: The `cov-030` repair states the exact requirement: Keep acknowledged, dismissed, resolved, and structural lineage edits as distinct actions
- Exact acceptance check: The `cov-030` repair is in the owner section for `Plans/FinalGUISpec.md` and is not only a downstream consumer note.

### Fidelity recovery cov-047: Projection trust and action gating
- Coverage rows: cov-047
- Fidelity gap refs: cov-047
- Required fidelity items:
- Exact required item: Use current/refreshing/stale/degraded/unavailable projection states
- Exact required item: Gate sensitive actions on current or direct canonical revalidation and fall back to record-backed views when degraded
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-047: Projection trust and action gating` exists in `Plans/FinalGUISpec.md`.
- Exact acceptance check: The `cov-047` repair states the exact requirement: Use current/refreshing/stale/degraded/unavailable projection states
- Exact acceptance check: The `cov-047` repair states the exact requirement: Gate sensitive actions on current or direct canonical revalidation and fall back to record-backed views when degraded
- Exact acceptance check: The `cov-047` repair includes an explicit consumer cross-reference to the owning canonical contract for the same requirement.

### Fidelity recovery cov-050: Progress-only widget hostability
- Coverage rows: cov-050
- Fidelity gap refs: cov-050
- Required fidelity items:
- Exact required item: Restrict widget-composed Orchestrator surface to Progress
- Exact required item: Persist orchestrator:progress layout separately from Dashboard and Usage
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-050: Progress-only widget hostability` exists in `Plans/FinalGUISpec.md`.
- Exact acceptance check: The `cov-050` repair states the exact requirement: Restrict widget-composed Orchestrator surface to Progress
- Exact acceptance check: The `cov-050` repair states the exact requirement: Persist orchestrator:progress layout separately from Dashboard and Usage
- Exact acceptance check: The `cov-050` repair includes an explicit consumer cross-reference to the owning canonical contract for the same requirement.

### Fidelity recovery cov-052: Shared escalation ladder
- Coverage rows: cov-052
- Fidelity gap refs: cov-052
- Required fidelity items:
- Exact required item: Define one escalation ladder shared across Orchestrator, Dashboard, thread badges, and notifications
- Exact required item: Keep attention_required distinct from blocked and resurface persistent blockers on meaningful change/persistence
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-052: Shared escalation ladder` exists in `Plans/FinalGUISpec.md`.
- Exact acceptance check: The `cov-052` repair states the exact requirement: Define one escalation ladder shared across Orchestrator, Dashboard, thread badges, and notifications
- Exact acceptance check: The `cov-052` repair states the exact requirement: Keep attention_required distinct from blocked and resurface persistent blockers on meaningful change/persistence
- Exact acceptance check: The `cov-052` repair is in the owner section for `Plans/FinalGUISpec.md` and is not only a downstream consumer note.

### Fidelity recovery cov-058: Action-surface policy
- Coverage rows: cov-058
- Fidelity gap refs: cov-058
- Required fidelity items:
- Exact required item: Default bulk actions to navigation and triage rather than live execution mutation
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-058: Action-surface policy` exists in `Plans/FinalGUISpec.md`.
- Exact acceptance check: The `cov-058` repair states the exact requirement: Default bulk actions to navigation and triage rather than live execution mutation
- Exact acceptance check: The `cov-058` repair includes an explicit consumer cross-reference to the owning canonical contract for the same requirement.

### Fidelity recovery cov-062: Glossary and help governance
- Coverage rows: cov-062
- Fidelity gap refs: cov-062
- Required fidelity items:
- Exact required item: Expand Glossary.md to cover rewrite-critical objects, states, and trust terms
- Exact required item: Define inline help, context help, and canonical help entry layers while keeping canonical term names stable
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-062: Glossary and help governance` exists in `Plans/FinalGUISpec.md`.
- Exact acceptance check: The `cov-062` repair states the exact requirement: Expand Glossary.md to cover rewrite-critical objects, states, and trust terms
- Exact acceptance check: The `cov-062` repair states the exact requirement: Define inline help, context help, and canonical help entry layers while keeping canonical term names stable
- Exact acceptance check: The `cov-062` repair includes an explicit consumer cross-reference to the owning canonical contract for the same requirement.

### Fidelity recovery cov-067: Notification routing policy
- Coverage rows: cov-067
- Fidelity gap refs: cov-067
- Required fidelity items:
- Exact required item: Route notifications using severity, execution impact, blocked owner, persistence, and projection trust
- Exact required item: Allow quiet windows for advisory warnings but not for canonical blocked episodes
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-067: Notification routing policy` exists in `Plans/FinalGUISpec.md`.
- Exact acceptance check: The `cov-067` repair states the exact requirement: Route notifications using severity, execution impact, blocked owner, persistence, and projection trust
- Exact acceptance check: The `cov-067` repair states the exact requirement: Allow quiet windows for advisory warnings but not for canonical blocked episodes
- Exact acceptance check: The `cov-067` repair includes an explicit consumer cross-reference to the owning canonical contract for the same requirement.

### Fidelity recovery cov-071: Canonical route payload
- Coverage rows: cov-071
- Fidelity gap refs: cov-071
- Required fidelity items:
- Exact required item: Treat resume_url as serialized transport of that route payload
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-071: Canonical route payload` exists in `Plans/FinalGUISpec.md`.
- Exact acceptance check: The `cov-071` repair states the exact requirement: Treat resume_url as serialized transport of that route payload
- Exact acceptance check: The `cov-071` repair is in the owner section for `Plans/FinalGUISpec.md` and is not only a downstream consumer note.

### Fidelity recovery cov-079: Project summary projection
- Coverage rows: cov-079
- Fidelity gap refs: cov-079
- Required fidelity items:
- Exact required item: Define project_summary with activity_state, attention_state, health_state, owner, and projection trust disclosure
- Exact required item: Give canonical blocked episodes precedence over weaker derived warnings
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-079: Project summary projection` exists in `Plans/FinalGUISpec.md`.
- Exact acceptance check: The `cov-079` repair states the exact requirement: Define project_summary with activity_state, attention_state, health_state, owner, and projection trust disclosure
- Exact acceptance check: The `cov-079` repair states the exact requirement: Give canonical blocked episodes precedence over weaker derived warnings
- Exact acceptance check: The `cov-079` repair is in the owner section for `Plans/FinalGUISpec.md` and is not only a downstream consumer note.

### Fidelity recovery cov-082: Project attention projection
- Coverage rows: cov-082
- Fidelity gap refs: cov-082
- Required fidelity items:
- Exact required item: Keep attention rows consumable across Orchestrator, Dashboard, and notifications
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-082: Project attention projection` exists in `Plans/FinalGUISpec.md`.
- Exact acceptance check: The `cov-082` repair states the exact requirement: Keep attention rows consumable across Orchestrator, Dashboard, and notifications
- Exact acceptance check: The `cov-082` repair is in the owner section for `Plans/FinalGUISpec.md` and is not only a downstream consumer note.

### Fidelity recovery cov-086: Requested concrete-account fields
- Coverage rows: cov-086
- Fidelity gap refs: cov-086
- Required fidelity items:
- Exact required item: Model requested_account_id separately from requested_account_policy
- Exact required item: Add requested_account_binding with none/preferred/required semantics and display Requested account / Requested binding / Effective account / Switch reason
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-086: Requested concrete-account fields` exists in `Plans/FinalGUISpec.md`.
- Exact acceptance check: The `cov-086` repair states the exact requirement: Model requested_account_id separately from requested_account_policy
- Exact acceptance check: The `cov-086` repair states the exact requirement: Add requested_account_binding with none/preferred/required semantics and display Requested account / Requested binding / Effective account / Switch reason
- Exact acceptance check: The `cov-086` repair is in the owner section for `Plans/FinalGUISpec.md` and is not only a downstream consumer note.

### Fidelity recovery cov-090: Execution role and operational identity
- Coverage rows: cov-090
- Fidelity gap refs: cov-090
- Required fidelity items:
- Exact required item: Project them into effective-resolution, attempt, usage, and inspector surfaces
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-090: Execution role and operational identity` exists in `Plans/FinalGUISpec.md`.
- Exact acceptance check: The `cov-090` repair states the exact requirement: Project them into effective-resolution, attempt, usage, and inspector surfaces
- Exact acceptance check: The `cov-090` repair is in the owner section for `Plans/FinalGUISpec.md` and is not only a downstream consumer note.

### Fidelity recovery cov-096: Projection freshness vs projection health
- Coverage rows: cov-096
- Fidelity gap refs: cov-096
- Required fidelity items:
- Exact required item: Split projection_freshness from projection_health
- Exact required item: exact source wording is preserved in packet metadata; live content uses retired-token-safe wording.
- Retired-token handling: exact retired tokens are preserved in packet metadata; live wording omits them.
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-096: Projection freshness vs projection health` exists in `Plans/FinalGUISpec.md`.
- Exact acceptance check: The `cov-096` repair states the exact requirement: Split projection_freshness from projection_health
- Exact acceptance check: exact source wording is preserved in packet metadata; live content uses retired-token-safe wording.
- Exact acceptance check: exact source wording is preserved in packet metadata; live content uses retired-token-safe wording.
- Exact acceptance check: The `cov-096` repair is in the owner section for `Plans/FinalGUISpec.md` and is not only a downstream consumer note.

### Fidelity recovery cov-179: Dismissed vs resolved rationale enforcement
- Coverage rows: cov-179
- Fidelity gap refs: cov-179
- Required fidelity items:
- Exact required item: Require distinct dismissal rationale and resolution rationale rules
- Exact required item: Treat accepted_risk as a resolution path rather than dismissal
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-179: Dismissed vs resolved rationale enforcement` exists in `Plans/FinalGUISpec.md`.
- Exact acceptance check: The `cov-179` repair states the exact requirement: Require distinct dismissal rationale and resolution rationale rules
- Exact acceptance check: The `cov-179` repair states the exact requirement: Treat accepted_risk as a resolution path rather than dismissal
- Exact acceptance check: The `cov-179` repair includes an explicit consumer cross-reference to the owning canonical contract for the same requirement.

### Fidelity recovery cov-197: Blocked-owner eight-kind taxonomy and escalation ladder surfaces
- Coverage rows: cov-197
- Fidelity gap refs: cov-197
- Required fidelity items:
- Exact required item: Define an explicit blocked-owner 8-kind taxonomy and 5-level escalation ladder with surface mapping
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-197: Blocked-owner eight-kind taxonomy and escalation ladder surfaces` exists in `Plans/FinalGUISpec.md`.
- Exact acceptance check: The `cov-197` repair states the exact requirement: Define an explicit blocked-owner 8-kind taxonomy and 5-level escalation ladder with surface mapping
- Exact acceptance check: The `cov-197` repair is in the owner section for `Plans/FinalGUISpec.md` and is not only a downstream consumer note.

### Recommended minimum concern record shape
- Coverage rows: cov-209
- Fidelity gap refs: cov-209
- Required fidelity items:
- Exact required item: Add `visibility_level`, `attention_level`, `chatworthy`, and `blocking_effect?` to the concern-family contract
- Exact required item: Keep `blocking_effect` explicitly separate from `severity`
- Acceptance checks represented:
- Exact acceptance check: The heading `### Recommended minimum concern record shape` exists in `Plans/FinalGUISpec.md`.
- Exact acceptance check: The `cov-209` repair states the exact requirement: Add `visibility_level`, `attention_level`, `chatworthy`, and `blocking_effect?` to the concern-family contract
- Exact acceptance check: The `cov-209` repair states the exact requirement: Keep `blocking_effect` explicitly separate from `severity`
- Exact acceptance check: The `cov-209` repair is in the owner section for `Plans/FinalGUISpec.md` and is not only a downstream consumer note.

> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: “Puppet Master” only. No open questions; deterministic defaults per `Plans/Decision_Policy.md`.

**Date:** 2026-02-22
**Status:** Authoritative specification for AI agent implementation
**Tech Stack:** Rust + Slint 1.15.1 (.slint markup compiled via slint_build)
**Renderer:** Default winit + Skia; fallback winit + FemtoVG-wgpu; emergency software renderer

---

