# Shard 003: Rewrite alignment (2026-02-21)

Source: `Plans/agent-rules-context.md`

Source lines: L16-L26

Source SHA256: `973cc1c959ccca05ed7bb6a3a3be1c4c8b7d537342c2897621b42cf489e5671b`

---

## Rewrite alignment (2026-02-21)

This rules model remains authoritative, and becomes more important under the rewrite described in `Plans/rewrite-tie-in-memo.md`:

- Providers, tool policy, and the agent loop MUST all consume the same **single rules pipeline** output.
  ContractRef: Primitive:DRYRules, ContractName:Plans/Crosswalk.md
- "No API keys" is now "no API keys **except Gemini** (subscription-backed API key allowed)."
  ContractRef: ContractName:Plans/rewrite-tie-in-memo.md, Invariant:INV-002
- OpenCode-style determinism means rules injection MUST be reproducible and represented in the unified event stream (seglog ledger) where relevant.
  AutoDecision: Persist rules injection provenance by including `rules_application_sha256` and `rules_project_sha256` fields in the `run.started` payload.
  ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md#EventRecord
