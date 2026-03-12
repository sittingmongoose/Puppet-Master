# Settings Inspector & Widget Scaling Tweaks Plan

## 1. Objective
Apply user-requested tweaks to the Settings page in `Concepts/PuppetMasterDashComp.html`:
1. Fix the bug where clicking "Configure Settings" (the advanced settings button on a bento card) opens the sidebar with *all* sections loaded, rather than just the relevant one.
2. Allow widgets (bento cards) to resize horizontally to fit side-by-side on narrower screens before dropping to a single column.
3. Enable vertical scaling with a maximum height limit so widgets can grow dynamically to fit more information but don't stretch indefinitely.

## 2. Key Files & Context
- **Target File:** `Concepts/PuppetMasterDashComp.html`
- **Scope:**
  - CSS updates to `.inspector-view` to correctly hide inactive views.
  - CSS updates to `.bento-grid` to adjust the `grid-template-columns` constraints.
  - CSS updates to `.bento-card` to set a `max-height` and enable internal scrolling (`overflow-y: auto;`).

## 3. Implementation Steps

### Phase 1: Fix Inspector View Bug
1. Locate the CSS rules for `.settings-inspector-panel .inspector-body`.
2. Append the missing CSS rules for `.inspector-view`:
   ```css
   .inspector-view {
     display: none;
   }
   .inspector-view.active {
     display: block;
   }
   ```
   *This ensures that only the section relevant to the clicked advanced settings button is visible.*

### Phase 2: Horizontal Resizing for Bento Grid
1. Locate the `.bento-grid` CSS class.
2. Change the `grid-template-columns` property from `repeat(auto-fit, minmax(320px, 500px))` to `repeat(auto-fit, minmax(260px, 1fr))`.
3. Change `justify-content: start;` to `justify-content: stretch;` (or let it default).
   *This lowers the minimum width threshold, allowing two cards to comfortably sit side-by-side on narrower screens, and uses `1fr` so they flexibly fill the available space instead of capping rigidly at 500px.*

### Phase 3: Vertical Scaling for Widgets
1. Locate the `.bento-card` CSS class.
2. Add a maximum height constraint and allow vertical scrolling for overflowing content:
   ```css
   max-height: 400px;
   overflow-y: auto;
   ```
   *This allows the cards to expand vertically to accommodate varying amounts of content (like many form fields), while preventing them from becoming absurdly tall on large screens.*

## 4. Verification
- Open `Concepts/PuppetMasterDashComp.html` in a browser.
- Click the "Settings" nav tab.
- Click any "Configure X settings..." button on a card and verify the slide-out panel only displays that specific category (e.g., General, Auth).
- Resize the browser window to a narrower width and verify that the grid maintains two columns until the cards hit ~260px wide, instead of jumping immediately to one column.
- Verify that bento cards smoothly accommodate their content vertically, capping out and scrolling if they exceed 400px in height.