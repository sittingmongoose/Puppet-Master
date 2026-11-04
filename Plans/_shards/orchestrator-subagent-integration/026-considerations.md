# Shard 026: Considerations

Source: `Plans/orchestrator-subagent-integration.md`

Source lines: L3522-L3529

Source SHA256: `50af792e5959fb426e219283275a2d943bb4307c7a9537cade2fb0d06978da1a`

---

## Considerations

1. **Performance:** Subagent detection should be cached, not recomputed every iteration
2. **Fallbacks:** Always have fallback subagents if detection fails
3. **Multiple Subagents:** Support parallel subagent invocation when appropriate
4. **Configuration Overrides:** Allow manual overrides for edge cases
5. **Language Detection:** Handle multi-language projects (e.g., Rust + TypeScript)
6. **Subagent Availability:** Check if subagent files exist before selection
