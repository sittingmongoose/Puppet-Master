# Platform Specs Closure Hardening - FABLE 20260706

Generated: 2026-07-07T19:36:27Z

## Decision

The FABLE platform_specs authority closure is provider/model scoped, not a global retirement of every `platform_specs` token.

Retired for active provider/model authority:
- provider/model capability snapshots
- context-window and max-token fields
- fallback chains and historical `fallback_model_ids` projections
- requested/effective model capability disclosure
- Contracts_V0 capability snapshot refs

Separately adjudicated and not closed by the provider/model authority repair:
- binary discovery and CLI binary names
- CLI invocation formatting
- platform display names
- tool-policy-to-CLI mapping
- skills injection and provider-native package delivery

## Superseded Mechanical Rows

The following FABLE mechanical rows are stale because `PLATFORM_SPECS_AUTHORITY_REPAIR.md`, `platform_specs_authority_repair_report.json`, and the live owner docs now prove the provider/model authority repair:
- `fable-20260706-report-l0091-verdict-real-contradiction-high-inconsistent-openref-mostly-internal-to-03c9f709`
- `fable-20260706-report-l0473-high-l1904-1910-vs-l194-195-2319-3874-17-3-context-repack-sources-max-to-df7240c0`
- `fable-20260706-report-l0474-high-l3865-3874-acd-009-the-planunit-meant-to-restate-1-1-instead-assert-20b32d01`
- `fable-20260706-report-l0475-high-l11973-13606-vs-l15007-15577-acd-255-257-260-262-268-the-contradict-62f185d3`
- `fable-20260706-report-l0639-critical-l435-462-capability-matrix-has-no-context-window-max-context-to-c18124c7`
- `fable-20260706-report-l0641-critical-l13-295-306-doc-claims-sole-ssot-for-model-config-but-never-men-9fc4271a`
- `fable-20260706-report-l0648-high-platform-specs-term-does-not-appear-anywhere-in-models-system-md-de-24ff7df0`

Those rows should not be rediscovered as open provider/model authority defects unless the repaired owner evidence changes or the semantic closure registry reopens the provider/model authority closure.

## Remaining Residue Adjudication

- `Plans/FileSafe.md` uses `platform_specs::` as a broad platform-data DRY rule. This is non-provider platform-adapter residue and is not closed by the provider/model authority repair.
- `Plans/Tools.md` uses `platform_specs` for platform-native tool mapping and tool-policy-to-CLI derivation. This is separately adjudicated platform-adapter residue.
- `Plans/WorktreeGitImprovement.md` uses `platform_specs` in generic DRY prose and git/worktree platform-data notes. This is separately adjudicated and not evidence of provider/model authority drift.
- `Plans/newtools.md` uses `platform_specs::` in broad DRY prose, including stale model/auth/capability wording. Provider/model capability authority remains with `Plans/Models_System.md`; the broad DRY wording is out of scope for this closure.
- `Plans/orchestrator-subagent-integration.md` uses `platform_specs` for invocation format, parser selection, binary names, display names, capability discovery, and provider-native package strategy. These are non-provider platform-adapter concerns that need their own owner boundary if repaired later.
- `Plans/MiscPlan.md` M-083 remains `needs_repair`: it names a versioned `platform_specs` skill-injection contract, but the current evidence does not prove a concrete canonical schema/owner, and `Plans/Skills_System.md` says provider-private skill injection is not a canonical runtime path.
- `Plans/chain-wizard-flexibility.md` is retired compatibility/source-lineage per the Plans index, so its `platform_specs` mentions are source-lineage only.

## Stop Rule

This hardening does not repair FileSafe security semantics, tier vocabulary, UI command catalog, wiring matrix, broad Contracts_V0 gaps, Goal Runtime, Executor Protocol, missing docs, broad PlanUnit boilerplate, or the M-083 skill-injection owner/schema gap.
