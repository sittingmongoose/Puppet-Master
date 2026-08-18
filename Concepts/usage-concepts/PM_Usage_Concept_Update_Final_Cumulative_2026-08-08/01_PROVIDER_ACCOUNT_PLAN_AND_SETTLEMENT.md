# Provider, Account, Plan, and Settlement

## Shared hierarchy

```text
Provider family
  Account/Profile
    Connection
      Product/Entitlement
        Models/Capabilities
```

Normal UI should remain human:

```text
Using Personal OpenAI
ChatGPT plan
68% left
Resets in 2h 14m
```

When requested and effective differ:

> You chose Work OpenAI, but PM used Personal OpenAI because the Work account had reached its limit.

Details can show Requested, Used, Connection used, Product/plan, and reason.

## Provider-native state

Track, where available:

```text
Included usage
Extra usage balance
Usage packs and expiration
Saved resets and expiration
Free allowance
Paid usage after plan
API usage
Current post-plan rate
Spending guard
Next reset/cooldown
Current pressure
```

Do not flatten all of these into one `budget`.

## Pricing and settlement

Keep separate:

```text
Reference API/catalog price
Active account product/plan
Included usage
Extra balance or pack
Actual settlement
Connection used
Source/freshness/confidence
```

Ordinary UI should say `Included with your plan` where appropriate. Reference API price belongs in Details and must not imply actual billing.

Settlement states may include:

```text
Included
Extra balance
Usage pack
API billed
Free allowance
No charge observed
Unknown
```

## Provider-specific continuation

Render adapter-provided choices under:

> What happens when included usage runs out?

Possible choices, only when supported:

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
Ask each time
```

Keep Codex, Claude API, Alibaba Coding/Token plans, Z.AI, OpenCode, Kimi, Free Models, and other product distinctions explicit.

## Multi-account

Same-provider accounts are grouped under the provider family.

A row can show:

```text
Nickname
Owner/type
Connection(s)
Plan/product
Active/disabled
Pressure/reset/cooldown
What happens next
Priority
Requested/effective
Last successful use
```

`Use next` affects future routing by default and never silently migrates an in-flight request.

## Free Models

Free Models is a catalog/routing wrapper.

A Usage row must identify:

```text
Model
Underlying provider
Account/profile
Connection/product
Selected through Free Models
Free/cooldown/removed state
```

Do not create a Free Models quota ledger.

Unconfigured accounts/providers do not appear as ordinary Usage rows. Their setup state belongs in Settings.

## Claude and Antigravity

Record Claude CLI and Antigravity CLI OAuth as CLI-owned profile routes. Do not label them PM-direct OAuth.

## Historical stability

Execution-time snapshots preserve aliases, product/plan, policy, catalog source/version, pricing/rate evidence, and route. Today's Settings must not reinterpret old events.
