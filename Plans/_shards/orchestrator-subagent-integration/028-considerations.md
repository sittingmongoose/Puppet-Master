# Shard 028: Considerations

Source: `Plans/orchestrator-subagent-integration.md`

Source lines: L3549-L3556

Source SHA256: `96030d7a723763c9cd67d5537b586d4f007bf751b1c27b13e4b91c041d29a6fa`

---

## Considerations

1. **Performance:** Subagent detection should be cached, not recomputed every iteration
2. **Fallbacks:** Always have fallback subagents if detection fails
3. **Multiple Subagents:** Support parallel subagent invocation when appropriate
4. **Configuration Overrides:** Allow manual overrides for edge cases
5. **Language Detection:** Handle multi-language projects (e.g., Rust + TypeScript)
6. **Subagent Availability:** Check if subagent files exist before selection
