# Notifications, Sounds, Appearance, and Input

## Notifications & Sounds

Canonical location:

```text
General → Notifications & Sounds
```

Required manager areas:

```text
Notifications
Destinations
Event routing
Sounds and mappings
Uploaded sounds
Imported packs
Quiet/focus behavior
Test and diagnostics
```

### Delivery

Support:

```text
In-app title-bar stack/inbox
System/tray
Slack
Discord
Generic webhook
ntfy
Pushover
Telegram
```

Destination forms may include channel/thread, mentions, headers, templates, success predicates, priority, tags, click target, parse mode, retry, and device selection.

### Sound library

Support:

```text
Master sound and volume
Per-event mappings
Built-in asset metadata
Custom upload
Import/export
Local preview
Delete/replace
```

Metadata includes source, license, version, duration, hash, and default mapping.

PeonPing/OpenPeon-compatible pack import requires format and license checks. Do not bundle unverified packs.

Sound cannot be the only indication of failure, blocked work, approval, or completion.

Preview is local-only. Test-send is explicit, masked, rate-limited, and receipted.

### Notification surface rule

The title-bar notification stack/count/sprout inbox is the sole in-app notification affordance.

Do not create:

```text
permanent bottom-right stack
status-bar bell
Activity Bar notification shortcut
dedicated Notifications side panel
```

## Appearance

The Settings manager must go beyond rendering eight themes.

Support:

```text
Friendly/Glass/Retro/Basic
Light/Dark/Auto
Live OS appearance following
Custom TOML theme
Base-theme inheritance
Schema validation
Startup load/live reload
Invalid-theme diagnosis and fallback
Create/import/export/open folder
Custom and fallback fonts
Live hover preview
UI scale
Restart markers
Theme-specific locked/unavailable rows
```

## Spellcheck and dictionaries

Normal:

```text
Check spelling                 On
Language                       Automatic
Dictionary source              Automatic
Personal dictionary            Manage
Project dictionary             Use when available / Manage
```

Advanced source:

```text
Automatic — OS service then PM local
System dictionaries only
PM local dictionaries only
```

Additional controls:

```text
Check technical prose
Underline unknown names
Language packs
Thread/project overrides
```

No autocorrect. Grammar/style assistance is a separate opt-in provider-backed feature with privacy, route, cost, and Usage disclosure.

## Accessibility and input

Include UI scale, fonts, reduced motion, focus/input behavior, contrast-related diagnostics, keyboard operation, and spellcheck without turning accessibility into decorative badges.

## Teacher/help

Settings help includes explicit Teacher assistance and guided explanation, not only tooltips. Teacher can explain the current screen and transition safely into real actions.
