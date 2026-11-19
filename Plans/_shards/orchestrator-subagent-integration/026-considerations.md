# Shard 026: Considerations

Source: `Plans/orchestrator-subagent-integration.md`

Source lines: L3523-L3530

Source SHA256: `aab3a84daf5765dd55948f63493973b3a79019c6141e475b844cc62f36934c26`

---

## Considerations

1. **Performance:** Subagent detection should be cached, not recomputed every iteration
2. **Fallbacks:** Always have fallback subagents if detection fails
3. **Multiple Subagents:** Support parallel subagent invocation when appropriate
4. **Configuration Overrides:** Allow manual overrides for edge cases
5. **Language Detection:** Handle multi-language projects (e.g., Rust + TypeScript)
6. **Subagent Availability:** Check if subagent files exist before selection
