# Shard 026: Considerations

Source: `Plans/orchestrator-subagent-integration.md`

Source lines: L3521-L3528

Source SHA256: `60d3ef46e9d34adfd5e01d6a25d733f35f7c9bf6280b24227df7618c875cba23`

---

## Considerations

1. **Performance:** Subagent detection should be cached, not recomputed every iteration
2. **Fallbacks:** Always have fallback subagents if detection fails
3. **Multiple Subagents:** Support parallel subagent invocation when appropriate
4. **Configuration Overrides:** Allow manual overrides for edge cases
5. **Language Detection:** Handle multi-language projects (e.g., Rust + TypeScript)
6. **Subagent Availability:** Check if subagent files exist before selection
