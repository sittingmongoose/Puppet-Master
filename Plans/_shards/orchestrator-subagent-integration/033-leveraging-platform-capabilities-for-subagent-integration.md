# Shard 033: Leveraging Platform Capabilities for Subagent Integration

Source: `Plans/orchestrator-subagent-integration.md`

Source lines: L5756-L5772

Source SHA256: `aab3a84daf5765dd55948f63493973b3a79019c6141e475b844cc62f36934c26`

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
