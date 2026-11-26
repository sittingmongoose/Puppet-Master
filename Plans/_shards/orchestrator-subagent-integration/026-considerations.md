# Shard 026: Considerations

Source: `Plans/orchestrator-subagent-integration.md`

Source lines: L3540-L3547

Source SHA256: `8818b20e32be6ed5a2732e83e3ac8bc3dbb313f211db79aeecb606ef3acb6a3b`

---

## Considerations

1. **Performance:** Subagent detection should be cached, not recomputed every iteration
2. **Fallbacks:** Always have fallback subagents if detection fails
3. **Multiple Subagents:** Support parallel subagent invocation when appropriate
4. **Configuration Overrides:** Allow manual overrides for edge cases
5. **Language Detection:** Handle multi-language projects (e.g., Rust + TypeScript)
6. **Subagent Availability:** Check if subagent files exist before selection
