# Shard 035: Benefits of Platform Capabilities

Source: `Plans/orchestrator-subagent-integration.md`

Source lines: L5798-L5805

Source SHA256: `dd21f711108a3d492d7911a4fcf10b603e22945722cc0f04069ce2ef993fb3ba`

---

## Benefits of Platform Capabilities

1. **Rich Context:** Hooks and skills inject domain context into subagents.
2. **Validation:** Hook + orchestrator checks can reject unsafe actions.
3. **Quality Gates:** Lifecycle hooks and gates enforce completion quality.
4. **Deterministic Runtime:** Provider execution is explicit and replayable (transport-aware: CLI-bridged, direct-provider, or server-bridged per ProviderTransport taxonomy).
5. **Packaging:** Plugins/extensions keep subagent assets reusable.
6. **Tool Integration:** MCP extends tool access without changing orchestrator core.
