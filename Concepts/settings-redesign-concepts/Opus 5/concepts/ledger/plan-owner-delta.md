# Plan-owner delta — Opus 5 — Ledger

*Model folder: `Opus 5`. Thesis: **Settings is a record**. Generated 2026-08-12.*

Concept agents do not edit canon. This file records what building **Opus 5 — Ledger** pressed on,
which plan owner would have to absorb it, and what could not be settled from the packet alone.
Structured counterparts: `impact-register.json`, `manager-coverage.json`,
`candidate-command-delta.json`, `candidate-wiring-delta.json`, `candidate-dry-delta.json`.

## What this concept's shape pressed on

Ledger treats Settings as a **record**: every control is a row carrying a value, a source, a scope and an
effect, and the home is the system's state of record. Thirteen system and resource managers were assigned
here — the largest set — and record-shaped thinking made three owner problems obvious.

### 1. Settings Lifecycle — an import diff must be computed, not described

`manager-settings-lifecycle` (6 sections) computes its diff against the live store and the taxonomy's own
metadata rather than narrating one. That exposed the real requirement: an import preview must classify
every key as *will change*, *already matches*, *conflict — changed here since export*, *unknown key* or
*read-only*, and a rollback point must exist before apply, not after.

*Owner action:* the settings lifecycle owner should specify the five diff classes and require the
pre-apply snapshot. `cmd.settings.import.preview` and `cmd.settings.import.apply` cannot share a code path
without it.

### 2. Storage — a storage surface is only useful if it does not measure media spend

The through-line of the system module is that Storage answers "what is on disk and what may be removed",
and Usage answers "what was spent". Ledger keeps them apart deliberately: `manager-usage` is a boundary
card in every concept so no concept quietly reimplements Usage inside Settings. `storage.backup_now` and
`cmd.storage.backup.open` are marked **conflict** in the command delta for exactly this reason — one is an
operation, one is a navigation, and the candidate register currently has only the second.

*Owner action:* Storage and the Usage owner should ratify the boundary explicitly.

### 3. Future Server Module Shell — reserve the grammar, not the screens

`PACKET/07` asks for reserved manager grammar and semantic destinations for Servers, Execution Hosts,
Clients, Project Hosting & Files, Project Defaults & Templates, Remote Access, Integrations & Tools,
Backup & Restore and Updates. `manager-server` (5 sections, 23 items) reserves those destinations as
normal cards in human language, with no raw server catalogs, package roots, WSL internals, kubeconfigs or
credential realms exposed. It is a shell, and it says so.

*Owner action:* the server owner inherits the destination list; Settings must not grow a second one.

### 4. Runtime Artifacts — deletion previews before it deletes

Artifacts carry size, age, reveal and export. `storage.delete_preview` exists as a separate action from
`storage.delete_generated` because "free 6.2 GB" and "delete these 412 files" are different promises.

## Owners this concept could not satisfy from the packet

- **Release/updates owner.** Update attempts, rollback state and frozen generations are rendered as
  evidence; the policy is not Settings' to define.
- **Containers/Registries owner.** Runtime switching is rendered as a primary action with a receipt, but
  which runtimes are supported on which hosts is host-owned.
- **GitHub Integration owner.** Actions runs, job logs and secrets are surfaced read-only; secret values
  are never rendered.

## Unresolved, in priority order

1. Retention period for update logs and failed staged installations (30 days is a placeholder).
2. Whether `cmd.storage.backup.open` should be split into a navigation and an operation.
3. Whether workspace cleanup may run without a dry run when disk pressure is critical.
4. Whether the server module shell's destinations are reserved routes now or only names.
