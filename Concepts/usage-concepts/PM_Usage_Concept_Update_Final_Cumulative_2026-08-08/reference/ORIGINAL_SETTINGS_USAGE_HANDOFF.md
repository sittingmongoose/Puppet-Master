# Handoff to “PMConcept7 Settings Redesign”

**Date:** 2026-08-04  
**Source work:** Usage Plans/U10 audit and provider-plan research  
**Purpose:** Give the Settings redesign the provider/account/model/usage rules it needs without asking it to design the Usage page.

---

## What this thread should preserve

The Settings redesign should remain the canonical place where users configure providers, accounts/connections, models, and continuation policy. The Usage page should show current state and deep-link into the same settings records; it must not create a separate settings system.

The intended shared hierarchy is:

```text
Provider family
  Account/profile
    Connection
      Product or entitlement
        Models and capabilities
```

Examples:

```text
OpenAI
  Personal
    ChatGPT plan sign-in
      Codex plan allowance
    OpenAI API key
      API pay-as-you-go

Alibaba Cloud
  Personal
    Token Plan key
      Token Plan Personal + Extra Bundles
    Coding Plan key
      Coding Plan
    General API key
      Free quota → resource plans → PAYG
```

The UI should not expose that full hierarchy on every screen. It is the organizing model for the Provider/Account manager.

---

## Human-facing terminology

Use these labels consistently across Settings and Usage:

```text
Provider
Account
Connection
Plan
Included usage
Extra usage balance
Usage pack
Paid usage after your plan
API usage
Free allowance
Saved reset
Spending limit
What happens next
Connection used
```

Avoid in normal UI:

```text
credential route
entitlement instance
meter policy
capacity source
continuation policy
deduction graph
billing entity id
route epoch
```

Those are internal/support terms.

### Requested/effective/connection explanation

- **Requested account:** the account the user or policy chose.
- **Effective account:** the account that actually ran after fallback or switching.
- **Connection used:** the exact sign-in/key/product path that supplied quota and received cost.

Normal UI should usually show only:

```text
Using Personal OpenAI
ChatGPT plan
```

When the requested account differs:

```text
You chose Work OpenAI, but Puppet Master used Personal OpenAI because Work OpenAI had reached its limit.
```

Expanded details can show Requested, Used, Connection used, and switch reason.

---

## Provider Manager information architecture

The redesigned provider surface should group same-provider accounts instead of presenting a flat list.

Recommended provider-family card/workspace:

```text
OpenAI                                      Connected
2 accounts · 3 connections · 14 models

Personal                                   Used now
  ChatGPT plan                             68% left
  OpenAI API                               $12.40 this month

Work                                       Resets in 2h 14m
  ChatGPT Business                         Limit reached

What happens next
  Work → Personal → Kimi
```

Provider-family workspace sections:

1. **Overview** — connection health, current plan(s), what will be used first.
2. **Accounts & connections** — grouped accounts and exact auth/billing routes.
3. **Models** — available models, aliases, capabilities, role assignments.
4. **Usage & extra usage** — provider-specific plan allowance, optional paid continuation, packs, resets, spending guards.
5. **Routing** — account order, provider order, fallback behavior.
6. **Advanced/support** — raw IDs, source/probe state, detailed receipts, troubleshooting.

The sections can be reorganized to match the Settings redesign’s final navigation, but the ownership boundaries should stay intact.

---

## Simplified normal settings

For each account/product, expose only relevant controls.

### Always relevant

```text
Account nickname
Account active
Use first / priority
Connection status
Current plan or billing route
Automatic account switching
Warn me before I run low
```

### Conditional: only when supported

```text
Use extra paid usage
Monthly spending limit
Auto-reload
Use saved reset
Buy/open usage pack
Free Quota Only
Use API after free quota
Use free-model fallback
Request more usage from admin
```

### Read-only state

```text
Included usage left
Extra balance
Active packs and expiration
Saved resets and expiration
Next reset
Current rate after included usage
Requested/effective account differences
```

### Advanced only

```text
Auto-reload trigger and target
Seat/member/organization limits
Multiple pack deduction order
Reserve account capacity
Raw provider windows/meters
Provider source freshness and policy version
Manual connection binding
```

### Internal/support only

