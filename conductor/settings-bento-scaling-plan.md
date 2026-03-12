# Settings Page Resizing & Dynamic Widget Scaling Plan

## 1. Objective
Solve the horizontal and vertical scaling issues for the Settings Bento Grid. 
1. **Horizontal Constraint:** Ensure that when few cards are present (e.g., via filtering or small screens), a single card doesn't comically stretch across the entire width of the page.
2. **Vertical Scaling & Population:** Allow cards to size vertically based on a robust set of settings rather than looking artificially stretched or empty. We will intelligently populate the cards with more settings pulled from the Inspector panel, allowing them to naturally grow taller. We will enforce a firm `max-height` cap so they never break the layout.

## 2. Key Files & Context
- **Target File:** `Concepts/PuppetMasterDashComp.html`
- **Current Issue:** `.bento-grid` uses `auto-fit` (which makes lone items stretch to `1fr` of the entire container) and the cards lack enough content to justify vertical space, leading to empty stretched boxes or broken scrolling.

## 3. Implementation Steps

### Phase 1: Horizontal CSS Grid Fix
1. **Update `.bento-grid`:** Change `grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));` to use `auto-fill` and a slightly larger base width:
   ```css
   .bento-grid {
     display: grid;
     grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
     align-items: start; /* Prevents cards from stretching to match row height */
     gap: var(--lg);
   }
   ```
   *Why this works:* `auto-fill` generates "phantom" columns to fill the container. If the screen is 1000px wide, it creates three 333px columns. A single bento box will only take up one of those 333px columns, perfectly solving the over-stretching issue.

### Phase 2: Vertical Scaling & Max-Height Cap
1. **Update `.bento-card`:**
   ```css
   .bento-card {
     ...
     max-height: 420px; 
     overflow-y: auto; /* Internal scrollbar if it exceeds cap */
     height: max-content; /* Sits naturally within the grid */
   }
   ```
   *Why this works:* Combined with `align-items: start` on the grid, cards will now only be exactly as tall as their content requires, giving a clean, ragged masonry-like appearance at the bottom of rows, capped safely at 420px.

### Phase 3: Intelligent Setting Population (The "Involved" Part)
To make the vertical scaling actually useful, we need to populate the `.bento-surface` of each card with the highly-relevant settings currently hidden in the `.inspector-view`. As they are added, the cards naturally grow taller.

1. **General Card:** Add `Animations Toggle` and `Font Selection`.
2. **Branching Card:** Add `Auto-merge threshold` and `Require manual review on failure`.
3. **Models Card:** Add `Temperature`, `Context Window Limit`, and `Max Tokens`.
4. **Security Card:** Add `Command blocklist toggle`, `Require network approval`.
5. **Containers Card:** Add `Docker path`, `Default Base Image`.
6. **Permissions Card:** Add `Scope override`, `Max Doom Loop Retries`.
7. **Formatters Card:** Add `Scope selection` and `Auto-format on save`.

*I will systematically move/copy these HTML labels and inputs into their respective `.bento-surface` containers so they look dense, data-rich, and take advantage of the vertical scale.*

## 4. Verification
1. Open `Concepts/PuppetMasterDashComp.html` in a browser.
2. Filter the settings so only 1 card is visible -> verify it does NOT stretch across the entire screen.
3. Resize the window horizontally -> verify the cards gracefully snap to a single column when the screen is too narrow for two 320px cards.
4. Verify the cards have independent heights (not stretching to match their row neighbors) and feature 5-7 settings each, capping out vertically at 420px.