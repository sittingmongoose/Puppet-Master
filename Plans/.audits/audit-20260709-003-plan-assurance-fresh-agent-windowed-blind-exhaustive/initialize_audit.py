#!/usr/bin/env python3
"""Initialize the third clean Plan Assurance run without substantive conclusions."""

from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path


AUDIT = Path(__file__).resolve().parent
AUDIT_ID = "audit-20260709-003-plan-assurance-fresh-agent-windowed-blind-exhaustive"
NOW = datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")
GOAL = (
    "Exhaustively discover, model, falsify, and report specification gaps for every active Puppet Master "
    "feature, system, tool, workflow, provider, integration, and user-visible capability represented by "
    "the canonical Plans corpus, with 100 percent document and feature-scope accounting and no repairs."
)


def write_json(path: Path, value: object) -> None:
    path.write_text(json.dumps(value, indent=2, sort_keys=True) + "\n", encoding="utf-8")


def write_jsonl(path: Path, rows: list[dict]) -> None:
    path.write_text(
        "\n".join(json.dumps(row, sort_keys=True, separators=(",", ":")) for row in rows) + "\n",
        encoding="utf-8",
    )


AUDIT.mkdir(parents=True, exist_ok=True)
(AUDIT / "raw_window_results").mkdir(exist_ok=True)
(AUDIT / "raw_assignment_results").mkdir(exist_ok=True)

