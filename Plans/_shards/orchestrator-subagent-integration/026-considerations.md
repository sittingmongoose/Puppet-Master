# Shard 026: Considerations

Source: `Plans/orchestrator-subagent-integration.md`

Source lines: L3521-L3528

Source SHA256: `fa6173a2d85cbb5e63635c4044e792a2db27ab19a1a592fb0ed47d0649fc2dd1`

---

## Considerations

1. **Performance:** Subagent detection should be cached, not recomputed every iteration
2. **Fallbacks:** Always have fallback subagents if detection fails
3. **Multiple Subagents:** Support parallel subagent invocation when appropriate
4. **Configuration Overrides:** Allow manual overrides for edge cases
5. **Language Detection:** Handle multi-language projects (e.g., Rust + TypeScript)
6. **Subagent Availability:** Check if subagent files exist before selection
