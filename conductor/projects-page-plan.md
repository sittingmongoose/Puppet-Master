# Projects Page & Settings Modal Overhaul Plan

## 1. Objective
Redesign the "Projects" page in `Concepts/PuppetMasterDashComp.html` to be distinct from traditional IDEs (like VSCode). The design will cater to "vibecoders" and beginners by using a clean, engaging "Bento-style" card grid instead of a dense data table. Additionally, implement a functional, polished Project Settings modal that activates when clicking the settings icon on any project card, featuring high-quality transition animations.

## 2. Key Files & Context
- **Target File:** `Concepts/PuppetMasterDashComp.html`
- **Scope:** 
  - CSS updates: Replace `.page-projects` styles. Add styles for the new project card grid, the `#projectSettingsModal`, and its entry/exit animations.
  - HTML updates: Replace the `<div class="page page-projects">` table structure with the new Bento grid layout and append the settings modal markup.
- **Constraints:** 
  - No emojis allowed (use inline SVG icons).
  - Modern, non-VSCode aesthetic.
  - MUST preserve all existing project info/options: Health, Name, Path, Languages, Last opened, Status, and Actions (Open, Settings, Remove, Archive).
  - Include nice, smooth animations (especially for opening/closing the settings module).

## 3. Implementation Steps

### Phase 1: CSS Redesign
1. **Layout & Header:** Update `.page-projects` to use a flex/grid layout with ample spacing. Add classes for a bold header (`projects-header-bento`) and stylized action buttons.
2. **Projects Grid (`projects-grid-bento`):** Create a responsive CSS grid for project cards.
3. **Project Cards (`project-card bento`):** 
   - Style cards with borders, border-radius (`var(--border-radius)` or specific to themes), and subtle hover lift/shadow animations.
   - Distinct highlight for the "Current" active project.
   - Header with health dot, project name, and status badge (Idle, Running, etc.).
   - Body with file path and tech stack tags (`lang-badge`).
   - Footer with "last opened" text.
   - Hover state or dedicated actions row to reveal options: Open, Settings (SVG icon), Remove, Archive.
4. **Settings Modal (`project-settings-modal`):**
   - Create an overlay with backdrop blur or semi-transparent background.
   - Add entry/exit keyframe animations for the modal. For example, a `slideUpFadeIn` animation that gently scales and slides the module into view, with a corresponding backdrop fade animation.
   - Center a bento-style modal container.
   - Use a two-column layout: left sidebar for tabs (General, Agent Behavior, etc.) and right pane for form fields and toggles.
   - Style tabs to use smooth transitions for active state switching.

### Phase 2: HTML Structure Replacement
1. **Remove Old Table Structure:** Delete the existing `.projects-breadcrumb`, `.projects-header`, `.projects-toolbar`, and `.projects-list-wrap` containing the table.
2. **Inject New Grid Layout:**
   - Add the new Title Area and Main Actions.
   - Add a redesigned Toolbar (search input with SVG icon, filter chips like "All", "Rust", "Python") keeping the existing Sort and Filter capabilities.
   - Add the `projects-grid-bento` container.
   - Translate the existing table rows (`puppet-master-rs`, `api-backend`, `docs-site`, `legacy-app`) into new bento cards, ensuring ALL data (Health, Name, Path, Languages, Last opened, Status, Open/Settings/Remove/Archive actions) is present on each card.
3. **Inject Settings Modal:**
   - Add the `<div id="projectSettingsModal" class="project-settings-modal hidden">` at the end of `.page-projects`.
   - Include dummy tabs (General, Environment, Danger Zone) inside the modal.
   - Wire the settings buttons on the cards with inline JS to trigger the CSS entry animations: `onclick="document.getElementById('projectSettingsModal').classList.remove('hidden'); requestAnimationFrame(() => document.getElementById('projectSettingsModal').classList.add('visible'))"` and close buttons with animation handling.

## 4. Verification
- Open `Concepts/PuppetMasterDashComp.html` in a browser.
- Verify the Projects page visually matches the "vibecoder" aesthetic.
- Verify all previous data points (Status, Path, Languages, Last opened, Health) and actions (Open, Settings, Remove, Archive) exist for each project in the new layout.
- Click the Settings icon on a project card and ensure the Settings modal opens with a smooth, polished animation.
- Click the Close/Cancel button on the modal to ensure it dismisses gracefully.
- Ensure no emojis are used anywhere in the updated HTML/CSS.