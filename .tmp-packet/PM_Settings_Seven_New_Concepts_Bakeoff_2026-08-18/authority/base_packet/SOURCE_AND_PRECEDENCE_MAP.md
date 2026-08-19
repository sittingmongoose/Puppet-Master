# Source and Precedence Map

Use current repository files and the latest owner handoffs. This packet set is a bounded synthesis, not a replacement for canonical source owners.

## Highest-precedence decisions

1. Final provider-CLI adjudication:
   - no baseline bundling/pre-seeding;
   - explicit user-triggered initial setup;
   - official source;
   - exact Host/Environment;
   - post-consent update/repair/rollback is allowed.
2. Server-first backbone:
   - one Project Home Server and physical Project Vault;
   - Home Server is default Execution Host;
   - additional Execution Hosts/Environments are explicit;
   - native desktop, standalone Server, Docker/TrueNAS/Unraid/Kubernetes are execution-capable;
   - WSL is optional.
3. Browser:
   - PM-native Browser Runtime/Browser Program only;
   - no Playwright runtime, facade, compatibility namespace, package, port, command, MCP, or capture dependency.
4. Performance:
   - one RuntimeResourceGovernor policy/admission subsystem with host-local enforcement;
   - ObservableWork for truthful progress/waits;
   - bounded async/process/CPU work, progressive hydration, no startup probe storms.
5. Settings:
   - search-centric Home, full workspace, manager grammar, left Activity Bar canon;
   - Project settings are concrete and independent; Copy Settings From… is a one-time transactional copy.
6. Product Onboarding:
   - separate from Installation/Deployment and Server Claim/Bootstrap;
   - may launch those flows and resume with return context.
7. Doctor:
   - compact normalized health aggregator and remediation router;
   - never duplicates domain discovery or repair.

## Primary Plan owners to inspect

```text
FinalGUISpec.md
assistant-chat-design.md
usage-feature.md and current Usage owner docs
Models_System.md
Multi-Account.md
CLI_Bridged_Providers.md
Provider_OpenCode.md
Media_Generation_and_Capabilities.md
Prompt_Pipeline.md
assistant-memory-subsystem.md
Personas.md
agent-rules-context.md
Goal_Runtime_System.md
orchestrator-subagent-integration.md
Planning_Wizard.md
PRD_Builder.md
Permissions_System.md
FileSafe.md
Commands_System.md
UI_Command_Catalog.md
Wiring_Matrix.production.json
DRY/component owner docs
MCP_Integration.md
Skills_System.md
Plugins_System.md
Tools.md
LSPSupport.md
Formatters_System.md
FileManager.md
Automated_Testing_System.md
WorktreeGitImprovement.md
GitHub_Integration.md
Containers_Registry_and_Unraid.md
storage-plan.md
Runtime_Artifacts_Panel.md
Project_Output_Artifacts.md
Release_Supply_Chain.md
BinaryLocator_Spec.md
```

## Research references

```text
T3 Code source reviews
Oh My Pi source review
Hermes v0.20 source review
Free Coding Models
Models.dev
OpenCode
Open Design
Codex
Antigravity CLI
Claude/Codex account-switching examples
```

These are references and failure-mode evidence. They are not canonical PM owners.
