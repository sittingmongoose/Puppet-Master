# Shard 024: Considerations

Source: `Plans/orchestrator-subagent-integration.md`

Source lines: L3324-L3332

Source SHA256: `68308e5ee0eb66377a92b5bf780abd21496f872f4df0059820d1e7f4648af5d6`

---

## Considerations

1. **Performance:** Subagent detection should be cached, not recomputed every iteration
2. **Fallbacks:** Always have fallback subagents if detection fails
3. **Multiple Subagents:** Support parallel subagent invocation when appropriate
4. **Configuration Overrides:** Allow manual overrides for edge cases
5. **Language Detection:** Handle multi-language projects (e.g., Rust + TypeScript)
6. **Subagent Availability:** Check if subagent files exist before selection

