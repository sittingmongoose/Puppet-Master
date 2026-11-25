# Shard 028: Considerations

Source: `Plans/orchestrator-subagent-integration.md`

Source lines: L3562-L3569

Source SHA256: `7307d448314036b35907dbf3376709b36f026d1a43432f1c9db52e9c0f0a019d`

---

## Considerations

1. **Performance:** Subagent detection should be cached, not recomputed every iteration
2. **Fallbacks:** Always have fallback subagents if detection fails
3. **Multiple Subagents:** Support parallel subagent invocation when appropriate
4. **Configuration Overrides:** Allow manual overrides for edge cases
5. **Language Detection:** Handle multi-language projects (e.g., Rust + TypeScript)
6. **Subagent Availability:** Check if subagent files exist before selection
