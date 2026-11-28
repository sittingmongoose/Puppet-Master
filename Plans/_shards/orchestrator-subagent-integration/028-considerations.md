# Shard 028: Considerations

Source: `Plans/orchestrator-subagent-integration.md`

Source lines: L3575-L3582

Source SHA256: `242c686bf7ef6bca36294f0b5a2b7d77c6d5dc5ea69df7fd59458732b68a507c`

---

## Considerations

1. **Performance:** Subagent detection should be cached, not recomputed every iteration
2. **Fallbacks:** Always have fallback subagents if detection fails
3. **Multiple Subagents:** Support parallel subagent invocation when appropriate
4. **Configuration Overrides:** Allow manual overrides for edge cases
5. **Language Detection:** Handle multi-language projects (e.g., Rust + TypeScript)
6. **Subagent Availability:** Check if subagent files exist before selection
