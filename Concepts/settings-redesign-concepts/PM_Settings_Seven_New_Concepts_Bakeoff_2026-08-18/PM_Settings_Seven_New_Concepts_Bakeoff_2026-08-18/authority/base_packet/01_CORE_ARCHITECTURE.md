# Core Settings Architecture

## Product model

Settings is a system with three coordinated surfaces:

```text
Settings Home
Settings Workspace
Dedicated Managers
```

### Settings Home

The Home has four jobs:

1. Search for any setting, manager, action, or diagnostic.
2. Enter a primary Settings destination.
3. Show high-value attention/setup notices.
4. Resume recent Settings work.

Preserve the current search behavior. It may be repositioned and visually improved, but must remain cross-category, fuzzy, and deep-linkable.

Replace filter-like category pills with destination controls that communicate:

```text
Title
Purpose
Optional health/setup summary
Clear navigation affordance
```

### Notices

Separate:

```text
Needs attention
Continue setup
Recommended
```

A notice contains:

- one stable status treatment;
- one actionable headline;
- one short reason;
- at most one primary action and one quiet secondary action.

Do not repeat category, setting type, urgency, and status in four layers of text. Alert/Attention belongs in a stable status area, not inside the explanatory sentence.

### Settings Workspace

Load one category at a time. The right side is a continuous document of that category's subcategories.

Behavior:

1. A destination or search result opens the full workspace.
2. The selected category loads.
3. The requested subcategory/setting/manager scrolls into view.
4. Scrolling updates the active left-nav subcategory.
5. Clicking a subcategory performs a controlled jump.
6. Clicking another category replaces the category document.
7. Search can load any category and focus the result.
8. A focused setting receives a brief non-flashing treatment.

At narrow widths, collapse the navigation intelligently; do not squeeze forms until labels and values clip.

## Left shell canon

The Activity Bar is the narrow icon rail on the left. It controls one adjacent left side-panel slot. Do not use stale right-side-panel descriptions.

Settings may occupy the main workspace or a dedicated large surface according to the concept, but it must coexist correctly with the left rail, side panel, top bar, bottom bar, and responsive surrounding shell.

## Search result types

Search may return:

```text
scalar setting
manager destination
one-shot action
read-only status
diagnostic
setup workflow
unavailable capability
```

These types must be visibly distinct and route to their canonical owner.

## Project settings

Each Project has one concrete settings set.

`Copy Settings From…` is a one-time transactional copy, normally grouped into about ten broad categories. It requires preview, restore point, atomic apply, verification, receipt, and rollback. The destination becomes independent immediately afterward.

Do not invent a universal Project inheritance system. Effective/inherited/managed display remains valid only where intrinsic, such as Permissions, organization policy, installations, and thread/run overrides.

## Required design qualities

- Search-centric without dead space.
- Dense enough for a desktop development environment without becoming a wall of forms.
- No left accent borders.
- No emoji.
- No clipped or uneven text.
- No pill controls that imply filters when they are destinations.
- No horizontal offscreen shelves as the main desktop interaction.
- Stable information hierarchy across all themes.