charter = f"""# Audit Charter

Audit ID: `{AUDIT_ID}`  
Status: `initializing_fresh_agent_clean_run`  
Created: `{NOW}`  
Goal status: `active`  
Audit mode: `blind`, `audit-only`, `no repairs`

## Objective

{GOAL}

The verdict is bounded assurance, never a claim that green validators, internal consistency, or a prior closure proves feature completeness.

## Authority and write boundary

- Read `AGENTS.md` and `Plans/00-plans-index.md` first; live non-pipeline `Plans/**` is canonical.
- Exclude `Plans/ledgers/**`, `Plans/_shards/**`, `Plans/.evidence/**`, `Plans/.audits/**`, and explicitly retired/source-lineage-only material from primary authority, while recording dispositions.
- Root is the sole writer. Fresh subagents are read-only and return exact paths and line references.
- The only permitted writes are inside this audit directory.
- No canonical Plan, schema, fixture, source, ledger, PlanUnit, index, governance artifact, Spec Lock, shard, evidence, closure registry, WorkNode, NodeSeed, queue, manifest, or implementation may be repaired or edited.
- No commits, pushes, governance seals, or mutating generators.

## Reset and blindness boundary

- Audits `001` and `002` are superseded and have zero substantive coverage credit.
- Audit `002` path counts, hashes, and core-range routing may be used only after independent recomputation and validation; none of its reviewer prose, claims, findings, role completions, or coverage may be read or carried forward.
- Before the new blind candidate set freezes, do not inspect July 9 Downloads postmortems, prior broad-audit summaries, fablereport/ClaudeAudit/SYNTHESIS reports, prior `Plans/.audits` findings, semantic closure registry conclusions, or another reviewer’s conclusions.
- Root may orchestrate deterministic artifacts but must not substitute accumulated context or a whole-document impression for a missing fresh review.

## Hierarchical semantic window protocol

- Mechanically partition every authoritative document into non-overlapping semantic cores of at most 400 source lines and approximately at most 12,000 tokens, whichever is reached first.
- Prefer heading, table, schema, contract, and complete PlanUnit boundaries. Explicitly subdivide oversized blocks with preserved provenance and hashes.
- Context overlaps expose seams but never count twice. Core unions must cover every authoritative line exactly once with zero gaps and zero duplicate ownership.
- Each window receives a fresh exact-behavior/contract-capability reviewer and a different fresh adversarial-negative-space reviewer. Dense/high-risk windows receive fresh applicable specialists.
- A separate fresh seam reviewer examines every adjacent boundary/crossing block. A fresh one-document integrator consumes structured window/seam results and may only perform narrow spot checks.
- Feature synthesis begins only after qualifying source windows are dual-reviewed, specialist-complete where required, seam-checked, and integrated.

## Fresh Agent Isolation Protocol

- One newly spawned native gpt-5.6-sol/ultra agent instance performs exactly one bounded role over exactly one bounded scope.
- A substantive agent is never assigned a second window, role, document, feature, research brief, scenario campaign, shadow blueprint, mutation task, seam, integration, or certification.
- Substantive assignments use `spawn_agent` with no inherited conversation turns. `followup_task` is forbidden for new substantive work. A narrow clarification about the submitted evidence is permitted before terminalization but cannot add source or scope.
- Exact and adversarial reviewers for a window must have distinct identities and may not see each other’s results before submission.
- Freshness applies to specialists, seam reviewers, document integrators, per-feature research and expectation agents, feature claim/surface synthesizers, scenario/falsification agents, both shadow builders, mutation generators, mutation detectors/certifiers, and final/frontier certifiers.
- Each agent is terminal after its one result. Every registry row records one canonical agent path as `agent_instance_id`, `agent_path`, and the available collaboration `thread_id` identifier.
- `validate_fresh_agent_isolation.py` must report zero duplicate identities, recycled agents, multi-scope agents, same-window dual-role identity collisions, capsule violations, or post-terminal results.

## Immutable context capsules

- Each assignment references a minimal immutable capsule and SHA-256 hash. Window capsules contain only document identity/scope/authority metadata, exact core/context ranges and hashes, structural IDs, adjacent window IDs, the universal lens card, role instructions, and blindness rules.
- Window capsules include no previous reviewer prose, prior findings, unrelated summaries, or source beyond the bounded window/overlap addressed by the assignment.
- Maximum serialized immutable capsule metadata is 64,000 bytes. The source window remains bounded separately by the 400-line/12,000-token rule.
- Integration and certification capsules include only the structured inputs required by that one tier and scope.

## Closed-world inventories

Build and reconcile three independent inventories: PlanUnit/index/owner-map; user-visible surfaces/commands/events/schemas/providers/tools/workflows/pages/settings/artifacts/integrations; and document-structure capability extraction. Stable feature IDs split cross-cutting behavior by operation, not document. No substantive feature review starts until every authoritative document is classified and every discovered feature has an accountable scope row.

## Mandatory external research for every feature

- Every feature receives a research brief before detailed Plan comparison wherever possible. Risk, novelty, and volatility control depth, source count, and falsification intensity, never whether research occurs.
- Inspect multiple useful evidence classes where available: official docs/standards, direct comparators, adjacent products with different approaches, real source/configuration, and issue/incident/user-friction evidence.
- Record ideas, failure lessons, tradeoffs, alternatives, challenged assumptions, inspected source identity/version/date/freshness, and actual inspected material.
- Classify evidence as `required_external_constraint`, `required_for_user_outcome`, `transferable_lesson`, `risk_mitigation`, `optional_inspiration`, `explicitly_rejected`, `not_applicable_with_evidence`, or `unresolved`.
- A no-analogue exemption requires explicit evidence and an independent fresh reviewer. Low risk, size, familiarity, time pressure, or apparent specification quality are never exemptions.
- Research access/freshness/permission shortfalls become `external_research_incomplete` and limit or block assurance.
- Queries are generalized and expose no proprietary local content or machine state.

## Expectation, claim, impact, and falsification method

- At least two independent fresh same-model reviewers construct an expectation model for every feature before detailed comparison.
- Apply universal lenses: entrypoints/callers; behavior; lifecycle/state; identity/authority; provenance; persistence/migration; concurrency/idempotency/currentness; permission/security/privacy/abuse; failure/degraded/empty/unknown/partial/cancel/resume/offline; GUI truthfulness/accessibility/localization/responsiveness; integration/consumer propagation; observability/support/operations; performance/scale; compatibility; testing/acceptance evidence; and intentional builder discretion.
- Add archetype lenses for billing, auth, providers, agentic automation, collaboration, browser/web, storage, sync, destructive actions, plugins, deployments, and every other applicable domain.
- Express consequential obligations as behavioral claims linked to actors, entrypoints, states, authority, transitions, failures, consumers, GUI, schemas/events/artifacts, persistence, acceptance oracles, owners, evidence, freshness, and disposition.
- Generate happy/off-nominal scenarios, including empty, unknown, estimated, partial, stale, denied, interrupted, cancelled, resumed, concurrent, migrated, degraded, unavailable, malicious, boundary, and overload where applicable.
- Two fresh shadow builders independently produce schemas/state machines/APIs/UI states/failure rules/tests only. Consequential divergence outside declared discretion is a finding.
- Every feature receives applicable specification mutations; high-risk features receive multiple. Critical mutants must be killed, and every surviving material mutant becomes a feature-and-method finding.

## Checkpoint and wave discipline

- Fill bounded collaboration slots with newly spawned agents, collect and persist their results, terminalize them, validate identity isolation, checkpoint, and then spawn entirely new agents for the next wave.
- Persist assignment/result evidence after every wave and reconcile the unassessed/high-risk frontier until closed.
- Size, elapsed time, session boundaries, or compaction are not reasons to sample, reduce scope, or claim completion.

## Stopping rules

The Goal cannot complete unless all of the following hold:

- 100 percent active canonical documents classified; exact authoritative core coverage has zero gaps, duplicate cores, unclassified lines, or unreviewed windows.
- Every required substantive assignment has one unique terminal agent; `fresh_agent_isolation_passed=true`, duplicate/recycled/multi-scope counts are zero, and actual unique-agent count equals substantive assignment count.
- Every window has both independent roles and applicable specialists; every document has fresh seam review and fresh single-document integration.
- 100 percent of reconciled features have completed independent expectations, claims, impact proof, mandatory research or a confirmed no-analogue exemption, scenarios, two shadow builders, and mutation/falsification rows.
- Required research is current or explicitly limiting/blocking; all critical mutations are killed; material survivors and consequential interpretation divergences are findings.
- Two successive independent fresh frontier passes produce no new high-severity obligation dimensions.
- Residual risks, unsearched areas, source freshness, research limits, allowed builder discretion, method blind spots, detection quality, false-positive burden, mutation survival, interpretation divergence, and research cost/coverage are explicit.
- Artifacts validate and `FINAL_REPORT.md` gives an honest bounded verdict.

Allowed per-feature verdicts are only `under_specified`, `assurance_blocked`, `evidence_sufficient_with_residual_risk`, or `implementation_ready_within_assurance_envelope`.
"""
(AUDIT / "AUDIT_CHARTER.md").write_text(charter, encoding="utf-8")

