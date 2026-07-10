# TERMINAL RESET — SUPERSEDED_INVALID_AGENT_REUSE_FOR_ASSURANCE

Audit ID: `audit-20260709-002-plan-assurance-windowed-blind-exhaustive`  
Superseded by: `audit-20260709-003-plan-assurance-fresh-agent-windowed-blind-exhaustive`  
Superseded at: `2026-07-10T02:19:17Z`

This audit is terminally invalid for assurance because the same substantive reviewer identities were reused across multiple window/role assignments. All assignments, results, claims, observations, candidate findings, role completions, coverage counts, integrations, seams, research, scenarios, shadow-builder outputs, and mutations from this directory have **zero assurance credit** and must never seed the replacement audit's blind finding set.

Only mechanical path census, source hashes, and core-range window routing may be consulted as non-authoritative lineage, and only after independent revalidation in audit `003`. The active Goal continues unchanged.

Duplicate/recycled reviewer identities: `/root/window_worker_a, /root/window_worker_b, /root/window_worker_c`.  
Invalidated substantive assignments: `11`.  
Invalidated persisted results: `5`.

---

# Windowed Blind Exhaustive Plan Assurance Audit Charter

Audit ID: `audit-20260709-002-plan-assurance-windowed-blind-exhaustive`

Status: `window_manifest_validated_assignments_allowed`

Created: `2026-07-10T01:48:29Z`

Baseline commit: `8ba30189a951181eb2ce8cfbc8aa69f32f61767b`

Baseline branch: `main`

Supersedes: `audit-20260709-001-plan-assurance-blind-exhaustive`

## Objective

Exhaustively discover, model, falsify, and report specification gaps for every active Puppet Master feature, system, tool, workflow, provider, integration, and user-visible capability represented by the canonical Plans corpus, with 100 percent document and feature-scope accounting and no repairs.

The same no-budget Goal remains active through this clean restart.

## Clean-run rule

The superseded audit began before mandatory semantic document windowing and is quarantined from this blind run. Its candidate observations, inferred features, summaries, conclusions, percentages, assignments, and review results cannot seed this audit and satisfy no gate. Only independently recomputed mechanical paths, counts, and hashes may be used as non-authoritative routing data.

All phases restart from zero.

## Authority and safety

- Read `AGENTS.md` and `Plans/00-plans-index.md` before substantive work.
- Live non-pipeline `Plans/**` is canonical; named owner docs retain behavior authority while the index routes ownership.
- `Plans/ledgers/**` is planning/source-lineage memory, not canonical product prose.
- `Plans/_shards/**`, `Plans/.evidence/**`, `Plans/.audits/**`, generated migration/index/governance outputs, and explicitly retired/source-lineage-only docs are excluded from primary product authority and receive explicit dispositions.
- Relevant schemas, fixtures, registries, contracts, validators, and real consumers are audited as machine-contract or secondary evidence surfaces.
- Audit-only: no repairs or edits to canonical Plans, schemas, fixtures, code, ledgers, PlanUnits, indexes, governance artifacts, Spec Lock, shards, evidence, closure registry, WorkNodes, NodeSeeds, queues, manifests, or runtime/product implementation.
- The only permitted new-run writes are inside this audit directory. Reset notices in the superseded audit are already terminal lineage writes.
- The main agent is the sole writer. Native collaboration agents are read-only and must return exact evidence with path and line references.
- Do not commit, push, seal governance, run mutating generators, launch runtime/product builds, or create execution artifacts.
- Use only native collaboration agents that inherit the parent task's gpt-5.6-sol/ultra configuration. No model override or weaker substitute is permitted.

## Blindness and anti-anchoring

Until the new blind candidate set is frozen, do not open or use:

- the two July 9 Downloads postmortems;
- prior broad-audit summaries;
- fablereport, ClaudeAudit, or SYNTHESIS reports;
- prior `Plans/.audits/**` findings or closure conclusions;
- the semantic closure registry;
- the superseded audit's candidate observations, feature inferences, summaries, or agent review output;
- prior coverage/verification report bodies that would anchor expectations.

The blind expectation model is rebuilt from current window-level canonical source extraction plus independently gathered external evidence. After freeze, prior closure/audit material may be reconciled for deduplication or current closure only. Prior closure never proves global completeness.

## Mandatory hierarchical document windowing

