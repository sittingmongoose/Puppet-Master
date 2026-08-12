# Provider/Model Selector, Access, BSD, and Warnings

## Model picker

Required behavior:

```text
Favorites
Recents
Provider/account groups
Provider icon rail
Search
Available and unavailable models
Explicit active account/connection
Disabled reason
```

Clicking a provider icon filters to its account instances and models. The same model under two accounts is two distinct routes.

A model row may show compact capability/availability information, but must not become a wall of badges.

## Effort and Normal/Fast

Selecting a model keeps the menu stack open while the user chooses:

```text
Reasoning/effort, when supported
Normal or Fast, when supported
```

Unsupported controls are absent or explained. Fast mode is adapter/capability-driven, not inferred from model names.

The UI can show requested and effective selections when provider behavior differs.

## Access selector

Use:

```text
Ask for approval
Auto accept edits
Auto
Full Access
```

Conversation/workflow mode and access profile are separate.

Plan and Review can use safe read, repository search, web search/fetch, browser inspection, screenshots, logs, diagnostics, static analysis, and approved sandboxed tests. Their ceiling applies to consequential effects.

If a mode or policy narrows the selected access profile, show concise text such as:

> Full Access · Limited by Review mode

FileSafe and mandatory deny rules remain effective.

## Compact approvals

Default approval card:

```text
Run 2 commands?
Workspace only · Needed to run the test suite

[Deny] [Allow once] [Allow for session] [Details]
```

Details contains exact commands/files/servers/domains, persistence, safer alternative, and technical receipts.

Model:

```text
Compact decision; expandable evidence.
```

## Back Seat Driver

The `BSD` selector supports:

```text
Off
Auto — system default
On
```

Scope options:

```text
This turn
This thread
```

Visual states:

```text
Off
Auto idle
Auto actively evaluating — theme-aware glow
On — distinct manual color/treatment
Silent result
Advice available
Duplicate suppressed
Timed out
Unavailable
Quota limited
```

BSD receives bounded deltas, is read-only by default, cannot widen authority, and cannot block the primary turn when unavailable.

## Material route warnings

Do not warn on every change. Warn when PM predicts a material consequence:

```text
provider/account boundary
conversation replay
cache loss
smaller context
attachment incompatibility
tool/MCP change
price/allowance change
privacy/hosting change
paid continuation
```

Example:

```text
Switch to Claude API?
This will resend the conversation through a different provider and restart the prompt cache.

[Cancel] [Branch] [Switch] [Details]
```

Possible choices:

```text
Continue here
Branch with new model
Start new chat
Cancel
```

The first view shows only the most important consequence.
