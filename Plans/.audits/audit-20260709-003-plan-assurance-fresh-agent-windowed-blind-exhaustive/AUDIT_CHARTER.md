# TERMINAL ARCHITECTURAL SUPERSESSION — SUPERSEDED_INVALID_INSUFFICIENT_HORIZONTAL_PARALLELISM_FOR_THIS_ASSURANCE_RUN

Audit ID: `audit-20260709-003-plan-assurance-fresh-agent-windowed-blind-exhaustive`  
Successor ID: `audit-20260709-004-plan-assurance-horizontally-sharded-fresh-agent-blind-exhaustive`  
Superseded at: `2026-07-10T02:35:40Z`

This audit is stopped and has **zero substantive assurance credit**. The three-subagent concurrency ceiling is insufficient for the exhaustive 1,248-window run, so the source task will launch the successor across multiple isolated top-level gpt-5.6-sol/ultra runner tasks. This is an architectural scaling decision, not a criticism of the fresh-agent isolation protocol.

All audit-003 assignments, returned or persisted results, claims, observations, candidate findings, role completions, coverage counts, integrations, seam conclusions, research, scenarios, shadow-builder outputs, and mutations are invalid and must never seed audit 004's blind set. Only independently reproducible corpus/window/hash/seam/capsule construction may survive as quarantined routing lineage, and only after independent revalidation by the successor master coordinator.

Interrupted active agents: `/root/fa003_w0002_exact_000003, /root/fa003_w0002_adversarial_000004, /root/fa003_w0003_exact_000005`. No replacements were dispatched. Audit 004 was not created here. The active Goal was not completed, blocked, or otherwise modified.

---

# Audit Charter

Audit ID: `audit-20260709-003-plan-assurance-fresh-agent-windowed-blind-exhaustive`  
Status: `initializing_fresh_agent_clean_run`  
Created: `2026-07-10T02:22:57Z`  
Goal status: `active`  
Audit mode: `blind`, `audit-only`, `no repairs`

## Objective

Exhaustively discover, model, falsify, and report specification gaps for every active Puppet Master feature, system, tool, workflow, provider, integration, and user-visible capability represented by the canonical Plans corpus, with 100 percent document and feature-scope accounting and no repairs.

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
