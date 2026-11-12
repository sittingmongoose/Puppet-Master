# Shard 028: Considerations

Source: `Plans/orchestrator-subagent-integration.md`

Source lines: L3549-L3556

Source SHA256: `582ff13ef7830583028eaa9ecc3ca293275a069b6e9aca44913a5ce017098240`

---

## Considerations

1. **Performance:** Subagent detection should be cached, not recomputed every iteration
2. **Fallbacks:** Always have fallback subagents if detection fails
3. **Multiple Subagents:** Support parallel subagent invocation when appropriate
4. **Configuration Overrides:** Allow manual overrides for edge cases
5. **Language Detection:** Handle multi-language projects (e.g., Rust + TypeScript)
6. **Subagent Availability:** Check if subagent files exist before selection
