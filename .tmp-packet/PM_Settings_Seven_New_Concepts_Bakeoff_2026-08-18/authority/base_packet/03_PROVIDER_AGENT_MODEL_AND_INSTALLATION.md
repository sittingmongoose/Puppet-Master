# Providers, Agents, Models, Accounts, and Installations

## Object model

```text
Provider family
  Account/Profile
    Connection
      Product/Entitlement
        Models and capabilities

Host/Environment
  Provider installation
```

A provider supplies models, authentication, limits, billing, and capabilities. An agent/runtime adapter controls invocation, sessions, tools, permissions translation, and provider projections. Do not conflate them.

## Normal connection groups

Use human labels such as:

```text
Installed tools and signed-in apps
Connected accounts
API connections
Server connections
Free and community models
```

## Provider family workspace

A provider family may contain:

```text
Overview
Accounts & connections
Models
Plans, limits, and extra usage
Routing
Installation and updates
Advanced/support
```

Default view answers:

```text
Is it connected?
Which account/connection/product will PM use?
What is included?
What happens when included usage ends?
Which models are available?
Does anything need setup or repair?
```

## Multi-account

Each account/profile supports, where available:

```text
Nickname
Discovered identity
Authentication source
Profile/config root
Enabled state
Priority
Sticky-session preference
Usage/quota state
Last successful connection
Last successful generation
Health/failure detail
Model visibility/favorites
```

PM must not pretend that a CLI supports simultaneous profiles when it does not. Supported strategies include native profile, isolated home, authentication-only profile, credential pool, PM-managed direct connection, and single-active-login.

## Detection and onboarding reference split

Use T3 as the primary reference for:

```text
CLI discovery
Provider-specific auth probe
Account identity
Product/plan
Model/skill catalog
Readiness
```

Use OMP as the primary reference for:

```text
Setup presentation
Exact official sign-in/API-key page
OAuth/device-code/paste-code/API-key choreography
Validation
Catalog refresh
Return to originating row
```

## Provider CLI acquisition policy

Initial provider CLI acquisition is:

```text
explicit user-triggered Install/Set Up
official provider/package source
exact selected Host/Environment
not bundled in PM core/default baseline
not pre-seeded in Tool Store
not silently triggered by Project/model/Goal/agent demand
```

After explicit acquisition, PM may manage updates, repair, verification, rollback, profiles, and generations.

A later bundled exception requires direct approval naming the exact provider CLI/platform/source/version/licensing/update owner.

## Installation resolution

Normal GUI shows one humanized installation card. Advanced detail may show:

```text
Configured command
Resolved launcher
Actual executable
Installation method
Package/formula identity
Manager root/profile
Host/environment
Discovery evidence/confidence
```

The resolver must detect all candidates, trace wrappers/symlinks/shims, query package databases/native metadata, and identify duplicates.

Confidence:

```text
Proven
Strongly identified
Probable
Ambiguous
Unknown
```

Unknown/ambiguous ownership is manual-only. Never guess npm/Homebrew from a bare command or path shape.

## Updates

Recommended policy:

```text
Check for provider updates        Automatic
Install provider updates          Ask first
Version policy                    Latest compatible
Roll back after failed verification  On where supported
```

Optional `Automatically when idle` requires proven ownership, compatible target, no active requests, permission, resource preflight, and a reliable repair/rollback path.

Update states:

```text
Update available
Waiting for work to finish
Updating
Verifying
Ready
Verification failed
Rolled back
Needs repair
Managed externally
Could not identify installation method
```

Success requires exact path, launch health, auth/profile identity, model catalog, adapter handshake, required capabilities, and dependent-route refresh—not installer exit code alone.

## Authentication boundary

Claude CLI and Antigravity CLI OAuth are CLI-owned. PM can isolate profiles and launch the native flow; it does not present PM-direct OAuth.

Supported PM-direct OAuth may include OpenAI/Codex, GitHub, and GitHub Copilot.

API connections remain separate from subscription/CLI products.

## Free Models and catalogs

`Free Models` is a wrapper over underlying routes. It never owns credentials, quota, switching, or Usage.

Models.dev and Free Coding Models refresh continuously with source version, check/import/activation times, validation, last-known-good fallback, and change history.

Show:

```text
Ready
Needs setup
Cooling down
No longer free
No longer available
Unverified
```

## Capabilities and modes

Models may expose:

```text
Favorite
Alias
Priority
Visibility
Reasoning/effort
Normal/Fast
Modalities
Tool/structured-output support
Context limit
Observed availability
```

Capabilities retain evidence and freshness. Do not infer Fast mode or modalities from names alone.

## Agent assignments

Agent/persona/role defaults consume provider/model candidates but remain separate from accounts and installations. Show requested/effective route and why a fallback occurred.
