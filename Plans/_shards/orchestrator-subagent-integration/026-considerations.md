# Shard 026: Considerations

Source: `Plans/orchestrator-subagent-integration.md`

Source lines: L3539-L3546

Source SHA256: `519bdd0b9ae3c88e7b7e26fcb1d03e8dd8ef564b674dc00503d066e9a46ae072`

---

## Considerations

1. **Performance:** Subagent detection should be cached, not recomputed every iteration
2. **Fallbacks:** Always have fallback subagents if detection fails
3. **Multiple Subagents:** Support parallel subagent invocation when appropriate
4. **Configuration Overrides:** Allow manual overrides for edge cases
5. **Language Detection:** Handle multi-language projects (e.g., Rust + TypeScript)
6. **Subagent Availability:** Check if subagent files exist before selection