```text
route epochs
raw provider and entitlement IDs
meter-policy IDs
normalization rules
probe confidence
raw rate-card payloads
parser or adapter settings
```

---

## “Budget” must not be a universal provider setting

There are four distinct things:

1. **Provider allowance** — included plan usage; provider controls it.
2. **Optional extra usage** — credits, bundle, pack, or metered continuation.
3. **API spend** — separate PAYG route and bill.
4. **Puppet Master spending limit** — a user-selected guard PM can enforce where it has enough authority/data.

Do not use one setting named “When the budget runs out” across every provider.

Instead render a provider-supplied section:

```text
What happens when included usage runs out?
```

Possible provider-specific choices:

```text
Stop and wait
Use extra balance
Use a usage pack
Use paid usage after the plan
Use saved reset
Switch account
Switch provider
Use free models
Use API billing
Ask me each time
```

Only show choices the selected connection/product actually supports.

Examples:

```text
Codex: Use credits up to $20/month; 1 saved reset available.
Claude: Use usage credits at API rates; auto-reload at $5.
Alibaba Token Personal: Use Extra Bundles; no PAYG from the plan key.
Z.AI Coding Plan: Stop and wait; general account balance is not used.
OpenCode Go: Use free models, or Zen balance when enabled.
```

The provider adapter supplies the wording, choices, consequences, and rate-change summary. Settings renders it from one shared schema.

---

## Current Settings Inventory changes needed

### Revise

- `ai.usage.usage-windows`  
  Replace fixed/default “5h and 7d” with **Automatic — show each provider’s actual limits**. History-range controls are a separate display preference.

- `ai.usage.platform-filters`  
  Make it provider-catalog-driven and based on stable provider-family IDs. It currently omits Alibaba, Kimi, Z.AI, Free Models, local routes, and future additions.

- `ai.usage.monthly-spend-limit`  
  Clarify that this is a user spending guard, not a plan quota.

- `ai.usage.monthly-token-budget`  
  Separate PM execution/token guard from provider usage allowance.

- `ai.usage.run-spend-budget`  
  Move or cross-own with Runs/Automation; it is a run safety policy, not a provider-plan setting.

- `ai.usage.budget-policy`  
  Retire the universal options `block_at_limit`, `warn_only`, `allow_overage` for provider behavior. Replace with provider-capability-driven “What happens next.” Keep PM-owned hard/warn policy only for limits PM actually enforces.

- `ai.usage.quota-management`  
  Rename to **Plans, limits, and extra usage** or integrate it into the Provider Manager.

- `ai.usage.ledger-export`  
  Keep export as an action/workflow. Do not expose a permanent format dropdown as the main concept.

### Move out of Usage

```text
ai.usage.subagent-wave-cost
ai.usage.max-tool-rounds
ai.usage.max-wall-clock
ai.usage.max-goal-turns
ai.usage.node-timeout
```

Move to Automation, Runs, Goal Mode, or Orchestrator limits. Usage may report that one was hit.

### Keep and connect

```text
ai.accounts.provider-connections
ai.accounts.default-account
ai.accounts.account-enabled
ai.accounts.account-name
ai.accounts.set-preferred-account
ai.accounts.claude-login-method
ai.accounts.codex-auth-family
ai.accounts.auth-mode
ai.accounts.multi-account-switching
ai.models.provider-enabled
ai.models.provider-priority
ai.models.provider-fallback
ai.models.requested-effective-inspector
ai.usage.provider-health
ai.usage.refresh-models
ai.usage.auto-refresh-discovery
ai.usage.free-models-auto-apply
ai.usage.reset-countdown
ai.usage.cooldown-timers
ai.usage.pressure-visibility
```

These should appear in the redesigned manager according to relevance, not as one flat registry dump.

---

## Multi-account switching requirements

Same-provider accounts must be grouped under the provider family.

Each account row should be able to show:

```text
nickname
account owner/type
connection(s)
plan/product
active/disabled
current pressure
reset/cooldown
what happens next
priority
requested/effective state
last successful use
```

Normal actions:

```text
Use next
Use first by default
Move up/down
Temporarily skip
Turn off automatic use
Reconnect
Open usage details
```

Important behavior:

