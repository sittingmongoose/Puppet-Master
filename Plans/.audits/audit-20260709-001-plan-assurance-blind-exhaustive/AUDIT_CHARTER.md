# SUPERSEDED - INVALID METHOD FOR ASSURANCE

This charter is terminal lineage only. The audit began before mandatory per-document semantic windowing and independent dual-role window review were installed. Nothing in this directory is valid as document, feature, research, claim, scenario, mutation, or assurance coverage. The clean replacement is `audit-20260709-002-plan-assurance-windowed-blind-exhaustive`.

# Plan Assurance Audit Charter

Audit ID: `audit-20260709-001-plan-assurance-blind-exhaustive`

Status: `SUPERSEDED_INVALID_METHOD_FOR_ASSURANCE`

Created: `2026-07-10T01:20:48Z`

Baseline commit: `8ba30189a951181eb2ce8cfbc8aa69f32f61767b`

Baseline branch: `main`

Baseline worktree status digest: `sha256:fda9a16fc2c8c7ffa4bc7fca190374dd55efa1b5908cbe22eb39f9de31ba9f60`

## Objective

Exhaustively discover, model, falsify, and report specification gaps for every active Puppet Master feature, system, tool, workflow, provider, integration, and user-visible capability represented by the canonical Plans corpus, with 100 percent document and feature-scope accounting and no repairs.

## Authority and audit boundary

- Live, non-pipeline `Plans/**` content is the product-specification authority.
- `Plans/00-plans-index.md` is the authoritative navigation and owner-routing map, but named owner docs retain behavioral canon.
- `Plans/ledgers/**` is source-lineage/planning memory, not canonical product prose.
- `Plans/_shards/**`, `Plans/.evidence/**`, `Plans/.audits/**`, generated governance/index artifacts, and explicitly retired/source-lineage-only content are excluded from the primary product-authority corpus. They remain dispositioned evidence or later reconciliation inputs where applicable.
- Schemas, fixtures, registries, contract packets, validators, and real consumers are included when they define, constrain, validate, or consume active canonical behavior.
- The audit is read-only with respect to all repository content except this audit directory.
- No canonical Plans, code, schemas, fixtures, ledgers, PlanUnits, indexes, governance artifacts, Spec Lock, shards, evidence, closure registry, WorkNodes, NodeSeeds, queues, manifests, or runtime/product implementation may be repaired or edited.
- No commits, pushes, governance seals, mutating generators, runtime launches, WorkNodes, or build tasks are authorized.
- The main agent is the sole writer. Collaboration subagents are read-only and must return exact path and line evidence.

## Blindness protocol

The initial discovery phase is quarantined from:

- the two July 9 Downloads postmortems;
- prior broad-audit summaries;
- fablereport, ClaudeAudit, and SYNTHESIS reports;
- prior `Plans/.audits/**` findings;
- the semantic closure registry.

The blind phase may use current canonical Plans, current schemas/fixtures/contract consumers, read-only validators, and independently gathered external evidence. A blind candidate finding set will be hashed and frozen before prior-closure or prior-audit reconciliation begins. Prior closures may deduplicate or demonstrate current closure only when current evidence still supports them; they cannot prove global completeness.

## Assurance method

### Phase 1 - closed-world corpus and feature inventory

1. Mechanically census every `Plans/**` file and disposition every file.
2. Classify every active canonical doc and every relevant schema, fixture, validator, and consumer.
3. Build and reconcile three independent inventories:
   - PlanUnit/index/owner-map inventory;
   - user-visible surface, command, event, schema, provider, tool, workflow, page, setting, artifact, and integration inventory;
   - document-structure-derived capability inventory.
4. Assign stable feature IDs by operating behavior, not merely by document.
5. Require at least one feature-scope row for every discovered feature before substantive coverage can be complete.

### Phase 2 - open-world obligation discovery

For every feature, record intent/outcome envelope, actors, critical journeys, non-goals, promises, risks, and risk/novelty/volatility profile. At least two independent native same-configuration reviewers must build expectation models before detailed-plan comparison for each assessed cluster.

Universal lenses are: entrypoints/callers; behavior; lifecycle/state transitions; identity/authority; data provenance; persistence/migration; concurrency/idempotency/currentness; permissions/security/privacy/abuse; failure/degraded/empty/unknown/partial/cancel/resume/offline states; GUI truthfulness/accessibility/localization/responsiveness; integration/consumer propagation; observability/support/operations; performance/scale; compatibility; testing/acceptance evidence; and intentional builder discretion.

Feature-specific lenses are added for billing, auth, providers, agentic automation, collaboration, browser/web, storage, sync, destructive actions, plugins, deployments, containers, source control, media, and other applicable archetypes.

