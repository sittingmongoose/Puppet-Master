# Shard 004: Executive Summary

Source: `Plans/agent-rules-context.md`

Source lines: L28-L38

Source SHA256: `95c2cfd80f6f84d3673a2ec3a50cd30f475a8c6a763595cac75b9699f525db08`

---

## Executive Summary

Rule: Agents invoked by Puppet Master (orchestrator iterations, interview, Assistant) MUST receive **two durable rule scopes** so that global and project-specific policies are always applied.
ContractRef: Primitive:DRYRules, PolicyRule:Decision_Policy.md§4

1. **Application-level rules (Puppet Master)** -- e.g. "Always use Context7 MCP." Apply to **every agent, everywhere**. Stored and configured at the **application** (Puppet Master) level and injected into every agent invocation regardless of project.
2. **Project-level rules** -- e.g. "Always use DRY Method." Apply to **every agent that works on that project**. Stored at the **project** (target workspace) level and injected whenever the agent is operating in the context of that project.

Rule: Both layers MUST be fed into every agent on every invocation (orchestrator iteration, interview turn, Assistant chat when attached to a project) via a **single rules pipeline** (DRY).
ContractRef: Primitive:DRYRules, ContractName:Plans/DRY_Rules.md#7