protocol = """# Window Review Protocol

## Assignment invariant

One fresh native agent, one role, one window, one result, then terminal. Read only the assigned core, its listed context ranges, its immutable capsule, and this protocol. Do not read a whole document, adjacent cores, audits 001/002, prior findings, closures, other reviewers, quarantined reports, or memory. Write nothing.

## Universal lens card

Inspect entrypoints/callers; behavior; lifecycle/states/transitions; actors/identity/authority/source of truth; provenance; persistence/migration; concurrency/idempotency/currentness; permissions/security/privacy/abuse; empty/unknown/estimated/partial/stale/denied/interrupted/cancelled/resumed/offline/degraded/unavailable/malicious/boundary/overload states; GUI truthfulness/accessibility/localization/responsiveness; integration/consumer propagation; observability/support/operations; performance/scale; compatibility; tests/acceptance oracles; and explicit versus unmarked builder discretion. Apply all relevant feature-archetype lenses.

## Exact role

Extract behavioral claims, actors, entrypoints, states, authority, data identities, events/schemas/artifacts, persistence, consumers, GUI effects, acceptance oracles, non-goals, and cross-window seams. A mention is not behavioral coverage.

## Adversarial role

Independently seek negative space, ambiguity, misleading certainty, contradictory authority, missing transitions, failure/degraded/security/currentness behavior, consumer propagation gaps, weak or circular oracles, and consequential unmarked invention. Do not see the exact reviewer’s output.

## Result contract

Return exactly one JSON object with: `result_id`, `assignment_id`, `document_path`, `window_id`, `role`, `agent_instance_id`, `agent_path`, `reviewed_core_range`, `reviewed_context_ranges`, `context_capsule_hash_verified`, `source_hash_verified`, `claims`, `negative_space_observations`, `ambiguities`, `builder_discretion`, `candidate_findings`, `cross_window_seams`, `evidence_refs`, `quality_state`, `zero_writes_confirmed`, and `blind_isolation_confirmed`. Use exact current line refs. Candidate findings remain unreconciled leads. `quality_state` must be `complete` only after the full assigned scope is reviewed.
"""
(AUDIT / "WINDOW_REVIEW_PROTOCOL.md").write_text(protocol, encoding="utf-8")

