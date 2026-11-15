# Shard 036: Implementation Considerations

Source: `Plans/orchestrator-subagent-integration.md`

Source lines: L5841-L5848

Source SHA256: `fa6173a2d85cbb5e63635c4044e792a2db27ab19a1a592fb0ed47d0649fc2dd1`

---

## Implementation Considerations

1. **Platform Detection:** Detect available capabilities per provider CLI/runtime.
2. **Capability Caching:** Cache detection results to reduce startup overhead.
3. **Version Compatibility:** Guard capability use by known version constraints.
4. **Configuration Management:** Keep platform-specific config paths explicit.
5. **Error Handling:** Capability misses degrade gracefully to base CLI flow.
6. **Documentation:** Keep capability docs aligned with provider contracts.
