# Window Review Protocol

Each assignment is read-only and covers one manifest window plus only its listed context ranges and small capsule.

Agents must not read the whole source document, prior audits, closure records, superseded audit outputs, quarantined reports, or neighboring source beyond explicit context ranges.

Before review:

1. Read the assigned capsule row.
2. Read the exact core and context lines only.
3. Verify the core SHA-256 against `window_source_hash` using exact source bytes for the line range.
4. Stop and report `source_hash_mismatch` if verification fails.

`contract_capability_exact_behavior` returns claims/invariants, actors, entrypoints, intent/outcome, state transitions, authority/source of truth, identity, provenance, persistence, consumers, GUI, schemas/events/artifacts, acceptance oracles, non-goals, builder discretion, ambiguities, seams, and candidate findings without repair.

`adversarial_negative_space` returns applicable off-nominal states; security/privacy/abuse/permission challenges; concurrency/idempotency/currentness/migration challenges; failure/retry/cancel/resume/degraded/unavailable/malicious/boundary/overload gaps; contradictions; hidden assumptions; consequential invention opportunities; seams; and candidate findings without repair.

Every response must be structured JSON and contain `result_id`, `assignment_id`, `document_path`, `window_id`, `role`, `agent_id`, `reviewed_core_range`, `reviewed_context_ranges`, `source_hash_verified`, `claims`, `negative_space_observations`, `ambiguities`, `builder_discretion`, `candidate_findings`, `cross_window_seams`, `evidence_refs`, `quality_state`, and `zero_writes_confirmed`.

A finding candidate is only a lead until main-agent reconciliation after both roles and document integration. Agents never edit files.
