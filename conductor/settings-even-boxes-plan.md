# Settings Grid Balancing & Search Bar Fix Plan

## 1. Objective
1. **Search Bar Fix:** Resolve the sticky scroll behavior of the `.settings-search-bar` so it stays statically at the top of the page rather than following the user as they scroll down.
2. **Grid Height Balancing:** Make all bento cards visually uniform in height naturally (without adding empty stretched space). We will achieve this by ensuring every bento card contains roughly 5-6 settings in its `.bento-surface`, populating the currently "short" cards with more settings from their respective inspector panels.

## 2. Key Files & Context
- **Target File:** `Concepts/PuppetMasterDashComp.html`

## 3. Implementation Steps

### Phase 1: Search Bar Scroll Fix
- **Action:** Locate `.settings-search-bar` in the CSS.
- **Change:** Remove `position: sticky; top: 0; z-index: 10;` so it remains a static element at the top of the document flow and scrolls out of view naturally.

### Phase 2: Content Balancing for Bento Cards
Currently, some cards have 5-6 settings (General, Models) and look great, while others have 2-3 (Personas, Health, Plugins) and look stunted. We will equalize them by adding 3-4 additional inputs/toggles to the short cards, utilizing the `.bento-surface row` flex layout.

1. **Memory Card (Currently 3 items) -> Add 3:**
   - Add `Max Context Length` (number input)
   - Add `Summarization Threshold` (select)
   - Add `Auto-prune old context` (checkbox)

2. **Interview Card (Currently 3 items) -> Add 3:**
   - Add `Enable phase subagents` (checkbox)
   - Add `Enable research subagents` (checkbox)
   - Add `Auto-proceed on confidence` (checkbox)

3. **Auth Card (Currently 3 items) -> Add 3:**
   - Add `Multi-account count` (number input)
   - Add `Session Timeout` (select)
   - Add `Require 2FA for destructive` (checkbox)

4. **Health Card (Currently 2 items) -> Add 3:**
   - Add `Platform filter` (select)
   - Add `Auto-clean on exit` (checkbox)
   - Add `Log retention (days)` (number input)

5. **Personas Card (Currently 2 items) -> Add 4:**
   - Add `Persona mode` (select)
   - Add `System Prompt Override` (text input)
   - Add `Default Persona` (select)
   - Add `Strict tone matching` (checkbox)

6. **Plugins Card (Currently 2 items) -> Add 4:**
   - Add `Plugin directory` (text input)
   - Add `Auto-update plugins` (checkbox)
   - Add `Allow network for plugins` (checkbox)
   - Add `Strict version matching` (checkbox)

7. **Formatters Card (Currently 4 items) -> Add 2:**
   - Add `Default formatter` (select)
   - Add `Format on paste` (checkbox)

8. **Commands Card (Currently 2 items) -> Add 4:**
   - Add `Enable custom aliases` (checkbox)
   - Add `Prefix character` (text input)
   - Add `Export commands` (checkbox)
   - Add `Command Timeout (s)` (number input)

9. **Editor Card (Currently 2 items) -> Add 4:**
   - Add `Font size` (number input)
   - Add `Show line numbers` (checkbox)
   - Add `Highlight active line` (checkbox)
   - Add `Minimap` (checkbox)

By standardizing the item count across all 15 cards to ~5-6 items, CSS Grid's `align-items: start` and the card's `height: max-content` will naturally result in a beautifully aligned, masonry-like grid where boxes are the same length without artificial empty space.

## 4. Verification
1. Open `Concepts/PuppetMasterDashComp.html` in a browser and navigate to the Settings page.
2. Scroll down and verify the search bar scrolls out of view instead of floating over the cards.
3. Review the grid layout visually: ensure all cards look uniformly tall (~5-6 settings each) and that no card looks "empty" or disproportionately short compared to the rest.