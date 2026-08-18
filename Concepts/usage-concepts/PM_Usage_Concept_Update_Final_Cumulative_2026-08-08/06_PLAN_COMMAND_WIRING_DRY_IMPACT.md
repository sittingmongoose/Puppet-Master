# Plan, Command ID, Wiring, and DRY Impact

## Plan owners

Audit impacts to:

```text
Usage owner docs
FinalGUISpec
Models System
Multi-Account
Provider adapters
Free Models/catalogs
Prompt Pipeline
Goal Runtime
Orchestrator/Subagents
Planning Wizard
PRD Builder
Assistant Chat
Settings registry
Media
MCP/Tools/Skills
Testing/Browser/Artifacts
Server/Project Sync
Provider installation lifecycle
Notifications
Storage/events
```

## Command IDs

Preserve/reuse where canonical:

```text
cmd.usage.refresh
cmd.usage.export
cmd.account.select_profile
cmd.provider.switch_route
shared widget commands
semantic Settings deep-link command
```

Candidate families to adjudicate:

```text
cmd.usage.detail.open
cmd.usage.forecast.request
cmd.usage.range.set
cmd.usage.filter.set
cmd.provider.usage.open_management
```

Date range/filter changes may remain local view state when no canonical side effect exists.

Direct purchase, pack, saved-reset, or auto-reload execution requires a real typed command, confirmation, permission, result, and receipt. Opening a provider page is not a purchase command.

## Wiring

```text
Provider/CLI/raw receipt
→ normalization with source quality
→ immutable Usage event
→ logical-turn grouping
→ projections/forecast
→ Usage UI/widget
→ semantic deep link to Settings/owner
```

Route resolution and scheduling remain outside Usage.

## DRY services/components

```text
UsageEventStore
UsageNormalizer
SettlementResolver
UsageDataQuality
UsageForecast
CapacityProjection
RouteReceipt
CacheReceipt
TimeBreakdown
ProviderFamilyUsage
AccountConnectionUsage
HelperPurposeGroup
Goal/CrewUsage
MaintenanceActivity
ContextUsageDetail
RunOutProjection
SourceFreshness
UsageWidgetHost
```

Names are candidate roles.

## Required concept outputs

```text
impact-register.json
candidate-command-delta.json
candidate-wiring-delta.json
candidate-dry-delta.json
plan-owner-delta.md
event-schema-delta.json
demo-fixture-report.json
visual-interaction-test-report.json
```
