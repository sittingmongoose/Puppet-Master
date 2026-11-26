# Shard 028: Considerations

Source: `Plans/orchestrator-subagent-integration.md`

Source lines: L3575-L3582

Source SHA256: `6d9852212fd4e1eec6826a4a5a483441ceae2561c211add4f2ad7f2928aae46a`

---

## Considerations

1. **Performance:** Subagent detection should be cached, not recomputed every iteration
2. **Fallbacks:** Always have fallback subagents if detection fails
3. **Multiple Subagents:** Support parallel subagent invocation when appropriate
4. **Configuration Overrides:** Allow manual overrides for edge cases
5. **Language Detection:** Handle multi-language projects (e.g., Rust + TypeScript)
6. **Subagent Availability:** Check if subagent files exist before selection