schemas = {
    "doc_window_assignments.jsonl": {
        "row_type": "window_assignment",
        "required_fields": ["assignment_id", "agent_instance_id", "agent_path", "thread_id", "document_path", "window_id", "role", "context_capsule_ref", "context_capsule_hash", "created_at", "completed_at", "prior_substantive_assignment_count", "terminal_after_result", "result_ref"],
    },
    "doc_window_results.jsonl": {
        "row_type": "window_result",
        "required_fields": ["result_id", "assignment_id", "agent_instance_id", "document_path", "window_id", "role", "reviewed_core_range", "reviewed_context_ranges", "claims", "candidate_findings", "evidence_refs", "quality_state"],
    },
    "document_integration_results.jsonl": {"row_type": "document_integration_result", "required_fields": ["result_id", "document_path", "agent_instance_id", "input_result_refs", "continuity", "contradictions", "missing_transitions", "candidate_findings"]},
    "feature_inventory.jsonl": {"row_type": "feature", "required_fields": ["feature_id", "name", "operating_behavior", "owner_docs", "consumer_docs", "window_refs", "inventory_sources", "risk_profile"]},
    "feature_scope_manifest.jsonl": {"row_type": "feature_scope", "required_fields": ["feature_id", "window_refs", "review_status", "research_status", "expectation_status", "claim_status", "scenario_status", "shadow_status", "mutation_status", "verdict"]},
    "obligation_claims.jsonl": {"row_type": "behavioral_claim", "required_fields": ["claim_id", "feature_id", "actors", "entrypoints", "states", "authority", "transitions", "failures", "consumers", "evidence", "freshness", "disposition"]},
    "research_evidence.jsonl": {"row_type": "research_brief", "required_fields": ["research_id", "feature_id", "agent_instance_id", "evidence_classes", "sources", "inspected_material", "freshness", "lessons", "tradeoffs", "alternatives", "challenged_assumptions", "classifications", "status"]},
    "scenario_matrix.jsonl": {"row_type": "scenario", "required_fields": ["scenario_id", "feature_id", "state_class", "preconditions", "actions", "expected_behavior", "oracle", "evidence", "disposition"]},
    "interpretation_diffs.jsonl": {"row_type": "interpretation_diff", "required_fields": ["diff_id", "feature_id", "shadow_builder_refs", "consequential_differences", "builder_discretion", "disposition"]},
    "mutation_campaign.jsonl": {"row_type": "mutation", "required_fields": ["mutation_id", "feature_id", "operator", "criticality", "generator_agent", "detector_agent", "killed", "detection_evidence", "survivor_disposition"]},
    "findings.jsonl": {"row_type": "finding", "required_fields": ["finding_key", "feature_id", "severity", "finding_family", "current_evidence", "owner_docs", "consumer_docs", "missing_behavioral_obligation", "consequence", "source_authority", "confidence", "recommended_direction", "classification"]},
    "prior_closure_reconciliation.jsonl": {"row_type": "prior_closure_reconciliation", "required_fields": ["finding_key", "current_evidence", "prior_ref", "current_disposition", "reason"]},
    "frontier_passes.jsonl": {"row_type": "frontier_pass", "required_fields": ["pass_id", "agent_instance_id", "input_scope", "new_high_severity_dimensions", "residual_frontier", "result_ref"]},
    "assignment_manifest.jsonl": {"row_type": "assignment_ref", "required_fields": ["assignment_id", "agent_instance_id", "role", "scope_type", "scope_id", "registry_ref", "state", "result_ref"]},
    "fresh_agent_assignment_registry.jsonl": {"row_type": "substantive_assignment", "required_fields": ["agent_instance_id", "agent_path", "thread_id", "assignment_id", "role", "scope_type", "scope_id", "context_capsule_ref", "context_capsule_hash", "created_at", "completed_at", "prior_substantive_assignment_count", "terminal_after_result", "terminal_at", "result_ref"]},
}

for name, schema in schemas.items():
    write_jsonl(
        AUDIT / name,
        [
            {"record_type": "audit_header", "audit_id": AUDIT_ID, "status": "initialized", "row_count": 0},
            {"record_type": "schema", **schema},
        ],
    )