No large active canonical Plan document is assigned wholesale to an agent.

### Window construction

- Mechanically partition every active authoritative document before assigning review agents.
- Default maximum non-overlapping core: 400 source lines and approximately 12,000 tokens, whichever is reached first.
- Prefer complete heading, table, schema, contract, state-machine, and PlanUnit boundaries.
- Never silently truncate a PlanUnit, contract, table, schema object, or state machine.
- If one semantic block exceeds either budget, subdivide it into explicit field/section subwindows with a shared parent block ID, source provenance, and hash.
- Every window records a deterministic non-overlapping core range and bounded context/overlap ranges for seam visibility.
- Context overlap never counts toward core coverage.
- Every authoritative source line must belong to exactly one core range.
- Every non-authoritative line or document must have an explicit disposition; no line disappears from accounting.
- Every row records document path, window ID, core start/end, context/overlap ranges, heading/anchor path, whole-source and window hashes, token estimate, semantic block IDs, PlanUnit/contract IDs, required roles, assignments, state, and result refs.

### Mechanical source-coverage proof

Before review assignments begin, validate:

- union of core ranges covers every authoritative source line exactly once;
- zero gaps;
- zero duplicate core ownership;
- zero unclassified lines;
- every oversized semantic block has explicit subwindows;
- no core exceeds 400 lines or the approximately 12,000-token budget without a recorded exceptional semantic subdivision reason;
- every boundary has an adjacent seam record;
- every PlanUnit/contract/state table crossing windows is explicitly listed for seam review.

A document path in a manifest is not review coverage.

### Required independent window roles

Every authoritative window receives at least two independent native same-configuration assignments:

1. `contract_capability_exact_behavior`
   - actors, entrypoints, callers, intent/outcome, explicit behavior;
   - states and transitions;
   - identity, authority, source of truth, provenance;
   - consumers, GUI surfaces, schemas, events, artifacts, persistence;
   - acceptance oracles, non-goals, and declared builder discretion.

2. `adversarial_negative_space`
   - empty, unknown, estimated, partial, stale, denied, interrupted, cancelled, resumed, concurrent, migrated, degraded, unavailable, malicious, boundary, and overload states as applicable;
   - ambiguity, contradiction, missing authority/currentness/idempotency;
   - permissions, security, privacy, abuse, failure recovery;
   - consequential builder-invention opportunities.

High-risk or dense windows receive applicable specialists for external constraints, GUI truthfulness/accessibility/localization/responsiveness, security/privacy/abuse, schemas/state machines, concurrency/idempotency/currentness, or test-oracle quality.

Agents read only the assigned window plus a small context capsule. They do not read the whole giant source document.

### Document integration and seams

After all windows for a document complete both required roles:

- a fresh document integrator reads structured window results and claim rows, not the full giant document;
- it reconciles ownership, terminology, lifecycle/state continuity, duplicate or contradictory contracts, missing transitions, and unresolved seams;
- a separate seam reviewer checks every adjacent-window boundary and every PlanUnit/contract/table/state machine crossing windows;
- integrators may perform narrow source spot-checks but cannot replace missing window reviews with a whole-file impression.

Only completed dual-reviewed, seam-checked, integrated document source may feed feature synthesis.

## Closed-world inventory after window extraction

Build three independent inventories from validated window outputs and independent mechanical sources, then reconcile their union:

1. PlanUnit/index/owner-map inventory.
2. User-visible surfaces, commands, events, schemas, providers, tools, workflows, pages, settings, artifacts, and integrations.
3. Capability extraction from document structure and window claims.

Use stable feature IDs and split cross-cutting features by operating behavior. Every active doc, machine contract, and feature must have accountable scope rows. Feature clustering never replaces per-line/window accounting.

## Mandatory external research for every feature

External research is mandatory by default for every `feature_id`. Risk, novelty, volatility, provider dependence, and consequence control depth, breadth, source count, and falsification intensity; they do not decide whether research occurs.

Every feature gets a research brief before detailed Plans comparison wherever possible. Each brief:

