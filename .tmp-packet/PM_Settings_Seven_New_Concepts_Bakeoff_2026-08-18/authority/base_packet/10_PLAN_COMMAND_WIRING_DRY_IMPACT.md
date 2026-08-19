# Plan, Command ID, Wiring, and DRY Impact

Concept agents do not edit canon. They must populate the supplied registers.

## Plan-owner considerations

At minimum audit impacts to:

```text
FinalGUISpec
settings inventory and schema
Models System
Multi-Account
CLI Bridged Providers
Provider OpenCode
Media
Prompt Pipeline
Assistant Memory
Personas
Goal Runtime
Orchestrator/Subagents
Planning Wizard
PRD Builder
Permissions
FileSafe
Commands
UI Command Catalog
MCP
Skills
Plugins
Tools
LSP
Formatters
File Manager
Testing
Worktrees/Git/GitHub
Containers/Registries
Storage
Runtime Artifacts/Outputs
Release/updates owner
Binary Locator and installation lifecycle
```

Required supersessions include the old Settings chip/bloom/no-sidebar contract, stale right-panel language, stale `regular/yolo` mode coupling, and invalid inventory values.

## Command discipline

The candidate command register is provisional. Before final implementation:

1. Census existing command IDs and aliases.
2. Reuse canonical IDs.
3. Retire or alias `cmd.settings.bloom.open`.
4. Do not duplicate provider/account/Usage/auth/install/backup/notification actions.
5. Distinguish persistent setting mutation from one-shot action and manager navigation.
6. Give every action typed payload, result, error, idempotency/revision, permission, receipt, and recovery semantics.

## Wiring rule

Every user action must trace:

```text
UI source
→ command
→ canonical owner
→ validation/permission
→ state mutation or operation
→ event/receipt/ObservableWork
→ UI projection
→ Usage/diagnostic attribution
→ recovery/deep link
```

No concept-only local state may masquerade as production wiring in the impact register.

## DRY component families

Candidate reusable families:

```text
SettingsDestination
SettingsNotice
SettingsWorkspaceShell
SettingsSearch
CategoryNavigation
SubcategoryScrollspy
SettingRow
ValueSourceBadge
AvailabilityReason
RequestedEffectiveInspector
ManagerShell
ResourceList/Card/Detail
HealthSummary
SetupFlowLauncher
ObservableOperation
ReceiptLink
SecretField/SecretReference
ProviderFamilyCard
AccountConnectionRow
InstallationCard
ModelRow
CapabilityEvidence
UsagePlanSummary
MemoryRow
PersonaCard
CrewTemplate
PermissionRuleEditor
NotificationDestination
SoundLibraryItem
ThemePreview
CommandEditor
ShortcutRecorder
Lsp/Formatter/ToolResource
StorageHealth
ArtifactRow
```

Names are candidate design roles, not final component IDs.

## Required output

Each concept folder contains:

```text
impact-register.json
manager-coverage.json
candidate-command-delta.json
candidate-wiring-delta.json
candidate-dry-delta.json
plan-owner-delta.md
```

The audit agent later adjudicates exact canonical names.
