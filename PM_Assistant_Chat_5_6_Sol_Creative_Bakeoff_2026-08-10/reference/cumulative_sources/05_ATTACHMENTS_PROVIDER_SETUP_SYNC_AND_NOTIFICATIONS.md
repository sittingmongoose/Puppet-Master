# Attachments, Provider Setup, Sync, Updates, and Notifications

## Attachment resolver

Every attempted attachment resolves to:

```text
Native
PM transformed
Alternate model
Unsupported
```

Examples:

```text
ZIP → safe manifest and selected extracted files
PDF → text plus selected page images
Audio → transcript
Video → transcript plus selected frames
Spreadsheet → structured sheet/range summaries
Large image → resize/tile
```

Derived material preserves lineage to the original attachment.

Alternate-provider routing requires confirmation when privacy, account, cost, terms, or location changes.

Example:

```text
This model cannot read video.
[Cancel] [Extract in PM] [Use Gemini]
```

Changing models reevaluates retained attachments and tools.

## Provider setup from Chat

When a route is not configured, Chat/model picker can open the exact Provider Settings/setup destination and preserve return context.

It may show:

```text
CLI not found
Sign-in required
API key required
Usage details unavailable
Model unavailable on this account
Update/repair required
```

Chat does not become the Provider Manager.

Claude/Antigravity CLI OAuth remains CLI-owned. PM-direct OAuth copy must not appear.

## Provider installation/update states

Chat may show compact states:

```text
Install required
Update available
Update scheduled when idle
Waiting for current work
Verifying
Update failed; rolled back
Needs repair
```

Detailed logs, install method, pinning, and rollback live in Settings.

A missing provider CLI never silently installs from an agent request.

## Offline and synchronization

Required states:

```text
Cached
Synchronizing
Live
Offline
Queued to send
Reconnect
Replay
Snapshot catch-up
Server work continuing
```

One environment connection may multiplex many threads. Domain sync failures remain separate from transport health.

Large catch-up may use a snapshot while live events are buffered. Do not imply the current T3 implementation is already fast; use its slow-load behavior as a regression fixture.

## Server-first placement

Ordinary Chat should not repeat giant host banners. Compact state may identify:

```text
Home Server
Execution Host
Environment
Connection route
```

A host-owned Goal can continue when the client closes.

## Notifications

Use the canonical title-bar notification stack/inbox for app-wide events. Do not create a dedicated Chat notification panel, bottom-right permanent stack, or Activity Bar notification icon.

Chat can render local inline outcomes that belong to the current task.

## PM-native browser terminology

Use:

```text
BrowserWorkspace
Browser Action
Browser Program
Expert Browser Program
```

Never use Playwright-compatible/familiar/shaped PM terms. User-project Playwright tests are ordinary external project commands.