- identifies how comparable or adjacent systems address the same user outcome or underlying problem;
- consults multiple useful evidence classes where they exist: official documentation or standards, direct comparators, adjacent products with different approaches, real source/configuration, and issue/incident/user-friction evidence;
- records ideas, failure lessons, tradeoffs, design alternatives, and challenged assumptions, not only parity gaps;
- distinguishes `required_external_constraint`, `required_for_user_outcome`, `transferable_lesson`, `risk_mitigation`, `optional_inspiration`, `explicitly_rejected`, `not_applicable_with_evidence`, and `unresolved`;
- records source identity, version, date, freshness, inspection date, and what was inspected;
- uses generalized no-secret queries and exposes no proprietary local content or machine state;
- records diversity and saturation.

A `no_meaningful_external_analogue` exemption is allowed only when there is genuinely no useful analogue, standard, platform contract, adjacent system, or failure literature. It is a first-class evidence-backed research result and requires independent confirmation. Low risk, small size, familiarity, time pressure, or apparent completeness are invalid reasons.

Insufficient access, permission, freshness, or source availability yields `external_research_incomplete` and limits or blocks the feature verdict.

## Behavioral claim graph and impact proof

Express consequential obligations as claims/invariants rather than mentions. Link each claim to actors, entrypoints, states, authority/source of truth, transitions, failures, consumers, GUI surfaces, schemas/events/artifacts, persistence, acceptance oracles, owner docs, exact evidence, freshness, disposition, window result refs, document integration refs, and seam refs. A mention is not coverage.

Declared builder discretion is recorded explicitly. Consequential unmarked invention opportunities are gaps.

## Falsification

For every feature:

- generate happy-path and applicable off-nominal scenarios;
- run fresh-context shadow-builder blueprint comparison with schemas/state machines/APIs/UI states/failure rules/tests and no code;
- report consequential disagreement outside declared discretion;
- run at least one applicable ephemeral mutation, with multiple mutations for high-risk features;
- mutation operators include removing unknown/error states, loosening schemas/enums, deleting consumers, swapping authority, omitting retry/cancel/resume/migration, weakening idempotency/currentness, removing authorization, and converting estimated/partial data into misleading certainty;
- kill every critical mutant; surviving material mutants become findings against the feature and assurance method.

## Finding contract

Every finding includes stable `finding_key`, `feature_id`, severity, family, exact current evidence, window and claim refs, owner and consumer docs, missing behavioral obligation, customer/builder consequence, source authority, confidence, recommended decision/spec direction without repair, and disposition as `true_gap`, `deliberate_exclusion`, `optional_comparator_behavior`, `stale_claim`, or `unresolved_research_item`.

Per-feature verdicts are limited to `under_specified`, `assurance_blocked`, `evidence_sufficient_with_residual_risk`, and `implementation_ready_within_assurance_envelope`.

## Completion gates

The Goal remains active until all are true:

- 100 percent of active canonical docs and relevant machine-contract consumers are classified.
- Every authoritative source line has exactly one core window; gap count, duplicate-core count, and unclassified-line count are zero.
- Every authoritative window completed both independent required roles.
- Every document has multiple native same-configuration agents, a fresh integration result, and separate completed seam review.
- Unreviewed authoritative window count is zero.
- The reconciled feature inventory is reconstructed from new-run window extraction and independent mechanical inventories only.
- 100 percent of features have completed reviewer, claim, scenario, impact, falsification, and research rows.
- Every feature has completed diverse external research or a valid independently confirmed no-analogue exemption.
- Incomplete research explicitly limits or blocks verdicts.
- All critical mutations are killed; surviving material mutations are findings.
- Consequential shadow-builder divergence is resolved or reported.
- Two successive independent frontier passes produce no new high-severity obligation dimensions.
- Blind candidate set is frozen only after all window, integration, seam, research, claim, scenario, and mutation prerequisites required for freeze are complete.
- Prior closure reconciliation occurs only after freeze.
- Residual risks, unsearched areas, freshness, research limits, and builder discretion are explicit.
- Required artifacts validate and the final report gives an honest bounded verdict.

Internal consistency, current validators, buildability gates, node readiness, and prior closures are evidence within their stated envelopes only. None is feature-completeness proof.

## Method-quality metrics

Report document/window/line coverage, role completion, agent multiplicity, integration/seam completion, mutation detection and survival, interpretation divergence, false-positive burden, research completion/diversity/freshness/saturation/exemptions/incompleteness/cost, frontier convergence, document and feature coverage, and plausible ways unknown obligations could still be missed.
