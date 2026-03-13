# Plan: PuppetMaster Dashboard Fixes - Part 2

## Objective
Fix the remaining layout issues with the Orchestrator Progress tab (which is currently rendering blank) and apply the new polished bento-box styling to the remaining left side panels (Files, Run & Debug, Unraid Templates, Runtime Artifacts).

## Scope of Changes

### 1. Orchestrator Progress Tab Fixes
- **Issue:** The `.orch-tab-content.active` container is setting `display: flex; flex-direction: column;` but `.dashboard-grid` inside it still collapses because its flex properties aren't expanding properly against the parent's boundaries, or the parent `.orch-content` isn't properly propagating `flex: 1` down to the `.orch-tab-content`.
- **Fix:** Update the CSS for `.orch-tab-content` to ensure it works correctly with flexbox. Specifically, modify `.orch-tab-content` to include `flex-direction: column;` and modify `.orch-tab-content.active` to simply be `display: flex;`. Ensure `.orch-content` is correctly allowing its flex children to fill the space.

### 2. Left Panel Styling Upgrades
- **Issue:** The user likes the new styling for Docker, GitHub, and Source Control, but the older panels (Files, Run, Unraid, Artifacts) still look like the old UI and don't match the new design language.
- **Fix:** 
  - Rewrite the HTML structure for `panel-files`, `panel-run`, `panel-unraid`, and `panel-artifacts`.
  - Use the new `<div class="files-panel-header">` structure with the matching SVG icons.
  - Wrap their internal contents in `<details open class="bento-widget">` blocks with the new `<summary>` header styling, matching the aesthetic of the Docker/GitHub panels.

## Execution
Once approved, I will apply these changes by editing the HTML and CSS inside `@Concepts/PuppetMasterDashComp.html`.