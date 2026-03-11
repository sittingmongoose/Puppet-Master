## 5. MCP integration (in scope)
ContractRef: ContractName:Plans/newtools.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/Personas.md, ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md

MCP-discovered tools are first-class tools in the central registry and participate in the same requested-vs-effective resolution model as built-in, provider, custom, and skill-backed tools.

Rules:
- enabling an MCP server expresses requested availability, not guaranteed effective availability
- effective availability is recalculated from server health, provider/platform support, project scope, Persona/permission state, and policy at runtime
- project switching recalculates effective MCP availability for the new project context
- app-level-only permission scope is not sufficient for the promoted shell/project-switch model
- namespacing and wildcarding remain mandatory for policy resolution and diagnostics
