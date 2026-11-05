# Shard 036: Implementation Considerations

Source: `Plans/orchestrator-subagent-integration.md`

Source lines: L5807-L5814

Source SHA256: `a5ff69d2472c5d5935bc2f9da119c526ab5bbbf3d86eeff28e50426a28d98928`

---

## Implementation Considerations

1. **Platform Detection:** Detect available capabilities per provider CLI/runtime.
2. **Capability Caching:** Cache detection results to reduce startup overhead.
3. **Version Compatibility:** Guard capability use by known version constraints.
4. **Configuration Management:** Keep platform-specific config paths explicit.
5. **Error Handling:** Capability misses degrade gracefully to base CLI flow.
6. **Documentation:** Keep capability docs aligned with provider contracts.
