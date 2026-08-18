# Desktop, Developer, and System Managers

The bakeoff must demonstrate a coherent grammar for all of these families. It does not need to render every one of 825 settings in every concept, but the coverage matrix must prove navigation, row grammar, representative deep flows, and all critical states.

## General desktop behavior

```text
Minimize/close to tray
Tray state while automation runs
Show/Hide, Pause/Resume, Quit
Launch destination
Window/panel/tab restore
Crash recovery
Unsaved buffer protection
Activity Bar reorder/hide/overflow
Side-panel restore
Editor/tab/tree limits
History/archive behavior
```

## File Manager and editor

Tree behavior, drag/drop, hidden/ignored, large-file thresholds, tabs, split groups, changed-on-disk, recovery, and transient/unavailable reasons.

## Terminal

Profiles, shell/environment, font/rendering, foreground/background, ANSI palette, opacity/readability, cursor, selection, copy/paste, CWD, transcript/retention, performance, diagnostics, and live preview.

## Language tooling

### LSP

Registry/catalog/provenance, command/env/init/config, requested/effective attachment, custom CRUD, host/environment, restart, logs, limits, remote degradation, and verification.

### Formatters

Global enable, built-in/custom table, detected/not found/disabled, command/env/extensions, add/remove/reset, Global/Project scope, health and test.

## Commands and shortcuts

Global/Project custom commands, create/edit/delete, parameters/includes, shell safety, dry-run preview, validation, shortcuts search/conflicts/remap/reset/import/export/cheat sheet.

Dry run never sends work to an agent.

## MCP, Skills, Plugins, Tools

Keep domains distinct while sharing manager grammar.

Expose:

```text
Catalog/provenance/trust
Install/update/compatibility/unload
Project enablement
Effective availability
Policy and risk
MCP auth/transport/catalog/resources/logs
Installed/enabled/available/selected/invoked states
```

## Source control and worktrees

Changes, History, Graph, Worktrees, branch/bookmark/revision, Git/Jujutsu/LFS, forge connection, SSH source, test-before-merge, push/force-push policy, leases, recovery, cleanup, host/environment, and exact tool installation health.

## GitHub Actions

Pinned workflows, current-branch readiness, refresh, run/job/log browsing, starter workflow, account capability, and setup/health.

## Containers and registries

Human top-level resources:

```text
Docker
Podman
Kubernetes tools
```

Expanded detail may show Desktop/Engine, CLI, Compose, Buildx, Machine/socket, kubectl, Helm, clusters, kubeconfig contexts, registries, Unraid publishing, SSH remotes, host/environment, versions, auth, and health.

These use the shared tool lifecycle but retain domain-specific capability probes.

## Web, search, fetch, crawl

Provider priority, search/fetch/crawl/map/extract limits, credit guards, caches, browser sessions, proxies, certificates, air-gap behavior, privacy, and current readiness.

## Search index

Enable, rebuild, exclusions, file-size/symlink policy, disk use, remote cache, clear cache, phase/progress, and failures.

## Testing and Debug

Global/Project Auto/On/Off per capability:

```text
Unit/integration
Built-in browser
Desktop/native
Hot reload/previews
Simulator/emulator/device
API/database
Console/network
Performance/security/accessibility
DAP debugger
Persistent eval
Capture/artifacts
```

## Storage, recovery, backups, and cleanup

Distinguish:

```text
internal recovery snapshots
Settings backup/import
Project backup
Full Server backup
workspace cleanup
```

Cover storage mode, migration, retention, legal holds, pressure, compaction, quarantine, project/data deletion, test restore, encryption, verification, cleanup dry run, worktree safety, evidence retention, and receipts.

## History, sessions, artifacts

Project/all-project history filters, compare/export/rebuild/archive/deletion policy, artifact type/location/version/retention/receipts/redaction/open/reveal/export/cleanup, and PM-owned versus provider-native identity.

## Deferred modules

Reserve coherent insertion destinations for:

```text
Servers
Execution Hosts
Clients
Project Hosting & Files
Remote Access
Updates
```

Do not invent their backend state machines in this bakeoff.
