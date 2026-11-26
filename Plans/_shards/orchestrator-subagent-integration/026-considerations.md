# Shard 026: Considerations

Source: `Plans/orchestrator-subagent-integration.md`

Source lines: L3548-L3555

Source SHA256: `8bea6f383d740e0e4abf7a4ad4bb3efeb854a38b872012cfa83d3168ca8fa6fd`

---

## Considerations

1. **Performance:** Subagent detection should be cached, not recomputed every iteration
2. **Fallbacks:** Always have fallback subagents if detection fails
3. **Multiple Subagents:** Support parallel subagent invocation when appropriate
4. **Configuration Overrides:** Allow manual overrides for edge cases
5. **Language Detection:** Handle multi-language projects (e.g., Rust + TypeScript)
6. **Subagent Availability:** Check if subagent files exist before selection
