# Plan-owner delta — Opus 5 — Atlas

*Model folder: `Opus 5`. Thesis: **Settings is a place**. Generated 2026-08-12.*

Concept agents do not edit canon. This file records what building **Opus 5 — Atlas** pressed on,
which plan owner would have to absorb it, and what could not be settled from the packet alone.
Structured counterparts: `impact-register.json`, `manager-coverage.json`,
`candidate-command-delta.json`, `candidate-wiring-delta.json`, `candidate-dry-delta.json`.

## What this concept's shape pressed on

Atlas treats Settings as a **place**: a directory of destinations, a persistent outline that always
answers "where am I", and manager *rooms* you travel into and back out of. Three owner-level
consequences fall out of that and out of nothing else.

### 1. FinalGUISpec — a destination needs a stable address

A place you cannot link to is not a place. Atlas made the deep-link grammar load-bearing rather than
decorative: `#/c/<category>/<subcategory>/<setting>` and `#/m/<manager>/<section>/<item>`, with exact
arities and a **replace** write when a saved route is restored so that reopening Settings does not
manufacture a phantom back step. The old chip/bloom contract has no address space at all, which is the
concrete reason it is superseded rather than adapted.

*Owner action:* FinalGUISpec must state the route grammar and the unknown-target rule (well-formed link
that names nothing → home plus an inline notice quoting the link). Without the second half, a renamed
setting id silently becomes a blank screen.

### 2. Permissions / FileSafe — ordered rules are a manager, not a settings page

`manager-filesafe` is the largest surface in the build (11 sections, 34 items, 8 ordinary setting rows).
Ordering is semantic: a rule's position changes the verdict, so "reset order" is a real operation with a
receipt, and the row grammar cannot express it. Any plan that leaves FileSafe as a list of toggles will
have to grow a rule editor later.

*Owner action:* Permissions and FileSafe should agree on one ordered-rule model with a test action, and
the settings inventory should carry the manager pointer rather than duplicating rule fields.

### 3. Assistant Memory — provenance is the row, not a detail popover

Memory rows carry provenance, verification state, half-life, recall and pin state at the same time. In a
place-shaped design the room is where that detail lives, which exposed that *delete* and *redact* are
different operations with different receipts, and that a version restore is a third.

*Owner action:* Assistant Memory needs three distinct commands, not one destructive edit.

## Owners this concept could not satisfy from the packet

- **Project Sync owner.** `PACKET/07` forbids modelling the Project Sync state machine here. Atlas shows
  the destination and stops.
- **Release/updates owner.** An installation whose update failed and rolled back, while an open thread
  still uses the frozen generation, is rendered as fixture evidence. Whether Settings may trigger the
  repair is the release owner's call.

## Unresolved, in priority order

1. Does `cmd.usage.refresh` belong to Settings or to the Usage owner? Atlas shows Usage as a boundary
   card precisely to avoid answering this by accident.
2. Is an installation shared by two provider families one record or two? The fixture models one record
   with two references.
3. Retention period for update logs and failed staged installations — 30 days is a placeholder.
