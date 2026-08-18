# Manager Grammar and Setting Model

## Dedicated manager grammar

Every manager should feel designed by the same product team. Shared roles include:

```text
Manager header
Search/filter where useful
Add/connect/create action
Health summary
Resource list/card/table
Detail editor or inspector
Requested/effective state
Loading/empty/failed/unavailable/managed states
Logs/receipts/diagnostics access
```

A manager may use a different internal composition when the domain demands it, but must reuse shared semantics and component families.

## Setting row grammar

A row needs:

```text
Human title
Concise explanation
Current value/state
Default or source
Scope
Availability
Restart/reconnect requirement
Help/details
Validation/error
```

Model explicit value states:

```text
Default
Recommended
Inherited
Auto
Not configured
Managed
Custom
Unavailable
Effective value differs
```

Do not represent Auto, Inherit, Not configured, or Disabled as an unexplained empty string.

## Exposure

Use:

```text
Standard
Advanced
Expert or risky
Managed/read-only
Diagnostic
Unavailable
```

Search can find all levels. Ordinary navigation does not invite users to change dangerous internals casually.

## Scope

The future registry needs to represent more than global/project/provider/run. Account for:

```text
turn
thread
Goal
PlanningRun
Crew
project
global
host
environment
installation
device
workspace/worktree
account
provider
Persona
```

Concepts should show scope only when it helps the user. Internal scope vocabulary belongs in Details.

## Secret values

Credentials are not ordinary text fields. The design must distinguish:

```text
PM-owned secret input
secure vault/reference selector
CLI-owned authentication
PM-owned OAuth
environment-backed secret
command-helper/vault-backed secret
non-secret text
```

Normal UI never exposes raw tokens. Reveal/copy/persist/test semantics differ by type.

## Actions versus values

One-shot actions, manager routes, status projections, diagnostics, and persistent settings cannot all render as equivalent form rows.

Examples:

```text
Back Up Now          action
Backup schedule      setting
Last backup          status
Backup & Restore     manager
Open backup log      diagnostic/action
```

## Help

Help is available by hover, keyboard focus, explicit details/help affordance, and accessibility semantics.

It answers:

- What changes?
- What does the default mean?
- When does it take effect?
- Is restart/reconnect required?
- What important side effects exist?
- Why is it unavailable?
- What is the effective value when policy differs?

## Settings lifecycle

Provide coherent flows for:

```text
Export/backup
Import
Merge or replace
Conflict preview
Validation
Legacy-key migration
Project/global scope
Managed/read-only values
Restart/reconnect plan
Rollback to pre-import snapshot
Receipt and source disclosure
Reset to defaults
```

Do not expose a raw format dropdown as the primary interaction.
