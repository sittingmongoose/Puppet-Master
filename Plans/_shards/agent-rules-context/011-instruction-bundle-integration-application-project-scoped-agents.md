# Shard 011: Instruction Bundle Integration (Application + Project + Scoped `AGENTS.md`)

Source: `Plans/agent-rules-context.md`

Source lines: L129-L149

Source SHA256: `7815be0dff378aa826fab1ec2295a7c1e1f87c5580142922ed5b3c64a58698de`

---

## Instruction Bundle Integration (Application + Project + Scoped `AGENTS.md`)

This plan's durable rules pipeline remains the user-editable source of rules text, but every agent invocation assembles a deterministic **Instruction Bundle** instead of relying on legacy injector naming.

**Instruction Bundle order:**
1. Application rules
2. Project rules (when a project is selected)
3. Scoped `AGENTS.md` instruction chain, when enabled

Rules:
- the shared rules pipeline outputs rules content only; it does not inject attempt journals, parent summaries, or assistant-only memory
- Assistant memory, Attempt Journal, and Parent Summary are separate memory/context injectors and MUST NOT masquerade as rules text
- provider cache controls such as `copilot_cache_control` and Anthropic-like cache-marker eligibility are resolved by Prompt Pipeline/provider owners using explicit provider and model-id evidence; the rules pipeline must not infer cache behavior from rule text or model-id heuristics
- within the scoped `AGENTS.md` chain, closest scope wins and identical content is deduplicated deterministically
- Application rules outrank Project rules and all scoped `AGENTS.md` content; Project rules outrank scoped `AGENTS.md`
- prompt builders for Assistant, Interview, Orchestrator, and delegated child runs all use the same assembly order and names
- provider-native instruction loaders may be configured to read equivalent context files; for Gemini, settings can override `context.fileName` so `AGENTS.md` is included alongside or instead of the native Gemini context filename

ContractRef: ContractName:Plans/Contracts_V0.md#InstructionBundleAssembly, ContractName:Plans/assistant-memory-subsystem.md, ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/interview-subagent-integration.md

<a id="FeatureSpecVerbatim"></a>
