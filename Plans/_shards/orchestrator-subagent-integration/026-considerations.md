# Shard 026: Considerations

Source: `Plans/orchestrator-subagent-integration.md`

Source lines: L3548-L3555

Source SHA256: `794de3d14bc5325d4bbef53a390e3d5dfa036674f1639fb90912f48ef832a31c`

---

## Considerations

1. **Performance:** Subagent detection should be cached, not recomputed every iteration
2. **Fallbacks:** Always have fallback subagents if detection fails
3. **Multiple Subagents:** Support parallel subagent invocation when appropriate
4. **Configuration Overrides:** Allow manual overrides for edge cases
5. **Language Detection:** Handle multi-language projects (e.g., Rust + TypeScript)
6. **Subagent Availability:** Check if subagent files exist before selection