- `Use next` changes future routing by default; it must not silently migrate an in-flight request.
- When PM switches automatically, show one plain reason, not a raw policy trace.
- Account switching and provider switching must use the same Multi-Account/routing service from Settings and Usage.
- Manual selection should visibly indicate whether it applies once, to the current Goal/session, to the project, or globally.

Existing commands to preserve:

```text
cmd.account.select_profile
cmd.provider.switch_route
```

---

## Free Models integration for Settings

The Plans already define `Free Models` as one PM grouping over underlying providers. Settings should therefore show:

```text
Free Models
Auto-Add Free Models: On
Last checked: 18 min ago
10 ready · 3 need setup · 2 temporarily limited
```

A model row should show a small, digestible subset:

```text
Model name
Underlying provider
Ready / needs setup / cooling down / no longer free
Free-state label
important capability icons
```

Expanded detail:

```text
Underlying provider and account
Source/version and last verification
Free-tier condition and expiry
Quota/pressure/reset when known
Setup action delegated to the underlying provider
Data-use or retention caveat when materially different
No longer free/available history
```

Do not collect credentials inside the Free Models wrapper. Setup should open the exact underlying provider/account connection surface and return to the originating Free Models row.

Do not create a second account switcher or a separate Free Models quota system. Usage and switching stay keyed to the underlying provider/account/model.

The current upstream catalog reports roughly 222 free/free-limited models across 20 providers and changes frequently. Settings must be source-driven, preserve removed entries as **No longer free/available** when referenced, and never hard-code the current provider list as a permanent enum.

Health and capability probes can consume a free provider’s quota. That usage should be attributed as probe/validation usage, not user work, and aggressive probing should not be a normal user setting.

---

## DRY ownership map

```text
Provider adapter
  Provider-native capabilities, labels, plan products, limits, extra-usage choices,
  rate changes, management actions, source freshness.

Settings Registry/service
  User choices and scope/inheritance. One canonical value regardless of entry point.

Multi-Account/routing
  Requested/effective account, connection resolution, priority, cooldown, switching,
  fallback reasons and receipts.

Models System
  Catalog, model IDs, aliases, capabilities, role assignments, Free Models wrapper.

Usage domain
  Current measured/provider-reported usage, balances, history, projection, forecast,
  exports, data-quality state.

Usage page/widgets
  Display and safe local filtering only. Deep-link to Settings for policy changes.

Command catalog
  Explicit user actions with typed payloads and receipts.
```

The Settings redesign should not embed provider billing logic in UI components.

---

## Commands relevant to this redesign

Reuse:

```text
cmd.settings.bloom.open
cmd.account.select_profile
cmd.provider.switch_route
cmd.usage.refresh
cmd.usage.export
cmd.widget.add
cmd.widget.remove
cmd.widget.resize
cmd.widget.configure
cmd.widget.move
cmd.widget.reset_layout
```

Potential future command, only if a real action is shipped:

```text
cmd.provider.usage.open_management
```

This would open a provider-native usage/credits/packs/reset page for the exact provider/account/product. It is not itself a purchase.

Any direct paid purchase or reset application needs its own explicit command, confirmation, permissions, result, and receipt. Do not mint provider-specific command IDs until direct execution is actually supported.

Resolve the existing overlap between `cmd.dashboard.add_widget` and `cmd.widget.add`; the shared widget command should remain canonical, with host/page context.

---

## Information-density rule

The Provider/Account manager should be **progressively disclosed**, not a giant form.

Default view answers:

```text
Is it connected?
What plan/connection is this?
How much is left?
What happens next?
Which account/provider will PM use?
Is extra paid usage enabled?
```

Advanced view answers:

```text
Why did routing switch?
Which meter or pack is being deducted?
What rate applies now?
What source reported this?
Which policy/version is active?
```

Support details answer the rest.

---

## Scope constraints for the Settings redesign

- Do not plan or redesign the future Dashboard or Orchestrator widget catalogs here.
- Keep the shared widget host domain-neutral so those pages can reuse it later.
- Do not treat accessibility as a redesign goal or acceptance category.
- Preserve Slint 1.17.1 portability and avoid Web-only blur/CSS assumptions in the production contract.
- No emojis; use SVG icons.
- Keep wording human and provider-specific; do not expose internal accounting terminology merely because the registry stores it.
