# Implementation Plan: Update Settings Page A to Filterable Expanding Bento Grid

## Objective
Revamp "Settings (A - Tabs)" in `Concepts/PuppetMasterDashComp.html` to function as an "Elastic Bento Grid". When a user clicks a category in the left sidebar, the bento boxes on the right should filter to match that category, and the remaining boxes should expand to fill the available space. The font for basic themes will also be updated to Bricolage Grotesque, and the styling will be tweaked to feel less corporate and closer to the modern "wizard" aesthetic.

## Key Files & Context
- **File:** `Concepts/PuppetMasterDashComp.html`
- **Context:**
  - The left sidebar (`.settings-sidebar`) contains `.settings-tab` links.
  - The right area (`.bento-grid`) contains `.bento-card` elements.
  - We need to add an "All Settings" tab to the top of the sidebar.
  - We need to map sidebar tabs to bento cards using `data-category`.
  - We need to adjust CSS to allow the grid to dynamically expand items (`auto-fit` + `minmax`) when items are hidden.
  - We will update the Google Fonts import to include "Bricolage Grotesque" and assign it to the `basic-light` and `basic-dark` themes.

## Implementation Steps

### 1. Update Fonts
- In the `<head>`, update the Google Fonts `<link>` tag to include `Bricolage+Grotesque:opsz,wght@12..96,200..800`.
- Update the `--body-font` and `--display-font` variables for `[data-theme="basic-light"]` and `[data-theme="basic-dark"]` to use `'Bricolage Grotesque', system-ui, sans-serif`.

### 2. Update Sidebar (HTML)
- In `.page-settings-a .settings-sidebar`, add a new link at the top:
  `<a href="#a-all" class="settings-tab active" data-filter="all">All Settings</a>`
- Update existing `.settings-tab` links to include a `data-filter` attribute matching their category (e.g., `data-filter="core"`, `data-filter="features"`, etc.) and ensure the `href` matches (e.g., `href="#a-features"`).

### 3. Update Bento Cards (HTML)
- Add a `data-category` attribute to each `.bento-card` in `.page-settings-a`. For example:
  - General: `data-category="core"`
  - Tiers & Branching: `data-category="core"`
  - Memory & Context: `data-category="features"`
  - Models & Media: `data-category="features"`
  - Security & FileSafe: `data-category="features"`
  - Containers & Registry: `data-category="features"`
  - Interview & Orchestrator: `data-category="features"`
  - Authentication & Accounts: `data-category="system"`
  - Health & Doctor: `data-category="system"`
  - Permissions & Rules: `data-category="system"`
  - Personas: `data-category="system"`
  - Plugins & Skills: `data-category="extensions"`
  - Formatters & LSP: `data-category="extensions"`
  - Commands & Shortcuts: `data-category="extensions"`
  - Editor UX & File Manager: `data-category="editor"`

### 4. Update CSS Grid
- Ensure `.page-settings-a .bento-grid` uses:
  ```css
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  grid-auto-rows: min-content; /* Ensure they don't stretch vertically unncessarily unless we want them to */
  ```
- Add a utility class to hide filtered cards:
  ```css
  .bento-card.filtered-out {
      display: none !important;
  }
  ```
- Update `.bento-card` styles to match the wizard aesthetic:
  ```css
  .bento-card {
      background: var(--surface-elevated);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: var(--xl);
      box-shadow: 0 4px 12px rgba(0,0,0,0.05);
      display: flex;
      flex-direction: column;
      gap: var(--sm);
      transition: all 0.2s ease;
  }
  [data-theme^="retro"] .bento-card {
      border-radius: 0;
      box-shadow: 4px 4px 0 rgba(0,0,0,0.5);
      border-width: var(--border-width);
  }
  .bento-card:hover {
      border-color: var(--accent-blue);
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(0,0,0,0.1);
  }
  [data-theme^="retro"] .bento-card:hover {
      border-color: var(--accent-lime);
      box-shadow: 6px 6px 0 rgba(0,0,0,0.5);
  }
  ```

### 5. Add JavaScript Filter Logic
- In the `DOMContentLoaded` event listener, add logic for the `.settings-tab` clicks:
  ```javascript
  document.querySelectorAll('.page-settings-a .settings-tab').forEach(tab => {
      tab.addEventListener('click', function(e) {
          e.preventDefault();
          // Update active state in sidebar
          document.querySelectorAll('.page-settings-a .settings-tab').forEach(t => t.classList.remove('active'));
          this.classList.add('active');
          
          const filter = this.getAttribute('data-filter');
          const cards = document.querySelectorAll('.page-settings-a .bento-card');
          
          cards.forEach(card => {
              if (filter === 'all' || card.getAttribute('data-category') === filter) {
                  card.classList.remove('filtered-out');
              } else {
                  card.classList.add('filtered-out');
              }
          });
      });
  });
  ```

## Verification & Testing
1. **Font Check:** Switch to "Basic Light" theme and verify the font changes to Bricolage Grotesque.
2. **Filter Check:** Open "Settings (A - Tabs)". Click "Features" in the sidebar. Verify only the 5 "Features" boxes remain, and they expand horizontally to fill the empty space.
3. **All Settings:** Click "All Settings" and verify all boxes return to their original grid layout.
4. **Style Check:** Verify the bento cards now have smoother borders, subtle shadows, and a hover lift effect that matches the wizard styling.