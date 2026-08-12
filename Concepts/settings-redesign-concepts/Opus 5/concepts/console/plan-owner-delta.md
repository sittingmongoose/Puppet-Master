# Plan-owner delta — Opus 5 — Console

*Model folder: `Opus 5`. Thesis: **Settings is a question**. Generated 2026-08-12.*

Concept agents do not edit canon. This file records what building **Opus 5 — Console** pressed on,
which plan owner would have to absorb it, and what could not be settled from the packet alone.
Structured counterparts: `impact-register.json`, `manager-coverage.json`,
`candidate-command-delta.json`, `candidate-wiring-delta.json`, `candidate-dry-delta.json`.

## What this concept's shape pressed on

Console treats Settings as a **question**: the search field is the application, places are a numbered
contents page, and an answer becomes a live control in place. That inverts the usual pressure — the
index carries the weight, not the tree.

### 1. Settings Search — search is a first-class surface, not a filter box

The shared index carries 416 records across nine kinds (category, subcategory, setting, manager,
action, status, diagnostic, provider, model). Console proved that a search-first design needs two things the packet's
inventory does not currently mandate: **exposure carried on every record**, so a risky `unavailable`
item can be found without being rendered as an equally inviting default control; and **plain-language
filter tokens** (`scope:project`, `level:expert`, `kind:managers`) that narrow results without ever
being applied to a primary destination.

*Owner action:* the settings inventory owner must treat exposure as required metadata, and the UI
Command Catalog must decide whether `cmd.settings.search.select_result` carries the filter state.

### 2. Notifications & Sounds — one surface, and sound is never alone

`PACKET/06` makes the title-bar stack/inbox canonical. Console's notification manager (5 sections,
20 items) is the reason the shell owns that inbox rather than each concept: every receipt raised
anywhere on the page bridges into it, so an operation can never appear twice or not at all. There is no
bottom-right toast stack, no status-bar bell, no rail shortcut and no dedicated notifications panel —
verified by absence, not by intent.

*Owner action:* the notifications owner should state the bridge as a requirement: *any* operation that
can make a sound must also produce an inbox entry.

### 3. Appearance — a theme is a preview, an apply and a fallback

Eight themes in light and dark plus reduced motion is not a colour picker. Console's appearance manager
carries preview, apply, import, export and an explicit fallback when a theme fails validation, because a
theme that half-applies is worse than one that refuses.

*Owner action:* Appearance needs a validation-and-fallback contract, not just a token list.

## Owners this concept could not satisfy from the packet

- **Teacher/Help owner.** Teacher explains the current screen and can guide a real action; where the
  boundary sits between explanation and automation is not specified.
- **Spellcheck owner.** Grammar/style assistance is a separate opt-in provider-backed feature with its
  own privacy, route, cost and Usage disclosure. Console shows the opt-in and stops.

## Unresolved, in priority order

1. Does selecting a search result carry the active filter tokens into the destination's state?
2. Is the sound library's licence metadata authoritative for redistribution, or advisory?
3. Who owns the "quiet/focus" schedule — Notifications, Desktop, or a shared quiet-hours owner?
