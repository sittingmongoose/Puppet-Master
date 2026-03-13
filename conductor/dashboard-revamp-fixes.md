# Plan: PuppetMaster Dashboard Revamp Fixes

## Objective
Fix the two major layout bugs introduced during the dashboard revamp regarding the Activity Bar side panels and the Orchestrator Progress tab.

## Scope of Changes

### 1. Left Panel / Activity Bar Fixes
- **Issue:** The left side panels (Source Control, GitHub Actions, Docker Manager) are currently stacked and visible all at once ("all just in one panel"). The Source Control panel content is completely missing. This was caused by inserting inline `display: flex;` styles onto the `.side-panel-view` containers (which overrode the `.side-panel-view { display: none; }` hiding mechanism), and failing to inject `panel-source` due to the lack of an existing anchor.
- **Fix:**
  - Remove the inline `style="display:flex; flex-direction:column; height:100%;"` from `<div class="side-panel-view" id="panel-git">` and `<div class="side-panel-view" id="panel-docker">`.
  - Insert the missing `<div class="side-panel-view" id="panel-source">` HTML structure (with the Changes, Worktrees, and History subviews) directly before `id="panel-git"`.

### 2. Orchestrator Progress Tab Fix
- **Issue:** The Progress tab is rendering blank because the CSS class `.orch-tab-content.active` sets `display: block;`. The child element `.dashboard-grid` uses `flex: 1;`, which collapses its height to zero since its parent is a block container, not a flex container.
- **Fix:** Update the `.orch-tab-content.active` CSS rule in `Concepts/PuppetMasterDashComp.html` to use `display: flex; flex-direction: column;` instead of `display: block;`. This allows the `dashboard-grid` to expand properly and fill the available height.

## Execution
Once approved, I will apply these fixes directly to `@Concepts/PuppetMasterDashComp.html` using a Python script to perform precise string replacements.