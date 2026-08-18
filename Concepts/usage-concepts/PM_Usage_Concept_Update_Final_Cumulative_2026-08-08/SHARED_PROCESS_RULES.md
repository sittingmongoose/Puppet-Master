# Final Cumulative Packet Set — Shared Process Rules

**Date:** 2026-08-08  
**Supersedes:** all unused intermediate cumulative packets and split Plan/Build prompt pairs from this thread.

## Exactly two prompts per topic

Each packet contains:

1. `IMPLEMENTATION_PROMPT.md`
2. `AUDIT_PROMPT.md`

There is no separate Plan prompt and no later Build prompt.

The implementation prompt tells the receiving agent to:

1. inspect the packet and current authorized sources;
2. present the platform's normal implementation plan;
3. wait for the user's approval or rejection;
4. after approval, continue under the same original prompt.

The audit prompt is used only after the work exists.

## Work that actually ran

Use this as the practical baseline:

- the original Usage work/packet;
- the original Settings bakeoff packet;
- Assistant Chat Update Revision 2.

Later cumulative packet drafts were not run and are research inputs only. Do not mechanically stack their old prompts.

## Shared non-negotiable rules

- Preserve source terminology and owner boundaries.
- Reconcile stale active canon instead of leaving contradictory rules.
- Reuse canonical owners, commands, wiring paths, DRY services, events, receipts, and schemas.
- Do not create a second provider, Usage, Settings, notification, progress, authentication, installation, browser, or Goal system.
- Provider CLI initial acquisition is explicit, official-source-based, and never bundled or silently demand-installed unless a later named exception is directly approved.
- Claude CLI and Antigravity CLI OAuth are CLI-owned; PM-direct OAuth is not used for those routes.
- Puppet Master uses its own Browser Program API. Do not introduce Playwright runtime/facade/compatibility terminology or PM-owned Playwright packages, ports, MCP, commands, or capture.
- Native Windows is complete without WSL. WSL is optional and environment-specific.
- Docker/TrueNAS/Unraid/Kubernetes forms are full PM Servers and Execution Hosts.
- `RuntimeResourceGovernor` is the shared admission/policy owner; `ObservableWork` is the truthful shared operation/progress projection.
- SQLite remains prohibited.
- No emojis. SVGs only.
- Slint 1.17.1 portability is required.
