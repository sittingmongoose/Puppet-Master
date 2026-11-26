# Shard 028: Considerations

Source: `Plans/orchestrator-subagent-integration.md`

Source lines: L3568-L3575

Source SHA256: `3a96bb84494cc5f21507147c7745623be9b91532eda1bae5c9066517b4ee41ee`

---

## Considerations

1. **Performance:** Subagent detection should be cached, not recomputed every iteration
2. **Fallbacks:** Always have fallback subagents if detection fails
3. **Multiple Subagents:** Support parallel subagent invocation when appropriate
4. **Configuration Overrides:** Allow manual overrides for edge cases
5. **Language Detection:** Handle multi-language projects (e.g., Rust + TypeScript)
6. **Subagent Availability:** Check if subagent files exist before selection