coverage = {
    "audit_id": AUDIT_ID,
    "status": "initializing_manifest_revalidation_required",
    "complete": False,
    "blind_candidate_set_frozen": False,
    "documents": {"classified": 0, "authoritative": 0, "windowed": 0, "dual_reviewed": 0, "seam_reviewed": 0, "integrated": 0},
    "features": {"discovered": 0, "scope_rows": 0, "research_complete": 0, "research_exemptions_confirmed": 0, "claims_complete": 0, "scenarios_complete": 0, "shadow_complete": 0, "mutations_complete": 0},
    "fresh_agent_isolation": {
        "fresh_agent_isolation_passed": False,
        "unique_agents_spawned": 0,
        "substantive_assignment_count": 0,
        "duplicate_agent_identity_count": 0,
        "recycled_agent_count": 0,
        "multi_scope_agent_count": 0,
        "same_window_dual_role_identity_count": 0,
        "capsule_violation_count": 0,
        "post_terminal_result_count": 0,
    },
    "document_window_coverage": {},
    "research": {"mandatory_for_every_feature": True, "incomplete_count": 0, "valid_no_analogue_exemption_count": 0},
    "completion_blockers": ["manifest_not_revalidated", "fresh_agent_protocol_not_validated", "reviews_not_started", "feature_assurance_not_started"],
}
write_json(AUDIT / "coverage_report.json", coverage)
write_json(AUDIT / "fresh_agent_isolation_report.json", {"audit_id": AUDIT_ID, "status": "not_yet_validated", **coverage["fresh_agent_isolation"]})
write_json(AUDIT / "validator_results.json", {"audit_id": AUDIT_ID, "status": "initializing", "results": [], "all_required_validators_passed": False})
write_json(AUDIT / "blind_candidate_freeze.json", {"audit_id": AUDIT_ID, "status": "not_frozen", "frozen": False, "reason": "Fresh window roles, specialists, seams, and integrations are incomplete."})

checkpoint = f"""# Clean-Run Checkpoint

Audit ID: `{AUDIT_ID}`

Updated: `{NOW}`  
Goal status: `active`  
Audit status: `initializing_third_clean_run`  
Current phase: `mechanical_manifest_revalidation`  
Blindness gate: `active`  
Blind candidate set: `not_frozen`  
Coverage carried from audits 001/002: `none`

## Completed

- Interrupted/stopped reused reviewer queue in audit 002.
- Terminally superseded audit 002 for duplicate reviewer identity reuse.
- Preserved the same active no-budget Goal.
- Created this clean audit directory and fresh-agent charter.

## In progress

- Recompute and independently validate the closed-world document/window manifest from live source.
- Generate immutable hashed context capsules and validate fresh-agent isolation before any review assignment.

## Not started

- Fresh window reviews, specialists, seams, integrations, feature inventory, research, claims, scenarios, shadow builders, mutations, reconciliation, frontier passes, or verdicts.

## Safety

- Product/canonical writes: `0`
- Review coverage carried forward: `0`
- Commits/pushes/seals: `0`
"""
(AUDIT / "CHECKPOINT.md").write_text(checkpoint, encoding="utf-8")

lineage = f"""# Reset Lineage

- `audit-20260709-001-plan-assurance-blind-exhaustive`: `SUPERSEDED_INVALID_METHOD_FOR_ASSURANCE`; no windowed review coverage.
- `audit-20260709-002-plan-assurance-windowed-blind-exhaustive`: `SUPERSEDED_INVALID_AGENT_REUSE_FOR_ASSURANCE`; repeated reviewer identities across assignments; all substantive outputs invalid.
- `{AUDIT_ID}`: clean run with fresh-agent isolation at every semantic tier.

No prior review observation, conclusion, finding, percentage, or role completion may seed this run's blind phase.
"""
(AUDIT / "RESET_LINEAGE.md").write_text(lineage, encoding="utf-8")

placeholder = f"""# Audit Report

Audit ID: `{AUDIT_ID}`  
Status: `in_progress`  

No assurance verdict is available. Mechanical source/window validation and all fresh-agent review phases remain incomplete.
"""
(AUDIT / "AUDIT_REPORT.md").write_text(placeholder, encoding="utf-8")
(AUDIT / "FINAL_REPORT.md").write_text(placeholder.replace("# Audit Report", "# Final Report"), encoding="utf-8")

print(json.dumps({"audit_id": AUDIT_ID, "status": "initialized", "created_at": NOW}, sort_keys=True))
