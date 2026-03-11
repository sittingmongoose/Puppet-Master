## 8. MCP Support and GUI Settings
ContractRef: ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/Tools.md, ContractName:Plans/Permissions_System.md

MCP support is a host-managed runtime capability surface.

### GUI responsibilities
- list configured servers
- enable/disable servers
- edit command/args/env and per-server settings
- test connection and show explicit health state
- expose provider/platform compatibility and scope where relevant
- show requested state and effective availability when they differ

### Runtime rules
- server configuration is not a config-passthrough-only feature
- effective tool availability depends on server health, platform/provider support, project scope, Persona/permission state, and policy
- unhealthy servers do not silently succeed; they surface unavailable/blocked/degraded state explicitly
- MCP server configs installed from the catalog follow the same lifecycle and validation rules as manually created entries
