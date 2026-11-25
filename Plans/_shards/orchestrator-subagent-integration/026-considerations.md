# Shard 026: Considerations

Source: `Plans/orchestrator-subagent-integration.md`

Source lines: L3527-L3534

Source SHA256: `f3b67f84c4309b6ce4c0909cd27335581eff5ae15fdc15772f0c865a9871e812`

---

## Considerations

1. **Performance:** Subagent detection should be cached, not recomputed every iteration
2. **Fallbacks:** Always have fallback subagents if detection fails
3. **Multiple Subagents:** Support parallel subagent invocation when appropriate
4. **Configuration Overrides:** Allow manual overrides for edge cases
5. **Language Detection:** Handle multi-language projects (e.g., Rust + TypeScript)
6. **Subagent Availability:** Check if subagent files exist before selection
