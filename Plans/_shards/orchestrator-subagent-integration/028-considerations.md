# Shard 028: Considerations

Source: `Plans/orchestrator-subagent-integration.md`

Source lines: L3550-L3557

Source SHA256: `21e7054b32964d9ed59add05ee7acc1006c4e7f1cc024ed6d05f24d7f581223d`

---

## Considerations

1. **Performance:** Subagent detection should be cached, not recomputed every iteration
2. **Fallbacks:** Always have fallback subagents if detection fails
3. **Multiple Subagents:** Support parallel subagent invocation when appropriate
4. **Configuration Overrides:** Allow manual overrides for edge cases
5. **Language Detection:** Handle multi-language projects (e.g., Rust + TypeScript)
6. **Subagent Availability:** Check if subagent files exist before selection
