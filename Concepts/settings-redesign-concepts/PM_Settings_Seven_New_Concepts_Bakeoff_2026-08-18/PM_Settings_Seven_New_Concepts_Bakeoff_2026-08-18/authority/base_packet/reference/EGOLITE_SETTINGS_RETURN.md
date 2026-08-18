# Return Handoff — PMConcept7 Settings Redesign v3

**From:** Egolite & Git Updates  
**Status:** cumulative Settings insertion contract; do not choose or implement the winning Settings concept from this file

## 1. Preserve the manager boundary

Settings owns setup, policy, defaults, human projections, diagnostics, and repair entry points. The left-rail Source Control and GitHub Actions panels remain operational surfaces. Do not duplicate branch/diff/commit/workflow operation UIs inside Settings.

## 2. Source Control manager information architecture

Recommended sections:

```text
Overview
Repositories and Source Locations
Git and Jujutsu
Hosting Services
Accounts and Sign-in
Execution Environments
Worktrees and Parallel Work
Branch, Push, Merge, and Safety
Automatic Updates
Diagnostics and Receipts
```

Normal cards should collapse internal records into one human resource:

```text
Git
Ready on Home TrueNAS
Version 2.x

Jujutsu
Not installed on WSL Ubuntu
[Install]

GitHub
Connected as Personal
Repository access ready
```

Details may expose the selected Installation, actual executable, package owner, adapter version, Host/Environment, profile owner, discovery evidence, duplicates, and logs.

## 3. Install versus connect

Use:

- **Install Git**, **Install Jujutsu**, **Install GitHub CLI** only for actual tools;
- **Connect GitHub**, **Connect GitLab**, **Connect Azure DevOps**, **Connect Bitbucket** for hosted services;
- **Add SSH Key or Certificate** / **Use Existing SSH Profile** for credentials;
- **Set Up Git LFS** only when required.

Never show “Install Bitbucket” or imply a forge connection requires its optional CLI.

## 4. Exact Host and Environment

All tool actions target an explicit environment:

```text
This Windows computer
WSL Ubuntu
Home TrueNAS
MacBook Air
Linux build server
```

Examples:

```text
Install Jujutsu on WSL Ubuntu
Update Git on Home TrueNAS
Use Git from This Windows Computer
Repair SSH on Linux Build Server
```

Do not expose raw environment IDs in ordinary copy.

## 5. WSL Settings behavior

WSL is optional and off is healthy. The Source Control manager may show:

```text
Linux tools on Windows
Off
Use Windows tools only
[Set Up Linux Environment]
```

When configured:

```text
WSL Ubuntu
Ready
Git ready · Jujutsu not installed
Linux checkout not set up
```

Advanced details may include distro ownership, WSL version, source mappings, systemd/WSLg/GPU/network readiness, and global-config warnings.

Do not:

- mark WSL off as `Needs attention`;
- silently convert WSL1;
- reset/delete a user-owned distro through ordinary Repair;
- rewrite `.wslconfig` without preview and explicit approval;
- pretend `/mnt/c` is always an ideal Linux checkout.

## 6. Containerized Server behavior

A Docker/TrueNAS/Unraid/Kubernetes Server is a complete execution target. Settings must allow the user to manage source tools and profiles on that Server without asking them to add a desktop worker.

Normal card examples:

```text
Git
Included with Home TrueNAS
Ready

Jujutsu
Available to install
[Install]

GitLab
Signed in on Home TrueNAS
Ready
```

The UI should not expose image layers, package roots, or profile-volume paths as primary concepts. Details may show immutable baseline, persistent Tool Store, profile persistence, and update generation.

## 7. Authentication UI

Preferred setup methods are device code, official URL plus returned code, supported callback, or secure API-key/service-identity form.

Use a dedicated stateful setup card that survives navigation and reconnect:

```text
Open GitLab sign-in page
Enter the one-time code
Waiting for GitLab
```

A protected **Secure Sign-in Browser** is a last-resort environment-local flow. It is human-only and displays a clear privacy statement:

```text
Puppet Master agents cannot view or record this sign-in window.
```

Do not expose a recording toggle, agent takeover, DOM inspector, or browser-test controls for this class.

## 8. Automatic advanced browser access

Do not add an Expert Mode switch. Eligible agents automatically receive advanced ordinary-browser capabilities under permissions and sandbox policy. Settings may expose safety/policy controls for browser side effects, recording, retention, domains, and profile use—but not a master “enable expert tools” gate.

## 9. Update controls

For actual source tools, show contextual:

```text
Install
Update Now
Update when idle
Repair
Roll Back, when supported
Managed by your organization
```

Separate:

```text
Check automatically
Install automatically when idle / Ask / Never
Stable / Latest compatible / Pinned / Managed
```

Do not invent a source-control-only update engine. Use the shared Installation Lifecycle and show requested versus effective policy.

## 10. Humanized state vocabulary

Recommended ordinary labels:

```text
Ready
Not installed
Update available
Waiting for work to finish
Needs repair
Sign-in required
Waiting for you
Could not connect
Managed by your organization
Another installation is being used
Source files are not available on this environment
Windows checkout ready
Linux checkout ready
```

Keep values such as `tool_missing`, `execution_environment_id`, or `update_queued_in_use` inside Technical Details.

## 11. Source Control panel and Settings relationship

The operational panel should show the active Project’s effective backend, repository, environment, checkout/workspace, branch/bookmark, dirty/conflict state, and immediate actions.

Settings manages:

- which tools/connections exist;
- default/effective backend and forge account;
- environment mappings;
- update and safety policy;
- worktree limits/defaults;
- diagnostics and repair.

## 12. Commands, wiring, DRY, and concepts

Do not finalize IDs. Every Install/Update/Repair/Sign In/Select Environment/Map Checkout/Test Connection action needs:

- one canonical command path shared with Onboarding/Chat/Doctor;
- typed payload/result/error;
- target Project/Host/Environment/Installation/Profile/Connection;
- availability and human disabled reason;
- Permissions/FileSafe decision;
- idempotency/currentness and subscriber handling;
- ObservableWork phases and durable receipt;
- keyboard/focus/accessibility behavior;
- all-theme and Slint 1.17.1 concept proof.

No underscores, raw enum strings, emojis, or left-edge decorative color bars in normal GUI.

## 13. Return requested

Return the final Source Control manager module, environment-aware card states, WSL/container setup and repair flows, secure sign-in UI, human text inventory, command/wiring/DRY delta, and impacts on the already redesigned left rail.
