# Shard 026: Considerations

Source: `Plans/orchestrator-subagent-integration.md`

Source lines: L3523-L3530

Source SHA256: `e4a8b15da392eff022e41f72d3c5fa81f892eefeeae53f8719fdd96d03712baf`

---

## Considerations

1. **Performance:** Subagent detection should be cached, not recomputed every iteration
2. **Fallbacks:** Always have fallback subagents if detection fails
3. **Multiple Subagents:** Support parallel subagent invocation when appropriate
4. **Configuration Overrides:** Allow manual overrides for edge cases
5. **Language Detection:** Handle multi-language projects (e.g., Rust + TypeScript)
6. **Subagent Availability:** Check if subagent files exist before selection
