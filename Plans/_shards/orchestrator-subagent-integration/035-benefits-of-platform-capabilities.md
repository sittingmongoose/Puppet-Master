# Shard 035: Benefits of Platform Capabilities

Source: `Plans/orchestrator-subagent-integration.md`

Source lines: L5832-L5839

Source SHA256: `60d3ef46e9d34adfd5e01d6a25d733f35f7c9bf6280b24227df7618c875cba23`

---

## Benefits of Platform Capabilities

1. **Rich Context:** Hooks and skills inject domain context into subagents.
2. **Validation:** Hook + orchestrator checks can reject unsafe actions.
3. **Quality Gates:** Lifecycle hooks and gates enforce completion quality.
4. **Deterministic Runtime:** Provider execution is explicit and replayable (transport-aware: CLI-bridged, direct-provider, or server-bridged per ProviderTransport taxonomy).
5. **Packaging:** Plugins/extensions keep subagent assets reusable.
6. **Tool Integration:** MCP extends tool access without changing orchestrator core.
