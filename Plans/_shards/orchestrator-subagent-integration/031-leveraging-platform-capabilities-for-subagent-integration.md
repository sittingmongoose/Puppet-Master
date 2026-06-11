# Shard 031: Leveraging Platform Capabilities for Subagent Integration

Source: `Plans/orchestrator-subagent-integration.md`

Source lines: L5576-L5593

Source SHA256: `a29fb722e82fd1f89823b9be4c7a2aaa3b75418b6d3659c9b6657c0b15971241`

---

## Leveraging Platform Capabilities for Subagent Integration

### Strategy 1: Platform-Specific Subagent Packages

Create platform-native packages (skills/plugins/extensions/agent files) that define subagent context and lifecycle hooks. Installation and discovery must route through `platform_specs` and provider-aware helpers.

### Strategy 2: Hook-Based Lifecycle Management

Use platform hooks to enrich lifecycle events (context injection, validation, quality checks) while keeping orchestrator policy and verification gates as the enforcement authority.

### Strategy 3: MCP Server Integration

Use MCP for tool exposure and interoperability where supported. Tool permissions, evidence, and run policy remain centralized in orchestrator/runtime.

### Strategy 4: CLI Invocation as Execution Truth

All subagent work executes through provider CLI commands. Determinism comes from explicit args/env plus normalized event parsing from CLI output.

