# Shard 036: Implementation Considerations

Source: `Plans/orchestrator-subagent-integration.md`

Source lines: L5859-L5866

Source SHA256: `4e066c2be7d201715a0bfba3d14c9282e68039841898bdb4084bfeb33b6d8827`

---

## Implementation Considerations

1. **Platform Detection:** Detect available capabilities per provider CLI/runtime.
2. **Capability Caching:** Cache detection results to reduce startup overhead.
3. **Version Compatibility:** Guard capability use by known version constraints.
4. **Configuration Management:** Keep platform-specific config paths explicit.
5. **Error Handling:** Capability misses degrade gracefully to base CLI flow.
6. **Documentation:** Keep capability docs aligned with provider contracts.
