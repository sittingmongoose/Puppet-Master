# Implementation Plan: Final Settings Tweaks

## Objective
Execute the final wave of polish and bug fixes for the Settings UI. This includes fixing the broken left sidebar, ensuring smooth bidirectional animations for the inspector panel, fixing inspector rounded corners, dialing in the entry animations, capping bento box widths, enabling dynamic vertical heights, styling retro light checkboxes, and cleaning up redundant HTML (removing Settings B and C).

## Key Files & Context
- **File:** `Concepts/PuppetMasterDashComp.html`
- **Constraint:** DO NOT USE EMOJIS in code or documentation.

## Implementation Steps

### 1. Remove Settings B & C and Rename A
- **HTML (Tabs):** Find the `.page-tabs` section. Remove the tabs for "Settings (B - Dashboard)" and "Settings (C - Masonry)". Rename "Settings (A - Tabs)" to simply "Settings", and change its `data-page` from `settings-a` to `settings`.
- **HTML (Pages):** Delete the entire `<div class="page page-settings-b">` and `<div class="page page-settings-c">` blocks. Change `<div class="page page-settings-a">` to `<div class="page page-settings">`.
- **CSS / JS:** Update any references from `.page-settings-a` to `.page-settings`.

### 2. Restore the Settings Sidebar
- **CSS:** The left bar broke because it lost its explicit layout rules. We will restore and fortify `.settings-sidebar` to ensure it renders as a distinct box.
  ```css
  .settings-sidebar {
      width: 220px;
      min-width: 220px;
      background: var(--surface-elevated);
      border-right: 1px solid var(--border);
      padding: var(--md) 0;
      display: flex;
      flex-direction: column;
      overflow-y: auto;
  }
  ```

### 3. Fix Inspector Panel Animations & Corners
- **CSS (Animation):** The inspector closes instantly because it likely defaults to `display: none` somewhere or loses the transition abruptly. We will ensure it is always `display: flex` but uses `transform` and `visibility` to hide smoothly.
  ```css
  .settings-inspector-panel {
      /* existing properties */
      visibility: hidden;
      transform: translateX(100%);
      transition: transform 0.3s cubic-bezier(0.4, 0.0, 0.2, 1), visibility 0.3s;
      overflow: hidden; /* Fixes the corner overlap issue */
  }
  .settings-inspector-panel.open {
      visibility: visible;
      transform: translateX(0);
      transition: transform 0.3s cubic-bezier(0.4, 0.0, 0.2, 1), visibility 0s;
  }
  ```

### 4. Adjust Bento Load Animations
- **CSS & HTML:** Slow down the animations so they are legible, and change the "General" card from a drastic side-slide to a gentler `slideUp`. We will spread the staggered delays out from `0ms` to `600ms`.

### 5. Cap Horizontal Width of Bento Boxes
- **CSS:** Change the `.bento-grid` layout to limit the maximum width of cards when they expand, and align them to the start of the grid so they don't stretch indefinitely across a massive monitor.
  ```css
  .bento-grid {
      display: grid;
      /* Cap max width at 500px, but fill available columns */
      grid-template-columns: repeat(auto-fit, minmax(320px, 500px));
      justify-content: start;
      gap: var(--lg);
  }
  ```

### 6. Enable Dynamic Vertical Height
- **CSS:** Remove `grid-auto-rows: min-content;` from `.bento-grid`. By default, CSS Grid stretches items to match the tallest item in their row.
- Ensure `.bento-action` has `margin-top: auto;` so the button is always pinned to the bottom of the card as it stretches vertically.

### 7. Retro Light Checkbox Border
- **CSS:** Ensure the `retro-light` mode has a stark, visible border when checked, so it doesn't look washed out.
  ```css
  [data-theme="retro-light"] input[type="checkbox"]:checked {
      border-color: var(--border); /* Dark border for visibility */
      background: var(--accent-lime);
  }
  ```

## Verification & Testing
1. **Tabs:** Ensure there is only one "Settings" tab at the top.
2. **Sidebar:** Verify the left sidebar in Settings has a background, border, and correctly lays out the categories.
3. **Inspector Panel:** Click "Configure settings...". Verify it slides out from the right with a rounded top-left corner. Click it again and verify it slides back to the right smoothly instead of instantly vanishing.
4. **Grid Sizing:** Filter down to a category with only 1 or 2 cards. Verify they do not stretch wider than 500px. Verify they stretch vertically to match other cards in the same row.
5. **Animations:** Verify the page load animations are slower, smoother, and use a gentler animation for the General card.
6. **Checkboxes:** Switch to Retro Light and check a box; verify it has a solid, visible border.