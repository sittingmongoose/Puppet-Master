# Shard 026: Considerations

Source: `Plans/orchestrator-subagent-integration.md`

Source lines: L3543-L3550

Source SHA256: `8493b4377d6193a867484501815c4afb59f000d66cceab00e61aa253e36a21c5`

---

## Considerations

1. **Performance:** Subagent detection should be cached, not recomputed every iteration
2. **Fallbacks:** Always have fallback subagents if detection fails
3. **Multiple Subagents:** Support parallel subagent invocation when appropriate
4. **Configuration Overrides:** Allow manual overrides for edge cases
5. **Language Detection:** Handle multi-language projects (e.g., Rust + TypeScript)
6. **Subagent Availability:** Check if subagent files exist before selection
