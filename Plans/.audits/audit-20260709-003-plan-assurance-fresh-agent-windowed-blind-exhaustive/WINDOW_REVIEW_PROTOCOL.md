# Window Review Protocol

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
