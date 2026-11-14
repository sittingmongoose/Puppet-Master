# Shard 035: Benefits of Platform Capabilities

Source: `Plans/orchestrator-subagent-integration.md`

Source lines: L5834-L5841

Source SHA256: `21e7054b32964d9ed59add05ee7acc1006c4e7f1cc024ed6d05f24d7f581223d`

---

## Benefits of Platform Capabilities

1. **Rich Context:** Hooks and skills inject domain context into subagents.
2. **Validation:** Hook + orchestrator checks can reject unsafe actions.
3. **Quality Gates:** Lifecycle hooks and gates enforce completion quality.
4. **Deterministic Runtime:** Provider execution is explicit and replayable (transport-aware: CLI-bridged, direct-provider, or server-bridged per ProviderTransport taxonomy).
5. **Packaging:** Plugins/extensions keep subagent assets reusable.
6. **Tool Integration:** MCP extends tool access without changing orchestrator core.
