# Plan: PuppetMaster Dashboard Revamp - Attempt 3

## Objective
Correctly apply the bento-box styling to the entire dashboard without breaking the HTML structure. Fix the floating terminal issue, the blank Progress tab, and the "start run" empty state on the Node Graph tab.

## Scope of Changes

### 1. Revert Broken HTML
- Run `git restore Concepts/PuppetMasterDashComp.html` to restore the pristine original HTML structure, eliminating any floating panels or duplicated elements.

### 2. Fix CSS and Tab Behavior
- Add `document.querySelectorAll('.orch-tab').forEach` JS logic to make Orchestrator tabs clickable.
- Update `.orch-tab-content.active` in the CSS to use `display: flex !important; flex-direction: column;` so that the bento-grid correctly expands.

### 3. Apply Left Panel Styling (Safe Replacement)
- Replace each left panel (`panel-files`, `panel-run`, `panel-source`, `panel-git`, `panel-docker`, `panel-unraid`, `panel-artifacts`) individually using exact string replacement.
- This ensures we do not accidentally delete crucial structural tags like `</aside>` or `</div>`.

### 4. Revamp Progress Tab
- Inject the new `.dashboard-grid` layout containing `bento-card` components for Orchestrator Status, Current Task, Progress, Calls to Action, and Agent Terminal.
- We will strictly target the content inside `<div class="orch-tab-content active" data-tab="progress">`.

### 5. Fix Node Graph Display Tab
- **Hide the empty state:** Add `style="display: none;"` to `<div class="orch-rungraph-empty" id="orchGraphPlaceholder">`.
- **Show the graph:** Add `style="display: flex;"` to `<div class="orch-rungraph-full" id="orchDagPreview">`.
- Replace the right-side detail panel (`<div class="orch-rungraph-detail">`) with the new bento-styled C1-C8 sections, using strict replacement to ensure the `orch-rungraph-topbar-footer` and other sibling elements are preserved perfectly.

## Execution
Once approved, I will exit Plan Mode and execute a carefully constructed Python script that performs these string replacements against the freshly restored `PuppetMasterDashComp.html` file.