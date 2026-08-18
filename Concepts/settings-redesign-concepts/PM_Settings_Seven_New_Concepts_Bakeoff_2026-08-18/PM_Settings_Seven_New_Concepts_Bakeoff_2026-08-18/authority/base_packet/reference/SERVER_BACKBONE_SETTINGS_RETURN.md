# Return Handoff — PMConcept7 Settings Redesign — Post-Return Reconciliation v6

**Status:** future insertion contract only. Do not add these modules to the Settings concepts currently being finalized unless the user separately authorizes it. Do not update the Settings packet/prompt yet.

## 1. Preserve the selected Settings framework work

Keep the search-centric Settings Home, full Settings Workspace, human manager grammar, lazy hydration, left Activity Bar canon, notices, deep links, progressive disclosure, all-theme/SVG/Slint rules, and completeness-manager inventory from the incoming Settings and Performance returns.

## 2. General Project settings remain simple

Do not turn requested/effective/inherited/managed display into a universal Project-settings inheritance system.

Canonical ordinary behavior:

```text
Each Project owns one concrete settings set.
Changing Project A does not change Project B.
Copy Settings From… copies selected broad categories once.
The destination is independent immediately afterward.
```

The copy flow defaults to all and exposes about ten categories:

1. Appearance and workspace
2. Assistant and Chat
3. Providers/accounts/models/routing
4. Planning Wizard/PRD Builder/Goal Mode
5. Orchestrator/automation/background work
6. Tools/MCP/LSP/skills/plugins/integrations
7. Testing/built-in browser/simulators/emulators/devices
8. Permissions/FileSafe/security/approvals
9. Memory/context/retention/history policy
10. Notifications/Usage/budgets/limits

Require pre-copy restore point, atomic apply, receipt, verification, rollback, and optional Details. Do not expose hundreds of individual merge choices.

Policy inheritance/effective state remains valid where intrinsic—Permissions/FileSafe, organization-managed values, installation policy, per-thread runtime state—but is not the ordinary Project-setting model.

## 3. Project duplication and credentials

Distinct actions remain:

```text
Copy Settings From…
Duplicate Project Configuration
Duplicate Project With History
Save/Create Project Template
Connect Existing Checkout
Add Checkout or Worktree
```

Same-Server duplicates copy provider/account bindings and reuse compatible existing credential/profile attachments without reauthentication. They do not copy raw secrets, CLI profile directories, live processes, Chat/memory/Goal/Usage/history by default.

## 4. Future Settings destinations

Reserve bounded modules for:

```text
Servers
Execution Hosts
Clients
Project Hosting & Files
Project Defaults & Templates
Remote Access
Integrations & Tools
Backup & Restore
Updates
```

Do not create a Project replica, relay, peer-sync, or canonical-conflict manager.

Normal Server card:

```text
Connected Server
Home TrueNAS
[Change Server] [Add Server]

Processing on this server    On
Clients                      3 paired
```

Project card/settings:

```text
Hosted On
Home TrueNAS

Project Files
/mnt/projects/Puppet-Master

Run Work
Automatic · Home TrueNAS

[Move Project] [Change Project Files]
```

## 5. Execution Hosts and Environments

The user manages Server hosts, Execution Hosts, and Clients separately. Home Server is the default Execution Host.

Environment details are nested under a host:

```text
Windows native
Linux through WSL — Optional
macOS native
Linux through Apple container — Optional
Linux/container runner
Kubernetes pools
SSH environments
```

Windows shows no warning when WSL is off. On supported macOS 27, Apple Linux container setup is an MVP optional capability, not a future placeholder.

## 6. Integration and tool cards

Replace blanket “provider CLIs are not bundled” copy with per-tool acquisition and readiness:

```text
Included with this Server
Installed in Puppet Master Tool Store
Available to install
Installed/managed externally
Needs license or permission
Needs sign-in
Ready
Update available
Needs repair
```

One normal card summarizes product, host/environment, version, account/profile when relevant, readiness, and primary action. Details show acquisition class, exact installation, provenance, profile owner, connection, logs, and rollback.

Keep separate:

```text
installed/verified tool
authenticated profile
provider/model readiness
runtime engine/cluster/registry connection
Usage telemetry
```

## 7. Authentication UI

Normal priority:

- secure key/token/service identity form;
- device code;
- official URL plus returned/paste code;
- supported callback;
- bounded CLI-native flow;
- protected human-only secure sign-in browser when required.

The protected `AuthBrowserSession` is never shown as an ordinary BrowserWorkspace and is inaccessible to agents. No screenshots/recordings/DOM/console/network evidence.

## 8. Updates UI

Puppet Master application updates remain deliberately simple:

```text
Automatic Updates    On / Off
Check for Updates
```

No normal Daily/Weekly/Monthly menu. Advanced details contain source/channel/provenance/migration/history/rollback/logs. Bottom status bar shows actionable update state; it is not a notification-bar item.

External tool updates may expose richer per-installation policy under Integrations because their ownership/version pinning differs from the app updater.

## 9. Backup & Restore UI

Keep distinct:

```text
internal recovery snapshots
Settings copy/transfer
Project backup
Full Server backup
```

Normal surface:

```text
Automatic Backups    On / Off
Last backup           <status>
Back Up Now
Restore…
```

Advanced contains destination, schedule, retention, encryption, verification, included Projects, history, test restore, and diagnostics. Secrets are excluded by default; portable secrets require a separately encrypted advanced flow.

## 10. Remote access and status bar

Remote Access groups:

```text
Private: LAN, Tailscale/MagicDNS/Serve
Public: Funnel, custom domain/reverse proxy
```

Funnel is public, explicit, off by default, and not an auth boundary. One stable Server appears once across endpoints.

Bottom-bar language is truthful:

```text
Home TrueNAS · Connected
Connected through Tailscale
Public route: Funnel
Running in WSL
Running on MacBook Air
Moving Project · 63%
Update Available
Backup Needs Attention
```

Routine same-Server operation does not say `Synced`.

## 11. Browser terminology

Use only Puppet Master's built-in browser, BrowserWorkspace, Browser Program, and PM-native Expert Browser Program terminology. No Playwright Settings option, capability package, facade, capture engine, or command family.

## 12. Return requested

Return future insertion schemas/components/actions for these modules without changing current concepts, including command/wiring/DRY/Plans ownership and deep links, plus confirmation that ordinary Project settings remain concrete and independent.
