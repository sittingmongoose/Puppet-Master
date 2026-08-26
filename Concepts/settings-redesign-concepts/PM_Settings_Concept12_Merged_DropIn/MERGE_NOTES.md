# Concept12 Merged DropIn — notes

Entry: `Concepts/settings-redesign-concepts/kimi-k3/concept-12-tome-tabs.html`

## Merge rule applied
- **Chrome** from Clean: quieter domain rail, continuous domain scroll + page index, Clean-style search, flat centered headers (no logos), topbar without Settings healthy.
- **Content** from Complete: all expanded managers, settings sections, `kimi-data.js`, and toolchain/tab behavior unchanged.

## Topbar / page tools
- Removed `Settings healthy`.
- Moved **Puppet Master** project pill next to **Page options** (where Show all explanations used to sit).
- **Show all explanations** now lives inside the Page options menu (with advanced / reset / copy deep link).

## Continuous domain scroll
- Non-home views render all domain workspaces as sequential blocks with a Clean page-index (workspace titles + dotted section links).
- Top workspace tabs removed; scroll spy updates workspace + section.
- Centered workspace separators are title + one-line description (no logos).
- Search uses Clean anchored dropdown and jumps into continuous blocks.
- Page tools sit in the document toolbar (absolute-right).

## Chrome follow-ups
- Left rail matches Clean: title/project, real search input, Settings Home, Chapters, Essential setup card, Settings health card.

## Complete section layouts intentionally retained
Manager and dense section bodies were kept from Complete without restyle:
- AI Providers (roster + detail tabs)
- Web / Media routes
- Toolchain & Extensions (extra tabs)
- Testing & Debug
- Context & Memory, Goals, Personas
- Source Control, Permissions, Backup, Doctor, Servers, Updates
- Settings document sections with local nav + detail inspector

Only light chrome adaptations (header grid, page tools) wrap those bodies.
