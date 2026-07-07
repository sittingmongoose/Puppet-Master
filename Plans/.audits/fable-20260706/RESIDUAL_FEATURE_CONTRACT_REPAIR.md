# Residual FABLE Feature-Contract Repair

Generated: 2026-07-07T23:30:00Z

## Scope

This repair closes one bounded residual Critical/High feature-contract cleanup for FABLE audit `fable-20260706`. It updates owner Plans docs and closure artifacts only. It does not create WorkNodes, NodeSeeds, executable queues, final node manifests, implementation files, runtime launches, runtime certification evidence, production build tasks, or a buildability pass claim.

## Read-Only Subagents

- Contracts leftovers: 019f3ecf-d700-7822-ab99-05fcb31a0576
- Chat/thread/question mechanics: 019f3ecf-d7c7-7ac2-a208-fb36b7b4789d
- Permissions/skills/auth: 019f3ecf-d87c-76d2-9cf1-7c0a0fc58b1f
- Provider/bridge/release/plugin/models/MCP/multi: 019f3ecf-d94e-7d53-9247-a5a709d82828
- PNC/ledger/PRD: 019f3ecf-da34-7560-87c1-e5db555b72e1
- Closure/validators: 019f3ecf-db21-7152-b8e3-e7761f95eb34

## Closed Rows

- Scoped residual source rows: 50
- Source artifact: `Plans/.audits/fable-20260706/residual_feature_contract_findings.jsonl`
- Matrix rows appended: 50 in `repair_closure_matrix.jsonl`
- Impact rows appended: 50 in `repair_impact_matrix.jsonl`
- Global semantic closure rows appended: 50 in `Plans/.audits/_semantic_closure_registry.jsonl`

## Owner Doc Repairs

- `Contracts_V0.md`: filled old empty owner-section headings and tightened CV-306/CV-307/CV-308 plus CV-314.
- `assistant-chat-design.md`: added questionnaire schema, thread restore table, Stop/Edit/Resend semantics, annotation reanchoring minima, and empty revert behavior through ACD-433.
- `Permissions_System.md` and `Skills_System.md`: added invocation ask/consent bridge, timeout units/defaults/expiry, remediation command refs, and scoped import hardening.
- `GitHub_API_Auth_and_Flows.md`: added OAuth device-code steps, error codes, scopes, and credential-store naming in GAAAF-014.
- `CLI_Bridged_Providers.md`: added argv/env/stdin, exit normalization, child-process reap, and JSON/JSONL stream bounds in CBP-026.
- `Plan_To_Node_Compilation.md`, `Planning_Ledger_System.md`, and `PRD_Builder.md`: added NodeSeed schema authority, ledger service API/storage boundary, and PRD conflict/scoring/resource defaults.
- `Release_Supply_Chain.md`, `Plugins_System.md`, `Models_System.md`, `MCP_Integration.md`, and `Multi-Account.md`: added the scoped residual schema/default/hook/signing/liveness contracts named by FABLE rows.

## Explicit Non-Closures

- `buildability_gate_passed` remains false.
- `IRB-005` and `IRB-011` remain open runtime certification blockers.
- Owner-decision rows and unrelated FABLE backlog rows remain open in `buildability_repair_registry.jsonl`.
- GUI wiring, FileSafe, storage, platform_specs, Slint/web, and contract-runtime core closures were not redone.

## Validation Plan

The requested validation suite is run after derived artifacts are regenerated from the stable docs and closure rows.
