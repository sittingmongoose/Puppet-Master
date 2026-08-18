# Server, Host, Environment, and Owner Boundaries

## Server-first topology

Use these distinct concepts:

```text
Project Home Server
Execution Host
Execution Environment
Source Location
Client
```

Home Server is the default Execution Host when capability-compatible.

Native Windows, macOS, Linux, standalone Server, Docker, TrueNAS, Unraid, and Kubernetes are execution-capable forms. WSL is optional and does not replace native Windows.

## Future Settings modules

Reserve manager grammar and semantic destinations for:

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

Normal cards use human language. Do not expose raw server catalogs, package roots, WSL internals, kubeconfigs, or credential realms by default.

Example:

```text
Home TrueNAS                         Connected
Processing on this server           On
Clients                              3 paired
```

Project:

```text
Hosted On          Home TrueNAS
Project Files      /mnt/projects/Puppet-Master
Run Work           Automatic · Home TrueNAS
```

## Execution environments

Nested under the host:

```text
Windows native
Linux through WSL — Optional
macOS native
Linux through Apple container — Optional
Linux/container runner
Kubernetes pool
SSH environment
```

WSL Off is healthy. Show setup only when a selected capability requires it.

## Tool lifecycle

AI provider CLIs, source-control tools, Docker/Podman/Kubernetes, LSP/DAP, formatters, testing, and media helpers reuse the shared installation lifecycle. Their domain managers own capability/authentication details.

Provider CLI initial acquisition remains the strict explicit exception.

## Project Sync/app updates

Do not implement Project Sync, Project Move, or PM application/content update state machines here.

The selected Settings framework must later accept their manager modules, deep links, status cards, and command wiring.

## Browser

Use PM-native BrowserWorkspace, Browser Program, and Expert Browser Program terminology only.

A protected AuthBrowserSession is human-only and never shown as an ordinary browser workspace. Agents cannot inspect its DOM, screenshots, video, console, or network.

## Performance

Managers hydrate lazily. Search indexes metadata without eagerly opening all managers. Discovery/probes are bounded, cached, coalesced, and ResourceGovernor-governed. ObservableWork shows truthful phases and waits.
