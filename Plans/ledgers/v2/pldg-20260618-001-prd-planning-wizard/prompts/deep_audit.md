/goal Deep-audit latest PM Bootstrap Ledger-to-Plans cycle for exact semantic fidelity.

Input: ledger_id=pldg-20260618-001-prd-planning-wizard. Assume work is committed/pushed when possible.
Infer audit_id as the next Plans/.audits/audit-YYYYMMDD-NNN-<slug>. Infer the earliest contiguous cycle commit touching this ledger/registry as baseline; ask only if truly ambiguous.

Audit-only. Do not repair or edit Plans, ledgers, .plan_index, governance, code, WorkNodes, NodeSeeds, queues, manifests, implementation files, or production tasks. Write only Plans/.audits/<audit_id>/*.

Read AGENTS.md, ledger/Plan/PlanCompile owner docs, this ledger, changed live Plans docs, .plan_index, migration run if present, and Plans/.audits/_semantic_closure_registry.jsonl if present.

HARD PARALLEL GATE:
- Use many bounded read-only subagents in parallel for atom fidelity, exact-token/detail preservation, reciprocal PlanUnit lineage, owner routing, changed-doc fidelity, ledger consistency, GUI/command coverage, testing coverage, PlanCompile/WorkNode handoffs, index/governance, forbidden runtime artifacts, zero-incomplete scanning, and validator mutability.
- Record assignment IDs, input boundaries, atoms/docs/findings assigned, completion/failure, and returned evidence.
- Main agent writes final audit artifacts.
- Do not replace the required specialist wave with one broad agent. If parallel execution is unavailable, status is BLOCKED with an exact capability blocker.

Tasks:
1. Record inferred IDs, commit range, changed files, and evidence.
2. Build atom_fidelity_matrix.jsonl from compile_queue and every compiled_to_plan atom. Preserve source_refs, exact_tokens, key/enum shapes, examples, negative_constraints, stale/compat terms, owner_hints, GUI implications, and acceptance.
3. For each material detail prove live non-pipeline canonical evidence in PlanUnit canonical_text or governed prose. Metadata, source_lineage, token presence in source material, or generated indexes alone is not proof.
4. Check the semantic closure registry before emitting risks. Reuse unchanged valid closures as previously_closed; reopen only when source/canonical hashes or evidence changed.
5. Audit reciprocal lineage: every added/changed PlanUnit claim must be supported by cited atoms and every compiled atom detail must have canonical evidence.
6. Audit owner/consumer routing across PRD Builder, Planning Wizard, chat, ledger, testing, Plan Compile, Executor, Orchestrator, source control, permissions, contracts, models/personas, GUI, commands, artifacts, and governance.
7. Diff changed Plans for removed or drifted prose, headings, ContractRefs, exact tokens, aliases, and intentional replacements.
8. Verify all ledger projections agree and no sealed/compiled ledger leaves active candidate, open_question, ready_for_plan_compile, or blocker records without disposition.
9. Validate .plan_index and scan for forbidden runtime artifacts created during bootstrap compile.
10. Scan active first-party output for any unapproved stub, TODO, TBD, placeholder, empty required section, fake acceptance, or deferred implementation detail.
11. Run validators with git status before/after each; record and revert validator side effects.
12. Write audit_report.json, atom_fidelity_matrix.jsonl, planunit_source_claims.jsonl, owner_routing_findings.jsonl, changed_plan_fidelity.jsonl, closure_reuse.jsonl, ledger_consistency.json, validator_results.json, semantic_risks.jsonl, parallel_assignment_receipts.jsonl, and FINAL_REPORT.md.

FINAL_REPORT: PASS/PASS_WITH_WARNINGS/BLOCKED; IDs/range; changed files; PlanUnit deltas; unclosed semantic losses or none; previously_closed count; reciprocal lineage; owner routing; zero-incomplete result; ledger/governance; validators; forbidden artifacts; next safe action.