External research is mandatory by default for every `feature_id`. Risk, novelty, volatility, provider dependence, and consequence control research depth, breadth, source count, and falsification intensity; they do not determine whether research happens.

Every feature requires a research brief, produced before detailed Plans comparison wherever possible, that:

- identifies how comparable or adjacent systems address the same user outcome or underlying problem;
- consults multiple useful evidence classes where they exist: official documentation or standards, direct comparators, adjacent products using different approaches, real source/configuration, and issue/incident/user-friction evidence;
- records ideas, failure lessons, tradeoffs, design alternatives, and challenged assumptions, not only parity gaps;
- records source identity, version, publication or inspection date, freshness, and what was actually inspected;
- uses generalized, no-secret queries and never exposes local proprietary content or machine state;
- classifies each externally derived behavior or lesson as `required_external_constraint`, `required_for_user_outcome`, `transferable_lesson`, `risk_mitigation`, `optional_inspiration`, `explicitly_rejected`, `not_applicable_with_evidence`, or `unresolved`.

A feature may receive a `no_meaningful_external_analogue` exemption only when there is genuinely no useful analogue, standard, platform contract, adjacent system, or relevant failure literature. The exemption is a first-class research result and must contain the search/evidence basis, be independently reviewed, and be explicitly confirmed. Low risk, small size, apparent completeness, time pressure, or familiarity are not valid exemption reasons.

Research must demonstrate diversity and saturation rather than a single shallow result. If access, permissions, freshness, or source availability prevents meaningful research, the feature is marked `external_research_incomplete`, and its assurance verdict is limited or blocked rather than silently passed.

### Phase 3 - behavioral claim graph and impact proof

Consequential requirements are expressed as behavioral claims or invariants. Each claim links actors, entrypoints, states, authority/source of truth, transitions, failures, consumers, GUI surfaces, schemas/events/artifacts, persistence, acceptance oracles, owner docs, exact evidence, freshness, and disposition. A mention is not coverage. Consequential invention opportunities outside explicitly allowed builder discretion are gaps.

### Phase 4 - falsification

Every applicable feature receives happy-path and off-nominal scenarios covering empty, unknown, estimated, partial, stale, denied, interrupted, cancelled, resumed, concurrent, migrated, degraded, unavailable, malicious, boundary, and overload conditions as applicable.

Fresh-context shadow builders produce implementation blueprints only. Consequential disagreement outside declared builder discretion is an underspecification finding.

Every feature receives at least one applicable ephemeral mutation; high-risk features receive multiple. Critical mutants must be killed. Surviving material mutants become findings against the feature and the assurance method.

## Finding contract

Every finding must include:

- stable `finding_key` and `feature_id`;
- severity and finding family;
- exact current evidence with paths and line references;
- owner and consumer docs;
- missing behavioral obligation;
- customer and builder consequence;
- source authority and confidence;
- recommended decision or spec direction, without repair;
- disposition as `true_gap`, `deliberate_exclusion`, `optional_comparator_behavior`, `stale_claim`, or `unresolved_research_item`.

Per-feature verdicts are limited to `under_specified`, `assurance_blocked`, `evidence_sufficient_with_residual_risk`, and `implementation_ready_within_assurance_envelope`.

## Completion gates

The audit cannot complete until:

- 100 percent of active canonical Plan docs are classified;
- 100 percent of reconciled feature rows have required reviewer, claim, scenario, impact, and falsification evidence;
- no scope row is unclassified or sampled;
- required external research is current or explicitly unavailable with assurance impact;
- every feature has either a completed, diverse external-research brief or an evidence-backed, independently confirmed `no_meaningful_external_analogue` exemption;
- every incomplete research brief is marked `external_research_incomplete` and constrains or blocks the feature verdict;
- all critical mutations are killed and surviving material mutations are findings;
- consequential shadow-builder divergence is resolved or reported;
- two successive independent frontier passes produce no new high-severity obligation dimensions;
- residual risk, unsearched areas, freshness, research limits, and builder discretion are explicit;
- required artifacts validate;
- `FINAL_REPORT.md` gives a bounded, evidence-based verdict and does not equate internal consistency, validators, or prior closure with feature completeness.

## Method-quality measures

The audit will report mutation detection rate, critical mutation kill rate, surviving material mutation rate, interpretation divergence, false-positive burden, per-feature research completion, evidence-class diversity, source freshness, saturation, exemption rate and confirmation, external-research-incomplete rate, research cost, frontier convergence, document and feature coverage, and plausible unknown-obligation blind spots.
