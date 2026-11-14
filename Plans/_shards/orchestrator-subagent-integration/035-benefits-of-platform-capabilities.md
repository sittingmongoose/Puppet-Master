# Shard 035: Benefits of Platform Capabilities

Source: `Plans/orchestrator-subagent-integration.md`

Source lines: L5832-L5839

Source SHA256: `688305f369484024074fdad215c2aa989ed670c5ef587b58a01a144a5beac55b`

---

## Benefits of Platform Capabilities

1. **Rich Context:** Hooks and skills inject domain context into subagents.
2. **Validation:** Hook + orchestrator checks can reject unsafe actions.
3. **Quality Gates:** Lifecycle hooks and gates enforce completion quality.
4. **Deterministic Runtime:** Provider execution is explicit and replayable (transport-aware: CLI-bridged, direct-provider, or server-bridged per ProviderTransport taxonomy).
5. **Packaging:** Plugins/extensions keep subagent assets reusable.
6. **Tool Integration:** MCP extends tool access without changing orchestrator core.
