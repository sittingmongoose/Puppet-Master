# Shard 004: Executive Summary

Source: `Plans/agent-rules-context.md`

Source lines: L28-L37

Source SHA256: `239ee9829dfe15dd51e8664b8363b46c63f10b843f88fe43aeedc72ad954280d`

---

## Executive Summary

Rule: Every invocation uses the single rules pipeline with Everywhere and actual Computer application context, and real Project rules only when bound. In No project, `project_path=None` is normal and no application, thread or Computer identity is guessed.
ContractRef: Primitive:DRYRules, PolicyRule:Decision_Policy.md§4

1. **Application-level rules (Puppet Master)** -- e.g. "Always use Context7 MCP." Apply to **every agent, everywhere**. Stored and configured at the **application** (Puppet Master) level and injected into every agent invocation regardless of project.
2. **Project-level rules** -- e.g. "Always use DRY Method." Apply to **every agent that works on that project**. Stored at the **project** (target workspace) level and injected whenever the agent is operating in the context of that project.

Rule: Every applicable instruction source is fed through the single rules pipeline for Orchestrator, Interview and Assistant, including an app Assistant invocation. App rules win on conflict as ARC-008 states; ordinary Settings narrower-level selection does not reverse instruction precedence.
ContractRef: Primitive:DRYRules, ContractName:Plans/DRY_Rules.md#7
