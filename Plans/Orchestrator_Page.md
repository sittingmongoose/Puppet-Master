# Orchestrator Page -- Single-Page 6-Tab Specification

## 1. Scope and canonical model
`Orchestrator` remains the why and coordination surface, while `Source Control` stays the `worktree-first` owner for concrete Git and `Worktree` actions. `Lane` remains a first-class execution term, and the `Orchestrator-wide scale contract` stays page owned.

### Search, routing, and action policy
Search, routing, and action policy routes cross-surface opens through `route_target` and references storage-owned `Canonical records` instead of inventing local payload variants.

### Current vs historical run behavior
Current and historical views remain explicit. `historical`, `archived`, and `removed` are distinct states, and restart or cleanup behavior continues to point at `Plans/storage-plan.md#Restart and stale history`.

### Concern and notification model
Concern and notification surfaces keep `attention_required` and `blocked` distinct from health and activity, and they continue to pivot into storage-owned `Canonical records` rather than ad hoc inline summaries.

### Source Control boundary
`Source Control` remains the Git/worktree owner surface. Orchestrator explains why a `worktree-first` action matters, but concrete branch, diff, merge, and worktree actions stay in Source Control.

### glossary/help references
Glossary and help references point at the live rewrite and runtime term owners in `Plans/Glossary.md#Orchestrator rewrite terms` and `Plans/Glossary.md#Runtime and routing terms`.
